# Lokal utveckling: dokumentauktoritet

## Enkelt förklarat

Det här försöket ska kontrollera att plattformen verkligen läser de dokument
ägaren godkänt. Plattformens egen kontroll ska kunna förberedas utan ett
webbkundprojekt. Webbprojektets befintliga krav ska samtidigt fortsätta gälla.
En gammal kopia blir inte giltig bara för att någon räknar om dess kontrollsumma.

Detta är ett lokalt utvecklingskontrakt, inte en publicerad funktion. Det
startar ingen supervisor, ger ingen vanlig task nya skrivrättigheter och
ändrar inte H039-arbetet eller de tolv godkända dokumenten.

## Avgränsning och roller

Dokumentbas: `40f0bb6b9859eaf7be8ef330fc5e53319dd0605b`. De tolv godkända
dokumenten binds separat från den oförändrade substitutionsauditen (källa 13).
TEST_AUTHOR ändrar endast detta dokument, det lokala tillägget i h-035 och
`verify/bin/document-authority-exit`. Befintliga h-035-fält och exit-test består.
Efter oberoende kontraktsgranskning får en separat BUILDER ändra exakt
`scripts/nortropic-codex-autopilot.py` och `controller/verify/cli`; dokumentation
om detta lokala försök får bara tillföras här. Rollagenterna gör inga commits
eller publiceringar. Orchestratorn kan skapa lokala immutabla checkpoints för
rollgranskning; dessa ger ingen canonical- eller publiceringskredit.

## Fast kvalificeringsgränssnitt

`controller/verify/cli platform-prepare SPEC_SHA h-035 REGISTER_SHA SNAPSHOT`
skapar en ny absolut snapshot först efter autentisering av den kanoniska
specens exakta lokala tillägg, registret och den fasta dokumentgenerationen.
`platform-check SPEC_SHA h-035 REGISTER_SHA SNAPSHOT_SHA SNAPSHOT` konsumerar
den och verifierar samma generation på nytt. Lyckad prepare ger JSON med
`status=ok` och `snapshot_sha256`; lyckad check ger JSON med `status=ok`.
Ingen anropare får välja domän, annan task, tillägg eller dokumentlista.

Vägran i de två nya kommandona är rc 3 eller 4, tom stderr och exakt JSON
`{"status":"refused","reason":"KOD"}` på stdout. Koderna är
`DOCUMENT_GENERATION`, `SNAPSHOT_AUTHORITY`, `TASK_ID`, `SPEC_IDENTITY`,
`REGISTER_IDENTITY` eller `SOURCE_TYPE_OR_MODE`. Ett internt undantag är inte
en kausal vägran och får ingen negativ testkredit. Både hela den frysta specen
och registrets generation binds oberoende av anroparens kontrollsummor.

Snapshoten inkluderar de 13 dokumentkällorna, säkerhetspolicy, auktoritetskod,
verifierarkod, kanonisk spec, oförändrat register, managed-settings och den nya
kvalificeringsgrinden. Registrets identitet/schema består men webbfilernas
existens är inte ett universellt plattformskrav. Platform-kommandona kör inga
task-grindar, skapar inga Git-worktrees och migrerar inte task-run. Den gamla
webbbanans fullständiga register-/filvalidering ska fortfarande avvisa saknade
eller förändrade webbgrindar.

Exakt leafmängd är grindens `REQUIRED_SNAPSHOT`: de 13 dokumenten samt
`specs/tasks.spec.json`, `controller/verify/register.json`,
`specs/owner-production-paths.v1.json`, `controller/authority/core.py`,
`controller/policy/cli`, `controller/verify/cli`, `config/managed-settings.json`
och `verify/bin/document-authority-exit`. Endast deras härledda föräldrakataloger
får finnas. Leafbytes och modes ska motsvara den aktuella kvalificerade källan;
godkända dokument är reguljära 0644-filer, inte länkar. Samma dokument men en
utbytt kontrollplansfil, ändrat mode eller extra fil/tom katalog får inte
godkännas genom att anroparen räknar om snapshotens digest.

Autopilotens verkliga `ensure_substitution_authority(repo)` måste acceptera
den exakt godkända generationen i lokal `refs/remotes/origin/main`, inte bara
en godtycklig ny hash. Varje saknad, okänd eller blandad dokumentgeneration
avvisas före journalföring. Historisk substitutionsauktoritet hålls explicit
isär; den gamla generationen är negativ i detta nya kvalificeringsförsök.
Positivens `origin/main` är en isolerad fixture-ref, inte publicerad origin.
Ändrade eller saknade arbetskopiedokument får inte övertrumfa giltiga Gitobjekt;
godkända arbetskopior får inte rädda okända eller saknade origin-objekt.
Tillåten positiv effekt är ett enda appendat `SUBSTITUTION_AUTHORITY`-event
(och vid första bruk dess journalkatalog/fil). Befintliga fält är
`ts`, `event`, `contract`, `contract_blob` och `audit_blob`. De nya fälten är
`audit` och `document_blobs`, den senare den exakta kartan från de 13
sökvägarna till Gitblob-OID.
Inget annat filinnehåll, mode eller namespace får ändras av kvalificeringen.

## Mätning och ärlig status

Grinden använder isolerade lokala Git-fixtures, faktiskt importerad
autopilot-callable och verkliga verify-/policy-CLI-processer. Inga nätverks-,
root-, installations-, modell-, kundflödes- eller supervisoroperationer ingår.
Den prövar positiva kvalificeringar, dokumentmutationer före skapande och vid
konsumtion (med omräknad snapshotdigest), task/spec/register-fel, skyddade
skrivningar samt bevarad webbvägran. Kopierade negativa fixtures är testdata;
de godkända originaldokumenten ändras aldrig.

Första hållningen: kontrakt skrivet, produkten ännu oförändrad.
Fixture-rötter bevaras, även efter fel; ingen fixture-root-retirement görs av
grinden. Negativa kopierade testbytes återställs mellan lokala delprov.
Grindens PASS betyder endast `LOCAL_QUALIFICATION_ONLY`, aldrig h-035-doneness,
publicerad auktoritet, task-attestering eller supervisor readiness.

### Uppmätt baslinje före produkt

Orchestratorn körde den effektgranskade grinden med pinnad Python 3.12.13 och
umask 0022. Gate-SHA256 var
`af95c9e3412be6ddef50c35b4b6f1dba7a99438a3aa16bc16885fb022596635e`;
spec-SHA256 var
`5592e77437fe55c7b12ea10b5b35274dbe13bbb39a2a869226c8f1ac55e18061`.
Utfallet var rc 1, 95 rader: 23 PASS och 72 FAIL, inget RIG_ERROR.
`platform-prepare` avvisades som okänt kommando. Verklig
`ensure_substitution_authority` väntade det historiska kontraktsobjektet
`3997437cd20c6dd7397622b512ffd90dab5cf391` och mötte godkända fixtureobjektet
`4a41e3952f55453ba2e83b2d553f7af2b76d5705`. Det är faktisk preprodukt-RED.
Bevarad webbpositiv/webbdriftvägran, skyddad-write-policy, felcanaries och
oförändrade källbytes passerade. Flera negativa PASS stoppades av den gamla
kontraktskontrollen; de bevisar därför inte den nya generationens mekanism.

Resultat: `/private/var/folders/_v/t4cy04w95gz3m782_3p5qs9h0000gn/T/document-authority-local-3l_80b3k/result.json`,
SHA256 `52784573adeb67401e5a0b355bc45f1e19e314ca24f792eba1e1456ddaeed3f5`.
Ingen produkt, publicering eller operativ kvalificering har krediterats.

### Minimal successor efter fryst kontraktsgranskning

Första lokala kontraktskandidaten bevaras oförändrad som granskningsunderlag.
Granskningen reproducerade baslinjen men fann att snapshotdigestargumentet
bara fått korrekta värden. En implementation kunde därför ignorera argumentet.
Successorn tillför en felaktig men giltigt formad 64-hex-digest och en felaktigt
formad digest. Båda ska ge `SNAPSHOT_AUTHORITY` utan ändrad källa eller snapshot.

Det redan skrivna kravet på ny absolut destination får tre konkreta motprov:
relativ sökväg, befintlig reguljärfil och befintlig icke-tom katalog. Samma
`SNAPSHOT_AUTHORITY`-kod gäller; hela fixtureinnehållet ska bevaras vid avslag.
Detta utvidgar varken API-koder, produktpaths eller filesystem-racemodell.
Specen är oförändrad. Ingen successor-körning påstås i denna hållning.

### BUILDER — uppmätt lokal produktkandidat 2026-09-09

Efter separat kontraktsgranskning utgick BUILDER från lokal kontraktskandidat
`459bd3956807e26bca90bbb37629fc7750c46be8`, gren
`nortropic/loop-document-authority-product-r2`. Ingen publicerad bas eller
H035-doneness tillskrivs denna lokala identitet. `origin/main` saknas i denna
byggklon och är därför OVERIFIERAT där.

Egen före-baslinje gav rc 1, 23 PASS / 77 FAIL, inga RIG_ERROR. Resultat:
`/private/var/folders/_v/t4cy04w95gz3m782_3p5qs9h0000gn/T/document-authority-local-l66ftplh/result.json`,
SHA256 `fdb457aa5b93118b7e28fc1ca032c46d0378db346e4970e028ee5cf6b41bbeff`.

Endast de två produktfilerna ändrades. Autopiloten jämför de 13 fast beslutade
Gitblob-identiteterna och reguljärt 100644-mode på `origin/main`, oberoende av
arbetskopiedokumenten, före ett enda journal-event. Dess tidigare dubblerade
historiska självtestbindning har synkats; ingen schedulerövergång kördes.
Verifierarens nya två exakta kommandon binds till den frysta hela specen,
oförändrat register, dokumentgeneration och 21-leaf-snapshot. Gammal webbbana
är oförändrad. Snapshotvägran återställer eller raderar inga bevarade objekt.

Den oberoende hållna TEST_AUTHOR-grinden kördes mot produkten med följande
kommando och umask 0022:

```text
/opt/homebrew/Cellar/python@3.12/3.12.13_4/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -B /Users/elinhaggstrom/nortropic/worktrees/test-author-document-authority-20260909/verify/bin/document-authority-exit --subject /Users/elinhaggstrom/nortropic/worktrees/builder-document-authority-20260909
```

Utfall rc 0: 100 PASS / 0 FAIL, inga RIG_ERROR,
`DOCUMENT_AUTHORITY_RESULT=PASS_LOCAL_QUALIFICATION_ONLY`. Resultat:
`/private/var/folders/_v/t4cy04w95gz3m782_3p5qs9h0000gn/T/document-authority-local-cijlzpz2/result.json`,
SHA256 `9ed02c2a8ec0a55d408b40c1f27c2fe4af15960a5320f8bf4d7700bbcf0729c9`.
Produkt-SHA256 vid denna körning:

```text
scripts/nortropic-codex-autopilot.py 582c26856e993d005be7d4d9159e0d6a60c908f800746dcdf7f2f489b1290576
controller/verify/cli 3728206f3cd62f32837ec274fb30ad318cc91af3bd69d9902361025376394743
```

Separat importerad `selftest(None)` gav rc 0. Den gör endast käll-/statisk
kontroll här, ingen origin-, nätverks-, journal- eller operativ kontroll.
AST-jämförelse mot byggbasen bekräftade 145 oförändrade äldre definitioner;
endast `ensure_substitution_authority`, `selftest` och verifierarens `main`
ändrades bland befintliga definitioner. Faktisk platform-check accepterade
godkänd snapshot även med en ogiltig caller-satt authority-root, och avvisade
ett extra argument med rätt strukturerad kod; snapshotdigest var oförändrad.
`git diff --check` gav rc 0. Dessa är begränsade kompletterande kontroller,
inte ersättare för oberoende produktgranskning.

FROZEN_ARTIFACTS_MODIFIED=NO; ALLOWED_WRITE_VIOLATION=NO; PUSH=NO; MERGE=NO.
H039, godkända dokument och historiska gates har inte ändrats av BUILDER.
Oberoende produktgranskning återstår vid denna anteckning. Fulla historiska
gates, installation, kundflöde, operativ bootstrap och supervisor är NOT_RUN.

### BUILDER — avgränsad rättning efter oberoende produktfynd

Den första immutabla produktkandidaten
`64389fccdb694b3eb4307f8efebd9e4f62e635d8` bevaras. Oberoende reviewer visade
att ett lokalt Gitträd kan namnge godkända blob-OID utan att objekten finns:
`ls-tree` räcker därför inte som ersättning för den gamla `cat-file -e`-kontrollen.
Den första kandidatens 100 gröna kontroller var otillräckliga för detta fall.

Successorn återställer objektets existenskontroll före exakt typ/mode/OID och
journalföring, med endast två tillagda produktrader. Inget gate-, spec-,
register-, policy- eller verifierarbyte ändrades. Autopilotens nya SHA256 är
`eabcc7624ca92166e094c032022167e2d99932faea325c24c84eb42dd2bf0b13`.

Reviewerproben kopierades till en ny egen fixture med endast SUBJECT-sökvägen
ändrad; den gamla review-fixturen och kandidaten rördes inte. Kommando:

```text
/opt/homebrew/Cellar/python@3.12/3.12.13_4/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -B /private/tmp/document-authority-builder-missing-objects.aPg6Iw/probe.py
```

Probe-SHA256 `fa27b164180923a14ddee15fc2a88d478cc954efd7306520ea6a91b3c0669b99`.
Utfall rc 0, fyra av fyra kontroller passerade: snapshotlänk som leaf respektive
ancestor, fel Gitmode och saknade Gitobjekt. De två snapshotlänkfallen skickade
också en felaktig snapshotdigest: dessa är kombinerade negativa utfall, inte
oberoende kausala bevis för länkvägran. I sista fallet gav Git-existensprovet
rc 1 och autopilot-callable rc 7 före journal; hela fixtureträdet var oförändrat.
`journal_created=false`. Inga objekt raderades för att skapa negativfixturen;
den byggdes med `mktree --missing` i en ny lokal Git-databas.

Samma frysta TEST_AUTHOR-kommando ovan kördes på successorn med umask 0022:
rc 0, 100 PASS / 0 FAIL, inga RIG_ERROR. Bevarat resultat finns i
`/private/var/folders/_v/t4cy04w95gz3m782_3p5qs9h0000gn/T/document-authority-local-9c5__fw0/result.json`.
Resultat-SHA256 `944b44a49e41238c318bb2a06981becd2aa35f4e32a95d890d33f38cabcdd64c`.
Importerad `selftest(None)` gav åter rc 0. Detta är fortfarande lokal
kvalificeringskredit; oberoende successor-review återstår vid anteckningen.
