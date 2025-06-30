import { toggleMark } from 'prosemirror-commands'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { BasePlugin } from './BasePlugin'

/**
 * Plugin for inline code formatting
 */
export default class InlineCodePlugin extends BasePlugin {
  /**
   * The name of the plugin
   */
  public readonly name = 'inlineCode'

  /**
   * Create a new InlineCodePlugin instance
   */
  constructor() {
    super({
      toolbarButton: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 18l6-6-6-6"></path><path d="M8 6l-6 6 6 6"></path></svg>',
        tooltip: 'Inline Code (Ctrl+`)',
        action: (view: EditorView) => this.toggleInlineCode(view),
        isActive: (state: EditorState) => this.isActive(state, 'code')
      },
      keymap: {
        'Mod-`': (state, dispatch) => toggleMark(state.schema.marks.code)(state, dispatch)
      }
    })
  }

  /**
   * Toggle inline code formatting
   * @param view The editor view
   * @returns Whether the action was successful
   */
  private toggleInlineCode(view: EditorView): boolean {
    const { state, dispatch } = view
    return toggleMark(state.schema.marks.code)(state, dispatch)
  }
}
