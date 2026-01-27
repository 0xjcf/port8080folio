---
title: The Imperative Shell
description: Why side effects need coordination, not control.
date: 2025-01-20
pubDate: 2025-01-20
edition: 8
series: "Behavior & Boundaries"
tags:
  - architecture
  - statecharts
  - actor-model
  - boundaries
  - systems-thinking
draft: true
---

## The Imperative Shell

So far, we’ve talked about behavior and ownership.

The functional core defines what should happen.  
Actors give that behavior a place to live over time.

But none of that does anything on its own.

At some point, the system has to talk to the world.

That is where the imperative shell comes in.

I didn’t start with it as a diagram.
I noticed it after side effects kept drifting through everything else.

---

## The part everyone underestimates

In the systems I saw fall over, bad logic wasn’t the culprit.

Side effects slowly took over instead.

Network calls creep into behavior.  
Subscriptions get scattered across components.  
Timers and retries appear wherever they feel convenient.  

Nothing breaks immediately.

Things just get harder to reason about.

The imperative shell exists to prevent that.

---

## What the imperative shell actually is

The imperative shell is not a dumping ground for messy code.

It has a very specific job:

To coordinate side effects without being allowed to decide behavior.

That means the shell can:

- subscribe and unsubscribe
- call APIs
- start and stop things
- sequence effects
- manage lifecycles

But it cannot:

- decide what a state means
- decide when something is allowed
- interpret success or failure
- encode UI rules

Those decisions belong elsewhere.

---

## Orchestration, not logic

This distinction matters.

The shell is about orchestration.

It wires things together.

It listens for facts from the outside world and reports them inward.  
It listens for decisions from behavior and makes them real.

It is a translator and a coordinator.

Not a judge.

Here’s the orchestration I keep in mind when I draw it:

```mermaid
sequenceDiagram
  participant UI as Delivery / UI
  participant Shell as Imperative Shell
  participant Adapter as Adapter
  participant Actor as Actor

  UI->>Shell: intent / command
  Shell->>Adapter: execute side effect
  Adapter-->>Shell: fact / result
  Shell->>Actor: event
  Actor-->>Shell: decision
  Shell-->>UI: derived meaning
```

---

## Why the shell must be thin

If the shell grows large, it becomes a second brain.

And two brains means disagreement.

When logic crept into the shell, I started seeing things like:

- special cases based on timing
- retries that only happen sometimes
- hidden assumptions about state
- behavior that cannot be replayed

At that point, determinism was already gone.

Keeping the shell thin was the only way I kept it from becoming a second brain.

---

## The shell is where nondeterminism lives

This is important.

The world is nondeterministic.

Networks fail.  
Events arrive out of order.  
Time passes.  
Things restart.

The functional core must be protected from all of that.

The shell absorbs the chaos so behavior does not have to.

It turns unpredictable inputs into explicit events.

Over time, that translation became the whole job.

---

## A concrete example

Think about a data query.

The shell might:

- subscribe to a query runtime
- receive updates when data changes
- trigger refetches when told to
- clean up when the actor stops

But when data arrives, the shell does not decide what that means.

It does not decide whether this is loading or refreshing.  
It does not decide whether the UI should show a spinner.  
It does not decide whether retries are allowed.

It just reports facts.

---

## The shell is not an adapter

This is a common point of confusion.

Adapters talk to specific systems.

The shell talks to adapters.

Adapters translate protocols.  
The shell coordinates lifecycles.

They are related, but not interchangeable.

When these two got merged, the systems I worked on became brittle very quickly.

---

## Why this layer is often missing

In most codebases I worked in, no one named the imperative shell.

As a result, it ends up smeared across:

- components
- hooks
- services
- effects
- middleware

Nothing owns it.

And when no one owns the shell, side effects end up everywhere.

Naming the shell is the first step to containing it.

---

## What changes when the shell is explicit

Once the shell is explicit, a few things become easier.

Behavior becomes testable without infrastructure.  
Adapters become swappable.  
Lifecycle becomes predictable.  
Cleanup becomes intentional.

Most importantly, the system regains a clear direction of responsibility.

---

## The order matters

One of the most common mistakes I made was designing the shell first.

I’d pick a library.  
Wire it up.  
Add effects.  

Then try to reason about behavior after the fact.

That ordering was backwards for me.

Behavior first.  
Actors second.  
Shell last.

That sequence kept the shell honest.

---

## Final thought

The imperative shell is not glamorous.

It is not clever.

It is not where ideas should live.

Its value comes from restraint.

When the shell does only what it must, the rest of the system stays understandable.

---

## Next in the series

Next, we’ll talk about **ports and adapters**.

Not as an abstract architecture pattern, but as a practical way to keep infrastructure from rewriting your system over time.

That boundary is where most systems quietly lose their flexibility.

## Series Context

This essay builds on:

- [Errors as Data](/writing/errors-as-data/)

Related deep dives:

- [Workflows](/writing/workflows/)

## Further Reading

- Scott Wlaschin — Moving I/O to the Edges ([Moving I/O to the Edges](https://www.youtube.com/watch?v=P1vES9AgfC4))
- Gregor Hohpe, Bobby Woolf — Enterprise Integration Patterns ([Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/))
