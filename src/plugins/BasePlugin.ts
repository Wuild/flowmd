import MarkdownIt from 'markdown-it'
import { NodeSpec, MarkSpec } from 'prosemirror-model'
import { Command } from 'prosemirror-state'

import { FlowMD } from '../editor/FlowMD'

export interface SchemaContribution {
	nodes?: { [name: string]: NodeSpec }
	marks?: { [name: string]: MarkSpec }
}

export interface MarkdownItPluginConfig {
	plugin: any
	name: string
	options?: any
}

export interface ParsingRule {
	// Custom pre-processing of markdown before markdown-it
	preProcess?: (markdown: string) => string
	// Custom post-processing of HTML after markdown-it
	postProcess?: (html: string) => string
}

export interface SerializationRule {
	nodes?: {
		[name: string]: (state: any, node: any, parent?: any, index?: number) => void
	}
	marks?: {
		[name: string]: {
			open: string | ((state: any, mark: any) => string)
			close: string | ((state: any, mark: any) => string)
			mixable?: boolean
			expelEnclosingWhitespace?: boolean
			escape?: boolean
		}
	}
}

export abstract class BasePlugin {
	protected editor: FlowMD
	protected name: string = ''
	protected title: string = ''
	protected icon: string = ''

	constructor(editor: FlowMD) {
		this.editor = editor
	}

	// Schema contributions
	public getSchemaContribution(): SchemaContribution {
		return {}
	}

	// Markdown-it plugin contributions
	public getMarkdownItPlugins(): MarkdownItPluginConfig[] {
		return []
	}

	// Custom parsing rules
	public getParsingRules(): ParsingRule {
		return {}
	}

	// Custom serialization rules
	public getSerializationRules(): SerializationRule {
		return {}
	}

	// Configure markdown-it instance (called after all plugins are added)
	public configureMarkdownIt(_markdownIt: MarkdownIt): void {
		// Override in subclasses if needed
	}

	public createButton(): HTMLButtonElement {
		const button = document.createElement('button')
		button.className = 'toolbar-button'
		button.type = 'button'
		button.title = this.title
		button.innerHTML = this.icon
		;(button as HTMLButtonElement & { _plugin: BasePlugin })._plugin = this

		button.addEventListener('click', (e: Event) => {
			e.preventDefault()
      e.stopPropagation()
			this.execute()
		})

		return button
	}

	public abstract execute(): void

	public isActive(): boolean {
		// Override in subclasses
		return false
	}

	public isEnabled(): boolean {
		// Override in subclasses
		return true
	}

	getToolbarButtons(): HTMLButtonElement[] {
		return []
	}

	// Keymap contributions - return keyboard shortcuts for this plugin
	public getKeymap(): { [key: string]: Command } {
		return {}
	}
}
