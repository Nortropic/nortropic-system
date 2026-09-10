# Lokal utveckling: plattformens styrning utan webbkonstitutionen — autonomt flöde

## Enkelt förklarat

Ägarbeslut 2026-09-10: Nortropics Trust Kernel och bootstrap utvecklas och drivs med
full autonomi inom det beordrade uppdraget och de tekniska behörigheter som finns.
Webbens styrning (`docs/07-konstitution.md`, `docs/03-regelverk.md`, webbens agentroller,
steward-stegen/`AUTOPILOT`, människohandskrav) styr inte plattformen och ska bort ur
plattformens AKTIVA auktoritetsordning, instruktioner, agentprompter och körbara
beroenden. Generiska krav på människohand/ägarstopp ersätts av det autonoma flödet:
arkitektur, kontraktsförberedelse, spec, verifierarregister, dokumentbindningar,
implementation, granskning och rättning inom uppdraget sker utan ägaren som mellanhand.
Rollseparation, oberoende granskning och mekanisk verifiering består; en builder ändrar
aldrig sin egen frysta acceptansgrind; kontraktsändringar går genom det autonoma
kontrakts- och granskningsflödet. Plattformens skydd — fel identitet, obehörig
skrivning, saknad verifierare, falsk PASS — är uttryckliga tekniska krav vars giltighet
inte beror på webbkonstitutionen. Ingen ny konstitution, inget generellt ägarlager,
ingen växande undantagslista. Historiska dokument och frysta artefakter finns kvar för
spårbarhet men är inte dagens instruktioner; gamla resultat behåller sina ursprungliga
subjekt. Fasgränser (push, publicering, installation, live, supervisor-resume ingår inte
i denna fas) byggs inte in som permanenta krav på mänskligt godkännande.

Mätt läge vid basen `512490d44007373b79aca504aa92709e9810aa24` (skanningsfilen
`governance-scan-512490d4.txt`): rollskillsens "Read first" pekar på `docs/07`/`docs/03`;
`AGENTS.md`/`CLAUDE.md`/`README.md` bär "endast av människohand"/"human-only";
`controller/policy/cli` subtraherar `specs/**`+`verify/**` som "ägarhand" och avvisar
resten av webbens §A-mängd med texten "alltid människa och HÖGRISK-märkt commit";
`specs/tasks.spec.json` `defaults.denied_write` listar webbfiler, `human_only` bär
m-001 (webbens INV-007–009), `authority.backlog` pekar på `docs/100-dagar` (borta),
h-035:s `allowed_write` bär `docs/05-beslutslogg.md`; autopiloten bär
`TEST_AUTHOR_ALLOWED`, roadmap-tupler och prompter med `docs/05` och en hårdkodad
webb-§A-lista; `docs/loop/byggplan-v3.md` §3.1 och `docs/loop/regler.md` regel 6 är
webbens §A-regel; `tests/controller/policy/fall.py` prövar webbmängden.

Detta är ett lokalt utvecklingskontrakt, inte publicerad funktion. Det ger ingen task nya
skrivrättigheter, startar ingen supervisor, publicerar inget och ändrar inte H039-arbetet
eller de frysta grindarna.

## Avgränsning och roller

Bas: plattformsintegrationen `512490d44007373b79aca504aa92709e9810aa24` på gren
`nortropic/platform-governance-contract` (kontrollmängdskandidaten med granskat register
`f1c553d9…` och plattformsinvariantgrind `ae72cdf8…` tillämpade, plus launch-cwd-fixen).
Båda befintliga frysta lokala grindarna är gröna på basen: `platform-control-set-exit`
68/68, `launch-cwd-exit` 20/20 (mätt 2026-09-10 från hållna kopior).

TEST_AUTHOR tillför exakt: `verify/bin/platform-governance-exit` (grinden) och detta
dokument. Ingen produktändring, ingen specändring, ingen ändring i någon fryst artefakt.

Flödet är det autonoma: TEST_AUTHOR (grind + dokument, RED) → oberoende kontraktsgranskning
(read-only) → BUILDER (produkt inom produktytan nedan, ändrar aldrig grinden eller detta
dokuments kriterium) → oberoende produktgranskning (read-only, försöker falsifiera) → lokal
kvalificering med grinden. Ingen ägarhand i kedjan; specändringar och pin-uppdateringar i
`controller/verify/cli` är BUILDER:s ordinarie arbete i detta flöde (ägarbeslut 2026-09-10).
Ingen push, merge, publicering, installation eller resume ingår.

## Kriterium (effekter)

Grinden `verify/bin/platform-governance-exit --subject <kandidat>` bygger engångsreplikor
av subjektet enligt h-035-receptet (`git init --template=<tom>` + lokal exakt-SHA-fetch +
`checkout --detach`, sluten barnmiljö, pinnad Python 3.12 via resolver) och kör subjektets
riktiga `controller/policy/cli`, `controller/verify/cli`, de importerade
autopilot-callablarna, subjektets eget policyprov och publication-callers, samt de två
befintliga frysta lokala grindarna mot kandidaten. Kandidater till policyn skapas med
Git-plumbing (`read-tree`/`update-index --cacheinfo`/`commit-tree`), aldrig via
arbetsträdet eller `.gitignore`-vitlistan. Negativa rader krediteras endast när
motsvarande positiv rad först passerat.

| Område | Rad(er) | Krav |
|---|---|---|
| Rigg (G9) | `canary_*` | traceback, policyns anropsfel (exit 1), okänt drivrutinsscenario och drivrutinsfel är varken verdikt, ok-JSON eller utfall; tokenskannern fäller `docs/07-konstitution.md` men inte `.agents/skills/`, `AUTOPILOT_V4` eller `LOOP-ÄGARHAND-26` |
| Aktiv auktoritet (G1) | `g1_active_authority_files_present`, `g1_no_web_governance_reference_<fil>`, `g1_arkiv_references_resolve_to_tracked_files` | de aktiva filerna `AGENTS.md`, `CLAUDE.md`, `README.md`, `.agents/skills/*/SKILL.md` (minst builder, reviewer, test-author), `docs/loop/regler.md`, `docs/loop/byggplan-v3.md` är spårade och innehåller INGEN träff på webbtokens (exakt regel nedan); varje `docs/loop/arkiv/<sökväg>` de nämner finns spårad |
| Ingen människohandsregel (G2) | `g2_no_human_hand_rule_<fil>`, `g2_agents_md_names_autonomous_flow_and_four_protections`, `g2_regler_names_roles_and_protections`, `g2_claude_md_routes_to_agents_md`, `g2_skills_route_to_agents_md_and_name_their_boundary` | samma filer innehåller ingen av fraserna `HÖGRISK`, `human-only`, `owner-only`, `människohand`, `endast av (en) människa…`, `alltid (en) människa…`, `aldrig genom loopen`, `OWNER_DECISION_REQUIRED`, `ägarhand` (utom beslutsid `LOOP-ÄGARHAND-<n>`), `human hand`, `owner hand` (alla skiftlägesoberoende). `AGENTS.md` namnger rollerna test-author, builder, reviewer/granskare, att buildern aldrig ändrar sin egen frysta grind, att granskaren är read-only, samt skydden identitet, `allowed_write`, verifierare, hash och falsk PASS. `docs/loop/regler.md` namnger rollerna, `allowed_write`, verifierare och falsk PASS. `CLAUDE.md` och varje SKILL.md pekar på `AGENTS.md`; builder-skillen nämner frysta/frozen och `allowed_write`, reviewer-skillen read-only, test-author-skillen builder |
| Policy (G3) | `g3_policy_accepts_write_inside_allowed_write`, `g3_policy_accepts_controller_write_inside_allowed_write`, `g3_policy_refuses_platform_write_exit3_<6 sökvägar>`, `g3_policy_refuses_platform_deletion_exit3_CLAUDE_md`, `g3_policy_platform_verdict_is_never_masked_by_milder_refusal`, `g3_policy_web_path_is_only_outside_allowed_write_exit4_<2>`, `g3_policy_protection_is_sourced_from_spec_denied_write`, `g3_policy_cli_no_web_reference_and_no_human_demand` | i replika, med en HÄRLEDD spec = kandidatens `specs/tasks.spec.json` (strikt parsad, `defaults` oförändrade) + fixturtasks `p-gov-fixture` (`tests/platform-fixture/**`) och `p-gov-controller` (`controller/loop/**`): skrivning inom `allowed_write` → exit 0 `accepterad`; skrivning av `verify/bin/<ny fil>`, `specs/tasks.spec.json`, `controller/verify/register.json`, `scripts/check-invariants.mjs`, `.gitignore`, `CLAUDE.md` samt radering av `CLAUDE.md` → exit 3, stdout namnger sökvägen och innehåller varken `människ` eller `högrisk`, exakt en ny evidensfil vars `verdikt` inte är `utanfor_allowed_write` (etiketten får döpas om) och som listar sökvägen; en kandidat som rör både plattformsmängd, tillåten fil och webbfil → exit 3 (aldrig maskerad); `workflows/x.js` och `docs/07-konstitution.md` → exit 4, `verdikt` = `utanfor_allowed_write`, texten nämner `allowed_write`; samma `verify/bin`-skrivning mot en härledd spec med `defaults.denied_write = []` → exit 4 (skyddet kommer ur specen, inte ur en egen lista); `controller/policy/cli` bär inga webbtokens och varken `människ` eller `högrisk` |
| Spec och pinnar (G4) | `g4_spec_strict_and_authority_documents_are_tracked_platform_documents`, `g4_spec_human_only_block_absent_or_free_of_web_and_human_hand_rules`, `g4_spec_h035_surfaces_platform_only_and_tracked`, `g4_spec_defaults_denied_write_is_the_platform_set`, `g4_spec_no_task_lost_its_gate`, `g4_verify_cli_pins_equal_candidate_spec_and_register`, `g4_platform_prepare_and_check_accept_candidate_spec_and_documents` | specen parsar med dubblettnyckel-avvisning; `authority.plan/architecture/rules/backlog` är spårade plattformsdokument; `human_only` saknas eller dess JSON-text bär varken webbtokens, `scripts/check-invariants.mjs` eller människohandsfraser; h-035:s `allowed_write`/`owner_author_allowed_write`/`docs_impact` är plattformsmönster (exakta sökvägar spårade); `defaults.denied_write` täcker de sex skyddade sökvägarna, bär ingen webbsökväg och inte `controller/**`; mängden tasks vars `exit_test` saknas på disk är exakt basens (h-014, h-015), alla `exit_test` under `verify/bin/`, befintliga reguljära 100755; `PLATFORM_SPEC`/`PLATFORM_REGISTER` i `controller/verify/cli` = sha256 av kandidatens spec/register; `platform-prepare` + `platform-check` med kandidatens summor → `{"status":"ok",…}` |
| Körbara beroenden (G5) | `g5_no_web_document_reference_<verify/loop/autopilot>`, `g5_controller_test_suites_no_web_governance_reference`, `g5_attest_cli_docs05_only_inside_historical_refreeze_functions`, `g5_autopilot_selftest_none_returns_pass`, `g5_autopilot_test_author_and_roadmap_surfaces_platform_only`, `g5_autopilot_publication_callers_exit0`, `g5_policy_test_suite_green_against_candidate_policy`, `g5_policy_test_suite_discriminates_policy_of_512490d4` | `controller/verify/cli`, `controller/loop/cli`, autopiloten bär ingen av `docs/07`, `docs/03`, `docs/05`, `docs/00-borja-har`, `docs/agentoverlamning`, `docs/100-dagar`, `workflows/`, `tests/fixtures`, `eval-rubric`, `juridikflaggor`, `nortropic-steward`, strängliteralen `"AUTOPILOT"`; `tests/controller/*/fall.py` bär inga webbstyrningstokens (historiska `docs/05`/`docs/00` som fixturdata för historiska specrader tillåts); i `controller/attest/cli` ligger varje strängkonstant med `docs/05-beslutslogg.md` inuti en funktion vars namn matchar `refreeze|h03[58]` (AST) och filen bär inga webbstyrningstokens; `selftest(None)` returnerar med `AUTOPILOT_V4_SELFTEST=PASS`; `TEST_AUTHOR_ALLOWED`, `EMPIRICAL_GATE_ALLOWED`, varje `plan_allowed_write` i `SUBSTITUTION_ROADMAP`/`ROADMAP` och `roadmap_test_author_allowed(sl)` innehåller endast plattformsmönster; `publication-callers.py` exit 0; kandidatens `tests/controller/policy/fall.py` i replika → exit 0 utan FAIL/SKIP-rad och utan kvarlämnad worktree; samma prov mot replika där `controller/policy/cli` bytts till basens (512490d4) bytes → exit 1 (provet skiljer ny från gammal policy) |
| Frysta artefakter (G6) | `g6_frozen_trees_and_files_identical_to_512490d4_plus_this_gate_only`, `g6_existing_local_gates_identical_to_512490d4` | varje blob (läge + OID) under `verify/**`, `controller/h034-native/**`, `controller/runtime-cleanup/**`, `controller/provenance/**` samt `scripts/check-invariants.mjs` och `controller/verify/register.json` är identisk med 512490d4 i HEAD och arbetsträdet; det enda tillägget är `verify/bin/platform-governance-exit`, byte-likt den hållna grinden och 100755; `platform-control-set-exit` och `launch-cwd-exit` är basens blobbar och körbara |
| Befintliga grindar (G7) | `g7_platform_control_set_exit_68_of_68_on_candidate`, `g7_launch_cwd_exit_19_of_20_only_frozen_listing_sees_this_gate` | `platform-control-set-exit --subject <kandidat>` → exit 0, 68 PASS/0 FAIL, `PASS_LOCAL_QUALIFICATION_ONLY`, `result.json` med `subject_head` = kandidaten och raderna `subject_preflight_exit0_exact_json`, `subject_prepare_exit0_platform_roots_only`, `subject_run_commit_check_invariants_exit0`, `platform_prepare_and_check_accept_subject_documents`, `fixture_task_run_exit0`, `autopilot_selftest_none_returns`, `loop_end_to_end_attests_platform_fixture_task`, `invariant_required_exit_15_of_15` gröna; `launch-cwd-exit --subject <kandidat>` → 20 rader varav exakt en röd: `frozen_verify_bin_identical_to_base_383ed387` med detaljen som slutar `problems=[] extra=['verify/bin/platform-governance-exit']` (den grinden fryste hela `verify/bin`-listan vid 383ed387; detta kontrakts grind är per konstruktion det enda tillägget, och G6 binder samma egenskap mot 512490d4). Grindarna körs från kandidatens egna kopior efter att G6 bevisat dem byte-lika basen, eller från hållna kopior via `--held-control-set`/`--held-launch-cwd` |
| Dokument (G8) | `g8_development_document_tracked_with_required_sections` | `docs/loop/platform-governance-local-development.md` spårat med rubrikerna Enkelt förklarat / Avgränsning och roller / Kriterium (effekter) / Produktyta för BUILDER / Vad grinden inte bevisar / Utfall |
| Bytes (G9) | `g9_subject_and_held_bytes_unchanged` | produktytans filer och grinden oförändrade efter körningen |

**Exakt G1-regel.** I de aktiva filerna är följande mönster förbjudna (Python-`re`,
`(?i)` = skiftlägesoberoende): `docs/07-konstitution`, `docs/03-regelverk`,
`docs/05-beslutslogg`, `docs/00-borja-har`, `docs/agentoverlamning`, `docs/100-dagar`,
`(?<![\w./-])workflows/`, `(?<![\w./-])agents/`, `(?<![\w./-])skills/`, `tests/fixtures`,
`eval-rubric`, `juridikflaggor`, `(?<![\w-])AUTOPILOT(?![\w-])`, `(?i)steward`,
`(?i)konstitution`, `(?i)regelverk`. Ingen sektion i en aktiv fil är undantagen — inte
heller en "Historik"-rubrik — eftersom grinden inte kan skilja historik från auktoritet
i löptext. Historiskt material flyttas till `docs/loop/arkiv/` (nya filer), och de aktiva
filerna hänvisar dit högst som historia med sökvägen `docs/loop/arkiv/<fil>` (som måste
finnas). Allt utanför de aktiva filerna skannas inte: `docs/loop/arkiv/**`,
`SEPARATION-20260910/**`, `verify/bin/h-0*-exit`, `verify/bin/document-authority-exit`,
`docs/loop/*-local-development.md` (inkl. utfallsavsnitten), `docs/loop/drift.md`,
`owner-author-workflow-v1.md`, `remaining-bootstrap-delegation-v1.md`,
`codex-autopilot-v3-full-roadmap.md`, `config/**`, `.gitignore` och verify-cli:s
`PLATFORM_DOCUMENTS`-pinnar (som binder bytes, inte innehåll).

Utfall och exitkoder: `PLATFORM_GOVERNANCE_RESULT=PASS_LOCAL_QUALIFICATION_ONLY` (exit 0)
eller `RED_LOCAL_QUALIFICATION` (exit 1); riggfel ger `PLATFORM_GOVERNANCE_RIG_ERROR=` på
stderr och exit 2 utan kredit. `result.json` i fixturroten bär alla rader, subjektets HEAD,
produktytans sha256, de hållna grindkörningarnas program/summor/fixturrötter samt
Node-identitet. Fixturrötter bevaras. `--skip-held-gates` gör G7-raderna FAIL (aldrig PASS).

Kommando (umask 0022; G7-raderna kräver `/usr/bin/sandbox-exec` och måste köras utanför en
nästlad sandbox — i en sandboxad session faller loopraderna i de hållna grindarna med
`sandbox_apply: Operation not permitted`, ett miljöstopp, inte en produktdom):

```text
/opt/homebrew/Cellar/python@3.12/3.12.13_4/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -B verify/bin/platform-governance-exit --subject <kandidat>
```

Frågan "vilken legitim implementation skulle detta felaktigt avvisa?" ställdes per rad:

- G1 avvisar en builder som behåller ordet "konstitution"/"regelverk" i löptext även i
  avståndstagande mening ("webbens konstitution gäller inte") — avsiktligt: designen säger
  ta bort, inte omformulera; SEPARATION-20260910/README.md får bära historien.
- G1 avvisar `AUTOPILOT` i versaler som fristående ord i de aktiva dokumenten; plattformens
  eget skript skrivs "autopilot"/`scripts/nortropic-codex-autopilot.py`.
- G2 avvisar `ägarhand` som begrepp men inte beslutsid `LOOP-ÄGARHAND-<n>`.
- G3 avvisar en policy med hårdkodad plattformslista bredvid specens `denied_write`
  (raden `…sourced_from_spec_denied_write`) — avsiktligt: två sanningar driftar isär
  (policyns egen princip). Den avvisar också en policy som behåller `specs/**`/`verify/**`
  som "ägarhandsyta" utanför §A-vakten. Följd: historiska tasks h-002/h-037, vars
  `allowed_write` rör `controller/verify/register.json`, kan inte längre passera policyn
  för sådana skrivningar; deras resultat behåller sina historiska subjekt.
- G4 avvisar en spec som tar bort h-014/h-015 (obyggda skivor) eller lägger till en task
  utan grind; den kräver inte att `verify/bin/h-014-exit` skapas (G3/G6 förbjuder det).
- G5 avvisar en autopilot som behåller `docs/05-beslutslogg.md` i roadmap-tuplerna eller
  prompterna: en framtida test-author hade annars beordrats skriva en borttagen webbfil.
  Den tillåter `controller/attest/cli` oförändrad (docs/05 endast i de historiska
  refreeze-funktionerna `expected_refreeze`/`h038_proof`) — den ordinarie attestvägen bevisas
  webbfri genom loopraden i G7. G5 binder autopilotens namn `TEST_AUTHOR_ALLOWED`,
  `EMPIRICAL_GATE_ALLOWED`, `SUBSTITUTION_ROADMAP`, `ROADMAP`, `roadmap_test_author_allowed`;
  en omdöpning av dem gör raden röd och är en kontraktsändring.
- G7 avvisar inte kandidaten för launch-cwd-grindens frysta listrad — den binder i stället
  exakt vilken rad som är röd och varför.

Antaganden (mätta där det står):

1. Mätt 2026-09-10: `verify/bin` vid 383ed387 = HEAD:s listning minus `launch-cwd-exit`;
   med grindfilen på plats ger den hållna `launch-cwd-exit` exakt en röd rad med detaljen
   `files=32 problems=[] extra=['verify/bin/platform-governance-exit']`.
2. Policyns evidensfiler skapas med `mkstemp` (unika namn) i `controller/policy/evidence/`
   som är gitignorerad; mängddifferensen före/efter varje `check` identifierar exakt en ny fil.
3. Den härledda specen skrivs utanför repots kanoniska sökväg, vilket enligt policyn
   (LOOP-ÄGARHAND-23) stänger av den prospektiva authority-kontrollen för fixturtaskarna;
   `defaults` kopieras oförändrade så att §A-effekten mäter kandidatens verkliga mängd.
4. `docs/loop/platform-governance-local-development.md` läggs INTE i `PLATFORM_DOCUMENTS`:
   dess utfallsavsnitt fylls i efter cykeln (G8 nedan), och en sha-pinne hade gjort varje
   utfallsrad till en pin-ändring i `controller/verify/cli`. Dokumentgenerationens
   sammansättning i övrigt är BUILDER:s bindningsbeslut, mätt genom G4/G7.
5. Historiska specrader (h-001…h-017, h-031…h-039 utom h-035) får behålla `docs/05` i
   `allowed_write`/`docs_impact` som historiska subjekt; därför skannas `tests/controller/**`
   inte för `docs/05`/`docs/00`.
6. Node pinnas inte med sha (identiteten registreras i `result.json`).

## Produktyta för BUILDER

Exakt: `AGENTS.md`, `CLAUDE.md`, `README.md`, `.agents/skills/**`, `docs/loop/regler.md`,
`docs/loop/byggplan-v3.md`, `docs/loop/arkiv/**` (nya historiska filer),
`specs/tasks.spec.json`, `controller/policy/cli`, `controller/verify/cli` (pinnarna
`PLATFORM_SPEC`, `PLATFORM_DOCUMENTS`; `PLATFORM_REGISTER` består),
`scripts/nortropic-codex-autopilot.py` (inkl. `SUBSTITUTION_BLOBS`-pinnar),
`controller/attest/cli` (endast om det behövs), `tests/controller/policy/fall.py`,
`config/premiar-backlog.json` (endast om det behövs), `.gitignore` (endast om det behövs),
samt utfallsrader i detta dokument.

Inte produktyta: `verify/**` (inkl. denna grind), `controller/verify/register.json`,
`scripts/check-invariants.mjs`, `controller/h034-native/**`, `controller/runtime-cleanup/**`,
`controller/provenance/**`, `SEPARATION-20260910/**`. En builder som mätt behöver ändra
registret eller verifieraren stoppar och begär kontraktsändring genom det autonoma flödet;
grinden binder dem oförändrade.

## Vad grinden inte bevisar

- Ingen H035-, bootstrap-, publicerings-, installations-, root- eller resume-kredit; inga
  frysta `h-0*`-grindar körs (de gäller sina frysta subjekt).
- Semantik: tokenskanningen bevisar frånvaro av namngivna webbreferenser och fraser, inte
  att den kvarvarande texten är riktig eller fullständig; närvarokontrollen bevisar att
  rollerna och skydden är namngivna, inte hur.
- `docs/loop/drift.md`, `owner-author-workflow-v1.md`, `remaining-bootstrap-delegation-v1.md`,
  `codex-autopilot-v3-full-roadmap.md`, `harness-substitution-contract-v1.md`,
  `config/managed-settings.json` (sandboxens deny-lista med webbsökvägar),
  `config/premiar-backlog.json`, `.gitignore`-vitlistan (`!/agents/`, `!/workflows/`,
  `!/AUTOPILOT`, `!/skills/...`) och `scripts/check-verifierarregistret.mjs` skannas inte;
  de är inte i G1:s aktiva auktoritetsordning enligt orchestratorns design.
- `HUMAN_AUTHORITY_HARD_STOP`/"hard-stop" i skillsen (verklig auktoritetskonflikt eller
  extern credential-/provisioningceremoni) förbjuds inte; ett yttre tekniskt hinder är inte
  en styrningsregel. Om texten ändå formulerar ett generiskt människokrav fångas det bara om
  det använder de förbjudna fraserna.
- Att `controller/attest/cli`:s refreeze-funktioner fungerar utan `docs/05` bevisas inte
  (de är historiska transformer med egna frysta subjekt); bara den ordinarie attestvägen
  (loopraden) och konstantplaceringen mäts.
- Att policyn läser rätt spec i den ordinarie loopen mäts av kontrollmängdsgrinden
  (G7), inte här igen; G3 mäter policyns egen effekt med kandidatens `defaults`.
- Referensimplementation: ingen skrevs. Uppfyllbarheten per rad följer av att varje krav är
  en textändring i produktytan eller en redan uppmätt effekt (G7 grön på basen; G3-raderna
  motsvarar att ta bort `AGARHAND`-subtraktionen och byta `denied_write`). Det är bedömning,
  inte mätning, och märks OVERIFIERAT tills BUILDER:s kandidat mätts.

## Utfall

### Preprodukt-RED 2026-09-10 (TEST_AUTHOR)

Fylls i efter grindens första körning mot arbetsytan med grinden och dokumentet committade
(subjekt, kommando, exit, rader, `FIXTURE_ROOT`, `result.json`-sha256). Se nästa avsnitt.

### Demonstration av det autonoma flödet (fylls i av root efter cykeln)

```text
CONTRACT_COMMIT=<sha>          # TEST_AUTHOR: grind + dokument
CONTRACT_REVIEW=<identitet>    # oberoende kontraktsgranskning, read-only
BUILDER_CANDIDATE=<sha>        # produkt inom produktytan
PRODUCT_REVIEW=<identitet>     # oberoende produktgranskning, read-only
LOCAL_QUALIFICATION=<result.json sha256, PASS_LOCAL_QUALIFICATION_ONLY>
OWNER_INTERMEDIATION=NONE
```
