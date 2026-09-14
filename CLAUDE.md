Detta repo är Nortropics **trust kernel / bootstrap**. Leveransen är kontrollplanet:
`controller/`, `verify/`, `specs/tasks.spec.json` och `docs/loop/`.

**Tre lager, inte två:**

- **Kärnan** — `controller/`, `verify/`, `specs/`, `docs/loop/`. Detta repos mål.
- **Delat styrlager** — `docs/07-konstitution.md` (§A/§B), `docs/03-regelverk.md`
  (invarianterna, §A1) och `docs/05-beslutslogg.md` (besluten; till största delen
  kernelrader i dag). Bindande för båda lagren, ändras av människa.
- **Webbfabrikslagret** — `agents/`, `skills/`, `packs/`, `backtests/`, `workflows/`
  och `docs/00`, `01`, `02`, `04`, `06`. Ligger kvar i trädet efter repodelningen,
  beskriver kundflödet och bär en orienteringsrad överst.

**Auktoritetsordning** — identisk med `AGENTS.md`, som Codex läser; håll dem lika:
`docs/07-konstitution.md` → `docs/03-regelverk.md` → `docs/loop/regler.md` → aktuell
task i `specs/tasks.spec.json` → taskens frysta `exit_test` → plan- och driftdokument i
`docs/loop/`. Vid konflikt gäller den högre auktoriteten; återge aldrig reglerna, peka på
källan. Konstitutionens §A utvidgas för kernelarbete av `docs/loop/byggplan-v3.md` §3.1
(`specs/**`, `verify/**`, `controller/**`, `CLAUDE.md`).

De två högsta bär till större delen webbfabrikens sakregler. För kernelarbete är de
bindande som §A-ytor du aldrig ändrar; de operativa byggreglerna står i
`docs/loop/regler.md`.

**Grindarna vaktar olika saker.** `node scripts/kor-vakter.mjs` är webbfabrikens
grindsvit — dess vakter läser `agents/`, `skills/`, `packs/`, `workflows/` och den
numrerade dokumentserien. Kärnans dom ligger i taskens frysta `exit_test` under
`verify/bin/`. Håll `kor-vakter` grön när du rör dokumentationen eller webbträdet; den
är inget bevis om kärnan.

**Läget** står i `docs/loop/drift.md` (nyast överst) och `docs/05-beslutslogg.md` (aktuell
kandidat först). Ingen annan fil bär teknisk status.

**Rollseparation** (test-author / builder / reviewer), evidenskrav och push/merge-befogenhet
står i `AGENTS.md`. De rollerna är workflow-separation, aldrig en mekanisk säkerhetsgräns.

**Arbetssättet och det återkommande felet** — att pröva vad utdata SÄGER i stället för vad
mekanismen GÖR — står i `docs/agentoverlamning.md`. Läs det före första vaktändringen.

**Regel 22:** teknisk ändring och dess dokumentation i samma commit. Hemvisten för
kernelarbete är `docs/loop/drift.md` + `docs/05-beslutslogg.md`; rör ändringen
webbfabrikslagret gäller `docs/00-borja-har.md`. Doctor #12(e) är en MODE i
`agents/nortropic-steward.md` — webbfabrikens stewardrevision — och WARN:ar om lagren
driftar isär; den fäller ingenting och är ingen kernelgrind.
