#!/usr/bin/env node

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as chalkModule from 'chalk';
import { Command } from 'commander';
import * as globModule from 'glob';
import * as ts from 'typescript';

// Handle different module formats with proper typing
const chalk = (chalkModule as unknown as { default?: typeof chalkModule }).default || chalkModule;
const glob =
  globModule.glob ||
  (globModule as unknown as { default?: typeof globModule }).default ||
  globModule;

interface TemplateViolation {
  file: string;
  line: number;
  column: number;
  depth: number;
  lineCount: number;
  templateType: string;
  code: string;
}

interface AnalyzerOptions {
  maxNestingDepth: number;
  minExtractedLines: number;
  verbose: boolean;
  json: boolean;
}

class TemplateAnalyzer {
  private violations: TemplateViolation[] = [];
  private fileCount = 0;
  private templateCount = 0;

  constructor(private options: AnalyzerOptions) {}

  analyzeFile(filePath: string): void {
    const sourceText = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);

    this.fileCount++;
    this.visitNode(sourceFile, sourceFile, filePath, 0, sourceText);
  }

  private visitNode(
    node: ts.Node,
    sourceFile: ts.SourceFile,
    filePath: string,
    depth: number,
    sourceText: string
  ): void {
    if (ts.isTaggedTemplateExpression(node)) {
      const tag = node.tag;
      if (ts.isIdentifier(tag) && ['html', 'css', 'svg'].includes(tag.text)) {
        this.templateCount++;
        const currentDepth = depth + 1;

        // Check template content
        const template = node.template;
        if (ts.isTemplateExpression(template)) {
          // Check each expression in the template
          template.templateSpans.forEach((span) => {
            this.checkExpression(span.expression, sourceFile, filePath, currentDepth, sourceText);
          });
        }

        // Check if this template violates nesting rules
        if (currentDepth > this.options.maxNestingDepth) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
          const endPosition = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
          const lineCount = endPosition.line - line + 1;

          if (
            lineCount >= this.options.minExtractedLines ||
            currentDepth > this.options.maxNestingDepth
          ) {
            const lines = sourceText.split('\n');
            const codeSnippet = lines
              .slice(Math.max(0, line - 1), Math.min(lines.length, line + 3))
              .join('\n');

            this.violations.push({
              file: filePath,
              line: line + 1,
              column: character + 1,
              depth: currentDepth,
              lineCount,
              templateType: tag.text,
              code: codeSnippet,
            });
          }
        }
      }
    }

    // Continue visiting child nodes
    ts.forEachChild(node, (child) => {
      const newDepth =
        ts.isTaggedTemplateExpression(node) &&
        ts.isIdentifier(node.tag) &&
        ['html', 'css', 'svg'].includes(node.tag.text)
          ? depth + 1
          : depth;
      this.visitNode(child, sourceFile, filePath, newDepth, sourceText);
    });
  }

  private checkExpression(
    expr: ts.Expression,
    sourceFile: ts.SourceFile,
    filePath: string,
    depth: number,
    sourceText: string
  ): void {
    if (ts.isCallExpression(expr)) {
      const expression = expr.expression;
      if (ts.isPropertyAccessExpression(expression) && expression.name.text === 'map') {
        // Check if the map callback returns a template
        const callback = expr.arguments[0];
        if (callback && ts.isArrowFunction(callback)) {
          this.visitNode(callback.body, sourceFile, filePath, depth, sourceText);
        }
      }
    } else {
      this.visitNode(expr, sourceFile, filePath, depth, sourceText);
    }
  }

  getResults(): {
    violations: TemplateViolation[];
    summary: {
      filesAnalyzed: number;
      templatesFound: number;
      violationsFound: number;
    };
  } {
    return {
      violations: this.violations,
      summary: {
        filesAnalyzed: this.fileCount,
        templatesFound: this.templateCount,
        violationsFound: this.violations.length,
      },
    };
  }
}

function _formatViolation(violation: TemplateViolation): string {
  const location = `${violation.file}:${violation.line}:${violation.column}`;
  const header = chalk.red(`✖ Template nested ${violation.depth} levels deep`);
  const details = chalk.gray(`  ${violation.lineCount} lines, ${violation.templateType} template`);
  const suggestion = chalk.yellow('  → Consider extracting into a separate function');
  const code = chalk.dim(
    `\n${violation.code
      .split('\n')
      .map((line) => `  ${line}`)
      .join('\n')}\n`
  );

  return `${chalk.cyan(location)}\n${header}\n${details}\n${suggestion}${code}`;
}

async function main() {
  const program = new Command();

  program
    .name('actor-spa-analyze')
    .description('Analyze template literal nesting in Actor-SPA projects')
    .version('1.0.0')
    .argument('[patterns...]', 'File patterns to analyze', ['src/**/*.ts', 'src/**/*.tsx'])
    .option('-d, --max-depth <number>', 'Maximum nesting depth', '2')
    .option('-l, --min-lines <number>', 'Minimum lines to suggest extraction', '3')
    .option('-v, --verbose', 'Verbose output', false)
    .option('-j, --json', 'Output results as JSON', false)
    .parse();

  const patterns = program.args;
  const options: AnalyzerOptions = {
    maxNestingDepth: Number.parseInt(program.opts().maxDepth),
    minExtractedLines: Number.parseInt(program.opts().minLines),
    verbose: program.opts().verbose,
    json: program.opts().json,
  };

  const analyzer = new TemplateAnalyzer(options);

  // Find all files matching patterns
  const files: string[] = [];
  for (const pattern of patterns) {
    try {
      // Ensure we're using the promise-based API
      const matches: string[] = await new Promise((resolve, reject) => {
        glob(
          pattern,
          {
            ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**', '**/out/**'],
          },
          (err: Error | null, result: string[]) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });
      files.push(...matches);
    } catch (_error) {
      if (!options.json) {
      }
    }
  }

  if (files.length === 0) {
    process.exit(1);
  }

  if (options.verbose && !options.json) {
  }

  // Analyze each file
  for (const file of files) {
    try {
      analyzer.analyzeFile(path.resolve(file));
    } catch (_error) {
      if (!options.json) {
      }
    }
  }

  const results = analyzer.getResults();

  if (options.json) {
  } else {
    // Print violations
    if (results.violations.length > 0) {
      results.violations.forEach((_violation) => {});
    } else {
    }

    if (results.violations.length > 0) {
    }
  }

  // Exit with error code if violations found
  process.exit(results.violations.length > 0 ? 1 : 0);
}

// Run the CLI
if (require.main === module) {
  main().catch((_error) => {
    process.exit(1);
  });
}

// Export for programmatic use
export { TemplateAnalyzer, type AnalyzerOptions, type TemplateViolation };
