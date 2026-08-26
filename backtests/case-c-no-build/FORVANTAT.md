# CASE C — NO-BUILD, vad PASS betyder

Ankare: masterplanens §26 —
> *"Additional reality fixtures: NO-BUILD / MIGRATION / STANDARD-zero-ceremony negative
> controls are used to prove the architecture does not assume every engagement is
> 'build a new local site.'"*

Fixturen är en av tre som stänger `§26-GAP-1`.

---

## Vad den prövar

**Att systemet kan komma fram till att en ny sajt inte är åtgärden.** Nordvik har redan en
sajt som fungerar: den konverterar 1,8 %, rankar 3,2 i snitt och har gröna Core Web Vitals.
Förlusten sker någon annanstans — **247 av 412 samtal går obesvarade**, och de fjorton
senaste låga omdömena säger alla samma sak.

En ny sajt skulle inte flytta en enda av de siffrorna.

## Slutsatsen står HÄR, inte i researchen

Researchen bär råa signaler och skriver inte ut interventionsbeslutet. Det är hela provet:
**kan systemet DRA slutsatsen, eller bara kopiera den?** (Samma disciplin som `B-GAP-2`.)

| Rå signal i researchen | Slutsats som ska dras | Vad ett fel ser ut som |
|---|---|---|
| §2: sajten konverterar 1,8 %, rankar 3,2, gröna CWV, uppdaterad för två månader sedan | Sajten är inte problemet | "Sajten är från 2022 och behöver moderniseras" — ålder utan utfall |
| §1: 247 av 412 samtal obesvarade | Förlusten sker i telefonen | Ett kontaktformulär till som "lösning" på obesvarade samtal |
| §2: 14 låga omdömen nämner alla tillgänglighet | Problemet är bekräftat av kunderna själva | Omdömena läses som ett anseendeproblem att dölja |
| §2: GBP säger 07–16, verklig telefontid är 07–11 | En felaktig uppgift kunden själv kan rätta på fem minuter | Uppgiften kopieras in i den nya sajten och multipliceras |
| §13: två uppsagda avtal, båda motiverade med tillgänglighet | Kostnaden är mätt och pekar bort från webben | Avtalsförlusten tillskrivs "svag digital närvaro" |

**Förväntat `interventionsbeslut`: `ICKE-SAJT-ÅTGÄRD`.**

## Vad taxonomin ska göra med det

| ID | Påstående | Läge |
|---|---|---|
| `C-1` | `ICKE-SAJT-ÅTGÄRD` ger `ROUTE`, aldrig `HARD_STOP` | `MEKANISK` |
| `C-2` | `ROUTE` kräver INGET ägarsvar — `ownerActionRequired: false` | `MEKANISK` |
| `C-3` | Lanen avslutas UTAN att något byggs, och utan att capability-gränsen kringgås | `MEKANISK` |
| `C-4` | Briefen bär rekommendationen; ingen sajt planeras | `EJ KÖRD` — kräver en plannerkörning |
| `C-5` | Rekommendationen namnger den FAKTISKA åtgärden (telefonpassning, GBP-öppettider) | `EJ KÖRD` |

**`C-4` och `C-5` är ODÖMBARA, aldrig gröna.** De är de två som skulle bevisa att systemet
säger rätt sak — resten bevisar att det inte bygger något.

## Fixturen har INGEN profile.ts, och det är avsiktligt

`content/profile.ts` är kalibreringsfacit för en sajt som byggs. En NO-BUILD-fixtur med en
profil skulle påstå att ett bygge planeras. **Frånvaron är en del av provet.**

## Namngivna avvikelser

| ID | Avvikelse | Läge |
|---|---|---|
| `C-GAP-1` | Härledningen rå signal → `ICKE-SAJT-ÅTGÄRD` görs av PLANNERN, en modell. Fixturen prövar att taxonomin ROUTAR rätt på ett givet beslut — inte att beslutet blir rätt | `NAMNGIVEN` |
