import Icon from '../assets/icons/minus-solid.svg'
import { BasePlugin } from './BasePlugin'
import { FlowMD } from '../editor/FlowMD'

export default class HorizontalRulePlugin extends BasePlugin {
	constructor(editor: FlowMD) {
		super(editor)
		this.name = 'horizontalRule'
		this.title = 'Insert Horizontal Rule'
		this.icon = Icon
	}

	public execute(): void {
		const nodeType = this.editor.schema.nodes.horizontal_rule
		if (this.editor.view) {
			const { state, dispatch } = this.editor.view
			dispatch(state.tr.replaceSelectionWith(nodeType.create()))
			this.editor.view.focus()
		}
	}

	public isActive(): boolean {
		return false // Horizontal rule is not a toggleable state
	}
}
