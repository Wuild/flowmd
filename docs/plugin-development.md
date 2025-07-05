# FlowMD Plugin Development Guide

FlowMD provides a powerful plugin system that allows you to extend the editor with custom functionality. This guide will walk you through creating your own plugins.

## Table of Contents

- [Plugin Architecture](#plugin-architecture)
- [Creating a Basic Plugin](#creating-a-basic-plugin)
- [Creating a Toolbar Plugin](#creating-a-toolbar-plugin)
- [Plugin Options](#plugin-options)
- [Advanced Plugin Techniques](#advanced-plugin-techniques)
- [Examples](#examples)

## Plugin Architecture

FlowMD plugins are TypeScript/JavaScript classes that implement the `EditorPlugin` interface. The plugin system is built on top of ProseMirror's plugin architecture, but provides a simpler API for common tasks.

### Plugin Lifecycle

1. **Registration**: Plugins are registered with the editor using `editor.registerPlugin()` or via the `plugins` option when creating the editor.
2. **Initialization**: The editor calls the plugin's `init()` method, passing the editor instance and options.
3. **Operation**: The plugin interacts with the editor through the provided API.
4. **Destruction**: When the editor is destroyed, it calls the plugin's `destroy()` method if available.

### Plugin Interface

All plugins must implement the `EditorPlugin` interface:

```typescript
interface EditorPlugin {
  // Reference to the editor instance (set automatically)
  editor: Editor;
  
  // Unique name for the plugin
  name: string;
  
  // Initialize the plugin
  init: (editor: Editor, options: EditorOptions) => void;
  
  // Plugin state (optional)
  state?: any;
  
  // Keymap for the plugin (optional)
  keymap?: Record<string, any>;
  
  // Get the ProseMirror plugin instance (optional)
  getPlugin?: () => import('prosemirror-state').Plugin;
}
```

## Creating a Basic Plugin

To create a basic plugin, extend the `Base` class which provides common functionality:

```typescript
import { Base } from 'flowmd';
import { Plugin } from 'prosemirror-state';

export class MyPlugin extends Base {
  // Unique name for the plugin
  name = 'my-plugin';
  
  // Initialize the plugin
  init(editor, options) {
    // Always call super.init() first
    super.init(editor, options);
    
    // Your initialization code here
    console.log('My plugin initialized');
  }
  
  // Get the ProseMirror plugin (optional)
  getPlugin() {
    return new Plugin({
      // ProseMirror plugin configuration
      props: {
        // Handle clicks, keydown, etc.
      }
    });
  }
  
  // Clean up when plugin is destroyed (optional)
  destroy() {
    console.log('My plugin destroyed');
  }
}
```

## Creating a Toolbar Plugin

To add a button to the editor toolbar, extend the `ToolbarBase` class:

```typescript
import { ToolbarBase } from 'flowmd';
import { toggleMark } from 'prosemirror-commands';
import { schema } from 'flowmd';

export class MyToolbarPlugin extends ToolbarBase {
  // Unique name for the plugin
  name = 'my-toolbar-plugin';
  
  // Keymap for keyboard shortcuts (optional)
  keymap = {
    'Mod-m': toggleMark(schema.marks.strong)
  };
  
  // Define the toolbar button
  get buttonDefinition() {
    return {
      name: 'my-button',
      title: 'My Button',
      icon: '<svg>...</svg>', // SVG icon or HTML element
      isActive: (view) => {
        // Return true if the button should be highlighted
        return false;
      },
      action: (view) => {
        // Action to perform when the button is clicked
        console.log('Button clicked');
      }
    };
  }
}
```

## Plugin Options

You can provide plugin-specific options when creating the editor:

```javascript
const editor = createEditor({
  element: document.getElementById('editor'),
  pluginOptions: {
    // Options for the 'my-plugin' plugin
    'my-plugin': {
      option1: 'value1',
      option2: 'value2'
    }
  }
});
```

Inside your plugin, access these options:

```typescript
init(editor, options) {
  super.init(editor, options);
  
  // Access plugin-specific options
  const myOptions = this.state.options;
  if (myOptions) {
    console.log(myOptions.option1); // 'value1'
  }
}
```

## Advanced Plugin Techniques

### Handling Paste Events

Plugins can handle paste events by implementing the `onPaste` method:

```typescript
onPaste(data) {
  const { text, html, view } = data;
  
  // Handle paste event
  if (text.startsWith('http')) {
    // Do something with URLs
    return true; // Return true to indicate the paste was handled
  }
  
  // Return false to let other plugins handle the paste
  return false;
}
```

### Creating ProseMirror Plugins

For more advanced functionality, create a ProseMirror plugin:

```typescript
getPlugin() {
  return new Plugin({
    key: new PluginKey('my-plugin'),
    state: {
      init(_, instance) {
        return { /* initial state */ };
      },
      apply(tr, state, oldState, newState) {
        // Update state based on transaction
        return state;
      }
    },
    props: {
      handleKeyDown(view, event) {
        // Handle key events
        return false;
      },
      handleClick(view, pos, event) {
        // Handle click events
        return false;
      }
    },
    view(editorView) {
      return {
        update(view, prevState) {
          // Called when the view is updated
        },
        destroy() {
          // Clean up when the view is destroyed
        }
      };
    }
  });
}
```

### Creating UI Components

Plugins can create and manage UI components:

```typescript
init(editor, options) {
  super.init(editor, options);
  
  // Create UI elements
  this.button = document.createElement('button');
  this.button.textContent = 'My Button';
  this.button.addEventListener('click', this.handleClick.bind(this));
  
  // Add to the DOM
  editor.container.appendChild(this.button);
}

handleClick() {
  // Handle button click
}

destroy() {
  // Clean up
  this.button.removeEventListener('click', this.handleClick.bind(this));
  this.button.remove();
}
```

## Examples

### Simple Mark Plugin

This plugin adds a custom mark to the editor:

```typescript
import { Base } from 'flowmd';
import { toggleMark } from 'prosemirror-commands';
import { schema } from 'flowmd';

export class HighlightPlugin extends Base {
  name = 'highlight';
  
  keymap = {
    'Mod-h': toggleMark(schema.marks.highlight)
  };
  
  init(editor, options) {
    super.init(editor, options);
    
    // Register the mark with the schema
    // Note: In a real implementation, you would need to extend the schema
  }
  
  getPlugin() {
    return new Plugin({
      props: {
        // Add custom styling for the mark
        decorations(state) {
          // Create decorations for highlighted text
        }
      }
    });
  }
}
```

### Complex Toolbar Plugin

This example shows a more complex toolbar plugin with a dropdown:

```typescript
import { ToolbarBase } from 'flowmd';
import { schema } from 'flowmd';

export class ColorPlugin extends ToolbarBase {
  name = 'color';
  
  get buttonDefinition() {
    return {
      name: 'color',
      title: 'Text Color',
      icon: '<svg>...</svg>',
      isActive: (view) => false,
      action: (view) => {
        // Show color picker or apply default color
      },
      dropdown: [
        {
          name: 'red',
          title: 'Red',
          action: (view) => this.applyColor(view, 'red')
        },
        {
          name: 'blue',
          title: 'Blue',
          action: (view) => this.applyColor(view, 'blue')
        },
        {
          name: 'green',
          title: 'Green',
          action: (view) => this.applyColor(view, 'green')
        }
      ]
    };
  }
  
  applyColor(view, color) {
    // Apply the selected color to the text
  }
}
```

### Event Handling Plugin

This plugin listens to editor events:

```typescript
import { Base } from 'flowmd';

export class AnalyticsPlugin extends Base {
  name = 'analytics';
  
  init(editor, options) {
    super.init(editor, options);
    
    // Listen to editor events
    editor.addEventListener('change', this.handleChange.bind(this));
    editor.addEventListener('transaction', this.handleTransaction.bind(this));
  }
  
  handleChange({ markdown, html }) {
    // Track content changes
    console.log('Content changed:', markdown.length);
  }
  
  handleTransaction({ transaction }) {
    // Track specific operations
    if (transaction.steps.length > 0) {
      console.log('Operation performed:', transaction.steps[0].toJSON());
    }
  }
  
  destroy() {
    // Clean up event listeners
    this.editor.removeEventListener('change', this.handleChange.bind(this));
    this.editor.removeEventListener('transaction', this.handleTransaction.bind(this));
  }
}
```