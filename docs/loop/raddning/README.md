# Räddningsunderlaget — kärnans lägesbild, karta och slutkriterium

**Landat i repot 2026-09-16.** Skrivet av en Claude-session 2026-09-14/16 på ägarens
uppdrag, efter frågan *"varför kommer vi aldrig i mål?"*.

## Varför det ligger HÄR och inte i en mapp på Macen

Underlagets eget fynd 2 är att `CLAUDE.md`, `README.md` och `docs/agentoverlamning.md`
stod oförändrade sedan klonbaslinjen medan `drift.md` och beslutsloggen skrevs om 38
gånger var — **uppdateringarna gick till det lager bara en pågående session läser, aldrig
till det lager varje ny session läser först.** Ett underlag som bara finns i en tarboll
hos ägaren upprepar exakt det felet, en nivå upp. Om tre veckor klonar någon repot och
paketet finns ingenstans.

Därför bor det i `docs/loop/`, som är kärnans lager, och `CLAUDE.md` + `AGENTS.md` pekar
hit.

## Kör detta först

```bash
bash docs/loop/raddning/artefakter/validera-underlaget.sh    # från reporoten, på MACEN
```

37 av underlagets bärande påståenden prövas mot repot, med verdikt per rad.
`exit 0` = talen stämmer · `exit 1` = underlaget bär ett fel (`AVVIKER`) · `exit 2` =
något kunde inte mätas (`ODÖMBART`, blir aldrig grönt).

Provet är mutationsprövat: fel förväntat tal ger `AVVIKER` + exit 1, saknad grindfil ger
`ODÖMBART` + exit 2, och ingendera blir tyst grön.

**Grönt betyder att talen är desamma som när de skrevs — aldrig att påståendena är
sanna.** Provet återanvänder underlagets egna kommandon och ärver dess blinda fläckar.
Den oberoende omhärledningen i `06-inventering.md` §0 är fortfarande obligatorisk.

**Förväntad baslinje — provet skriver ut den själv.** Här i repot är webb-bundlen och
dokumentationspatchen avsiktligt utelämnade, så två kontroller blir `ODÖMBART` av den
anledningen ensam:

| Plats | På Macen | I Linux |
|---|---|---|
| I repot (`docs/loop/raddning/`) | `ODÖMBART 2` | `ODÖMBART 4` |
| I den fristående tarbollen | `ODÖMBART 0` | `ODÖMBART 2` |

Ett förväntat `ODÖMBART` **tystas aldrig** — det skrivs ut som `ODÖMBART` och exitkoden
förblir 2. Skälet står i provets kod: en kontroll som hoppas över för att artefakten
saknas, och ändå rapporterar grönt, är exakt det fel `check-docs-coherence` en gång bar
(`PASS 26/26` medan tjugo kontroller tyst utgått). Baslinjen finns för att göra
**avvikelsen** läsbar, inte för att ursäkta frånvaron.

Senaste körning i repot: `artefakter/valideringskorning-2026-09-16-linux.txt`.

## Regel 12 — tre prov mot arbete som bara finns på en maskin

```bash
bash docs/loop/raddning/artefakter/inventera-lokalt-arbete.sh   # LÄSER BARA
```

Klassar varje worktree och gren som `I_MAIN` (säkrad), `PA_REMOTE` (säkrad så länge grenen
finns) eller **`FORALDRALOS`** (finns ingenstans på origin — försvinner vid städning).

**Varför den finns:** 2026-09-16 rapporterades sex poster utanför origin. Inventeringen
fann **259**, varav 92 var detached HEAD-worktrees som `git branch` per konstruktion inte
listar. En detached HEAD-commit hålls vid liv enbart av sin worktree.

| Prov | Gör |
|---|---|
| `inventera-lokalt-arbete.sh` | Läser. Domen |
| `radda-lokalt-arbete.sh` | Pushar grenar och föräldralösa HEADs. Additiv, torrkörning som standard |
| `radda-okommitterat.sh` | Säkrar okommitterat arbete via tempindex — **rör aldrig ett arbetsträd** |

Alla tre är mutationsprövade åt båda hållen. De tog 259 → 0.

**Och det talet var ofullständigt (FYND 37, 2026-09-16).** `inventera-lokalt-arbete.sh`
itererade `git worktree list`, som bara ser **registrerade** worktrees, och dömde mot
**lokala** fjärreferenser i stället för mot origin. Den skrev `✅ REGEL 12 UPPFYLLD`
medan tolv commits fanns på en enda maskin — nio i fristående kloner vars objekt inte
existerade någon annanstans. Provet fetchar nu själv alla grenar, `--no-fetch` ger
`ODÖMBART`, och en ny sektion söker fristående kloner. Domen mot origin efter
räddningen: **43 PA_ORIGIN, noll SAKNAS.** Mätningen och de fyra mutationsproven står i
`docs/loop/drift.md`.

## Och kör detta PÅ MACEN innan något byggs

```bash
bash docs/loop/raddning/artefakter/matning-pa-macen.sh    # från reporoten, på MACEN
```

**Läser bara.** Kör h-015:s fjortonhövdade beroendeslutning och jämför mot en inbyggd
Linux-baslinje, så att **deltat** blir läsbart: en grind som är röd i Linux och grön på
Macen är plattformsbunden och alltså frisk; en som är röd på **båda** är ett verkligt fel.

**Varför den finns:** hela vägen till `KERNEL_COMPLETE` vilar på att `h-004`, `h-010`,
`h-013` och `h-016` är KLARA — och det påståendet har aldrig prövats genom att KÖRA
grindarna på rätt plattform. Provet säger rakt ut om kartan håller. Gör den inte det ska
det stå i `docs/loop/drift.md` innan Codex börjar bygga.

Kärnan är **Darwin**-bunden, inte Python-bunden (FYND 31d): `controller/verify/cli` startar
i Linux med Python 3.12, men grindarna faller på `undefined symbol: sysctl`. **Fel maskin
är `ODÖMBART`, aldrig `FAIL`.**

## Läsordning

`00-VAD-NORTROPIC-AR.md` → `00-LAS-FORST.md` → `05-arbetsordning.md` → `01` → `06` →
`07` → `03`.

**Arbetar du redan och vill bara veta vad du gör härnäst:** läs enbart
`05-arbetsordning.md`. Den är självbärande.

## Vad underlaget INTE är

**Det är inte facit.** Tretton felaktiga påståenden hittades under arbetet — **nio av dem
i underlaget självt, efter att det skrivits**, och de två sista samma dag som det skulle
överlämnas. Elva av tretton kom av en **lexikal** metod: ett grep, ett ordval, ett
kommandosvar vars filter aldrig lästes. Varje gång metoden byttes mot en beteendemässig
föll påståendet.

Behandla varje tal här som evidens med ett kommando bakom sig, aldrig som sanning.
Räkna med ett fjortonde fel.

## Innehåll

| Fil | Vad |
|---|---|
| `00-VAD-NORTROPIC-AR.md` | Ägarens definition av vad Nortropic är — auktoritet för allt annat här |
| `00-LAS-FORST.md` | Router, prioritetsordning, de tretton felen |
| `01-lagesbild.md` | Diagnosen, inklusive varför H-039 inte kan konvergera |
| `02-bevis.md` | Varje mätning med kommandot som återskapar den |
| `03-raddningsplan.md` | Fem steg med roll per steg. Doktrinregel iv är den tyngsta |
| `04-fallor-och-doktrin.md` | Grindmekanik, §A-ytor, metodkrav |
| `05-arbetsordning.md` | Den operativa instruktionen — autonomi, slutkriterium, tripwires, blockeringskontrakt |
| `06-inventering.md` | Vägen till klar kärna. §0 ominventering, §0b BLANDADE kataloger, §0c lokalt maskintillstånd |
| `07-v1-acceptans.md` | Vad `Autonomy Kernel v1` betyder — fyra termer som inte är synonymer |
| `08-mekanismer.md` | Hur arbetsreglerna kopplas till befintligt flöde så de FÄLLER |
| `09-task-rundtrampsvakten.md` | Taskspec att frysa (h-040). Har en blockerande designfråga i §2 |
| `10-forsta-arbetspaketet-h014.md` | Första bygget. Redan specad i repot; bara grinden saknas |
| `11-tre-vakter-mot-aterfall.md` | **Mekanismerna mot återfall** — tre vakter, var och en med ett KÖRT positivt kontrollprov |
| `12-arbetsorder.md` | **⭐ ARBETSORDERN.** EFTERARBETE.md:s elva punkter omprövade mot HEAD 2026-09-16: åtta åtgärdade, en utgår, tre kvarstår |
| `PROMPT-TILL-CODEX.txt` | Klistras in som första meddelande till Codex |

**⚠️ LÄS `SEPARATION-20260910/` FÖRE DETTA UNDERLAG — den finns INTE på `main`.**
Den ligger på plattformsgrenen. Leta inte, hämta:

```bash
git fetch origin nortropic/platform-integration-20260910
B=origin/nortropic/platform-integration-20260910
git show $B:SEPARATION-20260910/README.md       # ägarbeslut och allokeringsprinciper
git show $B:SEPARATION-20260910/ALLOCATION.tsv  # 443 filbeslut
git ls-tree --name-only $B SEPARATION-20260910/ # hela katalogen
```

*Sökvägen tillagd 2026-09-16: raden stod tidigare utan den, vilket hade skickat läsaren
att leta efter en katalog som inte finns i klonen.* Separationen bär sin egen
dokumentation: `README.md` (ägarbeslut och allokeringsprinciper), `ALLOCATION.tsv`
(443 filbeslut), `EFTERARBETE.md` (11 mätta kvarvarande bindningar med utpekad ägare) och
proveniens per fil. **Arbetsordern ligger där, inte här.** Detta underlag är bakgrund,
metod och diagnos — och det skrevs delvis utan kännedom om separationens dokumentation,
vilket gav FYND 26: en rekommendation som upphävde ett ägarbeslut.

## ⚠️ Två artefakter är ÖVERFLÖDIGA — använd dem inte

**`artefakter/klassificera-lager.py`** producerade en lagerklassificering på 439 rader.
Den är **ersatt av `SEPARATION-20260910/ALLOCATION.tsv`**: 443 poster, femdelad dom, med
proveniens per fil och ägarens preciseringar. Kör inte skriptet — två klassificeringar som
säger olika saker om samma träd är värre än en, och det är precis den andra-sanning-drift
detta projekt lider av. Filen behålls som spår av hur jag arbetade, inget annat.

**`nortropic-web-extraktion.bundle`** (2,4 MB, ej committad) var mitt utkast till en
webbextraktion. Den är ersatt av verkligheten: webbfabriken ligger sedan 2026-09-16 i
**`Nortropic/nortropic-webbforvaltning`**, utbruten 2026-09-10 med proveniens per fil i
dess `SEPARATION-ORIGIN/PROVENIENS.tsv`. Använd repot, inte bundlen.

Båda misstagen har samma orsak, och den är underlagets viktigaste lärdom: **jag byggde
lösningar på ett problem utan att först läsa den dokumentation som redan låg bredvid det.**
Se FYND 26 i `docs/loop/drift.md`.

## Statusregeln gäller fortfarande

**Denna katalog bär INGEN teknisk status.** Läget står i `docs/loop/drift.md` (nyast
överst) och `docs/05-beslutslogg.md` (aktuell kandidat först). Skriv aldrig en
lägesrapport här — en andra sanning om läget driftar inom ett dygn och är värre än ingen.

Underlaget är analys och plan. Status är drift.md. Blanda aldrig.
