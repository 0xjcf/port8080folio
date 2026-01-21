---
title: Projection
description: Why UI should consume meaning, not internal state.
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

## Projection

At this point in the series, we have a system that behaves correctly.

We have deterministic behavior in the functional core.  
We have actors that own state over time.  
We have an imperative shell that talks to the world.  
We have ports and adapters that keep infrastructure from leaking inward.

And yet, many systems still feel hard to work with.

The problem usually shows up at the UI boundary.

---

## The silent leak

Most UIs are wired directly to internal state.

Components inspect machine states.  
Views branch on raw flags.  
Templates know more than they should.

It works at first.

But over time, the UI starts to depend on details it was never meant to understand.

That dependency is subtle, and it is expensive.

---

## What projection actually is

Projection is the layer that translates internal state into **meaning**.

Not data.  
Not transitions.  
Not flags.

Meaning.

It answers questions like:

- What should the user see right now?
- What actions are allowed?
- What is disabled?
- What is in progress?
- What matters on this screen?

The UI should not have to figure that out.

---

## Internal state is not a UI contract

Internal state exists to make behavior correct.

UI exists to communicate intent.

Those are different responsibilities.

When UI consumes raw state, it inherits all of the complexity of the system.

That complexity spreads quickly.

A small internal change becomes a breaking UI change.  
A refactor requires touching every component.  
Behavior leaks into templates.

Projection exists to stop that.

---

## A boundary that changes everything

With projection, the UI does not ask:

Are we in the loading state?  
Are we refreshing?  
Did this transition happen already?

Instead, it receives:

- isLoading
- canRetry
- items
- errorMessage
- actions it is allowed to invoke

The UI renders meaning.  
Nothing else.

---

## Why this layer is usually missing

Most frameworks do not force you to create a projection layer.

So people skip it.

They reach into state because it is convenient.  
They branch on internals because they are available.

That convenience compounds into coupling.

By the time it hurts, the dependency graph is already tangled.

---

## Projection is not presentation logic

This distinction matters.

Projection does not decide behavior.  
It does not trigger effects.  
It does not manage lifecycle.

It is a pure transformation.

Given the current state of the actor, projection produces a view of the world that the UI can safely consume.

Nothing more.

---

## A practical example

Imagine a data query.

Internally, the system might have states like:

- idle
- loading
- success
- error
- refreshing

The UI does not need to know that.

The UI needs to know:

- do I show a spinner?
- do I show stale data?
- can the user retry?
- should this button be disabled?

Projection answers those questions once.

Every component benefits.

---

## Why projection improves refactoring

When projection exists, internal behavior can change without breaking the UI.

You can add states.  
You can refine transitions.  
You can introduce new policy.

As long as projection stays stable, the UI remains untouched.

That stability is rare, and it is valuable.

---

## Projection is where intent becomes visible

This is one of the quiet benefits.

Projection forces you to name what matters.

If you cannot explain what the UI should see in simple terms, behavior is probably unclear.

Projection becomes a mirror.

It reflects whether your system actually makes sense.

---

## What happens without projection

Without projection, UIs become brittle.

They depend on implementation details.  
They break during refactors.  
They duplicate logic across components.  

Eventually, no one knows which parts of the UI are safe to change.

That is not a styling problem.

It is a boundary problem.

---

## The calm effect

Systems with projection feel calmer to work in.

Components are simpler.  
Tests are easier to write.  
Behavior changes feel contained.

The UI stops being a second behavior engine.

That alone is worth the cost of the layer.

---

## Final thought

Projection is the final boundary between behavior and presentation.

It protects the UI from the complexity it should never have to understand.

When that boundary is explicit, systems become easier to change, easier to explain, and easier to trust.

---

## Next in the series

Next, we’ll put everything together.

We’ll walk through a full example using **ignite-query**, end to end, and show how behavior, actors, shells, adapters, and projection fit together in real code.

This is where the model becomes tangible.
