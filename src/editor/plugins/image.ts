/**
 * Image plugin for the editor
 */

import { EditorView } from 'prosemirror-view';
import { Plugin } from 'prosemirror-state';
import { ToolbarBase } from './toolbar';
import type { ToolbarButtonDefinition } from './toolbar';
import { createIconSync } from '../utils/icons';
import { Modal, type ModalField } from '../components/modal';
import { Toolbox } from '../components/toolbox';
import type { ToolboxButtonDefinition } from '../components/toolbox';

/**
 * Plugin that adds an image button to the toolbar
 */
export class Image extends ToolbarBase {
  /**
   * The name of the plugin
   */
  name = 'image';


  /**
   * Modal instance
   */
  private modal: Modal | null = null;

  /**
   * Toolbox instance
   */
  private toolbox: Toolbox | null = null;

  /**
   * The toolbar button definition
   */
  get buttonDefinition(): ToolbarButtonDefinition {
    return {
      name: 'image',
      title: 'Insert Image',
      icon: createIconSync('image'),
      isActive: () => false, // Images are not "active" in the traditional sense
      action: (view: EditorView) => {
        this.showImageModal(view);
      }
    };
  }

  /**
   * Show the image modal
   */
  private showImageModal(view: EditorView): void {
    // Check if upload is enabled in options
    const uploadEnabled = this.state.options?.upload === true;
    const uploadUrl = this.state.options?.uploadUrl || '';

    // Define fields for the modal
    const fields: ModalField[] = [
      {
        type: 'url',
        name: 'src',
        label: 'Image URL',
        placeholder: 'https://example.com/image.jpg',
        required: true
      },
      {
        type: 'text',
        name: 'alt',
        label: 'Alt Text (optional)',
        placeholder: 'Description of the image'
      }
    ];

    // If upload is enabled, add the upload area as an HTML element field
    if (uploadEnabled) {
      // Create a container for the upload functionality
      const uploadContainer = document.createElement('div');
      uploadContainer.className = 'flowmd-image-upload-container';

      // Create upload area
      const uploadArea = document.createElement('div');
      uploadArea.className = 'upload-area';

      const uploadText = document.createElement('p');
      uploadText.textContent = 'Drag & drop an image here, or click to select';
      uploadArea.appendChild(uploadText);

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      uploadArea.appendChild(fileInput);

      // Preview area
      const previewArea = document.createElement('div');
      previewArea.className = 'upload-preview';

      // Add upload area and preview area to the container
      uploadContainer.appendChild(uploadArea);
      uploadContainer.appendChild(previewArea);

      // Add the upload container as an HTML element field
      fields.push({
        type: 'html',
        name: 'upload',
        label: 'Upload Image',
        element: uploadContainer
      });
    }

    // Destroy old modal if it exists
    if (this.modal) {
      this.modal.destroy();
    }

    // Create a new modal with the fields and onConfirm callback
    this.modal = new Modal({
      title: 'Insert Image',
      className: 'flowmd-editor__modal--image',
      confirmText: 'Insert',
      cancelText: 'Cancel',
      fields: fields,
      onConfirm: (formData) => {
        if (!formData) return;

        const src = formData.src.trim();
        if (src) {
          // Basic URL validation
          try {
            new URL(src);
            const alt = formData.alt?.trim() || '';
            const { state, dispatch } = view;
            const node = this.editor.schema.nodes.image.create({ src, alt });
            const tr = state.tr.replaceSelectionWith(node);
            dispatch(tr);
            view.focus();
          } catch (e) {
            // Invalid URL
            alert('Please enter a valid URL');
            return;
          }
        }
      }
    });

    // If upload is enabled, we need to set up the event handlers for the upload area
    if (uploadEnabled) {
      // Get the form element from the modal
      const form = this.modal.getFormElement();

      if (form) {
        // Get references to the input fields
        const urlInput = form.querySelector('input[name="src"]') as HTMLInputElement;
        const altInput = form.querySelector('input[name="alt"]') as HTMLInputElement;
        const uploadArea = form.querySelector('.upload-area') as HTMLElement;
        const fileInput = uploadArea.querySelector('input[type="file"]') as HTMLInputElement;
        const previewArea = form.querySelector('.upload-preview') as HTMLElement;

        // Handle file selection
        fileInput.addEventListener('change', () => {
          if (fileInput.files && fileInput.files[0]) {
            this.handleFileUpload(fileInput.files[0], uploadUrl, urlInput, altInput, previewArea, view);
          }
        });

        // Handle click on upload area
        uploadArea.addEventListener('click', () => {
          fileInput.click();
        });

        // Handle drag and drop
        uploadArea.addEventListener('dragover', (e) => {
          e.preventDefault();
          uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
          uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
          e.preventDefault();
          uploadArea.classList.remove('drag-over');

          if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
            this.handleFileUpload(e.dataTransfer.files[0], uploadUrl, urlInput, altInput, previewArea, view);
          }
        });
      }
    }

    // Show the modal
    this.modal.show();
  }

  /**
   * Handle file upload
   */
  private handleFileUpload(
    file: File, 
    uploadUrl: string, 
    urlInput: HTMLInputElement, 
    altInput: HTMLInputElement, 
    previewArea: HTMLElement,
    view: EditorView
  ): void {
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      previewArea.innerHTML = '';
      const img = document.createElement('img');
      img.src = e.target?.result as string;
      previewArea.appendChild(img);

      // If no uploadUrl is provided, use the base64 data directly
      if (!uploadUrl) {
        const base64Data = e.target?.result as string;
        urlInput.value = base64Data;

        // Use the filename as alt text if none is provided
        if (!altInput.value.trim()) {
          altInput.value = file.name.split('.')[0]; // Remove file extension
        }

        // Automatically insert the image
        if (this.modal && this.modal.isVisible()) {
          const src = base64Data;
          const alt = altInput.value.trim();
          const { state, dispatch } = view;
          const node = this.editor.schema.nodes.image.create({ src, alt });
          const tr = state.tr.replaceSelectionWith(node);
          dispatch(tr);

          // Close the modal
          this.modal.hide();

          // Focus the editor
          view.focus();
        }
      }
    };
    reader.readAsDataURL(file);

    // Only upload to server if uploadUrl is provided
    if (uploadUrl) {
      const formData = new FormData();
      formData.append('image', file);

      fetch(uploadUrl, {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.url) {
          urlInput.value = data.url;

          // If we have alt or name from the server, use them
          if (data.alt) {
            altInput.value = data.alt;
          } else if (data.name) {
            // Use name as alt if no alt is provided
            altInput.value = data.name;
          }

          // Automatically insert the image if we have all required data
          if (this.modal && this.modal.isVisible()) {
            // Insert the image directly
            const src = urlInput.value.trim();
            if (src) {
              const alt = altInput.value.trim();
              const { state, dispatch } = view;
              const node = this.editor.schema.nodes.image.create({ src, alt });
              const tr = state.tr.replaceSelectionWith(node);
              dispatch(tr);

              // Close the modal
              this.modal.hide();

              // Focus the editor
              view.focus();
            }
          }
        }
      })
      .catch(error => {
        console.error('Error uploading image:', error);
      });
    }
  }

  /**
   * Get the ProseMirror plugin
   */
  getPlugin() {
    return new Plugin({
      view: (view) => {
        // Initialize the toolbox
        this.toolbox = new Toolbox({
          editorView: view,
          className: 'flowmd-image-toolbox',
          placement: 'top'
        });

        // Add event listeners for drag and drop and paste
        const dom = view.dom as HTMLElement;

        // Handle drag and drop
        const handleDragOver = (e: DragEvent) => {
          if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
            e.preventDefault();
            e.stopPropagation();
            // Add drag-over class to the ProseMirror element
            view.dom.querySelector('.ProseMirror')?.classList.add('drag-over');
          }
        };

        const handleDragLeave = () => {
          // Remove drag-over class from the ProseMirror element
          view.dom.querySelector('.ProseMirror')?.classList.remove('drag-over');
        };

        const handleDrop = (e: DragEvent) => {
          if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            e.preventDefault();
            e.stopPropagation();
            // Remove drag-over class from the ProseMirror element
            view.dom.querySelector('.ProseMirror')?.classList.remove('drag-over');

            // Check if the file is an image
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
              // Get upload URL
              const uploadUrl = this.state.options?.uploadUrl || '';

              // Handle the image file
              this.handleDroppedImage(file, uploadUrl, view);
            }
          }
        };

        // Handle paste
        const handlePaste = (e: ClipboardEvent) => {
          if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
            const file = e.clipboardData.files[0];
            if (file.type.startsWith('image/')) {
              e.preventDefault();

              // Get upload URL
              const uploadUrl = this.state.options?.uploadUrl || '';

              // Handle the image file
              this.handleDroppedImage(file, uploadUrl, view);
            }
          }
        };

        dom.addEventListener('dragover', handleDragOver);
        dom.addEventListener('dragleave', handleDragLeave);
        dom.addEventListener('drop', handleDrop);
        dom.addEventListener('paste', handlePaste);

        return {
          update: () => {
            // Nothing to do on update
          },
          destroy: () => {
            // Clean up the toolbox when the plugin is destroyed
            if (this.toolbox) {
              this.toolbox.destroy();
              this.toolbox = null;
            }

            // Remove event listeners
            dom.removeEventListener('dragover', handleDragOver);
            dom.removeEventListener('dragleave', handleDragLeave);
            dom.removeEventListener('drop', handleDrop);
            dom.removeEventListener('paste', handlePaste);
          }
        };
      },
      props: {
        handleClickOn: (_view, _pos, node, nodePos, event, direct) => {
          // Only handle direct clicks on image nodes
          if (direct && node.type === this.editor.schema.nodes.image) {
            // Get the DOM node that was clicked
            const domNode = event.target as HTMLElement;

            // Show the toolbox with edit and remove buttons only if toolbar is enabled
            if (this.toolbox && this.state.editorOptions?.toolbar !== false) {
              const buttons: ToolboxButtonDefinition[] = [
                {
                  name: 'edit',
                  title: 'Edit Image',
                  icon: createIconSync('edit'),
                  action: (view, _pos) => {
                    this.editImage(view, nodePos);
                  }
                },
                {
                  name: 'remove',
                  title: 'Remove Image',
                  icon: createIconSync('delete'),
                  action: (view, _pos) => {
                    this.removeImage(view, nodePos);
                  }
                }
              ];

              this.toolbox.show(nodePos, domNode, buttons);
            }

            // Return true to indicate we've handled the click
            return true;
          }

          // Return false to let other handlers process the click
          return false;
        }
      }
    });
  }

  /**
   * Edit an image
   * @param view The editor view
   * @param pos Position of the image node
   */
  private editImage(view: EditorView, pos: number): void {
    const { state } = view;
    const node = state.doc.nodeAt(pos);

    if (!node || node.type !== this.editor.schema.nodes.image) {
      return;
    }

    // Get current image attributes
    const src = node.attrs.src || '';
    const alt = node.attrs.alt || '';

    // Define fields for the modal
    const fields: ModalField[] = [
      {
        type: 'url',
        name: 'src',
        label: 'Image URL',
        placeholder: 'https://example.com/image.jpg',
        value: src,
        required: true
      },
      {
        type: 'text',
        name: 'alt',
        label: 'Alt Text (optional)',
        placeholder: 'Description of the image',
        value: alt
      }
    ];

    // Destroy old modal if it exists
    if (this.modal) {
      this.modal.destroy();
    }

    // Create a new modal with the fields and onConfirm callback
    this.modal = new Modal({
      title: 'Edit Image',
      className: 'flowmd-editor__modal--image',
      confirmText: 'Update',
      cancelText: 'Cancel',
      fields: fields,
      onConfirm: (formData) => {
        if (!formData) return;

        const newSrc = formData.src.trim();
        if (newSrc) {
          // Basic URL validation
          try {
            new URL(newSrc);
            const newAlt = formData.alt?.trim() || '';
            const { dispatch } = view;
            const tr = state.tr.setNodeMarkup(pos, undefined, { src: newSrc, alt: newAlt });
            dispatch(tr);
            view.focus();
          } catch (e) {
            // Invalid URL
            alert('Please enter a valid URL');
            return;
          }
        }
      }
    });

    // Show the modal
    this.modal.show();
  }

  /**
   * Remove an image
   * @param view The editor view
   * @param pos Position of the image node
   */
  private removeImage(view: EditorView, pos: number): void {
    const { state, dispatch } = view;
    const node = state.doc.nodeAt(pos);

    if (!node || node.type !== this.editor.schema.nodes.image) {
      return;
    }

    // Delete the node
    const tr = state.tr.delete(pos, pos + node.nodeSize);
    dispatch(tr);
    view.focus();
  }

  /**
   * Handle dropped or pasted image
   * @param file The image file
   * @param uploadUrl The URL to upload the image to
   * @param view The editor view
   */
  private handleDroppedImage(file: File, uploadUrl: string, view: EditorView): void {
    // Check if upload is enabled
    const uploadEnabled = this.state.options?.upload === true;

    // Read the file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;

      // If upload is not enabled or no uploadUrl is provided, use base64 data directly
      if (!uploadEnabled || !uploadUrl) {
        // Insert the image with base64 data
        const { state, dispatch } = view;
        const alt = file.name.split('.')[0]; // Use filename as alt text
        const node = this.editor.schema.nodes.image.create({ src: base64Data, alt });
        const tr = state.tr.replaceSelectionWith(node);
        dispatch(tr);
        view.focus();
      } else {
        // Upload the image to the server
        const formData = new FormData();
        formData.append('image', file);

        fetch(uploadUrl, {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.url) {
            // Insert the image with the URL from the server
            const { state, dispatch } = view;
            const alt = data.alt || data.name || file.name.split('.')[0];
            const node = this.editor.schema.nodes.image.create({ src: data.url, alt });
            const tr = state.tr.replaceSelectionWith(node);
            dispatch(tr);
            view.focus();
          }
        })
        .catch(error => {
          console.error('Error uploading image:', error);

          // Fallback to base64 if upload fails
          const { state, dispatch } = view;
          const alt = file.name.split('.')[0];
          const node = this.editor.schema.nodes.image.create({ src: base64Data, alt });
          const tr = state.tr.replaceSelectionWith(node);
          dispatch(tr);
          view.focus();
        });
      }
    };
    reader.readAsDataURL(file);
  }

  /**
   * Clean up when plugin is destroyed
   */
  destroy(): void {
    if (this.modal) {
      this.modal.destroy();
      this.modal = null;
    }

    if (this.toolbox) {
      this.toolbox.destroy();
      this.toolbox = null;
    }
  }
}
