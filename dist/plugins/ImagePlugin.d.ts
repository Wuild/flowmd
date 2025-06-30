import { BasePlugin } from './BasePlugin';
/**
 * Plugin for inserting images
 */
export default class ImagePlugin extends BasePlugin {
    /**
     * The name of the plugin
     */
    readonly name = "image";
    /**
     * Create a new ImagePlugin instance
     */
    constructor();
    /**
     * Show the image dialog
     * @param view The editor view or an object with state and dispatch
     * @returns Whether the action was successful
     */
    private showImageDialog;
}
//# sourceMappingURL=ImagePlugin.d.ts.map