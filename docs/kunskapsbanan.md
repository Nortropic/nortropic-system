# Kunskapsbanan — styrning (K0)

Senast verifierad mot systemet: 2026-08-26 · v1 (denna commit)
Verifieringsomfång: nyskapad i K0–K3-batchen; inga tidigare påståenden att verifiera.

Kunskapsbanan är hur systemet tar in kunskap UTIFRÅN — nya standarder, ändrade
rekommendationer, uppdaterad praxis — utan att någon av dem kan ändra hur systemet
arbetar bakom ryggen på en människa.

## GRUNDLAGEN: banan är PROPOSE-ONLY

**Kunskapsbanan skriver aldrig i en standard.** Den producerar FÖRSLAG, och ett
förslag blir verklighet först när den vanliga ägar-/förtroendeprocessen promoterar
det — samma väg som varje annat stewardförslag.

Detta är inte en artighetsregel. En kunskapskälla som får skriva direkt i systemets
normer är en kanal där en uppströmsändring tyst blir vår policy, och den dagen
någon frågar "varför gör vi så här?" finns inget beslut att peka på.

## Auktoritetsordningen

1. **`nortropic-system`** — den operativa kunskapen (professionella referenser och
   skills) bor HÄR. Det är den enda körauktoriteten.
2. **`nortropic-knowledge`** — **rådgivande bakland, ALDRIG körauktoritet.** Det får
   informera ett förslag; det får aldrig konsulteras av en grind, en agent eller ett
   bygge vid körning.
3. **Externa källor** — se källregistret (`config/kallregister.json`). En källa är ett
   OBSERVANDUM, aldrig ett direktiv.

**Auktoritet är frågeberoende.** Det finns ingen falsk totalordning där en källa
alltid vinner: WCAG avgör tillgänglighetsfrågor, inte copyfrågor; kunden avgör
sakfakta om sin verksamhet, aldrig UX. Vem som vinner beror på VILKEN fråga som
ställs, och den frågan namnges alltid i förslaget.

## Vad som är ägarens ensak (K0)

| Beslut | Varför det aldrig delegeras |
|---|---|
| Promotion av en lärdom till norm | Att ändra vad vi lovar kunder är ett affärsbeslut |
| Att öppna en ny källa i registret | En källa som ingen valt blir en bakväg in i normerna |
| Att köra radarn | Se nedan — radarn är ägartriggad under bootstrap |
| Varje ändring i §A-yta som ett förslag pekar mot | Konstitutionen, mätstockarna, grindnivåerna |
| Att flytta något ur `nortropic-knowledge` till operativ kunskap | Baklandet får aldrig glida in i körauktoritet |

## Vitlistan — vad ett kunskapsförslag FÅR peka mot

Vitlistan är **VÄGFORMAD med uttryckliga undantag**, inte en etikettlista. Skälet är
konkret: en glob som `skills/*/references/` svepte annars in `eval-rubric.md` (§A2)
och `juridikflaggor.md` (§A4) — två §A-ytor — medan förbudslistan bara nämnde dem
vid etikett. En yta som är vitlistad av sin SÖKVÄG och förbjuden av sitt NAMN är i
praktiken vitlistad.

**TILLÅTET:**

- `skills/*/references/` — **UTOM** `skills/nortropic-eval/references/eval-rubric.md`
  (§A2, mätstocken) och `skills/nortropic-plan/references/juridikflaggor.md`
  (§A4, juridiken).
- `packs/*/strategi/` — **UTOM** innehåll som bär §7.4 (kvittolista & attribution)
  eller §7.7 (juridikflaggor); de är §A7 och kalibrering som bär kundlöften.
- `docs/kursplan.md`
- `config/kallregister.json` (registret självt)

**FÖRBJUDET — även som förslag utan ägargranskning:**

`docs/07-konstitution.md` · eval-rubriken (`skills/nortropic-eval/references/eval-rubric.md`)
· grindarnas kravnivåer i `workflows/nortropic-launch.js` och `workflows/nortropic-review.js`
· **juridiken: `skills/nortropic-plan/references/juridikflaggor.md` och allt Gate 6-relaterat
(§A4 — juridik är human-only i ALLA lägen)** · `tests/fixtures/` · `AUTOPILOT` ·
modellkontraktet · §7.4/§7.7 i paketens strategimoduler (§A7).

Pekar ett fynd mot någon av dessa är förslagets enda tillåtna form att **FLAGGA det
för ägaren med källa och plats** — aldrig att formulera ändringen.

## Banans delar

| Del | Hemvist | Roll |
|---|---|---|
| **K1 Källregister** | [`config/kallregister.json`](../config/kallregister.json) | Vilka källor som finns, hur de bevakas och vem som konsumerar dem |
| **K2 Anspråkskontrakt** | [`kunskapskontrakt.md`](../skills/nortropic-retro/references/kunskapskontrakt.md) | Anspråksstegen och mallarna för anspråk, experiment och konflikt |
| **K3 Radar v1** | samma referens, avsnitt "Radar v1" | Månatligt matsmältningsorgan — ägartriggat, propose-only |
| **K4 Erfarenhet & kompetens** | stewardens retro (levererad i S1-min-batchen) | §Erfarenhet, GC-svep, kompetensregister, modellkandidatregeln |
| **K5 Första radarkörning + första riktiga projekt** | — | **DEFERRED_BY_TRIGGER**: kräver en första riktig kund. Byggs inte i förväg, och evidens fabriceras aldrig för att kunna kalla banan klar |

## Kallstart — ärligt läge

Vi har ingen mätt källkvalitet ännu. Registret bär därför en **kallstartsnivå** per
källa: en bedömning gjord innan vi vet, uttryckligen märkt som just det. Den mätta
källkvaliteten (`kalla-alfa`) är en SÖM för senare — fältet finns, det är tomt, och
ett tomt fält är okänt, aldrig noll.
