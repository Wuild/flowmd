import { toggleMark } from 'prosemirror-commands'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { BasePlugin } from './BasePlugin'

/**
 * Plugin for italic text formatting
 */
export default class ItalicPlugin extends BasePlugin {
  /**
   * The name of the plugin
   */
  public readonly name = 'italic'

  /**
   * Create a new ItalicPlugin instance
   */
  constructor() {
    super({
      toolbarButton: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>',
        tooltip: 'Italic (Ctrl+I)',
        action: (view: EditorView) => this.toggleItalic(view),
        isActive: (state: EditorState) => this.isActive(state, 'em')
      },
      keymap: {
        'Mod-i': (state, dispatch) => toggleMark(state.schema.marks.em)(state, dispatch)
      }
    })
  }

  /**
   * Toggle italic formatting
   * @param view The editor view
   * @returns Whether the action was successful
   */
  private toggleItalic(view: EditorView): boolean {
    const { state, dispatch } = view
    return toggleMark(state.schema.marks.em)(state, dispatch)
  }
}
