import { wrapInList, liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list'
import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { BasePlugin } from './BasePlugin'

/**
 * Plugin for ordered list formatting
 */
export default class OrderedListPlugin extends BasePlugin {
  /**
   * The name of the plugin
   */
  public readonly name = 'orderedList'

  /**
   * Create a new OrderedListPlugin instance
   */
  constructor() {
    super({
      toolbarButton: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>',
        tooltip: 'Ordered List (Ctrl+Shift+7)',
        action: (view: EditorView) => this.toggleOrderedList(view),
        isActive: (state: EditorState) => this.isActive(state, 'ordered_list')
      },
      keymap: {
        'Mod-Shift-7': (state, dispatch) => this.toggleOrderedList({ state, dispatch }),
        'Enter': (state, dispatch) => this.handleEnter(state, dispatch)
        // Tab and Shift+Tab are handled by BulletListPlugin
      }
    })
  }

  /**
   * Toggle ordered list formatting
   * @param view The editor view or an object with state and dispatch
   * @returns Whether the action was successful
   */
  private toggleOrderedList(view: EditorView | { state: EditorState, dispatch?: (tr: Transaction) => void }): boolean {
    const { state, dispatch } = view
    const { schema } = state

    // Check if the selection is inside an ordered list
    const isInOrderedList = this.isActive(state, 'ordered_list')

    if (isInOrderedList) {
      // If already in an ordered list, lift the list items out
      return liftListItem(schema.nodes.list_item)(state, dispatch)
    } else {
      // Wrap the selection in an ordered list
      return wrapInList(schema.nodes.ordered_list)(state, dispatch)
    }
  }

  /**
   * Handle Enter key in lists to create a new list item
   * @param state The editor state
   * @param dispatch The dispatch function
   * @returns Whether the action was successful
   */
  private handleEnter(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
    const { schema } = state

    // Only handle Enter if we're in a list
    if (this.isActive(state, 'ordered_list') || this.isActive(state, 'bullet_list')) {
      return splitListItem(schema.nodes.list_item)(state, dispatch)
    }

    return false
  }
}
