// TypeScript version of XState Lexer - extends base lexer with XState-specific tokenization
import { Lexer } from './lexer.js';

interface XStateLexerOptions {
  language?: string;
  [key: string]: any;
}

/**
 * XState Lexer - Extends base lexer with XState-specific tokenization
 * Recognizes XState patterns, state machine configurations, and actor model syntax
 */
export class XStateLexer extends Lexer {
  private xstateKeywords: Set<string>;
  private xstateProperties: Set<string>;
  private machineContext: {
    inStates: boolean;
    inEvents: boolean;
    inActions: boolean;
    inGuards: boolean;
    inServices: boolean;
    depth: number;
  };

  constructor(code: string, options: XStateLexerOptions = {}) {
    super(code, { ...options, language: 'xstate' });
    
    this.machineContext = {
      inStates: false,
      inEvents: false,
      inActions: false,
      inGuards: false,
      inServices: false,
      depth: 0
    };

    // XState v5 keywords and methods
    this.xstateKeywords = new Set([
      'createMachine', 'createActor', 'assign', 'setup', 'fromPromise', 'fromCallback',
      'createActorContext', 'waitFor', 'stopChild', 'spawnChild', 'sendTo', 'sendParent',
      'raise', 'emit', 'enqueueActions', 'and', 'or', 'not', 'stateIn', 'pathMatches',
      'log', 'cancel', 'forwardTo', 'escalate', 'choose', 'pure', 'after', 'invoke',
      'spawn', 'send', 'sendUpdate', 'respond', 'stop', 'done', 'error', 'snapshot',
      'interpret', 'toPromise', 'onTransition', 'onDone', 'onError', 'start', 'getSnapshot'
    ]);

    // XState-specific properties and configuration keys
    this.xstateProperties = new Set([
      'states', 'initial', 'context', 'on', 'entry', 'exit', 'always', 'after',
      'invoke', 'src', 'data', 'onDone', 'onError', 'id', 'type', 'target', 'actions',
      'cond', 'guard', 'in', 'delay', 'meta', 'tags', 'description', 'version',
      'predictableActionArguments', 'preserveActionOrder', 'strict', 'guards',
      'services', 'activities', 'delays', 'actors', 'input', 'output', 'params',
      'schema', 'tsTypes', 'autoForward', 'devTools', 'clock', 'logger'
    ]);
  }

  /**
   * Override to add XState-specific matching
   */
  public matchLanguageSpecific(): boolean {
    // Check for XState machine definitions
    if (this.code.slice(this.position, this.position + 13) === 'createMachine') {
      return this.matchXStateMachine();
    }

    // Check for XState actions
    if (this.code.slice(this.position, this.position + 6) === 'assign') {
      return this.matchXStateAction();
    }

    // Check for state names (quoted strings in states object)
    if (this.isInStatesContext()) {
      return this.matchStateName();
    }

    return false;
  }

  /**
   * Match XState machine creation
   */
  public matchXStateMachine(): boolean {
    const start = this.position;
    const word = this.readIdentifier();

    if (word && this.xstateKeywords.has(word)) {
      this.addToken('xstateKeyword', start, this.position);
      this.machineContext.depth++;
      return true;
    }

    this.position = start;
    return false;
  }

  /**
   * Match XState actions
   */
  public matchXStateAction(): boolean {
    const start = this.position;
    const word = this.readIdentifier();

    if (word && ['assign', 'raise', 'send', 'sendTo', 'sendParent', 'log', 'choose', 'pure'].includes(word)) {
      this.addToken('xstateAction', start, this.position);
      return true;
    }

    this.position = start;
    return false;
  }

  /**
   * Match state names in state machine configuration
   */
  public matchStateName(): boolean {
    if (this.code[this.position] === '"' || this.code[this.position] === "'") {
      const start = this.position;
      const quote = this.code[this.position];
      this.position++;

      while (this.position < this.code.length && this.code[this.position] !== quote) {
        if (this.code[this.position] === '\\') {
          this.position += 2; // Skip escaped character
        } else {
          this.position++;
        }
      }

      if (this.position < this.code.length) {
        this.position++; // Include closing quote
        this.addToken('stateName', start, this.position);
        return true;
      }
    }

    return false;
  }

  /**
   * Check if we're in a states context
   */
  private isInStatesContext(): boolean {
    // Simple heuristic: look for 'states:' pattern in recent tokens
    return this.machineContext.inStates;
  }

  /**
   * Read an identifier from current position
   */
  private readIdentifier(): string | null {
    if (!/[a-zA-Z_$]/.test(this.code[this.position])) return null;

    const start = this.position;
    while (this.position < this.code.length && /[a-zA-Z0-9_$]/.test(this.code[this.position])) {
      this.position++;
    }

    return this.code.slice(start, this.position);
  }

  /**
   * Override identifier type detection for XState patterns
   */
  public getIdentifierType(value: any): "keyword" | "function" | "boolean" | "null" | "builtin" | "property" | "reactHook" | "className" | "identifier" {
    if (typeof value !== 'string') {
      return super.getIdentifierType(value);
    }

    // XState keywords
    if (this.xstateKeywords.has(value)) {
      return 'keyword';
    }

    // XState properties
    if (this.xstateProperties.has(value)) {
      return 'property';
    }

    // State names (camelCase or SCREAMING_SNAKE_CASE)
    if (/^[a-z][a-zA-Z0-9]*$/.test(value) || /^[A-Z][A-Z0-9_]*$/.test(value)) {
      const context = this.getPreviousTokens(3);
      if (context.some(token => token.value === 'states' || token.value === 'target')) {
        return 'property';
      }
    }

    // Event names (typically UPPER_CASE)
    if (/^[A-Z][A-Z0-9_]*$/.test(value)) {
      const context = this.getPreviousTokens(3);
      if (context.some(token => token.value === 'on' || token.value === 'type')) {
        return 'property';
      }
    }

    // Action names in actions array
    if (this.isInActionsContext()) {
      return 'function';
    }

    // Guard names
    if (this.isInGuardsContext()) {
      return 'function';
    }

    return super.getIdentifierType(value);
  }

  /**
   * Check if we're in an actions context
   */
  private isInActionsContext(): boolean {
    return this.machineContext.inActions;
  }

  /**
   * Check if we're in a guards context
   */
  private isInGuardsContext(): boolean {
    return this.machineContext.inGuards;
  }

  /**
   * Get previous tokens for context analysis
   */
  private getPreviousTokens(count: number): any[] {
    const start = Math.max(0, this.tokens.length - count);
    return this.tokens.slice(start);
  }

  /**
   * Update machine context based on current token
   */
  private updateMachineContext(token: any): void {
    if (token.type === 'property' && token.value === 'states') {
      this.machineContext.inStates = true;
    } else if (token.type === 'property' && token.value === 'actions') {
      this.machineContext.inActions = true;
    } else if (token.type === 'property' && token.value === 'guards') {
      this.machineContext.inGuards = true;
    } else if (token.value === '{') {
      this.machineContext.depth++;
    } else if (token.value === '}') {
      this.machineContext.depth--;
      if (this.machineContext.depth <= 1) {
        this.resetMachineContext();
      }
    }
  }

  /**
   * Reset machine context
   */
  private resetMachineContext(): void {
    this.machineContext.inStates = false;
    this.machineContext.inEvents = false;
    this.machineContext.inActions = false;
    this.machineContext.inGuards = false;
    this.machineContext.inServices = false;
  }

  // Public API methods
  public getMachineContext(): any {
    return { ...this.machineContext };
  }

  public getXStateKeywords(): Set<string> {
    return new Set(this.xstateKeywords);
  }

  public getXStateProperties(): Set<string> {
    return new Set(this.xstateProperties);
  }
} 