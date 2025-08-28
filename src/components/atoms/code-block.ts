/**
 * Code Block Web Component
 * Atomic Design: Atom
 * 
 * Enhanced code block with syntax highlighting support
 * Includes line numbers, highlighting, and copy button integration
 */
export class CodeBlock extends HTMLElement {
  private _originalContent = '';
  private _copyButton?: HTMLElement;

  static get observedAttributes() {
    return ['language', 'filename', 'highlight-lines', 'show-line-numbers'];
  }

  connectedCallback() {
    // Preserve original content before rendering
    // Support multiple ways to provide code content
    const scriptEl = this.querySelector('script[type="text/plain"]');
    const templateEl = this.querySelector('template');
    
    this._originalContent = this.getAttribute('code') 
      || scriptEl?.textContent 
      || templateEl?.innerHTML 
      || this.textContent 
      || '';
    
    this.render();
  }

  disconnectedCallback() {
    // Clean up references
    delete this._copyButton;
    this._originalContent = '';
  }

  attributeChangedCallback(_name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue !== newValue && this.isConnected) {
      this.render();
    }
  }

  render() {
    const language = this.getAttribute('language') || 'plaintext';
    const filename = this.getAttribute('filename') || '';
    const showLineNumbers = this.hasAttribute('show-line-numbers');
    const highlightLines = this.getAttribute('highlight-lines') || '';
    
    // Preserve author classes while adding component class
    this.classList.add('code-block');
    if (showLineNumbers) {
      this.classList.add('code-block--line-numbers');
    }
    
    // Clear content safely
    this.innerHTML = '';
    
    // Create header if filename exists
    if (filename) {
      const header = this.createHeader(filename, language);
      this.appendChild(header);
    }
    
    // Normalize the code (handle whitespace, dedent, etc)
    const normalizedCode = this.normalizeCode(this._originalContent);
    
    // Create content area
    const content = this.createContent(normalizedCode, language, showLineNumbers, highlightLines);
    this.appendChild(content);
  }

  private createHeader(filename: string, language: string): HTMLElement {
    const header = document.createElement('div');
    header.className = 'code-block__header';
    
    const filenameSpan = document.createElement('span');
    filenameSpan.className = 'code-block__filename';
    filenameSpan.textContent = filename;
    
    const languageSpan = document.createElement('span');
    languageSpan.className = 'code-block__language';
    languageSpan.textContent = language;
    
    header.appendChild(filenameSpan);
    header.appendChild(languageSpan);
    
    return header;
  }

  private normalizeCode(code: string): string {
    // Normalize line endings (CRLF -> LF)
    let normalized = code.replace(/\r\n?/g, '\n');
    
    // Split into lines
    const lines = normalized.split('\n');
    
    // Remove leading and trailing blank lines
    while (lines.length > 0 && lines[0]?.trim() === '') lines.shift();
    while (lines.length > 0 && lines[lines.length - 1]?.trim() === '') lines.pop();
    
    // Find common indentation and dedent
    const nonEmptyLines = lines.filter(l => l.trim().length > 0);
    if (nonEmptyLines.length === 0) return '';
    
    const indents = nonEmptyLines.map(l => {
      const match = l.match(/^[\s]*/);
      return match ? match[0].length : 0;
    });
    
    const minIndent = Math.min(...indents);
    
    // Remove common indentation from all lines
    const dedented = lines.map(l => l.slice(minIndent));
    
    return dedented.join('\n');
  }

  private createContent(code: string, language: string, showLineNumbers: boolean, highlightLines: string): HTMLElement {
    const container = document.createElement('div');
    container.className = 'code-block__content';
    
    // Create pre and code elements
    const pre = document.createElement('pre');
    pre.className = `language-${language}`;
    
    const codeEl = document.createElement('code');
    
    // Process lines (code is already normalized, don't trim again)
    const lines = code.split('\n');
    
    // If we need line numbers, create the line numbers container
    if (showLineNumbers) {
      const lineNumbersContainer = document.createElement('div');
      lineNumbersContainer.className = 'code-block__line-numbers';
      lineNumbersContainer.setAttribute('aria-hidden', 'true');
      
      lines.forEach((_, index) => {
        const lineNumEl = document.createElement('div');
        lineNumEl.textContent = String(index + 1);
        lineNumbersContainer.appendChild(lineNumEl);
      });
      
      container.appendChild(lineNumbersContainer);
    }
    
    // Now that we know length, bound the highlights
    const highlightedLines = this.parseHighlightLines(highlightLines, lines.length);
    
    // Process each line
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const isHighlighted = highlightedLines.includes(lineNum);
      
      const lineEl = document.createElement('span');
      lineEl.className = 'code-block__line';
      if (isHighlighted) {
        lineEl.classList.add('code-block__line--highlighted');
      }
      
      // Use textContent for safety (prevents XSS)
      lineEl.textContent = line;
      codeEl.appendChild(lineEl);
      
      // Add newline between lines (except last)
      if (index < lines.length - 1) {
        codeEl.appendChild(document.createTextNode('\n'));
      }
    });
    
    pre.appendChild(codeEl);
    container.appendChild(pre);
    
    // Add copy button
    const copyBtn = this.createCopyButton(code);
    container.appendChild(copyBtn);
    
    return container;
  }

  private createCopyButton(code: string): HTMLElement {
    // Check if copy-button component exists
    if (!customElements.get('copy-button')) {
      // Fallback to regular button if component not registered
      const btn = document.createElement('button');
      btn.className = 'copy-button code-block__copy';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Copy code');
      btn.textContent = 'Copy';
      
      btn.addEventListener('click', () => {
        this.copyToClipboard(code, btn);
      });
      
      this._copyButton = btn;
      return btn;
    }
    
    // Use copy-button component
    const copyBtn = document.createElement('copy-button');
    copyBtn.className = 'code-block__copy';
    copyBtn.setAttribute('compact', '');
    copyBtn.setAttribute('text', code);
    
    this._copyButton = copyBtn;
    return copyBtn;
  }

  private async copyToClipboard(text: string, button: HTMLElement) {
    try {
      await navigator.clipboard.writeText(text);
      
      // Show success state
      button.classList.add('copy-button--success');
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      
      // Reset after delay
      setTimeout(() => {
        button.classList.remove('copy-button--success');
        button.textContent = originalText;
      }, 2000);
    } catch (err) {
      // Show error state
      button.classList.add('copy-button--error');
      const originalText = button.textContent;
      button.textContent = 'Error';
      
      setTimeout(() => {
        button.classList.remove('copy-button--error');
        button.textContent = originalText;
      }, 2000);
    }
  }

  private parseHighlightLines(str: string, maxLine?: number): number[] {
    if (!str) return [];
    
    const out: number[] = [];
    const parts = str.split(',').map(s => s.trim()).filter(Boolean);
    
    for (const part of parts) {
      // Strict range "n-m" (accept reversed)
      if (/^\d+\s*-\s*\d+$/.test(part)) {
        const [startStr, endStr] = part.split('-');
        const start = parseInt((startStr || '').trim(), 10);
        const end = parseInt((endStr || '').trim(), 10);
        if (!isNaN(start) && !isNaN(end)) {
          const min = Math.min(start, end);
          const max = Math.max(start, end);
          for (let i = min; i <= max; i++) {
            out.push(i);
          }
        }
        continue;
      }
      // Single line "n"
      if (/^\d+$/.test(part)) {
        out.push(parseInt(part, 10));
      }
    }
    
    // Remove duplicates and filter by bounds
    let uniq = Array.from(new Set(out)).filter(n => n > 0);
    if (typeof maxLine === 'number' && maxLine > 0) {
      uniq = uniq.filter(n => n <= maxLine);
    }
    
    return uniq.sort((a, b) => a - b);
  }
}

// Register component
if (!customElements.get('code-block')) {
  customElements.define('code-block', CodeBlock);
}