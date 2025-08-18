import { spawn } from 'node:child_process';
import * as path from 'node:path';
import * as vscode from 'vscode';

interface ReactiveLintViolation {
  file: string;
  line: number;
  column: number;
  rule: string;
  message: string;
  severity: 'error' | 'warning';
  fix?: string;
}

// Future use: Interface for reactive-lint results
// interface ReactiveLintResult {
//   violations: ReactiveLintViolation[];
//   summary: {
//     errors: number;
//     warnings: number;
//     files: number;
//   };
// }

export class ReactiveLintProvider implements vscode.CodeActionProvider {
  private static readonly DIAGNOSTIC_COLLECTION_NAME = 'reactive-lint';
  private diagnosticCollection: vscode.DiagnosticCollection;
  private outputChannel: vscode.OutputChannel;

  constructor(outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection(
      ReactiveLintProvider.DIAGNOSTIC_COLLECTION_NAME
    );
  }

  /**
   * Run reactive-lint on a file and update diagnostics
   */
  async analyzeFile(document: vscode.TextDocument): Promise<void> {
    if (!this.shouldAnalyze(document)) {
      return;
    }

    try {
      const violations = await this.runReactiveLint(document.uri.fsPath);
      this.updateDiagnostics(document, violations);
    } catch (error) {
      this.outputChannel.appendLine(`Reactive-lint error: ${error}`);
    }
  }

  /**
   * Check if document should be analyzed
   */
  private shouldAnalyze(document: vscode.TextDocument): boolean {
    const config = vscode.workspace.getConfiguration('actor-spa');
    const isEnabled = config.get('enableDiagnostics', true);

    if (!isEnabled) {
      return false;
    }

    // Only analyze TypeScript files
    const isTypeScript =
      document.languageId === 'typescript' || document.languageId === 'typescriptreact';

    // Skip test files and node_modules
    const isTestFile =
      document.uri.fsPath.includes('.test.') || document.uri.fsPath.includes('.spec.');
    const isNodeModules = document.uri.fsPath.includes('node_modules');

    return isTypeScript && !isTestFile && !isNodeModules;
  }

  /**
   * Run reactive-lint CLI on a file
   */
  private async runReactiveLint(filePath: string): Promise<ReactiveLintViolation[]> {
    return new Promise((resolve, reject) => {
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(filePath));
      const cwd = workspaceFolder?.uri.fsPath || path.dirname(filePath);

      // Path to reactive-lint CLI
      const reactiveLintPath = path.join(cwd, 'node_modules', '.bin', 'reactive-lint');
      const extensionReactiveLintPath = path.join(
        cwd,
        'extensions',
        'reactive-lint',
        'dist',
        'cli.js'
      );

      // Try extension path first, then node_modules
      const cliPath = require('node:fs').existsSync(extensionReactiveLintPath)
        ? extensionReactiveLintPath
        : reactiveLintPath;

      const args = [cliPath, filePath, '--format', 'json'];

      const child = spawn('node', args, { cwd });
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code !== 0 && code !== 1) {
          // Code 1 is expected when violations are found
          reject(new Error(`Reactive-lint failed with code ${code}: ${stderr}`));
          return;
        }

        try {
          const violations = this.parseReactiveLintOutput(stdout, filePath);
          resolve(violations);
        } catch (_error) {
          // If JSON parsing fails, try parsing plain text output
          const violations = this.parsePlainTextOutput(stdout, filePath);
          resolve(violations);
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Parse reactive-lint JSON output
   */
  private parseReactiveLintOutput(output: string, filePath: string): ReactiveLintViolation[] {
    if (!output.trim()) {
      return [];
    }

    const violations: ReactiveLintViolation[] = [];

    try {
      const result = JSON.parse(output);

      if (result.violations) {
        for (const violation of result.violations) {
          violations.push({
            file: filePath,
            line: violation.line - 1, // VS Code uses 0-based line numbers
            column: violation.column - 1,
            rule: violation.rule,
            message: violation.message,
            severity: violation.severity === 'error' ? 'error' : 'warning',
            fix: violation.fix,
          });
        }
      }
    } catch (_error) {
      // Fallback to plain text parsing
      return this.parsePlainTextOutput(output, filePath);
    }

    return violations;
  }

  /**
   * Parse reactive-lint plain text output
   */
  private parsePlainTextOutput(output: string, filePath: string): ReactiveLintViolation[] {
    const violations: ReactiveLintViolation[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      // Match pattern: ❌ ERROR ./path/to/file.ts:123:45 Message (rule-name)
      const errorMatch = line.match(/❌ ERROR\s+.*:(\d+):(\d+)\s+(.+?)\s+\(([^)]+)\)/);
      if (errorMatch) {
        violations.push({
          file: filePath,
          line: Number.parseInt(errorMatch[1]) - 1,
          column: Number.parseInt(errorMatch[2]) - 1,
          rule: errorMatch[4],
          message: errorMatch[3],
          severity: 'error',
        });
        continue;
      }

      // Match pattern: ● WARN ./path/to/file.ts:123:45 Message (rule-name)
      const warnMatch = line.match(/● WARN\s+.*:(\d+):(\d+)\s+(.+?)\s+\(([^)]+)\)/);
      if (warnMatch) {
        violations.push({
          file: filePath,
          line: Number.parseInt(warnMatch[1]) - 1,
          column: Number.parseInt(warnMatch[2]) - 1,
          rule: warnMatch[4],
          message: warnMatch[3],
          severity: 'warning',
        });
      }
    }

    return violations;
  }

  /**
   * Update VS Code diagnostics
   */
  private updateDiagnostics(
    document: vscode.TextDocument,
    violations: ReactiveLintViolation[]
  ): void {
    const diagnostics: vscode.Diagnostic[] = [];

    for (const violation of violations) {
      const range = new vscode.Range(
        violation.line,
        violation.column,
        violation.line,
        violation.column + 10 // Highlight a reasonable range
      );

      const diagnostic = new vscode.Diagnostic(
        range,
        `[${violation.rule}] ${violation.message}`,
        violation.severity === 'error'
          ? vscode.DiagnosticSeverity.Error
          : vscode.DiagnosticSeverity.Warning
      );

      diagnostic.source = 'reactive-lint';
      diagnostic.code = violation.rule;

      diagnostics.push(diagnostic);
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  /**
   * Provide code actions for reactive-lint violations
   */
  provideCodeActions(
    document: vscode.TextDocument,
    _range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
    const actions: vscode.CodeAction[] = [];

    // Get reactive-lint diagnostics in the range
    const reactiveLintDiagnostics = context.diagnostics.filter(
      (diagnostic) => diagnostic.source === 'reactive-lint'
    );

    for (const diagnostic of reactiveLintDiagnostics) {
      const rule = diagnostic.code as string;

      // Create quick fix actions based on the rule
      const quickFix = this.createQuickFix(document, diagnostic, rule);
      if (quickFix) {
        actions.push(quickFix);
      }

      // Create "Learn more" action
      const learnMoreAction = new vscode.CodeAction(
        `Learn more about ${rule}`,
        vscode.CodeActionKind.QuickFix
      );
      learnMoreAction.command = {
        title: 'Learn more',
        command: 'actor-spa.showReactivePatternDocs',
        arguments: [rule],
      };
      actions.push(learnMoreAction);
    }

    return actions;
  }

  /**
   * Create quick fix action for a specific rule
   */
  private createQuickFix(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
    rule: string
  ): vscode.CodeAction | undefined {
    const line = document.lineAt(diagnostic.range.start.line);
    const lineText = line.text;

    switch (rule) {
      case 'no-context-booleans':
        return this.createBooleanToStateQuickFix(document, diagnostic, lineText);

      case 'no-dom-query':
        return this.createDomQueryQuickFix(document, diagnostic, lineText);

      case 'no-timers':
        return this.createTimerQuickFix(document, diagnostic, lineText);

      case 'no-event-listeners':
        return this.createEventListenerQuickFix(document, diagnostic, lineText);

      default:
        return undefined;
    }
  }

  /**
   * Create quick fix for boolean context violations
   */
  private createBooleanToStateQuickFix(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
    lineText: string
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      'Replace boolean with machine state',
      vscode.CodeActionKind.QuickFix
    );

    action.diagnostics = [diagnostic];
    action.edit = new vscode.WorkspaceEdit();

    // Simple transformation example
    const newText = lineText.replace(/isVisible/g, "state.matches('visible')");
    const range = new vscode.Range(
      diagnostic.range.start.line,
      0,
      diagnostic.range.start.line,
      lineText.length
    );

    action.edit.replace(document.uri, range, newText);
    return action;
  }

  /**
   * Create quick fix for DOM query violations
   */
  private createDomQueryQuickFix(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
    lineText: string
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      'Replace DOM query with event communication',
      vscode.CodeActionKind.QuickFix
    );

    action.diagnostics = [diagnostic];
    action.edit = new vscode.WorkspaceEdit();

    // Example transformation
    const newText = lineText.replace(
      /document\.querySelector\(['"]([^'"]+)['"]\)/g,
      '// TODO: Replace with event communication - see docs/REACTIVE_PATTERNS.md'
    );

    const range = new vscode.Range(
      diagnostic.range.start.line,
      0,
      diagnostic.range.start.line,
      lineText.length
    );

    action.edit.replace(document.uri, range, newText);
    return action;
  }

  /**
   * Create quick fix for timer violations
   */
  private createTimerQuickFix(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
    lineText: string
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      'Replace timer with XState delayed transition',
      vscode.CodeActionKind.QuickFix
    );

    action.diagnostics = [diagnostic];
    action.edit = new vscode.WorkspaceEdit();

    // Example transformation
    const newText = lineText.replace(
      /setTimeout\(/g,
      '// TODO: Replace with XState delayed transition - see docs/REACTIVE_PATTERNS.md'
    );

    const range = new vscode.Range(
      diagnostic.range.start.line,
      0,
      diagnostic.range.start.line,
      lineText.length
    );

    action.edit.replace(document.uri, range, newText);
    return action;
  }

  /**
   * Create quick fix for event listener violations
   */
  private createEventListenerQuickFix(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
    lineText: string
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      'Replace addEventListener with declarative event handling',
      vscode.CodeActionKind.QuickFix
    );

    action.diagnostics = [diagnostic];
    action.edit = new vscode.WorkspaceEdit();

    // Example transformation
    const newText = lineText.replace(
      /addEventListener\(/g,
      '// TODO: Replace with declarative event handling - see docs/REACTIVE_PATTERNS.md'
    );

    const range = new vscode.Range(
      diagnostic.range.start.line,
      0,
      diagnostic.range.start.line,
      lineText.length
    );

    action.edit.replace(document.uri, range, newText);
    return action;
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.diagnosticCollection.dispose();
  }
}
