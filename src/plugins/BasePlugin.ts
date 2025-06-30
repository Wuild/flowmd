import { EditorState, Plugin, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

/**
 * Base class for all editor plugins
 * This provides a common interface and functionality for all plugins
 */
export abstract class BasePlugin {
  /**
   * The name of the plugin, used for identification in the toolbar
   */
  public abstract readonly name: string

  /**
   * The toolbar button configuration
   * If not provided, the plugin won't have a toolbar button
   */
  public readonly toolbarButton?: {
    /**
     * The HTML for the button icon (can be SVG or text)
     */
    icon: string

    /**
     * The tooltip text for the button
     */
    tooltip: string

    /**
     * The action to perform when the button is clicked
     * @param view The editor view
     * @returns Whether the action was successful
     */
    action: (view: EditorView) => boolean

    /**
     * Check if the button should be shown as active
     * @param state The editor state
     * @returns Whether the button should be shown as active
     */
    isActive?: (state: EditorState) => boolean
  }

  /**
   * The ProseMirror plugins to add to the editor
   */
  public readonly plugins?: Plugin[]

  /**
   * The keymap for the plugin
   * Keys are in the format 'Mod-b' for Ctrl/Cmd+B
   * Values are command functions that take state and dispatch
   */
  public readonly keymap?: { [key: string]: (state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView) => boolean }

  /**
   * Create a new plugin instance
   * @param options Options for the plugin
   */
  constructor(options: Partial<BasePlugin> = {}) {
    // Copy options to this instance
    Object.assign(this, options)
  }

  /**
   * Check if a mark or node is active at the current selection
   * @param state The editor state
   * @param type The mark or node type name
   * @param attrs Optional attributes to check
   * @returns Whether the mark or node is active
   */
  protected isActive(state: EditorState, type: string, attrs: Record<string, any> = {}): boolean {
    const { selection } = state

    // Check if it's a mark
    if (state.schema.marks[type]) {
      const mark = state.schema.marks[type]

      // Check if the mark exists in the selection
      if (selection.empty) {
        return !!mark.isInSet(state.storedMarks || selection.$from.marks())
      }

      // Check if the mark exists in the selected range
      let hasMatch = false
      state.doc.nodesBetween(selection.from, selection.to, node => {
        if (node.marks.some(m => m.type === mark && this.matchAttributes(m.attrs, attrs))) {
          hasMatch = true
          return false // Stop traversal
        }
        return true
      })

      return hasMatch
    }

    // Check if it's a node
    if (state.schema.nodes[type]) {
      const node = state.schema.nodes[type]

      // Check if the current node is of this type
      const $from = selection.$from
      const $to = selection.$to
      let hasMatch = false

      state.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
        if (node.type === state.schema.nodes[type] && this.matchAttributes(node.attrs, attrs)) {
          hasMatch = true
          return false // Stop traversal
        }
        return true
      })

      return hasMatch
    }

    return false
  }

  /**
   * Check if attributes match
   * @param nodeAttrs The node attributes
   * @param attrs The attributes to match
   * @returns Whether the attributes match
   */
  private matchAttributes(nodeAttrs: Record<string, any>, attrs: Record<string, any>): boolean {
    // If no attributes to match, consider it a match
    if (Object.keys(attrs).length === 0) return true

    // Check if all required attributes match
    return Object.entries(attrs).every(([key, value]) => nodeAttrs[key] === value)
  }
}
