/**
 * Italic formatting plugin for the editor
 */

import { EditorView } from 'prosemirror-view';
import { toggleMark } from 'prosemirror-commands';
import { ToolbarBase } from './toolbar';
import type { ToolbarButtonDefinition } from './toolbar';
import { createIconSync } from '../utils/icons';

/**
 * Plugin that adds an italic formatting button to the toolbar
 */
export class Italic extends ToolbarBase {
  /**
   * The name of the plugin
   */
  name = 'italic';

  /**
   * Keymap for italic formatting
   */
  get keymap() {
    return {
      'Mod-i': toggleMark(this.editor.schema.marks.em)
    };
  }

  /**
   * The toolbar button definition
   */
  get buttonDefinition(): ToolbarButtonDefinition {
    return {
      name: 'italic',
      title: 'Italic',
      icon: createIconSync('italic'),
      isActive: (view: EditorView) => {
        const { state } = view;
        const { selection } = state;
        if (selection.empty) {
          // When cursor is just positioned without selection, check marks at cursor position
          return selection.$from.marks().some(m => m.type === this.editor.schema.marks.em);
        } else {
          // When there's a selection, check if the range has the mark
          return state.doc.rangeHasMark(selection.from, selection.to, this.editor.schema.marks.em);
        }
      },
      action: (view: EditorView) => {
        toggleMark(this.editor.schema.marks.em)(view.state, view.dispatch);
        view.focus();
      }
    };
  }
}
