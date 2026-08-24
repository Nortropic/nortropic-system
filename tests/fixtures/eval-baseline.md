> **HISTORISK URKUND — EJ AKTUELL TRUST-EVIDENS (FIXTURE_REGIME_CHANGE 2026-08-24, §A6).**
> Legacy-regimens baseline; retirerad genom ägarbeslut S0. Konsumeras av ingen grind/probe.
> Se FIXTURE-REGIME-CHANGE-2026-08-24.md. Jämförelser över regimgränsen är ogiltiga.

# Eval-baseline — fryst preview (verify-suitens facit)

Fryst: 2026-07-28 · **Rubrikversion: v3.0.0** · Preview: https://rorjour-stockholm.vercel.app (fryst publikt alias; ALDRIG en levande kunds rörliga preview) · Faktakälla: `~/Workflow/test-rorjour/research.md` · Byggrepo: `~/Workflow/rorjour-stockholm` @ commit `07c1d0d`

**Toleransregeln (§B6):** total får inte vara >2 p under baseline-totalen; inget kriterium får bli FAIL som är PASS här; Faktatrohet måste vara PASS. **Rubrikversion ≠ v3.0.0 ⇒ baselinen OGILTIG** — människan klipper om (en eval-körning).

Kontext som ska läsas MED siffrorna: sajten är byggd FÖRE v14 och repot saknar `content/profile.ts` (pre-v13-brief) — evalen faller tillbaka på hantverkar-defaulten. **Pre-v14-taket (kriterium 9):** under v3.0.0:s drag-kalibrerade 10-definition är 10 STRUKTURELLT OUPPNÅELIGT för denna mätsticka — briefens §5 saknar Referensöversättning/Signaturelement att nå tak-bevisnivå i; ej byggbrist, mätsticke-tak. Föregående committade baseline var 95/100 på rubrik v2.0.0 — EJ bakåtjämförbar (MAJOR-bump v3.0.0: kriterium 9:s 10-definition drag-kalibrerad mot PK-1…PK-8 + premium-bevis; omklippt 2026-07-28 efter Q2a-grind på eval-domaren: riktning 1 grön — premium-bevis läst #7, premium-checklist #6, kontrolltest design-blocklist #5 — riktning 2 ägar-godkänd på rå text).

## Totalpoäng (baseline)

**95/100 — lanseringsklar (band 90–100)** · Faktatrohetsgrinden: **PASS**

## Per-kriterium (baseline-status som "nya FAIL" döms mot)

| # | Kriterium | Vikt | Poäng | PASS/FAIL |
|---|---|---|---|---|
| 1 | Konverteringsarkitektur | 15 | 15 | PASS |
| 2 | Faktatrohet | 15 | 15 | PASS |
| 3 | Svensk copy-kvalitet | 10 | 9 | PASS |
| 4 | NAP-konsistens | 8 | 8 | PASS |
| 5 | Lokal SEO | 8 | 8 | PASS |
| 6 | Schema-korrekthet | 8 | 8 | PASS |
| 7 | Prestanda | 8 | 7 | PASS |
| 8 | Juridik komplett | 8 | 8 | PASS |
| 9 | Visuell distinktion | 10 | 8 | PASS |
| 10 | Förtroendesignaler | 5 | 5 | PASS |
| 11 | Teknisk hygien | 5 | 4 | PASS |

## Kända avdrag (accepterad utgångspunkt — får inte räknas som regression)

- Kriterium 3 (−1): em-dash-kedjan "— inte ett callcenter —" (`services.ts:48`). **VARIANS-NOT:** "oavsett om det är rotskärning eller relining" (`areas.ts:36`) är ett gränsfall — v2.0.0-baselinen fällde den som blocklistnära, v3.0.0-klippningens domare friade den som konkret either/or; raden är dömbar åt båda håll, och en framtida körning som fäller den (3 = 8) ligger inom domar-varians, ej regression.
- Kriterium 7 (−1): LCP/CLS/INP ej live-bekräftade (statisk viktbudget-bedömning; JS-budget hålls, noll tredjepartsrequests vid load). **PREVIEW-NOINDEX-NOT:** testklient-`noindex` (robots `Disallow: /`) gör Lighthouse-SEO ≥95 omätbar på frysta previewn — korrekt gating, ingen regression.
- Kriterium 9 (−2): inget koncentrerat signaturmoment (stillsam/disciplinerad lutning) + milt default-kortspråk (`rounded-xl border bg-card shadow-sm` återkommande) + enhetlig sektionsrytm utan medvetet luftbrott (PK-4) + borderline pill-badge över H1 (load-bearing jour-signal, ej fälld). **PRE-V14-NOT:** se pre-v14-taket i kontexten — 10 strukturellt ouppnåeligt för denna mätsticka; 8 är mätstickans ärliga nivå under v3.0.0.
- Kriterium 11 (−1): **DATERAD AUDIT-DRIFT-NOT (2026-07-28):** `pnpm audit --prod` ej rent — 15 sårbarheter (8 high, 7 moderate), bl.a. next 15.5.20 < 15.5.21 (high SSRF i Server Actions; sajtens enda serverkod är lead-actionen). Advisories PUBLICERADE EFTER frysen `07c1d0d`; mätstickan medvetet orörd — audit-status driftar över tid för en fryst preview, och en framtida körning kan se fler/färre advisories utan att bygget ändrats. Säkerhetsheaders + formulärhärdning fullt uppfyllda (−1 avser endast audit-delkravet). Patch-ärendet (next ≥15.5.21) är en separat inbox-rad, gated på nästa rorjour-touch.

## Kända gated testklient-platshållare (INTE faktatrohetsbrott)

Tom `certId` · `rating.url:""` · omdömen `placeholder:true` märkta "exempelomdöme" · TODO-FACT-markörer · aggregateRating/geo utelämnade ur schema · `robots.txt Disallow: /` (noindex-gaten är ett KRAV för testklient).
