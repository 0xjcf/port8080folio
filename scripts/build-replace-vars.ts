#!/usr/bin/env node

/**
 * Build script to replace template variables in HTML files with values from wrangler.toml
 * Usage: node scripts/build-replace-vars.js [environment]
 * Environment: dev (default) | production
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse TOML-like file (simplified parser for our use case)
function parseWranglerToml(content: string): Record<string, string> {
  const vars: Record<string, string> = {};
  let currentSection: string | null = null;

  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Section headers
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed.slice(1, -1);
      continue;
    }

    // Variable assignments
    if (trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim().replace(/^"|"$/g, '');

      const envArg = process.argv[2] || 'dev';
      if (
        currentSection === 'vars' ||
        (currentSection === 'env.production.vars' && envArg === 'production') ||
        (currentSection === 'env.dev.vars' && envArg === 'dev')
      ) {
        vars[key.trim()] = value;
      }
    }
  }

  return vars;
}

// Recursively find all HTML files
function listHtmlFiles(dir: string): string[] {
  const results: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...listHtmlFiles(fullPath));
    } else if (item.endsWith('.html')) {
      results.push(fullPath);
    }
  }

  return results;
}

// Basic URL validation
function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function main() {
  const environment = process.argv[2] || 'dev';
  const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('--check');
  const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');
  const srcDir = path.join(__dirname, '..', 'src');
  const distDir = path.join(__dirname, '..', 'dist');

  try {
    // Read and parse wrangler.toml
    const wranglerContent = fs.readFileSync(wranglerPath, 'utf8');
    const vars = parseWranglerToml(wranglerContent);

    // Get all HTML files recursively
    const htmlFiles = listHtmlFiles(srcDir);

    if (isDryRun) {
      console.log(`🔍 Dry run mode - checking ${environment} environment:`);
      console.log(`   Found ${htmlFiles.length} HTML files`);
      console.log(`   Available variables:`, Object.keys(vars).join(', ') || 'none');
      return;
    }

    // Ensure dist directory exists
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    let processedCount = 0;
    let totalWarnings = 0;

    // Process each HTML file
    for (const srcPath of htmlFiles) {
      const relativePath = path.relative(srcDir, srcPath);
      const distPath = path.join(distDir, relativePath);

      // Ensure subdirectory exists
      const distSubDir = path.dirname(distPath);
      if (!fs.existsSync(distSubDir)) {
        fs.mkdirSync(distSubDir, { recursive: true });
      }

      // Read source HTML
      let htmlContent = fs.readFileSync(srcPath, 'utf8');

      // Track replacements and missing values
      let hasReplacements = false;
      const unresolved: string[] = [];
      const invalidUrls: string[] = [];

      // Replace script path for builds (both dev and prod use minified version)
      // Source HTML uses pe.js for local development
      // Build output uses pe-min.js for optimized delivery
      htmlContent = htmlContent.replace(
        'src="scripts/pe.js"',
        'src="scripts/pe-min.js"'
      );
      if (htmlContent.includes('pe-min.js')) {
        hasReplacements = true;
      }

      // Generic replacement for any {{VAR}} pattern
      htmlContent = htmlContent.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, varName) => {
        if (varName in vars) {
          hasReplacements = true;
          const value = vars[varName];

          // Validate URLs for API endpoints
          if (varName.includes('API_URL') && !isValidUrl(value)) {
            invalidUrls.push(`${varName}="${value}"`);
          }

          return value;
        } else {
          unresolved.push(varName);
          return match; // Leave unchanged
        }
      });

      // Write processed HTML to dist
      fs.writeFileSync(distPath, htmlContent);

      // Report results
      if (hasReplacements || unresolved.length > 0) {
        const status = hasReplacements ? '✅ Processed' : '📄 Copied';
        console.log(`${status}: ${relativePath}`);

        if (unresolved.length > 0) {
          console.warn(`   ⚠️  Missing values for: ${unresolved.join(', ')}`);
          totalWarnings++;
        }

        if (invalidUrls.length > 0) {
          console.warn(`   ⚠️  Invalid URLs: ${invalidUrls.join(', ')}`);
          totalWarnings++;
        }

        if (hasReplacements) {
          processedCount++;
        }
      } else {
        console.log(`📄 Copied: ${relativePath}`);
      }
    }

    if (processedCount > 0) {
      console.log(`\n🔧 Variables replaced for ${environment} environment:`);
      Object.entries(vars)
        .filter(([key]) => key.includes('API_URL'))
        .forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
    }

    if (totalWarnings > 0) {
      console.warn(`\n⚠️  ${totalWarnings} warning(s) found. Check configuration.`);
      // Optionally fail in CI on warnings
      // process.exitCode = 1;
    }

  } catch (error) {
    console.error('❌ Error processing variables:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
