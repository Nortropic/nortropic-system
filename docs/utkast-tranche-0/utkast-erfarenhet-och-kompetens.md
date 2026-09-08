> **UTKAST — TRANCHE 0 (2026-08-24). EJ PRODUKTION, EJ AUKTORITET.**
> Design-utkast enligt den DESIGN-FRUSNA masterplanen. Konsumeras av INGENTING
> före FOUNDATION_REPAIR_GATE; skarp version landar i sin riktiga hemvist i S1+.

# Utkast: erfarenhetslager + kompetensregister

Kandidater till S1-min/K4 enligt masterplan Part 2 I–M (+ Part 2d-fälten
`orsaksstatus`/`verklighetsklass`, + completeness-test-lucka #1). Skarpa
hemvister: STEWARD-REPORT-mallen (§Erfarenhet), kundrepo (LEARNING-RECORD.md),
`docs/kompetensregister.md`, stewardens stående regler (modellkandidatregeln).

## 1. §Erfarenhet — obligatorisk sektion i per-projekt-STEWARD-REPORT

**En sektion, inte ett telemetrisystem.** Ingen ny fil; write-policy orörd.
Aktiv från FÖRSTA kunden under nya systemet.

```markdown
## Erfarenhet

### Kontext
1–3 rader: kund, paket, kontraktversion, rubrik-major/minor.

### Strategibeslut
3–7 rader FRÅN AGENT-LOG — pekare/citat, aldrig omskrivna.

### Större fynd

### Kundkorrigeringar
Vad kunden rättade som vi trodde var sant. (verklighetsklass: ANVÄNDARE)

### Misslyckanden
Inkl. REVIEWER-BLIND-SPOT-rader: produktion motsade grön granskning ⇒
obligatorisk kandidat, en av: ny granskarlins (§A3 HÖGRISK) | nytt
eval-delkriterium (§A2 HÖGRISK MAJOR) | ny frusen fixtur (§A6, human-cut via
--cut-baseline). Delfråga (Part 2d): "varför missade vår syntetiska eval
detta?" — svaret routas till gym-case + domarkalibreringsankare.

### Post-launch-hypoteser
Falsifierbara, MED kontrolldatum. Utfall fylls i vid nästa retro eller lämnas
ODÖMBART — ingen analytics-återläsning byggs. ODÖMBART är aldrig grönt.

### Lärdomskandidater
(formatet i §2)
```

## 2. LÄRDOM-KANDIDAT-format

En kandidat = exakt:

1. **En mening.**
2. **Giltighetsomfång — OBLIGATORISKT; "okänt" är giltigt värde**, frånvaro är
   det inte (anti-universaliseringsvakten).
3. **Belägg** — pekare (EVAL-RESULT, grindhistorik, LEARNING-RECORD-rad,
   AGENT-LOG).
4. **Stege** — tillstånd i claimstegen (normalt OBSERVED vid födsel).
5. **Rubrik-kriterium** — vilket kriterium förslaget skulle påverka.

**Generalisering = befintlig retromaskin, oförändrad:** två-gånger-över-projekt
→ CORROBORATED → förslag som bär scope-raden ORDAGRANT (breddning argumenteras
explicit) → ägaren applicerar → ADOPTED.

## 3. LEARNING-RECORD.md — kontrakt (en fil per kundrepo, human-skriven)

Fyra sektioner. Fylls under den BEFINTLIGA månatliga GSC-retainerceremonin
(tio minuter, ingen dashboard).

```markdown
# LEARNING-RECORD — <kund>

## Hypotes
1–3 rader vid handover, härledd ur §7/framgangsmatt (= HANDOVER:s
Utfallshypotes-rad).

## Observation
Datumstämplade RÅA ANTAL + period + nämnare, i tre märkta hälsoaxlar:
### SYSTEM          (puls/uptime/CWV)
### ANVÄNDARUTFALL  (toppuppgiftsevidens, fynd)
### ORGANISATIONSUTFALL (framgangsmatt-antal: leads, bokningar, kundrapport)

## Fynd
Taggade ANEKDOT som default. Varje fynd bär:
- orsaksstatus: OBSERVERAD_ASSOCIATION | STÖDD (upprepad/med baslinje) | TESTAD (experiment)
- verklighetsklass: SYNTETISK | PRODUKTION | ANVÄNDARE | DOMÄNEXPERT

## Generaliserbarhet
"sannolikt bara denna kund" | "kandidat-mönster — jämför nästa kund"
```

**Lagar:**

- **Antal, aldrig procent, under 500 sessioner/period.** ("Noll leads på 60
  dagar" är ett äkta fynd; procentsatser vid dussintals besök är fiktion.)
- **Promotioner som citerar utfall kräver orsaksstatus ≥STÖDD.** A/B-test
  förblir uttryckligen icke-rekommenderat vid SMB-trafik (Kohavi-verdiktet).
- **PLACERINGSLAG: retro-input ENBART** — aldrig maskinparsad, aldrig
  grindinput, **aldrig promotionsevidens** (anti-Goodhart genom placering; i
  samma ögonblick post-launch-signaler rör promotion får de Goodhart-tryck).
- En ANEKDOT lyfter först när en andra kund visar samma riktning, och
  förslaget måste ändå namnge sitt rubrik-kriterium.
- Icke-byggen (explicit): ingen ingestionspipeline, inget metricslager, inga
  dashboards, ingen veckokadens.

## 4. Kompetensregister — tabellform (`docs/kompetensregister.md`)

**Kompetens = konfiguration × yta.** Tre radtyper, samma fil, samma
statusvokabulär som Part 1:s kapacitetsstatusar
(DECLARED · BUILT · VALIDATING · PROVEN · ROUTE-OUT):

| Radtyp | Nyckel | Exempel |
|---|---|---|
| Roll-kompetens | roll-config × pack/kapacitet | `project-planner@anthropic/fable × lokal-se` |
| Arbetar-kompetens | worker-config × kapacitet | `content-designer@anthropic/fable × copykvalitet` |
| Domar-kompetens | judge-config × dimension | `domare@openai-codex × röstregister` |

**Evidenskolumner = ENBART pekare** — EVAL-RESULT-historik, grindhistorik,
fixtur-/holdout-täckning, GYM-RAPPORT-rader. Aldrig inbäddade siffror, aldrig
LEARNING-RECORD-rader (placeringslagen).

**Ärlighetslag:** vid n≈1 läser de flesta celler **"1 datapunkt — ODÖMBART"** —
och det är det korrekta innehållet. GD4-taket gäller: syntetisk evidens bär en
rad som högst till VALIDATING; PROVEN citerar endast riktiga kunder
(Sonnet-trappans tröskel: ≥2 konsekutiva riktiga kunder, eval ≥90 samma
rubrik-MAJOR, noll post-launch-grindmissar, suite grön; demotionspegel vid
första miss).

Domarstatus per dimension: BUILT → VALIDATING (klarad kalibrering) → PROVEN
(≥2 sessioner utan överkörning); demotion vid kalibreringsfall eller
överkörd-av-deterministisk-evidens. Spåras PER RIKTNING (reciprociteten är
asymmetrisk — enriktad granskning är ett legitimt utfall).

## 5. Modellkandidatregeln — stående regeltext (kandidat till K4)

> **Modellkandidatregeln.** VARJE ändring i modelluppställningen — uppgradering
> som nedgradering — är ett förslag som visar:
> (i) kandidat mot frusna verify-suite-fixturer;
> (ii) kandidat mot held-out-fall (`nortropic-holdout`, ägarceremoni — aldrig
> klonad under byggen, aldrig i agentläsbara sökvägar);
> (iii) rollbackklausul (Sonnet-trappans ordagrant);
> (iv) kostnadsdelta från usage-loggen.
> MODELLKONTRAKT ändras EN rad i taget — aldrig global hype-ersättning.
> **Ny modell ≠ automatiskt senior.**
>
> **Versionsbump-tillägget (completeness-test-lucka #1):** vid varje
> modellversionsbump körs kalibreringsankarna om — inte bara för domare utan
> för ALLA worker-configs vars rad citerar kalibrerad evidens. "Fortfarande
> kompetent" är ett påstående som omprövas mekaniskt, aldrig antas.

Kapacitetsevals ≠ regressionsgrindar: grindarna beror endast på
nortropic-system-fixturer; holdouten är kompetensevidens, aldrig grindinput.

## Öppna frågor till ägaren

1. `nortropic-holdout`-repots skapandeceremoni (register #16/#20): vid
   GYM-EXP-1 (rekommenderat) eller separat — modellkandidatregelns led (ii) är
   ODÖMBART tills repot finns; det ska stå så i registret, inte låtsas grönt.
2. ERFARENHET.md som separat kundrepofil (register #17): senarelagd tills
   §Erfarenhet växer ur rapporten — bekräfta att utkastet INTE ska definiera
   filen nu (kräver steward-write-policy-ändring).
3. Kundkorrigeringar default-klassas ANVÄNDARE här — men en korrigering av ett
   sakfaktum är snarare DOMÄNEXPERT (kund-SME är auktoritet på FAKTA, aldrig
   på UX). Ska mallen tvinga klassval per rad i stället för default?
4. Ska domar-kompetensraderna bära riktningskolumn (A→B/B→A) redan i v1-mallen,
   eller läggs den till först när GYM-EXP-1:s riktningsdata finns?
