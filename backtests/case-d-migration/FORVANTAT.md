# CASE D — MIGRATION, vad PASS betyder

Ankare: masterplanens §26, samma citat som Case C. En av tre fixturer som stänger
`§26-GAP-1`.

---

## Vad den prövar

**Att systemet kan komma fram till att en befintlig sajt ska FÖRBÄTTRAS, inte ersättas.**
Alvestas sajt rankar 2,1 på huvudtermen, har gröna Core Web Vitals och 23 hänvisande
domäner på en fyra år gammal domän. Att bygga om från grunden riskerar allt det.

Problemet är innehåll och konvertering: sju tjänstesidor på 90–140 ord, tre knappar som
säger "Läs mer", inget synligt telefonnummer, elva formulärfält.

**Det är arbete på en sajt, inte en ny sajt.**

## Slutsatsen står HÄR, inte i researchen

| Rå signal i researchen | Slutsats som ska dras | Vad ett fel ser ut som |
|---|---|---|
| §2: medelplacering 2,1, 23 hänvisande domäner, fyra år gammal domän | Det finns förvärvat värde som en ombyggnad riskerar | "Vi bygger nytt och sätter upp redirects" — riskerna nämns inte |
| §2: CWV gröna, Next.js, HTTPS | Tekniken är inte problemet | Stackbyte motiverat med "modern stack" utan uppmätt brist |
| §2: sju sidor på 90–140 ord | Tunt innehåll är en åtgärd, inte ett skäl att börja om | Tunnheten används som argument för totalbygge |
| §2: knappar med "Läs mer", inget synligt nummer, 11 fält | Konverteringsarbete på befintliga sidor | CTA-problemet löses genom att byta plattform |
| §2: 1,26 % konvertering, 19 uppdrag av 61 inskick | Utfallet är mätt och rimligt — inte trasigt | Konverteringen kallas "svag" utan jämförelsepunkt |

**Förväntat `interventionsbeslut`: `FÖRBÄTTRA BEFINTLIG`.**

## Vad taxonomin ska göra med det

| ID | Påstående | Läge |
|---|---|---|
| `D-1` | `FÖRBÄTTRA BEFINTLIG` ger `ROUTE`, aldrig `HARD_STOP` | `MEKANISK` |
| `D-2` | `ROUTE` kräver INGET ägarsvar | `MEKANISK` |
| `D-3` | Nästa steg säger UT att förbättringslanen inte finns ännu och offereras som eget arbete | `MEKANISK` |
| `D-4` | Ingen sajt byggs, ingen ny domän, inga redirects planeras | `MEKANISK` |
| `D-5` | Briefen namnger vad som ska förbättras och vad som ska bevaras | `EJ KÖRD` |

**`D-3` är den viktigaste raden.** Systemet får inte låtsas att det finns en
förbättringslane. Att routa till något som inte är byggt vore ett tyst löfte.

## Fixturen har INGEN profile.ts

Samma skäl som Case C: en profil är kalibreringsfacit för ett bygge. Frånvaron är provet.

## Namngivna avvikelser

| ID | Avvikelse | Läge |
|---|---|---|
| `D-GAP-1` | Härledningen görs av PLANNERN. Fixturen prövar ROUTNINGEN, inte beslutet | `NAMNGIVEN` |
| `D-GAP-2` | **Förbättringslanen finns inte.** `ROUTE` leder till en offert, inte till ett arbetsflöde | `DELVIS ÅTGÄRDAT 2026-08-27` | Destinationens KONTRAKT finns nu — `docs/forbattringskontrakt.md` med två lagar (bevarandebördan ligger på FÖRÄNDRINGEN; en förbättring utan eftermätning är en ÄNDRING) och en **mekanisk** gräns mot nybygge: ändras fler än hälften av de rankande URL:erna, eller byts stacken, är det per definition ett nybygge oavsett vad det kallas. **Kvarstår som `FK-GAP-1`:** ingen körbar lane. Case D:s utfall är fortfarande ett avslut, inte en leverans — men gränsen är nu skriven INNAN förmågan finns, vilket är den ordning som gör gränsen värd något |
