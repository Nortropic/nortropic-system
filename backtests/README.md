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

Planens §26 har tre underrubriker. Två är byggda här. Den tredje är det inte, och den
utelämnas INTE tyst — §35:s inventeringsmetod tillåter ingen sådan status.

| ID | Lucka | Status | Nästa transition |
|---|---|---|---|
| `§26-GAP-1` | *"Additional reality fixtures: NO-BUILD / MIGRATION / STANDARD-zero-ceremony negative controls are used to prove the architecture does not assume every engagement is 'build a new local site.'"* Ingen av de tre finns. De prövar `interventionsbeslut` (S3) — att systemet kan komma fram till FÖRBÄTTRA BEFINTLIG, ICKE-SAJT-ÅTGÄRD eller AVRÅD, och att en STANDARD-leverans inte drar på sig extra ceremoni utan namngivet skäl (§20) | `NOT_STARTED` | Tre fixturer till: `case-c-no-build/` (kunden behöver ingen ny sajt), `case-d-migration/` (befintlig sajt ska förbättras, inte ersättas), `case-e-standard/` (nollceremoni). Var och en med `FORVANTAT.md` i samma form |
| `A-GAP-3` | Case A:s **kompatibilitetsväg** — se `case-a-lokal/FORVANTAT.md` | `NOT_STARTED` | En `case-a-legacy/`-fixtur med v1-profil |

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
