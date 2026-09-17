# Nortropic — revision av vägen till färdig bootstrap / trust kernel

**Datum:** 17 september 2026. **Revisionsdom:** den nuvarande överlämningen bör inte betraktas som verifierat redo för obevakad körning. Riktningen behöver inte kastas; start-/slutdomar, grenövergång och acceptanskoppling behöver rättas. Detta dokument är granskningsunderlag, inte en ny auktoritativ arbetsordning.

## Omfattning och bevisnivå

Underlag: användarens bifogade Codex-prompt, primärkällor lästa genom GitHub-anslutningen, revisionsjämförelse och sju isolerade kontrollprov. Repo: `Nortropic/nortropic-system`.

- Granskad main: `eb9483e932be528231d3e9212d816ebad76ef114`.
- Granskad plattformsgren: `8095d947c83202e2b87801531d9f7cb1457c8719` på `nortropic/platform-integration-20260910`.
- GitHub-jämförelse: `diverged`, plattformsgrenen 55 commits före och 111 efter main; gemensam bas `ed584ec3088c08005f99de1da825d083e350a8d2`.
- Kontrollproven kördes på Linux i tillfälliga, isolerade Git-repon. Ingen nättrafik, push, användarrepoändring, modellkörning eller faktisk kernelgrind ingick.

**De sju proven reproducerar reducerade beslutsfragment, inte kompletta originalskript eller en Darwin-kvalificering.** Testet av sluträkningen går uttryckligen in i den kodgren som används efter valet att köra grindar på Darwin, men med syntetiska grindfixturer. Det påstår inte att värdmiljön är Darwin. Fristående prov visar därmed beslutens logik, inte faktisk kernelstatus.

Källfilerna har inte lästs byte för byte i hela repot. Denna revision omfattar vägen, de centrala start-/slut-/bevarandemekanismerna, styrningen och acceptansens beroenden. Fullständig kod-, säkerhets- och driftskvalificering är **OVERIFIERAD** här. Ingen garanti om frånvaro av ytterligare fel lämnas.

`results.json` innehåller körda observationer och kontrollfall. `source-observations.json` är ett sammanställt utdrag av lästa källobservationer, inte ett råexporterat GitHub-svar.

## Samlad diagnos

Den återkommande felklassen är att ett observerbart men svagare faktum får bära en starkare slutsats: fil finns → prov godkänt; inga ordet AVVIKER → mätning godkänd; lika antal poster → orört innehåll; några inventerade kategorier säkrade → allt kan städas; delgraf grön → full slutväg öppen.

Att ersätta ett påstående med ett skript löser inte detta om skriptet prövar fel sak. En säker överlämning behöver en beviskedja mellan det verkliga kravet, vad kontrollen faktiskt läser, det observerade utfallet och den handling utfallet tillåter.

## AUD-01 — Sluträkningen kan säga KERNEL_COMPLETE utan godkända slutprov

**Källa:** `docs/loop/raddning/artefakter/helhetsbilden.sh`; jämför `VAGEN.md` §1. **Bevis:** källgranskning + T01.

VÄGEN kräver att h-014, h-015 och programgrinden passerar. Skriptet räknar i stället `-f` på deras filer. Substitutionsraden räknar fyra task-id:n, inte frysta eller godkända grindar. En tom acceptansfil uppfyller sista raden. Endast de fjorton äldre grindarna körs i `--kor-grindar`-läget.

T01 producerade `UPPFYLLDA=6`, `KERNEL_COMPLETE`, exit 0 i den reducerade sluträkningen. h-014, h-015 och programgrinden hade inte anropats; direkt anrop av respektive syntetisk fil gav exit 1. Fyra substitutionsrader saknade helt `exit_test`. Acceptansfilen var tom. Att ta bort acceptansfilen eller göra en av de fjorton grindarna röd sänkte korrekt resultatet: fixturen visar en specifik svaghet, inte en funktion som alltid ger grönt.

Miljö, smuts, klontyp och fetchproblem skrivs också ut utan att alla ingår i den slutliga komplettdomen. Kommentarens uppgift att skriptet läser de sex kraven ur VÄGEN motsvaras inte av en sådan inläsning i koden.

**Åtgärd:** skilj finns/specad/fryst/körd-PASS; använd det befintliga verifierarflödet och bind kvalificerat resultat till rätt kandidat, specifikation och grind. Ett informationsläge får rapportera förekomst, men aldrig räkna den som uppfylld funktion.

**Stängning:** hela reparerade skriptet, inte bara detta fragment, ska avvisa röda, ej körda, tomma, saknade och felbundna prov och acceptera en legitim positiv fixtur. Kör därefter dess verkliga väg på Darwin. En fortfarande ofärdig kernel ska förbli ofärdig.

## AUD-02 — Redo-provet gör okänd eller kraschad validering till en grön rad

**Källa:** `redo-for-codex.sh`. **Bevis:** källgranskning + T02.

Skriptet sparar validatorns exitkod i `v`, men använder inte den i domen. Det räknar endast rader vars sista ord är `AVVIKER`. Utan sådana rader blir kontrollen JA. T02 gav JA vid exit 2 + ODÖMBART, exit 127 + feltext och tom utdata. Ett verkligt AVVIKER-fall gav NEJ, som positiv kontroll av detektorn.

Andra kontroller är för svaga för sina rubriker: `RAD: h-001` någonstans i driftloggen bevisar inte aktuell mätning; en körbar post-commit-fil bevisar inte aktiverad eller framgångsrik autopush; förekomst av fasrubriker bevisar inte att överlämningen är sammanhängande.

**Åtgärd:** bevara barnprocessens faktiska fel-/okändstatus, validera att ett fullständigt resultat finns och håll historisk mätning skild från aktuell evidens. Autopushstatus ska inte lova faktisk bevaring utifrån en filkontroll.

**Stängning:** ODÖMBART, avbrott, tom/trasig utdata och saknad aktuell bevisbindning får aldrig ge ett grönt startvillkor.

## AUD-03 — Historikvalideringen motverkar framsteg när den används som startkrav

**Källor:** `validera-underlaget.sh`, `redo-for-codex.sh`, räddningskatalogens `README.md`. **Bevis:** direkt läst kod och dokumentation; inte full validator körd här.

Validatorn väntar sig bland annat att h-014-exit, h-015-exit, autonomous-loop-exit och h-030 i specen saknas, att grindkatalogen har ett visst antal filer och att det gamla webbregistret finns. Detta kan vara historiska fakta om diagnosögonblicket. Det är inte stabila kriterier för att få fortsätta arbeta. Korrekt implementation och separation ändrar dem.

README dokumenterar dessutom två avsiktligt saknade underlagsartefakter som ger ODÖMBART även på Mac. En ren rättning av AUD-02 riskerar därför att göra det nuvarande startprovet permanent icke-grönt om kontrakten inte skiljs åt.

**Åtgärd:** historiska påståenden ska prövas mot sin deklarerade revision, medan operativ start ska pröva aktuella förutsättningar för nästa avgränsade uppgift. Behåll okända historiska artefakter som okända; kalla dem inte PASS och kräv dem inte som orelaterat byggvillkor.

**Stängning:** att legitimt skapa nästa saknade komponent eller landa separationen får inte ensamt försämra aktuell körberedskap.

## AUD-04 — Grenövergången tappar den nya styrningen

**Källor:** GitHub compare, `VAGEN.md`, `regler.md` på båda revisionerna, plattformsgrenens `SEPARATION-20260910/README.md`. **Bevis:** direkta GitHub-läsningar; T03 för körbanans Git-predikat.

Plattformsgrenen är 55 före och 111 efter granskad main, inte 55 före och noll efter. `VAGEN.md` på den granskade plattformsrevisionen gav 404. Dess regel 11 är kontraktsflödet och regel 12 tekniska skydd; på main betyder 11 omfrysningsregler och 12 bevarande. Grenens regel 13 avgränsar bort push, publicering, installation och supervisor resume, medan senare main-dokument medger autonom publicering inom målmandatet.

Att byta gren är alltså ett byte av både kod och styrning. Att välja hela den ena sidans text som konfliktsvar riskerar att radera legitima beslut från den andra. Alla hänvisningar måste avse rätt innehåll, inte enbart ett regelnummer.

VÄGEN kräver även `git diff --quiet HEAD origin/main` före varje grindkörning. T03 visar att en ren legitim kandidat som innehåller all mainhistorik ändå ger exit 1 på detta prov. En ny tom commit kan omvänt ge exit 0 trots annan commitidentitet. Trädlikhet är varken färskhet eller kandidatidentitet.

**Åtgärd:** en granskad vanlig integration som bevarar plattformskoden och aktuella beslut, utan force, rebase eller blind konfliktlösning. Håll kvar separationens ägarbeslut: återskapa inte webbens gamla styrdokument som kernelauktoritet. Migrera relevanta kernelbeslut till den redan planerade kernelbeslutsloggen och peka om berörda referenser.

**Stängning:** den faktiska rena byggklonen bär gällande VÄGEN, regler och mekanismer efter övergången. Fasens bas, kandidat och authority identifieras separat. Färskhetsprovet accepterar en giltig kandidat och avvisar verkligt fel bas-/remoteunderlag.

## AUD-05 — Fjorton grindar är inte den fullständiga auktoriserade beroendeslutningen

**Källor:** `specs/tasks.spec.json` h-015/h-017; `harness-substitution-contract-v1.md` §6–7; VÄGEN §1 och FAS 5–6. **Bevis:** direkt källhärledning, ingen runtimeklassning.

h-015 beror på h-030. Det kontrakt som den nya h-030-raden måste härledas ur kräver h-017; h-027 och h-028 kräver också h-017. Den hårdkodade fjortonlistan innehåller inte h-017. Den kan vara ett relevant delmål för den äldre grenen av grafen, men inte beskrivas som hela beroendeslutningen fram till v1.

h-017 är inte ett administrativt sidokrav: den avser taskens egen frysta grind. Målbeskrivningen kräver just sådan verifiering. Detta är en redan beslutad beroendekoppling, inte ett förslag om ny produktfunktion.

FAS 5 heter att h-027–h-030 ska vara specade. Därefter kommer h-015. Den explicita länken från specrad till fryst grind, byggd komponent och godkänd verifiering för de fyra substitutionsuppgifterna saknas som tydligt klart-när. Den bör inte överlåtas åt nästa modell att gissa.

**Åtgärd:** slutför den redan beslutade grafen ur kontraktet; visa saknade noder som saknade och låt inte en delgraf kallas komplett. Skriv in bygg- och godkännandestegen i befintlig VÄGEN. Koppla h-017-beteendet till fryst taskdom på rätt kandidat.

**Stängning:** fullgrafen är entydig, alla refererade noder har hantering, och röd eller saknad obligatorisk taskgrind kan inte ge kvalificerad slutacceptans. Detta kräver inte att samtliga komponenter redan är implementerade för att den första bygguppgiften ska starta.

## AUD-06 — Slutgrinden definieras för sent och några målgränser är olösta

**Källor:** VÄGEN FAS 7, `07-v1-acceptans.md` §5–7, substitutionskontraktet. **Bevis:** källmotsägelse och täckningslucka.

VÄGEN lägger frysning av programgrinden och skrivande av acceptansfilen i sista fasen. Acceptansunderlaget kräver RED före arbetet som grinden mäter. En sista-fas-grind kan därmed riskera att anpassas till det som råkade byggas. Att VÄGEN numera ersätter gamla arbetsordningar betyder att detta måste rättas där, inte genom att i smyg följa en konkurrerande ordning.

Målbeskrivningen omfattar både guarded publication och meningsfull kontinuitet utan mänsklig återberättelse. En existerande återtagsfil och en teknisk processrestart bevisar inte ensamma detta. Samtidigt omfattar full-roadmap-materialet fler förmågor och en promotergräns som måste hållas åtskilda från v1:s redan avgränsade omfattning.

**Åtgärd:** frys v1:s avgränsade krav–provkoppling före återstående relevant implementation. Den slutliga körningen och rapporteringen kan ligga sist. Beskriv vilket publicerings-/identitetsbevis v1 kräver och vilket kontinuitetsförsök som visar att uppdragets avsikt, beslut och läge faktiskt överlever. Flytta inga befintliga krav ur v1 för att förenkla, men importera inte hela senare roadmapen.

**Stängning:** en ny session kan ur repot svara på vad som återstår och vad som stänger varje krav. Slutprovets negativa fall är definierade i förväg. Full functional acceptance kräver sedan verklig körning, inte dokumentens existens.

## AUD-07 — Återfallsskydden är inte visade som inkopplade beteenden

**Källor:** `08-mekanismer.md`, faktisk `codex-autopilot-report.schema.json`, `11-tre-vakter-mot-aterfall.md`, huvudreglerna. **Bevis:** schema och plan lästa; hela autopilotens konsument har inte verifierats.

Schemat har fortfarande enbart `blocking_findings`, inte den beskrivna advisorykanalen, `basis` eller `reopen_basis`. `tests` har inget minItems-krav. Detta bevisar en schema-/kanallucka; det bevisar inte ensamt hur alla runtimegrenar behandlar DONE. Det måste prövas där nästa åtgärd faktiskt bestäms.

Mekanismunderlaget kräver både obligatoriskt basis och oförändrad befintlig required-mängd. Det behöver en explicit kontraktsmigration. Det kräver också fortsatt gröna äldre monolitgrindar som på annat håll är avslutade OVERIFIERAT; läsningen riskerar att återstarta den avslutade rundtrampen.

Omfrysningsbudget är inte samma sak som körbudget. En orörd grind kan följas av obegränsade byggförsök om försöksbudgeten inte faktiskt styr över sessioner. En subtraktiv diff kan dessutom ta bort ett säkerhetskrav; diffens riktning ensam bevisar inte legitim miljöreparation.

**Åtgärd:** bevisa i befintlig routing att advisory inte startar reparationsrunda, belagd kravbrist gör det, samma gamla förslag inte återöppnar en avslutad del och budgeten överlever återstart. Bevara oberoende granskning av gatereparationers semantik. Dela endast med spårbar koppling till ursprungskravet, inte för att nollställa budgeten.

**Stängning:** negativa och positiva routingprov körda i den verkliga beslutande kedjan. Inga nya generella orkestreringslager, inga gamla övergivna monoliter återöppnade enbart för att ett bakgrundsdokument pekar dit.

## AUD-08 — Autocommit bryter dokumentationsenheten och följer äldre §A-klassning

**Källor:** `scripts/nortropic-autocommit.sh`, huvudgrenens regel 6–7, `AGENTS.md`, h-016-specen. **Bevis:** källgranskning + T04.

Koden klassar fortfarande controller/specs/verify som §A och skapar separata commits: vanliga filer först, dessa filer sedan. Senare huvudregler har tagit bort blankettskyddet för samma ytor. T04 gav en commit med drift-dokumentationen och en separat med controllerändringen. Ingen innehöll båda.

Bevarande är inte publicering; det är en viktig korrekt princip. Men bevarandets representation får inte tvinga fram senare regelbrott när den oförändrade historiken ska granskas. Dessutom kräver h-016:s angivna arbetsflöde att sessionen inte committar sin kandidat själv, vilket behöver förenas med generella instruktioner om agentautocommit. Den senare integrationskonflikten är en kontrollfråga, inte ett observerat runtimefel i denna audit.

**Åtgärd:** håll kod och nödvändig dokumentation i samma logiska förändringsenhet enligt gällande kontrakt. Sammanjämka faktisk klassning med senaste auktoriserade regel. Prova hooks och automatisk bevaring i den riktiga worker-/utförarrollen så att proven inte pushar fixtures eller självcommittar fel kandidat.

**Stängning:** bevarande säkrar rätt innehåll utan att attestera, publicera eller sabotera taskens dokumentations- och kandidatkontrakt. Misslyckad remote-bevaring är synlig och kan inte uppfattas som lyckad bara för att en hookfil finns.

## AUD-09 — Inventeringen ger en vidare städningsfullmakt än den har täckning för

**Källor:** `inventera-lokalt-arbete.sh`, senaste `drift.md`. **Bevis:** källgranskning + T05/T06.

Den senaste rättningen av smuts_sakrad jämför faktiskt innehållsträd över radda-grenar; den gamla namn-buggen rapporteras därför inte som kvarvarande.

Kvarvarande problem: `klassa()` använder alla lokala remote-tracking-grenar för PA_REMOTE, men det är origin som har hämtats. T05 klassade ett lokalt objekt PA_REMOTE endast genom en referens för en annan remote, trots att ingen originreferens innehöll objektet.

Den fristående skanningen är avgränsad till .git-kataloger, djup och exakt originsträng. Bare-repon, remote-lösa repon, icke-Git-arbete och andra exkluderade ytor omfattas inte allmänt. Ignorerat innehåll redovisas men ingår inte i FARA. Trots det skriver slutgrenen att allt lokalt arbete finns på git och att städning kan ske utan förlust.

T06 visade den sista beslutsgrenen med rent normalt Git-status men en oregistrerad ignorerad evidensfil: resultatet tillät ändå förlustfri städning. **Inget raderades.** Den faktiska tidigare städningens dataförlust är inte fastställd här; driftunderlaget skiljer återskapbara sökvägar från ännu outredda saknade filer.

**Åtgärd:** begränsa beskedet till inventerad population och verifierad remote. Ta bort universell städningsfullmakt. Radering måste separat beakta ignorerat/icke-Git-innehåll, återställbarhet och sökvägar som fortfarande är beroenden. Utöka inte automatiskt detta till ett nytt allomfattande maskininventeringsprojekt.

**Stängning:** det går inte att få raderingsklartecken från ett prov som uttryckligen inte täcker det som ska raderas.

## AUD-10 — Mätverktygen överdriver bevisen och blandar körvägar

**Källor:** `matning-pa-macen.sh`, `helhetsbilden.sh`, `controller/verify/cli`, reglernas beviskontrakt. **Bevis:** källgranskning + T07.

Båda mätverktygen kör de fjorton med direkt bash. Matningsskriptet kör först verify/cli list, men detta gör inte efterföljande direkta bash-anrop till verifierade körningar genom authoritykedjan. Sådana direktanrop kan vara diagnostik, men ska inte ensamma bära kvalificerad slutdom.

Matningsskriptet etiketterar två plattformars nollskilda exitkoder som verkligt fel även när utfallet kan vara odömbart, vägran eller integritetsfel. Dess sista utskrift ger inte en sammanräknad taskdom som exitkod. Text som kallas full utdata är begränsad till de sista fyrtio raderna för avvikande grindar.

T07 visade att lika antal normala och ignorerade statusposter kan ge beskedet orört trots att en ignorerad evidensfils bytes ändrats. Antal statusrader är inte en innehållsjämförelse.

**Åtgärd:** märk diagnostik som diagnostik, använd rätt kvalificeringsväg och håll 0/1/2/3/4 åtskilda. Spara råresultat innan presentationen kortas. Påstå endast den restfrihet som faktiskt prövats med relevant mängd-/innehållskontroll.

**Stängning:** avbruten eller felaktig mätning kan inte producera giltigt slutkvitto; changed-content-fallet kan inte rapporteras som orört.

## AUD-11 — Samma fakta och befogenheter har fortfarande motstridiga uttryck

**Källor:** bilagan, VÄGEN, README, AGENTS, regler och beslutsloggen. **Bevis:** direkt lästa motstridigheter.

Bilagan säger på ett ställe att h-035 har förklarats och på ett annat att samma exit fortfarande är oförklarad. Den säger att specifikationsytan kräver ett snävt undantag medan senare huvudregler medger bredare kontraktsflöde. AGENTS/beslutslogg anger h-035 som avslutad i en trio där räddningsvägen anger h-039. VÄGEN förbjuder status utanför drift men innehåller ändå fasta lägestal. README pekar både på VÄGEN som enda ordning och på andra filer som arbetsorder.

Dessa ska inte lösas av en modell genom att den text som lästes sist vinner. En logg kan bära historik, men routing måste kunna skilja gällande beslut från upphävt.

**Åtgärd:** en samlad redaktionell och auktoriserad rättning av exekveringsingångarna; bevara historik som historik och undvik att återföra gamla webbkrav. Lägg inte ännu ett manifest ovanpå de befintliga.

**Stängning:** en kall session på den avsedda byggrevisionen hittar samma nästa uppgift, samma befogenhet och samma klart-när utan ägarens återberättelse.

## AUD-12 — Utvecklingssandbox och produktens hotmodell behöver åtskiljas

**Källor:** bilagans sandboxbeslut, AGENTS rollseparation, h-005-specen och substitutionskontraktets h-028. **Bevis:** kontrakt lästa; inga säkerhetsangrepp eller Darwinprov körda.

Att öppna ett yttre utvecklingsskydd är inte i sig bevis för att alla runtimegränser är borta. Det är inte heller bevis för att de kvarvarande skydden fungerar. AGENTS säger uttryckligen att rollseparation är workflow-separation, inte en mekanisk säkerhetsgräns. h-005 och h-028 innehåller fortfarande krav på verkställda gränser och containment.

**Åtgärd:** dokumentera vilket skydd som togs bort och vilka produktkrav som fortfarande ska vara uppfyllda. Behåll ägarens utvecklingsbeslut, men låt inte en saknad slutbevisning förvandlas till ett underförstått kravundantag. Bevisa relevanta skriv-, verifierar- och publiceringsgränser i den aktuella konfigurationen.

**Stängning:** bevisat obehörigt försök nekas av avsedd mekanism; en tillåten väg fungerar. Denna audit ger varken godkänt eller underkänt för den faktiska runtimeisoleringen.

## Två observationer som inte bör bli nya projekt

**Tvårotshypotesen.** Grenens historiska förbättring 48→24 avvikande kontroller är användbart stöd för att inte bygga om redan utfört arbete. Det är inte fullständig kausal bevisning att samtliga återstående fel har två orsaker. Behåll den som arbetshypotes med nya resultat efter respektive lagning.

**Grindar mot dokumentation.** En sökväg som inte förekommer bokstavligt i ett prov kan ändå användas indirekt. En allowed_write-sökväg kan vara en planerad utdatafil som ännu inte ska finnas. Ersätt inte täckningsanalys och in-/utdatatyper med ett generellt grepkrav; det skulle skapa nya falska stopp.

## Föreslagen avgränsad återgång till bygget

Detta är förändringsförslag att föra in i VÄGEN, inte en parallell fasplan.

**A. Reparera besluten.** AUD-01–03 och 09–10: sanningsenliga start-/slut-/bevarandebesked, rätt bevisväg och kontroller som inte fäller av legitimt framsteg. Få negativa/positiva beteendeprov, inte fler lager av statusprosa.

**B. Reparera övergången.** AUD-04, 08 och 11: granskad integration, auktoritets- och sökvägssammanjämkning samt bevarande som följer samma kontrakt. Verifiera det som nästa agent faktiskt checkar ut.

**C. Slut det redan beslutade kontraktet.** AUD-05–07 och 12: tydlig full beroendekoppling inklusive h-017, explicita substitutionsleveranser, förhandsfryst v1-acceptans och kontroller av befintliga återfallsskydd. Utred befintliga auktoritetskonflikter genom rätt roll, inte genom att silently ändra scope.

När startförutsättningarna för nästa avgränsade uppgift är sanna fortsätter bygget enligt korrigerad VÄGEN. **En röd kernel är tillåten under byggarbete. Ett falskt grönt start- eller slutbesked är inte det.**

Slutrapport per paket: kandidat-SHA, auktoritets-/grindrevision, reproducerat problem, ändring, positiva/negativa kontrollutfall och faktisk körmiljö. Kvarstående produktbrister ska vara synliga men får inte automatiskt förvandlas till startblockerare för oberoende rättningsarbete.
