# nortropic-system — arbetskontraktet (Codex läser det direkt, Claude Code via `CLAUDE.md`)
NORTROPIC_INGANG=AGENTS.md-2026-09-17

Detta är en **router**, inte ett regelverk. Reglerna står där de bor; här står var.

## 1. Vad repot är
Nortropics **trust kernel / bootstrap**: `controller/`, `verify/`, `specs/tasks.spec.json`, `docs/loop/`.
Webbfabrikslagret (`agents/`, `skills/`, `packs/`, `backtests/`, `workflows/`, `docs/0x-*`) ligger kvar i trädet
men är inte målet. Kärnans dom är `controller/verify/cli` + taskens frysta `exit_test` under `verify/bin/`,
körda på Macen (Darwin-bundna: fel maskin är `ODÖMBART`, aldrig `FAIL`). `node scripts/kor-vakter.mjs`
säger exakt en sak — webbfabriken är inte söndrad — och är aldrig bevis för kernelarbete (regel 8a).
`scripts/` och `tests/` är blandade kataloger; ägandet avgörs av `SEPARATION-20260910/ALLOCATION.tsv`.

## 2. En hemvist per uppgift
| Uppgift | Hemvist |
|---|---|
| Ordning, beroenden, klart-när | `docs/loop/raddning/VAGEN.md` — den enda filen som säger vad som görs härnäst |
| Läge, återupptagningspunkt, körbevis | `docs/loop/drift.md` (nyast överst); räkna fram läget med `bash docs/loop/raddning/artefakter/helhetsbilden.sh` |
| Beslut, källa, ersättning | `docs/05-beslutslogg.md` (aktuell kandidat först; kärnans egen logg kommer med FAS 1) |
| Arbetsmetod och byggregler | `docs/loop/regler.md` (regel 6 §A, 8a bevis är ytbundet, 11 omfrysning, 12/12a bevarande, 13 rollkataloger) |
| Metoden mot det återkommande felet | `docs/agentoverlamning.md` — pröva vad mekanismen GÖR, inte vad utdata SÄGER |
Status skrivs aldrig här, i `CLAUDE.md` eller i `docs/loop/raddning/` — hittar du status där är det drift.

## 3. Auktoritetsordning
1. `docs/07-konstitution.md` 2. `docs/03-regelverk.md` 3. `docs/loop/regler.md` 4. aktuell task i
`specs/tasks.spec.json` 5. taskens frysta `exit_test` 6. plan- och driftdokument i `docs/loop/`.
Vid konflikt gäller den högre. Återge inte reglerna; peka på källan. De två högsta bär webbfabrikens
sakregler och binder kärnan av beroende (frysta prov läser dem), inte av innehåll.

## 4. Repoidentitet före arbete
Arbetsklon: `~/kernel-arbete` (ren, dagsfärsk: `git rev-list --count HEAD..origin/main` = 0). Före varje
ändring som rör Git- eller trust-state: `git branch --show-current`, `git rev-parse HEAD`,
`git status --short`, `git rev-parse origin/main`; kan remote inte kontrolleras: `ORIGIN_MAIN=OVERIFIERAT`.
`NO_FORCE_SEMANTICS=YES`: aldrig `--force`, `--force-with-lease`, ledande `+`, rebase, amend, reset.
⚠️ Kör ingen grind (`--kor-grindar`, `verify/bin/h-*-exit`) i en klon vars `~/.nortropic/githooks/post-commit`
saknar vakten "länkad worktree" (`bash scripts/installera-hooks.sh --kor` först): grindarna committar i
worktrees i den riktiga klonen.

## 5. Roller — workflow-separation, skyddet är mekaniskt
En roll per tråd/agent: **test-author** fryser specrad och grind (RED före implementation), bygger inget ·
**builder** bygger inom `allowed_write` och ändrar aldrig sin egen frysta grind · **reviewer** (granskare)
är read-only och försöker falsifiera kandidaten · **gate-reviewer** granskar frysningen · **architect**
(read-only) löser `OWNER_DECISION_REQUIRED` internt · **empirical-runner** (read-only) kör slutprov.
Rollseparationen är workflow-separation, aldrig en säkerhetsgräns. Skyddet är mekaniskt: kandidatens
identitet (exakt SHA), `allowed_write` via `controller/policy/cli`, frysta exitprov, registret med sha256-hash
(`controller/verify/cli` kör bara verifierare som står i `controller/verify/register.json` med matchande hash),
attestation. Ett falskt PASS är det regeln förbjuder: `SELF_CERTIFICATION_AS_PROOF=NO` — ingen roll får anföra
sin skill eller sin egen utsaga som bevis; ett grönt exitprov rapporteras med kommando + exitkod.
Innebörden av "den som bygger attesterar eller mergar aldrig sin egen kandidat" är hela publiceringsvillkoret.
Codex startar rollerna som `$nortropic-<roll>` ur `.agents/skills/`; Claude Code: se `CLAUDE.md`.

## 6. Bevarande ≠ publicering (regel 12a)
| | Vad | Trust | Vem |
|---|---|---|---|
| **Bevarande** | commit + push till arbetsgrenen | ingen — en commit är inte en attestation | automatiskt, aldrig en människa |
| **Publicering** | PR, granskning, merge till `main` | hela trustkedjan | kedjedrivaren via §7–8 |
Bevara efter varje avslutat steg och alltid före avslut: `bash scripts/nortropic-autocommit.sh "<vad>"`
(vägrar på main; §A-kontrollens yta enligt regel 6 hamnar i egen `[AUTOCOMMIT][HÖGRISK-OGRANSKAD]`-commit =
bevarad, inte auktoriserad). `.githooks/post-commit` pushar (per klon: `bash scripts/installera-hooks.sh
--kor`), aldrig från länkade worktrees eller utförarcommits, aldrig `main`. Okommitterat eller opushat
arbete är ett fel, inte försiktighet (regel 12).

## 7. Publicering — gällande befogenhet (`LOOP-ÄGARBESLUT-PUBLICERING-V2`)
| Vem | Får publicera |
|---|---|
| rollagent (test-author, builder, reviewer) | **nej, aldrig** |
| kedjedrivaren (autopiloten, eller Claude/Codex i arkitekt-/exekverarroll) | **ja, utan ny prompt per transition**, efter identity/scope/gate/reviewer-kontrollerna |
Scope: hela vägen till `KERNEL_COMPLETE`. Oförändrat: `NO_FORCE_SEMANTICS`, normal merge-commit (aldrig
squash/rebase-merge), frysta `exit_test` är trust authority, relock av repo/base/kandidat/PR-refs före merge,
saknad evidens avvisar, odömbart utfall eller oväntad remote-identitet stoppar fail-closed. Fyra äkta
ägarstopp (VÄGEN §5); allt annat är ditt. Historik: `docs/loop/arkiv/agents-operating-models-v1-v4.md`.

## 8. Före varje merge — mekanismen
`bash scripts/publicera.sh --repo ~/kernel-arbete` vid varje avslutad leverans: (1) ren arbetskopia och HEAD
på origin, (2) PR mot `main`, (3) granskning av **hela** intervallet `main..HEAD` i en **separat process**
(`claude -p` med `.agents/skills/nortropic-reviewer/SKILL.md` + `PR-TILLAGG.md`; aldrig samma tråd som byggde)
med dom `DOM: TILLSTYRKS @<sha>` / `DOM: FYND @<sha> — blockerande: …` postad som PR-review-kommentar,
(4) FYND → åtgärda på samma gren, granska om, (5) merge **endast** om domen bär exakt PR-spetsen och
CI-checkarna `vaktsviten (webbfabriken)` + `skalprov under tests/scripts` (required på `main`) är gröna —
en commit efter domen ogiltigförklarar den. Diffgranskningen körs inte i CI (ägarbeslut 2026-09-17, "Nej i
nuläget" till `/install-github-app`; återstartblock i `granska-pr.yml`); granskningsjobbet blir aldrig
required. Bevarande (`radda/*`, autocommit, autopush) granskas aldrig — det publicerar inget.
Integrationstakt: en leverans = en PR; högst en öppen PR utöver den som granskas; framdrift räknas i
mergade leveranser, inte commits.

## 9. Evidens
Slutrapport enligt `docs/loop/codex-evidence-contract.md`: varje påstående med kommando + exitkod ur samma
session; overifierat märks `OVERIFIERAT`; ett prov bevisar bara det provet läser (regel 8a). Teknisk
ändring och dess drift-/beslutsrad i samma commit (regel 22).

## 10. Frysta ägarkontrakt (pekare — ändras aldrig utan kontraktsmigration)
`docs/loop/harness-substitution-contract-v1.md` (provider-neutral kernel; blob-pinnad av autopiloten; bär
`PRODUCT=NORTROPIC_AUTONOMOUS_WEBSITE_FACTORY` fryst — namnger nedströmskonsumenten, aldrig detta repos
leverans) · `docs/loop/codex-autopilot-v2.md` · `docs/loop/codex-autopilot-v3-full-roadmap.md` ·
`docs/loop/remaining-bootstrap-delegation-v1.md` (grindpinnad; dess scope h-031/h-032/h-035 är avslutat
`OVERIFIERAT`). Backupen: `Nortropic/nortropic-backups` — backuparbete ger en rad i drift samma dag.

## 11. Verktygsspecifikt — Codex
Starta `codex` i `~/kernel-arbete`; `AGENTS.md` laddas automatiskt, ingen prompt klistras in. Roller:
`$nortropic-<roll>`. Icke-interaktivt: `codex exec -C ~/kernel-arbete -s read-only …` (motorn i
`CODEX_CLI_PATH`). Ingen Stop-hook finns för Codex: kör `scripts/nortropic-autocommit.sh` själv före avslut.

## 12. Claude Code — anropsdetaljer (`CLAUDE.md` är en symbolisk länk till denna fil)

- Starta i reporoten `~/kernel-arbete`. `.claude/settings.json` (spårad) kör
  `scripts/nortropic-autocommit.sh` på `Stop` och `SessionEnd` via `$CLAUDE_PROJECT_DIR`. Kontrollera
  laddningen med `/context` (Memory files: `CLAUDE.md` + `AGENTS.md`).
- Rollskillsen i `.agents/skills/` är Codex-format och laddas inte av Claude Code. Samma roll här: läs
  `.agents/skills/nortropic-<roll>/SKILL.md` som instruktion i en **separat agent** (subagent med egen kontext)
  och blanda aldrig roller i tråden. Granskarrollen (AGENTS.md §8) körs av `scripts/publicera.sh` som
  `claude -p` i ren miljö; för hand: separat read-only-subagent + `PR-TILLAGG.md`, aldrig författaren.
- Kärnans grindar döms via `controller/verify/cli` på Macen; en Linuxcontainer eller CI är `ODÖMBART`,
  aldrig `FAIL`. Direkt `bash verify/bin/…` är diagnostik, aldrig kvalificering.
- Sandboxen är öppnad (`LOOP-ÄGARBESLUT-SANDBOX-OPEN`); §A-skyddet (regel 6) är regel + autocommitens
  HÖGRISK-delning, inte OS:et. `sudo`, `git push --force` och `chmod` är nekade av policy.
- Metoden — pröva vad mekanismen GÖR, inte vad utdata SÄGER — står i `docs/agentoverlamning.md`.
  Läs den före första ändringen av en vakt.
