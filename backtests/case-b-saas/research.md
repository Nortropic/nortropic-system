# research.md — Kadensa AB (CASE B, SYNTETISK NEGATIVKONTROLL)

> **SYNTETISK TESTKLIENT — INGEN VERKLIG ORGANISATION.** Kadensa AB är påhittat för
> masterplanens §26 Case B. Filen får aldrig behandlas som kundevidens, och en sajt
> byggd ur den byggs `testklient: true` + `NEXT_PUBLIC_NOINDEX=1` (regel 14). Inga
> verkliga GBP-/GSC-/DNS-åtgärder får vidtas för den.
>
> **Fixturen är MEDVETET FEL för lokal-se-antagandena.** Det är hela dess syfte.

Kontraktsversion: research-kärna v3.0.0 · kompositionsläge **core-only**

---

## 1. Organisation & typade kontaktvägar

Kadensa AB, aktiebolag, org.nr 559xxx-xxxx (syntetiskt). Kontor: Hyllie Boulevard 34,
215 32 Malmö — **kontorsadress, inte ett besöksdrivet verksamhetsställe.** Kunder besöker
inte kontoret; adressen finns för fakturering och avtal.

Typade kontaktvägar, med belägg för att de används:
- **formulär** — "Boka demo"-formuläret på sajten; belägg: kundens säljlogg visar att 41 av
  47 inkomna dialoger under Q1 startade där.
- **bokningssystem** — Cal.com, extern, integrerad via länk från demo-formulärets kvittosida.
- **e-post** — `hej@kadensa.se`, används för avtals- och supportärenden.
- **telefon** — växelnummer finns men **belagt som icke-primärt**: kundens egen logg visar
  3 inkommande samtal under samma kvartal, samtliga från befintliga kunder.
- **fysisk plats** — nej. Kontoret tar inte emot kundbesök.

## 2. Erbjudande

I kundens egna ord: *"Kadensa är ett skiftplaneringsverktyg för nordiska logistik- och
åkeriföretag med 50–500 anställda. Vi ersätter Excel-scheman med en planering som tar
hänsyn till kör- och vilotidsregler."* Levereras som SaaS, prenumeration per anställd.

## 3. Användare / målgrupper

Vem som faktiskt kommer (ur kundens analytics, inte önsketänkande): trafikchefer och
driftledare (störst volym), HR-/personalansvariga, samt IT-ansvariga som utvärderar
integrationer och säkerhet. Beslutet fattas sällan av en person — utvärderingen är
kollegial och pågår i veckor.

## 4. Toppuppgifter + primärhandlingskandidat

Vad besökaren kommer för att GÖRA, belagt per observation:
1. förstå om verktyget klarar kör- och vilotidsreglerna (mest lästa sidan);
2. se om det integrerar mot deras befintliga TA-system;
3. boka en demo;
4. hitta prisbilden.

**Primärhandlingskandidat: `boka` — "Boka demo".** Belägg: 41/47 dialoger startade i
demo-formuläret (sektion 1). Motstridiga signaler: ingen. Prisbilden efterfrågas ofta men
leder inte till avslut utan demo — kunden har belagt detta i sin egen CRM-uppföljning.

**Uttrycklig observation:** ingen ring-nu-signal och ingen offertförfrågan-signal finns i
materialet. Telefonspåret är belagt som icke-primärt (sektion 1).

## 5. Geografisk räckvidd & språk

**Nationellt och EU.** Kunder i Sverige, Danmark, Norge och Nederländerna. Tjänsten
levereras över nät — **inget arbetsområde, inga orter, ingen restid.** Kontorsorten Malmö
är en adress, inte ett upptagningsområde.

Språk: svenska som huvudspråk, engelska för produktdokumentation. Flerspråkighet i
webbgränssnittet finns; sajtens språk är inte avgjort — frågan är registrerad i §16.

## 6. Förtroende/evidens

Belagda kvitton:
- **ISO/IEC 27001** — certifikatnummer och utfärdare belagda i kundens avtalsbilaga.
- **Kundcase** — tre namngivna kunder med publiceringsgodkännande, inkl. mätt utfall
  ("planeringstiden ned från 6 h till 40 min/vecka", kundens egen siffra, citerad).
- **DPA + underbiträdesförteckning** — publicerad, daterad.
- **Drifthistorik** — statussida med 99,9 % de senaste 12 månaderna, kundens egen mätning.
- **Integrationspartners** — två namngivna TA-system, bekräftade av respektive partner.

**Uttrycklig frånvaro, belagd som frånvaro och inte som lucka:** inga publika omdömen
eller stjärnbetyg finns (ingen recensionsplattform används i segmentet) · F-skatt är inte
ett kvitto kunden lyfter och efterfrågas aldrig av köparen · ingen fysisk lokal, inga
lokala citeringar, ingen Google Företagsprofil — och kunden vill inte ha någon.

## 7. Innehåll + bildmaterial

Befintligt innehåll värt att bevara: produktdokumentation (utförlig, välskriven), tre
kundcase, en säkerhetssida. Bildinventering: 34 bilder, varav 12 användbara —
produktskärmbilder (8), två porträtt av grundarna, två kontorsbilder. **Inga
arbetsplatsbilder, inga fordonsbilder, inga uniformerade medarbetare.** Liggande
hero-kandidat: nej — bäst tillgängliga hero-material är produktgränssnittet.
Rättighetsläget: samtliga egna, skriftligt bekräftat.

Strukturerade bild-URL:er per sektion finns i kundens DAM; exakta URL:er kräver original
från kund.

## 8. Röst/varumärke

Ur kundens egna inlägg: *"Vi lovar inte att spara tid. Vi visar var timmarna går."* ·
*"Ett schema som bryter mot kör- och vilotid är inte ett schema, det är en böter."*
Branschens eget språk: "kör- och vilotid", "TA-system", "planeringshorisont",
"skiftpass". Tonen är saklig och siffernära; ingen superlativ-marknadsföring.

## 9. Transaktions-/dataobservationer

RÅ observation: betalning sker via avtalsfakturering utanför sajten. Inloggning till
produkten sker på `app.kadensa.se` — **en separat applikation, inte den sajt som ska
byggas.** Sajten själv ska inte hålla inloggning, kunddata eller schemadata. Persondata
på sajten: enbart demo-formulärets kontaktuppgifter, som skickas vidare per e-post.

## 10. Integrationer

Cal.com (demobokning, extern) · HubSpot (CRM, tar emot formulärleads via e-post i dag) ·
statuspage.io (drifthistorik, extern) · ingen kassa, ingen kartintegration.

## 11. Juridik-/riskobservationer

RÅ observation med citat, ingen bedömning:
- Persondata: *"Vi är personuppgiftsbiträde åt kunderna för schemadata; för webbplatsen
  är vi personuppgiftsansvariga för kontaktformuläret."* — kundens DPA, s. 2.
- Ingen hälsa/kropp, ingen livsmedel, ingen finans/försäkring, ingen alkohol/tobak, inga
  barn som primär målgrupp.
- E-handelsönskemål: nej.
- Inloggning/medlemsdata **på den sajt som ska byggas**: nej. (Produktinloggningen bor på
  en separat applikation — se sektion 9.)

## 12. Konkurrenter/alternativ

Excel är det faktiskt största alternativet. Synliga betyg: inga — segmentet har ingen
recensionskultur, och den frånvaron är belagd i §6.

- `https://exempel-skiftplanering-no.se` — stark på regelstöd, svag på integrationer mot
  nordiska TA-system.
- `https://exempel-bemanning-dk.se` — bred bemanningssvit där skiftplanering är en delmodul;
  svag på kör- och vilotid specifikt.

## 13. Designreferenser

- `https://exempel-referens-produkt.se` — datatät hero som visar gränssnittet i stället för
  en stockbild. Matchar att Kadensas enda starka bildmaterial ÄR gränssnittet (§7).
- `https://exempel-referens-sakerhet.se` — säkerhetssidans struktur gör ett ISO-certifikat
  läsbart för en IT-ansvarig utan jargong. Matchar att IT-ansvariga är en belagd
  målgrupp (§3) och att ISO 27001 är kundens tyngsta kvitto (§6).

## 14. Framgångsmått

Kundens egna, mätbart uttryckta: *"Fler bokade demos per månad från sajten — i dag 14,
målet 25 inom två kvartal"* och *"färre demos som avbokas för att köparen missförstått
vad verktyget gör."*

## 15. Kapacitetssignaler

- Demobokning via extern tjänst → pekar mot `KAP-EXTERN-BOKNING` (katalogstatus
  `DECLARED` — se kapacitetskatalogen).
- **Ingen ortssignal.** Sektion 5 bär inget arbetsområde och ingen belagd ort →
  `KAP-LOKAL-SEO` aktiveras INTE.
- Ingen GBP-signal, inga lokala citeringar → ingen lokal närvarokapacitet aktiveras.
- Schema: organisation/produkt, inte `LocalBusiness` → `KAP-SCHEMA` aktiveras med
  icke-lokal typ.
- **Pakethypotes: ingen.** Ingen känd paketmodul matchar. Kompositionsläget är
  `core-only`, vilket är ett GILTIGT läge — aldrig ett fel.

## 16. Öppna frågor

- Sajtens språk: svenska enbart, eller svenska + engelska? [OSÄKER] — kunden har inte
  tagit ställning (sektion 5).
- **Omdömen att publicera med namn+ort:** inga finns. Segmentet har ingen
  recensionskultur och kunden använder ingen recensionsplattform (§6). Frågan är besvarad
  med ett belagt NEJ, inte lämnad öppen.
- Får kundcasens mätta utfall publiceras med kundnamn? Tre godkännanden finns; det fjärde
  caset saknar godkännande och utelämnas.
- **Domänönskemål:** `kadensa.se` ägs av kunden — rot eller `www`? [OSÄKER]
- **Högupplösta original + godkännande:** Besvarad — produktskärmbilderna är egna och godkända skriftligt; grundarporträtten kräver original ur kundens DAM, godkännandet finns.
- **Bokningskanal:** Besvarad — Cal.com, extern, integrerad via länk från demo-formulärets kvittosida (§10).

## 17. Maskinläsbar kontrollrad

```
RESEARCH-CONTROL v3.0.0 | pack=core-only | pack_module=none
  org=ja | kontaktvag=ja | erbjudande=ja | geografi=ja
  primarhandling=kandidat | framgangsmatt=ja
  osakra=2 | konflikter=0 | status=KOMPLETT
```
