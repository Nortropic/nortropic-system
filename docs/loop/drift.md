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

Independent review of the first h-032 candidate confirmed GR-01..GR-05. Owner clarification now
binds final snapshot rehash → absolute-path exec to an enforced controller-owned namespace, not to
an impossible claim that macOS pathname exec is intrinsically race-free. The covered attacker is
the untrusted provider/agent context and its delegated filesystem capabilities. The actual G20
Seatbelt launcher was probed against snapshot write, chmod, unlink, rename, replacement creation
and parent-root rename; every mutation was denied while the contained process ran successfully.
Arbitrary unsandboxed same-UID processes with independent controller-root authority remain outside
h-032. H-032 stays unfrozen and h-031 stays paused pending a new independently reviewed candidate.

GR-06/GR-07 remediation makes the sequencing explicit: first create an immutable h-032 candidate,
then run `verify/bin/h-032-exit --emit-g20-evidence <outside-repo-path>` on an authorized owner
runner. The strict JSON evidence binds task, candidate commit, complete task-spec bytes, gate bytes
and the real `controller/launch/cli` probe identity; replay across any changed identity, malformed
or manual PASS, FAIL and ODÖMBART are rejected by `--g20-evidence`. This is an ephemeral review
artifact, not a new state store. The opened-object gate now requires observed regular-file proof on
the same opened identity and includes no-check, stale-path-stat, same-object and non-regular judge
controls. Candidate bytes cannot change after G20 PASS; remediation means a new commit and probe.
- Pre-amendment quota-aborted h-003/h-004 worktree is preserved local evidence, not authority, not a resume candidate.
- No frozen gate, constitution/rulebook boundary, G20, candidate identity, attestation/fencing, promotion identity or no-force rule is weakened by this amendment.

## 2026-08-12 — Separate authenticated runner provenance before h-032

H-032 field binding is not producer authentication: its strict JSON can be reproduced byte-for-byte
by the normal same-UID Codex/user context. Owner therefore reserves the next free task `h-033` as a
separate provenance authority, and h-032 depends on h-033. The selected design is a dedicated OS
producer UID which independently runs an allowlisted frozen probe and writes under a producer-owned,
non-user-writable evidence root. The requester supplies identities, never a result. This protects
against G20-contained Codex and arbitrary unsandboxed same-UID processes, not against the producer
UID or root/admin. No such principal/root is currently provisioned; the gate has an honest RED
implementation baseline and an ODÖMBART provisioning boundary, with no unsigned fallback. This is
provenance only, not a second backlog, attestation store or promotion authority.

## 2026-08-12 — H-033 provenance gate review remediation

Independent review blocked candidate `dc380854fa008fe830cf60e6d6d79162bfeebf4f` on
GR-01..GR-05. The remediated contract keeps the separate OS-principal design but makes its effects
executable: the requester sends only task/candidate/spec/gate/probe identities; the canonical
producer resolves a closed owner-installed allowlist, executes the selected probe and derives
PASS/FAIL/ODÖMBART from a separately observable producer-owned A/B/C effect record.

Evidence has one exact duplicate-aware nine-field schema. Trust comes from canonical account
`_nortropic_provenance` and the same opened regular object below a non-replaceable protected parent
chain, never a JSON UID/trusted claim. Copies outside that origin, wrong producers, symlinks,
stat-then-reopen, writable parents, mutations and stale/wrong bindings fail. The unattended
transition may execute only the allowlist and publish only to its fixed destination; arbitrary
command/path/output and generic passwordless privilege are forbidden. If uid 501 can generically
become producer/root, or the owner-runner cannot prove the separate account/service/root, H-033 is
ODÖMBART with no same-user fallback. Current production remains honestly RED because the component
and root are absent; judge self-controls are separate from that RED and future production checks.

## 2026-08-12 — H-033 GR-06..GR-10 production-boundary remediation

Owner-runner inspection proved that uid 501 has interactive admin membership but no noninteractive
sudo/root/arbitrary-user transition: `sudo -n -l`, `sudo -n id` and a switch to the absent canonical
producer all required authentication or failed. Privileged system namespaces and installed helper
binaries are root-owned and non-user-writable; the only Nortropic launch service is an unprivileged
uid-501 LaunchAgent, and no Nortropic privileged wrapper exists. This permits a future narrow,
owner-provisioned launchd transition without treating interactive administrator authority as an
unattended attacker capability.

Canonical authority is now literal owner contract rather than requester environment: account
`_nortropic_provenance`, launchd label and producer helper, root-owned digest allowlist, protected
evidence root, production verifier and a separate root-owned conformance observer/receipt root.
The observer authenticates the live frozen-probe peer executable and writes A/B/C outside producer
authority, so producer evidence cannot forge its own execution oracle. Material parser, request,
binding, opened-object race and namespace clauses map to future black-box CLI/verifier controls;
the Python controls are explicitly judge selftests only. No account, service or root was provisioned.

## 2026-08-12 — H-033 GR-11..GR-15 service/freshness/freeze remediation

The frozen service authority is one relationship: protected LaunchDaemon definition and loaded
`system/com.nortropic.provenance` bind the canonical helper, producer, allowlist and evidence root.
Each run receives a trusted fresh request identity, and observer receipt plus evidence bind that
instance so an old same-probe receipt cannot prove a new execution. Strict-document controls call
the actual `cli verify` consumer path. CLI and verifier names must identify one hard-linked
executable, connecting the deterministic opened-object control to production. Pre-freeze uid-501
privilege is a separate candidate-bound owner-terminal subgate with raw command/result evidence and
PASS/FAIL/ODÖMBART; it is not recursive H-033 runtime provenance. Production remains honestly RED.

## 2026-08-12 — H-033 owner-audit macOS account-oracle remediation

The candidate-bound owner audit returned ODÖMBART solely because the absent canonical producer
account was reported by the real macOS local DirectoryService node as exit 56 with
`<dscl_cmd> DS Error: -14136 (eDSRecordNotFound)`, while the gate recognized an incorrect exit 185
oracle. The audit now treats only that exact exit/output pair as known absent pre-provisioning,
treats a successful read with numeric UniqueID and PrimaryGroupID as known present, and keeps every
other lookup failure or malformed success ODÖMBART. Dedicated self-controls freeze all three states
and prove that a RecordNotFound-looking message with a different exit is not accepted as absence.
No producer principal, protected root, service or production component was created.

## 2026-08-12 — Versioned Python interpreter authority prerequisite for H-034

H-034 cannot bootstrap from the repository's PATH-based Python shebangs or from the
documentation-only `toolchain.lock.json` concept. A new owner-only versioned authority therefore
binds the non-symlinked absolute Python 3.12.13 object and exact SHA-256, plus the fixed `-I -S`
isolation contract. Its gate validates a duplicate-aware exact schema, hashes and fstats one opened
source object, rejects path/env/request selection and disposable symlink, non-regular,
non-executable, stale-object and identity mutants. Runtime pathname execution is not claimed to be
arbitrary same-UID race-free: future H-034 must use the already accepted verified-source → private
protected snapshot → final rehash → protected-path execution model. The candidate-bound read-only
owner audit remains required from the real macOS owner terminal before freeze. No H-034 or H-033
artifact, dependency, service or runtime implementation was created or resumed.
## 2026-08-13 — H-035 owner-production authoring separation prerequisite

Owner allocated `h-035` (with `h-034` still reserved for the native finite verifier kernel) as the one-time bootstrap from ordinary builder authority to separate ordinary, TEST_AUTHOR and owner-production authoring mechanics. The test-author candidate freezes schema v2 task classes, the owner-production path registry, the bounded historical H-035 exception and the RED effect gate. No H-034 task, source, binary, recipe or identity manifest is created. Current production remains RED at `OWNER_AUTHORITY_CLASS_ENFORCEMENT_ABSENT`; autopilot remains paused. See `docs/loop/owner-author-workflow-v1.md`.

Final H-035 owner authority now permits a fresh H-034 contract from `3671f9fc8fd26bb16ba919c26e8516fac5763f25`. H-034 is the owner-authority native finite verifier kernel: C, arm64 macOS, exact final signed Mach-O authority, no third-party runtime dependencies, Apple system runtime/dyld only, fixed compiled plan and no Python runtime authority. Its real black-box operation closes H-033 verifier semantic authority over already-opened evidence, independent observer receipt and allowlist descriptors, including strict schemas, complete bindings, receipt digest, request freshness and PASS/FAIL/ODÖMBART non-interchangeability. H-033 retains protected origin/opening and now depends on H-034; H-034 depends on final H-035, avoiding a cycle. Recipe and manifest bind the exact Apple toolchain, sources, signing, final bytes, load commands and deterministic rebuild. No deployment minimum is invented: the build forbids target injection and binds the actual platform/minOS/SDK tuple emitted by the toolchain. Historical H-035 `F_H034_TASK_ABSENT` and `F_H034_BYTES_ABSENT` checks were bootstrap-freeze assertions: the task-absence check intentionally turns RED now, and the byte-absence check will turn RED when the separately authorized production candidate appears. H-035's frozen gate is not edited. This TEST_AUTHOR change contains no native source, binary, recipe or manifest implementation and AUTOPILOT remains off.

Independent review blocked the first H-035 candidate on GR-01..GR-03. The remediated gate removes synthetic semantic probes from acceptance and binds normal `controller/loop/cli run` routing/restart plus operational authority transitions to disposable real effects. Current production is RED earlier and more concretely: a schema-v2 owner task reaches the ordinary `claimed` state instead of persisting `OWNER_ACTION_REQUIRED`; nested Seatbelt may prevent the inert provider marker after that unsafe decision. The registry is now judged by duplicate-aware exact schema/membership controls, and the task/docs/path surface matrix is complete. No production implementation or H-034 byte was written; autopilot remains paused.

Independent review then blocked candidate `946f9ab26add917804a68f011291f36465477fbf` on H035-GR-04..GR-06. The next test-author gate removes the provider marker as authority and freezes a gate-side process-image observation through the normal loop route, with an exact candidate/spec/gate-bound owner-terminal acceptance artifact when nested Seatbelt denies exec. Transition acceptance now snapshots persisted state, bounded workspace effects and isolated bare-remote refs rather than trusting returned JSON. Helper-only registry/path commands are explicitly judge-selftest and may not satisfy material properties; each authority mutant must be exercised through every real decision consumer. The real current RED remains the owner task persisted as `claimed`, not `OWNER_ACTION_REQUIRED`. No production implementation, H-034 byte, resume, push or merge is part of this remediation.

Owner-terminal acceptance v1 for candidate `a024586c33c741a000829e72ec2e405ede5da53b` produced a process-image observer false negative although a diagnostic-only normal loop run reached the disposable provider and returned its designed refusal. H-035 therefore versions the owner subgate to `H035_OWNER_PROVIDER_EXEC_V2`: a fresh nonce, deterministic `/bin/sh` provider representation and external ordered ancestry observation replace the ambiguous pathname-substring observer. This changes no production verdict or authority surface; current H-035 remains RED and autopilot remains paused.

Real owner-terminal V2 evidence then proved a provider process while the observer returned FAIL. The precise defect was pathname spelling: the fixture executed the `/var/folders/...` path it was given, while V2 called `Path.resolve()` and searched for `/private/var/folders/...`; macOS maps `/var` to `/private/var` by symlink but preserves the original argv token. V3 binds the exact path spelling passed to exec, exact `/bin/sh` argv tokens, and exact Python controller stages in real PPID order. It permits the provider's deliberate new process group and only the documented optional sandbox intermediate. Split-PGID owner topology is the positive regression; forwarded-argv, missing/reordered/fabricated ancestry and shell/controller-image bypasses are negative controls. H-035 production remains RED and autopilot remains paused.

Real owner-terminal V3 evidence again proved the provider process externally while the frozen observer returned FAIL. The exact remaining predicate was V3's Python-basename guess: macOS `ps -o comm` reported the Homebrew controller image truncated as `/opt/homebrew/Ce`, not a basename beginning with `python`. V4 binds all four controller rows to the exact `comm` image observed for the gate-started loop PID plus their exact entrypoint argv tokens. The exact `/bin/sh` provider leaf, complete nonce/path tokens, real PPID order, split PGID allowance and negative topology controls remain unchanged; a mismatched controller image rejects. H-035 production remains RED and autopilot remains paused.

The H-035 builder implementation activates the frozen separation without creating H-034 bytes. A shared authority component now parses the registry and repository path language, derives changed files from Git, enforces actor-specific write surfaces, and persists explicit owner author, recovery, independent-review and final-freeze states. Task selection routes schema-v2 `owner_authority` work directly to persistent `OWNER_ACTION_REQUIRED`, so restart cannot turn it into an ordinary provider attempt. Historical non-v2 task input remains ordinary only. The one-time bootstrap remains bounded to the already owner-approved builder candidate; prospective ordinary candidate checks reject all registry-reserved authority-control and owner-production paths. `AUTOPILOT` remains `off` and publication remains outside the builder role.

Independent review rejected builder candidate `fe6010cfec149511559c33c7c67812fe45bc6be1` on H035-IR-01..07 despite the prior 131/0 gate. The strengthened TEST_AUTHOR gate removes the masked seams: the normal taskval event is passed directly into owner-author without a judge-created projection; an ordinary task with hostile owner state is refused; owner scope is measured against the task's exact `owner_author_allowed_write`; the exact ordinary policy CLI used by the loop is exercised against a future protected task; a real bare `refs/heads/main` is advanced after review; candidate-local spec and registry absence are negative controls with no installed-byte fallback; and the malformed path corpus traverses normal task selection before state. Every material remediation is production acceptance and `MATERIAL_PROPERTIES_JUDGE_ONLY=NONE`; V4 owner observation and all earlier controls remain. No production or registry byte, H-034 byte, AUTOPILOT state, push or merge is changed by this pass.

The H-035 remediation keeps one authoritative state representation per transition path: owner-author consumes the normal taskval eventlog directly and subsequent transitions append to that same log; direct operational fixtures that began with `current.json` continue there. Canonical task class is revalidated at every owner transition, owner candidates are bounded by the task-specific owner surface, and normal schema-v2 policy rejects prospective ordinary authority grants. Final freeze observes live configured-remote main, canonical spec/registry bytes have no installed fallback, and taskval validates every write path before persisting a handoff. The implementation does not alter the V4 observer, frozen authority documents, H-034 reservation, or AUTOPILOT.

Independent review rejected remediation candidate `3927ab145e3d894b1dcab6c78eba63a244a68342` on H035-R5-RV-01..02 despite its green R5 gate. R6 adds two production-chain controls without weakening V4 or IR-01..07. First, a real taskval owner handoff is followed by a forced SQLite projection-open failure; rejected owner-author must leave the authoritative eventlog/projection, bounded workspace and isolated bare-remote refs byte-identical, while the existing successful handoff remains the positive. Second, separate clean clones invoke normal accepted taskval and policy paths with Python bytecode-control environment removed; expected external effects must succeed while every non-`.git` repository path and byte remains unchanged. This catches repository-local `__pycache__`/`.pyc` without prescribing how shared parsing is loaded. All material clauses remain production acceptance and `MATERIAL_PROPERTIES_JUDGE_ONLY=NONE`; no production, registry, H-034, AUTOPILOT, push or merge change is part of this pass.

Independent gate review then rejected R6 candidate `749cce4ebc23edf69eea1adb570975ad552908c2` on two test-author defects, not on a newly closed production result. The RV01 file-only digest ignored empty directories and could not distinguish the deliberately failed `state.db` directory from its deletion. R7 uses one non-following `lstat` snapshot for state/workspace comparisons, binding roots, every file and empty directory, symlinks and targets, object types, content and size, mode and ownership; disposable cleanup/type/target/mode mutants prove those dimensions reject. The V4 owner observer also had an unsynchronized two-second provider lifetime: sampling started before launch, each whole-table `ps` consumed part of the window, and one valid run exited after only three samples without a match. V5 keeps one provider shell alive with a gate-owned bounded ready/release handshake until exact external observation or failure. The handshake never proves execution, same-candidate rerun is not authority, and every exact V4 argv/path/nonce/ancestry/controller-image/optional-Seatbelt/split-PGID and false-positive condition remains. Production is still RED only on RV01/RV02; no production, registry, H-034, AUTOPILOT, push or merge change is part of R7.

Independent gate review rejected R7 candidate `5389516e01b12f47a91f2c22ea94db0915d62ec3` because V5 still carried a provider self-cap nominally at 15 seconds, shorter than its 18-second observer attempt and vulnerable to a process snapshot returning after the checked deadline. A real normal-route schedule reproduced false FAIL after readiness, five slow empty samples and 20.2722 seconds. V6 removes the provider's independent normal expiry: observer release is its only normal terminator, and `finally` releases every PASS/FAIL/ODÖMBART path. Readiness starts a full 24-second window, each `ps` is bounded to five seconds, and the controller's 45-second fail-safe is mechanically later than window + last-sample overrun + ten-second cleanup margin. Adversarial schedules prove delayed exact match and marker-only rejection beyond 20.2722 seconds, observer-error release, no-ready cleanup and rapid-exit rejection. Exact V4 predicates, R7 snapshots and all production controls remain; production is still RED only on RV01/RV02 and no production, registry, H-034, AUTOPILOT, push or merge change is part of R8.

The R8 builder remediation closes only RV01/RV02. State append now restores its just-added event bytes if SQLite projection cannot commit, and owner-author removes its bounded attempt workspace on that rejected persistence path. Normal taskval and policy suppress interpreter bytecode emission before importing the shared parser, eliminating repository-local `__pycache__`/`.pyc` without caller environment dependence. V6 observation, R7 snapshots, IR01..07, frozen trust inputs, H-034 and AUTOPILOT remain unchanged.

H-034 test-author integration mechanically found `H035-H034-INTEGRATION-01` after H-035 owner-final freeze: `controller/authority/cli` binds owner transitions to a constant `verify/bin/h-035-exit`, so another canonical owner task cannot use its own `exit_test`. The quarantined H-034 draft remains untouched. H-035 R9 freezes only the missing task-specific gate contract: a disposable two-owner-task fixture must complete owner-author → check-candidate → record-review → owner-freeze using the selected task row's regular gate blob from the exact candidate Git object, while wrong path/digest, the other task's gate, caller override, missing/tree/symlink/changed gate all reject with unchanged state/workspace/bare refs through every operational consumer. H-035 keeps its own gate, every earlier 171 control remains, owner-author cannot modify its task gate, and `MATERIAL_PROPERTIES_JUDGE_ONLY=NONE`. Production is intentionally RED only on this integration defect; no production or H-034 byte, AUTOPILOT, push or merge is changed.

Independent review rejected R9 gate candidate `a2a82262aa6b5cfd146290d802be4360ea84e14b` on `H035-R9-GR-01..02`: it selected task B only as a negative cross-task input and never separated candidate Git bytes from matching checkout bytes. R10 adds a second complete positive chain for task B and four positive hostile-checkout variants—regular bytes, directory, symlink and missing path—while holding the exact candidate object fixed. A separate altered candidate-object digest mismatch rejects through all four consumers with unchanged effects. Thus task-B special-casing and mutable-checkout authority cannot turn the gate green. The R9 negative matrix, H-035 binding, prior 171/V6/snapshot/RV/cache controls and `MATERIAL_PROPERTIES_JUDGE_ONLY=NONE` remain unchanged; production remains RED only on task-specific Git-object gate binding. No production/H-034/AUTOPILOT/push/merge change is included.

The H-035 R10 builder remediation closes only task-specific Git-object gate binding. The shared authority core resolves an owner task's exact `exit_test` with `git ls-tree`, accepts only regular executable or non-executable blob modes, and reads bytes by object id. All four operational consumers compare requester fields with this derived path and digest, reject explicit gate overrides, and reject a candidate that changes its own gate. Both distinct-task chains and every hostile mutable-checkout positive now pass; all wrong identity/type/object controls reject. Frozen spec/gate/registry, H-034 bytes and AUTOPILOT remain unchanged; no push or merge.

Independent review rejected builder candidate `d553d80530476c2096ff930eabd0a3a27bed7b5f` on `H035-R10-RV-01`: a legitimate exact gate filename `:(literal)verify/bin/r9-owner-b-exit` is accepted by the canonical path grammar and committed as a regular blob, but unescaped `git ls-tree` reinterprets it as pathspec syntax and all four owner consumers reject. A disposable literal-pathspec correction alone changed 215/1 to 216/0. H-035 R11 freezes two real full-chain positives for exact filenames beginning `:(literal)` and `:(top)`, with literal fixture commits, persisted state, bounded workspace, remote refs and cleanup observed. All prior 216 controls remain. Production is intentionally RED only on literal Git-object path resolution; no production/H-034/AUTOPILOT/push/merge edit is included.

Independent gate review rejected R11 candidate `cf38404f3f793a4c97489aaf0442ea723f041a41` on `H035-R11-GR-01`. Its literal/top positives matched candidate and checkout bytes, allowing a pathspec-only mutable-checkout fallback to report 219/0 while violating immutable candidate-object authority. H-035 R12 combines those exact filenames with hostile regular-byte, directory, symlink and missing checkout states through complete owner-author/check-candidate/review/freeze chains, then restores and proves fixture cleanliness. A changed committed literal gate with its prior digest is the inverse four-consumer rejection, while UTF-8, spaces and `100644` remain legitimate. No production, H-034, AUTOPILOT, push or merge change is included.

The H-035 R12 builder remediation closes only literal Git-path resolution. The existing candidate-tree resolver now invokes `git --literal-pathspecs ls-tree`, so every validated canonical filename is repository data rather than Git pathspec syntax. It still requires a regular `100644`/`100755` candidate blob and reads bytes by object id; no checkout path is consulted. The frozen gate moves from the exact 224/6 RED baseline to 230/0, including all four pathspec-hostile checkout positives, the inverse candidate-object mismatch rejection and the UTF-8/space positive. Frozen spec/gate/registry, H-034 and AUTOPILOT remain unchanged; no push or merge.
