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
      'delays', 'activities', 'invoke', 'always', 'after', 'done', 'error'
    ];
    
    this.machineProperties = [
      'id', 'initial', 'context', 'states', 'on', 'entry', 'exit', 'always',
      'after', 'invoke', 'activities', 'guards', 'actions', 'services', 'strict',
      'preserveActionOrder', 'predictableActionArguments', 'tsTypes'
    ];
    
    this.stateProperties = [
      'on', 'entry', 'exit', 'always', 'after', 'invoke', 'activities',
      'tags', 'description', 'meta', 'data', 'id', 'initial', 'states',
      'type', 'target', 'actions', 'cond', 'in', 'internal', 'src'
    ];
  }

  /**
   * Override to add XState-specific matching
   */
  matchLanguageSpecific() {
    // Check for XState machine definitions
    if (this.matchXStateMachine()) return true;
    
    // Check for XState-specific patterns
    if (this.matchXStatePattern()) return true;
    
    return false;
  }

  /**
   * Override identifier type detection
   */
  getIdentifierType(value) {
    // Check for XState keywords
    if (this.xstateKeywords.includes(value)) {
      return 'xstateKeyword';
    }
    
    // Check if we're in a machine context
    const context = this.getMachineContext();
    
    if (context === 'states' && /^[A-Z_]+$/.test(value)) {
      // State names (often UPPER_CASE)
      return 'stateName';
    }
    
    if (context === 'events' && /^[A-Z_]+$/.test(value)) {
      // Event names (often UPPER_CASE)
      return 'eventName';
    }
    
    if (context === 'context' && this.isPropertyAccess('context')) {
      // Context properties
      return 'contextProperty';
    }
    
    if (context === 'event' && this.isPropertyAccess('event')) {
      // Event properties
      return 'eventProperty';
    }
    
    return super.getIdentifierType(value);
  }

  /**
   * Match XState machine definition
   */
  matchXStateMachine() {
    // Look for createMachine( pattern
    const prevTokens = this.getRecentTokens(3);
    
    if (prevTokens.length > 0) {
      const lastToken = prevTokens[prevTokens.length - 1];
      
      if (lastToken.type === 'identifier' && 
          this.xstateKeywords.includes(lastToken.value) &&
          this.code[this.position] === '(') {
        // We're at the start of a machine definition
        this.inMachineDefinition = true;
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
    
    return false;
  }

  /**
   * Match state object pattern
   */
  matchStateObject() {
    // Look for patterns like: idle: { on: { CLICK: 'active' } }
    const prevToken = this.tokens[this.tokens.length - 1];
    
    if (prevToken && prevToken.type === 'identifier' && 
        this.code[this.position] === ':' &&
        this.isLikelyStateName(prevToken.value)) {
      
      // Change the previous token type to stateName
      prevToken.type = 'stateName';
      return false;
    }
    
    return false;
  }

  /**
   * Match event pattern
   */
  matchEventPattern() {
    // Look for event patterns in on: { EVENT: ... }
    const context = this.getObjectContext();
    
    if (context === 'on' && this.code[this.position] === ':') {
      const prevToken = this.tokens[this.tokens.length - 1];
      
      if (prevToken && prevToken.type === 'identifier' && 
          /^[A-Z_]+$/.test(prevToken.value)) {
        // This is likely an event name
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
    // Look for action patterns like assign({ ... }) or send('EVENT')
    const prevToken = this.tokens[this.tokens.length - 1];
    
    if (prevToken && prevToken.type === 'identifier') {
      const actionKeywords = ['assign', 'send', 'sendTo', 'raise', 'choose', 'pure', 'log'];
      
      if (actionKeywords.includes(prevToken.value) && this.code[this.position] === '(') {
        prevToken.type = 'xstateKeyword';
        return false;
      }
    }
    
    return false;
  }

  /**
   * Check if identifier is likely a state name
   */
  isLikelyStateName(value) {
    // Common patterns for state names
    return /^[a-z][a-zA-Z0-9]*$/.test(value) || // camelCase
           /^[A-Z_]+$/.test(value) ||            // UPPER_CASE
           ['idle', 'loading', 'success', 'failure', 'active', 'inactive'].includes(value);
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
    // This would analyze the token stream to determine context
    // Simplified implementation
    const recent = this.getRecentTokens(10);
    
    for (let i = recent.length - 1; i >= 0; i--) {
      const token = recent[i];
      
      if (token.type === 'identifier') {
        if (token.value === 'states') return 'states';
        if (token.value === 'context') return 'context';
        if (token.value === 'on') return 'events';
        if (token.value === 'event') return 'event';
      }
    }
    
    return null;
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
      
      if (braceDepth === 0 && token.type === 'identifier' && 
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
      } else if (context === 'send' && /^[A-Z_]+$/.test(innerValue)) {
        // This is an event being sent
        lastToken.type = 'eventName';
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
      
      if (token.type === 'identifier') {
        if (['target', 'send', 'sendTo', 'src'].includes(token.value)) {
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
}