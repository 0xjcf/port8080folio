# When Code Is Cheap: An Architectural Self-Assessment

---

## Purpose

This self-assessment helps you determine whether the pain you feel in your system is **accidental** or **structural**.

It focuses on:

* behavior
* environment
* responsibility
* boundaries

It does **not** teach solutions.
Its goal is **orientation**, not instruction.

---

## Suggested Time

30–45 minutes

---

## How to Use This

* Read each section in order.
* Mark the checklists honestly.
* Write short observations, not plans.
* Resist the urge to “fix” anything while reading.

This assessment is about **seeing clearly**, not acting quickly.

---

## 1) Code Is Cheap, Confidence Is Not

### Recognition

Many teams are shipping faster while trusting their systems less.

This section names that gap so you can interpret it without judgment.

**Consider:**

* When you ship faster, does the system feel harder to trust?
* Can you confidently predict behavior after small changes?
* Do you rely on intuition rather than explicit boundaries?

**Confidence score (1–5):**

* [ ] 1
* [ ] 2
* [ ] 3
* [ ] 4
* [ ] 5

Notes:

---

## 2) Behavior vs Environment Check

Purpose:

This section checks whether behavior is defined independently from external interaction.

**Consider:**

* Can core behavior be described without mentioning network, storage, or UI?
* Are side effects embedded in the same places as state transitions?
* Could the system be replayed deterministically without simulating the environment?

**Signals:**

* [ ] Behavior and effects are interleaved
* [ ] Async behavior is inseparable from dependencies
* [ ] Tests require heavy environment setup

Notes:

---

## 3) Lifecycle Ownership Check

Purpose:

This section identifies whether parts of the system with real lifecycles are treated as such.

When lifecycle ownership is unclear, failure and recovery become unpredictable.

**Consider:**

* Which parts of the system load, retry, fail, recover, or terminate independently?
* Do those parts have explicit ownership?
* Are lifecycle responsibilities spread across unrelated layers?

**Signals:**

* [ ] No clear owner for retries, failures, or recovery
* [ ] Lifecycle behavior scattered across UI, hooks, or effects
* [ ] Debugging requires “knowing the history”

Notes:

---

## 4) Responsibility Leak Indicators

Purpose:

This section surfaces places where responsibility has drifted.

**Consider:**

* Where does the system “know too much” about the external world?
* Are components responsible for behavior they cannot fully control?
* Were boundaries drawn by convenience rather than responsibility?

**Signals:**

* [ ] Core logic depends on environment details
* [ ] State and side effects are inseparable
* [ ] Refactors feel risky despite correct logic

List the top 2–3 responsibility leaks you see:

*
*
*

---

## 5) Dependency Direction Smell Test

Purpose:

This section checks whether dependency direction protects stable behavior.

**Consider:**

* Do stable behaviors depend on volatile infrastructure?
* Do “core” concerns call into “edge” concerns directly?
* Do adapter changes require touching behavior logic?

**Signals:**

* [ ] Behavior depends on frameworks or external APIs
* [ ] Adapter changes force behavior changes
* [ ] Dependency direction feels inverted

One example that feels wrong:

---

## 6) Diagnostic Outcomes

Use the signals you marked to choose the closest outcome below.

### A) Primarily Accidental Pain

* Boundary issues are isolated
* Behavior is mostly stable
* Confidence gaps are local

**Implication:**
Architecture is likely not your bottleneck right now.

---

### B) Boundary Leakage

* Behavior and environment are mixed
* Responsibility is blurred
* Risk increases as the system grows

**Implication:**
Learning to model behavior explicitly is likely the highest-leverage next step.

---

### C) Lifecycle Mismatch

* State ownership is unclear
* Recovery and retries lack a single owner
* Temporal behavior is scattered

**Implication:**
System structure, not tooling, is the primary constraint.

---

### D) Systemic Risk

* Core behavior depends on volatile concerns
* Change consistently feels dangerous
* Directional boundaries are unclear

**Implication:**
A second architectural perspective or redesign is often warranted.

---

**Your outcome (choose one):**

* [ ] A
* [ ] B
* [ ] C
* [ ] D

One-sentence summary in your own words:

---

## Closing Note

This assessment is not a verdict.
It is a **starting position**.

If it helped you see your system more clearly, even uncomfortably so, it did its job.

Further learning, examples, and applied guidance live outside this document.
