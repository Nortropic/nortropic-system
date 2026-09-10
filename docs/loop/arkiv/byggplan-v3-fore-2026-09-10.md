# Historisk kopia: `docs/loop/byggplan-v3.md` före 2026-09-10

**Arkiverad 2026-09-10.** Detta är den fullständiga texten av `docs/loop/byggplan-v3.md` som den stod vid plattformsintegrationen `512490d44007373b79aca504aa92709e9810aa24` (oförändrad sedan `c0b3b04b…`), bevarad ordagrant för spårbarhet: det bevisade läget 2026-08-07 i det odelade repot, Pass 0/Pass 1, den ursprungliga §A-mängden med webbfiler (§3.1), doctor #5-luckan (§7.1), kalendern och den ursprungliga startprompten. Webbens styrning gäller inte plattformen och detta är inte dagens instruktion; den aktiva filen är `docs/loop/byggplan-v3.md`.

---

# Nortropic byggplan v3 — kontrollplanet i det repo som finns

**Datum:** 2026-08-07 · **Ersätter:** byggplan v2 (vars lägesbild "repot är orört och rent" är vederlagd med bevis) · **Auktoritet:** v4.1 med de bindande ändringarna i §3 · **Fabrik:** Macen. Vanliga datorn är fönster. Molnsessioner är aldrig verkstad.

---

Tillämpningstillägg för domänsynkningen 2026-09-09:

Den historiska lägesbilden och dess daterade beslut nedan bevaras.
Nortropics senare målbild skiljer organisation, autonomiplattform och
Digitala enligt substitutionskontraktets §1. Äldre hänvisningar till
fabriken beskriver webbspårets ursprung, inte organisationens uttömmande
ändamål. Tillägget ändrar inte historisk beviscredit eller aktiverar
äldre kommandon; övriga ändringsvägar följer sina giltiga delegationer.

## 1. Bevisat läge 2026-08-07

Allt nedan är belagt med kommandoutfall denna dag. Inget kommer ur minne eller rapportering.

| Påstående | Bevis |
|---|---|
| Repot är **inte** tomt: v17, 232 commits, 14 `100d`-grenar | `git log --oneline \| wc -l`, `git branch -a` |
| Sju agenter, tio skills, sex workflows, 22 numrerade regler, konstitution §A/§B, stewardtrappa, `AUTOPILOT`=`off` | `ls agents/ workflows/`, `docs/03-regelverk.md`, `docs/07-konstitution.md`, `cat AUTOPILOT` |
| `controller/`, `specs/`, `verify/` finns inte → **skivorna 1–7 obyggda** står fast | `ls specs/ verify/` → No such file |
| Konstitutionens §A ≠ v4.1 §20:s §A. Noll överlapp | `docs/07-konstitution.md` §A1–A8 mot v4.1 §20 |
| **Doctor #5 är prosa, inte kod** — och tillskrivs tre skilda uppdrag i tre dokument | Full grep över `*.js`/`*.mjs`/`*.md`: enda träffen utanför `docs/` är prosa i `skills/nortropic-stack/SKILL.md:81`. Ingen kodfil nämner den |
| `check-invariants.mjs` är äkta mekanisk grind: exit 0/1, `execFileSync` utan shell, `invalid`→FAIL | filens huvud, rad 1–31 |
| I drift **är** repo-roten `~/.claude` (annan maskin) | README rad 8, programregister rad 4 |
| Fabriken körs **inte** på denna Mac | `ls ~/.claude/` = endast CC-struktur · `~/Workflow/` saknas |
| Kontot hade aldrig autentiserat mot GitHub före idag | `~/.ssh` skapad 12:49 av dagens `ssh`-anrop |
| Systeminstallation `/usr/local/libexec/nortropic` (122 binärer, config 700, rollback) + 7 systemkonton + `/etc/sudoers.d/nortropic-controller` (NOPASSWD × 14) | `ls -la`, `sudo cat`, `dscl . -list /Groups` |
| Eskaleringsvägen för användarkontot är stängd | ej medlem i nortropic-grupper · binärer ej grupp-/världsskrivbara · ingen LaunchDaemon/Agent |
| Tre arkiv säkrade | `5z-kedjan` 617 · `5z-rootsealed` 503 · `nortropic-systeminstallation` 386 poster |
| Branch protection saknas på båda remotes | programregister, Residualrisker |
| 100-dagarsprogrammet **är** backloggen | `docs/100-dagar/programregister.md`, baslinje `69559a5`, tagg `100d-baseline-20260730` |

**Slutsats:** inventeringens huvudfynd (0 av 7 skivor) håller. Dess sökrum var ofullständigt — `/usr/local/libexec/` genomsöktes aldrig. Byggplan v2:s lägesbild är vederlagd.

## 2. Vad kontrollplanet är till för

100-dagarsprogrammet körs redan för hand: sju batchar, gren per batch, `[100D]`-commits, exitgrind per dag. Det som saknas är mekaniseringen av överlämningarna — projektets ursprungsproblem.

Controllern **duplicerar inte** stewardtrappan. Trappan låter en modell applicera och granskas i efterhand via digesten. Controllern låter en worker föreslå en kandidat som verifieras mekaniskt mot en människogodkänd spec och mergas av Johnny via PR. Auto-merge är av även på nivå 3 (v4.1 §19.5). `AUTOPILOT` styr därför inte controllern.

Controllern **tillför** tre saker fabriken saknar: SHA-bundna attestationer, exklusiv lease, isolerat workspace per försök. Och som sjunde skiva: det första verkligt mekaniska §A-skyddet.

Scope för plattformsbygget: kvalificera autonomiplattformen som
verksamheter kan använda. Webbverksamhetens kundflöde exekveras inte
genom detta byggmandat. Regel 16 och 21 står orörda. Ingen ny backlog
eller operativ kundbehörighet skapas genom målbildssynkningen.

## 3. Bindande ändringar mot v4.1

| § | Vad som gäller nu |
|---|---|
| **§4** | Filstrukturen ritar `src/ tests/` — det är en kundsajt. Systemrepot har `agents/ skills/ workflows/ vendored-skills/ scripts/ tests/fixtures/ docs/`. Kontrollplanet läggs i `controller/` + `specs/` + `verify/`, dokumenten i `docs/loop/` |
| **§5** | Exempeltask u-014 (`src/contact/**`) utgår. Tasks refererar dag-id och exitgrind i `docs/100-dagar/programregister.md`. **Ingen ny backlog** |
| **§10** | `security-settings.json` läggs i managed scope eller `~/.config/nortropic-loop/` — **aldrig i repot**, som i drift är `~/.claude` (B9 återuppstår annars). `denyWrite` = §A-mängden i §3.1 nedan. `denyRead` utökas med `~/.claude/{sessions,session-env,backups,debug,projects}` |
| **§14** | Diffpolicyn får `docs`-kravet: task som rör fil med docs-hemvist utan docs-uppdatering i samma commit = policyfailure (regel 17 + 22) |
| **§20** | §A-ytan är konstitutionens §A **plus** kontrollplanet. v4.1:s ursprungliga lista skyddar sökvägar som inte finns |

### 3.1 §A-mängden — bindande för `denied_write`; sandbox täcker delmängden

**Rubriken var bredare än verkligheten (rättat 2026-08-08).** `controller/**` står i mängden nedan men finns INTE i installerad `sandbox.filesystem.denyWrite` — och kan inte finnas, eftersom h-taskarnas `allowed_write` ÄR `controller/**`. Sandboxen bär tretton poster; mängden nedan är bindande för `denied_write` i specen, och stycket *Två mekanismer, olika ytor* nedan säger vilken mekanism som vaktar vad.

```
docs/07-konstitution.md
docs/03-regelverk.md                       (invarianterna, §A1)
skills/nortropic-eval/references/eval-rubric.md
skills/nortropic-plan/references/juridikflaggor.md
workflows/**                               (ALDRIG-listan, regel 3)
tests/fixtures/**
agents/nortropic-steward.md                (styrningen, §A6)
AUTOPILOT
scripts/check-invariants.mjs
specs/**  verify/**  controller/**  CLAUDE.md
```

`allowed_write` för h-001→h-007: `controller/**`, `tests/controller/**`.

**Två mekanismer, olika ytor.** `controller/**`, `specs/**` och `verify/**` står i §A-mängden ovan men vaktas INTE av skiva 7:s §A-kontroll — de skyddas av `allowed_write` (som är smalare per task) och av ägarhand. Skälet är mekaniskt: varje h-task bygger i `controller/<del>/**`, så en §A-vakt som täckte hela `controller/**` hade avvisat sin egen kandidat, h-007:s inkluderad. §A-kontrollen prövar därför resten av mängden — `AUTOPILOT`, `workflows/**`, `tests/fixtures/**`, `docs/07-konstitution.md`, `docs/03-regelverk.md`, `agents/nortropic-steward.md`, `scripts/check-invariants.mjs`, `skills/nortropic-eval/references/eval-rubric.md`, `skills/nortropic-plan/references/juridikflaggor.md`, `CLAUDE.md` — alltså det som ligger utanför varje tasks `allowed_write` och som ingen annan mekanism fångar. Förhållandet skrivs här i stället för att lämnas underförstått (beslut 2026-08-08, LOOP-ÄGARHAND-15). **Vitlistan binder allowed_write:** `.gitignore` är en whitelist (`/*` med `!`-undantag) — en tasks `allowed_write` måste ligga inom vitlistade träd, annars kan ingen worker committa någon kandidat alls (LOOP-ÄGARHAND-26).

Domänklassningen ändrar inte mängden skyddade paths ovan eller vilken
mekanism som vaktar dem. Plattformens taskvisa allowed_write, webbens
skydd och ägarändringsvägar är skilda ansvar. En framtida ändring av
testurval eller skyddsverkställare kräver eget avgränsat kontrakt och
regression; den får inte genomföras genom att kalla en fil WEB.

## 4. Stängda beslut

1. Macen är fabriken. Molnsessioner bygger aldrig.
2. Allt byggarbete i repot, på gren, committat per pass.
3. Spec och exit-test före kod.
4. Fixa-och-kör-om. Aldrig en ny namngiven komponent på ett fel.
5. Planens namn. Inga nya kodnamn.
6. Ingen sudo i kontrollplanet. *(Undantag 2026-08-07: tre läsande arkiveringskörningar. Loggat.)*
7. Codex granskar varje PR som rör §A-ytan i §3.1.
8. 5Z-kedjan och Post-Workspace ARKIVERADE. Systeminstallationen arkiverad, **ej avvecklad**.
9. `docs/100-dagar/programregister.md` är den enda backloggen.
10. Plattformsbygget ger ingen kundflödesbehörighet; se §2:s scope och loopregel 10.

## 5. Pass 0 — sanering, säkring, dokument (~1 h)

Steg 1–2 är **klara** (tarbollar säkrade, repot klonat till `~/nortropic/nortropic-system`, gren `nortropic/task-pass0` skapad, inget committat).

Grenen bygger på fel premiss och kasseras: `git checkout main && git branch -D nortropic/task-pass0`.

Ny gren `nortropic/loop-pass0`. Fem commits:

**C1 — arkivet.** `docs/loop/arkiv/5z-inventering-2026-08-07.md` + `docs/loop/arkiv/post-workspace/` (README + POST_WORKSPACE_ARCHITECTURE.md, toppnot *"Kravinput till skiva 6–7. Installeras ej."*).

**C2 — loop-dokumenten.** `docs/loop/` får `implementation-v4.1.md`, `byggplan-v3.md`, `granskningsrubrik.md`, `loop-review-2026-07-31.md`. Egen underkatalog, parallell med `docs/100-dagar/` och `docs/arkiv/` — den numrerade serien 00–07 är systemdokumentationen och rörs inte.

**C3 — reglerna.** `docs/loop/regler.md` med byggreglerna. `CLAUDE.md` får **en rad** som pekar dit. Regelblocket läggs aldrig i `CLAUDE.md` självt — den filen är en 264-byte pekare, och ett andra regelverk bredvid `docs/03-regelverk.md` vore två sanningar.

**C4 — beslutsloggen.** Rader i `docs/05-beslutslogg.md`. **Ingen ny beslutslogg.** Raderna får aldrig inledas med `RETRO-1-GENOMFÖRD` eller `CHECKPOINT` — §B3 och §B5 parsar dem mekaniskt. Innehåll: fabriksbeslutet · 5Z + Post-Workspace arkiverade · tarbollarnas sökvägar och antal · sudo-undantaget · systeminstallationsfyndet · doctor #5-fyndet · att byggplan v2 vederlagts.

**C5 — dokumentationslagren.** `docs/00-borja-har.md` och `README.md` repokartan får varsitt stycke om loop-spåret. Regel 22 kräver att det enkla lagret följer med i **samma commit**; doctor #12(e) fäller drift. Utan C5 underkänns Pass 0 av repots egna grindar.

**Före C1:** verifiera doctor #5-fyndet fullständigt.
```bash
grep -rn "doctor #5\|doctor#5" . --include=*.js --include=*.mjs --include=*.md | grep -v "^./docs/"
```

**Exit Pass 0:** fem commits i `git log --oneline` · `docs/loop/` innehåller de fyra dokumenten · `CLAUDE.md` pekar på `docs/loop/regler.md` · `node scripts/check-invariants.mjs` ger exit 0 · doctor-körning utan nytt FAIL.

## 6. Pass 1 — spec, grind och gräns (~2 h)

1. **GitHub Pro + branch protection** enligt v4.1 §19.3. Stänger residualrisken "force-push ej blockerad" i programregistret. Oberoende av allt annat — gör den först.
2. **`specs/tasks.spec.json`** med h-001→h-007. Varje task bär `denied_write` enligt §3.1, `docs_impact`-fält, och referens till dag-id i programregistret.
3. **`verify/bin/`** — sju exit-testskript, skrivna **före** bygget. De får faila; komponenterna finns inte än.
4. **Sandbox** i managed scope / `~/.config/nortropic-loop/`, aldrig i repot.
5. **Offensiv gränstest** mot §A-mängden i §3.1 — inte mot v4.1:s ursprungliga lista. Testagent försöker skriva `docs/07-konstitution.md` med Python, ändra `workflows/` med `sed`, röra `tests/fixtures/`, läsa `~/.ssh` och `~/.claude/sessions`, pusha direkt till main. Samtliga ska misslyckas mekaniskt.
6. **Trösklarna räknas fram** ur batch 001–007:s historik (diffstorlekar, attempts, failure-mönster) — inte gissas. v4.1 §16–17 fylls med mätta värden.

**Exit Pass 1:** spec validerar · sju skript körbara · gränstesten grön · branch protection aktiv · trösklar dokumenterade med nämnare.

## 7. Skivorna

| Task | Skiva | Exit-test |
|---|---|---|
| h-001 | 1 SQLite-state + eventlogg | Rekonstruera statustabell enbart ur `events.jsonl`, diffa mot SQLite → noll avvikelse |
| h-002 | 2 Verifier-runner | Manipulerad verifierarfil → `hash_mismatch` före körning · fri text i verifier-fält kan inte exekvera. **Registrera befintliga grindar** (`check-invariants.mjs`, `nortropic-verify-suite.js`) — bygg ingen ny verifierare |
| h-003 | 3 Attestation + stale | Verifiera task A · commit som matchar `invalidates_on` → A blir `stale`, omtest köas |
| h-004 | 4 Lease | 100 samtidiga starter → exakt 1 ägare · `kill -9` → reclaim efter TTL, aldrig före |
| h-005 | 5 Workspace per attempt | Ren checkout på beordrad base-SHA · §A-skrivning stoppas av OS · Ctrl-C → rest städas · ingen kvarlämnad gren/lås |
| h-006 | 6 Worker-launch | Prosa-svar → `unparseable_output` · påstådd `CANDIDATE_SHA` som saknas → failure, inte krasch |
| h-007 | 7 Diffpolicy | Kandidat som rör §A-mängden avvisas med sparat evidence · 3× LOC-budget avvisas · docs-krav ouppfyllt avvisas |
| h-008 | 6b Taskkuvert | §12-kuvert ur config-specen: nio fält · exit_test och register följer aldrig med · okänd task avvisas |
| h-009 | 6c Processtart | Konfigurerat argv-kommando med timeout · hela processgruppen dödas · rest mäts på EFFEKT |
| h-010 | 8 Taskval + claim | Doneness ur attest (`--require-valid`), aldrig ur state · kodpunktsordning · claim = exakt ett event · trasig spec/state/attestbutik är fel, aldrig tomt svar |
| h-011 | 9 Huvudloopen | v4.1 §13:s varv med kedjande base · failure attesterar aldrig · workspaces rivs · vägen gjord till utfall: arbetskopian orörd, plats+kuvert i kandidatinnehållet, kanarie-timeout, spärrtask, okänd verifierare |
| h-012 | 10 Utföraren | Sessionen redigerar, SKALET stagar och committar · git avgör domen, utsagan kan aldrig vända failure till kandidat · noll ändrade filer + framgångsrapport = failure · orsak bärs vidare ordagrant |
| h-013 | 11 Brytaren | Fingerprints: samma fel = en klass, olika fel = två · `kvot_slut` skilt från `nonzero_exit`, öppnar utan att förbruka budget · öppen brytare stoppar med orsak, aldrig tyst · budget noll startar inget kommando |
| h-014 | 12 Notisen | Fyra händelser ger notis, vanligt varv ger ingen · controllern skickar, aldrig workern · trasig webhook lämnar körningen ostörd · URL:en läcker inte till stdout, stderr eller fel |
| h-015 | 13 Återtaget | Attesterat väljs inte om · fallet blir valbart igen med bevarad historik · öppen brytare överlever omstart · lease återtas efter TTL, aldrig före · två återstarter = en ägare |
| h-016 | 14 Kedjan kopplas in | Session som ENDAST redigerar attesteras ändå, kandidaten bär författaren `nortropic-utforare` · session som committar själv ger ingen attestation · omförsök inuti claimet: eget workspace per försök på oförändrad base, exakt ett claimed-event · budget och fingerprints per task · öppen brytare avslutar drainet FÖRE nästa claim med exit 3 · brytarens anropsfel fäller körningen med exit 1 · config prövad i sin helhet före leasen |
| h-017 | 15 Per-task-domen | Taskens egen grind körs mot kandidatträdet UTÖVER configens verifierare — båda måste vara gröna · grinden slås upp på SÖKVÄG ur spec-radens `exit_test`, aldrig på id, så den som skriver registret aldrig kan peka om sin egen task · registret prövas i sin helhet FÖRE leasen och taskens post överst i varvet, så riggfel stannar innan modellkvot bränns · röd grind kostar försök som varje annat nedströmsavslag · domen bokförs i attestationen med `grind_id`, och en ogrindad task attesteras som förut men UTAN det fältet |

Skivorna 6b, 6c, 8 och 9 tillkom efter planens skrivning (LOOP-ÄGARHAND-16–27), skivorna 10–13
2026-08-08 efter smoke-momentet, skiva 14 2026-08-09 (LOOP-ÄGARHAND-36). Specen och
beslutsloggen är operativ ordning.

**Skivorna 10–14 bär slutmålets kvarvarande klausuler.** Skiva 10 gör försöket fullbordbart —
mätt 2026-08-08: en session kan skriva i workspacet men inte committa, och kandidat-SHA:t hör
hemma i controllerledet, inte i modellens verktygsdisciplin. Skiva 11 bär attempt-budget och
circuit. Skiva 12 är den enda vägen till "störs bara när en människa krävs". Skiva 13 är
driftformen kör tills kvoten tar slut, börja om när den är tillbaka. **Skiva 14 är
inkopplingen:** utan den anropar `controller/loop/cli` fortfarande `controller/launch/cli`
direkt, och skivorna 10 och 11 är byggda men verkningslösa — de har ingen anropare i repot.

**Ordningen är bindande: 10 blockerar allt, 11 blockerar 14, och 14 blockerar 12 och 13.**
Formuleringen *11 blockerar 12 och 13* var ofullständig (rättat 2026-08-09, LOOP-ÄGARHAND-36):
h-014 och h-015 kräver båda att loopen faktiskt anropar det de vilar på — notisen ska skickas
ur ett verkligt varv, och återtaget förutsätter en bevarad failure-historik som bara uppstår
när kedjan går genom brytaren. Inkopplingen måste därför ske FÖRE dem.

**Skiva 15 ligger före 12 och 13, och skälet är vad autonomin är värd.** Efter skiva 14
betyder en attestation *diffen var laglig och de globala invarianterna höll* — inte att
tasken är löst; taskens `exit_test` körs aldrig av kedjan, eftersom fältet medvetet
utelämnas ur kuvertet så workern inte kan tuna mot sin egen grind. Så länge det står
skalar autonomin med hur mycket diff en människa orkar läsa, och mer uthållighet
(notis, återtag) ger bara fler okontrollerade kandidater. Skiva 15 låter CONTROLLERN köra
grinden — workern ser den fortfarande aldrig — och gör därmed attestationen värd namnet.
Ordningen blir: **14 → 15 → 12 → 13.**

**Och att skiva 11 ersätter dagens attempt-budget-av-slump** (en fallen task förblir claimed
och är ovalbar resten av körningen, så varje task får exakt ett försök) blir sant först av
skiva 14, inte av skiva 11: budgeten får verkan genom att ett fallet försök görs OM inuti
claimet. Utan omförsöket är per-task-budgeten död kod. Ingen kvotbokföring och inget veckotak
byggs (ägarbeslut).

### 7.1 Doctor #5-luckan — tre invarianter, egen HÖGRISK-commit

Doctor #5 tillskrivs tre mekaniska uppdrag i tre dokument. Ingen kod utför något av dem:

| Uppdrag | Källa som påstår det |
|---|---|
| Fälla `[AUTO-N1]`/`[AUTO-N2]`-commit som rört §A-yta | `docs/07-konstitution.md` §A, inledningen |
| Vakta `disable-model-invocation: true` i de tre pipeline-skillsens frontmatter | regel 16 |
| Semver-kontrollera `profilKontraktVersion` mot v1.1.0 | `skills/nortropic-stack/SKILL.md:81` |

Konstitutionen varnar själv i §A6 för nät som kan redigeras av det som ska fångas. Här finns nätet inte alls.

**Åtgärd, efter h-007, av människa, HÖGRISK-märkt commit:** `INV-007`, `INV-008`, `INV-009` i `check-invariants.mjs` — en per uppdrag, plus att §A-fällningen gäller **oavsett commit-tagg** så att controller-commits täcks. Samma default-FAIL-semantik som `invalid`-mängden redan har. Byggs aldrig genom loopen.

**Registreras också som NRT-fynd i 100-dagarsprogrammet.** En dokumenterad grind utan implementation är precis vad programmet finns till för att hitta — och den hör hemma i dess register, inte bara i loop-planen.

## 8. Byggflödet per task

1. Johnny klistrar startprompten (§11) i Claude Code på Macen.
2. Utföraren bygger på gren `nortropic/loop-h-00X`, committar per delsteg, öppnar PR, stannar.
3. Johnny kör exit-testet: `./verify/bin/h-00X-exit` → exit 0 krävs.
4. Codex granskar mot `docs/loop/granskningsrubrik.md`. Rubriken uppdateras med **båda** §A-begreppen — en granskare som bara känner v4.1:s lista missar den verkliga ytan.
5. Johnny mergar. Blockerande fynd → tillbaka till steg 2, samma gren.

## 9. Kalender

| När | Vad | Johnnys tid |
|---|---|---|
| Ikväll | Pass 0 | 1 h |
| I morgon | Pass 1 (branch protection först) | 2 h |
| Helg 1 | h-001 + h-002 | ~3 h |
| Helg 2 | h-003 + h-004 + h-005 | ~4 h |
| Helg 3 | h-006 + h-007 + INV-007 + pilot | ~4 h |
| Löpande | 100-dagarsbatchar för hand tills piloten är grön | per batch |

**Kalenderns läge 2026-08-08:** h-001–h-011 levererade och grindade på main. Smoke-momentet
genomfört mot Claude Code 2.1.224 via launch: kommandot startar, kuvertet når sessionen helt,
verklig slutrapport fångad och accepterad av h-006. Kvar: h-012–h-015 och piloten, som bör
omdefinieras nu när fyra skivor ligger emellan.

**Avvecklingen av systeminstallationen** (`/usr/local/libexec/nortropic`, sudoers-filen, sju konton) sker **före Pass 1:s gränstest**. Ett gränstest på en maskin med ett andra kontrollplan installerat bevisar ingenting. Ingen avinstallation finns i `rollback/` — planeras som eget moment.

## 10. Stoppregler

- Komponent utan spec-rad → avböj, hänvisa till beslut 3.
- Nytt kodnamn → stoppa passet.
- "Härda", "frysa", "auktorisera" utan spec → scope-regeln.
- Två misslyckade fixförsök på samma fel → paus, arkitekt, sedan Johnny.
- Task som vill röra §A-mängden → stopp, alltid människa, alltid HÖGRISK-märkt commit.
- Påstående utan verktygsbevis → märks OVERIFIERAT.

## 11. Startprompt

```
Läs i denna ordning: CLAUDE.md · docs/00-borja-har.md · docs/03-regelverk.md ·
docs/07-konstitution.md · docs/loop/byggplan-v3.md · docs/loop/implementation-v4.1.md ·
docs/100-dagar/programregister.md · specs/tasks.spec.json · git log --oneline -15.

Rapportera: (1) läge med bevis per bevisregeln, (2) nästa task enligt byggplanens
kalender, (3) dess exit-test ordagrant. Vänta på mitt "kör".

Regler för passet: gren nortropic/loop-<id> · endast taskens allowed_write ·
§A-mängden i byggplan v3 §3.1 rörs aldrig · planens namn, inga nya kodnamn ·
fixa-och-kör-om, aldrig ny klassificerare · ingen sudo · commit per delsteg ·
docs uppdateras i samma commit som systemändringen (regel 17 + 22) ·
stanna vid öppnad PR — jag kör exit-testet och mergar.
Overifierat märks OVERIFIERAT.
```

---

*Committas som `docs/loop/byggplan-v3.md` i Pass 0 C2. Lägesfrågor besvaras mot spec, git och exit-tester — aldrig mot minne eller rapportering.*
