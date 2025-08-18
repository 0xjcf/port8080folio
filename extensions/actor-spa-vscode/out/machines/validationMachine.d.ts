import type * as vscode from 'vscode';
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    fixes: vscode.TextEdit[];
}
export interface ValidationContext {
    originalText: string;
    formattedText: string;
    edits: vscode.TextEdit[];
    results: ValidationResult[];
    errors: string[];
    stats: {
        totalValidations: number;
        passedValidations: number;
        failedValidations: number;
        warningsGenerated: number;
        fixesApplied: number;
        processingTime: number;
    };
}
export type ValidationEvent = {
    type: 'VALIDATE';
    originalText: string;
    formattedText: string;
    edits: vscode.TextEdit[];
} | {
    type: 'VALIDATION_COMPLETE';
    results: ValidationResult[];
} | {
    type: 'ERROR';
    error: string;
} | {
    type: 'RETRY';
} | {
    type: 'RESET';
};
export declare const validationMachine: import("xstate").StateMachine<ValidationContext, {
    type: "VALIDATE";
    originalText: string;
    formattedText: string;
    edits: vscode.TextEdit[];
} | {
    type: "VALIDATION_COMPLETE";
    results: ValidationResult[];
} | {
    type: "ERROR";
    error: string;
} | {
    type: "RETRY";
} | {
    type: "RESET";
}, {
    [x: string]: import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<ValidationResult[], {
        originalText: string;
        formattedText: string;
        edits: vscode.TextEdit[];
    }, import("xstate").EventObject>> | undefined;
}, {
    src: "comprehensiveValidation";
    logic: import("xstate").PromiseActorLogic<ValidationResult[], {
        originalText: string;
        formattedText: string;
        edits: vscode.TextEdit[];
    }, import("xstate").EventObject>;
    id: string | undefined;
}, import("xstate").Values<{
    addError: {
        type: "addError";
        params: import("xstate").NonReducibleUnknown;
    };
    resetState: {
        type: "resetState";
        params: import("xstate").NonReducibleUnknown;
    };
    setValidationResults: {
        type: "setValidationResults";
        params: import("xstate").NonReducibleUnknown;
    };
    setValidationInput: {
        type: "setValidationInput";
        params: import("xstate").NonReducibleUnknown;
    };
}>, never, never, "error" | "idle" | "completed" | "validating", string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: "validation";
    readonly initial: "idle";
    readonly context: {
        readonly originalText: "";
        readonly formattedText: "";
        readonly edits: [];
        readonly results: [];
        readonly errors: [];
        readonly stats: {
            readonly totalValidations: 0;
            readonly passedValidations: 0;
            readonly failedValidations: 0;
            readonly warningsGenerated: 0;
            readonly fixesApplied: 0;
            readonly processingTime: 0;
        };
    };
    readonly states: {
        readonly idle: {
            readonly on: {
                readonly VALIDATE: {
                    readonly target: "validating";
                    readonly actions: "setValidationInput";
                };
            };
        };
        readonly validating: {
            readonly invoke: {
                readonly id: "comprehensiveValidation";
                readonly src: "comprehensiveValidation";
                readonly input: ({ context }: {
                    context: ValidationContext;
                    event: {
                        type: "VALIDATE";
                        originalText: string;
                        formattedText: string;
                        edits: vscode.TextEdit[];
                    } | {
                        type: "VALIDATION_COMPLETE";
                        results: ValidationResult[];
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<ValidationContext, {
                        type: "VALIDATE";
                        originalText: string;
                        formattedText: string;
                        edits: vscode.TextEdit[];
                    } | {
                        type: "VALIDATION_COMPLETE";
                        results: ValidationResult[];
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "VALIDATE";
                        originalText: string;
                        formattedText: string;
                        edits: vscode.TextEdit[];
                    } | {
                        type: "VALIDATION_COMPLETE";
                        results: ValidationResult[];
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, import("xstate").AnyEventObject>;
                }) => {
                    originalText: string;
                    formattedText: string;
                    edits: vscode.TextEdit[];
                };
                readonly onDone: {
                    readonly target: "completed";
                    readonly actions: import("xstate").ActionFunction<ValidationContext, import("xstate").DoneActorEvent<ValidationResult[], string>, {
                        type: "VALIDATE";
                        originalText: string;
                        formattedText: string;
                        edits: vscode.TextEdit[];
                    } | {
                        type: "VALIDATION_COMPLETE";
                        results: ValidationResult[];
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, undefined, {
                        src: "comprehensiveValidation";
                        logic: import("xstate").PromiseActorLogic<ValidationResult[], {
                            originalText: string;
                            formattedText: string;
                            edits: vscode.TextEdit[];
                        }, import("xstate").EventObject>;
                        id: string | undefined;
                    }, never, never, never, never>;
                };
                readonly onError: {
                    readonly target: "error";
                    readonly actions: import("xstate").ActionFunction<ValidationContext, import("xstate").ErrorActorEvent<unknown, string>, {
                        type: "VALIDATE";
                        originalText: string;
                        formattedText: string;
                        edits: vscode.TextEdit[];
                    } | {
                        type: "VALIDATION_COMPLETE";
                        results: ValidationResult[];
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, undefined, {
                        src: "comprehensiveValidation";
                        logic: import("xstate").PromiseActorLogic<ValidationResult[], {
                            originalText: string;
                            formattedText: string;
                            edits: vscode.TextEdit[];
                        }, import("xstate").EventObject>;
                        id: string | undefined;
                    }, never, never, never, never>;
                };
            };
        };
        readonly completed: {
            readonly on: {
                readonly VALIDATE: {
                    readonly target: "validating";
                    readonly actions: "setValidationInput";
                };
                readonly RESET: {
                    readonly target: "idle";
                    readonly actions: "resetState";
                };
            };
        };
        readonly error: {
            readonly on: {
                readonly RETRY: {
                    readonly target: "validating";
                };
                readonly RESET: {
                    readonly target: "idle";
                    readonly actions: "resetState";
                };
            };
        };
    };
}>;
//# sourceMappingURL=validationMachine.d.ts.map