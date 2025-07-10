// TypeScript version of JSX Lexer - extends base lexer with JSX support
import { Lexer } from './lexer.js';

interface JSXLexerOptions {
  language?: string;
  [key: string]: unknown;
}

/**
 * JSX Lexer - Extends base lexer with JSX-specific tokenization
 */
export class JSXLexer extends Lexer {
  constructor(code: string, options: JSXLexerOptions = {}) {
    super(code, { ...options, language: options.language || 'jsx' });
  }

  /**
   * Override to add JSX-specific matching
   */
  matchLanguageSpecific(): boolean {
    // Check for JSX comment syntax {/* ... */}
    if (this.code.slice(this.position, this.position + 3) === '{/*') {
      return this.matchJSXComment();
    }

    // Check for JSX expressions {expression}
    if (this.code[this.position] === '{') {
      return this.matchJSXExpression();
    }

    // Check for JSX tags with escaped HTML entities
    if (this.code.slice(this.position, this.position + 4) === '&lt;') {
      return this.matchJSX();
    }

    // Check for regular JSX tags
    if (this.code[this.position] === '<') {
      return this.matchRegularJSX();
    }

    return false;
  }

  /**
   * Match regular JSX syntax (<div>, </div>, <Component />)
   */
  public matchRegularJSX(): boolean {
    const start = this.position;

    // Handle React fragments <>
    if (this.code.slice(this.position, this.position + 2) === '<>') {
      this.addToken('jsxFragment', this.position, this.position + 2);
      this.position += 2;
      return true;
    }

    // Handle React fragment closing </>
    if (this.code.slice(this.position, this.position + 3) === '</>') {
      this.addToken('jsxFragment', this.position, this.position + 3);
      this.position += 3;
      return true;
    }

    // Add the opening bracket token first
    this.addToken('jsxBracket', this.position, this.position + 1);
    this.position++; // Skip <

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
      while (this.position < this.code.length && /[a-zA-Z0-9.-]/.test(this.code[this.position])) {
        this.position++;
      }

      const tagName = this.code.slice(tagStart, this.position);

      // Determine if this is a React component or DOM element
      const isReactComponent = /^[A-Z]/.test(tagName);
      const isFragment = tagName === 'React.Fragment' || tagName === 'Fragment';

      let tokenType: string;
      let metadata: Record<string, unknown> = {};

      if (isFragment) {
        tokenType = 'jsxTag';
        metadata = { isFragment: true };
      } else if (isReactComponent) {
        tokenType = 'jsxTag';
        metadata = { isReactComponent: true };
      } else {
        tokenType = 'jsxTag';
        metadata = { isReactComponent: false };
      }

      this.addToken(tokenType, tagStart, this.position, undefined, metadata);

      // Match attributes (only for opening tags)
      if (!isClosing) {
        this.matchRegularJSXAttributes();
      }

      // Skip whitespace
      this.skipWhitespace();

      // Handle self-closing tag
      if (this.code[this.position] === '/') {
        this.addToken('jsxBracket', this.position, this.position + 1);
        this.position++;
        this.skipWhitespace();
      }

      // Match closing >
      if (this.code[this.position] === '>') {
        this.addToken('jsxBracket', this.position, this.position + 1);
        this.position++;
      }

      return true;
    }

    // Reset position if we couldn't match a valid tag
    this.position = start;
    return false;
  }

  /**
   * Match regular JSX attributes
   */
  public matchRegularJSXAttributes(): void {
    while (this.position < this.code.length) {
      this.skipWhitespace();

      // Check for end of opening tag
      if (this.code[this.position] === '/' || this.code[this.position] === '>') {
        break;
      }

      // Handle spread attributes {...props}
      if (this.code.slice(this.position, this.position + 3) === '...') {
        const spreadStart = this.position;
        this.position += 3;

        // Match the expression - could be simple identifier or complex expression
        if (this.code[this.position] === '(') {
          // Handle parenthesized expressions like ...(condition && props)
          let parenCount = 1;
          this.position++; // skip opening paren

          while (this.position < this.code.length && parenCount > 0) {
            if (this.code[this.position] === '(') parenCount++;
            else if (this.code[this.position] === ')') parenCount--;
            this.position++;
          }
        } else {
          // Handle simple identifiers or function calls like getProps()
          while (this.position < this.code.length) {
            if (/[a-zA-Z0-9_$]/.test(this.code[this.position])) {
              this.position++;
            } else if (
              this.code[this.position] === '.' &&
              this.position + 1 < this.code.length &&
              /[a-zA-Z]/.test(this.code[this.position + 1])
            ) {
              // Handle property access like obj.prop
              this.position++;
            } else if (this.code[this.position] === '(') {
              // Handle function calls like getProps()
              let parenCount = 1;
              this.position++; // skip opening paren

              while (this.position < this.code.length && parenCount > 0) {
                if (this.code[this.position] === '(') parenCount++;
                else if (this.code[this.position] === ')') parenCount--;
                this.position++;
              }
            } else {
              break;
            }
          }
        }

        this.addToken('jsxSpread', spreadStart, this.position);
        continue;
      }

      // Handle JSX expressions (like {...props}) without attribute name
      if (this.code[this.position] === '{') {
        // JSX expression - could be spread or regular expression
        this.matchJSXExpression();
        continue;
      }

      // Match attribute name
      if (/[a-zA-Z]/.test(this.code[this.position])) {
        const attrStart = this.position;

        // Match attribute name (including data-* and aria-*)
        while (
          this.position < this.code.length &&
          /[a-zA-Z0-9\-_]/.test(this.code[this.position])
        ) {
          this.position++;
        }

        const attrName = this.code.slice(attrStart, this.position);
        const isEventHandler = /^on[A-Z]/.test(attrName);

        const metadata = isEventHandler ? { isEventHandler: true } : undefined;
        this.addToken('jsxAttribute', attrStart, this.position, undefined, metadata);

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
            // JSX expression - could be spread or regular expression
            this.matchJSXExpression();
          }
        }
      } else {
        break;
      }
    }
  }

  /**
   * Match JSX comments
   */
  public matchJSXComment(): boolean {
    if (this.code.slice(this.position, this.position + 3) === '{/*') {
      const start = this.position;

      // Find the end of the JSX comment
      const end = this.code.indexOf('*/}', start + 3);
      if (end !== -1) {
        const fullEnd = end + 3;
        this.addToken('jsxComment', start, fullEnd);
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
      while (this.position < this.code.length && /[a-zA-Z0-9.-]/.test(this.code[this.position])) {
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
      if (
        this.code[this.position] === '/' ||
        this.code.slice(this.position, this.position + 4) === '&gt;'
      ) {
        break;
      }

      // Match attribute name
      if (/[a-zA-Z]/.test(this.code[this.position])) {
        const attrStart = this.position;

        // Match attribute name (including data-* and aria-*)
        while (
          this.position < this.code.length &&
          /[a-zA-Z0-9\-_]/.test(this.code[this.position])
        ) {
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
      const start = this.position;

      // Add opening brace
      this.addToken('jsxBracket', this.position, this.position + 1);
      this.position++;

      // Check for spread syntax immediately after opening brace
      this.skipWhitespace();
      if (this.code.slice(this.position, this.position + 3) === '...') {
        // Handle spread syntax within JSX expression
        const spreadStart = this.position;
        this.position += 3;

        // Match the expression after spread
        if (this.code[this.position] === '(') {
          // Handle parenthesized expressions like ...(condition && props)
          let parenCount = 1;
          this.position++; // skip opening paren

          while (this.position < this.code.length && parenCount > 0) {
            if (this.code[this.position] === '(') parenCount++;
            else if (this.code[this.position] === ')') parenCount--;
            this.position++;
          }
        } else {
          // Handle simple identifiers or function calls like getProps()
          while (this.position < this.code.length) {
            if (/[a-zA-Z0-9_$]/.test(this.code[this.position])) {
              this.position++;
            } else if (
              this.code[this.position] === '.' &&
              this.position + 1 < this.code.length &&
              /[a-zA-Z]/.test(this.code[this.position + 1])
            ) {
              // Handle property access like obj.prop
              this.position++;
            } else if (this.code[this.position] === '(') {
              // Handle function calls like getProps()
              let parenCount = 1;
              this.position++; // skip opening paren

              while (this.position < this.code.length && parenCount > 0) {
                if (this.code[this.position] === '(') parenCount++;
                else if (this.code[this.position] === ')') parenCount--;
                this.position++;
              }
            } else {
              break;
            }
          }
        }

        // Add the spread token
        this.addToken('jsxSpread', spreadStart, this.position);

        // Skip whitespace
        this.skipWhitespace();

        // Match closing brace
        if (this.code[this.position] === '}') {
          this.addToken('jsxBracket', this.position, this.position + 1);
          this.position++;
        }

        return true;
      }

      // Handle regular JSX expressions (non-spread)
      let braceCount = 1;

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

      // Create a single JSX expression token for the entire content
      if (this.code[this.position] === '}') {
        this.addToken('jsxExpression', start, this.position + 1);
        this.addToken('jsxBracket', this.position, this.position + 1);
        this.position++;
      }

      return true;
    }

    return false;
  }

  /**
   * Override addToken to include metadata support
   */
  protected addToken(
    type: string,
    start: number,
    end: number,
    value?: string,
    metadata?: Record<string, unknown>
  ): void {
    const tokenValue = value || this.code.slice(start, end);
    const token = {
      type,
      value: tokenValue,
      start,
      end,
      metadata: metadata || undefined,
    };
    this.tokens.push(token);
  }

  /**
   * Override tokenize method to handle React hooks with metadata
   */
  tokenize() {
    const tokens = super.tokenize();

    // Post-process tokens to add metadata for React hooks
    for (const token of tokens) {
      if (token.type === 'reactHook') {
        token.metadata = { isHook: true };
      }
    }

    return tokens;
  }

  /**
   * Override identifier type detection for React patterns
   */
  getIdentifierType(
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
    // Check for Actor-SPA framework APIs first
    if (typeof value === 'string') {
      // New controller-based APIs
      if (/^create[A-Z][a-zA-Z]*Controller$/.test(value)) {
        const controllerPatterns = [
          'createActorController',
          'createStateController',
          'createEventController',
          'createLifecycleController',
          'createServiceController',
          'createFormController',
          'createRouterController',
          'createAnimationController',
        ];

        if (controllerPatterns.includes(value)) {
          return 'builtin';
        }
      }

      // Core framework APIs
      const coreApis = [
        'createComponent',
        'createActor',
        'createTestableComponent',
        'fromLegacyActor',
        'renderToString',
      ];

      if (coreApis.includes(value)) {
        return 'builtin';
      }
    }

    // Check for Actor-SPA framework keywords only
    const frameworkKeywords = [
      // Controller-based architecture
      'createActorController',
      'createStateController',
      'createEventController',
      'createLifecycleController',
      'createServiceController',
      'createFormController',
      'createRouterController',
      'createAnimationController',
      // Core framework APIs
      'createComponent',
      'createActor',
      'createTestableComponent',
      'fromLegacyActor',
      'renderToString',
      // Framework components and utilities
      'ReactiveComponent',
      'ReactiveEventBus',
      'AriaObserver',
      'html',
      'template',
      'send',
      'actor',
      'machine',
      'state',
      'snapshot',
      'createMachine',
      'assign',
      'interpret',
      'spawn',
    ];

    if (typeof value === 'string' && frameworkKeywords.includes(value)) {
      return 'builtin';
    }

    // Check for component names (PascalCase) in Actor-SPA contexts
    if (typeof value === 'string' && /^[A-Z][a-zA-Z0-9]*$/.test(value)) {
      // For Actor-SPA components, assume PascalCase identifiers are className
      // This is a reasonable assumption for template context
      return 'className';
    }

    // Check for JavaScript keywords
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

    if (typeof value === 'string' && keywords.includes(value)) {
      return 'keyword';
    }

    // Fall back to parent class identifier type detection
    return super.getIdentifierType(value);
  }
}
