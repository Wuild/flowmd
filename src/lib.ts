// Library entry point for ProseMirror Markdown Editor
import './styles/main.scss'

// Export the main editor class and types
export { FlowMD as default, FlowMD } from './editor/FlowMD'
export type { EditorOptions } from './editor/FlowMD'

// Export base plugin class for extending
export { BasePlugin } from './plugins/BasePlugin'

// Export all built-in plugins for advanced usage
export { default as BoldPlugin } from './plugins/BoldPlugin'
export { default as ItalicPlugin } from './plugins/ItalicPlugin'
export { default as StrikethroughPlugin } from './plugins/StrikethroughPlugin'
export { default as UnderlinePlugin } from './plugins/UnderlinePlugin'
export { default as InlineCodePlugin } from './plugins/InlineCodePlugin'
export { default as HeadingPlugin } from './plugins/HeadingPlugin'
export { default as BlockquotePlugin } from './plugins/BlockquotePlugin'
export { default as BulletListPlugin } from './plugins/BulletListPlugin'
export { default as OrderedListPlugin } from './plugins/OrderedListPlugin'
export { default as CodeBlockPlugin } from './plugins/CodeBlockPlugin'
export { default as LinkPlugin } from './plugins/LinkPlugin'
export { default as ImagePlugin } from './plugins/ImagePlugin'
export { default as TablePlugin } from './plugins/TablePlugin'
export { default as HorizontalRulePlugin } from './plugins/HorizontalRulePlugin'
export { default as ViewModePlugin } from './plugins/ViewModePlugin'
