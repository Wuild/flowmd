/**
 * Core editor implementation
 */

import { EditorState, Plugin, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { history, undo, redo } from 'prosemirror-history';
import { Schema } from 'prosemirror-model';
import { sinkListItem } from 'prosemirror-schema-list';
import { fromMarkdown, toMarkdown, toHTML } from './utils/markdown';
import type { Editor, EditorOptions, EditorPlugin } from './types';
import { inputRules, markInputRules } from './input-rules';
import { Toolbar } from './components/toolbar';
import { schema } from './schema';

/**
 * FlowMD Editor class
 * A class-based implementation of the Markdown WYSIWYG editor
 */
export class FlowMD implements Editor {
	/** The editor view */
	public view: EditorView;
	/** The editor state */
	public state: EditorState;
	/** The editor schema */
	public schema: Schema;
	/** Registered plugins */
	public plugins: EditorPlugin[] = [];
	/** Editor options */
	public options: EditorOptions;
	/** Event listeners */
	private eventListeners: Record<string, Function[]> = {};
	/** Toolbar instance */
	private toolbar?: Toolbar;
	/** Editor container element */
	public container: HTMLElement;

	/**
	 * Constructor
	 * @param options Editor options
	 */
	constructor(options: EditorOptions) {
		this.options = options;

		// Extract content from the provided element
		this.options.content = this.options.element.innerText || this.options.element.textContent || '';
		this.options.element.innerText = '';

		// Create container element
		this.container = document.createElement('div');
		this.container.className = 'flowmd-editor';

		// Create textarea if the provided element is not already a textarea
		let textarea: HTMLTextAreaElement;
		if (options.element instanceof HTMLTextAreaElement) {
			textarea = options.element;

			// Insert container before the textarea
			options.element.parentNode?.insertBefore(this.container, options.element);

			// Move the textarea into the container
			this.container.appendChild(textarea);
		} else {
			// Create a new textarea
			textarea = document.createElement('textarea');
			textarea.className = 'flowmd-editor__textarea';

			// Set name attribute if textarea option is provided
			if (options.textarea) {
				textarea.name = options.textarea;
			}

			// Replace the original element with the container
			options.element.parentNode?.replaceChild(this.container, options.element);

			// Add the textarea to the container
			this.container.appendChild(textarea);
		}

		// Update options.element to be the textarea
		this.options.element = textarea;

		// Hide the textarea initially (it will be shown in view-switcher plugin)
		textarea.style.display = 'none';

		// Use the schema from schema.ts
		this.schema = schema;

		// Create the initial document from markdown if provided
		const doc = options.content
			? fromMarkdown(this.schema, options.content)
			: this.schema.node('doc', {}, [this.schema.node('paragraph', {})]);

		// Create the editor state
		this.state = EditorState.create({
			doc,
			schema: this.schema,
			plugins: [
				history(),
				// Add custom keymap from options if provided (highest priority)
				...(options.keymap ? [keymap(options.keymap)] : []),
				keymap({
					'Mod-z': undo,
					'Mod-y': redo,
					'Mod-Shift-z': redo,
					'Shift-Enter': (state, dispatch) => {
						if (dispatch) {
							const { tr } = state;
							tr.replaceSelectionWith(this.schema.nodes.hard_break.create());
							dispatch(tr);
						}
						return true;
					},
					'Tab': (state, dispatch) => {
						// Check if we're in a list item
						const { $from } = state.selection;
						const listItem = this.schema.nodes.list_item;

						// If we're in a list item, try to indent it
						if ($from.parent.type === listItem || $from.node(-1)?.type === listItem) {
							return sinkListItem(listItem)(state, dispatch);
						}

						// Otherwise, insert a tab character
						if (dispatch) {
							const { tr } = state;
							tr.insertText('\t');
							dispatch(tr);
						}
						return true;
					}
				}),
				keymap(baseKeymap),
				inputRules(this.schema),
				markInputRules(this.schema),
				// Plugin for handling changes and notifying via onChange callback and events
				new Plugin({
					view: () => {
						return {
							update: (view, prevState) => {
								if (!view.state.doc.eq(prevState.doc)) {
									const markdown = toMarkdown(this.schema, view.state.doc);
									const html = toHTML(view.state.doc);

									// Call onChange callback if provided
									if (options.onChange) {
										options.onChange(markdown, html);
									}

									// Trigger change event
									this.triggerEvent('change', { markdown, html });
								}
							}
						};
					}
				})
			]
		});

		// Create a div for the editor view inside the container
		const editorViewElement = document.createElement('div');
		editorViewElement.className = 'flowmd-editor__view';
		this.container.appendChild(editorViewElement);

		// Create the editor view
		this.view = new EditorView(editorViewElement, {
			state: this.state,
			dispatchTransaction: this.dispatchTransaction.bind(this),
			attributes: {
				spellcheck: options.spellcheck !== false ? 'true' : 'false'
			},
			handleDOMEvents: {
				focus: () => {
					// Add focused class to the editor container
					this.container.classList.add('flowmd-editor--focused');
					return false; // Let ProseMirror handle the event
				},
				blur: () => {
					// Remove focused class from the editor container
					this.container.classList.remove('flowmd-editor--focused');
					return false; // Let ProseMirror handle the event
				}
			}
		});

		// Apply height settings to the editor view's DOM element
		this.applyHeightSettings();

		// Update textarea value when editor content changes
		this.addEventListener('change', ({ markdown }: { markdown: string }) => {
			const textarea = this.options.element as HTMLTextAreaElement;
			if (textarea && textarea.value !== markdown) {
				textarea.value = markdown;

				// Trigger change event on textarea for form handling
				const event = new Event('change', { bubbles: true });
				textarea.dispatchEvent(event);
			}
		});

		// Register plugins and initialize toolbar
		if (options.plugins) {
			// Use provided plugins
			options.plugins.forEach(plugin => {
				this.registerPlugin(plugin);
			});

			// Initialize toolbar if specified
			if (options.toolbar) {
				this.toolbar = new Toolbar({
					editor: this
				});
			}
		} else {
			// Use all plugins from the plugins folder by default
			if (options.toolbar) {
				// If toolbar is specified, load plugins and initialize toolbar together
				import('./plugins')
					.then(plugins => {
						const allPlugins = plugins.getAllPlugins();
						allPlugins.forEach(plugin => {
							// Check if the plugin is enabled in options
							const pluginOptions = this.options.pluginOptions?.[plugin.name];
							const isEnabled = pluginOptions?.enabled !== false; // Default to enabled if not specified

							if (isEnabled) {
								this.registerPlugin(plugin);
							}
						});

						// Initialize toolbar with registered plugins
						this.toolbar = new Toolbar({
							editor: this
						});
					})
					.catch(error => {
						console.error('Error loading plugins and initializing toolbar:', error);
					});
			} else {
				// Just load plugins without toolbar
				import('./plugins')
					.then(plugins => {
						const allPlugins = plugins.getAllPlugins();
						allPlugins.forEach(plugin => {
							// Check if the plugin is enabled in options
							const pluginOptions = this.options.pluginOptions?.[plugin.name];
							const isEnabled = pluginOptions?.enabled !== false; // Default to enabled if not specified

							if (isEnabled) {
								this.registerPlugin(plugin);
							}
						});
					})
					.catch(error => {
						console.error('Error loading plugins:', error);
					});
			}
		}
	}

	/**
	 * Dispatch transaction
	 * @param transaction The transaction to dispatch
	 */
	private dispatchTransaction(transaction: Transaction) {
		const newState = this.view.state.apply(transaction);
		this.view.updateState(newState);
		this.state = newState;

		// Trigger transaction event
		this.triggerEvent('transaction', { transaction, state: newState });
	}

	/**
	 * Get the current content as markdown
	 * @returns Markdown string
	 */
	public getMarkdown(): string {
		return toMarkdown(this.schema, this.view.state.doc);
	}

	/**
	 * Get the current content as HTML
	 * @returns HTML string
	 */
	public getHTML(): string {
		return toHTML(this.view.state.doc);
	}

	/**
	 * Set content from markdown
	 * @param markdown Markdown string
	 */
	public setContent(markdown: string): void {
		const doc = fromMarkdown(this.schema, markdown);
		const newState = EditorState.create({
			doc,
			schema: this.schema,
			plugins: this.state.plugins
		});
		this.view.updateState(newState);
		this.state = newState;

		// Trigger content change event
		this.triggerEvent('contentSet', { markdown });
	}

	/**
	 * Register a plugin
	 * @param plugin The plugin to register
	 */
	public registerPlugin(plugin: EditorPlugin): void {
		this.plugins.push(plugin);
		plugin.init(this, this.options);

		// We're using the schema from schema.ts directly, no need to rebuild

		const pluginsToAdd = [];

		// Register plugin keymap if provided
		if (plugin.keymap) {
			const pluginKeymap = keymap(plugin.keymap);
			pluginsToAdd.push(pluginKeymap);
		}

		// Register ProseMirror plugin if provided
		if (plugin.getPlugin) {
			const proseMirrorPlugin = plugin.getPlugin();
			pluginsToAdd.push(proseMirrorPlugin);
		}

		// Update state with new plugins if any were added
		if (pluginsToAdd.length > 0) {
			const currentPlugins = this.state.plugins;
			let newPlugins;

			if (plugin.keymap) {
				// Insert plugin keymaps at the beginning to give them higher priority
				newPlugins = [...pluginsToAdd, ...currentPlugins];
			} else {
				// No keymap, add at end as usual
				newPlugins = [...currentPlugins, ...pluginsToAdd];
			}

			// Get current document content as markdown
			const markdown = toMarkdown(this.schema, this.state.doc);

			// Parse markdown with the new schema
			const doc = fromMarkdown(this.schema, markdown);

			// Create new state with updated schema and plugins
			this.state = EditorState.create({
				doc,
				schema: this.schema,
				plugins: newPlugins
			});
			this.view.updateState(this.state);
		}

		// Trigger plugin registered event
		this.triggerEvent('pluginRegistered', { plugin });
	}

	/**
	 * Add event listener
	 * @param event Event name
	 * @param callback Callback function
	 */
	public addEventListener(event: string, callback: Function): void {
		if (!this.eventListeners[event]) {
			this.eventListeners[event] = [];
		}
		this.eventListeners[event].push(callback);
	}

	/**
	 * Remove event listener
	 * @param event Event name
	 * @param callback Callback function
	 */
	public removeEventListener(event: string, callback: Function): void {
		if (this.eventListeners[event]) {
			this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
		}
	}

	/**
	 * Trigger event
	 * @param event Event name
	 * @param data Event data
	 */
	private triggerEvent(event: string, data: any): void {
		if (this.eventListeners[event]) {
			this.eventListeners[event].forEach(callback => {
				callback(data);
			});
		}
	}

	/**
	 * Destroy the editor
	 */
	public destroy(): void {
		// Destroy toolbar if it exists
		if (this.toolbar) {
			this.toolbar.destroy();
			this.toolbar = undefined;
		}

		// No need to remove the textarea as it's part of the DOM structure

		this.view.destroy();

		// Clear event listeners
		this.eventListeners = {};

		// Trigger destroy event
		this.triggerEvent('destroy', {});
	}

	/**
	 * Apply height settings to the editor container and view
	 */
	private applyHeightSettings(): void {
		// Apply height settings if provided
		if (this.options.height || this.options.maxHeight || this.options.minHeight) {
			// Apply height settings to the container
			if (this.options.height) {
				this.container.style.height = this.options.height;
			}
			if (this.options.maxHeight) {
				this.container.style.maxHeight = this.options.maxHeight;
			}
			if (this.options.minHeight) {
				this.container.style.minHeight = this.options.minHeight;
			}

			// Set up flex container for proper height distribution
			this.container.style.display = 'flex';
			this.container.style.flexDirection = 'column';

			// Make the ProseMirror editor view's DOM element take up the full available space
			if (this.view && this.view.dom) {
				const editorDom = this.view.dom as HTMLElement;

				// Use flex instead of height: 100%
				editorDom.style.flex = '1';
				editorDom.style.minHeight = '0'; // Allow shrinking below content size if needed

				// Ensure content scrolls properly
				editorDom.style.overflowY = 'auto';
			}
		}
	}
}

/**
 * Create a new editor instance
 * @param options Editor options
 * @returns Editor instance
 */
export function createEditor(options: EditorOptions): Editor {
	return new FlowMD(options);
}
