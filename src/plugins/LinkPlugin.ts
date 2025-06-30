import { toggleMark } from 'prosemirror-commands'
import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Mark } from 'prosemirror-model'
import { BasePlugin } from './BasePlugin'

/**
 * Plugin for link formatting
 */
export default class LinkPlugin extends BasePlugin {
  /**
   * The name of the plugin
   */
  public readonly name = 'link'

  /**
   * Create a new LinkPlugin instance
   */
  constructor() {
    super({
      toolbarButton: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>',
        tooltip: 'Link (Ctrl+K)',
        action: (view: EditorView) => this.showLinkDialog(view),
        isActive: (state: EditorState) => this.isActive(state, 'link')
      },
      keymap: {
        'Mod-k': (state, dispatch) => this.showLinkDialog({ state, dispatch })
      }
    })
  }

  /**
   * Show the link dialog
   * @param view The editor view or an object with state and dispatch
   * @returns Whether the action was successful
   */
  private showLinkDialog(view: EditorView | { state: EditorState, dispatch?: (tr: Transaction) => void }): boolean {
    const { state, dispatch } = view
    const { schema, selection, doc } = state

    // Get the current link mark if it exists
    let linkMark: Mark | undefined
    let href = ''
    let title = ''

    if (selection.empty) {
      // If the selection is empty, check if the cursor is on a link
      const marks = selection.$from.marks()
      linkMark = marks.find(mark => mark.type === schema.marks.link)
    } else {
      // If there's a selection, check if the entire selection has a link mark
      const from = selection.from
      const to = selection.to

      doc.nodesBetween(from, to, (node) => {
        if (node.isText) {
          const mark = node.marks.find(mark => mark.type === schema.marks.link)
          if (mark) {
            linkMark = mark
            return false // Stop traversal
          }
        }
        return true
      })
    }

    if (linkMark) {
      href = linkMark.attrs.href || ''
      title = linkMark.attrs.title || ''
    }

    // Create a simple dialog for entering the link URL
    const url = window.prompt('Enter link URL:', href)

    if (url === null) {
      // User cancelled
      return false
    }

    if (url === '' && linkMark) {
      // Remove the link if URL is empty
      if (dispatch) {
        const tr = state.tr

        if (selection.empty) {
          // If the selection is empty, find the link node and select it
          const from = selection.from
          let linkStart = from
          let linkEnd = from

          doc.nodesBetween(0, doc.content.size, (node, pos) => {
            if (node.isText && node.marks.some(mark => mark.type === schema.marks.link && mark === linkMark)) {
              const start = Math.max(pos, from - 100)
              const end = Math.min(pos + node.nodeSize, from + 100)

              doc.nodesBetween(start, end, (textNode, textPos) => {
                if (textNode.isText && textNode.marks.some(mark => mark.type === schema.marks.link && mark === linkMark)) {
                  if (textPos <= from && textPos + textNode.nodeSize >= from) {
                    linkStart = textPos
                    linkEnd = textPos + textNode.nodeSize
                    return false
                  }
                }
                return true
              })

              return false
            }
            return true
          })

          tr.removeMark(linkStart, linkEnd, schema.marks.link)
        } else {
          // If there's a selection, remove the link mark from the selection
          tr.removeMark(selection.from, selection.to, schema.marks.link)
        }

        dispatch(tr)
      }
      return true
    }

    // Add or update the link
    if (dispatch) {
      const tr = state.tr

      if (selection.empty) {
        // If the selection is empty, prompt for link text
        const text = window.prompt('Enter link text:', '')

        if (text === null) {
          // User cancelled
          return false
        }

        if (text) {
          // Insert the text with a link mark
          const linkMark = schema.marks.link.create({ href: url, title })
          tr.replaceSelectionWith(schema.text(text, [linkMark]), false)
        }
      } else {
        // If there's a selection, add the link mark to the selection
        tr.addMark(selection.from, selection.to, schema.marks.link.create({ href: url, title }))
      }

      dispatch(tr)
    }

    return true
  }
}
