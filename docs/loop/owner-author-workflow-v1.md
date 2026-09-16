# Owner-author workflow v1 — frozen H-035 effect contract

H-035 is an **ordinary**, one-time bootstrap. It changes task authority from one ordinary
builder surface into two mechanically distinct classes, `ordinary` and `owner_authority`.
It does not make H-035 an owner-author task, and no runtime comparison or exception for
`task_id == "h-035"` may survive activation.

This contract solves only the missing owner-only TaskContract/write path for the three
currently allocated H-034 production files. It does not define H-034's finite operation
vocabulary, create H-034, or make an H-034 gate judgeable.

## 1. Canonical authority and compatibility

`specs/tasks.spec.json` remains the only task authority. Schema v2 has exactly two task
authority values:

```text
ordinary
owner_authority
```

The value is an exact JSON string, never a boolean, number, missing value, alias or
case-insensitive role. A schema-v1 task document is readable only with effective class
`ordinary`; owner authority is never inferred from a v1 field, role, provider, session,
branch, environment variable, request object or self-reported file.

Canonical owner-production allocation is the duplicate-aware JSON object at
`specs/owner-production-paths.v1.json` in the same Git authority tree. Runtime input may
bind the expected digest of that object but may not supply an alternative registry or
change its membership.

For schema v2:

- `ordinary` has a non-empty ordinary `allowed_write` and has no
  `owner_author_allowed_write` field;
- `owner_authority` has an empty ordinary `allowed_write` and an explicit non-empty
  `owner_author_allowed_write` exactly equal to the registry allocation for that task;
- `docs_impact` is a subset of the applicable surface for the class;
- duplicate task ids, unknown fields that claim authority, missing allocations and
  wrong JSON types fail closed.

H-035's frozen ordinary `allowed_write` is its complete bootstrap authority. It is not a
special case in the activated parser. Its own task object, owner registry, frozen gate,
this owner contract and frozen acceptance fixtures remain outside that surface.

## 2. One repository path language

All authority consumers use one repository-tree grammar:

- UTF-8 NFC, repository-relative paths only;
- exact paths, or a terminal `/**` recursive prefix where a pattern is allowed;
- no absolute or drive-prefixed path, backslash, NUL/control byte, leading `./`, empty,
  `.` or `..` segment, repeated/trailing separator, `.git` segment, or other glob form;
- no normalization repairs an invalid spelling into an authorized spelling.

Intersection is exact/prefix containment in either direction. Therefore an ordinary
exact allocation, child, recursive parent, wider ancestor or root-covering expression
cannot overlap an owner-production allocation. Git supplies candidate paths; provider
reports and request lists never do.

Registry v1 contains exactly one allocation, for `h-034`, with exactly these paths:

```text
verify/h034/kernel.py
verify/h034/plan.json
verify/h034/identity.json
```

No other spelling or path is equivalent. Registry v1 also carries the owner-author global
denied surface. An owner allocation that intersects that surface is invalid even if a
requester asks for it. New membership requires a separately frozen registry version; it
is not a runtime extension point.

## 3. Applicable write effects

An ordinary candidate is checked only against ordinary `allowed_write` plus its required
`docs_impact`, and every ordinary surface is first proved disjoint from every registered
owner-production path. An ordinary scheduler, builder, drain, retry, recovery or bootstrap
can never create an owner action.

An owner-author candidate is checked only against the exact registered allocation for its
canonical task. It cannot change task/spec authority, the owner registry, frozen gates,
tests or fixtures, policy, state/attestation/lease/loop/verification authority, containment,
autopilot, configuration authority, constitution/rules or any path outside its allocation.

Envelope/TaskContract projection derives the class and applicable surface from canonical
authority. Ordinary h-001 through h-017 behavior remains compatible. External or schema-v1
fixture specs remain ordinary-only even if they contain an owner-looking field.

## 4. Normal route and explicit owner action

The production route is `controller/loop/cli run <config.json>`. A case-name probe,
diagnostic response, marker file or provider report is not production acceptance.
The H-035 route preserves the existing loop config and adds exact `task_id` and
`current_main_sha` bindings; disposable tests may substitute the existing state, attest,
lease, breaker, workspace and `worker_cmd` roots/argv, but those values never select an
authority class or owner allocation.

For an eligible canonical owner task with no explicit action, the normal route must:

1. execute no provider or ordinary builder;
2. persist `OWNER_ACTION_REQUIRED` in reconstructable state;
3. leave the task nonterminal, unattested and dependency-blocking;
4. preserve the same state across restart.

The explicit operation `controller/authority/cli owner-action` consumes one strict JSON
request on stdin and persists an action bound to the exact task, authority class, action
and attempt identities, base SHA, current authoritative-main SHA, canonical spec digest,
registry digest, gate path and gate digest. The command does not accept a caller-selected
spec/registry and does not itself publish.

After that exact persisted action, the **same** normal loop route becomes live. It creates
a fresh candidate workspace on the bound base and executes the configured disposable
provider process. The controller, not the provider report, derives candidate SHA and
changed files from Git. Only the allocated owner surface is accepted. A successful owner
attempt persists `OWNER_CANDIDATE_REVIEW_REQUIRED` with the exact candidate and file set,
then stops without attestation, publication, push, merge or dependent-task advancement.

Restart after candidate creation preserves that state and exact candidate identity and
does not execute another provider. Unknown or malformed persisted states fail closed and
remain observable; recovery never rewrites them into ordinary, pending, failed, skipped
or done.

## 5. Independent review and owner-final action

`controller/authority/cli record-review` consumes a strict request bound to the current
owner candidate plus a review artifact. It verifies a distinct, clean, read-only Git
review worktree at the exact candidate and derives the artifact digest. Missing review,
`READY` without a PASS verdict, wrong candidate/base, dirty review tree, reused author
identity or wrong review identity fails without transition.

An exact independent PASS moves only to `OWNER_FINAL_FREEZE_REQUIRED`. It never runs an
owner-final action, writes an attestation, changes a ref, publishes, pushes or merges.

`controller/authority/cli owner-final` is the only final operation. It re-derives and
compares the exact candidate, actual Git files, review identity/digest, base, current
authoritative main, spec, registry and frozen gate identity/result. Any mismatch leaves
state, attestations, workspaces and refs unchanged. On success it records
`OWNER_PUBLICATION_ELIGIBLE` and an owner attestation that includes at least:

```text
task_id
authority_class=owner_authority
action_id
attempt_id
base_sha
current_main_sha
candidate_sha
actual_changed_files
spec_sha256
registry_sha256
gate_path
gate_sha256
review_id
review_sha256
owner_final_id
```

Publication eligibility is not publication. Reviewer PASS and owner-final both leave Git
refs unchanged; a later guarded publisher still owns any authoritative-main transition.

## 6. Operational authority CLI

The activated `controller/authority/cli` exposes these black-box commands, each reading one
strict JSON request from stdin and returning nonzero on refusal:

```text
validate-task
validate-registry
check-candidate
owner-action
record-review
owner-final
read-state
```

Validation and candidate checks read canonical files and actual Git objects. Transition
commands compare caller-provided bindings to those derived facts; returned JSON is
diagnostic evidence only. Existing policy, task selection, envelope, state, attestation,
loop and autopilot consumers must use the same authority result/path grammar rather than
maintain permissive parallel matchers.

For read-only scope discrimination, the mechanical autopilot exposes
`scripts/nortropic-codex-autopilot.py --repo <repo> scope-check <task-id> <candidate-sha>`.
It delegates to the same canonical Git candidate check; it neither schedules nor publishes.

## 7. Frozen-gate discrimination and cleanup

Every real-route control receives fresh state/eventlog, attestation, lease, breaker,
workspace and provider-observation roots. Cleanup is deterministic and proves no workspace,
lease, child process or temporary root remains.

The positive ordinary control runs first through the same real route and must be observed
as a live disposable provider **process image** from outside the subject. If it is not
observed, the run is a rig failure (`exit 2`), never evidence for owner blocking. After the
ordinary anchor, pre-action owner non-execution is creditable. After explicit owner action,
owner provider execution is a required positive effect; failure is product RED (`exit 1`).
No desired security property is encoded as `loop_exit == 3` or any other exit code alone.

The gate also runs the same acceptance matrix against a disposable legitimate reference
fixture before judging production, and rejects one-defect unsafe mutants. Its internal path
and registry oracles are judge self-tests only; no production property is established by
an oracle, source grep, returned field or subject-writeable sentinel alone.

Nested Seatbelt or process-table denial after a candidate reaches the real-effect phase is
`ODÖMBART`, not PASS or product FAIL. Candidate-bound owner-terminal acceptance uses the
same frozen gate and normal route and writes its raw result outside the candidate; the
artifact is evidence, never repository authority.

## 8. H-034 remains paused

H-035 provides only the authority/write-path prerequisite. The exact finite H-034 operation
vocabulary and sequence remain unresolved and must be frozen separately before any H-034
task, gate or production implementation is created.
