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
7. Docs uppdateras i samma commit som systemändringen (regel 17 + 22).
8. Bevisregeln: varje rapporterat påstående pekar på verktygsbevis ur samma session.
   Overifierat märks OVERIFIERAT. "Klart" sägs aldrig utan kört exit-test.
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
  Bakgrunden står i `docs/loop/drift.md` 2026-09-16 (FYND 29). Varje KLAR task har en grind
  som rörts ≤ 3 gånger (h-016: 1 · h-013/017/038: 2 · h-001/036: 3); varje icke-klar
  17–147 (h-035: 17 · h-039: 30 · h-032: 120 · h-031: 147). Ingen mellanform.
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
