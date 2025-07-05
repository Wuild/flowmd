/**
 * Strikethrough formatting plugin for the editor
 */

import { EditorView } from 'prosemirror-view';
import { toggleMark } from 'prosemirror-commands';
import { ToolbarBase } from './toolbar';
import type { ToolbarButtonDefinition } from './toolbar';
import { createIconSync } from '../utils/icons';

/**
 * Plugin that adds a strikethrough formatting button to the toolbar
 */
export class Strikethrough extends ToolbarBase {
  /**
   * The name of the plugin
   */
  name = 'strikethrough';


  /**
   * Keymap for strikethrough formatting
   */
  get keymap() {
    return {
      'Mod-Shift-x': toggleMark(this.editor.schema.marks.strike)
    };
  }

  /**
   * The toolbar button definition
   */
  get buttonDefinition(): ToolbarButtonDefinition {
    return {
      name: 'strikethrough',
      title: 'Strikethrough',
      icon: createIconSync('strikethrough'),
      isActive: (view: EditorView) => {
        const { state } = view;
        const { selection } = state;
        if (selection.empty) {
          // When cursor is just positioned without selection, check marks at cursor position
          return selection.$from.marks().some(m => m.type === this.editor.schema.marks.strike);
        } else {
          // When there's a selection, check if the range has the mark
          return state.doc.rangeHasMark(selection.from, selection.to, this.editor.schema.marks.strike);
        }
      },
      action: (view: EditorView) => {
        toggleMark(this.editor.schema.marks.strike)(view.state, view.dispatch);
        view.focus();
      }
    };
  }
}
