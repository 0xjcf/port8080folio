/**
 * Test AI Communication between Claude and Cursor
 *
 * This script sets up a test environment for AI-to-AI communication
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  createAIAgent,
  createAICommunicationBridge,
  createMessage,
} from './src/actors/aiCommunicationBridge';
import { AIWebSocketClient, createWebSocketServer } from './src/actors/webSocketServerActor';
import {
  type AIMessage,
  CommunicationChannel,
  type MessagePayloads,
  MessagePriority,
  MessageType,
} from './src/types/aiCommunication';

// Configuration
const USE_WEBSOCKET = false; // Set to true for real-time communication
const MESSAGE_DIR = '.ai-messages';

/**
 * Setup file-based communication test
 */
async function setupFileCommunication() {
  console.log('🚀 Setting up file-based AI communication test...\n');

  // Ensure message directory exists
  const messageDir = path.join(process.cwd(), MESSAGE_DIR);
  await fs.mkdir(messageDir, { recursive: true });
  console.log(`📁 Message directory: ${messageDir}`);

  // Create AI agents
  const claudeAgent = createAIAgent('claude', 'Claude Assistant');
  const cursorAgent = createAIAgent('cursor', 'Cursor IDE Assistant');

  console.log('\n🤖 Agents created:');
  console.log(`  Claude: ${claudeAgent.id}`);
  console.log(`  Cursor: ${cursorAgent.id}`);

  // Create communication bridge
  const bridge = createAICommunicationBridge();
  bridge.start();

  // Register agents
  bridge.send({ type: 'CONNECT', agent: claudeAgent });
  bridge.send({ type: 'CONNECT', agent: cursorAgent });

  return { bridge, claudeAgent, cursorAgent, messageDir };
}

/**
 * Setup WebSocket communication test
 */
async function setupWebSocketCommunication() {
  console.log('🚀 Setting up WebSocket AI communication test...\n');

  // Start WebSocket server
  const wsServer = createWebSocketServer({ port: 8765 });
  wsServer.start();
  wsServer.send({ type: 'START' });

  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log('🌐 WebSocket server started on ws://localhost:8765');

  // Create AI agents
  const claudeAgent = createAIAgent('claude', 'Claude Assistant');
  const cursorAgent = createAIAgent('cursor', 'Cursor IDE Assistant');

  // Create WebSocket clients
  const claudeClient = new AIWebSocketClient(claudeAgent);
  const cursorClient = new AIWebSocketClient(cursorAgent);

  // Connect clients
  await claudeClient.connect();
  await cursorClient.connect();
  console.log('✅ Both agents connected via WebSocket');

  return { wsServer, claudeAgent, cursorAgent, claudeClient, cursorClient };
}

/**
 * Test 1: Code Review Request/Response
 */
async function testCodeReview(setup: any) {
  console.log('\n\n=== Test 1: Code Review Request/Response ===\n');

  const { bridge, claudeAgent, cursorAgent } = setup;

  // Subscribe Cursor to code review messages
  console.log('📥 Cursor subscribing to code review channel...');
  bridge.send({
    type: 'SUBSCRIBE',
    channel: CommunicationChannel.CODE_REVIEW,
    callback: (message: AIMessage) => {
      console.log(`\n[Cursor Received] ${message.type} from ${message.source.name}`);
      console.log('Payload:', JSON.stringify(message.payload, null, 2));

      // Respond to code review request
      if (message.type === MessageType.CODE_REVIEW_REQUEST) {
        const response = createMessage<MessagePayloads.CodeReviewResponse>(
          cursorAgent,
          message.source,
          MessageType.CODE_REVIEW_RESPONSE,
          {
            suggestions: [
              {
                line: 15,
                type: 'warning',
                message: 'Consider using useMemo for expensive computation',
                fix: 'const result = useMemo(() => computeExpensive(data), [data]);',
              },
              {
                line: 23,
                type: 'info',
                message: 'Add aria-label for better accessibility',
                fix: '<button aria-label="Submit form">Submit</button>',
              },
            ],
            overallFeedback:
              'Good implementation! Consider the performance and accessibility improvements.',
            approved: true,
          },
          {
            replyTo: message.id,
            channel: CommunicationChannel.CODE_REVIEW,
          }
        );

        console.log('\n[Cursor Sending] Code review response...');
        bridge.send({ type: 'SEND_MESSAGE', message: response });
      }
    },
  });

  // Claude sends code review request
  const reviewRequest = createMessage<MessagePayloads.CodeReviewRequest>(
    claudeAgent,
    'broadcast',
    MessageType.CODE_REVIEW_REQUEST,
    {
      file: 'src/components/UserDashboard.tsx',
      lines: [10, 30],
      context: 'Please review this React component for performance and accessibility',
      urgency: 'medium',
    },
    {
      priority: MessagePriority.NORMAL,
      channel: CommunicationChannel.CODE_REVIEW,
    }
  );

  console.log('\n[Claude Sending] Code review request...');
  bridge.send({ type: 'SEND_MESSAGE', message: reviewRequest });

  // Wait for exchange
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

/**
 * Test 2: Knowledge Sharing
 */
async function testKnowledgeSharing(setup: any) {
  console.log('\n\n=== Test 2: Knowledge Sharing ===\n');

  const { bridge, claudeAgent, cursorAgent } = setup;

  // Subscribe both agents to knowledge sharing
  bridge.send({
    type: 'SUBSCRIBE',
    channel: CommunicationChannel.KNOWLEDGE_SHARING,
    callback: (message: AIMessage) => {
      if (message.source.id === cursorAgent.id) return; // Skip own messages

      console.log(`\n[Cursor Received] ${message.type}`);

      if (message.type === MessageType.KNOWLEDGE_QUERY) {
        const query = message.payload as MessagePayloads.KnowledgeQuery;
        console.log(`Question: ${query.question}`);

        // Cursor responds with knowledge
        const response = createMessage<MessagePayloads.KnowledgeResponse>(
          cursorAgent,
          message.source,
          MessageType.KNOWLEDGE_RESPONSE,
          {
            answer: `For XState v5 with TypeScript, use the setup() function:

import { setup, createMachine } from 'xstate';

const machine = setup({
  types: {} as {
    context: { count: number };
    events: { type: 'INC' } | { type: 'DEC' };
  },
  actions: {
    increment: assign({ count: ({ context }) => context.count + 1 })
  }
}).createMachine({
  id: 'counter',
  initial: 'active',
  context: { count: 0 },
  states: {
    active: {
      on: {
        INC: { actions: 'increment' }
      }
    }
  }
});`,
            confidence: 0.95,
            sources: ['XState v5 documentation', 'Personal experience with Actor-SPA'],
            followUpQuestions: [
              'Would you like to see how to spawn child actors?',
              'Need help with parallel states?',
            ],
          },
          {
            replyTo: message.id,
            channel: CommunicationChannel.KNOWLEDGE_SHARING,
          }
        );

        console.log('\n[Cursor Sending] Knowledge response...');
        bridge.send({ type: 'SEND_MESSAGE', message: response });
      }
    },
  });

  // Claude asks a question
  const knowledgeQuery = createMessage<MessagePayloads.KnowledgeQuery>(
    claudeAgent,
    'broadcast',
    MessageType.KNOWLEDGE_QUERY,
    {
      question: 'How do I properly type XState v5 machines with TypeScript?',
      context: 'Working on the Actor-SPA framework',
      tags: ['xstate', 'typescript', 'actor-model'],
    },
    {
      channel: CommunicationChannel.KNOWLEDGE_SHARING,
    }
  );

  console.log('[Claude Sending] Knowledge query...');
  bridge.send({ type: 'SEND_MESSAGE', message: knowledgeQuery });

  await new Promise((resolve) => setTimeout(resolve, 2000));
}

/**
 * Test 3: Task Coordination
 */
async function testTaskCoordination(setup: any) {
  console.log('\n\n=== Test 3: Task Coordination ===\n');

  const { bridge, claudeAgent, cursorAgent } = setup;

  // Cursor subscribes to task assignments
  bridge.send({
    type: 'SUBSCRIBE',
    channel: CommunicationChannel.TASK_COORDINATION,
    callback: (message: AIMessage) => {
      console.log(`\n[Cursor Received] ${message.type}`);

      if (message.type === MessageType.TASK_ASSIGNMENT) {
        const task = message.payload as MessagePayloads.TaskAssignment;
        console.log(`Task: ${task.title}`);
        console.log(`Priority: ${task.priority}`);

        // Accept the task
        setTimeout(() => {
          const statusUpdate = createMessage(
            cursorAgent,
            message.source,
            MessageType.TASK_STATUS_UPDATE,
            {
              taskId: task.taskId,
              status: 'accepted',
              assignee: 'Cursor IDE',
              estimatedCompletion: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
            },
            {
              channel: CommunicationChannel.TASK_COORDINATION,
              correlationId: message.id,
            }
          );

          console.log('\n[Cursor Sending] Task accepted...');
          bridge.send({ type: 'SEND_MESSAGE', message: statusUpdate });

          // Simulate task completion
          setTimeout(() => {
            const completionMessage = createMessage(
              cursorAgent,
              message.source,
              MessageType.TASK_COMPLETED,
              {
                taskId: task.taskId,
                result: 'Successfully implemented message validation layer',
                filesChanged: ['src/utils/aiMessageValidator.ts', 'src/types/aiCommunication.ts'],
                testsAdded: 5,
              },
              {
                channel: CommunicationChannel.TASK_COORDINATION,
                correlationId: message.id,
              }
            );

            console.log('\n[Cursor Sending] Task completed...');
            bridge.send({ type: 'SEND_MESSAGE', message: completionMessage });
          }, 3000);
        }, 1000);
      }
    },
  });

  // Claude assigns a task
  const taskAssignment = createMessage<MessagePayloads.TaskAssignment>(
    claudeAgent,
    'broadcast',
    MessageType.TASK_ASSIGNMENT,
    {
      taskId: 'impl-validation-001',
      title: 'Implement message validation layer',
      description: 'Add validation for all AI communication messages using Zod or similar',
      priority: 'high',
      deadline: Date.now() + 4 * 60 * 60 * 1000, // 4 hours
      dependencies: ['types-defined', 'security-requirements'],
    },
    {
      priority: MessagePriority.HIGH,
      channel: CommunicationChannel.TASK_COORDINATION,
    }
  );

  console.log('[Claude Sending] Task assignment...');
  bridge.send({ type: 'SEND_MESSAGE', message: taskAssignment });

  await new Promise((resolve) => setTimeout(resolve, 5000));
}

/**
 * Display communication statistics
 */
function displayStats(bridge: any) {
  console.log('\n\n=== Communication Statistics ===\n');

  const state = bridge.getSnapshot();
  const stats = state.context.stats;

  console.log('📊 Message Statistics:');
  console.log(`  - Messages Sent: ${stats.messagesSent}`);
  console.log(`  - Messages Received: ${stats.messagesReceived}`);
  console.log(`  - Active Connections: ${stats.activeConnections}`);
  console.log(`  - Average Latency: ${Math.round(stats.averageLatency)}ms`);
  console.log(`  - Messages Dropped: ${stats.messagesDropped}`);

  console.log(`\n📜 Message History: ${state.context.messageHistory.length} messages`);
  state.context.messageHistory.slice(-5).forEach((msg: AIMessage, i: number) => {
    console.log(
      `  ${i + 1}. [${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.source.name} → ${msg.type}`
    );
  });
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('====================================');
  console.log('AI Communication Test Suite');
  console.log('Testing Claude ↔ Cursor Communication');
  console.log('====================================');

  try {
    let setup;

    if (USE_WEBSOCKET) {
      setup = await setupWebSocketCommunication();
    } else {
      setup = await setupFileCommunication();
    }

    // Run tests
    await testCodeReview(setup);
    await testKnowledgeSharing(setup);
    await testTaskCoordination(setup);

    // Display statistics
    if (setup.bridge) {
      displayStats(setup.bridge);
    }

    // Cleanup
    console.log('\n\n🧹 Cleaning up...');
    if (setup.bridge) {
      setup.bridge.stop();
    }
    if (setup.wsServer) {
      setup.wsServer.send({ type: 'STOP' });
      setup.wsServer.stop();
    }
    if (setup.claudeClient) {
      setup.claudeClient.close();
    }
    if (setup.cursorClient) {
      setup.cursorClient.close();
    }

    console.log('\n✅ All tests completed successfully!');
    console.log('\n💡 To see messages in VS Code:');
    console.log('  1. Enable AI Communication in settings');
    console.log('  2. Run "AI: View Message History" command');
    console.log('  3. Check .ai-messages/ directory for JSON files');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

// Instructions for Cursor
console.log('\n📋 Instructions for testing with Cursor IDE:\n');
console.log('1. Copy this test file to your Cursor workspace');
console.log('2. Install dependencies: npm install xstate ws');
console.log('3. Run: npx ts-node test-ai-communication.ts');
console.log('4. Or create a similar test that connects as a Cursor agent');
console.log('\nFor real integration:');
console.log('- Enable AI Communication in VS Code settings');
console.log('- Use file-based communication (default) for cross-IDE messaging');
console.log('- Or start WebSocket server for real-time communication\n');

// Run tests if executed directly
if (require.main === module) {
  runTests();
}

export { runTests, setupFileCommunication, setupWebSocketCommunication };
