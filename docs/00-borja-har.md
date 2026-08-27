# Börja här — Nortropic från noll

Senast verifierad mot systemet: 2026-08-26 · v18 (denna commit)
Verifieringsomfång: delta-verifierad mot S1–S4 + K0–K4 (publicerat i `main` t.o.m. PR #130) i S9-konsolideringen; avsnittet "Dokumentationen hann inte med bygget" tillagt och skrivet mot README, `docs/01-oversikt.md`, `docs/00-guide.md` och `scripts/check-docs-coherence.mjs`. **S5 är nu inräknad** — mergad i samma batch som denna stämpel (PR #129). Basstämpeln 2026-07-30 sattes av [AUTO-N1] 64acf9f och är inte oberoende granskad. Avsnittet om betygssystemets utkast (2026-08-26) är skrivet mot `docs/utkast/eval-rubrik-v4-UTKAST.md` och `scripts/check-v4-utkast.mjs`; det beskriver ett UTKAST utan konsument — ingen mätning i drift har ändrats.

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

## Två låtsaskunder som ska bevisa att fabriken inte gissar (S7/S8, 2026-08-26)

Fabriken är byggd för svenska lokala företag men ska klara vilken kund som helst. Det är
lätt att säga och svårt att veta. Ett antagande som råkar stämma för alla kunder du haft
ser likadant ut som en sanning — ända tills det inte gör det.

Därför finns nu två påhittade kunder i `backtests/`:

**Ekbergs Rör i Uppsala** — en rörmokare, precis den sortens kund fabriken byggdes för.
Hen finns för att BEVARA: om fabriken blir mer allmän får den inte samtidigt bli sämre på
det den redan kunde. Till den kunden hör en lista på tio medvetet inbyggda fel — fel
telefonnummer i sidfoten, en ortssida som bara är en annan ortssida med namnet utbytt, ett
påstått dygnet-runt-jour som kunden inte har — och för varje fel står det i förväg vem som
ska upptäcka det.

**Kadensa i Malmö** — ett mjukvaruföretag som säljer schemaläggning till åkerier i hela
Norden. Hen är **med flit fel** för allt fabriken brukar anta: kontoret i Malmö är en
adress och inget upptagningsområde, det finns inga ortssidor att bygga, ingen Google
Företagsprofil att fylla i, inga stjärnbetyg, och besökaren ska boka en demo — inte ringa
och inte begära offert. Om fabriken behandlar Kadensa som en rörmokare syns det direkt.

**Och här är det viktiga:** att inte göra fel räcker inte. Kadensa räknas som godkänd
först när fabriken både låter bli att bygga det lokala OCH faktiskt bygger det rätta —
produktinnehåll, integrationer, säkerhetssidan, demobokningen.

**Vad som INTE är gjort:** ingen av de här kunderna har körts genom fabriken. Det som
finns är underlaget och facit — vad som ska hända, skrivet i förväg så att det går att ha
fel. En kontroll (`scripts/check-backtest-fixtures.mjs`) prövar att underlaget har rätt
form, och den skriver själv ut hur många frågor som ännu är obesvarade. **Ett förberett
prov är inte ett godkänt prov**, och kontrollen är byggd för att aldrig kunna läsas som om
det vore det.
## En form för paketen — och ett bygge som drogs tillbaka (2026-08-26)

Fabriken har en **kärna** som gäller alla kunder och ett **paket** ovanpå för den kundtyp
man bygger åt. Problemet var att det bara fanns ETT paket — och ett enda exempel är ingen
form, bara ett exempel. Nästa paket hade ärvt vad som råkade stå i det första.

**Därför finns nu en skriven form.** `docs/paketkontrakt.md` säger vad ett paket måste
bestå av och vilka regler det aldrig får bryta. En kontroll prövar varje paket mot den, och
det befintliga paketet används som facit: klarar inte `lokal-se` sitt eget kontrakt är
kontraktet fel, inte paketet.

**Fem nya paket påbörjades — och drogs tillbaka.** Hälsa, livsmedel, finans, barn som
målgrupp, alkohol/tobak: precis de fem kundtyper där lagen ställer extra krav. Avsikten var
att bygga strukturen och frågorna, men aldrig vad lagen kräver — det sistnämnda kräver en
jurist eller en myndighetstext, inte en gissning.

**Den gränsen höll inte.** En oberoende granskning visade att juridiken smugit in på minst
fem ställen. Det tydligaste: en rad sa *"saknas samtycke är bilden inte användbar — det är
en observation, inte en bedömning."* Men "bilden är inte användbar" ÄR en bedömning av
rättsläget. Observationen är bara att samtycke saknas; resten hör till dig.

Orsaken är strukturell och värd att förstå: **att välja vilka frågor som ska ställas kodar
redan en uppfattning om vad som är juridiskt viktigt.** Det går inte att bygga "bara
frågorna" åt en reglerad bransch utan att samtidigt bygga en tyst teori om lagen. Ett
skelett som bär en sådan teori är sämre än inget paket alls, för det ser färdigt ut.

**Paketen byggs den dag det finns en namngiven källa per flagga.** Formen finns redan —
bygget blir litet när underlaget finns. Det är en ordningsfråga, inte ett nej.

## Kärnan var inte så universell som vi trodde (2026-08-26)

Fabriken beskrivs som **universell i kärnan, specialiserad i paket**: kärnan gäller alla
kunder, paketet gäller en kundtyp. Det visade sig inte stämma.

Låtsaskunden Kadensa — mjukvarubolaget som med flit är fel för alla lokala antaganden —
gick inte att fylla i utan att svara fel. När vi frågade varför visade det sig att
**kärnan själv bar antaganden om lokala företag**:

- Frågeformuläret krävde **F-skatt** som förtroendebevis av ALLA kunder. Ett mjukvarubolag
  som säljer till åkerier blir aldrig bedömt på F-skatt — köparen frågar aldrig.
- Det krävde **belagda arbetsområden**, så en kund som säljer i hela Norden tvingades
  svara "vi har inga orter" i stället för att beskriva sin faktiska räckvidd.
- Det bad om **tre lokala konkurrenter**, när det verkliga alternativet ofta är Excel.
- Och listan över vad besökaren ska göra på sajten hade **fem alternativ, alla från
  hantverksvärlden**: ring, boka tid, platsförfrågan, offert, besök. **Det fanns inget
  "boka demo".** Så en kund vars hela affär är demobokningar fick knuffas in i "boka tid".

Det sista är värt att stanna vid, för det fanns en kontroll som skulle fånga just det —
att en demobokning aldrig får förvandlas till ett offertformulär. **Kontrollen kunde aldrig
falla, eftersom systemet inte hade något "demo" att förvandla.**

**Vad som gjorts:** de kraven har flyttats från kärnan till lokalpaketet, ord för ord
oförändrade. En rörmokare möter alltså exakt samma krav som förut. Skillnaden är att en
kund som INTE är lokal slipper dem. Listan över vad besökaren ska göra har fått fyra nya
alternativ — demo, prova, ladda ner, kontakt — och lokalpaketet smalnar tillbaka till sina
fem.

**Och en vakt ser till att det inte kryper tillbaka.** Den faller både om ett krav
återvänder till kärnan OCH om ett krav försvunnit ur båda — för det vore inte en
uppstädning, det vore ett bortglömt krav.

**Ärligt om gränsen:** vakten bevakar sex namngivna saker. Att kärnan nu är universell i
stort är inte bevisat — bara att de sex är på rätt plats.

## Regler för hur fabrikens robotar får byta hjärna (2026-08-26)

Robotarna drivs av olika AI-modeller. Förr eller senare kommer en nyare modell, och frågan
blir: är den bättre? Det låter enkelt och är det inte — för den som svarar på frågan är
samma system som ska bytas ut.

**Därför finns nu skrivna regler**, hämtade ur den frusna planen: elva lagar för hur en
sådan jämförelse får gå till. De viktigaste i klartext:

- **Eleven får inte flytta målstolparna.** Facit ligger i skyddade filer som bara du kan
  ändra. Jämförelsen läser dem; den kan inte skriva om dem.
- **Räkna först, tyck sen.** Det som går att mäta med en siffra ska mätas så. En
  bedömning får bara användas där ingen siffra finns.
- **Oenighet bevaras.** Om två bedömare tycker olika blir svaret "oense" — aldrig ett
  medelvärde som döljer att de var det.
- **Slut budget är inte godkänt.** Att pengarna tog slut betyder att provet inte gick att
  avgöra, inte att det gick bra.
- **Jämförelsen befordrar aldrig.** Den lämnar ett underlag. Beslutet är ditt.

**Och en ärlighet som är hela poängen:** av elva lagar går bara fem att kontrollera
mekaniskt. Tre handlar om bedömningar en maskin inte kan göra, och tre kan bara kontrolleras
till formen — att rapporten har rätt rubriker, inte att det som står under dem verkligen
hände. Det står utskrivet i kontraktet, och en kontroll faller om någon senare skulle
skriva om en svår lag till en lätt.

**Vad som INTE är byggt:** det finns ingen körbar jämförelse ännu. Att köra en kostar
pengar, och taket är ditt beslut. Det som finns är reglerna och en kontroll som vaktar dem.

## Paketet är nu en riktig paketering (2026-08-27)

Ett "paket" hos oss ska vara en **namngiven sammansättning av förmågor** — som en
utrustningsnivå på en bil: du ska kunna se exakt vad som ingår. **Vårt lokalpaket kunde
inte det.** Manifestet pekade på förmågelistan i allmänhet och sa inte vilka rader som var
paketets.

**Nu står det utskrivet, med tre roller:**

- **ÄGER** — förmågan har ingen mening utan paketet (lokal sökoptimering).
- **SKÄRPER** — förmågan gäller alla kunder, men paketet kräver mer (t.ex. att omdömen
  alltid visas med exakt antal, inte bara betyget).
- **ÄRVER** — gäller oförändrad.

**Den tredje raden är den som är lätt att hoppa över, och den viktigaste.** Om en förmåga
som gäller oförändrad bara utelämnas går det inte att skilja *"den gäller som vanligt"* från
*"någon glömde den"*. Tystnad är inget svar.

**Och paketets granskningskontroller ägs nu av paketet.** Förut låg de inbakade i
granskningsmaskineriet, så ett andra paket inte kunde tillföra en egen. Nu är paketet
källan och maskineriets tabell **genereras** ur det — en handredigerad tabell går inte
längre att checka in.

**En sak att veta:** manifestet är en skyddad fil som normalt bara ändras av dig. Jag har
ändrat den på din uttryckliga instruktion, och ändringen är märkt HÖGRISK så den syns i
historiken.

## Regler som bodde på fel ställe (2026-08-27)

Två saker som såg färdiga ut visade sig ligga fel — och båda av samma skäl.

**Det första: vårt lokalpaket ägde inte sina egna kontroller.** När fabriken granskar en
lokal sajt tittar den extra på ortssidor, Google-profilen och jourlöften. De tre
kontrollerna hörde till paketet — men låg **inbakade i granskningsmaskineriet** i stället
för i paketet. **Följden är att ett andra paket inte kan tillföra en egen kontroll utan att
någon går in och ändrar i maskineriet.** Ett paket som inte bär sina egna delar är inte
riktigt ett paket.

Paketet listar dem nu själv, och en kontroll fäller om listan och maskineriet börjar säga
olika saker — **åt båda hållen**, så en kontroll inte kan läggas till på ena stället och
glömmas på det andra.

**Det andra: jag hade beskrivit ett problem fel.** Jag har skrivit att regeln om gamla
kundsajter — att tomhet betyder *"vi vet inte"* och aldrig *"nej"* — inte används av någon.
**Det stämde inte.** Regeln står i båda granskningsmaskinerierna och i tre andra filer.
Det som faktiskt saknades var något som hindrar den från att **tyst falla bort** nästa gång
någon skriver om texten. Det finns nu.

**Och en läxa om kontroller:** min första version krävde att regeln skulle stå med *exakt*
en viss formulering — och fällde då en fil som redan gjorde helt rätt, med andra ord. **En
kontroll som kräver en formulering tvingar fram sämre text i en fil som var rätt.** Den
prövar nu innebörden.

**Ärligt om gränsen:** paketets lista är en *spegel* av maskineriet, inte en koppling till
det. Maskineriet läser fortfarande inte paketet — att ändra det rör en skyddad yta och är
ditt beslut.

## Reglerna för att förbättra någon annans sajt (2026-08-27)

Ett av provfallen — Alvestas Måleri — slutar med att vi säger *"vi bygger inte nytt, vi
förbättrar det som finns"*. **Men det fanns inget arbetssätt att hänvisa till.** Systemet
skickade kunden vidare till en dörr som inte fanns bakom.

**Nu finns reglerna.** Och de handlar mest om vad man INTE får göra, av ett skäl:

**En förbättring är svårare än ett nybygge, för den har något att förstöra.** Alvestas
ligger tvåa på sin viktigaste sökning och har fyra års upparbetat värde. Frestelsen att
bygga nytt och lägga in vidarelänkar är stark — nybygget är det vi är bra på, och det ser
bättre ut i en före/efter-bild. **Kostnaden syns inte förrän placeringarna börjar röra sig,
och då är den svår att koppla tillbaka.**

**Två regler bär hela dokumentet:**

- **Den som vill ÄNDRA något ska motivera det — inte den som vill behålla.** Saknas skäl är
  svaret nej. Utan den ordningen blir varje ändring tillåten tills någon hinner invända.
- **En förbättring utan eftermätning är en ändring.** Den får inte kallas förbättring — inte
  i en rapport, inte i en offert och inte i ett kundsamtal. Det sista är viktigast, för det
  är där det sägs som stannar hos kunden.

**Och en gräns som inte går att prata sig förbi:** ändras mer än hälften av de sidor som
rankar, eller byts tekniken ut, **är det ett nybygge — oavsett vad vi kallar det.** Ett
nybygge kräver ett eget beslut; det får inte glida in som "en omfattande förbättring".

**Ärligt om läget:** det här är reglerna, inte förmågan. Det finns ännu inget körbart
arbetssätt, vi har ingen egen mätning av placeringar, och därför är regeln om eftermätning
i dag ett löfte och inte en spärr. **Gränsen är skriven innan förmågan finns** — det är
avsiktligt, för då byggs förmågan mot en gräns i stället för mot en möjlighet.

## Fabriken kan nu ta emot kunder utan en ort (2026-08-27)

Det här var den sista stora resten av en gammal snedvridning: fabriken var byggd för
lokala tjänsteföretag, och **krävde en ort av alla** — även av en kund som säljer över hela
landet. Kontrakten skrevs om i går. Men **den grind som tar emot kunden var inte omskriven**,
så en rikstäckande kund stoppades ändå direkt, med motiveringen att orten saknades.

**Nu är grinden delad i två lager.** Alla kunder måste ha: namn, minst *ett* sätt att bli
kontaktad på (telefon, formulär, DM, bokning eller besöksadress — vilket som helst), minst
en tjänst, ett svar på **vad räckvidden betyder** för dem, och något som duger som USP.
**Att svara "vi jobbar i hela landet" är ett giltigt svar, inte en saknad ort.**

**Ovanpå det ligger paketet.** Väljer kunden vårt lokalpaket krävs dessutom telefon och
minst en belagd ort — precis som förut. Skärpningen finns kvar; den gäller bara inte alla.

**Bevisat, inte påstått.** Provfallet med mjukvaruföretaget — inget kontor att besöka, ingen
ort — går nu igenom. Och åtta motprov visar att grinden fortfarande säger nej där den ska:
lokalpaket utan ort stoppar, utan telefon stoppar, ingen kontaktväg alls stoppar, och ett
okänt paketnamn ger "går inte att avgöra" i stället för att glida igenom på den lösare vägen.

**Ett verkligt fel hittades av det sista motprovet.** En kontroll skulle stoppa en research
märkt OFULLSTÄNDIG — men jämförelsen bröts av bokstaven Ä och matchade aldrig. **En
ofullständig research hade alltså passerat.** Det upptäcktes för att provet fanns, inte för
att någon läste koden.

## Nu ser juristen vilka tjänster sajten pratar med (2026-08-26)

Varje sajt vi bygger använder någon utomstående tjänst — en karta, ett bokningsverktyg, en
företagsprofil. **Lagen kräver att integritetspolicyn räknar upp dem vid namn**, och att
varje anrop till en utomstående går att förklara.

**Hittills har den som ska kontrollera det fått lista ut det själv** genom att läsa den
färdiga sajten. Men sajtens egen beskrivningsfil vet det redan — den har bara inte sagt det
på ett användbart sätt.

**Nu gör den det.** Varje utomstående tjänst bär numera tre saker som avgör om den är ett
juridiskt ärende:

- **Vilket läge:** är det en *länk ut* (besökaren klickar sig bort), en *inbäddning* (tjänsten
  laddas in på vår sida och kan sätta kakor), eller bara en *närvaro* som inte laddar
  någonting alls? Att slå ihop de tre är det farligaste man kan göra — **inbäddningen är
  den enda som verkligen kostar**, och den försvinner i mängden om alla kallas "extern".
- **Når besökarens personuppgifter tredje part?**
- **Krävs samtycke?**

Kontrollen skriver ut en **arbetslista** och stannar där. **Den avgör ingenting juridiskt** —
det är och förblir en människas beslut, och systemet får aldrig godkänna sig självt på den
punkten.

**Direkt utfall:** vår egen provsajt visade sig ha en Google Maps-karta inbäddad — precis
den sortens sak checklistan varnar för. Den står nu på arbetslistan i stället för att
upptäckas i efterhand.

**Ärligt om gränsen:** beskrivningsfilen är ett *påstående*. Kontrollen fäller om påståendet
motsäger sig självt, men den kan inte veta vad en tjänst faktiskt gör. Det kräver att man
mäter den byggda sajtens verkliga trafik.

## Tre nya provfall: när svaret INTE är en ny sajt (2026-08-26)

Hittills har alla våra provfall handlat om att bygga. Det är en blind fläck: **en fabrik som
bara tränar på att bygga kommer att bygga även när det är fel svar.**

Nu finns tre fall till, och två av dem ska sluta med att vi *avstår*:

**Nordvik Fastighetsservice** har redan en sajt som fungerar — den konverterar, den rankar,
den är snabb. Men **247 av 412 samtal går obesvarade**, och de fjorton senaste låga
omdömena säger alla samma sak: går inte att få tag på. En ny sajt skulle inte flytta en
enda av de siffrorna. Rätt svar är att säga det.

**Alvestas Måleri** har en sajt som rankar tvåa på sin viktigaste sökning, med fyra års
upparbetat värde. Problemet är innehållet och knapparna. Att bygga om från grunden vore att
riskera det som redan fungerar för att fixa det som inte gör det. Rätt svar är att förbättra.

**Bergqvists Fönsterputs** är det tredje och det svåraste att bedöma: **den är helt vanlig.**
Ingen befintlig sajt, en ort, inga juridikfrågor, ett tydligt sätt att ta kontakt. Provet
är inverterat — här mäter vi att systemet **inte gör något extra.** Varje extra fråga till
dig, varje extra granskningsrunda "för säkerhets skull", är ett fel och inte en omsorg.

**Alla tre körs, och alla tre gör rätt.** Nordvik och Alvesta avslutas utan bygge och utan
att fråga dig om något. Bergqvists går vidare med noll frågor.

**Ärligt om gränsen:** provet visar att systemet gör rätt *med ett givet beslut*. Att det
kommer FRAM till rätt beslut från underlaget är AI:ns jobb, och det är inte prövat här.
Och ceremonin mäts vid ingången — att inget extra uppstår längs vägen kräver en riktig
körning.

## Nu kan fabriken bygga bokning (2026-08-26)

Provfallet med det påhittade mjukvaruföretaget stoppade tidigare på att kunden ville ha
demobokning — en funktion vi hade **beskrivit men inte byggt**. Nu är den byggd.

**Så här fungerar den, och valet är medvetet:** sajten *länkar ut* till bokningstjänsten i
stället för att bädda in den. En inbäddning ser mer sömlös ut men drar in tredjepartskakor
(alltså en samtyckesruta), tredjepartsskript (alltså sämre prestanda) och personuppgifter i
vår kontext (alltså en juridikfråga). Inbäddning är därför något kunden får **begära**, inte
något vi väljer för att det ser snyggare ut.

**Sajten tar aldrig emot bokningsdata.** Ingen mottagare, ingen historik, inga kakor från
oss. Bokningen bor hos tjänsten.

**Och en regel som är lätt att missa men viktig:** vår kvittosida får inte säga *"tack, din
tid är bokad!"* — **för det kan sajten omöjligt veta.** Bekräftelsen sker hos
bokningstjänsten, och besökaren kan ha avbrutit halvvägs. Sidan säger vad som händer
härnäst och var bekräftelsen kommer ifrån. De förbjudna formuleringarna står uppräknade en
och en, för ett råd går att tolka bort medan en lista inte gör det.

**Ärligt om nivån:** funktionen är **byggd**, inte **bevisad**. Att bokningsvägen faktiskt
når fram kräver en riktig testsajt, och den körningen har inte gjorts.

**En bieffekt värd att nämna:** eftersom funktionen nu finns stoppar inget av våra provfall
längre på spärren. En spärr som aldrig slår till ser precis likadan ut som en spärr som
gått sönder — så spärren har fått ett eget prov som tvingar den att visa att den fortfarande
kan säga nej.

## Gamla kundsajter får inte gå sönder (2026-08-26)

Vi har utökat vad en kundsajt beskriver om sig själv. Kunder som byggdes tidigare bär den
gamla, kortare beskrivningen. **Regeln har hela tiden varit att en sådan sajt fortfarande
är giltig** — och att det som saknas ska läsas som *"vi vet inte"*, aldrig som *"nej"*.

**Skillnaden är inte akademisk.** Om en gammal sajt saknar fältet "håller kunden på med
något som kräver inloggning?" och vi läser tomheten som ett nej, då har vi påstått något
kunden aldrig sagt. Och just det påståendet är det **bekväma** — det ser ut som ett
godkännande. Fel som ser ut som godkännanden hittas inte av den som hoppas att allt är bra.

**Regeln stod bara i text. Nu är den kod.** Den som läser en sådan sajt får aldrig ett
värde rakt av, utan alltid ett svar i två delar: *vad står det* och *vet vi det över huvud
taget*. Det gör det omöjligt att av misstag använda en tomhet som ett svar.

**Och nu finns ett provfall som kör den vägen:** samma påhittade rörfirma som förut, fast
med den gamla, kortare beskrivningen. Provet visar att den når **samma utfall** som den nya.

**Ärligt om gränsen:** läsaren finns, men de delar av systemet som granskar sajter använder
den inte ännu — de läser fortfarande beskrivningen direkt. Regeln går alltså att pröva, men
den är inte påtvingad. Det är namngivet.

## Första riktiga provkörningen — och vad den visade (2026-08-26)

De två provfallen har hittills bara granskats till formen. Nu har de för första gången
**körts** genom den del av kedjan som går att köra utan att bygga en riktig sajt: den del
som fattar beslut om huruvida bygget ens ska starta.

**Utfallet blev det som var förutsagt, och det är den goda nyheten.** Rörmokarfallet
passerar — allt det behöver finns byggt. Mjukvarufallet **stoppar**, därför att det kräver
en bokningsfunktion som är beskriven men inte byggd. Stoppet var nedskrivet som det
förväntade utfallet innan körningen, så det är ett godkänt prov och inte ett fel.

**Men körningen visade också något som ingen hade skrivit ned.** Stoppet kom från en
kontroll som finns i provkörarens kod — **inte i den riktiga kedjan.** I den riktiga kedjan
uppstår stoppet bara om den planerande AI:n själv råkar flagga att funktionen saknas.
Ingen kod jämför "vad kunden behöver" mot "vad vi faktiskt har byggt".

**Det betydde att stoppet hängde på en bedömning, inte på en spärr.** Missar bedömningen
fortsätter bygget in i något som inte kan levereras.

**Spärren är nu inflyttad i kedjan.** Den fungerar så här: AI:n får i uppdrag att LÄSA AV —
vilka funktioner kunden behöver, och vad vår egen lista säger om var och en — och skriva av
svaret ordagrant. Sedan är det vanlig kod, inte AI, som avgör om bygget får starta. **En AI
som skriver "inte byggd" kan därmed inte välja att fortsätta ändå.**

**Ärligt om vad som är kvar:** AI:n läser fortfarande av listan, och läser den fel går den
förbi spärren. Provköraren läser listan direkt från disk och skulle fånga det — men den
körs för hand. Den luckan är namngiven, inte stängd.

## Provfallet som gav bort svaret (2026-08-26)

Vi har ett provfall som ska visa att fabriken INTE klistrar på lokala vanor där de inte
hör hemma — ett påhittat mjukvaruföretag utan butik, utan kundbesök, utan rörmokarlogik.
Sex fällor är utlagda.

**Vid en genomgång visade det sig att provet gav bort svaret på fyra av de sex.** Underlaget
sa rakt ut "kunden vill inte ha någon Google-företagsprofil" och "det finns inga
fordonsbilder". Fabriken behövde alltså inte KOMMA FRAM till något — den behövde bara
skriva av. Ett prov som ger bort svaret mäter ingenting.

**Underlaget är omskrivet till råmaterial.** Nu finns det en Google-företagsprofil på
riktigt — övergiven, med noll samtal och noll omdömen — och fabriken måste själv avgöra att
den inte är värd något här. Nu ringer telefonen FLER gånger än formuläret får ifyllningar,
så valet av vad besökaren ska göra kräver en verklig avvägning i stället för en avläsning.
Nu ligger det en högupplöst bild på en lastbil bland de bilder som formatmässigt duger som
toppbild — och den ska väljas bort på vad den betyder, inte på hur den ser ut.

**Facit finns kvar**, men det står numera i provets facitfil där det hör hemma, med en rad
per fälla. Och det står utskrivet att fällorna nu **går att utlösa** — inte att de har
utlösts. Provet är förberett, inte genomfört.

## Vem vaktar vakterna? (2026-08-26)

Fabriken har femton kontroller som ska fälla när något är fel. En obehaglig fråga fick ett
obehagligt svar: **nio av dem gick att tömma i tysthet.** Byter man ut villkoret i en
kontroll mot "sant" står namnet kvar, antalet står kvar, och rapporten skriver fortfarande
"alla godkända". Kontrollen finns — den prövar bara ingenting längre.

**Nu har varje kontroll ett fingeravtryck**, och alla femton avtrycken ligger samlade i EN
fil. Ändras en kontroll ändras dess avtryck, och det syns som en rad i ändringen. Det
hindrar inte någon från att ändra en kontroll — det gör ändringen omöjlig att göra tyst.

**Och en sak till, som kom ur ett verkligt misstag under bygget.** En av kontrollfilerna
skrevs av misstag över av en kopia av en annan. Den påträngande filen körde sina egna
kontroller, sa "godkänt", och allt såg grönt ut i flera steg innan felet upptäcktes.
Lärdomen är enkel och obehaglig: **ett program kan inte intyga att det fortfarande är sig
självt.** Därför säger varje kontroll numera sitt eget namn högt när den kör, och en
körare utanför kontrollerar att rätt namn kom från rätt fil. Kommer fel namn blir svaret
"går inte att avgöra" — aldrig "godkänt".

**Ärligt om gränsen:** skrivs både köraren och en kontroll över samtidigt finns ingen
mekanism kvar som märker det. Det sista ledet är en människa som läser ändringen.

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

## Grindarna läser kundens kontrakt i stället för att anta (S5, 2026-08-26)

Fram tills nu antog kvalitetskontrollen att varje sajt var en svensk lokal
tjänsteverksamhet. Det stämde för alla kunder vi haft — men ett antagande som
råkar stämma är fortfarande ett antagande, och det syns först den dag det inte
gör det.

Nu läser grindarna sajtens eget kontrakt (`content/profile.ts`) och dömer mot vad
DEN sajten lovat: vilken primärhandling som gäller, vilka resor som måste fungera,
vad sajten aldrig får påstå och vilket paket som är belagt.

**SEO-grinden är delad i två.** Den tekniska kärnan — sitemap, canonicals, schema,
titlar, indexerbarhet — prövas alltid, för varje sajt. Det lokala lagret —
ortssidor, NAP-kontroll, Google Företagsprofil — prövas bara när kunden faktiskt
hör till det paketet. För en kund utan ortspaket är frånvaron av ortssidor
**korrekt**, inte en brist någon glömt.

**En ny lins prövar resorna.** Inte bara "går det att ringa" utan varje resa
kunden kontrakterat, klickad på riktigt i mobil och på desktop. En resa som bara
ser rätt ut är inte prövad. Har kunden ett äldre kontrakt utan resor blockerar det
ingenting — det redovisas som en lucka, inte som ett fel.

**Den andra skeptikern har slutat gissa.** När två granskare ska motbevisa ett
fynd frågade den ena tidigare "spelar det här roll för en svensk lokal
tjänstesajt?" — en fråga som var inbakad i koden. Nu frågar den "spelar det roll
för DEN HÄR sajten enligt dess kontrakt?", och den får aldrig hitta på ett krav
kontraktet inte bär.

**Överlämningen och domänbytet följer också paketet.** En kund utan ortspaket får
inte en Google Företagsprofil-checklista hen aldrig kan följa — hen får en mening
om varför den inte gäller.

Det som INTE ändrats: hur många fixrundor som tillåts, att juridiken aldrig
auto-fixas, att en grind måste vara grön för att släppa igenom. De reglerna är
grundlagsskyddade och rörs inte av att grindarna blivit smartare på vad de läser.

## Så tar systemet in kunskap utifrån (K0–K3, 2026-08-26)

Världen ändrar sig: tillgänglighetskrav skärps, Google flyttar ett tröskelvärde, en
plattform byter API. Frågan är inte OM sådant ska nå fabriken utan HUR — och svaret
är att det aldrig får ske i tysthet.

**Fyra delar, en grundlag.** Grundlagen är att kunskapsbanan bara får **föreslå**.
Den skriver aldrig i en standard. Skälet är konkret: en källa som får skriva direkt i
våra normer blir en kanal där någon annans ändring tyst blir vår policy — och den dag
någon frågar "varför gör vi så här?" finns inget beslut att peka på.

**Källregistret** listar var vi tittar: vilken fråga varje källa har auktoritet över,
hur ofta den brukar ändras, hur en ändring faktiskt upptäcks, och vem som läser
utfallet. Ingen källa har auktoritet över allt — WCAG avgör tillgänglighet, inte
copy; kunden avgör fakta om sin verksamhet, aldrig hur besökaren tänker.

**Anspråksstegen** är hur en idé blir en regel: sedd en gång → sedd igen oberoende →
reproducerad hos oss → höll över tid → antagen som norm. Sista steget tas bara av en
människa. Varje anspråk måste bära sitt giltighetsomfång — vilka kunder det gäller —
och "vet inte" är ett godkänt svar medan tomrum inte är det. Ett anspråk som råkar
stämma för en kund blir annars tyst en regel för alla.

**Radarn** är ett månatligt matsmältningsorgan, inte ett notisflöde till. Du startar
den; den startar aldrig sig själv. Den letar upp vad som faktiskt ändrats, **citerar
det ordagrant** (en sammanfattning bär redan vår tolkning in i beslutet), frågar om
det ens rör något vi gör — och landar i ett av fyra utfall: ett förslag, ett nytt
anspråk, ett experiment, eller "bevaka". **En tom radarkörning är ett fullgott
resultat.** Att leta upp något att föreslå för att körningen ska kännas värd sin tid
är precis motsatsen till vad organet är till för.

Och det femte steget — första riktiga radarkörningen mot ett riktigt kundprojekt —
byggs inte i förväg. Det kräver en första riktig kund, och vi hittar inte på underlag
för att kunna säga att banan är färdig.

## Dokumentationen hann inte med bygget (S9, 2026-08-26)

Systemet har två dokumentationslager: ett för dig som är ny (den här filen) och ett
tekniskt för den som ska ändra i systemet. Regel 22 kräver att det FÖRSTA uppdateras
varje gång något tekniskt ändras — och det har fungerat. Den här filen är aktuell.

Följden blev att det ANDRA lagret gled. `docs/01-oversikt.md` och `docs/00-guide.md`
stod kvar på en stämpel från 31 juli, utan ett enda omnämnande av paket,
kapacitetskatalog eller interventionsbeslut — trots att fem ändringar sedan dess hade
byggt om precis de delarna. En regel som skyddar ett lager kan alltså få det andra att
se välskött ut medan det driver.

**Tre saker rättades.**

Ingressen i README beskrev systemet som byggt "för svenska egenföretagare och lokala
småföretag". Det var sant en gång, men sedan i somras är arkitekturen en universell
kärna med paket ovanpå — och `lokal-se` är systemets FÖRSTA kundtyp, inte dess natur.
Skillnaden är inte kosmetisk: den som läser den gamla meningen tror att en kund utanför
den beskrivningen ligger utanför systemet.

Nodkartan sa fortfarande att research är "5 obligatoriska fält". Den skrivs numera mot
ett researchkontrakt med sjutton sektioner, och plannern läser kontrollraden först.

Och det viktigaste: **ingenstans i operatörsdokumentationen stod det att plannern kan
komma fram till att en ny sajt inte är svaret.** Den fäller ett interventionsbeslut med
fyra utfall — bygg nytt, förbättra det som finns, gör något som inte är en sajt alls,
eller avråd — och det står i briefen. Nu står det där du faktiskt läser.

**En vakt som märker nästa gång.** `scripts/check-docs-coherence.mjs` jämför vad som
finns byggt i repot med vad dokumentationen säger. Finns det paket men ingen text om
paket, faller den. Och åt andra hållet: **beskriver dokumentationen en byggdel som inte
finns i repot, faller den också.** Det senare är det ovanligare och farligare felet — att
beskriva arbete som ännu inte är klart som om det vore det.

Att säga att något ännu INTE är klart är däremot alltid tillåtet. Ett tidigare utkast av
vakten fällde meningen "detta är ännu inte landat" — alltså precis den ärlighet den var
byggd för att skydda. En vakt som förbjuder sanningen om vad som saknas driver fram
tystnad i stället för redovisning.

**Vakten hade själv exakt det fel den letar efter.** Första versionen lät en kontroll
"utgå" när det den vaktade försvann — och räknade sedan bara de kontroller som blev kvar.
Att döpa om en enda fil tog bort tjugo kontroller, och vakten skrev ut "allt grönt" över
hålet. Den rapporterade sin egen blindhet som ett godkänt resultat. Nu räknas varje
kontroll alltid, och stämmer inte antalet vägrar den döma alls.

Vakten kan säga att en sak är NÄMND. Den kan inte säga att den är väl beskriven, och den
körs för hand — inte automatiskt. Det står i README, och vakten fäller om den meningen
försvinner medan skripten står kvar i listan.

## Fabriken frågar dig oftare, men ber om lov mer sällan (S10, 2026-08-26)

Förut fanns bara två lägen: antingen körde fabriken vidare, eller så stannade den och
väntade på dig. Det lät försiktigt, men det gjorde något dumt — den stannade även när den
redan hade fattat rätt beslut.

Säg att planeraren kommer fram till att kunden inte behöver en ny sajt: det som saknas är
att telefonen inte besvaras. Det är precis den insikt vi vill att systemet ska ha. Men
förut markerades den som "strategisk", och allt strategiskt stoppade bygget och lade sig
och väntade på ditt godkännande. **Du fick alltså sitta och godkänna att systemet hade
rätt.**

**Nu skiljer fabriken på fyra saker:** den kan fortsätta; den kan fortsätta men tala om
för dig vad den gjorde; den kan lägga ned det här spåret för att det är fel produkt; eller
den kan faktiskt stanna.

Bara det sista väntar på dig. Att lägga ned ett spår räknas nu som ett korrekt beslut, inte
som något du måste låsa upp.

**Vad som fortfarande stoppar helt** är oförändrat, och det är avsiktligt: juridik som
ingen hanterat, något som kräver en förmåga fabriken inte har byggt, allvarliga fel som
står kvar efter det enda automatiska fixförsöket, ett brutet spårbarhetskontrakt — och
allt som är **oklassificerat**. Det sista är den viktigaste raden: om fabriken inte vet
vilken sorts beslut något är, stannar den. Ett okänt läge blir aldrig tyst ett "kör på".

Och deploy är precis som förut. Juridiksigneringen och publicera-knappen är dina.

Skillnaden i en mening: **det är inte gränserna som flyttades, det är väntandet som togs
bort.**

## Obemannat är numera normalvägen (S12, 2026-08-26)

Förut fungerade det så här: fabriken körde **bemannat** om du inte sa något annat, och
obemannat fick du be om genom att skriva en särskild rad i kundpappret. Autonom drift var
alltså undantaget.

Nu är det tvärtom. **Saknas raden kör fabriken obemannat.** Vill du ha det gamla flödet —
med stoppet där du godkänner strategin innan bygget — skriver du `Läge: bemannat`.

Det låter som en liten sak men det ändrar vad som är standard: förut behövde autonomin
begäras, nu behöver den avbrytas.

**Det som INTE ändrades:** juridiksigneringen och publicera-knappen är fortfarande dina, i
båda lägena. Fabriken deployar aldrig själv.

**Och en detalj som är viktigare än den låter:** skriver du något annat än `obemannat`
eller `bemannat` — en felstavning, ett tomt tecken, vad som helst — så stannar fabriken och
säger till. Den gissar inte, och den väljer absolut inte den mer självgående vägen bara för
att den inte förstod. Att vända en standard utan den regeln vore att byta ett stopp mot en
gissning.

## Ett förslag på ett bättre betygssystem — som ingen använder än (2026-08-26)

Fabriken sätter betyg på varje färdig sajt: 0–100 poäng fördelade på elva punkter. Det
är hur kvalitet mäts över tid, och det är därför siffran måste betyda samma sak för alla
kunder.

**Problemet är att den inte gör det längre.** Tjugofyra av de hundra poängen mäter saker
som bara gäller lokala företag: att adressen står likadant överallt, att det finns
ortssidor, att den lokala företagsinformationen är rätt uppmärkt för Google. För en
rörmokare i Uppsala är det precis rätt. För ett företag som säljer i hela landet mäter de
poängen ingenting — och sajten får dem ändå, för att den korrekt låtit bli att bygga
ortssidor. Poäng för en frånvaro är inte ett betyg, det är utfyllnad.

Grindarna löste redan sin del av det här (avsnittet om S5 ovan): de vet numera att en
kund utan ortspaket ska mätas på annat. **Betygssystemet hann inte med.**

**Det andra felet går åt motsatt håll.** Ett fel som borde vara diskvalificerande kostar
i dag bara några poäng. Har en sajt olika telefonnummer i sidfoten och i
kontaktuppgifterna tappar den högst åtta poäng — och kan fortfarande landa på 88, vilket
läses som "nästan klar, fixa listan". Åtta poäng är fel svar på ett fel som gör att
kunden inte går att nå.

**Vad som gjorts nu:** ett förslag är skrivet — `docs/utkast/eval-rubrik-v4-UTKAST.md`.
Det delar betyget i två delar som aldrig läggs ihop: en **kärna** som gäller varje sajt,
och ett **påbyggnadsmått** som bara körs för de kunder påbyggnaden faktiskt gäller. Krav
som inte gäller en kund ger varken plus eller minus — de lämnar mätningen. Och en
handfull fel är inte poängavdrag alls utan **fällning**: sajten underkänns oavsett hur
bra resten är.

**Vad som INTE gjorts:** ingenting har ändrats. Det gamla betygssystemet är kvar,
oförändrat — kontrollen jämför det mot ett fruset fingeravtryck, så minsta ändring syns.
Förslaget ligger i en egen mapp för utkast, ingen del av fabriken läser det, och samma
kontroll (`scripts/check-v4-utkast.mjs`) går igenom varenda fil i repot och faller om
någon av dem börjar peka på förslaget. Två filer får nämna det: den här texten och
beslutsloggen — de beskriver förslaget för en läsare, aldrig för en körning. Att byta betygssystem är ett eget, större beslut som du
fattar — bland annat för att alla befintliga kundmappar behöver kompletteras först,
annars blir de omätbara över en natt. Det står utskrivet i förslaget, för det är den
sortens pris man helst upptäcker innan man byter, inte efteråt.

Och en sak värd att säga rakt ut: siffrorna i förslaget är förslag. Ingen kund har
poängsatts med dem. Det är därför det heter utkast och inte version 4.
