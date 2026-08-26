# research.md — Ekbergs Rör AB (CASE A, SYNTETISK LOKALFIXTUR)

> **SYNTETISK TESTKLIENT — INGEN VERKLIG ORGANISATION.** Ekbergs Rör AB är påhittat för
> masterplanens §26 Case A. Byggs alltid `testklient: true` + `NEXT_PUBLIC_NOINDEX=1`
> (regel 14); inga verkliga GBP-/GSC-/DNS-åtgärder.
>
> **NAMNGIVEN AVVIKELSE MOT §26.** Planen säger *"historical/frozen local-service
> fixture"*. Detta är en FRUSEN SYNTETISK lokalfixtur, inte den historiska kundens repo —
> det repot ligger inte i `nortropic-system` och har inte konsulterats här. Fixturen bär
> lokal-se-kontraktets fulla form, men den bär inte historisk kundevidens. Se
> `FORVANTAT.md` post `A-GAP-1`.

Kontraktsversion: research-kärna v3.0.0 + paketmodul `lokal-se` v1.0.0 · kompositionsläge **paket**

---

## 1. Organisation & typade kontaktvägar

Ekbergs Rör AB, aktiebolag, org.nr 556xxx-xxxx (syntetiskt). F-skatt: registrerad, belagt.
NAP: Ekbergs Rör AB · Kungsängsgatan 62, 753 22 Uppsala · 018-14 22 90.

Typade kontaktvägar med belägg: **telefon** (obligatoriskt belagt per paketmodulens
skärpning — kundens egen samtalslogg visar 63 av 78 uppdrag under Q1 startade med ett
samtal) · **formulär** (offertformulär, 15 av 78) · **fysisk plats** (verkstad med
lageruthämtning, öppen vardagar 07–16).

`postalCode` skrivs `753 22` — formatet `NNN NN` gäller identiskt överallt det förekommer.

## 2. Erbjudande

I kundens egna ord: *"Vi gör rörarbeten åt villaägare och bostadsrättsföreningar i
Uppsala med omnejd — stambyten, badrumsrenoveringar, vattenskador och akuta läckor."*

**Befintlig webbnärvaro:** ingen sajt. Kunden har en Facebook-sida med 340 följare och en
Google Företagsprofil. Det finns alltså ingen befintlig sajt att förbättra — belägget för
`interventionsbeslut = NY SAJT`.

## 3. Användare / målgrupper

Villaägare 45–70 (störst volym, belagt ur kundregistret), bostadsrättsföreningars
styrelser (färre men större uppdrag), och akutfall som ringer utan att jämföra.

## 4. Toppuppgifter + primärhandlingskandidat

Vad besökaren kommer för att göra: 1) få kontakt snabbt vid akut läcka, 2) begära offert
på ett planerat arbete, 3) se att företaget är behörigt, 4) se vad ett stambyte kostar.

**Primärhandlingskandidat: `offert` — "Få kostnadsfri offert".** Ur den slutna mängden
(`ring nu` · `boka tid` · `platsförfrågan` · `offert` · `besök`). Hur kunder faktiskt
konverterar i dag är belagt: 63/78 via telefon, 15/78 via formulär — **telefonspåret är
starkast**, men kunden vill flytta volym till offertformuläret för att slippa avbrott
under arbetstid. Signalerna är därmed inte motstridiga i data, men kundens ÖNSKAN pekar
åt annat håll än beteendet; båda noteras, och ring-vägen får inte försvagas.

**Varför detta INTE räknas som en konflikt i kontrollraden (`konflikter=0`):** 63/78 och
15/78 motsäger inte varandra — de är samma bild sedd två gånger, och telefonen dominerar
entydigt. Det som skiljer är kundens ÖNSKAN om framtiden mot dagens BETEENDE, och en
önskan är inte ett faktapåstående som kan stå i konflikt med ett annat. Kontraktets
konfliktbegrepp gäller motstridiga FAKTA. Att önskan finns är i sig ett belagt faktum och
det är noterat här; hade den varit dold hade primärhandlingen sett självklar ut.

## 5. Geografisk räckvidd & språk

Belagda arbetsområden: **Uppsala** (huvudort, 71/78 uppdrag) och **Storvreta** (7/78,
belagt med fakturaunderlag). Ingen annan ort har belagt arbete. Rörlighetsläget: **vi åker
ut** — kunden kommer inte till verkstaden för arbeten, endast för lageruthämtning.
Språk: svenska.

## 6. Förtroende/evidens

F-skatt (belagt) · **Säker Vatten-auktorisation**, certifikatnummer belagt hos utfärdaren ·
utbildning: VVS-ingenjör, Yrkeshögskolan i Uppsala, examen 2009 (skola + datum belagt) ·
ansvarsförsäkring hos namngivet bolag · omdömen: **4,7 i betyg, exakt 118 omdömen, Google**
(betyg + exakt antal + plattform, per paketmodulens skärpning) · 14 år i branschen ·
portfolio: 9 dokumenterade projekt med före/efter-bilder.
ROT-läget: **ROT-relevant** — kunden fakturerar med ROT-avdrag, belagt.

## 7. Innehåll + bildmaterial

Bildinventering: 96 bilder, varav 41 användbara. Motivtyper: arbetsplatsbilder (22),
före/efter (11), porträtt (3), verkstad/fordon (5). Liggande hero-kandidater: 4.
Ansiktsporträtt: 3. Rättighetsläget: egna bilder, skriftligt bekräftat.
Strukturerade bild-URL:er per sektion: kundens bildarkiv ligger bakom inloggning —
**kräver original från kund** för samtliga 41 användbara. Fyra hero-kandidater är
identifierade med filnamn i kundens egen namngivning (`hero-badrum-01.jpg` m.fl.).
**Fotobedömning (paketmodulens skärpning): materialet RÄCKER för foto-först-design** —
de fyra liggande hero-kandidaterna håller upplösning och ljus; ny fotografering behövs
inte.

## 8. Röst/varumärke

Ur kundens egna inlägg: *"Vi ringer tillbaka samma dag. Alltid."* · *"Ett stambyte är
inte en produkt, det är åtta veckor i någons hem."* Branschens eget språk: "stamledning",
"avstängningsventil", "relining", "fuktindikering".

## 9. Transaktions-/dataobservationer

RÅ observation: ingen betalning på sajten, ingen inloggning, ingen lagring av persondata
utöver offertformulärets kontaktuppgifter som skickas per e-post. Ingen bokningsdatabas.

## 10. Integrationer

Ingen extern bokningstjänst · ingen kassa · Google Företagsprofil används aktivt ·
kartintegration önskas på kontaktsidan.

## 11. Juridik-/riskobservationer

RÅ observation med citat, ingen bedömning: *"Vi jobbar i badrum och kök, aldrig med
medicinsk utrustning."* — ingen hälsoflagga. Ingen livsmedel, finans, alkohol/tobak, inga
barn som primär målgrupp. Inget e-handelsönskemål. Ingen inloggning/medlemsdata.

## 12. Konkurrenter/alternativ

Tre lokala rörfirmor i Uppsala. Ingen djupanalys.

- `https://exempel-ror-uppsala.se` — stark på akutlöften, svag på priser (inget prisspann
  någonstans). Synligt betyg: 4,3 · 61 omdömen.
- `https://exempel-vvs-uppsala.se` — tydlig portfolio med före/efter, svag mobilupplevelse.
  Synligt betyg: 4,8 · 23 omdömen.
- `https://exempel-stambyte-uppsala.se` — smal nisch (endast stambyten), inga synliga
  omdömen alls.

## 13. Designreferenser

- `https://exempel-referens-hantverk.se` — heron använder ett verkligt arbetsplatsfoto i
  liggande format i stället för en stockbild. Matchar att Ekberg har fyra sådana
  kandidater (§7) och att materialet räcker för foto-först. Kompositionen, inte
  varumärket, är det som översätts.
- `https://exempel-referens-kontakt.se` — kontaktsidan sätter telefonnumret först i
  synfältet. Matchar att 63/78 uppdrag startar i ett samtal (§4), och att ring-vägen inte
  får försvagas av att primärhandlingen är offert.

## 14. Framgångsmått

Kundens egna: *"Fler offertförfrågningar via sajten — i dag 15 per kvartal, målet 30"* och
*"färre samtal som bara frågar var vi håller till."*

## 15. Kapacitetssignaler

Belagd ort + `seoLage=lokal` → `KAP-LOKAL-SEO` aktiveras · organisationstyp känd →
`KAP-SCHEMA` med `LocalBusiness`-subtypen `Plumber` · kvitton belagda → `KAP-KVITTON` ·
bildinventering gjord → `KAP-BILD` · primärhandlingskandidat finns → `KAP-PRIMARHANDLING`.
**Paketet `lokal-se` är BELAGT, inte antaget** — orten är belagd med fakturaunderlag.

## 16. Öppna frågor

- Får de 118 omdömena citeras med namn + ort på sajten? [OSÄKER] — plattformens villkor
  är inte kontrollerade.
- Högupplösta original + publiceringsgodkännande för de 11 före/efter-bilderna? [OSÄKER]
- **Domänönskemål:** Besvarad — `ekbergsror.se`, kunden äger den och vill ligga kvar.
- **Bokningskanal:** Besvarad — ingen extern bokningstjänst; bokning per telefon eller efter offertförfrågan (L3).

## 17. Maskinläsbar kontrollrad

```
RESEARCH-CONTROL v3.0.0 | pack=lokal-se | pack_module=1.0.0
  org=ja | kontaktvag=ja | erbjudande=ja | geografi=ja
  primarhandling=kandidat | framgangsmatt=ja
  osakra=2 | konflikter=0 | status=KOMPLETT
```

---

# PAKETMODUL `lokal-se` v1.0.0

## L1. Ortsstruktur

**Huvudort: Uppsala** — 71/78 uppdrag, belagt med fakturaunderlag.
**Sekundärort: Storvreta** — 7/78 uppdrag, belagt med fakturaunderlag.
Inga andra orter har belagt arbete. En ort utan belagt arbete är ingen ort och får ingen
ortssida — tunna ortssidor rekommenderas bort.

## L2. Lokala kvitton

Fysisk plats: verkstad på Kungsängsgatan 62, öppen för lageruthämtning vardagar 07–16.
Google Företagsprofil: **finns och är verifierad**, 118 omdömen, 4,7 i betyg.
Lokala citeringar: Uppsala Företagsregister (URL belagd) · Hitta.se (URL belagd).

## L3. Bokningsvägen

Ingen extern bokningstjänst används. Bokning sker per telefon eller genom att kunden
kontaktas efter offertförfrågan. **Ingen egen bokningsdatabas efterfrågas** — sajten
förblir stateless.

## L4. Säsong & tillgänglighet

Säsongsvariation: vattenskador toppar under vinterhalvåret; badrumsrenoveringar planeras
oftast vår och höst. Jourläge: **ingen dygnet-runt-jour.** Svarstidslöfte kunden själv
gör, citerat: *"Vi ringer tillbaka samma dag. Alltid."* — löftet är kundens eget och får
återges som citat, aldrig omformuleras till en garanti sajten utfärdar.
