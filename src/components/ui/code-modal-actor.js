import { createMachine, createActor, assign, fromPromise } from 'https://cdn.jsdelivr.net/npm/xstate@5/+esm';
import { uiOrchestrator } from './ui-orchestrator.js';
import { Tokenizer } from '../tokenizer/index.js';

// Code Display State Machine
export const codeDisplayMachine = createMachine({
    id: 'codeDisplay',
    initial: 'inline',
    context: {
        code: '',
        language: 'javascript',
        theme: 'port8080',
        scrollPosition: { x: 0, y: 0 },
        fontSize: 14,
        wordWrap: false,
        elementId: null,
        modalElement: null
    },
    states: {
        inline: {
            on: {
                EXPAND: {
                    target: 'expandingToModal',
                    actions: 'captureInlineState'
                },
                SCROLL: {
                    actions: 'updateScrollPosition'
                },
                TOUCH_SCROLL: {
                    actions: 'updateScrollPosition'
                }
            }
        },
        expandingToModal: {
            entry: ['createModal', 'prepareModalTransition'],
            invoke: {
                src: 'animateModalOpen',
                onDone: 'modal'
            }
        },
        modal: {
            entry: ['showModal', 'enableFullscreenFeatures', 'notifyOrchestrator'],
            exit: ['removeModal', 'notifyOrchestratorClosed'],
            on: {
                CLOSE: 'closingModal',
                CHANGE_THEME: {
                    actions: 'updateTheme'
                },
                COPY_CODE: {
                    actions: 'copyToClipboard'
                },
                TOGGLE_WORDWRAP: {
                    actions: 'toggleWordWrap'
                },
                INCREASE_FONT: {
                    actions: 'increaseFontSize'
                },
                DECREASE_FONT: {
                    actions: 'decreaseFontSize'
                },
                ESCAPE: 'closingModal'
            }
        },
        closingModal: {
            entry: 'prepareCloseTransition',
            invoke: {
                src: 'animateModalClose',
                onDone: 'inline'
            },
            exit: 'restoreInlineState'
        }
    }
}, {
    actions: {
        captureInlineState: assign({
            code: ({ context, event }) => event.code,
            language: ({ context, event }) => event.language,
            theme: ({ context, event }) => event.theme,
            elementId: ({ context, event }) => event.elementId,
            scrollPosition: ({ context, event }) => ({
                x: event.scrollX || 0,
                y: event.scrollY || 0
            })
        }),
        updateScrollPosition: assign({
            scrollPosition: ({ context, event }) => ({
                x: event.x || context.scrollPosition.x,
                y: event.y || context.scrollPosition.y
            })
        }),
        createModal: ({ context }) => {
            const modal = document.createElement('div');
            modal.className = 'code-modal-container';
            modal.innerHTML = `
        <div class="code-modal-backdrop"></div>
        <div class="code-modal">
          <div class="code-modal-header">
            <div class="code-modal-title">
              <span class="code-modal-language">${context.language}</span>
              <span class="code-modal-filename">${context.elementId || 'Code'}</span>
            </div>
            <div class="code-modal-controls">
              <button class="code-modal-control" data-action="decrease-font" aria-label="Decrease font size">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </button>
              <span class="code-modal-font-size">${context.fontSize}px</span>
              <button class="code-modal-control" data-action="increase-font" aria-label="Increase font size">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="11" y1="8" x2="11" y2="14"/>
                  <line x1="8" y1="11" x2="14" y2="11"/>
                </svg>
              </button>
              <div class="code-modal-separator"></div>
              <button class="code-modal-control ${context.wordWrap ? 'active' : ''}" data-action="word-wrap" aria-label="Toggle word wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M3 12h15a3 3 0 010 6h-4m0 0l2-2m-2 2l2 2M3 18h7"/>
                </svg>
              </button>
              <select class="code-modal-theme-select" aria-label="Select theme">
                <option value="port8080" ${context.theme === 'port8080' ? 'selected' : ''}>Port8080</option>
                <option value="github-dark" ${context.theme === 'github-dark' ? 'selected' : ''}>GitHub Dark</option>
                <option value="night-owl" ${context.theme === 'night-owl' ? 'selected' : ''}>Night Owl</option>
                <option value="monokai" ${context.theme === 'monokai' ? 'selected' : ''}>Monokai</option>
                <option value="tokyo-night" ${context.theme === 'tokyo-night' ? 'selected' : ''}>Tokyo Night</option>
                <option value="minimal-light" ${context.theme === 'minimal-light' ? 'selected' : ''}>Minimal Light</option>
              </select>
              <button class="code-modal-control" data-action="copy" aria-label="Copy code">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              </button>
              <button class="code-modal-control code-modal-close" data-action="close" aria-label="Close modal">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="code-modal-body">
            <div class="code-modal-content">
              <pre><code></code></pre>
            </div>
          </div>
        </div>
      `;

            document.body.appendChild(modal);
            context.modalElement = modal;

            // Apply highlighted code
            const codeElement = modal.querySelector('code');
            const tokenizer = new Tokenizer({
                language: context.language,
                theme: context.theme
            });
            codeElement.innerHTML = tokenizer.highlight(context.code);
        },
        prepareModalTransition: ({ context }) => {
            if (context.modalElement) {
                context.modalElement.classList.add('preparing');
            }
        },
        showModal: ({ context }) => {
            if (context.modalElement) {
                context.modalElement.classList.add('visible');

                // Set initial font size
                const pre = context.modalElement.querySelector('pre');
                if (pre) {
                    pre.style.fontSize = `${context.fontSize}px`;
                }

                // Setup event listeners
                const controls = context.modalElement.querySelectorAll('[data-action]');
                controls.forEach(control => {
                    control.addEventListener('click', (e) => {
                        const action = e.currentTarget.dataset.action;
                        window.dispatchEvent(new CustomEvent('code-modal-action', {
                            detail: { action, modalId: context.elementId }
                        }));
                    });
                });

                const themeSelect = context.modalElement.querySelector('.code-modal-theme-select');
                themeSelect?.addEventListener('change', (e) => {
                    window.dispatchEvent(new CustomEvent('code-modal-theme', {
                        detail: { theme: e.target.value, modalId: context.elementId }
                    }));
                });

                // Focus management
                const firstControl = context.modalElement.querySelector('.code-modal-control');
                if (firstControl) {
                    firstControl.focus();
                }
            }
        },
        removeModal: ({ context }) => {
            if (context.modalElement) {
                context.modalElement.remove();
                context.modalElement = null;
            }
        },
        updateTheme: assign({
            theme: ({ context, event }) => {
                const newTheme = event.theme;
                if (context.modalElement) {
                    const codeElement = context.modalElement.querySelector('code');
                    const tokenizer = new Tokenizer({
                        language: context.language,
                        theme: newTheme
                    });
                    codeElement.innerHTML = tokenizer.highlight(context.code);
                }
                return newTheme;
            }
        }),
        toggleWordWrap: assign({
            wordWrap: ({ context }) => {
                const newWordWrap = !context.wordWrap;
                if (context.modalElement) {
                    const pre = context.modalElement.querySelector('pre');
                    const button = context.modalElement.querySelector('[data-action="word-wrap"]');
                    if (pre) {
                        pre.style.whiteSpace = newWordWrap ? 'pre-wrap' : 'pre';
                        pre.style.wordBreak = newWordWrap ? 'break-word' : 'normal';
                    }
                    if (button) {
                        button.classList.toggle('active', newWordWrap);
                    }
                }
                return newWordWrap;
            }
        }),
        increaseFontSize: assign({
            fontSize: ({ context }) => {
                const newSize = Math.min(context.fontSize + 2, 24);
                if (context.modalElement) {
                    const pre = context.modalElement.querySelector('pre');
                    const sizeDisplay = context.modalElement.querySelector('.code-modal-font-size');
                    if (pre) {
                        pre.style.fontSize = `${newSize}px`;
                    }
                    if (sizeDisplay) {
                        sizeDisplay.textContent = `${newSize}px`;
                    }
                }
                return newSize;
            }
        }),
        decreaseFontSize: assign({
            fontSize: ({ context }) => {
                const newSize = Math.max(context.fontSize - 2, 10);
                if (context.modalElement) {
                    const pre = context.modalElement.querySelector('pre');
                    const sizeDisplay = context.modalElement.querySelector('.code-modal-font-size');
                    if (pre) {
                        pre.style.fontSize = `${newSize}px`;
                    }
                    if (sizeDisplay) {
                        sizeDisplay.textContent = `${newSize}px`;
                    }
                }
                return newSize;
            }
        }),
        copyToClipboard: async ({ context }) => {
            try {
                await navigator.clipboard.writeText(context.code);

                // Show success feedback
                const copyButton = context.modalElement?.querySelector('[data-action="copy"]');
                if (copyButton) {
                    copyButton.classList.add('copied');
                    const originalHTML = copyButton.innerHTML;
                    copyButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          `;

                    setTimeout(() => {
                        copyButton.classList.remove('copied');
                        copyButton.innerHTML = originalHTML;
                    }, 2000);
                }
            } catch (err) {
                console.error('Failed to copy code:', err);
            }
        },
        prepareCloseTransition: ({ context }) => {
            if (context.modalElement) {
                context.modalElement.classList.remove('visible');
            }
        },
        restoreInlineState: ({ context }) => {
            // Restore scroll position if needed
            const originalElement = document.getElementById(context.elementId);
            if (originalElement) {
                const pre = originalElement.querySelector('pre');
                if (pre) {
                    pre.scrollLeft = context.scrollPosition.x;
                    pre.scrollTop = context.scrollPosition.y;
                }
            }
        },
        notifyOrchestrator: ({ context }) => {
            uiOrchestrator.openModal(`code-${context.elementId}`);
        },
        notifyOrchestratorClosed: ({ context }) => {
            uiOrchestrator.closeModal(`code-${context.elementId}`);
        }
    },
    actors: {
        animateModalOpen: fromPromise(async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
        }),
        animateModalClose: fromPromise(async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
        })
    }
});

// Enhance syntax highlighter components for mobile
export function enhanceCodeBlockForMobile(syntaxHighlighter) {
    if (!uiOrchestrator.isMobile()) return;

    const actor = createActor(codeDisplayMachine);
    actor.start();

    // Add expand button for mobile
    const expandButton = document.createElement('button');
    expandButton.className = 'code-expand-button';
    expandButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
    </svg>
    <span>View Full Code</span>
  `;
    expandButton.setAttribute('aria-label', 'View code in fullscreen');

    // Add to code header
    const header = syntaxHighlighter.shadowRoot.querySelector('.code-header');
    if (header) {
        const controls = header.querySelector('.header-controls') || header;
        controls.insertBefore(expandButton, controls.firstChild);
    }

    // Handle expand
    expandButton.addEventListener('click', () => {
        const code = syntaxHighlighter.textContent.trim();
        const language = syntaxHighlighter.getAttribute('language') || 'javascript';
        const theme = syntaxHighlighter.getAttribute('theme') || 'port8080';
        const pre = syntaxHighlighter.shadowRoot.querySelector('pre');

        actor.send({
            type: 'EXPAND',
            code,
            language,
            theme,
            elementId: syntaxHighlighter.id || 'code-block',
            scrollX: pre?.scrollLeft || 0,
            scrollY: pre?.scrollTop || 0
        });
    });

    // Handle modal events
    window.addEventListener('code-modal-action', (e) => {
        if (e.detail.modalId === (syntaxHighlighter.id || 'code-block')) {
            switch (e.detail.action) {
                case 'close':
                    actor.send({ type: 'CLOSE' });
                    break;
                case 'copy':
                    actor.send({ type: 'COPY_CODE' });
                    break;
                case 'word-wrap':
                    actor.send({ type: 'TOGGLE_WORDWRAP' });
                    break;
                case 'increase-font':
                    actor.send({ type: 'INCREASE_FONT' });
                    break;
                case 'decrease-font':
                    actor.send({ type: 'DECREASE_FONT' });
                    break;
            }
        }
    });

    window.addEventListener('code-modal-theme', (e) => {
        if (e.detail.modalId === (syntaxHighlighter.id || 'code-block')) {
            actor.send({ type: 'CHANGE_THEME', theme: e.detail.theme });
        }
    });

    // Handle escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && actor.getSnapshot().matches('modal')) {
            actor.send({ type: 'ESCAPE' });
        }
    });

    return actor;
}

// Add global styles for code modal
const style = document.createElement('style');
style.textContent = `
  .code-expand-button {
    display: none;
    align-items: center;
    gap: 0.25rem;
    background: transparent;
    border: 1px solid var(--code-border);
    color: var(--header-color);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.75rem;
    transition: all 0.2s ease;
  }
  
  @media (max-width: 768px) {
    .code-expand-button {
      display: flex;
    }
  }
  
  .code-expand-button:hover {
    background: rgba(13, 153, 255, 0.1);
    border-color: var(--jasper);
    color: var(--jasper);
  }
  
  .code-modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }
  
  .code-modal-container.preparing {
    visibility: visible;
  }
  
  .code-modal-container.visible {
    opacity: 1;
    visibility: visible;
  }
  
  .code-modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
  }
  
  .code-modal {
    position: relative;
    width: 95%;
    height: 95%;
    max-width: 1200px;
    background: var(--secondary-bg);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    transform: scale(0.9);
    transition: transform 0.3s ease;
  }
  
  .code-modal-container.visible .code-modal {
    transform: scale(1);
  }
  
  .code-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .code-modal-title {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .code-modal-language {
    background: rgba(13, 153, 255, 0.1);
    color: var(--jasper);
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .code-modal-filename {
    color: var(--teagreen);
    font-size: 0.875rem;
  }
  
  .code-modal-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .code-modal-control {
    background: transparent;
    border: none;
    color: var(--teagreen);
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .code-modal-control:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--jasper);
  }
  
  .code-modal-control.active {
    background: rgba(13, 153, 255, 0.2);
    color: var(--jasper);
  }
  
  .code-modal-control.copied {
    background: rgba(52, 211, 153, 0.2);
    color: #34D399;
  }
  
  .code-modal-font-size {
    color: var(--teagreen);
    font-size: 0.75rem;
    min-width: 40px;
    text-align: center;
  }
  
  .code-modal-separator {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
  }
  
  .code-modal-theme-select {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--teagreen);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    cursor: pointer;
  }
  
  .code-modal-theme-select:hover {
    border-color: var(--jasper);
  }
  
  .code-modal-close {
    margin-left: 0.5rem;
  }
  
  .code-modal-body {
    flex: 1;
    overflow: hidden;
    position: relative;
  }
  
  .code-modal-content {
    height: 100%;
    overflow: auto;
  }
  
  .code-modal-content pre {
    margin: 0;
    padding: 1.5rem;
    min-height: 100%;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
    line-height: 1.6;
    background: var(--code-background, #0d1117);
  }
  
  .code-modal-content code {
    display: block;
  }
  
  /* Mobile optimizations */
  @media (max-width: 768px) {
    .code-modal {
      width: 100%;
      height: 100%;
      border-radius: 0;
    }
    
    .code-modal-header {
      padding: 0.75rem;
    }
    
    .code-modal-controls {
      gap: 0.25rem;
    }
    
    .code-modal-control {
      padding: 0.375rem;
    }
    
    .code-modal-content pre {
      padding: 1rem;
    }
  }
`;
document.head.appendChild(style);

// Extend syntax highlighter components
if (typeof window !== 'undefined') {
    const SyntaxHighlighter = window.customElements.get('syntax-highlighter');

    if (SyntaxHighlighter) {
        SyntaxHighlighter.prototype.initMobileEnhancements = function () {
            if (uiOrchestrator.isMobile()) {
                this.codeModalActor = enhanceCodeBlockForMobile(this);
            }
        };
    }
} 