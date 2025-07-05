import { createEditor } from '../../src/editor/editor';

describe('Editor', () => {
  // Set up the DOM environment for testing
  beforeEach(() => {
    // Create a div element to mount the editor
    document.body.innerHTML = '<div id="editor"></div>';
  });

  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
  });

  test('should create an editor instance', () => {
    // Create an editor instance
    const editor = createEditor({
      element: document.getElementById('editor')!
    });

    // Set content after creation
    editor.setContent('# Hello World');

    // Check that the editor instance was created
    expect(editor).toBeDefined();
    expect(editor.getMarkdown()).toBe('# Hello World');
  });

  test('should update content', () => {
    // Create an editor instance
    const editor = createEditor({
      element: document.getElementById('editor')!
    });

    // Set initial content
    editor.setContent('# Initial Content');

    // Update the content
    editor.setContent('# Updated Content');

    // Check that the content was updated
    expect(editor.getMarkdown()).toBe('# Updated Content');
  });
});
