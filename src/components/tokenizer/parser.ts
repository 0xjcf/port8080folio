// TypeScript version of Parser - converts tokens to AST

// Enhanced type definitions without any types
interface ASTAttribute {
  name: string;
  value: string | number | boolean;
  type?: 'literal' | 'expression' | 'template';
}

interface TokenMetadata {
  name?: string;
  type?: string;
  parameters?: string[];
  superClass?: string;
  source?: string;
  default?: boolean;
  attributes?: ASTAttribute[];
  children?: ASTNode[];
  [key: string]: unknown;
}

interface Token {
  type: string;
  start: number;
  end: number;
  value: string;
  metadata?: TokenMetadata;
  subType?: string;
}

interface ParserOptions {
  language?: string;
  buildAST?: boolean;
  preserveComments?: boolean;
  [key: string]: unknown;
}

interface VariableDeclaration {
  name: string;
  init?: ASTNode;
}

interface ASTNodeMetadata {
  name?: string;
  type?: string;
  parameters?: string[];
  superClass?: string;
  source?: string;
  default?: boolean;
  attributes?: ASTAttribute[];
  children?: ASTNode[];
  kind?: string;
  declarations?: VariableDeclaration[];
  [key: string]: unknown;
}

interface ASTNode {
  type: string;
  tokens?: Token[];
  children?: ASTNode[];
  metadata?: ASTNodeMetadata;
  start?: number;
  end?: number;
  value?: string;
}

/**
 * Enhanced Parser with strict null safety and proper typing
 */
export class Parser {
  private tokens: Token[];
  private position: number;
  private options: ParserOptions;
  private language: string;
  private ast: ASTNode[];

  constructor(tokens: Token[], options: ParserOptions = {}) {
    this.tokens = tokens;
    this.position = 0;
    this.options = options;
    this.language = options.language || 'javascript';
    this.ast = [];
  }

  /**
   * Parse tokens into AST
   */
  public parse(): ASTNode[] {
    this.ast = [];
    this.position = 0;

    while (this.position < this.tokens.length) {
      const statement = this.parseStatement();
      if (statement) {
        this.ast.push(statement);
      } else {
        // Skip unparseable token
        this.position++;
      }
    }

    return this.ast;
  }

  /**
   * Parse a statement - enhanced with null safety
   */
  private parseStatement(): ASTNode | null {
    const token = this.getCurrentToken();
    if (!token) return null;

    // Skip whitespace and newlines
    if (token.type === 'whitespace' || token.value === '\n') {
      this.position++;
      return this.parseStatement();
    }

    // Comments
    if (token.type === 'comment') {
      return this.parseComment();
    }

    // Function declarations
    if (token.value === 'function') {
      return this.parseFunctionDeclaration();
    }

    // Class declarations
    if (token.value === 'class') {
      return this.parseClassDeclaration();
    }

    // Variable declarations
    if (['const', 'let', 'var'].includes(token.value)) {
      return this.parseVariableDeclaration();
    }

    // Import/Export statements
    if (token.value === 'import') {
      return this.parseImportStatement();
    }

    if (token.value === 'export') {
      return this.parseExportStatement();
    }

    // JSX elements
    if (token.type === 'jsxBracket' || token.type === 'jsxTag') {
      return this.parseJSXElement();
    }

    // Expression statements
    return this.parseExpressionStatement();
  }

  /**
   * Parse comment nodes
   */
  private parseComment(): ASTNode {
    const token = this.getCurrentToken();
    if (!token) {
      throw new Error('Unexpected end of tokens while parsing comment');
    }

    const node: ASTNode = {
      type: 'comment',
      tokens: [token],
      start: token.start,
      end: token.end,
      value: token.value,
      metadata: token.metadata,
    };

    this.position++;
    return node;
  }

  /**
   * Parse function declarations - enhanced null safety
   */
  private parseFunctionDeclaration(): ASTNode {
    const startToken = this.getCurrentToken();
    if (!startToken) {
      throw new Error('Unexpected end of tokens while parsing function declaration');
    }

    const tokens: Token[] = [startToken];
    this.position++; // Skip 'function'

    const node: ASTNode = {
      type: 'functionDeclaration',
      tokens,
      start: startToken.start,
      metadata: {},
    };

    // Function name
    const nameToken = this.getCurrentToken();
    if (nameToken && nameToken.type === 'identifier') {
      if (!node.metadata) node.metadata = {};
      node.metadata.name = nameToken.value;
      tokens.push(nameToken);
      this.position++;
    }

    // Parameters
    const currentToken = this.getCurrentToken();
    if (currentToken?.value === '(') {
      const params = this.parseParameterList();
      if (!node.metadata) node.metadata = {};
      node.metadata.parameters = params.metadata?.parameters || [];
      if (params.tokens) {
        tokens.push(...params.tokens);
      }
    }

    // Function body
    const bodyToken = this.getCurrentToken();
    if (bodyToken?.value === '{') {
      const body = this.parseBlock();
      node.children = [body];
      if (body.tokens) {
        tokens.push(...body.tokens);
      }
    }

    // Update end position
    const lastToken = tokens[tokens.length - 1];
    node.end = lastToken?.end || startToken.end;

    return node;
  }

  /**
   * Parse class declarations - enhanced null safety
   */
  private parseClassDeclaration(): ASTNode {
    const startToken = this.getCurrentToken();
    if (!startToken) {
      throw new Error('Unexpected end of tokens while parsing class declaration');
    }

    const tokens: Token[] = [startToken];
    this.position++; // Skip 'class'

    const node: ASTNode = {
      type: 'classDeclaration',
      tokens,
      start: startToken.start,
      metadata: {},
    };

    // Class name
    const nameToken = this.getCurrentToken();
    if (nameToken && nameToken.type === 'identifier') {
      if (!node.metadata) node.metadata = {};
      node.metadata.name = nameToken.value;
      tokens.push(nameToken);
      this.position++;
    }

    // Extends clause
    const extendsToken = this.getCurrentToken();
    if (extendsToken?.value === 'extends') {
      tokens.push(extendsToken);
      this.position++;

      const superClass = this.getCurrentToken();
      if (superClass && superClass.type === 'identifier') {
        if (!node.metadata) node.metadata = {};
        node.metadata.superClass = superClass.value;
        tokens.push(superClass);
        this.position++;
      }
    }

    // Class body
    const bodyToken = this.getCurrentToken();
    if (bodyToken?.value === '{') {
      const body = this.parseBlock();
      node.children = [body];
      if (body.tokens) {
        tokens.push(...body.tokens);
      }
    }

    const lastToken = tokens[tokens.length - 1];
    node.end = lastToken?.end || startToken.end;

    return node;
  }

  /**
   * Parse variable declarations - enhanced null safety
   */
  private parseVariableDeclaration(): ASTNode {
    const startToken = this.getCurrentToken();
    if (!startToken) {
      throw new Error('Unexpected end of tokens while parsing variable declaration');
    }

    const tokens: Token[] = [startToken];
    const kind = startToken.value;
    this.position++; // Skip declaration keyword

    const node: ASTNode = {
      type: 'variableDeclaration',
      tokens,
      start: startToken.start,
      metadata: { kind, declarations: [] },
    };

    // Parse declarators
    do {
      const nameToken = this.getCurrentToken();
      if (nameToken && nameToken.type === 'identifier') {
        const declaration: VariableDeclaration = { name: nameToken.value };
        tokens.push(nameToken);
        this.position++;

        // Initializer
        const initToken = this.getCurrentToken();
        if (initToken?.value === '=') {
          tokens.push(initToken);
          this.position++; // Skip '='

          const init = this.parseExpression();
          if (init) {
            declaration.init = init;
            if (init.tokens) {
              tokens.push(...init.tokens);
            }
          }
        }

        if (!node.metadata) node.metadata = {};
        if (!node.metadata.declarations) node.metadata.declarations = [];
        node.metadata.declarations.push(declaration);
      }

      // Check for comma
      const commaToken = this.getCurrentToken();
      if (commaToken?.value === ',') {
        tokens.push(commaToken);
        this.position++;
      } else {
        break;
      }
    } while (this.position < this.tokens.length);

    // Semicolon
    const semicolonToken = this.getCurrentToken();
    if (semicolonToken?.value === ';') {
      tokens.push(semicolonToken);
      this.position++;
    }

    const lastToken = tokens[tokens.length - 1];
    node.end = lastToken?.end || startToken.end;

    return node;
  }

  /**
   * Parse import statements - enhanced null safety
   */
  private parseImportStatement(): ASTNode {
    const startToken = this.getCurrentToken();
    if (!startToken) {
      throw new Error('Unexpected end of tokens while parsing import statement');
    }

    const tokens: Token[] = [startToken];
    this.position++; // Skip 'import'

    const node: ASTNode = {
      type: 'importStatement',
      tokens,
      start: startToken.start,
      metadata: {},
    };

    // Import specifiers
    while (this.position < this.tokens.length) {
      const token = this.getCurrentToken();
      if (!token) break;

      tokens.push(token);
      this.position++;

      if (token.value === ';') break;
      if (token.type === 'string') {
        if (!node.metadata) node.metadata = {};
        node.metadata.source = token.value;
      }
    }

    const lastToken = tokens[tokens.length - 1];
    node.end = lastToken?.end || startToken.end;

    return node;
  }

  /**
   * Parse export statements - enhanced null safety
   */
  private parseExportStatement(): ASTNode {
    const startToken = this.getCurrentToken();
    if (!startToken) {
      throw new Error('Unexpected end of tokens while parsing export statement');
    }

    const tokens: Token[] = [startToken];
    this.position++; // Skip 'export'

    const node: ASTNode = {
      type: 'exportStatement',
      tokens,
      start: startToken.start,
      metadata: {},
    };

    // Check for default export
    const defaultToken = this.getCurrentToken();
    if (defaultToken?.value === 'default') {
      if (!node.metadata) node.metadata = {};
      node.metadata.default = true;
      tokens.push(defaultToken);
      this.position++;
    }

    // Parse the exported declaration
    const declaration = this.parseStatement();
    if (declaration) {
      node.children = [declaration];
      if (declaration.tokens) {
        tokens.push(...declaration.tokens);
      }
    }

    const lastToken = tokens[tokens.length - 1];
    node.end = lastToken?.end || startToken.end;

    return node;
  }

  /**
   * Parse JSX elements - enhanced null safety
   */
  private parseJSXElement(): ASTNode {
    const startToken = this.getCurrentToken();
    if (!startToken) {
      throw new Error('Unexpected end of tokens while parsing JSX element');
    }

    const tokens: Token[] = [];

    const node: ASTNode = {
      type: 'jsxElement',
      tokens,
      start: startToken.start,
      metadata: { attributes: [], children: [] },
    };

    // Collect all JSX tokens
    let jsxDepth = 0;
    while (this.position < this.tokens.length) {
      const token = this.getCurrentToken();
      if (!token) break;

      tokens.push(token);
      this.position++;

      if (token.type === 'jsxBracket') {
        if (token.value === '<' || token.value === '&lt;') {
          jsxDepth++;
        } else if (token.value === '>' || token.value === '&gt;') {
          jsxDepth--;
          if (jsxDepth <= 0) break;
        }
      }
    }

    const lastToken = tokens[tokens.length - 1];
    node.end = lastToken?.end || startToken.end;

    return node;
  }

  /**
   * Parse expression statements - enhanced null safety
   */
  private parseExpressionStatement(): ASTNode {
    const startToken = this.getCurrentToken();
    if (!startToken) {
      throw new Error('Unexpected end of tokens while parsing expression statement');
    }

    const expression = this.parseExpression();

    if (!expression) {
      // Skip single token if we can't parse it
      this.position++;
      return {
        type: 'unknown',
        tokens: [startToken],
        start: startToken.start,
        end: startToken.end,
      };
    }

    // Optional semicolon
    const semicolonToken = this.getCurrentToken();
    if (semicolonToken?.value === ';') {
      if (!expression.tokens) expression.tokens = [];
      expression.tokens.push(semicolonToken);
      this.position++;
    }

    return {
      type: 'expressionStatement',
      children: [expression],
      tokens: expression.tokens,
      start: expression.start ?? 0,
      end: expression.end ?? 0,
    };
  }

  /**
   * Parse expressions - enhanced null safety
   */
  private parseExpression(): ASTNode | null {
    const startToken = this.getCurrentToken();
    if (!startToken) return null;

    const tokens: Token[] = [];
    let parenDepth = 0;
    let braceDepth = 0;
    let bracketDepth = 0;

    // Collect tokens until we reach a statement boundary
    while (this.position < this.tokens.length) {
      const token = this.getCurrentToken();
      if (!token) break;

      // Track nesting depth
      if (token.value === '(') parenDepth++;
      else if (token.value === ')') parenDepth--;
      else if (token.value === '{') braceDepth++;
      else if (token.value === '}') braceDepth--;
      else if (token.value === '[') bracketDepth++;
      else if (token.value === ']') bracketDepth--;

      // Stop at statement boundaries when not nested
      if (parenDepth === 0 && braceDepth === 0 && bracketDepth === 0) {
        if (
          [';', '\n'].includes(token.value) ||
          ['const', 'let', 'var', 'function', 'class', 'if', 'for', 'while'].includes(token.value)
        ) {
          break;
        }
      }

      tokens.push(token);
      this.position++;

      // Stop at certain tokens that end expressions
      if (parenDepth === 0 && braceDepth === 0 && bracketDepth === 0 && token.value === ';') {
        break;
      }
    }

    if (tokens.length === 0) return null;

    const lastToken = tokens[tokens.length - 1];
    return {
      type: 'expression',
      tokens,
      start: startToken.start,
      end: lastToken.end,
    };
  }

  /**
   * Parse parameter lists - enhanced null safety
   */
  private parseParameterList(): ASTNode {
    const startToken = this.getCurrentToken(); // '('
    if (!startToken) {
      throw new Error('Unexpected end of tokens while parsing parameter list');
    }

    const tokens: Token[] = [startToken];
    this.position++;

    const node: ASTNode = {
      type: 'parameterList',
      tokens,
      start: startToken.start,
      metadata: { parameters: [] },
    };

    while (this.position < this.tokens.length) {
      const token = this.getCurrentToken();
      if (!token) break;

      tokens.push(token);
      this.position++;

      if (token.value === ')') break;
      if (token.type === 'identifier') {
        if (!node.metadata) node.metadata = {};
        if (!node.metadata.parameters) node.metadata.parameters = [];
        node.metadata.parameters.push(token.value);
      }
    }

    const lastToken = tokens[tokens.length - 1];
    node.end = lastToken?.end || startToken.end;

    return node;
  }

  /**
   * Parse code blocks - enhanced null safety
   */
  private parseBlock(): ASTNode {
    const startToken = this.getCurrentToken(); // '{'
    if (!startToken) {
      throw new Error('Unexpected end of tokens while parsing block');
    }

    const tokens: Token[] = [startToken];
    this.position++;

    const node: ASTNode = {
      type: 'block',
      tokens,
      start: startToken.start,
      children: [],
    };

    let braceDepth = 1;
    while (this.position < this.tokens.length && braceDepth > 0) {
      const token = this.getCurrentToken();
      if (!token) break;

      tokens.push(token);

      if (token.value === '{') braceDepth++;
      else if (token.value === '}') braceDepth--;

      this.position++;
    }

    const lastToken = tokens[tokens.length - 1];
    node.end = lastToken?.end || startToken.end;

    return node;
  }

  /**
   * Get current token - enhanced null safety
   */
  private getCurrentToken(): Token | null {
    return this.position < this.tokens.length ? this.tokens[this.position] : null;
  }

  /**
   * Peek at next token - enhanced null safety
   */
  private peekToken(offset = 1): Token | null {
    const pos = this.position + offset;
    return pos < this.tokens.length ? this.tokens[pos] : null;
  }

  // Public API methods
  public getAST(): ASTNode[] {
    return [...this.ast];
  }

  public getTokens(): Token[] {
    return [...this.tokens];
  }

  public getPosition(): number {
    return this.position;
  }

  public getLanguage(): string {
    return this.language;
  }
}
