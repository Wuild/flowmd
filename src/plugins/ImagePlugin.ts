import { Command } from 'prosemirror-state'

import icon from '../assets/icons/image-solid.svg'
import { BasePlugin } from './BasePlugin'
import { FlowMD } from '../editor/FlowMD'

export default class ImagePlugin extends BasePlugin {
	constructor(editor: FlowMD) {
		super(editor)
		this.name = 'image'
		this.title = 'Insert Image (Ctrl+Shift+I)'
		this.icon = icon
	}

	public execute(): void {
		// eslint-disable-next-line no-alert
		const url = prompt('Enter image URL:')
		if (url && this.editor.view) {
			// eslint-disable-next-line no-alert
			const alt = prompt('Enter image description (alt text):', 'Image')
			// eslint-disable-next-line no-alert
			const title = prompt('Enter image title (optional):')

			let imageMarkdown = `![${alt || 'Image'}](${url}`
			if (title) {
				imageMarkdown += ` "${title}"`
			}
			imageMarkdown += ')'

			const { state, dispatch } = this.editor.view
			const node = state.schema.text(imageMarkdown)
			dispatch(state.tr.replaceSelectionWith(node, false))
			this.editor.view.focus()
		}
	}

	public isActive(): boolean {
		return false // Images are not toggleable
	}

	public getKeymap(): { [key: string]: Command } {
		return {
			'Mod-Shift-i': (state, dispatch) => {
				if (!dispatch) return false

				// eslint-disable-next-line no-alert
				const url = prompt('Enter image URL:')
				if (!url) return false

				// eslint-disable-next-line no-alert
				const alt = prompt('Enter image description (alt text):', 'Image')
				// eslint-disable-next-line no-alert
				const title = prompt('Enter image title (optional):')

				let imageMarkdown = `![${alt || 'Image'}](${url}`
				if (title) {
					imageMarkdown += ` "${title}"`
				}
				imageMarkdown += ')'

				const node = state.schema.text(imageMarkdown)
				dispatch(state.tr.replaceSelectionWith(node, false))
				return true
			},
		}
	}
}
