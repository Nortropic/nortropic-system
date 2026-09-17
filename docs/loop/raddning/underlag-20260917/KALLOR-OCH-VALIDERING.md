# Källor och validering — utgåva 2, 17 september 2026

## Vad denna utgåva gör

Detta är en revidering av uppdragsmaterialet, inte en ny full kod-/säkerhetsaudit. Den bygger på Johnnys senaste förtydligande: avför dokumentationsrester, håll en gemensam arbetsordning för Claude Code och Codex och undvik att kvotstopp skapar nya arbetslinjer eller osynligt ackumulerat arbete.

Uppskattningen ”typ 300 commits” behandlas som användarens beskrivning av problemet, inte som en ommätt uppgift om antal commits, grenar eller worktrees. Det tekniska måttet ska skilja osparat, lokalt committat, fjärrbevarat, granskat och integrerat arbete. Ett högt commitantal i sig är inte en kvalitetsdom.

Utgåva 1 och auditens källmaterial bevaras under `underlag/`. Deras arbetsorder är historiska. Ingen äldre formulering som motsäger denna utgåvas uppdrag ska bli aktiv genom att hela paketet autoladdas.

## Kontrollerade repofakta i denna session

Läsningarna gjordes via GitHub-anslutningen. Ingen repository-write gjordes.

| Källa | Observation | Slutsatsens gräns |
|---|---|---|
| `GET /repos/Nortropic/nortropic-system/git/ref/heads/main` | Main pekade på `eb9483e932be528231d3e9212d816ebad76ef114`. | Ingen inspektion av aktuellt lokalt arbete eller antagande att denna revision alltid är arbetsbas. |
| `CLAUDE.md`, rader 24–38 på denna revision | Ingången beskriver fortfarande §A-utvidgning till `specs/**`, `verify/**`, `controller/**` och `CLAUDE.md`. | Visar skriven instruktion, inte vilken komplett kontext en viss lokal session faktiskt laddade. |
| `AGENTS.md`, rader 155–175 på samma revision | En senare angiven ändring undantar controller/specs/verify från den äldre blankettskrivningen och hänvisar till taskens tekniska skydd och rollflöde. | Belägger en skillnad i ingångarnas framställning; teknisk runtimebehörighet måste provas separat. |
| `AGENTS.md`, rader 171–199 | Publiceringsbefogenheten beskrivs för kedjedrivaren, skilt från rollagenterna. | Inte verifierat att motsvarande aktuella GitHub-/runtimevillkor faktiskt är uppfyllda. |

Repoingångarnas skillnad stärker behovet av en gemensam källa och en faktisk laddningskontroll. Den bevisar inte att just denna motsägelse orsakade alla tidigare omtag. Main, lokala grenar och laddad kontext måste jämföras där arbetet körs.

Källor på granskad revision:

- `https://github.com/Nortropic/nortropic-system/blob/eb9483e932be528231d3e9212d816ebad76ef114/CLAUDE.md`
- `https://github.com/Nortropic/nortropic-system/blob/eb9483e932be528231d3e9212d816ebad76ef114/AGENTS.md`

## Externa primärkällor

Dessa är leverantörsdokumentation läst denna session. De ersätter inte verifiering av installerad version och faktisk konfiguration.

### S1 — Anthropic, How Claude remembers your project

`https://code.claude.com/docs/en/memory`

Dokumenterar importen `@AGENTS.md` i CLAUDE.md för gemensamma instruktioner. Beskriver även att föräldra-/lokala och underkataloginstruktioner kan påverka kontexten, samt att motstridiga instruktioner bör avföras. CLAUDE.md är kontext, inte mekanisk verkställighet. Det motiverar en tunn import och prov av verklig instruktionkedja, inte en garanti att en modell aldrig följer fel.

### S2 — OpenAI, Custom instructions with AGENTS.md

Begärd adress: `https://developers.openai.com/codex/guides/agents-md`

Den omdirigerade officiella adressen: `https://learn.chatgpt.com/docs/agent-configuration/agents-md`

Dokumenterar global och projektlokal instruktionupptäckt, `AGENTS.override.md`, underkatalogernas prioritet och en storleksgräns för sammanfogad instruktion. Därför räcker inte en kontroll av enbart repo-roten. Denna långa engångsmission ska inte kopieras in som stående Codex-ingång. Installerad konfiguration och laddningsspår måste kontrolleras vid genomförandet.

### S3 — Anthropic, Hooks reference, SessionEnd

`https://code.claude.com/docs/en/hooks#sessionend`

SessionEnd har tidsgräns och kan inte hindra sessionsslut. Att bevara endast i sista ögonblicket är därför ingen verifierad kontinuitetslösning. Uppdraget föreskriver bevarande vid delsteg och verkliga avbrottsprov. Det är en härledd rekommendation; dokumentationen är inte ett bevis för att Nortropics hookar fungerar eller alltid misslyckas.

Uppgifterna om GitHub-app och Code Review från utgåva 1 har inte omverifierats i denna session. Den tidigare faktaredovisningen finns under `underlag/tidigare-leverans/KALLOR-OCH-VALIDERING-v1.txt`. Det aktiva uppdraget kräver fortsatt aktuell officiell kontroll före ny setup.

## Granskning av den reviderade uppdragstexten

Detta är egen semantisk scenariogranskning, inte en separat modellreview och inte exekverade produktprov.

| Riskfall | Revidering och återstående prov |
|---|---|
| Gamla ”börja här”-order finns kvar under en ny varningsbanner. | Aktiv order ska revideras rent eller avföras; historik får en återfinnbar källa. Faktisk startväg måste provas. |
| Ett arkiv innehåller filer med autoladdade instruktionsnamn. | Arkivet ska inte bli en ny instruktionsrot. Bytebundna original bevaras, tillåten laddningsväg ändras och prövas. |
| CLAUDE.md och AGENTS.md driver samma påstådda regler men uppdateras separat. | Gemensam källa med tunn verktygsingång; exempelvis understödd import, utan kopiering av hela auditpaketet. |
| En lokal override laddas före/efter gemensam fil. | Kontrollerad laddningskedja även utanför repo-roten där tillåtet; otillgänglig källa markeras som lucka. Ingen tyst borttagning av säkerhetsregler. |
| En gammal assistentplan motsäger ett senare ägarbeslut. | Källtyper skiljs åt. Varken senaste lästa fil, ny tidsstämpel eller kodens faktiska beteende blir automatiskt ny befogenhet. |
| ”Ingen städning” skulle blockera användarens dokumentationssanering. | Den äldre allmänna meningen är ersatt. Aktiv dokumentationssanering ingår; massradering av arbete/evidens gör det inte. |
| Ren dokumentation kräver radering av en fil som ett fryst prov läser. | Beroendemigration och rätt kontraktsroll före ändring; den filen kan bevaras oförändrad utan att bli aktuell arbetsorder. |
| Byt verktyg när kvoten plötsligt tar slut. | Återupptag från varaktig state och verifierbara fakta. Ingen obligatorisk lyckad slutrapport, ingen budgetreset och ingen ny task bara för bytet. |
| Den gamla processen fortsätter trots bruten anslutning. | Skrivövertagande först efter avslut eller effektiv avskärmning; read-only-validering kan ske innan dess. |
| Reviewer och builder råkar byta modellnamn. | Rollseparationens innebörd består; modellbyte gör inte egen kodgranskning oberoende. |
| Allt pushas men inget integreras. | Separat status för fjärrbevarande och leverans, liten integrationslinje, hantera blockerad integration innan beroende WIP växer. |
| Offline commit saknas för en fjärrsession. | Uppgiften blir inte tillgänglig genom en statusrad. Lokal bevarandestatus ska vara sann; fjärrsession får inte gissa innehåll. |
| Merge kan redan ha skett när anslutningen dog. | Läs faktisk fjärr-/PR-kvittens före upprepning. Prova i tillåten testyta, inte obehörig mainoperation. |
| Codex saknar kvot för det tvåvägs provet. | Just detta prov står EJ KÖRT. Simulerade prov redovisas separat; giltigt arbete med tillgängligt verktyg kan fortsätta. |
| Dokumentationssaneringen växer utan slut. | Begränsad aktiv instruktionkedja, befintliga hemvister och angivna acceptansrader. Resten blir specifika frågor, inte ännu en total inventering. |
| Agenten följer ändå en historisk instruktion. | Dokumentation ger ingen garanti. Faktiska handoffprov plus befintliga policy-/grind-/mergegränser måste förbli verksamma. |

## Utförda tekniska paketkontroller

`validering/validate_package.py` kontrollerar filstruktur, att föregående underlag bevarats byteidentiskt, att huvudavsnitten finns, att den uttryckligen upphävda allmänna städningsmeningen inte längre står i det aktiva uppdraget och att starttexten pekar på en existerande uppdragsfil. Den kontrollerar även att det inte finns en CLAUDE.md-/AGENTS.md-/SKILL.md-fil i paketet som oavsiktligt skulle kunna fungera som automatiskt inläst instruktion.

Kontrollen är strukturell. Att en formulering finns bevisar inte att den förstås eller verkställs; granskningen ovan och de föreskrivna faktiska proven har andra uppgifter. Resultatet får aldrig anföras som kernel-PASS eller verifierad verktygsväxling.

Den tidigare auditens sju reducerade reproducerare har **inte** körts om i denna utgåva. Deras kod och gamla körresultat har bevarats oförändrade som historik. De provar inte automatiskt aktuell produktkod.

## Det som inte gjorts

Inga Nortropic-kodfiler eller GitHub-inställningar ändrades. Ingen faktisk Claude Code-/Codex-session, Darwin-grind, abrupt runtimeåterhämtning eller fjärrpublicering kördes. Ingen oberoende modellreview utfördes. Modellbytets riktiga funktion och dokumentationssaneringens resultat måste verifieras av utföraren i rätt miljö. Detta paket anger uppdrag och stängningsvillkor, inte ett löfte om felfri autonomi.
