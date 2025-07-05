/**
 * Bold formatting plugin for the editor
 */

import { EditorView } from 'prosemirror-view';
import { toggleMark } from 'prosemirror-commands';
import { ToolbarBase } from './toolbar';
import type { ToolbarButtonDefinition } from './toolbar';
import { createIconSync } from '../utils/icons';

/**
 * Plugin that adds a bold formatting button to the toolbar
 */
export class Bold extends ToolbarBase {
  /**
   * The name of the plugin
   */
  name = 'bold';


  /**
   * Keymap for bold formatting
   */
  get keymap() {
    return {
      'Mod-b': toggleMark(this.editor.schema.marks.strong)
    };
  }

  /**
   * The toolbar button definition
   */
  get buttonDefinition(): ToolbarButtonDefinition {
    return {
      name: 'bold',
      title: 'Bold',
      icon: createIconSync('bold'),
      isActive: (view: EditorView) => {
        const { state } = view;
        const { selection } = state;
        if (selection.empty) {
          // When cursor is just positioned without selection, check marks at cursor position
          return selection.$from.marks().some(m => m.type === this.editor.schema.marks.strong);
        } else {
          // When there's a selection, check if the range has the mark
          return state.doc.rangeHasMark(selection.from, selection.to, this.editor.schema.marks.strong);
        }
      },
      action: (view: EditorView) => {
        toggleMark(this.editor.schema.marks.strong)(view.state, view.dispatch);
        view.focus();
      }
    };
  }
}
