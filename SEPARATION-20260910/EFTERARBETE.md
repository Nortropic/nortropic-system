# Efterarbete i plattformsrepot efter uppdelningen (mätt 2026-09-10)

Inga obligatoriska kontroller har gjorts valfria. Röda utfall nedan är verkliga bindningar
till flyttat webbmaterial och ska lösas genom ordinarie ändringsväg (test-first, allowed_write,
människohand där registret/§A kräver det). Gamla PASS gäller sina ursprungliga subjekt.

| # | Bindning | Mätt utfall | Ägare av rättning |
|---|---|---|---|
| 1 | `scripts/check-invariants.mjs` läser `workflows/*.js`, `agents/`, `skills/` (INV-001/003/005/006/007/008) | `node scripts/check-invariants.mjs` → 0 PASS / 8 FAIL; `verify/bin/invariant-required-exit --subject <repo>` 14/15 (endast `real_verifier_rc0_on_subject` röd) | Människohand (§A-fil + registrerad hash i `controller/verify/register.json`, h-037). Plattformen behöver en registrerad global verifierare utan webbberoende |
| 2 | `controller/verify/register.json` bär webbposten `nortropic-verify-suite` (`startbar:false`) | `controller/verify/cli preflight` → exit 4 "osäker eller saknad registerfil för nortropic-verify-suite" → `controller/loop/cli run` stoppar före lease | Människohand (registret byte-fryst av h-037); kontraktssteg: plattformslane eller register utan webbpost |
| 3 | `controller/verify/cli` `PRETASK_PATHS` och `PLATFORM_DOCUMENTS` pekar på `docs/07-konstitution.md`, `docs/03-regelverk.md` m.fl. | `prepare`/`platform-prepare` faller (authority-root saknas / DOCUMENT_GENERATION) | Test-first-ändring i `controller/verify/cli` (product_paths); plattformens dokumentauktoritet måste bindas till `docs/loop/**` |
| 4 | `verify/bin/document-authority-exit` DOCUMENTS-lista (AGENTS/CLAUDE/README + webbdokument) | `DOCUMENT_AUTHORITY_RIG_ERROR: subject approved document mismatch: AGENTS.md` | Nytt lokalt kontrakt; den gamla grinden gäller sitt ursprungliga subjekt (0581/dae90c8f) |
| 5 | `specs/tasks.spec.json`: h-035 `allowed_write` innehåller `docs/05-beslutslogg.md`, `AGENTS.md`; `defaults.denied_write` innehåller `workflows/**`, `tests/fixtures/**`; ~79 referenser till beslutsloggen i taskrader | Ingen körning; statiskt | Specändring = TA-kontrakt + ägarhand (`specs/**` människohand) |
| 6 | `controller/policy/cli` §A-mängd nämner `docs/07-konstitution.md`, `docs/03-regelverk.md`, `workflows/**`, `tests/fixtures/**`, `agents/nortropic-steward.md`, eval-rubric, juridikflaggor, `CLAUDE.md` | Statiskt; policyn vaktar nu delvis obefintliga paths (harmlöst men missvisande) | Test-first i `controller/policy/**` |
| 7 | `controller/attest/cli` refererar `docs/05-beslutslogg.md` (×5) | Statiskt | Kontroll av vad referensen gör; ev. test-first |
| 8 | `config/managed-settings.json` deny-lista pekar på webbsökvägar i `nortropic-system` | Statiskt; källkopia | Ägare vid nästa installation |
| 9 | `scripts/check-verifierarregistret.mjs` kräver `scripts/check-vaktankare.mjs` (flyttad) | ODÖMBART: ankarfilen saknas | Avgör om vakten hör till plattformen (registret) eller webben (vaktankaret); i dag oanvändbar här |
| 10 | `.gitignore` vitlistar nu tomma kataloger (`agents/`, `workflows/`, `skills/`, …) | Harmlöst | Ägarhand (§A-fil) |
| 11 | `scripts/nortropic-codex-autopilot.py` SUBSTITUTION_BLOBS pinnar tolv dokument inkl. flyttade (`ensure_substitution_authority`) | `selftest(None)` PASS (statisk); en riktig körning mot origin/main kommer att avvisa saknade dokument | Kontraktssteg när plattformens dokumentauktoritet definieras om |

Gröna kvar: `tests/scripts/nortropic-codex-autopilot/publication-callers.py` (4 callers PASS),
autopilotens `selftest(None)` (AUTOPILOT_V4_SELFTEST=PASS), `invariant-required-exit` 14/15,
`check-workflow-parse` (i webbrepot). Kontraktssviterna `tests/controller/*/fall.py` och
`verify/bin/h-0xx-exit` är inte körda i detta pass (kräver sandbox-exec/ägarterminal och
gäller sina frysta subjekt).

Nästa utvecklingssteg (plattform): test-first-kontrakt för plattformens obligatoriska
kontrollmängd utan webbfiler — registrerad plattformsverifierare, `PRETASK_PATHS`/
dokumentauktoritet bunden till `docs/loop/**`, plattformslane i `controller/loop/cli`
enligt substitutionskontraktet — följt av H039-efterföljare i separat yta
(se `~/nortropic/H039-AVSLUTSKRAV-MINSTA-VAG-20260910.md`).

## Not 2026-09-10 (slutseparation)

Tabellen ovan är uppdelningens mätta evidens och ändras inte. Rättningsvägen som anges i ingressen är
historisk: ordinarie ändringsväg är kontraktsflödet i `AGENTS.md` (test-author-frys, oberoende granskning,
builder, oberoende granskning, lokal kvalificering med fryst grind), och slutseparationens bindningar döms av
`verify/bin/platform-separation-final-exit`.
