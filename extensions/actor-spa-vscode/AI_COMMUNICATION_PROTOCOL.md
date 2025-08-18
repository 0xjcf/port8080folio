# AI Communication Protocol

## Overview

The AI Communication Protocol enables different AI agents (Claude, Cursor, GitHub Copilot, etc.) to communicate and collaborate through a standardized message-passing interface based on the actor model. This protocol allows AI agents to share knowledge, coordinate tasks, and work together on complex software engineering problems.

## Architecture

### Core Components

1. **AI Communication Bridge** - Central actor managing all communication
2. **Message Queue Actor** - Handles message persistence and delivery guarantees
3. **WebSocket Server Actor** - Provides real-time communication channel
4. **AI Agents** - Individual AI assistants that connect to the bridge

### Communication Flow

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

## Message Format

All messages follow this standardized format:

```typescript
{
  "id": "unique-message-id",
  "timestamp": 1234567890,
  "source": {
    "id": "agent-id",
    "type": "claude",
    "name": "Claude Assistant",
    "version": "1.0.0"
  },
  "target": "agent-id" | "broadcast",
  "type": "CODE_REVIEW_REQUEST",
  "payload": {
    // Message-specific data
  },
  "metadata": {
    "priority": 1,
    "channel": "code_review",
    "correlationId": "optional-correlation-id",
    "replyTo": "original-message-id"
  },
  "signature": "message-signature"
}
```

## Message Types

### Code Review
- `CODE_REVIEW_REQUEST` - Request code review from another agent
- `CODE_REVIEW_RESPONSE` - Provide review feedback

### Refactoring
- `REFACTOR_SUGGESTION` - Suggest code improvements
- `REFACTOR_ACCEPTED` - Accept refactoring proposal
- `REFACTOR_REJECTED` - Reject with reasons

### Architecture
- `ARCHITECTURE_PROPOSAL` - Propose architectural changes
- `ARCHITECTURE_FEEDBACK` - Provide feedback on proposals

### Task Coordination
- `TASK_ASSIGNMENT` - Assign task to another agent
- `TASK_STATUS_UPDATE` - Update task progress
- `TASK_COMPLETED` - Mark task as done

### Knowledge Sharing
- `KNOWLEDGE_QUERY` - Ask for information
- `KNOWLEDGE_RESPONSE` - Share knowledge

### System
- `HANDSHAKE` - Initial connection
- `HEARTBEAT` - Keep connection alive
- `ACKNOWLEDGMENT` - Confirm message receipt
- `ERROR` - Report errors

## Communication Methods

### 1. File-Based Communication
Messages are stored as JSON files in `.ai-messages/` directory:
```
.ai-messages/
├── 1234567890-msg-id.json
├── 1234567891-msg-id.json
└── ...
```

### 2. WebSocket Real-time
Connect to `ws://localhost:8765` for real-time messaging.

### 3. VS Code Commands
- `actor-spa.ai.sendMessage` - Send message to agent
- `actor-spa.ai.subscribeToChannel` - Subscribe to channel
- `actor-spa.ai.getMessageHistory` - Retrieve past messages
- `actor-spa.ai.getStats` - View communication statistics
- `actor-spa.ai.startWebSocketServer` - Start WebSocket server
- `actor-spa.ai.stopWebSocketServer` - Stop WebSocket server

## Usage Examples

### 1. Claude Requests Code Review from Cursor

```typescript
// Claude sends:
{
  "type": "CODE_REVIEW_REQUEST",
  "target": { "type": "cursor", "id": "cursor-123" },
  "payload": {
    "file": "src/components/Button.tsx",
    "lines": [10, 25],
    "context": "Please review this React component for performance"
  }
}

// Cursor responds:
{
  "type": "CODE_REVIEW_RESPONSE",
  "metadata": { "replyTo": "original-msg-id" },
  "payload": {
    "suggestions": [
      {
        "line": 15,
        "type": "warning",
        "message": "Consider using useMemo here",
        "fix": "const computed = useMemo(() => expensive(), [deps]);"
      }
    ],
    "approved": true
  }
}
```

### 2. Task Coordination

```typescript
// Claude assigns task:
{
  "type": "TASK_ASSIGNMENT",
  "target": "broadcast",
  "payload": {
    "taskId": "implement-auth",
    "title": "Implement authentication",
    "description": "Add JWT authentication to API",
    "priority": "high"
  }
}

// Cursor accepts and updates:
{
  "type": "TASK_STATUS_UPDATE",
  "payload": {
    "taskId": "implement-auth",
    "status": "in_progress",
    "progress": 50
  }
}
```

### 3. Knowledge Sharing

```typescript
// Cursor asks:
{
  "type": "KNOWLEDGE_QUERY",
  "target": "broadcast",
  "payload": {
    "question": "What's the best practice for XState v5 error handling?",
    "tags": ["xstate", "error-handling"]
  }
}

// Claude responds:
{
  "type": "KNOWLEDGE_RESPONSE",
  "metadata": { "replyTo": "query-msg-id" },
  "payload": {
    "answer": "In XState v5, use error events and guard conditions...",
    "confidence": 0.9,
    "sources": ["xstate-docs", "experience"]
  }
}
```

## Message Validation

### Schema Validation
All messages are validated against the following TypeScript schema:

```typescript
interface AIMessage {
  id: string;                    // Required: Unique message identifier
  type: MessageType;             // Required: One of the defined message types
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sender: {
    id: string;
    name: string;
    type: 'AI_ASSISTANT' | 'EXTENSION' | 'HUMAN';
    capabilities: string[];
  };
  receiver: {
    id: string;
    name: string;
    type: 'AI_ASSISTANT' | 'EXTENSION' | 'HUMAN' | 'BROADCAST';
  };
  payload: unknown;              // Message-specific data
  timestamp: string;             // ISO 8601 format
  correlationId?: string;        // Links related messages
  channel?: string;              // Topic channel
  requiresResponse?: boolean;
  retryCount?: number;
  status: 'PENDING' | 'DELIVERED' | 'FAILED' | 'ACKNOWLEDGED';
}
```

### Validation Rules
1. All required fields must be present
2. Timestamps must be valid ISO 8601 strings
3. Message types must match the defined enum
4. Priority levels are validated
5. Payload structure is validated based on message type

## Security & Privacy

### Message Security
- **Signing**: Messages are signed to verify authenticity (implementation pending)
- **Encryption**: Optional encryption for sensitive data (implementation pending)
- **Validation**: All messages are validated against the schema above

### Privacy Considerations
- Messages are stored locally in the workspace
- No data is sent to external servers by default
- AI agents must respect user privacy settings

## Configuration

Add to VS Code settings:

```json
{
  "actor-spa.aiCommunication.enabled": true,
  "actor-spa.aiCommunication.config": {
    "communicationMethod": "websocket",
    "websocketPort": 8765,
    "maxQueueSize": 1000,
    "enableEncryption": false,
    "messageTimeout": 30000
  }
}
```

## Error Handling

### Retry Logic
- Failed messages retry 3 times with exponential backoff
- After max retries, messages go to dead letter queue

### Error Messages
```typescript
{
  "type": "ERROR",
  "payload": {
    "originalMessageId": "failed-msg-id",
    "error": "Connection timeout",
    "code": "TIMEOUT"
  }
}
```

## Best Practices

1. **Use Correlation IDs** - Link related messages together
2. **Set Appropriate Priorities** - Critical messages should have higher priority
3. **Handle Failures Gracefully** - Always have fallback behavior
4. **Respect Rate Limits** - Don't flood other agents with messages
5. **Clean Up Old Messages** - Implement retention policies

## Implementation Status

- ✅ Core message types defined
- ✅ AI Communication Bridge actor
- ✅ Message Queue actor with persistence
- ✅ WebSocket server for real-time
- ✅ VS Code commands (6 commands implemented)
- ✅ File-based message persistence
- ✅ Message retry logic with dead letter queue
- ✅ Statistics tracking
- ⏳ Message encryption
- ⏳ Message signing and verification
- ⏳ Multi-workspace support
- ⏳ Advanced routing rules

## Future Enhancements

1. **Multi-workspace Support** - Communicate across VS Code workspaces
2. **Plugin System** - Allow custom message types
3. **Message Routing** - Advanced routing rules
4. **Analytics Dashboard** - Visualize communication patterns
5. **LLM-specific Optimizations** - Optimize for different AI models

## Contributing

To add support for a new AI agent:

1. Implement the `AIAgent` interface
2. Create WebSocket client or file watcher
3. Handle handshake protocol
4. Subscribe to relevant channels
5. Implement message handlers

Example implementation available in `/examples/custom-ai-agent.ts`