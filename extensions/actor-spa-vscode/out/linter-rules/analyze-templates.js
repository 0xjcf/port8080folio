#!/usr/bin/env node
Object.defineProperty(exports, '__esModule', { value: true });
exports.TemplateAnalyzer = void 0;
const ts = require('typescript');
const fs = require('fs');
const path = require('path');
const globModule = require('glob');
const chalk_1 = require('chalk');
const commander_1 = require('commander');
// Use the default export if available, otherwise use the module
const globAsync = globModule.glob || globModule.default || globModule;
class TemplateAnalyzer {
  constructor(options) {
    this.options = options;
    this.violations = [];
    this.fileCount = 0;
    this.templateCount = 0;
  }
  analyzeFile(filePath) {
    const sourceText = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
    this.fileCount++;
    this.visitNode(sourceFile, sourceFile, filePath, 0, sourceText);
  }
  visitNode(node, sourceFile, filePath, depth, sourceText) {
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
  checkExpression(expr, sourceFile, filePath, depth, sourceText) {
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
  getResults() {
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
exports.TemplateAnalyzer = TemplateAnalyzer;
function formatViolation(violation) {
  const location = `${violation.file}:${violation.line}:${violation.column}`;
  const header = chalk_1.default.red(`✖ Template nested ${violation.depth} levels deep`);
  const details = chalk_1.default.gray(
    `  ${violation.lineCount} lines, ${violation.templateType} template`
  );
  const suggestion = chalk_1.default.yellow('  → Consider extracting into a separate function');
  const code = chalk_1.default.dim(
    `\n${violation.code
      .split('\n')
      .map((line) => '  ' + line)
      .join('\n')}\n`
  );
  return `${chalk_1.default.cyan(location)}\n${header}\n${details}\n${suggestion}${code}`;
}
async function main() {
  const program = new commander_1.Command();
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
  const options = {
    maxNestingDepth: Number.parseInt(program.opts().maxDepth),
    minExtractedLines: Number.parseInt(program.opts().minLines),
    verbose: program.opts().verbose,
    json: program.opts().json,
  };
  const analyzer = new TemplateAnalyzer(options);
  // Find all files matching patterns
  const files = [];
  for (const pattern of patterns) {
    try {
      // Ensure we're using the promise-based API
      const matches = await new Promise((resolve, reject) => {
        globAsync(
          pattern,
          {
            ignore: ['**/node_modules/**', '**/*.d.ts', '**/dist/**', '**/out/**'],
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        );
      });
      files.push(...matches);
    } catch (error) {
      if (!options.json) {
        console.error(chalk_1.default.red(`Error globbing pattern ${pattern}:`), error);
      }
    }
  }
  if (files.length === 0) {
    console.error(chalk_1.default.red('No files found matching patterns:'), ...patterns);
    process.exit(1);
  }
  if (options.verbose && !options.json) {
    console.log(chalk_1.default.blue(`Analyzing ${files.length} files...`));
  }
  // Analyze each file
  for (const file of files) {
    try {
      analyzer.analyzeFile(path.resolve(file));
    } catch (error) {
      if (!options.json) {
        console.error(chalk_1.default.red(`Error analyzing ${file}:`), error);
      }
    }
  }
  const results = analyzer.getResults();
  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    // Print violations
    if (results.violations.length > 0) {
      console.log(
        chalk_1.default.red.bold(
          `\n✖ Found ${results.violations.length} template nesting violations:\n`
        )
      );
      results.violations.forEach((violation) => {
        console.log(formatViolation(violation));
      });
    } else {
      console.log(chalk_1.default.green.bold('\n✓ No template nesting violations found!'));
    }
    // Print summary
    console.log(chalk_1.default.bold('\nSummary:'));
    console.log(`  Files analyzed: ${results.summary.filesAnalyzed}`);
    console.log(`  Templates found: ${results.summary.templatesFound}`);
    console.log(`  Violations: ${results.summary.violationsFound}`);
    if (results.violations.length > 0) {
      console.log(
        chalk_1.default.yellow(
          '\n💡 Tip: Extract complex templates into separate functions for better maintainability.'
        )
      );
      console.log(
        chalk_1.default.gray(
          'See https://github.com/actor-spa/docs/template-best-practices for more info.'
        )
      );
    }
  }
  // Exit with error code if violations found
  process.exit(results.violations.length > 0 ? 1 : 0);
}
// Run the CLI
if (require.main === module) {
  main().catch((error) => {
    console.error(chalk_1.default.red('Unexpected error:'), error);
    process.exit(1);
  });
}
