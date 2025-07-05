/**
 * Link plugin for the editor
 */

import { EditorView } from 'prosemirror-view';
import { Plugin } from 'prosemirror-state';
import { toggleMark } from 'prosemirror-commands';
import { ToolbarBase } from './toolbar';
import type { ToolbarButtonDefinition } from './toolbar';
import { createIconSync } from '../utils/icons';
import { Toolbox } from '../components/toolbox';
import type { ToolboxButtonDefinition } from '../components/toolbox';
import { Modal, type ModalField } from '../components/modal';

/**
 * Plugin that adds a link button to the toolbar
 */
export class Link extends ToolbarBase {
  /**
   * The name of the plugin
   */
  name = 'link';

  /**
   * Modal instance
   */
  private modal: Modal | null = null;

  /**
   * Toolbox instance
   */
  private toolbox: Toolbox | null = null;

  /**
   * Keymap for link formatting
   */
  get keymap() {
    return {
      'Mod-k': (_state: any, _dispatch: any, view: EditorView) => {
        if (view) {
          this.showLinkModal(view);
          return true;
        }
        return false;
      }
    };
  }

  /**
   * The toolbar button definition
   */
  get buttonDefinition(): ToolbarButtonDefinition {
    return {
      name: 'link',
      title: 'Insert Link',
      icon: createIconSync('link'),
      isActive: (view: EditorView) => {
        const { state } = view;
        const { selection } = state;
        if (selection.empty) {
          // When cursor is just positioned without selection, check marks at cursor position
          return selection.$from.marks().some(m => m.type === this.editor.schema.marks.link);
        } else {
          // When there's a selection, check if the range has the mark
          return state.doc.rangeHasMark(selection.from, selection.to, this.editor.schema.marks.link);
        }
      },
      action: (view: EditorView) => {
        this.showLinkModal(view);
      }
    };
  }

  /**
   * Show the link modal
   */
  private showLinkModal(view: EditorView): void {
    const { state } = view;
    const { selection } = state;
    const hasSelection = !selection.empty;

    // Define fields based on whether text is selected
    const fields: ModalField[] = [];

    // Only add text field if no text is selected
    if (!hasSelection) {
      fields.push({
        type: 'text',
        name: 'text',
        label: 'Link Text',
        placeholder: 'Text to display',
        required: true
      });
    }

    // Add URL field
    fields.push({
      type: 'url',
      name: 'url',
      label: 'Link URL',
      placeholder: 'https://example.com',
      required: true
    });

    // Destroy old modal if it exists
    if (this.modal) {
      this.modal.destroy();
    }

    // Create a new modal with the fields and onConfirm callback
    this.modal = new Modal({
      title: 'Insert Link',
      className: 'flowmd-link-modal',
      confirmText: 'Insert',
      cancelText: 'Cancel',
      fields: fields,
      onConfirm: (formData) => {
        if (!formData) return;

        const href = formData.url.trim();
        if (href) {
          // Basic URL validation
          try {
            new URL(href);
            const { dispatch } = view;

            if (hasSelection) {
              // If text is selected, just add the link mark
              toggleMark(this.editor.schema.marks.link, { href })(state, dispatch);
            } else {
              // If no text is selected, create a new text node with the link mark
              const text = formData.text.trim();
              if (text) {
                const mark = this.editor.schema.marks.link.create({ href });
                const node = this.editor.schema.text(text, [mark]);
                const tr = state.tr.replaceSelectionWith(node, false);
                dispatch(tr);
              } else {
                return;
              }
            }
            view.focus();
          } catch (e) {
            // Invalid URL
            alert('Please enter a valid URL');
            return;
          }
        }
      }
    });

    // Show the modal
    this.modal.show();
  }

  /**
   * Get the ProseMirror plugin
   */
  getPlugin() {
    return new Plugin({
      view: (view) => {
        // Initialize the toolbox
        this.toolbox = new Toolbox({
          editorView: view,
          className: 'flowmd-link-toolbox',
          placement: 'top'
        });

        return {
          update: () => {
            // Nothing to do on update
          },
          destroy: () => {
            // Clean up the toolbox when the plugin is destroyed
            if (this.toolbox) {
              this.toolbox.destroy();
              this.toolbox = null;
            }
          }
        };
      },
      props: {
        handleClickOn: (view, _pos, _node, _nodePos, event, _direct) => {
          // Check if we clicked on a link mark
          const { state } = view;
          const linkMark = this.editor.schema.marks.link;

          // Get the position of the click
          const clickPos = view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (!clickPos) return false;

          // Check if there's a link mark at the click position
          const $pos = state.doc.resolve(clickPos.pos);
          const marks = $pos.marks();
          const linkMarkInstance = marks.find(mark => mark.type === linkMark);

          if (linkMarkInstance) {
            // Get the DOM node that was clicked
            const domNode = event.target as HTMLElement;

            // Find the start and end of the link
            let startPos = clickPos.pos;
            let endPos = clickPos.pos;

            // Find the start of the link
            while (startPos > 0) {
              const prevPos = startPos - 1;
              const prevMarks = state.doc.rangeHasMark(prevPos, startPos, linkMark);
              if (!prevMarks) break;
              startPos = prevPos;
            }

            // Find the end of the link
            while (endPos < state.doc.content.size) {
              const nextPos = endPos + 1;
              const nextMarks = state.doc.rangeHasMark(endPos, nextPos, linkMark);
              if (!nextMarks) break;
              endPos = nextPos;
            }

            // Show the toolbox with edit and remove buttons only if toolbar is enabled
            if (this.toolbox && this.state.editorOptions?.toolbar !== false) {
              const buttons: ToolboxButtonDefinition[] = [
                {
                  name: 'edit',
                  title: 'Edit Link',
                  icon: createIconSync('edit'),
                  action: (view, _pos) => {
                    this.editLink(view, startPos, endPos, linkMarkInstance.attrs.href);
                  }
                },
                {
                  name: 'open',
                  title: 'Open Link',
                  icon: createIconSync('external-link'),
                  action: (_view, _pos) => {
                    window.open(linkMarkInstance.attrs.href, '_blank');
                  }
                },
                {
                  name: 'remove',
                  title: 'Remove Link',
                  icon: createIconSync('delete'),
                  action: (view, _pos) => {
                    this.removeLink(view, startPos, endPos);
                  }
                }
              ];

              this.toolbox.show(startPos, domNode, buttons);

              // Return true to indicate we've handled the click
              return true;
            }
          }

          // Return false to let other handlers process the click
          return false;
        }
      }
    });
  }

  /**
   * Edit a link
   * @param view The editor view
   * @param from Start position of the link
   * @param to End position of the link
   * @param href Current URL of the link
   */
  private editLink(view: EditorView, from: number, to: number, href: string): void {
    const { state } = view;
    const linkText = state.doc.textBetween(from, to);

    // Define fields for the modal
    const fields: ModalField[] = [
      {
        type: 'display',
        name: 'text',
        label: 'Link Text',
        value: linkText
      },
      {
        type: 'url',
        name: 'url',
        label: 'Link URL',
        placeholder: 'https://example.com',
        value: href,
        required: true
      }
    ];

    // Destroy old modal if it exists
    if (this.modal) {
      this.modal.destroy();
    }

    // Create a new modal with the fields and onConfirm callback
    this.modal = new Modal({
      title: 'Edit Link',
      className: 'flowmd-link-modal',
      confirmText: 'Update',
      cancelText: 'Cancel',
      fields: fields,
      onConfirm: (formData) => {
        if (!formData) return;

        const newHref = formData.url.trim();
        if (newHref) {
          // Basic URL validation
          try {
            new URL(newHref);
            const { dispatch } = view;

            // Remove the old link mark
            let tr = state.tr.removeMark(from, to, this.editor.schema.marks.link);

            // Add the new link mark
            tr = tr.addMark(from, to, this.editor.schema.marks.link.create({ href: newHref }));

            dispatch(tr);
            view.focus();
          } catch (e) {
            // Invalid URL
            alert('Please enter a valid URL');
            return;
          }
        }
      }
    });

    // Show the modal
    this.modal.show();
  }

  /**
   * Remove a link
   * @param view The editor view
   * @param from Start position of the link
   * @param to End position of the link
   */
  private removeLink(view: EditorView, from: number, to: number): void {
    const { state, dispatch } = view;

    // Remove the link mark
    const tr = state.tr.removeMark(from, to, this.editor.schema.marks.link);
    dispatch(tr);
    view.focus();
  }

  /**
   * Clean up when plugin is destroyed
   */
  destroy(): void {
    if (this.modal) {
      this.modal.destroy();
      this.modal = null;
    }

    if (this.toolbox) {
      this.toolbox.destroy();
      this.toolbox = null;
    }
  }
}
