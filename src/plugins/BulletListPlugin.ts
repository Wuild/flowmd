import { wrapInList, liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list'
import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { BasePlugin } from './BasePlugin'

/**
 * Plugin for bullet list formatting
 */
export default class BulletListPlugin extends BasePlugin {
  /**
   * The name of the plugin
   */
  public readonly name = 'bulletList'

  /**
   * Create a new BulletListPlugin instance
   */
  constructor() {
    super({
      toolbarButton: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><circle cx="3" cy="6" r="1"></circle><circle cx="3" cy="12" r="1"></circle><circle cx="3" cy="18" r="1"></circle></svg>',
        tooltip: 'Bullet List (Ctrl+Shift+8)',
        action: (view: EditorView) => this.toggleBulletList(view),
        isActive: (state: EditorState) => this.isActive(state, 'bullet_list')
      },
      keymap: {
        'Mod-Shift-8': (state, dispatch) => this.toggleBulletList({ state, dispatch }),
        'Tab': (state, dispatch) => this.handleTab(state, dispatch),
        'Shift-Tab': (state, dispatch) => this.handleShiftTab(state, dispatch),
        'Enter': (state, dispatch) => this.handleEnter(state, dispatch)
      }
    })
  }

  /**
   * Toggle bullet list formatting
   * @param view The editor view or an object with state and dispatch
   * @returns Whether the action was successful
   */
  private toggleBulletList(view: EditorView | { state: EditorState, dispatch?: (tr: Transaction) => void }): boolean {
    const { state, dispatch } = view
    const { schema } = state

    // Check if the selection is inside a bullet list
    const isInBulletList = this.isActive(state, 'bullet_list')

    if (isInBulletList) {
      // If already in a bullet list, lift the list items out
      return liftListItem(schema.nodes.list_item)(state, dispatch)
    } else {
      // Wrap the selection in a bullet list
      return wrapInList(schema.nodes.bullet_list)(state, dispatch)
    }
  }

  /**
   * Handle Tab key in lists to indent list items
   * @param state The editor state
   * @param dispatch The dispatch function
   * @returns Whether the action was successful
   */
  private handleTab(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
    const { schema } = state

    // Only handle Tab if we're in a list
    if (this.isActive(state, 'bullet_list') || this.isActive(state, 'ordered_list')) {
      return sinkListItem(schema.nodes.list_item)(state, dispatch)
    }

    return false
  }

  /**
   * Handle Shift+Tab key in lists to outdent list items
   * @param state The editor state
   * @param dispatch The dispatch function
   * @returns Whether the action was successful
   */
  private handleShiftTab(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
    const { schema } = state

    // Only handle Shift+Tab if we're in a list
    if (this.isActive(state, 'bullet_list') || this.isActive(state, 'ordered_list')) {
      return liftListItem(schema.nodes.list_item)(state, dispatch)
    }

    return false
  }

  /**
   * Handle Enter key in lists to create a new list item
   * @param state The editor state
   * @param dispatch The dispatch function
   * @returns Whether the action was successful
   */
  private  handleEnter(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
    const { schema } = state

    // Only handle Enter if we're in a list
    if (this.isActive(state, 'bullet_list') || this.isActive(state, 'ordered_list')) {
      return splitListItem(schema.nodes.list_item)(state, dispatch)
    }

    return false
  }
}
