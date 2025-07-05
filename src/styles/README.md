# MDFlow Themes

This directory contains various themes for the MDFlow editor. Each theme provides a different visual style for the editor while maintaining the same functionality.

## Available Themes

- **light.scss**: The default light theme with a clean, minimal design.
- **dracula.scss**: A dark theme based on the popular Dracula color scheme, featuring dark backgrounds with purple accents.
- **github.scss**: A light theme inspired by GitHub's light mode interface.
- **github-dark.scss**: A dark theme inspired by GitHub's dark mode interface.
- **material.scss**: A light theme following Material Design principles.

## How to Use Themes

To use a theme in your application, simply import it after importing the MDFlow editor:

```typescript
import { createEditor } from 'mdflow';

// Import only ONE theme
import 'mdflow/dist/styles/light.scss';  // Default light theme
// OR
import 'mdflow/dist/styles/dracula.scss';  // Dracula dark theme
// OR
import 'mdflow/dist/styles/github.scss';  // GitHub light theme
// OR
import 'mdflow/dist/styles/github-dark.scss';  // GitHub dark theme
// OR
import 'mdflow/dist/styles/material.scss';  // Material Design theme

// Then create your editor
createEditor({
  element: document.getElementById('editor'),
  // ... other options
});
```

**Important**: Only import one theme at a time. Importing multiple themes will cause conflicts as they all define the same CSS variables.

## Creating Custom Themes

To create a custom theme, you can use one of the existing themes as a template. The themes define CSS variables that control the appearance of the editor. The main variables to customize are:

- Color variables (primary colors, text colors, background colors, etc.)
- Typography variables (font families, sizes, weights)
- Border and shadow variables
- Spacing variables

See the existing theme files for examples of how to structure your custom theme.