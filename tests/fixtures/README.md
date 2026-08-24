# tests/fixtures — verify-suitens frysta baselines (§A6)

Dessa filer är konstitution §A6 (`docs/07-konstitution.md`): de uppdateras ENDAST av en människa, aldrig av trappmoderna eller någon annan autonom process. Ett regressionsnät som kan redigeras av det som ska fångas är inget nät.

## FIXTURE_REGIME_CHANGE 2026-08-24 — läs FÖRST

Ägarbeslut (S0): **den gamla desktop-erans fixturkedja är RETIRERAD.** De tre baselines i denna
katalog (`eval-baseline.md`, `plan-baseline.md`, `template-baseline.md`) är **HISTORISK URKUND —
INTE aktuell trust-evidens.** Hela beslutet, skälen och de ogiltiga jämförelserna står i
[`FIXTURE-REGIME-CHANGE-2026-08-24.md`](FIXTURE-REGIME-CHANGE-2026-08-24.md). Verify-suitens
prober är mekaniskt kortslutna med orsaken `NY-REGIM-VÄNTAR` tills människan klippt den nya
regimens fixturer.

Två fixturfamiljer efterträder legacy-kedjan, båda §A6 (människoklippta):

1. **`foundation/`** — FOUNDATION SMOKE FIXTURE: minimal, portabel, med FOUNDATION_REPAIR_GATE
   som ENDA konsument. Bevisar den reparerade NUVARANDE fabriksgrunden — inte universell
   webbkvalitet. Kandidat + exakta klippinstruktioner: `foundation/README.md`.
2. **Universalregimens fixturer** (FIX-A lokal positiv kontroll · FIX-B B2B-SaaS negativ
   kontroll · FIX-NOBUILD · FIX-MIGRATION) — hör till S1/S3/S5-banan enligt den DESIGN-FRUSNA
   masterplanen, klipps senare, blockerar INTE R1/gaten.

Nya baseline-kandidater tas fram med `/nortropic-verify-suite --cut-baseline` (skriver
kandidater till `~/.nortropic/factory/baseline-kandidater/`); att granska kandidaten och
committa den hit är en mänsklig handling. Nya fixturer designas för FALSIFIERING, aldrig för
historisk imitation — den nya regimen tunas ALDRIG mot legacy-poäng eller legacy-utdata.
