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
    this.contextStack = []; // Track context for better tokenization
    this.lastNonWhitespaceToken = null;
    this.jsxMode = false;
    this.jsxDepth = 0;
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
    // Skip whitespace
    this.skipWhitespace();
    if (this.position >= this.code.length) return;

    // Comments
    if (this.matchComment()) return;

    // Template literals
    if (this.matchTemplateLiteral()) return;

    // Strings
    if (this.matchString()) return;

    // Language-specific tokens (JSX) - check before regex to avoid conflicts
    if (this.matchLanguageSpecific()) return;

    // Regular expressions
    if (this.matchRegex()) return;

    // Numbers
    if (this.matchNumber()) return;

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
    const token = {
      type,
      start,
      end,
      value: value || this.code.slice(start, end),
      ...metadata
    };

    this.tokens.push(token);

    // Update last non-whitespace token for context
    if (type !== 'whitespace') {
      this.lastNonWhitespaceToken = token;
    }

    // Reset JSX mode if we encounter tokens that clearly exit JSX context
    if (this.jsxMode && this.shouldResetJSXMode(token)) {
      this.jsxMode = false;
      this.jsxDepth = 0;
    }
  }

  /**
   * Check if we should reset JSX mode based on the current token
   */
  shouldResetJSXMode(token) {
    // Reset JSX mode on semicolons, certain keywords, or closing braces that end JSX blocks
    const jsxExitTokens = [';', 'const', 'let', 'var', 'function', 'class', 'if', 'for', 'while'];

    if (jsxExitTokens.includes(token.value)) {
      return true;
    }

    // Reset on closing brace if we're at root level
    if (token.value === '}' && this.contextStack.length <= 1) {
      return true;
    }

    return false;
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

      // Check for special comment patterns
      const commentText = this.code.slice(start + 2, actualEnd);
      const metadata = {};

      // Detect TODO, FIXME, etc.
      if (/^\s*(TODO|FIXME|HACK|NOTE|WARNING)/.test(commentText)) {
        metadata.subType = 'annotation';
      }

      this.addToken('comment', start, actualEnd, null, metadata);
      this.position = actualEnd;
      return true;
    }

    // Multi-line comment
    if (this.code.slice(start, start + 2) === '/*') {
      const end = this.code.indexOf('*/', start + 2);
      if (end !== -1) {
        const commentText = this.code.slice(start + 2, end);
        const metadata = {};

        // Detect JSDoc comments
        if (commentText.startsWith('*')) {
          metadata.subType = 'jsdoc';
        }

        this.addToken('comment', start, end + 2, null, metadata);
        this.position = end + 2;
        return true;
      }
    }

    return false;
  }

  /**
   * Match string literals with improved nested quote handling
   */
  matchString() {
    const char = this.code[this.position];
    if (char === '"' || char === "'") {
      const start = this.position;
      const quote = char;
      this.position++;

      while (this.position < this.code.length) {
        const currentChar = this.code[this.position];

        // Handle escape sequences
        if (currentChar === '\\') {
          this.position += 2; // Skip escape sequence
          continue;
        }

        // Found matching quote - end of string
        if (currentChar === quote) {
          this.position++;
          break;
        }

        // Handle line breaks - strings shouldn't span lines unless escaped
        if (currentChar === '\n' || currentChar === '\r') {
          break; // End string at line break
        }

        this.position++;
      }

      this.addToken('string', start, this.position);
      return true;
    }

    return false;
  }

  /**
   * Match template literals with improved expression handling
   */
  matchTemplateLiteral() {
    if (this.code[this.position] === '`') {
      const start = this.position;
      const parts = [];
      this.position++;

      let currentPartStart = this.position;

      while (this.position < this.code.length) {
        if (this.code[this.position] === '\\') {
          this.position += 2;
          continue;
        }

        if (this.code.slice(this.position, this.position + 2) === '${') {
          // Save the text part before expression
          if (this.position > currentPartStart) {
            parts.push({
              type: 'text',
              start: currentPartStart,
              end: this.position
            });
          }

          // Template expression
          const exprStart = this.position;
          this.position += 2;
          let braceCount = 1;

          while (this.position < this.code.length && braceCount > 0) {
            // Handle nested template literals
            if (this.code[this.position] === '`') {
              const subTemplate = this.matchTemplateLiteral();
              if (subTemplate) continue;
            }

            if (this.code[this.position] === '{') braceCount++;
            else if (this.code[this.position] === '}') braceCount--;
            this.position++;
          }

          parts.push({
            type: 'expression',
            start: exprStart,
            end: this.position
          });

          currentPartStart = this.position;
          continue;
        }

        if (this.code[this.position] === '`') {
          // Save final text part
          if (this.position > currentPartStart) {
            parts.push({
              type: 'text',
              start: currentPartStart,
              end: this.position
            });
          }

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
   * Match regular expressions with improved context detection
   */
  matchRegex() {
    if (this.code[this.position] === '/' && this.isRegexContext()) {
      const start = this.position;
      this.position++;

      let inCharClass = false;

      while (this.position < this.code.length) {
        const char = this.code[this.position];

        // Handle character classes
        if (char === '[' && this.code[this.position - 1] !== '\\') {
          inCharClass = true;
        } else if (char === ']' && this.code[this.position - 1] !== '\\') {
          inCharClass = false;
        }

        // Handle escape sequences
        if (char === '\\') {
          this.position += 2;
          continue;
        }

        // End of regex (not in character class)
        if (char === '/' && !inCharClass) {
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
   * Improved regex context detection
   */
  isRegexContext() {
    const prevToken = this.lastNonWhitespaceToken;
    if (!prevToken) return true;

    // Never treat `/` as regex when in JSX mode
    if (this.jsxMode) {
      return false;
    }

    // Don't treat `/` as regex if we just saw JSX opening bracket
    if (prevToken.type === 'jsxBracket' && (prevToken.value === '&lt;' || prevToken.value === '<')) {
      return false;
    }

    // Don't treat `/` as regex if previous token was JSX tag
    if (prevToken.type === 'jsxTag' || prevToken.type === 'reactComponent') {
      return false;
    }

    // Extended list of tokens that can precede a regex
    const regexPreceding = [
      '=', '(', '[', ',', ':', ';', '!', '&', '|', '?', '{', '}',
      'return', 'throw', 'new', 'typeof', 'void', 'delete', 'in',
      '==', '===', '!=', '!==', '<', '>', '<=', '>=',
      '&&', '||', '??', '+', '-', '*', '/', '%', '**'
    ];

    return regexPreceding.includes(prevToken.value) ||
      prevToken.type === 'keyword' ||
      prevToken.type === 'operator';
  }

  /**
   * Match numbers with improved patterns
   */
  matchNumber() {
    const char = this.code[this.position];
    const nextChar = this.code[this.position + 1];

    // Check for number start
    if (/\d/.test(char) ||
      (char === '.' && /\d/.test(nextChar)) ||
      (char === '-' && /\d/.test(nextChar) && this.isNumberContext())) {

      const start = this.position;

      // Handle negative numbers
      if (char === '-') this.position++;

      // Binary (0b), Octal (0o), Hex (0x)
      if (this.code[this.position] === '0' && this.position + 1 < this.code.length) {
        const prefix = this.code[this.position + 1].toLowerCase();
        if (prefix === 'b' || prefix === 'o' || prefix === 'x') {
          this.position += 2;
          const validChars = prefix === 'b' ? /[01_]/ :
            prefix === 'o' ? /[0-7_]/ :
              /[0-9a-fA-F_]/;

          while (this.position < this.code.length && validChars.test(this.code[this.position])) {
            this.position++;
          }

          // BigInt suffix
          if (this.code[this.position] === 'n') {
            this.position++;
          }

          this.addToken('number', start, this.position);
          return true;
        }
      }

      // Decimal numbers
      let hasDecimal = false;
      let hasExponent = false;

      while (this.position < this.code.length) {
        const c = this.code[this.position];

        if (/\d/.test(c) || c === '_') {
          this.position++;
        } else if (c === '.' && !hasDecimal && !hasExponent) {
          hasDecimal = true;
          this.position++;
        } else if ((c === 'e' || c === 'E') && !hasExponent) {
          hasExponent = true;
          this.position++;
          // Optional sign after exponent
          if (this.position < this.code.length && /[+-]/.test(this.code[this.position])) {
            this.position++;
          }
        } else if (c === 'n' && !hasDecimal && !hasExponent) {
          // BigInt suffix
          this.position++;
          break;
        } else {
          break;
        }
      }

      this.addToken('number', start, this.position);
      return true;
    }

    return false;
  }

  /**
   * Check if we're in a context where - starts a negative number
   */
  isNumberContext() {
    const prevToken = this.lastNonWhitespaceToken;
    if (!prevToken) return true;

    const numberPreceding = [
      '=', '(', '[', ',', ':', 'return', '+', '-', '*', '/',
      '%', '**', '<', '>', '<=', '>=', '==', '===', '!=', '!==',
      '&&', '||', '??', '?'
    ];

    return numberPreceding.includes(prevToken.value) ||
      prevToken.type === 'keyword' ||
      prevToken.type === 'operator';
  }

  /**
   * Match identifiers and keywords with improved detection
   */
  matchIdentifier() {
    if (/[a-zA-Z_$]/.test(this.code[this.position])) {
      const start = this.position;

      // Include Unicode characters in identifiers
      while (this.position < this.code.length &&
        /[a-zA-Z0-9_$\u00A0-\uFFFF]/.test(this.code[this.position])) {
        this.position++;
      }

      const value = this.code.slice(start, this.position);
      const type = this.getIdentifierType(value);

      // Check for function calls
      const metadata = {};
      const nextNonWhitespace = this.peekNextNonWhitespace();
      if (nextNonWhitespace === '(' && type === 'identifier') {
        metadata.subType = 'functionCall';
      }

      this.addToken(type, start, this.position, value, metadata);
      return true;
    }

    return false;
  }

  /**
   * Peek at the next non-whitespace character
   */
  peekNextNonWhitespace() {
    let pos = this.position;
    while (pos < this.code.length && /\s/.test(this.code[pos])) {
      pos++;
    }
    return pos < this.code.length ? this.code[pos] : null;
  }

  /**
   * Enhanced identifier type detection
   */
  getIdentifierType(value) {
    // ES6+ keywords
    const keywords = [
      'const', 'let', 'var', 'function', 'class', 'if', 'else', 'for', 'while',
      'do', 'switch', 'case', 'break', 'continue', 'return', 'throw', 'try',
      'catch', 'finally', 'new', 'this', 'super', 'extends', 'import', 'export',
      'default', 'from', 'async', 'await', 'yield', 'typeof', 'instanceof',
      'in', 'of', 'void', 'delete', 'debugger', 'with', 'static', 'get', 'set',
      'constructor', 'as', 'implements', 'interface', 'enum', 'namespace',
      'module', 'declare', 'abstract', 'private', 'protected', 'public',
      'readonly', 'override'
    ];

    const booleans = ['true', 'false'];
    const nulls = ['null', 'undefined'];
    const builtins = ['Array', 'Object', 'String', 'Number', 'Boolean', 'Date',
      'Math', 'JSON', 'Promise', 'Set', 'Map', 'WeakSet', 'WeakMap',
      'Symbol', 'Proxy', 'Reflect', 'Error', 'RegExp', 'Function'];

    // Library-specific function names (XState, React, etc.)
    const libraryFunctions = [
      'createMachine', 'createActor', 'interpret', 'assign', 'spawn', 'sendParent',
      'useMachine', 'useActor', 'useSelector', 'useState', 'useEffect', 'useContext',
      'useReducer', 'useCallback', 'useMemo', 'useRef', 'useImperativeHandle',
      'useLayoutEffect', 'useDebugValue', 'createElement', 'cloneElement'
    ];

    if (keywords.includes(value)) return 'keyword';
    if (booleans.includes(value)) return 'boolean';
    if (nulls.includes(value)) return 'null';
    if (builtins.includes(value)) return 'builtin';
    if (libraryFunctions.includes(value)) return 'function';

    // Check if this is an object property (identifier followed by colon)
    if (this.isObjectProperty()) return 'property';

    // React hooks pattern
    if (/^use[A-Z]/.test(value)) return 'reactHook';

    // Component names (PascalCase)
    if (/^[A-Z][a-zA-Z0-9]*$/.test(value)) return 'className';

    // Common function patterns
    if (this.lastNonWhitespaceToken?.value === 'function') return 'function';
    if (this.lastNonWhitespaceToken?.value === 'class') return 'className';

    return 'identifier';
  }

  /**
   * Check if the current identifier is an object property
   */
  isObjectProperty() {
    // Look ahead to see if this identifier is followed by a colon
    let pos = this.position;

    // Skip whitespace after identifier
    while (pos < this.code.length && /\s/.test(this.code[pos])) {
      pos++;
    }

    return pos < this.code.length && this.code[pos] === ':';
  }

  /**
   * Match operators with all modern JS operators
   */
  matchOperator() {
    // Operators sorted by length (longest first) for correct matching
    const operators = [
      '>>>=', '>>>', '<<=', '>>=', '**=', '&&=', '||=', '??=',
      '===', '!==', '==', '!=', '<=', '>=', '<<', '>>', '&&', '||', '??',
      '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=',
      '=>', '...', '?.', '**',
      '+', '-', '*', '/', '%', '<', '>', '&', '|', '^', '!', '~',
      '?', ':', '=', '.'
    ];

    for (const op of operators) {
      if (this.code.slice(this.position, this.position + op.length) === op) {
        // Special handling for arrow functions
        const metadata = {};
        if (op === '=>') {
          metadata.subType = 'arrow';
        }

        this.addToken('operator', this.position, this.position + op.length, op, metadata);
        this.position += op.length;
        return true;
      }
    }

    return false;
  }

  /**
   * Match punctuation with context tracking
   */
  matchPunctuation() {
    const char = this.code[this.position];
    const punctuation = ['(', ')', '[', ']', '{', '}', ',', ';', '.'];

    if (punctuation.includes(char)) {
      // Update context stack for braces/brackets
      if (char === '{' || char === '[' || char === '(') {
        this.contextStack.push(char);
      } else if (char === '}' || char === ']' || char === ')') {
        this.contextStack.pop();
      }

      this.addToken('punctuation', this.position, this.position + 1, char);
      this.position++;
      return true;
    }

    return false;
  }

  /**
   * Match language-specific tokens - basic JSX support
   */
  matchLanguageSpecific() {
    // Check for JSX comments {/* ... */}
    if (this.code.slice(this.position, this.position + 3) === '{/*') {
      return this.matchJSXComment();
    }

    // Check for JSX elements with escaped HTML entities
    if (this.code.slice(this.position, this.position + 4) === '&lt;') {
      return this.matchJSXElement();
    }

    // Check for JSX elements with raw < characters  
    if (this.code[this.position] === '<' && this.isJSXContext()) {
      return this.matchJSXElementRaw();
    }

    return false;
  }

  /**
   * Check if we're in a JSX context (not a comparison operator)
   */
  isJSXContext() {
    // If we're already in JSX mode, continue detecting JSX
    if (this.jsxMode) {
      return true;
    }

    // Look for JSX patterns: return (, function (, => (, etc.
    const prevToken = this.lastNonWhitespaceToken;
    if (!prevToken) return false;

    // Common JSX preceding patterns
    const jsxPreceding = ['return', '(', '=>', '{', ',', '&&', '||', '?', ':', 'jsx'];

    // Also detect if previous token was JSX (we're continuing JSX)
    if (prevToken.type === 'jsxBracket' || prevToken.type === 'jsxTag' || prevToken.type === 'reactComponent') {
      return true;
    }

    return jsxPreceding.includes(prevToken.value) ||
      (prevToken.type === 'punctuation' && prevToken.value === '(');
  }

  /**
   * Match JSX comments 
   */
  matchJSXComment() {
    if (this.code.slice(this.position, this.position + 3) === '{/*') {
      const start = this.position;

      // Find the end of the JSX comment
      const end = this.code.indexOf('*/}', start + 3);
      if (end !== -1) {
        const fullEnd = end + 3;
        this.addToken('comment', start, fullEnd);
        this.position = fullEnd;
        return true;
      }
    }

    return false;
  }

  /**
   * Match JSX elements like &lt;div&gt; or &lt;/button&gt;
   */
  matchJSXElement() {
    if (this.code.slice(this.position, this.position + 4) === '&lt;') {
      const start = this.position;

      // Add opening bracket
      this.addToken('jsxBracket', this.position, this.position + 4, '&lt;');
      this.position += 4;

      // Skip whitespace
      this.skipWhitespace();

      // Check for closing tag slash
      if (this.code[this.position] === '/') {
        this.addToken('jsxBracket', this.position, this.position + 1, '/');
        this.position++;
        this.skipWhitespace();
      }

      // Match tag name
      if (/[a-zA-Z]/.test(this.code[this.position])) {
        const tagStart = this.position;
        while (this.position < this.code.length && /[a-zA-Z0-9\.\-]/.test(this.code[this.position])) {
          this.position++;
        }

        const tagName = this.code.slice(tagStart, this.position);
        const tokenType = /^[A-Z]/.test(tagName) ? 'reactComponent' : 'jsxTag';
        this.addToken(tokenType, tagStart, this.position, tagName);

        // Skip to closing bracket
        this.skipToJSXClosing();
      }

      return true;
    }

    return false;
  }

  /**
   * Skip to the closing &gt; of a JSX element
   */
  skipToJSXClosing() {
    while (this.position < this.code.length) {
      // Handle JSX attributes
      this.skipWhitespace();

      // Check for self-closing tag
      if (this.code[this.position] === '/') {
        this.addToken('jsxBracket', this.position, this.position + 1, '/');
        this.position++;
        this.skipWhitespace();
      }

      // Check for closing bracket
      if (this.code.slice(this.position, this.position + 4) === '&gt;') {
        this.addToken('jsxBracket', this.position, this.position + 4, '&gt;');
        this.position += 4;
        break;
      }

      // Handle attributes
      if (/[a-zA-Z]/.test(this.code[this.position])) {
        const attrStart = this.position;
        while (this.position < this.code.length && /[a-zA-Z0-9\-_]/.test(this.code[this.position])) {
          this.position++;
        }
        this.addToken('jsxAttribute', attrStart, this.position);

        this.skipWhitespace();

        // Handle = and attribute value
        if (this.code[this.position] === '=') {
          this.addToken('operator', this.position, this.position + 1, '=');
          this.position++;
          this.skipWhitespace();

          // Handle attribute values
          if (this.code[this.position] === '"' || this.code[this.position] === "'") {
            this.matchString();
          } else if (this.code[this.position] === '{') {
            this.matchJSXExpression();
          }
        }
      } else {
        this.position++;
      }
    }
  }

  /**
   * Match JSX expressions {value}
   */
  matchJSXExpression() {
    if (this.code[this.position] === '{') {
      this.addToken('jsxBracket', this.position, this.position + 1, '{');
      this.position++;

      let braceCount = 1;
      const exprStart = this.position;

      // Find the end of the expression
      while (this.position < this.code.length && braceCount > 0) {
        if (this.code[this.position] === '{') {
          braceCount++;
        } else if (this.code[this.position] === '}') {
          braceCount--;
        }

        if (braceCount > 0) {
          this.position++;
        }
      }

      // The content between braces should be tokenized as JavaScript
      if (this.position > exprStart) {
        const exprContent = this.code.slice(exprStart, this.position);
        // For simplicity, treat as identifier - could be enhanced
        this.addToken('identifier', exprStart, this.position, exprContent);
      }

      // Add closing brace
      if (this.code[this.position] === '}') {
        this.addToken('jsxBracket', this.position, this.position + 1, '}');
        this.position++;
      }

      return true;
    }

    return false;
  }

  /**
   * Match JSX elements with raw < characters like <div> or </button>
   */
  matchJSXElementRaw() {
    if (this.code[this.position] === '<') {
      const start = this.position;
      let isClosingTag = false;

      // Add opening bracket
      this.addToken('jsxBracket', this.position, this.position + 1, '<');
      this.position++;

      // Skip whitespace
      this.skipWhitespace();

      // Check for closing tag slash
      if (this.code[this.position] === '/') {
        isClosingTag = true;
        this.addToken('jsxBracket', this.position, this.position + 1, '/');
        this.position++;
        this.skipWhitespace();
      }

      // Match tag name
      if (/[a-zA-Z]/.test(this.code[this.position])) {
        const tagStart = this.position;
        while (this.position < this.code.length && /[a-zA-Z0-9\.\-]/.test(this.code[this.position])) {
          this.position++;
        }

        const tagName = this.code.slice(tagStart, this.position);
        const tokenType = /^[A-Z]/.test(tagName) ? 'reactComponent' : 'jsxTag';
        this.addToken(tokenType, tagStart, this.position, tagName);

        // Track JSX mode
        if (isClosingTag) {
          this.jsxDepth--;
          if (this.jsxDepth <= 0) {
            this.jsxMode = false;
            this.jsxDepth = 0;
          }
        } else {
          this.jsxMode = true;
          this.jsxDepth++;
        }

        // Skip to closing bracket
        this.skipToJSXClosingRaw();
      }

      return true;
    }

    return false;
  }

  /**
   * Skip to the closing > of a JSX element (raw characters)
   */
  skipToJSXClosingRaw() {
    let isSelfClosing = false;

    while (this.position < this.code.length) {
      // Handle JSX attributes
      this.skipWhitespace();

      // Check for self-closing tag
      if (this.code[this.position] === '/') {
        isSelfClosing = true;
        this.addToken('jsxBracket', this.position, this.position + 1, '/');
        this.position++;
        this.skipWhitespace();
      }

      // Check for closing bracket
      if (this.code[this.position] === '>') {
        this.addToken('jsxBracket', this.position, this.position + 1, '>');
        this.position++;

        // Adjust JSX depth for self-closing tags
        if (isSelfClosing && this.jsxDepth > 0) {
          this.jsxDepth--;
          if (this.jsxDepth <= 0) {
            this.jsxMode = false;
            this.jsxDepth = 0;
          }
        }

        break;
      }

      // Handle attributes
      if (/[a-zA-Z]/.test(this.code[this.position])) {
        const attrStart = this.position;
        while (this.position < this.code.length && /[a-zA-Z0-9\-_]/.test(this.code[this.position])) {
          this.position++;
        }
        this.addToken('jsxAttribute', attrStart, this.position);

        this.skipWhitespace();

        // Handle = and attribute value
        if (this.code[this.position] === '=') {
          this.addToken('operator', this.position, this.position + 1, '=');
          this.position++;
          this.skipWhitespace();

          // Handle attribute values
          if (this.code[this.position] === '"' || this.code[this.position] === "'") {
            this.matchString();
          } else if (this.code[this.position] === '{') {
            this.matchJSXExpression();
          }
        }
      } else {
        this.position++;
      }
    }
  }
}
