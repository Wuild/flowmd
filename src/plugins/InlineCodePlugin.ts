import { toggleMark } from 'prosemirror-commands'
import { Command } from 'prosemirror-state'

import icon from '../assets/icons/code-solid.svg'
import { BasePlugin } from './BasePlugin'
import { FlowMD } from '../editor/FlowMD'

export default class InlineCodePlugin extends BasePlugin {
	constructor(editor: FlowMD) {
		super(editor)
		this.name = 'inlineCode'
		this.title = 'Inline Code (Ctrl+`)'
		this.icon = icon
	}

	public execute(): void {
		const markType = this.editor.schema.marks.code
		if (this.editor.view && markType) {
			toggleMark(markType)(this.editor.view.state, this.editor.view.dispatch)
			this.editor.view.focus()
		}
	}

	public isActive(): boolean {
		if (!this.editor.view) {
			return false
		}

		const markType = this.editor.schema.marks.code
		if (!markType) {
			return false
		}

		const { from, to } = this.editor.view.state.selection
		return this.editor.view.state.doc.rangeHasMark(from, to, markType)
	}

	public getKeymap(): { [key: string]: Command } {
		return {
			'Mod-`': (state, dispatch) => {
				return toggleMark(this.editor.schema.marks.code)(state, dispatch)
			},
		}
	}
}
