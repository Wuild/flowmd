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
			'bold,italic,strikethrough,|,heading,blockquote,|,bulletList,orderedList,|,link,image,codeBlock, inlineCodeBlock,table,horizontalRule,|,viewMode',
		theme: 'light',
		floatingToolbar: false, // Disable floating toolbar for better UX with view switching
		onChange: (markdown: string) => {
			// Optional: Log changes or sync with external systems
			console.log('Markdown updated:', markdown.length + ' characters')
		},
	})

	// Add some basic styling to the form example
	const style = document.createElement('style')
	style.textContent = `
		.form-example {
			margin-top: 2rem;
			padding: 1.5rem;
			background-color: #f9fafb;
			border-radius: 0.5rem;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		}
		.form-controls {
			margin-top: 1rem;
			display: flex;
			gap: 1rem;
			align-items: center;
		}
		.submit-button {
			margin-left: auto;
			padding: 0.5rem 1rem;
			background-color: #3b82f6;
			color: white;
			border: none;
			border-radius: 0.25rem;
			cursor: pointer;
		}
		.submit-button:hover {
			background-color: #2563eb;
		}
		.result-box {
			margin-top: 1rem;
			padding: 1rem;
			background-color: white;
			border: 1px solid #e5e7eb;
			border-radius: 0.25rem;
			overflow: auto;
			max-height: 300px;
		}
		pre {
			white-space: pre-wrap;
			word-break: break-word;
		}
	`
	document.head.appendChild(style)
})
