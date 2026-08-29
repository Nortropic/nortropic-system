# Owner-author workflow v1 — frozen H-035 effect contract

H-035 is the one-time ordinary-pipeline bootstrap from one `allowed_write` authority to two mechanically distinct task classes. Its frozen v1 write surface is the exception; no runtime `task == h-035` bypass may survive activation.

## Canonical authority

Authoritative operation reads canonical `specs/tasks.spec.json` and `specs/owner-production-paths.v1.json` from one Git candidate. Both files must exist in that candidate: absence never falls back to bytes installed beside the running controller. It binds their SHA-256 digests, task id, authority class, base SHA, gate identity/digest, candidate SHA and actual Git changed-file set. Caller-selected spec/registry bytes, expected digests, role strings, environment, provider/session, branch names and agent-reported files are inputs to verify, never authority.

Schema 2 tasks require exactly `authority_class: ordinary|owner_authority`. Ordinary requires non-empty `allowed_write` and absent/empty `owner_author_allowed_write`; owner authority requires empty `allowed_write` and non-empty `owner_author_allowed_write`. `docs_impact` is a subset of the applicable surface. Missing or unknown values reject. A v1 document remains readable only as ordinary and can never infer owner authority.

## One path language

All authority consumers use repository-relative UTF-8 after optional `\\` to `/` normalization. Only exact paths and terminal `/**` prefixes exist. Absolute/drive-prefixed paths, NUL, empty/`.`/`..` segments, leading `./`, repeated or trailing separators, and every other glob form reject. Exact/prefix intersection is one shared oracle. Thus an ordinary exact owner path, child, owner parent prefix, covering ancestor prefix or root-covering prefix rejects consistently in validation, policy, normal task selection, invariant and autopilot scope checks. Normal routing rejects malformed task paths before it persists an owner handoff.

## Actor effects

`ordinary` uses only `allowed_write` and rejects owner-production overlap and, prospectively, authority-control grants. `TEST_AUTHOR` may freeze an explicitly allocated task/spec, registry, gate, fixtures and decision records but never owner-production bytes. `owner_authority` uses only `owner_author_allowed_write`, requires an explicit persisted owner transition, and globally denies task/spec, registry, gates, fixtures, tests and authority-control paths. Provider-neutral implementations inside the same exact owner surface are equivalent.

An owner-author attempt is created only from explicit owner action and a frozen `owner_authority` task with matching canonical spec/registry/base/gate identities and persisted `OWNER_ACTION_REQUIRED`. An ordinary task remains ordinary even if hostile persisted bytes claim an owner state. No full-roadmap, drain, bootstrap, recovery, retry or builder route may synthesize an owner attempt. An owner task whose gate is RED persists `OWNER_ACTION_REQUIRED`, remains nonterminal/unattested, launches no BUILDER, advances no dependent and is not reset on restart. The normal taskval/loop event and the owner transition are one authoritative persisted state machine; a judge-created `current.json` bridge is never part of acceptance. Unknown persisted states reject. Minimal states are `OWNER_ACTION_REQUIRED`, `OWNER_CANDIDATE_REVIEW_REQUIRED`, and `OWNER_FINAL_FREEZE_REQUIRED`.

The controller derives owner candidate SHA and changed files from Git bytes. A candidate binds task, class, base, spec digest, registry digest, gate identity/digest, attempt identity and actual files, and every changed file must fit that task's own `owner_author_allowed_write`, not merely the registry's broader owner-production family. A new independent read-only reviewer is mandatory. Review PASS moves the exact candidate to `OWNER_FINAL_FREEZE_REQUIRED`; it never calls automatic publication. Explicit owner-final action derives current-main from the configured remote and binds candidate, review, base and the observed ref identity before completion/attestation; repeating caller-supplied `main_sha` is not observation. Attestation additionally binds class, spec, registry, gate, transition and review identities. Reviewer PASS, role, candidate or gate PASS alone is never final owner freeze.

The frozen gate's negative and positive production matrices are normative. They exercise parsing, policy, routing, persistence/restart, candidate scope, review and final freeze in disposable local repositories without network. G20 live-filesystem containment remains distinct from Git tree-path authority and must not regress.

## Operational entrypoints frozen by H-035

Production acceptance never calls a case-name probe. Normal ordinary and owner routing, including restart from reconstructed state, enters through `controller/loop/cli run <config.json>`. The config may substitute only disposable Git/state/workspace roots and a disposable provider executable. Selection, claim, authority classification, persistence and launch decisions remain production code. No file, JSON field, PID, environment echo or marker written or reported by the subject proves provider execution. Owner acceptance v6 gives the disposable `/bin/sh` provider a fresh gate-generated nonce argument and externally observes `pid`, `ppid`, `pgid`, `comm` and `args` while it is alive. PASS requires an actual `/bin/sh` leaf whose argv is exactly interpreter, the provider-path spelling passed to exec, and the nonce as a complete token. Real PPID ancestry must lead to the exact gate-started loop PID through exact ordered `brytare`, `utforare` and `launch` entrypoint tokens; every controller stage must have the same exact process image reported for that loop PID, without assuming an untruncated Python basename. Only one optional Seatbelt process between launch and provider is permitted. Controller argv forwarding the same provider and nonce is not provider execution. Process-group equality is not required: launch deliberately starts the provider in a new session. This is the strongest stable process-table relationship: macOS exposes ancestry and argv but does not prove which internal function caused an exec.

V4 had an exact but racy observation window: the provider executed a fixed two-second sleep, sampling began before the controller reached provider launch, each whole-process-table `ps` call consumed part of that lifetime, and sampling stopped when the loop exited. The rejected owner artifact completed only three samples, so a real provider could start and exit between completed snapshots. V5 added a handshake but retained a second, independent provider self-expiry at nominally 15 seconds while the observer window was 18 seconds and a `process_snapshot` begun before the deadline could run beyond both. Independent review reproduced a real ready provider followed by five successful empty snapshots and false FAIL after 20.2722 seconds.

V6 makes observer release the only normal provider-lifetime terminator. Readiness starts a complete 24-second post-ready observation window; each external process snapshot has a five-second hard timeout; and the controller's 45-second cleanup fail-safe is strictly later than the post-ready window, one maximum snapshot overrun and a ten-second cleanup margin. Therefore a snapshot begun just before the nominal deadline concludes before the fail-safe can kill the provider. Release is written in `finally` on PASS, working-observer FAIL and `ODÖMBART`; no-ready and rapid-exit cases reject, and cleanup remains bounded. Readiness and release are synchronization only: neither can yield PASS, and the exact process row plus ancestry remains mandatory. Slow schedules exceeding the prior 20.2722-second counterexample include both a delayed exact PASS and marker-only rejection control. Nested Seatbelt or process-table permission may prevent a decision; such observer/environment failure is `ODÖMBART` (exit 2), never PASS or product FAIL. A working observer that finds no process satisfying the frozen relationship returns FAIL (exit 1). The frozen owner-terminal interface is exactly `verify/bin/h-035-exit --owner-acceptance <candidate-sha> <artifact-path>`. It requires a clean checkout at that exact candidate and writes a raw JSON artifact outside the candidate binding `task`, `candidate_sha`, `gate_sha256`, `spec_sha256`, `acceptance_mode=H035_OWNER_PROVIDER_EXEC_V6`, normal entrypoint, observer version and verdict, loop exit and only the matched provider/ancestor rows plus observer metadata. One candidate-bound execution supplies the verdict; rerunning a failed candidate cannot replace that result as authority. A candidate is not freeze-eligible until this same normal-route subgate returns zero with `provider_process_execution_observed=true` in the authorized macOS owner environment. Output is never committed back into the candidate.

The normal authority-control CLI is `controller/authority/cli`. Its operational commands are:

- `validate-task` — strict canonical task/schema/path validation;
- `validate-registry` — strict authoritative registry consumption;
- `check-candidate` — actual Git-diff scope and identity validation;
- `owner-author` — explicit identity-bound owner authoring transition;
- `recover` — normal persisted-state reconstruction/resume;
- `record-review` — independent review-result transition;
- `owner-freeze` — explicit candidate/review/base/main-bound final transition;
- `path-consistency` — diagnostic comparison of results from the real authority consumers, never an acceptance substitute for those consumers.

Commands consume one strict JSON request on stdin and may emit diagnostic JSON. No returned field is transition authority. The gate snapshots persisted state, bounded workspace effects and local-bare-remote refs before the command and inspects them again afterward. Its filesystem snapshot uses `lstat` without following symlinks and binds the root plus every nested file, empty directory, symlink target, path type, content digest, size, mode and ownership; access/change timestamps are excluded because observation itself may update them. Rejected owner-author/freeze attempts change none of these bytes or properties. This atomicity includes a failure after the authoritative eventlog append but before or during SQLite projection: returning rejection may not leave the event, projection, owner-attempt workspace or remote refs advanced. Cleanup mutants independently prove that deleting the empty failed-projection directory or replacing it with a file cannot collide with the baseline. Explicit owner-author consumes the state written by normal task selection, creates a persisted attempt plus bounded workspace effect only as one accepted transition, and never reclassifies an ordinary task; recovery reads the same persisted state and unknown state remains persisted fail-closed; review PASS persists `OWNER_FINAL_FREEZE_REQUIRED` while remote refs remain byte-identical; exact owner-freeze alone persists `OWNER_FROZEN`, and only while the actual configured remote main still matches its frozen binding. Diagnostic fields must agree but can never replace those observations.

Canonical authoritative operation ignores caller-selected spec or registry paths. Fixture paths are accepted only by separately designated non-authoritative unit-test modes; the commands above resolve both canonical files from the candidate/repository identity supplied to the transition, reject either missing file, and compare caller-provided digests rather than trusting them.

Normal accepted `controller/taskval/cli` claim and `controller/policy/cli` check execution must preserve the immutable repository filesystem. Shared parser loading may use any provider-neutral mechanism, but with `PYTHONDONTWRITEBYTECODE` and `PYTHONPYCACHEPREFIX` absent it creates no repository-local `__pycache__`, `.pyc`, ignored, untracked or tracked runtime byte. Taskval's authorized state effect remains in its configured disposable state root. Disposable clone snapshots measure every non-`.git` path and byte before and after each real consumer; an environment switch that merely hides the write is not acceptance. This does not redefine the separately frozen evidence semantics for a rejected policy decision.

## Strict registry v1 and frozen v2 migration

The registry is a duplicate-aware JSON object with exactly seven keys: `schema_version`, `path_grammar`, `authority_source`, `self_digest_is_authority`, `owner_production_paths`, `prospective_ordinary_protected_paths`, and `owner_author_global_denied_paths`. The initial published state is exactly version `1`; the two authority strings and `false` self-digest value are exact. Each path list is non-empty, contains only canonical grammar paths, and has no duplicates after canonicalization. `owner_production_paths` has exact v1 membership: `controller/h034-native/**`, `verify/h034/kernel`, `verify/h034/build-recipe.json`, and `verify/h034/identity-manifest.json`. Missing, altered, duplicated, or additional membership rejects. A separately owner-reviewed future version requires a new versioned parser and is not accepted as v1.

H-035 R14 is that separately frozen parser migration. It preserves the canonical locator
`specs/owner-production-paths.v1.json`; the locator is not permission to infer a schema version.
The parser may accept exactly these two version/member pairs:

1. built-in integer `schema_version: 1` with exactly the four H-034 owner-production members above;
2. built-in integer `schema_version: 2` with exactly those same four members plus exactly
   `controller/launch/cli`, `controller/launch/runtime_snapshot.py`, and
   `config/python-runtime-authority-v2.json`.

No other version/member pair is valid. Version `1` plus any H-036 member, version `2` without all
seven exact members, versions `0`/`3`, string/bool/float/null/list/object values, a partial +1/+2 transition,
H-036-only membership, missing or substituted old members, arbitrary additions, duplicates,
backslash/leading-dot aliases, neighboring paths and broader prefixes all reject. Membership order
remains immaterial, preserving the v1 set semantics. All six non-owner-production fields and every
consumer of the returned registry retain their prior strict semantics.

Every hostile registry fixture traverses the real `validate-registry`, `validate-task`, Git-derived
`check-candidate`, `owner-author`, `record-review`, `owner-freeze`, and normal prospective-task
policy consumers. Every expected rejection must leave persisted state, bounded workspace and
local-bare-remote refs byte-identical, catching a parser fixed for only one command. The membership
matrix applies omission, substitution, duplicate, backslash alias, leading-dot alias and the
applicable broader prefix separately to each of the four old members under v1 and each of all seven
old-plus-new members under v2. Arbitrary-addition, new-only and partial-transition controls remain
separate. The version/type matrix crosses both legal membership sets with integers 0/3,
string/bool/float/null/list/object values and the two integer cross-pairs. Mechanical cardinalities
are 66 per-member one-defect states plus four additional membership controls, 24 version/type and
membership cross-cases, and 52 retained non-owner-semantic defect states.

Each of the five retained non-owner semantics—exact `path_grammar`, exact `authority_source`, exact
false `self_digest_is_authority`, and the two non-empty canonical unique path lists—is defect-tested
under both legal version/membership states. Type, empty, malformed path, non-string value, simple
duplicate, canonical backslash-alias duplicate, wrong scalar value and duplicate JSON-key cases
apply where meaningful. Positive alternate list values prove that list membership remains registry
authority rather than parser constants; overlapping/reordered canonical entries and a valid
backslash spelling remain accepted exactly as before. Under both legal states, every canonical list entry
and every entry in a separate pairwise-non-overlapping distinguishing fixture is causally
consumed through its own singleton task and distinguishing changed path. Each prospective-protected
entry must independently cause exact protected-authority rejection in ordinary validate-task,
ordinary changed-candidate checking and normal policy. Each global-denied entry must independently
cause exact global-deny rejection in owner validate-task and changed-candidate checking with actor `owner_authority`.
Every rejected call preserves persisted state, bounded workspace and bare-remote
refs. The arbitrary prospective probes are disjoint from owner production, while every arbitrary
global-deny probe remains otherwise permitted by owner production; removing its intended list entry
therefore reaches acceptance rather than a secondary outside-owner rejection. The legitimate
overlapping/reordered and single-backslash variants remain separate positives,
never evidence that one overlapping entry caused another entry's denial.

Exact and reordered v1/v2 positives traverse the same material consumers. Under both exact and
reordered v2, retained H-034 separately proves validate-task, the base-only owner chain, changed
H-034 candidate checking with one candidate touching all four retained members, plus one
singleton-surface ordinary-policy H-034 protection control per member; H-036 new3 has the corresponding full-surface
positive chain. Owner-author/review/freeze use `candidate_sha == base_sha`, while separate changed
H-034/H-036 candidates exercise owner `check-candidate`. Ordinary/TEST_AUTHOR changed-candidate,
neighboring, parent and prospective ordinary-policy controls reject for their exact post-parser
reasons.

The preproduct invocation is exactly `verify/bin/h-035-exit --r14-registry-migration`. Its nonzero
result is authorized only when the sole failed top-level label is
`A_R14_EXACT_TWO_STATE_REGISTRY_OPERATIONAL`, the reason is exactly
`V1_ONLY_CORE_REJECTS_EXACT_SCHEMA_V2_AND_ACCEPTS_BOOL_FLOAT_VERSION_ALIASES`, and the failure
signature is exactly the frozen v2-positive, v2-causal, v1-bool and v1-float gaps. Every additional,
missing, reordered or differently caused failure is `UNEXPECTED_RED`; a zero-failure invocation
without product identity is `PRODUCT_IDENTITY_REQUIRED`, never product credit.

This H-035 contract candidate does not edit the canonical registry and creates no H-036 task or
product byte. TEST_AUTHOR is bounded to `specs/tasks.spec.json`, `verify/bin/h-035-exit`, this
document, `docs/05-beslutslogg.md`, and `docs/loop/drift.md`. The separate product candidate's
actual changed-file set is exactly `controller/authority/core.py`, even though H-035's historical
bootstrap `allowed_write` remains broader. The later H-034 downstream rebind/refreeze alone owns
changing the canonical registry to the exact v2 state and must be independently reviewed and
guardedly published before H-036 proceeds. `verify/bin/h-036-exit` remains a TEST_AUTHOR/global-deny
contract path, never an owner-production member.

The product-bound invocation is exactly
`verify/bin/h-035-exit --r14-registry-migration <base-sha> <candidate-sha>`. PASS requires a clean
checkout whose HEAD is that exact lowercase candidate commit, whose sole parent is the reviewed
base, whose no-renames Git changed-file list is exactly `controller/authority/core.py`, and whose
candidate-tree task spec and H-035 gate bytes equal the executing bytes. A disposable positive plus
explicit core-and-CLI out-of-scope, safe-only and stacked-candidate mutants mechanically test this
predicate. Independent product review and guarded publication bind the same base/candidate pair and
successful product invocation; inert metadata or the legacy broad H-035 `allowed_write` grants no
product publication authority. Standard and product-bound modes run the same complete membership,
version/type and retained-non-owner operational matrix before product scope can receive credit.

The concrete bounded-prerequisite proof binds all standing conditions. BP01/BP02 are the v1-only
parser's reproducible rejection of the exact v2 state; BP03/BP04 restrict the migration to making the
already-authorized H-036 representable without changing Seatbelt, confinement or the trust
objective; BP05 binds task, dependency, paths, TEST_AUTHOR/product surfaces, the versioned
transition and effects; BP06/BP07 require two literal states and the full hostile membership matrix;
BP08 retains exact v1 behavior; BP09 freezes this contract before product; BP10/BP11 require separate
exact-identity gate and product reviews; BP12 permits only the named preproduct R14 RED while all
other applicable checks remain green; BP13 requires the existing guarded non-force publications;
and BP14 requires the published H-034 v2 refreeze before continuation.

The exact serial order is:

`H035 R14 TEST_AUTHOR freeze → independent gate review → guarded contract publication → core.py-only BUILDER product → independent product review → guarded product publication → H034 registry-v2 refreeze → independent review → guarded publication → H036 TEST_AUTHOR freeze → independent gate review → H036 BUILDER implementation → independent product review → guarded publication → H032 refreeze against published H036 → independent review and guarded publication → H031 rebind`.

Any registry mutation during H-035, H-036 task/product creation during H-035, generic,
caller-selected, wildcard, parent or neighboring authority, Seatbelt/confinement bypass,
unconfined execution, a native broker, or broader filesystem/process/network/credential authority
is outside this contract and fails closed.

<!-- H037_VERIFY_SUITE_REGISTER_REBIND_CONTRACT_V1 -->
## H-037 exact verify-suite register rebind

After the R14 product was published, the human-owned constitution-v18 transition changed the exact
bytes of `workflows/nortropic-verify-suite.js` to SHA-256
`7c02f12ef7d4f6991fafa0c9a19753ccfb2b8d785c746212025864a4158a3373`, while
`controller/verify/register.json` retained
`ac1e21d1c5097c2b087054ef44ca7339e1a4aa78b8f3f8dc207b17633e5983ab`. The real command
`./controller/verify/cli preflight` therefore exits 4 with `hash_mismatch` before the bootstrap can
use its ordinary live route. H-017's published 24/0 fixture result does not satisfy H-037: the new
gate invokes this real preflight and binds its actual exit, stderr and register digest.

H-037 is the narrow standing bounded-prerequisite exception for this blocker. H-037 depends exactly on H-035
and its builder `allowed_write` is exactly `controller/verify/register.json`. Normal
`roadmap_candidate_scope` continues to protect that path; neither the autopilot nor its protected
set is changed or bypassed. Candidate construction is a direct clean candidate under the standing
BP01–BP14 migration authority, followed by the existing exact-identity independent review and guarded
non-force publisher. This is not a generic roadmap exception and grants no caller-selected path,
digest, runner, startbar or verifier authority.

The sole product effect replaces that one old digest token with the exact new digest token. The
register SHA-256 changes from
`c99f3b37411c9e3acc7a6f26cead51afddb3b80729e98a4d77a5f16460bc1442` to
`a87869be0bcfcd1e04cbd494f99e132fde1ce282dd75801cd9b1b33968b14460` without changing length.
Every other byte, key, key order and entry semantic remains identical, including the complete
`check-invariants` entry and the suite entry's path, runner, startbar, description and non-digest
fields. Workflow, fixture, constitution-v18, real preflight CLI, H-017, check-invariants and
autopilot bytes are unchanged.

The preproduct command is exactly `verify/bin/h-037-exit`. Its only authorized RED is label
`A_H037_EXACT_VERIFY_SUITE_REGISTER_REBIND_OPERATIONAL`, reason
`CANONICAL_PREFLIGHT_HASH_MISMATCH_SUITE_SHA256_STALE`, and the frozen four-part old/new real-
preflight signature. After the exact product it is a normal green no-argument gate. Product
acceptance is exactly
`verify/bin/h-037-exit --product <base-sha> <candidate-sha>` and additionally requires a clean exact
candidate, its single parent equal to the reviewed base, the no-renames Git diff equal to the one
register path, candidate-tree spec/gate identity, the exact raw-byte transition and real preflight
exit 0 returning the exact post-register digest. The real suite `check` also exits 0 with the new
digest, while a real suite `run` remains refused with exit 3 as `ej startbar`. Wrong digest, path,
runner, startbar, check-invariants, extra, duplicate, reformat, out-of-scope, workflow and stacked
mutants reject.
Any second product path is a fail-closed stop.

H037-RV-01 closes the product-identity observation boundary without broadening product or publisher
authority. Every product-identity Git invocation uses the pinned absolute executable `/usr/bin/git`
(SHA-256 `506cb2ddd061e2992c8ee7c53853340688b53d9fcec94c3aa936524cea5b40cb`, clean-launcher
attestation `git version 2.50.1 (Apple Git-155)`). The invocation receives an exact closed allowlist
with a private `DARWIN_USER_TEMP_DIR`: no ambient Git, config, attribute, pager, trace, loader,
`GIT_TEST_*`, `DEVELOPER_DIR`, `TOOLCHAINS` or `SDKROOT` value survives. It uses explicit
`--no-replace-objects`, `--no-pager`, `--literal-pathspecs`, canonical per-worktree git-dir,
common-dir and physical work-tree. Canonical literal candidate commit headers bind the one parent
and must agree exactly with the closed, no-replace Git graph; a direct candidate-tree/physical-
worktree comparison—not status/index claims—binds HEAD cleanliness. The real verifier effect uses
the same closed process environment.

Connected disposable actual-Git controls accept the legitimate publisher shape—a two-parent guarded
contract-merge base followed by its exact direct one-file product—and reject a replace mapping on a
genuine stacked SHA, `GIT_WORK_TREE` redirection, a skip-worktree crafted index hiding dirty bytes,
graft and shallow topology rewrites, config/attribute injection, a PATH-shadowed `git` parent lie,
the genuine stack and an extra-parent product. The PATH control separately proves that the shim is
not executed by identity observation. This is a judge hardening only: it creates no generic roadmap
exception, changes no publisher behavior, and grants no second production path.

H037-RV-02 closes the raw object-identity boundary. Commit objects must contain one tree header,
one contiguous parent block before exactly one valid author and committer, and then only legitimate
encoding, `gpgsig`, `gpgsig-sha256` or `mergetag` headers with canonical continuations. The closed
no-replace graph must exactly match every literal parent block. The exact validated set from
`rev-list --objects --no-object-names <base> <candidate>` is fed as literal OIDs—not revisions—to a
no-reuse, zero-window pack and imported into a fresh ref-free SHA-1 quarantine. Promoted strict
index checks, self-contained/connected validation, isolated strict fsck and batch-all object-set
equality precede raw parsing of every reachable commit and tree. Tree entries require Git's
canonical byte ordering, unique safe names and canonical modes. Every non-gitlink target must be
present with exact mode/type agreement; a locally present gitlink must be a commit, while an absent
external submodule commit remains legitimate. The ambient object database is never fsck credit.

Connected `hash-object --literally` controls reject late parents after committer or signature even
where Git fsck is blind, missing author/committer, duplicate tree/author, unsorted or duplicate
trees, bad modes/names and missing trees/entries. Both the ordinary two-parent publisher merge and
a legitimate signed/encoding two-parent publisher merge followed by an exact direct product remain
positive; there is no blanket rejection of signing, encoding or gitlinks.

H037-RV-03 binds the product path from raw trees rather than revision/path shorthand. Base and
candidate each must contain exactly one literal `controller/verify/register.json` record reached
through exact `40000 tree` parent entries; the leaf must be exactly `100644 blob`, its object must
exist as a blob, and its bytes/digests must equal the frozen pre/post register identities. Connected
literal-tree mutants reject a `100755` leaf, symlink, gitlink, tree, missing or duplicate record,
invalid mode and mode/type mismatch. RV-02/RV-03 remain within the same judge assertion, so the
sole preproduct result stays 35 PASS / 1 authorized FAIL and explicit product mode stays 38/0.

This contract publication does not alter the currently green downstream lifecycle assertions:
H-034 remains exactly dependent on H-035, and both `verify/bin/h-034-exit` and
`verify/bin/h-035-exit` remain byte-identical. Only after the H-037 product has been independently
reviewed and guardedly published may the separate H-034 TEST_AUTHOR refreeze change H-034's exact
dependency to H-037 and update the affected H-034/H-035 lifecycle assertions. That refreeze itself
requires independent review and guarded publication before H-036 begins. The objective order is
therefore exactly `H-037 → H-034 → H-036`; no silently red H-034 gate and no inherited fixture
credit are permitted.

The BP01–BP14 proof is concrete: BP01/BP02 are the reproduced real-preflight blocker; BP03/BP04
restrict the change to restoring exact hash-bound judgeability; BP05 binds task, dependency, path,
allowed-write, transition and effect; BP06/BP07 deny generic and neighboring authority with the
exact-byte/mutant matrix; BP08 preserves all other registry and historical semantics; BP09 freezes
this contract before product; BP10/BP11 require separate immutable contract/product reviews; BP12
allows only the named preproduct RED while H-017 24/0 supplies no H-037 product credit; BP13 keeps
both publications guarded and non-force; and BP14 requires the later explicit H-034 rebind before
H-036. The serial happens-before chain is H037 TEST_AUTHOR, gate review, contract publication,
register-only BUILDER, product review, product publication, H034 refreeze/review/publication, then
H036 TEST_AUTHOR/build/review/publication.

## Production traceability

```text
PROPERTY=owner RED routing and ordinary positive control
SUBJECT=controller/loop/cli
ENTRYPOINT=run <config.json>
FIXTURE=disposable state/workspaces plus externally observed disposable provider process image
CURRENT_RESULT=owner task reaches ordinary claimed state; ordinary effect requires candidate-bound owner acceptance when nested exec is denied
FUTURE_REQUIRED_RESULT=owner persists OWNER_ACTION_REQUIRED without provider; ordinary provider executable is actually exec'd
CLASS=PRODUCTION_ACCEPTANCE

PROPERTY=restart/recovery persistence and unknown-state refusal
SUBJECT=controller/loop/cli plus controller/authority/cli
ENTRYPOINT=run <same config> in a new process; recover
FIXTURE=same disposable persisted state
CURRENT_RESULT=owner state is ordinary claimed, not OWNER_ACTION_REQUIRED
FUTURE_REQUIRED_RESULT=owner state preserved in artifacts; unknown state remains persisted fail-closed
CLASS=PRODUCTION_ACCEPTANCE

PROPERTY=task, docs_impact, registry and path-language authority
SUBJECT=canonical task/registry consumers used by policy, envelope and routing
ENTRYPOINT=every real validate/policy/envelope/loop/owner-transition/invariant consumer; path-consistency is diagnostic only
FIXTURE=canonical candidate plus one-defect inputs
CURRENT_RESULT=operational authority component absent
FUTURE_REQUIRED_RESULT=every enumerated real registry/path consumer rejects each one-defect mutant consistently
CLASS=PRODUCTION_ACCEPTANCE

PROPERTY=actor and candidate scope
SUBJECT=actual Git changed-file policy
ENTRYPOINT=check-candidate
FIXTURE=disposable Git candidates; reported file lists are hostile input
CURRENT_RESULT=operational authority component absent
FUTURE_REQUIRED_RESULT=ordinary/TEST_AUTHOR/owner-author scopes enforced mechanically
CLASS=PRODUCTION_ACCEPTANCE

PROPERTY=explicit owner authoring
SUBJECT=owner transition and external author-process boundary
ENTRYPOINT=owner-author
FIXTURE=identity-bound disposable owner task/state/workspace
CURRENT_RESULT=operational authority component absent
FUTURE_REQUIRED_RESULT=negative bindings leave state/workspace unchanged; exact binding persists attempt and creates bounded workspace
CLASS=OWNER_TRANSITION_ACCEPTANCE

PROPERTY=review publication guard and final freeze
SUBJECT=review-result and owner-final transitions
ENTRYPOINT=record-review; owner-freeze
FIXTURE=disposable candidate and local bare remote
CURRENT_RESULT=operational authority component absent
FUTURE_REQUIRED_RESULT=review PASS persists final-freeze-required with identical remote refs; exact explicit freeze alone persists frozen state
CLASS=OWNER_TRANSITION_ACCEPTANCE

PROPERTY=path parser and registry judge integrity
SUBJECT=frozen gate local oracles
ENTRYPOINT=internal J_* controls
FIXTURE=one-defect mutants
CURRENT_RESULT=PASS
FUTURE_REQUIRED_RESULT=PASS
CLASS=JUDGE_SELFTEST

PROPERTY=independent-review remediation H035-IR-01..07
SUBJECT=normal taskval state handoff; owner-author class; task-specific owner scope; normal policy; owner-freeze remote binding; canonical authority loading; normal-route path validation
ENTRYPOINT=controller/taskval/cli claim → controller/authority/cli owner-author; controller/authority/cli check-candidate; controller/policy/cli check; controller/authority/cli record-review → owner-freeze; controller/authority/cli validate-registry
FIXTURE=canonical disposable Git candidates, one authoritative state directory, bounded owner workspace, and isolated bare refs/heads/main advanced after review
CURRENT_RESULT=the remediated builder implementation closes H035-IR-01..07; the frozen gate remains the verdict authority
FUTURE_REQUIRED_RESULT=all seven production guards and their legitimate positive controls pass
CLASS=PRODUCTION_ACCEPTANCE

PROPERTY=rejected owner-author atomicity under projection failure
SUBJECT=normal taskval eventlog plus operational owner-author persistence/workspace transition
ENTRYPOINT=controller/taskval/cli claim → controller/authority/cli owner-author
FIXTURE=disposable canonical owner task/state/workspace/bare remote with state.db replaced by a directory after the normal handoff
CURRENT_RESULT=rejected owner-author leaves OWNER_CANDIDATE_REVIEW_REQUIRED event and owner-attempt workspace behind
FUTURE_REQUIRED_RESULT=nonzero accepted:false with byte-identical state and workspace across root/files/empty directories/symlinks/path types/content/mode/ownership, plus identical remote refs; normal successful eventlog handoff still passes
CLASS=PRODUCTION_ACCEPTANCE

PROPERTY=normal taskval/policy repository write containment
SUBJECT=controller/taskval/cli and controller/policy/cli
ENTRYPOINT=ordinary claim and accepted safe candidate check without Python bytecode-control environment
FIXTURE=separate clean disposable repository clones plus external disposable state/spec roots
CURRENT_RESULT=both consumers create controller/authority/__pycache__/core.cpython-312.pyc
FUTURE_REQUIRED_RESULT=expected external effects succeed while every non-.git repository path and byte remains identical
CLASS=PRODUCTION_ACCEPTANCE

PROPERTY=task-specific owner gate identity H035-H034-INTEGRATION-01
SUBJECT=the exact owner task row's exit_test and regular gate blob in the exact candidate Git object
ENTRYPOINT=owner-author; check-candidate; record-review; owner-freeze
FIXTURE=two disposable owner tasks with distinct gates plus wrong-path/digest, cross-task, caller-override, missing, tree, symlink and changed-gate mutants
CURRENT_RESULT=the R12 implementation resolves every canonical gate filename with literal Git pathspec semantics from the exact candidate object through all four consumers; the frozen gate reports 230 PASS, 0 FAIL
FUTURE_REQUIRED_RESULT=the four-command task-specific positive chain freezes; every mutant rejects with byte-identical state/workspace/remote refs; H-035 still binds verify/bin/h-035-exit and owner author cannot modify any task's own gate
CLASS=PRODUCTION_ACCEPTANCE
```

No material exit property is established only by a judge self-test, returned JSON, source shape, or a subject-forgeable marker. Synthetic `probe`, `authority-probe`, `path-consistency`, and helper-only registry validation are `JUDGE_SELFTEST_ONLY`; they can never satisfy a production exit clause.

## Production activation

Builder candidate `5389516e01b12f47a91f2c22ea94db0915d62ec3` is rejected gate evidence. Its R7 logical filesystem snapshot remains accepted, and one authorized V5 artifact observed the exact process chain, but independent slow-schedule review proved the nominal 15-second provider self-cap could expire before the observer concluded. R8 versions the observer to V6 with the mechanically ordered release/fail-safe relationship above and preserves every exact V4 identity/topology/false-positive control plus the R7 snapshot and R5/R6 production controls. Current production remains RED only on RV01/RV02; `MATERIAL_PROPERTIES_JUDGE_ONLY=NONE` remains mandatory.

Builder candidate `749cce4ebc23edf69eea1adb570975ad552908c2` is rejected implementation evidence. Independent review found that R6's file-only digest could not distinguish an empty failed-projection directory from its deletion, and that V4's unsynchronized two-second provider lifetime produced one false negative after only three process-table samples. R7 retains both production failures as RED, replaces the atomicity comparison with the complete logical filesystem snapshot described above, and versions the single-run owner observer to V5 with a gate-owned bounded lifetime handshake. The handshake is never verdict authority; all V4 exact argv, path, nonce, ordered ancestry, controller-image, optional Seatbelt, split-PGID and false-positive controls remain. `MATERIAL_PROPERTIES_JUDGE_ONLY=NONE` remains mandatory.

Builder candidate `3927ab145e3d894b1dcab6c78eba63a244a68342` is rejected implementation evidence. Although it closes H035-IR-01..07, independent review found that a projection failure can reject owner-author after advancing both eventlog and owner workspace, and that normal taskval/policy imports write Python cache bytes into the immutable repository. R6 freezes both as production effects through the real consumers. The projection-failure case compares state, workspace and actual bare-remote refs around the rejected command; separate clean clones execute normal task selection and policy without cache-control environment variables and compare the entire non-`.git` filesystem. `MATERIAL_PROPERTIES_JUDGE_ONLY=NONE` remains mandatory.

The R8 production remediation makes a rejected state append restore the exact pre-append eventlog length when the SQLite projection cannot commit, and owner-author removes its prewritten bounded workspace before returning that rejection. Successful eventlog-first persistence remains unchanged. Taskval and policy disable interpreter bytecode emission before loading the shared authority parser, so normal execution without cache-control environment creates no repository-local runtime byte.

Owner-final-frozen candidate `fdd7b0cc04a56303cb13af34edc8f43f91338d6e` remains immutable implementation evidence, but H-034 test-author integration exposed `H035-H034-INTEGRATION-01`: operational authority names `verify/bin/h-035-exit` as a controller constant instead of resolving each owner task's own canonical `exit_test`. R9 freezes the correction without creating or editing H-034. For `owner-author`, `check-candidate`, `record-review`, and `owner-freeze`, the task id selects exactly one row from `specs/tasks.spec.json` in the exact candidate commit; that row alone selects the gate path, and the same commit must contain a regular non-symlink Git blob at that path. The request's path and SHA-256 must agree with the derived identity but cannot select it. Missing/tree/symlink gates, a changed gate, a different task's gate, and explicit caller override fields reject before any material effect. The task-specific gate is always treated as owner-author globally denied even if a future owner surface would otherwise cover it. H-035 itself remains bound to `verify/bin/h-035-exit`; all 171 pre-R9 controls, V6 observation, R7 snapshots, RV atomicity and cache hygiene remain normative. `MATERIAL_PROPERTIES_JUDGE_ONLY=NONE` remains mandatory.

Independent review of R9 candidate `a2a82262aa6b5cfd146290d802be4360ea84e14b` found two gate coverage seams. R10 requires complete independent positive chains for both disposable owner tasks A and B, whose canonical gate paths and bytes are distinct; an implementation that refuses B cannot pass. It also proves that the candidate Git object—not mutable checkout state—is authority: with one candidate SHA held constant, four full positive chains replace that checkout gate path with hostile regular bytes, a directory, a symlink and absence. The exact candidate object must still pass. Conversely, a different exact Git candidate carrying altered gate bytes must reject the previous digest through all four operational consumers without changing state, workspace or refs. These controls bind effects only and permit any implementation using equivalent Git plumbing. Every R9 negative and all prior 171 controls remain normative; `MATERIAL_PROPERTIES_JUDGE_ONLY=NONE` remains mandatory.

The R10 production remediation removes the H-035 gate constant. The selected canonical owner task's `exit_test` is parsed as one exact path, resolved by exact candidate tree mode, required to be a regular `100644` or `100755` Git blob, and hashed from that blob object rather than the checkout. Owner-author, candidate check, review and final freeze all verify the caller's gate fields against that derived identity; candidate check and every material transition independently reject a candidate that changed its own task gate. Distinct owner tasks therefore bind distinct gates without task-id special cases, while hostile mutable checkout bytes and path types are irrelevant.

Independent review rejected R10 builder candidate `d553d80530476c2096ff930eabd0a3a27bed7b5f` on `H035-R10-RV-01`. The shared path grammar accepts exact UTF-8 repository filenames beginning with Git pathspec-magic syntax, but the implementation passed them unescaped to `git ls-tree`. R11 preserves every prior 216 control and adds two independent complete positive chains whose literal candidate blob names begin `:(literal)` and `:(top)`. Fixture creation itself uses Git's literal-pathspec mode, proving the exact names exist rather than allowing the fixture command to reinterpret them. Each chain must complete owner-author, check-candidate, record-review and owner-freeze with the normal persisted-state, bounded-workspace and bare-ref observations. Thus a consumer may use any equivalent Git object lookup, but may not rewrite, reject or interpret a canonical filename as a pathspec program. `MATERIAL_PROPERTIES_JUDGE_ONLY=NONE` remains mandatory.

Independent gate review rejected R11 candidate `cf38404f3f793a4c97489aaf0442ea723f041a41` on `H035-R11-GR-01`: the new pathspec positives left mutable checkout bytes equal to the candidate, so a narrow `:(...)` checkout fallback greened all 219 theoretical controls. R12 composes the literal and top filenames with four candidate-stable hostile checkout variants—different regular bytes, directory, symlink and absence—and runs a fresh complete owner chain for each. The inverse control changes the exact committed literal gate while retaining its prior digest and requires all four consumers to reject without state, workspace or ref effects. A UTF-8/space filename stored as a `100644` regular blob remains a full-chain positive. These are effect observations only: a generic literal candidate-object resolver passes, while any path-class-specific checkout fallback fails. All prior controls remain normative and `MATERIAL_PROPERTIES_JUDGE_ONLY=NONE` remains mandatory.

The R12 production remediation changes only the Git invocation used by the shared regular-blob resolver: `git --literal-pathspecs ls-tree` treats the already validated canonical task path as repository data. Tree mode, object id and blob bytes still come from the exact candidate object, with no checkout fallback. Consequently literal/top names, hostile checkout compositions and the UTF-8/space `100644` gate pass through every consumer, while the changed-candidate literal digest mismatch still rejects without effects.

Candidate `fe6010cfec149511559c33c7c67812fe45bc6be1` is rejected implementation evidence, not an activation authority. Independent review found seven material seams that the prior frozen gate did not exercise. The strengthened gate keeps the V4 owner observer and prior controls, but production acceptance now chains the normal event state into owner-author, uses an ordinary task against owner-author, narrows an owner candidate to its task-specific surface, executes the exact ordinary policy CLI used by the loop, advances the actual bare-remote main before freeze, removes fixture dependence on installed authority bytes, and sends the malformed path corpus through normal task selection. These are all `PRODUCTION_ACCEPTANCE`; `MATERIAL_PROPERTIES_JUDGE_ONLY=NONE`.

The H-035 implementation keeps this contract's authority inputs frozen. `controller/authority/core.py` is the single parser for strict registry JSON and repository paths; operational transitions enter through `controller/authority/cli`. Candidate scope is derived from Git, never from `reported_changed_files`. Schema-v2 owner tasks are persisted by task selection as `OWNER_ACTION_REQUIRED` with no ordinary provider output, and that state remains ineligible after process restart. Explicit owner authoring consumes and extends the same eventlog-backed state when normal task selection initiated the handoff; legacy direct-transition fixtures keep one `current.json` state rather than being silently migrated to a second store. The canonical task must itself be owner authority, candidate scope is restricted to that task's exact owner surface, and review/final-freeze extend the same record without changing remote refs. Final freeze independently reads the configured remote's live `refs/heads/main` before persisting completion.

Operational authority documents are loaded only from the supplied Git candidate: absence of either canonical spec or registry rejects. Normal task selection applies the shared strict path language before appending an owner event. Normal schema-v2 ordinary policy rejects prospective grants overlapping either owner production or authority-control paths, while preserving safe ordinary surfaces. “Prospective” is derived from Git history: a task absent from the canonical task spec at the registry's first reachable activation commit is post-activation; this preserves historical task verdicts without a task-name bypass. This activation check applies to the canonical repo spec used by production policy; explicitly substituted specs remain non-authoritative fixture inputs.

The historical H-035 bootstrap authorization is not implemented as a runtime `task == h-035` allowance. The already approved builder candidate is the one-time exception. Once these consumers are active, ordinary candidate checks use the registry's prospective protected set and reject owner-production or authority-control paths, including paths that were necessarily writable while H-035 itself was built. No file in the reserved H-034 families is created by this activation.

## Current-authority bounded delegation and publication

The versioned owner workflow delegation is
`docs/loop/remaining-bootstrap-delegation-v1.md`. For its exact remaining-bootstrap chain,
owner-final freeze and publication require no interactive human action only after every frozen
mechanical identity, scope, gate, independent-review, empirical, cleanliness and remote prerequisite
passes. Absence or mismatch remains rejection; role/session/model claims never replace proof.

Immediately before publication the production publisher must re-fetch and atomically relock the
exact `Nortropic/nortropic-system` repository, `origin/main` equal to frozen base, clean local
candidate and tree, remote candidate ref, open PR base/head names and exact base/head SHAs, exact PR
file set, and frozen spec/gate/review identities. It must invoke GitHub with guarded normal merge
commit (`gh pr merge --merge` plus exact head guard). Rebase, squash, force and all history rewrite
are rejected. After GitHub reports merged, it fetches main and proves the returned merge SHA is
`origin/main`, has exactly two parents in order—parent 1 frozen base and parent 2 exact reviewed
candidate—and has the reviewed candidate tree. Repository settings that also permit rebase/squash
do not grant those methods. The complete bounded terms and irreducible stop boundary live in the
single delegation document; this document remains the operational H-035 contract.

Frozen acceptance invokes that actual publisher using a hermetic GitHub command boundary and real
disposable Git repositories. It accepts only the observed end-to-end effects and ordering above;
source strings, dead code and returned claims cannot substitute for the pushed refs, revalidated
metadata, merge command, GitHub merged transition, fetched merge object, parent order or tree.
The publication request carries the exact task id, candidate-bound task-spec path and SHA-256,
candidate-bound gate path and SHA-256, and immutable independent-review artifact path and SHA-256.
The publisher itself re-reads and verifies these identities immediately before merge. After the
supported GitHub fields `state`, `mergedAt`, `mergeCommit` and `headRefOid` prove the merged
transition, the publisher itself fetches main and executes the exact main/SHA, ordered-parent and
candidate-tree checks. Judge-side inspection only corroborates those effects and cannot replace
their presence in the publisher's process trace.
Invocation is not validation: each GitHub and Git result must control publisher success. With the
actual merge graph held valid, hostile returned main, parent-list, candidate-tree or merge-tree
values must make the publisher raise before success. With malformed actual graphs, the same is
required for returned merge identity, one/reversed/extra parents and wrong tree. A publisher that
issues every probe but ignores every output is rejected even though its command trace is complete.
The process boundary is installed before the publisher module executes. Therefore aliases captured
at module load for `subprocess.run`, `Popen`, `check_output`, `check_call` or `os.system` remain
audited after the normal module names are restored. Only required Git/GitHub executables are
permitted during publication; an absolute unexpected executable is denied and makes acceptance
fail. Absolute Git and each captured API remain valid for legitimate audited Git operations.
Executable authorization binds the canonical path and SHA-256 of the real Git/GitHub tools resolved
before subject load; basename alone is never authority. Bare names resolve only through that frozen
host PATH identity, and harness-owned symlinks are accepted only when canonicalization reaches an
audited executable. Absolute fakes, hostile PATH shadows, changed executables and even byte-identical
copies at a different canonical path are denied before execution.

The production implementation activates this workflow through `controller/authority/cli` and the
single parser in `controller/authority/core.py`. Publication is implemented by the production
`publish()` callable in `scripts/nortropic-codex-autopilot.py`; its required
`publication_authority` object is mandatory rather than inferred from session prose. It performs no
push or merge unless every pre-publication identity check succeeds, and it returns success only
after its own fetched-main, ordered-parent and tree proof succeeds.

<!-- H036_PRE_SANDBOX_RUNTIME_SUPERVISOR_CONTRACT_V1 -->
## H-036 pre-sandbox runtime supervisor

H-036 depends exactly on published H-034. The prerequisite publication is merge
`b17d0941f9376505f2bf76f4ce10b3019d978054`, tree
`4a22c991b2bba098239f492bd9fc1e06cc8cd1c6`, with ordered parents `deee7955…` then
reviewed candidate `e60fbc40…`. The persisted independent READY review is bound by SHA-256
`2ce3f996eb6d2fd6c338f728d545ed25caea9ba0c99dd3676c17e1e595e27474`; H-034's gate and
registry remain exact published bytes. Its `--r15-registry-refreeze` checks were intentionally
time-scoped to require H-036 absent before H-034 publication. Once this task and gate exist those
two early-phase labels are expected RED: that completed-phase result is not a post-H-036 green
regression, cannot mask drift, and does not authorize editing H-034.

The only owner product surface is `controller/launch/cli`,
`controller/launch/runtime_snapshot.py`, and `config/python-runtime-authority-v2.json`. The
TEST_AUTHOR surface is only the task spec, new gate, this authority record, decision log and drift
record. Product acceptance is `verify/bin/h-036-exit --product <base-sha> <candidate-sha>` on an
un-nested authorized macOS host. It binds a clean direct single child from raw Git objects, exactly
those three paths and modes `100755`, `100644`, `100644`, no renames, at most 2400 cumulative added
lines, and unchanged frozen task/gate bytes. Once any product byte exists, an unbound no-argument
checkout returns `PRODUCT_IDENTITY_REQUIRED`; only the exact object-bound invocation can earn
subject credit. H-017 is preserved historical evidence only and never
credits the runtime subject.

The first authoritative call is the protected same-byte Python 3.12.13 snapshot with exact
`-I -S -B`, the live launcher and the existing `run <workspace> <envelope> <timeout> -- <argv>`
interface. V2 inherits the exact v1 authority file and digest; `-B` is a distinct additive no-pyc
invariant, not a reinterpretation of v1's `-I -S`. The launcher stable-opens and nofollow-binds the
v1 Python source, live launcher/helper/config and live Git root by bytes, mode, dev/ino and adjacent
final rehash. It creates a fresh `/private/tmp/.nortropic-h036-runtime-*` family, copies the exact
Python bytes into it, protects root and snapshot as `0500`, binds the socket `0600`, and starts the
exact live Python helper as the sole pre-sandbox supervisor. System Python 3.9, a relocated
launcher/helper, path lookup, config/session/socket override, and a native or external broker are
not equivalent mechanisms. The dynamic gate proves private-runtime mode/digest/symlink and ignored
helper/config/profile/live-root override negatives. At every pre-go barrier it independently
discovers the sole newly created runtime root, stable-opens its direct regular nofollow `0500`
Python snapshot and requires that supervisor and helper execute that same exact-digest/dev-ino
object; caller canonical/private Python paths are inputs, never the internal execution identity.
Deterministic runtime canaries prove create/write/rename/unlink/hardlink/mkdir operations denied and
their exact bytes, modes and link counts unchanged. A `0500` root containing a `0700` Python file is
not equivalent. The gate does not overclaim a universal same-UID pre-sandbox race experiment:
reachability and order of same-opened live-root/config/helper identity and final-use rehash are
mandatory immutable-object review findings.

The supervisor receives a closed controller-derived environment (`LANG=C`, `LC_ALL=C`,
`PATH=/usr/bin:/bin`), exactly its control/ready descriptors under `close_fds`, and no ambient
credential, loader, Git, Python or requester path authority. Requests contain strict bounded framed
bytes and exactly three already-open stdio descriptors through `SCM_RIGHTS`; they never name a log,
request or result path. Caller cwd must already exist. The supervisor neither creates it nor
PATH-resolves a target. Target resolution, sanitized environment installation and exec happen only
inside the exact confined helper. At the top-level bootstrap only, the launcher may consume the
preexisting nofollow-bound `NORTROPIC_STAGING_ROOT` and exact regular
`NORTROPIC_RESULT_SINK`; both names, their paths and `NORTROPIC_TRUST_ROOT` are stripped from every
target environment and become immutable supervisor-owned profile state, never nested request data.
The same sanitizer applies at top level and every nested level; target `PATH` is exactly
`/usr/bin:/bin`, while DYLD/PYTHON/Git/GH/GitHub/Slack/loader secrets never reach either target.
The descriptor roles are causal, not cardinality-only: fd 0 is an already-open read pipe preloaded
with bytes exactly equal to the separately framed envelope, fd 1 is the target-stdout write end and
fd 2 is the target-stderr write end. The gate reads exact binary sentinels plus EOF from the latter
two and requires each target descriptor's dev/ino to equal the corresponding passed descriptor.
`/dev/null` substitution, fd reordering, mismatched framed/stdin bytes, or a helper that
replaces instead of preserving these roles rejects. At each proof barrier NUL-preserved
`KERN_PROCARGS2` binds the exact supervisor/helper argv to the sole internal snapshot. Two
identical complete libproc tables, obtained with authoritative returned-byte counts,
over-allocation and retry on growth, bind every helper descriptor by role, type, access and
dev/ino. At the same barriers the supervisor's complete descriptor table is accounted under
closed classes only — AF_UNIX stream sockets, non-regular stdio, the paused helper's
libproc-measured stdio pipe identities, entropy devices, lane-known sealed-root directory
identities and lane-known regular identities. The control descriptor must be a bound AF_UNIX
stream socket, the ready descriptor must be closed, and any unaccounted retained descriptor — a
foreign socket family, a credential- or config-bearing file, an unknown pipe or directory, an
alias or a high-numbered descriptor — fails closed regardless of its number. A dual-process gate
probe holding an AF_INET socket, a regular file, an AF_UNIX pair and descriptor 200 falsifies the
enumerator and the cross-process libproc-identity classifier before any subject credit. An actual subject call occupies caller fds 3–14, requires an accepted internal fd in
10–29, and proves those fillers absent after exec; the target enumerates `/dev/fd` and discards
entries that race to `EBADF` rather than looping to a hostile raised RLIMIT. The required host's
cross-process `KERN_PROCARGS2` result ends after argv, while `ps eww` is space-delimited and
noninjective. Neither can therefore earn exact environment credit. Exact closed
supervisor/helper environment construction and `close_fds`/exact `pass_fds` reachability remain
mandatory immutable-object-review findings; dynamic evidence owns exact argv, descriptor roles
and target-side sanitization only. Every descriptor argument is a canonical unsigned decimal
integer whose parsed value is at least 3; values `3`, `9`, `10`, `29` and larger legitimate
descriptors are accepted while `0`, `1`, `2`, signs, leading zeroes, fractions and non-decimal
text reject.

Each target receives a fresh session capability through the protected AF_UNIX endpoint. A request
must bind the inherited session, capability and fresh nonce. `LOCAL_PEERPID` and
`LOCAL_PEERTOKEN` PID/euid/pidversion must equal the current connection's claimed peer identity;
they are anti-spoof evidence, not profile or ancestry authority. A legitimate nested CLI or
code-mode-host is a different descendant PID, so equality with the originally launched outer
leader is explicitly forbidden. The capability selects one supervisor-owned root/profile state.
Clients can send only a same-or-descendant workspace selector, argv, environment and envelope
bytes; they cannot send profile text/digest, trust/live/runtime roots, Git/sink exceptions or
authority paths. Missing, forged, replayed, stale, cross-session, wrong-peer-claim, malformed,
wrong-FD-cardinality, partial or unknown-key requests reject before a worker effect. Direct
provider use of the socket therefore can only preserve or narrow the server-owned policy bound to
that capability, never create broker or host authority.
All thirteen required header keys and exact `launch-v1` operation are mandatory; the gate removes
each key once under a fresh nonce. Booleans and equal-valued floats are not integers, and request
NaN, positive infinity and negative infinity reject. After a valid proof receipt, `go-v1` rejects
each missing field plus wrong operation/nonce/digest/schema, boolean schema, extra and duplicate
keys, and non-finite input without starting the target. Wrong scalar/container types and duplicate
or reserved environment names likewise reject. Every protocol JSON object is
member-order-insensitive and duplicate-free: the gate validates the supervisor's exact proof wire
bytes against the exact key set, exact bindings and the canonical order-insensitive proof digest —
never a prescribed member sequence — and the primary valid raw session sends its launch header and
`go-v1` with materially reversed member order as a connected positive while the base session sends
sorted order. Materially ordered arrays — argv, environment pairs, stdio roles, header key lists
and Seatbelt parameters — remain exact. BASE, WITH_STAGING and a later top-level launch have
pairwise-distinct sessions, capabilities, runtime roots and socket identities; every parent and
sibling capability is pairwise distinct—not merely different from its parent—while session and
level remain causal. Fixed and gate-random capability/session guesses reject; immutable review
requires CSPRNG generation rather than fixture recognition. A confined descendant with every
`NORTROPIC_H036_*` key removed must enter public bootstrap, meet the real nested Seatbelt EPERM,
return class 3, start no target and leave no runtime root; it may never catch that error and use raw
`Popen`.

The cumulative profile is an exact two-member family, never an open-ended optional template. The
base bytes (SHA-256 `848f5f8b13b6773d9a8b6780838c3bb31e82c06915d762ce47d5a8c97acd4844`) are selected iff both
staging and sink are absent. The base-plus-exact-staging-suffix bytes (SHA-256
`0e543357a7ac4f14b5f8b1a04973c267180ee0fa6e5606d41034ade2a42cd33d`) are selected iff both
prevalidated values are present. Partial state, another digest or another selection rejects. Both
keep every ancestor live/trust/runtime/Git/workspace denial, never grow a Git or sink exception,
and narrow nested writes to the nofollow-resolved child workspace. The staging variant permits
file data at only the already-open exact sink;
the root is denied `file-write*` and only `file-write-data` on one existing regular nofollow nlink-1
literal sink is reallowed. Readback must equal the target bytes. Sibling create/write, sink or root
rename/unlink/move, mkdir, hardlink and chmod/metadata remain denied. Sink-outside-staging,
missing/nonregular/symlink/hardlink sink and every canonical/dev-ino ancestor or descendant overlap
between staging and live/trust/Git/runtime/workspace reject before launch. Neither spelling order nor
`/var` versus `/private` aliasing can conceal overlap; escape components reject. Duplicate,
oversized, partial or trailing request frames spawn no child, and the
connection plus every controller-owned resource is cleaned on rejection. The
pre-sandbox supervisor invokes the pinned absolute `/usr/bin/sandbox-exec`, private Python and live
helper under a closed environment. The post-profile syscall proof is mandatory: the exact helper
argv is `confined-exec-v1 --proof-fd <decimal>`. Before target env or exec, that helper must
demonstrate real permitted scratch/exact-sink writes and denied
create/write/rename/unlink/hardlink/mkdir/chmod operations at every cumulative protected boundary.
It returns the exact `profile-proof-v1` receipt, including child PID/euid/pidversion, session,
request nonce, selected profile digest, effect map and canonical proof digest, then pauses. The
supervisor sends `go-v1` only after independently validating the receipt; the gate observes the
paused helper command, allowed bytes, unchanged protected canaries and absence of `TARGET_STARTED`
before releasing the barrier. Both top-level and nested passive targets must start with that record,
receive a fresh 64-hex capability in the same session at parent level plus one, receive a private
regular nofollow `NORTROPIC_KUVERT` containing exactly stdin bytes, and see only stdio. A direct
sandbox-exec target or proof/receipt claim without those effects cannot pass. An inner direct
sandbox-exec control still returns 71 with
`sandbox_apply: Operation not permitted`, while the supervisor-owned combined child succeeds.
There is no EPERM-to-Popen fallback and no generic "already sandboxed" equivalence.
Neither template earns credit from its literal digest alone. A separate actual no-staging subject
session must return the base digest with exactly the base effect keys before `go-v1`; the staging
session must return the with-staging digest and exactly the base-plus-staging keys. The gate also
proves same-workspace and distinct-descendant nested positives, canonical Python-source and second
snapshot positives, public missing-workspace no-creation, staging-only/sink-only and staging-root
symlink rejection, real `/var`→`/private` workspace/sink readback, and bidirectional alias-overlap
rejection. The BASE target independently reports exact `PATH`, the complete reserved internal-env
set, Kuvert/stdin identity and stdio identities rather than inheriting credit from WITH_STAGING.

The initial Git exception is an actual subject effect. It permits exactly a new loose object and
the current disposable worktree's index update. Attempts against `objects/info`, `commondir`, both
gitfile surfaces, `config.worktree`, or a sibling worktree admin root return EPERM and leave exact
readbacks unchanged. Cleanup restores loose-object fanout, worktree registry, refs and admin state.
Source-spelling/AST observations are non-credit, absent from executable acceptance and summary, and
cannot reject a semantically sound implementation. Independent immutable-object review owns
reachable stable-open/final-rehash and template-selection ordering, CSPRNG creation, and one unified
reachable post-profile helper path shared by bootstrap, public nesting and raw handoff; no direct
target or alternative fallback branch may bypass it. Dynamic effects own subject credit. The
distinct nested public child must also receive EPERM when it attacks an outer-workspace sibling that
the outer target itself could write, with exact pre/post readback proving monotonic narrowing.

Success preserves target stdout byte-for-byte. Nonzero, self-SIGTERM and timeout each create and
report a same-process-group child; controller SIGTERM and supervisor death do the same. Every known
leader and child must be gone. Success, launch failure, nonzero, timeout, SIGTERM, disconnect and
supervisor death each revoke handoff and clean the known leader/process group plus
all controller-owned socket, snapshot, handshake, profile and runtime-root resources. H-036 does
not claim complete absence of an arbitrary escaped same-UID descendant on macOS. Its exact setsid
fixture is nevertheless tracked by PID/pidversion/start/lineage, must retain the installed policy,
must be unable to mutate live, trust or runtime roots, and must disappear under that exact identity;
the later H-032 protected materialization boundary closes late workspace effects. The judge-only
reference runner owns the direct `Popen` session/process group on every outcome. `waitid` with
`WNOWAIT` is the exited-leader PID/PGID reservation even when `ps` omits that zombie; `ps` is used
only to classify exact live remainder identities. The runner closes sockets first, TERM-signals
the owned group, KILLs only bound live members before final `communicate`/reap, then removes roots
through stable parent/root dev/ino dirfds with `O_NOFOLLOW`. It never follows or chmods a
subject-swapped root, child or config symlink. Forced postspawn hang and abrupt error remain
non-PASS and require two stable absence samples, no member/zombie/socket/root residue, while
hostile external symlink targets retain exact bytes, mode and dev/ino. Exact Git object-fanout,
worktree-admin, config and ref state is likewise restored without path-following cleanup.

The no-argument preproduct gate has one authorized RED only:
`A_H036_PRE_SANDBOX_RUNTIME_SUPERVISOR_OPERATIONAL` /
`RUNTIME_SNAPSHOT_AND_V2_AUTHORITY_ABSENT`. Its reference-host lane proves architecture
satisfiability but is always `JUDGE_ONLY` and cannot credit product. H-032 is byte-preserved during
H-036. H-032 later depends exactly on published H-036, drops ordinary launcher write authority,
and refreezes its provider effects before H-031 is rebound.

### Contract remediation (co-developed corrected gate and passing product)

The published gate was reviewed but its `--product` acceptance lane was never executed, so four
product-side defects survived to publication. This remediation co-develops the corrected gate and a
passing three-file product in one worktree and validates them together with a real sandbox-disabled
`--product` run — the root process defect was exactly "reviewed but never executed". The corrections
stay within the same TEST_AUTHOR surface (task spec, gate, this record, decision log, drift):

- Product identity compares the exact three-path changed set order-insensitively as a set in git
  diff-tree path order; it still requires exactly those three `(status, path)` pairs and their
  `100755`/`100644`/`100644` modes, with no renames.
- `make_python_snapshot` creates its private snapshot root with `parents=True` so the dynamic
  wrong-mode/wrong-file-mode/wrong-digest private-runtime negatives can be built.
- The internal execution identity is the canonical v1 stub's mechanically-proven re-exec target —
  the framework app binary (sha `9ea12d11e0573548d6d8b0added1740b2d6377366081dbca05c19746ce7c616e`,
  distinct from the v1 stub sha `94be2db6796807c796419e7adbc45cbff3e71966c107c2adcbf931cf70393941`).
  The pinned stub always re-execs that app binary, so a process launched through the stub or a copy
  of it has `KERN_PROCARGS2` argv0 equal to the app binary, never the snapshot; the in-process argv0
  identity binding can therefore only be satisfied by snapshotting the app binary, which runs
  standalone from a private `0500` root with argv0 equal to its own path. This is a
  mechanically-proven replacement of the impossible re-execing-stub snapshot: `host_preflight` spawns
  the stub and asserts its `KERN_PROCARGS2` argv0 equals the app binary. `config/python-interpreter-authority-v1.json`
  is not edited — v2 keeps inheriting v1's interpreter identity (version, `-I -S` isolation, framework
  identity) and its snapshot-and-final-rehash discipline and replaces only the snapshot subject.
- `DYLD_INSERT_LIBRARIES` hard-wedges a launched target on this macOS before it can sanitize, so its
  stripping is an immutable-object-review obligation under the same `strip_prefixes` `DYLD_` rule,
  while the non-wedging `DYLD_LIBRARY_PATH` keeps the `DYLD_` prefix strip dynamically effect-proven
  with an empty target `bad_env`; `DYLD_` must never reach the target.

The exit_criterion and `TASK_CANONICAL_SHA256` follow these corrections, the preproduct RED label and
reason and all other frozen pins are unchanged, and `docs/07-konstitution.md` stays pinned at its
published base digest.

## H-032 refreeze against published H-036

With H-036 fully published (contract PR#170 + product PR#171), the serial step
`H032_REFREEZE_AGAINST_PUBLISHED_H036` refreezes H-032 against it before independent review and
guarded publication, and before H-031 is rebound. This is a TEST_AUTHOR-only change touching exactly
`specs/tasks.spec.json` (the h-032 row), `verify/bin/h-032-exit`, this workflow record, the decision
log and drift; no product, launcher, registry, published-gate, live, ref, push or merge effect occurs.

The launcher `controller/launch/cli` is now owner-production owned by H-036, so H-032's ordinary
`allowed_write` drops it to exactly the five entries `scripts/nortropic-codex-autopilot.py`,
`controller/result/**`, `tests/controller/result/**`, `docs/05-beslutslogg.md` and
`docs/loop/drift.md`; `owner_author_allowed_write` stays empty and `F_H032_EXACT_TASK` re-pins those
five under one-defect authority self-controls that reject re-adding any `controller/launch/*` path, a
broader `controller/launch/**` or `controller/**` path, a duplicated existing entry, an extra
unrelated path, and any non-empty `owner_author_allowed_write`.

H-032 now `depends_on` exactly `["h-036"]` and its exit_criterion reads "depends exactly on published
H-036". The dependency is verified STRUCTURALLY by `F_H036_PUBLISHED_DEPENDENCY` — exactly one h-036
row present, its `exit_test` is `verify/bin/h-036-exit`, and `verify/bin/h-036-exit` is a file —
rather than by executing the H-036 gate: the published H-036 gate intentionally pins the pre-refreeze
H-032 canonical sha (`436d4ff0`) and is a completed-phase artifact that is not re-executed green after
this refreeze, exactly as H-034's early-H036 absence checks are treated. The executed
fresh-upstream-foundation provenance `K_H033_FRESH_UPSTREAM_PROVENANCE` continues to execute the green
published `verify/bin/h-033-exit` sibling gate to verify the shared H-034 foundation chain; the stale
H-036 gate is deliberately not nested. The frozen result kernel, G20, H017 and H031 route criteria and
the 152 PASS / 0 FAIL deterministic green count are unchanged, and the sole prebuilder product RED
remains `STRUCTURED_RESULT_DELIVERY_BOUNDARY_ABSENT`.

Refreezing against the published main also required the H-032 gate to accept the published
`controller/authority/core.py`, whose H-035 change defines
`PROSPECTIVE_OWNER_PATHS = REQUIRED_OWNER_PATHS | {...}`. The frozen R125 definition-time capability
inventory admitted only literal collections and the `set(...)` call, so it rejected that legitimate
static `BinOp` set-union and made the whole gate ODÖMBART before its check phase. The narrow,
non-weakening fix extends `_r125_dependency_literal` to also admit a `BinOp` whose operator is exactly
`ast.BitOr` and whose operands are each either a literal (recursively) or a bare module-level
`Name(Load)`; every dynamic form (a `Call` other than the allowed `set()`, any `Attribute`, a non-BitOr
operator, a comprehension or f-string, and a bare standalone `Name` value) still rejects. This is a
static-form acceptance of existing published content, not a new capability, and adds or removes no
`check()` call.

H-031 then rebinds the final H-032 gate digest and its h-032 `depends_on`/summary pins after this
refreeze, so H-031 is temporarily RED between this publication and the H031_REBIND step — an expected
serial transition, not a regression. This record supersedes the launcher/`allowed_write` and
H-033-execution assumptions of the frozen H-032 r116–r118, r60 and r69 prose where they conflict.

<!-- H038_MANAGED_ATTEMPT_ROOT_CONFINEMENT_CONTRACT_V1 -->
## H-038 managed attempt-root confinement prerequisite

The published H-036 supervisor correctly installs Seatbelt before releasing a worker, but its
workspace exception is selected per launch and does not confine a descendant that remains alive
after that launch. The pinned host record
`diag-h032-alias-49af17a-20260829T084318Z/diag-alias.txt` (sha256
`bad76f4c145ae65069874348c6586b0c1bb4b6d1957bbf9a08a03c127cf4de27`) names the resulting
cross-attempt effect: the R128-P1 checkout oracle's first five guards were true while
`r128-p0-cross`, a regular `0600`/nlink-one byte created by the still-living P0 descendant, made the
checkout guard false. This is evidence for a missing deny boundary, never authority to bypass or
weaken Seatbelt.

H-038 is therefore a bounded `owner_authority` prerequisite depending exactly on published H-036.
Its ordinary `allowed_write` is empty. Its owner-author production surface is exactly the existing
three-member H-036 set: `controller/launch/cli`, `controller/launch/runtime_snapshot.py`, and
`config/python-runtime-authority-v2.json`; the product candidate must be their exact direct-child
three-file change, preserve modes `100755`/`100644`/`100644`, and add no more than 320 lines. Any
fourth path or greater budget requires an explicit contract refreeze. The H-035 authority registry
is unchanged. The standing delegation is bound independently to the canonical published document
sha256 `0ad4cbc03b3b70c6b61ef6adc76a31decd4300f2b6a8a2b9f632c3f6719ac36f` and its embedded
lossless source-mandate sha256 `b3cc7d127b5fa42144021642c84b86163e5c358ad1ea711133242fef2ac3ce84`.

The profile language remains a closed three-member family. The historical H-036 BASE bytes
(`848f5f8b13b6773d9a8b6780838c3bb31e82c06915d762ce47d5a8c97acd4844`) and BASE+STAGING bytes
(`0e543357a7ac4f14b5f8b1a04973c267180ee0fa6e5606d41034ade2a42cd33d`) are unchanged. Only a
managed H-032 launch may select BASE + the exact deny-only attempt suffix + the unchanged staging
suffix (`679eb17b78168dabc080fd9c0b4940c62e0cd746cc2db6af517e2b4e3b812aa6`). The suffix denies the
literal `ATTEMPT_ROOT` and every descendant except the exact `CURRENT_WORKSPACE` subtree. Attempt
only, staging only, partial tuples, caller-selected roots/profiles/digests, nested overrides, stale
`WORKSPACE`, unrelated roots and roots equal to or enclosing live/Git/runtime or `/private/tmp`,
aliases, symlinks, unsafe modes, ancestor overlaps, topology ambiguity and identity swaps all reject
before target effect. An arbitrary canonical private `0700` ancestor satisfying every exact topology
predicate is not falsely claimed distinguishable: it only adds denial. Explicit trust is a strict
managed descendant of the attempt root; the preserved default-trust branch instead has trust equal
to the live root and requires the attempt root bidirectionally disjoint from live and common Git.
Safe fixtures prove that complete protected-root-invalid states reject without target effect; they do
not pretend to isolate that disjointness predicate by placing writable fixture state under live or
common Git. Its exact implementation is therefore also a mandatory immutable-object review item.
`NORTROPIC_ATTEMPT_ROOT` is
controller-bound state and is stripped from targets; stripping is tested separately from authority,
because the P0 attacker receives the forbidden paths through explicit target argv.

The operational product criterion is causal. A real P0 target double-forks, calls `setsid`, closes
stdio, and returns the public P0 launch while its exact argv/process-start identity remains bound; only
then does the judge create P1 and its future workspace, trust, staging and result paths. P0 must
retain its own-workspace log but record real `EPERM` for the attempt root and all future P1 surfaces;
early death cannot pass. P1 must write its own workspace and exact sink, and a nested launch must
neither see nor override the attempt root. A connected valid raw managed request freezes the exact
proof wire, digest, managed profile/session/child identities, complete effect-key family, scratch and
sink receipts, target absence before `go-v1`, exact final success and post-go target effect. Separate
real P0 syscalls bind the EPERM effects. New attempt-family sources exist only in one server-CSPRNG
named neutral `0700` directory directly under the attempt root; their nofollow identities are bound
at the synchronized proof barrier. The directory may be cleaned before target exec or retained only
through the outer target lifetime; either way, every exact controller-created H-038 identity is
absent after terminal success, nonzero, timeout and disconnect. Post-barrier source/directory
replacements remain type/mode/nlink/byte/dev-ino preserved and are never blindly deleted. Because an unknown server nonce cannot be deterministically pre-created through the
closed public API, collision-before-mutation ordering is an explicit config/selftest and immutable
object-review obligation, never false dynamic credit. Legacy public BASE and WITH_STAGING effects, H-036
protocol/stdio/environment/proof/capability/peer/lifecycle behaviour, cleanup, fail-closed errors and
no-raw-fallback semantics remain mandatory. Direct profile probes are judge-only and no source
substring, digest, marker or claim earns product credit.

The frozen Git graph has two serial guarded transitions. Contract candidate `C_contract` is the exact
five-file direct child of authority `0c379f8e…`; published contract base `B` is the exact guarded merge
with ordered parents `[0c379f8e…, C_contract]` and tree equal to `C_contract`. Product `P` is the exact
three-file direct child of `B`. During product review `origin/main` may be only `B`; after publication
it may be only merge `M_product` with ordered parents `[B, P]` and tree equal to `P`. No other remote
state, parent order or tree receives identity credit.

The frozen no-argument preproduct state is RED only at
`A_H038_MANAGED_ATTEMPT_ROOT_CONFINEMENT_OPERATIONAL` /
`PUBLISHED_H036_CROSS_ATTEMPT_CONFINEMENT_ABSENT`; every static identity, one-defect mutant, legacy
compatibility control and causal-fixture guard is otherwise green. The exact trust sequence is:
freeze this H-038 contract; independently falsify/review it; guardedly publish it; implement the
exact three-file product; independently review its identity and effects; guardedly publish it;
refreeze H-032 to depend exactly on published H-038 and use `CURRENT_WORKSPACE`; independently
review/publish H-032; then rebind H-031. There is no owner-live/provider-live/supervisor start in the
contract freeze and no later transition may broaden filesystem, process, network or credential
authority, add an unconfined worker, raw fallback, native broker or Seatbelt bypass.
