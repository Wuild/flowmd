import { toggleMark } from 'prosemirror-commands'
import { Command } from 'prosemirror-state'

import icon from '../assets/icons/italic.svg'

import { BasePlugin } from './BasePlugin'
import { FlowMD } from '../editor/FlowMD'

export default class ItalicPlugin extends BasePlugin {
	constructor(editor: FlowMD) {
		super(editor)
		this.name = 'italic'
		this.title = 'Italic (Ctrl+I)'
		this.icon = icon
	}

	public execute(): void {
		const markType = this.editor.schema.marks.em
		if (this.editor.view) {
			toggleMark(markType)(this.editor.view.state, this.editor.view.dispatch)
			this.editor.view.focus()
		}
	}

	public isActive(): boolean {
		if (!this.editor.view) {
			return false
		}

		const markType = this.editor.schema.marks.em
		const { from, to } = this.editor.view.state.selection
		return this.editor.view.state.doc.rangeHasMark(from, to, markType)
	}

	public getKeymap(): { [key: string]: Command } {
		return {
			'Mod-i': (state, dispatch) => {
				return toggleMark(this.editor.schema.marks.em)(state, dispatch)
			},
		}
	}
}
