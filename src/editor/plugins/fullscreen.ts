/**
 * Fullscreen plugin for entering/exiting fullscreen mode
 */

import {ToolbarBase} from './toolbar';
import type {ToolbarButtonDefinition} from './toolbar';
import type {Editor, EditorOptions} from '../types';
import {createIconSync} from "../utils/icons";
import type {EditorView} from "prosemirror-view";

/**
 * Plugin that adds fullscreen functionality to the editor
 */
export class Fullscreen extends ToolbarBase {
    /**
     * The name of the plugin
     */
    name = 'fullscreen';

    /**
     * Whether the editor is in fullscreen mode
     */
    private isFullscreen = false;

    /**
     * Private storage for keymap
     */
    private _keymap: Record<string, any> = {};

    /**
     * Keymap for fullscreen plugin
     */
    get keymap(): Record<string, any> {
        return this._keymap;
    }

    // No need to store original styles when using CSS classes



    /**
     * Initialize the plugin
     * @param editor The editor instance
     * @param options Editor options
     */
    init(editor: Editor, options: EditorOptions): void {
        super.init(editor, options);

        // Bind methods to preserve this context
        this.toggleFullscreen = this.toggleFullscreen.bind(this);
        this.enterFullscreen = this.enterFullscreen.bind(this);
        this.exitFullscreen = this.exitFullscreen.bind(this);

        // Add keymap for quick fullscreen toggle
        this._keymap = {
            'F11': () => {
                this.toggleFullscreen();
                return true;
            },
            'Escape': () => {
                if (this.isFullscreen) {
                    this.exitFullscreen();
                    return true;
                }
                return false;
            }
        };

        // Listen for native fullscreen changes
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('mozfullscreenchange', this.handleFullscreenChange.bind(this));
        document.addEventListener('MSFullscreenChange', this.handleFullscreenChange.bind(this));
    }

    /**
     * Handle native fullscreen changes
     */
    private handleFullscreenChange(): void {
        const isNativeFullscreen = !!(
            document.fullscreenElement ||
            (document as any).webkitFullscreenElement ||
            (document as any).mozFullScreenElement ||
            (document as any).msFullscreenElement
        );

        if (!isNativeFullscreen && this.isFullscreen) {
            // Native fullscreen was exited, exit our fullscreen mode too
            this.exitFullscreen();
        }
    }

    /**
     * Toggle fullscreen mode
     */
    private toggleFullscreen(): void {
        if (this.isFullscreen) {
            this.exitFullscreen();
        } else {
            this.enterFullscreen();
        }
    }

    /**
     * Enter fullscreen mode
     */
    private enterFullscreen(): void {
        const editorContainer = this.editor.container;

        if (!editorContainer || this.isFullscreen) return;

        // Apply fullscreen styles by adding CSS classes
        this.applyFullscreenStyles();

        // Set fullscreen state
        this.isFullscreen = true;

        // Try to use native fullscreen API on the editor container itself
        this.requestNativeFullscreen(editorContainer);

        // Add escape key listener
        document.addEventListener('keydown', this.handleEscapeKey.bind(this));
    }

    /**
     * Exit fullscreen mode
     */
    private exitFullscreen(): void {
        const editorContainer = this.editor.container;

        if (!editorContainer || !this.isFullscreen) return;

        // Exit native fullscreen if active
        this.exitNativeFullscreen();

        // Remove fullscreen class from editor container
        editorContainer.classList.remove('flowmd-editor--fullscreen');

        // Remove fullscreen class from ProseMirror element
        const proseMirrorElement = this.editor.view.dom;
        if (proseMirrorElement) {
            proseMirrorElement.classList.remove('flowmd-editor__fullscreen-view');
        }

        // Reset fullscreen state
        this.isFullscreen = false;

        // Remove escape key listener
        document.removeEventListener('keydown', this.handleEscapeKey.bind(this));
    }


    /**
     * Apply fullscreen styles to editor
     */
    private applyFullscreenStyles(): void {
        const editorContainer = this.editor.container;
        if (!editorContainer) return;

        // Add fullscreen class to editor container
        editorContainer.classList.add('flowmd-editor--fullscreen');

        // Add fullscreen class to ProseMirror element
        const proseMirrorElement = this.editor.view.dom;
        if (proseMirrorElement) {
            proseMirrorElement.classList.add('flowmd-editor__fullscreen-view');
        }
    }

    /**
     * Request native fullscreen
     * @param element The element to make fullscreen
     */
    private requestNativeFullscreen(element: HTMLElement): void {
        if (!element) return;

        if (element.requestFullscreen) {
            element.requestFullscreen().catch(() => {
                // Ignore errors - fallback to custom fullscreen
            });
        } else if ((element as any).webkitRequestFullscreen) {
            (element as any).webkitRequestFullscreen();
        } else if ((element as any).mozRequestFullScreen) {
            (element as any).mozRequestFullScreen();
        } else if ((element as any).msRequestFullscreen) {
            (element as any).msRequestFullscreen();
        }
    }

    /**
     * Exit native fullscreen
     */
    private exitNativeFullscreen(): void {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {
                // Ignore errors
            });
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
            (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen();
        }
    }

    /**
     * Handle escape key press
     */
    private handleEscapeKey(event: KeyboardEvent): void {
        if (event.key === 'Escape' && this.isFullscreen) {
            event.preventDefault();
            this.exitFullscreen();
        }
    }

    /**
     * The toolbar button definition
     */
    get buttonDefinition(): ToolbarButtonDefinition {
        return {
            name: 'fullscreen',
            title: this.isFullscreen ? 'Exit Fullscreen (F11)' : 'Enter Fullscreen (F11)',
            icon: createIconSync('fullscreen'),
            isActive: function(this: Fullscreen) {
                return this.isFullscreen;
            },
            action: function(this: Fullscreen, _view: EditorView) {
                this.toggleFullscreen();
            }
        };
    }
}
