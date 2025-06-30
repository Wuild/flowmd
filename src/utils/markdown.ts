import { Schema, Node as ProseMirrorNode } from 'prosemirror-model'
import { defaultMarkdownParser, defaultMarkdownSerializer, MarkdownParser, MarkdownSerializer, MarkdownSerializerState } from 'prosemirror-markdown'
import MarkdownIt from 'markdown-it'

// Define a custom markdown parser that uses our schema
let customMarkdownParser: MarkdownParser | null = null

/**
 * Convert markdown text to a ProseMirror document
 * @param markdown The markdown text to convert
 * @param schema The ProseMirror schema to use
 * @param markdownParser The markdown-it parser instance
 * @returns A ProseMirror document node
 */
export function markdownToDoc(markdown: string, schema: Schema, markdownParser: MarkdownIt): ProseMirrorNode {
  try {
    // Create a custom parser if it doesn't exist or if the schema has changed
    if (!customMarkdownParser || customMarkdownParser.schema !== schema) {
      customMarkdownParser = createCustomParser(schema, markdownParser)
    }

    // Use the custom parser to parse the markdown
    return customMarkdownParser.parse(markdown)
  } catch (error) {
    console.error('Error parsing markdown:', error)

    // Return an empty document if parsing fails
    return schema.node('doc', null, [schema.node('paragraph', null)])
  }
}

/**
 * Create a custom markdown parser that uses our schema
 * @param schema The ProseMirror schema to use
 * @param markdownParser The markdown-it parser instance
 * @returns A custom markdown parser
 */
function createCustomParser(schema: Schema, markdownParser: MarkdownIt): MarkdownParser {
  // Start with the default token handlers
  const tokens = {
    ...defaultMarkdownParser.tokens,

    // Add or override token handlers for our custom schema
    // Table support
    table: { block: 'table' },
    thead: { block: 'table_row' },
    tbody: { block: 'table_row' },
    tr: { block: 'table_row' },
    th: { block: 'table_header' },
    td: { block: 'table_cell' },

    // Task list support
    task_list_item: { block: 'list_item', getAttrs: (tok: any) => ({ checked: tok.attrGet('checked') === 'true' }) },

    // Additional marks
    s: { mark: 'strikethrough' },
    ins: { mark: 'ins' },
    mark: { mark: 'mark' },
    sub: { mark: 'sub' },
    sup: { mark: 'sup' }
  }

  // Create a new parser with our schema and token handlers
  // Use type assertion to work around type incompatibility
  return new MarkdownParser(schema, markdownParser as any, tokens)
}

// Define a custom markdown serializer that uses our schema
let customMarkdownSerializer: MarkdownSerializer | null = null

/**
 * Convert a ProseMirror document to markdown text
 * @param doc The ProseMirror document to convert
 * @returns The markdown text
 */
export function docToMarkdown(doc: ProseMirrorNode): string {
  try {
    // Create a custom serializer if it doesn't exist
    if (!customMarkdownSerializer) {
      customMarkdownSerializer = createCustomSerializer(doc.type.schema)
    }

    // Use the custom serializer to serialize the document
    return customMarkdownSerializer.serialize(doc)
  } catch (error) {
    console.error('Error serializing document:', error)
    return ''
  }
}

/**
 * Create a custom markdown serializer that uses our schema
 * @param schema The ProseMirror schema to use
 * @returns A custom markdown serializer
 */
function createCustomSerializer(schema: Schema): MarkdownSerializer {
  // Start with the default node and mark serializers
  const nodes = {
    ...defaultMarkdownSerializer.nodes,

    // Add or override serializers for our custom schema nodes
    // Table support
    table(state: MarkdownSerializerState, node: ProseMirrorNode) {
      // Ensure there's a newline before the table
      state.ensureNewLine()

      // Render each row
      node.forEach(row => {
        state.write('|')
        row.forEach(cell => {
          state.write(' ')
          state.renderInline(cell)
          state.write(' |')
        })
        state.ensureNewLine()

        // If this is the first row, add the header separator
        if (row.firstChild && row.firstChild.type.name === 'table_header') {
          state.write('|')
          row.forEach(() => {
            state.write(' --- |')
          })
          state.ensureNewLine()
        }
      })

      // Close the block
      state.closeBlock(node)
    },

    // We don't need to define serializers for table_row, table_cell, and table_header
    // as they are handled by the table serializer
  }

  const marks = {
    ...defaultMarkdownSerializer.marks,

    // Add or override serializers for our custom schema marks
    strikethrough: { open: '~~', close: '~~', mixable: true, expelEnclosingWhitespace: true },
    ins: { open: '++', close: '++', mixable: true, expelEnclosingWhitespace: true },
    mark: { open: '==', close: '==', mixable: true, expelEnclosingWhitespace: true },
    sub: { open: '~', close: '~', mixable: true, expelEnclosingWhitespace: true },
    sup: { open: '^', close: '^', mixable: true, expelEnclosingWhitespace: true }
  }

  // Create a new serializer with our node and mark serializers
  return new MarkdownSerializer(nodes, marks)
}

/**
 * Convert a ProseMirror document to HTML
 * @param doc The ProseMirror document to convert
 * @param markdownParser The markdown-it parser instance
 * @returns The HTML string
 */
export function docToHTML(doc: ProseMirrorNode, markdownParser: MarkdownIt): string {
  try {
    // First convert the document to markdown
    const markdown = docToMarkdown(doc)

    // Then use markdown-it to convert to HTML
    return markdownParser.render(markdown)
  } catch (error) {
    console.error('Error converting document to HTML:', error)
    return ''
  }
}

/**
 * Convert markdown text to HTML
 * @param markdown The markdown text to convert
 * @param markdownParser The markdown-it parser instance
 * @returns The HTML string
 */
export function markdownToHTML(markdown: string, markdownParser: MarkdownIt): string {
  try {
    return markdownParser.render(markdown)
  } catch (error) {
    console.error('Error converting markdown to HTML:', error)
    return ''
  }
}
