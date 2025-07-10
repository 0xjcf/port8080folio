// Performance tests for V2 syntax highlighter

class V2PerformanceParser {
  constructor() {
    this.testCases = [
      {
        name: 'Small Code Block (10 lines)',
        lines: 10,
        generator: this.generateSmallCode,
      },
      {
        name: 'Medium Code Block (100 lines)',
        lines: 100,
        generator: this.generateMediumCode,
      },
      {
        name: 'Large Code Block (500 lines)',
        lines: 500,
        generator: this.generateLargeCode,
      },
      {
        name: 'Complex XState Machine (200 lines)',
        lines: 200,
        generator: this.generateComplexXState,
      },
    ];
  }

  generateSmallCode(_lines) {
    return `
const config = {
    theme: 'dark',
    color: '#0ea5e9'
};

function processData(data) {
    return data.map(item => ({
        ...item,
        processed: true
    }));
}
        `.trim();
  }

  generateMediumCode(lines) {
    const code = [];
    for (let i = 0; i < lines / 10; i++) {
      code.push(
        `
// Function ${i}
function process${i}(data) {
    const result = data.filter(item => item.active);
    const mapped = result.map(item => ({
        id: item.id,
        name: item.name,
        value: item.value * ${i + 1}
    }));
    return mapped.reduce((acc, curr) => acc + curr.value, 0);
}
            `.trim()
      );
    }
    return code.join('\n\n');
  }

  generateLargeCode(lines) {
    const code = [];

    // Generate a large React component
    code.push(`import React, { useState, useEffect, useCallback, useMemo } from 'react';`);
    code.push(`import { createMachine, assign } from 'xstate';`);
    code.push('');

    // Add multiple components
    for (let i = 0; i < lines / 20; i++) {
      code.push(
        `
const Component${i} = ({ data, onUpdate }) => {
    const [state, setState] = useState({
        value: ${i},
        active: ${i % 2 === 0}
    });
    
    const handleClick = useCallback(() => {
        setState(prev => ({
            ...prev,
            value: prev.value + 1
        }));
        onUpdate(state.value);
    }, [state.value, onUpdate]);
    
    return (
        <div className="component-${i}">
            <h3>Component ${i}</h3>
            <p>Value: {state.value}</p>
            <button onClick={handleClick}>
                {state.active ? 'Active' : 'Inactive'}
            </button>
        </div>
    );
};
            `.trim()
      );
    }

    return code.join('\n\n');
  }

  generateComplexXState(_lines) {
    return `
import { setup, assign, sendTo, enqueueActions } from 'xstate';

const complexMachine = setup({
    types: {} as {
        context: {
            items: Array<any>;
            currentIndex: number;
            errors: Array<string>;
            processing: boolean;
        }
    },
    actors: {
        processor: fromPromise(async ({ input }) => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { processed: true, data: input };
        })
    },
    guards: {
        hasItems: ({ context }) => context.items.length > 0,
        canProcess: ({ context }) => !context.processing,
        isComplete: ({ context }) => context.currentIndex >= context.items.length
    },
    actions: {
        processNext: assign({
            currentIndex: ({ context }) => context.currentIndex + 1,
            processing: true
        }),
        handleError: assign({
            errors: ({ context, event }) => [...context.errors, event.error],
            processing: false
        }),
        reset: assign({
            items: [],
            currentIndex: 0,
            errors: [],
            processing: false
        })
    }
}).createMachine({
    id: 'complex',
    initial: 'idle',
    context: {
        items: [],
        currentIndex: 0,
        errors: [],
        processing: false
    },
    states: {
        idle: {
            on: {
                START: {
                    target: 'processing',
                    guard: 'hasItems'
                },
                ADD_ITEM: {
                    actions: assign({
                        items: ({ context, event }) => [...context.items, event.item]
                    })
                }
            }
        },
        processing: {
            always: [
                {
                    target: 'complete',
                    guard: 'isComplete'
                },
                {
                    target: 'processingItem'
                }
            ]
        },
        processingItem: {
            invoke: {
                src: 'processor',
                input: ({ context }) => context.items[context.currentIndex],
                onDone: {
                    target: 'processing',
                    actions: 'processNext'
                },
                onError: {
                    target: 'error',
                    actions: 'handleError'
                }
            }
        },
        error: {
            on: {
                RETRY: 'processing',
                SKIP: {
                    target: 'processing',
                    actions: 'processNext'
                },
                ABORT: 'idle'
            }
        },
        complete: {
            entry: enqueueActions(({ enqueue, context }) => {
                console.log('Processing complete');
                console.log(\`Processed \${context.currentIndex} items\`);
                console.log(\`Errors: \${context.errors.length}\`);
            }),
            on: {
                RESET: {
                    target: 'idle',
                    actions: 'reset'
                }
            }
        }
    }
});
        `.trim();
  }

  async runTests() {
    const results = [];
    const performanceData = {
      times: [],
      avgTime: 0,
      minTime: Number.POSITIVE_INFINITY,
      maxTime: 0,
      totalTests: 0,
    };

    for (const testCase of this.testCases) {
      const testResult = await this.runPerformanceTest(testCase);
      results.push(testResult);

      // Collect performance data
      if (testResult.times) {
        performanceData.times.push(...testResult.times);
        performanceData.totalTests += testResult.times.length;
      }
    }

    // Calculate overall metrics
    if (performanceData.times.length > 0) {
      performanceData.avgTime = Math.round(
        performanceData.times.reduce((a, b) => a + b, 0) / performanceData.times.length
      );
      performanceData.minTime = Math.round(Math.min(...performanceData.times));
      performanceData.maxTime = Math.round(Math.max(...performanceData.times));
    }

    const allPassed = results.every((result) => result.passed);

    return {
      status: allPassed ? 'pass' : 'fail',
      tests: results,
      performance: performanceData,
      summary: {
        total: results.length,
        passed: results.filter((r) => r.passed).length,
        failed: results.filter((r) => !r.passed).length,
      },
    };
  }

  async runPerformanceTest(testCase) {
    try {
      const code = testCase.generator(testCase.lines);
      const times = [];
      const iterations = testCase.lines < 100 ? 10 : testCase.lines < 500 ? 5 : 3;

      // Run multiple iterations
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        await this.createHighlightedOutput(code);
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      const output = this.generatePerformanceOutput(testCase.name, avgTime, times);

      // Add debug info if performance is slow
      let debugInfo = null;
      if (avgTime > 500) {
        // Warn if over 500ms
        debugInfo = this.generateDebugInfo(testCase, times, avgTime, code);
      }

      return {
        name: testCase.name,
        passed: avgTime < 1000, // Pass if under 1 second
        output: output,
        times: times,
        avgTime: avgTime,
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
    document.body.appendChild(container);

    // Wait for highlighting to complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Get the shadow DOM content if available (for validation)
    let highlightedContent = '';
    if (highlighter.shadowRoot) {
      const codeElement = highlighter.shadowRoot.querySelector('code, pre');
      if (codeElement) {
        highlightedContent = codeElement.innerHTML;
      } else {
        highlightedContent = highlighter.shadowRoot.innerHTML;
      }
    }

    document.body.removeChild(container);
    return highlightedContent;
  }

  generatePerformanceOutput(_name, avgTime, times) {
    const minTime = Math.round(Math.min(...times));
    const maxTime = Math.round(Math.max(...times));

    return `
            <div style="padding: 20px;">
                <div style="text-align: center;">
                    <div style="font-size: 48px; font-weight: 600; color: ${avgTime < 100 ? '#4ade80' : avgTime < 500 ? '#f59e0b' : '#ef4444'}; margin-bottom: 10px;">
                        ${avgTime}ms
                    </div>
                    <div style="font-size: 14px; color: #888; margin-bottom: 20px;">
                        Average time over ${times.length} runs
                    </div>
                    <div style="display: flex; justify-content: center; gap: 30px; font-size: 14px;">
                        <div>
                            <span style="color: #888;">Min:</span>
                            <span style="color: #e1e1e1; font-weight: 500;"> ${minTime}ms</span>
                        </div>
                        <div>
                            <span style="color: #888;">Max:</span>
                            <span style="color: #e1e1e1; font-weight: 500;"> ${maxTime}ms</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  generateDebugInfo(testCase, times, avgTime, code) {
    let debugInfo = 'Performance Debug Info:\n';
    debugInfo += `Test: ${testCase.name}\n`;
    debugInfo += `Code Size: ${code.length} characters, ${testCase.lines} lines\n\n`;

    debugInfo += 'Performance Metrics:\n';
    debugInfo += `  Average Time: ${avgTime}ms ${avgTime > 500 ? '⚠️ SLOW' : ''}\n`;
    debugInfo += `  Min Time: ${Math.round(Math.min(...times))}ms\n`;
    debugInfo += `  Max Time: ${Math.round(Math.max(...times))}ms\n`;
    debugInfo += `  Variance: ${Math.round(Math.max(...times) - Math.min(...times))}ms\n`;
    debugInfo += `  Iterations: ${times.length}\n\n`;

    debugInfo += 'Individual Run Times:\n';
    times.forEach((time, index) => {
      debugInfo += `  Run ${index + 1}: ${Math.round(time)}ms\n`;
    });

    // Performance recommendations
    debugInfo += '\nPerformance Analysis:\n';
    if (avgTime > 1000) {
      debugInfo += '  ❌ CRITICAL: Performance is over 1 second!\n';
      debugInfo += '  - Consider optimizing the tokenizer\n';
      debugInfo += '  - Check for inefficient regex patterns\n';
    } else if (avgTime > 500) {
      debugInfo += '  ⚠️ WARNING: Performance is slower than expected\n';
      debugInfo += '  - May impact user experience on large files\n';
      debugInfo += '  - Consider caching or lazy loading\n';
    } else if (avgTime > 200) {
      debugInfo += '  ℹ️ INFO: Performance is acceptable but could be improved\n';
    } else {
      debugInfo += '  ✓ Performance is good\n';
    }

    // Code complexity analysis
    const hasComplexPatterns =
      code.includes('${') || code.includes('createMachine') || code.includes('jsx');
    if (hasComplexPatterns) {
      debugInfo += '\nCode Complexity:\n';
      debugInfo += `  Template literals: ${code.includes('${') ? '✓ YES' : '✗ NO'}\n`;
      debugInfo += `  XState patterns: ${code.includes('createMachine') ? '✓ YES' : '✗ NO'}\n`;
      debugInfo += `  JSX elements: ${code.includes('<') && code.includes('>') ? '✓ YES' : '✗ NO'}\n`;
    }

    return debugInfo;
  }
}

// Register the parser
window.V2TestParsers = window.V2TestParsers || {};
window.V2TestParsers.performance = new V2PerformanceParser();
