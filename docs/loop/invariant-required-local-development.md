# Lokal utveckling: obligatorisk invariantverifierare

## Enkelt förklarat

Autopilotens slutkontroll kör `scripts/check-invariants.mjs` innan en kandidat
får gå vidare. Om filen saknas returnerar `run_invariants` idag `None`, och
alla fem anropare släpper igenom `None` som om kontrollen vore grön. En saknad
obligatorisk kontroll får aldrig bli grön. Rättningen är liten: saknad
verifierare ska stoppa, precis som en röd verifierare stoppar.

Detta är ett lokalt utvecklingskontrakt, inte publicerad funktion. Det ger
ingen task nya skrivrättigheter, startar ingen supervisor och ändrar inte
H039-arbetet, de tolv godkända dokumenten eller den bevarade 0581-kandidaten.
Blobobjekt-regressionen är redan rättad i 0581dc05 och berörs inte här.

## Avgränsning och roller

Bas: `0581dc05c1ab586a315795ea6b0a185af012edb9` (autopilot SHA256
`eabcc7624ca92166e094c032022167e2d99932faea325c24c84eb42dd2bf0b13`).
TEST_AUTHOR tillför endast `verify/bin/invariant-required-exit` och detta
dokument. Inget specfält, ingen ändring av `specs/tasks.spec.json`, registret,
frusna grindar eller de tolv dokumenten. Skälet är mätt, inte antaget: den
frysta grinden `verify/bin/document-authority-exit` autentiserar hela specen
mot dokumentbasen med exakt ett tillägg (`local_document_authority_v1`), så
varje nytt specfält skulle bryta den redan granskade dokumentkandidaten.

Bindning till befintlig h-035: produktytan `scripts/nortropic-codex-autopilot.py`
ligger redan i h-035:s frusna `allowed_write` och i dokumentkontraktets
`product_paths`. Testvägen `tests/scripts/nortropic-codex-autopilot/**` är
också h-035-yta. Denna grind är en lokal kvalificeringsgrind enligt samma
mönster som dokumentauktoritetsgrinden; den är inte publicerad taskauktoritet.

Efter oberoende kontraktsgranskning får en separat BUILDER ändra exakt
`scripts/nortropic-codex-autopilot.py` och tillföra utfallsrader i detta
dokument. Ingen verifierare får göras valfri, ingen anropare får ta bort sitt
stopp vid `rc != 0`, och `assert_final_gates` ordning (fryst grind, baseline-
grindar, invarianter) består. Rollagenterna gör inga publiceringar.

## Kriterium (effekter, inte källtokens)

Grinden importerar den faktiska modulen från `--subject` och kör de riktiga
anropbara `run_invariants` och `assert_final_gates` i engångs-Git-fixturer med
kontrollerade taskgrindar (`t-frozen`, `t-green`) och kontrollerad verifierare.

| Fall | Krav |
|---|---|
| Verifierare saknas | `run_invariants` reser `Stop` vars text nämner invariant; ingen journalrad `INVARIANTS` med exit 0; fixturen oförändrad |
| Verifierare är dinglande symlänk | samma som saknad |
| Verifierare finns, rc 0 | returnerar `Cmd` med rc 0, exakt en journalrad `INVARIANTS exit=0` |
| Verifierare finns, rc 1 | returnerar `Cmd` med rc 1, journalrad `INVARIANTS exit=1` |
| Verifierare är en katalog | aldrig `None`, aldrig rc 0 |
| `assert_final_gates`, gröna grindar, saknad verifierare | `Stop` om invariant, inte om "final gate"/"regressed"; båda grindarna journalförda gröna först |
| gröna grindar, rc 0 | returnerar; journal exakt GATE t-frozen 0, GATE t-green 0, INVARIANTS 0 |
| gröna grindar, rc 1 | `Stop` om invariant |
| fryst grind röd | `Stop` om "final gate" före verifieraren; ingen `INVARIANTS`-rad |
| baselinegrind röd | `Stop` om "regressed" före verifieraren; ingen `INVARIANTS`-rad |
| fem konsumenter | AST: exakt fem produktionsanrop, vart och ett direkt följt av `if … <namn>.rc != 0` som reser `Stop` |
| riktig verifierare | `node scripts/check-invariants.mjs` i subjektet ger rc 0 och `0 FAIL` |
| drivrutinsfel | traceback/okänt scenario ger varken stopp- eller returkredit |
| bytes | subjektets produkt och den hållna grinden oförändrade efter körning |

Vägran och rigfel skiljs: `INVARIANT_REQUIRED_RESULT=RED_LOCAL_QUALIFICATION`
med exit 1 är ett prövat rött utfall; `INVARIANT_REQUIRED_RIG_ERROR` med exit 2
är ett riggfel utan kredit. Pinnad Python 3.12 (samma identitet som
dokumentgrinden) krävs; Node-identiteten registreras i `result.json` men
pinnas inte, eftersom fixturens verifierare bara är `process.exit(N)`.

Kommando (från test-author-arbetsytan, umask 0022):

```text
/opt/homebrew/Cellar/python@3.12/3.12.13_4/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -B verify/bin/invariant-required-exit --subject <kandidat>
```

## Vad grinden inte bevisar

Den kör inte de fyra publiceringsflödena (roadmap-, empirisk-, fullroadmap- och
h-003-konsumenterna) end-to-end; de kräver Codex/GitHub-gränser. Deras skydd
prövas statiskt (AST) och genom att `run_invariants` självt aldrig kan
returnera `None`. Grinden är ingen H035-, bootstrap-, publicerings- eller
resume-kredit och ersätter inte `verify/bin/h-035-exit`.

## Utfall

Preprodukt-RED på 0581dc05 (subjekt `worktrees/builder-document-authority-20260909`):
exit 1, 15 rader, 12 PASS/3 FAIL, ingen RIG_ERROR. Exakt de tre fail-open-fallen
föll: `run_invariants_missing_verifier_stops`,
`run_invariants_dangling_symlink_verifier_stops` och
`final_gates_green_missing_verifier_stops`. Övriga tolv, inklusive
konsumenträkningen fem-av-fem och den riktiga verifierarens rc 0, passerade.
