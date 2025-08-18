# Debug Logging System

This document explains how to use the centralized debug logging system in the Actor-SPA Framework VSCode extension.

## Overview

The debug logging system provides centralized, configurable logging with multiple levels and component filtering. All logs are displayed in the "Actor-SPA Framework" output channel in VSCode.

## Features

- **Centralized Logging**: All components log to the same output channel
- **Configurable Log Levels**: Error, Warn, Info, Debug, Trace
- **Component Filtering**: Enable/disable logging for specific components
- **Error Handling**: Automatic error capture with stack traces
- **Performance Monitoring**: Built-in timing and performance tracking
- **Real-time Configuration**: Settings update automatically without restart

## Configuration

Add these settings to your VSCode `settings.json`:

```json
{
  "actor-spa.debug.logLevel": "debug",
  "actor-spa.debug.enabledComponents": ["*"]
}
```

### Log Levels

- `"error"`: Only critical errors
- `"warn"`: Warnings and errors
- `"info"`: General information, warnings, and errors (default)
- `"debug"`: Detailed debugging information
- `"trace"`: Very detailed tracing information

### Component Filtering

Enable logging for specific components:

```json
{
  "actor-spa.debug.enabledComponents": ["Extension", "ActorFormatter", "Coordinator"]
}
```

Or enable all components:

```json
{
  "actor-spa.debug.enabledComponents": ["*"]
}
```

Available components:
- `Extension`: Main extension activation/deactivation
- `ActorFormatter`: Actor-based formatting provider
- `Coordinator`: State machine coordinator
- `Discovery`: Template discovery
- `Formatting`: Individual template formatting
- `Parser`: Template parsing
- `Validator`: Template validation

## Usage

### Viewing Logs

1. Open VSCode
2. Go to `View` → `Output`
3. Select "Actor-SPA Framework" from the dropdown
4. Format a file to see logs in action

### Understanding Log Output

Log entries follow this format:
```
[timestamp] [LEVEL] [Component     ] Message
    Data: { ... }
    Error: Error message
    Stack: Stack trace
```

### Testing the System

1. Open the test file: `test-debug-logging.ts`
2. Try formatting it (Ctrl+Shift+I or Cmd+Shift+I)
3. Check the output channel for detailed logs

## Common Debugging Scenarios

### 1. Extension Not Loading

Check for extension activation errors:
```json
{
  "actor-spa.debug.logLevel": "debug",
  "actor-spa.debug.enabledComponents": ["Extension"]
}
```

### 2. Formatting Issues

Enable formatter debugging:
```json
{
  "actor-spa.debug.logLevel": "debug",
  "actor-spa.debug.enabledComponents": ["ActorFormatter", "Coordinator", "Discovery"]
}
```

### 3. Performance Problems

Use trace level for detailed performance monitoring:
```json
{
  "actor-spa.debug.logLevel": "trace",
  "actor-spa.debug.enabledComponents": ["*"]
}
```

### 4. Template Detection Issues

Focus on discovery and parsing:
```json
{
  "actor-spa.debug.logLevel": "debug",
  "actor-spa.debug.enabledComponents": ["Discovery", "Parser"]
}
```

## Error Handling

The system automatically captures and logs errors with full context:

- **Synchronous Errors**: Captured with `safeExecuteSync`
- **Asynchronous Errors**: Captured with `safeExecute`
- **Critical Errors**: Automatically shown to user
- **Stack Traces**: Included for debugging

## Performance Monitoring

The debug system includes built-in performance tracking:

- Operation timing
- Memory usage patterns
- State machine transitions
- Template processing metrics

## Advanced Usage

### Custom Error Handling

```typescript
import { getDebugLogger, COMPONENTS } from './core/debugLogger';

const logger = getDebugLogger();

// Safe async operation
const result = await logger.safeExecute(
  COMPONENTS.FORMATTING,
  'format template',
  async () => {
    // Your async operation
    return await formatTemplate(content);
  },
  'fallback value' // Optional fallback
);

// Safe sync operation
const data = logger.safeExecuteSync(
  COMPONENTS.PARSER,
  'parse template',
  () => {
    // Your sync operation
    return parseTemplate(content);
  }
);
```

### Log Buffer Access

```typescript
// Get all log entries
const logs = logger.getLogBuffer();

// Export logs to string
const logString = logger.exportLogs();

// Clear logs
logger.clear();
```

## Troubleshooting

### No Logs Appearing

1. Check the output channel is selected correctly
2. Verify log level isn't too restrictive
3. Ensure component filtering isn't too narrow
4. Try clearing and refreshing: `logger.clear()`

### Performance Issues

1. Lower log level to reduce output
2. Filter to specific components
3. Use trace level sparingly
4. Check for infinite loops in logging

### Configuration Not Working

1. Restart VSCode after major config changes
2. Check JSON syntax in settings
3. Verify component names are correct
4. Use `*` for all components if unsure

## Best Practices

1. **Use Appropriate Log Levels**: Don't log everything at INFO level
2. **Filter Components**: Focus on relevant components for your debugging
3. **Include Context**: Always provide relevant data with log messages
4. **Handle Errors Gracefully**: Use safe execution methods
5. **Monitor Performance**: Keep an eye on log volume and performance impact

## Examples

### Basic Setup for Formatting Issues

```json
{
  "actor-spa.debug.logLevel": "debug",
  "actor-spa.debug.enabledComponents": ["ActorFormatter", "Coordinator"]
}
```

### Full Debugging

```json
{
  "actor-spa.debug.logLevel": "trace",
  "actor-spa.debug.enabledComponents": ["*"]
}
```

### Production-Safe Logging

```json
{
  "actor-spa.debug.logLevel": "warn",
  "actor-spa.debug.enabledComponents": ["Extension"]
}
```

This debug logging system should help you identify and resolve issues quickly while maintaining good performance and usability. 