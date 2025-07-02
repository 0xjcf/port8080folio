// TypeScript version of JSX Lexer - extends base lexer with JSX support
import { Lexer } from './lexer.js';

interface JSXLexerOptions {
  language?: string;
  [key: string]: any;
}

/**
 * JSX Lexer - Extends base lexer with JSX-specific tokenization
 */
export class JSXLexer extends Lexer {
  constructor(code: string, options: JSXLexerOptions = {}) {
    super(code, { ...options, language: 'jsx' });
  }

  /**
   * Override to add JSX-specific matching
   */
  matchLanguageSpecific(): boolean {
    // Check for JSX comment syntax {/* ... */}
    if (this.code.slice(this.position, this.position + 3) === '{/*') {
      return this.matchJSXComment();
    }

    // Check for JSX tags with escaped HTML entities
    if (this.code.slice(this.position, this.position + 4) === '&lt;') {
      return this.matchJSX();
    }

    return false;
  }

  /**
   * Match JSX comments
   */
  public matchJSXComment(): boolean {
    if (this.code.slice(this.position, this.position + 2) === '/*') {
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
   * Enhanced JSX matching for escaped JSX only
   */
  public matchJSX(): boolean {
    // Check for escaped JSX: &lt;
    if (this.code.slice(this.position, this.position + 4) === '&lt;') {
      return this.matchEscapedJSX();
    }

    return false;
  }

  /**
   * Match escaped JSX (&lt;div&gt; format)
   */
  public matchEscapedJSX(): boolean {
    const start = this.position;

    // Add the opening bracket token first
    this.addToken('jsxBracket', this.position, this.position + 4);
    this.position += 4; // Skip &lt;

    // Skip whitespace after <
    this.skipWhitespace();

    // Check for closing tag
    let isClosing = false;
    if (this.code[this.position] === '/') {
      isClosing = true;
      this.addToken('jsxBracket', this.position, this.position + 1);
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
      this.addToken(tokenType, tagStart, this.position);

      // Match attributes (only for opening tags)
      if (!isClosing) {
        this.matchJSXAttributes();
      }

      // Skip whitespace
      this.skipWhitespace();

      // Handle self-closing tag
      if (this.code[this.position] === '/') {
        this.addToken('jsxBracket', this.position, this.position + 1);
        this.position++;
        this.skipWhitespace();
      }

      // Match closing &gt;
      if (this.code.slice(this.position, this.position + 4) === '&gt;') {
        this.addToken('jsxBracket', this.position, this.position + 4);
        this.position += 4;
      }

      return true;
    }

    // Reset position if we couldn't match a valid tag
    this.position = start;
    return false;
  }

  /**
   * Enhanced JSX attributes matching
   */
  public matchJSXAttributes(): void {
    while (this.position < this.code.length) {
      this.skipWhitespace();

      // Check for end of opening tag
      if (this.code[this.position] === '/' ||
        this.code.slice(this.position, this.position + 4) === '&gt;') {
        break;
      }

      // Match attribute name
      if (/[a-zA-Z]/.test(this.code[this.position])) {
        const attrStart = this.position;

        // Match attribute name (including data-* and aria-*)
        while (this.position < this.code.length && /[a-zA-Z0-9\-_]/.test(this.code[this.position])) {
          this.position++;
        }

        this.addToken('jsxAttribute', attrStart, this.position);

        this.skipWhitespace();

        // Check for = and attribute value
        if (this.code[this.position] === '=') {
          this.addToken('operator', this.position, this.position + 1);
          this.position++;
          this.skipWhitespace();

          // Match attribute value
          if (this.code[this.position] === '"' || this.code[this.position] === "'") {
            // String value - let base lexer handle it
            this.matchString();
          } else if (this.code[this.position] === '{') {
            // JSX expression
            this.matchJSXExpression();
          }
        }
      } else {
        break;
      }
    }
  }

  /**
   * Match JSX expressions {value}
   */
  public matchJSXExpression(): boolean {
    if (this.code[this.position] === '{') {
      // Add opening brace
      this.addToken('jsxBracket', this.position, this.position + 1);
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

      // Extract and tokenize the expression content as JavaScript
      if (this.position > exprStart) {
        const exprContent = this.code.slice(exprStart, this.position);
        const exprLexer = new Lexer(exprContent, { language: 'javascript' });
        const exprTokens = exprLexer.tokenize();

        // Adjust token positions and add them
        for (const token of exprTokens) {
          this.addToken(
            token.type,
            exprStart + token.start,
            exprStart + token.end
          );
        }
      }

      // Add closing brace
      if (this.code[this.position] === '}') {
        this.addToken('jsxBracket', this.position, this.position + 1);
        this.position++;
      }

      return true;
    }

    return false;
  }

  /**
   * Override identifier type detection for React patterns
   */
  getIdentifierType(value: any): "keyword" | "function" | "boolean" | "null" | "builtin" | "property" | "reactHook" | "className" | "identifier" {
    // Check for React hooks first
    if (typeof value === 'string' && /^use[A-Z]/.test(value)) {
      return 'reactHook';
    }

    // Check for React/JSX keywords
    const reactKeywords = [
      'React', 'Fragment', 'useState', 'useEffect', 'useContext', 'useReducer',
      'useCallback', 'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect',
      'useDebugValue', 'createPortal', 'render', 'hydrate', 'StrictMode',
      'Suspense', 'ErrorBoundary', 'createElement', 'cloneElement'
    ];

    if (typeof value === 'string' && reactKeywords.includes(value)) {
      return 'builtin';
    }

    // Check for component names (PascalCase) but only in certain contexts
    if (typeof value === 'string' && /^[A-Z][a-zA-Z0-9]*$/.test(value)) {
      const prevToken = (this as any).lastNonWhitespaceToken;
      if (prevToken && (
        prevToken.type === 'keyword' && ['const', 'let', 'var', 'function', 'class'].includes(prevToken.value) ||
        prevToken.value === '=' ||
        prevToken.value === 'return'
      )) {
        return 'className';
      }
    }

    return super.getIdentifierType(value);
  }
} 