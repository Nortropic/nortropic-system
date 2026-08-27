# Frusna kontraktsversioner — evidens, aldrig auktoritet

Senast verifierad mot systemet: 2026-08-27 · v1 (denna commit)
Verifieringsomfång: nyskapad i `AL-GAP-3`-skivan.

**Ingenting här är auktoritativt.** Den kanoniska hemvisten för researchkontraktet är
`skills/nortropic-plan/references/research-kontrakt-v3.md`, pinnad i
`config/research-contract.v3.json`. Filerna i den här katalogen finns av ETT skäl: att en
backtestfixtur som är skriven mot en ÄLDRE kontraktsversion ska gå att pröva mot **den
versionen**, inte mot minnet av den.

## Varför katalogen finns

`AL-GAP-3` sa: *"Researchen är skriven mot v3.0.0 men det finns ingen frusen kopia av
v3.0.0 att pröva den mot — kontraktet i repot är v3.1.0. Formen prövas alltså mot minnet av
en version, inte mot versionen."*

**Minnet var fel i BÅDA riktningarna, och det upptäcktes först när kopian frystes:**

| Vad minnet sa | Vad v3.0.0 faktiskt säger |
|---|---|
| Vaktens undantag: *"`case-a-legacy` bär `§1. NAP`, eftersom fixturen är skriven mot v3.0.0 **där §1 hette så**"* | §1 hette **`Organisation & typade kontaktvägar`** — identiskt med v3.1.0. `NAP` förekommer EN gång i v3.0.0, inne i §1:s beskrivning, aldrig som sektionsnamn |
| Fixturens `## 5. Geografisk räckvidd & språk` lästes som korrekt | Det är **v3.1.0:s** namn. v3.0.0 säger `Geografi & språk` — fixturen bar alltså det NYA kontraktets rubrik i den fil som finns för att bevisa det GAMLA |

Ingen kontroll kunde se något av detta: vakten prövade legacyfixturen mot **v3.1.0** med ett
**handskrivet** undantag för §1. Ett handskrivet undantag är per definition ett minne, och
ett minne kan inte falsifieras av det det minns fel om.

## Lagen för den här katalogen

1. **BYTE-OFÖRÄNDRAD.** Varje fil är en exakt kopia av en historisk git-blob, och
   `check-backtest-fixtures.mjs` verifierar `git hash-object` mot det pinnade blob-id:t.
   Ingen rubrik, ingen varningstext, ingen städning får läggas till — då är den inte längre
   den version den utger sig för att vara. Läsanvisningen bor därför i den HÄR filen.
2. **INGEN KONSUMENT I KEDJAN.** Ingen agent, workflow eller skill får läsa härifrån. En
   frusen version som får producera är en andra auktoritet, och kontraktets färskhetslag
   finns för att förhindra exakt det.
3. **BARA VERSIONER SOM EN FIXTUR FAKTISKT PRÖVAS MOT.** Katalogen är inte ett arkiv över
   allt som funnits. Frys en version när — och bara när — något ska prövas mot den.

## Innehåll

| Fil | Version | Historisk blob | Kom ur commit | Prövas av |
|---|---|---|---|---|
| `config/frusna-kontrakt/research-kontrakt-v3.0.0.md` | 3.0.0 | `6e7a94e56ec32a8c2de00f3033a8aadaf019cf40` | `645546a1` (S1) | `backtests/case-a-legacy/research.md` via `check-backtest-fixtures.mjs` |

## Vad detta INTE stänger

Att fixturens FORM nu prövas mot rätt version säger ingenting om att en v3.0.0-research
BETER sig rätt i kedjan. `AL-11` och `AL-12` — att två kontraktsversioner leder till samma
BYGGDA sajt — kräver två verkliga byggen och är fortfarande `EJ KÖRDA`.
