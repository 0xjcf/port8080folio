import { Tokenizer } from './index.js';

class SyntaxHighlighter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.tokenizer = null;
  }

  connectedCallback() {
    this.language = this.getAttribute('language') || 'javascript';
    this.highlightMode = this.getAttribute('highlight-mode') || 'default';
    this.highlightSection = this.getAttribute('highlight-section') || '';
    this.hideHeader = this.getAttribute('hide-header') === 'true';
    this.theme = this.getAttribute('theme') || '';
    this.render();
  }

  render() {
    // Get the code, preserving formatting
    const code = this.textContent || '';

    // Create tokenizer with current settings
    this.tokenizer = new Tokenizer({
      language: this.language,
      theme: this.theme,
      highlightMode: this.highlightMode,
      highlightSection: this.highlightSection,
      wrapCode: false, // We'll wrap ourselves
      useAST: false // Start with token-based rendering
    });

    // Get highlighted code
    const highlightedCode = this.tokenizer.highlight(code);

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
        
        /* Highlight mode styles */
        :host([highlight-mode="section"]) {
          --section-highlight: #FFD866;
          --section-dim: #727072;
        }
        
        /* Theme CSS Variables */
        
        /* Port8080 Theme */
        :host([theme="port8080-theme"]) {
          --xstate-keyword: #FCD34D;
          --context-property: #F472B6;
          --event-property: #60A5FA;
          --state-name: #C084FC;
          --event-name: #34D399;
          --service-name: #14B8A6;
          --keyword: #0D99FF;
          --string: #34D399;
          --number: #FCD34D;
          --comment: #6B7280;
          --function: #C084FC;
          --operator: #9CA3AF;
          --punctuation: #9CA3AF;
          --variable: #60A5FA;
          --property: #47B4FF;
          --boolean: #FCD34D;
          --null: #C084FC;
          --default: #F5F5F5;
          --jsx-tag: #FF8579;
          --jsx-bracket: #FCD34D;
          --jsx-attribute: #34D399;
          --react-component: #61AFEF;
        }
        
        /* GitHub Dark Theme */
        :host([theme="github-dark-theme"]) {
          --xstate-keyword: #F0DB4F;
          --context-property: #E06C75;
          --event-property: #79B8FF;
          --state-name: #B392F0;
          --event-name: #5ED3F3;
          --service-name: #14B8A6;
          --keyword: #FF8579;
          --string: #9ECB88;
          --number: #79B8FF;
          --comment: #6A737D;
          --function: #F97583;
          --operator: #8B949E;
          --punctuation: #8B949E;
          --variable: #B392F0;
          --property: #79B8FF;
          --boolean: #79B8FF;
          --null: #B392F0;
          --default: #E1E4E8;
          --jsx-tag: #7EE787;
          --jsx-bracket: #79B8FF;
          --jsx-attribute: #F97583;
          --react-component: #B392F0;
        }
        
        /* Night Owl Theme */
        :host([theme="night-owl-theme"]) {
          --xstate-keyword: #FFEB95;
          --context-property: #FF6B9D;
          --event-property: #82AAFF;
          --state-name: #C792EA;
          --event-name: #7FDBCA;
          --service-name: #ADDB67;
          --keyword: #C792EA;
          --string: #ECC48D;
          --number: #F78C6C;
          --comment: #637777;
          --function: #82AAFF;
          --operator: #C792EA;
          --punctuation: #D6DEEB;
          --variable: #ADDB67;
          --property: #7FDBCA;
          --boolean: #FF6B9D;
          --null: #C792EA;
          --default: #D6DEEB;
          --jsx-tag: #CAECE9;
          --jsx-bracket: #80A4C2;
          --jsx-attribute: #C5E478;
          --react-component: #82AAFF;
        }
        
        /* Monokai Theme */
        :host([theme="monokai-theme"]) {
          --xstate-keyword: #FFD866;
          --context-property: #FF6188;
          --event-property: #78DCE8;
          --state-name: #AB9DF2;
          --event-name: #A9DC76;
          --service-name: #FC9867;
          --keyword: #FF6188;
          --string: #FFD866;
          --number: #AB9DF2;
          --comment: #727072;
          --function: #A9DC76;
          --operator: #FF6188;
          --punctuation: #FCFCFA;
          --variable: #FCFCFA;
          --property: #78DCE8;
          --boolean: #AB9DF2;
          --null: #AB9DF2;
          --default: #FCFCFA;
          --jsx-tag: #78DCE8;
          --jsx-bracket: #FFD866;
          --jsx-attribute: #A9DC76;
          --react-component: #78DCE8;
        }
        
        /* Tokyo Night Theme */
        :host([theme="tokyo-night-theme"]) {
          --xstate-keyword: #e0af68;
          --context-property: #f7768e;
          --event-property: #7dcfff;
          --state-name: #bb9af7;
          --event-name: #9ece6a;
          --service-name: #73daca;
          --keyword: #bb9af7;
          --string: #9ece6a;
          --number: #ff9e64;
          --comment: #565f89;
          --function: #7aa2f7;
          --operator: #89ddff;
          --punctuation: #a9b1d6;
          --variable: #c0caf5;
          --property: #7dcfff;
          --boolean: #ff9e64;
          --null: #bb9af7;
          --default: #a9b1d6;
          --jsx-tag: #7dcfff;
          --jsx-bracket: #89ddff;
          --jsx-attribute: #9ece6a;
          --react-component: #bb9af7;
        }
        
        /* Minimal Light Theme */
        :host([theme="minimal-light-theme"]) {
          --code-background: #f6f8fa;
          --code-border: #e1e4e8;
          --header-background: #f6f8fa;
          --header-color: #586069;
          --keyword: #d73a49;
          --string: #032f62;
          --number: #005cc5;
          --comment: #6a737d;
          --function: #6f42c1;
          --operator: #d73a49;
          --punctuation: #24292e;
          --variable: #e36209;
          --property: #e36209;
          --boolean: #005cc5;
          --null: #005cc5;
          --default: #24292e;
          --jsx-tag: #22863a;
          --jsx-bracket: #24292e;
          --jsx-attribute: #6f42c1;
          --react-component: #22863a;
          --xstate-keyword: #005cc5;
          --xstate-machine: #6f42c1;
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
          <span class="language-badge">${this.language}</span>
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

  setupEventListeners() {
    const copyButton = this.shadowRoot.querySelector('.copy-button');
    if (copyButton) {
      copyButton.addEventListener('click', () => {
        const code = this.textContent.trim();
        navigator.clipboard.writeText(code).then(() => {
          const originalText = copyButton.textContent;
          copyButton.textContent = 'Copied!';
          copyButton.classList.add('copied');
          setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.classList.remove('copied');
          }, 2000);
        });
      });
    }

    const sectionSelect = this.shadowRoot.querySelector('.highlight-toggle select');
    if (sectionSelect) {
      sectionSelect.value = this.highlightSection;
      sectionSelect.addEventListener('change', (e) => {
        this.highlightSection = e.target.value;
        this.setAttribute('highlight-section', this.highlightSection);
        this.render();
      });
    }
  }

  getSectionOptions() {
    // This would be dynamically generated based on the code content
    // For now, return some example options
    const sections = [
      { value: '', label: 'None' },
      { value: 'stateSection', label: 'State Definition' },
      { value: 'eventSection', label: 'Event Handlers' },
      { value: 'contextSection', label: 'Context' },
      { value: 'actionsSection', label: 'Actions' }
    ];

    return sections.map(section => 
      `<option value="${section.value}">${section.label}</option>`
    ).join('');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  static get observedAttributes() {
    return ['language', 'highlight-mode', 'highlight-section', 'hide-header', 'theme'];
  }
}

customElements.define('syntax-highlighter-v3', SyntaxHighlighter);

export default SyntaxHighlighter;