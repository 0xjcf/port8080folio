import type { EventBus } from '../core/event-bus.js';
import type { ReporterType } from '../types.js';
import { JSONReporter } from './json.js';
import { PrettyReporter } from './pretty.js';
import { SARIFReporter } from './sarif.js';

export interface Reporter {
  setupEventListeners(): void;
}

/**
 * Reporter registry
 */
const REPORTERS = {
  pretty: PrettyReporter,
  json: JSONReporter,
  sarif: SARIFReporter,
};

/**
 * Create a reporter instance
 */
export function createReporter(type: ReporterType, bus: EventBus): Reporter {
  const ReporterClass = REPORTERS[type];

  if (!ReporterClass) {
    throw new Error(`Unknown reporter type: ${type}`);
  }

  return new ReporterClass(bus);
}

/**
 * Get list of available reporter types
 */
export function getAvailableReporters(): ReporterType[] {
  return Object.keys(REPORTERS) as ReporterType[];
}

/**
 * Register a custom reporter
 */
export function registerReporter(
  name: ReporterType,
  ReporterClass: new (bus: EventBus) => Reporter
): void {
  (REPORTERS as Record<string, unknown>)[name] = ReporterClass;
}

export { PrettyReporter, JSONReporter, SARIFReporter };
