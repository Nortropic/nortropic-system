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

**⚠️ LÄS `SEPARATION-20260910/` FÖRE DETTA UNDERLAG.** Separationen 2026-09-10 bär sin
egen dokumentation: `README.md` (ägarbeslut och allokeringsprinciper), `ALLOCATION.tsv`
(443 filbeslut), `EFTERARBETE.md` (11 mätta kvarvarande bindningar med utpekad ägare) och
proveniens per fil. **Arbetsordern ligger där, inte här.** Detta underlag är bakgrund,
metod och diagnos — och det skrevs delvis utan kännedom om separationens dokumentation,
vilket gav FYND 26: en rekommendation som upphävde ett ägarbeslut.
| `PROMPT-TILL-CODEX.txt` | Klistras in som första meddelande till Codex |

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
