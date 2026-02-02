# Architecture Guide — Frontend (Framework-Agnostic Master Reference)

**Lifecycle-first, boundary-driven architecture for any frontend system**
(React, Solid, Vue, Svelte, Redux, MobX, Zustand, signals, or custom state)

---

## Purpose of This Document

This guide defines **how behavior is structured, owned, and protected over time** in frontend systems.

It is:

* framework-agnostic
* state-library-agnostic
* runtime-agnostic

Libraries are examples.
Responsibilities are the architecture.

---

## Core Principles

### Architecture-First, Boundary-Driven Design

**Goal:** Behavior remains stable even as frameworks, APIs, teams, and tooling change.

This architecture enforces a single invariant:

> **Behavior must be decided in one place and projected everywhere else.**

---

### Order of Design (Do Not Skip)

1. User intent
2. Lifecycle / flow
3. Events
4. Decision authority
5. Constraint surface
6. Orchestration (I/O)
7. State containers
8. Projections
9. Components

Reversing this order fragments authority.

---

### Functional Core, Imperative Shell

```text
┌───────────────────────────────────────────────┐
│ Imperative Shell                              │
│                                               │
│ - Orchestrators (hooks, controllers, actors)  │
│ - Adapters (HTTP, storage, browser APIs)      │
│ - Normalization (unknown → domain)            │
│ - I/O, retries, timing, cancellation           │
│                                               │
└───────────────────────────────────────────────┘
                    ↓
┌───────────────────────────────────────────────┐
│ Functional Core                               │
│                                               │
│ - Pure functions                              │
│ - Reducers (decision authority)               │
│ - FSMs (constraint maps)                      │
│ - Domain rules                                │
│                                               │
│ NO I/O                                       │
│ NO time                                      │
│ NO framework knowledge                       │
└───────────────────────────────────────────────┘
```

---

## Event Authority (Non-Negotiable)

There are **exactly two places** allowed to speak about events:

1. **Reducer (authority)**
   Decides **which event occurred**, based on facts.

2. **FSM (constraint map)**
   Defines **which events are permitted** at each point in time.

No other layer may:

* invent events
* reinterpret events
* block or allow events

If components, selectors, hooks, adapters, or shells define events, **authority is broken**.

---

## Lifecycle Gate Invariant (New, Enforced)

> **Lifecycle events are forwarded to the FSM inside `dispatch`, not in the shell.
> `dispatch` is the only gate through which the lifecycle may advance.**

This eliminates lifecycle plumbing from orchestration and reduces mental overhead.

---

## Projections

A **projection** is a read-only view of lifecycle state optimized for a consumer.

Examples:

* UI selectors / view models
* Derived signals / computed values
* Logs and telemetry
* Tests
* Statecharts (FSMs)

Projections must **never**:

* interpret raw input
* decide outcomes
* define events

They explain behavior.
They do not create it.

---

## Patterns

---

## Pattern 1: Domain Types

**Purpose:** Define what the core understands.

```ts
export type Patient = {
  id: string;
  name: string;
  age: number;
  hasInsurance: boolean;
};

export type Coverage = {
  isActive: boolean;
};

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };
```

---

## Pattern 2: Pure Functions

**Purpose:** Timeless, deterministic business rules.

```ts
export type Eligibility = "eligible" | "pending" | "denied";

export function determineEligibility(patient: Patient): Eligibility {
  if (patient.age < 18) return "denied";
  if (!patient.hasInsurance) return "pending";
  return "eligible";
}
```

No I/O.
No time.
No framework imports.

---

## Pattern 3: Reducer as Decision Authority

Reducers:

* interpret normalized facts
* update domain state
* **return lifecycle intent as data**

They do **not** know about the FSM instance.

```ts
export type EligibilityState = {
  patient: Patient | null;
  coverage: Coverage | null;
  eligibility: Eligibility | null;
  error: string | null;
};

export type EligibilityEvent =
  | { type: "PATIENT_FACTS_RECEIVED"; patient: Patient }
  | { type: "COVERAGE_FACTS_RECEIVED"; coverage: Coverage };

export type EligibilityMachineEvent =
  | { type: "RULES_DENIED" }
  | { type: "RULES_NEED_COVERAGE" }
  | { type: "COVERAGE_LOADED" };

export type ReduceResult<S, E> = {
  state: S;
  emit?: E;
};

export function reduceEligibility(
  state: EligibilityState,
  event: EligibilityEvent
): ReduceResult<EligibilityState, EligibilityMachineEvent> {
  if (event.type === "PATIENT_FACTS_RECEIVED") {
    const eligibility = determineEligibility(event.patient);

    if (eligibility === "denied") {
      return {
        state: { ...state, patient: event.patient, eligibility },
        emit: { type: "RULES_DENIED" },
      };
    }

    return {
      state: { ...state, patient: event.patient, eligibility },
      emit: { type: "RULES_NEED_COVERAGE" },
    };
  }

  return {
    state: { ...state, coverage: event.coverage },
    emit: { type: "COVERAGE_LOADED" },
  };
}
```

---

## Pattern 4: FSM as Constraint Map

FSMs define **event legality**, not behavior.

```ts
export const eligibilityMachine = createMachine({
  id: "eligibility",
  initial: "idle",
  states: {
    idle: { on: { RULES_DENIED: "complete", RULES_NEED_COVERAGE: "loadingCoverage" } },
    loadingCoverage: { on: { COVERAGE_LOADED: "complete" } },
    complete: {},
  },
});
```

FSMs may be implemented with XState, enums, tables, or custom logic.
Components may emit user intent (callbacks), but must not translate intent into domain events.

---

## Pattern 5: Store as Container **and Lifecycle Gate**

The store:

* holds state
* owns the FSM actor
* applies the reducer
* **forwards lifecycle events inside `dispatch`**

```ts
export function createEligibilityStore(fsmActor) {
  let state: EligibilityState = {
    patient: null,
    coverage: null,
    eligibility: null,
    error: null,
  };

  function dispatch(event: EligibilityEvent) {
    const result = reduceEligibility(state, event);
    state = result.state;

    if (result.emit) {
      const snapshot = fsmActor.getSnapshot();

      if (!snapshot.can(result.emit as any)) {
        throw new Error(`Illegal lifecycle event: ${result.emit.type}`);
      }

      fsmActor.send(result.emit as any);
    }
  }

  function getState() {
    return state;
  }

  return { dispatch, getState };
}
```

**Invariant:**
The shell never sees `emit`.

---

## Pattern 5a: Store Boundary vs Shell (Critical Separation)

This pattern is **non-optional**.
It is the line that prevents lifecycle leakage.

### The Store Is the Lifecycle Boundary

The **store** is not just a state container.

It is the **boundary where lifecycle authority is enforced**.

The store:

* owns **domain state**
* owns the **FSM actor**
* applies the **reducer**
* enforces **event legality**
* advances the lifecycle **inside `dispatch`**
* exposes **projections**, not raw state

The store must **never**:

* perform I/O
* prompt users
* access browser / network APIs
* measure time or concurrency
* call adapters

In short:

> **If something advances the lifecycle, it belongs in the store.**

### Canonical Store Example

```ts
class DocStore {
  private state: DocState = initialDocState;
  private actor = createActor(docMachine);
  private fsmState: DocFsmState = "idle";

  constructor() {
    this.actor.start();
    this.actor.subscribe((snapshot) => {
      this.fsmState = snapshot.value;
    });
  }

  get projection(): DocView {
    return projectDoc(this.state, this.fsmState);
  }

  get workflowState(): DocFsmState {
    return this.fsmState;
  }

  dispatch(event: DocEvent) {
    const result = reduceDoc(this.state, event);
    this.state = result.state;

    if (result.emit) {
      const snapshot = this.actor.getSnapshot();
      if (!snapshot.can(result.emit)) {
        throw new Error(`Illegal lifecycle event: ${result.emit.type}`);
      }
      this.actor.send(result.emit);
    }
  }
}
```

**Invariant:**
The lifecycle **cannot advance** without passing through `dispatch`.

---

### The Shell Is Outside the Boundary

The **shell** (orchestrator) lives *outside* the lifecycle boundary.

The shell:

* performs I/O
* owns time, cancellation, retries
* calls ports / adapters
* normalizes unknown input
* dispatches **facts** into the store
* may read FSM state **only for sequencing**

The shell must **never**:

* send FSM events directly
* inspect or forward `emit`
* interpret data to choose events
* bypass `dispatch`

In short:

> **If something touches the outside world, it belongs in the shell.**

### Canonical Shell Example

```ts
class DocShell {
  constructor(
    private store: DocStore,
    private docPort: DocPort
  ) {}

  async saveNow(doc: unknown) {
    const normalized = toDocEvent(doc);
    this.store.dispatch(normalized);

    if (this.store.workflowState !== "saving") return;

    const result = await this.docPort.save(this.store.projection.doc);

    this.store.dispatch({
      type: "SAVE_COMPLETED",
      at: Date.now(),
      result,
    });
  }
}
```

Notice:

* the shell never touches the FSM
* the shell never sees `emit`
* lifecycle advancement is implicit via `dispatch`

---

### Work vs Decision (Important Clarification)

Shells **may perform work** that the core should not:

Examples:

* measuring payload size
* serializing data
* hashing
* compression
* reading file stats
* parsing editor snapshots

But:

> **Policy decisions based on that work must remain in the reducer.**

The shell produces **facts**.
The core decides **meaning**.

---

### Summary Rule (Print This)

> **Store = lifecycle boundary**
> **Shell = outside world**
> **`dispatch` = the only gate between them**

---

## Pattern 6: Projections from State

```ts
export function projectEligibility(state: EligibilityState) {
  return {
    canStart: !state.eligibility,
    showResult: Boolean(state.eligibility),
    label: state.eligibility?.toUpperCase() ?? null,
  };
}
```

---

## Pattern 7: Ports (Interfaces)

```ts
export interface PatientPort {
  getPatient(id: string): Promise<Result<Patient>>;
}
```

---

## Pattern 8: Adapters (I/O)

Adapters:

* perform I/O
* normalize results
* return facts

```ts
export function createPatientAdapter(): PatientPort {
  return {
    async getPatient(id) {
      const res = await fetch(`/patients/${id}`);
      if (!res.ok) return { ok: false, error: "HTTP error" };
      const raw: unknown = await res.json();
      return normalizePatient(raw);
    },
  };
}
```

---

## Pattern 9: Orchestrator (Imperative Shell)

Orchestrators live outside the store boundary and must not own the FSM.

The shell:

* performs I/O
* dispatches facts
* checks FSM state **only when sequencing requires it**

It does **not** forward lifecycle events.

```ts
export async function runEligibility(store, fsmActor, patientPort, coveragePort, id: string) {
  const patient = await patientPort.getPatient(id);
  if (!patient.ok) return;

  store.dispatch({ type: "PATIENT_FACTS_RECEIVED", patient: patient.value });

  if (fsmActor.getSnapshot().value !== "loadingCoverage") return;

  const coverage = await coveragePort.getCoverage(id);
  if (!coverage.ok) return;

  store.dispatch({ type: "COVERAGE_FACTS_RECEIVED", coverage: coverage.value });
}
```

---

## Pattern 10: Components (Presentation)

```tsx
function EligibilityView({ view, onStart }) {
  return (
    <section>
      <button disabled={!view.canStart} onClick={onStart}>
        Check Eligibility
      </button>
      {view.showResult && <div>{view.label}</div>}
    </section>
  );
}
```

No business logic.
No lifecycle logic.
No event logic.
Components may emit user intent (callbacks), but must not translate intent into domain events.

---

## Pattern 11: Errors as Values

Expected failures are values.
Exceptions signal bugs.

---

## Pattern 12: Testing Strategy

* Pure functions: **90%+**
* Reducers: **90%+**
* FSM legality: **90%+**
* Store + FSM integration: **90%**
* Orchestrators: **60–80%**
* Components: rendering only

---

## Directory Structure

```text
src/
├── types/
├── core/
│   ├── policies/
│   ├── reducers/
│   └── machines/
├── projections/
├── ports/
├── adapters/
├── orchestrators/
├── components/
└── test/
```

---

## Final Rules (Print These)

* Reducers decide meaning
* FSMs define legal events
* **Dispatch is the lifecycle gate; shells never advance the lifecycle directly**
* Orchestrators execute I/O only
* Adapters normalize at boundaries
* Projections explain
* Components render

---

## Result

A frontend architecture that:

* enforces authority by construction
* minimizes mental overhead
* prevents lifecycle drift
* survives framework churn
* scales with teams and automation

## Appendices — Framework-Specific Implementations (Clarified Responsibilities)

These appendices show **how the same architecture is realized in different frontend frameworks** without changing responsibilities.

> **Important:**
> A framework primitive (hook, composable, store, signal) does **not** define responsibility.
> Responsibility is defined by *what the code is allowed to do*.

---

## Appendix A — Hook Roles (Critical Clarification)

In this architecture, **hooks fall into two distinct and non-overlapping roles**.

Confusing these roles is the most common source of lifecycle leaks.

---

### A1) Adapter Hooks (Allowed)

An **adapter hook** exists **only** to access external systems that require framework context.

Examples:

* browser APIs
* SDKs that rely on React/Vue context
* script loaders
* authentication providers
* analytics SDKs

**Adapter hooks implement ports.**

They:

* talk to external systems
* normalize `unknown → domain`
* return `Result<T>`
* expose **no lifecycle logic**
* **never import or touch the store**
* **never dispatch**

> If a hook touches the store, it is **not** an adapter.

#### React Example — Adapter Hook

```ts
// adapters/payments/useStripePaymentsPort.ts
import { useMemo } from "react";
import type { PaymentsPort } from "@/ports/PaymentsPort";
import type { Result } from "@/types/result";

export function useStripePaymentsPort(): PaymentsPort {
  const stripe = useStripeClient(); // requires React context

  return useMemo<PaymentsPort>(() => {
    return {
      async charge(input): Promise<Result<{ receiptId: string }>> {
        try {
          const res = await stripe.charge(/* ... */);
          return { ok: true, value: { receiptId: res.id } };
        } catch {
          return { ok: false, error: "Payment failed" };
        }
      },
    };
  }, [stripe]);
}
```

**Key properties:**

* no store import
* no dispatch
* no FSM knowledge
* no lifecycle branching

This hook is **an adapter**, nothing more.

---

### A2) Orchestrator Hooks (Allowed, but Different)

An **orchestrator hook** coordinates **multiple steps over time** and interacts with the store.

They:

* call ports (adapters)
* dispatch facts
* read FSM state *only for sequencing*
* never interpret data
* never invent events

> Orchestrators may dispatch.
> Adapters must not.

#### React Example — Orchestrator Hook

```ts
// orchestrators/useCheckoutOrchestrator.ts
import type { CheckoutStore } from "@/stores/checkoutStore";
import type { PaymentsPort } from "@/ports/PaymentsPort";

export function useCheckoutOrchestrator(
  store: CheckoutStore,
  payments: PaymentsPort
) {
  async function checkout(userId: string, amountCents: number) {
    const result = await payments.charge({ userId, amountCents });

    if (!result.ok) {
      store.dispatch({
        type: "CHECKOUT_FAILED",
        message: result.error,
      });
      return;
    }

    store.dispatch({
      type: "CHECKOUT_SUCCEEDED",
      receiptId: result.value.receiptId,
    });
  }

  return { checkout };
}
```

**Key properties:**

* dispatches facts
* does not call SDKs directly
* does not decide event meaning
* lifecycle advances only via `dispatch`

---

### A3) Forbidden Hybrid Hooks (Do Not Do This)

This is the blur you correctly called out.

```ts
// ❌ BAD — Adapter + Orchestrator + Store mixed
export function usePayments() {
  const dispatch = useStore((s) => s.dispatch);

  async function charge(input) {
    const res = await stripe.charge(input);
    dispatch({ type: "PAYMENT_DONE", res }); // ❌ lifecycle leak
  }

  return { charge };
}
```

Why this breaks the architecture:

* adapter logic touches the store
* lifecycle advancement is implicit
* event authority is fragmented
* reasoning becomes non-local

---

## Appendix B — React Implementation Notes (With Clear Roles)

### B1) Runtime Wiring (Created Once)

```ts
export function createEligibilityRuntime(ports) {
  const fsm = createActor(eligibilityMachine);
  fsm.start();

  const store = createEligibilityStore(fsm);

  return { fsm, store, ports };
}
```

* FSM + store are created once
* store owns lifecycle gate
* hooks receive runtime, not globals

---

### B2) React Orchestrator Hook

```ts
export function useEligibilityOrchestrator(runtime) {
  async function start(patientId: string) {
    const patient = await runtime.ports.patient.getPatient(patientId);
    if (!patient.ok) return;

    runtime.store.dispatch({
      type: "PATIENT_FACTS_RECEIVED",
      patient: patient.value,
    });

    if (runtime.fsm.getSnapshot().value !== "loadingCoverage") return;

    const coverage = await runtime.ports.coverage.getCoverage(patientId);
    if (!coverage.ok) return;

    runtime.store.dispatch({
      type: "COVERAGE_FACTS_RECEIVED",
      coverage: coverage.value,
    });
  }

  return { start };
}
```

## Final Rule (Explicit)

> **A hook that talks to the store is an orchestrator.
> A hook that talks to the outside world is an adapter.
> No hook is allowed to be both.**

This rule preserves:

* single event authority
* a single lifecycle gate
* clear reasoning boundaries
* portability across frameworks
