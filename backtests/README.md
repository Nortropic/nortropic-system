# Backtester — Case A och Case B (S7/S8, UTKASTLÄGE)

Ankare: masterplanens **§26 BACKTEST / FALSIFICATION DESIGN** och **Part 12 steg 8**
(*"Case B — Prep earlier; consume after appropriate upstream contracts"*). Uppströms­
kontrakten S1 (researchkontrakt v3), S3 (planner + kapacitetskatalog), S4 (Site Quality
Contract v2) och S5 (grindparameterisering) är landade — därför byggs prepen nu.

## Vad som finns här

| Fixtur | Roll | Kompositionsläge |
|---|---|---|
| [`case-a-lokal/`](case-a-lokal/) | **Bevarande** — lokal semantik och defektkänslighet ska överleva kärna/paket-delningen | `pack=lokal-se` |
| [`case-b-saas/`](case-b-saas/) | **Negativkontroll** — en kund som är MEDVETET FEL för lokal-se-antagandena | `pack=core-only` |

Varje fixtur bär tre filer: `research.md` (verklig kontraktsform, sektion 1–17 + ev.
paketmodul), `profile.ts` (Site Quality Contract v2) och `FORVANTAT.md` (vad PASS betyder,
uttryckt som numrerade falsifierbara påståenden).

## Det viktigaste att förstå: FÖRBEREDD ≠ GENOMFÖRD

`scripts/check-backtest-fixtures.mjs` prövar **fixturerna**, inte systemet. Den kan bevisa
att en fixtur har rätt kontraktsform och att varje fälla i §26 har ett formulerat
påstående. Den kan **inte** bevisa att systemet beter sig rätt mot den — grindarnas
paketvillkor är prompttext, inte exekverbar logik, så det finns ingenting att köra
mekaniskt.

Varje beteendepåstående är därför märkt **`EJ KÖRD`** i sin `FORVANTAT.md` och är
**ODÖMBART — aldrig grönt**. En grön körning av vakten får aldrig citeras som
"Case A och Case B passerade". De har inte passerat; de är redo att prövas.

## Vad som skulle GENOMFÖRA backtesten

1. Kör `/nortropic-plan` på respektive `research.md` → brief.
2. Bygg (`/nortropic-init` + content) som TESTKLIENT — noindex, inga verkliga
   GBP-/GSC-/DNS-åtgärder (regel 14).
3. Kör `/nortropic-review` och `/nortropic-launch` och läs varje `EJ KÖRD`-påstående mot
   utfallet.
4. För Case A: plantera defekterna `A-D1`…`A-D10` en i taget och räkna hur många som
   fälls, av vilken yta. **Räkningen redovisas över den uppräknade mängden** — aldrig som
   "systemet har god defektkänslighet".
5. För Case B: pröva BÅDA PASS-villkoren. Frånvaro av lokalt läckage räcker inte; rätt
   semantik måste också ha aktiverats.

Det steget kräver ägarens beslut om kostnad och körning. Det är inte gjort här.

## Namngivna luckor mot §26

Planens §26 har tre underrubriker. **Samtliga tre är nu byggda här.** Luckorna nedan står
kvar som rader även när de stängts — en stängd lucka utan spår går inte att kontrollera,
och §35:s inventeringsmetod tillåter ingen tyst status.

| ID | Lucka | Status | Nästa transition |
|---|---|---|---|
| `§26-GAP-1` | *"Additional reality fixtures: NO-BUILD / MIGRATION / STANDARD-zero-ceremony negative controls are used to prove the architecture does not assume every engagement is 'build a new local site.'"* | `STÄNGD 2026-08-26` | Tre fixturer byggda: `case-c-no-build/` (Nordvik — sajten fungerar, 247 av 412 samtal går obesvarade) · `case-d-migration/` (Alvestas Måleri — rankar 2,1 med gröna CWV, problemet är innehåll och CTA) · `case-e-standard/` (Bergqvists Fönsterputs — den mest ordinära Ring 1-kunden som går att konstruera). Var och en med `FORVANTAT.md` och en härledningstabell **rå signal → slutsats som ska dras → vad ett fel ser ut som**. `kor-backtest.mjs` kör alla tre: `ICKE-SAJT-ÅTGÄRD` och `FÖRBÄTTRA BEFINTLIG` ger `ROUTE` utan ägarberoende, `NY SAJT` ger `CONTINUE` med **noll ägarkrävande händelser**. **Kvarstår, namngivet:** härledningen rå signal → beslut görs av PLANNERN (`C-GAP-1`/`D-GAP-1`) — fixturerna prövar ROUTNINGEN, inte beslutet. Och `E-GAP-1`: ceremoni mäts vid INGÅNGEN; att inget extra uppstår under körningen är `EJ KÖRT` |
| `A-GAP-3` | Case A:s **kompatibilitetsväg** | `STÄNGD 2026-08-26` | `case-a-legacy/` byggd: samma kund, `profilKontraktVersion: 'v1.1.0'` utan v2-fältgrupperna, research mot researchkontrakt v3.0.0. Bakåtkompatibilitetslagen är kod i `scripts/profil-las.mjs`. **Kvarstår som `AL-GAP-2`:** läsaren finns men ingen konsument använder den ännu |

## Avgränsningar som är lätta att missa

- **Detta är INTE `tests/fixtures/`.** Verify-svitens baselines där är §A6-skyddade och
  människoägda. Backtestfixturerna är vanlig dokumentation: ingen grind läser dem, ingen
  baseline klipps av dem, och de är inte regressionsnätet.
- **Syntetisk evidens bär aldrig något över `VALIDATING`** (`docs/06-scope.md`, §A9). En
  genomförd backtest gör inte `lokal-se` eller kärnan `PROVEN` — det kräver riktiga
  kunder. Simulering ger skala, verkligheten ger sanning.
- **Case A är inte den historiska kunden.** §26 säger *"historical/frozen"*; detta är
  frusen men syntetisk. Avvikelsen är namngiven som `A-GAP-1`.
- **v4-rubriken prövas inte här.** S7/S8 har ett utkastläge och ett aktiverat läge; det
  aktiverade hör ihop med S6 och finns inte ännu. Fixturerna prövas mot de NUVARANDE
  kontrakten.
