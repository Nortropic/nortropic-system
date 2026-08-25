# FOUNDATION SMOKE FIXTURE — kandidat (§A6)

**STATUS: KANDIDAT — EJ KLIPPT.** Denna katalog är R1:s förberedda kandidat. Det auktoritativa
klippet är en MÄNSKLIG HÖGRISK-handling (ceremonin nedan). FOUNDATION_REPAIR_GATE kan inte
förklaras GRÖN förrän människan klippt och kört denna fixtur med godkänt resultat.

**Enda konsument:** FOUNDATION_REPAIR_GATE. **Syfte:** bevisa den reparerade NUVARANDE
fabriksgrunden — inte universell webbkvalitet.

**Får ALDRIG:** bero på research-kontrakt v3 · imitera rorjour · reproducera 95/100 ·
bli FIX-A/FIX-B · införa v4-poäng · tunas mot legacy-utdata.

## De åtta grundpåståendena → mekaniska kontroller

| # | Påstående (Step-0) | Mekanisk kontroll | Läge |
|---|---|---|---|
| 1 | Repo-nativ rotupplösning + identitetsverifiering | `kontroller.sh` K1: `git rev-parse --show-toplevel` + origin-match `Nortropic/nortropic-system` + ankarfiler docs/07 + AUTOPILOT; negativ: körning utanför repot ⇒ vägran, aldrig gissad rot | KÖRBAR NU |
| 2 | Doctor läser verkliga ytor | K2: stewardens ROTUPPLÖSNING-block finns och inga `~/.claude`-install-ankare kvarstår i doctor-kommandona (grep-kanari med ankarkrav) | KÖRBAR NU |
| 3 | web-design-guidelines konsumeras ur pinnade lokala bytes | R3 GENOMFÖRD (2026-08-25): verkliga regler @ pinnad SHA `e3d624ba` (`references/upstream-command.md`, byte-bevisad); K3 verifierar mekaniskt: ingen hämtnings-/latest-instruktion i adaptern, regelfilen finns, VENDORED.md bär den ägar-utpekade commit-SHA:n, och payloadens sha256 matchar det registrerade R3-PAYLOAD-SHA256-värdet | KÖRBAR NU (full) |
| 4 | impeccable är en frusen lokal fork utan själv-/auto-auktoritet | R4 GENOMFÖRD (2026-08-25): K4 bevisar mekaniskt att forken (LOCAL_NORTROPIC_FORK av pbakaus/impeccable@`ddc37242`) saknar uppdateringsmaskineri (ingen `impeccable.style`/`UPDATE_AVAILABLE` i context.mjs — borttaget, inte sovande), saknar beroende-installationsinstruktion (detect-url.mjs fail-closed, `npm install` förbjudet), saknar automatisk CSP-breddning (live-inject.mjs blockerar med `CSP_REQUIRES_EXPLICIT_DEV_AUTHORITY`) och bär Apache-licensen; negativ: varje återinförd yta ⇒ FAIL | KÖRBAR NU (full) |
| 5 | Kanonisk pinnad axe-väg exekverar deterministiskt | R6 GENOMFÖRD (2026-08-25): **@axe-core/cli 4.13.0** + motor axe-core 4.13.0 exakt-pinnade i den kanoniska verktygsroten `tools/web-quality/` (package.json + package-lock committade; ETT verktygsauktoritet — Foundation observerar samma installation, ingen separat `foundation/verktyg/`). K6 pinnar mätstickan (sha256 av `scripts/run-axe-gate.mjs` + package.json + lockfil) och bevisar kontraktet (`--axe-source`-/`--chromedriver-path`-bindning, motoridentitet i resultatet, ingen npx-/installationsväg, Gate 4 bunden). Exekveringsbevis på kanoniska Macen: ren fixtur PASS ×2 med identisk materiell hash, brytande fixtur FAIL ×2 med identisk violationsidentitet, kundmotor-substitution avvisad, sentinel-hemlighet redakterad, onåbart mål ODÖMBART — under ägar-ratificerade BROWSER_VERIFICATION_EXECUTION (sandlådan nekar strukturellt listen()) | KÖRBAR NU (full; webbläsarkörningen kräver kapaciteten) |
| 6 | Kanonisk pinnad Lighthouse-väg med exakt versionsidentitet | R7 GENOMFÖRD (2026-08-25): **lighthouse 13.4.1** (Apache-2.0, Node-krav >=22.19 — kanoniska Macen kör v22.23.2) exakt-pinnad i SAMMA kanoniska verktygsrot `tools/web-quality/` som axe (ETT verktygsauktoritet — ingen separat `foundation/verktyg/`; klipp-ceremonin materialiserar samma rot via `cd tools/web-quality && npm ci`). K7 pinnar mätstickan (runner-sha256; package/lock delas med K6 vars pinnar transiterades i samma ägargranskade kandidat) och bevisar kontraktet: direkt pinnad CLI-väg, exakt kategorimängd, mobil-ankare, LHR-versionsidentitet, LCP/CLS-tröskelankare, INP-sanningsgräns (navigations-Lighthouse mäter aldrig INP; TBT är proxy, aldrig INP-PASS), Gate 2 bunden; MCP-/DevTools-vägen förblir observationsinstrument (VERKTYG ≠ GRÄNSSNITT), aldrig kanonisk evidens | KÖRBAR NU (full; webbläsarkörningen kräver BROWSER_VERIFICATION_EXECUTION) |
| 7 | Bygg-/granskningsmaskineri fungerar på liten fabricerad TESTKLIENT utan desktop-beroenden | Klippet skapar `foundation/testklient/` — en MINIMAL fabricerad-märkt sida (statisk, en sida, FABRICERAD-banner, noindex) byggd för att verktygskedjan (axe + Lighthouse + template-lins-läsning) ska ha ett verkligt mål; INTE en kundsajt, INTE rorjour-formad, inga §7-anspråk | EFTER KLIPP |
| 8 | Uppströmsdrift kan inte förbi promotiongränsen | K5-negativer: (a) R5 GENOMFÖRD (2026-08-25): K5a pinnar mätstickan (sha256 av `scripts/verify-vendored-integrity.mjs` + `config/vendored-integrity.v1.json`) och kör verifieraren — varje muterad vendored-byte, tillagd/raderad/omdöpt fil, exekveringsbitsändring, symlänk eller manifestmanipulation fäller mekaniskt, och payload+manifest ändrade tillsammans utan pinn-transition fälls av pinnarna; (b) plantera en mutable-fetch-instruktion i en skill-kropp → kanarin fäller; (c) `NY_REGIM_KLIPPT=true` utan klippta fixturer → suiten dömer aldrig GRÖN på tomhet (ankarkrav) | KÖRBAR NU (full) |

## Klippceremonin (människan, HÖGRISK — exakta steg; PRECUT-rekonciliering 2026-08-25)

**ETT VERKTYGSAUKTORITET:** klippet skapar ALDRIG någon `tests/fixtures/foundation/verktyg/` —
den kanoniska, redan granskade verktygsroten är `tools/web-quality/` (R6/R7; package.json +
package-lock committade och K6-/K7-pinnade). Ett andra package.json/lock är ett klippfel.

1. Verifiera exakt auktoritativ bas och den granskade Foundation-kandidaten (commit/träd).
2. Kör och FALSIFIERA `kontroller.sh` före förtroende-transitionen (ingen kontroll får vara
   vacuös — kör medvetet mot en planterad defekt och se den fälla; återställ).
3. Materialisera de BEFINTLIGA kanoniska verktygen: `cd tools/web-quality && npm ci` — och
   bevisa att package.json-/package-lock-hasharna är oförändrade (K6-/K7-pinnarna gäller;
   node_modules committas aldrig).
4. Skapa den minimala TESTKLIENT-sidan (claim 7) under den kanoniska foundation-fixturvägen —
   fabricerad-märkt, statisk, en sida, noindex.
5. Kör de kanoniska runnarna mot fixturen under BROWSER_VERIFICATION_EXECUTION med
   identitetsceremonin (K6/K7): `scripts/run-axe-gate.mjs` tar testklienten som `file://`-mål
   (mekaniskt bevisat R6); `scripts/run-lighthouse-gate.mjs` kräver http(s) — lighthouse@13.4.1
   tillåter endast `https:/http:/chrome:` (mekaniskt verifierat i `core/lib/url-utils.js`), så
   testklienten servas då via en minimal lokal engångs-statisk server i samma
   kapabilitetsmiljö (listen() finns där; servern är klipptillfällets verktyg, aldrig repoyta).
6. Genomför den föreskrivna gransknings-/mallinläsningsvägen för Foundation-fixturen.
7. FÖRST när hela klippkandidaten passerar: ändra STATUS-raden överst till `KLIPPT <datum>`.
8. EN ägar-HÖGRISK-commit med klippartefakterna + beslutslogg-rad — inget mer.
9. **Foundation-smoke-klippet vänder ALDRIG `NY_REGIM_KLIPPT`** — flaggan tillhör den SENARE
   ägar-styrda universalregim-transitionen (två separata §A6-familjer, se nedan) och förblir
   `false` tills det kontraktet finns och klipps.
10. Först efter publicering av klipp-commiten får en OBEROENDE
    FOUNDATION_REPAIR_GATE-granskning (aldrig självcertifierad av reparations- eller
    klippsessionen) värdera gaten — förutsatt att även R2–R11-kriterierna håller.

## Vad som INTE ingår

Universalregimens fixturer (FIX-A/FIX-B/FIX-NOBUILD/FIX-MIGRATION) — de hör till S1/S3/S5 och
blockerar inte gaten; deras klipp är en EGEN senare §A6-transition och är det ENDA som får
vända `NY_REGIM_KLIPPT`. Gym-banker, holdouts, Director-fall — senare lanes per masterplanen.
