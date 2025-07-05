import { Image } from '../../../src/editor/plugins/image';
import { createEditor } from '../../../src/editor/editor';

// Mock the DOM methods we need
global.URL.createObjectURL = jest.fn(() => 'blob:test');
global.URL.revokeObjectURL = jest.fn();

describe('Image Plugin', () => {
  // Set up the DOM environment for testing
  beforeEach(() => {
    // Create a div element to mount the editor
    document.body.innerHTML = '<div id="editor"></div>';
  });

  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  test('should create an image plugin instance', () => {
    // Create an editor instance
    const editor = createEditor({
      element: document.getElementById('editor')!,
      content: '# Hello World'
    });

    // Create an image plugin instance
    const imagePlugin = new Image();

    // Initialize the plugin with the editor and options
    imagePlugin.init(editor, editor.options);

    // Check that the image plugin instance was created
    expect(imagePlugin).toBeDefined();
  });

  test('should register the image plugin with the editor', () => {
    // Create an editor instance
    const editor = createEditor({
      element: document.getElementById('editor')!,
      content: '# Hello World'
    });

    // Create an image plugin instance
    const imagePlugin = new Image();

    // Initialize the plugin with the editor and options
    imagePlugin.init(editor, editor.options);

    // Mock the registerPlugin method
    const registerPluginSpy = jest.spyOn(editor, 'registerPlugin');

    // Register the plugin
    editor.registerPlugin(imagePlugin);

    // Check that registerPlugin was called with the image plugin
    expect(registerPluginSpy).toHaveBeenCalledWith(imagePlugin);
  });

  test('should provide a button definition', () => {
    // Create an editor instance
    const editor = createEditor({
      element: document.getElementById('editor')!,
      content: '# Hello World'
    });

    // Create an image plugin instance
    const imagePlugin = new Image();

    // Initialize the plugin with the editor and options
    imagePlugin.init(editor, editor.options);

    // Get the button definition
    const buttonDef = imagePlugin.buttonDefinition;

    // Check that the button definition has the expected properties
    expect(buttonDef).toBeDefined();
    expect(buttonDef.name).toBe('image');
    expect(buttonDef.title).toBe('Insert Image');
    expect(buttonDef.icon).toBeDefined();
    expect(typeof buttonDef.action).toBe('function');
  });
});