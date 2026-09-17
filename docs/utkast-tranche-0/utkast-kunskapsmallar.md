> **UTKAST — TRANCHE 0 (2026-08-24). EJ PRODUKTION, EJ AUKTORITET.**
> Design-utkast enligt den DESIGN-FRUSNA masterplanen. Konsumeras av INGENTING
> före FOUNDATION_REPAIR_GATE; skarp version landar i sin riktiga hemvist i S1+.

# Utkast: kunskapsmallar (CLAIM · EXPERIMENT · KONFLIKT)

Kandidater till K2 enligt masterplan Part 2 C och N–S. Skarp hemvist:
`nortropic-knowledge/templates/` + `bok/INDEX.md`. Alla tre bygger på det
befintliga 9-nyckels-frontmattret (`templates/knowledge-document.md`) —
**authority: none alltid; ingenting i bygge/verifiering läser bok/**.

## Gemensamma lagar

- **En stege, RFC:ns fem tillstånd ordagrant + tre post-adoption:**
  `OBSERVED → CORROBORATED → LOCALLY_REPLICATED → LOCALLY_PROVEN → ADOPTED`,
  därefter `ADOPTED ⇄ CHALLENGED → DEPRECATED | SUPERSEDED`.
- **Claims skapas ENDAST av radar-deltan, erfarenhetslärdomar och experiment**
  — aldrig encyklopedisessioner (v1-ekonomin).
- **Peka, återge aldrig:** claims LÄNKAR (locator + klausulankare); NORMATIVE-
  promotioner citerar källklausulen, aldrig claimfilen, som Belägg — claimen är
  ett sökhjälpmedel, aldrig auktoritetskedjan.
- **En claim med ÖPPEN konflikt kan inte nå ADOPTED.**
- **Demotion av operativ text går alltid via förslag; §A ⇒ HÖGRISK.** Staleness
  är enbart hälsorad, aldrig auto-demotion.

## 1. CLAIM-mall (`bok/claims/W-<id>-<slug>.md`)

9-key-basen + exakt 5 claimnycklar (var och en med namngiven konsument) +
hållbarhetsklasstaggen:

```markdown
---
status: draft
authority: none
provenance: original
created: YYYY-MM-DD
last_reviewed: YYYY-MM-DD
canonical_sources: []
external_sources: []
supersedes: []
superseded_by: []
claim_id: W-000            # konsument: konflikt-/supersede-referenser
domain: plattform          # konsument: radar-routing. Enum (8, ägarbeslut #13):
                           # plattform | prestanda | tillganglighet | sakerhet |
                           # design | innehall | sok | drift-affar
                           # (direktivets 13 etiketter överlever som valfria taggar)
ladder: OBSERVED           # konsument: tillståndsmaskinen (stegen ovan)
scope: ""                  # OBLIGATORISK — anti-universaliseringsvakten.
                           # "okänt" är giltigt värde; frånvaro är det inte.
operative_home: ""         # konsument: radarns impact-analys (fil:rad i
                           # nortropic-system, eller "ingen" före ADOPTED)
hallbarhetsklass: 6        # konsument: GC + radar-staleness. T-2-klasser 1–7:
                           # 1 mänsklig kognition (decennier; replikationskoll vid intag)
                           # 2 researchmetoder (decennier)
                           # 3 designprinciper (3–5 år, modeböjda)
                           # 4 interaktionskonventioner (2–5 år; årlig)
                           # 5 populationstestade riktlinjer (1–3 år; årlig,
                           #   ankrad på Million-rapport + Web Almanac)
                           # 6 plattforms-/implementationsfakta (månader; kvartalsvis;
                           #   LAGRAS ALDRIG som statisk sanning — alltid
                           #   "faktum per DATUM + käll-URL + omverifiera vid bruk")
                           # 7 legalt/regulatoriskt (händelsedrivet)
---

<!-- Direktiv-II-termmappning (registrerad här, används aldrig som andra vokabulär):
     PROFESSIONAL_PRACTICE_CANDIDATE ≙ CORROBORATED
     EXPERIMENTAL                    ≙ LOCALLY_REPLICATED
     CURRENT                        ≙ ADOPTED -->

# W-000: <påståendet i en mening>

## Påstående
En mening. Giltighetsomfång upprepas i klartext.

## Belägg
Länkar med klausulankare (external_sources) + interna pekare (canonical_sources
`repo@SHA` + sökväg). Klass-6-fakta: "faktum per <DATUM>, <URL>, omverifiera
vid bruk".

## Stegehistorik
| Datum | Tillstånd | Utlösare (radar-delta / erfarenhet / experiment) |
|---|---|---|

## Öppna konflikter
Pekare till KONFLIKT-filer. ÖPPEN konflikt ⇒ ADOPTED spärrat.
```

**Demotionstriggers:** radar (källdelta träffar citerad källa) · erfarenhet
(produktion motsäger ADOPTED claim) · staleness (endast hälsorad).
**Medvetet strukna fält** (ingen konsument): confidence-poäng, prioritet,
embeddings, per-claim-kadens (härleds ur källvolatilitet), författarfält.

## 2. EXPERIMENT-mall (`nortropic-knowledge/research/experiment-<id>.md`)

Observatory-disciplin på **TESTKLIENT-fixturer, aldrig produktionskunder**.
Budget ≤1/månad, endast via radar-/retro-EXPERIMENT-routing — inget stående
forskningsprogram; vilande som default.

```markdown
---
(9-key-basen som ovan)
experiment_id: EXP-000
ladder_ref: W-000          # claimen/kandidaten som testas
---

# EXP-000: <hypotesen i en mening>

## Hypotes
Falsifierbar, en mening, med förväntat utfall.

## Protokoll
Fixtur (TESTKLIENT, FABRICERAD-märkt) · variabel (EN) · antal körningar ·
shufflad ordning · vem som INTE ser facit.

## Baslinje / Variant
Rubrikpoäng (rubrik-major/minor + pack-id/version stämplat — aldrig poolning
över mätregimer).

## Utfall
REJECT | WATCH | REPRODUCE | ADOPT_SCOPED | PRACTICE_CANDIDATE

## Giltighetsomfång
OBLIGATORISK vid ADOPT_SCOPED — bärs ORDAGRANT in i förslaget; breddning måste
argumenteras explicit.
```

**Lag:** budgetutmattning ≠ PASS (DO-NOT-BUILD #27). REJECT och HONEST NULL är
förstklassiga resultat.

## 3. KONFLIKT-mall (`bok/konflikter/KONFLIKT-<id>.md`)

```markdown
---
(9-key-basen som ovan)
konflikt_id: KONFLIKT-000
status_konflikt: OPEN      # OPEN | RESOLVED | WONT_RESOLVE
claims: [W-000]            # claims spärrade från ADOPTED medan OPEN
---

# KONFLIKT-000: <frågan som är omtvistad>

## Position A
Ordagrant citat + källa (locator + klausulankare + datum + källklass).

## Position B
Ordagrant citat + källa (samma krav).

## Frågetyp och tillämplig auktoritet
(regeln nedan, tillämpad på just denna fråga)

## Status
OPEN | RESOLVED (med beslutspekare) | WONT_RESOLVE ("vi vet inte ännu" —
legitimt terminalt tillstånd)
```

**Frågeberoende auktoritet (koherens-patch #7 — ordagrant regeltext):**

> Auktoritet beror på frågan som ställs — **NORMATIVA källor styr STANDARDER ·
> PLATTFORMS-/EMPIRISKA källor styr OBSERVERAD IMPLEMENTATIONSVERKLIGHET (ett
> spec-påstående förlorar mot uppmätt webbläsarbeteende på frågan "vad händer
> faktiskt") · LEGALA källor styr SKYLDIGHETER · PROFESSIONELL FORSKNING styr
> PRAKTIKEVIDENS · scopad Nortropic-produktionsevidens får UTMANA
> practice/craft inom sitt Giltighetsomfång, aldrig normativt/legalt.**
> INGEN falsk total ordning framtvingas — tvärklassoenigheter BEVARAS som
> konflikter. Brief §5/§7 utrankar fortfarande för ett givet projekt.

## 4. Seed-KONFLIKT-lista (från T-2:s register över omtvistad praktik)

Skapas i K2 — som KONFLIKT-poster, aldrig som regler:

| Id | Fråga | Positioner (kortform; skarpa filer citerar ordagrant) |
|---|---|---|
| KONFLIKT-001 | Inline- vs submit-validering i formulär | Wroblewski 2009-inline-studien (övergeneraliserad) vs GOV.UK validerar vid submit |
| KONFLIKT-002 | Above-the-fold- och karuselldoktrin | klassisk fold-/karusell-lära vs evidensen "mjukare än påstått" |
| KONFLIKT-003 | Personas | Cooper: kommunikationsverktyg vs svag utfallsevidens; personas-som-evidens är bannlyst oavsett utfall |
| KONFLIKT-004 | Beteendepsykologiska effektmagnituder | Cialdini-magnituder/Kahneman-priming (kapitlet i praktiken retraherat) vs replikationskrav på varje beteendepåstående |
| KONFLIKT-005 | Publicerade A/B-"vinster" | hypotesgeneratorer, aldrig riktlinjer (Kohavi: winner's curse, p-hacking; CRO-statistik aktivt kontaminerad — primärkälla + metodnot krävs) |
| KONFLIKT-006 | Binet & Field (60/40, ESOV) vs Sharp/Ehrenberg-Bass | effektivitetskanon vs selektionsbias-kritiken — båda kodas; share-of-search adopteras separat som det sällsynta varumärkesmått som skalar NER |

## Öppna frågor till ägaren

1. GOVERNANCE-ändring (register #14): claimprofilen adderar 5 claimnycklar +
   `hallbarhetsklass` = 6 frontmatterfält utöver basen, medan plan C säger
   "exakt 5 nya fält" plus klasstaggen. Bekräfta att hallbarhetsklass räknas
   som tagg (rekommenderat) eller vik in den som kommentar tills GOVERNANCE
   ändras.
2. Domäntaxonomi: 8 sammanslagna domäner (rekommenderat) vs direktivets 13
   (register #13) — mallen antar 8.
3. `status_konflikt`/`konflikt_id` som egna frontmatterfält kräver samma
   GOVERNANCE-ändring som #1 — eller ska KONFLIKT/EXPERIMENT bära sina fält i
   brödtext tills ändringen landat?
4. Ska seed-KONFLIKT-006 (Binet&Field vs Sharp) skapas redan i K2, eller vänta
   tills allokerings-/varumärkesfrågan har en konsument (Part 2f M–S)? Övriga
   fem har konsumenter i dagens byggkanon.
