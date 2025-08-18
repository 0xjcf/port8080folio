import * as vscode from 'vscode';
import { assign, setup } from 'xstate';
import { tokenizeForMachine } from './tokenizer';

export interface FormatterContext {
  input: string;
  position: number;
  line: number;
  column: number;
  indentLevel: number;
  exprDepth: number;
  edits: vscode.TextEdit[];
  formattedEdits: vscode.TextEdit[];
  currentIndent: string;
  indentSize: number;
  preserveNewlines: boolean;
  inTemplate: 'html' | 'css' | null;
  templateStart: number;
  templateIndent: number;
}

export type FormatterEvent =
  | { type: 'START_FORMATTING'; input: string; options: vscode.FormattingOptions }
  | { type: 'CHAR'; char: string }
  | { type: 'BACKTICK' }
  | { type: 'DOLLAR_LBRACE' }
  | { type: 'LBRACE' }
  | { type: 'RBRACE' }
  | { type: 'NEWLINE' }
  | { type: 'TEMPLATE_TAG'; tag: 'html' | 'css' }
  | { type: 'EOF' };

export const formatterMachine = setup({
  types: {
    context: {} as FormatterContext,
    events: {} as FormatterEvent,
  },
  actions: {
    advancePosition: assign({
      position: ({ context }) => context.position + 1,
      column: ({ context }) => context.column + 1,
    }),
    incrementLine: assign({
      line: ({ context }) => context.line + 1,
      column: 0,
    }),
    recordTemplateStart: assign({
      templateStart: ({ context }) => context.position,
      templateIndent: ({ context }) => context.indentLevel + 1,
    }),
    enterTemplate: assign({
      indentLevel: ({ context }) => context.templateIndent,
    }),
    exitTemplate: assign({
      indentLevel: ({ context }) => Math.max(0, context.indentLevel - 1),
    }),
    resetTemplate: assign({
      inTemplate: null,
      templateStart: 0,
      templateIndent: 0,
    }),
    enterInterpolation: assign({
      exprDepth: 1,
    }),
    incrementExprDepth: assign({
      exprDepth: ({ context }) => context.exprDepth + 1,
    }),
    decrementExprDepth: assign({
      exprDepth: ({ context }) => Math.max(0, context.exprDepth - 1),
    }),
    addNewlineAfterBacktick: assign({
      edits: ({ context }) => {
        const position = new vscode.Position(context.line, context.column + 1);
        const indent = '  '.repeat(context.templateIndent);
        const edit = vscode.TextEdit.insert(position, `\n${indent}`);
        return [...context.edits, edit];
      },
    }),
    addNewlineBeforeBacktick: assign({
      edits: ({ context }) => {
        const position = new vscode.Position(context.line, context.column);
        const indent = '  '.repeat(context.templateIndent - 1);
        const edit = vscode.TextEdit.insert(position, `\n${indent}`);
        return [...context.edits, edit];
      },
    }),
    addTemplateIndent: assign({
      edits: ({ context }) => {
        // Add proper indentation for template content
        const position = new vscode.Position(context.line, 0);
        const indent = '  '.repeat(context.indentLevel);
        const range = new vscode.Range(position, position.translate(0, context.column));
        const edit = vscode.TextEdit.replace(range, indent);
        return [...context.edits, edit];
      },
    }),
    setTemplateTag: assign({
      inTemplate: ({ event }) => {
        if (event.type === 'TEMPLATE_TAG') {
          return event.tag;
        }
        return null;
      },
    }),
    initializeFormatting: assign({
      input: ({ event }) => {
        if (event.type === 'START_FORMATTING') {
          // Initialize with the input text that will be formatted
          return event.input || '';
        }
        return '';
      },
      indentSize: ({ event }) => {
        if (event.type === 'START_FORMATTING') {
          return event.options.insertSpaces ? event.options.tabSize : 4;
        }
        return 2;
      },
      edits: [],
      formattedEdits: [],
    }),
    processTokens: assign({
      formattedEdits: ({ context }) => {
        try {
          // Starting processTokens action - logging disabled to follow actor pattern

          // Process the input text and generate formatting edits
          const text = context.input;
          const edits: vscode.TextEdit[] = [];

          if (!text) {
            // No input text, returning empty edits
            return edits;
          }

          // Processing text

          // Tokenize the input text
          const tokens = tokenizeForMachine(text);
          // Generated tokens

          let currentLine = 0;
          let currentColumn = 0;
          const indentLevel = 0;
          let inTemplate = false;
          let templateType: 'html' | 'css' | null = null;

          for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            const nextToken = tokens[i + 1];

            switch (token.type) {
              case 'TEMPLATE_TAG':
                templateType = token.tag;
                inTemplate = true;
                // Found template tag
                break;

              case 'BACKTICK':
                if (inTemplate && templateType) {
                  if (nextToken && nextToken.type !== 'EOF') {
                    try {
                      // Add newline after opening backtick
                      const position = new vscode.Position(currentLine, currentColumn + 1);
                      const indent = '  '.repeat(indentLevel + 1);
                      const edit = vscode.TextEdit.insert(position, `\n${indent}`);
                      edits.push(edit);
                      // Added newline after backtick
                    } catch (_editError) {}
                  }
                  inTemplate = !inTemplate;
                }
                break;

              case 'NEWLINE':
                currentLine++;
                currentColumn = 0;

                if (inTemplate && templateType) {
                  try {
                    // Add proper indentation for template content
                    const nextPos = new vscode.Position(currentLine, 0);
                    const indent = '  '.repeat(indentLevel + 1);
                    const edit = vscode.TextEdit.insert(nextPos, indent);
                    edits.push(edit);
                    // Added indent at line
                  } catch (_editError) {}
                }
                break;

              case 'DOLLAR_LBRACE':
                // Handle template expressions - no special formatting needed
                break;

              case 'LBRACE':
              case 'RBRACE':
                // Handle brace matching - no special formatting needed
                break;

              case 'CHAR':
                currentColumn++;
                break;

              case 'EOF':
                // End of file - finalize any pending edits
                // Reached EOF
                break;
            }
          }

          // processTokens completed
          return edits;
        } catch (_error) {
          return [];
        }
      },
    }),
    finalizeEdits: assign({
      formattedEdits: ({ context }) => {
        // Final processing of edits
        return context.edits;
      },
    }),
  },
  guards: {
    isAtExpressionEnd: ({ context }) => context.exprDepth === 1,
  },
}).createMachine({
  id: 'formatter',
  initial: 'root',
  context: {
    input: '',
    position: 0,
    line: 0,
    column: 0,
    indentLevel: 0,
    exprDepth: 0,
    edits: [],
    formattedEdits: [],
    currentIndent: '',
    indentSize: 2,
    preserveNewlines: true,
    inTemplate: null,
    templateStart: 0,
    templateIndent: 0,
  },
  states: {
    root: {
      on: {
        START_FORMATTING: {
          target: 'formatting',
          actions: ['initializeFormatting'],
        },
        TEMPLATE_TAG: {
          target: 'waitingForBacktick',
          actions: 'setTemplateTag',
        },
        CHAR: {
          actions: 'advancePosition',
        },
        NEWLINE: {
          actions: ['advancePosition', 'incrementLine'],
        },
      },
    },
    formatting: {
      entry: ['processTokens', 'finalizeEdits'],
      always: {
        target: 'root',
      },
    },
    waitingForBacktick: {
      on: {
        BACKTICK: {
          target: 'template',
          actions: ['recordTemplateStart', 'addNewlineAfterBacktick'],
        },
        CHAR: {
          target: 'root',
          actions: 'advancePosition',
        },
      },
    },
    template: {
      entry: 'enterTemplate',
      exit: 'exitTemplate',
      on: {
        DOLLAR_LBRACE: {
          target: 'interpolation',
          actions: 'enterInterpolation',
        },
        BACKTICK: {
          target: 'root',
          actions: ['addNewlineBeforeBacktick', 'resetTemplate'],
        },
        NEWLINE: {
          actions: ['advancePosition', 'incrementLine', 'addTemplateIndent'],
        },
        CHAR: {
          actions: 'advancePosition',
        },
      },
    },
    interpolation: {
      entry: 'incrementExprDepth',
      on: {
        LBRACE: {
          actions: 'incrementExprDepth',
        },
        RBRACE: [
          {
            guard: 'isAtExpressionEnd',
            target: 'template',
            actions: 'decrementExprDepth',
          },
          {
            actions: 'decrementExprDepth',
          },
        ],
        CHAR: {
          actions: 'advancePosition',
        },
        NEWLINE: {
          actions: ['advancePosition', 'incrementLine'],
        },
      },
    },
  },
});
