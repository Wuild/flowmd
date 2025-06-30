import { BasePlugin } from './BasePlugin';
/**
 * Plugin for link formatting
 */
export default class LinkPlugin extends BasePlugin {
    /**
     * The name of the plugin
     */
    readonly name = "link";
    /**
     * Create a new LinkPlugin instance
     */
    constructor();
    /**
     * Show the link dialog
     * @param view The editor view or an object with state and dispatch
     * @returns Whether the action was successful
     */
    private showLinkDialog;
}
//# sourceMappingURL=LinkPlugin.d.ts.map