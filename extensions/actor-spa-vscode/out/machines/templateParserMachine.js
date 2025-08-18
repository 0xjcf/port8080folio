Object.defineProperty(exports, '__esModule', { value: true });
exports.templateParserMachine = void 0;
exports.tokenizeTemplateContent = tokenizeTemplateContent;
const xstate_1 = require('xstate');
exports.templateParserMachine = (0, xstate_1.setup)({
  types: {
    context: {},
    events: {},
  },
  actions: {
    advancePosition: (0, xstate_1.assign)({
      position: ({ context }) => context.position + 1,
    }),
    appendToCurrentToken: (0, xstate_1.assign)({
      currentToken: ({ context, event }) => {
        if (event.type === 'CHAR') {
          return context.currentToken + event.char;
        }
        return context.currentToken;
      },
    }),
    saveToken: (0, xstate_1.assign)({
      tokens: ({ context }, params) => {
        if (context.currentToken) {
          const token = {
            type: params.type,
            value: context.currentToken,
            start: context.position - context.currentToken.length,
            end: context.position,
            depth: context.depth,
          };
          return [...context.tokens, token];
        }
        return context.tokens;
      },
      currentToken: '',
    }),
    startExpression: (0, xstate_1.assign)({
      inExpression: true,
      expressionDepth: 1,
    }),
    endExpression: (0, xstate_1.assign)({
      inExpression: false,
      expressionDepth: 0,
    }),
    incrementExpressionDepth: (0, xstate_1.assign)({
      expressionDepth: ({ context }) => context.expressionDepth + 1,
    }),
    decrementExpressionDepth: (0, xstate_1.assign)({
      expressionDepth: ({ context }) => Math.max(0, context.expressionDepth - 1),
    }),
    setStringDelimiter: (0, xstate_1.assign)({
      stringDelimiter: ({ event }) => {
        if (event.type === 'QUOTE') {
          return event.delimiter;
        }
        return null;
      },
    }),
    clearStringDelimiter: (0, xstate_1.assign)({
      stringDelimiter: null,
    }),
    incrementDepth: (0, xstate_1.assign)({
      depth: ({ context }) => context.depth + 1,
    }),
    decrementDepth: (0, xstate_1.assign)({
      depth: ({ context }) => Math.max(0, context.depth - 1),
    }),
  },
  guards: {
    isInExpression: ({ context }) => context.inExpression,
    isInString: ({ context }) => context.stringDelimiter !== null,
    isMatchingQuote: ({ context, event }) => {
      return event.type === 'QUOTE' && event.delimiter === context.stringDelimiter;
    },
    isExpressionComplete: ({ context }) => context.expressionDepth === 0,
  },
}).createMachine({
  id: 'templateParser',
  initial: 'idle',
  context: {
    input: '',
    position: 0,
    tokens: [],
    currentToken: '',
    depth: 0,
    templateType: null,
    inExpression: false,
    expressionDepth: 0,
    stringDelimiter: null,
  },
  states: {
    idle: {
      on: {
        TAG_START: {
          target: 'inTag',
          actions: [{ type: 'saveToken', params: { type: 'text' } }, 'incrementDepth'],
        },
        EXPRESSION_START: {
          target: 'inExpression',
          actions: [{ type: 'saveToken', params: { type: 'text' } }, 'startExpression'],
        },
        COMMENT_START: {
          target: 'inComment',
          actions: [{ type: 'saveToken', params: { type: 'text' } }],
        },
        CHAR: {
          target: 'inText',
          actions: 'appendToCurrentToken',
        },
        EOF: {
          target: 'done',
          actions: [{ type: 'saveToken', params: { type: 'text' } }],
        },
      },
    },
    inText: {
      on: {
        TAG_START: {
          target: 'inTag',
          actions: [{ type: 'saveToken', params: { type: 'text' } }, 'incrementDepth'],
        },
        EXPRESSION_START: {
          target: 'inExpression',
          actions: [{ type: 'saveToken', params: { type: 'text' } }, 'startExpression'],
        },
        COMMENT_START: {
          target: 'inComment',
          actions: { type: 'saveToken', params: { type: 'text' } },
        },
        CHAR: {
          actions: 'appendToCurrentToken',
        },
        EOF: {
          target: 'done',
          actions: [{ type: 'saveToken', params: { type: 'text' } }],
        },
      },
    },
    inTag: {
      on: {
        TAG_END: {
          target: 'idle',
          actions: [{ type: 'saveToken', params: { type: 'tag' } }, 'decrementDepth'],
        },
        QUOTE: {
          target: 'inAttributeString',
          actions: ['appendToCurrentToken', 'setStringDelimiter'],
        },
        EXPRESSION_START: {
          target: 'inTagExpression',
          actions: ['appendToCurrentToken', 'startExpression'],
        },
        CHAR: {
          actions: 'appendToCurrentToken',
        },
        EOF: {
          target: 'done',
          actions: [{ type: 'saveToken', params: { type: 'tag' } }],
        },
      },
    },
    inAttributeString: {
      on: {
        QUOTE: [
          {
            guard: 'isMatchingQuote',
            target: 'inTag',
            actions: ['appendToCurrentToken', 'clearStringDelimiter'],
          },
          {
            actions: 'appendToCurrentToken',
          },
        ],
        CHAR: {
          actions: 'appendToCurrentToken',
        },
        EOF: {
          target: 'done',
          actions: [{ type: 'saveToken', params: { type: 'attribute' } }],
        },
      },
    },
    inExpression: {
      on: {
        EXPRESSION_END: [
          {
            guard: 'isExpressionComplete',
            target: 'idle',
            actions: [{ type: 'saveToken', params: { type: 'expression' } }, 'endExpression'],
          },
          {
            actions: ['appendToCurrentToken', 'decrementExpressionDepth'],
          },
        ],
        EXPRESSION_START: {
          actions: ['appendToCurrentToken', 'incrementExpressionDepth'],
        },
        QUOTE: {
          target: 'inExpressionString',
          actions: ['appendToCurrentToken', 'setStringDelimiter'],
        },
        CHAR: {
          actions: 'appendToCurrentToken',
        },
        EOF: {
          target: 'done',
          actions: [{ type: 'saveToken', params: { type: 'expression' } }],
        },
      },
    },
    inExpressionString: {
      on: {
        QUOTE: [
          {
            guard: 'isMatchingQuote',
            target: 'inExpression',
            actions: ['appendToCurrentToken', 'clearStringDelimiter'],
          },
          {
            actions: 'appendToCurrentToken',
          },
        ],
        CHAR: {
          actions: 'appendToCurrentToken',
        },
        EOF: {
          target: 'done',
          actions: [{ type: 'saveToken', params: { type: 'expression' } }],
        },
      },
    },
    inTagExpression: {
      on: {
        EXPRESSION_END: [
          {
            guard: 'isExpressionComplete',
            target: 'inTag',
            actions: ['appendToCurrentToken', 'endExpression'],
          },
          {
            actions: ['appendToCurrentToken', 'decrementExpressionDepth'],
          },
        ],
        EXPRESSION_START: {
          actions: ['appendToCurrentToken', 'incrementExpressionDepth'],
        },
        CHAR: {
          actions: 'appendToCurrentToken',
        },
        EOF: {
          target: 'done',
          actions: [{ type: 'saveToken', params: { type: 'tag' } }],
        },
      },
    },
    inComment: {
      on: {
        COMMENT_END: {
          target: 'idle',
          actions: [{ type: 'saveToken', params: { type: 'comment' } }],
        },
        CHAR: {
          actions: 'appendToCurrentToken',
        },
        EOF: {
          target: 'done',
          actions: [{ type: 'saveToken', params: { type: 'comment' } }],
        },
      },
    },
    done: {
      type: 'final',
    },
  },
});
// Helper function to tokenize HTML/CSS template content
function tokenizeTemplateContent(content, type) {
  const events = [];
  let i = 0;
  while (i < content.length) {
    const char = content[i];
    const lookahead = content.slice(i, i + 4);
    if (type === 'html') {
      // HTML-specific tokenization
      if (lookahead.startsWith('<!--')) {
        events.push({ type: 'COMMENT_START' });
        i += 4;
        continue;
      }
      if (lookahead.startsWith('-->')) {
        events.push({ type: 'COMMENT_END' });
        i += 3;
        continue;
      }
      if (char === '<' && content[i + 1] !== '!' && content[i + 1] !== '?') {
        events.push({ type: 'TAG_START' });
      } else if (char === '>') {
        events.push({ type: 'TAG_END' });
      } else if (char === '$' && content[i + 1] === '{') {
        events.push({ type: 'EXPRESSION_START' });
        i++; // Skip the {
      } else if (char === '}') {
        events.push({ type: 'EXPRESSION_END' });
      } else if (char === '"' || char === "'" || char === '`') {
        events.push({ type: 'QUOTE', delimiter: char });
      } else {
        events.push({ type: 'CHAR', char });
      }
    } else {
      // CSS-specific tokenization
      if (lookahead.startsWith('/*')) {
        events.push({ type: 'COMMENT_START' });
        i += 2;
        continue;
      }
      if (lookahead.startsWith('*/')) {
        events.push({ type: 'COMMENT_END' });
        i += 2;
        continue;
      }
      if (char === '$' && content[i + 1] === '{') {
        events.push({ type: 'EXPRESSION_START' });
        i++; // Skip the {
      } else if (char === '}') {
        events.push({ type: 'EXPRESSION_END' });
      } else if (char === '"' || char === "'" || char === '`') {
        events.push({ type: 'QUOTE', delimiter: char });
      } else {
        events.push({ type: 'CHAR', char });
      }
    }
    i++;
  }
  events.push({ type: 'EOF' });
  return events;
}
//# sourceMappingURL=templateParserMachine.js.map
