# PBB - Harness Mode Prompt (refined)

> This is the reusable orchestration prompt for building the Pashtoonkhwa Blood Bank
> platform. It replaces the free-form "review everything" prompt with a version tied to
> the concrete spec (`PBB Build Harness.md`), the concrete design (the Modernist
> prototype), and a **verifiable definition of done** per track. The original prompt
> asked agents to "prove it works" but gave them no oracle; this one gives every claim a
> check that can pass or fail.

---

## Operating contract

You are running **Harness Mode**: a loop of specialised agents that build, verify, and
refine the PBB platform until each slice meets its written gate - not until code merely
exists. The single source of truth for *what* is `docs/PBB Build Harness.md` (§1-§10).
The single source of truth for *how it should look and read* is the prototype under
`_handoff/modernist/project/`. When they disagree, the Harness doc wins for behaviour and
data; the prototype wins for copy, layout, and pixels.

**You have standing authority** to fill gaps the design phase missed - add a missing
module, endpoint, validation, empty state, or screen - provided the addition does not
violate an ethical constraint (§1) or a frozen decision, and provided you record it in
the track handoff under `ADDED`. Do not invent answers to the open client questions in
§10; surface them in `BLOCKED` instead.

## The loop (per track, every iteration)

```
READ    → the Harness doc, the prototype for your track, and your gate.
PLAN    → write the acceptance checks FIRST as executable tests. A requirement you
          cannot express as a check, you do not yet understand - flag it, don't guess.
BUILD   → smallest slice that turns one red check green. Commit per slice.
VERIFY  → run the full battery (below), not only your own tests.
AUDIT   → run the §7 invariants across the whole system, not just your track.
DECIDE  → any red → back to BUILD, fixing root cause not symptom.
          all green → HAND OFF.
HAND OFF→ write CHANGED / ADDED / PASSING / FAILING / ASSUMED / BLOCKED / NEXT.
```

## Verification battery (must be green every iteration)

```bash
pnpm typecheck        # zero errors, no `any` in domain code
pnpm lint
pnpm test:unit        # ≥85% on domain logic
pnpm test:api         # every endpoint: happy path, 401, 403, 422, edge
pnpm test:e2e         # the six critical journeys (§8)
pnpm test:rbac        # every role × every endpoint, asserted from the matrix
pnpm test:invariants  # §7 (INV-1 … INV-12)
pnpm audit --audit-level=high
pnpm build            # both apps
```

## Zero-compromise coverage (what "every part" means here)

The original prompt listed "every button, every dropdown…". That list is correct but
unbounded. Here it is bound to artefacts a check can iterate over:

- **Every route** in `docs/ROUTE-INVENTORY.md` renders, in EN/UR/PS, at data sizes 0/1/many.
- **Every control** (button, link, toggle, filter, pagination) either changes state or is
  not rendered - enforced by INV-9 (E2E clicks each) not by eyeballing.
- **Every endpoint** in §4 has happy/401/403/422/edge tests and an RBAC-matrix row.
- **Every derived number** traces to exactly one API field (INV-1) and handles 0/1/many
  plurals (INV-8).
- **Every error path** surfaces a visible error state (INV-7); no catch leaves stale UI.
- **Every privacy boundary** (phone numbers, patient names) is asserted at the payload
  level (INV-11), not assumed from the UI hiding a field.

## Stop-and-ask conditions

Halt the track and write a `BLOCKED` note when:

- a change would edit another track's files (cross-track coupling → re-plan the wave);
- a requirement contradicts an ethical constraint (§1);
- a fix needs a schema change after Wave 0 is frozen;
- the same check has failed three times (the diagnosis is wrong, not the fix);
- the work depends on an unanswered §10 client decision.

## Definition of done (per track)

Gate passed · battery green · invariants green · no `TODO`/placeholder in committed
code · handoff note written (`docs/tracks/T{n}.md`) · a second agent (`code-reviewer`)
has reviewed the diff against the Harness doc and signed off.

## Orchestration shape

- **Wave 0 (T0)** runs alone and blocks everything. One agent, serial.
- **Wave 1 (T1-T4)** runs after T0's gate. Four agents, parallel - disjoint files.
- **Wave 2 (T5-T7)** runs after T1+T2. Three agents, parallel.
- **Wave 3 (T8)** runs last. One agent.

Parallel agents share the repo but never the same files (the wave design guarantees this).
When a track must touch a shared file (e.g. the Prisma schema after Wave 0), it stops and
asks - it does not edit across the boundary.

See `docs/BUILD-PLAN.md` for the per-track gate, file ownership, and check list.
See `docs/tracks/T{n}.md` for each track's living handoff.
