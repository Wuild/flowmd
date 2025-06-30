import {BasePlugin, SchemaContribution, SerializationRule} from './BasePlugin'
import {FlowMD} from '../editor/FlowMD'
import icon from '../assets/icons/table-solid.svg'

export default class TablePlugin extends BasePlugin {
  constructor(editor: FlowMD) {
    super(editor)
    this.name = 'table'
    this.title = 'Insert Table'
    this.icon = icon
  }

  public getSchemaContribution(): SchemaContribution {
    return {
      nodes: {
        table: {
          content: 'table_row+',
          tableRole: 'table',
          isolating: true,
          group: 'block',
          parseDOM: [{tag: 'table'}],
          toDOM: () => ['table', {class: 'prosemirror-table'}, ['tbody', 0]],
        },
        table_row: {
          content: 'table_cell+',
          tableRole: 'row',
          parseDOM: [{tag: 'tr'}],
          toDOM: () => ['tr', 0],
        },
        table_cell: {
          content: 'paragraph+',
          attrs: {
            colspan: {default: 1},
            rowspan: {default: 1},
            colwidth: {default: null},
          },
          tableRole: 'cell',
          isolating: true,
          parseDOM: [
            {
              tag: 'td',
              getAttrs: (node: HTMLElement) => ({
                colspan: parseInt(node.getAttribute('colspan') || '1'),
                rowspan: parseInt(node.getAttribute('rowspan') || '1'),
                colwidth:
                  node.getAttribute('data-colwidth')?.split(',').map(s => parseInt(s)) ||
                  null,
              }),
            },
          ],
          toDOM: (node: unknown) => {
            const nodeAttrs = (node as { attrs: Record<string, unknown> }).attrs
            const attrs: Record<string, string> = {}
            if (nodeAttrs.colspan !== 1) {
              attrs.colspan = String(nodeAttrs.colspan)
            }
            if (nodeAttrs.rowspan !== 1) {
              attrs.rowspan = String(nodeAttrs.rowspan)
            }
            if (nodeAttrs.colwidth) {
              attrs['data-colwidth'] = (nodeAttrs.colwidth as number[]).join(',')
            }
            return ['td', attrs, 0]
          },
        },
        table_header: {
          content: 'paragraph+',
          attrs: {
            colspan: {default: 1},
            rowspan: {default: 1},
            colwidth: {default: null},
          },
          tableRole: 'header_cell',
          isolating: true,
          parseDOM: [
            {
              tag: 'th',
              getAttrs: (node: HTMLElement) => ({
                colspan: parseInt(node.getAttribute('colspan') || '1'),
                rowspan: parseInt(node.getAttribute('rowspan') || '1'),
                colwidth:
                  node.getAttribute('data-colwidth')?.split(',').map(s => parseInt(s)) ||
                  null,
              }),
            },
          ],
          toDOM: (node: unknown) => {
            const nodeAttrs = (node as { attrs: Record<string, unknown> }).attrs
            const attrs: Record<string, string> = {}
            if (nodeAttrs.colspan !== 1) {
              attrs.colspan = String(nodeAttrs.colspan)
            }
            if (nodeAttrs.rowspan !== 1) {
              attrs.rowspan = String(nodeAttrs.rowspan)
            }
            if (nodeAttrs.colwidth) {
              attrs['data-colwidth'] = (nodeAttrs.colwidth as number[]).join(',')
            }
            return ['th', attrs, 0]
          },
        },
      },
    }
  }

  public configureMarkdownIt(markdownIt: unknown): void {
    // Enable table support in markdown-it
    ;(markdownIt as { enable: (feature: string) => void }).enable('table')
  }

  public getSerializationRules(): SerializationRule {
    return {
      nodes: {
        table: (state: unknown, node: unknown) => {
          const stateObj = state as { renderContent: (node: unknown) => void; closeBlock: (node: unknown) => void }
          stateObj.renderContent(node)
          stateObj.closeBlock(node)
        },
        table_row: (state: unknown, node: unknown, _parent?: unknown, _index?: unknown) => {
          const stateObj = state as { write: (text: string) => void }
          stateObj.write('|')
          const nodeObj = node as { childCount: number; child: (i: number) => unknown }
          for (let i = 0; i < nodeObj.childCount; i++) {
            if (i) {
              stateObj.write('|')
            }
            const cell = nodeObj.child(i)
            const cellText = (cell as { textContent?: string }).textContent?.trim() || ''
            stateObj.write(` ${cellText} `)
          }
          stateObj.write('|')
          stateObj.write('\n')
        },
        table_header: (state: unknown, node: unknown, _parent?: unknown, _index?: unknown) => {
          const stateObj = state as { write: (text: string) => void; ensureNewLine: () => void }
          stateObj.write('|')

          const nodeObj = node as { textContent?: string }
          const cellText = nodeObj.textContent?.trim() || ''
          stateObj.write(` ${cellText} `)
          stateObj.write('|')
          stateObj.ensureNewLine()
        },
        table_cell: (state: unknown, node: unknown, _parent?: unknown, _index?: unknown) => {
          const stateObj = state as { write: (text: string) => void; ensureNewLine: () => void }
          stateObj.write('|')

          const nodeObj = node as { textContent?: string }
          const cellText = nodeObj.textContent?.trim() || ''
          stateObj.write(` ${cellText} `)
          stateObj.write('|')
          stateObj.ensureNewLine()
        },
      },
    }
  }

  execute(): void {
    // eslint-disable-next-line no-alert
    const rows = prompt('Number of rows:', '3')
    // eslint-disable-next-line no-alert
    const cols = prompt('Number of columns:', '3')

    if (rows && cols && this.editor.view) {
      const numRows = parseInt(rows)
      const numCols = parseInt(cols)

      // Create a simple table markdown
      let tableMarkdown = ''

      // Header row
      tableMarkdown += '|'
      for (let c = 0; c < numCols; c++) {
        tableMarkdown += ` Header ${c + 1} |`
      }
      tableMarkdown += '\n'

      // Separator row
      tableMarkdown += '|'
      for (let c = 0; c < numCols; c++) {
        tableMarkdown += ' --- |'
      }
      tableMarkdown += '\n'

      // Data rows
      for (let r = 1; r < numRows; r++) {
        tableMarkdown += '|'
        for (let c = 0; c < numCols; c++) {
          tableMarkdown += ` Cell ${r + 1},${c + 1} |`
        }
        tableMarkdown += '\n'
      }

      const {state, dispatch} = this.editor.view
      const node = state.schema.text(tableMarkdown)
      dispatch(state.tr.replaceSelectionWith(node, false))
      this.editor.view.focus()
    }
  }

  isActive(): boolean {
    return false // Tables are not toggleable
  }
}
