# Loop-reglerna — bindande för allt kontrollplansbygge

**Beslutade 2026-08-07 · ändras endast av Johnny · gäller `controller/`, `specs/`, `verify/` och loop-PR:er**

Dessa regler styr bygget av kontrollplanet. De ersätter inte
[docs/03-regelverk.md](../03-regelverk.md) eller [docs/07-konstitution.md](../07-konstitution.md) —
systemets 22 regler och konstitutionens §A/§B gäller oförändrat och står över dessa.

> **Hur en regel ändras.** Regeln **revideras rent** — den säger vad som gäller nu, inget
> annat. Skälet, citatet och mätningen som fällde det gamla hör hemma i
> `docs/05-beslutslogg.md` (beslutet) och `docs/loop/drift.md` (fyndet). Här står högst en
> rad: *(Skärpt \<datum\>, `LOOP-ÄGARBESLUT-X`.)*
>
> En regel som måste skummas lyds inte.
> *(Konvention 2026-09-16, `LOOP-ÄGARBESLUT-REGELREVISION`.)*

1. Inget bygge utan spec-rad i `specs/tasks.spec.json` och exit-test definierat före start.
2. Allt arbete i repot, på gren `nortropic/loop-<id>`, committat per delsteg.
3. Komponenter använder planens namn (skiva 1–9, där 6b/6c/8/9 tillkom via LOOP-ÄGARHAND-16–27; §-referenser). Inga nya kodnamn.
4. Vid fel: fixa och kör om samma test. Bygg aldrig en ny klassificerare eller checkpoint.
5. Ingen sudo. Kontrollplanet körs som användare.
6. **§A-kontrollens yta** rörs aldrig av en loop-task. Ändringar där är alltid
   människa, alltid HÖGRISK-märkt commit:

   > `CLAUDE.md` · `AUTOPILOT` · `workflows/**` · `tests/fixtures/**` ·
   > `scripts/check-invariants.mjs` · `agents/nortropic-steward.md` ·
   > `docs/07-konstitution.md` · `docs/03-regelverk.md` ·
   > `skills/nortropic-eval/references/eval-rubric.md` ·
   > `skills/nortropic-plan/references/juridikflaggor.md`

   **`controller/**`, `specs/**` och `verify/**` omfattas INTE.** De skyddas av
   `allowed_write` per task, rollseparationen, de frysta exitproven,
   omfrysningsbudgeten och `NO_FORCE_SEMANTICS` — inte av att en människa trycker på
   knappen. *(Skärpt 2026-09-16, `LOOP-ÄGARBESLUT-AUTONOM-KARNA`.)*
7. Docs uppdateras i samma commit som systemändringen (regel 17 + 22).
8. Bevisregeln: varje rapporterat påstående pekar på verktygsbevis ur samma session.
   Overifierat märks OVERIFIERAT. "Klart" sägs aldrig utan kört exit-test.

   **8a. Bevis är ytbundet — ett grönt prov bevisar bara det provet läser.**

   | Ändringen rör | Giltigt bevis | Bevisar INTE |
   |---|---|---|
   | `controller/**`, `verify/**`, `specs/**` | taskens frysta `exit_test` + `controller/verify/cli`, **körda på Darwin** | `kor-vakter` |
   | `docs/loop/raddning/**` | `artefakter/validera-underlaget.sh` | `kor-vakter` (noll av 23 läser katalogen) |
   | `docs/loop/drift.md`, `docs/05-beslutslogg.md` | de frysta prov som läser dem (10 respektive 11 st) | `kor-vakter` |
   | `agents/`, `skills/`, `packs/`, `workflows/`, `docs/0x-*` | `kor-vakter` | kärnans tillstånd |
   | Lokalt maskintillstånd | `artefakter/inventera-lokalt-arbete.sh` | allt annat |

   **Provet innan du citerar ett prov:** `grep -rl "<sökväg du ändrat>" <provets källa>`.
   Noll träffar = provet säger ingenting om din ändring, hur grönt det än är.
   Att skriva ut det ändå är att pröva vad utdata SÄGER i stället för vad mekanismen GÖR.
   *(Tillagd 2026-09-16, `LOOP-ÄGARBESLUT-REGEL-8A`.)*
9. Scope: gör det enklaste som uppfyller exit-testet. Inga oombedda skyddslager,
   frysled, auktorisationskedjor eller framtidssäkring.
10. Kontrollplanet rör aldrig kundflödet. Regel 16 står orörd.

---

## Regel 11 — grinden pinnar EGENSKAPEN, aldrig trädet

**Beslutad 2026-09-16 av Johnny efter FYND 20/21.**

Ett exitprov får binda sig till **det det prövar**. Det får aldrig kräva att repot,
`verify/bin/` eller ett dokument är **byte-identiskt med ett baskommit**.

**Varför, mätt:** `platform-governance`, `platform-control-set` och `launch-cwd` faller
alla på `frozen_*_identical_to_<bas>`. Baserna är från 2026-09-10; grenen ligger 40–48
commits senare med 5–7 ändrade `verify/bin`-filer. De kan inte bli gröna av att arbetet
blir bättre — bara av en omfrysning, som håller till nästa commit. `document-authority`
kan inte ens starta: `RIG_ERROR: subject approved document mismatch: AGENTS.md`.

I samma katalog ligger motbeviset: **`platform-separation-final-exit` är GRÖN** trots 40+
commits, eftersom den prövar *att webbträdet är borta* i stället för *att allt är
identiskt med commit X*.

Samma mekanism bar H-039 genom 30 omfrysningar: grindfilen ändrades i var och en av sina
30 commits, 200 798 → 2 136 969 byte, noll minskningar. **Ingen kandidat har någonsin
prövats mot ett oförändrat prov.** Konvergens kräver ett fast mål.

**Följdregler:**

- **11a. Omfrysningsbudget.** Varje hypotes deklarerar ett tak för hur många gånger dess
  `exit_test` får ändras. Saknas budgeten ska bygget fälla, inte passera.
  **Rekommenderad startbudget: 3** — observerad, inte vald.

  **Vad som räknas — tillagt 2026-09-16, annars förbjuder regeln sin egen åtgärd.**
  Budgeten mäter *målflytt*, inte *underhåll*. En omfrysning räknas efter riktning:

  | Omfrysningen | Exempel | Räknas |
  |---|---|---|
  | **LÄGGER TILL** en förpliktelse | *"exact delta binding"*, *"no-margin maximum"*, ny obligatorisk kontroll | **JA** |
  | **TAR BORT** en miljöbindning | shebang → `env`, trädpinning → egenskapspinning, referens till flyttad fil | **NEJ** — gatereparation enligt 11c |

  **Provet är mekaniskt och kräver ingen bedömning:** `git diff` på grindfilen. Tillkommer
  bindningar räknas omfrysningen; försvinner de gör den inte det. Är diffen blandad
  räknas den — den som vill reparera gör det i en egen commit.

  Utan denna distinktion fäller regeln varje försök att laga en trasig grind, och en
  regel som förbjuder sin egen åtgärd blir kringgången första gången den prövas.

  **Budgeten är en STOPPMEKANISM, aldrig ett framgångsmått.** Mätt: varje icke-klar task
  har en grind rörd 17–147 gånger (`h-035: 17 · h-039: 30 · h-032: 120 · h-031: 147`).
  **Den omvända implikationen gäller inte** — ett lågt omfrysningstal betyder att någon
  *slutade röra* grinden, inte att den blev grön. `h-016` rördes en gång och ger
  `11 PASS / 14 FAIL`.

  **Att deklarera en task KLAR utan ett kört, grönt exitprov i samma session är förbjudet
  enligt regel 8.** Det är felet som gjorde etiketterna falska.
  *(Skärpt 2026-09-16, FYND 29 och 33.)*
- **11b. Överskriden budget stoppar hypotesen.** Arkitekten delar den i mindre med var
  sitt fasta prov, eller avslutar den `OVERIFIERAT`. **Aldrig en runda till.**
- **11c. MÅLFLYTT är ett eget utfall.** Innan `NO-CREDIT` sätts: jämför grinden
  kandidaten byggdes mot med den som dömde. Är de inte bytesidentiska är utfallet
  `MÅLFLYTT` — kandidaten föll inte, mätstickan byttes — och det bokförs mot
  **specifikationen**, aldrig mot kandidaten. Provet är en `git diff`, ingen bedömning.
- **11d. Grindkedjor är förbjudna.** En grind får inte kräva en annan grinds **exakta
  poängsumma** (`g7_platform_control_set_exit_68_of_68`). En stale bas fäller då en
  grind, som fäller varje grind som läser dess utfall.

Detta är en **skärpning**. `NO-CREDIT`-immutabiliteten står oförändrad; det som
tillkommer är ett attributionssteg före den. I dag sätts `NO-CREDIT` utan att någon
prövat om kandidaten ens var inblandad.

## Regel 12 — finns det lokalt, finns det på git

**Beslutad 2026-09-16 av Johnny:** *"I min värld så ska det som finns lokalt, ska finnas
på git."*

Arbete som bara finns på en maskin existerar inte för nästa session, för Codex, för
backupen eller för ägaren. Det är inte en hygienfråga utan projektets dyraste felklass,
och den har nu tre mätta instanser:

| | Vad som var osynligt |
|---|---|
| Ingångsdokumenten | Uppdaterades aldrig medan `drift.md` skrevs om 38 gånger — varje ny session bootade in i fel projekt |
| 2026-09-09→13 | 55 commits på en opushad gren löste separationen och den cirkulära trust-roten. `drift.md` bar **noll rader** den veckan. Upptäcktes först 09-16, av att en `git checkout` råkade misslyckas |
| Backupens kontinuitetslager | 27 commits i ett annat repo, som kärnan inte ens kände till |

**Vid arbetsdagens slut och vid varje överlämning:**

1. Inget okommitterat i arbetsträdet, eller så står det i `docs/loop/drift.md` **vad** som
   ligger halvgjort och **var**.
2. Ingen opushad gren, eller så står grenens namn och syfte i `drift.md` med skälet till
   att den inte är pushad.
3. `[LOCAL]`-märkning är ett kvalificeringsläge, **aldrig ett skäl att inte pusha**. En
   opushad gren är inte skyddad — den är enbart osäkrad.

**Mekaniskt prov:** `git status --short` tomt och `git log --oneline @{u}..HEAD` tomt.
Är de inte det ska drift-raden förklara varför, i samma dag.

### Regel 12a — BEVARANDE är automatiskt. PUBLICERING har kvar varje grind.

**Beslutad 2026-09-16 av Johnny:** *"jag vill att vi har auto commits, inte att ägarhand
eller nåt annat tjafs ska commita, det är därför detta sker."*

Projektet har blandat ihop två saker som inte är samma sak:

| | Vad det är | Trust-innebörd | Vem gör det |
|---|---|---|---|
| **BEVARANDE** | En commit på en arbetsgren, pushad | **Ingen.** En commit är inte en attestation | **Automatiskt. Aldrig en människa.** |
| **PUBLICERING** | Attestation, PR, merge till `main` | Bär hela trust-kedjan | Kontraktsflödet i `AGENTS.md`, oförändrat |

`AGENTS.md` bar `PUSH=NO / MERGE=NO` plus *"Rollagenterna committar/pushar/mergar
fortfarande inte"*. Den regeln skrevs för **publicering** och tillämpades på
**bevarande**. Resultatet är mätt 2026-09-16: ~300 lokala grenar, en `main` 493 commits
efter origin, och veckan med 55 opushade commits som ingen såg på sex dagar. **Regeln
skyddade ingenting och förlorade allt** — rollseparationen hindrar en byggare från att
attestera sin egen kandidat, inte från att spara sitt arbete.

**Mekanismen:** `scripts/nortropic-autocommit.sh`, kopplad för Claude via `Stop`- och
`SessionEnd`-hookarna i `.claude/settings.json` (spårad i repot — en hook som bara finns i
`~/.claude/` upprepar fynd 2), och för Codex via `AGENTS.md`. Den

- **vägrar på `main`** — bevarande hör hemma på en arbetsgren
- **delar §A-kontrollens yta i en egen commit** märkt `[AUTOCOMMIT][HÖGRISK-OGRANSKAD]`.
  Den bevaras men **auktoriseras inte**: granskaren skriver en rad i
  `docs/05-beslutslogg.md` eller reverterar. Att låta sådant arbete ligga okommitterat
  vore att förlora det för att skydda det
- **pushar aldrig med `--force`**, mergar aldrig, attesterar aldrig
- **är tyst när inget ändrats**, och rapporterar högt när pushen misslyckas

Bevarande kräver alltså aldrig ett godkännande, av någon, någonsin. Behöver du en människa
för att spara arbete har du byggt den felklass detta repo nästan dog av.

## Regel 13 — en rollkatalog har en livscykel, och den slutar

**Beslutad 2026-09-16 av Johnny:** *"alltså livscykeln"*, efter att maskinen mätts till
**357 kataloger under `worktrees/` och 52 under `work/`, 5,2 GB**.

Rollseparationen är rätt — den hindrar att den som bygger också dömer. Men den saknade
ett slut. Varje runda av varje hypotes skapade två till fyra kataloger, och ingenting sa
när de var förbrukade. `h-039` gick 30 rundor, `h-032` 120, `h-031` 147.

**Katalogerna är inte ett städproblem. De är kvittot på rundtrampen** — varje katalog är
en runda som inte konvergerade, materialiserad på disk, med ett eget objektlager på 75 MB
när den är en fristående klon.

**13a. En rollkatalog tillhör EN runda av EN hypotes.** Den namnges så att rundan går att
läsa ur namnet — `<roll>-<task>-<runda>-<bas-sha>`. Namnet är gränssnittet mot
livscykeln; ett namn utan runda gör katalogen omöjlig att åldra ut mekaniskt.

**13b. Förbrukad = fyra mätta villkor, aldrig en bedömning.**

| # | Villkor | Mäts med |
|---|---|---|
| 1 | Rundan är avslutad — attesterad, `NO-CREDIT`, `MÅLFLYTT` eller `OVERIFIERAT` | raden i `docs/05-beslutslogg.md` |
| 2 | HEAD finns på origin | `inventera-lokalt-arbete.sh` efter en full fetch |
| 3 | Okommitterat innehåll är säkrat | `radda/smuts-*` med identiskt träd |
| 4 | Ignorerat innehåll är **mätt** och är residue | `git status --porcelain --ignored=matching` |

Villkor 4 tillkom av FYND 38: `.gitignore` är en vitlista, så `git status` och `git add -A`
ser inte det mesta. En katalog vars ignorerade innehåll aldrig lästs är **inte** förbrukad,
hur ren den än ser ut.

**13c. Förbrukad katalog tas bort — det är inte valfritt.** Först katalogen, sedan
`git worktree prune` i huvudroten så registreringen följer med. Additivt bevarande sker
FÖRE borttagningen, aldrig efter.

**13d. Två kategorier får aldrig tas bort på automatik.** Mätt 2026-09-16, FYND 40:

- **Kataloger som inte är git alls.** `intake-v44` (385 MB) och `claude-factory` (132 MB)
  låg bland worktreesen utan någon versionshantering. Ingen git-baserad mätning kan se
  dem, eftersom det inte finns något git att fråga.
- **Repon vars origin inte är GitHub. Mätt: tjugofyra stycken.** Tjugotvå har ingen
  remote alls (`gate-review-final-separation-v5`…`v15`, `qualify-h039-verifier-*`,
  `test-author-separation-v311`, `gate-reviewer-python-authority-*` m.fl.), två pekar på
  lokala bare-repon, och två ÄR sådana bare-repon (`h035-refreeze-origin.git`,
  `h035-placement-origin.git`). Commiten `a288e16` — *"h-035: refreeze av
  verify/bin/h-035-exit"* — finns bara där; kontrollerad mot GitHub svarar den
  `OBJEKTET FINNS INTE PÅ ORIGIN`. Kvällens dom `43 PA_ORIGIN · 0 SAKNAS` räknade aldrig
  någon av de tjugofyra, eftersom filtret krävde att origin innehöll `nortropic-system`.

Båda kräver ägarens beslut. **Ett prov som inte kan se en kategori får aldrig auktorisera
att den raderas.**

**13e. Antalet levande rollkataloger per hypotes är ett mått på rundtramp.** Överstiger
det omfrysningsbudgeten i regel 11a är hypotesen redan i det läge 11b beskriver — dela
den eller avsluta `OVERIFIERAT`. Katalogerna på disk är den tidigaste synliga signalen,
före grindfilens tillväxt.
