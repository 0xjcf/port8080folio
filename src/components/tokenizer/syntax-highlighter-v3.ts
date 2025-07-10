// ✅ REACTIVE: Actor-SPA Framework imports
import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, html, type RawHTML } from '../../framework/core/index.js';

// Import the Tokenizer class directly
import { Tokenizer } from './tokenizer.js';

// Enhanced type definitions without any types
// Interface for web components with observed attributes
interface WebComponentConstructor {
  observedAttributes: string[];
}

interface SyntaxHighlighterWithMethods {
  initializeFromAttributes(): void;
  setupEventHandlers(): void;
  handleCopyCode(): Promise<void>;
  observeAttributes(): void;
  updateLanguage(language: string): void;
  updateTheme(theme: string): void;
  getCode(): string;
  setHighlightSection(section: string): void;
  // Methods from ReactiveComponent
  send(event: Record<string, unknown>): void;
  getCurrentState(): SnapshotFrom<typeof syntaxHighlighterMachine>;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  textContent: string | null;
}

// ✅ REACTIVE: Define types for XState machine
interface SyntaxHighlighterContext {
  language: string;
  highlightMode: string;
  highlightSection: string;
  hideHeader: boolean;
  theme: string;
  code: string;
  highlightedCode: string;
  copyStatus: 'idle' | 'copying' | 'copied';
  error: string | null;
}

type SyntaxHighlighterEvent =
  | { type: 'UPDATE_LANGUAGE'; language: string }
  | { type: 'UPDATE_THEME'; theme: string }
  | { type: 'UPDATE_HIGHLIGHT_MODE'; mode: string }
  | { type: 'UPDATE_HIGHLIGHT_SECTION'; section: string }
  | { type: 'UPDATE_CODE'; code: string }
  | { type: 'COPY_CODE' }
  | { type: 'COPY_SUCCESS' }
  | { type: 'COPY_ERROR'; error: string }
  | { type: 'HIGHLIGHT_SECTION_CHANGE'; section: string }
  | { type: 'TOGGLE_HEADER' };

// ✅ REACTIVE: Create XState machine for syntax highlighter
const syntaxHighlighterMachine = setup({
  types: {
    context: {} as SyntaxHighlighterContext,
    events: {} as SyntaxHighlighterEvent,
  },
  actions: {
    updateLanguage: assign({
      language: ({ event }) => {
        if (event.type === 'UPDATE_LANGUAGE') return event.language;
        return 'javascript';
      },
    }),
    updateTheme: assign({
      theme: ({ event }) => {
        if (event.type === 'UPDATE_THEME') return event.theme;
        return 'port8080-theme';
      },
    }),
    updateHighlightMode: assign({
      highlightMode: ({ event }) => {
        if (event.type === 'UPDATE_HIGHLIGHT_MODE') return event.mode;
        return 'default';
      },
    }),
    updateHighlightSection: assign({
      highlightSection: ({ event }) => {
        if (
          event.type === 'UPDATE_HIGHLIGHT_SECTION' ||
          event.type === 'HIGHLIGHT_SECTION_CHANGE'
        ) {
          return 'section' in event ? event.section : '';
        }
        return '';
      },
    }),
    updateCode: assign({
      code: ({ event }) => {
        if (event.type === 'UPDATE_CODE') return event.code;
        return '';
      },
    }),
    startCopy: assign({
      copyStatus: 'copying' as const,
    }),
    copySuccess: assign({
      copyStatus: 'copied' as const,
    }),
    copyError: assign({
      copyStatus: 'idle' as const,
      error: ({ event }) => {
        if (event.type === 'COPY_ERROR') return event.error;
        return null;
      },
    }),
    resetCopy: assign({
      copyStatus: 'idle',
      error: null,
    }),
    toggleHeader: assign({
      hideHeader: ({ context }) => !context.hideHeader,
    }),
    generateHighlightedCode: assign({
      highlightedCode: ({ context }) => {
        try {
          // Create tokenizer with current settings
          const tokenizer = new Tokenizer(context.code, {
            lexerOptions: { language: context.language },
            rendererOptions: { theme: context.theme },
            enableAST: false,
          });
          return tokenizer.render();
        } catch (error) {
          return `<span class="error">Error highlighting code: ${error instanceof Error ? error.message : 'Unknown error'}</span>`;
        }
      },
    }),
  },
  guards: {
    canCopy: ({ context }) => {
      return context.code.trim().length > 0;
    },
  },
}).createMachine({
  id: 'syntax-highlighter-v3',
  initial: 'idle',
  context: {
    language: 'javascript',
    highlightMode: 'default',
    highlightSection: '',
    hideHeader: false,
    theme: 'port8080-theme',
    code: '',
    highlightedCode: '',
    copyStatus: 'idle',
    error: null,
  },
  states: {
    idle: {
      entry: ['generateHighlightedCode'],
      on: {
        UPDATE_LANGUAGE: {
          actions: ['updateLanguage', 'generateHighlightedCode'],
        },
        UPDATE_THEME: {
          actions: ['updateTheme', 'generateHighlightedCode'],
        },
        UPDATE_HIGHLIGHT_MODE: {
          actions: ['updateHighlightMode', 'generateHighlightedCode'],
        },
        UPDATE_HIGHLIGHT_SECTION: {
          actions: ['updateHighlightSection', 'generateHighlightedCode'],
        },
        UPDATE_CODE: {
          actions: ['updateCode', 'generateHighlightedCode'],
        },
        HIGHLIGHT_SECTION_CHANGE: {
          actions: ['updateHighlightSection', 'generateHighlightedCode'],
        },
        TOGGLE_HEADER: {
          actions: 'toggleHeader',
        },
        COPY_CODE: {
          target: 'copying',
          guard: 'canCopy',
          actions: 'startCopy',
        },
      },
    },
    copying: {
      // ✅ REACTIVE: Use machine delayed transition instead of setTimeout
      after: {
        100: {
          target: 'copied',
          actions: 'copySuccess',
        },
      },
      on: {
        COPY_ERROR: {
          target: 'idle',
          actions: 'copyError',
        },
      },
    },
    copied: {
      // ✅ REACTIVE: Auto-reset after 2 seconds using machine timing
      after: {
        2000: {
          target: 'idle',
          actions: 'resetCopy',
        },
      },
    },
  },
});

// ✅ REACTIVE: Helper function for section options
const getSectionOptions = (currentSection: string): string => {
  const sections = [
    { value: '', label: 'None' },
    { value: 'imports', label: 'Imports' },
    { value: 'functions', label: 'Functions' },
    { value: 'classes', label: 'Classes' },
    { value: 'exports', label: 'Exports' },
  ];

  return sections
    .map(
      (section) =>
        `<option value="${section.value}" ${section.value === currentSection ? 'selected' : ''}>
      ${section.label}
    </option>`
    )
    .join('');
};

// ✅ REACTIVE: Extract header controls template to reduce nesting
const renderHeaderControls = (
  highlightMode: string,
  highlightSection: string,
  copyStatus: string
): RawHTML => {
  const sectionToggle =
    highlightMode === 'section' &&
    html`
    <div class="highlight-toggle">
      <label>Highlight:</label>
      <select send="HIGHLIGHT_SECTION_CHANGE" section=${highlightSection}>
        ${getSectionOptions(highlightSection)}
      </select>
    </div>
  `;

  const copyButtonText =
    copyStatus === 'copying' ? 'Copying...' : copyStatus === 'copied' ? 'Copied!' : 'Copy';

  return html`
    ${sectionToggle}
    <button 
      class="copy-button ${copyStatus === 'copied' && 'copied'}" 
      send="COPY_CODE"
      data-state=${copyStatus}
    >
      ${copyButtonText}
    </button>
  `;
};

// ✅ REACTIVE: Extract header template to reduce nesting
const renderCodeHeader = (
  language: string,
  highlightMode: string,
  highlightSection: string,
  copyStatus: string
): RawHTML => html`
  <div class="code-header">
    <span class="language-badge">${language}</span>
    <div class="header-controls">
      ${renderHeaderControls(highlightMode, highlightSection, copyStatus)}
    </div>
  </div>
`;

// ✅ REACTIVE: Extract error message template
const renderErrorMessage = (error: string | null): RawHTML => {
  if (!error) return html``;
  return html`<div class="error-message" role="alert">${error}</div>`;
};

// ✅ REACTIVE: Pure template function
const syntaxHighlighterTemplate = (
  state: SnapshotFrom<typeof syntaxHighlighterMachine>
): RawHTML => {
  const { context } = state;
  const {
    language,
    highlightMode,
    highlightSection,
    hideHeader,
    theme,
    highlightedCode,
    copyStatus,
    error,
  } = context;

  return html`
    <div class="code-block-wrapper" data-theme=${theme}>
      ${!hideHeader ? renderCodeHeader(language, highlightMode, highlightSection, copyStatus) : ''}
      
      <pre><code>${highlightedCode}</code></pre>
      
      ${renderErrorMessage(error)}
    </div>
  `;
};

// ✅ REACTIVE: CSS styles (extracted from original component)
const syntaxHighlighterStyles = `
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
  
  .error-message {
    padding: 0.5rem 1rem;
    background: rgba(220, 38, 38, 0.1);
    border-top: 1px solid #dc2626;
    color: #fca5a5;
    font-size: 0.875rem;
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
`;

// Create base component using Actor-SPA framework
const SyntaxHighlighterBase = createComponent({
  machine: syntaxHighlighterMachine,
  template: syntaxHighlighterTemplate,
  styles: syntaxHighlighterStyles,
});

// Extend the component with additional methods
class SyntaxHighlighterComponent
  extends SyntaxHighlighterBase
  implements SyntaxHighlighterWithMethods
{
  connectedCallback() {
    super.connectedCallback();
    this.initializeFromAttributes();
    this.setupEventHandlers();
    this.observeAttributes();
  }

  // The methods will be added to the prototype below
  initializeFromAttributes!: () => void;
  setupEventHandlers!: () => void;
  handleCopyCode!: () => Promise<void>;
  observeAttributes!: () => void;
  updateLanguage!: (language: string) => void;
  updateTheme!: (theme: string) => void;
  getCode!: () => string;
  setHighlightSection!: (section: string) => void;
}

// Add custom methods to component prototype for backward compatibility
SyntaxHighlighterComponent.prototype.initializeFromAttributes = function (
  this: SyntaxHighlighterComponent
) {
  // Initialize with current content
  const code = this.textContent?.trim() || '';
  if (code) {
    this.send({ type: 'UPDATE_CODE', code });
  }

  // Initialize from current state defaults instead of DOM attributes
  const currentState = this.getCurrentState();
  const language = currentState.context.language;
  const theme = currentState.context.theme;
  const highlightMode = currentState.context.highlightMode;
  const highlightSection = currentState.context.highlightSection;
  const hideHeader = currentState.context.hideHeader;

  // Only send events if values differ from defaults
  if (language !== 'javascript') {
    this.send({ type: 'UPDATE_LANGUAGE', language });
  }
  if (theme !== 'port8080-theme') {
    this.send({ type: 'UPDATE_THEME', theme });
  }
  if (highlightMode !== 'default') {
    this.send({ type: 'UPDATE_HIGHLIGHT_MODE', mode: highlightMode });
  }
  if (highlightSection) {
    this.send({ type: 'UPDATE_HIGHLIGHT_SECTION', section: highlightSection });
  }
  if (hideHeader) {
    this.send({ type: 'TOGGLE_HEADER' });
  }
};

// Setup event handlers
SyntaxHighlighterComponent.prototype.setupEventHandlers = function (
  this: SyntaxHighlighterComponent
) {
  // Event handlers are managed declaratively through the template
  // This method exists for backward compatibility
};

// Copy functionality with native clipboard API
SyntaxHighlighterComponent.prototype.handleCopyCode = async function (
  this: SyntaxHighlighterComponent
) {
  const currentState = this.getCurrentState();
  const code = currentState.context.code;

  try {
    await navigator.clipboard.writeText(code);
    this.send({ type: 'COPY_SUCCESS' });
  } catch (error) {
    this.send({
      type: 'COPY_ERROR',
      error: error instanceof Error ? error.message : 'Failed to copy',
    });
  }
};

// Attribute observation - use state-based approach instead of DOM manipulation
SyntaxHighlighterComponent.prototype.observeAttributes = function (
  this: SyntaxHighlighterComponent
) {
  // Use state changes to track attribute updates instead of DOM observation
  // This method exists for backward compatibility but relies on state management
  const currentState = this.getCurrentState();

  // React to state changes through the machine instead of DOM mutation observation
  // The component state is the single source of truth
  console.log('Attribute observation setup - using state-based approach', currentState.context);
};

// Public API methods (backward compatibility) - use state instead of DOM manipulation
SyntaxHighlighterComponent.prototype.updateLanguage = function (
  this: SyntaxHighlighterComponent,
  language: string
) {
  this.send({ type: 'UPDATE_LANGUAGE', language });
};

SyntaxHighlighterComponent.prototype.updateTheme = function (
  this: SyntaxHighlighterComponent,
  theme: string
) {
  this.send({ type: 'UPDATE_THEME', theme });
};

SyntaxHighlighterComponent.prototype.getCode = function (this: SyntaxHighlighterComponent) {
  const currentState = this.getCurrentState();
  return currentState.context.code;
};

SyntaxHighlighterComponent.prototype.setHighlightSection = function (
  this: SyntaxHighlighterComponent,
  section: string
) {
  this.send({ type: 'UPDATE_HIGHLIGHT_SECTION', section });
};

// Add observed attributes with proper typing
(SyntaxHighlighterComponent.constructor as unknown as WebComponentConstructor).observedAttributes =
  ['language', 'highlight-mode', 'highlight-section', 'hide-header', 'theme'];

// Register the component
customElements.define('syntax-highlighter-v3', SyntaxHighlighterComponent);

// Export the component as default
export default SyntaxHighlighterComponent;
