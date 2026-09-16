Detta repo är Nortropics **trust kernel / bootstrap**. Leveransen är kontrollplanet:
`controller/`, `verify/`, `specs/tasks.spec.json` och `docs/loop/`.

**Tre lager, inte två:**

- **Kärnan** — `controller/`, `verify/`, `specs/`, `docs/loop/`. Detta repos mål.
- **Styrlagret kärnan är pinnad till** — `docs/07-konstitution.md` (§A/§B) och
  `docs/03-regelverk.md` (invarianterna, §A1) bär webbfabrikens sakregler och nämner
  kärnan inte alls; varje sökväg §A skyddar ligger i webbträdet. De är ändå bindande
  här, av BEROENDE och inte av innehåll: fem respektive ett fryst exitprov i
  `verify/bin/` läser dem, liksom `controller/verify/cli` och rollskillsen i
  `.agents/`. `docs/05-beslutslogg.md` är genuint delad och kernel-dominerad — tio
  frysta exitprov läser den. Alla tre ändras av människa.
- **Webbfabrikslagret** — `agents/`, `skills/`, `packs/`, `backtests/`, `workflows/`
  och `docs/00`, `01`, `02`, `04`, `06`. Ligger kvar i trädet efter repodelningen,
  beskriver kundflödet och bär en orienteringsrad överst.
- **BLANDADE kataloger** — `scripts/` och `tests/` är INTE webb, men kärnans andel är
  mindre än den såg ut. Kärnans, enligt `PLATFORM_EXACT` i plattformsgrenens
  `scripts/check-invariants.mjs` (PINV-003/005) — den mekanism som faktiskt dömer:
  `check-invariants.mjs`, `nortropic-codex-autopilot.py` (allowed_write för
  h-031/032/035), `check-verifierarregistret.mjs`, `tests/controller/**`,
  `tests/scripts/**`. De får aldrig följa med när webbträdet flyttas.
  **`check-provanropare.mjs`, `kor-styrprov.mjs` och `kor-vakter.mjs` är INTE kärnans**
  (rättat 2026-09-16, FYND 31): `SEPARATION-20260910/ALLOCATION.tsv` dömer alla tre
  `WEB / WEB_MOVE`, och ingen finns på plattformsgrenen, vars `scripts/` bär två filer.
  Att de läser `controller/verify/register.json` gör dem inte till kernelfiler — det gör
  dem till webbvakter som pinnar sig mot kärnans register.

**Auktoritetsordning** — identisk med `AGENTS.md`, som Codex läser; håll dem lika:
`docs/07-konstitution.md` → `docs/03-regelverk.md` → `docs/loop/regler.md` → aktuell
task i `specs/tasks.spec.json` → taskens frysta `exit_test` → plan- och driftdokument i
`docs/loop/`. Vid konflikt gäller den högre auktoriteten; återge aldrig reglerna, peka på
källan. Konstitutionens §A utvidgas för kernelarbete av `docs/loop/byggplan-v3.md` §3.1
(`specs/**`, `verify/**`, `controller/**`, `CLAUDE.md`).

De två högsta bär till större delen webbfabrikens sakregler. För kernelarbete är de
bindande som §A-ytor du aldrig ändrar; de operativa byggreglerna står i
`docs/loop/regler.md`.

**Grindarna vaktar olika saker — men läs vad siffran mäter.** Av de 23
`scripts/check-*.mjs` **refererar** 16 enbart webbträdet, 2 enbart kärnan, 1 båda
(`check-v4-utkast.mjs`) och 4 inget träd alls. **Den fördelningen mäter vad en fil PEKAR
PÅ, inte vad den TILLHÖR**, och de två svaren skiljer sig: `check-provanropare.mjs`
refererar bara kärnan men är ägardömd `WEB / WEB_MOVE`. **Ägandet avgörs av separationen,
aldrig av ett grep.** Kärnans två i sviten är `check-invariants.mjs` (på plattformsgrenen
omskriven till plattformsinvariantgrinden PINV-001–006) och
`check-verifierarregistret.mjs`. *Rättat 2026-09-16, FYND 31: här stod tidigare
`check-provanropare.mjs` i stället för `check-invariants.mjs` — antalet var rätt, paret
fel, och felet var lexikalt.*

`node scripts/kor-vakter.mjs` säger därför **exakt en sak: webbfabriken är inte söndrad.**
Citera den aldrig som bevis för kernelarbete. Mätt 2026-09-16: **noll** av de 23 vakterna
läser `docs/loop/regler.md`, `docs/loop/drift.md` eller `docs/loop/raddning/**`, och
`kor-vakter.mjs` finns inte på plattformsgrenen. Kärnans dom ligger i
`controller/verify/cli` och taskens frysta `exit_test` under `verify/bin/`.

**Och de kräver MACEN — men inte av det skäl som är lätt att tro.** `controller/verify/cli`
kräver Python 3.12+ och startar fint i en Linuxcontainer som har den. Det som fäller är
**Darwin-bindningen**: grindarna faller på `undefined symbol: sysctl` (mätt på `h-013`:
5 PASS, 11 FAIL, alla av den orsaken). Att installera Python 3.12 löser alltså ingenting.
**Fel maskin är `ODÖMBART`, aldrig `FAIL`** — annars bokförs en miljö som ett fel i
kandidaten, och ett ODÖMBART blir aldrig grönt av en grön webbsvit
(`LOOP-RÄTTELSE-VAKTBEVIS`). Håll `kor-vakter` grön när du rör dokumentationen eller
webbträdet.

**Läget** står i `docs/loop/drift.md` (nyast överst) och `docs/05-beslutslogg.md` (aktuell
kandidat först). **Ingen annan fil i detta repo bär teknisk status** — hittar du status
någon annanstans här är det drift; rätta den eller märk den `OVERIFIERAT`.

Regeln gäller repot, och den har **en känd täckningslucka utanför det**: backupens
kontinuitetslager (se nedan) bar 27 commits 2026-09-09→13 medan `drift.md` bar noll
rader. Arbete utanför repot ska därför ändå ge en rad här samma dag — annars är
lägesdokumentet falskt för den perioden, vilket det var för den veckan.

**Vägen till klar kärna** står i `docs/loop/raddning/` — lägesbild, karta, slutkriterium
(`KERNEL_COMPLETE`) och arbetsordning. Läs `raddning/README.md` först; behöver du bara
veta vad du gör härnäst räcker `raddning/05-arbetsordning.md`. Katalogen bär **analys och
plan, aldrig status** — status är drift.md.

Underlaget är evidens, inte facit: tretton felaktiga påståenden hittades under arbetet,
**nio av dem i underlaget självt**, och elva av tretton kom av en lexikal metod som aldrig
prövades mot beteendet. Kör därför
`bash docs/loop/raddning/artefakter/validera-underlaget.sh` innan du lutar ett beslut mot
ett tal där. Den prövar 37 påståenden mot repot; `exit 0/1/2` = stämmer / underlaget bär
ett fel / kunde inte mätas. **Grönt betyder att talen är oförändrade, aldrig att de är
sanna** — den oberoende omhärledningen i `raddning/06-inventering.md` §0 står kvar.

**Backupen** ligger i `Nortropic/nortropic-backups` (repo-ID 1367371291). Den är inte en
kopia av detta repo: git bär katalog, checksummor och återställningskvitton, medan
arkiven ligger som **Release assets och följer inte med en vanlig klon**. Rutinen står i
dess `BACKUP-RUNBOOK.md`. Där finns även ett kontinuitetslager (checkpoints,
Codex→Claude-handoffs, disk-journal) som inte har någon motsvarighet här. **Sker
backuparbete ska en rad om det stå i `docs/loop/drift.md` samma dag** — annars uppstår
en vecka utan spår, vilket hände 2026-09-09→13 (27 commits där, 0 rader här).

**Rollseparation** (test-author / builder / reviewer), evidenskrav och push/merge-befogenhet
står i `AGENTS.md`. De rollerna är workflow-separation, aldrig en mekanisk säkerhetsgräns.

**Arbetssättet och det återkommande felet** — att pröva vad utdata SÄGER i stället för vad
mekanismen GÖR — står i `docs/agentoverlamning.md`. Läs det före första vaktändringen.

**Regel 22:** teknisk ändring och dess dokumentation i samma commit. Hemvisten för
kernelarbete är `docs/loop/drift.md` + `docs/05-beslutslogg.md`; rör ändringen
webbfabrikslagret gäller `docs/00-borja-har.md`. Doctor #12(e) är en MODE i
`agents/nortropic-steward.md` — webbfabrikens stewardrevision — och WARN:ar om lagren
driftar isär; den fäller ingenting och är ingen kernelgrind.
