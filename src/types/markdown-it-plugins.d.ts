// TypeScript declarations for markdown-it plugins

declare module 'markdown-it-anchor' {
	import { PluginWithOptions } from 'markdown-it'

	interface AnchorOptions {
		level?: number | number[]
		slugify?: (s: string) => string
		permalink?: boolean | 'prepend' | 'append'
		permalinkClass?: string
		permalinkSymbol?: string
		permalinkBefore?: boolean
		permalinkHref?: (slug: string, state: any) => string
		permalinkAttrs?: (slug: string, state: any) => Record<string, any>
		permalinkSpace?: boolean
		permalinkSide?: 'left' | 'right'
		tabIndex?: boolean | number
		callback?: (token: any, anchor_info: any) => void
	}

	const plugin: PluginWithOptions<AnchorOptions>
	export = plugin
}

declare module 'markdown-it-table-of-contents' {
	import { PluginWithOptions } from 'markdown-it'

	interface TocOptions {
		includeLevel?: number[]
		containerClass?: string
		slugify?: (s: string) => string
		markerPattern?: RegExp
		listType?: 'ul' | 'ol'
		format?: (x: string, htmlencode: (x: string) => string) => string
		callback?: (html: string, ast: any) => string
		anchorLink?: boolean
		anchorLinkSymbol?: string
		anchorLinkBefore?: boolean
		anchorClassName?: string
		anchorLinkSpace?: boolean
		anchorLinkPrefix?: string
		tocClassName?: string
		tocFirstLevel?: number
		tocLastLevel?: number
		tocCallback?: (tocMarkdown: string, tocArray: any[], tocHtml: string) => void
		skipNoHeader?: boolean
	}

	const plugin: PluginWithOptions<TocOptions>
	export = plugin
}

declare module 'markdown-it-task-lists' {
	import { PluginWithOptions } from 'markdown-it'

	interface TaskListOptions {
		disabled?: boolean
		disabledCheckboxes?: boolean
		label?: boolean
		labelAfter?: boolean
	}

	const plugin: PluginWithOptions<TaskListOptions>
	export = plugin
}

declare module 'markdown-it-footnote' {
	import { PluginSimple } from 'markdown-it'

	const plugin: PluginSimple
	export = plugin
}

declare module 'markdown-it-deflist' {
	import { PluginSimple } from 'markdown-it'

	const plugin: PluginSimple
	export = plugin
}

declare module 'markdown-it-abbr' {
	import { PluginSimple } from 'markdown-it'

	const plugin: PluginSimple
	export = plugin
}

declare module 'markdown-it-ins' {
	import { PluginSimple } from 'markdown-it'

	const plugin: PluginSimple
	export = plugin
}

declare module 'markdown-it-mark' {
	import { PluginSimple } from 'markdown-it'

	const plugin: PluginSimple
	export = plugin
}

declare module 'markdown-it-sub' {
	import { PluginSimple } from 'markdown-it'

	const plugin: PluginSimple
	export = plugin
}

declare module 'markdown-it-sup' {
	import { PluginSimple } from 'markdown-it'

	const plugin: PluginSimple
	export = plugin
}

declare module 'markdown-it-emoji' {
	import { PluginWithOptions } from 'markdown-it'

	interface EmojiOptions {
		defs?: Record<string, string>
		enabled?: string[]
		shortcuts?: Record<string, string | string[]>
	}

	export const bare: PluginWithOptions<EmojiOptions>
	export const full: PluginWithOptions<EmojiOptions>
	export const light: PluginWithOptions<EmojiOptions>
}
