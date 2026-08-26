# Operatörsguiden

Senast verifierad mot systemet: 2026-08-26 · v18 (denna commit)
Verifieringsomfång: delta-verifierad mot S1–S4 + K0–K4 (publicerat i `main` t.o.m. PR #130) i S9-konsolideringen; avsnittet "Kärna, paket och interventionsbeslutet" skrivet mot `agents/project-planner.md` och `docs/kapacitetskatalog.md`. **S5 är nu inräknad** — mergad i samma batch som denna stämpel (PR #129). Basstämpeln 2026-07-30 sattes av [AUTO-N1] 64acf9f och är inte oberoende granskad.

Det här är guiden för dig som kör Nortropic-systemet: en operatör, en sajt i taget. Den är författad ur systemfilerna själva — varje avsnitt pekar på filen där regeln faktiskt bor, och när guiden och en systemfil säger olika saker är det systemfilen som gäller. Guiden förklarar hur du använder systemet och varför det ser ut som det gör; den exakta nodkartan finns i [01-oversikt.md](01-oversikt.md), agenterna i [02-agenter.md](02-agenter.md) och de hårda reglerna med källhänvisningar i [03-regelverk.md](03-regelverk.md).

## Systemets idé

Tre principer bär allt. Den första är att **stewarden föreslår, människan godkänner** — med v15:s enda, konstitutionsgrindade undantag: självförbättringstrappan. Meta-agenten `nortropic-steward` diagnostiserar hela systemet och skriver förslag som du godkänner och som huvudsessionen applicerar och committar (`agents/nortropic-steward.md`, HARD WRITE POLICY); trappans två lägen får därutöver självapplicera en uttömmande vitlistad ändringsklass, grindat av `AUTOPILOT` och hårt avgränsat av [07-konstitution.md](07-konstitution.md) — se avsnittet Självförbättringstrappan nedan. Godkännandet per ändring ersätts där av mekaniska grindar, regressionssviten och din granskning i efterhand via digesten; ett system som skriver om sig självt UTAN de grindarna driftar fortfarande.

Den andra är att **kvalitet mäts, inte känns**. Varje färdig sajt poängsätts 0–100 mot en versionerad rubrik (`skills/nortropic-eval/references/eval-rubric.md`, just nu v3.0.0) med elva viktade kriterier — v14 lade till kriterium 9 Visuell distinktion och v3.0.0 (2026-07-28) drag-kalibrerade om vikterna, så totaler jämförs aldrig rakt av mellan major-versioner. Poängen är jämförbar mellan klienter, och varje steward-förslag måste namnge vilket rubrikkriterium det förväntas förbättra — annars taggas det "nice-to-have, avvakta" (`agents/nortropic-steward.md`, Judgment rules).

Den tredje är att **varje faktapåstående ska vara spårbart**. Ett påstående på en kundsajt som inte går att spåra till kundens `research.md` fäller hela evalen, oavsett totalpoäng (`skills/nortropic-eval/SKILL.md`, "The hard rule"). Samma princip gäller den här dokumentationen: den beskriver det systemet ÄR, och varje påstående ska gå att spåra till en systemfil.

## Flödet i praktiken

Pipelinen är tolv noder — tabellen finns i [01-oversikt.md](01-oversikt.md). Så här ser den ut från operatörsstolen:

Du börjar med att skriva `research.md` om kunden, mot researchkontrakt v3. Fem fält är obligatoriska i plannerns minimigrind: företagsnamn, telefonnummer, minst en tjänst, minst en ort och något som duger som USP. Saknas något stannar planeringen med en numrerad lista över vad som fattas — systemet planerar aldrig på gissningar (`agents/project-planner.md`, INPUT GATE). **Två av de fem sammanfaller inte med kontraktets kontrollrad** — se "Kärna, paket och interventionsbeslutet" nedan innan du drar slutsatsen att en fil är bristfällig. Sedan kör du `/nortropic-plan`, som ger dig en `PROJECT-BRIEF.md` med exakt sju sektioner (§7 Kalibreringsprofil är kalibreringskontraktet nedströms), en lista öppna frågor och ett fält **Klienttyp**: `SKARP` eller `TESTKLIENT`. Plannern gör alltid en egen inspirationsinhämtning ur källbiblioteket (`skills/nortropic-plan/references/inspirationskallor.md` — omdömesjakten först, gallerierna som smaklyft, koncept sist; budget max 6 egna kandidater/~10 sidhämtningar) och väger dina eventuella Designreferenser i research.md likvärdigt med sina egna fynd — frasen "hoppa över inspirationsjakt" i research.md stänger av den egna jakten. Smakgrinden är briefgodkännandet: §5:s Referensöversättning visar per rad om ett val kom från din research eller plannerns jakt, och det är där du accepterar eller vänder riktningen (`agents/project-planner.md`, steg 5d). En testklient byggs icke-indexerbar och får aldrig verkliga GBP-, citation- eller DNS-åtgärder (`agents/project-planner.md` §6, `skills/nortropic-stack/SKILL.md`).

**Första hårda stoppet är briefgodkännandet.** Läs briefen, svara på de öppna frågorna, godkänn. Granska särskilt **§7 Kalibreringsprofil** — primärhandlingen (det enda sajten ska driva), röstregistret, kvittolistan och framför allt **juridikflaggorna**: en ohanterad flagga är ett beslut som bara du kan ta (bygg modulen som eget arbete, eller tacka nej — `skills/nortropic-plan/references/juridikflaggor.md`). Allt nedströms — bygge, copy, granskning, grindar, eval — behandlar briefen som auktoritet, så en slarvigt godkänd brief blir en slarvig sajt.

`/nortropic-init` skapar GitHub-repot FÖRST (`gh repo create … --clone`, aldrig lokalt först), scaffoldar Next.js 15 + TypeScript strict + Tailwind 4 + shadcn/ui, bygger varje sida i briefens arkitektur och kopplar Vercel från dag ett (`skills/nortropic-init/SKILL.md`, `skills/nortropic-stack/SKILL.md`). Stacken är fast och medvetet enkel: **ingen databas** — allt innehåll är typad TS i `content/`, och den enda serverkoden är lead-actionen som mejlar offertförfrågningar via Resend. Init kopierar också referensskärmdumparna in i byggrepot som `design-referenser/` (v14 — internt arbetsmaterial, deployas aldrig): byggaren öppnar bilden §5-Layoutspråket pekar på före varje nyckelsektion — "Bygg med bilden framför dig, aldrig ur minnet av en mening" (`agents/stack-builder.md`). Därefter kör huvudsessionen agenten `content-designer` som fyller varje `TODO-COPY` med svensk copy i kundens röst per briefens §7-register och kör alltihop genom det obligatoriska Humanisera-steget (`agents/content-designer.md`, steg 5). Fakta som saknas blir `TODO-FACT` — de får aldrig fyllas i av en agent, de är blockerande kundfrågor.

Granskning och launch beskrivs i egna avsnitt nedan. Efter launch återstår tre saker: **andra hårda stoppet** (juridiken — du signerar Gate 6-fynden själv), `/vercel:deploy`, och efterarbetet: `/nortropic-cutover` kör fas 1–3 (förkontroll → noindex-verifiering → GSC-preflight; den irreversibla GSC-skrivningen förblir din hand), och resten — GBP, citations m.m. — kör du ur de klientfyllda checklistorna `gbp-checklist-klient.md` och `gsc-steg-klient.md` under de första två veckorna (`workflows/nortropic-cutover.js` + `workflows/nortropic-launch.js`, Handover-fasen). Sist kör du `/nortropic-retro` och når **tredje hårda stoppet**: du läser stewardens förslag och säger "applicera förslag N" till huvudsessionen.

När fixloopen i launch hittar åtgärdbara fynd routas de per kategori: seo-fynd går till `seo-optimizer`, allt annat till `stack-builder`, sekventiellt så att två agenter aldrig skriver i repot samtidigt — och juridik går aldrig in i loopen alls (`workflows/nortropic-launch.js`, Fix loop).

## Kärna, paket och interventionsbeslutet

Systemet är **universellt i kärnan och specialiserat i paket** — `lokal-se` är det första
paketet, inte systemets natur. Riktningen är enkelriktad: **ett paket kan lägga till krav
på kärnan, aldrig ta bort ett.** Skärpningslagen är det som gör paket ofarliga — ett paket
som fick lätta hade blivit en bakväg runt kärnans regler.

Från operatörsstolen märks det på tre ställen.

**Plannern kan komma fram till att en sajt inte är svaret.** Före all planering fäller den
ett interventionsbeslut med fyra möjliga utfall: NY SAJT, FÖRBÄTTRA BEFINTLIG,
ICKE-SAJT-ÅTGÄRD eller AVRÅD. Utfallet står i briefens §7.12, och **är det något annat än
NY SAJT ROUTAR obemannat bort från ny-sajt-lanen i stället för att bygga, och utfallet
registreras ALLTID OCKSÅ som en STRATEGISK öppen fråga med `blocking: false`.** Beslutet
läses ur fältet `interventionsbeslut` — inte ur frågan. Registreringen finns för att du
ska se det, inte för att styra routningen.

Den frågan är dock ICKE-blockerande. **Ingen sajt byggs** — skälet registreras och du får
ett rekommenderat nästa steg — men det väntar inte på ditt godkännande: att inte bygga är ett korrekt beslut systemet redan har mandat
att fatta. Se **Owner attention ≠ owner approval** ovan.

Det här är den mest värdefulla raden i briefen och den lättaste att skumma förbi. En kund
vars problem är att telefonen inte besvaras blir inte hjälpt av en ny sajt, och systemet
ska säga det i stället för att sälja ett bygge.

**Kapaciteter stoppar innan de gissas.** Plannern väger researchens signaler mot
[kapacitetskatalogen](kapacitetskatalog.md). Krävs en kapacitet som är `DECLARED`
(beskriven men inte byggd) stannar planeringen med en STRATEGISK öppen fråga i stället för
att planera runt den. Är den `ROUTE-OUT` rekommenderar briefen hänvisning. Du får alltså
beslutet i knäet vid nod 3 — vilket är rätt plats för det.

**INPUT GATE sammanfaller inte med kontraktet — och det är en känd avvikelse.**
Minimigrinden (de fem fälten ovan) kräver telefonnummer och USP. Kontraktets kontrollrad
accepterar vilken typad kontaktväg som helst — telefon, formulär, DM, bokningssystem eller
fysisk plats — och har inget USP-fält alls.

De två kraven avviker på olika sätt, och det är värt att hålla isär:

- **Telefonkravet är en paketskärpning.** `lokal-se` skärper kontrollraden där, vilket
  paket får göra.
- **USP-kravet har ingen hemvist alls** — varken i kontraktet eller i något paket.
  Grinden kräver det oavsett paket. Tro alltså inte att `core-only` gör dig fri från
  USP, och inte heller att `lokal-se` är det som kräver den.

Konsekvensen är verklig: en research-fil som är universellt komplett med enbart formulär
som kontaktväg stoppas ändå här.

Möter du det: stoppet är korrekt utfört, men det säger att grinden **ännu inte är
parameteriserad** — inte att researchen är bristfällig. Avvikelsen är medvetet oförändrad
tills grindparameteriseringen körs som egen ceremoni (`agents/project-planner.md`, Känd
avvikelse).

## Owner attention ≠ owner approval

**Detta är principens kanoniska hemvist.** Andra ytor refererar hit och bär bara den
minsta text runtime behöver.

> Ett beslut **blockerar** endast om fortsatt arbete skulle överskrida delegerat mandat,
> kräva en otillåten eller obyggd capability, skapa en otillåten irreversibel effekt,
> eller kräva ett påstående systemet inte kan belägga.
>
> **Strategisk betydelse i sig är inte ett stoppvillkor.**

Systemet ska be om **uppmärksamhet ofta, tillstånd sällan**, och stanna bara när det
faktiskt måste. Fyra utfall, och skillnaden mellan dem är hela poängen:

| Utfall | Betyder | Väntar på dig? |
|---|---|---|
| `CONTINUE` | arbetet fortsätter | nej |
| `ATTENTION_CONTINUE` | arbetet fortsätter, beslutet registreras synligt | **nej** |
| `ROUTE` | denna lane ska inte fortsätta med fel produkt — den avslutas korrekt | **nej** |
| `HARD_STOP` | fortsatt arbete vore otillåtet eller obevisbart | ja |

**Det som ändrades var inte gränserna — det var väntandet.** Tidigare stoppade
`/nortropic-autobygg` och lämnade över så fort en fråga var märkt `STRATEGISK`, oavsett
om den faktiskt krävde ett nytt mandat. Etiketten avgjorde. Nu avgör den verkliga
authority- och effektrisken, uttryckt som `blocking: true|false` på varje strategisk
fråga.

Ett interventionsutfall som inte är `NY SAJT` — förbättra befintlig, icke-sajt-åtgärd
eller avråd — **routar** numera. Ingen sajt byggs, skälet registreras, och du får ett
rekommenderat nästa steg. Men systemet står inte och väntar på att du ska godkänna att
dess korrekta beslut var korrekt.

**Vad som fortfarande stoppar helt:** ohanterad juridik (human-only i alla lägen), en
krävd men obyggd capability, kvarstående CRITICAL efter den ena tillåtna autonoma
fixloopen, brutet fix-/proveniens-kontrakt, och varje **oklassificerat** utfall. Det
sista är avsiktligt strängt: en saknad disposition blir aldrig tyst ett fortsättningsbeslut,
och en äldre plan-artefakt får aldrig mer auktoritet genom att ett nytt fält saknas.

Deploy ändras inte alls. Nod 8 (juridik-signoff) och nod 9 (`/vercel:deploy`) är dina,
i alla lägen.

**Attention får aldrig fungera som ett mutex.** Ser du raden

```
OWNER ATTENTION — inget svar krävs | HIGH | AVRÅD: ...
Owner action required: false
```

så är det en upplysning, inte en fråga. Bara `ownerActionRequired: true` betyder att
något faktiskt väntar på dig.

## Obemannat läge (v16)

Bär research-filen raden `Läge: obemannat` kan du köra `/nortropic-autobygg` — orkestreringen som gör plan→init→innehåll→granskning→**grind-torrkörning** utan det mänskliga nod-3-stoppet. Det primära användningsfallet är **gratis-bygge-motorn**: låt systemet bygga en färdig preview åt en låginsatskund utan att du sitter med i varje nod (rekommendationen står i research-mallen: obemannat för gratis-byggen och låginsatskunder, bemannat för betalande — briefgodkännandet är billig försäkring). Utelämnad `Läge:`-rad = `bemannat` = dagens flöde, oförändrat.

Det är ett förtroende med bromsar, och bromsarna är av två slag — se avsnittet **Owner attention ≠ owner approval** ovan för principen. Körningen **HARD-stoppar och överlämnar till människa** vid (a) en OHANTERAD juridikflagga i §7, (b) en strategisk fråga som är märkt `blocking: true` — alltså en som kräver nytt mandat, inte varje fråga som råkar vara strategisk, (c) CRITICAL kvar efter EN autonom fixloop, (d) ett brutet fixkontrakt (BATCH-005: en agents deklarerade filmängd motsäger delta-snapshoten, eller commit-utfallet avviker från den stageade kända mängden — i fasgränscommiten efter Content eller i fixrundans unionscommit), (e) ett ouppfyllt Del-C-förkrav, alltså en krävd men obyggd capability, och (f) varje OKLASSIFICERAT utfall. Den **ROUTAR** däremot bort — utan att invänta dig — vid `scope-nej`, vid ett interventionsutfall som inte är NY SAJT, och vid en stateful glidning (Ring 3). Ingen sajt byggs då, skälet registreras, och du får ett rekommenderat nästa steg. Den **deployar aldrig** — nod 8 (juridik-signoff) och nod 9 (`/vercel:deploy`) förblir dina. Sista steget skriver `FINAL-TOUCHES.md` (fakta att fylla, beslut att fatta, juridik att signera, avslutsreceptet) och för en spårningsrad till `AUTOBYGG-LOG.md` i kundmappen. Samma `FINAL-TOUCHES.md` kan en bemannad ägare generera med `/nortropic-final-touches <kundmapp>` efter `/nortropic-launch`.

**Obemannat är inte "autopilot".** `AUTOPILOT`/självförbättringstrappan ([07-konstitution.md](07-konstitution.md) §B) styr systemets självförbättring — aldrig kund-flödet. Obemannat kund-bygge styrs enbart av research-radens `Läge:`, en helt separat brytare. Blanda aldrig ihop dem.

## Modellmatrisen

Principen är **Fable där systemet tänker, Opus där det bygger**. `project-planner` och `nortropic-steward` — de två agenter vars omdöme formar allt nedströms — kör `model: fable` med `effort: max`. Byggarna och granskaren (`stack-builder`, `content-designer`, `design-reviewer`) kör Opus på max, och de två verifierarna (`seo-optimizer`, `qa-launcher`) Opus på high. Matrisen är kodifierad som MODELLKONTRAKTET i stewardens SYSTEM MAP, och doctor-kontroll #8 fäller varje avvikelse mellan kontraktet och agenternas frontmatter (`agents/nortropic-steward.md`).

Matrisen är justerbar åt båda hållen, men bara via stående regler som utvärderas i varje retro: sjunker svensk copy-kvalitet (kriterium 3) under målet två klienter i rad föreslås `content-designer` upp till Fable; upptäcks grind-missar efter launch föreslås `qa-launcher` tillbaka till effort max. Och **Sonnet-trappan** är förberedd men INTE aktiv: först efter två raka klienter med eval ≥90 och noll grind-missar föreslås `qa-launcher` och `seo-optimizer` ner till Sonnet, med rollback-klausul vid första eval under 90 (`agents/nortropic-steward.md`, Stående regler 1–3).

## Kanon och auktoritetsordning

Designkvaliteten vaktas av **designkanonen**: åtta tredjepartsskills som `design-reviewer` laddar obligatoriskt i varje granskning — `web-design-guidelines`, `ui-ux-pro-max` (facit för briefens valda riktning), `taste`, `impeccable`, `soft-skill`, `emil-design-eng`, `find-animation-opportunities` (bunden till briefens Motion-nivå) och `frontend-design` (v14). Eskaleringslistan är tömd; kanonen är inte valfri (`agents/design-reviewer.md`, steg 2). Sedan v14 delas kanonen efter funktion: **byggarna laddar de generativa skillsen före bygget** — stack-builder `frontend-design`/`web-design-guidelines`/`emil-design-eng`/`find-animation-opportunities` + design-blocklisten, content-designer `frontend-design`/`soft-skill` + design-blocklisten — medan de dömande (`taste`, `impeccable`) förblir enbart granskarens: vägledning efter bygget kan bara fånga, inte forma, och granskaren ska döma med böcker byggaren inte skrivit själv. På copysidan har `content-designer` motsvarande obligatorium: hela copyn körs genom `content-humanizer` före rapport (`agents/content-designer.md`, steg 5). Dessa nio skills är systemets bärande tredjepartsberoenden, och därför vendorade — se [04-justeringskarta.md](04-justeringskarta.md).

Vid konflikt gäller alltid **auktoritetsordningen** (v13): PROJECT-BRIEF §5 Designriktning + §7 Kalibreringsprofil > bas-antislop (de universella synderna är orubbliga — §7 kan aldrig vitlista dem) > designkanonen > övrigt. Generiska riktlinjer får aldrig övertrumfa briefens valda riktning eller §7:s register, och komponent-MCP:er är uppslag — aldrig en källa som får ändra riktningen (`agents/stack-builder.md` och `agents/design-reviewer.md`).

Kanonen har en kostnadsvakt: ökar review-kostnaden med mer än 50 % utan att nya fyndkategorier tillkommit, föreslås de två minst bidragande kanon-skillsen tillbaka till eskalering — med fynddata som underlag (`agents/nortropic-steward.md`, Stående regel 4).

## Kadens och färskhet

Granskningskadensen är **full → diff → full**: första granskningen efter init och granskningen före launch är alltid fullständiga; mellanliggande granskningar körs med `/nortropic-review --diff`, som mekaniskt diffar mot commiten i förra rapportens meta-block och granskar enbart ändrade filer med direkt kontext. Det är granskningsytan som skopas, inte kvalitetsribban — kanonen laddas som vanligt (`workflows/nortropic-review.js`).

Launchen vägrar köra på gammal information: **freshness-grinden** blockerar om `REVIEW-REPORT.md` saknas, om senaste granskningen var diff-skopad, eller om det finns commits på `src`/`content` efter granskningens commit. Då är svaret alltid detsamma — kör en full `/nortropic-review` först (`workflows/nortropic-launch.js`, Freshness). Kalibreringskörningar (`--no-verify`) skriver till en egen fil, `REVIEW-REPORT-CALIBRATION.md`, så de aldrig kan lura freshness-grinden.

## Grindarna

Var precis med orden här, för det finns två uppsättningar. **Prelaunch-skillen har åtta grindar, numrerade 0–7** (`skills/nortropic-prelaunch/SKILL.md`): 0 bygge, 1 primärhandlingen, 2 prestanda, 3 responsivitet, 4 tillgänglighet, 5 SEO, 6 juridik, 7 säkerhet. **Launch-workflowen kör sju parallella granskningslinser** — technical, leadgen, seo, visual, trust, security, legal — som fördelar grindarna över `qa-launcher`, `seo-optimizer` och `design-reviewer`, var och en med explicita INGÅR/INGÅR INTE-gränser så att ingen lins dubbelrapporterar en annans område (`workflows/nortropic-launch.js`).

Gate 1 är hjärtat — **primärhandlingsgrinden** (v13): `content/profile.ts` läses först och `gate1Test` testas på riktigt end-to-end; saknad profile.ts = FAIL, aldrig tyst hantverkar-default (äldre repon backfillas av stack-builder ur briefens §7). Offert/samtal-fallet är den klassiska kedjan: formuläret skickas end-to-end och **mejlets ankomst är testet, inte ett 200-svar**; boka tid-fallet testar att boka-flödet når den externa bokningstjänsten. Här bor också LEAD_FROM_EMAIL-regeln (P02, förstärkt 2026-07-29 — hette tidigare RESEND_FROM, ett env-namn som inte finns i nyare byggen): avsändaren är portföljkonstanten `formular@nortropic.se` på Nortropics en gång verifierade domän, så fallbacken `onboarding@resend.dev` (levererar bara till kontoägaren) är strukturellt onåbar och Gate 1 kontrollerar det som en assertion; leveranstestet går fortsatt till den skarpa `LEAD_TO_EMAIL`. Gate 6 är juridiken: enbart observation och rapport, aldrig auto-fix, alltid mänskligt sign-off. Gate 7 är säkerheten: beroenden, servade headers, formulärmissbruk (honeypot, en-klocks-tidsfälla, mottagare hårdkodad från env — aldrig från request body) och hemligheter. Fixloopen kör max tre rundor, och varje runda committar och redeployar det fixade trädet INNAN omkontrollen så att URL-baserade grindar granskar rätt bygge (`workflows/nortropic-launch.js`, Fix loop). Efter loopen ankras verdiktet i en **final sweep** (BATCH-006 — NRT-001:s PASS-invariant): när minst en fixrunda committats och alla icke-legal-grindar står gröna körs samtliga sex om EN gång mot den slutliga previewn, vars färskhet måste BEVISAS mekaniskt (deployen skapad EFTER slutcommiten); kan beviset inte föras är svepet odömbart och READY blockeras med ärlig orsak. Svepet kan bara bekräfta eller fälla ett READY — aldrig fria en röd grind (villkorsformen pre-svep-PASS gör uppåt-flipp strukturellt onåbar).

## Motion-nivå och animation

Briefens §5 bär det obligatoriska fältet **Motion-nivå**: `ingen`, `subtil` eller `uttrycksfull`, med `subtil` som default. Det är animationsanvändningens kontrakt nedströms — stack-builder bygger efter det och design-reviewer granskar mot det (`agents/project-planner.md` §5). Sedan gäller **en-biblioteksregeln**: ett animationsbibliotek per projekt, aldrig båda. Motion är default; GSAP väljs endast när nivån är `uttrycksfull` OCH behovet är tidslinje-/scrollsekvenser som Motion inte löser elegant, och valet motiveras med en mening i byggrapporten. Oavsett bibliotek gäller motion-reglerna a–d: rörelse endast när briefen anger det, `prefers-reduced-motion` respekteras alltid, rörelse får aldrig kosta Lighthouse-poäng, och mikrorörelser/entrances — aldrig scroll-jacking (`agents/stack-builder.md`, Rules). Skillen `gsap-build` innehåller SSR-säkra recept och används ENDAST när en-biblioteksregeln redan valt GSAP.

## Retro och underhåll

`/nortropic-retro` forkar stewarden i två lägen. **Doctor** (skope `system`) är den mekaniska hälsokontrollen: tretton numrerade kontroller från frontmatter-parsning och workflow-kompilering till modellkontraktet, vendored-drift, usage-loggtäckning, cache-hygien, docs-referensintegritet och bildmodellernas färskhet (`agents/nortropic-steward.md`, MODE: doctor). **Retro** (skope projektmapp) läser projektets rapporter, EVAL-RESULT och agentminnen, jämför rubrikpoäng mot tidigare klienter och kör fem obligatoriska retrosteg i ordning: bibliotekarien (skill- och MCP-inventering — installerat jämförs mot refererat, varje orefererad skill klassas), det aktiva engångssteget verify-kalibrering, usage-loggen (blockerande sedan 2026-07-29: retron stängs inte utan usage-rad eller loggat vilande-beslut), och trappan & måtten (obligatorisk läsning av `~/.nortropic/factory/AUTO-DIGEST.md` + Goodhart-frågan om måtten själva). Minneskurateringen är också obligatorisk: varje minnespost klassas generell/kundspecifik/föråldrad och redovisas under "Minneshälsa". Det femte steget är K4:s **GC-svep**: sex kunskapsytor städas varje retro, propose-only — inaktuella påståenden, obekräftade gamla observationer, oanvänd kursplan, källor med noll utbyte, tomma erfarenhetssektioner och metadata utan konsument. Borttagning konkurrerar med tillägg om retrons utrymme; kunskap som ingen längre kan belägga läses annars med samma auktoritet som den belagda. Per-projekt-rapporten bär också den obligatoriska sektionen **"Erfarenhet"** (kontext, strategibeslut, större fynd, kundkorrigeringar, misslyckanden inkl. reviewer-blind-spot, post-launch-hypoteser, lärdomskandidater) och hälsoraderna för kompetensregister/kursplan/LEARNING-RECORD. Varje STEWARD-REPORT avslutas med **"Största hävstången"** — DEN enskilda förändring som betalar sig mest just nu, en förändring, inte en lista.

Systemändringar hör hemma **mellan kunder, efter retro**. Det är cache-hygienregeln (doctor #11): stabila systemfiler ger prompt-cache-träffar på ungefär en tiondel av fullpris och reproducerbara byggen, så systemcommits mitt i ett aktivt kundbyggefönster flaggas.

**Rollback-rutin:** visar sig en applicerad systemcommit fel → `git revert <hash>` (aldrig `git reset --hard` på delad historik, aldrig force-push — historiken ska bära spåret), kör doctorn tills 0 FAIL, och för en beslutslogg-rad om reverten (den dokumenterar fakta, precis som appliceringen gjorde). Detta är din MANUELLA rutin för människo-applicerade förslag; trappans egna auto-reverts (N1 vid röd doctor, N2 vid försämrad verify-suite) är en separat mekanism med egna incident-/digest-spår.

## Självförbättringstrappan (v15)

Trappan låter systemet förbättra sig självt utan dig i varje loop — utan att måtten, juridiken eller grindarna någonsin lämnar dina händer. Lagarna bor i [07-konstitution.md](07-konstitution.md): §A är det som ALDRIG självmodifieras, §B är trappans regler. Kill-switchen är filen `AUTOPILOT` i repo-roten: `off` (default — ingen självapplicering), `n1` (endast **Vaktmästaren**: mekanisk synk per uttömmande vitlista — docs-synk, trasiga pekare, retro-inbox- och usage-logg-rader, typos i prosa, beslutslogg-rader för redan applicerade ändringar), `on` (även **Nattskiftet**: fyra zoner — additiv bransch-antislop-skörd med källnot, inspirationskällor med belägg, förtydligande skill-exempel, semantiskt neutrala prosaförtydliganden). Du byter nivå genom att redigera filen och committa — ingen mod rör den någonsin.

Nattskiftet är dessutom låst bakom **aktiveringsgrinden**: det vägrar köra tills raden `RETRO-1-GENOMFÖRD <datum>` finns i [05-beslutslogg.md](05-beslutslogg.md) — retro #1 kalibrerar zonlistorna manuellt först. Varje N1-ändring kräver grön doctor före och efter; varje N2-ändring kräver att regressionssviten `/nortropic-verify-suite` (doctor + plan-torrtest + eval-stabilitet + template-spotcheck mot frysta baselines i `tests/fixtures/`) är icke-försämrad. Försämring ger auto-revert, en incidentfil och modstopp.

Dina stående sysslor är tre. **Digesten:** allt trappan gör landar i `~/.nortropic/factory/AUTO-DIGEST.md` — läs den veckovis; retron läser den obligatoriskt (retrosteg 4, med den uttryckliga Goodhart-frågan: mäter måtten fortfarande det vi bryr oss om?). **Checkpointen:** nattskiftet får göra max 3 ändringar innan du ackat med raden `CHECKPOINT <datum> · t.o.m. <digest-id>` i beslutsloggen — sedan blir allt förslag tills du läst. **Incidenter:** finns `~/.nortropic/factory/AUTO-INCIDENT.md` är läget stoppat och väntar på dig — granska, åtgärda vid behov, radera filen för att återaktivera. Nya baselines klipps med `/nortropic-verify-suite --cut-baseline` (skriver kandidater till `~/.nortropic/factory/`); att committa dem till `tests/fixtures/` är alltid din handling (§A6).

## Docs-underhållet (nytt i v9)

Dokumentationen i `docs/` är en del av systemet och underhålls med samma disciplin. Varje docs-fil (och README) inleds med raden `Senast verifierad mot systemet: <datum> · <versionsmärke>` — datumet säger när filens påståenden senast verifierades mot systemfilerna, versionsmärket vilken systemversion/commit de verifierades mot (t.ex. `v17 (denna commit)`). **Docs-synk** betyder: verifiera om varje påstående i filen mot källfilerna och uppdatera raden. Filerna under `docs/arkiv/` är fryst historik och uppdateras inte. En ändring i agents/, skills/ eller workflows/ som gör en docs-fil inaktuell ska rätta docs-filen i samma commit — dokumentation som driftar är värre än ingen, för den ljuger med självförtroende. Sedan **v17** finns dokumentationen i två lager — ett enkelt nybörjarlager ([00-borja-har.md](00-borja-har.md)) och det avancerade (01–07); regel 22 kräver att det enkla läses först och uppdateras i samma commit som teknisk dokumentation ändras.

Underhållet är inbyggt på fyra ställen. Stewardens förslagmall bär det obligatoriska fältet **Docs-påverkan** (`<docs-fil + sektion | "ingen">`), och appliceringsregeln säger att ett förslag med docs-påverkan committas IHOP med sin docs-uppdatering — aldrig separat — samt att varje applicerat förslag ger en rad i [05-beslutslogg.md](05-beslutslogg.md) (`agents/nortropic-steward.md`, OUTPUT #2; `skills/nortropic-retro/SKILL.md`). Bibliotekarien i retron ställer följdfrågan om något i retron gjort en docs-fil inaktuell (`agents/nortropic-steward.md`, retrosteg 1 punkt v). Och doctor-kontroll **#12** vaktar drift mekaniskt: agenttabellen mot frontmattern, regelverkets sökvägar mot disken, kommandona mot skills/workflows, Senast verifierad-datumen mot senaste systemcommit, och (v17, delkontroll e) att det enkla dokumentationslagret ([00-borja-har.md](00-borja-har.md)) inte drivit ifrån det avancerade — avvikelse ger WARN "docs har driftat, kör docs-synk".

## Kostnadsdisciplin

Mätryggraden är **usage-loggen** (`~/.nortropic/factory/usage-log.md`): efter varje retro loggas förbrukning per agent och projekt, och inga kostnadsförslag får läggas utan loggrader (`agents/nortropic-steward.md`, retrosteg 3 + doctor #10). Ovanpå den vilar tre mekanismer: **verify-kalibreringen**, en engångsmätning där en verifierad och en overifierad review körs på samma commit och stewarden dömer mekaniskt efter beslutsreglerna — en skeptiker, skeptiker endast för CRITICAL/HIGH, eller verify endast i launch (`skills/nortropic-retro/references/verify-kalibrering.md`); **diff-skopningen**, som gör mellangranskningar billiga utan att sänka ribban; och **Sonnet-trappan** ovan. Allt är förslag, inget självutlösande — siffrorna kommer från loggen, besluten från dig.
