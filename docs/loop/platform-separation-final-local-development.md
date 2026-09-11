# Slutseparation av plattformsrepot — lokalt kontrakt (grind + utvecklingsdokument)

**Roll:** TEST_AUTHOR (kontraktsfrys, ingen produkt) · **Datum:** 2026-09-10 · **Bas:** `332f07ceb914a07c6632c1393969d9d5a337566b`
· **Grind:** `verify/bin/platform-separation-final-exit` (v3.3 2026-09-11: plangenerationen bunden, remedierad efter kontraktsgranskningarna nr 5, 6 och 7; v2.5 efter fyra tidigare granskningar) · **Omfång:** `LOCAL_QUALIFICATION_ONLY`.

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

**v3 (ägarorder 2026-09-10, plangenerationen).** Den gamla roadmap-planen (commit `0b3212c9`, kopierad
byte-exakt som `docs/loop/autonomous-loop-plan-v1.md`/`autonomous-loop-codex-handoff.md`) var i v2.5 fortfarande
effekt-authority: autopilotens rollprompter lät agenterna läsa den med `git show 0b3212c9:…`, och den gör
`docs/07-konstitution`/`docs/03-regelverk` överordnade. v3 binder att planen är en PLATTFORMSGENERATION —
`docs/loop/autonomous-loop-plan-platform-v2.md` + `docs/loop/autonomous-loop-platform-handoff-v2.md`, frysta genom
det autonoma flödet — som är ett AKTIVT dokument (skannat som alla andra, plus en planspecifik tokenmängd), att
alla aktiva konsumenter (autopilotens konstanter och prompter, skills, full-roadmap, AGENTS, substitutionskontraktets
ingress/§15, drift, README, pinnar) är bundna till den nya generationen, att planens maskinläsbara skivtabell är
en sanning med autopilotens `SUBSTITUTION_ROADMAP + ROADMAP` och selftests exakta mängder, och att den gamla planen
(commit, blobbar, sökvägar, etiketter som "effekt-authority"/"fryst input"/"historisk källa") inte kan återinföras som
aktiv källa — den får bara förekomma i fryst evidens (`verify/**`, `SEPARATION-20260910/**`,
`*-local-development.md`, byte-frysta dokument, drift.md:s bas). Målbild: autonomin utvecklar hela Nortropic inkl.
plattformen; bootstrap (h-031…h-039) etablerar en kvalificerad bas; webben är en verksamhet som använder plattformen.

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
  (SUB-1/h-027) är nästa kontrakt. Här binds att ingen webbkoppling och ingen gammal
  rot-default finns kvar, och (v3) att planens authority är plattformens plangeneration — ett aktivt,
  blob-bundet dokument vid HEAD — och att den gamla planen inte längre är aktiv källa.

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
  `scripts/check-verifierarregistret.mjs`, `AUTOPILOT`, `KONSTITUTION.md`, `docs/0N-*.md`, (v3) de gamla plankopiorna
  `docs/loop/autonomous-loop-plan-v1.md` och `docs/loop/autonomous-loop-codex-handoff.md`, och allt under
  `agents/ workflows/ skills/ vendored-skills/ packs/ backtests/ tests/fixtures/ tools/ docs/100-dagar/ docs/arkiv/`.
- `f1_web_transfer_provenance_2_…`: `SEPARATION-20260910/WEB-TRANSFER-PROVENIENS-2.tsv` (ny) listar
  exakt de fyra överförda filerna; kolumn 2 = blob-OID som grinden mäter med
  `git rev-parse 332f07ce:<path>`; kolumn 3 (destination) icke-tom; filerna är inte spårade vid HEAD.
- `f1_no_blob_at_head_equals_a_transferred_pre_split_governance_or_pre_platform_plan_object`: ingen blob vid HEAD,
  under någon sökväg, är lika de fyra överförda objekten (`6b41bcd4…`, `bd298bcf…`, `a847ade1…`, `2d018d65…`),
  dae90c8f-originalen av `docs/loop/regler.md` (`b0bc10ae…`), `docs/loop/byggplan-v3.md` (`c0b3b04b…`),
  `specs/tasks.spec.json` (`2324b2fe…`), `AGENTS.md`/`CLAUDE.md`/`README.md`, eller (v3) den gamla planens objekt
  `c8ea8511…` (plan) och `1e53887c…` (handoff) — en omdöpt eller omparkerad kopia är samma objekt (tolv blobbar).
- `f1_no_symlink_entries_at_head`: inga poster med läge 120000 i HEAD-trädet (basen har 0) — en symlänk kan
  peka ut ur trädet (t.ex. mot webbrepot) och undgår filskanning.
- `f1_tracked_paths_unique_case_insensitively` (v3.2 N4, v3.3: nyckeln är NFC-normaliserad + gemener; Git körs med
  `core.quotePath=false` så icke-ASCII-sökvägar läses okvoterade): inga två spårade sökvägar som bara skiljer sig i
  skiftläge eller Unicode-normalisering — på ett skiftläges-/normaliseringsokänsligt filsystem kan bara en av dem checkas
  ut och den andra blir en dold tvilling. Riggen tolererar just den smutsen (subjekt och replikor) så att felet blir en
  produktrad (exit 1), inte ett riggfel (exit 2). Gräns: en enda trädpost som saknas i arbetsträdet (t.ex. en NFD-post som
  `core.precomposeunicode` kollapsat) är ingen tvilling utan en osäker utcheckning — riggfel av rätt skäl.

### F2 — referensslutningsorakel (kärnan)
Rötter: `AGENTS.md`, `CLAUDE.md`, `README.md`, `.agents/skills/*/SKILL.md`, specens `authority.*`,
`controller/verify/cli` `PRETASK_PATHS`/`PLATFORM_DOCUMENTS`/`PLATFORM_CONTROL` (AST-literal),
alla dokumentsökvägslitteraler i `scripts/nortropic-codex-autopilot.py` (AST, inkl. promptfunktioner),
`config/loop-config.exempel.json`. **Extraktionsregel** per nått dokument: varje filliknande token
`(docs|config|specs)/…` med valfri ändelse, skiftlägesoberoende (`Docs/05-Beslutslogg.md` är en referens),
även i backticks, kodblock och `<…>`; `AGENTS.md`/`CLAUDE.md`/`README.md`; `.agents/skills/<x>/SKILL.md`;
markdownlänkar `](mål)`, `](<mål>)`, `](mål "titel")` med valfri ändelse upplösta relativt dokumentet
(även `../`); i JSON varje strängvärde som helt är en sådan sökväg. Katalogreferenser (`docs/loop/`) följs
inte men måste vara spårade kataloger. Alla nådda spårade textfiler följs och skannas (även `.txt`, `.sh`).
Referenser som lämnar trädet (`../x` utanför länk, en länk vars upplösning går förbi roten, eller ett
JSON-strängvärde som bär `../x`, t.ex. `worker_cmd`) är alltid hängande — ett syskonrepo kan aldrig vara
aktiv instruktion.
Referenser till kod (`controller/…`, `verify/…`) följs inte; `specs/tasks.spec.json` följs bara via
`authority.*` och är dessutom byte-bunden (F3).
**Undantag (fryst evidens — varken skannas eller följs):** `docs/loop/owner-author-workflow-v1.md`,
`docs/loop/remaining-bootstrap-delegation-v1.md`, `SEPARATION-20260910/**`, `verify/**`, samt
`docs/loop/*-local-development.md` (grindarnas följedokument, som av nödvändighet namnger de förbjudna token;
deras form binds av respektive grind). **v3: plangenerationen `docs/loop/autonomous-loop-plan-platform-v2.md` och
`docs/loop/autonomous-loop-platform-handoff-v2.md` är INTE undantagna** — de nås via autopilotens konstanter och
skills, följs och skannas med hela webb- och människohandsmängden, med den gamla planens pekare (nedan) och med
den planspecifika mängden `CODEX_START_HERE`, `Codex-handoff`, `ägarhand` (fångar även `ÄGARHAND-<n>`),
`ägarterminal`, `gh pr merge`, `kundfabrik`, `kundflöde`, `Jonkebronk`, `slack-webhook`, `målbild §`,
`Verkstadsgolvet` (verksamhetens kontrollrum namnges inte alls i plattformsplanen — plattformen exponerar en typad
läs-/kommandoyta, verksamheten använder den), `human-only`, `owner-only`. En grindmutant som återinför undantaget
faller på kanarien `canary_plan_generation_scan_rejects_…`.
**Den gamla planens pekare (`OLD_PLAN_TOKENS`, skannas i varje aktiv/skannad fil och trädvitt i alla klasser):**
varje Git-förkortning (8–40 hex, skiftlägesoberoende, hex-avgränsad) av commiten `0b3212c9…` — även
12-formen `0b3212c991d4` — och av blobbarna `c8ea8511…`/`1e53887c…` (v3.1, B1), sökvägarna `autonomous-loop-plan-v1.md`/`docs/loop/autonomous-loop-plan-v1`/
`autonomous-loop-codex-handoff`, grenen `plan/autonomous-loop-v1`, och etiketterna `effekt-authority`/`effect
authority`, `fryst input`/`frozen input`, `historisk källa`/`historical source`. Tillåtna bara i fryst evidens
(`verify/**`, `SEPARATION-20260910/**`, `*-local-development.md`, owner-author-workflow, remaining-bootstrap-delegation,
drift.md:s 332f07ce-bas, substitutionskontraktets byte-frysta §). **Commit-läsning (`COMMIT_READ_TOKENS`, v3.1 B2):**
`<PLAN_SHA>`, "frozen autonomous-loop plan commit", `git show {…|<…|<7–40 hex>:`, `plan_sha`/`PLAN_SHA` (ej `plan_sha256`) och
(v3.3 N1) `git show <ref>:` för varje ref utom `HEAD` (t.ex. `origin/main:`, `refs/preserved/…:`) samt `refs/preserved/`
är förbjudna i VARJE skannat aktivt dokument (autopilotens egen läsning av substitutionsauktoriteten ur
`refs/remotes/origin/main` sker som argv i kod, inte som dokumenttext, och berörs inte) — alla sex skills, AGENTS/CLAUDE/README, planen, handoffen, full-roadmap,
supersessionsnoterna, drift-svansen och EFTERARBETE-svansen — inte bara i de två plan-namngivande skillsen.
Substitutionskontraktets ingress (r.7) namnger i dag
commiten och skannas → måste skrivas om, med ett §15-tillägg (v1.2). Auditens r.241 nämner planens NAMN utan sökväg
eller `.md` och träffas inte (beslut: bara pekare som kan lösa till ett objekt eller en fil är förbjudna; en etikett
utan pekare kan inte återinföra planen mekaniskt).
**Delvis:** `docs/loop/drift.md` — (v3) HELA den appenderade svansen efter 332f07ce-bytes skannas/följs (v2.5 tog bara
det första `## Aktiv plattformsnot`-avsnittet; en senare `## `-rubrik gick oskannad); substitutionskontraktet — bara
ingressen, §6, §12 och tillagda avsnitt §14+ (övriga avsnitt binds byte-exakt); de historiska dokumenten
`implementation-v4.1.md`, `codex-autopilot-v2.md`, `owner-h003-attestation-authority-v1.md`,
`loop-review-2026-07-31.md` — bara det tillagda supersessionsblocket; `SEPARATION-20260910/EFTERARBETE.md` — bara det
tillagda (append-only, F6; v3.1 N3: svansgrenen i `scannable_text` ligger före undantagsprövningen och är nåbar, så svansen
mäts både trädvitt och i F6 med webb-, människohands-, gamla-plan- och commit-läsningstoken).
**Trädvid skanning (`f2_tree_wide_…`):** utöver slutningen klassificeras VARJE spårad fil vid HEAD:
*fryst* (`verify/**`, `SEPARATION-20260910/{README.md,ALLOCATION.tsv,WEB-TRANSFER-PROVENIENS*.tsv,proposed/**}`,
owner-author-workflow, remaining-bootstrap-delegation, `scripts/check-invariants.mjs`,
`specs/tasks.spec.json` — alla OID-bundna på annat håll, skannas inte), *delvis* (ovan), *local-development*
(sluten mängd, se nedan), *kod* (Python: AST-strängkonstanter utom docstrings och utom exakt mängden
{`controller/attest/cli`: `expected_refreeze`, `h038_proof`} — de enda funktionerna vid 332f07ce vars konstanter
namnger webbens beslutslogg, historisk refreeze-evidens; inget namnmönster, en ny `h035_x`/`refreeze_y` skannas;
undantaget är namnbundet och därför säkert bara för att `controller/attest/cli` samtidigt är byte-fryst mot
332f07ce i F6 — en omdefinierad `expected_refreeze` eller en nästlad def i `h038_proof` faller på F6;
skal/JS/C: hela texten — autopiloten skannas alltså i sin helhet på strängkonstanter, inte bara på namngivna
konstanter) med webbtoken utom `AUTOPILOT` (autopilotens journalprefix) plus webbrepots namn
`nortropic-webbforvaltning`, och en smal ägarstoppsmängd (`människohand`, `endast av människ…`, `högrisk`,
`owner-only`, `OWNER_AUTHORITY_REQUIRED`, `Johnny`, `klartecken`, `vänta på ägaren/människan`, `ägarens
godkännande/klartecken/beslut`, `auto-merge är avstängt`, `människan för kandidaterna`); *test*
(`tests/**`: kodtoken utom `docs/05`, `docs/00`, `beslutslogg` — frysta specraders `docs_impact` är
fixturdata); *text* (allt annat: md, json, tsv, sh, .gitignore) med hela webb- och människohandsmängden.
(v3) `OLD_PLAN_TOKENS` ingår i alla klasser (kod: per AST-sträng; test; delvis; text), och plangenerationens två filer
skannas dessutom med den planspecifika mängden.
Binära blobbar tolereras bara under `verify/**`, `controller/provenance/dist/`, `controller/runtime-cleanup/install`.
Rader: `f2_tree_wide_no_web_governance_reference_outside_frozen_evidence` och
`f2_tree_wide_no_human_hand_rule_outside_frozen_evidence` (detaljen listar fil@rad token).
Sammansatta sökvägar i kod (`"docs/07-" + "konstitution.md"`) fångas bara när något fragment självt bär ett
helt token (`konstitution`/`regelverk`/`beslutslogg`); en splittring inuti ordet (`"konst%s" % "itution"`),
base64 eller läsning av en fil utanför repot vid körning ligger utanför grindens omfång (se Vad grinden inte bevisar).
- `f2_closure_roots_extracted_…`: rötterna kunde extraheras (≥6 skills, ≥8 autopilotsökvägar, ≥25 rötter).
- `f2_closure_all_active_references_resolve_to_tracked_files`: ingen hängande referens från något
  följt dokument (t.ex. arkitektskillens `docs/loop/autonomous-loop-plan-v1.md` måste finnas).
- `f2_active_doc_free_of_web_governance_and_human_hand_rules_<dokument>` (en rad per nått, skannat
  dokument): inga **webbtoken** — `docs/07-konstitution`, `docs/03-regelverk`, `docs/05-beslutslogg`,
  `docs/00-*`, `docs/agentoverlamning`, `docs/100-dagar`, `docs/arkiv/`, `KONSTITUTION.md`, `AUTOPILOT`
  (stewardbrytaren; `AUTOPILOT_*`-identifierare undantagna), `steward`, `Vaktmästaren`, `Nattskiftet`,
  `eval-rubric`, `juridikflaggor`, `nortropic-verify-suite`, `workflows/`, `agents/*.md`, `skills/`
  (inte `.agents/skills/`), `vendored-skills`, `tests/fixtures`, `konstitution*`, `constitution*`,
  `regelverk*`, `rulebook`, `beslutslogg*`, `nortropic-webbforvaltning/` (sökvägstoken skiftlägesoberoende)
  — och inga **människohands-/ägarstoppstoken** — `människohand`,
  `endast av (en) människ…`, `av (en) människa`, `högrisk`, `owner-only`, `human owner`, `policyägare`,
  `OWNER_GATE_(STILL_)REQUIRED`, `OWNER_AUTHORITY_REQUIRED`, `remove the owner gate`, `owner reproduces`,
  `människan för kandidaterna`, `auto-merge är avstängt`, `godkänner spec|§A|merge`, `human-hand`,
  `owner-hand`, `Johnny`, `klartecken`, `vänta på ägaren/människan/en människa`, `ägarens (uttryckliga)
  godkännande/klartecken/beslut`, `human_only` (fältnamn i JSON/text). Undantag: `HUMAN_AUTHORITY_HARD_STOP` (verklig auktoritetskonflikt / extern
  credentialceremoni), `LOOP-ÄGARHAND-<n>`, fasformuleringar som "inte ett permanent krav på
  mänskligt godkännande", `OWNER_DECISION_REQUIRED` (intern arkitektsignal) och `human-only` som
  ord (substitutionskontraktets §1 rad 53 bär "human-only-gränser" i ett avsnitt som ska bestå).
  Läckorna ur revisionen faller under dessa rader: full-roadmap r.17/115, substitutionskontraktet
  r.5/§6/§12, evidenskontraktet r.120/130/135–144, byggplan §7 r.113 (`nortropic-verify-suite.js`),
  registrets not, premiar-backlog, managed-settings. `config/README.md` nås inte av slutningen (ingen aktiv
  referens) och binds av den trädvida skanningen (r.69 `nortropic-verify-suite`, r.104 `av människan`, r.106
  `Auto-merge är avstängt`/`människan för kandidaterna`) samt F8 (r.35–36/43 gamla roten).
- `f2_plan_generation_and_handoff_reached_by_closure_and_scanned_as_active_documents` (v3): båda filerna är spårade,
  nås av slutningen (autopilotens `ROADMAP_PLAN_PATH`/`ROADMAP_HANDOFF_PATH`, skills) och finns i den skannade mängden.
- `f2_local_development_documents_are_exactly_the_332f07ce_set_plus_this_contract`: mängden spårade
  `docs/loop/*-local-development.md` == mängden vid 332f07ce ∪ {detta dokument} (ett nytt oskannat
  följedokument kan inte tillkomma utan eget kontrakt).
- `f2_router_authority_section_marks_frozen_gate_inputs_as_not_current_instruction`: varje omnämnande i hela
  `AGENTS.md` och `CLAUDE.md` av ett fryst/undantaget dokument (owner-author-workflow,
  remaining-bootstrap-delegation, plankopiorna) står i samma stycke eller listpunkt (aldrig ett efterföljande
  stycke) som orden `frys…`/`frus…`/`historisk` och frasen `inte dagens instruktion` (radbrytning inom frasen
  tolereras) — routern lyfter aldrig fryst grindinput
  till instruktion, i ingen sektion; `specs/tasks.spec.json` är aktiv auktoritet och undantas bara från
  tokenskanning. `## Auktoritetsordning` måste finnas. Kalibrerat mot referensen: p.5, Fasgränser-stycket
  (remaining-bootstrap-delegation) och Historik-stycket (plankopiorna) bär markörerna; buildern får formulera.
- `f2_router_authority_order_names_plan_generation_as_active_and_historik_names_the_earlier_generation_as_history`
  (v3): `## Auktoritetsordning` i `AGENTS.md` nämner `docs/loop/autonomous-loop-plan-platform-v2.md`, och den
  listpunkt/det stycke som nämner den bär INTE `inte dagens instruktion`/`historisk`/`fryst grindinput` (planen är
  aktiv; den får därför inte stå i samma listpunkt som de frysta dokumentens markörnot — egen punkt) och bär (v3.1 N6)
  handoffens sökväg, ordet `plangeneration` och ordet `aktiv`; `## Historik` finns och binder BÅDA riktningarna (v3.2
  N8): ett stycke som namnger den `tidigare|föregående|gamla|äldre plangeneration(en)` tillsammans med `historia/historisk`
  och `Git-historik` (den gamla som historia — utan sha, blob eller sökväg; pekarna är förbjudna), och ett stycke som
  namnger den nya planens sökväg tillsammans med ordet `aktiv` (den nya som aktiv). En etikett utan pekare som "gällande
  referens" är deklarerad semantikgräns (N1).
- `f2_full_roadmap_authority_section_binds_plan_generation_and_paths_and_names_agents_md_without_old_commit` (v3):
  `## Authority` bär `PLAN_GENERATION=<autopilotens PLAN_GENERATION>`, `ROADMAP_PLAN_PATH=<ny plan>`,
  `ROADMAP_HANDOFF_PATH=<ny handoff>` och namnger `AGENTS.md`; `HUMAN_AUTHORITY_HARD_STOP` finns kvar i dokumentet;
  hela dokumentet fritt från den gamla planens pekare.
- `f2_substitution_contract_sections_1_5_7_11_13_unchanged_dated_amendment_and_plan_generation_amendment_present`:
  §1–§5, §7–§11, §13 byte-identiska med 332f07ce (avsnitt = från `## N.` till nästa `## `); §6 och §12 finns; ett
  tillagt avsnitt vars rubrik bär `2026-09-10`/`v1.1`/amendment/tillägg och vars text namnger `AGENTS.md` (§14);
  (v3) ett avsnitt `## 15.`+ vars rubrikrad bär `2026-09-10` eller `v1.2` och vars text namnger den nya planens
  sökväg och `AGENTS.md`; ingressen (texten före `## 1.`) fri från den gamla planens pekare.
- `f2_historical_document_unchanged_plus_dated_supersession_note_<dokument>`: dokumentet är exakt
  332f07ce-bytes plus ETT tillagt block (huvud före eller not efter) som bär `2026-09-10`, `AGENTS.md`
  och de specifika markörerna — v4.1: `§3`, `§4`, `§29`; v2: `OWNER_AUTHORITY_REQUIRED`; owner-h003:
  `§9` och `docs/loop/drift.md`; loop-review: `2026-07-31` — och som självt saknar webbtoken och den hårda
  ägarstoppsmängden (`människohand`, `endast av människ…`, `högrisk`, `klartecken`, `vänta på …`, `ägarens
  godkännande/klartecken/beslut`); övriga människohandstoken får citeras där eftersom noten anger vilka
  meningar som ersätts.
- `f2_drift_md_append_only_whole_tail_scanned_with_active_platform_note_naming_plan_generation`: `docs/loop/drift.md`
  vid HEAD börjar med 332f07ce-bytes (append-only); hela svansen skannas och innehåller en rubrik
  `## Aktiv plattformsnot…`, `2026-09-10`, `AGENTS.md`, `§5` och (v3) den nya planens sökväg, utan webb-/människohands-
  token och utan den gamla planens pekare. Historiska poster rörs inte (r.521/564 i basen nämner den gamla commiten —
  bas, inte svans).

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
- `f3_verify_cli_pins_equal_candidate_spec_register_every_generation_document_and_the_plan_generation`: `PLATFORM_SPEC` ==
  sha256(spec), `PLATFORM_REGISTER` == sha256(register), `PLATFORM_DOCUMENTS` ⊇ de elva generationsdokumenten ∪ (v3.1 N5)
  {ny plan, ny handoff} och varje pinne == sha256 av kandidatens fil — planen är därmed korsbunden: blob i autopilotens
  `ROADMAP_PLAN_BLOBS` och sha256 i verify-cli, båda mot samma HEAD-fil, och `platform-prepare/-check` ser den.
  `SUBSTITUTION_BLOBS` förblir elva (selftest binder antalet).
- `f3_preflight_exit0_…`: `controller/verify/cli preflight` i replika → exakt `{"status":"ok","register_sha256":<sha>}`.
- `f3_check_invariants_6_pass_0_fail_in_candidate_replica`: `node scripts/check-invariants.mjs` → exit 0, `6 PASS, 0 FAIL`.
- `f3_platform_prepare_and_check_accept_candidate_documents_in_replica`: `platform-prepare`+`platform-check` (h-035) ok.
- `f3_spec_byte_identical_to_332f07ce_this_contract_requires_no_spec_change`: `HEAD:specs/tasks.spec.json`
  har samma blob-OID som vid 332f07ce (frysta rader behålls; ingen ny rad, ingen ompinnad text).

### F4 — autopilot/loop-funktion utan gammal rot och origin-gren
- `f4_autopilot_argparse_defaults_do_not_point_at_old_root`: ingen `add_argument`-default (särskilt
  `--repo`, även `--worktrees`) bär `nortropic/nortropic-system`, `~/nortropic/…` eller `nortropic/worktrees`.
- `f4_autopilot_source_no_web_document_reference`: inga webbdokumentlitteraler i autopiloten.
- `f4_plan_generation_files_tracked_100644_and_autopilot_paths_and_blobs_equal_head` (v3): `docs/loop/autonomous-loop-plan-platform-v2.md`
  och `docs/loop/autonomous-loop-platform-handoff-v2.md` är spårade reguljära filer med läge 100644; autopilotens
  `ROADMAP_PLAN_PATH`/`ROADMAP_HANDOFF_PATH` är exakt dessa sökvägar och `ROADMAP_PLAN_BLOBS` == filernas HEAD-blobbar
  (identiteten är HEAD-bloben, ingen commit). Konstanterna läses ur den riktiga modulen (DRIVER `constants`).
- `f4_autopilot_has_plan_generation_constant_and_no_roadmap_plan_sha_attribute` (v3): modulen har ingen attribut
  `ROADMAP_PLAN_SHA`; `PLAN_GENERATION` är en icke-tom sträng (värdet är builderns, t.ex. `platform-v2`).
- `f4_ensure_roadmap_plan_returns_in_replica_without_any_remote`: den riktiga modulens
  `ensure_roadmap_plan(repo)` (namnet behålls — h-032-exit och publication-callers är namnbundna) returnerar i en
  replika utan remote (ingen fetch möjlig).
- `f4_ensure_roadmap_plan_stops_on_mutated_plan_generation` / `…_missing_handoff` / (v3.2 N2) `…_mutated_handoff`: planen
  med en ändrad byte, en borttagen handoff respektive en handoff med en ändrad byte → `Stop` (handoffens BYTES binds i
  körtidsvakten, inte bara dess existens).
- `f3_platform_prepare_refuses_mutated_plan_generation_in_replica` / `f3_platform_check_refuses_snapshot_whose_plan_generation_was_mutated_after_prepare`
  (v3.2 N3 — pinnen mätt i EFFEKT): `controller/verify/cli platform-prepare` i en replika med muterad (ej ompinnad) plan
  → exakt `{"status":"refused","reason":"DOCUMENT_GENERATION"}`; (v3.3 N5) `f3_platform_prepare_refuses_mutated_handoff_in_replica`
  detsamma för en muterad handoff; `platform-check` mot en snapshot vars plan muterats efter prepare → samma avslag. En
  cli som itererar en filtrerad tvilling av `PLATFORM_DOCUMENTS` eller hoppar över handoffen faller här.
- `f4_autopilot_source_free_of_old_plan_commit_git_show_by_commit_and_plan_sha` (v3): autopilotens FULLTEXT (inkl.
  kommentarer/docstrings) och AST-strängar saknar den gamla planens pekare, `git show {…}:`/`git show <…>`/
  `git show <7–40 hex>:` (läsning ur commit; `git show HEAD:`/`origin/main:` är tillåtet) och identifieraren/fältet
  `plan_sha`/`PLAN_SHA`/`ROADMAP_PLAN_SHA` (skiftlägesoberoende; `plan_sha256` undantaget).
- `f4_produced_prompts_of_roadmap_empirical_and_architect_builders_name_plan_generation_and_handoff_for_every_slice_and_role`
  och `f4_produced_prompts_free_of_old_plan_pointers_commit_reads_web_and_owner_stop_tokens_and_inject_only_declared_tracked_documents`
  (v3.1, B3 — de FAKTISKA prompterna): drivern importerar den riktiga modulen (under slumpat modulnamn, N1-härdning)
  och ANROPAR varje promptbyggare med fixturargument — byggare = funktion vars kodobjekts strängkonstanter bär
  `Use `$nortropic-` eller vars namn matchar `prompt|_extra$|authority_text$`, minus flöden (v3.2 B1: ENBART via signatur —
  en parameter `repo`/`wt`/`wt_root`; ingen strängförekomst kan välja bort mätningen); flöden anropas aldrig, deras
  inlinade promptliteraler täcks av AST-raden; varianter: varje verklig `RoadmapSlice` ur `SUBSTITUTION_ROADMAP + ROADMAP`, båda
  remedieringsrollerna, båda `refrozen`-värdena; fixturer: 40-hex shas, tomt signal-dict, ett fynd, `h-015`, `BUILD`.
  Rad 1: byggarna `architect_prompt`, `roadmap_test_author_prompt`, `roadmap_gate_reviewer_prompt`,
  `roadmap_remediation_prompt`, `slice_builder_extra`, `slice_authority_text`, `empirical_gate_test_author_prompt`,
  `empirical_gate_reviewer_prompt`, `empirical_prompt` finns, kan anropas och VARJE producerad variant (även SUB-skivor)
  namnger både planen och handoffen; ≥20 producerade texter. Rad 2: ingen producerad text bär gamla-plan-pekare,
  commit-läsning, kodwebb- eller ägarstoppstoken; mängden `docs/…`-sökvägar (med ändelse) och rotdokument i producerad text
  ⊇ krävd och ⊆ tillåten (samma mängder som nedan), alla spårade och skannade/blob-pinnade; ingen byggare kastar.
  Mätt på referensen: 15 byggare, 101 producerade texter, 1 flöde (`empirical_gate_contract_flow`, inlinad remedieringsprompt).
- `f4_prompt_builders_flows_and_callers_are_the_closed_expected_sets_every_runner_prompt_sourced_and_every_builder_live`
  (v3.2, B1 — SLUTEN VÄRLD, mätt på plattformens autopilot): drivern rapporterar exakt `EXPECTED_PROMPT_BUILDERS` (15
  namn) och `EXPECTED_PROMPT_FLOWS` ({`empirical_gate_contract_flow`}); statiskt (`prompt_world`, toppnivåfunktioner):
  varje funktion som bär rollmarkören i någon strängkonstant eller returnerar ett uttryck vars konstanter bär markören
  eller en `docs/…`-fil är PRODUCENT och måste tillhöra byggare ∪ flöden; varje funktion som namnger en byggare måste
  tillhöra byggare ∪ `EXPECTED_PROMPT_CALLERS` (8 namn: architect_resolution, builder_flow, empirical_unattended_flow,
  ensure_empirical_program_gate, ensure_roadmap_slice, roadmap_contract_flow, run_codex, test_author_flow, + flödet);
  varje promptargument till `run_codex`/`run_codex_resolving_architecture` klassificeras FAIL-CLOSED (v3.3, B1): roten
  måste vara ett direkt `Call` till en förväntad byggare (enda andra rötter: f-sträng inuti ett förväntat flöde,
  parametern `prompt` inuti en runner); tillåtna additiva delar är konstanter utan markör/`docs/`-fil, parametrar som
  operander och strängmetoder (`rstrip/strip/lstrip/replace/format/join`) på sådana; `Name` löses genom funktionens
  EGNA tilldelningar (alla tilldelningar till namnet måste ha byggarrot); RÖTT är anrop till varje annan modulfunktion
  (ingen "datahjälpare"), modulnivånamn/konstanter/importer som textkälla, attribut-/metodanrop utanför strängmetoderna,
  subscript/`globals()`/klassmetoder, comprehension, `IfExp` där bara en gren har byggarrot, `+=` med prompttext, och
  varje referens till ett runner-namn som inte är ett direkt anrop (alias, även på modulnivå). Modul- och klassnivå
  sveps: rollmarkör i någon strängkonstant, eller `docs/`-fil inbäddad i längre text (hela sökvägskonstanter är
  tillåtna), är RÖTT — även dynamiskt (`vars(m)`: strängar och klassers metoder). Nåbarhet från `main()` räknas enbart
  via ANROP (`Call.func`), inte via döda referenser. Kanari: fixturmodul med tvilling via anrop, inlinat flöde, död
  prompt, modulmall, klassmetod, runner-alias, parameter-genomsläpp och hjälpfunktion — alla flaggas; det legitima
  flödet (byggare + additiv guidance, vaktanrop) släpps. Referensens 16 verkliga runner-argument (13 byggaranrop,
  `effective`←`prompt` i runnern, `byggare + (guidance-f-sträng if … else "")`, f-sträng i flödet) går igenom.
- `f4_live_flows_reach_the_stubbed_runner_with_a_prompt_naming_plan_and_handoff_free_of_old_pointers` (v3.3, B1
  dynamisk — den verkliga effekten): DRIVER-scenariot `live_flows` importerar modulen i en replika av kandidaten
  (`refs/remotes/origin/main` = HEAD), monkeypatchar `run_codex` till en fångare som bokför argumentet och avbryter,
  stubbar worktree-hantering/`clean`/`origin_main` (fixturgränser, inte det som mäts) och kör `architect_resolution`,
  `roadmap_contract_flow` för SUB-1 och S2, `empirical_gate_contract_flow` och `full_roadmap`; varje flöde måste nå
  runnern och den fångade prompten måste namnge plan + handoff och sakna gamla pekare, commit-läsning, kodwebb- och
  ägarstoppstoken.
- `f4_live_flows_stop_before_the_stubbed_runner_on_mutated_plan_generation` (v3.3, B2 dynamisk): samma körning i en
  replika med muterad plan — de fyra vaktbärande flödena (`roadmap_contract_flow` ×2, `empirical_gate_contract_flow`,
  `full_roadmap`) måste STOPPA (`Stop`) utan att runnern anropats; `architect_resolution` är ett delflöde utan egen vakt.
- `f4_ensure_roadmap_plan_called_from_exactly_the_expected_guard_callers_all_reachable_from_main` (v3.3, B2 statisk):
  funktionerna som ANROPAR `ensure_roadmap_plan` (`Call`-position) == {doctor, empirical_gate_contract_flow,
  full_roadmap, roadmap_contract_flow, roadmap_status}, alla nåbara från `main()` via anrop.
- `f4_prompt_builders_run_in_contained_fixture_without_side_effects` (v3.2 N5, v3.3 N6): byggarna körs i en egen fixtur
  (HOME/XDG/TMPDIR under fixturen, cwd i fixturen, `GIT_DIR` mot ett tomt bare-repo, proxyvariabler mot en stängd lokal
  port); varje ny eller ändrad fil under fixturen eller under subjektets ARBETSTRÄD (`.git/` undantaget — indexbrus från
  andra processer är inte en produktsidoeffekt) och varje ny/borttagen toppnivåpost i `/private/tmp`, `/private/tmp/claude`
  och processens tempkatalog (grindens egna `platform-separation-final-*`-rötter undantagna) är FAIL. Gräns: skrivningar
  till andra absoluta sökvägar, frånkopplade processer och nätverk utan proxy fångas inte; produktgranskningen läser
  byggarna.
- `f4_prompt_functions_ast_literals_inject_only_the_declared_platform_document_set_all_tracked_and_scanned` (v3,
  komplement — statisk): promptbyggande funktioner = varje funktion vars strängkonstanter bär `Use `$nortropic-` eller vars namn matchar
  `prompt|_extra$|authority_text$`, PLUS varje funktion som anropar en sådan (deras `extra`-strängar injiceras);
  ≥9 markörfunktioner och ≥12 totalt. Den injicerade dokumentmängden = alla `docs/…`-literaler med ändelse och
  rotdokument (`AGENTS.md`, `CLAUDE.md`, `README.md`, skills) i deras strängkonstanter (även f-strängdelar) och i de
  modulkonstanter (strängar) de namnger. Krav: KRÄVD mängd {ny plan, ny handoff, full-roadmap, substitutionskontraktet,
  auditen, evidenskontraktet, `AGENTS.md`, rapportschemat} ⊆ injicerad ⊆ TILLÅTEN = krävd ∪ {`docs/loop/regler.md`,
  `docs/loop/byggplan-v3.md`, `docs/loop/drift.md`, `docs/loop/owner-h003-attestation-authority-v1.md`}; varje injicerad
  fil spårad och i den skannade slutningsmängden (eller ett generationsdokument, blob-pinnat). Beslut: delmängd-i-
  tillåten i stället för exakt likhet, så att en legitim prompt som slutar nämna owner-h003 (S3 byggd) eller drift inte
  faller; evidenskontraktet är krävt eftersom varje rollrapport följer det. Mätt vid 320c9df7: injicerad = {AGENTS,
  gammal plan, byggplan, schema, full-roadmap, drift, audit, kontrakt, owner-h003, regler}.
- `f4_plan_generation_slice_table_equals_autopilot_roadmap_tuples_and_selftest_exact_sets` (v3): planen bär en
  markdowntabell med rubrikcellerna exakt `slice | task | exit_test | allowed_write | depends_on | status`
  (skiftlägesoberoende; backticks/fetstil tolereras; listceller kommaseparerade; `-`/`—` = tom; status `BYGGD`/`OBYGGD`,
  skiftlägesoberoende). v3.2 (B2): HTML-kommentarer och kodstaket stripas före parsning (bara den SYNLIGA texten räknas)
  och exakt EN sådan tabell får finnas — två tabeller, en dold korrekt + en synlig avvikande, eller en tabell enbart i
  kommentar/staket är alla röda; (v3.3 N3) varje annan synlig tabell vars rubrik bär både `slice` och `task` (t.ex. en
  7-kolumns "läsvy") är också röd — en sanning. Kanari med två tabeller, kommentardold + synlig, stakettabell, enbart
  dold tabell och 7-kolumnstabell. (v3.3 N2) Bootstrapraden läser samma synliga text (id:n i en HTML-kommentar räknas inte). Skivmängden == autopilotens `SUBSTITUTION_ROADMAP + ROADMAP`-koder ∪ {S1, S3, L}; för varje
  autopilotskiva: task == `task_id`, exit_test == `gate_path`, allowed_write-mängd == `plan_allowed_write`,
  depends_on-mängd == `required_deps`; S1/S3: task h-017/h-004, exit_test och depends_on == specradens, ingen
  skrivyta (`-`), `BYGGD`; L: task `-`, exit_test == `EMPIRICAL_GATE_PATH`, ingen skrivyta, depends_on == alla
  autopilotskivors task-id; status `BYGGD` ⇔ exit_test-filen är spårad vid HEAD; varje rad vars task har en specrad
  har specradens `exit_test`; selftests literala `sub_exact`/`road_exact` täcker exakt autopilotkoderna och stämmer
  med tabellen. Specen är byte-fryst (332f07ce) — planen kopierar inte specradernas `docs/05`-ytor.
- `f4_plan_generation_bootstrap_section_names_h031_to_h039_as_platform_establishment` (v3): ett `## `-avsnitt vars
  rubrik bär `bootstrap` namnger alla nio h-031…h-039 (bootstrap etablerar plattformen; delegationsdokumenten är
  read-only och omdefinieras inte — semantiken läses av granskaren).
- `f4_plan_generation_has_required_sections_syfte_malbild_skydd_skivtabell_bootstrap_arbetsflode_avslutskriterier` (v3.2
  N7): planens synliga text har `## `-rubriker som matchar `syfte`, `målbild`, `skyddade invarianter|tekniska skydd`,
  `skivtabell`, `bootstrap`, `arbetsflöde`, `avslutskriteri`, var och en med ≥3 icke-tomma kroppsrader. Planens substans
  mäts alltså via skivtabellen + de krävda avsnitten + tokenmängderna; kriterier och negativa kontroller per skiva läses av
  den oberoende produktgranskningen. RECON-kartan (`~/nortropic/RECON-PLANGENERATION-20260910.md`, sha256
  `e01fcfa5a7bf948c0de0a42079f995eb64772a19f496891b88c525f5d56b4625`) är vägledning för författandet, inte en pinne.
- `f4_architect_and_empirical_runner_skills_name_plan_generation_and_no_plan_commit` (v3):
  `.agents/skills/nortropic-architect/SKILL.md` och `nortropic-empirical-runner/SKILL.md` namnger den nya planens
  sökväg och saknar `<PLAN_SHA>`, `frozen autonomous-loop plan commit`, `git show {…|<…|<hex>:` och den gamla planens pekare.
- `f4_autopilot_substitution_blobs_equal_head_blobs_of_generation_documents`: `SUBSTITUTION_BLOBS`
  ⊇ de elva dokumenten och varje OID == kandidatens HEAD-blob (pinnar uppdateras när generationen ändras).
- `f4_autopilot_selftest_none_returns_pass_prints_plan_generation_and_no_plan_sha` (v3.1 N2): `selftest(None)` returnerar,
  stdout bär `AUTOPILOT_V4_SELFTEST=PASS` (control-set-grinden binder strängen) och exakt raden
  `PLAN_GENERATION=<modulens PLAN_GENERATION>` men ingen `plan_sha`/`PLAN_SHA`-rad; `f4_autopilot_publication_callers_exit0`, `f4_controller_loop_cli_unchanged_vs_332f07ce`.

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
  `controller/attest/cli` (utanför produktytan; bär de historiska refreeze-konstanterna),
  `docs/loop/owner-author-workflow-v1.md`, `docs/loop/remaining-bootstrap-delegation-v1.md`,
  `docs/loop/document-authority-local-development.md`, `SEPARATION-20260910/{README.md,ALLOCATION.tsv,WEB-TRANSFER-PROVENIENS.tsv}`
  byte-identiska (blob-OID) med 332f07ce och arbetsträdet == HEAD; grinden 755 och lika den hållna kopian.
- `f6_earlier_local_gates_identical_to_332f07ce`: control-set-, launch-cwd- och governance-grinden oförändrade.
- `f6_efterarbete_append_only_vs_332f07ce_with_scanned_addition`: `SEPARATION-20260910/EFTERARBETE.md` börjar
  med 332f07ce-bytes; det tillagda saknar webb- och människohandstoken (basdelen är uppdelningens evidens).
- drift.md append-only (F2).

### F7 — de tre tidigare frysta lokala grindarna mot kandidaten
Grinden kör den hållna kopian: subjektets egen fil när dess blob == `332f07ce:<grind>`, annars en
`--held-*`-override som måste ha exakt den bloben (annars FAIL-rad, aldrig subjektets avvikande kopia).
Kvalificeringen kör alltså alltid 332f07ce-bytes av de tre grindarna. Kör aldrig två fullkörningar i samma
`TMPDIR`: launch-cwd-grindens h036-residuekontroll ser den andra körningens rötter (mätt flaky 2026-09-10).
Riggnot: grinden städar inte sitt `FIXTURE_ROOT` (replikor, hållna grindars rötter, `result.json` ligger kvar
som evidens) — den som kör ansvarar för att ta bort scratch efter att `result.json` bokförts.
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
  `nortropic-repos/nortropic-webbforvaltning`, den gamla roten `~/nortropic/` / `/Users/elinhaggstrom/nortropic/`
  (evidensarkivet `…/nortropic/evidence/` undantaget) eller en sökväg till något ANNAT syskonrepo under
  reporoten — `(~|$HOME|/Users/elinhaggstrom)/nortropic-repos/<x>` där `<x>` ≠ `nortropic-system` (samma
  mönster ingår i den trädvida kod-/textskanningen; kanari: `/Users/elinhaggstrom/nortropic-repos/webb/AGENTS.md`,
  `~/nortropic-repos/x/y.sh`, `$HOME/nortropic-repos/webb` träffar, plattformsroten träffar inte). Undantag:
  `SEPARATION-20260910/**`, `verify/**`, `docs/loop/arkiv/**`, `*-local-development.md`,
  `specs/tasks.spec.json` (frysta rader), `drift.md`, owner-author-workflow, remaining-bootstrap
  (v3: plangenerationen är inte undantagen). Pythonfiler mäts på AST-strängkonstanter (docstrings/kommentarer är inte körbara
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
v3 (plangenerationen): (a) gamla planens bytes under den nya sökvägen med autopiloten ompinnad till den bloben;
(b) `git show 0b3212c9…:` i en prompt, (b2) `git show {…}:` via klammerplatshållare utan sha; (c) `PLAN_SHA=` i
selftests utdata (hopsatt så att källskanningen inte ser den); (d) `<PLAN_SHA>` i arkitektskillen; (e) planen
med `docs/07-konstitution.md` som överordnad; (f) skivtabellen driver från autopilotens ROADMAP (ett beroende bort);
(g) full-roadmaps Authority namnger den gamla sha:n; (h) grindmutant som återinför plankopiornas undantag (kanari);
(i) substitutionskontraktets ingress namnger den gamla sha:n; (j) den gamla handoffens blob under
`SEPARATION-20260910/`; (k) planen i samma listpunkt som "inte dagens instruktion" i routern; (l) en senare
`## `-not i drift.md:s svans med `docs/07`; (m) `ROADMAP_PLAN_SHA` behållen vid sidan av `PLAN_GENERATION`; (n) en
prompt injicerar ett odeklarerat dokument (`implementation-v4.1.md`); (o) S2 markerad `BYGGD` utan grind; (q)
`ägarterminalen` i planen; (r) `CODEX_START_HERE` i handoffen; (s) "Historisk källa: `…autonomous-loop-plan-v1.md`" i planen.
v3.1 (granskarens, kontrakt nr 5): (a02) odeklarerat dokument via moduldict i `builder_prompt`; (a04) `git show 0b3212c991d4:`
i AGENTS Historik med ompinnade pinnar; (a10) odeklarerat dokument via `str.format`; (a11) selftest skriver literal
`PLAN_GENERATION=platform-v1-legacy`; (a13) builder-skill läser planen med `git show <PLAN_SHA>:`; (a23) planen bara i en
oanropad funktion, alla levande prompter utan plan/handoff; (a28) EFTERARBETE-svans med gamla planfilen "(fryst input)".
Resultat: se Utfall.

### F10 — riggdisciplin
Kanarier (traceback är inget utfall; okänt driverscenario; driverfel; tokenskannern fångar
webb-/människohandstoken och släpper undantagen; slutningsextraktionen följer backticks och
relativa länkar; (v3) planskanningen fångar den gamla planens pekare, `docs/05-beslutslogg`/`ägarterminalen`/
`Verkstadsgolvet`/`gh pr merge`/`målbild §`/`CODEX_START_HERE` och släpper en legitim skivrad, `git show <…|{…|<hex>:`
fångas men `git show HEAD:` släpps, 12-hex-/40-hex-/versal-/9-hex-formerna av den gamla commiten och blobprefix fångas men
hex-föregången och 41-hex-form släpps, `<PLAN_SHA>`/`PLAN_SHA=`/"frozen autonomous-loop plan commit" fångas men
`plan_sha256`/`PLAN_GENERATION=` släpps, tabellparsern läser en fixturtabell exakt, och plangenerationen står inte i något
undantag — en grindmutant som återinför undantaget faller här), strikt JSON (dubblerad nyckel = fel), `result.json`, subjektets och den hållna
grindens bytes oförändrade, utvecklingsdokumentet spårat med avsnitten Enkelt förklarat /
Avgränsning och roller / Kriterium (effekter) / Produktyta för BUILDER / Vad grinden inte bevisar / Utfall.

## Produktyta för BUILDER

Ordinarie arbete genom rollflödet (ägarbeslut 2026-09-10). Exakt lista (`specs/tasks.spec.json` ändras INTE).
**v3.1-förtydligande (N7):** punkterna 1, 4, 5, 6 och 7 är v2.5:s yta och redan UTFÖRDA i integrationen `320c9df7`
(84/84 under v2.5); registret (p.4) rörs därför inte igen — p.8 gäller. v3/v3.1:s yta är p.2 (plangenerationen), p.3
(autopiloten), p.5b (skills), p.5c (plandokumenten + pinnar, inkl. `PLATFORM_DOCUMENTS` för plan och handoff).

1. **Bort ur trädet:** `docs/loop/arkiv/regler-fore-2026-09-10.md`,
   `docs/loop/arkiv/byggplan-v3-fore-2026-09-10.md`, `docs/loop/arkiv/spec-styrningsfalt-fore-2026-09-10.md`,
   `scripts/check-verifierarregistret.mjs`. **Ny:** `SEPARATION-20260910/WEB-TRANSFER-PROVENIENS-2.tsv`
   (kolumner path · blob-OID vid 332f07ce · destination i webbrepot · not; OID:erna är
   `6b41bcd4…`, `bd298bcf…`, `a847ade1…`, `2d018d65…`). Överföringen till webbrepot är gjord av roten
   (`nortropic-webbforvaltning` commit `e4c8c52`, `SEPARATION-ORIGIN/transfer-20260910-2/`).
2. **Plangenerationen (v3, ersätter v2.5:s plankopior):** nya filer `docs/loop/autonomous-loop-plan-platform-v2.md`
   och `docs/loop/autonomous-loop-platform-handoff-v2.md` (läge 100644), författade av buildern ur rekognoseringens
   KEEP/REWRITE/REMOVE-karta (`~/nortropic/RECON-PLANGENERATION-20260910.md` §A): funktionella mål, tekniska skydd
   (G20, sökvägsuppslag, register utanför skrivytan, ingen force, promotion under lease, eventström utan authority,
   providerutdata aldrig trust) och kvarvarande plattformsarbete bevaras; webbstyrning (`docs/07`/`docs/03`/`docs/05`,
   konstitution/regelverk), människohandskrav (ägarhand/ägarterminal/ägarbeslut, "fråga ägaren") och
   verksamhetsberoenden (kundfabrik/kundflöde, Slack-webhook, Verkstadsgolvet, Jonkebronk, målbild §x) tas bort;
   GitHub/Promoter-värden är publiceringsmål och externa mätningar (OVERIFIERAT tills mekaniskt ommätta).
   Obligatoriskt innehåll: den maskinläsbara skivtabellen (kolumner `slice | task | exit_test | allowed_write |
   depends_on | status`; S1/S3 `BYGGD` utan skrivyta; SUB-1…SUB-4, S2, S4–S13 exakt som autopilotens tuplar;
   L = `verify/bin/autonomous-loop-exit`, beroende av alla skivors task-id, `OBYGGD`; exakt EN sådan tabell, synlig —
   inte i HTML-kommentar eller kodstaket), ett `## …bootstrap…`-avsnitt som namnger h-031…h-039 utan att omdefiniera
   delegationsdokumenten, `PLAN_GENERATION`-identiteten (blob vid HEAD) och (v3.2) `## `-avsnitten Syfte, Målbild,
   Skyddade invarianter/tekniska skydd, Skivtabell, Bootstrap etablerar plattformen, Arbetsflöde
   (test-author → granskning → builder → granskning → lokal kvalificering), Avslutskriterier (≥3 rader var).
   De gamla kopiorna `docs/loop/autonomous-loop-plan-v1.md`/`autonomous-loop-codex-handoff.md` tas bort ur HEAD; de
   gamla objekten stannar i historiken. Inga pekare till den gamla planen (sha, 8-prefix, blobbar, sökvägar, gren,
   etiketterna effekt-authority/fryst input/historisk källa) i någon aktiv fil.
3. **Autopilot** `scripts/nortropic-codex-autopilot.py` (E.2): `--repo`/`--worktrees` utan gammal rot;
   `ROADMAP_PLAN_SHA` bort, `PLAN_GENERATION = "<builderns värde>"` in, `ROADMAP_PLAN_PATH/ROADMAP_HANDOFF_PATH` = nya
   sökvägar, `ROADMAP_PLAN_BLOBS` = nya HEAD-blobbar (enda identitet); `ensure_roadmap_plan` (namnet behålls) verifierar
   `HEAD:<fil>` (ingen fetch, ingen gren), journalfält `plan_generation`; alla `git show {SHA}:{PATH}` i prompterna
   (roadmap_test_author 1479, slice_builder_extra 1658, empirical_gate_test_author 1768) → "läs `{PLAN_PATH}` och
   `{HANDOFF_PATH}` vid HEAD i den auktoritativa arbetskopian; orkestratorn har verifierat bloben"; alla `PLAN_SHA=`-rader
   (architect 907, roadmap-prompter 1465/1525/1548, empirical 1761/1807/2044, selftest 2631, status 2682,
   roadmap_status 2704, doctor 2801) → `PLAN_GENERATION=`; `slice_authority_text` 1372 → plangenerationen;
   kommentaren 186–189 och docstring 2–7 utan `ROADMAP_PLAN_SHA`; `selftest` 2578 → identitetsvakt på
   `PLAN_GENERATION` + `ROADMAP_PLAN_BLOBS`; något prompt injicerar `docs/loop/codex-evidence-contract.md` (t.ex.
   `agent_prompt_common`) och prompterna namnger både plan och handoff; `SUBSTITUTION_BLOBS` = nya HEAD-blobbar för de
   elva dokumenten; `selftest`:s hårdkodade kontrakts-blob uppdaterad. `ROADMAP[0]` förblir S2/h-015 och skivtuplarna
   ändras inte (h-032-exit och governance-grinden binder dem). Codex-/providermaskineriet lämnas (SUB-1 nästa).
4. **Verify-cli** `controller/verify/cli`: `PLATFORM_REGISTER`, `PLATFORM_DOCUMENTS` (sha256 av de
   slutliga dokumenten). `controller/verify/register.json`: ny not utan människohand/webbgrind,
   `register_version` stegad, check-invariants-posten oförändrad.
5. **Config:** `config/premiar-backlog.json` (specens `denied_write`; `docs/05` → `docs/loop/drift.md`),
   `config/managed-settings.json` (plattformsrot, webbposter bort, registret nekat),
   `config/README.md` (r.5, 35–36, 43, 69, 92–107), `.gitignore` (webbträd bort, `SEPARATION-20260910/`
   vitlistad; `docs/`, `tests/`, `scripts/` förblir hela vitlistor — se F3).
5b. **Skills (E.3):** `.agents/skills/nortropic-architect/SKILL.md` r.3/16/21/23 och
   `nortropic-empirical-runner/SKILL.md` r.14/16: plangenerationens sökväg vid HEAD, blob-verifierad av orkestratorn;
   inget `git show <PLAN_SHA>`, inget "frozen autonomous-loop plan commit", ingen gammal sökväg.
5c. **Plandokumenten (E.4):** `docs/loop/codex-autopilot-v3-full-roadmap.md` `## Authority` → `PLAN_GENERATION=`,
   nya `ROADMAP_PLAN_PATH`/`ROADMAP_HANDOFF_PATH`, `AGENTS.md`, blob-läsning vid HEAD (r.16 skrivs om); `AGENTS.md`
   r.127 (v3-raden) utan sha, `## Auktoritetsordning` får den nya planen som EGEN punkt (aktivt dokument, inte i samma
   punkt som markörnoten för frysta dokument), `## Historik` namnger den tidigare plangenerationen som historia i
   Git-historiken (utan sha/blob/sökväg) och den nya som aktiv; `docs/loop/harness-substitution-contract-v1.md` ingress
   r.7 utan commit + nytt `## 15. … 2026-09-10 … (v1.2)` som namnger den nya planens sökväg och `AGENTS.md` (§1–§5,
   §7–§11, §13 orörda); `docs/loop/drift.md` appenderad not som namnger den nya planens sökväg (hela svansen skannas);
   `README.md` r.38 utan de gamla filnamnen. Pinnar: `controller/verify/cli` `PLATFORM_DOCUMENTS` och autopilotens
   `SUBSTITUTION_BLOBS` för AGENTS/README/drift/kontraktet (och varje annat ändrat generationsdokument); (v3.1 N5)
   `PLATFORM_DOCUMENTS` får dessutom `docs/loop/autonomous-loop-plan-platform-v2.md` och
   `docs/loop/autonomous-loop-platform-handoff-v2.md` med sha256 (elva-mängden i `SUBSTITUTION_BLOBS` oförändrad).
   (v3.1 B3) Varje roadmap-/empirisk-/arkitektprompt — även SUB-grenarna i `slice_builder_extra`/`slice_authority_text` —
   namnger både plan och handoff i sin PRODUCERADE text; byggarna måste kunna anropas med fixturargument (sträng-shas, tom
   signal, ett fynd, verkliga skivor) utan sidoeffekter. (v3.2 B1) Mängden promptbyggare (15 namn), flöden
   (`empirical_gate_contract_flow`) och byggaranropare (8 namn) är SLUTEN: inga nya/omdöpta prompt-, tvilling- eller
   flödesfunktioner; varje runner-anrop får sin prompt från en förväntad byggare (eller inlinad text i det förväntade
   flödet); varje krävd byggare nås från `main()`. `ensure_roadmap_plan` verifierar båda filernas blob (N2); `controller/verify/cli`
   itererar `PLATFORM_DOCUMENTS` självt i prepare/check för plan OCH handoff (N3/v3.3 N5). Inga skiftlägestvillingar
   eller NFC/NFD-tvillingar av spårade sökvägar (N4). (v3.3 B1/B2) Varje runner-prompt har ett direkt byggaranrop som
   rot; ingen runner-alias, ingen modul-/klassnivåmall med rollmarkör, inga parameter-genomsläpp av prompttext; exakt
   {doctor, empirical_gate_contract_flow, full_roadmap, roadmap_contract_flow, roadmap_status} anropar `ensure_roadmap_plan`
   och flödena stoppar där vid muterad plan; byggarna får inte skriva utanför fixturen (inte heller till `/private/tmp`).
6. **Dokument:** `AGENTS.md` (Historik → Git-referenser/webbrepot utan sökväg), `README.md` (r.8, 21, 28),
   `docs/loop/regler.md` (r.9–10), `docs/loop/byggplan-v3.md` (r.9, 113, 166),
   `docs/loop/codex-autopilot-v3-full-roadmap.md` (r.17, 115), `docs/loop/harness-substitution-contract-v1.md`
   (ingress r.5, §6, §12 + daterat tilläggsavsnitt; §1–§5/§7–§11/§13 orörda),
   `docs/loop/codex-evidence-contract.md` (r.120, 130, 135–144), supersessionshuvud i
   `docs/loop/implementation-v4.1.md` och `docs/loop/codex-autopilot-v2.md`, appenderad not i
   `docs/loop/owner-h003-attestation-authority-v1.md` (§9), appenderat `## Aktiv plattformsnot` i
   `docs/loop/drift.md`; supersessionshuvud i `docs/loop/loop-review-2026-07-31.md` (historisk granskning;
   trädvid skanning träffar annars `konstitution` r.74/210); `AGENTS.md` `## Auktoritetsordning` p.5 markerar
   owner-author-workflow och remaining-bootstrap-delegation som fryst grindinput, inte dagens instruktion;
   `README.md` namnger inte webbrepot (`nortropic-webbforvaltning`); Fasgränser-stycket och Historik-stycket i
   `AGENTS.md` bär markörerna `fryst`/`historisk` + `inte dagens instruktion` vid omnämnandet av
   remaining-bootstrap-delegation respektive plankopiorna.
7. **Tester:** `tests/controller/loop/fall.py` B2 (webbfixtur/INV-004 → PINV-sabotage, t.ex.
   `push --force` i `controller/<x>/cli` → PINV-005).
8. **Inte rörs:** `verify/**` (utom att denna grind redan ligger där), frysta träd/filer i F6,
   `controller/loop/cli`, `specs/tasks.spec.json` (kräver ingen ändring; frysta rader behålls),
   `scripts/check-invariants.mjs`, `controller/verify/register.json`, `docs/loop/remaining-bootstrap-delegation-v1.md`,
   `docs/loop/owner-author-workflow-v1.md`, providermaskineriet (`run_codex`, rollpolicyn, `CODEX_FULL_ACCESS_MODE`),
   autopilotens skivtuplar och `EMPIRICAL_GATE_PATH`. Refreeze av h-036/h-037/h-035/h-038/document-authority (stale
   pinnar på autopilot/AGENTS/drift) är ett separat H-steg som plangenerationens ändring bör batchas med (recon D).

## Vad grinden inte bevisar

- Att webbrepot faktiskt bär de överförda filerna: grinden läser aldrig webbrepot (plattformen ska
  fungera utan det); proveniensen binds mot 332f07ce-objekt i plattformens egen historik.
- (v3.1) Prompter som inlinas direkt i ett flöde (t.ex. remedieringsprompten i `empirical_gate_contract_flow`) mäts bara
  statiskt (AST-literaler), inte som producerad text — flöden anropas inte. En byggare som kräver argument utanför
  fixturmängden faller rött (fail-closed), inte tyst grönt.
- (v3.2/v3.3) Grind-fingeravtryck (N1): en byggare kan producera planen bara under mätning (bench-miljön, den stubbade
  runnern och fixturargumenten är synliga; modulnamnet slumpas) — produktgranskningen läser byggarna och flödena. Sluten
  värld (N6-arv): base64/gzip-bilagor, zero-width-/blankstegsdelade prefix och semantisk override utan token fångas inte;
  dubbletter/omordning i `allowed_write` är mängdsemantik; körtidsläsning av planfilen i en byggare mäts inte (sökvägs-
  och blobbindningen + `ensure_roadmap_plan`-vakten är identitetsskyddet). Den statiska klassificeringen är fail-closed:
  en legitim refaktorering av promptvägen (nya byggare, indirektion, klassbaserade prompter) är röd per design och kräver
  ny kontraktsversion; den dynamiska live-mätningen kör flödena med stubbad runner och stubbad worktree-/origin-hantering
  — Git-/providerbeteendet bortom första runner-anropet mäts inte här (control-set-grinden och loopsviten mäter det).
- (v3) Planens semantik bortom token: att skivkriterierna troget bevarar den gamla planens funktionella mål,
  tekniska skydd och negativa kontroller, att bootstrapavsnittet inte omdefinierar delegationsdokumenten, och att
  `PLAN_GENERATION`-värdet är meningsfullt — grinden binder tabellen, tokenmängderna och pekarna; texten läses av
  den oberoende granskningen. En etikett för den gamla planen utan pekare (t.ex. auditens r.241 `autonomous-loop-plan-v1`
  utan sökväg/`.md`) fångas inte — den kan inte mekaniskt återinföra planen.
- (v3) Att h-036/h-037/h-035/h-038/document-authority-grindarna går gröna efter autopilot-/AGENTS-/drift-ändringen
  (pinnarna är redan stale sedan separationen; refreeze är ett eget H-steg), eller att h-017-exit går grönt på
  plattformen (läser frånvarande webbfiler).
- (v3) Beroendekonflikten S6/h-014 (spec `depends_on: [h-013]`, autopilot h-019) och specradernas `docs/05`-ytor:
  specen är byte-fryst i detta kontrakt; planen binds mot autopilotens tuplar och specradens `exit_test`, inte mot
  specradens `depends_on` för obyggda skivor.
- Att frysta H-grindar går gröna på kandidaten (h-016/017/036/037/038 läser webbfiler vid körning;
  refreeze hör till nästa H-steg) eller att `document-authority-exit`/`h-035-exit` gör det.
- Att managed-settings är installerad (extern rootceremoni) eller att Claude Code/Codex faktiskt
  respekterar dem i drift.
- Att texten i oförändrade, byte-bundna avsnitt (substitutionskontraktets §1–§5/§7–§11/§13, de
  historiska dokumentens kroppar, drift.md:s historik) är webbfri — de är evidens och bedömdes i
  revisionen; §9 rad 307 bär `docs/05-beslutslogg.md` som observerat historiskt faktum.
- Att `*-local-development.md`-dokumentens innehåll är webbfritt: de skannas inte (de namnger token), men
  mängden är sluten (332f07ce-mängden + detta dokument) och `document-authority-local-development.md` är
  byte-bunden; de övriga fyra kan ändras utan att F2 märker det — deras form binds av respektive frusen grind.
- Kod utanför AST-strängkonstanter (kommentarer, docstrings, identifierare) skannas inte; en webbkoppling som
  bara lever i en kommentar är inte ett körbart beroende. (Autopiloten är undantaget: `f4_autopilot_source_…`
  skannar dess fulltext med EXEC-token, så även kommentarer/docstrings där fångas.)
- Obfuskering i kod: en sökväg splittrad inuti ett ord (`"konst%s" % "itution"`), base64, eller körtidsläsning
  av en fil utanför repot (`$HOME/...`, miljövariabel) fångas inte statiskt; `tests/**`-filer får bära
  `docs/05`/`docs/00` som fixturdata och en ny testfil som läser webbens beslutslogg fångas därför inte.
  Fältnamn utöver `human_only` (t.ex. `humanOnly`) är en deklarerad semantikgräns.
- Symlänkar: bara frånvaron av symlänkposter binds (F1); en symlänks mål prövas inte.
- Lägesändring (100755 → 100644) på en byte-fryst fil i F6 `FROZEN_FILES` jämförs inte (blob-OID:n är samma);
  frysta träd jämförs med läge. `../` i JSON-nyckelnamn och backslash-/procentkodade `..` fångas inte;
  `../x` i JSON-prosa räknas som hängande (accepterad överapproximation).
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

### Oberoende kontraktsgranskning 2026-09-10 → v2/v2.2
Granskaren fann att en kandidat med 14 samtidiga återinföranden passerade v1 (74/74, result 32c7a1d2…).
v2 lägger till: trädvid skanning av varje spårad fil utanför den frysta mängden, blob-OID-frånvaro,
byte-bunden spec, EFTERARBETE append-only, bredare/skiftlägesoberoende extraktion (titlade länkar, `<…>`,
valfri ändelse, `../`), kod/skal skannade med fragmenttoken (`konstitution`/`regelverk`/`beslutslogg`) och
webbrepots namn, semantiska ägarstoppstoken (`Johnny`, `klartecken`, `vänta på ägaren`, `ägarens
godkännande`), router↔undantag-not per listpunkt, sluten local-development-mängd, hållna kopior bundna mot
bas-blob, config/README bunden trädvitt (v1:s påstående att F2 täckte config/README r.5/69/92–107 var fel:
filen nås inte av slutningen). Kalibrering mot referensen: `mänsklig* godkännande` utgick (fasformuleringen
i AGENTS.md/regler.md), `human owner`/`human-hand` utgick för kodsträngar (autopilotens negationer
"not a request for the human owner"). Slutlig grind v2.2 (sha256
`6506e97af4fb2ed84088ee8112640fea6ddf1b6eeb68ae57192a5fb386e1a925`, commit `c37030c9`): router-raden döms
per listpunkt, aldrig ett efterföljande stycke (ett utkast passerade baslinjen av en slump på AGENTS.md:s
allmänna mening om frysta artefakter).

Referenskonstruktion v2.2 (scratch, förkastad; HEAD `c0ee652b…`, 143 filer; utöver v1: supersessionshuvud i
loop-review, AGENTS p.5-not "fryst grindinput … inte dagens instruktion", README utan webbreponamn,
owner-h003-not utan ordet beslutslogg; `.gitignore` med hela `docs/`/`tests/`/`scripts/`-vitlistor):
fullkörning exit **0**, **83/83**, result.json sha256
`74d1bceef847e9120045363a136491c6f027e6b88b84702c98d8281dc862cda3`; control-set 68/68 (8dcc6511…),
launch-cwd 19/20 med exakt två extra grindar (f0a0cb9d…), governance 68/70 exakt {g6, g7} (718dad1f…),
loopsvit 53 ok / 0 FEL med B2 via PINV-005, trädklassning frozen 54 / partial 7 / local-development 6 /
code 24 / test 16 / text 33 / binary 3 med 0 träffar, slutning 36 nådda / 29 skannade, 0 hängande.

Negativer mot v2.2 (24 st, var och en i egen replika av referensen, statiskt `--skip-held-gates`; alla
exit 1, inget riggfel, 0 missade). Test-authorns: (a) skill read-first docs/07 → skill-rad + slutning +
trädvid; (b) "Konstitutionen står över" i full-roadmap → full-roadmap-rad + trädvid; (c) docs/05 i premiar →
premiar ×2 + slutning + trädvid; (d) `!/workflows/` → gitignore ×2; (e) vakten återställd → F1 ×4; (f)
`docs/loop/x.md` → docs/03 via AGENTS → slutning + x_md + trädvid (+ pinnar/prepare); (g) fetch origin →
`f4_ensure_roadmap_plan_returns…`; (h) "endast av människohand" i registret → registernot + trädvid människohand
(+ pinnar/prepare). Granskarens: m0 config/README människohand → `f2_tree_wide_no_human_hand_rule…`; m1
`.txt`-dokument från skill → slutning + `…_docs_loop_prompts_txt` + trädvid; m2 omdöpt arkivkopia →
`f1_no_blob_at_head_…` + trädvid ×2; m3 worker-prompt.sh → slutning + `…_config_worker_prompt_sh` + trädvid;
m4/m4b autopilotprompt (ord / sammansatt sökväg) → trädvid; m5/m5b controller relativ webbrepo-sökväg / öppnar
webbdokument → trädvid; m6/m6b specrad ny/ändrad + ompinnad → `f3_spec_byte_identical…`; m7 EFTERARBETE aktiv
instruktion → `f6_efterarbete_append_only…`; m8/m8b titlad/vanlig länk till notes.md → slutning + `…_notes_md` +
trädvid; m9 `Docs/05-Beslutslogg.md` → slutning + skill-rad + trädvid; m10 nytt local-development-dokument →
`f2_local_development_documents_…`; m11 `../../../`-länk → slutning + x_md + trädvid; m12 `<docs/07-…>` →
slutning + skill-rad + trädvid; m13 "ägarens klartecken; vänta på Johnny" → skill-rad + trädvid människohand;
m14 ny worker-webb.sh via loop-config → slutning + `…_config_worker_webb_sh` + trädvid; m15 modifierad, olänkad
arkivkopia → trädvid ×2.

### Test-author 2026-09-10 — baslinje RED för v2.2 (före produkt)
Kommando (arbetsyta HEAD `c37030c9` = 332f07ce + grind v2.2 + detta dokument utan detta avsnitt; hållna grindar
ur subjektets byte-identiska kopior; eget `TMPDIR`):
`python3.12 verify/bin/platform-separation-final-exit --subject <arbetsyta>` → exit **1**,
`RED_LOCAL_QUALIFICATION`, **51 PASS / 36 FAIL** (87 rader), result.json sha256
`f43f6ef159ee20e0342e2bbb087de16438eb8a5ff4d5da61c80ec2e2c61bf769`.
Röda rader (alla av rätt skäl): F1 ×4 (`check-verifierarregistret.mjs` i trädet; arkivkopior + vakten kvar;
proveniens-2 saknas; fyra blobbar lika de överförda objekten); `f2_closure_all_active_references_…`;
`f2_active_doc_…` ×9 (managed-settings, premiar-backlog, tre arkivkopior, byggplan r.113, full-roadmap r.17/115,
evidenskontraktet r.120/130/137/139/144, substitutionskontraktet r.5+§6); `f2_tree_wide_no_web_governance_…`
(.gitignore webbvitlistor, config/README r.35/69, managed-settings, registret, arkivkopiorna, …);
`f2_tree_wide_no_human_hand_rule_…` (registrets not, arkivkopiornas HÖGRISK/"av människa", config/README);
`f2_router_authority_section_…` (p.5 nämner owner-author-workflow/remaining-bootstrap utan fryst-not);
`f2_substitution_contract_…`; `f2_historical_document_…` ×4 (v4.1, v2, owner-h003, loop-review); `f2_drift_md_…`;
F3: premiar, managed-settings, gitignore-effekt, gitignore-vitlista (18 frånvarande träd), registernot;
F4: argparse-defaults (`~/nortropic/…`), plankopior, `ensure_roadmap_plan` ×3 (Stop: `git fetch origin
plan/autonomous-loop-v1` — transport 'file' not allowed); F5 ×2 (agents/qa-launcher.md, INV-004; 52 ok / 1 FEL);
`f8_no_tracked_file_couples_…` (config/README r.35–36/43, managed-settings ×26).
Gröna: kanarier ×5, `f2_local_development_documents_…`, `f3_spec_byte_identical_…`, preflight, PINV 6/0,
platform-prepare/-check, selftest, publication-callers, loop-cli oförändrad, F6 ×3 (fryst evidens, tidigare
grindar, EFTERARBETE append-only), F7 ×3 (control-set 68/68; launch-cwd 19/20 med exakt två extra grindar;
governance 68/70 röd exakt på g6/g7 — deltan orsakas redan av grindens egen närvaro), F10 ×2.

### Oberoende kontraktsgranskning nr 2 (på 4e139294) → v2.3
Granskaren bekräftade satisfierbarhet (83/83) och 20/20 gamla mutanter, men fann sex nya luckor. v2.3 (grind
sha256 `f9708786415c0d5f9db9c994a09964f92145b1d4636fb4261164e69e7f31a6dd`, commit `77a09be4`) lägger till:
`f1_no_symlink_entries_at_head` (n13); exakt mängd {attest/cli: expected_refreeze, h038_proof} i stället för
namnmönstret `refreeze|h03[5-9]` (n28); router-regeln över hela AGENTS.md + CLAUDE.md per stycke/listpunkt
(n18b); hård ägarstoppsmängd även i supersessionsnoterna (n16); `../`-referenser utanför trädet är hängande
(n12b); token `human_only` i text/JSON (n15). Kalibrering: `../` inuti en markdownlänk bedöms genom
upplösningen (en `../loop/z.md`-länk som stannar i trädet är legitim); ordet "human-only" förblir undantaget.

Referenskonstruktion v2.3 (scratch, förkastad; HEAD `444986f8…`, 143 filer; utöver v2.2: markörerna
`fryst … inte dagens instruktion` i AGENTS.md:s Fasgränser- och Historik-stycken): fullkörning exit **0**,
**84/84**, result.json sha256 `e4bf8967be7eefad7286b02e72998d3515b2f2efc32188741b1248bed676d09f`; control-set
68/68 (47c354b2…), launch-cwd 19/20 (db438881…), governance 68/70 exakt {g6, g7} (e335e33b…), loopsvit 53 ok,
trädklassning frozen 54 / partial 7 / local-development 6 / code 24 / test 16 / text 33 / binary 3, 0 träffar.

Negativer mot v2.3 (58 st, statiskt `--skip-held-gates`, inga riggfel): test-authorns a–h fångade (rader som
i v2.2, e dessutom `f1_no_blob…`); granskarens m0–m15 fångade (rader som i v2.2); granskarens n-serie:
n01 kommentar i autopilot → `f4_autopilot_source_…`; n02 f-sträng → trädvid; n06 test-sh docs/07 → trädvid;
n07/n07b ny skill-katalog / olänkad sidofil → slutning+skill-rad+trädvid / trädvid; n08 ny katalog under
docs/loop → trädvid; n09/n09b ny fil under SEPARATION resp. proposed → trädvid / F6; n10/n11 webbvärde i
owner-production-paths / provider-identity → slutning+dokumentrad+trädvid; n12 CLAUDE.md webbauktoritet →
slutning+CLAUDE-rad+trädvid; **n12b** `../webb/…` → `f2_closure_all_active_references_…`; **n13** symlänk med
frånvarande mål → `f1_no_symlink_entries_at_head`; n13b symlänk mot webbrepot → symlänkrad+slutning+dokumentrad;
n14/n14b blobkopia under verify/ resp. controller/ → `f1_no_blob…`+F6 / `f1_no_blob…`+trädvid×2; **n15**
`human_only`-fält i premiar → premiar-rad ×2 + trädvid människohand; **n16** hårt ägarstopp i v4.1-huvudet →
`f2_historical_document_…_implementation_v4_1_md`; n18 plankopia lyft i Auktoritetsordning → routerraden;
**n18b** plankopia lyft i annan sektion → routerraden; n19 zero-width i token → slutning (hängande); n22
HTML-kommentar i docs/loop → trädvid; n24 controller/prompts/system.md → trädvid; n25 tests-json docs/05 →
trädvid; n26/n26b funktion döpt h036_/refreeze_ → trädvid + `f4_autopilot_source_…`; n27 docstring injicerad
i prompt → `f4_autopilot_source_…`; **n28** `h035_rules()` i policy-cli → trädvid.
Missade, medvetet utanför omfång (står i Vad grinden inte bevisar): n03 `%`-splittring inuti ordet, n04 base64,
n05 ny testfil som läser docs/05 (tester är fixturmedvetna), n20 worker-prompt läser `$HOME`-fil, n21 autopilot
läser miljövariabelstyrd fil, n23 `.github/workflows/ci.yml` (ignoreras av vitlistan och blir aldrig spårad;
tvingad spårning fångas av `f1_every_tracked_file_…`, mätt av granskaren som n23f).

### Test-author 2026-09-10 — baslinje RED för v2.3 (före produkt)
Kommando (arbetsyta HEAD `77a09be4` = 332f07ce + grind v2.3 + detta dokument utan detta avsnitt; hållna grindar
ur subjektets byte-identiska kopior; eget `TMPDIR`):
`python3.12 verify/bin/platform-separation-final-exit --subject <arbetsyta>` → exit **1**,
`RED_LOCAL_QUALIFICATION`, **52 PASS / 36 FAIL** (88 rader), result.json sha256
`2a9f3d4c005cb2c13c0335d6c654bcdbcf6866500ecac87ff7e7c4df0e27ff05`.
Röda rader: samma 36 som v2.2 (F1 ×4, slutning, `f2_active_doc_…` ×9, trädvid ×2, router (nu även Fasgränser-
stycket), substitutionskontraktet, historiska ×4, drift, F3 ×5, F4 ×5, F5 ×2, F8). Gröna: kanarier ×5,
`f1_no_symlink_entries_at_head`, local-development-mängd, spec byte-lik, preflight, PINV 6/0, prepare/check,
selftest, publication-callers, loop-cli, F6 ×3, F7 ×3 (control-set 68/68; launch-cwd 19/20; governance 68/70
exakt g6/g7), F10 ×2.

### Oberoende kontraktsgranskning nr 3 (på a6953ac5) → v2.4
Två grindinterna luckor utan kriterieändring i sak, plus kalibrering. v2.4 (grind sha256
`915e7c51f161a3b3b8e83516112d4669cf8571e9ddc41ed0d05ef3c02050f9ea`, commit `bd8c0a2f`): `controller/attest/cli`
byte-fryst mot 332f07ce i F6 (filen ligger utanför produktytan; gör det namnbundna undantaget
{expected_refreeze, h038_proof} säkert — p04b/p04d); `refs_from_json` räknar `../`-strängvärden som hängande
(p08/p08c); markörregexen tolererar radbrytning i "inte dagens instruktion" och böjningen `frus…` (p02/p09 är
legitima formuleringar, inte återinföranden). `humanOnly` förblir deklarerad semantikgräns (p05).

Referenskonstruktion v2.4 (scratch, förkastad; HEAD `a630e152…`, 143 filer, samma innehåll som v2.3):
fullkörning exit **0**, **84/84**, result.json sha256
`d8e90b8117f2cb03b490a7fd585c31ab76da9f47c78b76929b103739f87aceb6`; control-set 68/68 (5f36c1ed…), launch-cwd
19/20 (73294f30…), governance 68/70 exakt {g6, g7} (2eba2c6e…), loopsvit 53 ok, trädklassning oförändrad, 0 träffar.

Negativer mot v2.4: **77 körda, 68 fångade, 0 riggfel.** Alla 52 tidigare fångade (a–h, m0–m15, n-serien) fångas
på samma rader (p04b-typen nu via F6). Granskarens p-serie: p01 markör i föregående stycke → routerraden; p03
fryst dokument via relativ länk → routerraden; p04 `expected_refreeze` i annan fil → trädvid; **p04b**
omdefinierad `expected_refreeze` i attest/cli → `f6_frozen_evidence_…`; p04c/**p04d** nästlad def i `h038_proof` →
F6 (+ trädvid för p04c); p06 symlänkad katalog utan referens → `f1_no_symlink_entries_at_head`; p07 `./../../../`-länk
inuti trädet → slutning + x_md + trädvid; **p08** `"rules": "../webb/AGENTS.md"` → `f2_closure_all_active_references_…`;
p08b `../nortropic-webbforvaltning/…` → slutning + loop-config-rad + trädvid; **p08c** `worker_cmd` mot syskonrepo →
`f2_closure_all_active_references_…`; p10 CLAUDE.md lyfter plankopian → routerraden.
Inte fångade (9): n03/n04/n05/n20/n21/n23 (utanför omfång, som ovan), p05 `humanOnly` (deklarerad semantikgräns),
p02 och p09 (avsiktligt accepterade formuleringar: radbruten fras respektive "frusen" — markören finns, dokumentet
lyfts inte).

### Test-author 2026-09-10 — baslinje RED för v2.4 (före produkt)
Kommando (arbetsyta HEAD `bd8c0a2f` = 332f07ce + grind v2.4 + detta dokument utan detta avsnitt; hållna grindar ur
subjektets byte-identiska kopior; eget `TMPDIR`):
`python3.12 verify/bin/platform-separation-final-exit --subject <arbetsyta>` → exit **1**,
`RED_LOCAL_QUALIFICATION`, **52 PASS / 36 FAIL** (88 rader), result.json sha256
`ad9aa6288d1f165d8d529ed211776b1b22982105672439544d54c8dd9deaa5c2`. Röda och gröna rader identiska med v2.3
(F6 grön: attest/cli är byte-lik basen; F7: control-set 68/68, launch-cwd 19/20, governance 68/70 exakt g6/g7).

### Oberoende kontraktsgranskning nr 4 (på d7cd584f) → v2.5
En grindintern lucka: F8 fångade webbrepots namn och gamla roten men inte en absolut/tilde-sökväg till ett annat
syskonrepo under `nortropic-repos/`. v2.5 (grind sha256 `2132ef512c7f32aacec94b63c0258b49c3a3905eb40694abd3ac3049ab33a007`,
commit `4dffec98`): `SIBLING_RE = (~|$HOME|/Users/elinhaggstrom)/nortropic-repos/(?!nortropic-system(/|$))` i F8:s
kopplingsskanning och i den trädvida kod-/textskanningen, med kanari. Granskarens noteringar bokförda i Vad grinden
inte bevisar (q01 accepterad överapproximation, q08 `../` som JSON-nyckel, q02/q02b kodade `..`, q09 lägesändring
på FROZEN_FILES).
Produktträdet `9c0a98be` (builder v4, read-only) statiskt under v2.5: 78 PASS / 6 FAIL — de fem sandboxberoende
raderna (`--skip-held-gates`) plus `f6_frozen_evidence_…` enbart därför att trädet bär grind v2.4 (`gate_ok=False`,
`problems=[]`); med v2.5 i trädet är det 79/5. Inga nya röda rader av SIBLING_RE på produktträdet.

Referenskonstruktion v2.5 (scratch, förkastad; HEAD `495e5c68…`, 143 filer, innehåll som v2.3): fullkörning exit
**0**, **84/84**, result.json sha256 `eb72ac152863b0fb38cb6bbcd21fd2b5d67d60bf2ca32068f82bced715efce84`; control-set
68/68 (d8c3dcb8…), launch-cwd 19/20 (7fc33cef…), governance 68/70 exakt {g6, g7} (997449c1…), loopsvit 53 ok, 0 träffar.

Negativer mot v2.5: **90 körda, 77 fångade, 0 riggfel.** Alla 68 tidigare fångade fångas på samma rader.
Granskarens q-serie: q01 `../x` i JSON-prosa → slutning (överapproximation, accepterad); q03 absolut
webbrepo-sökväg → loop-config-rad + trädvid + F8; q03b absolut gammal rot → F8; **q03c** absolut sökväg till annat
syskonrepo → trädvid + F8; **q03d** `worker_cmd` mot syskonrepo → trädvid + F8; q03e (test-author) `~/nortropic-repos/x/…`
→ trädvid + F8; q04 en kommentarrad i attest/cli → F6; q05/q05b `expected_refreeze`/`h038_proof` i ny fil (.py resp.
utan ändelse med annan shebang) → trädvid.
Inte fångade (13): n03/n04/n05/n20/n21/n23 (utanför omfång), p02/p09 (accepterade formuleringar), p05 `humanOnly`
(semantikgräns), q02/q02b (backslash-/procentkodat `..`), q08 (`../` som JSON-nyckel), q09 (lägesändring på
byte-fryst fil) — alla deklarerade i Vad grinden inte bevisar.

### Test-author 2026-09-10 — baslinje RED för v2.5 (före produkt)
Kommando (arbetsyta HEAD `4dffec98` = 332f07ce + grind v2.5 + detta dokument utan detta avsnitt; hållna grindar ur
subjektets byte-identiska kopior; eget `TMPDIR`):
`python3.12 verify/bin/platform-separation-final-exit --subject <arbetsyta>` → exit **1**,
`RED_LOCAL_QUALIFICATION`, **52 PASS / 36 FAIL** (88 rader), result.json sha256
`faea27bb37fb6e69afe9b3a3ce08348e2e2c3a4ff39514b222f3914ee0a3cc70`. Röda och gröna rader identiska med v2.3/v2.4
(F7: control-set 68/68, launch-cwd 19/20, governance 68/70 exakt g6/g7).

### Kontrakt v3 2026-09-10 — plangenerationen (ägarorder: den gamla planen är inte längre aktiv authority)
Grind v3 sha256 `523c53bd8dd813c648d1671385a334518cfa61d44da0d05820eea7dd9e4e6bb7` (commit `12e7dfaa`), 95 rader (v2.5: 88). Nya/ändrade rader: F1 (två gamla plankopior
frånvarande; tolv förbjudna blobbar), F2 (plangenerationen skannas som aktivt dokument med `OLD_PLAN_TOKENS` +
`PLAN_TOKENS`; `OLD_PLAN_TOKENS` trädvitt i alla klasser; `f2_plan_generation_and_handoff_reached_…`; routerraden för
plangenerationen; full-roadmap-, substitutions- (§15) och drift-raderna omskrivna, drift skannar hela svansen), F4
(planfiler + autopilotens blobbar/sökvägar; ingen `ROADMAP_PLAN_SHA`; `ensure_roadmap_plan`-raderna på nya filer;
autopilotens fulltext utan gammal commit/`git show <commit>:`/`plan_sha`; promptinjicerad dokumentmängd; skivtabell ==
ROADMAP + selftest; bootstrapavsnitt; skills; selftest skriver `PLAN_GENERATION=`), F8 (plangenerationen ej undantagen),
F10 (kanari för planskanning/tabellparser/`git show`/undantagsmängd). Beslut utöver orkestratorns P1–P8: (i) bara
PEKARE till den gamla planen är förbjudna (commit 40/8 hex som hex-ord, blobbar, sökvägar med `.md`/`docs/loop/`,
grenen) plus de tre etiketterna på båda språken — auditens r.241 (namn utan pekare) förblir tillåten; (ii) `Verkstadsgolvet`
är förbjudet i planen helt; (iii) promptmängden binds som krävd ⊆ injicerad ⊆ tillåten (krävd: plan, handoff,
full-roadmap, kontrakt, audit, evidenskontrakt, AGENTS, rapportschema; tillåtna extra: regler, byggplan, drift,
owner-h003) i stället för exakt likhet; (iv) drift.md:s hela svans skannas; (v) S1/S3-rader binds mot specraden
(task, exit_test, depends_on) utan skrivyta, L mot `EMPIRICAL_GATE_PATH` med alla skivors task-id som beroenden;
(vi) status `BYGGD` ⇔ grindfilen spårad; (vii) den nya planen måste stå i egen listpunkt i Auktoritetsordningen.

### Test-author 2026-09-10 — baslinje RED för v3 (före produkt)
Subjekt: replika av plattformsintegrationen `320c9df7` (v2.5-produkten, 84/84 under v2.5) + grind v3 + detta dokument
(fixtur-HEAD `92424535`, scratch). Kommando (bypass, egen `TMPDIR`, hållna grindar ur subjektets byte-identiska kopior):
`python3.12 verify/bin/platform-separation-final-exit --subject <replika>` → exit **1**, `RED_LOCAL_QUALIFICATION`,
**69 PASS / 26 FAIL** (95 rader), result.json sha256 `2a99fec75daf150ae124f4509a03c4abaf3ea7f5d372c76bf9e8a0a5d9eed85c`.
Röda rader (alla av rätt skäl — plangenerationen saknas, den gamla planen är aktiv): `f1_required_absences_…` (gamla
kopiorna spårade), `f1_no_blob_…` (blobbarna `c8ea8511`/`1e53887c`), `f2_closure_…` (gamla planen följs nu: `docs/03`,
`docs/05`, `docs/07` hänger), `f2_active_doc_…` ×7 (arkitektskillen r.21 gammal sökväg; AGENTS r.127/153–155 commit +
sökvägar; README r.38; gamla planen och handoffen själva — webbtoken; full-roadmap r.11; substitutionskontraktet r.7),
`f2_plan_generation_and_handoff_reached_…`, `f2_tree_wide_no_web_governance_…` (samma träffar trädvitt),
`f2_router_authority_order_…` (planen saknas i Auktoritetsordningen), `f2_full_roadmap_…`, `f2_substitution_…` (inget §15;
ingressen namnger commiten), `f2_drift_…` (svansen namnger inte planen), F4 ×10 (planfiler/blobbar; `ROADMAP_PLAN_SHA`
finns; mutated/missing utan positivt ankare; autopilotens fulltext r.71/72/94/95/2578 + `git show` r.1479/1658/1768;
promptmängden saknar plan/handoff/evidenskontrakt och injicerar den gamla planen; skivtabell saknas; bootstrapavsnitt
saknas; skills; selftest skriver `PLAN_SHA=`). Gröna: kanarier ×6, övriga F1/F3/F5/F6, F7 (control-set 68/68 result
`2a33a5c4…`; launch-cwd 19/20 med exakt `extra=[governance, denna grind]` `f9ce1deb…`; governance 68/70 exakt {g6, g7}
`c4fe0665…`), loopsviten 53 ok / 0 FEL (B2 via PINV), `f4_ensure_roadmap_plan_returns_…` (gamla kopiorna finns),
F8 ×2, F10 ×2; trädklassning frozen 52 / partial 7 / local-development 6 / code 24 / test 16 / text 35 / binary 3;
slutning 39 nådda / 31 skannade.

### Referenskonstruktion v3 (scratch, förkastad — bevisar satisfierbarhet)
Replika av `320c9df7` + grind/dokument v3 + produktytan (skript i test-authorns scratch, aldrig i repot): grov plan
`docs/loop/autonomous-loop-plan-platform-v2.md` (PLAN_GENERATION-block, målbild, tekniska skydd, skivtabell med 18 rader
S1/S3/SUB-1…4/S2/S4…S13/L, skivkriterier, `## BOOTSTRAP …` med h-031…h-039, migrationsordning, OVERIFIERAT) och handoff
`docs/loop/autonomous-loop-platform-handoff-v2.md`; gamla kopior borttagna; autopilot enligt produktyta p.3
(`PLAN_GENERATION = "platform-v2"`, nya sökvägar, `ROADMAP_PLAN_BLOBS` = HEAD-blobbar `6513b845…`/`9d1c7b2e…`, alla
`git show`/`PLAN_SHA` bort, evidenskontraktet i `agent_prompt_common`, selftest-identitetsvakt, ompinnade
`SUBSTITUTION_BLOBS`); skills, AGENTS (egen p.5 för planen, p.6 drift m.fl., Historik utan pekare), full-roadmap Authority,
substitutionskontraktets ingress + §15 (v1.2), drift-not, README r.38; `controller/verify/cli` `PLATFORM_DOCUMENTS`
ompinnad för AGENTS/README/drift/kontraktet. Fixtur-HEAD `45e0c957`, 143 spårade filer. Fullkörning (bypass, egen
`TMPDIR`): exit **0**, `PASS_LOCAL_QUALIFICATION_ONLY`, **95/95**, result.json sha256 `5050cefa61800c990f1cd11a685e1a69a57b8829dd8e32a484a21749469cf2a6`; control-set
68/68 (`b881b0a9…`), launch-cwd 19/20 med exakt två extra grindar (`19ac4f9d…`), governance 68/70 exakt {g6, g7}
(`1ecc6a6a…`), loopsvit 53 ok / 0 FEL, trädklassning frozen 52 / partial 7 / local-development 6 / code 24 / test 16 / text 35 / binary 3, slutning 36 nådda / 31 skannade,
0 hängande. Promptmängd mätt på referensen: injicerad = krävd ∪ {regler, byggplan, drift, owner-h003}.

### F9 v3 — negativer (var och en i egen replika av referensen, statiskt `--skip-held-gates`; 19 körda, 19 fångade,
0 riggfel; siffror utan de fem sandboxberoende raderna)
(a) gamla planens bytes under nya sökvägen, autopiloten ompinnad → `f1_no_blob_…`, planraden (webbtoken), slutning
(`docs/03/05/07` hänger), trädvid, autopilotens fulltext (ompinnade bloben är en gammal-plan-pekare), skivtabell,
bootstrapavsnitt; (b) `git show 0b3212c9…:` i roadmap-test-author-prompten → autopilotens fulltext + trädvid;
(b2) `git show {ROADMAP_PLAN_BLOBS[…]}:` utan sha → autopilotens fulltext (`git show {`); (c) `"PLAN_" + "SHA="` i
selftests utdata → `f4_autopilot_selftest_none_…` (källskanningen ser den inte — utdataraden gör det); (d) `<PLAN_SHA>`
i arkitektskillen → skillraden; (e) planen med `docs/07-konstitution.md` överordnad → planraden + slutning + trädvid
(+ blobraderna, planen ändrad utan ompinning); (f) h-030 bort ur S2:s beroenden → skivtabellraden (+ blobraderna);
(g) `ROADMAP_PLAN_SHA=0b3212c9…` i full-roadmaps Authority → full-roadmap-raden + dokumentraden + trädvid;
(h) grindmutant med plangenerationen åter i `CLOSURE_EXEMPT`/`TREE_FROZEN_FILES` (körd ur egen rot mot referensen) →
`canary_plan_generation_scan_rejects_…`, `f2_plan_generation_and_handoff_reached_…`, routerraden (planen blev
undantagen utan markör), promptraden (planen ej skannad), F6 (grindbytes ≠ hållna); (i) ingressen namnger commiten →
substitutionsraden (ingress) + dokumentraden + trädvid (+ pinnar/prepare); (j) gamla handoffens blob under
`SEPARATION-20260910/` → `f1_no_blob_…` (+ trädvid: filen klassas text under SEPARATION — inte fryst-listad);
(k) planen i samma listpunkt som "inte dagens instruktion" → routerraden för plangenerationen (+ pinnar/prepare);
(l) senare `## `-not i drift-svansen med `docs/07` → drift-raden + drift-dokumentraden + slutning + trädvid (+ pinnar);
(m) `ROADMAP_PLAN_SHA` behållen → `f4_autopilot_has_plan_generation_…` + fulltext + trädvid; (n) `implementation-v4.1.md`
injicerad i builder-prompten → promptraden; (o) S2 `BYGGD` utan grind → skivtabellraden (+ blobraderna); (q)
`ägarterminalen` i planen → planraden + trädvid (+ blobraderna); (r) `## CODEX_START_HERE` i handoffen → handoffraden +
trädvid (+ blobraderna); (s) "Historisk källa: `docs/loop/autonomous-loop-plan-v1.md`" i planen → planraden + slutning
(hängande) + trädvid (+ blobraderna). Ej körda/utanför omfång: etikett utan pekare (auditens r.241), semantisk
omskrivning av skivkriterier, refreeze av stale H-grindar (Vad grinden inte bevisar).

### Antaganden och UNRESOLVED (v3)
- `PLAN_GENERATION`-värdet är builderns; grinden binder bara att det är en icke-tom sträng och att full-roadmap
  bär exakt samma värde. `AUTOPILOT_V4_SELFTEST=PASS` behålls (control-set-grinden binder strängen).
- Skivtuplarna, `EMPIRICAL_GATE_PATH` och `ROADMAP[0] == S2/h-015` ändras inte (governance g-rader, h-032-exit).
- S6/h-014: specraden säger `depends_on: [h-013]`, autopiloten h-019; tabellen binds mot autopiloten. Specrefreeze
  (även `docs/05`-ytorna i h-014/h-015/h-017) är ett eget kontrakt — specen är byte-fryst här.
- `origin/main`-strategin (autopilotens `ensure_substitution_authority`/`doctor` läser `refs/remotes/origin/main`) är
  UNRESOLVED utanför kontraktet; F4 kör bara `ensure_roadmap_plan`/selftest/publication-callers.
- Refreeze-ordningen h-036/h-037 → h-035/h-038 → h-032 → h-031 + document-authority efter autopilot-/AGENTS-/drift-
  ändringen (pinnarna är redan stale) ligger utanför detta kontrakt.
- Riggnot: grinden städar inte sitt `FIXTURE_ROOT`; fixturrötterna för RED, referens och negativer ligger i
  test-authorns scratch och tas bort av den som kör efter bokföring.

### Oberoende kontraktsgranskning nr 5 (på a1101192) → v3.1
`GATE_REVIEW_RESULT=NOT_READY`: tre blockerare + N1–N8; 20 egna attacker (12 fångade / 8 missade). Remediering v3.1 (grind
sha256 `b298b07db3629235390b98bfb9ce464f1e662111086516a6a06da5c703b0106a`, 1740 rader, 97 rader i körning; commit `288b68ef`):

| Fynd | Åtgärd i grinden (rad i v3.1) |
|---|---|
| B1 9–39-hex-pekare passerar | `OLD_PLAN_TOKENS` (r.186–193): `(?<![0-9a-fA-F])(?i:0b3212c9)[0-9a-fA-F]{0,32}(?![0-9a-fA-F])` och samma form för blobbarna `c8ea8511`/`1e53887c`; kanari med `0b3212c991d4:`, 40-hex, versaler, `(0b3212c99)`, blobprefix; negation hex-föregången/41-hex |
| B2 `<PLAN_SHA>`/`git show` bara i två skills | `COMMIT_READ_TOKENS` (r.208) i slutningsskanningen av varje aktivt dokument (r.1089), trädvitt partial/text (r.1112, 1142), supersessionsnoter (r.1233), drift-svans (r.1245), EFTERARBETE-svans (r.1601); kanari `<PLAN_SHA>`/`PLAN_SHA=`/"frozen … plan commit" vs `git show HEAD:`/`plan_sha256` |
| B3 promptraden mäter AST-union, inte prompter | DRIVER-scenario `prompts` (r.318–345): importerar modulen, upptäcker byggare via kodobjektets strängkonstanter/namn, exkluderar flöden (r.331), anropar varje byggare med fixturer per skiva/roll/refrozen; raderna `f4_produced_prompts_of_roadmap_…` (r.1459) och `f4_produced_prompts_free_of_…` (r.1476); AST-raden kvar som komplement (r.1437) |
| N2 `PLAN_GENERATION=` obunden | selftest-raden kräver exakt `^PLAN_GENERATION=<modulens värde>$` (r.1552–1554) |
| N3 död EFTERARBETE-gren | svansgrenen först i `scannable_text` (r.1010); f6-svansskanning med `OLD_PLAN_TOKENS + COMMIT_READ_TOKENS` (r.1601) |
| N5 planen ej i `PLATFORM_DOCUMENTS` | `f3_verify_cli_pins_…_and_the_plan_generation` kräver plan + handoff pinnade med sha256 (r.1327–1333) |
| N6 svaga routerankare | Auktoritetsordningens planpunkt måste bära handoffen, `plangeneration`, `aktiv`; Historik måste bära `historia/historisk` och den nya planens sökväg (r.1172–1173) |
| N7 p.4 vs p.8 | Produktyta för BUILDER: v3.1-förtydligande (p.1/4/5/6/7 utförda i 320c9df7; v3-ytan är p.2/3/5b/5c) |
| N1, N4 | behållna, dokumenterade som gräns (etikett utan pekare; `effect authority`-paret) |

### Test-author 2026-09-11 — baslinje RED för v3.1 (före produkt)
Subjekt: replika av `320c9df7` + grind v3.1 + dokument (fixtur-HEAD `7e9f2d2e`). Fullkörning (bypass, egen `TMPDIR`, hållna
grindar ur subjektets byte-identiska kopior): exit **1**, `RED_LOCAL_QUALIFICATION`, **67 PASS / 30 FAIL**
(97 rader), result.json sha256 `3d623223ed814e02c01a9cfcd7dccd1ea3b6b34a0d7036d6ee7467ca3ba3fd32`. Röda rader: v3:s 26 plus (v3.1) empirical-runner-skillen
(`frozen autonomous-loop plan commit`), `f3_verify_cli_pins_…` (planen ej pinnad) och de två producerade-prompt-raderna
(planen saknas i levande prompter; gamla planen injiceras) — alla av rätt skäl. F7 oförändrat: control-set 68/68
(`04c02fc4…`), launch-cwd 19/20 med exakt två extra grindar (`40827abe…`), governance 68/70 exakt {g6, g7} (`4444aab8…`);
loopsvit 53 ok / 0 FEL.

### Referenskonstruktion v3.1 (scratch, förkastad)
Som v3-referensen plus: SUB-grenarna i `slice_authority_text`/`slice_builder_extra` namnger plan och handoff;
`controller/verify/cli` `PLATFORM_DOCUMENTS` pinnar plan (`6513b845…`) och handoff (`9d1c7b2e…`) med sha256. Fixtur-HEAD
`65efe37b`, 143 filer. Fullkörning (bypass, egen `TMPDIR`): exit **0**, `PASS_LOCAL_QUALIFICATION_ONLY`, **97/97**,
result.json sha256 `1e5d148b78ecfb6012068ad3cf5a3c68429b42a5a6fb15adba0e60e322577261`; control-set 68/68 (`95106b51…`), launch-cwd 19/20 (`e664078e…`), governance 68/70 exakt
{g6, g7} (`64f8cf59…`), loopsvit 53 ok / 0 FEL; 15 byggare / 101 producerade texter / 1 flöde; producerad dokumentmängd =
krävd ∪ {regler, byggplan, drift, owner-h003}.

### F9 v3.1 — negativer (var och en i egen replika av v3.1-referensen, statiskt `--skip-held-gates`; 26 körda,
26 fångade, 0 riggfel)
De 19 från v3 fångas på samma rader som förut (planändrande mutanter dessutom på de två producerade-prompt-raderna där
prompterna påverkas). Granskarens: (a02) moduldict → `f4_produced_prompts_free_of_…` (odeklarerat dokument i producerad prompt; AST-raden grön — därför komplement); (a04) 12-hex i AGENTS Historik, ompinnad → AGENTS-dokumentraden + trädvid (B1-token); (a10) `str.format` → `f4_produced_prompts_free_of_…`; (a11) literal `PLAN_GENERATION=platform-v1-legacy` → selftest-raden (N2); (a13) builder-skill `git show <PLAN_SHA>:` → builder-skillens dokumentrad + trädvid (B2); (a23) planen bara i död funktion → `f4_produced_prompts_of_roadmap_…` (AST-raden grön — därför komplement); (a28) EFTERARBETE-svans med gamla planfilen → `f6_efterarbete_…` + trädvid (N3). Alla 26: exit 1, inget riggfel, 0 missade.

### Oberoende kontraktsgranskning nr 6 (på af584e71) → v3.2
`GATE_REVIEW_RESULT=NOT_READY`: B1 (öppen värld i promptmätningen: självdeklarerat flöde via dött `journal`-namn; död krävd
byggare + levande tvilling), B2 (skivtabellen = första rubrikträffen, även i HTML-kommentar) + N1–N9. Remediering v3.2 (grind
sha256 `c391eebb26c72a0f0df0b72db73432bb5041266388432f1b8a67e1a06969b6ca`, 2009 rader, 105 rader i körning; commit `9d2ef894`):

| Fynd | Åtgärd i grinden (rad i v3.2) |
|---|---|
| B1 öppen värld | `EXPECTED_PROMPT_BUILDERS`/`_FLOWS`/`_CALLERS` (r.220–232); flöden via signatur enbart (DRIVER r.350); `prompt_world` (r.609–735): producenter, byggarreferenter, runner-promptkällor (rekursiv klassificering), nåbarhet från `main`; raden `f4_prompt_builders_flows_and_callers_…` (r.1704); kanari `canary_closed_world_…` (r.1105) |
| B2 dold tabell | `visible_markdown` (r.737) stripar HTML-kommentarer/kodstaket; `parse_slice_table` kräver exakt en tabell (r.743–751); kanarier med två/dold/staket-tabell |
| N2 handoffens bytes | replika `handoff-mutated` → `f4_ensure_roadmap_plan_stops_on_mutated_handoff` (r.1613) |
| N3 död pinne | `json_refusal` (r.854); `f3_platform_prepare_refuses_mutated_plan_generation_in_replica` (r.1619), `f3_platform_check_refuses_snapshot_…` (r.1627) |
| N4 skiftlägestvilling | `f1_tracked_paths_unique_case_insensitively` (r.1155); `CASE_COLLISION` (r.397) tolererar kollisionssmuts i subjekt/replika/overlay (r.1014) → produktrad, inte RIG |
| N5 inneslutning | fixtur `prompts_root` med HOME/XDG/TMPDIR/cwd/GIT_DIR/proxy (r.1671), `snapshot_tree` (r.867) före/efter subjekt + fixtur → `f4_prompt_builders_run_in_contained_fixture_without_side_effects` (r.1689); slumpat modulnamn (DRIVER r.323) |
| N8 Historik båda riktningar | `hist_new_active`/`hist_old_history` (r.1370–1371) |
| N7 substans | `PLAN_REQUIRED_SECTIONS` (r.233) → `f4_plan_generation_has_required_sections_…` (r.1798); dokumentet: substans = skivtabell + krävda avsnitt + token; RECON-kartan vägledning (sha256 bokförd) |
| N1, N6, N9 | dokumenterade som gränser (fingeravtryck; base64/zwsp/semantik/dubbletter; FIXTURE_ROOT städas av den som kör) |

### Test-author 2026-09-11 — baslinje RED för v3.2 (före produkt)
Subjekt: replika av `320c9df7` + grind v3.2 + dokument (fixtur-HEAD `548731c0`). Fullkörning (bypass, egen `TMPDIR`, hållna
grindar ur subjektets byte-identiska kopior): exit **1**, `RED_LOCAL_QUALIFICATION`, **71 PASS / 34 FAIL**
(105 rader), result.json sha256 `f81a788375d2bf886aec4fee19990703a2e1343ed4e507725868a1049e46a83a`. Röda: v3.1:s 30 plus (v3.2) `f4_ensure_roadmap_plan_stops_on_mutated_handoff`
(positivt ankare saknas), de två cli-effektraderna (planen ej pinnad) och `f4_plan_generation_has_required_sections_…` (planen
saknas) — alla av rätt skäl; nya gröna på 320c9df7: skiftlägesraden, sidoeffektraden och den slutna-världen-raden (v2.5-produktens
autopilot har exakt de 15 byggarna, 1 flödet och 8 anroparna; de gamla pekarna fångas av de producerade-prompt-raderna). F7 oförändrat: control-set 68/68 (`c3ffaf23…`), launch-cwd 19/20 med exakt två extra grindar (`aa4c15ca…`),
governance 68/70 exakt {g6, g7} (`23dfefd2…`); loopsvit 53 ok / 0 FEL.

### Referenskonstruktion v3.2 (scratch, förkastad)
Som v3.1 plus avsnitten Syfte/Arbetsflöde/Avslutskriterier i planen. Fixtur-HEAD `a6250fab`, 143 filer. Fullkörning (bypass,
egen `TMPDIR`): exit **0**, `PASS_LOCAL_QUALIFICATION_ONLY`, **105/105**, result.json sha256 `bbee9f8ec3d7e7403284c44894557620d4c0506501fa02eb3acefd6ab3743a2b`; control-set 68/68
(`72c68acc…`), launch-cwd 19/20 (`ad5730ab…`), governance 68/70 exakt {g6, g7} (`026d74be…`), loopsvit 53 ok / 0 FEL; 15
byggare / 1 flöde / 101 producerade texter / 0 sidoeffekter.

### F9 v3.2 — negativer (var och en i egen replika av v3.2-referensen, statiskt `--skip-held-gates`; 36 körda,
36 fångade, 0 riggfel)
De 26 från v3/v3.1 fångas på samma rader (planändrande mutanter dessutom på cli-effektraderna eftersom pinnarna inte
ompinnades). Granskarens nr 6 och egna varianter: (a_flowoptout) a02 + dött `journal`-namn → `f4_produced_prompts_free_of_…` (byggaren anropas nu; flöden bara via signatur); (a_shadow) död krävd byggare + levande tvilling `architect_prompt_live` → slutna-världen-raden (byggarmängd ≠ 15, runner-prompt från icke-byggare); (a_shadow2, egen) tvilling utan promptnamn, resultat via variabel → slutna-världen-raden (Name → tilldelning → Call till icke-byggare som refererar en byggare); (a_two_tables) kommentardold korrekt + synlig avvikande tabell → skivtabellraden (S2 utan h-030 i den synliga); (a_handoff_exist) handoffens existens i stället för bytes → `f4_ensure_roadmap_plan_stops_on_mutated_handoff`; (a_cli_dead_pin) filtrerad `PLATFORM_DOCUMENTS_LIVE` → båda cli-effektraderna; (a_casevariant) skiftlägestvilling som indexpost → `f1_tracked_paths_unique_case_insensitively`, exit 1 (v3.1: RIG exit 2); (a_sideeffect) byggare skriver $HOME/SIDE-EFFECT-MARKER → sidoeffektraden (filen landar i fixturens HOME); (a_nosections, egen) `## AVSLUTSKRITERIER` borttagen → krävda-avsnitt-raden. Alla 36: exit 1, 0 riggfel, 0 missade. Grindmutanten (h) faller alltjämt på kanarien.

### Oberoende kontraktsgranskning nr 7 (på 6d6f86c3) → v3.3
`GATE_REVIEW_RESULT=NOT_READY`: B1 (sluten värld över namn men öppen över textkällor: globals-uppslag, parameter-genomsläpp,
modulmall, klassmetod, runner-alias → levande prompt utan plan), B2 (`ensure_roadmap_plan` bunden som funktion, inte som anropad
vakt) + N1–N10. Remediering v3.3 (grind sha256 `f83b05c42f93956d99c84cdb7ee63153d21d5c3e3d1aad3ccb97b2ba2a2f1d60`, 2194 rader, 109 rader i körning; commit `9a2644e3`):

| Fynd | Åtgärd i grinden (rad i v3.3) |
|---|---|
| B1 textkällor | `prompt_world` fail-closed `classify` (r.656–807): rot = direkt byggaranrop / f-sträng i förväntat flöde / `prompt`-param i runner; alla tilldelningar till ett namn måste ha rot; `IfExp` med rotlös gren, metodanrop utanför `PROMPT_TEXT_METHODS` (r.237), subscript, comprehension, modulnamn, andra funktioner = RÖTT; runner-alias i funktion och på modul-/klassnivå (r.694,712); modul-/klasssvep (markör, inbäddad `docs/`-fil); dynamiskt svep `stray` i DRIVER; nåbarhet via `Call.func`; kanari (r.1228) |
| B1 dynamisk | DRIVER `live_flows` (r.400–428): stubbad `run_codex`, stubbade worktree/`clean`/`origin_main`; `f4_live_flows_reach_…` (r.1869) |
| B2 vakten | `EXPECTED_PLAN_GUARD_CALLERS` (r.239) → `f4_ensure_roadmap_plan_called_from_…` (r.1845); `f4_live_flows_stop_before_…` (r.1888) på muterad replika |
| N1 ref-namn | `COMMIT_READ_TOKENS` + `git show <ref≠HEAD>:` och `refs/preserved/` (r.211); kanari |
| N2 synlig bootstrap | bootstrapraden läser `visible_markdown` (r.1972) |
| N3 läsvy-tabell | `parse_slice_table`: slice-liknande tabeller med andra kolumner = fel (r.838); kanari |
| N4 NFC/NFD | `collision_key` NFC+gemener (r.1109); `core.quotePath=false` i alla Git-anrop (r.912,1118) |
| N5 handoff-cli | `f3_platform_prepare_refuses_mutated_handoff_in_replica` (r.1748) |
| N6 sidoeffekter | `snapshot_tree(skip_git=True)` + `snapshot_names` för `/private/tmp`, `/private/tmp/claude`, tempkatalog (r.970, 1808–1818) |
| N7–N10 | dokumenterade som gränser (formgräns för avsnitt, körtidsläsning, rigiditet, FIXTURE_ROOT-städning) |

### Test-author 2026-09-11 — baslinje RED för v3.3 (före produkt)
Subjekt: replika av `320c9df7` + grind v3.3 + dokument (fixtur-HEAD `9b28692a`). Fullkörning (bypass, egen `TMPDIR`, hållna
grindar ur subjektets byte-identiska kopior): exit **1**, `RED_LOCAL_QUALIFICATION`, **72 PASS / 37 FAIL**
(109 rader), result.json sha256 `d4fb0bd071475a65c4fc7233c910ab3324817415e88a6e6d58a0fa55a0982418`. Röda: v3.2:s 34 plus (v3.3) `f3_platform_prepare_refuses_mutated_handoff_…`
(ingen ny handoff), `f4_live_flows_reach_…` (den levande prompten bär den gamla plancommiten och saknar plan/handoff) och
`f4_live_flows_stop_before_…` (ingen ny plan att mutera → flödena når runnern) — alla av rätt skäl; nya gröna på 320c9df7:
slutna-världen-raden och vaktanroparraden (v2.5-produktens autopilot har exakt de förväntade mängderna). F7 oförändrat:
control-set 68/68 (`897cf465…`), launch-cwd 19/20 med exakt två extra grindar (`4cfa6d16…`), governance 68/70 exakt {g6, g7}
(`86f6c1ba…`); loopsvit 53 ok / 0 FEL.

### Referenskonstruktion v3.3 (scratch, förkastad)
Som v3.2 (ingen produktändring krävdes för v3.3). Fixtur-HEAD `3b4562f6`, 143 filer. Fullkörning (bypass, egen `TMPDIR`):
exit **0**, `PASS_LOCAL_QUALIFICATION_ONLY`, **109/109**, result.json sha256 `460e703344bb0b0eded1c1afa3fba587330cf4bfaeae5f40b29315026a2711be`; control-set 68/68 (`023c5030…`),
launch-cwd 19/20 (`243ca000…`), governance 68/70 exakt {g6, g7} (`77d4953a…`), loopsvit 53 ok / 0 FEL; 15 byggare / 1 flöde /
101 texter / 0 sidoeffekter; live-flöden: 5 fångade prompter med plan+handoff (2569–3660 tecken), muterad replika: 4 stopp
före runnern.

### F9 v3.3 — negativer (var och en i egen replika av v3.3-referensen, statiskt `--skip-held-gates`; 48 körda,
48 fångade, 0 riggfel)
De 36 från v3–v3.2 fångas på samma rader (planändrande mutanter dessutom på `f4_live_flows_reach_…` eftersom pinnarna inte
ompinnades). Granskarens nr 7: (a_globals_twin) byggaren via `globals()`, död `assert` → slutna-världen-raden (anrop till icke-byggare som rot); (a_param_passthrough) genomsläppt parameter + neutral text → slutna-världen-raden (`IfExp` med rotlös gren, parameter som rot); (a_module_template) modulnivåmall med markör → slutna-världen-raden (stray + modulnamn som textkälla) + `f4_live_flows_reach_…` (levande prompt utan plan); (a_class_twin) klassmetod via modulinstans → slutna-världen-raden (stray, metodanrop) + live-raden; (a_runner_alias) `_rc = run_codex` → slutna-världen-raden (alias på modulnivå) + live-raden; (a_unwired_ensure) tre vaktanrop borttagna → vaktanroparraden + `f4_live_flows_stop_before_…` (flödena når runnern med muterad plan); (a_refname_read) `git show refs/preserved/…:` i arkitektskillen → skillens dokumentrad + trädvid + skillraden (N1); (a_second_table_7col) 7-kolumns läsvy → skivtabellraden (N3); (a_boot_comment) id:n i HTML-kommentar → bootstrapraden (N2); (a_nfd_twin, äkta tvilling med `core.precomposeunicode=false`) → `f1_tracked_paths_unique_…`, exit 1 (N4; den kollapsade enkelposten utan arbetsträdsfil ger riggfel av rätt skäl); (a_cli_skip_handoff) → `f3_platform_prepare_refuses_mutated_handoff_…` (N5); (a_side_abs) skrivning till /private/tmp/claude → sidoeffektraden (N6). Alla 48 (inkl. grindmutanten h på kanarien): exit 1, 0 riggfel, 0 missade. Not: 47 negativer kördes mot grinden före den sista quotePath-justeringen (enbart okvoterade icke-ASCII-sökvägar i Git-anrop; ingen ASCII-rad påverkas), a_nfd_twin mot den slutliga.

### Builder / kvalificering
(fylls i efter produktkörningen)
