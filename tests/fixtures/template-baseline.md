> **HISTORISK URKUND — EJ AKTUELL TRUST-EVIDENS (FIXTURE_REGIME_CHANGE 2026-08-24, §A6).**
> Legacy-regimens baseline; retirerad genom ägarbeslut S0. Konsumeras av ingen grind/probe.
> Se FIXTURE-REGIME-CHANGE-2026-08-24.md. Jämförelser över regimgränsen är ogiltiga.

# Template-test-baseline — fryst preview (verify-suitens facit)

Fryst: 2026-07-19 · Preview: https://rorjour-stockholm.vercel.app · Design-blocklist per commit `dd92a26` (`skills/nortropic-antislop/references/design-blocklist.md`, v14) · Källkod: `~/Workflow/rorjour-stockholm/src/`

**Regeln (§B6):** endast NYA CRITICAL fäller en regressionskörning. Fynden nedan är ACCEPTERAD UTGÅNGSPUNKT — sajten byggdes före v14 (ingen §5-hävning möjlig, ingen design-referenser/), så blocklistträffar förväntas. Matchning görs på sektion + mönster.

## Hero-regeln (baseline-utfall)

**EJ CRITICAL — passerad.** Heron är vänsterställd/asymmetrisk (`7fr_5fr`-grid, 0 `text-center` i preview-DOM), exakt blocklistens föreskrivna default-riktning. Pill-badgen ovanför H1 loggas separat som MINOR och gör inte kompositionen till en malträff.

## Kända fynd (accepterad utgångspunkt)

| # | Sida/Sektion | Mönster (blocklistpunkt) | Severity |
|---|---|---|---|
| 1 | Site-wide — kort som genomgående sektionsspråk (kort-på-allt) | A §10 | MAJOR |
| 2 | Testimonials 3-kol kortrutnät (home, /tjanster/*, /omraden/*, /omdomen) | A §8+§10 (instans av 1) | MAJOR |
| 3 | Tjänste-kortgrid "Det här hjälper vi dig med" (home + /tjanster) | A §8+§10 (instans av 1) | MAJOR |
| 4 | AreaList 4-kol länk-kortrutnät (home + /omraden) | A §10 (instans av 1) | MAJOR |
| 5 | Om-oss stat-kort "Siffrorna som betyder något" | A §8+§10 (instans av 1) | MAJOR |
| 6 | Pill-badge ovanför H1 (hero + områdes-hero) | A §11 (jour-signal med live-dot, ej dekorativ) | MINOR |
| 7 | Token-defaults: rounded-xl/lg + shadow-sm/md | B (radius/skuggor) | MINOR |
| 8 | `border-l-4` side-stripe-listmotiv (home + /rot-avdrag) | swappable-test (b) | MINOR |

**Totalt: CRITICAL 0 · MAJOR 5 · MINOR 3.**

## Prövade mönster som EJ faller (registrerade så framtida diff inte falsk-fäller)

Hero-kompositionen (asymmetrisk, ej A §7) · numrerade steg med informationsbärande ordning (A §14 tillåter) · paletten (varm off-white + bransch-blå/navy/CTA-grön, inget AI-kluster, A §15) · footer 3 kolumner · CtaBanner (doktrin-föreskriven, vänsterställd) · shadcn endast i formulär/interaktiva kontroller (A §21) · inga zebra-sektioner · ikoner endast funktionella (A §12) · inga emoji/gradient-blobbar/mesh.
