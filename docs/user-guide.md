# FlowMD User Guide

FlowMD is a WYSIWYG Markdown editor built with ProseMirror. This guide will help you get started with using the editor in your projects.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Configuration Options](#configuration-options)
- [Working with Content](#working-with-content)
- [Toolbar](#toolbar)
- [Events](#events)
- [Examples](#examples)

## Installation

Install FlowMD using npm:

```bash
npm install @wuild/flowmd
```

Or using yarn:

```bash
yarn add @wuild/flowmd
```

### CSS Styles

FlowMD provides several CSS files that you can import based on your needs:

```javascript
// Import the default editor styles
import '@wuild/flowmd/styles/editor.css';

// Import the ProseMirror-specific styles
import '@wuild/flowmd/styles/prosemirror.css';

// Import the light theme (optional)
import '@wuild/flowmd/styles/themes/light.css';
```

## Basic Usage

Import the editor and create an instance:

```javascript
import { createEditor } from '@wuild/flowmd';
import '@wuild/flowmd/styles/editor.css'; // Import the default styles

// Get the container element
const editorElement = document.getElementById('editor');

// Create the editor
const editor = createEditor({
  element: editorElement,
  content: '# Hello World',
  toolbar: true
});
```

## Configuration Options

The editor accepts the following configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `element` | HTMLElement | *required* | The container element where the editor will be mounted |
| `content` | string | `''` | Initial content in markdown format |
| `placeholder` | string | `''` | Text shown when editor is empty |
| `toolbar` | boolean \| string | `true` | Whether to show the toolbar or a string to configure which buttons to show |
| `toolbarContainer` | HTMLElement | `null` | Container element for the toolbar |
| `plugins` | EditorPlugin[] | `[]` | Custom plugins to extend editor functionality |
| `pluginOptions` | object | `{}` | Plugin-specific options (see [Plugin Options](#plugin-options)) |
| `keymap` | object | `{}` | Custom keymap for keyboard shortcuts |
| `onChange` | function | `null` | Callback when content changes |
| `textarea` | string | `null` | Name attribute for hidden textarea to sync markdown content for form submission |
| `spellcheck` | boolean | `true` | Whether to enable browser spellcheck |
| `height` | string | `null` | Fixed height for the editor (CSS value) |
| `maxHeight` | string | `null` | Maximum height for the editor (CSS value) |
| `minHeight` | string | `null` | Minimum height for the editor (CSS value) |

### Plugin Options

The `pluginOptions` option allows you to configure specific plugins. Each plugin can have its own set of options:

```javascript
const editor = createEditor({
  element: document.getElementById('editor'),
  pluginOptions: {
    // Options for the image plugin
    image: {
      upload: true,
      uploadUrl: "https://api.example.com/upload"
    },
    // Disable specific plugins
    bullet_list: {
      enabled: false
    },
    ordered_list: {
      enabled: false
    }
  }
});
```

#### Common Plugin Options

All plugins support the following common options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Whether the plugin is enabled |

When a plugin is disabled:
- Its toolbar button will not be shown
- Its keyboard shortcuts will not be registered
- Its schema components (nodes and marks) will not be included in the schema
- Markdown syntax related to the plugin will not be parsed

For example, if you disable the `bold` plugin, the bold toolbar button will not be shown, the Ctrl+B shortcut will not work, and **bold text** in markdown will not be parsed as bold.

#### Plugin-Specific Options

Some plugins have additional options:

**Image Plugin**:
- `upload` (boolean): Whether to enable image upload
- `uploadUrl` (string): URL to upload images to

### Form Integration

When using the `textarea` option, FlowMD will create a hidden textarea with the specified name attribute and automatically sync the markdown content with it. This makes it easy to use the editor in forms:

```javascript
// Create editor with form integration
const editor = createEditor({
  element: document.getElementById('editor'),
  textarea: 'content' // Will create a hidden textarea with name="content"
});

// The form will automatically submit the markdown content
```

If you provide an existing textarea element as the `element` option, FlowMD will use that textarea for form submission:

```javascript
// Use an existing textarea
const textarea = document.getElementById('my-textarea');
const editor = createEditor({
  element: textarea
});

// The textarea will be hidden and used for form submission
```

### Height Settings

You can control the editor's height using the `height`, `maxHeight`, and `minHeight` options:

```javascript
const editor = createEditor({
  element: document.getElementById('editor'),
  height: '400px', // Fixed height
  maxHeight: '600px', // Maximum height
  minHeight: '200px' // Minimum height
});
```

When using height settings:
- The editor will automatically add scrollbars when content exceeds the available space
- The toolbar (if enabled) will remain fixed at the top
- The editor will resize properly when the window is resized

## Working with Content

### Getting Content

You can get the current content as Markdown or HTML:

```javascript
// Get content as Markdown
const markdown = editor.getMarkdown();

// Get content as HTML
const html = editor.getHTML();
```

### Setting Content

You can set the content programmatically:

```javascript
// Set content from Markdown
editor.setContent('# New Content');
```

## Toolbar

The toolbar provides formatting options for the editor. You can customize which buttons to show:

```javascript
// Show all buttons
const editor = createEditor({
  element: editorElement,
  toolbar: true
});

// Show specific buttons
const editor = createEditor({
  element: editorElement,
  toolbar: "heading,bold,italic,|,link,image,|,bullet_list,ordered_list"
});
```

Available toolbar buttons:

- `heading` - Heading levels (dropdown with H1, H2, H3)
- `bold` - Bold text
- `italic` - Italic text
- `strikethrough` - Strikethrough text
- `link` - Insert link
- `image` - Insert image
- `bullet_list` - Bullet list
- `ordered_list` - Ordered list
- `blockquote` - Blockquote
- `codeblock` - Code block
- `emoji` - Insert emoji

### Toolbar Layout

You can customize the toolbar layout using special items:

- `|` - Adds a vertical separator between button groups
- `spacer` - Adds a flexible space that pushes buttons to the left and right

Example with separators and spacers:

```javascript
const editor = createEditor({
  element: editorElement,
  toolbar: "bold,italic,|,link,image,spacer,codeblock"
});
```

This will place bold and italic buttons on the left, followed by a separator, then link and image buttons, and finally the codeblock button will be pushed to the right side of the toolbar.

### Toolbar Dropdowns

Some toolbar buttons like `heading` include dropdown menus. These dropdowns are positioned using PopperJS for optimal placement and user experience. Dropdowns automatically close when clicking outside or when selecting an option.

## Events

You can listen to editor events:

```javascript
// Listen for content changes
editor.addEventListener('change', ({ markdown, html }) => {
  console.log('Content changed:', markdown);
});

// Remove event listener
editor.removeEventListener('change', myCallback);
```

Available events:

- `change` - Triggered when content changes
- `transaction` - Triggered when a ProseMirror transaction is applied
- `contentSet` - Triggered when content is set programmatically
- `pluginRegistered` - Triggered when a plugin is registered
- `destroy` - Triggered when the editor is destroyed

## Examples

### Basic Editor with Toolbar

```javascript
import { createEditor } from '@wuild/flowmd';
import '@wuild/flowmd/styles/editor.css'; // Import the default styles

const editor = createEditor({
  element: document.getElementById('editor'),
  content: '# Getting Started\n\nThis is a **markdown** editor.',
  toolbar: true,
  onChange: (markdown, html) => {
    console.log('Markdown:', markdown);
    console.log('HTML:', html);
  }
});
```

### Custom Toolbar Configuration

```javascript
import { createEditor } from '@wuild/flowmd';
import '@wuild/flowmd/styles/editor.css'; // Import the default styles

const editor = createEditor({
  element: document.getElementById('editor'),
  toolbar: "heading,bold,italic,|,link,image,|,bullet_list,ordered_list",
  toolbarContainer: document.getElementById('custom-toolbar-container')
});
```

### Form Integration

```javascript
import { createEditor } from '@wuild/flowmd';
import '@wuild/flowmd/styles/editor.css'; // Import the default styles

// Create editor with form integration
const editor = createEditor({
  element: document.getElementById('editor'),
  textarea: 'content', // Will create a hidden textarea with name="content"
  content: document.getElementById('content-field').value
});

// The form will automatically submit the markdown content
```

### Custom Height Settings

```javascript
import { createEditor } from '@wuild/flowmd';
import '@wuild/flowmd/styles/editor.css'; // Import the default styles

const editor = createEditor({
  element: document.getElementById('editor'),
  minHeight: '200px',
  maxHeight: '500px'
});
```

### Custom Keyboard Shortcuts

```javascript
import { createEditor } from '@wuild/flowmd';
import '@wuild/flowmd/styles/editor.css'; // Import the default styles

const editor = createEditor({
  element: document.getElementById('editor'),
  keymap: {
    'Ctrl-s': (state, dispatch) => {
      // Custom save action
      saveContent(editor.getMarkdown());
      return true;
    },
    'Alt-h': (state, dispatch) => {
      // Insert heading
      if (dispatch) {
        const { schema } = state;
        const heading = schema.nodes.heading.create({ level: 2 });
        dispatch(state.tr.replaceSelectionWith(heading));
      }
      return true;
    }
  }
});
```

This example adds two custom keyboard shortcuts:
- `Ctrl-s` triggers a custom save function
- `Alt-h` inserts a level 2 heading at the current selection
