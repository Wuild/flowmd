import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync, statSync } from 'fs';
import { join, basename } from 'path';

// Function to find all files with a specific extension in a directory
function findFilesByExtension(dir: any, extension: string, recursive: boolean = true) {
	let results: any = [];
	const list = readdirSync(dir);

	list.forEach(file => {
		const filePath = join(dir, file);
		const stat = statSync(filePath);

		if (stat && stat.isDirectory() && recursive) {
			// Recursively search subdirectories
			results = results.concat(findFilesByExtension(filePath, extension, recursive));
		} else if (file.endsWith(extension)) {
			// Add files with the specified extension to the results
			results.push(filePath);
		}
	});

	return results;
}

// Function to find all SASS files in a directory recursively
function findSassFiles(dir: any) {
	return findFilesByExtension(dir, '.scss');
}

// Get all SASS files from src/styles
const sassFiles = findSassFiles(resolve(__dirname, 'src/styles/themes'));

// Get all HTML files from example directory (non-recursively)
const exampleHtmlFiles = findFilesByExtension(resolve(__dirname, 'example'), '.html', false);

// Create input object for Vite build
const styleInputs: any = {};
sassFiles.forEach((file: any) => {
	// Use the basename without extension as the key
	const name = basename(file, '.scss');
	styleInputs[name] = file;
});

// Create input object for example HTML files
const exampleInputs: any = {};
exampleHtmlFiles.forEach((file: any) => {
	// Use the basename without extension as the key
	const name = basename(file, '.html');
	exampleInputs[name] = file;
});

export default defineConfig(({ mode, command }) => {
	if (mode === 'development') {
		// Development mode: Include all examples
		return {
			// Use example/main.ts as the entry point for development
			build: {
				outDir: 'dist',
				rollupOptions: {
					input: {
						...exampleInputs, // Include all example HTML files
						...styleInputs
					}
				}
			},
			server: {
				open: 'example/index.html', // Open the examples navigation page by default
				fs: {
					// Allow serving files from node_modules
					allow: ['..']
				}
			},
			// Properly handle Font Awesome assets
			resolve: {
				alias: {
					'@fortawesome/fontawesome-free': resolve(__dirname, 'node_modules/@fortawesome/fontawesome-free')
				}
			}
		};
	} else if (command === 'build' && process.env.BUILD_TYPE === 'styles') {
		// Build only styles
		return {
			build: {
				outDir: 'dist',
				emptyOutDir: false,
				// Ensure Font Awesome assets are properly copied
				assetsInlineLimit: 0, // Don't inline any assets
				rollupOptions: {
					input: styleInputs,
					output: {
						assetFileNames: (assetInfo: any) => {
							if (assetInfo.name.endsWith('.css')) {
								// Extract the name without the hash and extension
								const name = assetInfo.name.split('.')[0];
								return `${name}.css`;
							}
							return 'assets/[name]-[hash][extname]';
						}
					}
				}
			},
			// Properly handle Font Awesome assets
			resolve: {
				alias: {
					'@fortawesome/fontawesome-free': resolve(__dirname, 'node_modules/@fortawesome/fontawesome-free')
				}
			}
		};
	} else {
		// Production mode: Only include the library
		return {
			build: {
				outDir: 'dist',
				lib: {
					entry: resolve(__dirname, 'src/index.ts'),
					name: 'FlowMD',
					// fileName is not needed when using rollupOptions.output array format
				},
				// Ensure Font Awesome assets are properly copied
				assetsInlineLimit: 0, // Don't inline any assets
				rollupOptions: {
					output: [
						{
							// Additional ES module output with the name 'flowmd.js' for examples
							format: 'es',
							entryFileNames: 'flowmd.js',
							// Global variables to use in UMD build for externalized deps
							globals: {},
							// Disable code splitting to ensure a single file output
							manualChunks: undefined,
							inlineDynamicImports: true
						},
						{
							// Regular output for other formats
							format: 'es',
							entryFileNames: 'editor.es.js',
							// Global variables to use in UMD build for externalized deps
							globals: {},
							// Disable code splitting to ensure a single file output
							manualChunks: undefined,
							inlineDynamicImports: true
						},
						{
							format: 'umd',
							name: 'FlowMD',
							entryFileNames: 'editor.umd.js',
							// Global variables to use in UMD build for externalized deps
							globals: {},
							// Disable code splitting to ensure a single file output
							manualChunks: undefined,
							inlineDynamicImports: true
						},
						{
							format: 'cjs',
							entryFileNames: 'editor.cjs.js',
							// Global variables to use in UMD build for externalized deps
							globals: {},
							// Disable code splitting to ensure a single file output
							manualChunks: undefined,
							inlineDynamicImports: true
						}
					]
				}
			},
			// Properly handle Font Awesome assets
			resolve: {
				alias: {
					'@fortawesome/fontawesome-free': resolve(__dirname, 'node_modules/@fortawesome/fontawesome-free')
				}
			}
		};
	}
});
