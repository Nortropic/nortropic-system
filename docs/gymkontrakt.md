# Gymkontraktet — vad en modellutvärdering får och inte får vara

Senast verifierad mot systemet: 2026-08-26 · v1 (denna commit)
Verifieringsomfång: nyskapad. Ankare: masterplanens **§18 GYM / CROSS-MODEL EVALUATION**
(elva frusna lagar) och **§17 Modellkandidatregeln** (fyra led per förslag). Kontraktet
formulerar dem operativt; det stiftar dem inte.

**Gymmets utdata är EVIDENS, aldrig förtroendeauktoritet.** Ett gym som får befordra
själv är inte ett gym, det är en självutnämning.

---

## 0. Varför den här filen skrevs av eleven — och vad som gjorts åt det

§18:s första lag lyder: **`student cannot move goalposts`.** Den agent som skriver det här
kontraktet är också den vars konfigurationer gymmet ska mäta. Det är en verklig
intressekonflikt och den löses inte av goda intentioner.

Tre konstruktioner, inte löften:

1. **Mätstockarna finns redan och kan inte skrivas härifrån.** `tests/fixtures/` är
   §A6-skyddad och människoägd; baselines klipps av människa. Gymmet LÄSER dem. Att
   flytta målstolparna kräver alltså en §A-handling, inte en gymkörning.
2. **Alla elva lagar räknas upp, även de som INTE går att göra mekaniska.** Varje lag bär
   en rad med `MEKANISK` eller `EJ MEKANISK` + skäl. `scripts/check-gym-contract.mjs`
   fäller om en lag saknar rad — så jag inte tyst kan behålla de lätta och tappa de svåra.
3. **Ingen befordran finns i kontraktet.** Promotion går den vanliga ägar-/förtroendevägen
   (§18:s sista lag). Gymmet producerar en rapport och stannar.

Det som återstår som verklig risk står i §6: att jag valt vilka lagar som är enkla att
göra mekaniska. Den risken kan bara en människa granska.

## 1. §18:s elva lagar — var och en med sitt läge

| ID | Lag (planens ord) | Operativ innebörd | Läge |
|---|---|---|---|
| `G1` | *student cannot move goalposts* | Gymmet får läsa `tests/fixtures/**` men aldrig skriva dem. En körning som vill ändra en baseline avbryts och rapporterar det som ett FYND | `MEKANISK` |
| `G2` | *deterministic evidence first* | Varje påstående ska först prövas deterministiskt (exit-koder, diffar, räkningar). En domare får åberopas endast för det som inte går att avgöra så | `MEKANISK` delvis — vakten prövar att rapporten BÄR ett deterministiskt led före varje domarled, aldrig att deterministiken faktiskt försöktes först |
| `G3` | *calibrated judge only where deterministic evidence is insufficient* | Domaren måste vara kalibrerad mot ett känt facit, och kalibreringen redovisas i samma rapport | `EJ MEKANISK` — kalibreringens KVALITET är en bedömning |
| `G4` | *disagreement preserved, not averaged away* | Två domare som är oense ger `OENIG`, aldrig ett medelvärde. `OENIG` blir aldrig grönt | `MEKANISK` |
| `G5` | *provider family preference measured* | Rapporten ska redovisa utfall per leverantörsfamilj, så en familjepreferens syns i stället för att gömmas i ett snitt | `MEKANISK` delvis — endast fältets närvaro; att mätningen gjorts går inte att avgöra ur rapporten |
| `G6` | *hidden holdouts protected* | Held-out-fall får aldrig läsas av kandidaten och aldrig citeras i rapporten med innehåll — bara med utfall | `EJ MEKANISK` — held-out-repot finns inte (se §4) |
| `G7` | *synthetic evidence never yields PROVEN* | En gymkörning kan aldrig lyfta något över `VALIDATING` (§A9) | `MEKANISK` |
| `G8` | *optimizer-invisible measurement where reward-hacking risk exists* | Där kandidaten kan optimera mot måttet ska måttet inte finnas i kandidatens kontext. Rapporten namnger vilka mått som hölls osynliga | `EJ MEKANISK` — osynligheten kan inte bevisas av samma system som döljer |
| `G9` | *bounded budget* | Varje körning bär ett tak i antal anrop och kostnad, satt FÖRE start | `MEKANISK` |
| `G10` | *budget exhaustion ≠ PASS* | Slut budget ger `ODÖMBART`, aldrig `PASS` och aldrig `FAIL` | `MEKANISK` |
| `G11` | *promotion uses normal owner/trust path* | Gymmet befordrar aldrig. Rapporten är ett förslag i det vanliga flödet | `MEKANISK` delvis — vakten prövar att KONTRAKTET saknar befordransväg, aldrig att en körning avstår från att befordra |

**Sex av elva är EJ MEKANISKA eller delvis så.** Det är inte en brist som ska döljas.
`G3`, `G6` och `G8` är helt icke-mekaniska: de handlar om en bedömning, om ett repo som
inte finns, respektive om en egenskap ett system inte kan bevisa om sig självt. `G2`, `G5`
och `G11` prövas bara till FORMEN — att rapporten bär rätt fält, aldrig att beteendet
bakom fältet inträffade. **Endast fem av elva lagar är verkligt mekaniskt bundna.**

## 2. §17 Modellkandidatregelns fyra led

Varje modellförslag — **upp SOM ned** — visar fyra led. Ett förslag som saknar ett led är
inte ett förslag.

| Led | Krav | Läge i dag |
|---|---|---|
| 1 | Kandidat mot frusna suite/fixturer | Körbar när gymmet får budget |
| 2 | Kandidat mot held-out-fall | **`ODÖMBART`** — held-out-repot finns inte, och skapandet är en ägarceremoni (`docs/kompetensregister.md`) |
| 3 | Rollback-klausul | Alltid skrivbar |
| 4 | Usage-/kostnadsdelta | Körbar |

**Led 2 redovisas ODÖMBART i varje förslag — aldrig grönt, aldrig utelämnat.** Ett förslag
som tiger om led 2 döljer att en tredjedel av bevisningen saknas.

**Modellkontraktet ändras EN rad i taget.** En versionsbump kräver omkalibrering där
worker- eller domarkompetens kan ha ändrats.

## 3. Vad en gymkörning måste producera

```
GYM-RAPPORT <id>
Kandidat: <modell/roll>      Baslinje: <modell/roll>
Budget: <tak>  Förbrukat: <faktiskt>  Status: <INOM | UTTÖMD>
Deterministiska led: <lista med kommando + exitkod per påstående>
Domarled: <endast för det deterministiken inte kunde avgöra, med kalibreringsnot>
Per leverantörsfamilj: <utfall>
Oenigheter: <bevarade, aldrig medelvärdesberäknade>
Osynliggjorda mått: <vilka, och varför>
Modellkandidatregeln: led 1 <...> · led 2 ODÖMBART · led 3 <...> · led 4 <...>
VERDIKT: <PASS | FAIL | OENIG | ODÖMBART>   — aldrig PROVEN, aldrig en befordran
```

## 4. Vad gymmet ALDRIG gör

- **Skriver aldrig i `tests/fixtures/`** — §A6, människoägd.
- **Befordrar aldrig** — §18:s sista lag.
- **Ger aldrig `PROVEN`** — syntetisk evidens är kapad under det (§A9).
- **Medelvärdesberäknar aldrig oenighet** — `OENIG` är ett eget utfall.
- **Kallar aldrig uttömd budget för PASS.**
- **Utelämnar aldrig led 2** — `ODÖMBART` skrivs ut.

## 5. Vad som INTE är byggt

**Ingen körbar gymrunner finns.** Kontraktet och dess vakt är formen; körningen kräver
modellanrop med ett kostnadstak, vilket är ett ägarbeslut. Det som saknas, namngivet:

| ID | Lucka | Nästa transition |
|---|---|---|
| `GYM-GAP-1` | Ingen runner. Kontraktet beskriver rapportformen, inget producerar den | Ägarbeslut om budgettak, sedan en runner som läser frusna fixturer och skriver rapportformen |
| `GYM-GAP-2` | Held-out-repot finns inte, så `G6` och led 2 är oprövbara | Ägarceremoni enligt `docs/kompetensregister.md` |
| `GYM-GAP-3` | GYM-EXP-1 är designad (§6) men aldrig körd | Följer `GYM-GAP-1` |

## 6. GYM-EXP-1 — designen, med kontrollen som gör den ärlig

Planens reviderade GYM-EXP-1 kräver **same-family resample control before claiming
cross-family value.**

Innebörden är hela experimentets poäng: om modell A från familj X slår modell B från
familj Y, kan skillnaden vara familjen — eller bara brus mellan två körningar. Därför körs
**samma modell mot sig själv i en andra sampling** först. Är spridningen inom familjen
lika stor som skillnaden mellan familjerna, finns inget familjefynd att rapportera.

| Steg | Vad | Varför |
|---|---|---|
| 1 | Kör baslinjemodellen mot frusna fixturer | Ger utgångsvärdet |
| 2 | **Kör baslinjemodellen IGEN, ny sampling** | Mäter brus inom familjen — kontrollen |
| 3 | Kör kandidaten | Ger jämförelsevärdet |
| 4 | Jämför steg 3 mot steg 1 **och mot spridningen i steg 2** | Ett fynd som ryms inom bruset är inget fynd |

**Utan steg 2 är varje familjepåstående oskiljbart från brus.** Det är därför planen kallar
kontrollen obligatorisk och inte valfri.

## 7. Vad kontraktet INTE gör

- **Ingen ny grind.** Inget i pipelinen läser den här filen.
- **Ingen ny mätstock.** Gymmet läser §A-skyddade frusna fixturer; det definierar inte
  kvalitet. Skulle kontraktet komma i konflikt med `docs/07-konstitution.md` gäller
  konstitutionen, och den här filen är fel.
- **Ingen befordransväg.** Den bor i det vanliga ägar-/förtroendeflödet.
