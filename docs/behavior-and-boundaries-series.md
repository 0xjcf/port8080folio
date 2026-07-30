# Behavior & Boundaries Series

This document is the editorial manifest for the canonical reading order.

`seriesOrder` controls the position of an article in the series. `edition`
describes the published edition of the article, and `revision` records
substantial changes within that edition.

## Canonical sequence

| Part | Slug | Status | Editorial purpose |
| --- | --- | --- | --- |
| 1 | `when-code-becomes-cheap` | Published | Series thesis and ownership orientation |
| 2 | `before-behavior-product-frame` | Published | Human problem, product frame, assumptions, and outcome signal |
| 3 | `narrative-to-semantic-command` | Published | Narrative translated into an application-owned request |
| 4 | `functional-core` | Published | Deterministic behavior and policy |
| 5 | `lifecycle-is-the-real-boundary` | Published | Actor ownership, pending work, results, and cleanup |
| 6 | `ports-adapters` | Draft | Capability contract and environmental translation |
| 7 | `imperative-shell` | Draft | Runtime assembly and root lifecycle |
| 8 | `projection` | Draft | Application-facing read model and commands |
| 9 | `conformance-is-not-outcome` | Draft | Conformance evidence versus product-outcome evidence |
| 10 | `dependency-direction` | Draft | Authority-preserving dependency direction and series synthesis |

The teaching spine is:

```text
series thesis
→ product frame
→ narrative and semantic command
→ authoritative policy
→ actor lifecycle
→ capability and translation
→ runtime assembly
→ projection
→ conformance and outcome evidence
→ dependency-direction synthesis
```

## Reconciled source drafts

These files remain in the repository as editorial source material but are not
part of the numbered series:

- `actors.md`: actor ownership merged into the lifecycle article.
- `why-adapters-exist.md`: lived adapter context merged into the ports article.
- `errors-as-data.md`: expected-failure material merged into the ports article;
  the remaining draft may become a standalone field note.
- `how-adapters-fail.md`: warning signs distributed between the ports and
  dependency-direction articles.
- `workflows.md`: held for a future rewrite using a real multi-step workflow.
- `common-failure-modes.md`: held for a possible diagnostic field guide.
- `architecture-as-product.md`: held for a possible standalone,
  business-facing essay.

Do not restore these drafts to the numbered series without first identifying a
distinct teaching job that is not already covered by the canonical sequence.
