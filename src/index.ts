import './styles/main.scss'
import './styles/demo.scss'
import { FlowMD } from './editor/FlowMD'

// Initialize the editor when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
	const editorContainer = document.getElementById('editor-container')

	if (!editorContainer) {
		console.error('Editor container not found')
		return
	}

	// Create the editor instance - it will automatically read initial content from the element
	const editor = new FlowMD(editorContainer, {
		placeholder: 'Start writing your markdown...',
		// Updated toolbar configuration to include the viewMode plugin
		toolbar:
			'bold,italic,strikethrough,|,heading,blockquote,|,bulletList,orderedList,|,link,image,codeBlock,table,horizontalRule,|,viewMode',
		theme: 'light',
		floatingToolbar: false, // Disable floating toolbar for better UX with view switching
		onChange: (markdown: string) => {
			// Optional: Log changes or sync with external systems
			console.log('Markdown updated:', markdown.length + ' characters')
		},
	})
})
