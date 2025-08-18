import * as vscode from 'vscode';
export interface TemplateInfo {
    range: vscode.Range;
    content: string;
    language: 'html' | 'css';
    indentLevel: number;
    isNested: boolean;
    complexity: 'simple' | 'medium' | 'complex';
    expressionCount: number;
    lineCount: number;
    startPosition: number;
    endPosition: number;
}
export interface DiscoveryContext {
    document: vscode.TextDocument | null;
    text: string;
    position: number;
    templates: TemplateInfo[];
    errors: string[];
    currentTemplate: Partial<TemplateInfo> | null;
    stats: {
        totalTemplates: number;
        htmlTemplates: number;
        cssTemplates: number;
        nestedTemplates: number;
        complexTemplates: number;
        processingTime: number;
    };
}
export type DiscoveryEvent = {
    type: 'DISCOVER';
    document: vscode.TextDocument;
} | {
    type: 'TEMPLATE_FOUND';
    template: TemplateInfo;
} | {
    type: 'SCAN_COMPLETE';
} | {
    type: 'ANALYSIS_COMPLETE';
} | {
    type: 'VALIDATION_COMPLETE';
} | {
    type: 'ERROR';
    error: string;
} | {
    type: 'RETRY';
} | {
    type: 'RESET';
};
export declare const discoveryMachine: import("xstate").StateMachine<DiscoveryContext, {
    type: "DISCOVER";
    document: vscode.TextDocument;
} | {
    type: "TEMPLATE_FOUND";
    template: TemplateInfo;
} | {
    type: "SCAN_COMPLETE";
} | {
    type: "ANALYSIS_COMPLETE";
} | {
    type: "VALIDATION_COMPLETE";
} | {
    type: "ERROR";
    error: string;
} | {
    type: "RETRY";
} | {
    type: "RESET";
}, {
    [x: string]: import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<TemplateInfo[], {
        document: vscode.TextDocument;
    }, import("xstate").EventObject>> | import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<{
        templates: TemplateInfo[];
        stats: {
            totalTemplates: number;
            htmlTemplates: number;
            cssTemplates: number;
            nestedTemplates: number;
            complexTemplates: number;
            processingTime: number;
        };
    }, {
        templates: TemplateInfo[];
    }, import("xstate").EventObject>> | import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<{
        templates: TemplateInfo[];
        errors: string[];
    }, {
        templates: TemplateInfo[];
    }, import("xstate").EventObject>> | undefined;
}, import("xstate").Values<{
    discoverTemplates: {
        src: "discoverTemplates";
        logic: import("xstate").PromiseActorLogic<TemplateInfo[], {
            document: vscode.TextDocument;
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
    analyzeTemplates: {
        src: "analyzeTemplates";
        logic: import("xstate").PromiseActorLogic<{
            templates: TemplateInfo[];
            stats: {
                totalTemplates: number;
                htmlTemplates: number;
                cssTemplates: number;
                nestedTemplates: number;
                complexTemplates: number;
                processingTime: number;
            };
        }, {
            templates: TemplateInfo[];
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
    validateTemplates: {
        src: "validateTemplates";
        logic: import("xstate").PromiseActorLogic<{
            templates: TemplateInfo[];
            errors: string[];
        }, {
            templates: TemplateInfo[];
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
}>, import("xstate").Values<{
    addError: {
        type: "addError";
        params: import("xstate").NonReducibleUnknown;
    };
    resetState: {
        type: "resetState";
        params: import("xstate").NonReducibleUnknown;
    };
    setDocument: {
        type: "setDocument";
        params: import("xstate").NonReducibleUnknown;
    };
    updateTemplates: {
        type: "updateTemplates";
        params: import("xstate").NonReducibleUnknown;
    };
    setAnalysisResults: {
        type: "setAnalysisResults";
        params: import("xstate").NonReducibleUnknown;
    };
    setValidationResults: {
        type: "setValidationResults";
        params: import("xstate").NonReducibleUnknown;
    };
}>, never, never, "error" | "idle" | "completed" | "scanning" | "analyzing" | "validating", string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: "discovery";
    readonly initial: "idle";
    readonly context: {
        readonly document: null;
        readonly text: "";
        readonly position: 0;
        readonly templates: [];
        readonly errors: [];
        readonly currentTemplate: null;
        readonly stats: {
            readonly totalTemplates: 0;
            readonly htmlTemplates: 0;
            readonly cssTemplates: 0;
            readonly nestedTemplates: 0;
            readonly complexTemplates: 0;
            readonly processingTime: 0;
        };
    };
    readonly states: {
        readonly idle: {
            readonly on: {
                readonly DISCOVER: {
                    readonly target: "scanning";
                    readonly actions: "setDocument";
                };
            };
        };
        readonly scanning: {
            readonly invoke: {
                readonly id: "discoverTemplates";
                readonly src: "discoverTemplates";
                readonly input: ({ context }: {
                    context: DiscoveryContext;
                    event: {
                        type: "DISCOVER";
                        document: vscode.TextDocument;
                    } | {
                        type: "TEMPLATE_FOUND";
                        template: TemplateInfo;
                    } | {
                        type: "SCAN_COMPLETE";
                    } | {
                        type: "ANALYSIS_COMPLETE";
                    } | {
                        type: "VALIDATION_COMPLETE";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<DiscoveryContext, {
                        type: "DISCOVER";
                        document: vscode.TextDocument;
                    } | {
                        type: "TEMPLATE_FOUND";
                        template: TemplateInfo;
                    } | {
                        type: "SCAN_COMPLETE";
                    } | {
                        type: "ANALYSIS_COMPLETE";
                    } | {
                        type: "VALIDATION_COMPLETE";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "DISCOVER";
                        document: vscode.TextDocument;
                    } | {
                        type: "TEMPLATE_FOUND";
                        template: TemplateInfo;
                    } | {
                        type: "SCAN_COMPLETE";
                    } | {
                        type: "ANALYSIS_COMPLETE";
                    } | {
                        type: "VALIDATION_COMPLETE";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, import("xstate").AnyEventObject>;
                }) => {
                    document: vscode.TextDocument;
                };
                readonly onDone: {
                    readonly target: "analyzing";
                    readonly actions: import("xstate").ActionFunction<DiscoveryContext, import("xstate").DoneActorEvent<TemplateInfo[], string>, {
                        type: "DISCOVER";
                        document: vscode.TextDocument;
                    } | {
                        type: "TEMPLATE_FOUND";
                        template: TemplateInfo;
                    } | {
                        type: "SCAN_COMPLETE";
                    } | {
                        type: "ANALYSIS_COMPLETE";
                    } | {
                        type: "VALIDATION_COMPLETE";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, undefined, import("xstate").Values<{
                        discoverTemplates: {
                            src: "discoverTemplates";
                            logic: import("xstate").PromiseActorLogic<TemplateInfo[], {
                                document: vscode.TextDocument;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        analyzeTemplates: {
                            src: "analyzeTemplates";
                            logic: import("xstate").PromiseActorLogic<{
                                templates: TemplateInfo[];
                                stats: {
                                    totalTemplates: number;
                                    htmlTemplates: number;
                                    cssTemplates: number;
                                    nestedTemplates: number;
                                    complexTemplates: number;
                                    processingTime: number;
                                };
                            }, {
                                templates: TemplateInfo[];
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        validateTemplates: {
                            src: "validateTemplates";
                            logic: import("xstate").PromiseActorLogic<{
                                templates: TemplateInfo[];
                                errors: string[];
                            }, {
                                templates: TemplateInfo[];
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                    }>, never, never, never, never>;
                };
                readonly onError: {
                    readonly target: "error";
                    readonly actions: import("xstate").ActionFunction<DiscoveryContext, import("xstate").ErrorActorEvent<unknown, string>, {
                        type: "DISCOVER";
                        document: vscode.TextDocument;
                    } | {
                        type: "TEMPLATE_FOUND";
                        template: TemplateInfo;
                    } | {
                        type: "SCAN_COMPLETE";
                    } | {
                        type: "ANALYSIS_COMPLETE";
                    } | {
                        type: "VALIDATION_COMPLETE";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, undefined, import("xstate").Values<{
                        discoverTemplates: {
                            src: "discoverTemplates";
                            logic: import("xstate").PromiseActorLogic<TemplateInfo[], {
                                document: vscode.TextDocument;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        analyzeTemplates: {
                            src: "analyzeTemplates";
                            logic: import("xstate").PromiseActorLogic<{
                                templates: TemplateInfo[];
                                stats: {
                                    totalTemplates: number;
                                    htmlTemplates: number;
                                    cssTemplates: number;
                                    nestedTemplates: number;
                                    complexTemplates: number;
                                    processingTime: number;
                                };
                            }, {
                                templates: TemplateInfo[];
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        validateTemplates: {
                            src: "validateTemplates";
                            logic: import("xstate").PromiseActorLogic<{
                                templates: TemplateInfo[];
                                errors: string[];
                            }, {
                                templates: TemplateInfo[];
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                    }>, never, never, never, never>;
                };
            };
        };
        readonly analyzing: {
            readonly invoke: {
                readonly id: "analyzeTemplates";
                readonly src: "analyzeTemplates";
                readonly input: ({ context }: {
                    context: DiscoveryContext;
                    event: {
                        type: "DISCOVER";
                        document: vscode.TextDocument;
                    } | {
                        type: "TEMPLATE_FOUND";
                        template: TemplateInfo;
                    } | {
                        type: "SCAN_COMPLETE";
                    } | {
                        type: "ANALYSIS_COMPLETE";
                    } | {
                        type: "VALIDATION_COMPLETE";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<DiscoveryContext, {
                        type: "DISCOVER";
                        document: vscode.TextDocument;
                    } | {
                        type: "TEMPLATE_FOUND";
                        template: TemplateInfo;
                    } | {
                        type: "SCAN_COMPLETE";
                    } | {
                        type: "ANALYSIS_COMPLETE";
                    } | {
                        type: "VALIDATION_COMPLETE";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "DISCOVER";
                        document: vscode.TextDocument;
                    } | {
                        type: "TEMPLATE_FOUND";
                        template: TemplateInfo;
                    } | {
                        type: "SCAN_COMPLETE";
                    } | {
                        type: "ANALYSIS_COMPLETE";
                    } | {
                        type: "VALIDATION_COMPLETE";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, import("xstate").AnyEventObject>;
                }) => {
                    templates: TemplateInfo[];
                };
                readonly onDone: {
                    readonly target: "validating";
                    readonly actions: import("xstate").ActionFunction<DiscoveryContext, import("xstate").DoneActorEvent<{
                        templates: TemplateInfo[];
                        stats: {
                            totalTemplates: number;
                            htmlTemplates: number;
                            cssTemplates: number;
                            nestedTemplates: number;
                            complexTemplates: number;
                            processingTime: number;
                        };
                    }, string>, {
                        type: "DISCOVER";
                        document: vscode.TextDocument;
                    } | {
                        type: "TEMPLATE_FOUND";
                        template: TemplateInfo;
                    } | {
                        type: "SCAN_COMPLETE";
                    } | {
                        type: "ANALYSIS_COMPLETE";
                    } | {
                        type: "VALIDATION_COMPLETE";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, undefined, import("xstate").Values<{
                        discoverTemplates: {
                            src: "discoverTemplates";
                            logic: import("xstate").PromiseActorLogic<TemplateInfo[], {
                                document: vscode.TextDocument;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        analyzeTemplates: {
                            src: "analyzeTemplates";
                            logic: import("xstate").PromiseActorLogic<{
                                templates: TemplateInfo[];
                                stats: {
                                    totalTemplates: number;
                                    htmlTemplates: number;
                                    cssTemplates: number;
                                    nestedTemplates: number;
                                    complexTemplates: number;
                                    processingTime: number;
                                };
                            }, {
                                templates: TemplateInfo[];
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        validateTemplates: {
                            src: "validateTemplates";
                            logic: import("xstate").PromiseActorLogic<{
                                templates: TemplateInfo[];
                                errors: string[];
                            }, {
                                templates: TemplateInfo[];
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                    }>, never, never, never, never>;
                };
                readonly onError: {
                    readonly target: "error";
                    readonly actions: import("xstate").ActionFunction<DiscoveryContext, import("xstate").ErrorActorEvent<unknown, string>, {
                        type: "DISCOVER";
                        document: vscode.TextDocument;
                    } | {
                        type: "TEMPLATE_FOUND";
                        template: TemplateInfo;
                    } | {
                        type: "SCAN_COMPLETE";
                    } | {
                        type: "ANALYSIS_COMPLETE";
                    } | {
                        type: "VALIDATION_COMPLETE";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, undefined, import("xstate").Values<{
                        discoverTemplates: {
                            src: "discoverTemplates";
                            logic: import("xstate").PromiseActorLogic<TemplateInfo[], {
                                document: vscode.TextDocument;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        analyzeTemplates: {
                            src: "analyzeTemplates";
                            logic: import("xstate").PromiseActorLogic<{
                                templates: TemplateInfo[];
                                stats: {
                                    totalTemplates: number;
                                    htmlTemplates: number;
                                    cssTemplates: number;
                                    nestedTemplates: number;
                                    complexTemplates: number;
                                    processingTime: number;
                                };
                            }, {
                                templates: TemplateInfo[];
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        validateTemplates: {
                            src: "validateTemplates";
                            logic: import("xstate").PromiseActorLogic<{
                                templates: TemplateInfo[];
                                errors: string[];
                            }, {
                                templates: TemplateInfo[];
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                    }>, never, never, never, never>;
                };
            };
        };
        readonly validating: {
            readonly invoke: {
                readonly id: "validateTemplates";
                readonly src: "validateTemplates";
                readonly input: ({ context }: {
                    context: DiscoveryContext;
                    event: {
                        type: "DISCOVER";
                        document: vscode.TextDocument;
                    } | {
                        type: "TEMPLATE_FOUND";
                        template: TemplateInfo;
                    } | {
                        type: "SCAN_COMPLETE";
                    } | {
                        type: "ANALYSIS_COMPLETE";
                    } | {
                        type: "VALIDATION_COMPLETE";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<DiscoveryContext, {
                        type: "DISCOVER";
                        document: vscode.TextDocument;
                    } | {
                        type: "TEMPLATE_FOUND";
                        template: TemplateInfo;
                    } | {
                        type: "SCAN_COMPLETE";
                    } | {
                        type: "ANALYSIS_COMPLETE";
                    } | {
                        type: "VALIDATION_COMPLETE";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "DISCOVER";
                        document: vscode.TextDocument;
                    } | {
                        type: "TEMPLATE_FOUND";
                        template: TemplateInfo;
                    } | {
                        type: "SCAN_COMPLETE";
                    } | {
                        type: "ANALYSIS_COMPLETE";
                    } | {
                        type: "VALIDATION_COMPLETE";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, import("xstate").AnyEventObject>;
                }) => {
                    templates: TemplateInfo[];
                };
                readonly onDone: {
                    readonly target: "completed";
                    readonly actions: import("xstate").ActionFunction<DiscoveryContext, import("xstate").DoneActorEvent<{
                        templates: TemplateInfo[];
                        errors: string[];
                    }, string>, {
                        type: "DISCOVER";
                        document: vscode.TextDocument;
                    } | {
                        type: "TEMPLATE_FOUND";
                        template: TemplateInfo;
                    } | {
                        type: "SCAN_COMPLETE";
                    } | {
                        type: "ANALYSIS_COMPLETE";
                    } | {
                        type: "VALIDATION_COMPLETE";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, undefined, import("xstate").Values<{
                        discoverTemplates: {
                            src: "discoverTemplates";
                            logic: import("xstate").PromiseActorLogic<TemplateInfo[], {
                                document: vscode.TextDocument;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        analyzeTemplates: {
                            src: "analyzeTemplates";
                            logic: import("xstate").PromiseActorLogic<{
                                templates: TemplateInfo[];
                                stats: {
                                    totalTemplates: number;
                                    htmlTemplates: number;
                                    cssTemplates: number;
                                    nestedTemplates: number;
                                    complexTemplates: number;
                                    processingTime: number;
                                };
                            }, {
                                templates: TemplateInfo[];
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        validateTemplates: {
                            src: "validateTemplates";
                            logic: import("xstate").PromiseActorLogic<{
                                templates: TemplateInfo[];
                                errors: string[];
                            }, {
                                templates: TemplateInfo[];
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                    }>, never, never, never, never>;
                };
                readonly onError: {
                    readonly target: "error";
                    readonly actions: import("xstate").ActionFunction<DiscoveryContext, import("xstate").ErrorActorEvent<unknown, string>, {
                        type: "DISCOVER";
                        document: vscode.TextDocument;
                    } | {
                        type: "TEMPLATE_FOUND";
                        template: TemplateInfo;
                    } | {
                        type: "SCAN_COMPLETE";
                    } | {
                        type: "ANALYSIS_COMPLETE";
                    } | {
                        type: "VALIDATION_COMPLETE";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, undefined, import("xstate").Values<{
                        discoverTemplates: {
                            src: "discoverTemplates";
                            logic: import("xstate").PromiseActorLogic<TemplateInfo[], {
                                document: vscode.TextDocument;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        analyzeTemplates: {
                            src: "analyzeTemplates";
                            logic: import("xstate").PromiseActorLogic<{
                                templates: TemplateInfo[];
                                stats: {
                                    totalTemplates: number;
                                    htmlTemplates: number;
                                    cssTemplates: number;
                                    nestedTemplates: number;
                                    complexTemplates: number;
                                    processingTime: number;
                                };
                            }, {
                                templates: TemplateInfo[];
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        validateTemplates: {
                            src: "validateTemplates";
                            logic: import("xstate").PromiseActorLogic<{
                                templates: TemplateInfo[];
                                errors: string[];
                            }, {
                                templates: TemplateInfo[];
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                    }>, never, never, never, never>;
                };
            };
        };
        readonly completed: {
            readonly on: {
                readonly DISCOVER: {
                    readonly target: "scanning";
                    readonly actions: "setDocument";
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
                    readonly target: "scanning";
                };
                readonly RESET: {
                    readonly target: "idle";
                    readonly actions: "resetState";
                };
            };
        };
    };
}>;
//# sourceMappingURL=discoveryMachine.d.ts.map