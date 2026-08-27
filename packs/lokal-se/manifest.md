# PAKET: `lokal-se` — manifest v1.0.0

**Paket-id:** `lokal-se` · **Status:** `VALIDATING*` (se [statustabellen](../../docs/06-scope.md))
**Kapacitetsstatus per rad:** [kapacitetskatalogen](../../docs/kapacitetskatalog.md)

Svenska egenföretagare och lokala förtroendetjänster med EN primärhandling. Paketet är
ett **KAPACITETSPAKET** — konfiguration och yta, aldrig ett affärspaket. Priser,
paketinnehåll och kundlöften är `docs/07-konstitution.md` §A5 och bor aldrig här.

## Modulerna

| Modul | Hemvist | Roll |
|---|---|---|
| **Researchmodul** | [`research-module.md`](research-module.md) | SKÄRPER den universella researchkärnan (sektion 1–17) |
| **Strategimodul** | `strategi/` (nedan) | Branschprofiler: tonmönster, kvittolistor, bransch-antislop |
| **Kapacitetsrader** | [kapacitetskatalogen](../../docs/kapacitetskatalog.md) + tabellen nedan | Vad paketet kan levereras OCH verifieras på |
| **Grindlinser** | [`gate-lenses.md`](gate-lenses.md) | Vilken universell kategori en paketspecifik iakttagelse hör hemma i |

## Kapacitetskompositionen — vad `lokal-se` FAKTISKT består av

Masterplanens D2: *"packs are named compositions of capabilities."* **Denna tabell är
namngivningen.** Utan den pekade manifestet på katalogen i allmänhet och band ingen enskild
rad till paket-id:t — `PK-GAP-1`.

**Två roller, och de får aldrig blandas ihop.** Ett paket ÄGER en kapacitet när kapaciteten
saknar mening utan paketet. Det SKÄRPER en universell kapacitet när kapaciteten gäller varje
kund men paketet kräver mer. **Skärpningslagen går bara åt ett håll:** ett paket får smalna
av kärnan, aldrig lätta den.

| Kapacitet | Paketets roll | Vad rollen innebär |
|---|---|---|
| `KAP-LOKAL-SEO` | **ÄGER** | Kapaciteten har ingen mening utan paketet. Vid `core-only` aktiveras den aldrig, och dess frånvaro är KORREKT |
| `KAP-SCHEMA` | **SKÄRPER** | Kärnan kräver korrekt schematyp; paketet kräver en `LocalBusiness`-subtyp och NAP identisk med `business.ts` |
| `KAP-KVITTON` | **SKÄRPER** | Kärnan kräver belagda kvitton med attribution; paketet kräver betyg + EXAKT antal + plattform tillsammans, aldrig betyget ensamt |
| `KAP-PRIMARHANDLING` | **SKÄRPER** | Kärnan kräver en primärhandling som fungerar; paketet smalnar enumet till `ring · boka · platsforfragan · offert · besok` |
| `KAP-BILD` | **ÄRVER** | Gäller oförändrad. Raden står här för att kompositionen ska vara fullständig, inte för att något ändras |
| `KAP-PRESTANDA` | **ÄRVER** | Alltid vid leverans, oavsett paket |

**`ÄRVER` är en egen rad och inte en tystnad.** En kapacitet som varken ägs eller skärps
måste ändå stå med — annars går det inte att skilja "gäller oförändrad" från "glömdes bort",
och kompositionen vore ofullständig utan att någon kunde se det.

**Kapaciteter paketet INTE komponerar:** `KAP-EXTERN-BOKNING` (aktiveras av kundens egen
bokningstjänst, oberoende av paket) · `KAP-EHANDEL` och `KAP-EGET-TILLSTAND` (Ring 3,
`ROUTE-OUT`) · `KAP-RING2-JURIDIK` (Ring 2, egen ceremoni).

## Strategimodulen — den repo-nativa hemvisten för branschprofiler

**Detta ersätter det RETIRERADE `~/Workflow/profiler/`** (ägarbeslut S0, 2026-08-24).
Branschprofiler bor från och med nu i `packs/lokal-se/strategi/<bransch>.md` — repo-nativt,
versionerat och granskningsbart, aldrig i en hemkatalog utanför repot.

En profil bär: branschens tonmönster · dess legitima vernacular · kvittolista med
attributionsregler · bransch-antislop (additiv till bas-blocklistan) · typiska
juridikflaggor att spana efter.

**Katalogen är AVSIKTLIGT TOM vid födseln.** Profiler skrivs när riktiga kunder visar
vad som faktiskt återkommer — en påhittad startprofil vore exakt det slags
självförtroende utan belägg som resten av systemet finns för att förhindra. Saknas en
profil för branschen är det inget fel: plannern syntetiserar §7 ur research + 5d-fynden
enligt bevisregeln, precis som den gör i dag.

**Zonstatus:** paketet är **ÄNNU INTE §A-zonat.** Nattskiftets Zon 1
(bransch-antislop-skörd) förblir VILANDE tills konstitutionen uttryckligen zonar
`packs/` — den zoningen är en mänsklig §A-handling (H-2), aldrig en agenthandling.
§7.4 (kvittolista & attribution) och §7.7 (juridikflaggor) är §A7-skyddade och rörs
aldrig av skörd.

## Aktiveringssignal

Paketet aktiveras när det är **BELAGT** — svensk lokal förtroendetjänst med belagd ort
och belagd primärhandlingskandidat. En **ANTAGEN** bransch aktiverar aldrig paketet:
då gäller `core-only` med hypotesen noterad i researchens sektion 15.

## Vad paketet ALDRIG gör

- **Lättar aldrig ett universellt krav** (skärpningslagen — se researchmodulen).
- **Bedömer aldrig juridik** — flaggor observeras, beslutet är människans vid nod 3.
- **Bär aldrig affärsvillkor** — §A5 gäller.
- **Föder aldrig en ny agent** — en kompetens som växer blir en modul, inte en roll.
