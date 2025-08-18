# Proper Logging Guide: Using debugLoggerActor

## ❌ **WRONG** - Direct console.log usage

```typescript
// DON'T DO THIS - violates actor model
console.log('[FormatterMachine] Starting processTokens action');
console.log(`[Tokenizer] Found html template tag at position ${i}`);
console.log(`[Telemetry] Would send ${count} events`);
```

## ✅ **CORRECT** - Actor-based logging

### 1. **In State Machines/Actors**

```typescript
import { createActor } from 'xstate';
import { debugLoggerMachine, createLogEvent, LogLevel, COMPONENTS } from '../actors/debugLoggerActor';

// Create debug logger actor
const debugLogger = createActor(debugLoggerMachine);
debugLogger.start();

// Initialize with output channel
debugLogger.send({
  type: 'INITIALIZE',
  outputChannel: myOutputChannel
});

// Use proper logging in your state machine
const myMachine = setup({
  actions: {
    logProcessStart: () => {
      debugLogger.send(createLogEvent(
        LogLevel.DEBUG,
        COMPONENTS.FORMATTING,
        'Starting processTokens action',
        { operation: 'tokenize' },
        undefined,
        'correlation-123'
      ));
    }
  }
});
```

### 2. **In Regular Functions (when you have debugLogger access)**

```typescript
function tokenizeForMachine(text: string, debugLogger?: DebugLoggerActor) {
  if (debugLogger) {
    debugLogger.send(createLogEvent(
      LogLevel.INFO,
      COMPONENTS.PARSER,
      `Starting tokenization of ${text.length} characters`,
      { textLength: text.length }
    ));
  }

  // ... tokenization logic ...

  if (debugLogger && foundTemplate) {
    debugLogger.send(createLogEvent(
      LogLevel.DEBUG,
      COMPONENTS.PARSER,
      `Found ${templateType} template tag at position ${i}`,
      { templateType, position: i }
    ));
  }
}
```

### 3. **In Providers (dependency injection pattern)**

```typescript
export class ActorFormattingProvider {
  constructor(
    private outputChannel?: vscode.OutputChannel,
    private debugLogger?: DebugLogger
  ) {}

  private log(message: string, data?: unknown): void {
    if (this.debugLogger) {
      this.debugLogger.debug(COMPONENTS.ACTOR_FORMATTER, message, data);
    }
    // NO fallback console.log - follow actor patterns!
  }
}
```

## 🏗️ **Architecture Pattern**

### How logging flows through the actor system:

```
Component/Machine → debugLoggerActor → VS Code Output Channel
                 ↘                  ↗
                   telemetryActor (for business metrics)
```

### Example: Formatter Machine with proper logging

```typescript
const formatterMachine = setup({
  actors: {
    debugLogger: debugLoggerMachine
  },
  actions: {
    logStart: ({ spawn }) => {
      const logger = spawn('debugLogger');
      logger.send(createLogEvent(
        LogLevel.INFO,
        COMPONENTS.FORMATTING,
        'Starting format operation'
      ));
    },
    
    logComplete: ({ spawn, context }) => {
      const logger = spawn('debugLogger');
      logger.send(createLogEvent(
        LogLevel.INFO,
        COMPONENTS.FORMATTING,
        'Format operation completed',
        { editsGenerated: context.edits.length }
      ));
    }
  }
});
```

## 🔧 **Configuration**

Users can control logging via VS Code settings:

```json
{
  "actor-spa.debug.logLevel": "debug",
  "actor-spa.debug.enabledComponents": ["Formatting", "Parser"]
}
```

## 🚫 **Exceptions**

The ONLY files that should use `console.log` are:

1. **`debugLoggerActor.ts`** - The actual implementation
2. **Test files** - `*.test.ts`, `*.spec.ts`
3. **Emergency fallbacks** - Only when actor system isn't available

## 🔄 **Migration Pattern**

To fix existing console.log violations:

1. **Identify the component**: What part of the system is logging?
2. **Get debugLogger access**: Pass it through constructor or spawn actor
3. **Replace console.log**: Use `createLogEvent` with appropriate level
4. **Add correlation IDs**: For tracking related operations
5. **Include structured data**: Use the `data` parameter for context

### Before:
```typescript
console.log(`[FormatterMachine] Generated ${tokens.length} tokens`);
```

### After:
```typescript
debugLogger.send(createLogEvent(
  LogLevel.DEBUG,
  COMPONENTS.FORMATTING,
  'Generated tokens for processing',
  { tokenCount: tokens.length },
  undefined,
  correlationId
));
```

## 📊 **Benefits**

- **Centralized control**: All logging goes through one actor
- **Configurable filtering**: Users control what they see
- **Structured data**: Better debugging with context
- **Actor model compliance**: Proper message-based communication
- **Performance**: Can disable logging without code changes
- **Correlation tracking**: Follow operations across actors

This pattern ensures your extension follows proper actor model principles while providing excellent debugging capabilities! 