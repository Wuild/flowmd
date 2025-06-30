import { BasePlugin } from './BasePlugin';
/**
 * Plugin for heading formatting
 */
export default class HeadingPlugin extends BasePlugin {
    /**
     * The name of the plugin
     */
    readonly name = "heading";
    /**
     * Create a new HeadingPlugin instance
     */
    constructor();
    /**
     * Show the heading dropdown menu
     * @param view The editor view
     * @returns Whether the action was successful
     */
    private showHeadingDropdown;
    /**
     * Toggle heading formatting
     * @param state The editor state
     * @param dispatch The dispatch function
     * @param level The heading level (1-6)
     * @returns Whether the action was successful
     */
    private toggleHeading;
    /**
     * Toggle paragraph formatting (remove heading)
     * @param state The editor state
     * @param dispatch The dispatch function
     * @returns Whether the action was successful
     */
    private toggleParagraph;
    /**
     * Check if any heading level is active
     * @param state The editor state
     * @returns Whether any heading is active
     */
    private isAnyHeadingActive;
}
//# sourceMappingURL=HeadingPlugin.d.ts.map