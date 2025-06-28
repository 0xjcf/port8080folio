# Claude Development Guidelines

This document provides guidelines for Claude when working on this codebase.

## Testing Guidelines

### DO NOT Create New Test Files
- We have already consolidated our test files to reduce clutter
- Use the existing test infrastructure instead of creating new test HTML files
- The main test file is: `test-syntax-highlighting-v2-only.html`

### Debugging Approach
1. When debugging issues, use the existing test suite's Debug Output section
2. Enhance the debug information in the test modules (e.g., `test-modules/v2-test-jsx.js`)
3. Make debug output copy-paste friendly for analysis
4. Add console logging temporarily to trace issues, but remove before finalizing

### Test File Structure
Main test files we maintain:
- `test-syntax-highlighting-v2-only.html` - Primary V2 test suite
- `test-syntax-highlighting.html` - Legacy test suite
- `test-comparison.html` - V1 vs V2 comparison
- `test-highlight-toggle.html` - Section highlighting tests
- `test-theme-showcase.html` - Theme testing
- `test-themes.html` - Custom theme tests

## Code Organization

### Syntax Highlighter Architecture
- `components/syntax-highlighter-v2.js` - Main tokenizer and highlighter
- `components/syntax-highlighter-with-themes.js` - Theme wrapper component
- `test-modules/` - Modular test validators and parsers

### Principles
- Follow DRY (Don't Repeat Yourself) principles
- Keep the architecture modular and maintainable
- Remove unused code and consolidate functionality
- Focus on debugging existing code rather than creating new implementations

## Current Issues Being Addressed

### JSX Parsing
- JSX elements are not being highlighted properly
- They are being treated as plain text instead of JSX tokens
- Debug focus: trace the `matchJSX()` method execution

## Git Commit Guidelines
- Make focused, atomic commits
- Use clear commit messages that describe what was changed and why
- Test changes before committing