# 🎯 Actor-SPA Pure Actor Model Implementation Guide

> **Test-Driven Development with Three-Agent Team**

## 📋 Table of Contents
1. [Git Setup & Branching](#git-setup--branching)
2. [Team Structure & Roles](#team-structure--roles)
3. [Agent Responsibilities](#agent-responsibilities)
4. [Code Standards & Patterns](#code-standards--patterns)
5. [TDD Workflow](#tdd-workflow)
6. [Implementation Timeline](#implementation-timeline)
7. [Communication Protocol](#communication-protocol)
8. [Quality Assurance](#quality-assurance)

---

## 🌿 Git Setup & Branching

### Initial Setup (Day 0 - Before Implementation)

Each agent MUST create their working branches before starting any implementation:

#### Step 1: Create Integration Branch (Agent A)
```bash
# Agent A creates the main integration branch
git checkout main
git pull origin main
git checkout -b feature/actor-ref-phase-1
git push -u origin feature/actor-ref-phase-1
```

#### Step 2: Create Agent Working Branches
```bash
# Agent A - Architecture Branch
git checkout feature/actor-ref-phase-1
git checkout -b feature/actor-ref-architecture
git push -u origin feature/actor-ref-architecture

# Agent B - Implementation Branch
git checkout feature/actor-ref-phase-1
git checkout -b feature/actor-ref-implementation
git push -u origin feature/actor-ref-implementation

# Agent C - Testing Branch
git checkout feature/actor-ref-phase-1
git checkout -b feature/actor-ref-tests
git push -u origin feature/actor-ref-tests
```

#### Step 3: Create Sub-branches for Specific Features
```bash
# Example: Agent A working on ActorRef interface
git checkout feature/actor-ref-architecture
git checkout -b feature/actor-ref-architecture/interface-design

# Example: Agent B working on mailbox
git checkout feature/actor-ref-implementation
git checkout -b feature/actor-ref-implementation/mailbox

# Example: Agent C working on test utilities
git checkout feature/actor-ref-tests
git checkout -b feature/actor-ref-tests/utilities
```

### Branch Protection Rules
- `feature/actor-ref-phase-1` requires:
  - PR reviews from at least one other agent
  - All tests passing
  - No merge conflicts
  
### Daily Sync Process
```bash
# Each agent syncs daily
git checkout feature/actor-ref-phase-1
git pull origin feature/actor-ref-phase-1
git checkout feature/actor-ref-[your-branch]
git merge feature/actor-ref-phase-1
```

---

## 👥 Team Structure & Roles

### Agent A: Tech Lead (Claude)
- **Primary Focus**: Architecture, API design, complex algorithms
- **Experience Level**: Expert
- **Tools**: Claude Code, comprehensive codebase access

### Agent B: Senior Developer (Cursor)
- **Primary Focus**: Core implementations, integrations, performance
- **Experience Level**: Senior
- **Tools**: Cursor IDE, full development environment

### Agent C: Junior Developer (Local LLM)
- **Primary Focus**: Tests, documentation, utilities, simple features
- **Experience Level**: Junior
- **Tools**: Basic IDE, focused on specific files

---

## 🎯 Agent Responsibilities

### Agent A (Tech Lead) - Complex Systems & Architecture

#### Scope of Work
```typescript
// Primary Responsibilities
- ActorRef core interface design
- Request/response pattern with correlation IDs
- Supervision strategies and fault tolerance
- Complex state machine integrations
- Architecture decision records (ADRs)
- Code review for all PRs
```

#### Deliverables
- [ ] `src/framework/core/actors/actor-ref.ts`
- [ ] `src/framework/core/actors/supervisor.ts`
- [ ] `src/framework/core/messaging/request-response.ts`
- [ ] `docs/architecture/actor-ref-design.md`
- [ ] `docs/architecture/supervision-patterns.md`

#### Key Patterns
```typescript
// Example: ActorRef Interface
export interface ActorRef<TEvent extends EventObject, TEmitted = any> {
  readonly id: string;
  send(event: TEvent): void;
  ask<TQuery, TResponse>(query: TQuery): Promise<TResponse>;
  observe<TSelected>(selector: (snapshot: any) => TSelected): Observable<TSelected>;
  spawn<TChildEvent extends EventObject>(
    behavior: ActorBehavior<TChildEvent>,
    options?: SpawnOptions
  ): ActorRef<TChildEvent>;
  stop(): Promise<void>;
}
```

### Agent B (Senior Developer) - Core Implementations

#### Scope of Work
```typescript
// Primary Responsibilities
- Mailbox implementation with backpressure
- Observable pattern (RxJS-compatible)
- Event bus enhancements for actors
- XState v5 adapter implementation
- Performance optimizations
- Integration with existing framework
```

#### Deliverables
- [ ] `src/framework/core/actors/mailbox.ts`
- [ ] `src/framework/core/observables/observable.ts`
- [ ] `src/framework/core/observables/operators.ts`
- [ ] `src/framework/core/messaging/actor-event-bus.ts`
- [ ] `src/framework/core/integration/xstate-adapter.ts`
- [ ] `src/framework/core/integration/component-bridge.ts`

#### Key Patterns
```typescript
// Example: Mailbox with Bounded Queue
export class BoundedMailbox<T> implements Mailbox<T> {
  private queue: T[] = [];
  private maxSize: number;
  
  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }
  
  enqueue(message: T): boolean {
    if (this.queue.length >= this.maxSize) {
      return false; // Apply backpressure
    }
    this.queue.push(message);
    return true;
  }
}
```

### Agent C (Junior Developer) - Testing & Documentation

#### Scope of Work
```typescript
// Primary Responsibilities
- Write ALL test files following TDD
- Create test utilities and fixtures
- Simple type definitions and interfaces
- Documentation and examples
- Test data generators
- Performance benchmark harnesses
```

#### Deliverables
- [ ] All `*.test.ts` files for Agent A & B's code
- [ ] `src/framework/testing/actor-test-utils.ts`
- [ ] `src/framework/testing/fixtures/`
- [ ] `src/framework/core/actors/types.ts`
- [ ] `src/framework/core/messaging/message-types.ts`
- [ ] `docs/examples/` (usage examples)
- [ ] `benchmarks/` (performance tests)

#### Key Patterns
```typescript
// Example: Test Fixture
export function createMockActorRef<T extends EventObject>(
  id = 'test-actor'
): MockActorRef<T> {
  const sentEvents: T[] = [];
  const observers: Set<Observer<any>> = new Set();
  
  return {
    id,
    send: vi.fn((event: T) => sentEvents.push(event)),
    ask: vi.fn(),
    observe: vi.fn(),
    spawn: vi.fn(),
    stop: vi.fn(),
    // Test helpers
    getSentEvents: () => [...sentEvents],
    getObserverCount: () => observers.size,
  };
}
```

---

## 📐 Code Standards & Patterns

### Unified Code Style

All agents MUST follow these standards:

```typescript
// File Header Template (REQUIRED for all files)
/**
 * @module framework/core/[module-name]
 * @description [Brief description]
 * @author Agent [A/B/C] - [Date]
 */

// Import Order (enforced by Biome)
1. Node built-ins
2. External dependencies  
3. Framework imports (@framework/*)
4. Relative imports (./)
5. Type imports (type keyword)

// Naming Conventions
- Files: kebab-case.ts
- Classes: PascalCase
- Interfaces: PascalCase with "I" prefix for contracts
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- Test files: [name].test.ts (same directory)
```

### Test Standards

```typescript
// Test File Structure (REQUIRED)
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestEnvironment } from '@framework/testing';

describe('[Module Name]', () => {
  // Setup
  let testEnv: TestEnvironment;
  
  beforeEach(() => {
    testEnv = createTestEnvironment();
  });
  
  afterEach(() => {
    testEnv.cleanup();
  });
  
  describe('[Feature/Method Name]', () => {
    it('should [behavior description]', () => {
      // Arrange
      const input = createTestData();
      
      // Act
      const result = performAction(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Design Patterns to Use

1. **Actor Pattern** (Required)
   ```typescript
   // All stateful components must be actors
   const actorRef = spawn(behavior, { id: 'my-actor' });
   ```

2. **Message-First** (Required)
   ```typescript
   // No direct method calls between actors
   actorRef.send({ type: 'UPDATE', data });
   ```

3. **Supervision Tree** (Required for fault tolerance)
   ```typescript
   const supervisor = spawn(supervisorBehavior);
   const child = supervisor.spawn(childBehavior, {
     supervision: 'restart-on-failure'
   });
   ```

4. **Observable State** (Required for UI binding)
   ```typescript
   const state$ = actorRef.observe(snapshot => snapshot.context);
   ```

### Anti-Patterns to Avoid

```typescript
// ❌ NEVER: Direct state mutation
actor.state.context.value = 'new'; 

// ❌ NEVER: Synchronous actor communication
const result = actor.getState(); 

// ❌ NEVER: Shared mutable state
let sharedData = { count: 0 };

// ❌ NEVER: Actor state in closures
const handler = () => console.log(actor.state);

// ❌ NEVER: setTimeout/setInterval
setTimeout(() => actor.send('TIMEOUT'), 1000);
```

---

## 🔄 TDD Workflow

### Phase 1: Test Specification (Agent C)

```typescript
// 1. Agent C writes test specs based on requirements
describe('ActorRef', () => {
  it.todo('should send events to the actor');
  it.todo('should handle ask pattern with timeout');
  it.todo('should allow observation of state changes');
  it.todo('should spawn child actors');
  it.todo('should cleanup on stop');
});
```

### Phase 2: Red Phase (Agent C)

```typescript
// 2. Agent C implements failing tests
it('should send events to the actor', () => {
  const actorRef = createActorRef(testBehavior);
  const event = { type: 'TEST_EVENT' as const };
  
  actorRef.send(event);
  
  // This will fail until implementation exists
  expect(actorRef.getSnapshot().events).toContain(event);
});
```

### Phase 3: Green Phase (Agent A/B)

```typescript
// 3. Agent A or B implements minimum code to pass
export class XStateActorRef implements ActorRef {
  send(event: EventObject): void {
    this.interpreter.send(event);
  }
}
```

### Phase 4: Refactor Phase (All)

```typescript
// 4. All agents collaborate on refactoring
// - Agent A reviews architecture
// - Agent B optimizes performance  
// - Agent C adds edge case tests
```

---

## 📅 Implementation Timeline

### Week 1: Foundation
| Day | Agent A (Tech Lead) | Agent B (Senior) | Agent C (Junior) |
|-----|-------------------|-----------------|-----------------|
| Mon | ActorRef interface design | Mailbox implementation | Test utilities setup |
| Tue | Request/response pattern | Observable basics | ActorRef test specs |
| Wed | Code review + refinements | Event bus design | Mailbox tests |
| Thu | Supervision interface | Operators impl | Observable tests |
| Fri | Integration planning | Performance baseline | Documentation |

### Week 2: Core Implementation
| Day | Agent A (Tech Lead) | Agent B (Senior) | Agent C (Junior) |
|-----|-------------------|-----------------|-----------------|
| Mon | Complex ask() impl | XState adapter | Integration test specs |
| Tue | Supervisor behavior | Component bridge | Request/response tests |
| Wed | Error handling patterns | Subscription mgmt | Error case tests |
| Thu | Code review | Performance tuning | Benchmark setup |
| Fri | Architecture docs | Integration fixes | Example apps |

### Week 3: Integration & Polish
| Day | Agent A (Tech Lead) | Agent B (Senior) | Agent C (Junior) |
|-----|-------------------|-----------------|-----------------|
| Mon | Migration strategy | Legacy adapter | Migration tests |
| Tue | Advanced patterns | Memory optimization | Load tests |
| Wed | Security review | Final optimizations | Security tests |
| Thu | API freeze | Bug fixes | Doc review |
| Fri | Release planning | Final integration | Release notes |

---

## 📡 Communication Protocol

### Daily Updates Format
```markdown
## Daily Update - Agent [A/B/C] - [Date]

### Completed
- [ ] Task 1 with PR link
- [ ] Task 2 with PR link

### In Progress
- [ ] Current task (X% complete)

### Blockers
- [ ] Any blocking issues

### Next
- [ ] Tomorrow's planned work
```

### PR Template
```markdown
## PR Type
- [ ] Feature
- [ ] Test
- [ ] Documentation
- [ ] Bug Fix

## Description
[What does this PR do?]

## Test Coverage
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing

## Checklist
- [ ] Follows code standards
- [ ] No linting errors
- [ ] Documentation updated
- [ ] Performance impact considered

## Agent
Agent [A/B/C] - [Your Role]
```

### Conflict Resolution
1. **Technical Conflicts**: Agent A (Tech Lead) has final say
2. **Merge Conflicts**: Person who created conflict resolves it
3. **Design Conflicts**: Team discussion in Slack/Discord
4. **Test Conflicts**: Agent C coordinates test organization

---

## ✅ Quality Assurance

### Test Coverage Requirements
- **Minimum**: 90% overall coverage
- **New Code**: 95% coverage required
- **Critical Paths**: 100% coverage (ActorRef core, Supervisor)

### Performance Benchmarks
```typescript
// Required benchmarks (Agent C implements, Agent B optimizes)
describe('Performance', () => {
  it('should send 10,000 events/second', () => {
    const result = benchmark(() => actorRef.send(event), 10000);
    expect(result.opsPerSecond).toBeGreaterThan(10000);
  });
  
  it('should handle 1,000 concurrent actors', () => {
    const actors = Array.from({ length: 1000 }, () => spawn(behavior));
    expect(measureMemory()).toBeLessThan(100); // MB
  });
});
```

### Documentation Standards
1. **API Docs**: JSDoc on all public APIs
2. **Examples**: Working example for each feature
3. **Guides**: Step-by-step tutorials
4. **ADRs**: Architecture Decision Records for major choices

### Code Review Checklist
- [ ] Tests pass and coverage meets requirements
- [ ] No linting errors or warnings
- [ ] Follows established patterns
- [ ] Performance impact acceptable
- [ ] Documentation complete
- [ ] No security vulnerabilities
- [ ] Backward compatibility maintained

---

## 🎯 Success Metrics

1. **Zero Integration Conflicts**: Modular design prevents conflicts
2. **High Test Coverage**: >95% coverage maintained
3. **Performance Goals Met**: All benchmarks pass
4. **Clean Architecture**: No coupling between agent work
5. **On-Time Delivery**: 3-week timeline achieved

---

## 🔗 Resources

- **Communication**: #actor-spa-dev on Slack/Discord
- **Documentation**: `/docs/architecture/`
- **Examples**: `/examples/actor-ref/`
- **Benchmarks**: `/benchmarks/`
- **Meeting Notes**: `/docs/meetings/`

---

*This implementation guide ensures all three agents can work effectively in parallel while maintaining high code quality through test-driven development.*