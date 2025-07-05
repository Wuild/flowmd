/**
 * Code block plugin for the editor
 */

import { EditorView } from 'prosemirror-view';
import { setBlockType, toggleMark } from 'prosemirror-commands';
import { ToolbarBase } from './toolbar';
import type { ToolbarButtonDefinition } from './toolbar';
import { createIconSync } from '../utils/icons';

/**
 * Plugin that adds a code block button to the toolbar
 */
export class CodeBlock extends ToolbarBase {
  /**
   * The name of the plugin
   */
  name = 'codeblock';


  /**
   * Keymap for code block formatting
   */
  get keymap() {
    return {
      'Shift-Ctrl-\\': setBlockType(this.editor.schema.nodes.code_block),
    };
  }

  /**
   * The toolbar button definition
   */
  get buttonDefinition(): ToolbarButtonDefinition {
    return {
      name: 'codeblock',
      title: 'Code Block',
      icon: createIconSync('codeblock'),
      isActive: (view: EditorView) => {
        const { state } = view;
        const { selection } = state;
        const { $from } = selection;
        return $from.node().type === this.editor.schema.nodes.code_block;
      },
      action: (view: EditorView) => {
        const { state } = view;
        const { selection } = state;
        const { $from, $to } = selection;

        // Check if the selection is within a list item or blockquote
        let isInListOrQuote = false;
        let depth = $from.depth;

        // Check ancestors to see if we're in a list item or blockquote
        while (depth > 0) {
          const node = $from.node(depth);
          if (node.type === this.editor.schema.nodes.list_item || 
              node.type === this.editor.schema.nodes.blockquote) {
            isInListOrQuote = true;
            break;
          }
          depth--;
        }

        // If we're in a list item or blockquote, apply inline code mark instead
        if (isInListOrQuote) {
          // Check if the selection spans multiple blocks
          const sameBlock = $from.sameParent($to) && $from.parent.isTextblock;

          // Only apply inline code if selection is within a single text block
          if (sameBlock) {
            toggleMark(this.editor.schema.marks.code)(state, view.dispatch);
          } else {
            console.warn('Cannot apply inline code to a selection that spans multiple blocks');
          }
        } else {
          // Regular code block logic for non-list, non-blockquote content
          const range = $from.blockRange($to);

          if (!range) {
            console.warn('Cannot apply code block: no valid block range');
            return;
          }

          // Check if the selection contains only content that can be in a code block
          let canApplyCodeBlock = true;
          state.doc.nodesBetween(range.start, range.end, (node) => {
            if (node.isBlock && node.type !== this.editor.schema.nodes.paragraph) {
              // Only paragraphs can be directly converted to code blocks
              canApplyCodeBlock = false;
              return false; // Stop traversal
            }
            return true; // Continue traversal
          });

          if (canApplyCodeBlock) {
            setBlockType(this.editor.schema.nodes.code_block)(state, view.dispatch);
          } else {
            console.warn('Cannot apply code block to the current selection');
          }
        }

        view.focus();
      }
    };
  }
}
