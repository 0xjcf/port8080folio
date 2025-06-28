import { Parser } from './parser.js';

/**
 * JSX Parser - Extends base parser with JSX-specific parsing
 */
export class JSXParser extends Parser {
  constructor(tokens, options = {}) {
    super(tokens, { ...options, language: 'jsx' });
  }

  /**
   * Override parseStatement to handle JSX elements
   */
  parseStatement() {
    const token = this.currentToken();
    if (!token) return null;

    // Check for JSX elements
    if (token.type === 'jsxBracket' && token.value === '&lt;') {
      return this.parseJSXElement();
    }

    // Check for JSX fragments
    if (this.isJSXFragment()) {
      return this.parseJSXFragment();
    }

    return super.parseStatement();
  }

  /**
   * Override parseExpression to handle JSX
   */
  parseExpression() {
    // Check if this is a JSX expression
    if (this.peek()?.type === 'jsxBracket') {
      return this.parseJSXElement();
    }

    return super.parseExpression();
  }

  /**
   * Parse JSX element
   */
  parseJSXElement() {
    const openBracket = this.consume('jsxBracket', '&lt;');
    
    // Check for closing tag
    if (this.peek()?.value === '/') {
      return this.parseJSXClosingElement(openBracket);
    }
    
    // Parse tag name
    const tagName = this.parseJSXTagName();
    
    // Parse attributes
    const attributes = this.parseJSXAttributes();
    
    // Check for self-closing
    let selfClosing = false;
    if (this.peek()?.value === '/') {
      this.consume('jsxBracket', '/');
      selfClosing = true;
    }
    
    const closeBracket = this.consume('jsxBracket', '&gt;');
    
    let children = [];
    let closingElement = null;
    
    if (!selfClosing) {
      // Parse children
      children = this.parseJSXChildren(tagName);
      
      // Parse closing tag
      closingElement = this.parseJSXClosingElement();
    }
    
    return {
      type: 'jsxElement',
      tagName,
      attributes,
      children,
      selfClosing,
      start: openBracket.start,
      end: closingElement ? closingElement.end : closeBracket.end
    };
  }

  /**
   * Parse JSX tag name
   */
  parseJSXTagName() {
    const token = this.peek();
    
    if (token?.type === 'jsxTag') {
      return this.consume('jsxTag').value;
    } else if (token?.type === 'reactComponent') {
      return this.consume('reactComponent').value;
    } else if (token?.type === 'identifier') {
      // Sometimes components are marked as identifiers
      return this.consume('identifier').value;
    }
    
    throw new Error(`Expected JSX tag name but got ${token?.type}`);
  }

  /**
   * Parse JSX attributes
   */
  parseJSXAttributes() {
    const attributes = [];
    
    while (this.peek() && 
           this.peek().type !== 'jsxBracket' &&
           this.peek().value !== '/' &&
           this.peek().value !== '&gt;') {
      
      const attr = this.parseJSXAttribute();
      if (attr) {
        attributes.push(attr);
      }
    }
    
    return attributes;
  }

  /**
   * Parse single JSX attribute
   */
  parseJSXAttribute() {
    const name = this.peek();
    
    if (name?.type === 'jsxAttribute' || name?.type === 'identifier') {
      const attrName = this.consume();
      
      // Check for value
      if (this.peek()?.value === '=') {
        this.advance(); // consume '='
        
        const value = this.parseJSXAttributeValue();
        
        return {
          type: 'jsxAttribute',
          name: attrName.value,
          value
        };
      }
      
      // Boolean attribute
      return {
        type: 'jsxAttribute',
        name: attrName.value,
        value: true
      };
    }
    
    // Skip unknown tokens
    this.advance();
    return null;
  }

  /**
   * Parse JSX attribute value
   */
  parseJSXAttributeValue() {
    const token = this.peek();
    
    if (token?.type === 'string') {
      return {
        type: 'literal',
        value: this.consume('string').value
      };
    } else if (token?.value === '{') {
      // JSX expression
      return this.parseJSXExpression();
    }
    
    // Other literals
    return {
      type: 'literal',
      value: this.consume().value
    };
  }

  /**
   * Parse JSX expression {}
   */
  parseJSXExpression() {
    const start = this.consume('punctuation', '{');
    const tokens = [];
    let braceCount = 1;
    
    while (this.position < this.tokens.length && braceCount > 0) {
      const token = this.peek();
      
      if (token.value === '{') {
        braceCount++;
      } else if (token.value === '}') {
        braceCount--;
        if (braceCount === 0) {
          break;
        }
      }
      
      tokens.push(this.consume());
    }
    
    const end = this.consume('punctuation', '}');
    
    return {
      type: 'jsxExpression',
      expression: {
        type: 'expression',
        tokens
      },
      start: start.start,
      end: end.end
    };
  }

  /**
   * Parse JSX children
   */
  parseJSXChildren(parentTagName) {
    const children = [];
    
    while (this.position < this.tokens.length) {
      // Check for closing tag
      if (this.isClosingTag(parentTagName)) {
        break;
      }
      
      const child = this.parseJSXChild();
      if (child) {
        children.push(child);
      }
    }
    
    return children;
  }

  /**
   * Parse single JSX child
   */
  parseJSXChild() {
    const token = this.peek();
    
    if (!token) return null;
    
    // JSX element
    if (token.type === 'jsxBracket' && token.value === '&lt;') {
      return this.parseJSXElement();
    }
    
    // JSX expression
    if (token.value === '{') {
      return this.parseJSXExpression();
    }
    
    // Text content - collect consecutive non-JSX tokens
    const textTokens = [];
    while (this.peek() && 
           this.peek().type !== 'jsxBracket' && 
           this.peek().value !== '{' &&
           !this.isClosingTag()) {
      textTokens.push(this.consume());
    }
    
    if (textTokens.length > 0) {
      return {
        type: 'jsxText',
        value: textTokens.map(t => t.value).join(''),
        tokens: textTokens
      };
    }
    
    return null;
  }

  /**
   * Parse JSX closing element
   */
  parseJSXClosingElement(openBracket = null) {
    const start = openBracket || this.consume('jsxBracket', '&lt;');
    this.consume('jsxBracket', '/');
    const tagName = this.parseJSXTagName();
    const end = this.consume('jsxBracket', '&gt;');
    
    return {
      type: 'jsxClosingElement',
      tagName,
      start: start.start,
      end: end.end
    };
  }

  /**
   * Parse JSX fragment
   */
  parseJSXFragment() {
    const start = this.consume('jsxBracket', '&lt;');
    
    // Check for long form <React.Fragment>
    if (this.peek()?.value === 'React' || this.peek()?.value === 'Fragment') {
      return this.parseJSXElement();
    }
    
    // Short form <>
    this.consume('jsxBracket', '&gt;');
    
    const children = this.parseJSXChildren();
    
    // Closing </> 
    this.consume('jsxBracket', '&lt;');
    this.consume('jsxBracket', '/');
    const end = this.consume('jsxBracket', '&gt;');
    
    return {
      type: 'jsxFragment',
      children,
      start: start.start,
      end: end.end
    };
  }

  /**
   * Check if current position is a JSX fragment
   */
  isJSXFragment() {
    if (this.peek()?.type !== 'jsxBracket' || this.peek()?.value !== '&lt;') {
      return false;
    }
    
    const next = this.peek(1);
    return next?.value === '&gt;' || 
           next?.value === 'React' || 
           next?.value === 'Fragment';
  }

  /**
   * Check if current position is a closing tag
   */
  isClosingTag(tagName = null) {
    if (this.peek()?.type !== 'jsxBracket' || this.peek()?.value !== '&lt;') {
      return false;
    }
    
    if (this.peek(1)?.value !== '/') {
      return false;
    }
    
    if (tagName) {
      // Check if it matches the expected tag name
      const nameToken = this.peek(2);
      return nameToken?.value === tagName;
    }
    
    return true;
  }

  /**
   * Override parseReturnStatement to handle JSX returns
   */
  parseReturnStatement() {
    const returnKeyword = this.consume('keyword', 'return');
    let value = null;
    
    // Skip whitespace/newlines
    while (this.peek()?.type === 'whitespace') {
      this.advance();
    }
    
    // Check for JSX
    if (this.peek()?.type === 'jsxBracket' || this.peek()?.value === '(') {
      if (this.peek()?.value === '(') {
        this.advance(); // consume '('
        
        // Skip whitespace
        while (this.peek()?.type === 'whitespace') {
          this.advance();
        }
        
        if (this.peek()?.type === 'jsxBracket') {
          value = this.parseJSXElement();
        } else {
          value = this.parseExpression();
        }
        
        if (this.peek()?.value === ')') {
          this.advance(); // consume ')'
        }
      } else {
        value = this.parseJSXElement();
      }
    } else if (this.peek() && this.peek().value !== ';') {
      value = this.parseExpression();
    }
    
    return {
      type: 'returnStatement',
      value,
      start: returnKeyword.start,
      end: this.position > 0 ? this.tokens[this.position - 1].end : returnKeyword.end
    };
  }
}