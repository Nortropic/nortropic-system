# Kompetensregister — vad systemet kan belägga

Senast verifierad mot systemet: 2026-08-25 · v1 (denna commit)
Verifieringsomfång: nyskapad i S1-min+K4-batchen; inga tidigare påståenden att verifiera.

Registret svarar på EN fråga: **vad kan vi belägga att systemet är kompetent på — och
med vilken evidens?** Det är VANLIG DOKUMENTATION; ingen mekanisk grind läser det och
det är inte §A-skyddat. [Kursplanen](kursplan.md) säger vad som LADDAS; registret säger
vad som är BELAGT.

**Kompetens = rollkonfiguration × kapacitet/paket.** ROLL är rollens/agentens kontrakt;
KOMPETENS är de paket-, kunskaps- och instrumentmoduler som laddas för jobbet. Statusen
använder samma vokabulär som statustabellen i [06-scope.md](06-scope.md):
**DECLARED · BUILT · VALIDATING · PROVEN · ROUTE-OUT**.

## Lagarna som håller registret ärligt

**1. Vid litet n är ODÖMBART det korrekta innehållet.** De flesta celler läser
**"1 datapunkt — ODÖMBART"**, och det är inte en lucka som ska fyllas. Ett register som
ser välfyllt ut vid n≈1 ljuger.

**2. Evidenskolumnen bär ENBART PEKARE** till redan auktoritativa artefakter —
EVAL-RESULT-historik, grindhistorik, fixturtäckning. Aldrig inbäddade siffror (de blir
stale i tysthet).

**3. LEARNING-RECORD är ALDRIG kapacitetspromotions-evidens** (placeringslagen,
`skills/nortropic-retro/references/learning-record.md`). Post-launch-signaler som får
röra promotion hamnar under Goodhart-tryck och slutar mäta verkligheten.

**4. Syntetisk evidens ger ALDRIG PROVEN.** Fixturer, evals och torrkörningar bär en rad
högst till VALIDATING. Promotion till PROVEN kräver riktig kundevidens och den
befintliga förtroendemaskinen. **Simulering ger skala, verkligheten ger sanning.**

**5. Registret ger ingen behörighet.** En PROVEN-rad höjer ingen modell, öppnar ingen
grind och ger ingen agent nya rättigheter automatiskt. Modelluppställningen ändras endast
via modellkandidatregeln (stående regel 5), en rad i taget.

## Registret

| Rollkonfiguration × kapacitet/paket | Status | Evidens (endast pekare) |
|---|---|---|
| `project-planner@anthropic/fable × lokal-se` | VALIDATING | 1 datapunkt — ODÖMBART (ingen ackumulerad EVAL-RESULT-serie på samma rubrikversion) |
| `content-designer@anthropic/opus × lokal-se` | VALIDATING | 1 datapunkt — ODÖMBART (eval-kriterium 3 saknar jämförbar serie ≥2 kunder) |
| `design-reviewer@anthropic/opus × lokal-se` | VALIDATING | 1 datapunkt — ODÖMBART (granskningshistoriken saknar ackumulerad serie) |
| `qa-launcher@anthropic/opus × lokal-se` | VALIDATING | 1 datapunkt — ODÖMBART (grindhistoriken saknar post-launch-serie) |

Raderna står medvetet på VALIDATING och inte högre: paketet `lokal-se` är byggt och kört,
men den evidens som krävs för PROVEN — riktiga kunder — finns inte ännu. Att en historisk
sajt en gång existerat gör inte paketet universellt bevisat.

## Kända odömbara led

| Led | Varför ODÖMBART | Vad som löser det |
|---|---|---|
| Modellkandidatregelns led 2 — held-out-fall | Held-out-repot finns inte; skapandet är en ägarceremoni | Repot skapas; tills dess redovisas ledet ODÖMBART i varje modellförslag — aldrig grönt |
| Samtliga rader ovan | n≈1 — ingen ackumulerad evidensserie existerar | De första riktiga kunderna |
