/**
 * AI Communication Types and Interfaces
 *
 * This module defines the types for inter-AI communication using the actor model.
 * It enables AI agents like Claude (Claude Code) and Cursor to communicate through
 * a standardized message-passing interface.
 */

import type { ActorRef } from 'xstate';

/**
 * Supported AI agent types
 */
export type AIAgentType = 'claude' | 'cursor' | 'copilot' | 'codewhisperer' | 'custom';

/**
 * Message types for different communication scenarios
 */
export enum MessageType {
  // Code Review
  CODE_REVIEW_REQUEST = 'CODE_REVIEW_REQUEST',
  CODE_REVIEW_RESPONSE = 'CODE_REVIEW_RESPONSE',

  // Refactoring
  REFACTOR_SUGGESTION = 'REFACTOR_SUGGESTION',
  REFACTOR_ACCEPTED = 'REFACTOR_ACCEPTED',
  REFACTOR_REJECTED = 'REFACTOR_REJECTED',

  // Architecture
  ARCHITECTURE_PROPOSAL = 'ARCHITECTURE_PROPOSAL',
  ARCHITECTURE_FEEDBACK = 'ARCHITECTURE_FEEDBACK',

  // Task Coordination
  TASK_ASSIGNMENT = 'TASK_ASSIGNMENT',
  TASK_STATUS_UPDATE = 'TASK_STATUS_UPDATE',
  TASK_COMPLETED = 'TASK_COMPLETED',

  // Collaboration
  PAIR_PROGRAMMING_REQUEST = 'PAIR_PROGRAMMING_REQUEST',
  PAIR_PROGRAMMING_RESPONSE = 'PAIR_PROGRAMMING_RESPONSE',

  // Knowledge Sharing
  KNOWLEDGE_QUERY = 'KNOWLEDGE_QUERY',
  KNOWLEDGE_RESPONSE = 'KNOWLEDGE_RESPONSE',

  // System
  HANDSHAKE = 'HANDSHAKE',
  HEARTBEAT = 'HEARTBEAT',
  ACKNOWLEDGMENT = 'ACKNOWLEDGMENT',
  ERROR = 'ERROR',

  // Custom
  CUSTOM = 'CUSTOM',
}

/**
 * Priority levels for message handling
 */
export enum MessagePriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

/**
 * Communication channels for organizing messages
 */
export enum CommunicationChannel {
  CODE_REVIEW = 'code_review',
  REFACTORING = 'refactoring',
  ARCHITECTURE = 'architecture',
  TASK_COORDINATION = 'task_coordination',
  KNOWLEDGE_SHARING = 'knowledge_sharing',
  SYSTEM = 'system',
  GENERAL = 'general',
}

/**
 * AI Agent identification and capabilities
 */
export interface AIAgent {
  id: string;
  type: AIAgentType;
  name: string;
  version: string;
  capabilities: AICapability[];
  metadata?: Record<string, unknown>;
}

/**
 * Capabilities that an AI agent can have
 */
export interface AICapability {
  name: string;
  version: string;
  parameters?: Record<string, unknown>;
}

/**
 * Message metadata for tracking and debugging
 */
export interface MessageMetadata {
  correlationId?: string;
  replyTo?: string;
  expiresAt?: number;
  priority: MessagePriority;
  channel: CommunicationChannel;
  retryCount?: number;
  encrypted?: boolean;
  compressed?: boolean;
}

/**
 * Main message structure for AI communication
 */
export interface AIMessage<T = unknown> {
  id: string;
  timestamp: number;
  source: AIAgent;
  target: AIAgent | 'broadcast';
  type: MessageType;
  payload: T;
  metadata: MessageMetadata;
  signature?: string;
}

/**
 * Message acknowledgment
 */
export interface MessageAcknowledgment {
  messageId: string;
  status: 'received' | 'processing' | 'completed' | 'failed';
  timestamp: number;
  error?: string;
}

/**
 * Communication statistics
 */
export interface CommunicationStats {
  messagesSent: number;
  messagesReceived: number;
  messagesDropped: number;
  averageLatency: number;
  activeConnections: number;
  lastActivity: number;
}

/**
 * Events for the AI Communication Bridge Actor
 */
export type AICommunicationEvent =
  | { type: 'SEND_MESSAGE'; message: AIMessage }
  | { type: 'MESSAGE_RECEIVED'; message: AIMessage }
  | { type: 'SUBSCRIBE'; channel: CommunicationChannel; callback: MessageHandler }
  | { type: 'UNSUBSCRIBE'; channel: CommunicationChannel; handlerId: string }
  | { type: 'CONNECT'; agent: AIAgent }
  | { type: 'DISCONNECT'; agentId: string }
  | { type: 'HEARTBEAT'; agentId: string }
  | { type: 'GET_STATS' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'REPLAY_MESSAGES'; since: number }
  | { type: 'ERROR'; error: Error };

/**
 * Context for the AI Communication Bridge Actor
 */
export interface AICommunicationContext {
  agents: Map<string, AIAgent>;
  messageQueue: AIMessage[];
  messageHistory: AIMessage[];
  subscriptions: Map<CommunicationChannel, Set<MessageSubscription>>;
  stats: CommunicationStats;
  config: CommunicationConfig;
  errors: Error[];
}

/**
 * Message handler function type
 */
export type MessageHandler = (message: AIMessage) => void | Promise<void>;

/**
 * Message subscription
 */
export interface MessageSubscription {
  id: string;
  channel: CommunicationChannel;
  handler: MessageHandler;
  filter?: MessageFilter;
}

/**
 * Message filter for selective subscription
 */
export interface MessageFilter {
  types?: MessageType[];
  sources?: string[];
  priority?: MessagePriority;
}

/**
 * Communication configuration
 */
export interface CommunicationConfig {
  maxQueueSize: number;
  maxHistorySize: number;
  messageTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableEncryption: boolean;
  enableCompression: boolean;
  communicationMethod: 'file' | 'websocket' | 'ipc' | 'vscode-api';
  fileStoragePath?: string;
  websocketPort?: number;
}

/**
 * Common payload types for different message types
 */
export namespace MessagePayloads {
  export interface CodeReviewRequest {
    file: string;
    lines?: [number, number];
    context?: string;
    urgency?: 'low' | 'medium' | 'high';
  }

  export interface CodeReviewResponse {
    suggestions: CodeSuggestion[];
    overallFeedback?: string;
    approved?: boolean;
  }

  export interface CodeSuggestion {
    line: number;
    type: 'error' | 'warning' | 'info' | 'style';
    message: string;
    fix?: string;
  }

  export interface RefactoringSuggestion {
    file: string;
    description: string;
    changes: FileChange[];
    benefits: string[];
    risks?: string[];
  }

  export interface FileChange {
    file: string;
    diff: string;
    description: string;
  }

  export interface TaskAssignment {
    taskId: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    deadline?: number;
    dependencies?: string[];
  }

  export interface KnowledgeQuery {
    question: string;
    context?: string;
    tags?: string[];
  }

  export interface KnowledgeResponse {
    answer: string;
    confidence: number;
    sources?: string[];
    followUpQuestions?: string[];
  }
}

/**
 * Type guards for message types
 */
export const isCodeReviewRequest = (
  message: AIMessage
): message is AIMessage<MessagePayloads.CodeReviewRequest> => {
  return message.type === MessageType.CODE_REVIEW_REQUEST;
};

export const isCodeReviewResponse = (
  message: AIMessage
): message is AIMessage<MessagePayloads.CodeReviewResponse> => {
  return message.type === MessageType.CODE_REVIEW_RESPONSE;
};

/**
 * Actor reference type for the communication bridge
 * The snapshot type is intentionally any as it varies based on the specific actor implementation
 */
// biome-ignore lint/suspicious/noExplicitAny: Actor snapshot type varies by implementation
export type AICommunicationActor = ActorRef<any, AICommunicationEvent>;
