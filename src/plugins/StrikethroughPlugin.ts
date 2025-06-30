import {toggleMark} from 'prosemirror-commands'
import {Command} from 'prosemirror-state'

import icon from '../assets/icons/strikethrough-solid.svg'
import {BasePlugin, SchemaContribution, SerializationRule} from './BasePlugin'
import {FlowMD} from '../editor/FlowMD'

export default class StrikethroughPlugin extends BasePlugin {
  constructor(editor: FlowMD) {
    super(editor)
    this.name = 'strikethrough'
    this.title = 'Strikethrough (Ctrl+Shift+X)'
    this.icon = icon
  }

  public getSchemaContribution(): SchemaContribution {
    return {
      marks: {
        strikethrough: {
          parseDOM: [
            {tag: 's'},
            {tag: 'del'},
            {tag: 'strike'},
            {style: 'text-decoration=line-through'},
          ],
          toDOM: () => ['s', 0] as const,
        },
      },
    }
  }

  public getSerializationRules(): SerializationRule {
    return {
      marks: {
        strikethrough: {
          open: '~~',
          close: '~~',
          mixable: true,
          expelEnclosingWhitespace: true,
        },
      },
    }
  }

  public configureMarkdownIt(markdownIt: unknown): void {
    // Enable strikethrough support in markdown-it
    ;(markdownIt as { enable: (feature: string) => void }).enable('strikethrough')
  }

  execute(): void {
    if (!this.editor.view) {
      return
    }
    const mark = this.editor.view.state.schema.marks.strikethrough
    const command = toggleMark(mark)
    command(this.editor.view.state, this.editor.view.dispatch)
  }

  isActive(): boolean {
    if (!this.editor.view) {
      return false
    }
    const {from, to} = this.editor.view.state.selection
    const mark = this.editor.view.state.schema.marks.strikethrough
    return this.editor.view.state.doc.rangeHasMark(from, to, mark)
  }

  public getKeymap(): { [key: string]: Command } {
    return {
      'Mod-Shift-x': (state, dispatch) => {
        return toggleMark(this.editor.schema.marks.strikethrough)(state, dispatch)
      },
    }
  }
}
