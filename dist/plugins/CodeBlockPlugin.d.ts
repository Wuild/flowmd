import { BasePlugin } from './BasePlugin';
/**
 * Plugin for code block formatting
 */
export default class CodeBlockPlugin extends BasePlugin {
    /**
     * The name of the plugin
     */
    readonly name = "codeBlock";
    /**
     * Create a new CodeBlockPlugin instance
     */
    constructor();
    /**
     * Show the code block dialog
     * @param view The editor view
     * @returns Whether the action was successful
     */
    private showCodeBlockDialog;
    /**
     * Toggle code block formatting
     * @param state The editor state
     * @param dispatch The dispatch function
     * @param language Optional language for the code block
     * @returns Whether the action was successful
     */
    private toggleCodeBlock;
}
//# sourceMappingURL=CodeBlockPlugin.d.ts.map