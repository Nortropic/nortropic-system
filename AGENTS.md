# Agenter i nortropic-system (plattformsrepot)

Detta är en **router**, inte ett nytt regelverk. Repot är Nortropics
verksamhetsneutrala autonomiplattform: Trust Kernel (hela tillitsplattformen),
controller, bootstrap, supervisor/autopilot och tillhörande H-arbeten.
Webbförvaltningen (agenter, skills, workflows, paket, kvalitetsregler,
verksamhetsmaterial) är sedan 2026-09-10 utbruten till ett separat repo;
se `SEPARATION-20260910/README.md`. Webbens brief-, design-, kvalitets- och
förvaltningsregler är inte plattformskrav.

## Auktoritet

Läs och följ i denna ordning när de är relevanta:

1. `docs/loop/harness-substitution-contract-v1.md` §1 (plattformsgräns och ägarskap)
2. `docs/loop/regler.md` och `docs/loop/byggplan-v3.md` (kontrollplanets regler, §A-mängd)
3. aktuell task i `specs/tasks.spec.json`
4. taskens frysta `exit_test` under `verify/bin/`
5. `docs/loop/owner-author-workflow-v1.md`, `docs/loop/remaining-bootstrap-delegation-v1.md`
   och övriga plan-/driftdokument under `docs/loop/`

Vid konflikt gäller den högre auktoriteten. Återge inte reglerna här; peka på källan.
Gemensamma säkerhetsprinciper som följde med webbens konstitution och gäller
plattformen finns redan mekaniskt här: `verify/**`, `specs/**`,
`controller/verify/register.json` och `scripts/check-invariants.mjs` ändras
endast av människohand (preciserat i avsnittet om delegationer nedan); frysta
grindar, förbrukade försök och human-only-ceremonier kvarstår. En router, handoff eller senare målbild är inte egen
operationsbehörighet.

## Repoidentitet före arbete

Innan en ändring som kan påverka Git- eller trust-state:

```bash
git branch --show-current
git rev-parse HEAD
git status --short
git rev-parse origin/main
```

Om remote inte kan kontrolleras: skriv `ORIGIN_MAIN=OVERIFIERAT`; gissa aldrig.
Ingen force-semantik: varken `--force`, `--force-with-lease`, ledande `+` i refspec eller history overwrite.

## Rollseparation

En tråd/worktree har **en** roll åt gången (`.agents/skills/`):

- `$nortropic-test-author` — owner-begärd spec/acceptance-gate-förberedelse. Ingen produktionsimplementation.
- `$nortropic-builder` — implementerar en redan fryst task inom `allowed_write`. Ändrar aldrig sin egen frysta spec/gate.
- `$nortropic-reviewer` — oberoende, normalt read-only, försöker falsifiera builderkandidaten.
- `$nortropic-architect` (read-only) och `$nortropic-empirical-runner` (closeout) enligt v3/v4 nedan.

Rollerna är **workflow-separation**, inte en mekanisk säkerhetsgräns:

```text
ROLE_SEPARATION=WORKFLOW
ROLE_SEPARATION_IS_SECURITY_BOUNDARY=NO
FROZEN_OWNER_GATES_REMAIN_TRUST_AUTHORITY=YES
OWNER_GATE_REQUIRED=YES
```

Skills och separata trådar/worktrees ersätter inte `allowed_write`, sandbox,
frozen exit-test, attestation eller owner-gates. En roll får aldrig använda sin
Skill som bevis för att en fil faktiskt var mekaniskt otillgänglig.

## Evidence

Slutrapporten följer `docs/loop/codex-evidence-contract.md`. Agentens egen utsaga
är inte owner-bevis. Ett grönt exit-test rapporteras med faktiskt kommando + exitkod.
Overifierat märks `OVERIFIERAT`.

## Push / merge

```text
PUSH=NO
MERGE=NO
```

Pusha eller merga endast när ägaren uttryckligen gett befogenheten för aktuell fas
och grindarna tillåter det. För den kvarvarande bootstrapkedjan H-035 → H-034 →
H-033 → H-032 → H-031 → supervisor-resume gäller `docs/loop/remaining-bootstrap-delegation-v1.md`
(guarded normal merge commit; aldrig utan mekaniska grindar).

## Gällande delegationer och verkliga human-only-gränser (precisering 2026-09-10)

Ägarbeställd precisering. Avsnittet **pekar** på var varje delegation respektive
human-only-gräns är beslutad; det återger inte reglerna och skapar ingen ny
behörighet. Vid konflikt gäller källan. Påstående utan spårad källa i detta träd
är märkt `OVERIFIERAT`. Det ersätter den tidigare korta sammanfattningen
»Operating model v2–v4«; källorna är oförändrade.

### Delegerat till agent/mekanik (inom frusna grindar, utan ny fråga till ägaren)

| Delegation | Källa | Villkor i källan |
|---|---|---|
| Rollseparerat lokalt arbete: test-author fryser kontrakt/grind, builder implementerar inom `allowed_write`, oberoende reviewer falsifierar; lokala immutabla commits | `.agents/skills/*`; `docs/loop/codex-autopilot-v2.md` (»Test-author/gate review«, »Reviewer loop«) | Rollagenterna pushar/mergar aldrig själva (`PUSH=NO`, `MERGE=NO`); en Skill är inte bevis för mekanisk otillgänglighet |
| Mekanisk exekvering av redan owner-auktoriserat kontrollplansarbete via `scripts/nortropic-codex-autopilot.py` (v2, 2026-08-10): `OWNER_GATE_EXECUTOR=MECHANICAL`, `FROZEN_OWNER_GATES_REMAIN_TRUST_AUTHORITY=YES` | `docs/loop/codex-autopilot-v2.md` | »Mechanical builder gate« och »Mechanical final gate« före varje effekt; remediation = ny commit; `--sandbox danger-full-access` är en behörighetsinställning, inte en trust-dom |
| Full-roadmap-autonomi för SUB-1–SUB-4 (h-027–h-030), S2, S4–S13 och empirisk slutkörning under den ägarlåsta planen `0b3212c991d4227c8df2656465ae2c0252dda39e` (v3, 2026-08-10; ordning enligt v4-amendment) | `docs/loop/codex-autopilot-v3-full-roadmap.md` (inkl. »v4 amendment«) | Programgrinden `verify/bin/autonomous-loop-exit` fryses av test-author + gate-reviewer före downstream; `OWNER_DECISION_REQUIRED` inom roadmapen går till `$nortropic-architect`, inte till människan; worktreen `owner/h-003-attestation-validity-44d525a5dd60` är bevarad evidens, inte authority |
| Provider-neutral Trust Kernel (v4, 2026-08-11): providern äger resonemang, sessioner och tool-loopar, Nortropic äger trust-transitioner — `AGENT_REASONING_OWNER=PROVIDER_HARNESS`, `TRUST_TRANSITION_OWNER=NORTROPIC`, `MODEL_OUTPUT_IS_TRUST_AUTHORITY=NO`, `SUBSTITUTION_BEFORE_NEW_HARNESS_COMPONENT=REQUIRED`, `NO_FORCE_SEMANTICS=YES` | `docs/loop/harness-substitution-contract-v1.md` §2, §12 | Vanliga implementationsval är delegerade till architect/test-author/builder/reviewer-flödet; provider-`READY` är aldrig PASS-authority |
| Kvarvarande bootstrapkedja utan interaktiv ägare — inklusive owner-final freeze, publicering (push, PR, guarded normal merge commit), nästa task och supervisor resume: `OWNER_PUBLICATION_APPROVAL_REQUIRED=NO`, `OWNER_PR_APPROVAL_REQUIRED=NO`, `OWNER_MERGE_APPROVAL_REQUIRED=NO`, `OWNER_SUPERVISOR_RESUME_APPROVAL_REQUIRED=NO` | `docs/loop/remaining-bootstrap-delegation-v1.md` (»Guarded publication«, »Stop boundary«); `docs/loop/owner-author-workflow-v1.md` »Current-authority bounded delegation and publication« | Gäller endast medan varje mekanisk förutsättning är bevisad (exakt task/spec/grind/bas/kandidat-identitet, scope, oberoende granskning, ren worktree, exakt remote/PR); publiceraren är produktens `publish()` med `gh pr merge --merge` och head-guard — aldrig en rollagent; den seriella ordningen är utökad av H-038-undantaget (H-035 → H-034 → H-036 → H-039 → H-038 → H-032 → H-031) och ingen supervisor resume sker före hela kedjan är grön |
| Bundna prerequisite-migrationer inom redan godkända mål — ny prerequisite-task, exakt dependency-kant, registry-/schemamigration, nya exakta authority-paths, refreeze av downstream-grindar mot publicerad prerequisite, minimal effektbunden `allowed_write`-utvidgning — genom TEST_AUTHOR-frys → oberoende gate-granskning → guarded publicering → separat BUILDER → oberoende produktgranskning → guarded publicering → downstream-rebind | `docs/loop/remaining-bootstrap-delegation-v1.md` »Standing bounded-prerequisite authority migration« (BP01–BP14, `true_human_hard_stops`) | Alla BP01–BP14 sanna och ingen hard stop matchar; kontraktets aktiveringsstatus (`BOUNDED_PREREQUISITE_AUTHORITY_MIGRATION=ACTIVE`) kan inte avläsas ur detta träd: `OVERIFIERAT` |
| Uttryckligt allokerad TEST_AUTHOR-frys av task/spec, grind, register, fixturer och beslutsposter (t.ex. H-035 R33: exakt `specs/tasks.spec.json`, `verify/bin/h-035-exit`, `docs/loop/owner-author-workflow-v1.md`, `docs/loop/remaining-bootstrap-delegation-v1.md`, `docs/05-beslutslogg.md`, `docs/loop/drift.md`) | `docs/loop/owner-author-workflow-v1.md` »Actor effects«; `docs/loop/remaining-bootstrap-delegation-v1.md` »H-035 R33 minimal core-and-CLI owner decision« | Endast den exakt allokerade ytan, aldrig owner-production-bytes; h-037:s frysta `allowed_write` är exakt `controller/verify/register.json` (`specs/tasks.spec.json`) |
| Lokal repouppdelning 2026-09-10 (arbetskopior, lokala commits, överlämningsmaterial) | `SEPARATION-20260910/README.md` — `OVERIFIERAT`: filen är inte spårad i detta träd; vitlistan spårar endast `SEPARATION-20260910/proposed/` | Kan inte kontrolleras här; ingen källa i trädet delegerar push eller remote-byte för uppdelningen |

### Human-only (ägarens hand; agenten förbereder granskningsbart underlag)

| Yta/handling | Källa |
|---|---|
| §A-mängden: `docs/07-konstitution.md`, `docs/03-regelverk.md`, `workflows/**`, `tests/fixtures/**`, `AUTOPILOT`, `scripts/check-invariants.mjs`, `specs/**`, `verify/**`, `controller/**`, `CLAUDE.md` samt webbens eval-rubrik, juridikflaggor och steward-agent — alltid människa, alltid HÖGRISK-märkt commit | `docs/loop/byggplan-v3.md` §3.1 (»Två mekanismer, olika ytor«: `controller/**`, `specs/**`, `verify/**` vaktas av `allowed_write` + ägarhand, resten av §A-kontrollen); `docs/loop/regler.md` regel 6; `specs/tasks.spec.json` `defaults.denied_write` och `human_only` (m-001). Enda undantagen är uttryckligt frysta allokeringar: h-035:s v1-yta (»Its frozen v1 write surface is the exception«, `docs/loop/owner-author-workflow-v1.md`) och TEST_AUTHOR-raden ovan |
| `controller/verify/register.json` (verifierarregistret) och dess registrerade hash | `CLAUDE.md`; registrets egen `beskrivning` (»uppdateras endast av människohand i samma commit som filändringen«). Enda frysta undantaget är h-037 (`specs/tasks.spec.json`) |
| `.gitignore` (vitlistan) | Står inte i §3.1-listan eller `defaults.denied_write`; ingen tasks `allowed_write` omfattar den (`specs/tasks.spec.json`); byggplan §3.1 gör den bindande för `allowed_write` (LOOP-ÄGARHAND-26). Att den är §A-yta: `OVERIFIERAT` — men ingen källa delegerar den |
| Ändring av vad Nortropic i grunden får göra: konstitution/human-only-policy, försvagad trust-/säkerhetsmodell, confinement-bypass eller okonfinerad körning, materiellt bredare filsystem-/process-/nät-/credential-behörighet, generisk eller självvald ägarbehörighet, privilegierad broker med materiellt nytt trust-model (H-039-undantaget är exakt avgränsat), materiell scope-utvidgning, migration som inte kan frysas och falsifieras, äkta konflikt mellan högre auktoriteter, upprepad no-progress vid kanonisk tröskel | `docs/loop/remaining-bootstrap-delegation-v1.md` `true_human_hard_stops` och »H-038 OS-exclusive runtime-cleanup owner exception«; `docs/loop/codex-autopilot-v3-full-roadmap.md` »Enda mänskliga hårdstoppet«; `docs/loop/harness-substitution-contract-v1.md` §12 |
| Externa credentials, secrets, GitHub-organisationsidentiteter och andra externa trust roots som kräver mänsklig ceremoni, inklusive den externa Promoter-identiteten; en bred personlig `gh`-credential är aldrig tyst ersättning | `docs/loop/codex-autopilot-v3-full-roadmap.md` (hårdstopp 3, »External activation closeout«); `docs/loop/harness-substitution-contract-v1.md` §12–13; `docs/loop/remaining-bootstrap-delegation-v1.md` `true_human_hard_stops` |
| Repoidentitet/remote: guarded publication låser exakt `Nortropic/nortropic-system` och basref `main` | `docs/loop/remaining-bootstrap-delegation-v1.md` »Guarded publication«. Ingen källa delegerar byte av remote eller repoidentitet; utan delegation är det ägarens |
| H-039: root-/installationsceremonier via owner-TTY (`manual_owner_ceremony`, `root_install_ceremony`, `OWNER_HASH_VERIFICATION` → `ONE_NEW_R33_OWNER_TTY_ROOT_UPDATE`) och varje `OWNER_STOP`/`OWNER_ADJUDICATION_STOP`; ceremonierna är »WORKFLOW_REPORT_ONLY_AND_NEVER_MACHINE_GATE_CREDIT« | `specs/tasks.spec.json` h-039 (`h039_r*`-fälten, `required_serial_transition`); `docs/loop/owner-author-workflow-v1.md` »H-039 R14-R3/R9 compiled-status diagnostic and manual owner ceremony« och senare H-039-avsnitt. Adapter-, sekvens-2- och kvittopolicyfrågorna finns endast i material utanför repot: `OVERIFIERAT` här |
| Supervisor resume och livekörning i dag: inte human-only enligt delegationen, men mekaniskt stoppade tills H-039-kedjan är grön och ägaradjudikerad (`h038_h032_h031_or_supervisor_resume: false`) | `specs/tasks.spec.json` h-039; `docs/loop/remaining-bootstrap-delegation-v1.md` H-038-undantaget (»No supervisor resume occurs before all are green«) |

Frusna grindar gäller sina ursprungliga subjekt. En ny register- eller
dokumentgeneration accepteras inte genom omtolkning utan genom ett nytt fryst
kontrakt via TEST_AUTHOR och oberoende granskning (raden om bundna
prerequisite-migrationer ovan); ägarens hand krävs bara när en
`true_human_hard_stop` matchar. Webbförvaltningens regler (brief, juridik,
deploy, eval-rubrik, stewardtrappa) hör till webbrepot och är inte
plattformskrav; de återges inte här.

`controller/loop/cli` är befintligt kontrollplansarbete vars framtida roll följer
substitutionskontraktet; dess historiska form är inte automatiskt slutarkitekturen.
Den fullständiga historiska routertexten (inkl. webbdelarna) finns i Git-historiken
före `SEPARATION-20260910` och i webbrepot.
