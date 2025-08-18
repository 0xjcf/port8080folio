/**
 * AI Communication Example
 *
 * This example demonstrates how AI agents can communicate with each other
 * using the Actor-SPA VS Code extension's AI Communication Bridge.
 */

import {
  AIWebSocketClient,
  createAIAgent,
  createAICommunicationBridge,
  createMessage,
} from '../src/actors/aiCommunicationBridge';
import { createWebSocketServer } from '../src/actors/webSocketServerActor';
import {
  CommunicationChannel,
  type MessagePayloads,
  MessagePriority,
  MessageType,
} from '../src/types/aiCommunication';

// Example 1: File-based communication between Claude and Cursor
async function fileCommunicationExample() {
  console.log('=== File-based Communication Example ===\n');

  // Create AI agents
  const claudeAgent = createAIAgent('claude', 'Claude Assistant');
  const cursorAgent = createAIAgent('cursor', 'Cursor Assistant');

  // Create communication bridge
  const bridge = createAICommunicationBridge();
  bridge.start();

  // Register agents
  bridge.send({ type: 'CONNECT', agent: claudeAgent });
  bridge.send({ type: 'CONNECT', agent: cursorAgent });

  // Subscribe Cursor to code review channel
  bridge.send({
    type: 'SUBSCRIBE',
    channel: CommunicationChannel.CODE_REVIEW,
    callback: (message) => {
      console.log(`[Cursor] Received message: ${message.type}`);
      console.log(`[Cursor] From: ${message.source.name}`);
      console.log('[Cursor] Payload:', message.payload);

      // Respond to code review request
      if (message.type === MessageType.CODE_REVIEW_REQUEST) {
        const response = createMessage<MessagePayloads.CodeReviewResponse>(
          cursorAgent,
          message.source,
          MessageType.CODE_REVIEW_RESPONSE,
          {
            suggestions: [
              {
                line: 42,
                type: 'warning',
                message: 'Consider using const instead of let',
                fix: 'const result = await processData();',
              },
            ],
            overallFeedback: 'Code looks good overall, just minor improvements suggested.',
            approved: true,
          },
          {
            replyTo: message.id,
            channel: CommunicationChannel.CODE_REVIEW,
          }
        );

        bridge.send({ type: 'SEND_MESSAGE', message: response });
      }
    },
  });

  // Claude sends a code review request
  const reviewRequest = createMessage<MessagePayloads.CodeReviewRequest>(
    claudeAgent,
    'broadcast',
    MessageType.CODE_REVIEW_REQUEST,
    {
      file: 'src/components/Button.tsx',
      lines: [40, 50],
      context: 'Please review this button component for accessibility',
    },
    {
      priority: MessagePriority.HIGH,
      channel: CommunicationChannel.CODE_REVIEW,
    }
  );

  console.log('[Claude] Sending code review request...\n');
  bridge.send({ type: 'SEND_MESSAGE', message: reviewRequest });

  // Wait for response
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check stats
  const state = bridge.getSnapshot();
  console.log('\n📊 Communication Stats:', state.context.stats);

  bridge.stop();
}

// Example 2: WebSocket real-time communication
async function websocketCommunicationExample() {
  console.log('\n\n=== WebSocket Communication Example ===\n');

  // Start WebSocket server
  const wsServer = createWebSocketServer({ port: 8765 });
  wsServer.start();
  wsServer.send({ type: 'START' });

  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Create AI agents
  const claudeAgent = createAIAgent('claude', 'Claude Assistant');
  const cursorAgent = createAIAgent('cursor', 'Cursor Assistant');

  // Create WebSocket clients
  const claudeClient = new AIWebSocketClient(claudeAgent);
  const cursorClient = new AIWebSocketClient(cursorAgent);

  // Set up message handlers
  cursorClient.onMessage((message) => {
    console.log(`[Cursor WebSocket] Received: ${message.type}`);

    if (message.type === MessageType.KNOWLEDGE_QUERY) {
      const response = createMessage<MessagePayloads.KnowledgeResponse>(
        cursorAgent,
        message.source,
        MessageType.KNOWLEDGE_RESPONSE,
        {
          answer:
            'To implement error boundaries in React, use componentDidCatch lifecycle method or the ErrorBoundary component pattern.',
          confidence: 0.95,
          sources: ['React documentation', 'Personal experience'],
          followUpQuestions: [
            'Would you like to see an example implementation?',
            'Are you using React 16+ which supports error boundaries?',
          ],
        },
        {
          replyTo: message.id,
          channel: CommunicationChannel.KNOWLEDGE_SHARING,
        }
      );

      cursorClient.send(response);
    }
  });

  // Connect clients
  await claudeClient.connect();
  await cursorClient.connect();

  console.log('[WebSocket] Both agents connected\n');

  // Claude asks a question
  const knowledgeQuery = createMessage<MessagePayloads.KnowledgeQuery>(
    claudeAgent,
    'broadcast',
    MessageType.KNOWLEDGE_QUERY,
    {
      question: 'How do I implement error boundaries in React?',
      context: 'Working on a production React app',
      tags: ['react', 'error-handling', 'best-practices'],
    },
    {
      channel: CommunicationChannel.KNOWLEDGE_SHARING,
    }
  );

  console.log('[Claude WebSocket] Sending knowledge query...\n');
  claudeClient.send(knowledgeQuery);

  // Wait for response
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Clean up
  claudeClient.close();
  cursorClient.close();
  wsServer.send({ type: 'STOP' });
  wsServer.stop();
}

// Example 3: Task coordination
async function taskCoordinationExample() {
  console.log('\n\n=== Task Coordination Example ===\n');

  const bridge = createAICommunicationBridge();
  bridge.start();

  // Create AI agents
  const claudeAgent = createAIAgent('claude', 'Claude Assistant');
  const cursorAgent = createAIAgent('cursor', 'Cursor Assistant');
  const copilotAgent = createAIAgent('copilot', 'GitHub Copilot');

  // Register all agents
  [claudeAgent, cursorAgent, copilotAgent].forEach((agent) => {
    bridge.send({ type: 'CONNECT', agent });
  });

  // Subscribe agents to task coordination
  const taskHandlers = new Map([
    [cursorAgent.id, 'Cursor'],
    [copilotAgent.id, 'Copilot'],
  ]);

  taskHandlers.forEach((name, agentId) => {
    bridge.send({
      type: 'SUBSCRIBE',
      channel: CommunicationChannel.TASK_COORDINATION,
      callback: (message) => {
        if (message.type === MessageType.TASK_ASSIGNMENT && message.target === 'broadcast') {
          console.log(
            `[${name}] Received task: ${(message.payload as MessagePayloads.TaskAssignment).title}`
          );

          // Simulate task acceptance
          setTimeout(() => {
            const agent = agentId === cursorAgent.id ? cursorAgent : copilotAgent;
            const statusUpdate = createMessage(
              agent,
              message.source,
              MessageType.TASK_STATUS_UPDATE,
              {
                taskId: (message.payload as MessagePayloads.TaskAssignment).taskId,
                status: 'accepted',
                assignee: name,
              },
              {
                channel: CommunicationChannel.TASK_COORDINATION,
                correlationId: message.id,
              }
            );

            bridge.send({ type: 'SEND_MESSAGE', message: statusUpdate });
          }, Math.random() * 1000);
        }
      },
    });
  });

  // Claude assigns a task
  const task = createMessage<MessagePayloads.TaskAssignment>(
    claudeAgent,
    'broadcast',
    MessageType.TASK_ASSIGNMENT,
    {
      taskId: 'impl-auth-001',
      title: 'Implement JWT authentication',
      description: 'Add JWT-based authentication to the REST API endpoints',
      priority: 'high',
      deadline: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      dependencies: ['setup-database', 'create-user-model'],
    },
    {
      priority: MessagePriority.HIGH,
      channel: CommunicationChannel.TASK_COORDINATION,
    }
  );

  console.log('[Claude] Broadcasting task assignment...\n');
  bridge.send({ type: 'SEND_MESSAGE', message: task });

  // Wait for responses
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Check message history
  const state = bridge.getSnapshot();
  console.log(`\n📜 Message History: ${state.context.messageHistory.length} messages`);
  state.context.messageHistory.forEach((msg, i) => {
    console.log(`  ${i + 1}. ${msg.source.name} → ${msg.type}`);
  });

  bridge.stop();
}

// Run all examples
async function runExamples() {
  try {
    await fileCommunicationExample();
    await websocketCommunicationExample();
    await taskCoordinationExample();

    console.log('\n\n✅ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Example failed:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  runExamples();
}

export { fileCommunicationExample, websocketCommunicationExample, taskCoordinationExample };
