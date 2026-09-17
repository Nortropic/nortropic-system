@AGENTS.md

## Claude Code — endast anropsdetaljer (kontraktet står i `AGENTS.md`, importerat ovan)

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
