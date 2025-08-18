#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { parse } from 'yaml';
import { ReactiveLintBus } from './core/event-bus.js';
import { ReactiveLinter } from './core/linter.js';
import type { CLIOptions, LintConfig, ReporterType } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface PackageJson {
  version: string;
  [key: string]: unknown;
}

const packageJson: PackageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('reactive-lint')
  .description('AST-based linter for reactive patterns in Actor-SPA framework')
  .version(packageJson.version);

program
  .argument('[patterns...]', 'File patterns to lint (defaults to config)')
  .option('-c, --config <path>', 'Path to config file', './config.yaml')
  .option('-f, --format <format>', 'Output format (pretty, json, sarif)', 'pretty')
  .option('--fix', 'Automatically fix problems where possible', false)
  .option('--watch', 'Watch mode - rerun on file changes', false)
  .option('--max-concurrency <num>', 'Maximum concurrent file scans', '4')
  .option('--engine <type>', 'Linting engine (ast, regex)', 'ast')
  .option('--exit-code', 'Exit with non-zero code on errors', true)
  .option('--verbose', 'Verbose output', false)
  .action(async (patterns: string[], options: Partial<CLIOptions>) => {
    try {
      // Load configuration
      const configPath = join(process.cwd(), options.config || './config.yaml');

      let config: LintConfig;
      try {
        const rawConfig = readFileSync(configPath, 'utf-8');
        config = parse(rawConfig) as LintConfig;
      } catch (_error) {
        process.exit(1);
      }

      // Validate reporter format
      const validFormats: ReporterType[] = ['pretty', 'json', 'sarif'];
      const format = options.format as ReporterType;
      if (format && !validFormats.includes(format)) {
        process.exit(1);
      }

      // Merge CLI options with config
      const finalConfig: LintConfig & {
        patterns: string[];
        format: ReporterType;
        fix: boolean;
        watch: boolean;
        verbose: boolean;
      } = {
        ...config,
        include: patterns.length > 0 ? patterns : config.include,
        patterns: patterns.length > 0 ? patterns : config.include,
        format: format || 'pretty',
        fix: options.fix || false,
        watch: options.watch || false,
        maxConcurrency: options.maxConcurrency
          ? Number.parseInt(options.maxConcurrency)
          : config.maxConcurrency || 4,
        engine: (options.engine as 'ast' | 'regex') || config.engine || 'ast',
        exitCode:
          typeof config.exitCode === 'object' ? config.exitCode : { onError: 1, onWarning: 0 },
        verbose: options.verbose || false,
      };

      if (finalConfig.verbose) {
      }

      // Validate engine type
      if (!['ast', 'regex'].includes(finalConfig.engine)) {
        process.exit(1);
      }

      // Create and run the linter
      const bus = new ReactiveLintBus();

      // Set up the reporter based on CLI format option
      const configWithReporter = {
        ...finalConfig,
        reporters: [finalConfig.format],
      };

      const linter = new ReactiveLinter(configWithReporter, bus);
      const result = await linter.run();

      // Handle exit code
      if (finalConfig.exitCode && result.errorCount > 0) {
        process.exit(1);
      }

      if (finalConfig.exitCode && result.warningCount > 0 && config.exitCode?.onWarning === 1) {
        process.exit(1);
      }

      // Success exit
      process.exit(0);
    } catch (error) {
      const _err = error as Error;

      if (options.verbose) {
      }

      process.exit(1);
    }
  });

// Legacy support - fallback to regex engine
program
  .command('legacy')
  .description('Run the legacy regex-based linter')
  .action(async () => {
    try {
      const { spawn } = await import('node:child_process');
      const child = spawn('node', ['../../scripts/check-reactive-patterns.js'], {
        stdio: 'inherit',
        cwd: process.cwd(),
      });

      child.on('close', (code: number | null) => {
        process.exit(code || 0);
      });

      child.on('error', (_error: Error) => {
        process.exit(1);
      });
    } catch (error) {
      const _err = error as Error;
      process.exit(1);
    }
  });

// Help command for rule documentation
program
  .command('rules')
  .description('List available rules and their descriptions')
  .action(() => {
    const rules = [
      {
        name: 'no-dom-query',
        description: 'Avoid direct DOM queries (querySelector, getElementById, etc.)',
        category: 'DOM',
        fixable: true,
      },
      {
        name: 'no-event-listeners',
        description: 'Use declarative event mapping instead of addEventListener',
        category: 'Events',
        fixable: false,
      },
      {
        name: 'no-dom-manipulation',
        description: 'Use template functions instead of direct DOM manipulation',
        category: 'DOM',
        fixable: true,
      },
      {
        name: 'no-timers',
        description: 'Use state machine delays/services instead of setTimeout/setInterval',
        category: 'Async',
        fixable: false,
      },
      {
        name: 'no-context-booleans',
        description: 'Use machine states instead of boolean flags in context',
        category: 'State',
        fixable: false,
      },
      {
        name: 'no-multiple-data-attributes',
        description: 'Use single data-state attribute instead of multiple data attributes',
        category: 'Styling',
        fixable: true,
      },
      {
        name: 'prefer-extracted-templates',
        description: 'Limit template nesting depth and encourage extraction',
        category: 'Templates',
        fixable: true,
      },
    ];

    console.log('📋 Available Reactive Lint Rules:\n');

    for (const rule of rules) {
      const fixableIcon = rule.fixable ? '🔧' : '❌';
      console.log(`${fixableIcon} ${rule.name}`);
      console.log(`   ${rule.description}`);
      console.log(`   Category: ${rule.category}`);
      console.log('');
    }

    console.log('Legend:');
    console.log('🔧 = Auto-fixable');
    console.log('❌ = Manual fix required');
  });

// Error handling for unhandled rejections
process.on('unhandledRejection', (_reason: unknown, _promise: Promise<unknown>) => {
  process.exit(1);
});

process.on('uncaughtException', (_error: Error) => {
  process.exit(1);
});

program.parse();
