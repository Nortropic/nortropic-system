# CASE A — vad PASS betyder, och vad som ännu inte är prövat

Ankare: masterplanens **§26 Case A — local depth preservation**.

> *"Must preserve local-service semantics and defect sensitivity."*
> *"Numeric v3↔v4 total equality is diagnostic, never a promotion bar."*

Case A prövar **bevarande**. Frågan är inte om kärna/paket-delningen är elegant, utan om
den lokala semantiken och förmågan att FÄLLA lokala defekter överlevde den.

Lägesvokabulären är densamma som i Case B: `MEKANISK` avgörs ur fixturens kontraktsfält
och de skeppade kontrakten; `EJ KÖRD` kräver en verklig körning och är **ODÖMBART, aldrig
grönt**.

---

## Bevarandepåståenden

| ID | Påstående som ska hålla | Läge |
|---|---|---|
| `A-B1` | Paketet `lokal-se` aktiveras — och det gör det på BELAGD ort, aldrig på antagen bransch (kontraktets hypotesläge: en antagen bransch kör core-only) | `MEKANISK` |
| `A-B2` | Paketmodulens skärpningar gäller: belagt telefonnummer, minst en belagd ort, primärhandling ur den slutna mängden, ifyllt fotobedömningssvar. Saknas något är raden `OFULLSTÄNDIG` | `MEKANISK` |
| `A-B3` | Ortssidor byggs för Uppsala och Storvreta — och för INGEN annan ort, eftersom ingen annan ort är belagd. En ort utan belagt arbete är ingen ort | `EJ KÖRD` |
| `A-B4` | Gate 5:s paketlins körs, och den universella kärnan körs också — delningen får inte tappa något v3 mätte | `EJ KÖRD` |
| `A-B5` | Handover innehåller GBP- och GSC-sektionerna (paketvillkorat, S5) | `EJ KÖRD` |
| `A-B6` | `LocalBusiness`-subtypen `Plumber` validerar, med svensk `PostalAddress` och `openingHoursSpecification` | `EJ KÖRD` |
| `A-B7` | Ring-vägen försvagas INTE av att primärhandlingen är `offert`: 63/78 uppdrag startar i ett samtal, och tel:-länk, sticky header och flytande ringknapp hör till leveransen | `EJ KÖRD` |

## Defektkänslighet — planterade defekter

§26 kräver att defektkänsligheten bevaras. Varje rad nedan är en defekt som ska planteras
i en byggd variant av fixturen, med den yta som ska FÄLLA den namngiven i förväg.
**Ingen av dem är körd** — de är specificerade så att en körning kan avgöras, inte
avgjord här.

| ID | Planterad defekt | Ska fällas av | Läge |
|---|---|---|---|
| `A-D1` | Telefonnumret i sidfoten skrivs `018-142290` medan `business.ts` har `018-14 22 90` | NAP-konsistensen (v3 kriterium 4; regel 9 — formatavvikelse) | `EJ KÖRD` |
| `A-D2` | Telefonnumret i JSON-LD är ett ANNAT nummer än i `business.ts` | NAP-konsistensen som CRITICAL (regel 9 — värdeavvikelse) | `EJ KÖRD` |
| `A-D3` | Ortssidan för Storvreta är Uppsala-sidans text med ortsnamnet utbytt | Lokal SEO (v3 kriterium 5): mallade ortssidor drar hela delpoängen | `EJ KÖRD` |
| `A-D4` | En ortssida skapas för Knivsta, som saknar belagt arbete | Ortsstrukturen (L1) — en ort utan belagt arbete är ingen ort | `EJ KÖRD` |
| `A-D5` | `openingHoursSpecification` utelämnas ur schemat | Schema-korrektheten (v3 kriterium 6) | `EJ KÖRD` |
| `A-D6` | `TODO-FACT` läcker in i FAQPage-schemat | Schema-korrektheten: platshållarläckage | `EJ KÖRD` |
| `A-D7` | Sajten påstår "dygnet-runt-jour" | Faktatroheten som HÅRD GRIND — kunden har ingen jour (research L4), och påståendet står i `forbjudnaPastaenden` | `EJ KÖRD` |
| `A-D8` | Betyget "4,7" visas utan antal och plattform | Faktatroheten + kvittolistans attributionsregel (betyg + EXAKT antal + plattform tillsammans) | `EJ KÖRD` |
| `A-D9` | Den flytande ringknappen tas bort på mobil | Konverteringsarkitekturen (v3 kriterium 1, delkrav 5) — och `A-B7` | `EJ KÖRD` |
| `A-D10` | Utbildningen redovisas som ett utfall ("VVS-ingenjör med 14 års dokumenterade resultat") i stället för som utbildning | Kvittolistans attributionsregel (§7.4, §A7-skyddad) | `EJ KÖRD` |

**Defektkänslighet mäts som en RÄKNING över den här uppräknade mängden** — tio defekter,
tio namngivna fällare — aldrig som en egenskap hos systemet. En körning som fäller åtta av
tio har fällt åtta av tio, och de två som slapp igenom ska namnges.

---

## Mekaniska påståenden om fixturen själv

| ID | Påstående |
|---|---|
| `A-M1` | Kontrollraden är `pack=lokal-se` och `pack_module=1.0.0`, och paketmodulens sektioner `L1`–`L4` finns i filen |
| `A-M2` | Paketmodulens skärpta KOMPLETT-krav är uppfyllda: belagt telefonnummer, ≥1 belagd ort, primärhandling ur den slutna mängden, ifyllt fotobedömningssvar |
| `A-M3` | `osakra` i kontrollraden matchar antalet distinkta `[OSÄKER]`-märkta fält |
| `A-M4` | `profile.ts` bär samtliga fältnamn ur Site Quality Contract v2, extraherade ur den skeppade `skills/nortropic-stack/SKILL.md` |
| `A-M5` | `paket: ['lokal-se']`, `seoLage: 'lokal'`, `schemaTyp: 'Plumber'`, `statelesshet.hallerTillstand: false` |
| `A-M6` | `KAP-LOKAL-SEO` aktiveras i `kapaciteter` |
| `A-M7` | Varje fält i `belaggspekare` pekar på en research-sektion som finns i filen |
| `A-M8` | Fixturen är märkt `testklient: true` och som SYNTETISK i båda filerna |

---

## Namngivna avvikelser

| ID | Avvikelse |
|---|---|
| `A-GAP-1` | §26 säger *"historical/frozen local-service fixture"*. Detta är en FRUSEN SYNTETISK fixtur med lokal-se-kontraktets fulla form, **inte den historiska kundens repo** — det ligger inte i `nortropic-system` och har inte konsulterats. Bevarandet prövas därför mot kontraktet, inte mot historisk kundevidens. Att stänga avvikelsen kräver ägarens beslut om att ta in det historiska repot som fixtur |
| `A-GAP-3` | §26 Case A kräver att den lokala fixturen körs genom **TVÅ** vägar: *"through: compatibility route; new universal+local composition"*. Denna skiva bygger bara den andra. **Kompatibilitetsvägen saknas** — det vore en `research.md` skriven mot en ÄLDRE kontraktsversion och en `profile.ts` på `v1.1.0` utan v2-fälten, som ska förbli LÄSBAR och där saknade fält läses som `SAKNAS_I_V1`, aldrig som `nej` (S4:s bakåtkompatibilitetslag, kontraktets rad om bakåtkompatibilitet). Status: `NOT_STARTED`. Nästa transition: en tredje fixtur `case-a-legacy/` med v1-profil, plus kontroller som fäller om en saknad v2-post tolkas som ett negativt svar |
| `A-GAP-2` | §26:s diagnostik *"numeric v3↔v4 total equality"* kan inte köras: v4 är `NOT_PRODUCTION` och saknar konsument, och v4:s nämnare varierar per sajt. Diagnostiken hör till S7/S8:s AKTIVERADE läge, efter S6 — inte hit |

## Vad denna fixtur ALDRIG får användas till

Samma tak som Case B: syntetisk evidens bär aldrig något över `VALIDATING`. En grön
Case A gör inte `lokal-se` `PROVEN` — det kräver riktiga kunder.
