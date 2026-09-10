# Repouppdelning 2026-09-10 — plattform (detta repo) och webbförvaltning

Ägarbeställd lokal uppdelning (direkt meddelande 2026-09-10). Ingen publicering, push,
remote-byte, installation, rootoperation, livekörning eller supervisor resume ingår.

## Bas och identiteter
- Källa: färdiggranskad lokal kandidat `dae90c8fffa7b33e46e61e81de96e89137ff7829`
  (tree `6bac0ec99fcb6ae6b920a6530810d324a343112a`): dokumentövergången (0581dc05) +
  fail-open-rättningen i `run_invariants` (review READY_FOR_LOCAL_QUALIFICATION_ONLY).
- Detta repo: klon med hela historiken; `origin` = `git@github.com:Nortropic/nortropic-system.git`
  (oförändrad). Uppdelningen ligger på grenen `nortropic/platform-separation-20260910`
  ovanpå dae90c8f; originalhistoriken skrivs inte om. Bevarade refs från det gamla
  blandade arbetsträdet finns under `refs/preserved/old-checkout/*` och
  `refs/preserved/invariant-required-contract/*`.
- Webbrepot: `/Users/elinhaggstrom/nortropic-repos/nortropic-webbforvaltning` (nytt, `main`),
  proveniens per fil i dess `SEPARATION-ORIGIN/PROVENIENS.tsv` (blob-OID vid dae90c8f).

## Allokering (fil för fil: `ALLOCATION.tsv`, 443 poster vid dae90c8f)
| Åtgärd | Antal | Innehåll |
|---|---|---|
| PLATTFORM behålls | 119 | `.agents/`, `controller/**`, `verify/**`, `specs/**`, `tests/controller/**`, `tests/scripts/**`, `scripts/nortropic-codex-autopilot.py`, `scripts/check-verifierarregistret.mjs`, `docs/loop/**`, plattformsconfig |
| WEBB flyttas | 317 | `agents/`, `skills/`, `workflows/`, `packs/`, `vendored-skills/`, `backtests/`, `tools/web-quality/`, `tests/fixtures/`, webbskript under `scripts/`, webbconfig (`kallregister`, `research-contract`, `vendored-integrity`, `frusna-kontrakt/`), webbens styr- och verksamhetsdokument (`docs/07-konstitution.md`, `docs/03-regelverk.md`, `docs/05-beslutslogg.md`, `docs/00-borja-har.md`, `docs/agentoverlamning.md`, `docs/0x-*`, `docs/100-dagar`, `docs/arkiv`, m.fl.) och `AUTOPILOT` (stewardtrappans brytare) |
| DELAD kopia | 2 | `scripts/check-invariants.mjs` (registrerad verifierare här; webbens invariantgrind där) och `config/managed-settings.json` (skyddar sökvägar i båda) — byte-lika kopior, källan är plattformens historik |
| OMSKRIVNA instruktioner | 3 | `AGENTS.md`, `CLAUDE.md`, `README.md` — plattformsneutrala här; originalen bevarade i webbrepots `SEPARATION-ORIGIN/original-*` och i Git-historiken |
| OKLART, behålls oförändrat | 2 | `config/README.md` (blandat innehåll), `.gitignore` (vitlista med nu tomma poster) — inte aktiv policy |

Ägarens precisering: konstitution/regelverk/beslutslogg/börja-här/agentöverlämning är
webbförvaltningens äldre styrdokument och hör inte till kernel/bootstrap. Gemensamma
säkerhetsprinciper som gäller plattformen finns mekaniskt i `docs/loop/regler.md`,
`docs/loop/byggplan-v3.md` (§A-mängd), `specs/`, `verify/` och verifierarregistret.

## Bevarande
Det blandade originalet under `/Users/elinhaggstrom/nortropic/` (alla worktrees, evidens,
H039-WIP i `worktrees/test-author-h039-protected-asset-ed584ec3` med avsiktligt NOT_READY-
stopp) är orört. Backup: `/Users/elinhaggstrom/nortropic-backups-20260910/full-20260910T103342Z/`
(tar + manifest + bundles + supplement + external + reports). Fortsatt H039-arbete återupptas
från den bevarade B-arbetskopian; dess spårbara bas `ed584ec3` finns i detta repos historik.

Efterarbete: se `EFTERARBETE.md`.
