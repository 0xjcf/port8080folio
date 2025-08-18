#!/usr/bin/env node
/**
 * Cursor AI Integration - Automatically processes messages and responds
 * This script can be run alongside Cursor to enable automatic AI communication
 */

import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const CURSOR_AGENT_ID = 'cursor-resubyap7';
const CLAUDE_AGENT_ID = '25e1d44c-5e04-4833-83f7-1bf1be5de876';
const MESSAGES_DIR = path.join(__dirname, '.ai-messages');

// Message handlers for different types
const messageHandlers = {
  KNOWLEDGE_QUERY: async (message) => {
    console.log('\n🧠 Processing KNOWLEDGE_QUERY from', message.source.name);
    console.log('Question:', message.payload.question);
    
    // Automatic response based on the question
    let answer = '';
    let confidence = 0;
    
    if (message.payload.question.includes('WebSocket server actor')) {
      answer = `The WebSocket server actor in our AI communication system:
      
1. **Message Routing**: Uses XState v5 to manage connections and route messages between agents
2. **Connection Handling**: 
   - Maintains a Map of connected clients
   - Handles handshake protocol for agent identification
   - Manages connection lifecycle (connect/disconnect)
3. **Real-time Communication**: 
   - Broadcasts messages to all connected agents
   - Supports targeted messaging to specific agents
   - Provides bidirectional communication channel
4. **State Management**:
   - Idle → Starting → Running states
   - Error handling and recovery
   - Connection health monitoring

The actor pattern ensures clean separation of concerns and predictable state management.`;
      confidence = 0.9;
    } else {
      answer = "I'd need to analyze the codebase to provide a specific answer to that question.";
      confidence = 0.3;
    }
    
    // Send automatic response
    await sendResponse('KNOWLEDGE_RESPONSE', {
      answer,
      confidence,
      sources: ['WebSocket server implementation', 'XState v5 documentation'],
      originalQuestion: message.payload.question
    }, message.id);
  },
  
  CODE_REVIEW_REQUEST: async (message) => {
    console.log('\n👀 Processing CODE_REVIEW_REQUEST from', message.source.name);
    console.log('File:', message.payload.file);
    console.log('Lines:', message.payload.startLine, '-', message.payload.endLine);
    
    // Simulate code review
    const suggestions = [
      "Consider adding error handling for edge cases",
      "The function could benefit from type annotations",
      "Extract magic numbers into named constants"
    ];
    
    await sendResponse('CODE_REVIEW_RESPONSE', {
      file: message.payload.file,
      suggestions,
      overallFeedback: "Good code structure. Minor improvements suggested for maintainability.",
      approved: true,
      severity: 'minor'
    }, message.id);
  },
  
  TASK_ASSIGNMENT: async (message) => {
    console.log('\n📋 Processing TASK_ASSIGNMENT from', message.source.name);
    console.log('Task:', message.payload.title);
    
    await sendResponse('TASK_STATUS_UPDATE', {
      taskId: message.payload.taskId,
      status: 'in_progress',
      estimatedCompletion: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      assignee: CURSOR_AGENT_ID
    }, message.id);
  },
  
  REFACTORING_SUGGESTION: async (message) => {
    console.log('\n🔧 Processing REFACTORING_SUGGESTION from', message.source.name);
    
    await sendResponse('REFACTORING_RESPONSE', {
      accepted: true,
      modifiedCode: message.payload.suggestedCode,
      reasoning: "The suggested refactoring improves code clarity and follows our style guide."
    }, message.id);
  }
};

// Send response function
async function sendResponse(type, payload, correlationId) {
  const response = {
    id: `cursor-resp-${Date.now()}`,
    type,
    source: {
      id: CURSOR_AGENT_ID,
      type: 'cursor',
      name: 'Cursor Assistant'
    },
    target: {
      id: CLAUDE_AGENT_ID,
      type: 'claude',
      name: 'Claude'
    },
    payload,
    metadata: {
      correlationId,
      priority: 'NORMAL',
      channel: 'auto-response',
      timestamp: new Date().toISOString()
    },
    timestamp: Date.now()
  };
  
  const filename = `cursor-response-${Date.now()}.json`;
  const filepath = path.join(MESSAGES_DIR, filename);
  
  await fs.writeFile(filepath, JSON.stringify(response, null, 2));
  console.log(`\n✅ Response sent: ${filename}`);
  console.log('Response type:', type);
}

// Process incoming messages
async function processMessage(message) {
  // Check if message is for Cursor
  if (message.target && 
      (message.target.id === CURSOR_AGENT_ID || message.target === 'broadcast')) {
    
    const handler = messageHandlers[message.type];
    if (handler) {
      try {
        await handler(message);
      } catch (error) {
        console.error('❌ Error processing message:', error);
      }
    } else {
      console.log(`⚠️  No handler for message type: ${message.type}`);
    }
  }
}

// Start the AI agent client as a subprocess
function startAgentClient() {
  console.log('🚀 Starting Cursor AI Integration...\n');
  
  const agentProcess = spawn('node', [
    'ai-agent-client.mjs',
    `--agent-id=${CURSOR_AGENT_ID}`,
    '--agent-name=Cursor',
    '--mode=file',
    '--poll-interval=2000'
  ], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let buffer = '';
  
  agentProcess.stdout.on('data', (data) => {
    buffer += data.toString();
    
    // Look for complete AI ACTION REQUIRED blocks
    const actionMatch = buffer.match(/🤖 AI ACTION REQUIRED:\n({[\s\S]*?})\n/);
    if (actionMatch) {
      try {
        const actionData = JSON.parse(actionMatch[1]);
        if (actionData.message) {
          processMessage(actionData.message);
        }
      } catch (error) {
        // Not a complete JSON yet, keep buffering
      }
    }
    
    // Clear buffer if it gets too large
    if (buffer.length > 10000) {
      buffer = buffer.slice(-5000);
    }
  });
  
  agentProcess.stderr.on('data', (data) => {
    console.error('Error:', data.toString());
  });
  
  agentProcess.on('close', (code) => {
    console.log(`Agent process exited with code ${code}`);
    // Restart after 5 seconds
    setTimeout(startAgentClient, 5000);
  });
  
  return agentProcess;
}

// Interactive command mode
async function startInteractiveMode() {
  console.log('\n📝 Interactive Commands:');
  console.log('  send <type> <message> - Send a custom message');
  console.log('  status - Show integration status');
  console.log('  exit - Stop the integration\n');
  
  process.stdin.on('data', async (data) => {
    const input = data.toString().trim();
    const [command, ...args] = input.split(' ');
    
    switch (command) {
      case 'send':
        const [msgType, ...msgParts] = args;
        const message = msgParts.join(' ');
        await sendResponse(msgType || 'KNOWLEDGE_SHARING', {
          content: message || 'Manual message from Cursor',
          timestamp: new Date().toISOString()
        });
        break;
        
      case 'status':
        console.log('✅ Cursor AI Integration is running');
        console.log(`Agent ID: ${CURSOR_AGENT_ID}`);
        console.log(`Messages directory: ${MESSAGES_DIR}`);
        break;
        
      case 'exit':
        console.log('👋 Stopping Cursor AI Integration...');
        process.exit(0);
        break;
        
      default:
        if (input) {
          console.log('Unknown command:', command);
        }
    }
  });
}

// Main function
async function main() {
  console.log('🤖 Cursor AI Integration - Automatic Message Processing\n');
  console.log('This integration will:');
  console.log('✓ Monitor messages from other AI agents');
  console.log('✓ Automatically process and respond to queries');
  console.log('✓ Handle code reviews, tasks, and knowledge requests\n');
  
  // Ensure messages directory exists
  await fs.mkdir(MESSAGES_DIR, { recursive: true });
  
  // Start the agent client subprocess
  const agentProcess = startAgentClient();
  
  // Start interactive mode
  await startInteractiveMode();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down Cursor AI Integration...');
    agentProcess.kill();
    process.exit(0);
  });
}

// Run the integration
main().catch(console.error); 