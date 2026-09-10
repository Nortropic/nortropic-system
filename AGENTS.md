# Agenter i nortropic-system (plattformsrepot)

Detta är en **router**: den pekar på källorna och återger dem inte. Repot är Nortropics
verksamhetsneutrala autonomiplattform: Trust Kernel (hela tillitsplattformen),
controller, bootstrap, supervisor/autopilot och tillhörande H-arbeten.
Webbförvaltningen är sedan 2026-09-10 utbruten till ett separat repo. Dess styrning
gäller inte plattformen och ingår inte i plattformens auktoritetsordning, instruktioner,
agentprompter eller körbara beroenden. Historiken är bevarad i Git-historiken före
uppdelningen och, för överfört material, i webbrepot med proveniens (se Historik nedan).

## Auktoritetsordning

Läs och följ i denna ordning när de är relevanta:

1. `docs/loop/harness-substitution-contract-v1.md` §1 (plattformsgräns och ägarskap)
2. `docs/loop/regler.md` (loopreglerna, rollerna, de tekniska skydden) och
   `docs/loop/byggplan-v3.md` (skivorna; den skyddade mängden i §3.1)
3. aktuell task i `specs/tasks.spec.json`
4. taskens frysta `exit_test` under `verify/bin/`
5. `docs/loop/drift.md` och övriga plan-/driftdokument under `docs/loop/`.
   `docs/loop/owner-author-workflow-v1.md` och `docs/loop/remaining-bootstrap-delegation-v1.md`
   är fryst grindinput (historisk evidens, byte-bunden av grindarna), inte dagens instruktion.

Vid konflikt gäller den högre auktoriteten. Ingen router, handoff, senare målbild eller
historisk text är egen operationsbehörighet. Historiska dokument och frysta artefakter
finns kvar för spårbarhet men är inte dagens instruktioner; gamla resultat behåller sina
ursprungliga subjekt. Det finns ingen ytterligare styrningsnivå, inget generellt
ägarlager och ingen undantagslista utöver det som står i källorna ovan.

## Autonomt arbetsflöde

Plattformen utvecklas och drivs med full autonomi inom det beordrade uppdraget och de
tekniska behörigheter som finns. Arkitektur, kontraktsförberedelse, spec,
verifierarregister, dokumentbindningar, implementation, granskning och rättning sker
utan mellanhand. Varje steg är en roll i egen tråd/worktree (`.agents/skills/`):

1. **test-author** (`$nortropic-test-author`) fryser kontraktet: specrad, fryst
   acceptansgrind (RED före implementation) och utvecklingsdokument. Skriver ingen produkt.
2. **oberoende kontraktsgranskning** (`$nortropic-gate-reviewer`, read-only) försöker
   falsifiera grinden: vakuösa rader, saknade positiva ankare, riggfel som blir dom.
3. **builder** (`$nortropic-builder`) implementerar inom taskens `allowed_write`.
   Buildern ändrar aldrig sin egen frysta grind eller sitt eget kontrakt.
4. **oberoende produktgranskning** (`$nortropic-reviewer`, read-only) försöker
   falsifiera kandidaten. Granskaren certifierar aldrig egna ändringar.
5. **lokal kvalificering**: den frysta grinden körs mot kandidaten; PASS finns bara som
   grindens exitkod.

`$nortropic-architect` (read-only) löser de arkitekturval flödet skickar dit;
`$nortropic-empirical-runner` falsifierar den sammansatta loopen i engångsstate.
Kontraktsändringar (spec, grind, register, pinnar, dokumentbindningar) går genom samma
flöde: ny test-author-frys → oberoende granskning → builder → oberoende granskning.
Rollseparationen är workflow-separation; de tekniska skydden nedan är gränsen.

```text
ROLE_SEPARATION=WORKFLOW
ROLE_SEPARATION_IS_SECURITY_BOUNDARY=NO
FROZEN_GATES_REMAIN_TRUST_AUTHORITY=YES
```

## Tekniska skydd (krav, inte prosa)

Plattformens skydd är uttryckliga tekniska krav. Deras giltighet beror inte på någon
annan styrning.

- **Identitet.** Varje dom binder exakt commit-identitet: kandidatens SHA måste vara en
  commit i repot (aldrig ett peelat taggobjekt), grinden körs mot exakt den kandidaten,
  attestationen bär samma SHA. Fel identitet är ett fel, aldrig en tom dom.
- **Behörig skrivning.** `controller/policy/cli` avvisar varje kandidat som rör den
  skyddade mängden — specens `defaults.denied_write`: `verify/**`, `specs/**`,
  `controller/verify/register.json`, `scripts/check-invariants.mjs`, `.gitignore`,
  `CLAUDE.md` — med exit 3 oavsett task och före varje lindrigare avslag, och varje
  skrivning utanför taskens `allowed_write` med exit 4. Mängden kommer ur specen, aldrig
  ur en egen lista.
- **Verifierare och hash.** `controller/verify/cli` kör endast verifierare som står i
  `controller/verify/register.json` med registrerad sha256. Saknad verifierare eller
  `hash_mismatch` är vägran före körning. Specens, registrets och plattformsdokumentens
  identitet är pinnad (`PLATFORM_SPEC`, `PLATFORM_REGISTER`, `PLATFORM_DOCUMENTS`).
- **Ingen falsk PASS.** PASS finns bara som en fryst grinds exitkod 0 med `result.json`.
  Rapporter, sessionsstatus, provider-`READY`, granskarens ord eller prosa är aldrig
  PASS. Traceback, riggfel och anropsfel är varken dom eller PASS.

Skills och separata trådar/worktrees ersätter inte `allowed_write`, sandbox, fryst
exit-test eller attestation. En roll får aldrig använda sin Skill som bevis för att en fil
faktiskt var mekaniskt otillgänglig.

## Repoidentitet före arbete

Innan en ändring som kan påverka Git- eller trust-state:

```bash
git branch --show-current
git rev-parse HEAD
git status --short
git rev-parse origin/main
```

Om remote inte kan kontrolleras: skriv `ORIGIN_MAIN=OVERIFIERAT`; gissa aldrig.
Ingen force-semantik: varken `--force`, `--force-with-lease`, ledande `+` i refspec eller
history overwrite.

## Evidence

Slutrapporten följer `docs/loop/codex-evidence-contract.md`. Agentens egen utsaga är inte
bevis. Ett grönt exit-test rapporteras med faktiskt kommando + exitkod. Overifierat märks
`OVERIFIERAT`.

## Fasgränser (nuvarande fas)

```text
PUSH=NO
MERGE=NO
```

I nuvarande fas ingår lokala immutabla commits och lokal kvalificering med frysta grindar.
Push, publicering, installation, livekörning och supervisor-resume ingår inte i denna fas.
Det är fasens omfång, inte en permanent regel om mänskligt godkännande. Den kvarvarande
bootstrapkedjans historiska delegation står i `docs/loop/remaining-bootstrap-delegation-v1.md`
(fryst grindinput: guarded normal merge commit, aldrig utan mekaniska grindar).

## Operating model v2–v4 (plattformsdelen)

- **v2 (2026-08-10):** `scripts/nortropic-codex-autopilot.py` är den mekaniska
  exekveraren av kontrollplansarbete (`FROZEN_GATES_REMAIN_TRUST_AUTHORITY=YES`).
  Rollagenterna committar/pushar/mergar inte själva.
- **v3 (2026-08-10):** full-roadmap-autonomi för S2, S4–S13 och empirisk slutkörning
  under den frysta planen `0b3212c991d4227c8df2656465ae2c0252dda39e`; programgrinden
  `verify/bin/autonomous-loop-exit` fryses av test-author + gate-reviewer före downstream.
  `HUMAN_AUTHORITY_HARD_STOP` är reserverat för en verklig konflikt mellan högre
  auktoriteter eller en extern credential-/provisioningceremoni som inte kan
  automatiseras — aldrig för att flera legitima designer finns.
- **v4 (2026-08-11):** provider-neutral Trust Kernel enligt
  `docs/loop/harness-substitution-contract-v1.md`:
  `AGENT_REASONING_OWNER=PROVIDER_HARNESS`, `TRUST_TRANSITION_OWNER=NORTROPIC`,
  `MODEL_OUTPUT_IS_TRUST_AUTHORITY=NO`, `SUBSTITUTION_BEFORE_NEW_HARNESS_COMPONENT=REQUIRED`,
  `NO_FORCE_SEMANTICS=YES`. Reviderad sekvens SUB-1/h-027 → SUB-2/h-028 → SUB-3/h-029 →
  SUB-4/h-030 → S2/S4–S13 → L. Worktreen `owner/h-003-attestation-validity-44d525a5dd60`
  är bevarad forensisk evidens, inte authority.

`controller/loop/cli` är befintligt kontrollplansarbete vars framtida roll följer
substitutionskontraktet; dess historiska form är inte automatiskt slutarkitekturen.

## Historik

Den styrning som före 2026-09-10 stod i plattformens dokument finns ordagrant i Git-historiken
före uppdelningen — `dae90c8f:docs/loop/regler.md`, `dae90c8f:docs/loop/byggplan-v3.md` och
specens dåvarande styrningsfält i `dae90c8f:specs/tasks.spec.json` — som historia och inte som
instruktion. Det renodlade webbmaterialet (dessa texters arkivkopior och webbens registervakt)
är överfört till webbrepot; överföringens proveniens (sökväg, blob-OID vid 332f07ce,
destination) står i `SEPARATION-20260910/WEB-TRANSFER-PROVENIENS.tsv` och
`SEPARATION-20260910/WEB-TRANSFER-PROVENIENS-2.tsv`. Den fullständiga historiska
routertexten finns i Git-historiken före uppdelningen; uppdelningens förslag ligger under
`SEPARATION-20260910/proposed/`. Den frysta autonoma planen (`0b3212c9`) är kopierad
byte-exakt till `docs/loop/autonomous-loop-plan-v1.md` och
`docs/loop/autonomous-loop-codex-handoff.md`; plan-authority läses ur dessa kopior, inte ur
någon origin-gren.
