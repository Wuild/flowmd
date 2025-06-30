import { EditorState, Plugin, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
export interface EditorOptions {
    placeholder?: string;
    toolbar?: string;
    theme?: 'light' | 'dark';
    floatingToolbar?: boolean;
    onChange?: (markdown: string) => void;
}
export interface PluginInterface {
    name: string;
    toolbarButton?: {
        icon: string;
        tooltip: string;
        action: (view: EditorView) => boolean;
        isActive?: (state: EditorState) => boolean;
    };
    plugins?: Plugin[];
    keymap?: {
        [key: string]: (state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView) => boolean;
    };
}
/**
 * FlowMD - A WYSIWYG Markdown Editor built with ProseMirror
 */
export declare class FlowMD {
    private element;
    private options;
    private view;
    private schema;
    private plugins;
    private markdownParser;
    private toolbar;
    private sourceMode;
    private sourceTextarea;
    private originalTextarea;
    /**
     * Create a new FlowMD editor
     * @param element The HTML element to attach the editor to. If a textarea is provided,
     *                the editor will be built after the textarea, the textarea will be hidden,
     *                and the editor will be automatically connected to the textarea.
     * @param options Editor options
     */
    constructor(element: HTMLElement, options?: EditorOptions);
    /**
     * Register the built-in plugins
     */
    private registerBuiltinPlugins;
    /**
     * Initialize the editor
     */
    private initEditor;
    /**
     * Create the toolbar
     */
    private createToolbar;
    /**
     * Get all plugins for the editor
     */
    private getPlugins;
    /**
     * Register a plugin
     * @param plugin The plugin to register
     */
    registerPlugin(plugin: PluginInterface): void;
    /**
     * Toggle between WYSIWYG and source mode
     */
    toggleSourceMode(): void;
    /**
     * Get the current content as markdown
     */
    getMarkdown(): string;
    /**
     * Get the current content as HTML
     */
    getHTML(): string;
    /**
     * Set the content of the editor
     * @param markdown The markdown content to set
     */
    setContent(markdown: string): void;
    /**
     * Connect the editor to a form textarea
     * @param textarea The textarea element to connect to
     * @param format The format to use for the textarea value ('markdown' or 'html')
     * @param name Optional name attribute to set on the textarea
     * @returns The FlowMD instance for method chaining
     */
    connectToTextarea(textarea: HTMLTextAreaElement, format?: 'markdown' | 'html', name?: string): FlowMD;
    /**
     * Update the active state of toolbar buttons based on the current editor state
     * @param state The current editor state
     */
    private updateToolbarButtonStates;
    /**
     * Destroy the editor
     */
    destroy(): void;
}
//# sourceMappingURL=FlowMD.d.ts.map