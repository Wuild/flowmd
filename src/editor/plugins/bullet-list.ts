/**
 * Bullet list plugin for the editor
 */

import {EditorView} from 'prosemirror-view';
import {EditorState, Transaction} from 'prosemirror-state';
import {wrapInList, splitListItem, liftListItem, sinkListItem} from 'prosemirror-schema-list';
import {ToolbarBase} from './toolbar';
import type {ToolbarButtonDefinition} from './toolbar';
import {createIconSync} from '../utils/icons';

/**
 * Plugin that adds a bullet list button to the toolbar
 */
export class BulletList extends ToolbarBase {
    /**
     * The name of the plugin
     */
    name = 'bullet_list';

    /**
     * Keymap for bullet list
     */
    get keymap() {
        return {
            'Shift-Ctrl-8': wrapInList(this.editor.schema.nodes.bullet_list),
            'Enter': (state: EditorState, dispatch: (tr: Transaction) => void, view: EditorView) => {
                const { selection } = state;
                const { $from } = selection;

                // Check if we're in a list item
                let inListItem = false;
                let listItemPos = -1;

                for (let i = $from.depth; i > 0; i--) {
                    if ($from.node(i).type === this.editor.schema.nodes.list_item) {
                        inListItem = true;
                        listItemPos = i;
                        break;
                    }
                }

                if (!inListItem) {
                    return false;
                }

                // Check if the list item is empty
                const listItemNode = $from.node(listItemPos);
                const isEmpty = listItemNode.content.size === 2; // Empty paragraph in a list item has size 2

                if (isEmpty) {
                    // If the list item is empty, lift it out of the list
                    return liftListItem(this.editor.schema.nodes.list_item)(state, dispatch, view);
                } else {
                    // Otherwise, split the list item as usual
                    return splitListItem(this.editor.schema.nodes.list_item)(state, dispatch, view);
                }
            },
            'Mod-[': liftListItem(this.editor.schema.nodes.list_item),
            'Mod-]': sinkListItem(this.editor.schema.nodes.list_item)
        };
    }

    /**
     * The toolbar button definition
     */
    get buttonDefinition(): ToolbarButtonDefinition {
        return {
            name: 'bullet_list',
            title: 'Bullet List',
            icon: createIconSync('bullet_list'),
            isActive: (view: EditorView) => {
                const {state} = view;
                const {selection} = state;
                const {$from} = selection;

                // Check if we're in a bullet list
                for (let i = $from.depth; i >= 0; i--) {
                    if ($from.node(i).type === this.editor.schema.nodes.bullet_list) {
                        return true;
                    }
                }
                return false;
            },
            action: (view: EditorView) => {
                wrapInList(this.editor.schema.nodes.bullet_list)(view.state, view.dispatch);
                view.focus();
            }
        };
    }
}
