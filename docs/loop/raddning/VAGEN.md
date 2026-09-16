# VÄGEN — den enda vägen till `KERNEL_COMPLETE`

**Skriven 2026-09-16 på ägarens uppdrag:** *"vi ska samla underlaget till codex, en
väldefinierad VÄG till slutmålet med allt vad det innebär, köra autonomt, väldefinierat
slutkriterium, väldokumenterad så vi inte hamnar i diket igen."*

---

## KÖR DETTA FÖRST — helhetsbilden räknas fram, den läses aldrig

```bash
bash docs/loop/raddning/artefakter/helhetsbilden.sh
```

Två sekunder. Den skriver ut **hela läget mätt**: står du på rätt maskin och i rätt klon,
vilka av slutkriteriets sex rader som är uppfyllda, och vad plattformsgrenen bär som
`main` saknar. Med `--kor-grindar` kör den även de fjorton (kräver Darwin).

**Varför ett prov och inte ett stycke text.** Ägaren 2026-09-16: *"det första måste ju
vara skapa en bild av helheten, hjälper inte dokumentationen till med det? DETTA är varför
vi snurrar runt i galenskap varje gång."*

Svaret är nej — och det är inte en brist som kan skrivas bort. `docs/loop/raddning/` är
tjugo filer och ~4 000 rader som beskriver helheten på fem överlappande sätt, och **ingen
av dem visar läget**. Ett dokument om ett tillstånd är inaktuellt dagen efter; det är
precis därför status bor i `drift.md` och ingen annanstans. Helheten måste alltså räknas
fram varje gång.

Provet påstår aldrig ett grindutfall det inte kört: utan `--kor-grindar` står det *"kräver
körning"*, och på fel plattform `ODÖMBART`. Aldrig `PASS`.

*Redan vid första körningen fångade det ett eget fel: ett `grep` på `"h-030"` räknade
`h-015`:s `depends_on` som en existerande task och rapporterade `1/4` där sanningen är
`0/4`. Rättat till att räkna id ur specen. Samma lexikala felklass som gav elva av
underlagets tretton fel — skillnaden är att provet prövades innan det anfördes.*

---

## §0. Vad denna fil är, och vad den ersätter

**Detta är den enda filen i repot som säger vad som görs härnäst.** Läser du en ordning
någon annanstans är den upphävd.

Anledningen till att filen finns: fem dokument beskrev var sin ordning, och alla fem
lät auktoritativa.

| Fil | Sa | Gäller nu |
|---|---|---|
| `03-raddningsplan.md` steg 1 | *"Bygg slutgrinden först"* | **Analys.** Ordningen upphävd → FAS 8 här |
| `10-forsta-arbetspaketet-h014.md` | *"Första arbetspaketet: h-014"* | **Arbetspaket.** Inte första → FAS 5 här |
| `12-arbetsorder.md` steg 1–4 | separationens landning | **Analys och delplan.** → FAS 1B här |
| `06-inventering.md` §1 | bootstrap-kedjan `h-039→h-038→h-032→h-031` | **Upphävd** — de tre är avslutade `OVERIFIERAT` |
| `PROMPT-TILL-CODEX.txt` ORDNINGEN | pekar hit | Ingången. Läs den först, den bär körbanan |

De filerna behåller sin **analys** — den är god och dyrt köpt. De har förlorat sin
**ordning**. En andra sanning om vad som görs härnäst är exakt det dike vi kört i.

**Status står aldrig här.** Läget står i `docs/loop/drift.md` (nyast överst) och
`docs/05-beslutslogg.md`. Denna fil bär vägen, inte positionen på den.

---

## §1. Slutmålet, ordagrant och mätbart

> **`KERNEL_COMPLETE`** — Nortropic tar ett accepterat uppdrag ur sin egen backlog,
> utför det obevakat inom givet mandat, verifierar mekaniskt mot fryst `exit_test`,
> attesterar, publicerar via guarded merge, och **återupptar efter avbrott med avsikt,
> underlag, beslut och läge intakta** — bevisat på Nortropics eget utvecklingsarbete
> (Customer Zero), utan att någon människa återberättar sammanhang.
>
> — `00-VAD-NORTROPIC-AR.md`, ägarens definition

`Autonomy Kernel v1` är **samma sak**. Det är inte `FULL_ROADMAP_SOFTWARE_COMPLETE`, inte
`Bootstrap-frisläppning` och inte `Första autonoma start` — fyra begrepp som inte är
synonymer (`07-v1-acceptans.md` §1).

### Den mekaniska checklistan

`KERNEL_COMPLETE` är nått när **allt** nedan är sant och varje rad har ett kommando
bakom sig:

| # | Krav | Prov | Läge |
|---|---|---|---|
| 1 | `h-015`:s beroendeslutning grön | `h-001`…`h-013`, `h-016` — fjorton grindar | **8 av 14** |
| 2 | `h-014` har en fryst grind som passerar | `verify/bin/h-014-exit` | **grinden saknas** |
| 3 | `h-027`–`h-030` finns som task med fryst grind | `specs/tasks.spec.json` | **inte specade** |
| 4 | `h-015` har en fryst grind som passerar | `verify/bin/h-015-exit` | **grinden saknas** |
| 5 | Programdomen finns och är grön | `verify/bin/autonomous-loop-exit` | **saknas** |
| 6 | Acceptansfilen finns | `docs/loop/autonomy-kernel-v1-acceptance.md` | **saknas** |

**Sex rader. Ingen bedömning i någon av dem.** Klart är när de sex är gröna — inte när
det känns klart, inte när en etikett säger KLAR.

**Och den fällan är mätt:** fyra task bar etiketten KLAR för att grindFILEN fanns. Körda
på Macen var tre av fyra röda (FYND 33, bekräftat på `main` 2026-09-16 21:59). *Att HA en
grind är inte att PASSERA den.*

---

## §2. Körbanan — var arbetet sker

Maskinen bär **fem kloner** av detta repo och ~290 kataloger som ser ut som repot. Fyra
av fem är fel plats, och den mest närliggande är sämst.

**Maskin: Macen. Darwin. Ingen annan.** Kärnan är Darwin-bunden, inte Python-bunden
(FYND 31d): `controller/verify/cli` startar i Linux med Python 3.12, men grindarna faller
på `undefined symbol: sysctl`. **En Linuxkörning är `ODÖMBART`, aldrig `FAIL`.** Bokför
aldrig en miljö som ett fel i kandidaten.

**Katalog: en färsk klon.** Gör den själv, så du vet vad du har:

```bash
git clone git@github.com:Nortropic/nortropic-system.git ~/kernel-arbete && cd ~/kernel-arbete
```

**Använd aldrig dessa** — skälet är mätt, inte antaget:

| Katalog | Varför inte |
|---|---|
| `~/nortropic/nortropic-system` | HEAD från **10 augusti**, 228 worktrees, nio kvarlevor 7–19 dagar äldre än origin. Ser auktoritativ ut, mäter ett fem veckor gammalt träd. **Dit hamnar man av vana** |
| `~/nortropic/worktrees/**`, `~/nortropic-repos/work/**` | Grindarna skapar egna worktrees. Nästlade ger sju falska röda (FYND 32). Spärren i provet släpper dessutom igenom de ~30 som är fristående kloner (FYND 37) |
| `~/nortropic-repos/nortropic-system` | Står på plattformsgrenen, inte `main` |
| `~/nortropic-kontrollklon` | Fungerar, men är ägarens mätklon |

**Fyra rader före varje grindkörning:**

```bash
git rev-parse --show-toplevel                    # är jag där jag tror?
[ -d .git ] && echo "riktig klon" || echo "WORKTREE — FLYTTA DIG"
git fetch -q origin main && git diff --quiet HEAD origin/main \
  && echo "dagsfärsk" || echo "STALE — pulla"
git status --porcelain | wc -l                   # ska vara 0
```

*En grindkörning på ett stale eller smutsigt träd producerar tal som ser ut som evidens.
Det är den dyraste sortens fel i detta projekt.*

---

## §3. Läget, mätt — inte påstått

**Kört 2026-09-16 21:59 på Darwin, ren klon, `main` (`28ca1af`), `0` okommitterade filer
före och efter.** Konfunderingen mot en arbetsgren är därmed upphävd.

```
RAD: h-001:0 h-002:0 h-003:0 h-004:1 h-005:0 h-006:0 h-007:0 h-008:0
     h-009:1 h-010:0 h-011:1 h-012:1 h-013:1 h-016:1
8 PASS · 6 FAIL · 0 ODÖMBART av 14
h-003 och h-010 vände till grönt mot Linux — plattformsbundna, friska.
SEX röda på BÅDA maskinerna.
```

### De sex röda har TVÅ rötter, inte sex

```
h-004 ← h-001 (GRÖN)                      ROT 1 — fristående
h-009 ← h-005, h-006, h-008 (ALLA GRÖNA)  ROT 2 — fristående
h-012 ← h-009
h-011 ← h-004, h-009
h-013 ← h-009, h-012
h-016 ← h-011, h-012, h-013
```

Fyra av sex ligger **nedströms**. Ingen rot beror på något rött. Grafen är läst ur
`specs/tasks.spec.json`, inte ur prosan.

**Detta är en hypotes, inte ett faktum.** Grafen är fakta; att symtomen liknar varandra är
en svagare signal, och samma session gissade fel om sju röda grindar tre timmar tidigare.
**Därför följer ordningen av provet, inte av tron.**

---

## §4. VÄGEN

### FAS 0 — Mät plattformsgrenen. Detta kan korta vägen dramatiskt.

**Lagningen till `h-009` kan redan finnas skriven.** Mätt 2026-09-16:
`controller/launch/cli` **skiljer sig** mellan `main` och
`nortropic/platform-integration-20260910`, och skillnaden är elva rader som gör exakt det
`h-009` K8 klagar på:

```python
# Målet ska köras i det upplösta workspacet, oberoende av anroparens cwd.
try:
    os.chdir(ws)
except OSError as exc:
    return svar(f"launch_failed: kunde inte byta arbetskatalog till workspacet {ws}: ...")
```

`verify/bin/h-009-exit` är **bytesidentisk** på båda grenarna. Det ger ett rent
kontrollprov: **samma grind, två versioner av komponenten.**

```bash
git clone --branch nortropic/platform-integration-20260910 \
  git@github.com:Nortropic/nortropic-system.git ~/kernel-gren && cd ~/kernel-gren
bash docs/loop/raddning/artefakter/matning-pa-macen.sh
```

| Utfall | Betyder | Gör då |
|---|---|---|
| `h-009` **grön** på grenen | Lagningen finns och fungerar | FAS 1A: implementera samma ändring på `main` |
| `h-009` **röd** på grenen | Lagningen räcker inte | FAS 1A: bygg den, med grenens ändring som utgångspunkt |

**Kör om alla fjorton, inte bara `h-009`.** Grenen bär även ändringar i
`controller/policy/cli` (64 rader), `controller/verify/cli` (163) och `register.json`.
Vad de gör åt de övriga fem är omätt — och en omätt sak ska mätas, inte gissas.

> ⚠️ Grenen saknar `workflows/nortropic-verify-suite.js`, som finns på `main`. Grindarna
> körs direkt (`bash verify/bin/h-NNN-exit`) och behöver inte registret, men blir något
> `ODÖMBART` på grenen är det den troliga orsaken. `ODÖMBART` är aldrig `FAIL`.

---

### FAS 1A — `h-009` grön. ⭐ Vägens första bygge.

**Varför just denna:** `h-009` är den ena roten och den enda som har nedströms. Dess tre
fel säger samma sak tre gånger:

| Kontroll | Fel |
|---|---|
| `K2` kuvertet når processen | **exit 127** — kommandot fanns inte |
| `K8` workspace | processen kördes i **reporoten**, inte i workspacet |
| `K9` kuvertleverans | processen hittade **inget kuvert** |

Det är **en** sak: barnprocessen startas inte i rätt katalog och får inte sitt kuvert.
Samma primitiv konsumeras av `h-011`, `h-012`, `h-013` och `h-016`, och deras felrader bär
dess signatur (`nonzero_exit kod 1`, `kod=4`).

| | |
|---|---|
| **Komponent** | `controller/launch/cli` (824 rader) |
| **`allowed_write`** | `controller/launch/**`, `tests/controller/launch/**`, `docs/05-beslutslogg.md`. **Ingenting annat** |
| **Grind** | `verify/bin/h-009-exit` — **rörs inte** |
| **Budget** | 3 omfrysningar (regel 11a). Överskriden → dela hypotesen eller avsluta `OVERIFIERAT` (11b). **Aldrig en runda till** |
| **Klart när** | `bash verify/bin/h-009-exit` ger `exit 0` på Darwin, i ren klon, på dagsfärsk `main` |

**Ingen `cherry-pick`.** `NO_FORCE_SEMANTICS=YES` förbjuder `--force`, rebase, amend,
reset och cherry-pick. Grenens ändring är **läsunderlag**, inte något som plockas över.

---

### FAS 1B — Provet på tvårotshypotesen. Skrivs ner oavsett utfall.

När `h-009` är grön: **kör om alla fjorton.**

| Utfall | Slutsats | Gör |
|---|---|---|
| Flera av `h-011/012/013/016` gröna | Hypotesen **bekräftad**, vägen är kort | Fortsätt FAS 2 |
| Ingen nedströms vände | Hypotesen **falsifierad** | Skriv det i `drift.md` **samma dag**, root-orsaka var för sig |

**Att skriva ner en falsifierad hypotes är arbete, inte misslyckande.** Elva av tretton
fel i detta projekt överlevde för att ingen skrev ner att de prövats.

---

### FAS 2 — `h-004` grön. En saknad funktion, inte en bugg.

`K8`–`K11` ger genomgående `rc=0 token=[]`: `acquire` **lyckas** men returnerar inget
`lease_id`. Fencing, renew och holder-liveness finns inte. De ska **byggas**.

| | |
|---|---|
| **Komponent** | `controller/lease/**`, `controller/loop/cli` |
| **`allowed_write`** | `controller/lease/**`, `controller/loop/cli`, `tests/controller/lease/**`, `tests/controller/loop/**`, `docs/05-beslutslogg.md`, `docs/loop/drift.md` |
| **Grind** | `verify/bin/h-004-exit` — **rörs inte**. Budget 3 |
| **Klart när** | `exit 0`, och de fjorton körda om |

---

### FAS 3 — Det som står kvar rött.

En task i taget, en fryst grind i taget, budget 3 per hypotes. Ingen ny abstraktion,
inget nytt skyddslager (regel 9).

> ### 🏁 MILSTOLPE A — `14/14` gröna
> `h-015`:s beroendeslutning är grön. **Krav 1 av 6 i §1 är uppfyllt.**
> Detta är det första verkliga delmålet sedan augusti.

---

### FAS 4 — `h-014`. Specen finns, grinden saknas.

`h-014` är **fullt specad** i `specs/tasks.spec.json` och ligger **utanför** kedjan — den
kan byggas parallellt. Arbetspaketet står i `10-forsta-arbetspaketet-h014.md` (läs det som
*paket*, inte som *ordning*).

Rollflödet gäller: test-author fryser grinden, oberoende granskning, builder bygger,
oberoende granskning (`AGENTS.md`). **Grinden fryses innan koden skrivs.**

---

### FAS 5 — `h-027`–`h-030` specade.

`h-015` beror mekaniskt på `h-030`, som **inte finns som task i något repo**. Utan den kan
`h-015` inte ens få en grind som håller.

**Du får skriva dessa fyra rader** i `specs/tasks.spec.json` trots regel 6 — ägaren gav ett
namngivet undantag, `LOOP-ÄGARBESLUT-SUB-SPECS`. Fyra villkor:

1. Raderna **härleds** ur `docs/loop/harness-substitution-contract-v1.md`. De uppfinns aldrig.
2. Hela kontraktsflödet i `AGENTS.md` gäller.
3. Commiten `HÖGRISK`-märks.
4. **Varje ny task deklarerar sin omfrysningsbudget** (regel 11a).

> Befogenheten kommer ur ägarbeslutet, **inte** ur att sandboxen öppnades. Att en §A-yta är
> mekaniskt skrivbar gör den inte tillåten — `SELF_CERTIFICATION_AS_PROOF=NO`.

---

### FAS 6 — `h-015` supervisor resume.

Grind fryses, komponenten byggs, grinden passeras. Detta är **återtaget** — den förmåga
slutmålet namnger ordagrant: *"återupptar efter avbrott med avsikt, underlag, beslut och
läge intakta"*.

> ⚠️ `drift.md` rad 5495 säger *"No supervisor resume is authorized before the entire chain
> is green"*. **Den raden är upphävd 2026-09-16.** Den är prosa, inte ett mekaniskt
> beroende, och specens graf säger något annat. Hade den fått stå hade den blockerat målet
> permanent — inte av en mekanism, utan av en mening.

---

### FAS 7 — Programdomen och acceptansfilen.

`verify/bin/autonomous-loop-exit` byggs **fryst RED först** och blir grön utan att röras.
`docs/loop/autonomy-kernel-v1-acceptance.md` skrivs enligt `07-v1-acceptans.md` §5 — ett
krav per rad, med sökväg till provet.

> ### 🏁 MILSTOLPE B — `KERNEL_COMPLETE`
> Alla sex rader i §1 gröna. Kärnans slut och självbyggets start är samma händelse.

---

### PARALLELLSPÅR — separationens landning

Plattformsgrenen ligger **55 commits före `main`, 67 efter**, och bär kernelarbete:
`controller/policy/cli`, `controller/verify/cli`, `register.json` och `launch/cli`. Den kan
inte mergas förrän de fem flyttade dokumenten är ompekade — `12-arbetsorder.md` steg 1–4,
vars tabell ska **kontrolleras mot HEAD först**; den är daterad och blir osann på samma
sätt som `EFTERARBETE.md` blev.

**Detta spår blockerar inte FAS 1–3.** Kernelarbetet sker på grenar ur `main`.

---

## §5. Autonomikontraktet — vad du gör själv

**Autonomin är redan given.** Sök inte godkännande för det som redan är beslutat; fem
veckor gick åt till att söka godkännanden som fanns (`05-arbetsordning.md` §1).

**Publicering:** rollagenterna publicerar aldrig. Kedjedrivaren publicerar utan ny prompt —
committa, pusha, öppna PR, merga — inom vägen till `KERNEL_COMPLETE` (`AGENTS.md`,
`LOOP-ÄGARBESLUT-PUBLICERING-V2`).

**Fyra äkta mänskliga stopp, allt annat är ditt:**

1. Ändra `docs/07-konstitution.md` eller annan uttryckligt människoägd auktoritet
2. `OWNER_DECISION_REQUIRED` — intern routing till arkitekten, inte till ägaren
3. Utvidga slutmålet — nya krav i §1 kräver uttryckligt ändringsbeslut
4. Något som rör pengar, juridik eller kundlöften

**Regel 5 gäller:** ingen `sudo`. Kontrollplanet körs som användare.

---

## §6. De sex fällorna — var bilen hamnat i diket förut

**1. Etiketten i stället för körningen.** Fyra task bar KLAR för att grindfilen fanns.
Tre av fyra är röda. *Deklarera aldrig en task klar utan ett kört, grönt exitprov i samma
session* (regel 8 + 11a).

**2. Att flytta grinden i stället för att laga koden.** `h-039` gick 30 omfrysningar,
grindfilen växte 200 KB → 2,1 MB, noll minskningar. `h-032`: 120. `h-031`: 147.
Tillsammans 297 omfrysningar, **noll stängningar**. *Konvergens kräver ett fast mål.*
Budget 3, och den är en **stoppmekanism, aldrig ett framgångsmått** — ett lågt tal betyder
att någon slutade röra grinden.

**3. Att läsa vad utdata SÄGER i stället för vad mekanismen GÖR.** Elva av tretton
felaktiga påståenden kom av en lexikal metod: ett grep, ett ordval, ett kommandosvar vars
filter aldrig lästes. *Varje gång metoden byttes mot en beteendemässig föll påståendet.*
`docs/agentoverlamning.md` handlar om detta. Läs det före första vaktändringen.

**4. Ett grönt prov anfört utanför sin yta (regel 8a).** `kor-vakter.mjs` säger **exakt
en sak**: webbfabriken är inte söndrad. Noll av 23 vakter läser `docs/loop/`. Anför den
aldrig som bevis för kernelarbete. Och det gäller inte bara vilka **filer** ett prov läser
utan vilka **objekt** det räknar: inventeringen skrev `✅ REGEL 12 UPPFYLLD` medan tolv
commits fanns på en enda maskin (FYND 37).

**5. Fel maskin bokförd som fel i kandidaten.** Linux ger `undefined symbol: sysctl`.
**`ODÖMBART`, aldrig `FAIL`** — och ett `ODÖMBART` blir aldrig grönt av en grön webbsvit.

**6. En andra sanning om läget.** `drift.md` och beslutsloggen skrevs om 38 gånger var
medan `CLAUDE.md` och `README.md` stod stilla — uppdateringarna gick till det lager bara en
pågående session läser. *Status finns i `drift.md` och `05-beslutslogg.md`. Ingen
annanstans.* Regel 22: teknisk ändring och dess dokumentation i **samma commit** — och om
ändringen gör ett tal osant på annat håll, rätta det i samma commit också.

---

## §7. Vad du gör vid varje varv

1. **Kör körbanans fyra rader.** Rätt maskin, riktig klon, dagsfärsk, ren.
2. **Kör grinden du arbetar mot.** Före ändringen, så du vet var du står.
3. **Bygg inom `allowed_write`.** Rör aldrig grinden.
4. **Kör grinden igen.** Grön = klar. Röd = fortsätt, inom budget.
5. **Kör om de fjorton** när en rot vänder.
6. **Skriv en rad i `docs/loop/drift.md` och en i `docs/05-beslutslogg.md`, i samma
   commit som ändringen.** Med kommandot och exitkoden. Kan du inte kontrollera något:
   `OVERIFIERAT`.
7. **Kör `artefakter/inventera-lokalt-arbete.sh` vid varje överlämning** (regel 12a).

**Och om du hittar ett fel i detta underlag:** rätta det och skriv ner det. Tretton
felaktiga påståenden hittades under arbetet, **nio av dem i underlaget självt**. Räkna med
ett fjortonde. Underlaget är evidens med ett kommando bakom sig — aldrig facit.
