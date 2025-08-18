import chalk from 'chalk';
import { EVENTS, type EventBus, SEVERITY } from '../core/event-bus.js';
import type { EventData, ScanCompleteEvent, ScanStartEvent, Violation } from '../types.js';
import type { Reporter } from './index.js';

/**
 * Pretty console reporter
 * Provides colorized, human-readable output
 */
export class PrettyReporter implements Reporter {
  private bus: EventBus;
  private violations: Violation[] = [];
  private startTime: number | null = null;
  private endTime: number | null = null;
  private filesScanned = 0;

  constructor(bus: EventBus) {
    this.bus = bus;
  }

  /**
   * Set up event listeners
   */
  setupEventListeners(): void {
    this.bus.on(EVENTS.SCAN_START, (event: EventData) => {
      this.startTime = event.timestamp;
      this.printScanStart(event.data as ScanStartEvent['data']);
    });

    this.bus.on(EVENTS.VIOLATION, (event: EventData) => {
      const violation = event.data as Violation;
      this.violations.push(violation);
      this.printViolation(violation);
    });

    this.bus.on(EVENTS.FILE_START, (event: EventData) => {
      if (process.env.VERBOSE) {
        const _data = event.data as { file: string };
      }
    });

    this.bus.on(EVENTS.FILE_COMPLETE, (event: EventData) => {
      this.filesScanned++;
      if (process.env.VERBOSE) {
        const data = event.data as { violations: number };
        const violationCount = data.violations;
        const _status =
          violationCount > 0
            ? chalk.red(`❌ ${violationCount} violations`)
            : chalk.green('✅ Clean');
      }
    });

    this.bus.on(EVENTS.SCAN_COMPLETE, (event: EventData) => {
      this.endTime = event.timestamp;
      this.printScanComplete(event.data as ScanCompleteEvent['data']);
    });

    this.bus.on(EVENTS.SCAN_ERROR, (event: EventData) => {
      this.printScanError(event.data as { error: string; stack?: string });
    });

    this.bus.on(EVENTS.FILE_ERROR, (event: EventData) => {
      this.printFileError(event.data as { file: string; error: string });
    });
  }

  /**
   * Print scan start message
   */
  private printScanStart(data: ScanStartEvent['data']): void {
    console.log(chalk.cyan('🔍 Reactive Lint - Actor-SPA Pattern Analysis'));
    console.log(chalk.gray(`Files: ${data.files.length}`));
    console.log(chalk.gray(`Rules: ${data.rules.join(', ')}`));
    console.log('');
  }

  /**
   * Print a violation
   */
  private printViolation(violation: Violation): void {
    const { severity, file, line, column, message, ruleId } = violation;

    // Get relative path for cleaner output
    const relativePath = file.replace(process.cwd(), '.');

    // Color based on severity
    const severityColor = this.getSeverityColor(severity);
    const severityIcon = this.getSeverityIcon(severity);

    // Format location
    const location = `${relativePath}:${line}:${column}`;

    // Print violation
    console.log(
      `${severityIcon} ${severityColor(severity.toUpperCase())} ${chalk.dim(location)} ${message} ${chalk.dim(`(${ruleId})`)}`
    );
  }

  /**
   * Print scan completion summary
   */
  private printScanComplete(data: ScanCompleteEvent['data']): void {
    const { stats, duration } = data;
    const { errors, warnings, info, violations } = stats;

    console.log('');

    // Violation summary
    if (violations > 0) {
      console.log(chalk.bold('Summary:'));

      if (errors > 0) {
        console.log(`  ${chalk.red('❌')} ${errors} error${errors === 1 ? '' : 's'}`);
      }

      if (warnings > 0) {
        console.log(`  ${chalk.yellow('⚠️')} ${warnings} warning${warnings === 1 ? '' : 's'}`);
      }

      if (info > 0) {
        console.log(`  ${chalk.blue('ℹ️')} ${info} info`);
      }

      console.log(
        `  ${chalk.gray('📄')} ${stats.filesScanned} file${stats.filesScanned === 1 ? '' : 's'} scanned`
      );
      console.log(`  ${chalk.gray('⏱️')} ${this.formatDuration(duration)}`);
    } else {
      console.log(
        chalk.green('✨ No violations found! Your code follows Actor-SPA patterns perfectly.')
      );
      console.log(
        `${chalk.gray('📄')} ${stats.filesScanned} file${stats.filesScanned === 1 ? '' : 's'} scanned in ${this.formatDuration(duration)}`
      );
    }

    console.log('');

    // Exit code hint
    if (errors > 0) {
      console.log(chalk.red('❌ Found errors that must be fixed.'));
    } else if (warnings > 0) {
      console.log(chalk.yellow('⚠️ Found warnings that should be addressed.'));
    } else {
      console.log(chalk.green('🎉 All checks passed!'));
    }
  }

  /**
   * Print scan error
   */
  private printScanError(data: { error: string; stack?: string }): void {
    console.error(chalk.red('❌ Scan failed:'), data.error);
    if (data.stack && process.env.VERBOSE) {
      console.error(chalk.gray(data.stack));
    }
  }

  /**
   * Print file error
   */
  private printFileError(data: { file: string; error: string }): void {
    const relativePath = data.file.replace(process.cwd(), '.');
    console.error(chalk.red(`❌ Error processing ${relativePath}:`), data.error);
  }

  /**
   * Get severity color
   */
  private getSeverityColor(severity: string) {
    switch (severity) {
      case SEVERITY.ERROR:
        return chalk.red;
      case SEVERITY.WARNING:
        return chalk.yellow;
      case SEVERITY.INFO:
        return chalk.blue;
      default:
        return chalk.gray;
    }
  }

  /**
   * Get severity icon
   */
  private getSeverityIcon(severity: string): string {
    switch (severity) {
      case SEVERITY.ERROR:
        return '❌';
      case SEVERITY.WARNING:
        return '⚠️';
      case SEVERITY.INFO:
        return 'ℹ️';
      default:
        return '●';
    }
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }

    if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }

    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(1);
    return `${minutes}m ${seconds}s`;
  }
}

export default PrettyReporter;
