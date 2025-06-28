/**
 * Parser - Takes tokens from lexer and builds structured representation
 * Handles token relationships, scope tracking, and semantic analysis
 */
export class Parser {
  constructor(tokens, options = {}) {
    this.tokens = tokens;
    this.options = options;
    this.language = options.language || 'javascript';
    this.position = 0;
    this.ast = [];
    this.scopes = [];
    this.currentScope = null;
  }

  /**
   * Main parsing method
   */
  parse() {
    this.enterScope('global');
    
    while (this.position < this.tokens.length) {
      const node = this.parseStatement();
      if (node) {
        this.ast.push(node);
      }
    }
    
    this.exitScope();
    return this.ast;
  }

  /**
   * Parse a single statement
   */
  parseStatement() {
    const token = this.currentToken();
    if (!token) return null;

    // Skip whitespace tokens if any
    if (token.type === 'whitespace') {
      this.advance();
      return null;
    }

    // Comments are statements
    if (token.type === 'comment') {
      return this.parseComment();
    }

    // Handle different statement types
    switch (token.type) {
      case 'keyword':
        return this.parseKeywordStatement();
      case 'identifier':
        return this.parseIdentifierStatement();
      case 'string':
      case 'number':
      case 'boolean':
      case 'null':
        return this.parseLiteral();
      default:
        // For other tokens, just advance and return the token as-is
        this.advance();
        return token;
    }
  }

  /**
   * Parse comment
   */
  parseComment() {
    const token = this.consume('comment');
    return {
      type: 'comment',
      value: token.value,
      start: token.start,
      end: token.end
    };
  }

  /**
   * Parse keyword-based statements
   */
  parseKeywordStatement() {
    const keyword = this.currentToken();
    
    switch (keyword.value) {
      case 'function':
        return this.parseFunctionDeclaration();
      case 'class':
        return this.parseClassDeclaration();
      case 'const':
      case 'let':
      case 'var':
        return this.parseVariableDeclaration();
      case 'if':
        return this.parseIfStatement();
      case 'for':
      case 'while':
        return this.parseLoopStatement();
      case 'return':
        return this.parseReturnStatement();
      case 'import':
        return this.parseImportStatement();
      case 'export':
        return this.parseExportStatement();
      default:
        // For other keywords, just advance
        this.advance();
        return keyword;
    }
  }

  /**
   * Parse function declaration
   */
  parseFunctionDeclaration() {
    const functionKeyword = this.consume('keyword', 'function');
    const name = this.peek()?.type === 'identifier' ? this.consume('identifier') : null;
    
    this.enterScope('function', name?.value);
    
    // Parse parameters
    const params = this.parseParameters();
    
    // Parse body
    const body = this.parseBlockStatement();
    
    this.exitScope();
    
    return {
      type: 'functionDeclaration',
      name: name?.value,
      params,
      body,
      start: functionKeyword.start,
      end: body.end
    };
  }

  /**
   * Parse class declaration
   */
  parseClassDeclaration() {
    const classKeyword = this.consume('keyword', 'class');
    const name = this.consume('identifier');
    
    this.enterScope('class', name.value);
    
    // Check for extends
    let superClass = null;
    if (this.peek()?.value === 'extends') {
      this.advance(); // consume 'extends'
      superClass = this.consume('identifier').value;
    }
    
    // Parse class body
    const body = this.parseClassBody();
    
    this.exitScope();
    
    return {
      type: 'classDeclaration',
      name: name.value,
      superClass,
      body,
      start: classKeyword.start,
      end: body.end
    };
  }

  /**
   * Parse variable declaration
   */
  parseVariableDeclaration() {
    const declarationKeyword = this.consume('keyword');
    const declarations = [];
    
    do {
      const name = this.consume('identifier');
      let init = null;
      
      if (this.peek()?.value === '=') {
        this.advance(); // consume '='
        init = this.parseExpression();
      }
      
      declarations.push({
        type: 'variableDeclarator',
        name: name.value,
        init
      });
      
    } while (this.peek()?.value === ',' && this.advance());
    
    return {
      type: 'variableDeclaration',
      kind: declarationKeyword.value,
      declarations,
      start: declarationKeyword.start,
      end: this.position > 0 ? this.tokens[this.position - 1].end : declarationKeyword.end
    };
  }

  /**
   * Parse import statement
   */
  parseImportStatement() {
    const importKeyword = this.consume('keyword', 'import');
    const imports = [];
    let source = null;
    
    // Parse import specifiers
    if (this.peek()?.type === 'identifier') {
      // Default import
      imports.push({
        type: 'defaultImport',
        name: this.consume('identifier').value
      });
      
      if (this.peek()?.value === ',') {
        this.advance(); // consume ','
      }
    }
    
    if (this.peek()?.value === '{') {
      // Named imports
      this.advance(); // consume '{'
      while (this.peek()?.value !== '}') {
        const imported = this.consume('identifier');
        let local = imported.value;
        
        if (this.peek()?.value === 'as') {
          this.advance(); // consume 'as'
          local = this.consume('identifier').value;
        }
        
        imports.push({
          type: 'namedImport',
          imported: imported.value,
          local
        });
        
        if (this.peek()?.value === ',') {
          this.advance();
        }
      }
      this.advance(); // consume '}'
    }
    
    // Parse from clause
    if (this.peek()?.value === 'from') {
      this.advance(); // consume 'from'
      source = this.consume('string').value;
    }
    
    return {
      type: 'importStatement',
      imports,
      source,
      start: importKeyword.start,
      end: this.position > 0 ? this.tokens[this.position - 1].end : importKeyword.end
    };
  }

  /**
   * Parse parameters (for functions, arrow functions, etc.)
   */
  parseParameters() {
    const params = [];
    
    if (this.peek()?.value === '(') {
      this.advance(); // consume '('
      
      while (this.peek()?.value !== ')') {
        if (this.peek()?.type === 'identifier') {
          params.push({
            type: 'parameter',
            name: this.consume('identifier').value
          });
        }
        
        if (this.peek()?.value === ',') {
          this.advance();
        }
      }
      
      this.advance(); // consume ')'
    }
    
    return params;
  }

  /**
   * Parse block statement
   */
  parseBlockStatement() {
    const start = this.consume('punctuation', '{');
    const statements = [];
    
    while (this.peek()?.value !== '}') {
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
    }
    
    const end = this.consume('punctuation', '}');
    
    return {
      type: 'blockStatement',
      statements,
      start: start.start,
      end: end.end
    };
  }

  /**
   * Parse class body
   */
  parseClassBody() {
    const start = this.consume('punctuation', '{');
    const members = [];
    
    while (this.peek()?.value !== '}') {
      const member = this.parseClassMember();
      if (member) {
        members.push(member);
      }
    }
    
    const end = this.consume('punctuation', '}');
    
    return {
      type: 'classBody',
      members,
      start: start.start,
      end: end.end
    };
  }

  /**
   * Parse class member
   */
  parseClassMember() {
    const token = this.peek();
    if (!token) return null;
    
    if (token.type === 'identifier' || token.value === 'constructor') {
      const name = this.consume();
      
      if (this.peek()?.value === '(') {
        // Method
        const params = this.parseParameters();
        const body = this.parseBlockStatement();
        
        return {
          type: 'methodDefinition',
          name: name.value,
          params,
          body
        };
      } else {
        // Property
        let value = null;
        if (this.peek()?.value === '=') {
          this.advance(); // consume '='
          value = this.parseExpression();
        }
        
        return {
          type: 'propertyDefinition',
          name: name.value,
          value
        };
      }
    }
    
    // Skip unknown tokens
    this.advance();
    return null;
  }

  /**
   * Parse expression (simplified)
   */
  parseExpression() {
    // For now, just consume tokens until we hit a statement terminator
    const tokens = [];
    
    while (this.peek() && 
           this.peek().value !== ';' && 
           this.peek().value !== ',' &&
           this.peek().value !== ')' &&
           this.peek().value !== '}' &&
           this.peek().value !== ']') {
      tokens.push(this.consume());
    }
    
    return {
      type: 'expression',
      tokens
    };
  }

  /**
   * Parse identifier statement
   */
  parseIdentifierStatement() {
    // Could be function call, assignment, etc.
    const identifier = this.consume('identifier');
    
    if (this.peek()?.value === '(') {
      // Function call
      return this.parseFunctionCall(identifier);
    } else if (this.peek()?.value === '=') {
      // Assignment
      this.advance(); // consume '='
      const value = this.parseExpression();
      
      return {
        type: 'assignment',
        left: identifier,
        right: value
      };
    }
    
    return identifier;
  }

  /**
   * Parse function call
   */
  parseFunctionCall(name) {
    const args = this.parseArguments();
    
    return {
      type: 'functionCall',
      name: name.value,
      arguments: args,
      start: name.start,
      end: this.position > 0 ? this.tokens[this.position - 1].end : name.end
    };
  }

  /**
   * Parse arguments
   */
  parseArguments() {
    const args = [];
    
    if (this.peek()?.value === '(') {
      this.advance(); // consume '('
      
      while (this.peek()?.value !== ')') {
        args.push(this.parseExpression());
        
        if (this.peek()?.value === ',') {
          this.advance();
        }
      }
      
      this.advance(); // consume ')'
    }
    
    return args;
  }

  /**
   * Parse literal
   */
  parseLiteral() {
    return this.consume();
  }

  /**
   * Parse if statement
   */
  parseIfStatement() {
    const ifKeyword = this.consume('keyword', 'if');
    const condition = this.parseCondition();
    const consequent = this.parseStatement();
    let alternate = null;
    
    if (this.peek()?.value === 'else') {
      this.advance(); // consume 'else'
      alternate = this.parseStatement();
    }
    
    return {
      type: 'ifStatement',
      condition,
      consequent,
      alternate
    };
  }

  /**
   * Parse condition (simplified)
   */
  parseCondition() {
    if (this.peek()?.value === '(') {
      this.advance(); // consume '('
      const expr = this.parseExpression();
      if (this.peek()?.value === ')') {
        this.advance(); // consume ')'
      }
      return expr;
    }
    return this.parseExpression();
  }

  /**
   * Parse loop statement
   */
  parseLoopStatement() {
    const loopKeyword = this.consume('keyword');
    const condition = this.parseCondition();
    const body = this.parseStatement();
    
    return {
      type: 'loopStatement',
      kind: loopKeyword.value,
      condition,
      body
    };
  }

  /**
   * Parse return statement
   */
  parseReturnStatement() {
    const returnKeyword = this.consume('keyword', 'return');
    let value = null;
    
    if (this.peek() && this.peek().value !== ';') {
      value = this.parseExpression();
    }
    
    return {
      type: 'returnStatement',
      value
    };
  }

  /**
   * Parse export statement
   */
  parseExportStatement() {
    const exportKeyword = this.consume('keyword', 'export');
    
    if (this.peek()?.value === 'default') {
      this.advance(); // consume 'default'
      const declaration = this.parseStatement();
      
      return {
        type: 'exportDefaultStatement',
        declaration
      };
    }
    
    // Named export
    const declaration = this.parseStatement();
    
    return {
      type: 'exportNamedStatement',
      declaration
    };
  }

  /**
   * Scope management
   */
  enterScope(type, name = null) {
    const scope = {
      type,
      name,
      parent: this.currentScope,
      symbols: new Map()
    };
    
    this.scopes.push(scope);
    this.currentScope = scope;
  }

  exitScope() {
    if (this.currentScope) {
      this.currentScope = this.currentScope.parent;
    }
  }

  /**
   * Token navigation helpers
   */
  currentToken() {
    return this.tokens[this.position];
  }

  peek(offset = 0) {
    return this.tokens[this.position + offset];
  }

  advance() {
    if (this.position < this.tokens.length) {
      this.position++;
    }
    return true;
  }

  consume(expectedType = null, expectedValue = null) {
    const token = this.currentToken();
    
    if (!token) {
      throw new Error(`Unexpected end of input`);
    }
    
    if (expectedType && token.type !== expectedType) {
      throw new Error(`Expected ${expectedType} but got ${token.type}`);
    }
    
    if (expectedValue && token.value !== expectedValue) {
      throw new Error(`Expected "${expectedValue}" but got "${token.value}"`);
    }
    
    this.advance();
    return token;
  }
}