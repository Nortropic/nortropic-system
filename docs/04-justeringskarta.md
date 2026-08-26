# Justeringskartan — ändra med öppna ögon

Senast verifierad mot systemet: 2026-08-25 · v17 (denna commit)
Verifieringsomfång: delta-verifierad mot systemändringarna sedan 2026-07-30 (BATCH-001–004BE) samt mot S1-min+K4-batchen 2026-08-25 (statustabell respektive Paket-arkitekturen); hela filen läst i denna batch, 0 påståenden i den ogiltigförklarade. Basstämpeln 2026-07-30 sattes av [AUTO-N1] 64acf9f och är inte oberoende granskad.

Varje större designval i systemet kostar något och köper något. Det här dokumentet finns för att du ska kunna skruva — eller ta bort — ett val medvetet: här står vad det kostar, vad det köper, exakt var man skruvar, och vad som sannolikt händer utan det. Ändringar går som vanligt via steward-förslag och commit; historiken bakom varje val finns i [05-beslutslogg.md](05-beslutslogg.md).

## Adversarial verify (två skeptiker per granskningsfynd)

**Vad det kostar:** ungefär en fördubbling av agent-anropen i reviewens Verify-fas — två skeptiker per fynd, var och en med egen lins (faktisk sanning i koden respektive spelar-det-roll) (`workflows/nortropic-review.js`).
**Vad det köper:** rapporter utan brus. Fynd som båda skeptikerna misslyckas att vederlägga är CONFIRMED; det en skeptiker tvivlar på blir PLAUSIBLE; resten stryks. Utan det behandlas varje granskarhugskott som sanning och fixloopar bränner rundor på pedanteri.
**Exakt fil att skruva i:** `workflows/nortropic-review.js` (Verify-steget) — och kalibreringsprotokollet med mekaniska beslutsregler i `skills/nortropic-retro/references/verify-kalibrering.md` (en skeptiker; skeptiker endast CRITICAL/HIGH; verify endast i launch). Skruva via kalibreringen, inte på känsla.
**Om det tas bort:** fler falska fynd når rapporten, fixloopen åtgärdar saker som inte är trasiga, och förtroendet för CONFIRMED-etiketten försvinner. `--no-verify` finns redan som kontrollerad väg att mäta exakt detta.

## Designkanonen (8 obligatoriska skills i design-reviewer) + byggkanonen (v14)

**Vad det kostar:** åtta skill-laddningar per granskning — kanonen är den enskilt största kostnadsposten i review-fasen, vilket är precis varför kanon-kostnadsvakten finns (`agents/nortropic-steward.md`, Stående regel 4). Byggkanonen (v14) adderar därtill 4–5 skill-laddningar per bygge hos stack-builder/content-designer; usage-loggen visar kostnaden och kostnadsvakten/steward får föreslå trimning MED DATA om en laddning inte mätbart bär sin vikt (samma mönster som verify-kalibreringen).
**Vad det köper:** granskning mot en extern, stabil kvalitetsribba i stället för granskarens dagsform. `ui-ux-pro-max` fungerar som facit för briefens valda riktning; `find-animation-opportunities` binds till Motion-nivån.
**Exakt fil att skruva i:** `agents/design-reviewer.md` (processteg 2 — listan över vilka som laddas). Kostnadsvaktens avsedda justering: flytta de två minst bidragande skillsen tillbaka till eskalering, med fynddata som underlag.
**Om det tas bort:** granskningarna konvergerar mot generiskt tyckande, slop-mönster slinker igenom och eval-kriterierna 1/3/9/10 faller över tid. Kanonen gjordes obligatorisk för att "when depth is needed"-eskalering i praktiken aldrig triggades (v7 L3).

## Modellmatrisen (Fable där systemet tänker, Opus där det bygger)

**Vad det kostar:** premiummodell med effort max på de två tänkande agenterna, och Opus i stället för billigare modeller på resten — medveten överkapacitet i verifierarleden.
**Vad det köper:** brief- och stewardkvalitet (allt nedströms ärver deras omdöme) och förutsägbar kvalitet i bygge/granskning. Doctor #8 fäller varje tyst avvikelse från kontraktet.
**Exakt fil att skruva i:** frontmattern (`model:`/`effort:`) i respektive `agents/*.md` OCH MODELLKONTRAKTET i `agents/nortropic-steward.md` (SYSTEM MAP) — båda samtidigt, annars fäller doctor #8. Den avsedda nedskruvningsvägen är Sonnet-trappan (Stående regel 3): aktiveras först efter två raka klienter med eval ≥90 och noll grind-missar, med rollback-klausul.
**Om det tas bort:** utan kontraktet kan modellval drifta per agent utan att någon märker det förrän kvaliteten sjunker — och utan trappvillkoren blir nedskruvning en gissning i stället för ett mätt beslut.

## Diff-skopning (mellangranskningar med `--diff`)

**Vad det kostar:** en extra mekanisk scout-agent per diff-körning, plus regelbördan att hålla kadensen full → diff → full.
**Vad det köper:** mellangranskningar som bara betalar för det som ändrats, utan att sänka ribban — kanonen laddas som vanligt, ytan är skopad. Rapportmetan + freshness-grinden garanterar att launch aldrig sker mot en diff-skopad eller föråldrad bild.
**Exakt fil att skruva i:** `workflows/nortropic-review.js` (Scope-fasen + kadensregeln i `whenToUse`) och `workflows/nortropic-launch.js` (Freshness-fasen).
**Om det tas bort:** antingen fullpris för varje mellangranskning, eller — om man tar bort freshness-grinden — launch mot en rapport som inte beskriver nuvarande commit. Det senare är dyrare: grindar som godkänner fel bygge upptäcks först av kunden.

## Vendoring (facit-kopior av de 9 bärande skillsen)

**Vad det kostar:** nio kopior att hålla i repot och en diff-kontroll per doctor-körning; upprepade WARNs när marketplace auto-uppdaterar original.
**Vad det köper:** obligatoriska steg som inte kan ändras under fötterna på systemet. Kedjan är obligatorisk ⇒ bärande ⇒ vendorad: det design-reviewer och content-designer MÅSTE ladda har ett fruset facit med innehållshash, och varje uppströmsändring blir en medveten granskning i stället för tyst drift (`vendored-skills/*/VENDORED.md`, doctor #9).
**Exakt fil att skruva i:** `vendored-skills/` (kopiorna) och `agents/nortropic-steward.md` (doctor #3-listan över vilka som är obligatoriska + doctor #9-diffen).
**Om det tas bort:** en marketplace-uppdatering av t.ex. `content-humanizer` ändrar systemets beteende utan spår — kvalitetsskiften som inte går att härleda till någon commit i det här repot.

## Självförbättringstrappan (v15 — vaktmästaren + nattskiftet under konstitutionen)

**Vad det kostar:** en full verify-suite-körning per N2-ändring (doctor + plan-torrtest + eval + template-spotcheck — plan-torrtestet är den dyra proben), doctor före/efter varje N1-ändring (batchning halverar), granulära commits, och din stående digest-läsning + CHECKPOINT-ack.
**Vad det köper:** driftfria docs och ackumulerande förbättringar utan människan som flaskhals i varje loop — med måtten, juridiken och grindarna kvar i mänsklig ägo (07-konstitution §A) och all granskning flyttad till efterhand (digesten) i stället för borttagen.
**Exakt fil att skruva i:** `AUTOPILOT` i repo-roten (off|n1|on — nivån), `docs/07-konstitution.md` §B (lagarna — alltid människa, alltid HÖGRISK-commit), MODE-sektionerna i `agents/nortropic-steward.md` (vitlistan/zonerna — §A-ytan får aldrig in), `tests/fixtures/` (baselines — endast människa, kandidater via `--cut-baseline`).
**Om det tas bort:** sätt `AUTOPILOT` till `off` — trappan är död utan att något annat rörs; kvar är antingen manuellt synk-slit (vaktmästarens arbetslista blir din) eller docs-drift. Tas i stället GRINDARNA bort (suiten, taket, §A) är det inte trappan som försvinner utan styrningen — det läget är aldrig ett justeringsval, det är regel 20-brott.

## Obemannat läge (v16 — hela kundflödet utan människa mellan noderna)

**Vad det kostar:** förlorad löpande smakkontroll vid nod 3 — ett obemannat bygge kan landa i en §5-riktning du inte godkänt och kräva omtag — och fakta/juridik måste samlas till `FINAL-TOUCHES.md` i efterhand i stället för att lösas längs vägen.
**Vad det köper:** obemannad genomströmning (research in på kvällen → färdig preview på morgonen) — turbon för gratis-byggen och omdömesmotorn; billig precis när insatsen är låg och nod-3-försäkringen inte är värd sin tid.
**Villkorade stopp (det som ändå pausar):** master-workflown lämnar ALLTID över till människa vid saknade obligatoriska research-fält (input-grinden), ohanterad eller scope-nej juridikflagga, eller en kvarstående STRATEGISK öppen fråga. Bara FAKTA/BESLUT deferreras till FINAL-TOUCHES — riktnings- och juridikrisk stoppar.
**Invarianten som aldrig rörs:** deploy/launch trycks ALLTID av en människa — `nortropic-autobygg.js` saknar deploy-förmåga by design (nod 8 juridik-signoff + nod 9 `/vercel:deploy` förblir mänskliga). Obemannat läge hålls dessutom begreppsligt ÅTSKILT från självförbättringstrappan/AUTOPILOT (docs/07 §B1): `AUTOPILOT` styr systemets självförbättring, research-radens `Läge` styr kundflödet — de blandas aldrig.
**Exakt fil att skruva i:** research-radens `Läge:` (default **`obemannat`** sedan S12; `bemannat` begärs uttryckligen), `workflows/nortropic-autobygg.js` (orkestreringen + de villkorade stoppen, inkl. fixkontraktets ÖVERLÄMNAD vid brutet kontrakt — BATCH-005), `workflows/nortropic-final-touches.js` (slutlistan) och frågeklassningen STRATEGISK/FAKTA/BESLUT i `agents/project-planner.md`.
**Om det tas bort / när bemannat:** utelämna `Läge`-raden helt → alltid bemannat, dagens nod-3/nod-8-flöde oförändrat. Välj obemannat för gratis-byggen och låginsatskunder, bemannat för betalande — nod-3-godkännandet är billig försäkring mot en sajt i fel riktning.

## Fixloop-djup: 3 rundor bemannat vs 1 obemannat

**Vad det kostar:** två workflows som ser lika ut men skiljer sig i rundantal — någon som "harmoniserar" dem kan tro att obemannats enda runda är en ofärdig kopia av launchens tre.
**Vad det köper:** obemannat saknar mänsklig blick UNDER körningen → en fixloop-runda + överlämning håller autonomin kort och lägger beslutet hos människan tidigt; bemannat har en människa vid ratten och får iterera upp till 3 rundor innan stopp. Asymmetrin är en avsiktlig säkerhetsegenskap, inte en inkonsekvens.
**Exakt fil att skruva i:** `workflows/nortropic-launch.js` (Fix loop, `while (round < 3)`) och `workflows/nortropic-autobygg.js` (Review, EXAKT EN fixloop). OBS: launch-gränsen 3 är §A-skyddad (`docs/07-konstitution.md` §A3) — höjs/sänks bara av människa, HÖGRISK-commit.
**Om det tas bort:** höjs obemannat till 3 kör systemet längre utan mänsklig blick (mer autonom risk); sänks bemannat till 1 bränns färre rundor men fler sajter når onödig handover innan de hunnit konvergera.

## Tvålagers-dokumentation (v17 — enkelt nybörjarlager + avancerat)

**Vad det kostar:** ett extra dokumentationslager att hålla vid liv; doctor-delkontroll #12(e) + regel 22 som löpande börda; disciplinen att synka båda lagren i SAMMA commit när teknisk dokumentation ändras.
**Vad det köper:** bus-factor-1-mildring — systemet blir förståeligt och överlämningsbart utan att ägaren sitter bredvid; en enda ingång ([00-borja-har.md](00-borja-har.md), fabriks-metafor) som vem som helst begriper på ett svep.
**Regeln som håller det:** enkla lagret läses FÖRE och uppdateras i samma commit som teknisk dokumentation ändras (regel 22); doctor #12(e) WARN:ar om det avancerade lagret drivit ifrån det enkla; `CLAUDE.md` pekar mot ingången (aldrig förklarar — den laddas varje tur och kostar kontextbudget).
**Exakt fil att skruva i:** `docs/00-borja-har.md` (enkla lagret), `CLAUDE.md` (pekaren), regel 22 i `docs/03-regelverk.md`, och doctor #12(e) i `agents/nortropic-steward.md`.
**Gränsen:** regel 22 är en dokumentationsregel, INTE en konstitutionsinvariant — den skyddar inte kundlöften eller kvalitet, bara begriplighet. Därför ligger den bland de vanliga reglerna, aldrig i konstitutionens §A.

## Paket-arkitekturen (ETT kalibrerbart paket, aldrig en kopia per bransch)

**Vad det kostar:** allt måste uttryckas som kalibrering i stället för som kod — varje ny bransch tvingas in i briefens §7 (primärhandling, röst, kvitton, schema, SEO-läge) och `content/profile.ts` i stället för att få en egen gren att skruva fritt i. Det gör enskilda specialfall omständligare, och paketets yta växer med varje bransch den ska rymma. Statustabellen i [06-scope.md](06-scope.md) blir dessutom en egen sak att hålla ärlig.

**Vad det köper:** en måttstock i stället för N. Ett paket (`lokal-se`) betyder att en förbättring av granskning, grindar eller copy-kanon når ALLA kunder samtidigt, att evidens ackumuleras på samma yta i stället för att splittras per bransch, och att kompetens går att uttala sig om alls — `kompetens = konfiguration × yta` är meningslöst om ytan är en annan för varje kund. En kopia per bransch är hur ett system tappar förmågan att svara på "är vi bättre än förra kvartalet".

**Exakt fil att skruva i:** [06-scope.md](06-scope.md) (ringmodellen + statustabellen — vilka paket som finns och var de står), `agents/project-planner.md` (§7-kalibreringen som ersätter kopiering) och `content/profile.ts`-kontraktet i kundrepot (transporten av kalibreringen). Nya paket får INTE födas som kopior: de deklareras i statustabellen som DECLARED och byggs vid första ja.

**Gränsen mot §A:** detta är paket i betydelsen KAPACITETSPAKET (`lokal-se` — den repo-nativa `packs/`-ytan som docs/07 §A7 pekar mot). Kundvända PAKET i affärsbemärkelse — priser, paketinnehåll, kundlöften — är §A5 och rörs aldrig här.

**Om det tas bort:** väljer man i stället en gren eller ett repo per bransch försvinner den delade måttstocken först och kvaliteten sedan: grindar och kanon driftar isär per kopia, en fix måste appliceras N gånger (och blir det inte), evidens blir n≈1 överallt i stället för ackumulerande på ett ställe, och PROVEN blir ett påstående ingen kan belägga. Vinsten — friheten i enskilda specialfall — betalas med systemets förmåga att veta om det blir bättre.

## En-biblioteksregeln (Motion ELLER GSAP, aldrig båda)

**Vad det kostar:** ett uttrycksmedel mindre i enskilda fall — den som vill ha GSAP:s tidslinjer OCH Motions deklarativa API i samma projekt får välja.
**Vad det köper:** mindre bundle, en mental modell per projekt, och ett motiverat val i byggrapporten i stället för ett slentrianmässigt. Regeln kopplar till briefens Motion-nivå: GSAP kräver `uttrycksfull` plus ett konkret tidslinje-/scrollbehov.
**Exakt fil att skruva i:** `agents/stack-builder.md` (Rules — regeln + motiveringskravet) och `skills/gsap-build/SKILL.md` (GSAP-receptens gränser).
**Om det tas bort:** projekt samlar båda biblioteken, bundlevikt och CWV-risk stiger (prestandagrinden i Gate 2 fäller ändå till slut — men då som launchblockerare i stället för ett tidigt byggbeslut), och motiveringen i byggrapporten försvinner som beslutslogg.
