# Slutseparation av plattformsrepot — lokalt kontrakt (grind + utvecklingsdokument)

**Roll:** TEST_AUTHOR (kontraktsfrys, ingen produkt) · **Datum:** 2026-09-12 · **Bas:** `e6e4091c991ccbcaf9b7bab923a4e1e803453290`
· **Grind:** `verify/bin/platform-separation-final-exit` (v3.13 2026-09-12: generationsbyte efter kvalificerad h-035-placering;
historiska ankare och de tre hållna grindarna bevaras. v3.12: per-grind-golv för den omfrysta
grindens innehåll och verkställd kvittoplacering, efter kontraktsgranskning nr 15. v3.11: ordnad, kvalificerad
refreeze av en fryst H-grind; sidoeffektsvepet skopat till grindens egna rötter. v3.6–v3.10: plangenerationen
bunden, remedierad efter granskningarna nr 5–14) · **Omfång:** `LOCAL_QUALIFICATION_ONLY`.

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

## Generationsdelta v3.13 — enda ändringen mot kriterierna nedan

Detta avsnitt ersätter endast de äldre kriteriernas antagande att omfrysningsbasen också är
överföringsbas, dokumentens historiska skangräns och ett träd där denna grind ännu saknas.
Äldre mätningar under Utfall behåller sina ursprungliga subjekt och utgör inte v3.13-kvalificering.

- `FROZEN_BASE` är `e6e4091c991ccbcaf9b7bab923a4e1e803453290`, där h-035 redan är kvalificerad och placerad.
  F2:s följedokumentmängd, F3:s specbindning, F4:s loopbindning och F6:s nya byte-/sökvägsfrys jämförs mot
  denna bas; de baskodade radnamnen följer dess åtta första tecken. Inga produktfiler ändras.
- `HISTORICAL_BASE` är oförändrade `332f07ceb914a07c6632c1393969d9d5a337566b`. F1:s fyra överförda
  objekt och proveniensrad, substitutionskontraktets historiska avsnitt, de fyra supersessionsdokumentens
  kroppar samt DRIFT/EFTERARBETE:s skangränser binds fortfarande där. De redan aktiva noterna fortsätter
  skannas; inget av dem göms genom att flytta gränsen framåt. Proveniensfilen ändras inte.
- En spårad `REFREEZE.json` som är byteidentisk med filen i den fixerade basen är ärvd historik, inte
  en ny omfrysning. Den lämnas orörd och ger ingen ny kvittocredit. Ett inskickat kvitto utan en ny
  deklarerad omfrysning avvisas som oväntat. En annan deklarationsbyteföljd måste fortfarande uppfylla
  exakt en ny post, matchande bas-/nyhash, ändrade grindbytes, radhärlett golv, högst tre motiverade
  pensioneringar, tillagda-rader-skanningen och ett separat kvitto för exakt samma kandidat.
- F6:s sökvägsmängd är basmängden förenad med denna grinds sökväg, även när grinden redan finns i basen.
  Endast denna grinds byteändring undantas, och endast om dess befintliga jämförelse mot den hållna
  kopians sha256, reguljär fil utan symlänk och läge 755 håller. Övriga byteändringar måste motsvara
  den enda nya deklarationen; borttagningar och extra sökvägar avvisas oförändrat.
- `CONTROL_SET_BASE`, `LAUNCH_CWD_BASE`, `GOVERNANCE_BASE` och de tre hållna grindarnas bytes ändras inte.
  F7 härleder den ärvda H-grinddriften enbart ur det fixerade FROZEN_BASE-trädet mot varje hållen grinds
  egen bas, och förenar den med den enda nya deklarerade sökvägen. Kandidatens godtyckliga diff ger
  aldrig en tillåten sökväg. I denna bas är den ärvda driften exakt `verify/bin/h-035-exit`.
  Utan ny omfrysning förutsägs därför control-set 67 PASS / 1 FAIL, launch-cwd 19 PASS / 1 FAIL och
  governance 67 PASS / 3 FAIL, med samma exakta namngivna rader och detaljkrav som tidigare.

Det är en explicit generationsanpassning av acceptansmängden: redan kvalificerade basbytes behöver
inte deklareras och kvalificeras som en ny ändring. Det är inte bara ett namnbyte. Varje NY omfrysning
behåller alla v3.12-krav. Skalgrindstöd, nya undantag för produktkod och h-036:s eget kontrakt ingår inte.

### v3.13 — provplan och ännu inte körda prov

Fokuserade prov ska använda extraherade oförändrade predikat och syntetiska in-memory-data; de är
inte produktkvalificering och syntetiska kvitton är aldrig bevis för en H-körning. Positiva ankare:
ärvd exakt deklaration utan kvitto; oförändrade historiska skangränser med synliga befintliga noter;
basens befintliga grindsökväg med korrekt hållen identitet; exakt ärvd F7-drift samt en ny deklarerad
H-grinddrift. Negativer: gammalt kvitto ihop med ärvd deklaration; muterad ärvd deklaration; odeklarerad
H-grindändring utöver en deklarerad; fel hållna grindbytes/läge; extra eller borttagen fryst sökväg;
otillåten text i redan aktiv DRIFT/EFTERARBETE-not; extra drift, extra FAIL eller fel problem-lista i F7.

Full baslinje på exakt committad tvåfilskandidat: NOT_RUN tills körningen har samordnats och verifierats.
Full h-036-acceptans: NOT_RUN. h-036:s nuvarande grind har föråldrade bindningar till h-035, en frånvarande
webbfil, autopiloten och launchern; en enkel hashändring eller ett syntetiskt kvitto bevisar inte acceptans.
Dess riktiga omfrysning och kvalificering behöver eget kontraktsflöde. Denna runda skriver ingen sådan
grind eller produkt och påstår inte att h-036 är kvalificerad.

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

## Hotmodell

Grinden mäter mot EN motpart, och den motparten avgör vad som är blockerande fynd och vad som är en deklarerad gräns.

**Motparten är en BUILDER-agent som arbetar under en fryst grind den inte får ändra, plus oavsiktligt
återinförande.** Den är INTE en medveten sabotör med godtycklig kodexekvering i grindens process. Buildern skriver
produkt i sin egen skrivyta, kan läsa grinden, kan läsa och skriva i sin egen kandidat, och kör som samma användare på
samma maskin som grinden. Den som avsiktligt vill sabotera mätningen har enklare vägar än någon av dem nedan, och de
vägarna stoppas av rollflödet och av produktgranskningen, inte av en grindrad.

**Blockerande (grinden måste fälla):**
1. Gammal plan eller webbstyrning når FAKTISKT en agent eller en startad process. Det är slutkriteriet självt;
   granskning nr 13:s B2 och nr 14:s B1/B2 var alla av denna klass och alla mättes med riktiga barnprocesser.
2. Grindens EGEN bevisning kan förfalskas med vanliga produktmedel — obalanserade räknare, `PATH` genom `env=`,
   en utifrån-logg utan nämnare. Utan detta betyder flödesbeviset ingenting, även om punkt 1 aldrig utnyttjas.

**Deklarerad gräns med skriven motivering (grinden fäller inte, dokumentet redovisar):**
undanflykter som kräver avsiktlig manipulation av grindens interna objekt — `sys._getframe`/`f_back`/`f_globals`,
`gc.get_objects`/`get_referrers`, utbytta inspelarobjekt, `sys.settrace`/`setprofile` — och manipulation av
stubbloggens FIL av samma användare. Alla dessa är statiskt förbjudna i den skannade produktytan
(`GATE_NAMESPACE_TOKENS`) och deras kvarvarande NÅBARHET i körtid är gränsen: en produkt som skriver
`sys._getframe` blir röd på texten, en produkt som når samma objekt genom en väg ingen token namnger gör det
avsiktligt och ligger utanför modellen. Stubbloggen är på samma sätt manipulerbar av samma uid — men
**DETEKTERBAR, inte förhindrad**: löpnumret kommer från en låst räknare och varje post bär en HMAC över
(nummer ‖ innehåll) med en nonce per grindkörning, så borttagna, ändrade och tillagda poster syns som bruten kedja
eller lucka. Nonce:n är läsbar för den som läser stubben på sin egen `PATH`; vad kedjan köper är att utifrån-talet
inte kan sänkas TYST, inte att det inte kan sänkas.

**Samma användare och samma maskin är inget generellt undantag från kraven** (ägarbeslutet, arbetssätt p.5). Det
avgör bara vad som är rimligt att verkställa mekaniskt och vad som ska deklareras: en skyddsåtgärd som visar sig dyr
eller spröd ska bytas mot ett ENKLARE upplägg med skriven gräns, inte mot fler rader.

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
- `f2_regler_md_carries_the_working_method_role_flow_frozen_gate_rule_gate_change_rule_review_standard_and_rig_threat_model`
  (v3.10, ägarbeslut 2026-09-11): `docs/loop/regler.md` bär, i sin synliga text, alla fem grupperna i
  `RULES_REQUIRED` — rollflödet (`test-author`/`granskning`/`builder`/`lokal kvalificering`), att buildern
  `ändrar aldrig sin egen frysta grind`, kopplingen `befintligt krav` + `konkret hinder` för varje ytterligare
  grindändring, granskarens godkännandenorm (`arbetsbudget` … `aldrig ett kvarvarande fel`; `skenande kostnad` →
  `enklare upplägg`) och att `riggbegränsningar` bedöms mot uppgiftens `hotmodell` — samt frasen
  `källa för arbetsmetoden`. Mätt på 320c9df7: de två första grupperna håller redan (regel 11), de fyra övriga
  saknas — raden är röd på baslinjen av exakt det skälet.
- `f2_agents_claude_and_role_skills_reference_regler_md_and_the_plan_without_duplicating_a_normative_sentence`
  (v3.10, ägarbeslut 2026-09-11): `AGENTS.md`, `CLAUDE.md` och samtliga sex rollskills namnger BÅDE
  `docs/loop/regler.md` och plangenerationen; och ingen normativ mening förekommer i två av de nio aktiva
  dokumenten (regelkällan, planen och de åtta hänvisarna). En mening är normativ när den är ≥ `NORMATIVE_MIN_LEN`
  = 40 tecken efter normalisering (markdown-tecken bort, gemener, blanksteg normaliserade) och bär en markör ur
  `NORMATIVE_MARKER`. En mening som NAMNGER regelkällan eller planen är en **pekare** och undantas — pekaren får
  och ska upprepas i alla åtta dokumenten. Regelkällan måste själv bära ≥ `RULES_MIN_NORMATIVE_SENTENCES` = 8
  normativa meningar, annars är den inte mätbar (en tömd regelfil kan inte passera genom att inte ha något att
  duplicera). Mätt på 320c9df7: 52 normativa meningar över de nio dokumenten, noll kollisioner; i referensen 63.
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
- `f4_plan_constants_are_single_literal_assignments_equal_at_runtime_and_the_two_roadmap_tuples_keep_their_identities`
  (v3.5, review v9 N2/N3): `PLAN_GENERATION`, `ROADMAP_PLAN_PATH`, `ROADMAP_HANDOFF_PATH`, `ROADMAP_PLAN_BLOBS`,
  `AUTOPILOT_ROLE_POLICY`, `SUBSTITUTION_BLOBS` och `EMPIRICAL_GATE_PATH` tilldelas EXAKT EN gång på modulnivå, av rent
  literalt material (inget `Call`/`Attribute`/`Subscript`/`IfExp` och inga namn utom de fyra sökvägskonstanter som används som
  dict-nycklar) — en andra, miljöstyrd tilldelning (`os.environ.get(…, ROADMAP_PLAN_PATH)`) är RÖD — och modulens
  körtidsvärden är lika med literalerna för ALLA SJU konstanterna (v3.6 B1(b)/N8: även `ROADMAP_PLAN_BLOBS`,
  `SUBSTITUTION_BLOBS` och `AUTOPILOT_ROLE_POLICY`, vars exporterade körtidsvärden tidigare var en död mätning); dessutom `SUBSTITUTION_ROADMAP`-koderna == `SUB-1…SUB-4`, `ROADMAP[0].code == "S2"`
  och de två tuplarna är disjunkta (att tömma `SUBSTITUTION_ROADMAP` och lägga skivorna först i `ROADMAP` är RÖTT).
- `f4_ensure_roadmap_plan_returns_in_replica_without_any_remote`: den riktiga modulens
  `ensure_roadmap_plan(repo)` (namnet behålls — h-032-exit och publication-callers är namnbundna) returnerar i en
  replika utan remote (ingen fetch möjlig).
- `f4_ensure_roadmap_plan_stops_on_mutated_plan_generation` / `…_missing_handoff` / (v3.2 N2) `…_mutated_handoff`: planen
  med en ändrad byte, en borttagen handoff respektive en handoff med en ändrad byte → `Stop` (handoffens BYTES binds i
  körtidsvakten, inte bara dess existens).
- `f4_ensure_roadmap_plan_stops_when_the_plan_and_every_tracked_copy_are_mutated_together` (v3.6, review v10 N5): planen
  OCH varje annan spårad fil med samma blob muteras med samma bytes; vakten måste ändå `Stop`. En vakt som jämför mot en
  spårad kopia (t.ex. under `config/`) i stället för `ROADMAP_PLAN_BLOBS` ser då ingen skillnad och faller.
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
  additiva operander och argumentlösa blankstegstrimningar (`rstrip/strip/lstrip`) av källan; (v3.4 B1) INGEN omskrivning
  efter roten: `replace/format/join/%` och varje metod med argument är RÖTT, enbart operatorn `+` är tillåten (`* 0 + x` är
  RÖTT), två byggarrötter får inte konkateneras; `Name` löses genom funktionens EGNA tilldelningar (alla tilldelningar till
  namnet måste ha byggarrot); RÖTT är anrop till varje annan modulfunktion (ingen "datahjälpare"), modulnivånamn/konstanter/
  importer som textkälla, subscript/klassmetoder, comprehension, `IfExp` där bara en gren har byggarrot, `+=` med
  prompttext, varje referens till ett runner-namn som inte är ett direkt anrop (alias, även på modulnivå), (v3.4) varje
  dynamiskt uppslag (`globals/getattr/vars/locals/eval/exec/__import__`, `sys.modules`, `importlib`, `__dict__`) utanför
  den mätta slutna mängden {_provider_snapshot, _python_snapshot, _strict_provider_authority, publication_authority,
  publish, selftest} och varje strängkonstant som namnger en runner utanför `selftest` (även på modul-/klassnivå) — ett
  runner-anrop via `globals()["run_codex_"+…]` är därmed RÖTT på två sätt. Modul- och klassnivå
  sveps: rollmarkör i någon strängkonstant, eller `docs/`-fil inbäddad i längre text (hela sökvägskonstanter är
  tillåtna), är RÖTT — även dynamiskt (`vars(m)`: strängar och klassers metoder). Nåbarhet från `main()` räknas enbart
  via ANROP (`Call.func`), inte via döda referenser. Kanari: fixturmodul med tvilling via anrop, inlinat flöde, död
  prompt, modulmall, klassmetod, runner-alias, parameter-genomsläpp och hjälpfunktion — alla flaggas; det legitima
  flödet (byggare + additiv guidance, vaktanrop) och en ren trimning (`.rstrip()`) släpps; `.replace`, `* 0 + x` och
  `globals()[…]`-runner flaggas (kanari). Referensens 16 verkliga runner-argument (13 byggaranrop, `effective`←`prompt` i
  runnern, `byggare + (guidance-f-sträng if … else "")`, f-sträng i flödet; enbart operatorn `+`, inga strängmetoder) går igenom.
- `f4_live_flows_run_to_completion_through_the_stubbed_runner_every_prompt_naming_plan_and_handoff_where_required_and_free_of_old_pointers`
  (v3.3/v3.4, B1 dynamisk — den verkliga effekten): DRIVER-scenariot `live_flows` importerar modulen i en replika av
  kandidaten (`refs/remotes/origin/main` = HEAD), monkeypatchar `run_codex` till en fångare som bokför VARJE argument och
  svarar med ett syntetiskt READY-rapportobjekt (`AgentRun`), så att flödena fortsätter förbi första anropet genom
  reviewer-/remedierings-/publiceringsvägarna — (v3.5 N1) stubben är tillståndsstyrd: FÖRSTA svaret per (flöde, roll) är
  `NEEDS_REMEDIATION` med ett fynd för REVIEWER och GATE_REVIEWER (och för EMPIRICAL i det fristående empiriska flödet), därefter
  READY, så att varje remedieringsgren OCH arkitektvägen (`architect_resolution` via den empiriska routningen) faktiskt nås;
  den slutna stubbmängden `LIVE_STUB_NAMES` (ensure_worktree,
  detached_worktree, remove_worktree, clean, origin_main, capture_green_gates, run_gate, run_empirical_gate,
  assert_builder_scope, assert_test_author_scope, assert_roadmap_test_author_scope, assert_empirical_gate_author_scope,
  assert_final_gates, assert_task_gate_completion, assert_s7_external_prerequisite, run_invariants, stage_and_commit,
  publication_authority, publish, task_contract_judgeable, task_obj) och `LIVE_REQUIRED_ATTRS` (run_codex, AgentRun, Cmd,
  sha, Stop, EMPIRICAL_GATE_SUBJECT, skivtuplarna, slice_builder_extra och de tio flödesfunktionerna) är deklarerade — ett
  omdöpt hjälpnamn ger produktraden "closed-world name missing", inte ett oklart fel. Stubbarna är tillståndsstyrda som
  produktionen kräver: taskgrinden RED tills en BUILDER-prompt för just den tasken fångats, programgrinden RED tills
  L publicerats (eller i den fristående empiriska slutkörningen). Flöden: `architect_resolution`, `roadmap_contract_flow`
  [SUB-1, S2], `empirical_gate_contract_flow`, `builder_flow[S2]` (med `slice_builder_extra`), `ensure_roadmap_slice`
  [SUB-1, S2], `test_author_flow`, `empirical_unattended_flow`, `full_roadmap`. Krav: varje flöde löper till slut
  (`returned`), antalet runner-anrop ≥ mätt minimum per flöde (v3.5: 1/4/4/4/4/4/4/4/7/37 — minima mätta MED remedierings-
  grenarna, så en produkt som hoppar över dem faller), (v3.6 N4) minst en fångad prompt per remedieringsbärande flöde bär
  granskningsfyndets id (`FIXTURE-1`) — ett närvarokrav på id-strängen, inte ett bevis för att fyndtexten renderades
  (granskning nr 11 N5: `builder_prompt(...) + "Reviewer finding ids: FIXTURE-1."` uppfyller det) — plan + handoff i varje fångad prompt
  för rollerna ARCHITECT, TEST_AUTHOR/GATE_REVIEWER (roadmap-/empiriska flödena), BUILDER (skivvägen och den empiriska
  remedieringen) och EMPIRICAL — REVIEWER och S3-flödets (h-003) prompter undantagna — och inga gamla pekare/commit-läsning/
  kodwebb/ägarstopp i NÅGON fångad prompt (alla roller, alla anrop). **(v3.7, granskning nr 11 B2)** Det svepet låg i v3.6
  felindenterat inne i FIXTURE-1-grenen och kördes därför aldrig på en grön produkt; det ligger nu i loopen över
  `caps` och exekveras för varje fångad prompt i vart och ett av de tio flödena. Tio separata kanarier (en per flöde,
  en körtidshopsatt gammal plansökväg i den prompt flödet faktiskt skickar) är röda och flaggar exakt sitt eget flöde.
  (v3.5) Eftersom remedieringsgrenarna nu nås måste även
  `remediation_prompt` (BUILDER och TEST_AUTHOR) och den inlinade L-remedieringen namnge plan + handoff — annars faller raden.
- `f4_live_flows_start_no_provider_process_outside_the_stubbed_runner_and_leave_no_side_effects` (v3.5, review v9 B1 dynamisk):
  drivern spelar in VARJE processtart under live-flödena — `subprocess.Popen` plus `os.posix_spawn(p)`, `os.execv(e|p|pe)`,
  `os.spawnv(e)` och `os.system` (v3.6 N1), patchade både i sina moduler och i modulens namnrymd — och delegerar till
  originalet. Eftersom runnern är stubbad får ingen providerstart alls ske: en start är misstänkt om argv bär elementet
  `--output-schema` eller `danger-full-access`, om binärens namn bär `codex`, om binären inte är en av de mätta tillåtna
  eller om primitiven inte är den enda mätta (`subprocess.Popen`) — och den måste då bära en av de fångade prompterna.
  **(v3.8, granskning nr 12 B2)** Den tillåtna mängden är delad, för v3.7:s vidgning till `{git, env, sh, python3.12}`
  lade in tre TOLKAR i verktygsmängden utan innehållsregel för vad de ombeds köra (mätt: en providerrad inuti ETT
  `sh -c`-element var grön). `ALLOWED_LIVE_TOOLS = {git}` känns igen på **exakta argv-element** (ett delsträngstest
  flaggade det vanliga `git show …:docs/loop/codex-evidence-contract.md`); `ALLOWED_LIVE_WRAPPERS = {env, sh,
  python3.12}` får hela sin argv genomsökt efter providermarkörer som **delsträng**.
  **(v3.9, granskning nr 13 B2)** Det räckte inte: sex mätta mutanter var gröna under v3.8 därför att en tolks nyttolast
  inte behöver ligga i argv alls (`sh` med skriptet på STDIN, argv = `['/bin/sh']`), inte behöver stava markörerna
  (`sh -c 'exec "$0" "$@"'`, `env A=1 …`, `python3.12 -c '<kort enradare>'`), och därför att `git` var bundet på
  **basnamn** — ett skalskript som hette `git` fick fri argv och rapporterades som `live_start_binaries=['git']`.
  Den avgörande mutanten gav en barnprocess `PROVIDER=codex PROMPT=read docs/loop/autonomous-loop-plan-v1.md` på stdin
  medan grinden var grön. v3.9 binder därför: (i) **identitet, inte basnamn** — varje exekverad fil löses till sin
  realpath och sha256-prövas mot den mätta mängden (de pinnade verktygen, de två omslagsbinärerna och grindens egna
  stubbar), och realpath + sha256 redovisas i evidensen i stället för basnamn; (ii) **sluten formmängd för omslag** — en
  omslagsstart är tillåten bara när hela dess argv är en av formerna i `ALLOWED_LIVE_WRAPPER_FORMS` (`env true`,
  `python3.12 -c 'print(1)'` — precis granskning nr 11:s två falskt-röda prov), och **stdin till ett omslag är rött
  villkorslöst**; (iii) **nyttolast utanför argv mäts** — stdin-innehållet fångas både in-process
  (`Popen.communicate`) och utifrån (PATH-stubbarna), och argv ∪ stdin ∪ barnets miljö skannas tillsammans med
  `OLD_PLAN_TOKENS` och providermarkörerna. Mätt: referensen startar bara `git`, och de två falskt-röda proven förblir
  gröna. (v3.6 B1) Identiteten mäts dessutom EFTER flödena: grindens egna inspelare måste fortfarande vara
  installerade på alla primitiver och `m.subprocess` vara samma modulobjekt — en produkt som byter ut `subprocess.Popen`
  från en funktionskropp avinstallerar inspelaren och faller här i stället för att se ren ut.
  **(v3.8, granskning nr 12 B1) Inspelarna installeras FÖRE `exec_module`** i live-scenariot. v3.7 fångade stdlib-
  originalen före modulladdningen men installerade inspelarna efter den, så varje importtidsfångst som inte är en sats —
  ett funktionsdefault (`def _s(t, _S=os.posix_spawn)`), ett dekoratorargument, ett metoddefault, en metaklass — tog den
  riktiga primitiven (mätt: 24 riktiga barnprocesser med en neutral prompt medan grinden var grön). Med inspelarna
  installerade först fångar varje sådan konstruktion det INSTRUMENTERADE objektet, vilket stänger hela klassen
  strukturellt i stället för form för form — och det är den enda bindningen som finns för de åtta `os.*`-primitiverna,
  som inte har något attribut under modulattributet att spela in. Starter som produkten gör medan den importeras
  redovisas separat (`import_time_starts`) och är röda.
  **(v3.7, granskning nr 11 B1) Gränsen binds också UNDER `Popen`:** `subprocess.Popen._execute_child` och
  `Popen.__init__` fångas ur stdlib INNAN subjektsmodulen laddas, jämförs mot originalen både vid import och efter
  flödena, och `_execute_child` bär grindens egen inspelare under körningen. Därmed mäts (a) det som FAKTISKT når
  barnprocessen — varje argv som skiljer sig från den argv Popen-inspelaren såg redovisas som `argv rewritten between
  Popen and the child` — och (b) starter gjorda genom en Popen-KLASS som fångats vid import, som då syns bara på
  barnnivån. **(v3.8, granskning nr 12 B1(b)) Aggregatjämförelsen `child_total == popen_total` är balanserbar** (mätt:
  19 dolda starter plus 19 inspelade Popen-anrop med samma argv som kastar i `__init__` före `_execute_child` gick jämnt
  ut), så den står kvar som en indikator men bär inte beviset. Beviset är **per anrop**: varje barnstart som sker medan
  inget inspelat Popen-anrop ligger på stacken redovisas som `child start outside any recorded Popen call`, och argv
  jämförs som **multimängd** (`Counter`), inte som mängd. Referensen mäter `popen_total = child_total = 333`.
  Samma före/efter-sidoeffektsvep som `prompts`-scenariot omger live-körningen (N4); **(v3.7 N8)** svepet täcker nu
  dessutom subjektets `.git/` (refs, hooks, config, HEAD, toppnivåposter) och grindens egen `FIXTURE_ROOT` rekursivt,
  minus de två sökvägar flödena legitimt äger (live-repliken och drivrutinens `TMPDIR`).
- `f4_live_flows_stop_before_the_stubbed_runner_on_mutated_plan_generation` (v3.3, B2 dynamisk): samma körning i en
  replika med muterad plan — de fyra vaktbärande flödena (`roadmap_contract_flow` ×2, `empirical_gate_contract_flow`,
  `full_roadmap`) måste STOPPA (`Stop`) utan att runnern anropats; de övriga flödena bär ingen egen vakt.
- `f4_runner_machinery_ast_identical_to_320c9df7_provider_machinery_untouched` (v3.4, B2): mätpunkten är bunden —
  normaliserad AST-identitet (sha256 av `ast.dump` utan positioner, mätt med den pinnade python3.12) för `run_codex`,
  `run_codex_resolving_architecture`, `_provider_snapshot`, `_python_snapshot`, `_strict_provider_authority` och
  `AUTOPILOT_ROLE_POLICY` == plattformsautopiloten vid 320c9df7. Runnern kan därmed inte läsa prompten ur fil/miljö i sin
  egen kropp. Kanari: whitespace-/formateringsändring ger samma identitet, en kroppsändring en annan. **Vad som är mekaniskt
  backat av "rörs inte" (korrigerad formulering, v3.5 efter granskning nr 9):** dessa sex definitioner binds per normaliserad
  AST; `controller/authority/{cli,core.py}` och `controller/launch/{cli,runtime_snapshot.py}` binds per BLOB mot 320c9df7
  (raden nedan); autopilotens modulnivå binds per FORM; `verify/**`, `controller/loop/cli`, specen och registret binds av F6/F3.
  Allt annat under `controller/**` är deklarerad gräns (det skyddas i drift av specens `denied_write` och policygrinden, inte av
  detta kontrakt).
- `f4_autopilot_module_and_class_bodies_are_the_declared_form_no_exec_surface_rebinding_anywhere_and_the_pinned_authority_library`
  (v3.5/v3.6, review v9/v10 B1): varje toppnivåsats i autopiloten är en `Import`/`ImportFrom`/`FunctionDef`/`ClassDef`/
  `AnnAssign`/`Assign` med enbart `Name`-mål, modulens docstring, `__main__`-vakten sist, eller en av exakt två mätta satser
  (`sys.dont_write_bytecode = True`, `sys.path.insert(0, str(AUTHORITY_LIB))`, matchade byte-exakt); varje bar anropssats och
  varje block på modulnivå är RÖTT. (v3.6 B1) Samma satsformer krävs i KLASSKROPPAR (en `ClassDef`-kropp körs vid import;
  baslinjens fem klasser bär bara `Pass`/`FunctionDef`/`AnnAssign`), och exec-ytsregeln gäller HELA FILEN, inte bara
  modulnivån: ingen tilldelning någonstans — funktionskropp, klasskropp, `AugAssign`, `setattr` — får ha ett attributmål vars
  namn ligger i exec-ytan (`Popen`, `run`, `call`, `check_output`, `system`, `exec*`, `posix_spawn`, `fork`, `popen`, `which`,
  `copy`, `move` …) eller vars bas är en exec-modul (`subprocess`/`os`/`shutil`/`sys`/`multiprocessing`/`pty`/`posix`,
  undantaget `sys.dont_write_bytecode`), skriva in i `sys.modules`/`globals()`/`vars()`/`locals()` eller subscript-tilldela ett
  MODULNIVÅNAMN (så fälls `AUTOPILOT_ROLE_POLICY["BUILDER"] = …` var den än står). Tillåtet överallt: vanliga namn,
  tuple-uppackning, `self.<attr>` utanför exec-ytan och subscript på lokala namn (mätt på 320c9df7: tio icke-Name-mål totalt,
  alla ofarliga). (v3.6 N6) Modulnivåns VÄRDEregel träffar bara attribut på exec-moduler — ett legitimt `X = Y.copy()` är grönt.
  (v3.6 N7) En modulnivåkonstant får inte sätta ihop en `docs/…`-sökväg av fragment. (v3.6 N3) `AUTHORITY_LIB` har
  320c9df7:s AST-identitet och drivern rapporterar vilken fil den importerade `core`-modulen faktiskt kom från — den måste
  ligga under `controller/authority/`. DYNAMISKT: efter modulimporten måste `subprocess.Popen`, `os.posix_spawn`,
  `os.execv*`, `os.spawnv*` och `os.system` vara stdlibs original och `m.subprocess` samma modulobjekt.
- `f4_runner_dependencies_authority_and_launch_byte_identical_to_320c9df7` (v3.5, review v9 B1): `controller/authority/cli`,
  `controller/authority/core.py`, `controller/launch/cli` och `controller/launch/runtime_snapshot.py` har exakt sina
  320c9df7-blobbar (`6b6bb827…`, `b17600c7…`, `ed865cf4…`, `cb9a4ab1…`) — authority-biblioteket importeras av autopiloten vid
  start och launchern bär provider-argv; F7:s launch-cwd-grind mäter launcherns cwd-beteende, inte dess bytes (mätt av
  granskningen: en launcher som skriver om provider-argv ger identisk 19/20 och identisk detalj), därför denna blobbindning.
- `f4_provider_argv_built_and_started_in_exactly_one_place_inside_run_codex` (v3.5, review v9 B1): `subprocess.Popen(` anropas
  exakt en gång i autopiloten och bara i `run_codex`; ingen annan funktion bär en `Popen`-start eller strängkonstanten
  `--output-schema`.
- `f4_ensure_roadmap_plan_called_from_exactly_the_expected_guard_callers_all_reachable_from_main` (v3.3, B2 statisk):
  funktionerna som ANROPAR `ensure_roadmap_plan` (`Call`-position) == {doctor, empirical_gate_contract_flow,
  full_roadmap, roadmap_contract_flow, roadmap_status}, alla nåbara från `main()` via anrop.
- `f4_prompt_builders_run_in_contained_fixture_without_side_effects` (v3.2 N5, v3.3 N6): byggarna körs i en egen fixtur
  (HOME/XDG/TMPDIR under fixturen, cwd i fixturen, `GIT_DIR` mot ett tomt bare-repo, proxyvariabler mot en stängd lokal
  port); varje ny eller ändrad fil under fixturen eller under subjektets ARBETSTRÄD (`.git/` undantaget — indexbrus från
  andra processer är inte en produktsidoeffekt) och varje ny/borttagen/överskriven toppnivåpost (reguljära filer mäts med storlek + mtime) i `/private/tmp`,
  `/private/tmp/claude`, `/private/tmp/claude-501`, processens tempkatalog och dess förälder är FAIL — undantaget är exakt
  grindens eget `FIXTURE_ROOT`-namn (v3.4: inte längre prefixet). Gräns: samtidiga skrivningar från ANDRA processer i dessa
  delade kataloger under byggarnas körning (sekunder) ger falskt rött — kör en fullkörning åt gången. Gräns: skrivningar
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
- `f4_handoff_has_required_sections_syfte_pinnar_startordning_stoppregler_avslutskriterier_and_names_plan_and_generation`
  (v3.4 N): handoffens text (HTML-kommentarer borttagna; kodstaket räknas som synlig text eftersom pinnarna står där) har
  `## `-rubriker som matchar `syfte`, `låsta värden|pinnar`, `start`, `stopp`, `avslutskriteri` (≥2 kroppsrader var), namnger
  planens sökväg, bär `PLAN_GENERATION` med autopilotens värde, och är inte byte-identisk med planen.
- (v3.4 N) Skivtabellens radordning för autopilotens skivor == `SUBSTITUTION_ROADMAP + ROADMAP`-ordningen, `ROADMAP[0]`
  är S2 (h-032:s och governance-grindens fixturskiva), och varje beroende som är en annan tabellrad står på en tidigare rad
  (topologiskt konsistent) — mäts i skivtabellraden.
- `f4_plan_generation_has_required_sections_syfte_malbild_skydd_skivtabell_bootstrap_arbetsflode_avslutskriterier` (v3.2
  N7): planens synliga text har `## `-rubriker som matchar `syfte`, `målbild`, `skyddade invarianter|tekniska skydd`,
  `skivtabell`, `bootstrap`, `arbetsflöde`, `avslutskriteri`, var och en med ≥3 icke-tomma kroppsrader. Planens substans
  mäts alltså via skivtabellen + de krävda avsnitten + tokenmängderna; kriterier och negativa kontroller per skiva läses av
  den oberoende produktgranskningen. RECON-kartan (`~/nortropic/RECON-PLANGENERATION-20260910.md`, sha256
  `e01fcfa5a7bf948c0de0a42079f995eb64772a19f496891b88c525f5d56b4625`) är vägledning för författandet, inte en pinne.
- `f4_plan_generation_avslutskriterier_carry_the_four_measurable_levels_planseparation_trust_kernel_bootstrap_milestone_and_later_operational_whole`
  (v3.10, ägarbeslut 2026-09-11): avsnittet `## Avslutskriterier` bär alla mönster i `PLAN_EXIT_LEVELS` fördelade på
  fyra nivåer — planseparation, Trust Kernel, lokal bootstrap-milstolpe och operativ helhet markerad `senare` och
  `utanför dagens` fas. Mätpunkten är AVSNITTET, inte hela planen: en nivå som står någon annanstans räknas inte.
- `f4_plan_generation_bootstrap_names_a_finite_handover_point_to_qualified_autonomous_operation` (v3.10): avsnittet
  `## Bootstrap…` bär `ändlig`, `överlämningspunkt`, `kvalificerad autonom drift`, `fortsatta utveckling` och
  `därefter` — bootstrap slutar vid en bestämd punkt, och organisationens utveckling fortsätter efter den.
- `f4_plan_generation_malbild_carries_self_identified_needs_within_goal_and_mandate_and_web_as_a_business_using_the_platform`
  (v3.10): avsnittet `## Målbild` bär att autonomin själv identifierar behov/möjligheter, prioriterar, genomför och
  utvärderar inom organisationens `mål och mandat`, och att `Webb/Digitala` är en `verksamhet som använder`
  plattformen.
- `f4_plan_generation_preserves_h039_functional_requirement_zero_runtime_residues_and_no_loss_of_foreign_data`
  (v3.10): avsnittet Skyddade invarianter/tekniska skydd bär `h-039`, `avslutad städning`,
  `noll registrerade runtime-rester`, radering/ersättning och `främmande data` genom den identifierade
  `kapplöpningen`. Ägarbeslutets H039-punkt överlever alltså generationsbytet i planen, inte bara i H-evidensen.
- `f4_architect_and_empirical_runner_skills_name_plan_generation_and_no_plan_commit` (v3):
  `.agents/skills/nortropic-architect/SKILL.md` och `nortropic-empirical-runner/SKILL.md` namnger den nya planens
  sökväg och saknar `<PLAN_SHA>`, `frozen autonomous-loop plan commit`, `git show {…|<…|<hex>:` och den gamla planens pekare.
- `f4_autopilot_substitution_blobs_equal_head_blobs_of_generation_documents`: `SUBSTITUTION_BLOBS`
  ⊇ de elva dokumenten och varje OID == kandidatens HEAD-blob (pinnar uppdateras när generationen ändras).
- `f4_autopilot_selftest_none_returns_pass_prints_plan_generation_and_no_plan_sha` (v3.1 N2): `selftest(None)` returnerar,
  stdout bär `AUTOPILOT_V4_SELFTEST=PASS` (control-set-grinden binder strängen) och exakt raden
  `PLAN_GENERATION=<modulens PLAN_GENERATION>` men ingen `plan_sha`/`PLAN_SHA`-rad; `f4_autopilot_publication_callers_exit0`, `f4_controller_loop_cli_unchanged_vs_332f07ce`.

**v3.11 — riggfixen i sidoeffektsvepet.** `f4_prompt_builders_run_in_contained_fixture_without_side_effects`
och `f4_live_flows_start_no_provider_process_outside_the_stubbed_runner_and_leave_no_side_effects` jämförde
t.o.m. v3.10 också toppnivåposterna i `/private/tmp`, `/private/tmp/claude`, `/private/tmp/claude-501`,
`$TMPDIR` och dess förälder. De katalogerna delas med varje annan process på värden: en annan interaktiv
session som skapade sin egen temporärkatalog gav **falskt RÖTT två gånger** medan alla fyra processräknarna
var identiska. Ett falskt rött blockerar varje framtida kvalificering och är därför självt ett fel. Svepet
täcker från v3.11 exakt det grinden själv skapat: subjektets arbetsträd, subjektets `.git`
(namn/refs/hooks/config) och grindens egen `FIXTURE_ROOT` rekursivt minus de två sökvägar flödena
legitimt äger (live-replikan och driverns `TMPDIR`) — för promptkörningen hela dess inneslutna fixturrot
(`home`/`xdg`/`cwd`/`tmp`/`gitdir`). Produktens egna sidoeffekter fångas alltså fortfarande: driverns cwd
ligger under `FIXTURE_ROOT` och sveps. Vad det INTE längre fångar står under "Vad grinden inte bevisar".

### F5 — loopens testsvit utan webbfixtur
- `f5_loop_fall_py_b2_no_web_fixture_or_web_invariant`: `tests/controller/loop/fall.py` saknar
  `agents/`, `INV-00N`, `workflows/`, `tests/fixtures`; B2 finns.
- `f5_loop_fall_py_green_in_replica` (kräver sandbox-exec; FAIL under `--skip-held-gates`): sviten
  körs hermetiskt i replika → exit 0, ≥53 `ok`, inga `FEL`, en B2-rad som namnger `PINV`, slutar
  med `alla fall håller`. (Mätt 2026-09-10 på 332f07ce: 52 ok, 1 FEL = B2, 41 s.)

### F6 — fryst evidens och den ordnade refreezen (v3.11)

**Hindret v3.11 tar bort.** v3.10 blob-frös HELA `verify/`-trädet mot 332f07ce och tillät exakt ETT tillägg
(denna grind). Mätt på h-035:s refreeze-kandidat `a288e169`: **122/5**, och alla fem röda rader hade ETT
gemensamt skäl — en fryst grinds bytes hade ändrats. Följden var att INGEN H-grind någonsin kunde frysas om,
vilket blockerade h-035, h-036, h-037 och h-038, alltså hela den kvarvarande bindningskedjan. Det avvisade
alternativet — att lägga refreezes med separationsgrinden medvetet röd — faller på ägarbeslutets Trust
Kernel-kriterium: kvalificering kräver att rätt frysta verifierare körts färdigt med samtliga obligatoriska
kontroller, och en medvetet röd grind är ingen kvalificering.

**Deklarationen** ligger i `SEPARATION-20260910/REFREEZE.json` (spårad, valfri; frånvaro = ingen refreeze):

```json
{"contract": "platform-separation-final-refreeze-declaration-v1",
 "refreezes": [{"path": "verify/bin/h-035-exit", "base_sha256": "<332f07ce-objektets sha256>",
                "new_sha256": "<kandidatens bytes>", "expected_pass": 462, "reason": "<skriven motivering>",
                "retired_labels": {"<basradetikett>": "<skriven motivering>"}}]}
```

`retired_labels` är valfri (frånvaro = inga pensionerade radetiketter); alla andra nycklar är obligatoriska och
nyckelmängden måste vara exakt en av de två formerna.

- `f6_refreeze_declaration_is_one_ordered_frozen_h_gate_with_matching_base_and_new_sha256`: strikt JSON,
  exakt nyckelmängd, **exakt EN** post (ordnad refreeze — två grindar i samma kandidat är ingen ordnad
  refreeze och är dessutom formen för "ändrar i smyg en andra grind"), sökvägen matchar
  `^verify/bin/h-0\d\d-exit$` (de tre HÅLLNA grindarna kan aldrig frysas om — kvalificeringen kör deras
  frysta bytes), `base_sha256` == 332f07ce-objektets bytes, `new_sha256` == kandidatens bytes, bytes skilda
  från basen, läge 755, `expected_pass` heltal ≥ 20 (mätt golv), skriven `reason`, och filen parsar som Python.
- `f6_refreeze_keeps_every_base_row_label_except_the_declared_retirements` **(v3.12, granskning nr 15 B1)**:
  innehållsgolvet, härlett **mekaniskt ur BASGRINDENS egna frysta bytes** — ingen handskriven lista, så regeln gäller
  varje kommande omfrysning (h-036, h-037, h-038) utan ny kontraktsrunda.
  - **Härledningen:** `gate_row_labels(source)` returnerar de identifierarformade strängkonstanter som skickas som
    POSITIONSARGUMENT till ett anrop vid namn `check` — alltså grindens egna radetiketter. Mätt på `332f07ce`:
    **h-035 251, h-036 27, h-037 21, h-038 9**.
  - **Regeln:** varje basradetikett måste fortfarande vara en radetikett i den omfrysta grinden, utom de som
    kandidaten DEKLARERAR pensionerade. Dessutom `expected_pass >= antal basetiketter − antal pensionerade`
    (per-grind-golv), pensionerade etiketter måste finnas i basen, får inte finnas kvar i den omfrysta grinden och
    måste var och en bära en skriven motivering på minst 20 tecken. Taket är **tre** pensioneringar: en omfrysning
    som tappar fler av basens kontroller är en omskrivning, inte en omfrysning, och kräver en egen kontraktsrunda
    (mätt: den verkliga h-035-omfrysningen pensionerar exakt **en**).
  - **Fail-closed:** en grind vars bas ger färre än 5 härledbara radetiketter kan inte frysas om under detta kontrakt
    alls — regeln kan inte bli vakuös.
  - **Varför statiskt och inte täckning över körningen:** 70 av h-035:s 251 basetiketter finns i den omfrysta källan
    men emitterades inte i den ärliga körningen (grenberoende). Att kräva dem i kvittot vore ett falskt rött. Mätt på
    den verkliga kandidaten `a288e169`: 250 av 251 behållna, och den enda som tappas är exakt
    `F_H036_V3_THREE_DOCUMENTS_EXACT_35D7FD7C_PLUS_HASH_BOUND_APPEND` — den H036_V3/docs-05-kontroll som
    omfrysningen pensionerar.
  - Detta ersätter v3.11:s globala `REFREEZE_MIN_PASS = 20`, som granskningen visade var exitkod 0 plus en
    radräkning: en FEMRADIG leksaksgrind med 25 `PASS`, ärligt körd och med ärligt kvitto, gav `rc=0, 131/131`.
- `f6_refreeze_added_lines_free_of_web_governance_human_hand_and_old_plan_tokens`: `verify/**` klassas som
  fryst evidens och skannas annars inte — en refreeze ADDERAR bytes dit, så de TILLAGDA raderna (rader som
  inte finns i basversionen) skannas med `WEB_TOKENS + HUMAN_TOKENS + OLD_PLAN_TOKENS + COMMIT_READ_TOKENS`
  **(v3.12, granskning nr 15 N1)** Hela tokenmängden skannas per FILRAD. De tre **retirement-identifierarna**
  (`docs/05-beslutslogg`, `beslutslogg\w*`, `human_only`) undantas BARA på en rad som bär en
  retirement-BUNDEN strängkonstant — en konstant tilldelad ett namn som matchar `(?i)retired`, eller en
  dict-post vars nyckel namnger en pensionering. v3.11 tog bort de tre mönstren globalt, och granskaren smugglade
  då in styrningsprosa i en KOMMENTAR och en AKTIV `human_only`-stoppfunktion genom dem; ingetdera är en
  retirement-bunden strängkonstant och båda är röda i v3.12. Mätt på den verkliga kandidaten `a288e169`: 5 träffar
  på 3 rader, alla retirement-bundna → 0 röda. `docs/07-konstitution.md` och `docs/03-regelverk.md` fångas
  fortfarande (`konstitution\w*`, `regelverk\w*`), och F1 binder alltjämt att ingen sådan fil finns i trädet.
- `f6_declared_refreeze_is_qualified_by_a_receipt_bound_to_this_candidate_and_the_refrozen_bytes`: en
  deklarerad refreeze krediteras BARA mot ett **kvalificeringskvitto** som lämnas vid körningen
  (`--refreeze-receipt <fil>`). **(v3.12, granskning nr 15 B2)** Kvittots sökväg VERKSTÄLLS nu: en sökväg vars
  `resolve()` ligger i eller under subjektträdet avvisas, spårad som ospårad. v3.11 påstod bara att kvittot aldrig
  kan komma ur trädet och verkställde ingenting — ett OSPÅRAT kvitto i subjektet krediterades (mätt 126/5, ingen ny
  röd rad), eftersom renhetskontrollen använder `--untracked-files=no`. Ett SPÅRAT kvitto är självuteslutande
  (det kan inte bära sha:n för den commit det självt ingår i). Kvittot är strikt JSON med exakt nyckelmängden
  `{contract, gate, gate_sha256, subject_head, invocation, exit_code, pass_count, fail_count, stdout_sha256,
  stdout}`. Grinden räknar om `sha256(stdout)`, räknar `^PASS `/`^FAIL `-raderna själv och kräver:
  `gate` == den deklarerade sökvägen · `gate_sha256` == `new_sha256` == kandidatens bytes ·
  `subject_head` == **exakt denna kandidats commit** · `exit_code == 0`, noll FAIL-rader, `fail_count == 0` ·
  antalet PASS-rader == `pass_count` == deklarationens `expected_pass` (byggaren måste alltså FÖRUTSÄGA
  utfallet innan kvalificeringskörningen) · `invocation` är den kanoniska pinnade formen (den pinnade
  Python-binären, `-I -S -B`, sista argumentets basnamn == grindens). Ett kvitto för en grind kandidaten
  inte deklarerar är rött. Utan kvitto är raden FAIL, aldrig PASS.
- `f6_frozen_tree_paths_are_the_332f07ce_set_plus_this_gate_only`: (a) den exakta MÄNGDEN spårade sökvägar
  under träden `verify/**`, `controller/h034-native`, `controller/runtime-cleanup`, `controller/provenance`,
  `SEPARATION-20260910/proposed/**` samt filerna `scripts/check-invariants.mjs`, `controller/loop/cli`,
  `controller/attest/cli` (utanför produktytan; bär de historiska refreeze-konstanterna),
  `docs/loop/owner-author-workflow-v1.md`, `docs/loop/remaining-bootstrap-delegation-v1.md`,
  `docs/loop/document-authority-local-development.md`,
  `SEPARATION-20260910/{README.md,ALLOCATION.tsv,WEB-TRANSFER-PROVENIENS.tsv}` == basmängden **plus exakt
  denna grind**; inga tysta tillägg, inga borttagningar; arbetsträdet == HEAD; grinden 755 och lika den
  hållna kopian.
- `f6_frozen_tree_bytes_identical_to_332f07ce_except_the_declared_refreeze`: (b) varje fil i de träden är
  byte-fryst (blob-OID) mot 332f07ce UTOM de deklarerade refreezerna. En ODEKLARERAD byteändring är röd, och
  en deklaration av en fil som inte ändrats är också röd.
- `f6_earlier_local_gates_identical_to_332f07ce`: control-set-, launch-cwd- och governance-grinden oförändrade.
- `f6_efterarbete_append_only_vs_332f07ce_with_scanned_addition`: `SEPARATION-20260910/EFTERARBETE.md` börjar
  med 332f07ce-bytes; det tillagda saknar webb- och människohandstoken (basdelen är uppdelningens evidens).
- drift.md append-only (F2).

**En generation rymmer exakt EN omfrysning (v3.12, granskning nr 15 N3).** Allt jämförs mot
`FROZEN_BASE = 332f07ce` och deklarationen tillåter exakt en post. En andra ordnad omfrysning (h-036) ovanpå en
redan integrerad h-035-omfrysning faller därför på `f6_frozen_tree_bytes_…` med
`undeclared_byte_changes=['verify/bin/h-035-exit']` — beteendet är korrekt och konservativt, men det betyder att
**h-036, h-037 och h-038 var och en kräver en ny separationskontraktsrunda med ompinnad `FROZEN_BASE`.**
Ompinningen görs så här: när h-035-omfrysningen är kvalificerad och integrerad, sätt `FROZEN_BASE` till den
integrationscommiten, mät om `f2_local_development_documents_are_exactly_the_<bas>_set_plus_this_contract`,
`f6_*`-radnamnen (de bär basens åtta första tecken) och `f1_web_transfer_provenance_2_lists_the_four_files_with_blob_oids_at_<bas>`,
och kör om grön baslinje + acceptans för nästa grind i ordningen. `CONTROL_SET_BASE`, `LAUNCH_CWD_BASE` och
`GOVERNANCE_BASE` är de hållna grindarnas EGNA baser och ompinnas INTE — de tre grindarna är frysta.

### F7 — de tre tidigare frysta lokala grindarna mot kandidaten
Grinden kör den hållna kopian: subjektets egen fil när dess blob == `332f07ce:<grind>`, annars en
`--held-*`-override som måste ha exakt den bloben (annars FAIL-rad, aldrig subjektets avvikande kopia).
Kvalificeringen kör alltså alltid 332f07ce-bytes av de tre grindarna. Kör aldrig två fullkörningar i samma
`TMPDIR`: launch-cwd-grindens h036-residuekontroll ser den andra körningens rötter (mätt flaky 2026-09-10).
Riggnot: grinden städar inte sitt `FIXTURE_ROOT` (replikor, hållna grindars rötter, `result.json` ligger kvar
som evidens) — den som kör ansvarar för att ta bort scratch efter att `result.json` bokförts.
**v3.11 — de tre hållna grindarnas förväntade utfall vid en deklarerad refreeze.** Förväntningarna härleds ur
varje hållen grinds EGEN frysta bas och är exakta, aldrig "några fel tillåts". Utan deklaration gäller v3.10:s
förväntningar oförändrat.
- control-set frös `verify/bin/h-0NN-exit` mot `dae90c8f` ⇒ en refreeze gör exakt raden
  `frozen_artifacts_identical_to_dae90c8f` röd, med `detail` som slutar `problems=<de deklarerade sökvägarna>`;
  exit 1, 67 av 68, `RED_LOCAL_QUALIFICATION`, och de sju produktraderna fortfarande gröna.
- launch-cwd frös hela `verify/bin`-listningen mot `383ed387` ⇒ raden
  `frozen_verify_bin_identical_to_base_383ed387` får de deklarerade sökvägarna i `problems`, `extra` oförändrat.
- governance KÖR control-set-grinden ⇒ exakt EN rad tillkommer i dess röda mängd,
  `g7_platform_control_set_exit_68_of_68_on_candidate`, och den radens `detail` måste bära
  `pass=67 fail=1 fails=['frozen_artifacts_identical_to_dae90c8f']`.

- `f7_platform_control_set_exit_on_candidate_68_of_68_or_exactly_the_declared_refreeze_effect`
  (utan refreeze): exit 0, 68 PASS, `PASS_LOCAL_QUALIFICATION_ONLY`,
  `subject_head` == kandidaten, raderna `subject_preflight_exit0_exact_json`,
  `platform_prepare_and_check_accept_subject_documents`, `fixture_task_run_exit0`,
  `autopilot_selftest_none_returns`, `autopilot_substitution_accepts_platform_generation_without_web_docs`,
  `loop_end_to_end_attests_platform_fixture_task`, `invariant_required_exit_15_of_15` gröna.
- `f7_launch_cwd_exit_19_of_20_frozen_listing_sees_exactly_governance_this_gate_and_the_declared_refreeze`:
  exit 1, exakt raden `frozen_verify_bin_identical_to_base_383ed387` röd med detalj som slutar
  `problems=<deklarerade sökvägar> extra=['verify/bin/platform-governance-exit', 'verify/bin/platform-separation-final-exit']`.
- `f7_platform_governance_exit_red_exactly_on_its_frozen_rows_and_the_declared_refreeze_effect`: exit 1,
  70 rader, exakt {`g6_frozen_trees_and_files_identical_to_512490d4_plus_this_gate_only`,
  `g7_launch_cwd_exit_19_of_20_only_frozen_listing_sees_this_gate`} röda (registret ändras och en
  grind tillkommer; dess launch-cwd-förväntan ser en extra grind) — plus, och bara vid en deklarerad
  refreeze, `g7_platform_control_set_exit_68_of_68_on_candidate` med exakt refreezens effekt.
  Governance-grinden förblir fryst för sitt subjekt 9112a304; detta binder bara dess mätta utfall på en
  slutseparationskandidat.

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
  platform-prepare/-check är gröna på kandidaten (raderna i F7). **v3.11:** meningen är oförändrad; vid en
  deklarerad refreeze är den förväntade FAIL-mängden exakt `['frozen_artifacts_identical_to_dae90c8f']` och
  alla sju produktrader gröna — aldrig "några fel tillåts".

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
   och flödena stoppar där vid muterad plan; byggarna får inte skriva utanför fixturen (inte heller till `/private/tmp`,
   `/private/tmp/claude*`). (v3.4) Runner-prompten får inte skrivas om efter byggarroten (ingen `.replace/.format/.join`,
   bara `+` och blankstegstrimning), inga dynamiska uppslag (`globals()` m.fl.) utanför den mätta mängden, inga
   strängkonstanter med runnernamn utanför `selftest`; alla tio flöden måste löpa till slut mot den stubbade runnern med
   syntetiska READY-svar (stubbmängden `LIVE_STUB_NAMES`/`LIVE_REQUIRED_ATTRS` är sluten — omdöpning = produktrad);
   `run_codex`, `run_codex_resolving_architecture`, `_provider_snapshot`, `_python_snapshot`, `_strict_provider_authority`
   och `AUTOPILOT_ROLE_POLICY` är AST-identiska med 320c9df7, `controller/authority/**` och `controller/launch/**` blob-identiska
   (providermaskineriet och dess beroenden rörs inte); autopilotens modulnivå håller formregeln (inga attribut-/subscript-mål,
   inga block, ingen exec-ytsbindning); plan-/handoffkonstanterna tilldelas en gång som literaler; `remediation_prompt` (båda
   rollerna) och den inlinade L-remedieringen namnger plan + handoff (remedieringsgrenarna körs live); handoffen bär
   avsnitten Syfte, Låsta värden/pinnar, Startordning, Stoppregler, Avslutskriterier + planens sökväg + `PLAN_GENERATION`;
   skivtabellens radordning följer autopilotens ROADMAP-ordning.
6. **Dokument:** `AGENTS.md` (Historik → Git-referenser/webbrepot utan sökväg), `README.md` (r.8, 21, 28),
   `docs/loop/regler.md` (r.9–10; se även 6b — filen ligger i produktytan och rörs, den är INTE i p.8),
   `docs/loop/byggplan-v3.md` (r.9, 113, 166),
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
6b. **Ägarbeslutets bindningar (v3.10, ägarbeslut 2026-09-11).** Ägaren förbjuder en separat grindserie för
   dokumentationen; bindningarna är därför sex rader med exakta ankare, och inget därutöver.
   **(B1) Plangenerationens `## Avslutskriterier`** ska bära FYRA mätbara nivåer, var och en med sina ord i just
   det avsnittet: *(i) planseparation* — egen plan + handoff hos alla aktiva konsumenter, planens `arbetsdelar`
   stämmer med exekveringen, ett `genomfört flöde` visar att rätt plan når agenterna; *(ii) `Trust Kernel`* — en
   `giltig uppgift` kan slutföras och `fel identitet`, `otillåtna skrivningar`, `saknad obligatorisk verifierare`
   och `fel hash` `avvisas mekaniskt`, kvalificering kräver `frysta verifierare` körda färdigt mot exakt rätt
   kandidat, och `exitkod 0 ensam räcker inte`; *(iii) `bootstrap-milstolpe`* — en `verklig uppgift` genom
   `hela rollflödet` till `kvalificerad produkt` `utan webbstyrning` och `utan generellt mänskligt ingripande`
   (ordet *människohand* är förbjudet av `HARD_HUMAN_TOKENS` och får inte användas); *(iv) `operativ helhet`* —
   `installation`, `driftkvalificering`, `supervisor-resume`, `själv identifiera`, uttryckligen `senare` och
   `utanför dagens` fas.
   **(B2) `## Bootstrap`** ska namnge en `ÄNDLIG` `överlämningspunkt` till `kvalificerad autonom drift` och att
   `organisationens fortsatta utveckling` sker `därefter`.
   **(B3) `## Målbild`** ska bära att autonomin själv identifierar behov och möjligheter inom organisationens
   `mål och mandat`, prioriterar, genomför och utvärderar, och att `Webb/Digitala` är en `verksamhet som använder`
   den gemensamma plattformen.
   **(B4) H039:s funktionskrav** bevaras i avsnittet Skyddade invarianter/tekniska skydd: `h-039`,
   `avslutad städning`, `noll registrerade runtime-rester`, och att städningen inte får radera eller ersätta
   `främmande data` genom den identifierade `kapplöpningen`.
   **(B5) `docs/loop/regler.md` är källa för arbetsmetoden** och ligger i produktytan (den rörs; den är inte i p.8).
   Filen ska bära: rollflödet (`test-author` → `granskning` → `builder` → `lokal kvalificering`); att buildern
   `ändrar aldrig sin egen frysta grind` (regel 11 bär den redan); att varje ytterligare grindändring kopplas till
   ett `befintligt krav` OCH ett `konkret hinder`; granskarens godkännandenorm (`arbetsbudget` gör `aldrig ett
   kvarvarande fel` godkänt, `skenande kostnad` leder till ett `enklare upplägg`); och att `riggbegränsningar`
   bedöms mot uppgiftens `hotmodell`. Filen måste dessutom bära minst
   `RULES_MIN_NORMATIVE_SENTENCES` = 8 normativa meningar (annars är regelkällan inte mätbar).
   `AGENTS.md`, `CLAUDE.md` och ALLA SEX rollskills ska **hänvisa** till både `docs/loop/regler.md` och
   plangenerationen — och inte duplicera dem: samma normativa mening (≥ 40 tecken, med markör
   *aldrig/alltid/måste/ska/får inte/avvisas/obligatorisk/never/always/must/may not/shall/required*) i två aktiva
   dokument är RÖD. En mening som NAMNGER regelkällan eller planen är en pekare och undantas — pekare får upprepas.
   Mätt på 320c9df7: 52 normativa meningar över de nio dokumenten, noll kollisioner; `docs/loop/regler.md` bar 7,
   så tillägget behövs. **Ompinning:** `CLAUDE.md` och `docs/loop/regler.md` är generationsdokument — deras blob i
   autopilotens `SUBSTITUTION_BLOBS` och deras sha256 i `controller/verify/cli` `PLATFORM_DOCUMENTS` måste pinnas om
   när de ändras. `LOOP-ÄGARHAND-16–27` (r.16) och webbavgränsningarna i r.10–11/r.29 är MÄTT gröna som de står —
   `HUMAN_TOKENS` bär inte `ägarhand` (det gör bara `PLAN_TOKENS`, som bara gäller plangenerationen) och `kundflöde`
   likaså — så ingen omskrivning och inget extra ankare behövs för dem.
7. **Tester:** `tests/controller/loop/fall.py` B2 (webbfixtur/INV-004 → PINV-sabotage, t.ex.
   `push --force` i `controller/<x>/cli` → PINV-005).
8. **Inte rörs:** `verify/**` (utom att denna grind redan ligger där), frysta träd/filer i F6,
   `controller/loop/cli`, `specs/tasks.spec.json` (kräver ingen ändring; frysta rader behålls),
   `scripts/check-invariants.mjs`, `controller/verify/register.json`, `docs/loop/remaining-bootstrap-delegation-v1.md`,
   `docs/loop/owner-author-workflow-v1.md`, providermaskineriet (`run_codex`, `run_codex_resolving_architecture`,
   `_provider_snapshot`, `_python_snapshot`, `_strict_provider_authority`, rollpolicyn, `CODEX_FULL_ACCESS_MODE`),
   (v3.5) `controller/authority/cli`, `controller/authority/core.py`, `controller/launch/cli`,
   `controller/launch/runtime_snapshot.py` — blob-bundna mot 320c9df7; **KOSTNAD (v3.6, granskning nr 10):** varje legitim
   framtida ändring i dessa fyra filer gör denna grind röd — särskilt refreeze av h-035/h-036/h-037/h-038, som dokumentet
   självt pekar ut som ett separat H-steg och som rör `controller/launch/**`. Ompinning kräver en ny kontraktsversion
   (test-author-frys + oberoende granskning); det är en medveten rigiditet, inte en oavsiktlig bieffekt.
   **KOSTNAD (v3.7, granskning nr 11 N9):** den slutna binärmängden under live-flödena är `{git, /usr/bin/env,
   pinnad python3.12, /bin/sh}` och den slutna primitivmängden är `{subprocess.Popen}`. En legitim produkt som under ett
   flöde startar NÅGON ANNAN binär (en verktygsversion, en systemsond, en extern grind) eller använder en annan
   startprimitiv blir röd på `f4_live_flows_start_no_provider_process…` — mätt två gånger av granskare nr 11 på
   `/usr/bin/env` respektive den pinnade `python3.12` under v3.6:s `{git}`-mängd. Mängden utvidgas bara genom en ny
   kontraktsversion.
   **RÄTTELSE (v3.8, granskning nr 12 B2):** vidgningen i v3.7 tog samtidigt bort en verklig kontroll — en providerrad
   inuti ETT `sh -c`-element blev grön (mätt; med v3.6:s `{git}`-mängd är samma mutant röd). Mängden är därför delad i
   TOOLS (`git`, exakta argv-element) och WRAPPERS (`env`, `sh`, `python3.12`, delsträngstest över hela argv plus en
   längdgräns på `WRAPPER_ARGV_MAX` = 200 tecken per argv-element). Kostnaden för den slutna mängden kvarstår som ovan,
   och en legitim `sh -c '<lång skriptrad>'` under ett flöde är röd per design.
   **KOSTNAD (v3.8, granskning nr 12 N2):** exec-aliasspårningen var i v3.7 en GLOBAL textmatchning, vilket gjorde varje
   lokal variabel som råkade heta som ett mätt alias (`p`, `r`, `rc`, `sub`) förbjuden att subscript- eller
   attributtilldela — två mätta falskt röda (`p[x] = p.get(x, 0) + 1`; `r.returncode = int(r.returncode or 0)`).
   Spårningen är nu skopmedveten (per funktion/klass, med arv från omslutande skop) och ett ANROPSRESULTAT blir inte
   längre alias, så aliasmängden på baslinjen är TOM och båda fallen är gröna. Kvar som kostnad: den som avsiktligt
   binder `subprocess.Popen` eller en `os.*`-primitiv till ett namn och sedan skriver på det namnet blir röd — vilket är
   regelns syfte, inte en bieffekt.
   **RÄTTELSE (v3.9, granskning nr 13 N4):** v3.8:s skopmedvetna aliasspårning var **vakuös i praktiken** — fem av fem
   sondprov band ett exec-objekt utan att bli alias (`[P] = [subprocess.Popen]`, `[x for x in (subprocess.Popen,)][0]`,
   `P = [subprocess.Popen][0]` följt av `setattr(P, '_exec'+'ute_child', f)`), och det som bar lasten var de
   namnbaserade reglerna plus den dynamiska identitetskontrollen. v3.9 gör spårningen icke-vakuös: värdet genomsöks
   rekursivt och varje exec-atom som inte är funktionen i ett anrop inuti värdet gör målet till alias, destrukturering
   binder varje delmål, och `setattr` med ett BERÄKNAT attributnamn samt varje explicit `__setattr__`-anrop är rött.
   Mätt: baslinjens aliasmängd är fortfarande tom, de tre sondproven faller, och v12:s två falskt-röda fall
   (`p[x] = …`, `r.returncode = …`) är fortfarande gröna.
   **KOSTNAD (v3.9, granskning nr 13 B2/N3):** den slutna formmängden för omslagsbinärer gör varje legitim
   `sh -c …`/`env …`/`python -c …` under ett flöde röd utom de två mätta formerna, `stdin` till ett omslag är rött
   villkorslöst, och ett exec-objekt som defaultargument (`def f(cmd, _r=subprocess.run)`) är rött. Alla tre är
   medvetna rigiditeter; var och en stänger ett mätt hål.
   **KOSTNAD (v3.9, granskning nr 13 N7):** grinden städar inte sitt `FIXTURE_ROOT`. Granskare nr 13 mätte **31 rötter
   och 3,6 GiB** under en enda granskning; den som kör ansvarar för att ta bort dem.
   Samma sak gäller de slutna namnmängderna (`LIVE_STUB_NAMES`, `EXPECTED_PROMPT_BUILDERS`,
   `EXPECTED_PROMPT_CALLERS`, `EXPECTED_PLAN_GUARD_CALLERS`): legitim omdöpning är röd per design —
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
  ny kontraktsversion; den dynamiska live-mätningen kör flödena till slut med stubbad runner (syntetiska READY-svar) och stubbad
  worktree-/grind-/publiceringshantering — Git-/provider-/publiceringsbeteendet i stubbarna mäts inte här (control-set-
  grinden, loopsviten och publication-callers mäter det); byggaranropens argument inspekteras inte statiskt (skivan i
  `roadmap_test_author_prompt(sl, …)` kan dopas i drift — produktgranskningen läser); ett andra providersamtal utanför
  `run_codex` (`subprocess`, egen hjälpare) efter ett legitimt första anrop fångas inte av live-mätningen men gör
  `run_codex`-vägen död/oanvänd bara om anroparen ändras (slutna anropar-/producentmängder + AST-identitet + Popen-inspelningen
  under live-flödena fångar de kända formerna; ett andra providersamtal som startar en process fångas nu av Popen-inspelningen,
  medan ett samtal via ett redan öppet handtag eller ett nät-API inte gör det); benchens miljö och den stubbade runnerns svar
  (inklusive att första svaret är NEEDS_REMEDIATION) är synliga fingeravtryck (N1).
- (v3.9) Providergränsen är bunden till NIO mätpunkter, varav en ligger UTANFÖR produktens interpreter: de sex AST-identiteterna, de fyra blob-pinnade beroendefilerna,
  autopilotens modul- OCH klasskroppsform (satser **och värden** — en klasskropp får inte binda ett exec-objekt),
  exec-ytsregeln över HELA filen med **transitiv aliasspårning** (varje namn, klassattribut eller instansattribut som
  någonstans i filen binds från `subprocess.<exec>`/`os.<exec>`, från ett redan spårat alias, från ett attribut på ett
  sådant eller från ett anrop av ett sådant, är ett alias — och varje tilldelning PÅ ett alias är röd) plus ett absolut
  förbud mot tilldelning till interna/dunder-attribut (`_execute_child`, `__init__`, `__call__`, `__new__`, …) på vad
  som helst, den pinnade authority-bibliotekssökvägen (AST + importerad fil), processtart-inspelningen med
  identitetskontroll före OCH efter flödena över `subprocess.Popen` + `os.posix_spawn/execv*/spawnv*/system`, och
  **inspelningen ETT LAGER NER**: `Popen._execute_child`/`Popen.__init__` fångade ur stdlib före modulladdning, mätta
  före och efter flödena, med jämförelse av den argv som faktiskt når barnet mot den argv Popen-inspelaren såg — och
  **(v3.8) INSTALLATIONEN FÖRE `exec_module`**, som är det som binder importtidsfångster som inte är satser
  (funktionsdefault, dekoratorargument, metoddefault) och som är den enda bindningen för de åtta `os.*`-primitiverna.
  Den statiska formregeln täcker samma två former (`FunctionDef.args.defaults`/`kw_defaults` och `decorator_list`).
  **(v3.10, granskning nr 14 B1)** Drivrutinens privata namnrymd var fortfarande nåbar — inte via `import __main__`,
  som v3.9 förbjöd, utan som `f_globals` på frame-stacken (`sys._getframe()`/`f_back`) och som ett vanligt objekt i
  heapen (`gc.get_objects()`). Båda vägarna är nu förbjudna i `GATE_NAMESPACE_TOKENS` tillsammans med `sys.settrace`,
  `sys.setprofile` och `gc.get_referrers/referents`; mätt på 320c9df7 nämner autopiloten ingen av dem.
  **(v3.10, granskning nr 14 B2)** Identiteten löstes i FEL process: `Popen` löser ett bart `argv[0]` genom
  `env=`-argumentets `PATH`, medan grinden löste samma namn genom drivrutinens `os.environ`. En `env={'PATH': <egen
  katalog>}` gjorde att grinden sha256-prövade sin egen stubb medan produktens binär kördes — mätt 114/5 grön med den
  gamla planen på barnets stdin. Identiteten löses nu med **den PATH anropet faktiskt använder**, en start som bär en
  egen `PATH` i `env=` är röd, stdin mäts i **alla** kanaler (`input`, pipe, vanlig fil, ärvd fd via `/dev/fd`,
  `pass_fds`), miljön mäts även när barnet ärver, och `git` som **startare** (`-c alias.*`, `core.pager`,
  `diff.external`, `credential.helper`, `--exec-path`, `--upload-pack`, samt `GIT_EXTERNAL_DIFF`/`GIT_PAGER`/`GIT_SSH*`
  /`GIT_CONFIG*` i miljön) är röd.
  **(v3.9) Den NIONDE och bärande mätpunkten ligger utanför produktens interpreter:** live-körningens `PATH` är grindens
  egna stubbar, som loggar den riktiga binären, hela argv och hela stdin till filer som grinden läser utifrån. Granskning
  nr 13 visade varför de åtta in-process-mätpunkterna inte räcker: drivrutinen körde som `__main__` i samma interpreter
  som produkten och lämnade stdlib-originalen i sin egen namnrymd, så ett `import __main__` gav en produkt fri
  processtart med **varje räknare identisk med referensens**. In-process-halvan är nu hårdare (privat namnrymd,
  inspelare på `Popen.__init__`, identitet prövad vid varje anrop, realpath + sha256 på varje exekverad fil, sluten
  formmängd för omslag, stdin-innehåll fångat), men beviset bärs av **de två halvorna tillsammans**.
  **RÄTTELSE (v3.10, granskning nr 14 B3):** påståendet att utifrån-mätningen "per konstruktion inte kan påverkas av
  något produkten gör i sin egen process" var **falskt**. Stubbloggens sökväg står i klartext i stubbskripten som ligger
  på produktens egen `PATH`, katalogen ägs av samma uid, och loggen var dessutom undantagen från sidoeffektsvepet —
  granskaren raderade 7 poster (333 → 328) utan att en enda rad reagerade. Och eftersom ingen rad jämförde halvorna
  kunde en produkt i stället tysta in-process-inspelarna helt (mätt: `popen = child = init = 5` mot `stub_calls = 333`,
  grinden grön). Det som gäller från v3.10 är i stället: (a) varje stubbpost bär ett **löpnummer från en låst räknare**
  och en **HMAC** över (nummer ‖ innehåll) med en nonce som genereras per grindkörning, så raderade, ändrade och
  tillagda poster syns som bruten kedja eller lucka i numreringen; (b) stubbloggen **ingår i sidoeffektsvepet** — bara de
  poster stubbarna själva skriver är redovisade, allt annat i katalogen är en sidoeffekt; (c) en **egen rad**,
  `f4_live_flows_out_of_process_stub_log_and_in_process_recorders_agree_with_an_unbroken_chain`, kräver att
  `stub_calls = popen_total = init_total = child_total`, att closure-räknarna (heltal som ingen listutbytning når)
  stämmer med listorna, att inspelningsbehållarnas typ och identitet är oförändrade, och att varje räknare klarar det
  mätta golvet `LIVE_MIN_PROCESS_STARTS`. En produkt måste alltså förfalska **båda** halvorna konsistent, inte
  vardera för sig. Nonce:n är läsbar för en produkt som läser stubben på sin egen PATH; vad kedjan köper är att
  utifrån-talet inte kan sänkas TYST.
  Utanför dem gäller deklarerad gräns: annan kod under `controller/**` som autopiloten inte importerar vid start,
  miljövariabler som launchern själv läser, provideranrop som inte startar en process (öppet handtag, nät-API) och
  start via en primitiv utanför den instrumenterade mängden och utanför `subprocess` (mätt av granskare nr 11:
  `ctypes`→libc `posix_spawn` och `multiprocessing` med `fork`-start, båda utan ny process-image för providern).
  Stubbnamnen och de slutna namn-/binärmängderna gör legitim omstrukturering röd per design (p.8).
- (v3.8) **Tre kvarvarande icke-blockerande fynd behålls som deklarerade gränser, med mätt motivering.**
  (a) *Remedieringsbeviset* (granskning nr 11 N5, nr 12 N3): `LIVE_FINDING_ID`-kravet är ett närvarokrav på id-strängen;
  `builder_prompt(...) + "Reviewer finding ids: FIXTURE-1."` uppfyller det. Gränsen är immateriell för ordern — den kan
  inte låta den gamla planen nå en levande prompt, bara göra remedieringsbeviset svagare än det låter.
  (b) *Rollpolicy muterad under flödena* (nr 11 N6, nr 12 N4): `AUTOPILOT_ROLE_POLICY.update({...})` från en
  funktionskropp syns inte i `constants`-scenariot, som mäter vid import. Mätt motivering: konstanten är avbildningen
  `roll → (modell, reasoning_effort)` och dess enda konsument är `run_codex`:s modellroutning; den styr varken
  `allowed_write` eller promptinnehåll och kan därför inte låta den gamla planen eller ett webbstyrande dokument nå en
  prompt. Immateriell.
  (c) *Handoffens generationsvärde* (nr 11 N7, nr 12 N5): handoffraden delsträngstestar `PLAN_GENERATION` och värdet, så
  en handoff som skriver `PLAN_GENERATION=platform-v1-legacy` överlever om planens sökväg innehåller `platform-v2`.
  Mätt motivering: den gamla planens blobar och sökvägar är mekaniskt förbjudna vid HEAD (F1/F2) och handoffen skannas
  som aktivt dokument, så det som kan införas är en MOTSTRIDIG ETIKETT, inte en styrande gammal plan. Immateriell för
  ordern, men den av de tre som ligger närmast en dokumentbindning i order (2).
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
- **(v3.11) Kvalificeringskvittot bevisar inte att körningen ägde rum.** Grinden kör INTE den omfrysta
  H-grinden själv. Det är ett medvetet val: varje H-grind har sin egen rigg (h-035 kräver ~450 s, den
  kanoniska invokationen `-I -S -B` + `PYTHONEXECUTABLE`, sju bevarade kandidater i ODB:n, en kanonisk lokal
  bare-origin och en vitlistad lokal git-config, och den läser processtabellen — en nästlad körning inne i
  separationsgrinden skulle dessutom störas av grindens egna samtidiga hållna körningar). Att baka in varje
  H-grinds rigg i det generella separationskontraktet är både dyrt och sprött. Kvittot binder i stället
  proveniens och intern konsistens: grindens bytes, kandidatens commit, den kanoniska invokationen,
  räknade PASS/FAIL-rader mot deklarationens FÖRUTSAGDA antal, och stdout mot sin egen sha256. Vad det
  bevisar: att den som kvalificerar har kört exakt dessa grindbytes mot exakt denna kandidat och redovisat
  utfallet, och att BYGGAREN inte kan få en refreeze accepterad — kvittot kommer inte ur trädet utan ges vid
  kvalificeringen. Vad det INTE bevisar: att kvalificeraren inte fabricerat kvittot. Under hotmodellen
  (motparten är en builder under en fryst grind, inte kvalificeraren själv) är det en deklarerad gräns.
- **(v3.12) Refreezens innehåll bedöms till FORM, inte till mening.** v3.11:s gräns ("innehållet bedöms inte") höll
  inte: granskningen visade att en femradig leksaksgrind med 25 gröna rader passerade med ett ärligt kvitto. v3.12
  binder därför innehållet mekaniskt: varje radetikett som basgrindens frysta bytes deklarerar måste finnas kvar i
  den omfrysta grinden, utom högst tre namngivna och motiverade pensioneringar, och `expected_pass` måste nå
  per-grind-golvet. Vad detta ALLTJÄMT inte bevisar: att en behållen kontroll fortfarande PRÖVAR samma sak — en
  omfrysning som behåller etiketten men tömmer kroppen fångas inte av detta kontrakt. Den bedömningen hör till
  H-grindens eget kontraktsflöde och dess oberoende granskning.
- **(v3.12) Kvittots miljö är obunden.** Kvittot bär `invocation` som argv-lista; grinden kräver den pinnade
  Python-binären, `-I -S -B` och rätt basnamn, men inte miljövariabler. En kvalificeringskörning med tillåtna
  providersamtal ger ett identiskt kvitto (granskning nr 15 N6).
- **(v3.12) Ett kvitto hopsatt ur en ANNAN kandidats körning med enbart `subject_head` lappad krediteras.**
  `stdout_sha256` förblir giltig eftersom stdout är orörd. Det kräver att kvalificeraren ljuger och ligger utanför
  hotmodellen (granskning nr 15 A3), men det är en gräns, inte en egenskap.
- **(v3.12) Blandade kvittonyckeltyper ger `TypeError`.** Tre kvitton varav ett utan `gate` ger en `TypeError` i
  sorteringen. Grinden faller stängt (abortvägen: 116/2 av 131, rc 1, varje icke-körd rad räknad som FAIL), men
  felmeddelandet namnger inte orsaken (granskning nr 15 N5).
- **(v3.12) `REFREEZE_GATE_RE` är bredare än den ordnade uppgiftsmängden.** `^verify/bin/h-0\d\d-exit$` släpper in
  varje H-grind som finns vid basen, inte bara h-031…h-039 (granskning nr 15 N4). Innehållsgolvet gäller dem alla,
  så en urholkning fångas ändå.
- **(v3.12) `PLAN_TOKENS` ingår inte i skanningen av refreezens tillagda rader** (`CODEX_START_HERE`,
  `Verkstadsgolvet`, `ägarhand`, `gh pr merge`, `human-only`). De mönstren är skrivna för plangenerationsdokumentet.
  v3.10 skannade ingenting alls i `verify/**`, så detta är ingen försvagning (granskning nr 15 N10).
- **(v3.11) Sidoeffekter utanför grindens egna rötter.** Svepet jämför inte längre delade systemkataloger
  (`/private/tmp`, `/private/tmp/claude`, `/private/tmp/claude-501`, `$TMPDIR` och dess förälder). En produkt
  som under flödena skriver direkt till en HÅRDKODAD absolut sökväg utanför subjektet och `FIXTURE_ROOT`
  (t.ex. `open('/private/tmp/x','w')`) fångas därför inte av sidoeffektsraderna. Angränsande rader som
  fortfarande binder hårdkodade sökvägar: `f8_no_tracked_file_couples_to_web_repo_path_or_old_root`,
  AST-strängskanningen av autopiloten, och live-radernas binär-/identitetsmängd (en sidoeffekt via en
  startad process fångas av dem). Skälet till gränsen: delade kataloger gav mätt falskt rött två gånger.
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

### Oberoende kontraktsgranskning nr 8 (på 6c984b82) → v3.4
`GATE_REVIEW_RESULT=NOT_READY`: B1 (effektbindningen slutade vid stubbgränsen och första runner-anropet; `classify` släppte
omskrivning efter roten och runner via `globals()`), B2 (`run_codex` obunden — prompt ur fil) + N1–N12. Remediering v3.4
(grind sha256 `0096bd03d1798dd6cd02ef57748a5283b06a1088a748a1b035ad8a3df39d14e3`, 2347 rader, 111 rader i körning; commit `81f39036`):

| Fynd | Åtgärd i grinden (rad i v3.4) |
|---|---|
| B1 statiskt | `PROMPT_TEXT_METHODS` = trimningar utan argument (r.237); `BinOp` bara `Add`, två rötter förbjudna (r.832); metodanrop med argument RÖTT (r.851); dynamiska uppslag utanför `DYNAMIC_LOOKUP_FUNCTIONS` och runnernamn i strängkonstanter utanför `selftest` (r.793–799, modulsvep r.765); kanari med rewrite/mult/lookup/trim (r.1331) |
| B1 dynamiskt | DRIVER `live_flows` med syntetisk READY-`AgentRun`, tillståndsstyrda `run_gate`/`run_empirical_gate`, `LIVE_STUB_NAMES`/`LIVE_REQUIRED_ATTRS` (r.265–270, DRIVER r.442–500); tio flöden, `LIVE_MIN_CAPTURES`, `LIVE_PLAN_ROLES` (r.273–286); raden `f4_live_flows_run_to_completion_…` (r.1986) |
| B2 mätpunkten | `RUNNER_MACHINERY_AST_SHA256` (r.247–254), `ast_identities` (r.878) → `f4_runner_machinery_ast_identical_to_320c9df7_…` (r.2012) |
| N sidoeffekt-prefix | `snapshot_names` med (storlek, mtime) för filer, `SIDE_EFFECT_DIRS` inkl. `/private/tmp/claude-501` och tempkatalogens förälder, undantag exakt `scratch.name` (r.1061, 1917) |
| N handoff-substans | `HANDOFF_REQUIRED_SECTIONS` (r.256) → `f4_handoff_has_required_sections_…` (r.2131) |
| N ROADMAP-ordning | radordning == autopilotens, `ROADMAP[0]==S2`, topologisk konsistens (r.2087–2098) |
| N1/N5/N6/N8–N12 | dokumenterade som gränser (andra providersamtal efter första anropet, byggarargument, fingeravtryck, döda grenar i läskommandon, rigiditet, FIXTURE_ROOT) |

### Test-author 2026-09-11 — baslinje RED för v3.4 (före produkt)
Subjekt: replika av `320c9df7` + grind v3.4 + dokument (fixtur-HEAD `9431a733`). Fullkörning (bypass, egen `TMPDIR`, hållna
grindar ur subjektets byte-identiska kopior): exit **1**, `RED_LOCAL_QUALIFICATION`, **73 PASS / 38 FAIL**
(111 rader), result.json sha256 `c1cbeff0889538b4fdef646f6db51ad87b1ff95f03e6e8ed502a824c2714c7b5`. Röda: v3.3:s 37 plus (v3.4) handoff-avsnittsraden (ingen ny handoff); de
två live-raderna kvarstår röda av rätt skäl (BUILDER-/TEST_AUTHOR-prompterna i alla tio flöden bär den gamla plancommiten och
saknar plan/handoff; utan ny plan stoppar de vaktbärande flödena inte); gröna nya: `f4_runner_machinery_ast_…` (320c9df7 är
baslinjen) och slutna-världen-raden. F7 oförändrat: control-set 68/68 (`b61a5318…`), launch-cwd 19/20 med exakt två extra
grindar (`0007a474…`), governance 68/70 exakt {g6, g7} (`d97442dd…`); loopsvit 53 ok / 0 FEL.

### Referenskonstruktion v3.4 (scratch, förkastad)
Som v3.3 plus handoffavsnitten Syfte/Låsta värden (pinnar)/Stoppregler/Startordning/Avslutskriterier (ingen autopilotändring).
Fixtur-HEAD `c74f9d14`, 143 filer. Fullkörning (bypass, egen `TMPDIR`): exit **0**, `PASS_LOCAL_QUALIFICATION_ONLY`,
**111/111**, result.json sha256 `0fb237d9d07b2161eb011eb62d2e4f5a2ef717f1cf8f574d03fd708c13f7e19f`; control-set 68/68 (`29b3d358…`), launch-cwd 19/20 (`e709d43a…`),
governance 68/70 exakt {g6, g7} (`072a16b8…`), loopsvit 53 ok / 0 FEL; live-flöden: 10 flöden till slut, 49 fångade
prompter (full_roadmap 33), muterad replika 4 stopp; runner-maskineriets AST identisk med 320c9df7.

### F9 v3.4 — negativer (var och en i egen replika av v3.4-referensen, statiskt `--skip-held-gates`; 55 körda,
55 fångade, 0 riggfel)
De 48 från v3–v3.3 fångas på samma rader (v3.3:s B1-varianter dessutom på den nya live-raden). Granskarens nr 8: (a_replace_rewrite_builder) `.replace` efter byggarroten i `builder_flow` → slutna-världen-raden (metodanrop med argument) + live-raden (levande BUILDER-prompt pekar på gamla planen); (a_replace_self_builder) `x.replace(x, extra)` → slutna-världen + live; (a_mult_zero_builder) `* 0 + extra` → slutna-världen (operator Mult) + live; (a_globals_runner_builder) runner via `globals()["run_codex_"+…]` → slutna-världen (dynamiskt uppslag + runnernamn i sträng) + live; (a_prompt_file_runner) runnern läser prompten ur `wt/.architect-prompt` → `f4_runner_machinery_ast_identical_to_320c9df7_…`; (a_side_prefix_exempt) skrivning till `/private/tmp/claude-501/platform-separation-final-…` → sidoeffektraden (exakt FIXTURE_ROOT-namn undantaget; `/private/tmp/claude-501` ingår); (a_side_abs) omkörd efter att den kvarlämnade v3.3-markören tagits bort → sidoeffektraden (överskriven fil mäts via mtime); (a_roadmap_reorder) S4 före S2 i ROADMAP + selftestordning → skivtabellraden (ordning ≠ autopilot, ROADMAP[0] ≠ S2); (a_handoff_empty) handoff = en rubrik → handoff-avsnittsraden. Alla 55 (inkl. grindmutanten h på kanarien): exit 1, 0 riggfel, 0 missade. Not: de 53 första negativerna kördes mot grinden före den sista sidoeffektsvepsjusteringen (påverkar bara sidoeffektraden), a_side_abs/a_side_prefix_exempt mot den slutliga.

### Oberoende kontraktsgranskning nr 9 (på d8d405f5) → v3.5
`GATE_REVIEW_RESULT=NOT_READY` med EN blockerare: B1 — providergränsen efter `run_codex` var öppen på tre seams
(`subprocess.Popen` skuggad på autopilotens modulnivå; samma skuggning i `controller/authority/core.py` som importeras vid start;
`controller/launch/cli` som skriver om provider-argv — den sista fångades inte heller av den hållna launch-cwd-grinden, mätt).
Remediering v3.5 (grind sha256 `56a37d665b37920473e4246f16921f03c85bca7343e31ea835580e990456a631`, 2542 rader, 116 rader i körning; commit `749bc3b6`):

| Fynd | Åtgärd i grinden (rad i v3.5) |
|---|---|
| B1 modulnivå | `module_level_form` (r.889–923) + `EXEC_SURFACE_ATTRS`/`MODULE_LEVEL_EXCEPTIONS` (r.256–266); dynamisk Popen-identitet i DRIVER (r.305–307) → `f4_autopilot_module_level_is_the_declared_form_…` (r.1960) |
| B1 beroenden | `RUNNER_DEPENDENCY_BLOBS` (r.268–275) → `f4_runner_dependencies_authority_and_launch_byte_identical_to_320c9df7` (r.1967) |
| B1 argv-plats | `f4_provider_argv_built_and_started_in_exactly_one_place_inside_run_codex` (r.1985) |
| B1 dynamisk | Popen-inspelning i `live_flows` (r.478–486) → `f4_live_flows_start_no_provider_process_outside_the_stubbed_runner_and_leave_no_side_effects` (r.2166) |
| N1 remedieringsgrenar | tillståndsstyrd stub: första svaret per (flöde, roll) NEEDS_REMEDIATION för REVIEWER/GATE_REVIEWER (+ EMPIRICAL i det fristående flödet) (r.494–503); minima 1/4/4/4/4/4/4/4/7/37 (r.300); ARCHITECT/BUILDER krävda i det empiriska flödet (r.303) |
| N2 miljöstyrd sökväg | `literal_constant_assignments` (r.926–946) → `f4_plan_constants_are_single_literal_assignments_…` (r.2040) |
| N3 ROADMAP-konkatenering | `substitution_codes`/`roadmap_codes` i DRIVER (r.421–423), krav i samma rad |
| N4 osvept live | sidoeffektsvep runt `live_flows` (r.2100–2108) |
| N5–N10 | dokumenterade som gränser (TASK=-kopplingen, delat svepfönster, fingeravtryck, andra providersamtal utan processtart) |

Produktytan växte med v3.5: `remediation_prompt` (BUILDER och TEST_AUTHOR) och den inlinade L-remedieringen måste namnge plan +
handoff, eftersom remedieringsgrenarna nu körs live.

### Test-author 2026-09-11 — baslinje RED för v3.5 (före produkt)
Subjekt: replika av `320c9df7` + grind v3.5 + dokument (fixtur-HEAD `ea0a7887`). Fullkörning (bypass, egen `TMPDIR`, hållna
grindar ur subjektets byte-identiska kopior): exit **1**, `RED_LOCAL_QUALIFICATION`, **77 PASS / 39 FAIL**
(116 rader), result.json sha256 `6de924fcd44b2f36c50afec4f6a4f4b381e2fc3f2b2cc125696309c57f1e28fa`. Röda: v3.4:s 38 plus `f4_plan_constants_…` (ingen `PLAN_GENERATION` vid
320c9df7) — alla av rätt skäl; nya gröna på 320c9df7: modulnivåformen, beroendeblobbarna, argv-platsen och
live-providerstarterna (320c9df7 är baslinjen för alla fyra). F7 oförändrat: control-set 68/68 (`f49a93e3…`), launch-cwd 19/20
med exakt två extra grindar (`7b145fba…`), governance 68/70 exakt {g6, g7} (`ed43e250…`); loopsvit 53 ok / 0 FEL.

### Referenskonstruktion v3.5 (scratch, förkastad)
Som v3.4 plus plan + handoff i `remediation_prompt` (båda rollerna), i `builder_prompt` och i den inlinade L-remedieringen
(remedieringsgrenarna körs nu live). Fixtur-HEAD `6d081062`, 143 filer. Fullkörning (bypass, egen `TMPDIR`): exit **0**,
`PASS_LOCAL_QUALIFICATION_ONLY`, **116/116**, result.json sha256 `9add2f4b26d55b1ccb560ec266ebb5af67a076e7a20f0a107a478d5677c464fe`; control-set 68/68 (`62c71572…`), launch-cwd 19/20
(`9b78ec46…`), governance 68/70 exakt {g6, g7} (`4135d6ff…`), loopsvit 53 ok / 0 FEL; live-flöden 10 till slut med
1/4/4/4/4/4/4/4/7/37 fångade prompter (73 totalt), 0 providerstarter av 59 inspelade Popen-anrop, 0 sidoeffekter;
runner-maskineriets AST och de fyra beroendeblobbarna identiska med 320c9df7.

### F9 v3.5 — negativer (var och en i egen replika av v3.5-referensen, statiskt `--skip-held-gates`; 63 körda,
63 fångade, 0 riggfel)
De 55 från v3–v3.4 fångas på samma rader (B1-varianterna från v8 dessutom på live-raden). Granskarens nr 9: (a9_popen_shadow) `subprocess.Popen` skuggad på autopilotens modulnivå → modulnivåformen (attributmål + exec-ytsbindning), argv-platsraden och live-providerraden (Popen-identiteten); (a9_core_import_shadow) samma skuggning i `controller/authority/core.py` → modulnivåraden (dynamisk Popen-identitet efter import), beroendeblobraden och live-providerraden; (a9_launcher_rewrite) `controller/launch/cli` skriver om provider-argv → beroendeblobraden (F7:s launch-cwd ger fortfarande identisk 19/20, därför blobbindningen); (a9_env_plan_path2) andra, miljöstyrd tilldelning av plan-/handoffsökväg → plankonstantraden; (a9_sub_into_roadmap) `SUBSTITUTION_ROADMAP=()` med skivorna först i `ROADMAP` → plankonstantraden + selftestraden; (a9_policy_item_assign) `AUTOPILOT_ROLE_POLICY["BUILDER"]=…` efter literalen → modulnivåformen (subscriptmål); (a9_remediation_no_plan) remedierings-BUILDER-prompten slutar namnge planen → live-raden (remedieringsgrenen körs nu); (a9_flow_side_effect) hjälpare i `roadmap_contract_flow` skriver `/private/tmp/claude/v35-flow-marker` → live-sidoeffektraden. Alla 63 (inkl. grindmutanten h på kanarien): exit 1, 0 riggfel, 0 missade.

### Oberoende kontraktsgranskning nr 10 (på 61426e1c) → v3.6
`GATE_REVIEW_RESULT=NOT_READY` med en blockerare: B1 — providergränsen var bunden vid MODULNIVÅ och vid IMPORTÖGONBLICKET,
inte i funktions- och klasskroppar (`a10_func_popen_shadow`: tre rader i `journal()` som byter ut `subprocess.Popen` var
111/116 grön medan providern i drift fick neutral text och grindens egen inspelare avinstallerades; `a10_class_body_exec`:
klasskropp som ändrar `AUTOPILOT_ROLE_POLICY` vid import). Remediering v3.6 (grind sha256 `8a26e60f417784254122d656cf20ce46c73934a1051938178368ba387665a223`, 2758 rader,
117 rader i körning; commit `7e0eb95a`):

| Fynd | Åtgärd i grinden (rad i v3.6) |
|---|---|
| B1 hela filen | `exec_surface_assignments` (r.989–1050): attributmål i exec-ytan/exec-modul, `sys.modules`/`globals()`-skrivning, subscript på modulnivånamn, `setattr` — var som helst i filen; vitlista `sys.dont_write_bytecode` (r.265) |
| B1 klasskroppar | `check_class` i `module_level_form` (r.1053–1063) |
| B1 identitet efter flödena | `popen_identity_after` i DRIVERn (r.602–606) + kravet i live-providerraden (r.2384) |
| B1 flera primitiver/markörer | `EXEC_PRIMITIVES` (r.280–281), `PROVIDER_SHAPE_ELEMENTS`/`_BINARY_TOKENS` (r.275–276), `ALLOWED_LIVE_BINARIES`/`ALLOWED_LIVE_PRIMITIVES` fail-closed mot mätningen (r.277–278) |
| B1(b)/N8 sju konstanter | `RUNTIME_CONSTANT_KEYS` + `literal_dict_with_path_keys` (r.303–306, 1129) |
| N1 andra startprimitiver | `os.posix_spawn/execv*/spawnv*/system` instrumenterade och identitetsmätta (r.280–281) |
| N3 AUTHORITY_LIB | AST-identitet + `core_module_file` under `controller/authority/` (r.269–270) |
| N4 remedieringens identitet | `LIVE_REMEDIATION_FLOWS`/`LIVE_FINDING_ID` (r.336–339) |
| N5 vakt mot kopia | `f4_ensure_roadmap_plan_stops_when_the_plan_and_every_tracked_copy_are_mutated_together` (r.2150–2166) |
| N6 falskt rött | modulnivåns värderegel begränsad till exec-modulattribut (verifierat: `X = Y.copy()` grön) |
| N7 härledd sökväg | modulnivåkonstant får inte sätta ihop en `docs/…`-sökväg av fragment (r.1083–1087) |
| p.8-kostnad | de fyra blobpinnarnas falskt-rött-kostnad (h-035–h-038-refreeze) inskriven i "Inte rörs" |

### Test-author 2026-09-11 — baslinje RED för v3.6 (före produkt)
Subjekt: replika av `320c9df7` + grind v3.6 + dokument (fixtur-HEAD `3d554938`). Fullkörning (bypass, egen `TMPDIR`, hållna
grindar ur subjektets byte-identiska kopior): exit **1**, `RED_LOCAL_QUALIFICATION`, **76 PASS / 41 FAIL**
(117 rader), result.json sha256 `a3fcb2cebe1fdfb366aff9a85a964bbe0d253ea36824455705f09bfe225079bb`.
**RÄTTELSE (v3.7, granskning nr 11 N1):** siffran 76/41 är inte reproducerbar. Granskare nr 11 mätte v3.6-grinden
statiskt på en ren `320c9df7`-replika till **72/45** och v3.5-grinden på samma replika till 72/44 med exakt en tillagd
röd rad; eftersom `--skip-held-gates` påverkar precis fem rader borde fullkörningen ha gett **77 PASS / 40 FAIL**, vilket
också är vad prosan nedan räknar upp ("v3.5:s 39 plus …"). Felet låg i RED-fixturen, inte i grinden: den byggdes genom att
stapla `LOCAL fixture: gate v3.x`-commits på varandra i stället för att klonas om från `320c9df7`. Från v3.7 byggs
RED-repliken om från grunden vid varje mätning (klon → `checkout --detach 320c9df7` → grind + dokument → en commit) och
radlistan redovisas, inte bara summan. Röda: v3.5:s 39 plus `f4_ensure_roadmap_plan_stops_when_the_plan_and_every_tracked_copy…`
(inget positivt ankare utan plangeneration) — alla av rätt skäl; de övriga nya raderna är gröna på 320c9df7 (baslinjen är
deras definition). F7 oförändrat: control-set 68/68 (`54f190c7…`), launch-cwd 19/20 med exakt två extra grindar (`947f8ebe…`),
governance 68/70 exakt {g6, g7} (`b57072ac…`); loopsvit 53 ok / 0 FEL.

### Referenskonstruktion v3.6 (scratch, förkastad)
Oförändrad produkt jämfört med v3.5 (ingen produktändring krävdes — granskningen mätte satisfierbarheten i förväg).
Fixtur-HEAD `291e1941`, 143 filer. Fullkörning (bypass, egen `TMPDIR`): exit **0**, `PASS_LOCAL_QUALIFICATION_ONLY`,
**117/117**, result.json sha256 `575ee34c119ac1abf19ef4ecd90a6dbc4402b00ba2045aaafa1bdb4ad5aa64ee`; control-set 68/68 (`5faf485e…`), launch-cwd 19/20 (`e277b1fb…`),
governance 68/70 exakt {g6, g7} (`4dca90b7…`), loopsvit 53 ok / 0 FEL; live-flöden 10 till slut med fångstprofilen
1/4/4/4/4/4/4/4/7/37, startprimitiver subprocess.Popen, binärer git, identitet efter flödena True, 0 providerstarter,
0 sidoeffekter; `core`-modulen importerad ur `controller/authority/core.py`.

### F9 v3.6 — negativer (var och en i egen replika av v3.6-referensen, statiskt `--skip-held-gates`; 69 körda,
69 fångade, 0 riggfel) + ett falskt-rött-prov som förblir grönt
De 63 från v3–v3.5 fångas på samma rader (v9:s `a9_popen_shadow`/`a9_policy_item_assign` faller nu dessutom på den
utvidgade exec-ytsregeln). Granskarens nr 10: (a10_func_popen_shadow) `subprocess.Popen` bytt ut från `journal()`-kroppen → exec-ytsregeln över hela filen + live-providerraden (inspelaren avinstallerad, identitet efter flödena falsk); (a10_class_body_exec) klasskropp som sätter `AUTOPILOT_ROLE_POLICY['BUILDER']` vid import → klasskroppsformen/exec-ytsregeln + plankonstantraden (körtidsvärde ≠ literal); (a10_os_posix_spawn) providerstart via `os.posix_spawn` → live-providerraden (okänd primitiv och okänd binär); (a10_authority_lib_benign) `AUTHORITY_LIB` ompekad till en opinnad `core.py` → modulnivåraden (AST-identitet + importerad core-fil); (a10_guard_copy_in_docs) vakten jämför mot spårad kopia → den nya kopieringsmutationsraden; (a10_indirect_plan_constant) `PLAN_DOC = "docs/loop/" + "…"` → modulnivåraden (hopsatt dokumentsökväg). Falskt-rött-provet (a10_legit_module_copy, `ROLE_POLICY_VIEW = AUTOPILOT_ROLE_POLICY.copy()`) förblir GRÖNT (112/5 = enbart sandboxraderna). Alla 69 (inkl. grindmutanten h på kanarien): exit 1, 0 riggfel, 0 missade.

### Oberoende kontraktsgranskning nr 11 (på 50956fa7) → v3.7
`GATE_REVIEW_RESULT=NOT_READY` med TVÅ blockerare. **B1:** providergränsen var bunden VID `subprocess.Popen` och de nio
primitiverna, inte UNDER dem — `class _Boot: POPEN = subprocess.Popen` (tillåten `Assign` till `Name` i en klasskropp)
fångade den riktiga Popen-KLASSEN vid import och tre rader i `journal()` bytte ut `_Boot.POPEN._execute_child`;
attributnamnet låg utanför `EXEC_SURFACE_ATTRS` och basen var ett `Attribute`, så mutanten var **112/5 — identisk med
referensen**, med `popen_identity`/`popen_identity_after` båda `True` och `popen_total` oförändrat, medan barnprocessen
faktiskt tog emot "Do the task the orchestrator names. Report per the schema.". **B2 (regression jag införde i v3.6):**
token-svepet över levande prompter hamnade genom en indenteringsmiss inne i FIXTURE-1-grenen och utanför loopen över
`caps` — det kördes aldrig på en grön produkt, och när det kördes bara på den `p` som råkade vara kvar från förra
iterationen; `architect_resolution` och `empirical_unattended_flow` sveptes aldrig. Remediering v3.7:

| Fynd | Åtgärd i grinden (v3.7) |
|---|---|
| B1(a) exec-alias på djupet | `exec_surface_assignments`: transitiv aliasmängd (namn/klassattribut/instansattribut bundna från `subprocess.<exec>`/`os.<exec>`, från ett spårat alias, från ett attribut på ett sådant, eller från ett anrop av ett sådant) + rött för varje tilldelning vars mål är ett attribut PÅ ett alias eller vars kedja passerar ett exec-modul-/exec-ytsnamn |
| B1(b) interna attribut | `FORBIDDEN_ATTR_TARGETS` = `_execute_child`, `__init__`, `__call__`, `__new__`, `__get__`, `__getattribute__`, `__subclasshook__`, `_posixsubprocess`, `_communicate`, `_get_handles` — rött på VAD SOM HELST, alias eller inte; samma namnkontroll på `setattr(obj, "<namn>", …)` |
| B1(a′) default-/dekoratorfångst | `exec_surface_assignments` fäller ett exec-objekt bundet som **defaultargument** eller skickat till en **dekorator** — båda evalueras vid import, före varje inspelare. **KOSTNAD (granskning nr 13 N3):** `def f(cmd, _r=subprocess.run)` är ett vanligt legitimt idiom och blir RÖTT; det undantas inte, eftersom `subprocess.run` ligger i exec-ytan och ett undantag skulle återöppna v12:s B1 |
| B1(b′) klasskroppens värden | `check_class` kräver literalt material i klasskroppens `Assign` (mätt: baslinjens fem klasskroppar bär inga `Assign` alls) — fäller `POPEN = subprocess.Popen` och granskningens N2 |
| B1(c) mät det som når barnet | DRIVERn fångar `subprocess.Popen`, `Popen._execute_child` och `Popen.__init__` **före** modulladdning (även de nio primitiverna, som i v3.6 fångades efter och därmed jämfördes mot sig själva), mäter identitet vid import och efter flödena, installerar en inspelare på `_execute_child` och rapporterar `child_total`, `child_binaries`, `child_argv_rewritten` och `child_starts_unexpected` |
| B1(c′) starter under inspelaren | live-providerraden kräver `child_total == popen_total` (en start genom en klasskroppsfångad Popen syns bara på barnnivån) och att ingen argv skrivits om mellan Popen och barnet |
| B2 indentering + kanari | svepet tillbaka i `for i, c in enumerate(caps)`; FIXTURE-1-kravet står kvar som egen sats. Tio separata kanarier, en per flöde |
| N2 klasskroppsfångad Popen | stängd av B1(b′) statiskt och av `child_total != popen_total` dynamiskt |
| N3 subscript-basen | `x.__dict__[…]`, `vars(x)[…]`, `globals(  )[…]` och alias-baser fälls nu (regelns text höll inte vad den lovade) |
| N4 kopieringsraden vakuös | mutationen körs i en egen replika och uppdaterar VARJE spårat ankare till den muterade planen (byte-kopior skrivs om; planens sha256 och blob-OID ersätts där de står som text, med filens egen mode), och ankarantalet redovisas i radens detalj; dessutom en ny rad `f4_ensure_roadmap_plan_reads_the_pinned_plan_blobs_measured_by_repinning_them_in_the_imported_module` som ompinnar `ROADMAP_PLAN_BLOBS` i den importerade modulen och kräver `Stop` på en OMUTERAD replika |
| N8 sidoeffektsvepets blinda fläckar | `snapshot_git_meta` (subjektets `.git/`: refs, hooks, config, HEAD, toppnivåposter) + `snapshot_fixture` (grindens `FIXTURE_ROOT` rekursivt, minus live-repliken och drivrutinens `TMPDIR`) |
| N9 falskt rött (mätt 2×) | `ALLOWED_LIVE_BINARIES` = `{git, env, sh, python3.12}`; kostnaden inskriven i p.8 tillsammans med blobpinnarna |
| N1 RED-protokollet | RED-repliken byggs om från grunden vid varje mätning; rättelsen inskriven ovan |
| N10(b)(c) osanna meningar | kriterietexten för live-raden och FIXTURE-1-kravet omskriven till vad som faktiskt mäts |

### Test-author 2026-09-11 — baslinje RED för v3.7 (före produkt)
Subjekt: **omklonad** replika av `320c9df7` (`git clone --no-checkout` → `checkout --detach 320c9df7` → grind v3.7 +
utvecklingsdokument → **en** commit; fixtur-HEAD `8813fc65`) — inga staplade fixturcommits, till skillnad från v3.6
(N1). Statisk körning (`--skip-held-gates`, egen `TMPDIR`): **72 PASS / 46 FAIL** av **118 rader**. Fullkörning
(bypass, egen `TMPDIR`, hållna grindar ur subjektets byte-identiska kopior): exit **1**, `RED_LOCAL_QUALIFICATION`,
**77 PASS / 41 FAIL**, result.json sha256 `0313a2ea398528dd94c8f1c4d6043aa50ba8fe64ceb0432edab5cc1bc1168a5e`.
Delta statisk → full är exakt de fem sandboxraderna (`f5_loop_fall_py_green_in_replica`, de tre `f7_`-raderna,
`f8_ordinary_loop_e2e…`), precis som granskning nr 11 räknade. De 41 röda raderna:

`f1_required_absences_web_material_and_transferred_files`, `f1_no_blob_at_head_equals_a_transferred_pre_split_governance_or_pre_platform_plan_object`,
`f2_closure_all_active_references_resolve_to_tracked_files`, `f2_active_doc_free_of_web_governance_and_human_hand_rules_*` (8 dokument:
architect-SKILL, empirical-runner-SKILL, AGENTS.md, README.md, codex-handoff, autonomous-loop-plan-v1, full-roadmap, substitution-contract),
`f2_plan_generation_and_handoff_reached_by_closure_and_scanned_as_active_documents`, `f2_tree_wide_no_web_governance_reference_outside_frozen_evidence`,
`f2_router_authority_order_names_plan_generation_as_active_and_historik_names_the_earlier_generation_as_history`,
`f2_full_roadmap_authority_section_binds_plan_generation_and_paths_and_names_agents_md_without_old_commit`,
`f2_substitution_contract_sections_1_5_7_11_13_unchanged_dated_amendment_and_plan_generation_amendment_present`,
`f2_drift_md_append_only_whole_tail_scanned_with_active_platform_note_naming_plan_generation`,
`f3_verify_cli_pins_equal_candidate_spec_register_every_generation_document_and_the_plan_generation`,
`f3_platform_prepare_refuses_mutated_plan_generation_in_replica`, `f3_platform_prepare_refuses_mutated_handoff_in_replica`,
`f3_platform_check_refuses_snapshot_whose_plan_generation_was_mutated_after_prepare`,
`f4_plan_generation_files_tracked_100644_and_autopilot_paths_and_blobs_equal_head`,
`f4_autopilot_has_plan_generation_constant_and_no_roadmap_plan_sha_attribute`,
`f4_plan_constants_are_single_literal_assignments_equal_at_runtime_and_the_two_roadmap_tuples_keep_their_identities`,
`f4_ensure_roadmap_plan_stops_on_mutated_plan_generation`, `f4_ensure_roadmap_plan_stops_on_missing_handoff`,
`f4_ensure_roadmap_plan_stops_on_mutated_handoff`, `f4_ensure_roadmap_plan_stops_when_the_plan_and_every_tracked_copy_are_mutated_together`,
`f4_ensure_roadmap_plan_reads_the_pinned_plan_blobs_measured_by_repinning_them_in_the_imported_module` (ny i v3.7),
`f4_autopilot_source_free_of_old_plan_commit_git_show_by_commit_and_plan_sha`,
`f4_prompt_functions_ast_literals_inject_only_the_declared_platform_document_set_all_tracked_and_scanned`,
`f4_live_flows_run_to_completion_…_and_free_of_old_pointers`, `f4_live_flows_stop_before_the_stubbed_runner_on_mutated_plan_generation`,
`f4_produced_prompts_of_roadmap_empirical_and_architect_builders_…`, `f4_produced_prompts_free_of_old_plan_pointers_…`,
`f4_plan_generation_slice_table_equals_autopilot_roadmap_tuples_and_selftest_exact_sets`,
`f4_plan_generation_bootstrap_section_names_h031_to_h039_as_platform_establishment`,
`f4_plan_generation_has_required_sections_…`, `f4_handoff_has_required_sections_…`,
`f4_architect_and_empirical_runner_skills_name_plan_generation_and_no_plan_commit`,
`f4_autopilot_selftest_none_returns_pass_prints_plan_generation_and_no_plan_sha`.

Alla röda av rätt skäl (plangenerationen finns inte på `320c9df7`). Ingen av v3.7:s nya statiska regler är röd på
baslinjen: den transitiva aliasmängden är `{p, r, rc, sub}` (alla resultat av `subprocess.run`/`Popen`, ingen skrivs
till), filen har tre attributmål (`sys.dont_write_bytecode` vitlistad, `self.task_id`, `self.reason`), noll
dunder-/internattributmål, noll `setattr` och noll `Assign` i klasskroppar. F7 oförändrat: control-set 68/68,
launch-cwd 19/20 med exakt två extra grindar, governance 68/70 exakt `{g6, g7}`; loopsviten 53 ok / 0 FEL.

### Referenskonstruktion v3.7 (scratch, förkastad — bevisar satisfierbarhet)
Oförändrad produkt jämfört med v3.5/v3.6: **ingen produktändring krävdes** utöver v3.5:s. Fixtur-HEAD `81b570de`,
143 filer. Fullkörning (bypass, egen `TMPDIR`): exit **0**, `PASS_LOCAL_QUALIFICATION_ONLY`, **118/118**, result.json
sha256 `3c6f8f5ad5f76552f83f68b84fd239f0c7a7c24c029e2fb759c40f9b566c5b65`; control-set 68/68, launch-cwd 19/20,
governance 68/70 exakt `{g6, g7}`, loopsviten 53 ok / 0 FEL. Live-flöden: tio till slut med fångstprofilen
1/4/4/4/4/4/4/4/7/37, `popen_total = child_total = 333`, `provider_starts = 0`, startprimitiver `['subprocess.Popen']`,
binärer `['git']` på både Popen- och barnnivå, `child_argv_rewritten = []`, `child_starts_unexpected = []`,
`popen_identity = popen_identity_after = True`, `live_side_effects = []` (nu inklusive subjektets `.git/` och
`FIXTURE_ROOT` rekursivt); `core`-modulen importerad ur `controller/authority/core.py`.

**RÄTTELSE (v3.8, granskning nr 12 N1) till både v3.6- och v3.7-protokollet.** Skillnaden mellan v3.6-protokollets
`popen_total = 59` och v3.7-protokollets `333` var **varken fixturen eller en ändrad räknare** — det var ett
rapporteringsfel i grinden: den muterade live-körningen tilldelades tillbaka till `live_out`, och det var den
överskrivna variabeln som serialiserades under `live_*` i `result.json`, medan radernas detaljer kom från den gröna
körningen. v3.6:s 59 är alltså den MUTERADE körningen (där de fyra vaktbärande flödena stoppar) och v3.7:s 333 den
gröna — i samma körning. Min förklaring "fixturen, inte grinden" var fel i sak. Från v3.8 serialiseras den gröna
körningen under `live_*` (med `live_child_total`, `live_child_binaries`, `live_child_argv_rewritten`,
`live_child_unrecorded`, `live_import_time_starts`, `live_allowed_tools`, `live_allowed_wrappers`) och den muterade
under `live_mutated_*`; mätt på v3.8-referensen: `live_popen_total = 333`, `live_mutated_popen_total = 59`. Den nya vaktraden stoppar med
`roadmap artifact identity mismatch … expected=000000000000000000000000000000000000000f`, dvs. vakten läser bevisligen
`ROADMAP_PLAN_BLOBS`; ankarraden redovisar `anchors=2` (`controller/verify/cli`, autopiloten).

### F9 v3.7 — negativer (var och en i egen replika av v3.7-referensen, statiskt `--skip-held-gates`; **84 körda,
84 fångade, 0 riggfel**) + **tre** falskt-röda prov som förblir gröna
De 69 från v3–v3.6 (inklusive grindmutanten `h`) fångas på samma rader som förut; `a10_guard_copy_in_docs` faller nu
dessutom på den nya ompinningsraden. Nya i v3.7 (15):

| Negativ | Fälls av |
|---|---|
| `a11_execute_child_shadow` (granskning nr 11 B1, ordagrant återbyggd) | modul-/klasskroppsraden med **två** oberoende anmärkningar — `line 73: class body _Boot binds non-literal subprocess.Popen` och `line 342: assignment to internal attribute _Boot.POPEN._execute_child` — samt live-providerraden (`the recorder is no longer installed`) |
| `a11_class_orig_capture2` (N2) | klasskroppsraden statiskt; dynamiskt `child starts 352 != recorded Popen starts 333` + `argv rewritten between Popen and the child: /usr/bin/true exec --json neutral task text` + `the child process received an unexpected argv: true:…` |
| `a11_guard_digest_copy` (N4) | både `…stops_when_the_plan_and_every_tracked_copy_are_mutated_together` (ankare = 3: `config/plan-digests.json`, `controller/verify/cli`, autopiloten) och `…reads_the_pinned_plan_blobs_measured_by_repinning…` |
| `a11_side_subject_git` (N8) | `side effect during live flows: subject/.git:entry:v37-subject-git-marker` |
| `a11_side_fixture_root` (N8) | `side effect during live flows: fixture:v37-fixture-root-marker` |
| `b2_canary_01` … `b2_canary_10` (B2) | live-raden. Tio **separata** mutanter, en per flöde: en körtidshopsatt gammal plansökväg (`"docs/loop/autonomous-loop-plan-" + "v1.md"`, osynlig för varje källtokenregel) läggs till den prompt just det flödet faktiskt skickar, valt på anropsstacken. Var och en är röd och flaggar **exakt sitt eget flöde**: `architect_resolution#1`, `roadmap_contract_flow[SUB-1]#1`, `roadmap_contract_flow[S2]#1`, `empirical_gate_contract_flow#1`, `builder_flow[S2]#1`, `ensure_roadmap_slice[SUB-1]#1`, `ensure_roadmap_slice[S2]#1`, `test_author_flow#1`, `empirical_unattended_flow#1`, `full_roadmap#…`. Under v3.6 var alla tio gröna. |

Falskt-röda prov som **förblir gröna** (113/5 = enbart de fem sandboxraderna): `a10_legit_module_copy`
(`X = Y.copy()` på modulnivå), och de två granskning nr 11 mätte som falskt röda under v3.6 —
`a11_legit_env_snapshot` (`subprocess.run(['/usr/bin/env','true'])` i ett flöde) och `a11_legit_python_snapshot`
(`subprocess.run([sys.executable,'-c','print(1)'])`); båda ger nu `popen_total = child_total = 352`, `problems=[]`.

### Oberoende kontraktsgranskning nr 12 (på e1efb141) → v3.8
`GATE_REVIEW_RESULT=NOT_READY` med TVÅ blockerare, båda i providerledet; allt som remedierades efter nr 11 bekräftades
verkligt (reproducerat, inte läst), RED-protokollet reproducerbart (72/46 statiskt, delta = fem sandboxrader → 77/41,
radlistan identisk med dokumentets) och referensen 113/5 på första försöket.

**B1 — providergränsen band SATSFORMER.** En importtidsfångst genom ett funktionsdefault
(`def _quiet_spawn2(text, _S=os.posix_spawn)`) eller ett dekoratorargument är varken `Assign`, `AnnAssign` eller
`setattr`, och `module_level_form` hoppar över `FunctionDef` helt; för de åtta `os.*`-primitiverna finns dessutom ingen
inspelare under modulattributet. Mätt i grindens EGEN live-körning: **24 riktiga processer** startade med en neutral
prompt medan grinden var 113/5 grön, `popen_total = child_total = 333`, `start_binaries=['git']`, identiteter `True`.
Delfynd B1(b): de två räknarraderna var balanserbara (19 dolda starter + 19 inspelade Popen-anrop med samma argv som
kastar före `_execute_child`).

**B2 — REGRESSION införd av v3.7:s N9-fix.** Den vidgade `ALLOWED_LIVE_BINARIES = {git, env, sh, python3.12}` lade in
tre tolkar i verktygsmängden utan innehållsregel: en providerrad inuti ETT `sh -c`-element, hopsatt i körtid och
startad med vanlig `subprocess.run`, var 113/5 grön. Kontroll: med `{git}` och allt annat identiskt är samma mutant röd
medan referensen förblir grön.

| Fynd | Åtgärd i grinden (v3.8) |
|---|---|
| B1 strukturellt | DRIVERn installerar inspelarna på alla nio primitiver **och** på `Popen._execute_child` **före** `s.loader.exec_module(m)` i live-scenariot; varje importtidsfångst — modulnivå, klasskropp, funktionsdefault, dekoratorargument, metoddefault, metaklass — fångar därmed det instrumenterade objektet. `popen_identity` jämförs mot `_EXPECT` (inspelarna i live, stdlib-originalen annars) |
| B1 statiskt komplement | `exec_surface_assignments` täcker `FunctionDef.args.defaults`/`kw_defaults` och `decorator_list` med samma `is_exec_object`. Mätt på 320c9df7: noll exec-objekt i defaults, noll i dekoratorer |
| B1(b) icke-balanserbara räknare | per-anrops-identitet (`_ACTIVE`-stack: varje barnstart utan ett inspelat Popen-anrop på stacken redovisas som `child start outside any recorded Popen call`) + argv jämförd som **multimängd** (`Counter`) + `import_time_starts` |
| B1 os.*-primitiverna | de har inget attribut under modulattributet; förladdningsinstallationen är deras enda bindning, och den är nu på plats |
| B2 tolkar vs verktyg | `ALLOWED_LIVE_TOOLS = {git}` (exakta argv-element) och `ALLOWED_LIVE_WRAPPERS = {env, sh, python3.12}` (providermarkörer som **delsträng** över hela argv + `WRAPPER_ARGV_MAX = 200` per argv-element som inte är en fångad prompt) |
| N1 rapporteringsfel | den gröna live-körningen serialiseras under `live_*`, den muterade under `live_mutated_*`, och barnnivåns fält tillkommer; rättelsen inskriven vid v3.6/v3.7-posterna |
| N2 två nya falskt röda | aliasspårningen är skopmedveten (per funktion/klass med arv) och ett anropsresultat blir inte längre alias; aliasmängden på baslinjen är TOM och båda fallen gröna. Kostnaden inskriven i p.8 |
| N7 dokumentnit | RED-listans parentes rättad från "7 dokument" till "8 dokument" |
| N8 p.8 | providergränsens mätpunkter omskrivna till åtta; B2-hålet, aliaskostnaden och den för starka `child_total`-meningen rättade |
| N3/N4/N5 (nr 11:s N5/N6/N7) | behållna som **deklarerade gränser** med granskarens mätta motivering inskriven i p.8 (remedieringsbeviset, rollpolicyns enda konsument, handoffens etikett) |

### Test-author 2026-09-11 — baslinje RED för v3.8 (före produkt)
Subjekt: omklonad replika av `320c9df7` + grind v3.8 + utvecklingsdokument, **en** commit (fixtur-HEAD `2da73e81`).
Statisk körning (`--skip-held-gates`, egen `TMPDIR`): **72 PASS / 46 FAIL** av **118 rader**. Fullkörning (bypass, egen
`TMPDIR`, hållna grindar ur subjektets byte-identiska kopior): exit **1**, `RED_LOCAL_QUALIFICATION`,
**77 PASS / 41 FAIL**, result.json sha256 `548edc894d01003ae6e99562d92840a09ad6de1e36c5d8502142231ae2e21ae2`.
Delta statisk→full är exakt de fem sandboxraderna. **Radlistan är byte för byte identisk med v3.7:s 41 rader**
(`comm` på de två FAIL-mängderna: noll tillagda, noll borttagna), dvs. v3.8:s nya regler — inspelarinstallation före
`exec_module`, formregeln för defaults/dekoratorer, den delade binärmängden, den skopmedvetna aliasspårningen och de
icke-balanserbara räknarna — är alla **gröna på baslinjen** och lägger inte till någon rad. F7 oförändrat: control-set
68/68, launch-cwd 19/20 med exakt två extra grindar, governance 68/70 exakt `{g6, g7}`; loopsviten 53 ok / 0 FEL.

### Referenskonstruktion v3.8 (scratch, förkastad — bevisar satisfierbarhet)
Oförändrad produkt jämfört med v3.5–v3.7: **ingen produktändring krävdes**. Fixtur-HEAD `9df7e5b8`, 143 filer.
Fullkörning (bypass, egen `TMPDIR`): exit **0**, `PASS_LOCAL_QUALIFICATION_ONLY`, **118/118**, result.json sha256
`a05147984af6adf3624d6ad5bfdb691a085f209c1b8a31bdf12d6e11e8dd23d2`; control-set 68/68, launch-cwd 19/20, governance
68/70 exakt `{g6, g7}`, loopsviten 53 ok / 0 FEL. Live-flöden: tio till slut med fångstprofilen 1/4/4/4/4/4/4/4/7/37 och
— nu korrekt serialiserat ur den GRÖNA körningen — `live_popen_total = live_child_total = 333`,
`live_provider_starts = 0`, `live_start_primitives = ['subprocess.Popen']`, `live_start_binaries = ['git']`,
`live_child_binaries = ['git']`, `live_child_argv_rewritten = []`, `live_child_unrecorded = []`,
`live_import_time_starts = 0`, `live_popen_identity = live_popen_identity_after = True`, `live_side_effects = []`,
`live_allowed_tools = ['git']`, `live_allowed_wrappers = ['env', 'python3.12', 'sh']`, och den muterade körningen under
`live_mutated_popen_total = 59` — de två tal som i v3.6/v3.7 blandades ihop står nu bredvid varandra i samma
evidensfil.

### F9 v3.8 — negativer (var och en i egen replika av v3.8-referensen, statiskt `--skip-held-gates`; **91 körda,
91 fångade, 0 riggfel**) + **fem** falskt-röda prov som förblir gröna
De 91 är de 69 från v3–v3.6 (inklusive grindmutanten `h`), de 15 från v3.7 (granskning nr 11:s B1-alias, N2, N4, de två
N8-sidoeffekterna och de tio per-flödeskanarierna) och 7 nya från granskning nr 12:

| Negativ | Fälls av |
|---|---|
| `a12_default_arg_posix_spawn2` (nr 12 B1, ordagrant återbyggd) | statiskt `line 235: exec object captured as a default argument: os.posix_spawn`; dynamiskt `provider processes started outside the stubbed runner: 19`, `processes started with unexpected binaries: ['true']`, `child starts 333 != recorded Popen starts 352` — dvs. `os.posix_spawn` går nu genom inspelaren |
| `a12_decorator_capture` (nr 12 B1) | statiskt `line 248: exec object captured by a decorator: _hold(os.posix_spawn)` + samma dynamiska rad |
| `a12_method_default_capture` (nr 12) | statiskt `exec object captured as a default argument` (metoddefault i klasskropp) + live-providerraden |
| `a12_default_arg_popen` (nr 12) | samma två lager, för `subprocess.Popen` |
| `a12_balance_counts` (nr 12 B1(b)) | 19 dolda starter + 19 inspelade Popen-anrop med samma argv som kastar före `_execute_child`: statiskt defaultregeln, argv-platsraden, och dynamiskt `provider processes started outside the stubbed runner: 38` med `popen_total=371 child_total=352` — balanseringen går inte längre jämnt ut |
| `a12_sh_provider_clean` (nr 12 B2) | live-providerraden: `binaries=['git','sh']`, `provider processes started outside the stubbed runner: 19`, `unmatched provider prompt: sh:Do the task the orchestrator names…` — omslagsregelns delsträngstest ser markören inuti `sh -c`-elementet |
| `a12_env_provider_clean` (nr 12 B2) | samma, `binaries=['env','git']` |

Falskt-röda prov som **förblir gröna** (113/5 = enbart de fem sandboxraderna): `a10_legit_module_copy`,
`a11_legit_env_snapshot` (`/usr/bin/env true` i ett flöde), `a11_legit_python_snapshot`
(`python3.12 -c 'print(1)'`), och de två granskning nr 12 mätte som falskt röda under v3.7 —
`a12_legit_local_p_dict` (en lokal dict som heter `p`) och `a12_legit_result_attr`
(`r.returncode = int(r.returncode or 0)` på en `CompletedProcess`).

### Oberoende kontraktsgranskning nr 13 (på c4721ae8) → v3.9
`GATE_REVIEW_RESULT=NOT_READY` med två blockerare som har **samma rot: mätningen skedde i samma interpreter som
produkten**. Allt som remedierades efter nr 12 bekräftades verkligt, RED 72/46 reproducerades med identisk 41-radslista,
F7 är byte-identisk med v2.5, radnamnsdiffen är tom, och `live_*`/`live_mutated_*` serialiseras korrekt. Granskaren
byggde dessutom referensen 113/5 i tre iterationer **utan att öppna något test-author-artefakt** — kontraktet är alltså
nåbart ur dokumentet allena.

**B1 — grindens egen drivrutin lämnade stdlib-originalen åt produkten.** Drivrutinen körde som `__main__` i samma
interpreter som subjektsmodulen och behöll `_ORIG_PRIMS`/`_ORIG_EXEC_CHILD`. En mutant som gjorde `import __main__`,
återställde `_execute_child` runt en start och satte tillbaka inspelaren fick **113/5 med räknare identiska med den rena
referensens** (333/333, `start_binaries=['git']`, identiteter `True`, `child_unrecorded=[]`) medan en riktig barnprocess
kördes. Statiskt missades den eftersom `Subscript` inte gav alias, `type.__setattr__` med hopsatt namn varken är `Assign`
eller `setattr` med konstant, och `__main__` saknades i den dynamiska uppslagsmängden.

**B2 — omslagsregeln fångade bara tre markörsträngar i argv.** Sex mutanter gröna med bevisade barnprocesser, den
avgörande med `PROVIDER=codex PROMPT=read docs/loop/autonomous-loop-plan-v1.md` **på stdin**: den gamla planen nådde en
levande prompt i praktiken medan grinden var grön.

| Fynd | Åtgärd i grinden (v3.9) |
|---|---|
| B1 privat namnrymd | `DRIVER_BOOT`: `python -c` kör en kort bootstrap som exekverar drivrutinskällan i en privat namnrymdsdict (inte en modul, inte i `sys.modules`) och tömmer den efteråt — `__main__` bär varken original, inspelare eller anropslistor |
| B1 klassens egen `__init__` | inspelare på `Popen.__init__`: varje instansiering av den riktiga klassen syns oavsett vilken referens anroparen använde; `init_total == popen_total` krävs och `init_unrecorded` redovisas |
| B1 identitet per anrop | instrumenteringens identitet prövas vid **varje inspelat anrop** (`identity_violations`), inte bara före/efter flödena |
| B1 statiskt | `GATE_NAMESPACE_TOKENS` (`import __main__`, `__main__.`, `sys.modules['__main__']`, `type/object.__setattr__`, `__builtins__`, `gate_driver`) i autopilotkällan; explicit `__setattr__`-anrop och `setattr` med **beräknat** attributnamn är röda |
| **B1/B2 utifrån-mätningen** | live-körningens `PATH` är grindens egna stubbar (`git`, `node`, `python3.12`, `env`, `sh`); varje stubb loggar realbinär, argv och stdin till en fil och delegerar. Grinden läser loggarna utanför produktens process och skannar argv ∪ stdin med `OLD_PLAN_TOKENS`, `COMMIT_READ_TOKENS` och providermarkörerna. Referensen: `stub_calls = 333` |
| B2 identitet | varje exekverad fil löses till realpath och sha256-prövas mot den mätta mängden; basnamn rapporteras aldrig ensamt |
| B2 sluten formmängd | `ALLOWED_LIVE_WRAPPER_FORMS` = `('env','true')`, `('python3.12','-c','print(1)')`; allt annat omslags-argv är rött, och stdin till ett omslag är rött villkorslöst |
| B2 nyttolast utanför argv | stdin-innehåll fångas in-process (`Popen.communicate`) och utifrån; argv ∪ stdin ∪ barnets miljö skannas med `OLD_PLAN_TOKENS` |
| N1/N2 | de två dokumentpåståenden granskaren underkände var **inte gjorda** — v3.8:s dokumentpatch avbröts på ett ankarfel innan filen skrevs. Båda är nu utförda: "SJU mätpunkter" → NIO, "(7 dokument" → "(8 dokument", och `child_total`-meningen är omskriven |
| N3 | default-/dekoratorregeln står nu i kriterieavsnittet med sin mätta falskt-röda kostnad |
| N4 | aliasspårningen är icke-vakuös (containrar, comprehensions, destrukturering, beräknade `setattr`-namn); baslinjen fortfarande tom, v12:s två falskt-röda fortfarande gröna |
| N5 | drivrutinens cwd är en egen tom katalog, inte dess `TMPDIR`, så `python -c`:s `sys.path[0]` inte längre är produktens skrivbara yta; cwd ingår i sidoeffektsvepet |
| N7 | `FIXTURE_ROOT`-kostnaden (31 rötter / 3,6 GiB per granskning) inskriven i p.8 |
| **Riggdisciplin (eget fynd)** | En mutant kunde göra grinden ODÖMBAR (exit 2) genom att bryta `subprocess.Popen` globalt så att ett av produktens egna hjälpskript hängde. `run()`/`run_bytes()` behandlar nu timeout som ett PRODUKTutfall (rc 124 + `PLATFORM_SEPARATION_TIMEOUT`-markör i stdout), och ett oväntat undantag **efter** att grinden börjat döma ger den nya sista raden `f10_gate_reached_its_last_row_without_an_unexpected_failure` som RÖD med exit 1 i stället för exit 2. Ett fel **före** första raden (saknat verktyg, oanvändbart subjekt) är fortfarande ett riggfel. Radantalet är därför 119, inte 118 |
| N1 (v14) | avbrottsvägen skriver nu `result.json`, räknar varje ej körd rad som FAIL mot det pinnade `EXPECTED_ROW_COUNT`, och radens `detail` bär `aborted after N of M rows` — en avbruten körning kan inte längre läsas som numeriskt närmare grön än en ärlig baslinje |
| N2 (v14) | `except Rig` är borttagen som egen gren: ett `Rig` som uppstår EFTER att dömandet börjat är nu en produktdom (f10-raden, exit 1), inte exit 2. Ett fel före första raden är fortfarande riggfel |
| N3 (v14) | `result["pass"]` kräver nu både att alla rader är gröna och att radantalet är `EXPECTED_ROW_COUNT` |
| N4 (v14) | `node` får ingen stubb längre. Beslutet är att `node` inte får startas under flödena (referensen startar det aldrig); ett försök blir en oupplöst binär och ett oväntat verktyg |
| N5 (v14) | stubbloggens undantag i sidoeffektsvepet borttaget |
| **Dokumentfynd (eget)** | Granskningens N1/N2 ("uteblivna rättelser") berodde inte på att ändringarna var ogjorda utan på att **v3.8:s dokumentpatch avbröts på ett ankarfel innan filen skrevs** — sju redan utförda ändringar gick därmed förlorade tillsammans med den felande. Alla sju är nu utförda, och patchskripten skriver numera filen även när ett enskilt ankare missas |

### Test-author 2026-09-11 — baslinje RED för v3.9 (före produkt)
Subjekt: omklonad replika av `320c9df7` + grind v3.9 + utvecklingsdokument, **en** commit (fixtur-HEAD `18ea2f69`).
Statisk körning (`--skip-held-gates`, egen `TMPDIR`): **72 PASS / 47 FAIL** av **119 rader**. Fullkörning (bypass, egen
`TMPDIR`, `/bin/ps`-kontroll före): exit **1**, `RED_LOCAL_QUALIFICATION`, **77 PASS / 42 FAIL**, result.json sha256
`e120a99e2cc1753e4718aab65d91698cae7af91303b8267ee984ec1ee1690db0`. Delta statisk→full är exakt de fem sandboxraderna.

**Radantalet är 119, inte 118**, därför att `f10_gate_reached_its_last_row_without_an_unexpected_failure` tillkommit
(riggdisciplinen nedan). **Den enda TILLKOMNA röda produktraden jämfört med v3.8 är**
`f4_live_flows_start_no_provider_process_outside_the_stubbed_runner_and_leave_no_side_effects`, och den är röd **av
rätt skäl**: på `320c9df7` finns den gamla planen, och autopilotens egna `git`-starter under flödena bär
`docs/loop/autonomous-loop-plan-v1.md` i sin argv. Den nya skanningen av argv ∪ stdin ∪ barnets miljö ser det, och
rapporterar `a started process carries an old-plan pointer: git:autonomous-loop-plan-v1\.md,docs/loop/autonomous-loop-plan-v1\b`.
Det är precis den effekt ordern kräver att grinden mäter, och baslinjen ska därför vara röd där. Ingen rad försvann
(`comm` mot v3.8:s FAIL-mängd: noll borttagna, exakt en tillagd).

### Referenskonstruktion v3.9 (scratch, förkastad — bevisar satisfierbarhet)
Oförändrad produkt jämfört med v3.5–v3.8: **ingen produktändring krävdes**. Fixtur-HEAD `4c64024d`, 143 filer.
Fullkörning (bypass, egen `TMPDIR`, `/bin/ps`-kontroll före): exit **0**, `PASS_LOCAL_QUALIFICATION_ONLY`,
**119/119**, result.json sha256 `9ba9fd4a5de1621034446f12a426a4e93a5965973b57a257a701a7a87a0fe8fc`.
Live-flödenas evidens, nu med utifrån-mätningen bredvid in-process-mätningen:

```text
live_stub_call_total    = 333      (PATH-stubbarnas egna loggar, utanför produktens interpreter)
live_popen_total        = 333      live_child_total = 333      live_init_total = 333
live_provider_starts    = 0        live_identity_violations = []   live_init_unrecorded = []
live_child_unrecorded   = []       live_child_argv_rewritten = []  live_import_time_starts = 0
live_old_pointer_starts = []       live_stdin_starts = []
live_start_binaries     = ['git']  live_child_binaries = ['git']   live_start_primitives = ['subprocess.Popen']
live_allowed_tools      = ['git']  live_allowed_wrappers = ['env','python3.12','sh']
live_allowed_wrapper_forms   = [['env','true'], ['python3.12','-c','print(1)']]
live_allowed_start_sha256    = [env, git, node, python3.12, sh, stub:env, stub:git, stub:node, stub:python3.12, stub:sh]
live_popen_identity = live_popen_identity_after = True      live_side_effects = []
live_mutated_popen_total = 59      (den muterade körningen, separat serialiserad)
```

De fyra räknarna `stub_calls`, `popen_total`, `child_total` och `init_total` är alla 333 och mäts på fyra oberoende
nivåer: utanför processen (stubbarna), på modulattributet, på klassens `__init__` och på `Popen._execute_child`.

### Vad utifrån-mätningen STÄNGER — och vad som kvarstår
**Stänger** (mätt: var och en var en grön mutant under v3.8):
- En produkt som återtar stdlib-originalen ur grindens egen namnrymd (`import __main__`) och startar en process med
  inspelaren tillfälligt avmonterad. Stubbloggen ser starten oavsett vad som händer inuti processen.
- En nyttolast som inte ligger i argv: ett skal som får hela kommandot på **stdin**. Stubben loggar stdin-innehållet.
- En providerstart genom en tillåten tolk med kort, markörfri argv (`sh -c 'exec "$0" "$@"'`, `env A=1 …`,
  `python3.12 -c '<enradare>'`).
- En binär vars **basnamn** är `git` men vars innehåll inte är gits: realpath + sha256 avgör, inte namnet.
- Den gamla planens sökväg som når en barnprocess — i argv, på stdin eller i barnets miljö.

**Kvarstår deklarerat** (ingen av dem låter den gamla planen styra i praktiken):
- Processtarter som inte löser sin binär genom `PATH` **och** inte går genom någon instrumenterad primitiv
  (`ctypes`→libc, `multiprocessing`/fork). Stubbarna ser bara PATH-uppslagningar; de instrumenterade primitiverna ser
  resten. En start som undviker båda bär ingen prompt och kan därför inte återinföra planen.
- Provideranrop som inte startar en process alls (öppet handtag, nät-API).
- Stdin-innehåll som skrivs direkt på en pipe utan `communicate` till en start som **inte** går via PATH — regeln
  "stdin satt på ett omslag är rött" fäller formen, men innehållet loggas då inte.
- Annan kod under `controller/**` som autopiloten inte importerar vid start, och miljövariabler som launchern läser.
- Planens semantik bortom token och skivtabell (granskning nr 13 N8, bekräftad).
- Benchens fingeravtryck (stubbnamnen, `NEEDS_REMEDIATION`-mönstret) och de slutna namn-, binär- och formmängderna,
  som gör legitim omstrukturering röd per design.

### F9 v3.9 — negativer (var och en i egen replika av v3.9-referensen, statiskt `--skip-held-gates`; **101 körda,
101 fångade, 0 riggfel**) + **fem** falskt-röda prov som förblir gröna
De 91 från v3–v3.8 fångas på samma rader (flera faller nu dessutom på den skärpta live-raden), och granskning nr 13:s
sju mutanter plus tre statiska sondprov är nya:

| Negativ (granskning nr 13) | Fälls av |
|---|---|
| `a13_driver_ns_recovery` (B1, ordagrant återbyggd) | modul-/klassformraden med tre anmärkningar: `line 241: explicit __setattr__ call _t.__setattr__`, samma på r.245, och `autopilot@237 reaches the gate's namespace: import\s+__main__` — plus att angreppet inte längre kan lyckas: `__main__` bär inga original |
| `b_stdin_old_plan_prompt` (B2, den avgörande) | live-raden: `a started process carries an old-plan pointer: sh:autonomous-loop-plan-v1\.md,docs/loop/autonomous-loop-plan-v1\b` — den gamla planen på ett barns stdin är nu RÖD — plus `provider processes started outside the stubbed runner: 38` och slutna-världen-raden (`extra=['_stdin_prompt']`) |
| `a13_wrapper_stdin` | live-raden: `unmatched provider prompt: sh:/bin/sh` (stdin till ett omslag är rött villkorslöst) |
| `a13_wrapper_short_argv` | live-raden: `unmatched provider prompt: sh:x` (argv är inte en av de mätta formerna) |
| `a13_wrapper_env_short` | live-raden: `unmatched provider prompt: env:x` |
| `a13_wrapper_python_short` | live-raden: `unmatched provider prompt: python3.12:x` |
| `b_tool_named_git_real` | live-raden: `processes started from unmeasured binaries: [...]` — realpath + sha256 skiljer skriptet från gits binär trots basnamnet |
| `s1_list_unpack_alias` | `module-level assignment to [_S1]` + `assignment onto exec alias _S1.foo` |
| `s2_comprehension_alias` | `module-level binding of subprocess.Popen` + `assignment onto exec alias _S2.foo` |
| `s5_indirect_setattr` | `setattr with a computed attribute name on _S5` + `f4_autopilot_publication_callers_exit0` (timeout som produktutfall, rc 124) |

Falskt-röda prov som **förblir gröna** (114/5 = enbart de fem sandboxraderna): `a10_legit_module_copy`,
`a11_legit_env_snapshot` (`/usr/bin/env true`), `a11_legit_python_snapshot` (`python3.12 -c 'print(1)'`),
`a12_legit_local_p_dict` och `a12_legit_result_attr`.

**Fixturnot:** `a11_side_subject_git` skriver i sitt eget subjekts `.git/`. Mutanten måste därför köras på en ren
replika — en andra körning i samma katalog ser markören redan i före-ögonblicksbilden och blir grön av rigg-skäl, inte
av produktskäl. Mätt och verifierat: på ren replika faller den på sidoeffektsvepet.

### Oberoende kontraktsgranskning nr 14 (på f6add80b) → v3.10
`GATE_REVIEW_RESULT=NOT_READY` med **tre** blockerare, alla på live-raden, alla reproducerade med riktiga barnprocesser
och bevismarkörer. Allt som remedierades efter nr 13 bekräftades verkligt (sex av sex mutanter faller på angivna rader,
fem falskt-röda prov gröna, RED 72/47 med exakt en tillagd rad och noll borttagna, F7 byte-identisk, f10-raden
fungerar), och referensen nåddes i **första** iterationen med nr 13:s dokumentbyggda konstruktion oförändrad — v3.9
krävde ingen produktändring.

| Fynd | Åtgärd i grinden (v3.10) |
|---|---|
| B1 namnrymden via frame/heap | `GATE_NAMESPACE_TOKENS` utökad med `_getframe(`, `f_globals`, `f_back`, `f_locals`, `f_code`, `gc.get_objects/referrers/referents`, `sys.settrace`, `sys.setprofile`, `threading.settrace` |
| B1 inspelningsintegritet | räknarna hålls **också** som heltal i en closure-cell som ingen listutbytning når; inspelningsbehållarnas typ, identitet och bundna `append` pinnas vid installation och prövas efter flödena (`recorder_integrity`) |
| **B1/B3 halvorna mot varandra** | ny rad `f4_live_flows_out_of_process_stub_log_and_in_process_recorders_agree_with_an_unbroken_chain`: `stub_calls = bare_name_starts` och `popen_total = init_total = child_total`, closure-räknarna mot listorna, obruten HMAC-kedja, sammanhängande numrering, och varje räknare över `LIVE_MIN_PROCESS_STARTS`. **Nämnaren är de BARA namnen, inte alla starter:** en start vars `argv[0]` bär en katalogdel går per konstruktion förbi `PATH` och kan inte synas i stubbloggen; den binds i stället av in-process-halvan, av realpath+sha256-identiteten och av den slutna formmängden (mätt: `b6_abs_sh_stdin_file` faller på dem). Att kräva likhet mot ALLA starter vore en falsk rödhet utan att stänga något |
| B2 identitet i barnets värld | `_identify` löser binären med **den PATH anropet använder** (`env=`-argumentets, annars `os.environ`); en start som bär en egen `PATH` i `env=` är röd |
| B2 stdin i alla kanaler | `input`, pipe, vanlig **fil** och **ärvd fd** (via `/dev/fd/<n>`), plus `pass_fds`; innehållet läses och skannas med `OLD_PLAN_TOKENS` och providermarkörerna. Varje start med stdin ansluten är röd |
| B2 miljön | mäts även när barnet **ärver** den, inte bara när den skickas som `env=` |
| B2 git som startare | `-c` med `alias.*`/`core.pager`/`core.editor`/`core.sshCommand`/`core.hooksPath`/`diff.external`/`credential.helper`/`filter.*`/`uploadpack.*`/`protocol.*`, `--exec-path`, `--upload-pack`, `--receive-pack`, samt `GIT_EXTERNAL_DIFF`/`GIT_PAGER`/`GIT_EDITOR`/`GIT_SSH*`/`GIT_CONFIG*`/`GIT_PROXY_COMMAND`/`GIT_ASKPASS` i miljön |
| B3 manipulationsupptäckande logg | varje stubbpost bär löpnummer från en låst räknare och en HMAC med en nonce per körning; grinden kräver obruten kedja och sammanhängande numrering |
| B3 loggen i svepet | undantaget borttaget; endast `stublog/seq`, `stublog/lock` och `stublog/call-<n>[.stdin]` är redovisade, allt annat i katalogen är en sidoeffekt |
| B3 nämnare | `live_stub_call_total` binds av den nya raden mot de tre in-process-räknarna och mot det mätta golvet |

### Test-author 2026-09-11 — baslinje RED för v3.10 (före produkt)
Subjekt: omklonad replika av `320c9df7` + grind v3.10 + utvecklingsdokument, **en** commit (fixtur-HEAD `9593e3ec`).
Statisk körning (`--skip-held-gates`, egen `TMPDIR`): **74 PASS / 53 FAIL** av **127 rader**.
Fullkörning (bypass, egen `TMPDIR`, `/bin/ps`-kontroll före): exit **1**, `RED_LOCAL_QUALIFICATION`,
**79 PASS / 48 FAIL**, result.json sha256 `bb4dde21fe7bece43879046f377076014c01cc646a5db57bf95a8b7d03956d46`. Delta statisk→full är exakt de fem
sandboxraderna.

**Radantalet är 127, inte 121**, därför att ägarbeslutets sex bindningar tillkommit (B1–B5). **De TILLKOMNA röda
raderna jämfört med v3.9/v3.10:s förra mätning är exakt dessa sex, och noll rader försvann** (`comm` mot den förra
FAIL-mängden):

```text
f2_regler_md_carries_the_working_method_role_flow_frozen_gate_rule_gate_change_rule_review_standard_and_rig_threat_model
f2_agents_claude_and_role_skills_reference_regler_md_and_the_plan_without_duplicating_a_normative_sentence
f4_plan_generation_avslutskriterier_carry_the_four_measurable_levels_planseparation_trust_kernel_bootstrap_milestone_and_later_operational_whole
f4_plan_generation_bootstrap_names_a_finite_handover_point_to_qualified_autonomous_operation
f4_plan_generation_malbild_carries_self_identified_needs_within_goal_and_mandate_and_web_as_a_business_using_the_platform
f4_plan_generation_preserves_h039_functional_requirement_zero_runtime_residues_and_no_loss_of_foreign_data
```

Alla sex är röda **av rätt skäl**. De fyra plangenerationsraderna är röda därför att plangenerationen inte finns på
`320c9df7` alls. De två regelkälleraderna är röda av MÄTT delvis skäl: `docs/loop/regler.md` bär redan rollflödet och
regel 11:s *"ändrar aldrig sin egen frysta grind"*, men saknar kopplingen `befintligt krav` + `konkret hinder`,
granskarens godkännandenorm, `riggbegränsningar`/`hotmodell` och frasen `källa för arbetsmetoden` — grindens `detail`
räknar upp exakt de fyra grupperna. Referensdelen är röd därför att plangenerationen saknas och ingen av de åtta
hänvisarna kan namnge den. På baslinjen mäts **52 normativa meningar** över de aktiva dokumenten, **noll kollisioner**:
duplikationsregeln är alltså grön på baslinjen och röd först när någon faktiskt duplicerar.

**Ägarbeslutets textrester i `docs/loop/regler.md` (kontrollerade, inget ankare behövs).** `LOOP-ÄGARHAND-16–27`
(r.16) och de negativa webbavgränsningarna (r.10–11 "Webbkundens brief- och kvalitetskrav", r.29 "utför inte
kundflödet") träffas av **noll** mönster i `WEB_TOKENS`, `HUMAN_TOKENS`, `HARD_HUMAN_TOKENS`, `OLD_PLAN_TOKENS` och
`COMMIT_READ_TOKENS` — de två orden matchar bara `PLAN_TOKENS`, som per konstruktion bara appliceras på
plangenerationen. Mätt genom att köra grindens egna mönstermängder mot filen. Ingen omskrivning krävs av buildern och
inget ankare tillkommer; det enklare valet.

### Referenskonstruktion v3.10 (scratch, förkastad — bevisar satisfierbarhet)
Produktändringen jämfört med v3.5–v3.9 är exakt ägarbeslutets bindningar: plangenerationens fyra nya textstycken
(målbild, skyddade invarianter, bootstrap, avslutskriterier), fyra nya regler i `docs/loop/regler.md`, och en
pekarmening i `CLAUDE.md` och i de fem rollskills som inte redan namngav båda dokumenten — plus ompinning av
`CLAUDE.md` och `docs/loop/regler.md` i `SUBSTITUTION_BLOBS` och `PLATFORM_DOCUMENTS`. Fixtur-HEAD `10704dcd`.
Statisk körning: **122 PASS / 5 FAIL**. Fullkörning (bypass, egen `TMPDIR`,
`/bin/ps`-kontroll före): exit **0**, `PASS_LOCAL_QUALIFICATION_ONLY`, **127/127**, result.json sha256
`d041affa02fb033fca19265340a4e34d8b6f58ecb4ee72b94404b5ee81dd65e1`. Samtliga sex nya rader gröna i **första** iterationen, med icke-tomma mätytor:
`avslutskriterier len=1611`, `bootstrap len=1099`, `målbild len=861`,
`invarianter len=826`, `regler.md len=5116`, `normativa meningar=63`.

### F9 v3.10 — negativer (var och en i egen replika av v3.10-referensen, statiskt `--skip-held-gates`; **124 körda,
117 fångade, 7 falskt-röda prov gröna, 0 riggfel**)
Samtliga tidigare negativer byggdes OM mot den nya referensen och kördes om mot den nya grinden; ingen föll bort och
ingen bytte rad. Nytt i v3.10:

| Negativ | Faller på |
|---|---|
| `b1_env_path_launder` (nr 14 B2) | live-raden + `…out_of_process_stub_log_and_in_process_recorders_agree…` |
| `b2_tool_stdin_file` (nr 14 B2) | live-raden |
| `b3_stub_log_wipe` (nr 14 B3, loggmanipulationen) | `…out_of_process_stub_log_and_in_process_recorders_agree…` |
| `b4_frame_ns_scrub` (nr 14 B1) | `…module_and_class_bodies_are_the_declared_form…` + `…agree_with_an_unbroken_chain` |
| `b5_gc_ns_scrub` (nr 14 B1) | samma två + live-raden |
| `b7_git_alias_launcher` (nr 14 B2) | live-raden |
| `b9_fd_payload` (nr 14 B2) | live-raden |
| `b11_silence_recorders` (nr 14 B1, den allvarligaste) | `…module_and_class_bodies…` + `…agree_with_an_unbroken_chain` |
| `b13_exit_level_dropped` (B1) | `f4_plan_generation_avslutskriterier_carry_the_four_measurable_levels_…` |
| `b13b_exit_level_not_marked_later` (B1) | samma rad — nivå (iv) utan `senare`/`utanför dagens` |
| `b14_bootstrap_no_finite_handover` (B2) | `f4_plan_generation_bootstrap_names_a_finite_handover_point_…` |
| `b15_malbild_no_business` (B3) | `f4_plan_generation_malbild_carries_self_identified_needs_…` |
| `b16_h039_requirement_dropped` (B4) | `f4_plan_generation_preserves_h039_functional_requirement_…` |
| `b17_rules_without_method` (B5) | BÅDA regelkälleraderna (metoden borta **och** under åtta normativa meningar) |
| `b18_duplicated_normative_sentence` (B5) | `f2_agents_claude_and_role_skills_reference_…_without_duplicating_a_normative_sentence` |
| `b19_skill_without_reference` (B5) | samma rad — en rollskill som inte namnger regelkällan/planen |
| `probe_rules_extra_rule` (falskt-rött prov) | **GRÖN** — en legitim ny regel med egen normativ mening |
| `probe_pointer_repeated_verbatim` (falskt-rött prov) | **GRÖN** — samma PEKARMENING ordagrant i `AGENTS.md` som i rollskills |

Var och en av `b13`–`b19` faller på **exakt** den avsedda raden och ingen annan (samtliga ompinnade, så pinnraderna
inte skymmer domen).

**Riggdisciplinen mätt, inte läst (granskning nr 14 N1/N2).** `gate-abort` är en grindmutant som reser `Rig` EFTER att
domen börjat (direkt före F6-blocket) och körs mot referensen. Utfall: exit **1** (produktdom, inte exit 2),
`FAIL f10_gate_reached_its_last_row_without_an_unexpected_failure`, `PLATFORM_SEPARATION_FINAL_ABORT=Rig(...)`, och
`result.json` **skrivs** med `aborted: true`, `pass: false`, `expected_rows: 127` och 127 rader varav **11**
`not_run_*` räknade som FAIL. Den tryckta summan blir `114/13` över hela nämnaren — en avbruten körning kan alltså
inte längre läsas som numeriskt närmare grönt än en ärlig baslinje. Båda de icke-blockerande fynden är därmed
stängda genom körning.

**Not om subjekten.** Negativerna kördes mot referensen `ca83c175`; de slutliga fullkörningarna mot `10704dcd`
(referens) och `9593e3ec` (RED). Skillnaden mellan `ca83c175` och `10704dcd` är enbart utvecklingsdokumentets PROSA
(kriterieavsnittens radbeskrivningar och detta utfallsavsnitt); produkten, grinden och alla mätytor är identiska, och
dokumentet är varken tokenskannat eller innehållsbundet av någon rad utöver `DOC_SECTIONS`-närvaron. Statisk körning
på `10704dcd` ger samma 122/5 som på `ca83c175`.

### Kontraktsrunda v3.11 2026-09-12 — ordnad, kvalificerad refreeze (hindret, inte en sidoförbättring)
**Kopplingen enligt regel B / ägarbeslutets undantag.** Befintligt krav: Trust Kernel-kriteriet ("kvalificering
kräver att rätt frysta verifierare har körts färdigt mot exakt rätt kandidat med samtliga obligatoriska
kontroller"). Konkret hinder: v3.10:s `FROZEN_TREES` blob-fryser hela `verify/` och tillåter ett enda tillägg, så
h-035:s refreeze-kandidat `a288e169` ger **122/5** där alla fem röda rader har ETT skäl — en fryst grinds bytes
ändrades. Ingen H-grind kan alltså frysas om, och h-035, h-036, h-037 och h-038 är alla blockerade.
Andra hindret: `f4_live_flows_…_leave_no_side_effects` svepte delade systemkataloger och gick **falskt rött två
gånger** på främmande temporärkataloger; ett falskt rött blockerar varje framtida kvalificering.

**Raddiff v3.10 → v3.11** (mätt genom att evaluera varje `check(...)`-etikett i båda källorna; 88 oförändrade):

| Ändring | Rad | Motivering |
|---|---|---|
| BORT | `f6_frozen_evidence_identical_to_332f07ce_plus_this_gate_only` | delas i mängd- och byteregel; den gamla raden kunde inte skilja en deklarerad refreeze från ett tyst tillägg |
| NY | `f6_frozen_tree_paths_are_the_332f07ce_set_plus_this_gate_only` | (a) exakt sökvägsmängd: inga tysta tillägg, inga borttagningar |
| NY | `f6_frozen_tree_bytes_identical_to_332f07ce_except_the_declared_refreeze` | (b) byte-frysning utom det deklarerade; odeklarerad ändring röd, deklarerat-men-oförändrat röd |
| NY | `f6_refreeze_declaration_is_one_ordered_frozen_h_gate_with_matching_base_and_new_sha256` | deklarationens form, ordningen (exakt en), bas-/ny-sha256, 755, parsbar |
| NY | `f6_refreeze_added_lines_free_of_web_governance_human_hand_and_old_plan_tokens` | refreezen öppnar en väg för text in i `verify/`, som annars är oskannad fryst evidens — kravet "ingen webbstyrning tillbaka" bevaras |
| NY | `f6_declared_refreeze_is_qualified_by_a_receipt_bound_to_this_candidate_and_the_refrozen_bytes` | kvalificerad, inte bara deklarerad |
| NAMN | `f7_platform_control_set_exit_68_of_68_on_candidate` → `…_on_candidate_68_of_68_or_exactly_the_declared_refreeze_effect` | namnet kodade ett radantal som ändras av en refreeze (67/1) |
| NAMN | `f7_launch_cwd_exit_19_of_20_frozen_listing_sees_exactly_governance_and_this_gate` → `…_sees_exactly_governance_this_gate_and_the_declared_refreeze` | listningen ser nu även refreezen |
| NAMN | `f7_platform_governance_exit_red_exactly_on_its_frozen_verify_register_and_launch_cwd_rows` → `…_red_exactly_on_its_frozen_rows_and_the_declared_refreeze_effect` | governance kör control-set och får exakt en rad till |
| ÄNDRAD | `f8_ordinary_loop_e2e_and_platform_prepare_check_green_on_candidate_via_held_control_set` | samma mening; förväntad FAIL-mängd härledd ur refreezen, plus krav att alla sju produktrader är gröna |
| ÄNDRAD | `f4_prompt_builders_run_in_contained_fixture_without_side_effects` | riggfix: svepet skopat till grindens egna rötter |
| ÄNDRAD | `f4_live_flows_start_no_provider_process_outside_the_stubbed_runner_and_leave_no_side_effects` | samma riggfix |

Radantal **127 → 131**. Alla övriga 88 rader oförändrade till namn och innebörd.

**Grind v3.11:** `verify/bin/platform-separation-final-exit` sha256 `3bdc0ce23625d6bfcb331e9abd4ee6d15b15cb3b282e8766bae101da4b0a442b`, 3932 rader,
commit `a1e37b6717fd4ec84577e67862eaf225c447eb96` (träd `82fa97c31d635541ccadc7e07f37510dc9a779bb`, förälder `5df9213c75c4d2ab0ba8acecefd058cbe389db36`).

### Test-author 2026-09-12 — grön baslinje för v3.11 på den oförändrade integrationen
Subjekt: `a1e37b6717fd4ec84577e67862eaf225c447eb96` = `5df9213c` + grind v3.11 + detta dokument (ingen refreeze deklarerad).
Statisk körning (`--skip-held-gates`, egen `TMPDIR`): **126 PASS / 5 FAIL** av 131 rader — de fem röda är exakt de
sandlådeberoende raderna. Fullkörning (bypass, egen `TMPDIR`, `/bin/ps`-kontroll före): exit **0**,
`PASS_LOCAL_QUALIFICATION_ONLY`, **131 PASS / 0 FAIL**, result.json sha256 `5159ea80f75319d653d4726a72b585b2f18404943681fa1463323d04b434abaf`.
Varje ny rad är grön av rätt skäl: utan deklaration är `refreeze_declaration` tom, `refreeze_added_lines` = 0 och
de tre F7-förväntningarna är identiska med v3.10:s.

### Acceptans 2026-09-12 — h-035:s refreeze-kandidat GRÖN under v3.11
Kandidat `89ec9ddb024d27658066aec9e381a39cb091491a` = v3.11-integrationen + `a288e169`:s `verify/bin/h-035-exit` (blob `4d13742d`,
sha256 `91aa7fe7…fabc`, 22511 rader) + `SEPARATION-20260910/REFREEZE.json`. Rebasen är mekanisk: kandidaten
pinnar varken planen eller handoffen.

**Kvalificeringskörningen av den omfrysta grinden** (separat, utanför separationsgrinden, kanonisk invokation
`env PROVIDER_CALL_ALLOWED=NO MODEL_CALL_ALLOWED=NO PYTHONEXECUTABLE=$PY $PY -I -S -B verify/bin/h-035-exit` i en
checkout med kanonisk lokal bare-origin, vitlistad lokal config och de sju bevarade kandidaterna i ODB:n):
exit **0**, **462 PASS / 0 FAIL**, `H035_GATE_RESULT=PASS`. Kvittot (`receipt-accept.json`, sha256
`13fb94d07979b95319382ddd6a20577024cdb90d930940325d1ee05a476a119d`) binder `gate_sha256 = 91aa7fe7…`, `subject_head = 89ec9ddb024d27658066aec9e381a39cb091491a`, `pass_count = 462`,
`stdout_sha256 = b22662b6911a6ece1e6173d768985474b7192830a38bb677599d87e646096158`.

Separationsgrinden v3.11 med `--refreeze-receipt`: exit **0**, `PASS_LOCAL_QUALIFICATION_ONLY`, **131 PASS / 0 FAIL**,
result.json sha256 `0c29017abb8cb4a2066d706bdbead840c24f22be5bffa3576e8faf4c417ec6e0`. De fem nya F6-raderna gröna i **första** iterationen. De tre hållna
grindarnas mätta utfall på kandidaten:

| Hållen grind | Mätt utfall på kandidaten | v3.11:s förväntan (härledd, exakt) |
|---|---|---|
| `platform-control-set-exit` | exit 1, **67/1**, `frozen_artifacts_identical_to_dae90c8f` med detalj `files=24 problems=['verify/bin/h-035-exit']` | exakt den raden, exakt den sökvägslistan, `RED_LOCAL_QUALIFICATION`, och alla sju produktrader gröna |
| `launch-cwd-exit` | exit 1, **19/20**, `frozen_verify_bin_identical_to_base_383ed387` med detalj `files=32 problems=['verify/bin/h-035-exit'] extra=['verify/bin/platform-governance-exit', 'verify/bin/platform-separation-final-exit']` | exakt den detaljen |
| `platform-governance-exit` | exit 1, **67/3**: `g6_frozen_trees_and_files_identical_to_512490d4_plus_this_gate_only`, `g7_launch_cwd_exit_19_of_20_only_frozen_listing_sees_this_gate`, `g7_platform_control_set_exit_68_of_68_on_candidate` | exakt de tre, och den nästlade control-set-radens detalj måste bära `pass=67 fail=1 fails=['frozen_artifacts_identical_to_dae90c8f']` |

På den refreeze-fria baslinjen är samma tre förväntningar identiska med v3.10:s och mättes till 68/68 (grön),
19/20 och 68/2 — v3.10:s exakta stränghet är alltså bevarad när ingen refreeze deklareras.

### F9 v3.11 — negativer (var och en i egen replika av acceptansreferensen, statiskt `--skip-held-gates`)
**16 negativer körda, 16 fångade; 1 falskt-rött prov grönt; 0 riggfel.** Var och en i egen replika av
acceptansreferensen, statiskt `--skip-held-gates` (nämnare 131, de fem sandlådeberoende raderna alltid röda).

| Negativ | Faller på | Mätt skäl |
|---|---|---|
| `n0_reference (acceptansreferensen)` | **126/5** — bara de fem sandlådeberoende raderna; ingen ny rödhet | — |
| `n1_undeclared_byte_change` | `f6_frozen_tree_bytes_…_except_the_declared_refreeze` | `undeclared_byte_changes=['verify/bin/h-035-exit']` |
| `n2_new_sha_mismatch` | `f6_refreeze_declaration_…` | declared new sha256 is not the candidate's bytes |
| `n3_base_sha_mismatch` | `f6_refreeze_declaration_…` | declared base sha256 is not the 332f07ce object |
| `n4_no_receipt` | `f6_declared_refreeze_is_qualified_by_a_receipt_…` | 0 qualification receipts supplied, exactly one required |
| `n5_receipt_not_green` | `f6_declared_refreeze_is_qualified_…` | the refrozen gate was not green on this candidate (exit=1, 1 FAIL-rad) |
| `n6_added_file_under_verify` | `f6_frozen_tree_paths_…` | `additions=['…platform-separation-final-exit', 'verify/bin/x-exit']` |
| `n7_deleted_file_under_verify` | `f6_frozen_tree_paths_…` | `removals=['verify/bin/h-001-exit']` |
| `n8_web_text_in_refrozen_gate` | `f6_refreeze_added_lines_…` (ENDAST den) | `(?i)docs/07-konstitution` och `(?i)konstitution\w*` i en tillagd rad |
| `n9_second_gate_quietly_changed` | `f6_frozen_tree_bytes_…` | `undeclared_byte_changes=['verify/bin/h-036-exit']` |
| `n10_two_declared_refreezes` | `f6_refreeze_declaration_…` | exactly one ordered refreeze per candidate, declared 2 |
| `n11_held_gate_declared` | `f6_refreeze_declaration_…` + `f6_frozen_tree_bytes_…` | not a frozen H gate path: `verify/bin/platform-control-set-exit` |
| `n12_expected_pass_mismatch` | `f6_declared_refreeze_is_qualified_…` | 462 PASS-rader, deklarationen förutsade 461 |
| `n13_receipt_other_candidate` | `f6_declared_refreeze_is_qualified_…` | kvittot namnger ett annat subjekt än kandidaten |
| `n14_receipt_stdout_tampered` | `f6_declared_refreeze_is_qualified_…` | the receipt's stdout does not match its own sha256 |
| `n15_declared_but_unchanged` | `f6_refreeze_declaration_…` + `f6_frozen_tree_bytes_…` | declared refreeze changes nothing; `declared_but_unchanged=['verify/bin/h-036-exit']` |
| `n16_product_side_effect (riggfixens negativ)` | `f4_live_flows_…_leave_no_side_effects` | `side effect during live flows: fixture:driver-cwd/SIDE-EFFECT-MARKER` |
| `probe_foreign_temp_churn (falskt-rött prov)` | **GRÖN** — båda sidoeffektsraderna | en främmande process skapade och tog bort kataloger och filer i alla fem tidigare svepta kataloger under hela körningen |


**F7-förväntningarnas exakthet, mätt på grindens egen domarkod.** De tre domarna (`judge_control_set`,
`judge_launch_cwd`, `judge_governance`) extraherades ur grindkällan och kördes mot inspelade och syntetiserade
hållna-grind-utfall. **13 av 13** fall betedde sig som förutsagt: refreezens exakta effekt accepteras (A, F, I),
medan en extra röd rad (C, J), en annan namngiven sökväg (B), en icke-grön produktrad (D), v3.10:s detalj på en
refreeze-kandidat (G), en extra fil i listningen (H), en saknad control-set-rad (K), ett nästlat control-set-fel
av annat skäl (L), samt refreeze-utfallen UTAN deklaration (E, M) alla **avvisas**. Deklarerad gräns: detta är en
statisk exercering av domarkoden, inte en fullkörning.

**Not om subjekten.** Grinden är byte-identisk i alla körningar ovan (sha256 `3bdc0ce2…`); det som skiljer
commiten `a1e37b6` från den slutliga commiten är enbart detta utfallsavsnitts PROSA i utvecklingsdokumentet, som
varken tokenskannas (klassificeras som `local-development`) eller innehållsbinds av någon rad utöver
`DOC_SECTIONS`-närvaron. Acceptanskandidaten `89ec9ddb` är `a1e37b6` + refreezen + deklarationen, en commit.

**Riggnot (mätt 2026-09-12).** En första baslinjefullkörning gick 130/1 på
`f7_launch_cwd_…` med `extra=[…'verify/bin/__pycache__'…]`: test-authorns egen förgranskning hade importerat
grinden med en Python UTAN `-B` och lämnat `verify/bin/__pycache__` i arbetsytan. Det är en riggartefakt, inte en
produktdom — men raden fångade den korrekt (inget får tillkomma under `verify/`). Städat och kört om på en ren
klon: 131/131. Regeln `-B` alltid gäller även förgranskningsskript som importerar grinden.

**Deklarerade gränser i denna runda** (fullständigt under "Vad grinden inte bevisar"): (1) kvittot bevisar inte
att körningen ägde rum — grinden kör inte den omfrysta H-grinden själv, eftersom varje H-grinds rigg är egen och
spröd; (2) refreezens innehåll bedöms inte; (3) sidoeffektsvepet täcker inte längre hårdkodade absoluta sökvägar
utanför grindens egna rötter; (4) tre retirement-identifierare undantas från skanningen av refreezens tillagda
rader.

### Kontraktsgranskning nr 15 (på `00f84d0e`) → v3.12
`GATE_REVIEW_RESULT=NOT_READY` med **två** blockerare, båda i refreeze-vägen. Granskaren reproducerade båda de
avgörande körningarna med **byte-identisk** stdout (baslinje 131/131, acceptans 131/131), bekräftade raddiffen
mekaniskt, rekonstruerade 8 av 16 negativer (8/8 rätt rad), visade i fullkörning (A10, 128/3) att F7-domarna är
exakta och inte lösgjorda, och bekräftade med fyra konstruerade negativer (V1–V4) att inget av v3.10:s band
försvagats. Riggfixen bekräftades strukturellt immun mot främmande sessioner.

| Fynd | Åtgärd i grinden (v3.12) |
|---|---|
| **B1** — innehållskravet var exitkod 0 plus en radräkning. Granskaren ersatte `verify/bin/h-035-exit` (22511 rader, 462 rader-i-utfall) med en **femradig** grind som skriver 25 `PASS`, körde den **ärligt**, byggde kvittot ur den **verkliga** stdout:en och fick `rc=0, 131/131`. Ägarbeslutet kräver *samtliga obligatoriska kontroller* och säger att exitkod 0 ensam inte räcker | ny rad `f6_refreeze_keeps_every_base_row_label_except_the_declared_retirements` med **per-grind-golv härlett ur basgrindens frysta bytes**; `REFREEZE_MIN_PASS = 20` borttagen |
| **B2** — grinden hävdade att kvittot aldrig kan komma ur trädet men verkställde ingenting; ett **ospårat** kvitto i subjektet krediterades (126/5) | en kvittosökväg vars `resolve()` ligger i eller under subjektet avvisas, spårad som ospårad; utsagan omskriven till vad som verkställs |
| **N1** — retirement-undantagen var globala; granskaren smugglade styrningsprosa i en kommentar och en **aktiv** `human_only`-stopp genom dem | hela tokenmängden skannas per filrad; de tre identifierarna undantas bara på rader som bär en **retirement-bunden** strängkonstant |
| **N3** — odokumenterat att en generation rymmer exakt EN omfrysning | dokumenterat i F6/F7 tillsammans med hur `FROZEN_BASE` ompinnas för h-036, h-037 och h-038 |

Icke åtgärdade och redovisade som deklarerade gränser: N2 (hårdkodade absoluta sökvägar utanför grindens rötter),
N4 (`REFREEZE_GATE_RE` bredare än den ordnade mängden), N5 (`TypeError` vid blandade kvittonyckeltyper — faller
stängt), N6 (kvittots miljö obunden), N7 (`gate_ok` självrefererande, oförändrat från v3.10), N10 (`PLAN_TOKENS`),
samt A3 (kvitto ur en annan kandidats körning med lappad `subject_head`).

**Så här härleds golvet — exakt.** `gate_row_labels(source)` (grindens egen funktion) `ast.parse`:ar källan och
returnerar de strängkonstanter som (a) skickas som POSITIONSARGUMENT till ett anrop vars namn är `check`, och
(b) matchar `[A-Za-z][A-Za-z0-9_]*` i sin helhet. Det är en grinds egna radetiketter. Den körs på BASversionen
(`332f07ce:<sökväg>`) och på kandidatens version. Mätt på basen: **h-035 251, h-036 27, h-037 21, h-038 9** — regeln
gäller alltså hela den tvingande ordningen utan ny kontraktsrunda. Kraven: varje basetikett måste finnas kvar som
radetikett i den omfrysta grinden utom de deklarerade pensioneringarna; en pensionering måste finnas i basen, får
inte finnas kvar i omfrysningen, måste bära minst 20 teckens motivering, och högst **tre** får deklareras;
`expected_pass >= basetiketter − pensioneringar`; och färre än **5** härledbara basetiketter gör grinden
icke-omfrysbar under detta kontrakt (fail-closed). Mätt på den verkliga kandidaten: bas 251, omfryst 251,
pensionerade 1, golv 250, **saknade 0**.

**Varför statiskt och inte täckning över körningen.** 70 av h-035:s 251 basetiketter finns i den omfrysta källan men
emitterades inte i den ärliga körningen (grenberoende). En regel som krävde dem i kvittot hade gett ett falskt rött
på en korrekt omfrysning.

### Test-author 2026-09-12 — grön baslinje för v3.12 på den oförändrade integrationen
Subjekt `09f0ea6dde40e9b61a0be9c56aa352e19c47dfc3` (`5df9213c` + grind v3.12 + detta dokument, ingen refreeze deklarerad).
Fullkörning (bypass, egen `TMPDIR`, `/bin/ps` före): exit **0**, `PASS_LOCAL_QUALIFICATION_ONLY`, **132/132**,
result.json sha256 `06d2436b9f1726c331c4e17a9c475a17057beb780df4a7a030269568a66165d8`. `refreeze_declaration []`, `refreeze_label_counts {}`, `receipts []`.

### Acceptans 2026-09-12 — h-035:s refreeze GRÖN under v3.12
Kandidat `61adaf6c5495367d6ffe64885c9bead6803d6f5d` = v3.12-integrationen + `a288e169`:s `verify/bin/h-035-exit` + `REFREEZE.json` med
**en deklarerad pensionering**: `F_H036_V3_THREE_DOCUMENTS_EXACT_35D7FD7C_PLUS_HASH_BOUND_APPEND`, den enda av
basens 251 radetiketter som omfrysningen tappar.

Kvalificeringskörning av den omfrysta grinden (separat, kanonisk invokation): exit **0**, **462 PASS / 0 FAIL**,
`H035_GATE_RESULT=PASS`. Kvitto sha256 `bff8cf1e0eb33d68b4643d423b8c892628d86cda05d62a3139fca9149424e3e1`.
Separationsgrinden med `--refreeze-receipt`: exit **0**, `PASS_LOCAL_QUALIFICATION_ONLY`, **132/132**, result.json
sha256 `5b4b02746810610f9659ffedc25d8d952144dfe4c48c4762fe84684178cfe501`. `refreeze_label_counts: base 251, refrozen 251, retired 1, floor 250, missing 0`.

| Hållen grind | Mätt utfall på kandidaten | v3.12:s förväntan (härledd, exakt) |
|---|---|---|
| `platform-control-set-exit` | exit 1, **67/1**, `frozen_artifacts_identical_to_dae90c8f` (`problems=['verify/bin/h-035-exit']`) | exakt den raden och den sökvägslistan; sju produktrader gröna |
| `launch-cwd-exit` | exit 1, **19/20**, `frozen_verify_bin_identical_to_base_383ed387` med refreezen i `problems` | exakt den detaljen |
| `platform-governance-exit` | exit 1, **67/3** (g6, g7_launch_cwd, g7_platform_control_set) | exakt de tre, nästlad detalj `pass=67 fail=1 fails=['frozen_artifacts_identical_to_dae90c8f']` |

På den refreeze-fria baslinjen mättes samma tre till **68/68 (grön), 19/20 och 68/2** — v3.10:s stränghet oförändrad.

**Not om fixturen.** v3.11:s acceptansfixtur `89ec9ddb` gäller inte längre: v3.12 kräver den deklarerade
pensioneringen, och en första omskrivning av deklarationen (`4a9882f6`) föll dessutom på
`f2_tree_wide_no_web_governance_reference_outside_frozen_evidence` — deklarationsfilen är **aktiv spårad text** och
fick inte namnge det retirerade dokumentet i sin motivering. Kontraktet fångade alltså sin egen fixtur. Den slutliga
fixturen `61adaf6c5495367d6ffe64885c9bead6803d6f5d` har en motivering som beskriver pensioneringen utan att namnge dokumentet.

### F9 v3.12 — negativer
**26 fall körda, 24 negativer fångade, 2 falskt-röda prov gröna, 0 riggfel** (`ok 26 of 26`). Var och en i egen
replika av v3.12-acceptansreferensen, statiskt `--skip-held-gates`, nämnare 132, referens 127/5.

| Fall | Faller på | Mätt skäl |
|---|---|---|
| `n0_reference (acceptansreferensen)` | **127/5** — bara de fem sandlådeberoende raderna | — |
| `n17_toy_gate_honestly_run (**granskningens B1**)` | `f6_refreeze_keeps_every_base_row_label_…` (ENDAST den) | femradig grind, ÄRLIGT körd (`$PY -I -S -B`, exit 0, 25 PASS), kvitto ur den verkliga stdout:en: `251 base row label(s) dropped without a declared retirement` |
| `n18_receipt_inside_subject (**B2**)` | `f6_declared_refreeze_is_qualified_…` | `a qualification receipt may not lie inside the subject tree` — ospårad fil på `<subject>/SEPARATION-20260910/qualification-receipt.json` |
| `n19_label_dropped_silently` | `f6_refreeze_keeps_every_base_row_label_…` | en basetikett omdöpt utan deklarerad pensionering → `1 base row label(s) dropped` |
| `n20_second_retirement_declared (falskt-rött prov)` | **GRÖN** — ingen ny röd rad | samma etikett borttagen men DEKLARERAD pensionerad med skriven motivering |
| `n21_too_many_retirements` | `f6_refreeze_declaration_…` + `f6_refreeze_keeps_…` | fyra pensioneringar överskrider taket tre |
| `n22_retire_label_not_in_base` | `f6_refreeze_keeps_every_base_row_label_…` | `retired labels that the base gate never had` |
| `n23_retire_label_still_present` | `f6_refreeze_keeps_every_base_row_label_…` | `labels declared retired but still present in the refrozen gate` |
| `n24_retirement_exemption_smuggling (**granskningens A7/N1**)` | `f6_refreeze_added_lines_…` | styrningsprosa i en KOMMENTAR och en aktiv `human_only`-stoppfunktion — ingendera retirement-bunden |
| `n25_expected_pass_below_floor` | `f6_refreeze_keeps_…` + `f6_declared_refreeze_…` | `expected_pass 249 is below the per-gate floor 250` |
| `n1 … n16 (v3.11:s negativer, ombyggda på v3.12-referensen)` | samtliga på sina namngivna rader | odeklarerad byteändring, fel ny/bas-sha, inget kvitto, icke-grön grind, tillagd/borttagen fil under `verify/`, webbtext, tyst andra grind, två deklarationer, hållen grind deklarerad, fel förutsagt antal, kvitto från annan kandidat, manipulerad stdout, deklarerat-men-oförändrat, produktsidoeffekt |


**F7-domarnas exakthet, omkörd på v3.12:s källa:** **13 av 13** fall som förutsagt (samma harness som i v3.11).

### Grind v3.12
`verify/bin/platform-separation-final-exit` sha256 `c501e8fc3768778e01a6dc0da3eb490d5d0a756effcf766f807e89a7dc8edd27`, 4076 rader, **132 rader-i-utfall**,
commit `09f0ea6dde40e9b61a0be9c56aa352e19c47dfc3` (träd `6eaacb63b97a98410ed4512207a5e51462f3b410`).

### Builder / kvalificering
(fylls i efter produktkörningen)

### v3.14 — H036 aktuell produktgeneration, kontraktsförberedelse 2026-09-12

Basen är `531d37e594410d80d3d07975b8331715dd2508b0`. Historiska hållna baser,
proveniensbytes och scan-gränser ändras inte. Endast H036 är nästa deklarerade refreeze.
TEST_AUTHOR skriver H036-grinden, separationgrinden, detta dokument och deklarationen;
BUILDER får endast rätta launcher-digesten i `config/python-runtime-authority-v2.json`.
Launcher och helper hålls byteidentiska med basen. Specens tre produktpaths och taskrad
ändras inte. Config ingår inte i F6:s bytefrysning: inget undantag införs.

`--current-product CANDIDATE_SHA` är aktuell återkvalificering av den befintliga produkten.
Grinden binder exakt commit (inte tagg), basens ancestry, ren HEAD/index, objekt–disk,
modes och exakt kontraktsdelta plus configrättningen. Före BUILDER tillåts basens config
som identitetsbundet RED-subjekt; dess gamla launcherhash fäller configraden och inga
effekter körs. Därefter får endast den enda digestens exakta ersättning förekomma.
Inga andra produktbytes eller produktpaths tillkommer. Kontraktsfilerna är oberoende
granskad grindinput, inte builderauktoritet; deras held-hash binds vid kvalificeringen.

Den historiska PINNED_UNCHANGED-mängden, H034-objekten och H036:s publicerade produkt
ändras inte. Aktuella konsumentbytes binds separat till basen. De historiska dokumenten
läses från redan bevarade exakta gitobjekt; H039-absens gäller objektet för H036:s
registry-refreeze, inte dagens träd. Detta bevarar tidsordningen utan historisk runtimecredit.
Historiska `--product`, `--reference-host` och `--registry-v3-refreeze` behåller sina vägar.

Efter positiv identitet och samtliga statiska kontroller körs oförändrad `subject_effects()`
och hela `run_subject_matrix()`: kopplad launcher/profil/protokoll, sessioner/capabilities,
descriptorobservation, miljö, replay/alias-negativer, livscykel, supervisorbortfall,
Git-undantag, andra privata runtimepositiven samt pycache/runtime-restkontroll. Ingen
historisk registry-PASS, referensvärd eller producentmarkör kan ersätta dessa effekter.

Kvittots faktiska argv ska vara exakt `[PYTHON, "-I", "-S", "-B", ABSOLUT_SUBJEKTGRIND,
"--current-product", CANDIDATE_SHA]`; kandidatargumentet är samma som subject_head och
körd HEAD. Gatehash, deklaration, faktisk stdout/hash, exit och radräkning binds som tidigare.
Kvitto ligger utanför subjektet. Ingen suffixgenväg eller ometiketterad historikkörning godtas.

Fokuserade negativfall: fel SHA/tagg/HEAD, dirty eller indexflaggat subjekt, mode/symlink,
ytterligare produkt-/kontraktsdelta, configändring utöver digesten, gammalt configdigest,
fel argv/kandidat/gatepath, gammalt kvitto och utebliven/felande effektmatris. Positiven kräver
verklig separat BUILDER-rättning och den fulla verkliga effektkörningen på slutkandidaten.
Noarg-vägran i produktfas är befintlig; denna lokala kvalificering ger inte ordinarie
task-/bootstrapcompletion eller supervisor-resume. Kopplingen till den ordinarie vägen återstår.

Status före körning: H036 aktuell fullacceptans NOT_RUN; röd baslinje NOT_RUN;
produktändring NO; fullgrindar körs seriellt efter effektgranskning, inte av denna not.

Fokusprov 2026-09-12: `PYTHON -I -S -B
/private/tmp/nortropic-v313-contract.Fq5ueV/v314-focused.py`, exit 0 på H036
`95be612be7e0d48b281a0ea7552e6bb774792b0a0f6340f91791f53c29be4194`:
71 statiska PASS/0 FAIL; 13 virtuella identitetsfall; 8 exakta argv-fall; fel historiskt
digest avvisat; dålig Git-identitet avvisad före repoidentitet. Både återinförd historisk
fil och ytterligare H-grindändring avvisas. Added-line-scan 0 träffar, basetiketter 27,
nya 30, saknade 0. Matris, subject_effects, historisk produktidentitet och config-orakel
är AST-identiska med basen. Detta är focused-resultat, inte en full grinds PASS.

Deklarationens 74 är prediktion: mätta 71 statiska rader + identitet + config + matrisens
sammanfattningsrad. Oförändrad config förutsägs ge 72 PASS/1 FAIL (configraden), exit 1,
utan runtimeeffekter. En riktig grön produkt måste ge 74 PASS/0 FAIL, exit 0, med matrisen.
Den enda avsedda configersättningen ger sha256
`92f84d8f909bdded186c2db8b8e98f4c79e3f9f5e16c53100f7e005641a183f9`;
den är endast härledd/provad i minnet, inte skriven av TEST_AUTHOR.

### v3.15 — H037 historiskt genomförd, 2026-09-12

Bas `03a364bf248b99d4959cbfc3771c12dd33021b65`; H036 och samtliga hållna grindar
är orörda. Endast H037 deklareras. Spec, produkt och aktuellt register ändras inte.
Noarg verifierar uttryckligen historisk completion, aldrig en ny registerprodukt.

Nuvarande kandidat binds till exakt fyra kontraktsfiler, ren fysisk commitidentitet
och fortsatt frånvaro av de historiska sökvägarna. Historisk parent är
`3560d61c0121d9156c95d3839d6cff3987e0070d`, produkt är
`ee84b206a5fc755e0c708153559da6c4ec8df55e`; övergången är exakt en registertoken.
Sviten binds vid `0a677d8fb0f022c09d003b1ef1d2b11b475fe060` och
`42c20b3069216218f28b3ca3ff9de7989ebc1f79`; fixtures-trädet binds vid
`c296566f70dcfbca6b8e9ddc6789e41d66162772`. Historiska pins får ingen ny mening.

Den byteidentiska historiska grinden bevaras som källa. En uttrycklig exekveringskopia
tar bort exakt åtta `--force` från disponibla kontrollfixturers checkout-anrop. Den enda
avsiktligt nedsmutsade specfixturen sparas före append, valideras efter det redan
observerade skip-worktree-negativprovet och återställs till exakt sparade bytes före
vanlig checkout. Inga andra källändringar görs. Arkivhash, antal ställen (8 + 1 + 1),
exakt transformation och körhash binds;
detta påstås inte vara oförändrad arkivexekvering. Kopian kör verklig `--product BASE CANDIDATE`
i en separat lokal objektreplika med egen Git-state. Befintliga identitetsnegativer,
real-preflight och check/run-refusal bevaras; sviten är hashkontrollerad data och
körs inte som produkt. Ingen artefakt återförs till dagens aktiva träd. Alla 21
gamla etiketter behålls, med två nya kontroller för dagens subjekt före/efter.
Historisk stderr, fel exit, riggfel, saknad terminal eller fel antal kan inte bli PASS.
Nuvarande subjeks-SHA och historisk SHA hålls åtskilda. Kvitto avser dagens körda
omfrysning; `H037_CREDIT=HISTORICALLY_COMPLETED_ONLY` begränsar dess innebörd.

Effektyta: endast grindens nya `/private/tmp/h037-historical-completion-*`-rot och
de redan befintliga historiska kontrollfixturerna. Objekt exporteras med pinnad Git,
utan nätverk eller delad index/worktree; eget nytt repo importerar endast den exakta
historiska closure-mängden. Yttre fixtur och stdout/stderr/argv bevaras, även vid fel.
Ingen fullkörning har gjorts här. Förutsagt antal är 40 (38 historiska + 2 aktuella),
inte bevisad PASS. Fokustester och seriell fullkörning föregår kvalificering.

Prefreeze-fokus 2026-09-12 (ingen fullkvalificering), faktisk körning med pinnad Python och `-I -S -B`:
`/private/tmp/nortropic-v313-contract.Fq5ueV/v315-focused.py`, exit 0.
H037-källhash `7a458cf8494d2e8cee87029b887495412b1e79cba0060b3296bc53794d574be2`.
Verkliga historiska objektskontroller godkända; 10 resultatfall (inklusive fel etikett,
duplicerad rad, stderr, exit och terminal), fyra nuvarande identitetsfall, fel historisk
commit/graf/digest, muterat arkiv och Git-vägran före repoåtkomst gav förväntade resultat.
Alla äldre funktioner utom dispatch-main är AST-oförändrade; projektionen av arkivet
tar bort exakt åtta argument och har hash
`8be5a7445f14b0cc6e439001e43708df817c2f6d35b7493823edbf73de00ee96`.
Added-line-scan 0 träffar; 21 basetiketter, 23 nu, inga saknade.

Den gamla registerläsaren på dagens bytes ger mätt `unfrozen register bytes:
9752d01d4128b3fb86488875f2dac3685db51985bc2592544de97f36ffd7ee53`.
Det är generationsdrift för en redan genomförd historisk produkt, inte en ny saknad
implementation. Full H037-körning/ny baslinje NOT_RUN här; ingen BUILDER-produkt beställs.

Granskningen belade därefter att en vanlig checkout av samma träd lämnade den
avsiktligt nedsmutsade specfixturen kvar. Prefreeze `7a458c…` och exekveringskopia
`8be5a744…` är därför bevarade förstadier utan kvalificeringscredit. Den minimala
rättningen ovan sparar/validerar/återställer endast denna fixtur efter observerad vägran.

Omkörd fokus med samma kommando, exit 0 på H037
`12ef5f55386a9f68e1b5019d52555d1573e2356408bf584e1a038d09e1d86045`.
Ny exakt exekveringskopia:
`a9b19e8b78e464f640f5945adc595a8c69e370996ebcc81ff2220dc07cd7cfc6`.
Åtta flaggborttagningar och två single-site-ankare (save, validerad restore), inga andra
ändringar. Verklig minimal fixtur `/private/tmp/h037-ta-restore-72ak_mik` bevarad:
vanlig checkout gav `M specs/tasks.spec.json`, fysisk identitet avvisade den trots
skip-worktree, och exakta återställningen följd av vanlig checkout blev ren. Extra
oväntade bytes avvisades utan överskrivning och finns kvar i fixturen. Samtliga tidigare
fokusfall passerade igen, inklusive fel etikett/arkiv/graf och återinförd historisk path.
Resultat `v315-focused.12ef5f55386a.result.json` under samma temporära evidensrot.
Full historisk acceptans är fortfarande NOT_RUN; förutsagt antal 40 oförändrat.

### v3.16 — rättad H039-kontinuitet före implementation, 2026-09-12

TEST_AUTHOR-bas `536352ffea553bd097db14698c59199b4a89f6f5`; endast denna grind och
detta devdoc ändras före granskning. Den nya F4-raden kräver exakt en ersättning av
planens gamla H039-kontinuitetsblock (tidigare r193–198). Alla andra planbytes måste
vara identiska med den hashbundna basen, inklusive skyddade invarianter, verklig
H039-completion före efterföljande steg, målbild och rollflöde. Det är ett avgränsat
sakfel som rättas, inte ny taskmening, omkörningsrätt eller en svagare säkerhetsgräns.
Denna källbas hålls separat från framtida FROZEN_BASE-generationsökningar.

Originalkällor återlästa lokalt, med SHA256:

- `worktrees/h039-r33-installed-capture/installed-outcome.json`:
  `4419f24b85abef154113950574dabedb42675be934138fd0d150ba0291c85553`.
  Faktiskt `--r33-installed ed584ec3088c08005f99de1da825d083e350a8d2
  f0877daae8612f4c5b274ae4cc04bc1bd775c01a`, exit 0, 96249/0,
  `PASS_PRE_DIAGNOSTIC_OWNER_STOP_ONLY`, retry false, task_credit NONE.
- Oberoende installed-audit `worktrees/h039-r33-installed-independent-audit/RESULT.json`:
  `7b440d9dc545256842effc585618f7c043cdd3ab006a009a1d6be0441cf915d0`.
  Faktisk stdout: `f4e68424110226fedbbc5455acb929012e2ee7a195becfb000de8c5de9658911`.
- Förbrukad efterföljande diagnostik
  `evidence/bootstrap-supervisor/evidence/h039-r33-r15-live-diagnostic-outcome.json`:
  `efcc5fa541ecefbfa9a6d9566110a38a51e9b2f057c0a02357d6d96875028db6`.
  STORE_CHANGED_OR_UNPROVEN_OWNER_STOP, ofullständig capture, obevisat slutstate.
- `worktrees/h039-r33-postfailure-observation/observation.json`:
  `efdb56a797d3afa2c5976ace43500d98f3b0e006f61e7b97690c6144e4734fb6`.
  Sekvens 2 är tidigare observerad evidens, inte färskt live-state eller full policy.
- Protected-asset-B:s separata ofrusna grind:
  `aa9f5147d8d1192cc3353aec9a631cc234b58e31301f698334add1a866634183`;
  spec `28c25cf5a58f3a0c8c84ded340b618e9d562d7ef9a4be1fd9d3c1a4734fd7db1`.
  R33_LIVE_R2_FAILED_EVIDENCE är ett annat paket, bland annat felposten
  `69d6f9ce45efae6dc6e88dd2a9e4997fa4eb2da3afdabd1538b68edc45dd57a0`.

Sökvägarna ovan identifierar bevarad extern evidens under den orörda äldre arbetskopian;
de är inte nya spårade plattformsberoenden eller körinstruktioner. Källrättelsen
utför inte installer, diagnostik, task-attestation eller liveobservation och ger ingen
H039-completion. Det substantiella efterföljararbetet hålls separat.

Efter oberoende grindgranskning får BUILDER endast ändra:

1. `docs/loop/autonomous-loop-plan-platform-v2.md`: byt exakt OLD-blocket till NEW-blocket
   i grindens två PLAN_H039_CONTINUITY-konstanter, inga andra bytes. Resultatblob
   `c4f3a615e5e740ffee3c4cf8353969e3134d44f3`, SHA256
   `cb0f18a774637895d8240c323f46c2dfe9dfca2735119aa9fd2e863c0553080d`.
2. `scripts/nortropic-codex-autopilot.py`: ersätt exakt två planblobliteraler,
   ROADMAP_PLAN_BLOBS och selftest, från `8b234a8f951b41388f809561d443202011121986`
   till ovanstående nya blob. Ingen funktions-/kontrolländring.
3. `controller/verify/cli`: ersätt endast planpostens PLATFORM_DOCUMENTS-SHA256
   från `b2a0c1503f8863f379283ecf02cebee8002c07b87e60b8305794258b31a335e5`
   till ovanstående nya SHA256.

Handoff och övriga pinnar, spec, register, H-grindar, H039-underlag samt REFREEZE.json
förblir byteidentiska. FROZEN_BASE flyttas till 536352f; H037-deklarationen är då ärvd
historik, ingen ny H-omfrysning eller nytt H-kvitto ingår. Hållna grindar/baser ändras inte.

Alla befintliga F3/F4-effektprov står kvar: konsumenternas verkliga HEAD-blobbindning,
mutationsvägran även när en kopia/pin byts, autopilot-selftest och verklig
platform-prepare/check. Den nya raden hindrar felaktig plantext från att bli grön genom
enbart självkonsistent ompinnning. Prediktion: 133 totalrader; gamla plantexten ska fälla
endast den nya raden, rätt text med rätt konsumentpinnar ska kvalificeras av hela grinden.
Fryst full RED-baslinje och positiv fullkvalificering är ännu NOT_RUN. Ingen plan- eller
pinimplementation är gjord av TEST_AUTHOR.

Fokus 2026-09-12: pinnad `PYTHON -I -S -B
/private/tmp/nortropic-v313-contract.Fq5ueV/v316-focused.py`, faktisk exit 0 på grind
`fabc7a1f7c0e6de32e80f61c794f806027cede3bae59c1d72d3a13dae346d4f6`.
14 in-memory-fall gav förväntade utfall. Det extraherade faktiska F4-blocket gav
FAIL på den orörda planens gamla kontinuitet; korrekt ersättning passerade predikatet.
Förnyelse, taskcredit, paketsammanblandning, falskt färskt state, förtida B-READY,
gammal text i kommentar och ändringar i övriga planbytes avvisades. Scan 0 träffar.
Alla äldre funktioner samt main minus just den nya kontrollen är AST-identiska;
exakt ett ovillkorligt check-anrop tillkommer. EXPECTED_ROW_COUNT är mekaniskt 133.
Detta är inte fullgrindens RED eller PASS; den seriella frysta baslinjen återstår.

### H039 lokal asset-förberedelse på 8095d947 — NOT_READY, 2026-09-12

Denna förberedelse preciserar kriteriet före produktarbete; den fryser ännu ingen
körbar acceptans. Basen är `8095d947c83202e2b87801531d9f7cb1457c8719`.
Den aktiva plattformsplanens H039-funktionskrav och begränsningar består.
Bevarad protected-asset-B återbrukas som ofruset underlag, inte som aktuell grind
eller som R33_LIVE_R2_FAILED_EVIDENCE. Historiska körningar förblir förbrukade.

Potentiell TEST_AUTHOR-yta för det sammanhängande lokala kontraktet är exakt:

1. `verify/bin/h-039-exit` — framtida avgränsad asset-lane, ingen gammal live-dispatch.
2. `specs/tasks.spec.json` — ett lokalt asset-member i befintlig H039-rad.
3. `verify/bin/platform-separation-final-exit` — endast nödvändiga exakta
   spec-/produkt-/kvittobindningar för denna lane, inga generella undantag.
4. Detta befintliga utvecklingsdokument — kriterium, effekter och creditgräns.
5. `SEPARATION-20260910/REFREEZE.json` — en H039-deklaration först när grindens
   bytes, faktisk argv och mätbara antal är stabila.
6. `controller/verify/cli` — endast `PLATFORM_SPEC` för de exakta specbytesen.

Den första preparatoriska delen ändrar endast dokumentet, det passiva spec-membern
och dess konsumentpin. Befintliga specfält bevaras byte-exakt; borttagning av exakt
det tillagda memberblocket ska återskapa hela basens spec. H039:s ordinarie
`allowed_write`, fem owner-product-paths, `exit_test`, beroenden och historik ändras
inte. Register, core, gamla dokument, aktiva plan-/handoffbytes och produkt är orörda.
Den frysta separationsgrindens F3-specfrys får därför ännu inte förväntas vara grön;
ompinnningen är ingen kvalificering och kringgår inte denna återstående kontraktsyta.

Prospektiv BUILDER-yta för asset-only är fyra befintliga M-paths med samma modes:
`controller/runtime-cleanup/install`, `controller/runtime-cleanup/native/mediator.c`,
`verify/h039/build-recipe.json`, `verify/h039/identity-manifest.json`.
`verify/h039/runtime-cleanup-mediator` förblir byte-/mode-identisk. Produkten är en
inert carrier, inte en installer: exklusiv containergren med endast return 2,
separat adaptergren, historisk källa i utesluten gren; de två bundna payloads ligger
i readonly, icke-exekverbara sektioner. Inga nya spårade produktpaths tillkommer.

Positiv acceptans ska förena faktisk autentiserad commit-/träd-/diskidentitet och
exakt fyrfilsdiff med oberoende verkligt byggmaterial, reproducerad adapter/container,
entry-/IR-/Mach-O-/payloadsemantik och kanonisk recipe-/manifestbindning. Återanvänd
B:s kausala materialprov: samstämmigt ompinad felrecipe, återförseglad felbehörighet,
korsad payload, aktiv installer-entry, blandade selectors, fel parent/mode/extra path
och ändrad femte runtimepath ska fällas av respektive verkliga predikat. Generisk
hashavvikelse, riggfel eller enbart modellrapporter får inte ersätta sådan effekt.

NOT_READY kvarstår tills faktisk observerad graph/numstat, produktbudget från rätt
material, kausala attributfixturer, sammanhängande dispatch och genuin preproduct-RED
har mätts och granskats. Inga antal eller budgetar gissas. B:s byggpreflight kräver
21474836480 fria bytes före skapande och varje lane; gränsen sänks inte till aktuell
disk. Sparad kompilering är underlag, inte denna kandidats kvalificering. B:s adapter
avser CPython 3.9.6; den bevisar inte gate-Python 3.12 eller faktisk consumer-ABI.

Högsta framtida asset-dom är `PASS_ASSET_BUILD_ONLY_NOT_H039_PASS_OR_ATTESTATION`.
Ingen noarg-PASS, task-attestation, downstream-readiness eller supervisor-resume
följer. Inga native loads, listener queries, installationer, root-/runtimeeffekter,
kvittoläsningar/-skrivningar, sekvensövergångar eller återförsök av förbrukade lanes
ingår. En operativ efterföljare behöver även den femte befintliga runtimeprodukten
och verklig consumer-/loader-/ABI-/kvittolivscykel; asset-PASS löser inte den delen.

Källankare för återbruk: B-grind SHA256
`aa9f5147d8d1192cc3353aec9a631cc234b58e31301f698334add1a866634183`,
B-spec `28c25cf5a58f3a0c8c84ded340b618e9d562d7ef9a4be1fd9d3c1a4734fd7db1`,
adapterns `consumer-integration-spec.md`
`bea33a27c0a2d27b3d032cafa657de4d0b917919772e30dfc72fa91a8b5b91be`.
Dessa är bevarade externa underlag, inte nya aktiva filberoenden. Seq2-observationen
och förbrukad installed-/diagnostikevidens identifieras i v3.16-avsnittet ovan.

Nästa ofrysta tranche inför samma framtida lokala asset-dispatch, inte en sidogrind:
`--asset-contract CANDIDATE_SHA` och `--asset-product CONTRACT_SHA CANDIDATE_SHA`.
Noarg och samtliga gamla selectors vägras före Git. Hela ursprungliga R33-källan
bevaras byte-exakt utanför ett enda prefixblock; ingen historisk import nås.
Kontraktsrelationen kräver exakt sex ändrade befintliga paths mot 8095, produkten
exakt fyra mot kontraktet med alla andra blobbar/modes kvar. Samma kontrakt/kandidat
i produktanropet är endast en uttrycklig produktlös RED-baslinje, aldrig en produktgraf.

Actual reference-numstat är nu mätt av pinned Git: source168/0, recipe282/84,
manifest75/52 och installer -/-, totalt525/136/661. Resultat-SHA256
`28bc544a5880adf44e4108595452f3922b5f9c727106e76112dfaf77ad6ed877` binder två små
fempaths-träd med Myers och indentHeuristic=true, utan attribut. Detta råkade motsvara
den äldre SequenceMatcher-modellen men bevisar inte full repograf, attribut eller ny build.

Den första enkla read-only-observern i hållpunkt4601259e var otillräcklig och kördes
inte. Den är nu borttagen, ersatt av B:s retained/raw-object/attribute/config/postauth-
kedja. Fem helpers (`git_config_exact`, `git_records`, `retained_read`, `close_owned`,
`acl_empty`) återbrukas ordagrant. Inga repoanrop från den nya porten har ännu körts
eller kvalificerats. Källan är fortfarande ofryst, inte en positiv acceptansdom.

Observerportens begränsade ändringar mot B:

- Sex aktuella plattformspaths ersätter den historiska kontraktsytan.
- Samma invokation med HEAD=P autentiserar råa commit-/trädobjekt för B8095, C och P,
  exakt B→C med sex M-paths och C→P med fyra M-paths. Föräldrarna måste vara direkta
  och separata. P=C kontrollerar endast kontraktskanten och kan inte få produktcredit.
  Attributkälla binds till just den autentiserade högersidan av respektive kant.
  HEAD läses utan taggpeeling; kandidaternas råa objekt måste själva vara commits.
- Två slutna read-only-operationer tillkommer: `ls-files --stage -z` och
  `status --porcelain=v1 -z --untracked-files=all`. Ingen fri argv eller ny Gitwrite.
- Kandidatens alla spårade diskbytes/modes och index binds till objektkartan genom
  samma retained `open_member`, inklusive NONBLOCK/nofollow, och hålls genom samma
  finally. Konfigurations-, HEAD-, index- och diskbytes kontrolleras igen före close;
  primärfel och samtliga postauth-/close-fel bevaras även i main:s riggutdata.
- Myers/indentHeuristic=true görs uttryckliga. B tillät ingen config som bytte dessa
  standarder, men den verkligt körda lilla referensmetoden band uttryckligen denna
  policy. Ny port måste mäta sina egna numstat under samma policy; det historiska
  referensresultatet ersätter inte ett nytt kandidatprov.

B:s återbrukskedja har ett faktiskt separat syntetiskt metodprov, result-SHA256
`d1163546ccd93d71d1648f98b78f418bdf091b0360f1313df909727562df4fc7`:
positiv4M73Git-anrop, committed-attributvägran46 före diff, untracked-attributvägran0,
fel config1stdin-konfigurationsanrop och inga repoanrop. Detta kvalificerar varken
den tvåkantade porten, dess nya disk/indexled eller en aktuell H039-produkt.

Identiska basproduktbytes ger `ASSET_REPRESENTATION_ABSENT`; rätt referenshashar ger
fortfarande NOT_READY. Återstående positivkedja är faktisk immutable observer/graf,
fulla återbrukade material-/reseal-prov, kausala attributkontroller och exakt kvitto-
koppling. F3/F6 och REFREEZE är oförändrade tills detta hänger ihop; inget antal eller
generiskt RED-undantag införs. H036:s historiska74/0 på03a är inte bevis om denna kandidat.

#### Ofrysen materialkoppling efter faktisk tvåkantsmetod

Portens separata syntetiska callable-metod har nu faktisk result-SHA256
`072ee9434d7ff9fce6101cd97ce3e6a33c061bf309cec9616b53bf1d3ffc48e3`:
8/8 förväntade utfall, 5022 Gitstarter inklusive setup, 42.94 sekunder, 34240 KiB.
Detta är metodcredit för tvåkanter/disk/index/postauth, inte ett fryst kontrakt,
en riktig produkt, färsk byggning eller gate-PASS.

`h039_local_material_binding` använder samma slutförda observers basblobbar,
trädkartor och bundna diskbytes. Kontraktskanten behåller de fyra basprodukterna;
kandidatens materialmodes/blob-OID/diskbytes korsbinds och retained runtime binds
till samma oförändrade objekt på B/C/P. Detta gäller bara asset-underfasen.
De 13 rena B-definitionerna unique_object, reference_source, reference_recipe,
actual_layout, actual_signature, actual_macho, actual_material,
actual_reseal_control, product_recipe, product_manifest, product_budget,
product_material och product_controls kopieras ordagrant från B SHA256
`aa9f5147d8d1192cc3353aec9a631cc234b58e31301f698334add1a866634183`.
Ingen B-import, driver, native loading, extra argv eller extern referenspath införs.
De 29 produktkontrollerna omfattar koherent ombundna och omslutna negativa prov;
reseal är endast in-memory kontrollkonstruktion, aldrig produkttransformation.
B:s SequenceMatcher-budget är fortsatt en separat ren editmodell. Observerns
faktiska Myers/indentHeuristic=true-numstat är ett annat krav, inte härlett ur den.

CLI överför inga byggutdata eller adapterkällor och har fortfarande ingen positiv
acceptansväg. Kodgrenen för oförändrade basprodukter ger ASSET_REPRESENTATION_ABSENT;
detta är inte ett körresultat från aktuell main/preproduct-RED, som är NOT_RUN.
Saknade oberoende byggindata ger NOT_READY. Historiska utdata kan pröva den rena
kopplingen men ger uttryckligen ingen färsk bygg-/proveniens-/gatecredit.
En framtida freshbuild ger inte ensam gatecredit. B build_reference:s
`active_external_same_uid_consumption_provenance=UNPROVEN` och
`MEASUREMENT_ONLY_NO_GATE_OR_PRODUCT_CREDIT` förblir ärliga begränsningar.
Den första är däremot inte ett universellt krav på denna build-only-lane:
B-specens build_consumed_input_binding/build_threat_boundary avgränsar uttryckligen
serialiserat arbete utan auktoriserad samtidig same-UID-writer. Det starkare
hotfallet för senare loader-/consumerarbete får inte importeras som ett nytt
generellt byggblockerande krav. Färsk sammansatt materialleverans under denna
skrivna bygggräns samt F3/F6/kvittokoppling återstår före freeze.
Ingen textreceipt ersätter dessa effekter. Spec/PLATFORM_SPEC, F3/F6 och REFREEZE
ändras inte i denna materialtranche; tung byggning behåller 20 GiB-golvet.

#### Första build-only-sammansättningen — hållpunkt b921f5a5, ingen byggkörning

Kriteriet är befintligt material_criterion: två oberoende byggrotars exakta bytes
ska reproduceras och föras till samma observer-/materialpredikat. Det är inte
ett nytt hotkrav och ändrar inget historiskt build_hardening-fält. Den gamla
operativa installer-/runtime-receptkedjan ersätts inte av asset-receptets O0/
macOS14-container; den femte runtimefilen förblir exakt retained input.

Ny ren h039_local_rebuild_binding kontrollerar två exakta tiopaths-outputkartor,
kräver bytes per output och full byteidentitet mellan rötterna och anropar därefter
oförändrade B-material-/reseal-predikat genom nuvarande materialkoppling.
Den avvisar saknat/extra output, fel typ, en ändrad rebuildbyte samt samstämmigt
felmaterial. Den kan inte intyga att en kompilator startade. Main är fortfarande
icke-positiv och anropar inte denna nya callable. Spec/PLATFORM_SPEC behöver ingen
ändring för detta redan allokerade reproducerbarhetskrav; F3/F6/REFREEZE lämnas kvar.

En tidigare föreslagen fristående metod skulle anropa B:s build_reference från
pinnad aa9f5147-källa, med endast utvalda AST-definitioner laddade (aldrig B:s module entry,
main, runpy eller import från B). Den anropningen förblir MEASUREMENT_ONLY. Dess
preflight upprepas internt, inte från en rapport: source/runtime läses med B:s
retained_read från de fortfarande oförändrade basprodukterna i den enda TA-ytan,
adapter från den separat hashbundna listener_adapter.c. Detta är en metodfixtur,
inte senare C/P-kvalificering: B:s repo-relative preflight får inte återanvändas
mot en produktdisk där mediator.c redan har bytts mot den genererade containern.
Den slutliga interna porten måste i stället materialisera basbytes och retained
runtime från samma autentiserade observers minnesfakta, med separat pinnad adapter.
Den fristående metoden är uttryckligen DEFERRED/NOT_RUN, inte en förutsättning
eller rekommenderad byggutgift: ny reproducerbarhet med syntetiska faktakartor
sluter inte den faktiska acceptansvägen. Scriptet h039-local-fresh-build-composition-method.py
SHA256 493c7a5594f7bb95455f1fdf0a772b8639425e4597eb55eb60e55603b1be3edd
bevaras som oförbrukat förslag; dess två argv är inte nya kommandon i grinden.

Metodens fasta käll-/indataberoenden:

- B-grind aa9f5147 (full SHA ovan); ingen historisk outputkatalog läses som bygginput.
- mediator.c 34142b6c7434c7e1f338e3788171086821e76d65fa4665e10d01412d2670a28b;
  retained runtime b874693a31e5255c3b71cbd9aa4bee4a12efd3a4bf03b62d4d86e4d9029f4bf7.
- /Users/elinhaggstrom/nortropic/worktrees/h039-listener-adapter-v1-candidate/listener_adapter.c,
  SHA256 a35dc310e05f7cf83d7175e5ee5ba3213e6a7433daaa7cc5dd25f9e92ff437fa.
- B:s exakta reference_recipe och compiler_envelope, inklusive samtliga verktyg,
  fyra header-/linkinventarier och deras återautentisering. SDK26.5/CLT21 och
  CPython3.9.6 ändras inte; ingen gate-Python3.12-/loaded-image-/consumer-ABI-credit.
- B-definitionerna compiler_envelope, retained_read, close_owned, acl_empty,
  inventory, wait_state, group_action, group_snapshot, bounded_command, preflight,
  build_reference och reference_source/reference_recipe återbrukas byte-exakt.
  Nya bridge/material-definitioner läses ur denna hållpunkt, aldrig ur kandidatdata.

Efter en färsk, slutförd driver hämtar metoden båda rotarnas tio outputbytes med
retained_read och respektive färska inventorydigest, jämför mot driverstorlekar
och varandra, och använder dem direkt i samma rena rebuild/material-predikat.
Inga receipt- eller gamla measurementfält kan ersätta de bytesen. Main/observer
körs inte i denna byggmetod: dess kartor är uttryckligt syntetiska, så rätt effekt
är endast färsk tvårotsbyggning plus ren materialkoppling, inte graf- eller gate-PASS.
Den senare accepterande porten måste förena faktiskt observerad C/P-identitet,
intern färsk byggning, outputpostauth och slutlig kontrakts-/kvittobindning i samma
invokation; en importerad metodrapport accepteras aldrig som bevis.

Resurs-/effektplan för separat granskning före körning: exakt två seriekörda lanes,
åtta fasta clang/ld-kommandon vardera under oförändrad deny-default Seatbelt,
ingen raw fallback och inga native outputstarter. Minst 21474836480 fria bytes
kontrolleras före skapande och varje lane. Varje kommando har 300 s deadline,
4194304 bytes sammanlagd capture och 67108864 bytes per child-regular-file;
ägd grupp följer B:s 10 s bounded cleanup, WNOWAIT-reservation och terminala
read-only PGID-frånvarokontroll. Okänt ägarskap betyder ingen signal/reap.
Två rootinventarier har B:s 2 GiB efterkontroll, inte en påstådd OS-diskkvot;
20 GiB-golvet får inte tolkas som en hård total-write-cap. För metoden planeras
högst 128 MiB bevarad normal output/capture plus 128 MiB reserv utöver startgolvet;
råstatus och bevarad rot kvarstår vid varje avvikelse. Ingen automatisk retry,
filcleanup eller signal mot främmande/okänt ägarskap. Separat effektgranskning ska
binda exakt script och verkliga preflightvillkor innan denna metod startas.

Same-UID-begränsningen är fortfarande UNPROVEN: 0700, retained FD, före-/efterhash
och två rötter bevisar inte universell uteslutning av en extern aktiv same-UID-aktör.
Serialisering är arbetsvillkoret, inte OS-bevis. Upptäckt störning/identitetsfel
underkänner metoden; ingen tillitsförsvagning eller loaderkvalificering följer.
Historisk B-mätning behåller sin ursprungliga MEASUREMENT_ONLY/NO-CREDIT-subjekt.

#### Gateägd supplier-port — ofryst källberedskap, faktisk byggning NOT_RUN

Nuvarande source kopplar samma --asset-product-väg till h039_local_build_supplier.
Noarg/gamla selectors vägras som förut. Kontraktsläge och produktlös P=C-baslinje
startar aldrig supplier; ASSET_REPRESENTATION_ABSENT ger samma exit1-kodgren före
byggning. På en observerad separat C→P-kant fortsätter en giltig materialsnapshot
från NOT_READY_FRESH_SERIALIZED_BUILD_COMPOSITION till den interna suppliern.
Även lyckad supplier lämnar main på exit2 med
NOT_READY_F3_F6_RECEIPT_AND_FROZEN_ACCEPTANCE. Ingen positiv acceptans är införd.

Källans anropskedja, inte ett faktiskt körresultat:

    befintlig --asset-product C P
      → observe + två autentiserade kanter + material-snapshot
      → build_supplier → build_preflight(samma facts)
      → två färska privata roots × åtta exakta bounded_command
      → retained outputbytes + rebuild_binding → material_binding → B-predikat
      → båda rotarnas slutliga inventory/postauth + ägda descriptor-close
      → NOT_READY_F3_F6_RECEIPT_AND_FROZEN_ACCEPTANCE (exit2)

Preflightportens enda materialförändring mot B är att bas-mediator hämtas från
facts.material[8095] och retained runtime från samma redan bundna facts.disk.
Produktens nya mediator.c läses aldrig som historisk byggkälla. Den oberoende
adapterns 6955 bytes ligger inert i grindens eget prefix (_LOCAL_ADAPTER_SOURCE),
byte-exakt a35dc310… enligt full pin ovan; reference_source verifierar denna pin.
Ingen extern adapterpath eller kandidatmanifest blir aktiv input-auktoritet.
Ingen adapterprodukt är nyimplementerad och ingenting laddas eller exekveras.

Sex saknade B-definitioner kopieras byte-exakt från aa9f5147: compiler_envelope,
inventory, wait_state, group_action, group_snapshot och bounded_command.
Tidigare retained_read/close_owned/acl_empty förblir oförändrade. Porten använder
samma pins/inventarier, deny-default-profil, två lanes, åtta fasta kommandon per
lane, source/runtime-materialisering, captures och ägd gruppstädning som B.
Preflight är intern och upprepas vid varje supplieranrop; ingen caller-attestation,
receipt, outputpath eller sparad measurement accepteras som substitut.

Driverdeltat läser varje av de tio nyinventerade outputs med retained_read,
sin färska digest och högst1048576 bytes, och jämför med den färska storleken.
Båda bytekartorna passerar den rena rebuild/material-kedjan. Hela varje rot,
inklusive inputs och captures, inventeras igen efter båda byggena och de rena
predikaten, medan rotens descriptor fortfarande ägs. Slutinventariet måste vara
exakt lika det först inventerade; close-fel underkänner även en väntande retur.
Även den autentiserade snapshoten förblir input till slutpredikatet; en osammanhängande
produkt får inte grönt för att de oberoende byggena lyckades.

Nästa meningsfulla färska byggprov ska avse denna exakta interna supplier på den
befintliga asset-product-vägen, inte det fristående B-scriptet. Före det behövs
oberoende source-/effektgranskning och koherent C/P-fixtur/kontraktsbindning; inga
inerta F3/F6/receipt-fixturer får beskrivas som fryst produktkvalificering. I denna
tranche provas endast rena predikat och orchestration med helt simulerade OS-,
inventarie-, verktygs- och child-effekter. Det ger ingen färsk bygg-, sandbox-,
cleanup-, native-, observer- eller gatecredit. Aktuell preproduct-RED är NOT_RUN.

Effektplanen för den senare faktiska invokationen förblir seriell: en supplier,
två roots, exakt16 bounded_command-starter, högst300 s per kommando plus befintlig
10 s ägd cleanup; minst20 GiB kontrolleras omedelbart före skapande och varje lane.
Source/runtime kommer från observerfakta, alla verktyg och headers återautentiseras
före/efter, outputleaf högst1 MiB vid leverans och child-filer högst64 MiB.
Inventariets2 GiB efterkontroll är ingen disk-kvot. Byggstart får inte planeras på
den tunna20 GiB-marginalen eller samtidigt med andra auktoriserade hostwriters;
en verklig metodreserv och två exakta precompile-reviews återstår. Inga filer
städas automatiskt och ingen förbrukad lane återöppnas. F3/F6/REFREEZE/spec/CLI
lämnas oförändrade, och ingen arbetsrapport kan förvandla denna källport till PASS.

Konkreta återstående separationsbindningar, lästa i oförändrad
verify/bin/platform-separation-final-exit: F3 jämför hela specblobben med
FROZEN_BASE 536352ffea553bd097db14698c59199b4a89f6f5 (omkring rad2914), så det
lokala asset-membern kan inte passera detta utan en exakt kontraktsreconciliation.
F6 härleder en statisk label-floor ur basgrinden, jämför expected_pass med denna
och kräver därefter kvittots exit0 och samma verkliga PASS-radantal (omkring
rad3716 och3814). Historiska labels som förblir bytebevarade men onåbara har
inte körts och får aldrig räknas som positiva asset-rader. F6:s argvkontroll har
bara en exakt H036-specialform; övriga kräver att sista argumentets basename
är gatefilen (omkring rad3821). Den accepterar därför inte --asset-product C P.
Nästa kontraktstranche behöver en minimal exakt H039 asset-lanespecifik
spec-/invokations-/resultatbindning med asset-only-ceiling, inte generella
undantag, gissade antal, nya receiptscheman utan prov eller H039-taskcredit.
Ingen av dessa F3/F6/receipt-ändringar har gjorts i suppliertranchens source.

### H039 nästa källtranche: exakt underfas och ägd kvalificeringscapture (2026-09-12)

Detta avsnitt beskriver efterföljaren till det bevarade supplier-hållet
aee154f8/dcd1fb68, inte en ändring av dess historiska resultat. Föregångarens
sex kontraktbytes och separata tester bevaras i den befintliga evidensytan
/private/tmp/nortropic-v313-contract.Fq5ueV. Produktens fyra filer och den femte
retained runtime-filen är orörda. ROLE=TEST_AUTHOR; SOURCE_NOT_READY;
ACTUAL_COMPOSITION=NOT_RUN; FROZEN_GATE_READY=NO; PUSH=NO; MERGE=NO.

Källan definierar nu hela den villkorade build-only-domen, utan en extra senare
enablement-edit. Det betyder inte att den har körts, granskats färdigt eller
frysts. H039:s historiska R33-suffix är fortfarande byteidentiskt och onåbart.
Noarg/förbrukade selectors vägras. --asset-product kräver olika C/P; P=C är
inte längre en alternativ produktselector. Produktlös C provas med den redan
befintliga --asset-contract C och ska ge exakt komplett frånvaroterminal/exit1
utan supplierstart. Ingen task-completion, attestation, installation, native
laddning, query eller runtime-diagnostik blir tillåten av en asset-only-dom.

REFREEZE har en smal typad h039_asset_build_only-post, samma bytes i C och P.
B är8095d947; C har en enda förälder B och ändrar exakt sex kontraktvägar;
P har en enda förälder C och ändrar exakt fyra produktvägar. Fulla kartors
medlemskap och moder ska vara oförändrade. Ingen C-hash krävs inne i C och
inget H039-pin pekar tillbaka på aktuell final-exit. Final-exit håller i stället
en oberoende H039-källpin; en leksaksgrind med egen omhashad deklaration avvisas.
F3 tar bort en enda exakt kanonisk lokal asset-member och kräver därefter hela
B-specens ursprungliga bytes. PLATFORM_SPEC måste fortfarande binda den faktiska
hela specifikationen. Extra sibling inuti borttagningsspannet accepteras inte.

F6 använder exakt EN final-exit-ägd H039-invokation som resultatkälla. Den tar
inte ett andra bygge för att replay-certifiera ett caller-kvitto. Den befintliga
--refreeze-receipt-kompatibiliteten för andra grindar är oförändrad; ett H039-
caller-kvitto vägras i denna underfas och kan aldrig ersätta actual capture.
F3/F6:s H039-gren kräver full B/C/P-relation och den oberoende källpinnen före
invokationen. Redan röda förkrav startar ingen dyr supplier. Okänd kvarlevande
owner eller icke-kanonisk/partiell child-terminal avbryter före följande effekter,
bevarar captures och ger ingen automatisk retry.

Resultatets wire är exakt en kanonisk ASCII-JSON-rad med H039_ASSET_RESULT,
tom stderr, rätt faktisk exitkod, fas, B/C/P, aktuell observerad grindhash,
complete=true, unika ordnade obligatoriska radidentiteter och polariteter.
Kontraktsformen innehåller fem faktiskt passerade gemensamma predikat samt
asset_representation=false. Produktformen innehåller samma fem, sex genomförda
produkt-/byggpredikat och alla29 namngivna rena kausalkontroller på levererade
bytes. Dessa schemaantal är inte uppmätta PASS-radantal och ersätter aldrig
effekterna. Final-exit räknar inga bevarade men onåbara historiska check-labels
som körda. Produktens fyra byteundantag medges bara efter full positiv asset-
capture; ingen femte runtime-, medlemskaps- eller modeavvikelse undantas.

Oförändrad held control-set-grind rapporterar på ett sådant P dessutom två
ändrade katalogträd, i ordningen verify/h039, controller/runtime-cleanup,
före H-grindarnas filnamn. F7 förutser exakt denna ordnade effekt endast för
kvalificerat fyrvägs-P. Launch-cwd har inget katalogundantag. Samtliga tidigare
held-radidentiteter, produkttester, röda polariteter och governancevillkor kvarstår.

Anropskedjan i källan, inte ett genomfört körbevis:

    final-exit: exakt deklaration + B/C/P + spec + oberoende H039-pin
      → en ägd capture av pinned Python -I -S -B h-039-exit --asset-product C P
      → H039 observer: raw-object/full-map/disk/index/tool/postauth
      → samma snapshot till supplier och autentiserade B/runtime/adapterbytes
      → två privata lanes × åtta exakta sandboxade bounded_command
      → retained outputs + byteidentisk rebuild + material/29 kausalkontroller
      → kompletta slutinventarier + samtliga ägda descriptor-close
      → komplett asset-only-terminal → F6/F7:s smala konsekvenskontroller.

SIGTERM/SIGINT latchar endast första signalen. Ingen asynkron raise får ske i
Popen→process/ownership-tilldelningen. Safe checks finns före spawn, i ägd
compilerloop, mellan kommandon, i observer, preflight, retained reads och
inventarieiterationer. De existerande WNOWAIT/group-snapshot/killpg-before-reap/
terminalabsence-stegen ligger kvar i finally och innehåller ingen cancel-check;
upprepade signaler avbryter inte den städningen. Final-exits dedikerade owner-
capture har7200 s till cooperative cancel och60 s grace, fortsätter drain/wait,
och dödar aldrig owner blint medan separata compilergrupper kan finnas.
Grace expiry eller ägarskaps-/IO-fel lämnar uttryckligen
NOT_QUALIFIED_PRESERVED och eventuell owner-PID/inner-lanes UNRESOLVED.
Enbart direktchildens exit är aldrig bevis för att innergrupperna är borta.
Spärrade systemanrop antas inte vara bevisat ändliga. Captures samt disposition
sparas under den ordinarie final-exit-fixturroten även vid avbrott. Tidspolicyn
är ingen total disk-kvot;20 GiB-golvet före skapande/varje lane sänks inte.

Fokuserad evidens är separata pure-/mockskript i samma evidensyta:
h039-phase-result-contract-test-first.py (schemaförväntningar före implementation),
h039-phase-bindings-test-first.py (fullmap/spec-negativer före implementation),
h039-cancellation-test-first.py (latch/source-säkerhetsgränser),
h039-owned-capture-test-first.py (helt mockade process-/signal-/capture-effekter),
h039-phase-supplier-mocked.py (in-memory supplier plus producent/konsumentschema)
och h039-phase-final-binding-focused.py (pinnar/deklaration/metadata/F6-effektmock).
De provar bl.a. toy/omhashad deklaration, falskt/crossed/partiellt kvitto/resultat,
extra spec/runtime, read-induced atime utan falsk drift, ändrad säkerhetsmetadata,
EOF-before-exit, cancellation, captureoverflow, okänd owner och bevarade captures.
De kör INTE actual observer, compiler, native ACL/groupquery, signaler eller
fullgrind. Metadataidentitet utesluter atime men behåller dev/ino/mode/UID/GID/
nlink/size/mtime_ns/ctime_ns/flags. Actual lifecycle-förmåga är ännu NOT_RUN.

Exakt återstående ordning: håll sex källfiler/pinnar och resultat oförändrade;
oberoende source/effectreview; separat effektgranskad liten real-OS-lifecycle-
metod med högst åtta seriella självterminerande inerta Python-stimuli och
tydligt test-only argv-byte/tidsförkortning; därefter autentiskt C-preproductprov
och slutligen en verklig final-exit-ägd kvalificering av builderns exakta C→P.
Den lilla metoden är inte acceptans, Seatbelt/clang-prov eller produkt-PASS.
Det dyra fristående historiska B-reference-bygget är uttryckligen uppskjutet
och ingen prerequisite. Inför riktig supplier krävs färsk resursmätning och
verklig metodreserv, serialisering utan annan auktoriserad hostwriter och de
oberoende effektgranskningarna. Inget sådant prov har körts i denna tranche.

### H039 snäv normativ fasordning efter R4-lifecycleprovet (2026-09-12)

Det tidigare hållet775b921d/748b2c63 med specbc5c1050 och dess testrecords är
bevarat oförändrat. Detta är en separat TA-precisering inom samma sex vägar,
inte en produktändring, commit, accepterad kontraktsfrysning eller ny kvalificering.
Den tidigare odelade remaining_before_freeze-listan blandade C:s förkrav med
framtida P:s kvalificeringskrav. Den ersätts av phase_requirements med
before_contract_freeze och before_product_qualification. Alla fyra ursprungliga
mätkrav finns kvar, men i sina respektive faser; inget produktkrav antas uppfyllt
för att det inte är ett förkrav till ett ännu produktlöst C.

status, current_dispatch och phase_result_contract.source_state uttrycker nu
stabila normativa villkor. De påstår inte att aktuella bytes är READY, körda,
granskade eller frysta. Ett senare faktiskt resultat och oberoende granskning
måste bindas till rätt subjekt; inga statusändringar behöver därefter skrivas
in i C eller P för att påstå eller möjliggöra en dom. Den samlade membern är
fortfarande exakt hashbunden, och utanför den återställs hela B-specen byte-exakt.

Ordningen är följande, utan ett C/P-förkravsvarv:

1. Håll och granska C-källan samt lifecycle-metoden och dess avgränsade evidens.
   C ska vara en immutable direkt child till B8095 med exakt sex kontraktvägar,
   oförändrade moder och samtliga produkt-/runtimebytes kvar vid B. En lokal
   immutable C som reviewsubject är ännu inte en accepterad kontraktsfrysning.
   Exakta member/spec/CLI/H039/final-exit/REFREEZE-bindningar gäller före prov.
2. Kör efter rätt effektgranskning den verkliga befintliga --asset-contract C
   mot detta exakta subjekt. Full observer måste autentisera raw objects,
   fullmap, disk, index, verktyg och postauth. Rätt RED är en komplett kanonisk
   frånvaroterminal med exit1 och tom stderr, inte ett tidigare argv-/riggfel.
   Supplier får inte starta. Oberoende källgranskning och denna genuina RED
   föregår accepterad C-kontraktsfrysning; det är inte H039- eller produktcredit.
3. Först efter granskad/fryst C följer separat builder-P och oberoende
   produktgranskning. P ska vara ensam direkt child till C med exakt fyra
   produktvägar; alla sex kontraktbytes förblir C och retained runtime förblir B.
   Faktisk graph/numstat, produktbudget, kausala attributfixturer, färsk intern
   tvålanesupplier, rebuild/materialkontroller och samtliga kausalkontroller
   krävs fortfarande. F3/F6/F7 och exakt EN final-exit-ägd komplett capture
   måste följa samma kvalificerade relation. Det äldre kravet som nämner
   receipt-bindning betyder fortsatt ingen caller-receipt-auktoritet eller
   replaybyggning; qualification_source och den faktiska F6-grenen är explicita.

TA-subjektets faktiska .git kontrollerades efter kontobytet: katalog0755,
gitdir/commondir .git relativt worktree. Det är inte en gitfile. Den tidigare
konversationsuppgiften om obligatorisk clone på den grunden var fel; ingen
clone behövs eller skapades för denna precisering. Före C-prov ska de faktiska
befintliga observerförkraven fortfarande kontrolleras, däribland sluten config,
frånvaro av alternates/shallow/replace/otillåtna attributes, rätt HEAD, disk/index
och pinnad Python/CLT-Git. En directory-.git är nödvändig här men inte ensam
tillräcklig för en godkänd observer. C-frånvaroprovet startar ingen compiler;
20 GiB-golvet före skapande och varje lane gäller fortsatt varje senare supplier,
tillsammans med faktisk metodreserv och serialisering utan annan auktoriserad writer.

Root körde den separat granskade inerta R4-metoden en gång: metodhash
baaa479eaf3ea59ed67a8438619a63418bf0e915893ef6b3121b9f671a2152f9,
fixture /private/tmp/h039-asset-measure-lifecycle-bw_y6e7e, method-result SHA256
3f6a8560056f4790f037ace0de58ef2f1f3b88915e83d97ad40c4c7f20f309cb.
Resultatet anger exit0 enligt rootens körpost, sju fall, åtta inerta starter och
3.9046975829987787 s. Dess egna qualification-fält är false. Sista bevarade
owner fick separat owned-wait120, utan uppgradering av ursprunglig nonqualification.
Detta gäller exakt775b/748b och R4:s beskrivna testseams, inte compiler/Seatbelt,
observer, nytt C/P eller fullgrind. TA läste och hashkontrollerade evidensen men
körde inte om metoden. Den aktuella preciseringen ändrar endast specnormer,
beskrivning och nödvändiga hashkonstanter. Funktionsbytes/AST för de faktiskt
provade lifecyclefunktionerna jämförs uttryckligen mot775b/748b; sådan identitet
kan bära det avgränsade mekanismbeviset till granskning, aldrig all gammal credit
till en ny whole-file-hash. Nya pinnar och C/P-subjekt behöver sina egna bindningar.

Test-first h039-phase-order-test-first.py gav faktisk exit1 på bc5c1050 därför
att phase_requirements saknades. Samma rena oracle kräver den exakta nya
fasordningen, behåller alla övriga memberfält och gamla mätkrav, och avvisar
saknade/flyttade/duplicerade krav, självattesterande READY/PASS och ändrade
resultatpolariteter. Separat coherence-kontroll binder nya pinnar och visar
att inga effektfunktioner eller historiska suffix ändrats. Dessa är pure-/
källkontroller, inte faktisk C-RED, produktgrind eller freeze. Nuvarande
hand-off är SOURCE_UNREVIEWED, C_RED=NOT_RUN, FROZEN_GATE_READY=NO,
PRODUCTION_IMPLEMENTATION_WRITTEN=NO, PUSH=NO, MERGE=NO.
