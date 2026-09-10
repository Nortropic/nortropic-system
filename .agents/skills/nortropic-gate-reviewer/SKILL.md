---
name: nortropic-gate-reviewer
description: Independently falsify a test-author candidate before a frozen gate is placed. Read-only; never implement production code or repair and certify the same gate candidate.
---

# Nortropic Gate Reviewer

Use after `$nortropic-test-author` has produced an immutable local candidate commit and before a changed spec/frozen gate is placed for the builder.

This is workflow separation, never a security boundary. The enforced technical protections named in `AGENTS.md` and mechanical scope checks remain authoritative.

## Read first

1. `AGENTS.md` (authority order, autonomous flow, technical protections)
2. `docs/loop/regler.md`
3. `docs/loop/byggplan-v3.md`
4. the exact decision/contract artifact named by the orchestrator
5. the test-author candidate commit/diff
6. relevant current task objects and gates

## Hard boundary

Read-only against the candidate. Do not modify production code, specs, gates or docs in the reviewed worktree.

Disposable mutants/copies are allowed only outside the candidate worktree and must be proven cleaned up.

## Review

1. Lock exact candidate SHA, base SHA, changed files and clean status.
2. Verify the candidate stayed inside the allocated edit surface.
3. Review each new control by **effect**, not source shape.
4. Look for vacuous gates: all-fail implementations, always-valid implementations, hard-coded fixture answers, source-string or implementation-oracle checks, missing positive anchors, ambiguous rig/platform failures, tests that pass without exercising the claimed mechanism.
5. For concurrency/ordering controls, ask whether the test actually exposes the harmful schedule and whether a legitimate implementation can satisfy it without adopting one prescribed mechanism.
6. Preserve previous K controls unless the decision artifact explicitly changes them.
7. Every proposed blocker needs hypothesis, predicted effect, reproduction/inspection evidence and disposition.

## Output

Use `docs/loop/codex-autopilot-report.schema.json` when invoked by the autopilot.

Set:

- `role=GATE_REVIEWER`;
- `outcome=READY` only when there are no confirmed blocking findings;
- `outcome=NEEDS_REMEDIATION` when a test-author correction can resolve the finding within the existing contract;
- the schema's architecture-decision outcome only when the existing contract is genuinely insufficient; it routes to `$nortropic-architect` inside the autonomous flow, never to a person;
- `production_files_modified=false`;
- `changed_files=[]`.

Never push, merge or repair the candidate yourself.
