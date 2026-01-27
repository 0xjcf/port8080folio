---
title: "How Adapters Fail"
description: "The failures that hurt most weren’t missing boundaries, but boundaries that quietly leaked responsibility back into the system."
date: 2025-01-04
pubDate: 2025-01-04
edition: 9
series: "Behavior & Boundaries"
tags:
  - architecture
  - boundaries
  - adapters
  - responsibility
  - systems-thinking
draft: true
---

By the time I heard teams talk about adapters, it was usually too late.

The system technically has boundaries.
The diagrams look right.
The architecture *appears* clean.

And yet, something still feels wrong.

I kept noticing that feeling even in systems that looked disciplined on paper.

This essay is about **how adapters fail**, even when they exist.

---

## The illusion of separation

Adapters often fail quietly.

Not because they’re missing,
but because they’ve been asked to do *too much*.

A fetch wrapper becomes a retry engine.
A persistence adapter starts caching.
A messaging bridge begins filtering business rules.

Nothing breaks immediately.

Everything still works.
Tests still pass.
The UI still renders.

But responsibility has already leaked.

---

## A moment of recognition

You might already be here if:

* you added a timeout “just to be safe”
* retries exist in more than one place
* test order affects outcomes
* behavior feels timing-sensitive instead of rule-driven

None of this looks like an architectural failure at first.

It looks like caution.

Until it isn’t.

---

## Failure mode #1: Adapters that decide

The first and most common failure is this:

**Adapters start making decisions.**

They don’t just report outcomes.
They interpret them.

They decide:

* whether a failure is “important”
* whether a retry should happen
* whether a value is “valid enough” to forward

At that point, the adapter has crossed the boundary.

It’s no longer translating facts.
It’s shaping behavior.

**And now behavior exists in two places.**

---

## Failure mode #2: Bidirectional knowledge

Adapters are meant to know *about* the outside world.

They are **not** meant to know about the internals of the system.

But over time, they often do.

You’ll see adapters that:

* import domain types
* branch on internal states
* special-case logic “just for this machine”

The dependency direction flips.

Instead of:

> System → Adapter

You get:

> Adapter ↔ System

That loop is subtle, and it eventually breaks clarity.

Once dependency direction is unclear, boundaries stop protecting anything.

---

## Failure mode #3: Time leaks inward

Time is an environmental force.

Retries.
Timeouts.
Debouncing.
Polling.
Backoff strategies.

These are all *outside-the-system* concerns.

But when adapters fail, time leaks inward:

* machines wait on timers
* state assumes sequencing
* behavior becomes temporal instead of declarative

Once behavior depends on *when* something happens, rather than *what* happened, determinism is gone.

And without determinism, systems become impossible to reason about.

This is why non-reproducible bugs appear even when “nothing changed.”

---

## Failure mode #4: Shared state sneaks back in

Adapters often reintroduce shared state accidentally.

A cached value.
A mutable client.
A singleton connection.

It starts innocently, usually for performance.

But now:

* multiple actors depend on the same mutable thing
* order matters again
* invisible coupling returns

This is why **messages tended to scale better than shared state for me**, not as a stylistic preference, but as a survival strategy.

When adapters leak shared state, they undo that advantage.

---

## The pattern underneath every failure

Every adapter failure I ran into shared the same root cause:

**Responsibility drift.**

Adapters exist to *refuse* responsibility.

When they accept it, even temporarily, the system loses its clarity.

Behavior becomes harder to test.
Failures become harder to reproduce.
Change becomes risky.

The system still works.

But it no longer *holds*.

---

## The discipline adapters require

A good adapter is intentionally boring.

It should:

* observe the world
* report what happened
* send messages
* do nothing else

No decisions.
No domain logic.
No internal knowledge.

That discipline feels restrictive at first.

But it’s what allows behavior to remain stable while everything else changes.

---

## Why this matters more over time

Adapter failures rarely show up in v1.

They surface in v3.
In the second rewrite.
During scale.
Under stress.

That’s why they’re so dangerous.

They don’t break systems immediately.

They erode trust slowly.

---

## A final clarification

None of this requires perfect foresight.

These failures aren’t moral mistakes or design incompetence.

They’re the natural result of unmodeled forces.

Once you can name how adapters fail, you can design systems that resist that drift.

---

## What comes next

So far, we’ve talked about:

* why boundaries matter
* why adapters exist
* how adapters fail

The next question is unavoidable:

**How do you know where a boundary belongs in the first place?**

Next in *Behavior & Boundaries*:
**[Lifecycle Is the Real Boundary](/writing/lifecycle-is-the-real-boundary/)**

## Series Context

This essay builds on:

* [Why Adapters Exist](/writing/why-adapters-exist/)

Related deep dives:

* [Errors as Data](/writing/errors-as-data/)

## Further Reading
