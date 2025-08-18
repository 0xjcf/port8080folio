import { readFileSync } from 'node:fs';
import { globby } from 'globby';
import { Project } from 'ts-morph';
import { type ActorRefFrom, assign, createActor, createMachine, fromPromise } from 'xstate';
import { createReporter, type Reporter } from '../reporters/index.js';
import { loadRules, type Rule } from '../rules/index.js';
import type { LintConfig, LintResult, LintStats, RuleContext, Violation } from '../types.js';
import type { EventBus } from './event-bus.js';

interface LinterContext {
  files: string[];
  violations: Violation[];
  stats: LintStats;
  startTime: number | null;
  endTime: number | null;
}

/**
 * Main ReactiveLinter class
 * Orchestrates the entire linting process using XState and event-driven architecture
 */
export class ReactiveLinter {
  private config: LintConfig & { verbose?: boolean };
  private project: Project;
  private bus: EventBus;
  private rules: Record<string, Rule>;
  private reporters: Reporter[];
  private machine: ReturnType<typeof this.createLinterMachine>;
  private service: ActorRefFrom<typeof this.machine> | null = null;

  constructor(config: LintConfig & { verbose?: boolean }, bus: EventBus) {
    this.config = config;
    this.project = new Project({
      tsConfigFilePath: 'tsconfig.json',
      skipFileDependencyResolution: true,
    });

    this.bus = bus;
    this.rules = loadRules(config.rules, { verbose: config.verbose });
    this.reporters = config.reporters?.map((type) => createReporter(type, this.bus)) || [];

    // Setup reporter event listeners
    for (const reporter of this.reporters) {
      reporter.setupEventListeners();
    }

    this.machine = this.createLinterMachine();
  }

  /**
   * Create the main linter state machine
   */
  private createLinterMachine() {
    return createMachine(
      {
        id: 'reactiveLinter',
        initial: 'idle',
        context: {
          files: [],
          violations: [],
          stats: {
            filesScanned: 0,
            rulesExecuted: 0,
            violations: 0,
            errors: 0,
            warnings: 0,
            info: 0,
          },
          startTime: null,
          endTime: null,
        } as LinterContext,

        states: {
          idle: {
            on: {
              START: 'discovering',
            },
          },

          discovering: {
            entry: assign({
              startTime: () => Date.now(),
            }),

            invoke: {
              id: 'discoverFiles',
              src: 'discoverFiles',
              onDone: {
                target: 'scanning',
                actions: assign({
                  files: ({ event }) => event.output,
                }),
              },
              onError: {
                target: 'error',
                actions: 'handleError',
              },
            },
          },

          scanning: {
            entry: ['emitScanStart'],

            invoke: {
              id: 'scanFiles',
              src: 'scanFiles',
              input: ({ context }: { context: LinterContext }) => context,
              onDone: {
                target: 'complete',
                actions: assign({
                  endTime: () => Date.now(),
                  stats: () => ({
                    ...this.bus.getStats(),
                  }),
                }),
              },
              onError: {
                target: 'error',
                actions: 'handleError',
              },
            },
          },

          complete: {
            entry: ['emitScanComplete'],
            type: 'final',
          },

          error: {
            entry: ['emitScanError'],
            type: 'final',
          },
        },
      },
      {
        actors: {
          discoverFiles: fromPromise(async () => {
            const patterns = Array.isArray(this.config.include)
              ? this.config.include
              : [this.config.include?.[0] || '**/*.{ts,tsx,js,jsx}'];

            const files = await globby(patterns, {
              ignore: this.config.exclude || [],
              absolute: true,
            });

            // Additional filter to exclude documentation files
            const filteredFiles = files.filter((file) => {
              // Exclude all markdown files
              if (file.endsWith('.md') || file.endsWith('.mdx')) {
                return false;
              }
              // Exclude specific documentation files in framework
              if (
                file.includes('/framework/') &&
                (file.includes('API.md') ||
                  file.includes('README.md') ||
                  file.includes('BEST_PRACTICES.md') ||
                  file.includes('SECURITY.md'))
              ) {
                return false;
              }
              return true;
            });

            return filteredFiles;
          }),

          scanFiles: fromPromise(async ({ input }: { input: LinterContext }) => {
            const { files } = input;
            const maxConcurrency = this.config.maxConcurrency || 4;

            // Create batches for parallel processing
            const batches = this.createBatches(files, maxConcurrency);

            for (const batch of batches) {
              await Promise.all(batch.map((file) => this.scanFile(file)));
            }

            return input.violations;
          }),
        },

        actions: {
          emitScanStart: ({ context }: { context: LinterContext }) => {
            this.bus.emitScanStart({
              files: context.files,
              rules: Object.keys(this.rules),
              config: this.config,
            });
          },

          emitScanComplete: ({ context }: { context: LinterContext }) => {
            this.bus.emitScanComplete({
              files: context.files,
              violations: context.violations,
              stats: context.stats,
              duration: (context.endTime || Date.now()) - (context.startTime || Date.now()),
            });
          },

          emitScanError: ({ event }: { event: unknown }) => {
            this.bus.emitScanError((event as { error: Error }).error);
          },

          handleError: () => {},
        },
      }
    );
  }

  /**
   * Scan a single file
   */
  private async scanFile(filePath: string): Promise<Violation[]> {
    this.bus.emitFileStart({ file: filePath });

    try {
      const sourceFile = this.project.addSourceFileAtPath(filePath);
      const content = readFileSync(filePath, 'utf-8');

      const fileViolations: Violation[] = [];

      // Run each rule against the file
      for (const [ruleId, rule] of Object.entries(this.rules)) {
        this.bus.emitRuleStart({ rule: ruleId, file: filePath });

        try {
          const ruleContext: RuleContext = {
            file: filePath,
            config: this.config.rules[ruleId],
            sourceFile,
            content,
          };

          const ruleViolations = await rule.check(sourceFile, content, ruleContext);

          fileViolations.push(...ruleViolations);

          // Emit each violation
          for (const violation of ruleViolations) {
            this.bus.emitViolation(violation);
          }

          this.bus.emitRuleComplete({
            rule: ruleId,
            file: filePath,
            violations: ruleViolations.length,
          });
        } catch (error) {
          this.bus.emitRuleError({
            rule: ruleId,
            file: filePath,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      this.bus.emitFileComplete({
        file: filePath,
        violations: fileViolations.length,
      });

      // Clean up the source file to prevent memory leaks
      this.project.removeSourceFile(sourceFile);

      return fileViolations;
    } catch (error) {
      this.bus.emitFileError({
        file: filePath,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  /**
   * Create batches for parallel processing
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Run the linter
   */
  async run(): Promise<LintResult> {
    return new Promise((resolve, reject) => {
      this.service = createActor(this.machine);

      this.service.subscribe((state) => {
        if (state.status === 'done') {
          if (state.value === 'complete') {
            const stats = this.bus.getStats();
            resolve({
              errorCount: stats.errors,
              warningCount: stats.warnings,
              infoCount: stats.info,
              totalViolations: stats.violations,
              filesScanned: stats.filesScanned,
              rulesExecuted: stats.rulesExecuted,
            });
          } else if (state.value === 'error') {
            reject(new Error('Linting process failed'));
          }
        }
      });

      this.service.start();
      this.service.send({ type: 'START' });
    });
  }

  /**
   * Stop the linter
   */
  stop(): void {
    if (this.service) {
      this.service.stop();
    }
  }
}

export default ReactiveLinter;
