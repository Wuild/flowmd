import { setBlockType } from 'prosemirror-commands';
import { Command } from 'prosemirror-state';
import { Transaction } from 'prosemirror-state';

import icon from '../assets/icons/heading-solid.svg';

import { BasePlugin } from './BasePlugin';
import { FlowMD } from '../editor/FlowMD';

export default class HeadingPlugin extends BasePlugin {
  constructor(editor: FlowMD) {
    super(editor);
    this.name = 'heading';
    this.title = 'Heading';
    this.icon = icon;

    // Listen for editor state changes to update dropdown
    this.setupStateListener();
  }

  private setupStateListener(): void {
    // Add a small delay to ensure the editor is fully initialized
    setTimeout(() => {
      if (this.editor.view) {
        const originalDispatch = this.editor.view.dispatch;
        this.editor.view.dispatch = (tr: Transaction) => {
          originalDispatch.call(this.editor.view, tr);
          // Update dropdown state after any transaction
          setTimeout(() => this.updateDropdownState(), 0);
        };
      }
    }, 100);
  }

  public createButton(): HTMLButtonElement {
    const container = document.createElement('div');
    container.className = 'toolbar-dropdown-container';

    const button = document.createElement('button');
    button.className = 'toolbar-button dropdown-toggle';
    button.type = 'button';
    button.title = this.title;
    button.innerHTML = `${this.icon}<span class="dropdown-arrow"></span>`;
    (button as HTMLButtonElement & { _plugin: HeadingPlugin })._plugin = this;

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';

    const headingOptions = [
      { level: 0, text: 'Paragraph', tag: 'P' },
      { level: 1, text: 'Heading 1', tag: 'H1' },
      { level: 2, text: 'Heading 2', tag: 'H2' },
      { level: 3, text: 'Heading 3', tag: 'H3' },
      { level: 4, text: 'Heading 4', tag: 'H4' },
      { level: 5, text: 'Heading 5', tag: 'H5' },
      { level: 6, text: 'Heading 6', tag: 'H6' },
    ];

    headingOptions.forEach(option => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.setAttribute('data-level', option.level.toString());
      item.textContent = option.text;

      item.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setHeading(option.level);
        dropdown.classList.remove('show');
        button.classList.remove('open');
        this.updateDropdownState();
      });

      dropdown.appendChild(item);
    });

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('show');
      dropdown.classList.toggle('show');
      button.classList.toggle('open', !isOpen);

      // Update dropdown state when opening
      if (!isOpen) {
        this.updateDropdownState();
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target as Node)) {
        dropdown.classList.remove('show');
        button.classList.remove('open');
      }
    });

    // Store references for later updates
    (container as HTMLDivElement & { _dropdown: HTMLDivElement })._dropdown = dropdown;
    (container as HTMLDivElement & { _button: HTMLButtonElement })._button = button;

    container.appendChild(button);
    container.appendChild(dropdown);

    return container as unknown as HTMLButtonElement; // Return container as button for compatibility
  }

  private setHeading(level: number): void {
    if (!this.editor.view) {
      return;
    }

    const { state, dispatch } = this.editor.view;

    if (level === 0) {
      // Convert to paragraph
      const paragraphType = state.schema.nodes.paragraph;
      const command = setBlockType(paragraphType);
      command(state, dispatch);
    } else {
      // Convert to heading with specified level
      const headingType = state.schema.nodes.heading;
      const command = setBlockType(headingType, { level });
      command(state, dispatch);
    }

    this.editor.view.focus();
  }

  private updateDropdownState(): void {
    // Find the dropdown container
    const containers = document.querySelectorAll('.toolbar-dropdown-container');
    containers.forEach(container => {
      const button = container.querySelector('.toolbar-button') as HTMLButtonElement & { _plugin?: HeadingPlugin };
      const plugin = button?._plugin;
      if (plugin === this) {
        const dropdown = (container as HTMLDivElement & { _dropdown?: HTMLDivElement })._dropdown;
        if (dropdown) {
          const currentLevel = this.getCurrentHeadingLevel();
          const items = dropdown.querySelectorAll('.dropdown-item');

          items.forEach((item: Element) => {
            const htmlItem = item as HTMLElement;
            const itemLevel = parseInt(htmlItem.getAttribute('data-level') || '0');
            if (itemLevel === currentLevel) {
              htmlItem.classList.add('active');
            } else {
              htmlItem.classList.remove('active');
            }
          });
        }
      }
    });
  }

  public execute(): void {
    // Default behavior - toggle H1
    this.setHeading(1);
  }

  public isActive(): boolean {
    return this.getCurrentHeadingLevel() > 0;
  }

  private getCurrentHeadingLevel(): number {
    if (!this.editor.view) {
      return 0;
    }

    const { state } = this.editor.view;
    const { $from } = state.selection;
    const node = $from.node();

    if (node.type.name === 'heading') {
      return node.attrs.level || 0;
    }

    return 0;
  }

  public getKeymap(): { [key: string]: Command } {
    return {
      'Mod-Alt-1': (state, dispatch) => {
        const headingType = state.schema.nodes.heading;
        return setBlockType(headingType, { level: 1 })(state, dispatch);
      },
      'Mod-Alt-2': (state, dispatch) => {
        const headingType = state.schema.nodes.heading;
        return setBlockType(headingType, { level: 2 })(state, dispatch);
      },
      'Mod-Alt-3': (state, dispatch) => {
        const headingType = state.schema.nodes.heading;
        return setBlockType(headingType, { level: 3 })(state, dispatch);
      },
      'Mod-Alt-4': (state, dispatch) => {
        const headingType = state.schema.nodes.heading;
        return setBlockType(headingType, { level: 4 })(state, dispatch);
      },
      'Mod-Alt-5': (state, dispatch) => {
        const headingType = state.schema.nodes.heading;
        return setBlockType(headingType, { level: 5 })(state, dispatch);
      },
      'Mod-Alt-6': (state, dispatch) => {
        const headingType = state.schema.nodes.heading;
        return setBlockType(headingType, { level: 6 })(state, dispatch);
      },
      'Mod-Alt-0': (state, dispatch) => {
        const paragraphType = state.schema.nodes.paragraph;
        return setBlockType(paragraphType)(state, dispatch);
      },
    };
  }
}
