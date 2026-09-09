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
