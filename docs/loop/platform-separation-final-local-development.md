# Slutseparation av plattformsrepot — lokalt kontrakt (grind + utvecklingsdokument)

**Roll:** TEST_AUTHOR (kontraktsfrys, ingen produkt) · **Datum:** 2026-09-10 · **Bas:** `332f07ceb914a07c6632c1393969d9d5a337566b`
· **Grind:** `verify/bin/platform-separation-final-exit` · **Omfång:** `LOCAL_QUALIFICATION_ONLY`.

Ägarordern (preciserad 2026-09-10): `nortropic-system` ska innehålla ENBART Nortropics
verksamhetsneutrala plattform — Trust Kernel (plattformens tillitsdel som verkställer
behörighetsgränser och verifierar bevis/resultat/övergångar), bootstrap, controller,
plattformens supervisor och deras utveckling/verifiering/dokumentation. All webb-/Digitala-
specifik styrning lämnar plattformens nuvarande bruk: kod, dokument, agentinstruktioner,
skills, vakter, konfiguration, workflows, behörighetsregler och indirekta beroenden. Rent
webbmaterial får inte stå kvar i trädet omdöpt till "historia" eller parkerat i en arkivkatalog;
det bevaras i webbrepot eller evidensarkivet med spårbart ursprung. Plattformens Git-historik
och kärn-/H-evidens stannar; fungerande kärn-/H-arbete tas inte bort för att det bär historiska
webbreferenser (evidensfunktion skiljs från dagens körbara beroenden).

## Enkelt förklarat

Plattformsrepot har sedan uppdelningen fortfarande fyra sorters webbrester: (1) rena
webbstyrningstexter parkerade under `docs/loop/arkiv/` och webbens registervakt
`scripts/check-verifierarregistret.mjs`; (2) aktiva dokument som fortfarande pekar på webbens
konstitution/regelverk/beslutslogg eller kräver "människohand"/ägarstopp (full-roadmap,
substitutionskontraktet, evidenskontraktet, config/README, registrets not, m.fl.); (3)
behörighetsregler och konfiguration med webbsökvägar, den gamla roten
`~/nortropic/nortropic-system` och webbens `denied_write`; (4) autopilotens plan-authority som
hämtas från en origin-gren i det gamla blandade trädet. Grinden mäter att alla fyra är borta
— inte genom en fillista, utan genom att följa hela den aktiva referenskedjan från
routern/skills/spec/cli/autopilot och kräva att inget som nås är webbstyrning, att ingen
referens hänger, att konfiguration och behörighetsregler stämmer med plattformen, att
autopiloten fungerar i en replika utan remote, och att de tre tidigare frysta grindarna ger
exakt förutsagt utfall. Frysta H-grindar, artefakter och historiska beslutsdokument binds
byte-exakt mot 332f07ce; deras historiska webbreferenser är evidens, inte instruktion.

## Avgränsning och roller

- **test-author (denna tråd):** fryser grinden och detta dokument; bygger en förkastad
  referenskonstruktion i scratch för att bevisa att grinden är satisfierbar och fångar de åtta
  återinförandenegativerna (F9). Skriver ingen produkt i repot.
- **oberoende kontraktsgranskning** (`$nortropic-gate-reviewer`, read-only) före builder.
- **builder:** produktytan nedan. Ändrar aldrig `verify/bin/platform-separation-final-exit`
  eller detta dokuments kriterieavsnitt. Överföringen av de fyra filerna till webbrepot är
  redan utförd av roten (webbrepots commit `e4c8c52` med
  `SEPARATION-ORIGIN/transfer-20260910-2/PROVENIENS-2.tsv`); buildern skriver plattformssidans
  proveniensfil och tar bort filerna ur plattformsträdet.
- **oberoende produktgranskning** (read-only), därefter **lokal kvalificering**: grinden körs mot
  kandidaten; PASS finns bara som exitkod 0 med `result.json`.
- Fasgräns: `PUSH=NO`, `MERGE=NO`. Ingen installation av managed-settings (extern ceremoni),
  ingen livekörning, ingen supervisor-resume.
- Codex-/providermaskineriet i autopiloten tas INTE bort i detta kontrakt; substitutionen
  (SUB-1/h-027) är nästa kontrakt. Här binds bara att ingen webbkoppling och ingen gammal
  rot-default finns kvar, och att planens authority ligger i plattformsfrysta kopior.

## Kriterium (effekter)

Grinden körs som `python3.12 verify/bin/platform-separation-final-exit --subject <kandidatrot>`
(valfritt `--held-control-set/--held-launch-cwd/--held-governance <hållen kopia>`,
`--skip-held-gates` i sandboxade körningar — de raderna blir då FAIL, aldrig PASS). Exit 0 =
`PLATFORM_SEPARATION_FINAL_RESULT=PASS_LOCAL_QUALIFICATION_ONLY`, exit 1 = RED, exit 2 = riggfel
(`PLATFORM_SEPARATION_FINAL_RIG_ERROR=`). Varje rad skriver `PASS <rad>`/`FAIL <rad>`;
`FIXTURE_ROOT=<scratch>` bär `result.json` med subjektets HEAD, alla spårade filers sha256, den
nådda slutningen och de hållna grindarnas körningar. Subjektets bytes är oförändrade efteråt.

### F1 — trädallowlist, obligatoriska frånvaron, proveniens
- `f1_every_tracked_file_matches_platform_allowlist`: varje spårad fil vid HEAD matchar
  prefixen `.agents/skills/`, `SEPARATION-20260910/`, `config/`, `controller/`, `docs/loop/`,
  `specs/`, `tests/controller/`, `tests/scripts/`, `verify/` eller exakt `.gitignore`,
  `AGENTS.md`, `CLAUDE.md`, `README.md`, `scripts/check-invariants.mjs`,
  `scripts/nortropic-codex-autopilot.py`. (Härlett ur revisionens PLATFORM_KEEP/REWRITE.)
- `f1_required_absences_…`: frånvarande: `docs/loop/arkiv/{regler,byggplan-v3,spec-styrningsfalt}-fore-2026-09-10.md`,
  `scripts/check-verifierarregistret.mjs`, `AUTOPILOT`, `KONSTITUTION.md`, `docs/0N-*.md`, och allt under
  `agents/ workflows/ skills/ vendored-skills/ packs/ backtests/ tests/fixtures/ tools/ docs/100-dagar/ docs/arkiv/`.
- `f1_web_transfer_provenance_2_…`: `SEPARATION-20260910/WEB-TRANSFER-PROVENIENS-2.tsv` (ny) listar
  exakt de fyra överförda filerna; kolumn 2 = blob-OID som grinden mäter med
  `git rev-parse 332f07ce:<path>`; kolumn 3 (destination) icke-tom; filerna är inte spårade vid HEAD.

### F2 — referensslutningsorakel (kärnan)
Rötter: `AGENTS.md`, `CLAUDE.md`, `README.md`, `.agents/skills/*/SKILL.md`, specens `authority.*`,
`controller/verify/cli` `PRETASK_PATHS`/`PLATFORM_DOCUMENTS`/`PLATFORM_CONTROL` (AST-literal),
alla dokumentsökvägslitteraler i `scripts/nortropic-codex-autopilot.py` (AST, inkl. promptfunktioner),
`config/loop-config.exempel.json`. **Extraktionsregel** per nått dokument: varje token
`(docs|config|specs)/…\.(md|json)` (även i backticks och kodblock), `AGENTS.md`/`CLAUDE.md`/`README.md`,
`.agents/skills/<x>/SKILL.md`, samt markdownlänkar `](mål.md)` upplösta relativt dokumentet; i
JSON varje strängvärde som helt är en sådan sökväg. Referenser till kod (`controller/…`,
`verify/…`) följs inte; `specs/tasks.spec.json` följs bara via `authority.*` (frysta rader bär
webbens `docs_impact` som evidens).
**Undantag (fryst evidens — varken skannas eller följs):** `docs/loop/owner-author-workflow-v1.md`,
`docs/loop/remaining-bootstrap-delegation-v1.md`, de plattformsfrysta plankopiorna
`docs/loop/autonomous-loop-plan-v1.md`/`autonomous-loop-codex-handoff.md` (bundna byte-exakt i F4;
de historiska planobjekten bär själva webbreferenser),
`SEPARATION-20260910/**`, `verify/**`, samt `docs/loop/*-local-development.md` (grindarnas
följedokument, som av nödvändighet namnger de förbjudna token; deras form binds av respektive grind).
**Delvis:** `docs/loop/drift.md` — bara avsnittet `## Aktiv plattformsnot…` skannas/följs;
substitutionskontraktet — bara ingressen, §6, §12 och tillagda avsnitt (övriga avsnitt binds
byte-exakt); de historiska dokumenten
`implementation-v4.1.md`, `codex-autopilot-v2.md`, `owner-h003-attestation-authority-v1.md` — bara
det tillagda supersessionsblocket.
- `f2_closure_roots_extracted_…`: rötterna kunde extraheras (≥6 skills, ≥8 autopilotsökvägar, ≥25 rötter).
- `f2_closure_all_active_references_resolve_to_tracked_files`: ingen hängande referens från något
  följt dokument (t.ex. arkitektskillens `docs/loop/autonomous-loop-plan-v1.md` måste finnas).
- `f2_active_doc_free_of_web_governance_and_human_hand_rules_<dokument>` (en rad per nått, skannat
  dokument): inga **webbtoken** — `docs/07-konstitution`, `docs/03-regelverk`, `docs/05-beslutslogg`,
  `docs/00-*`, `docs/agentoverlamning`, `docs/100-dagar`, `docs/arkiv/`, `KONSTITUTION.md`, `AUTOPILOT`
  (stewardbrytaren; `AUTOPILOT_*`-identifierare undantagna), `steward`, `Vaktmästaren`, `Nattskiftet`,
  `eval-rubric`, `juridikflaggor`, `nortropic-verify-suite`, `workflows/`, `agents/*.md`, `skills/`
  (inte `.agents/skills/`), `vendored-skills`, `tests/fixtures`, `konstitution*`, `constitution*`,
  `regelverk*`, `rulebook` — och inga **människohands-/ägarstoppstoken** — `människohand`,
  `endast av (en) människ…`, `av (en) människa`, `högrisk`, `owner-only`, `human owner`, `policyägare`,
  `OWNER_GATE_(STILL_)REQUIRED`, `OWNER_AUTHORITY_REQUIRED`, `remove the owner gate`, `owner reproduces`,
  `människan för kandidaterna`, `auto-merge är avstängt`, `godkänner spec|§A|merge`, `human-hand`,
  `owner-hand`. Undantag: `HUMAN_AUTHORITY_HARD_STOP` (verklig auktoritetskonflikt / extern
  credentialceremoni), `LOOP-ÄGARHAND-<n>`, fasformuleringar som "inte ett permanent krav på
  mänskligt godkännande", `OWNER_DECISION_REQUIRED` (intern arkitektsignal) och `human-only` som
  ord (substitutionskontraktets §1 rad 53 bär "human-only-gränser" i ett avsnitt som ska bestå).
  Läckorna ur revisionen faller under dessa rader: full-roadmap r.17/115, substitutionskontraktet
  r.5/§6/§12, evidenskontraktet r.120/130/135–144, config/README r.5/35/69/92–107, byggplan §7 r.113
  (`nortropic-verify-suite.js`), registrets not, premiar-backlog, managed-settings.
- `f2_full_roadmap_authority_section_…`: `## Authority` behåller `ROADMAP_PLAN_SHA=0b3212c9…`,
  `ROADMAP_PLAN_PATH`/`ROADMAP_HANDOFF_PATH` och namnger `AGENTS.md` som konfliktauktoritet;
  `HUMAN_AUTHORITY_HARD_STOP` finns kvar i dokumentet.
- `f2_substitution_contract_sections_1_5_7_11_13_unchanged_and_dated_amendment_present`: §1–§5,
  §7–§11, §13 byte-identiska med 332f07ce (avsnitt = från `## N.` till nästa `## `); §6 och §12
  finns; ett tillagt avsnitt vars rubrik bär `2026-09-10`/`v1.1`/amendment/tillägg och vars text
  namnger `AGENTS.md`.
- `f2_historical_document_unchanged_plus_dated_supersession_note_<dokument>`: dokumentet är exakt
  332f07ce-bytes plus ETT tillagt block (huvud före eller not efter) som bär `2026-09-10`, `AGENTS.md`
  och de specifika markörerna — v4.1: `§3`, `§4`, `§29`; v2: `OWNER_AUTHORITY_REQUIRED`; owner-h003:
  `§9` och `docs/loop/drift.md` — och som självt saknar webbtoken (människohandstoken får citeras
  där eftersom noten anger vilka meningar som ersätts).
- `f2_drift_md_append_only_with_active_platform_note_free_of_web_governance`: `docs/loop/drift.md`
  vid HEAD börjar med 332f07ce-bytes (append-only); det tillagda innehåller `## Aktiv plattformsnot…`
  med `2026-09-10`, `AGENTS.md`, `§5` och utan webb-/människohandstoken. Historiska poster rörs inte.

### F3 — konfiguration och behörighetsregler
- `f3_premiar_backlog_…`: `config/premiar-backlog.json` `defaults.denied_write` == specens
  `defaults.denied_write`; inga webb-/människohandstoken; ingen `docs/05` (docs-hemvist
  `docs/loop/drift.md`); ≥2 tasks.
- `f3_managed_settings_…`: strikt JSON; varje sökväg under `/Users/elinhaggstrom/nortropic…` i
  `permissions.deny`/`sandbox.filesystem.denyWrite` bär plattformsroten
  `/Users/elinhaggstrom/nortropic-repos/nortropic-system/`; inga webbsökvägar eller gammal rot; för
  varje mönster i specens `denied_write` finns `Edit(//<rot><mönster>)` och `denyWrite` `<rot><kärna>`;
  `controller/verify/register.json` nekas i båda; sandbox `enabled` och `strictAllowlist` kvar.
- `f3_gitignore_effect_…` (`git check-ignore --no-index`): inte ignorerade: `SEPARATION-20260910/*`,
  `docs/loop/x.md`, `verify/bin/x-exit`, `controller/x/cli`, `specs/x.json`, `config/x.json`,
  `tests/controller/x/fall.py`, `tests/scripts/x/y.py`, `.agents/skills/x/SKILL.md`, de två
  scripts-filerna, rotdokumenten; ignorerade: `workflows/x.js`, `agents/x.md`, `skills/x/SKILL.md`,
  `vendored-skills/…`, `packs/…`, `backtests/…`, `tools/…`, `AUTOPILOT`. (`tests/fixtures/` och `docs/0N-*`
  krävs inte ignorerade: den frysta control-set-fixturen stagar `tests/platform-fixture/**` via loopens
  `git add -A`, och den frysta policysviten stagar frysta specraders `docs_impact` `docs/05-beslutslogg.md`
  i fixturworktrees — en smalare `docs/`-vitlista gjorde policysviten röd, mätt 2026-09-10 på
  referenskonstruktionen. Webbdokumentens frånvaro binds i F1.)
- `f3_gitignore_whitelists_no_absent_tree`: varje `!/<träd>`-rad pekar på något spårat; ingen
  `!/workflows|agents|skills|vendored-skills|packs|backtests|tools|AUTOPILOT`.
- `f3_register_note_…`: noten/beskrivningen fri från människohands- och webbtoken (inkl.
  `workflows/`); `register_version` > 1.0.0; `check-invariants` pekar på
  `scripts/check-invariants.mjs` med sha `ae72cdf8…` (oförändrad, verifierad på disk); alla poster `startbar`.
- `f3_verify_cli_pins_…`: `PLATFORM_SPEC` == sha256(spec), `PLATFORM_REGISTER` == sha256(register),
  `PLATFORM_DOCUMENTS` ⊇ de elva generationsdokumenten och varje pinne == sha256 av kandidatens fil.
- `f3_preflight_exit0_…`: `controller/verify/cli preflight` i replika → exakt `{"status":"ok","register_sha256":<sha>}`.
- `f3_check_invariants_6_pass_0_fail_in_candidate_replica`: `node scripts/check-invariants.mjs` → exit 0, `6 PASS, 0 FAIL`.
- `f3_platform_prepare_and_check_accept_candidate_documents_in_replica`: `platform-prepare`+`platform-check` (h-035) ok.

### F4 — autopilot/loop-funktion utan gammal rot och origin-gren
- `f4_autopilot_argparse_defaults_do_not_point_at_old_root`: ingen `add_argument`-default (särskilt
  `--repo`, även `--worktrees`) bär `nortropic/nortropic-system`, `~/nortropic/…` eller `nortropic/worktrees`.
- `f4_autopilot_source_no_web_document_reference`: inga webbdokumentlitteraler i autopiloten.
- `f4_roadmap_plan_copies_tracked_byte_identical_to_0b3212c9_objects_and_autopilot_constants`:
  `HEAD:docs/loop/autonomous-loop-plan-v1.md` == blob `c8ea851167f38f6846485035ee2e6b1dc3b54db0`,
  `HEAD:docs/loop/autonomous-loop-codex-handoff.md` == `1e53887c59b8da0989579eaa241c5b53ea02abb9`
  (= `git rev-parse 0b3212c9…:<path>` i en klon som bär planobjektet; kommiten krävs inte i
  subjektets objektlager), läge 100644; autopilotens `ROADMAP_PLAN_BLOBS`/`ROADMAP_PLAN_SHA`/
  `ROADMAP_PLAN_PATH`/`ROADMAP_HANDOFF_PATH` lika.
- `f4_ensure_roadmap_plan_returns_in_replica_without_any_remote`: den riktiga modulens
  `ensure_roadmap_plan(repo)` returnerar i en replika utan remote (ingen fetch möjlig).
- `f4_ensure_roadmap_plan_stops_on_mutated_plan_copy` / `…_missing_handoff_copy`: en kopia med en
  ändrad byte respektive en borttagen kopia → `Stop`.
- `f4_autopilot_substitution_blobs_equal_head_blobs_of_generation_documents`: `SUBSTITUTION_BLOBS`
  ⊇ de elva dokumenten och varje OID == kandidatens HEAD-blob (pinnar uppdateras när generationen ändras).
- `f4_autopilot_selftest_none_returns_pass`, `f4_autopilot_publication_callers_exit0`,
  `f4_controller_loop_cli_unchanged_vs_332f07ce`.

### F5 — loopens testsvit utan webbfixtur
- `f5_loop_fall_py_b2_no_web_fixture_or_web_invariant`: `tests/controller/loop/fall.py` saknar
  `agents/`, `INV-00N`, `workflows/`, `tests/fixtures`; B2 finns.
- `f5_loop_fall_py_green_in_replica` (kräver sandbox-exec; FAIL under `--skip-held-gates`): sviten
  körs hermetiskt i replika → exit 0, ≥53 `ok`, inga `FEL`, en B2-rad som namnger `PINV`, slutar
  med `alla fall håller`. (Mätt 2026-09-10 på 332f07ce: 52 ok, 1 FEL = B2, 41 s.)

### F6 — fryst evidens
- `f6_frozen_evidence_identical_to_332f07ce_plus_this_gate_only`: träden `verify/**` (får bara få
  denna grind), `controller/h034-native`, `controller/runtime-cleanup`, `controller/provenance`,
  `SEPARATION-20260910/proposed/**` och filerna `scripts/check-invariants.mjs`, `controller/loop/cli`,
  `docs/loop/owner-author-workflow-v1.md`, `docs/loop/remaining-bootstrap-delegation-v1.md`,
  `docs/loop/document-authority-local-development.md`, `SEPARATION-20260910/{README.md,ALLOCATION.tsv,WEB-TRANSFER-PROVENIENS.tsv}`
  byte-identiska (blob-OID) med 332f07ce och arbetsträdet == HEAD; grinden 755 och lika den hållna kopian.
- `f6_earlier_local_gates_identical_to_332f07ce`: control-set-, launch-cwd- och governance-grinden oförändrade.
- drift.md append-only (F2).

### F7 — de tre tidigare frysta lokala grindarna mot kandidaten
- `f7_platform_control_set_exit_68_of_68_on_candidate`: exit 0, 68 PASS, `PASS_LOCAL_QUALIFICATION_ONLY`,
  `subject_head` == kandidaten, raderna `subject_preflight_exit0_exact_json`,
  `platform_prepare_and_check_accept_subject_documents`, `fixture_task_run_exit0`,
  `autopilot_selftest_none_returns`, `autopilot_substitution_accepts_platform_generation_without_web_docs`,
  `loop_end_to_end_attests_platform_fixture_task`, `invariant_required_exit_15_of_15` gröna.
- `f7_launch_cwd_exit_19_of_20_frozen_listing_sees_exactly_governance_and_this_gate`: exit 1, exakt
  raden `frozen_verify_bin_identical_to_base_383ed387` röd med detalj som slutar
  `problems=[] extra=['verify/bin/platform-governance-exit', 'verify/bin/platform-separation-final-exit']`.
- `f7_platform_governance_exit_red_exactly_on_its_frozen_verify_register_and_launch_cwd_rows`: exit 1,
  70 rader, exakt {`g6_frozen_trees_and_files_identical_to_512490d4_plus_this_gate_only`,
  `g7_launch_cwd_exit_19_of_20_only_frozen_listing_sees_this_gate`} röda (registret ändras och en
  grind tillkommer; dess launch-cwd-förväntan ser en extra grind). Governance-grinden förblir fryst
  för sitt subjekt 9112a304; detta binder bara dess mätta utfall på en slutseparationskandidat.

### F8 — livebana utan webbrepot
- `f8_no_tracked_file_couples_to_web_repo_path_or_old_root`: ingen spårad fil bär
  `nortropic-repos/nortropic-webbforvaltning` eller den gamla roten `~/nortropic/` /
  `/Users/elinhaggstrom/nortropic/` (evidensarkivet `…/nortropic/evidence/` undantaget). Undantag:
  `SEPARATION-20260910/**`, `verify/**`, `docs/loop/arkiv/**`, `*-local-development.md`,
  `specs/tasks.spec.json` (frysta rader), `drift.md`, owner-author-workflow, remaining-bootstrap,
  plankopiorna. Pythonfiler mäts på AST-strängkonstanter (docstrings/kommentarer är inte körbara
  beroenden; konstanter i `refreeze|h03[5-9]`-funktioner är historisk evidens).
- `f8_ordinary_loop_e2e_and_platform_prepare_check_green_on_candidate_via_held_control_set`: den
  hållna control-set-grindens ordinarie loop-e2e (fixturtask attesteras i replika) och
  platform-prepare/-check är gröna på kandidaten (raderna i F7).

### F9 — återinförandenegativer (utförs av test-author, inte grindrader)
Var och en i en förkastad replika av referenskonstruktionen; var och en ska ge RED på minst en namngiven rad:
(a) `docs/07-konstitution.md` som read-first i en skill; (b) meningen "Konstitutionen står över" i
full-roadmap; (c) `docs/05-beslutslogg.md` i premiar-backlogs `allowed_write`; (d) `!/workflows/`
åter i `.gitignore`; (e) `scripts/check-verifierarregistret.mjs` återställd; (f) nytt dokument
`docs/loop/x.md` som refererar `docs/03-regelverk.md`, länkat från `AGENTS.md`; (g)
`ensure_roadmap_plan` fetchar från origin igen; (h) registernot med "endast av människohand".
Resultat: se Utfall.

### F10 — riggdisciplin
Kanarier (traceback är inget utfall; okänt driverscenario; driverfel; tokenskannern fångar
webb-/människohandstoken och släpper undantagen; slutningsextraktionen följer backticks och
relativa länkar), strikt JSON (dubblerad nyckel = fel), `result.json`, subjektets och den hållna
grindens bytes oförändrade, utvecklingsdokumentet spårat med avsnitten Enkelt förklarat /
Avgränsning och roller / Kriterium (effekter) / Produktyta för BUILDER / Vad grinden inte bevisar / Utfall.

## Produktyta för BUILDER

Ordinarie arbete genom rollflödet (ägarbeslut 2026-09-10). Exakt lista:

1. **Bort ur trädet:** `docs/loop/arkiv/regler-fore-2026-09-10.md`,
   `docs/loop/arkiv/byggplan-v3-fore-2026-09-10.md`, `docs/loop/arkiv/spec-styrningsfalt-fore-2026-09-10.md`,
   `scripts/check-verifierarregistret.mjs`. **Ny:** `SEPARATION-20260910/WEB-TRANSFER-PROVENIENS-2.tsv`
   (kolumner path · blob-OID vid 332f07ce · destination i webbrepot · not; OID:erna är
   `6b41bcd4…`, `bd298bcf…`, `a847ade1…`, `2d018d65…`). Överföringen till webbrepot är gjord av roten
   (`nortropic-webbforvaltning` commit `e4c8c52`, `SEPARATION-ORIGIN/transfer-20260910-2/`).
2. **Nya plattformsfrysta plankopior:** `docs/loop/autonomous-loop-plan-v1.md` och
   `docs/loop/autonomous-loop-codex-handoff.md`, byte-identiska med `0b3212c9…:docs/loop/<fil>`
   (hämtas ur en klon som bär planobjektet, t.ex. `git -C ~/nortropic-repos/nortropic-system cat-file -p c8ea8511…`).
3. **Autopilot** `scripts/nortropic-codex-autopilot.py`: `--repo`/`--worktrees` utan gammal rot;
   `ensure_roadmap_plan` verifierar `HEAD:<kopia>` mot `ROADMAP_PLAN_BLOBS` (ingen fetch, ingen gren);
   `SUBSTITUTION_BLOBS` = nya HEAD-blobbar för de elva dokumenten; `selftest`:s hårdkodade kontrakts-blob
   uppdaterad. Codex-maskineriet lämnas (SUB-1 nästa).
4. **Verify-cli** `controller/verify/cli`: `PLATFORM_REGISTER`, `PLATFORM_DOCUMENTS` (sha256 av de
   slutliga dokumenten). `controller/verify/register.json`: ny not utan människohand/webbgrind,
   `register_version` stegad, check-invariants-posten oförändrad.
5. **Config:** `config/premiar-backlog.json` (specens `denied_write`; `docs/05` → `docs/loop/drift.md`),
   `config/managed-settings.json` (plattformsrot, webbposter bort, registret nekat),
   `config/README.md` (r.5, 35–36, 43, 69, 92–107), `.gitignore` (webbträd bort, `SEPARATION-20260910/`
   vitlistad; `docs/`, `tests/`, `scripts/` förblir hela vitlistor — se F3).
6. **Dokument:** `AGENTS.md` (Historik → Git-referenser/webbrepot utan sökväg), `README.md` (r.8, 21, 28),
   `docs/loop/regler.md` (r.9–10), `docs/loop/byggplan-v3.md` (r.9, 113, 166),
   `docs/loop/codex-autopilot-v3-full-roadmap.md` (r.17, 115), `docs/loop/harness-substitution-contract-v1.md`
   (ingress r.5, §6, §12 + daterat tilläggsavsnitt; §1–§5/§7–§11/§13 orörda),
   `docs/loop/codex-evidence-contract.md` (r.120, 130, 135–144), supersessionshuvud i
   `docs/loop/implementation-v4.1.md` och `docs/loop/codex-autopilot-v2.md`, appenderad not i
   `docs/loop/owner-h003-attestation-authority-v1.md` (§9), appenderat `## Aktiv plattformsnot` i
   `docs/loop/drift.md`.
7. **Tester:** `tests/controller/loop/fall.py` B2 (webbfixtur/INV-004 → PINV-sabotage, t.ex.
   `push --force` i `controller/<x>/cli` → PINV-005).
8. **Inte rörs:** `verify/**` (utom att denna grind redan ligger där), frysta träd/filer i F6,
   `controller/loop/cli`, `specs/tasks.spec.json` (kräver ingen ändring; frysta rader behålls),
   `scripts/check-invariants.mjs`.

## Vad grinden inte bevisar

- Att webbrepot faktiskt bär de överförda filerna: grinden läser aldrig webbrepot (plattformen ska
  fungera utan det); proveniensen binds mot 332f07ce-objekt i plattformens egen historik.
- Att de plattformsfrysta plankopiorna är fria från webbstyrning: de är byte-identiska med de
  historiska planobjekten och bär webbreferenser som effekt-authority (UNRESOLVED för SUB-1/senare
  kontrakt: omfrysning av planen för plattformen).
- Att frysta H-grindar går gröna på kandidaten (h-016/017/036/037/038 läser webbfiler vid körning;
  refreeze hör till nästa H-steg) eller att `document-authority-exit`/`h-035-exit` gör det.
- Att managed-settings är installerad (extern rootceremoni) eller att Claude Code/Codex faktiskt
  respekterar dem i drift.
- Att texten i oförändrade, byte-bundna avsnitt (substitutionskontraktets §1–§5/§7–§11/§13, de
  historiska dokumentens kroppar, drift.md:s historik) är webbfri — de är evidens och bedömdes i
  revisionen; §9 rad 307 bär `docs/05-beslutslogg.md` som observerat historiskt faktum.
- Att `*-local-development.md`-dokumenten är webbfria: de skannas inte (de namnger token). En
  webbinstruktion som smugglas in där och länkas från routern fångas inte av F2.
- Semantik bortom token: en omskrivning som uttrycker webbstyrning med andra ord fångas inte.
  Token-listan är den mätbara approximationen; oberoende granskning läser texten.
- Att `--repo`:s nya default är rätt katalog — bara att den inte är den gamla roten.
- Att provider-/Codex-maskineriet är ersatt (SUB-1).
- origin/main-strategin (nuvarande origin = gamla GitHub-repot) — UNRESOLVED utanför kontraktet.

## Utfall

### Test-author 2026-09-10 — baslinje RED (före produkt)
Kommando (arbetsyta `~/nortropic-repos/work/test-author-final-separation-20260910`, HEAD `e2c3bafd` =
332f07ce + grind + detta dokument, hållna grindar körda ur subjektets byte-identiska kopior):
`python3.12 verify/bin/platform-separation-final-exit --subject <arbetsyta>` → exit **1**,
`PLATFORM_SEPARATION_FINAL_RESULT=RED_LOCAL_QUALIFICATION`, **47 PASS / 31 FAIL** (78 rader),
`result.json` sha256 `877dcba2796740781f8fbed7070a4e8d886c19af58ebb5921645ad5ab1424131`.
Röda rader (alla av rätt skäl, produktytan ovan): `f1_every_tracked_file_matches_platform_allowlist`
(`scripts/check-verifierarregistret.mjs`), `f1_required_absences_…` (arkivkopiorna + vakten),
`f1_web_transfer_provenance_2_…` (saknas), `f2_closure_all_active_references_resolve_to_tracked_files`
(plankopiorna saknas; `docs/07/03/05/00`, `docs/100-dagar` hänger från arkivkopior, premiar-backlog,
full-roadmap, substitutionskontraktet), `f2_active_doc_…` för managed-settings, premiar-backlog, de tre
arkivkopiorna, byggplan (r.113 `nortropic-verify-suite.js`), full-roadmap (r.17/115),
evidenskontraktet (r.120/130/137/139/144), substitutionskontraktet (r.5, §6 ×4),
`f2_substitution_contract_…` (inget tilläggsavsnitt), `f2_historical_document_…` ×3 (inga
supersessionsblock), `f2_drift_md_…` (ingen aktiv plattformsnot), `f3_premiar_backlog_…`,
`f3_managed_settings_…` (gammal rot, webbposter), `f3_gitignore_effect_…`, `f3_gitignore_whitelists_no_absent_tree`
(18 frånvarande träd), `f3_register_note_…` (människohand, `workflows/nortropic-verify-suite.js`, 1.0.0),
`f4_autopilot_argparse_defaults_…` (`--repo`/`--worktrees` → `~/nortropic/…`), `f4_roadmap_plan_copies_…`,
`f4_ensure_roadmap_plan_returns_…` (Stop: `git fetch origin plan/autonomous-loop-v1` — transport 'file' not allowed),
`f4_…stops_on_mutated/missing…` (positivt ankare saknas), `f5_loop_fall_py_b2_…` (`agents/qa-launcher.md`, INV-004),
`f5_loop_fall_py_green_in_replica` (52 ok, 1 FEL = B2), `f8_no_tracked_file_couples_…` (config/README r.35/36/43,
managed-settings ×26). Gröna: kanarier, F6 (fryst evidens + tre tidigare grindar byte-identiska), F7
(control-set 68/68; launch-cwd 19/20 med exakt `extra=[governance, denna grind]`; governance 68/70 röd exakt
på g6/g7 — deltan orsakas av grindens egen närvaro och registret är ännu orört), preflight, PINV 6/0,
platform-prepare/-check, selftest, publication-callers, loop-cli oförändrad, F10.

### Referenskonstruktion (scratch, förkastad — bevisar satisfierbarhet)
Replika av 332f07ce + de ändringar produktytan beskriver (script i test-authorns scratch, aldrig i repot),
HEAD `95646f5e…`, 143 spårade filer. Fullkörning med hållna grindar: exit **0**,
`PASS_LOCAL_QUALIFICATION_ONLY`, **74/74**, `result.json` sha256
`11130b7c4cef5320096cb1f64e53576a5aa658cda24f22449b0ef8b014180226`. Mätt där: control-set 68/68
(result 266da090…), launch-cwd 19/20 med `extra=['verify/bin/platform-governance-exit',
'verify/bin/platform-separation-final-exit']` (cdc2719e…), governance 68/70 med exakt
{g6_frozen_trees_and_files_identical_to_512490d4_plus_this_gate_only,
g7_launch_cwd_exit_19_of_20_only_frozen_listing_sees_this_gate} röda (058d2208…), loop-sviten 53 ok / 0 FEL
med B2 via PINV-005, slutning 29 rötter → 33 nådda → 28 skannade dokument.
Lärdom under konstruktionen (ledde till kravändring före frysning): en smalare `docs/`-vitlista
(`/docs/*` + `!/docs/loop/`) gjorde governance-grindens G5 (policysviten) röd — sviten stagar frysta
specraders `docs/05-beslutslogg.md` i fixturworktrees; kravet på ignorerade `docs/0N-*` ströks.

### F9 — negativer (var och en i egen replika av referensen, statisk körning `--skip-held-gates`; siffror
utan de fem sandboxberoende raderna)
(a) `docs/07-konstitution.md` read-first i builder-skill → RED `f2_active_doc_…_nortropic_builder_SKILL_md`,
`f2_closure_all_active_references_…`; (b) "Konstitutionen står över" i full-roadmap → RED
`f2_active_doc_…_full_roadmap_md`; (c) `docs/05-beslutslogg.md` i premiar `allowed_write` → RED
`f3_premiar_backlog_…`, `f2_active_doc_…_premiar_backlog_json`, `f2_closure_…`; (d) `!/workflows/` i
`.gitignore` → RED `f3_gitignore_whitelists_no_absent_tree`, `f3_gitignore_effect_…`; (e)
`scripts/check-verifierarregistret.mjs` återställd → RED alla tre F1-rader; (f) `docs/loop/x.md` →
`docs/03-regelverk.md`, länkad från AGENTS.md → RED `f2_active_doc_…_docs_loop_x_md`, `f2_closure_…`
(+ pinnar/prepare eftersom AGENTS.md ändrades utan pinnuppdatering); (g) `ensure_roadmap_plan` fetchar
origin igen → RED `f4_ensure_roadmap_plan_returns_in_replica_without_any_remote`; (h) registernot "endast av
människohand" → RED `f3_register_note_…` (+ pinnar/prepare). Alla åtta: exit 1.

### Builder / kvalificering
(fylls i efter produktkörningen)
