import { wrapInList } from 'prosemirror-schema-list'
import { Command } from 'prosemirror-state'

import icon from '../assets/icons/list-ul-solid.svg'

import { BasePlugin } from './BasePlugin'
import { FlowMD } from '../editor/FlowMD'

export default class BulletListPlugin extends BasePlugin {
	constructor(editor: FlowMD) {
		super(editor)
		this.name = 'bulletList'
		this.title = 'Bullet List (Ctrl+Shift+8)'
		this.icon = icon
	}

	public execute(): void {
		const nodeType = this.editor.schema.nodes.bullet_list
		if (nodeType && this.editor.view) {
			wrapInList(nodeType)(this.editor.view.state, this.editor.view.dispatch)
			this.editor.view.focus()
		}
	}

	public isActive(): boolean {
		if (!this.editor.view) {
			return false
		}

		const nodeType = this.editor.schema.nodes.bullet_list
		if (!nodeType) {
			return false
		}

		const { $from } = this.editor.view.state.selection
		for (let d = $from.depth; d >= 0; d--) {
			const node = $from.node(d)
			if (node.type === nodeType) {
				return true
			}
		}
		return false
	}

	public getKeymap(): { [key: string]: Command } {
		return {
			'Mod-Shift-8': (state, dispatch) => {
				const nodeType = state.schema.nodes.bullet_list
				return wrapInList(nodeType)(state, dispatch)
			},
		}
	}
}
