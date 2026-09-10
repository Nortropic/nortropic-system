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
endast av människohand; frysta grindar, förbrukade försök och human-only-
ceremonier kvarstår. En router, handoff eller senare målbild är inte egen
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

## Operating model v2–v4 (oförändrat innehåll, plattformsdelen)

- **v2 (2026-08-10):** `scripts/nortropic-codex-autopilot.py` är den mekaniska
  exekveraren för redan owner-auktoriserat kontrollplansarbete
  (`OWNER_GATE_EXECUTOR=MECHANICAL`, `FROZEN_OWNER_GATES_REMAIN_TRUST_AUTHORITY=YES`).
  Rollagenterna committar/pushar/mergar inte själva.
- **v3 (2026-08-10):** full-roadmap-autonomi för S2, S4–S13 och empirisk slutkörning
  under den ägarlåsta planen `0b3212c991d4227c8df2656465ae2c0252dda39e`;
  programgrind `verify/bin/autonomous-loop-exit` fryses av test-author + gate-reviewer
  före downstream. Mänsklig hard-stop endast för uttryckliga undantag (human-only,
  juridik, verklig authority-konflikt, extern credential-/provisioningceremoni).
- **v4 (2026-08-11):** provider-neutral Trust Kernel enligt
  `docs/loop/harness-substitution-contract-v1.md`:
  `AGENT_REASONING_OWNER=PROVIDER_HARNESS`, `TRUST_TRANSITION_OWNER=NORTROPIC`,
  `MODEL_OUTPUT_IS_TRUST_AUTHORITY=NO`, `SUBSTITUTION_BEFORE_NEW_HARNESS_COMPONENT=REQUIRED`,
  `NO_FORCE_SEMANTICS=YES`. Reviderad sekvens SUB-1/h-027 → SUB-2/h-028 → SUB-3/h-029 →
  SUB-4/h-030 → S2/S4–S13 → L. Worktreen `owner/h-003-attestation-validity-44d525a5dd60`
  är bevarad forensisk evidens, inte authority.

`controller/loop/cli` är befintligt kontrollplansarbete vars framtida roll följer
substitutionskontraktet; dess historiska form är inte automatiskt slutarkitekturen.
Den fullständiga historiska routertexten (inkl. webbdelarna) finns i Git-historiken
före `SEPARATION-20260910` och i webbrepot.
