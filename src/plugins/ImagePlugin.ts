import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { BasePlugin } from './BasePlugin'

/**
 * Plugin for inserting images
 */
export default class ImagePlugin extends BasePlugin {
  /**
   * The name of the plugin
   */
  public readonly name = 'image'

  /**
   * Create a new ImagePlugin instance
   */
  constructor() {
    super({
      toolbarButton: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',
        tooltip: 'Insert Image',
        action: (view: EditorView) => this.showImageDialog(view),
        isActive: () => false // Images don't have an active state
      }
    })
  }

  /**
   * Show the image dialog
   * @param view The editor view or an object with state and dispatch
   * @returns Whether the action was successful
   */
  private showImageDialog(view: EditorView | { state: EditorState, dispatch?: (tr: Transaction) => void }): boolean {
    const { state, dispatch } = view
    const { schema } = state

    // Create a simple dialog for entering the image URL and alt text
    const src = window.prompt('Enter image URL:')

    if (src === null) {
      // User cancelled
      return false
    }

    if (src === '') {
      // Empty URL, do nothing
      return false
    }

    const alt = window.prompt('Enter image description (alt text):', '')

    if (alt === null) {
      // User cancelled
      return false
    }

    const title = window.prompt('Enter image title (optional):', '')

    if (title === null) {
      // User cancelled
      return false
    }

    // Insert the image
    if (dispatch) {
      const imageNode = schema.nodes.image.create({
        src,
        alt: alt || '',
        title: title || ''
      })

      const tr = state.tr.replaceSelectionWith(imageNode)
      dispatch(tr)
    }

    return true
  }
}
