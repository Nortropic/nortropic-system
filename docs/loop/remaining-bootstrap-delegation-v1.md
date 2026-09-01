# Remaining bootstrap delegation v1

**Owner decision:** 2026-08-13
**Scope:** H-035 → H-034 → H-033 → H-032 → H-031 → supervisor resume → first real autonomous launch.

This is workflow authority, not a second backlog, verdict store, or security boundary. The
canonical tasks remain solely in `specs/tasks.spec.json`; frozen gates and mechanically observed
effects remain trust authority. Source mandate SHA-256:
`f0092e8c394c7bd4b23ad2e9375462813fd1533ac2ba5cf50833019165994178`.

```text
OWNER_MANUAL_FINAL_APPROVAL_REQUIRED=NO
OWNER_FINAL_FREEZE_MAY_BE_EXECUTED_AUTONOMOUSLY=YES
OWNER_PUBLICATION_APPROVAL_REQUIRED=NO
OWNER_PR_APPROVAL_REQUIRED=NO
OWNER_MERGE_APPROVAL_REQUIRED=NO
OWNER_NEXT_TASK_APPROVAL_REQUIRED=NO
OWNER_SUPERVISOR_RESUME_APPROVAL_REQUIRED=NO
NO_FORCE_SEMANTICS=YES
SELF_CERTIFICATION_AS_PROOF=NO
```

The delegation applies only while every applicable mechanical prerequisite is proven: exact
task/spec/gate/base/candidate identity; current-authority lineage; exact file scope and denied-write
compliance; actual required gate/test/empirical results; independent review bound to the immutable
candidate with no unresolved actionable finding; clean worktree; and exact remote/PR identity.
Missing evidence rejects. Ordinary reviewer findings route to a new remediation candidate and fresh
review without a human scheduling stop.

## Guarded publication

Publication uses ordinary non-force push and GitHub's normal merge-commit method only. `--rebase`,
`--squash`, force, amend, reset, cherry-pick and every history rewrite are forbidden. Immediately
before merge the publisher fetches and atomically relocks all of:

- repository `Nortropic/nortropic-system` and base ref `main`;
- `origin/main` equal to the frozen base;
- clean worktree HEAD and candidate tree equal to the reviewed candidate;
- remote candidate branch equal to that candidate;
- open PR base/head refs and exact base/head SHAs;
- PR changed-file set equal to the mechanically approved set;
- current frozen gate/spec and review identities.

The single authorized merge command has method `gh pr merge --merge` and an exact head-commit guard.
Repository configuration permitting squash or rebase is not authority to use them. After GitHub
reports `state=MERGED` with non-null `mergedAt` and `mergeCommit`, the publisher fetches main and proves: returned merge SHA is a commit;
`origin/main` equals it; it has exactly two parents; parent 1 equals the frozen base; parent 2 equals
the reviewed candidate; and its tree equals the reviewed candidate tree. Any mismatch fails closed.

The frozen acceptance gate measures this as one effect-bound operation by invoking the production
publisher against real disposable Git repositories and a hermetic GitHub command boundary. A
returned SHA or the presence of publication-related source tokens is not evidence. The observed
chain must include the exact non-force candidate push; repository, base, head, PR and file relock
after that push and immediately before merge; `gh pr merge --merge --match-head-commit`; GitHub's
merged state; the fetched `origin/main`; two ordered parents; and the candidate-identical tree.
The publication request also binds task id, candidate Git-object task-spec and gate paths plus their
SHA-256 identities, and the immutable independent-review artifact path plus SHA-256. The publisher
must re-read all three identities in the immediate premerge relock. It uses only supported GitHub
fields (`state`, `mergedAt`, `mergeCommit`, `headRefOid`) and, after that response, itself executes
the fetch/main-equality, ordered-parent and candidate-tree proof. A caller, judge, or return value
performing those checks on its behalf is insufficient.
Every returned value must affect the publisher's decision: hostile main, parent-list and tree
responses reject even while the underlying disposable merge graph remains valid. Merely issuing
the full command sequence and discarding its outputs is not proof.
Acceptance installs the executable boundary before importing the publisher. Module-load aliases of
`subprocess.run`, `Popen`, `check_output`, `check_call` and `os.system` therefore cannot bypass the
trace. Git and GitHub remain available through those audited forms, including absolute Git paths;
an unexpected absolute executable is denied and rejects publication.
The audited Git/GitHub identities are fixed before module load by canonical path plus SHA-256.
Names are resolved only through the captured authoritative PATH; basename equality is insufficient.
Harness symlinks may resolve to those identities, but absolute fakes, PATH shadows, changed files
and byte-identical copies at a different canonical path are denied before execution.

The current observed GitHub protection is contextual evidence, not a replacement for the relock:
`enforce_admins=true`, force pushes/deletions disabled, no required linear history, and normal merge
commits supported. The publisher must re-read relevant external state at the transition.

## Stop boundary

No human click is required between the bounded bootstrap phases. A stop remains valid only for a
real higher-authority contradiction, unavailable external credential/capability, uncovered
destructive effect, proven architectural impossibility, or a novel material authority expansion.
Chat context and model/session/role claims never substitute for persisted Git/effect evidence.
<!-- BOUNDED_PREREQUISITE_AUTHORITY_MIGRATION_AMENDMENT_V1 -->

## Standing bounded-prerequisite authority migration

This amendment is inactive in candidate form. Its literal status marker is a report value, not a
truth store: it may be reported only after these exact bytes have passed independent review, been
published to authoritative main by the existing guarded transition, and passed post-publication
identity and gate verification with the exact canonical commit, tree and document SHA-256.
The older Stop-boundary terms `proven architectural impossibility` and `novel material authority
expansion` are superseded only for a bounded migration with no qualified hard stop and all
BP01–BP14 true. Objective-level impossibility and authority expansion beyond the approved
objective's requirements remain human stops.

Conditional post-publication report value:

`BOUNDED_PREREQUISITE_AUTHORITY_MIGRATION=ACTIVE`

<!-- BOUNDED_PREREQUISITE_AUTHORITY_MIGRATION_CONTRACT_BEGIN -->
```json
{
  "schema_version": 1,
  "contract_id": "BOUNDED_PREREQUISITE_AUTHORITY_MIGRATION",
  "source_sha256": "b3cc7d127b5fa42144021642c84b86163e5c358ad1ea711133242fef2ac3ce84",
  "scope": "REMAINING_NORTROPIC_BOOTSTRAP_INSIDE_ALREADY_APPROVED_OBJECTIVES",
  "condition_operator": "ALL",
  "hard_stop_precedence": "BEFORE_DELEGATED_AUTHORITY",
  "incomplete_proof_result": "NO_DELEGATED_AUTHORITY",
  "owner_decision_required": "INTERNAL_ARCHITECT_ORCHESTRATOR_SIGNAL_ONLY_WHEN_HARD_STOP_MATCHES_NO_AND_ALL_CONDITIONS_HOLD",
  "delegation_predicate": "HARD_STOP_MATCHES=NO_AND_BP01_THROUGH_BP14=ALL_TRUE_IMPLIES_OWNER_DECISION_REQUIRED=INTERNAL_ARCHITECT_ORCHESTRATOR_SIGNAL",
  "legacy_stop_boundary_precedence": {
    "superseded_terms": [
      "PROVEN_ARCHITECTURAL_IMPOSSIBILITY",
      "NOVEL_MATERIAL_AUTHORITY_EXPANSION"
    ],
    "superseded_only_when": "HARD_STOP_MATCHES_NO_AND_BP01_THROUGH_BP14_ALL_TRUE",
    "remaining_human_stops": [
      "OBJECTIVE_LEVEL_IMPOSSIBILITY",
      "AUTHORITY_EXPANSION_BEYOND_APPROVED_OBJECTIVE_REQUIREMENTS"
    ]
  },
  "conditions": [
    {"id": "BP01", "requirement": "EXISTING_FROZEN_ARCHITECTURE_BLOCKS_APPROVED_OBJECTIVE"},
    {"id": "BP02", "requirement": "REPRODUCIBLE_TECHNICAL_EVIDENCE_PROVES_BLOCKER"},
    {"id": "BP03", "requirement": "PREREQUISITE_ONLY_MAKES_APPROVED_OBJECTIVE_EXECUTABLE_OR_JUDGEABLE"},
    {"id": "BP04", "requirement": "SECURITY_AND_TRUST_OBJECTIVE_PRESERVED_OR_STRENGTHENED"},
    {"id": "BP05", "requirement": "CHANGE_BOUND_BY_ALL_SIX_EXACT_DIMENSIONS"},
    {"id": "BP06", "requirement": "NO_GENERIC_OR_CALLER_SELECTED_AUTHORITY"},
    {"id": "BP07", "requirement": "ARBITRARY_NEIGHBORING_AUTHORITY_REJECTED"},
    {"id": "BP08", "requirement": "BACKWARD_COMPATIBLE_AUTHORITY_SEMANTICS_PRESERVED_WHERE_REQUIRED"},
    {"id": "BP09", "requirement": "TEST_AUTHOR_FREEZES_CONTRACT_BEFORE_PRODUCT_IMPLEMENTATION"},
    {"id": "BP10", "requirement": "INDEPENDENT_GATE_REVIEWER_FALSIFIES_EXACT_FROZEN_CANDIDATE"},
    {"id": "BP11", "requirement": "SEPARATE_PRODUCT_CANDIDATE_RECEIVES_INDEPENDENT_EXACT_IDENTITY_REVIEW"},
    {"id": "BP12", "requirement": "HISTORICAL_GATES_INVARIANTS_SCOPE_IDENTITY_AND_REGRESSIONS_GREEN_OR_EXPLICIT_AUTHORIZED_RED"},
    {"id": "BP13", "requirement": "PUBLICATION_USES_GUARDED_NONFORCE_EXACT_IDENTITY_TRANSITION"},
    {"id": "BP14", "requirement": "AFFECTED_DOWNSTREAM_GATE_EXPLICITLY_REBOUND_OR_REFROZEN"}
  ],
  "bp05_exact_dimensions": [
    "TASK_IDENTITY",
    "DEPENDENCY_CHANGE",
    "FILE_PATH_AUTHORITY",
    "ALLOWED_WRITE_SURFACE",
    "AUTHORITY_TRANSITION",
    "EXPECTED_EFFECTS"
  ],
  "authorized_internal_migrations": [
    "INTRODUCE_PREREQUISITE_TASK_REQUIRED_BY_ALREADY_AUTHORIZED_TASK",
    "ADD_EXACT_DEPENDENCY_EDGE",
    "MIGRATE_STRICT_REGISTRY_OR_SCHEMA_TO_EXPLICITLY_VERSIONED_EXACT_STATE",
    "ADD_EXACT_NEW_AUTHORITY_PATHS_REQUIRED_BY_PREREQUISITE",
    "REFREEZE_DOWNSTREAM_GATES_TO_CONSUME_NEWLY_PUBLISHED_PREREQUISITE",
    "MINIMAL_BOOTSTRAP_ORDER_OR_DOCUMENTATION_CHANGE_REQUIRED_BY_DEPENDENCY",
    "MINIMAL_ALLOWED_WRITE_EXPANSION_LOGICALLY_REQUIRED_AND_EFFECT_BOUND",
    "REPLACE_IMPOSSIBLE_MECHANISM_WHILE_PRESERVING_APPROVED_SECURITY_OBJECTIVE"
  ],
  "authorized_migrations_require": "HARD_STOP_MATCHES_NO_AND_BP01_THROUGH_BP14_ALL_TRUE",
  "true_human_hard_stops": [
    "CHANGE_HUMAN_OWNED_OR_HUMAN_ONLY_AUTHORITY",
    "WEAKEN_FUNDAMENTAL_TRUST_OR_SECURITY_OBJECTIVE",
    "BYPASS_REQUIRED_CONFINEMENT",
    "ALLOW_UNCONFINED_EXECUTION_FOR_CONVENIENCE",
    "MATERIALLY_BROADEN_FILESYSTEM_PROCESS_NETWORK_OR_CREDENTIAL_AUTHORITY_BEYOND_APPROVED_OBJECTIVE_REQUIREMENTS",
    "INTRODUCE_PRIVILEGED_OR_NATIVE_BROKER_WITH_MATERIALLY_NEW_TRUST_MODEL",
    "GRANT_GENERIC_OR_SELF_SELECTED_OWNER_AUTHORITY",
    "PROVISION_OR_CHANGE_EXTERNAL_CREDENTIAL_SECRET_GITHUB_IDENTITY_OR_TRUST_ROOT_REQUIRING_HUMAN_CEREMONY_OR_NOT_SAFELY_AUTOMATABLE",
    "DESTRUCTIVE_EXTERNAL_EFFECT_OUTSIDE_GUARDED_PUBLICATION",
    "UNRESOLVED_CONTRADICTION_BETWEEN_HIGHER_AUTHORITIES",
    "MATERIALLY_EXPAND_PRODUCT_OR_ROADMAP_SCOPE",
    "MIGRATION_CANNOT_BE_MECHANICALLY_FROZEN_AND_INDEPENDENTLY_FALSIFIED",
    "REPEATED_NO_PROGRESS_REACHES_CANONICAL_HARD_STOP_THRESHOLD"
  ],
  "required_serial_transitions": [
    "PROVEN_BLOCKER",
    "ARCHITECT_DIAGNOSIS",
    "NARROW_PREREQUISITE_DESIGN",
    "TEST_AUTHOR",
    "FROZEN_GATE",
    "INDEPENDENT_GATE_REVIEW",
    "GUARDED_CONTRACT_PUBLICATION",
    "SEPARATE_BUILDER_PRODUCT_CANDIDATE",
    "INDEPENDENT_PRODUCT_REVIEW",
    "GUARDED_PRODUCT_PUBLICATION",
    "DOWNSTREAM_REBIND_OR_REFREEZE",
    "CONTINUE_ORIGINAL_BOOTSTRAP_OBJECTIVE"
  ],
  "sequence_rule": "STRICT_HAPPENS_BEFORE_WITH_ADDITIONAL_REMEDIATION_STEPS_PERMITTED",
  "downstream_rebind_rule": "CHANGED_DOWNSTREAM_REBIND_MUST_BE_GUARDEDLY_PUBLISHED_BEFORE_CONTINUATION",
  "review_binding": "INDEPENDENT_EXACT_IMMUTABLE_CANDIDATE_IDENTITY_NO_SAME_SUBJECT_REVIEW",
  "preproduct_red_rule": "ONLY_EXACT_FROZEN_GATE_LABEL_AND_REASON_MAY_AUTHORIZE_EXPLICIT_PREPRODUCT_RED",
  "forbidden_authorities": [
    "GENERIC_AUTHORITY",
    "CALLER_SELECTED_TASK_AUTHORITY_PATH_DEPENDENCY_EFFECT_OR_OBJECTIVE",
    "WILDCARD_ROOT_PARENT_OR_NEIGHBORING_PATH_AUTHORITY",
    "GENERIC_OR_SELF_SELECTED_OWNER_AUTHORITY",
    "FILESYSTEM_PROCESS_NETWORK_OR_CREDENTIAL_BROADENING_BEYOND_APPROVED_OBJECTIVE_REQUIREMENTS",
    "EXTERNAL_CREDENTIAL_SECRET_GITHUB_IDENTITY_OR_TRUST_ROOT_PROVISIONING_REQUIRING_HUMAN_CEREMONY_OR_NOT_SAFELY_AUTOMATABLE",
    "PRIVILEGED_OR_NATIVE_BROKER_WITH_MATERIALLY_NEW_TRUST_MODEL",
    "CONFINEMENT_BYPASS_OR_UNCONFINED_FALLBACK",
    "OBJECTIVE_SECURITY_MODEL_CONSTITUTION_OR_FUNDAMENTAL_AUTHORITY_REDEFINITION"
  ],
  "activation_condition": {
    "trigger": "VERIFIED_CANONICAL_PUBLICATION",
    "candidate_bytes_activate": false,
    "required_evidence": [
      "EXACT_CANONICAL_COMMIT",
      "EXACT_CANONICAL_TREE",
      "EXACT_DELEGATION_DOCUMENT_SHA256",
      "POSTPUBLICATION_GATE_VERIFICATION"
    ],
    "report": "BOUNDED_PREREQUISITE_AUTHORITY_MIGRATION=ACTIVE",
    "report_only_after_evidence": true
  },
  "fail_closed": true
}
```
<!-- BOUNDED_PREREQUISITE_AUTHORITY_MIGRATION_CONTRACT_END -->

The following source mandate is retained losslessly. The machine contract above is its strict,
duplicate-aware operational index; neither block may stand alone.

<!-- BOUNDED_PREREQUISITE_AUTHORITY_MIGRATION_SOURCE_BEGIN -->
I am adding a standing owner-delegation amendment for the remaining Nortropic bootstrap.

The purpose of this amendment is to eliminate unnecessary future human scheduling/approval stops when the system discovers a **mechanically necessary, narrowly bounded prerequisite migration inside an already-approved objective**.

Do not reinterpret this as general authority to expand your own permissions.

## BOUNDED_PREREQUISITE_AUTHORITY_MIGRATION

During the already-approved remaining bootstrap, a newly discovered prerequisite, gate migration, dependency migration, registry migration, or equivalent roadmap-internal authority transition does **not** require a human owner stop when ALL of the following are mechanically proven:

1. The current approved objective cannot safely proceed under the existing frozen architecture.

2. The blocker is demonstrated by reproducible technical evidence, not model judgment alone.

3. The new prerequisite exists only to make an already-approved objective executable or mechanically judgeable.

4. The underlying security/trust objective is preserved or strengthened.

5. The proposed change is narrowly bounded by exact:

   * task identity;
   * dependency change;
   * file/path authority;
   * allowed-write surface;
   * authority transition;
   * expected effects.

6. The migration does not create generic or caller-selected authority.

7. Arbitrary neighboring authority remains mechanically rejected.

8. Existing authority semantics remain preserved wherever backward compatibility is required.

9. A TEST_AUTHOR freezes the new contract before product implementation.

10. An independent GATE_REVIEWER reviews and actively attempts to falsify the exact frozen authority candidate.

11. Product implementation is a separate candidate and receives independent review against its exact immutable identity.

12. All applicable historical gates, invariants, scope controls, identity checks and regression tests remain green or in their explicitly authorized pre-product RED state.

13. Publication uses the existing guarded, non-force, exact-identity trust transition.

14. Any downstream gate affected by the prerequisite is explicitly rebound/refrozen against the newly published prerequisite rather than silently inheriting it.

When all of these conditions hold:

`OWNER_DECISION_REQUIRED`

must be treated as an **internal architect/orchestrator signal**, not as a human scheduling stop.

The autonomous sequence may be:

```text
proven blocker
→ architect diagnosis
→ narrow prerequisite design
→ TEST_AUTHOR
→ frozen gate
→ independent gate review
→ guarded publication
→ BUILDER
→ independent product review
→ guarded publication
→ downstream rebind/refreeze
→ continue original bootstrap objective
```

No human approval is required between those transitions when every mechanical prerequisite remains satisfied.

## AUTHORIZED INTERNAL MIGRATIONS

This standing delegation includes mechanically bounded roadmap-internal changes such as:

* introducing a prerequisite task required by an already-authorized task;
* adding an exact dependency edge;
* migrating a strict registry/schema to a new explicitly versioned exact state;
* adding exact new authority paths required by that prerequisite;
* refreezing downstream gates to consume a newly published prerequisite;
* minimal bootstrap-order/documentation changes required to represent the new dependency;
* minimal allowed-write expansion that is both:

  * logically required by the already-approved design; and
  * mechanically bounded to exact paths/effects;
* replacing an impossible implementation mechanism with another mechanism that preserves the same already-approved security objective.

These are authorized only when they satisfy the complete proof conditions above.

## TRUE HUMAN HARD STOPS

A human owner stop remains mandatory if continuing would require changing **what Nortropic is fundamentally allowed to do**, rather than changing how an already-approved objective is implemented.

Examples include:

* changing `docs/07-konstitution.md` or any explicitly human-owned/human-only authority;
* weakening the fundamental trust or security objective;
* bypassing required confinement;
* allowing unconfined execution because confinement is inconvenient;
* materially broadening filesystem, process, network or credential authority beyond what the approved objective requires;
* introducing a privileged/native broker with a materially new trust model;
* granting generic/self-selected owner authority;
* provisioning or changing external credentials, secrets, GitHub organization identities or other external trust roots requiring a human ceremony;
* destructive external effects outside existing guarded publication semantics;
* contradiction between higher authorities that cannot be resolved under the frozen roadmap;
* a change that materially expands product/roadmap scope rather than satisfying an existing objective;
* any authority migration that cannot itself be mechanically frozen and independently falsified;
* repeated no-progress reaching the existing canonical hard-stop threshold.

## INTERPRETATION RULE

The standing interpretation is:

> **Autonomy includes the right to make mechanically bounded prerequisite changes needed to realize objectives the owner has already approved.**

It does NOT mean:

> **Autonomy includes the right to redefine the objectives, security model, constitution, or fundamental authority when they become inconvenient.**

The system may autonomously change **implementation and bounded internal authority plumbing**.

The system may not autonomously change **its ultimate mandate**.

## PERSISTENCE

Persist this delegation through the normal owner-authority process in the canonical remaining-bootstrap delegation document, or a properly versioned successor if the existing document cannot be safely amended in place.

The amendment itself must be:

* mechanically scoped;
* independently reviewed;
* frozen to an exact candidate identity;
* published through the normal guarded transition;
* verified after publication.

Once canonical, report:

`BOUNDED_PREREQUISITE_AUTHORITY_MIGRATION=ACTIVE`

together with the exact canonical commit/tree and delegation document identity.

After that point, do not ask the human owner for ordinary scheduling or approval of equivalent roadmap-internal bounded prerequisite migrations.

Continue automatically through them and surface only genuine human-hard-stop conditions defined above.
<!-- BOUNDED_PREREQUISITE_AUTHORITY_MIGRATION_SOURCE_END -->
<!-- H038_OS_EXCLUSIVE_RUNTIME_CLEANUP_OWNER_EXCEPTION_V1_BEGIN -->
## H-038 OS-exclusive runtime-cleanup owner exception

**Owner decision:** 2026-09-01. The demonstrated H-038 R9 same-euid name-to-inode
replacement after the last userspace check is binding architectural-impossibility evidence.
Check-then-unlink under the same UID is no longer an admissible implementation, and the
zero-runtime-residue requirement may not be weakened.

The owner authorizes one prerequisite, H-039, and only the minimum OS-exclusive cleanup authority
required to make both properties true: completed cleanup leaves zero registered Nortropic runtime
residue, and completed cleanup cannot delete or replace foreign data through a same-euid race. The
preferred shape is a separate OS identity and root-protected runtime namespace with a small,
digest-bound mediator in a trust domain separate from every existing service. Requests use a
server-issued capability/request identity, never a caller-selected path; protected state derives the
only registered runtime/attempt object. All relevant runtime descendants are terminated and reaped
before destructive cleanup. Installation, executable identity, UID/GID, protected namespace,
request/receipt, crash recovery and cleanup effects must be exact and adversarially verifiable.

This narrow exception supersedes the standing `PRIVILEGED_OR_NATIVE_BROKER_WITH_MATERIALLY_NEW_TRUST_MODEL`
hard stop only for that exact H-039 trust domain and sequence. It grants no general native/root,
unlink/rmdir/rename, filesystem, process, shell/command, Git/publication, network, credential,
dynamic-code, Seatbelt/confinement-bypass, caller-selected, neighboring or cross-service authority.
H-035 only makes the five exact prospective H-039 owner-production files representable and leaves
the registry at schema v2. The strict serial continuation is H-035 parser contract/review/product →
H-034 registry-v3 refreeze/review/publication → mechanically required H-036 registry-only
refreeze/review/publication → H-039 contract/review/product/install review/publication → H-038
refreeze/product/review/publication → H-032 → H-031. No supervisor resume occurs before all are
green. If the minimum H-039 design requires broader authority, this exception does not apply and a
new owner stop is mandatory.
<!-- H038_OS_EXCLUSIVE_RUNTIME_CLEANUP_OWNER_EXCEPTION_V1_END -->
