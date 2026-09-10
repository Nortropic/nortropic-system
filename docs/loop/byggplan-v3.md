# Nortropic byggplan v3 — kontrollplanet i det repo som finns

**Datum:** 2026-08-07 · **Ersätter:** byggplan v2 (vars lägesbild "repot är orört och rent" är vederlagd med bevis) · **Auktoritet:** v4.1 med de bindande ändringarna i §3 · **Fabrik:** Macen. Vanliga datorn är fönster. Molnsessioner är aldrig verkstad.

**Plattformsversion 2026-09-10.** Webbförvaltningens styrning, som den ursprungliga texten
byggde på, gäller inte plattformen. Den fullständiga ursprungstexten — det bevisade läget
2026-08-07 i det odelade repot, Pass 0/Pass 1, den ursprungliga §A-mängden med webbfiler,
doctor #5-luckan, kalendern och den ursprungliga startprompten — är bevarad ordagrant som
historia i Git-historiken (`dae90c8f:docs/loop/byggplan-v3.md`) och i webbrepot med proveniens.
Nedan står plattformsdelen.
Historiska beslut behåller sina datum; gamla resultat behåller sina ursprungliga subjekt.

---

Tillämpningstillägg för domänsynkningen 2026-09-09:

Den historiska lägesbilden och dess daterade beslut bevaras (arkivkopian).
Nortropics senare målbild skiljer organisation, autonomiplattform och
Digitala enligt substitutionskontraktets §1. Äldre hänvisningar till
fabriken beskriver webbspårets ursprung, inte organisationens uttömmande
ändamål. Tillägget ändrar inte historisk beviscredit eller aktiverar
äldre kommandon; övriga ändringsvägar följer sina giltiga delegationer.

## 1. Läge

Det bevisade läget 2026-08-07 (repots innehåll före uppdelningen, systeminstallationen,
arkiven) står i arkivkopian. Kvarstående plattformsfakta:

| Påstående | Bevis |
|---|---|
| `check-invariants.mjs` är äkta mekanisk grind: exit 0/1, `execFileSync` utan shell, `invalid`→FAIL | filens huvud |
| Kontrollplanet ligger i `controller/` + `specs/` + `verify/`, dokumenten i `docs/loop/` | `ls controller/ specs/ verify/ docs/loop/` |
| Skivorna i §7 (h-001–h-017) är specade; h-014/h-015 är obyggda (grind saknas på disk) | `specs/tasks.spec.json`, `ls verify/bin/` |

## 2. Vad kontrollplanet är till för

Controllern låter en worker föreslå en kandidat som verifieras mekaniskt mot en fryst spec
och en fryst grind. Den tillför: SHA-bundna attestationer, exklusiv lease, isolerat
workspace per försök — och som sjunde skiva det mekaniska skyddet av den skyddade mängden
(§3.1).

Scope för plattformsbygget: kvalificera autonomiplattformen som
verksamheter kan använda. Webbverksamhetens kundflöde exekveras inte
genom detta byggmandat. Regel 16 och 21 står orörda. Ingen ny backlog
eller operativ kundbehörighet skapas genom målbildssynkningen.

## 3. Bindande ändringar mot v4.1

| § | Vad som gäller nu |
|---|---|
| **§4** | Kontrollplanet läggs i `controller/` + `specs/` + `verify/`, dokumenten i `docs/loop/` |
| **§5** | Exempeltask u-014 (`src/contact/**`) utgår. Tasks och skivordning står i `specs/tasks.spec.json` och §7 nedan. **Ingen ny backlog** |
| **§10** | `security-settings.json` läggs i managed scope eller `~/.config/nortropic-loop/` — **aldrig i repot**. `denyWrite` täcker den delmängd av §3.1 sandboxen kan täcka; `denyRead` utökas med `~/.claude/{sessions,session-env,backups,debug,projects}` |
| **§14** | Diffpolicyn får `docs`-kravet: task som rör fil med docs-hemvist utan docs-uppdatering i samma commit = policyfailure (regel 17 + 22) |
| **§20** | §A-ytan är plattformens skyddade mängd i §3.1. v4.1:s ursprungliga lista skyddar sökvägar som inte finns |

### 3.1 Den skyddade mängden (§A) — bindande för `defaults.denied_write`; sandbox täcker delmängden

```
verify/**                          (frysta grindar och artefaktpaket)
specs/**                           (specen och authority-registret)
controller/verify/register.json    (verifierarregistret)
scripts/check-invariants.mjs       (registrerad plattformsverifierare)
.gitignore                         (vitlistan; binder allowed_write, LOOP-ÄGARHAND-26)
CLAUDE.md                          (pekaren)
```

Mängden ÄR specens `defaults.denied_write`. `controller/policy/cli` läser den därifrån —
ingen egen lista, ingen subtraktion — och avvisar varje kandidat som rör den med exit 3,
före alla lindrigare avslag och oavsett vilken task som föreslår kandidaten. Skrivning
utanför taskens `allowed_write` avvisas därefter med exit 4.

**Två mekanismer, olika ytor.** `controller/**` står inte i mängden: varje h-task bygger i
`controller/<del>/**`, så en vakt som täckte hela `controller/**` hade avvisat sin egen
kandidat. `controller/**` skyddas av taskens `allowed_write` (smalare per task). Sandboxen
täcker den delmängd den kan; policyn täcker hela mängden. Ändringar i mängden — nya
frysta grindar, specrader, registerposter, pinnar — går genom kontraktsflödet (regel 11),
aldrig genom en loop-tasks kandidat. Historiska tasks vars `allowed_write` rör mängden
(h-002, h-037) kan inte längre passera policyn för sådana skrivningar; deras resultat
behåller sina historiska subjekt. **Vitlistan binder allowed_write:** `.gitignore` är en
whitelist (`/*` med `!`-undantag) — en tasks `allowed_write` måste ligga inom vitlistade
träd, annars kan ingen worker committa någon kandidat alls (LOOP-ÄGARHAND-26).

Domänklassningen ändrar inte mängden skyddade paths ovan eller vilken
mekanism som vaktar dem. En framtida ändring av testurval eller
skyddsverkställare kräver eget avgränsat kontrakt och regression; den får
inte genomföras genom att kalla en fil WEB.

## 4. Stängda beslut

1. Macen är fabriken. Molnsessioner bygger aldrig.
2. Allt byggarbete i repot, på gren, committat per pass.
3. Spec och exit-test före kod.
4. Fixa-och-kör-om. Aldrig en ny namngiven komponent på ett fel.
5. Planens namn. Inga nya kodnamn.
6. Ingen sudo i kontrollplanet. *(Undantag 2026-08-07: tre läsande arkiveringskörningar. Loggat i arkivkopian.)*
7. Varje kandidat som rör den skyddade mängden i §3.1 avvisas av policyn; ändringar där går genom kontraktsflödet med oberoende granskning.
8. 5Z-kedjan och Post-Workspace ARKIVERADE. Systeminstallationen arkiverad, **ej avvecklad** (arkivkopian).
9. Backloggen är specens rader och skivordningen i §7. Ingen andra uppgiftslista.
10. Plattformsbygget ger ingen kundflödesbehörighet; se §2:s scope och loopregel 10.

## 5–6. Pass 0 och Pass 1 (historik)

Genomförda 2026-08-07/08 i det odelade repot; stegen och exitkriterierna står i arkivkopian.
Det som består på plattformen: `docs/loop/` med plan, regler, arkitektur och arkiv;
`specs/tasks.spec.json`; `verify/bin/` med frysta exit-test skrivna före bygget; sandbox i
managed scope, aldrig i repot; trösklar räknade ur mätt historik (specens `note_on_limits`).

## 7. Skivorna

| Task | Skiva | Exit-test |
|---|---|---|
| h-001 | 1 SQLite-state + eventlogg | Rekonstruera statustabell enbart ur `events.jsonl`, diffa mot SQLite → noll avvikelse |
| h-002 | 2 Verifier-runner | Manipulerad verifierarfil → `hash_mismatch` före körning · fri text i verifier-fält kan inte exekvera. **Registrera befintliga grindar** (`check-invariants.mjs`; webbens grind registreras sedan 2026-09-10 i webbrepot) — bygg ingen ny verifierare |
| h-003 | 3 Attestation + stale | Verifiera task A · commit som matchar `invalidates_on` → A blir `stale`, omtest köas |
| h-004 | 4 Lease | 100 samtidiga starter → exakt 1 ägare · `kill -9` → reclaim efter TTL, aldrig före |
| h-005 | 5 Workspace per attempt | Ren checkout på beordrad base-SHA · skrivning i den skyddade mängden stoppas av OS · Ctrl-C → rest städas · ingen kvarlämnad gren/lås |
| h-006 | 6 Worker-launch | Prosa-svar → `unparseable_output` · påstådd `CANDIDATE_SHA` som saknas → failure, inte krasch |
| h-007 | 7 Diffpolicy | Kandidat som rör den skyddade mängden avvisas med sparat evidence · 3× LOC-budget avvisas · docs-krav ouppfyllt avvisas |
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
2026-08-08 efter smoke-momentet, skiva 14 2026-08-09 (LOOP-ÄGARHAND-36). Specen är operativ
ordning.

**Skivorna 10–14 bär slutmålets kvarvarande klausuler.** Skiva 10 gör försöket fullbordbart —
mätt 2026-08-08: en session kan skriva i workspacet men inte committa, och kandidat-SHA:t hör
hemma i controllerledet, inte i modellens verktygsdisciplin. Skiva 11 bär attempt-budget och
circuit. Skiva 12 är den enda vägen till "störs bara när ett yttre hinder kräver det". Skiva 13
är driftformen kör tills kvoten tar slut, börja om när den är tillbaka. **Skiva 14 är
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
skalar autonomin med hur mycket diff en granskare orkar läsa, och mer uthållighet
(notis, återtag) ger bara fler okontrollerade kandidater. Skiva 15 låter CONTROLLERN köra
grinden — workern ser den fortfarande aldrig — och gör därmed attestationen värd namnet.
Ordningen blir: **14 → 15 → 12 → 13.**

**Och att skiva 11 ersätter dagens attempt-budget-av-slump** (en fallen task förblir claimed
och är ovalbar resten av körningen, så varje task får exakt ett försök) blir sant först av
skiva 14, inte av skiva 11: budgeten får verkan genom att ett fallet försök görs OM inuti
claimet. Utan omförsöket är per-task-budgeten död kod. Ingen kvotbokföring och inget veckotak
byggs (ägarbeslut).

### 7.1 Doctor #5-luckan (historik)

Luckan gällde webbens invarianter (INV-007–009) och följer webbrepot; posten m-001 som bar den
i specen är borttagen 2026-09-10 (fältens dåvarande lydelse: `dae90c8f:specs/tasks.spec.json`;
överförd till webbrepot med proveniens).
Plattformens invarianter är PINV-001–006 i `scripts/check-invariants.mjs`.

## 8. Byggflödet per task

1. **test-author** fryser specrad, fryst grind (RED före implementation) och
   utvecklingsdokument; en oberoende **kontraktsgranskning** (read-only) försöker falsifiera
   grinden.
2. **builder** bygger på gren `nortropic/loop-h-00X` inom taskens `allowed_write`, committar
   per delsteg och stannar före push. Buildern ändrar aldrig sin egen frysta grind.
3. Exit-testet körs mot kandidaten: `./verify/bin/h-00X-exit` → exit 0 krävs. PASS är
   exitkoden, inte rapporten.
4. En oberoende **produktgranskning** (read-only) prövar mot `docs/loop/granskningsrubrik.md`
   och försöker falsifiera kandidaten. Blockerande fynd → tillbaka till steg 2, samma gren.
5. Fasgräns: push, merge och publicering ingår inte i nuvarande fas; den kvarvarande kedjan
   följer `docs/loop/remaining-bootstrap-delegation-v1.md`.

## 9. Kalender (historik)

Kalendern och dess läge 2026-08-08 (h-001–h-011 levererade och grindade; smoke-momentet mot
Claude Code 2.1.224 genomfört) står i arkivkopian. Kvar: h-014–h-015 och piloten, som bör
omdefinieras nu när skivorna 14–15 och H-arbetena ligger emellan.

## 10. Stoppregler

- Komponent utan spec-rad → avböj, hänvisa till beslut 3.
- Nytt kodnamn → stoppa passet.
- "Härda", "frysa", "auktorisera" utan spec → scope-regeln.
- Två misslyckade fixförsök på samma fel → paus, `$nortropic-architect`, sedan ny kontraktsrunda.
- Kandidat som rör den skyddade mängden i §3.1 → avvisas av policyn (exit 3); ändringen går genom kontraktsflödet.
- Påstående utan verktygsbevis → märks OVERIFIERAT.

## 11. Startprompt

```
Läs i denna ordning: AGENTS.md · docs/loop/harness-substitution-contract-v1.md §1 ·
docs/loop/regler.md · docs/loop/byggplan-v3.md · docs/loop/implementation-v4.1.md ·
specs/tasks.spec.json · git log --oneline -15.

Rapportera: (1) läge med bevis per bevisregeln, (2) nästa task enligt specen och §7,
(3) dess exit-test ordagrant.

Regler för passet: gren nortropic/loop-<id> · endast taskens allowed_write ·
den skyddade mängden i byggplan v3 §3.1 rörs aldrig · planens namn, inga nya kodnamn ·
fixa-och-kör-om, aldrig ny klassificerare · ingen sudo · commit per delsteg ·
docs uppdateras i samma commit som systemändringen (regel 17 + 22) ·
stanna före push — grinden körs mot kandidaten och avgör.
Overifierat märks OVERIFIERAT.
```

---

*Committad som `docs/loop/byggplan-v3.md` i Pass 0 C2; plattformsversion 2026-09-10. Lägesfrågor besvaras mot spec, git och exit-tester — aldrig mot minne eller rapportering.*
