// TypeScript interfaces for base Lexer
interface LexerOptions {
  language?: string;
  [key: string]: unknown;
}

export interface Token {
  type: string;
  start: number;
  end: number;
  value: string;
  metadata?: Record<string, unknown>;
  subType?: string;
}

/**
 * Lexer - Base lexical analyzer for JavaScript and related languages
 * Converts source code into a stream of tokens for further processing
 */
export class Lexer {
  protected code: string;
  protected position: number;
  protected tokens: Token[];
  protected options: LexerOptions;
  protected language: string;

  constructor(code: string, options: LexerOptions = {}) {
    this.code = code;
    this.position = 0;
    this.tokens = [];
    this.options = options;
    this.language = options.language || 'javascript';
  }

  /**
   * Main tokenization method - converts code to tokens
   */
  public tokenize(): Token[] {
    this.tokens = [];
    this.position = 0;

    while (this.position < this.code.length) {
      // Skip whitespace
      this.skipWhitespace();
      if (this.position >= this.code.length) break;

      // Try language-specific patterns first
      if (this.matchLanguageSpecific()) continue;

      // Standard JavaScript tokens
      if (this.matchComment()) continue;
      if (this.matchString()) continue;
      if (this.matchNumber()) continue;
      if (this.matchKeyword()) continue;
      if (this.matchOperator()) continue;
      if (this.matchIdentifier()) continue;
      if (this.matchPunctuation()) continue;

      // If nothing matches, consume one character as unknown
      this.addToken('unknown', this.position, this.position + 1);
      this.position++;
    }

    return this.tokens;
  }

  /**
   * Override point for language-specific token matching
   */
  public matchLanguageSpecific(): boolean {
    return false;
  }

  /**
   * Match comments (single-line and multi-line)
   */
  public matchComment(): boolean {
    const start = this.position;

    // Single-line comment
    if (this.code.slice(this.position, this.position + 2) === '//') {
      while (this.position < this.code.length && this.code[this.position] !== '\n') {
        this.position++;
      }
      this.addToken('comment', start, this.position);
      return true;
    }

    // Multi-line comment
    if (this.code.slice(this.position, this.position + 2) === '/*') {
      this.position += 2;
      while (this.position < this.code.length - 1) {
        if (this.code.slice(this.position, this.position + 2) === '*/') {
          this.position += 2;
          break;
        }
        this.position++;
      }
      this.addToken('comment', start, this.position);
      return true;
    }

    return false;
  }

  /**
   * Match string literals (single and double quoted)
   */
  public matchString(): boolean {
    const quote = this.code[this.position];
    if (quote !== '"' && quote !== "'" && quote !== '`') return false;

    const start = this.position;
    this.position++; // Skip opening quote

    // Handle template literals
    if (quote === '`') {
      return this.matchTemplateLiteral(start);
    }

    // Regular string
    while (this.position < this.code.length) {
      const char = this.code[this.position];

      if (char === quote) {
        this.position++; // Include closing quote
        this.addToken('string', start, this.position);
        return true;
      }

      if (char === '\\') {
        this.position += 2; // Skip escaped character
      } else {
        this.position++;
      }
    }

    // Unterminated string
    this.addToken('string', start, this.position);
    return true;
  }

  /**
   * Match template literals with expression support
   */
  private matchTemplateLiteral(start: number): boolean {
    while (this.position < this.code.length) {
      const char = this.code[this.position];

      if (char === '`') {
        this.position++; // Include closing backtick
        this.addToken('templateLiteral', start, this.position);
        return true;
      }

      if (char === '$' && this.code[this.position + 1] === '{') {
        // Template expression
        this.position += 2; // Skip ${
        let braceCount = 1;

        while (this.position < this.code.length && braceCount > 0) {
          if (this.code[this.position] === '{') {
            braceCount++;
          } else if (this.code[this.position] === '}') {
            braceCount--;
          }
          this.position++;
        }
      } else if (char === '\\') {
        this.position += 2; // Skip escaped character
      } else {
        this.position++;
      }
    }

    // Unterminated template literal
    this.addToken('templateLiteral', start, this.position);
    return true;
  }

  /**
   * Match numeric literals
   */
  public matchNumber(): boolean {
    if (!/\d/.test(this.code[this.position])) return false;

    const start = this.position;

    // Handle hex numbers
    if (this.code.slice(this.position, this.position + 2) === '0x') {
      this.position += 2;
      while (this.position < this.code.length && /[0-9a-fA-F]/.test(this.code[this.position])) {
        this.position++;
      }
      this.addToken('number', start, this.position);
      return true;
    }

    // Regular numbers
    while (this.position < this.code.length && /\d/.test(this.code[this.position])) {
      this.position++;
    }

    // Decimal point
    if (this.code[this.position] === '.') {
      this.position++;
      while (this.position < this.code.length && /\d/.test(this.code[this.position])) {
        this.position++;
      }
    }

    // Scientific notation
    if (this.code[this.position] === 'e' || this.code[this.position] === 'E') {
      this.position++;
      if (this.code[this.position] === '+' || this.code[this.position] === '-') {
        this.position++;
      }
      while (this.position < this.code.length && /\d/.test(this.code[this.position])) {
        this.position++;
      }
    }

    this.addToken('number', start, this.position);
    return true;
  }

  /**
   * Match JavaScript keywords
   */
  public matchKeyword(): boolean {
    const keywords = [
      'abstract',
      'arguments',
      'await',
      'boolean',
      'break',
      'byte',
      'case',
      'catch',
      'char',
      'class',
      'const',
      'continue',
      'debugger',
      'default',
      'delete',
      'do',
      'double',
      'else',
      'enum',
      'eval',
      'export',
      'extends',
      'false',
      'final',
      'finally',
      'float',
      'for',
      'function',
      'goto',
      'if',
      'implements',
      'import',
      'in',
      'instanceof',
      'int',
      'interface',
      'let',
      'long',
      'native',
      'new',
      'null',
      'package',
      'private',
      'protected',
      'public',
      'return',
      'short',
      'static',
      'super',
      'switch',
      'synchronized',
      'this',
      'throw',
      'throws',
      'transient',
      'true',
      'try',
      'typeof',
      'var',
      'void',
      'volatile',
      'while',
      'with',
      'yield',
      'async',
      'of',
    ];

    const start = this.position;
    const word = this.readWord();

    if (word && keywords.includes(word)) {
      this.addToken('keyword', start, this.position);
      return true;
    }

    // Reset position if not a keyword
    this.position = start;
    return false;
  }

  /**
   * Match operators
   */
  public matchOperator(): boolean {
    const operators = [
      '===',
      '!==',
      '>=',
      '<=',
      '&&',
      '||',
      '++',
      '--',
      '=>',
      '**',
      '+=',
      '-=',
      '*=',
      '/=',
      '%=',
      '&=',
      '|=',
      '^=',
      '<<=',
      '>>=',
      '>>>=',
      '??',
      '?.',
      '...',
      '==',
      '!=',
      '<<',
      '>>',
      '>>>',
      '+',
      '-',
      '*',
      '/',
      '%',
      '=',
      '<',
      '>',
      '!',
      '&',
      '|',
      '^',
      '~',
      '?',
      ':',
    ];

    // Sort by length (longest first) for proper matching
    operators.sort((a, b) => b.length - a.length);

    for (const op of operators) {
      if (this.code.slice(this.position, this.position + op.length) === op) {
        this.addToken('operator', this.position, this.position + op.length);
        this.position += op.length;
        return true;
      }
    }

    return false;
  }

  /**
   * Match identifiers (variable names, function names, etc.)
   */
  public matchIdentifier(): boolean {
    if (!/[a-zA-Z_$]/.test(this.code[this.position])) return false;

    const start = this.position;
    const identifier = this.readWord();

    if (identifier) {
      const type = this.getIdentifierType(identifier);
      this.addToken(type, start, this.position);
      return true;
    }

    return false;
  }

  /**
   * Determine the type of an identifier
   */
  public getIdentifierType(
    value: string
  ):
    | 'keyword'
    | 'function'
    | 'boolean'
    | 'null'
    | 'builtin'
    | 'property'
    | 'reactHook'
    | 'className'
    | 'identifier' {
    // Boolean literals
    if (value === 'true' || value === 'false') return 'boolean';
    if (value === 'null') return 'null';

    // Built-in objects and functions
    const builtins = [
      'console',
      'window',
      'document',
      'Array',
      'Object',
      'String',
      'Number',
      'Boolean',
      'Date',
      'Math',
      'JSON',
      'Promise',
      'Set',
      'Map',
      'WeakMap',
      'WeakSet',
      'Symbol',
      'BigInt',
      'Proxy',
      'Reflect',
      'parseInt',
      'parseFloat',
      'isNaN',
      'isFinite',
      'encodeURI',
      'decodeURI',
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
    ];

    if (builtins.includes(value)) return 'builtin';

    // Function call pattern
    const nextChar = this.peekNextChar();
    if (nextChar === '(') return 'function';

    // Property access pattern
    const prevChar = this.peekPrevChar();
    if (prevChar === '.') return 'property';

    return 'identifier';
  }

  /**
   * Match punctuation
   */
  public matchPunctuation(): boolean {
    const punctuation = ['(', ')', '[', ']', '{', '}', ';', ',', '.'];

    for (const punct of punctuation) {
      if (this.code[this.position] === punct) {
        this.addToken('punctuation', this.position, this.position + 1);
        this.position++;
        return true;
      }
    }

    return false;
  }

  /**
   * Read a word starting from current position
   */
  private readWord(): string | null {
    if (!/[a-zA-Z_$]/.test(this.code[this.position])) return null;

    const start = this.position;
    while (this.position < this.code.length && /[a-zA-Z0-9_$]/.test(this.code[this.position])) {
      this.position++;
    }

    return this.code.slice(start, this.position);
  }

  /**
   * Skip whitespace characters
   */
  protected skipWhitespace(): void {
    while (this.position < this.code.length && /\s/.test(this.code[this.position])) {
      this.position++;
    }
  }

  /**
   * Add a token to the tokens array
   */
  protected addToken(
    type: string,
    start: number,
    end: number,
    value?: string,
    metadata?: Record<string, unknown>
  ): void {
    const tokenValue = value || this.code.slice(start, end);
    this.tokens.push({
      type,
      start,
      end,
      value: tokenValue,
      metadata,
    });
  }

  /**
   * Peek at next character without advancing position
   */
  private peekNextChar(): string | null {
    let pos = this.position;
    // Skip current word
    while (pos < this.code.length && /[a-zA-Z0-9_$]/.test(this.code[pos])) {
      pos++;
    }
    // Skip whitespace
    while (pos < this.code.length && /\s/.test(this.code[pos])) {
      pos++;
    }
    return pos < this.code.length ? this.code[pos] : null;
  }

  /**
   * Peek at previous character
   */
  private peekPrevChar(): string | null {
    let pos = this.position - 1;
    // Skip whitespace backwards
    while (pos >= 0 && /\s/.test(this.code[pos])) {
      pos--;
    }
    return pos >= 0 ? this.code[pos] : null;
  }

  // Public API methods
  public getTokens(): Token[] {
    return [...this.tokens];
  }

  public getPosition(): number {
    return this.position;
  }

  public getCode(): string {
    return this.code;
  }

  public getLanguage(): string {
    return this.language;
  }
}
