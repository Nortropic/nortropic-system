> **Supersessionsnot 2026-09-10 (plattformsrepot).** Historisk operating model (v2, 2026-08-10), bevarad byte-exakt
> under denna not. Nuvarande auktoritet är `AGENTS.md`: `OWNER_AUTHORITY_REQUIRED=YES` och meningarna om att
> ägaren fryser policy och förblir dess ägare är ersatta av det autonoma kontraktsflödet, de frysta grindarna och
> lokal kvalificering. Gamla resultat behåller sina ursprungliga subjekt.

# Codex Operating Model v2 — Nortropic Build Autopilot

**Owner-beslut:** 2026-08-10
**Syfte:** ta bort människan som scheduler/copy-paste-buss under redan owner-auktoriserat kontrollplansbygge utan att göra agentprosa till trust authority.

## Kärnregel

```text
OWNER_AUTHORITY_REQUIRED=YES
HUMAN_OWNER_PRESENT_PER_TASK=NO
OWNER_GATE_EXECUTOR=MECHANICAL
CODEX_ROLE_SEPARATION=WORKFLOW
CODEX_ROLE_SEPARATION_IS_SECURITY_BOUNDARY=NO
FROZEN_OWNER_GATES_REMAIN_TRUST_AUTHORITY=YES
```

Owner fryser policy/kontrakt. Autopiloten får exekvera den frysta policyn utan ytterligare interaktivt godkännande. En Codex-roll får aldrig själv avancera trust-state därför att den skriver "klar" eller "PASS".

## Vad autopiloten gör

För en frozen task:

```text
reconcile actual Git state
→ fresh builder worktree/branch from authoritative origin/main
→ Codex BUILDER
→ mechanical candidate checks
→ immutable local candidate commit
→ detached reviewer worktree at exact candidate SHA
→ Codex REVIEWER
→ blocker? builder remediation → new commit → new reviewer
→ mechanical final gate
→ push
→ PR
→ remote identity verification
→ rebase-merge guarded by expected candidate SHA and unchanged main
→ verify merged origin/main
→ next mechanically eligible frozen task
```

För owner-authorized gate work:

```text
TEST_AUTHOR
→ mechanical owner edit-surface check
→ immutable local candidate commit
→ independent GATE_REVIEWER
→ remediation loop
→ mechanical owner gate
→ push / PR / remote verify / merge
```

Role agents själva pushar eller mergar aldrig. Publication ägs av orchestratorn efter dess mekaniska transition-gates.

## Full access

Owner har valt unattended Codex med:

```text
--ask-for-approval never
--sandbox danger-full-access
```

Detta är en **behörighetsinställning**, inte en trust-dom. Frozen specs/gates, exact candidate identity, scope checks och independent review avgör fortfarande om en candidate får publiceras.

## Authority och state

Autopiloten skapar ingen andra backlog.

- task/source authority: befintliga owner docs + `specs/tasks.spec.json` + frozen exit-test;
- publicerad code authority: Git + `origin/main`;
- candidate identity: immutable Git commit SHA;
- reviewer identity: exakt candidate SHA;
- runtime journal: `.git/nortropic-codex-autopilot/` är **evidence/checkpoint only**, aldrig scheduler truth eller backlog.

Vid restart re-deriveras state från Git/worktrees/PR/gates innan nästa mutation. Journalen får hjälpa diagnostik men får aldrig övertrumfa faktisk Git-state.

## No-force

Autopiloten får aldrig använda:

- `git push --force` / `--force-with-lease`;
- ledande `+` refspec;
- `git reset` för remediation;
- `git rebase` för remediation;
- `git commit --amend`;
- history overwrite.

Remediation = ny commit. Om `origin/main` ändras under en candidate ska autopiloten stoppa den publiceringen fail-closed i stället för att skriva om historik.

## Mechanical builder gate

Innan candidate commit krävs minst:

- actual branch/HEAD/status låst;
- changed-file set känt;
- changed files inom taskens `allowed_write`;
- frozen spec/gate/register inte modifierade av builder;
- file/LOC budget inom task/default;
- `git diff --check` grön;
- current frozen exit-test faktiskt körd och exit 0;
- candidate kan commit:as utan unrelated files.

Builderns rapport är stödjande evidence, inte ersättning för dessa checks.

## Reviewer loop

Reviewer kör i separat detached worktree på exakt candidate SHA. Production edits i reviewer-worktree är blockerande. Confirmed blockers går automatiskt tillbaka till en ny builder-turn på samma branch. Efter remediation skapas en **ny commit** och en ny exact reviewer identity.

Det finns inget fast "fem varv"-tak. Autopiloten får fortsätta så länge candidate identity faktiskt förändras eller findings blir resolved/reclassified med evidence. Om samma blocker återkommer mot samma candidate utan state-progress stoppar den som `NO_PROGRESS` i stället för att spinna.

## Mechanical final gate

Före push/merge krävs minst:

- builder branch clean på reviewed candidate SHA;
- reviewer report gäller exakt samma SHA;
- inga confirmed blocking findings;
- current task frozen exit-test exit 0;
- tidigare gröna frozen gates som autopiloten baselinemätt för tasken har inte gått röda;
- invariantgrinden, när den finns, är grön;
- `origin/main` är fortfarande exakt taskens expected base;
- remote head efter push är exakt candidate SHA;
- PR base/head identity matchar expected refs/SHA.

Merge görs endast med expected candidate SHA. Efter merge hämtas `origin/main` igen och mergen verifieras.

## Test-author/gate review

Test-author får endast arbeta mot explicit owner-authorized contract/edit surface. Gate-author candidate blir en local immutable commit och falsifieras av `$nortropic-gate-reviewer` innan publication.

Autopiloten kan automatiskt fortsätta när:

```text
FROZEN_GATE_READY=YES
BASELINE_RED_FOR_RIGHT_REASON=YES
OWNER_DECISION_REQUIRED=NO
GATE_REVIEW_BLOCKERS=NONE
```

Om owner contract inte räcker stoppar den med `OWNER_DECISION_REQUIRED`; den gissar inte fram ny trust-policy.

## Bootstrap 2026-08-10

Första v2-körningen börjar **inte** på den gamla S3-candidaten. Den börjar från owner decision `docs/loop/owner-h003-attestation-authority-v1.md`.

Historisk rejected candidate:

```text
1e21a7fe150f25626301f3656893d1798ae46c3d
```

Kedjan är:

```text
h-003 TEST_AUTHOR authority hardening
→ gate reviewer
→ merge owner gate
→ fresh h-003 BUILDER
→ reviewer/remediation/final gate/merge
→ fresh h-004 BUILDER from then-current main
→ reviewer/remediation/final gate/merge
→ drain existing frozen eligible tasks
```

Rejected S3-candidaten används aldrig som base och skrivs aldrig om.

## Unattended completion semantics

`run` fortsätter utan interaktiv input tills ett av följande gäller:

- alla tasks som är mekaniskt build-eligible under befintlig frozen authority är gröna/uppfyllda;
- en ny owner architecture/policy decision faktiskt krävs;
- environment/auth/tooling gör nästa transition `OVERIFIERAT`;
- remote/main eller candidate identity ändras oväntat;
- no-progress upptäcks.

Dessa är fail-closed blockers, inte approval-pauser. När orsaken åtgärdats kan samma command köras igen; reconcile fortsätter från actual Git-state.
