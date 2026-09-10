# Autonoma loopen — implementationsplan v1

**Detta är en PLAN, inte en implementation.** Ingen produktionskod ändrades i någon av de
sessioner som skrev den. Planen föreslår spec-rader och exit-kriterier; den bygger dem inte.

**Revision 2 (2026-08-09) — slutlig ägarrevision.** Låser promotionens identitet och mekanik,
gör G20 blockerande i S1, och ersätter gårdagens OVERIFIERAT om branch protection med mätta
värden. Ändringarna står i PLANGRANSKNING, runda 2.

Vid konflikt gäller repot: `docs/07-konstitution.md`, `docs/03-regelverk.md` och
`docs/loop/regler.md` står över både denna plan och ägarens målbild.

---

## PLAN_BASE_SHA

```
PLAN_BASE_SHA       = 1eaa0724be990e14ae095b3be3910496d47d062e
PLAN_BRANCH         = plan/autonomous-loop-v1
PLAN_REV1_COMMIT    = d2394d66b4b556178f34f6df693a95b1e921066e
PLAN_REV1_TIP       = b6448240f4a217ec568e666d6f959e3135e4a272
```

Arbetskopian var **ren** vid båda revisionerna (`git status --short` tomt, ett worktree).
Grenen bär endast planartefakter — `git diff --name-only main..HEAD` ger exakt två filer.

---

## CURRENT_STATE

Mätt mot HEAD, inte mot minnet.

| Capability | SPECIFIED | EXIT_TEST | IMPLEMENTATION | WIRED_INTO_LOOP | REAL_RUN_EVIDENCE | AUTHORITATIVE_FILES |
|---|---|---|---|---|---|---|
| state/eventlog | h-001 | `verify/bin/h-001-exit` | JA | JA (claim) | JA | `controller/state/cli` |
| verify runner/register | h-002 | `verify/bin/h-002-exit` | JA | JA (global) | JA | `controller/verify/cli`, `controller/verify/register.json` |
| attestation/stale | h-003 | `verify/bin/h-003-exit` | JA | JA | JA | `controller/attest/cli` |
| lease | h-004 | `verify/bin/h-004-exit` | JA | JA | JA | `controller/lease/cli` |
| workspace | h-005 | `verify/bin/h-005-exit` | JA | JA | JA | `controller/workspace/cli` |
| worker/parser | h-006 | `verify/bin/h-006-exit` | JA | JA | JA | `controller/worker/cli` |
| policy | h-007 | `verify/bin/h-007-exit` | JA | JA | JA | `controller/policy/cli` |
| envelope | h-008 | `verify/bin/h-008-exit` | JA | JA | JA | `controller/envelope/cli` |
| launch/timeout | h-009 | `verify/bin/h-009-exit` | JA | JA (via utförare) | JA | `controller/launch/cli` |
| task selection/claim | h-010 | `verify/bin/h-010-exit` | JA | JA | JA | `controller/taskval/cli` |
| loop | h-011 | `verify/bin/h-011-exit` | JA | — | JA | `controller/loop/cli` |
| executor | h-012 | `verify/bin/h-012-exit` | JA | JA | JA | `controller/utforare/cli` |
| breaker | h-013 | `verify/bin/h-013-exit` | JA | JA | JA | `controller/brytare/cli` |
| **notification** | **h-014** | **NEJ** | **NEJ** | **NEJ** | **NEJ** | (obyggd) |
| **recovery** | **h-015** | **NEJ** | **NEJ** | **NEJ** | **NEJ** | (obyggd) |
| inkoppling | h-016 | `verify/bin/h-016-exit` | JA | JA | JA | `controller/loop/cli` |
| **per-task verdict** | **h-017** | **NEJ** | **NEJ** | **NEJ** | **NEJ** | (obyggd) |

**h-017 mätt vid HEAD:** noll förekomster av `grind_id` eller `exit_test` i
`controller/loop/cli`, `controller/verify/cli` och `controller/attest/cli`. Spec-raden finns
(slice 15, `depends_on` h-002 + h-016), skrivytan är vidgad med `controller/attest/cli`
(ÄGARHAND-42), men **varken prov eller komponent existerar**.

**REAL_RUN_EVIDENCE** kommer ur premiärkörningen `premiar-1` (LOOP-PREMIÄR-1): två tasks, två
attestationer, noll omförsök, verkliga Claude-sessioner. Sessionerna tog 10–20 min var.

**Fakta med tung planbetydelse, mätt:**

- **Kontrollplanet rör aldrig remote.** Noll träffar på `push`/`remote`/`origin` i samtliga
  tretton `controller/*/cli`. Auto-promotion är en ny förtroendeyta, inte en utvidgning.
- **`RUNNERS = {"node": "node"}`** i `controller/verify/cli` — registret kan inte starta någon
  av husets sexton bash-grindar (`verify/bin/` bär sexton `*-exit` plus `_lib.sh`). Mätt i klon:
  `"bash": "bash"` + registerpost gav `verify run p-001-exit .` → 6 PASS 0 FAIL, `h-002-exit`
  orört 6 PASS, `hash_mismatch` fäller fortfarande.
- **`REGISTER` är en fast sökväg** (`Path(__file__).resolve().parent / "register.json"`) och går
  inte att peka om. Fixturregister kräver mutation med återställning (h-002:s precedent).
- **Eventschemat är `{task, status}`** och inget annat: `giltigt_event` kräver icke-tomma
  strängfälten `task` och `status`. Det rymmer ingen körningshändelse.
- **`LEASE_TTL = "180"`** utan heartbeat, medan ett varv mätts ta 10–20 minuter.
- **Worker-env filtreras med en DENYLIST.** `controller/launch/cli` rad 56–72:
  `KANSLIGA_PREFIX = ("GH_", "GITHUB_", "SLACK_")`, och kommentaren säger uttryckligen att ett
  bredare filter hör till sandbox-skivan. En credential vars namn ligger utanför de tre
  prefixen når buildern. **Detta avgör var promotion-credentialen får bo — se S7.**
- **Grindarnas kostnad är mätt:** h-002 0,2 s · h-007 2,4 s · h-013 7,7 s · h-011 10,7 s ·
  p-001 17 s · h-016 29 s. Ingen grind når en minut.

### Repository identity — MÄTT efter ägarbeslutad transfer (2026-08-09)

```
REPOSITORY_IDENTITY_BEFORE = Jonkebronk/nortropic-system
REPOSITORY_IDENTITY_AFTER  = Nortropic/nortropic-system
REPOSITORY_ID              = OFÖRÄNDRAT
DEFAULT_BRANCH             = main
origin/main efter transfer = exakt samma commit som före
plan/autonomous-loop-v1    = följde med, tip 9bc1c6187da44173d5e29d440cf97d72dae22b0a
```

Transfern flyttade ägarskapet till organisationen `Nortropic`. Eftersom repository-id är
oförändrat och `origin/main` inte rörde sig, är **ingen mätning i denna plan ogiltigförklarad av
transfern** — bara identiteten den uttrycks i. Promotion-scope och GitHub App-målbilden är
omskrivna därefter; allt annat står orört.

### GitHub-läget — MÄTT av ägaren utanför sandboxen (2026-08-09)

Detta ersätter revision 1:s OVERIFIERAT om branch protection. Classic branch protection **följde
med transfern** och är mätt igen efteråt.

```
CLASSIC BRANCH PROTECTION på main
  require pull request        = YES
  required approving reviews  = 0
  enforce admins              = YES
  required signatures         = NO
  required linear history     = NO
  force pushes                = DISABLED
  deletions                   = DISABLED
  conversation resolution     = NO

ACTIVE RULES ON main          = []
REPOSITORY RULESET            id=20553421  följde med transfern — LÄST I SIN HELHET
  RULESET_20553421_EXISTS               = YES
  RULESET_20553421_ENFORCEMENT          = active
  RULESET_20553421_REF_INCLUDE_COUNT    = 0
  RULESET_20553421_EFFECTIVE_ON_MAIN    = NO
  RULESET_20553421_EFFECTIVE_ON_ANY_REF = NO
  RULESET_20553421_CURRENT_TRUST_ROLE   = NONE
```

**Följd för planen:** auto-promotion faller mot dagens `main` — PR krävs och `enforce admins`
är på, så ingen identitet kan pusha direkt. Det är inte ett hinder utan en förutsättning som
S7 måste hantera med en avgränsad bypass (se PROMOTION_PLAN §PR-BYPASS). Att force push och
radering redan är avstängda på GitHub-sidan är en **andra spärr** bakom planens egen regel —
inte planens enda skydd.

**Ruleset `id=20553421` — LÄST I SIN HELHET, träffar ingenting.** Rulesetet finns och står som
`enforcement: active`, och det BÄR regler: `deletion`, `non_fast_forward` och `pull_request` med
`required_approving_review_count: 1`. Men dess villkor är

```json
"conditions": { "ref_name": { "include": [], "exclude": [] } }
```

och GitHubs dokumenterade `ref_name`-semantik kräver att **minst ett värde i `include` matchar**
för att villkoret ska passera. Med `include: []` kan ingen ref matcha. Det stämmer med den
separata mätningen: `gh api repos/Nortropic/nortropic-system/rules/branches/main` → `[]`.

**Följd:** rulesetet har i dag ingen trust-roll alls. Planen får varken räkna det som ett skydd
eller anta att det blockerar promotion. **Den uppmätta och effektiva main-protectionen är classic
branch protection**, ovan.

**Detta betyder inte att rulesetet ska tas bort eller ändras** — det görs inte i denna session.
Men två saker i det är värda att bära med sig till S7: `bypass_actors` är **tomt**, och
`pull_request` kräver **en approval** (mot classic protections noll). Skulle rulesetet någon gång
få en `include`-post blir det alltså strängare än dagens skydd och skulle stoppa auto-promotion
även med appen på plats. Därför ska GitHub-skydd och ruleset-konfiguration granskas om före S7 —
den framtida Nortropic Promoter-konfigurationen finns ju ännu inte.

---

## CURRENT_FLOW

Rekonstruerad ur `controller/loop/cli` vid HEAD, med ägare per ansvar.

```
config (las_config, rad 141–200; 14 fält, prövas i sin HELHET före leasen)
→ lease acquire            controller/lease/cli      (TTL 180 s, ingen heartbeat)
→ [drain, per task]
   → taskval claim         controller/taskval/cli    (doneness ur ATTEST, ETT event {task,status})
   → [försök 1..budget, INUTI claimet]
      → workspace create   controller/workspace/cli  (eget ws per försök, OFÖRÄNDRAD base)
      → envelope build     controller/envelope/cli   (nio §12-fält; exit_test följer ALDRIG med)
      → brytare kor        controller/brytare/cli    (budget + fingerprints per task)
         → utforare kor    controller/utforare/cli   (stagar, committar, rapport ur GIT)
            → launch run   controller/launch/cli     (timeout, processgrupp, env-denylist)
      → worker parse       controller/worker/cli     (hela stdout = ett kuvert)
      → policy check       controller/policy/cli     (allowed_write, budgetar, docs-krav, §A)
      → verify run         controller/verify/cli     (CONFIGENS verifier_id, mot kandidatträdet)
      → [TASKGRIND]                                   ← FINNS INTE (h-017 obyggd)
      → attest write       controller/attest/cli     (4 fält: task, candidate_sha,
                                                       invalidates_on, stale)
      → workspace destroy
   → base = kandidat-SHA vid attestation, annars orörd
→ lease release
→ exit 0 drain · 1 fel · 3 rent stopp (brytaren öppen)
```

**Byggt:** allt ovan utom `[TASKGRIND]`.
**Endast design/spec:** h-014 notis, h-015 återtag, h-017 taskgrind.
**Finns inte alls, varken spec eller kod:** failure-feedback, operations-event, promotion,
merge-resolver, trust-transition, Markdown-intake, Task IR, verifier author/challenger,
evaluator, read/command-kontrakt, lease-heartbeat.

**Efter drain:** kandidaterna är commits **utan gren**. Ingen ref når dem; de nås bara via
attestationsbutiken, och `git gc` kan städa bort dem. Människan skapar grenen och mergar.

---

## TARGET_STATE

Nortropic ska bli ett **bounded, closed-loop autonomous software-engineering system with trusted
verification, automatic promotion, agentic conflict resolution and a Markdown-to-verified-task
intake pipeline.**

```
RAW BACKLOG / MARKDOWN → INTAKE/PLANNER → FROZEN TASK CONTRACT → VERIFIER PREPARATION
→ CLAIM → ATTEMPT N → FRESH WORKSPACE → BUILDER AGENT → CANDIDATE
→ POLICY → GLOBAL VERIFIER → TRUSTED TASK-SPECIFIC ACCEPTANCE GATE
→ OPTIONAL INDEPENDENT EVALUATOR
→ PASS?  NO  → STRUCTURED FAILURE FEEDBACK → ATTEMPT N+1 (fresh ws, SAMMA task-base)
         YES → ATTEST → PROMOTE → VERIFY MAIN → NEXT TASK
```

Människan är **inte** normal merge-gate. Intervention är exception-driven: systemet stannar när
det inte säkert kan återupprätta bevis.

---

## GAP_ANALYSIS

Formen är målfilens. `EXISTING_COMPONENT_CAN_OWN_THIS` besvaras mot faktisk kod.

### G1 · Trusted task gate (h-017)

```
EXISTING_COMPONENT_CAN_OWN_THIS = YES  (controller/verify/cli + controller/loop/cli)
WHY   = verify kör redan den godkända filen UR REPOT, hash-kontrollerad före start, med
        målkatalogen som cwd. Saknas: bash i RUNNERS, ett uppslagsverb, loopens anrop,
        bokföring i attestationen — och G20:s ordningsregel.
NEW_COMPONENT_REQUIRED = NO
TRUST_IMPACT = HÖG. Detta ÄR trust-gränsen mellan builder och domare.
STATE_IMPACT = attestationen får två fält (grind_id, grind_sha256). Bakåtkompatibelt.
TEST_IMPACT  = verify/bin/h-017-exit (obyggt). h-003-exit grepar mot värden, inte fältuppsättning
               — extra fält fäller den inte (mätt).
```

### G20 · Taskgrinden kör kandidatens komponenter — **BLOCKERANDE i S1**

```
EXISTING_COMPONENT_CAN_OWN_THIS = YES, men bara om h-017:s kontrakt bär regeln
WHY   = MÄTT: kmd_run kör grindfilen ur repot (sakra_sokvag löser mot ROT = parents[2]) men med
        cwd = kandidatträdet, och husets grindar adresserar komponenter RELATIVT
        (`CLI="controller/verify/cli"`; `krav_komponent` gör `[ ! -x "$1" ]`, _lib.sh rad 7-14).
        En taskgrind startar alltså KANDIDATENS controller/*/cli. För en vanlig task är det
        rätt — grinden ska döma kandidatens produkt. För en task som ändrar kontrollplanet
        betyder det att kandidatens egen modifierade mekanism deltar i domen över sig själv,
        REDAN VID GRINDKÖRNINGEN — före den promotion och trust-transition S9 skulle vakta.
        h-017 är själv en sådan task: dess skrivyta bär controller/verify/cli.
NEW_COMPONENT_REQUIRED = NO. Det är en ORDNINGSREGEL, inte en komponent.
TRUST_IMPACT = HÖGST i S1. Utan regeln är målbild §2.7 brutet innan promotion ens är byggd.
STATE_IMPACT = ingen ny butik. Configen behöver veta vilken yta som är trust-critical.
TEST_IMPACT  = S1:s prov måste mäta en trust-critical kandidat vars komponent är saboterad så
               att den alltid säger JA — attestationen ska ändå utebli.
```

**Regeln planen låser:**

> En task vars diff rör den trust-critical ytan får sin taskgrind körd med **repots** (pre-task)
> komponenter. Kandidatträdet är då grindens **indata**, inte dess **körmiljö**.

Grinden får fortfarande döma kandidatens *produkt*. Det som inte får bytas ut av den som döms är
den **exekveringsmekanism som fäller domen**. Vilken yta som är trust-critical står i
TRUST_TRANSITION_PLAN och låses av ägarhand.

**Ingen senare slice får användas som ursäkt för att lämna G20 öppet i S1.**

### G2 · Failure-feedback till nästa attempt

```
EXISTING_COMPONENT_CAN_OWN_THIS = DELVIS
WHY   = kuvertet (h-008) är rätt kanal IN till buildern och ska UTVIDGAS, inte ersättas. Men
        det bär i dag nio fasta fält och ingen historik, och ingen komponent äger en immutabel
        artefakt per försök. Utföraren kastar sessionens stdout vid nonzero (h-009), så orsaken
        finns bara som brytarens text.
NEW_COMPONENT_REQUIRED = JA för BUTIKEN. NEJ för kanalen — h-008 utvidgas.
TRUST_IMPACT = MEDEL. Feedback får inte läcka verifierarens implementation eller registret på
        ett sätt som gör self-certification/tuning trivial (målbild §2.2).
STATE_IMPACT = ny artefaktbutik, adresserad per (run_id, task_id, attempt_id).
TEST_IMPACT  = måste mäta att attempt N+1 FÅR artefakten och att den INTE bär grindens kod.
```

### G3 · Recovery/crash consistency (h-015)

```
EXISTING_COMPONENT_CAN_OWN_THIS = NEJ
WHY   = h-015 har spec-rad men ingen kod. Mätt behov: TTL 180 s utan heartbeat mot varv på
        10–20 min betyder att en andra controller kan återta resursen mitt i en levande
        körning. Brytaren har inget reset-verb; en öppen brytare stoppar varje ny körning tills
        en människa raderar tillståndsfilen (drift.md §6).
NEW_COMPONENT_REQUIRED = JA (controller/atertag/cli, redan specad)
TRUST_IMPACT = MEDEL-HÖG. Full autonomi får inte byggas ovanpå odefinierad restartsemantik.
STATE_IMPACT = läser attest + state + brytartillstånd + promotion-state; skriver lease-återtag.
TEST_IMPACT  = verify/bin/h-015-exit (obyggt).
```

### G19 · Lease TTL/heartbeat

```
EXISTING_COMPONENT_CAN_OWN_THIS = YES (controller/lease/cli)
WHY   = h-004 bär redan acquire/release/owner med TTL. Heartbeat saknas och har ingen spec-rad;
        loop/cli rad 88–92 skriver ut att det medvetet inte byggts.
NEW_COMPONENT_REQUIRED = NO — h-004 utvidgas. Ingen parallell lease-komponent.
TRUST_IMPACT = MEDEL, men BLOCKERANDE för promotion: promotion får bara ske under giltig,
        bevisad ownership.
STATE_IMPACT = leasefilen får en förnyelsestämpel.
TEST_IMPACT  = h-004-exit måste vidgas; mätt att ett varv tar 10–20 min mot TTL 180 s.
```

### G4 · Operations/lifecycle-eventström

```
EXISTING_COMPONENT_CAN_OWN_THIS = NEJ
WHY   = skiva 1:s event är {task, status} och `giltigt_event` avvisar allt annat. Loopens
        doktrin säger uttryckligen att kedjan INTE skriver egna event. Att vidga skiva 1:s
        schema skulle blanda authoritative task state med observability.
NEW_COMPONENT_REQUIRED = JA — separat, versionerad eventström i EGEN butik.
TRUST_IMPACT = LÅG för domen, HÖG för observerbarhet. Events är aldrig bevis; attestationen är.
STATE_IMPACT = NY logg. Skiva 1:s semantik rörs INTE. Operationsströmmen får ALDRIG bli
        scheduler- eller doneness-authority.
TEST_IMPACT  = måste mäta att task-state är BYTE-IDENTISKT och att strömmen är append-only.
```

### G5 · Auto-promotion till authoritative main

```
EXISTING_COMPONENT_CAN_OWN_THIS = NEJ
WHY   = MÄTT: noll träffar på push/remote/origin i samtliga tretton controller/*/cli. Kedjan har
        ingen remote-yta, ingen credential-hantering och ingen main-identitetskontroll.
NEW_COMPONENT_REQUIRED = JA, i EGEN trust-domän (credentialen får inte nås av buildern).
TRUST_IMPACT = HÖGST i hela planen. Detta tar bort människan ur merge-gaten.
STATE_IMPACT = promotion måste vara idempotent och crash-safe; se PROMOTION_PLAN.
TEST_IMPACT  = kräver ett prov mot ett LOKALT bare-repo som står för origin — aldrig mot den
        verkliga remoten.
```

### G6 · Main-identitet och icke-förstörande uppdatering

```
EXISTING_COMPONENT_CAN_OWN_THIS = NEJ
NEW_COMPONENT_REQUIRED = JA (del av G5)
TRUST_IMPACT = HÖG. Två controllers eller en människa får aldrig skriva över varandra.
STATE_IMPACT = promotion måste bära förväntad gammal main-SHA och kräva fast-forward.
TEST_IMPACT  = måste mäta att promotion AVBRYTS när main rört sig sedan verifieringen, och att
        main då står ORÖRD.
```

### G7 · Merge conflict resolver · G8 · Full omverifiering av löst kandidat

```
EXISTING_COMPONENT_CAN_OWN_THIS = NEJ
WHY   = ingen komponent känner till konflikter. Utföraren committar i ett workspace på
        oförändrad base; ingen rebase eller merge sker någonstans i kedjan.
NEW_COMPONENT_REQUIRED = JA
TRUST_IMPACT = HÖG. B:s PASS får aldrig ärvas av D (målbild §2.5).
STATE_IMPACT = D är en ny kandidatidentitet med egen attestation och parent = aktuell main.
TEST_IMPACT  = måste mäta att D verifieras från noll och att B:s attestation inte återanvänds.
```

### G9 · Trust-critical självmodifiering (runtime-transition)

```
EXISTING_COMPONENT_CAN_OWN_THIS = NEJ
WHY   = kedjan kör alltid REPOTS controller/*/cli via ROT = parents[2]. Efter promotion finns
        ingen mekanism som avslutar den gamla processen rent och verifierar den nya mainen
        innan backloggen återupptas.
NEW_COMPONENT_REQUIRED = JA — supervisor + bootstrap-verifiering.
AVGRÄNSNING MOT G20 = G20 svarar på "vem dömer kandidaten?" och löses i S1. G9 svarar på "hur
        blir den nyss promoverade versionen nästa trusted runtime?" och löses i S9. De
        duplicerar inte varandra; G20 utan G9 lämnar hot-reload öppen, G9 utan G20 lämnar
        grindkörningen öppen.
TRUST_IMPACT = HÖG. Utan detta kan systemet certifiera sin egen födelse.
TEST_IMPACT  = måste mäta att den nya controllern inte dömer något före bootstrap.
```

### G10 · Markdown intake · G11 · Canonical Task IR

```
EXISTING_COMPONENT_CAN_OWN_THIS = DELVIS
WHY   = `spec` är redan ett SÖKVÄGSFÄLT i configen och loopen läser aldrig tasklistan själv —
        vilken JSON-fil som helst med en tasks-array duger (bevisat: premiären körde mot
        config/premiar-backlog.json). Runtime-representationen finns; det som saknas är
        kompilatorn från Markdown och provenance-fälten.
NEW_COMPONENT_REQUIRED = JA (intake/planner), men den PRODUCERAR dagens format utvidgat.
TRUST_IMPACT = MEDEL. Intake får aldrig göra en task verifierbar på pappret utan grind.
STATE_IMPACT = nya tillstånd RAW..DONE lever i intake-butiken, inte i skiva 1:s state.
TEST_IMPACT  = NEEDS_SPEC måste vara ett mätbart utfall med BUILDER_STARTS=0.
```

### G12 · Verifier author + challenger · G13 · Frusna verifierarartefakter

```
EXISTING_COMPONENT_CAN_OWN_THIS = DELVIS
WHY   = registret ÄR frysmekanismen: id → path + sha256, hash-kontroll före start, och
        `sakra_sokvag` vägrar symlänk och väg ut ur repot. Det som saknas är rollerna som
        FÖRFATTAR och ANGRIPER grinden innan den fryses.
NEW_COMPONENT_REQUIRED = JA för rollerna, NEJ för frysningen.
TRUST_IMPACT = HÖG. Author och builder får inte vara samma trust-domän/session (målbild §5).
STATE_IMPACT = registerposter skapas per task; registret växer från 2 till ~18+.
TEST_IMPACT  = challengern måste mätas på att den fäller en medvetet svag verifierare.
```

### G14 · Independent evaluator · G15 · Bounded adversarial review

```
EXISTING_COMPONENT_CAN_OWN_THIS = NEJ
NEW_COMPONENT_REQUIRED = JA, provider-neutral
TRUST_IMPACT = LÅG för domen (konsensus är aldrig root of trust), MEDEL för kostnad.
STATE_IMPACT = findings blir feedback (G2) och kräver full omverifiering.
TEST_IMPACT  = måste mäta att evaluatorns JA aldrig ensamt attesterar.
```

### G16 · Read/command-kontrakt för Verkstadsgolvet

```
EXISTING_COMPONENT_CAN_OWN_THIS = NEJ
WHY   = ingen läsyta finns; drift.md §3 föreskriver i dag att människan tittar i katalogerna.
NEW_COMPONENT_REQUIRED = JA, men BYGGER PÅ G4:s eventström.
TRUST_IMPACT = HÖG om fel byggd. Webbappen får aldrig generisk shell-/Git-yta och får aldrig
        själv certifiera eller promovera Git.
STATE_IMPACT = projection, aldrig root of truth. Controller local state är authority.
TEST_IMPACT  = måste mäta att kommandoytan avvisar allt utanför de fem verben.
```

### G17 · Branch protection — **MÄTT, inte längre öppet**

```
STATUS = MÄTT av ägaren 2026-08-09, se CURRENT_STATE. main kräver PR, enforce admins är PÅ,
         force push och radering är AVSTÄNGDA, linear history är AV.
FÖLJD  = auto-promotion kräver en avgränsad PR-bypass för promotionsidentiteten. Se
         PROMOTION_PLAN §PR-BYPASS.
RULESET = id=20553421 är LÄST i sin helhet. Det finns och är enforcement=active, men
         conditions.ref_name.include är TOMT, så det träffar ingen ref — varken main eller någon
         annan. EFFECTIVE_ON_MAIN=NO, CURRENT_TRUST_ROLE=NONE. Planen räknar det INTE som ett
         skydd. Den effektiva main-protectionen är classic branch protection.
KVAR ATT GÖRA FÖRE S7 = granska GitHub-skydd och ruleset-konfiguration på nytt, eftersom
         Nortropic Promoter-konfigurationen ännu inte finns.
```

### G18 · Credential och privilegieseparation — **BESLUTAT**

```
STATUS = ÄGARBESLUT 2026-08-09. Promotion använder en dedikerad GitHub App, se PROMOTION_PLAN.
MÄTT HINDER = controller/launch/cli filtrerar worker-env med en DENYLIST på tre prefix
         (GH_, GITHUB_, SLACK_). En credential vars namn ligger utanför dem når buildern.
         Denylistan är därför INTE tillräcklig som privilegiegräns för promotion.
FÖLJD  = credentialen får aldrig ligga i controllerns miljö alls. Se S7:s trust-domän.
```

---

## TRUST_MODEL

Fem domäner, och den bärande regeln är att ingen får döma sin egen produkt.

```
BUILDER            sessionen i workspacet. Ser kuvertet. Ser ALDRIG exit_test, registret eller
                   grindens kod. Får redigera filer i workspacet. Får aldrig committa (h-012
                   fäller det). Har ALDRIG åtkomst till promotion-credentialen.

DETERMINISTIC      controller/*/cli ur REPOT, aldrig ur kandidaten. Grindar körs
VERIFIER           hash-kontrollerade ur registret. För trust-critical tasks körs de dessutom
                   med repots komponenter som körmiljö (G20).

INDEPENDENT        valfri LLM-evaluator. Aldrig root of trust. Dess JA attesterar aldrig ensamt;
EVALUATOR          dess NEJ kan stoppa en attestation.

PROMOTER           egen trust-domän. Äger GitHub App-nyckeln och den kortlivade
                   installationstoken. Läser attestation och remote-ref, skriver main. Kan inte
                   bygga, kan inte döma, kan inte läsas av buildern.

OWNER              spec-rader, register-godkännande, konstitution, GitHub-inställningar. Enda
                   som får vidga förtroende.
```

**Mätta egenskaper som bär modellen i dag:** kuvertet utelämnar `exit_test` (h-008) · `specs/**`
är denied_write, så en task kan inte peka om sin egen grind · registret binder path + sha256 och
hash-kontrollen ligger FÖRE start · `sakra_sokvag` vägrar symlänk och väg ut ur repot · utföraren
committar, inte sessionen · `policy` avvisar varje diff utanför `allowed_write` och prövar §A först.

**Grindens laddning är mätt och exakt — och den skär åt två håll:**

```
GRINDFILEN      kommer ur REPOT. sakra_sokvag löser post["path"] mot ROT = parents[2],
                aldrig mot målkatalogen (controller/verify/cli rad 47-56).
_lib.sh         kommer också ur REPOT: grindarna sourcar `. "$(dirname "$0")/_lib.sh"`
                och $0 är den absoluta sökvägen kmd_run startar (str(p)).
                En kandidat kan alltså INTE byta ut biblioteket.
DET GRINDEN     kommer ur KANDIDATEN. kmd_run kör med cwd=mal, och grindarna adresserar
RÖR             komponenter RELATIVT (_lib.sh rad 7-14).  ← detta är G20
```

**Hål som planen stänger:** G20 i S1 · promotion-credentialens separation i S7 · runtime-transition
i S9. **Hål som kvarstår som ägarhandslarm:** `_lib.sh` är inte hash-bunden — mätt exponering är
dock att en kandidat inte når den (den laddas ur repot via `$0`), så det är ett driftlarm, inte
en kandidatväg. Registret ligger under `controller/`, alltså i en yta en task kan begära.

---

## PROPOSED_SLICES

Alla slices följer beslut 3: **spec-rad och exit-test före kod.** Ingen implementeras i denna
session. `allowed_write` måste ligga inom `.gitignore`-vitlistan — mätt: `/*` ignorerar roten och
`!/controller/` vitlistar hela trädet, så nya underkataloger spåras utan ändring.

Namnen är förslag i planens form `controller/<del>/cli`. Regel 3 kräver planens namn — de
slutgiltiga namnen sätts i spec-raden av ägarhand.

### S1 · h-017 — per-task-domen, **inklusive G20** *(spec-rad FINNS, slice 15)*

```
ID / NAME                          S1 · h-017 · trusted task-specific acceptance gate
WHY_EXISTING_COMPONENT_CANNOT_     Den KAN. controller/verify/cli äger uppslag och körning,
OWN_IT                             controller/loop/cli äger anropet, controller/attest/cli äger
                                   bokföringen. Ingen ny komponent skapas.
DEPENDS_ON                         h-002, h-016
ALLOWED_WRITE_CANDIDATE            controller/loop/**, controller/verify/cli,
                                   controller/attest/cli, tests/controller/loop/**,
                                   docs/05-beslutslogg.md, docs/loop/drift.md
                                   (controller/verify/register.json ligger UTANFÖR — registret
                                    får aldrig ligga i en yta en task kan skriva i)
EXIT_TEST_PATH                     verify/bin/h-017-exit                          (OBYGGT)
EXIT_CRITERION                     (1) En kandidat attesteras endast om BÅDA domarna är gröna,
                                   och attestationen bär grind_id och grind_sha256.
                                   (2) Grinden slås upp på spec-radens exit_test-SÖKVÄG, aldrig
                                   på id ur kandidaten.
                                   (3) En task utan registerpost attesteras som förut men UTAN
                                   grind_id, och körningen stoppas inte.
                                   (4) G20: en task vars diff rör den trust-critical ytan får
                                   sin taskgrind körd med REPOTS komponenter. Mäts med en
                                   kandidat vars nya trust-critical komponent är saboterad att
                                   alltid säga JA — attestationen ska ändå utebli.
NEGATIVE_CONTROLS                  grind som aldrig körs · grind körd mot reporoten i stället
                                   för kandidaten · vänlig post under annat path · kandidat som
                                   lägger alltid-grön kopia av grind, _lib.sh OCH register i
                                   eget träd · driven SHA (hash_mismatch måste fälla) · task
                                   utan registerpost · **trust-critical kandidat vars komponent
                                   alltid säger JA** · riggfel som tyst blir grön dom
TRUST_IMPACT                       HÖGST i planens tidiga del. Detta ÄR trust-gränsen mellan
                                   builder och domare, och G20 är blockerande.
STATE_IMPACT                       attestationen får två valfria fält. Bakåtkompatibelt: h-003
                                   grepar mot värden, inte fältuppsättning (mätt).
```

**Riggfrågor att lösa när provet skrivs:** `REGISTER` är en fast sökväg och går inte att peka om
— ett fixturregister kräver mutation av repots register med säkerhetskopia och `trap` (h-002:s
precedent, vald väg enligt ÄGARHAND-42). **Riggfel ska stanna FÖRE leasen** (registret prövas i
sin helhet), **domen kostar försök.**

### S2 · h-015 — återtaget och restartsemantiken *(spec-rad FINNS, slice 13)*

```
ID / NAME                          S2 · h-015 · recovery
WHY_EXISTING_COMPONENT_CANNOT_     Ingen komponent äger restart. Leasen vet om TTL men inte om
OWN_IT                             halvfärdiga försök; brytaren har inget reset-verb; attest vet
                                   inget om promotion. Återtaget måste läsa alla tre.
DEPENDS_ON                         h-010, h-013, h-016 (och S3 för giltig ownership)
ALLOWED_WRITE_CANDIDATE            controller/atertag/**, tests/controller/atertag/**,
                                   docs/05-beslutslogg.md
EXIT_TEST_PATH                     verify/bin/h-015-exit                          (OBYGGT)
EXIT_CRITERION                     En körning som dödas mitt i ett försök kan återupptas utan
                                   människa, och rekonstruktionen läser AUKTORITATIVA
                                   identiteter (attest, state, lease, promotion-state) — aldrig
                                   eventströmmen. Efter restart finns: ingen dubbel task, ingen
                                   falsk attestation, ingen tappad failure-historik, rätt base,
                                   konsistent promotion-state, exakt en lease-ägare. Brytaren
                                   har ett reset-verb som ersätter dagens manuella radering av
                                   tillståndsfilen. Kan sanningen inte rekonstrueras: FAIL-CLOSED
                                   med orsak, aldrig gissad recovery.
NEGATIVE_CONTROLS                  lease återtagen FÖRE TTL · attesterad task väljs om · öppen
                                   brytare överlever inte omstart · två samtidiga återstarter
                                   ger två ägare · recovery som läser eventströmmen som sanning ·
                                   recovery som gissar när state är tvetydigt
TRUST_IMPACT                       MEDEL-HÖG. Full autonomi får inte byggas ovanpå odefinierad
                                   restartsemantik — därför ligger denna FÖRE promotion.
STATE_IMPACT                       läser attest + state + brytartillstånd + promotion-state;
                                   skriver lease-återtag och brytaråterställning.
```

### S3 · h-004 utvidgas med heartbeat *(UTVIDGNING, inte ny komponent)*

```
ID / NAME                          S3 · lease heartbeat / renewal
WHY_EXISTING_COMPONENT_CANNOT_     Den KAN och ska. controller/lease/cli äger redan
OWN_IT                             acquire/release/owner med TTL. En parallell lease-komponent
                                   vore två sanningar om exklusivitet — precis det repot varnar
                                   för. Ingen ny komponent.
DEPENDS_ON                         h-004
ALLOWED_WRITE_CANDIDATE            controller/lease/**, controller/loop/**,
                                   tests/controller/lease/**, docs/05-beslutslogg.md
EXIT_TEST_PATH                     verify/bin/h-004-exit (VIDGAS — ägarhand)
EXIT_CRITERION                     En körning vars varv tar längre än TTL behåller sin lease
                                   hela vägen: förnyelsen sker under körningen och en andra
                                   controller får INTE ta resursen så länge den första lever.
                                   Dör den första löper leasen ut och återtaget (S2) kan ta
                                   över. Mätt mot verkligt förhållande: TTL 180 s mot varv på
                                   10–20 min.
NEGATIVE_CONTROLS                  lease som löper ut under levande körning · lease som ALDRIG
                                   löper ut (död process behåller resursen för evigt) · två
                                   ägare samtidigt · förnyelse som fortsätter efter att
                                   processen dött · förnyelse som lurar sig på ett klockhopp
GRUND ATT BYGGA PÅ (mätt)          h-004 utgår redan från BÅDA klockorna: `vagg_forfluten >= ttl
                                   and mono_forfluten >= ttl` (lease/cli rad 80–96), just för att
                                   ett väggklockshopp inte ska frigöra en levande lease.
                                   Förnyelsen ska använda samma tvåklocksform — inte införa en
                                   tredje tidsuppfattning.
TRUST_IMPACT                       MEDEL i sig, men BLOCKERANDE för S7: promotion får bara ske
                                   under giltig, bevisad ownership.
STATE_IMPACT                       leasefilen får en förnyelsestämpel. Formen är bakåtkompatibel.
```

### S4 · NY — strukturerad failure-feedback

```
ID / NAME                          S4 · controller/aterkoppling
WHY_EXISTING_COMPONENT_CANNOT_     Kuvertet (h-008) är rätt KANAL in till buildern och utvidgas
OWN_IT                             — men det bär nio fasta fält och ingen historik, och en
                                   immutabel artefakt per försök behöver en BUTIK. Att lägga
                                   lagringen i h-008 hade gjort den till både format och arkiv.
DEPENDS_ON                         h-012, h-013, h-016, S1
ALLOWED_WRITE_CANDIDATE            controller/aterkoppling/**, controller/envelope/cli,
                                   tests/controller/aterkoppling/**, docs/05-beslutslogg.md
EXIT_TEST_PATH                     verify/bin/h-018-exit
EXIT_CRITERION                     Efter ett fallet försök finns en IMMUTABEL artefakt adresserad
                                   per (run_id, task_id, attempt_id), och attempt N+1 får den i
                                   kuvertet — i ett FÄRSKT workspace på SAMMA fastställda
                                   task-base. Den fallna kandidaten blir aldrig nästa försöks
                                   base. Artefakten bär: run_id, task_id, attempt_id, base
                                   identity, candidate identity där sådan finns, failure stage,
                                   failure class, gate/verifier identity, exit code,
                                   timeout/signal, relevant stdout, relevant stderr,
                                   evidence-referenser. Den INNEHÅLLER ALDRIG grindens kod,
                                   dess kontrollnamn eller registret — mätt genom att en grind
                                   vars text bär en unik markörsträng aldrig läcker den till
                                   kuvertet. Ett andra försök skriver en NY artefakt och den
                                   första är byte-identisk efteråt.
NEGATIVE_CONTROLS                  attempt N+1 utan artefakt · artefakt som bär grindens innehåll
                                   eller registret · artefakt som skrivs över · feedback som når
                                   en task den inte gäller · fallen kandidat använd som ny base ·
                                   återanvänt workspace
TRUST_IMPACT                       MEDEL. Feedback får inte göra self-certification/tuning
                                   trivial (målbild §2.2).
STATE_IMPACT                       ny artefaktbutik. Skiva 1:s state rörs inte.
```

**Avgränsning mot S5 (annars två sanningar):** feedbackartefakten är **authority** för vad
buildern får veta. Eventtypen `feedback.created` bär bara en REFERENS till artefakten, aldrig
dess innehåll. Ingen komponent får läsa feedback ur eventströmmen.

### S5 · NY — operations/lifecycle-eventkontrakt

```
ID / NAME                          S5 · controller/handelse
WHY_EXISTING_COMPONENT_CANNOT_     skiva 1:s giltigt_event kräver {task, status} och avvisar allt
OWN_IT                             annat; loopens doktrin förbjuder ett andra schema i samma
                                   logg. Authoritative task state och observability måste vara
                                   skilda butiker.
DEPENDS_ON                         h-001 (form), h-016
ALLOWED_WRITE_CANDIDATE            controller/handelse/**, controller/loop/**,
                                   tests/controller/handelse/**, docs/05-beslutslogg.md
EXIT_TEST_PATH                     verify/bin/h-019-exit
EXIT_CRITERION                     Varje event bär schema_version, event_id, seq, ts, run_id,
                                   task_id, attempt_id, event_type, payload, evidence_refs.
                                   ORDNING läses ur seq — wall-clock ts får aldrig ensam
                                   definiera ordning, och ett prov med bakåtgående klocka ska
                                   inte ändra läsordningen. Strömmen är append-only: en körning
                                   som avbryts lämnar en läsbar logg där varje rad är exakt ett
                                   event. Skiva 1:s state är BYTE-IDENTISKT före och efter en
                                   körning som skriver hundra event — mätt med sha256. Ett okänt
                                   event_type AVVISAS, aldrig tolkas. Strömmen är ALDRIG
                                   scheduler- eller doneness-authority: taskval och attest läser
                                   den inte, mätt genom att en körning med raderad eventström ger
                                   identiska domar.
NEGATIVE_CONTROLS                  event i skiva 1:s logg · halvskriven rad · event_type utanför
                                   schemat accepteras · saknad attempt_id på ett attempt-event ·
                                   ordning läst ur ts · någon komponent som fattar beslut ur
                                   strömmen
TRUST_IMPACT                       LÅG för domen, HÖG för observerbarhet. Events är aldrig bevis.
STATE_IMPACT                       NY logg. Skiva 1:s semantik rörs INTE.
```

Familjer: `run.*` `task.*` `attempt.*` `workspace.*` `agent.*` `candidate.*` `policy.*`
`verification.*` `feedback.*` `evaluation.*` `attestation.*` `promotion.*` `merge.*` `main.*`
`breaker.*` `budget.*`.

### S6 · h-014 — notisen *(spec-rad FINNS, slice 12)*

```
ID / NAME                          S6 · h-014 · notification
WHY_EXISTING_COMPONENT_CANNOT_     Spec-raden finns sedan tidigare. Placeras efter S5 därför att
OWN_IT                             h-014 kräver fyra skilda händelser, men "brytare öppnad" och
                                   "kvot slut" är båda exit 9 från brytaren och skiljs bara av
                                   ett prefix i en orsakssträng som inget kriterium binder.
DEPENDS_ON                         S5 (breaker.opened och budget.exhausted som skilda event_type)
ALLOWED_WRITE_CANDIDATE            controller/notis/**, controller/loop/**,
                                   tests/controller/notis/**, docs/05-beslutslogg.md
EXIT_TEST_PATH                     verify/bin/h-014-exit
EXIT_CRITERION                     Fyra skilda händelser ger fyra notiser; ett felfritt varv ger
                                   INGEN notis. Diskrimineringen sker på event_type ur S5, aldrig
                                   på prosa. Notisen är en OBSERVERANDE BIVERKAN: en notiskanal
                                   som är nere, långsam eller svarar med fel ändrar ALDRIG
                                   controllerns utfall — mätt med en webhook som alltid felar och
                                   en körning vars attestationer och exitkod är identiska med och
                                   utan notis. Webhookens värde förekommer inte i något körningen
                                   lämnar efter sig; configen bär SÖKVÄGEN, aldrig värdet.
NEGATIVE_CONTROLS                  vanligt varv ger notis · brytare öppnad och kvot slut ger samma
                                   notis · webhookvärdet läcker till logg, stdout eller
                                   felmeddelande · notisfel ändrar exitkod eller attestation
TRUST_IMPACT                       LÅG. Får aldrig påverka controller-resultat.
STATE_IMPACT                       ingen. Läser eventströmmen.
```

**Förutsättning:** webhooken ÄR uppsatt (ÄGARHAND-37): `~/.nortropic/slack-webhook`, rättigheter
600, utanför repot, curl svarade ok.

### S7 · NY — verifierad auto-promotion

```
ID / NAME                          S7 · controller/befordran (+ promotion-helper i egen trust-domän)
WHY_EXISTING_COMPONENT_CANNOT_     Kedjan har NOLL remote-yta (mätt: inga träffar på
OWN_IT                             push/remote/origin i någon controller/*/cli). Ingen befintlig
                                   komponent har credential-hantering eller
                                   main-identitetskontroll. Dessutom kräver privilegieseparationen
                                   att credentialen ägs av något buildern inte kan nå — det kan
                                   per definition inte vara en komponent i builderns kedja.
DEPENDS_ON                         S1 (ingen promotion utan taskgrind-verdikt), S2, S3, S5
ALLOWED_WRITE_CANDIDATE            controller/befordran/**, tests/controller/befordran/**,
                                   docs/05-beslutslogg.md
EXIT_TEST_PATH                     verify/bin/h-020-exit
EXIT_CRITERION                     Mot ett LOKALT bare-repo som står för origin — aldrig mot den
                                   verkliga remoten:
                                   (1) En promotion-eligible attestation flyttar main till
                                   kandidatens SHA med en NON-FORCE fast-forward-push, och
                                   remote-refen läses om efteråt och svarar kandidatens SHA.
                                   (2) En attestation UTAN taskgrind-verdikt flyttar ALDRIG main.
                                   (3) Har remote rört sig från A till C sedan verifieringen
                                   AVBRYTS promotion, main står ORÖRD, och kandidaten går till
                                   S8 — den skrivs aldrig över.
                                   (4) Är A inte ancestor till B avbryts promotion.
                                   (5) Promotion utan giltig, bevisad lease-ownership sker aldrig.
                                   (6) Samma promotion körd två gånger ger ett main-läge.
                                   (7) En builder-session som skriver ut HELA sin miljö och hela
                                   sitt filträd läcker aldrig promotion-credentialen.
                                   (8) Ingen force-semantik förekommer i något kodvägsalternativ
                                   — mätt statiskt: noll förekomster av --force,
                                   --force-with-lease och ledande + i refspec i hela komponenten.
NEGATIVE_CONTROLS                  attestation utan grind_id befordras · main rört sig och skrivs
                                   över · force push i någon väg · promotion utan post-check ·
                                   dubbelkörning ger två promotions · promotion efter leaseförlust ·
                                   credential läsbar för buildern · credential i controllerns
                                   miljövariabler · promotion mot annat repo än
                                   Nortropic/nortropic-system
TRUST_IMPACT                       HÖGST i hela planen. Tar bort människan ur merge-gaten.
STATE_IMPACT                       ny promotion-state med intent, utfall och post-check. Måste
                                   vara idempotent och crash-safe (se PROMOTION_PLAN).
```

### S8 · NY — agentisk merge-resolution med full omverifiering

```
ID / NAME                          S8 · controller/konflikt
WHY_EXISTING_COMPONENT_CANNOT_     Ingen komponent känner till konflikter. Utföraren committar i
OWN_IT                             ett workspace på oförändrad base; ingen rebase eller merge
                                   sker någonstans i kedjan.
DEPENDS_ON                         S7
ALLOWED_WRITE_CANDIDATE            controller/konflikt/**, tests/controller/konflikt/**,
                                   docs/05-beslutslogg.md
EXIT_TEST_PATH                     verify/bin/h-021-exit
EXIT_CRITERION                     En verifierad kandidat B som inte kan befordras mot aktuell
                                   main C ger en NY kandidat D där parent(D) = C — en
                                   SINGLE-PARENT commit ovanpå aktuell main, inte en Git
                                   merge-commit. D:s attestation skapas först efter att policy,
                                   global verifierare, taskgrind och krävd evaluator körts om
                                   FRÅN NOLL mot D. B:s attestation, PASS och evaluation
                                   återanvänds aldrig — mätt genom att D:s dom uteblir när D är
                                   saboterad, trots att B var grön. Resolvern får B:s avsedda
                                   delta och konflikten, ALDRIG B:s attestation eller dom.
                                   Promotion av D är en vanlig fast-forward C → D. Rör sig main
                                   igen till E är det ett NYTT bounded reconciliation-attempt,
                                   inte ett fel. Resolution har egen bounded budget (antal försök
                                   och väggtid); nås taket stannar körningen med orsak och tasken
                                   förblir claimed.
NEGATIVE_CONTROLS                  D ärver B:s attestation eller evaluation · D är en merge-commit
                                   med två föräldrar · parent(D) ≠ aktuell main · omverifiering
                                   hoppas över · resolution utan budget · konflikt löst utan
                                   evidence · main som rör sig igen behandlas inte som nytt
                                   attempt · force i resolutionsvägen
TRUST_IMPACT                       HÖG. B:s PASS får aldrig ärvas av D (målbild §2.5).
STATE_IMPACT                       D är en ny kandidatidentitet med egen attestation.
```

### S9 · NY — trust-transition med supervisor och bootstrap

```
ID / NAME                          S9 · controller/overvakare
WHY_EXISTING_COMPONENT_CANNOT_     Ingen komponent kan avsluta sig själv rent och verifiera sin
OWN_IT                             egen efterträdare — det är per definition en roll utanför
                                   controllern.
DEPENDS_ON                         S7
ALLOWED_WRITE_CANDIDATE            controller/overvakare/**, tests/controller/overvakare/**,
                                   docs/05-beslutslogg.md
EXIT_TEST_PATH                     verify/bin/h-022-exit
EXIT_CRITERION                     Efter promotion av en trust-critical ändring avslutas den
                                   gamla controllern RENT, supervisorn bootstrap-verifierar den
                                   nya authoritative main, och först därefter startas en ny
                                   controller-identitet som återupptar backloggen. Ingen process
                                   överlever promotion och fortsätter döma — mätt med en
                                   kandidatversion som bär en unik markörsträng: markören får
                                   inte förekomma i något som kördes före promotion, och den
                                   gamla processens pid får inte leva efter transitionen. Den nya
                                   controllern dömer ingenting före bootstrap är grön. Det finns
                                   exakt EN trusted authority åt gången — aldrig två.
NEGATIVE_CONTROLS                  hot-reload utan omstart · ny controller dömer före bootstrap ·
                                   två trust-authorities samtidigt · bootstrap som inte verifierar
                                   nya main · gammal process som lever vidare
AVGRÄNSNING MOT G20                G20 (S1) svarar "vem dömer kandidaten?". S9 svarar "hur blir
                                   den promoverade versionen nästa trusted runtime?". S9 får inte
                                   duplicera G20 och G20 får inte skjutas hit.
TRUST_IMPACT                       HÖG. Utan detta kan systemet certifiera sin egen födelse.
STATE_IMPACT                       controller-identitet blir explicit och versionerad.
```

### S10 · NY — Markdown-intake och canonical Task IR

```
ID / NAME                          S10 · controller/intag
WHY_EXISTING_COMPONENT_CANNOT_     Ingen komponent läser Markdown eller äger provenance. Men
OWN_IT                             RUNTIME-formatet finns redan: `spec` är ett sökvägsfält och
                                   loopen läser aldrig tasklistan själv (bevisat — premiären
                                   körde mot config/premiar-backlog.json). Intake PRODUCERAR
                                   dagens format utvidgat i stället för att ersätta det.
DEPENDS_ON                         S5 (tillstånd som event), h-007 (allowed_write-formen)
ALLOWED_WRITE_CANDIDATE            controller/intag/**, tests/controller/intag/**,
                                   docs/05-beslutslogg.md
EXIT_TEST_PATH                     verify/bin/h-023-exit
EXIT_CRITERION                     En Markdown-fil med två arbetsmål ger två tasks i canonical IR,
                                   var och en spårbar till källans sha256 och sektion via
                                   provenance. Källan sparas som en IMMUTABEL snapshot. En task
                                   som inte kan göras tillräckligt verifierbar hamnar i
                                   NEEDS_SPEC med BUILDER_STARTS = 0 — mätt genom att ingen
                                   session startar och inget workspace skapas. Den genererade
                                   IR-filen kan matas till loopen som `spec` utan att någon
                                   befintlig komponent ändras.
NEGATIVE_CONTROLS                  task utan verifieringskontrakt når builder · provenance saknas
                                   eller pekar fel · NEEDS_SPEC startar ändå en session ·
                                   genererad JSON som inte går att spåra till källans sha256 ·
                                   källsnapshot som muteras · planner som hittar på svaga
                                   acceptance criteria och ändå går READY
TRUST_IMPACT                       MEDEL. Intake får aldrig göra en task verifierbar på pappret.
STATE_IMPACT                       nya tillstånd RAW..DONE i intake-butiken, inte i skiva 1:s state.
```

### S11 · NY — verifier author + challenger

```
ID / NAME                          S11 · controller/grindsmed
WHY_EXISTING_COMPONENT_CANNOT_     FRYSNINGEN finns redan (registret binder path + sha256,
OWN_IT                             hash-kontroll före start, sakra_sokvag vägrar symlänk) och
                                   återanvänds. Det som saknas är ROLLERNA som författar och
                                   angriper grinden — och de måste ligga i en annan trust-domän
                                   än buildern, vilket ingen befintlig komponent gör.
DEPENDS_ON                         S10, S1
ALLOWED_WRITE_CANDIDATE            controller/grindsmed/**, tests/controller/grindsmed/**,
                                   docs/05-beslutslogg.md
                                   (verify/** ligger UTANFÖR — grindar registreras av ägarhand)
EXIT_TEST_PATH                     verify/bin/h-024-exit
EXIT_CRITERION                     För en task utan människoskrivet prov produceras en grind som
                                   FRYSES i registret med path + sha256 INNAN buildern startar.
                                   Challengern fäller en medvetet svag grind — mätt med en grind
                                   som alltid säger JA, och challengern måste avvisa den. Author
                                   och builder körs i skilda sessioner/trust-domäner, mätt genom
                                   att builderns session-id aldrig sammanfaller med authorns.
                                   Kan kontraktet inte göras tillräckligt starkt: NEEDS_SPEC med
                                   BUILDER_STARTS = 0.
NEGATIVE_CONTROLS                  author och builder i samma session · challenger som inte fäller
                                   en medvetet svag grind · grind som fryses utan att ha prövats
                                   åt båda hållen · grind som ändras efter frysning · builder som
                                   når grindens innehåll
TRUST_IMPACT                       HÖG. Author och builder får inte vara samma trust-domän.
STATE_IMPACT                       registerposter per task; registret växer från 2 till ~18+.
```

### S12 · NY — independent evaluator, provider-neutral

```
ID / NAME                          S12 · controller/bedomare
WHY_EXISTING_COMPONENT_CANNOT_     Ingen komponent anropar en modell för bedömning, och
OWN_IT                             evaluatorn måste vara utbytbar mellan leverantörer utan att
                                   någon dom flyttar — det kräver en egen abstraktion.
DEPENDS_ON                         S4 (findings blir feedback), S5
ALLOWED_WRITE_CANDIDATE            controller/bedomare/**, tests/controller/bedomare/**,
                                   docs/05-beslutslogg.md
EXIT_TEST_PATH                     verify/bin/h-025-exit
EXIT_CRITERION                     Evaluatorn körs FÖRST när hårda grindar är gröna; en röd grind
                                   går aldrig vidare. Ett finding blir en feedbackartefakt (S4)
                                   och tvingar fram en NY kandidat som verifieras från noll. En
                                   evaluator som säger JA på en kandidat med röd grind ändrar
                                   ingenting — attestationen uteblir ändå, mätt. Riskklassen
                                   styr: LOW = hårda grindar · NORMAL = + fresh evaluator ·
                                   HIGH/DISPUTED = + bounded adversarial cross-model review.
                                   Rundor och kostnad har tak i configen; en körning som når taket
                                   stannar med orsak. Evaluatorn får kandidatens diff, task
                                   contract och evidence-referenser — ALDRIG grindens kod eller
                                   registret.
NEGATIVE_CONTROLS                  evaluatorns JA attesterar ensamt · finding som inte ger
                                   omverifiering · obundet antal rundor · kostnad utan tak ·
                                   evaluator körd före hårda grindar · evaluator som ser grindens
                                   implementation · konsensus behandlad som PASS
TRUST_IMPACT                       LÅG för domen (aldrig root of trust), MEDEL för kostnad.
STATE_IMPACT                       evaluation-resultat blir del av promotion-eligibility där
                                   riskpolicyn kräver evaluator.
```

### S13 · NY — smal read/command-yta

```
ID / NAME                          S13 · controller/lucka
WHY_EXISTING_COMPONENT_CANNOT_     Ingen läsyta finns; drift.md §3 föreskriver att människan
OWN_IT                             tittar i katalogerna. Kommandoytan är dessutom en ny
                                   angreppsyta som måste vara isolerad från kedjan.
DEPENDS_ON                         S5
ALLOWED_WRITE_CANDIDATE            controller/lucka/**, tests/controller/lucka/**,
                                   docs/05-beslutslogg.md
EXIT_TEST_PATH                     verify/bin/h-026-exit
EXIT_CRITERION                     De fem verben fungerar med TYPAD payload. Ett sjätte verb
                                   avvisas. En payload som bär en shell-sträng exekveras aldrig —
                                   mätt med en payload vars innehåll skulle ha skapat en kanariefil
                                   om den tolkats. Läsytan svarar ur eventströmmen och kan inte
                                   skriva. Controllerns lokala state förblir authority: en
                                   projection som gått isär ändrar ingen dom. Ytan är nere →
                                   controllern kör vidare oförändrat, mätt med identiska
                                   attestationer och exitkod.
NEGATIVE_CONTROLS                  kommando utanför de fem verben accepteras · shell-sträng
                                   exekveras · godtycklig filredigering · generisk Git-yta ·
                                   projection behandlas som authority · dashboardfel som stoppar
                                   eller ändrar controllern · ytan som själv promoverar
TRUST_IMPACT                       HÖG om fel byggd. Verkstadsgolvet får aldrig certifiera eller
                                   promovera Git.
STATE_IMPACT                       projection, aldrig root of truth.
```

---

## DEPENDENCY_GRAPH

```
h-016 (BYGGD)
  └─ S1 h-017 taskgrind + G20 ──┬─ S4 feedback ────────── S12 evaluator
                                │
  S3 h-004 heartbeat ───────────┼─ S2 h-015 återtag ──┐
                                │                     ├─ S7 promotion ─┬─ S8 merge-resolver
  S5 eventkontrakt ─────────────┴─────────────────────┘                └─ S9 trust-transition
       ├─ S6 h-014 notis
       ├─ S13 read/command-yta
       └─ S10 intake ─ S11 verifier author+challenger
```

Kritisk väg till obevakad drift: **S1 → S3 → S2 → S5 → S7**. Utan taskgrinden betyder en
attestation inte att tasken är löst; utan heartbeat är exklusiviteten inte sann över ett varv;
utan återtaget kräver varje avbrott en människa; utan eventkontraktet finns ingen observerbarhet
att stanna på; utan promotion är människan kvar i merge-gaten.

---

## EVENT_SCHEMA_PLAN

Egen butik, egen version, aldrig i skiva 1:s logg.

```json
{
  "schema_version": "1.0.0",
  "event_id": "<unik i strömmen>",
  "seq": 1,
  "ts": "2026-08-09T14:47:03.121Z",
  "run_id": "premiar-1",
  "task_id": "p-001",
  "attempt_id": "premiar-1-p-001-1",
  "event_type": "attempt.started",
  "payload": {},
  "evidence_refs": []
}
```

`seq` är ordningsfältet och är **auktoritativt**; `ts` är wall-clock för människan och får aldrig
ensam definiera ordning — klockor hoppar. `evidence_refs` bär referenser (sökvägar eller SHA),
aldrig innehåll.

Familjer: `run.*` `task.*` `attempt.*` `workspace.*` `agent.*` `candidate.*` `policy.*`
`verification.*` `feedback.*` `evaluation.*` `attestation.*` `promotion.*` `merge.*` `main.*`
`breaker.*` `budget.*`.

**Bindande:**
- Operationsströmmen är **aldrig** scheduler- eller doneness-authority. Doneness kommer ur
  attest, ordning ur taskval. En körning med raderad eventström ska ge identiska domar.
- `breaker.opened` och `budget.exhausted` är skilda event_type — det löser h-014:s diskriminator.
- `promotion.failed` skiljs från `verification.failed`.
- UI:t ska aldrig tolka fri terminalprosa. Varje tillstånd en människa behöver se finns som
  event_type.

---

## COMMAND_SCHEMA_PLAN

### Läsytan

Minst dessa vyer, alla projektioner ur eventströmmen och evidence-butikerna:

```
runs · backlog · raw sources · compiled tasks · current task · attempts · phase · events ·
candidate identities · verification · evaluation · breaker/budget · promotion ·
merge resolution · current main · completed tasks · evidence
```

Saknas data visas `—`. Ingen fejkad aktivitet, ingen fejkad progress.

### Kommandoytan — fem verb, ingenting mer

```
intake.submit               { source_ref, source_sha256 }
run.start                   { config_ref }
run.pause_at_safe_boundary  { run_id }
run.resume                  { run_id }
inspect                     { task_id | run_id }
```

**Bindande:** ingen generisk shell-yta, ingen generisk Git-yta, ingen force merge, ingen
godtycklig filredigering. Ett kommando är ett namn ur listan plus en typad payload — aldrig en
sträng som blir ett kommando. Controllerns lokala state är authority; transporten är projection.
Utgående-först från Macen föredras framför inkommande port. Verkstadsgolvet får aldrig bli
komponenten som självt certifierar eller promoverar Git.

`run.pause_at_safe_boundary` definierar säker gräns som **mellan tasks, aldrig mitt i ett
försök** — annars lämnas workspace och lease i obestämt läge.

---

## PROMOTION_PLAN

```
AUTHORITATIVE_MAIN            = origin/main hos Nortropic/nortropic-system
LOCAL_MAIN_ROLE               = arbetskopia/cache. ALDRIG promotion-authority.
ORIGIN_MAIN_ROLE              = sanning. Läses maskinellt och verifieras vid varje promotion.
PROMOTION_IDENTITY            = DEDICATED_GITHUB_APP_INSTALLATION
PROMOTION_APP                 = Nortropic Promoter
PROMOTION_OWNER               = Nortropic organization
PROMOTION_REPOSITORY_SCOPE    = Nortropic/nortropic-system only
PROMOTION_PERMISSIONS         = Metadata: Read · Contents: Read & Write   (inget mer)
PROMOTION_MODE                = FAST_FORWARD_ONLY, NON-FORCE
FORCE_SEMANTICS_ALLOWED       = NEJ, i ingen väg
```

### Privilegieseparation — mätt hinder, konkret lösning

`controller/launch/cli` rad 56–72 filtrerar worker-env med en **denylist** på tre prefix
(`GH_`, `GITHUB_`, `SLACK_`). En credential vars namn ligger utanför dem når buildern. **Planen
förlitar sig därför inte på denylistan.**

```
GitHub App private key    ligger i en fil utanför repot med rättigheter 600, ägd av
                          promotion-domänen. Aldrig i någon miljövariabel. Aldrig i configen.
                          Configen bär SÖKVÄGEN. (Samma form som webhooken, ÄGARHAND-37.)
Installation token        kortlivad, hämtas vid promotion, hålls i processminnet, skrivs
                          aldrig till disk eller logg.
Builder                   får ALDRIG: private key, installation token, promotion credential.
                          Mätbart: en session som skriver ut hela sin miljö och hela sitt
                          filträd läcker ingenting.
Promotion-helper          egen process/trust-domän. Kan promovera, kan inte bygga, kan inte
                          döma, kan inte läsas av buildern.
```

### PR-BYPASS — mot mätt GitHub-läge

`main` kräver PR och `enforce admins` är PÅ. Målkonfigurationen:

```
Nortropic Promoter GitHub App → bypass_pull_request_allowances.apps
```

(eller dagens motsvarande GitHub-mekanism om API:t ändrats vid implementationstillfället).

**Bypassen gäller ENDAST pull-request-kravet.** Ingen generell bypass över branch-skydd.
Mänsklig utveckling fortsätter oförändrad: `branch → PR → main`.

**Mekaniskt förbjudet för promotern även om Contents:Write tekniskt tillåter det:**
force push · radering av main · history overwrite. GitHubs egna spärrar (force pushes DISABLED,
deletions DISABLED) är en **andra** spärr bakom planens egen regel, aldrig planens enda skydd.

### PROMOTION_OPERATION — elva steg, ingen force

Antag `expected origin/main = A`, `candidate = B`.

```
 1. hämta faktisk origin/main
 2. kräv  actual == A                       annars → CONCURRENT MAIN MOVEMENT
 3. kräv  A är ancestor till B              annars → avbryt, main orörd
 4. kräv  full trusted verification         (policy + global + taskgrind [+ evaluator])
 5. kräv  promotion-eligible attestation
 6. kräv  giltig, bevisad ownership/lease
 7. NON-FORCE push B → main                 (vanlig fast-forward)
 8. läs origin/main igen
 9. kräv  origin/main == B
10. skriv promotion evidence/state
11. FÖRST därefter får nästa task börja
```

**Förbjudet i normal väg och i konfliktväg:** `--force` · `--force-with-lease` · ledande `+` i
refspec · force ref update · history overwrite. Revision 1:s förslag om `--force-with-lease`
är **struket** — Nortropics invariant är striktare.

### PROMOTION-ELIGIBILITY

En gammal attestation utan taskgrind-verdikt får finnas för bakåtkompatibilitet men är
`NOT_PROMOTION_ELIGIBLE`. Full autonom promotion kräver att kandidatidentiteten är bunden till:

```
policy PASS · global verifier PASS · trusted task gate PASS ·
task gate identity · task gate SHA/content identity · attestation identity
[+ evaluator-resultat där riskpolicyn kräver evaluator]
```

### CONCURRENT MAIN MOVEMENT

Är faktisk remote `C` i stället för förväntad `A`, får Nortropic **inte** skriva över C, inte
force-pusha B, och inte anta att B fortfarande är korrekt. I stället: `B + C → MERGE /
RECONCILIATION LOOP` (S8).

### Crashpunkter och semantik

| # | Crashpunkt | Rekonstruktion ur auktoritativa identiteter | Semantik |
|---|---|---|---|
| A | kandidat verifierad, före attestation | attestbutiken saknar posten; kandidat-SHA finns i git | gör om verifieringen — attestation utan bevis skrivs aldrig |
| B | attestation skriven, före promotion | attestation finns, `ls-remote` visar A | promotion är idempotent: kör om från steg 1 |
| C | promotion-intent skriven, före push | intent finns, `ls-remote` visar A | pushen hände aldrig — kör om från steg 1 |
| D | push lyckades, processen dog | `ls-remote` visar B, lokalt state saknar utfall | remote är sanning: skriv utfallet, kör post-check, fortsätt |
| E | origin/main flyttad, lokalt state ej uppdaterat | `ls-remote` visar B | uppdatera state ur remote |
| F | origin/main verifierad, completion-event ej skrivet | allt konsistent utom eventet | skriv eventet; det är observability, inte dom |
| G | task klar, nästa claim ej startad | allt konsistent | fortsätt drain |

**Ingen crashpunkt får skapa:** false PASS · false promotion · duplicate promotion · wrong next
base · lost remote movement.

**Fail-closed:** kan promotion inte avgöras ur remote — nätfel, autentiseringsfel, tvetydigt
state — stannar körningen med orsak. Den gissar aldrig. Recovery är idempotent där det är
möjligt, annars fail-closed.

---

## MERGE_RESOLUTION_PLAN

```
verifierad kandidat B (attesterad, promotion-eligible)
+ aktuell main C (≠ B:s förväntade gamla main A)
→ isolerat resolutionsworkspace baserat på C
→ resolver-agent får B:s AVSEDDA DELTA och konflikten
   — ALDRIG B:s attestation, PASS eller evaluation
→ NY kandidat D med parent(D) = C          ← single-parent, ingen merge-commit
→ FULL VERIFIERING FRÅN NOLL:
     policy → global verifierare → trusted task gate → krävd evaluator
→ NY attestation för D
→ promotion-eligibility prövas om från början
→ normal NON-FORCE fast-forward C → D
```

**Krav, alla mätbara:**

- D är en **ny kandidatidentitet** med eget SHA.
- `parent(D) = C` — en ny single-parent commit ovanpå aktuell main, **inte** en Git merge-commit.
  Detta är också förberedelsen för framtida `required_linear_history=YES`.
- B:s gamla PASS, attestation och evaluation återanvänds **aldrig** som D:s dom.
- Resolution har egen bounded budget (antal försök och väggtid).
- Rör sig main igen (`D` mot `E`) blir det ett **nytt bounded reconciliation-attempt**, inte ett fel.
- Ingen force i någon väg.
- Ingen dold konfliktlösning utanför evidence-spåret.

**Fail-closed:** kan konflikten inte lösas inom budget stannar körningen med orsak. Tasken
förblir claimed.

### LINEAR_HISTORY — framtida steg, ändras INTE nu

Mätt i dag: `required_linear_history = NO`. Ägarens önskade riktning är `YES`, men
GitHub-inställningen ändras **inte** i denna plan. Aktivering är ett senare explicit policy-steg
som först ska prövas mot (1) promotionmodellen, (2) det mänskliga PR-flödet, (3) merge-resolvern.
Att D är single-parent ovanpå C gör att modellen redan är förenlig med kravet när det slås på.

---

## TRUST_TRANSITION_PLAN

```
task ändrar trust-critical control-plane-kod
→ döms av FÖRE-versionen av kontrollplanet         ← G20, löst i S1
→ promotion                                        ← S7
→ gamla processen avslutas RENT (inget hot-reload)
→ supervisor bootstrap-verifierar NYA authoritative main
→ ny trusted controller-identitet etableras
→ backloggen återupptas                            ← S9
```

**Trust-critical yta (förslag, låses av ägarhand):** `controller/**`, `verify/**`, `specs/**`,
`scripts/check-invariants.mjs`, `config/managed-settings.json`, konstitution och regelverk.

**Bindande:** den nya domaren får aldrig döma sin egen födelse. Bootstrap-verifieringen körs av
supervisorn, inte av den nya controllern. Det finns exakt en trusted authority åt gången.

**Avgränsning:** G20 löser *vem dömer kandidaten* och ligger i S1. S9 löser *hur den promoverade
versionen blir nästa trusted runtime*. De duplicerar inte varandra, och ingen av dem får
användas som ursäkt för att skjuta den andra.

---

## MARKDOWN_INTAKE_PLAN

```
.md / inklistrad text
→ immutable source snapshot + sha256
→ planner
→ canonical Task IR (JSON, GENERERAD artefakt)
→ validering
→ verifieringsförberedelse (S11)
→ READY | NEEDS_SPEC
```

Tillstånd: `RAW PLANNING NEEDS_SPEC READY QUEUED WORKING VERIFYING REVIEWING MERGING DONE STOPPED`.
`NEEDS_SPEC` är ett legitimt slututfall med `BUILDER_STARTS = 0`.

**Task IR — utgår från dagens nio fält och utvidgar:**

```json
{
  "task_id": "...",
  "source_id": "...", "source_sha256": "...", "source_locator": "...",
  "goal": "...", "summary": "...",
  "dependencies": ["..."],
  "allowed_write": ["..."], "denied_write": ["..."],
  "candidate_requirements": { "omfang": {} },
  "acceptance_criteria": ["..."],
  "risk_class": "low|normal|high",
  "verification_contract": { "grind_id": "...", "grind_sha256": "...", "exit_test": "verify/bin/..." },
  "provenance": { "source_id": "...", "section": "...", "snapshot_sha256": "..." },
  "slice": 0, "docs_impact": ["..."], "depends_on": ["..."]
}
```

**Återanvändning är mätt möjlig:** `spec` är ett sökvägsfält och loopen läser aldrig tasklistan
själv — premiären körde mot `config/premiar-backlog.json`. En genererad IR-fil kan matas in utan
att någon komponent ändras, så länge de nio befintliga fälten finns.

**Bindande:** Markdown förblir människans primära arbetsyta. JSON/IR är genererad
runtimeartefakt. Originalkällan ska alltid vara spårbar från en genererad task.

---

## VERIFIER_PREPARATION_PLAN

```
Planner → Task Contract → Verifier Author → Verifier Challenger → Verifier Freeze → Builder
```

**Frysningen finns redan:** registret binder id → path + sha256, hash-kontrollen ligger före
start, `sakra_sokvag` vägrar symlänk och väg ut ur repot. Grinden läggs i `verify/**`, som ligger
i sandboxens denyWrite — buildern kan inte skriva där ens om den ville.

**Rollseparation:** Author och Builder får inte vara samma trust-domän/session. Challengern ska
försöka FALSIFIERA grinden och måste kunna fälla en medvetet svag verifierare.

**Metodregeln som gäller:** *för varje viktig kontroll — vilken konkret felaktig implementation
ska den fälla?* Positiva ankare krävs; en frånvaromätning utan ankare uppfylls av en kedja som
alltid faller.

**Lärdomar ur detta repo som ska in i författandet:** en grind är inte verifierad förrän den
körts i den miljö som ska grinda (`TMPDIR`-snedstrecket, ÄGARHAND-39 — samma commit gav 25/0 hos
granskaren och 24/1 hos ägaren) · en fix ska prövas mot en FAMILJ legitima varianter, inte mot en
enda referens (ÄGARHAND-38) · ett prov som mäter utfall måste göra vägberoende led till utfall
(ÄGARHAND-27).

Kan kontraktet inte göras tillräckligt starkt: `NEEDS_SPEC`, `BUILDER_STARTS = 0`.

---

## EVALUATOR_PLAN

```
LOW              hard gates
NORMAL           hard gates + fresh evaluator
HIGH / DISPUTED  hard gates + bounded adversarial cross-model review
```

**När:** efter taskgrinden, aldrig före. En röd grind går aldrig vidare till evaluator.
**Vad den får:** kandidatens diff, task contract och evidence-referenser — aldrig grindens kod
eller registret.
**Findings:** blir strukturerad feedback (S4) och kräver en NY kandidat som verifieras från noll.
**Tak:** max antal rundor och en kostnadsbudget, båda i config; nås taket stannar körningen.
**Provider-neutralitet:** Claude↔Codex får vara reviewer, challenger, konkurrerande evaluator
eller bounded debate — men aldrig sanningskälla. Deterministiska grindar är root of trust.
**Bindande:** LLM-konsensus är aldrig PASS. Evaluatorns JA attesterar aldrig ensamt; dess NEJ kan
stoppa en attestation.

---

## TEST_MATRIX

Varje slice följer husets form: baslinje utan komponent (rött av rätt skäl) → ärlig referens som
kastas före commit → lögnstubbar med EN lögn var och förutsagd fällningskarta skriven FÖRE
körning → hela batteriet → **körning i ägarterminalen före merge**.

| Slice | Positivt ankare | Skarpaste negativa kontroll |
|---|---|---|
| S1 h-017 + G20 | kandidat grön på båda domarna attesteras med grind_id | **trust-critical kandidat vars komponent är saboterad att alltid säga JA attesteras ändå aldrig** |
| S2 h-015 | avbruten körning återupptas, attesterat körs inte om | recovery som gissar när state är tvetydigt |
| S3 heartbeat | varv på 10–20 min behåller sin lease | död process behåller resursen för evigt |
| S4 feedback | attempt 2 får artefakten, färskt ws, samma base | artefakt som bär grindens markörsträng |
| S5 events | hundra event skrivna, skiva 1:s state byte-identiskt | körning med raderad eventström ger annan dom |
| S6 h-014 | fyra händelser ger fyra notiser | trasig webhook ändrar exitkod eller attestation |
| S7 promotion | eligible attestation ger fast-forward, remote svarar B | attestation utan taskgrind-verdikt befordras · credential i builderns env |
| S8 resolver | D single-parent på C, verifierad från noll | D ärver B:s attestation · D är merge-commit |
| S9 transition | gamla processen dör, bootstrap grön, ny identitet | ny controller dömer före bootstrap |
| S10 intake | md → IR → READY, provenance spårbar | planner ger svaga kriterier och går ändå READY |
| S11 author | challenger fäller medvetet svag grind | author och builder i samma session |
| S12 evaluator | finding → ny kandidat → full omverifiering | evaluatorns JA attesterar ensamt |
| S13 yta | de fem verben fungerar | shell-sträng i payload exekveras · nere ytan stoppar controllern |

---

## MIGRATION_ORDER

```
 1. S1  h-017 taskgrind + G20         (A — G20 är BLOCKERANDE här)
 2. S3  h-004 heartbeat               (utvidgning; före allt obevakat)
 3. S2  h-015 återtag                 (B — recovery före obevakad autonomi)
 4. S4  strukturerad feedback         (C)
 5. S5  eventkontrakt                 (D — före UI-integration)
 6. S6  h-014 notis                   (observerande biverkan)
 7. S7  verifierad auto-promotion     (E)
 8. S8  merge-resolution              (F)
 9. S9  trust-transition              (G)
10. S10 Markdown-intake               (H)
11. S11 verifier author + challenger  (I)
12. S12 evaluator                     (J)
13. S13 read/command-yta              (K)
14.     empirisk obevakad körning     (L)
```

**Två placeringar som avviker från målfilens A–L och därför måste motiveras:**

1. **S3 (heartbeat) före S2 (återtag).** Återtaget måste veta vad en giltig ownership är för att
   kunna avgöra om en lease får tas. Med TTL 180 s mot varv på 10–20 min skulle ett återtag byggt
   före heartbeaten koda in dagens trasiga antagande. Utvidgningen är dessutom liten och rör en
   redan byggd komponent.
2. **S6 (h-014) efter S5 (eventkontraktet).** Byggplan §7 säger i dag *14 → 15 → 12 → 13*. h-014
   kräver fyra skilda händelser, men *brytare öppnad* och *kvot slut* är båda exit 9 och skiljs
   bara av ett prefix i en orsakssträng som inget kriterium binder. Byggd före S5 måste notisen
   parsa prosa; byggd efter blir de skilda `event_type`. Byggplanens §7 bör rättas i samma
   ägarhandspass som S5:s spec-rad, inte här.

**Ägarens prerequisites som inte är slices** (görs utanför loopen, före S7 byggs):
skapa GitHub App *Nortropic Promoter* med Metadata:Read + Contents:Read&Write, scope enbart
`Nortropic/nortropic-system` · lägg appen i `bypass_pull_request_allowances.apps` · granska
GitHub-skydd och ruleset-konfiguration på nytt när appen finns (ruleset `id=20553421` är redan
läst och träffar ingen ref, men konfigurationen ändras av att appen tillkommer).

---

## ROLLBACK/RECOVERY

**Per slice:** varje slice är en egen gren `nortropic/loop-<id>` och en egen PR. Rullas tillbaka
med `git revert` på main. Ingen slice får lämna systemet i ett läge där en påbörjad körning inte
kan avslutas.

**Promotion (S7) är den enda operationen som flyttar authoritative main.** Därför: fast-forward
med kontrollerad förväntad gammal SHA, post-check mot remote, fail-closed vid varje oklarhet. En
felaktig promotion rullas tillbaka med en **NY commit** som återställer trädet — aldrig med force
push och aldrig med history overwrite. Det gäller även om GitHub-credentialen tekniskt tillåter
det.

**Öppen brytare:** i dag finns inget reset-verb; en människa raderar tillståndsfilen (drift.md
§6). S2 ska äga det.

**Oreferade kandidater:** kandidater är commits utan gren och `git gc` når dem efter
grace-perioden. S7 löser det för den lyckade vägen (promotion skapar en ref); för fallna
kandidater kvarstår problemet och registreras under OVERIFIERAT.

---

## RISKS

1. **Auto-promotion tar bort människan ur merge-gaten.** Det är målbildens uttryckliga beslut,
   men den enda ändring i planen som inte går att ångra tyst. S7 får inte byggas före S1 — en
   attestation utan taskgrind-verdikt är inte promotion-eligible, och utan S1 finns inget verdikt.
2. **Promotionens sprängradie är hela repot, inte bara kontrollplanet.** `origin/main` bär också
   `agents/`, `workflows/` och `skills/` — kundfabriken. Det som håller kundflödet utanför är att
   `controller/policy/cli` avvisar varje diff utanför taskens `allowed_write` innan kandidaten ens
   föreslås, och att §A prövas först av alla. Mätt: skrivytan är en strikt VITLISTA
   (`allowed_write ∪ docs_impact`, policy/cli rad 172–178) och §A ligger som kontroll 1 (rad
   164–170). **Följd: policyn är en promotionsförutsättning, inte bara en kandidatkontroll.**
   Försvagas policyn försvagas kundflödets skydd i samma andetag — och just den filen ligger i den
   trust-critical ytan.
3. **PR-bypassen är en permanent försvagning av ett skydd som i dag gäller alla.** Den är
   avgränsad till ett verb och en app, men den finns kvar mellan körningar. Om appens installation
   någonsin får fler permissions växer ytan tyst.
4. **Credentialen är den nya kronjuvelen.** `launch/cli`:s env-filter är en denylist på tre
   prefix; den skyddar inte en credential med ett annat namn. Planens svar är att credentialen
   aldrig ligger i miljön alls — men det kräver disciplin i varje senare slice som rör
   promotion-domänen.
5. **Registret växer från 2 till ~18+ poster**, och de nya är just de filer ägarhand skärper
   oftast. Varje skärpning kräver en SHA-uppdatering. Utan en rutin blir det en underhållsbörda
   som ingen äger och som fäller körningar vid fel tillfälle.
6. **Trust-transition är svårast att pröva.** Provet måste mäta att den NYA domaren aldrig kördes
   före promotion — en frånvaromätning, och husets erfarenhet är att frånvaromätningar utan
   positivt ankare är de som fuskas förbi.
7. **Evaluatorns kostnad är obunden om taket sätts fel.** En session mättes ta 10–20 minuter; en
   adversariell runda kan mångdubbla det.
8. **Verkstadsgolvets kommandoyta är den största nya angreppsytan.** Fem verb och typade payloads
   är planens svar, men en projection som råkar bli authority är ett tyst fel.
9. **Planen är stor.** Tretton slices, varav nio nya komponenter. Regel 9 gäller varje enskild:
   den som bygger ska fråga om en befintlig komponent kan äga ansvaret innan en ny skapas.
10. **G20 gäller redan vid S1, inte först vid S7.** Så snart taskgrinden kopplas in kör en
    trust-critical task sin dom med sina egna komponenter om regeln inte byggs in direkt.

---

## PLANGRANSKNING

### Runda 1 — före första commit (revision 1)

| # | §15-punkt | Fynd | Åtgärd |
|---|---|---|---|
| 1 | falsifiera mot kod | Planen skrev *"sjutton bash-grindar"*; `verify/bin/` bär sexton `*-exit` plus `_lib.sh`. | Rättat. |
| 2 | self-certification | **G20** — `kmd_run` kör grindfilen ur repot men med `cwd=mal`, och husets grindar adresserar komponenter relativt. Taskgrinden startar kandidatens komponenter. | Nytt gap G20. |
| 3 | dubbla sanningar | Feedbackartefakt och `feedback.*`-event kunde båda läsas som källa. | Avgränsning skriven. |
| 4 | crash gaps | Promotion krävde ingen hållen lease. | Förutsättning tillagd. |
| 5 | kundflödespåverkan | Promotion flyttar den main som bär kundfabriken. | RISKS 2. |
| 6 | testbart exit criterion | Flera slices saknade uttalat kriterium. | Kriterium skrivet för alla. |

### Runda 2 — efter ägarrevisionen (denna revision)

Granskningen kördes om mot faktisk kod efter att ägarbesluten skrivits in.

| # | Falsifieringsfråga | Utfall |
|---|---|---|
| 1 | Kan Builder påverka domaren? | **Nej, med S1.** Kuvertet utelämnar `exit_test` (mätt), `specs/**` är denied_write, registret ligger utanför h-017:s skrivyta, grindfil och `_lib.sh` laddas ur repot via absolut `$0` (mätt). G20 stänger den återstående vägen. |
| 2 | Är G20 faktiskt löst i planens S1? | **Ja — som krav.** G20 står i S1:s EXIT_CRITERION punkt 4 och som negativ kontroll, inte hos S9. Kvar som OVERIFIERAT: att kravet går att uppfylla är inte mätt förrän provet finns. |
| 3 | Kan kandidatens `_lib.sh`, verifier eller register användas? | `_lib.sh` **nej** (mätt: laddas via `$0`). Verifier/register: **ja i dag** — det är precis G20, och därför är S1:s negativa kontroll formulerad så att en saboterad trust-critical komponent ändå inte får ge attestation. |
| 4 | Finns någon force-semantik kvar? | **Nej.** Revision 1:s `--force-with-lease` är struket ur PROMOTION_PLAN, MERGE_RESOLUTION_PLAN och ROLLBACK. S7 bär en statisk negativ kontroll: noll förekomster av `--force`, `--force-with-lease` och ledande `+` i refspec. |
| 5 | Kan remote history skrivas över? | **Nej i planen** (fast-forward-only, ancestor-krav) och **nej på GitHub** (force pushes DISABLED, deletions DISABLED — mätt). Två oberoende spärrar. |
| 6 | Kan en ogrindad attestation promoveras? | **Nej.** `NOT_PROMOTION_ELIGIBLE`, steg 5 i promotionsekvensen, och egen negativ kontroll. |
| 7 | Kan promotion ske efter leaseförlust? | **Nej.** Steg 6 kräver giltig bevisad ownership, S3 är dependency, och det är en negativ kontroll. |
| 8 | Kan credential läcka till Builder? | **Fynd, rättat.** `launch/cli`:s env-filter är en DENYLIST på tre prefix — en credential med annat namn hade nått buildern. Planen kräver nu att credentialen aldrig ligger i miljön alls, utan i fil utanför repot med rättigheter 600, och att provet mäter att en session som dumpar hela sin miljö och sitt filträd inte läcker något. |
| 9 | Kan remote flytta sig mellan check och push? | **Ja — det är oundvikligt**, och därför är pushen non-force fast-forward: flyttar sig main efter steg 2 misslyckas pushen av sig själv i stället för att skriva över. Utfallet blir CONCURRENT MAIN MOVEMENT → S8. Crashpunkt C och D täcker fallet. |
| 10 | Återanvänds gammalt PASS i merge-resolution? | **Nej.** B:s PASS, attestation och evaluation är uttryckligen inte indata till D:s dom, och resolvern får aldrig se dem. |
| 11 | Blir resolved candidate ny identity med rätt parent? | **Ja.** `parent(D) = C`, single-parent, ingen merge-commit — även förberedelsen för framtida linear history. |
| 12 | Körs full verification igen? | **Ja.** policy → global → taskgrind → krävd evaluator, från noll, med egen attestation och ny eligibility-prövning. |
| 13 | Push lyckas men processen dör före lokal state — vad händer? | Crashpunkt **D**: remote är sanning, `ls-remote` visar B, utfallet skrivs och post-check körs om. Nästa task får rätt base eftersom basen läses ur remote, inte ur lokalt state. |
| 14 | Kan nästa task få fel base? | **Nej i planen** — steg 11 släpper inte fram nästa task före post-check är skriven, och recovery läser basen ur auktoritativa identiteter. |
| 15 | Kan nya controllern börja döma före bootstrap? | **Nej.** S9:s kriterium kräver att den gamla processen är död, bootstrap grön och att exakt en trusted authority finns. |
| 16 | Finns dubbla trust authorities? | **Nej i målmodellen.** G20 och S9 är avgränsade mot varandra i TRUST_TRANSITION_PLAN. |
| 17 | Kan Planner ge svaga kriterier och ändå gå READY? | **Fynd, rättat.** Det står nu som uttrycklig negativ kontroll i S10, och S11:s challenger är den mekaniska spärren. |
| 18 | Finns NEEDS_SPEC? | **Ja**, med `BUILDER_STARTS = 0` som mätbart utfall i både S10 och S11. |
| 19 | Kan event projection bli authority? | **Fynd, rättat.** S5 bär nu kravet att en körning med raderad eventström ger identiska domar, plus negativ kontroll mot komponenter som fattar beslut ur strömmen. |
| 20 | Kan dashboardfailure påverka controllern? | **Fynd, rättat.** Både S6 och S13 kräver nu att en nere/trasig yta ger identiska attestationer och exitkod. |
| 21 | Kan promotionmekanismen börja skriva kundrepo? | **Nej.** `PROMOTION_REPOSITORY_SCOPE = Nortropic/nortropic-system only` står i appens installation, i S7:s kriterium och som negativ kontroll. |
| 22 | Är repository scope explicit? | **Ja**, uttryckligen i denna version. |

**Korrigeringar som runda 2 gjorde i planen:** credentialen flyttad ut ur miljön (fynd 8) ·
statisk force-kontroll tillagd i S7 (fynd 4) · eventströmmens icke-auktoritet gjord mätbar
(fynd 19) · notisens och läsytans oskadlighet gjord mätbar (fynd 20) · svaga acceptance criteria
som negativ kontroll i S10 (fynd 17) · S3 heartbeat brutet ut som egen slice och placerat före
S2 med motivering · G20 flyttat från "gap att lösa senare" till blockerande krav i S1:s
kriterium · `--force-with-lease` struket överallt.

---

## OVERIFIERAT

- **Den framtida GitHub-skyddskonfigurationen.** Ruleset `id=20553421` är numera LÄST och står
  under CURRENT_STATE som mätt fakta — det träffar ingen ref och har ingen trust-roll, så det är
  inte längre en öppen post. Det som återstår är att skydds- och ruleset-konfigurationen måste
  granskas om **före S7**, eftersom Nortropic Promoter-konfigurationen ännu inte finns och
  tillkomsten av en bypass-aktör ändrar bilden.
- **Att G20:s krav går att uppfylla.** Kravet är formulerat och mätbart, men ingen har byggt
  provet. Att en trust-critical kandidat med saboterad komponent faktiskt kan stoppas är
  konstruerat, inte mätt.
- **GitHub App-flödet i praktiken.** Appen finns inte ännu. Att
  `bypass_pull_request_allowances.apps` fungerar som avsett med `enforce admins = YES` är läst ur
  dokumentation, inte mätt i detta repo.
- **Kvotsignalens kanal.** Landar den verkliga kvotsignalen på den stdout h-009 kastar vid nonzero
  är `kvot.monster` strukturellt dött. Öppen post sedan ÄGARHAND-33/35.
- **Lease-TTL i praktiken.** Att en andra controller faktiskt tar över efter 180 s är inte klockat,
  bara härlett ur att varv tar 10–20 min.
- **h-009:s kända gränser** (setsid-flykt, obegränsad stdout) står OVERIFIERAT sedan tidigare.
- **`_lib.sh` är inte hash-bunden.** Mätt exponering: en kandidat når den inte. Kvar som
  ägarhandslarm, inte mätt som säkerhetsegenskap.
- **Föräldralösa kandidatcommits** från fallna försök: en per fallet försök, ingen ref når dem.
  Bryter ingen invariant, men `git count-objects -v` växer och ingen städar.
