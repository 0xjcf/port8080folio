import { Lexer } from './lexer.js';
import { JSXLexer } from './jsx-lexer.js';
import { XStateLexer } from './xstate-lexer.js';
import { Parser } from './parser.js';
import { JSXParser } from './jsx-parser.js';
import { Renderer } from './renderer.js';

/**
 * Tokenizer - Main entry point for the modular tokenization system
 * Coordinates between lexer, parser, and renderer components
 */
export class Tokenizer {
  constructor(options = {}) {
    this.options = options;
    this.language = options.language || 'javascript';
    this.theme = options.theme || 'default';
    this.highlightMode = options.highlightMode || 'default';
    this.highlightSection = options.highlightSection || '';
  }

  /**
   * Main tokenization and highlighting method
   */
  highlight(code) {
    try {
      // 1. Lexical analysis - convert code to tokens
      const lexer = this.createLexer(code);
      const tokens = lexer.tokenize();
      
      // 2. Parsing - build structure from tokens (optional)
      const parser = this.createParser(tokens);
      const ast = this.options.useAST ? parser.parse() : null;
      
      // 3. Rendering - generate highlighted HTML
      const renderer = this.createRenderer();
      const html = ast ? renderer.renderAST(ast) : renderer.renderTokens(tokens, code);
      
      // 4. Apply any post-processing
      return this.postProcess(html);
      
    } catch (error) {
      console.error('Tokenizer error:', error);
      // Fallback to escaped code
      return this.escapeHtml(code);
    }
  }

  /**
   * Create appropriate lexer for the language
   */
  createLexer(code) {
    const lexerOptions = {
      language: this.language,
      ...this.options.lexerOptions
    };
    
    switch (this.language) {
      case 'jsx':
      case 'react':
        return new JSXLexer(code, lexerOptions);
      
      case 'xstate':
        return new XStateLexer(code, lexerOptions);
      
      default:
        // Check if code contains JSX or XState patterns
        if (this.detectJSX(code)) {
          return new JSXLexer(code, lexerOptions);
        } else if (this.detectXState(code)) {
          return new XStateLexer(code, lexerOptions);
        }
        
        return new Lexer(code, lexerOptions);
    }
  }

  /**
   * Create appropriate parser for the language
   */
  createParser(tokens) {
    const parserOptions = {
      language: this.language,
      ...this.options.parserOptions
    };
    
    switch (this.language) {
      case 'jsx':
      case 'react':
        return new JSXParser(tokens, parserOptions);
      
      default:
        // Check if tokens contain JSX elements
        if (this.hasJSXTokens(tokens)) {
          return new JSXParser(tokens, parserOptions);
        }
        
        return new Parser(tokens, parserOptions);
    }
  }

  /**
   * Create renderer
   */
  createRenderer() {
    return new Renderer({
      theme: this.theme,
      language: this.language,
      highlightMode: this.highlightMode,
      highlightSection: this.highlightSection,
      ...this.options.rendererOptions
    });
  }

  /**
   * Detect if code contains JSX
   */
  detectJSX(code) {
    // Look for JSX patterns
    const jsxPatterns = [
      /&lt;\s*[A-Z][a-zA-Z0-9]*/, // <Component
      /&lt;\s*[a-z]+\s+[a-zA-Z]+=/, // <div className=
      /&lt;\s*\/\s*[a-zA-Z]+\s*&gt;/, // </div>
      /return\s*\(?\s*&lt;/, // return <
      /=\s*&lt;\s*[a-zA-Z]/, // = <div
      /React\.createElement/,
      /jsx|tsx/i // File extension hints
    ];
    
    return jsxPatterns.some(pattern => pattern.test(code));
  }

  /**
   * Detect if code contains XState
   */
  detectXState(code) {
    // Look for XState patterns
    const xstatePatterns = [
      /createMachine\s*\(/,
      /createActor\s*\(/,
      /interpret\s*\(/,
      /useMachine\s*\(/,
      /states\s*:\s*{/,
      /on\s*:\s*{\s*[A-Z_]+\s*:/,
      /entry\s*:\s*['"]|exit\s*:\s*['"]|invoke\s*:\s*{/
    ];
    
    return xstatePatterns.some(pattern => pattern.test(code));
  }

  /**
   * Check if tokens contain JSX elements
   */
  hasJSXTokens(tokens) {
    return tokens.some(token => 
      token.type === 'jsxTag' || 
      token.type === 'jsxBracket' ||
      token.type === 'reactComponent'
    );
  }

  /**
   * Post-process the highlighted HTML
   */
  postProcess(html) {
    // Apply section highlighting if needed
    if (this.highlightMode === 'section' && this.highlightSection) {
      html = this.applySectionHighlighting(html);
    }
    
    // Wrap in pre/code tags if needed
    if (this.options.wrapCode) {
      html = `<pre><code>${html}</code></pre>`;
    }
    
    return html;
  }

  /**
   * Apply section highlighting
   */
  applySectionHighlighting(html) {
    // This would implement the section highlighting logic
    // For now, return as-is
    return html;
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
}

// Export all components for direct use
export { Lexer, JSXLexer, XStateLexer, Parser, JSXParser, Renderer };

// Create a default instance
export default new Tokenizer();