import type * as vscode from 'vscode';
export interface ActorEvent {
    type: string;
    payload: unknown;
    metadata: {
        timestamp: number;
        source: string;
        correlationId: string;
    };
}
export interface ErrorEnvelope {
    error: string;
    code: string;
    context: Record<string, unknown>;
    recoverable: boolean;
}
export interface FormatterContext {
    content: string;
    language: 'html' | 'css';
    options: vscode.FormattingOptions;
    config: FormatterConfig;
    result: string | null;
    error: ErrorEnvelope | null;
    stats: {
        startTime: number;
        endTime: number | null;
        processingTimeMs: number;
    };
}
export interface FormatterConfig {
    timeout: number;
    indentSize: number;
    preserveNewlines: boolean;
}
export type FormatterEvent = {
    type: 'FORMAT';
    content: string;
    language: 'html' | 'css';
    options: vscode.FormattingOptions;
    config?: Partial<FormatterConfig>;
    correlationId: string;
} | {
    type: 'CANCEL';
    correlationId: string;
} | {
    type: 'RESET';
    correlationId: string;
};
export declare function createFormatterEvent(type: 'FORMAT', content: string, language: 'html' | 'css', options: vscode.FormattingOptions, correlationId: string, config?: Partial<FormatterConfig>): FormatterEvent;
export declare function createFormatterEvent(type: 'CANCEL' | 'RESET', correlationId: string): FormatterEvent;
export declare const biomeFormatterMachine: import("xstate").StateMachine<FormatterContext, {
    type: "FORMAT";
    content: string;
    language: "html" | "css";
    options: vscode.FormattingOptions;
    config?: Partial<FormatterConfig>;
    correlationId: string;
} | {
    type: "CANCEL";
    correlationId: string;
} | {
    type: "RESET";
    correlationId: string;
}, {
    [x: string]: import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<string, {
        content: string;
        language: string;
        config: FormatterConfig;
    }, import("xstate").EventObject>> | undefined;
}, {
    src: "formatter";
    logic: import("xstate").PromiseActorLogic<string, {
        content: string;
        language: string;
        config: FormatterConfig;
    }, import("xstate").EventObject>;
    id: string | undefined;
}, import("xstate").Values<{
    initializeFormatting: {
        type: "initializeFormatting";
        params: import("xstate").NonReducibleUnknown;
    };
    resetState: {
        type: "resetState";
        params: import("xstate").NonReducibleUnknown;
    };
}>, never, never, "error" | "idle" | "formatting" | "completed" | "cancelled", string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: string;
    readonly initial: "idle";
    readonly context: {
        readonly content: "";
        readonly language: "html";
        readonly options: {
            readonly tabSize: 2;
            readonly insertSpaces: true;
        };
        readonly config: {
            readonly timeout: 10000;
            readonly indentSize: 2;
            readonly preserveNewlines: true;
        };
        readonly result: null;
        readonly error: null;
        readonly stats: {
            readonly startTime: 0;
            readonly endTime: null;
            readonly processingTimeMs: 0;
        };
    };
    readonly states: {
        readonly idle: {
            readonly on: {
                readonly FORMAT: {
                    readonly target: "formatting";
                    readonly actions: "initializeFormatting";
                };
            };
        };
        readonly formatting: {
            readonly invoke: {
                readonly src: "formatter";
                readonly input: ({ context }: {
                    context: FormatterContext;
                    event: {
                        type: "FORMAT";
                        content: string;
                        language: "html" | "css";
                        options: vscode.FormattingOptions;
                        config?: Partial<FormatterConfig>;
                        correlationId: string;
                    } | {
                        type: "CANCEL";
                        correlationId: string;
                    } | {
                        type: "RESET";
                        correlationId: string;
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<FormatterContext, {
                        type: "FORMAT";
                        content: string;
                        language: "html" | "css";
                        options: vscode.FormattingOptions;
                        config?: Partial<FormatterConfig>;
                        correlationId: string;
                    } | {
                        type: "CANCEL";
                        correlationId: string;
                    } | {
                        type: "RESET";
                        correlationId: string;
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "FORMAT";
                        content: string;
                        language: "html" | "css";
                        options: vscode.FormattingOptions;
                        config?: Partial<FormatterConfig>;
                        correlationId: string;
                    } | {
                        type: "CANCEL";
                        correlationId: string;
                    } | {
                        type: "RESET";
                        correlationId: string;
                    }, import("xstate").AnyEventObject>;
                }) => {
                    content: string;
                    language: "html" | "css";
                    config: FormatterConfig;
                };
                readonly onDone: {
                    readonly target: "completed";
                    readonly actions: import("xstate").ActionFunction<FormatterContext, import("xstate").DoneActorEvent<string, string>, {
                        type: "FORMAT";
                        content: string;
                        language: "html" | "css";
                        options: vscode.FormattingOptions;
                        config?: Partial<FormatterConfig>;
                        correlationId: string;
                    } | {
                        type: "CANCEL";
                        correlationId: string;
                    } | {
                        type: "RESET";
                        correlationId: string;
                    }, undefined, {
                        src: "formatter";
                        logic: import("xstate").PromiseActorLogic<string, {
                            content: string;
                            language: string;
                            config: FormatterConfig;
                        }, import("xstate").EventObject>;
                        id: string | undefined;
                    }, never, never, never, never>;
                };
                readonly onError: {
                    readonly target: "error";
                    readonly actions: import("xstate").ActionFunction<FormatterContext, import("xstate").ErrorActorEvent<unknown, string>, {
                        type: "FORMAT";
                        content: string;
                        language: "html" | "css";
                        options: vscode.FormattingOptions;
                        config?: Partial<FormatterConfig>;
                        correlationId: string;
                    } | {
                        type: "CANCEL";
                        correlationId: string;
                    } | {
                        type: "RESET";
                        correlationId: string;
                    }, undefined, {
                        src: "formatter";
                        logic: import("xstate").PromiseActorLogic<string, {
                            content: string;
                            language: string;
                            config: FormatterConfig;
                        }, import("xstate").EventObject>;
                        id: string | undefined;
                    }, never, never, never, never>;
                };
            };
            readonly on: {
                readonly CANCEL: {
                    readonly target: "cancelled";
                };
            };
        };
        readonly completed: {
            readonly type: "final";
        };
        readonly error: {
            readonly on: {
                readonly RESET: {
                    readonly target: "idle";
                    readonly actions: "resetState";
                };
            };
        };
        readonly cancelled: {
            readonly on: {
                readonly RESET: {
                    readonly target: "idle";
                    readonly actions: "resetState";
                };
            };
        };
    };
}>;
export declare const prettierFormatterMachine: import("xstate").StateMachine<FormatterContext, {
    type: "FORMAT";
    content: string;
    language: "html" | "css";
    options: vscode.FormattingOptions;
    config?: Partial<FormatterConfig>;
    correlationId: string;
} | {
    type: "CANCEL";
    correlationId: string;
} | {
    type: "RESET";
    correlationId: string;
}, {
    [x: string]: import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<string, {
        content: string;
        language: string;
        config: FormatterConfig;
    }, import("xstate").EventObject>> | undefined;
}, {
    src: "formatter";
    logic: import("xstate").PromiseActorLogic<string, {
        content: string;
        language: string;
        config: FormatterConfig;
    }, import("xstate").EventObject>;
    id: string | undefined;
}, import("xstate").Values<{
    initializeFormatting: {
        type: "initializeFormatting";
        params: import("xstate").NonReducibleUnknown;
    };
    resetState: {
        type: "resetState";
        params: import("xstate").NonReducibleUnknown;
    };
}>, never, never, "error" | "idle" | "formatting" | "completed" | "cancelled", string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: string;
    readonly initial: "idle";
    readonly context: {
        readonly content: "";
        readonly language: "html";
        readonly options: {
            readonly tabSize: 2;
            readonly insertSpaces: true;
        };
        readonly config: {
            readonly timeout: 10000;
            readonly indentSize: 2;
            readonly preserveNewlines: true;
        };
        readonly result: null;
        readonly error: null;
        readonly stats: {
            readonly startTime: 0;
            readonly endTime: null;
            readonly processingTimeMs: 0;
        };
    };
    readonly states: {
        readonly idle: {
            readonly on: {
                readonly FORMAT: {
                    readonly target: "formatting";
                    readonly actions: "initializeFormatting";
                };
            };
        };
        readonly formatting: {
            readonly invoke: {
                readonly src: "formatter";
                readonly input: ({ context }: {
                    context: FormatterContext;
                    event: {
                        type: "FORMAT";
                        content: string;
                        language: "html" | "css";
                        options: vscode.FormattingOptions;
                        config?: Partial<FormatterConfig>;
                        correlationId: string;
                    } | {
                        type: "CANCEL";
                        correlationId: string;
                    } | {
                        type: "RESET";
                        correlationId: string;
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<FormatterContext, {
                        type: "FORMAT";
                        content: string;
                        language: "html" | "css";
                        options: vscode.FormattingOptions;
                        config?: Partial<FormatterConfig>;
                        correlationId: string;
                    } | {
                        type: "CANCEL";
                        correlationId: string;
                    } | {
                        type: "RESET";
                        correlationId: string;
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "FORMAT";
                        content: string;
                        language: "html" | "css";
                        options: vscode.FormattingOptions;
                        config?: Partial<FormatterConfig>;
                        correlationId: string;
                    } | {
                        type: "CANCEL";
                        correlationId: string;
                    } | {
                        type: "RESET";
                        correlationId: string;
                    }, import("xstate").AnyEventObject>;
                }) => {
                    content: string;
                    language: "html" | "css";
                    config: FormatterConfig;
                };
                readonly onDone: {
                    readonly target: "completed";
                    readonly actions: import("xstate").ActionFunction<FormatterContext, import("xstate").DoneActorEvent<string, string>, {
                        type: "FORMAT";
                        content: string;
                        language: "html" | "css";
                        options: vscode.FormattingOptions;
                        config?: Partial<FormatterConfig>;
                        correlationId: string;
                    } | {
                        type: "CANCEL";
                        correlationId: string;
                    } | {
                        type: "RESET";
                        correlationId: string;
                    }, undefined, {
                        src: "formatter";
                        logic: import("xstate").PromiseActorLogic<string, {
                            content: string;
                            language: string;
                            config: FormatterConfig;
                        }, import("xstate").EventObject>;
                        id: string | undefined;
                    }, never, never, never, never>;
                };
                readonly onError: {
                    readonly target: "error";
                    readonly actions: import("xstate").ActionFunction<FormatterContext, import("xstate").ErrorActorEvent<unknown, string>, {
                        type: "FORMAT";
                        content: string;
                        language: "html" | "css";
                        options: vscode.FormattingOptions;
                        config?: Partial<FormatterConfig>;
                        correlationId: string;
                    } | {
                        type: "CANCEL";
                        correlationId: string;
                    } | {
                        type: "RESET";
                        correlationId: string;
                    }, undefined, {
                        src: "formatter";
                        logic: import("xstate").PromiseActorLogic<string, {
                            content: string;
                            language: string;
                            config: FormatterConfig;
                        }, import("xstate").EventObject>;
                        id: string | undefined;
                    }, never, never, never, never>;
                };
            };
            readonly on: {
                readonly CANCEL: {
                    readonly target: "cancelled";
                };
            };
        };
        readonly completed: {
            readonly type: "final";
        };
        readonly error: {
            readonly on: {
                readonly RESET: {
                    readonly target: "idle";
                    readonly actions: "resetState";
                };
            };
        };
        readonly cancelled: {
            readonly on: {
                readonly RESET: {
                    readonly target: "idle";
                    readonly actions: "resetState";
                };
            };
        };
    };
}>;
export declare const fallbackFormatterMachine: import("xstate").StateMachine<FormatterContext, {
    type: "FORMAT";
    content: string;
    language: "html" | "css";
    options: vscode.FormattingOptions;
    config?: Partial<FormatterConfig>;
    correlationId: string;
} | {
    type: "CANCEL";
    correlationId: string;
} | {
    type: "RESET";
    correlationId: string;
}, {
    [x: string]: import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<string, {
        content: string;
        language: string;
        config: FormatterConfig;
    }, import("xstate").EventObject>> | undefined;
}, {
    src: "formatter";
    logic: import("xstate").PromiseActorLogic<string, {
        content: string;
        language: string;
        config: FormatterConfig;
    }, import("xstate").EventObject>;
    id: string | undefined;
}, import("xstate").Values<{
    initializeFormatting: {
        type: "initializeFormatting";
        params: import("xstate").NonReducibleUnknown;
    };
    resetState: {
        type: "resetState";
        params: import("xstate").NonReducibleUnknown;
    };
}>, never, never, "error" | "idle" | "formatting" | "completed" | "cancelled", string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: string;
    readonly initial: "idle";
    readonly context: {
        readonly content: "";
        readonly language: "html";
        readonly options: {
            readonly tabSize: 2;
            readonly insertSpaces: true;
        };
        readonly config: {
            readonly timeout: 10000;
            readonly indentSize: 2;
            readonly preserveNewlines: true;
        };
        readonly result: null;
        readonly error: null;
        readonly stats: {
            readonly startTime: 0;
            readonly endTime: null;
            readonly processingTimeMs: 0;
        };
    };
    readonly states: {
        readonly idle: {
            readonly on: {
                readonly FORMAT: {
                    readonly target: "formatting";
                    readonly actions: "initializeFormatting";
                };
            };
        };
        readonly formatting: {
            readonly invoke: {
                readonly src: "formatter";
                readonly input: ({ context }: {
                    context: FormatterContext;
                    event: {
                        type: "FORMAT";
                        content: string;
                        language: "html" | "css";
                        options: vscode.FormattingOptions;
                        config?: Partial<FormatterConfig>;
                        correlationId: string;
                    } | {
                        type: "CANCEL";
                        correlationId: string;
                    } | {
                        type: "RESET";
                        correlationId: string;
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<FormatterContext, {
                        type: "FORMAT";
                        content: string;
                        language: "html" | "css";
                        options: vscode.FormattingOptions;
                        config?: Partial<FormatterConfig>;
                        correlationId: string;
                    } | {
                        type: "CANCEL";
                        correlationId: string;
                    } | {
                        type: "RESET";
                        correlationId: string;
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "FORMAT";
                        content: string;
                        language: "html" | "css";
                        options: vscode.FormattingOptions;
                        config?: Partial<FormatterConfig>;
                        correlationId: string;
                    } | {
                        type: "CANCEL";
                        correlationId: string;
                    } | {
                        type: "RESET";
                        correlationId: string;
                    }, import("xstate").AnyEventObject>;
                }) => {
                    content: string;
                    language: "html" | "css";
                    config: FormatterConfig;
                };
                readonly onDone: {
                    readonly target: "completed";
                    readonly actions: import("xstate").ActionFunction<FormatterContext, import("xstate").DoneActorEvent<string, string>, {
                        type: "FORMAT";
                        content: string;
                        language: "html" | "css";
                        options: vscode.FormattingOptions;
                        config?: Partial<FormatterConfig>;
                        correlationId: string;
                    } | {
                        type: "CANCEL";
                        correlationId: string;
                    } | {
                        type: "RESET";
                        correlationId: string;
                    }, undefined, {
                        src: "formatter";
                        logic: import("xstate").PromiseActorLogic<string, {
                            content: string;
                            language: string;
                            config: FormatterConfig;
                        }, import("xstate").EventObject>;
                        id: string | undefined;
                    }, never, never, never, never>;
                };
                readonly onError: {
                    readonly target: "error";
                    readonly actions: import("xstate").ActionFunction<FormatterContext, import("xstate").ErrorActorEvent<unknown, string>, {
                        type: "FORMAT";
                        content: string;
                        language: "html" | "css";
                        options: vscode.FormattingOptions;
                        config?: Partial<FormatterConfig>;
                        correlationId: string;
                    } | {
                        type: "CANCEL";
                        correlationId: string;
                    } | {
                        type: "RESET";
                        correlationId: string;
                    }, undefined, {
                        src: "formatter";
                        logic: import("xstate").PromiseActorLogic<string, {
                            content: string;
                            language: string;
                            config: FormatterConfig;
                        }, import("xstate").EventObject>;
                        id: string | undefined;
                    }, never, never, never, never>;
                };
            };
            readonly on: {
                readonly CANCEL: {
                    readonly target: "cancelled";
                };
            };
        };
        readonly completed: {
            readonly type: "final";
        };
        readonly error: {
            readonly on: {
                readonly RESET: {
                    readonly target: "idle";
                    readonly actions: "resetState";
                };
            };
        };
        readonly cancelled: {
            readonly on: {
                readonly RESET: {
                    readonly target: "idle";
                    readonly actions: "resetState";
                };
            };
        };
    };
}>;
//# sourceMappingURL=formatterActors.d.ts.map