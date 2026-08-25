# Scope — ringmodellen

Senast verifierad mot systemet: 2026-08-25 · v17 (denna commit)
Verifieringsomfång: delta-verifierad mot systemändringarna sedan 2026-07-30 (BATCH-001–004BE) samt mot S1-min+K4-batchen 2026-08-25 (statustabell respektive Paket-arkitekturen); hela filen läst i denna batch, 0 påståenden i den ogiltigförklarade. Basstämpeln 2026-07-30 sattes av [AUTO-N1] 64acf9f och är inte oberoende granskad.

Vad Nortropic bygger, vad som byggs vid efterfrågan, och vad som är nej. Principen bakom gränsen: **pipelinen levererar stateless sajter som aldrig kräver jour — det är vallgraven, inte en teknisk brist.** En sajt utan databas, inloggning eller eget tillstånd kan inte läcka persondata den inte har, går inte ner av en migrering och väcker ingen klockan tre. Kalibreringen per kund sker i briefens §7 (`agents/project-planner.md`), aldrig genom att systemet kopieras per bransch.

## Statustabell — paketens mognad

**Detta är VANLIG DOKUMENTATION.** Tabellen beskriver var varje paket står; den är
inte §A-skyddad och statusvärdena bär ingen mekanisk grind i denna skiva. Att göra
statussemantiken §A-skyddad är en SENARE och egen ceremoni (H-2) — aldrig här.

Statusvokabulär (samma fem lägen som kapacitetsstatusarna): **DECLARED** (beskrivet,
ej byggt) · **BUILT** (byggt, ingen evidens) · **VALIDATING** (evidens samlas) ·
**PROVEN** (evidenskravet uppfyllt) · **ROUTE-OUT** (medvetet utanför — hänvisas bort).

| Paket | Ring | Status | Vad statusen vilar på |
|---|---|---|---|
| `lokal-se` — svenska lokala förtroendetjänster | 1 | **VALIDATING\*** | Pipelinen är byggd och körd, men evidensen är ännu inte två raka riktiga kunder |
| Ring 2-arketyper (hälsa/kropp, livsmedel, finans, barn som målgrupp, alkohol/tobak) | 2 | DECLARED | Beskrivna i ringmodellen; byggs först vid första ja, offereras som eget arbete |
| E-handel/distansavtal · eget tillstånd (databas/inloggning/medlemsdata) · föreningssajter | 3 | ROUTE-OUT | Medvetet nej med hänvisning — se Ring 3 nedan |

**\* Taket är avsiktligt.** Syntetisk evidens (fixturer, evals, torrkörningar) kan bära
ett paket som HÖGST till VALIDATING. PROVEN citerar endast riktiga kunder och kräver
Sonnet-trappans tröskel: ≥2 konsekutiva riktiga kunder, eval ≥90 på samma
rubrik-MAJOR, noll post-launch-grindmissar och grön suite; första missen speglar ned
statusen igen. **Simulering ger skala, verkligheten ger sanning** — syntetisk evidens
går aldrig tyst före riktig produktions-, användar- eller domänexpertevidens.

## Ring 1 — lokala förtroendetjänster (ÖPPEN, profilstyrd)

Svenska egenföretagare och lokala småföretag vars sajt ska driva EN primärhandling: hantverkare, frisörer, massörer*, hunddagis, blomsterhandlare, fotografer, redovisningskonsulter... Kalibreringen (primärhandling, röst, kvitton, schema, SEO-läge) genereras per kund i §7 och transporteras som `content/profile.ts`. **Bokning via extern tjänst ingår här** (Bokadirekt/Calendly/Cal.com hostat, integrerad via länk/embed) — sajten förblir stateless. *Branscher med juridikflaggor (t.ex. hälsa-närhet) kräver att flaggans modul finns — se `skills/nortropic-plan/references/juridikflaggor.md`.

## Ring 2 — nya arketyper och juridikmoduler (BYGGS VID FÖRSTA JA)

Arketyper och juridikmoduler som inte finns ännu (hälsa/kropp, livsmedel, finans, barn som målgrupp, alkohol/tobak) byggs först när första sådana kunden säger ja — efterfrågan före bygge — och **offereras som eget arbete**, inte som del av standardleveransen. Ohanterad flagga stannar alltid vid nod 3: bygg modulen eller tacka nej.

**Obemannat läge (v16) respekterar ringen.** En ohanterad juridikflagga (Ring 2-arketyp) stoppar alltid `/nortropic-autobygg` vid plan-steget och lämnar över vid nod 3 — obemannat auto-bygger aldrig en Ring 2-modul. Scope-nej (Ring 3 — e-handel/distansavtal, eget tillstånd/databas/Railway-klass) stoppar likaså; static-first-grinden (Del-C) fångar dessutom om ett stateful behov slunkit in i scaffolden. Obemannat rekommenderas alltså inte för Ring 2-fall — flaggkunder stoppar ändå villkorat.

## Ring 3 — nej, med hänvisning

- **E-handel/distansavtal:** nej. Bygg skyltfönstret; hänvisa handeln till Shopify/motsvarande. Distansavtalslag, ångerrätt och betalflöden hör hemma i en handelsplattform.
- **Eget tillstånd (databas/inloggning/medlemsdata):** utanför pipelinen. Offereras som separat systemutveckling (Railway-klass infrastruktur, eget drift-SLA) eller hänvisas — aldrig som Nortropic-sajt.
- **Föreningssajter:** nej som produkt (löst gratis av laget.se/Svenskalag) — ja som kärleksprojekt, utanför affären.
