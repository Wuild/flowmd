import { BasePlugin } from './BasePlugin';
/**
 * Plugin for table formatting
 */
export default class TablePlugin extends BasePlugin {
    /**
     * The name of the plugin
     */
    readonly name = "table";
    /**
     * Create a new TablePlugin instance
     */
    constructor();
    /**
     * Show the table dialog
     * @param view The editor view
     * @returns Whether the action was successful
     */
    private showTableDialog;
    /**
     * Insert a table
     * @param view The editor view
     * @param rowCount The number of rows
     * @param colCount The number of columns
     * @returns Whether the action was successful
     */
    private insertTable;
}
//# sourceMappingURL=TablePlugin.d.ts.map