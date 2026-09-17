> **UTKAST — TRANCHE 0 (2026-08-24). EJ PRODUKTION, EJ AUKTORITET.**
> Design-utkast enligt den DESIGN-FRUSNA masterplanen. Konsumeras av INGENTING
> före FOUNDATION_REPAIR_GATE; skarp version landar i sin riktiga hemvist i S1+.

# Utkast: gym-kontrakt v1 (`docs/gym/gym-kontrakt.md`)

Kandidat till gym-v1-batchen (H-3) enligt masterplan Part 2b. Skarp version blir
den enda §A9-refererade filen: promotionpolicy, evidenshierarki, domarregler,
blindprotokoll, bankisolering + integritetslagar.

## 1. Namn och mappning

**Gymmet** är arbetsnamnet (ägarbeslut #18 utestående) för det lager corpus-RFC:n
kallar **Gauntlet (CF-3, kvalitetsloopen inuti trustloopen)** och
**Experiment Engine (CF-4)**. Direktiv III:s namn mappas: Web Gym ≙ Gymmet ·
Practice Bank ≙ övningsbanken · Benchmark Bank ≙ benchmarkbanken ·
Synthetic Company Generator ≙ fixturgeneratorn. CF-3:s lag gäller ordagrant:
**Nortropic blir inte en Gauntlet-loop — det INNEHÅLLER en.** Självförbättring =
själv-FÖRSLAG av starkare mätningar; auktoriteten fryser dem.

## 2. Styrande beslut (GD1–GD6)

- **GD1 — Ingen parallell trustmaskin.** Varje promotion är ett vanligt
  steward-förslag / ägar-HÖGRISK som redigerar de BEFINTLIGA registren. Gymmet
  producerar evidensfiler, aldrig verdikt med auktoritet
  (`MODEL_OUTPUT_IS_TRUST_AUTHORITY=NO` — domarutdata inkluderad).
- **GD2 — Målstolparna är §A; gymmet adderar exakt EN ny §A-post** (§A9, §5
  nedan). Muterbart: arbetarprompter, kursplansval, exempel, modellval,
  routingrader, utmanarkonfigar, övningsbanken. Fruset: rubriken (§A2),
  grindsemantik (§A3), suite+baselines+gym-benchmark+ankare (§A6 via placering),
  holdout-definitioner/-svar (repo-nivå-kuvert), domarauktoritet/domarregler/
  blindprotokoll/promotionpolicy (§A9), säkerhets-/a11y-kravnivåer.
- **GD3 — Placering ärver skydd.** Benchmarkbank + kalibreringsankare ligger
  under `tests/fixtures/gym/` (redan §A6, human-cut via `--cut-baseline`).
- **GD4 — Syntetiskt tak.** Syntetisk evidens bär en kompetens/worker-config
  som högst till VALIDATING; PROVEN kräver alltid riktiga kunder på
  Sonnet-trappans tröskel. Dödar benchmark-Goodhart och syntetisk orealism i en
  mening.
- **GD5 — Deterministiskt först, domare sist.** Ett krav graderat på nivå N får
  aldrig omgraderas lägre för att göra rött grönt.
- **GD6 — OpenAI-åtkomst = den pinnade Codex-verktygskedjan** (SHA-pinnad
  identitet, strukturerad output, evidenskontrakt) — inga hypotetiska API:er,
  inga leverantörshostade evalplattformar.

## 3. Målstolpar: muterbart vs fruset

| Yta | Status | Hem/skydd |
|---|---|---|
| Arbetarprompter, exempel, kursplansval | MUTERBART | gym-session / steward-förslag |
| Modellval, routingrader | MUTERBART (via ceremoni) | MODELLKONTRAKT, en rad i taget |
| Utmanarkonfigar (`gym/utmanare/`) | MUTERBART | gym-only, aldrig produktion |
| Övningsbanken (`gym/bank/ovning/`) | MUTERBART | optimizer-synlig per design |
| Rubriken | FRUSET | §A2 |
| Grindsemantik | FRUSET | §A3 |
| Suite, baselines, gym-benchmark, ankare | FRUSET | §A6 (via placering, GD3) |
| Holdout-definitioner + facit | FRUSET | `nortropic-holdout`, kuvert på repo-nivå |
| Domarauktoritet, domarregler, blindprotokoll, promotionpolicy | FRUSET | **§A9** |
| Säkerhets-/a11y-kravnivåer | FRUSET | befintliga §A-hem |

**Föreslagen §A9-radtext (en rad, HÖGRISK, human):**
> **§A9 Gymmets måttstockar** — `docs/gym/gym-kontrakt.md` (promotionpolicy,
> evidenshierarki, domarregler, blindprotokoll, bankisolering + integritetslagar)
> samt holdout-åtkomstregeln. Doctor #5-greppet utökas till sökvägen.

**Lagen bakom allt: studenten kan ALDRIG flytta målstolparna.** (Mönstret finns
redan: h-008-kuvertet utelämnar exit_test; §A skyddar rubrik/grindar;
fixtures är human-cut. Gymmet ärver, uppfinner inte.)

## 4. Evidenshierarki (enad med Part 1:s exekveringsklasser)

| Nivå | Gym-term | Part 1-exekveringsklass | Villkor |
|---|---|---|---|
| 1 (högst) | DETERMINISTIC | MECHANICAL | grep/parse/diff mot facit |
| 2 | BROWSER-OUTCOME | BROWSER-SYNTHETIC | uppmätt renderad verklighet |
| 3 | PROTECTED-SYNTHETIC-USER | — | facit undanhållet producenten |
| 4 | CALIBRATED-JUDGE | INDEPENDENT-AI | registerstatus ≥VALIDATING för just den dimensionen |
| 5 (lägst) | UNCALIBRATED-OPINION | — | tillåten ENBART som hypotes |

**Människan står över alla nivåer för promotioner.** GD5 binder tabellen: aldrig
nedåtgradering för att vända rött till grönt. Cross-family-domare krävs endast
för dimensioner som är subjektiva OCH promotionrelevanta; bredden avgörs av
uppmätt familjepreferens, inte doktrin.

## 5. Blindprotokoll (sammanfattning; skarp fil `blind-protokoll.md` + `gym/verktyg/anonymisera.js`)

1. Strippa frontmatter/metadata.
2. Normalisera formatering.
3. **Grep-and-ABORT** på leverantörsidentifierande strängar — fail-closed,
   aldrig tyst redigering.
4. Ometikettera KANDIDAT-A/B via protokollfört myntkast.
5. `mapping.json` hålls i kuvert undanhållet domarna (h-008-mönstret); läses
   först vid aggregering.

**Ärlighetsklausul:** stilfingeravtryck gör blindningen imperfekt. Därför paras
den med dekomponerad rubrik-förankring + den uppmätta
familjepreferens-statistiken — **vi mäter läckan, vi låtsas inte att den är tät.**

## 6. Reciprok dömning + domarens outputschema

Reciprok matris, DO-NOT-BUILD-#6-kompatibel: båda familjerna producerar på samma
fixtur; båda dömer båda artefakterna — **inklusive egen familj, avsiktligt, för
att mäta självpreferens** (ägarbeslut #21, rekommenderat ja). **EN runda**,
ordningsrandomiserad, rubrik-förankrad, dekomponerad per dimension. Reciprok
dömning av artefakter är inte debatt. Poängsättning är pointwise mot ankare
(pairwise flippar ~35 % under distraktormanipulation och är mer
generator-gambar); pairwise+swap endast för rankningar; formatoavvikelse =
röd flagga.

**Domarens outputschema (CF-3: "evaluator contracts without verdicts"):**

```
DOMSLUT-rad: dimension-id · 0–4 mot ankare · ordagrant beviscitat · osäkerhet
```

**FÖRBJUDET i domarutdata:** totalpoäng · vinnare · rekommendationer ·
leverantörsgissningar. Aggregering är mekanisk och sker på ägarsidan.

## 7. Oenighet: JUDGE_DISAGREEMENT + eskalationstrappa

Oenighet är evidens, aldrig medelvärde. JUDGE_DISAGREEMENT-filer har
KONFLIKT-form (båda positionerna ordagrant, med beviscitat). Eskalationstrappa,
i ordning:

1. Rubrikinspektion (är ankaret tvetydigt?)
2. Tredje domare — endast den dimensionen
3. Deterministisk evidens
4. Synthetic-user-eval
5. Humant kalibreringsstickprov
6. **WONT_RESOLVE** ("inherent subjektiv") — dimensionen exkluderas ur
   promotionmatematiken och loggas som rubrikkvalitetsfynd.

## 8. Bankisolering

| Bank | Plats | Synlighet | Lagar |
|---|---|---|---|
| Övning | `gym/bank/ovning/` | fullt optimizer-synlig | muterbar; sessionens arbetsyta |
| Benchmark | `tests/fixtures/gym/` | §A6 via placering | **per-svar-felanalys i arbetarvända artefakter FÖRBJUDEN** — endast aggregerade deltan |
| Holdout | `nortropic-holdout` (separat privat repo) | aldrig i agentläsbara sökvägar | klonas transient av ÄGAREN vid explicita ceremonier; läcka ⇒ regenerera, aldrig återanvänd |

Fixturgeneratorn: recept (inte agent); outputkontrakt = research-kontrakt v3
EXAKT + TESTKLIENT-huvudblock + **facit i separat kuvert-undanhållen fil**.
Kontaminationsförsvar: genererade+muterade case, aldrig riktiga organisationer,
aldrig publika benchmarks. Max två producenter per fixtur (inga svärmar).

## 9. Promotionpolicy

Promotion till produktion kräver (rollviktat), genom den NORMALA vägen:

1. Benchmarkförbättring (aggregat).
2. **Holdout-generalisering — benchmark-upp + holdout-platt = OVERFIT-verdikt,
   INTE promotion.**
3. Per-dimension no-regression-golv.
4. Oberoende cross-model-granskning av jämförelseevidensen.
5. Mekanisk efterlevnad (doctor grön, suite icke-degraderande).
6. ≥3 shufflade stabila trials.
7. Acceptabel kostnad/latens (usage-logg-rader — inga kostnadspåståenden utan
   loggrader).

Demotionspegel = Sonnet-trappans rollbackklausul ordagrant. En ≥90 %-svepning
på dömda dimensioner för en leverantör utlöser obligatorisk cross-family-
inspektion av rubrik och bank FÖRE någon promotion (misstänkt resultat, inte
seger).

## 10. Integritets-/saneringslag

**Kundrepos blir aldrig fixtures; mönster blir det.** Pipeline:
STEWARD-REPORT Misslyckanden/BLIND-SPOT-rader → identitetsstrippat generellt
mönster `gym/bank/monster/M-<id>.md` → **mekanisk integritets-grep före commit
(kund-slug, orgnr, telefonmönster, domän — träff = FAIL)** → generatorn
producerar N fiktiva varianter i ANDRA vertikaler (testar konceptet, inte
minnet) → övningsbanken. Felkluster grupperas **per underliggande koncept,
aldrig per antal** (manuellt i v1; klustringskod NOT-YET).

## 11. GYM_AUTONOMY (trappa i tre steg) + sessionskommando

**Sessionskommandots gränser (ägarsatta):** `fokus` · `case-tak` (≤10 i v1) ·
`token-tak` · `utmanare`. Överskridet tak = ABORTERAD, aldrig PASS
(DO-NOT-BUILD #27). **Sessionens allowed_write = `gym/**` + steward-förslag,
INGET annat** — mekaniskt oförmögen att röra §A, graders eller
produktionsagenter.

| Steg | Trigger | Innehåll |
|---|---|---|
| 1 (v1) | ägartriggad | varje promotion human-gated |
| 2 (v2) | ≥3 rena steg-1-sessioner + eget delegationsdok (remaining-bootstrap-anatomin) | auto-promotion ENDAST av lågriskytor (rollprosa-formuleringar, kursplansval — aldrig modellbyten, aldrig domar-/granskarkonfigar); §B ordagrant (digestrader, checkpoint-tak 3, regressionslag med auto-revert + AUTO-INCIDENT, §B8-frågan: "förbättrades gymsiffrorna medan sajterna inte gjorde det?") |
| 3 (FUTURE) | ≥6 rena steg-2-sessioner + ägarbeslut | — |

**Flaggor (gäller alla steg):** `GYM_TOUCHES_SECTION_A=NEVER` ·
`GYM_SEES_HOLDOUT_ANSWERS=NEVER` · `GYM_MODIFIES_GRADERS=NEVER` ·
`SELF_CERTIFICATION_AS_PROOF=NO`.

**GYM-RAPPORT (exception-first, ägarläsning ≤10 min):** Fokus · Fall körda ·
Utmanare · Utfall · Holdout-delta · Regressioner · Kostnad · Svaghetskluster ·
Nästa fokus · "Inget kräver ägarens uppmärksamhet" när sant.

**Antisimuleringskontroller (§B8-närliggande retrofrågeset):** holdout↑ medan
produktionsutfall platta · domare eniga men användare/kunder oeniga ·
formelmässiga syntetiska företag · stildrift mot graderpreferens ·
kundkorrigeringsfrekvens som inte faller · incidenter orepresenterade i gymmet ·
modellgenererade personas som ersätter faktisk research (bannlyst).

## 12. GYM-EXP-1 — REVIDERAD trearmsdesign (v1-payloaden)

Ersätter tvåarmsskissen, per evidensannexets fynd (Self-MoA/resample-kontrollen;
9 domare ≈ 2 effektiva röster; asymmetrisk reciprocitet n=116; brusgolv 6pp/3pp).

**Armar (parade, inom-case):**

- **A** — incumbent + same-family-granskare (självgransknings-baslinje).
- **B** — incumbent + ANDRA OBEROENDE same-family-granskare
  (**resample-kontrollen — armen som dödar eller räddar cross-model**).
- **C** — incumbent + cross-family-granskare/falsifierare (reciprok riktning
  loggas separat).

**Case:** generatorfixturer byggda som MUTATIONER av riktiga artefakter med
**3–5 seedade verifierbara defekter per case** (facit i kuvert); start 8–12 case
× 3 trials/arm med sekventiella titt-punkter (O'Brien-Fleming-mönstret);
utbyggbart mot 50-case/200-defekt-designen vid tvetydig tidig signal.

**Mätetal:** per-granskare äkta-defekt-recall + falsklarmfrekvens mot seedat
facit · **C:s unika-äkta-defekt-utbyte över B (huvudmått)** · Claude–GPT-
felkorrelation vs Claude–Claude-resample-korrelation (CAPA — rå agreement utan
chanskorrektion överskattar 33–41pp) · swap-konsistens + test-retest per domare
(konsistens ≠ validitet) · holdout-slutkvalitet · kostnad per unik defekt.

**Human kalibrering:** ≥30 adjudicerade omtvistade/oseedade fynd (seedade
defekter bär den objektiva lasten); ägaren om-adjudicerar 20 efter en vecka
(egen konsistensskattning); plug-in sensitivitets-/specificitetskorrektion.

**Förregistrerade utfall (studenten kan inte flytta dessa heller):**

- **SIGNAL** = utmanaren bättre på ≥1 deterministiskt aggregat ELLER ≥2 dömda
  dimensioner (båda-familjer- eller human-bekräftat) OCH riktningen håller på
  båda holdouts OCH kostnaden acceptabel → full kandidat-ceremoni, endast
  strategist-rollen.
- **HONEST NULL (förstklassig framgång)** = ingen materiell
  holdout-generaliserande skillnad. Förregistrerad null-tröskel:
  **C:s unika utbyte över B <10 % relativt OCH holdout-lyft <3pp OCH
  cross-family-korrelationen inte meningsfullt lägre än resample-korrelationen**
  → "andra familjen kostar utan produktionssignal; cross-model reserveras för
  §A-granskning som idag"; gymkontrakten består (vilande kostar inget);
  omtest-trigger = nästa stora modellgeneration.
- **JUDGE-FAIL** = ankarkalibrering fallerar eller familjepreferens överskrider
  förregistrerad gräns → INGA workforce-slutsatser; dömningen blir nästa fokus.
- **Kill-signal:** reciprok riktning SÄNKER pass-raten ⇒ släpp reciprociteten,
  behåll enriktad granskning (per-riktning-spårning är lag).

**Budget:** ägare ≤4h; token-tak i kommandot; överskridet = ABORTERAD, aldrig
PASS. Holdout-repot skapas i denna ceremoni (2 case; ägarbeslut #20).

## Öppna frågor till ägaren

1. Kanoniskt namn: "Gymmet" med mappningsstycke (rekommenderat) eller
   "Gauntlet" (register #18).
2. Exakt §A9-formulering och omfång (register #19) — utkastets radtext i §3 är
   förslaget.
3. Skapa `nortropic-holdout` under GYM-EXP-1 (rekommenderat, 2 case, en
   ceremoni) eller senarelägg (register #16/#20).
4. Egen-familj-självdömning ingår i blindprotokollet (rekommenderat ja,
   register #21).
5. Gym-sessionen delar ≤1-experiment/månad-budgetplatsen (rekommenderat ja,
   register #22).
6. GYM-EXP-1-utmanarroll = strategist (rekommenderat per direktiv §32) vs
   content-designer först (register #23).
7. Den förregistrerade gränsen för familjepreferens i JUDGE-FAIL saknar
   siffervärde i planen — ägaren måste sätta den FÖRE körning (förslag:
   |preferens| >0,5 ankarsteg mot egen familj på ≥2 dimensioner).
