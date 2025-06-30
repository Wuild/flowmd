import {EditorState, Plugin, Transaction} from 'prosemirror-state';
import {EditorView} from 'prosemirror-view';
import {Schema, Node as ProseMirrorNode, Fragment} from 'prosemirror-model';
import {schema} from 'prosemirror-schema-basic';
import {addListNodes} from 'prosemirror-schema-list';
import {splitListItem, liftListItem, sinkListItem} from 'prosemirror-schema-list';
import {keymap} from 'prosemirror-keymap';
import {history, undo, redo} from 'prosemirror-history';
import {baseKeymap} from 'prosemirror-commands';
import {chainCommands, exitCode} from 'prosemirror-commands';
import {dropCursor} from 'prosemirror-dropcursor';
import {gapCursor} from 'prosemirror-gapcursor';
import {MarkdownParser, MarkdownSerializer, defaultMarkdownParser} from 'prosemirror-markdown';
import MarkdownIt from 'markdown-it';

// Import markdown-it plugins
// import emoji from 'markdown-it-emoji';
import sub from 'markdown-it-sub';
import sup from 'markdown-it-sup';
import footnote from 'markdown-it-footnote';
import deflist from 'markdown-it-deflist';
import abbr from 'markdown-it-abbr';
// import container from 'markdown-it-container';
import mark from 'markdown-it-mark';
import taskLists from 'markdown-it-task-lists';
import toc from 'markdown-it-table-of-contents';

// Import plugins
import {BasePlugin} from '../plugins/BasePlugin';
import BoldPlugin from '../plugins/BoldPlugin';
import BlockquotePlugin from '../plugins/BlockquotePlugin';
import BulletListPlugin from '../plugins/BulletListPlugin';
import CodeBlockPlugin from '../plugins/CodeBlockPlugin';
import HeadingPlugin from '../plugins/HeadingPlugin';
import HorizontalRulePlugin from '../plugins/HorizontalRulePlugin';
import ImagePlugin from '../plugins/ImagePlugin';
import InlineCodePlugin from '../plugins/InlineCodePlugin';
import ItalicPlugin from '../plugins/ItalicPlugin';
import LinkPlugin from '../plugins/LinkPlugin';
import MarkdownExtensionsPlugin from '../plugins/MarkdownExtensionsPlugin';
import OrderedListPlugin from '../plugins/OrderedListPlugin';
import StrikethroughPlugin from '../plugins/StrikethroughPlugin';
import TablePlugin from '../plugins/TablePlugin';
import UnderlinePlugin from '../plugins/UnderlinePlugin';
import ViewModePlugin from '../plugins/ViewModePlugin';

export interface EditorOptions {
  placeholder?: string
  plugins?: Plugin[]
  onChange?: (markdown: string) => void
  toolbar?: string // e.g., "bold,italic,|,heading,blockquote,|,image,link"
  theme?: 'light' | 'dark' | 'auto' // Added 'auto' option
  floatingToolbar?: boolean // Add floating toolbar option
  name?: string // Name attribute for the textarea in source mode
  // Height configuration options
  minHeight?: string // e.g., "200px", "10rem"
  maxHeight?: string // e.g., "500px", "30rem"
  height?: string // Fixed height e.g., "400px"
  autoResize?: boolean // If true, editor grows with content (default: true)
  overflowY?: 'auto' | 'scroll' | 'hidden' // Overflow behavior when content exceeds maxHeight
  // Debug configuration
  debug?: boolean | ((message: string, ...args: any[]) => void) // Enable debug logging or provide custom debug function
}

type PluginConstructor = new (editor: FlowMD) => BasePlugin

// Interface for markdown token to ProseMirror object conversion
interface TokenHandler {
  type: 'node' | 'mark'
  name: string
  getAttrs?: (token: any) => any
  content?: TokenHandler[]
}

// Interface for direct markdown to object parsing
interface MarkdownObjectParser {
  parseToObjects(markdown: string): ProseMirrorNode

  serializeFromObjects(doc: ProseMirrorNode): string
}

export class FlowMD {
  public container: HTMLElement
  public options: EditorOptions
  public schema: Schema
  private markdownParser: MarkdownParser
  private markdownSerializer: MarkdownSerializer
  private markdownIt!: MarkdownIt
  private objectParser!: MarkdownObjectParser // New object-based parser
  private toolbarPlugins: Map<string, PluginConstructor>
  public view: EditorView | null
  private state: EditorState | null
  private toolbarContainer!: HTMLElement
  private editorContainer!: HTMLElement
  // Always include source view elements
  public sourceTextarea: HTMLTextAreaElement | null = null
  public sourceWrapper: HTMLElement | null = null
  public editorWrapper: HTMLElement | null = null
  private sourceUpdateTimeout: NodeJS.Timeout | undefined
  private selectionTimeout: number | null = null
  private isToolbarVisible: boolean = false

  constructor(container: HTMLElement, options: EditorOptions = {}) {
    this.container = container
    this.options = {
      placeholder: 'Start writing...',
      plugins: [],
      onChange: undefined,
      theme: 'auto',
      ...options,
    }

    // Initialize toolbarPlugins first before creating schema
    this.toolbarPlugins = new Map()
    this.view = null
    this.state = null

    this.debug('FlowMD: Initializing editor with options:', this.options)

    // Register default plugins before creating schema since schema needs them
    this.registerDefaultPlugins()

    // Create custom schema with task list support
    this.schema = this.createCustomSchema()

    // Create custom markdown parser and serializer for our schema
    this.markdownParser = this.createMarkdownParser()
    this.markdownSerializer = this.createMarkdownSerializer()

    // Initialize markdown-it and object-based parser
    this.configureMarkdownIt()
    this.objectParser = this.createObjectParser()

    this.init()
  }

  // Debug helper method
  private debug(message: string, ...args: any[]): void {
    if (!this.options.debug) {
      return
    }

    if (typeof this.options.debug === 'function') {
      this.options.debug(message, ...args)
    } else if (this.options.debug === true) {
      console.log(`[FlowMD] ${message}`, ...args)
    }
  }

  private init(): void {
    this.debug('Initializing editor components')

    // Read initial content if container is a textarea
    const initialContent = this.readInitialContent()
    this.debug('Read initial content:', initialContent)

    this.createEditorContainer()
    this.debug('Created editor container')

    this.createEditorState(initialContent // Pass initial content to state creation
    )
    this.debug('Created editor state')

    this.createEditorView()
    this.debug('Created editor view')

    // Initialize textarea with initial content after editor is created
    this.initializeSourceTextarea(initialContent)

    this.renderToolbar()
    this.debug('Rendered toolbar')

    this.applyTheme()
    this.debug('Applied theme')

    this.applyHeightConfiguration() // Apply height settings
    this.debug('Applied height configuration')
  }

  // Initialize the textarea with the initial content
  private initializeSourceTextarea(initialContent?: string): void {
    if (this.sourceTextarea) {
      if (initialContent && initialContent.trim()) {
        // Use the initial content if available
        this.sourceTextarea.value = initialContent
      } else {
        // Fallback to current editor markdown (in case initial content was processed)
        this.sourceTextarea.value = this.getMarkdown()
      }
    }
  }

  private readInitialContent(): string {
    // Check if the container is a textarea and read its value
    if (this.container.tagName.toLowerCase() === 'textarea') {
      const textarea = this.container as HTMLTextAreaElement

      // Store textarea information for later use in ViewModePlugin
      this.options.name = this.options.name || textarea.name || 'markdown'

      return textarea.value || ''
    }

    // Fallback: read text content from other elements
    return this.container.textContent || this.container.innerHTML || ''
  }

  private createCustomSchema(): Schema {
    // Start with basic nodes and list support
    const baseNodes = addListNodes(schema.spec.nodes, 'paragraph block*', 'block')

    // Override code_block node to support syntax highlighting
    const modifiedNodes = baseNodes.update('code_block', {
      attrs: {params: {default: ''}},
      content: 'text*',
      marks: '',
      group: 'block',
      code: true,
      defining: true,
      parseDOM: [
        {
          tag: 'pre',
          preserveWhitespace: 'full',
          getAttrs: (node: HTMLElement) => {
            const codeEl = node.querySelector('code')
            if (codeEl) {
              const className = codeEl.className
              const match = className.match(/language-(\w+)/)
              return {params: match ? match[1] : ''}
            }
            return {params: ''}
          },
        },
      ],
      toDOM: (node: any) => {
        const language = node.attrs.params || ''
        const codeElement = [
          'code',
          {
            class: language ? `language-${language}` : '',
            spellcheck: 'false',
          },
          0,
        ]

        return [
          'pre',
          {
            class: 'hljs',
            'data-language': language,
          },
          codeElement,
        ]
      },
    })

    // Collect schema contributions from all plugins
    const allPlugins = this.getAllPluginInstances()
    let nodes = modifiedNodes
    let marks = schema.spec.marks

    allPlugins.forEach(plugin => {
      const contribution = plugin.getSchemaContribution()

      if (contribution.nodes) {
        Object.entries(contribution.nodes).forEach(([name, spec]) => {
          nodes = nodes.addToEnd(name, spec)
        })
      }

      if (contribution.marks) {
        Object.entries(contribution.marks).forEach(([name, spec]) => {
          marks = marks.addToEnd(name, spec)
        })
      }
    })

    return new Schema({
      nodes,
      marks,
    })
  }

  private getAllPluginInstances(): BasePlugin[] {
    const instances: BasePlugin[] = []

    // Create instances of all registered plugins
    this.toolbarPlugins.forEach(PluginClass => {
      instances.push(new PluginClass(this))
    })

    // Also create instances of non-toolbar plugins
    instances.push(new MarkdownExtensionsPlugin(this))

    return instances
  }

  private createMarkdownParser(): MarkdownParser {
    // Create a new MarkdownParser with standard token mappings
    try {
      return new MarkdownParser(this.schema, defaultMarkdownParser.tokenizer, {
        blockquote: {block: 'blockquote'},
        paragraph: {block: 'paragraph'},
        list_item: {block: 'list_item'},
        bullet_list: {block: 'bullet_list', getAttrs: () => null},
        ordered_list: {
          block: 'ordered_list',
          getAttrs: (tok: any) => ({
            order: +tok.attrGet('start') || 1,
          }),
        },
        heading: {
          block: 'heading',
          getAttrs: (tok: any) => ({level: +tok.tag.slice(1)}),
        },
        code_block: {block: 'code_block', noCloseToken: true},
        fence: {
          block: 'code_block',
          getAttrs: (tok: any) => ({params: tok.info || ''}),
          noCloseToken: true,
        },
        hr: {node: 'horizontal_rule'},
        hardbreak: {node: 'hard_break'},
        em: {mark: 'em'},
        strong: {mark: 'strong'},
        link: {
          mark: 'link',
          getAttrs: (tok: any) => ({
            href: tok.attrGet('href'),
            title: tok.attrGet('title') || null,
          }),
        },
        code_inline: {mark: 'code', noCloseToken: true},
        // Add strikethrough support
        s: {mark: 'strikethrough'},
        // Remove table token mappings - let markdown-it handle tables and convert via HTML
      })
    } catch (error) {
      console.error('Error creating markdown parser:', error)
      return defaultMarkdownParser
    }
  }

  private createMarkdownSerializer(): MarkdownSerializer {
    // Start with base serialization rules
    const baseNodes = {
      paragraph(state: any, node: ProseMirrorNode): void {
        state.renderInline(node)
        state.closeBlock(node)
      },
      heading(state: any, node: ProseMirrorNode): void {
        state.write('#'.repeat(node.attrs.level) + ' ')
        state.renderInline(node)
        state.closeBlock(node)
      },
      blockquote(state: any, node: ProseMirrorNode): void {
        state.wrapBlock('> ', null, node, () => state.renderContent(node))
      },
      code_block(state: any, node: ProseMirrorNode): void {
        state.write('```' + (node.attrs.params || '') + '\n')
        state.text(node.textContent, false)
        state.ensureNewLine()
        state.write('```')
        state.closeBlock(node)
      },
      bullet_list(state: any, node: ProseMirrorNode): void {
        state.renderList(node, '  ', () => '- ')
      },
      ordered_list(state: any, node: ProseMirrorNode): void {
        const start = node.attrs.order || 1
        const maxW = String(start + node.childCount - 1).length
        const space = ' '.repeat(maxW + 2)
        state.renderList(node, space, (i: number) => {
          const nStr = String(start + i)
          return ' '.repeat(maxW - nStr.length) + nStr + '. '
        })
      },
      list_item(state: any, node: ProseMirrorNode): void {
        state.renderContent(node)
      },
      horizontal_rule(state: any): void {
        state.write('---')
        state.closeBlock()
      },
      hard_break(
        state: any,
        node: ProseMirrorNode,
        parent?: ProseMirrorNode,
        index?: number
      ): void {
        if (parent && index !== undefined) {
          for (let i = index + 1; i < parent.childCount; i++) {
            if (parent.child(i).type !== node.type) {
              state.write('\\\n')
              return
            }
          }
        } else {
          state.write('\\\n')
        }
      },
      text(state: any, node: ProseMirrorNode): void {
        state.text(node.text)
      },
    }

    const baseMarks = {
      strong: {
        open: '**',
        close: '**',
        mixable: true,
        expelEnclosingWhitespace: true,
      },
      em: {
        open: '*',
        close: '*',
        mixable: true,
        expelEnclosingWhitespace: true,
      },
      code: {open: '`', close: '`', escape: false},
      link: {
        open(): string {
          return '['
        },
        close(state: any, mark: any): string {
          return (
            '](' +
            mark.attrs.href +
            (mark.attrs.title ? ' "' + mark.attrs.title + '"' : '') +
            ')'
          )
        },
      },
    }

    // Collect serialization contributions from all plugins
    const allPlugins = this.getAllPluginInstances()
    const nodes: any = {...baseNodes}
    const marks: any = {...baseMarks}

    // Add serialization rules for markdown-it features
    if (this.schema.nodes.footnote_ref) {
      nodes.footnote_ref = (state: any, node: ProseMirrorNode) => {
        state.write(`[^${node.attrs.label}]`)
      }
    }

    if (this.schema.nodes.table_of_contents) {
      nodes.table_of_contents = (state: any) => {
        state.write('[[toc]]')
        state.closeBlock()
      }
    }

    if (this.schema.marks.mark) {
      marks.mark = {
        open: '==',
        close: '==',
        mixable: true,
        expelEnclosingWhitespace: true,
      }
    }

    if (this.schema.marks.subscript) {
      marks.subscript = {
        open: '~',
        close: '~',
        mixable: true,
        expelEnclosingWhitespace: true,
      }
    }

    if (this.schema.marks.superscript) {
      marks.superscript = {
        open: '^',
        close: '^',
        mixable: true,
        expelEnclosingWhitespace: true,
      }
    }

    allPlugins.forEach(plugin => {
      const rules = plugin.getSerializationRules()

      if (rules.nodes) {
        Object.assign(nodes, rules.nodes)
      }

      if (rules.marks) {
        Object.assign(marks, rules.marks)
      }
    })

    return new MarkdownSerializer(nodes, marks)
  }

  private createEditorContainer(): void {
    // If container is a textarea, we need to replace it with a proper container
    if (this.container.tagName.toLowerCase() === 'textarea') {
      const textarea = this.container as HTMLTextAreaElement

      // Create a new container div to replace the textarea
      const newContainer = document.createElement('div')
      newContainer.className = 'editor-container'

      // Copy relevant attributes from the original textarea
      if (textarea.id) {
        newContainer.id = textarea.id
      }
      if (textarea.className && textarea.className !== 'editor-container') {
        newContainer.className = `editor-container ${textarea.className}`
      }

      // Replace the textarea with the new container
      if (textarea.parentNode) {
        textarea.parentNode.replaceChild(newContainer, textarea)
      }

      // Update our container reference
      this.container = newContainer
    } else {
      // For non-textarea elements, just apply the class
      this.container.className = 'editor-container'
    }

    // Apply theme class
    if (this.options.theme === 'dark') {
      this.container.classList.add('dark-theme')
    }

    // Add floating toolbar class if enabled
    if (this.options.floatingToolbar) {
      this.container.classList.add('floating-toolbar-enabled')
    }

    // Create toolbar container
    this.toolbarContainer = document.createElement('div')
    this.toolbarContainer.className = this.options.floatingToolbar
      ? 'editor-toolbar floating-toolbar'
      : 'editor-toolbar'

    if (this.options.floatingToolbar) {
      // Hide floating toolbar initially
      this.toolbarContainer.style.opacity = '0'
      this.toolbarContainer.style.visibility = 'hidden'
      this.toolbarContainer.style.transform = 'translateY(-10px)'
    }

    this.container.appendChild(this.toolbarContainer)

    // Always create source view elements
    this.setupSourceView()

    // Create editor container wrapper
    this.editorWrapper = document.createElement('div')
    this.editorWrapper.className = 'editor-wrapper'

    // Create editor container
    this.editorContainer = document.createElement('div')
    this.editorContainer.className = 'prosemirror-editor'

    // Add editor to wrapper
    this.editorWrapper.appendChild(this.editorContainer)

    // Add both wrappers to main container
    this.container.appendChild(this.editorWrapper)
    this.container.appendChild(this.sourceWrapper!)
  }

  // Always setup source view elements
  private setupSourceView(): void {
    // Create source view wrapper
    this.sourceWrapper = document.createElement('div')
    this.sourceWrapper.className = 'source-wrapper hidden'

    // Create textarea for source view
    this.sourceTextarea = document.createElement('textarea')
    this.sourceTextarea.className = 'source-textarea'

    // Use name from options, or from original textarea if container was a textarea
    if (this.options.name) {
      this.sourceTextarea.name = this.options.name
    } else {
      this.sourceTextarea.name = 'markdown'
    }

    this.sourceTextarea.placeholder = 'Enter your markdown here...'

    // Setup textarea event handlers for syncing content
    this.sourceTextarea.addEventListener('input', this.handleSourceChange.bind(this))

    this.sourceWrapper.appendChild(this.sourceTextarea)
  }

  private handleSourceChange(): void {
    if (this.sourceTextarea) {
      // Debounce updates to avoid excessive parsing
      clearTimeout(this.sourceUpdateTimeout)
      this.sourceUpdateTimeout = setTimeout(() => {
        const markdown = this.sourceTextarea!.value
        this.setContent(markdown)

        // Trigger onChange callback if provided
        if (this.options.onChange) {
          this.options.onChange(markdown)
        }
      }, 300)
    }
  }

  private registerDefaultPlugins(): void {
    // Register built-in toolbar plugins
    this.registerPlugin('bold', BoldPlugin)
    this.registerPlugin('italic', ItalicPlugin)
    this.registerPlugin('strikethrough', StrikethroughPlugin)
    this.registerPlugin('underline', UnderlinePlugin)
    this.registerPlugin('inlineCode', InlineCodePlugin)
    this.registerPlugin('heading', HeadingPlugin)
    this.registerPlugin('blockquote', BlockquotePlugin)
    this.registerPlugin('bulletList', BulletListPlugin)
    this.registerPlugin('orderedList', OrderedListPlugin)
    this.registerPlugin('codeBlock', CodeBlockPlugin)
    this.registerPlugin('link', LinkPlugin)
    this.registerPlugin('image', ImagePlugin)
    this.registerPlugin('table', TablePlugin)
    this.registerPlugin('horizontalRule', HorizontalRulePlugin)
    this.registerPlugin('viewMode', ViewModePlugin)
  }

  public registerPlugin(name: string, pluginClass: PluginConstructor): void {
    this.toolbarPlugins.set(name, pluginClass)
  }

  private createEditorState(initialContent?: string): void {
    this.debug('Creating editor state with plugins')

    // Create custom keymap for list handling and line breaks
    const listKeymap = keymap({
      // Enter in list items should create new list item or exit list
      Enter: splitListItem(this.schema.nodes.list_item),
      // Tab should indent list items
      Tab: sinkListItem(this.schema.nodes.list_item),
      // Shift+Tab should outdent list items
      'Shift-Tab': liftListItem(this.schema.nodes.list_item),
      // Shift+Enter should create a hard break (line break within same paragraph/list item)
      'Shift-Enter': chainCommands(exitCode, (state, dispatch) => {
        if (dispatch) {
          dispatch(
            state.tr
              .replaceSelectionWith(this.schema.nodes.hard_break.create())
              .scrollIntoView()
          )
        }
        return true
      }),
    })

    // Create syntax highlighting plugin
    const syntaxHighlightPlugin = new Plugin({
      view: () => ({
        update: view => {
          // Apply syntax highlighting to all code blocks
          this.applySyntaxHighlighting(view.dom)
        },
      }),
      props: {
        decorations: () => null,
        nodeViews: {
          code_block: (node, view, getPos) => {
            return CodeBlockPlugin.createCodeBlockNodeView(node, view, getPos)
          },
        },
      },
    })

    // Collect keymaps from enabled plugins
    const pluginKeymaps: { [key: string]: any } = {}
    const enabledPlugins = this.getAllPluginInstances()

    enabledPlugins.forEach(plugin => {
      if (plugin.isEnabled()) {
        const pluginKeymap = plugin.getKeymap()
        Object.assign(pluginKeymaps, pluginKeymap)
      }
    })

    // Create plugin keymap
    const pluginKeymapPlugin =
      Object.keys(pluginKeymaps).length > 0 ? keymap(pluginKeymaps) : null

    const plugins = [
      history(),
      // Add list keymap before base keymap so it takes precedence
      listKeymap,
      // Add plugin keymaps before base keymap
      ...(pluginKeymapPlugin ? [pluginKeymapPlugin] : []),
      keymap({
        ...baseKeymap,
        'Mod-z': undo,
        'Mod-y': redo,
        'Mod-Shift-z': redo,
      }),
      dropCursor(),
      gapCursor(),
      syntaxHighlightPlugin,
      ...(this.options.plugins || []),
    ]

    this.debug('Created plugins:', plugins.length, 'plugins total')

    // Parse initial content during editor state creation
    let doc: ProseMirrorNode
    if (initialContent && initialContent.trim()) {
      this.debug('Parsing initial content:', initialContent)
      try {
        // Try the object parser first
        const parsedDoc = this.parseMarkdown(initialContent)
        if (parsedDoc) {
          doc = parsedDoc
          this.debug('Successfully parsed with object parser')
        } else {
          throw new Error('Object parser returned null')
        }
      } catch (error) {
        this.debug('Object parser failed, trying fallback:', error)
        // Fallback to the standard ProseMirror parser
        try {
          doc = this.markdownParser.parse(initialContent)
          this.debug('Successfully parsed with fallback parser')
        } catch (fallbackError) {
          this.debug('All parsers failed, using manual parsing:', fallbackError)
          // Manual parsing for simple cases like headings
          doc = this.parseManually(initialContent)
        }
      }
    } else {
      this.debug('No initial content, creating empty document')
      doc = this.schema.node('doc', null, [this.schema.nodes.paragraph.create()])
    }

    this.state = EditorState.create({
      schema: this.schema,
      doc,
      plugins,
    })

    this.debug('Editor state created successfully')
  }

  // Add a simple manual parser for basic markdown
  private parseManually(markdown: string): ProseMirrorNode {
    const lines = markdown.split('\n').filter(line => line.trim())
    const nodes: ProseMirrorNode[] = []

    for (const line of lines) {
      const trimmed = line.trim()

      // Handle headings
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/)
      if (headingMatch) {
        const level = headingMatch[1].length
        const text = headingMatch[2]
        const headingNode = this.schema.nodes.heading.create({level}, [
          this.schema.text(text),
        ])
        nodes.push(headingNode)
        continue
      }

      // Handle regular paragraphs
      if (trimmed) {
        const paragraphNode = this.schema.nodes.paragraph.create(null, [
          this.schema.text(trimmed),
        ])
        nodes.push(paragraphNode)
      }
    }

    // Ensure we have at least one node
    if (nodes.length === 0) {
      nodes.push(this.schema.nodes.paragraph.create())
    }

    return this.schema.node('doc', null, nodes)
  }

  private createEditorView(): void {
    if (!this.state) {
      return
    }

    this.view = new EditorView(this.editorContainer, {
      state: this.state,
      dispatchTransaction: (transaction: Transaction) => {
        if (!this.view) {
          return
        }

        const newState = this.view.state.apply(transaction)
        this.view.updateState(newState)

        if (transaction.docChanged) {
          // Always update the textarea value when content changes
          this.updateSourceTextarea()

          if (this.options.onChange) {
            this.options.onChange(this.getMarkdown())
          }
        }

        this.updateToolbarState()

        // Handle floating toolbar visibility
        if (this.options.floatingToolbar) {
          this.handleFloatingToolbarVisibility()
        }
      },
      handleDOMEvents: {
        focus: () => {
          this.container.classList.add('focused')
          // Ensure cursor is visible after focus
          setTimeout(() => {
            if (this.view?.dom) {
              this.view.dom.style.caretColor = ''
            }
          }, 0)
          return false
        },
        blur: () => {
          this.container.classList.remove('focused')
          if (this.options.floatingToolbar) {
            this.hideFloatingToolbar()
          }
          return false
        },
        mouseup: () => {
          if (this.options.floatingToolbar) {
            // Delay to allow selection to be established
            setTimeout(() => this.handleFloatingToolbarVisibility(), 10)
          }
          return false
        },
        keyup: () => {
          if (this.options.floatingToolbar) {
            // Delay to allow selection to be established
            setTimeout(() => this.handleFloatingToolbarVisibility(), 10)
          }
          return false
        },
        // Prevent interference with clipboard operations
        copy: () => false, // Let browser handle copy
        cut: () => false,  // Let browser handle cut
        paste: () => false, // Let browser handle paste
        // Add additional event handlers to maintain cursor visibility
        input: () => {
          // Reset caret color to ensure visibility during typing
          if (this.view?.dom) {
            this.view.dom.style.caretColor = ''
          }
          return false
        },
      },
    })

    // Ensure the editor is focusable and cursor is visible
    if (this.view.dom) {
      this.view.dom.setAttribute('contenteditable', 'true')
      this.view.dom.style.caretColor = ''
    }
  }

  // Always keep the textarea in sync with editor content
  private updateSourceTextarea(): void {
    if (this.sourceTextarea) {
      const markdown = this.getMarkdown()
      this.sourceTextarea.value = markdown
    }
  }

  private renderToolbar(): void {
    this.toolbarContainer.innerHTML = ''

    // Use custom toolbar config if provided, otherwise use default
    const toolbarConfig =
      this.options.toolbar ||
      'bold,italic,underline,strikethrough,inlineCode,|,heading,blockquote,|,bulletList,orderedList,taskList,|,link,codeBlock,image,table,horizontalRule'

    this.parseToolbarConfig(toolbarConfig)
  }

  private parseToolbarConfig(config: string): void {
    const groups = config.split('|')

    groups.forEach(group => {
      const pluginNames = group
        .split(',')
        .map(name => name.trim())
        .filter(name => name)

      if (pluginNames.length > 0) {
        const groupElement = this.createToolbarGroup(pluginNames)
        this.toolbarContainer.appendChild(groupElement)
      }
    })
  }

  private createToolbarGroup(pluginNames: string[]): HTMLElement {
    const group = document.createElement('div')
    group.className = 'toolbar-group'

    pluginNames.forEach(pluginName => {
      const PluginClass = this.toolbarPlugins.get(pluginName)
      if (PluginClass) {
        const plugin = new PluginClass(this)
        const button = plugin.createButton()
        group.appendChild(button)
      }
    })

    return group
  }

  private applyTheme(): void {
    const resolvedTheme = this.resolveTheme()

    if (resolvedTheme === 'dark') {
      this.container.classList.add('dark-theme')
    } else {
      this.container.classList.remove('dark-theme')
    }

    // Listen for system theme changes when in auto mode
    if (this.options.theme === 'auto') {
      this.setupThemeListener()
    }
  }

  private resolveTheme(): 'light' | 'dark' {
    if (this.options.theme === 'auto') {
      // Use CSS media query to detect system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    }
    return this.options.theme || 'light'
  }

  private setupThemeListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    // Listen for changes in system theme preference
    const handleThemeChange = () => {
      if (this.options.theme === 'auto') {
        this.applyTheme()
      }
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleThemeChange)
    }
  }

  // Public method to change theme dynamically
  public setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.options.theme = theme
    this.applyTheme()
  }

  private updateToolbarState(): void {
    // Update toolbar button states based on current selection
    this.toolbarContainer.querySelectorAll('.toolbar-button').forEach(button => {
      const plugin = (button as any)._plugin
      if (plugin && plugin.isActive) {
        if (plugin.isActive()) {
          button.classList.add('active')
        } else {
          button.classList.remove('active')
        }
      }
    })
  }

  // Floating toolbar methods
  private handleFloatingToolbarVisibility(): void {
    if (!this.view || !this.options.floatingToolbar) {
      return
    }

    // Clear existing timeout
    if (this.selectionTimeout) {
      clearTimeout(this.selectionTimeout)
    }

    // Delay to allow selection to stabilize
    this.selectionTimeout = window.setTimeout(() => {
      this.updateFloatingToolbarVisibility()
    }, 100)
  }

  private updateFloatingToolbarVisibility(): void {
    if (!this.view || !this.options.floatingToolbar) {
      return
    }

    const selection = this.view.state.selection
    const {from, to, empty} = selection

    // Show toolbar if there's a non-empty selection
    if (!empty && from !== to) {
      this.showFloatingToolbar()
      this.positionFloatingToolbar()
    } else {
      this.hideFloatingToolbar()
    }
  }

  private showFloatingToolbar(): void {
    if (!this.options.floatingToolbar || this.isToolbarVisible) {
      return
    }

    this.isToolbarVisible = true
    this.toolbarContainer.style.visibility = 'visible'
    this.toolbarContainer.style.opacity = '1'
    this.toolbarContainer.style.transform = 'translateY(0)'
  }

  private hideFloatingToolbar(): void {
    if (!this.options.floatingToolbar || !this.isToolbarVisible) {
      return
    }

    this.isToolbarVisible = false
    this.toolbarContainer.style.opacity = '0'
    this.toolbarContainer.style.visibility = 'hidden'
    this.toolbarContainer.style.transform = 'translateY(-10px)'
  }

  private positionFloatingToolbar(): void {
    if (!this.view || !this.options.floatingToolbar || !this.isToolbarVisible) {
      return
    }

    const selection = this.view.state.selection
    const {from, to} = selection

    // Get the DOM coordinates for the selection
    const start = this.view.coordsAtPos(from)
    const end = this.view.coordsAtPos(to)

    // Get the editor container bounds
    const containerRect = this.container.getBoundingClientRect()

    // Calculate toolbar position
    const selectionTop = Math.min(start.top, end.top)
    const selectionLeft = (start.left + end.left) / 2

    // Position toolbar above the selection
    const toolbarHeight = this.toolbarContainer.offsetHeight || 50
    const toolbarWidth = this.toolbarContainer.offsetWidth || 200

    let top = selectionTop - containerRect.top - toolbarHeight - 10
    let left = selectionLeft - containerRect.left - toolbarWidth / 2

    // Ensure toolbar stays within container bounds
    const minLeft = 10
    const maxLeft = containerRect.width - toolbarWidth - 10
    left = Math.max(minLeft, Math.min(left, maxLeft))

    // If toolbar would be above the container, position it below the selection
    if (top < 10) {
      const selectionBottom = Math.max(start.bottom, end.bottom)
      top = selectionBottom - containerRect.top + 10
    }

    this.toolbarContainer.style.position = 'absolute'
    this.toolbarContainer.style.top = `${top}px`
    this.toolbarContainer.style.left = `${left}px`
    this.toolbarContainer.style.zIndex = '1000'
  }

  // Public method to toggle floating toolbar
  public setFloatingToolbar(enabled: boolean): void {
    this.options.floatingToolbar = enabled

    if (enabled) {
      this.container.classList.add('floating-toolbar-enabled')
      this.toolbarContainer.classList.add('floating-toolbar')
      this.hideFloatingToolbar() // Start hidden
    } else {
      this.container.classList.remove('floating-toolbar-enabled')
      this.toolbarContainer.classList.remove('floating-toolbar')
      this.toolbarContainer.style.position = ''
      this.toolbarContainer.style.top = ''
      this.toolbarContainer.style.left = ''
      this.toolbarContainer.style.zIndex = ''
      this.toolbarContainer.style.opacity = ''
      this.toolbarContainer.style.visibility = ''
      this.toolbarContainer.style.transform = ''
    }
  }

  // Height configuration methods
  private applyHeightConfiguration(): void {
    if (!this.view?.dom || !this.editorContainer) {
      return
    }

    const proseMirrorElement = this.view.dom

    // Set default values
    const autoResize = this.options.autoResize !== false // default true
    const overflowY = this.options.overflowY || 'auto'

    // Apply height styles to the ProseMirror element
    if (this.options.height) {
      // Fixed height mode
      proseMirrorElement.style.height = this.options.height
      proseMirrorElement.style.minHeight = ''
      proseMirrorElement.style.maxHeight = ''
      proseMirrorElement.style.overflowY = overflowY
    } else {
      // Dynamic height mode
      if (this.options.minHeight) {
        proseMirrorElement.style.minHeight = this.options.minHeight
      } else {
        // Keep default min-height from CSS
        proseMirrorElement.style.minHeight = ''
      }

      if (this.options.maxHeight && !autoResize) {
        proseMirrorElement.style.maxHeight = this.options.maxHeight
        proseMirrorElement.style.overflowY = overflowY
      } else if (this.options.maxHeight && autoResize) {
        // In auto-resize mode with maxHeight, still set maxHeight but allow growth
        proseMirrorElement.style.maxHeight = this.options.maxHeight
        proseMirrorElement.style.overflowY = overflowY
      } else {
        proseMirrorElement.style.maxHeight = ''
        proseMirrorElement.style.overflowY = autoResize ? 'visible' : overflowY
      }

      if (!autoResize && !this.options.height) {
        // Set a default height when not auto-resizing and no fixed height
        proseMirrorElement.style.height = this.options.minHeight || '300px'
      } else {
        proseMirrorElement.style.height = ''
      }
    }

    // Add CSS classes for styling hooks
    this.container.classList.toggle('editor-fixed-height', !!this.options.height)
    this.container.classList.toggle(
      'editor-auto-resize',
      autoResize && !this.options.height
    )
    this.container.classList.toggle('editor-overflow-auto', overflowY === 'auto')
    this.container.classList.toggle(
      'editor-overflow-scroll',
      overflowY === 'scroll'
    )
    this.container.classList.toggle(
      'editor-overflow-hidden',
      overflowY === 'hidden'
    )
  }

  // Public method to update height configuration
  public setHeightConfiguration(options: {
    minHeight?: string
    maxHeight?: string
    height?: string
    autoResize?: boolean
    overflowY?: 'auto' | 'scroll' | 'hidden'
  }): void {
    // Update options
    Object.assign(this.options, options)

    // Reapply height configuration
    this.applyHeightConfiguration()
  }

  public getMarkdown(): string {
    return this.serializeMarkdown()
  }

  public getDocument(): ProseMirrorNode | null {
    return this.view?.state.doc || null
  }

  // Enhanced parsing method using object builder pattern
  private parseMarkdown(markdown: string): ProseMirrorNode | null {
    try {
      // Use the new object-based parser instead of HTML parsing
      return this.objectParser.parseToObjects(markdown)
    } catch (error) {
      console.error('Error parsing markdown with object parser:', error)

      // Fallback to the ProseMirror markdown parser
      try {
        return this.markdownParser.parse(markdown)
      } catch (fallbackError) {
        console.error('Fallback parser also failed:', fallbackError)
        return null
      }
    }
  }

  // Enhanced serialization using object builder pattern
  private serializeMarkdown(): string {
    try {
      const doc = this.getDocument()
      if (!doc) {
        return ''
      }

      // Use the new object-based serializer
      return this.objectParser.serializeFromObjects(doc)
    } catch (error) {
      console.error('Error serializing with object parser:', error)

      // Fallback to standard serializer
      return this.markdownSerializer.serialize(
        this.getDocument() || this.schema.node('doc')
      )
    }
  }

  private createObjectParser(): MarkdownObjectParser {
    return new ProseMirrorObjectParser(
      this.schema,
      this.markdownIt,
      this.debug.bind(this)
    )
  }

  public setContent(markdown: string): void {
    try {
      const doc = this.parseMarkdown(markdown)
      if (doc && this.view) {
        const newState = EditorState.create({
          doc,
          schema: this.schema,
          plugins: this.view.state.plugins,
        })
        this.view.updateState(newState)
      }
    } catch (error) {
      console.error('Error setting markdown content:', error)
    }
  }

  // Focus and blur methods
  public focus(): void {
    if (this.view) {
      this.view.focus()
    }
  }

  public blur(): void {
    if (this.view?.dom) {
      this.view.dom.blur()
    }
  }

  public isFocused(): boolean {
    if (!this.view) {
      return false
    }
    return this.view.hasFocus()
  }

  // View mode toggle method
  public toggleViewMode(): void {
    const viewModePlugin = this.toolbarPlugins.get('viewMode')
    if (viewModePlugin) {
      const plugin = new viewModePlugin(this)
      if (plugin && typeof plugin.execute === 'function') {
        plugin.execute()
      }
    }
  }

  public destroy(): void {
    // Clear any timeouts
    if (this.selectionTimeout) {
      clearTimeout(this.selectionTimeout)
    }

    // Destroy the ProseMirror view
    if (this.view) {
      this.view.destroy()
      this.view = null
    }

    // Clear the container
    if (this.container) {
      this.container.innerHTML = ''
    }

    // Clear references
    this.state = null
  }

  private configureMarkdownIt(): void {
    // Configure markdown-it with all major plugins for full feature support
    this.markdownIt = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      breaks: false,
      langPrefix: 'language-'
    })
      // .use(emoji)
      .use(sub)
      .use(sup)
      .use(footnote)
      .use(deflist)
      .use(abbr)
      // .use(container, 'warning')
      // .use(container, 'info')
      // .use(container, 'spoiler')
      .use(mark)
      .use(taskLists, {enabled: true, label: true, labelAfter: true})
      .use(toc, {
        includeLevel: [1, 2, 3, 4, 5, 6],
        containerClass: 'table-of-contents',
        markerPattern: /^\[\[toc\]\]/im
      })
  }

  private applySyntaxHighlighting(element: Element): void {
    // Apply syntax highlighting to code blocks
    const codeBlocks = element.querySelectorAll('pre code')
    codeBlocks.forEach(block => {
      // Basic syntax highlighting placeholder
      block.classList.add('hljs')
    })
  }
}

// New ProseMirror Object Parser class
class ProseMirrorObjectParser implements MarkdownObjectParser {
  private schema: Schema
  private markdownIt: MarkdownIt
  private tokenHandlers: Map<string, TokenHandler>
  private debug: (message: string, ...args: any[]) => void

  constructor(
    schema: Schema,
    markdownIt: MarkdownIt,
    debug?: (message: string, ...args: any[]) => void
  ) {
    this.schema = schema
    this.markdownIt = markdownIt || new MarkdownIt('commonmark')
    this.tokenHandlers = this.createTokenHandlers()
    this.debug = debug || (() => {
    }) // No-op if no debug function provided
  }

  private createTokenHandlers(): Map<string, TokenHandler> {
    const handlers = new Map<string, TokenHandler>()

    // Block-level token handlers
    handlers.set('paragraph_open', {
      type: 'node',
      name: 'paragraph',
    })

    handlers.set('heading_open', {
      type: 'node',
      name: 'heading',
      getAttrs: token => ({level: parseInt(token.tag.slice(1))}),
    })

    handlers.set('blockquote_open', {
      type: 'node',
      name: 'blockquote',
    })

    handlers.set('code_block', {
      type: 'node',
      name: 'code_block',
      getAttrs: token => ({params: token.info || ''}),
    })

    handlers.set('fence', {
      type: 'node',
      name: 'code_block',
      getAttrs: token => ({params: token.info || ''}),
    })

    handlers.set('bullet_list_open', {
      type: 'node',
      name: 'bullet_list',
    })

    handlers.set('ordered_list_open', {
      type: 'node',
      name: 'ordered_list',
      getAttrs: token => ({
        order: parseInt(token.attrGet('start')) || 1,
      }),
    })

    handlers.set('list_item_open', {
      type: 'node',
      name: 'list_item',
    })

    handlers.set('hr', {
      type: 'node',
      name: 'horizontal_rule',
    })

    // Inline token handlers
    handlers.set('strong_open', {
      type: 'mark',
      name: 'strong',
    })

    handlers.set('em_open', {
      type: 'mark',
      name: 'em',
    })

    handlers.set('code_inline', {
      type: 'mark',
      name: 'code',
    })

    handlers.set('link_open', {
      type: 'mark',
      name: 'link',
      getAttrs: token => ({
        href: token.attrGet('href'),
        title: token.attrGet('title') || null,
      }),
    })

    handlers.set('s_open', {
      type: 'mark',
      name: 'strikethrough',
    })

    // Add handlers for markdown-it plugins
    handlers.set('mark_open', {
      type: 'mark',
      name: 'mark',
    })

    handlers.set('footnote_ref', {
      type: 'node',
      name: 'footnote_ref',
      getAttrs: token => ({
        id: token.attrGet('id') || '',
        label: token.meta?.label || '',
      }),
    })

    handlers.set('footnote_block_open', {
      type: 'node',
      name: 'footnote_block',
    })

    handlers.set('footnote_open', {
      type: 'node',
      name: 'footnote',
      getAttrs: token => ({
        id: token.attrGet('id') || '',
        label: token.meta?.label || '',
      }),
    })

    handlers.set('sub_open', {
      type: 'mark',
      name: 'subscript',
    })

    handlers.set('sup_open', {
      type: 'mark',
      name: 'superscript',
    })

    handlers.set('toc_open', {
      type: 'node',
      name: 'table_of_contents',
    })

    return handlers
  }

  parseToObjects(markdown: string): ProseMirrorNode {
    this.debug('Parsing markdown:', markdown)

    // Parse markdown to tokens using markdown-it
    const tokens = this.markdownIt.parse(markdown, {})
    this.debug('Generated tokens:', tokens.length, 'tokens')

    // Convert tokens to ProseMirror objects
    const content = this.tokensToObjects(tokens)

    // Create document node
    const doc = this.schema.node('doc', null, content)
    this.debug('Created document with', content.childCount, 'nodes')
    return doc
  }

  private tokensToObjects(tokens: any[]): Fragment {
    const nodes: ProseMirrorNode[] = []

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      this.debug('Processing token:', token.type, token.tag || '')

      // Handle table of contents marker
      if (token.type === 'toc_open' || (token.type === 'paragraph_open' &&
          tokens[i + 1]?.type === 'inline' &&
          tokens[i + 1]?.content?.includes('[[toc]]'))) {
        if (this.schema.nodes.table_of_contents) {
          const tocNode = this.schema.nodes.table_of_contents.create()
          nodes.push(tocNode)
          this.debug('Created table of contents node')
        }
        // Skip the related tokens
        if (token.type === 'paragraph_open') {
          i += 2 // Skip inline and closing paragraph tokens
        }
        continue
      }

      // Handle different token types
      if (token.type === 'heading_open') {
        // Find the corresponding inline content and closing token
        const level = parseInt(token.tag.slice(1))
        const inlineToken = tokens[i + 1]
        const closingToken = tokens[i + 2]

        if (inlineToken && inlineToken.type === 'inline' && inlineToken.content) {
          const content = this.parseInlineContent(inlineToken.content, inlineToken.children || [])
          const headingNode = this.schema.nodes.heading.create({level}, content)
          nodes.push(headingNode)
          this.debug('Created heading node level', level, ':', inlineToken.content)
        }

        // Skip the next two tokens (inline and closing)
        i += 2
        continue
      }

      if (token.type === 'paragraph_open') {
        // Find the corresponding inline content and closing token
        const inlineToken = tokens[i + 1]
        const closingToken = tokens[i + 2]

        if (inlineToken && inlineToken.type === 'inline' && inlineToken.content) {
          // Skip if this is a table of contents paragraph
          if (inlineToken.content.includes('[[toc]]')) {
            i += 2
            continue
          }

          const content = this.parseInlineContent(inlineToken.content, inlineToken.children || [])
          const paragraphNode = this.schema.nodes.paragraph.create(null, content)
          nodes.push(paragraphNode)
          this.debug('Created paragraph node:', inlineToken.content.substring(0, 50) + '...')
        }

        // Skip the next two tokens (inline and closing)
        i += 2
        continue
      }

      // Handle blockquotes - collect content until closing
      if (token.type === 'blockquote_open') {
        const blockquoteContent: ProseMirrorNode[] = []
        i++ // Move past opening token

        while (i < tokens.length && tokens[i].type !== 'blockquote_close') {
          if (tokens[i].type === 'paragraph_open') {
            const inlineToken = tokens[i + 1]
            if (inlineToken && inlineToken.type === 'inline' && inlineToken.content) {
              blockquoteContent.push(
                this.schema.nodes.paragraph.create(null, [
                  this.schema.text(inlineToken.content),
                ])
              )
            }
            i += 2 // Skip inline and closing paragraph tokens
          }
          i++
        }

        if (blockquoteContent.length > 0) {
          const blockquoteNode = this.schema.nodes.blockquote.create(
            null,
            blockquoteContent
          )
          nodes.push(blockquoteNode)
          this.debug(
            'Created blockquote node with',
            blockquoteContent.length,
            'paragraphs'
          )
        }
        continue
      }

      // Handle bullet lists
      if (token.type === 'bullet_list_open') {
        const listItems: ProseMirrorNode[] = []
        i++ // Move past opening token

        while (i < tokens.length && tokens[i].type !== 'bullet_list_close') {
          if (tokens[i].type === 'list_item_open') {
            i++ // Move past list item open
            const itemContent: ProseMirrorNode[] = []

            while (i < tokens.length && tokens[i].type !== 'list_item_close') {
              if (tokens[i].type === 'paragraph_open') {
                const inlineToken = tokens[i + 1]
                if (
                  inlineToken &&
                  inlineToken.type === 'inline' &&
                  inlineToken.content
                ) {
                  itemContent.push(
                    this.schema.nodes.paragraph.create(null, [
                      this.schema.text(inlineToken.content),
                    ])
                  )
                }
                i += 2 // Skip inline and closing paragraph tokens
              } else {
                i++
              }
            }

            if (itemContent.length > 0) {
              listItems.push(this.schema.nodes.list_item.create(null, itemContent))
            }
          } else {
            i++
          }
        }

        if (listItems.length > 0) {
          const listNode = this.schema.nodes.bullet_list.create(null, listItems)
          nodes.push(listNode)
          this.debug('Created bullet list with', listItems.length, 'items')
        }
        continue
      }

      // Handle ordered lists
      if (token.type === 'ordered_list_open') {
        const listItems: ProseMirrorNode[] = []
        i++ // Move past opening token

        while (i < tokens.length && tokens[i].type !== 'ordered_list_close') {
          if (tokens[i].type === 'list_item_open') {
            i++ // Move past list item open
            const itemContent: ProseMirrorNode[] = []

            while (i < tokens.length && tokens[i].type !== 'list_item_close') {
              if (tokens[i].type === 'paragraph_open') {
                const inlineToken = tokens[i + 1]
                if (
                  inlineToken &&
                  inlineToken.type === 'inline' &&
                  inlineToken.content
                ) {
                  itemContent.push(
                    this.schema.nodes.paragraph.create(null, [
                      this.schema.text(inlineToken.content),
                    ])
                  )
                }
                i += 2 // Skip inline and closing paragraph tokens
              } else {
                i++
              }
            }

            if (itemContent.length > 0) {
              listItems.push(this.schema.nodes.list_item.create(null, itemContent))
            }
          } else {
            i++
          }
        }

        if (listItems.length > 0) {
          const start = tokens[i - 1].attrs.start || 1
          const listNode = this.schema.nodes.ordered_list.create({order: start}, listItems)
          nodes.push(listNode)
          this.debug('Created ordered list with', listItems.length, 'items')
        }
        continue
      }

      if (token.type === 'code_block' || token.type === 'fence') {
        const params = token.info || ''
        const content = token.content || ''
        const codeBlockNode = this.schema.nodes.code_block.create(
          {params},
          content ? [this.schema.text(content)] : []
        )
        nodes.push(codeBlockNode)
        this.debug('Created code block node with language:', params || 'none')
        continue
      }

      if (token.type === 'hr') {
        const hrNode = this.schema.nodes.horizontal_rule.create()
        nodes.push(hrNode)
        this.debug('Created horizontal rule node')
        continue
      }
    }

    // Ensure we have at least one node
    if (nodes.length === 0) {
      this.debug('No nodes created, adding empty paragraph')
      nodes.push(this.schema.nodes.paragraph.create())
    }

    this.debug('Final result:', nodes.length, 'nodes created')
    return Fragment.from(nodes)
  }

  // New method to parse inline content with markdown-it features
  private parseInlineContent(content: string, children: any[]): ProseMirrorNode[] {
    const result: ProseMirrorNode[] = []

    if (children && children.length > 0) {
      // Process children tokens for inline elements
      for (const child of children) {
        if (child.type === 'text') {
          result.push(this.schema.text(child.content))
        } else if (child.type === 'footnote_ref') {
          if (this.schema.nodes.footnote_ref) {
            const footnoteNode = this.schema.nodes.footnote_ref.create({
              id: child.meta?.id || '',
              label: child.meta?.label || child.content || ''
            })
            result.push(footnoteNode)
          } else {
            // Fallback to text if schema doesn't support footnotes
            result.push(this.schema.text(`[^${child.meta?.label || child.content}]`))
          }
        } else if (child.type === 'mark_open') {
          // Handle highlighted text
          const textContent = this.getTextFromChildren(children, children.indexOf(child))
          if (textContent && this.schema.marks.mark) {
            const markMark = this.schema.marks.mark.create()
            result.push(this.schema.text(textContent, [markMark]))
          }
        } else if (child.type === 'sub_open') {
          // Handle subscript
          const textContent = this.getTextFromChildren(children, children.indexOf(child))
          if (textContent && this.schema.marks.subscript) {
            const subMark = this.schema.marks.subscript.create()
            result.push(this.schema.text(textContent, [subMark]))
          }
        } else if (child.type === 'sup_open') {
          // Handle superscript
          const textContent = this.getTextFromChildren(children, children.indexOf(child))
          if (textContent && this.schema.marks.superscript) {
            const supMark = this.schema.marks.superscript.create()
            result.push(this.schema.text(textContent, [supMark]))
          }
        } else if (child.type === 'strong_open') {
          const textContent = this.getTextFromChildren(children, children.indexOf(child))
          if (textContent) {
            const strongMark = this.schema.marks.strong.create()
            result.push(this.schema.text(textContent, [strongMark]))
          }
        } else if (child.type === 'em_open') {
          const textContent = this.getTextFromChildren(children, children.indexOf(child))
          if (textContent) {
            const emMark = this.schema.marks.em.create()
            result.push(this.schema.text(textContent, [emMark]))
          }
        }
      }
    } else {
      // Fallback: parse content as plain text with regex for basic features
      result.push(...this.parseContentWithRegex(content))
    }

    return result.length > 0 ? result : [this.schema.text(content)]
  }

  // Helper method to get text content from children tokens
  private getTextFromChildren(children: any[], startIndex: number): string {
    for (let i = startIndex + 1; i < children.length; i++) {
      const child = children[i]
      if (child.type === 'text') {
        return child.content
      }
      if (child.type.endsWith('_close')) {
        break
      }
    }
    return ''
  }

  // Fallback method to parse content with regex when children tokens aren't available
  private parseContentWithRegex(content: string): ProseMirrorNode[] {
    const result: ProseMirrorNode[] = []
    let remaining = content

    // Handle footnotes [^1]
    remaining = remaining.replace(/\[\^([^\]]+)\]/g, (match, label) => {
      if (this.schema.nodes.footnote_ref) {
        const footnoteNode = this.schema.nodes.footnote_ref.create({
          id: `fn${label}`,
          label: label
        })
        result.push(footnoteNode)
        return ''
      }
      return match
    })

    // Handle highlighted text ==text==
    remaining = remaining.replace(/==(.*?)==/g, (match, text) => {
      if (this.schema.marks.mark) {
        const markMark = this.schema.marks.mark.create()
        result.push(this.schema.text(text, [markMark]))
        return ''
      }
      return match
    })

    // Handle subscript ~text~
    remaining = remaining.replace(/~([^~]+)~/g, (match, text) => {
      if (this.schema.marks.subscript) {
        const subMark = this.schema.marks.subscript.create()
        result.push(this.schema.text(text, [subMark]))
        return ''
      }
      return match
    })

    // Handle superscript ^text^
    remaining = remaining.replace(/\^([^^]+)\^/g, (match, text) => {
      if (this.schema.marks.superscript) {
        const supMark = this.schema.marks.superscript.create()
        result.push(this.schema.text(text, [supMark]))
        return ''
      }
      return match
    })

    // Add remaining text if any
    if (remaining.trim()) {
      result.push(this.schema.text(remaining))
    }

    return result
  }

  serializeFromObjects(doc: ProseMirrorNode): string {
    try {
      // Convert ProseMirror document to markdown using a simple serializer
      return this.serializeNode(doc)
    } catch (error) {
      console.error('Error in serializeFromObjects:', error)
      return ''
    }
  }

  private serializeNode(node: ProseMirrorNode): string {
    const content = node.content
    let result = ''

    for (let i = 0; i < content.childCount; i++) {
      const child = content.child(i)
      result += this.serializeNodeToMarkdown(child, node, i)
    }

    return result.trim()
  }

  private serializeNodeToMarkdown(node: ProseMirrorNode, parent?: ProseMirrorNode, index?: number): string {
    switch (node.type.name) {
      case 'doc':
        return this.serializeNode(node)

      case 'paragraph':
        const paragraphContent = this.serializeInlineContent(node)
        return paragraphContent + '\n\n'

      case 'heading':
        const level = node.attrs.level || 1
        const headingContent = this.serializeInlineContent(node)
        return '#'.repeat(level) + ' ' + headingContent + '\n\n'

      case 'blockquote':
        const blockquoteLines = this.serializeNode(node).split('\n').filter(line => line.trim())
        return blockquoteLines.map(line => '> ' + line).join('\n') + '\n\n'

      case 'code_block':
        const params = node.attrs.params || ''
        const codeContent = node.textContent || ''
        return '```' + params + '\n' + codeContent + '\n```\n\n'

      case 'bullet_list':
        return this.serializeBulletList(node) + '\n'

      case 'ordered_list':
        return this.serializeOrderedList(node) + '\n'

      case 'list_item':
        return this.serializeNode(node)

      case 'horizontal_rule':
        return '---\n\n'

      case 'hard_break':
        return '\\\n'

      case 'text':
        return node.text || ''

      case 'footnote_ref':
        const label = node.attrs.label || node.attrs.id || ''
        return `[^${label}]`

      case 'table_of_contents':
        return '[[toc]]\n\n'

      default:
        // For unknown node types, try to serialize content
        if (node.content && node.content.childCount > 0) {
          return this.serializeNode(node)
        }
        return node.textContent || ''
    }
  }

  private serializeInlineContent(node: ProseMirrorNode): string {
    let result = ''

    for (let i = 0; i < node.content.childCount; i++) {
      const child = node.content.child(i)
      result += this.serializeInlineNode(child)
    }

    return result
  }

  private serializeInlineNode(node: ProseMirrorNode): string {
    let text = node.text || ''

    // Apply marks
    if (node.marks && node.marks.length > 0) {
      for (const mark of node.marks) {
        switch (mark.type.name) {
          case 'strong':
            text = '**' + text + '**'
            break
          case 'em':
            text = '*' + text + '*'
            break
          case 'code':
            text = '`' + text + '`'
            break
          case 'strikethrough':
            text = '~~' + text + '~~'
            break
          case 'mark':
            text = '==' + text + '=='
            break
          case 'subscript':
            text = '~' + text + '~'
            break
          case 'superscript':
            text = '^' + text + '^'
            break
          case 'link':
            const href = mark.attrs.href || ''
            const title = mark.attrs.title ? ` "${mark.attrs.title}"` : ''
            text = `[${text}](${href}${title})`
            break
        }
      }
    }

    return text
  }

  private serializeBulletList(node: ProseMirrorNode): string {
    const items: string[] = []

    for (let i = 0; i < node.content.childCount; i++) {
      const item = node.content.child(i)
      const itemContent = this.serializeNode(item).trim()
      const lines = itemContent.split('\n')
      const firstLine = '- ' + (lines[0] || '')
      const restLines = lines.slice(1).map(line => '  ' + line)
      items.push([firstLine, ...restLines].join('\n'))
    }

    return items.join('\n')
  }

  private serializeOrderedList(node: ProseMirrorNode): string {
    const items: string[] = []
    const start = node.attrs.order || 1

    for (let i = 0; i < node.content.childCount; i++) {
      const item = node.content.child(i)
      const itemContent = this.serializeNode(item).trim()
      const lines = itemContent.split('\n')
      const number = start + i
      const firstLine = `${number}. ` + (lines[0] || '')
      const indent = ' '.repeat(number.toString().length + 2)
      const restLines = lines.slice(1).map(line => indent + line)
      items.push([firstLine, ...restLines].join('\n'))
    }

    return items.join('\n')
  }
}
