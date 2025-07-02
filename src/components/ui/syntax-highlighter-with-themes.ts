// TypeScript interfaces for Syntax Highlighter with Themes component
interface Theme {
  name: string;
  colors: {
    background: string;
    text: string;
    keyword: string;
    string: string;
    comment: string;
    number: string;
    operator: string;
    function: string;
  };
}

interface SyntaxHighlighterConfig {
  language?: string;
  theme?: string;
  showLineNumbers?: boolean;
  copyButton?: boolean;
  foldable?: boolean;
  maxHeight?: string;
}

interface CodeToken {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'operator' | 'function' | 'variable' | 'text';
  value: string;
  index: number;
}

class SyntaxHighlighterWithThemes extends HTMLElement {
  private config: SyntaxHighlighterConfig;
  private content: string = '';
  private themes: Map<string, Theme> = new Map();
  private currentTheme: Theme;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.config = {
      language: this.getAttribute('language') || 'javascript',
      theme: this.getAttribute('theme') || 'vscode-dark',
      showLineNumbers: this.getAttribute('show-line-numbers') !== 'false',
      copyButton: this.getAttribute('copy-button') !== 'false',
      foldable: this.getAttribute('foldable') === 'true',
      maxHeight: this.getAttribute('max-height') || '400px'
    };
    this.initializeThemes();
    this.currentTheme = this.themes.get(this.config.theme!) || this.themes.get('vscode-dark')!;
  }

  static get observedAttributes(): string[] {
    return ['language', 'theme', 'show-line-numbers', 'copy-button', 'foldable', 'max-height'];
  }

  connectedCallback(): void {
    this.content = this.textContent?.trim() || '';
    this.textContent = ''; // Clear original content
    this.render();
    this.addEventListeners();
  }

  disconnectedCallback(): void {
    this.removeEventListeners();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      this.updateConfig();
      if (name === 'theme') {
        this.currentTheme = this.themes.get(newValue!) || this.currentTheme;
      }
      this.render();
    }
  }

  private updateConfig(): void {
    this.config = {
      language: this.getAttribute('language') || 'javascript',
      theme: this.getAttribute('theme') || 'vscode-dark',
      showLineNumbers: this.getAttribute('show-line-numbers') !== 'false',
      copyButton: this.getAttribute('copy-button') !== 'false',
      foldable: this.getAttribute('foldable') === 'true',
      maxHeight: this.getAttribute('max-height') || '400px'
    };
  }

  private initializeThemes(): void {
    // VS Code Dark Theme
    this.themes.set('vscode-dark', {
      name: 'VS Code Dark',
      colors: {
        background: '#1e1e1e',
        text: '#d4d4d4',
        keyword: '#569cd6',
        string: '#ce9178',
        comment: '#6a9955',
        number: '#b5cea8',
        operator: '#d4d4d4',
        function: '#dcdcaa'
      }
    });

    // GitHub Light Theme
    this.themes.set('github-light', {
      name: 'GitHub Light',
      colors: {
        background: '#ffffff',
        text: '#24292e',
        keyword: '#d73a49',
        string: '#032f62',
        comment: '#6a737d',
        number: '#005cc5',
        operator: '#d73a49',
        function: '#6f42c1'
      }
    });

    // Dracula Theme
    this.themes.set('dracula', {
      name: 'Dracula',
      colors: {
        background: '#282a36',
        text: '#f8f8f2',
        keyword: '#ff79c6',
        string: '#f1fa8c',
        comment: '#6272a4',
        number: '#bd93f9',
        operator: '#ff79c6',
        function: '#50fa7b'
      }
    });

    // Monokai Theme
    this.themes.set('monokai', {
      name: 'Monokai',
      colors: {
        background: '#272822',
        text: '#f8f8f2',
        keyword: '#f92672',
        string: '#e6db74',
        comment: '#75715e',
        number: '#ae81ff',
        operator: '#f92672',
        function: '#a6e22e'
      }
    });
  }

  private render(): void {
    if (!this.shadowRoot) return;

    const tokens = this.tokenize(this.content);
    const lines = this.content.split('\n');

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
          border-radius: 8px;
          overflow: hidden;
          background: ${this.currentTheme.colors.background};
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .syntax-highlighter {
          position: relative;
        }
        
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .language-label {
          color: ${this.currentTheme.colors.text};
          font-size: 0.875rem;
          opacity: 0.8;
        }
        
        .controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .theme-selector {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: ${this.currentTheme.colors.text};
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
        }
        
        .copy-button {
          background: rgba(13, 153, 255, 0.1);
          border: 1px solid rgba(13, 153, 255, 0.3);
          color: var(--jasper, #0D99FF);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .copy-button:hover {
          background: rgba(13, 153, 255, 0.2);
        }
        
        .copy-button.copied {
          background: rgba(46, 213, 115, 0.2);
          border-color: rgba(46, 213, 115, 0.5);
          color: #2ed573;
        }
        
        .fold-button {
          background: none;
          border: none;
          color: ${this.currentTheme.colors.text};
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }
        
        .fold-button:hover {
          opacity: 1;
        }
        
        .code-container {
          max-height: ${this.config.foldable ? (this.config.maxHeight || '400px') : 'none'};
          overflow: auto;
          transition: max-height 0.3s ease;
        }
        
        .code-container.folded {
          max-height: 0;
          overflow: hidden;
        }
        
        .code-content {
          display: flex;
          background: ${this.currentTheme.colors.background};
        }
        
        .line-numbers {
          padding: 1rem 0.5rem;
          background: rgba(0, 0, 0, 0.1);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          color: ${this.currentTheme.colors.text};
          opacity: 0.5;
          font-size: 0.875rem;
          line-height: 1.5;
          text-align: right;
          user-select: none;
          min-width: ${lines.length.toString().length * 0.6 + 1}rem;
        }
        
        .code-lines {
          flex: 1;
          padding: 1rem;
          color: ${this.currentTheme.colors.text};
          font-size: 0.875rem;
          line-height: 1.5;
          overflow-x: auto;
        }
        
        .token {
          white-space: pre;
        }
        
        .token.keyword {
          color: ${this.currentTheme.colors.keyword};
          font-weight: 500;
        }
        
        .token.string {
          color: ${this.currentTheme.colors.string};
        }
        
        .token.comment {
          color: ${this.currentTheme.colors.comment};
          font-style: italic;
        }
        
        .token.number {
          color: ${this.currentTheme.colors.number};
        }
        
        .token.operator {
          color: ${this.currentTheme.colors.operator};
        }
        
        .token.function {
          color: ${this.currentTheme.colors.function};
        }
        
        .token.variable {
          color: ${this.currentTheme.colors.text};
        }
        
        .line {
          display: block;
          min-height: 1.5em;
        }
        
        .empty-line {
          height: 1.5em;
        }
        
        /* Scrollbar styling */
        .code-container::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .code-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .code-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        }
        
        .code-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      </style>
      
      <div class="syntax-highlighter">
        <div class="header">
          <span class="language-label">${this.escapeHtml(this.config.language!)}</span>
          <div class="controls">
            <select class="theme-selector" id="theme-selector">
              ${Array.from(this.themes.entries()).map(([key, theme]) => `
                <option value="${key}" ${key === this.config.theme ? 'selected' : ''}>
                  ${this.escapeHtml(theme.name)}
                </option>
              `).join('')}
            </select>
            ${this.config.copyButton ? `
              <button class="copy-button" id="copy-button">Copy</button>
            ` : ''}
            ${this.config.foldable ? `
              <button class="fold-button" id="fold-button">▼</button>
            ` : ''}
          </div>
        </div>
        <div class="code-container" id="code-container">
          <div class="code-content">
            ${this.config.showLineNumbers ? `
              <div class="line-numbers">
                ${lines.map((_, i) => i + 1).join('\n')}
              </div>
            ` : ''}
            <div class="code-lines">
              ${this.renderHighlightedCode(tokens, lines)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private tokenize(code: string): CodeToken[] {
    const tokens: CodeToken[] = [];
    let index = 0;

    // Simple tokenizer for demonstration
    // In a real implementation, you'd use a proper lexer
    const patterns = {
      keyword: /\b(const|let|var|function|class|if|else|for|while|return|import|export|from|default|async|await|try|catch|finally|throw|new|this|super|extends|implements|interface|type|enum|namespace|public|private|protected|static|readonly|abstract)\b/g,
      string: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
      comment: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
      number: /\b\d+\.?\d*\b/g,
      function: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/g,
      operator: /[+\-*/%=<>!&|?:.,;{}()\[\]]/g
    };

    // This is a simplified tokenizer - a real implementation would be more sophisticated
    const allMatches: Array<{ type: keyof typeof patterns; match: RegExpMatchArray }> = [];

    for (const [type, pattern] of Object.entries(patterns)) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        allMatches.push({ type: type as keyof typeof patterns, match });
      }
    }

    // Sort matches by index
    allMatches.sort((a, b) => a.match.index! - b.match.index!);

    // Create tokens
    let currentIndex = 0;
    for (const { type, match } of allMatches) {
      if (match.index! > currentIndex) {
        // Add text token for unmatched content
        tokens.push({
          type: 'text',
          value: code.slice(currentIndex, match.index),
          index: currentIndex
        });
      }
      
      tokens.push({
        type: type === 'function' ? 'function' : type,
        value: match[0],
        index: match.index!
      });
      
      currentIndex = match.index! + match[0].length;
    }

    // Add remaining text
    if (currentIndex < code.length) {
      tokens.push({
        type: 'text',
        value: code.slice(currentIndex),
        index: currentIndex
      });
    }

    return tokens;
  }

  private renderHighlightedCode(tokens: CodeToken[], lines: string[]): string {
    return lines.map((line, lineIndex) => {
      if (line.trim() === '') {
        return '<div class="line empty-line"></div>';
      }

      const lineTokens = tokens.filter(token => {
        const lineStart = lines.slice(0, lineIndex).join('\n').length + (lineIndex > 0 ? 1 : 0);
        const lineEnd = lineStart + line.length;
        return token.index >= lineStart && token.index < lineEnd;
      });

      let highlightedLine = '';
      let currentPos = 0;
      const lineStart = lines.slice(0, lineIndex).join('\n').length + (lineIndex > 0 ? 1 : 0);

      for (const token of lineTokens) {
        const tokenStart = token.index - lineStart;
        const tokenEnd = tokenStart + token.value.length;

        // Add any unhighlighted text before this token
        if (tokenStart > currentPos) {
          highlightedLine += this.escapeHtml(line.slice(currentPos, tokenStart));
        }

        // Add the highlighted token
        highlightedLine += `<span class="token ${token.type}">${this.escapeHtml(token.value)}</span>`;
        currentPos = tokenEnd;
      }

      // Add any remaining unhighlighted text
      if (currentPos < line.length) {
        highlightedLine += this.escapeHtml(line.slice(currentPos));
      }

      return `<div class="line">${highlightedLine}</div>`;
    }).join('');
  }

  private addEventListeners(): void {
    if (!this.shadowRoot) return;

    // Theme selector
    const themeSelector = this.shadowRoot.getElementById('theme-selector') as HTMLSelectElement;
    if (themeSelector) {
      themeSelector.addEventListener('change', this.handleThemeChange.bind(this));
    }

    // Copy button
    const copyButton = this.shadowRoot.getElementById('copy-button');
    if (copyButton) {
      copyButton.addEventListener('click', this.handleCopy.bind(this));
    }

    // Fold button
    const foldButton = this.shadowRoot.getElementById('fold-button');
    if (foldButton) {
      foldButton.addEventListener('click', this.handleFold.bind(this));
    }
  }

  private removeEventListeners(): void {
    // Event listeners are automatically removed when shadow DOM is destroyed
  }

  private handleThemeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newTheme = select.value;
    this.setAttribute('theme', newTheme);
  }

  private async handleCopy(): Promise<void> {
    const copyButton = this.shadowRoot?.getElementById('copy-button');
    if (!copyButton) return;

    try {
      await navigator.clipboard.writeText(this.content);
      copyButton.textContent = 'Copied!';
      copyButton.classList.add('copied');
      
      setTimeout(() => {
        copyButton.textContent = 'Copy';
        copyButton.classList.remove('copied');
      }, 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      copyButton.textContent = 'Failed';
      setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 2000);
    }
  }

  private handleFold(): void {
    const foldButton = this.shadowRoot?.getElementById('fold-button');
    const codeContainer = this.shadowRoot?.getElementById('code-container');
    
    if (!foldButton || !codeContainer) return;

    const isFolded = codeContainer.classList.contains('folded');
    
    if (isFolded) {
      codeContainer.classList.remove('folded');
      foldButton.textContent = '▼';
    } else {
      codeContainer.classList.add('folded');
      foldButton.textContent = '▶';
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API methods
  public updateCode(newCode: string): void {
    this.content = newCode;
    this.render();
  }

  public setTheme(themeName: string): void {
    if (this.themes.has(themeName)) {
      this.setAttribute('theme', themeName);
    }
  }

  public getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  public getCode(): string {
    return this.content;
  }
}

// Register the custom element
customElements.define('syntax-highlighter-with-themes', SyntaxHighlighterWithThemes);

export default SyntaxHighlighterWithThemes; 