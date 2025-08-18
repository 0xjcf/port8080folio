import { EventEmitter } from 'node:events';
import type { EventData, LintStats, Violation } from '../types.js';

/**
 * Event types for the reactive linter
 */
export const EVENTS = {
  VIOLATION: 'violation',
  SCAN_START: 'scan:start',
  SCAN_COMPLETE: 'scan:complete',
  SCAN_ERROR: 'scan:error',
  FILE_START: 'file:start',
  FILE_COMPLETE: 'file:complete',
  FILE_ERROR: 'file:error',
  RULE_START: 'rule:start',
  RULE_COMPLETE: 'rule:complete',
  RULE_ERROR: 'rule:error',
} as const;

/**
 * Violation severity levels
 */
export const SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
} as const;

/**
 * Event bus for reactive linter
 * Provides decoupled communication between rules, scanners, and reporters
 */
export class ReactiveLintBus extends EventEmitter {
  private stats: LintStats;

  constructor() {
    super();
    this.setMaxListeners(100); // Allow many reporters/rules to listen
    this.stats = {
      violations: 0,
      errors: 0,
      warnings: 0,
      info: 0,
      filesScanned: 0,
      rulesExecuted: 0,
    };
  }

  /**
   * Emit a violation event
   */
  emitViolation(violation: Violation): void {
    this.stats.violations++;

    // Update severity-specific counts
    if (violation.severity === 'error') {
      this.stats.errors++;
    } else if (violation.severity === 'warning') {
      this.stats.warnings++;
    } else if (violation.severity === 'info') {
      this.stats.info++;
    }

    this.emit(EVENTS.VIOLATION, {
      type: EVENTS.VIOLATION,
      timestamp: Date.now(),
      data: violation,
    });
  }

  /**
   * Emit scan start event
   */
  emitScanStart(scanInfo: unknown): void {
    this.emit(EVENTS.SCAN_START, {
      type: EVENTS.SCAN_START,
      timestamp: Date.now(),
      data: scanInfo,
    });
  }

  /**
   * Emit scan complete event
   */
  emitScanComplete(scanResults: Record<string, unknown>): void {
    this.emit(EVENTS.SCAN_COMPLETE, {
      type: EVENTS.SCAN_COMPLETE,
      timestamp: Date.now(),
      data: {
        ...scanResults,
        stats: this.stats,
      },
    });
  }

  /**
   * Emit scan error event
   */
  emitScanError(error: Error): void {
    this.emit(EVENTS.SCAN_ERROR, {
      type: EVENTS.SCAN_ERROR,
      timestamp: Date.now(),
      data: { error: error.message, stack: error.stack },
    });
  }

  /**
   * Emit file start event
   */
  emitFileStart(fileInfo: { file: string }): void {
    this.emit(EVENTS.FILE_START, {
      type: EVENTS.FILE_START,
      timestamp: Date.now(),
      data: fileInfo,
    });
  }

  /**
   * Emit file complete event
   */
  emitFileComplete(fileResults: { file: string; violations: number }): void {
    this.stats.filesScanned++;

    this.emit(EVENTS.FILE_COMPLETE, {
      type: EVENTS.FILE_COMPLETE,
      timestamp: Date.now(),
      data: fileResults,
    });
  }

  /**
   * Emit file error event
   */
  emitFileError(fileError: { file: string; error: string }): void {
    this.emit(EVENTS.FILE_ERROR, {
      type: EVENTS.FILE_ERROR,
      timestamp: Date.now(),
      data: fileError,
    });
  }

  /**
   * Emit rule start event
   */
  emitRuleStart(ruleInfo: { rule: string; file: string }): void {
    this.emit(EVENTS.RULE_START, {
      type: EVENTS.RULE_START,
      timestamp: Date.now(),
      data: ruleInfo,
    });
  }

  /**
   * Emit rule complete event
   */
  emitRuleComplete(ruleResults: { rule: string; file: string; violations: number }): void {
    this.stats.rulesExecuted++;

    this.emit(EVENTS.RULE_COMPLETE, {
      type: EVENTS.RULE_COMPLETE,
      timestamp: Date.now(),
      data: ruleResults,
    });
  }

  /**
   * Emit rule error event
   */
  emitRuleError(ruleError: { rule: string; file: string; error: string }): void {
    this.emit(EVENTS.RULE_ERROR, {
      type: EVENTS.RULE_ERROR,
      timestamp: Date.now(),
      data: ruleError,
    });
  }

  /**
   * Get current statistics
   */
  getStats(): LintStats {
    return { ...this.stats };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      violations: 0,
      errors: 0,
      warnings: 0,
      info: 0,
      filesScanned: 0,
      rulesExecuted: 0,
    };
  }

  /**
   * Subscribe to all events (useful for debugging)
   */
  subscribeToAll(callback: (data: EventData) => void): void {
    for (const event of Object.values(EVENTS)) {
      this.on(event, callback);
    }
  }

  /**
   * Create a scoped event bus for a specific context
   */
  createScopedEmitters(scope: string): {
    start: (data: unknown) => void;
    complete: (data: unknown) => void;
    error: (data: unknown) => void;
  } {
    return {
      start: (data: unknown) =>
        this.emit(`${scope}:start`, { type: `${scope}:start`, timestamp: Date.now(), data }),
      complete: (data: unknown) =>
        this.emit(`${scope}:complete`, { type: `${scope}:complete`, timestamp: Date.now(), data }),
      error: (data: unknown) =>
        this.emit(`${scope}:error`, { type: `${scope}:error`, timestamp: Date.now(), data }),
    };
  }
}

/**
 * Create a violation object
 */
export function createViolation(options: {
  ruleId: string;
  message: string;
  severity?: 'error' | 'warning' | 'info';
  file: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  source: string;
  fix?: { range: [number, number]; text: string } | null;
  suggestions?: Array<{ desc: string; fix: { range: [number, number]; text: string } }>;
}): Violation {
  return {
    ruleId: options.ruleId,
    message: options.message,
    severity: options.severity || 'error',
    file: options.file,
    line: options.line,
    column: options.column,
    endLine: options.endLine,
    endColumn: options.endColumn,
    source: options.source,
    fix: options.fix || null,
    suggestions: options.suggestions || [],
    timestamp: Date.now(),
  };
}

/**
 * Global event bus instance
 */
export const globalBus = new ReactiveLintBus();

// Export the main class for type checking
export type EventBus = ReactiveLintBus;
