# Loop-reglerna — bindande för allt kontrollplansbygge

**Beslutade 2026-08-07 · ändras endast av Johnny · gäller `controller/`, `specs/`, `verify/` och loop-PR:er**

Dessa regler styr bygget av kontrollplanet. De ersätter inte
[docs/03-regelverk.md](../03-regelverk.md) eller [docs/07-konstitution.md](../07-konstitution.md) —
systemets 22 regler och konstitutionens §A/§B gäller oförändrat och står över dessa.

1. Inget bygge utan spec-rad i `specs/tasks.spec.json` och exit-test definierat före start.
2. Allt arbete i repot, på gren `nortropic/loop-<id>`, committat per delsteg.
3. Komponenter använder planens namn (skiva 1–9, där 6b/6c/8/9 tillkom via LOOP-ÄGARHAND-16–27; §-referenser). Inga nya kodnamn.
4. Vid fel: fixa och kör om samma test. Bygg aldrig en ny klassificerare eller checkpoint.
5. Ingen sudo. Kontrollplanet körs som användare.
6. §A-mängden i [byggplan-v3.md](byggplan-v3.md) §3.1 rörs aldrig av en loop-task.
   Ändringar där är alltid människa, alltid HÖGRISK-märkt commit.

   **Ett namngivet undantag, 2026-09-16** (`LOOP-ÄGARBESLUT-SUB-SPECS`): Codex får skriva
   `h-027`–`h-030` i `specs/tasks.spec.json`, eftersom delegationens scope namnger
   supervisor resume och sekvensen redan står i det ägarauktoriserade
   `harness-substitution-contract-v1.md`. Villkor: raderna härleds ur kontraktet, hela
   kontraktsflödet i `AGENTS.md` gäller, commiten är HÖGRISK-märkt, och **varje ny task
   deklarerar sin omfrysningsbudget enligt 11a**.

   **Undantaget kommer ur ägarbeslutet, inte ur att sandboxen öppnades.** Att en §A-yta är
   mekaniskt skrivbar sedan `LOOP-ÄGARBESLUT-SANDBOX-OPEN` gör den inte tillåten. Att
   blanda ihop *kan* och *får* är vad `SELF_CERTIFICATION_AS_PROOF=NO` förbjuder.
   För allt annat i §A står regel 6 oförändrad.
7. Docs uppdateras i samma commit som systemändringen (regel 17 + 22).
8. Bevisregeln: varje rapporterat påstående pekar på verktygsbevis ur samma session.
   Overifierat märks OVERIFIERAT. "Klart" sägs aldrig utan kört exit-test.

   **8a. Bevis är ytbundet — ett grönt prov bevisar bara det provet läser.**
   Tillagt 2026-09-16 efter att jag citerat `kor-vakter PASS 23/23` i **tolv** commits
   som inte rörde en enda fil någon av de 23 vakterna läser — inklusive commiten som
   skrev FYND 31, vars hela innehåll är att den siffran inte bevisar kernelarbete.
   Raden hade blivit **ritual i commit-mallen**: en form, inte en mätning.

   | Ändringen rör | Giltigt bevis | Bevisar INTE |
   |---|---|---|
   | `controller/**`, `verify/**`, `specs/**` | taskens frysta `exit_test` + `controller/verify/cli`, **körda på Darwin** | `kor-vakter` |
   | `docs/loop/raddning/**` | `artefakter/validera-underlaget.sh` | `kor-vakter` (noll av 23 läser katalogen) |
   | `docs/loop/drift.md`, `docs/05-beslutslogg.md` | de frysta prov som läser dem (10 respektive 11 st) | `kor-vakter` |
   | `agents/`, `skills/`, `packs/`, `workflows/`, `docs/0x-*` | `kor-vakter` | kärnans tillstånd |
   | Lokalt maskintillstånd | `artefakter/inventera-lokalt-arbete.sh` | allt annat |

   **Provet innan du citerar ett prov:** `grep -rl "<sökväg du ändrat>" <provets källa>`.
   Noll träffar = provet säger ingenting om din ändring, hur grönt det än är.
   Att skriva ut det ändå är att pröva vad utdata SÄGER i stället för vad mekanismen
   GÖR — samma fel en nivå upp, och den här gången av den som skrev regeln.
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
  Bakgrunden står i `docs/loop/drift.md` 2026-09-16 (FYND 29).

  **⚠️ BELÄGGET ÄR OMSKRIVET 2026-09-16 efter FYND 33 — budgeten står, motiveringen inte.**
  Här stod: *"Varje KLAR task har en grind som rörts ≤ 3 gånger (h-016: 1 · h-013: 2 …);
  varje icke-klar 17–147. Ingen mellanform."* Omfrysningstalen är riktiga. **Etiketterna
  var det inte:** körda på Macen i ren klon är `h-016` (1 omfrysning) `11 PASS / 14 FAIL`
  och `h-013` (2 omfrysningar) `8 PASS / 8 FAIL`. De var aldrig klara.

  Implikationen `klar ⇒ få omfrysningar` är alltså **falsifierad**. Den motsatta står kvar
  och är mätt: `h-035: 17 · h-039: 30 · h-032: 120 · h-031: 147`, alla icke-klara.

  **Och den rätta läsningen är mörkare än den jag hade.** Ett fåtal omfrysningar betyder
  inte att grinden blev grön — det betyder att **någon slutade röra den**. `h-016` rördes
  en gång och är röd på fjorton kontroller. Lågt omfrysningstal är ett tecken på ÖVERGIVEN
  hypotes lika gärna som på löst problem, och de två gick inte att skilja åt därför att
  ingen körde grinden.

  **Budgeten 3 gäller oförändrat**, nu som ren stoppmekanism mot trampkvarnen och inte
  som en framgångsmarkör. **Att deklarera en task KLAR utan ett kört, grönt exitprov i
  samma session är förbjudet enligt regel 8 och är det fel som gjorde etiketterna falska.**
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
- **delar §A i en egen commit** märkt `[AUTOCOMMIT][HÖGRISK-OGRANSKAD]`. §A bevaras men
  **auktoriseras inte**: regel 6 står orörd, och granskaren ska antingen skriva en rad i
  `docs/05-beslutslogg.md` eller revertera. Att låta §A-arbete ligga okommitterat vore att
  förlora det för att skydda det
- **pushar aldrig med `--force`**, mergar aldrig, attesterar aldrig
- **är tyst när inget ändrats**, och rapporterar högt när pushen misslyckas

Bevarande kräver alltså aldrig ett godkännande, av någon, någonsin. Behöver du en människa
för att spara arbete har du byggt den felklass detta repo nästan dog av.
