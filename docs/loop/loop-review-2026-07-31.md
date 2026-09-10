> **Supersessionsnot 2026-09-10 (plattformsrepot).** Historisk granskning (2026-07-31) av en tidigare
> loopplan, bevarad byte-exakt under denna not. Nuvarande auktoritet är `AGENTS.md`; inget i granskningen är
> dagens instruktion, och dess omnämnanden av det odelade repots filer är historiska observationer.

# Granskning och omvärldsanalys: Nortropic autonom loop v3.0

**Datum:** 2026-07-31  
**Granskad fil:** `nortropic-loop-implementation.md` v3.0  
**Syfte:** verifiera bärande antaganden, hotmodellera loopen, djupgranska Ralph Wiggum-ekosystemet och formulera förbättringar som håller för obevakad drift.

---

## 1. Samlad dom

Planen har **rätt produktidé och flera starka byggstenar**, men är ännu inte en säker eller tillräckligt deterministisk nivå-3-loop för obevakad drift till kvotgräns.

Min bedömning:

| Område | Bedömning | Kommentar |
|---|---:|---|
| Problemformulering | 9/10 | Rätt flaskhals: manuella överlämningar och kvot som knapp resurs. |
| Arbetsuppdelning | 8/10 | En uppgift i taget, färsk kontext och commit per uppgift är rätt. |
| Verifieringsidé | 7/10 | Mekanisk omverifiering är rätt riktning, men implementationen kan kringgås och har logiska fel. |
| Tillståndsmodell | 4/10 | Ett agentmuterbart `passes` är för svagt och inte bundet till aktuell commit. |
| Säkerhetsgräns | 3/10 | Hooks används som gräns där OS-sandbox/controller måste vara gränsen. |
| Återstart/concurrency | 4/10 | Schemaläggaren väcker, men äger inte exklusivt loopen. |
| Källhygien | 5/10 | Bra källkategorier, men flera exakta siffror och driftpåståenden saknar spårbar primärkälla. |
| Vägen till produktion | 8/10 | Fasindelning och gradvis autonomi är bra; ordningen behöver ändras. |

**Kärnslutsats:** modellen får bygga en kandidat, men får inte själv skriva sanningen om huruvida kandidaten är godkänd. Producenten, verifieraren och grinden måste vara tre skilda behörighetsdomäner.

---

## 2. Det som redan är bra och bör behållas

### 2.1 En uppgift per arbetsförsök

Detta är den mest återkommande gemensamma nämnaren i fungerande Ralph-implementationer. En liten uppgift ger:

- tydlig diff,
- begränsad kontext,
- begriplig rollback,
- bättre felklassning,
- mätbar genomströmning.

Behåll commit per uppgift och färsk exekveringskontext.

### 2.2 Fil- och Git-baserat minne

`uppgifter.json`, `framsteg.md` och Git-loggen är bättre långtidsminne än en lång konversation. Det stämmer med både Anthropics långkörningsmönster och de starkaste communityimplementationerna.

### 2.3 Default-FAIL och programmerbara slutvillkor

Regeln att en uppgift endast hör hemma i loopen när den kan verifieras programmatiskt är utmärkt. Den behöver skärpas till:

> En uppgift får endast bli verifierad när en controller utanför byggagentens behörighet har kört en förgodkänd verifierare mot en bestämd Git-SHA och sparat beviset.

### 2.4 PR som mänsklig grind

PR är rätt mobilvänliga objekt. Den ger diff, diskussion, statuskontroller och en tydlig mergehandling. PR-grinden bör stärkas med GitHubs serverbaserade branch protection och en controllerägd statuskontroll.

### 2.5 Gradvis upptrappning

Nivå 0–3 är rätt tänkt. Autonomi ska förtjänas med observerad tillförlitlighet, inte slås på efter att filerna har skapats.

### 2.6 Separat modellfamilj som extra domare

Korsfamiljsgranskning minskar risken för själv- och familjebias. Den ska dock ligga efter mekaniska kontroller och inte behandlas som ett kryptografiskt sanningsbevis.

---

## 3. Kritiska blockerare i v3.0

### B1 — `uppgifter.json` skyddas inte mot Bash

**Allvar:** kritisk

Utföraren har `Bash`. En `PreToolUse`-hook som matchar `Write|Edit` kan därför kringgås med exempelvis Python, `jq`, `sed`, `perl`, `cp` eller ett eget program. Samma sak gäller tester, hooks, `CLAUDE.md`, `KONSTITUTION.md` och verifieringsskript.

Anthropics egna exempel för långkörande agenter varnar uttryckligen för samma lucka: deras pedagogiska verifieringshook täcker Write/Edit men inte Bash-baserad omskrivning.

**Konsekvens:** agenten kan både göra arbetet och ändra måttstocken som avgör om arbetet är godkänt.

**Åtgärd:**

1. Lägg policy, task-spec, verifierare och runtime-state utanför arbetarens skrivbara filsystem.
2. Använd Claude Codes OS-sandbox med `failIfUnavailable=true` och `allowUnsandboxedCommands=false`.
3. Lägg `denyWrite` på samtliga kontrollplansvägar.
4. Ge inte arbetaren GitHub-token, Slack-webhook eller andra styrhemligheter.
5. Låt controllern ensam skriva status och attesteringar.

### B2 — `bash -c "$V"` gör verifieraren till kodinjektion

**Allvar:** kritisk

`slutvillkor` lagras som fri shelltext och körs med `bash -c`. Om task-specen kan påverkas, eller om quoting blir fel, är verifieringsfältet samtidigt ett fjärrkommando med controllerns rättigheter.

**Åtgärd:** använd ett immutable verifierregister. Tasken refererar ett `verifier_id`; registret innehåller en argv-lista som exekveras direkt utan shell.

```json
{
  "id": "test-formular",
  "argv": ["./verify/bin/test-formular"],
  "timeout_s": 600
}
```

Controller:

```python
subprocess.run(argv, shell=False, timeout=timeout_s, ...)
```

### B3 — Brytare 0 har ett stale-snapshot-fel

**Allvar:** hög

Koden beräknar `/tmp/klara-nu` före verifieringen. Om verifieringen underkänner en uppgift återställs `passes=false`, men den gamla listan kopieras ändå till `.loop/klara-ids`. När uppgiften senare blir `true` igen ser `comm` den inte som ny och hoppar över omverifieringen.

**Åtgärd:** ta bort hela `passes`-flippmönstret. Controller ska först verifiera kandidaten och därefter, atomiskt, skapa en godkänd attestation. Ingen agent ska kunna sätta `true` före verifiering.

### B4 — `passes=true` är inte bundet till en Git-SHA

**Allvar:** kritisk

En uppgift kan verifieras på commit A. Uppgift B kan sedan ändra samma kod och regressa A, medan A fortsätter stå som `passes=true`.

**Åtgärd:** attestera resultatet mot kandidatens SHA, verifierarens hash och policyhash. Senare commits gör berörda attesteringar `stale` och utlöser omtest. En full regression körs på exakt PR-head innan merge.

### B5 — `/goal` är en livenessmekanism, inte sanningskälla

**Allvar:** hög

`/goal` använder en separat snabb modell som dömer utifrån det som redan har surfacats i konversationen. Evaluatorn kan inte själv använda verktyg. Det är bättre än att byggaren ensam säger “klart”, men inte en deterministisk kontroll av repo, tester eller externa system.

**Åtgärd:**

- använd `/goal` frivilligt för att hålla en session levande,
- låt en extern controller äga taskval, testkörning, state och stopp,
- stoppa hela körningen endast när controllern hittar giltiga attesteringar för aktuell PR-head.

### B6 — Schemalagd återstart saknar exklusivt ägarskap

**Allvar:** hög

Desktop-schemalagda uppgifter startar färska sessioner oberoende av manuella sessioner. Prompten “om ingen session arbetar” är inte ett mutex. Två sessioner kan välja samma uppgift, skriva i samma checkout eller öppna konkurrerande PR:er.

**Åtgärd:** OS-nivå-lease med atomiskt förvärv, PID/host/boot-id, heartbeat och TTL. Schemaläggarens enda uppgift bör vara att köra `nortropic-loop resume`; kommandot avslutas ofarligt om en giltig lease redan finns.

### B7 — lokala Git-hooks är inte tillräcklig main-grind

**Allvar:** hög

En local pre-push-hook kan tas bort, kringgås eller utebli i en annan miljö. Filen påstår dessutom att branch protection för privata repon kräver en plan som gör den olämplig; GitHub dokumenterar att privata repon stöds med GitHub Pro, Team och Enterprise.

**Åtgärd:** serverbaserad branch protection:

- PR krävs före merge,
- statuskontroll från controller krävs,
- stale approvals avvisas efter ny push,
- conversation resolution krävs,
- force-push och delete avstängda,
- administratörsbypass avstängd när planen stöder det.

### B8 — sandboxen är fail-open om inget annat anges

**Allvar:** kritisk

Claude Code varnar och kör osandboxat om sandboxen inte kan starta, såvida inte `sandbox.failIfUnavailable=true`. Dessutom finns en avsiktlig escape hatch som måste stängas med `allowUnsandboxedCommands=false`.

**Åtgärd:** startpreflight ska avbryta körningen om sandbox, nätverksisolering eller filesystempolicy inte kan verifieras.

### B9 — säkerhetskritisk konfiguration ligger i samma repo som agenten arbetar i

**Allvar:** hög

`.claude/settings.json`, hooks, agentfiler och verifierare ligger i arbetsytan. Även om de skyddas med en hook blir säkerhetsargumentet cirkulärt: den mekanism som ska skydda policyn laddas från samma plats som den skyddar.

**Åtgärd:**

- lägg den auktoritativa controllern och dess säkerhetssettings i användar-/managed scope eller separat kontrollkatalog,
- hashverifiera repo-kopior vid start,
- behandla projektets `.claude/settings.json` som konfiguration, inte säkerhetsgräns,
- placera `strictAllowlist` i user/managed/CLI settings; inställningen ignoreras uttryckligen i projektets `.claude/settings.json`.

### B10 — externa slutvillkor är inte hermetiska

**Allvar:** hög

Exemplet med riktig Resend-leverans beror på nätverk, tredjepart, autentisering, rate limits och eventuell kostnad. En sådan task kan både flappa och orsaka oavsiktliga externa sidoeffekter.

**Åtgärd:** klassificera verifiering:

1. `hermetic` — lokala tester, alltid tillåtet i loop.
2. `local-integration` — lokala tjänster/testcontainers, tillåtet.
3. `external-staging` — separat gate med särskilda credentials, domänallowlist och retrybudget.
4. `production` — aldrig i autonom byggloop.

---

## 4. Faktagranskning av centrala påståenden

| Påstående i v3 | Bedömning 2026-07-31 | Rekommenderad ändring |
|---|---|---|
| Claude Code `>=2.1.170` räcker | Delvis sant för tidig Fable-support, men otillräckligt för nuvarande plan. | Pinna initialt exakt testad `2.1.220`; `strictAllowlist` kräver minst 2.1.219. Uppgradera endast via canary. |
| “Effort: max” i agenttexten konfigurerar effort | Fel. | Sätt `effort:` i YAML-frontmatter. Utelämnat värde ärver sessionens effort. |
| Utföraren har “default effort” | Odefinierat och riskerar att ärva high/max. | Sätt explicit `effort: medium` eller `high` efter benchmark. |
| Subagenter kringgår normalt förälderns settings-hooks | För generellt och inte förenligt med aktuell dokumentation. | Settings-hooks får agent-id/type i subagentanrop; frontmatter-hooks är extra. Behåll ett verifierande integrationstest men skriv inte arkitekturen runt ett antaget standardbypass. |
| `claude -p` debiteras separat från Max | Fel per den senast uppdaterade Help Center-notisen. Den planerade förändringen pausades; `claude -p` drar tills vidare från abonnemangets usage limits. | Headless kan användas för färska arbetarsessioner. Pinna observationen med datum och återkontrollera före drift eftersom policyn är föränderlig. |
| Fable kan användas fritt inom Max-kvoten | Ofullständigt. | Från 20 juli kan Max använda högst 50 % av veckogränsen på Fable; övriga modeller delar samma totala veckogräns. Pro använder usage credits för Fable. |
| Privat branch protection hoppas över eftersom det kräver olämplig betalplan | Fel för GitHub Pro/Team/Enterprise. | Använd branch protection om repon ligger på en sådan plan. |
| Desktop-task kan säkert starta om när ingen session arbetar | Fel som exklusivitetsmekanism. | Den startar färska, oberoende sessioner; använd lease. Den kräver också öppen app och vaken dator. |
| `/goal` är loopen och verifierar slutvillkoret | Endast delvis. | Den håller sessionen igång och använder en modelltevaluator utan verktyg. Controller är auktoritativ loop. |
| Fable ska vara förman/arkitekt/granskare som fast regel | Ej etablerat. | Opus 5 kom i Claude Code 2.1.219. Kör rollspecifika A/B-evals; gör modellrouting till konfiguration, inte konstitution. |
| GPT-5.6 Sol `ultra` är självklart bäst som domare | Inte självklart. | `ultra` koordinerar flera parallella agenter. För en oberoende, reproducerbar domare bör `max` vara utgångsläge; använd `ultra` för bred undersökning, inte automatiskt för binär sign-off. |
| Exakta 96 %/46 %, 92 %/63 %, 80 % completion m.fl. | Inte verifierade med en tydligt länkad primärkälla och reproducerbar metod i filen. | Ta bort ur normativa designbeslut eller länka exakt rapport, benchmarkversion, urval och kostnadsdefinition. |

### Viktig dokumentationskonflikt

Claude Codes headless-dokumentation återger fortfarande den planerade separata Agent SDK-krediten, medan den aktuella Help Center-artikeln har en överordnad uppdatering som säger att förändringen pausades. För kostnadsbeslut ska den daterade uppdateringen i Help Center behandlas som aktuell policy, och en preflight-/driftrutin ska återkontrollera den innan en lång körning.

---

## 5. Hotmodell för Nortropic-loopen

### 5.1 Det som skyddas

- kodbasens integritet,
- tester och verifieringspolicy,
- task-specen,
- huvudgrenen,
- credentials och kunddata,
- externa tjänster och kostnader,
- sanningen om vad som är verifierat,
- Johnnys uppmärksamhet och veckokvot.

### 5.2 Felaktören

Hotmodellen behöver inte anta en “ond modell”. Det räcker med en kapabel agent som:

- optimerar mot fel proxy,
- misstolkar en instruktion,
- utsätts för prompt injection i repo, issue, webbdata eller dependency output,
- fabricerar eller överdriver status,
- försöker vara hjälpsam utanför scope,
- fastnar och upprepar samma misslyckande.

### 5.3 Icke förhandlingsbara invariants

1. **Arbetaren kan skriva produktkod men inte task-spec, policy, verifierare, runtime-state eller attesteringar.**
2. **Controllern kan skriva state och GitHub-status men ändrar inte produktkod.**
3. **Verifiering körs från ett förgodkänt register utan fri shelltext.**
4. **Ett godkännande gäller en bestämd Git-SHA och policyhash.**
5. **Ingen nätverkscredential finns i arbetarens miljö.**
6. **Ingen session startar arbete utan exklusiv lease.**
7. **Ingen merge sker utan serverbaserad grind eller uttryckligt mänskligt beslut.**
8. **Om sandbox eller policy inte kan verifieras ska systemet stoppa, inte degradera.**

---

## 6. Ralph Wiggum-landskapet

### 6.1 Avgränsning

GitHubs topic `ralph-wiggum` visade 133 publika repos vid kontrollen. Den bredare `ralph`-sökningen är kraftigt brusig och innehåller många projekt som inte handlar om agentloopen. Jag har därför:

1. screenat topic-/söklandskapet,
2. grupperat implementationerna efter arkitekturfamilj,
3. djupgranskat representativa, aktiva eller inflytelserika repos på README- och kodnivå,
4. verifierat Claude Code-mekanik mot officiell dokumentation.

Detta är inte ett påstående om rad-för-rad-granskning av samtliga 133 repos. Det är en bred kartläggning och djupgranskning av de implementationer som tillför distinkta kontrollmönster.

### 6.2 Fem arkitekturfamiljer

#### A. Minimal prompt-/Bash-loop

Exempel: `snarktank/ralph`, `ghuntley/how-to-ralph-wiggum`, `Th0rgal/open-ralph-wiggum`.

**Styrka:** liten, begriplig, färsk kontext, en story per varv.  
**Svaghet:** samma agent kan ofta ändra PRD-status och avge completion-token; shellskalet litar på självrapport.

#### B. Fil- och Git-baserad färsk-session-loop

Exempel: `iannuttall/ralph`, `michaelshimeles/ralphy`.

**Styrka:** PRD/state/progress/loggar som minne, stale recovery, en uppgift per iteration.  
**Svaghet:** många varianter kör agentkommandon via `eval` och/eller farliga permission-bypasslägen.

#### C. Stateful controller med circuit breaker

Exempel: `frankbria/ralph-claude-code`, `umputun/ralphex`.

**Styrka:** CLOSED/HALF_OPEN/OPEN, cooldown, historik, rate-limit-hantering, statusvy och lås.  
**Svaghet:** vissa progressmått litar fortfarande på modellens completion-signal eller rapporterade filändringar i stället för verifierad stateövergång.

#### D. Agentramverk med separat completion callback

Exempel: `vercel-labs/ralph-loop-agent`.

**Styrka:** tydlig yttre loop, separat `verifyCompletion`, komponerbara stoppvillkor för iterationer/tokens/kostnad och feedback till nästa varv.  
**Svaghet:** verifieringscallbacken är bara så säker som den kod och de rättigheter som implementatören ger den; den är inte automatiskt en trust boundary.

#### E. Specdrivet/fullskaligt orkestreringslager

Exempel: `tzachbon/smart-ralph`, `mikeyobrien/ralph-orchestrator`, `askbudi/juno-code`.

**Styrka:** research→requirements→design→tasks, dependency graphs, explicit verifieringsuppgifter, events/backpressure, HIL och dashboards.  
**Svaghet:** stor kontrollplanskomplexitet och risk för “agentteater” innan de grundläggande gränserna är säkra.

---

## 7. Repo-för-repo: vad Nortropic bör låna

| Repo | Bra att porta | Ska inte kopieras blint |
|---|---|---|
| `anthropics/cwc-long-running-agents` | Default-FAIL, färsk read-only evaluator, handoff, kill-switch, `STEER.md`, browserverifiering. | Repons hooks är pedagogiska exempel och varnar själva för Bash-bypass. |
| `anthropics/claude-code` Ralph-plugin och `/goal` | Enkel liveness och exakt scope för en session. | Completion-promise/modelltevaluator är inte mekanisk sanning. |
| `ghuntley/how-to-ralph-wiggum` | Grundidén: upprepa, färsk kontext, eventual consistency. | “Dangerously skip permissions” får inte vara normal produktionstaktik. |
| `snarktank/ralph` | Högst prioriterade öppna story, en story per iteration, commit och append-only lärdomar. | Arbetaren ändrar själv `passes` och shellskalet litar på `<promise>COMPLETE</promise>`. |
| `iannuttall/ralph` | `open → in_progress → done`, `startedAt`, stale recovery, separata activity/error/run-loggar. | `eval` och farliga standardkommandon; status ska ägas av controller. |
| `frankbria/ralph-claude-code` | CLOSED/HALF_OPEN/OPEN, cooldown, breakerhistorik, rate/quota-hantering. | “Files changed” eller modellrapporterad COMPLETE är inte verklig progress; samma-fel behöver fingerprint. |
| `vercel-labs/ralph-loop-agent` | Extern `verifyCompletion`, budgetkomposition, feedbackinjektion, abort/resume. | Bind verifieringen till immutable policy och Git-SHA; fri callback är inte automatiskt säker. |
| `tzachbon/smart-ralph` | Triage, research, requirements, design, POC-first taskning, `[VERIFY]`, dependency/parallel-markörer och approvals. | Godkänd spec får inte muteras av exekveringsagenten. Fyra implementeringsfaser per liten task kan bli tungt. |
| `mikeyobrien/ralph-orchestrator` | Backpressure, eventmodell, persistent memory/tasks, workspace scope och Telegram-HIL. | Hats och multi-backend-control plane är för tungt som första Nortropic-version. |
| `umputun/ralphex` | Fil-/processlås, aktiv sessionsdetektion, explicit status och planexecution. | Inför endast de primitives som löser uppmätta fel; undvik att importera hela ramen. |
| `PageAI-Pro/ralph-loop` | Container-/Dockerisolering som starkare körgräns. | Docker är inte kompatibelt med Claude Codes inbyggda sandboxflöde utan särskild design; välj en tydlig isoleringsstrategi. |
| `askbudi/juno-code` | Kanban/status som mänsklig observability ovanpå en-task-loop. | UI får aldrig bli state authority; controllerns eventlogg ska vara sanningen. |

### Syntes: de sju Ralph-mönster som är värda att föra in

1. En task per färsk arbetskontext.
2. Immutable spec och append-only körhistorik.
3. Explicit claim/lease och stale recovery.
4. Extern, default-FAIL completion verifier.
5. CLOSED/HALF_OPEN/OPEN med cooldown och en probe.
6. Budgetar på iterationer, tid, tokens, diffstorlek och misslyckanden.
7. Kill-switch, steering och tydlig HIL-kanal.

---

## 8. Rekommenderad v4-arkitektur

### 8.1 Ta bort LLM-förmannen från rutinloopen

En deterministisk controller kan själv:

- välja högst prioriterade dependency-ready task,
- skapa worktree,
- starta en färsk executor,
- kontrollera diffscope,
- köra verifierare,
- spara evidence,
- uppdatera state,
- öppna PR och skicka notifiering.

LLM-förmannen tillför mest värde när riktningen är oklar, inte för att läsa nästa JSON-rad. Gör därför arkitekt/Fable till en eskalering, inte en permanent mellanhand.

### 8.2 Separera fyra lager

1. **Spec:** mänskligt godkänd och immutable under en run.
2. **Worker:** får endast ändra tillåtna produkt-/testvägar i eget worktree.
3. **Controller/verifier:** icke-LLM, äger state, verifiering, lease, evidence och GitHub-status.
4. **Reviewer/human:** bedömer semantik, design och irreversibla val efter mekaniska grindar.

### 8.3 Ersätt `passes` med state + attestation

Föreslagen state:

```text
pending → claimed → running → candidate → verifying → verified
                                      ↘ retryable_failure
                                      ↘ blocked
verified → stale   (om senare diff kan påverka resultatet)
```

En attestation bör minst innehålla:

```json
{
  "task_id": "u-014",
  "base_sha": "...",
  "candidate_sha": "...",
  "valid_through_sha": "...",
  "spec_sha256": "...",
  "verifier_id": "test-formular",
  "verifier_sha256": "...",
  "sandbox_policy_sha256": "...",
  "exit_code": 0,
  "started_at": "...",
  "finished_at": "...",
  "stdout_sha256": "...",
  "stderr_sha256": "...",
  "diff_sha256": "..."
}
```

### 8.4 Gör varje attempt transaktionell

1. Controller claimar tasken.
2. Ett isolerat worktree skapas från bestämd base-SHA.
3. Executor bygger och committar kandidat.
4. Controller avvisar förbjudna filer eller för stor diff.
5. Förgodkänd verifierare körs utan shell.
6. PASS skapar attestation; FAIL sparar evidence och klassas.
7. Godkänd commit förs till integrationsbranch; misslyckad worktree kasseras eller lämnas för felsökning.

### 8.5 Mekaniska kontroller först, LLM-domare sist

Ordning:

1. policy- och scopekontroll,
2. lint/typecheck/unit/integration/e2e,
3. berörda regressioner,
4. full suite på PR-head,
5. färsk read-only design-/säkerhetsgranskare,
6. extern modellfamilj vid §A/prelaunch,
7. människa vid divergens eller irreversibel påverkan.

---

## 9. Modell- och effortstrategi

### 9.1 Gör routing mätbar och konfigurerbar

Opus 5 tillkom 24 juli 2026 i Claude Code 2.1.219. Det gör v3:s fasta regel “Fable där omdöme avgör” för tidigt låst. Rekommenderad initial hypotes:

| Roll | Kandidatstandard | Eskalering |
|---|---|---|
| Controller | Python, ingen LLM | — |
| Executor | Sonnet 5, explicit `medium` eller `high` | Opus 5 vid två olika failure fingerprints |
| Arkitekt §B | Opus 5 `high`/`max` | Fable 5 `max` vid hög ångerbarhet/inlåsning |
| Arkitekt §A | Fable 5 `max` | människa + extern domare |
| Reviewer A | vinnaren i seeded-bug-eval mellan Opus 5 och Fable 5 | andra modellen vid låg confidence |
| Reviewer B | GPT-5.6 Sol `max` | `ultra` endast vid bred parallell undersökning |

### 9.2 Intern eval före permanent val

Bygg ett litet Nortropic-benchmark:

- 10 rutinimplementationer: verifierade tasks per veckokvot.
- 5 arkitekturval: blindad kvalitets-/ångerriskbedömning.
- 5 diffar med seedade buggar: precision, recall och allvarlighetskalibrering.
- 5 UI-uppgifter: funktionella assertions plus blindad visuell rubric.

Mät även medianvarv, tokens, väggtid, regressionsfrekvens och mänskliga ingripanden. Välj modell per roll från dessa resultat, inte från en generell publik benchmark.

---

## 10. Circuit breakers som bör finnas

| Brytare | Mekaniskt mått | Standardstart |
|---|---|---:|
| Max attempts/task | controllerförsök | 3 |
| No verified progress | inga nya giltiga attesteringar | 2–3 varv |
| Same failure | normaliserad fel-fingerprint | 2–3 |
| Diff explosion | filer/LOC utanför taskbudget | taskberoende |
| Wall clock | tid per attempt/run | taskberoende |
| Token/call budget | strukturerad usage från CLI | veckobudget |
| Permission/sandbox violation | OS-/hooklogg | 1 |
| Policy drift | hashändring | 1 |
| Lease loss | heartbeat/ägarskap | 1 |
| External dependency | upprepade 429/5xx/timeouts | separat cooldown |

**Progress ska aldrig definieras som “agenten skrev att den gjorde framsteg” eller enbart “filer ändrades”.** Progress är en verifierad stateövergång eller en ny, användbar felklassning som förändrar nästa strategi.

---

## 11. Observability och bevis

Skapa en append-only `events.jsonl` eller SQLite-eventtabell med minst:

- `run_started`, `lease_acquired`, `task_claimed`,
- `worker_started`, `worker_finished`,
- `candidate_created`, `scope_rejected`,
- `verification_started`, `verification_passed`, `verification_failed`,
- `attestation_invalidated`,
- `circuit_half_open`, `circuit_opened`,
- `quota_exhausted`, `restart_scheduled`,
- `pr_opened`, `review_diverged`, `human_gate_required`, `run_completed`.

Varje event bör ha `run_id`, `task_id`, `base_sha`, `candidate_sha`, modell, effort, duration, exit code och relevanta hashvärden.

Spara stdout/stderr i separata artefakter; kasta inte verifieraroutput med `/dev/null`.

---

## 12. Rekommenderad migrationsordning

### P0 — innan någon obevakad körning

1. Stoppa agentens rätt att ändra task-state, policy, verifierare och kontrollfiler via både built-in tools och Bash.
2. Ersätt `bash -c` med verifierregister + argv.
3. Introducera controllerägd state och SHA-bundna attesteringar.
4. Inför OS-lease.
5. Slå på fail-closed sandbox och stäng unsandboxed escape hatch.
6. Pinna och canarytesta Claude Code 2.1.220.
7. Aktivera GitHub branch protection där planen tillåter.

### P1 — innan nivå 2

1. Isolerat worktree per attempt.
2. Diffscope och LOC-budget.
3. Eventlogg och evidencepaket.
4. Circuit breaker med failure fingerprints.
5. STOP-/STEER-kontroll.
6. Full regression på PR-head.

### P2 — innan nivå 3

1. 20–25 tasks i intern modell-/efforteval.
2. Tre rena obevakade körningar med simulerade krascher, kvotstopp och dubbla schemaläggarstarter.
3. Secret-exfiltration- och prompt-injection-test.
4. Mobil PR-/Slack-flöde verifierat.
5. Runbook för blocked, quota exhausted, divergent review och rollback.

---

## 13. Go/no-go-kriterier för nivå 3

Nivå 3 får inte aktiveras förrän samtliga är sanna:

- [ ] Arbetaren kan inte skriva kontrollplansfiler via Write, Edit, Bash eller barnprocess.
- [ ] En manipulationsuppgift kan inte ändra verifieraren eller task-specen.
- [ ] Två samtidiga starter resulterar i exakt en leaseägare.
- [ ] En död controller kan återtas säkert efter TTL utan två ägare.
- [ ] En verifierad task blir stale när en senare relevant diff tillkommer.
- [ ] Full suite körs på exakt PR-head och statusen binds till samma SHA.
- [ ] Sandboxfrånvaro stoppar processen.
- [ ] Worker saknar GitHub-/Slack-/produktionscredentials.
- [ ] `STOP` avbryter före nästa verktygs-/taskstart.
- [ ] Tre identiska fel öppnar circuit; cooldown ger högst en probe.
- [ ] Quota exhaustion klassas separat från kodfel.
- [ ] PR kan inte mergas när statusen är saknad, stale eller fail.
- [ ] Restore/rollback har testats från en avsiktligt trasig kandidat.

---

## 14. Källor och vidare läsning

### Officiell Claude/Anthropic-dokumentation

- Claude Code `/goal`: https://code.claude.com/docs/en/goal
- Claude Code sandboxing: https://code.claude.com/docs/en/sandboxing
- Claude Code settings: https://code.claude.com/docs/en/settings
- Claude Code hooks: https://code.claude.com/docs/en/hooks
- Claude Code subagents: https://code.claude.com/docs/en/sub-agents
- Desktop scheduled tasks: https://code.claude.com/docs/en/desktop-scheduled-tasks
- Headless/Agent SDK CLI: https://code.claude.com/docs/en/headless
- Claude Code changelog: https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
- Agent SDK-planstatus, inklusive pausmeddelandet: https://support.claude.com/en/articles/15036540-use-the-claude-agent-sdk-with-your-claude-plan
- Fable 5 per plan: https://support.claude.com/en/articles/15424964-claude-fable-5-on-your-plan
- Harness primitives: https://github.com/anthropics/cwc-long-running-agents
- Effective harnesses for long-running agents: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- Harness design for long-running apps: https://www.anthropic.com/engineering/harness-design-long-running-apps

### GitHub

- Branch protection: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule
- Ralph Wiggum topic: https://github.com/topics/ralph-wiggum
- Användarens sökning: https://github.com/search?q=ralph&type=repositories&s=stars&o=desc

### Ralph-repos som djupgranskats eller screenats

- https://github.com/anthropics/cwc-long-running-agents
- https://github.com/ghuntley/how-to-ralph-wiggum
- https://github.com/snarktank/ralph
- https://github.com/iannuttall/ralph
- https://github.com/frankbria/ralph-claude-code
- https://github.com/vercel-labs/ralph-loop-agent
- https://github.com/tzachbon/smart-ralph
- https://github.com/mikeyobrien/ralph-orchestrator
- https://github.com/Th0rgal/open-ralph-wiggum
- https://github.com/PageAI-Pro/ralph-loop
- https://github.com/michaelshimeles/ralphy
- https://github.com/umputun/ralphex
- https://github.com/askbudi/juno-code

### Sekundär indexkälla

- Awesome Claude Ralph Wiggum: https://awesomeclaude.ai/ralph-wiggum

Den är användbar för upptäckt, men versionskrav, kostnadsregler och säkerhetsmekanik bör alltid verifieras mot officiell dokumentation och repo-kod.

### Oberoende domarbias

- Self-Preference Bias in Rubric-Based Evaluation: https://arxiv.org/abs/2604.06996
- Play Favorites? Self- and Family-Preference in LLM Evaluation: https://arxiv.org/abs/2508.06709

### OpenAI

- GPT-5.6 och skillnaden mellan `max` och multi-agentläget `ultra`: https://openai.com/index/gpt-5-6/

---

## 15. Slutrekommendation

Behåll v3:s mål, språk och gradvisa autonomitrappa. Byt däremot ut dess centrala exekveringsmodell:

> **Från:** en långlivad LLM-förman som delegerar, låter arbetaren markera `passes`, och använder Stop-hooken som controller.  
> **Till:** en liten deterministisk controller som startar en färsk worker per task, verifierar kandidat-SHA med immutable verktyg, sparar attesteringar och använder LLM:er endast där omdöme faktiskt behövs.

Det ger mindre agentkomplexitet, lägre kvotförbrukning, bättre återstart, verklig concurrencykontroll och en betydligt starkare säkerhetsmodell.
