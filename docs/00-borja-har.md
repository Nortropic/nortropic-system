# Börja här — Nortropic från noll

Senast verifierad mot systemet: 2026-08-07 · v17 (denna commit)
Verifieringsomfång: delta-verifierad mot systemändringarna sedan 2026-07-30 (BATCH-001–004BE: check-invariants.mjs INV-001–005, verify-suite doctor 1–13 + OGILTIG-status, design-reviewer Bash→BLOCKED, NRT-007-blocket i agenterna, docs/100-dagar); 0 påståenden i denna fil ogiltigförklarade. Basstämpeln 2026-07-30 sattes av [AUTO-N1] 64acf9f och är inte oberoende granskad.

Det här är ingången för dig som aldrig sett systemet förut. Läs den i ett svep, så förstår du vad Nortropic är och hur det hänger ihop — utan en enda insider-term. Det här dokumentet ersätter inte den tekniska dokumentationen (docs/01–07 och README); det är kartan du läser innan du dyker ner i den. Vill du veta exakt hur något fungerar finns länkar sist.

## Fabriken

Tänk dig en liten fabrik som bygger färdiga hemsidor åt svenska småföretag — rörmokare, frisörer, hunddagis, elektriker. Du matar in ett papper med fakta om kunden i ena änden, och ut kommer en färdig, granskad hemsida i andra änden. Fabriken sköter det mesta av arbetet själv; du (ägaren) fattar de viktiga besluten vid några få kontrollpunkter. Det är byggt för en person som kör en kund i taget.

## De 7 robotarna

Fabriken har sju robotar. Var och en är riktigt bra på EN sak och gör bara den:

- **Planeraren** (project-planner) — läser kundpappret och gör upp strategin: vilka sidor sajten ska ha, vad den ska få besökaren att göra, och hur den ska se ut.
- **Byggaren** (stack-builder) — snickrar ihop själva sajten enligt planen: skapar kodförrådet, bygger sidorna, kopplar in kontaktformuläret.
- **Textförfattaren** (content-designer) — skriver all svensk text i kundens ton, så den låter mänsklig och inte som en robot.
- **Design-granskaren** (design-reviewer) — tittar kritiskt på utseendet och säger till om något ser generiskt, billigt eller "AI-gjort" ut. Den jämför mot ett litet bibliotek av världsklass-exempel så den vet vad "riktigt bra" faktiskt betyder — exemplen är måttstock för nivån, aldrig mallar att kopiera.
- **SEO-roboten** (seo-optimizer) — ser till att kunden går att hitta på Google när någon söker "[tjänst] i [stad]".
- **Kontrollanten** (qa-launcher) — den sista besiktningen före lansering: funkar telefonknappen, kommer offertmejlet fram, är sajten snabb och trygg?
- **Förmannen** (nortropic-steward) — robotarnas egen chef. Bygger inga kundsajter, utan håller de andra sex robotarna skarpa och föreslår förbättringar av själva fabriken.

## Stafettloppet

En kund går genom fabriken som ett stafettlopp — pinnen skickas från steg till steg. De tre ställen där **DU** måste kliva in är fetmarkerade:

```
Kundpapper (research)  →  Planeraren gör strategi  →  DU GODKÄNNER STRATEGIN (kontrollpunkt/nod 3)
   →  Byggaren bygger sajten  →  Textförfattaren skriver texterna
   →  Granskning (design + SEO + kod)  →  De 7 portarna/grindarna
   →  DU SIGNERAR JURIDIKEN (nod 8)  →  Lansering  →  DU trycker publicera
```

Robotarna gör allt däremellan. Du behövs bara vid strategigodkännandet, juridiksigneringen och den slutliga publiceringen — de besluten får en maskin aldrig ta åt dig.

## Vakterna vid portarna

Innan en sajt får lanseras måste den passera sju portar — som vakter som säger **STOPP tills det är bra nog**. De kontrollerar sådant som: att telefonknappen faktiskt ringer, att offertformuläret verkligen skickar ett mejl som kommer fram, att sajten laddar snabbt, att den funkar på mobilen, att den följer lagen. En sajt som inte klarar en port släpps inte vidare. Grindarna sänks aldrig för att få igenom något — de är själva kvalitetsgarantin.

## Grundlagen

Överst står en grundlag (konstitutionen) — regler som robotarna **ALDRIG får ändra själva**, hur smarta de än blir. Till exempel: aldrig ljuga om en kund, aldrig hitta på betyg eller certifikat som inte finns, och juridiska bedömningar får bara en människa göra. Grundlagen skyddar kundernas förtroende. Bara du, ägaren, får ändra den — och bara medvetet, aldrig i förbifarten.

## Fabriken städar på natten (v15)

Fabriken kan förbättra sig själv lite i taget — den "städar på natten": rättar små fel i sin egen dokumentation, putsar formuleringar, lär sig av gårdagens jobb. Men bara **småsaker**, aldrig grundlagen och aldrig kvalitetskraven. Allt den ändrar skrivs upp på en lapp (digesten) som du läser efteråt, så du alltid ser vad som hänt. Och det finns en strömbrytare: självstädningen är avstängd tills du själv slår på den.

## Fabriken kan bygga själv (v16)

För enkla eller gratis-jobb kan fabriken köra hela vägen på egen hand — från kundpapper till en färdig förhandsversion — utan att stanna och fråga dig vid varje steg. Den samlar i stället ihop alla frågor och saknade fakta till EN slutlista som du betar av. Men den **publicerar aldrig själv**: juridiksigneringen och den sista publicera-knappen trycker alltid en människa. Och stöter den på något som påverkar riktningen eller kräver ett juridiskt beslut, stannar den och lämnar över till dig.

## Förmannen som inte är en robot (loopen)

Fabriken bygger hemsidor, men kan inte förbättra sig själv utan att du står bredvid och
puttar vid varje steg. Loopen är ett litet program — inte en robot — som tar bort
puttandet: det läser nästa uppgift ur 100-dagarsprogrammet, startar en färsk robot som
gör exakt den uppgiften i ett eget rum, kontrollerar mekaniskt att den höll sig innanför
ramarna, och lägger fram resultatet för dig att godkänna. Det bygger och förbättrar bara
fabriken — kundflödet rör det aldrig, och grundlagen ([07-konstitution.md](07-konstitution.md))
rör bara du. Planen står i [docs/loop/byggplan-v3.md](loop/byggplan-v3.md), och hur du
kör den står i [docs/loop/drift.md](loop/drift.md).

## Tre Codex-arbetsroller

När kontrollplanet förbättras kan Codex nu delas upp i tre återanvändbara arbetsroller:
en som förbereder den frysta kontrollen, en som bygger kandidaten och en som försöker
fälla den efteråt. De körs i separata trådar/worktrees för att minska sammanblandning.

Det är **arbetsseparation**, inte en ny grundlag eller säkerhetsmekanism. Den riktiga domen
kommer fortfarande från Nortropics frysta tester, write-gränser och ägarens slutkontroll.

## Vakten som läser förslaget innan du gör det

Grundlagen har hittills skyddats av att den står skriven — inte av något som hindrar en
maskin från att ändra den. Nu finns en vakt: innan loopen ens visar dig ett förslag läser
den igenom exakt vilka filer förslaget rör. Rör det grundlagen, kvalitetsmåtten eller
någon annan skyddad fil säger vakten nej på en gång, skriver ner vad som hände, och du får
aldrig se förslaget som något att godkänna. Den säger också nej om ett förslag är mycket
större än det ska vara, eller om det ändrar systemet utan att uppdatera beskrivningen av
systemet i samma andetag. Vakten kan bara stoppa förslag — den kan aldrig släppa igenom
något åt dig. Den sista knappen är fortfarande din.

## Vill du djupare?

Det här var översikten. Vill du förstå exakt hur något fungerar, fortsätt till det tekniska lagret:

- [docs/00-guide.md](00-guide.md) — operatörsguiden: hur du kör systemet steg för steg, och varför det ser ut som det gör.
- [docs/01-oversikt.md](01-oversikt.md) — nodkartan (alla tolv steg), de hårda stoppen och artefaktkedjan.
- [docs/02-agenter.md](02-agenter.md) — de 7 robotarna i detalj: roll, modell, obligatoriska steg.
- [docs/03-regelverk.md](03-regelverk.md) — systemets hårda regler, var och en med motiv och källa.
- [docs/04-justeringskarta.md](04-justeringskarta.md) — vad varje större val kostar och köper, om du vill skruva.
- [docs/05-beslutslogg.md](05-beslutslogg.md) — beslutsloggen: varför systemet blev som det blev.
- [docs/06-scope.md](06-scope.md) — vad fabriken bygger, vad den bygger på begäran, och vad den säger nej till.
- [docs/07-konstitution.md](07-konstitution.md) — grundlagen i sin helhet: vad som aldrig får självmodifieras.
- [README.md](../README.md) — repots ingång med hela nodflödet i en tabell.

<!-- CODEX-BUILD-AUTOPILOT-V2-SIMPLE -->
## Kontrollplansbygget kan nu köras obemannat

`scripts/nortropic-codex-autopilot.py` kan driva redan owner-auktoriserade loop-tasks genom test-author/builder/reviewer, remediation och mekaniskt verifierad PR/merge utan att ägaren kopierar rapporter mellan terminaler. Denna **build-autopilot är inte rotfilen `AUTOPILOT`**; rotfilen styr den äldre självförbättringstrappan och lämnas orörd.

Autopiloten stoppar endast när den inte längre kan döma nästa trust-transition från befintlig owner authority, exempelvis ny arkitekturfråga, odömbart gateutfall eller oväntad Git-identitet.

<!-- CODEX-BUILD-AUTOPILOT-V3-SIMPLE -->
## Kontrollplansbygget kör nu hela roadmapen

Build-autopilot v3 stannar inte längre när dagens lista av redan frysta h-tasks råkar bli grön. Den använder den ägarlåsta autonoma loop-planen och fortsätter genom S2, S4–S13 och en empirisk obevakad slutkörning. För en ännu ofryst slice kör den själv architect → test-author → gate-review → builder → independent review/remediation → mekanisk final gate → PR/merge.

Vanliga arkitekturfrågor går till en read-only Codex-architect, inte tillbaka till ägaren. En människa behövs bara när högre authority uttryckligen kräver människa eller när en extern trust-resurs inte kan provisioneras utan att kontraktet försvagas.

För liveöverblick i VS Code/Codex-terminalen:

```bash
tail -F "$HOME/Library/Logs/Nortropic/codex-autopilot-v2.log"
"$HOME/.local/bin/nortropic-codex-autopilot" status
"$HOME/.local/bin/nortropic-codex-autopilot" roadmap
```

LaunchAgentens historiska `v2`-label/loggsökväg behålls avsiktligt vid v3-cutover för att inte skapa en andra supervisor; den versionerade executable som strömmas från `origin/main` är v3.

Den ägarlåsta planen har en verklig extern förutsättning före S7: den dedikerade GitHub Appen **Nortropic Promoter**. Den är inte ett “owner decision” utan en extern trust-credential som v3 inte får låtsas finns eller ersätta med ditt vanliga GitHub-konto. Om den saknas när S7 nås stoppar v3 en gång med `HUMAN_AUTHORITY_HARD_STOP`; efter att appen provisionerats fortsätter du med `nortropic-codex-autopilot resume`.


### Följ autopiloten live

I valfri integrerad terminal (VS Code/Codex eller Terminal.app):

```bash
~/.local/bin/nortropic-codex-autopilot watch
```

Detta är en read-only observatör. `Ctrl-C` stänger bara vyn; LaunchAgent-autopiloten fortsätter.
`roadmap` kör en djupare gate-status och bör användas vid behov, inte som 2-sekunders livevy.

<!-- PROVIDER-NEUTRAL-TRUST-KERNEL-V1 -->
## Arkitekturen har smalnats av: providerhjärna, Nortropic-domare

Nortropic är fortsatt en autonom hemsidefabrik. Claude/Codex är utbytbara intelligenta arbetare; Nortropic ska inte bygga en andra Claude/Codex-harness om providern redan äger session/context/tools/retries.

Det som **inte** delegeras är Trust Kernel: task authority, allowed_write, G20, candidate-SHA, policy, frozen verifier/gate, attestation, stale/fencing, recovery och promotion/main-transition.

Kanoniskt owner-kontrakt: `docs/loop/harness-substitution-contract-v1.md`.

Efter S3 h-003/h-004 byggs SUB-1…SUB-4 före återstående S2/S4–S13. Verkstadsgolvet blir senare kontrollrummet över den verkliga event/read-projektionen men aldrig trust authority.

<!-- R1-REPO-NATIV-FABRIK -->
## Fabriken bor nu i repot (S0/R1, 2026-08-24)

Fabriken körs nu på den här Macen, och dess hem är GIT-REPOT SJÄLVT — inte någon särskild
mapp på datorn. Varje verktyg som behöver fabriken hittar den genom att fråga git var
repot börjar, och kontrollerar att det verkligen ÄR rätt repo (rätt GitHub-adress, grundlagen
och strömbrytaren på plats) innan något används. Gissa aldrig var fabriken bor.

Två saker till hände samtidigt: (1) det gamla skrivbordets arbetsmaterial (`~/Workflow`) är
PENSIONERAT — de gamla "facit-sajterna" som kvalitetsnätet jämförde mot är nu historiska
dokument, inte bevis, och nya facit klipps av dig enligt `tests/fixtures/FIXTURE-REGIME-
CHANGE-2026-08-24.md`; tills dess säger kvalitetsnätet ärligt "väntar på ny regim" i stället
för grönt. (2) Fabrikens kladd och löpande anteckningar (förslag, digest, usage-logg) bor nu
i `~/.nortropic/factory/` — anteckningar är inte kunskap, så de bor utanför repot.

## Fabriken börjar föra anteckningar om sig själv (S1-min + K4, 2026-08-25)

Fram tills nu kunde fabriken bygga sajter — men den kunde inte svara på frågan "blir vi
bättre?" Den här ändringen ger den fyra enkla anteckningsböcker, och inget mer. Inga
mätpaneler, inga automatiska system, ingen ny nattkörning: fyra dokument som en människa
fyller i.

**1. En mognadslista.** I `docs/06-scope.md` står nu vad varje paket klarar, med fem
lägen: beskrivet · byggt · under prövning · bevisat · medvetet utanför. Vårt enda paket
idag (svenska lokala företag) står på UNDER PRÖVNING — och kan inte nå "bevisat" på
övningar, bara på två riktiga kunder i rad som gått bra. Simulering ger skala,
verkligheten ger sanning.

**2. En lärdomsbok per kund** (`LEARNING-RECORD.md`, fylls på tio minuter i den månatliga
genomgången). Där skrivs vad vi TRODDE skulle hända (den hypotesen står numera sist i
kundens överlämningsdokument), och sedan vad som faktiskt hände — i råa antal, aldrig
procent, för procent på dussintals besök är påhitt med decimaler. Tre saker hålls isär:
fungerar sajten · klarar besökaren sitt ärende · får kunden affär. Det är tre olika
frågor, och en grön bock på den första har aldrig svarat på de andra två.

**3. En erfarenhetssektion i systemets egen rapport.** Efter varje projekt skriver
förmannen ned vad som gick fel, vad kunden rättade oss om, och vilka lärdomar som är
KANDIDATER. En lärdom blir aldrig en regel för att den kändes klok en gång — den måste
synas hos en andra kund först.

**4. En kursplan och ett kompetensregister** (`docs/kursplan.md`, `docs/kompetensregister.md`).
Kursplanen säger vad varje roll LADDAR för ett jobb — det den alltid kan, plus det som
bara gäller vissa kunder. Registret säger vad vi kan BEVISA att vi är bra på. Två regler
håller dem ärliga: en modul som ingen citerat på två projekt i rad föreslås bli
"hämtas vid behov" i stället för alltid-laddad (kontexten växer bara mot belägg), och
registret får inte skriva "bevisat" på övningar — bara riktiga kunder räknas. Registret
är med flit nästan tomt: vid en enda datapunkt är "går inte att bedöma" det ärliga
svaret, och ett register som ser välfyllt ut när bevis saknas ljuger.

Den viktigaste regeln i hela ändringen är var lärdomsboken INTE får användas: den får
aldrig avgöra om något godkänns. Så fort siffror från verkligheten får bestämma vem som
blir befordrad, börjar någon jaga siffran i stället för kvaliteten. Anteckningarna är
till för att TÄNKA med, inte för att grinda med.

## Researchen får ett kontrakt (S1, 2026-08-25)

Research är steget där vi tar reda på fakta om en ny kund innan något byggs. Fram tills
nu bodde frågelistan i kontrollrummets app — och en frågelista som bor hos den som
använder den kan ändras utan att någon märker det. Nu finns EN kanonisk lista i
systemrepot. **Halva jobbet är gjort i den här ändringen:** listan, paketmodulen, låset
och proven finns — men kontrollrummets app har ännu INTE kopplats om till dem, så den
bär fortfarande sin egen kopia. Den omkopplingen är ett eget steg i ett annat repo, och
tills den är gjord är det bara systemrepot som har den sanna listan.

**Ryggraden är sjutton punkter** som alltid är desamma och alltid numrerade lika: vilka
de är och hur man når dem, vad de erbjuder, vilka som besöker, vad besökaren kommer för
att göra, var de finns, vilka bevis på förtroende som finns, vilket innehåll och vilka
bilder, hur de låter, om pengar eller persondata är inblandade, vilka tjänster de
använder, juridiska observationer, konkurrenter, designreferenser, vad kunden vill ska
hända, kapacitetssignaler, öppna frågor — och sist en maskinläsbar kontrollrad.

**Paket får skärpa, aldrig lätta.** Svenska lokala företag (`lokal-se`) kräver till
exempel telefonnummer och minst en belagd ort. Ett paket kan lägga till krav; det kan
aldrig ta bort ett universellt krav. Och om vi bara GISSAR vilken bransch det är kör vi
grundlistan — en gissning aktiverar aldrig ett paket.

**Färskhet får bara komma in en väg:** någon upptäcker en ändring → den blir en kandidat
→ den verifieras → en människa godkänner. Aldrig "hämta senaste versionen" vid körning.
Den som använder kontraktet ska låsa fast en version och en kontrollsumma och vägra köra
om summan inte stämmer — hellre stopp än att bygga på en text ingen granskat. Låset och
dess prov finns nu; i dag är det ett kommando en människa kör, inte något som sitter i en
grind. Att sätta det i en grind hör till ett senare steg.

Det viktigaste ordet i hela kontraktet är fortfarande `[OSÄKER]`. Det vi inte kan belägga
markeras, räknas och syns i kontrollraden. En ofullständig research som SER komplett ut
är dyrare än ingen research alls.

## Fabriken frågar först: behöver du ens en ny sajt? (S3, 2026-08-25)

Fram tills nu började planeringen med antagandet att svaret var en ny webbplats. Nu inleds
den — direkt efter att researchen visat sig komplett nog — med ett **interventionsbeslut**: läs vad kunden redan har, och avgör vad som
faktiskt löser problemet. Fyra svar är tillåtna — bygg nytt · förbättra det befintliga ·
gör något som inte är en sajt alls (svara i telefon, fixa Google-profilen, ändra priset)
· eller avråd, för vi är fel leverantör. **Systemet måste kunna säga att en ny sajt inte
är det du behöver.** En byrå som aldrig kan säga det säljer alltid en sajt.

Två skillnader hålls isär genom hela planeringen, för att de ständigt blandas ihop:
vad KUNDEN vill ha är inte samma sak som vad BESÖKAREN behöver, och att företaget får
fler leads är inte samma sak som att besökaren klarade sitt ärende.

**Kapacitetskatalogen** (`docs/kapacitetskatalog.md`) listar vad fabriken kan leverera
OCH bevisa — varje rad har en signal som gör den relevant, ett krav som går att pröva,
och en plats där beviset finns. Två rader står som "medvetet utanför" (e-handel och egen
inloggning): de saknas inte, de hänvisas bort — hela nej-listan, inklusive föreningssajter,
står i ringmodellen i `docs/06-scope.md`. Behöver ett jobb en
kapacitet som inte är byggd **stannar planeringen** — den planerar aldrig vidare på
något som inte finns. Ingen rad står som "bevisad" ännu, eftersom det kräver riktiga
kunder.

**Branschprofilerna har flyttat hem.** De bodde i en mapp utanför repot
(`~/Workflow/profiler/`) som pensionerades i somras; nu bor de i paketets egen
strategimodul (`packs/lokal-se/strategi/`), där de versioneras och granskas som allt
annat. Mappen är avsiktligt tom: profiler skrivs när riktiga kunder visar vad som
återkommer.

Och en regel som sparar pengar: **en vanlig leverans får inte samla på sig extra
ceremoni utan ett namngivet skäl.** Varje extra kontroll måste peka på vad den skyddar
mot — annars är den kostnad utan skydd.

## Sajtens kvalitetskontrakt bor i EN fil (S4, 2026-08-25)

Varje kundsajt har en fil, `content/profile.ts`, som säger vad just den sajten lovar:
vilken primärhandling den driver, vilka kvitton den får luta sig mot, vad den ALDRIG
får påstå, vilka resor som måste fungera, vad kunden vill ska hända och var varje
uppgift har sitt belägg. Grindarna och granskningen läser den filen — de kan inte läsa
briefen, så det är hit allting transporteras.

**Det finns med flit ingen andra fil.** Ingen sido-JSON, ingen parallell kapacitetsplan,
ingen separat användarprofil. Två filer om samma sajt glider isär, och glidningen märks
först när en grind dömer mot fel fil.

**Gamla sajter fortsätter fungera.** Kontraktet är nu version 2, men en sajt byggd mot
version 1 är fortfarande giltig — ingen grind underkänner en sajt bara för att den är
äldre. Saknas ett av de nya fälten läses det som *"det vet vi inte"*, aldrig som *"nej"*.
Skillnaden är viktig: en frånvaro är okunskap, inte ett påstående kunden gjort.

**Vallgraven står kvar, nu utskriven i kontraktet.** Frågan är mekanisk: håller
sajtrepot något tillstånd som du måste förvalta? Är svaret ja är det inte en
Nortropic-sajt — det är en mjukvaruprodukt, och den hänvisas vidare. Att kunden
använder en extern bokningstjänst som sajten länkar eller bäddar in bryter INGENTING:
tillståndet bor då hos tjänsten, inte hos oss. Poängen är säkerhet, inte renlärighet —
en sajt utan eget tillstånd kan inte läcka uppgifter den aldrig haft, går inte sönder
av en migrering och väcker ingen mitt i natten.

**Bygget delas i två lager.** Kärnan byggs alltid. Det paketspecifika — för svenska
lokala företag är det ortssidorna — byggs bara när paketet faktiskt är belagt. En sajt
utan ortssidor är därför ibland helt korrekt, inte en lucka någon glömt.
