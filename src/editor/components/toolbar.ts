/**
 * Toolbar component for the editor
 */

import {EditorView} from 'prosemirror-view';
import type {ToolbarDropdownItem} from '../plugins/toolbar';
import type {Editor} from '../types';
import {Dropdown} from './dropdown';

/**
 * Toolbar options
 */
export interface ToolbarOptions {
    /** Editor instance */
    editor: Editor;
}

/**
 * Toolbar item type
 */
export type ToolbarItem = string | 'spacer';

/**
 * Toolbar class
 */
export class Toolbar {
    /** Container element */
    private container: HTMLElement;
    /** Editor instance */
    private editor: Editor;
    /** Editor view */
    private view: EditorView;
    /** Toolbar items */
    private items: ToolbarItem[];
    /** Toolbar plugins */
    private plugins: any[] = [];
    /** Toolbar element */
    private toolbar: HTMLElement;
    /** Button elements */
    private buttons: Record<string, HTMLButtonElement> = {};
    /** Dropdown instances */
    private dropdowns: Record<string, Dropdown> = {};

    /**
     * Constructor
     * @param options Toolbar options
     */
    constructor(options: ToolbarOptions) {
        this.editor = options.editor;

        // Use the editor's container element
        this.container = this.editor.container;

        // Get editor view
        this.view = this.editor.view;

        // Get plugins from editor
        this.plugins = this.editor.plugins || [];

        // Parse toolbar items from editor options
        if (this.editor.options && this.editor.options.toolbar) {
            if (typeof this.editor.options.toolbar === 'string') {
                // Parse the string configuration from options
                this.items = this.parseToolbarConfig(this.editor.options.toolbar);
            } else {
                // Use default
                this.items = ['bold', 'italic', 'code', 'h1', 'h2', 'h3', 'blockquote', 'bullet_list', 'ordered_list'];
            }
        } else {
            // Use default
            this.items = ['bold', 'italic', 'code', 'h1', 'h2', 'h3', 'blockquote', 'bullet_list', 'ordered_list'];
        }

        this.toolbar = document.createElement('div');
        this.toolbar.className = 'flowmd-editor__toolbar';

        // Create toolbar buttons
        this.createButtons();

        // Add toolbar to the beginning of the container
        if (this.container.firstChild) {
            this.container.insertBefore(this.toolbar, this.container.firstChild);
        } else {
            this.container.appendChild(this.toolbar);
        }

        // Update button states on selection change
        this.view.dom.addEventListener('click', () => this.updateButtonStates());
        this.view.dom.addEventListener('keyup', () => this.updateButtonStates());
    }

    /**
     * Parse toolbar configuration string
     * @param config Configuration string in format "bold,italic,|,image,spacer,undo"
     * @returns Array of toolbar items
     */
    private parseToolbarConfig(config: string): ToolbarItem[] {
        return config.split(',')
            .map(item => item.trim())
            .filter(item => item) // Remove empty items
            .map(item => {
                // Handle separators and spacers
                if (item === '|' || item === 'spacer') {
                    return item as ToolbarItem;
                }
                // Just return the item as is, it will be matched against plugin names
                return item as ToolbarItem;
            });
    }

    /**
     * Create toolbar buttons
     */
    private createButtons() {
        // Create a map of plugin names to plugin instances for quick lookup
        const pluginMap = new Map();
        this.plugins.forEach(plugin => {
            if (plugin.buttonDefinition) {
                pluginMap.set(plugin.name, plugin);
            }
        });

        // Create buttons for each item in the toolbar configuration
        this.items.forEach(item => {
            if (item === '|') {
                // Create separator
                const separator = document.createElement('div');
                separator.className = 'flowmd-editor__toolbar-separator';
                this.toolbar.appendChild(separator);
            } else if (item === 'spacer') {
                // Create spacer
                const spacer = document.createElement('div');
                spacer.className = 'flowmd-editor__toolbar-spacer';
                this.toolbar.appendChild(spacer);
            } else {
                // Find the plugin with matching name
                const plugin = pluginMap.get(item);
                if (plugin && plugin.buttonDefinition) {
                    // Create button for this plugin
                    this.createPluginButton(plugin);
                } else {
                    console.warn(`No plugin found for toolbar item: ${item}`);
                }
            }
        });
    }

    /**
     * Create a button for a plugin
     * @param plugin The plugin
     */
    private createPluginButton(plugin: any) {
        const def = plugin.buttonDefinition;

        // Create button element
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'flowmd-editor__button';
        button.title = def.title;

        // Handle icon - either SVG element or text fallback
        if (def.icon instanceof HTMLElement) {
            button.appendChild(def.icon);
        } else {
            button.textContent = def.icon;
        }

        // If this button has a dropdown menu
        if (def.dropdown && def.dropdown.length > 0) {
            button.classList.add('flowmd-editor__button--dropdown');

            // Create dropdown content
            const dropdownContent = document.createElement('div');

            // Create dropdown items
            def.dropdown.forEach((item: ToolbarDropdownItem) => {
                const dropdownItem = document.createElement('button');
                dropdownItem.type = 'button';
                dropdownItem.className = 'flowmd-editor__dropdown__item';
                dropdownItem.setAttribute('data-dropdown-item', 'true');
                dropdownItem.textContent = item.title;
                dropdownItem.addEventListener('click', () => {
                    item.action.call(plugin, this.view);
                    this.view.focus();
                    this.hideDropdown(def.name);
                });
                dropdownContent.appendChild(dropdownItem);
            });

            // Create dropdown instance
            this.dropdowns[def.name] = new Dropdown({
                reference: button,
                content: dropdownContent,
                className: 'flowmd-editor__toolbar-dropdown',
                placement: 'bottom-start',
                offset: [0, 4],
                closeOnClickOutside: true
            });

            // Toggle dropdown on button click
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDropdown(def.name, button);
            });

            // Prevent blur on mousedown
            button.addEventListener('mousedown', (e) => {
                e.preventDefault();
            });
        } else {
            // Regular button without dropdown
            button.addEventListener('click', () => {
                def.action.call(plugin, this.view);

                // def.action.bind(plugin)(this.view);

                this.view.focus();
            });

            // Prevent blur on mousedown
            button.addEventListener('mousedown', (e) => {
                e.preventDefault();
            });
        }

        // Add button to toolbar
        this.toolbar.appendChild(button);
        this.buttons[def.name] = button;
    }

    /**
     * Update button states based on current selection
     */
    private updateButtonStates() {
        const {state} = this.view;
        const {selection} = state;
        const {$from} = selection;

        // Update mark buttons
        Object.entries(this.editor.schema.marks).forEach(([name, mark]) => {
            let isActive;
            if (selection.empty) {
                // When cursor is just positioned without selection, check marks at cursor position
                isActive = $from.marks().some(m => m.type === mark);
            } else {
                // When there's a selection, check if the range has the mark
                isActive = state.doc.rangeHasMark(selection.from, selection.to, mark);
            }
            const button = this.buttons[name as ToolbarItem];
            if (button) {
                button.classList.toggle('active', isActive);
            }
        });

        // Update node buttons
        Object.entries(this.editor.schema.nodes).forEach(([name, node]) => {
            if (name === 'heading') {
                // Handle heading levels
                for (let i = 1; i <= 3; i++) {
                    const button = this.buttons[`h${i}` as ToolbarItem];
                    if (button) {
                        const isActive = $from.node().type === node && $from.node().attrs.level === i;
                        button.classList.toggle('active', isActive);
                    }
                }
            } else {
                // Handle other block types
                const button = this.buttons[name as ToolbarItem];
                if (button) {
                    const isActive = $from.node().type === node;
                    button.classList.toggle('active', isActive);
                }
            }
        });

        // Update plugin buttons
        this.plugins.forEach(plugin => {
            if (plugin.buttonDefinition) {
                const def = plugin.buttonDefinition;
                const button = this.buttons[def.name];

                if (button && def.isActive) {
                    const isActive = def.isActive.call(plugin, this.view);
                    button.classList.toggle('active', isActive);
                }
            }
        });
    }


    /**
     * Toggle dropdown visibility
     * @param name Dropdown name
     * @param button Button element
     */
    private toggleDropdown(name: string, button: HTMLButtonElement) {
        const dropdown = this.dropdowns[name];
        const isVisible = dropdown.isVisible();

        // Hide all dropdowns first
        Object.keys(this.dropdowns).forEach(key => {
            if (key !== name) {
                this.hideDropdown(key);
            }
        });

        // Toggle this dropdown
        if (!isVisible) {
            dropdown.show();
            button.classList.add('active');
        } else {
            dropdown.hide();
            button.classList.remove('active');
        }
    }

    /**
     * Hide dropdown
     * @param name Dropdown name
     */
    private hideDropdown(name: string) {
        const dropdown = this.dropdowns[name];
        const button = this.buttons[name];

        if (dropdown) {
            dropdown.hide();
        }

        if (button) {
            button.classList.remove('active');
        }
    }

    /**
     * Destroy the toolbar
     */
    destroy() {
        // Destroy all dropdown instances
        Object.values(this.dropdowns).forEach(dropdown => {
            dropdown.destroy();
        });

        // Remove the toolbar if it's still in the DOM
        if (this.toolbar && this.toolbar.parentNode) {
            this.toolbar.parentNode.removeChild(this.toolbar);
        }
    }
}
