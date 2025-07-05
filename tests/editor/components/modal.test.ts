import { Modal } from '../../../src/editor/components/modal';
import type { ModalOptions } from '../../../src/editor/components/modal';

describe('Modal', () => {
  // Set up the DOM environment for testing
  beforeEach(() => {
    // Create a clean body
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Clean up
    document.body.innerHTML = '';
  });

  test('should create a modal instance', () => {
    // Create a modal instance
    const options: ModalOptions = {
      title: 'Test Modal',
      content: 'This is a test modal'
    };
    const modal = new Modal(options);

    // Check that the modal instance was created
    expect(modal).toBeDefined();
    expect(modal.isVisible()).toBe(false);
  });

  test('should show and hide the modal', () => {
    // Create a modal instance
    const options: ModalOptions = {
      title: 'Test Modal',
      content: 'This is a test modal'
    };
    const modal = new Modal(options);

    // Show the modal
    modal.show();
    expect(modal.isVisible()).toBe(true);
    expect(document.querySelector('.flowmd-editor__modal-overlay')).not.toBeNull();

    // Hide the modal
    modal.hide();
    expect(modal.isVisible()).toBe(false);
    expect(document.querySelector('.flowmd-editor__modal-overlay')).toBeNull();
  });

  test('should set content', () => {
    // Create a modal instance
    const options: ModalOptions = {
      title: 'Test Modal'
    };
    const modal = new Modal(options);

    // Set content
    modal.setContent('New content');
    modal.show();

    // Check that the content was set
    const contentElement = document.querySelector('.flowmd-editor__modal-content');
    expect(contentElement).not.toBeNull();
    expect(contentElement?.textContent).toBe('New content');
  });
});