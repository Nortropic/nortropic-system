# Owner-author workflow v1 — frozen H-035 effect contract

H-035 is the one-time ordinary-pipeline bootstrap from one `allowed_write` authority to two mechanically distinct task classes. Its frozen v1 write surface is the exception; no runtime `task == h-035` bypass may survive activation.

## Canonical authority

Authoritative operation reads canonical `specs/tasks.spec.json` and `specs/owner-production-paths.v1.json` from one Git candidate. It binds their SHA-256 digests, task id, authority class, base SHA, gate identity/digest, candidate SHA and actual Git changed-file set. Caller-selected spec/registry bytes, expected digests, role strings, environment, provider/session, branch names and agent-reported files are inputs to verify, never authority.

Schema 2 tasks require exactly `authority_class: ordinary|owner_authority`. Ordinary requires non-empty `allowed_write` and absent/empty `owner_author_allowed_write`; owner authority requires empty `allowed_write` and non-empty `owner_author_allowed_write`. `docs_impact` is a subset of the applicable surface. Missing or unknown values reject. A v1 document remains readable only as ordinary and can never infer owner authority.

## One path language

All authority consumers use repository-relative UTF-8 after optional `\\` to `/` normalization. Only exact paths and terminal `/**` prefixes exist. Absolute/drive-prefixed paths, NUL, empty/`.`/`..` segments, leading `./`, repeated or trailing separators, and every other glob form reject. Exact/prefix intersection is one shared oracle. Thus an ordinary exact owner path, child, owner parent prefix, covering ancestor prefix or root-covering prefix rejects consistently in validation, policy, invariant and autopilot scope checks.

## Actor effects

`ordinary` uses only `allowed_write` and rejects owner-production overlap and, prospectively, authority-control grants. `TEST_AUTHOR` may freeze an explicitly allocated task/spec, registry, gate, fixtures and decision records but never owner-production bytes. `owner_authority` uses only `owner_author_allowed_write`, requires an explicit persisted owner transition, and globally denies task/spec, registry, gates, fixtures, tests and authority-control paths. Provider-neutral implementations inside the same exact owner surface are equivalent.

An owner-author attempt is created only from explicit owner action and a frozen owner task with matching canonical spec/registry/base/gate identities and persisted `OWNER_ACTION_REQUIRED`. No full-roadmap, drain, bootstrap, recovery, retry or builder route may synthesize it. An owner task whose gate is RED persists `OWNER_ACTION_REQUIRED`, remains nonterminal/unattested, launches no BUILDER, advances no dependent and is not reset on restart. Unknown persisted states reject. Minimal states are `OWNER_ACTION_REQUIRED`, `OWNER_CANDIDATE_REVIEW_REQUIRED`, and `OWNER_FINAL_FREEZE_REQUIRED`.

The controller derives owner candidate SHA and changed files from Git bytes. A candidate binds task, class, base, spec digest, registry digest, gate identity/digest, attempt identity and actual files. A new independent read-only reviewer is mandatory. Review PASS moves the exact candidate to `OWNER_FINAL_FREEZE_REQUIRED`; it never calls automatic publication. Explicit owner-final action binds candidate, review, base and current-main identity before completion/attestation. Attestation additionally binds class, spec, registry, gate, transition and review identities. Reviewer PASS, role, candidate or gate PASS alone is never final owner freeze.

The frozen gate's N01–N29 negative and P01–P08 positive controls are normative. They exercise parsing, policy, routing, persistence/restart, candidate scope, review and final freeze in disposable local repositories without network. G20 live-filesystem containment remains distinct from Git tree-path authority and must not regress.
