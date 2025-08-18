# Actor-Based Formatter Implementation Plan

## Overview
This document outlines the implementation plan for creating a comprehensive actor-based formatting system for the Actor-SPA VS Code extension. The system will use XState v5's actor model to create isolated, parallel-processing formatters with proper error handling, telemetry, and caching.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     VS Code Extension Host                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Orchestrator Actor (Main)                    │  │
│  │                                                           │  │
│  │  - Coordinates all child actors                          │  │
│  │  - Manages lifecycle and communication                   │  │
│  │  - Aggregates results and errors                         │  │
│  └────────────┬─────────────────────────────────────────────┘  │
│               │                                                  │
│    ┌──────────┴──────────┬───────────┬────────────┬────────┐   │
│    │                     │           │            │        │   │
│  ┌─▼──────────┐  ┌──────▼────┐  ┌──▼──────┐  ┌─▼──────┐ │   │
│  │ Discovery  │  │ Formatter │  │Progress │  │Telemetry│ │   │
│  │   Actor    │  │   Pool    │  │ Actor   │  │  Actor  │ │   │
│  └────────────┘  └─────┬─────┘  └─────────┘  └─────────┘ │   │
│                        │                                    │   │
│         ┌──────────────┼──────────────┐                   │   │
│         │              │              │                    │   │
│    ┌────▼───┐    ┌────▼───┐    ┌────▼───┐               │   │
│    │ Biome  │    │Prettier│    │Fallback│               │   │
│    │ Actor  │    │ Actor  │    │ Actor  │               │   │
│    └────┬───┘    └────┬───┘    └────┬───┘               │   │
│         │              │              │                    │   │
│    ┌────▼──────────────▼──────────────▼───┐              │   │
│    │        Validation Actor              │              │   │
│    └──────────────────┬───────────────────┘              │   │
│                       │                                   │   │
│    ┌──────────────────▼───────────────────┐              │   │
│    │          Cache Actor                 │              │   │
│    └──────────────────────────────────────┘              │   │
│                                                           │   │
└───────────────────────────────────────────────────────────┘   │
```

## Implementation Phases

### Phase 1: Core Actor Infrastructure (Priority: High)
**Timeline: 2-3 days**

#### 1.1 Orchestrator Actor Enhancement
- Enhance the existing coordinator machine to become a full orchestrator
- Add support for spawning and managing child actors
- Implement proper actor lifecycle management
- Add inter-actor communication channels

#### 1.2 Base Actor Template
Create a reusable base actor template with:
- Standard error handling
- Telemetry integration
- Progress reporting hooks
- Configuration management
- Timeout handling

### Phase 2: Individual Formatter Actors (Priority: High)
**Timeline: 3-4 days**

#### 2.1 Biome Formatter Actor
```typescript
// Path: src/machines/formatters/biomeFormatterActor.ts
interface BiomeFormatterContext {
  template: TemplateInfo;
  options: FormatterOptions;
  result?: string;
  error?: Error;
  startTime: number;
  endTime?: number;
}
```
Features:
- CLI-based formatting with proper process management
- Error recovery and retry logic
- Performance monitoring
- Resource cleanup

#### 2.2 Prettier Formatter Actor
```typescript
// Path: src/machines/formatters/prettierFormatterActor.ts
interface PrettierFormatterContext {
  template: TemplateInfo;
  options: FormatterOptions;
  result?: string;
  error?: Error;
  parser?: 'html' | 'css';
}
```
Features:
- Bundled Prettier integration
- Parser selection based on template type
- Configuration mapping from VS Code settings
- Graceful degradation support

#### 2.3 Fallback Formatter Actor
```typescript
// Path: src/machines/formatters/fallbackFormatterActor.ts
interface FallbackFormatterContext {
  template: TemplateInfo;
  options: FormatterOptions;
  result?: string;
  indentLevel: number;
}
```
Features:
- Simple, reliable formatting
- Zero dependencies
- Fast execution
- Minimal resource usage

### Phase 3: Validation Actor (Priority: High)
**Timeline: 2 days**

```typescript
// Path: src/machines/validationActor.ts
interface ValidationContext {
  formattedContent: string;
  originalContent: string;
  language: 'html' | 'css';
  validationRules: ValidationRule[];
  issues: ValidationIssue[];
}
```
Features:
- Syntax validation
- XSS security checks
- Template expression validation
- Formatting quality checks
- Performance impact assessment

### Phase 4: Support Actors (Priority: Medium)
**Timeline: 3-4 days**

#### 4.1 Progress Reporting Actor
```typescript
// Path: src/machines/progressActor.ts
interface ProgressContext {
  totalTemplates: number;
  processedTemplates: number;
  currentPhase: 'discovery' | 'formatting' | 'validation' | 'complete';
  estimatedTimeRemaining?: number;
}
```
Features:
- Real-time progress updates
- ETA calculation
- VS Code progress notification integration
- Cancellation support

#### 4.2 Telemetry Actor
```typescript
// Path: src/machines/telemetryActor.ts
interface TelemetryContext {
  sessionId: string;
  events: TelemetryEvent[];
  metrics: PerformanceMetrics;
  anonymized: boolean;
}
```
Features:
- Usage pattern tracking
- Performance metrics collection
- Error tracking
- Anonymous data collection
- Opt-out support

### Phase 5: Caching Actor (Priority: Low)
**Timeline: 2 days**

```typescript
// Path: src/machines/cacheActor.ts
interface CacheContext {
  entries: Map<string, CacheEntry>;
  maxSize: number;
  ttl: number;
  hitRate: number;
}
```
Features:
- Content-based caching
- LRU eviction policy
- TTL support
- Memory usage monitoring
- Cache invalidation on settings change

## Implementation Details

### 1. Actor Communication Protocol

All actors will communicate using a standardized message format:

```typescript
interface ActorMessage<T = unknown> {
  id: string;
  type: string;
  source: string;
  target?: string;
  payload: T;
  timestamp: number;
  correlationId?: string;
}
```

### 2. Error Handling Strategy

Each actor will implement a three-tier error handling approach:
1. **Local Recovery**: Try to handle errors within the actor
2. **Escalation**: Report unrecoverable errors to parent
3. **Graceful Degradation**: Continue with reduced functionality

### 3. Configuration Management

Centralized configuration will be managed through:
```typescript
interface ActorConfiguration {
  formatter: {
    biome: BiomeConfig;
    prettier: PrettierConfig;
    fallback: FallbackConfig;
  };
  performance: {
    maxParallelJobs: number;
    timeout: number;
    cacheSize: number;
  };
  telemetry: {
    enabled: boolean;
    anonymize: boolean;
    endpoint?: string;
  };
}
```

### 4. Testing Strategy

Each actor will have:
- Unit tests for state transitions
- Integration tests for actor communication
- Performance benchmarks
- Error scenario tests

## Migration Plan

1. **Phase 1**: Implement new actors alongside existing code
2. **Phase 2**: Add feature flag for gradual rollout
3. **Phase 3**: Monitor telemetry and fix issues
4. **Phase 4**: Deprecate old implementation
5. **Phase 5**: Remove legacy code

## Success Metrics

- **Performance**: 30% faster formatting for large files
- **Reliability**: 99.9% success rate for formatting operations
- **User Satisfaction**: Reduced error reports by 50%
- **Resource Usage**: 25% less memory consumption
- **Parallelism**: Support for 4+ concurrent formatting jobs

## Risk Mitigation

1. **Complexity**: Use XState visualizer for debugging
2. **Performance**: Implement aggressive caching
3. **Compatibility**: Maintain fallback to legacy formatter
4. **Testing**: Comprehensive test suite with real-world scenarios

## Next Steps

1. Review and approve implementation plan
2. Set up project structure and base templates
3. Implement Phase 1 (Core Infrastructure)
4. Create proof-of-concept with Biome formatter actor
5. Gather feedback and iterate

## Resources

- [XState v5 Documentation](https://xstate.js.org/docs/)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Actor Model Pattern](https://en.wikipedia.org/wiki/Actor_model)
- [Biome Formatter CLI](https://biomejs.dev/formatter/)
- [Prettier API](https://prettier.io/docs/en/api.html)