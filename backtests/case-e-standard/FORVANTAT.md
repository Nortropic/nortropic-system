# CASE E — STANDARD-nollceremoni, vad PASS betyder

Ankare: masterplanens §26, samma citat som Case C och D, samt **§20**: en STANDARD-leverans
får inte dra på sig extra ceremoni utan namngivet skäl. Tredje av tre fixturer som stänger
`§26-GAP-1`.

---

## Vad den prövar — och varför den är svårast att bedöma

**Fixturens uppgift är att vara HELT VANLIG.** Bergqvists Fönsterputs är den mest
ordinära Ring 1-kunden som går att konstruera: ingen befintlig sajt, en belagd ort, inga
juridikflaggor, en tydlig primärhandling, inga integrationer, inget statefullt.

**Provet är inverterat mot de andra.** Case A prövar att semantik BEVARAS, Case B att den
INTE läcker, Case C och D att systemet kan avstå från att bygga. Case E prövar att
systemet **inte gör något extra**.

> **Varje avvikelse, varje ägarfråga och varje extra grind som uppstår här är ett FYND —
> inte en försiktighetsåtgärd.**

Det är en obekväm mätning, för den bestraffar den sortens överdrivenhet som ser ut som
omsorg.

## Slutsatsen står HÄR, inte i researchen

Samma disciplin som C och D, fast inverterad: researchen bär råa signaler, och slutsatsen
som ska dras är att **ingenting här motiverar ett undantag**.

| Rå signal i researchen | Slutsats som ska dras | Vad ett fel ser ut som |
|---|---|---|
| §2: ingen befintlig sajt, bara Facebook och en GBP | `NY SAJT` — det finns inget att förbättra | `FÖRBÄTTRA BEFINTLIG` på en Facebook-sida |
| §4: 91 av 118 uppdrag startade med samtal, 84 avslutades i samma samtal | Primärhandlingen är `ring` | `offert` valt för att formulär "konverterar bättre" i allmänhet |
| §11: fönsterputs är Ring 1, RUT beskrivet som möjlighet aldrig belopp | Noll juridikflaggor | En flagga för "konsumenttjänst" eller för RUT — båda är hanterade |
| §14: inga krav utöver standard | `kvalitetsnivaer.niva = STANDARD` | Nivån skruvas upp "för säkerhets skull" |
| §9: ingen bokning, ingen inloggning, inget statefullt | Ring 1, ingen capability-spärr | HARD_STOP på en alltid-på-kapacitet |
| §5: tre belagda orter, 30 minuters restid | `lokal-se` belagt, inte antaget | Paketet antas ur branschen i stället för ur orten |

**Den svåraste raden är den tredje.** RUT-avdrag *låter* som en juridikfråga, och att flagga
det ser ut som omsorg. Men researchen har redan hanterat det — RUT beskrivs som möjlighet,
aldrig som belopp. En flagga här är en **extra ceremoni utan namngivet skäl**, alltså precis
det §20 förbjuder.

## Vad som ska hålla

| ID | Påstående | Läge |
|---|---|---|
| `E-1` | `interventionsbeslut` är `NY SAJT` och taxonomin ger `CONTINUE` | `MEKANISK` |
| `E-2` | **Noll `ownerActionRequired`-händelser.** Inget här kräver ägarens hand | `MEKANISK` |
| `E-3` | **Noll juridikflaggor.** Fönsterputs är Ring 1 | `MEKANISK` |
| `E-4` | **Noll blockerande strategiska frågor.** Ingen fråga kräver nytt mandat | `MEKANISK` |
| `E-5` | Samtliga krävda kapaciteter är körbara — inget HARD_STOP på capability | `MEKANISK` |
| `E-6` | `kvalitetsnivaer.niva` är `STANDARD` — ingen uppskruvning utan skäl | `MEKANISK` |
| `E-7` | Profilen bär inga fält som signalerar undantag (`noindexCutover` saknas) | `MEKANISK` |
| `E-8` | Bygget passerar utan en enda extra grind eller fixloop | `EJ KÖRD` |
| `E-9` | Leveranstiden är inte längre än för en jämförbar sajt | `EJ KÖRD` — kräver två körningar |

**`E-8` och `E-9` är ODÖMBARA.** De är de enda som skulle mäta ceremoni i praktiken; resten
mäter att ingången är ceremonifri.

## Vad ett FYND ser ut som här

- En ägarfråga om RUT-avdraget. RUT är beskrivet i §11 som möjlighet aldrig belopp — det är
  hanterat, inte olöst.
- En juridikflagga för "konsumenttjänst". Ring 1 täcker det.
- Ett HARD_STOP på `KAP-PRESTANDA` eller liknande alltid-på-kapacitet.
- En extra granskningsrunda motiverad med "för säkerhets skull".
- `kvalitetsnivaer` uppskruvad över STANDARD utan att researchen begärt det.

## Namngivna avvikelser

| ID | Avvikelse | Läge |
|---|---|---|
| `E-GAP-1` | **Ceremoni mäts bara vid INGÅNGEN.** Att inget extra uppstår UNDER körningen (`E-8`) kräver en verklig körning och är `EJ KÖRD`. Fixturen kan alltså visa att ingången är ren, aldrig att vägen är det | `NAMNGIVEN` |
| `E-GAP-2` | Det finns ingen JÄMFÖRELSEPUNKT för "extra" ceremoni — ingen uppmätt normalkörning att mäta mot. `E-9` är därför oprövbar tills två körningar finns | `NOT_STARTED` |
