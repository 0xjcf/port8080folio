---
title: Common Failure Modes
description: How systems drift when boundaries erode, and how to spot the warning signs early.
date: 2025-01-20
pubDate: 2025-01-20
tags:
  - architecture
  - statecharts
  - actor-model
  - boundaries
  - systems-thinking
draft: true
---

## Common Failure Modes

Most systems do not fail all at once.

They drift.

The code still works.  
Tests still pass.  
Features still ship.

But clarity fades.

By the time people feel the pain, the boundaries are already gone.

This article is about recognizing those failure modes early, while they are still cheap to fix.

---

## Failure mode one: behavior leaks into infrastructure

This is the most common one.

Adapters start doing more than reporting facts.

They retry requests.  
They decide when something is loading.  
They hide errors.  
They make assumptions about UI behavior.

At first, this feels helpful.

Later, it becomes impossible to change behavior without rewriting infrastructure.

### Warning signs (behavior leaks into infrastructure)

- Adapter code contains conditionals about state
- Retry logic lives outside the functional core
- Infrastructure code mentions UI concepts
- Swapping runtimes requires behavior changes

### Why it happens (behavior leaks into infrastructure)

Because infrastructure is where things break first.

It feels natural to fix problems where they appear.

But once behavior moves there, it is no longer deterministic.

---

## Failure mode two: the shell becomes a second brain

The imperative shell starts thin.

Then someone adds a special case.  
Then another.  
Then timing logic.  
Then state tracking.

Eventually, the shell knows as much as the functional core.

Now you have two sources of truth.

### Warning signs (the shell becomes a second brain)

- The shell branches on current state
- Shell code becomes hard to test
- Behavior changes require shell edits
- You cannot replay behavior without infrastructure

### Why it happens (the shell becomes a second brain)

Because the shell is allowed to be messy.

Without discipline, mess turns into logic.

---

## Failure mode three: UI consumes raw state

The UI reaches directly into internal state.

It checks machine states.  
It branches on context shape.  
It infers behavior from transitions.

This creates tight coupling.

### Warning signs (UI consumes raw state)

- Components match on internal states
- UI breaks when behavior refactors
- Multiple components duplicate the same logic
- Small behavior changes ripple across the UI

### Why it happens (UI consumes raw state)

Because skipping projection feels faster.

Until it isn’t.

---

## Failure mode four: actors lose ownership

Actors are created implicitly.

They restart unexpectedly.  
They duplicate silently.  
They are tied to component lifecycles.

State ownership becomes unclear.

### Warning signs (actors lose ownership)

- State resets on re-render
- Multiple instances fight over data
- Lifecycle bugs appear during navigation
- No one knows who should stop what

### Why it happens (actors lose ownership)

Because lifecycle is rarely named explicitly.

When ownership is implicit, bugs follow.

---

## Failure mode five: ports disappear

Infrastructure contracts are never written down.

Behavior depends directly on libraries.  
Adapters expose library-specific concepts.  
Core logic knows too much about the world.

### Warning signs (ports disappear)

- Core code imports runtime libraries
- Changing infrastructure breaks behavior tests
- New adapters require refactors
- Behavior language matches vendor terminology

### Why it happens (ports disappear)

Because contracts feel like overhead.

Until you need to change something.

---

## Failure mode six: projection becomes optional

Some components use projection.  
Others bypass it.  
New features skip it entirely.

The UI becomes inconsistent.

### Warning signs (projection becomes optional)

- Multiple ways to read state
- Projection exists but is not required
- UI logic grows over time
- Tests depend on implementation details

### Why it happens (projection becomes optional)

Because projection is not enforced.

Consistency requires intention.

---

## Failure mode seven: the order of decisions flips

This one is subtle.

Infrastructure choices are made first.  
Wiring comes next.  
Behavior is figured out later.

The system works, but feels brittle.

### Warning signs (the order of decisions flips)

- Behavior is explained after implementation
- State diagrams are retroactive
- Fixes introduce new edge cases
- No one trusts refactors

### Why it happens (the order of decisions flips)

Because it feels productive.

Until behavior changes.

---

## How to catch drift early

You do not need perfect discipline.

You need early signals.

Ask these questions regularly:

- Where does this decision belong?
- Who owns this state?
- Is this fact or interpretation?
- Can I replay this behavior without the world?
- Would changing infrastructure change behavior?

If the answers are unclear, drift has started.

---

## Why these failures compound

Each failure mode reinforces the others.

Leaky adapters make shells smarter.  
Smart shells weaken the core.  
Weak cores force UI to compensate.  
UI compensation hides the real problem.

By the time things feel unmanageable, the system is already tangled.

---

## The good news

All of these failure modes are reversible.

But only when they are named.

Boundaries do not enforce themselves.

They require attention, and occasionally restraint.

---

## Final thought

Most architecture problems are not caused by bad ideas.

They are caused by good ideas applied in the wrong place.

Recognizing when that happens is the difference between systems that age gracefully and systems that quietly rot.

---

## Next in the series

Next, we’ll step back and define a **simple litmus test**.

A small set of questions you can use to decide where code belongs, even when things are messy and deadlines are tight.

It is the tool I wish I had years ago.
