import {
  createTestContainer,
  extractHighlightedContent,
  waitForHighlighting,
} from './test-helper.js';

export class SectionsParser {
  constructor() {
    this.testCases = [
      {
        name: 'Context Section Highlighting',
        section: 'context',
        code: `
const machine = createMachine({
    id: 'userAuth',
    initial: 'idle',
    context: {
        user: null,
        token: null,
        error: null,
        attempts: 0,
        lastLoginTime: null
    },
    states: {
        idle: {
            on: {
                LOGIN: 'authenticating'
            }
        },
        authenticating: {
            invoke: {
                src: 'authenticate',
                onDone: {
                    target: 'authenticated',
                    actions: assign({
                        user: (context, event) => event.data.user,
                        token: (context, event) => event.data.token,
                        lastLoginTime: () => new Date()
                    })
                }
            }
        }
    }
});
                `.trim(),
      },
      {
        name: 'States Section Highlighting',
        section: 'states',
        code: `
const trafficLight = createMachine({
    id: 'traffic',
    initial: 'red',
    states: {
        red: {
            after: {
                5000: 'green'
            }
        },
        yellow: {
            after: {
                2000: 'red'
            }
        },
        green: {
            after: {
                10000: 'yellow'
            }
        },
        flashing: {
            type: 'compound',
            initial: 'on',
            states: {
                on: {
                    after: {
                        500: 'off'
                    }
                },
                off: {
                    after: {
                        500: 'on'
                    }
                }
            }
        }
    }
});
                `.trim(),
      },
      {
        name: 'Events (on) Section Highlighting',
        section: 'on',
        code: `
const doorMachine = createMachine({
    id: 'door',
    initial: 'closed',
    states: {
        closed: {
            on: {
                OPEN: 'opening',
                LOCK: 'locked'
            }
        },
        opening: {
            on: {
                OPENED: 'open',
                CLOSE: 'closing'
            }
        },
        open: {
            on: {
                CLOSE: 'closing',
                AUTO_CLOSE: {
                    target: 'closing',
                    cond: 'isAutoCloseEnabled'
                }
            }
        },
        closing: {
            on: {
                CLOSED: 'closed',
                OPEN: 'opening',
                OBSTACLE: 'open'
            }
        },
        locked: {
            on: {
                UNLOCK: 'closed',
                FORCE_OPEN: {
                    target: 'broken',
                    actions: 'triggerAlarm'
                }
            }
        }
    }
});
                `.trim(),
      },
      {
        name: 'Actions Section Highlighting',
        section: 'actions',
        code: `
const counterMachine = createMachine({
    context: {
        count: 0,
        max: 10
    },
    states: {
        active: {
            on: {
                INCREMENT: {
                    actions: [
                        assign({
                            count: (context) => context.count + 1
                        }),
                        'logIncrement',
                        'checkMax'
                    ]
                },
                DECREMENT: {
                    actions: assign({
                        count: (context) => Math.max(0, context.count - 1)
                    })
                },
                RESET: {
                    actions: [
                        assign({ count: 0 }),
                        'logReset'
                    ]
                }
            }
        }
    }
}, {
    actions: {
        logIncrement: (context, event) => {
            console.log(\`Incremented to \${context.count + 1}\`);
        },
        logReset: () => {
            console.log('Counter reset');
        },
        checkMax: (context) => {
            if (context.count >= context.max) {
                console.log('Maximum reached!');
            }
        }
    }
});
                `.trim(),
      },
      {
        name: 'Guards Section Highlighting',
        section: 'guards',
        code: `
const formMachine = createMachine({
    context: {
        email: '',
        password: '',
        confirmPassword: ''
    },
    states: {
        editing: {
            on: {
                SUBMIT: {
                    target: 'validating',
                    cond: 'isFormValid'
                },
                UPDATE_EMAIL: {
                    actions: assign({
                        email: (context, event) => event.value
                    }),
                    cond: 'isValidEmail'
                },
                UPDATE_PASSWORD: {
                    actions: assign({
                        password: (context, event) => event.value
                    }),
                    cond: 'isStrongPassword'
                }
            }
        },
        validating: {
            always: [
                {
                    target: 'success',
                    cond: 'allFieldsValid'
                },
                {
                    target: 'editing',
                    cond: 'hasValidationErrors'
                }
            ]
        }
    }
}, {
    guards: {
        isFormValid: (context) => {
            return context.email && context.password && 
                   context.password === context.confirmPassword;
        },
        isValidEmail: (context, event) => {
            const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            return emailRegex.test(event.value);
        },
        isStrongPassword: (context, event) => {
            return event.value && event.value.length >= 8;
        },
        allFieldsValid: (context) => {
            return context.email && context.password;
        },
        hasValidationErrors: (context) => {
            return !context.email || !context.password;
        }
    }
});
                `.trim(),
      },
      {
        name: 'Invoke Section Highlighting',
        section: 'invoke',
        code: `
const apiMachine = createMachine({
    id: 'api',
    initial: 'idle',
    context: {
        data: null,
        error: null
    },
    states: {
        idle: {
            on: {
                FETCH: 'loading'
            }
        },
        loading: {
            invoke: {
                id: 'fetchData',
                src: 'fetchFromAPI',
                input: ({ event }) => ({
                    url: event.url,
                    options: event.options
                }),
                onDone: {
                    target: 'success',
                    actions: assign({
                        data: ({ event }) => event.output
                    })
                },
                onError: {
                    target: 'error',
                    actions: assign({
                        error: ({ event }) => event.error
                    })
                }
            },
            on: {
                CANCEL: {
                    target: 'idle',
                    actions: stopChild('fetchData')
                }
            }
        },
        success: {
            invoke: {
                src: 'cacheData',
                input: ({ context }) => context.data
            },
            on: {
                REFRESH: 'loading'
            }
        },
        error: {
            invoke: {
                src: 'logError',
                input: ({ context }) => context.error
            },
            on: {
                RETRY: 'loading'
            }
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
      const outputs = await this.testSectionHighlighting(testCase.code, testCase.section);

      const validations = [
        this.validateSectionHighlight(outputs, testCase.section),
        this.validateSectionControls(outputs),
        this.validateNonSelectedDimming(outputs, testCase.section),
      ];

      const passed = validations.every((v) => v.passed);

      return {
        name: testCase.name,
        passed,
        output: this.generateSectionComparisonHTML(outputs, testCase.section),
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

  async testSectionHighlighting(code, targetSection) {
    const outputs = {};

    // Wait for highlighters to be loaded
    if (window.highlightersLoaded) {
      await window.highlightersLoaded;
    }

    // Test V2 syntax-highlighter with section highlighting
    try {
      const v2El = document.createElement('syntax-highlighter-v2');
      v2El.textContent = code;
      document.body.appendChild(v2El);

      // Wait for initial highlighting
      await waitForHighlighting(v2El);
      outputs.default = extractHighlightedContent(v2El);

      // Test section highlighting if the component supports it
      if (v2El.highlightSection) {
        v2El.highlightSection(targetSection);
        await waitForHighlighting(v2El);
        outputs.sectionHighlighted = extractHighlightedContent(v2El);

        // Test clearing section highlight
        v2El.clearSectionHighlight();
        await waitForHighlighting(v2El);
        outputs.cleared = extractHighlightedContent(v2El);
      } else {
        outputs.sectionHighlighted = 'Section highlighting not supported';
        outputs.cleared = 'Section highlighting not supported';
      }

      document.body.removeChild(v2El);
    } catch (error) {
      outputs.v2 = `Error: ${error.message}`;
    }

    return outputs;
  }

  validateSectionHighlight(outputs, targetSection) {
    const checks = [];

    if (outputs.sectionHighlighted && !outputs.sectionHighlighted.includes('Error:')) {
      // Check if the target section is properly highlighted
      const sectionKeywords = this.getSectionKeywords(targetSection);

      sectionKeywords.forEach((keyword) => {
        // Look for highlighted section keywords
        const highlightRegex = new RegExp(`<span[^>]*highlight[^>]*>${keyword}</span>`, 'i');
        if (!highlightRegex.test(outputs.sectionHighlighted)) {
          checks.push({
            section: targetSection,
            keyword,
            issue: 'Section keyword not highlighted',
          });
        }
      });

      // Check if non-section content is dimmed
      const dimmingRegex = /<span[^>]*dim[^>]*>/i;
      if (!dimmingRegex.test(outputs.sectionHighlighted)) {
        checks.push({
          section: targetSection,
          issue: 'Non-section content not dimmed',
        });
      }
    } else {
      checks.push({
        section: targetSection,
        issue: 'Section highlighting failed or not supported',
      });
    }

    return {
      name: `Section Highlighting (${targetSection})`,
      passed: checks.length === 0,
      issues: checks,
    };
  }

  validateSectionControls(outputs) {
    const checks = [];

    // Check if section controls are present in the component
    if (outputs.default && !outputs.default.includes('Error:')) {
      const controlsRegex = /<button[^>]*data-section[^>]*>/i;
      if (!controlsRegex.test(outputs.default)) {
        checks.push({
          issue: 'Section control buttons not found',
        });
      }
    }

    return {
      name: 'Section Controls',
      passed: checks.length === 0,
      issues: checks,
    };
  }

  validateNonSelectedDimming(outputs, targetSection) {
    const checks = [];

    if (outputs.sectionHighlighted && !outputs.sectionHighlighted.includes('Error:')) {
      // Check that content outside the target section is dimmed
      const nonSectionKeywords = this.getNonSectionKeywords(targetSection);

      nonSectionKeywords.forEach((keyword) => {
        // Look for dimmed non-section content
        const dimRegex = new RegExp(`<span[^>]*dim[^>]*>${keyword}</span>`, 'i');
        if (!dimRegex.test(outputs.sectionHighlighted)) {
          checks.push({
            section: targetSection,
            keyword,
            issue: 'Non-section content not properly dimmed',
          });
        }
      });
    }

    return {
      name: 'Non-Section Dimming',
      passed: checks.length === 0,
      issues: checks,
    };
  }

  getSectionKeywords(section) {
    const keywords = {
      context: ['context', 'user', 'token', 'error', 'attempts', 'count', 'max'],
      states: ['states', 'red', 'yellow', 'green', 'flashing', 'on', 'off'],
      on: ['on', 'OPEN', 'CLOSE', 'LOCK', 'UNLOCK', 'INCREMENT', 'DECREMENT'],
      actions: ['actions', 'assign', 'logIncrement', 'logReset', 'checkMax'],
      guards: ['guards', 'cond', 'isFormValid', 'isValidEmail', 'isStrongPassword'],
      invoke: ['invoke', 'src', 'onDone', 'onError', 'fetchFromAPI', 'cacheData'],
    };

    return keywords[section] || [];
  }

  getNonSectionKeywords(section) {
    // Return keywords that should be dimmed (not in the target section)
    const allKeywords = {
      context: ['states', 'on', 'actions'],
      states: ['context', 'actions', 'guards'],
      on: ['context', 'states', 'actions'],
      actions: ['context', 'states', 'on'],
      guards: ['context', 'states', 'actions'],
      invoke: ['context', 'states', 'actions'],
    };

    return allKeywords[section] || [];
  }

  generateSectionComparisonHTML(outputs, section) {
    // For sections parser, we show V2 in three states instead of three highlighters
    return `
            <div class="highlighter-output">
                <h5 style="margin: 0 0 10px 0; color: #888; font-size: 12px; text-align: center;">Default</h5>
                ${createTestContainer(outputs.default || 'No output')}
            </div>
            <div class="highlighter-output">
                <h5 style="margin: 0 0 10px 0; color: #888; font-size: 12px; text-align: center;">Section: ${section}</h5>
                ${createTestContainer(outputs.sectionHighlighted || 'No output')}
            </div>
            <div class="highlighter-output">
                <h5 style="margin: 0 0 10px 0; color: #888; font-size: 12px; text-align: center;">Cleared</h5>
                ${createTestContainer(outputs.cleared || 'No output')}
            </div>
        `;
  }
}
