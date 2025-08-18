var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: () => m[k] };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? (o, v) => {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : (o, v) => {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (() => {
    var ownKeys = (o) => {
      ownKeys =
        Object.getOwnPropertyNames ||
        ((o) => {
          var ar = [];
          for (var k in o) if (Object.hasOwn(o, k)) ar[ar.length] = k;
          return ar;
        });
      return ownKeys(o);
    };
    return (mod) => {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatterMachine = void 0;
exports.tokenizeForMachine = tokenizeForMachine;
const vscode = __importStar(require('vscode'));
const xstate_1 = require('xstate');
exports.formatterMachine = (0, xstate_1.setup)({
  types: {
    context: {},
    events: {},
  },
  actions: {
    advancePosition: (0, xstate_1.assign)({
      position: ({ context }) => context.position + 1,
      column: ({ context }) => context.column + 1,
    }),
    incrementLine: (0, xstate_1.assign)({
      line: ({ context }) => context.line + 1,
      column: 0,
    }),
    recordTemplateStart: (0, xstate_1.assign)({
      templateStart: ({ context }) => context.position,
      templateIndent: ({ context }) => context.indentLevel + 1,
    }),
    enterTemplate: (0, xstate_1.assign)({
      indentLevel: ({ context }) => context.templateIndent,
    }),
    exitTemplate: (0, xstate_1.assign)({
      indentLevel: ({ context }) => Math.max(0, context.indentLevel - 1),
    }),
    resetTemplate: (0, xstate_1.assign)({
      inTemplate: null,
      templateStart: 0,
      templateIndent: 0,
    }),
    enterInterpolation: (0, xstate_1.assign)({
      exprDepth: 1,
    }),
    incrementExprDepth: (0, xstate_1.assign)({
      exprDepth: ({ context }) => context.exprDepth + 1,
    }),
    decrementExprDepth: (0, xstate_1.assign)({
      exprDepth: ({ context }) => Math.max(0, context.exprDepth - 1),
    }),
    addNewlineAfterBacktick: (0, xstate_1.assign)({
      edits: ({ context }) => {
        const position = new vscode.Position(context.line, context.column + 1);
        const indent = '  '.repeat(context.templateIndent);
        const edit = vscode.TextEdit.insert(position, `\n${indent}`);
        return [...context.edits, edit];
      },
    }),
    addNewlineBeforeBacktick: (0, xstate_1.assign)({
      edits: ({ context }) => {
        const position = new vscode.Position(context.line, context.column);
        const indent = '  '.repeat(context.templateIndent - 1);
        const edit = vscode.TextEdit.insert(position, `\n${indent}`);
        return [...context.edits, edit];
      },
    }),
    addTemplateIndent: (0, xstate_1.assign)({
      edits: ({ context }) => {
        // Add proper indentation for template content
        const position = new vscode.Position(context.line, 0);
        const indent = '  '.repeat(context.indentLevel);
        const range = new vscode.Range(position, position.translate(0, context.column));
        const edit = vscode.TextEdit.replace(range, indent);
        return [...context.edits, edit];
      },
    }),
    setTemplateTag: (0, xstate_1.assign)({
      inTemplate: ({ event }) => {
        if (event.type === 'TEMPLATE_TAG') {
          return event.tag;
        }
        return null;
      },
    }),
    initializeFormatting: (0, xstate_1.assign)({
      formattedEdits: ({ context }) => {
        // For now, just copy the legacy formatter behavior
        // In a full implementation, we'd process tokens here
        return context.edits;
      },
    }),
    processTokens: (0, xstate_1.assign)({
      // Process the tokens and generate edits
      // This is a simplified version - in practice, you'd iterate through tokens
      formattedEdits: () => {
        // Mock implementation that returns empty edits
        // Real implementation would process the tokens
        return [];
      },
    }),
    finalizeEdits: (0, xstate_1.assign)({
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
// Helper function to tokenize input for the state machine
function tokenizeForMachine(text) {
  const events = [];
  let i = 0;
  while (i < text.length) {
    const char = text[i];
    // Check for template tags
    if (text.slice(i, i + 5) === 'html`') {
      events.push({ type: 'TEMPLATE_TAG', tag: 'html' });
      i += 4; // advance to the backtick
    } else if (text.slice(i, i + 4) === 'css`') {
      events.push({ type: 'TEMPLATE_TAG', tag: 'css' });
      i += 3; // advance to the backtick
    }
    // Check for template literal markers
    else if (char === '`') {
      events.push({ type: 'BACKTICK' });
    }
    // Check for interpolation start
    else if (char === '$' && text[i + 1] === '{') {
      events.push({ type: 'DOLLAR_LBRACE' });
      i++; // skip the {
    }
    // Check for braces
    else if (char === '{') {
      events.push({ type: 'LBRACE' });
    } else if (char === '}') {
      events.push({ type: 'RBRACE' });
    }
    // Check for newlines
    else if (char === '\n') {
      events.push({ type: 'NEWLINE' });
    }
    // Regular character
    else {
      events.push({ type: 'CHAR', char });
    }
    i++;
  }
  events.push({ type: 'EOF' });
  return events;
}
//# sourceMappingURL=formatterMachine.js.map
