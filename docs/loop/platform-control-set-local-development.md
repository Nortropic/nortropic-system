# Lokal utveckling: plattformens obligatoriska kontrollmängd utan webbfiler

## Enkelt förklarat

Den 2026-09-10 delades det gamla blandade repot: webbförvaltningen (workflows,
agenter, skills, paket, webbens styrdokument) flyttade till ett eget repo och detta
repo är enbart autonomiplattformen. Fyra obligatoriska kontroller i plattformens
kontrollplan pekar fortfarande på flyttade webbfiler och stoppar därför varje
körning av den ordinarie loopen redan före leasen (`SEPARATION-20260910/EFTERARBETE.md`
rad 1, 2, 3, 4 och 11):

1. verifierarregistret bär webbposten `nortropic-verify-suite` → `preflight` exit 4;
2. den registrerade globala verifieraren `scripts/check-invariants.mjs` läser
   `workflows/`, `agents/`, `skills/` → 0 PASS / 8 FAIL;
3. pre-task-authority-snapshoten (`PRETASK_PATHS`, `snapshot_roots`) och
   dokumentauktoriteten (`PLATFORM_DOCUMENTS`) i `controller/verify/cli` kräver
   `docs/07-konstitution.md`, `docs/03-regelverk.md`, `docs/00-borja-har.md` m.fl.;
4. autopilotens `SUBSTITUTION_BLOBS`/`ensure_substitution_authority` pinnar samma
   flyttade dokument på `origin/main`.

Ingen obligatorisk kontroll får göras valfri. Målet är att samma kontrollmängd
(register, global verifierare, pre-task-snapshot, dokumentauktoritet) fungerar
utan en enda webbfil, medan varje saknat obligatoriskt PLATTFORMSberoende fortsatt
stoppar — så att den ordinarie loopvägen och bootstrapkedjan
(H-035 → H-034 → H-033 → H-032 → H-031 → supervisor resume) kan återupptas här.
Inget webbuppdrag och ingen webblane ska stödjas i detta repo.

Detta är ett lokalt utvecklingskontrakt, inte publicerad funktion. Det ger ingen
task nya skrivrättigheter, startar ingen supervisor, publicerar inget och ändrar
inte H039-arbetet eller de frysta grindarna.

## Avgränsning och roller

Bas: separationscommiten `49cc495c26f6d45d8a0f80b3f1b43a165c0e8c71` ovanpå den
färdiggranskade kandidaten `dae90c8fffa7b33e46e61e81de96e89137ff7829`, gren
`nortropic/platform-control-set-contract`. Subjektets produktsummor vid basen:
`controller/verify/cli` `3728206f3cd62f32837ec274fb30ad318cc91af3bd69d9902361025376394743`,
`scripts/nortropic-codex-autopilot.py` `9c2dc08b478c40038b60bd0af2a8628b00c07037abea49bd570d61230bedf0a1`,
`scripts/check-invariants.mjs` `d37e45b46cdc92a016022b80e7f1ea32661cd33a4f1b97af61962bc7cb0bf3ba`,
`controller/verify/register.json` `a87869be0bcfcd1e04cbd494f99e132fde1ce282dd75801cd9b1b33968b14460`.

TEST_AUTHOR tillför exakt: `verify/bin/platform-control-set-exit` (grinden), detta
dokument samt två FÖRESLAGNA människohandsfiler under `SEPARATION-20260910/proposed/`
(se nästa avsnitt). Ingen specändring: `specs/**` är människohand; h-035:s frysta
`allowed_write` täcker redan `controller/loop/**` och `scripts/nortropic-codex-autopilot.py`,
och `controller/verify/cli` ligger i det lokala tilläggets `product_paths`
(`local_document_authority_v1`, samma behörighetsväg som dokumentövergången 0581dc05).
Ett nytt specfält hade dessutom brutit den frysta `document-authority-exit` som
autentiserar hela specens bytes.

Produktyta för en separat BUILDER efter oberoende kontraktsgranskning: exakt
`controller/verify/cli` och `scripts/nortropic-codex-autopilot.py`, samt
`controller/loop/cli` endast om det mätt behövs (referenskörningen nedan behövde
det inte), plus utfallsrader i detta dokument. Registret och `scripts/check-invariants.mjs`
är §A-filer (byggplan v3 §3.1, loopregel 6) och tillämpas endast av ägaren, som
exakta bytes ur förslagen. Rollagenterna pushar, mergar och publicerar inte.

## Kriterium (effekter)

Grinden `verify/bin/platform-control-set-exit --subject <kandidat>` bygger
engångsreplikor av subjektet enligt h-035-receptet (`git init --template=<tom>` +
lokal exakt-SHA-fetch + `checkout --detach`, sluten barnmiljö, pinnad Python 3.12
via resolver, Node i samma resolver) och kör subjektets riktiga `controller/verify/cli`,
`controller/loop/cli`, sysrarna och de importerade autopilot-callablarna. Den
kopierar de FÖRESLAGNA filerna från `SEPARATION-20260910/proposed/` in i fixturer
(aldrig i arbetsträdet). Alla negativa rader krediteras endast om motsvarande
positiv rad först passerat (en vägran av fel skäl är ingen kredit).

| Område | Rad(er) | Krav |
|---|---|---|
| Rigg (D7) | `canary_*` | traceback, okänt verify-kommando (exit 3) och okänt drivrutinsscenario ger varken ok-JSON, vägran eller utfall |
| Förslag (D1) | `proposal_register_*` | förslagsregistret parsar strikt, bär ENDAST startbara poster med känd runner och plattformspath, ingen `nortropic-verify-suite`, `check-invariants` bunden till förslagsfilens sha256; subjektets `preflight` accepterar det i replika med exakt JSON |
| Verifierare (D2) | `pinv_base_fixture_all_pass`, `pinv00X_negative_*` | förslaget ger `6 PASS, 0 FAIL, 0 overtradelser` på en minimal plattformsfixtur; 16 mutanter fäller exakt den avsedda regeln (två för dubblerad JSON-nyckel: PINV-001 och PINV-004 blir båda INVALID), summaraden stämmer, INVALID är alltid FAIL |
| Register/preflight (D3) | `subject_preflight_exit0_exact_json` | `preflight` på subjektet självt → exit 0, exakt `{"register_sha256":…,"status":"ok"}`, tom stderr |
| Pre-task-snapshot (D3) | `subject_prepare_exit0_platform_roots_only` | `prepare` → exit 0; snapshoten bär register, verify-cli, verifierare, managed-settings, spec och `docs/loop/regler.md`; toppnivån ⊆ {controller, verify, specs, scripts, config, docs}; inget `workflows/`, `agents/`, `skills/`, `docs/0x-*` |
| Global verifierare (D2/D3) | `subject_run_commit_check_invariants_exit0`, `subject_real_verifier_rc0_no_web` | `run-commit check-invariants` mot kandidat = subjektets HEAD → exit 0 utan kvarlämnad taskdomsvy/worktree; `node scripts/check-invariants.mjs` i subjektet → rc 0 och `0 FAIL` |
| Dokumentauktoritet (D3) | `platform_prepare_and_check_accept_subject_documents`, `platform_prepare_rejects_modified_<11 dokument>`, `platform_prepare_rejects_missing_platform_doc`, `platform_check_rejects_doc_modified_after_prepare` | `platform-prepare`/`platform-check` med subjektets egen spec-/registersumma accepterar subjektets egna dokument (snapshoten utan webbfiler); varje muterat eller saknat plattformsdokument ger exakt `{"reason":"DOCUMENT_GENERATION","status":"refused"}` exit 4 utan skapad snapshot; dokumentbytes återställda |
| Taskgrind (D3) | `fixture_task_lookup_grindad`, `fixture_preflight_prepare_ok`, `fixture_task_run_exit0` | subjektets register + fixturpost `p-fixture` (bash-grind `verify/bin/p-fixture-exit`): `task` → `grindad`, `task-run` mot subjektets HEAD → exit 0 |
| Vägran (D3) | `refuse_missing_register`, `refuse_missing_check_invariants`, `refuse_drifted_check_invariants`, `refuse_missing_registered_task_gate`, `refuse_missing_managed_settings`, `refuse_missing_regler` | ett obligatoriskt plattformsberoende borttaget i taget → exit 4 klassad vägran i `preflight` eller `prepare`, stderr namnger beroendet (drift: `hash_mismatch: scripts/check-invariants.mjs`), ingen snapshot kvar |
| Stopp (D3) | `stop_missing_authority_core_before_worker` | utan `controller/authority/core.py` stoppar `loop run` i steget `taskval` (exit ≠ 0, klassning krävs inte), leasen är släppt, workspaceroten tom, ingen attestation, ingen `nortropic-loop-*`-rest |
| Autopilot (D4) | `autopilot_substitution_accepts_platform_generation_without_web_docs`, `autopilot_substitution_rejects_mutated_<11 dokument>`, `autopilot_selftest_none_returns` | fixtur-`origin/main` = subjektets träd (webbdokumenten bevisat frånvarande): `ensure_substitution_authority` returnerar och journalför exakt en `SUBSTITUTION_AUTHORITY`-rad vars `document_blobs` bär kontrakt + audit, endast plattformspaths, varje blob = `origin/main`-objektet; ett muterat plattformsdokument i `origin/main` (plumbing-commit) → `Stop` (drivrutinen rc 7) om "substitution authority" utan ny journalrad; `selftest(None)` returnerar med `AUTOPILOT_V4_SELFTEST=PASS` |
| Ordinarie väg (D5) | `loop_end_to_end_attests_platform_fixture_task` | replika = subjekt + förslagen tillämpade + `p-fixture` registrerad; config med 14 fält och `verifier_id: check-invariants`; stubbworker (`/bin/sh`) redigerar `tests/platform-fixture/out.txt` utan att committa → `loop run` exit 0, `attesterad`, `drain klar: 1 varv, 1 attesterade`, attestation med `grind_id`/`grind_sha256`, kandidat med författare `nortropic-utforare`, förälder = basen och filen i trädet; ingen `/private/tmp/.nortropic-h036-runtime-*`-rest, lease släppt, workspacerot tom, replikan ren |
| Frysta artefakter (D6) | `frozen_artifacts_identical_to_dae90c8f`, `invariant_required_exit_15_of_15` | trädobjekten `verify/h034`, `verify/h039`, `controller/h034-native`, `controller/runtime-cleanup`, `controller/provenance` och varje `verify/bin/h-0*-exit` (blob-OID + körbarhet) byte-lika dae90c8f i subjektets historia och arbetsträd; `verify/bin/invariant-required-exit --subject <subjekt>` ger 15/15 och `PASS_LOCAL_QUALIFICATION_ONLY` |
| Bytes (D7) | `subject_and_held_bytes_unchanged` | subjektets fyra produktfiler, grinden och förslagen oförändrade efter körningen |

Utfall och exitkoder: `PLATFORM_CONTROL_SET_RESULT=PASS_LOCAL_QUALIFICATION_ONLY`
(exit 0) eller `RED_LOCAL_QUALIFICATION` (exit 1); riggfel ger
`PLATFORM_CONTROL_SET_RIG_ERROR=` på stderr och exit 2 utan kredit. `result.json`
i fixturroten bär alla rader, subjektets HEAD och produktsummor, förslagens summor
samt Node-identitet (registrerad, inte pinnad). Fixturrötter bevaras.

Kommando (från test-author-arbetsytan, umask 0022; D5-raden kräver
`/usr/bin/sandbox-exec` och måste köras utanför en nästlad sandbox — i en
sandboxad session faller den med `sandbox_apply: Operation not permitted` och är
då ett miljöstopp, inte en produktdom):

```text
/opt/homebrew/Cellar/python@3.12/3.12.13_4/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -B verify/bin/platform-control-set-exit --subject <kandidat>
```

### Plattformsinvarianterna i förslaget (PINV-001–006)

Samma path, id och konventioner som den gamla grinden (Node utan beroenden, exit 0/1,
en rad per överträdelse, `X PASS, Y FAIL, Z overtradelser`, `invalid` → FAIL):

- **PINV-001** varje tasks `exit_test` ligger under `verify/bin/` och är, när den är
  sparad, en reguljär fil med läge 100755; en grind på disk som inte är sparad flaggas;
  en osparad frånvarande grind är en obyggd skiva (h-014/h-015) och flaggas inte.
- **PINV-002** registrets egen konsistens: varje post startbar, runner i {node, bash},
  unik säker path, sparad reguljär fil, sha256 på disk = registrerad.
- **PINV-003** exakt tre deklarationsblock läses som text — `PRETASK_PATHS` och
  `PLATFORM_DOCUMENTS` i `controller/verify/cli`, `SUBSTITUTION_BLOBS` i autopiloten —
  och varje deklarerad authority-path måste ligga i plattformsmängden (`controller/`,
  `verify/`, `specs/`, `config/`, `docs/loop/`, `tests/controller/`, `tests/scripts/`,
  `AGENTS.md`, `CLAUDE.md`, `README.md`, de tre skriptfilerna) OCH vara sparad i repot.
  Saknat block → INVALID. Mer än så bevisar ingen grep, och det påstås inte.
- **PINV-004** specen parsar med dubblettnyckel-avvisning; task-id och `exit_test`
  unika; `allowed_write`/`owner_author_allowed_write`/`docs_impact` och `defaults`
  bär endast välformade glob-mönster (inga `..`, `/`-prefix, tomma segment eller
  otillåtna tecken).
- **PINV-005** `NO_FORCE_SEMANTICS`: guarden `FORBIDDEN_GIT_TOKENS` med `--force` och
  `--force-with-lease` finns i autopiloten (annars INVALID), och ingen icke-kommentarrad
  i autopiloten eller någon sparad `controller/*/cli` bär både `push` och force-token.
  `worktree remove --force` är ingen history overwrite och räknas inte; kort `-f`
  bevisas inte av en grep och lämnas.
- **PINV-006** självidentitet: exakt en registerpost pekar på `scripts/check-invariants.mjs`,
  under id `check-invariants`, och de bytes som körs (`process.argv[1]`, t.ex.
  snapshotkopian) är exakt trädets sparade bytes.

Frågan "vilken legitim implementation skulle detta felaktigt avvisa?" ställdes per
regel: PINV-003 avvisar en builder som behåller `docs/07`/`docs/03` bakom en
existenskontroll — det är avsiktligt, designen säger ersätt, inte villkora.

## Människohandsfiler och förslag

`SEPARATION-20260910/proposed/` (README med summor och exakta `cp`-kommandon):

- `scripts-check-invariants.mjs` → `scripts/check-invariants.mjs` (PINV-001–006).
- `controller-verify-register.json` → `controller/verify/register.json`: webbposten
  `nortropic-verify-suite` borttagen, `check-invariants` (node, startbar) bunden till
  förslagsfilens sha256, not och beskrivning omskrivna för plattformen, i övrigt
  samma schema, `register_version` och `written`.

Grinden är RED på det oförändrade trädet (registret bär webbposten, verifieraren är
webbversionen) och GREEN först när ägaren tillämpat båda förslagen OCH BUILDER bundit
`controller/verify/cli` och autopiloten till plattformsmängden. Att ägaren tillämpar
dem har följder ägaren beslutar om: h-037 fryser registrets bytes och h-002/
`document-authority-exit`/`PLATFORM_REGISTER` pinnar dem; efter tillämpning gäller de
frysta grindarna sina historiska subjekt (dae90c8f), och BUILDER uppdaterar pinnen
`PLATFORM_REGISTER` (specen oförändrad → `PLATFORM_SPEC` består).

Antaganden (mätta där det står):

1. Fixturtaskens `allowed_write` är `tests/platform-fixture/**`, inte `platform-fixture/**`
   som i orchestratorns design: `.gitignore` är en vitlista (`/*` + `!`-undantag) och
   `git check-ignore` visar att `platform-fixture/out.txt` ignoreras, så utförarens
   `git add -A` hade aldrig stagat den (byggplan v3 §3.1, LOOP-ÄGARHAND-26). `tests/`
   är vitlistat.
2. Autopilotens CLI mappar `Stop` till exit 2 (`AUTOPILOT_BLOCKED`); "rc 7" i D4 är
   grindens drivrutinskonvention (importerad callable, `Stop` → 7), samma form som
   dokumentauktoritetsgrinden.
3. `SEPARATION-20260910/` är ignorerad av `.gitignore`-vitlistan; förslagen committas
   med `git add -f` (vitlistan är §A och rörs inte).
4. `verify/bin/document-authority-exit` krävs inte: dess subjekt är historiskt
   (dokumentgeneration 40f0bb6b/0581dc05 med webbdokumenten) och den ger
   `RIG_ERROR: subject approved document mismatch: AGENTS.md` på detta träd. Den
   står kvar fryst för sitt gamla subjekt.
5. Node pinnas inte med sha (identiteten registreras i `result.json`); fixturernas
   verifierare är förslaget självt, inte `process.exit(N)`, så Node-versionen kan
   påverka utfallet — mätt med v22.23.2.
6. D5-raden ändrar inte vad den mäter i sandboxad session; den faller då på
   `sandbox_apply` och rapporteras som miljöstopp.
7. Mätt 2026-09-10 (probe i referensreplika): H-036-launchern startar målet i
   ANROPARENS cwd, inte i workspacet (`pwd -P` = anroparens katalog; `confined-exec-v1`
   gör ingen `chdir`; den frysta h-036-grinden anropar launch med `cwd=workspace`
   och ser det därför aldrig). Loopen kör brytaren med loopens cwd, så en worker som
   skriver relativt hamnar i den levande utcheckningen där Seatbelt-profilen nekar
   skrivning (exit 1). Stubbworkern adresserar därför sitt workspace med loopens
   deterministiska absoluta sökväg `<workspace_rot>/<run_id>-p-fixture-1`. Detta är
   ett plattformsfynd i `controller/launch/**` utanför kontraktets produktyta —
   UNRESOLVED, och skiljt från h-009:s cwd-löfte i `tests/controller/launch/fall.py`.

## Vad grinden inte bevisar

- Ingen H035-, bootstrap-, publicerings-, installations-, root- eller resume-kredit;
  `verify/bin/h-035-exit` och övriga frysta grindar körs inte (de gäller sina
  frysta subjekt), utom `invariant-required-exit` som körs mot subjektet.
- EFTERARBETE rad 5–10 (h-035:s `allowed_write` med `docs/05-beslutslogg.md`,
  policyns §A-lista, attestens beslutsloggreferenser, managed-settings-sökvägar,
  `check-verifierarregistret.mjs` utan ankare, `.gitignore`-vitlistan) binds inte.
- PINV-003 bevisar inte att kontrollplanet saknar varje webbberoende — bara att de
  tre deklarationsblocken pekar på befintliga plattformspaths. `snapshot_roots`
  binds via `prepare`-effekten, inte via text.
- Att workern hamnar i workspacet (fynd 7 ovan) bevisas inte; grinden kringgår det
  i stubben och lämnar frågan till ett eget kontrakt.
- Webblanen: ingen. Att webbrepots grindar fortsatt fungerar bevisas i webbrepot.
- Referensimplementationen som användes för att visa att grinden är uppfyllbar
  (skrotreplika under `$TMPDIR`, minimal bindning + förslagen tillämpade) är
  kasserad och är inte produkt; dess 60/60 är ett uppfyllbarhetsbevis för grinden,
  inte kredit för någon kandidat.

## Utfall

### Preprodukt-RED 2026-09-10 (TEST_AUTHOR, subjekt = arbetsytan vid 49cc495c)

Kommando (bypass av sessionens sandbox för D5-raden, umask 0022):

```text
/opt/homebrew/Cellar/python@3.12/3.12.13_4/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -B /Users/elinhaggstrom/nortropic-repos/work/test-author-platform-control-set-20260910/verify/bin/platform-control-set-exit --subject /Users/elinhaggstrom/nortropic-repos/work/test-author-platform-control-set-20260910
```

Exit 1, 68 rader: 27 PASS / 41 FAIL, inget RIG_ERROR,
`PLATFORM_CONTROL_SET_RESULT=RED_LOCAL_QUALIFICATION`. Resultat:
`/private/var/folders/_v/t4cy04w95gz3m782_3p5qs9h0000gn/T/platform-control-set-local-92xaqk1z/result.json`, SHA-256 `8a5f81824becc09089b66629e0a955452bae4fa580159cf91a907bc262af2deb`.

Gröna: de fyra riggkanarierna, båda förslagsraderna, alla 17 PINV-raderna
(basfixtur + 16 mutanter), `fixture_task_lookup_grindad`,
`autopilot_selftest_none_returns`, `frozen_artifacts_identical_to_dae90c8f` och
`subject_and_held_bytes_unchanged`. Röda av rätt skäl: `preflight`/`prepare`
stoppar på `osäker eller saknad registerfil för nortropic-verify-suite:
workflows/nortropic-verify-suite.js` (därmed också `run-commit`, `task-run`, alla
sex vägransrader och stopp-raden, som krediteras först när den positiva raden
passerat); den riktiga verifieraren ger `0 PASS, 8 FAIL` (INV-001–008 INVALID) och
`invariant-required-exit` 14/15; `platform-prepare` vägrar `DOCUMENT_GENERATION`
(`docs/00-borja-har.md` m.fl. pinnade men frånvarande) så alla 13 dokumentrader är
röda; autopiloten stoppar på `substitution authority identity mismatch
path=AGENTS.md` (gammal blob-pin) så accept och alla 11 avvisningsrader är röda;
D5-loopen stoppar på `pre-task authority: authority-root saknas: docs/03-regelverk.md`.

Uppfyllbarhet: en kasserad referensimplementation (skrotreplika: förslagen
tillämpade, `PRETASK_PATHS`/`snapshot_roots`/`PLATFORM_DOCUMENTS`/`PLATFORM_REGISTER`
i `controller/verify/cli` och `SUBSTITUTION_BLOBS`/selftestantal i autopiloten bundna
till plattformsmängden, `controller/loop/cli` orörd) gav med samma kommando exit 0,
68/68 PASS, `PASS_LOCAL_QUALIFICATION_ONLY`, ingen H-036-rest och ren replika. Det
är bevis för att grinden kan uppfyllas, inte kredit för någon kandidat; referensen
finns inte kvar.

FROZEN_GATE_READY=YES · BASELINE_RED_FOR_RIGHT_REASON=YES ·
PRODUCTION_IMPLEMENTATION_WRITTEN=NO · PUSH=NO · MERGE=NO.
