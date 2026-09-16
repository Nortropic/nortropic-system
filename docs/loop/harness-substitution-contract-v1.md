# Nortropic Harness Substitution Contract v1

**Owner architecture amendment — 2026-08-11**

This document is owner authority for the implementation shape of the remaining Nortropic autonomous-loop roadmap. It does **not** weaken the constitution, rulebook, loop rules, frozen task gates, candidate identity requirements, containment, or promotion boundaries.

The original frozen roadmap at commit `0b3212c991d4227c8df2656465ae2c0252dda39e` remains authority for required effects, migration intent, negative controls and final capabilities. Where that plan prescribes or implies custom agent-harness machinery that modern provider harnesses already own, this amendment supersedes only that **implementation shape**.

```text
NORTROPIC_ARCHITECTURE=PROVIDER_NEUTRAL_TRUST_KERNEL
AGENT_REASONING_OWNER=PROVIDER_HARNESS
TRUST_TRANSITION_OWNER=NORTROPIC
MODEL_OUTPUT_IS_TRUST_AUTHORITY=NO
FROZEN_OWNER_GATES_REMAIN_TRUST_AUTHORITY=YES
DETERMINISTIC_GRADERS_FIRST=YES
LLM_EVALUATOR_IS_ROOT_OF_TRUST=NO
PROVIDER_SESSION_STATE_IS_DONENESS_AUTHORITY=NO
VERKSTADSGOLVET_IS_TRUST_AUTHORITY=NO
SUBSTITUTION_BEFORE_NEW_HARNESS_COMPONENT=REQUIRED
NO_FORCE_SEMANTICS=YES
```

## 1. Product boundary

Nortropic är den organisatoriska helheten: bestående stöd från ägarens råa
intention till genomförbart initiativ, användbart resultat och prövat lärande.
Organisationen behöver en verksamhetsneutral autonomiplattform. Digitala är
den första professionella verksamheten; befintlig webbproduktion och
webbförvaltning ska återanvändas som delar av denna, inte definiera hela
Nortropic eller betraktas som hela Digitalas färdiga förmåga.

Trust Kernel, controller, bootstrap och supervisor hör till
autonomiplattformen. H034 är en avgränsad verifieringsartefakt inom denna
plattform, inte hela plattformen eller organisationen. I detta kontrakt
avser den historiska termen Trust Kernel den bredare tillitsdelen av
plattformen; den lägger inte hela §2:s ansvar i H034-binären.

Verksamheter använder plattformens definierade och versionsbundna
gränssnitt. Plattformen får anropa en tillåten verksamhetsverifierare genom
dessa gränssnitt, men dess egen kvalificering ska inte kräva webbaffärens
filer eller interna regler. Domänpolicy får endast skärpa eller precisera
inom överordnat mandat, aldrig ge högre behörighet eller ändra måttstocken.

Claude, Codex och framtida providers får bära resonemang och arbetsloopar.
Providerbyte flyttar inte tillitsauktoriteten till leverantören.
Verkstadsgolvet är kontrollrum, aldrig scheduler-, verifierings-, attest-
eller publiceringsauktoritet.

Detta är en framåtriktad ändring av den tidigare webbfabriksdefinitionen,
inte ett påstående om att äldre kontrakt redan hade denna innebörd.
Verksamhetsneutralitet är ett kvalificeringskrav, ännu inte en visad effekt.
Ändringen ger ingen ny kundflödesstart, kundpublicering, rootoperation eller
rätt att förnya ett förbrukat försök. Nuvarande säkerhetskrav, human-only-
gränser och frusna gates gäller fortsatt. Organisatoriska funktioner är
ansvar, inte en beställning av nya subsystem.

## 2. Stable responsibility split

### Provider harness owns

- model sessions and context continuation;
- provider-native structured output;
- reasoning and planning;
- tool-use loops;
- subagents and internal collaboration;
- builder/reviewer/remediation reasoning;
- provider-native retries and turn management;
- optional session resume as a context-preservation optimization.

### Autonomiplattformens tillitsdel äger

- canonical Task IR / TaskContract and provenance;
- allowed/denied write policy;
- trusted workspace/containment boundary;
- exact candidate materialization and candidate SHA;
- deterministic policy;
- verifier identity/register/freeze;
- frozen task gates;
- attestation, stale and invalidation;
- run authority, lease generation, heartbeat and fencing;
- recovery from authoritative facts;
- promotion eligibility;
- guarded authoritative-main transition;
- normalized typed event/read projection.

Provider output is evidence/input to the kernel. It is never the kernel verdict.

## 3. Component migration classification

The existing h-001–h-017 controls are not discarded. Their historical tests and negative controls remain evidence and regression authority until an explicit substitution gate proves an equivalent or stronger boundary.

```text
h-001 state/eventlog      THIN: append-only authority/evidence remains; projection may simplify
h-002 verify/register     KEEP
h-003 attestation         KEEP
h-004 lease/fencing       KEEP
h-005 workspace           THIN: use provider/worktree primitives behind Nortropic containment
h-006 worker/parser       REPLACE: provider structured result; retain deterministic candidate validation
h-007 policy              KEEP
h-008 envelope            THIN/REPLACE: canonical TaskContract projection, not bespoke session context engine
h-009 launch              SPLIT: provider owns session/process semantics; Nortropic keeps G20 containment
h-010 taskval/claim       KEEP/THIN
h-011 loop                THIN: deterministic task supervisor, not a second model-agent engine
h-012 candidate material  KEEP deterministic Git/candidate identity; provider owns editing workflow
h-013 breaker/retry       THIN: cross-attempt budgets/fingerprints remain; provider owns internal turns
h-014 notification        THIN consumer of typed events
h-015 recovery            KEEP kernel recovery; provider resume is optional only
h-016 wiring              ABSORB into supervisor regression; not a permanent parallel harness layer
h-017 trusted task gate   KEEP
```

No green legacy gate is deleted or weakened first. Replacement is migration-by-proof: new path exists, adversarial equivalence/strength is proven, then obsolete plumbing may be retired in a later frozen task.

## 4. Mandatory substitution test

Before adding or extending any custom agent-harness mechanism, the architect/test-author must answer:

1. What old harness assumption is being replaced or added?
2. Which provider primitive already owns that responsibility?
3. Which trust function must remain inside Nortropic?
4. Which concrete unsafe implementation must the new frozen gate reject?
5. Which legitimate alternative implementation must the gate accept?

If the proposed custom component merely duplicates provider session/context/tool/retry capability and carries no independent trust boundary, prefer provider substitution and keep Nortropic thin.

## 5. Revised capability order

S3/h-003+h-004 authority/fencing bootstrap remains first and is not superseded by this amendment. h-003/h-004 are Trust Kernel responsibilities.

After S3 is green, the new migration order is:

```text
SUB-1  h-027  AgentProvider interface + Codex adapter
SUB-2  h-028  split provider launch from G20 containment
SUB-3  h-029  structured provider result + canonical TaskContract projection
SUB-4  h-030  thin task supervisor + bounded cross-attempt retries
S2     h-015  recovery / crash consistency
S4     h-018  minimal structured FailureArtifact
S5     h-019  normalized typed events / projection
S6     h-014  notification consumer
S7     h-020  verified promotion
S8     h-021  conflict reasoning + full re-verification
S9     h-022  trusted control-plane transition
S10    h-023  Markdown intake + canonical Task IR
S11    h-024  provider verifier-author/challenger + kernel freeze
S12    h-025  evaluator adapter; no custom evaluator engine as root trust
S13    h-026  typed read/command projection
L              empirical unattended closeout
```

SUB-0 is this owner amendment itself and therefore is not a synthetic builder task.

## 6. Frozen SUB task identities and builder write surfaces

The following identities are owner-authorized for autonomous test-author freeze and later builder implementation. The test-author still must create a truthful mechanism-neutral task object and a RED frozen exit gate before implementation.

### SUB-1 / h-027 — AgentProvider interface + Codex adapter

Required dependencies:

```text
h-004,h-006,h-008,h-009,h-011,h-013,h-016,h-017
```

Exact builder `allowed_write`:

```text
controller/provider/**
tests/controller/provider/**
docs/05-beslutslogg.md
```

Required effects:

- one provider-neutral request/result boundary usable by the task supervisor;
- Codex adapter uses provider-native structured output/session primitives rather than free-form prose parsing;
- provider result cannot itself mark a task verified, attested or promotion-eligible;
- candidate identity accepted by the kernel must still resolve to the exact Git commit the provider claims;
- provider session/thread identifiers are observability/context only, never doneness authority;
- at least one fake provider implementation must pass the same interface so the gate is not Codex-source-shaped.

### SUB-2 / h-028 — provider launch vs G20 containment

Required dependencies:

```text
h-017,h-027
```

Exact builder `allowed_write`:

```text
controller/launch/**
controller/provider/**
tests/controller/launch/**
tests/controller/provider/**
docs/05-beslutslogg.md
```

Required effects:

- provider lifecycle/session semantics move behind the provider boundary;
- Nortropic-owned G20 containment remains installed before provider work and inherited by descendants;
- provider-native sandboxing remains defense-in-depth only;
- a provider attempt cannot write trusted control-plane or pre-task trust-root paths;
- timeout/cancellation cannot leave a process capable of later mutating kernel-owned state;
- legacy h-009 and h-017 frozen behavior remains green until a later explicit retirement pass.

### SUB-3 / h-029 — structured provider result + canonical TaskContract projection

Required dependencies:

```text
h-007,h-027,h-028
```

Exact builder `allowed_write`:

```text
controller/provider/**
controller/taskcontract/**
controller/worker/**
controller/envelope/**
tests/controller/provider/**
tests/controller/taskcontract/**
tests/controller/worker/**
tests/controller/envelope/**
docs/05-beslutslogg.md
```

Required effects:

- free-form model prose is no longer the normal candidate/result transport;
- provider-native schema/structured result is projected into a provider-neutral kernel result;
- canonical TaskContract derives task/base/spec/write boundaries from authoritative inputs and is deterministic;
- TaskContract does not expose verifier implementation or certification authority to the builder;
- claimed candidate SHA is independently resolved/validated by Nortropic;
- malformed/missing structured result fails closed;
- h-006/h-008 regression semantics remain green or are proven superseded only by an explicit migration gate.

### SUB-4 / h-030 — thin task supervisor + bounded cross-attempt retry

Required dependencies:

```text
h-003,h-004,h-010,h-012,h-013,h-017,h-029
```

Exact builder `allowed_write`:

```text
controller/loop/**
controller/brytare/**
controller/provider/**
tests/controller/loop/**
tests/controller/brytare/**
tests/controller/provider/**
docs/05-beslutslogg.md
docs/loop/drift.md
```

Required effects:

- Nortropic supervises task transitions and kernel facts; it does not implement a second provider-internal reasoning loop;
- provider-native retries/turns remain inside a single provider attempt;
- Nortropic cross-attempt retry/budget/fingerprint remains bounded and creates a fresh candidate attempt on unchanged authoritative base until an attested transition moves base;
- lease/authority, policy, frozen verification, attestation and promotion remain outside provider control;
- provider crash/quota/auth refusal fails closed with recoverable state and no attestation;
- legacy h-011/h-013/h-016 behavior stays green until an explicit later retirement/migration pass.

## 7. Revised S2/S4/S5 dependency floor

To prevent the legacy broad harness shape from being selected by normal task scheduling after this amendment:

- authoritative pre-amendment main `44d525a5dd60f92fa374f18e2430ba509d4df4d0` has S2 / h-015 `depends_on=["h-010","h-013"]`;
- the original frozen roadmap already requires S2 / h-015 to depend on `h-010`, `h-013`, `h-016` and `h-004`;
- SUB-0 therefore reconciles the existing h-015 task object monotonically to exactly `["h-010","h-013","h-016","h-004","h-030"]`: no existing dependency is removed, the two still-unmaterialized original-roadmap dependencies are appended in frozen-plan order, then the provider-neutral migration floor `h-030` is appended;
- S4 / h-018 must depend on `h-030`;
- S5 / h-019 must depend on `h-030`.

This S2 reconciliation is owner-contract strengthening, not builder implementation. Later slices inherit the provider-neutral floor transitively through S2/S4/S5 dependencies.

## 8. Later roadmap interpretation

The original S2–S13 effects remain, with these implementation refinements:

- S2: recover from kernel/Git facts; provider session resume is optional context optimization only.
- S4: store a small immutable FailureArtifact suitable for provider remediation; do not build a bespoke conversational feedback engine.
- S5: typed provider-neutral/kernel events and projections suitable for Verkstadsgolvet; event projection is not authority.
- S6: notification consumes typed events; notification state is not scheduler truth.
- S7: verified promotion remains a Trust Kernel function and retains the dedicated promoter-identity boundary.
- S8: agent may reason about conflicts; resulting candidate is new identity and must be fully re-verified.
- S9: trusted control-plane transition remains kernel-owned.
- S10: agent may plan Markdown intent; Nortropic validates canonical Task IR/provenance.
- S11: provider agents may author/challenge verifiers; Nortropic owns freeze/hash/register and final deterministic gate.
- S12: use provider reviewer/evaluator capabilities as advisory/falsification input; do not create a model verdict as root trust.
- S13: typed read/command surface projects and requests kernel actions; Verkstadsgolvet never becomes the canonical state machine.
- L: empirical closeout must exercise the provider-neutral path and same deterministic program gate; agent prose cannot override it.

## 9. Aborted pre-substitution h-003/h-004 work

The quota-stopped v3 run left local, unmerged test-author work in:

```text
branch=owner/h-003-attestation-validity-44d525a5dd60
observed_head=c09a5032647425064ededc83945f02c11eb7532d
observed_changed_files=docs/05-beslutslogg.md,specs/tasks.spec.json,verify/bin/h-003-exit,verify/bin/h-004-exit
```

The run itself reported `FROZEN_GATE_READY=NO` before usage exhaustion. This work is therefore **not frozen authority and must never be published or silently resumed as if it were**.

It remains valuable forensic/evaluation evidence. The owner amendment installer must preserve it byte-for-byte locally and record an evidence digest. After this amendment changes `origin/main`, the autonomous h-003/h-004 gate flow must start a **fresh base-specific owner worktree** from the new authoritative main. The old worktree is not deleted, reset, rebased, amended, force-updated or used as candidate input.

## 10. Recovery and quota behavior

A provider quota/auth/process failure is not product failure and not PASS. It disables unattended restart and leaves recoverable Git/kernel evidence. When provider usage returns, `resume` may restart the supervisor, which must reconcile from current `origin/main`, task/gate state and worktrees rather than assume the failed session completed.

Provider session resume may be used only to preserve reasoning context. A recovered task transition still requires the same candidate identity, frozen gates and kernel authority checks.

## 11. Verkstadsgolvet

Verkstadsgolvet eventually renders the real loop through S5/S13 projections:

```text
run → task → provider/role → candidate → policy → gate → attestation → promotion → main
```

Provider session status and usage are observability. Kernel state is authority. The UI remains read-only until the typed S13 command boundary is frozen; even then, commands request bounded kernel operations rather than arbitrary shell/Git authority.

## 12. Human hard stops

Ordinary implementation choices under this contract are delegated to the autonomous architect/test-author/builder/reviewer workflow.

Human authority remains necessary only for genuine higher-authority conflict, constitution/human-only policy, legal human-only action, or an external credential/provisioning ceremony that cannot be automated without weakening the frozen model.

The dedicated external Nortropic Promoter identity remains such a possible deployment ceremony. Broad personal GitHub credentials are never a silent substitute.

## 13. Completion meaning

`FULL_ROADMAP_SOFTWARE_COMPLETE` means all revised SUB/S task gates, invariants, the frozen program gate and independent empirical closeout are mechanically green.

`FULL_ROADMAP_COMPLETE` additionally requires the external promoter identity required by the frozen promotion model to be proven.

Neither a provider `READY` report nor an orchestrator configuration marker such as `FULL_ROADMAP=YES` is product completion.
