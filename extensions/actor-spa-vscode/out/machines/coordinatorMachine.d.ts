import * as vscode from 'vscode';
import { type TemplateInfo } from './discoveryMachine';
export interface FormattingJob {
    id: string;
    template: TemplateInfo;
    status: 'pending' | 'formatting' | 'completed' | 'error';
    result?: string;
    error?: string;
    startTime: number;
    endTime?: number;
}
export interface CoordinatorContext {
    document: vscode.TextDocument | null;
    options: vscode.FormattingOptions;
    templates: TemplateInfo[];
    jobs: FormattingJob[];
    completedJobs: FormattingJob[];
    errors: string[];
    edits: vscode.TextEdit[];
    stats: {
        totalTemplates: number;
        successfulJobs: number;
        failedJobs: number;
        processingTimeMs: number;
        startTime: number;
        endTime?: number;
    };
    config: {
        maxParallelJobs: number;
        timeout: number;
        preferredFormatter: 'biome' | 'prettier' | 'fallback';
        enableParallelProcessing: boolean;
    };
}
export type CoordinatorEvent = {
    type: 'FORMAT';
    document: vscode.TextDocument;
    options: vscode.FormattingOptions;
    token?: vscode.CancellationToken;
} | {
    type: 'DISCOVERY_COMPLETE';
    templates: TemplateInfo[];
} | {
    type: 'JOB_COMPLETE';
    jobId: string;
    result: string;
} | {
    type: 'JOB_ERROR';
    jobId: string;
    error: string;
} | {
    type: 'ALL_JOBS_COMPLETE';
} | {
    type: 'TIMEOUT';
} | {
    type: 'CANCEL';
} | {
    type: 'ERROR';
    error: string;
} | {
    type: 'RETRY';
} | {
    type: 'RESET';
};
export declare const coordinatorMachine: import("xstate").StateMachine<CoordinatorContext, {
    type: "FORMAT";
    document: vscode.TextDocument;
    options: vscode.FormattingOptions;
    token?: vscode.CancellationToken;
} | {
    type: "DISCOVERY_COMPLETE";
    templates: TemplateInfo[];
} | {
    type: "JOB_COMPLETE";
    jobId: string;
    result: string;
} | {
    type: "JOB_ERROR";
    jobId: string;
    error: string;
} | {
    type: "ALL_JOBS_COMPLETE";
} | {
    type: "TIMEOUT";
} | {
    type: "CANCEL";
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
    }, import("xstate").EventObject>> | import("xstate").ActorRefFromLogic<import("xstate").PromiseActorLogic<FormattingJob[], {
        templates: TemplateInfo[];
        options: vscode.FormattingOptions;
        config: CoordinatorContext["config"];
    }, import("xstate").EventObject>> | undefined;
}, import("xstate").Values<{
    runDiscovery: {
        src: "runDiscovery";
        logic: import("xstate").PromiseActorLogic<TemplateInfo[], {
            document: vscode.TextDocument;
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
    parallelFormatting: {
        src: "parallelFormatting";
        logic: import("xstate").PromiseActorLogic<FormattingJob[], {
            templates: TemplateInfo[];
            options: vscode.FormattingOptions;
            config: CoordinatorContext["config"];
        }, import("xstate").EventObject>;
        id: string | undefined;
    };
}>, import("xstate").Values<{
    initializeFormatting: {
        type: "initializeFormatting";
        params: import("xstate").NonReducibleUnknown;
    };
    setDiscoveryResults: {
        type: "setDiscoveryResults";
        params: import("xstate").NonReducibleUnknown;
    };
    setFormattingResults: {
        type: "setFormattingResults";
        params: import("xstate").NonReducibleUnknown;
    };
    addError: {
        type: "addError";
        params: import("xstate").NonReducibleUnknown;
    };
    resetState: {
        type: "resetState";
        params: import("xstate").NonReducibleUnknown;
    };
}>, never, never, "error" | "idle" | "discovering" | "coordinating" | "completing" | "parallelProcessing" | "aggregating", string, import("xstate").NonReducibleUnknown, import("xstate").NonReducibleUnknown, import("xstate").EventObject, import("xstate").MetaObject, {
    readonly id: "coordinator";
    readonly initial: "idle";
    readonly context: {
        readonly document: null;
        readonly options: {
            readonly tabSize: 2;
            readonly insertSpaces: true;
        };
        readonly templates: [];
        readonly jobs: [];
        readonly completedJobs: [];
        readonly errors: [];
        readonly edits: [];
        readonly stats: {
            readonly totalTemplates: 0;
            readonly successfulJobs: 0;
            readonly failedJobs: 0;
            readonly processingTimeMs: 0;
            readonly startTime: number;
        };
        readonly config: {
            readonly maxParallelJobs: 4;
            readonly timeout: 10000;
            readonly preferredFormatter: "biome";
            readonly enableParallelProcessing: true;
        };
    };
    readonly states: {
        readonly idle: {
            readonly on: {
                readonly FORMAT: {
                    readonly target: "discovering";
                    readonly actions: "initializeFormatting";
                };
            };
        };
        readonly discovering: {
            readonly invoke: {
                readonly id: "runDiscovery";
                readonly src: "runDiscovery";
                readonly input: ({ context }: {
                    context: CoordinatorContext;
                    event: {
                        type: "FORMAT";
                        document: vscode.TextDocument;
                        options: vscode.FormattingOptions;
                        token?: vscode.CancellationToken;
                    } | {
                        type: "DISCOVERY_COMPLETE";
                        templates: TemplateInfo[];
                    } | {
                        type: "JOB_COMPLETE";
                        jobId: string;
                        result: string;
                    } | {
                        type: "JOB_ERROR";
                        jobId: string;
                        error: string;
                    } | {
                        type: "ALL_JOBS_COMPLETE";
                    } | {
                        type: "TIMEOUT";
                    } | {
                        type: "CANCEL";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<CoordinatorContext, {
                        type: "FORMAT";
                        document: vscode.TextDocument;
                        options: vscode.FormattingOptions;
                        token?: vscode.CancellationToken;
                    } | {
                        type: "DISCOVERY_COMPLETE";
                        templates: TemplateInfo[];
                    } | {
                        type: "JOB_COMPLETE";
                        jobId: string;
                        result: string;
                    } | {
                        type: "JOB_ERROR";
                        jobId: string;
                        error: string;
                    } | {
                        type: "ALL_JOBS_COMPLETE";
                    } | {
                        type: "TIMEOUT";
                    } | {
                        type: "CANCEL";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "FORMAT";
                        document: vscode.TextDocument;
                        options: vscode.FormattingOptions;
                        token?: vscode.CancellationToken;
                    } | {
                        type: "DISCOVERY_COMPLETE";
                        templates: TemplateInfo[];
                    } | {
                        type: "JOB_COMPLETE";
                        jobId: string;
                        result: string;
                    } | {
                        type: "JOB_ERROR";
                        jobId: string;
                        error: string;
                    } | {
                        type: "ALL_JOBS_COMPLETE";
                    } | {
                        type: "TIMEOUT";
                    } | {
                        type: "CANCEL";
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
                    readonly target: "coordinating";
                    readonly actions: import("xstate").ActionFunction<CoordinatorContext, import("xstate").DoneActorEvent<TemplateInfo[], string>, {
                        type: "FORMAT";
                        document: vscode.TextDocument;
                        options: vscode.FormattingOptions;
                        token?: vscode.CancellationToken;
                    } | {
                        type: "DISCOVERY_COMPLETE";
                        templates: TemplateInfo[];
                    } | {
                        type: "JOB_COMPLETE";
                        jobId: string;
                        result: string;
                    } | {
                        type: "JOB_ERROR";
                        jobId: string;
                        error: string;
                    } | {
                        type: "ALL_JOBS_COMPLETE";
                    } | {
                        type: "TIMEOUT";
                    } | {
                        type: "CANCEL";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, undefined, import("xstate").Values<{
                        runDiscovery: {
                            src: "runDiscovery";
                            logic: import("xstate").PromiseActorLogic<TemplateInfo[], {
                                document: vscode.TextDocument;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        parallelFormatting: {
                            src: "parallelFormatting";
                            logic: import("xstate").PromiseActorLogic<FormattingJob[], {
                                templates: TemplateInfo[];
                                options: vscode.FormattingOptions;
                                config: CoordinatorContext["config"];
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                    }>, never, never, never, never>;
                };
                readonly onError: {
                    readonly target: "error";
                    readonly actions: import("xstate").ActionFunction<CoordinatorContext, import("xstate").ErrorActorEvent<unknown, string>, {
                        type: "FORMAT";
                        document: vscode.TextDocument;
                        options: vscode.FormattingOptions;
                        token?: vscode.CancellationToken;
                    } | {
                        type: "DISCOVERY_COMPLETE";
                        templates: TemplateInfo[];
                    } | {
                        type: "JOB_COMPLETE";
                        jobId: string;
                        result: string;
                    } | {
                        type: "JOB_ERROR";
                        jobId: string;
                        error: string;
                    } | {
                        type: "ALL_JOBS_COMPLETE";
                    } | {
                        type: "TIMEOUT";
                    } | {
                        type: "CANCEL";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, undefined, import("xstate").Values<{
                        runDiscovery: {
                            src: "runDiscovery";
                            logic: import("xstate").PromiseActorLogic<TemplateInfo[], {
                                document: vscode.TextDocument;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        parallelFormatting: {
                            src: "parallelFormatting";
                            logic: import("xstate").PromiseActorLogic<FormattingJob[], {
                                templates: TemplateInfo[];
                                options: vscode.FormattingOptions;
                                config: CoordinatorContext["config"];
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                    }>, never, never, never, never>;
                };
            };
        };
        readonly coordinating: {
            readonly always: readonly [{
                readonly target: "completing";
                readonly guard: ({ context }: import("xstate/dist/declarations/src/guards").GuardArgs<CoordinatorContext, {
                    type: "FORMAT";
                    document: vscode.TextDocument;
                    options: vscode.FormattingOptions;
                    token?: vscode.CancellationToken;
                } | {
                    type: "DISCOVERY_COMPLETE";
                    templates: TemplateInfo[];
                } | {
                    type: "JOB_COMPLETE";
                    jobId: string;
                    result: string;
                } | {
                    type: "JOB_ERROR";
                    jobId: string;
                    error: string;
                } | {
                    type: "ALL_JOBS_COMPLETE";
                } | {
                    type: "TIMEOUT";
                } | {
                    type: "CANCEL";
                } | {
                    type: "ERROR";
                    error: string;
                } | {
                    type: "RETRY";
                } | {
                    type: "RESET";
                }>) => boolean;
            }, {
                readonly target: "parallelProcessing";
            }];
        };
        readonly parallelProcessing: {
            readonly invoke: {
                readonly id: "parallelFormatting";
                readonly src: "parallelFormatting";
                readonly input: ({ context }: {
                    context: CoordinatorContext;
                    event: {
                        type: "FORMAT";
                        document: vscode.TextDocument;
                        options: vscode.FormattingOptions;
                        token?: vscode.CancellationToken;
                    } | {
                        type: "DISCOVERY_COMPLETE";
                        templates: TemplateInfo[];
                    } | {
                        type: "JOB_COMPLETE";
                        jobId: string;
                        result: string;
                    } | {
                        type: "JOB_ERROR";
                        jobId: string;
                        error: string;
                    } | {
                        type: "ALL_JOBS_COMPLETE";
                    } | {
                        type: "TIMEOUT";
                    } | {
                        type: "CANCEL";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    };
                    self: import("xstate").ActorRef<import("xstate").MachineSnapshot<CoordinatorContext, {
                        type: "FORMAT";
                        document: vscode.TextDocument;
                        options: vscode.FormattingOptions;
                        token?: vscode.CancellationToken;
                    } | {
                        type: "DISCOVERY_COMPLETE";
                        templates: TemplateInfo[];
                    } | {
                        type: "JOB_COMPLETE";
                        jobId: string;
                        result: string;
                    } | {
                        type: "JOB_ERROR";
                        jobId: string;
                        error: string;
                    } | {
                        type: "ALL_JOBS_COMPLETE";
                    } | {
                        type: "TIMEOUT";
                    } | {
                        type: "CANCEL";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, Record<string, import("xstate").AnyActorRef>, import("xstate").StateValue, string, unknown, any, any>, {
                        type: "FORMAT";
                        document: vscode.TextDocument;
                        options: vscode.FormattingOptions;
                        token?: vscode.CancellationToken;
                    } | {
                        type: "DISCOVERY_COMPLETE";
                        templates: TemplateInfo[];
                    } | {
                        type: "JOB_COMPLETE";
                        jobId: string;
                        result: string;
                    } | {
                        type: "JOB_ERROR";
                        jobId: string;
                        error: string;
                    } | {
                        type: "ALL_JOBS_COMPLETE";
                    } | {
                        type: "TIMEOUT";
                    } | {
                        type: "CANCEL";
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
                    options: vscode.FormattingOptions;
                    config: {
                        maxParallelJobs: number;
                        timeout: number;
                        preferredFormatter: "biome" | "prettier" | "fallback";
                        enableParallelProcessing: boolean;
                    };
                };
                readonly onDone: {
                    readonly target: "aggregating";
                    readonly actions: import("xstate").ActionFunction<CoordinatorContext, import("xstate").DoneActorEvent<FormattingJob[], string>, {
                        type: "FORMAT";
                        document: vscode.TextDocument;
                        options: vscode.FormattingOptions;
                        token?: vscode.CancellationToken;
                    } | {
                        type: "DISCOVERY_COMPLETE";
                        templates: TemplateInfo[];
                    } | {
                        type: "JOB_COMPLETE";
                        jobId: string;
                        result: string;
                    } | {
                        type: "JOB_ERROR";
                        jobId: string;
                        error: string;
                    } | {
                        type: "ALL_JOBS_COMPLETE";
                    } | {
                        type: "TIMEOUT";
                    } | {
                        type: "CANCEL";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, undefined, import("xstate").Values<{
                        runDiscovery: {
                            src: "runDiscovery";
                            logic: import("xstate").PromiseActorLogic<TemplateInfo[], {
                                document: vscode.TextDocument;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        parallelFormatting: {
                            src: "parallelFormatting";
                            logic: import("xstate").PromiseActorLogic<FormattingJob[], {
                                templates: TemplateInfo[];
                                options: vscode.FormattingOptions;
                                config: CoordinatorContext["config"];
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                    }>, never, never, never, never>;
                };
                readonly onError: {
                    readonly target: "error";
                    readonly actions: import("xstate").ActionFunction<CoordinatorContext, import("xstate").ErrorActorEvent<unknown, string>, {
                        type: "FORMAT";
                        document: vscode.TextDocument;
                        options: vscode.FormattingOptions;
                        token?: vscode.CancellationToken;
                    } | {
                        type: "DISCOVERY_COMPLETE";
                        templates: TemplateInfo[];
                    } | {
                        type: "JOB_COMPLETE";
                        jobId: string;
                        result: string;
                    } | {
                        type: "JOB_ERROR";
                        jobId: string;
                        error: string;
                    } | {
                        type: "ALL_JOBS_COMPLETE";
                    } | {
                        type: "TIMEOUT";
                    } | {
                        type: "CANCEL";
                    } | {
                        type: "ERROR";
                        error: string;
                    } | {
                        type: "RETRY";
                    } | {
                        type: "RESET";
                    }, undefined, import("xstate").Values<{
                        runDiscovery: {
                            src: "runDiscovery";
                            logic: import("xstate").PromiseActorLogic<TemplateInfo[], {
                                document: vscode.TextDocument;
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                        parallelFormatting: {
                            src: "parallelFormatting";
                            logic: import("xstate").PromiseActorLogic<FormattingJob[], {
                                templates: TemplateInfo[];
                                options: vscode.FormattingOptions;
                                config: CoordinatorContext["config"];
                            }, import("xstate").EventObject>;
                            id: string | undefined;
                        };
                    }>, never, never, never, never>;
                };
            };
        };
        readonly aggregating: {
            readonly entry: import("xstate").ActionFunction<CoordinatorContext, {
                type: "FORMAT";
                document: vscode.TextDocument;
                options: vscode.FormattingOptions;
                token?: vscode.CancellationToken;
            } | {
                type: "DISCOVERY_COMPLETE";
                templates: TemplateInfo[];
            } | {
                type: "JOB_COMPLETE";
                jobId: string;
                result: string;
            } | {
                type: "JOB_ERROR";
                jobId: string;
                error: string;
            } | {
                type: "ALL_JOBS_COMPLETE";
            } | {
                type: "TIMEOUT";
            } | {
                type: "CANCEL";
            } | {
                type: "ERROR";
                error: string;
            } | {
                type: "RETRY";
            } | {
                type: "RESET";
            }, {
                type: "FORMAT";
                document: vscode.TextDocument;
                options: vscode.FormattingOptions;
                token?: vscode.CancellationToken;
            } | {
                type: "DISCOVERY_COMPLETE";
                templates: TemplateInfo[];
            } | {
                type: "JOB_COMPLETE";
                jobId: string;
                result: string;
            } | {
                type: "JOB_ERROR";
                jobId: string;
                error: string;
            } | {
                type: "ALL_JOBS_COMPLETE";
            } | {
                type: "TIMEOUT";
            } | {
                type: "CANCEL";
            } | {
                type: "ERROR";
                error: string;
            } | {
                type: "RETRY";
            } | {
                type: "RESET";
            }, undefined, import("xstate").Values<{
                runDiscovery: {
                    src: "runDiscovery";
                    logic: import("xstate").PromiseActorLogic<TemplateInfo[], {
                        document: vscode.TextDocument;
                    }, import("xstate").EventObject>;
                    id: string | undefined;
                };
                parallelFormatting: {
                    src: "parallelFormatting";
                    logic: import("xstate").PromiseActorLogic<FormattingJob[], {
                        templates: TemplateInfo[];
                        options: vscode.FormattingOptions;
                        config: CoordinatorContext["config"];
                    }, import("xstate").EventObject>;
                    id: string | undefined;
                };
            }>, never, never, never, never>;
            readonly always: {
                readonly target: "completing";
            };
        };
        readonly completing: {
            readonly type: "final";
        };
        readonly error: {
            readonly on: {
                readonly RETRY: {
                    readonly target: "discovering";
                };
                readonly RESET: {
                    readonly target: "idle";
                    readonly actions: "resetState";
                };
            };
        };
    };
}>;
//# sourceMappingURL=coordinatorMachine.d.ts.map