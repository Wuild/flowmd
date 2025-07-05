/**
 * Types and interfaces for the Markdown WYSIWYG editor
 */

import { Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

/**
 * Editor options interface
 */
export interface EditorOptions {
	/** The container element where the editor will be mounted */
	element: HTMLElement;
	/** Initial content in markdown format */
	content?: string;
	placeholder?: string;
	/**
	 * Whether to show the toolbar or a string to configure which buttons to show
	 * Format: "bold,italic,|,image" where | is a separator
	 */
	toolbar?: boolean | string;
	/** Container element for the toolbar */
	toolbarContainer?: HTMLElement;
	/** Custom plugins to extend editor functionality */
	plugins?: EditorPlugin[];
	/** Plugin-specific options */
	pluginOptions?: Record<string, any>;
	/** Custom keymap for keyboard shortcuts */
	keymap?: Record<string, any>;
	/** Callback when content changes */
	onChange?: (markdown: string, html: string) => void;
	/** Name attribute for hidden textarea to sync markdown content for form submission */
	textarea?: string;
	/** Whether to enable browser spellcheck (default: true) */
	spellcheck?: boolean;
	/** Fixed height for the editor (CSS value) */
	height?: string;
	/** Maximum height for the editor (CSS value) */
	maxHeight?: string;
	/** Minimum height for the editor (CSS value) */
	minHeight?: string;
}

/**
 * Editor plugin interface
 */
export interface EditorPlugin {
	editor: Editor; // Reference to the editor instance
	/** Unique name for the plugin */
	name: string;
	/** Initialize the plugin */
	init: (editor: Editor, options: EditorOptions) => void;
	/** Plugin state */
	state?: any;
	/** Keymap for the plugin */
	keymap?: Record<string, any>;
	/** Get the ProseMirror plugin instance */
	getPlugin?: () => import('prosemirror-state').Plugin;
}

/**
 * Editor instance interface
 */
export interface Editor {
	/** The editor view */
	view: EditorView;
	/** The editor state */
	state: EditorState;
	/** The editor schema */
	schema: Schema;
	/** The container element */
	container: HTMLElement;
	/** Editor options */
	options: EditorOptions;
	/** Registered plugins */
	plugins: EditorPlugin[];
	/** Get the current content as markdown */
	getMarkdown: () => string;
	/** Get the current content as HTML */
	getHTML: () => string;
	/** Set content from markdown */
	setContent: (markdown: string) => void;
	/** Register a plugin */
	registerPlugin: (plugin: EditorPlugin) => void;
	/** Add event listener */
	addEventListener?: (event: string, callback: Function) => void;
	/** Remove event listener */
	removeEventListener?: (event: string, callback: Function) => void;
	/** Destroy the editor */
	destroy: () => void;
}
