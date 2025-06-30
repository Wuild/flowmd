import { setBlockType } from 'prosemirror-commands'
import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { BasePlugin } from './BasePlugin'

/**
 * Plugin for code block formatting
 */
export default class CodeBlockPlugin extends BasePlugin {
  /**
   * The name of the plugin
   */
  public readonly name = 'codeBlock'

  /**
   * Create a new CodeBlockPlugin instance
   */
  constructor() {
    super({
      toolbarButton: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>',
        tooltip: 'Code Block (Ctrl+Shift+\\)',
        action: (view: EditorView) => this.showCodeBlockDialog(view),
        isActive: (state: EditorState) => this.isActive(state, 'code_block')
      },
      keymap: {
        'Mod-Shift-\\': (state, dispatch) => this.toggleCodeBlock(state, dispatch)
      }
    })
  }

  /**
   * Show the code block dialog
   * @param view The editor view
   * @returns Whether the action was successful
   */
  private showCodeBlockDialog(view: EditorView): boolean {
    const { state, dispatch } = view
    const { schema } = state

    // Check if the selection is already in a code block
    const isInCodeBlock = this.isActive(state, 'code_block')

    if (isInCodeBlock) {
      // If already in a code block, convert to paragraph
      return setBlockType(schema.nodes.paragraph)(state, dispatch)
    }

    // Ask for the language
    const language = window.prompt('Enter code language (optional):', '')

    if (language === null) {
      // User cancelled
      return false
    }

    // Convert to code block
    return this.toggleCodeBlock(state, dispatch, language)
  }

  /**
   * Toggle code block formatting
   * @param state The editor state
   * @param dispatch The dispatch function
   * @param language Optional language for the code block
   * @returns Whether the action was successful
   */
  private toggleCodeBlock(state: EditorState, dispatch?: (tr: Transaction) => void, language?: string): boolean {
    const { schema } = state

    // Check if the selection is already in a code block
    const isInCodeBlock = this.isActive(state, 'code_block')

    if (isInCodeBlock) {
      // If already in a code block, convert to paragraph
      return setBlockType(schema.nodes.paragraph)(state, dispatch)
    } else {
      // Convert to code block with optional language
      const attrs = language ? { params: language } : undefined
      return setBlockType(schema.nodes.code_block, attrs)(state, dispatch)
    }
  }
}
