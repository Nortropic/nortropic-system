# Översikt — nodkartan, stoppen och artefaktkedjan

Senast verifierad mot systemet: 2026-07-31 · v17 (denna commit)
Verifieringsomfång: delta-verifierad mot systemändringarna sedan 2026-07-30 (BATCH-001–004BE: check-invariants.mjs INV-001–005, verify-suite doctor 1–13 + OGILTIG-status, design-reviewer Bash→BLOCKED, NRT-007-blocket i agenterna, docs/100-dagar); 0 påståenden i denna fil ogiltigförklarade. Basstämpeln 2026-07-30 sattes av [AUTO-N1] 64acf9f och är inte oberoende granskad.

> **Ny här?** Läs [00-borja-har.md](00-borja-har.md) först — hela systemet förklarat från noll utan interna termer. Den här filen och 02–07 är det djupare, tekniska lagret.

Pipelinen är tolv noder. Kommandona är de tre pipeline-skillsen (som bara människan får trigga), de två workflowsen och ett plattformskommando; tre noder är rent mänskliga stopp. Modell och effort kommer ur respektive agents frontmatter — samma värden som MODELLKONTRAKTET i stewardens SYSTEM MAP och doctor #8 vaktar.

## Nodkartan

| Nod | Steg | Kommando | Utförare (modell · effort) | Artefakt |
|---|---|---|---|---|
| 1 | Research | inget — operatören skriver filen | människa | `research.md` (5 obligatoriska fält) |
| 2 | Plan | `/nortropic-plan <research.md>` | project-planner (fable · max) | `PROJECT-BRIEF.md` (7 sektioner + öppna frågor) |
| 3 | Briefgodkännande | **HÅRT STOPP** | människa | godkänd brief, besvarade frågor |
| 4 | Init | `/nortropic-init <PROJECT-BRIEF.md>` | stack-builder (opus · max) | GitHub-repo + Vercel-preview |
| 5 | Innehåll | inget eget kommando — huvudsessionen kör agenten | content-designer (opus · max) | copy, bilder (anskaffningen skriver `BILDRAPPORT.json`), varumärkeslagret (app/-ikonerna + `public/brand/` via brand.mjs), `TODO-COPY` fylld, Humanisera-passet, klientfyllda `fotouppdrag-klient.md` (vid `saknas` på ersättningsprio 1–2) |
| 6 | Review | `/nortropic-review` (kadens full → `--diff` → full) | workflow: design-reviewer (opus · max) + seo-optimizer (opus · high) + kodlins, 2 skeptiker per fynd | `REVIEW-REPORT.md` med commit-meta |
| 7 | Launch | `/nortropic-launch` | workflow: 7 linser över qa-launcher (opus · high), seo-optimizer (opus · high), design-reviewer (opus · max); fixar via stack-builder/seo-optimizer | verdikt, `EVAL-RESULT.md`, `HANDOVER.md`, `gbp-checklist-klient.md`, `gsc-steg-klient.md` |
| 8 | Juridik | **HÅRT STOPP** | människa | sign-off på Gate 6-fynden |
| 9 | Deploy | `/vercel:deploy` | människa/huvudsession | produktionssajt |
| 10 | Efterarbete | `/nortropic-cutover` (fas 1–3: förkontroll → noindex → GSC; fas 4–7 — Bing/IndexNow, uppetid, GBP, citations — fortsatt manuella ur checklistorna) | människa (+ klient) | GBP live, GSC verifierad, citations |
| 11 | Retro | `/nortropic-retro <projektmapp \| system>` | nortropic-steward (fable · max) | `STEWARD-REPORT.md` + förslag i `~/.nortropic/factory/steward-proposals/` |
| 12 | Godkänn förslag | **HÅRT STOPP** — "applicera förslag N" | människa → huvudsession | systemcommits i nortropic-system |

Källor: `skills/nortropic-plan/SKILL.md`, `skills/nortropic-init/SKILL.md`, `workflows/nortropic-review.js`, `workflows/nortropic-launch.js`, `skills/nortropic-retro/SKILL.md` samt agenternas frontmatter i `agents/`.

## Lägesväxeln — obemannat (v16)

Research-filens valfria rad `Läge: obemannat` byter körsätt. I `obemannat` orkestrerar `/nortropic-autobygg` noderna **2→7** utan att stanna vid nod 3, så länge briefen är ren — inga ohanterade/scope-nej juridikflaggor i §7 och inga STRATEGISKA öppna frågor. **Nod 8 (juridik) och nod 9 (deploy) är fortfarande hårda mänskliga stopp** — obemannat rör dem aldrig, och deployar aldrig. Faller något av de tre villkoren ut (bemannat/ohanterad-juridik-eller-STRATEGISK/CRITICAL-efter-en-fixloop) lämnas bygget över med `FINAL-TOUCHES.md` som punch-list. Utelämnad `Läge:`-rad = `bemannat` = nodkartan ovan oförändrad. Detaljer i [00-guide.md](00-guide.md) (Obemannat läge).

## De tre hårda stoppen

Två ligger i pipelinen, ett i systemunderhållet. De är systemets **beslutsgrindar** — noderna där ett mänskligt OMDÖME måste fällas: godkänna briefen (3), signera juridiken (8), godkänna förslagen (12). Avgörande är beslutet, inte bara den mänskliga handen: rent utförande av ett redan fattat beslut är inget stopp (deploy, nod 9, är alltid mänsklig men verkställer bara nod 8:s signoff), och ren mänsklig inmatning utan godkännande-moment är det inte heller (research, nod 1). Allt annat får automatiseras.

**Nod 3 — briefgodkännandet.** `/nortropic-plan` slutar alltid med en exekutiv summering och en lista öppna frågor, och nästa steg körs först "once the brief is approved" (`skills/nortropic-plan/SKILL.md`, steg 4). Briefen är auktoritetsordningens topp; det som godkänns här styr bygge, copy och granskning.

**Nod 8 — juridiken.** Gate 6-fynd auto-fixas aldrig: prelaunch-skillen är "REPORT ONLY, human decides" (`skills/nortropic-prelaunch/SKILL.md`, Gate 6), qa-launcher får aldrig sätta PASS på juridik på egen auktoritet (`agents/qa-launcher.md`), och launch-workflowen filtrerar mekaniskt bort kategorin `legal` ur fixloopen och rapporterar alltid `⚠️ HUMAN REVIEW`/`HUMAN SIGN-OFF` (`workflows/nortropic-launch.js`).

**Nod 12 — förslagsgodkännandet.** Stewarden har en hård skrivpolicy med en grundregel och en villkorad utvidgning (v15): grundregeln är propose-only — eget minne, `~/.nortropic/factory/steward-proposals/` och STEWARD-REPORT.md, aldrig workflows/, skill-regeltext, eval-rubriken eller settings; utvidgningen gäller ENDAST trappmoderna (vaktmastare/nattskift), endast deras uttömmande vitlistor/zoner, och endast när `AUTOPILOT` tillåter nivån ([07-konstitution.md](07-konstitution.md) §B). Du läser förslagen och säger vilka som ska appliceras; huvudsessionen applicerar och committar. Trappans självapplicerade ändringar granskar du i efterhand via `~/.nortropic/factory/AUTO-DIGEST.md` och ackar med en `CHECKPOINT`-rad i beslutsloggen — max 3 N2-ändringar mellan ackningar.

**Bibliotekariens engångsgodkännanden.** Retrons bibliotekarie-steg inventerar installerade skills och MCP:er mot refererade och lämnar placerings- eller strykningsförslag (`agents/nortropic-steward.md`, Obligatoriska retrosteg 1). Besluten godkänns av användaren i session — som när `threejs-build` togs bort efter engångsinventeringen ("anvandaren godkande i session", commit `b68252e`).

## Artefaktkedjan

Allt börjar med `research.md` — kundens faktakälla och det enda dokument som faktapåståenden får spåras till. `/nortropic-plan` förädlar den till `PROJECT-BRIEF.md`, som efter godkännande blir auktoritet för allt nedströms — tillsammans med `SLOTS.json` bredvid briefen: §5-slot-tabellens maskinläsbara spegel (bildspår, bildbehandling, en rad per bildplats), som bildanskaffningen och behandlingssteget läser. `/nortropic-init` materialiserar briefen som ett GitHub-repo med Vercel-preview.

Granskningarna producerar `REVIEW-REPORT.md`, vars meta-block (commit, datum, scope, mode) är det freshness-grinden i launch läser; kalibreringskörningar skriver i stället `REVIEW-REPORT-CALIBRATION.md` och rör aldrig metan (`workflows/nortropic-review.js`). Launchen producerar fyra saker: `EVAL-RESULT.md` (poängkortet — informativt, aldrig blockerande; grindarna blockerar, evalen mäter), den svenska kundöverlämningen `HANDOVER.md`, samt de klientfyllda `gbp-checklist-klient.md` och `gsc-steg-klient.md` (`workflows/nortropic-launch.js`).

Retron sluter cirkeln: `STEWARD-REPORT.md` med förslag i `~/.nortropic/factory/steward-proposals/<datum>/`, där varje applicerat förslag blir en commit i det här repot. EVAL-RESULT-filerna är kedjans minne — retron jämför varje ny klients kriteriepoäng mot tidigare klienter på samma rubrikversion (`agents/nortropic-steward.md`, MODE: retro).

Parallellt med output-kedjan skriver de fyra byggande agenterna en **arbetslogg** i `AGENT-LOG.md` i kund-repots rot, och granskarna en mager `## Arbetslogg (varför)` sist i sin egen rapport (Z1, 2026-07-25). Det är inte en åttonde statusrapport utan residun output inte kan bära — beslut, källa→beslut, friktion, var-förfina — filtrerad vid källan (anti-brus: kan raden härledas ur agentens output är den brus och utesluts). Den matar fabriks-dashboardens agent-inblick, inte pipelinen; formatet + fälten bor i `skills/nortropic-stack/references/arbetslogg.md`.
