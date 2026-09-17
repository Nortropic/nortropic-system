> **UTKAST — TRANCHE 0 (2026-08-24). EJ PRODUKTION, EJ AUKTORITET.**
> Design-utkast enligt den DESIGN-FRUSNA masterplanen. Konsumeras av INGENTING
> före FOUNDATION_REPAIR_GATE; skarp version landar i sin riktiga hemvist i S1+.

# Research-kontrakt — universell kärna v3

**Kontraktsversion: v3.0.0-UTKAST**

> Semver enligt eval-rubrikens mönster. PATCH = formulering/förtydligande · MINOR = ny valfri rad/underrubrik · MAJOR = ändrade obligatoriska sektioner, kontrollradsfält eller radformat. Varje research.md stämplar versionen i sin `Kontrakt:`-rad. Jämför aldrig research-filer över MAJOR-gräns utan notering.

**Skarp hemvist (S1):** `skills/nortropic-research/references/research-contract.md` i nortropic-system. `verkstadsgolvet/lib/prompt-research.ts` blir en tunn komponerare (`prompt-core.ts` + `prompt-packs/<id>.ts`) som bär **vendorerade pinnade bytes med exakt commit + hash (KONTRAKT-SHA)**. **Ingen muterbar runtime-läsning av GitHub-branchar får någonsin bli professionell auktoritet** — färskhet går uteslutande vägen Radar → kandidat → verifiering → promotion.

## Syfte och gräns

Researchen levererar **fakta med belägg och kapacitetssignaler — aldrig beslut**. Strategi, kapacitetskompilering och kvalitetskontrakt bor i plannerns brief (§7). Separationen upprätthålls av KONTRAKT, inte av pipeline-steg: research.md bär bara fakta + signaler; briefen bär alla beslut.

## Versionsdetektering (D5 — aldrig tyst omtolkning)

- research.md **utan** `Kontrakt:`-rad = **v2 = LOCAL implicerat** = legacy INPUT GATE. Gamla kundrepon förblir läsbara för evigt; backfill endast vid ombygge.
- En v3-fil inleds med exakt två rader:

```
Kontrakt: research-v3.0.0
Paket: <id>@<version>[, <id>@<version>...] | INGA
```

## Bevisdisciplinen (oförändrad från v2 — lagarna)

- **Fakta, inte slutsatser.** Researchen fabricerar aldrig; den drar inga strategiska slutsatser.
- **Belägg per påstående.** Varje faktapåstående får en källnot i parentes (formulär / FB / IG / sajt / sökning / register) så att det kan verifieras.
- **Allt obelagt markeras `[OSÄKER]`.** Osäkerheten följer med hela vägen — den maskeras aldrig.
- **Konflikt noteras, väljs aldrig.** Kundens egna uppgifter är facit; motsäger andra källor dem noteras konflikten i stället för att en sida väljs.
- **Read-only överallt.** Skicka aldrig formulär, DM eller kontaktförfrågningar. Regeln omfattar även estate-genomgången (§7/§10): befintliga sajter och kanaler LÄSES, aldrig muteras.

## Komposition: kärna + paketmoduler

- Den universella ryggraden är sektionerna **1–17** nedan. **Universell numrering skiftar aldrig.**
- Paketmoduler appenderar sina sektioner under rubriken `## PAKETMODULER (<id>@version)` med **prefixade sektions-ID:n** (t.ex. `lokal.1`, `lokal.2` …). Paketens kontrollradsrader läggs till i §17 med prefixade fält-ID:n (`lokal.telefon`).
- **Monotoni-lagen: paket får bara SKÄRPA.** Ett paket får lägga till sektioner och kontrollradsrader — aldrig ta bort, försvaga eller omdefiniera en universell rad. (Gaming-vakt; bevarar Ring-1-djupet mekaniskt.)
- Paketaktivering vid onboarding är tri-state: `Lokal | Annat | Osäker` (billig heuristik + operatörshypotes, alltid överstyrbar). **`Osäker` ⇒ enbart kärnprompt.**
- Den komponerade LOKAL-prompten ≈ dagens längd (nya universella sektioner är korta; lokal-massan flyttar ut). Enbart-kärna-prompten är KORTARE än dagens.

## De 17 universella sektionerna

### 1. Organisation & kontakt
Namn, org-form, org.nr om belagt. **Kontaktvägar TYPADE:** `telefon | e-post | plats | bokningslänk` — per kontaktväg: värdet, var det observerats och om det är **verifierat** (synligt på minst en kontrollerbar yta). Öppettider om de finns.

### 2. Erbjudande
Vad organisationen erbjuder, med kundens egna ord. Tjänster/produkter/program/innehåll — kärnan antar ingen bransch.

### 3. Användare & målgrupper *(NY)*
Vilka som faktiskt använder/ska använda sajten, med belägg (formulärsvar, omdömen, följarmönster, kundens beskrivning). Skilj på betalande kund och slutanvändare där de skiljer sig. Inga personas — bara belagda grupper.

### 4. Toppuppgifter & primärt utfall *(kandidatmappning — FRITT FORMAT)*
Hur användare FAKTISKT interagerar/konverterar i dag, med belägg per observation: vad de gör, i vilken kanal, med vilka svarsmönster. Vad kunden *önskar* att sajten ska driva. Avsluta med **≥1 primärt-utfall-kandidat i fri text** — får vara `[OSÄKER]`, får aldrig saknas. **Ingen sluten vokabulär i kärnan** — den slutna primärhandlingslistan (ring nu/boka tid/platsförfrågan/offert/besök) är lokal-se-paketets vokabulär, inte kärnans. Två motstridiga signaler = notera båda.

### 5. Geografi & språk
Belagt verksamhetsområde (lokalt/nationellt/EU/global), språk på befintliga ytor, om plats alls är relevant för användaren. Ort är BEVIS här, aldrig formulärtoken.

### 6. Förtroende & bevis
Förtroendeunderlag generaliserat: certifieringar, omdömen (betyg + EXAKT antal + plattform), kundcase/portfolio, produktbevis, säkerhets-/integrationsbevis, år i verksamheten, fysisk plats, press — det som är belagt, med källa. Branschspecifik kvitto-vokabulär (F-skatt, försäkring, garanti …) bor i paketmoduler.
**NYSTARTAD-läget (ordagrant bevarat från v2):** om organisationen är nystartad och underlag saknas — växla till person-först: grundarens bakgrund/utbildning (med datum), startår, ansiktsporträtt, rimliga löften från dag ett. Markera tydligt: **"NYSTARTAD — kvitton saknas, person-först gäller."** Kudda aldrig med lånade meriter.

### 7. Innehåll & bildmaterial
Befintligt innehåll värt att bevara, bildinventering (antal ANVÄNDBARA bilder, motivtyper, hero-kandidater, porträtt), rättighetsläget alltid flaggat. **Bild-URL:er strukturerat per sektion** (hero-kandidater, galleri, porträtt, övrigt), en URL per rad med kort not; kan exakt URL inte extraheras skrivs "kräver original från kund" — nedladdning sker vid BYGGET efter publiceringsgodkännande, aldrig i detta steg.
**Estate-underrader (obligatoriska, Part 2d L):**
- Befintlig sajt: plattform, toppsidor (från kund + crawl av deklarerad sajt), vad som ska bevaras (URL:er med SEO-värde, texter), kända problem.
- **Indexerad verklighet:** `site:`-kontroll — vilka URL:er är faktiskt indexerade.
- Analytics-närvaro: finns mätning, vilken.
- GBP-status: finns profil, är den claimad, av vem.

### 8. Röst & varumärke
1–2 ordagranna exempel ur kundens eget material + 2–3 exempel på sektorns eget språk. Ton, befintliga varumärkeselement (logo, färger) om de finns.

### 9. Transaktion & data *(NY — RÅ OBSERVATION)*
Säljer organisationen online? Tar den bokningar, betalningar, medlemskap, inloggning, kunddata? Rapportera **endast observationer med citat/källa — inga bedömningar**. (Signalerna landar i §15 och avgörs nedströms mot katalogens statefulness-lag; researchen dömer aldrig.)

### 10. Integrationer *(NY)*
Befintliga system: bokning, kassa, CRM, nyhetsbrev, kalender, sociala flöden, embeds — namngivna, med belägg.
**Estate-underrader (obligatoriska):**
- **Domänägarskap:** vem kontrollerar domänen/DNS (registrar, åtkomst) — `KLART | OKLART` (återkommande SMB-fallgrop).
- Mejlberoenden på domänen (MX — flyttrisk vid domänbyte).

### 11. Juridik-/risk-observationer *(oförändrad)*
Rapportera med citat/källa om något förekommer: hälsa/kropp/medicin · livsmedel · finans/försäkring · barn som primär målgrupp · alkohol/tobak · vill sälja online · vill ha bokning/inloggning/medlemsdata (notera om extern tjänst redan används). **Bara observationer — inga bedömningar.** Flaggregistret bor i EN hemvist: `nortropic-plan/references/juridikflaggor.md` — peka, kopiera aldrig; klassning görs av plannern.

### 12. Konkurrenter & alternativ
**"Vad jämför användaren med?"** — inte bara samma bransch: alternativ kan vara nationella kedjor, appar, plattformar eller att inte göra något alls. 2–3 poster: URL, en mening styrka/svaghet, synliga betyg om relevanta. Ingen djupanalys. Aldrig fabricerade observationer eller betyg.

### 13. Designreferenser *(universellt recept)*
Recept: 3 × verkliga sektor-sajter · 1–2 × kuraterade gallerier (SiteInspire, Land-book, One Page Love, Httpster, Mobbin) · max 2 × koncept (märk "koncept"). Awwwards/Godly/FWA endast filtrerat. Per referens: URL + 2–3 meningars motivering kopplad till DENNA kunds material och röst. Omdömesjakten (Reco ≥4,7 → sajter → footer-jakt) är lokal-se-modulens tillägg, inte kärnans.

### 14. Framgångsmått *(NY)*
Kundens egna ord om vad framgång är. Befintlig mätning (GSC, analytics, bokningsräkning, kundens egen rapportering) med belägg. Endast fakta — framgangsmatt-fälten sätts av plannern.

### 15. Kapacitetssignaler *(NY — mekanisk tabell)*
Evidensdriven upptäckt mot **hela kapacitetskatalogen** (alla statusar, inklusive ROUTE-OUT). En rad per signal:

```
| kapacitet-id | signal/citat (med källa) | KRÄVS | OBSERVERAD | MÖJLIG |
```

- `KRÄVS` = kunden/beläggen kräver kapaciteten · `OBSERVERAD` = finns/används redan i dag · `MÖJLIG` = rimlig kandidat utan krav-belägg.
- Signaler är observationer, aldrig beslut — kapacitetskompileringen (planner steg 2b) fattar besluten.
- **Fail-closed-upptäckt:** en signal som matchar ett INTE aktiverat pakets kapaciteter ⇒ **automatisk SAKNAS-rad i §17** med texten "komplettera researchen med paket `<id>`:s modul". Aldrig tyst tunn research.

### 16. Öppna frågor
Allt `[OSÄKER]` + standardfrågor (publiceringstillstånd för omdömen med namn, högupplösta original + godkännande, domänönskemål, bokningskanal; vid NYSTARTAD: vilka löften vågar du stå för?). Researchen listar — klassningen `STRATEGISK/FAKTA/BESLUT` görs av plannern.

## PROJEKTFÖRSTÅELSE *(obligatoriskt avslutande block)*

Exakt 5 rader, före kontrollraden:

```
Organisation: <en rad>
Vad sajten ska driva: <en rad>
Vem som använder den: <en rad>
Befintliga system: <en rad>
Pakethypotes: <id | INGA> — belägg: <en rad>
```

Renderas read-only i verkstadsgolvets granskningsyta. Parsningsfel renderar `—` med varning — blockerar aldrig, hittar aldrig på.

### 17. Kontrollrad *(sist i filen)*

Maskinläsbart radformat — exakt:

```
- [PASS|SAKNAS] <fält-id>: <värde>
```

**Universella obligatoriska rader (6 grindfält + 1 estate-rad):**

| fält-id | krav |
|---|---|
| `namn` | organisationens namn |
| `kontaktvag` | ≥1 **verifierad** kontaktväg, TYPAD (`telefon`/`e-post`/`plats`/`bokningslänk`) — typen skrivs i värdet |
| `erbjudande` | ≥1 erbjudande |
| `anvandargrupp` | ≥1 användargrupp |
| `primart-utfall-kandidat` | ≥1 kandidat — **får vara `[OSÄKER]`, får aldrig saknas** |
| `fortroendeunderlag` | ≥1 underlag **ELLER** explicit `NYSTARTAD` |
| `befintlig-sajt` | `SAKNAS \| FINNS(<domän>, ägarskap KLART/OKLART)` — **PASS = frågan UTREDD** (även när svaret är att sajt saknas); `SAKNAS`-status på raden betyder *ej undersökt* |

- Paketrader appenderas efter de universella (monotoni-lagen: endast skärpning). lokal-se adderar `lokal.telefon` + `lokal.ort`.
- Fail-closed-upptäcktens automatiska SAKNAS-rader (§15) hamnar här.
- **Någon SAKNAS-rad ⇒ säg det RÖTT överst i filen i stället för att gissa.** Plannerns INPUT GATE stoppar på varje SAKNAS, exakt som i dag.

## Skillnad mot v2

| | v2 (PROMPT-RESEARCH.md, inlinad i verkstadsgolvet) | v3 (detta kontrakt) |
|---|---|---|
| Hemvist | sträng i `lib/prompt-research.ts` | en-hem i nortropic-system; komponerare bär pinnade bytes (KONTRAKT-SHA) |
| Struktur | ~14 sektioner, hantverkar-formade | 17 universella sektioner + PROJEKTFÖRSTÅELSE + paketmoduler med prefixade ID:n |
| Primärhandling | sluten enum (ring/boka/platsförfrågan/offert/besök) | fri kandidatmappning i kärnan; enumen = lokal-se-vokabulär |
| Kontrollrad | 5 fält (namn, telefon, ≥1 tjänst, ≥1 ort, ≥1 USP/nystartad) | 6 universella grindfält + `befintlig-sajt` + monotona paketrader; telefon/ort → `lokal.*` |
| Lokala steg | F-skatt/ROT/Reco-jakt/NAP/IG-inventering i kärnflödet | extraherade till `lokal-se` research-modul |
| Nya sektioner | — | användare (3), transaktion & data (9), integrationer (10), framgångsmått (14), kapacitetssignaler (15), estate-rader (7/10), PROJEKTFÖRSTÅELSE |
| Version | ingen | `Kontrakt:`-rad obligatorisk; avsaknad = v2-detektering (D5) |
| Radformat | fri prosa | maskinläsbar kontrollrad `- [PASS\|SAKNAS] <fält-id>: <värde>` |

Oförändrat i sak: hela bevisdisciplinen, NYSTARTAD-läget, bild-URL-reglerna, read-only-lagen, "säg det RÖTT överst".

## Changelog

- **v3.0.0-UTKAST (2026-08-24)** — universalisering av v2 per masterplanens Part 1 §1: 17-sektionersryggrad, typade kontaktvägar, fri utfallskandidat, generaliserade förtroendeunderlag, estate-rader (Part 2d L), kapacitetssignaltabell, universell 6+1-kontrollrad med maskinläsbart radformat, paketmodul-konvention med monotoni-lag, fail-closed-upptäckt, PROJEKTFÖRSTÅELSE-block, versionsdetektering D5. EJ PRODUKTION.

## Öppna frågor till ägaren

1. **Ägarbeslut 2 (HÖGRISK) förutsätts:** kontraktet antar att regel 5:s fem obligatoriska fält ersätts av den universella 6-fältsraden med telefon/ort som lokal-se-paketrader. Beslutet är registrerat men inte fattat — utkastet är ogiltigt som kontrakt tills det landar.
2. **Placering av PROJEKTFÖRSTÅELSE:** planen kallar blocket "avslutande sektion"; utkastet lägger det FÖRE kontrollraden så att "kontrollrad sist" och RÖTT-överst-konventionen (som verkstadsgolvets parser och INPUT GATE bygger på) överlever. Bekräfta ordningen.
3. **`befintlig-sajt`-radens PASS-semantik:** utkastet definierar PASS = "estate-frågan utredd" (även när svaret är att sajt saknas) för att inte kollidera med SAKNAS-som-grindstopp. Bekräfta tolkningen.
4. **Kontaktvägstypernas slutenhet:** är typlistan `telefon/e-post/plats/bokningslänk` sluten i kärnan, eller får t.ex. verifierad DM/chat-kanal räknas som kontaktväg (v2 observerade DM-svarsmönster som konverteringskanal)? Utkastet håller listan sluten och låter DM vara §4-observation, inte kontrollradsvärde.
