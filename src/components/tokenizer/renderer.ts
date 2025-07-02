// TypeScript interfaces for Renderer
interface Token {
  type: string;
  start: number;
  end: number;
  value: string;
  metadata?: any;
  subType?: string;
}

interface RendererOptions {
  theme?: string;
  language?: string;
  highlightMode?: string;
  highlightSection?: string;
  showLineNumbers?: boolean;
  copyButton?: boolean;
  [key: string]: any;
}

interface ThemeConfig {
  name: string;
  colors: { [tokenType: string]: string };
  background?: string;
  foreground?: string;
  styles?: { [tokenType: string]: string };
}

interface ASTNode {
  type: string;
  children?: ASTNode[];
  token?: Token;
  metadata?: any;
}

/**
 * Renderer - Converts tokens or AST into highlighted HTML
 * Handles themes, styling, and HTML generation
 */
export class Renderer {
  private options: RendererOptions;
  private theme: string;
  private language: string;
  private highlightMode: string;
  private highlightSection: string;
  private themeConfig: ThemeConfig | null = null;

  constructor(options: RendererOptions = {}) {
    this.options = options;
    this.theme = options.theme || 'default';
    this.language = options.language || 'javascript';
    this.highlightMode = options.highlightMode || 'default';
    this.highlightSection = options.highlightSection || '';
    
    this.loadTheme();
  }

  /**
   * Render tokens to highlighted HTML
   */
  public renderTokens(tokens: Token[], code: string): string {
    let html = '';
    let lastEnd = 0;

    // Process each token
    for (const token of tokens) {
      // Add any whitespace/content between tokens
      if (token.start > lastEnd) {
        const between = code.slice(lastEnd, token.start);
        html += this.escapeHtml(between);
      }

      // Render the token
      html += this.renderToken(token);
      lastEnd = token.end;
    }

    // Add any remaining content after the last token
    if (lastEnd < code.length) {
      const remaining = code.slice(lastEnd);
      html += this.escapeHtml(remaining);
    }

    return this.wrapCode(html);
  }

  /**
   * Render AST to highlighted HTML
   */
  public renderAST(ast: ASTNode): string {
    return this.renderASTNode(ast);
  }

  /**
   * Render a single AST node
   */
  private renderASTNode(node: ASTNode): string {
    if (node.token) {
      return this.renderToken(node.token);
    }

    if (node.children) {
      return node.children.map(child => this.renderASTNode(child)).join('');
    }

    return '';
  }

  /**
   * Render a single token
   */
  private renderToken(token: Token): string {
    const className = this.getTokenClassName(token);
    const style = this.getTokenStyle(token);
    const content = this.escapeHtml(token.value);

    // Check for section highlighting
    if (this.shouldHighlightToken(token)) {
      return `<span class="${className} highlight-section" style="${style}">${content}</span>`;
    }

    return `<span class="${className}" style="${style}">${content}</span>`;
  }

  /**
   * Get CSS class name for a token
   */
  private getTokenClassName(token: Token): string {
    const baseClass = `token-${token.type}`;
    const classes = [baseClass];

    // Add subtype if available
    if (token.subType) {
      classes.push(`token-${token.type}-${token.subType}`);
    }

    // Add language-specific classes
    if (this.language !== 'javascript') {
      classes.push(`lang-${this.language}`);
    }

    // Add metadata-based classes
    if (token.metadata) {
      if (token.metadata.isReactComponent) {
        classes.push('react-component');
      }
      if (token.metadata.isHook) {
        classes.push('react-hook');
      }
      if (token.metadata.isXStateKeyword) {
        classes.push('xstate-keyword');
      }
    }

    return classes.join(' ');
  }

  /**
   * Get inline style for a token based on theme
   */
  private getTokenStyle(token: Token): string {
    if (!this.themeConfig) return '';

    const color = this.themeConfig.colors[token.type] || 
                  this.themeConfig.colors[`${token.type}-${token.subType}`] ||
                  this.themeConfig.foreground || '';

    const style = this.themeConfig.styles?.[token.type] || '';

    let styleString = '';
    if (color) styleString += `color: ${color};`;
    if (style) styleString += ` ${style}`;

    return styleString;
  }

  /**
   * Check if token should be highlighted (section highlighting)
   */
  private shouldHighlightToken(token: Token): boolean {
    if (this.highlightMode !== 'section' || !this.highlightSection) {
      return false;
    }

    // Check if token is part of the highlighted section
    return token.metadata?.section === this.highlightSection ||
           token.value.includes(this.highlightSection);
  }

  /**
   * Wrap code in appropriate container
   */
  private wrapCode(html: string): string {
    let result = html;

    // Add line numbers if requested
    if (this.options.showLineNumbers) {
      result = this.addLineNumbers(result);
    }

    // Add copy button if requested
    if (this.options.copyButton) {
      result = this.addCopyButton(result);
    }

    // Apply theme background
    const background = this.themeConfig?.background || '';
    const foreground = this.themeConfig?.foreground || '';
    
    const style = `${background ? `background: ${background};` : ''} ${foreground ? `color: ${foreground};` : ''}`;

    return `<div class="syntax-highlight ${this.theme}" style="${style}">${result}</div>`;
  }

  /**
   * Add line numbers to code
   */
  private addLineNumbers(html: string): string {
    const lines = html.split('\n');
    const numberedLines = lines.map((line, index) => {
      const lineNumber = index + 1;
      return `<span class="line-number">${lineNumber}</span><span class="line-content">${line}</span>`;
    });

    return `<div class="code-with-line-numbers">${numberedLines.join('\n')}</div>`;
  }

  /**
   * Add copy button functionality
   */
  private addCopyButton(html: string): string {
    return `
      <div class="code-container">
        <button class="copy-button" onclick="this.parentElement.querySelector('.syntax-highlight').copyCode()">
          Copy
        </button>
        ${html}
      </div>
    `;
  }

  /**
   * Load theme configuration
   */
  private loadTheme(): void {
    this.themeConfig = this.getThemeConfig(this.theme);
  }

  /**
   * Get theme configuration
   */
  private getThemeConfig(themeName: string): ThemeConfig {
    const themes: { [key: string]: ThemeConfig } = {
      'default': {
        name: 'Default',
        colors: {
          'keyword': '#0066CC',
          'string': '#008000',
          'comment': '#808080',
          'number': '#FF6600',
          'operator': '#333333',
          'identifier': '#333333',
          'punctuation': '#333333'
        },
        background: '#FFFFFF',
        foreground: '#333333'
      },

      'github-dark': {
        name: 'GitHub Dark',
        colors: {
          'keyword': '#FF7B72',
          'string': '#A5C261',
          'comment': '#8B949E',
          'number': '#79C0FF',
          'operator': '#F85149',
          'identifier': '#E1E4E8',
          'punctuation': '#E1E4E8',
          'functionCall': '#D2A8FF',
          'reactComponent': '#7CE38B',
          'xstate-keyword': '#FFA348'
        },
        background: '#0D1117',
        foreground: '#E1E4E8'
      },

      'monokai': {
        name: 'Monokai',
        colors: {
          'keyword': '#F92672',
          'string': '#E6DB74',
          'comment': '#75715E',
          'number': '#AE81FF',
          'operator': '#F92672',
          'identifier': '#F8F8F2',
          'punctuation': '#F8F8F2',
          'functionCall': '#A6E22E',
          'reactComponent': '#A6E22E'
        },
        background: '#272822',
        foreground: '#F8F8F2'
      },

      'night-owl': {
        name: 'Night Owl',
        colors: {
          'keyword': '#C792EA',
          'string': '#ECC48D',
          'comment': '#637777',
          'number': '#F78C6C',
          'operator': '#C792EA',
          'identifier': '#D6DEEB',
          'punctuation': '#D6DEEB',
          'functionCall': '#82AAFF',
          'reactComponent': '#ADDB67'
        },
        background: '#011627',
        foreground: '#D6DEEB'
      },

      'tokyo-night': {
        name: 'Tokyo Night',
        colors: {
          'keyword': '#BB9AF7',
          'string': '#9ECE6A',
          'comment': '#565F89',
          'number': '#FF9E64',
          'operator': '#89DDFF',
          'identifier': '#C0CAF5',
          'punctuation': '#89DDFF',
          'functionCall': '#7AA2F7',
          'reactComponent': '#9ECE6A'
        },
        background: '#1A1B26',
        foreground: '#C0CAF5'
      },

      'minimal-light': {
        name: 'Minimal Light',
        colors: {
          'keyword': '#0451A5',
          'string': '#008000',
          'comment': '#008000',
          'number': '#098658',
          'operator': '#0000FF',
          'identifier': '#000000',
          'punctuation': '#000000',
          'functionCall': '#795E26'
        },
        background: '#FFFFFF',
        foreground: '#000000'
      }
    };

    return themes[themeName] || themes['default'];
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const escapeMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    return text.replace(/[&<>"']/g, char => escapeMap[char]);
  }

  // Public API methods
  public setTheme(themeName: string): void {
    this.theme = themeName;
    this.loadTheme();
  }

  public setLanguage(language: string): void {
    this.language = language;
  }

  public setHighlightSection(section: string): void {
    this.highlightSection = section;
    this.highlightMode = section ? 'section' : 'default';
  }

  public getAvailableThemes(): string[] {
    return ['default', 'github-dark', 'monokai', 'night-owl', 'tokyo-night', 'minimal-light'];
  }

  public getCurrentTheme(): ThemeConfig | null {
    return this.themeConfig;
  }
} 