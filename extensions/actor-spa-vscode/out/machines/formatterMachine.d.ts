import * as vscode from 'vscode';
export interface FormatterContext {
    input: string;
    position: number;
    line: number;
    column: number;
    indentLevel: number;
    exprDepth: number;
    edits: vscode.TextEdit[];
    formattedEdits: vscode.TextEdit[];
    currentIndent: string;
    indentSize: number;
    preserveNewlines: boolean;
    inTemplate: 'html' | 'css' | null;
    templateStart: number;
    templateIndent: number;
}
export type FormatterEvent = {
    type: 'START_FORMATTING';
    input: string;
    options: vscode.FormattingOptions;
} | {
    type: 'CHAR';
    char: string;
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
    type: 'TEMPLATE_TAG';
    tag: 'html' | 'css';
} | {
    type: 'EOF';
};
export declare const formatterMachine: import("xstate").StateMachine<FormatterContext, {
    type: "START_FORMATTING";
    input: string;
    options: vscode.FormattingOptions;
} | {
    type: "CHAR";
    char: string;
} | {
    type: "BACKTICK";
} | {
    type: "DOLLAR_LBRACE";
} | {
    type: "LBRACE";
} | {
    type: "RBRACE";
} | {
    type: "NEWLINE";
} | {
    type: "TEMPLATE_TAG";
    tag: "html" | "css";
} | {
    type: "EOF";
}, {}, never, import("xstate").Values<{
    initializeFormatting: {
        type: "initializeFormatting";
        params: import("xstate").NonReducibleUnknown;
    };
    advancePosition: {
        type: "advancePosition";
        params: import("xstate").NonReducibleUnknown;
    };
    incrementLine: {
        type: "incrementLine";
        params: import("xstate").NonReducibleUnknown;
    };
    recordTemplateStart: {
        type: "recordTemplateStart";
        params: import("xstate").NonReducibleUnknown;
    };
    enterTemplate: {
        type: "enterTemplate";
        params: import("xstate").NonReducibleUnknown;
    };
    exitTemplate: {
        type: "exitTemplate";
        params: import("xstate").NonReducibleUnknown;
    };
    resetTemplate: {
        type: "resetTemplate";
        params: import("xstate").NonReducibleUnknown;
    };
    enterInterpolation: {
        type: "enterInterpolation";
        params: import("xstate").NonReducibleUnknown;
    };
    incrementExprDepth: {
        type: "incrementExprDepth";
        params: import("xstate").NonReducibleUnknown;
    };
    decrementExprDepth: {
        type: "decrementExprDepth";
        params: import("xstate").NonReducibleUnknown;
    };
    addNewlineAfterBacktick: {
        type: "addNewlineAfterBacktick";
        params: import("xstate").NonReducibleUnknown;
    };
    addNewlineBeforeBacktick: {
        type: "addNewlineBeforeBacktick";
        params: import("xstate").NonReducibleUnknown;
    };
    addTemplateIndent: {
        type: "addTemplateIndent";
        params: import("xstate").NonReducibleUnknown;
    };
    setTemplateTag: {
        type: "setTemplateTag";
        params: import("xstate").NonReducibleUnknown;
    };
    processTokens: {
        type: "processTokens";
        params: import("xstate").NonReducibleUnknown;
    };
    finalizeEdits: {
        type: "finalizeEdits";
        params: import("xstate").NonReducibleUnknown;
    };
}>, {
    type: "isAtExpressionEnd";
    params: unknown;
}, never, "formatting" | "template" | "root" | "waitingForBacktick" | "interpolation", string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: "formatter";
    readonly initial: "root";
    readonly context: {
        readonly input: "";
        readonly position: 0;
        readonly line: 0;
        readonly column: 0;
        readonly indentLevel: 0;
        readonly exprDepth: 0;
        readonly edits: [];
        readonly formattedEdits: [];
        readonly currentIndent: "";
        readonly indentSize: 2;
        readonly preserveNewlines: true;
        readonly inTemplate: null;
        readonly templateStart: 0;
        readonly templateIndent: 0;
    };
    readonly states: {
        readonly root: {
            readonly on: {
                readonly START_FORMATTING: {
                    readonly target: "formatting";
                    readonly actions: readonly ["initializeFormatting"];
                };
                readonly TEMPLATE_TAG: {
                    readonly target: "waitingForBacktick";
                    readonly actions: "setTemplateTag";
                };
                readonly CHAR: {
                    readonly actions: "advancePosition";
                };
                readonly NEWLINE: {
                    readonly actions: readonly ["advancePosition", "incrementLine"];
                };
            };
        };
        readonly formatting: {
            readonly entry: readonly ["processTokens", "finalizeEdits"];
            readonly always: {
                readonly target: "root";
            };
        };
        readonly waitingForBacktick: {
            readonly on: {
                readonly BACKTICK: {
                    readonly target: "template";
                    readonly actions: readonly ["recordTemplateStart", "addNewlineAfterBacktick"];
                };
                readonly CHAR: {
                    readonly target: "root";
                    readonly actions: "advancePosition";
                };
            };
        };
        readonly template: {
            readonly entry: "enterTemplate";
            readonly exit: "exitTemplate";
            readonly on: {
                readonly DOLLAR_LBRACE: {
                    readonly target: "interpolation";
                    readonly actions: "enterInterpolation";
                };
                readonly BACKTICK: {
                    readonly target: "root";
                    readonly actions: readonly ["addNewlineBeforeBacktick", "resetTemplate"];
                };
                readonly NEWLINE: {
                    readonly actions: readonly ["advancePosition", "incrementLine", "addTemplateIndent"];
                };
                readonly CHAR: {
                    readonly actions: "advancePosition";
                };
            };
        };
        readonly interpolation: {
            readonly entry: "incrementExprDepth";
            readonly on: {
                readonly LBRACE: {
                    readonly actions: "incrementExprDepth";
                };
                readonly RBRACE: readonly [{
                    readonly guard: "isAtExpressionEnd";
                    readonly target: "template";
                    readonly actions: "decrementExprDepth";
                }, {
                    readonly actions: "decrementExprDepth";
                }];
                readonly CHAR: {
                    readonly actions: "advancePosition";
                };
                readonly NEWLINE: {
                    readonly actions: readonly ["advancePosition", "incrementLine"];
                };
            };
        };
    };
}>;
//# sourceMappingURL=formatterMachine.d.ts.map