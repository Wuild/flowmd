/**
 * Toolbar plugin base class for the editor
 */

import { EditorView } from 'prosemirror-view';
import { Base } from './base';
import type { Editor, EditorOptions } from '../types';

/**
 * Interface for toolbar button definition
 */
export interface ToolbarButtonDefinition {
  /** Unique name for the button */
  name: string;
  /** Display title for the button */
  title: string;
  /** Icon or text to display on the button */
  icon: string|HTMLElement;
  /** Whether the button is active */
  isActive?: (view: EditorView) => boolean;
  /** Action to perform when the button is clicked */
  action: (view: EditorView) => void;
  /** Optional dropdown menu items */
  dropdown?: ToolbarDropdownItem[];
}

/**
 * Interface for toolbar dropdown item
 */
export interface ToolbarDropdownItem {
  /** Unique name for the dropdown item */
  name: string;
  /** Display title for the dropdown item */
  title: string;
  /** Action to perform when the dropdown item is clicked */
  action: (view: EditorView) => void;
}

/**
 * Abstract base class for toolbar plugins
 */
export abstract class ToolbarBase extends Base {
  /**
   * The toolbar button definition
   */
  abstract get buttonDefinition(): ToolbarButtonDefinition;

  /**
   * Initialize the plugin
   * @param editor The editor instance
   * @param options Editor options
   */
  init(editor: Editor, options: EditorOptions): void {
    super.init(editor, options);
    // Store the view for later use
    this.state.view = editor.view;
  }
}
