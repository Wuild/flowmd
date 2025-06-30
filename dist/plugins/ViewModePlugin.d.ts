import { BasePlugin } from './BasePlugin';
/**
 * Plugin for toggling between WYSIWYG and source modes
 */
export default class ViewModePlugin extends BasePlugin {
    /**
     * The name of the plugin
     */
    readonly name = "viewMode";
    /**
     * Whether the editor is in source mode
     */
    private isSourceMode;
    /**
     * Create a new ViewModePlugin instance
     */
    constructor();
    /**
     * Toggle between WYSIWYG and source modes
     * @param view The editor view
     * @returns Whether the action was successful
     */
    private toggleViewMode;
}
//# sourceMappingURL=ViewModePlugin.d.ts.map