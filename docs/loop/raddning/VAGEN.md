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

> ⚠️ **Kör inte `--kor-grindar` eller någon `verify/bin/h-*-exit` i en klon där
> `core.hooksPath` är satt förrän hook-vakten är landad** (drift.md 2026-09-17, L1c).
> Grindarna skapar worktrees i den riktiga klonen och committar där; post-commit-hooken
> pushar då fixturgrenar (`h007-prov-<pid>`, `radda/auto-*`) till origin. Kontroll före
> körning: `git config --get core.hooksPath` är tomt, eller hooken innehåller vakten
> "länkad worktree".

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
| `03-raddningsplan.md` steg 1 | *"Bygg slutgrinden först"* | **Analys.** Ordningen upphävd → FAS 7 här |
| `10-forsta-arbetspaketet-h014.md` | *"Första arbetspaketet: h-014"* | **Arbetspaket.** Inte första → FAS 4 här |
| `12-arbetsorder.md` steg 1–4 | separationens landning | **Delplanen för FAS 1**, som mätningen gjorde till huvudspår |
| `06-inventering.md` §1 | bootstrap-kedjan `h-039→h-038→h-032→h-031` | **Upphävd** — de tre är avslutade `OVERIFIERAT` |
| `AGENTS.md` (laddas automatiskt: Codex direkt, Claude via `CLAUDE.md`) | pekar hit | Ingången. `PROMPT-TILL-CODEX.txt` avförd 2026-09-17 (blob `acd132be` @ `eb9483e9`; bar status och återkallade order) |

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

### Två fällor till, mätta natten 2026-09-17

**Kommandon skrivs för zsh, och prövas i zsh.** Macen kör zsh; en Linuxcontainer kör
bash. Tre skillnader fällde tre körningar i rad:

| Idiom | bash | zsh |
|---|---|---|
| `G="git -C d"; $G status` | ordelas → fungerar | **ordelas inte** → `command not found` |
| `"$c:refs/heads/x"` | literal | **`:r` är en modifierare** → refspecen blir `<sha>efs/heads/x` |

Skriv `git` explicit eller använd en funktion, och sätt alltid klammer runt en variabel
följd av kolon: `"${c}:refs/heads/${namn}"`.

**En grindfixtur kan vara riggad att vägra.** `h-039`:s fixturer sätter
`core.fsmonitor=/never/invoked/method-helper` — en sökväg som avsiktligt inte finns,
eftersom testet går ut på att bevisa att hjälparen aldrig anropas. Varje indexoperation i
en sådan katalog dör. Räddning kräver `-c core.fsmonitor=false`.

Det är en egen kategori: **riggad fixtur**. En generisk mekanism som antar att `git add`
fungerar faller på den, och det är inte mekanismens fel — det är att kategorin finns.

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

**Detta skrevs som en hypotes, och den är nu BEKRÄFTAD.** Mätningen 22:43 på
plattformsgrenen, där `h-009` K8 är PASS: `h-011` blev grön, `h-012` gick `9 → 1`
fallande kontroller, `h-016` gick `14 → 3`. **En rot lagad, fyra nedströms följde med.**
Att hypotesen skrevs ner FÖRE provet är det som gör utfallet mätbart i stället för
efterkonstruerat. Rot 1 (`h-004`) är orörd, som väntat.

---

## §4. VÄGEN

### FAS 0 — ✅ GJORD 22:43. Grenen halverar felen.

`controller/launch/cli` skiljer sig mellan `main` och
`nortropic/platform-integration-20260910` med elva rader `os.chdir(ws)` — exakt det
`h-009` K8 klagar på. `verify/bin/h-009-exit` är bytesidentisk på båda grenarna, så
mätningen blev ett rent kontrollprov: **samma mätsticka, två versioner av komponenten.**

Kört på Darwin, ren lokal klon av grenen (`8095d94`), 0 okommitterade före och efter.
Räknat på fallande **kontroller**, inte på grindar:

| Task | main | gren | Δ |
|---|---|---|---|
| `h-004` | 7 | 7 | 0 |
| `h-007` | 0 | **5** | **+5 ⚠️** |
| `h-009` | 3 | 2 | −1 |
| `h-011` | 7 | **0** | **−7 ⬅ GRÖN** |
| `h-012` | 9 | 1 | −8 |
| `h-013` | 8 | 6 | −2 |
| `h-016` | 14 | 3 | −11 |
| **summa** | **48** | **24** | **−24** |

Utan `h-007`: **19**.

**Tvårotshypotesen är bekräftad.** `h-009` K8 är PASS på grenen, och nedströms följde
med precis som förutsagt: `h-011` grön, `h-012` `9 → 1`, `h-016` `14 → 3`. Hypotesen
skrevs ner **före** provet (FYND 34), vilket är det som gör utfallet mätbart i stället
för efterkonstruerat.

**Slutsatsen för vägen:** grenen är närmare `KERNEL_COMPLETE` än `main`. Att bygga om
`h-009` på `main` vore att skriva samma elva rader igen och kasta bort `h-011`,
`h-012` och `h-016`:s förbättringar. **Vägen går genom att landa grenen.**

---

### FAS 1 — ⭐ Landa plattformsgrenen. Vägens första arbete.

Det som tidigare stod som PARALLELLSPÅR är nu huvudspåret. `12-arbetsorder.md` steg 1–4
bär delplanen; **kontrollera dess tabell mot HEAD först** — den är daterad.

**`h-007`:s fem nya röda är den kända efterarbetsbindningen, inte en ny defekt.** Alla
fem är `K1.x §A-orsak — <sökväg> avvisades men orsaken namnger den inte`. Fyra av de fem
sökvägarna finns på `main` och är borta på grenen: `AUTOPILOT`,
`agents/nortropic-steward.md` och två under `skills/` — filer separationen flyttade.

> ⚠️ **Men frånvaro ensam förklarar det inte, och det ska mätas innan du bygger på det.**
> `docs/07-konstitution.md` är också borta på grenen och dess kontroll `K1.6` **passerar**.
> Den femte sökvägen, `workflows/prov.md`, saknas på båda. Sambandet är starkt, inte
> slutet. Root-orsaka `h-007` K1.1 innan du antar att en ompekning löser det.

Det motsvarar `SEPARATION-20260910/EFTERARBETE.md` punkt 4/5/7 — de fem flyttade
dokumenten — alltså arbete som ändå måste göras för att grenen ska kunna mergas.

**Registret blir friskt på köpet:** `controller/verify/cli list` ger på `main` posten
`nortropic-verify-suite` → **`EJ STARTBAR`**. På grenen finns den inte, och
`check-invariants` är startbar.

**Klart när:** `h-007` är grön på grenen och grenen är mergebar mot `main`.

---

### FAS 1B — `h-009` helt grön. Roten är bara halvlagad.

`chdir` löste workspacet. **`K2` och `K9` kvarstår:**

| Kontroll | Fel |
|---|---|
| `K2` kuvertet når processen | **exit 127** — kommandot fanns inte |
| `K9` kuvertleverans | processen hittade **inget kuvert** |

| | |
|---|---|
| **Komponent** | `controller/launch/cli` |
| **`allowed_write`** | `controller/launch/**`, `tests/controller/launch/**`, `docs/05-beslutslogg.md` |
| **Grind** | `verify/bin/h-009-exit` — **rörs inte**. Budget 3 (regel 11a) |
| **Klart när** | `exit 0`, och de fjorton körda om |

Kör om de fjorton efteråt: `h-012` K4, `h-013`:s sex och `h-016`:s tre kan vara samma
rot. Blir de gröna med är kuvertet den sista biten av rot 2. Blir de det inte, har de
egna orsaker — **och det skrivs i `drift.md` samma dag.**

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

### ~~PARALLELLSPÅR~~ — separationens landning är nu FAS 1

*Här stod att separationens landning var ett sidospår som inte blockerade kernelarbetet.
**Upphävt 2026-09-16 22:43:** mätningen visade att grenen halverar de fallande
kontrollerna, 48 → 24, och tar `h-011` grön. Den bär lagningen till rot 2. Att bygga
kernelarbete ur `main` vore att skriva om elva rader som redan finns och kasta bort
`h-012`:s och `h-016`:s förbättringar. Landningen ÄR vägen — se FAS 1.*

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
