
import { setBlockType } from 'prosemirror-commands'
import { EditorState, Transaction, Plugin } from 'prosemirror-state'
import { EditorView, NodeView, Decoration } from 'prosemirror-view'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import { BasePlugin } from './BasePlugin'
import hljs from 'highlight.js'

/**
 * A NodeView for code blocks that applies syntax highlighting when a language is specified
 */
class CodeBlockView implements NodeView {
  dom: HTMLElement
  contentDOM: HTMLElement
  node: ProseMirrorNode

  constructor(node: ProseMirrorNode, view: EditorView, getPos: (() => number) | undefined) {
    this.node = node

    // Create the outer DOM node (pre)
    this.dom = document.createElement('pre')

    // Create the content DOM node (code)
    this.contentDOM = document.createElement('code')
    this.dom.appendChild(this.contentDOM)

    // Apply syntax highlighting if a language is specified
    this.applyHighlighting()
  }

  update(node: ProseMirrorNode): boolean {
    if (node.type.name !== 'code_block') return false
    this.node = node
    this.applyHighlighting()
    return true
  }

  /**
   * Apply syntax highlighting to the code block if a language is specified
   */
  private applyHighlighting(): void {
    // Get the language from the node attributes
    const language = this.node.attrs.params || this.node.attrs.language

    console.log('CodeBlock attributes:', this.node.attrs)
    console.log('Language found:', language)

    // Remove any existing classes from previous highlighting
    this.dom.className = ''
    this.contentDOM.className = ''

    // Always add a base class for styling
    this.dom.classList.add('code-block')
    this.contentDOM.classList.add('code-content')

    // Apply syntax highlighting if a language is specified
    if (language && language.trim()) {
      try {
        // Add the language class to both pre and code elements
        const languageClass = `language-${language.trim()}`
        console.log('Adding language class:', languageClass)

        this.dom.classList.add(languageClass)
        this.contentDOM.classList.add(languageClass)

        // Apply highlighting
        hljs.highlightElement(this.contentDOM)
      } catch (error) {
        console.error('Error applying syntax highlighting:', error)
      }
    } else {
      console.log('No language specified for code block')
    }
  }
}

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
      },
      plugins: [
        new Plugin({
          props: {
            nodeViews: {
              code_block: (node, view, getPos) => new CodeBlockView(node, view, getPos as (() => number) | undefined)
            }
          }
        })
      ]
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
      // Try multiple attribute names to ensure compatibility
      let attrs: any = undefined
      if (language && language.trim()) {
        attrs = {
          params: language.trim(),
          language: language.trim()
        }
      }

      console.log('Creating code block with attrs:', attrs)
      return setBlockType(schema.nodes.code_block, attrs)(state, dispatch)
    }
  }
}
