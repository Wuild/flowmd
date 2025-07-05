# FlowMD API Reference

This document provides a comprehensive reference for the FlowMD editor API, including methods, events, and plugin interfaces.

## Table of Contents

- [Editor API](#editor-api)
  - [Creation](#creation)
  - [Content Methods](#content-methods)
  - [Plugin Methods](#plugin-methods)
  - [Event Methods](#event-methods)
  - [Lifecycle Methods](#lifecycle-methods)
- [Events](#events)
- [Interfaces](#interfaces)
  - [EditorOptions](#editoroptions)
  - [EditorPlugin](#editorplugin)
  - [ToolbarButtonDefinition](#toolbarbuttondefinition)
  - [ToolbarDropdownItem](#toolbardropdownitem)

## Editor API

### Creation

#### `createEditor(options: EditorOptions): Editor`

Creates a new editor instance.

```javascript
import { createEditor } from '@wuild/flowmd';
import '@wuild/flowmd/styles/themes/light.css'; // Import the theme styles

const editor = createEditor({
  element: document.getElementById('editor'),
  content: '# Hello World'
});
```

### Content Methods

#### `getMarkdown(): string`

Gets the current content as Markdown.

```javascript
const markdown = editor.getMarkdown();
```

#### `getHTML(): string`

Gets the current content as HTML.

```javascript
const html = editor.getHTML();
```

#### `setContent(markdown: string): void`

Sets the editor content from Markdown.

```javascript
editor.setContent('# New Content');
```

### Plugin Methods

#### `registerPlugin(plugin: EditorPlugin): void`

Registers a plugin with the editor.

```javascript
import { MyPlugin } from './my-plugin';

const myPlugin = new MyPlugin();
editor.registerPlugin(myPlugin);
```

### Event Methods

#### `addEventListener(event: string, callback: Function): void`

Adds an event listener.

```javascript
editor.addEventListener('change', ({ markdown, html }) => {
  console.log('Content changed:', markdown);
});
```

#### `removeEventListener(event: string, callback: Function): void`

Removes an event listener.

```javascript
editor.removeEventListener('change', myCallback);
```

#### `triggerEvent(event: string, data: any): void`

*Internal method* - Triggers an event with the specified data.

### Lifecycle Methods

#### `focus(): void`

Focuses the editor.

```javascript
editor.focus();
```

#### `blur(): void`

Removes focus from the editor.

```javascript
editor.blur();
```

#### `destroy(): void`

Destroys the editor instance and cleans up resources.

```javascript
editor.destroy();
```

## Events

FlowMD provides several events that you can listen to:

### `change`

Triggered when the content changes.

**Data:**
- `markdown`: The current content as Markdown
- `html`: The current content as HTML

```javascript
editor.addEventListener('change', ({ markdown, html }) => {
  console.log('Content changed:', markdown);
});
```

### `transaction`

Triggered when a ProseMirror transaction is applied.

**Data:**
- `transaction`: The ProseMirror transaction
- `state`: The new editor state

```javascript
editor.addEventListener('transaction', ({ transaction, state }) => {
  console.log('Transaction applied:', transaction);
});
```

### `contentSet`

Triggered when content is set programmatically.

**Data:**
- `markdown`: The new content as Markdown

```javascript
editor.addEventListener('contentSet', ({ markdown }) => {
  console.log('Content set:', markdown);
});
```

### `pluginRegistered`

Triggered when a plugin is registered.

**Data:**
- `plugin`: The registered plugin

```javascript
editor.addEventListener('pluginRegistered', ({ plugin }) => {
  console.log('Plugin registered:', plugin.name);
});
```

### `destroy`

Triggered when the editor is destroyed.

```javascript
editor.addEventListener('destroy', () => {
  console.log('Editor destroyed');
});
```

## Interfaces

### EditorOptions

```typescript
interface EditorOptions {
  /** The container element where the editor will be mounted */
  element: HTMLElement;
  /** Initial content in markdown format */
  content?: string;
  /** Placeholder text when editor is empty */
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
  /** 
   * Plugin-specific options 
   * Each plugin can have its own options, keyed by plugin name.
   * All plugins support the 'enabled' option to enable/disable the plugin.
   * Example: { image: { upload: true }, bullet_list: { enabled: false } }
   */
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
```

### EditorPlugin

```typescript
interface EditorPlugin {
  /** Reference to the editor instance */
  editor: Editor;
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
  /** Get schema nodes for this plugin */
  getNodes?: () => Record<string, any>;
  /** Get schema marks for this plugin */
  getMarks?: () => Record<string, any>;
  /** Handle paste events (optional) */
  onPaste?: (data: { text: string; html: string; view: EditorView }) => boolean | {
    text: string;
    html: string;
    view: EditorView
  };
}
```

### ToolbarButtonDefinition

```typescript
interface ToolbarButtonDefinition {
  /** Unique name for the button */
  name: string;
  /** Display title for the button */
  title: string;
  /** Icon or text to display on the button */
  icon: string | HTMLElement;
  /** Whether the button is active */
  isActive?: (view: EditorView) => boolean;
  /** Action to perform when the button is clicked */
  action: (view: EditorView) => void;
  /** Optional dropdown menu items */
  dropdown?: ToolbarDropdownItem[];
}
```

### ToolbarDropdownItem

```typescript
interface ToolbarDropdownItem {
  /** Unique name for the dropdown item */
  name: string;
  /** Display title for the dropdown item */
  title: string;
  /** Action to perform when the dropdown item is clicked */
  action: (view: EditorView) => void;
}
```

### Dropdown

The Dropdown class is used internally by the toolbar to create dropdown menus for buttons. It uses PopperJS for positioning.

```typescript
interface DropdownOptions {
  /** Reference element that the dropdown will be positioned relative to */
  reference: HTMLElement;
  /** Content element to show in the dropdown */
  content: HTMLElement;
  /** CSS class name to add to the dropdown */
  className?: string;
  /** Placement of the dropdown relative to the reference element */
  placement?: Placement; // From PopperJS
  /** Offset of the dropdown from the reference element */
  offset?: [number, number];
  /** Whether to close the dropdown when clicking outside */
  closeOnClickOutside?: boolean;
}
```

#### Methods

- `show()`: Shows the dropdown
- `hide()`: Hides the dropdown
- `isVisible()`: Returns whether the dropdown is currently visible
- `destroy()`: Destroys the dropdown and cleans up resources

## Available Plugins

FlowMD comes with several built-in plugins:

| Plugin | Name | Description |
|--------|------|-------------|
| `Base` | base | Base plugin class that all plugins extend |
| `ToolbarBase` | toolbar | Base class for toolbar plugins |
| `Bold` | bold | Adds bold formatting |
| `Italic` | italic | Adds italic formatting |
| `Strikethrough` | strikethrough | Adds strikethrough formatting |
| `Heading` | heading | Adds heading formatting |
| `Image` | image | Adds image insertion |
| `Link` | link | Adds link insertion |
| `Linkify` | linkify | Automatically converts URLs to links |
| `BulletList` | bullet_list | Adds bullet list formatting |
| `OrderedList` | ordered_list | Adds ordered list formatting |
| `Blockquote` | blockquote | Adds blockquote formatting |
| `CodeBlock` | codeblock | Adds code block formatting |
| `Emoji` | emoji | Adds emoji support |
| `Placeholder` | placeholder | Adds placeholder text when editor is empty |
