# Architecture-First, Boundary-Driven Design Prompt

## Prerequisite: Phase-0 Decision Gate

This prompt assumes a completed **Phase-0 Design Contract**.

Do NOT proceed unless the following are already defined:

- the user decision this system supports
- intended outcomes (not features)
- invariants vs safe approximations
- explicit scope exclusions
- acceptable failure/degradation posture

If these are missing, stop and complete `staff-design-contract.md` first.

Architecture without decision clarity creates unstable systems.

You are helping design a software system using an **architecture-first, boundary-driven approach**.

This system must remain **stable under change**, even as integrations, UI, and environments evolve.

Do **not** start with frameworks, components, APIs, or databases.

We will move in the following order.
Each step constrains the next.

---

## Terminology Note

This prompt uses the following terms:

- Functional Core -> deterministic behavior (contracts, state machines)
- Imperative Shell -> environment interaction
- Adapters / Ports -> bindings between core and environment
- Projections -> derived meaning for humans

Phase-0 does not define these.
It only constrains them via decisions, invariants, and scope.

---

## 1. User Stories (Intent)

Describe what users are trying to accomplish **in human terms**.

* What problem are they solving?
* What outcome do they care about?
* What does “success” mean from their perspective?

Avoid UI, API, or implementation details.

---

## 2. Workflows (Time & Progression)

For each user story, describe how intent unfolds **over time**.

* What starts the interaction?
* What steps happen?
* What can fail?
* What can retry?
* When is the workflow complete?

Think in terms of **phases and transitions**, not screens.

Workflows describe progression.
They do not define business rules.

---

## 3. Actors (Lifecycle & Ownership)

Identify where **state and responsibility must live**.

An actor exists **only if something has a lifecycle**:

* it starts
* it changes over time
* it can fail or recover
* it must remain consistent while other things change

Name each actor and its responsibility clearly.

If something has no lifecycle, it is likely a pure function, not an actor.

---

## 4. Functional Core (Deterministic Behavior)

For each actor, define its **behavioral contract**:

* Commands it accepts
* Events it emits
* States it can be in
* Transitions that are allowed

This layer must be:

* deterministic
* inspectable
* replayable

Assume this is the **functional core** of the system.

No IO.  
No timers.  
No environment knowledge.

This is where policy and truth live.

---

## 5. Ports (Contracts with the Outside World)

Define what the functional core **expects from the environment**.

* What information must arrive?
* What actions can be requested?
* What facts must be reported?

Ports are **contracts**, not implementations.

They must remain stable even if infrastructure changes.

---

## 6. Adapters (Infrastructure Translation)

Identify how each port is fulfilled in the real world.

Adapters exist only to:

* talk to external systems
* translate protocols into facts
* implement port contracts

Adapters must **never**:

* own behavior
* interpret meaning
* decide policy

They report facts.
Nothing more.

---

## 7. Imperative Shell (Workflow Orchestration)

Describe how workflows are executed at runtime.

The imperative shell is responsible for:

* starting and stopping workflows
* sequencing side effects
* wiring actors to adapters
* translating adapter facts into events
* invoking adapter operations when behavior requests them
* managing subscriptions and cleanup

The shell may be imperative and messy.

It must not decide behavior.

---

## 8. Delivery Adapters (System Entry)

Define how the outside world **enters** the system.

Delivery adapters translate:

* HTTP requests
* UI events
* messages
* jobs
* triggers

into **commands or events** that start workflows.

Delivery adapters must not:

* own business rules
* manage state
* perform orchestration

They initiate workflows and step aside.

---

## 9. Projections (Meaning for Humans)

Define how internal state becomes **meaning** for users.

* What does the UI need to know?
* What modes matter?
* What actions are allowed?
* What data is derived vs stored?

UI must consume projections, not raw state or transitions.

---

## Guardrails

* Stable things must not depend on volatile things.
* Behavior must not depend on environment details.
* Adapters report facts, not decisions.
* Delivery adapters translate intent, they do not interpret it.
* The shell orchestrates, it does not think.
* Environments may change bindings, never behavior.
* If responsibility feels unclear, stop and redraw boundaries.

Only after completing these steps should implementation begin.
