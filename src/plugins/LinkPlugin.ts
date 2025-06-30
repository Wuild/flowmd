import { Command } from 'prosemirror-state'

import icon from '../assets/icons/link-solid.svg'

import { BasePlugin } from './BasePlugin'
import { FlowMD } from '../editor/FlowMD'

export default class LinkPlugin extends BasePlugin {
	constructor(editor: FlowMD) {
		super(editor)
		this.name = 'link'
		this.title = 'Insert Link (Ctrl+K)'
		this.icon = icon
	}

	public execute(): void {
		// eslint-disable-next-line no-alert
		const href = prompt('Enter the URL:')
		if (href && this.editor.view) {
			const markType = this.editor.schema.marks.link
			if (!markType) {
				return
			}

			const { state, dispatch } = this.editor.view
			const { from, to } = state.selection

			if (from === to) {
				// No selection, insert link with text
				// eslint-disable-next-line no-alert
				const text = prompt('Enter link text:', href)
				if (text) {
					const node = state.schema.text(text, [markType.create({ href })])
					dispatch(state.tr.replaceSelectionWith(node, false))
				}
			} else {
				// Apply link to selection
				dispatch(state.tr.addMark(from, to, markType.create({ href })))
			}
		}
		if (this.editor.view) {
			this.editor.view.focus()
		}
	}

	public isActive(): boolean {
		if (!this.editor.view) {
			return false
		}

		const markType = this.editor.schema.marks.link
		if (!markType) {
			return false
		}

		const { from, to } = this.editor.view.state.selection
		return this.editor.view.state.doc.rangeHasMark(from, to, markType)
	}

	public getKeymap(): { [key: string]: Command } {
		return {
			'Mod-k': (state, dispatch) => {
				if (!dispatch) return false

				// eslint-disable-next-line no-alert
				const href = prompt('Enter the URL:')
				if (!href) return false

				const markType = state.schema.marks.link
				if (!markType) return false

				const { from, to } = state.selection

				if (from === to) {
					// No selection, insert link with text
					// eslint-disable-next-line no-alert
					const text = prompt('Enter link text:', href)
					if (text) {
						const node = state.schema.text(text, [markType.create({ href })])
						dispatch(state.tr.replaceSelectionWith(node, false))
						return true
					}
				} else {
					// Apply link to selection
					dispatch(state.tr.addMark(from, to, markType.create({ href })))
					return true
				}

				return false
			},
		}
	}
}
