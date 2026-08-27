# CASE A-LEGACY — kompatibilitetsvägen, vad PASS betyder

Ankare: masterplanens **§26 Case A** — *"through: compatibility route; new universal+local
composition"*. `case-a-lokal/` är den andra vägen. **Detta är den första.**

Fixturen stänger `A-GAP-3`.

---

## Vad vägen prövar

Ett kundrepo byggt före Site Quality Contract v2 bär en profil på `v1.1.0` **utan**
v2-fältgrupperna. Bakåtkompatibilitetslagen (`skills/nortropic-stack/SKILL.md`) säger:

> 1. **En v1.x-profil är GILTIG.** Grindar, eval och granskning FAILar ALDRIG enbart för
>    att en profil bär `profilKontraktVersion: 'v1.x.y'`.
> 2. **Saknade v2-fält läses som `SAKNAS_I_V1` — aldrig som tomt, falskt eller noll.**
>    En frånvaro är okänd, inte ett negativt svar.
> 3. **Migrering är additiv och en egen handling** — aldrig tyst under ett bygge.

**Led 2 är det svåra, och felet är av det tysta slaget.** `profil.statelesshet?.hallerTillstand`
ger `undefined`, som blir `false` i varje boolesk kontroll. Och `false` är här det
**gynnsamma** svaret — "kunden håller inget tillstånd" låter som ett godkännande. Ett fel
som ser ut som ett godkännande upptäcks inte av den som hoppas att allt är bra.

## Lagen är nu KOD, inte prosa

Lagen stod bara i skill-filen. Ingenting hindrade en konsument från att bryta den.
`scripts/profil-las.mjs` implementerar den:

| Utfall | När | Varför det inte får slås ihop med grannen |
|---|---|---|
| `FUNNET` | fältet finns | — |
| `SAKNAS_I_V1` | v2-fält, profil äldre än v1.2.0 | **Okänt, aldrig nej.** Det är hela lagen |
| `SAKNAS` | fältet borde finnas i den här versionen | Ett FEL. Att kalla det legacy vore att bortförklara en trasig profil |
| `ODÖMBAR` | stämpeln går inte att tolka | En otolkbar version får **aldrig** bortförklara ett saknat fält som legacy — då blir varje fel gammalt nog |

**`las()` returnerar aldrig ett värde direkt** utan alltid `{ status, varde }`. Det gör
det omöjligt att av misstag använda en frånvaro som ett svar. `jaNejOkant()` är den enda
tillåtna vägen till ett booleskt svar och returnerar `'OKÄNT'` för allt som inte är ett
funnet booleskt värde — `las(...).varde === true` hade annars gett `false` för en frånvaro,
alltså precis det lagen förbjuder.

## Vad som ska hålla

| ID | Påstående | Läge |
|---|---|---|
| `AL-1` | Profilen på `v1.1.0` är GILTIG — ingen kontroll fäller enbart på stämpeln | `MEKANISK` |
| `AL-2` | Samtliga elva v1.1.0-fält finns och är oförändrade | `MEKANISK` |
| `AL-3` | Samtliga fjorton v2-fältgrupper SAKNAS — det är fixturens poäng, inte ett slarv | `MEKANISK` |
| `AL-4` | Varje saknat v2-fält läses som `SAKNAS_I_V1`, aldrig som `false`/tomt/noll | `MEKANISK` (`profil-las.mjs`) |
| `AL-5` | `jaNejOkant` ger `'OKÄNT'` för varje saknat v2-fält — aldrig `false` | `MEKANISK` |
| `AL-6` | Ett saknat OBLIGATORISKT v1-fält ger `SAKNAS`, inte `SAKNAS_I_V1` | `MEKANISK` |
| `AL-7` | Ett saknat VALFRITT v1-fält (`noindexCutover`) är ett giltigt tillstånd | `MEKANISK` |
| `AL-8` | En otolkbar versionsstämpel ger `ODÖMBAR`, aldrig `SAKNAS_I_V1` | `MEKANISK` |
| `AL-9` | Doctor #5:s semver-vakt är UPPFYLLD: samma MAJOR, `1.1.0 ≤ 1.3.0` | `MEKANISK` |
| `AL-10` | Fixturen körs genom beslutslagret och når samma utfall som `case-a-lokal` | `MEKANISK` (`kor-backtest.mjs`) |
| `AL-11` | Ingen backfill sker tyst — profilen förblir `v1.1.0` genom hela körningen | `EJ KÖRD` — kräver ett verkligt bygge |
| `AL-12` | Den byggda sajten från en v1-profil är likvärdig med den från en v2-profil | `EJ KÖRD` — kräver två byggen och en jämförelse |

**`AL-11` och `AL-12` är ODÖMBARA, aldrig gröna.** De är de två som faktiskt skulle bevisa
att kompatibilitetsvägen fungerar i drift; resten bevisar att LÄSNINGEN är rätt.

## Namngivna avvikelser

| ID | Avvikelse | Läge |
|---|---|---|
| `AL-GAP-1` | Fixturen är SYNTETISK. §26 säger *"historical/frozen"* — detta är inte ett historiskt kundrepo utan en konstruerad v1-profil. Samma avvikelse som `A-GAP-1` | `NAMNGIVEN` |
| `AL-GAP-2` | **RÄTTAD BESKRIVNING 2026-08-27.** Jag skrev att *"ingen konsument använder läsaren"*. **Det var fel.** Lagens text — *saknade v2-fält läses som `SAKNAS_I_V1` … ALDRIG som tomt eller falskt* — står i BÅDA grindworkflowen, i `qa-launcher` och i två skills. **Konsumenterna bär regeln som prompttext.** Det som faktiskt saknades var att något hindrar den från att tyst falla ur en prompt vid nästa omskrivning | `DELVIS ÅTGÄRDAT` | `scripts/check-paketlinser.mjs` HÄRLEDER konsumentmängden (varje fil som instruerar läsning av `content/profile.ts`) och kräver att var och en bär lagen — uttryckt som OKÄND, aldrig som ett negativt svar. **Kvarstår:** ingen kodkonsument går genom `profil-las.mjs`; grindarna är agenter som följer text. Att en agent FÖLJER regeln går inte att pröva här — det kräver en körning |
| `AL-GAP-3` | Researchen är skriven mot **v3.0.0** men det finns ingen frusen kopia av v3.0.0 att pröva den mot — kontraktet i repot är v3.1.0. Formen prövas alltså mot minnet av en version, inte mot versionen | `NAMNGIVEN` |

## Vad fixturen ALDRIG får användas till

Samma tak som Case A och Case B: syntetisk evidens bär aldrig något över `VALIDATING`.
En grön kompatibilitetsväg gör inte bakåtkompatibiliteten `PROVEN` — det kräver ett
verkligt v1-kundrepo som byggs om utan att något går sönder.
