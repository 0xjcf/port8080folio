---
title: Workflows
description: How intent turns into progress over time.
date: 2025-01-20
pubDate: 2025-01-20
edition: 10
series: "Behavior & Boundaries"
tags:
  - architecture
  - statecharts
  - actor-model
  - boundaries
  - systems-thinking
draft: false
---

## Workflows

So far, we’ve talked about structure.

Behavior defines rules.  
Actors own state.  
Adapters talk to the world.  

But systems are not static.

Users start things.  
Processes unfold.  
Steps happen in sequence.  

That progression is a workflow.

I missed it at first because the sequence was smeared across code long before it had a name.

---

## What a workflow actually is

A workflow describes how intent moves through the system over time.

It answers questions like:

- What starts this interaction?
- What happens next?
- What can fail?
- What can retry?
- When is this done?

A workflow is not a screen.
It is not a request.
It is not a component.

It is the shape of progress.

---

## Workflows are not business logic

This distinction took me a while to see.

Business logic answers:

- Is this allowed?
- What state should we move to?
- What rules apply?

Workflows answer:

- In what order do things happen?
- What triggers what?
- What happens when something completes or fails?

That separation keeps behavior reusable.

---

## Where workflows live

Workflows live in the **imperative shell**.
That’s where they ended up once I started looking for them on purpose.

They coordinate:

- sending commands to actors
- invoking adapters
- waiting for results
- reacting to outcomes

They do not:

- decide policy
- interpret meaning
- mutate state directly

They sequence. Nothing more, and that restraint keeps them useful.

---

## A concrete example

Think about loading data.

The workflow might be:

1. Receive a load command
2. Tell the actor loading has started
3. Invoke the adapter
4. Wait for a result
5. Send success or failure back to the actor

Each step is simple.
The value comes from the ordering.

Here’s that sequence when I map it out:

```mermaid
sequenceDiagram
  participant User
  participant Shell as Workflow / Shell
  participant Adapter
  participant Actor

  User->>Shell: load
  Shell->>Actor: LOADING
  Shell->>Adapter: fetch
  Adapter-->>Shell: data | error
  Shell->>Actor: DATA_LOADED | FAILED
  Actor-->>Shell: derived state
  Shell-->>User: meaning / next step
```

---

## Why workflows must be explicit

When workflows were implicit for me, they leaked.

They spread across:

- components
- hooks
- services
- callbacks

No one owns the sequence.
No one can explain the flow end to end.

Explicit workflows make progress visible and intentional.

---

## Workflows and actors

Actors hold state during a workflow.

They answer:

- What state are we in right now?
- What transitions are allowed next?

Workflows ask the actor for permission.
They do not override it.

That relationship keeps sequencing flexible and behavior stable.

---

## Final thought

Workflows are how time enters the system.

They turn static rules into living processes.

When workflows are explicit, systems feel intentional instead of accidental.

---

## Next in the series

Next, we’ll talk about **delivery adapters**.

The layer that translates the outside world into the first step of a workflow, and why confusing it with behavior causes subtle but serious problems.

## Series Context

This essay builds on:

- [The Imperative Shell](/writing/imperative-shell)

Related deep dives:

- [Errors as Data](/writing/errors-as-data)

## Further Reading

- Hector Garcia-Molina, Kenneth Salem — Sagas ([Sagas](https://www.cs.cornell.edu/andru/cs711/2002fa/reading/sagas.pdf))
