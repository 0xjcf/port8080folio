import { Lexer } from './lexer.js';

/**
 * XState Lexer - Extends base lexer with XState-specific tokenization
 */
export class XStateLexer extends Lexer {
  constructor(code, options = {}) {
    super(code, { ...options, language: 'xstate' });

    // XState-specific keywords and patterns
    this.xstateKeywords = [
      'createMachine', 'createActor', 'interpret', 'spawn', 'send', 'sendTo',
      'raise', 'assign', 'pure', 'choose', 'actions', 'guards', 'services',
      'delays', 'activities', 'invoke', 'always', 'after', 'done', 'error',
      'sendParent', 'respond', 'forwardTo', 'escalate', 'log', 'cancel',
      'stop', 'start', 'resume', 'setup', 'useMachine', 'useActor', 'useSelector',
      'spawnChild', 'stopChild', 'waitFor'
    ];

    this.machineProperties = [
      'id', 'initial', 'context', 'states', 'on', 'entry', 'exit', 'always',
      'after', 'invoke', 'activities', 'guards', 'actions', 'services', 'strict',
      'preserveActionOrder', 'predictableActionArguments', 'tsTypes', 'schema',
      'version', 'delimiter', 'historyType', 'type', 'data', 'src', 'description',
      'tags', 'meta', 'parallel'
    ];

    this.stateProperties = [
      'on', 'entry', 'exit', 'always', 'after', 'invoke', 'activities',
      'tags', 'description', 'meta', 'data', 'id', 'initial', 'states',
      'type', 'target', 'actions', 'cond', 'in', 'internal', 'src',
      'onDone', 'onError', 'history', 'final'
    ];

    this.actionTypes = [
      'assign', 'send', 'sendTo', 'sendParent', 'raise', 'respond',
      'forwardTo', 'escalate', 'log', 'cancel', 'stop', 'start',
      'pure', 'choose', 'invoke', 'spawn', 'spawnChild', 'stopChild'
    ];

    this.guardTypes = ['and', 'or', 'not', 'stateIn'];

    // Track current context for better tokenization
    this.machineContext = {
      inMachine: false,
      inStates: false,
      inEvent: false,
      inAction: false,
      depth: 0
    };
  }

  /**
   * Override to add XState-specific matching
   */
  matchLanguageSpecific() {
    // Check for XState machine definitions
    if (this.matchXStateMachine()) return true;

    // Check for XState-specific patterns
    if (this.matchXStatePattern()) return true;

    // Check for actor model patterns
    if (this.matchActorPattern()) return true;

    return false;
  }

  /**
   * Override identifier type detection
   */
  getIdentifierType(value) {
    // FIRST: Always preserve basic JavaScript keywords
    const baseType = super.getIdentifierType(value);
    if (baseType !== 'identifier') {
      return baseType; // Return keyword, boolean, null, builtin, etc.
    }

    // Check for XState keywords
    if (this.xstateKeywords.includes(value)) {
      return 'xstateKeyword';
    }

    // Check for action types
    if (this.actionTypes.includes(value)) {
      return 'xstateAction';
    }

    // Check for guard types
    if (this.guardTypes.includes(value)) {
      return 'xstateGuard';
    }

    // Check if we're in a machine context
    const context = this.getMachineContext();

    // State names (often in states object)
    if (context.inStates && this.isStateDefinition()) {
      return 'stateName';
    }

    // Event names (often UPPER_CASE in on: blocks)
    if (context.inEventHandler && /^[A-Z_]+$/.test(value)) {
      return 'eventName';
    }

    // Service names in invoke blocks
    if (context.inInvoke && (value === 'src' || this.lastNonWhitespaceToken?.value === 'src')) {
      return 'serviceName';
    }

    // Actor names
    if (this.isActorReference(value)) {
      return 'actorName';
    }

    // Machine properties
    if (this.machineProperties.includes(value) && context.inMachine) {
      return 'xstateProperty';
    }

    // State properties
    if (this.stateProperties.includes(value) && context.inStates) {
      return 'xstateProperty';
    }

    // Context properties
    if (context.inContext || this.isPropertyAccess('context')) {
      return 'contextProperty';
    }

    // Event properties
    if (context.inEvent || this.isPropertyAccess('event')) {
      return 'eventProperty';
    }

    return super.getIdentifierType(value);
  }

  /**
   * Match XState machine definition
   */
  matchXStateMachine() {
    // Look for createMachine( or setup( pattern
    const prevTokens = this.getRecentTokens(3);

    if (prevTokens.length > 0) {
      const lastToken = prevTokens[prevTokens.length - 1];

      if ((lastToken.value === 'createMachine' || lastToken.value === 'setup') &&
        this.code[this.position] === '(') {
        // We're at the start of a machine definition
        this.machineContext.inMachine = true;
        this.machineContext.depth = 1;
        return false; // Let normal parsing continue
      }
    }

    return false;
  }

  /**
   * Match XState-specific patterns
   */
  matchXStatePattern() {
    // Check for state/event object patterns
    if (this.matchStateObject()) return true;
    if (this.matchEventPattern()) return true;
    if (this.matchActionPattern()) return true;
    if (this.matchGuardPattern()) return true;
    if (this.matchInvokePattern()) return true;

    return false;
  }

  /**
   * Match state object pattern
   */
  matchStateObject() {
    const prevToken = this.tokens[this.tokens.length - 1];

    // Look for state definitions in states: { idle: { ... } }
    if (prevToken && prevToken.type === 'identifier' &&
      this.code[this.position] === ':' &&
      this.machineContext.inStates &&
      this.isLikelyStateName(prevToken.value)) {

      // Change the previous token type to stateName
      prevToken.type = 'stateName';
      return false;
    }

    // Track when we enter/exit states block
    if (prevToken && prevToken.value === 'states' && this.code[this.position] === ':') {
      this.machineContext.inStates = true;
    }

    return false;
  }

  /**
   * Match event pattern
   */
  matchEventPattern() {
    const context = this.getObjectContext();
    const prevToken = this.tokens[this.tokens.length - 1];

    // Track when we're in an event handler block
    if (prevToken && prevToken.value === 'on' && this.code[this.position] === ':') {
      this.machineContext.inEvent = true;
    }

    // Look for event patterns in on: { EVENT: ... }
    if (context === 'on' && this.code[this.position] === ':') {
      if (prevToken && prevToken.type === 'identifier' &&
        /^[A-Z_]+(\.[A-Z_]+)*$/.test(prevToken.value)) {
        // This is likely an event name (including dotted events like user.click)
        prevToken.type = 'eventName';
        return false;
      }
    }

    return false;
  }

  /**
   * Match action pattern
   */
  matchActionPattern() {
    const prevToken = this.tokens[this.tokens.length - 1];

    if (prevToken && prevToken.type === 'identifier') {
      // Check for action functions
      if (this.actionTypes.includes(prevToken.value) && this.code[this.position] === '(') {
        prevToken.type = 'xstateAction';
        this.machineContext.inAction = true;
        return false;
      }

      // Check for action array context
      if (prevToken.value === 'actions' && this.code[this.position] === ':') {
        this.machineContext.inAction = true;
      }
    }

    return false;
  }

  /**
   * Match guard pattern
   */
  matchGuardPattern() {
    const prevToken = this.tokens[this.tokens.length - 1];

    if (prevToken && prevToken.type === 'identifier') {
      // Check for guard functions
      if (this.guardTypes.includes(prevToken.value) && this.code[this.position] === '(') {
        prevToken.type = 'xstateGuard';
        return false;
      }

      // Check for cond property
      if ((prevToken.value === 'cond' || prevToken.value === 'guard') &&
        this.code[this.position] === ':') {
        // Next identifier will likely be a guard name
        return false;
      }
    }

    return false;
  }

  /**
   * Match invoke pattern
   */
  matchInvokePattern() {
    const prevToken = this.tokens[this.tokens.length - 1];

    if (prevToken && prevToken.value === 'invoke' && this.code[this.position] === ':') {
      this.machineContext.inInvoke = true;
    }

    return false;
  }

  /**
   * Match actor model patterns
   */
  matchActorPattern() {
    const prevToken = this.tokens[this.tokens.length - 1];

    // Check for actor spawning
    if (prevToken && prevToken.value === 'spawn' && this.code[this.position] === '(') {
      prevToken.type = 'xstateKeyword';
      return false;
    }

    // Check for actor methods
    const actorMethods = ['send', 'stop', 'getSnapshot', 'subscribe'];
    if (prevToken && this.code[this.position] === '.' &&
      this.peekNextIdentifier() && actorMethods.includes(this.peekNextIdentifier())) {
      // This is an actor method call
      return false;
    }

    return false;
  }

  /**
   * Check if identifier is likely a state name
   */
  isLikelyStateName(value) {
    // Common patterns for state names
    const commonStates = [
      'idle', 'loading', 'loaded', 'success', 'failure', 'error',
      'active', 'inactive', 'pending', 'resolved', 'rejected',
      'open', 'closed', 'visible', 'hidden', 'enabled', 'disabled',
      'authenticated', 'unauthenticated', 'authorized', 'unauthorized',
      'connected', 'disconnected', 'online', 'offline',
      'empty', 'filled', 'valid', 'invalid',
      'playing', 'paused', 'stopped', 'finished'
    ];

    return commonStates.includes(value) ||
      /^[a-z][a-zA-Z0-9]*$/.test(value) || // camelCase
      /^[A-Z_]+$/.test(value);             // UPPER_CASE
  }

  /**
   * Check if this is a state definition
   */
  isStateDefinition() {
    // Check if the next non-whitespace char is ':'
    const nextChar = this.peekNextNonWhitespace();
    return nextChar === ':';
  }

  /**
   * Check if identifier is an actor reference
   */
  isActorReference(value) {
    // Common actor name patterns
    return value.endsWith('Actor') ||
      value.endsWith('Machine') ||
      value.endsWith('Service') ||
      /^[a-z]+Actor$/.test(value);
  }

  /**
   * Peek at the next identifier
   */
  peekNextIdentifier() {
    let pos = this.position;

    // Skip whitespace
    while (pos < this.code.length && /\s/.test(this.code[pos])) {
      pos++;
    }

    // Check if next is identifier
    if (pos < this.code.length && /[a-zA-Z_$]/.test(this.code[pos])) {
      const start = pos;
      while (pos < this.code.length && /[a-zA-Z0-9_$]/.test(this.code[pos])) {
        pos++;
      }
      return this.code.slice(start, pos);
    }

    return null;
  }

  /**
   * Get recent tokens for context
   */
  getRecentTokens(count) {
    const start = Math.max(0, this.tokens.length - count);
    return this.tokens.slice(start);
  }

  /**
   * Get current machine context
   */
  getMachineContext() {
    // Analyze recent tokens to determine context
    const recent = this.getRecentTokens(10);
    const context = {
      inMachine: this.machineContext.inMachine,
      inStates: false,
      inContext: false,
      inEvent: false,
      inEventHandler: false,
      inAction: false,
      inInvoke: false
    };

    // Look for context indicators
    for (let i = recent.length - 1; i >= 0; i--) {
      const token = recent[i];

      if (token.type === 'identifier' || token.type === 'xstateProperty') {
        if (token.value === 'states') context.inStates = true;
        if (token.value === 'context') context.inContext = true;
        if (token.value === 'on') context.inEventHandler = true;
        if (token.value === 'actions') context.inAction = true;
        if (token.value === 'invoke') context.inInvoke = true;
      }

      // Stop at object boundaries
      if (token.value === '{' || token.value === '}') {
        break;
      }
    }

    return context;
  }

  /**
   * Get current object context
   */
  getObjectContext() {
    // Find the most recent object property name
    let braceDepth = 0;

    for (let i = this.tokens.length - 1; i >= 0; i--) {
      const token = this.tokens[i];

      if (token.value === '}') braceDepth++;
      if (token.value === '{') braceDepth--;

      if (braceDepth === 0 && (token.type === 'identifier' || token.type === 'xstateProperty') &&
        i + 1 < this.tokens.length && this.tokens[i + 1].value === ':') {
        return token.value;
      }
    }

    return null;
  }

  /**
   * Check if we're accessing a property of an object
   */
  isPropertyAccess(objectName) {
    const recent = this.getRecentTokens(3);

    if (recent.length >= 2) {
      return recent[recent.length - 2].value === objectName &&
        recent[recent.length - 1].value === '.';
    }

    return false;
  }

  /**
   * Override string matching to detect state names in strings
   */
  matchString() {
    const matched = super.matchString();

    if (matched) {
      // Check if this string might be a state name or event name
      const lastToken = this.tokens[this.tokens.length - 1];
      const value = lastToken.value;
      const innerValue = value.slice(1, -1); // Remove quotes

      // Check context
      const context = this.getStringContext();

      if (context === 'target' && this.isLikelyStateName(innerValue)) {
        // This is a state target
        lastToken.type = 'stateName';
        lastToken.subType = 'string';
      } else if ((context === 'send' || context === 'raise') && /^[A-Z_]+$/.test(innerValue)) {
        // This is an event being sent
        lastToken.type = 'eventName';
        lastToken.subType = 'string';
      } else if (context === 'src' || context === 'invoke') {
        // This is a service name
        lastToken.type = 'serviceName';
        lastToken.subType = 'string';
      }
    }

    return matched;
  }

  /**
   * Get context for string tokens
   */
  getStringContext() {
    // Look back to see what property or function this string belongs to
    for (let i = this.tokens.length - 2; i >= 0; i--) {
      const token = this.tokens[i];

      if (token.type === 'identifier' || token.type === 'xstateKeyword' ||
        token.type === 'xstateAction' || token.type === 'xstateProperty') {
        if (['target', 'send', 'sendTo', 'raise', 'src', 'invoke'].includes(token.value)) {
          return token.value;
        }
      }

      // Stop looking if we hit a statement boundary
      if (token.value === ';' || token.value === '{' || token.value === '}') {
        break;
      }
    }

    return null;
  }

  /**
   * Override punctuation to track context
   */
  matchPunctuation() {
    const result = super.matchPunctuation();

    if (result) {
      const lastToken = this.tokens[this.tokens.length - 1];

      // Track machine context depth
      if (this.machineContext.inMachine) {
        if (lastToken.value === '{') {
          this.machineContext.depth++;
        } else if (lastToken.value === '}') {
          this.machineContext.depth--;
          if (this.machineContext.depth === 0) {
            this.machineContext.inMachine = false;
            this.machineContext.inStates = false;
            this.machineContext.inEvent = false;
            this.machineContext.inAction = false;
          }
        }
      }
    }

    return result;
  }
}