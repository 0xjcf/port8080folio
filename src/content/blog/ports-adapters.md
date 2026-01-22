---
title: Ports and Adapters
description: Why infrastructure should be replaceable, not influential.
date: 2025-01-20
pubDate: 2025-01-20
edition: 6
series: "Behavior & Boundaries"
tags:
  - architecture
  - statecharts
  - actor-model
  - boundaries
  - systems-thinking
draft: false
---

## Ports and Adapters

At this point, we have behavior, actors, and an imperative shell.

The system knows what should happen.  
It has a place where that behavior lives.  
It has a way to talk to the world without letting chaos leak inward.

Now we need to deal with a quieter problem.

Infrastructure changes.

---

## The real problem with infrastructure

Libraries get replaced.  
APIs evolve.  
Vendors change pricing.  
New standards appear.  
Old assumptions break.

Most of the systems I worked on were not designed for this.

Instead, infrastructure slowly becomes *part of the behavior*, even when no one intended it to.

That is where ports and adapters come in.

---

## What a port actually is

A port is not a library.

A port is not an implementation.

The simplest definition that held up for me is this:

A port is simply a **contract**.

It answers one question:

What does the system need from the outside world in order to behave correctly?

Nothing more.

No performance assumptions.  
No vendor-specific concepts.  
No runtime details.

Just the shape of the interaction.

---

## What an adapter actually is

In practice, the adapter is how that contract gets fulfilled.

It knows about:

- APIs
- protocols
- runtimes
- libraries
- quirks

It translates those details into something the system understands.

Adapters are concrete.  
Ports are abstract.

That distinction kept mattering more than I expected.

---

## Direction matters

Ports face inward.

They are defined in terms the system understands.

Adapters face outward.

They deal with whatever the world happens to look like today.

When I reversed that direction, infrastructure started rewriting behavior.

It never ended well.

Here’s the shape I keep in mind:

```mermaid
flowchart LR
  Core["Functional core"]
  Port["Port (contract)"]
  Adapter["Adapter (concrete)"]
  World["External world"]

  Core --> Port
  Port --> Adapter
  Adapter --> World
```

And the contract usually looks something like this:

```ts
type DataPort = {
  load(): Promise<Result>;
  subscribe(onChange: (data: Result) => void): () => void;
};
```

---

## A practical example

Think about a data query.

The system might need:

- a way to subscribe to updates
- a way to trigger a refresh
- a snapshot of the current result

That is the port.

It does not care if the data comes from:

- TanStack
- fetch
- GraphQL
- WebSockets
- local storage

Those are adapter concerns.

The port stays the same even when everything else changes.

---

## Adapters report facts

This is the rule that kept things sane for me.

Adapters report facts.  
They do not make decisions.

An adapter can say:

- data arrived
- an error occurred
- a request is in flight
- a connection was lost

It cannot say:

- we are loading
- we should retry
- the UI should block
- this error is fatal

Those are behavior decisions.

They belong in the functional core.

---

## Why adapters must stay boring

Boring adapters are a feature.

When adapters are simple:

- they are easy to replace
- they are easy to test
- they are easy to reason about
- they do not accumulate hidden logic

Every time adapters got clever for me, they became sticky.

And once infrastructure becomes sticky, behavior becomes trapped.

---

## Ports protect the core from drift

Without ports, every infrastructure choice I made leaked inward.

A new API requires new behavior.  
A runtime change forces a refactor.  
A library update breaks assumptions.

Ports act as a buffer.

They make it possible to change how the system connects to the world without redefining what the system *is*.

---

## This is not abstraction for abstraction’s sake

It looked that way to me at first.

Why not just call the library directly?

Because direct calls become dependencies.  
Dependencies become assumptions.  
Assumptions become behavior.

Ports and adapters exist to keep those assumptions out of places where they do not belong.

---

## Where ports live

Ports belong close to the functional core.

They are part of the system’s vocabulary.

Adapters belong at the edges.

They are allowed to be replaced, rewritten, or removed entirely.

That physical separation reinforces the conceptual one.

---

## The quiet benefit

When we kept ports and adapters consistent, something subtle happened.

Infrastructure stopped being scary.

You can experiment without fear.  
You can swap libraries without rewrites.  
You can isolate failures without cascading effects.

The system becomes resilient not because it is clever, but because it is honest about where responsibilities live.

---

## Final thought

Ports define what the system needs.

Adapters deal with how the world provides it.

Keeping those two apart is one of the simplest ways to prevent infrastructure from quietly taking control.

---

## Next in the series

Next, we’ll talk about **projection**.

The layer that translates internal state into UI meaning, and the one most systems never explicitly name.

That omission turns out to be far more costly than it looks.

## Series Context

This essay builds on:

- [Why Adapters Exist](/writing/why-adapters-exist/)

Related deep dives:

- [The Imperative Shell](/writing/imperative-shell/)

## Further Reading

- Alistair Cockburn — Hexagonal Architecture ([Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/))
- Eric Evans — Domain-Driven Design ([Domain-Driven Design](https://www.domainlanguage.com/ddd/reference/))
- Robert C. Martin — Clean Architecture ([Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html))
