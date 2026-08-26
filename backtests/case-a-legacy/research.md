# RESEARCH — Ekbergs Rör AB (KOMPATIBILITETSVÄGEN, `A-GAP-3`)

**Kontraktsversion: researchkontrakt v3.0.0** — den version som gällde FÖRE
kärnuniversaliseringen. Sektionsnumreringen är identisk med v3.1.0; skillnaden är att
§1, §5, §6, §12 och §16 här ställer den LOKALA frågan i själva kärnan, eftersom
paketmodulen ännu inte fanns att flytta dem till.

Läge: obemannat

**SYNTETISK FIXTUR. INGEN VERKLIG ORGANISATION.** Samma kund som `case-a-lokal/`,
medvetet — skillnaden mellan de två fixturerna ska vara KONTRAKTSVERSIONEN och ingenting
annat. Vore kunderna olika gick det inte att veta om ett utfall berodde på versionen
eller på datan.

---

## 1. NAP

Ekbergs Rör AB, aktiebolag, org.nr 556xxx-xxxx (syntetiskt). F-skatt: registrerad, belagt.
NAP: Ekbergs Rör AB · Kungsängsgatan 62, 753 22 Uppsala · 018-14 22 90.

`postalCode` skrivs `753 22` — formatet `NNN NN` gäller identiskt överallt det förekommer.

Typade kontaktvägar med belägg: **telefon** (kundens samtalslogg visar 63 av 78 uppdrag
under Q1 startade med ett samtal) · **formulär** (offertformulär, 15 av 78) ·
**fysisk plats** (verkstad med lageruthämtning, öppen vardagar 07–16).

## 2. Erbjudande

I kundens egna ord: *"Vi gör rörarbeten åt villaägare och bostadsrättsföreningar i
Uppsala med omnejd — stambyten, badrumsrenoveringar, vattenskador och akuta läckor."*

**Befintlig webbnärvaro:** ingen sajt. Facebook-sida med 340 följare och en Google
Företagsprofil. Ingen befintlig sajt att förbättra — belägget för `NY SAJT`.

## 3. Användare / målgrupper

Villaägare 45–70 (störst volym) · bostadsrättsföreningars styrelser (färre, större
uppdrag) · akutfall som ringer utan att jämföra.

## 4. Toppuppgifter + primärhandlingskandidat

1. Få kontakt snabbt vid akut läcka; 2. förstå om företaget tar sig an uppdraget;
3. bedöma om det går att lita på; 4. få ett prisintervall.

**Primärhandlingskandidat: `offert`.** Belägg: 15 av 78 uppdrag via formulär, men
formuläret ger de större uppdragen (bostadsrättsföreningar). Motstridig signal:
telefonen har högre volym (63 av 78).

## 5. Geografisk räckvidd & språk

Uppsala (huvudort, belagt med fakturaunderlag) · Knivsta · Storvreta · Björklinge.
Restid utanför dessa: kunden åker inte längre än 40 minuter.

## 6. Förtroende/evidens

Belagda kvitton: **F-skatt** (registrerad) · **ansvarsförsäkring** (försäkringsbrev,
giltigt) · **omdömen** (4,6 av 5 baserat på 38 omdömen, Google) · **branschbehörighet**
(Säker Vatten, certifikatnummer belagt) · **garanti** (5 år på stambyten, skriftlig).

## 7. Innehåll + bildmaterial

Ingen befintlig sajt. Bildinventering: 61 bilder ur kundens telefon, varav 22 användbara —
arbetsplatsbilder (14), två servicebilar med logotyp, sex porträtt av montörer i
arbetskläder. Liggande hero-kandidat: ja, en arbetsplatsbild i full upplösning.
Rättighetsläget: samtliga egna.

## 8. Röst/varumärke

Rakt på sak, yrkesstolt, utan säljprat. Legitimt vernacular: stambyte, relining,
vattenlås, avstängningsventil.

## 9. Transaktions-/dataobservationer

Offertformulär (≤5 fält), klickbart telefonnummer, öppettider. Ingen bokning, ingen
inloggning, ingen e-handel — sajten förblir stateless.

## 10. Integrationer

Inga. Leads går till e-post.

## 11. Juridik-/riskobservationer

Inga juridikflaggor. Rörarbeten är Ring 1.

## 12. Konkurrenter/alternativ

2–3 lokala konkurrenter i Uppsala: Uppsala Rörjour (URL belagd, 4,2 av 5 på 91 omdömen) ·
Rörgruppen Mälardalen (URL belagd, 4,7 av 5 på 24 omdömen) · Sandbergs VVS (URL belagd,
inga synliga omdömen).

## 13. Designreferenser

Antal offertförfrågningar per månad; andel som blir uppdrag.

## 14. Framgångsmått

Sajten ska hålla lanseringsklar nivå på samtliga grindar.

## 15. Kapacitetssignaler

Belagd ort + `seoLage=lokal` → `KAP-LOKAL-SEO` aktiveras · organisationstyp känd →
`KAP-SCHEMA` med `LocalBusiness`-subtypen `Plumber` · kvitton belagda → `KAP-KVITTON` ·
bildinventering gjord → `KAP-BILD` · primärhandlingskandidat finns → `KAP-PRIMARHANDLING`.

## 16. Öppna frågor

Exakt formulering av garantivillkoren kräver kundens original.

## 17. Maskinläsbar kontrollrad

```
RESEARCH-CONTROL v3.0.0 | pack=lokal-se | pack_module=1.0.0
  org=ja | kontaktvag=ja | erbjudande=ja | geografi=ja
  primarhandling=kandidat | framgangsmatt=ja
  osakra=1 | konflikter=0 | status=KOMPLETT
```
