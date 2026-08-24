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
