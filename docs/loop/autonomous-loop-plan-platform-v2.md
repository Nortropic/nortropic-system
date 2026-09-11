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
och av de agenter rollflödet startar. Varje arbetsdel i skivtabellen nedan motsvarar exakt en post i
autopilotens `SUBSTITUTION_ROADMAP + ROADMAP`; tabellen och exekveringen är en och samma sanning.

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
runtime-städningen. Kedjan är byggd och dess exitprov ligger i trädet. De frysta delegationsdokumenten under
`docs/loop/` som beskriver den kvarvarande bootstrap-delegationen är read-only historik och omdefinieras inte
av denna plan; planen namnger bara vad kedjan har etablerat.

Bootstrap har en ÄNDLIG överlämningspunkt till kvalificerad autonom drift. Punkten är nådd när den lokala
bootstrap-milstolpen i `## Avslutskriterier` är uppfylld och plattformens bindningar är kvalificerade för
plangenerationen. Organisationens fortsatta utveckling sker därefter, inom målbilden ovan och genom samma
rollflöde — den ligger inte inom bootstrap. Hela framtida Nortropic behöver alltså inte byggas färdigt under
bootstrap; bootstrap ska bara lämna över ett system som kan driva den utvecklingen själv.

En ny H-post tillkommer bara när ett konkret hinder för överlämningen kräver den. Refreeze av h-035, h-036,
h-037 och h-038 efter en ändring i autopiloten eller i routerdokumenten är ett eget H-steg och batchas; den
hör till bootstrap, inte till skivorna.

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
