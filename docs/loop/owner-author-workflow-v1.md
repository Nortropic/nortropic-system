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

## Strict registry v1

The registry is a duplicate-aware JSON object with exactly seven keys: `schema_version`, `path_grammar`, `authority_source`, `self_digest_is_authority`, `owner_production_paths`, `prospective_ordinary_protected_paths`, and `owner_author_global_denied_paths`. Version is exactly `1`; the two authority strings and `false` self-digest value are exact. Each path list is non-empty, contains only canonical grammar paths, and has no duplicates after canonicalization. `owner_production_paths` has exact v1 membership: `controller/h034-native/**`, `verify/h034/kernel`, `verify/h034/build-recipe.json`, and `verify/h034/identity-manifest.json`. Missing, altered, duplicated, or additional membership rejects. A separately owner-reviewed future version requires a new versioned parser and is not accepted as v1.

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
