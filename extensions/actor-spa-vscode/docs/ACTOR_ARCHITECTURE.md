# Actor-Based Architecture for VS Code Extension

## Vision & Problem Statement

**Problem**: Formatting template literals in modern TypeScript/JavaScript development is slow, brittle, and prone to race conditions. Existing solutions cause IDE lag, inconsistent results, and degraded developer experience, especially in large codebases with multiple embedded languages (HTML, CSS).

**Solution**: A race-condition-free, parallel-processing formatter using the actor model with XState state machines, delivering sub-150ms formatting latency while maintaining 99.9% reliability.

**Why Now**: Template literals are ubiquitous in modern frontend frameworks (React, Lit, etc.). Current formatters lack proper concurrency control, leading to file corruption and slow formatting in enterprise environments.

## Target Personas

### Primary: Solo OSS Maintainer
- **Needs**: Fast, reliable formatting; zero-config setup; free tier
- **Pain Points**: Slow formatting disrupts flow; configuration complexity
- **Success Metrics**: < 150ms format time, 0 setup steps, 5★ marketplace rating

### Secondary: Enterprise Team Lead  
- **Needs**: Team consistency; CI integration; usage analytics; compliance
- **Pain Points**: Developer productivity loss; inconsistent code style; no visibility
- **Success Metrics**: Team adoption > 80%, CI integration, measurable DX improvement

## Success Metrics

### Technical KPIs
- **Performance**: ≤ 150ms p95 format latency for files < 10KB
- **Reliability**: < 0.1% formatting failure rate across all supported configurations
- **Concurrency**: Handle 50+ simultaneous format requests without degradation

### Business KPIs
- **Adoption**: > 10K active installations within 6 months
- **Quality**: > 4.5★ VS Code Marketplace rating with > 100 reviews
- **Monetization**: 2% conversion to paid tier within 30 days
- **Growth**: 15% month-over-month user growth

## Out of Scope (v1.0)
- Language server protocol features (diagnostics, hover, etc.)
- Linting rules beyond formatting
- Custom syntax highlighting themes
- Integration with non-VS Code editors
- Real-time collaborative formatting

## Architecture Components

### 1. Coordinator Actor
**Purpose**: Orchestrates the entire formatting pipeline
**State Machine**: `coordinatorMachine`
**Responsibilities**:
- Receives formatting requests from VS Code
- Manages the overall formatting workflow
- Coordinates communication between other actors
- Handles errors and fallbacks
- Provides progress updates

**States**:
- `idle`: Waiting for formatting requests
- `coordinating`: Managing active formatting operations
- `parallelProcessing`: Processing multiple templates in parallel
- `aggregating`: Collecting results from formatters
- `completing`: Finalizing and returning results
- `error`: Handling errors and fallbacks

### 2. Discovery Actor
**Purpose**: Finds and analyzes template literals in documents
**State Machine**: `discoveryMachine`
**Responsibilities**:
- Parses document content to find html`` and css`` templates
- Analyzes template nesting and complexity
- Validates template syntax
- Extracts template expressions
- Provides template metadata

**States**:
- `idle`: Ready to process
- `scanning`: Scanning document for templates
- `analyzing`: Analyzing found templates
- `validating`: Validating template syntax
- `completed`: Results ready
- `error`: Error in discovery process

### 3. Formatter Actors
**Purpose**: Individual formatters for different tools
**State Machines**: `biomeFormatterMachine`, `prettierFormatterMachine`, `fallbackFormatterMachine`
**Responsibilities**:
- Format content using specific tools
- Handle tool-specific configurations
- Manage timeouts and errors
- Provide formatted results

**States**:
- `idle`: Ready to format
- `formatting`: Actively formatting content
- `completed`: Formatting successful
- `error`: Formatting failed
- `timeout`: Formatting timed out

### 4. Validation Actor
**Purpose**: Validates formatting results
**State Machine**: `validationMachine`
**Responsibilities**:
- Validates formatted content
- Checks for syntax errors
- Ensures content integrity
- Provides validation reports

**States**:
- `idle`: Ready to validate
- `validating`: Validating content
- `completed`: Validation successful
- `error`: Validation failed

## Actor Messaging Contract

### Event Schema
```typescript
interface ActorEvent {
  type: string;
  payload: unknown;
  metadata: {
    timestamp: number;
    source: string;
    correlationId: string;
  };
}

interface ErrorEnvelope {
  error: string;
  code: string;
  context: Record<string, unknown>;
  recoverable: boolean;
}
```

### Message Types
- **Discovery**: `DISCOVER`, `TEMPLATE_FOUND`, `SCAN_COMPLETE`
- **Formatting**: `FORMAT_REQUEST`, `FORMAT_COMPLETE`, `FORMAT_ERROR`
- **Coordination**: `JOB_START`, `JOB_COMPLETE`, `BATCH_COMPLETE`
- **System**: `CANCEL`, `TIMEOUT`, `RETRY`, `RESET`

### Cancellation & Debounce
- **CancellationToken**: All actors respect VS Code's cancellation tokens
- **Debounce Strategy**: 300ms debounce for format-on-type; immediate for save
- **Abort Policy**: In-flight jobs cancelled when new requests arrive
- **Memory Cleanup**: Cancelled jobs release resources within 100ms

## Data Flow

```
VS Code Request → Coordinator Actor
       ↓              ↓
  Cancellation   Discovery Actor (finds templates)
   Handling           ↓
       ↓         Parallel Formatter Actors (Biome, Prettier, Fallback)
   Debounce           ↓
   Logic         Validation Actor (validates results)
       ↓              ↓
    Progress     Coordinator Actor (aggregates and returns)
   Updates            ↓
       ↓         VS Code Response + Telemetry
```

## Non-Functional Requirements

### Performance Benchmarks
- **File Size Buckets**: 
  - < 1KB: ≤ 50ms p95 latency
  - 1-10KB: ≤ 150ms p95 latency  
  - 10-100KB: ≤ 500ms p95 latency
  - > 100KB: ≤ 2s p95 latency
- **Memory Limits**: 
  - Base usage: < 50MB RSS
  - Peak usage: < 200MB RSS during parallel processing
  - Memory leak tolerance: < 1MB growth per 1000 operations
- **Concurrency**: Up to 10 parallel jobs per CPU core

### Security & Privacy
- **Data Residency**: File buffers never leave user's machine
- **Telemetry**: Opt-in only; all code content redacted from analytics
- **Dependencies**: Regular security audits of Biome/Prettier binaries
- **Sandboxing**: Formatter processes run with minimal privileges

### Compatibility Matrix
- **Node.js**: v16+ (LTS versions)
- **VS Code**: v1.60+ (18-month rolling support)
- **Formatters**: 
  - Biome: v1.4+ (auto-update patch versions)
  - Prettier: v3.0+ (locked minor versions)
- **Operating Systems**: Windows 10+, macOS 12+, Ubuntu 20.04+

### Accessibility
- **WCAG 2.1 AA Compliance**: All progress indicators and notifications
- **High Contrast**: Status indicators visible in all VS Code themes
- **Screen Readers**: Meaningful alt-text for all visual feedback
- **Keyboard Navigation**: All features accessible without mouse

### Internationalization
- **Error Messages**: English (v1.0), with i18n framework for future localization
- **Number Formatting**: Locale-aware timing and file size displays
- **RTL Support**: UI elements respect text direction preferences

### Licensing & Compliance
- **Extension License**: MIT (open source core)
- **Business Features**: Proprietary license for Pro/Enterprise tiers
- **Third-Party**: Biome (MIT), Prettier (MIT), XState (MIT)
- **Export Control**: No encryption; safe for international distribution

## Benefits

1. **Race Condition Prevention**: Each actor manages its own state independently
2. **Parallel Processing**: Multiple templates can be formatted simultaneously
3. **Error Isolation**: Failures in one actor don't affect others
4. **Graceful Degradation**: If Biome fails, Prettier is used; if Prettier fails, fallback is used
5. **Performance**: Asynchronous processing with proper state management
6. **Debugging**: Clear state transitions and logging
7. **Extensibility**: New formatters can be added as new actors
8. **Enterprise Ready**: Telemetry, security, and compliance built-in

## Implementation Strategy

### Phase 1: Core Infrastructure
- Implement base actor types and communication
- Create coordinator and discovery actors
- Establish logging and error handling

### Phase 2: Formatter Actors
- Implement Biome formatter actor
- Implement Prettier formatter actor
- Implement fallback formatter actor

### Phase 3: Validation and Optimization
- Implement validation actor
- Add parallel processing capabilities
- Optimize performance and memory usage

### Phase 4: Advanced Features
- Add caching mechanisms
- Implement format-on-save optimization
- Add diagnostic reporting

## Error Handling Strategy

1. **Graceful Degradation**: Biome → Prettier → Fallback
2. **Timeout Management**: Each actor has configurable timeouts
3. **Error Isolation**: Errors in one template don't affect others
4. **User Feedback**: Clear error messages and progress indicators
5. **Recovery**: Automatic retry mechanisms where appropriate

## Performance Considerations

1. **Parallel Processing**: Multiple templates formatted simultaneously
2. **Lazy Loading**: Formatters loaded only when needed
3. **Caching**: Results cached to avoid redundant processing
4. **Memory Management**: Proper cleanup of temporary files and resources
5. **Batch Processing**: Multiple small templates processed together

## Monetization Strategy

### Tier Structure
| Tier | Price | Features |
|------|-------|----------|
| **Free OSS** | $0 | Core formatting, fallback chain, local caching, community support |
| **Pro** | $5/user/month | Team config sync, usage analytics dashboard, priority support, CLI for CI, advanced templates |
| **Enterprise** | $50/user/month | SAML SSO, air-gapped deployment, on-prem analytics, SLA, custom integrations |

### Feature Flags Framework
```typescript
interface FeatureGates {
  analytics: boolean;
  teamSync: boolean;
  prioritySupport: boolean;
  cliAccess: boolean;
  advancedTemplates: boolean;
  enterpriseSSO: boolean;
}
```

### Revenue Drivers
- **Conversion Funnels**: Format errors prevented → Pro trial → Paid conversion
- **Upsell Triggers**: Team usage analytics, CI integration needs, support escalation
- **Enterprise Value**: Compliance, security audits, dedicated support

## Telemetry & Analytics

### Usage Analytics (Opt-in)
```typescript
interface TelemetryEvent {
  event: 'format_request' | 'actor_error' | 'latency_bucket' | 'feature_used';
  properties: {
    latency_ms?: number;
    file_size_kb?: number;
    template_count?: number;
    formatter_used?: 'biome' | 'prettier' | 'fallback';
    error_code?: string;
    feature_name?: string;
  };
  user_id: string; // hashed
  session_id: string;
  timestamp: number;
}
```

### Key Metrics Tracked
- **Performance**: Format latency distribution, memory usage peaks
- **Reliability**: Error rates by formatter, recovery success rates  
- **Usage**: Features used, file types processed, team adoption
- **Growth**: DAU/MAU, retention cohorts, conversion funnel

### Privacy-First Implementation
- All code content redacted from telemetry
- User IDs hashed with random salt
- Respects VS Code telemetry opt-out setting
- GDPR-compliant data retention (90 days)

## Configuration

The architecture supports configuration through VS Code settings:
- `actor-spa.formatting.maxParallelJobs`: Maximum parallel formatting jobs
- `actor-spa.formatting.timeout`: Timeout for formatting operations
- `actor-spa.formatting.preferredFormatter`: Preferred formatter (biome, prettier, fallback)
- `actor-spa.formatting.enableParallelProcessing`: Enable/disable parallel processing
- `actor-spa.telemetry.enabled`: Enable usage analytics (default: false)
- `actor-spa.pro.teamConfigUrl`: Team configuration sync endpoint
- `actor-spa.enterprise.ssoProvider`: SAML SSO configuration

## Testing Strategy

### Core Test Categories
1. **Unit Tests**: Each actor tested in isolation with mocked dependencies
2. **Integration Tests**: Test actor communication and coordination end-to-end
3. **Performance Tests**: Measure formatting speed and memory usage against benchmarks
4. **Error Tests**: Test error handling and recovery mechanisms
5. **Load Tests**: Test with large documents and many templates

### Actor-Model Specific Testing
- **Stress Harness**: Spawn 500+ overlapping format requests to prove race-free behavior
- **State Machine Verification**: XState model checking for deadlocks and unreachable states
- **Message Ordering**: Verify events are processed in correct order under high load
- **Cancellation Testing**: Ensure proper cleanup when operations are cancelled

### CI/CD Pipeline
```yaml
# GitHub Actions Matrix
os: [ubuntu-latest, windows-latest, macos-latest]
node: [16, 18, 20]
vscode: [1.60.0, stable, insiders]
```

### Quality Gates
- **Performance Budget**: Fail CI if p95 latency exceeds thresholds
- **Memory Leak Detection**: Fail if memory growth > 1MB per 1000 operations
- **Bundle Size**: Fail if extension bundle > 2MB
- **Test Coverage**: Minimum 85% code coverage required

### Canary Release Channel
- Auto-publish `@next` version to 5% of users
- Collect crash telemetry for 48 hours before GA promotion
- Automatic rollback if error rate > 0.5%

## Risk Register & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|---------|------------|
| **Biome API Breaking Changes** | Medium | High | Pin versions, comprehensive e2e tests, fallback to Prettier |
| **VS Code API Deprecation** | Low | Medium | Participate in Insiders builds, maintain compatibility matrix |
| **Performance Regression** | Medium | High | Automated performance CI, streaming for large files |
| **Memory Leaks in Production** | Low | High | Extensive load testing, telemetry monitoring, auto-restart |
| **Competitor Feature Parity** | High | Medium | Open source moat, focus on enterprise differentiation |
| **Security Vulnerability** | Low | High | Regular dependency audits, sandboxed execution |

## Future Extensibility Roadmap

### Phase 2: Language-Agnostic Pipeline (Q2 2024)
- **Embedded SQL**: Format SQL in template literals  
- **GraphQL**: Support GraphQL template tags
- **MDX**: Format MDX content blocks
- **Custom Languages**: Plugin system for arbitrary embedded languages

### Phase 3: Advanced Features (Q3 2024)
- **Live Preview Actor**: Real-time rendered preview in webview panel
- **AI-Assisted Fixes**: LLM-powered error correction suggestions
- **Team Collaboration**: Shared formatting presets and review workflows
- **CLI Tool**: Standalone command-line interface for CI/CD integration

### Phase 4: Enterprise Scale (Q4 2024)
- **Workspace Formatting**: Batch format entire directories
- **Custom Rules Engine**: User-defined formatting rules
- **Integration Ecosystem**: Slack/Teams notifications, Jira integration
- **On-Premise Deployment**: Air-gapped enterprise installations

## Distribution & Support

### Marketplace Strategy
- **SEO Keywords**: "template literal", "html formatter", "css formatter", "biome", "prettier"
- **Visual Assets**: Animated GIFs showing before/after formatting
- **Changelog Automation**: GitHub releases → Marketplace updates
- **Category Positioning**: Featured in "Formatters" and "Popular" categories

### Support Channels
- **Community**: GitHub Issues with templates and auto-labeling
- **Pro Tier**: Email support with 24-hour SLA
- **Enterprise**: Dedicated Slack channel with 4-hour SLA

### In-Extension Support Tools
- **Issue Reporter**: Pre-fills system info, logs, and state snapshots
- **Diagnostic Panel**: Real-time actor state visualization
- **Performance Profiler**: Built-in timing and memory analysis

### Release Process
1. **Feature Development**: Feature branches with preview builds
2. **QA Testing**: Manual testing on Windows/Mac/Linux
3. **Canary Release**: 5% user rollout with telemetry monitoring
4. **GA Release**: Full rollout with marketplace announcement
5. **Post-Release**: Monitor error rates and user feedback 