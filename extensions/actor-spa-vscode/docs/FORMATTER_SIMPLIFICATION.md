# Formatter Simplification

## Overview

We've identified that the current formatter implementation is significantly over-engineered for the task of formatting HTML and CSS template literals. This document explains the issues and our simplified approach.

## Current Architecture Problems

### 1. Multiple Competing Implementations
- **ActorSpaFormattingProvider**: Tries Biome CLI → Prettier → Simple fallback
- **ActorFormattingProvider**: Actor-based with coordinator machines  
- **XStateFormattingProvider**: State machine-based formatter
- **Multiple formatter actors**: biome, prettier, fallback

### 2. Unnecessary Complexity
- External process spawning (Biome CLI with temp files)
- Complex actor/state machine coordination
- Multiple async layers and message passing
- Telemetry and debug logging actors
- Coordinator spawning parallel formatting jobs

### 3. Performance Overhead
- Creating temp files for each template
- Spawning external processes
- Multiple formatter attempts (Biome → Prettier → fallback)
- Actor communication overhead
- File I/O for each formatting operation

## What We Actually Need

For formatting `html` and `css` template literals, the requirements are simple:

1. **Find templates** in the code
2. **Extract content** (preserve ${} expressions)  
3. **Format HTML/CSS** with basic rules
4. **Restore expressions**
5. **Apply indentation**

## The Simple Solution

### SimpleFormattingProvider

```typescript
export class SimpleFormattingProvider implements vscode.DocumentFormattingEditProvider {
  // ~200 lines of focused code
  // No external dependencies
  // No state machines
  // No actors
  // No temp files
}
```

### Benefits

1. **Performance**: Instant formatting, no external processes
2. **Reliability**: No external dependencies to fail
3. **Simplicity**: Easy to understand and maintain
4. **Focused**: Does exactly what's needed, nothing more

### How It Works

1. **Template Discovery**
   - Uses regex to find `html` and `css` tagged templates
   - Handles nested templates correctly
   - Calculates proper indentation levels

2. **Expression Preservation**
   - Replaces `${...}` with placeholders before formatting
   - Restores them after formatting
   - Ensures expressions aren't mangled

3. **HTML Formatting**
   - Adds newlines between tags
   - Keeps simple elements on one line
   - Applies proper nesting indentation

4. **CSS Formatting**
   - Newlines after semicolons and braces
   - Proper indentation for nested rules
   - Preserves expressions in values

## Configuration

Users can choose their formatter in VS Code settings:

```json
{
  "actor-spa.formatting.formatter": "simple" // Default
}
```

Options:
- `"simple"` - Fast, focused formatter (recommended)
- `"actor"` - Actor-based with external tools
- `"legacy"` - Original implementation

## Migration

The simple formatter is now the default. Existing projects will automatically use it unless configured otherwise.

## Conclusion

Sometimes the best solution is the simplest one. For formatting template literals, we don't need:
- State machines
- Actor systems
- External CLIs
- Temporary files
- Complex coordination

We just need clean, focused code that does the job well. 