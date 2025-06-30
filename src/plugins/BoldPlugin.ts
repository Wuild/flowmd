import { toggleMark } from 'prosemirror-commands'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { BasePlugin } from './BasePlugin'

/**
 * Plugin for bold text formatting
 */
export default class BoldPlugin extends BasePlugin {
  /**
   * The name of the plugin
   */
  public readonly name = 'bold'

  /**
   * Create a new BoldPlugin instance
   */
  constructor() {
    super({
      toolbarButton: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>',
        tooltip: 'Bold (Ctrl+B)',
        action: (view: EditorView) => this.toggleBold(view),
        isActive: (state: EditorState) => this.isActive(state, 'strong')
      },
      keymap: {
        'Mod-b': (state, dispatch) => toggleMark(state.schema.marks.strong)(state, dispatch)
      }
    })
  }

  /**
   * Toggle bold formatting
   * @param view The editor view
   * @returns Whether the action was successful
   */
  private toggleBold(view: EditorView): boolean {
    const { state, dispatch } = view
    return toggleMark(state.schema.marks.strong)(state, dispatch)
  }
}
