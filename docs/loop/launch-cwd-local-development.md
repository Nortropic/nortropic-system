# Lokal utveckling: workerns arbetskatalog i `controller/launch/cli`

## Enkelt förklarat

`controller/launch/cli run <workspace> <kuvert> <timeout> -- <kommando>` ska starta
workern **i workspacet**. Mätt 2026-09-10 på `383ed387` gör den inte det: målet
ärver **anroparens** arbetskatalog. Launchern startar supervisorn utan `cwd`,
supervisorn startar den inneslutna hjälparen (`sandbox-exec … confined-exec-v1`)
utan `cwd`, och `confined-exec-v1` gör `execve` utan `chdir`. Workspacet når
Seatbelt-profilen (som `CURRENT_WORKSPACE`) men aldrig processens cwd.

I den ordinarie kedjan (`controller/loop/cli` → brytare → utforare → launch) är
anroparens cwd loopens cwd, i drift den levande arbetskopian. En worker som
skriver relativa sökvägar skriver därför in i den levande arbetskopian — där
Seatbelt nekar (`nonzero_exit`) — och aldrig i workspacet; utföraren ser ett rent
träd och ingen kandidat föds. Startas loopen från en annan katalog hamnar filerna
där i stället (ett tidigare prov skrev `tests/platform-fixture/out.txt` i en hållen
worktree av just detta skäl). Rättningen är liten: målet ska köras med cwd lika
med det upplösta workspacet, oberoende av var anroparen står. Att ett prov
adresserar workspacet med absolut sökväg är en omväg i provet, inte en rättning,
och ägaren kräver rättningen genom den ordinarie ändringsvägen innan någon
verklig arbetskörning krediteras.

Detta är ett lokalt utvecklingskontrakt, inte publicerad funktion. Det ger ingen
task nya skrivrättigheter, ändrar inte specen, startar ingen supervisor och är
ingen H-036-, H-035-, bootstrap- eller resume-kredit.

## Avgränsning och roller

Bas: `383ed3873105d77fd1129d74abf408092e0ff2f3` (plattformsrepot efter
separationen `49cc495c`; kontrollmängdskandidat). Uppmätta produktdigestar vid
basen (SHA-256): `controller/launch/cli`
`65571892948b9f7a9260ee88abb2cf5c575eda245fe1874f8ade3c7a8b202ba3`,
`controller/launch/runtime_snapshot.py`
`35ca9dff3355bcfbd4d7536cb9658fe3342f143745547ec55f2b2cb25223eca7`,
`controller/utforare/cli`
`75f9ddf35308bcceb28f5847bd792707702511b3e3c0361a3f5c0bcfc511fe71`,
`controller/brytare/cli`
`9c34189f15bddbd248ff03bb034d076c78b98f296c6b7505b7aa08ef9c195bfc`.

TEST_AUTHOR tillför endast `verify/bin/launch-cwd-exit` och detta dokument. Inget
specfält ändras. Specen saknar kravet i dag: h-009:s sammanfattning säger att
controllern startar workern *"i ett givet workspace"*, men dess `exit_criterion`
mäter aldrig cwd — `tests/controller/launch/fall.py` skriver själv att *"Grinden
kör aldrig ett kommando som rapporterar sin cwd"*. h-036:s `exit_criterion` säger
om supervisorn att den *"never creates caller cwd and never resolves a target
before confinement"* — det binder att anroparens cwd inte **skapas**, inte att
målet körs i workspacet. Ingen befintlig rad kräver alltså *launch cwd =
workspace*; kravet binds här lokalt.

Skrivyta: `controller/launch/**` och `tests/controller/launch/**` är ordinarie
`allowed_write` (specens defaults `controller/**`, `tests/controller/**`; h-009:s
rad). `controller/launch/cli` står också i h-036:s `owner_author_allowed_write`
och pinnas byte för byte av den frysta grinden `verify/bin/h-036-exit`
(`PINNED_UNCHANGED`, digesten ovan). Varje rättning ändrar därför en digest som
h-036-grinden binder; hur h-036 hanterar det (refreeze) är ett ägarbeslut utanför
detta kontrakt och nämns här för att det inte ska upptäckas i efterhand. Mätt
2026-09-10: `verify/bin/h-036-exit` utan argument stannar på `383ed387` i replika
efter 0 s med `RIG_ERROR: … docs/05-beslutslogg.md` (webbfil borttagen i
separationen) och exit 2 — den frysta h-036-grinden är i dag inte körbar i
plattformsrepot, oavsett denna defekt.

Produktyta för BUILDER: exakt `controller/launch/cli`. Föredragen form: byt
arbetskatalog till det **upplösta** workspacet i launchern innan supervisorn
startas (cwd ärvs launcher → supervisor → hjälpare → mål, så ett `chdir` i
`gor_run` efter `ws.resolve()` når målet), med miljörensning och Seatbelt-profil
oförändrade. Endast om det är oundvikligt: `controller/utforare/cli`. BUILDER får
lägga regressionsfall under `tests/controller/launch/`; grinden är domaren.
Observera att själva `execve` ligger i `controller/launch/runtime_snapshot.py`
(`_run_launch` startar hjälparen utan `cwd`, `confined_main` gör ingen `chdir`).
Ett `chdir` i `controller/launch/cli` täcker toppnivålanseringen — det kriteriet
binder — men inte kapslade lanseringar (nivå+1), vars mål fortsatt ärver
supervisorns cwd i stället för sitt barnworkspace. Det är avsiktligt lämnat
utanför detta kontrakt (se *Vad grinden inte bevisar*).

Efter oberoende kontraktsgranskning får en separat BUILDER göra rättningen och
tillföra utfallsrader i detta dokument. Rollagenterna publicerar inte.

## Kriterium (effekter, inte källtokens)

Grinden bygger engångsreplikor av `--subject` HEAD (`git init --template=` +
lokal exakt-SHA-fetch + `checkout --detach`) och kör replikans **riktiga**
`controller/launch/cli`, `controller/loop/cli`-kedja och Seatbelt-inneslutning.
Anroparens cwd varieras: scratchkatalog, raderad katalog, oskrivbar katalog
(0500) och replikans egen levande arbetskopia. Kedjan startas med en stub-worker
som skriver **relativt** (`tests/launch-cwd-fixture/out.txt`, inga absoluta
sökvägar, ingen `cd`, inget git) under fixturtaskens `allowed_write`
`tests/launch-cwd-fixture/**`. Kedjereplikan får de hållna människohandsförslagen
(`SEPARATION-20260910/proposed/*`) och en registrerad fixturgrind som overlay i
fixturen — samma recept som `verify/bin/platform-control-set-exit`, aldrig i
arbetsträdet.

| Rad | Krav |
|---|---|
| `canary_traceback_is_not_launch_success` | ett Python-fel räknas aldrig som lanseringsframgång |
| `canary_launch_anropsfel_is_not_launch_success` | saknat kuvert ger exit 1 `anropsfel`, inget mål startas |
| `launch_target_cwd_is_workspace_from_scratch_caller_cwd` | anropare i scratchkatalog: exit 0, målets `pwd -P` = upplöst workspace, `mark/out.txt` skapad i workspacet |
| `launch_scratch_caller_cwd_receives_nothing` | anroparkatalogens träd är oförändrat efter lanseringen |
| `launch_target_cwd_is_workspace_when_caller_cwd_deleted` | anroparens cwd raderad före start: samma utfall som ovan |
| `launch_target_cwd_is_workspace_when_caller_cwd_unwritable` | anroparens cwd 0500 (mätt oskrivbar): samma utfall, katalogen orörd |
| `launch_with_caller_cwd_equal_to_workspace_unchanged` | den frysta h-036-grindens anropsform (`cwd=workspace`) fungerar som förut |
| `seatbelt_denies_explicit_live_and_trust_writes_from_live_root_caller_cwd` | anropare i replikans rot: explicita skrivningar till `LIVE_ROOT`, `LIVE_ROOT/tests` och `NORTROPIC_TRUST_ROOT` ger errno 1 (EPERM) och lämnar inga filer; skrivning i workspacet ger 0; replikan `git status` ren — rättningen får inte vidga profilen |
| `launch_env_stripping_and_closed_path_preserved` | målet ser inga `GH_*`/`GITHUB_*`/`SLACK_*`/`GIT_*`/`DYLD_*`/`PYTHON*`, `PATH=/usr/bin:/bin`, `NORTROPIC_KUVERT` satt, `HOME` behållet |
| `launch_workspace_overlapping_live_root_still_refused` | workspace inuti live-roten avvisas fortsatt med exit 3 `launch_failed` före något mål |
| `chain_replica_preflight_and_fixture_task_lookup_ok` | replikans kontrollmängd startar: `preflight` ok mot fixturregistret, `task` ger `grindad` |
| `loop_from_scratch_caller_cwd_attests_relative_write_in_candidate` | `controller/loop/cli run` startad från scratchkatalog: exit 0, `drain klar: 1 varv, 1 attesterade`; attesterad kandidat har `tests/launch-cwd-fixture/out.txt` = `kandidat\n`, förälder = base, författare `nortropic-utforare`, `stale` false; lease fri, workspaces rivna, replikan ren på base |
| `loop_scratch_caller_cwd_receives_nothing` | scratchkatalogens träd oförändrat efter körningen |
| `loop_from_live_checkout_cwd_attests_relative_write_in_candidate` | samma körning startad från replikans levande arbetskopia (driftformen): samma krav |
| `loop_live_checkout_receives_nothing` | replikan `git status` ren, HEAD = base, en enda worktree, ingen `tests/launch-cwd-fixture/` i arbetskopian |
| `policy_still_refuses_absolute_write_outside_allowed_write` | worker som skriver `tests/launch-cwd-utanfor.txt` med **absolut** sökväg (cwd-oberoende kontroll, i vitlistat träd): `avbrutet i policy`, `allowed_write` namngivet, `0 attesterade`, ingen attestation |
| `frozen_verify_bin_identical_to_base_383ed387` | varje fil i `verify/bin/` vid basen är byte- och lägesidentisk i subjektet; inga extra filer utom denna grind, som måste vara identisk med den hållna |
| `h036_exit_byte_identical_to_held` | `verify/bin/h-036-exit` identisk med den hållna (`b6fd9737…`) |
| `h036_runtime_roots_no_residue` | inga nya `/private/tmp/.nortropic-h036-runtime-*` efter körningen |
| `subject_and_held_bytes_unchanged` | subjektets fem produktfiler och de hållna filerna oförändrade efter körning |

`result.json` i `FIXTURE_ROOT` bär `subject_sha256` för `controller/launch/cli`,
`controller/launch/runtime_snapshot.py`, `controller/utforare/cli`,
`controller/brytare/cli` och `controller/loop/cli`, hållna digestar, pinnad
Python/Node/sandbox-exec och alla rader.

Vägran och rigfel skiljs: `LAUNCH_CWD_RESULT=RED_LOCAL_QUALIFICATION` med exit 1
är ett prövat rött utfall; `LAUNCH_CWD_RESULT=PASS_LOCAL_QUALIFICATION_ONLY` med
exit 0 är lokal kvalificering; `LAUNCH_CWD_RIG_ERROR=…` på stderr med exit 2 är
ett riggfel utan kredit (saknad pinnad Python 3.12 `94be2db6…`, saknad
`/usr/bin/sandbox-exec`, `git`, `node`, produktfiler som inte är committade på
subjektets HEAD, eller replika som inte reproducerar HEAD).

Kommando (från test-author-arbetsytan, umask 0022, utanför Claude Codes sandbox
eftersom `controller/launch/cli` kräver `/usr/bin/sandbox-exec` och skriver sin
runtime-rot under `/private/tmp`):

```text
/opt/homebrew/Cellar/python@3.12/3.12.13_4/Frameworks/Python.framework/Versions/3.12/bin/python3.12 -B verify/bin/launch-cwd-exit --subject <kandidat>
```

Grinden mäter workerns arbetskatalog och skrivningar som **effekter**: målets
`pwd -P`, var filen faktiskt landar, vilken fil kandidatcommiten bär och vad
anroparkatalogen respektive den levande arbetskopian innehåller efteråt. Ingen
rad läser launcherns källtext.

## Vad grinden inte bevisar

- **Kapslade lanseringar.** En launcher som körs *inuti* ett inneslutet mål
  (nivå+1, `NORTROPIC_H036_*` ärvda) prövas inte. Med ett `chdir` enbart i
  `controller/launch/cli` ärver ett kapslat mål supervisorns cwd (toppnivåns
  workspace), inte sitt barnworkspace. Full täckning kräver `cwd`/`chdir` i
  `controller/launch/runtime_snapshot.py`, som ligger utanför detta kontrakts
  produktyta och är h-036-ägarauktoritetsyta.
- **Relativ kommandosökväg.** `command_exists` löser en relativ
  `<kommando>` mot workspacet men `execve` sker i processens cwd; den skillnaden
  binds inte här (målen anges alltid absolut).
- **Den frysta h-036-grinden körs inte.** Bara byte-identitet mot den hållna
  grinden och basen `383ed387` binds. UNRESOLVED: h-036-grindens egna
  lanseringskontroller kunde inte köras — `verify/bin/h-036-exit` ger `RIG_ERROR`
  (saknad `docs/05-beslutslogg.md`) och exit 2 på plattformsrepot, mätt i replika
  2026-09-10. Raden `launch_with_caller_cwd_equal_to_workspace_unchanged` binder
  endast anropsformen `cwd=workspace` på launchern, inte grinden.
- **Profiltexten jämförs inte.** Seatbelt binds via effekter (EPERM på live/trust,
  tillåten skrivning i workspacet, ren replika), inte via profilens bytes eller
  `PROFILE_BASE_SHA256`.
- **Policy-kontrollen skriver absolut med avsikt** — den mäter att policyn står
  kvar oberoende av cwd-rättningen, inte cwd-beteendet. Att en fil i
  workspacets rot är gitignorerad (vitlistan `/*`) och därför aldrig når
  utföraren är uppmätt (första körningen) men inte bunden som krav.
- **Kedjan kör på hållna förslag i fixtur**, inte subjektets eget register
  (subjektets `preflight` faller på `383ed387` av separationsskäl som
  `platform-control-set-exit` binder). Ingen modellsession, ingen provider.
- Grinden ersätter inte `verify/bin/h-009-exit`, `h-012-exit`, `h-016-exit` eller
  `h-036-exit` och är ingen H-036/H-035/bootstrap/resume-kredit.

## Utfall

Preprodukt-RED på `383ed387` (subjekt
`/Users/elinhaggstrom/nortropic-repos/work/test-author-launch-cwd-20260910`,
launcher SHA-256 `65571892…`): kommandot ovan, exit 1, 20 rader, 13 PASS / 7 FAIL,
ingen `RIG_ERROR`, `LAUNCH_CWD_RESULT=RED_LOCAL_QUALIFICATION`. Exakt de sju
cwd-oberoende-raderna föll, alla av rätt skäl:

- `launch_target_cwd_is_workspace_from_scratch_caller_cwd` och
  `launch_scratch_caller_cwd_receives_nothing`: målets `pwd -P` var
  anroparkatalogen (`…/tmp-launch-fixtures/caller-scratch`), `mark/out.txt`
  hamnade där och inte i workspacet.
- `…when_caller_cwd_deleted` och `…when_caller_cwd_unwritable`: launchern gav
  `nonzero_exit: processen avslutade med kod 3` (målets `mkdir` föll i den
  raderade/oskrivbara cwd:n); ingen fil någonstans.
- `loop_from_scratch_caller_cwd_attests_relative_write_in_candidate` och
  `loop_scratch_caller_cwd_receives_nothing`: `avbrutet i forsok — inga ändrade
  filer — redigerade tests/launch-cwd-fixture/out.txt`, `budget slut`, `drain
  klar: 1 varv, 0 attesterade`; anroparkatalogen innehöll efteråt
  `tests/launch-cwd-fixture/out.txt`.
- `loop_from_live_checkout_cwd_attests_relative_write_in_candidate`:
  `avbrutet i forsok — nonzero_exit: processen avslutade med kod 3`
  (Seatbelt nekade `mkdir` i den levande arbetskopian); `0 attesterade`.
  Systerraden `loop_live_checkout_receives_nothing` passerade: replikan ren.

Övriga tretton passerade, däribland policyavslaget (`avbrutet i policy — utanför
allowed_write för p-fixture: tests/launch-cwd-utanfor.txt`), Seatbelt-nekandet
(`live_root: 1, live_tests: 1, trust_root: 1, workspace: 0`), miljörensningen,
byte-identiteten för `verify/bin/**` mot basen och ingen h-036-runtime-rest.
`FIXTURE_ROOT=/private/var/folders/_v/t4cy04w95gz3m782_3p5qs9h0000gn/T/launch-cwd-local-x7_reakk`,
`result.json` SHA-256
`78afa5a428a35b9cf0ced5840bc5a895e91ec03fb6d378d4ac2b2ee02184b069`. Första
körningen (rot raderad) föll dessutom på policy-kontrollen därför att
`utanfor.txt` i workspacets rot var gitignorerad; kontrollen flyttades till
`tests/launch-cwd-utanfor.txt` och raden passerar nu av rätt skäl.

Adversariell grindgranskning (tre slit-och-släng-mutanter av `controller/launch/cli`
i scratchkloner av `383ed387`, alla raderade efteråt, ingen i arbetsträdet;
förutsägelse skriven före körning):

| Mutant | Förutsagt | Mätt |
|---|---|---|
| M1 referens: `chdir` till det upplösta workspacet i `gor_run` före supervisorstart | alla rader gröna | exit 0, 20/20 PASS, `PASS_LOCAL_QUALIFICATION_ONLY` |
| M2 defekt: `chdir` först **efter** att supervisorn startats | samma sju röda som baslinjen | exit 1, 13/7, exakt baslinjens sju rader |
| M3 defekt: `chdir(os.path.relpath(ws))` (kräver levande anropar-cwd) | enbart raderad-cwd-raden röd | exit 1, 19/1, `launch_target_cwd_is_workspace_when_caller_cwd_deleted` |

M1 visar att kriteriet är uppnåeligt inom den angivna produktytan utan att profil
eller miljörensning rörs; M2 visar att grinden mäter effekten och inte förekomsten
av ett `chdir`; M3 visar att raderad-cwd-raden särskiljer en rättning som råkar
fungera bara när anroparen står i en levande katalog. Ingen referens lämnas kvar:
BUILDER skriver rättningen själv genom den ordinarie ändringsvägen.

Produkt 2026-09-10 (BUILDER, arbetsyta
`/Users/elinhaggstrom/nortropic-repos/work/builder-launch-cwd-20260910`, gren
`nortropic/launch-cwd-product`, förälder 2444a856): rättningen är elva rader i
`controller/launch/cli::gor_run` — `os.chdir(ws)` på det upplösta workspacet efter att
kuvert och timeout lästs (ett relativt kuvertargument löses därför fortsatt mot
anroparen), före `command_exists` och före dispatch till `nested_launch`/`top_level_launch`,
alltså före supervisorstarten och före varje relativ åtkomst; `OSError` klassas
`launch_failed` (exit 3) i stället för stackspår. Ingen ändring i Seatbelt-profil,
miljörensning, argv, exitkoder eller JSON; `controller/launch/runtime_snapshot.py`,
`controller/utforare/cli`, `controller/brytare/cli` och `controller/loop/cli` orörda.
Launcher SHA-256 efter rättningen
`5273a48480ec73550ddc915e9b2c54d396717573dd7af79fe89cbe549cf1d4f1`.

- Baslinje före rättningen (samma kommando från test-author-arbetsytan, subjekt =
  arbetsytan på 2444a856, launcher `65571892…`): exit 1, 13 PASS / 7 FAIL, exakt
  TEST_AUTHORs sju rader, `RED_LOCAL_QUALIFICATION`,
  `FIXTURE_ROOT=/private/var/folders/_v/t4cy04w95gz3m782_3p5qs9h0000gn/T/launch-cwd-local-tifo0ae8`.
- Kandidat (produktcommit med launcher `5273a484…`): exit 0, 20 PASS / 0 FAIL, ingen
  `RIG_ERROR`, `LAUNCH_CWD_RESULT=PASS_LOCAL_QUALIFICATION_ONLY`,
  `FIXTURE_ROOT=/private/var/folders/_v/t4cy04w95gz3m782_3p5qs9h0000gn/T/launch-cwd-local-miga9ttl`,
  `result.json` SHA-256
  `fef94aa98426fd2b40dee00356e3ee3ce5d183fc22759f4402578c4c1f40009f`. Inga
  `/private/tmp/.nortropic-h036-runtime-*` före eller efter.
- `tests/controller/launch/fall.py` (pinnad Python, bypass): kandidat 50 rätt / 3 fel,
  exit 1; baslinjeklon av 2444a856 i scratchpad 49 rätt / 4 fel. Skillnaden är fallet
  `cwd` (målets `pwd -P` = workspacet), som faller på baslinjen och passerar på
  kandidaten. De tre gemensamma felen är förexisterande och cwd-oberoende:
  `kuvert/env` och `kuvert/stdin` (`nonzero_exit: processen avslutade med kod 127` —
  provets `kuvert.sh` anropar `python3.12`, som inte finns i målets `PATH=/usr/bin:/bin`)
  samt `kuvert/ej-i-workspace` (H-036-supervisorns `.nortropic-h036-proof-*-ancestor-*`
  effektplansfiler i workspacet). Körningen lämnar gitignorerade
  `.nortropic-h036-proof-*-trust-*`-filer i ROT när `NORTROPIC_TRUST_ROOT` saknas
  (36 st, borttagna efteråt).
- Prober (bypass, `NORTROPIC_TRUST_ROOT` i scratchpad): workspace utan sökrättighet
  (0000) → exit 3 `launch_failed: kunde inte byta arbetskatalog till workspacet …:
  Permission denied`, tom stderr; relativt kuvertargument från anroparens cwd → exit 0
  och målets cwd = workspacet (baslinjen: exit 0 men målets cwd = anroparkatalogen);
  relativ kommandosökväg `./mark.sh` i workspacet → exit 0 på kandidaten,
  `nonzero_exit … kod 1` på baslinjen (inte bundet här; konsekvent med `command_exists`).
- `verify/bin/invariant-required-exit --subject <arbetsytan>` från den hållna
  kontrollmängdsarbetsytan (dadafe96): 14 PASS / 1 FAIL (`real_verifier_rc0_on_subject`),
  exit 1 — som på 383ed387; `result.json` SHA-256
  `256f72df3da2c6313882997c6aedd6659078af953a2927ce66e4c5e6f88a04b5`.
- `verify/bin/platform-control-set-exit --subject <arbetsytan>` från den hållna
  kontrollmängdsarbetsytan (dadafe96, bypass, umask 0022): exit 1, 68 rader, 40 PASS / 28 FAIL,
  `RED_LOCAL_QUALIFICATION`, inget `RIG_ERROR` — exakt samma 28 röda rader som på 383ed387
  (otillämpat register/verifierare i arbetsträdet), inga nya röda;
  `loop_end_to_end_attests_platform_fixture_task` PASS. `FIXTURE_ROOT=/private/var/folders/_v/
  t4cy04w95gz3m782_3p5qs9h0000gn/T/platform-control-set-local-kn8qfjo4`, `result.json` SHA-256
  `9f5cbd2219c6739c14abe06f9c288e7dee5d4a0e4bc275b7bf1292229caae75e`.
- Bunden följd för h-036: `verify/bin/h-036-exit` pinnar `controller/launch/cli` byte för
  byte (`PINNED_UNCHANGED`, `65571892…`) och kommer inte att acceptera kandidatens
  launcherbytes (`5273a484…`). Refreeze av h-036 är ett ägarbeslut utanför detta
  kontrakt; h-036-grinden är orörd (byte-identisk med den hållna `b6fd9737…`).
- Utanför detta kontrakt kvarstår kapslade lanseringar (nivå+1 ärver supervisorns cwd;
  kräver `cwd`/`chdir` i `runtime_snapshot.py`, h-036-yta).

PRODUCTION_IMPLEMENTATION_WRITTEN=YES · FROZEN_ARTIFACTS_MODIFIED=NO ·
ALLOWED_WRITE_VIOLATION=NO · PUSH=NO · MERGE=NO.
