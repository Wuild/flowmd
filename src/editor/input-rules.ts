/**
 * Input rules for real-time markdown parsing
 */

import { Schema } from 'prosemirror-model';
import {
	inputRules as createInputRules,
	InputRule,
	wrappingInputRule,
	textblockTypeInputRule
} from 'prosemirror-inputrules';

/**
 * Create input rules for block elements
 * @param schema The ProseMirror schema
 * @returns A plugin with input rules
 */
export function inputRules(schema: Schema) {
	const rules = [
		// Heading rules (# Heading)
		textblockTypeInputRule(/^(#{1,6})\s$/, schema.nodes.heading, match => ({ level: match[1].length })),

		// Blockquote rule (> Blockquote)
		wrappingInputRule(/^\s*>\s$/, schema.nodes.blockquote),

		// Ordered list rule (1. List item)
		wrappingInputRule(
			/^(\d+)\.\s$/,
			schema.nodes.ordered_list,
			match => ({ order: +match[1] }),
			(match, node) => node.childCount + node.attrs.order === +match[1]
		),

		// Bullet list rule (- List item)
		wrappingInputRule(/^\s*([-+*])\s$/, schema.nodes.bullet_list),

		// Code block rule (```code)
		textblockTypeInputRule(/^```$/, schema.nodes.code_block),

		// Horizontal rule (---)
		new InputRule(/^(?:---|___)\s$/, (state, _match, start, end) => {
			const tr = state.tr.delete(start, end);
			tr.replaceSelectionWith(schema.nodes.horizontal_rule.create());
			return tr;
		})
	];

	return createInputRules({ rules });
}

/**
 * Create input rules for inline marks
 * @param schema The ProseMirror schema
 * @returns A plugin with input rules
 */
export function markInputRules(schema: Schema) {
	const rules = [
		// Bold rule (**bold** or __bold__)
		markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, schema.marks.strong),

		// Real-time bold rule (__ or **)
		new InputRule(/(\*\*|__)$/, (state, match, start, end) => {
			const [, _marker] = match;
			const { tr } = state;

			// Delete the marker
			tr.delete(start, end);

			// Get the position after the cursor
			const $pos = tr.doc.resolve(start);

			// If we're at the end of a paragraph or there's no text after the cursor,
			// insert a placeholder and apply the mark
			if ($pos.node().nodeSize - $pos.parentOffset <= 1) {
				const text = 'write content';
				tr.insertText(text, start);
				tr.addMark(start, start + text.length, schema.marks.strong.create());

				// Set the selection after the inserted text
				tr.setSelection((state.selection.constructor as any).near(tr.doc.resolve(start + text.length)));
				return tr;
			}

			return null;
		}),

		// Italic rule (*italic* or _italic_) - but not when it's part of a double mark
		new InputRule(/(\*|_)([^*_]+)(\*|_)$/, (state, match, start, end) => {
			const [, openMark, content, closeMark] = match;
			const { tr } = state;

			// Check if this is part of a double mark
			const textBefore = state.doc.textBetween(Math.max(0, start - 1), start);
			const textAfter = state.doc.textBetween(end, Math.min(state.doc.content.size, end + 1));

			// If the opening mark is preceded by the same character or the closing mark is followed by the same character,
			// it's likely part of a double mark (** or __), so don't apply the italic rule
			if (textBefore === openMark || textAfter === closeMark) {
				return null;
			}

			if (content) {
				tr.delete(start, end);
				const insertedFrom = start;
				const insertedTo = start + content.length;
				tr.insertText(content, start);
				tr.addMark(insertedFrom, insertedTo, schema.marks.em.create());
				return tr;
			}

			return null;
		}),

		// Real-time italic rule (* or _)
		new InputRule(/(\*|_)$/, (state, match, start, end) => {
			const [, marker] = match;
			const { tr } = state;

			// Check if the previous character is also a marker (part of ** or __)
			// If start > 0, check the character before the current marker
			if (start > 0) {
				const prevPos = start - 1;
				const prevChar = state.doc.textBetween(prevPos, start);
				// If the previous character is the same marker, don't apply this rule
				// as it's likely part of a double marker for bold formatting
				if (prevChar === marker) {
					return null;
				}
			}

			// Delete the marker
			tr.delete(start, end);

			// Get the position after the cursor
			const $pos = tr.doc.resolve(start);

			// If we're at the end of a paragraph or there's no text after the cursor,
			// insert a placeholder and apply the mark
			if ($pos.node().nodeSize - $pos.parentOffset <= 1) {
				const text = 'write content';
				tr.insertText(text, start);
				tr.addMark(start, start + text.length, schema.marks.em.create());

				// Set the selection after the inserted text
				tr.setSelection((state.selection.constructor as any).near(tr.doc.resolve(start + text.length)));
				return tr;
			}

			return null;
		}),

		// Code rule (`code`)
		markInputRule(/`([^`]+)`$/, schema.marks.code),

		// Real-time code rule (`)
		new InputRule(/`$/, (state, _match, start, end) => {
			const { tr } = state;

			// Delete the marker
			tr.delete(start, end);

			// Get the position after the cursor
			const $pos = tr.doc.resolve(start);

			// If we're at the end of a paragraph or there's no text after the cursor,
			// insert a placeholder and apply the mark
			if ($pos.node().nodeSize - $pos.parentOffset <= 1) {
				const text = 'write content';
				tr.insertText(text, start);
				tr.addMark(start, start + text.length, schema.marks.code.create());

				// Set the selection after the inserted text
				tr.setSelection((state.selection.constructor as any).near(tr.doc.resolve(start + text.length)));
				return tr;
			}

			return null;
		}),

		// Strikethrough rule (~~strikethrough~~)
		markInputRule(/~~([^~]+)~~$/, schema.marks.strike),

		// Real-time strikethrough rule (~~)
		new InputRule(/~~$/, (state, _match, start, end) => {
			const { tr } = state;

			// Delete the marker
			tr.delete(start, end);

			// Get the position after the cursor
			const $pos = tr.doc.resolve(start);

			// If we're at the end of a paragraph or there's no text after the cursor,
			// insert a placeholder and apply the mark
			if ($pos.node().nodeSize - $pos.parentOffset <= 1) {
				const text = 'write content';
				tr.insertText(text, start);
				tr.addMark(start, start + text.length, schema.marks.strike.create());

				// Set the selection after the inserted text
				tr.setSelection((state.selection.constructor as any).near(tr.doc.resolve(start + text.length)));
				return tr;
			}

			return null;
		}),

		// Link rule ([text](url))
		new InputRule(/\[(.+)\]\((.+)\)$/, (state, match, start, end) => {
			const [, text, href] = match;
			const { tr } = state;

			if (text && href) {
				tr.delete(start, end);
				const linkMark = schema.marks.link.create({ href });
				tr.addMark(start, start + text.length, linkMark);
				tr.insertText(text, start);
				return tr;
			}

			return null;
		}),

		// Auto-linkify URLs when typing
		new InputRule(
			/(https?:\/\/[-\w.]+(?::\d+)?(?:\/[\w/_]*(?:\?[\w&=%]*)?(?:#[\w]*)?)?)(\s|$)/,
			(state, match, start, end) => {
				const [, url, suffix] = match;

				if (url) {
					const { tr } = state;

					// Delete the matched text
					tr.delete(start, end);

					// Insert the link
					const linkMark = schema.marks.link.create({ href: url });
					const linkNode = schema.text(url, [linkMark]);
					tr.insert(start, linkNode);

					// Add the suffix (space or end) back if it's a space
					if (suffix === ' ') {
						tr.insertText(' ', start + url.length);
					}

					return tr;
				}

				return null;
			}
		)
	];

	return createInputRules({ rules });
}

/**
 * Helper function to create mark input rules
 * @param regexp Regular expression to match
 * @param markType Mark type to apply
 * @returns An input rule
 */
function markInputRule(regexp: RegExp, markType: any) {
	return new InputRule(regexp, (state, match, start, end) => {
		const [, content] = match;
		const { tr } = state;

		if (content) {
			tr.delete(start, end);
			const insertedFrom = start;
			const insertedTo = start + content.length;
			tr.insertText(content, start);
			tr.addMark(insertedFrom, insertedTo, markType.create());
			return tr;
		}

		return null;
	});
}
