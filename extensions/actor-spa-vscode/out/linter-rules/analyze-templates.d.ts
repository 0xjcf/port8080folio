#!/usr/bin/env node
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
declare class TemplateAnalyzer {
    private options;
    private violations;
    private fileCount;
    private templateCount;
    constructor(options: AnalyzerOptions);
    analyzeFile(filePath: string): void;
    private visitNode;
    private checkExpression;
    getResults(): {
        violations: TemplateViolation[];
        summary: {
            filesAnalyzed: number;
            templatesFound: number;
            violationsFound: number;
        };
    };
}
export { TemplateAnalyzer, type AnalyzerOptions, type TemplateViolation };
//# sourceMappingURL=analyze-templates.d.ts.map