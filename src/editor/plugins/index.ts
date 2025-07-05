/**
 * Export all plugins from the plugins folder
 */

// Export base classes
export { Base } from './base';
export { ToolbarBase } from './toolbar';

// Export concrete plugins
import { Placeholder } from './placeholder';
import { Bold } from './bold';
import { Italic } from './italic';
import { Strikethrough } from './strikethrough';
import { Heading } from './heading';
import { Image } from './image';
import { Link } from './link';
import { Linkify } from './linkify';
import { BulletList } from './bullet-list';
import { OrderedList } from './ordered-list';
import { Blockquote } from './blockquote';
import { CodeBlock } from './codeblock';
import { Code } from './code';
import { Emoji } from './emoji';
import { ViewSwitcher } from './view-switcher';
import { Fullscreen } from './fullscreen';

export { Placeholder } from './placeholder';
export { Bold } from './bold';
export { Italic } from './italic';
export { Strikethrough } from './strikethrough';
export { Heading } from './heading';
export { Image } from './image';
export { Link } from './link';
export { Linkify } from './linkify';
export { BulletList } from './bullet-list';
export { OrderedList } from './ordered-list';
export { Blockquote } from './blockquote';
export { CodeBlock } from './codeblock';
export { Code } from './code';
export { Emoji } from './emoji';
export { ViewSwitcher } from './view-switcher';
export { Fullscreen } from './fullscreen';

// Export a function to get all plugins
export function getAllPlugins() {
  return [
    // Don't include base classes
    new Placeholder(),
    new Bold(),
    new Italic(),
    new Strikethrough(),
    new Heading(),
    new Image(),
    new Link(),
    new Linkify(),
    new BulletList(),
    new OrderedList(),
    new Blockquote(),
    new CodeBlock(),
    new Code(),
    new Emoji(),
    new ViewSwitcher(),
    new Fullscreen()
  ];
}
