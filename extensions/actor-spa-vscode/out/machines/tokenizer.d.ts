import * as vscode from 'vscode';
export type TokenizerEvent = {
    type: 'TEMPLATE_TAG';
    tag: 'html' | 'css';
} | {
    type: 'BACKTICK';
} | {
    type: 'DOLLAR_LBRACE';
} | {
    type: 'LBRACE';
} | {
    type: 'RBRACE';
} | {
    type: 'NEWLINE';
} | {
    type: 'CHAR';
    char: string;
} | {
    type: 'EOF';
};
export declare function tokenizeForMachine(text: string): TokenizerEvent[];
export declare function formatWithMachine(text: string, _version: string, options: vscode.FormattingOptions): {
    edits: Array<{
        range: vscode.Range;
        newText: string;
    }>;
};
//# sourceMappingURL=tokenizer.d.ts.map