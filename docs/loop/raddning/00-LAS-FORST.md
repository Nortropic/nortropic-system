# Räddningsunderlag för nortropic-system

**Skrivet 2026-09-16. Gäller både Claude och Codex.** Båda modellerna arbetar i detta
projekt, läser olika ingångsfiler (`CLAUDE.md` respektive `AGENTS.md`) och har hittills
fått olika — och delvis felaktiga — bilder av vad repot är. Detta underlag är den
gemensamma sanningen.

## Vad repot är

**Läs `00-VAD-NORTROPIC-AR.md` först.** Den bär ägarens definition av vad Nortropic är
och är auktoritet för allt annat här. Nortropic är ett personligt organisatoriskt
operativsystem — inte i första hand en webbyrå, en chatbot eller en Trust Kernel.

`nortropic-system` är Nortropics **trust kernel / bootstrap**: exekveringsunderlaget som
möjliggör autonomin, inte helheten. Leveransen är kontrollplanet: `controller/`,
`verify/`, `specs/tasks.spec.json`, `docs/loop/`.

**Strategin:** bygg bootstrapen färdig, därefter bygger systemet sig självt. Kärnans
slutkriterium (`KERNEL_COMPLETE`) och startvillkoret för det självbygget är samma
händelse — se `00-VAD-NORTROPIC-AR.md`.

Webbfabrikslagret (`agents/`, `skills/`, `packs/`, `backtests/`, `workflows/` och
`docs/00`, `01`, `02`, `04`, `06`) ligger kvar i trädet och beskriver kundflödet —
ett annat spår, aldrig detta repos mål. Det ska ut till ett repo `nortropic-web`,
men **kan inte flyttas som det ser ut nu**; skälet står i `01-lagesbild.md` §5.

## Filerna här

| Fil | Vad |
|---|---|
| `00-VAD-NORTROPIC-AR.md` | **Premissen.** Ägarens definition — auktoritet för allt annat |
| `00-LAS-FORST.md` | Denna. Router och prioritetsordning |
| `01-lagesbild.md` | Diagnosen — vad som gått snett och varför |
| `02-bevis.md` | Varje mätning med kommandot som återskapar den |
| `03-raddningsplan.md` | Vad som ska göras, i ordning, med roll per steg |
| `04-fallor-och-doktrin.md` | Grindmekanik, textfällor, metodkrav |
| `05-arbetsordning.md` | **Den operativa instruktionen** — autonomins gränser, slutkriteriet, arbetsloopen, tripwires, kontinuitetsprovet |
| `06-inventering.md` | **Vägen till klar kärna** — varje task, gate, beroende och lucka. §0 bär ominventeringskravet, **§0c det lokala maskintillståndet och backup-repot** |
| `07-v1-acceptans.md` | **Vad `Autonomy Kernel v1` betyder** — namndisciplin, scope, h-030-beslutet, hur varje krav bevisas |
| `08-mekanismer.md` | Hur de tre arbetsreglerna kopplas till befintligt flöde så de FÄLLER |
| `09-task-rundtrampsvakten.md` | **Taskspec att frysa** — den enda MEKANISMEN i paketet. Bärs av Codex, inte Claude |
| `10-forsta-arbetspaketet-h014.md` | **Första bygget.** Redan specad i repot; bara grinden saknas. Bär rättelsen om plattformen |
| `PROMPT-TILL-CODEX.txt` | Klistras in som första meddelande till Codex |
| `artefakter/nortropic-dokumentation-4commits.patch` | Fyra färdiga commits som rättar ingångsdokumentationen |
| `artefakter/nortropic-web-extraktion.bundle` | ⚠️ **ÖVERFLÖDIG** — webbfabriken finns på riktigt i `Nortropic/nortropic-webbforvaltning` sedan 2026-09-16, med proveniens per fil. Bundlen var mitt eget utkast och ska inte användas |
| `artefakter/validera-underlaget.sh` | **MEKANISMEN som prövar detta underlag mot repot.** 37 påståenden, verdikt per rad, exit 0/1/2. Kör den först |
| `artefakter/klassificera-lager.py` | ⚠️ **ÖVERFLÖDIG** — ersatt av `SEPARATION-20260910/ALLOCATION.tsv`. Kör den inte |
| `artefakter/lagerklassificering-2026-09-16.txt` | Utfallet: 439 filer — 121 kärna, 7 delat, 311 webb |

**Kör först, läs sedan:**

```bash
bash <underlagskatalog>/artefakter/validera-underlaget.sh    # från reporoten, på MACEN
```

Den prövar 37 av underlagets bärande påståenden mot repot och ger verdikt per rad.
`exit 0` = talen stämmer · `exit 1` = underlaget bär ett fel · `exit 2` = något kunde
inte mätas. **Grönt betyder att talen är desamma som när de skrevs — aldrig att
påståendena är sanna.** Den oberoende omhärledningen i `06-inventering.md` §0 står kvar.

**Läsordning:** `00-VAD-NORTROPIC-AR.md` → denna fil → `05-arbetsordning.md` → `01` →
`06` → `07` → `03`. Läs `02` när du behöver belägg för ett enskilt påstående, `08` när
du ska koppla arbetsreglerna, och `04` innan du rör en vakt eller ett dokument.

**Arbetar du redan och vill bara veta vad du ska göra härnäst:** läs enbart
`05-arbetsordning.md`. Den är självbärande.

## Det viktigaste i hela underlaget

**Inramningen i ingångsdokumenten är opålitlig som klass — inte i enstaka punkter.**

Under arbetet 2026-09-14/16 hittades **tretton** felaktiga påståenden — fyra i repots
ingångsdokumentation, **nio i detta underlag efter att det skrivits.** Alla uppstod
likadant: en formulering ärvdes, eller ett tal togs ur ett kommando, och prövades aldrig
mot mekanismen.

**Elva av tretton kom av en LEXIKAL metod** — ett grep, ett ordval, ett filtrerat
kommandosvar. Varje gång metoden byttes mot en **beteendemässig** (kör grinden, ta bort
filen och se vad som går sönder, följ filens historik) föll påståendet. Det är hela
skälet till att `06-inventering.md` §0 kräver en annan metod, inte samma kommando igen.

| Dokumentationen påstod | Mekanismen gör |
|---|---|
| doctor #12(e) vaktar dokumentationsdrift | Det är en MODE i `agents/nortropic-steward.md` — webbfabrikens stewardrevision. Den **WARN:ar**, den fäller inte, och är ingen kernelgrind |
| `kor-vakter.mjs` grön ⇒ ändringen verifierad | Av 23 vakter refererar 16 enbart webbträdet, **2 enbart kärnan**, 1 båda och 4 inget träd. Grönt är inget bevis om en kerneländring — men sviten är inte tom på kernelvakter |
| Beslutsloggen är "nyast sist" | Filens eget kontrakt på rad 16: *"aktuell kandidat först, därefter äldst först"* |
| Konstitutionen är delat styrlager | Innehållet har **0** kernelomnämnanden; varje sökväg §A skyddar ligger i webbträdet |

**⚠️ EN TJUGONDE OCH EN TJUGOFÖRSTA — och de ändrar vad som återstår att göra.**
Hittade 2026-09-16 när en `git checkout` råkade misslyckas på ägarens maskin.

**Separationen ÄR gjord.** Grenen `nortropic/platform-integration-20260910` i
`~/nortropic-repos/nortropic-system` ligger **55 commits före `origin/main`, 0 bakom**,
opushad, spann 2026-09-09→09-12 — exakt den vecka `drift.md` bar noll rader. Commit
`49cc495` är ägarbeställd: *"bryt ut webbförvaltningen till separat repo"*. 377 filer,
+15 022/−90 414. Mätt på grenen: **0 webbfiler**, registret bär EN post som är kärnans
egen invariantgrind, `platform-separation-final-exit` ger **exit 0**.
**`03-raddningsplan.md` steg 4 och 5 är därmed utförda** — de ska landas, inte byggas.
Diagnosen av `origin/main` står oförändrad (79 webbfiler kvar där).

**Och grinddefekten är strukturell, inte en H-039-egenhet.** Tre av grenens nya grindar
är röda, alla på `frozen_*_identical_to_<bas>` — de kräver byte-identitet med ett träd
från 09-10 som ligger 40–48 commits bak med 5–7 ändrade `verify/bin`-filer. De är
dessutom kedjade till varandras exakta poängsummor. **Samma mekanism som H-039:s 30
omfrysningar, nu på sex oberoende grindar.** Facit i samma katalog:
`platform-separation-final-exit` är GRÖN trots 40+ commits, eftersom den prövar *att
webbträdet är borta* i stället för *att allt är identiskt med commit X*.
**Doktrinregel iv är därmed paketets viktigaste post med bred marginal.**
Detaljer i `docs/loop/drift.md` 2026-09-16.

**En TRETTONDE, och den avgjorde att detta paket fick en MEKANISM.** Samma artefakt —
webb-bundlen — beskrevs med **tre olika tal på tre ställen**: `365/325` i `02-bevis.md`,
`345/320` i `06-inventering.md`, `337/311` i `00-LAS-FORST.md`. De två första var kvar
från tidigare bundle-generationer. Mätt ur artefakten gäller **337 commits / 311 filer /
noll kernelfiler**. Ingen läsning hade hittat det; det syntes först när talen jämfördes
**mot varandra och mot artefakten**. Därför finns nu
`artefakter/validera-underlaget.sh`: 37 påståenden, verdikt per rad, exit 0/1/2. Den är
mutationsprövad — fel förväntat tal ger `AVVIKER`+exit 1, saknad gate ger `ODÖMBART`+exit
2, och ingendera blir tyst grön.

**En TOLFTE, hittad genom att köra mekanismen i stället för att läsa den.** Underlaget sa
på tre ställen att dokumentationspatchen bär *tre* commits. Den bär **fyra** — den
fjärde är den som fredar kernelfilerna i `scripts/` och `tests/`. Tappas den är
webbextraktionen fortfarande fel, alltså precis det fel commiten infördes för att rätta.
Upptäckt när en `git push` misslyckades och patchen kontrollerades i stället.

**En ELFTE — och den gäller inget repo alls.** Ägaren påpekade 2026-09-16 att *"mycket
finns lokalt på datorn"* och att det finns ett **backup-repo**. Underlaget hade då
inventerat exakt **ett repo** och tyst behandlat det som systemet. Det är fel: premissen
i `00-VAD-NORTROPIC-AR.md` gäller ett operativsystem, och ett sådant bor inte i en
git-historik. Repots egen dokumentation motsäger dessutom sig själv om det lokala
tillståndet — `byggplan-v3.md` säger att systeminstallationen är *"arkiverad, ej
avvecklad"*, beslutsloggens Pass 1 säger att den är **riven** och att den ersätter den
raden. Ingen mekanism upptäckte driften. **Backup-repot är inte identifierat** och syns
inte bland kontots 15 repon; är det inte en delmängd av `origin/main` är hela
inventeringen mätt mot fel historik. Nytt krav: `06-inventering.md` **§0c**.

**En TIONDE, och den är den mest substantiella i hela underlaget: jag hade beskrivit fel
orsak till projektets dyraste problem.** Underlaget sa att rundorna brinner på
**miljödrift** — `st_dev`, dev_t, `com.apple.provenance`. Det var härlett ur **ordvalet**
i commit-titlar. Omhärlett ur **grindfilens egen historik** ser mekanismen annorlunda ut:
`verify/bin/h-039-exit` ändrades i var och en av sina 30 commits, från 200 798 till
2 136 969 byte, **noll minskningar**. Kandidaten prövades aldrig mot ett oförändrat prov.
Konvergens kräver ett fast mål; det har aldrig funnits ett. Och diskriminanten är mätbar:
**varje klar task har en grind som rörts ≤ 3 gånger, varje icke-klar en som rörts
17–147.** Ingen mellanform. Detta ändrar `01-lagesbild.md` §1, lägger till doktrinregel
**iv** i `03-raddningsplan.md` steg 1b (omfrysningsbudget) och skriver om
`09-task-rundtrampsvaktens` gren 2 — den mätte filstorlek, vilket är följden, inte
mekanismen.

**En NIONDE, och den gäller kernelgatarna.** Underlaget påstod fyra gånger att `h-014`
är *"byggbar i dag, alla beroenden gröna"*. Det var härlett ur att gate-FILEN finns, inte
ur att den PASSERAR. Prövat: `bash verify/bin/h-013-exit` ger exit 1. Felen är dock
**plattformsbundna** — `undefined symbol: sysctl`, Darwin mot glibc. **18 av 24
kernelgatar faller i en Linux-container.** Korrekt verdikt är `OVERIFIERAT`, och
konsekvensen är större än en rättelse: **§0:s metod "kör grinden" fungerar inte i molnet.
Ominventeringen måste köras på Macen.** Detaljer i `10-forsta-arbetspaketet-h014.md` §2.

**En åttonde, och den gäller varje `23/23 gröna` i detta underlag.** Vaktsviten är grön
bara i ägarens klon: `check-foundation-smoke.mjs` faller i varje färsk klon eftersom
`tests/fixtures/foundation/kontroller.sh` kräver att `origin` är
`Nortropic/nortropic-system`. Verifierat på **ren main, utan några ändringar** — resultat
`FAIL — 1 av 23`. Grinden prövar miljön, inte mekanismen; samma sjukdom som H039:s
`st_dev`. **Codex kommer att se detta första dagen och får inte starta en runda på det.**
Detaljer i `05-arbetsordning.md` §4.

**En sjunde: `config/` bär sju kernelfiler** som `h-031`, `h-032`, `h-035` och
`controller/authority/core.py` läser — och de låg också i bundlen. Tre kataloger i rad
(`scripts/`, `tests/`, `config/`) har antagits enhetliga och inte varit det.
**Kataloger är inte lager.** Därför kräver `06-inventering.md` §0 nu en fullständig
fil-för-fil-revision, inte stickprov. Bundlen är omgjord ur den klassificeringen och
verifierad: noll kernelfiler.

**En sjätte hittades 2026-09-16 — i en artefakt som redan var levererad.** Webb-bundlen
inkluderade hela `scripts/`, och fem kernelfiler följde med, däribland
`scripts/nortropic-codex-autopilot.py` (2878 rader, `allowed_write`-mål för h-031/032/035).
`scripts/` och `tests/` är **BLANDADE**, inte webb. Facit i `06-inventering.md` §0b;
bundlen omgjord. Felet upptäcktes av en ägarfråga, inte av ett prov.

**En femte hittades 2026-09-16 — i det här underlaget.** En tidigare version påstod
*"16 av 23 vakter läser webbträdet, noll läser kärnan"*. Kärnsiffran var fel: grepet
krävde inledande citattecken och missade alla tre kernelreferenserna. Rätt siffra är
16 / 2 / 1 / 4, och två äkta kernelvakter finns (`check-provanropare.mjs`,
`check-verifierarregistret.mjs`).

**Det gäller alltså detta underlag också.** Det är nu självt ärvd inramning för nästa
session. Varje siffra i `02-bevis.md` och `06-inventering.md` står med kommandot som
återskapar den — men **att köra om samma kommando räcker inte.** Det reproducerar
metodens blinda fläckar; vaktfelet ovan kom av ett grep, och samma grep ger samma fel
igen.

**`06-inventering.md` §0 är därför obligatorisk före all planering:** härled varje
bärande påstående med en ANNAN metod, helst beteendemässig i stället för lexikal, och
dokumentera utfallet i `docs/loop/drift.md` med datum och verdikt. Underlaget är
evidens, inte evangelium.

**Dra inte slutsatsen att resten är kontrollerat.** Bara dessa tretton är prövade. Varje
annat påstående i `docs/00`–`06`, `README.md` och `AGENTS.md` om vad en mekanism GÖR
ska behandlas som oprövat tills du kört mekanismen.

**Och räkna med att det finns fler.** Tretton fel hittades på tre dagar, nio av dem i ett
underlag som skrevs just för att vara korrekt. **Frekvensen sjönk inte mot slutet — de två
senaste hittades samma dag som paketet skulle överlämnas.** Ett fjortonde fel är det
rimliga antagandet, inte det oroliga. Kör provet; det är billigare än att läsa.

Detta är samma fel som `docs/agentoverlamning.md` §3 varnar för, en nivå upp: där
gäller det vakter som prövar vad utdata SÄGER; här gäller det dokumentation som
beskriver vad en mekanism ANTAS göra. Ingen vakt tittade på den nivån.

## Prioritetsordning — läs denna innan du börjar någonstans

Ordningen är inte godtycklig. Den följer vad som faktiskt förbrukar projektets budget.

0. **Nollmät kontinuiteten** (`05-arbetsordning.md` §7) — **före** allt annat. Ett
   misslyckat prov är en giltig nollmätning; utan den går ingen förbättring att bevisa.

   **Och avgör backup-repot i samma svep** (`06-inventering.md` §0c). Är det inte en
   delmängd av `origin/main` är hela inventeringen mätt mot fel historik, och då är
   allt nedan preliminärt. Det är två git-kommandon.
1. **Lås acceptansfilen** (`07-v1-acceptans.md`) och **bygg slutgrinden
   `verify/bin/autonomous-loop-exit`, samt rätta frysningsdoktrinen.**
   Grinden specificerades 2026-08-10 och **byggdes aldrig** — den refereras i
   `AGENTS.md`, roadmapens steg L, evidenskontraktet och beslutsloggen, men finns inte
   bland de 29 filerna i `verify/bin/`. Utan den finns ingen mekanism som kan säga
   *klart*, och då mäts framsteg i rundor. Det är därför 53 % av historien ligger på
   kontrollplanet med 76 omfrysningsrundor och 101 `NO-CREDIT` utan avslut.
   **Inget ägarbeslut krävs** — se `05-arbetsordning.md` §1.

   **Doktrinregel iv är den tyngsta posten i hela planen** (`03-raddningsplan.md` steg
   1b): en **omfrysningsbudget** per hypotes. Slutgrinden ger programmet ett mål;
   omfrysningsbudgeten ser till att de enskilda hypoteserna har ett mål som **står
   still**. Utan den andra hjälper den första inte — H-031 har 147 grindcommits och
   skulle få 148.
2. **Säkra routningen.** Landa commitsen i `artefakter/`, bygg sedan vakten som gör att
   de inte kan skrivas tillbaka i tysthet.

   **Och läs `06-inventering.md` innan du planerar något arbete.** Den visar att
   `h-015` (supervisor resume) beror mekaniskt på `h-030`, som aldrig skrivits som task
   — den kedjan som arbetas på leder inte fram till målet.
3. **Pröva resten av inramningen.** Se KLASS-varningen ovan.
4. **~~Avgör separationen~~ → GRANSKA OCH LANDA den befintliga grenen.** Separationen är
   gjord och verifierad 2026-09-10 på `nortropic/platform-integration-20260910`, opushad.
   Bygg ingenting; granska, lös FYND 21:s baspinnar, landa.
5. **~~Ge kärnan en egen grindsvit~~ → GJORT.** Registret bär kärnans egen
   invariantgrind sedan 2026-09-10. `invariant-required-exit` exit 0. Kvar: landa den.

Detaljerna, med roll per steg, står i `03-raddningsplan.md`.

## Vad som INTE är fel

Bilden blir falsk utan detta, och den som bara läser diagnosen drar fel slutsats:

- **Ingenjörsdisciplinen är ovanligt hög.** Mutationsprövning, fail-closed,
  `ODÖMBART` blir aldrig grönt, insikten om mekanism kontra utdata — bättre instinkter
  än de flesta kodbaser har.
- **Vakterna fungerar inom sin räckvidd.** De fällde två verkliga fel under
  dokumentationsarbetet 2026-09-14.
- **Arbetsdelningen håller.** 48 commits rörde bara kernelträdet mot 1 bara webbträdet.
- **Att noll kapaciteter står på `PROVEN` är ärligt**, inte ett misslyckande.

Problemet är inte kvaliteten. Det är att kvaliteten riktats mot en yta som inte kan
bli klar, av skäl som står i `01-lagesbild.md` §1.
