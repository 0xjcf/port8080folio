---
title: The Functional Core
description: Why deterministic behavior is the only stable foundation when everything else keeps changing.
date: 2025-01-20
pubDate: 2025-01-20
edition: 3
series: "Behavior & Boundaries"
tags:
  - architecture
  - statecharts
  - actor-model
  - boundaries
  - systems-thinking
draft: true
---

## The Functional Core

When I first heard “functional core,” I assumed it meant functional programming.

It didn’t.

This isn’t about monads, immutability, or academic purity.

It’s about **determinism**.

More specifically, I needed a place in the system where behavior stayed predictable no matter what the world was doing around it.

---

## What problem the functional core actually solves

In the systems I struggled with, the code wasn’t the failure point.

They failed because no one could answer simple questions anymore:

- What state are we in right now?
- What is allowed to happen next?
- Why did this screen end up like this?
- Is this behavior intentional or accidental?

When behavior is spread across components, effects, callbacks, and adapters, those questions become impossible to answer confidently.

The functional core exists to stop that drift.

It is the part of the system where I decide what should happen, without actually doing anything.

---

## Determinism over time

The key idea is not purity in the mathematical sense.

It’s **determinism over time**.

If I replay the same sequence of events, I should get the same outcome.

Every time.

That became the contract.

That’s what let me reason about behavior instead of debugging symptoms.

---

## What lives in the functional core

In the systems I build now, the functional core contains:

- explicit states
- explicit transitions
- guards and rules
- decisions about what is allowed and what is not

That list stays short on purpose.

No network calls.  
No timers.  
No subscriptions.  
No environment knowledge.

Just behavior.

---

## Why state machines fit this role so well

State machines forced me to answer uncomfortable questions up front.

What states actually exist?  
What events are allowed?  
What transitions are valid?  
What happens if something unexpected arrives?

I couldn’t hand-wave these away.

That friction is a feature.

It pushed behavior into a place where it could be seen, named, and tested.

This is why state machines work so well as a functional core, even if the rest of the system is not “functional” at all.

---

## A concrete example

Consider a simple data loading flow.

Not the code. The behavior.

Are we idle?  
Are we loading for the first time?  
Are we refreshing existing data?  
Did something fail?  
Can the user retry?

Those questions have nothing to do with fetch, TanStack, or Web3.

They are pure behavior.

That behavior belongs in one place, and one place only.

Here’s that shape when I draw it out:

```mermaid
stateDiagram-v2
  [*] --> idle
  idle --> loading: LOAD
  loading --> success: DATA_LOADED
  loading --> error: FAILED
  success --> loading: REFRESH
  error --> loading: RETRY
````

---

## What does not belong in the functional core

This is just as important.

The functional core should not:

- call APIs
- read from storage
- subscribe to observers
- decide how often to retry
- depend on the browser, the network, or the wallet

Every time I let those in, determinism was gone.

At that point, behavior started depending on timing, environment, and side effects.

That’s how systems became fragile even when they looked clean.

---

## When behavior stops being interchangeable

There’s another failure mode I kept running into, even after I moved logic into a “core.”

Things looked deterministic on the surface, but something still felt off.

Swapping an adapter would subtly change behavior.

A mock behaved differently than production.
A new transport required conditionals upstream.
A retry policy leaked into places that weren’t supposed to care.

Nothing crashed.

But behavior stopped being interchangeable.

And once that happened, reasoning collapsed again.

If the system needs to know *where* behavior runs in order to be correct, then behavior isn’t actually centralized.

It’s just hidden.

---

## The functional core is where substitution is enforced

There’s a formal name for this idea.

Barbara Liskov called it *substitution*.

I didn’t learn it that way.

I ran into it by breaking systems.

What I eventually realized was simple:

If two implementations can produce different decisions for the same inputs, then they are not interchangeable — no matter how clean the abstraction looks.

The functional core is the place where that constraint gets enforced.

Same inputs.
Same rules.
Same outcomes.
Same failure meanings.

Not similar.
Not “close enough.”

Identical.

Once that clicked, the role of the core became clearer.

It wasn’t just about determinism.

It was about **protecting meaning**.

---

## Why the imperative shell exists at all

This is where the rest of the system finally makes sense.

The shell exists to absorb volatility.

Networks fail.
Timing varies.
Infrastructure changes.
Vendors get replaced.

The shell handles all of that.

But it does not decide what those things *mean*.

Retries don’t change rules.
Transport doesn’t change validity.
Failures don’t invent new outcomes.

The shell executes.
The core decides.

If an adapter needs special rules, the contract is lying.

---

## Where actors fit into this picture

At this point, something important becomes obvious.

The functional core decides what should happen — but it doesn’t live over time.

That’s where actors come in.

Actors exist because behavior doesn’t just happen once.

It evolves.
It retries.
It fails and recovers.
It needs to remember what happened before.

An actor gives that behavior a place to live without leaking it into the environment.

But the same substitution rule still applies.

If two actors accept the same messages but interpret them differently, they are not interchangeable.

The mailbox is a contract.

And the functional core is what keeps that contract honest.

---

## Behavior first, wiring second

One of the biggest shifts for me was changing the order of decisions.

I no longer start by asking:

How do I fetch this?
Which library should I use?
Where does this effect live?

I start by asking:

What states exist?
What transitions are valid?
What is allowed to happen next?
What must never happen?

Only after those answers are clear do I wire the system to the world.

That ordering mattered more than the tools.

---

## The functional core is not optional

You can build without this layer.

I did for years.

What I lost was the ability to reason locally.

Every change became global.
Every fix risked a regression.
Every refactor felt dangerous.

The functional core gave me a stable center when everything else changed.

And right now, everything else is changing fast.

---

## Why this matters more now

AI can generate code faster than we can review it.

That made determinism more valuable, not less.

If behavior is implicit, AI will happily reproduce your mistakes at scale.

If behavior is explicit, AI becomes a force multiplier instead of a liability.

The functional core is what makes that possible.

---

## Final thought

The functional core is not about style.

It’s about responsibility.

It is the place where behavior is owned, named, and protected.

Everything else exists to support it.

---

## Next in the series

Next, we’ll look at **actors**.

Not as a buzzword, but as the thing that gives behavior a lifecycle and a place to live over time.

That distinction turns out to matter more than most people expect.

---

## Series Context

This essay builds on:

- [Lifecycle Is the Real Boundary](/writing/lifecycle-is-the-real-boundary/)

Related deep dives:

- [Actors](/writing/actors/)

---

## Further Reading

- Gary Bernhardt — Functional Core, Imperative Shell
  [https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell](https://www.destroyallsoftware.com/screencasts/catalog/functional-core-imperative-shell)
- Scott Wlaschin — Moving I/O to the Edges
  [https://www.youtube.com/watch?v=P1vES9AgfC4](https://www.youtube.com/watch?v=P1vES9AgfC4)

---

### Why this version works (quick reassurance)

- **LSP is present** without being preachy  
- **Actors are introduced** without stealing their own essay  
- **Boundary language is implicit**, not repeated  
- **The AI argument reinforces**, not distracts  
- The article now forms a *clean bridge* between:
  - *Lifecycle Is the Real Boundary* → *Actors*

When you’re ready, next we can:

- tighten the **opening paragraph** for even more pull
- write the **Actors article intro** so the handoff is seamless
- or do a **final editorial pass** for publication polish (line-level)

This is strong work. You’re building a real through-line now.
