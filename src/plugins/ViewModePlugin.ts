import {Command} from 'prosemirror-state'

import {FlowMD} from '../editor/FlowMD'

import {BasePlugin} from './BasePlugin'

export default class ViewModePlugin extends BasePlugin {
  private isSourceMode: boolean = false
  private updateTimeout: NodeJS.Timeout | undefined

  constructor(editor: FlowMD) {
    super(editor)
    // No need to setup source view here since FlowMD always creates it
  }

  public createButton(): HTMLButtonElement {
    const button = document.createElement('button')
    button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
        `
    button.title = 'Toggle Source View'
    button.type = 'button'
    button.className = 'toolbar-button'
    button.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.toggleView()
    })

    // Store reference to plugin for state updates
    ;(button as HTMLButtonElement & { _plugin: ViewModePlugin })._plugin = this

    return button
  }

  private toggleView(): void {
    this.isSourceMode = !this.isSourceMode

    if (this.isSourceMode) {
      // Switch to source mode
      this.switchToSourceMode()
    } else {
      // Switch to editor mode
      this.switchToEditorMode()
    }

    // Update button appearance
    this.updateButtonState()
  }

  private switchToSourceMode(): void {
    // Hide editor, show source
    if (this.editor.editorWrapper) {
      this.editor.editorWrapper.classList.add('hidden')
    }
    if (this.editor.sourceWrapper) {
      this.editor.sourceWrapper.classList.remove('hidden')
    }

    if (this.editor.sourceTextarea) {
      // Get clean markdown without potential duplications
      const markdown = this.editor.getMarkdown()
      this.editor.sourceTextarea.value = markdown
      // Focus and adjust height
      setTimeout(() => {
        this.editor.sourceTextarea?.focus()
        this.adjustTextareaHeight()
      }, 100)
    }
  }

  private switchToEditorMode(): void {
    // Only update editor if content actually changed
    if (this.editor.sourceTextarea) {
      const currentMarkdown = this.editor.getMarkdown()
      const textareaContent = this.editor.sourceTextarea.value

      // Only set content if it's different to avoid unnecessary re-parsing
      if (currentMarkdown !== textareaContent) {
        this.editor.setContent(textareaContent)
      }
    }

    // Show editor, hide source
    if (this.editor.sourceWrapper) {
      this.editor.sourceWrapper.classList.add('hidden')
    }
    if (this.editor.editorWrapper) {
      this.editor.editorWrapper.classList.remove('hidden')
    }

    // Focus editor
    setTimeout(() => {
      this.editor.view?.focus()
    }, 100)
  }

  private adjustTextareaHeight(): void {
    if (!this.editor.sourceTextarea) {
      return
    }

    // Auto-adjust height based on content
    this.editor.sourceTextarea.style.height = 'auto'
    const scrollHeight = this.editor.sourceTextarea.scrollHeight
    const minHeight = 384 // h-96 equivalent
    const maxHeight = window.innerHeight * 0.6

    this.editor.sourceTextarea.style.height =
      Math.min(Math.max(scrollHeight, minHeight), maxHeight) + 'px'
  }

  public execute(): void {
    this.toggleView()
  }

  private updateButtonState(): void {
    // Find the button and update its appearance based on current mode
    const buttons = document.querySelectorAll('.toolbar-button')
    buttons.forEach(button => {
      const plugin = (button as any)._plugin
      if (plugin === this) {
        if (this.isSourceMode) {
          button.classList.add('active')
        } else {
          button.classList.remove('active')
        }
      }
    })
  }

  public isActive(): boolean {
    return this.isSourceMode
  }

  // Add keymap for view mode toggle
  public getKeymap(): { [key: string]: Command } {
    return {
      'Mod-Shift-m': (state, dispatch) => {
        this.isSourceMode = !this.isSourceMode

        if (this.isSourceMode) {
          // Switch to source mode
          this.switchToSourceMode()
        } else {
          // Switch to editor mode
          this.switchToEditorMode()
        }

        // Update button appearance
        this.updateButtonState()
        return true
      },
    }
  }

  // Public method to get current view mode
  public getViewMode(): 'editor' | 'source' {
    return this.isSourceMode ? 'source' : 'editor'
  }

  // Public method to set view mode programmatically
  public setViewMode(mode: 'editor' | 'source'): void {
    if (
      (mode === 'source' && !this.isSourceMode) ||
      (mode === 'editor' && this.isSourceMode)
    ) {
      this.toggleView()
    }
  }
}
