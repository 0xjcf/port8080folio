# Testing AI Communication with Cursor IDE

## Quick Test Setup

### 1. Enable AI Communication in VS Code

Add to your VS Code settings (`.vscode/settings.json`):

```json
{
  "actor-spa.aiCommunication.enabled": true,
  "actor-spa.aiCommunication.config.communicationMethod": "file",
  "actor-spa.aiCommunication.config.fileStoragePath": ".ai-messages"
}
```

### 2. Create Test Message for Cursor

Create a file `.ai-messages/test-message-for-cursor.json`:

```json
{
  "id": "msg-claude-001",
  "timestamp": 1704067200000,
  "source": {
    "id": "claude-123",
    "type": "claude",
    "name": "Claude Assistant",
    "version": "1.0.0",
    "capabilities": []
  },
  "target": "broadcast",
  "type": "CODE_REVIEW_REQUEST",
  "payload": {
    "file": "src/components/Button.tsx",
    "lines": [10, 25],
    "context": "Please review this button component for accessibility and performance",
    "urgency": "medium"
  },
  "metadata": {
    "priority": 1,
    "channel": "code_review"
  },
  "signature": "test-signature"
}
```

### 3. Test Commands in VS Code

1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run: `AI: View Message History` - Should show the test message
3. Run: `AI: Subscribe to Communication Channel` - Select "code_review"
4. Run: `AI: Send Message to Another Agent` - Send a response

### 4. Monitor Messages

Watch the `.ai-messages/` directory for new JSON files. Each message creates a new file with format: `{timestamp}-{messageId}.json`

## Testing WebSocket Communication

### 1. Enable WebSocket Mode

Update VS Code settings:

```json
{
  "actor-spa.aiCommunication.enabled": true,
  "actor-spa.aiCommunication.config.communicationMethod": "websocket",
  "actor-spa.aiCommunication.config.websocketPort": 8765
}
```

### 2. Start WebSocket Server

Run command: `AI: Start WebSocket Server`

### 3. Connect from Cursor

In Cursor, create this test script:

```javascript
// cursor-test-client.js
const WebSocket = require('ws');

const cursorAgent = {
  id: 'cursor-456',
  type: 'cursor',
  name: 'Cursor IDE',
  version: '1.0.0',
  capabilities: []
};

const ws = new WebSocket('ws://localhost:8765');

ws.on('open', () => {
  console.log('Connected to AI Communication Bridge');
  
  // Send handshake
  ws.send(JSON.stringify({
    type: 'HANDSHAKE',
    agent: cursorAgent
  }));
  
  // Send a test message after 1 second
  setTimeout(() => {
    const message = {
      id: 'msg-cursor-001',
      timestamp: Date.now(),
      source: cursorAgent,
      target: 'broadcast',
      type: 'CODE_REVIEW_RESPONSE',
      payload: {
        suggestions: [
          {
            line: 15,
            type: 'info',
            message: 'Add ARIA label for screen readers',
            fix: 'aria-label="Submit form"'
          }
        ],
        overallFeedback: 'Good component, needs accessibility improvements',
        approved: true
      },
      metadata: {
        priority: 1,
        channel: 'code_review',
        replyTo: 'msg-claude-001'
      }
    };
    
    ws.send(JSON.stringify(message));
    console.log('Sent code review response');
  }, 1000);
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Received:', message.type, 'from', message.source.name);
});

ws.on('error', console.error);
```

Run in Cursor: `node cursor-test-client.js`

## Expected Results

### File-Based Communication
- Messages appear as JSON files in `.ai-messages/`
- VS Code file watcher detects new messages
- Messages show in "AI: View Message History"
- Subscribed channels receive notifications

### WebSocket Communication
- Real-time message exchange
- Lower latency than file-based
- Bidirectional communication
- Connection status in VS Code output

## Debugging

1. Check VS Code Output panel: View → Output → Select "Actor-SPA Framework"
2. Look for AI Communication logs
3. Verify `.ai-messages/` directory exists and is writable
4. For WebSocket: Check if port 8765 is available

## Common Issues

### Messages not appearing
- Ensure AI Communication is enabled in settings
- Check file permissions on `.ai-messages/` directory
- Verify JSON format is correct

### WebSocket connection fails
- Ensure server is started: `AI: Start WebSocket Server`
- Check firewall settings for port 8765
- Verify both agents are on same network

### Type errors
- Message must match AIMessage interface
- All required fields must be present
- Timestamp must be number (milliseconds)

## Next Steps

1. Create automated tests in both IDEs
2. Set up continuous message exchange
3. Implement custom message handlers
4. Add message filtering and routing