# Contributing to FlowMD

Thank you for your interest in contributing to FlowMD! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and inclusive in all interactions.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/wuild/flowmd/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser/OS information
   - Screenshots if applicable

### Suggesting Features

1. Check existing [Issues](https://github.com/wuild/flowmd/issues) for similar requests
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/wuild/flowmd.git
   cd flowmd
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards
3. Test your changes thoroughly
4. Run code quality checks:
   ```bash
   npm run code-quality
   ```

5. Build the project:
   ```bash
   npm run build
   ```

### Coding Standards

- Use TypeScript for all new code
- Follow existing code style and patterns
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Use meaningful variable and function names

### Commit Guidelines

- Use conventional commit format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for formatting changes
  - `refactor:` for code refactoring
  - `test:` for test changes
  - `chore:` for maintenance tasks

Example:
```
feat: add support for custom keyboard shortcuts
fix: resolve infinite loop in bold keymap handler
docs: update installation instructions
```

### Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass and code quality checks pass
3. Create a pull request with:
   - Clear title and description
   - Reference any related issues
   - Screenshots for UI changes

4. Respond to code review feedback
5. Ensure your branch is up to date with main before merging

### Plugin Development

When creating new plugins:

1. Extend the `BasePlugin` class
2. Follow the existing plugin patterns
3. Implement required methods:
   - `execute()` - Main plugin functionality
   - `isActive()` - Check if plugin is active
   - `getKeymap()` - Define keyboard shortcuts (optional)

4. Add proper TypeScript types
5. Update documentation

### Testing

- Write unit tests for new functionality
- Test in multiple browsers
- Test keyboard shortcuts
- Test both editor and source modes

### Documentation

- Update README.md for new features
- Add JSDoc comments for public APIs
- Update CHANGELOG.md following the format
- Include examples for new functionality

## Questions?

If you have questions about contributing, feel free to:
- Create an issue for discussion
- Contact the maintainers

Thank you for contributing to FlowMD!
