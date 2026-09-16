# Arbetsordern — verifierad mot grenens HEAD 2026-09-16

**Detta är den enda arbetsorder som gäller.** `SEPARATION-20260910/EFTERARBETE.md` är
sann men **föråldrad**: den skrevs 2026-09-10 vid commit `dae90c8f`, och grenen
`nortropic/platform-integration-20260910` har gått 48 commits sedan dess.

Varje punkt är omprövad mot grenens nuvarande HEAD. Kommandot står under tabellen.

---

## EFTERARBETE.md punkt för punkt — mätt, inte antaget

| # | Bindning enligt listan 09-10 | Läget nu | Verdikt |
|---|---|---|---|
| 1 | `check-invariants.mjs` läser `workflows/`, `agents/`, `skills/` → 0 PASS / 8 FAIL | Enda träffen är en **kommentar på rad 102**. Filen är omskriven till PINV-001–006 | **ÅTGÄRDAD** |
| 2 | Registret bär webbposten `nortropic-verify-suite` | 0 träffar i `register.json` | **ÅTGÄRDAD** |
| 3 | `PRETASK_PATHS`/`PLATFORM_DOCUMENTS` pekar på `docs/07-konstitution.md` m.fl. | `PLATFORM_DOCUMENTS` pekar nu på `AGENTS.md`, `CLAUDE.md`, `README.md` och `docs/loop/**`. Noll `docs/0x-`-referenser | **ÅTGÄRDAD** |
| 4 | `document-authority-exit` DOCUMENTS-lista | `DOCUMENT_AUTHORITY_RIG_ERROR: subject approved document mismatch: AGENTS.md` | **KVARSTÅR** |
| 5 | `specs/tasks.spec.json`: ~79 referenser till beslutsloggen | **72 träffar** | **KVARSTÅR** |
| 6 | `controller/policy/cli` §A-mängd nämner webbfiler | 0 träffar | **ÅTGÄRDAD** |
| 7 | `controller/attest/cli` refererar beslutsloggen ×5 | **5 träffar** | **KVARSTÅR** |
| 8 | `config/managed-settings.json` deny-lista pekar på webbsökvägar | §A-låsen borttagna 2026-09-16 (`LOOP-ÄGARBESLUT-SANDBOX-OPEN`) | **ÅTGÄRDAD** |
| 9 | `check-verifierarregistret.mjs` kräver flyttad `check-vaktankare.mjs` | Filen finns inte på grenen | **UTGÅR** |
| 10 | `.gitignore` vitlistar nu tomma kataloger | 0 vitlistningar för `agents/`, `workflows/`, `skills/`, `packs/`, `backtests/` | **ÅTGÄRDAD** |
| 11 | Autopilotens `SUBSTITUTION_BLOBS` pinnar flyttade dokument | 0 träffar på `"docs/0x-"` | **ÅTGÄRDAD** |

**Åtta åtgärdade, en utgår, tre kvarstår.**

```bash
# Återskapa hela tabellen (grenen måste vara hämtad)
B=origin/nortropic/platform-integration-20260910
git show $B:scripts/check-invariants.mjs   | grep -nE "workflows/|agents/|skills/"      # P1
git show $B:controller/verify/register.json| grep -c "nortropic-verify-suite"           # P2
git show $B:controller/verify/cli          | grep -A8 "^PLATFORM_DOCUMENTS = "          # P3
git show $B:specs/tasks.spec.json          | grep -c "05-beslutslogg"                   # P5
git show $B:controller/policy/cli          | grep -cE "07-konstitution|03-regelverk"    # P6
git show $B:controller/attest/cli          | grep -c "05-beslutslogg"                   # P7
git show $B:scripts/nortropic-codex-autopilot.py | grep -cE '"docs/0[0-9]-[a-z]'        # P11
```

---

## De tre som kvarstår är EN sak

Punkt 4, 5 och 7 — och **alla fem röda eller odömbara grindar** — har samma orsak:

> **Kärnan refererar fem dokument som separationen flyttade till webbförvaltningen.**

| Grind | Mätt utfall | Läser |
|---|---|---|
| `h-007` | exit 1, 14 PASS / 5 FAIL | beslutsloggen (via controllerns docs-krav) |
| `h-035` | exit 2 | `docs/05-beslutslogg.md`, `docs/07-konstitution.md` |
| `h-036` | exit 2, `RIG_ERROR: No such file … 05-beslutslogg.md` | beslutsloggen |
| `h-037` | exit 2, `UNEXPECTED_RED` | fyrfilskontraktet + konstitutionen |
| `h-038` | exit 2, `RIG_ERROR: H036 helper gate identity drift` | kedjad till h-036 (regel 11d) |
| `document-authority` | exit 2, `RIG_ERROR: AGENTS.md` | dokumentmängden |

**`h-035` är inte längre oförklarad.** Den läser `docs/05-beslutslogg.md` och
`docs/07-konstitution.md`; båda saknas på grenen. Samma orsak som h-036 och h-038.

**Punkt 3 visar hur det ska lösas — den är redan gjord för `controller/verify/cli`:**
`PLATFORM_DOCUMENTS` pekar nu på `AGENTS.md`, `CLAUDE.md`, `README.md` och
`docs/loop/**`. Samma mönster återstår för de tre ytorna nedan.

---

## Arbetsordningen

### Steg 1 — plattformens egen beslutslogg

Skapa `docs/loop/beslutslogg.md` som plattformens beslutslogg. Migrera dit de rader ur
`docs/05-beslutslogg.md` som gäller kontrollplanet — inklusive dagens sex ägarbeslut
(`LOOP-ÄGARMANDAT-0909`, `LOOP-REGEL-11-12`, `LOOP-ÄGARBESLUT-SANDBOX-OPEN`,
`LOOP-ÄGARBESLUT-VÄG-A-PRIM`, `LOOP-ÅTERKALLAT-VÄG-A-PRIM`, `INV-*`).

Webbens rader stannar i webbrepots `docs/05-beslutslogg.md`. **Ingen fil kopieras.**

### Steg 2 — peka om de tre ytorna

| Yta | Omfattning | Hand |
|---|---|---|
| `specs/tasks.spec.json` | 72 referenser | **Människohand** — `specs/**` är det |
| `controller/attest/cli` | 5 referenser | Test-first-ändring |
| `verify/bin/document-authority-exit` | DOCUMENTS-listan | Nytt lokalt kontrakt |

### Steg 3 — frys om de fem grindarna, EN gång

`h-007`, `h-035`, `h-036`, `h-037`, `h-038` — mot den nya dokumentauktoriteten, och i
samma drag:

- **Shebangarna:** `h-035`, `h-036`, `h-038`, `h-039` bär
  `#!/opt/homebrew/Cellar/python@3.12/3.12.13_4/…`. Fungerar i dag, dör vid nästa
  `brew upgrade`. En rad per fil: `#!/usr/bin/env python3.12`.
- **`h-037`:** trädpinningen (`"current subject differs outside the exact four-file
  contract"`) ska bli en egenskapspinning enligt **regel 11**.
- **`h-038`:** kedjan till h-036:s exakta identitet bryts enligt **regel 11d**.

> **⚠️ BUDGETEN — läs detta innan du fryser om.** `h-035` har 17 omfrysningar och
> `h-007` ligger på taket 3. Regel 11b hade stoppat steg 3 helt.
>
> **Löst av ägarbeslutet 2026-09-16** (`LOOP-ÄGARBESLUT-11A-OCH-TRE-HYPOTESER`): regel 11a
> mäter **riktning**, inte antal. En omfrysning som TAR BORT en miljöbindning är
> gatereparation och räknas inte. Varje åtgärd i steg 3 tar bort en bindning — shebang,
> trädpinning, referens till flyttad fil — och är därmed tillåten.
>
> **Håll diffen ren.** Blandar du in en ny förpliktelse räknas hela omfrysningen, och då
> spränger `h-007` sin budget. Reparera i egen commit.

**Alla är GATEDEFEKTER (regel 11c).** Samma kandidat körs om; rundan bokförs mot
specifikationen, aldrig mot kandidaten. Det är skälet till att detta inte är runda 77:
de tidigare omfrysningarna gjorde grindarna **mer** exakta, denna gör dem **mindre**
miljöbundna. Regel 11 tillåter det ena och förbjuder det andra.

### Steg 4 — landa grenen

55 commits till `main`. Först då är separationen verklig: `main` bär i dag **246
webbfiler** och ett register som pekar på `workflows/nortropic-verify-suite.js`.

---

## VÄGEN TILL MÅLET — tretton poster, inte sex

> ### ⚠️ RÄTTAT 2026-09-16 efter FYND 33. Här stod "sex poster".
>
> Den siffran byggde på att `h-004`, `h-010`, `h-013` och `h-016` var KLARA. **Premissen
> var falsk.** Grindarna kördes aldrig — de antogs gröna för att grindfilerna FINNS. Körda
> på Macen i ren klon (`HEAD 5b6ed6e`, Darwin arm64):
>
> | Task | Påstått | Mätt |
> |---|---|---|
> | `h-004` | KLAR | **FAIL** — 8 PASS / 7 FAIL · `lease_id`, fencing, renew saknas |
> | `h-010` | KLAR | **PASS** |
> | `h-013` | KLAR | **FAIL** — 8 PASS / 8 FAIL · brytarens fingerprints |
> | `h-016` | KLAR | **FAIL** — 11 PASS / 14 FAIL · attestation sker aldrig |
>
> Därtill är `h-009` (8/3), `h-011` (9/7) och `h-012` (11/8) röda i samma slutning.
> **Sex verkliga grindfel.** Ingen regression — funktionerna byggdes aldrig.

```
GRÖN:     h-010 ✓                            (kört på Macen, ren klon)

RÖDA, sex st — VÄGENS FÖRSTA ARBETE:
          h-004  h-009  h-011  h-012  h-013  h-016

SAKNAS:   h-027 → h-028 → h-029 → h-030      (fyra task, finns inte)
          → h-015 supervisor resume           (grind saknas)
          + verify/bin/autonomous-loop-exit   (mäter KERNEL_COMPLETE)
          + docs/loop/autonomy-kernel-v1-acceptance.md
```

**Första uppgiften är inte `h-027`.** Den är att köra
`artefakter/matning-pa-macen.sh` på `main` och därefter root-orsaka de sex röda.
Full mätning i `docs/loop/drift.md` FYND 33.

### De sex röda har TVÅ rötter, inte sex (FYND 34)

```
h-004 ← h-001 (GRÖN)                      ROT 1 — fristående
h-009 ← h-005, h-006, h-008 (ALLA GRÖNA)  ROT 2 — fristående

h-012 ← h-009
h-011 ← h-004, h-009
h-013 ← h-009, h-012
h-016 ← h-011, h-012, h-013
```

Fyra av sex ligger **nedströms**. Ingen rot beror på något rött.

`h-009` är kuvert- och workspacelagret. Dess egna fel: *"processen kördes i klonroten,
inte i workspacet"*, *"processen hittade inget kuvert"*. Nedströms säger `h-011` K12
*"workern körde någon annanstans eller fick fel kuvert"*, `h-012` K14 *"kuvertet når
sessionen — kod=4"*, och `h-012` K3 visar att kandidaten bär **repots HEAD-filer** i
stället för sessionens. En worker utan workspace och utan kuvert producerar ingen kandidat
— och då kan varken kedjan, brytaren eller attestationen mätas.

`h-004` är den andra roten och något annat: `lease_id`, fencing och renew är inte
implementerade. En funktion att skriva, inte en defekt att laga.

**⚠️ Detta är en hypotes.** Grafen är fakta; symtomlikheten är en svagare signal. Samma
session gissade fel om orsaken till sju röda grindar tre timmar tidigare (FYND 33).
**Ordningen följer därför av provet, inte av tron:** laga `h-009` FÖRST, kör om de fem.
Blir de gröna var det en rot — blir de inte det vet du det efter en fix i stället för sex.

**Arbetsordning inom de sex:** `h-009` → kör om → `h-004` → kör om → det som står kvar.

`h-015` beror på `h-010`, `h-013`, `h-016`, `h-004` och `h-030` — **inte** på `h-031`,
`h-032` eller `h-039`. De tre avslutade hypoteserna låg aldrig på vägen; ingenting i
specen beror på dem utanför gruppen själv.

> ⚠️ **`docs/loop/drift.md` rad 5495 säger** *"No supervisor resume is authorized before
> the entire chain is green"*. **Den raden är upphävd 2026-09-16.** Den är prosa, inte
> ett mekaniskt beroende, och specens graf säger något annat. Hade den fått stå hade den
> blockerat målet permanent — inte av en mekanism, utan av en mening.

`h-014` ligger utanför kedjan och kan byggas parallellt.

---

## Vad som INTE ingår, och vad som kommer sedan

Detta är den ordning som gör grenen mergebar. Den tar **inte** kärnan i mål.

**Och den är inte hela paketet.** Underlaget bär sju dokument med byggbart innehåll
(`07`–`12`), sex med diagnos och metod (`00`, `01`, `02`, `04`, `05`, `06`) och två
routrar. Listan nedan pekar på var och en. Läs `README.md` för vad varje fil gör.

### ⚠️ Tre hypoteser är AVSLUTADE — plocka inte upp dem

`h-039` (30 omfrysningar), `h-032` (120) och `h-031` (147) avslutades **`OVERIFIERAT`**
2026-09-16 enligt regel 11b. Tillsammans 297 omfrysningar utan en enda stängning.

**Fortsätt dem inte.** De ska specificeras om i mindre delar med fasta prov, och det är
arkitektens arbete — inte en runda till på den gamla specen. `OVERIFIERAT` betyder odömt,
inte misslyckat; arbetet är underlag för omspecificeringen.

Bootstrap-kedjan `h-039 → h-038 → h-032 → h-031` som `06-inventering.md` §1 beskriver är
därmed **inte** vägen framåt. Den leder inte heller till supervisor resume — se §2 om
`h-030`.

Efter merge återstår, i den ordningen:

0. **`docs/loop/autonomy-kernel-v1-acceptance.md` — acceptansfilen.** Underlag i
   `07-v1-acceptans.md`. Verifierat: **ingen sådan fil finns**, och termen
   *"Autonomy Kernel"* förekommer noll gånger i repot. Den ska sammanföra befintlig
   auktoritet, inte skapa en konkurrerande kravlista — varje rad pekar på en redan
   beslutad källa. Dess §1 är viktigast: **Autonomy Kernel v1, bootstrap-frisläppning,
   första autonoma start och full-roadmap-avslut är FYRA OLIKA SAKER** och får aldrig
   användas som synonymer.
1. `verify/bin/autonomous-loop-exit` — fryst RED mot `KERNEL_COMPLETE`
   (`00-VAD-NORTROPIC-AR.md`). Specificerad 2026-08-10, aldrig byggd. Utan den finns
   ingen mekanism som kan säga *klart*, och då mäts framsteg i rundor.
2. De tre vakterna (`11-tre-vakter-mot-aterfall.md`), som PINV-kontroller enligt
   ägarbeslutet. Var och en har ett **kört** positivt kontrollprov — reproducera det
   innan du bygger.
2b. **`h-040`, rundtrampsvakten** (`09-task-rundtrampsvakten.md`). Den mekaniserar
   regel 11: omfrysningsbudget, `MÅLFLYTT`, grindkedjeförbudet. Regeln finns nu, men
   **regler utan mekanism fäller ingenting** — det bevisade regel 22 i fem dagar.
   §2:s blockerande placeringsfråga är löst; §4 gren 2 är omskriven till att räkna
   omfrysningar i stället för filstorlek.
2c. **De tre arbetsreglerna** (`08-mekanismer.md`), kopplade till befintligt flöde så
   att de FÄLLER. Bär fyndet som förklarar varför förslag blir reparationsrundor:
   `codex-autopilot-report.schema.json` har **ingen icke-blockerande fyndkanal** —
   enda listan heter `blocking_findings` och roten har `additionalProperties: false`.
   Ett smakförslag har ingenstans att ta vägen utom in i den blockerande listan.
   Ingreppet är additivt, och schemat läses av fyra frysta exitprov — via test-author,
   aldrig av en builder.
3. `h-014` — spec färdig, grind saknas. Pröva `h-013` på Macen först.
4. `h-027`–`h-030`, substitutionskedjan. Finns **inte** som task i något repo.
   `h-015` (supervisor resume) beror mekaniskt på `h-030`.

   **Du får skriva dem.** `specs/**` ligger i §A-mängden och regel 6 gör den till
   människohand — men ägaren gav 2026-09-16 ett namngivet undantag för just dessa fyra
   rader (`LOOP-ÄGARBESLUT-SUB-SPECS`, inskrivet i regel 6). Villkor: raderna **härleds
   ur** `docs/loop/harness-substitution-contract-v1.md`, hela kontraktsflödet i
   `AGENTS.md` gäller, commiten är HÖGRISK-märkt, och **varje ny task deklarerar sin
   omfrysningsbudget enligt 11a**. Befogenheten kommer ur ägarbeslutet, inte ur att
   sandboxen öppnades.
5. `h-015`.

---

## Varför detta dokument finns

`EFTERARBETE.md` är sann för 2026-09-10 och **osann som arbetsorder i dag** — åtta av
elva punkter är avklarade. Att ge en agent en föråldrad lista är samma fel som
ingångsdokumenten som beskrev fel projekt, och samma fel som prompten som pekade på ett
återkallat beslut.

**Kontrollera denna tabell mot HEAD innan du följer den.** Kommandona står ovan. Den
skrevs 2026-09-16 och kommer att bli osann på samma sätt.
