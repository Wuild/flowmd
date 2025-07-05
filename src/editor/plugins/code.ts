/**
 * Inline code formatting plugin for the editor
 */

import { EditorView } from 'prosemirror-view';
import { toggleMark } from 'prosemirror-commands';
import { ToolbarBase } from './toolbar';
import type { ToolbarButtonDefinition } from './toolbar';
import { createIconSync } from '../utils/icons';

/**
 * Plugin that adds an inline code formatting button to the toolbar
 */
export class Code extends ToolbarBase {
  /**
   * The name of the plugin
   */
  name = 'code';


  /**
   * Keymap for inline code formatting
   */
  get keymap() {
    return {
      'Mod-`': toggleMark(this.editor.schema.marks.code)
    };
  }

  /**
   * The toolbar button definition
   */
  get buttonDefinition(): ToolbarButtonDefinition {
    return {
      name: 'code',
      title: 'Inline Code',
      icon: createIconSync('codeblock'),
      isActive: (view: EditorView) => {
        const { state } = view;
        const { selection } = state;
        if (selection.empty) {
          // When cursor is just positioned without selection, check marks at cursor position
          return selection.$from.marks().some(m => m.type === this.editor.schema.marks.code);
        } else {
          // When there's a selection, check if the range has the mark
          return state.doc.rangeHasMark(selection.from, selection.to, this.editor.schema.marks.code);
        }
      },
      action: (view: EditorView) => {
        // Check if the selection is capable of having an inline code mark
        const { state } = view;
        const { selection } = state;

        // If selection is empty, we can apply the mark at cursor position
        if (selection.empty) {
          toggleMark(this.editor.schema.marks.code)(state, view.dispatch);
          view.focus();
          return;
        }

        // Check if the selection spans multiple blocks
        const $from = selection.$from;
        const $to = selection.$to;
        const sameBlock = $from.sameParent($to) && $from.parent.isTextblock;

        // Only apply inline code if selection is within a single text block
        if (sameBlock) {
          toggleMark(this.editor.schema.marks.code)(state, view.dispatch);
        } else {
          // Optional: Show a message or tooltip indicating why inline code can't be applied
          console.warn('Cannot apply inline code to a selection that spans multiple blocks');
        }

        view.focus();
      }
    };
  }
}
