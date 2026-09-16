# Arbetsordning — hur Claude och Codex arbetar autonomt till slutmål

**Denna fil är den operativa instruktionen.** `01` är diagnosen, `03` är planen, denna
säger vad du gör när du sätter dig ner, och hur du vet att du är klar.

Gäller båda modellerna. Claude läser `CLAUDE.md`, Codex läser `AGENTS.md`; båda ska
peka hit.

---

## 1. Autonomin är redan given — sök inte godkännande

Ägaren tog bort de interaktiva stoppen **2026-08-13**. Det står i
`docs/loop/remaining-bootstrap-delegation-v1.md`, mandat-SHA
`f0092e8c394c7bd4b23ad2e9375462813fd1533ac2ba5cf50833019165994178`:

```text
OWNER_MANUAL_FINAL_APPROVAL_REQUIRED=NO
OWNER_FINAL_FREEZE_MAY_BE_EXECUTED_AUTONOMOUSLY=YES
OWNER_PUBLICATION_APPROVAL_REQUIRED=NO
OWNER_PR_APPROVAL_REQUIRED=NO
OWNER_MERGE_APPROVAL_REQUIRED=NO
OWNER_NEXT_TASK_APPROVAL_REQUIRED=NO
OWNER_SUPERVISOR_RESUME_APPROVAL_REQUIRED=NO
NO_FORCE_SEMANTICS=YES
SELF_CERTIFICATION_AS_PROOF=NO
```

**Scope:** H-035 → H-034 → H-033 → H-032 → H-031 → supervisor resume → first real
autonomous launch.

**Och ett ANDRA, bredare mandat 2026-09-09** — hittat i backuprepot 2026-09-16, bekräftat
av ägaren samma dag och infört i `docs/05-beslutslogg.md` som `LOOP-ÄGARMANDAT-0909`:

> *"Du har mitt fulla godkännande att göra det du anser fram till supervisor resume,
> arbeta mot slutmålet. Om du behöver uppdatera någo dokumentations för att alltid förstå
> detta, gör det gärna."*

Det är **senare och bredare** än delegationen ovan: inte en avgränsad kedja utan arbetet
fram till supervisor resume, med uttrycklig rätt att uppdatera dokumentation. Det stod i
fem veckor enbart i ett annat repo — därav att sessioner sökte godkännanden som redan
fanns. **Det upphäver ingenting mekaniskt:** inga frysta grindar, ingen `allowed_write`,
ingen sandbox, ingen attestation, ingen §A-regel, och `SELF_CERTIFICATION_AS_PROOF=NO`
gäller oförändrat.

Delegationen gäller så länge varje mekanisk förutsättning är bevisad: exakt
task/spec/gate/base/candidate-identitet, aktuell auktoritetslinje, exakt filscope och
`denied_write`-efterlevnad, faktiska gate-/test-/empiriska resultat, oberoende review
bunden till den immutabla kandidaten utan olöst åtgärdbart fynd, rent arbetsträd, exakt
remote-/PR-identitet. **Saknad evidens avvisar.** Vanliga reviewfynd går till en ny
remediation-kandidat och ny review — **utan mänskligt schemaläggningsstopp**.

`OWNER_DECISION_REQUIRED` från test-author, builder eller reviewer är en **intern
routingsignal till `$nortropic-architect`** — aldrig en mänsklig överlämning.

### De enda äkta mänskliga stoppen

Ur delegationens `true_human_hard_stops`. Ett stopp är giltigt bara om det som krävs är
att ändra **vad Nortropic i grunden får göra**, inte **hur ett redan godkänt mål
implementeras**:

1. Ändra `docs/07-konstitution.md` eller annan uttryckligt människoägd auktoritet
2. Juridiskt human-only
3. Verklig konflikt mellan högre auktoriteter
4. Provisionera eller ändra externa credentials, secrets, GitHub-organisationsidentiteter
   eller andra externa trust-rötter som kräver en mänsklig ceremoni

**Allt annat är ditt att avgöra och bygga.** Att lista något som "ägarbeslut" utan att
pröva om det stämmer är samma fel som att anta att en vakt är grön utan att
mutationspröva den.

> **403 på `git push` var stopp nr 4 — LÖST 2026-09-16.** Ägaren installerade Claude
> GitHub App för Nortropic-orgen och pushen gick igenom. Klassningen höll: det var en
> extern trust-rot som krävde mänsklig ceremoni, inte ett systemfel att arbeta runt.
> Återkommer samma 403 är det samma stopp — rapportera det, utred det inte.

---

## 2. Slutkriteriet — och grinden som mäter det

Premissen står i `00-VAD-NORTROPIC-AR.md` och är auktoritet. Härlett ur den:

> **`KERNEL_COMPLETE`** — Nortropic tar ett accepterat uppdrag ur sin egen backlog,
> utför det obevakat inom givet mandat, verifierar mekaniskt mot fryst `exit_test`,
> attesterar, publicerar via guarded merge, och **återupptar efter avbrott med avsikt,
> underlag, beslut och läge intakta** — bevisat på Nortropics eget utvecklingsarbete
> (Customer Zero), utan att någon människa återberättar sammanhang.

**Kärnans slut och självbyggets start är samma händelse.** Klarar kärnan den loopen
obevakat en gång på sin egen backlog, är strategin "sedan bygger den sig själv" bevisad.
Klarar den inte det, har strategin inte börjat.

Detta ersätter det tidigare kriteriet *"first real autonomous launch"* — alltså lansera
en sajt. Det kunde per konstruktion aldrig nås i ett repo där sajtfabriken inte finns,
och det är en del av förklaringen till att förberedelsekedjan aldrig tog slut.

Roadmapens steg L är redan formulerat som **"empirical unattended end-to-end run"** —
alltså rätt sak. Den mekaniska domen skulle ligga i
`verify/bin/autonomous-loop-exit`, fryst RED före S2–S13 och grön **oförändrad** vid
empiriskt closeout (`docs/05-beslutslogg.md`, LOOP-ÄGARHAND-50, 2026-08-10).

Grinden refereras i `AGENTS.md` rad 148, i roadmapens steg L, i
`docs/loop/codex-evidence-contract.md` och i beslutsloggen.

**Den finns inte.** `verify/bin/` har 29 filer; `autonomous-loop-exit` är ingen av dem.

Inte heller det den ska köra: `h-014` och `h-015` saknar gate, och `h-018`–`h-030` finns
inte ens som task i specen. Bland dem `h-030` — **som `h-015` (supervisor resume) beror
på mekaniskt.** Arbetet har i stället gått till `h-031`–`h-039`, en annan kedja. Hela
kartan står i `06-inventering.md`.

### Detta är orsaken till att programmet aldrig tar slut

Utan programgrinden finns **ingen mekanism som kan säga "klart"**. Då mäts framsteg i
rundor i stället för i uppfyllda villkor — och rundor är oändliga. 440 av 825 commits
(53 %) ligger på kontrollplanet, fyra hypoteser bär 76 omfrysningsrundor, och
`drift.md` har 101 `NO-CREDIT`.

Det är inte brist på autonomi. Det är brist på ett avslut.

**Därför är första uppgiften att bygga `verify/bin/autonomous-loop-exit`.** Se
`03-raddningsplan.md` steg 1.

---

## 3. Arbetsloopen — varje skiva, utan undantag

1. Bygg i egen worktree, egen `owner/*`-gren. **En roll per tråd.**
2. **Mutationspröva.** Skriv mutationer som SKA fälla grinden och kör dem. En grind som
   inte bevisats fälla är ingen grind.
3. Rätta varje överlevare — och pröva om.
4. Docs-synk i **SAMMA commit** (regel 22): `docs/loop/drift.md` (nyast överst) +
   `docs/05-beslutslogg.md` (aktuell kandidat först).
5. `node scripts/kor-vakter.mjs` grön före commit **om du rört dokumentation eller
   webbträdet**. Den sviten säger inget om kärnan.
6. Kärnans dom: taskens frysta `exit_test` i `verify/bin/`. Rapportera med **faktiskt
   kommando + exitkod**.
7. PR med hela resonemanget — fynden, inte bara ändringarna. Merga.

---

## 4. Tripwires — så vet du att du är i diket

Kontrollera dessa vid varje rundstart. Slår någon: **stanna och byt angreppssätt,
frys inte om.**

| Signal | Vad det betyder | Vad du gör |
|---|---|---|
| **⭐ Du är på väg att ändra grinden för att rundan föll** | **MÅLFLYTT — den dyraste signalen i tabellen.** Kandidaten prövas då aldrig mot ett fast mål, och hypotesen kan per konstruktion inte konvergera | **Stanna.** `git log --oneline --follow -- <exit_test> \| wc -l`. Är talet ≥ 3: routa till architect för delning eller avslut. Frys inte om |
| **Rundan dömdes av en annan version av grinden än kandidaten byggdes mot** | Kandidaten föll inte — mätstickan byttes | Bokför `MÅLFLYTT` mot **specifikationen**, aldrig som kandidatdefekt. Provet är en `git diff`, ingen bedömning |
| Rundan föll på `st_dev`, inod, xattr, `ls`-format, signed/unsigned, volym-UUID | Grinden är bunden till värdmaskinen, inte till kärnan | Ändra **bindningen**, inte kandidaten. Bind mot invariant, inte mot mätvärde |
| Rundan föll för att ägaren startade om, uppdaterade OS eller bytte Python | Samma sak | Som ovan. Detta är aldrig en kandidatdefekt |
| Samma hypotes passerar runda 4 | Hypotesen saknar avslutsvillkor | Routa till `$nortropic-architect`: formulera villkoret, eller dela hypotesen |
| **Grinden har frysts om mer än 3 gånger** | **Mätt:** varje icke-klar task har en grind rörd 17–147 gånger. *(Den omvända halvan — "klar ⇒ ≤ 3" — är falsifierad 2026-09-16, FYND 33: `h-016` rördes 1 gång och ger `11 PASS / 14 FAIL`. Lågt tal = någon slutade röra grinden, inte att den blev grön)* | Budgeten är slut. Dela hypotesen eller avsluta den `OVERIFIERAT`. **Aldrig en runda till** — se `03-raddningsplan.md` steg 1b iv |
| **Du är på väg att skriva KLAR** | Tre task bar etiketten KLAR utan ett kört grönt exitprov, och tre av dem är röda (FYND 33). Det är underlagets dyraste fel | **Kör grinden i samma session och citera exitkoden.** Regel 8. Att en grindfil finns är inte att den passerar |
| Du är på väg att skriva `productless` / `NO-CREDIT` | Rundan producerar inget | Fråga vad som skulle göra den produktbärande. Går det inte att svara — hypotesen är fel formulerad |
| Exitprovet växer förbi ~200 KB | Det fryser för mycket. *Sekundär signal* — omfrysningsantalet ovan biter tidigare | Faktorisera ut det som är miljö och bind det separat |
| Du skriver "väntar på ägaren" | Troligen fel | Läs §1. Är det inte ett av de fyra äkta stoppen: fortsätt |
| Du rapporterar `23/23 gröna` om en kerneländring | Fel svit | Kärnans dom är `verify/bin/`. Säg vilken |
| **Sviten ger `FAIL — 1 av 23` direkt i en färsk klon** | **Inte ditt fel.** `check-foundation-smoke.mjs` är miljöbunden — se nedan | Bekräfta att felet är K1/origin. Starta ingen runda på det |

### ⚠️ `check-foundation-smoke.mjs` är grön bara i ägarens klon

**Mätt 2026-09-16 på ren `main`, utan några ändringar:**

```bash
git clone --branch main <repo> /tmp/test && cd /tmp/test
node scripts/kor-vakter.mjs          # RESULTAT: FAIL — 1 av 23 vakter föll
bash tests/fixtures/foundation/kontroller.sh | head -1
# FAIL: K1: origin är 'file:///...' — inte Nortropic/nortropic-system
```

`kontroller.sh` kontrollerar att `origin` pekar på `Nortropic/nortropic-system`. Gör den
inte det avbryts sviten och avger **0 kvittensrader i stället för 9**, varpå
`check-foundation-smoke.mjs` fäller på antalet.

**Grinden är alltså bunden till klonens remote-URL, inte till mekanismen den påstår
vakta.** Det är exakt samma sjukdom som H039:s `st_dev` och `com.apple.provenance` — en
grind som prövar miljön i stället för koden — fast i webbsviten.

**Två konsekvenser:**

1. **Starta ingen runda på detta.** Ser du `FAIL — 1 av 23` i en arbetsklon: kontrollera
   att det är K1/origin, och gå vidare. Din ändring orsakade det inte.
2. **Varje `23/23 gröna` i detta underlag gällde ägarens klon**, inte koden. Påståendet är
   miljöspecifikt och skrevs utan att någon prövat det i en färsk klon — samma klass av
   fel som underlaget självt varnar för.

Rättningen hör till doktrinändringen i `03-raddningsplan.md` steg 1b i: bind mot
invariant, inte mot mätvärde.

> ⚠️ **Tabellen ovan är prosa, inte mekanism.** Ignoreras den händer ingenting. Fyra av
> raderna ska göras mekaniska av rundtrampsvakten — taskspecen står i
> `09-task-rundtrampsvakten.md` och väntar på att frysas. Tills den finns är detta elva
> rader någon måste välja att följa.

**Regeln bakom hela tabellen — och den är en SKÄRPNING, inte en lättnad.**
`NO-CREDIT`-immutabiliteten står kvar oförändrad. Det som tillkommer är ett obligatoriskt
attributionssteg **före** den: reproducera fällningen med samma kandidat på ändrad värd
(efter reboot, annat device-nummer, annan interpreterversion).

- Reproduceras den → **kandidatdefekt** → `NO-CREDIT`, immutabel, ny runda. Som i dag.
- Reproduceras den inte → **gatedefekt**. Grinden band sig till värdmaskinen i stället
  för till en invariant. Rätta bindningen, kör om **samma** kandidat.
- **Är grinden inte bytesidentisk med den kandidaten byggdes mot → `MÅLFLYTT`.**
  Kandidaten föll inte; kravet var ofullständigt när det frystes. Bokförs mot
  **specifikationen**, aldrig mot kandidaten.

I dag sätts `NO-CREDIT` utan att någon prövat om kandidaten ens var inblandad. Kravet gör
mängden fällda kandidater smalare och bättre belagd — skärpningslagen gäller.

**Det tredje utfallet är det dominerande, och det saknades helt tills 2026-09-16.**
`verify/bin/h-039-exit` ändrades i var och en av sina 30 commits: 200 798 → 2 136 969
byte, noll minskningar. **Ingen kandidat har någonsin prövats mot ett oförändrat prov.**
Varje sådan runda bokfördes som kandidatdefekt. Mätningen står i `02-bevis.md`
("Konvergensmätningen"), mekanismen i `01-lagesbild.md` §1.

---

## 4a. Två regler som nu är BINDANDE, inte råd

Tripwiretabellen ovan var prosa. Två av dess rader är sedan 2026-09-16 **loop-regler** i
`docs/loop/regler.md`, beslutade av ägaren:

- **Regel 11** — grinden pinnar egenskapen, aldrig trädet. Med 11a omfrysningsbudget
  (startbudget 3), 11b stopp vid överskridande, 11c `MÅLFLYTT` som eget
  attributionsutfall, 11d förbud mot grindkedjor.
- **Regel 12** — finns det lokalt, finns det på git. Inget okommitterat och ingen opushad
  gren vid dagens slut utan en rad i `drift.md` som säger vad och var.
  `[LOCAL]`-märkning är ett kvalificeringsläge, aldrig ett skäl att inte pusha.

De står över denna fil i auktoritetsordningen. Vid konflikt gäller `regler.md`.

---

## 4b. Fastnar du — den bortre gränsen

Tripwires fångar att du kör i diket. Detta säger vad du gör när du **inte kommer vidare
alls**. Utan regeln blir utfallet tyst snurrande, och tyst snurrande är hur tre månader
går utan att någon märker det.

**Två försök. Sedan skriver du.**

Har du prövat samma hinder två gånger utan att komma längre är tredje försöket inte
arbete — det är rundtramp i miniatyr. Skriv i stället en rad överst i `docs/loop/drift.md`:

```
BLOCKERAD <datum> · <task/hypotes> · vad som hindrar · vad du prövat (kommando + exitkod)
· vad som skulle lösa det · MÄNSKLIGT STOPP: ja (vilket av de fyra) / nej
```

Sedan **går du vidare till nästa oberoende post** i `06-inventering.md`. Du stannar
aldrig helt så länge det finns en post som inte beror på det som blockerar.

**Tre saker du aldrig gör i stället:**

| Aldrig | Varför |
|---|---|
| Öppna en ny hypotes för att komma runt hindret | Det är så h-031…h-039 uppstod vid sidan av huvudvägen. Kedjan som arbetas på slutar leda till målet |
| Skriva läget i en ny fil | En andra sanning driftar inom ett dygn (§6) |
| Vänta tyst på ägaren | Det finns fyra äkta mänskliga stopp (§1). Är det inget av dem är det ditt |

**Raden är hela poängen.** En blockering som står skriven kostar ägaren trettio sekunder
att läsa. En som inte står skriven kostar en session till att återupptäcka — och det är
precis den kostnaden hela detta underlag finns för att ta bort.

---

## 5. Var läget står — sök aldrig på annat håll

| Fråga | Fil |
|---|---|
| Kärnans läge, senaste rundan | `docs/loop/drift.md` (nyast överst) |
| Beslut och motiv | `docs/05-beslutslogg.md` (aktuell kandidat först) |
| Kärnans byggregler | `docs/loop/regler.md` · planen i `docs/loop/byggplan-v3.md` |
| Tasks och frysta exitprov | `specs/tasks.spec.json` · `verify/bin/` |
| Autonomins gränser | `docs/loop/remaining-bootstrap-delegation-v1.md` |
| Roadmapen och steg L | `docs/loop/codex-autopilot-v3-full-roadmap.md` |
| Evidenskrav | `docs/loop/codex-evidence-contract.md` |

**Ingen annan fil bär teknisk status.** Hittar du status någon annanstans är det drift
— rätta den, eller märk den `OVERIFIERAT`.

---

## 6. Dokumentationskontraktet

**En mätning som inte står i repot har inte gjorts.** Det är inte formalia: hela
projektets kostnad kommer av att kunskap bott i sessioner i stället för i filer.

Varje arbetspass lämnar tre spår, och de tar två minuter:

1. **Rad i `docs/loop/drift.md`** överst: vad rundan gjorde, vad som föll, vad nästa
   steg är. Konkret nog att handla på.
2. **Rad i `docs/05-beslutslogg.md`** överst om ett beslut fattades, med skälet.
3. **Inget nytt statusställe.** Skriv inte lägesrapporter i README, i
   `docs/agentoverlamning.md` eller i nya filer. En andra sanning om läget driftar inom
   ett dygn och är värre än ingen.

Är arbetsträdet smutsigt eller en gren opushad: skriv det i drift-raden. Nästa session
ser då direkt vad som ligger halvgjort.

**Och för varje påstående du prövar — även när det visade sig stämma:** skriv
`BEKRÄFTAT <datum> mot <sha>, metod: <hur>`. Ett obekräftat påstående måste prövas om
varje session; ett daterat behöver bara prövas mot det som ändrats sedan dess. Utan
datering bygger vi en ny trampkvarn, den här gången av verifiering.

**Rättar du ett tal: rätta källan i samma commit.** Ett korrigerat värde som bara står
i drift-loggen skapar en andra sanning som driftar — precis det
`docs/agentoverlamning.md` varnar för.

---

## 7. Kontinuitetsprovet — och nollmätningen

**Kör nollmätningen NU, före förbättringarna.** Ett misslyckat första prov är fortfarande
en giltig nollmätning — det visar vad som behöver rättas. Utan den går ingen förbättring
att bevisa senare, och "avlastar Nortropic mig?" blir en smaksak.

Detta mäter produktens kärnpåstående: att arbetet hänger ihop utan att ägaren bär
sammanhanget.

### Provet

**1. Välj ett verkligt, avgränsat arbetsläge.** Dokumentera i förväg — detta blir
bedömningsunderlaget, och det skrivs **innan** sessionen startar:

- rätt repo och arbetsgren
- aktuellt uppdrag
- senaste accepterade resultat
- relevanta begränsningar
- nästa tillåtna åtgärd

**2. Starta en ny session utan den gamla chatthistoriken.** Ge den rätt arbetsyta, den
**ordinarie** startingången och gällande mandat — men **inte** en specialskriven
förklaring som redan innehåller svaren. Startingången som ska prövas är den som finns:
`CLAUDE.md` för Claude, `AGENTS.md` för Codex. `AGENTS.md` kräver dessutom kontroll av
repoidentitet före ändringar som rör Git- eller trust-state; det ingår i provet.

**3. Bedöm.** Sessionen ska kunna hitta rätt arbetsläge, skilja avslutat från
återstående arbete och ta nästa tillåtna steg. **Ett verkligt auktoritets- eller
informationshinder ska rapporteras korrekt, inte kringgås.**

### Måtten — samma före och efter

| Mått | Vad som registreras |
|---|---|
| Tid till korrekt nästa steg | Hur lång tid det tar att hitta och börja rätt tillåten åtgärd |
| Ägarens samordningsinsats | Antal nödvändiga kompletteringar och aktiv tid |
| Onödiga omtag | Redan accepterat arbete som görs om utan saklig grund |
| Faktiskt resultat | Vad sessionen **genomför och verifierar** — inte vad den föreslår |
| Modellförbrukning | Observerbar förbrukning med samma mätmetod; annars `OVERIFIERAT` |

**Känd baslinje att jämföra mot:** 440 commits på kontrollplanet mot ~24 avslutade tasks
är ~18 commits per levererad task. H-039 ensam: 80 commits, noll tasks.

### Godkännandekriteriet

> Den nya sessionen hittar rätt läge och nästa steg **utan ägarens kontexttransport,
> utan obefogad återöppning och utan att överskrida mandatet.**

**Två saker som inte är samma:** ett *genomfört* prov och ett *godkänt* prov. Och en
lyckad session bevisar detta avgränsade beteende — **inte generell driftsäker autonomi.**

### Ordningen

```
0. Avgör backup-repot (06 §0c)      ← två git-kommandon, annars är allt mätt mot fel historik
1. Nollmät                          ← nu, före allt annat
2. Lås acceptansfilen (07) med h-030 inkluderad
3. Koppla de tre reglerna (08) till det befintliga arbetsflödet
4. Upprepa kontinuitetsprovet
```

Slutredovisningen visar acceptansfilen och provkopplingarna, den verifierade mekanismen,
beslutsreferensen och testprotokollet med nollmätningen. **Saknas något ska just den
delen stå kvar som öppen, inte döljas av en allmän grön status.**

---

## 8. Sammanfattning i nio rader

1. Autonomin är given sedan 2026-08-13. Sök inte godkännande.
2. Fyra äkta mänskliga stopp finns. Allt annat är ditt.
3. Slutet är definierat: `FULL_ROADMAP_SOFTWARE_COMPLETE`.
4. Grinden som mäter det saknas — bygg den först.
5. **Ändra aldrig grinden för att rundan föll.** Ett mål som rör sig kan inte nås, och
   30 av 30 grindcommits i H-039 gjorde just det.
6. Mutationspröva allt. En grind som inte bevisats fälla är ingen grind.
7. Faller en runda på miljön: ändra bindningen, frys inte om.
8. Läget bor i `drift.md` och beslutsloggen. Ingen annanstans.
9. **Inventera maskinen, inte bara repot** (`06-inventering.md` §0c).
