# AI Communication Feature

## Overview

The AI Communication feature enables different AI assistants (Claude, Cursor, GitHub Copilot, etc.) to communicate and collaborate within VS Code. This feature uses the actor model pattern with XState v5 to provide reliable, scalable inter-AI messaging.

## Prerequisites

### Required Dependencies
- VS Code version 1.60.0 or higher
- Node.js for running external scripts
- For WebSocket communication: `npm install ws` (included in extension)

## Quick Start

### 1. Enable AI Communication

Add to your VS Code settings:

```json
{
  "actor-spa.aiCommunication.enabled": true,
  "actor-spa.aiCommunication.config.communicationMethod": "file"
}
```

### 2. Use Commands

Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and use these commands:

- `actor-spa.ai.sendMessage` - Send a message to another AI agent
- `actor-spa.ai.getMessageHistory` - View all past messages
- `actor-spa.ai.subscribeToChannel` - Subscribe to specific message types
- `actor-spa.ai.getStats` - View communication statistics
- `actor-spa.ai.startWebSocketServer` - Start WebSocket server for real-time messaging
- `actor-spa.ai.stopWebSocketServer` - Stop the WebSocket server

### 3. Example Usage

When Claude wants to ask Cursor for a code review:

1. Run `actor-spa.ai.sendMessage`
2. Select `CODE_REVIEW_REQUEST`
3. Choose `broadcast` or enter specific agent ID
4. Enter the file path and context
5. Message is sent!

## Communication Methods

### File-Based (Default)
- Messages stored in `.ai-messages/` directory
- Works offline
- Persistent history
- No additional setup required

### WebSocket (Real-time)
- Enable with: `"actor-spa.aiCommunication.config.communicationMethod": "websocket"`
- Low-latency messaging
- Requires running server
- Start with: `actor-spa.ai.startWebSocketServer` command

## Message Types

### Code Review
```typescript
// Request review
{
  type: "CODE_REVIEW_REQUEST",
  payload: {
    file: "src/Button.tsx",
    lines: [10, 20],
    context: "Please check accessibility"
  }
}

// Response
{
  type: "CODE_REVIEW_RESPONSE",
  payload: {
    suggestions: [...],
    approved: true
  }
}
```

### Knowledge Sharing
```typescript
// Ask question
{
  type: "KNOWLEDGE_QUERY",
  payload: {
    question: "How to implement error boundaries?",
    tags: ["react", "error-handling"]
  }
}

// Share answer
{
  type: "KNOWLEDGE_RESPONSE",
  payload: {
    answer: "Use componentDidCatch...",
    confidence: 0.95,
    sources: ["React docs"]
  }
}
```

### Task Coordination
```typescript
// Assign task
{
  type: "TASK_ASSIGNMENT",
  payload: {
    title: "Implement authentication",
    priority: "high",
    deadline: 1234567890
  }
}

// Update status
{
  type: "TASK_STATUS_UPDATE",
  payload: {
    taskId: "task-123",
    status: "in_progress",
    progress: 50
  }
}
```

## Configuration

All settings under `actor-spa.aiCommunication.config`:

| Setting | Default | Description |
|---------|---------|-------------|
| `communicationMethod` | `"file"` | Method: file, websocket |
| `websocketPort` | `8765` | WebSocket server port |
| `maxQueueSize` | `1000` | Max messages in queue |
| `messageTimeout` | `30000` | Timeout in milliseconds |
| `retryAttempts` | `3` | Retry failed messages |
| `fileStoragePath` | `".ai-messages"` | Message storage directory |

## Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   Claude    │────▶│  Communication  │◀────│   Cursor    │
│   (Agent)   │     │     Bridge      │     │   (Agent)   │
└─────────────┘     └────────┬────────┘     └─────────────┘
                             │
                    ┌────────┴────────┐
                    │  Message Queue  │
                    │   & Storage     │
                    └─────────────────┘
```

### Components

1. **AI Communication Bridge** - Central message router
2. **Message Queue Actor** - Handles delivery guarantees
3. **WebSocket Server Actor** - Real-time communication
4. **AI Agents** - Individual AI assistants

## Privacy & Security

- All messages stored locally in your workspace
- No external servers (unless configured)
- Optional encryption (coming soon)
- Message signing for authenticity (coming soon)

## Troubleshooting

### Messages not being received
1. Check if AI Communication is enabled
2. Verify `.ai-messages/` directory exists
3. Check output channel: View → Output → "Actor-SPA Framework"

### WebSocket connection issues
1. Ensure port 8765 is available
2. Start server with command: `actor-spa.ai.startWebSocketServer`
3. Check firewall settings
4. Verify WebSocket dependency: `ws` package is installed

### Performance issues
1. Reduce `maxHistorySize` in settings
2. Clear old messages periodically
3. Use WebSocket for better performance

## Examples

See `/examples/ai-communication-example.ts` for:
- File-based communication
- WebSocket real-time messaging
- Task coordination between multiple agents

## Future Enhancements

- [ ] Message encryption
- [ ] Message signing/verification
- [ ] Multi-workspace support
- [ ] Custom message types via plugins
- [ ] Analytics dashboard
- [ ] Rate limiting and quotas

## Contributing

To add support for a new AI agent:

1. Implement the `AIAgent` interface
2. Create connection handler (file watcher or WebSocket client)
3. Handle handshake protocol
4. Subscribe to relevant channels
5. Implement message handlers

## API Reference

See [AI_COMMUNICATION_PROTOCOL.md](./AI_COMMUNICATION_PROTOCOL.md) for complete protocol specification.

## Building & Installation

### Development Setup
```bash
cd extensions/actor-spa-vscode
pnpm install
pnpm run compile
```

### Package Extension
```bash
pnpm run package
# This creates actor-spa-framework-*.vsix
```

### Install Extension
```bash
# Option 1: Via VS Code UI
# Extensions → ... → Install from VSIX

# Option 2: Command line
code --install-extension actor-spa-framework-*.vsix
```