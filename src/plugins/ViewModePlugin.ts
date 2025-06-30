import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { BasePlugin } from './BasePlugin'

/**
 * Plugin for toggling between WYSIWYG and source modes
 */
export default class ViewModePlugin extends BasePlugin {
  /**
   * The name of the plugin
   */
  public readonly name = 'viewMode'

  /**
   * Whether the editor is in source mode
   */
  private isSourceMode = false

  /**
   * Create a new ViewModePlugin instance
   */
  constructor() {
    super({
      toolbarButton: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 9l3 3-3 3"></path><path d="M16 15l-3-3 3-3"></path><rect x="4" y="4" width="16" height="16" rx="2"></rect></svg>',
        tooltip: 'Toggle Source Mode (Ctrl+Shift+M)',
        action: (view: EditorView) => this.toggleViewMode(view),
        isActive: (state: EditorState) => this.isSourceMode
      },
      keymap: {
        'Mod-Shift-m': (state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView) => {
          if (view) {
            this.toggleViewMode(view)
            return true
          }
          return false
        }
      }
    })
  }

  /**
   * Toggle between WYSIWYG and source modes
   * @param view The editor view
   * @returns Whether the action was successful
   */
  private toggleViewMode(view: EditorView): boolean {
    // Get the FlowMD instance from the view
    const flowMD = (view as any).flowMD

    if (!flowMD) {
      console.error('FlowMD instance not found on view')
      return false
    }

    // Toggle source mode
    flowMD.toggleSourceMode()

    // Update the state
    this.isSourceMode = !this.isSourceMode

    // Update the toolbar button
    const button = document.querySelector(`.toolbar-button[title="Toggle Source Mode (Ctrl+Shift+M)"]`)
    if (button) {
      if (this.isSourceMode) {
        button.classList.add('active')
      } else {
        button.classList.remove('active')
      }
    }

    return true
  }
}
