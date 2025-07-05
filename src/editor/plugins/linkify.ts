import { Plugin, PluginKey } from 'prosemirror-state';
import { Base } from './base';
import type { Editor, EditorOptions } from '../types';

const linkifyPluginKey = new PluginKey('linkify');

export class Linkify extends Base {
	name = 'linkify';
	private urlRegex = /\b(?:(?:https?:\/\/)|(?:www\.))?[a-z0-9]+(?:[-.][a-z0-9]+)*\.[a-z]{2,}(?:\/[^\s]*)?/gi;
	private plugin?: Plugin;

	private createPlugin(): Plugin {
		return new Plugin({
			key: linkifyPluginKey,
			appendTransaction: (transactions, _oldState, newState) => {
				if (!transactions.some(tr => tr.docChanged)) return null;

				const tr = newState.tr;
				let modified = false;

				newState.doc.descendants((node, pos) => {
					if (node.type.name !== 'paragraph') return true;

					// Get the full text content of the paragraph
					const text = node.textContent;
					this.urlRegex.lastIndex = 0;

					let match;
					while ((match = this.urlRegex.exec(text)) !== null) {
						const start = pos + match.index + 1; // +1 for paragraph start
						const end = start + match[0].length;

						// Remove any existing links in the range
						tr.removeMark(start, end, newState.schema.marks.link);

						// Create new link for the entire URL
						const url = match[0];
						const href = url.match(/^https?:\/\//) ? url : `https://${url.startsWith('www.') ? '' : 'www.'}${url}`;
						tr.addMark(start, end, newState.schema.marks.link.create({ href }));
						modified = true;
					}
				});

				return modified ? tr : null;
			}
		});
	}

	init(editor: Editor, _options: EditorOptions): void {
		super.init(editor, _options);
		this.plugin = this.createPlugin();
	}

	getPlugin(): Plugin {
		if (!this.plugin) {
			this.plugin = this.createPlugin();
		}
		return this.plugin;
	}
}