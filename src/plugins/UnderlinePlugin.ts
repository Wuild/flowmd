import {
	BasePlugin,
	SchemaContribution,
	ParsingRule,
	SerializationRule,
} from './BasePlugin'
import { toggleMark } from 'prosemirror-commands'
import { Command } from 'prosemirror-state'
import { FlowMD } from '../editor/FlowMD'

export default class UnderlinePlugin extends BasePlugin {
	constructor(editor: FlowMD) {
		super(editor)
		this.name = 'underline'
		this.title = 'Underline (Ctrl+U)'
		this.icon =
			'<svg viewBox="0 0 448 512"><path d="M224 352c-70.7 0-128-57.3-128-128V64c0-17.7-14.3-32-32-32S32 46.3 32 64V224c0 106 86 192 192 192s192-86 192-192V64c0-17.7-14.3-32-32-32s-32 14.3-32 32V224c0 70.7-57.3 128-128 128zM32 448c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H32z"/></svg>'
	}

	public getSchemaContribution(): SchemaContribution {
		return {
			marks: {
				underline: {
					parseDOM: [{ tag: 'u' }, { style: 'text-decoration=underline' }],
					toDOM: () => ['u', 0] as const,
				},
			},
		}
	}

	public getParsingRules(): ParsingRule {
		return {
			preProcess: (markdown: string) => {
				// Handle underline with custom syntax: __{text}__ -> <u>text</u>
				return markdown.replace(/__\{([^}]+)\}__/g, '<u>$1</u>')
			},
		}
	}

	public getSerializationRules(): SerializationRule {
		return {
			marks: {
				underline: {
					open: '__',
					close: '__',
					mixable: true,
					expelEnclosingWhitespace: true,
				},
			},
		}
	}

	execute(): void {
		if (!this.editor.view) {
			return
		}
		const mark = this.editor.view.state.schema.marks.underline
		const command = toggleMark(mark)
		command(this.editor.view.state, this.editor.view.dispatch)
	}

	isActive(): boolean {
		if (!this.editor.view) {
			return false
		}
		const { from, to } = this.editor.view.state.selection
		const mark = this.editor.view.state.schema.marks.underline
		return this.editor.view.state.doc.rangeHasMark(from, to, mark)
	}

	public getKeymap(): { [key: string]: Command } {
		return {
			'Mod-u': (state, dispatch) => {
				return toggleMark(this.editor.schema.marks.underline)(state, dispatch)
			},
		}
	}
}
