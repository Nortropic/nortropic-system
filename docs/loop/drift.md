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
- Pre-amendment quota-aborted h-003/h-004 worktree is preserved local evidence, not authority, not a resume candidate.
- No frozen gate, constitution/rulebook boundary, G20, candidate identity, attestation/fencing, promotion identity or no-force rule is weakened by this amendment.

## 2026-08-13 — Python interpreter-authority prerequisite r3

This is owner-authorized prerequisite-gate remediation before H-034, not H-034/H-033/H-032/H-031
production or runtime work and not a task in `specs/tasks.spec.json`. R2
`10844933033015fc56493bebeae24a29fa657f0e` was independently reviewed and rejected before
freeze: R-004 proved its candidate audit followed an active repository-local `refs/replace`
mapping and bound substituted authority/gate bytes to the original SHA; R-005 proved its
review-relative documentation became false when review occurred. R2 was never frozen or
published. R2 and all earlier rejected candidates remain forensic evidence only and are not
authority.

R3 retains the owner-audited authority JSON byte-for-byte and keeps the sound R2 controls:
absolute `/usr/bin/python3 -I -S` judging; one duplicate-aware exact-type authority object;
wrong-type, duplicate, missing and extra rejection; semantic reorder/whitespace/escape
acceptance; absolute non-symlink regular executable identity; exact Python 3.12.13 and digest;
fixed target invocation; stale-path and invalid-object controls; direct-child topology; exact
four-path scope; and equality between executing gate bytes and candidate gate bytes. Candidate
Git commands use absolute `/usr/bin/git` with an isolated caller environment and the explicit
no-replacement object view. The candidate's direct parent is read from its raw actual commit
object rather than replacement-/graft-aware ancestry traversal. Thus repository replacement
state may change default Git presentation but cannot supply the bytes or parent used by a
successful R3 audit of the original 40-hex SHA.

The gate remains a judge, not runtime authority. Future H-034 must implement verified source →
private protected snapshot → final rehash → protected-path execution. R3 makes no claim of
arbitrary same-UID race-free source-path execution. The legitimate owner prerequisite is expected
GREEN, so a generic RED baseline is not manufactured. Independent review is a mandatory
precondition for R3 publication; this candidate records that rule and contains no assertion that
R3 received a passing review verdict.

On 2026-08-13 the owner removed interactive approval only for the bounded remaining-bootstrap chain
while retaining every mechanical gate, identity, reviewer, empirical, scope and fail-closed
precondition. H-035 is freshly re-materialized from authoritative main `15693f9…`; old H-035
candidates are design evidence only. The migration preserves current Python-interpreter authority,
all sound R12 owner/task/gate/Git-object controls and H-034 absence. It additionally freezes guarded
normal merge-commit publication: immediate base/candidate/remote/PR/file relock, `--merge` only, and
post-merge proof of exact two-parent order plus candidate-identical tree. Production remains RED.

The independent gate review of the first fresh candidate found that publication was still inferred
from source tokens and disconnected Git-shape fixtures. The frozen gate now calls the real
production `publish()` against disposable repositories and a hermetic GitHub command boundary.
It observes the non-force branch push, complete repository/PR/base/head/file relock, guarded
`gh pr merge --merge`, GitHub merged state, returned merge identity, fetched `origin/main`, ordered
parents and candidate-identical tree as one operational chain. Hostile repository/PR metadata,
main drift, wrong remote head or files, unmerged state, returned-SHA mismatch, malformed parent
topology and tree mismatch all reject. A gate-local conforming witness proves the rig satisfiable;
the dead-token/no-op publisher rejected by the same effect checks proves source text is insufficient.

R2 independent review then showed that its judge performed the decisive postmerge Git inspection,
its fake accepted a nonexistent GitHub JSON field, and its publication request omitted frozen
spec/gate/review identities. R3 moves acceptance to the publisher's observed process effects: the
actual module subprocess boundary records both helper-mediated and direct invocations; only real
supported GitHub fields are modeled; the request carries candidate-bound task/spec/gate plus
independent-review identities; and immediate premerge reads must verify them. After GitHub reports
the merge, the publisher itself must fetch main, compare the mergeCommit SHA, inspect exact ordered
parents, and compare candidate/merge trees. Dedicated omission and direct-subprocess mutants reject.

R3 independent review found that command presence still did not prove response-dependent behavior:
a publisher could invoke all postmerge probes, ignore every output and let judge corroboration mask
the omission. R4 records `publisher_rejected` separately from actual graph correctness. It injects
hostile main/parent/candidate-tree/merge-tree responses while leaving the real merge valid, and also
runs malformed returned-SHA/parent/tree graphs through the real publisher. Each requires the
publisher itself to raise. A complete-trace ignore-output mutant therefore fails the frozen
production negatives rather than being rescued by judge-side Git inspection.

R4 independent review then demonstrated that replacing the module's `subprocess` name after import
missed callable aliases captured during module execution. R5 installs wrappers before `runpy`
executes the subject and restores host functions afterward; captured `run`, `Popen`, `check_output`,
`check_call` and `os.system` aliases retain the audited boundary. Each form is tested with an
absolute unexpected executable that is denied without execution, and separately with legitimate
absolute Git that passes. The prior identity, response-validation and graph controls remain intact.

R5 independent review found that executable classification still trusted the requested basename.
R6 captures real Git/GitHub canonical paths and SHA-256 identities before subject execution. Bare
names use only the captured host PATH identity; harness symlinks pass only by resolving to an exact
audited target. Absolute same-name fakes and PATH shadows are denied before marker execution, as is
a byte-identical Git copy at another canonical path. Both exact system Git identities available on
the owner host and the hermetic Git/GitHub reference symlinks remain positive.

The fresh H-035 production candidate from authoritative main `b3137f3` closes the published RED
contract at 303 PASS and 0 FAIL with `MATERIAL_PROPERTIES_JUDGE_ONLY=NONE`. It re-materializes the
R12 owner workflow without importing old history, preserves frozen Python interpreter-authority
bytes, and adds the effect-bound guarded publisher. Focused historical taskval, policy and H-007
checks pass. The owner-terminal V6 subgate is `ODÖMBART` in the builder sandbox because `ps` is
denied; no product failure is inferred from that environment limitation. No push or merge occurred.

After H-035 publication at authoritative main `c883720`, H-034 is freshly materialized as the next
owner-authority task. Current owner sources and the exact registry agree on C, arm64 macOS, an exact
final signed Mach-O, zero third-party runtime dependencies, Apple system runtime/dyld only, a fixed
finite verification plan, and no Python runtime authority. The only owner surface is the four
registry-reserved H034 families; H-033 remains intentionally absent and will consume H-034 later, so
H-034 depends only on final H-035. The frozen gate retains the valid historical closed-argv,
codesign `-dvvv` CDHash, LC_UUID/loadability, deterministic unsigned build, stable semantic/Mach-O,
same-descriptor, fresh metamorphic tri-state and bounded process-group requirements without adopting
stale history. It additionally mutates each receipt schema and recomputes the dependent evidence
digest, isolating strict receipt parsing from digest mismatch. Production remains RED on exactly the
four missing owner artifacts.

The independent review of that first fresh H-034 candidate found three gate defects rather than an
authority conflict. The additive remediation makes the exact manifest schema satisfiable and binds
`language=C`, the final artifact/recipe/source digests and every observed Mach-O field consistently.
It executes the closed production recipe in two disposable trees, proves deterministic unsigned
output, signs and compares stable native identities, and tests inherited same-open-description,
nonregular and bounded-input behavior. Fresh black-box evidence/receipt/allowlist families now isolate
every schema and cross-binding defect; a real arm64 C consumer that is receipt-focused, uses substring
evidence and ignores the allowlist is caught. Production remains absent and RED only on its four paths.

R3 closes the remaining semantic input-space gap with isolated black-box rows. An unchanged valid
receipt paired with a different valid-hex evidence digest now rejects as a relation failure. Exact
schema versions and observer authority, empty/invalid allowlists, receipt/allowlist size and trailing
data, and missing/duplicate/malformed forms of every required descriptor/binding argument are sent
through the production kernel. Receipt-dependent evidence is recomputed only where needed to isolate
the intended parser, exact-value or finite-bound defect. The valid positive and real permissive arm64
C mutant controls remain intact; production remains absent and RED only on its four owner paths.

After the first native implementation review exposed C-prefix acceptance of a decoded escaped NUL,
the contract was freshly extended from published main rather than from an unpublished test-author
branch. Black-box rows now inject escaped NUL, embedded control and lone-surrogate sequences into
every material evidence, receipt and allowlist string while preserving dependent receipt digests.
Exact decoded byte length plus bytes is required; a legitimate Unicode probe/path/marker family stays
positive. The vulnerable native artifact is RED and the additive builder fix is GREEN in disposable
composition; neither production lineage is copied into this contract-only candidate.

Final implementation review then showed that the per-document U+0001 rows could reject only through
a cross-document mismatch while a consistently bound decoded control still reached VERIFIED. The
fresh additive gate now runs the complete U+0000..U+001F matrix over probe identity, path and effect
marker, updates every related caller/document binding and recomputes the receipt digest. U+0000 probe
identity stays in parser-only document controls because an operating-system argv cannot carry NUL;
its path and marker rows remain coordinated. The existing legitimate Unicode positive is unchanged.

After final H-034 publication at authoritative main `9436387`, H-033 is freshly materialized from
that main as an ordinary authenticated-runner task depending exactly on H-034. Current H-034 is the
architecture authority: H-033 owns protected origin and safe opening, supplies the exact three
already-opened evidence/observer-receipt/allowlist descriptors, and delegates semantic judgment to
the exact frozen native kernel with candidate/spec/gate/probe/request/result bindings. The new
contract does not import the historical launchd service shape. It freezes effects and identities:
OS-resolved `_nortropic_provenance`, an independent root-owned observer, protected canonical roots,
fresh caller-unselectable request IDs, no-follow same-opened-object traversal, and exact H-034
handoff. The disposable gate surface exists only to exercise path substitutions and a deterministic
rename race; it cannot select authority during the normal verify operation.

H-034's former phase assertion that H-033 was absent is monotonically replaced by exact-one H-033,
dependency `h-034`, and canonical `verify/bin/h-033-exit` lifecycle checks. Absence, duplication,
wrong dependency and wrong gate are explicit adversarial controls. All prior H-034 semantic,
artifact, rebuild and identity controls remain unchanged; the materialized phase runs H-034 green.
H-033 itself is RED only because `controller/provenance/cli` is absent. No provenance production
implementation or external provisioning is created by this contract candidate.

The same phase reconciliation is applied additively to H-035's lifecycle-only assertions. Its stale
H-034-task/byte absence checks become exact published H-034 plus exact materialized H-033 identity,
dependency and canonical-gate checks, with absence/duplicate/wrong-dependency/wrong-gate mutants for
both downstream tasks and an exact four-file H-034 artifact set. H-035's owner routing, publication,
identity, atomicity and provider-observation mechanism controls are otherwise byte-for-byte unchanged.

The H-033 builder candidate adds one closed provenance CLI. Its fixture-only gate operation performs
protected no-follow opens, stable bounded reads and exact descriptor handoff to the repository H-034
kernel; normal verification never accepts a caller-selected authority root or kernel. Production
request creation is delegated only to fixed protected OS helpers and fails closed when the canonical
producer identity or authority installation is unavailable. On an unprovisioned host this boundary is
ODÖMBART by the frozen contract, while all disposable product controls remain judgeable.

Independent review of the first H-033 contract found that live owner acceptance required an evidence
leaf owned by merely any non-requester UID. The additive remediation applies one shared live-`lstat`
predicate to judge controls and canonical owner acceptance: evidence UID must equal the exact
OS-resolved non-root `_nortropic_provenance` UID, receipt UID must equal root, the two inodes and UIDs
must differ, and neither leaf may be group/other writable or a symlink. A live separated-ownership
positive and root-writes-both, requester-owned and symlink negatives run before the component RED.

H-033's normal H-034 execution boundary additionally requires an externally provisioned canonical
`provenance/bin/h034-kernel` hard link. Every fixed parent and the leaf are opened no-follow and must
be root-owned and non-group/other-writable; the leaf must be executable and the same device/inode as
the repository H-034 kernel whose bytes are bound to the frozen Git-object manifest and artifact
digest. Opened parent, repository and protected-link identities remain stable through execution, and
the protected pathname must still name the same inode afterward. The disposable `gate-verify` path
continues to exercise the repository kernel without claiming normal authority. No repository code
provisions this root-owned link; its absence or mismatch is an external-owner ODÖMBART boundary.

Single consumption is delegated to the fixed root-owned protected
`provenance/bin/request-consumer` authority before the normal H-034 handoff. The exact operation is
`consume` with only the request ID and frozen task/candidate/spec/gate/probe/result bindings; no
command, path or authority selector is forwarded. Exit 0 is the one atomic authorization, exit 1 is
denial or replay, and service/identity/timeout/cleanup failure is ODÖMBART. The observer-owned
external authority validates the token against its request state and never exposes its state store to
repository code. Consumption is deliberately not rolled back after any later kernel failure, so a
failed first handoff cannot revive the request. Fixture-only differential verification does not
consume external owner state.

The previously external H-033 authority is now versioned under its frozen production surface without
claiming that repository ownership supplies root authority. A root-run fixed-destination installer
copies only reviewed digest-bound native service/probe bytes and the exact H-034 Git object into
`/Library/Application Support/Nortropic/provenance`; it requires a pre-existing, distinct
`_nortropic_provenance` OS account and creates root/protected bin, probe, receipt and one-time state
directories plus a producer-owned evidence directory. The installed service has only three basename
interfaces. Producer generates the request ID and executes one fixed digest-bound probe after UID/GID
drop; observer independently verifies the protected allowlist and exact effect before writing its
receipt/pending token; consumer performs the irreversible pending-to-used atomic rename. Repository
runtime code cannot select an install root, service, probe, result, destination or command and never
copies an executable at handoff. The installed H-034 kernel and service bytes must stay identical to
their exact candidate Git objects across execution. On this unprovisioned owner host, normal H-033
remains ODÖMBART until the external root ceremony is deliberately executed; no sudo or `/Library`
mutation occurred during this builder slice.

Independent review found a native failure-path hazard that the successful-probe tests could not
exercise: after `fork()` returned `-1`, the old loop could interpret that value as the wildcard
`waitpid`/`kill` target. With another child remaining live, the timeout path could reach
`kill(-1, SIGKILL)`. H-033 now treats every nonpositive fork result as a terminal closed error before
any wait/signal operation. The only signal helper requires a positive PID; waits use monotonic elapsed
time without deadline addition, retry `EINTR`, and never equate an error return with the requested
child. A deterministic linked syscall shim reproduces the exact failed-fork/live-wildcard condition
and proves immediate exit, no `kill(-1)`/`kill(0)`, and no evidence write. The same audit bounds the
producer writer child, verifies the complete post-setuid identity, checks exec-environment setup, and
makes installer subprocess/write failures explicit. Signed native bytes and their candidate bindings
were regenerated; the external root ceremony remains unexecuted.

The first provisioned owner-environment run exposed a Darwin group-list failure before any producer
evidence was created. A compile-time-only diagnostic build of the same service path proved that
setgroups/GID/UID transitions all succeeded. A second numeric diagnostic then proved Darwin returned
the eight Directory Services memberships of the resolved `_nortropic_provenance` account after UID
transition: `309,12,61,701,703,702,100,704`, exactly matching the OS account record. Both the zero-entry
and one-entry candidate postconditions were therefore invalid machine-local assumptions. The drop now
requires successful clearing before GID-before-UID transition and exact real/effective dedicated UID/GID;
it does not reinterpret the OS-resolved account's membership list. A linked Darwin-semantics control
reproduces the eight-entry result, while independent mutants prove setgroups failure and wrong IDs still
reject before evidence. Diagnostic logging is absent from production, and live authority is unchanged.

## 2026-08-14 — Fresh H-032 exact provider identity after H-033

Authoritative main `5baee0e` closes H-033 and is the only base for the new H-032 contract. The old
`1cf2caf..878445b` H-032 line remains forensic evidence only. Its useful physical findings survive:
macOS has no portable descriptor-exec primitive for this Python boundary, so one safely opened source
object is copied to a private snapshot, the snapshot is finally rehashed, and absolute-path execution
is protected by the already frozen controller G20/Seatbelt trust root. The impossible claim that a
pathname alone is race-free against every same-UID process is not revived.

The measured provider authority is the actual OpenAI Codex vendor Mach-O, not `/opt/homebrew/bin/codex`
or its JavaScript/Node delegation layer. Its current absolute path and SHA-256 are frozen in
`config/codex-provider-identity.json`; SHA-256 is the exact-byte authority, while the observed Developer
ID signature remains corroborating context rather than a second acceptance system. Every start must
reread one duplicate-free authority document and revalidate a no-follow opened regular executable,
copy only those bytes, rehash the private executable, and pass that absolute snapshot as argv[0]. PATH,
basename, caller configuration, a prior successful validation and a stale snapshot grant no authority.

H-032 depends exactly on H-033. It does not alter H-033's fixed probe allowlist or reinterpret a generic
PASS probe as provider identity. Instead the frozen H-033 gate and protected owner installation are a
fresh upstream provenance prerequisite, while H-032 owns only the downstream executable identity effect.
The G20 containment probe remains independently candidate/spec/gate/launcher-bound because H-033 does
not replace H-017's runtime namespace authority. Nested sandbox denial is ODÖMBART; the owner runner is
required for the actual H-033 and Seatbelt effects. Before builder implementation the only legitimate
product RED is the absent provider-identity boundary in `scripts/nortropic-codex-autopilot.py`.

Independent review rejected the first fresh gate because its shell bootstrap inherited caller PATH,
its historical `--g20-evidence` input was self-asserted JSON rather than authenticated effect, and it
did not execute the production generic non-provider dispatcher. The remediated gate uses canonical
absolute judge/tool identities and a fixed validated private cleanup root. G20 authorization is now
live-only: JSON may be emitted after a real candidate-bound probe for durable evidence, but no JSON can
be supplied back to obtain PASS. Separate production controls execute system Git, GitHub CLI and an
arbitrary fixed controller-style helper through `run()` and require exact effects with no AGENT_START.

## 2026-08-14 — H-032 builder: provider identity becomes an execution boundary

The provider-only launch path now rereads one strict authority document at every attempt. Both the
authority and executable are opened with no-follow semantics; regular-file identity, executable mode,
bounded complete reads and stable metadata are decided on those opened objects. Only the verified
bytes are copied into a newly private root, and the copied executable is rehashed immediately before
the provider trust transition. The source pathname is never reopened to populate or execute the
snapshot, so a same-byte hard link remains admissible while symlinks, PATH shadows and pathname swaps
gain no authority.

`AGENT_START` occurs only after the final digest check. The absolute snapshot argv[0] is passed through
the existing controller launcher with the private root as its G20 trust root; provider descendants are
therefore denied write/chmod/unlink/rename/create authority over both snapshot and namespace. The root
is removed on success and every failure path. The generic `run()` dispatcher is deliberately untouched,
preserving exact Git, GitHub and fixed helper effects without producing provider lifecycle events.

The frozen gate's deterministic identity negatives, opened-object races, final-rehash mutation and
cleanup controls are judgeable in the builder sandbox. Actual provider success, namespace denials and
fresh protected H-033 provenance require the ordinary owner runner because nested Seatbelt is rejected
inside the builder sandbox; those effects remain explicitly ODÖMBART here rather than being simulated.

Independent review then found a boundary ordering defect: the absolute G20 launcher still had an
`/usr/bin/env python3.12` shebang, so caller PATH could execute attacker code before the launcher
installed Seatbelt. The provider path now reads the already frozen Python interpreter authority,
verifies its canonical no-follow regular executable and exact digest, and invokes that absolute
interpreter with isolated `-I -S` flags. It does not sanitize or replace the provider environment;
PATH reaches the provider only after the trusted controller process has established G20. A disposable
fake `python3.12` placed first in caller PATH was not invoked, while the provider remained a descendant
of the real launcher and all six namespace attacks stayed denied.

The next review correctly rejected that candidate's partial consumption of the separate Python
interpreter authority: hashing one opened descriptor and later executing its pathname did not satisfy
that authority's full same-opened-object private-snapshot model. H-032 now makes no Python-authority
claim. It relies on the already frozen H-017 launcher trust boundary and closes only the environment
that reaches the launcher's pre-Seatbelt `/usr/bin/env` step: fixed non-caller PATH and removal of every
caller `PYTHON*` variable. Other provider environment is retained. Dedicated fake PATH and
launcher-specific `sitecustomize` controls remained silent; the actual provider still ran below the
real launcher with G20 namespace attacks denied.

Review also demonstrated that a preserved caller `HOME` enabled Python 3.12's user-site
`usercustomize.py` before the script and therefore before G20. Removing HOME would break the
provider's credential environment, so the launcher environment instead forces no-user-site and safe
path startup, disables bytecode emission, strips all caller `PYTHON*`, and explicitly strips Darwin's
non-PYTHON-prefixed `__PYVENV_LAUNCHER__` framework redirect. HOME and unrelated provider variables
remain intact. A combined hostile HOME, usercustomize, PATH, PYTHONPATH and pyvenv-launcher run left
all intercept markers absent and retained the live provider/G20 effects.

Environment controls alone still left interpreter selection at an owner-writable Homebrew symlink and
allowed global site/`.pth` processing before G20. The final correction consumes the existing Python
authority completely rather than partially: exact 14-key semantics, canonical no-follow opened object,
regular/executable mode, stable bounded bytes and exact digest. Those opened bytes are copied next to
the provider snapshot in the same private root. Immediately before `AGENT_START`, both executables are
rehashed and protected; the absolute Python snapshot runs the exact `-I -S` flags and absolute launcher.
The provider environment is otherwise retained, but `DYLD_*`, `LD_PRELOAD`, `LD_LIBRARY_PATH` and
`__PYVENV_LAUNCHER__` are removed because they can execute or redirect code before isolation/G20. A
constructor dylib plus hostile global/user site, PATH, HOME and Python-family inputs produced no marker.

## 2026-08-14 — Fresh H-031 role routing after published H-032

H-031 is rematerialized from authoritative main `32b6e07`; every historical H-031 gate and candidate
remains forensic evidence only. The task is ordinary, depends exactly on H-032 and owns no new provider,
session or verdict component. Its effect is the route received by the actually spawned provider process
through H-032's exact opened-object, co-snapshot, final-rehash and G20 boundary. Provider prose, a would-be
argv variable and a paid live response are not routing authority.

The owner-frozen matrix remains `gpt-5.6-sol` for all six runtime roles, with `high` for BUILDER and
`max` for ARCHITECT, TEST_AUTHOR, GATE_REVIEWER, REVIEWER and EMPIRICAL. This matches the machine's
current owner configuration and active Codex model surface. Codex CLI 0.147.0 exposes `-m/--model`,
`-c/--config`, `model_reasoning_effort` and `--ignore-user-config`; H-031 therefore binds exact actual
argv and requires user configuration to be ignored. Backend availability and model self-report are
deliberately outside the deterministic verdict.

The frozen pre-builder baseline is exactly four product failures: absent actual role route, absent
AGENT_START route binding, unknown-role effects before rejection, and a generic `run()` boundary that
does not yet reject a Codex basename. H-032 itself is freshly green at 71/0. The new source-form control
retains Design B's explicit composition boundary—one Popen site, one generic subprocess.run site and the
literal watch clear—while auditing the whole module for methods, lambdas, defaults, containers, aliases,
dynamic attribute access and dynamic code. It admits ordinary non-provider helpers and harmless role
call consolidation, so it does not revive the abandoned general Python dataflow evaluator.

Independent review found three gate omissions before publication. Codex accepts attached short model
and config forms, which can carry competing routing authority; the route oracle now parses and mutates
those forms. Dynamic `importlib` and computed `__import__` could create an uncounted process boundary,
so the source-form audit rejects those dispatch mechanisms explicitly. Finally, persistent-state
comparison alone could miss a provider snapshot created and cleaned before an invalid-role rejection.
The invalid-role oracle now replaces the production snapshot function with a recording tripwire and
requires that it is never reached, while retaining the journal, run-directory and provider-effect checks.

A second review demonstrated why security oracles cannot privilege today's helper names. Attached
profile and dangling known selectors are now part of the closed route grammar. Builtins and reflected
module registries join importlib as prohibited alternate dispatch sources, with only production's exact
read-only `__file__` selftest lookup admitted. Most importantly, invalid-role ordering is now observed at
the effect boundary with a scoped audit hook: file creation/writes/removal/rename/link/chmod and process
start are recorded even when implementation inlines, renames or cleans its snapshot helper. The existing
persistent journal, run-directory and provider capture comparisons remain independent corroboration.

Third review found that Python audit events alone are not a native-syscall sandbox: a newly imported
`ctypes` module could call libc below the observed event set, and reflected or aliased `sys.modules`
could recover subprocess. H-031 needs no new dependency to add a constant role policy, so the bounded
Design B envelope now freezes the product's exact existing import inventory. Bare or reflected `sys`
is rejected; only direct non-registry attributes already used by production remain admissible. This
composition makes the effect hook meaningful without claiming it observes arbitrary native code.

Fourth review then recovered dynamic import through private state on modules already in the frozen
inventory. The final reflection envelope is structural: all private attributes are rejected except the
single exact `super().__init__()` call already present, and `getattr` is admitted only for the two exact
read-only `os.O_*` fallback constants production uses. Module dictionaries, reflected builtins, Python
frames and function globals are explicit mutants. This closes the path that dynamically recovered FFI
and keeps the scoped audit hook within the source domain it can actually observe.

Fifth review found a remaining composition error: a safe-form check on a builtin call is ineffective if
the builtin can first be stored under another name. Sensitive builtin names are now capabilities at
every load site. `getattr` and `globals` must be the direct callee of their separately checked exact safe
forms; all references or aliases reject. `vars`, `locals`, dynamic-code and import builtins reject on load.
Mutants cover assignment aliases that previously recovered ctypes without adding an import node.

Sixth review found two native process constructors omitted from both layers: `os.fork` and
`os.forkpty`. A forked child inherits the Python audit hook but mutates a copied observation list, so
the parent cannot rely on the child's recorded events. Both APIs are now prohibited process sites in
the whole-module source envelope, and their audit events are also forbidden before role validation.
Direct fork/forkpty mutants prevent the omission from recurring.

Seventh review confirmed the parent-side fork observation, but found that modules already loaded can
publicly re-export other module objects. A Name-rooted matcher therefore missed `subprocess.os.fork()`
and equivalent chains. Attribute access to sensitive process, import and FFI module proxies is now
forbidden independently of the root object, while direct approved modules remain governed by the exact
import inventory and their enumerated process APIs. Proxy fork/spawn/registry mutants bind the closure.

Eighth review recovered a frame without private syntax by installing public sys trace/profile callbacks;
the frame's public globals then exposed subprocess and dynamic import. Direct sys access is now frozen to
the six attributes the current product already uses. Trace, profile, hooks, frames and registries are not
available to H-031 implementation. Ambient module-loader globals plus builtins that can invoke dynamic
debug/help machinery also reject on load. Dedicated mutants bind each newly closed capability.

Ninth review recovered globals from public frame carriers without calling sys: generators, coroutines,
async generators and tracebacks expose frame objects, whose public namespaces contain subprocess and
builtins. All frame-carrier and frame-namespace attributes are now sensitive reflection and reject in
the whole module. None exists in current production; four independent mutants bind the carrier family.

Tenth review demonstrated that a synchronous before/after oracle can be outrun by a delayed callback:
`subprocess.threading.Timer` scheduled a real provider path after the audit window closed. Public proxies
for threading, signal, exit handlers, schedulers, futures and finalizers now join process/import/FFI
modules in the sensitive set. Timer, signal, atexit and weakref-finalizer mutants bind this asynchronous
effect class; current production uses none of those proxy capabilities.

Eleventh review found two delayed paths without module proxies. An atfork callback combined with
`preexec_fn` fired on a later legitimate Popen, and cyclic `__del__`/yield-finally objects deferred work
to GC. Atfork is now a prohibited process callback; admitted process sites reject pre-exec, shell,
executable substitution and expanded keyword dictionaries. Since production contains no asynchronous
function, yield or await, those language forms and `__del__` are also excluded from the bounded source
envelope. In-place Popen mutants prove the one legitimate site itself remains constrained.

Twelfth review separated a lifecycle method's name from its installation: assigning an ordinary helper
to class key `__del__` creates the same delayed finalizer. Finalizer assignment, setattr/delattr and
dynamic three-argument type construction now reject; only current scalar schema `type(x) is/is not`
checks remain. The review also found direct process signaling outside both inventories. `os.kill` and
`os.killpg` are now prohibited source/effect APIs with independent mutants and audit-event binding.

Thirteenth review recovered dynamic class construction through a public `types.new_class` proxy and
placed executable/preexec substitutions into positional Popen slots. `types` is now sensitive, and the
sole Popen plus generic run site each require exactly one non-starred positional argument in addition to
the existing unsafe-keyword prohibition. In-place positional and starred mutants test the legitimate
site itself rather than adding an obviously extra process call.

Fourteenth review recovered finalizer installation without `types` or a direct finalizer target: a
metaclass `__prepare__` mapping injected the lifecycle key while Python executed an ordinary class-body
assignment. The source envelope therefore admits only the product's existing `__init__` lifecycle
method, rejects class keywords and literal finalizer keys, and binds the exact metaclass construction as
a mutant. The same review changed process-global cwd, environment and umask before invalid-role
rejection; the first three audit events had merely been omitted and umask emitted no event. Direct OS
access is now frozen to the exact current product attributes and its sole read-only environment form,
with process-state APIs prohibited. The runtime oracle independently snapshots cwd/environment/umask,
restores them after measurement, and aborts audited mutation operations after recording their attempt.

Fifteenth review aliased the builtin `type`, hiding dynamic class creation from the direct-call rule,
and moved already-admitted `os.write`/`os.close` capabilities before role validation. The latter mutate
descriptor state without Python audit events, so cwd/environment/umask snapshots alone were incomplete.
`type` may now be loaded only as the direct scalar schema call checked separately. Every current OS
descriptor-effect call is frozen by exact owner and count, preventing reference capture or an added site.
The invalid-role execution additionally replaces all available OS/process mutation functions and Popen
with recording guards that raise before invocation; stdout and stderr are isolated and must stay empty.
Those guards compose with, rather than replace, the audit hook, process-state snapshot and persistent
artifact comparisons.

Sixteenth review moved the effect before every previous observation by creating and removing a file at
module import. It also used the already imported `fcntl.flock` capability and stream objects captured
before stdout/stderr redirection. Subject import is now inside the same fail-before-operation audit and
OS/process guard boundary as invalid-role execution, with independent cwd/environment/umask and output
comparisons. Effectful module-level methods reject structurally. `fcntl.flock` is frozen to its one
existing lock owner/site and is guarded plus audited at runtime. Direct stdout/stderr objects are frozen
to the product's exact existing write and error-print forms, so neither stream can be retained for a
later bypass. Import create-clean, fcntl alias and captured-stream mutants bind each route.

Seventeenth review poisoned `sys.path` from a function default during import. Python import state was
absent from the process snapshot, even though the current product legitimately inserts its authority
library and enables no-bytecode mode at module load. Those two mutations are now exact source forms with
exact counts. Runtime import observation requires precisely one new leading authority path and bytecode
suppression, then restores the prior interpreter state. More fundamentally, a rejected source envelope
previously continued into `exec_module`; an unguarded `fcntl.fcntl/ioctl` could therefore act before the
eventual FAIL. Source or observer rejection now terminates before upstream or subject execution, while
fcntl/ioctl also join the audit and mutation guards as an independent backstop.

Eighteenth review retained the exact admitted `sys.path.insert` syntax while changing what its operands
meant: a reassigned `AUTHORITY_LIB` or shadowed `str` loaded attacker-controlled `core` before the
post-import path comparison. The authority assignment is now frozen as one exact AST object, and its
name, `Path`, builtin `str` and `__file__` cannot be rebound by assignments, parameters, functions or
classes. The same review removed a gap in the early-stop composition: complete required API presence now
joins task identity, upstream identity, source form and observer separation as a mandatory precondition
before either upstream execution or subject import. Authority-shadow and missing-API mutants bind both
transitions.

Nineteenth review used two binding mechanisms outside ordinary Name(Store). An exception handler stores
its `as` target as a string AST field, allowing temporary `AUTHORITY_LIB` replacement, and public
assignment to `Path.resolve` changed the exact expression's semantics before restoring the class. All
exception and global/nonlocal bindings of protected authority names now reject. `Path` itself is a
non-capturable capability: it may appear in annotations or as the direct constructor/class-method root,
but not as an alias, container value or class-attribute mutation target. The gate deliberately targets
the owner Python AST version; newer pattern syntax cannot compile there and therefore cannot reach
subject import. Exact exception-binding and public-monkeypatch mutants bind the closure.

Twentieth review showed that admitting every direct `Path` class-method call still leaked the class
through `Path.mro()`: the returned list exposed `Path` at index zero, where `resolve` could be replaced
and restored around the otherwise exact authority assignment. The product uses only `Path.home()` as a
class method. That exact zero-argument form is now the sole admitted class-method root; constructor calls
remain admitted. A class-container monkeypatch mutant permanently binds the reviewed bypass.

## 2026-08-14 — H-031 builder: explicit provider model routing

The existing H-032 provider boundary now selects its model route from one static role policy before
creating any run state. The six admitted roles all use `gpt-5.6-sol`; BUILDER uses reasoning effort
`high`, while ARCHITECT, TEST_AUTHOR, GATE_REVIEWER, REVIEWER and EMPIRICAL use `max`. Unknown, empty
and case-variant roles stop before journal lookup, snapshot creation or process effects.

The selected route is inserted into the actual provider argv as exactly one `--ignore-user-config`,
one model selector and one `model_reasoning_effort` override. The same in-memory route values populate
AGENT_START's model, effort and `AUTOPILOT_ROLE_POLICY` source, so persisted legacy routing remains
readable but cannot select a new launch. Hostile CODEX_HOME and PATH configuration did not alter the
spawned fake provider's observed argv.

The generic subprocess helper remains available for Git, GitHub, node and controller tools, but now
rejects any executable basename whose Unicode case-fold is `codex` before its sole subprocess.run site.
No alternate provider process component, session store or selector was introduced. The frozen whole-
module source audit and its process/import/reflection mutants remain the bounded enforcement surface.

## 2026-08-14 — H-031 post-publication dependency-preflight remediation

The first real file-backed observer execution after publication exposed a call-site conflict that the
frozen role-routing gate did not exercise. `ensure_dependencies()` retained two historical
`codex --help` probes through generic `run()`, while H-031 intentionally made that boundary reject every
Codex basename. Consequently both `status` and `doctor` stopped before their actual observer work.

The dependency preflight now checks executable presence without executing Codex. The removed help text
was not identity authority and could not certify the later process: provider identity, exact supported
model/effort argv and the actual process effect remain bound at the sole H-032-protected `run_codex`
boundary. Generic `run()` remains closed to Codex, and no subprocess site or alternate launch route was
added. Physical file-backed `status` and `doctor` runs now proceed through dependency preflight.

## 2026-08-14 — H-032 execution-family authority amendment after first launch

The first real autonomous launch falsified the single-executable H-032 model. The verified Codex 0.147
snapshot started and emitted `thread.started`, but stable `code_mode_host` resolves a required native
sibling named `codex-code-mode-host`; the isolated snapshot root contained only `provider`, so no
structured result was produced. This is a provider execution-family dependency, not a second provider
selector or a caller-configured helper.

Owner measurement binds the installed sibling at the exact native vendor path: arm64 Mach-O,
49,991,616 bytes, SHA-256 `a059beb029cdbc989e72e23f8680be9f703cb6cf83d9598d91041f82178d018d`.
The main provider digest remains `19c4f144c5226a9f17c58e6f0fa854843b0f77a6eb420f40e2745a12f10f5d37`.
Authority schema v2 binds both absolute paths and digests. The frozen H-032 amendment measures both
from no-follow opened objects, requires exact private basenames `provider` and
`codex-code-mode-host` in one root, final-rehashes both, directly executes only the provider, denies
namespace mutation of either under G20 and requires whole-family cleanup on every path. H-031's role
routing fixture is upgraded to the same family authority; its route and process-source controls are
unchanged. The owner pre-builder state is RED only for
`CODE_MODE_HOST_IDENTITY_BOUNDARY_ABSENT`; no production implementation is included here.

Independent gate review then found five ways a superficial family implementation could pass. The
amended controls now mutate provider and host independently at their launch-adjacent reads, with a
spawn-boundary fallback that exposes implementations which verified only immediately after copying.
The host's same-opened-object metadata is observed through fstat and raced against stale path
stat/access plus a nonexecutable symlink target. Every identity-negative attempt records any created
provider root and requires no partial member/root residue. Finally, the host fixture is executable and
writes a dedicated marker if directly launched; the legitimate provider run requires that marker to
remain absent. These are gate-only changes. The one intended product RED and all prior upstream
regressions remain unchanged.

R3 gate hardening replaces the second-read heuristic with a causal post-protection mutation point for
each family member. It adds a positive exactly-once provider-to-host ancestry anchor, filesystem-effect
cleanup observation independent of tempfile API/prefix, and separate oversized sparse provider/host
negatives at 256 MiB + 1 byte. This remains owner TEST_AUTHOR work only: no production implementation
is present and H-032 must stay RED solely for the absent execution-family boundary.

R4 replaces R3's first-matching protection mutation with an ordered launch trace spanning chmod,
fchmod, complete member reads and actual Popen; both fresh reads must follow the final mode transition.
Cleanup now retains every audited absent-at-event path anywhere and uses exact pre-seeding for system
noise rather than location or basename exclusions. Both 256 MiB + 1 fixtures are valid executable
programs whose unbounded capture effects are run and proven. No production byte is changed.

R5 adds independent connected physical corruption for provider and host, rejects cached or ignored
digest comparisons through actual capture effects, and requires no writable family descriptor at spawn.
Expected journal paths are classified exactly; every other audit-observed success or failure residue is
forbidden. The alternate-root cleanup fixture is now trap-owned and finally-cleaned. Production remains
untouched and the sole intended RED is unchanged.

R6 binds connected corruption to the first actual post-protection read of the snapshot object, including
pre-opened handles and descriptors. Actual process fd enumeration plus fstat/F_GETFL replaces API-level
writer bookkeeping at Popen. The journal cleanup exemption is now an exact finite shape, and a family
subtree beneath runs is an explicit rejection mutant. Production remains unchanged.

R7 removes original-fd history from connected corruption: every actual read fstats its live descriptor
against current snapshot dev/inode, including a connected duplicated-RO subject control. Cleanup now
binds the exact single run directory created by the invocation and rejects empty sibling roots or valid
leaf names beneath any other child. Production remains unchanged.

R8 seeds snapshot dev/inode identities from the observed exact private family at protection transitions,
not from pathname-open spelling. Connected corruption covers high-level buffered variants plus os.read,
pread, readv and preadv, with actual all-openat and positional-read subject controls. Production remains
unchanged.

R9 always wraps fdopen handles and resolves their live fileno identity on every buffered read, allowing
identity seeding to occur later at protection. A connected pre-protection openat-to-fdopen subject path
proves corruption precedes its actual final complete verification. Production remains unchanged.

R10 preserves that live identity observation transitively when a pre-protection buffered handle yields
its readable opened object through detach() or the public raw chain. Separate connected openat-to-fdopen
detach and raw subject controls require corruption before their complete final verification read and do
not accept the launch fallback. Ownership remains single-close and production remains unchanged.

R11 removes all historical integer-descriptor fallback from connected read classification. Every read
receives snapshot credit only from its current live fstat identity; a delegated pre-seed handle must also
match the same live opened object. A close-and-forced-number-reuse control proves an unrelated read stays
unchanged before the genuine duplicate/fdopen snapshot reader triggers pre-verification corruption.

Post-publication integration exposed three gate-only false negatives hidden by the earlier schema-v1 RED.
Provider race mutation is now reset and digest-anchored before each host control. Cleanup admits the exact
root `events.jsonl` journal leaf but no sibling or subtree. The R11 fd-reuse experiment now surrounds the
actual live snapshot read for both file-handle and descriptor APIs, rather than requiring an os.open shape.

## 2026-08-14 — H-032 code-mode execution family activated

Production now consumes authority schema v2 as one coherent six-key document per launch. The main Codex
Mach-O and its required `codex-code-mode-host` sibling are independently opened with no-follow semantics,
checked as executable regular files on those descriptors, read under the 256 MiB per-member ceiling and
hashed before any private execution root exists. Only bytes from those opened objects are materialized.

The private root contains exact `provider` and `codex-code-mode-host` basenames alongside the already
authority-bound controller Python snapshot. All members and the root are made non-writable first; fresh
complete SHA-256 reads occur afterward and immediately before AGENT_START and the sole Popen boundary.
The controller invokes only `provider`. Codex discovers and executes the verified same-root host as its
descendant inside the existing G20 namespace, so the sidecar is neither a second controller-selected
provider nor ambient PATH authority. Cleanup removes the complete root after success and every exception.

The frozen H-032 gate is green at 130 PASS / 0 FAIL. Its matrix includes coherent schema rejection,
same-opened-object source races for both members, live descriptor reuse and aliases, post-protection
corruption, final-transition ordering, valid oversize effects, exact provider-to-host ancestry, G20
namespace denials and residue-free success/failure cleanup. H-031 continues to bind the exact role route
at this execution boundary; H-033 and the older H-034/H-035/invariant suites remain unchanged.

## 2026-08-14 — H-032 structured result handoff amendment

The first real host-backed TEST_AUTHOR run completed in the provider event stream but could not create
its configured `-o` leaf inside the controller-owned live Git journal, exactly as H017/G20 requires.
The frozen amendment keeps that denial intact and requires one fresh connected result through a
least-authority disposable transport. The controller independently binds it to the exact invocation,
run, role, route and process/thread context, validates one complete strict schema value, atomically
publishes it and cleans transport state on success and every failure interval. Preseed, replay, wrong
binding, partial/multiple/trailing values, mechanism-specific object/channel attacks and live-state
writes reject. Schema-shaped event text alone remains non-authoritative.

Independent review then showed that the first executable oracle used only a standalone
fixture Git directory and checked only selected report fields. R2 uses a temporary linked
worktree whose common Git directory is the candidate repository's physical LIVE_GIT,
restores every journal/worktree-admin effect, and still executes the verified provider
family through G20. Its negative family now exercises strict UTF-8/duplicate/framing and
the complete frozen JSON Schema recursively, plus binding, writer, failure and cleanup
variants; all remain aggregated under the single intentional product RED.

R3 replaces that shared linked-worktree control entirely. The physical composition is
now a no-hardlink disposable Git/control-plane root made from the exact candidate bytes;
its imported controller, launcher ROT, repository and LIVE_GIT are the same isolated
authority domain, so no canonical journal rollback or global worktree pruning occurs.
Causal stale/replay controls predate their invocation, an active reader observes partial
canonical publication, a real one-second launcher timeout and signal interruption run,
and the frozen result ceiling is exactly 4 MiB with a valid 2 MiB positive.

R4 makes the ceiling controls byte-exact: a complete schema-valid encoding of exactly
4 MiB is admitted and 4 MiB + 1 rejects through a no-follow, same-opened, stable bounded
reader. An accepted value is replayed into a fresh invocation by an unrelated writer,
transient cleanup failure and delayed interruption quiescence are observed, and the
gate classifies filesystem versus descriptor/stream transport before applying attacks.
A length-framed bounded stream positive plus EOF/partial/trailing/oversize negatives
keeps the frozen criterion open to a legitimate non-path implementation.

R5 removes that unconnected parser demonstration and freezes the least-authority
primitive actually exposed by the authority-bound Codex CLI: an exclusive private
regular filesystem result object beneath a controller-owned staging root, outside
LIVE_ROOT/LIVE_GIT. Path construction, helper and bounded read APIs remain free to
refactor. Cleanup faults are now injected against the observed result transport itself,
with transient retry and persistent-exhaustion outcomes separated, while delayed signal
quiescence inventories object type/content/dev-inode/mode plus process and descriptor state.

R6 binds the observed private staging root itself: current uid, exact 0700 mode,
nofollow identity, exactly one result leaf during provider output, and complete parent
cleanup. FIFO, Unix socket and parent-swap join symlink/directory/hardlink attacks with
a one-second fail-safe. A fresh admitted invocation has an API-neutral audit count of
exactly one canonical result read before causal external-writer replay, and hostile
provider attempts now cover global events, envelope, sibling run, refs, config, hooks,
source and trust paths, all mechanically confined beneath the gate's disposable root.

The R6 closure also drives mutation through the product's actual result consumption:
Path/io/builtin-handle reads and os.open/os.read descriptors are instrumented by live
result identity. Path replacement after open, same-inode rewrite, growth and valid
shortening occur immediately before the real read. Each must reject; the exact-bound
positive and +1 negative remain connected through the same provider/run_codex route.

R7 counts consumption on the captured private transport `output_path`, not on the
canonical observer file: exactly one transport read is required, while atomic publish
may return without reopening canonical. The connected read harness now also wraps
fdopen, readline/readlines/readall/iteration and positional/vector read capabilities.
Object attacks require removal of every seeded leaf and moved parent before verdict.
Timeout/SIGTERM quiescence derives the actual staging root from the audited provider
argv and inventories surviving provider commands plus each survivor's lsof fd table.

R8 adds semantic exactly-once counters around the actual product route: one complete
schema parse and one atomic promotion to the invocation's canonical destination. A
second run injects a genuine duplicate parse and proves the same oracle rejects it.
Uninstrumented C-backed acquisition routes are mechanically closed by an exact source
capability inventory (mmap/FileIO/dup/raw/buffer/detach absent and the two pre-existing
non-result memoryview sites unchanged). Timeout/SIGTERM monitoring records provider
families by pid, ppid and process-start identity while alive, then requires every such
identity gone after delay; the actual staging tree and survivor fd inventories are zero.

R9 removes parser-function, rename-function and raw source-substring authority. A live
effect observer binds the opened transport's dev/inode and records complete stable
schema-valid value identities; a second-value provider produces two distinct accepted
boundaries and is caught. Canonical publication is observed as an absent-to-present
complete object-identity transition independent of helper API; an injected second inode
transition is caught. Both timeout and SIGTERM are sampled from spawn, staging roots
must be absent (not empty), and a fast provider fork/exec descendant that writes late
residue must be discovered by pid/ppid/start ancestry and rejected after delay.

R10 replaces that asynchronous effect observer with a causal controller-boundary
handshake. The provider pauses after closing each private sink; the gate opens the exact
sink no-follow, binds dev/inode/digest and proves canonical absence before release. A
second accepted close or an injected prior/second canonical promotion must cause the
actual invocation to reject, rather than merely incrementing an observer count. This is
independent of parser, mmap/FileIO/raw/fd helper, or atomic-publication API choice. The
process oracle assigns a session at Popen return and exercises timeout and SIGTERM with
a rapid double-fork+setsid+exec late writer; delayed success requires absent staging root,
no live recorded identity or process group, and no late filesystem effect.

R11 removes fixture authority from the imported subject's environment. Mode, capture
and pause controls live in judge state and are added only by the final provider-child
interceptor after production has constructed its launch environment. Result acceptance
uses opened-object dev/inode/value and promotion effects; mmap, FileIO, raw, dup-fd and
bounded helper reads are positive equivalent routes. The observer does not add or alter
Popen session kwargs. Its hostile double-fork+setsid child receives no cooperative
ledger/marker channel and can derive only the real private output parent for its delayed
external write, which timeout and SIGTERM containment must prevent.

R12 gives all new handoff PASS credit only to fresh-interpreter runs with the real
stdlib Popen type. Per-attempt behavior is embedded in separately hashed provider
authority bytes; no fixture token or monkeypatch enters the subject. The same actual
run_codex route exercises exact-source mmap, FileIO, raw and helper read-call variants,
whose process topology is AST-identical. The timeout variant changes only the unique
86400 constant to one second. Its uncooperative double-fork+setsid survivor loops on
the actual sink indefinitely, forcing bounded causal containment instead of a finite
observation-window success.

R13 reserves one real owner-provider model call for the final owner-host phase only
after the entire deterministic boundary is green. Prebuilder and builder RED iterations
therefore make no live call. The invocation binds candidate/source/spec/gate, exact
provider and host paths/digests, production role/route/argv and the complete schema;
timeout, auth, network or sandbox unavailability is ODÖMBART. The deterministic sink
oracle retains its nofollow descriptor through before/after fstat, read and mutation or
swap injection, then requires exact canonical digest/schema and total staging cleanup.
Literal source-expression variants are removed; timeout acceleration is a semantic
candidate seam whose absence is ordinary RED.

R14 owner-freezes `_consume_private_result(sink_fd, canonical_destination,
invocation_id, run_id, role)` as the sole result-consumer security seam. AST/dataflow
checks require one definition, exact capability/binding arguments, one run_codex call
and no provider/host/authority/fixture identity loads. The sole timeout seam is exactly
86400 with one production load; only the fresh test runner may set it to one. Held-fd
identity now includes mode, size, mtime and ctime as well as dev/inode before and after
the complete bounded read. Success requires one audit-observed atomic publication;
mutation, swap, double-value and promotion paths require zero. The final exact-family
call runs from an isolated no-hardlink clone at exact HEAD/tree with its own `.git`.

R15 closes the recursive project-helper graph rooted at the consumer. Only explicit
pure builtin and stdlib calls are admitted; reflection, dynamic attributes/imports,
aliases, indirect calls and argument/seam rebinding are rejected. The seam name has one
load: the exact direct run_codex call using the five exact provenance locals. The sole
timeout load must be `timeout=CODEX_RUN_TIMEOUT_SECONDS` on wait/communicate of the
sole Popen result. Before canonical rename/replace, the audit hook nofollow-opens and
retains the source object, records fstat/digest, and later binds destination identity and
digest. The mutation control now writes a complete schema-valid equal-length alternate
value, while the swap control replaces the path behind the retained accepted fd.

R16 propagates provider/authority/fixture taint through every reachable helper and
inventories module/local bindings for all seam/helper identities. Exact call arguments
must derive from a nofollow-created sink fd and nonconstant canonical, invocation and
run bindings plus the run_codex role argument. The closed capability graph admits mmap,
FileIO, pread/readv/preadv, fdopen, raw/buffer and helper reads without a narrow method
spelling. There is exactly one assigned Popen object, no reassignment or extra site;
its reachable timeout wait/communicate precedes every successful return. Rename-source
capture is bounded to MAX+1, destination dev/inode must equal the retained source, and
all post-transition canonical open/unlink/rename events reject.

R17 replaces the remaining name and line-order claims with semantic value flow. A
monotone abstract interpreter propagates identity, sink, canonical and invocation/run/
role tags across aliases, containers, helper parameters and returns. Capability reader
families transfer authority only from a tagged descriptor/receiver; an exact
`os.open(..., O_RDONLY|O_NOFOLLOW)` is the only sink-tag source. Popen aliases are
resolved before inventory, and the structured control-flow check rejects branch, loop,
context-manager or exception bypass around the sole timeout-bearing wait/communicate.
Atomic same-object promotion, bounded retained-source verification and live-phase skip
semantics remain unchanged.

R18 makes identity and process origins concrete. Provider-family authority parsing and
derived path/digest/snapshot values seed IDENTITY; actual argument tags flow into helper
formals context-sensitively and returned descriptor capabilities flow back to callers,
with recursion rejected conservatively. subprocess module, Popen constructor and process
object tags propagate through aliases, containers, attributes and helper returns before
the sole-site CFG check. Exact-body admissibility now separately executes preadv, readv,
BufferedReader.read, raw.read and a mandatory nested bounded helper through complete
fresh-process run_codex effects, without crediting the exact production verdict.

R19 preserves the exact tag sets at the run_codex-to-consumer boundary: every argument
must contain its required provenance and no IDENTITY/UNKNOWN or position-forbidden tag,
and those actual sets seed all consumer/helper analysis. Each generated reader body must
also pass the gate's semantic source-admissibility vocabulary before its connected
runtime effect can count. Import/ImportFrom subprocess origins and process constructor/
object values are inventoried through aliases and supported stores; unresolved process-
relevant stores or calls reject before the sole-site timeout CFG can pass.

R20 makes semantic origins non-sanitizing: journal/run/invocation tags union all operand
tags, while the five seam arguments must equal the exact singleton provenance sequence
SINK/CANONICAL/INVOCATION/RUN/ROLE. Call binding implements Python positional-only,
positional, keyword, keyword-only, default, varargs and kwargs rules with duplicate or
missing bindings fail-closed. Attribute/subscript stores join into their owning heap
object, so container and helper laundering cannot erase process or identity tags. The
same complete tree-analysis entry point is invoked for the exact candidate and every
generated exact-body reader variant before connected runtime evidence is considered.

R21 first mechanically extracts the complete inline consumer/interprocedural/identity/
process/CFG analyzer into `analyze_candidate_tree`; the exact candidate and every
generated reader variant now receive that identical full analysis and context. Distinct
zero-argument `_new_run_id()` and `_new_invocation_id()` origins make exact singleton
provenance satisfiable without name-based tag splitting. Formal environments include
positional-only, positional, keyword-only, vararg tuple and kwarg mapping categories;
literal star and double-star expansion follows Python duplicate/missing/default rules,
while unresolved dynamic expansions reject.

R22 grants RUN/INVOCATION tags only after the complete zero-argument origin helper body
passes a provider-independent secrets.token_hex(16)/uuid.uuid4 entropy audit. Multiple
runtime calls must be shaped, nonempty, pairwise fresh and disjoint across the two
classes. `analyze_candidate_tree` no longer mutates AST nodes; its single semantic
vocabulary admits the owner-frozen reader templates. Process constructor sites are
recorded during context-sensitive actual-to-formal interpretation rather than a global
call rescan. Positional-only keywords reject, literal star/double-star expansions bind
faithfully, and unresolved dynamic expansions remain fail-closed.

R23 freezes both identifier origins to the exact undecorated AST body
`return secrets.token_hex(16)` plus one unaliased, unrebound `import secrets`; aliases,
concatenation, other globals, helpers, defaults, annotations, closures and decorators
reject. Runtime freshness/disjointness remains mandatory. The context-sensitive
interpreter now evaluates bare expressions, conditions, iterators, with-contexts,
asserts, raises and comprehension inputs/filters, so bare helper-mediated process
constructor effects cannot disappear. Literal `**` keys targeting positional-only
parameters reject exactly like direct keywords.

R24 protects the entropy primitive itself: direct or aliased attribute stores, token_hex
subscripts/`__dict__` writes, reflection and binding deletion/replacement reject across
the whole module. The analyzer replaces ast.walk reachability with structured Python
runtime traversal. Function/lambda decorators, defaults and annotations execute at
definition time but dormant bodies do not; class bases, keywords and decorators execute,
then the class body executes. A dormant nested Popen body is therefore a legitimate
positive until called, while decorator/default/class-body/helper constructor effects are
recorded with their actual context and count against the sole process site.

R25 treats `secrets` as an exclusive capability rather than a single-attribute
blocklist. Only the two exact `secrets.token_hex(16)` origin calls are admissible;
module aliases carried through containers/helper returns and every attribute,
subscript, computed `__dict__`, update-method or reflective mutation are rejected.
Capability-reader provenance is accumulated monotonically across every reachable
context, so neither safe/unsafe traversal order can erase an unsafe receiver while
all-safe contexts remain admissible.

R26 adds an exact lexical entropy rule: every `secrets` name and `token_hex`
attribute load must be the precise call node in one of the two frozen origin return
bodies, so conditional, boolean, container, helper and callable aliases reject even
without mutation. Receiver ordering controls now use an otherwise admitted
`io.BytesIO.read` wrong capability and separately prove that graph/source analysis
passes while receiver provenance fails. The structured interpreter also evaluates
augmented-assignment targets and right-hand effects; a helper-mediated
`x += spawn(Popen)` adds a real process site and rejects.

R27 requires the entropy import itself to be exactly one standalone module-level
`import secrets`, unaliased, with no `ImportFrom` or other secrets-resolving import
anywhere. `io.BytesIO` is now explicit in the one shared semantic pure vocabulary,
so its `read` wrong-receiver controls prove graph admissibility rather than relying
on an accidental default. Assignment interpretation evaluates RHS and then target
effects for attributes, subscript values/slices, nested tuple/list/star targets,
annotated/named forms and deletes; target-side Popen calls therefore count.

R28 explicitly models structural pattern matching and exception handlers. Match
subjects, value/class/mapping-key patterns, guards and reachable bodies all contribute
semantic effects; exception types and handler bodies do likewise. The interpreter
also inventories every reachable `ast.stmt` class supported by the gate runtime and
fails closed on an unmodeled class instead of silently ignoring it. Subject, guard,
class-pattern and exception-type Popen mutants reject, while ordinary nonprocess
match and except forms remain admissible.

R29 separates constructor identity from constructor execution: a class/value pattern
may reference `subprocess.Popen` without creating a process. Constant match subjects,
literal patterns, guards and ordered exhaustive cases provide bounded reachability;
unknown subjects remain conservative. Try paths similarly distinguish provable
no-raise, explicit raise and unknown effects before traversing handler types/bodies.
Thus a Popen class-pattern, a guard behind a known nonmatch and a handler after
`try: pass` are legitimate, while a matching guard call or explicit-raise handler-type
call remains a recorded extra process site and rejects.

R30 replaces the last `ast.walk` raise-state shortcut with structured abstract
execution returning may-normal/may-raise for statement sequences. Constant `if`
branches, dormant definitions, return/raise, loops and try/except/else/finally now
control which regions are reachable, with uncertain effects remaining conservative.
Sequence patterns support exactly one star by matching prefix/suffix and requiring
subject length at least the nonstar count; unsupported patterns remain MAY_MATCH.
Controls cover reachable try-else calls, dormant nested raises, a matching `[*rest]`
guard and a known nonmatching fixed-length sequence.

R31 gives expressions structured may-normal/may-raise outcomes. A closed pure
literal/container/unary/binary/boolean/compare/subscript vocabulary is evaluated
safely: success is normal-only and an evaluation error is raise-only. Unknown names,
attributes, subscripts, operators and dynamic calls remain both-path conservative.
`assert` uses the same constant proof, and finally return/raise can override prior
normal/raise flow while its effects are always inventoried. Controls bind `1/0`,
`assert False`, safe `1+1`, and an unknown attribute to actual handler reachability.

R32 replaces the boolean raise flag with a bounded exception set: known builtin
types from explicit raise, folded failures and AssertionError, plus UNKNOWN. Try
handlers are processed in order; bare/BaseException catch all, Exception catches
known Exception subclasses, and specific/tuple handlers remove only definitely
caught types. UNKNOWN remains conservative unless caught by a true catch-all.
Handler-body exceptions, normal handler paths, orelse and finally override are joined.
Nested definite-catch, uncaught-type, ordered, tuple and bare controls bind the model.

R33 resolves handler type expressions semantically rather than trusting Name spelling.
Unshadowed builtin exception classes seed a binding graph propagated through aliases,
tuples/containers, subscripts and admitted helper returns; shadowed or unknown values
remain both-match conservative. Matching uses the runtime builtin hierarchy via
`issubclass`: Exception excludes KeyboardInterrupt/SystemExit/GeneratorExit, while
BaseException and bare handlers catch all. Alias, hierarchy, tuple/helper and unknown
shadow controls verify both definite catches and retained escaping paths.

R34 makes handler bindings flow- and context-sensitive at the actual program point.
Sequential assignment overwrites rather than unions; unknown branches join distinct
alternatives. Tuple/list catch-sets, dict keys, constant subscripts and helper returns
retain structure. A handler MAY match if any alternative catches the raised type but
is DEFINITE only if every alternative catches it; a tuple literal is one alternative
whose members are disjunctive catches. Reassignment order, branch alternatives,
actual tuple, dict-key and helper controls prevent cross-scope/global-union credit.

R35 carries the binding environment on each normal and exceptional abstract-execution
path instead of separating an exception token from its program-point state. Assignment
inside a try therefore changes only later paths; each raised state resolves handlers
against its captured environment, matching states enter with that state, and nonmatching
states continue outward. Orelse consumes normal-exit states and finally transforms every
normal and exceptional path. Same-type branch joins prove a definite catch while divergent
branches retain both catch and escape alternatives; inside-try reassignment plus dict/helper
controls prevent stale pre-try bindings from receiving credit.

R36 extends path-state execution through assignment targets in Python order: RHS first,
then each nested attribute base, subscript value/index, starred or sequence target. Known
and unknown target failures retain the environment at that point and reach handlers;
safe targets remain normal. Helper summaries now preserve structured dict keys and
container alternatives rather than accidentally iterating a dict into bare key strings.

R37 models Python target ordering rather than treating assignment as a simultaneous
environment update. One RHS feeds chained targets left-to-right, nested destructuring
stores sequentially, and an exception captures all earlier successful stores. AugAssign
resolves and loads its target before RHS, then performs the operation and final store.

R38 makes expression outcomes environment-aware and gives unpacking structural semantics.
A proven bound safe Name is normal while an unbound Name raises or remains conservative.
Known tuple/list structure binds nested and starred targets positionally; definite arity
mismatch raises ValueError before impossible stores, and unknown iterables retain both paths.

R39 treats target resolution and the resulting STORE/DELETE as separate stages, and
AugAssign as target load, RHS, operator, then store. Known tuple/list/dict and bounded
literal arithmetic outcomes carry precise exceptions; unknown attribute setters/deleters
retain both normal and exceptional paths rather than being silently treated as safe.

R40 makes Name deletion a path-local environment effect: a bound name is removed,
an absent name raises NameError without mutation, and later reads see the deletion.
A bounded mutable namespace abstraction proves safe attribute set/delete and missing-member
AttributeError; arbitrary attribute protocols remain conservatively normal plus exceptional.

R41 makes abstract path environments persistent: nested namespace state is never mutated
through a shallow-copy alias. Attribute stores and deletes create replacement values and
environments, so one branch cannot contaminate its sibling. The bounded pure local
SimpleNamespace constructor remains admissible without granting reflection or process power.

R42 separates stable abstract object identity from path-local heap versions. Same-path
aliases share an object id, so mutation through either alias is visible through all of
them; each branch receives a persistent copy-on-write heap. Only the audited pure
`types.SimpleNamespace` constructor path is admitted, with dynamic/reflection routes closed.

R43 makes that admission explicit in the same full analyzer: only exact `import types`
and direct pure `types.SimpleNamespace(...)` construction pass; aliases, ImportFrom,
dynamic import, reflection, module mutation and other APIs reject. Allocation identity
also includes caller context, separating repeated helper calls without breaking aliases.

R44B Phase A repairs analyzer totality only. Version-dependent Match-pattern and TryStar
classes are obtained with `getattr` and composed into safe isinstance tuples; `ast` is never
monkeypatched. Exact timeout constant shape/type is guarded before dereference. An unconditional
rig-only lane sends minimal parsed trees through the same analyzer and requires structured false
verdicts, while ACTUAL_PRODUCT remains the sole source of product RED/PASS credit.

R44C separates TryStar from ordinary Try and marks it explicitly unsupported when the
runtime can parse it. The unconditional source is now architecture-shaped and must reach
timeout guard, CFG, helper, provenance, heap and ordinary-try dispatch markers. Causal
timeout-name/wrong-keyword mutants and conditional except* return structured rejection,
never an exception; these effects remain rig-only and cannot credit ACTUAL_PRODUCT.

R44D removes disconnected syntax-marker credit. Each analyzer invocation owns its own
named component verdicts and counters, incremented only inside the timeout, CFG,
helper/provenance, heap and ordinary-Try branches. The shaped baseline requires every
component true and trace nonzero; causal mutants flip only their target component while
unrelated components and traces stay identical. SELFTEST remains separate from product credit.
### 2026-08-15 — H032 R44E postcondition-bound analyzer components

The owner-frozen unconditional SELFTEST no longer treats heap allocation, ordinary `Try`, or helper entry as credit. Its single analyzer returns invocation-local structured facts for completed heap alias/write/read relations, explicit exception-to-handler plus else/finally terminal routing, and actual→formal→return/call-effect provenance. Three entry-preserving mutants must each flip only its named component while all unrelated components and trace counts remain stable. This is rig sensitivity only; the unchanged product remains RED solely for the missing structured-result boundary, and no live provider call occurs while RED.

### 2026-08-15 — H032 R45 types and allocation measurability

The unconditional same-analyzer lane now has an explicit rig-only vocabulary for one unaliased `import types` and direct `types.SimpleNamespace` construction. Structured allocation facts preserve same-path aliases, distinguish sequential call contexts, and widen loop/recursive repetition to MAY_ALIAS with may-present/may-absent attributes. One-defect import/API/escape, alias, repetition and recursion mutants independently lose their target component with unrelated components and traces stable. The exact product lane remains the sole source of product verdict.

### 2026-08-20 — H032 R46 semantic allocation closure

R46 removes every R45 fixture/helper/local spelling from allocation verdict logic. Constructor helpers are found from their returned namespace effect; aliases and distinct objects are relations over object IDs, while real comprehension and per-frame recursive execution produce summary states. The summary's possible missing attribute reaches an AttributeError handler, and a causal handler `subprocess.Popen` mutant is discovered and rejected. A mechanically alpha-renamed fixture preserves exact allocation facts/components/traces. This unconditional lane remains rig-only.

### 2026-08-20 — H032 R47 provider-neutral result-kernel reset

Independent review of R46 established that extending a gate-local abstract interpreter was no longer a truthful or maintainable way to prove a small filesystem trust transition. Owner authorization therefore retires the R35–R46 exception-state, target-order, unpacking, store/delete, persistent-environment, heap-alias, `types`-admission and allocation SELFTEST machinery as H032 boundary proof. Those checks constrained the abandoned proof implementation rather than a necessary production capability.

The replacement contract is a provider-neutral kernel at `controller/result/consumer.py` with one exported call, `consume_private_result(sink_fd, canonical_destination, invocation_id, run_id, role)`. Its caller supplies an already-open no-follow private result fd; no provider path, provider authority, session identity, fixture mode or environment value enters the kernel. Static review is deliberately small and structural. The verdict-bearing controls execute the exact entrypoint and observe capability and filesystem effects: exact 4 MiB source bound, stable same-opened-object metadata, strict duplicate-free UTF-8 and complete frozen schema, exact role plus controller run/invocation bindings, one atomic canonical publication, fd consumption, replay/preseed/object/race rejection and cleanup on every interval.

This reset does not weaken H032. Provider/host digest identity, common private execution family, launch-adjacent rehash, provider-child sidecar ancestry and G20 live-state denial stay frozen. Structured-result tests still cover malformed/nested schema values, wrong bindings, second values/promotions, mutation/reopen/swap, hardlink/nonregular objects, timeout/SIGTERM descendants, cleanup faults and delayed residue. The late exact owner provider invocation remains guarded behind deterministic green and is skipped while production lacks the kernel. The current 131 PASS / 1 FAIL baseline is therefore truthful: the rig is green and only `STRUCTURED_RESULT_DELIVERY_BOUNDARY_ABSENT` is RED.

### 2026-08-20 — H032 R48 connected kernel effects

R48 preserves the R47 provider-neutral kernel boundary and repairs its measurement. The kernel inventory now traverses imports in every scope, records module/capability aliases, admits bounded `fcntl` descriptor-state checks and rejects process/network/dynamic-import/reflection/environment/provider-config authority. During the public consumer call, a child-local audit and wrapped path-stat surface allow reads only beneath the supplied private staging/canonical roots; randomized traps and real provider/config paths remain outside authority.

Integration is no longer credited by one repository-wide call token. A small direct call graph starts at `run_codex`, requires the canonical import and one reachable five-capability call, and a connected fake-provider execution observes that the live sink fd, canonical path and fresh invocation/run/role enter the exact kernel once. The returned validated report must drive the actual `AgentRun` outcome while the sink is removed and canonical remains.

Every direct kernel control now executes in a fresh interpreter. Post-return `/dev/fd` inventory matches all aliases by sink dev/inode and access mode, catching dup, dup2, F_DUPFD and fdopen/detach leaks. At publication, rename audit opens and retains the no-follow source, binds its bounded digest and identity, requires fsync and zero writable aliases, then requires the final canonical object to be that exact dev/inode/digest. Observed canonical content must always equal the final digest; post-transition writable open, unlink or rename rejects.

An embedded owner reference source is written only inside the gate's disposable WORK tree and cannot be selected or observed by production. It runs through the identical fresh-process harness for valid and exact-MAX positives and causal FD, MAX+1, partial/schema, binding/preseed, nonregular/hardlink, same-size mutation, retained-publication-writer and cleanup failures. Its PASS is rig sensitivity only; any reference failure is K-RIGG/ODÖMBART, and the absent actual product remains the sole RED without a live provider/model call.

### 2026-08-20 — H032 R49 pre-import effects and result dataflow

R48's child imported the result kernel before installing metadata and fsync wrappers. A helper default could therefore read provider configuration or retain the original `os.stat`/`os.fsync`; the later observer either missed the hostile effect or falsely rejected a genuine captured fsync. R49 preloads the exact allowed standard-library dependencies, reads but does not execute the subject bytes, installs the audit hook plus delegating builtin/pathlib/open, stat-family, fsync and environment observers, and only then executes the module and calls its public entrypoint in one scoped window. Structural inventory separately records defaults, keyword defaults, annotations, decorators, class surfaces, assignment expressions and comprehensions while retaining the narrow capability bans. Dynamic path identity, not split-string matching, rejects import-time and captured-reference reads outside the supplied roots.

The reference kernel now deliberately uses defaults that capture observed genuine `os.stat`, `os.fstat` and `os.fsync`. Its valid path proves those wrappers delegate real behavior. Causal siblings read a randomized sibling trap during module execution, stat it through a captured default, mutate the environment, or replace fsync with a no-op; each loses only the corresponding effect condition. These remain unconditional J-rig controls and never product credit.

The `run_codex` source boundary no longer accepts a field-free variable load as evidence that the validated consumer output drove success. The sole reachable consumer call must be returned directly, or assigned exactly once to one local whose sole load is the sole valued return; `try/finally` cleanup around the return is admitted. The connected fake-provider case replaces the consumer's returned value with a randomized opaque object after the real canonical effect and requires `run_codex` to return that same identity. Discarded, rebound, hardcoded or equal-looking alternate results cannot pass. The actual product remains the only source of K-boundary credit and stays intentionally RED before builder implementation.

### 2026-08-20 — H032 R50 non-transferable capabilities

R49 left three ambient-authority routes outside its structural and runtime envelope: byte-environment access, module recovery through another admitted module, and computed directory enumeration. R50 treats every admitted module binding as a non-transferable capability with an exact member vocabulary. Bare module values, aliases, containers, helper arguments/returns, proxy attribute chains and unlisted attributes reject; `pathlib.Path` is the sole exact unaliased imported member and may only be constructed directly. Environment, process, network, reflection, dynamic import and module mutation remain forbidden regardless of spelling.

The fresh child now wraps `os.environ` and `os.environb`, `getenv` and `getenvb`, mutation primitives, directory enumeration and the full admitted Path metadata/read surface before subject execution. The wrappers delegate genuine behavior but record exact path/environment effects; reads outside the supplied sink, canonical and staging roots reject. Audit events for subprocess, exec, sockets, DNS and network reject fail-closed. Exact `environb`, `getenvb`, `typing.sys.modules`, computed `Path.iterdir` and module-proxy mutants prove the closure, while direct Path operations on supplied roots plus captured genuine stat/fsync remain positive. The reference lane remains rig-only and cannot grant product credit.

### 2026-08-20 — H032 R51 lexical capability and mutation closure

R50 followed module names repository-wide and only through adjacent Attribute nodes. That both admitted a transferred `pathlib.Path` callable and rejected an unrelated parameter named `os`; Path instance mutations also escaped the runtime observer. R51 replaces the spelling map with a bounded lexical scope table for module, function, lambda, exception and comprehension bindings. Actual imports retain capability identity through enclosing scopes, ambiguous rebinding rejects, and same-spelled locals remain ordinary. An imported callable/class is admitted only as the exact direct callee; defaults, decorators, assignment, containers, return values and arguments cannot transfer it. This remains a small source inventory and does not interpret control flow.

Path instances may be assigned and passed normally because their authority is measured at effect time. The fresh child now wraps and delegates chmod/fchmod, directory creation, link creation, removal and the full requested Path mutation surface before subject execution, while audit events cover captured native references. Effects must target strict descendants of the supplied private roots; created/chmodded objects remain owner-private, existing mutation targets are regular files/directories, root mutation and link objects reject. The rig executes every outside mutation, insecure/root/link in-root controls, and a legitimate 0700 directory + 0600 fsynced file + same-root rename + cleanup positive. These checks are J-only; the absent actual product remains the sole RED.

### 2026-08-20 — H032 R52 fail-closed observer recursion and NamedExpr scope

R51's path predicate called `os.fspath` and `realpath` under a recursion flag that returned true for every nested event. A one-shot product path conversion could therefore read outside authority during the predicate itself. R52 freezes the absolute staging/canonical root strings before subject execution and performs lexical-only `normpath`/`abspath` checks on exact built-in strings/bytes, the exact platform concrete Path type, or host-resolved integer fds. Custom PathLike objects, Path subclasses, NUL, relative ambiguity and parent traversal fail closed without invoking subject conversion, resolution or metadata code. Observer-owned transition work has an exact scoped tag; nested product audit events never inherit that authority. Object identity remains independently nofollow/fstat-bound. Causal PathLike, subclass and nested-audit controls preserve their outside victim byte-for-byte, while exact in-root strings and concrete Paths remain admitted.

The bounded lexical inventory also follows Python 3.9 assignment-expression semantics. Comprehension iteration targets stay in their synthetic scope, but a walrus target binds in the nearest enclosing non-comprehension function or module. Imports followed by same-function, nested-comprehension or module-level walrus rebinding are therefore ambiguous and reject; normal parameter/local/comprehension shadows remain positive. This adds no control-flow interpreter and grants no product credit. The unconditional rig is green while the unchanged missing structured-result product boundary remains the sole RED; no live provider/model call runs.

### 2026-08-20 — H032 R53 exact judge-operation tickets

R52's remaining observer recursion state was a depth bit: while the judge performed its retained nofollow open of the publication source, any later audit hook could trigger another filesystem event and inherit the judge's blanket bypass. R53 removes that state entirely. Every auditable judge operation now installs an ordered, thread-local, one-use ticket for the exact captured callable/event, normalized path tuple, flags, mode, dir-fd, available object identity and phase. Only the queue head with an exact match is consumed; mismatch, replay, wrong thread and out-of-order activity follow the ordinary subject policy. Multi-event work uses a finite explicit ticket sequence and newly opened objects are immediately fstat-bound to the existing retained identity/digest oracle.

The causal control installs a later product audit hook that recognizes the judge's canonical-source open and attempts to unlink an outside victim. The nested unlink is observed and denied, the victim remains unchanged, and the exact ticketed judge open plus atomic publication still succeed. Wrong-path, wrong-flags, replay, cross-thread and ordered-ticket controls run unconditionally in every fresh child. This is rig sensitivity only: production is unchanged, no live provider call runs, and the missing structured-result boundary remains the sole product RED.

### 2026-08-20 — H032/H031 R54 measurable result transport

The first legitimate H032 builder exposed fixture contradictions rather than security failures. R54 separates the provider's raw report from the controller's canonical binding envelope, discovers the canonical leaf from the controller journal, and reproduces the physical G20 topology with an isolated exact controller repository plus a distinct linked writable worktree. The provider receives only the private `-o` sink. Causal synchronization reuses that exact precreated sink object; it does not grant writable sibling-marker or canonical authority. Object attacks replace the real sink after launch and the judge removes only its own injected residue after recording rejection.

Sequential valid provider rewrites before exit prove observer sensitivity but cannot be a product rejection oracle: the consumer safely judges the single stable value presented at its call boundary. Material multi-value controls remain duplicate/trailing/concatenated input, second consumption/promotion and mutation during the bounded same-opened read. Provider stdout thread/session claims remain non-authoritative. Cleanup and timeout tests bind the production-created process group guaranteed by H017; a trusted exact provider deliberately escaping that group with `setsid` is not invented as authority H017 never supplies.

H031 now freezes the one import topology that works under `python -I -S`: one protected repository-root insertion imports both `controller.authority.core` and `controller.result.consumer`, with no later path mutation. Only the exact private result-staging `open`, `close`, `fsync` and identifier `urandom` calls are added to its source-effect inventory. The sole Popen/run sites, generic Codex rejection, role policy, route argv and AGENT_START binding remain intact. Production and provider configuration are unchanged; the H032 owner gate stays RED only for the missing product boundary and performs no live model call while RED.

### 2026-08-20 — H032 R55 publication epochs and complete residue

R54's retained-source/final-object binding proved the last atomic replacement, but it did not enumerate the canonical destination's whole lifetime. A consumer could first create, fsync and unlink a complete canonical value, then replace the same pathname with an identical complete envelope; the polling observer could miss that first visibility interval and identical digests made its sample set look benign. R55 records every canonical visibility epoch and direct write effect. The unconditional reference mutant performs the two publications with distinct live objects and the same digest; the oracle observes both and rejects. The legitimate path has exactly one absent-to-present epoch sourced by the retained fsynced publication object. Polling remains diagnostic only.

R55 also closes the cleanup accounting gap. Every provider-started negative path is now tied to the full attempt residue inventory returned in `result[4]`, the exact private output parent must be absent, and helper-created residue cannot be hidden by deleting only the sink leaf. Transient and persistent injected cleanup cases retain both the complete attempt inventory and the parent/tree observation before exact judge-owned cleanup. This does not change production authority, H031 routing, G20 or the intended prebuilder state: H032 remains RED only for the absent structured-result kernel and connected integration, and the guarded live model phase remains skipped.

### 2026-08-20 — H032 R56 pre-provider setup/spawn cleanup

R55 covered complete residue after a provider had started but could not represent a correct rejection with zero provider processes. R56 separates actual provider-process creation from the controller's journal event and injects four connected failures into the real `run_codex` lifecycle: after the private staging root but before its sink, during creation/open of that sink, after the retained read-only sink capability but before Popen, and at a Popen exception before delegation. Each requires the canonical and exact staging parent absent, the complete attempt residue and created private-root inventory empty, no live descriptor alias for the observed sink object, and zero actual provider starts. Provider-started cases retain their exact one-start/one-output requirement.

The unconditional rig now admits a clean zero-start failure and rejects otherwise identical false-start, helper-residue, private-root and fd-alias mutants. The injected observations are retained before the judge removes only exact gate-owned diagnostic residue. Existing valid execution and bounded transient cleanup recovery remain positive anchors. No cleanup API is prescribed, production is unchanged, and H032 stays RED only for the missing structured-result kernel/integration; the live provider phase remains skipped.

### 2026-08-20 — H032 R57 effect-neutral setup lifecycle

Independent R56 review showed that the four setup controls still depended on when
`_provider_snapshot` happened and whether `AGENT_START` had already been journaled. R57
removes both dependencies. A valid connected run inventories every private allocation and
identifies the result root only because it is the parent of the actual `-o` sink. Later
faults target that root and sink by path plus dev/inode/access-mode effects; provider-family
allocation order and journal chronology are not verdict inputs. Zero or one journal start
record is accepted when its actual route fields are correct, while provider process starts
remain an independent effect.

The matrix now faults the first and second observed root-validation operations, the
pre-create/open boundary, a returned writable create descriptor during fsync and close,
the next setup step, the retained read-only descriptor's fstat, and the Popen boundary
before delegation. The judge never precloses the product descriptor. Every case records
`injected=true`, zero provider starts, exact result-root identity, empty complete attempt
residue, absent staging/helper roots and zero remaining sink fd aliases. Metamorphic root
allocation and journal schedules prove that reordering remains admissible. This changes no
production or H017/G20 authority and keeps the absent structured-result implementation as
the sole actual-product RED.

### 2026-08-20 — H032 R58 attempt-scoped journal and distinct effect fault

R57's journal helper caught JSON errors and discarded non-object lines before counting
AGENT_START. A malformed append could therefore coexist with one valid route record and
still satisfy the count. R58 snapshots the pre-attempt `events.jsonl` by no-follow opened
object identity and bounded stable bytes, then parses exactly the appended suffix. The
suffix must be complete newline-terminated UTF-8; every line is duplicate-free strict JSON
and an event object; an AGENT_START has the full frozen route shape. Malformed unrelated,
non-object, truncated, valid-plus-truncated, duplicate-valid, invalid-UTF8, replaced-object
and changed-prefix controls reject. Legitimate prior history remains the identical prefix
and only the current append contributes to the attempt count.

R58 also separates the two final zero-start cleanup intervals. Once the product has
returned and validated a live read-only sink capability, one injector fires at the first
subsequent observed fallible non-Popen setup effect. The other fires only at the actual
Popen boundary before delegation. Their traces and effects are disjoint, while both bind
the sink dev/inode/access mode and require `injected=true`, zero provider processes, no fd
aliases and no staging/helper/result residue. Metamorphic effect labels and order remain
admitted; no provider helper name or AGENT_START chronology is verdict authority. The
partial-builder host diagnostic produced `post_retained:Path.iterdir` versus
`popen_before_delegate`, and all five connected journal corruptions rejected cleanly.
Production, H017, G20 and provider authority remain unchanged.

### 2026-08-20 — H032 R59 journal continuity and dynamic pre-Popen effects

R58's stable same-fd journal read retained the file mode in its observation but compared
only device/inode and prefix across the attempt. R59 requires every present attempt
journal to remain an exact mode-0600 regular nlink-one object, and a pre-existing journal
must preserve device, inode, type, link count, mode, complete prefix and exact size
accounting. The connected chmod control keeps the same device/inode, widens 0600 to 0666,
appends a valid unrelated event and is rejected. Existing strict history stays admissible,
and a Popen failure may legitimately have appended either zero or one correctly shaped
current AGENT_START.

The post-retained cleanup control no longer selects one of six owner-named operations. It
mechanically resolves the exact candidate `run_codex` direct OS, concrete Path and project
helper call capabilities, discovers the actual dynamic effect sequence after the first
successful retained-sink fstat and before Popen, and replays one fresh failure at every
ordinal. Repeated capabilities remain separate intervals. Every replay binds the actual
sink dev/inode plus a live read-only alias and requires zero provider starts and complete
descriptor/staging/helper cleanup. Removing one discovered replay fails the matrix.

The disposable partial-builder composition discovered 26 real intervals and injected all
26 cleanly. A complete source variant with a second `os.fstat(sink_fd)` exposed that new
call as ordinal zero and rejected cleanly. A mechanically constrained complete variant
moved all fallible preparation before retained validation, produced an empty interval and
was admitted until the separately injected Popen boundary. These are connected executions,
not literal trace claims. Production, H017, G20 and H031 remain unchanged; the owner
baseline stays 131 PASS / 1 FAIL solely for
`STRUCTURED_RESULT_DELIVERY_BOUNDARY_ABSENT`, and no live model call runs while RED.

### 2026-08-20 — H032/H031 R60 captured capabilities and dependent-gate rebind

R59's ordinal replay covered every effect that entered its wrappers, but those wrappers
were installed after a connected variant had executed. A default such as
`captured_fstat=os.fstat` therefore retained the genuine C callable: its second sink
validation executed while the source-spelling matrix saw only the first direct call.
The same gap applied to a project helper retained through a default or alias.

R60 resolves the capability actually entered. An invocation-local `sys.setprofile`
router is installed before the complete connected variant is executed, remains inert
until the measured run, and is armed only after the first successful retained read-only
sink validation. C-call object identity and Python code identity cover direct wrappers,
captured genuine callables, captured project helpers and their admitted internal
filesystem capabilities without depending on a Name/Attribute spelling. The hook is
removed in `finally`; no environment, fixture mode or provider claim selects it. H031's
same source audit admits genuine `os.fstat`/helper capture but rejects `sys.getprofile`
and default-captured observer access, so the judge mechanism cannot become a product
branch input.

The connected partial-builder run observed 27 actual base ordinals and injected all 27
with zero starts and no descriptor/staging/helper residue. The captured-fstat variant
recorded both the retained and post-retained sink fstats and rejected when the latter was
injected before its syscall. The captured-helper variant separately observed helper
entry followed by its internal fstat and rejected both connected injections. Direct
repeated-fstat and the legitimate empty interval remain admitted.

R59 also left H031 pinned to the previous H032 bytes, causing a 9/2 static abort. R60
updates that binding only after the final H032 gate hash is fixed; the required H031
baseline is the complete 94-control execution with only `K_H032_FRESH_UPSTREAM` and
`K_PRODUCT_EXECUTION` failing for the unchanged structured-result product gap. No
production, provider authority, G20, H017 or live-model behavior changes.

### 2026-08-20 — H032/H031 R61 protected C-callback transfer boundary

R60's identity profiler closes captured callables only at events CPython actually
reports. A captured `os.fstat` called directly from Python emits `c_call`, and a Python
helper or closure emits a Python `call` before its internal filesystem effect. In
contrast, `next(map(captured_fstat, (sink_fd,)))` lets the C implementation of `map`
invoke the C implementation of `fstat` without a nested profile event. The result is
real but there is no ordinal for R60 to replay.

R61 resolves that one observability boundary in H031 rather than claiming a stronger
profiler. Its source-form control has two narrow provenances: the actual unaliased
`os.fstat` result-setup capability and the exact unshadowed built-in C executors
`map`, `filter`, `sorted`, `min` and `max`. Assignments, defaults, helper
arguments/returns, aliases and explicit containers preserve those provenances. The
gate rejects only when the protected capability is stored in a literal container or
when both provenances meet at a call. It does not interpret Python control flow.

Connected full-source controls place each route inside the real `run_codex` body.
Direct captured invocation, a Python helper, an aliased Python relay, a closure and
unrelated `next(map(lambda ...))` remain source-admissible. Protected map/filter/key
callbacks, aliases and executor containers, capability containers and helper-return
laundering reject with the exact protected-callback finding. Thus H032's existing
27-ordinal direct matrix and captured-helper cases cover every newly admissible route;
no H032 instrumentation, production, provider authority, G20, H017 or live-model
behavior changes. H031 remains bound to the final unchanged H032 gate bytes and its
prebuilder result remains 94 PASS / 2 FAIL solely for the structured-result product gap.

### 2026-08-20 — H032/H031 R62 direct protected-fstat reset

Independent review found that R61's narrow-looking provenance graph was neither
complete nor precise: valid sibling values could inherit a container taint, while
`*args`, `**kwargs`, lambda defaults, comprehensions and several C callback surfaces
could still transfer the genuine `os.fstat` callable outside the observable ordinal
router. Owner R62 expressly supersedes the R60/R61 captured-C and transfer-legitimacy
clauses instead of extending that graph.

The closed replacement is one local source rule over the complete H031 autopilot
source envelope. Every actual unaliased `os.fstat` Attribute must itself be the direct
`Call.func` in `os.fstat(...)`. Capturing the C callable in a default or lambda,
assigning, returning, storing, passing, expanding through `*`/`**`, comprehending or
supplying it to `map`, `sort` or another callback therefore rejects at the origin.
The existing exact unaliased `os` import, proxy and reflection restrictions remain the
module-identity boundary. No replacement dataflow or control-flow interpreter exists.

Python helpers and closures remain ordinary refactoring surfaces when their body
directly invokes `os.fstat`; aliases of those Python callables do not transfer the C
capability. Connected controls place direct, helper, helper-alias and nested-helper
positives in the actual `run_codex` body, alongside unrelated `map`/`next`, and place
default/map/sort/star/keyword/lambda/container/return/comprehension/object-store
negatives in that same body. H032 removes the captured-C connected case and retains
only direct C events plus Python helper-frame/internal-effect ordinals. After H032
bytes are final, H031 alone binds their exact digest. Production, provider authority,
G20, H017 and live-model behavior remain untouched; the structured-result boundary
remains the sole intended product RED.

### 2026-08-20 — H032/H031 R63 lexical protected-fstat authority

R62 applied its local Attribute-to-Call rule to every Name spelled `os`. That spelling
is not authority: a parameter, local, comprehension target, exception target or
nonlocal binding may independently expose an attribute named `fstat`, and R51 had
already frozen those lexical shadows as ordinary values.

R63 resolves each `os` load through a bounded Python-3.9 lexical scope table. Only a
load that resolves to the exact unaliased module-level `import os` receives the R62
protected-capability rule. A global reference to that intact module remains protected;
a module rebind, conflicting import/store or ambiguous global/nonlocal binding rejects
fail closed. No generic provenance or control-flow graph is restored.

Connected full-`run_codex` controls retain genuine direct, helper, helper-alias and
nested-helper positives and every R62 transfer negative. Separate positives cover
parameter, local, comprehension, exception, nonlocal and unrelated local
`list.sort(key=os.fstat)` shadows; module and ambiguous rebinding mutants reject. H032
and its direct-C/Python-helper ordinal router are byte-identical at the frozen digest.
The expected owner result remains H032 131 PASS / 1 FAIL and H031 94 PASS / 2 FAIL,
solely for the absent structured-result production boundary. Production, provider
authority, G20, H017 and live execution remain untouched.

### 2026-08-20 — H032/H031 R64 declaration routing and class-body ambiguity

R63's lexical model correctly distinguished ordinary shadows from the imported
module, but three non-Name binding forms still bypassed declaration routing:
exception targets and function or class definition names. A `global os` declaration
could therefore leave one of those stores looking local rather than conflicting with
the protected module binding. R64 routes every visited binding construct through the
same global/nonlocal-aware operation.

Class bodies need a separate conservative rule. Python executes them sequentially
with `LOAD_NAME` fallback, so a set-only lexical inventory cannot soundly decide a
load before a later assignment, a load after deletion, or a conditionally executed
binding. R64 does not introduce a class control-flow interpreter: every direct
class-body load, bind, delete, global declaration or nonlocal declaration involving
the protected spelling `os` rejects fail closed. R51's ordinary-scope list covered
parameters, locals, comprehensions, exceptions and nonlocals but did not promise
class-body `LOAD_NAME` behavior, so this is an explicit compatible amendment. Nested
method, lambda and comprehension scopes remain ordinary lexical scopes.

Connected controls reject later, deleted and conditional class bindings and global
exception/function/class rebinding. An ordinary class and class-method parameter,
local and comprehension shadows pass alongside all six R63 shadow positives; every
R62 protected-callable transfer negative remains rejected. H032 stays byte-identical,
no R61 graph or generic dataflow/control-flow interpreter returns, and production,
provider authority, G20, H017 and live execution remain untouched.

### 2026-08-20 — H032/H031 R65 lexical process-module identity

R64 fixed lexical authority for the protected `os.fstat` rule, but several older
process guards still granted authority by spelling. A local `os` used in a truth
guard or passed through a helper/container was therefore reported as a bare process
module; assigning that ordinary object to a local alias was reported as module
capture. Equivalent false positives existed for the other PROCESS_ATTRS spellings.

R65 reuses one existing resolver predicate throughout those legacy checks. A Name is
a process module only when it resolves exactly to its unaliased imported module
binding. Module assignment, bare-module, process dictionary/reference, dynamic
access, call keyword/arity, process-site enumeration and resulting effect counts all
share that decision. Exact module-level `os` and `subprocess` singleton imports remain
mandatory; aliases, rebindings and imported-module ambiguity reject fail closed.
R64's direct class-body `os` ambiguity is unchanged and runs before this distinction.

Connected full-`run_codex` positives cover guarded method parameter/local values,
lambda and comprehension use, an identity relay, alias/container use, local
`list.sort`/`map`, and module-shaped ordinary `os`, `subprocess`, `asyncio` and `pty`
objects. Separate connected negatives retain imported module assignment/containers,
bare modules, aliases, rebinding and process references, alongside every prior
protected-fstat transfer and process-site mutant. This is local resolver reuse—not a
provenance graph or control-flow interpreter. H032, production, provider authority,
G20, H017 and live execution remain untouched.

### 2026-08-20 — H032/H031 R66 conditional class process fallback

R65 correctly made the legacy process restrictions lexical, but R64's separate
class-body `LOAD_NAME` guard still named only `os`. A class could therefore read the
real global `subprocess.Popen` before a later class-local `subprocess` assignment,
after deleting that assignment, or when a conditional assignment never ran. The
unordered lexical set then classified the load as ordinary and hid an actual process
reference or start.

R66 generalizes the existing class event inventory across every PROCESS_ATTRS
spelling, while conditioning rejection on an exact imported-module fallback for that
same name. A class-local binding forces a missing `LOAD_NAME` to module globals;
nested class namespaces are skipped because they are not closure scopes. A class
`nonlocal` that resolves to an ordinary enclosing-function value remains ordinary.
This bounded lexical rule covers loads, binds, deletes, declarations, method defaults,
decorators, comprehension outer iterables and direct starts without interpreting
branch order or constructing a dataflow graph.

Connected negatives cover `subprocess` later/delete/conditional bindings, direct
Popen, method default, decorator, comprehension, global, nested-function and nested-
class fallback. Positives retain every R62-R65 case and add direct class-local
`asyncio`/`pty`, an enclosing-function ordinary `subprocess` closure and an explicit
class `nonlocal`. H032, production, provider authority, G20, H017 and live execution
remain untouched.

### 2026-08-20 — H032/H031 R67 exact-owner live HEAD correction

The first legitimate result-kernel builder made the complete deterministic H032
matrix green and thereby reached the guarded exact-provider phase. The owner gate then
raised `NameError` because three late-only identity sites called a nonexistent
`sha()` helper. Prebuilder RED had kept that branch unexecuted, so earlier owner runs
could not expose the gate defect.

R67 uses the gate's existing closed system-Git helper to resolve exact candidate
`rev-parse HEAD` once before deterministic gating. That early value is exercised on
every run and is reused for the isolated clone checkout, post-provider clone equality,
detail and bound evidence. The already-frozen `HEAD^{tree}` equality remains a second,
independent identity condition and cannot substitute for commit equality. There is no
new authority helper, no path claim and no production change.

H031 is rebound to the finalized H032 gate bytes. Result schema, same-opened kernel,
publication/cleanup, process containment, provider/host authority, G20 and the rule
that the real provider phase runs only after deterministic green remain unchanged.

### 2026-08-20 — H032/H031 R68 environment-closed live HEAD identity

R67 removed the undefined helper but its Git subprocess still inherited the caller's
complete environment and merged stderr into stdout. An inherited `GIT_DIR` can select
another repository's HEAD even when cwd names the candidate worktree; `GIT_TRACE=1`
adds diagnostics to the same captured stream. An absolute Git pathname alone therefore
did not bind the candidate identity.

R68 gives every gate-owned Git subprocess a newly constructed allowlist environment.
Caller Git directory, worktree, index, object, alternate-object, configuration, trace
and other `GIT_*` controls are absent; the gate supplies only its exact locale, temp,
PATH, HOME and disabled system/global configuration values. HEAD observation first
requires `--show-toplevel` to resolve to the exact requested worktree, then accepts
`--verify HEAD` only as one newline-terminated lowercase 40-hex line with empty stderr.
The same primitive binds candidate prestate, the isolated live clone and evidence.

An unconditional decoy-repository control demonstrates that the inherited R67 shape
selects the decoy SHA and that inherited tracing emits stderr. Connected hostile
GIT_DIR/GIT_WORK_TREE, common-dir/index/object/alternate-object, config and trace inputs
must all still return the candidate SHA through the closed primitive; malformed,
multiline, uppercase/nonhex or stderr-bearing output rejects, while unrelated caller
environment remains harmless. H031 binds the finalized H032 digest. No production,
provider, result, G20 or live-call gating behavior changes.

### 2026-08-21 — H032/H031 R69 composed Git-environment boundary

Independent R68 review proved that a closed identity helper was insufficient at the
composed boundary. With an outer `GIT_DIR` selecting an older builder worktree, the
helper still returned R68's exact commit, but imported production and the nested H033
gate inherited the hostile selector. Product AGENT_START records bound the old commit,
H033 passed self-consistently against it, and 36 run directories plus malformed test
history escaped into authoritative `.git/nortropic-codex-autopilot` before H032 became
ODÖMBART. Those unversioned effects are preserved as incident evidence; TEST_AUTHOR
has no authority to decide which pre-existing history is safe to delete.

R69 separates judge containment from product acceptance. At Python entry, before any
candidate observation or product import, the gate rebuilds its actual process
environment without any caller `GIT_*` key. H033 receives only that closed environment;
judge Git continues to use its smaller R68 allowlist. A synthetic hostile map proves
Git controls are removed without dropping unrelated environment. The exact existing
authoritative autopilot subtree is snapshotted without following links and must be
byte/type/mode identical after the complete run. This is read-only incident containment,
not recovery or rollback.

The product requirement remains independently connected and RED. A full production
run gets hostile `GIT_DIR`/`GIT_WORK_TREE` pointing to a committed disposable decoy,
while its intended controller repository and linked worker have a different disposable
common Git. Controller Git subprocesses must construct a caller-Git-free environment;
the provider/launcher environment must also exclude caller `GIT_*` state while keeping
unrelated credential/runtime values. Only one AGENT_START and canonical result in the
intended common Git, the intended exact HEAD/worktree, an untouched decoy and no private
sink satisfy the control. All attack targets live under gate-owned WORK, so the owner
gate never repeats the authoritative mutation. H031 keeps its one-run/one-Popen route
and merely admits this bounded environment construction after rebinding H032's hash.

### 2026-08-21 — H032/H031 R70 complete decoy and current provider binding

R69 correctly separated gate sanitation from the product verdict, but its decoy
immutability observation covered only `.git/nortropic-codex-autopilot`. A product could
mutate decoy config, index, refs, objects, hooks or worktree while that absent subtree
remained unchanged. R69 also observed only an empty provider `GIT_*` list: an
implementation that discarded credentials, proxy and all unrelated runtime environment
could pass. Finally, the shared provider capture was not cleared or bound to a current
start, so a no-Popen hostile branch could reuse a prior empty-Git capture.

R70 snapshots the entire committed decoy repository root without following links. This
includes the worktree and its embedded common Git. Before the product attempt, causal
worktree, config, index, ref and object mutations each must alter the snapshot; exact
restoration must reproduce the baseline. The actual accepted attempt then requires the
whole tree unchanged, not merely one control subtree.

The same attempt carries a fresh opaque `NORTROPIC_OPAQUE_RUNTIME_SENTINEL`. It does not
select provider behavior and grants no authority, but the actual provider child must
capture its exact value while capturing zero caller `GIT_*` names. The known prior
capture is deleted first. Credit requires exactly one new provider-process start,
`mode=valid`, a newly created absolute output path distinct from the stale attempt,
owner-private current sink identity/size/digest, exactly one intended AGENT_START/run
and a canonical envelope bound to that sink digest. Zero-start, stale capture, wrong
sentinel, wrong mode and repeated-output controls all reject. These J controls prove
the observation rig only; the full connected product predicate remains in the sole
structured-result RED. H031 adds no process or route and only rebinds H032's final hash.

### 2026-08-21 — H032/H031 R71 unpredictable unrelated environment observation

R70 proved that one unrelated value reached the provider, but published the observation
key in the frozen gate and provider fixture. A defective controller could retain that
single known name plus launcher mechanics while discarding arbitrary credentials,
proxies and other runtime state.

R71 locks the exact candidate source digest before choosing two per-attempt environment
names of different lengths and two independent values. Complete generated literals are
absent from candidate and gate source. Only the disposable provider fixture is rewritten
with the generated names; their values remain unavailable there. The connected hostile
attempt must preserve the exact pair map into the current provider capture while removing
all Git controls and satisfying R70's exact one-start, valid-mode, new-output, private-sink
identity/digest and canonical binding.

Wrong-value, missing-key, former-fixed-key-only, zero-start, stale, wrong-mode and repeated
output observations reject. In addition, a disposable candidate variant that copies only
fixture mechanics and the former fixed sentinel must actually start one provider with zero
Git controls; its capture contains the unpredictable keys with absent values and is
causally rejected. The exact unfiltered current attempt is the legitimate positive. The
mutant is rig evidence only and grants no product credit. Complete-decoy comparison and
the read-only authoritative 179-record observation remain intact; H031 adds no route and
only binds the final R71 H032 digest.

### 2026-08-21 — H032/H031 R72 complete provider environment relation

R71 still gave finite key-shape authority: a defective controller could retain all names
of the two published lengths and discard unrelated caller state. R72 supersedes sentinel,
name, length and prefix predicates with equality over the complete current-attempt mapping.
The expected provider mapping starts from the exact incoming environment, removes every
`GIT_*`, `DYLD_*`, exact loader redirect and the already-frozen launcher-sensitive GitHub/
Slack prefixes, then accounts for exact controller trust-root/envelope and judge-private
capture additions. Every other key and value must remain byte-for-byte equal.

Only count, keyset SHA-256 and mapping SHA-256 enter diagnostics; raw values never do.
Three varied unrelated entries chosen after source lock are causal strengthening only.
Complete connected candidates prove exact preservation and reject drop-one, length-only,
prefix-only, fixed-key and unexpected-extra filters after exactly one current provider
start with zero Git controls and the R70 sink binding. Apple's system Python prepends a
developer MANPATH before fixture code runs; the judge-private launch boundary preserves
the exact pre-interpreter value, and the synthetic provider restores it and deletes the
two fixture fields before capture. Imported product cannot observe that normalization.
The exact product attempt remains the sole structured-result RED; complete decoy/current
capture and the authoritative 179-entry read-only observation are unchanged. H031 gains
no process or route and binds only the final R72 H032 digest.

### 2026-08-21 — H032/H031 R73 launcher-envelope environment binding

R72 compared complete provider environments, but calculated `NORTROPIC_KUVERT`
as a sibling of the provider `-o` path. That happens to describe the current insecure
product while contradicting the frozen result boundary: the accepted sink must be the
only leaf in a private staging root outside live Git, while the controller envelope
remains journal state.

R73 derives the expected value from the actual current outer launcher argv. The gate
binds its private Python snapshot, `-I -S`, exact launcher, `run`, current worktree,
regular journal envelope, timeout, separator and the provider family's `-C`/`-o` shape.
A connected candidate keeps the envelope under the intended common-Git run journal but
substitutes a gate-owned private 0700 one-leaf result sink. Exact complete environment
equality passes after one current provider start. A sink-sibling assumption, a stale
launch observation, a wrong envelope and wrong launcher timeout each reject.

The output substitution and observation are judge-private and unavailable to imported
production. They prove that the frozen environment criterion admits the required split
topology, never grant product credit and are cleaned with the disposable staging root.
R70-R72 capture, decoy and environment controls remain intact; H031 gains no process or
route and binds only the final R73 H032 digest.

### 2026-08-21 — H032/H031 R74 current-run intended environment binding

R73 validated an envelope under an intended-looking `runs` directory but did not prove
that it belonged to the one run created by the current invocation. Its environment
controls also still built exact rewritten copies of obsolete product source, and their
positive topology inherited assumptions from the hostile decoy attempt. That allowed a
current output to be paired with stale controller state and made harmless environment
construction refactors an owner-gate failure.

R74 snapshots the disposable candidate repository's intended common-Git run set and
strict journal bytes immediately before each attempt. At the real provider boundary it
requires exactly one new run, exactly one appended current `AGENT_START` for the bound
worktree and HEAD, and the argv envelope inside that exact run. The result sink remains
a separate private 0700 root with one leaf. Current-output plus a prior-run envelope or
an envelope under the hostile decoy rejects causally.

The complete environment matrix now runs unchanged product bytes. Its judge-private
Popen transform starts from the actual current child mapping, introduces hostile Git
selectors only there, and tests exact preservation plus drop/length/prefix/fixed/extra
mutants. The controller itself therefore journals in the intended candidate common Git;
the separate exact hostile product attempt remains the sole product RED. All obsolete
source replacements and anchor counts are removed. R70-R73 full decoy/current-capture
controls and the authoritative 179-entry read-only observation remain intact. H031 gains
no process or route and binds only the final R74 H032 digest.

### 2026-08-21 — H032/H031 R75 owner-live binding totality

The first authorized run against the implemented R74 result kernel passed the complete
deterministic product matrix and entered the exact owner provider phase. After the
provider phase, the frozen gate evaluated its live identity expression and raised
`NameError` because `h032_gate` had never been assigned. The failure therefore belongs
to the owner gate. It was not an authentication, network or product failure, and the
TEST_AUTHOR remediation does not perform a second live call.

R75 creates one candidate identity record before the conditional owner-live branch. It
binds the exact disposable/candidate repository, closed-observed HEAD and tree, source,
spec and current `verify/bin/h-032-exit` paths and digests, plus the frozen provider and
host paths and digests. The live clone check consumes only that record; it never reaches
for a name introduced later by the G20 evidence block.

An unconditional no-live control validates the exact record and rejects deletion of
each required field, a stale gate digest, the wrong H031 gate path and the wrong HEAD.
This is a bounded data-record validator, not a whole-Python control-flow interpreter or
source-spelling contract. A gate-only `--skip-owner-live` ceremony permits TEST_AUTHOR
to execute the complete deterministic matrix without another model call. It exits
ODÖMBART with `OWNER_LIVE_PHASE_NOT_RUN` when live is the only remaining phase and can
never grant PASS. H031 may forward that exact mode for its deterministic regression but
also exits ODÖMBART; normal invocation still requires H032 exit zero. R74 and production
semantics are unchanged, and H031 binds only the finalized R75 H032 digest.

### 2026-08-21 — H031 R76 exclusive owner-live skip propagation

Independent review found that R75's H031 forwarding predicate recognized two owner-live
substrings but did not prove they were the only owner-level unavailability. H032 can
legitimately print the owner-live marker together with G20 or fresh-H033 ODÖMBART, so
the old predicate could continue into product checks and later turn the mixed owner
state into exit 1.

R76 classifies the complete upstream effect. The only admitted skip transcript has
exit 2, the exact 140 PASS / 1 FAIL summary, only the structured-result failure, green
G20 and H033 controls with exact H033 55/0 PASS markers, one exact no-live reason and
one exact owner-live ODÖMBART line in that order. Mixed G20, mixed H033, unknown,
duplicate, reordered and missing owner markers all exit ODÖMBART before H031 product
execution. The exact legitimate skip is recorded as a J control, not a green H032
dependency, and carries a pending ODÖMBART state through the deterministic H031 run.
Normal invocation still requires H032 exit zero. H032, R75 live binding, production,
process and route semantics remain unchanged; TEST_AUTHOR performs no live call.

### 2026-08-21 — H031 R77 actual H032-embedded H033 evidence

R76 modelled H033's 55/0 summary and PASS result as standalone H032 output lines.
Independent review established that unchanged H032 instead captures H033 stdout and
prints those records only inside the pipe-delimited `tail=` detail of its single
`PASS K_H033_FRESH_UPSTREAM_PROVENANCE` line. The old positive was therefore
disconnected and would reject the legitimate future owner-live ceremony.

R77 builds the positive from the actual current H032 no-live transcript after its real
nested H033 execution. It changes only the current prebuilder structured-result reason
to the future owner-live reason and inserts the exact owner marker. The classifier then
requires one exact rc=0 H032 H033-PASS line whose captured tail contains one 55/0
summary followed by one PASS result as distinct pipe records. Missing, wrong,
duplicate, reordered and standalone-only forms reject. R76's owner-marker ordering,
mixed ODÖMBART, sole structured-result failure and pending exit-2 controls remain.
H032, production, normal H031 and provider/live behavior are unchanged.

### 2026-08-21 — H031 R78 result-kernel runtime fixtures

The completed H032 implementation made two older dependent-gate assumptions observable.
H031's source contract had already frozen one repository-root insertion for both controller
imports, but the runtime import oracle still compared against `controller/authority`. Its
synthetic provider also emitted only four report fields, so the new result consumer correctly
rejected all six routes before H031 could judge their model and effort.

R78 uses one exact transition predicate for the actual import and unconditional rig controls:
the resolved repository root prepended once with bytecode disabled passes; the old authority-only
path fails. The provider fixture now writes a complete frozen-schema report for each of the six
roles. Each actual `run_codex` call must return the controller binding envelope containing that
exact report, while argv and AGENT_START retain their existing independent route checks. A
connected seventh provider start writes the old partial object; it must be schema-rejected and
leave no canonical result. These are dependent-gate repairs, not product credits. R77's exclusive
no-live/H033 parser, H032 bytes, production, process topology and live-call guard are unchanged.

### 2026-08-21 — H032/H031 R89 isolated owner-live call

R82-R88 attempted to make a subprocess capability immutable inside the large embedded
Python judge by growing namespace and spelling inventories. Owner review reset that proof
surface: those inventories are retired rather than extended.

R89 adds one small owner-only, builder-inaccessible and hash-bound helper. H032 and H031
write a strict private plan bound to nonce, device/inode, digest, exact executable, argv,
cwd, mode and result path. The shell invokes the canonical helper directly. Full owner-live
waits without an outer deadline; explicit skip alone uses 120 seconds. A strict atomic result
repeats every binding and carries exact output bytes/digests. The still-running ordinary gate
continues to decide only from the existing actual provider start, canonical result, journal,
topology and cleanup effects. Transport selftests are rig evidence only.

The R74 environment matrix now parses exact second clock identifiers and exact
`<YYYYMMDD-HHMMSS>-test_author` paths. A bounded monotonic judge-only barrier releases each
attempt only at a strictly later absent slot, then the actual run/capture/envelope/journal must
bind that exact slot. An actual preseeded same-second product call rejects before provider
start; rollback, stall, preseed and missing-current-effect controls reject independently. The
barrier cannot grant product credit. Production and the guarded exact live positive are unchanged.

### 2026-08-21 — H032/H031 R90 complete owner-live protocol

Independent review showed that R89 isolated the call but did not yet close the transport:
the plan omitted the exact child environment, publication used replacement, interruption
could leave a session-escaped descendant, and the barrier mistook its release second for
the only admissible current run.

R90 carries the complete normalized child environment in the private strict plan and
compares only its SHA-256 in results and evidence. Plan and result are owner-private,
fsynced and published without replacement; the matching stable-read nonce/devino/digest
channel is consumed and removed once. Signals are blocked across child assignment. The
helper owns a new child session, binds descendants by stable PID/start identity before
reparenting, and synchronously applies TERM, grace, KILL and wait. An escaped-session
fixture must stop delayed writes and report at least two tracked identities. The shell
bounds plan readiness and post-helper processing, while accepted full live still delegates
the sole lifetime to the product and skip alone remains 120 seconds.

The R74 barrier now supplies only a strict lower bound. Any actual well-formed current run
strictly later than the predecessor is accepted and becomes the next predecessor, including
multi-second advances. Same-second collision, rollback, stall, preseed and deletion of the
actual current product run after one provider start reject. These are rig sensitivity facts,
not product credit; production, provider authority, G20 and the sole prebuilder RED remain
unchanged.

### 2026-08-21 — H032/H031 R91 mode-separated owner-live containment

R90's complete ledger made nested no-live H031 exceed its 300-second owner bound because
every skip descendant sample launched `/bin/ps`. R91 narrows authority by mode. Full remains
the sole provider-capable mode, has no outer deadline and retains continuous stable descendant
identity tracking. Skip accepts only the canonical helper-adjacent H032 gate, exact repository
cwd, current SHA/device/inode and the one `--skip-owner-live` argument; its deadline remains
exactly 120 seconds.

Skip uses native `libproc` pid/start and child observations instead of repeated external
processes. On timeout or signal it terminates the direct PGID and every recorded identity,
waits and publishes only a quiescent ODÖMBART result. A shortened owner-only helper copy with
an exact canonical fork/setsid fixture proves the escape is stopped, while a PGID-only mutant
continues writing and therefore fails. Wrong argv, purpose, digest and attempted provider
start all reject before child creation. Successful skip must carry the H032-emitted exact
SKIPPED/start-delta-zero evidence. These controls never grant product credit; R90 environment,
no-replace, replay and signal closures and the guarded full live phase are unchanged.
