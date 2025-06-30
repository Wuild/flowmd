import { wrapIn } from 'prosemirror-commands'
import { Command } from 'prosemirror-state'

import icon from '../assets/icons/quote-left-solid.svg'

import { BasePlugin } from './BasePlugin'
import { FlowMD } from '../editor/FlowMD'

export default class BlockquotePlugin extends BasePlugin {
	constructor(editor: FlowMD) {
		super(editor)
		this.name = 'blockquote'
		this.title = 'Blockquote (Ctrl+Shift+9)'
		this.icon = icon
	}

	public execute(): void {
		const nodeType = this.editor.schema.nodes.blockquote
		if (this.editor.view) {
			wrapIn(nodeType)(this.editor.view.state, this.editor.view.dispatch)
			this.editor.view.focus()
		}
	}

	public isActive(): boolean {
		if (!this.editor.view) {
			return false
		}

		const { $from } = this.editor.view.state.selection
		return $from.parent.type === this.editor.schema.nodes.blockquote
	}

	public getKeymap(): { [key: string]: Command } {
		return {
			'Mod-Shift-9': (state, dispatch) => {
				return wrapIn(state.schema.nodes.blockquote)(state, dispatch)
			},
		}
	}
}
