import {
  createTestContainer,
  extractHighlightedContent,
  waitForHighlighting,
} from './test-helper.js';

export class XStateParser {
  constructor() {
    this.testCases = [
      {
        name: 'XState Machine Definition',
        code: `
import { createMachine, assign } from 'xstate';

const lightMachine = createMachine({
    id: 'light',
    initial: 'green',
    context: {
        count: 0,
        elapsed: 0
    },
    states: {
        green: {
            on: {
                TIMER: 'yellow'
            }
        },
        yellow: {
            on: {
                TIMER: 'red'
            }
        },
        red: {
            on: {
                TIMER: 'green'
            }
        }
    }
});
                `.trim(),
      },
      {
        name: 'XState Actions and Guards',
        code: `
const machine = createMachine({
    context: {
        user: null,
        error: null
    },
    states: {
        idle: {
            on: {
                LOGIN: {
                    target: 'loading',
                    actions: assign({
                        error: null
                    })
                }
            }
        },
        loading: {
            invoke: {
                src: 'loginService',
                onDone: {
                    target: 'success',
                    actions: assign({
                        user: (context, event) => event.data
                    })
                },
                onError: {
                    target: 'error',
                    actions: assign({
                        error: (context, event) => event.data
                    })
                }
            }
        }
    }
}, {
    actions: {
        clearError: assign({ error: null }),
        setUser: assign({ user: (context, event) => event.user })
    },
    guards: {
        isValidUser: (context, event) => {
            return event.user && event.user.id;
        }
    }
});
                `.trim(),
      },
      {
        name: 'XState Actor Model',
        code: `
import { createActor, fromPromise } from 'xstate';

const fetchActor = fromPromise(async ({ input }) => {
    const response = await fetch(\`/api/users/\${input.userId}\`);
    return response.json();
});

const parentMachine = createMachine({
    context: {
        users: [],
        currentUser: null
    },
    states: {
        idle: {
            on: {
                FETCH_USER: 'fetching'
            }
        },
        fetching: {
            invoke: {
                src: fetchActor,
                input: ({ event }) => ({ userId: event.userId }),
                onDone: {
                    target: 'success',
                    actions: assign({
                        currentUser: ({ event }) => event.output
                    })
                }
            }
        }
    }
});

const actor = createActor(parentMachine);
actor.start();
actor.send({ type: 'FETCH_USER', userId: 123 });
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
      const outputs = await this.testAllHighlighters(testCase.code);

      const validations = [
        this.validateXStateKeywords(outputs),
        this.validateContextProperties(outputs),
        this.validateEventProperties(outputs),
        this.validateStateNames(outputs),
        this.validateActionFunctions(outputs),
      ];

      const passed = validations.every((v) => v.passed);

      return {
        name: testCase.name,
        passed,
        output: this.generateComparisonHTML(outputs),
        validations: validations.filter((v) => !v.passed),
      };
    } catch (error) {
      return {
        name: testCase.name,
        passed: false,
        error: error.message,
      };
    }
  }

  async testAllHighlighters(code) {
    const outputs = {};

    // Wait for highlighters to be loaded
    if (window.highlightersLoaded) {
      await window.highlightersLoaded;
    }

    // Test original syntax-highlighter
    try {
      const originalEl = document.createElement('syntax-highlighter');
      originalEl.textContent = code;
      document.body.appendChild(originalEl);
      await waitForHighlighting(originalEl);
      outputs.original = extractHighlightedContent(originalEl);
      document.body.removeChild(originalEl);
    } catch (error) {
      outputs.original = `Error: ${error.message}`;
    }

    // Test v2 syntax-highlighter (should have best XState support)
    try {
      const v2El = document.createElement('syntax-highlighter-v2');
      v2El.textContent = code;
      document.body.appendChild(v2El);
      await waitForHighlighting(v2El);
      outputs.v2 = extractHighlightedContent(v2El);
      document.body.removeChild(v2El);
    } catch (error) {
      outputs.v2 = `Error: ${error.message}`;
    }

    // Test code-highlight
    try {
      const simpleEl = document.createElement('code-highlight');
      simpleEl.textContent = code;
      document.body.appendChild(simpleEl);
      await waitForHighlighting(simpleEl);
      outputs.simple = extractHighlightedContent(simpleEl);
      document.body.removeChild(simpleEl);
    } catch (error) {
      outputs.simple = `Error: ${error.message}`;
    }

    return outputs;
  }

  validateXStateKeywords(outputs) {
    const xstateKeywords = [
      'createMachine',
      'createActor',
      'assign',
      'fromPromise',
      'invoke',
      'onDone',
      'onError',
    ];
    const checks = [];

    Object.entries(outputs).forEach(([version, html]) => {
      if (html.includes('Error:')) return;

      xstateKeywords.forEach((keyword) => {
        // Look for XState keywords with special highlighting
        const keywordRegex = new RegExp(`<span[^>]*[^>]*>${keyword}</span>`, 'i');
        if (!keywordRegex.test(html)) {
          checks.push({ version, keyword, issue: 'XState keyword not highlighted' });
        }
      });
    });

    return {
      name: 'XState Keywords',
      passed: checks.length === 0,
      issues: checks,
    };
  }

  validateContextProperties(outputs) {
    const contextProps = ['count', 'elapsed', 'user', 'error', 'users', 'currentUser'];
    const checks = [];

    Object.entries(outputs).forEach(([version, html]) => {
      if (html.includes('Error:')) return;

      // V2 should have special context property highlighting
      if (version === 'v2') {
        contextProps.forEach((prop) => {
          // Look for context properties with special styling (pink/red in v2)
          const propRegex = new RegExp(`<span[^>]*class[^>]*context[^>]*>${prop}</span>`, 'i');
          if (!propRegex.test(html)) {
            checks.push({
              version,
              property: prop,
              issue: 'Context property not specially highlighted',
            });
          }
        });
      }
    });

    return {
      name: 'Context Properties',
      passed: checks.length === 0,
      issues: checks,
    };
  }

  validateEventProperties(outputs) {
    const _eventProps = ['type', 'userId', 'data'];
    const eventTypes = ['TIMER', 'LOGIN', 'FETCH_USER'];
    const checks = [];

    Object.entries(outputs).forEach(([version, html]) => {
      if (html.includes('Error:')) return;

      // V2 should have special event highlighting
      if (version === 'v2') {
        eventTypes.forEach((eventType) => {
          // Look for event types with special styling (cyan/blue in v2)
          const eventRegex = new RegExp(`<span[^>]*>${eventType}</span>`, 'i');
          if (!eventRegex.test(html)) {
            checks.push({
              version,
              event: eventType,
              issue: 'Event type not highlighted',
            });
          }
        });
      }
    });

    return {
      name: 'Event Properties',
      passed: checks.length === 0,
      issues: checks,
    };
  }

  validateStateNames(outputs) {
    const stateNames = [
      'green',
      'yellow',
      'red',
      'idle',
      'loading',
      'success',
      'error',
      'fetching',
    ];
    const checks = [];

    Object.entries(outputs).forEach(([version, html]) => {
      if (html.includes('Error:')) return;

      // V2 should have special state name highlighting
      if (version === 'v2') {
        stateNames.forEach((stateName) => {
          // Look for state names with special styling (purple in v2)
          const stateRegex = new RegExp(`<span[^>]*>${stateName}</span>`, 'i');
          if (!stateRegex.test(html)) {
            checks.push({
              version,
              state: stateName,
              issue: 'State name not highlighted',
            });
          }
        });
      }
    });

    return {
      name: 'State Names',
      passed: checks.length === 0,
      issues: checks,
    };
  }

  validateActionFunctions(outputs) {
    const actionFunctions = ['assign', 'clearError', 'setUser'];
    const checks = [];

    Object.entries(outputs).forEach(([version, html]) => {
      if (html.includes('Error:')) return;

      actionFunctions.forEach((action) => {
        // Look for action functions highlighted appropriately
        const actionRegex = new RegExp(`<span[^>]*>${action}</span>`, 'i');
        if (!actionRegex.test(html)) {
          checks.push({
            version,
            action,
            issue: 'Action function not highlighted',
          });
        }
      });
    });

    return {
      name: 'Action Functions',
      passed: checks.length === 0,
      issues: checks,
    };
  }

  generateComparisonHTML(outputs) {
    // Return just the three columns without headers (headers are in the parent grid)
    return `
            <div class="highlighter-output">
                ${createTestContainer(outputs.original || 'No output')}
            </div>
            <div class="highlighter-output">
                ${createTestContainer(outputs.v2 || 'No output')}
            </div>
            <div class="highlighter-output">
                ${createTestContainer(outputs.simple || 'No output')}
            </div>
        `;
  }
}
