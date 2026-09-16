# Fällor och doktrin

Allt här är erfarenhet från faktiska fall i detta repo, inte allmänna råd.

---

## Metodkravet — projektets dyraste återkommande fel

**Pröva vad mekanismen GÖR, aldrig vad utdata SÄGER.**

Fyra gånger har en vakt i detta bygge passerat för att den kontrollerade en formulering
i stället för ett beteende (`docs/agentoverlamning.md` §3):

- En vakt som kontrollerade att rapporten skrev *"som förväntat"* — och passerade när
  jämförelsen gjordes alltid-sann.
- En vakt som krävde att ordet `KORREKT` fanns någonstans — och passerade när utsagan
  ströks.
- En vakt som hashade kontroll**namn** — och passerade när predikatet byttes mot `true`.
- En vakt som krävde en **formulering** — och fällde en fil som redan gjorde rätt i
  andra ord.

**Motmedlet är alltid detsamma:** faktorisera ut mekanismen, ge den ett **positivt
kontrollprov** som tvingar den att bevisa att den kan säga NEJ, och lägg till en
**kopplingskontroll** att den faktiskt anropas. En kontrollprövad funktion som kringgås
på anropsstället är död kod.

Fyra gånger till har **dokumentationen** beskrivit en mekanism den aldrig kört. Se
KLASS-varningen i `00-LAS-FORST.md`. Samma sjukdom, en nivå upp.

---

## Verdiktalgebra

`exit 0 = PASS` · `1 = FAIL` · `2 = ODÖMBART`. **ODÖMBART blir ALDRIG grönt.**

- **En tom mängd är ett rent resultat först när ankaret är bevisat.** Tom kravmängd,
  tom integrationslista, tomt fixturunderlag — alla är FEL, aldrig frånvaro av krav.
- **Fail-closed åt rätt håll.** Ett okänt värde får aldrig falla tillbaka på den
  LÖSARE vägen; att gissa sig till lösare krav är att inte ha en grind.
- **Skärpningslagen:** ett paket får smalna av kärnan, aldrig lätta den.
- **En stängd lucka står kvar som rad.** Kravet VÄNDS i stället för att strykas.
- **Syntetisk evidens bär aldrig något till `PROVEN`.**

> **Men se `03-raddningsplan.md` steg 1.** Dessa lagar är riktiga, men riktade mot
> **miljökonstanter** blir de en arbetsgenerator. Det är där trampkvarnen uppstod.

---

## Textfällor i grindarna — dessa har kostat tid på riktigt

**`check-docs-coherence.mjs` har fast nämnare** (`FASTA = 76`, plus rörliga
kontrollskript). Lägger du till eller tar bort en kontroll utan att rätta talet blir
körningen ODÖMBAR. Ändra det medvetet — aldrig för att tysta felet. Vakten är skriven
så därför att en tidig version hoppade över kontroller vars artefakt saknades och skrev
ut den krympta summan som verdikt: `PASS 26/26` medan tjugo kontroller tyst hade utgått.

**Statusstämpeln måste stå inom filens fem första rader.** `check-v4-utkast.mjs` fäller
annars. Detta hände 2026-09-14: en orienteringsrad lades in direkt efter rubriken i
den utkastfil vakten bevakar, och sköt ned stämpeln till rad 6. Lägg orienteringsrader
**efter** stämpelhuvudet i filer som bär ett.

> **Varken filnamnet eller katalogen är utskrivna här, och det är avsiktligt.** Samma
> vakt fäller på att utkastet får en KONSUMENT i det spårade trädet: det är ett
> `NOT_PRODUCTION`-mått och får inte glida in i drift genom att bli refererat. Vakten
> letar efter tre strängar — utkastets filnamnsstam, dess versionssträng och dess
> katalog — i **varje** spårad fil.
>
> **Den fällde detta underlag när det landade i repot 2026-09-16**, och det var korrekt:
> en analysfil som namnger utkastet ÄR en konsument, oavsett att den bara beskriver ett
> fel. Vakten skiljer inte på att nämna och att använda, och den ska inte göra det —
> distinktionen är inte mekaniskt avgörbar. Kör `scripts/check-v4-utkast.mjs` och läs
> `MARKORER` innan du skriver om utkastet i en spårad fil. Den lärdomen kostade två
> vaktfällningar i detta projekt, båda mina.

**`docs/agentoverlamning.md` får inte bära status.** Förbjudna mönster i
`check-docs-coherence.mjs`:

```
\b\d+/\d+ (kontroller|vakter)                       ← inget kontrollantal
(§\d+|[A-ZÅÄÖ][A-ZÅÄÖ0-9]*)-GAP-\d+.{0,40}(STÄNGD|ÅTGÄRDAT|NAMNGIVEN|NOT_STARTED)
\bv\d+\.\d+\.\d+\b                                  ← inget semver
\b(nitton|arton|sjutton|femton|fjorton)\s+(vakter|skivor)
```

Filen **måste** behålla fraserna `aldrig teknisk` och `METODEN och ÄGARENS ARBETSSÄTT`,
och pekaren till `docs/05-beslutslogg.md`. `LUCKSTATUS`-blocket läses av
`check-luckregister.mjs` och får inte brytas.

**§A-anspråk och §A-förnekelse.** En §A-zonad fil får inte säga om sig själv att den
saknar §A-skydd (regex `FORNEKELSE`), och ingen fil får hävda ett skydd grundlagen inte
ger den (`ANSPRAK`). Bakgrund: `docs/kapacitetskatalog.md` påstod om sig själv att
*"ingen mekanisk grind läser den, och den är inte §A-skyddad"* — båda leden falska, och
riktningen den farliga: en fil som säger till sin läsare att den är oskyddad inbjuder
till autonoma ändringar av en människoägd mätstock.

**Svenska teckenklasser.** `\w` missar Å/Ä/Ö och har tyst blindat två kontroller i detta
bygge (`status=OFULLSTÄNDIG` lästes som `OFULLST`; `**ÄGER**` fångades aldrig).

---

## Grindmekanik du behöver känna till

**`kor-vakter.mjs` upptäcker vakter dynamiskt** (rad 91–99) via `git ls-files scripts/`
med filter på `check-*.mjs`. Ingen handlista finns att glömma en vakt ur — och en ny
`check-*.mjs` kopplas in automatiskt.

**Varje vakt måste kvittera sin identitet.** Första utdataraden ska vara
`VAKT: <eget filnamn>`. Skriver en vakt inte sin fras är körningen ODÖMBAR oavsett
exitkod. Bakgrund: `check-vaktankare.mjs` skrevs en gång av misstag över av en kopia av
`check-invariants.mjs`; den påträngande filen körde fel kontroller, avslutade 0, och
batteriet fortsatte grönt i flera steg. **Ett program kan inte intyga att det
fortfarande är sig självt.**

**Undantaget:** vakter registrerade i `controller/verify/register.json` identifieras på
sin **hash** mot pinntabellen i `check-vaktankare.mjs` i stället för på en kvittensrad,
eftersom en kvittensrad i dem vore en skrivning i någon annans låsta yta.

**Ompinning:** `check-vaktankare.mjs --pinna-om` uppdaterar pinntabellen.
`check-paketlinser.mjs --generera` genererar linstabellen in i grindworkflowet.

---

## §A-ytor — vad som är människans hand

Ur `docs/07-konstitution.md` §A och `docs/loop/byggplan-v3.md` §3.1:

```
docs/07-konstitution.md      ← §A8: hela filen, endast människa, alltid HÖGRISK
docs/03-regelverk.md         ← §A1: invarianterna
skills/nortropic-eval/references/eval-rubric.md    ← §A2: mätstocken
skills/nortropic-plan/references/juridikflaggor.md ← §A4
workflows/**                 ← §A3: grindarnas kravnivåer
tests/fixtures/**            ← §A6: regressionsnätets baselines
agents/nortropic-steward.md  ← §A6: styrningen
AUTOPILOT                    ← §A6: kill-switchen
docs/06-scope.md STATUSTABELL · docs/kapacitetskatalog.md   ← §A9
packs/*/manifest.md · research-module.md · gate-lenses.md · strategi/*  ← §A7
scripts/check-invariants.mjs
specs/** · verify/** · controller/** · CLAUDE.md   ← byggplan-v3 §3.1
```

**Ägarens regel för §A:** säger han *"fixa dessa grejer"* om en §A-yta — **gör det**,
men HÖGRISK-märk och citera instruktionen ordagrant i både commit och beslutslogg.

**Skilj tre klasser och namnge vilken det är:**

| Klass | Exempel |
|---|---|
| **(a) Hans beslut på riktigt** | pengar · §A-ytor · mätstocken (eval-rubriken) · frysningsdoktrinen |
| **(b) Operativa gränser** | agenten startar inte agenter, skapar inte extern infrastruktur självmant |
| **(c) Byggbart** | allt annat — och ska då vara byggt, inte listat |

**Testa spärren innan du kallar den en spärr.** Ägaren reagerar starkt när något påstås
vänta på honom, och båda gångerna det hänt hade han rätt: spärren fanns inte längre,
eller så var det agenten som inte tänkt färdigt.

---

## Dokumentationsdisciplin

**Regel 22:** teknisk ändring och dess dokumentation i **samma commit**. Hemvist för
kernelarbete: `docs/loop/drift.md` (nyast överst) + `docs/05-beslutslogg.md`.
Webbfabrikslagret: `docs/00-borja-har.md`.

**Beslutsloggens ordning är "aktuell kandidat först, därefter äldst först"** — står på
rad 16 i filen. Inte "nyast sist", vilket både `CLAUDE.md` och överlämningen påstod
fram till 2026-09-14.

**Bumpa inte `Senast verifierad`-stämplar du inte faktiskt omverifierat.** En bumpad
stämpel påstår en granskning som inte gjorts, och det är samma fel som allt annat i
detta dokument.

**Doctor #12(e)** är en MODE i `agents/nortropic-steward.md` — webbfabrikens
stewardrevision. Den **WARN:ar** om dokumentationslagren driftar isär. Den fäller inget
och är ingen kernelgrind.

---

## Rapportering

Rapportera ett grönt exitprov med **faktiskt kommando + exitkod**. Din egen utsaga är
inte owner-bevis. Kunde du inte kontrollera något: skriv `OVERIFIERAT`. Gissa aldrig,
och gissa särskilt aldrig åt det lösare hållet.

**Och blanda aldrig ihop sviterna i en rapport:** `node scripts/kor-vakter.mjs` är
webbfabrikens grindsvit. Kärnans dom är taskens frysta `exit_test` i `verify/bin/`.
