import { setBlockType } from 'prosemirror-commands'
import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { BasePlugin } from './BasePlugin'

/**
 * Plugin for heading formatting
 */
export default class HeadingPlugin extends BasePlugin {
  /**
   * The name of the plugin
   */
  public readonly name = 'heading'

  /**
   * Create a new HeadingPlugin instance
   */
  constructor() {
    super({
      toolbarButton: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h12"></path><path d="M6 4v16"></path><path d="M18 4v16"></path></svg>',
        tooltip: 'Heading',
        action: (view: EditorView) => this.showHeadingDropdown(view),
        isActive: (state: EditorState) => this.isAnyHeadingActive(state)
      },
      keymap: {
        'Mod-Alt-1': (state, dispatch) => this.toggleHeading(state, dispatch, 1),
        'Mod-Alt-2': (state, dispatch) => this.toggleHeading(state, dispatch, 2),
        'Mod-Alt-3': (state, dispatch) => this.toggleHeading(state, dispatch, 3),
        'Mod-Alt-4': (state, dispatch) => this.toggleHeading(state, dispatch, 4),
        'Mod-Alt-5': (state, dispatch) => this.toggleHeading(state, dispatch, 5),
        'Mod-Alt-6': (state, dispatch) => this.toggleHeading(state, dispatch, 6),
        'Mod-Alt-0': (state, dispatch) => this.toggleParagraph(state, dispatch)
      }
    })
  }

  /**
   * Show the heading dropdown menu
   * @param view The editor view
   * @returns Whether the action was successful
   */
  private showHeadingDropdown(view: EditorView): boolean {
    // Find the toolbar button
    const button = document.querySelector(`.toolbar-button[title="Heading"]`)
    if (!button) return false

    // Check if dropdown already exists
    let dropdown = document.querySelector('.dropdown-menu')
    if (dropdown) {
      // Toggle dropdown visibility
      dropdown.classList.toggle('show')
      return true
    }

    // Create dropdown container
    const dropdownContainer = document.createElement('div')
    dropdownContainer.className = 'toolbar-dropdown-container'
    button.parentNode?.insertBefore(dropdownContainer, button)
    dropdownContainer.appendChild(button)

    // Update button to be a dropdown toggle
    button.classList.add('dropdown-toggle')
    const arrow = document.createElement('span')
    arrow.className = 'dropdown-arrow'
    button.appendChild(arrow)

    // Create dropdown menu
    dropdown = document.createElement('div')
    dropdown.className = 'dropdown-menu'
    dropdownContainer.appendChild(dropdown)

    // Add heading options
    const headingLevels = [
      { level: 0, text: 'Normal text' },
      { level: 1, text: 'Heading 1' },
      { level: 2, text: 'Heading 2' },
      { level: 3, text: 'Heading 3' },
      { level: 4, text: 'Heading 4' },
      { level: 5, text: 'Heading 5' },
      { level: 6, text: 'Heading 6' }
    ]

    headingLevels.forEach(({ level, text }) => {
      const item = document.createElement('button')
      item.className = 'dropdown-item'
      item.textContent = text
      item.addEventListener('click', () => {
        dropdown?.classList.remove('show')
        if (level === 0) {
          this.toggleParagraph(view.state, view.dispatch)
        } else {
          this.toggleHeading(view.state, view.dispatch, level)
        }
      })
      dropdown?.appendChild(item)
    })

    // Show the dropdown
    dropdown.classList.add('show')

    // Add click outside listener to close dropdown
    const closeDropdown = (e: MouseEvent) => {
      if (!dropdownContainer.contains(e.target as Node)) {
        dropdown?.classList.remove('show')
        document.removeEventListener('click', closeDropdown)
      }
    }

    // Use setTimeout to avoid immediate trigger
    setTimeout(() => {
      document.addEventListener('click', closeDropdown)
    }, 0)

    return true
  }

  /**
   * Toggle heading formatting
   * @param state The editor state
   * @param dispatch The dispatch function
   * @param level The heading level (1-6)
   * @returns Whether the action was successful
   */
  private toggleHeading(state: EditorState, dispatch: ((tr: Transaction) => void) | undefined, level: number): boolean {
    const { schema } = state
    const isActive = this.isActive(state, 'heading', { level })

    if (isActive) {
      // If already a heading of this level, convert to paragraph
      return setBlockType(schema.nodes.paragraph)(state, dispatch)
    } else {
      // Convert to heading of specified level
      return setBlockType(schema.nodes.heading, { level })(state, dispatch)
    }
  }

  /**
   * Toggle paragraph formatting (remove heading)
   * @param state The editor state
   * @param dispatch The dispatch function
   * @returns Whether the action was successful
   */
  private toggleParagraph(state: EditorState, dispatch: ((tr: Transaction) => void) | undefined): boolean {
    const { schema } = state
    return setBlockType(schema.nodes.paragraph)(state, dispatch)
  }

  /**
   * Check if any heading level is active
   * @param state The editor state
   * @returns Whether any heading is active
   */
  private isAnyHeadingActive(state: EditorState): boolean {
    return this.isActive(state, 'heading')
  }
}
