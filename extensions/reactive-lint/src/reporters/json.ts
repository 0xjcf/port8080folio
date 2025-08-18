import { EVENTS, type EventBus } from '../core/event-bus.js';
import type { EventData, ScanCompleteEvent, ScanStartEvent, Violation } from '../types.js';
import type { Reporter } from './index.js';

/**
 * JSON reporter
 * Provides machine-readable JSON output
 */
export class JSONReporter implements Reporter {
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
      this.printJSONReport(event.data as ScanCompleteEvent['data']);
    });

    this.bus.on(EVENTS.SCAN_ERROR, (event: EventData) => {
      this.printJSONError(event.data as { error: string; stack?: string });
    });
  }

  /**
   * Print JSON report
   */
  private printJSONReport(data: ScanCompleteEvent['data']): void {
    const report = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      summary: {
        filesScanned: data.stats.filesScanned,
        rulesExecuted: data.stats.rulesExecuted,
        violations: data.stats.violations,
        errors: data.stats.errors,
        warnings: data.stats.warnings,
        info: data.stats.info,
        duration: data.duration,
      },
      violations: this.violations.map((violation) => ({
        ruleId: violation.ruleId,
        message: violation.message,
        severity: violation.severity,
        file: violation.file,
        line: violation.line,
        column: violation.column,
        endLine: violation.endLine,
        endColumn: violation.endColumn,
        source: violation.source,
        fix: violation.fix,
        suggestions: violation.suggestions,
      })),
      files: data.files,
      rules: this.scanData?.rules || [],
    };

    console.log(JSON.stringify(report, null, 2));
  }

  /**
   * Print JSON error
   */
  private printJSONError(data: { error: string; stack?: string }): void {
    const errorReport = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      error: {
        message: data.error,
        stack: data.stack,
      },
      violations: this.violations,
      summary: {
        filesScanned: 0,
        rulesExecuted: 0,
        violations: this.violations.length,
        errors: this.violations.filter((v) => v.severity === 'error').length,
        warnings: this.violations.filter((v) => v.severity === 'warning').length,
        info: this.violations.filter((v) => v.severity === 'info').length,
      },
    };

    console.error(JSON.stringify(errorReport, null, 2));
  }
}

export default JSONReporter;
