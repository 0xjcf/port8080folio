import type { SourceFile } from 'ts-morph';

/**
 * Core type definitions for reactive-lint
 */

// Type alias for better naming
export type TsSourceFile = SourceFile;

export interface LintConfig {
  extends?: string;
  engine: 'ast' | 'regex';
  parallel: boolean;
  maxConcurrency: number;
  include: string[];
  exclude: string[];
  rules: Record<string, RuleConfig>;
  reporters: ReporterType[];
  exitCode: {
    onError: number;
    onWarning: number;
  };
}

export type RuleConfig =
  | boolean
  | 'error'
  | 'warning'
  | 'info'
  | 'off'
  | {
      severity: Severity;
      message?: string;
      autofix?: boolean;
      [key: string]: unknown;
    };

export interface BaseRuleConfig {
  severity?: Severity;
  message?: string;
  autofix?: boolean;
  exceptions?: string[]; // ✅ FRAMEWORK: Exception patterns for framework-sanctioned code
}

export interface TemplateRuleConfig extends BaseRuleConfig {
  maxNestingDepth?: number;
  minExtractedLines?: number;
  allowInlineExpressions?: boolean;
}

export type AnyRuleConfig = BaseRuleConfig | TemplateRuleConfig;

export type Severity = 'error' | 'warning' | 'info';
export type ReporterType = 'pretty' | 'json' | 'sarif';

export interface Violation {
  ruleId: string;
  message: string;
  severity: Severity;
  file: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  source: string;
  fix?: AutoFix | null;
  suggestions?: Suggestion[];
  timestamp: number;
}

export interface AutoFix {
  range: [number, number];
  text: string;
}

export interface Suggestion {
  desc: string;
  fix: AutoFix;
}

export interface RuleContext {
  file: string;
  config: RuleConfig;
  sourceFile: TsSourceFile;
  content: string;
}

export interface LintResult {
  errorCount: number;
  warningCount: number;
  infoCount: number;
  totalViolations: number;
  filesScanned: number;
  rulesExecuted: number;
}

export interface EventData {
  type: string;
  timestamp: number;
  data: unknown;
}

export interface ViolationEvent extends EventData {
  type: 'violation';
  data: Violation;
}

export interface ScanStartEvent extends EventData {
  type: 'scan:start';
  data: {
    files: string[];
    rules: string[];
    config: LintConfig;
  };
}

export interface ScanCompleteEvent extends EventData {
  type: 'scan:complete';
  data: {
    files: string[];
    violations: Violation[];
    stats: LintStats;
    duration: number;
  };
}

export interface LintStats {
  violations: number;
  errors: number;
  warnings: number;
  info: number;
  filesScanned: number;
  rulesExecuted: number;
}

export interface RuleMetadata {
  name: string;
  docs: {
    description: string;
    category: string;
    recommended: boolean;
    url?: string;
  };
  fixable?: boolean;
  schema?: unknown[];
}

export interface TemplateNestingConfig {
  maxNestingDepth: number;
  minExtractedLines: number;
  allowInlineExpressions: boolean;
}

export interface Position {
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  source: string;
}

export interface NodePosition {
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
}

// ts-morph Node type for better type safety
export interface TsMorphNode {
  getStart(): number;
  getEnd(): number;
  getStartLineNumber(): number;
  getStartLinePos(): number;
  getText(): string;
  getKind(): number;
}

export interface BaseRuleInterface {
  check(sourceFile: TsSourceFile, content: string, context: RuleContext): Promise<Violation[]>;
  createViolation(options: Partial<Violation>): Violation;
  getNodePosition(node: TsMorphNode): Position;
  getSourceContext(sourceFile: TsSourceFile, line: number, contextLines?: number): string;
}

export interface Reporter {
  setupEventListeners(): void;
}

export interface EventBus {
  emitViolation(violation: Violation): void;
  emitScanStart(data: ScanStartEvent['data']): void;
  emitScanComplete(data: ScanCompleteEvent['data']): void;
  emitScanError(error: Error): void;
  emitFileStart(data: { file: string }): void;
  emitFileComplete(data: { file: string; violations: number }): void;
  emitFileError(data: { file: string; error: string }): void;
  getStats(): LintStats;
  resetStats(): void;
  on(event: string, listener: (data: EventData) => void): void;
}

export interface CLIOptions {
  config: string;
  format: ReporterType;
  fix: boolean;
  watch: boolean;
  maxConcurrency: string;
  engine: 'ast' | 'regex';
  exitCode: boolean;
  verbose: boolean;
}

// XState event types for better type safety
export interface XStateAssignArgs<TContext> {
  context: TContext;
  event: XStateEvent;
}

export interface XStateEvent {
  type: string;
  [key: string]: unknown;
}

export interface FileScannerEvent extends XStateEvent {
  type: 'SCAN';
  file: string;
}

export interface OrchestratorEvent extends XStateEvent {
  type:
    | 'START'
    | 'FILES_DISCOVERED'
    | 'DISCOVERY_ERROR'
    | 'FILE_COMPLETE'
    | 'VIOLATION_FOUND'
    | 'FILE_ERROR';
  files?: string[];
  file?: string;
  violation?: Violation;
  error?: string;
}
