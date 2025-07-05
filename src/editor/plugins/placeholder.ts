/**
 * Placeholder plugin for the editor
 */

import {Plugin, PluginKey} from 'prosemirror-state';
import {Decoration, DecorationSet} from 'prosemirror-view';
import {Base} from './base';
import type {Editor, EditorOptions} from '../types';

/**
 * Plugin key for the placeholder plugin
 */
const placeholderPluginKey = new PluginKey('placeholder');

/**
 * Plugin that adds placeholder text to empty editor instances
 */
export class Placeholder extends Base {
    /**
     * The name of the plugin
     */
    name = 'placeholder';

    /**
     * The placeholder text
     */
    private placeholder: string;

    /**
     * The ProseMirror plugin instance
     */
    private plugin: Plugin;

    /**
     * Constructor
     * @param placeholder The placeholder text
     */
    constructor(placeholder: string = 'Start writing...') {
        super();
        this.placeholder = placeholder;

        // Create the ProseMirror plugin during construction
        this.plugin = this.createPlugin();
    }

    /**
     * Create the ProseMirror plugin
     */
    private createPlugin(): Plugin {

        return new Plugin({
            key: placeholderPluginKey,
            props: {
                decorations: (state) => {
                    const doc = state.doc;
                    const text = this.placeholder;

                    // Check if document is effectively empty
                    const isEmpty = doc.childCount === 1 &&
                        doc.firstChild?.type.name === 'paragraph' &&
                        doc.firstChild.content.size === 0;

                    if (isEmpty) {
                        // Add class and data attribute to the empty paragraph node
                        const decoration = Decoration.node(0, doc.firstChild.nodeSize, {
                            class: 'editor-placeholder',
                            'data-placeholder': text
                        });

                        return DecorationSet.create(doc, [decoration]);
                    }

                    return DecorationSet.empty;
                }
            }
        });
    }

    /**
     * Get the ProseMirror plugin
     */
    getPlugin(): Plugin {
        return this.plugin;
    }

    /**
     * Initialize the plugin
     * @param _editor
     * @param options
     */
    init(_editor: Editor, options: EditorOptions): void {
        this.placeholder = options.placeholder || this.placeholder;
        // The plugin is already created and will be added by the editor
        // No need to reconfigure the state here
    }
}
