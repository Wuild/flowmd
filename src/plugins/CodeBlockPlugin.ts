import { BasePlugin } from './BasePlugin';
import { setBlockType } from 'prosemirror-commands';
import { Command } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Node as ProseMirrorNode } from 'prosemirror-model';
import hljs from 'highlight.js';
import icon from '../assets/icons/code-solid.svg';
import { FlowMD } from '../editor/FlowMD';

// Custom NodeView for code blocks with syntax highlighting
class CodeBlockNodeView {
  public dom: HTMLElement;
  public contentDOM: HTMLElement;
  private node: ProseMirrorNode;
  private view: EditorView;
  private getPos: () => number | undefined;
  private isHighlighting: boolean = false;
  private lastHighlightedContent: string = '';

  constructor(node: ProseMirrorNode, view: EditorView, getPos: () => number | undefined) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    // Create the DOM structure
    this.dom = document.createElement('pre');
    this.dom.className = 'hljs';

    const language = node.attrs.params || '';
    if (language) {
      this.dom.setAttribute('data-language', language);
    }

    this.contentDOM = document.createElement('code');
    this.contentDOM.className = language ? `language-${language}` : '';
    this.contentDOM.setAttribute('spellcheck', 'false');

    this.dom.appendChild(this.contentDOM);

    // Store the initial content
    this.lastHighlightedContent = this.contentDOM.textContent || '';

    // Apply initial highlighting only if there's content
    if (this.lastHighlightedContent.trim()) {
      this.updateHighlighting();
    }
  }

  private updateHighlighting(): void {
    // Prevent infinite loops by checking if we're already highlighting
    if (this.isHighlighting) {
      return;
    }

    try {
      this.isHighlighting = true;

      // Get the current text content
      const textContent = this.contentDOM.textContent || '';

      // Only highlight if there's actual content and it changed
      if (!textContent.trim() || textContent === this.lastHighlightedContent) {
        return;
      }

      // Clear existing highlighting classes
      const language = this.node.attrs.params || '';
      this.contentDOM.className = language ? `language-${language}` : '';

      // Remove any existing hljs classes that might cause conflicts
      const hljsClasses = Array.from(this.contentDOM.classList).filter(cls => cls.startsWith('hljs-'));
      hljsClasses.forEach(cls => this.contentDOM.classList.remove(cls));

      // Apply highlighting using direct API to avoid DOM manipulation loops
      let result;
      if (language && hljs.getLanguage(language)) {
        result = hljs.highlight(textContent, { language });
      } else {
        result = hljs.highlightAuto(textContent);
      }

      // Only update innerHTML if we got a valid result and it's different
      if (result && result.value && result.value !== textContent) {
        // Temporarily disable ProseMirror's observation to prevent loops
        this.view.dom.contentEditable = 'false';
        this.contentDOM.innerHTML = result.value;
        this.view.dom.contentEditable = 'true';

        // Update our tracking
        this.lastHighlightedContent = textContent;
      }

      // Mark as highlighted to prevent re-highlighting
      this.contentDOM.setAttribute('data-highlighted', 'true');
    } catch (error) {
      console.warn('Error applying syntax highlighting:', error);
      // Ensure we don't get stuck in a loop by marking as highlighted even on error
      this.contentDOM.setAttribute('data-highlighted', 'true');
    } finally {
      this.isHighlighting = false;
    }
  }

  update(node: ProseMirrorNode): boolean {
    if (node.type !== this.node.type) {
      return false;
    }

    // Check if the language or content actually changed
    const languageChanged = node.attrs.params !== this.node.attrs.params;
    const contentChanged = node.textContent !== this.node.textContent;

    if (!languageChanged && !contentChanged) {
      return true; // No changes, skip update
    }

    this.node = node;
    const language = node.attrs.params || '';

    // Update language attribute
    if (language) {
      this.dom.setAttribute('data-language', language);
      this.contentDOM.className = `language-${language}`;
    } else {
      this.dom.removeAttribute('data-language');
      this.contentDOM.className = '';
    }

    // Only re-highlight if the language changed, not on every content change
    // This prevents loops during typing
    if (languageChanged) {
      this.contentDOM.removeAttribute('data-highlighted');
      // Use setTimeout to avoid issues with DOM updates only for language changes
      setTimeout(() => this.updateHighlighting(), 0);
    }

    return true;
  }

  selectNode(): void {
    this.dom.classList.add('ProseMirror-selectednode');
  }

  deselectNode(): void {
    this.dom.classList.remove('ProseMirror-selectednode');
  }

  destroy(): void {
    // Clean up any pending operations
    this.isHighlighting = false;
  }
}

export default class CodeBlockPlugin extends BasePlugin {
  constructor(editor: FlowMD) {
    super(editor);
    this.name = 'codeBlock';
    this.title = 'Code Block (Ctrl+Shift+C)';
    this.icon = icon;
  }

  public execute(): void {
    const nodeType = this.editor.schema.nodes.code_block;
    if (this.editor.view) {
      setBlockType(nodeType)(this.editor.view.state, this.editor.view.dispatch);
      this.editor.view.focus();
    }
  }

  public isActive(): boolean {
    if (!this.editor.view) {
      return false;
    }
    const { $from } = this.editor.view.state.selection;
    return $from.node().type === this.editor.schema.nodes.code_block;
  }

  public getKeymap(): { [key: string]: Command } {
    return {
      'Mod-Shift-c': (state, dispatch) => {
        return setBlockType(state.schema.nodes.code_block)(state, dispatch);
      },
    };
  }

  // Method to create the CodeBlockNodeView for the editor
  public static createCodeBlockNodeView(
    node: ProseMirrorNode,
    view: EditorView,
    getPos: () => number | undefined
  ): CodeBlockNodeView {
    return new CodeBlockNodeView(node, view, getPos);
  }

  // Helper method to highlight code blocks in static content
  public static highlightCodeBlocks(container: HTMLElement): void {
    const codeBlocks = container.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
      const codeElement = block as HTMLElement;

      // Skip if already highlighted or being processed
      if (
        codeElement.classList.contains('hljs') ||
        codeElement.hasAttribute('data-highlighted')
      ) {
        return;
      }

      try {
        const text = codeElement.textContent || '';
        if (!text.trim()) {
          return;
        }

        // Get language from class attribute
        const className = codeElement.className;
        const languageMatch = className.match(/language-(\w+)/);
        const language = languageMatch ? languageMatch[1] : '';

        // Apply highlighting using direct API
        let result;
        if (language && hljs.getLanguage(language)) {
          result = hljs.highlight(text, { language });
        } else {
          result = hljs.highlightAuto(text);
        }

        // Only update if we got a valid result
        if (result && result.value && result.value !== text) {
          codeElement.innerHTML = result.value;
          codeElement.classList.add('hljs');
          codeElement.setAttribute('data-highlighted', 'true');
        }
      } catch (error) {
        console.warn('Error highlighting static code block:', error);
        // Mark as processed even on error to prevent retries
        codeElement.setAttribute('data-highlighted', 'true');
      }
    });
  }
}
