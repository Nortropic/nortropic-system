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
| 5 | Kanonisk pinnad axe-väg exekverar deterministiskt | Pin-kandidat uppmätt 2026-08-24: **@axe-core/cli 4.13.0** (motor axe-core 4.13.0). Klippet installerar exakt version i `foundation/verktyg/` (package.json + lockfil committas), kör mot testklient-sidan och kräver: verktyget rapporterar sin exakta version + deterministiskt utfall vid dubbelkörning | EFTER KLIPP (R6) |
| 6 | Kanonisk pinnad Lighthouse-väg med exakt versionsidentitet | Pin-kandidat uppmätt 2026-08-24: **lighthouse 13.4.1** (Node v22.23.2 uppfyller 13:ans krav). Samma mönster: exakt pinnad CLI i `foundation/verktyg/`, versionen ska stå i varje rapport; MCP-vägen förblir observationsinstrument (VERKTYG ≠ GRÄNSSNITT) | EFTER KLIPP (R7) |
| 7 | Bygg-/granskningsmaskineri fungerar på liten fabricerad TESTKLIENT utan desktop-beroenden | Klippet skapar `foundation/testklient/` — en MINIMAL fabricerad-märkt sida (statisk, en sida, FABRICERAD-banner, noindex) byggd för att verktygskedjan (axe + Lighthouse + template-lins-läsning) ska ha ett verkligt mål; INTE en kundsajt, INTE rorjour-formad, inga §7-anspråk | EFTER KLIPP |
| 8 | Uppströmsdrift kan inte förbi promotiongränsen | K5-negativer: (a) R5 GENOMFÖRD (2026-08-25): K5a pinnar mätstickan (sha256 av `scripts/verify-vendored-integrity.mjs` + `config/vendored-integrity.v1.json`) och kör verifieraren — varje muterad vendored-byte, tillagd/raderad/omdöpt fil, exekveringsbitsändring, symlänk eller manifestmanipulation fäller mekaniskt, och payload+manifest ändrade tillsammans utan pinn-transition fälls av pinnarna; (b) plantera en mutable-fetch-instruktion i en skill-kropp → kanarin fäller; (c) `NY_REGIM_KLIPPT=true` utan klippta fixturer → suiten dömer aldrig GRÖN på tomhet (ankarkrav) | KÖRBAR NU (full) |

## Klippceremonin (människan, HÖGRISK — exakta steg)

1. Granska denna kandidat + `kontroller.sh` (ingen kontroll får vara vacuös — kör medvetet
   mot en planterad defekt och se den fälla).
2. Installera pinnade verktyg: `cd tests/fixtures/foundation/verktyg && npm init -y &&
   npm install --save-exact @axe-core/cli@4.13.0 lighthouse@13.4.1` — committa package.json +
   package-lock.json (exakta versioner är §A6-yta när de blivit grind-facit).
3. Skapa den minimala testklient-sidan (steg 7) — fabricerad-märkt, en sida.
4. Kör `kontroller.sh` + verktygskörningarna; alla KÖRBAR-NU-kontroller ska PASSA och
   versionsidentiteterna ska matcha pinnarna exakt.
5. Ändra STATUS-raden överst till `KLIPPT <datum>` och committa allt i EN HÖGRISK-märkt
   commit tillsammans med beslutslogg-rad.
6. Först därefter kan den oberoende FOUNDATION_REPAIR_GATE-granskningen (aldrig
   självcertifierad av reparationssessionerna) förklara gaten GRÖN — förutsatt att även
   R2–R11-kriterierna håller.

## Vad som INTE ingår

Universalregimens fixturer (FIX-A/FIX-B/FIX-NOBUILD/FIX-MIGRATION) — de hör till S1/S3/S5 och
blockerar inte gaten. Gym-banker, holdouts, Director-fall — senare lanes per masterplanen.
