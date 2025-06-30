import { wrapIn, lift } from 'prosemirror-commands'
import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { BasePlugin } from './BasePlugin'

/**
 * Plugin for blockquote formatting
 */
export default class BlockquotePlugin extends BasePlugin {
  /**
   * The name of the plugin
   */
  public readonly name = 'blockquote'

  /**
   * Create a new BlockquotePlugin instance
   */
  constructor() {
    super({
      toolbarButton: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10h2v4h-2z"></path><path d="M10 10h2v4h-2z"></path><path d="M4 6h16"></path><path d="M4 18h16"></path><path d="M4 6v12"></path></svg>',
        tooltip: 'Blockquote (Ctrl+Shift+B)',
        action: (view: EditorView) => this.toggleBlockquote(view),
        isActive: (state: EditorState) => this.isActive(state, 'blockquote')
      },
      keymap: {
        'Mod-Shift-b': (state, dispatch) => this.toggleBlockquote({ state, dispatch })
      }
    })
  }

  /**
   * Toggle blockquote formatting
   * @param view The editor view or an object with state and dispatch
   * @returns Whether the action was successful
   */
  private toggleBlockquote(view: EditorView | { state: EditorState, dispatch?: (tr: Transaction) => void }): boolean {
    const { state, dispatch } = view
    const { schema } = state

    // Check if the selection is inside a blockquote
    const isInBlockquote = this.isActive(state, 'blockquote')

    if (isInBlockquote) {
      // If already in a blockquote, lift it out
      return lift(state, dispatch)
    } else {
      // Wrap the selection in a blockquote
      return wrapIn(schema.nodes.blockquote)(state, dispatch)
    }
  }
}
