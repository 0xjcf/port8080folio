# AI Communication API Reference

## Core Types

### Message Types

```typescript
// Message type enumeration
type MessageType = 
  | 'CODE_REVIEW_REQUEST'
  | 'CODE_REVIEW_RESPONSE'
  | 'REFACTOR_SUGGESTION'
  | 'REFACTOR_ACCEPTED'
  | 'REFACTOR_REJECTED'
  | 'ARCHITECTURE_PROPOSAL'
  | 'ARCHITECTURE_FEEDBACK'
  | 'TASK_ASSIGNMENT'
  | 'TASK_STATUS_UPDATE'
  | 'TASK_COMPLETED'
  | 'KNOWLEDGE_QUERY'
  | 'KNOWLEDGE_RESPONSE'
  | 'HANDSHAKE'
  | 'HEARTBEAT'
  | 'ACKNOWLEDGMENT'
  | 'ERROR';

// Priority levels
type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Message status
type MessageStatus = 'PENDING' | 'DELIVERED' | 'FAILED' | 'ACKNOWLEDGED';

// Agent types
type AgentType = 'AI_ASSISTANT' | 'EXTENSION' | 'HUMAN';
```

### Core Interfaces

```typescript
interface AIAgent {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  type: AgentType;              // Agent type
  capabilities?: string[];       // Optional capabilities list
}

interface AIMessage {
  // Required fields
  id: string;                    // Unique message ID
  type: MessageType;            // Message type
  priority: Priority;           // Message priority
  sender: AIAgent;              // Sender information
  receiver: AIAgent | { type: 'BROADCAST' }; // Receiver or broadcast
  payload: unknown;             // Message-specific data
  timestamp: string;            // ISO 8601 timestamp
  status: MessageStatus;        // Current status
  
  // Optional fields
  correlationId?: string;       // Links related messages
  channel?: string;             // Topic channel
  requiresResponse?: boolean;   // Expects response
  retryCount?: number;          // Retry attempts
  metadata?: Record<string, unknown>; // Additional metadata
}

interface MessagePayload {
  [key: string]: unknown;       // Flexible payload structure
}
```

## Message Payload Types

### Code Review

```typescript
interface CodeReviewRequestPayload {
  file: string;                 // File path
  lines?: [number, number];     // Line range [start, end]
  context?: string;             // Review context
  urgency?: Priority;           // Review urgency
}

interface CodeReviewResponsePayload {
  suggestions: ReviewSuggestion[];
  approved: boolean;
  summary?: string;
  reviewerId: string;
}

interface ReviewSuggestion {
  line: number;
  type: 'error' | 'warning' | 'info';
  message: string;
  fix?: string;                 // Suggested fix
}
```

### Refactoring

```typescript
interface RefactorSuggestionPayload {
  files: string[];              // Affected files
  description: string;          // What to refactor
  rationale: string;           // Why refactor
  estimatedImpact: 'low' | 'medium' | 'high';
  changes: RefactorChange[];
}

interface RefactorChange {
  file: string;
  before: string;
  after: string;
  lineRange: [number, number];
}

interface RefactorResponsePayload {
  accepted: boolean;
  reason?: string;              // If rejected
  modifiedChanges?: RefactorChange[]; // Counter-proposal
}
```

### Task Coordination

```typescript
interface TaskAssignmentPayload {
  taskId: string;
  title: string;
  description: string;
  priority: Priority;
  deadline?: number;            // Unix timestamp
  dependencies?: string[];      // Other task IDs
  estimatedEffort?: number;     // Hours
}

interface TaskStatusUpdatePayload {
  taskId: string;
  status: 'pending' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
  progress?: number;            // 0-100
  blockedReason?: string;
  completedWork?: string[];     // What was done
}
```

### Knowledge Sharing

```typescript
interface KnowledgeQueryPayload {
  question: string;
  context?: string;
  tags?: string[];
  maxResponseLength?: number;
  preferredSources?: string[];
}

interface KnowledgeResponsePayload {
  answer: string;
  confidence: number;           // 0-1
  sources: string[];
  relatedQuestions?: string[];
  codeExamples?: CodeExample[];
}

interface CodeExample {
  language: string;
  code: string;
  description?: string;
}
```

## Actor Interfaces

### Communication Bridge

```typescript
interface CommunicationBridgeContext {
  messages: Map<string, AIMessage>;
  messageHistory: AIMessage[];
  subscriptions: Map<string, Set<(message: AIMessage) => void>>;
  statistics: CommunicationStats;
  config: AICommunicationConfig;
  wsServer?: WebSocketServer;
}

interface CommunicationStats {
  totalMessages: number;
  messagesByType: Record<MessageType, number>;
  messagesByPriority: Record<Priority, number>;
  failedMessages: number;
  averageDeliveryTime: number;
}

interface AICommunicationConfig {
  communicationMethod: 'file' | 'websocket' | 'ipc' | 'vscode-api';
  websocketPort: number;
  websocketHost: string;
  maxQueueSize: number;
  maxHistorySize: number;
  messageTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableEncryption: boolean;
  enableCompression: boolean;
  fileStoragePath: string;
}
```

### Message Queue

```typescript
interface MessageQueueContext {
  queue: PriorityQueue<QueuedMessage>;
  deadLetterQueue: QueuedMessage[];
  processing: Map<string, QueuedMessage>;
  config: MessageQueueConfig;
}

interface QueuedMessage extends AIMessage {
  enqueueTime: number;
  attempts: number;
  lastAttemptTime?: number;
  nextRetryTime?: number;
}

interface MessageQueueConfig {
  maxQueueSize: number;
  maxRetries: number;
  retryDelayMs: number;
  deadLetterQueueSize: number;
  processingTimeout: number;
}
```

### WebSocket Server

```typescript
interface WebSocketServerContext {
  server?: WebSocketServer;
  clients: Map<string, WebSocketClient>;
  config: WebSocketConfig;
  stats: WebSocketStats;
}

interface WebSocketClient {
  id: string;
  ws: WebSocket;
  agent?: AIAgent;
  lastHeartbeat: number;
  subscriptions: Set<string>;
}

interface WebSocketConfig {
  port: number;
  host: string;
  heartbeatInterval: number;
  connectionTimeout: number;
  maxClients: number;
}

interface WebSocketStats {
  totalConnections: number;
  activeConnections: number;
  messagesReceived: number;
  messagesSent: number;
  errors: number;
}
```

## Event Types

```typescript
// Communication Bridge Events
type BridgeEvent = 
  | { type: 'SEND_MESSAGE'; message: AIMessage }
  | { type: 'RECEIVE_MESSAGE'; message: AIMessage }
  | { type: 'SUBSCRIBE'; channel: string; callback: (msg: AIMessage) => void }
  | { type: 'UNSUBSCRIBE'; channel: string; callback: (msg: AIMessage) => void }
  | { type: 'GET_HISTORY'; filter?: MessageFilter }
  | { type: 'GET_STATS' }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'START_WEBSOCKET' }
  | { type: 'STOP_WEBSOCKET' };

// Message Queue Events
type QueueEvent =
  | { type: 'ENQUEUE'; message: AIMessage }
  | { type: 'PROCESS_NEXT' }
  | { type: 'MESSAGE_PROCESSED'; messageId: string; success: boolean }
  | { type: 'RETRY_MESSAGE'; messageId: string }
  | { type: 'MOVE_TO_DLQ'; messageId: string }
  | { type: 'CLEAR_QUEUE' }
  | { type: 'GET_QUEUE_STATUS' };

// WebSocket Server Events
type WSServerEvent =
  | { type: 'START_SERVER' }
  | { type: 'STOP_SERVER' }
  | { type: 'CLIENT_CONNECTED'; clientId: string; ws: WebSocket }
  | { type: 'CLIENT_DISCONNECTED'; clientId: string }
  | { type: 'MESSAGE_RECEIVED'; clientId: string; data: string }
  | { type: 'SEND_TO_CLIENT'; clientId: string; message: AIMessage }
  | { type: 'BROADCAST'; message: AIMessage; excludeClient?: string }
  | { type: 'HEARTBEAT'; clientId: string };
```

## Utility Types

```typescript
// Message filtering
interface MessageFilter {
  type?: MessageType | MessageType[];
  priority?: Priority | Priority[];
  sender?: string;
  receiver?: string;
  channel?: string;
  startTime?: string;
  endTime?: string;
  status?: MessageStatus;
}

// Subscription options
interface SubscriptionOptions {
  channel?: string;
  messageTypes?: MessageType[];
  priority?: Priority;
  sender?: string;
}

// Error types
interface CommunicationError {
  code: ErrorCode;
  message: string;
  details?: unknown;
  originalMessage?: AIMessage;
  timestamp: string;
}

type ErrorCode = 
  | 'INVALID_MESSAGE'
  | 'DELIVERY_FAILED'
  | 'TIMEOUT'
  | 'QUEUE_FULL'
  | 'CONNECTION_FAILED'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED';
```

## Helper Functions

```typescript
// Message creation helpers
function createMessage(
  type: MessageType,
  sender: AIAgent,
  receiver: AIAgent,
  payload: MessagePayload,
  options?: Partial<AIMessage>
): AIMessage;

// Validation helpers
function validateMessage(message: unknown): message is AIMessage;
function isValidMessageType(type: string): type is MessageType;
function isValidPriority(priority: string): priority is Priority;

// Filtering helpers
function filterMessages(
  messages: AIMessage[],
  filter: MessageFilter
): AIMessage[];

// Statistics helpers
function calculateStats(messages: AIMessage[]): CommunicationStats;
function getDeliveryTime(message: AIMessage): number | undefined;
```

## Usage Examples

### Sending a Message

```typescript
import { createMessage } from './ai-communication';

const message = createMessage(
  'CODE_REVIEW_REQUEST',
  { id: 'claude', name: 'Claude', type: 'AI_ASSISTANT' },
  { id: 'cursor', name: 'Cursor', type: 'AI_ASSISTANT' },
  {
    file: 'src/components/Button.tsx',
    lines: [10, 50],
    context: 'Please review for accessibility'
  },
  {
    priority: 'HIGH',
    channel: 'code-review',
    requiresResponse: true
  }
);

// Send via bridge
bridge.send({ type: 'SEND_MESSAGE', message });
```

### Subscribing to Messages

```typescript
const subscription = (message: AIMessage) => {
  if (message.type === 'CODE_REVIEW_REQUEST') {
    console.log('New review request:', message.payload);
  }
};

bridge.send({
  type: 'SUBSCRIBE',
  channel: 'code-review',
  callback: subscription
});
```

### Querying Message History

```typescript
const filter: MessageFilter = {
  type: ['CODE_REVIEW_REQUEST', 'CODE_REVIEW_RESPONSE'],
  priority: ['HIGH', 'CRITICAL'],
  startTime: new Date(Date.now() - 86400000).toISOString(), // Last 24h
  status: 'DELIVERED'
};

const history = await bridge.getHistory(filter);
``` 