# FIXTURE_REGIME_CHANGE — 2026-08-24 (ägarbeslut, S0 · §A6)

## Varför legacy-evidensen förkastades

Ägarbeslut 2026-08-24 (S0-korrigeringen): den gamla desktop-erans fixturkedja —
`~/Workflow/test-rorjour/` (faktakälla), `~/Workflow/rorjour-stockholm/` (byggrepo),
`~/Workflow/profiler/` (profilbibliotek) och det frysta preview-aliaset
`rorjour-stockholm.vercel.app` — bedömdes som **dålig evidens**: oversionerat, maskinbundet
desktop-material utanför repo-kontroll, aldrig avsedd att bevaras som auktoritativ grund.

Beslutet: `LEGACY_FIXTURE_RECOVERY=REJECTED_BY_OWNER`. Ingen eftersökning, ingen överföring,
ingen rekonstruktion, ingen reproduktion av historiska utdata, ingen poängekvivalens-jakt.
Rekonstruerad evidens får ALDRIG kallas den gamla baselinen.

## Vilka baselines som inte längre är auktoritativa

| Fil | Historiskt innehåll | Status |
|---|---|---|
| `eval-baseline.md` | rorjour 95/100 på rubrik v3.0.0, fryst preview | **HISTORISK URKUND** |
| `plan-baseline.md` | rorjour-briefens ekvivalenskriterier | **HISTORISK URKUND** |
| `template-baseline.md` | template-fynd mot frysta previewn | **HISTORISK URKUND** |
| verify-suitens `PREVIEW`-konstant | rorjour-stockholm.vercel.app | **RETIRERAD** (R1) |

Filerna behålls i repot ENDAST som historiskt arkeologiskt underlag. De konsumeras inte av
någon grind, probe eller promotion.

## Vad de nya fixturerna bevisar

1. **`foundation/` (först — enda konsument: FOUNDATION_REPAIR_GATE):** att den reparerade
   NUVARANDE fabriksgrunden håller — repo-nativ rotupplösning + identitetsverifiering, doctor
   mot verkliga ytor, pinnade verktygsvägar (axe/Lighthouse), inaktiverad självuppdatering,
   inert mutable-main-hämtning, bygg-/granskningsmaskineri på en liten fabricerad TESTKLIENT
   utan desktop-beroenden, och att uppströmsdrift inte kan förbi promotiongränsen.
   INTE universell webbkvalitet, INTE research-kontrakt v3, INTE v4-poäng.
2. **Universalregimen (senare, S1/S3/S5):** FIX-A lokal positiv kontroll (kontrakt-v3-nativ,
   fabricerad-märkt, aldrig tunad mot rorjour) · FIX-B B2B-SaaS negativ kontroll med
   läckagefällor · FIX-NOBUILD · FIX-MIGRATION · senare Director-/systemomdömesfall i gymmet.

## Ogiltiga jämförelser över regimgränsen

- **Varje poäng-/verdiktjämförelse** mellan legacy-baselines och något i den nya regimen.
- v3-rubrikpoäng på legacy-material vs någon körning på nya fixturer.
- "Suiten var GRÖN förr" som argument om nuvarande hälsa — legacy-GRÖN byggde på retirerad
  evidens.
- Att en ny fixtur "borde ge ~95/100" — den nya regimen designas för falsifiering; numerisk
  imitation av historiska utfall är uttryckligen förbjuden (koherens-patch #4-disciplinen
  gäller även här: divergens undersöks, tunas aldrig bort).

## Mekanisk verkan (R1)

- Verify-suitens prober kortsluts med orsaken **`NY-REGIM-VÄNTAR (FIXTURE_REGIME_CHANGE
  2026-08-24)`** inom BEFINTLIG verdikttaxonomi (OGILTIG/KUNDE-EJ-KÖRAS — aldrig ett fjärde
  verdikt, aldrig tyst grönt).
- `NY_REGIM_KLIPPT`-flaggan i `workflows/nortropic-verify-suite.js` vänds ENDAST av människan,
  i samma §A6-commit som klipper och binder de nya fixturerna.
