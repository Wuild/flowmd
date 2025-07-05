/**
 * Dropdown component for the editor
 * This is a reusable component for creating dropdowns in the editor
 */

import {createPopper} from '@popperjs/core';
import type {Instance as PopperInstance, Placement} from '@popperjs/core';
import {EditorView} from 'prosemirror-view';

/**
 * Dropdown options
 */
export interface DropdownOptions {
  /** Reference element that the dropdown will be positioned relative to */
  reference: HTMLElement;
  /** Content for the dropdown (can be HTML string or DOM element) */
  content?: string | HTMLElement;
  /** CSS class to add to the dropdown (in addition to flowmd-editor__dropdown) */
  className?: string;
  /** Placement of the dropdown relative to the reference element */
  placement?: Placement;
  /** Offset from the reference element [x, y] */
  offset?: [number, number];
  /** Whether to close the dropdown when clicking outside */
  closeOnClickOutside?: boolean;
  /** Callback when the dropdown is shown */
  onShow?: () => void;
  /** Callback when the dropdown is hidden */
  onHide?: () => void;
  /** Callback when an item in the dropdown is clicked */
  onItemClick?: (item: HTMLElement, event: MouseEvent) => void;
  /** Editor view (needed for cursor positioning) */
  editorView?: EditorView;
  /** Position in the document (for cursor positioning) */
  position?: number;
}

/**
 * Dropdown class
 * A reusable component for creating dropdowns in the editor
 */
export class Dropdown {
  /** The dropdown element */
  private element: HTMLElement;
  /** The reference element */
  private reference: HTMLElement;
  /** The popper instance */
  private popper?: PopperInstance;
  /** Whether the dropdown is visible */
  private visible: boolean = false;
  /** Click outside handler */
  private clickOutsideHandler?: (event: MouseEvent) => void;
  /** Options */
  private options: DropdownOptions;

  /**
   * Constructor
   * @param options Dropdown options
   */
  constructor(options: DropdownOptions) {
    this.options = options;
    this.reference = options.reference;

    // Create dropdown element but don't append it to DOM yet
    this.element = document.createElement('div');
    this.element.className = 'flowmd-editor__dropdown';

    // Add additional class if provided
    if (options.className) {
      this.element.classList.add(options.className);
    }

    // Set content if provided
    if (options.content) {
      this.setContent(options.content);
    }

    // Prevent mousedown on dropdown from causing editor blur
    this.element.addEventListener('mousedown', (event) => {
      event.preventDefault();
    });

    // Add click handler for items
    if (options.onItemClick) {
      this.element.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        const item = target.closest('[data-dropdown-item]') as HTMLElement;
        if (item) {
          options.onItemClick?.(item, event);
        }
      });
    }
  }

  /**
   * Show the dropdown
   */
  public show(): void {
    if (this.visible) return;

    // Append to document body if not already there
    if (!this.element.parentNode) {
      document.body.appendChild(this.element);

      // Apply stored content if available
      if (this._content) {
        if (typeof this._content === 'string') {
          this.element.innerHTML = this._content;
        } else {
          this.element.innerHTML = '';
          this.element.appendChild(this._content);
        }
      }
    }

    // Position the dropdown
    this.position();

    // Show the dropdown
    this.element.style.display = 'block';
    this.visible = true;

    // Add click outside handler
    if (this.options.closeOnClickOutside !== false) {
      this.addClickOutsideHandler();
    }

    // Call onShow callback
    this.options.onShow?.();
  }

  /**
   * Hide the dropdown
   */
  public hide(): void {
    if (!this.visible) return;

    // Remove click outside handler
    this.removeClickOutsideHandler();

    // Remove from DOM
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    this.visible = false;

    // Call onHide callback
    this.options.onHide?.();
  }

  /**
   * Toggle the dropdown
   */
  public toggle(): void {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Set the content of the dropdown
   * @param content Content (HTML string or DOM element)
   */
  public setContent(content: string | HTMLElement): void {
    // Store content for later use if dropdown is not visible
    this._content = content;

    // Only update DOM if element is in the DOM
    if (this.element) {
      if (typeof content === 'string') {
        this.element.innerHTML = content;
      } else {
        this.element.innerHTML = '';
        this.element.appendChild(content);
      }
    }
  }

  // Store content for when dropdown is shown
  private _content?: string | HTMLElement;

  /**
   * Position the dropdown
   */
  private position(): void {
    // Make sure element is in the DOM
    if (!this.element.parentNode) {
      return;
    }

    // If we have a position and editor view, position near the cursor
    if (this.options.position !== undefined && this.options.editorView) {
      const coords = this.options.editorView.coordsAtPos(this.options.position);
      this.element.style.position = 'absolute';
      this.element.style.left = `${coords.left}px`;
      this.element.style.top = `${coords.bottom + (this.options.offset?.[1] || 5)}px`;
      return;
    }

    // Otherwise use PopperJS for positioning
    if (this.popper) {
      this.popper.destroy();
    }

    this.popper = createPopper(this.reference, this.element, {
      placement: this.options.placement || 'bottom-start',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: this.options.offset || [0, 4],
          },
        },
      ],
    });
  }

  /**
   * Add click outside handler
   */
  private addClickOutsideHandler(): void {
    // Use requestAnimationFrame to ensure we don't catch the current click event
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.clickOutsideHandler = (event: MouseEvent) => {
          const target = event.target as Node;

          // Don't close if clicking on the dropdown itself
          if (this.element.contains(target)) {
            return;
          }

          // Don't close if clicking on the reference element
          if (this.reference.contains(target)) {
            return;
          }

          // Don't close if clicking within the editor (for emoji dropdown)
          if (this.options.editorView && this.options.editorView.dom.contains(target)) {
            return;
          }

          // Close dropdown for any other clicks
          this.hide();
        };

        document.addEventListener('click', this.clickOutsideHandler);
      });
    });
  }

  /**
   * Remove click outside handler
   */
  private removeClickOutsideHandler(): void {
    if (this.clickOutsideHandler) {
      document.removeEventListener('click', this.clickOutsideHandler);
      this.clickOutsideHandler = undefined;
    }
  }

  /**
   * Update the dropdown position
   */
  public update(): void {
    // Only update if visible and element is in the DOM
    if (this.visible && this.element.parentNode) {
      if (this.popper) {
        this.popper.update();
      } else {
        this.position();
      }
    }
  }

  /**
   * Destroy the dropdown
   */
  public destroy(): void {
    // Hide the dropdown (this will also remove it from the DOM)
    this.hide();

    // Destroy popper instance
    if (this.popper) {
      this.popper.destroy();
      this.popper = undefined;
    }

    // Clear stored content
    this._content = undefined;
  }

  /**
   * Get the dropdown element
   * Note: The element might not be in the DOM if the dropdown is not visible
   */
  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Check if the dropdown is visible
   */
  public isVisible(): boolean {
    return this.visible;
  }
}
