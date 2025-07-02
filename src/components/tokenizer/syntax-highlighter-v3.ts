// TypeScript interfaces for Syntax Highlighter V3
interface TokenizerConfig {
  language: string;
  highlightMode: string;
  highlightSection: string;
  useAST: boolean;
}

interface HighlighterConfig {
  language?: string;
  highlightMode?: string;
  highlightSection?: string;
  hideHeader?: boolean;
  theme?: string;
}

// Import the Tokenizer class directly
import { Tokenizer } from './tokenizer.js';

class SyntaxHighlighter extends HTMLElement {
  private language: string;
  private highlightMode: string;
  private highlightSection: string;
  private hideHeader: boolean;
  private theme: string;
  private tokenizer: Tokenizer | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.language = '';
    this.highlightMode = 'default';
    this.highlightSection = '';
    this.hideHeader = false;
    this.theme = 'port8080-theme';
  }

  static get observedAttributes(): string[] {
    return ['language', 'highlight-mode', 'highlight-section', 'hide-header', 'theme'];
  }

  connectedCallback(): void {
    this.updateProperties();
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue !== newValue) {
      this.updateProperties();
      if (this.shadowRoot) {
        this.render();
      }
    }
  }

  private updateProperties(): void {
    this.language = this.getAttribute('language') || 'javascript';
    this.highlightMode = this.getAttribute('highlight-mode') || 'default';
    this.highlightSection = this.getAttribute('highlight-section') || '';
    this.hideHeader = this.getAttribute('hide-header') === 'true';
    this.theme = this.getAttribute('theme') || 'port8080-theme';
  }

  private render(): void {
    const code = this.textContent?.trim() || '';

    // Ensure language is always set
    if (!this.language) {
      this.language = this.getAttribute('language') || 'javascript';
    }

    // Create tokenizer with current settings (new API: code first, then config)
    this.tokenizer = new Tokenizer(code, {
      lexerOptions: { language: this.language },
      rendererOptions: { theme: this.theme },
      enableAST: false // Start with token-based rendering
    });

    // Get highlighted code using new API
    const highlightedCode = this.tokenizer.render();

    // Check if header should be hidden
    const hideHeader = this.getAttribute('hide-header') === 'true';

    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 1rem 0;
          --code-background: #0d1117; /* Default background */
          --code-border: #30363d;
          --header-background: #161b22;
          --header-color: #8b949e;
        }
        
        .code-block-wrapper {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--code-border);
          border-radius: 8px;
        }
        
        .code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          background: var(--header-background);
          border-bottom: 1px solid var(--code-border);
          font-size: 0.875rem;
          color: var(--header-color);
        }
        
        .language-badge {
          background: rgba(255, 133, 121, 0.1);
          color: #FF8579;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .copy-button {
          background: transparent;
          border: 1px solid #30363d;
          color: #8b949e;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.2s ease;
        }
        
        .copy-button:hover {
          background: rgba(255, 133, 121, 0.1);
          border-color: #FF8579;
          color: #FF8579;
        }
        
        .copy-button.copied {
          background: rgba(152, 195, 121, 0.1);
          border-color: #98c379;
          color: #98c379;
        }
        
        .header-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        
        .highlight-toggle {
          display: flex;
          gap: 0.25rem;
          align-items: center;
          font-size: 0.75rem;
        }
        
        .highlight-toggle select {
          background: transparent;
          border: 1px solid #30363d;
          color: #8b949e;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
        }
        
        .highlight-toggle select:hover {
          border-color: #FF8579;
        }
        
        pre {
          margin: 0;
          padding: 1rem;
          overflow: auto;
          background: var(--code-background);
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
        }
        
        code {
          font-family: inherit;
          display: block;
        }
        
        /* Enhanced token styling */
        .comment-annotation {
          font-weight: 700;
          color: var(--warning, #FCD34D);
        }
        
        .jsdoc-tag {
          color: var(--jsdoc-tag, #61AFEF);
          font-weight: 500;
        }
        
        .template-expression {
          color: var(--jsx-bracket, #FCD34D);
        }
        
        .template-expr-content {
          color: var(--variable, #60A5FA);
        }
        
        /* Function call styling */
        [data-function-call="true"] {
          font-style: italic;
        }
        
        /* Arrow function styling */
        [data-arrow="true"] {
          font-weight: 700;
        }
        
        /* Highlight mode styles */
        :host([highlight-mode="section"]) {
          --section-highlight: #FFD866;
          --section-dim: #727072;
        }
        
        /* Theme CSS Variables */
        
        /* Port8080 Theme */
        :host([theme="port8080-theme"]) {
          /* XState specific */
          --xstate-keyword: #FCD34D;
          --xstate-action: #F472B6;
          --xstate-guard: #60A5FA;
          --xstate-property: #14B8A6;
          --context-property: #F472B6;
          --event-property: #60A5FA;
          --state-name: #C084FC;
          --event-name: #34D399;
          --service-name: #14B8A6;
          --actor-name: #FF8579;
          
          /* Basic tokens */
          --keyword: #0D99FF;
          --string: #34D399;
          --number: #FCD34D;
          --comment: #6B7280;
          --function: #C084FC;
          --class-name: #61AFEF;
          --operator: #9CA3AF;
          --punctuation: #9CA3AF;
          --variable: #60A5FA;
          --property: #47B4FF;
          --boolean: #FCD34D;
          --null: #C084FC;
          --builtin: #FF8579;
          --regex: #34D399;
          --default: #F5F5F5;
          
          /* JSX/React specific */
          --jsx-tag: #FF8579;
          --jsx-bracket: #FCD34D;
          --jsx-attribute: #34D399;
          --jsx-expression: #C084FC;
          --react-component: #61AFEF;
          --react-hook: #F472B6;
          --react-keyword: #0D99FF;
          
          /* Additional */
          --warning: #FCD34D;
          --jsdoc-tag: #61AFEF;
        }
        
        /* GitHub Dark Theme */
        :host([theme="github-dark-theme"]) {
          /* XState specific */
          --xstate-keyword: #F0DB4F;
          --xstate-action: #E06C75;
          --xstate-guard: #56B6C2;
          --xstate-property: #D19A66;
          --context-property: #E06C75;
          --event-property: #79B8FF;
          --state-name: #B392F0;
          --event-name: #5ED3F3;
          --service-name: #14B8A6;
          --actor-name: #F97583;
          
          /* Basic tokens */
          --keyword: #FF8579;
          --string: #9ECB88;
          --number: #79B8FF;
          --comment: #6A737D;
          --function: #F97583;
          --class-name: #B392F0;
          --operator: #8B949E;
          --punctuation: #8B949E;
          --variable: #B392F0;
          --property: #79B8FF;
          --boolean: #79B8FF;
          --null: #B392F0;
          --builtin: #F97583;
          --regex: #DBEDFF;
          --default: #E1E4E8;
          
          /* JSX/React specific */
          --jsx-tag: #7EE787;
          --jsx-bracket: #79B8FF;
          --jsx-attribute: #F97583;
          --jsx-expression: #79B8FF;
          --react-component: #B392F0;
          --react-hook: #F97583;
          --react-keyword: #FF8579;
          
          /* Additional */
          --warning: #DBAB79;
          --jsdoc-tag: #B392F0;
        }
        
        /* Night Owl Theme */
        :host([theme="night-owl-theme"]) {
          /* XState specific */
          --xstate-keyword: #FFEB95;
          --xstate-action: #FF6B9D;
          --xstate-guard: #C5E478;
          --xstate-property: #F78C6C;
          --context-property: #FF6B9D;
          --event-property: #82AAFF;
          --state-name: #C792EA;
          --event-name: #7FDBCA;
          --service-name: #ADDB67;
          --actor-name: #FF6B9D;
          
          /* Basic tokens */
          --keyword: #C792EA;
          --string: #ECC48D;
          --number: #F78C6C;
          --comment: #637777;
          --function: #82AAFF;
          --class-name: #FFCB8B;
          --operator: #C792EA;
          --punctuation: #D6DEEB;
          --variable: #ADDB67;
          --property: #7FDBCA;
          --boolean: #FF6B9D;
          --null: #C792EA;
          --builtin: #82AAFF;
          --regex: #5CA7E4;
          --default: #D6DEEB;
          
          /* JSX/React specific */
          --jsx-tag: #CAECE9;
          --jsx-bracket: #80A4C2;
          --jsx-attribute: #C5E478;
          --jsx-expression: #D6DEEB;
          --react-component: #82AAFF;
          --react-hook: #FF6B9D;
          --react-keyword: #C792EA;
          
          /* Additional */
          --warning: #FFEB95;
          --jsdoc-tag: #82AAFF;
        }
        
        /* Monokai Theme */
        :host([theme="monokai-theme"]) {
          /* XState specific */
          --xstate-keyword: #FFD866;
          --xstate-action: #FF6188;
          --xstate-guard: #A9DC76;
          --xstate-property: #FC9867;
          --context-property: #FF6188;
          --event-property: #78DCE8;
          --state-name: #AB9DF2;
          --event-name: #A9DC76;
          --service-name: #FC9867;
          --actor-name: #FF6188;
          
          /* Basic tokens */
          --keyword: #FF6188;
          --string: #FFD866;
          --number: #AB9DF2;
          --comment: #727072;
          --function: #A9DC76;
          --class-name: #78DCE8;
          --operator: #FF6188;
          --punctuation: #FCFCFA;
          --variable: #FCFCFA;
          --property: #78DCE8;
          --boolean: #AB9DF2;
          --null: #AB9DF2;
          --builtin: #78DCE8;
          --regex: #FFD866;
          --default: #FCFCFA;
          
          /* JSX/React specific */
          --jsx-tag: #78DCE8;
          --jsx-bracket: #FFD866;
          --jsx-attribute: #A9DC76;
          --jsx-expression: #FCFCFA;
          --react-component: #78DCE8;
          --react-hook: #FF6188;
          --react-keyword: #FF6188;
          
          /* Additional */
          --warning: #FFD866;
          --jsdoc-tag: #78DCE8;
        }

        /* Tokyo Night Theme */
        :host([theme="tokyo-night-theme"]) {
          /* XState specific */
          --xstate-keyword: #e0af68;
          --xstate-action: #f7768e;
          --xstate-guard: #9ece6a;
          --xstate-property: #73daca;
          --context-property: #f7768e;
          --event-property: #7dcfff;
          --state-name: #bb9af7;
          --event-name: #9ece6a;
          --service-name: #73daca;
          --actor-name: #f7768e;
          
          /* Basic tokens */
          --keyword: #bb9af7;
          --string: #9ece6a;
          --number: #ff9e64;
          --comment: #565f89;
          --function: #7aa2f7;
          --class-name: #bb9af7;
          --operator: #89ddff;
          --punctuation: #a9b1d6;
          --variable: #c0caf5;
          --property: #7dcfff;
          --boolean: #ff9e64;
          --null: #bb9af7;
          --builtin: #7aa2f7;
          --regex: #b4f9f8;
          --default: #a9b1d6;
          
          /* JSX/React specific */
          --jsx-tag: #7dcfff;
          --jsx-bracket: #89ddff;
          --jsx-attribute: #9ece6a;
          --jsx-expression: #c0caf5;
          --react-component: #bb9af7;
          --react-hook: #f7768e;
          --react-keyword: #bb9af7;
          
          /* Additional */
          --warning: #e0af68;
          --jsdoc-tag: #7aa2f7;
        }
        
        /* Minimal Light Theme */
        :host([theme="minimal-light-theme"]) {
          --code-background: #f6f8fa;
          --code-border: #e1e4e8;
          --header-background: #f6f8fa;
          --header-color: #586069;
          
          /* XState specific */
          --xstate-keyword: #005cc5;
          --xstate-action: #d73a49;
          --xstate-guard: #22863a;
          --xstate-property: #6f42c1;
          --context-property: #d73a49;
          --event-property: #005cc5;
          --state-name: #6f42c1;
          --event-name: #22863a;
          --service-name: #6f42c1;
          --actor-name: #d73a49;
          
          /* Basic tokens */
          --keyword: #d73a49;
          --string: #032f62;
          --number: #005cc5;
          --comment: #6a737d;
          --function: #6f42c1;
          --class-name: #22863a;
          --operator: #d73a49;
          --punctuation: #24292e;
          --variable: #e36209;
          --property: #e36209;
          --boolean: #005cc5;
          --null: #005cc5;
          --builtin: #6f42c1;
          --regex: #032f62;
          --default: #24292e;
          
          /* JSX/React specific */
          --jsx-tag: #22863a;
          --jsx-bracket: #24292e;
          --jsx-attribute: #6f42c1;
          --jsx-expression: #005cc5;
          --react-component: #22863a;
          --react-hook: #d73a49;
          --react-keyword: #d73a49;
          
          /* Additional */
          --warning: #e36209;
          --jsdoc-tag: #6f42c1;
        }
        
        /* Scrollbar styling */
        pre::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        pre::-webkit-scrollbar-track {
          background: var(--code-background);
        }
        
        pre::-webkit-scrollbar-thumb {
          background: var(--code-border);
          border-radius: 4px;
        }
        
        pre::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
        
        /* Highlight section styles */
        .section-highlight {
          background-color: rgba(255, 216, 102, 0.1);
          border-left: 3px solid var(--section-highlight);
          margin-left: -1rem;
          padding-left: calc(1rem - 3px);
        }
        
        .dimmed {
          opacity: 0.5;
        }
      </style>
      
      <div class="code-block-wrapper">
        ${!this.hideHeader ? `
        <div class="code-header">
          <span class="language-badge">${this.escapeHtml(this.language)}</span>
          <div class="header-controls">
            ${this.highlightMode === 'section' ? `
            <div class="highlight-toggle">
              <label>Highlight:</label>
              <select>
                ${this.getSectionOptions()}
              </select>
            </div>
            ` : ''}
            <button class="copy-button">Copy</button>
          </div>
        </div>
        ` : ''}
        
        <pre><code>${highlightedCode}</code></pre>
      </div>
    `;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.shadowRoot) return;

    const copyButton = this.shadowRoot.querySelector('.copy-button');
    if (copyButton) {
      copyButton.addEventListener('click', () => {
        const code = this.textContent?.trim() || '';
        navigator.clipboard.writeText(code).then(() => {
          const button = copyButton as HTMLButtonElement;
          const originalText = button.textContent;
          button.textContent = 'Copied!';
          button.classList.add('copied');
          setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy: ', err);
        });
      });
    }

    const selectElement = this.shadowRoot.querySelector('select');
    if (selectElement) {
      selectElement.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        this.setAttribute('highlight-section', target.value);
      });
    }
  }

  private getSectionOptions(): string {
    // Basic section options - can be expanded based on content analysis
    const sections = [
      { value: '', label: 'None' },
      { value: 'imports', label: 'Imports' },
      { value: 'functions', label: 'Functions' },
      { value: 'classes', label: 'Classes' },
      { value: 'exports', label: 'Exports' }
    ];

    return sections.map(section => 
      `<option value="${section.value}" ${section.value === this.highlightSection ? 'selected' : ''}>
        ${this.escapeHtml(section.label)}
      </option>`
    ).join('');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API methods
  public updateLanguage(language: string): void {
    this.setAttribute('language', language);
  }

  public updateTheme(theme: string): void {
    this.setAttribute('theme', theme);
  }

  public getCode(): string {
    return this.textContent?.trim() || '';
  }

  public setHighlightSection(section: string): void {
    this.setAttribute('highlight-section', section);
  }
}

// Register the custom element
customElements.define('syntax-highlighter-v3', SyntaxHighlighter);

export default SyntaxHighlighter; 