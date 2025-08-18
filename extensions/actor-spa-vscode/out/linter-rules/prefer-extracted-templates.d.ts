/**
 * Conceptual implementation of prefer-extracted-templates linter rule
 * This would be implemented as a Biome rule or ESLint plugin
 */
interface RuleOptions {
    maxNestingDepth: number;
    minExtractedLines: number;
    allowInlineExpressions: boolean;
}
interface ASTNode {
    type: string;
    loc?: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
    };
}
interface RuleContext {
    report: (options: {
        node: ASTNode;
        message: string;
        suggest?: Array<{
            desc: string;
            fix: null;
        }>;
    }) => void;
}
/**
 * Example Biome rule implementation structure
 */
export declare const preferExtractedTemplates: {
    name: string;
    category: string;
    create(context: RuleContext): {
        TaggedTemplateExpression(node: ASTNode): void;
    };
};
/**
 * Helper to check if a template should be extracted based on complexity
 */
export declare function shouldExtractTemplate(templateAST: ASTNode, options?: RuleOptions): boolean;
interface CodeIssue {
    line: number;
    message: string;
    severity: 'warning' | 'error';
}
/**
 * Example usage in a code review tool
 */
export declare function reviewTemplateComplexity(code: string): {
    issues: CodeIssue[];
};
export {};
//# sourceMappingURL=prefer-extracted-templates.d.ts.map