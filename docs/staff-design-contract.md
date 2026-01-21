# Phase-0 Design Contract

## Architecture-First, Staff-Level Decision Gate

You are designing a software system using an **architecture-first, boundary-driven approach**.

This Phase-0 contract exists to ensure **decision quality before architecture**, and **architecture clarity before implementation**.

The goal is not to design features.
The goal is to ensure the system is **worth building**, **safe to evolve**, and **stable under change**.

Do **not** start with:

* frameworks
* components
* APIs
* databases
* UI layouts

This contract must be completed **before any architecture diagrams, tickets, or code**.

---

## 0. System Purpose (Decision Clarity)

Complete this sentence **precisely**:

> **This system exists so that *[user]* can confidently decide *[decision]* under *[constraints]*.**

If this cannot be stated clearly, **stop**.
The system is not ready to design.

---

## 1. User Stories (Intent)

Describe what users are trying to accomplish **in human terms**.

* What problem are they solving?
* What outcome do they care about?
* What does “success” mean from *their* perspective?

Avoid:

* UI descriptions
* technical terminology
* implementation assumptions

User intent constrains everything that follows.

---

## 2. Outcomes Over Features

Describe the **change in user understanding or confidence** after using the system.

* What uncertainty is reduced?
* What becomes easier to decide?
* What behavior changes?

Do **not** list features.

If outcomes are unclear, architecture will be unstable.

---

## 3. What Must Be True vs What Can Be Wrong

Explicitly separate **invariants** from **approximations**.

### Must Be True

Things that **cannot be wrong** without breaking trust or safety.

* Should be few
* Should be stable
* Should justify architectural protection

### Can Be Wrong (Safely)

Things that may:

* be stale
* be approximate
* decay over time
* be probabilistic

Design must **embrace this distinction**, not fight it.

---

## 4. Workflows (Time & Progression)

For each user story, describe how intent unfolds **over time**.

* What steps occur?
* What can fail?
* What can retry?
* What states does the system move through?

Think in:

* phases
* transitions
* invalidations

Not screens.

---

## 5. Tradeoff Review (Staff Gate)

This tradeoff review is limited to **product, trust, legal, and decision risk**.

It explicitly excludes:

* data models
* system boundaries
* ports/adapters
* infrastructure choices

Those decisions are deferred to the architecture-first design phase.

Enumerate **2–3 viable approaches**, even if one feels obvious.

For each option, briefly assess:

* risk (technical, legal, trust)
* reversibility
* operational cost
* long-term maintenance

Then state:

* **Decision:** what is chosen *now*
* **Why:** based on current constraints
* **What is intentionally deferred**

This is not about being right forever.
It is about being **intentionally correct today**.

---

## 6. Scope Kill List (Required)

Explicitly list:

* features you are *not* building
* problems you are *not* solving
* edge cases you are *intentionally ignoring*

If this list is empty, scope is not disciplined enough.

---

## 7. Architecture Handoff (Output of Phase-0)

This Phase-0 contract does **not** define architecture.

Instead, it produces **constraints and inputs** that MUST be honored by the architecture-first design process.

The following artifacts are the ONLY outputs of Phase-0:

- Clear user decision statement
- Explicit outcomes (not features)
- Invariants vs safe approximations
- Risk and tradeoff framing (product/decision risk only)
- Explicit scope exclusions
- Acceptable failure and degradation posture
- Identification of irreversible decisions (non-technical)

No actors, contracts, adapters, or projections are defined here.

All boundary modeling occurs in `architecture-first-prompt.md`.

---

## 8. Failure & Degradation Modes

Describe acceptable behavior when:

* data is missing
* data is stale
* confirmations conflict
* assumptions are violated

The goal is **graceful degradation without lying**.

---

## 9. Reversibility Audit

Identify decisions that are:

### Hard to Reverse

* lifecycles
* ownership boundaries
* trust mechanisms
* data permanence

### Easy to Reverse

* UI structure
* visual presentation
* adapter implementations
* optimization strategies

Architecture must **protect hard decisions** and **delay easy ones**.

---

## 10. Readiness Gate

Proceed to implementation **only if**:

* the user decision is explicit
* outcomes are clear
* invariants are protected
* scope is constrained
* failure modes are acceptable

If not, return to Phase-0.

---

## Guardrails (Non-Negotiable)

* Stable things must not depend on volatile things
* Behavior must not depend on environment details
* Environments may change bindings, never behavior
* If responsibility feels unclear, stop and redraw boundaries

---

### Final Principle

> **Most architectural failures originate from unclear product decisions.**

This Phase-0 contract exists to prevent that —
before code, before frameworks, before momentum makes it expensive to stop.
