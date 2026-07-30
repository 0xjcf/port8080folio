---
title: "Product Framing Before Software Design: Deciding What to Build"
description: "How I use a product frame as the maintainer of Ignite Element, and how developers can apply the same questions to problems for their own clients and users."
pubDate: 2026-07-28
updatedDate: 2026-07-30
edition: 1
revision: 8
seriesOrder: 2
series: "Behavior & Boundaries"
tags:
  - architecture
  - product-thinking
  - responsibility
  - boundaries
  - evidence
draft: false
---

A clean boundary can protect the wrong behavior just as effectively as the right one.

That is uncomfortable because architectural improvements produce satisfying evidence. The code becomes easier to test. Responsibilities become clearer. Two interfaces can use the same contract. We can point to the result and say, "This is better."

Sometimes it is.

But better architecture only tells us that the implementation matches our decision more clearly. It does not tell us whether the decision was worth making.

I am approaching this from my role as the maintainer of [Ignite Element](https://0xjcf.github.io/ignite-element/). The developer using the library is my direct user. That developer may be building for a client, an internal product team, or the people who eventually use the application.

I ran into this after cleaning up the `startModule` command from the previous article:

```ts
startModule(moduleId);
```

The caller now supplied the module ID directly. A browser binding and a headless test could express the same intent without recreating an HTML element.

That fixed a real ownership problem.

It did not prove that starting a module was the right behavior to build.

## The refactor answered one question

The headless test gave us useful evidence. It had to construct an element and attach `data-module-id` before it could say which module should start. The test was recreating presentation markup to communicate application intent.

Changing the command answered a narrow question:

> Can more than one interface express the same request without depending on one browser view?

We could verify the answer with tests. Both callers passed a module ID, sent the same event, and reached the same behavior.

That is implementation evidence.

It does not prove that developers understand the API faster, make fewer mistakes, or prefer the new contract. It does not tell us whether starting a module solves the most important problem in their workflow. Those are different claims, and they require different evidence.

This distinction is easy to lose when implementation is inexpensive. We can move from an idea to a polished component before we have written down the problem we think the component solves.

The code begins to look settled while the product decision still rests on assumptions.

## Start with progress, not a command

"The system needs a start command" sounds like a requirement, but it already assumes the solution.

Before behavior, I want to know:

- Who is trying to make progress?
- What are they trying to accomplish?
- What makes that difficult today?
- What would be different if we helped?

In this example, the frame begins at the boundary between Ignite Element and the developer using it. I am trying to understand how that developer exercises component behavior through the different environments the library supports. During normal development, they might use a rendered browser control. In a test, they might use the [headless runtime](https://0xjcf.github.io/ignite-element/api/headless-runtime/). In both cases, they wanted to start a particular module and observe what the application did.

The difficulty I actually observed was narrower: the headless test had to fabricate DOM state before it could make that request.

That is enough to investigate. We do not need to inflate one awkward test into a universal claim about every developer, test, or component system. We only need to describe what we know precisely enough to decide what to try next.

I have found it useful to capture that understanding in a small product frame.

## A product frame makes assumptions visible

The frame is not a requirements document. It is a compact record of the problem as we currently understand it, including the places where we may be wrong.

For `startModule`, I would write:

| Part | Current statement |
| --- | --- |
| Person and context | A developer using Ignite Element to invoke module behavior from a browser binding or headless test |
| Desired progress | Start a chosen module and inspect the resulting behavior |
| Observed difficulty | The headless test had to fabricate DOM state to provide the module ID |
| Known constraint | Starting a module requires an explicit module ID |
| Hypothesis | A presentation-independent command will make the behavior easier to exercise from more than one interface |
| Outcome signal | Developers can express the operation without learning or recreating an unrelated presentation contract |

The person, desired progress, difficulty, and constraint come from the workflow we encountered. The hypothesis describes the change we believe will help. The outcome signal tells us what improvement we expect to observe.

Those lines should not quietly trade places.

A hypothesis does not become a fact because the implementation works. An outcome signal is not "the pull request merged." If we cannot distinguish what we observed from what we hope will improve, the frame only gives uncertainty a more official-looking format.

The point is not to sound certain. The point is to make the uncertainty inspectable.

## The frame can repeat at each layer

The developer is my direct user in this example, but they are not necessarily the last person affected by the design. They may use Ignite Element to build an application for a client, a product team, or an end user with a different problem.

The same product frame can be applied again at each layer:

| Frame owner | Person in focus | Progress being investigated |
| --- | --- | --- |
| Ignite Element maintainer | Developer using the library | Express and test the same application behavior across supported environments |
| Application developer or team | Client, stakeholder, or operator | Represent the workflow and rules the application needs to support |
| Product team or client | End user | Complete a real task with less friction |

The chain will differ by product. The important part is that evidence from one layer does not automatically validate the next. A passing headless test gives me evidence about the Ignite Element contract. It does not prove that a client's workflow is correct or that an end user benefits from the behavior.

Each layer needs its own person, desired progress, observed difficulty, hypothesis, and outcome signal. The questions repeat. The answers do not.

## Correct behavior and helpful behavior need different evidence

Architecture and product discovery validate different things.

| Question | Useful evidence |
| --- | --- |
| Did we implement the behavior we agreed to? | Transition tests, traces, contracts, and observable state |
| Did the behavior help with the problem we described? | Observation, feedback, usage, and outcome signals |

Passing the first test does not answer the second.

A state machine can enforce a workflow perfectly while the workflow remains confusing. A provider-neutral adapter can isolate an integration while the application still models the provider's process instead of the user's progress. A polished interface can make the wrong next step easier to click.

None of those are failures of architecture. They are reminders that architecture protects a decision from implementation churn. It does not transform that decision into product truth.

This is why the frame belongs before behavior. It keeps the reason for the behavior close enough that we can still question it.

## Turn the frame into a narrative

The frame gives us the pieces of the problem, but it does not yet describe the interaction.

For this example, the narrative might be:

> A developer wants to start a selected module while exercising the application from different interfaces. They should be able to identify the module directly instead of reconstructing how one browser view stores that value.

That sentence gives us more direction than "add a reusable command." It identifies who initiates the interaction, which value represents their intent, and which presentation detail should remain outside the application contract.

It also leaves the implementation open.

The narrative does not require XState, Ignite Element, a DOM attribute, or a particular test helper. Those choices belong later, after we agree on the progress the behavior should support.

This is where product framing begins to constrain architecture without designing it. The narrative gives us a reason to reject a contract that forces every caller to impersonate the current UI, but it does not prescribe the final command, event, or actor.

## The frame guides behavior but does not govern it

There is an important boundary here.

The product frame explains why we are considering a behavior. It is not a second runtime authority.

Once a team accepts the behavior, the application still needs one place that decides whether a request is allowed now, how state changes, which work begins, and what completion or failure means. Those decisions belong to authoritative behavior and policy.

The reverse is also true. A state machine can enforce an accepted rule, but it cannot tell us whether the original product frame was sound.

The frame may change because we learn something new. The runtime should not reinterpret policy every time a product assumption changes in a document. We use new evidence to make a deliberate product decision, then change the authoritative behavior through the same explicit process as any other rule.

Keeping these responsibilities separate prevents two mistakes:

- treating implementation correctness as product validation
- treating a product narrative as executable policy

The frame gives behavior a reason. The behavior gives the running system authority.

## Keep it small enough to change

This should not become a ceremony before every function.

I use a product frame when a change introduces or alters visible behavior, commits the application to a policy, or creates a boundary that other parts of the system will depend on.

For many changes, six short lines are enough:

```text
Person and context:
Desired progress:
Observed difficulty:
Known constraint:
Hypothesis:
Outcome signal:
```

The most valuable line is often Hypothesis. It records what we expect to improve without presenting that expectation as a settled fact.

That makes later learning less defensive. If evidence contradicts the hypothesis, we can change the product decision without pretending the implementation was defective. The code may have done exactly what we asked. We simply learned that we should ask for something different.

A useful frame should make change easier, not make the original idea harder to question.

## A product-frame check

Before modeling behavior, I ask:

- Which layer of the product am I framing?
- Can I describe the person and their desired progress without naming the implementation?
- Which evidence belongs to this layer?
- Which part of the difficulty have we actually observed?
- Which part are we assuming?
- What outcome would support the hypothesis?
- What result would make us reconsider it?
- Does the proposed request express the person's intent or a detail of the current interface?

For `startModule`, the improvement was not merely that we found a cleaner function signature. The signature was useful because it matched the intent described by the product frame.

That still does not give every caller permission to mutate state. "Start this module" is a request. The application needs a smaller semantic command that can cross into authoritative behavior and be accepted or rejected according to its rules.

## Next in the series

The product frame gives us the context. The narrative describes the interaction. Neither one is a message the application can execute.

The next post, [*From Narrative to Semantic Command*](/writing/narrative-to-semantic-command/), follows that translation and asks what the application should receive when a person clicks a button, a test invokes a function, or another interface requests the same behavior.
