/**
 * Lexer - Responsible for breaking code into tokens
 * Handles the low-level character-by-character parsing
 */
export class Lexer {
  constructor(code, options = {}) {
    this.code = code;
    this.position = 0;
    this.tokens = [];
    this.options = options;
    this.language = options.language || 'javascript';
  }

  /**
   * Main tokenization method
   */
  tokenize() {
    while (this.position < this.code.length) {
      this.consumeToken();
    }
    return this.tokens;
  }

  /**
   * Consume the next token
   */
  consumeToken() {
    // Skip whitespace - it will be preserved by the renderer
    this.skipWhitespace();
    
    if (this.position >= this.code.length) {
      return;
    }

    const char = this.code[this.position];
    
    // Comments
    if (this.matchComment()) return;
    
    // Strings
    if (this.matchString()) return;
    
    // Template literals
    if (this.matchTemplateLiteral()) return;
    
    // Regular expressions
    if (this.matchRegex()) return;
    
    // Numbers
    if (this.matchNumber()) return;
    
    // Language-specific tokens
    if (this.matchLanguageSpecific()) return;
    
    // Identifiers and keywords
    if (this.matchIdentifier()) return;
    
    // Operators
    if (this.matchOperator()) return;
    
    // Punctuation
    if (this.matchPunctuation()) return;
    
    // Default - advance position
    this.position++;
  }

  /**
   * Skip whitespace characters
   */
  skipWhitespace() {
    while (this.position < this.code.length && /\s/.test(this.code[this.position])) {
      this.position++;
    }
  }

  /**
   * Add a token to the tokens array
   */
  addToken(type, start, end, value = null, metadata = {}) {
    this.tokens.push({
      type,
      start,
      end,
      value: value || this.code.slice(start, end),
      ...metadata
    });
  }

  /**
   * Match single-line and multi-line comments
   */
  matchComment() {
    const start = this.position;
    
    // Single-line comment
    if (this.code.slice(start, start + 2) === '//') {
      const end = this.code.indexOf('\n', start);
      const actualEnd = end === -1 ? this.code.length : end;
      this.addToken('comment', start, actualEnd);
      this.position = actualEnd;
      return true;
    }
    
    // Multi-line comment
    if (this.code.slice(start, start + 2) === '/*') {
      const end = this.code.indexOf('*/', start + 2);
      if (end !== -1) {
        this.addToken('comment', start, end + 2);
        this.position = end + 2;
        return true;
      }
    }
    
    return false;
  }

  /**
   * Match string literals
   */
  matchString() {
    const char = this.code[this.position];
    if (char === '"' || char === "'") {
      const start = this.position;
      const quote = char;
      this.position++;
      
      while (this.position < this.code.length) {
        if (this.code[this.position] === '\\') {
          this.position += 2;
          continue;
        }
        if (this.code[this.position] === quote) {
          this.position++;
          break;
        }
        this.position++;
      }
      
      this.addToken('string', start, this.position);
      return true;
    }
    
    return false;
  }

  /**
   * Match template literals
   */
  matchTemplateLiteral() {
    if (this.code[this.position] === '`') {
      const start = this.position;
      const parts = [];
      this.position++;
      
      while (this.position < this.code.length) {
        if (this.code[this.position] === '\\') {
          this.position += 2;
          continue;
        }
        
        if (this.code.slice(this.position, this.position + 2) === '${') {
          // Template expression
          const exprStart = this.position;
          this.position += 2;
          let braceCount = 1;
          
          while (this.position < this.code.length && braceCount > 0) {
            if (this.code[this.position] === '{') braceCount++;
            else if (this.code[this.position] === '}') braceCount--;
            this.position++;
          }
          
          parts.push({
            type: 'expression',
            start: exprStart,
            end: this.position
          });
          continue;
        }
        
        if (this.code[this.position] === '`') {
          this.position++;
          break;
        }
        
        this.position++;
      }
      
      this.addToken('templateLiteral', start, this.position, null, { parts });
      return true;
    }
    
    return false;
  }

  /**
   * Match regular expressions
   */
  matchRegex() {
    if (this.code[this.position] === '/' && this.isRegexContext()) {
      const start = this.position;
      this.position++;
      
      while (this.position < this.code.length) {
        if (this.code[this.position] === '\\') {
          this.position += 2;
          continue;
        }
        if (this.code[this.position] === '/') {
          this.position++;
          // Match flags
          while (this.position < this.code.length && /[gimsuvy]/.test(this.code[this.position])) {
            this.position++;
          }
          break;
        }
        this.position++;
      }
      
      this.addToken('regex', start, this.position);
      return true;
    }
    
    return false;
  }

  /**
   * Check if we're in a context where / starts a regex
   */
  isRegexContext() {
    // Simplified regex detection
    const prevToken = this.tokens[this.tokens.length - 1];
    if (!prevToken) return true;
    
    const regexPreceding = ['=', '(', '[', ',', ':', ';', '!', '&', '|', '?', '{', '}', 'return'];
    return regexPreceding.includes(prevToken.value) || prevToken.type === 'keyword';
  }

  /**
   * Match numbers
   */
  matchNumber() {
    const char = this.code[this.position];
    if (/\d/.test(char) || (char === '.' && /\d/.test(this.code[this.position + 1]))) {
      const start = this.position;
      
      // Match number pattern
      while (this.position < this.code.length && /[\d._xXbBoOnN]/.test(this.code[this.position])) {
        this.position++;
      }
      
      this.addToken('number', start, this.position);
      return true;
    }
    
    return false;
  }

  /**
   * Match identifiers and keywords
   */
  matchIdentifier() {
    if (/[a-zA-Z_$]/.test(this.code[this.position])) {
      const start = this.position;
      
      while (this.position < this.code.length && /[a-zA-Z0-9_$]/.test(this.code[this.position])) {
        this.position++;
      }
      
      const value = this.code.slice(start, this.position);
      const type = this.getIdentifierType(value);
      
      this.addToken(type, start, this.position, value);
      return true;
    }
    
    return false;
  }

  /**
   * Determine identifier type
   */
  getIdentifierType(value) {
    const keywords = [
      'const', 'let', 'var', 'function', 'class', 'if', 'else', 'for', 'while',
      'do', 'switch', 'case', 'break', 'continue', 'return', 'throw', 'try',
      'catch', 'finally', 'new', 'this', 'super', 'extends', 'import', 'export',
      'default', 'from', 'async', 'await', 'yield', 'typeof', 'instanceof',
      'in', 'of', 'void', 'delete'
    ];
    
    const booleans = ['true', 'false'];
    const nulls = ['null', 'undefined'];
    
    if (keywords.includes(value)) return 'keyword';
    if (booleans.includes(value)) return 'boolean';
    if (nulls.includes(value)) return 'null';
    
    return 'identifier';
  }

  /**
   * Match operators
   */
  matchOperator() {
    const operators = [
      '===', '!==', '==', '!=', '<=', '>=', '<<', '>>', '>>>', 
      '&&', '||', '??', '++', '--', '+=', '-=', '*=', '/=', '%=',
      '&=', '|=', '^=', '<<=', '>>=', '>>>=', '**=', '??=',
      '=>', '...', '?.',
      '+', '-', '*', '/', '%', '<', '>', '&', '|', '^', '!', '~',
      '?', ':', '=', '**'
    ];
    
    // Sort by length descending to match longer operators first
    operators.sort((a, b) => b.length - a.length);
    
    for (const op of operators) {
      if (this.code.slice(this.position, this.position + op.length) === op) {
        this.addToken('operator', this.position, this.position + op.length, op);
        this.position += op.length;
        return true;
      }
    }
    
    return false;
  }

  /**
   * Match punctuation
   */
  matchPunctuation() {
    const char = this.code[this.position];
    const punctuation = ['(', ')', '[', ']', '{', '}', ',', ';', '.'];
    
    if (punctuation.includes(char)) {
      this.addToken('punctuation', this.position, this.position + 1, char);
      this.position++;
      return true;
    }
    
    return false;
  }

  /**
   * Match language-specific tokens (to be overridden by language-specific lexers)
   */
  matchLanguageSpecific() {
    return false;
  }
}