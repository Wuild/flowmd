/**
 * View switcher plugin for toggling between WYSIWYG and textarea modes
 */

import { ToolbarBase } from './toolbar';
import type { ToolbarButtonDefinition } from './toolbar';
import type { Editor, EditorOptions } from '../types';

/**
 * Plugin that adds view switching functionality between ProseMirror and textarea
 */
export class ViewSwitcher extends ToolbarBase {
  /**
   * The name of the plugin
   */
  name = 'view-switcher';

  /**
   * Current view mode ('wysiwyg' or 'textarea')
   */
  private currentMode: 'wysiwyg' | 'textarea' = 'wysiwyg';

  /**
   * Private storage for keymap
   */
  private _keymap: Record<string, any> = {};

  /**
   * Keymap for view switching
   */
  get keymap(): Record<string, any> {
    return this._keymap;
  }

  /**
   * Textarea element for raw markdown editing
   */
  private textareaElement?: HTMLTextAreaElement;

  /**
   * Original editor container
   */
  private editorContainer?: HTMLElement;

  /**
   * Original ProseMirror DOM element
   */
  private prosemirrorDOM?: HTMLElement;

  /**
   * Toolbar element
   */
  private toolbarElement?: HTMLElement;

  /**
   * Toolbar buttons
   */
  private toolbarButtons: HTMLButtonElement[] = [];

  /**
   * Initialize the plugin
   * @param editor The editor instance
   * @param options Editor options
   */
  init(editor: Editor, options: EditorOptions): void {
    super.init(editor, options);
    this.editorContainer = options.element;

    // Find the toolbar element
    const toolbarEl = this.editorContainer.querySelector('.editor-toolbar');
    this.toolbarElement = toolbarEl ? (toolbarEl as HTMLElement) : undefined;

    // Store all toolbar buttons for later use
    if (this.toolbarElement) {
      this.toolbarButtons = Array.from(this.toolbarElement.querySelectorAll('.toolbar-button'));
    }

    // Store the ProseMirror DOM element
    const prosemirrorEl = this.editorContainer.querySelector('.ProseMirror');
    this.prosemirrorDOM = prosemirrorEl ? (prosemirrorEl as HTMLElement) : undefined;

    // Create textarea element for raw markdown editing
    this.createTextareaElement();

    // Add keymap for quick switching
    this._keymap = {
      'Mod-Shift-m': () => {
        this.toggleView();
        return true;
      }
    };
  }

  /**
   * Set up the textarea element for raw markdown editing
   */
  private createTextareaElement(): void {
    // Use the existing textarea from editorContainer
    this.textareaElement = this.editorContainer as HTMLTextAreaElement;

    // Add additional class for styling
    this.textareaElement.classList.add('flowmd-editor__textarea');

    // Add event listener to sync content back to editor
    this.textareaElement.addEventListener('input', () => {
      if (this.currentMode === 'textarea' && this.editor) {
        // Sync textarea content to editor without switching view
        const markdown = this.textareaElement!.value;
        this.syncToEditor(markdown);
      }
    });
  }

  /**
   * Toggle between WYSIWYG and textarea view
   */
  private toggleView(): void {
    if (this.currentMode === 'wysiwyg') {
      this.switchToTextarea();
    } else {
      this.switchToWysiwyg();
    }
  }

  /**
   * Switch to textarea view
   */
  private switchToTextarea(): void {
    if (!this.textareaElement || !this.editorContainer || !this.editor || !this.prosemirrorDOM) return;

    // Get current markdown content and update textarea
    this.textareaElement.value = this.editor.getMarkdown();

    // Hide ProseMirror editor and show textarea
    this.prosemirrorDOM.style.display = 'none';
    this.textareaElement.style.display = 'block';

    // Disable other toolbar buttons
    this.disableToolbarButtons(true);

    // Focus textarea
    this.textareaElement.focus();

    this.currentMode = 'textarea';
  }

  /**
   * Switch to WYSIWYG view
   */
  private switchToWysiwyg(): void {
    if (!this.textareaElement || !this.editorContainer || !this.editor || !this.prosemirrorDOM) return;

    // Get textarea content and update editor
    const markdown = this.textareaElement.value;
    this.syncToEditor(markdown);

    // Hide textarea and show ProseMirror editor
    this.textareaElement.style.display = 'none';
    this.prosemirrorDOM.style.display = 'block';

    // Enable toolbar buttons
    this.disableToolbarButtons(false);

    // Focus editor
    this.editor.view.focus();

    this.currentMode = 'wysiwyg';
  }

  /**
   * Disable or enable toolbar buttons except the view-switcher button
   * @param disable Whether to disable the buttons
   */
  private disableToolbarButtons(disable: boolean): void {
    if (!this.toolbarButtons.length) return;

    this.toolbarButtons.forEach(button => {
      // Skip the view-switcher button
      if (button.title.includes('Switch to')) {
        return;
      }

      if (disable) {
        button.disabled = true;
        button.classList.add('disabled');
      } else {
        button.disabled = false;
        button.classList.remove('disabled');
      }
    });
  }

  /**
   * Sync markdown content to editor
   */
  private syncToEditor(markdown: string): void {
    if (!this.editor) return;

    try {
      this.editor.setContent(markdown);
    } catch (error) {
      console.warn('Failed to sync textarea content to editor:', error);
    }
  }

  /**
   * The toolbar button definition
   */
  get buttonDefinition(): ToolbarButtonDefinition {
    return {
      name: 'view-switcher',
      title: this.currentMode === 'wysiwyg' ? 'Switch to Markdown' : 'Switch to WYSIWYG',
      icon: this.currentMode === 'wysiwyg' ? '<>' : '👁',
      isActive: function(this: ViewSwitcher) {
        return this.currentMode === 'textarea';
      },
      action: function(this: ViewSwitcher) {
        this.toggleView();
      }
    };
  }

  /**
   * Clean up resources when the plugin is destroyed
   */
  destroy(): void {
    // Don't remove the textarea as it's part of the DOM structure
    // Just hide it if it's visible
    if (this.textareaElement && this.currentMode === 'textarea') {
      this.textareaElement.style.display = 'none';

      // Show the ProseMirror editor
      if (this.prosemirrorDOM) {
        this.prosemirrorDOM.style.display = 'block';
      }
    }

    // Re-enable all toolbar buttons
    this.disableToolbarButtons(false);
  }
}
