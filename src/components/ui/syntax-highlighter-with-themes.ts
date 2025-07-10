import { assign, type SnapshotFrom, setup } from 'xstate';
import { createComponent, css, html, type RawHTML } from '../../framework/core/index.js';

// Interface for web components with observed attributes
interface WebComponentConstructor {
  observedAttributes: string[];
}

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
  language: string;
  theme: string;
  showLineNumbers: boolean;
  copyButton: boolean;
  foldable: boolean;
  maxHeight: string;
}

interface CodeToken {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'operator' | 'function' | 'variable' | 'text';
  value: string;
  index: number;
}

interface SyntaxHighlighterContext {
  config: SyntaxHighlighterConfig;
  content: string;
  themes: Map<string, Theme>;
  currentTheme: Theme;
  copyStatus: 'idle' | 'copying' | 'copied';
  isFolded: boolean;
  tokens: CodeToken[];
  lines: string[];
  error: string | null;
}

type SyntaxHighlighterEvent =
  | { type: 'SET_CONTENT'; content: string }
  | { type: 'CHANGE_THEME'; theme: string }
  | { type: 'COPY_CODE' }
  | { type: 'COPY_SUCCESS' }
  | { type: 'COPY_ERROR'; error: string }
  | { type: 'TOGGLE_FOLD' }
  | { type: 'UPDATE_CONFIG'; config: Partial<SyntaxHighlighterConfig> }
  | { type: 'RESET_COPY_STATUS' };

const initializeThemes = (): Map<string, Theme> => {
  const themes = new Map<string, Theme>();

  // VS Code Dark Theme
  themes.set('vscode-dark', {
    name: 'VS Code Dark',
    colors: {
      background: '#1e1e1e',
      text: '#d4d4d4',
      keyword: '#569cd6',
      string: '#ce9178',
      comment: '#6a9955',
      number: '#b5cea8',
      operator: '#d4d4d4',
      function: '#dcdcaa',
    },
  });

  // GitHub Light Theme
  themes.set('github-light', {
    name: 'GitHub Light',
    colors: {
      background: '#ffffff',
      text: '#24292e',
      keyword: '#d73a49',
      string: '#032f62',
      comment: '#6a737d',
      number: '#005cc5',
      operator: '#d73a49',
      function: '#6f42c1',
    },
  });

  // Dracula Theme
  themes.set('dracula', {
    name: 'Dracula',
    colors: {
      background: '#282a36',
      text: '#f8f8f2',
      keyword: '#ff79c6',
      string: '#f1fa8c',
      comment: '#6272a4',
      number: '#bd93f9',
      operator: '#ff79c6',
      function: '#50fa7b',
    },
  });

  // Monokai Theme
  themes.set('monokai', {
    name: 'Monokai',
    colors: {
      background: '#272822',
      text: '#f8f8f2',
      keyword: '#f92672',
      string: '#e6db74',
      comment: '#75715e',
      number: '#ae81ff',
      operator: '#f92672',
      function: '#a6e22e',
    },
  });

  return themes;
};

const tokenizeCode = (code: string): CodeToken[] => {
  const tokens: CodeToken[] = [];

  const patterns = {
    keyword:
      /\b(const|let|var|function|class|if|else|for|while|return|import|export|from|default|async|await|try|catch|finally|throw|new|this|super|extends|implements|interface|type|enum|namespace|public|private|protected|static|readonly|abstract)\b/g,
    string: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
    comment: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
    number: /\b\d+\.?\d*\b/g,
    function: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/g,
    operator: /[+\-*/%=<>!&|?:.,;{}()[\]]/g,
  };

  const allMatches: Array<{ type: keyof typeof patterns; match: RegExpMatchArray }> = [];

  for (const [type, pattern] of Object.entries(patterns)) {
    let match: RegExpExecArray | null = pattern.exec(code);
    while (match !== null) {
      allMatches.push({ type: type as keyof typeof patterns, match });
      match = pattern.exec(code);
    }
  }

  // Sort matches by index
  allMatches.sort((a, b) => (a.match.index ?? 0) - (b.match.index ?? 0));

  // Create tokens
  let currentIndex = 0;
  for (const { type, match } of allMatches) {
    const matchIndex = match.index ?? 0;
    if (matchIndex > currentIndex) {
      // Add text token for unmatched content
      tokens.push({
        type: 'text',
        value: code.slice(currentIndex, matchIndex),
        index: currentIndex,
      });
    }

    // Add matched token
    tokens.push({
      type: type === 'function' ? 'function' : type,
      value: match[0],
      index: matchIndex,
    });

    currentIndex = matchIndex + match[0].length;
  }

  // Add remaining text
  if (currentIndex < code.length) {
    tokens.push({
      type: 'text',
      value: code.slice(currentIndex),
      index: currentIndex,
    });
  }

  return tokens;
};

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const syntaxHighlighterMachine = setup({
  types: {
    context: {} as SyntaxHighlighterContext,
    events: {} as SyntaxHighlighterEvent,
  },
  actions: {
    setContent: assign({
      content: ({ event }) => {
        if (event.type === 'SET_CONTENT') return event.content;
        return '';
      },
      lines: ({ event }) => {
        if (event.type === 'SET_CONTENT') return event.content.split('\n');
        return [];
      },
      tokens: ({ event }) => {
        if (event.type === 'SET_CONTENT') return tokenizeCode(event.content);
        return [];
      },
    }),
    changeTheme: assign({
      config: ({ context, event }) => {
        if (event.type === 'CHANGE_THEME') {
          return { ...context.config, theme: event.theme };
        }
        return context.config;
      },
      currentTheme: ({ context, event }) => {
        if (event.type === 'CHANGE_THEME') {
          return context.themes.get(event.theme) || context.currentTheme;
        }
        return context.currentTheme;
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
    resetCopyStatus: assign({
      copyStatus: 'idle' as const,
      error: null,
    }),
    toggleFold: assign({
      isFolded: ({ context }) => !context.isFolded,
    }),
    updateConfig: assign({
      config: ({ context, event }) => {
        if (event.type === 'UPDATE_CONFIG') {
          return { ...context.config, ...event.config };
        }
        return context.config;
      },
    }),
  },
  guards: {
    canCopy: ({ context }) => context.content.trim().length > 0,
    isFoldable: ({ context }) => context.config.foldable,
  },
}).createMachine({
  id: 'syntax-highlighter-with-themes',
  initial: 'idle',
  context: {
    config: {
      language: 'javascript',
      theme: 'vscode-dark',
      showLineNumbers: true,
      copyButton: true,
      foldable: false,
      maxHeight: '400px',
    },
    content: '',
    themes: initializeThemes(),
    currentTheme: {
      name: 'VS Code Dark',
      colors: {
        background: '#1e1e1e',
        text: '#d4d4d4',
        keyword: '#569cd6',
        string: '#ce9178',
        comment: '#6a9955',
        number: '#b5cea8',
        operator: '#d4d4d4',
        function: '#dcdcaa',
      },
    },
    copyStatus: 'idle',
    isFolded: false,
    tokens: [],
    lines: [],
    error: null,
  },
  states: {
    idle: {
      on: {
        SET_CONTENT: {
          actions: 'setContent',
        },
        CHANGE_THEME: {
          actions: 'changeTheme',
        },
        COPY_CODE: {
          target: 'copying',
          guard: 'canCopy',
          actions: 'startCopy',
        },
        TOGGLE_FOLD: {
          actions: 'toggleFold',
          guard: 'isFoldable',
        },
        UPDATE_CONFIG: {
          actions: 'updateConfig',
        },
      },
    },
    copying: {
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
      after: {
        2000: {
          target: 'idle',
          actions: 'resetCopyStatus',
        },
      },
    },
  },
});

interface SyntaxHighlighterWithThemesInstance {
  initializeFromAttributes(): void;
  updateThemeVariables(): void;
  handleCopyCode(): Promise<void>;
  updateCode(newCode: string): void;
  setTheme(themeName: string): void;
  getAvailableThemes(): string[];
  getCode(): string;
  // Methods from ReactiveComponent
  send(event: Record<string, unknown>): void;
  getCurrentState(): SnapshotFrom<typeof syntaxHighlighterMachine>;
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  textContent: string | null;
}

const renderHighlightedCode = (tokens: CodeToken[], lines: string[]): RawHTML => {
  const renderedLines = lines.map((line, lineIndex) => {
    if (line.trim() === '') {
      return html`<div class="line empty-line"></div>`;
    }

    const lineTokens = tokens.filter((token) => {
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
        highlightedLine += escapeHtml(line.slice(currentPos, tokenStart));
      }

      // Add the highlighted token
      highlightedLine += `<span class="token ${token.type}">${escapeHtml(token.value)}</span>`;
      currentPos = tokenEnd;
    }

    // Add any remaining unhighlighted text
    if (currentPos < line.length) {
      highlightedLine += escapeHtml(line.slice(currentPos));
    }

    return html`<div class="line">${highlightedLine}</div>`;
  });

  return html`${renderedLines.join('')}`;
};

const renderThemeSelector = (themes: Map<string, Theme>, currentTheme: string): RawHTML => {
  const options = Array.from(themes.entries())
    .map(
      ([key, theme]) =>
        `<option value="${key}" ${key === currentTheme ? 'selected' : ''}>${escapeHtml(theme.name)}</option>`
    )
    .join('');

  return html`
    <select class="theme-selector" send="CHANGE_THEME">
      ${options}
    </select>
  `;
};

const renderControls = (
  config: SyntaxHighlighterConfig,
  themes: Map<string, Theme>,
  copyStatus: string,
  isFolded: boolean
): RawHTML => {
  const themeSelector = renderThemeSelector(themes, config.theme);

  const copyButton = config.copyButton
    ? html`
    <button class="copy-button" send="COPY_CODE" data-state=${copyStatus}>
      ${copyStatus === 'copying' ? 'Copying...' : copyStatus === 'copied' ? 'Copied!' : 'Copy'}
    </button>
  `
    : '';

  const foldButton = config.foldable
    ? html`
    <button class="fold-button" send="TOGGLE_FOLD">
      ${isFolded ? '▶' : '▼'}
    </button>
  `
    : '';

  return html`
    ${themeSelector}
    ${copyButton}
    ${foldButton}
  `;
};

const renderLineNumbers = (lines: string[]): RawHTML => html`
  <div class="line-numbers">
    ${lines.map((_, i) => i + 1).join('\n')}
  </div>
`;

const renderError = (error: string | null): RawHTML => {
  if (!error) return html``;
  return html`<div class="error" role="alert">${error}</div>`;
};

const syntaxHighlighterTemplate = (
  state: SnapshotFrom<typeof syntaxHighlighterMachine>
): RawHTML => {
  const { context } = state;
  const { config, copyStatus, isFolded, tokens, lines, themes, error } = context;

  const lineNumbers = config.showLineNumbers ? renderLineNumbers(lines) : '';
  const highlightedCode = renderHighlightedCode(tokens, lines);
  const controls = renderControls(config, themes, copyStatus, isFolded);

  return html`
    <div class="syntax-highlighter">
      <div class="header">
        <span class="language-label">${escapeHtml(config.language)}</span>
        <div class="controls">
          ${controls}
        </div>
      </div>
      <div class="code-container" data-folded=${isFolded}>
        <div class="code-content">
          ${lineNumbers}
          <div class="code-lines">
            ${highlightedCode}
          </div>
        </div>
      </div>
      ${renderError(error)}
    </div>
  `;
};

const syntaxHighlighterStyles = css`
  :host {
    display: block;
    font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .syntax-highlighter {
    position: relative;
    background: var(--theme-background);
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
    color: var(--theme-text);
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
    color: var(--theme-text);
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
  
  .copy-button[data-state="copied"] {
    background: rgba(46, 213, 115, 0.2);
    border-color: rgba(46, 213, 115, 0.5);
    color: #2ed573;
  }
  
  .fold-button {
    background: none;
    border: none;
    color: var(--theme-text);
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
    max-height: var(--max-height);
    overflow: auto;
    transition: max-height 0.3s ease;
    background: var(--theme-background);
  }
  
  .code-container[data-folded="true"] {
    max-height: 0;
    overflow: hidden;
  }
  
  .code-content {
    display: flex;
    background: var(--theme-background);
  }
  
  .line-numbers {
    padding: 1rem 0.5rem;
    background: rgba(0, 0, 0, 0.1);
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    color: var(--theme-text);
    opacity: 0.5;
    font-size: 0.875rem;
    line-height: 1.5;
    text-align: right;
    user-select: none;
    min-width: 3rem;
  }
  
  .code-lines {
    flex: 1;
    padding: 1rem;
    color: var(--theme-text);
    font-size: 0.875rem;
    line-height: 1.5;
    overflow-x: auto;
  }
  
  .token {
    white-space: pre;
  }
  
  .token.keyword {
    color: var(--theme-keyword);
    font-weight: 500;
  }
  
  .token.string {
    color: var(--theme-string);
  }
  
  .token.comment {
    color: var(--theme-comment);
    font-style: italic;
  }
  
  .token.number {
    color: var(--theme-number);
  }
  
  .token.operator {
    color: var(--theme-operator);
  }
  
  .token.function {
    color: var(--theme-function);
  }
  
  .token.variable {
    color: var(--theme-text);
  }
  
  .line {
    display: block;
    min-height: 1.5em;
  }
  
  .empty-line {
    height: 1.5em;
  }
  
  .error {
    padding: 0.5rem 1rem;
    background: rgba(220, 38, 38, 0.1);
    border-top: 1px solid #dc2626;
    color: #fca5a5;
    font-size: 0.875rem;
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
`;

const SyntaxHighlighterWithThemesBase = createComponent({
  machine: syntaxHighlighterMachine,
  template: syntaxHighlighterTemplate,
  styles: syntaxHighlighterStyles,
});

class SyntaxHighlighterWithThemesComponent
  extends SyntaxHighlighterWithThemesBase
  implements SyntaxHighlighterWithThemesInstance
{
  connectedCallback() {
    super.connectedCallback();
    this.initializeFromAttributes();
  }

  // The methods will be added to the prototype below
  initializeFromAttributes!: () => void;
  updateThemeVariables!: () => void;
  handleCopyCode!: () => Promise<void>;
  updateCode!: (newCode: string) => void;
  setTheme!: (themeName: string) => void;
  getAvailableThemes!: () => string[];
  getCode!: () => string;
}

SyntaxHighlighterWithThemesComponent.prototype.initializeFromAttributes = function (
  this: SyntaxHighlighterWithThemesInstance
) {
  const content = this.textContent?.trim() || '';

  // Use state defaults instead of DOM attributes
  const currentState = this.getCurrentState();
  const { config } = currentState.context;

  // Content is cleared via template re-rendering

  // Update configuration using current state values
  this.send({
    type: 'UPDATE_CONFIG',
    config: {
      language: config.language || 'javascript',
      theme: config.theme || 'vscode-dark',
      showLineNumbers: config.showLineNumbers !== false,
      copyButton: config.copyButton !== false,
      foldable: config.foldable || false,
      maxHeight: config.maxHeight || '400px',
    },
  });

  // Set content
  if (content) {
    this.send({ type: 'SET_CONTENT', content });
  }

  // Update CSS variables based on theme
  this.updateThemeVariables();
};

SyntaxHighlighterWithThemesComponent.prototype.updateThemeVariables = function (
  this: SyntaxHighlighterWithThemesInstance
) {
  const currentState = this.getCurrentState();
  const { config } = currentState.context;

  // Use state-based approach instead of DOM manipulation
  // Theme updates are handled through the state machine and template re-rendering
  // The component template will reflect the current theme state
  console.log('Theme variables updated through state:', config.theme);

  // Theme colors are handled via CSS custom properties in the stylesheet
  // This follows the reactive pattern of using state-based styling
};

SyntaxHighlighterWithThemesComponent.prototype.handleCopyCode = async function (
  this: SyntaxHighlighterWithThemesInstance
) {
  const currentState = this.getCurrentState();
  const { content } = currentState.context;

  try {
    await navigator.clipboard.writeText(content);
    this.send({ type: 'COPY_SUCCESS' });
  } catch (error) {
    this.send({
      type: 'COPY_ERROR',
      error: error instanceof Error ? error.message : 'Failed to copy',
    });
  }
};

SyntaxHighlighterWithThemesComponent.prototype.updateCode = function (
  this: SyntaxHighlighterWithThemesInstance,
  newCode: string
) {
  this.send({ type: 'SET_CONTENT', content: newCode });
};

SyntaxHighlighterWithThemesComponent.prototype.setTheme = function (
  this: SyntaxHighlighterWithThemesInstance,
  themeName: string
) {
  this.send({ type: 'CHANGE_THEME', theme: themeName });
  this.updateThemeVariables();
};

SyntaxHighlighterWithThemesComponent.prototype.getAvailableThemes = function (
  this: SyntaxHighlighterWithThemesInstance
) {
  const currentState = this.getCurrentState();
  return Array.from(currentState.context.themes.keys());
};

SyntaxHighlighterWithThemesComponent.prototype.getCode = function (
  this: SyntaxHighlighterWithThemesInstance
) {
  const currentState = this.getCurrentState();
  return currentState.context.content;
};

(
  SyntaxHighlighterWithThemesComponent.constructor as unknown as WebComponentConstructor
).observedAttributes = [
  'language',
  'theme',
  'show-line-numbers',
  'copy-button',
  'foldable',
  'max-height',
];

customElements.define('syntax-highlighter-with-themes', SyntaxHighlighterWithThemesComponent);

export default SyntaxHighlighterWithThemesComponent;
