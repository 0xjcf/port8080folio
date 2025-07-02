// TypeScript version of Main Tokenizer - coordinates lexer, parser, and renderer
import { Lexer } from './lexer.js';
import { JSXLexer } from './jsx-lexer.js'; 
import { XStateLexer } from './xstate-lexer.js';
import { Parser } from './parser.js';
import { JSXParser } from './jsx-parser.js';
import { Renderer } from './renderer.js';

interface LexerOptions {
  language?: string;
  preserveWhitespace?: boolean;
  enableSectionHighlighting?: boolean;
  [key: string]: unknown;
}

interface ParserOptions {
  language?: string;
  buildAST?: boolean;
  preserveComments?: boolean;
  [key: string]: unknown;
}

interface RendererOptions {
  theme?: string;
  showLineNumbers?: boolean;
  enableCopy?: boolean;
  highlightSections?: string[];
  [key: string]: unknown;
}

interface TokenizerConfig {
  lexerOptions?: LexerOptions;
  parserOptions?: ParserOptions;
  rendererOptions?: RendererOptions;
  autoDetectLanguage?: boolean;
  enableAST?: boolean;
}

interface Token {
  type: string;
  start: number;
  end: number;
  value: string;
  metadata?: Record<string, unknown>;
  subType?: string;
}

interface ASTNode {
  type: string;
  tokens?: Token[];
  children?: ASTNode[];
  metadata?: Record<string, unknown>;
  start?: number;
  end?: number;
  value?: string;
}

/**
 * Enhanced Tokenizer with strict type safety
 * Coordinates lexer, parser, and renderer components
 */
export class Tokenizer {
  private code: string;
  private config: TokenizerConfig;
  private lexer: Lexer | JSXLexer | XStateLexer | null = null;
  private parser: Parser | JSXParser | null = null;
  private renderer: Renderer | null = null;
  private tokens: Token[] = [];
  private ast: ASTNode[] = [];

  constructor(code: string, config: TokenizerConfig = {}) {
    this.code = code;
    this.config = {
      autoDetectLanguage: true,
      enableAST: true,
      lexerOptions: { language: 'javascript' },
      parserOptions: { buildAST: true },
      rendererOptions: { theme: 'port8080' },
      ...config
    };
  }

  /**
   * Tokenize the code into tokens
   */
  public tokenize(): Token[] {
    if (!this.lexer) {
      this.lexer = this.createLexer(this.code);
    }

    this.tokens = this.lexer.tokenize();
    return this.tokens;
  }

  /**
   * Parse tokens into AST
   */
  public parse(): ASTNode[] {
    if (this.tokens.length === 0) {
      this.tokenize();
    }

    if (!this.parser) {
      this.parser = this.createParser(this.tokens);
    }

    if (this.config.enableAST) {
      this.ast = this.parser.parse();
    }

    return this.ast;
  }

  /**
   * Render tokens to HTML
   */
  public render(): string {
    if (this.tokens.length === 0) {
      this.tokenize();
    }

    if (!this.renderer) {
      this.renderer = this.createRenderer();
    }

    // Use the correct method signature: renderTokens(tokens, code)
    return this.renderer.renderTokens(this.tokens, this.code);
  }

  /**
   * Create lexer instance - now properly typed
   */
  private createLexer(code: string): Lexer | JSXLexer | XStateLexer {
    const language = this.config.lexerOptions?.language || this.detectLanguage(code);
    const options = { ...this.config.lexerOptions, language };

    // Static imports - create instance based on language
    if (language === 'jsx' || language === 'tsx') {
      // Use JSX lexer for React components
      return new JSXLexer(code, options);
    } else if (language === 'xstate') {
      // Use XState lexer for state machines  
      return new XStateLexer(code, options);
    } else {
      // Use base lexer for JavaScript/TypeScript
      return new Lexer(code, options);
    }
  }

  /**
   * Create parser instance - now properly typed
   */
  private createParser(tokens: Token[]): Parser | JSXParser {
    const language = this.config.parserOptions?.language || this.lexer?.getLanguage() || 'javascript';
    const options = { ...this.config.parserOptions, language };

    if (language === 'jsx' || language === 'tsx') {
      // Use JSX parser for React components
      return new JSXParser(tokens, options);
    } else {
      // Use base parser for JavaScript/TypeScript
      return new Parser(tokens, options);
    }
  }

  /**
   * Create renderer instance - now properly typed
   */
  private createRenderer(): Renderer {
    const options = this.config.rendererOptions || {};
    return new Renderer(options);
  }

  /**
   * Auto-detect language from code content
   */
  private detectLanguage(code: string): string {
    // JSX detection
    if (code.includes('jsx') || code.includes('<') || code.includes('React')) {
      return 'jsx';
    }

    // XState detection
    if (code.includes('createMachine') || code.includes('xstate') || code.includes('state:')) {
      return 'xstate';
    }

    // TypeScript detection
    if (code.includes('interface') || code.includes('type ') || code.includes(': string')) {
      return 'typescript';
    }

    // Default to JavaScript
    return 'javascript';
  }

  // Public API methods with proper typing
  public getTokens(): Token[] {
    return [...this.tokens];
  }

  public getAST(): ASTNode[] {
    return [...this.ast];
  }

  public getConfig(): TokenizerConfig {
    return { ...this.config };
  }

  public getLanguage(): string {
    return this.lexer?.getLanguage() || this.config.lexerOptions?.language || 'javascript';
  }

  public setConfig(newConfig: Partial<TokenizerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // Reset instances to use new config
    this.lexer = null;
    this.parser = null;
    this.renderer = null;
  }

  public updateCode(newCode: string): void {
    this.code = newCode;
    // Reset cached results
    this.tokens = [];
    this.ast = [];
    this.lexer = null;
    this.parser = null;
  }
}

// Export all components for direct use
export { Lexer, Parser, Renderer };

// Export the Tokenizer class as default
export default Tokenizer; 