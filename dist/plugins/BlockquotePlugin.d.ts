import { BasePlugin } from './BasePlugin';
/**
 * Plugin for blockquote formatting
 */
export default class BlockquotePlugin extends BasePlugin {
    /**
     * The name of the plugin
     */
    readonly name = "blockquote";
    /**
     * Create a new BlockquotePlugin instance
     */
    constructor();
    /**
     * Toggle blockquote formatting
     * @param view The editor view or an object with state and dispatch
     * @returns Whether the action was successful
     */
    private toggleBlockquote;
}
//# sourceMappingURL=BlockquotePlugin.d.ts.map