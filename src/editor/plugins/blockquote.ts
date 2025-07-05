/**
 * Blockquote plugin for the editor
 */

import { EditorView } from 'prosemirror-view';
import { wrapIn } from 'prosemirror-commands';
import { ToolbarBase } from './toolbar';
import type { ToolbarButtonDefinition } from './toolbar';
import { createIconSync } from '../utils/icons';

/**
 * Plugin that adds a blockquote button to the toolbar
 */
export class Blockquote extends ToolbarBase {
  /**
   * The name of the plugin
   */
  name = 'blockquote';


  /**
   * Keymap for blockquote
   */
  get keymap() {
    return {
      'Ctrl->': wrapIn(this.editor.schema.nodes.blockquote)
    };
  };

  /**
   * The toolbar button definition
   */
  get buttonDefinition(): ToolbarButtonDefinition {
    return {
      name: 'blockquote',
      title: 'Blockquote',
      icon: createIconSync('blockquote'),
      isActive: (view: EditorView) => {
        const { state } = view;
        const { selection } = state;
        const { $from } = selection;

        // Check if we're in a blockquote
        for (let i = $from.depth; i >= 0; i--) {
          if ($from.node(i).type === this.editor.schema.nodes.blockquote) {
            return true;
          }
        }
        return false;
      },
      action: (view: EditorView) => {
        wrapIn(this.editor.schema.nodes.blockquote)(view.state, view.dispatch);
        view.focus();
      }
    };
  }
}
