import { EditorState, Plugin, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema, DOMParser, DOMSerializer, Node as ProseMirrorNode } from 'prosemirror-model'
import { schema } from 'prosemirror-schema-basic'
import { addListNodes } from 'prosemirror-schema-list'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { history, undo, redo } from 'prosemirror-history'
import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'
import MarkdownIt from 'markdown-it'
import markdownItAbbr from 'markdown-it-abbr'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItContainer from 'markdown-it-container'
import markdownItDeflist from 'markdown-it-deflist'
import * as markdownItEmoji from 'markdown-it-emoji'
import markdownItFootnote from 'markdown-it-footnote'
import markdownItIns from 'markdown-it-ins'
import markdownItMark from 'markdown-it-mark'
import markdownItSub from 'markdown-it-sub'
import markdownItSup from 'markdown-it-sup'
import markdownItTaskLists from 'markdown-it-task-lists'
import { markdownToDoc, docToMarkdown } from '../utils/markdown'

// Import plugins
import BoldPlugin from '../plugins/BoldPlugin'
import ItalicPlugin from '../plugins/ItalicPlugin'
import StrikethroughPlugin from '../plugins/StrikethroughPlugin'
import HeadingPlugin from '../plugins/HeadingPlugin'
import BlockquotePlugin from '../plugins/BlockquotePlugin'
import BulletListPlugin from '../plugins/BulletListPlugin'
import OrderedListPlugin from '../plugins/OrderedListPlugin'
import LinkPlugin from '../plugins/LinkPlugin'
import ImagePlugin from '../plugins/ImagePlugin'
import CodeBlockPlugin from '../plugins/CodeBlockPlugin'
import TablePlugin from '../plugins/TablePlugin'
import HorizontalRulePlugin from '../plugins/HorizontalRulePlugin'
import ViewModePlugin from '../plugins/ViewModePlugin'

// Define the editor options interface
export interface EditorOptions {
  placeholder?: string
  toolbar?: string
  theme?: 'light' | 'dark'
  floatingToolbar?: boolean
  onChange?: (markdown: string) => void
}

// Define the plugin interface
export interface PluginInterface {
  name: string
  toolbarButton?: {
    icon: string
    tooltip: string
    action: (view: EditorView) => boolean
    isActive?: (state: EditorState) => boolean
  }
  plugins?: Plugin[]
  keymap?: { [key: string]: (state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView) => boolean }
}

/**
 * FlowMD - A WYSIWYG Markdown Editor built with ProseMirror
 */
export class FlowMD {
  private element: HTMLElement
  private options: EditorOptions
  private view: EditorView | null = null
  private schema: Schema
  private plugins: PluginInterface[] = []
  private markdownParser: MarkdownIt
  private toolbar: HTMLElement | null = null
  private sourceMode = false
  private sourceTextarea: HTMLTextAreaElement | null = null
  private originalTextarea: HTMLTextAreaElement | null = null

  /**
   * Create a new FlowMD editor
   * @param element The HTML element to attach the editor to. If a textarea is provided,
   *                the editor will be built after the textarea, the textarea will be hidden,
   *                and the editor will be automatically connected to the textarea.
   * @param options Editor options
   */
  constructor(element: HTMLElement, options: EditorOptions = {}) {
    // Check if the element is a textarea
    if (element instanceof HTMLTextAreaElement) {
      // Store a reference to the original textarea
      this.originalTextarea = element;

      // Create a new container element to replace the textarea
      const container = document.createElement('div');

      // Insert the container after the textarea
      element.parentNode?.insertBefore(container, element.nextSibling);

      // Hide the original textarea
      element.style.display = 'none';

      // Set the element property to the new container
      this.element = container;
    } else {
      this.element = element;
    }

    this.options = {
      placeholder: 'Start writing...',
      toolbar: 'bold,italic,strikethrough,|,heading,blockquote,|,bulletList,orderedList,|,link,image,codeBlock,table,horizontalRule,|,viewMode',
      theme: 'light',
      floatingToolbar: false,
      ...options
    }

    // Initialize the markdown parser with CommonMark compliance
    this.markdownParser = new MarkdownIt('commonmark', {
      html: false,
      xhtmlOut: false,
      breaks: true,
      langPrefix: 'language-',
      linkify: true,
      typographer: true
    })

    // Add markdown-it plugins for extended syntax
    this.markdownParser
      .use(markdownItAbbr)
      .use(markdownItAnchor)
      .use(markdownItContainer, 'warning')  // Initialize with name parameter
      .use(markdownItDeflist)
      .use(markdownItEmoji.full)
      .use(markdownItFootnote)
      .use(markdownItIns)
      .use(markdownItMark)
      .use(markdownItSub)
      .use(markdownItSup)
      .use(markdownItTaskLists)

    // Create an extended schema that includes list nodes and table nodes
    const nodes = addListNodes(schema.spec.nodes, 'paragraph block*', 'block')
      .addToEnd('table', {
        content: 'table_row+',
        tableRole: 'table',
        isolating: true,
        group: 'block',
        parseDOM: [{ tag: 'table' }],
        toDOM() { return ['table', ['tbody', 0]] }
      })
      .addToEnd('table_row', {
        content: '(table_cell | table_header)+',
        tableRole: 'row',
        parseDOM: [{ tag: 'tr' }],
        toDOM() { return ['tr', 0] }
      })
      .addToEnd('table_cell', {
        content: 'paragraph block*',
        tableRole: 'cell',
        isolating: true,
        parseDOM: [{ tag: 'td' }],
        toDOM() { return ['td', 0] }
      })
      .addToEnd('table_header', {
        content: 'paragraph block*',
        tableRole: 'header_cell',
        isolating: true,
        parseDOM: [{ tag: 'th' }],
        toDOM() { return ['th', 0] }
      })

    this.schema = new Schema({
      nodes,
      marks: schema.spec.marks
    })

    // Register built-in plugins
    this.registerBuiltinPlugins()

    // Initialize the editor
    this.initEditor()
  }

  /**
   * Register the built-in plugins
   */
  private registerBuiltinPlugins(): void {
    // Register formatting plugins
    this.registerPlugin(new BoldPlugin())
    this.registerPlugin(new ItalicPlugin())
    this.registerPlugin(new StrikethroughPlugin())

    // Register block plugins
    this.registerPlugin(new HeadingPlugin())
    this.registerPlugin(new BlockquotePlugin())
    this.registerPlugin(new BulletListPlugin())
    this.registerPlugin(new OrderedListPlugin())

    // Register media plugins
    this.registerPlugin(new LinkPlugin())
    this.registerPlugin(new ImagePlugin())
    this.registerPlugin(new CodeBlockPlugin())
    this.registerPlugin(new TablePlugin())
    this.registerPlugin(new HorizontalRulePlugin())

    // Register utility plugins
    this.registerPlugin(new ViewModePlugin())
  }

  /**
   * Initialize the editor
   */
  private initEditor(): void {
    // Create the editor container
    this.element.classList.add('editor-container')

    // Apply theme
    if (this.options.theme === 'dark') {
      this.element.classList.add('dark-theme')
    }

    // Create toolbar
    this.createToolbar()

    // Create editor wrapper
    const editorWrapper = document.createElement('div')
    editorWrapper.className = 'editor-wrapper'
    this.element.appendChild(editorWrapper)

    // Create source mode wrapper
    const sourceWrapper = document.createElement('div')
    sourceWrapper.className = 'source-wrapper hidden'
    this.element.appendChild(sourceWrapper)

    // Create source textarea
    this.sourceTextarea = document.createElement('textarea')
    this.sourceTextarea.className = 'source-textarea'
    this.sourceTextarea.placeholder = this.options.placeholder || ''
    sourceWrapper.appendChild(this.sourceTextarea)

    // Get initial content from the original textarea or the element
    let initialContent = '';
    if (this.originalTextarea) {
      initialContent = this.originalTextarea.value || '';
    } else {
      initialContent = this.element.textContent || '';
    }

    // Create the editor state
    const state = EditorState.create({
      schema: this.schema,
      doc: markdownToDoc(initialContent, this.schema, this.markdownParser),
      plugins: [
        history(),
        keymap({ 'Mod-z': undo, 'Mod-y': redo, 'Mod-Shift-z': redo }),
        dropCursor(),
        gapCursor(),
        ...this.getPlugins(),
        keymap(baseKeymap)
      ]
    })

    // Create the editor view
    this.view = new EditorView(editorWrapper, {
      state,
      dispatchTransaction: (transaction) => {
        if (!this.view) return

        const newState = this.view.state.apply(transaction)
        this.view.updateState(newState)

        // Update toolbar button active states
        this.updateToolbarButtonStates(newState)

        // Call onChange callback if provided
        if (this.options.onChange && transaction.docChanged) {
          const markdown = docToMarkdown(newState.doc)
          this.options.onChange(markdown)

          // Update source textarea if in source mode
          if (this.sourceMode && this.sourceTextarea) {
            this.sourceTextarea.value = markdown
          }
        }
      }
    })

    // Store a reference to this instance in the view for plugins to access
    ;(this.view as any).flowMD = this

    // Initialize toolbar button states
    this.updateToolbarButtonStates(this.view.state)

    // Set up source mode textarea event listener
    if (this.sourceTextarea) {
      this.sourceTextarea.addEventListener('input', () => {
        if (this.sourceMode && this.options.onChange) {
          this.options.onChange(this.sourceTextarea!.value)
        }
      })
    }

    // If initialized on a textarea, connect the editor to it automatically
    if (this.originalTextarea) {
      // Get the name attribute from the original textarea
      const name = this.originalTextarea.getAttribute('name');

      // Connect the editor to the original textarea
      this.connectToTextarea(this.originalTextarea, 'markdown', name || undefined);
    }
  }

  /**
   * Create the toolbar
   */
  private createToolbar(): void {
    this.toolbar = document.createElement('div')
    this.toolbar.className = 'editor-toolbar'

    if (this.options.floatingToolbar) {
      this.toolbar.classList.add('floating-toolbar')
    }

    this.element.appendChild(this.toolbar)

    // Parse toolbar configuration
    if (this.options.toolbar) {
      const items = this.options.toolbar.split(',')
      let currentGroup: HTMLElement | null = null

      items.forEach(item => {
        item = item.trim()

        if (item === '|') {
          // Create a new group
          currentGroup = null
        } else {
          // Create a group if needed
          if (!currentGroup) {
            currentGroup = document.createElement('div')
            currentGroup.className = 'toolbar-group'
            this.toolbar!.appendChild(currentGroup)
          }

          // Find the plugin for this item
          const plugin = this.plugins.find(p => p.name === item)

          if (plugin && plugin.toolbarButton) {
            const button = document.createElement('button')
            button.className = 'toolbar-button'
            button.setAttribute('type', 'button')
            button.setAttribute('title', plugin.toolbarButton.tooltip)
            button.setAttribute('data-plugin-name', plugin.name)
            button.innerHTML = plugin.toolbarButton.icon

            // Add click handler
            button.addEventListener('click', () => {
              if (this.view) {
                plugin.toolbarButton!.action(this.view)
              }
            })

            // Add to the current group
            currentGroup.appendChild(button)
          }
        }
      })
    }
  }

  /**
   * Get all plugins for the editor
   */
  private getPlugins(): Plugin[] {
    const plugins: Plugin[] = []

    // Add plugins from registered plugins
    this.plugins.forEach(plugin => {
      if (plugin.plugins) {
        plugins.push(...plugin.plugins)
      }

      // Add keymap plugin if the plugin has keymap
      if (plugin.keymap) {
        plugins.push(keymap(plugin.keymap))
      }
    })

    return plugins
  }

  /**
   * Register a plugin
   * @param plugin The plugin to register
   */
  public registerPlugin(plugin: PluginInterface): void {
    this.plugins.push(plugin)
  }

  /**
   * Toggle between WYSIWYG and source mode
   */
  public toggleSourceMode(): void {
    if (!this.view || !this.sourceTextarea) return

    this.sourceMode = !this.sourceMode

    const editorWrapper = this.element.querySelector('.editor-wrapper')
    const sourceWrapper = this.element.querySelector('.source-wrapper')

    if (this.sourceMode) {
      // Switch to source mode
      editorWrapper?.classList.add('hidden')
      sourceWrapper?.classList.remove('hidden')

      // Update textarea content
      this.sourceTextarea.value = docToMarkdown(this.view.state.doc)
    } else {
      // Switch to WYSIWYG mode
      editorWrapper?.classList.remove('hidden')
      sourceWrapper?.classList.add('hidden')

      // Update editor content
      if (this.view) {
        const newDoc = markdownToDoc(this.sourceTextarea.value, this.schema, this.markdownParser)
        const tr = this.view.state.tr.replaceWith(0, this.view.state.doc.content.size, newDoc.content)
        this.view.dispatch(tr)
      }
    }
  }

  /**
   * Get the current content as markdown
   */
  public getMarkdown(): string {
    if (this.sourceMode && this.sourceTextarea) {
      return this.sourceTextarea.value
    } else if (this.view) {
      return docToMarkdown(this.view.state.doc)
    }
    return ''
  }

  /**
   * Get the current content as HTML
   */
  public getHTML(): string {
    if (this.view) {
      const fragment = DOMSerializer.fromSchema(this.schema).serializeFragment(this.view.state.doc.content)
      const tempDiv = document.createElement('div')
      tempDiv.appendChild(fragment)
      return tempDiv.innerHTML
    }
    return ''
  }

  /**
   * Set the content of the editor
   * @param markdown The markdown content to set
   */
  public setContent(markdown: string): void {
    if (this.sourceMode && this.sourceTextarea) {
      this.sourceTextarea.value = markdown
    } else if (this.view) {
      const newDoc = markdownToDoc(markdown, this.schema, this.markdownParser)
      const tr = this.view.state.tr.replaceWith(0, this.view.state.doc.content.size, newDoc.content)
      this.view.dispatch(tr)
    }
  }

  /**
   * Connect the editor to a form textarea
   * @param textarea The textarea element to connect to
   * @param format The format to use for the textarea value ('markdown' or 'html')
   * @param name Optional name attribute to set on the textarea
   * @returns The FlowMD instance for method chaining
   */
  public connectToTextarea(textarea: HTMLTextAreaElement, format: 'markdown' | 'html' = 'markdown', name?: string): FlowMD {
    // Set initial value
    textarea.value = format === 'markdown' ? this.getMarkdown() : this.getHTML()

    // Set name attribute if provided
    if (name) {
      textarea.name = name;
    }

    // Make textarea hidden by default if it doesn't have inline styles
    if (!textarea.style.display) {
      textarea.style.display = 'none';
    }

    // Update textarea when editor content changes
    const originalOnChange = this.options.onChange;
    this.options.onChange = (markdown: string) => {
      // Update the textarea with the current content
      textarea.value = format === 'markdown' ? markdown : this.getHTML();

      // Call the original onChange callback if it exists
      if (originalOnChange) {
        originalOnChange(markdown);
      }
    };

    return this;
  }

  /**
   * Update the active state of toolbar buttons based on the current editor state
   * @param state The current editor state
   */
  private updateToolbarButtonStates(state: EditorState): void {
    if (!this.toolbar) return

    // Loop through all plugins with toolbar buttons
    this.plugins.forEach(plugin => {
      if (plugin.toolbarButton && plugin.toolbarButton.isActive) {
        // Find the button for this plugin
        const button = this.toolbar!.querySelector(`button[data-plugin-name="${plugin.name}"]`)

        if (button) {
          // Check if the plugin is active
          const isActive = plugin.toolbarButton.isActive(state)

          // Update the button's active class
          if (isActive) {
            button.classList.add('active')
          } else {
            button.classList.remove('active')
          }
        }
      }
    })
  }

  /**
   * Destroy the editor
   */
  public destroy(): void {
    if (this.view) {
      this.view.destroy()
      this.view = null
    }

    // Remove all event listeners and DOM elements
    this.element.innerHTML = ''
    this.element.classList.remove('editor-container', 'dark-theme')
  }
}
