/**
 * Markdown conversion utilities
 */

import { Node as ProseMirrorNode, Schema } from 'prosemirror-model';
import { MarkdownParser, MarkdownSerializer } from 'prosemirror-markdown';
import MarkdownIt from 'markdown-it';

/**
 * Create a markdown parser
 * @param schema The ProseMirror schema
 * @returns A markdown parser
 */

export function createMarkdownParser(schema: Schema): MarkdownParser {
	const md = MarkdownIt('commonmark', { html: false });
	// Enable strikethrough in markdown-it
	md.enable('strikethrough');

	// Create token handlers based on available schema nodes and marks
	const tokenHandlers: Record<string, any> = {};

	// Add block handlers for nodes that exist in the schema
	if (schema.nodes.blockquote) {
		tokenHandlers.blockquote = { block: 'blockquote' };
		tokenHandlers.blockquote_open = { block: 'blockquote' };
	}
	if (schema.nodes.paragraph) {
		tokenHandlers.paragraph = { block: 'paragraph' };
		tokenHandlers.paragraph_open = { block: 'paragraph' };
	}
	if (schema.nodes.list_item) {
		tokenHandlers.list_item = { block: 'list_item' };
		tokenHandlers.list_item_open = { block: 'list_item' };
	}
	if (schema.nodes.bullet_list) {
		tokenHandlers.bullet_list = { block: 'bullet_list' };
		tokenHandlers.bullet_list_open = { block: 'bullet_list' };
	}
	if (schema.nodes.ordered_list) {
		tokenHandlers.ordered_list = {
			block: 'ordered_list',
			getAttrs: (tok: any) => ({ order: +(tok.attrGet('start') ?? '1') || 1 })
		};
		tokenHandlers.ordered_list_open = {
			block: 'ordered_list',
			getAttrs: (tok: any) => ({ order: +(tok.attrGet('start') ?? '1') || 1 })
		};
	}
	if (schema.nodes.heading) {
		tokenHandlers.heading = { block: 'heading', getAttrs: (tok: any) => ({ level: +tok.tag.slice(1) }) };
		tokenHandlers.heading_open = { block: 'heading', getAttrs: (tok: any) => ({ level: +tok.tag.slice(1) }) };
	}
	if (schema.nodes.code_block) {
		tokenHandlers.code_block = { block: 'code_block', getAttrs: (tok: any) => ({ params: tok.info || '' }) };
		tokenHandlers.code_block_open = { block: 'code_block', getAttrs: (tok: any) => ({ params: tok.info || '' }) };
		tokenHandlers.fence = { block: 'code_block', getAttrs: (tok: any) => ({ params: tok.info || '' }) };
	}
	if (schema.nodes.horizontal_rule) tokenHandlers.hr = { node: 'horizontal_rule' };
	if (schema.nodes.image) {
		tokenHandlers.image = {
			node: 'image',
			getAttrs: (tok: any) => ({
				src: tok.attrGet('src'),
				title: tok.attrGet('title') || null,
				alt: tok.children?.[0]?.content || null
			})
		};
	}
	if (schema.nodes.hard_break) tokenHandlers.hardbreak = { node: 'hard_break' };

	// Add mark handlers for marks that exist in the schema
	if (schema.marks.em) {
		tokenHandlers.em = { mark: 'em' };
		tokenHandlers.em_open = { mark: 'em' };
	}
	if (schema.marks.strong) {
		tokenHandlers.strong = { mark: 'strong' };
		tokenHandlers.strong_open = { mark: 'strong' };
	}
	if (schema.marks.strike) {
		tokenHandlers.s = { mark: 'strike' };
		tokenHandlers.s_open = { mark: 'strike' };
	}
	if (schema.marks.link) {
		tokenHandlers.link = {
			mark: 'link',
			getAttrs: (tok: any) => ({
				href: tok.attrGet('href'),
				title: tok.attrGet('title') || null
			})
		};
		tokenHandlers.link_open = {
			mark: 'link',
			getAttrs: (tok: any) => ({
				href: tok.attrGet('href'),
				title: tok.attrGet('title') || null
			})
		};
	}
	if (schema.marks.code) {
		tokenHandlers.code_inline = { mark: 'code' };
		tokenHandlers.code_inline_open = { mark: 'code' };
	}

	return new MarkdownParser(schema, md, tokenHandlers);
}

/**
 * Create a markdown serializer
 * @param schema The ProseMirror schema
 * @returns A markdown serializer
 */
export function createMarkdownSerializer(schema: Schema): MarkdownSerializer {
	// Create node serializers based on available schema nodes
	const nodes: Record<string, any> = {
		// Text node is always required
		text(state: any, node: any) {
			if (node.text) {
				state.text(node.text);
			}
		}
	};

	// Add serializers for nodes that exist in the schema
	if (schema.nodes.blockquote) {
		nodes.blockquote = (state: any, node: any) => {
			state.wrapBlock('> ', null, node, () => state.renderContent(node));
		};
	}

	if (schema.nodes.code_block) {
		nodes.code_block = (state: any, node: any) => {
			state.write('```' + (node.attrs.params || '') + '\n');
			state.text(node.textContent, false);
			state.ensureNewLine();
			state.write('```');
			state.closeBlock(node);
		};
	}

	if (schema.nodes.heading) {
		nodes.heading = (state: any, node: any) => {
			state.write('#'.repeat(node.attrs.level) + ' ');
			state.renderInline(node);
			state.closeBlock(node);
		};
	}

	if (schema.nodes.horizontal_rule) {
		nodes.horizontal_rule = (state: any, node: any) => {
			state.write('---');
			state.closeBlock(node);
		};
	}

	if (schema.nodes.bullet_list) {
		nodes.bullet_list = (state: any, node: any) => {
			state.renderList(node, '  ', () => '- ');
		};
	}

	if (schema.nodes.ordered_list) {
		nodes.ordered_list = (state: any, node: any) => {
			const start = node.attrs.order || 1;
			let i = start;
			state.renderList(node, '  ', () => `${i++}. `);
		};
	}

	if (schema.nodes.list_item) {
		nodes.list_item = (state: any, node: any) => {
			state.renderContent(node);
		};
	}

	if (schema.nodes.paragraph) {
		nodes.paragraph = (state: any, node: any) => {
			state.renderInline(node);
			state.closeBlock(node);
		};
	}

	if (schema.nodes.image) {
		nodes.image = (state: any, node: any) => {
			state.write(
				`![${node.attrs.alt || ''}](${node.attrs.src}${node.attrs.title ? ` "${node.attrs.title}"` : ''})`
			);
		};
	}

	if (schema.nodes.hard_break) {
		nodes.hard_break = (state: any) => {
			state.write('\\\n');
		};
	}

	// Create mark serializers based on available schema marks
	const marks: Record<string, any> = {};

	// Add serializers for marks that exist in the schema
	if (schema.marks.em) {
		marks.em = {
			open: '*',
			close: '*',
			mixable: true,
			expelEnclosingWhitespace: true
		};
	}

	if (schema.marks.strong) {
		marks.strong = {
			open: '**',
			close: '**',
			mixable: true,
			expelEnclosingWhitespace: true
		};
	}

	if (schema.marks.strike) {
		marks.strike = {
			open: '~~',
			close: '~~',
			mixable: true,
			expelEnclosingWhitespace: true
		};
	}

	if (schema.marks.link) {
		marks.link = {
			open() {
				return '[';
			},
			close(_: any, mark: any) {
				return `](${mark.attrs.href}${mark.attrs.title ? ` "${mark.attrs.title}"` : ''})`;
			}
		};
	}

	if (schema.marks.code) {
		marks.code = {
			open: '`',
			close: '`',
			escape: false
		};
	}

	return new MarkdownSerializer(nodes, marks);
}

/**
 * Convert markdown to a ProseMirror document
 * @param schema The ProseMirror schema
 * @param markdown The markdown string
 * @returns A ProseMirror document node
 */
export function fromMarkdown(schema: Schema, markdown: string): ProseMirrorNode {
	const parser = createMarkdownParser(schema);
	return parser.parse(markdown);
}

/**
 * Convert a ProseMirror document to markdown
 * @param schema The ProseMirror schema
 * @param doc The ProseMirror document node
 * @returns A markdown string
 */
export function toMarkdown(schema: Schema, doc: ProseMirrorNode): string {
	const serializer = createMarkdownSerializer(schema);
	return serializer.serialize(doc);
}

/**
 * Convert a ProseMirror document to HTML
 * @param doc The ProseMirror document node
 * @returns An HTML string
 */
export function toHTML(doc: ProseMirrorNode): string {
	// Use DOMSerializer from prosemirror-model to convert the document to HTML
	const div = document.createElement('div');

	// Simple approach: convert to markdown and then to HTML using markdown-it
	const markdown = toMarkdown(doc.type.schema, doc);
	const md = MarkdownIt('commonmark', { html: false });
	div.innerHTML = md.render(markdown);

	return div.innerHTML;
}
