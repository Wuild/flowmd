import { EditorState, Plugin, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
/**
 * Base class for all editor plugins
 * This provides a common interface and functionality for all plugins
 */
export declare abstract class BasePlugin {
    /**
     * The name of the plugin, used for identification in the toolbar
     */
    abstract readonly name: string;
    /**
     * The toolbar button configuration
     * If not provided, the plugin won't have a toolbar button
     */
    readonly toolbarButton?: {
        /**
         * The HTML for the button icon (can be SVG or text)
         */
        icon: string;
        /**
         * The tooltip text for the button
         */
        tooltip: string;
        /**
         * The action to perform when the button is clicked
         * @param view The editor view
         * @returns Whether the action was successful
         */
        action: (view: EditorView) => boolean;
        /**
         * Check if the button should be shown as active
         * @param state The editor state
         * @returns Whether the button should be shown as active
         */
        isActive?: (state: EditorState) => boolean;
    };
    /**
     * The ProseMirror plugins to add to the editor
     */
    readonly plugins?: Plugin[];
    /**
     * The keymap for the plugin
     * Keys are in the format 'Mod-b' for Ctrl/Cmd+B
     * Values are command functions that take state and dispatch
     */
    readonly keymap?: {
        [key: string]: (state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView) => boolean;
    };
    /**
     * Create a new plugin instance
     * @param options Options for the plugin
     */
    constructor(options?: Partial<BasePlugin>);
    /**
     * Check if a mark or node is active at the current selection
     * @param state The editor state
     * @param type The mark or node type name
     * @param attrs Optional attributes to check
     * @returns Whether the mark or node is active
     */
    protected isActive(state: EditorState, type: string, attrs?: Record<string, any>): boolean;
    /**
     * Check if attributes match
     * @param nodeAttrs The node attributes
     * @param attrs The attributes to match
     * @returns Whether the attributes match
     */
    private matchAttributes;
}
//# sourceMappingURL=BasePlugin.d.ts.map