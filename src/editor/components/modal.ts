/**
 * Modal component for the editor
 * This is a reusable component for creating modals in the editor
 */

/**
 * Field types supported by the modal
 */
export type ModalFieldType = 'text' | 'url' | 'number' | 'checkbox' | 'select' | 'textarea' | 'display' | 'html';

/**
 * Field definition for the modal
 */
export interface ModalField {
  /** Type of the field */
  type: ModalFieldType;
  /** Name of the field (used as form field name) */
  name: string;
  /** Label for the field */
  label?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Default value */
  value?: string | number | boolean;
  /** Options for select fields */
  options?: Array<{value: string, label: string}>;
  /** Additional HTML attributes */
  attributes?: Record<string, string>;
  /** HTML element for html type fields */
  element?: HTMLElement;
}

/**
 * Modal options
 */
export interface ModalOptions {
  /** Title for the modal */
  title?: string;
  /** Content for the modal (can be HTML string or DOM element) */
  content?: string | HTMLElement;
  /** Fields for the modal (serialized data approach) */
  fields?: ModalField[];
  /** CSS class to add to the modal (in addition to flowmd-editor__modal) */
  className?: string;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether to close the modal when clicking outside */
  closeOnClickOutside?: boolean;
  /** Whether to close the modal when pressing escape */
  closeOnEscape?: boolean;
  /** Callback when the modal is shown */
  onShow?: () => void;
  /** Callback when the modal is hidden */
  onHide?: () => void;
  /** Callback when the modal is confirmed (OK button clicked) */
  onConfirm?: (formData?: Record<string, any>) => void;
  /** Callback when the modal is cancelled (Cancel button clicked) */
  onCancel?: () => void;
  /** Text for the confirm button */
  confirmText?: string;
  /** Text for the cancel button */
  cancelText?: string;
  /** Whether to show the footer with buttons */
  showFooter?: boolean;
}

/**
 * Modal class
 * A reusable component for creating modals in the editor
 */
export class Modal {
  /** The modal element */
  private element: HTMLFormElement;
  /** The modal overlay element */
  private overlay: HTMLElement;
  /** The modal content element */
  private contentElement: HTMLElement;
  /** The form element (if using fields) */
  private formElement: HTMLFormElement | null = null;
  /** Whether the modal is visible */
  private visible: boolean = false;
  /** Options */
  private options: ModalOptions;
  /** Field references for accessing values */
  private fieldRefs: Record<string, HTMLElement> = {};

  /**
   * Constructor
   * @param options Modal options
   */
  constructor(options: ModalOptions) {
    this.options = options;

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'flowmd-editor__modal-overlay';

    // Create modal element as a form
    this.element = document.createElement('form');
    this.element.className = 'flowmd-editor__modal-container';

    // Add submit event listener to the form
    this.element.addEventListener('submit', (e) => {
      e.preventDefault();
      if (this.element.checkValidity()) {
        // If we have a separate form element inside, use its data
        if (this.formElement) {
          const formData = this.getFormData();
          this.options.onConfirm?.(formData);
        } else {
          // Otherwise, just call onConfirm directly
          this.options.onConfirm?.();
        }
        this.hide();
      }
    });

    // Add additional class if provided
    if (options.className) {
      this.element.classList.add(options.className);
    }

    // Create header if title is provided
    if (options.title) {
      const header = document.createElement('div');
      header.className = 'flowmd-editor__modal-header';

      const title = document.createElement('h3');
      title.className = 'flowmd-editor__modal-title';
      title.textContent = options.title;
      header.appendChild(title);

      // Add close button
      const closeButton = document.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'flowmd-editor__modal-close';
      closeButton.textContent = '×';
      closeButton.addEventListener('click', () => this.hide());
      header.appendChild(closeButton);

      this.element.appendChild(header);
    }

    // Create content element
    this.contentElement = document.createElement('div');
    this.contentElement.className = 'flowmd-editor__modal-content';
    this.element.appendChild(this.contentElement);

    // Set content or fields if provided
    if (options.fields) {
      this.setFields(options.fields);
    } else if (options.content) {
      this.setContent(options.content);
    }

    // Create modal footer if needed
    if (options.showFooter !== false) {
      const footer = document.createElement('div');
      footer.className = 'flowmd-editor__modal-footer';

      const cancelButton = document.createElement('button');
      cancelButton.type = 'button'; // Explicitly set type to button to prevent form submission
      cancelButton.className = 'flowmd-editor__modal-button flowmd-editor__modal-cancel';
      cancelButton.textContent = options.cancelText || 'Cancel';
      cancelButton.addEventListener('click', () => {
        this.options.onCancel?.();
        this.hide();
      });
      footer.appendChild(cancelButton);

      const confirmButton = document.createElement('button');
      confirmButton.type = 'submit'; // Set type to submit to trigger form submission
      confirmButton.className = 'flowmd-editor__modal-button flowmd-editor__modal-confirm';
      confirmButton.textContent = options.confirmText || 'OK';
      // No need for click handler as the form's submit event will handle this
      footer.appendChild(confirmButton);

      this.element.appendChild(footer);
    }

    // Handle click outside
    if (options.closeOnClickOutside !== false) {
      this.overlay.addEventListener('click', (event) => {
        if (event.target === this.overlay) {
          this.hide();
        }
      });
    }

    // Handle escape key
    if (options.closeOnEscape !== false) {
      document.addEventListener('keydown', this.handleKeyDown);
    }
  }

  /**
   * Handle keydown event
   */
  private handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.visible) {
      this.hide();
    }
  };

  /**
   * Show the modal
   */
  public show(): void {
    if (this.visible) return;

    // Append to document body
    document.body.appendChild(this.overlay);
    this.overlay.appendChild(this.element);

    // Show the modal
    this.overlay.style.display = 'flex';
    this.visible = true;

    // Call onShow callback
    this.options.onShow?.();
  }

  /**
   * Hide the modal
   */
  public hide(): void {
    if (!this.visible) return;

    // Remove from DOM
    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }

    this.visible = false;

    // Call onHide callback
    this.options.onHide?.();
  }

  /**
   * Set the content of the modal
   * @param content Content (HTML string or DOM element)
   */
  public setContent(content: string | HTMLElement): void {
    // Clear existing content and reset form reference
    this.contentElement.innerHTML = '';
    this.fieldRefs = {};

    // Since the modal container is now a form, we'll use it as the form element
    this.formElement = this.element;

    if (typeof content === 'string') {
      this.contentElement.innerHTML = content;
    } else {
      this.contentElement.appendChild(content);
    }
  }

  /**
   * Set the fields of the modal using the serialized data approach
   * @param fields Array of field definitions
   */
  public setFields(fields: ModalField[]): void {
    // Clear existing content and form
    this.contentElement.innerHTML = '';
    this.fieldRefs = {};

    // Since the modal container is now a form, we don't need a separate form element
    // We'll use the container as the form
    this.formElement = this.element;

    // Generate fields directly in the content element
    fields.forEach(field => {
      this.generateField(field);
    });
  }

  /**
   * Generate a field based on its definition
   * @param field Field definition
   */
  private generateField(field: ModalField): void {
    // Create field container
    const fieldContainer = document.createElement('div');
    fieldContainer.className = 'flowmd-editor__modal-field';

    // Create label if provided
    if (field.label) {
      const label = document.createElement('label');
      label.textContent = field.label;
      label.htmlFor = field.name;
      fieldContainer.appendChild(label);
    }

    let inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLDivElement;

    // Create input based on type
    switch (field.type) {
      case 'text':
      case 'url':
      case 'number':
        inputElement = document.createElement('input');
        (inputElement as HTMLInputElement).type = field.type;
        if (field.placeholder) {
          (inputElement as HTMLInputElement).placeholder = field.placeholder;
        }
        if (field.value !== undefined) {
          (inputElement as HTMLInputElement).value = String(field.value);
        }
        if (field.required) {
          (inputElement as HTMLInputElement).required = true;
        }
        break;

      case 'textarea':
        inputElement = document.createElement('textarea');
        if (field.placeholder) {
          (inputElement as HTMLTextAreaElement).placeholder = field.placeholder;
        }
        if (field.value !== undefined) {
          (inputElement as HTMLTextAreaElement).value = String(field.value);
        }
        if (field.required) {
          (inputElement as HTMLTextAreaElement).required = true;
        }
        break;

      case 'checkbox':
        inputElement = document.createElement('input');
        (inputElement as HTMLInputElement).type = 'checkbox';
        if (field.value === true) {
          (inputElement as HTMLInputElement).checked = true;
        }
        break;

      case 'select':
        inputElement = document.createElement('select');
        if (field.required) {
          (inputElement as HTMLSelectElement).required = true;
        }

        // Add options
        if (field.options) {
          field.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            if (field.value === option.value) {
              optionElement.selected = true;
            }
            (inputElement as HTMLSelectElement).appendChild(optionElement);
          });
        }
        break;

      case 'display':
        inputElement = document.createElement('div');
        inputElement.className = 'flowmd-editor__modal-display-field';
        if (field.value !== undefined) {
          inputElement.textContent = String(field.value);
        }
        break;

      case 'html':
        // For html type, use the provided element directly
        if (field.element) {
          // Create a wrapper div to ensure type safety
          inputElement = document.createElement('div');
          inputElement.className = 'flowmd-editor__modal-html-field';
          inputElement.appendChild(field.element);
        } else {
          // If no element is provided, create an empty div
          inputElement = document.createElement('div');
          inputElement.className = 'flowmd-editor__modal-html-field';
        }
        break;

      default:
        inputElement = document.createElement('input');
        (inputElement as HTMLInputElement).type = 'text';
        break;
    }

    // Set common attributes
    inputElement.id = field.name;

    // Only set name attribute on form elements that support it
    if (inputElement instanceof HTMLInputElement || 
        inputElement instanceof HTMLSelectElement || 
        inputElement instanceof HTMLTextAreaElement) {
      inputElement.name = field.name;
    }

    // Add any additional attributes
    if (field.attributes) {
      Object.entries(field.attributes).forEach(([key, value]) => {
        inputElement.setAttribute(key, value);
      });
    }

    // Store reference to the field
    this.fieldRefs[field.name] = inputElement;

    // Add input to container
    fieldContainer.appendChild(inputElement);

    // Add field container to content element (not directly to the form)
    this.contentElement.appendChild(fieldContainer);
  }

  /**
   * Get the form data as an object
   */
  private getFormData(): Record<string, any> {
    const formData: Record<string, any> = {};

    // Collect data from all fields using the fieldRefs
    // This works regardless of where the fields are in the DOM
    Object.entries(this.fieldRefs).forEach(([name, element]) => {
      if (element instanceof HTMLInputElement) {
        if (element.type === 'checkbox') {
          formData[name] = element.checked;
        } else {
          formData[name] = element.value;
        }
      } else if (element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement) {
        formData[name] = element.value;
      } else if (element instanceof HTMLDivElement) {
        // Display field - use textContent
        formData[name] = element.textContent;
      }
    });

    return formData;
  }

  /**
   * Set the title of the modal
   * @param title Title text
   */
  public setTitle(title: string): void {
    const titleElement = this.element.querySelector('.flowmd-editor__modal-title') as HTMLElement;
    if (titleElement) {
      titleElement.textContent = title;
    } else {
      const header = this.element.querySelector('.flowmd-editor__modal-header') as HTMLElement;
      if (header) {
        const newTitle = document.createElement('h3');
        newTitle.className = 'flowmd-editor__modal-title';
        newTitle.textContent = title;
        header.insertBefore(newTitle, header.firstChild);
      }
    }
  }

  /**
   * Destroy the modal
   */
  public destroy(): void {
    // Hide the modal (this will also remove it from the DOM)
    this.hide();

    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  /**
   * Check if the modal is visible
   */
  public isVisible(): boolean {
    return this.visible;
  }

  /**
   * Get the form element (if using fields)
   */
  public getFormElement(): HTMLFormElement | null {
    return this.formElement;
  }
}
