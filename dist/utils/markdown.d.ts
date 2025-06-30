import { Schema, Node as ProseMirrorNode } from 'prosemirror-model';
import MarkdownIt from 'markdown-it';
/**
 * Convert markdown text to a ProseMirror document
 * @param markdown The markdown text to convert
 * @param schema The ProseMirror schema to use
 * @param markdownParser The markdown-it parser instance
 * @returns A ProseMirror document node
 */
export declare function markdownToDoc(markdown: string, schema: Schema, markdownParser: MarkdownIt): ProseMirrorNode;
/**
 * Convert a ProseMirror document to markdown text
 * @param doc The ProseMirror document to convert
 * @returns The markdown text
 */
export declare function docToMarkdown(doc: ProseMirrorNode): string;
/**
 * Convert a ProseMirror document to HTML
 * @param doc The ProseMirror document to convert
 * @param markdownParser The markdown-it parser instance
 * @returns The HTML string
 */
export declare function docToHTML(doc: ProseMirrorNode, markdownParser: MarkdownIt): string;
/**
 * Convert markdown text to HTML
 * @param markdown The markdown text to convert
 * @param markdownParser The markdown-it parser instance
 * @returns The HTML string
 */
export declare function markdownToHTML(markdown: string, markdownParser: MarkdownIt): string;
//# sourceMappingURL=markdown.d.ts.map