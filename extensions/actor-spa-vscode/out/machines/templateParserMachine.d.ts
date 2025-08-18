export interface TemplateParserContext {
    input: string;
    position: number;
    tokens: TemplateToken[];
    currentToken: string;
    depth: number;
    templateType: 'html' | 'css' | null;
    inExpression: boolean;
    expressionDepth: number;
    stringDelimiter: string | null;
}
export interface TemplateToken {
    type: 'tag' | 'text' | 'expression' | 'attribute' | 'comment' | 'style';
    value: string;
    start: number;
    end: number;
    depth: number;
}
export type TemplateParserEvent = {
    type: 'CHAR';
    char: string;
} | {
    type: 'TAG_START';
} | {
    type: 'TAG_END';
} | {
    type: 'EXPRESSION_START';
} | {
    type: 'EXPRESSION_END';
} | {
    type: 'QUOTE';
    delimiter: string;
} | {
    type: 'COMMENT_START';
} | {
    type: 'COMMENT_END';
} | {
    type: 'EOF';
};
export declare const templateParserMachine: import("xstate").StateMachine<TemplateParserContext, {
    type: "CHAR";
    char: string;
} | {
    type: "TAG_START";
} | {
    type: "TAG_END";
} | {
    type: "EXPRESSION_START";
} | {
    type: "EXPRESSION_END";
} | {
    type: "QUOTE";
    delimiter: string;
} | {
    type: "COMMENT_START";
} | {
    type: "COMMENT_END";
} | {
    type: "EOF";
}, {}, never, import("xstate").Values<{
    advancePosition: {
        type: "advancePosition";
        params: import("xstate").NonReducibleUnknown;
    };
    appendToCurrentToken: {
        type: "appendToCurrentToken";
        params: import("xstate").NonReducibleUnknown;
    };
    saveToken: {
        type: "saveToken";
        params: {
            type: TemplateToken["type"];
        };
    };
    startExpression: {
        type: "startExpression";
        params: import("xstate").NonReducibleUnknown;
    };
    endExpression: {
        type: "endExpression";
        params: import("xstate").NonReducibleUnknown;
    };
    incrementExpressionDepth: {
        type: "incrementExpressionDepth";
        params: import("xstate").NonReducibleUnknown;
    };
    decrementExpressionDepth: {
        type: "decrementExpressionDepth";
        params: import("xstate").NonReducibleUnknown;
    };
    setStringDelimiter: {
        type: "setStringDelimiter";
        params: import("xstate").NonReducibleUnknown;
    };
    clearStringDelimiter: {
        type: "clearStringDelimiter";
        params: import("xstate").NonReducibleUnknown;
    };
    incrementDepth: {
        type: "incrementDepth";
        params: import("xstate").NonReducibleUnknown;
    };
    decrementDepth: {
        type: "decrementDepth";
        params: import("xstate").NonReducibleUnknown;
    };
}>, import("xstate").Values<{
    isInExpression: {
        type: "isInExpression";
        params: unknown;
    };
    isInString: {
        type: "isInString";
        params: unknown;
    };
    isMatchingQuote: {
        type: "isMatchingQuote";
        params: unknown;
    };
    isExpressionComplete: {
        type: "isExpressionComplete";
        params: unknown;
    };
}>, never, "done" | "idle" | "inExpression" | "inTag" | "inComment" | "inText" | "inAttributeString" | "inTagExpression" | "inExpressionString", string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: "templateParser";
    readonly initial: "idle";
    readonly context: {
        readonly input: "";
        readonly position: 0;
        readonly tokens: [];
        readonly currentToken: "";
        readonly depth: 0;
        readonly templateType: null;
        readonly inExpression: false;
        readonly expressionDepth: 0;
        readonly stringDelimiter: null;
    };
    readonly states: {
        readonly idle: {
            readonly on: {
                readonly TAG_START: {
                    readonly target: "inTag";
                    readonly actions: readonly [{
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "text";
                        };
                    }, "incrementDepth"];
                };
                readonly EXPRESSION_START: {
                    readonly target: "inExpression";
                    readonly actions: readonly [{
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "text";
                        };
                    }, "startExpression"];
                };
                readonly COMMENT_START: {
                    readonly target: "inComment";
                    readonly actions: readonly [{
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "text";
                        };
                    }];
                };
                readonly CHAR: {
                    readonly target: "inText";
                    readonly actions: "appendToCurrentToken";
                };
                readonly EOF: {
                    readonly target: "done";
                    readonly actions: readonly [{
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "text";
                        };
                    }];
                };
            };
        };
        readonly inText: {
            readonly on: {
                readonly TAG_START: {
                    readonly target: "inTag";
                    readonly actions: readonly [{
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "text";
                        };
                    }, "incrementDepth"];
                };
                readonly EXPRESSION_START: {
                    readonly target: "inExpression";
                    readonly actions: readonly [{
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "text";
                        };
                    }, "startExpression"];
                };
                readonly COMMENT_START: {
                    readonly target: "inComment";
                    readonly actions: {
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "text";
                        };
                    };
                };
                readonly CHAR: {
                    readonly actions: "appendToCurrentToken";
                };
                readonly EOF: {
                    readonly target: "done";
                    readonly actions: readonly [{
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "text";
                        };
                    }];
                };
            };
        };
        readonly inTag: {
            readonly on: {
                readonly TAG_END: {
                    readonly target: "idle";
                    readonly actions: readonly [{
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "tag";
                        };
                    }, "decrementDepth"];
                };
                readonly QUOTE: {
                    readonly target: "inAttributeString";
                    readonly actions: readonly ["appendToCurrentToken", "setStringDelimiter"];
                };
                readonly EXPRESSION_START: {
                    readonly target: "inTagExpression";
                    readonly actions: readonly ["appendToCurrentToken", "startExpression"];
                };
                readonly CHAR: {
                    readonly actions: "appendToCurrentToken";
                };
                readonly EOF: {
                    readonly target: "done";
                    readonly actions: readonly [{
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "tag";
                        };
                    }];
                };
            };
        };
        readonly inAttributeString: {
            readonly on: {
                readonly QUOTE: readonly [{
                    readonly guard: "isMatchingQuote";
                    readonly target: "inTag";
                    readonly actions: readonly ["appendToCurrentToken", "clearStringDelimiter"];
                }, {
                    readonly actions: "appendToCurrentToken";
                }];
                readonly CHAR: {
                    readonly actions: "appendToCurrentToken";
                };
                readonly EOF: {
                    readonly target: "done";
                    readonly actions: readonly [{
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "attribute";
                        };
                    }];
                };
            };
        };
        readonly inExpression: {
            readonly on: {
                readonly EXPRESSION_END: readonly [{
                    readonly guard: "isExpressionComplete";
                    readonly target: "idle";
                    readonly actions: readonly [{
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "expression";
                        };
                    }, "endExpression"];
                }, {
                    readonly actions: readonly ["appendToCurrentToken", "decrementExpressionDepth"];
                }];
                readonly EXPRESSION_START: {
                    readonly actions: readonly ["appendToCurrentToken", "incrementExpressionDepth"];
                };
                readonly QUOTE: {
                    readonly target: "inExpressionString";
                    readonly actions: readonly ["appendToCurrentToken", "setStringDelimiter"];
                };
                readonly CHAR: {
                    readonly actions: "appendToCurrentToken";
                };
                readonly EOF: {
                    readonly target: "done";
                    readonly actions: readonly [{
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "expression";
                        };
                    }];
                };
            };
        };
        readonly inExpressionString: {
            readonly on: {
                readonly QUOTE: readonly [{
                    readonly guard: "isMatchingQuote";
                    readonly target: "inExpression";
                    readonly actions: readonly ["appendToCurrentToken", "clearStringDelimiter"];
                }, {
                    readonly actions: "appendToCurrentToken";
                }];
                readonly CHAR: {
                    readonly actions: "appendToCurrentToken";
                };
                readonly EOF: {
                    readonly target: "done";
                    readonly actions: readonly [{
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "expression";
                        };
                    }];
                };
            };
        };
        readonly inTagExpression: {
            readonly on: {
                readonly EXPRESSION_END: readonly [{
                    readonly guard: "isExpressionComplete";
                    readonly target: "inTag";
                    readonly actions: readonly ["appendToCurrentToken", "endExpression"];
                }, {
                    readonly actions: readonly ["appendToCurrentToken", "decrementExpressionDepth"];
                }];
                readonly EXPRESSION_START: {
                    readonly actions: readonly ["appendToCurrentToken", "incrementExpressionDepth"];
                };
                readonly CHAR: {
                    readonly actions: "appendToCurrentToken";
                };
                readonly EOF: {
                    readonly target: "done";
                    readonly actions: readonly [{
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "tag";
                        };
                    }];
                };
            };
        };
        readonly inComment: {
            readonly on: {
                readonly COMMENT_END: {
                    readonly target: "idle";
                    readonly actions: readonly [{
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "comment";
                        };
                    }];
                };
                readonly CHAR: {
                    readonly actions: "appendToCurrentToken";
                };
                readonly EOF: {
                    readonly target: "done";
                    readonly actions: readonly [{
                        readonly type: "saveToken";
                        readonly params: {
                            readonly type: "comment";
                        };
                    }];
                };
            };
        };
        readonly done: {
            readonly type: "final";
        };
    };
}>;
export declare function tokenizeTemplateContent(content: string, type: 'html' | 'css'): TemplateParserEvent[];
//# sourceMappingURL=templateParserMachine.d.ts.map