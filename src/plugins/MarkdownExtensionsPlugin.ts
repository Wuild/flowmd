import abbr from 'markdown-it-abbr'
import anchor from 'markdown-it-anchor'
import deflist from 'markdown-it-deflist'
import footnote from 'markdown-it-footnote'
import ins from 'markdown-it-ins'
import mark from 'markdown-it-mark'
import sub from 'markdown-it-sub'
import sup from 'markdown-it-sup'
import toc from 'markdown-it-table-of-contents'
import taskLists from 'markdown-it-task-lists'

import { BasePlugin, MarkdownItPluginConfig, SchemaContribution } from './BasePlugin'
import { FlowMD } from '../editor/FlowMD'

export default class MarkdownExtensionsPlugin extends BasePlugin {
	constructor(editor: FlowMD) {
		super(editor)
		this.name = 'markdownExtensions'
		this.title = 'Markdown Extensions'
		this.icon = ''
	}

	// Schema contributions for strikethrough, underline, etc.
	public getSchemaContribution(): SchemaContribution {
		return {
			nodes: {
				// Add footnote nodes
				footnote_ref: {
					group: 'inline',
					inline: true,
					attrs: {
						id: { default: '' },
						label: { default: '' }
					},
					parseDOM: [
						{
							tag: 'a.footnote-ref',
							getAttrs: (dom: any) => ({
								id: dom.getAttribute('id') || '',
								label: dom.textContent || ''
							})
						}
					],
					toDOM: (node: any) => [
						'a',
						{
							class: 'footnote-ref',
							id: node.attrs.id,
							href: `#fn${node.attrs.label}`
						},
						`[${node.attrs.label}]`
					]
				},
				footnote_block: {
					group: 'block',
					content: 'footnote+',
					parseDOM: [{ tag: 'div.footnotes' }],
					toDOM: () => ['div', { class: 'footnotes' }, 0]
				},
				footnote: {
					group: 'block',
					content: 'block+',
					attrs: {
						id: { default: '' },
						label: { default: '' }
					},
					parseDOM: [
						{
							tag: 'li.footnote-item',
							getAttrs: (dom: any) => ({
								id: dom.getAttribute('id') || '',
								label: dom.getAttribute('data-label') || ''
							})
						}
					],
					toDOM: (node: any) => [
						'li',
						{
							class: 'footnote-item',
							id: node.attrs.id,
							'data-label': node.attrs.label
						},
						0
					]
				},
				// Add table of contents node
				table_of_contents: {
					group: 'block',
					parseDOM: [{ tag: 'div.table-of-contents' }],
					toDOM: () => ['div', { class: 'table-of-contents' }, ['p', 'Table of Contents']]
				}
			},
			marks: {
				// Additional marks that aren't in basic schema
				strikethrough: {
					parseDOM: [
						{ tag: 's' },
						{ tag: 'del' },
						{ tag: 'strike' },
						{ style: 'text-decoration=line-through' },
					],
					toDOM: () => ['s', 0] as const,
				},
				// Add mark (highlighting) support
				mark: {
					parseDOM: [
						{ tag: 'mark' },
						{ style: 'background-color=yellow' }
					],
					toDOM: () => ['mark', 0] as const,
				},
				// Add subscript support
				subscript: {
					parseDOM: [{ tag: 'sub' }],
					toDOM: () => ['sub', 0] as const,
				},
				// Add superscript support
				superscript: {
					parseDOM: [{ tag: 'sup' }],
					toDOM: () => ['sup', 0] as const,
				}
			},
		}
	}

	public getMarkdownItPlugins(): MarkdownItPluginConfig[] {
		return [
			{ plugin: anchor, name: 'markdown-it-anchor' },
			{ plugin: toc, name: 'markdown-it-table-of-contents' },
			{ plugin: taskLists, name: 'markdown-it-task-lists' },
			{ plugin: footnote, name: 'markdown-it-footnote' },
			{ plugin: deflist, name: 'markdown-it-deflist' },
			{ plugin: abbr, name: 'markdown-it-abbr' },
			{ plugin: ins, name: 'markdown-it-ins' },
			{ plugin: mark, name: 'markdown-it-mark' },
			{ plugin: sub, name: 'markdown-it-sub' },
			{ plugin: sup, name: 'markdown-it-sup' },
		]
	}

	public configureMarkdownIt(markdownIt: unknown): void {
		// Enable strikethrough support in markdown-it
		;(markdownIt as { enable: (feature: string) => void }).enable('strikethrough')
	}

	// This plugin doesn't have a UI button
	public execute(): void {
		// No-op
	}
}
