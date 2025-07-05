/**
 * ProseMirror schema definition for the Markdown editor
 */

import { Schema } from 'prosemirror-model';
import type { DOMOutputSpec } from 'prosemirror-model';

/**
 * Node types for the Markdown schema
 */
const nodes = {
	// The top level document
	doc: {
		content: 'block+'
	},

	// Paragraph node - a basic block of text
	paragraph: {
		content: 'inline*',
		group: 'block',
		parseDOM: [{ tag: 'p' }],
		toDOM(): DOMOutputSpec {
			return ['p', 0];
		}
	},

	// Blockquote node
	blockquote: {
		content: 'block+',
		group: 'block',
		defining: true,
		parseDOM: [{ tag: 'blockquote' }],
		toDOM(): DOMOutputSpec {
			return ['blockquote', 0];
		}
	},

	// Horizontal rule node
	horizontal_rule: {
		group: 'block',
		parseDOM: [{ tag: 'hr' }],
		toDOM(): DOMOutputSpec {
			return ['hr'];
		}
	},

	// Heading node with level attribute
	heading: {
		attrs: { level: { default: 1 } },
		content: 'inline*',
		group: 'block',
		defining: true,
		parseDOM: [
			{ tag: 'h1', attrs: { level: 1 } },
			{ tag: 'h2', attrs: { level: 2 } },
			{ tag: 'h3', attrs: { level: 3 } },
			{ tag: 'h4', attrs: { level: 4 } },
			{ tag: 'h5', attrs: { level: 5 } },
			{ tag: 'h6', attrs: { level: 6 } }
		],
		toDOM(node: any): DOMOutputSpec {
			return ['h' + node.attrs.level, 0];
		}
	},

	// Code block node
	code_block: {
		content: 'text*',
		marks: '',
		group: 'block',
		code: true,
		defining: true,
		attrs: { params: { default: '' } },
		parseDOM: [
			{
				tag: 'pre',
				preserveWhitespace: 'full' as const,
				getAttrs: (node: any) => ({
					params: (node instanceof HTMLElement && node.getAttribute('data-params')) || ''
				})
			}
		],
		toDOM(node: any): DOMOutputSpec {
			return ['pre', { 'data-params': node.attrs.params }, ['code', 0]];
		}
	},

	// Ordered list node
	ordered_list: {
		content: 'list_item+',
		group: 'block',
		attrs: { order: { default: 1 } },
		parseDOM: [
			{
				tag: 'ol',
				getAttrs: (node: any) => ({
					order: node instanceof HTMLElement && node.hasAttribute('start') ? +node.getAttribute('start')! : 1
				})
			}
		],
		toDOM(node: any): DOMOutputSpec {
			return ['ol', { start: node.attrs.order === 1 ? null : node.attrs.order }, 0];
		}
	},

	// Bullet list node
	bullet_list: {
		content: 'list_item+',
		group: 'block',
		parseDOM: [{ tag: 'ul' }],
		toDOM(): DOMOutputSpec {
			return ['ul', 0];
		}
	},

	// List item node
	list_item: {
		content: 'paragraph block*',
		defining: true,
		parseDOM: [{ tag: 'li' }],
		toDOM(): DOMOutputSpec {
			return ['li', 0];
		}
	},

	// Image node
	image: {
		inline: true,
		attrs: {
			src: {},
			alt: { default: null },
			title: { default: null }
		},
		group: 'inline',
		draggable: true,
		parseDOM: [
			{
				tag: 'img[src]',
				getAttrs: (node: any) =>
					node instanceof HTMLElement
						? {
								src: node.getAttribute('src'),
								alt: node.getAttribute('alt'),
								title: node.getAttribute('title')
							}
						: {}
			}
		],
		toDOM(node: any): DOMOutputSpec {
			return ['img', node.attrs];
		}
	},

	// Hard break node (line break)
	hard_break: {
		inline: true,
		group: 'inline',
		selectable: false,
		parseDOM: [{ tag: 'br' }],
		toDOM(): DOMOutputSpec {
			return ['br'];
		}
	},

	// Text node - represents plain text
	text: {
		group: 'inline'
	}
};

/**
 * Mark types for the Markdown schema
 */
const marks = {
	// Link mark
	link: {
		attrs: {
			href: {},
			title: { default: null }
		},
		inclusive: false,
		parseDOM: [
			{
				tag: 'a[href]',
				getAttrs: (node: any) =>
					node instanceof HTMLElement
						? {
								href: node.getAttribute('href'),
								title: node.getAttribute('title')
							}
						: {}
			}
		],
		toDOM(mark: any): DOMOutputSpec {
			return ['a', mark.attrs];
		}
	},

	// Emphasis mark
	em: {
		parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
		toDOM(): DOMOutputSpec {
			return ['em'];
		}
	},

	// // Strong mark
	strong: {
		parseDOM: [
			{ tag: 'strong' },
			{ tag: 'b' },
			{ style: 'font-weight=bold' },
			{ style: 'font-weight=500' },
			{ style: 'font-weight=600' },
			{ style: 'font-weight=700' },
			{ style: 'font-weight=800' },
			{ style: 'font-weight=900' }
		],
		toDOM(): DOMOutputSpec {
			return ['strong'];
		}
	},

	// Strikethrough mark
	strike: {
		parseDOM: [{ tag: 's' }, { tag: 'strike' }, { tag: 'del' }, { style: 'text-decoration=line-through' }],
		toDOM(): DOMOutputSpec {
			return ['s'];
		}
	},

	// Code mark
	code: {
		parseDOM: [{ tag: 'code' }],
		toDOM(): DOMOutputSpec {
			return ['code'];
		}
	}
};

/**
 * Create and export the schema
 */
export const schema = new Schema({ nodes, marks });
