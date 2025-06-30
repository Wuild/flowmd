import { toggleMark } from 'prosemirror-commands'
import { Command } from 'prosemirror-state'

import { BasePlugin } from './BasePlugin'
import icon from '../assets/icons/bold-solid.svg'
import { FlowMD } from '../editor/FlowMD'

export default class BoldPlugin extends BasePlugin {
	constructor(editor: FlowMD) {
		super(editor)
		this.name = 'bold'
		this.title = 'Bold (Ctrl+B)'
		this.icon = icon
	}

	public execute(): void {
		const markType = this.editor.schema.marks.strong
		if (this.editor.view) {
			toggleMark(markType)(this.editor.view.state, this.editor.view.dispatch)
			this.editor.view.focus()
		}
	}

	public isActive(): boolean {
		if (!this.editor.view) {
			return false
		}

		const markType = this.editor.schema.marks.strong
		const { from, to } = this.editor.view.state.selection
		return this.editor.view.state.doc.rangeHasMark(from, to, markType)
	}

	public getKeymap(): { [key: string]: Command } {
		return {
			'Mod-b': toggleMark(this.editor.schema.marks.strong),
		}
	}
}
