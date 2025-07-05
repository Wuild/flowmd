/**
 * FlowMD - A WYSIWYG Markdown Editor
 */

// Export core components
export {createEditor, FlowMD} from './editor/editor';
export {schema} from './editor/schema';
export {Toolbar} from './editor/components/toolbar';

// Export plugins
export {Placeholder} from './editor/plugins/placeholder';
export {Base} from './editor/plugins/base';
export {ToolbarBase} from './editor/plugins/toolbar';
export {Bold} from './editor/plugins/bold';
export {Italic} from './editor/plugins/italic';
export {Strikethrough} from './editor/plugins/strikethrough';
export {Heading} from './editor/plugins/heading';
export {Image} from './editor/plugins/image';
export {Link} from './editor/plugins/link';
export {Linkify} from './editor/plugins/linkify';
export {BulletList} from './editor/plugins/bullet-list';
export {OrderedList} from './editor/plugins/ordered-list';
export {Blockquote} from './editor/plugins/blockquote';
export {CodeBlock} from './editor/plugins/codeblock';
export {Emoji} from './editor/plugins/emoji';

// Export utilities
export {fromMarkdown, toMarkdown, toHTML} from './editor/utils/markdown';

// Export types
export type {Editor, EditorOptions, EditorPlugin} from './editor/types';
export type {ToolbarOptions, ToolbarItem} from './editor/components/toolbar';