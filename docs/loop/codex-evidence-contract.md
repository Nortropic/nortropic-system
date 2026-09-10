# Codex evidence contract — report format, never authority

**Purpose:** standardize Codex role reports so the owner can verify facts quickly.

This file is **not** scheduler state, task doneness, a verdict store, an attestation, or a substitute for any frozen exit-test. Git, controller-authoritative stores and frozen gates remain evidence sources.

## Rollseparation

Codex-rollerna i `.agents/skills/` är en arbetsmodell:

```text
CODEX_ROLE_SEPARATION=WORKFLOW
CODEX_ROLE_SEPARATION_IS_SECURITY_BOUNDARY=NO
```

En rapport får aldrig använda `ROLE=...`, en separat Codex-tråd eller ett separat worktree
som mekaniskt bevis för att en viss fil varit otillgänglig. Sådant bevis måste komma från
den faktiska write-/sandbox-/controllergränsen eller från det frysta owner-testet.

## Status vocabulary

- `PROVEN` — supported by command/file/SHA evidence from the same session.
- `OVERIFIERAT` — not established.
- `NOT_RUN` — deliberately not executed.
- `PASS` / `FAIL` — only for an executed gate/test with command and exit code.

No percentages.

## Required identity

```text
ROLE=TEST_AUTHOR|BUILDER|REVIEWER
REPOSITORY=<owner/repo>
BRANCH=<branch/ref>
BASE_SHA=<sha|OVERIFIERAT>
HEAD_SHA=<sha>
ORIGIN_MAIN_SHA=<sha|OVERIFIERAT>
WORKTREE_STATUS=<CLEAN|DIRTY>
PUSH=NO|YES
MERGE=NO|YES
```

If dirty:

```text
UNCOMMITTED_FILES=
  <path>
```

## Commit / diff

```text
COMMITS=
  <sha> <subject>

CHANGED_FILES=
  <path>

ALLOWED_WRITE_VIOLATION=NO|YES|OVERIFIERAT
FROZEN_ARTIFACTS_MODIFIED=NO|YES|NOT_APPLICABLE
```

For a builder, `FROZEN_ARTIFACTS_MODIFIED=YES` is a stop condition unless the current owner-authorized task explicitly owns that artifact.

## Test evidence

```text
TEST=<stable name>
COMMAND=<exact command>
EXIT=<integer>
RESULT=PASS|FAIL
DECISIVE_EVIDENCE=<short exact output/effect or evidence path>
```

If not run:

```text
TEST=<name>
RESULT=NOT_RUN
REASON=<why>
```

Never convert `NOT_RUN` or `OVERIFIERAT` to PASS.

## Adversarial findings

```text
FINDING_ID=<stable local id>
HYPOTHESIS=<what may be wrong>
PREDICTED_EFFECT=<written before reproduction when executed>
EVIDENCE=<command/path/diff and actual result>
DISPOSITION=CONFIRMED_BLOCKING|CONFIRMED_NON_BLOCKING|REJECTED|OVERIFIERAT
```

## Stop conditions

```text
STOP_CONDITION_ACTIVE=YES|NO
STOP_REASON=<reason|NONE>
OWNER_DECISION_REQUIRED=YES|NO
```

## Role closeout

Test author:

```text
FROZEN_GATE_READY=YES|NO
BASELINE_RED_FOR_RIGHT_REASON=YES|NO|OVERIFIERAT
PRODUCTION_IMPLEMENTATION_WRITTEN=NO
PUSH=NO
MERGE=NO
```

Builder:

```text
FROZEN_ARTIFACTS_MODIFIED=NO
ALLOWED_WRITE_VIOLATION=NO
LOCAL_QUALIFICATION_REQUIRED=YES
PUSH=NO
MERGE=NO
```

Reviewer:

```text
PRODUCTION_FILES_MODIFIED=NO
BLOCKING_FINDINGS=<ids or NONE>
LOCAL_QUALIFICATION_STILL_REQUIRED=YES
PUSH=NO
MERGE=NO
```

## Interpretation

The report reduces coordination cost. It does **not** replace the frozen gates.

Before a trust-relevant transition the decisive frozen gates are reproduced mechanically in local qualification (`AGENTS.md`) and candidate identity/diff scope is verified from Git, never from the report.

<!-- CODEX-AUTOPILOT-V2-EVIDENCE -->
## v2 — mekanisk owner-gate executor

Under `docs/loop/codex-autopilot-v2.md` (historisk operating model; auktoriteten är sedan 2026-09-10 `AGENTS.md`) finns ingen interaktiv terminaloperatör per candidate. `scripts/nortropic-codex-autopilot.py` reproducerar transition-relevant proof: exact Git identity, cumulative scope/budget, faktiskt frozen exit-test, independent reviewer identity, remote head/base och merged tree.

Agentens strukturerade rapport är fortfarande evidence/claims och aldrig en verdict store. Autopilotens journal under Git common-dir är checkpoint/evidence only och får inte övertrumfa faktisk Git-/gate-state.

<!-- CODEX-AUTOPILOT-V3-EVIDENCE -->
## v3 — architect routing och full-roadmap closeout

Autopilotens JSON-schema tillåter även `ROLE=ARCHITECT`. Architect är read-only och dess rapport är aldrig trust authority; den väljer endast nästa owner-delegerade kontraktsriktning under högre authority och den exakta frozen roadmapen.

Under v3 betyder `OWNER_DECISION_REQUIRED` i en rollrapport **intern routingsignal till architect**. Ett mänskligt stopp uttrycks i stället som `BLOCKED` med `HUMAN_AUTHORITY_HARD_STOP:` och får endast användas enligt `docs/loop/codex-autopilot-v3-full-roadmap.md`.

`FULL_ROADMAP_COMPLETE` är en mekanisk closeout-händelse, inte agentprosa: alla tasks i aktuell spec med exit-test ska ha faktiskt exit 0, samtliga S2/S4–S13 ska finnas som dömbara task-kontrakt med planens exakta h-task/gate-identiteter, invarianterna ska vara gröna och den separata empiriska L-closeout-körningen ska ha passerat på authoritative main.

`ROLE=EMPIRICAL` används endast för stage L:s read-only end-to-end-körning. Rollen får skapa disposable runtime-state men inga repositoryändringar; ett empirical finding blir aldrig självt en fix utan routas till owning frozen task, normalt via test-author om den gröna gaten missade felet.


### Full-roadmap closeout

`FULL_ROADMAP_SOFTWARE_COMPLETE` kräver faktisk exit 0 från den frysta programnivå-gaten
`verify/bin/autonomous-loop-exit` plus oberoende empirical falsification. `FULL_ROADMAP_COMPLETE`
kräver dessutom PROVEN external promoter identity. Ingen av statusarna får härledas enbart ur
agentrapport.
