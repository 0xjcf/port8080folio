import { SyntaxKind } from 'ts-morph';
import type { AnyRuleConfig, RuleContext, TsSourceFile, Violation } from '../types.js';
import { Rule } from './base.js';

export class NoTimers extends Rule {
  private readonly TIMER_FUNCTIONS = [
    'setTimeout',
    'setInterval',
    'clearTimeout',
    'clearInterval',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'requestIdleCallback',
    'cancelIdleCallback',
  ];

  private readonly GLOBAL_TIMER_PATTERNS = [
    /^window\.setTimeout/,
    /^window\.setInterval/,
    /^window\.clearTimeout/,
    /^window\.clearInterval/,
    /^window\.requestAnimationFrame/,
    /^window\.cancelAnimationFrame/,
    /^global\.setTimeout/,
    /^global\.setInterval/,
  ];

  constructor(config: AnyRuleConfig = {}) {
    super({
      ...config,
      message:
        config.message || 'Use state machine delays/services instead of setTimeout/setInterval',
    });
  }

  async check(
    sourceFile: TsSourceFile,
    _content: string,
    context: RuleContext
  ): Promise<Violation[]> {
    const violations: Violation[] = [];

    // Find all call expressions
    const callExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);

    for (const callExpr of callExpressions) {
      const expression = callExpr.getExpression();
      let timerType: string | null = null;

      // Check for direct timer function calls (setTimeout, setInterval, etc.)
      if (expression.getKind() === SyntaxKind.Identifier) {
        const identifier = expression.asKind(SyntaxKind.Identifier);
        if (identifier) {
          const functionName = identifier.getText();
          if (this.TIMER_FUNCTIONS.includes(functionName)) {
            timerType = functionName;
          }
        }
      }

      // Check for property access timer calls (window.setTimeout, etc.)
      if (expression.getKind() === SyntaxKind.PropertyAccessExpression) {
        const propAccess = expression.asKind(SyntaxKind.PropertyAccessExpression);
        if (propAccess) {
          const fullExpression = propAccess.getText();
          const methodName = propAccess.getName();

          // Check if it matches global timer patterns
          if (
            this.GLOBAL_TIMER_PATTERNS.some((pattern) => pattern.test(fullExpression)) ||
            this.TIMER_FUNCTIONS.includes(methodName)
          ) {
            timerType = methodName;
          }
        }
      }

      if (timerType) {
        const position = this.getNodePosition(callExpr);
        const sourceContext = this.getSourceContext(sourceFile, position.line);
        const args = callExpr.getArguments();

        // Analyze the timer usage to provide specific guidance
        const timerAnalysis = this.analyzeTimerUsage(timerType, args);

        violations.push(
          this.createViolation({
            ruleId: 'no-timers',
            file: context.file,
            line: position.line,
            column: position.column,
            endLine: position.endLine,
            endColumn: position.endColumn,
            source: sourceContext,
            message: this.getSpecificMessage(timerType, timerAnalysis),
            fix: this.generatePrimaryFix(timerType, timerAnalysis, callExpr),
            suggestions: this.generateSuggestions(timerType, timerAnalysis, callExpr),
          })
        );
      }
    }

    return violations;
  }

  /**
   * Analyze timer usage to provide specific guidance
   */
  private analyzeTimerUsage(timerType: string, args: import('ts-morph').Node[]): TimerAnalysis {
    const analysis: TimerAnalysis = {
      type: timerType,
      hasDelay: false,
      delayValue: null,
      isRepeating: timerType === 'setInterval',
      purpose: 'unknown',
    };

    // Check if there's a delay argument
    if (args.length >= 2) {
      analysis.hasDelay = true;
      const delayArg = args[1];

      // Try to extract delay value if it's a literal
      if (delayArg.getKind() === SyntaxKind.NumericLiteral) {
        const numLiteral = delayArg.asKind(SyntaxKind.NumericLiteral);
        if (numLiteral) {
          analysis.delayValue = Number.parseInt(numLiteral.getLiteralValue().toString(), 10);
        }
      }
    }

    // Try to determine the purpose based on the callback content
    if (args.length >= 1) {
      const callback = args[0];
      const callbackText = callback.getText().toLowerCase();

      // Common patterns
      if (
        callbackText.includes('poll') ||
        callbackText.includes('fetch') ||
        callbackText.includes('check')
      ) {
        analysis.purpose = 'polling';
      } else if (callbackText.includes('debounce') || callbackText.includes('throttle')) {
        analysis.purpose = 'debouncing';
      } else if (callbackText.includes('delay') || callbackText.includes('wait')) {
        analysis.purpose = 'delay';
      } else if (callbackText.includes('animation') || callbackText.includes('transition')) {
        analysis.purpose = 'animation';
      } else if (callbackText.includes('retry') || callbackText.includes('attempt')) {
        analysis.purpose = 'retry';
      } else if (callbackText.includes('cleanup') || callbackText.includes('clear')) {
        analysis.purpose = 'cleanup';
      }
    }

    return analysis;
  }

  /**
   * Get specific message based on timer type and usage
   */
  private getSpecificMessage(timerType: string, analysis: TimerAnalysis): string {
    const baseMessage = `Avoid ${timerType}().`;

    switch (analysis.purpose) {
      case 'polling':
        return `${baseMessage} Use XState services with invoke patterns for data polling.`;
      case 'debouncing':
        return `${baseMessage} Use XState delayed transitions for debouncing user input.`;
      case 'delay':
        return `${baseMessage} Use XState after: delays for timed state transitions.`;
      case 'animation':
        return `${baseMessage} Use CSS transitions or XState delayed transitions for animations.`;
      case 'retry':
        return `${baseMessage} Use XState retry patterns with delayed transitions.`;
      case 'cleanup':
        return `${baseMessage} Use XState cleanup actions in state exit handlers.`;
      default:
        if (analysis.isRepeating) {
          return `${baseMessage} Use XState services with invoke patterns for recurring operations.`;
        }
        return `${baseMessage} Use XState delayed transitions or services for async operations.`;
    }
  }

  /**
   * Generate suggestions based on timer usage
   */
  private generateSuggestions(
    _timerType: string,
    analysis: TimerAnalysis,
    node?: import('ts-morph').Node
  ): Array<{ desc: string; fix: { range: [number, number]; text: string } }> {
    const suggestions = [];

    // Calculate real ranges if we have a node
    const start = node?.getStart() || 0;
    const end = node?.getEnd() || 0;

    // Specific suggestions based on the timer purpose
    switch (analysis.purpose) {
      case 'polling':
        suggestions.push({
          desc: 'Use XState invoke pattern for data polling',
          fix: {
            range: [start, end] as [number, number],
            text: this.formatTodo(`Replace with XState service:
  invoke: {
    src: 'pollData',
    onDone: { actions: 'handleData' }
  }`),
          },
        });
        break;

      case 'debouncing':
        suggestions.push({
          desc: 'Use XState delayed transitions for debouncing',
          fix: {
            range: [start, end] as [number, number],
            text: this.formatTodo(`Replace with delayed transition:
  states: {
    debouncing: {
      after: { ${analysis.delayValue || 300}: 'processing' }
    }
  }`),
          },
        });
        break;

      case 'delay':
        suggestions.push({
          desc: 'Use XState after delays for timed transitions',
          fix: {
            range: [start, end] as [number, number],
            text: this.formatTodo(`Replace with delayed transition:
  states: {
    waiting: {
      after: { ${analysis.delayValue || 1000}: 'next' }
    }
  }`),
          },
        });
        break;

      case 'retry':
        suggestions.push({
          desc: 'Use XState retry pattern with delays',
          fix: {
            range: [start, end] as [number, number],
            text: this.formatTodo(`Replace with retry pattern:
  states: {
    retrying: {
      after: { ${analysis.delayValue || 1000}: 'attempting' }
    }
  }`),
          },
        });
        break;

      default:
        if (analysis.isRepeating) {
          suggestions.push({
            desc: 'Use XState service for recurring operations',
            fix: {
              range: [start, end] as [number, number],
              text: this.formatTodo(`Replace with XState service:
  invoke: {
    src: 'recurringTask',
    onDone: { target: '.idle' }
  }`),
            },
          });
        } else {
          suggestions.push({
            desc: 'Use XState delayed transition',
            fix: {
              range: [start, end] as [number, number],
              text: this.formatTodo(`Replace with delayed transition:
  after: { ${analysis.delayValue || 1000}: 'nextState' }`),
            },
          });
        }
    }

    // Removed redundant generic suggestion that duplicates primary fix

    // Cleanup suggestion for interval timers
    if (analysis.isRepeating) {
      suggestions.push({
        desc: 'Consider XState services for automatic cleanup',
        fix: {
          range: [start, end] as [number, number],
          text: this.formatTodo(
            'XState services automatically handle cleanup on state transitions'
          ),
        },
      });
    }

    return suggestions;
  }

  /**
   * Generate a primary fix based on timer analysis
   */
  private generatePrimaryFix(
    timerType: string,
    analysis: TimerAnalysis,
    node: import('ts-morph').Node
  ): { range: [number, number]; text: string } | null {
    const start = node.getStart();
    const end = node.getEnd();

    // Use the most appropriate fix based on analysis
    switch (analysis.purpose) {
      case 'delay':
        return {
          range: [start, end] as [number, number],
          text: this.formatTodo(
            `Replace ${timerType} with XState delayed transition: after: { ${analysis.delayValue || 1000}: 'nextState' }`
          ),
        };
      case 'animation':
        return {
          range: [start, end] as [number, number],
          text: this.formatTodo(
            `Replace ${timerType} with CSS transitions or XState delayed transitions`
          ),
        };
      case 'debouncing':
        return {
          range: [start, end] as [number, number],
          text: this.formatTodo(
            `Replace ${timerType} with XState debouncing: after: { ${analysis.delayValue || 300}: 'processing' }`
          ),
        };
      case 'polling':
        return {
          range: [start, end] as [number, number],
          text: this.formatTodo(
            `Replace ${timerType} with XState service invoke pattern for polling`
          ),
        };
      default:
        return {
          range: [start, end] as [number, number],
          text: this.formatTodo(`Replace ${timerType} with XState delayed transitions or services`),
        };
    }
  }
}

interface TimerAnalysis {
  type: string;
  hasDelay: boolean;
  delayValue: number | null;
  isRepeating: boolean;
  purpose: 'polling' | 'debouncing' | 'delay' | 'animation' | 'retry' | 'cleanup' | 'unknown';
}

export default NoTimers;
