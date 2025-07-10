// XState-specific syntax highlighting tests for V2

class V2XStateParser {
  constructor() {
    this.testCases = [
      {
        name: 'XState Machine with Context & Events',
        code: `
import { createMachine, assign } from 'xstate';

const lightMachine = createMachine({
    id: 'light',
    initial: 'green',
    context: {
        count: 0,
        elapsed: 0,
        pedestrianMode: false
    },
    states: {
        green: {
            on: {
                TIMER: 'yellow',
                PEDESTRIAN_REQUEST: {
                    actions: assign({
                        pedestrianMode: true
                    })
                }
            },
            after: {
                30000: 'yellow'
            }
        },
        yellow: {
            on: {
                TIMER: 'red'
            },
            after: {
                5000: 'red'
            }
        },
        red: {
            on: {
                TIMER: {
                    target: 'green',
                    actions: assign({
                        count: (context) => context.count + 1,
                        pedestrianMode: false
                    })
                }
            },
            after: {
                60000: 'green'
            }
        }
    }
});
                `.trim(),
      },
      {
        name: 'XState Actions, Guards & Services',
        code: `
const authMachine = createMachine({
    id: 'auth',
    initial: 'idle',
    context: {
        user: null,
        error: null,
        retries: 0
    },
    states: {
        idle: {
            on: {
                LOGIN: {
                    target: 'authenticating',
                    cond: 'hasCredentials'
                }
            }
        },
        authenticating: {
            invoke: {
                id: 'authService',
                src: 'authenticate',
                input: ({ event }) => ({
                    username: event.username,
                    password: event.password
                }),
                onDone: {
                    target: 'authenticated',
                    actions: assign({
                        user: ({ event }) => event.output,
                        error: null
                    })
                },
                onError: {
                    target: 'failed',
                    actions: assign({
                        error: ({ event }) => event.error,
                        retries: ({ context }) => context.retries + 1
                    })
                }
            }
        },
        authenticated: {
            on: {
                LOGOUT: {
                    target: 'idle',
                    actions: ['clearUser', 'logLogout']
                }
            }
        },
        failed: {
            on: {
                RETRY: {
                    target: 'authenticating',
                    cond: 'canRetry'
                },
                CANCEL: 'idle'
            }
        }
    }
}, {
    actions: {
        clearUser: assign({
            user: null,
            error: null,
            retries: 0
        }),
        logLogout: () => console.log('User logged out')
    },
    guards: {
        hasCredentials: ({ event }) => {
            return event.username && event.password;
        },
        canRetry: ({ context }) => context.retries < 3
    },
    services: {
        authenticate: async ({ input }) => {
            const response = await fetch('/api/auth', {
                method: 'POST',
                body: JSON.stringify(input)
            });
            if (!response.ok) throw new Error('Auth failed');
            return response.json();
        }
    }
});
                `.trim(),
      },
      {
        name: 'XState Actor Model & Spawning',
        code: `
import { setup, assign, spawn, sendTo, fromPromise } from 'xstate';

const childActor = fromPromise(async ({ input }) => {
    console.log('Child processing:', input);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { processed: input.data };
});

const parentMachine = setup({
    types: {} as {
        context: {
            children: Array<ActorRef>,
            results: Array<any>
        },
        events: 
            | { type: 'SPAWN_CHILD'; data: any }
            | { type: 'CHILD_COMPLETE'; result: any }
    },
    actors: {
        childProcessor: childActor
    }
}).createMachine({
    id: 'parent',
    initial: 'ready',
    context: {
        children: [],
        results: []
    },
    states: {
        ready: {
            on: {
                SPAWN_CHILD: {
                    actions: assign({
                        children: ({ context, spawn, event }) => {
                            const child = spawn('childProcessor', {
                                input: { data: event.data },
                                id: \`child-\${Date.now()}\`
                            });
                            return [...context.children, child];
                        }
                    })
                }
            }
        },
        processing: {
            on: {
                CHILD_COMPLETE: {
                    actions: assign({
                        results: ({ context, event }) => [
                            ...context.results,
                            event.result
                        ]
                    })
                }
            }
        }
    },
    on: {
        'xstate.done.actor.*': {
            actions: sendTo(
                ({ self }) => self,
                ({ event }) => ({
                    type: 'CHILD_COMPLETE',
                    result: event.output
                })
            )
        }
    }
});
                `.trim(),
      },
    ];
  }

  async runTests() {
    const results = [];

    for (const testCase of this.testCases) {
      const testResult = await this.runSingleTest(testCase);
      results.push(testResult);
    }

    const allPassed = results.every((result) => result.passed);

    return {
      status: allPassed ? 'pass' : 'fail',
      tests: results,
      summary: {
        total: results.length,
        passed: results.filter((r) => r.passed).length,
        failed: results.filter((r) => !r.passed).length,
      },
    };
  }

  async runSingleTest(testCase) {
    try {
      const result = await this.createHighlightedOutput(testCase.code);
      const validations = this.validateXStateHighlighting(result.content);
      const passed = validations.every((v) => v.passed);

      // Add debug info for failing tests
      let debugInfo = null;
      if (!passed) {
        debugInfo = this.generateDebugInfo(testCase, result);
      }

      return {
        name: testCase.name,
        passed,
        output: result.display,
        validations: validations.filter((v) => !v.passed),
        debugInfo,
      };
    } catch (error) {
      return {
        name: testCase.name,
        passed: false,
        error: error.message,
      };
    }
  }

  async createHighlightedOutput(code) {
    const container = document.createElement('div');
    const highlighter = document.createElement('syntax-highlighter');
    highlighter.textContent = code;
    container.appendChild(highlighter);

    // Append to body temporarily to ensure proper rendering
    document.body.appendChild(container);

    // Wait for highlighting to complete
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Get the shadow DOM content if available
    let highlightedContent = '';
    if (highlighter.shadowRoot) {
      const codeElement = highlighter.shadowRoot.querySelector('code, pre');
      if (codeElement) {
        highlightedContent = codeElement.innerHTML;
      } else {
        // Get all shadow root content
        highlightedContent = highlighter.shadowRoot.innerHTML;
      }
    }

    // For display purposes, keep the whole element
    const displayHtml = container.innerHTML;

    // Clean up
    document.body.removeChild(container);

    return {
      display: displayHtml,
      content: highlightedContent,
    };
  }

  validateXStateHighlighting(content) {
    // Use XState validator if available
    if (window.XStateValidator) {
      const validator = new window.XStateValidator();
      return validator.validateContent(content);
    }

    // Fallback to base validator
    if (window.BaseSyntaxValidator) {
      const validator = new window.BaseSyntaxValidator();
      return validator.validateContent(content);
    }
    return [
      {
        name: 'Content Extraction',
        passed: content && content.length > 0,
        issues: content ? [] : ['No content extracted from shadow DOM'],
      },
    ];
  }

  generateDebugInfo(testCase, result) {
    const escapeForDisplay = (str) =>
      str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    let debugInfo = `Test: ${testCase.name}\n`;
    debugInfo += `Raw Code Sample:\n${escapeForDisplay(testCase.code.substring(0, 200))}...\n\n`;
    debugInfo += `Highlighted Output Sample:\n${escapeForDisplay(result.content.substring(0, 300))}...\n\n`;

    // Check for XState-specific CSS variables
    const xstateVars = [
      '--xstate-keyword',
      '--context-property',
      '--event-property',
      '--state-name',
      '--event-name',
    ];
    debugInfo += 'XState CSS Variables Found:\n';
    xstateVars.forEach((varName) => {
      const found = result.content.includes(varName);
      debugInfo += `  ${varName}: ${found ? '✓ YES' : '✗ NO'}\n`;
    });

    // Check for XState patterns
    debugInfo += '\nXState Patterns:\n';
    debugInfo += `  Contains createMachine: ${result.content.includes('createMachine') ? '✓ YES' : '✗ NO'}\n`;
    debugInfo += `  Contains context: ${result.content.includes('context') ? '✓ YES' : '✗ NO'}\n`;
    debugInfo += `  Contains states: ${result.content.includes('states') ? '✓ YES' : '✗ NO'}\n`;
    debugInfo += `  Contains actions: ${result.content.includes('actions') ? '✓ YES' : '✗ NO'}\n`;
    debugInfo += `  Contains assign: ${result.content.includes('assign') ? '✓ YES' : '✗ NO'}\n`;

    return debugInfo;
  }
}

// Register the parser
window.V2TestParsers = window.V2TestParsers || {};
window.V2TestParsers.xstate = new V2XStateParser();
