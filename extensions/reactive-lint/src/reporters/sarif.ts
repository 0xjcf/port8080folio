import { EVENTS, type EventBus } from '../core/event-bus.js';
import type { EventData, ScanCompleteEvent, ScanStartEvent, Violation } from '../types.js';
import type { Reporter } from './index.js';

interface SARIFReport {
  version: string;
  $schema: string;
  runs: SARIFRun[];
}

interface SARIFRun {
  tool: {
    driver: {
      name: string;
      version: string;
      informationUri?: string;
      shortDescription?: { text: string };
      fullDescription?: { text: string };
      rules: unknown[];
    };
  };
  results: unknown[];
  artifacts?: unknown[];
}

/**
 * SARIF reporter
 * Provides SARIF 2.1.0 format output for GitHub Security tab integration
 */
export class SARIFReporter implements Reporter {
  private bus: EventBus;
  private violations: Violation[] = [];
  private startTime: number | null = null;
  private endTime: number | null = null;
  private scanData: ScanStartEvent['data'] | null = null;

  constructor(bus: EventBus) {
    this.bus = bus;
  }

  /**
   * Set up event listeners
   */
  setupEventListeners(): void {
    this.bus.on(EVENTS.SCAN_START, (event: EventData) => {
      this.startTime = event.timestamp;
      this.scanData = event.data as ScanStartEvent['data'];
    });

    this.bus.on(EVENTS.VIOLATION, (event: EventData) => {
      this.violations.push(event.data as Violation);
    });

    this.bus.on(EVENTS.SCAN_COMPLETE, (event: EventData) => {
      this.endTime = event.timestamp;
      this.printSARIFReport(event.data as ScanCompleteEvent['data']);
    });

    this.bus.on(EVENTS.SCAN_ERROR, (event: EventData) => {
      this.printSARIFError(event.data as { error: string; stack?: string });
    });
  }

  /**
   * Print SARIF report
   */
  private printSARIFReport(data: ScanCompleteEvent['data']): void {
    const sarifReport: SARIFReport = {
      version: '2.1.0',
      $schema: 'https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0.json',
      runs: [
        {
          tool: {
            driver: {
              name: 'reactive-lint',
              version: '1.0.0',
              informationUri: 'https://github.com/your-org/reactive-lint',
              shortDescription: {
                text: 'AST-based linter for reactive patterns in Actor-SPA framework',
              },
              fullDescription: {
                text: 'Production-grade static analysis tool that uses AST parsing to detect anti-patterns in reactive programming and guide developers toward proper state machine usage.',
              },
              rules: this.createSARIFRules(),
            },
          },
          results: this.violations.map((violation) => this.violationToSARIFResult(violation)),
          artifacts: data.files.map((file: string) => ({
            location: {
              uri: file.replace(process.cwd(), '').replace(/^\//, ''),
            },
            length: -1,
            mimeType: this.getMimeType(file),
          })),
        },
      ],
    };

    console.log(JSON.stringify(sarifReport, null, 2));
  }

  /**
   * Create SARIF rules from violations
   */
  private createSARIFRules(): unknown[] {
    const ruleIds = new Set(this.violations.map((v) => v.ruleId));
    const rules: unknown[] = [];

    for (const ruleId of ruleIds) {
      const violation = this.violations.find((v) => v.ruleId === ruleId);
      if (!violation) continue;

      rules.push({
        id: ruleId,
        shortDescription: {
          text: this.getRuleShortDescription(ruleId),
        },
        fullDescription: {
          text: violation.message,
        },
        messageStrings: {
          default: {
            text: violation.message,
          },
        },
        defaultConfiguration: {
          level: this.severityToSARIFLevel(violation.severity),
        },
        helpUri: `https://github.com/your-org/reactive-lint/docs/rules/${ruleId}.md`,
        properties: {
          category: this.getRuleCategory(ruleId),
          tags: this.getRuleTags(ruleId),
        },
      });
    }

    return rules;
  }

  /**
   * Convert violation to SARIF result
   */
  private violationToSARIFResult(violation: Violation): unknown {
    const result: unknown = {
      ruleId: violation.ruleId,
      message: {
        text: violation.message,
      },
      level: this.severityToSARIFLevel(violation.severity),
      locations: [
        {
          physicalLocation: {
            artifactLocation: {
              uri: violation.file.replace(process.cwd(), '').replace(/^\//, ''),
            },
            region: {
              startLine: violation.line,
              startColumn: violation.column,
            },
          },
        },
      ],
    };

    return result;
  }

  /**
   * Convert severity to SARIF level
   */
  private severityToSARIFLevel(severity: string): string {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'note';
      default:
        return 'note';
    }
  }

  /**
   * Get MIME type for file
   */
  private getMimeType(file: string): string {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      return 'text/typescript';
    }

    if (file.endsWith('.js') || file.endsWith('.jsx')) {
      return 'text/javascript';
    }

    return 'text/plain';
  }

  /**
   * Get rule short description
   */
  private getRuleShortDescription(ruleId: string): string {
    const descriptions: Record<string, string> = {
      'no-dom-query': 'Avoid direct DOM queries',
      'no-event-listeners': 'Avoid direct event listeners',
      'no-dom-manipulation': 'Avoid direct DOM manipulation',
      'no-timers': 'Avoid setTimeout/setInterval',
      'no-context-booleans': 'Avoid boolean flags in context',
      'no-multiple-data-attributes': 'Use single data-state attribute',
      'prefer-extracted-templates': 'Extract deeply nested templates',
    };

    return descriptions[ruleId] || 'Reactive pattern violation';
  }

  /**
   * Get rule category
   */
  private getRuleCategory(ruleId: string): string {
    const categories: Record<string, string> = {
      'no-dom-query': 'DOM',
      'no-event-listeners': 'Events',
      'no-dom-manipulation': 'DOM',
      'no-timers': 'Async',
      'no-context-booleans': 'State',
      'no-multiple-data-attributes': 'Styling',
      'prefer-extracted-templates': 'Templates',
    };

    return categories[ruleId] || 'General';
  }

  /**
   * Get rule tags
   */
  private getRuleTags(ruleId: string): string[] {
    const tags: Record<string, string[]> = {
      'no-dom-query': ['reactive', 'dom', 'anti-pattern'],
      'no-event-listeners': ['reactive', 'events', 'anti-pattern'],
      'no-dom-manipulation': ['reactive', 'dom', 'anti-pattern'],
      'no-timers': ['reactive', 'async', 'anti-pattern'],
      'no-context-booleans': ['reactive', 'state', 'anti-pattern'],
      'no-multiple-data-attributes': ['reactive', 'styling', 'anti-pattern'],
      'prefer-extracted-templates': ['reactive', 'templates', 'maintainability'],
    };

    return tags[ruleId] || ['reactive', 'anti-pattern'];
  }

  /**
   * Print SARIF error
   */
  private printSARIFError(_data: { error: string; stack?: string }): void {
    const errorReport: SARIFReport = {
      version: '2.1.0',
      $schema: 'https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0.json',
      runs: [
        {
          tool: {
            driver: {
              name: 'reactive-lint',
              version: '1.0.0',
              rules: [],
            },
          },
          results: this.violations.map((violation) => this.violationToSARIFResult(violation)),
        },
      ],
    };

    console.error(JSON.stringify(errorReport, null, 2));
  }
}

export default SARIFReporter;
