/**
 * VS Code Commands for AI Communication
 *
 * This module provides commands for AI agents to communicate with each other.
 */

import * as vscode from 'vscode';
import type { createActor } from 'xstate';
import {
  type aiCommunicationBridgeMachine,
  createAIAgent,
  createAICommunicationBridge,
  createMessage,
} from '../actors/aiCommunicationBridge';
import { createWebSocketServer } from '../actors/webSocketServerActor';
import { COMPONENTS, createDebugLogger, type DebugLogger } from '../core/debugLogger';
import {
  type AIAgent,
  type AIMessage,
  CommunicationChannel,
  type MessagePayloads,
  MessagePriority,
  MessageType,
} from '../types/aiCommunication';

// Global instances
let communicationBridge: ReturnType<
  typeof createActor<typeof aiCommunicationBridgeMachine>
> | null = null;
let wsServer: ReturnType<typeof createWebSocketServer> | null = null;
let debugLogger: DebugLogger | null = null;
let currentAgent: AIAgent | null = null;

/**
 * Initialize AI Communication system
 */
export async function initializeAICommunication(
  context: vscode.ExtensionContext,
  outputChannel: vscode.OutputChannel
): Promise<void> {
  debugLogger = createDebugLogger(outputChannel);

  // Check if AI communication is enabled
  const config = vscode.workspace.getConfiguration('actor-spa.aiCommunication');
  if (!config.get<boolean>('enabled', false)) {
    debugLogger.info(COMPONENTS.EXTENSION, 'AI Communication is disabled');
    return;
  }

  debugLogger.info(COMPONENTS.EXTENSION, '🚀 Initializing AI Communication system');

  // Create communication bridge
  communicationBridge = createAICommunicationBridge(debugLogger);
  communicationBridge.start();

  // Determine communication method
  const commMethod = config.get<string>('config.communicationMethod', 'file');

  if (commMethod === 'websocket') {
    // Start WebSocket server
    const wsConfig = {
      port: config.get<number>('config.websocketPort', 8765),
      host: config.get<string>('config.websocketHost', 'localhost'),
    };

    wsServer = createWebSocketServer(wsConfig, debugLogger);
    wsServer.start();
    wsServer.send({ type: 'START' });
  }

  // Create current agent (Claude in this case)
  currentAgent = createAIAgent('claude', 'Claude Assistant');
  communicationBridge.send({
    type: 'CONNECT',
    agent: currentAgent,
  });

  // Set up file watcher for file-based communication
  if (commMethod === 'file') {
    setupFileWatcher(context);
  }

  debugLogger.info(COMPONENTS.EXTENSION, '✅ AI Communication system initialized', {
    method: commMethod,
    agentId: currentAgent.id,
  });
}

/**
 * Set up file watcher for incoming messages
 */
function setupFileWatcher(context: vscode.ExtensionContext): void {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) return;

  const pattern = new vscode.RelativePattern(workspaceFolder, '.ai-messages/*.json');

  const watcher = vscode.workspace.createFileSystemWatcher(pattern);

  watcher.onDidCreate(async (uri) => {
    try {
      const content = await vscode.workspace.fs.readFile(uri);
      const message = JSON.parse(Buffer.from(content).toString()) as AIMessage;

      // Only process messages not from ourselves
      if (message.source.id !== currentAgent?.id) {
        communicationBridge?.send({
          type: 'MESSAGE_RECEIVED',
          message,
        });
      }
    } catch (error) {
      debugLogger?.error(
        COMPONENTS.EXTENSION,
        'Failed to process incoming message',
        { uri: uri.toString() },
        error as Error
      );
    }
  });

  context.subscriptions.push(watcher);
}

/**
 * Register AI Communication commands
 */
export function registerAICommunicationCommands(context: vscode.ExtensionContext): void {
  // Send message command
  const sendMessageCommand = vscode.commands.registerCommand(
    'actor-spa.ai.sendMessage',
    async () => {
      if (!communicationBridge || !currentAgent) {
        vscode.window.showErrorMessage('AI Communication not initialized');
        return;
      }

      // Get message type
      const messageTypes = Object.values(MessageType);
      const selectedType = await vscode.window.showQuickPick(messageTypes, {
        placeHolder: 'Select message type',
      });

      if (!selectedType) return;

      // Get target
      const targetOptions = ['broadcast', 'specific-agent'];
      const targetChoice = await vscode.window.showQuickPick(targetOptions, {
        placeHolder: 'Select target',
      });

      if (!targetChoice) return;

      let target: AIAgent | 'broadcast' = 'broadcast';
      if (targetChoice === 'specific-agent') {
        const agentId = await vscode.window.showInputBox({
          prompt: 'Enter target agent ID',
          placeHolder: 'agent-id',
        });

        if (!agentId) return;

        // For demo, create a mock target agent
        target = createAIAgent('cursor', 'Cursor Assistant');
        target.id = agentId;
      }

      // Get message content based on type
      const payload = await getMessagePayload(selectedType as MessageType);
      if (!payload) return;

      // Create and send message
      const message = createMessage(currentAgent, target, selectedType as MessageType, payload, {
        priority: MessagePriority.NORMAL,
        channel: getChannelForMessageType(selectedType as MessageType),
      });

      communicationBridge.send({
        type: 'SEND_MESSAGE',
        message,
      });

      vscode.window.showInformationMessage(`Message sent: ${selectedType}`);
    }
  );

  // View message history command
  const viewHistoryCommand = vscode.commands.registerCommand(
    'actor-spa.ai.getMessageHistory',
    async () => {
      if (!communicationBridge) {
        vscode.window.showErrorMessage('AI Communication not initialized');
        return;
      }

      // Get history from state
      const state = communicationBridge.getSnapshot();
      const history = state.context.messageHistory;

      if (history.length === 0) {
        vscode.window.showInformationMessage('No messages in history');
        return;
      }

      // Create webview to display history
      const panel = vscode.window.createWebviewPanel(
        'aiMessageHistory',
        'AI Message History',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      panel.webview.html = getMessageHistoryHtml(history);
    }
  );

  // Subscribe to channel command
  const subscribeCommand = vscode.commands.registerCommand(
    'actor-spa.ai.subscribeToChannel',
    async () => {
      if (!communicationBridge) {
        vscode.window.showErrorMessage('AI Communication not initialized');
        return;
      }

      const channels = Object.values(CommunicationChannel);
      const selectedChannel = await vscode.window.showQuickPick(channels, {
        placeHolder: 'Select channel to subscribe',
      });

      if (!selectedChannel) return;

      // Subscribe to channel
      communicationBridge.send({
        type: 'SUBSCRIBE',
        channel: selectedChannel as CommunicationChannel,
        callback: (message: AIMessage) => {
          // Show notification for received messages
          vscode.window
            .showInformationMessage(`${message.source.name}: ${message.type}`, 'View')
            .then((selection) => {
              if (selection === 'View') {
                // Show message details
                const panel = vscode.window.createWebviewPanel(
                  'aiMessage',
                  'AI Message',
                  vscode.ViewColumn.Two,
                  {}
                );

                panel.webview.html = getMessageDetailHtml(message);
              }
            });
        },
      });

      vscode.window.showInformationMessage(`Subscribed to ${selectedChannel} channel`);
    }
  );

  // Get communication stats command
  const getStatsCommand = vscode.commands.registerCommand('actor-spa.ai.getStats', () => {
    if (!communicationBridge) {
      vscode.window.showErrorMessage('AI Communication not initialized');
      return;
    }

    const state = communicationBridge.getSnapshot();
    const stats = state.context.stats;

    vscode.window.showInformationMessage(
      `AI Communication Stats:
        Messages Sent: ${stats.messagesSent}
        Messages Received: ${stats.messagesReceived}
        Active Connections: ${stats.activeConnections}
        Average Latency: ${Math.round(stats.averageLatency)}ms`
    );
  });

  // Start/Stop WebSocket server commands
  const startWSCommand = vscode.commands.registerCommand(
    'actor-spa.ai.startWebSocketServer',
    () => {
      if (!wsServer) {
        const config = vscode.workspace.getConfiguration('actor-spa.aiCommunication');

        // Ensure debugLogger is available
        if (!debugLogger) {
          vscode.window.showErrorMessage('Debug logger not initialized');
          return;
        }

        wsServer = createWebSocketServer(
          {
            port: config.get<number>('config.websocketPort', 8765),
          },
          debugLogger
        );
        wsServer.start();
      }

      wsServer.send({ type: 'START' });
      vscode.window.showInformationMessage('WebSocket server started');
    }
  );

  const stopWSCommand = vscode.commands.registerCommand('actor-spa.ai.stopWebSocketServer', () => {
    if (wsServer) {
      wsServer.send({ type: 'STOP' });
      vscode.window.showInformationMessage('WebSocket server stopped');
    }
  });

  // Register all commands
  context.subscriptions.push(
    sendMessageCommand,
    viewHistoryCommand,
    subscribeCommand,
    getStatsCommand,
    startWSCommand,
    stopWSCommand
  );
}

/**
 * Get message payload based on type
 */
async function getMessagePayload(type: MessageType): Promise<unknown> {
  switch (type) {
    case MessageType.CODE_REVIEW_REQUEST: {
      const file = await vscode.window.showInputBox({
        prompt: 'Enter file path',
        placeHolder: 'src/components/Button.tsx',
      });

      const context = await vscode.window.showInputBox({
        prompt: 'Enter review context',
        placeHolder: 'Please review for performance',
      });

      const payload: MessagePayloads.CodeReviewRequest = {
        file: file || '',
        context,
      };

      return payload;
    }

    case MessageType.KNOWLEDGE_QUERY: {
      const question = await vscode.window.showInputBox({
        prompt: 'Enter your question',
        placeHolder: 'How do I implement...',
      });

      const payload: MessagePayloads.KnowledgeQuery = {
        question: question || '',
      };

      return payload;
    }

    case MessageType.TASK_ASSIGNMENT: {
      const title = await vscode.window.showInputBox({
        prompt: 'Enter task title',
      });

      const description = await vscode.window.showInputBox({
        prompt: 'Enter task description',
      });

      const payload: MessagePayloads.TaskAssignment = {
        taskId: `task-${Date.now()}`,
        title: title || '',
        description: description || '',
        priority: 'medium',
      };

      return payload;
    }

    default:
      return {};
  }
}

/**
 * Get channel for message type
 */
function getChannelForMessageType(type: MessageType): CommunicationChannel {
  if (type.includes('CODE_REVIEW')) return CommunicationChannel.CODE_REVIEW;
  if (type.includes('REFACTOR')) return CommunicationChannel.REFACTORING;
  if (type.includes('ARCHITECTURE')) return CommunicationChannel.ARCHITECTURE;
  if (type.includes('TASK')) return CommunicationChannel.TASK_COORDINATION;
  if (type.includes('KNOWLEDGE')) return CommunicationChannel.KNOWLEDGE_SHARING;
  return CommunicationChannel.GENERAL;
}

/**
 * Generate HTML for message history
 */
function getMessageHistoryHtml(messages: AIMessage[]): string {
  const messageList = messages
    .map(
      (msg) => `
    <div class="message">
      <div class="header">
        <span class="source">${msg.source.name}</span>
        <span class="type">${msg.type}</span>
        <span class="time">${new Date(msg.timestamp).toLocaleString()}</span>
      </div>
      <div class="payload">
        <pre>${JSON.stringify(msg.payload, null, 2)}</pre>
      </div>
    </div>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        .message { border: 1px solid #ddd; margin: 10px 0; padding: 10px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .source { font-weight: bold; }
        .type { color: #666; }
        .time { color: #999; font-size: 0.9em; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; }
      </style>
    </head>
    <body>
      <h1>AI Message History</h1>
      ${messageList}
    </body>
    </html>
  `;
}

/**
 * Generate HTML for message detail
 */
function getMessageDetailHtml(message: AIMessage): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: sans-serif; padding: 20px; }
        h2 { color: #333; }
        .field { margin: 10px 0; }
        .label { font-weight: bold; }
        pre { background: #f5f5f5; padding: 10px; overflow: auto; }
      </style>
    </head>
    <body>
      <h1>AI Message Detail</h1>
      <div class="field">
        <span class="label">From:</span> ${message.source.name} (${message.source.type})
      </div>
      <div class="field">
        <span class="label">Type:</span> ${message.type}
      </div>
      <div class="field">
        <span class="label">Time:</span> ${new Date(message.timestamp).toLocaleString()}
      </div>
      <div class="field">
        <span class="label">Channel:</span> ${message.metadata.channel}
      </div>
      <div class="field">
        <span class="label">Priority:</span> ${message.metadata.priority}
      </div>
      <h2>Payload</h2>
      <pre>${JSON.stringify(message.payload, null, 2)}</pre>
      <h2>Full Message</h2>
      <pre>${JSON.stringify(message, null, 2)}</pre>
    </body>
    </html>
  `;
}

/**
 * Cleanup AI Communication system
 */
export function cleanupAICommunication(): void {
  if (communicationBridge) {
    communicationBridge.stop();
    communicationBridge = null;
  }

  if (wsServer) {
    wsServer.send({ type: 'STOP' });
    wsServer.stop();
    wsServer = null;
  }

  debugLogger?.info(COMPONENTS.EXTENSION, '👋 AI Communication system cleaned up');
}
