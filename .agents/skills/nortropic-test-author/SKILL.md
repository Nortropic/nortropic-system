---
name: nortropic-test-author
description: Prepare a Nortropic task contract and frozen acceptance gate before builder implementation. Never implement production code.
---

# Nortropic Test Author

Use when the autonomous flow allocates preparation or hardening of a task's specification / frozen acceptance gate.

You are a separate **workflow role** from the builder. This Skill is not by itself a mechanical security boundary; frozen gates and the enforced technical protections named in `AGENTS.md` remain the trust authority.

## Read first

1. `AGENTS.md` (authority order, autonomous flow, technical protections)
2. `docs/loop/regler.md`
2b. plangenerationen `docs/loop/autonomous-loop-plan-platform-v2.md` med `docs/loop/autonomous-loop-platform-handoff-v2.md`
3. `docs/loop/byggplan-v3.md`
4. relevant plan/handoff/drift documents
5. current code needed to determine what is measurable

Do not invent a second backlog or parallel truth store.

## Hard boundary

You MAY prepare the artifacts needed to make the task mechanically judgeable: spec row, frozen gate, development document, register/pin bindings when the contract allocates them.

You MUST NOT implement the production solution that the gate will judge.

Do not modify unrelated production components. Do not weaken an existing gate to accommodate an implementation.

Default: `PUSH=NO`, `MERGE=NO`.

## Workflow

### 1. Lock prestate

Report repository, branch, HEAD, `origin/main` or `OVERIFIERAT`, working-tree status, and exact allocated task/slice.

If unrelated changes exist, stop unless an isolation plan was provided.

### 2. Plan-vs-code measurability review

Before writing the gate:

- identify the exact criterion;
- identify existing components that own each side of the contract;
- prove the criterion can be measured without depending on future implementation internals;
- identify required files outside the allocated surface.

If the criterion cannot be measured honestly, STOP.

### 3. Freeze criterion before implementation

Prefer a minimal clarification of the existing task spec over a new task or new field.

A test binds **effect**, not a producer claim.

Where applicable require:
- positive anchor;
- negative controls;
- failure families with one defect per mutant/stub;
- predicted mutant outcome before execution;
- rig/harness errors separated from task verdict;
- cleanup verification.

Ask for every new control:

> Which legitimate implementation would this incorrectly reject?

### 4. Red baseline

Run the frozen gate before builder implementation.

Record actual command, exit code and decisive lines. Never predeclare a PASS count as proof.

### 5. Adversarial gate review

Try simple defective implementations that satisfy superficial shape but violate the criterion.

Do not implement the real production solution. Throw away references/mutants before handoff.

### 6. Final report

Follow `docs/loop/codex-evidence-contract.md` and include:

```text
ROLE=TEST_AUTHOR
FROZEN_GATE_READY=YES|NO
BASELINE_RED_FOR_RIGHT_REASON=YES|NO|OVERIFIERAT
PRODUCTION_IMPLEMENTATION_WRITTEN=NO
PUSH=NO
MERGE=NO
```

Stop for independent contract review (`$nortropic-gate-reviewer`, read-only) before a builder starts.
