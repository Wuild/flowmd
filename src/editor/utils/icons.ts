/**
 * FontAwesome icons for the editor toolbar
 */


/**
 * Icon class mappings
 */
const iconClasses = {
  bold: 'fa fa-bold',
  italic: 'fa fa-italic',
  strikethrough: 'fa fa-strikethrough',
  heading: 'fa fa-heading',
  image: 'fa fa-image',
  link: 'fa fa-link',
  bullet_list: 'fa fa-list-ul',
  ordered_list: 'fa fa-list-ol',
  blockquote: 'fa fa-quote-left',
  codeblock: 'fa fa-code',
  viewswitcher: 'fa fa-code',
  fullscreen: 'fa fa-expand',
  edit: 'fa fa-pen-to-square',
  delete: 'fa fa-trash',
  'external-link': 'fa fa-arrow-up-right-from-square',
};

/**
 * Create an icon element using FontAwesome classes
 * @param iconName The name of the icon from the iconClasses object
 * @param className Optional CSS class to add to the wrapper element
 * @returns HTMLElement containing the FontAwesome icon
 */
export async function createIcon(iconName: keyof typeof iconClasses, className: string = 'toolbar-icon'): Promise<HTMLElement> {
  const wrapper = document.createElement('span');
  wrapper.className = className;

  // Create icon element with FontAwesome classes
  const icon = document.createElement('i');
  icon.className = iconClasses[iconName];
  wrapper.appendChild(icon);

  return wrapper;
}

/**
 * Synchronous version that creates an icon using FontAwesome classes
 * @param iconName The name of the icon from the iconClasses object
 * @param className Optional CSS class to add to the wrapper element
 * @returns HTMLElement containing the FontAwesome icon
 */
export function createIconSync(iconName: keyof typeof iconClasses, className: string = 'toolbar-icon'): HTMLElement {
  const wrapper = document.createElement('span');
  wrapper.className = className;

  // Create icon element with FontAwesome classes
  const icon = document.createElement('i');
  icon.className = iconClasses[iconName];
  wrapper.appendChild(icon);

  return wrapper;
}
