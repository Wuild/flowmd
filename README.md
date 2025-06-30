# FlowMD

A modern, extensible WYSIWYG Markdown Editor built with ProseMirror.

## Features

- **WYSIWYG Editing**: Real-time visual markdown editing with instant preview
- **Extensible Plugin System**: Easy to extend with custom functionality
- **Rich Formatting**: Support for bold, italic, strikethrough, underline, inline code
- **Advanced Elements**: Headers, blockquotes, lists, tables, images, links
- **Code Blocks**: Syntax highlighting with highlight.js
- **Dual Mode**: Switch between visual editor and source code view
- **Keyboard Shortcuts**: Full keyboard navigation and shortcuts
- **Theme Support**: Light, dark, and auto themes
- **Responsive**: Works on desktop and mobile devices

![Demo Image](https://github.com/wuild/flowmd/demo.png "Demo image")


## Installation

```bash
npm install flowmd
```

## Basic Usage

```typescript
import { FlowMD } from 'flowmd';
import 'flowmd/flowmd.css';

// Initialize editor
const editor = new FlowMD(document.getElementById('editor'), {
  placeholder: 'Start writing...',
  theme: 'auto',
  toolbar: 'bold,italic,|,heading,blockquote,|,image,link',
  onChange: (markdown) => {
    console.log('Content changed:', markdown);
  }
});
```

### HTML

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/flowmd/dist/flowmd.css">
</head>
<body>
  <div id="editor"></div>
  <script src="node_modules/flowmd/dist/flowmd.umd.js"></script>
  <script>
    new FlowMD.FlowMD(document.getElementById('editor'));
  </script>
</body>
</html>
```

## Configuration Options

```typescript
interface EditorOptions {
  placeholder?: string;
  onChange?: (markdown: string) => void;
  toolbar?: string; // e.g., "bold,italic,|,heading,blockquote"
  theme?: 'light' | 'dark' | 'auto';
  floatingToolbar?: boolean;
  minHeight?: string;
  maxHeight?: string;
  height?: string;
  autoResize?: boolean;
  debug?: boolean;
}
```

## Keyboard Shortcuts

- **Ctrl+B** / **Cmd+B**: Bold text
- **Ctrl+I** / **Cmd+I**: Italic text
- **Ctrl+U** / **Cmd+U**: Underline text
- **Ctrl+`** / **Cmd+`**: Inline code
- **Ctrl+K** / **Cmd+K**: Insert link
- **Ctrl+Shift+I** / **Cmd+Shift+I**: Insert image
- **Ctrl+Shift+M** / **Cmd+Shift+M**: Toggle source view
- **Ctrl+Alt+1-6** / **Cmd+Alt+1-6**: Headings 1-6
- **Ctrl+Alt+0** / **Cmd+Alt+0**: Paragraph
- **Ctrl+Shift+7** / **Cmd+Shift+7**: Ordered list
- **Ctrl+Shift+8** / **Cmd+Shift+8**: Bullet list
- **Ctrl+Shift+9** / **Cmd+Shift+9**: Blockquote

## API Reference

### Methods

- `getMarkdown()` - Get current markdown content
- `setContent(markdown: string)` - Set editor content
- `focus()` - Focus the editor
- `destroy()` - Clean up the editor

### Events

The `onChange` callback is triggered whenever the content changes:

```typescript
const editor = new FlowMD(element, {
  onChange: (markdown) => {
    // Handle content changes
    console.log(markdown);
  }
});
```

## Themes

FlowMD supports three theme modes:

- `light` - Light theme
- `dark` - Dark theme  
- `auto` - Automatically matches system preference

## Browser Support

FlowMD supports all modern browsers:

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [ProseMirror](https://prosemirror.net/)
- Syntax highlighting by [highlight.js](https://highlightjs.org/)
- Markdown parsing by [markdown-it](https://github.com/markdown-it/markdown-it)
