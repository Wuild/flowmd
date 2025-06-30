import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { BasePlugin } from './BasePlugin'

/**
 * Plugin for inserting horizontal rules
 */
export default class HorizontalRulePlugin extends BasePlugin {
  /**
   * The name of the plugin
   */
  public readonly name = 'horizontalRule'

  /**
   * Create a new HorizontalRulePlugin instance
   */
  constructor() {
    super({
      toolbarButton: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
        tooltip: 'Horizontal Rule',
        action: (view: EditorView) => this.insertHorizontalRule(view),
        isActive: () => false // Horizontal rules don't have an active state
      },
      keymap: {
        'Mod-Shift-_': (state, dispatch) => this.insertHorizontalRule({ state, dispatch })
      }
    })
  }

  /**
   * Insert a horizontal rule
   * @param view The editor view or an object with state and dispatch
   * @returns Whether the action was successful
   */
  private insertHorizontalRule(view: EditorView | { state: EditorState, dispatch?: (tr: Transaction) => void }): boolean {
    const { state, dispatch } = view
    const { schema } = state

    if (dispatch) {
      // Create a horizontal rule node
      const hr = schema.nodes.horizontal_rule.create()

      // Insert the horizontal rule
      const tr = state.tr.replaceSelectionWith(hr)

      // Move the cursor after the horizontal rule
      const pos = tr.selection.from
      // Use TextSelection directly instead of relying on constructor.near
      const { TextSelection } = require('prosemirror-state')
      tr.setSelection(TextSelection.near(tr.doc.resolve(pos)))

      dispatch(tr)
    }

    return true
  }
}
