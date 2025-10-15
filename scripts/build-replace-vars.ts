#!/usr/bin/env node

/**
 * Build script to replace template variables in HTML files with values from wrangler.toml
 * Usage: node scripts/build-replace-vars.ts [environment]
 * Environment: dev (default) | production
 */

import * as toml from '@std/toml';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Type definitions for wrangler.toml structure
export interface WranglerConfig {
  vars?: Record<string, string>;
  env?: Record<string, {
    vars?: Record<string, string>;
  }>;
}

export interface ProcessHtmlOptions {
  srcDir?: string;
  distDir?: string;
}

/**
 * Mask sensitive values in logs to prevent secret leakage
 * Detects likely secrets by name patterns and masks their values
 */
export function maskSensitiveValue(key: string, value: string): string {
  // Define patterns that indicate sensitive values
  // Use word boundaries that work with underscores and hyphens
  const sensitivePatterns = /(SECRET|KEY|TOKEN|PASS|PASSWORD|PRIVATE|AUTH|CREDENTIAL)/i;

  if (sensitivePatterns.test(key)) {
    // For sensitive keys, show only the last 4 characters with masking
    if (value.length <= 4) {
      return '****';
    }
    return '*'.repeat(value.length - 4) + value.slice(-4);
  }

  // For non-sensitive keys, show first part and mask if long
  if (value.length > 50) {
    return `${value.slice(0, 20)}...(${value.length} chars)`;
  }

  // For short non-sensitive values, show full value
  return value;
}

// Load variables from wrangler.toml
export function loadVariables(environment: string): Record<string, string> {
  const tomlPath = path.join(__dirname, '..', 'wrangler.toml');
  const tomlContent = fs.readFileSync(tomlPath, 'utf-8');
  const parsed = toml.parse(tomlContent) as WranglerConfig;

  const vars: Record<string, string> = {};

  // Helper function to safely coerce values to strings
  const coerceToString = (obj: any): Record<string, string> => {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        result[key] = String(value);
      }
      // Skip undefined/null values
    }
    return result;
  };

  // Get base vars and coerce to strings
  if (parsed.vars) {
    Object.assign(vars, coerceToString(parsed.vars));
  }

  // Override with environment-specific vars and coerce to strings
  if (parsed.env?.[environment]?.vars) {
    Object.assign(vars, coerceToString(parsed.env[environment].vars));
  }

  return vars;
}

// Recursively find all HTML files
export function listHtmlFiles(dir: string): string[] {
  const files: string[] = [];

  // Check if directory exists and is actually a directory
  if (!fs.existsSync(dir)) {
    console.warn(`Warning: Directory '${dir}' does not exist, skipping HTML file search`);
    return [];
  }

  const stats = fs.lstatSync(dir);
  if (!stats.isDirectory()) {
    console.warn(`Warning: Path '${dir}' is not a directory, skipping HTML file search`);
    return [];
  }

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...listHtmlFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Failed to read directory '${dir}':`, error);
    return [];
  }

  return files;
}

// Escape regex metacharacters for literal matching
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Replace template variables in content
export function replaceVariables(content: string, vars: Record<string, string>): string {
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    const escapedKey = escapeRegExp(key);
    const pattern = new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g');
    // Use function form to avoid $-sequence interpolation
    result = result.replace(pattern, () => value);
  }
  return result;
}

// Validate that all template variables have been replaced
export function validateReplacement(content: string, filePath: string): void {
  const unreplacedVars = content.match(/\{\{[^}]+\}\}/g);
  if (unreplacedVars) {
    console.warn(`⚠️  Warning: Unreplaced variables in ${filePath}:`);
    for (const variable of unreplacedVars) {
      console.warn(`   ${variable}`);
    }
  }
}

// Process HTML files
export function processHtmlFiles(
  environment: string,
  dryRun: boolean = false,
  options: ProcessHtmlOptions = {},
): void {
  console.log(`📝 Processing HTML files for environment: ${environment}`);

  const vars = loadVariables(environment);
  console.log(`🔧 Loaded ${Object.keys(vars).length} variables:`);
  for (const [key, value] of Object.entries(vars)) {
    console.log(`   ${key} = ${maskSensitiveValue(key, value)}`);
  }

  const srcDir = options.srcDir ?? path.join(__dirname, '..', 'src');
  const distDir = options.distDir ?? path.join(__dirname, '..', 'dist');
  const htmlFiles = listHtmlFiles(srcDir);

  console.log(`\n📁 Found ${htmlFiles.length} HTML files:`);

  if (!dryRun) {
    // Create dist directory if it doesn't exist
    try {
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
    } catch (error) {
      console.error(`❌ Error creating dist directory ${distDir}:`, error);
      console.error(`   Operation: mkdir`);
      process.exit(1);
    }
  }

  for (const srcFile of htmlFiles) {
    const relativePath = path.relative(srcDir, srcFile);
    const distFile = path.join(distDir, relativePath);

    console.log(`   📄 ${relativePath}`);

    try {
      const content = fs.readFileSync(srcFile, 'utf-8');
      const processedContent = replaceVariables(content, vars);

      if (dryRun) {
        console.log(`   🔍 [DRY RUN] Would write to: ${path.relative(process.cwd(), distFile)}`);
        validateReplacement(processedContent, relativePath);
      } else {
        // Create directory if it doesn't exist
        const distFileDir = path.dirname(distFile);
        try {
          if (!fs.existsSync(distFileDir)) {
            fs.mkdirSync(distFileDir, { recursive: true });
          }
        } catch (error) {
          console.error(`❌ Error creating directory ${distFileDir}:`, error);
          console.error(`   File: ${relativePath}`);
          console.error(`   Operation: mkdir`);
          process.exit(1);
        }

        try {
          fs.writeFileSync(distFile, processedContent, 'utf-8');
          console.log(`   ✅ Written to: ${path.relative(process.cwd(), distFile)}`);
        } catch (error) {
          console.error(`❌ Error writing file ${distFile}:`, error);
          console.error(`   File: ${relativePath}`);
          console.error(`   Operation: write`);
          process.exit(1);
        }

        validateReplacement(processedContent, relativePath);
      }
    } catch (error) {
      if (dryRun) {
        console.error(`❌ Error reading file ${srcFile}:`, error);
        console.error(`   File: ${relativePath}`);
        console.error(`   Operation: read`);
        console.error(`   🔍 [DRY RUN] Continuing with remaining files...`);
        continue;
      } else {
        console.error(`❌ Error reading file ${srcFile}:`, error);
        console.error(`   File: ${relativePath}`);
        console.error(`   Operation: read`);
        process.exit(1);
      }
    }
  }

  if (dryRun) {
    console.log(`\n🔍 Dry run completed. No files were written.`);
  } else {
    console.log(`\n✅ Successfully processed ${htmlFiles.length} HTML files for ${environment} environment.`);
  }
}

/* c8 ignore start */
// Main function
function main(): void {
  const args = process.argv.slice(2);
  const environment = args[0] || 'dev';
  const dryRun = args.includes('--dry-run');
  const watch = args.includes('--watch');

  // Validate environment
  const validEnvironments = ['dev', 'production'];
  if (!validEnvironments.includes(environment)) {
    console.error(`❌ Invalid environment: ${environment}`);
    console.error(`   Valid environments: ${validEnvironments.join(', ')}`);
    process.exit(1);
  }

  try {
    processHtmlFiles(environment, dryRun);
  } catch (error) {
    console.error('❌ Error processing files:', error);
    process.exit(1);
  }

  if (watch) {
    // Simple recursive watcher that re-processes all HTML on change
    const srcDir = path.join(__dirname, '..', 'src');
    console.log(`\n👀 Watching HTML in ${srcDir} for changes...`);

    let timer: NodeJS.Timeout | null = null;
    let pollingInterval: NodeJS.Timeout | null = null;
    let watcherActive = false;
    const cleanup = () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
      }
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
    const debouncedBuild = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          processHtmlFiles(environment, false);
        } catch (err) {
          console.error('❌ Error during watch rebuild:', err);
          // On persistent errors during polling, stop polling to avoid runaway logs
          if (pollingInterval) {
            console.warn('🛑 Stopping polling due to build error. Fix the issue and restart watch.');
            cleanup();
          }
        }
      }, 100);
    };
    const watchHandler: fs.WatchListener<string> = (event, filename) => {
      if (!filename) return;
      if (filename.endsWith('.html')) {
        console.log(`\n✏️  Detected ${event} on ${filename}. Rebuilding HTML...`);
        debouncedBuild();
      }
    };

    try {
      // fs.watch recursive is supported on macOS and Windows; falls back gracefully
      fs.watch(srcDir, { recursive: true }, watchHandler);
      watcherActive = true;
    } catch (error) {
      console.warn('⚠️  Recursive watch not supported; falling back to polling every 2s');
      // Attempt to upgrade to recursive watch (some environments may allow later)
      const tryUpgrade = () => {
        if (watcherActive) return true;
        try {
          fs.watch(srcDir, { recursive: true }, watchHandler);
          watcherActive = true;
          console.log('✅ Recursive watch became available; stopping polling.');
          cleanup();
          return true;
        } catch {
          return false;
        }
      };
      pollingInterval = setInterval(() => {
        if (!watcherActive) {
          tryUpgrade();
        }
        if (!watcherActive) {
          debouncedBuild();
        }
      }, 2000);
    }

    // Handle graceful shutdown & prevent interval leaks
    const shutdown = (signal: string) => {
      console.log(`\n🧹 Received ${signal}. Cleaning up watchers...`);
      cleanup();
      process.exit(0);
    };
    ['SIGINT', 'SIGTERM'].forEach(sig => {
      process.on(sig as NodeJS.Signals, () => shutdown(sig));
    });
    process.on('exit', () => cleanup());
  }
  /* c8 ignore end */
}

// Run if called directly
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
/* c8 ignore end */
