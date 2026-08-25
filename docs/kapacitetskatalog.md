# Kapacitetskatalog — vad fabriken kan leverera OCH verifiera

Senast verifierad mot systemet: 2026-08-25 · v1 (denna commit)
Verifieringsomfång: nyskapad i S3-skivan; inga tidigare påståenden att verifiera.

En **kapacitet** är en enhet av webbkompetens som fabriken kan **leverera och
oberoende verifiera**. Katalogen är VANLIG DOKUMENTATION: ingen mekanisk grind läser
den, och den är inte §A-skyddad. Dess värde ligger i att den tvingar fram frågan
"hur vet vi att detta blev gjort?" innan något utlovas.

**Universella alltid-på-egenskaper är KÄRNREGLER, inte katalograder.** Faktatrohet,
tillgänglighet och säkerhet gäller varje leverans och får aldrig se ut som ett
valbart tillval genom att stå som en rad här.

## Radens obligatoriska fält

| Fält | Krav |
|---|---|
| **ID** | Stabilt. Ändras aldrig; en kapacitet som byter innebörd får ett NYTT id |
| **Aktiveringssignal** | Vad i researchen som gör kapaciteten relevant — observerbart, aldrig antaget |
| **Verifierbart krav** | Vad som ska vara sant vid leverans, formulerat så det går att pröva |
| **Kravets hemvist / grind / evidensankare** | VAR kravet bor och vad som bevisar det |
| **Status** | `DECLARED` · `BUILT` · `VALIDATING` · `PROVEN` · `ROUTE-OUT` |

**Statusen är ärlig eller värdelös.** Syntetisk evidens bär en rad högst till
VALIDATING; `PROVEN` kräver riktig kundevidens. `ROUTE-OUT` betyder att kapaciteten
medvetet ligger utanför — den hänvisas bort, den saknas inte.

## Katalogen

| ID | Aktiveringssignal | Verifierbart krav | Hemvist / grind / evidensankare | Status |
|---|---|---|---|---|
| `KAP-PRIMARHANDLING` | Research sektion 4 bär en primärhandlingskandidat | Primärhandlingen fungerar end-to-end för den kandidaten | Gate 1 (primärhandlingsgrinden); `content/profile.ts` `gate1Test` | VALIDATING |
| `KAP-LOKAL-SEO` | Belagd ort (sektion 5 / L1) och `seoLage=lokal\|hybrid` | Ortssidor är belagda, inte tunna; meta/schema/NAP konsistenta | `nortropic-seo-lokal`; SEO-audit i review/launch | VALIDATING |
| `KAP-SCHEMA` | Organisationstyp känd (sektion 1) | Korrekt schema-subtyp, validerar, NAP identisk med `business.ts` | §7.5; seo-optimizerns audit | VALIDATING |
| `KAP-KVITTON` | Förtroendekvitton belagda (sektion 6) | Varje kvitto attribueras korrekt; inga lånade meriter | §7.4 (§A7-skyddad); trust-linsen i review | VALIDATING |
| `KAP-BILD` | Bildinventering gjord (sektion 7) | Bildspår + behandling härledda ur inventeringen, budget hålls | `nortropic-bild`; `BILDRAPPORT.json`; LCP-budget i Gate 2 | VALIDATING |
| `KAP-PRESTANDA` | Alltid vid leverans av sajt | Gate 2:s trösklar hålls på deployad preview | `scripts/run-lighthouse-gate.mjs` (kanonisk runner) | VALIDATING |
| `KAP-EXTERN-BOKNING` | Extern bokningstjänst används (sektion 10 / L3) | Bokningsvägen når tjänsten; sajten förblir stateless | §7.1 `gate1Test`; Gate 1 | DECLARED |
| `KAP-EHANDEL` | Kunden vill sälja online (sektion 9/11) | — | Ring 3 i [06-scope.md](06-scope.md): hänvisas till handelsplattform | ROUTE-OUT |
| `KAP-EGET-TILLSTAND` | Inloggning/medlemsdata/databas efterfrågas (sektion 9/11) | — | Ring 3: offereras som separat systemutveckling | ROUTE-OUT |
| `KAP-RING2-JURIDIK` | Ohanterad juridikflagga (sektion 11) | Modulen finns innan bygget påbörjas | Ring 2: byggs vid första ja, offereras som eget arbete | DECLARED |

**Ingen rad står på PROVEN.** Det är det korrekta läget: paketet har ingen ackumulerad
riktig-kund-evidens ännu. Se [kompetensregistret](kompetensregister.md) för samma
ärlighetskrav på rollkonfigurationer.

## Hur plannern använder katalogen

1. Läs researchens **kapacitetssignaler** (sektion 15) och de sektioner som bär
   aktiveringssignaler.
2. Kompilera signalerna mot katalogen: vilka kapaciteter aktiveras?
3. **`ROUTE-OUT` routas bort** — briefen rekommenderar hänvisning, den planerar aldrig
   runt en medveten gräns.
4. **`DECLARED` som krävs men saknar byggd kapacitet ⇒ STOPP** som STRATEGISK öppen
   fråga. Plannern bygger aldrig vidare på en kapacitet som inte finns.
5. Kapaciteter som aktiveras skrivs i briefens **§7.10** med sin katalogstatus.
