# Att köra loopen

**Skriven 2026-08-09, UR den första verkliga körningen** — inte före den. Varje siffra
och varje utfall nedan är mätt på `premiar-1`, som körde `p-001` och `p-002` mot main
`3e781fa` och attesterade båda. En manual skriven i förväg hade varit en gissning.

Detta är driftdokumentet. Byggandet styrs av [byggplan-v3.md](byggplan-v3.md) och
[regler.md](regler.md); de rör inte den här filen.

---

## 1. Vad en körning är

`controller/loop/cli run <config.json>` går igenom backloggen task för task. Per task:
lease → claim → **försök** (workspace på oförändrad base → kuvert → brytare → utförare →
session) → parse → policy → verifierare → attestation. Faller ett försök görs det om
inuti claimet tills brytarens budget tar slut.

**Kedjan dömer tre saker:** att rapporten är välformad, att diffen håller sig inom
`allowed_write` och budgetarna, och att configens verifierare är grön mot kandidatträdet.
Den dömer **inte** om tasken blev löst — taskens eget `exit_test` körs aldrig av kedjan.
En attestation betyder *"diffen var laglig och de globala invarianterna höll"*. Den
per-task-domen fäller du, med taskens grind, innan du mergar.

## 2. Före körningen

Configen ligger utanför repot så att körningen aldrig smutsar arbetskopian. Mall och
fältförklaringar finns i [`config/README.md`](../../config/README.md).

```
mkdir -p ~/.nortropic/kor
cp config/loop-config.exempel.json ~/.nortropic/kor/min-korning.json
```

Fyll i `base_sha` (`git rev-parse HEAD`) och ett unikt `run_id`. Initiera state en gång
per körning — annars faller taskval före första varvet med
`state: … kunde inte rekonstrueras`:

```
./controller/state/cli init ~/.nortropic/kor/state
```

**`budget` måste vara strikt större än `troskel`.** Brytaren prövar budget före öppen, så
ett för snålt tak maskerar en öppen brytare permanent.

## 3. Körningen

Kör **från reporoten** — `spec` och `worker_cmd` pekar repo-relativt:

```
./controller/loop/cli run ~/.nortropic/kor/min-korning.json
```

**Terminalen är tyst medan en session arbetar.** Loopen skriver ingenting förrän ett varv
är avgjort. Mätt på premiären: tio till tjugo minuter per task, och två tasks tog ungefär
en timme. Skillnaden mellan *arbetar* och *hängd* syns inte i terminalen.

Följ den utifrån, från ett annat fönster:

```
ls ~/.nortropic/kor/workspaces/                       # vilket försök som pågår
git -C ~/.nortropic/kor/workspaces/<attempt> status --porcelain   # vad sessionen skrivit
cat ~/.nortropic/kor/state/events.jsonl               # vilka tasks som claimats
```

Attempt-katalogen heter `<run_id>-<task>-<försöksnummer>`, så `premiar-1-p-001-2` är
andra försöket på `p-001`.

## 4. Läs utfallet

```
varv 1 p-001: attesterad c721599bf09342a1d4141869be2ed911688492d3
varv 2 p-002: attesterad 95c33a34bd502575c099610c1cb06a8b04bbf98a
drain klar: 2 varv, 2 attesterade, base 95c33a34bd502575c099610c1cb06a8b04bbf98a
```

| Exitkod | Betyder | Vad du gör |
|---|---|---|
| **0** | Drain slutförd — backloggen är slut eller allt behörigt är gjort | Granska kandidaterna, för dem till main |
| **1** | Fel: trasig config, upptagen lease, brytarens anropsfel, städning som inte gick | Läs orsaken på stderr och åtgärda; ingen körning har skett |
| **3** | Rent stopp: brytaren öppnade och drainet avslutades före nästa claim | Se §6 |

Ett avbrutet varv skriver `varv N <task>: avbrutet i <steg> — <systerns klass ordagrant>`.
Steget namnger vilket led som brast: `workspace`, `kuvert`, `forsok`, `parse`, `policy`,
`verifierare`, `attest`.

## 5. Granska och föra till main

**Kandidaterna är commits utan gren.** Ingen ref pekar på dem; de nås bara via attesta-
tionsbutiken. Läs SHA:t där:

```
./controller/attest/cli ~/.nortropic/kor/attest read p-001
```

Kör **taskens egen grind** mot kandidatträdet — det är den dom kedjan inte kan fälla:

```
git worktree add --detach /tmp/kand <candidate_sha>
( cd /tmp/kand && ./verify/bin/<taskens exit_test> )
git worktree remove /tmp/kand
```

Parenteserna är avsiktliga: står du kvar i `/tmp/kand` när du river den faller `remove`
med *"Unable to read current working directory"* och lämnar en registrering efter sig
(mätt 2026-08-09). Blev det ändå fel: `git worktree prune` från reporoten.

Kedjande base gör att den SISTA attesterade kandidaten innehåller alla föregående. Är den
en ättling till main räcker en gren och en PR:

```
git branch kandidat-<run_id> <sista candidate_sha>
git push -u origin kandidat-<run_id>
gh pr create --base main --head kandidat-<run_id> --title "..." --body "..."
```

**Auto-merge är avstängt beslut.** Systemet producerar attesterade kandidater; människan
för dem till main.

> **Oreferade commits försvinner.** Ingen gren pekar på kandidaterna, så `git gc` kan
> städa bort dem när grace-perioden gått ut. Skapa grenen samma dag som körningen, eller
> acceptera att arbetet måste göras om.

## 6. När brytaren öppnat (exit 3)

Brytaren har ett tillstånd per task i `<brytare_rot>/<task-id>/tillstand.json`:

```json
{"oppen": false, "orsak": null, "forbrukat": 1, "fingerprints": {}}
```

`oppen: true` betyder att den tasken stoppar varje ny körning som når den. **Det finns
inget reset-verb** — h-015 äger återtaget och är inte byggd. Tills dess: läs orsaken,
åtgärda det som brast, och ta bort tillståndsfilen för just den tasken.

`forbrukat` är attempt-budgeten. Har den nått taket startas inget kommando för tasken,
och den förblir claimed resten av körningen.

## 7. Efter körningen — kontrollera att inget lämnades

```
git status --porcelain          # ska vara tom
git worktree list               # ska bara visa huvudträdet
ls ~/.nortropic/kor/workspaces/ # ska vara tom
ls ~/.nortropic/kor/lease/      # ska vara tom
```

Premiären lämnade allt fyra rent. Ligger ett workspace kvar rivs det med
`./controller/workspace/cli ~/.nortropic/kor/workspaces destroy <attempt>` — **destroy före
`rm -rf`**, annars blir föräldralösa poster kvar i `.git/worktrees` som fäller nästa
körnings `create`.

## 8. Kända gränser, mätta

**Leasens TTL är 180 s utan heartbeat.** Ett varv tog tio till tjugo minuter i premiären,
alltså långt över TTL:n. En andra controller kan i teorin ta över resursen mitt i en
levande körning. Kör aldrig två körningar mot samma `lease_dir` samtidigt.

**Kvoten.** En session per försök, tio till tjugo minuter var. Smoke-momentet mätte 8–20
sekunder — det var en trivial enfilsskrivning och säger ingenting om verkligt arbete.
Räkna om din kvotbudget efter den här siffran, inte den gamla.

**Timeouten.** Mallen sätter 900 s. Premiärens sessioner låg på tio till tjugo minuter, så
marginalen är tunnare än den ser ut. Höj den hellre än att låta ett halvfärdigt försök dö.

**Ingen notis.** `controller/notis/cli` (h-014) är obyggd. Tystnad efter en körning betyder
inte att allt gick bra — den är exakt lika tyst när något faller.

**Ingen livssignal.** Kedjan skriver ingenting medan en session arbetar. Använd §3:s
utifrånkommandon.

**Föräldralösa kandidatcommits.** Varje fallet försök lämnar en commit i objektdatabasen
som ingen ref når. De bryter ingenting, men `git count-objects -v` växer.


## G20 runtimegräns för buildern

Från ägarbeslut 2026-08-10 är builderns runtimegräns en del av h-017:s trustmodell. Controllern ska installera gränsen före builderstart.

- kandidatworkspacet får vara skrivbart,
- neutral scratch som controllern uttryckligen tilldelar får vara skrivbar,
- reporotens live control plane får inte vara skrivbar för buildern,
- controllerns pre-task trust-root får inte vara skrivbar för buildern,
- samma skrivgräns ska gälla barn även efter ny process-session.

Claude Codes managed sandbox ligger kvar som defense-in-depth men är inte Nortropics root-of-trust. controller/launch/cli är kommandoagnostisk, därför måste den controller-ägda gränsen gälla oberoende av worker-kommando.

Ägarterminalens fristående Seatbelt-probe gav PARENT_INSIDE=PASS, CHILD_INSIDE=PASS, CHILD_OUTSIDE_DENIED=PASS, OUTSIDE_SENTINEL_ABSENT=YES och PROBE_EXIT=0.

K18R i verify/bin/h-017-exit binder samma runtimeegenskap genom Nortropics launchväg. Baslinjen mot den återställda h-017-WIP:n före implementation var avsiktligt röd: 23 PASS, 1 FAIL med `trust=WROTE/1 repo=WROTE/1`; K19 och K20 förblev gröna.

Gränsen är nu implementerad i `controller/launch/cli` med absoluta `/usr/bin/sandbox-exec` och en parameteriserad Seatbelt-profil. Launch provar att profilen går att installera **innan** buildern startas. Saknat binär, ogiltig profil, tom/relativ trust-root eller en värd som vägrar Seatbelt ger `launch_failed` och ingen rå fallback. Profilen använder `allow default` så workerkommandot förblir kommandoagnostiskt och workspace/neutral scratch förblir skrivbara; den nekar samtidigt filskrivning under controllerns run-root och live-repot. Workspacekatalogens egen entry och `.git`-pekare är skrivskyddade, medan produktfilerna under workspacet är skrivbara.

Git har en uppmätt, smal exception därför att h-016:s motfall måste kunna göra en verklig detached självcommit innan kedjan fäller den: common object store och det **aktuella** worktreets adminyta (bland annat HEAD/index/COMMIT_EDITMSG/logg) är skrivbara. Common config, hooks, refs, info/alternates, andra worktrees samt workspacets `.git`-pekare är fortsatt nekade. Det här ska inte beskrivas som att hela `.git` är skrivskyddad; exceptionen är den minsta yta h-016:s legitima provform mekaniskt behöver.

Loopen märker hela sin privata temp-root — snapshot, kuvert, rapporter och verifierarens senare kandidatvyer — som `NORTROPIC_TRUST_ROOT`; verifierarprocessernas `TMPDIR` pekas till samma rot. Därmed kan ett kvarlevande builderbarn läsa sitt kuvert men inte förskapa eller byta controllerfiler eller domvyer. Seatbelt ärvs genom fork/exec och efter ny process-session; `start_new_session`, timeout och processgruppsdödning ligger kvar i launch.

Slutmätning i Seatbelt-tillåten hostmiljö utanför Codex nästlade sandbox: h-009 **11/0**, h-002 **6/0**, h-003 **8/0**, h-011 **16/0**, h-016 **25/0**, h-017 **24/0** inklusive K18R/K19/K20 och invarianterna **8/0**. Launchs fallsamling gav **53 rätt, 0 fel**. Separata prober visade: om Seatbelt inte kan installeras blir utfallet exit 3 och workermarkören saknas · explicit tom trust-root vägras före worker · kandidatprodukt är skrivbar samtidigt som workspace-`.git` och live hook nekas. Körs launch inuti en redan installerad värdsandbox som förbjuder nästlad Seatbelt ska den alltså falla stängt; ownergrindarna måste köras i den ägarterminalmiljö där macOS-gränsen får installeras.

<!-- CODEX-AUTOPILOT-V2-DRIFT -->
## Codex Build Autopilot v2

Start/diagnostik:

```bash
nortropic-codex-autopilot doctor
nortropic-codex-autopilot run
```

Normal obemannad körning använder Codex `--ask-for-approval never --sandbox danger-full-access`. Behörighetsläget är inte trust authority; frozen gates, immutable candidate SHA, independent review och mechanical final gate är transitionsvillkoren.

Evidence/checkpoint finns under Git common-dir `.git/nortropic-codex-autopilot/`. Den katalogen är inte backlog eller verdict store. Efter avbrott re-deriveras state från Git/worktrees/PR/gates. Ingen force/amend/reset/rebase-remediation används.

<!-- CODEX-AUTOPILOT-V3-DRIFT -->
## Codex build-autopilot v3 — hela kontrollplansroadmapen

V3 använder exakt ägarlåst roadmap på `0b3212c991d4227c8df2656465ae2c0252dda39e` och fortsätter efter h-003/h-004 genom S2, S4–S13 och den empiriska slutkörningen. `OWNER_DECISION_REQUIRED` från en roll är en intern signal till `$nortropic-architect`; den stannar inte supervisor-processen i sig.

Observera utan att styra:

```bash
tail -F "$HOME/Library/Logs/Nortropic/codex-autopilot-v2.log"
"$HOME/.local/bin/nortropic-codex-autopilot" status
"$HOME/.local/bin/nortropic-codex-autopilot" roadmap
```

`status` visar senaste journalhändelsen. `roadmap` mäter aktuell `origin/main` och visar S2/S4–S13 som `UNFROZEN`, `RED`, `GREEN` eller `UNJUDGEABLE`; empirisk closeout L syns som journalhändelserna `EMPIRICAL_UNATTENDED_RUN_PASS` / `FULL_ROADMAP_COMPLETE`. Utsagan är observationsyta och aldrig scheduler-authority.

Supervisorens lokala label och logg behåller namnet `v2` vid cutover för att återanvända den redan bevisade LaunchAgent-gränsen. Versionen avgörs av `origin/main:scripts/nortropic-codex-autopilot.py` och `doctor` ska efter v3 svara `FULL_ROADMAP=YES`.

Om v3 når en verklig `HUMAN_AUTHORITY_HARD_STOP` tas supervisor-enable-markören bort och macOS-notisen skickas. Efter att den externa/human-only förutsättningen är uppfylld återupptas samma mekaniska state utan ny installer med:

```bash
"$HOME/.local/bin/nortropic-codex-autopilot" resume
```

S7 har en uttrycklig extern prerequisite från den frozen planen: GitHub App **Nortropic Promoter**, installerad endast för `Nortropic/nortropic-system`, Metadata:Read + Contents:Read&Write, och endast PR-requirement-bypass. V3 får bygga fram till den gränsen men får inte fabricera eller ersätta appen med användarens bredare `gh`-credential.


### Liveöversikt

```bash
~/.local/bin/nortropic-codex-autopilot watch
```

Kommandot läser endast journal, supervisor-markörer och worktree-lista. Det startar inga gates och
muterar inget repo. För full roadmap/gate-status:

```bash
~/.local/bin/nortropic-codex-autopilot roadmap
```

Stage L ägs av den frysta programnivå-gaten `verify/bin/autonomous-loop-exit`; independent
empirical-runner är en falsifierande andra blick, aldrig ersättning för gate PASS.

## 2026-08-11 — Harness Substitution Amendment v1

- Product goal remains: autonomous Nortropic website factory.
- Kernel target: provider-neutral Trust Kernel; agent-provider workflow is not trust authority.
- Original frozen roadmap SHA remains effect/negative-control authority: `0b3212c991d4227c8df2656465ae2c0252dda39e`.
- New owner implementation-shape authority: `docs/loop/harness-substitution-contract-v1.md`.
- Migration floor after S3: SUB-1/h-027 → SUB-2/h-028 → SUB-3/h-029 → SUB-4/h-030.
- S2/S4/S5 must not freeze without h-030 dependency after this amendment.

## 2026-08-12 — Codex provider identity authority before h-031

Owner separates executable/provider provenance from h-031 source-level launch policy. New task
`h-032` owns an owner-frozen `config/codex-provider-identity.json` and the runtime boundary that
verifies the locked native executable, ignores PATH, launches a private rehashed snapshot and
fails closed on symlink/path/hash/identity drift. `h-031` depends on h-032 and must not use a
`basename == codex` test as provider-identity proof. Autopilot remains paused until h-032 is
independently reviewed, owner-frozen and implemented through the normal builder/reviewer gates.
- Pre-amendment quota-aborted h-003/h-004 worktree is preserved local evidence, not authority, not a resume candidate.
- No frozen gate, constitution/rulebook boundary, G20, candidate identity, attestation/fencing, promotion identity or no-force rule is weakened by this amendment.
