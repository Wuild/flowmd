/**
 * Heading plugin for the editor
 */

import {EditorView} from 'prosemirror-view';
import {setBlockType} from 'prosemirror-commands';
import {ToolbarBase} from './toolbar';
import type {ToolbarButtonDefinition} from './toolbar';
import {createIconSync} from '../utils/icons';

/**
 * Plugin that adds a heading dropdown to the toolbar
 */
export class Heading extends ToolbarBase {
    /**
     * The name of the plugin
     */
    name = 'heading';


    /**
     * Keymap for heading formatting
     */
    get keymap() {
        return {
            'Mod-Alt-0': setBlockType(this.editor.schema.nodes.paragraph),
            'Mod-Alt-1': setBlockType(this.editor.schema.nodes.heading, {level: 1}),
            'Mod-Alt-2': setBlockType(this.editor.schema.nodes.heading, {level: 2}),
            'Mod-Alt-3': setBlockType(this.editor.schema.nodes.heading, {level: 3}),
            'Mod-Alt-4': setBlockType(this.editor.schema.nodes.heading, {level: 4}),
            'Mod-Alt-5': setBlockType(this.editor.schema.nodes.heading, {level: 5})
        };
    }

    /**
     * The toolbar button definition
     */
    get buttonDefinition(): ToolbarButtonDefinition {
        return {
            name: 'heading',
            title: 'Heading',
            icon: createIconSync('heading'),
            isActive: (view: EditorView) => {
                const {state} = view;
                const {selection} = state;
                const {$from} = selection;
                return $from.node().type === this.editor.schema.nodes.heading;
            },
            action: (_view: EditorView) => {
                // The main button doesn't do anything, it just opens the dropdown
            },
            dropdown: [
                {
                    name: 'paragraph',
                    title: 'Paragraph',
                    action: (view: EditorView) => {
                        setBlockType(this.editor.schema.nodes.paragraph)(view.state, view.dispatch);
                        view.focus();
                    }
                },
                {
                    name: 'h1',
                    title: 'Heading 1',
                    action: (view: EditorView) => {
                        setBlockType(this.editor.schema.nodes.heading, {level: 1})(view.state, view.dispatch);
                        view.focus();
                    }
                },
                {
                    name: 'h2',
                    title: 'Heading 2',
                    action: (view: EditorView) => {
                        setBlockType(this.editor.schema.nodes.heading, {level: 2})(view.state, view.dispatch);
                        view.focus();
                    }
                },
                {
                    name: 'h3',
                    title: 'Heading 3',
                    action: (view: EditorView) => {
                        setBlockType(this.editor.schema.nodes.heading, {level: 3})(view.state, view.dispatch);
                        view.focus();
                    }
                },
                {
                    name: 'h4',
                    title: 'Heading 4',
                    action: (view: EditorView) => {
                        setBlockType(this.editor.schema.nodes.heading, {level: 4})(view.state, view.dispatch);
                        view.focus();
                    }
                },
                {
                    name: 'h5',
                    title: 'Heading 5',
                    action: (view: EditorView) => {
                        setBlockType(this.editor.schema.nodes.heading, {level: 5})(view.state, view.dispatch);
                        view.focus();
                    }
                }
            ]
        };
    }
}
