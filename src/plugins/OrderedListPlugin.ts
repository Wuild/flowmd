import { wrapInList } from 'prosemirror-schema-list'
import { Command } from 'prosemirror-state'

import icon from '../assets/icons/list-ol-solid.svg'

import { BasePlugin } from './BasePlugin'
import { FlowMD } from '../editor/FlowMD'

export default class OrderedListPlugin extends BasePlugin {
	constructor(editor: FlowMD) {
		super(editor)
		this.name = 'orderedList'
		this.title = 'Ordered List (Ctrl+Shift+7)'
		this.icon = icon
	}

	execute(): void {
		if (!this.editor.view) {
			return
		}

		const { state, dispatch } = this.editor.view
		const orderedListType = state.schema.nodes.ordered_list
		const command = wrapInList(orderedListType)
		command(state, dispatch)
	}

	isActive(): boolean {
		if (!this.editor.view) {
			return false
		}
		const { $from } = this.editor.view.state.selection

		// Check if we're inside an ordered list
		let depth = $from.depth
		while (depth > 0) {
			const node = $from.node(depth)
			if (node.type.name === 'ordered_list') {
				return true
			}
			depth--
		}
		return false
	}

	public getKeymap(): { [key: string]: Command } {
		return {
			'Mod-Shift-7': (state, dispatch) => {
				const nodeType = state.schema.nodes.ordered_list
				return wrapInList(nodeType)(state, dispatch)
			},
		}
	}
}
