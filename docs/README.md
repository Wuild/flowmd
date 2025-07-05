# FlowMD Documentation

Welcome to the FlowMD documentation. FlowMD is a WYSIWYG Markdown editor built with ProseMirror that provides a rich editing experience with a plugin system for extensibility.

## Documentation Index

### [User Guide](user-guide.md)
Learn how to use FlowMD in your projects, including installation, basic usage, configuration options, and examples.

**Topics covered:**
- Installation
- Basic usage
- Configuration options
- Form integration
- Height settings
- Working with content
- Toolbar customization
- Toolbar dropdowns
- Toolbar layout (separators and spacers)
- Events
- Examples

### [Plugin Development Guide](plugin-development.md)
Learn how to extend FlowMD with custom plugins to add new functionality.

**Topics covered:**
- Plugin architecture
- Creating basic plugins
- Creating toolbar plugins
- Plugin options
- Advanced plugin techniques
- Examples

### [API Reference](api-reference.md)
Comprehensive reference for the FlowMD API, including methods, events, and interfaces.

**Topics covered:**
- Editor API methods
- Events
- Interfaces
- Available plugins

## Getting Started

If you're new to FlowMD, we recommend starting with the [User Guide](user-guide.md) to learn the basics of using the editor. Once you're familiar with the editor, you can explore the [Plugin Development Guide](plugin-development.md) to learn how to extend it with custom functionality.

## Examples

Check out the `example` directory in the project root for working examples of FlowMD in action.

## Contributing

If you find any issues or have suggestions for improving the documentation, please open an issue or submit a pull request on GitHub.

## Testing

FlowMD uses Jest for testing. To run the tests, use the following commands:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

The tests are located in the `tests` directory and follow the same structure as the source code.
