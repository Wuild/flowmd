import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { BasePlugin } from './BasePlugin'

/**
 * Plugin for table formatting
 */
export default class TablePlugin extends BasePlugin {
  /**
   * The name of the plugin
   */
  public readonly name = 'table'

  /**
   * Create a new TablePlugin instance
   */
  constructor() {
    super({
      toolbarButton: {
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>',
        tooltip: 'Insert Table',
        action: (view: EditorView) => this.showTableDialog(view),
        isActive: (state: EditorState) => this.isActive(state, 'table')
      }
    })
  }

  /**
   * Show the table dialog
   * @param view The editor view
   * @returns Whether the action was successful
   */
  private showTableDialog(view: EditorView): boolean {
    const { state, dispatch } = view
    const { schema } = state

    // Ask for the number of rows and columns
    const rows = window.prompt('Enter number of rows:', '3')

    if (rows === null) {
      // User cancelled
      return false
    }

    const rowCount = parseInt(rows, 10)

    if (isNaN(rowCount) || rowCount < 1) {
      window.alert('Please enter a valid number of rows (minimum 1).')
      return false
    }

    const cols = window.prompt('Enter number of columns:', '3')

    if (cols === null) {
      // User cancelled
      return false
    }

    const colCount = parseInt(cols, 10)

    if (isNaN(colCount) || colCount < 1) {
      window.alert('Please enter a valid number of columns (minimum 1).')
      return false
    }

    // Create the table
    return this.insertTable(view, rowCount, colCount)
  }

  /**
   * Insert a table
   * @param view The editor view
   * @param rowCount The number of rows
   * @param colCount The number of columns
   * @returns Whether the action was successful
   */
  private insertTable(view: EditorView, rowCount: number, colCount: number): boolean {
    const { state, dispatch } = view
    const { schema } = state

    // Check if table nodes are defined in the schema
    if (!schema.nodes.table || !schema.nodes.table_row ||
        !schema.nodes.table_cell || !schema.nodes.table_header) {
      console.error('Table nodes are not defined in the schema')
      window.alert('Tables are not supported in this editor configuration.')
      return false
    }

    // Create table header cells
    const headerCells = []
    for (let i = 0; i < colCount; i++) {
      const cell = schema.nodes.table_header.createAndFill()
      if (cell) headerCells.push(cell)
    }

    // Create table header row
    const headerRow = schema.nodes.table_row.create(null, headerCells as any)

    // Create table body rows
    const rows = [headerRow]

    for (let i = 0; i < rowCount - 1; i++) {
      const cells = []

      for (let j = 0; j < colCount; j++) {
        const cell = schema.nodes.table_cell.createAndFill()
        if (cell) cells.push(cell)
      }

      rows.push(schema.nodes.table_row.create(null, cells as any))
    }

    // Create the table
    const table = schema.nodes.table.create(null, rows)

    // Insert the table
    const tr = state.tr.replaceSelectionWith(table)
    dispatch(tr)

    return true
  }
}
