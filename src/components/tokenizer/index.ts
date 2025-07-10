/**
 * Tokenizer Module - TypeScript Version
 *
 * A modular syntax highlighting system with separate lexer, parser, and renderer components.
 * Supports JavaScript, JSX, and XState with extensible architecture.
 *
 * Usage:
 *
 * // Basic usage with default tokenizer
 * import tokenizer from './tokenizer/index.js';
 * const highlighted = tokenizer.highlight(code);
 *
 * // Custom tokenizer instance
 * import { Tokenizer } from './tokenizer/index.js';
 * const customTokenizer = new Tokenizer({
 *   language: 'jsx',
 *   theme: 'github-dark',
 *   highlightMode: 'section',
 *   highlightSection: 'stateSection'
 * });
 * const highlighted = customTokenizer.highlight(code);
 *
 * // Direct component usage
 * import { JSXLexer, Parser, Renderer } from './tokenizer/index.js';
 * const lexer = new JSXLexer(code);
 * const tokens = lexer.tokenize();
 * const parser = new Parser(tokens);
 * const ast = parser.parse();
 * const renderer = new Renderer({ theme: 'monokai' });
 * const html = renderer.renderAST(ast);
 */

// Type definitions for tokenizer system
export interface TokenizerOptions {
  language?: string;
  theme?: string;
  highlightMode?: string;
  highlightSection?: string;
  useAST?: boolean;
  wrapCode?: boolean;
  lexerOptions?: Record<string, unknown>;
  parserOptions?: Record<string, unknown>;
  rendererOptions?: Record<string, unknown>;
}

export interface Token {
  type: string;
  start: number;
  end: number;
  value: string;
  metadata?: Record<string, unknown>;
}

export interface LexerInterface {
  tokenize(): Token[];
}

export interface ParserInterface {
  parse(): Record<string, unknown>;
}

export interface RendererInterface {
  renderTokens(tokens: Token[], code: string): string;
  renderAST(ast: Record<string, unknown>): string;
}

export { JSXLexer } from './jsx-lexer.js';
export { JSXParser } from './jsx-parser.js';

// Export individual components for direct access
export { Lexer } from './lexer.js';
export { Parser } from './parser.js';
export { Renderer } from './renderer.js';
// Re-export everything from the main tokenizer module
export * from './tokenizer.js';
export { default } from './tokenizer.js';
export { XStateLexer } from './xstate-lexer.js';
