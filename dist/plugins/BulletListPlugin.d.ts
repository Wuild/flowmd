import { BasePlugin } from './BasePlugin';
/**
 * Plugin for bullet list formatting
 */
export default class BulletListPlugin extends BasePlugin {
    /**
     * The name of the plugin
     */
    readonly name = "bulletList";
    /**
     * Create a new BulletListPlugin instance
     */
    constructor();
    /**
     * Toggle bullet list formatting
     * @param view The editor view or an object with state and dispatch
     * @returns Whether the action was successful
     */
    private toggleBulletList;
    /**
     * Handle Tab key in lists to indent list items
     * @param state The editor state
     * @param dispatch The dispatch function
     * @returns Whether the action was successful
     */
    private handleTab;
    /**
     * Handle Shift+Tab key in lists to outdent list items
     * @param state The editor state
     * @param dispatch The dispatch function
     * @returns Whether the action was successful
     */
    private handleShiftTab;
    /**
     * Handle Enter key in lists to create a new list item
     * @param state The editor state
     * @param dispatch The dispatch function
     * @returns Whether the action was successful
     */
    private handleEnter;
}
//# sourceMappingURL=BulletListPlugin.d.ts.map