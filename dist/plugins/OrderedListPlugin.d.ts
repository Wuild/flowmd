import { BasePlugin } from './BasePlugin';
/**
 * Plugin for ordered list formatting
 */
export default class OrderedListPlugin extends BasePlugin {
    /**
     * The name of the plugin
     */
    readonly name = "orderedList";
    /**
     * Create a new OrderedListPlugin instance
     */
    constructor();
    /**
     * Toggle ordered list formatting
     * @param view The editor view or an object with state and dispatch
     * @returns Whether the action was successful
     */
    private toggleOrderedList;
    /**
     * Handle Enter key in lists to create a new list item
     * @param state The editor state
     * @param dispatch The dispatch function
     * @returns Whether the action was successful
     */
    private handleEnter;
}
//# sourceMappingURL=OrderedListPlugin.d.ts.map