import { Lexer } from './lexer.js';
import { Parser } from './parser.js';
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

    // Always use the base JavaScript lexer for consistency
    // JSX is just JavaScript with HTML-like syntax
    // XState is just JavaScript with library patterns
    // TypeScript is just JavaScript with type annotations
    return new Lexer(code, lexerOptions);
  }

  /**
 * Create appropriate parser for the language
 */
  createParser(tokens) {
    const parserOptions = {
      language: this.language,
      ...this.options.parserOptions
    };

    // Use the base parser for all languages for consistency
    return new Parser(tokens, parserOptions);
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
export { Lexer, Parser, Renderer };

// Create a default instance
export default new Tokenizer();