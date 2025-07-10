// TypeScript version of JSX Parser - extends base parser with JSX support

import type { Token } from './lexer.js';
import { Parser } from './parser.js';

interface JSXParserOptions {
  language?: string;
  buildAST?: boolean;
  preserveComments?: boolean;
  [key: string]: unknown;
}

// Make JSXNode compatible with ASTNode by extending its structure
interface JSXNode {
  type: string;
  tagName?: string;
  attributes?: JSXAttribute[];
  children?: JSXNode[];
  tokens?: Token[];
  start?: number;
  end?: number;
  selfClosing?: boolean;
  // Add basic metadata without external dependency
  value?: string;
}

interface JSXAttribute {
  name: string;
  value?: string | Token[]; // More specific than any
  type: 'literal' | 'expression';
}

/**
 * JSX Parser - Extends base parser with JSX-specific parsing capabilities
 * Handles JSX elements, attributes, expressions, and React component patterns
 */
export class JSXParser extends Parser {
  private jsxStack: JSXNode[];
  private reactComponents: Set<string>;

  constructor(tokens: Token[], options: JSXParserOptions = {}) {
    super(tokens, { ...options, language: 'jsx' });
    this.jsxStack = [];
    this.reactComponents = new Set();
  }

  /**
   * Parse JSX elements and fragments
   */
  public parseJSX(): JSXNode[] {
    const elements: JSXNode[] = [];

    while (this.getPosition() < this.getTokens().length) {
      const element = this.parseJSXElementEnhanced();
      if (element) {
        elements.push(element);
      } else {
        // Skip non-JSX tokens
        break;
      }
    }

    return elements;
  }

  /**
   * Parse a single JSX element - enhanced version for JSX-specific parsing
   */
  public parseJSXElementEnhanced(): JSXNode | null {
    const tokens = this.getTokens();
    const position = this.getPosition();

    if (position >= tokens.length) return null;

    const token = tokens[position];

    // Check for JSX opening bracket
    if (token.type !== 'jsxBracket' || (token.value !== '<' && token.value !== '&lt;')) {
      return null;
    }

    const startToken = token;
    let currentPos = position + 1;

    // Skip whitespace
    while (currentPos < tokens.length && tokens[currentPos].type === 'whitespace') {
      currentPos++;
    }

    // Check for closing tag
    let isClosing = false;
    if (currentPos < tokens.length && tokens[currentPos].value === '/') {
      isClosing = true;
      currentPos++;
    }

    // Get tag name
    if (
      currentPos >= tokens.length ||
      (tokens[currentPos].type !== 'jsxTag' && tokens[currentPos].type !== 'reactComponent')
    ) {
      return null;
    }

    const tagToken = tokens[currentPos];
    const tagName = tagToken.value;
    const isComponent = tagToken.type === 'reactComponent';
    currentPos++;

    if (isComponent) {
      this.reactComponents.add(tagName);
    }

    const element: JSXNode = {
      type: 'jsxElement',
      tagName,
      attributes: [],
      children: [],
      tokens: [startToken, tagToken],
      start: startToken.start,
      selfClosing: false,
    };

    // Parse attributes (only for opening tags)
    if (!isClosing) {
      const { attributes, position: attrEndPos } = this.parseJSXAttributes(currentPos);
      element.attributes = attributes;
      currentPos = attrEndPos;
    }

    // Check for self-closing
    if (currentPos < tokens.length && tokens[currentPos].value === '/') {
      element.selfClosing = true;
      if (!element.tokens) element.tokens = [];
      element.tokens.push(tokens[currentPos]);
      currentPos++;
    }

    // Find closing bracket
    while (currentPos < tokens.length && tokens[currentPos].type !== 'jsxBracket') {
      currentPos++;
    }

    if (
      currentPos < tokens.length &&
      (tokens[currentPos].value === '>' || tokens[currentPos].value === '&gt;')
    ) {
      if (!element.tokens) element.tokens = [];
      element.tokens.push(tokens[currentPos]);
      element.end = tokens[currentPos].end;
      currentPos++;
    }

    // For self-closing tags, we're done
    if (element.selfClosing || isClosing) {
      return element;
    }

    // Parse children until we find the closing tag
    while (currentPos < tokens.length) {
      // Look for closing tag
      if (
        currentPos + 2 < tokens.length &&
        tokens[currentPos].type === 'jsxBracket' &&
        tokens[currentPos + 1].value === '/' &&
        tokens[currentPos + 2].value === tagName
      ) {
        // Found closing tag, add tokens and break
        if (!element.tokens) element.tokens = [];
        element.tokens.push(tokens[currentPos], tokens[currentPos + 1], tokens[currentPos + 2]);
        currentPos += 3;

        // Find closing bracket
        while (currentPos < tokens.length && tokens[currentPos].type !== 'jsxBracket') {
          currentPos++;
        }

        if (currentPos < tokens.length) {
          element.tokens.push(tokens[currentPos]);
          element.end = tokens[currentPos].end;
        }
        break;
      }

      // Parse child element or expression
      const child = this.parseJSXChild(currentPos);
      if (child) {
        if (!element.children) element.children = [];
        element.children.push(child.node);
        currentPos = child.position;
      } else {
        currentPos++;
      }
    }

    return element;
  }

  /**
   * Parse JSX attributes
   */
  private parseJSXAttributes(startPos: number): { attributes: JSXAttribute[]; position: number } {
    const tokens = this.getTokens();
    const attributes: JSXAttribute[] = [];
    let currentPos = startPos;

    while (currentPos < tokens.length) {
      // Skip whitespace
      while (currentPos < tokens.length && tokens[currentPos].type === 'whitespace') {
        currentPos++;
      }

      // Check for end of opening tag
      if (
        currentPos >= tokens.length ||
        tokens[currentPos].value === '>' ||
        tokens[currentPos].value === '&gt;' ||
        tokens[currentPos].value === '/'
      ) {
        break;
      }

      // Parse attribute name
      if (tokens[currentPos].type === 'jsxAttribute') {
        const name = tokens[currentPos].value;
        currentPos++;

        const attribute: JSXAttribute = {
          name,
          type: 'literal',
        };

        // Skip whitespace
        while (currentPos < tokens.length && tokens[currentPos].type === 'whitespace') {
          currentPos++;
        }

        // Check for attribute value
        if (currentPos < tokens.length && tokens[currentPos].value === '=') {
          currentPos++; // Skip '='

          // Skip whitespace
          while (currentPos < tokens.length && tokens[currentPos].type === 'whitespace') {
            currentPos++;
          }

          // Parse attribute value
          if (currentPos < tokens.length) {
            const valueToken = tokens[currentPos];

            if (valueToken.type === 'string') {
              attribute.value = valueToken.value;
              attribute.type = 'literal';
              currentPos++;
            } else if (valueToken.type === 'jsxBracket' && valueToken.value === '{') {
              // JSX expression
              const expr = this.parseJSXExpression(currentPos);
              if (expr) {
                attribute.value = expr.tokens;
                attribute.type = 'expression';
                currentPos = expr.position;
              }
            }
          }
        }

        attributes.push(attribute);
      } else {
        break;
      }
    }

    return { attributes, position: currentPos };
  }

  /**
   * Parse JSX expressions
   */
  private parseJSXExpression(startPos: number): { tokens: Token[]; position: number } | null {
    const tokens = this.getTokens();
    let currentPos = startPos;

    if (
      currentPos >= tokens.length ||
      tokens[currentPos].type !== 'jsxBracket' ||
      tokens[currentPos].value !== '{'
    ) {
      return null;
    }

    const exprTokens: Token[] = [tokens[currentPos]];
    currentPos++;

    let braceCount = 1;
    while (currentPos < tokens.length && braceCount > 0) {
      const token = tokens[currentPos];
      exprTokens.push(token);

      if (token.type === 'jsxBracket') {
        if (token.value === '{') {
          braceCount++;
        } else if (token.value === '}') {
          braceCount--;
        }
      }

      currentPos++;
    }

    return { tokens: exprTokens, position: currentPos };
  }

  /**
   * Parse JSX child (element, text, or expression)
   */
  private parseJSXChild(startPos: number): { node: JSXNode; position: number } | null {
    const tokens = this.getTokens();
    let currentPos = startPos;

    if (currentPos >= tokens.length) return null;

    const token = tokens[currentPos];

    // JSX element
    if (token.type === 'jsxBracket' && (token.value === '<' || token.value === '&lt;')) {
      const element = this.parseJSXElementEnhanced();
      if (element) {
        return {
          node: element,
          position: currentPos + (element.tokens?.length || 1),
        };
      }
    }

    // JSX expression
    if (token.type === 'jsxBracket' && token.value === '{') {
      const expr = this.parseJSXExpression(currentPos);
      if (expr) {
        return {
          node: {
            type: 'jsxExpression',
            tokens: expr.tokens,
            start: expr.tokens[0].start,
            end: expr.tokens[expr.tokens.length - 1].end,
          },
          position: expr.position,
        };
      }
    }

    // Text content
    const textTokens: Token[] = [];
    while (currentPos < tokens.length) {
      const t = tokens[currentPos];

      // Stop at JSX boundaries
      if (t.type === 'jsxBracket') break;

      textTokens.push(t);
      currentPos++;
    }

    if (textTokens.length > 0) {
      return {
        node: {
          type: 'jsxText',
          tokens: textTokens,
          start: textTokens[0].start,
          end: textTokens[textTokens.length - 1].end,
        },
        position: currentPos,
      };
    }

    return null;
  }

  // Public API methods
  public getReactComponents(): Set<string> {
    return new Set(this.reactComponents);
  }

  public getJSXStack(): JSXNode[] {
    return [...this.jsxStack];
  }

  public isInJSX(): boolean {
    return this.jsxStack.length > 0;
  }
}
