---
title: "Why Adapters Exist"
description: "Adapters are not utilities. They are responsibility boundaries that keep behavior stable while the world changes."
data: 2025-01-04
pubDate: 2025-01-04
edition: 5
series: "Behavior & Boundaries"
tags:
  - architecture
  - boundaries
  - adapters
  - statecharts
  - actor-model
draft: false
---

Writing code is no longer the hard part.

That argument was made in the previous essay, and it stands.

What matters now is not *how fast* we can generate code, but **where responsibility is allowed to live once the code exists**.

This essay focuses on the boundary that kept deciding that outcome for me:

**Adapters.**

---

## The quiet failure mode

The architectural failures I kept seeing didn’t start as bugs.

They started as *convenience*.

A network call slips into a state machine.
A timer sneaks into a reducer.
A retry policy gets embedded “just this once.”

Everything still works.
Tests still pass.
The UI still renders.

But responsibility has already leaked.

This is the point where many teams stop looking because nothing is visibly broken.

---

## The familiar example

You’ve probably written a machine like this:

```ts
createMachine({
  initial: "idle",
  states: {
    idle: {
      on: { LOAD: "loading" }
    },
    loading: {
      invoke: {
        src: () => fetch("/api/data").then(r => r.json()),
        onDone: { target: "success" },
        onError: { target: "error" }
      }
    },
    success: {},
    error: {}
  }
});
```

This code is valid.
It even looks *well-structured*.

At first glance, nothing seems wrong.

But look closer.

That machine now:

* knows about the network
* depends on the browser environment
* hides failure semantics inside an effect
* cannot be replayed deterministically

At some point, the machine stopped describing **behavior** and started performing **external interaction**.

That’s the moment the boundary collapsed.

---

## State machines didn’t cause this

They just made it easier to hide.

Frameworks like XState gave us a powerful language for modeling behavior, something frontend systems desperately needed.

What they *cannot* decide is where responsibility belongs.

That decision is architectural.
And it still belongs to the people building the system.

---

## The instability I couldn’t debug

While building ignite, I kept running into the same feeling:

> “The logic is correct… so why does this system feel unstable?”

The answer wasn’t tooling.

It was responsibility.

I was mixing concerns that **evolve at different speeds** as if they were the same thing.

Behavior changes slowly.
Environments change constantly.

Adapters exist to keep those forces apart.

---

## What an adapter actually is

This is where the definition usually goes wrong.

An adapter is not a utility.
It’s not a helper.
It’s not an abstraction for reuse.

The only definition that kept holding up for me was this:

An adapter is a **responsibility boundary**.

Its job turned out to be simple:

* interact with the external world
* translate outcomes into events
* report facts back to the system
* never own behavior

When adapters disappear, behavior absorbs responsibility it cannot safely carry.

This is why retries creep into hooks, why machines start “knowing” about HTTP, and why caches quietly become shared state.

The adapter didn’t vanish.
It dissolved into places never meant to hold responsibility.

---

## Behavior becomes boring again

Once that boundary is restored, the machine simplifies:

```ts
createMachine({
  initial: "idle",
  context: {
    data: null,
    error: null
  },
  states: {
    idle: {
      on: { LOAD: "loading" }
    },
    loading: {
      on: {
        DATA_LOADED: {
          target: "success",
          actions: assign({
            data: ({ event }) => event.data,
            error: () => null
          })
        },
        FAILED: {
          target: "error",
          actions: assign({
            error: ({ event }) => event.error
          })
        }
      }
    },
    success: {},
    error: {}
  }
});
```

No side effects.
No environment assumptions.
Just behavior.

Deterministic.
Inspectable.
Replayable.

---

## The adapter does the messy work

```ts
fetchData()
  .then((data) => {
    actor.send({ type: "DATA_LOADED", data });
  })
  .catch((error) => {
    actor.send({ type: "FAILED", error });
  });
```

The machine never calls this.

It only reacts to events.

That separation is the point.

---

## Projection completes the boundary

Without a projection layer, boundaries still leak, this time into the UI.

A projection translates internal state into meaning:

```ts
igniteCore({
  source: actor,

  states: ({ snapshot }) => ({
    mode: snapshot.value,
    data: snapshot.context.data
  }),

  commands: ({ actor }) => ({
    load: () => actor.send({ type: "LOAD" })
  })
});
```

The UI doesn’t see transitions or internals.

It sees intent.

---

## A moment of recognition

You might already see this if:

* retries live in more than one place
* effects depend on timing instead of events
* test order changes outcomes
* a hook “just knows” too much

None of this feels like an architectural decision, until it is.

---

## Why adapters matter now

AI is excellent at generating code that *works*.

It accelerates scaffolding, refactors, and experimentation.

What it does not provide is judgment about where responsibility should stop.

That judgment is architectural.

And it can be learned.

---

## Series continuation

Next in *Behavior & Boundaries*:
**[How Adapters Fail](/writing/how-adapters-fail/)**

## Series Context

This essay builds on:

* [Actors](/writing/actors/)

Related deep dives:

* [Errors as Data](/writing/errors-as-data/)

## Further Reading

* Alistair Cockburn — Hexagonal Architecture ([Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/))
* Robert C. Martin — Clean Architecture ([Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html))
