# META.md — Product Studio Orchestrator

## (Human-governed, AI-assisted)

This repository is operated as a **product studio**, not a collection of scripts or blog posts.

AI systems in this repo behave as **bounded components** under strict human oversight.
All authority, decisions, and responsibility remain with humans.

---

## Purpose

This studio turns architectural thinking into **high-quality developer assets**, including:

* Essays (authority & top-of-funnel)
* Diagnostic & self-assessment artifacts (lead magnets or low-ticket)
* Curriculum & challenges
* Starter kits & reference systems
* Architecture reviews & advisory offerings

---

## Planning Modes & Scope Boundaries

This repository supports **two planning modes**. Humans and agents must pick the mode **before** creating plans.

### Mode A — Product & Knowledge Artifacts (META-Orchestrated)

Use for:

* Essays
* Diagnostics & self-assessments
* Curriculum & challenges
* Reference systems (non-feature work)
* Authority or educational assets

Governed by:

* `META.md`
* Role-specific `agents/*/AGENTS.md`

Characteristics:

* Conceptual and structural
* Oriented around clarity, learning, and decision-making
* Not acceptance-criteria-driven implementation planning

---

### Mode B — Engineering Feature Planning

Use for:

* Code changes
* Feature implementation
* Bugs, infra, UI/API development

Governed by:

* `plans/prompt.md` (Project Planning Documentation Generator)

Characteristics:

* Acceptance-criteria driven
* Task- and implementation-oriented

---

### Explicit Rule

* **Do NOT** use `plans/prompt.md` for essays, diagnostics, curriculum, authority content, or product framing.
* **Do NOT** use META orchestration for feature-level code planning, acceptance criteria decomposition, or Jira-style task breakdowns.

If an effort mixes concerns, split it into:

* a **Mode A** product/knowledge plan, and
* a **Mode B** feature plan.

---

## Phase 0 Intake (Mandatory Gate)

Phase 0 is required **before** any agent execution.
It exists to prevent scope drift, hidden assumptions, and inferred constraints.

---

### Phase 0 Capture Location (Actionable)

* **Mode A:** must be captured in
  `plans/<mode-a-artifact-dir>/phase-0.md`

* **Mode B:** requires a **human-authored Phase 0 seed** *before* running the planning agent.

  * The agent may then expand this seed into the full Phase 0 content inside:
    `plans/<feature>/requirements.md`

If Phase 0 (or the Phase 0 seed) is missing, agents must halt and return a scope check.

---

### Phase 0 Seed — Required Inputs (Mode B)

Before running `plans/prompt.md`, the initiating human must provide:

* Feature name (directory name)
* Acceptance criteria
* Constraints (technical, business, UX, security, performance, compatibility)
* Non-goals (explicitly out of scope)
* Risk posture (speed vs safety, experimental vs conservative)

Risk posture must be persisted in `plans/<feature>/requirements.md` and treated as a first-order planning constraint.

Agents **must not invent or infer** these fields.
If any are missing, the agent must request them.

---

### Required Phase 0 Inputs (Mode A)

The initiating human must provide:

* Artifact type (diagnostic, curriculum, essay support, review offer)
* Planning mode (Mode A)
* Source material (essays, existing drafts, briefs)
* Ownership (which agent/human owns next steps)

Additional required inputs **when business routing is involved** (paid or gated):

* Delivery format (PDF, page, email sequence, etc.)
* Hosting / routing path (must comply with `bluejf.llc` guardrails)
* CTA placement rules (where, how many, and in what tone)
* Target release window

---

## Plans Directory Structure (Mandatory)

`plans/` supports directories for **both modes**, but they must never be mixed.

```text
plans/
├── diagnostics/
├── curriculum/
├── essays/
├── reviews/
└── <feature>/        (Mode B feature directories live directly under plans/)
```

---

### Mode A — Product & Knowledge Artifacts

Each Mode A artifact lives in its own directory.

Example:

```text
plans/diagnostics/architectural-self-assessment/
├── phase-0.md
├── brief.md
├── structure.md
├── outcomes.md
├── editorial-notes.md
└── distribution.md
```

#### Mode A File Contract

##### MUST include

* `phase-0.md`
* `brief.md`

##### MAY include

* `structure.md`
* `outcomes.md`
* `scope.md`
* `editorial-notes.md`
* `distribution.md`
* `risks.md`

##### MUST NOT include

* `requirements.md`
* `design.md`
* `task-list.md`
* acceptance criteria
* time estimates
* implementation phases

#### Legacy Exception (Temporary)

Single-file Mode A drafts already present at `plans/*.md` are allowed as **legacy artifacts**, but:

* New Mode A work must use directories
* Legacy drafts should be migrated when touched next

---

### Mode B — Engineering Features

Mode B plans are stored as:

```text
plans/<feature>/
```

Each feature directory must include:

* `requirements.md`
* `design.md`
* `task-list.md`

---

## Canonical Sources of Truth (Repo-Aware)

### Essays / Blog Content (Authoritative)

* Path: `src/content/blog/*.md`
* Canonical architectural essays
* Read-only unless explicit human approval

### Non-Blog Authority Assets (Authoritative)

Diagnostics and lead magnets are **not essays**.

* Intended authoritative path:
  `src/content/resources/diagnostics/`

This directory may be introduced when diagnostics are promoted.

---

### Agents

* Path: `agents/*/AGENTS.md`
* Each directory defines one bounded role

---

### Plans

* Path: `plans/`
* Canonical source of truth
* Must be committed (never ignored)

---

## Product Ladder (Single Source of Truth)

|      Level | Artifact Type | Purpose              |
| ---------: | ------------- | -------------------- |
|       Free | Essays        | Authority            |
| Free / $29 | Diagnostics   | Orientation          |
|        $99 | Foundations   | Learnable models     |
|       $499 | Systems       | Applied architecture |
|       $5k+ | Reviews       | Risk reduction       |

---

## Diagnostic & Self-Assessment Artifacts

Diagnostics are **orientation tools**, not instructional products.

### Definition

A diagnostic:

* Determines whether pain is **accidental or structural**
* Surfaces patterns around behavior, environment, responsibility, boundaries
* Produces a **clear outcome classification**
* Ends with implications, not instructions

### Ladder Placement Rules

Diagnostics may be:

* Free (newsletter-gated or ungated), or
* Low-cost ($29 range) when decisiveness materially reduces uncertainty

Placement must be declared in `phase-0.md`.

---

### Canonical Diagnostic Example

* Planning directory:
  `plans/diagnostics/architectural-self-assessment/`
* Legacy draft (temporary):
  `plans/$29-diagnostic-draft.md`
* Published target (when promoted):
  `src/content/resources/diagnostics/when-code-is-cheap-architectural-self-assessment.md`

---

## Global Business Routing Guardrail

* All monetization routes to **bluejf.llc**
* All product references from 0xjcf.com are external
* No checkout or payment flows on 0xjcf.com

---

## Ship Checklist (Minimum)

Before shipping:

* Editorial review complete
* Scope verified
* Ladder alignment confirmed
* Routing guardrails verified
* Canonical sources unchanged unless approved

---

## Scope Enforcement & Refusal Protocol

Agents must stop and return a structured scope check when boundaries are crossed.

Refusal is **correct behavior**, not failure.

---

## Reminder

AI outputs are advisory drafts only.
Human judgment is final.

---

## Default Next Build

Architectural self-assessment derived from:
`src/content/blog/when-code-becomes-cheap.md`
