import * as vscode from 'vscode';
import { assign, fromPromise, setup } from 'xstate';

export interface TemplateInfo {
  range: vscode.Range;
  content: string;
  language: 'html' | 'css';
  indentLevel: number;
  isNested: boolean;
  complexity: 'simple' | 'medium' | 'complex';
  expressionCount: number;
  lineCount: number;
  startPosition: number;
  endPosition: number;
}

export interface DiscoveryContext {
  document: vscode.TextDocument | null;
  text: string;
  position: number;
  templates: TemplateInfo[];
  errors: string[];
  currentTemplate: Partial<TemplateInfo> | null;
  stats: {
    totalTemplates: number;
    htmlTemplates: number;
    cssTemplates: number;
    nestedTemplates: number;
    complexTemplates: number;
    processingTime: number;
  };
}

export type DiscoveryEvent =
  | { type: 'DISCOVER'; document: vscode.TextDocument }
  | { type: 'TEMPLATE_FOUND'; template: TemplateInfo }
  | { type: 'SCAN_COMPLETE' }
  | { type: 'ANALYSIS_COMPLETE' }
  | { type: 'VALIDATION_COMPLETE' }
  | { type: 'ERROR'; error: string }
  | { type: 'RETRY' }
  | { type: 'RESET' };

// Helper functions for template discovery
function findTemplateStart(
  text: string,
  position: number
): { type: 'html' | 'css' | null; start: number } {
  // Look for html` or css` patterns
  const htmlMatch = text.indexOf('html`', position);
  const cssMatch = text.indexOf('css`', position);

  if (htmlMatch === -1 && cssMatch === -1) {
    return { type: null, start: -1 };
  }

  if (htmlMatch !== -1 && (cssMatch === -1 || htmlMatch < cssMatch)) {
    return { type: 'html', start: htmlMatch };
  }

  return { type: 'css', start: cssMatch };
}

function findClosingBacktick(text: string, start: number): number {
  let depth = 0;
  let i = start;
  let inString = false;
  let stringChar = '';

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    // Handle escaped characters
    if (char === '\\') {
      i += 2;
      continue;
    }

    // Handle string literals
    if (!inString && (char === '"' || char === "'" || char === '`')) {
      if (char === '`') {
        if (depth === 0) {
          return i;
        }
        depth--;
      } else {
        inString = true;
        stringChar = char;
      }
    } else if (inString && char === stringChar) {
      inString = false;
      stringChar = '';
    }

    if (!inString) {
      if (char === '$' && nextChar === '{') {
        depth++;
        i++; // Skip the '{'
      } else if (char === '}' && depth > 0) {
        depth--;
      }
    }

    i++;
  }

  return -1;
}

function analyzeTemplateComplexity(content: string): 'simple' | 'medium' | 'complex' {
  const expressionCount = (content.match(/\$\{/g) || []).length;
  const lineCount = content.split('\n').length;
  const hasNestedTemplates = /html`|css`/.test(content);

  if (hasNestedTemplates || expressionCount > 10 || lineCount > 20) {
    return 'complex';
  }

  if (expressionCount > 3 || lineCount > 5) {
    return 'medium';
  }

  return 'simple';
}

function getIndentLevel(document: vscode.TextDocument, lineNumber: number): number {
  const line = document.lineAt(lineNumber);
  const match = line.text.match(/^(\s*)/);
  return match ? Math.floor(match[1].length / 2) : 0;
}

function isNestedTemplate(text: string, currentPos: number): boolean {
  // Look backwards to see if we're inside another template literal
  let templateDepth = 0;
  let i = currentPos - 1;

  while (i >= 0) {
    const char = text[i];

    if (char === '`') {
      // Check if this is a template tag
      let j = i - 1;
      while (j >= 0 && /\s/.test(text[j])) {
        j--;
      }
      const tagEnd = j + 1;
      while (j >= 0 && /[a-zA-Z_$]/.test(text[j])) {
        j--;
      }

      if (j >= 0 && /\b(html|css)$/.test(text.slice(j + 1, tagEnd))) {
        templateDepth++;
        if (templateDepth > 1) {
          return true;
        }
      }
    }

    i--;
  }

  return false;
}

// Actor for discovering templates
const discoverTemplatesActor = fromPromise(
  async ({ input }: { input: { document: vscode.TextDocument } }) => {
    const { document } = input;
    const text = document.getText();
    const templates: TemplateInfo[] = [];
    let position = 0;

    while (position < text.length) {
      const { type, start } = findTemplateStart(text, position);

      if (!type || start === -1) {
        break;
      }

      const contentStart = start + type.length + 1; // +1 for the backtick
      const contentEnd = findClosingBacktick(text, contentStart);

      if (contentEnd === -1) {
        position = start + 1;
        continue;
      }

      const content = text.slice(contentStart, contentEnd);
      const startPos = document.positionAt(contentStart);
      const endPos = document.positionAt(contentEnd);
      const indentLevel = getIndentLevel(document, startPos.line);
      const isNested = isNestedTemplate(text, start);
      const complexity = analyzeTemplateComplexity(content);
      const expressionCount = (content.match(/\$\{/g) || []).length;
      const lineCount = content.split('\n').length;

      const template: TemplateInfo = {
        range: new vscode.Range(startPos, endPos),
        content,
        language: type,
        indentLevel,
        isNested,
        complexity,
        expressionCount,
        lineCount,
        startPosition: contentStart,
        endPosition: contentEnd,
      };

      templates.push(template);
      position = contentEnd + 1;
    }

    return templates;
  }
);

// Actor for analyzing templates
const analyzeTemplatesActor = fromPromise(
  async ({ input }: { input: { templates: TemplateInfo[] } }) => {
    const { templates } = input;

    // Perform additional analysis
    const stats = {
      totalTemplates: templates.length,
      htmlTemplates: templates.filter((t) => t.language === 'html').length,
      cssTemplates: templates.filter((t) => t.language === 'css').length,
      nestedTemplates: templates.filter((t) => t.isNested).length,
      complexTemplates: templates.filter((t) => t.complexity === 'complex').length,
      processingTime: Date.now(),
    };

    return { templates, stats };
  }
);

// Actor for validating templates
const validateTemplatesActor = fromPromise(
  async ({ input }: { input: { templates: TemplateInfo[] } }) => {
    const { templates } = input;
    const errors: string[] = [];

    for (const template of templates) {
      // Basic validation
      if (!template.content.trim()) {
        errors.push(`Empty ${template.language} template found`);
      }

      // Check for unclosed tags in HTML
      if (template.language === 'html') {
        const openTags = (template.content.match(/<[^/][^>]*>/g) || []).length;
        const closeTags = (template.content.match(/<\/[^>]*>/g) || []).length;
        const selfClosing = (template.content.match(/<[^>]*\/>/g) || []).length;

        if (openTags - selfClosing !== closeTags) {
          errors.push(`Mismatched HTML tags in template at line ${template.range.start.line + 1}`);
        }
      }

      // Check for unclosed braces in CSS
      if (template.language === 'css') {
        const openBraces = (template.content.match(/\{/g) || []).length;
        const closeBraces = (template.content.match(/\}/g) || []).length;

        if (openBraces !== closeBraces) {
          errors.push(`Mismatched CSS braces in template at line ${template.range.start.line + 1}`);
        }
      }
    }

    return { templates, errors };
  }
);

export const discoveryMachine = setup({
  types: {
    context: {} as DiscoveryContext,
    events: {} as DiscoveryEvent,
  },
  actors: {
    discoverTemplates: discoverTemplatesActor,
    analyzeTemplates: analyzeTemplatesActor,
    validateTemplates: validateTemplatesActor,
  },
  actions: {
    setDocument: assign({
      document: ({ event }) => {
        if (event.type === 'DISCOVER') {
          return event.document;
        }
        return null;
      },
      text: ({ event }) => {
        if (event.type === 'DISCOVER') {
          return event.document.getText();
        }
        return '';
      },
      position: 0,
    }),

    updateTemplates: assign({
      templates: ({ context, event }) => {
        if (event.type === 'TEMPLATE_FOUND') {
          return [...context.templates, event.template];
        }
        return context.templates;
      },
    }),

    setAnalysisResults: assign({
      templates: ({ context, event }) => {
        if (event.type === 'ANALYSIS_COMPLETE') {
          // This would be set by the analysis actor
          return context.templates;
        }
        return context.templates;
      },
    }),

    setValidationResults: assign({
      errors: ({ context, event }) => {
        if (event.type === 'VALIDATION_COMPLETE') {
          // This would be set by the validation actor
          return context.errors;
        }
        return context.errors;
      },
    }),

    addError: assign({
      errors: ({ context, event }) => {
        if (event.type === 'ERROR') {
          return [...context.errors, event.error];
        }
        return context.errors;
      },
    }),

    resetState: assign({
      document: null,
      text: '',
      position: 0,
      templates: [],
      errors: [],
      currentTemplate: null,
      stats: {
        totalTemplates: 0,
        htmlTemplates: 0,
        cssTemplates: 0,
        nestedTemplates: 0,
        complexTemplates: 0,
        processingTime: 0,
      },
    }),
  },
}).createMachine({
  id: 'discovery',
  initial: 'idle',
  context: {
    document: null,
    text: '',
    position: 0,
    templates: [],
    errors: [],
    currentTemplate: null,
    stats: {
      totalTemplates: 0,
      htmlTemplates: 0,
      cssTemplates: 0,
      nestedTemplates: 0,
      complexTemplates: 0,
      processingTime: 0,
    },
  },
  states: {
    idle: {
      on: {
        DISCOVER: {
          target: 'scanning',
          actions: 'setDocument',
        },
      },
    },

    scanning: {
      invoke: {
        id: 'discoverTemplates',
        src: 'discoverTemplates',
        input: ({ context }) => {
          if (!context.document) {
            throw new Error('No document provided for scanning');
          }
          return {
            document: context.document,
          };
        },
        onDone: {
          target: 'analyzing',
          actions: assign({
            templates: ({ event }) => event.output,
          }),
        },
        onError: {
          target: 'error',
          actions: assign({
            errors: ({ context, event }) => [...context.errors, `Discovery error: ${event.error}`],
          }),
        },
      },
    },

    analyzing: {
      invoke: {
        id: 'analyzeTemplates',
        src: 'analyzeTemplates',
        input: ({ context }) => ({
          templates: context.templates,
        }),
        onDone: {
          target: 'validating',
          actions: assign({
            templates: ({ event }) => event.output.templates,
            stats: ({ event }) => event.output.stats,
          }),
        },
        onError: {
          target: 'error',
          actions: assign({
            errors: ({ context, event }) => [...context.errors, `Analysis error: ${event.error}`],
          }),
        },
      },
    },

    validating: {
      invoke: {
        id: 'validateTemplates',
        src: 'validateTemplates',
        input: ({ context }) => ({
          templates: context.templates,
        }),
        onDone: {
          target: 'completed',
          actions: assign({
            templates: ({ event }) => event.output.templates,
            errors: ({ event }) => event.output.errors,
          }),
        },
        onError: {
          target: 'error',
          actions: assign({
            errors: ({ context, event }) => [...context.errors, `Validation error: ${event.error}`],
          }),
        },
      },
    },

    completed: {
      on: {
        DISCOVER: {
          target: 'scanning',
          actions: 'setDocument',
        },
        RESET: {
          target: 'idle',
          actions: 'resetState',
        },
      },
    },

    error: {
      on: {
        RETRY: {
          target: 'scanning',
        },
        RESET: {
          target: 'idle',
          actions: 'resetState',
        },
      },
    },
  },
});
