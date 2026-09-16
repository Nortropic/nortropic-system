# Lägesbild — vad som gått snett

Alla siffror är mätta mot repot 2026-09-14/16, full historik (825 commits). Kommandon
som återskapar dem står i `02-bevis.md`.

## Kort svar

**Verifieringsapparaten blev arbetet.** Inte som en glidning i fokus, utan som en
mekanisk konsekvens: grindarna är bundna till saker som driftar av sig själva, och
reglerna förbjuder att laga dem på plats. Varje drift blir därför en ny runda i
stället för en rättelse. Den konstruktionen har inget tak.

---

## 1. Rundtrampen — blödningen

**440 av 825 commits (53 %) bär ett H-nummer.** Kontrollplansprogrammet startade
2026-08-07; på fem veckor har det tagit över hälften av repots historia.

| Hypotes | Commits | Unika rundor |
|---|---|---|
| H-032 | 145 | 21 |
| H-039 | 80 | 32 |
| H-031 | 50 | 15 |
| H-035 | 34 | 8 |
| **Fyra hypoteser** | **309** | **76** |

`docs/loop/drift.md` bär **101** förekomster av `productless` / `NO-CREDIT`.

> **Om rundsiffrorna.** Kolumnen räknar unika `R`-nummer i commit-titlar och tar därmed
> med underrundor (`R24-R3` bidrar med både 24 och 3). För H-039 ger det 32; räknas bara
> huvudrundan blir det **26**, och `grep -c '^## .*H-039' docs/loop/drift.md` ger 37
> rundrubriker. De tre talen mäter tre olika saker och ska inte jämkas — men **26 är
> golvet**, och det är den siffran nedanstående analys använder.

### Varför H-039 inte kan konvergera — mätt, inte resonerat

**⚠️ RÄTTELSE 2026-09-16.** En tidigare version av detta avsnitt sa att rundorna brinner
på **miljödrift** — `st_dev`, inoder, `com.apple.provenance`. Det stämmer för en handfull
rundor och är fel som förklaring. Den påstådda orsaken var härledd **lexikalt**, ur
ordvalet i commit-titlar. Omhärledd **beteendemässigt** ser mekanismen annorlunda ut, och
den är värre.

**Grindfilen ändrades i VARJE runda. Inte en enda gång prövades en kandidat mot ett
oförändrat prov.**

```bash
git log --oneline --follow -- verify/bin/h-039-exit | wc -l     # 30 commits
```

Storleksserien, äldst först — 30 ändringar, **noll minskningar**:

```
200 798 → 215 179 → 221 356 → 234 854 → 267 556 → 375 091 → 390 267 → 434 513
→ 468 331 → 520 269 → 526 229 → 548 465 → 574 674 → 658 503 → 704 746 → 713 662
→ 743 346 → 790 684 → 892 845 → 1 000 384 → 1 083 651 → 1 186 248 → 1 292 181
→ 1 440 606 → 1 601 034 → 1 713 426 → 1 825 437 → 1 906 997 → 1 985 180 → 2 136 969
```

Varje runda **lägger till** en förpliktelse i grinden och tar aldrig bort någon. Rundornas
egna titlar säger det rakt ut: *"exact delta binding"*, *"installed completion"*,
*"group-order completion"*, *"target namespace correction"*, *"exact ... size budget
refreeze"*.

**Konsekvensen är formell, inte retorisk.** Konvergens kräver ett fast mål. Kandidaten har
aldrig mött samma prov två gånger, alltså finns ingen storhet som kan minska. *"Närmare
klart"* är inte svårt att mäta här — det är **odefinierat**. H-039 R33 är inte närmare
slutet än R4 var, och kan inte bli det så länge grinden rör sig med kandidaten.

**Och det är precis det som skiljer en task som blir klar från en som inte blir det:**

| Task | Commits mot grindfilen | Utfall |
|---|---|---|
| `h-016` | **1** | klar |
| `h-013`, `h-017`, `h-038` | **2** | klara |
| `h-001`, `h-036` | **3** | klara |
| `h-035` | 17 | pågår |
| `h-039` | 30 | pågår, R33 |
| `h-032` | 120 | pågår |
| `h-031` | **147** | pågår |

Ingen mellanform. Varje klar task har en grind som rörts högst tre gånger; varje
icke-klar har en som rörts 17–147 gånger. **Antalet omfrysningar av grinden är den enda
variabel som skiljer dem åt** — inte hypotesens svårighet, inte kandidatens kvalitet.

**Varför det inte tar slut.** Tre regler som var för sig är riktiga blir tillsammans en
arbetsgenerator:

1. *Fail-closed åt rätt håll* + *`ODÖMBART` blir aldrig grönt* — korrekt som princip,
   men en grind som binder sig till allt mer exakta detaljer fäller på det som inte är
   specificerat ännu, och varje sådan fällning ser ut som ett krav som saknas.
2. *En fälld runda är `NO-CREDIT` och immutabel* — den kan inte rättas, bara göras om.
   Och eftersom "göra om" i praktiken betyder **frys om grinden**, kostar varje fällning
   en ny, strängare mätsticka i stället för en rättelse.
3. **Ingen attribution.** Projektet skiljer inte mellan *kandidaten föll mot ett fast
   prov* och *provet ändrades under kandidaten*. Båda bokförs som `NO-CREDIT`. Därmed
   finns ingen mekanism som kan upptäcka att målet rör sig.

Miljöbindningen — `st_dev`, dev_t, `com.apple.provenance` — är alltså **ett symptom av
fyra rundor** (R29, R31, R32, R33), inte diagnosen. Diagnosen är att grinden är
skrivbar av samma program som ska passera den.

**Konkret, ur R32:s egen text:** R31 föll därför att *"selected ceremony size 135936
exceeded the fixed 131072 wrapper cap"* — en hårdkodad konstant som arbetet växte ur.
Rättelsen satte den nya gränsen till *"the no-margin maximum"* av det som råkade mätas
då. Nästa runda spränger den per konstruktion. Det är inte slarv; det är vad regeln
**kräver** när grinden får röras.

**Vad det betyder för planen:** doktrinändringen i `03-raddningsplan.md` steg 1b är inte
en finputsning av frysningsreglerna, den är **den enda posten som angriper orsaken**. Och
`09-task-rundtrampsvaktens` gren 2 ska räkna **omfrysningar**, inte filstorlek —
storleken är följden, omfrysningen är mekanismen.

---

## 2. Dokumentationen pekade på fel projekt

`CLAUDE.md` sa åt varje ny session att läsa `docs/agentoverlamning.md` **FÖRST**. Den
filen bar noll omnämnanden av kärnan och avslutades med att peka ut *"en körning mot en
riktig testklient"* — webbfabrikens nästa steg — som systemets.

Samtidigt: `CLAUDE.md`, `README.md`, `docs/00-borja-har.md` och
`docs/agentoverlamning.md` stod **oförändrade sedan klonbaslinjen** medan
`docs/loop/drift.md` och `docs/05-beslutslogg.md` skrevs om 38 gånger var.

Uppdateringarna gick alltså till det lager bara en pågående session läser, aldrig till
det lager varje ny session läser först. Kostnaden är återkommande: varje ny agentsession
bootade in i fel projekt och måste korrigeras för hand.

**Status:** rättat i **fyra** commits (`f4ec2e2`, `2de99cc`, `b3450a9`, `d30279c`), se
`artefakter/nortropic-dokumentation-4commits.patch`.
**PUSHADE 2026-09-16** till grenen `claude/inspiring-galileo-6w1pvw` — GitHub-appen
installerades för Nortropic-orgen och 403:an är borta. **Grenen är INTE mergad**, och
`kor-vakter` är inte körd mot den (sviten är miljöbunden i en molnklon). Steg 2a är
därmed *granska, kör vakterna på Macen, merga* — inte *applicera patchen*.

---

## 3. Inramningen är opålitlig som klass

Se tabellen i `00-LAS-FORST.md`. **Tretton** ärvda påståenden, alla falska, alla uppkomna
på samma sätt. Det avgörande är inte punkterna utan **klassen**: ingen mekanism prövade om
dokumentationen beskriver mekanismerna rätt, och tretton av tretton stickprov föll.

**Nio av de tretton hittades i DETTA underlag**, efter att det skrivits — däribland
diagnosen av projektets dyraste problem (§1 ovan, rundtrampets orsak) och repo-siffran i
§4. Underlaget är alltså självt ärvd inramning och ska behandlas som evidens, inte
evangelium.

**Mönstret i mina egna fel är värt mer än felen.** Elva av tretton kom av en **lexikal**
metod — ett grep, ett ordval, ett filtrerat kommandosvar — som aldrig prövades mot
beteendet. Varje gång jag bytte till en beteendemässig metod (kör grinden, ta bort filen
och se vad som går sönder, följ filens historik) föll påståendet. Det är den metodregel
`06-inventering.md` §0 kodar, och den är dyrköpt.

**Och det är därför paketet numera bär ett PROV, inte bara en uppmaning.**
`artefakter/validera-underlaget.sh` prövar 37 av underlagets tal mot repot och ger
verdikt per rad. Det två sista felen (bundlens siffror, patchens commitantal) hittades
inte av läsning utan av att tal jämfördes mot artefakten — en maskin gör det bättre än en
läsare, varje gång, utan att tröttna.

---

## 4. Separationen är inte gjord

**Arbetsdelningen fungerar.** Av 99 commits i fönstret 31 aug–8 sep rörde 48 bara
kernelträdet, 1 bara webbträdet, 2 båda.

**Filerna ligger kvar.** Spårade i HEAD: `agents/` 7, `skills/` 44, `packs/` 5,
`backtests/` 17, `workflows/` 6 filer, plus 23 `scripts/check-*.mjs`.

**Inget beslut om repodelning står i loggarna** — varken i `docs/05-beslutslogg.md`
eller `docs/loop/drift.md`. Beslutet fattades utanför repot.

**Inget målrepo finns.** Under `Nortropic`-orgen finns fyra repon:
`nortropic-system`, `verkstadsgolvet`, `nortropic-intake`, `innovation-intake`. De tre
senare bär noll filer av webbfabriken; `verkstadsgolvet` är en
Next.js-övervakningsdashboard och hör inte hit.

> **RÄTTELSE 2026-09-16.** En tidigare version skrev *"kontots fyra repon"* och lät det
> betyda alla repon kontot ser. Det var fel: siffran fyra kom ur en **filtrerad** fråga.
> Ofiltrerat ser sessionen **15 repon** — 4 under `Nortropic`, 11 personliga under
> `Jonkebronk` (ägaren: *"det är inte relevanta repos"*). Rättelsen ändrar ingen slutsats
> här, men den är samma felklass som resten av underlaget: **ett tal togs från ett
> kommando vars filter inte lästes.**
>
> **Och den lämnar en öppen lucka.** Ägaren uppger att det finns ett **backup-repo**. Det
> är inte bland de 15 och kan alltså inte nås härifrån. Var det ligger, vad det bär och
> om det är nyare än `origin/main` är **oavgjort** — se `06-inventering.md` §0c, som gör
> det till en inventeringspost på Macen. Fram till dess är varje påstående i detta
> underlag om *"vad som finns"* begränsat till **detta repo**, aldrig till systemet.

---

## 5. Kärnans trust-rot är pinnad till webblagret

Detta är det som faktiskt blockerar separationen.

| Kernelankare | Pinnat till |
|---|---|
| `controller/verify/register.json` | 2 webbfiler |
| 5 frysta gates (h-007/035/036/037/038) | `docs/07-konstitution.md` |
| `verify/bin/h-007-exit` | `docs/03-regelverk.md` |
| 10 frysta gates | `docs/05-beslutslogg.md` |
| h-017, h-035, h-037 | `scripts/check-invariants.mjs`, `workflows/nortropic-verify-suite.js` |

**Och beroendet är cirkulärt — men har EN enda rot.** `controller/verify/register.json`
är kärnans förgodkända verifierarregister och registrerar exakt två verifierare, **båda
webbfiler**: `scripts/check-invariants.mjs` och `workflows/nortropic-verify-suite.js`.

Omvänt läser `scripts/kor-vakter.mjs` samma register — men bara av ett skäl (rad 66–76):
den behöver veta vilka vakter under `scripts/` som är **hash-pinnade** i stället för
signaturkvitterade, eftersom en registrerad fil inte får skrivas i. Enda sådana posten är
`check-invariants.mjs`.

```
kärnans register registrerar en webbvakt
  → den webbvakten är SHA-pinnad och får inte bära kvittensrad
    → kor-vakter måste identifiera den på hash
      → kor-vakter måste läsa kärnans register
        → webbsviten går ODÖMBART utan kärnan
```

**Tas `check-invariants.mjs` ur registret blir `EXTERNT_PINNADE` tom och hela
webb→kärna-riktningen upphör.** Båda riktningarna flödar ur samma faktum: kärnans
register registrerar webbfiler i stället för kernelverifierare. Verifierat genom att
bryta ut webbträdet och köra sviten där — första raden blev `ODÖMBART`.

**Vaktapparaten är dessutom webbfabrikens institution.** Första `check-*.mjs` skapades
2026-07-31, en vecka **före** kärnan (`controller/` och `verify/bin/`, 2026-08-07).
`kor-vakter.mjs` och `check-vaktankare.mjs` kom 2026-08-26, och de två kernelläsande
vakterna 2026-08-27 — tre veckor efter att kärnan fått sin egen dom. De är sena
påbyggnader som skruvade kernelkontroller på en webbmekanism, inte kärnans eget system.

**Konstitutionen och regelverket är webbdokument.** 0 kernelomnämnanden vardera. Varje
§A-skyddad sökväg ligger i webbträdet: `AUTOPILOT`, `agents/nortropic-steward.md`,
`workflows/*`, `skills/*`, `packs/*`, `docs/06-scope.md`, `docs/kapacitetskatalog.md`.
Kärnan ärver §A-begreppet via `docs/loop/byggplan-v3.md` §3.1 — den utvidgningen bor i
byggplanen, inte i konstitutionen. De binder i kärnan av **beroende, inte av innehåll**.

**Konsekvensen:** varje väg ut ur sammanflätningen går genom ett fryst ankare. Att
flytta webbträdet bryter tre frysta exitprov; att byta registret bryter samma prov,
eftersom de läser registrets innehåll. Och en fryst gate kan inte skrivas om — den
kräver en ny fryst runda.

Regeln som skyddar frysta ankare finns alltså för att förhindra precis det den nu
blockerar.

---

## Den gemensamma nämnaren

Alla fem punkterna är samma fel: **ett påstående litades på i stället för att
mekanismen prövades.**

- H039 fryser om sin egen mätsticka varje runda, och ingen prövade om *målet stod still*.
- Dokumentationen beskrev vad mekanismer *antas* göra.
- `23/23 gröna` *läses* som verifiering utan att någon prövat vad sviten täcker.
- Separationen *ansågs* gjord utan att någon kontrollerat trädet.

`docs/agentoverlamning.md` §3 varnar ordagrant för detta, men på vaktnivå. Felen ovan
ligger en våning upp, där ingen vakt tittade.
