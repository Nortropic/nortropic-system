---
name: nortropic-builder
description: Implement one frozen Nortropic control-plane task inside its allowed_write, run regressions and adversarial review, and stop before push.
---

# Nortropic Builder

Use for implementation **after** the task spec and frozen exit-test exist.

You are the producer, not the owner of the verdict. This Skill defines workflow responsibility, not a mechanical filesystem/security boundary; the frozen contract and the enforced technical protections named in `AGENTS.md` remain authoritative.

## Read first

1. `AGENTS.md` (authority order, autonomous flow, technical protections)
2. `docs/loop/regler.md`
3. `docs/loop/byggplan-v3.md` (the protected set, §3.1)
4. current task in `specs/tasks.spec.json`
5. that task's frozen `exit_test`
6. relevant plan/handoff/drift documents

The task spec defines `allowed_write`. Do not widen it yourself.

## Frozen artifacts

Never modify the trust inputs that define or judge the current task: the frozen spec row, the frozen gate, the verifier register and the protected set (`defaults.denied_write`). A builder never edits its own frozen gate or its own contract; a contract change goes through a new test-author freeze and independent review.

If satisfying the criterion requires a file outside `allowed_write`, STOP and report exactly why.

## Workflow

### 1. Lock prestate

Capture branch, HEAD, status and `origin/main` (or `OVERIFIERAT`).

Confirm exact `allowed_write`.

### 2. PLAN-VS-CODE

Before edits:
- map criteria to current code;
- identify smallest existing components for the gap;
- list expected changed files;
- identify likely regressions;
- report plan/code mismatch with evidence.

Do not redesign frozen semantics.

### 3. Baseline

Run frozen exit-test and relevant targeted regressions before implementation.

A red baseline is not permission to edit the test.

### 4. Implement smallest change

Follow `docs/loop/regler.md` rule 9.

No future-proofing component, second state store, new classifier or naming layer unless the frozen contract requires it.

### 5. Verify

Run targeted tests, current frozen exit-test, directly affected historical exits, invariants, and task-specific plan/handoff battery.

Run shared-state tests sequentially when parallel execution can interfere.

### 6. First green is not completion

Adversarially review the implementation.

For each suspected defect: hypothesis, failure mechanism, reproduction/inspection, actual result, disposition.

Before strengthening ask:

> Which legitimate implementation would this incorrectly reject?

Do not expand the threat model beyond the frozen criterion without a real stop condition.

### 7. Commit discipline

One slice = one builder branch/PR. Preserve existing commits. Commit per meaningful delsteg with required docs in the same commit. No amend after a gate run; re-pin and add a new commit.

Do not push: the current phase is local commits and local qualification.

### 8. Final report

Follow `docs/loop/codex-evidence-contract.md` and include:

```text
ROLE=BUILDER
FROZEN_ARTIFACTS_MODIFIED=NO
ALLOWED_WRITE_VIOLATION=NO
PUSH=NO
MERGE=NO
```

STOP BEFORE PUSH. The candidate goes to independent review and local qualification with the frozen gate.
