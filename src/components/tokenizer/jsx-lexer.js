import { Lexer } from './lexer.js';

/**
 * JSX Lexer - Extends base lexer with JSX-specific tokenization
 */
export class JSXLexer extends Lexer {
  constructor(code, options = {}) {
    super(code, { ...options, language: 'jsx' });
  }

  /**
   * Override to add JSX-specific matching
   */
  matchLanguageSpecific() {
    // Check for JSX elements
    if (this.matchJSX()) return true;
    
    // Check for React-specific identifiers
    if (this.matchReactComponent()) return true;
    
    return false;
  }

  /**
   * Match JSX elements
   */
  matchJSX() {
    // Check for escaped < (&lt;)
    if (this.code.slice(this.position, this.position + 4) !== '&lt;') {
      return false;
    }

    const afterLt = this.position + 4;
    
    // Skip whitespace after <
    let pos = afterLt;
    while (pos < this.code.length && /\s/.test(this.code[pos])) {
      pos++;
    }
    
    // Check what comes after <
    const nextChar = this.code[pos];
    
    // Check for closing tag (</), self-closing (/>) or opening tag
    if (nextChar === '/' || /[a-zA-Z]/.test(nextChar) || nextChar === '&' || nextChar === '>') {
      // Add opening bracket
      this.addToken('jsxBracket', this.position, this.position + 4, '&lt;');
      this.position = afterLt;
      
      // Handle closing tag slash
      if (this.code[this.position] === '/') {
        this.addToken('jsxBracket', this.position, this.position + 1, '/');
        this.position++;
      }
      
      // Skip whitespace
      while (this.position < this.code.length && /\s/.test(this.code[this.position])) {
        this.position++;
      }
      
      // Match tag name (including React.Fragment)
      if (/[a-zA-Z]/.test(this.code[this.position])) {
        const tagStart = this.position;
        
        // Match tag name with dots (for React.Fragment)
        while (this.position < this.code.length && /[a-zA-Z0-9.]/.test(this.code[this.position])) {
          this.position++;
        }
        
        this.addToken('jsxTag', tagStart, this.position);
        
        // Match attributes
        this.matchJSXAttributes();
      }
      
      // Match closing >
      this.skipWhitespace();
      
      // Handle self-closing />
      if (this.code[this.position] === '/') {
        this.addToken('jsxBracket', this.position, this.position + 1, '/');
        this.position++;
        this.skipWhitespace();
      }
      
      // Match > or &gt;
      if (this.code.slice(this.position, this.position + 4) === '&gt;') {
        this.addToken('jsxBracket', this.position, this.position + 4, '&gt;');
        this.position += 4;
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Match JSX attributes
   */
  matchJSXAttributes() {
    while (this.position < this.code.length) {
      this.skipWhitespace();
      
      // Check for end of tag
      if (this.code[this.position] === '/' || 
          this.code[this.position] === '>' ||
          this.code.slice(this.position, this.position + 4) === '&gt;') {
        break;
      }
      
      // Match attribute name
      if (/[a-zA-Z]/.test(this.code[this.position])) {
        const attrStart = this.position;
        
        while (this.position < this.code.length && /[a-zA-Z0-9-]/.test(this.code[this.position])) {
          this.position++;
        }
        
        this.addToken('jsxAttribute', attrStart, this.position);
        
        // Skip whitespace
        this.skipWhitespace();
        
        // Check for = and attribute value
        if (this.code[this.position] === '=') {
          this.position++; // Skip =
          this.skipWhitespace();
          
          // Match attribute value (string, expression, etc.)
          if (this.code[this.position] === '"' || this.code[this.position] === "'") {
            // String value - let regular string matcher handle it
            const savedPos = this.position;
            if (this.matchString()) {
              // Successfully matched string
              continue;
            }
            this.position = savedPos;
          } else if (this.code[this.position] === '{') {
            // JSX expression - skip it for now
            let braceCount = 1;
            this.position++;
            
            while (this.position < this.code.length && braceCount > 0) {
              if (this.code[this.position] === '{') braceCount++;
              else if (this.code[this.position] === '}') braceCount--;
              this.position++;
            }
          }
        }
      } else {
        // Unknown character, break
        break;
      }
    }
  }

  /**
   * Match React component names
   */
  matchReactComponent() {
    // Check if current position could be a React component
    if (this.position > 0 && /[A-Z]/.test(this.code[this.position])) {
      // Look back to see if this is likely a component
      const prevToken = this.tokens[this.tokens.length - 1];
      
      // Common patterns before components: <Component, const Component, class Component
      if (prevToken && (
        prevToken.type === 'jsxBracket' || 
        prevToken.type === 'keyword' && ['const', 'let', 'var', 'class', 'function'].includes(prevToken.value)
      )) {
        const start = this.position;
        
        while (this.position < this.code.length && /[a-zA-Z0-9_$]/.test(this.code[this.position])) {
          this.position++;
        }
        
        this.addToken('reactComponent', start, this.position);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Override identifier type detection to recognize React hooks
   */
  getIdentifierType(value) {
    // Check for React hooks
    if (value.startsWith('use') && value.length > 3 && /[A-Z]/.test(value[3])) {
      return 'reactHook';
    }
    
    // Check for React/JSX keywords
    const reactKeywords = ['React', 'Fragment', 'useState', 'useEffect', 'useContext', 'useReducer',
                          'useCallback', 'useMemo', 'useRef', 'useImperativeHandle', 'useLayoutEffect',
                          'useDebugValue', 'createPortal', 'render', 'hydrate'];
    
    if (reactKeywords.includes(value)) {
      return 'reactKeyword';
    }
    
    return super.getIdentifierType(value);
  }
}