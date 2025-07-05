/**
 * List plugin for the editor
 */

import { EditorView } from 'prosemirror-view';
import { wrapIn } from 'prosemirror-commands';
import { ToolbarBase } from './toolbar';
import type { ToolbarButtonDefinition } from './toolbar';

/**
 * Plugin that adds list buttons to the toolbar
 */
export class List extends ToolbarBase {
  /**
   * The name of the plugin
   */
  name = 'list';

  /**
   * Keymap for list formatting
   */
  get keymap() {
    return {
      'Mod-Shift-8': wrapIn(this.editor.schema.nodes.bullet_list), // Asterisk key for bullet list
      'Mod-Shift-9': wrapIn(this.editor.schema.nodes.ordered_list) // Number key for ordered list
    };
  }

  /**
   * The toolbar button definition
   */
  get buttonDefinition(): ToolbarButtonDefinition {
    return {
      name: 'list',
      title: 'List',
      icon: '•',
      isActive: (view: EditorView) => {
        const { state } = view;
        const { selection } = state;
        const { $from } = selection;
        const node = $from.node(-1);
        return node && (node.type === this.editor.schema.nodes.bullet_list || node.type === this.editor.schema.nodes.ordered_list);
      },
      action: (_view: EditorView) => {
        // The main button doesn't do anything, it just opens the dropdown
      },
      dropdown: [
        {
          name: 'bullet_list',
          title: 'Bullet List',
          action: (view: EditorView) => {
            wrapIn(this.editor.schema.nodes.bullet_list)(view.state, view.dispatch);
            view.focus();
          }
        },
        {
          name: 'ordered_list',
          title: 'Ordered List',
          action: (view: EditorView) => {
            wrapIn(this.editor.schema.nodes.ordered_list)(view.state, view.dispatch);
            view.focus();
          }
        }
      ]
    };
  }
}
