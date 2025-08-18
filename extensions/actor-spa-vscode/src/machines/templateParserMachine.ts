import { assign, setup } from 'xstate';

export interface TemplateParserContext {
  input: string;
  position: number;
  tokens: TemplateToken[];
  currentToken: string;
  depth: number;
  templateType: 'html' | 'css' | null;
  inExpression: boolean;
  expressionDepth: number;
  stringDelimiter: string | null;
}

export interface TemplateToken {
  type: 'tag' | 'text' | 'expression' | 'attribute' | 'comment' | 'style';
  value: string;
  start: number;
  end: number;
  depth: number;
}

export type TemplateParserEvent =
  | { type: 'CHAR'; char: string }
  | { type: 'TAG_START' }
  | { type: 'TAG_END' }
  | { type: 'EXPRESSION_START' }
  | { type: 'EXPRESSION_END' }
  | { type: 'QUOTE'; delimiter: string }
  | { type: 'COMMENT_START' }
  | { type: 'COMMENT_END' }
  | { type: 'EOF' };

export const templateParserMachine = setup({
  types: {
    context: {} as TemplateParserContext,
    events: {} as TemplateParserEvent,
  },
  actions: {
    advancePosition: assign({
      position: ({ context }) => context.position + 1,
    }),
    appendToCurrentToken: assign({
      currentToken: ({ context, event }) => {
        if (event.type === 'CHAR') {
          return context.currentToken + event.char;
        }
        return context.currentToken;
      },
    }),
    saveToken: assign({
      tokens: ({ context }, params: { type: TemplateToken['type'] }) => {
        if (context.currentToken) {
          const token: TemplateToken = {
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
    startExpression: assign({
      inExpression: true,
      expressionDepth: 1,
    }),
    endExpression: assign({
      inExpression: false,
      expressionDepth: 0,
    }),
    incrementExpressionDepth: assign({
      expressionDepth: ({ context }) => context.expressionDepth + 1,
    }),
    decrementExpressionDepth: assign({
      expressionDepth: ({ context }) => Math.max(0, context.expressionDepth - 1),
    }),
    setStringDelimiter: assign({
      stringDelimiter: ({ event }) => {
        if (event.type === 'QUOTE') {
          return event.delimiter;
        }
        return null;
      },
    }),
    clearStringDelimiter: assign({
      stringDelimiter: null,
    }),
    incrementDepth: assign({
      depth: ({ context }) => context.depth + 1,
    }),
    decrementDepth: assign({
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
export function tokenizeTemplateContent(
  content: string,
  type: 'html' | 'css'
): TemplateParserEvent[] {
  const events: TemplateParserEvent[] = [];
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
