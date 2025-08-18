# AI Communication Testing Guide

## Overview

This guide provides comprehensive testing procedures for the AI Communication system, including automated tests, manual verification, and integration scenarios.

## Prerequisites

1. **Extension Setup**
   ```bash
   cd extensions/actor-spa-vscode
   pnpm install
   pnpm run compile
   pnpm run package
   code --install-extension actor-spa-framework-*.vsix
   ```

2. **WebSocket Testing (Optional)**
   ```bash
   npm install -g ws  # For external testing scripts
   ```

## Testing Scenarios

### 1. File-Based Communication Test

#### Setup
1. Ensure `actor-spa.aiCommunication.enabled` is `true` in settings
2. Create test messages directory: `mkdir -p .ai-messages`

#### Create Test Message
```javascript
// test-file-message.js
const fs = require('fs');
const path = require('path');

const testMessage = {
  id: `test-${Date.now()}`,
  type: 'KNOWLEDGE_SHARE',
  priority: 'MEDIUM',
  sender: {
    id: 'test-agent',
    name: 'Test AI Agent',
    type: 'AI_ASSISTANT',
    capabilities: ['testing']
  },
  receiver: {
    id: 'vscode-actor-spa',
    name: 'VS Code Extension',
    type: 'EXTENSION'
  },
  payload: {
    title: 'Test Message',
    content: 'Testing file-based communication',
    metadata: {
      testId: Date.now(),
      environment: 'test'
    }
  },
  timestamp: new Date().toISOString(),
  correlationId: 'test-001',
  channel: 'testing',
  requiresResponse: true,
  status: 'PENDING'
};

// Write to .ai-messages directory
const fileName = `test-${Date.now()}.json`;
const filePath = path.join('.ai-messages', fileName);

fs.writeFileSync(filePath, JSON.stringify(testMessage, null, 2));
console.log(`✅ Test message created: ${fileName}`);
```

#### Verify
1. Run `node test-file-message.js`
2. In VS Code: `Cmd+Shift+P` → `actor-spa.ai.getMessageHistory`
3. Verify the test message appears

### 2. WebSocket Communication Test

#### Start Server
1. In VS Code: `Cmd+Shift+P` → `actor-spa.ai.startWebSocketServer`
2. Check Output panel for "WebSocket server started on port 8765"

#### Test Client
```javascript
// test-websocket.js
const WebSocket = require('ws');

class AITestClient {
  constructor(agentId, agentName) {
    this.agentId = agentId;
    this.agentName = agentName;
    this.ws = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket('ws://localhost:8765');
      
      this.ws.on('open', () => {
        console.log(`✅ ${this.agentName} connected`);
        this.sendHandshake();
        resolve();
      });
      
      this.ws.on('message', (data) => {
        const message = JSON.parse(data.toString());
        console.log(`📥 ${this.agentName} received:`, message.type);
        this.handleMessage(message);
      });
      
      this.ws.on('error', reject);
    });
  }
  
  sendHandshake() {
    this.send({
      type: 'HANDSHAKE',
      payload: {
        agentId: this.agentId,
        agentName: this.agentName,
        capabilities: ['testing', 'verification']
      }
    });
  }
  
  send(message) {
    const fullMessage = {
      id: `${this.agentId}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sender: {
        id: this.agentId,
        name: this.agentName,
        type: 'AI_ASSISTANT'
      },
      ...message
    };
    
    this.ws.send(JSON.stringify(fullMessage));
    console.log(`📤 ${this.agentName} sent:`, message.type);
  }
  
  handleMessage(message) {
    if (message.type === 'CODE_REVIEW_REQUEST') {
      // Auto-respond to code review requests
      this.send({
        type: 'CODE_REVIEW_RESPONSE',
        receiver: message.sender,
        payload: {
          approved: true,
          suggestions: ['Looks good!'],
          reviewerId: this.agentId
        },
        correlationId: message.id
      });
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Test scenario
async function runTest() {
  const claude = new AITestClient('claude-test', 'Claude Test');
  const cursor = new AITestClient('cursor-test', 'Cursor Test');
  
  try {
    // Connect both agents
    await claude.connect();
    await cursor.connect();
    
    // Claude sends code review request
    await new Promise(resolve => setTimeout(resolve, 1000));
    claude.send({
      type: 'CODE_REVIEW_REQUEST',
      receiver: { id: 'cursor-test' },
      priority: 'HIGH',
      payload: {
        file: 'test.ts',
        lines: [1, 10],
        context: 'Please review this test file'
      }
    });
    
    // Keep connection open for responses
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Send statistics request
    claude.send({
      type: 'SYSTEM',
      payload: { command: 'GET_STATS' }
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } finally {
    claude.disconnect();
    cursor.disconnect();
    console.log('✅ Test completed');
  }
}

runTest().catch(console.error);
```

### 3. Performance Test

```javascript
// test-performance.js
const fs = require('fs');
const path = require('path');

async function performanceTest() {
  console.log('🚀 Starting performance test...\n');
  
  const messageCount = 100;
  const startTime = Date.now();
  
  // Generate test messages
  for (let i = 0; i < messageCount; i++) {
    const message = {
      id: `perf-test-${i}-${Date.now()}`,
      type: i % 2 === 0 ? 'KNOWLEDGE_SHARE' : 'TASK_ASSIGNMENT',
      priority: ['LOW', 'MEDIUM', 'HIGH'][i % 3],
      sender: {
        id: `agent-${i % 5}`,
        name: `Test Agent ${i % 5}`,
        type: 'AI_ASSISTANT',
        capabilities: ['testing']
      },
      receiver: {
        id: 'vscode-actor-spa',
        name: 'VS Code Extension',
        type: 'EXTENSION'
      },
      payload: {
        title: `Performance Test ${i}`,
        content: `Message content for test ${i}`,
        data: Array(10).fill(0).map((_, j) => ({
          index: j,
          value: Math.random()
        }))
      },
      timestamp: new Date().toISOString(),
      channel: `channel-${i % 3}`,
      status: 'PENDING'
    };
    
    const fileName = `perf-${i}-${Date.now()}.json`;
    fs.writeFileSync(
      path.join('.ai-messages', fileName),
      JSON.stringify(message, null, 2)
    );
    
    if ((i + 1) % 10 === 0) {
      console.log(`📝 Created ${i + 1} messages...`);
    }
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  console.log('\n📊 Performance Results:');
  console.log(`- Messages created: ${messageCount}`);
  console.log(`- Total time: ${duration}ms`);
  console.log(`- Average time per message: ${(duration / messageCount).toFixed(2)}ms`);
  console.log(`- Messages per second: ${(messageCount / (duration / 1000)).toFixed(2)}`);
}

performanceTest().catch(console.error);
```

### 4. Integration Test Suite

```javascript
// test-integration.js
const assert = require('assert');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

class IntegrationTestSuite {
  constructor() {
    this.tests = [];
    this.results = [];
  }
  
  test(name, fn) {
    this.tests.push({ name, fn });
  }
  
  async run() {
    console.log('🧪 Running AI Communication Integration Tests\n');
    
    for (const test of this.tests) {
      try {
        await test.fn();
        this.results.push({ name: test.name, passed: true });
        console.log(`✅ ${test.name}`);
      } catch (error) {
        this.results.push({ name: test.name, passed: false, error });
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
    
    this.printSummary();
  }
  
  printSummary() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    
    console.log('\n📊 Test Summary:');
    console.log(`- Total: ${this.results.length}`);
    console.log(`- Passed: ${passed}`);
    console.log(`- Failed: ${failed}`);
    console.log(`- Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
  }
}

// Create test suite
const suite = new IntegrationTestSuite();

// Test 1: File-based message creation
suite.test('File-based message creation', async () => {
  const testId = Date.now();
  const fileName = `test-${testId}.json`;
  const filePath = path.join('.ai-messages', fileName);
  
  const message = {
    id: `test-${testId}`,
    type: 'KNOWLEDGE_SHARE',
    priority: 'LOW',
    sender: { id: 'test', name: 'Test', type: 'AI_ASSISTANT' },
    receiver: { id: 'vscode', name: 'VS Code', type: 'EXTENSION' },
    payload: { test: true },
    timestamp: new Date().toISOString(),
    status: 'PENDING'
  };
  
  fs.writeFileSync(filePath, JSON.stringify(message));
  assert(fs.existsSync(filePath), 'Message file should exist');
  
  // Cleanup
  fs.unlinkSync(filePath);
});

// Test 2: Message validation
suite.test('Message validation', async () => {
  const validMessage = {
    id: 'test-123',
    type: 'TASK_ASSIGNMENT',
    priority: 'HIGH',
    sender: { id: 'ai', name: 'AI', type: 'AI_ASSISTANT', capabilities: [] },
    receiver: { id: 'ext', name: 'Extension', type: 'EXTENSION' },
    payload: { task: 'test' },
    timestamp: new Date().toISOString(),
    status: 'PENDING'
  };
  
  // Validate required fields
  assert(validMessage.id, 'Message must have ID');
  assert(validMessage.type, 'Message must have type');
  assert(validMessage.sender, 'Message must have sender');
  assert(validMessage.receiver, 'Message must have receiver');
});

// Test 3: WebSocket connection
suite.test('WebSocket connection', async () => {
  const ws = new WebSocket('ws://localhost:8765');
  
  return new Promise((resolve, reject) => {
    ws.on('open', () => {
      ws.close();
      resolve();
    });
    
    ws.on('error', () => {
      reject(new Error('WebSocket server not running'));
    });
    
    setTimeout(() => reject(new Error('Connection timeout')), 5000);
  });
});

// Run tests
suite.run().catch(console.error);
```

## Manual Testing Checklist

### Basic Functionality
- [ ] Extension loads without errors
- [ ] AI Communication settings appear in VS Code preferences
- [ ] Commands appear in Command Palette with correct names
- [ ] Output channel "Actor-SPA Framework" shows logs

### File-Based Communication
- [ ] Messages are created in `.ai-messages/` directory
- [ ] Message history command shows all messages
- [ ] Messages persist across VS Code restarts
- [ ] Invalid messages are rejected with errors

### WebSocket Communication
- [ ] Server starts successfully on port 8765
- [ ] Multiple clients can connect simultaneously
- [ ] Messages are delivered in real-time
- [ ] Server handles disconnections gracefully
- [ ] Heartbeat mechanism keeps connections alive

### Error Handling
- [ ] Failed messages go to dead letter queue
- [ ] Retry logic works with exponential backoff
- [ ] Timeout messages are handled correctly
- [ ] Error messages include helpful debugging info

### Performance
- [ ] Can handle 100+ messages without degradation
- [ ] Message history loads quickly with many messages
- [ ] WebSocket maintains low latency
- [ ] No memory leaks during extended use

## Debugging Tips

### Enable Debug Logging
```json
{
  "actor-spa.debug.logLevel": "trace",
  "actor-spa.debug.enabledComponents": ["*"]
}
```

### Check Output Channel
1. View → Output
2. Select "Actor-SPA Framework" from dropdown
3. Look for error messages and stack traces

### Common Issues

| Issue | Solution |
|-------|----------|
| Messages not appearing | Check if AI Communication is enabled in settings |
| WebSocket connection fails | Ensure port 8765 is not in use |
| Performance degradation | Clear old messages from `.ai-messages/` |
| Extension not loading | Check VS Code version compatibility |

## Automated Test Runner

Create a `test-all.sh` script:
```bash
#!/bin/bash

echo "🧪 Running AI Communication Tests"
echo "================================="

# Create messages directory
mkdir -p .ai-messages

# Run test suites
echo -e "\n1. File-based communication test:"
node test-file-message.js

echo -e "\n2. Performance test:"
node test-performance.js

echo -e "\n3. Integration tests:"
node test-integration.js

echo -e "\n4. WebSocket test (requires server running):"
node test-websocket.js

echo -e "\n✅ All tests completed!"
```

## Contributing Tests

When adding new features:
1. Add unit tests in `src/test/`
2. Update integration test suite
3. Add manual test cases to checklist
4. Document any new testing procedures

## Continuous Integration

For CI/CD pipelines:
```yaml
# .github/workflows/test.yml
name: AI Communication Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test
      - run: ./test-all.sh
``` 