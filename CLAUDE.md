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
- **BLANDADE kataloger** — `scripts/` och `tests/` är INTE webb. Kärnans där:
  `scripts/nortropic-codex-autopilot.py` (allowed_write för h-031/032/035),
  `check-provanropare.mjs`, `check-verifierarregistret.mjs`, `kor-styrprov.mjs`,
  `kor-vakter.mjs`, `tests/controller/**`, `tests/scripts/**`. De får aldrig följa
  med när webbträdet flyttas.

**Auktoritetsordning** — identisk med `AGENTS.md`, som Codex läser; håll dem lika:
`docs/07-konstitution.md` → `docs/03-regelverk.md` → `docs/loop/regler.md` → aktuell
task i `specs/tasks.spec.json` → taskens frysta `exit_test` → plan- och driftdokument i
`docs/loop/`. Vid konflikt gäller den högre auktoriteten; återge aldrig reglerna, peka på
källan. Konstitutionens §A utvidgas för kernelarbete av `docs/loop/byggplan-v3.md` §3.1
(`specs/**`, `verify/**`, `controller/**`, `CLAUDE.md`).

De två högsta bär till större delen webbfabrikens sakregler. För kernelarbete är de
bindande som §A-ytor du aldrig ändrar; de operativa byggreglerna står i
`docs/loop/regler.md`.

**Grindarna vaktar olika saker — men sviten är inte enbart webbens.** Av de 23
`scripts/check-*.mjs` refererar 16 enbart webbträdet, **2 enbart kärnan**
(`check-provanropare.mjs`, `check-verifierarregistret.mjs`), 1 båda
(`check-v4-utkast.mjs`) och 4 inget träd alls. `kor-vakter.mjs` och
`kor-styrprov.mjs` läser `controller/verify/register.json`.

`node scripts/kor-vakter.mjs` är alltså **övervägande** webbfabrikens grindsvit och är
inget bevis om en kerneländring — men den är inte tom på kernelvakter, och de två som
finns följer inte med när webbträdet flyttas. Kärnans dom ligger i taskens frysta
`exit_test` under `verify/bin/`. Håll `kor-vakter` grön när du rör dokumentationen eller
webbträdet.

**Läget** står i `docs/loop/drift.md` (nyast överst) och `docs/05-beslutslogg.md` (aktuell
kandidat först). Ingen annan fil bär teknisk status.

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

**Rollseparation** (test-author / builder / reviewer), evidenskrav och push/merge-befogenhet
står i `AGENTS.md`. De rollerna är workflow-separation, aldrig en mekanisk säkerhetsgräns.

**Arbetssättet och det återkommande felet** — att pröva vad utdata SÄGER i stället för vad
mekanismen GÖR — står i `docs/agentoverlamning.md`. Läs det före första vaktändringen.

**Regel 22:** teknisk ändring och dess dokumentation i samma commit. Hemvisten för
kernelarbete är `docs/loop/drift.md` + `docs/05-beslutslogg.md`; rör ändringen
webbfabrikslagret gäller `docs/00-borja-har.md`. Doctor #12(e) är en MODE i
`agents/nortropic-steward.md` — webbfabrikens stewardrevision — och WARN:ar om lagren
driftar isär; den fäller ingenting och är ingen kernelgrind.
