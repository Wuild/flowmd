/**
 * Toolbox component for the editor
 * This component shows a floating toolbox with buttons when clicking on certain elements like images or links
 */

import {createPopper} from '@popperjs/core';
import type {Instance as PopperInstance, Placement} from '@popperjs/core';
import {EditorView} from 'prosemirror-view';

/**
 * Toolbox button definition
 */
export interface ToolboxButtonDefinition {
  /** Unique name for the button */
  name: string;
  /** Display title for the button */
  title: string;
  /** Icon or text to display on the button */
  icon: string | HTMLElement;
  /** Action to perform when the button is clicked */
  action: (view: EditorView, pos: number) => void;
}

/**
 * Toolbox options
 */
export interface ToolboxOptions {
  /** Editor view */
  editorView: EditorView;
  /** CSS class to add to the toolbox (in addition to flowmd-editor__toolbox) */
  className?: string;
  /** Placement of the toolbox relative to the reference element */
  placement?: Placement;
  /** Offset from the reference element [x, y] */
  offset?: [number, number];
}

/**
 * Toolbox class
 * A component that shows a floating toolbox with buttons when clicking on certain elements
 */
export class Toolbox {
  /** The toolbox element */
  private element: HTMLElement;
  /** The editor view */
  private editorView: EditorView;
  /** The popper instance */
  private popper?: PopperInstance;
  /** Whether the toolbox is visible */
  private visible: boolean = false;
  /** The current position in the document */
  private currentPos: number = 0;
  /** The reference element */
  private referenceElement?: HTMLElement;
  /** Options */
  private options: ToolboxOptions;
  /** Click outside handler */
  private clickOutsideHandler?: (event: MouseEvent) => void;

  /**
   * Constructor
   * @param options Toolbox options
   */
  constructor(options: ToolboxOptions) {
    this.options = options;
    this.editorView = options.editorView;

    // Create toolbox element
    this.element = document.createElement('div');
    this.element.className = 'flowmd-editor__toolbox';

    // Add additional class if provided
    if (options.className) {
      this.element.classList.add(options.className);
    }

    // Prevent mousedown on toolbox from causing editor blur
    this.element.addEventListener('mousedown', (event) => {
      event.preventDefault();
    });
  }

  /**
   * Show the toolbox for a specific node
   * @param pos Position of the node in the document
   * @param referenceElement DOM element to position the toolbox relative to
   * @param buttons Buttons to show in the toolbox
   */
  public show(pos: number, referenceElement: HTMLElement, buttons: ToolboxButtonDefinition[]): void {
    // Hide if already visible
    if (this.visible) {
      this.hide();
    }

    this.currentPos = pos;
    this.referenceElement = referenceElement;

    // Clear existing buttons
    this.element.innerHTML = '';

    // Create buttons
    buttons.forEach(button => {
      const buttonElement = document.createElement('button');
      buttonElement.type = 'button';
      buttonElement.className = 'flowmd-editor__toolbox__button';
      buttonElement.title = button.title;

      // Handle icon - either SVG element or text fallback
      if (button.icon instanceof HTMLElement) {
        buttonElement.appendChild(button.icon);
      } else {
        buttonElement.textContent = button.icon;
      }

      // Add click handler
      buttonElement.addEventListener('click', () => {
        button.action(this.editorView, this.currentPos);
        this.hide();
      });

      this.element.appendChild(buttonElement);
    });

    // Append to document body
    document.body.appendChild(this.element);

    // Position the toolbox
    this.position();

    // Show the toolbox
    this.element.style.display = 'flex';
    this.visible = true;

    // Add click outside handler
    this.addClickOutsideHandler();
  }

  /**
   * Hide the toolbox
   */
  public hide(): void {
    if (!this.visible) return;

    // Remove click outside handler
    this.removeClickOutsideHandler();

    // Remove from DOM
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }

    // Destroy popper instance
    if (this.popper) {
      this.popper.destroy();
      this.popper = undefined;
    }

    this.visible = false;
    this.currentPos = 0;
    this.referenceElement = undefined;
  }

  /**
   * Position the toolbox
   */
  private position(): void {
    // Make sure element is in the DOM and we have a reference element
    if (!this.element.parentNode || !this.referenceElement) {
      return;
    }

    // Use PopperJS for positioning
    if (this.popper) {
      this.popper.destroy();
    }

    this.popper = createPopper(this.referenceElement, this.element, {
      placement: this.options.placement || 'top',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: this.options.offset || [0, 8],
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
      this.clickOutsideHandler = (event: MouseEvent) => {
        const target = event.target as Node;

        // Don't close if clicking on the toolbox itself
        if (this.element.contains(target)) {
          return;
        }

        // Don't close if clicking on the reference element
        if (this.referenceElement && this.referenceElement.contains(target)) {
          return;
        }

        // Close toolbox for any other clicks
        this.hide();
      };

      document.addEventListener('click', this.clickOutsideHandler);
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
   * Destroy the toolbox
   */
  public destroy(): void {
    // Hide the toolbox (this will also remove it from the DOM)
    this.hide();
  }

  /**
   * Check if the toolbox is visible
   */
  public isVisible(): boolean {
    return this.visible;
  }
}