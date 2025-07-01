/**
 * Renderer - Takes parsed AST/tokens and generates highlighted HTML
 * Handles styling, theming, and output generation
 */
export class Renderer {
  constructor(options = {}) {
    this.options = options;
    this.theme = options.theme || 'default';
    this.language = options.language || 'javascript';
    this.highlightMode = options.highlightMode || 'default';
    this.highlightSection = options.highlightSection || '';
    this.output = [];
  }

  /**
   * Render tokens to highlighted HTML
   */
  renderTokens(tokens, originalCode) {
    this.output = [];
    let lastEnd = 0;

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Add any unprocessed text (whitespace, etc.) between tokens
      if (token.start > lastEnd) {
        this.output.push(this.escapeHtml(originalCode.slice(lastEnd, token.start)));
      }

      this.renderToken(token, i, tokens);
      lastEnd = token.end;
    }

    // Add any remaining text after the last token
    if (lastEnd < originalCode.length) {
      this.output.push(this.escapeHtml(originalCode.slice(lastEnd)));
    }

    return this.output.join('');
  }

  /**
   * Render AST to highlighted HTML
   */
  renderAST(ast) {
    this.output = [];

    for (const node of ast) {
      this.renderNode(node);
    }

    return this.output.join('');
  }

  /**
   * Render a single token
   */
  renderToken(token, index, allTokens) {
    const cssClass = this.getTokenClass(token);
    const style = this.getTokenStyle(token);

    // Special handling for JSX brackets - they should display as HTML entities
    let value;
    if (token.type === 'jsxBracket') {
      // Convert back to HTML entities for display
      value = token.value
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    } else {
      value = this.escapeHtml(token.value);
    }

    // Apply token-specific enhancements
    value = this.enhanceTokenValue(token, value);

    if (cssClass || style) {
      // Add data attributes for enhanced styling
      const dataAttrs = this.getDataAttributes(token);
      this.output.push(`<span class="${cssClass}" style="${style}"${dataAttrs}>${value}</span>`);
    } else {
      this.output.push(value);
    }
  }

  /**
   * Enhance token value with additional markup
   */
  enhanceTokenValue(token, value) {
    // Add special styling for certain patterns
    if (token.type === 'comment') {
      // Highlight TODO, FIXME, etc.
      if (token.subType === 'annotation') {
        value = value.replace(
          /(TODO|FIXME|HACK|NOTE|WARNING)(:?\s*)/,
          '<strong class="comment-annotation">$1</strong>$2'
        );
      }
      // Style JSDoc tags
      if (token.subType === 'jsdoc') {
        value = value.replace(
          /(@\w+)/g,
          '<span class="jsdoc-tag">$1</span>'
        );
      }
    }

    return value;
  }

  /**
   * Get data attributes for enhanced styling
   */
  getDataAttributes(token) {
    const attrs = [];

    if (token.subType) {
      attrs.push(`data-subtype="${token.subType}"`);
    }

    if (token.type === 'identifier' && token.subType === 'functionCall') {
      attrs.push('data-function-call="true"');
    }

    if (token.type === 'operator' && token.subType === 'arrow') {
      attrs.push('data-arrow="true"');
    }

    return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  }

  /**
   * Render an AST node
   */
  renderNode(node) {
    switch (node.type) {
      case 'comment':
        this.renderComment(node);
        break;
      case 'functionDeclaration':
        this.renderFunctionDeclaration(node);
        break;
      case 'classDeclaration':
        this.renderClassDeclaration(node);
        break;
      case 'variableDeclaration':
        this.renderVariableDeclaration(node);
        break;
      case 'jsxElement':
        this.renderJSXElement(node);
        break;
      case 'jsxFragment':
        this.renderJSXFragment(node);
        break;
      case 'templateLiteral':
        this.renderTemplateLiteral(node);
        break;
      default:
        // For simple nodes, render their tokens
        if (node.tokens) {
          for (const token of node.tokens) {
            this.renderToken(token);
          }
        } else if (node.value) {
          this.output.push(this.escapeHtml(node.value));
        }
    }
  }

  /**
   * Get CSS class for token
   */
  getTokenClass(token) {
    const baseClass = this.getBaseTokenClass(token);
    const sectionClass = this.getSectionClass(token);
    const modifierClasses = this.getModifierClasses(token);

    return [baseClass, sectionClass, ...modifierClasses].filter(Boolean).join(' ');
  }

  /**
   * Get base CSS class for token type
   */
  getBaseTokenClass(token) {
    const type = typeof token === 'string' ? token : token.type;
    const classMap = {
      // Basic types
      'keyword': 'keyword',
      'string': 'string',
      'number': 'number',
      'comment': 'comment',
      'identifier': 'variable',
      'function': 'function',
      'className': 'class-name',
      'operator': 'operator',
      'punctuation': 'punctuation',
      'boolean': 'boolean',
      'null': 'null',
      'regex': 'regex',
      'templateLiteral': 'template-literal',
      'builtin': 'builtin',
      'property': 'property',

      // JSX types
      'jsxTag': 'jsx-tag',
      'jsxBracket': 'jsx-bracket',
      'jsxAttribute': 'jsx-attribute',
      'jsxExpression': 'jsx-expression',

      // React types
      'reactComponent': 'react-component',
      'reactHook': 'react-hook',
      'reactKeyword': 'react-keyword',

      // XState types
      'xstateKeyword': 'xstate-keyword',
      'xstateAction': 'xstate-action',
      'xstateGuard': 'xstate-guard',
      'xstateProperty': 'xstate-property',
      'contextProperty': 'context-property',
      'eventProperty': 'event-property',
      'stateName': 'state-name',
      'eventName': 'event-name',
      'serviceName': 'service-name',
      'actorName': 'actor-name'
    };

    return classMap[type] || 'default';
  }

  /**
   * Get modifier classes based on token properties
   */
  getModifierClasses(token) {
    const classes = [];

    // Add subtype classes
    if (token.subType) {
      classes.push(`${token.type}-${token.subType}`);
    }

    // Add context-based classes
    if (token.type === 'string' && token.parent?.type === 'stateName') {
      classes.push('state-target');
    }

    return classes;
  }

  /**
   * Get section-specific class
   */
  getSectionClass(token) {
    if (this.highlightMode === 'section' && this.highlightSection) {
      // Check if token is within the highlight section
      // This would need the full context of section positions
      // For now, return null
      return null;
    }
    return null;
  }

  /**
   * Get inline style for token
   */
  getTokenStyle(token) {
    const varName = this.getCSSVariable(token.type);
    if (varName) {
      return `color: var(${varName})`;
    }
    return '';
  }

  /**
   * Get CSS variable name for token type
   */
  getCSSVariable(type) {
    const varMap = {
      // Basic types
      'keyword': '--keyword',
      'string': '--string',
      'number': '--number',
      'comment': '--comment',
      'identifier': '--variable',
      'function': '--function',
      'className': '--class-name',
      'operator': '--operator',
      'punctuation': '--punctuation',
      'boolean': '--boolean',
      'null': '--null',
      'regex': '--regex',
      'templateLiteral': '--string',
      'builtin': '--builtin',
      'property': '--property',

      // JSX types
      'jsxTag': '--jsx-tag',
      'jsxBracket': '--jsx-bracket',
      'jsxAttribute': '--jsx-attribute',
      'jsxExpression': '--jsx-expression',

      // React types
      'reactComponent': '--react-component',
      'reactHook': '--react-hook',
      'reactKeyword': '--react-keyword',

      // XState types
      'xstateKeyword': '--xstate-keyword',
      'xstateAction': '--xstate-action',
      'xstateGuard': '--xstate-guard',
      'xstateProperty': '--xstate-property',
      'contextProperty': '--context-property',
      'eventProperty': '--event-property',
      'stateName': '--state-name',
      'eventName': '--event-name',
      'serviceName': '--service-name',
      'actorName': '--actor-name'
    };

    return varMap[type] || '--default';
  }

  /**
   * Render specific node types
   */
  renderComment(node) {
    const style = this.getTokenStyle({ type: 'comment' });
    let value = this.escapeHtml(node.value);

    // Enhance comment rendering
    if (node.subType === 'annotation') {
      value = value.replace(
        /(TODO|FIXME|HACK|NOTE|WARNING)(:?\s*)/,
        '<strong class="comment-annotation">$1</strong>$2'
      );
    }

    this.output.push(`<span class="comment ${node.subType || ''}" style="${style}">${value}</span>`);
  }

  renderFunctionDeclaration(node) {
    // Render function keyword
    this.output.push(`<span class="keyword" style="${this.getTokenStyle({ type: 'keyword' })}">function</span> `);

    // Render function name
    if (node.name) {
      this.output.push(`<span class="function" style="${this.getTokenStyle({ type: 'function' })}">${node.name}</span>`);
    }

    // Render parameters
    this.output.push('(');
    if (node.params) {
      node.params.forEach((param, i) => {
        if (i > 0) this.output.push(', ');
        this.output.push(`<span class="parameter" style="${this.getTokenStyle({ type: 'identifier' })}">${param}</span>`);
      });
    }
    this.output.push(')');

    // Continue with body...
  }

  renderClassDeclaration(node) {
    // Render class keyword
    this.output.push(`<span class="keyword" style="${this.getTokenStyle({ type: 'keyword' })}">class</span> `);

    if (node.name) {
      this.output.push(`<span class="class-name" style="${this.getTokenStyle({ type: 'className' })}">${node.name}</span>`);
    }

    if (node.superClass) {
      this.output.push(` <span class="keyword" style="${this.getTokenStyle({ type: 'keyword' })}">extends</span> `);
      this.output.push(`<span class="class-name" style="${this.getTokenStyle({ type: 'className' })}">${node.superClass}</span>`);
    }
  }

  renderVariableDeclaration(node) {
    // Render declaration keyword
    this.output.push(`<span class="keyword" style="${this.getTokenStyle({ type: 'keyword' })}">${node.kind}</span> `);

    // Render declarations
    for (let i = 0; i < node.declarations.length; i++) {
      const decl = node.declarations[i];
      if (i > 0) this.output.push(', ');

      this.output.push(`<span class="variable" style="${this.getTokenStyle({ type: 'identifier' })}">${decl.name}</span>`);

      if (decl.init) {
        this.output.push(' = ');
        // Render initialization expression
        if (decl.init.tokens) {
          for (const token of decl.init.tokens) {
            this.renderToken(token);
          }
        }
      }
    }
  }

  renderTemplateLiteral(node) {
    const style = this.getTokenStyle({ type: 'templateLiteral' });
    this.output.push(`<span class="template-literal" style="${style}">\``);

    if (node.parts) {
      for (const part of node.parts) {
        if (part.type === 'text') {
          this.output.push(this.escapeHtml(node.value.slice(part.start, part.end)));
        } else if (part.type === 'expression') {
          this.output.push('<span class="template-expression">${');
          // Render expression content
          const exprContent = node.value.slice(part.start + 2, part.end - 1);
          // This would need to be re-tokenized for proper highlighting
          this.output.push(`<span class="template-expr-content">${this.escapeHtml(exprContent)}</span>`);
          this.output.push('}</span>');
        }
      }
    }

    this.output.push('`</span>');
  }

  renderJSXElement(node) {
    // Opening tag
    this.output.push(`<span class="jsx-bracket" style="${this.getTokenStyle({ type: 'jsxBracket' })}">&lt;</span>`);

    const tagStyle = /^[A-Z]/.test(node.tagName)
      ? this.getTokenStyle({ type: 'reactComponent' })
      : this.getTokenStyle({ type: 'jsxTag' });

    this.output.push(`<span class="${/^[A-Z]/.test(node.tagName) ? 'react-component' : 'jsx-tag'}" style="${tagStyle}">${node.tagName}</span>`);

    // Attributes
    for (const attr of node.attributes) {
      this.output.push(' ');
      this.renderJSXAttribute(attr);
    }

    // Self-closing or closing bracket
    if (node.selfClosing) {
      this.output.push(`<span class="jsx-bracket" style="${this.getTokenStyle({ type: 'jsxBracket' })}">/&gt;</span>`);
    } else {
      this.output.push(`<span class="jsx-bracket" style="${this.getTokenStyle({ type: 'jsxBracket' })}">&gt;</span>`);

      // Children
      for (const child of node.children) {
        this.renderNode(child);
      }

      // Closing tag
      this.output.push(`<span class="jsx-bracket" style="${this.getTokenStyle({ type: 'jsxBracket' })}">&lt;/</span>`);
      this.output.push(`<span class="${/^[A-Z]/.test(node.tagName) ? 'react-component' : 'jsx-tag'}" style="${tagStyle}">${node.tagName}</span>`);
      this.output.push(`<span class="jsx-bracket" style="${this.getTokenStyle({ type: 'jsxBracket' })}">&gt;</span>`);
    }
  }

  renderJSXAttribute(attr) {
    this.output.push(`<span class="jsx-attribute" style="${this.getTokenStyle({ type: 'jsxAttribute' })}">${attr.name}</span>`);

    if (attr.value !== true) {
      this.output.push('=');

      if (attr.value.type === 'literal') {
        const stringStyle = this.getTokenStyle({ type: 'string' });
        this.output.push(`<span class="string" style="${stringStyle}">${this.escapeHtml(attr.value.value)}</span>`);
      } else if (attr.value.type === 'jsxExpression') {
        this.output.push(`<span class="jsx-expression">{`);
        // Render expression content
        if (attr.value.expression && attr.value.expression.tokens) {
          for (const token of attr.value.expression.tokens) {
            this.renderToken(token);
          }
        }
        this.output.push(`}</span>`);
      }
    }
  }

  renderJSXFragment(node) {
    // Opening
    this.output.push(`<span class="jsx-bracket" style="${this.getTokenStyle({ type: 'jsxBracket' })}">&lt;&gt;</span>`);

    // Children
    for (const child of node.children) {
      this.renderNode(child);
    }

    // Closing
    this.output.push(`<span class="jsx-bracket" style="${this.getTokenStyle({ type: 'jsxBracket' })}">&lt;/&gt;</span>`);
  }

  /**
   * Escape HTML special characters
   */
  escapeHtml(text) {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return text.replace(/[&<>"']/g, char => escapeMap[char]);
  }

  /**
   * Apply section highlighting
   */
  applySectionHighlighting(html) {
    if (this.highlightMode !== 'section' || !this.highlightSection) {
      return html;
    }

    // This would apply dimming/highlighting based on section
    // For now, return as-is
    return html;
  }
}