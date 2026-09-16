# Räddningsplan

> ⚠️ **ORDNINGEN I DENNA FIL ÄR UPPHÄVD.** Vägen står i `VAGEN.md` — den enda filen som
> säger vad som görs härnäst. Steg 1 här (*"bygg slutgrinden först"*) är `VAGEN.md` FAS 7.
> **Analysen och doktrinreglerna i filen gäller oförändrat.**

Fem steg i prioritetsordning. **Ordningen följer vad som förbrukar budgeten**, inte vad
som känns mest akut. Steg 4 (separationen) är viktig men är en följd av problemet — att
börja där lämnar blödningen öppen.

Roller enligt `AGENTS.md`: `$nortropic-architect` (read-only, arkitekturfrågor),
`$nortropic-test-author` (spec och acceptansgrind), `$nortropic-builder` (implementerar
fryst task), `$nortropic-reviewer` (oberoende falsifiering). **En roll per tråd.** Blanda
inte för att spara tid.

---

## Steg 1 — Bygg slutgrinden och stoppa rundtrampen

**Roll: `$nortropic-test-author` fryser grinden, `$nortropic-builder` bygger mot den.
Inget ägarbeslut krävs — se `05-arbetsordning.md` §1.**

### 1a. Bygg `verify/bin/autonomous-loop-exit` — programnivå-grinden

**Detta är orsaken till att programmet aldrig tar slut.** Ägaren definierade slutet
2026-08-10 (`docs/05-beslutslogg.md`, LOOP-ÄGARHAND-50):

> `verify/bin/autonomous-loop-exit` fryses RED före S2–S13 och måste bli grön
> **oförändrad** vid empiriskt closeout. `FULL_ROADMAP_SOFTWARE_COMPLETE` betyder
> task-gates + program-gate + empirical falsification gröna.

Grinden refereras i `AGENTS.md` rad 148, i roadmapens steg L, i
`docs/loop/codex-evidence-contract.md` och i beslutsloggen. **Den finns inte.**
`verify/bin/` har 29 filer; den är ingen av dem.

Utan den finns ingen mekanism som kan säga *klart*. Då mäts framsteg i rundor i stället
för i uppfyllda villkor — och rundor är oändliga. Det förklarar 76 omfrysningsrundor
och 101 `NO-CREDIT` utan att något avslutats.

Bygg den enligt sin egen specifikation: **fryst RED först**, grön oförändrad vid
closeout. Den får aldrig ändras för att en körning ska bli grön — det är hela poängen
med att den fryses innan arbetet den mäter.

**Mot vilket kriterium:** `KERNEL_COMPLETE` i `00-VAD-NORTROPIC-AR.md`, inte det gamla
*"first real autonomous launch"*. Det gamla krävde att en sajt lanseras och kan därför
aldrig nås i ett repo där sajtfabriken inte finns.

**Och det L ska köra saknas också:** `h-014` och `h-015` saknar gate, och `h-018`–`h-030`
finns inte ens som task i specen — bland dem `h-030`, som `h-015` (supervisor resume)
beror på mekaniskt. Arbetet har gått till `h-031`–`h-039`, en annan kedja. Hela kartan
står i `06-inventering.md`.
Efter 1a är S2/S4–S13 den riktiga backloggen — inte H-040.

### 1b. Rätta frysningsdoktrinen

Inom delegationen: detta ändrar **hur** ett redan godkänt mål implementeras, inte **vad**
Nortropic får göra. Alltså arkitektens beslut, inte ägarens.

**⚠️ Läs `01-lagesbild.md` §1 först.** Doktrinen ändrades 2026-09-16 efter att orsaken
till rundtrampet mättes om beteendemässigt. Den tidigare diagnosen — *"rundorna brinner
på miljödrift"* — var fel som förklaring. **Grindfilen ändrades i var och en av H-039:s
30 grindcommits; kandidaten prövades aldrig mot ett oförändrat prov.** Punkt **iv**
nedan är den ändring som angriper det, och den är viktigare än i–iii.

Fyra ändringar:

**i. Förbjud frysning av värdmaskinkonstanter i exitprov.**
`st_dev`, inoder, xattr-storlekar, `ls`-listningars radantal, signed/unsigned-
representation, volym-UUID. Kärnan ska bevisas mot **invarianter** — att mekanismen gör
rätt sak — inte mot vad denna Mac råkade visa vid frysningstillfället.

Det är samma fel `docs/agentoverlamning.md` §3 namnger, en nivå ned: där prövades vad
utdata *sade*; här fryses vad miljön *råkade visa*.

**ii. Kräv ATTRIBUTION innan `NO-CREDIT` får sättas — lätta inte immutabiliteten.**

Immutabiliteten står kvar oförändrad. Det som läggs till är ett obligatoriskt steg före
den: **vems fel var det?**

- **Kandidatdefekt** → `NO-CREDIT`, immutabel, ny runda. Exakt som i dag.
- **Gatedefekt** — grinden band sig till ett värdmaskintillstånd i stället för till en
  invariant → grinden är trasig, inte kandidaten. Rätta bindningen, kör om **samma**
  kandidat.

**Mekaniskt prov för vilket:** reproducera fällningen med samma kandidat på ändrad värd
(efter reboot, annat device-nummer, annan interpreterversion). Reproduceras den →
kandidatdefekt. Reproduceras den inte → gatedefekt.

Detta är en **skärpning**, inte en lättnad: i dag sätts `NO-CREDIT` utan att någon
prövat om kandidaten ens var inblandad. Skärpningslagen gäller — kärnan får smalnas av,
aldrig lättas.

**Utvidgad 2026-09-16 till tre utfall, inte två.** Mätningen visar att det dominerande
fallet saknades i listan ovan:

- **Kandidatdefekt** → `NO-CREDIT`, immutabel, ny runda. Som i dag.
- **Gatedefekt** (värdbindning) → rätta bindningen, kör om **samma** kandidat.
- **MÅLFLYTT** — grinden fick en förpliktelse den inte bar när kandidaten byggdes.
  Kandidaten föll inte; **mätstickan byttes**. Detta är varken kandidatens eller
  grindens defekt utan ett **specifikationsfel**: kravet var ofullständigt när det
  frystes.

**Mekaniskt prov för det tredje:** `git diff` mellan grinden kandidaten byggdes mot och
grinden den dömdes av. **Är den inte bytesidentisk är utfallet MÅLFLYTT** — oavsett vad
rapporten säger, och oavsett hur riktig den nya förpliktelsen är. Provet är objektivt och
kräver ingen bedömning.

En MÅLFLYTT bokförs mot **specifikationen**, aldrig mot kandidaten, och den räknas i
gren 1:s rundbudget med dubbel vikt: en flyttad mätsticka kostar mer än en fälld
kandidat, eftersom allt tidigare arbete mot den gamla grinden blir omätbart.

**iii. Sätt ett klart-kriterium för H-039 — och för varje framtida hypotes.**
Det finns inget i dag. Varje runda avslutas med en ny precisering i stället för ett
uppfyllt villkor. En hypotes utan avslutsvillkor kan per konstruktion inte bli klar.

> ## ✅ INFÖRD 2026-09-16 som **loop-regel 11** i `docs/loop/regler.md`
>
> Denna punkt är inte längre ett förslag. Ägaren beslutade den 2026-09-16 efter FYND 21,
> och den står nu som regel 11 med följdreglerna 11a (omfrysningsbudget, startbudget 3),
> 11b (överskriden budget stoppar hypotesen), 11c (`MÅLFLYTT` som eget
> attributionsutfall) och 11d (förbud mot grindkedjor).
>
> **Läs regeln i `docs/loop/regler.md`, inte här.** Texten nedan är bakgrunden till
> beslutet och bevaras som sådan.

**iv. ⭐ Grindens omfrysningsbudget — den ändring som faktiskt stoppar trampkvarnen.**

De tre ovan gör rundorna ärligare. **Denna ger dem ett tak.**

Mätningen i `02-bevis.md` ("Konvergensmätningen") är entydig: varje **klar** task har en
grind som rörts högst **3** gånger; varje **icke-klar** har en som rörts **17–147**
gånger. Ingen mellanform. Omfrysningsantalet är inte ett symptom på svårighet — det är
det som **gör** hypotesen olöslig, eftersom konvergens kräver ett fast mål.

Regeln, i tre led:

1. **Varje hypotes deklarerar en omfrysningsbudget i sin task.** Saknas den ska bygget
   fälla, inte passera — tom budget är ett fel, aldrig frånvaro av krav.
2. **Överskriden budget stoppar hypotesen** och tvingar fram ett av två beslut, båda
   arkitektens: *dela hypotesen* i mindre med var sitt fasta prov, eller *avsluta den
   som OVERIFIERAT* och skriv om kravet. **Aldrig en runda till.**
3. **Rekommenderad startbudget: 3.** Inte som ett runt tal — det är det observerade
   maxvärdet bland de sex task som faktiskt blivit klara.

**H-039, H-031, H-032 och H-035 spränger budgeten redan i dag.** De ska därför in i led 2
vid införandet, inte få ett undantag: en budget som börjar med fyra dispenser vaktar
ingenting. Att H-039 nått R33 är inte ett skäl att låta den fortsätta — det är beviset
för att den inte kommer i mål på den vägen.

**Detta är den doktrinregel `09-task-rundtrampsvakten.md` gren 2 mekaniserar.** Utan
regeln har vakten ingen tröskel att luta sig mot; utan vakten är regeln elva rader prosa
i en tripwire-tabell.
Båda behövs, och doktrinbeslutet kommer först.

**Den enda spärren:** ändringarna får skrivas in i `docs/loop/regler.md`, aldrig i
`docs/07-konstitution.md` (§A8, human-only). Håller du dig där är det delegerat.

**Varningen som ändå gäller:** en agent som får ändra sina egna beviskrav kan optimera
kravet i stället för kvaliteten — samma skäl som §A2 ger för eval-rubriken. Motmedlet är
att steg 1a byggs **först och fryses RED**: när slutgrinden står innan doktrinen lättas kan
en lättare doktrin inte köpa ett falskt avslut.

**Leverans:** fryst `verify/bin/autonomous-loop-exit` (RED), doktrinändringarna i
`docs/loop/regler.md`, arkitektnotis i `docs/loop/` om räckvidd och vad som inte ändras,
rad överst i `docs/05-beslutslogg.md`.

---

## Steg 2 — Säkra routningen

### 2a. Landa dokumentationsrättelsen  *(roll: builder)*

**⚠️ LÄGET ÄNDRADES 2026-09-16: commitsen är redan pushade.** GitHub-appen installerades
för Nortropic-orgen, och de fyra commitsen ligger på grenen
**`claude/inspiring-galileo-6w1pvw`** (HEAD `d30279c`, 20 filer, +224/−12).

**Steget är alltså inte längre "applicera patchen" utan "granska och merga":**

1. `git fetch origin claude/inspiring-galileo-6w1pvw`
2. Granska diffen mot `main` — 20 filer, ingen i `controller/`, `verify/` eller `specs/`,
   inga frysta exitprov, `docs/07-konstitution.md` och `docs/03-regelverk.md` orörda.
3. **`node scripts/kor-vakter.mjs` grön PÅ MACEN, före och efter.** Detta är kravet som
   inte är uppfyllt: sviten kunde inte köras i molnklonen, där
   `check-foundation-smoke.mjs` faller på `origin`. **Vaktstatus för dessa fyra commits
   är `OVERIFIERAT`, inte grön** — en molnkörning hade mätt miljön.
4. Rad överst i `docs/05-beslutslogg.md`, PR, merga.

`artefakter/nortropic-dokumentation-4commits.patch` ligger kvar som reserv om grenen av
något skäl inte går att nå. **Kontrollera först om commitsen redan finns — duplicera
inte:**

```bash
git log --oneline | grep -i "repots identitet\|lageretiketten\|vaktklassificeringen\|BLANDADE"
git am < artefakter/nortropic-dokumentation-4commits.patch   # om de saknas
```

**Patchen bär FYRA commits, inte tre.** Verifierat 2026-09-16: `1/4`–`4/4`, applicerar
rent på `main`. Den fjärde är den som fredar kernelfilerna i `scripts/` och `tests/` och
får inte tappas — utan den är webbextraktionen fortfarande fel.

Innehållet, ifall patchen inte går att nå:

- **`f4ec2e2`** — `CLAUDE.md` omskriven till kernelrouter med samma auktoritetsordning
  som `AGENTS.md`; repoidentitet in i `AGENTS.md` och `docs/agentoverlamning.md`;
  treledad lagermodell; orienteringsrad överst på sexton webbdokument; överlämningens
  slutstycke rättat (det pekade ut webbfabrikens testklient som systemets nästa steg).
- **`2de99cc`** — "delat styrlager" ersatt med "styrlagret kärnan är pinnad till",
  eftersom innehåll och beroende pekar åt olika håll.
- **`b3450a9`** — vaktklassificeringen rättad: sviten är inte tom på kernelvakter.
  16 refererar enbart webbträdet, 2 enbart kärnan, 1 båda, 4 inget träd.
- **`d30279c`** — `scripts/` och `tests/` märkta BLANDADE i `CLAUDE.md`: kernelfilerna
  där får aldrig följa med när webbträdet flyttas. Facit i `06-inventering.md` §0b.

Krav: `node scripts/kor-vakter.mjs` grön före och efter, HÖGRISK-märkt commit (§A-ytor
berörs: `CLAUDE.md` via byggplan-v3 §3.1; `docs/06-scope.md` och
`docs/kapacitetskatalog.md` via §A9), rad överst i `docs/05-beslutslogg.md`.

Rör inte `docs/07-konstitution.md` (§A8) eller `docs/03-regelverk.md` (§A1). Bumpa inte
`Senast verifierad`-stämplar du inte faktiskt omverifierat — en bumpad stämpel påstår
en granskning som inte gjorts.

### 2b. Bygg `check-repoidentitet.mjs`  *(roller: test-author → builder)*

Godkänd av ägaren 2026-09-14. Utan den skyddas steg 2a av ingenting: i dag finns ingen
mekanism som märker om `CLAUDE.md` skrivs tillbaka till att beskriva webbfabriken.

Vakten ska fälla på:

- `CLAUDE.md` eller `AGENTS.md` saknar repoidentiteten
- de två bär **olika** auktoritetsordning (de ska hållas lika — vaktas i dag av inget)
- `docs/agentoverlamning.md` pekar ut ett webbnästa-steg som systemets
- ett dokument i webblagret saknar sin orienteringsrad

**Krav:** varje gren ska ha ett **positivt kontrollprov** — en muterad kopia som SKA
fällas och bevisligen gör det — plus en **kopplingskontroll** att vakten faktiskt
anropas. En kontrollprövad funktion som kringgås på anropsstället är död kod.

Placering: `scripts/`. `kor-vakter.mjs` upptäcker `check-*.mjs` automatiskt, så ingen
registrering behövs, men vaktantalet går 23 → 24 — kontrollera att
`check-docs-coherence.mjs` rörliga nämnare följer med.

---

## Steg 3 — Pröva resten av inramningen  *(roll: architect, read-only)*

Se KLASS-varningen i `00-LAS-FORST.md`. Tretton av tretton stickprov föll — nio av dem i
detta underlag självt. Resten är oprövat.

Gå igenom `README.md`, `docs/00-borja-har.md`, `docs/00-guide.md`,
`docs/01-oversikt.md`, `docs/02-agenter.md`, `docs/04-justeringskarta.md` och
`AGENTS.md`. Plocka ut varje påstående om vad en mekanism **gör**. För varje: kör
mekanismen, eller märk påståendet `OVERIFIERAT`.

Prioritera påståenden som en ny session skulle handla efter. En felaktig beskrivning av
en grind kostar mer än en felaktig beskrivning av en katalog.

**Leverans:** lista med påstående → mekanismens faktiska beteende → verdikt. Rätta
inget i denna fas; rättelserna blir en egen builder-task.

---

## Steg 4 — Avgör separationen  *(roll: architect, read-only)*

> ## ⚠️ OMSKRIVET 2026-09-16: separationen är GJORD — steget är att LANDA den
>
> Grenen `nortropic/platform-integration-20260910` (`~/nortropic-repos/nortropic-system`,
> 55 commits före main, opushad) bär separationen färdig och mekaniskt verifierad:
> 0 webbfiler kvar, `platform-separation-final-exit` **exit 0**, ägarbeställd i commit
> `49cc495` 2026-09-10.
>
> **De tre vägarna A/B/C nedan är därmed obsoleta.** Valet är inte längre hur
> separationen ska göras, utan hur den befintliga grenen granskas och landas. Det som
> blockerar är FYND 21: tre av grenens grindar är röda på föråldrade baspinnar, inte på
> defekt arbete.
>
> Behåll avsnittet som bakgrund till varför separationen var svår — men bygg ingenting
> av det.

**Blockeringen:** att flytta ut webbträdet bryter frysta, SHA-bundna exitprov. En fryst
gate kan inte skrivas om — den kräver en ny fryst runda. Att byta `register.json`
hjälper inte: de frysta proven läser registrets innehåll. Detaljerna i
`01-lagesbild.md` §5.

Väg en av tre, med skriftligt skäl mot auktoritetsordningen:

**A. Kopia nu, radering senare.** `nortropic-web` skapas ur bundlen. Inget bryts,
`nortropic-system` fortsätter grönt. Raderingen här blir en egen kernel-task som fryses
**en** gång, när kärnan fått egna verifierare (steg 5).
*Kostnad:* två kopior under mellantiden. *Mildrande:* webbkopian har ändrats 1 gång på
9 dagar.

**B. Flytta allt nu.** H-017, H-035, H-037 fryses om.
*Kostnad:* tre avslutade hypoteser återöppnas. Detta är exakt det rundmönster som
förbrukat merparten av budgeten. **Välj inte B utan att visa varför omfrysningen är
billigare än den ser ut** — H-032 kostade 21 rundor och 145 commits.

**C. Kärnans egna verifierare först**, byt registret, flytta sedan. Arkitektoniskt rätt
ordning, men registerbytet bryter samma prov, så mot B köper det ingenting utan A som
mellansteg.

Ser du en fjärde väg: beskriv den mot samma kostnadsmått.

**Avgör även styrlagrets ägarskap per fil.** `07-konstitution` och `03-regelverk` är
webbdokument som sex frysta gates läser här — de kan alltså inte följa med till
`nortropic-web`. `05-beslutslogg` är kernel-dominerad. Att kopiera dem skapar **två
sanningar om samma regel**, vilket `docs/agentoverlamning.md` varnar för; att lämna dem
här gör `nortropic-web` icke-grönt eftersom `check-docs-coherence.mjs` läser alla tre.
Föreslå per fil, inte en generell regel.

**Leverans:** arkitektnotis i `docs/loop/`, taskspec-utkast i den form
`specs/tasks.spec.json` använder (med `allowed_write` och ett frysbart
`exit_test`-krav), rad överst i `docs/05-beslutslogg.md`.

Ändra ingen fil i `controller/`, `verify/` eller `specs/` i denna fas. Rör inga frysta
exitprov.

**Om bundlen används:** orienteringsraderna i den är **inverterade**. De säger *"Detta
repo är Nortropics trust kernel"* — sant i `nortropic-system`, falskt i `nortropic-web`.
Måste vändas i första commiten där.

---

## Steg 5 — Ge kärnan en egen grindsvit — och lös upp cirkeln

> ## ⚠️ GJORT 2026-09-10 — verifierat 2026-09-16
>
> *"Det konkreta draget"* nedan är utfört på grenen
> `nortropic/platform-integration-20260910`: `controller/verify/register.json` bär nu EN
> post — `scripts/check-invariants.mjs`, omskriven till *"Deterministisk
> plattformsinvariantgrind PINV-001–006"* — och `workflows/nortropic-verify-suite.js` är
> borta. Registret ligger dessutom under `denied_write` i specen och ändras bara genom
> kontraktsflödet.
>
> `invariant-required-exit` ger **exit 0**. Den cirkulära kopplingen finns inte längre på
> den grenen. Kvar: landa den. Se steg 4.

**Det konkreta draget:** `controller/verify/register.json` registrerar i dag två
**webbfiler**. Registrerar det kernelverifierare i stället upphör hela den cirkulära
kopplingen — båda riktningarna har den enda roten (se `01-lagesbild.md` §5).

Fortfarande blockerat av att `h-017`, `h-035` och `h-037` läser registrets innehåll. Men
det är **en** omfrysning med **ett** syfte, inte en runda i taget — och den bör planeras
tillsammans med steg 4 så att separationen och registerbytet sker i samma omfrysning i
stället för i två.

### Bakgrund

I dag ärver kärnan webbfabrikens 23 vakter och har ingen egen. Noll av dem läser
`controller/`, `verify/` eller `specs/`. Ett kernelarbete som ser `23/23 gröna` har
fått ett kvitto på fel sak.

Detta är förutsättningen för att steg 4 väg A ska kunna slutföras: först när kärnan har
egna verifierare kan `register.json` peka på dem i stället för på webbfilerna, och först
då kan webbträdet raderas här.

Omfattning och innehåll är arkitektens fråga och bör beredas först när steg 1 är avgjort
— annars byggs den nya sviten under samma frysningsdoktrin som skapade trampkvarnen.

---

## Hur vi vet att vi arbetar med kärnan framåt

Fyra mekanismer, i den ordning de biter:

1. **`CLAUDE.md` och `AGENTS.md` routar rätt** (steg 2a) — ingen ny session bootar in i
   fel projekt.
2. **`check-repoidentitet.mjs` fäller om routningen skrivs tillbaka** (steg 2b).
3. **`docs/loop/drift.md` är kärnans lägesdokument**, nyast överst.
   `scripts/kor-vakter.mjs` är webbfabrikens grindsvit och säger inget om kärnan;
   kärnans dom är taskens frysta `exit_test` i `verify/bin/`. **Blanda aldrig ihop dem
   i en rapport.**
4. **Separationen avgjord och påbörjad** (steg 4).

---

## GitHub-åtkomst — LÖST 2026-09-16

Spärren är borta. Ägaren installerade Claude GitHub App för Nortropic-orgen, och pushen
gick igenom: grenen `claude/inspiring-galileo-6w1pvw` finns på origin med de fyra
dokumentationscommitsen.

**Vad som återstår är inte åtkomst utan verifiering:** grenen är omergad och vaktsviten
är inte körd mot den på rätt maskin. Se steg 2a.

> Den historiska noteringen behålls för att den var korrekt klassad: 403:an var det
> **fjärde äkta mänskliga stoppet** (extern trust-rot som kräver mänsklig ceremoni), inte
> ett systemfel att arbeta runt. Klassningen höll — stoppet löstes av en människa, och
> arbetet fortsatte. Uppstår samma 403 igen är det samma stopp, inte en ny utredning.
