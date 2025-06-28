import '../tokenizer/syntax-highlighter-v3.js';

class SyntaxHighlighterWithThemes extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentTheme = localStorage.getItem('syntax-theme') || 'port8080-theme';
  }

  connectedCallback() {
    this.language = this.getAttribute('language') || 'javascript';
    this.highlightMode = this.getAttribute('highlight-mode') || 'default';
    this.highlightSection = this.getAttribute('highlight-section') || '';
    this.showThemeSelector = this.getAttribute('show-theme-selector') !== 'false';
    this.render();
  }

  render() {
    const code = this.textContent.trim();
    
    // Escape the code for HTML
    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };
    
    const escapedCode = escapeHtml(code);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 1rem 0;
        }
        
        .highlighter-wrapper {
          position: relative;
        }
        
        .code-block-container {
          border: 1px solid var(--code-border, #30363d);
          border-radius: 8px;
          overflow: hidden;
          background: var(--code-background, #0d1117);
        }
        
        .custom-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          background: var(--header-background, #161b22);
          border-bottom: 1px solid var(--code-border, #30363d);
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          font-size: 0.875rem;
          color: var(--header-color, #8b949e);
        }
        
        .header-left, .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          pointer-events: auto;
        }

        .header-right {
           position: relative;
        }
        
        .language-badge {
          background: rgba(255, 133, 121, 0.1);
          color: #FF8579;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .theme-badge {
          background: rgba(13, 153, 255, 0.1);
          color: #0D99FF;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s;
          position: relative;
        }
        
        .theme-badge:hover {
          background: rgba(13, 153, 255, 0.2);
          border-color: #0D99FF;
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
        
        .theme-dropdown {
          display: none;
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          background: #1a1a1a;
          border: 1px solid #30363d;
          border-radius: 6px;
          padding: 4px;
          min-width: 150px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(12px);
          z-index: 10;
        }
        
        .theme-dropdown.show {
          display: block;
        }
        
        .theme-option {
          display: block;
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: transparent;
          border: none;
          color: #e1e1e1;
          cursor: pointer;
          text-align: left;
          font-size: 0.875rem;
          font-family: system-ui, -apple-system, sans-serif;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .theme-option:hover {
          background: rgba(13, 153, 255, 0.1);
          color: #0D99FF;
        }
        
        .theme-option.active {
          background: #0D99FF;
          color: white;
        }
        
        /* Remove margin from inner syntax-highlighter and adjust its wrapper */
        syntax-highlighter-v3 {
          margin: 0 !important;
          --code-border: transparent;
        }
        
        /* Theme Styles */
        .port8080-theme {
          --code-background: #161b22;
          --code-border: #30363d;
          --header-background: #10141a;
          --header-color: #9CA3AF;
        }
        
        .port8080-theme syntax-highlighter-v3 {
          --code-background: #161b22;
          --code-border: #30363d;
          --header-background: #10141a;
          --header-color: #9CA3AF;
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
        
        .github-dark-theme {
          --code-background: #0d1117;
          --code-border: #30363d;
          --header-background: #161b22;
          --header-color: #8b949e;
        }
        
        .github-dark-theme syntax-highlighter-v3 {
          --code-background: #0d1117;
          --code-border: #30363d;
          --header-background: #161b22;
          --header-color: #8b949e;
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
        
        .night-owl-theme {
          --code-background: #011627;
          --code-border: #011627;
          --header-background: #011627;
          --header-color: #d6deeb;
        }
        
        .night-owl-theme syntax-highlighter-v3 {
          --code-background: #011627;
          --code-border: #011627;
          --header-background: #011627;
          --header-color: #d6deeb;
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
        
        .monokai-theme {
          --code-background: #272822;
          --code-border: #272822;
          --header-background: #272822;
          --header-color: #f8f8f2;
        }
        
        .monokai-theme syntax-highlighter-v3 {
          --code-background: #272822;
          --code-border: #272822;
          --header-background: #272822;
          --header-color: #f8f8f2;
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

        .tokyo-night-theme {
          --code-background: #1a1b26;
          --code-border: #1a1b26;
          --header-background: #1a1b26;
          --header-color: #a9b1d6;
        }
        
        .tokyo-night-theme syntax-highlighter-v3 {
          --code-background: #1a1b26;
          --code-border: #1a1b26;
          --header-background: #1a1b26;
          --header-color: #a9b1d6;
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
        
        .minimal-light-theme {
          --code-background: #f6f8fa;
          --code-border: #e1e4e8;
          --header-background: #f6f8fa;
          --header-color: #586069;
        }
        
        .minimal-light-theme syntax-highlighter-v3 {
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
      </style>
      
      <div class="highlighter-wrapper" id="highlighter-wrapper">
        <div class="code-block-container">
          <div class="custom-header">
            <div class="header-left">
              <span class="language-badge">${this.language}</span>
            </div>
            <div class="header-right">
              ${this.showThemeSelector ? `
              <div class="theme-badge" id="theme-badge">
                Theme: <span id="current-theme-name">${this.getThemeDisplayName(this.currentTheme)}</span>
              </div>
              <div class="theme-dropdown" id="theme-dropdown">
                <button class="theme-option" data-theme="port8080-theme">port8080</button>
                <button class="theme-option" data-theme="github-dark-theme">GitHub Dark</button>
                <button class="theme-option" data-theme="night-owl-theme">Night Owl</button>
                <button class="theme-option" data-theme="monokai-theme">Monokai</button>
                <button class="theme-option" data-theme="tokyo-night-theme">Tokyo Night</button>
                <button class="theme-option" data-theme="minimal-light-theme">Minimal Light</button>
              </div>
              ` : ''}
              <button class="copy-button">Copy</button>
            </div>
          </div>
          <syntax-highlighter-v3 
            language="${this.language}"
            ${this.highlightMode !== 'default' ? `highlight-mode="${this.highlightMode}"` : ''}
            ${this.highlightSection ? `highlight-section="${this.highlightSection}"` : ''}
            hide-header="true"
            theme="${this.currentTheme}"
          >${escapedCode}</syntax-highlighter-v3>
        </div>
      </div>
    `;

    this.setupEventListeners();
    this.updateTheme(this.currentTheme);
  }

  setupEventListeners() {
    if (!this.showThemeSelector) return;

    const themeBadge = this.shadowRoot.getElementById('theme-badge');
    const themeDropdown = this.shadowRoot.getElementById('theme-dropdown');

    themeBadge?.addEventListener('click', (e) => {
      e.stopPropagation();
      themeDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      themeDropdown?.classList.remove('show');
    });

    this.shadowRoot.querySelectorAll('.theme-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.updateTheme(btn.dataset.theme);
        themeDropdown.classList.remove('show');
      });
    });

    window.addEventListener('syntax-theme-changed', (e) => {
      if (e.detail.theme !== this.currentTheme) {
        this.updateTheme(e.detail.theme);
      }
    });

    const copyButton = this.shadowRoot.querySelector('.copy-button');
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

  updateTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('syntax-theme', theme);

    const wrapper = this.shadowRoot.getElementById('highlighter-wrapper');
    wrapper.className = `highlighter-wrapper ${theme}`;

    this.shadowRoot.getElementById('current-theme-name').textContent = this.getThemeDisplayName(theme);

    this.shadowRoot.querySelectorAll('.theme-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.theme === theme);
    });

    window.dispatchEvent(new CustomEvent('syntax-theme-changed', { detail: { theme } }));
  }

  getThemeDisplayName(theme) {
    switch (theme) {
      case 'port8080-theme': return 'port8080';
      case 'github-dark-theme': return 'GitHub Dark';
      case 'night-owl-theme': return 'Night Owl';
      case 'monokai-theme': return 'Monokai';
      case 'tokyo-night-theme': return 'Tokyo Night';
      case 'minimal-light-theme': return 'Minimal Light';
      default: return 'port8080';
    }
  }
}

customElements.define('syntax-highlighter-with-themes', SyntaxHighlighterWithThemes);