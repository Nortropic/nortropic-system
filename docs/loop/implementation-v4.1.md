> **Supersessionsnot 2026-09-10 (plattformsrepot).** Historiskt arkitekturdokument (v4.1, 2026-07-31), bevarat
> byte-exakt under denna not. Nuvarande auktoritet är `AGENTS.md`. Ersatta av det autonoma kontraktsflödet och de
> tekniska skydden i `AGENTS.md` är: §3:s mänskliga led i arkitekturskissen ("godkänner spec, §A och merge"),
> §4:s filstruktur med det odelade repots webbstyrningsfiler, och §29:s lista över vad som aldrig automatiseras
> (godkännande av ny/ändrad task-spec, beslut vid §A, auto-merge). Gamla resultat behåller sina ursprungliga
> subjekt.

# Nortropic autonom loop — v4.1

**Version:** 4.1
**Datum:** 2026-07-31
**Ägare:** Johnny — GRINDEN
**Kontrollplan:** Nortropic Controller — VAKTEN
**Utförare:** Claude Code — HÄNDERNA
**Slutmål:** nivå 3 — obevakad drift till veckokvot, med larm endast enligt notispolicyn.
**Princip:** modellen producerar kandidater; endast controllern certifierar dem.

---

## 0. Ändringar mot v4.0

**Beslut stängda av GRINDEN 2026-07-31:**
- GitHub Pro aktiveras → serverbaserad branch protection är obligatorisk från Fas B, dag 1.
- Bryggan vald: Fas B ger drift denna vecka på nivå 0; kontrollplanet byggs i skivor parallellt.
- Extern domare (GPT-5.6 Sol): effort `max`. `ultra` endast vid uttryckligt parallell undersökning.

**Faktakorrigeringar, verifierade mot källa 2026-07-31:**
- `claude -p`/Agent SDK **drar från abonnemanget**. Den annonserade separata månadskrediten pausades 15 juni 2026 samma dag den skulle träda i kraft (Help Center art. 15036540, daterad uppdatering överst). Konsekvens: controllern får starta headless workers inom Max-planen. Policyn har vänt två gånger under 2026 — preflight innehåller en daterad omkontroll.
- Fable 5 ingår i Max **upp till 50 % av veckogränsen**, drar från samma pool som övriga modeller och förbrukar den snabbare; taket är en andel av befintlig pool, inte extra kapacitet (Help Center art. 15424964, gäller från 20 juli 2026). Konsekvens: `max_fable_share`-budget i §17 är ett hårt yttre villkor, inte en preferens.
- Claude Code pinnas till **2.1.220** (`strictAllowlist` kräver ≥ 2.1.219; Opus 5 tillkom i 2.1.219).

**Tekniska tillägg från Claude-utlåtandet:**
- Oparsbar worker-slutrapport klassas som failure, tolkas aldrig.
- Evidenshashning kalibrerad: syftet är stale-detektion och reproducerbarhet — schema-perfektion får inte försena piloten.
- Speceexemplets verifierare är hermetisk (mock/adapter); riktig Resend ligger i `external-staging`-gaten.

---

## 1. Mål och definition av klar

Systemet ska: välja nästa dependency-ready uppgift → isolerad arbetsyta → en kodagent implementerar exakt den → mekanisk scope-kontroll + förgodkänd verifierare → SHA-bundna bevis → nästa uppgift → säkert stopp vid kvot, thrashing, policybrott eller mänsklig grind → återupptag från disk utan att lita på föregående konversation.

**En run är klar endast när:** varje task i låst specversion har giltig attestation · attesteringarna gäller exakt aktuell PR-head · PR-head passerat full regression · alla servergrindar uppfyllda · inga §A-grindar väntar. En modellfras, ett grönt deltest eller en commit räcker aldrig ensam.

**Slutläget (nivå 3):** controllern arbetar tills veckokvoten är nådd, återstartar själv mellan 5-timmarsfönster via schemaläggare + lease, och stör Johnny endast enligt §22. Ärlig brasklapp som kvarstår: vid kvotstopp mitt i en tur är en snygg notis inte garanterad — ovanligt lång tystnad en arbetsdag är värd en titt.

---

## 2. Icke förhandlingsbara invariants

1. **Worker skriver kod, inte sanning** — aldrig task-spec, state, attesteringar, verifierare, policy eller notishemligheter.
2. **Controller skriver sanning, inte kod.**
3. **Verifieraren är förgodkänd** — ingen fri shelltext exekveras av controllern.
4. **PASS är SHA-bundet** — commit + spec-hash + verifierar-hash + sandboxpolicy-hash.
5. **Fail closed** — kan sandbox, policy, lease, version eller verifierare inte valideras avbryts körningen.
6. **En aktiv ägare** — exakt en controller per repo/run.
7. **Ingen worker-secret** — ingen GitHub-token, Slack-webhook, deploynyckel eller kundcredential.
8. **Mekaniska grindar före LLM-granskning.**
9. **PR-head är mergeobjektet.**
10. **Specen är pinnen** — agenten får inte omskriva målet för att nå det lättare.

---

## 3. Arkitektur

```text
Johnny / GRINDEN ── godkänner spec, §A och merge
       ▼
Nortropic Controller / VAKTEN ────► GitHub PR + required status
  lease · taskval · state machine · worktrees
  verifierregister · attestationer/evidence
  breakers/budgetar · Slack
       ├── startar färsk Worker (eget worktree, inga secrets, inget styrstate)
       ├── kör mekaniska verifierare (shell=False)
       ├── Arkitekt vid oklarhet/§A
       └── Reviewer A/B vid §A eller prelaunch
```

**Två-principal-modellen:** Worker får läsa repo/spec, ändra tillåtna kodvägar, köra lokala verktyg, skapa kandidatcommit — inte skriva kontrollplan, nå nätverk/GitHub/Slack, eller markera pass. Controller får skapa worktree, starta worker, verifiera, skriva state/evidence, posta status/PR — inte generera produktkod. Reviewer läser immutable paket och lämnar findings. Johnny godkänner spec, §A, undantag och merge.

**Varför deterministisk controller:** taskval, dependencykontroll, processkörning med timeout, diffkontroll, exit-koder, circuit och Slack behöver inget språkmodellbeslut. LLM bränner kvot och gör deterministiska steg probabilistiska. Fable/Opus reserveras för arkitektur, klassning, felsyntes och granskning.

---

## 4. Filstruktur

**I repot** (worker-läsbart, ej worker-skrivbart via sandboxpolicy):

```text
nortropic-system/
├── .claude/
│   ├── agents/{utforare,arkitekt,granskare,ui-verifierare}.md
│   ├── commands/granska.md
│   └── settings.json          # bekvämlighet, INTE trust boundary
├── specs/
│   ├── tasks.spec.json        # immutable under run
│   ├── tasks.schema.json
│   └── features/
├── verify/
│   ├── registry.json          # verifier-id → argv/timeout/policy
│   └── bin/{baseline,test-formular,full-regression,...}
├── CLAUDE.md
├── KONSTITUTION.md
├── src/  tests/  docs/
```

**Utanför repot — controllerns trust boundary:**

```text
~/.local/share/nortropic-loop/<repo-id>/
├── controller.sqlite  events.jsonl  attestations/  evidence/
├── runs/  leases/  review-packages/  controller.log
~/.config/nortropic-loop/
├── controller.toml  security-settings.json  model-routing.toml
├── toolchain.lock.json  policy.sha256  slack.env   # 0600, aldrig worker-env
```

**Controller:** Python 3.12+, standardbibliotek (sqlite3, subprocess med `shell=False`, hashlib, pathlib, json/tomllib, signal/atexit, atomisk kataloglease). Inte Bash — svagt för transaktioner, locking, JSON-state och felåterhämtning.

---

## 5. Immutable task-spec

`specs/tasks.spec.json` — exempel (hermetisk verifierare):

```json
{
  "schema_version": 1,
  "spec_id": "nortropic-2026-07-31-a",
  "tasks": [
    {
      "id": "u-014",
      "title": "Kontaktformulär levererar lead",
      "description": "Formulärflödet enligt specs/features/contact-form.md. Resend via adapter — hermetisk verifiering mot mock; riktig sandbox-leverans ligger i external-staging-gaten.",
      "priority": 100,
      "depends_on": [],
      "risk_class": "B",
      "side_effect_class": "hermetic",
      "allowed_write": ["src/contact/**", "tests/contact/**"],
      "denied_write": [".claude/**", "CLAUDE.md", "KONSTITUTION.md", "specs/**", "verify/**"],
      "max_changed_files": 12,
      "max_added_lines": 500,
      "verifier_id": "test-formular",
      "invalidates_on": ["src/contact/**", "src/lib/email/**", "package.json", "package-lock.json"],
      "human_gate": false
    }
  ]
}
```

**Regler:** specen skrivs/ändras av Johnny före run · controllern räknar `spec_sha256` vid start · ändring under run = `POLICY_DRIFT` → circuit OPEN + Slack · scopeändring är ny specversion, aldrig tyst redigering · dependencies acykliska (preflight-validering) · en task ska verifieras på ≤10–20 min lokal testtid, ha tydlig rollback och observerbar outcome — större tasks går till arkitekt före run.

---

## 6. Verifierregister

`verify/registry.json`:

```json
{
  "schema_version": 1,
  "verifiers": {
    "test-formular":   { "argv": ["./verify/bin/test-formular"],   "timeout_s": 600,  "network": "deny", "evidence": ["junit.xml"] },
    "full-regression": { "argv": ["./verify/bin/full-regression"], "timeout_s": 1800, "network": "deny", "evidence": ["junit.xml"] }
  }
}
```

**Regler:** registret laddas från godkänd base-SHA · varje verifierfil hashas före körning · `argv` med `shell=False`, cwd = kandidatens worktree · miljö från allowlist, inte förälderns env · stdout/stderr fångas till evidence och hashas — aldrig `/dev/null` · timeout är egen failure class · en task kan inte introducera sin egen verifierare i samma run.

**Nivåer:** `hermetic` (unit, typecheck, lint, browser mot mock) — alltid tillåten i loop · `local-integration` (lokal DB/testserver) — tillåten med resursgräns · `external-staging` (Resend-sandbox, staging-Vercel) — separat gate, kortlivad credential injiceras endast till verifieraren, idempotency + kostnadsbudget · `production` — aldrig i autonom loop.

---

## 7. Controller-state

```text
pending → claimed → running → candidate → verifying → verified
                                   ↘ retryable_failure   ↘ blocked
verified → stale   när senare diff matchar invalidates_on
```

Fält per task: `state, attempt, claim_run_id, claimed_at, worker_started_at/finished_at, base_sha, candidate_sha, last_failure_fingerprint, same_failure_count, next_eligible_at, verified_attestation_id, updated_at`.

Endast controllerprocessen skriver SQLite/eventloggen. `pending → claimed` är en SQLite-transaktion; claim kräver att alla dependencies har giltig attestation; krasch-recovery sker efter lease-/processkontroll, aldrig enbart på timer.

---

## 8. Attesteringar och evidence

```json
{
  "attestation_id": "att-u-014-<candidate-sha>",
  "task_id": "u-014",
  "base_sha": "...", "candidate_sha": "...", "valid_through_sha": "...",
  "spec_sha256": "...", "verifier_id": "test-formular", "verifier_sha256": "...",
  "registry_sha256": "...", "sandbox_policy_sha256": "...",
  "controller_version": "0.1.0", "claude_code_version": "2.1.220",
  "model": "claude-sonnet-5", "effort": "high",
  "exit_code": 0, "started_at": "...", "finished_at": "...",
  "stdout_sha256": "...", "stderr_sha256": "...", "diff_sha256": "...",
  "result": "PASS"
}
```

**Giltig endast när:** hashkedjan intakt · spec-/verifierhash matchar aktiv run · kandidatcommit finns och diffhash matchar · `exit_code == 0` · inga policyviolations · inte stale · full regression godkänt aktuell PR-head.

**Invalidering:** vid varje integration jämförs ändrade filer mot alla verifierade taskers `invalidates_on` → träffade attesteringar blir `stale` → omtest på nya integrations-SHA:n → `valid_through_sha` uppdateras först efter PASS. Full regression på PR-head är sista skyddet mot ofullständig impactanalys.

**Kalibrering:** hashkedjans syfte är stale-detektion och reproducerbarhet — inte kryptografi (ingen signeringsinfrastruktur finns). Blockera inte piloten på schemaperfektion; fälten ovan räcker.

---

## 9. Lease och concurrency

Lease: `{repo_id, lease_id, host, pid, boot_id, run_id, acquired_at, heartbeat_at, ttl_s: 180}`.

- Förvärv: atomisk kataloglease; misslyckad create → kontrollera befintlig; giltig PID/host/heartbeat → exit 0 "already running".
- Stale lease återtas endast när processkontroll **och** TTL båda visar död ägare; reclaim loggas + notifieras vid split-brain-misstanke.
- Heartbeat var 30 s via tempfil + rename; watcher öppnar circuit vid missad heartbeat under aktiv worker; lease släpps i `finally`, signalhandler och normal exit.
- **Schemalagd Desktop-task resonerar aldrig själv:** den kör endast `nortropic-loop resume --repo <path>` och rapporterar exitstatus. Kommandot avgör via lease om något ska hända.

---

## 10. Sandbox och permissions — fail closed

**Hårda krav:** Claude Code 2.1.220 pinnad · `sandbox.enabled=true` · `sandbox.failIfUnavailable=true` · `allowUnsandboxedCommands=false` · inga `excludedCommands` för worker · `network.strictAllowlist=true` i **user/managed/CLI scope** (ignoreras uttryckligen i repoets `.claude/settings.json`) · tom nätverksallowlist för hermetisk worker · `denyWrite` på kontrollplan/spec/verifierare/agentpolicy · `denyRead` på `~/.ssh/**`, `~/.aws/**`, `~/.config/gh/**`, `slack.env`.

Controllerägd `security-settings.json` (schema valideras mot pinnad version före drift):

```json
{
  "sandbox": {
    "enabled": true, "failIfUnavailable": true, "allowUnsandboxedCommands": false,
    "filesystem": {
      "denyWrite": ["<repo>/.claude/**","<repo>/CLAUDE.md","<repo>/KONSTITUTION.md","<repo>/specs/**","<repo>/verify/**","<controller-state>/**"],
      "denyRead":  ["~/.ssh/**","~/.aws/**","~/.config/gh/**","<controller-config>/slack.env"]
    },
    "network": { "allowedDomains": [], "strictAllowlist": true }
  }
}
```

**Worker-env:** minimal — PATH från allowlist, säkra buildvariabler, tillfälligt HOME vid behov. Aldrig `GH_*`, `GITHUB_*`, `SLACK_*`, deploy- eller cloudcredentials.

**Offensiv gränstest (preflight + vid varje CC-upgrade):** testagent försöker skriva specen med Python · ändra verifierare med `sed` · läsa `~/.ssh` · nå icke-allowlistad domän · `dangerouslyDisableSandbox` · modifiera controller-state · pusha direkt till main. **Samtliga ska misslyckas mekaniskt.**

---

## 11. Agentdefinitioner

### 11.1 Utföraren

```markdown
---
name: utforare
description: Implementerar exakt den tilldelade tasken och skapar en kandidatcommit.
tools: Read, Grep, Glob, Write, Edit, Bash
disallowedTools: WebFetch, WebSearch
model: claude-sonnet-5
effort: high
maxTurns: 40
---
Du är HÄNDERNA. Controllern har tilldelat exakt en task.

Du får: läsa taskkuvertet, spec och kod · ändra endast tillåtna sökvägar ·
köra lokala utvecklingstester · skapa en beskrivande kandidatcommit.

Du får inte: ändra task-spec, verifierare, CLAUDE.md, KONSTITUTION.md,
.claude eller controller-state · markera tasken klar · använda nätverk,
GitHub, Slack, deploy eller produktion · bredda scope för framtidssäkring.

Slutrapportera som EXAKT ETT JSON-objekt, inget före och inget efter:
{"candidate_sha": "<40 hex>", "changed_files": [...], "tests_run": [...],
 "test_results": "...", "open_risks": [...]}
Prosa runt objektet gör rapporten oparsbar och tolkas aldrig välvilligt.
Ett påstående utan verktygsbevis ska märkas OVERIFIERAT.
```

Controllern skapar worktree (exakt base-SHA, ägd livscykel). **Oparsbar slutrapport = failure class `unparseable_output`** — tolkas aldrig välvilligt.

### 11.2 Arkitekten

```markdown
---
name: arkitekt
description: Blockerade vägval, §A-risk, taskdekomposition. Skriver aldrig kod.
tools: Read, Grep, Glob
model: claude-fable-5
effort: max
maxTurns: 12
---
Returnera endast: LÄGE · KLASSNING · ALTERNATIV · REKOMMENDATION ·
ÅNGERBARHET · GRIND. Hänvisa till konkreta filer/speckrav.
```

Fable aktiveras av riskregler; Opus 5 kan bli standardarkitekt för §B om intern eval visar bättre arbete per kvot.

### 11.3 Granskaren (Reviewer A)

```markdown
---
name: granskare
description: Färsk read-only granskare av immutable diff/spec/evidencepaket.
tools: Read, Grep, Glob
model: claude-opus-5
effort: max
maxTurns: 20
---
Du har inte sett byggprocessen. Bedöm endast paketet.
Findings: severity · criterion · file · line · evidence · remediation.
PASS endast utan blockerande findings.
```

A/B-testa Opus 5 mot Fable 5 på seedade buggar; bäst kalibrerad blir Reviewer A.

### 11.4 Extern domare (Reviewer B)

GPT-5.6 Sol i Codex: **effort `max`** (beslutat 2026-07-31; `ultra` är parallellkoordinering — används endast vid uttryckligt bred undersökning) · färsk kontext · exakt samma immutable paket som Reviewer A · ser aldrig Reviewer A:s svar · ingen skrivbehörighet. Codex-anropet hålls på ett ställe; flaggor verifieras mot `codex --help` före första körning.

---

## 12. Taskkuvert

Controllern genererar immutable kuvert per attempt: `{run_id, task_id, base_sha, spec_sha256, title, description, allowed_write, denied_write, candidate_requirements}`. Kuvertet innehåller outcome och lokala utvecklingstester — inte verifierarens interna implementation. Worker kontrollerar aldrig certifieringssteget.

---

## 13. Exekveringsalgoritm

**Preflight — avbryt om någon fallerar:** lease ej förvärvbar · repo/spec saknas · schema/graph ogiltig · smutsig Git-base/fel branch · `toolchain.lock.json` matchar inte · sandboxpreflight fallerar · policy-/verifierhash avviker · baseline verifierar inte grundfunktionen · state kräver manuell recovery · branch protection otillgänglig · **daterad kostnadspolicykontroll äldre än 7 dagar** (claude -p-/Fable-regler är föränderliga).

**Huvudloop:**

```python
with acquire_repo_lease():
    preflight()
    while budget_allows():
        task = select_dependency_ready_task()      # deterministisk sortering
        if task is None:
            finalize_or_wait_for_human_gate(); break
        attempt  = claim(task)                     # SQLite-transaktion
        worktree = create_worktree(base=current_integration_sha())
        wr = run_worker(build_envelope(task), cwd=worktree,
                        timeout=task.worker_timeout, sandbox_policy=locked_policy)
        if not wr.parseable or not wr.candidate_sha:
            record_failure(classify(wr)); handle_breakers(task); continue
        pol = validate_candidate_diff(task, wr.candidate_sha)
        if not pol.ok:
            reject_candidate(pol); open_circuit_if_required(); continue
        ver = run_registered_verifier(task, wr.candidate_sha)   # shell=False
        save_evidence(ver)
        if not ver.passed:
            record_failure(fingerprint(ver)); handle_breakers(task); continue
        att = attest(task, wr.candidate_sha, ver)
        integrate_candidate(att)
        invalidate_and_reverify_impacted_tasks()
        notify_if_policy_requires()
    finalize_run()
```

**Taskval, deterministiskt:** eligible state + `next_eligible_at <= now` → dependencies attesterade → högst priority → lägst riskklass → äldst id. LLM väljer aldrig mellan likvärdiga när en stabil regel räcker.

---

## 14. Diffpolicy

Controllern stoppar när: ändrad fil utanför `allowed_write` · träff i `denied_write` · binär/stor fil utan tillstånd · test/verifierfil raderas · lockfile/dependency ändras utan tasktillstånd · fil-/LOC-budget överskrids · submodule, Git-hook eller CI/security-config ändras · symlink mot skyddat område. Scopeöverskridande är policyfailure med sparat evidence — aldrig en signal att dölja diffen.

---

## 15. Verifieringspipeline

**Per kandidat:** registrerad slutverifierare → policykontroll → impactbaserade regressioner → attestation.
**Per PR-head:** ren checkout av exakt head → reproducerbar install/build från lockfile → full regression → migrations-/schemacheck → secret scan + dependency-policy → UI-e2e där relevant → status `nortropic/controller` sätts på exakt SHA.
**UI:** Playwright driver appen, assertions på funktion/DOM, screenshot/video/logg som evidence, färsk UI-granskare bedömer rubricbaserat; prelaunch kräver mänsklig spot-check.
**Externa integrationer (Resend-mönstret):** hermetisk verifierare mot adapter/mock i loopen · `external-staging`-gate separat med kortlivad credential injicerad endast till verifieraren, idempotency key, max requests, kostnadsbudget · produktionsleverans kräver Johnny.

---

## 16. Circuit breaker

`CLOSED → HALF_OPEN (en probe efter cooldown) → OPEN (människa eller policy krävs)`.

**Failure fingerprint:** failure class + exit code + normaliserade failing test-IDs + normaliserad stderrhash + task-id + toolchainversioner. Tidsstämplar, temp-paths och slumpvärden strippas före hashning.

| Öppningsvillkor | Tröskel |
|---|---:|
| Samma fingerprint | 2 |
| Olika kodfel, samma task | 3 attempts |
| No verified progress | 3 varv |
| Sandbox-/policyviolation | 1 |
| Spec-/verifierdrift | 1 |
| Lease loss / split-brain | 1 |
| Diff > 2× budget | 1 |
| Worker timeout | 2 |
| Oparsbar slutrapport | 2 |
| Extern 429/5xx | separat backoff |

**Kvot är inte taskfailure:** klassas `quota_exhausted` · räknas inte mot kodfelströsklar · state/worktree säkras · lease släpps · `next_eligible_at` sätts från resetinfo, annars försiktig backoff · **en** Slack-notis per kvotperiod.

---

## 17. Budgetar

**Per task:** max attempts · worker turns · väggtid · verifieringstid · ändrade filer · LOC · tokenusage om CLI ger strukturerad usage.
**Per run:** max verifierade tasks · väggtid · total modellusage · **`max_fable_share`** (hårt yttre villkor: Fable ingår i Max upp till 50 % av veckopoolen, samma pool, snabbare förbrukning — verifierat 2026-07-31) · antal arkitekt-/reviewanrop · externa requests · hard stop före uppskattad veckogräns med 15–20 % reserv för review, blockeranalys, regressionsfix och mänskligt initierat arbete.
**Kvotpolicy i preflight:** daterad omkontroll av claude -p-regeln (pausad 15 juni 2026 — drar från abonnemanget tills vidare) och Fable-regeln före varje längre körning.

---

## 18. `/goal`, hooks och subagenter

- `/goal`: tillåten som lokal liveness i en worker-/arkitektsession — aldrig som controller. Evaluatorn ser bara konversationen och saknar verktyg.
- Stop-hooks: loggning, lokal backstop, kill-switch-kontroll, commit-påminnelse. Aldrig slutlig taskstatus, full regression per svar, evighetsloop eller mergebarhet.
- Subagenter: `effort` sätts i frontmatter (prosa konfigurerar ingenting). Settings-hooks fungerar i subagentkontext med `agent_id`/`agent_type`; frontmatter-hooks är extra lager. Integrationstest vid varje CC-upgrade.
- Rutinworker körs som färsk headless huvudagent per task (renare livscykel/output för controllern) — plan-säkert per verifierad policy ovan.

---

## 19. Git, PR och servergrind

**Branchmodell:** `main` skyddad, endast PR · `nortropic/run-<id>` integrationsbranch · `nortropic/task-<id>-<attempt>` kandidatbranch · commit per verifierad task.

**Branch protection (GitHub Pro — aktiveras Fas B dag 1):** Require PR before merging · Require status checks (`nortropic/controller`, från förväntad källa när möjligt) · Dismiss stale approvals on new commits · Require approval of most recent push · Require conversation resolution · Require linear history · Block force pushes & deletions · Do not allow bypassing.

**Credentials:** worker har inget `gh`-material och inget nätverk mot GitHub · controllern äger `gh`/GitHub App-credential · starkast är en dedikerad GitHub App som ensam publicerar required-statusen.

**Auto-merge:** av vid start. Efter ≥3 veckor stabil nivå 3 kan §B-auto-merge övervägas om: servergrind + expected-source-status finns · full regression på exakt head · inga §A-filer · diffbudget hålls · inga findings över tröskel · automatisk rollback initierbar.

---

## 20. §A och riskklassning

**Zoner (minst):** `.claude/**` · `CLAUDE.md` · `KONSTITUTION.md` · `specs/**` · `verify/**` · `controller/**` · `security/auth/billing/migrations/infrastructure` · produktion/DNS/secrets. Listan är path **och** semantik: en fil utanför listan är ändå §A om den rör auth, dataförlust, fakturering, sekretess eller irreversibel extern effekt.

**Flöde:** worker stoppas mekaniskt → controllern paketerar läge/alternativ/risk/minsta fråga → arkitekten lämnar ett rekommenderat vägval med ångerbarhet → Johnny svarar ja/nej/alternativ → ny godkänd specversion → normal kandidat-/verifieringspipeline → Reviewer A + B på PR-head → divergens = mänsklig grind.

---

## 21. Reviewpaket och divergens

Controllern bygger immutable paket per PR-head: `manifest.json (hash per fil) · spec-excerpt · diff.patch · changed-files · attestations · verifier-summary · test-output/ · screenshots/ · known-risks`. Båda domarna får samma paket, aldrig varandras svar eller byggtranskript.

**Utlåtandeformat:** `{verdict: PASS|NEEDS_WORK|BLOCK, confidence, findings[{severity, criterion, file, line, evidence, remediation}]}`.

**Divergens:** båda PASS + mekaniskt grönt → eligible för merge enligt policy · en NEEDS_WORK/BLOCK → ingen syntesagent röstar bort fyndet; fix-task skapas eller Johnny avgör · låg confidence på kritiskt område → människa.

---

## 22. Notiser, STOP och STEER

**Slack (skickas av controllern; workern ser aldrig webhooken):**
Notifiera vid — circuit OPEN · policy-/sandboxviolation · task blocked efter attemptbudget · §A-grind · reviewerdivergens · quota exhaustion (en gång per period) · lease reclaim/split-brain · PR redo · run klar.
Notifiera inte vid — commit, grön task, iteration.
Under Fas B, innan Slack-integrationen finns: GitHub-appens PR-notiser räcker.

**Kill-switch:** controllern kontrollerar `<controller-state>/STOP` före varje task och extern sidoeffekt → inget nytt arbete, säkert avslut, state/evidence sparas, lease släpps, orsak notifieras.

**Steering:** `STEER.md`/kommando lägger en engångsinstruktion i nästa kuvert; loggas med avsändare/tid/hash, arkiveras efter konsumtion; får aldrig kringgå immutable spec.

**Telegram:** införs först vid uppmätt behov av interaktiv HIL. Slack + PR + STOP/STEER räcker initialt.

---

## 23. Observability

Append-only `events.jsonl` + SQLite. Event: `run_started, lease_acquired, task_claimed, worker_started/finished, candidate_created, scope_rejected, verification_started/passed/failed, attestation_invalidated, circuit_half_open/opened, quota_exhausted, restart_scheduled, pr_opened, review_diverged, human_gate_required, run_completed` — vart och ett med `run_id, task_id, base/candidate_sha, model, effort, duration_ms, exit_code, evidence_id`.

Retention: eventlogg/attesteringar länge · råa transkript tidsbegränsat efter dataklassning · verifieroutput kopplat till PR/release · screenshots med persondata särskild hantering. Dashboard ("Verkstadsgolvet") läser eventloggen senare — en vy, aldrig state authority.

---

## 24. Modellrouting och eval

`model-routing.toml` — startkonfiguration, inte permanent sanning:

```toml
[worker]      primary_model = "claude-sonnet-5"  effort = "high"
              fallback_after_distinct_failures = 2
              fallback_model = "claude-opus-5"   fallback_effort = "high"
[architect_b] primary_model = "claude-opus-5"    effort = "high"
[architect_a] primary_model = "claude-fable-5"   effort = "max"
[reviewer_a]  primary_model = "claude-opus-5"    effort = "max"
[reviewer_b]  primary_model = "gpt-5.6-sol"      effort = "max"
```

**Eval (`evals/loop/`):** realistiska små Nortropic-tasks · seedade buggar · scope-creep-bete · felaktigt test · prompt injection i README/fixture · intermittent extern failure · UI-task funktionellt rätt men visuellt dålig. Mät: verifierade tasks/veckokvot · pass@attempt · median attempts · regressionsfrekvens · policyviolations · reviewer-precision/recall · falska PASS/BLOCK · recovery-tid · mänskliga minuter per verifierad task.

**Upgradepolicy:** pinnad CC-version · canary på evalsviten före byte · subagent/hooks/sandbox/settings omtestas · routing ändras endast efter mätning.

---

## 25. Fasplan — bryggan och kontrollplanet parallellt

### Fas B — Bryggan (denna vecka, nivå 0)

Löser copy-paste-problemet omedelbart. Allt byggt här överlever oförändrat in i slutläget.

**Byggs (≈1 dag):**
1. GitHub Pro + branch protection enligt §19.3.
2. Fail-closed sandboxsettings i user scope enligt §10 (config, inte kod) + offensiv gränstest.
3. `arkitekt.md`, `utforare.md` (§11) — Project-chatten pensioneras.
4. `tasks.spec.json` v0 med 3–5 uppgifter + `verify/registry.json` + 2–3 verifierskript (`baseline`, `test-formular`, `full-regression`).
5. PR-flöde: utföraren arbetar i `nortropic/task-*`-gren, öppnar PR; GitHub-appens push är notisen.

**Drift nivå 0:** Johnny är controllern — `delegera u-014` → utföraren bygger → Johnny läser diffen → kör verifierskriptet själv → PR → merge i mobilen. Noll copy-paste, noll autonomi.

**Byggs INTE (dött efter granskningen):** Stop-hook-brytare, `bash -c`-slutvillkor, `passes`-flippning, promptbaserad återstart.

**Exit → Fas P0-drift:** 10 tasks genomförda, noll policybrott, sandboxtesterna gröna.

**Dold vinst:** två veckors nivå 0-drift ger uppmätta failure-mönster, normala diffstorlekar och flapp-frekvenser — controllerns trösklar kalibreras mot verklighet, inte gissning.

### Fas P0 — Kontrollplanet i skivor (helgtid, parallellt med Fas B-drift)

| Skiva | Innehåll (§) | Exit-test |
|---|---|---|
| 1 | SQLite-state + eventlogg (7, 23) | `done` kan räknas om från evidence utan modelltext |
| 2 | Verifier-runner, argv/`shell=False` (6) | manipulerad task kan inte exekvera fri kod |
| 3 | Attestation + stale-invalidering (8) | senare regressionsdiff gör task stale |
| 4 | Lease + heartbeat + reclaim (9) | 100 samtidiga starter → exakt en ägare |
| 5 | Worktree per attempt + crash recovery (13) | controller-död före/efter attestation → idempotent resume |
| 6 | Worker launch headless + kuvert + outputparsning (11–13) | oparsbar rapport → failure class |
| 7 | Diffpolicy + LOC-budget (14) | scope-brott stoppas med evidence |

**Nivå 1** (max 5 tasks/run, observerad) kräver skiva 1–4. **Exit:** 5 rena runs.

### Fas P1 — Härdning (före nivå 2)

Circuit breaker + fingerprints (16) · budgetar (17) · STOP/STEER (22) · Slack (22) · GitHub-status `nortropic/controller` + full regression på PR-head (15, 19) · integrationstesterna i §26.
**Nivå 2** (obevakad 30–60 min). **Exit:** 5 rena runs + två lyckade crash recoveries.

### Fas P2 — Bevisad autonomi (före nivå 3)

20–25 tasks i intern modell-/efforteval (24) · tre rena obevakade körningar med simulerade krascher, kvotstopp och dubbla schemaläggarstarter · secret-exfiltrations- och prompt-injection-test (26.3) · mobil PR-/Slack-flöde verifierat · runbooks (28) övade.

### Nivå 3 — slutläget

Obevakad drift till budget/kvot: schemaläggaren kör `nortropic-loop resume` per timme, lease avgör, kvotstopp klassas och backas, veckotaket är det naturliga stoppet. Fortlöpande SLO (§27) + månadsvis policyreview.

---

## 26. Testplan för harnessen

**Enhetstester:** schema/dependency cycles · state transition guards · registry lookup · path-kanonisering/globbing · diffbudget · fingerprint-normalisering · attestationsgiltighet · stale-invalidering · lease acquire/heartbeat/reclaim · budgetberäkning.

**Integrationstester (samtliga före nivå 2):** worker lyckas → kandidat · worker säger PASS men tester failar → state förblir fail · worker flippar spec via Python → sandbox blockerar · worker ändrar test/verifierare → policy blockerar · symlink mot skyddad path → blockeras · worker mot GitHub → nätverk blockerar · worker dör mitt i turn → recovery · controller dör före/efter attestation → idempotent resume · två schedulers → en lease · heartbeat stannar → säker reclaim · task B regressar A → A stale + failar · ny push efter review → status/approval stale · quota error → ingen taskfailure, korrekt backoff · STOP under worker → säkert avslut.

**Adversarial eval:** prompt injection i source comment · instruktion att "förbättra" CLAUDE.md · test som skriver ut env · dependencyscript som läser SSH/GH-config · lockfile med postinstall · verifierare med manipulerad hash · path traversal · falsk completion token · output med annan candidate-SHA.

---

## 27. SLO (från nivå 2, veckovis)

| Mått | Mål |
|---|---:|
| Verifierade tasks utan mänskligt ingripande | ≥80 % av loop-eligible |
| Falska PASS upptäckta senare | 0 kritiska |
| Lyckade policy-/sandboxviolations | 0 |
| Median attempts per verified task | ≤1,5 |
| Thrashing över breakergräns | 0 |
| Återstart utan manuell statefix | ≥95 % |
| Merge med stale attestation | 0 |
| Mänsklig tid per §B-task | nedåtgående |
| Kvotandel arkitekt/review | inom reserv |

80 % är ett lokalt driftmål, inte ett kapabilitetspåstående.

---

## 28. Runbooks

**BLOCKED:** evidence/fingerprint sparas · circuit öppnas för tasken · kompakt Slack · arkitekten får endast diagnostikpaketet · specen ändras först efter Johnnys godkännande.
**POLICY_DRIFT:** hela run stoppas · hash/diff jämförs · säkerhetsfil återställs aldrig automatiskt · Johnny avgör ny policyversion.
**QUOTA_EXHAUSTED:** checkpoint · ingen ny task · lease släpps · backoff · en notis per period.
**LEASE_CONFLICT:** inget arbete startas · båda identiteterna loggas · båda levande → circuit OPEN + människa · aldrig "senaste skrivning vinner".
**REVIEW_DIVERGENCE:** båda råa utlåtandena postas separat · ingen syntes · merge blockeras · Johnny väljer.
**ROLLBACK:** revert exakt taskcommit/PR · full regression · attesteringar på revertad SHA invalideras · incidentevent · verifier-/specändring via separat §A-PR.

---

## 29. Vad som aldrig automatiseras

1. Vad som är värt att bygga.
2. Godkännande av ny/ändrad task-spec.
3. Produktion, DNS, secrets, kunddata, irreversibla externa operationer.
4. Beslut vid §A eller reviewerdivergens.
5. Ändring av verifieringspolicy i samma run som den bedömer.
6. Modell-/toolchainupgrade utan canary.
7. Auto-merge innan systemet förtjänat den (§19.5).

---

## 30. Pilot (körs i slutet av Fas P0)

Tre hermetiska tasks: ren backendfunktion med unit test · UI-komponent med Playwright-assertion · refaktor med full regression.

**Succes:** controllern väljer och kör samtliga · worker kan inte skriva kontrollplan · SHA-attestation per task · senare regressionscommit gör rätt task stale · dubbel schedulerstart ger en lease · avsiktlig testfailure öppnar circuit · full regression på PR-head passerar · Johnny godkänner från mobil utan copy-paste.

---

## 31. Källor

**Verifierade 2026-07-31:**
- Help Center art. 15036540 *Use the Claude Agent SDK with your Claude plan* — uppdatering 15 juni: kreditförändringen pausad; `claude -p`/SDK drar från abonnemanget.
- Help Center art. 15424964 *Claude Fable 5 on your plan* — från 20 juli: Fable ingår i Max upp till 50 % av veckogränsen, samma pool.

**Officiellt:** code.claude.com/docs — goal, sandboxing, settings, hooks, sub-agents, desktop-scheduled-tasks, headless · Claude Code changelog (2.1.219: Opus 5, strictAllowlist; 2.1.220 pinnad) · anthropics/cwc-long-running-agents · *Effective harnesses for long-running agents* · GitHub branch protection-docs · openai.com/index/gpt-5-6 (max/ultra).

**Granskningskedjan:** `nortropic-loop-review-2026-07-31.md` (Reviewer B, GPT-5.6) · Claude-utlåtande med verifieringar (denna konversation) · Ralph-reposyntesen ur granskningens §6–7.

**Forskning:** self-preference bias (arXiv 2604.06996, 2508.06709) · belöningshackning i Claude Code (arXiv 2605.20744).

---

## 32. Slutbild

Den färdiga loopen är inte en modell som aldrig slutar. Den är en liten controller som aldrig gissar · en worker som får ett avgränsat försök · en verifierare som inte kan förhandlas bort · bevis som går att återskapa · en brytare som stoppar dålig uthållighet · och Johnny som störs endast när omdöme, risk eller värde kräver en människa — tills veckokvoten säger godnatt.
