# Autonom loop — plattformsplan, generation platform-v2

`PLAN_GENERATION=platform-v2`. Detta är plattformens aktiva roadmap-plan. Identiteten är blobben för denna
fil vid HEAD, pinnad i autopilotens `ROADMAP_PLAN_BLOBS` och i `controller/verify/cli` `PLATFORM_DOCUMENTS`;
handoffen `docs/loop/autonomous-loop-platform-handoff-v2.md` är ingången till samma generation. Ingen commit-,
gren- eller kopieidentitet är auktoritet: vakten `ensure_roadmap_plan` stoppar på en ändrad eller saknad fil.

Arbetsmetoden — rollflödet, grindregeln, granskningsnormen — står i `docs/loop/regler.md` och upprepas inte
här. Auktoritetsordningen står i `AGENTS.md`. Plattformsgränsen står i
`docs/loop/harness-substitution-contract-v1.md` §1. Denna plan är källa för mål, arbetsdelar och
slutkriterier.

## Syfte

Planen beskriver vad plattformen ska kunna, vilka tekniska skydd som inte får försvagas, vilka arbetsdelar
som återstår och när arbetet är klart. Den är en implementationsplan, inte kod.

Planen ersätter den föregående plangenerationen. Den bevarar dess funktionella mål, dess tekniska skydd och
dess kvarvarande plattformsarbete; den bär inte vidare webbens styrdokument, kraven på generellt mänskligt
ingripande eller verksamhetsspecifika beroenden. Där den tidigare generationen band ett krav till en extern
styrtext binder denna generation samma krav till plattformens egen spec, grind eller kontraktsflöde.

Planen läses av autopiloten (`scripts/nortropic-codex-autopilot.py`), av rollskillsen under `.agents/skills/`
och av de agenter rollflödet startar. Femton av skivtabellens arton rader — SUB-1 till SUB-4 och S2 till S13 —
motsvarar exakt, och i samma ordning, posterna i autopilotens `SUBSTITUTION_ROADMAP + ROADMAP`; för dem är
tabellen och exekveringen en och samma sanning. De tre övriga raderna har ingen post i tuplarna: S1 och S3 är
byggda före plattformsgenerationen och läses ur sina specrader, och L är programgrinden, vars sökväg kommer ur
autopilotens `EMPIRICAL_GATE_PATH`.

## Målbild

Nortropic är organisationen; plattformen är dess verksamhetsneutrala autonomidel. Autonomin ska inom
organisationens `mål och mandat` själv identifiera behov och möjligheter, prioritera dem, genomföra arbetet
och utvärdera resultatet. Den ska alltså inte bara utföra en given uppgiftskö: den ska formulera vilken
uppgift som är rätt att göra härnäst, driva den genom rollflödet och mäta om effekten blev den avsedda.

Webb/Digitala är en verksamhet som använder den gemensamma plattformen. Verksamhetens styrning styr inte
Trust Kernel, bootstrap eller controllern. Plattformen exponerar en typad läs- och kommandoyta (S13); vilken
verksamhet som helst konsumerar den ytan utan att bli auktoritet i den.

Det tekniska målet är ett avgränsat, slutet autonomt system med betrodd verifiering, automatisk promotion,
agentisk konfliktlösning och Markdown-till-verifierad-uppgift-intag. Systemet ska kunna ta en beskriven
avsikt, härleda en maskinellt dömbar uppgift, bygga den, döma den mot en fryst verifierare och föra in
resultatet på den auktoritativa huvudlinjen utan att något agentpåstående blir förtroende.

Providerutdata är alltid bevis, aldrig auktoritet. Modell-, sessions- och granskarrapporter kan aldrig
certifiera verifiering, attestering, promotion eller en trust-transition; det gör bara deterministisk policy,
frysta grindar, attestering/fencing och bevakad publicering.

## Skyddade invarianter / tekniska skydd

Dessa skydd bevaras oförändrade genom hela planen. En skiva som skulle försvaga något av dem är avvisad
oavsett hur mycket funktionalitet den tillför.

- **G20-inneslutning.** Byggarbetet körs i en innesluten yta med exakt kandidatidentitet. Ingen skiva får
  flytta inneslutningen, kandidat-SHA:n eller materialiseringen till providerns förtroende.
- **Sökvägsuppslag och skrivyta.** Varje skrivning prövas mot uppgiftens `allowed_write` och mot specens
  `defaults.denied_write`. Den skyddade mängden — `verify/**`, `specs/**`,
  `controller/verify/register.json`, `scripts/check-invariants.mjs`, `.gitignore`, `CLAUDE.md` — avvisas
  mekaniskt av `controller/policy/cli` och ändras bara genom kontraktsflödet.
- **Registret utanför skrivytan.** Verifierarregistret ligger aldrig i en byggares `allowed_write`. En ny
  grind registreras genom kontraktsflödet, aldrig av den som ska dömas av den.
- **Ingen force, ingen amend, ingen omskriven historik.** `--force`, `--force-with-lease` och `--amend` är
  förbjudna tokens i alla Git-anrop. Publicering sker som bevakad merge-commit, aldrig som historikbyte.
- **Promotion under lease.** Promotion och trust-transitioner sker under ett giltigt lease med fencing;
  en föråldrad innehavare kan inte skriva efter att dess lease har gått ut.
- **Eventström utan auktoritet.** Den typade händelseströmmen är projektion och observation. Ingen
  konsument av strömmen kan påverka en trust-transition genom att skriva i den.
- **Providerutdata är aldrig trust.** En READY-rapport är evidens. Exitkod och grindutfall avgör.
- **h-039:s funktionskrav kvarstår.** Avslutad städning ska lämna noll registrerade runtime-rester, och
  städningen får inte radera eller ersätta främmande data genom den identifierade kapplöpningen mellan
  inventering och borttagning. Tidigare arbete och evidens bevaras.
- **Fasgräns.** I den lokala fasen gäller `PUSH=NO` och `MERGE=NO`. Extern aktivering (credentials,
  branch protection, promotionsidentitet) är en extern ceremoni och signaleras som
  `HUMAN_AUTHORITY_HARD_STOP`, inte som ett löpande krav på en människa i varje varv.

## Skivtabell

Tabellen nedan är den maskinläsbara sanningen om arbetsdelarna. Kolumnerna är skiva, uppgiftens id, dess
frysta exitprov, byggarens skrivyta, dess beroenden och om exitprovet finns i trädet. `status` är `BYGGD`
när exitprovet är spårat vid HEAD och `OBYGGD` annars. `-` betyder tom mängd. Ordningen är exekveringens
ordning: varje beroende som är en annan rad står tidigare.

| slice | task | exit_test | allowed_write | depends_on | status |
|---|---|---|---|---|---|
| S1 | h-017 | verify/bin/h-017-exit | - | h-002, h-016 | BYGGD |
| S3 | h-004 | verify/bin/h-004-exit | - | h-001 | BYGGD |
| SUB-1 | h-027 | verify/bin/h-027-exit | controller/provider/**, tests/controller/provider/** | h-004, h-006, h-008, h-009, h-011, h-013, h-016, h-017 | OBYGGD |
| SUB-2 | h-028 | verify/bin/h-028-exit | controller/launch/**, controller/provider/**, tests/controller/launch/**, tests/controller/provider/** | h-017, h-027 | OBYGGD |
| SUB-3 | h-029 | verify/bin/h-029-exit | controller/provider/**, controller/taskcontract/**, controller/worker/**, controller/envelope/**, tests/controller/provider/**, tests/controller/taskcontract/**, tests/controller/worker/**, tests/controller/envelope/** | h-007, h-027, h-028 | OBYGGD |
| SUB-4 | h-030 | verify/bin/h-030-exit | controller/loop/**, controller/brytare/**, controller/provider/**, tests/controller/loop/**, tests/controller/brytare/**, tests/controller/provider/**, docs/loop/drift.md | h-003, h-004, h-010, h-012, h-013, h-017, h-029 | OBYGGD |
| S2 | h-015 | verify/bin/h-015-exit | controller/atertag/**, tests/controller/atertag/** | h-010, h-013, h-016, h-004, h-030 | OBYGGD |
| S4 | h-018 | verify/bin/h-018-exit | controller/aterkoppling/**, controller/envelope/cli, tests/controller/aterkoppling/** | h-012, h-013, h-016, h-017, h-030 | OBYGGD |
| S5 | h-019 | verify/bin/h-019-exit | controller/handelse/**, controller/loop/**, tests/controller/handelse/** | h-001, h-016, h-030 | OBYGGD |
| S6 | h-014 | verify/bin/h-014-exit | controller/notis/**, controller/loop/**, tests/controller/notis/** | h-019 | OBYGGD |
| S7 | h-020 | verify/bin/h-020-exit | controller/befordran/**, tests/controller/befordran/** | h-017, h-015, h-004, h-019 | OBYGGD |
| S8 | h-021 | verify/bin/h-021-exit | controller/konflikt/**, tests/controller/konflikt/** | h-020 | OBYGGD |
| S9 | h-022 | verify/bin/h-022-exit | controller/overvakare/**, tests/controller/overvakare/** | h-020 | OBYGGD |
| S10 | h-023 | verify/bin/h-023-exit | controller/intag/**, tests/controller/intag/** | h-019, h-007 | OBYGGD |
| S11 | h-024 | verify/bin/h-024-exit | controller/grindsmed/**, tests/controller/grindsmed/** | h-023, h-017 | OBYGGD |
| S12 | h-025 | verify/bin/h-025-exit | controller/bedomare/**, tests/controller/bedomare/** | h-018, h-019 | OBYGGD |
| S13 | h-026 | verify/bin/h-026-exit | controller/lucka/**, tests/controller/lucka/** | h-019 | OBYGGD |
| L | - | verify/bin/autonomous-loop-exit | - | h-027, h-028, h-029, h-030, h-015, h-018, h-019, h-014, h-020, h-021, h-022, h-023, h-024, h-025, h-026 | OBYGGD |

### Vad varje skiva ska åstadkomma

Raderna nedan är sammanfattningar. De detaljerade, mätbara exitkriterierna och de skivspecifika negativa
kontrollerna för de obyggda skivorna S4, S5 och S7 till S13 står i `## Appendix A` sist i detta dokument och
är bindande på samma sätt som texten här. För S1, S2, S3 och S6 står motsvarande kriterier i
`docs/loop/byggplan-v3.md` §7 och i respektive specrad; för SUB-1 till SUB-4 i
`docs/loop/harness-substitution-contract-v1.md` §6.

- **S1 (h-017) — betrodd uppgiftsspecifik acceptansgrind + G20.** Byggd. Varje uppgift döms av sin egen
  frysta exitgrind, och inneslutningen prövas mekaniskt. Regeln består: en byggare kan aldrig vidga sin
  egen domare.
- **S3 (h-004) — lease heartbeat.** Byggd. Ett lease förnyas av en levande process; en död innehavare
  förlorar sin rätt att skriva utan att någon ingriper.
- **SUB-1 (h-027) — AgentProvider-gränssnitt med adapter.** Ett typat providergränssnitt som äger
  session, kontext, verktyg och omförsök. Nortropic behåller behörighet, identitet och bedömning.
- **SUB-2 (h-028) — providerstart skild från G20-inneslutning.** Starten av en provider får inte vara
  samma kodväg som inneslutningen; grinden ska avvisa en implementation som slår ihop dem.
- **SUB-3 (h-029) — strukturerat providerresultat och kanonisk TaskContract-projektion.** Resultatet av
  ett providerförsök normaliseras till ett typat kontrakt som är dömbart utan att läsa prosa.
- **SUB-4 (h-030) — tunn uppgiftssupervisor med avgränsade omförsök.** Supervisorn är golvet för S2, S4
  och S5: den håller uppgiftens livscykel, återstartar inom en gräns och ger upp deterministiskt.
- **S2 (h-015) — återtagning och kraschkonsistens.** Ett avbrott mitt i en transition lämnar ett tillstånd
  som systemet självt kan ta sig ur. Ingen tillståndsfil får kräva att någon raderar den manuellt.
- **S4 (h-018) — minimal strukturerad FailureArtifact.** Fel blir data: en typad artefakt som kan matas
  tillbaka till nästa försök i stället för en loggrad att läsa.
- **S5 (h-019) — normaliserade typade händelser och projektion.** En händelseström med stabilt schema;
  projektionen är läsyta, inte auktoritet.
- **S6 (h-014) — notis ur typade livscykelhändelser.** Kanalneutral notis via en konfigurerad sökväg
  utanför repot. Ingen leverantörsspecifik krok i plattformen.
- **S7 (h-020) — verifierad autopromotion.** Promotion sker när och bara när alla obligatoriska
  verifierare har körts färdigt mot exakt rätt kandidat. Extern aktivering är en förutsättning, inte ett
  steg i varvet.
- **S8 (h-021) — konfliktresonemang plus fullständig omverifiering.** En löst merge-konflikt verifieras
  om från grunden; ingen konfliktlösning ärver ett gammalt grönt utfall.
- **S9 (h-022) — betrodd kontrollplanstransition.** Kontrollplanet kan byta generation utan att en
  föråldrad instans kan skriva vidare.
- **S10 (h-023) — Markdown-intag och kanonisk Task IR.** Beskriven avsikt blir en typad uppgift med
  proveniens; plattformen validerar IR och proveniens i stället för att lita på texten.
- **S11 (h-024) — verifierarförfattare/utmanare plus kärnfrys.** Systemet kan föreslå nya verifierare;
  registreringen går genom kontraktsflödet och den frysta kärnan rörs inte.
- **S12 (h-025) — bedömaradapter med avgränsad adversariell granskning.** Två oberoende providers kan
  utmana varandra inom ett tak; utfallet är evidens, inte dom.
- **S13 (h-026) — typad läs- och kommandoyta.** Fem kommandoverb och en läsprojektion; verksamheten
  konsumerar ytan, kärnan behåller auktoriteten.
- **L — empirisk obevakad körning.** Programgrinden `verify/bin/autonomous-loop-exit` binder slutläget
  genom publika effekter, hermetiskt och utan att röra den verkliga huvudlinjen. Den ska avvisa minst en
  design där providerutdata självcertifierar, en som kringgår kandidatidentitet/inneslutning och en som
  gör providerns sessionssemantik till kärnsanning.

### Negativa kontroller som gäller alla skivor

Varje frysta grind ska, utöver sina positiva ankare, avvisa: en implementation som gör providerutdata till
verifiering; en som skriver utanför uppgiftens `allowed_write`; en som byter ut kandidatidentiteten mellan
bedömning och publicering; och en tom implementation som passerar utan att effekten inträffar. En grind som
bara läser källtext i stället för att mäta effekt är inte färdig.

## Bootstrap etablerar plattformen

Bootstrap-kedjan h-031, h-032, h-033, h-034, h-035, h-036, h-037, h-038 och h-039 etablerar plattformen:
identitet och proveniens, native-kärnan, starten och dess körtidsbild, dokumentauktoriteten och
runtime-städningen. Varje skiva hålls isär i fyra lägen: implementationen i trädet, den historiskt
kvalificerade versionen, kvalificeringen mot dagens plangeneration, och det produktarbete som återstår.
Samtliga nio exitprov ligger i trädet — det bevisar bara det första läget. h-032 saknar sin produkt
(`controller/result/**` finns inte i trädet) och h-038 saknar sin (inneslutningen av försöksroten finns
inte i `controller/launch/cli`); ingen av kedjans bindningar är kvalificerad mot plangenerationen förrän
den har mätts mot den. De frysta delegationsdokumenten under `docs/loop/` som beskriver den kvarvarande
bootstrap-delegationen är read-only historik och omdefinieras inte av denna plan.

Bootstrap har en ÄNDLIG överlämningspunkt till kvalificerad autonom drift. Punkten är nådd när den lokala
bootstrap-milstolpen i `## Avslutskriterier` är uppfylld och plattformens bindningar är kvalificerade för
plangenerationen. Organisationens fortsatta utveckling sker därefter, inom målbilden ovan och genom samma
rollflöde — den ligger inte inom bootstrap. Hela framtida Nortropic behöver alltså inte byggas färdigt under
bootstrap; bootstrap ska bara lämna över ett system som kan driva den utvecklingen själv.

En ny H-post tillkommer bara när ett konkret hinder för överlämningen kräver den. Ompinningen av h-035,
h-036, h-037 och h-038 mot plangenerationen tas i beroendeordningen h-035 parallellt med h-037, därefter
h-036, därefter h-038. h-035 och h-038 var röda redan före plangenerationen, så ompinningen är inte
villkorad av någon ändring i autopilotskriptet eller i routerdokumenten. Kedjans arbete hör till bootstrap
och tas före skivtabellens rader. Ompinningen omfattar också h-039:s egen bindning: h-039 pinnar i dag
h-035:s och h-036:s grindbytes, så ett refreeze av h-035 gör den pinnen föråldrad. Den ompinningen är skild
från h-039:s kvarvarande produktarbete.

h-039 ligger kvar i den kvarvarande vägen, och dess koppling till h-038 går åt andra hållet än den ser ut
att göra. h-039:s spec-rad har `depends_on: ['h-036']` och namnger inte h-038; registren R30–R33 bär i
stället fältet `h038_h032_h031_or_supervisor_resume: False`, bundet av `R33_REGISTRY_SHA256`, med
RED-etiketten `H038_H032_H031_OR_SUPERVISOR_PROGRESS_BEFORE_FULL_H039_PASS`. h-039 kräver alltså ingenting
av h-038 — h-039 förbjuder h-038 att gå framåt innan h-039 har ett fullt PASS. h-039:s kvarvarande
produktarbete är `--r33-installed`-lanen: installationsceremonin, den oberoende valideringen av efterläget,
installed-granskningen, en fryst R15-live-diagnostik och körningen av lanen. Lanen blockeras av
`PRODUCTION_ORIGIN` och hör därför till den senare operativa överlämningen. Arbetskopian
`R33_LIVE_R2_FAILED_EVIDENCE` är medvetet NOT_READY, fryst som överspelad NO-CREDIT, och återupplivas inte.

Den lokala bootstrap-milstolpen är ett avgränsat leveransmål. Överlämningen till kvalificerad autonom drift
kräver därutöver den senare installationen, driftkvalificeringen, supervisor-resume och en visad förmåga att
själv identifiera, prioritera och driva arbete; de delarna ligger kvar på vägen men startas inte av det steg
som stänger milstolpen.

## Arbetsflöde

Arbetet går genom rollflödet test-author → oberoende kontraktsgranskning → builder → oberoende
produktgranskning → lokal kvalificering. Normen för varje steg står i `docs/loop/regler.md`; planen anger
bara vilken ordning arbetsdelarna tas i.

1. Arkitektsignalen avgör vilken skiva som står på tur och om ett hinder kräver en ny frysning.
2. Test-author fryser uppgiftens kontrakt och dess RED-grind inom den skrivyta skivtabellen anger.
3. Oberoende kontraktsgranskning försöker falsifiera grinden innan någon produkt skrivs.
4. Builder implementerar inom `allowed_write` och rör aldrig den grind som dömer arbetet.
5. Oberoende produktgranskning läser hela diffen och försöker falsifiera effekten.
6. Lokal kvalificering kör de frysta verifierarna mot exakt den kandidaten; först då finns ett PASS.

Migrationsordningen är skivtabellens ordning: de byggda S1 och S3 ligger fast, därefter SUB-1 till SUB-4,
därefter S2 och S4 till S13, och sist L. En skiva startas inte innan dess beroenden är gröna.

## Avslutskriterier

Fyra nivåer, i den ordning de ska uppfyllas.

**1. Planseparation.** Plattformen har en egen plan och en egen handoff, och de används av alla aktiva
konsumenter: autopilotens konstanter, samtliga rollskills, routerdokumenten och de genererade
instruktionerna. Planens arbetsdelar stämmer maskinellt med exekveringen — skivtabellen är lika med
autopilotens skivtuplar, i samma ordning. Ett genomfört flöde visar att rätt plan och rätt överlämning når
agenterna och att den tidigare webbstyrningen inte återinförs.

**2. Trust Kernel.** En giltig uppgift kan slutföras hela vägen till kvalificerad produkt. Fel identitet,
otillåtna skrivningar, saknad obligatorisk verifierare och fel hash avvisas mekaniskt, var för sig och i
kombination. Kvalificering kräver att rätt frysta verifierare har körts färdigt mot exakt rätt kandidat med
samtliga obligatoriska kontroller utförda; exitkod 0 ensam räcker inte som bevis, eftersom en avbruten,
felriktad eller ofullständig körning också kan lämna en nolla.

**3. Lokal bootstrap-milstolpe.** En verklig uppgift genomförs genom hela rollflödet till kvalificerad
produkt utan webbstyrning och utan generellt mänskligt ingripande. De nödvändiga bindningarna —
dokumentpinnar, registerposter och grindidentiteter — är kvalificerade för plangenerationen. Detta är
bootstrap-milstolpen och den ändliga överlämningspunkten.

**4. Operativ helhet (senare, utanför dagens lokala fas).** Installation av driftinställningarna,
driftkvalificering, supervisor-resume och demonstrerad förmåga att själv identifiera och driva arbete.
Nivån startas inte av denna plan och ligger utanför dagens fas; den kräver extern aktivering och en egen
frysning.

## Kvarvarande osäkerheter

Dessa punkter är OVERIFIERAT tills de har mätts mekaniskt; ingen av dem blockerar skivtabellens ordning.

- Publiceringsmålets externa inställningar (branch protection, dedikerad promotionsidentitet,
  regeluppsättningar) är externa mätningar och prövas av S7:s förutsättningskontroll, inte av prosa.
- `origin/main`-identiteten för plattformsrepot är inte fastställd i den lokala fasen.
- Beroendekonflikten för S6: specradens `depends_on` och skivtabellens skiljer sig; tabellen följer
  autopilotens tuplar och specradens `exit_test`. En specändring kräver kontraktsflödet.
- Programgrindens namn `verify/bin/autonomous-loop-exit` är bundet av autopilotens `EMPIRICAL_GATE_PATH`
  och byts inte utan en ny frysning.

## Appendix A — bevarade krav och negativa kontroller för de obyggda skivorna

Detta appendix bär de detaljerade exitkriterierna och de skivspecifika negativa kontrollerna för S4, S5 och
S7 till S13. De är oförändrade funktions- och säkerhetskrav från den föregående plangenerationen, återgivna i
plattformens egen struktur och renade från verksamhetsstyrning och krav på generellt mänskligt ingripande.
Skrivytor, beroenden och exitprov står i skivtabellen och upprepas inte här.

Kriterierna är bindande för test-author när skivan fryses: den frysta grinden ska mäta de namngivna effekterna
och avvisa de namngivna negativa kontrollerna. Där ett krav inte längre går att uppfylla i plattformens form
ska avvikelsen skrivas ut i frysningen, inte tigas ihjäl.

### A.4 — S4 / h-018, strukturerad felåterkoppling

Exitkriterium. Efter ett fallet försök finns en immutabel artefakt adresserad per (`run_id`, `task_id`,
`attempt_id`), och försök N+1 får den i kuvertet — i ett färskt workspace på samma fastställda task-base.
Den fallna kandidaten blir aldrig nästa försöks base. Artefakten bär `run_id`, `task_id`, `attempt_id`,
base-identitet, kandidatidentitet där sådan finns, felstadium, felklass, grindens/verifierarens identitet,
exitkod, timeout eller signal, relevant stdout, relevant stderr och evidensreferenser. Den innehåller aldrig
grindens kod, dess kontrollnamn eller verifierarregistret — mätt genom att en grind vars text bär en unik
markörsträng aldrig läcker markören till kuvertet. Ett andra försök skriver en ny artefakt, och den första är
byte-identisk efteråt.

Negativa kontroller. Försök N+1 utan artefakt · artefakt som bär grindens innehåll eller registret · artefakt
som skrivs över · återkoppling som når en uppgift den inte gäller · fallen kandidat använd som ny base ·
återanvänt workspace.

Avgränsning mot S5 (annars två sanningar). Återkopplingsartefakten är auktoritet för vad byggaren får veta.
Händelsen `feedback.created` bär bara en referens till artefakten, aldrig dess innehåll. Ingen komponent får
läsa återkoppling ur händelseströmmen.

### A.5 — S5 / h-019, typade livscykelhändelser

Exitkriterium. Varje händelse bär `schema_version`, `event_id`, `seq`, `ts`, `run_id`, `task_id`,
`attempt_id`, `event_type`, `payload` och `evidence_refs`. Ordningen läses ur `seq`; väggklockans `ts` får
aldrig ensam definiera ordning, och ett prov med bakåtgående klocka ska inte ändra läsordningen. Strömmen är
append-only: en avbruten körning lämnar en läsbar logg där varje rad är exakt en händelse. Uppgiftstillståndet
i den befintliga loopen är byte-identiskt före och efter en körning som skriver hundra händelser, mätt med
sha256. Ett okänt `event_type` avvisas, aldrig tolkas. Strömmen är aldrig schemaläggnings- eller
färdigställandeauktoritet: uppgiftsval och attestering läser den inte, mätt genom att en körning med raderad
händelseström ger identiska domar.

Händelsefamiljer: `run.*`, `task.*`, `attempt.*`, `workspace.*`, `agent.*`, `candidate.*`, `policy.*`,
`verification.*`, `feedback.*`, `evaluation.*`, `attestation.*`, `promotion.*`, `merge.*`, `main.*`,
`breaker.*`, `budget.*`.

Negativa kontroller. Händelse skriven i den befintliga loopens logg · halvskriven rad · `event_type` utanför
schemat accepteras · saknad `attempt_id` på en försökshändelse · ordning läst ur `ts` · någon komponent som
fattar beslut ur strömmen.

### A.7 — S7 / h-020, verifierad autopromotion

Exitkriterium, mätt mot ett lokalt bare-repo som står för origin och aldrig mot den verkliga fjärran:

1. En promotionsberättigad attestering flyttar huvudlinjen till kandidatens SHA med en non-force
   fast-forward-push, och referensen läses om efteråt och svarar kandidatens SHA.
2. En attestering utan uppgiftsgrindens verdikt flyttar aldrig huvudlinjen.
3. Har fjärran rört sig från A till C sedan verifieringen avbryts promotionen, huvudlinjen står orörd, och
   kandidaten går vidare till S8 — den skrivs aldrig över.
4. Är A inte förfader till B avbryts promotionen.
5. Promotion utan giltigt, bevisat lease-ägarskap sker aldrig.
6. Samma promotion körd två gånger ger ett huvudlinjeläge.
7. En byggarsession som skriver ut hela sin miljö och hela sitt filträd läcker aldrig promotionsnyckeln.
8. Ingen force-semantik förekommer i någon kodväg — mätt statiskt: noll förekomster av `--force`,
   `--force-with-lease` och ledande `+` i refspec i hela komponenten.

Promotionen bär alltså förväntad gammal huvudlinje-SHA och kräver fast-forward, och den är idempotent och
kraschsäker.

Negativa kontroller. Attestering utan grindidentitet befordras · huvudlinjen har rört sig och skrivs över ·
force-push i någon väg · promotion utan efterkontroll · dubbelkörning ger två promotioner · promotion efter
förlorat lease · nyckeln läsbar för byggaren · nyckeln i controllerns miljövariabler · promotion mot ett annat
repo än plattformsrepot.

### A.8 — S8 / h-021, konfliktlösning med fullständig omverifiering

Exitkriterium. En verifierad kandidat B som inte kan befordras mot aktuell huvudlinje C ger en ny kandidat D
där `parent(D) = C` — en single-parent-commit ovanpå aktuell huvudlinje, inte en Git-merge-commit. D:s
attestering skapas först efter att policy, global verifierare, uppgiftsgrind och krävd bedömare körts om från
noll mot D. B:s attestering, PASS och bedömning återanvänds aldrig — mätt genom att D:s dom uteblir när D är
saboterad, trots att B var grön. Lösaren får B:s avsedda delta och konflikten, aldrig B:s attestering eller
dom. Promotion av D är en vanlig fast-forward C → D. Rör sig huvudlinjen igen till E är det ett nytt
avgränsat försök, inte ett fel. Konfliktlösningen har egen avgränsad budget i antal försök och väggtid; nås
taket stannar körningen med orsak och uppgiften förblir tagen.

Negativa kontroller. D ärver B:s attestering eller bedömning · D är en merge-commit med två föräldrar ·
`parent(D)` är inte aktuell huvudlinje · omverifiering hoppas över · konfliktlösning utan budget · konflikt
löst utan evidens · en huvudlinje som rör sig igen behandlas inte som ett nytt försök · force i
konfliktlösningsvägen.

### A.9 — S9 / h-022, betrodd kontrollplanstransition

Exitkriterium. Efter promotion av en trust-kritisk ändring avslutas den gamla controllern rent, supervisorn
bootstrap-verifierar den nya auktoritativa huvudlinjen, och först därefter startas en ny controlleridentitet
som återupptar backloggen. Ingen process överlever promotionen och fortsätter döma — mätt med en
kandidatversion som bär en unik markörsträng: markören får inte förekomma i något som kördes före
promotionen, och den gamla processens pid får inte leva efter transitionen. Den nya controllern dömer
ingenting innan bootstrap är grön. Det finns exakt en betrodd auktoritet åt gången, aldrig två.

Avgränsning mot G20. G20 (S1) svarar på frågan vem som dömer kandidaten. S9 svarar på hur den befordrade
versionen blir nästa betrodda körtid. S9 får inte duplicera G20, och G20 får inte skjutas hit.

Negativa kontroller. Omladdning utan omstart · ny controller dömer före bootstrap · två trust-auktoriteter
samtidigt · bootstrap som inte verifierar den nya huvudlinjen · gammal process som lever vidare.

### A.10 — S10 / h-023, intag och kanonisk Task IR

Exitkriterium. En Markdown-fil med två arbetsmål ger två uppgifter i kanonisk IR, var och en spårbar till
källans sha256 och sektion via proveniens. Källan sparas som en immutabel ögonblicksbild. En uppgift som inte
kan göras tillräckligt verifierbar hamnar i `NEEDS_SPEC` med noll byggarstarter — mätt genom att ingen
session startar och inget workspace skapas. Den genererade IR-filen kan matas till loopen som `spec` utan att
någon befintlig komponent ändras.

Negativa kontroller. Uppgift utan verifieringskontrakt når byggaren · proveniens saknas eller pekar fel ·
`NEEDS_SPEC` startar ändå en session · genererad JSON som inte går att spåra till källans sha256 ·
källögonblicksbild som muteras · planerare som hittar på svaga acceptanskriterier och ändå går READY.

### A.11 — S11 / h-024, verifierarförfattare och utmanare

Exitkriterium. För en uppgift utan ett i förväg skrivet prov produceras en grind som fryses i registret med
sökväg och sha256 innan byggaren startar. Utmanaren fäller en medvetet svag grind — mätt med en grind som
alltid säger ja, som utmanaren måste avvisa. Författare och byggare körs i skilda sessioner och skilda
trust-domäner, mätt genom att byggarens sessionsidentitet aldrig sammanfaller med författarens. Kan kontraktet
inte göras tillräckligt starkt blir utfallet `NEEDS_SPEC` med noll byggarstarter. Registret ligger utanför
skivans skrivyta; en ny grind registreras genom kontraktsflödet.

Negativa kontroller. Författare och byggare i samma session · utmanare som inte fäller en medvetet svag grind
· grind som fryses utan att ha prövats åt båda hållen · grind som ändras efter frysning · byggare som når
grindens innehåll.

### A.12 — S12 / h-025, oberoende bedömare

Exitkriterium. Bedömaren körs först när de hårda grindarna är gröna; en röd grind går aldrig vidare. Ett fynd
blir en återkopplingsartefakt enligt A.4 och tvingar fram en ny kandidat som verifieras från noll. En bedömare
som säger ja om en kandidat med röd grind ändrar ingenting — attesteringen uteblir ändå, mätt. Riskklassen
styr: låg risk ger hårda grindar, normal risk ger dessutom en färsk bedömare, hög eller omtvistad risk ger
dessutom avgränsad adversariell korsgranskning mellan två oberoende providers. Rundor och kostnad har tak i
konfigurationen; en körning som når taket stannar med orsak. Bedömaren får kandidatens diff, uppgiftskontraktet
och evidensreferenser — aldrig grindens kod eller registret.

Negativa kontroller. Bedömarens ja attesterar ensamt · fynd som inte ger omverifiering · obundet antal rundor
· kostnad utan tak · bedömare körd före de hårda grindarna · bedömare som ser grindens implementation ·
samstämmighet behandlad som PASS.

### A.13 — S13 / h-026, typad läs- och kommandoyta

Exitkriterium. Fem verb fungerar med typad nyttolast, och ett sjätte verb avvisas:

```text
intake.submit               { source_ref, source_sha256 }
run.start                   { config_ref }
run.pause_at_safe_boundary  { run_id }
run.resume                  { run_id }
inspect                     { task_id | run_id }
```

En nyttolast som bär en skalsträng exekveras aldrig — mätt med en nyttolast vars innehåll skulle ha skapat en
kanariefil om den tolkats. Läsytan svarar ur händelseströmmen och kan inte skriva. Controllerns lokala
tillstånd förblir auktoritet: en projektion som gått isär ändrar ingen dom. Är ytan nere kör controllern
vidare oförändrat, mätt med identiska attesteringar och identisk exitkod. `run.pause_at_safe_boundary`
definierar säker gräns som mellan uppgifter, aldrig mitt i ett försök — annars lämnas workspace och lease i
obestämt läge.

Bindande: ingen generisk skalyta, ingen generisk Git-yta, ingen tvingad merge, ingen godtycklig filredigering.
Ett kommando är ett namn ur listan plus en typad nyttolast, aldrig en sträng som blir ett kommando. Den
konsumerande verksamheten får aldrig bli den komponent som själv certifierar eller befordrar Git.

Negativa kontroller. Kommando utanför de fem verben accepteras · skalsträng exekveras · godtycklig
filredigering · generisk Git-yta · projektion behandlad som auktoritet · fel i läsytan som stoppar eller
ändrar controllern · ytan som själv befordrar.
