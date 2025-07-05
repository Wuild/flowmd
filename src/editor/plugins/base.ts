/**
 * Base plugin class for the editor
 */

import {EditorView} from 'prosemirror-view';
import type {Editor, EditorOptions, EditorPlugin} from '../types';

/**
 * Abstract base plugin class that all plugins should extend
 */
export abstract class Base implements EditorPlugin {
    /**
     * The name of the plugin
     */
    abstract name: string;

    /**
     * Plugin state
     */
    state: any = {};

    /**
     * Keymap for the plugin
     */
    get keymap(): Record<string, any> | undefined {
        return undefined;
    }

    /**
     * The editor instance
     */
    public editor!: Editor;

    /**
     * Initialize the plugin
     * @param editor The editor instance
     * @param options Editor options
     */
    init(editor: Editor, options: EditorOptions): void {
        // Store the editor view for later use
        this.editor = editor;

        // Store editor options for later use
        this.state.editorOptions = options;

        // Get plugin-specific options if available
        if (options.pluginOptions && options.pluginOptions[this.name]) {
            this.state.options = options.pluginOptions[this.name];
        }
    }


    /**
     * Handle paste events (optional)
     * @param data Paste event data
     * @returns true if the paste was handled, false otherwise, or modified data object for chaining
     */
    onPaste?(data: { text: string; html: string; view: EditorView }): boolean | {
        text: string;
        html: string;
        view: EditorView
    };
}
