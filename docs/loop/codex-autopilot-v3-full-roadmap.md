# Codex Operating Model v3 — full roadmap autonomy

**Owner-beslut:** 2026-08-10
**Supersedes:** v2:s mänskliga stopp på normala roadmap-interna arkitekturfrågor.

## Authority

Den fullständiga autonoma loop-planen är fryst som execution authority vid:

```text
ROADMAP_PLAN_SHA=0b3212c991d4227c8df2656465ae2c0252dda39e
ROADMAP_PLAN_PATH=docs/loop/autonomous-loop-plan-v1.md
ROADMAP_HANDOFF_PATH=docs/loop/autonomous-loop-codex-handoff.md
```

Planen läses ur exakt commit-SHA med `git show`; den muterbara branchen är aldrig authority.
Vid konflikt gäller fortfarande högre authority enligt auktoritetsordningen i `AGENTS.md`.

## Stående owner-delegation

Owner har delegerat **normala arkitektur- och kontraktsbeslut inom den frysta roadmapen** till Codex-autopiloten. Målet är att bygga hela återstående kontrollplansloopen utan att owner fungerar som scheduler eller beslutsproxy per slice.

```text
HUMAN_OWNER_PRESENT_PER_SLICE=NO
ROADMAP_ARCHITECTURE_EXECUTOR=CODEX_ARCHITECT
OWNER_DECISION_REQUIRED_IS_NORMAL_HUMAN_STOP=NO
FROZEN_GATE_AFTER_TEST_AUTHOR_REMAINS_TRUST_AUTHORITY=YES
```

När test-author, builder eller reviewer rapporterar `OWNER_DECISION_REQUIRED` för en fråga som täcks av roadmapen ska orchestratorn **inte stoppa för människan**. Den startar en separat `$nortropic-architect`, som läser högre authority + exakt roadmap-SHA + faktisk kod/evidence och väljer den minsta kompatibla designen. Resolutionen är guidance; den blir inte trust authority förrän test-author har översatt den till en mekaniskt dömbar frozen task/gate och gate-reviewern har falsifierat den.

## Roadmap

Bindande ordning efter S3/h-004:

```text
S2  h-015 recovery
S4  structured failure feedback
S5  operations/lifecycle events
S6  h-014 notification
S7  verified auto-promotion
S8  merge resolution + full reverify
S9  trust transition
S10 Markdown intake + Task IR
S11 verifier author + challenger
S12 evaluator
S13 read/typed-command interface
L   empirical unattended end-to-end run
```

Exact plan-owned task/gate mapping:

```text
S2  h-015 → verify/bin/h-015-exit
S4  h-018 → verify/bin/h-018-exit
S5  h-019 → verify/bin/h-019-exit
S6  h-014 → verify/bin/h-014-exit
S7  h-020 → verify/bin/h-020-exit
S8  h-021 → verify/bin/h-021-exit
S9  h-022 → verify/bin/h-022-exit
S10 h-023 → verify/bin/h-023-exit
S11 h-024 → verify/bin/h-024-exit
S12 h-025 → verify/bin/h-025-exit
S13 h-026 → verify/bin/h-026-exit
L   program-level frozen gate `verify/bin/autonomous-loop-exit` + independent read-only empirical closeout
```

För varje ännu ofryst slice:

```text
ARCHITECT when needed
→ TEST_AUTHOR contract + RED frozen gate
→ independent GATE_REVIEWER
→ immutable owner-contract candidate
→ mechanical owner scope/invariant gate
→ PR/merge
→ BUILDER
→ independent REVIEWER ↔ remediation
→ full frozen/historical gate battery
→ expected-head guarded PR/merge
→ next slice
```

Före downstream implementation fryser test-author + gate-reviewer dessutom programnivå-gaten
`verify/bin/autonomous-loop-exit` medan produkten är RED för saknade S2–S13-effekter. Samma gate
måste vara exit 0 vid slutet; den får aldrig skapas i efterhand för att passa implementationen.

`FULL_ROADMAP_SOFTWARE_COMPLETE` får endast sättas när samtliga task-gates i den då auktoritativa
specen är exit 0, planens S2/S4–S13 är representerade av de exakta h-task/gate-identiteterna,
invarianterna är gröna, den frysta programnivå-gaten L är exit 0 och en separat read-only
empirical-runner har försökt falsifiera samma end-to-end-resultat utan blocker.

`FULL_ROADMAP_COMPLETE` kräver därutöver att den externa, dedikerade promotion-identiteten som
planen kräver faktiskt är PROVEN. En broad personlig `gh`-credential får aldrig användas som
ersättning.

## `OWNER_DECISION_REQUIRED` under v3

Fältet finns kvar i agentrapportformatet som en **signal till architect-lagret**, inte som normal mänsklig handoff.

Architect-lagret ska lösa bland annat:

- komponentägarskap inom planens gap-analys;
- mekanism-agnostisk gateform;
- representational choices för Task IR/events/feedback;
- conflict-resolution-algoritm inom planens non-force/single-parent/full-reverify-regler;
- testharness/barriers för concurrency;
- minsta allowed_write som krävs för en slice;
- vanlig implementationstolkning där frozen criterion lämnar flera legitima mekanismer.

## Enda mänskliga hårdstoppet

`HUMAN_AUTHORITY_HARD_STOP` får användas endast när arbetet inte lagligen/ärligt kan fortsätta under delegerad authority, till exempel:

1. (utgått 2026-09-10 — punkten avsåg webbens styrningsytor, som inte styr plattformen; plattformens skyddade mängd ändras genom kontraktsflödet i `AGENTS.md`, aldrig genom ett hårdstopp);
2. faktisk motsägelse mellan två högre authorities som roadmapen inte kan lösa;
3. extern secret/credential/org-resurs som kräver en mänsklig eller extern identitetsceremoni och som inte kan provisioneras automatiskt utan att försvaga den frysta modellen;
4. verifieringsmiljön gör en trust-transition genuint odömbar efter att architect/test-author försökt en mekanism-agnostisk lösning;
5. reproducerad no-progress där samma arkitekturgap återkommer efter fem oberoende architect-resolutioner.

Ett sådant stopp får aldrig konverteras till PASS. Allt annat fortsätter autonomt.

## S7 software vs external activation

Owner gör här en explicit operativ precisering av den äldre planens formulering “prerequisite
före S7 byggs” utan att försvaga trustkravet:

- **S7 software boundary får byggas och frysas hermetiskt** mot disposable local bare origin,
  eftersom det är exakt så S7:s frysta testplan ändå ska döma implementationen;
- S8–S13 och programnivå-gaten L får därefter byggas och köras hermetiskt så hela mjukvaruloopen
  inte lämnas halvbyggd bara för att en extern org-resurs saknas;
- **verklig external activation/promotion mot GitHub main får aldrig ske** innan den dedikerade
  `Nortropic Promoter`-identiteten och branch/ruleset-bypass är faktiskt bevisade;
- när hela mjukvaran + L är gröna men external identity saknas sätts
  `FULL_ROADMAP_SOFTWARE_COMPLETE`, därefter får endast just den externa identitetsceremonin bli
  `HUMAN_AUTHORITY_HARD_STOP`;
- `FULL_ROADMAP_COMPLETE` sätts först efter denna externa proof.

Detta separerar “bygga och verifiera promotion-komponenten” från “aktivera en extern credential”
och gör inte den nuvarande personliga `gh`-sessionen till promoter-authority.

## Known resolution: h-003/h-004 multi-publication

`H004_MULTI_PUBLICATION_FINALIZATION_CARDINALITY` är redan löst av owner under v3:

- en run-level lease-id = en h-003 authority-generation;
- generationen får bära flera provisional task-publications;
- taskval får endast inom samma explicit authority-id använda dessa provisional publications för in-run dependency eligibility;
- vanlig `--require-valid` accepterar dem aldrig;
- efter sista lease-guard, heartbeat stop/join och token-bound clean release görs en enda atomisk `FINALIZE_AUTHORITY(lease_id)` för hela publication-setet;
- partial finalize är förbjudet; crash/failure ger noll giltiga publications från batchen;
- ny generation före gammal finalize fencar den gamla.

Den detaljerade bindningen finns i `docs/loop/owner-h003-attestation-authority-v1.md` §10.

## No-force och publication

V2:s regler står kvar:

- ingen force/force-with-lease/ledande `+`;
- ingen amend/reset/rebase-remediation/history overwrite;
- remediation = ny commit;
- reviewer gäller exakt candidate SHA;
- publication kräver oförändrad expected `origin/main`, exakt remote head, remote file-set och expected-head guarded PR merge;
- agentroller pushar/mergar aldrig själva; orchestratorn gör trust-transitionen efter mekaniska gates.

## External activation closeout

Se **S7 software vs external activation** ovan. Den externa identitetsceremonin är den enda
planerade externa human-hard-stop som får återstå efter `FULL_ROADMAP_SOFTWARE_COMPLETE`.

<!-- HARNESS-SUBSTITUTION-AMENDMENT-V1 -->
## v4 amendment — provider-neutral Trust Kernel

`docs/loop/harness-substitution-contract-v1.md` är owner amendment för den återstående roadmapens implementation shape. Den exakta frysta planen behåller required effects, migration intent och negative controls; v4 väljer provider-native session/context/tool/retry primitives när ingen självständig Trust Kernel-boundary annars finns.

S3/h-003+h-004 förblir först och klassas KEEP. Därefter kör autopiloten SUB-1/h-027, SUB-2/h-028, SUB-3/h-029 och SUB-4/h-030 innan S2/S4–S13. S2/S4/S5 får h-030 som dependency floor. Programnivå-gaten L fryses efter denna owner amendment och måste binda provider/kernel-separation utan att source-shape:a mot Codex.

Provider/session/reviewer READY är aldrig PASS authority. Frozen task gates, candidate identity, policy, attestation/fencing och promotion förblir mekaniska Nortropic-gränser.

Den quota-avbrutna dirty h-003/h-004 test-author-worktreen från `44d525a…` återanvänds inte. När v4 senare resumear skapas fresh base-specific owner-work från amended main; den gamla worktreen lämnas orörd som evidence.

## v5 bounded remaining-bootstrap delegation

The owner has removed interactive approval from the remaining H-035 → H-034 → H-033 →
H-032 → H-031 → supervisor-resume → first-real-launch bootstrap only. The complete bounded
authority is `docs/loop/remaining-bootstrap-delegation-v1.md`. Mechanical preconditions remain
mandatory. Publication no longer uses rebase merge: it uses guarded normal merge-commit semantics
and proves the exact two-parent object and candidate-identical tree after fetching `origin/main`.
