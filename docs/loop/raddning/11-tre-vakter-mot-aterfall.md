# Tre vakter mot återfall — mekanismer, inte dokumentation

**Skriven 2026-09-16 på ägarens fråga:** *"Jag inbillar mig att dokumentation behöver
uppdateras så DETTA ALDRIG SKER IGEN."*

**Svaret är nej.** Dokumentation hade inte hindrat det, och vi vet det för att vi just
prövade det: **regel 22 — *"teknisk ändring och dess dokumentation i samma commit"* —
har funnits sedan 2026-08-07 och höll inte i fem dagar** av projektets viktigaste arbete
(FYND 23). Regeln fanns, den var skriven, den var läst, och 55 commits passerade utan en
enda rad.

Det som hindrar återfall är en mekanism som **fäller**. Här är tre, var och en med ett
**positivt kontrollprov som är kört** — de fäller bevisligen på den incident de finns för
att förhindra.

---

## Vakt 1 — regel 22: en drift-rad per dag med kernelcommits

> **⚠️ SKÄRPT 2026-09-16 efter FYND 25.** Regel 22 **är** delvis mekaniserad redan:
> controllern kräver en docs-rad per task (`docs-kravet ouppfyllt för h-001 (regel 17 +
> 22)`, syns i `h-007`:s utdata). Min första formulering — *"regel 22 saknar mekanism"* —
> var för grov.
>
> **Luckan är precis:** controllerns kontroll gäller **tasks som körs genom kedjan**. De
> 55 commitsen 09-09→09-12 var `[LOCAL]`-kontrakt **utanför** taskflödet, och där ser
> controllern ingenting.
>
> **Vakt 1 ska därför inte duplicera controllern.** Den ska täcka commits UTAN task — den
> yta controllern per konstruktion aldrig når. Överlappar de, ska vakten hänvisa till
> controllerns verdikt i stället för att avge ett eget; två mekanismer som säger olika
> saker om samma commit är värre än en.

**Fäller när** en dag har commits som rör `controller/`, `verify/` eller `specs/` men
`docs/loop/drift.md` saknar en `## <datum>`-rubrik för den dagen.

```python
days  = git log --format=%ad --date=short <bas>..HEAD -- controller/ verify/ specs/
rows  = rubriker '^## (\d{4}-\d{2}-\d{2})' i docs/loop/drift.md
fäll om någon dag i days saknas i rows
```

### Positivt kontrollprov — KÖRT 2026-09-16 mot plattformsgrenen

```
dagar med kernelcommits: 4  ['2026-09-09','2026-09-10','2026-09-11','2026-09-12']
dagar UTAN drift-rad:    3  ['2026-09-10','2026-09-11','2026-09-12']
VERDIKT: FÄLLER
```

**Vakten hade fångat FYND 20/23 den 10 september** — sex dagar innan en misslyckad
`git checkout` gjorde det.

### Krav på bygget

- **Basen måste deklareras.** Mot `origin/main` för en gren, mot föregående commit för
  ett enskilt pass. En vakt som väljer bas själv mäter något annat varje gång.
- **Dagen räknas i commit-datumets tidszon**, inte vaktens. Annars fäller den på
  midnattsgränser och blir ignorerad.
- **Tomma dagar finns inte.** En dag utan kernelcommits kräver ingen rad.
- **Undantagslista är förbjuden.** Behöver en dag inget spår är påståendet att arbetet
  var oviktigt — då skriv det i raden.

---

## Vakt 2 — dinglande referenser från trust-kritiska filer

**Fäller när** en fil under `specs/`, `verify/bin/` eller `controller/` refererar en
sökväg som inte finns i trädet.

### Positivt kontrollprov — KÖRT 2026-09-16 mot plattformsgrenen

| Saknad fil | Refereras av |
|---|---|
| `docs/05-beslutslogg.md` | **17 filer** — `controller/attest/cli`, `specs/tasks.spec.json`, `h-007`, `h-031`–`h-036`, `document-authority-exit` |
| `docs/07-konstitution.md` | 9 — `h-035`, `h-036`, `h-037`, m.fl. |
| `docs/03-regelverk.md` | 5 |
| `docs/00-borja-har.md` | 4 |
| `docs/agentoverlamning.md` | 2 |

```
VERDIKT: FÄLLER
```

**Vakten hade fångat FYND 22 i samma commit som separationen gjordes.** Fem dokument som
kärnans frysta grindar och specen binder sig till togs bort utan att referenserna
följde med.

### ⚠️ Kravet som avgör om vakten blir trodd

Samma körning gav **falska positiver**: `docs/loop/a.md`, `x.md`, `y.md`, `z.md`,
`absent.md`, `neighbor.md` är **testfixturer inne i grindarna** — syntetiska sökvägar i
negativa prov, som med avsikt inte finns.

**En vakt som skriker varg blir ignorerad, och en ignorerad vakt är värre än ingen.**
Bygget måste därför skilja verklig referens från fixtur. Föreslagen metod, i
fallande tillförlitlighet:

1. **Deklarerad fixturmängd** i filen som använder dem, läst av vakten — fixturen är
   explicit, inte gissad.
2. Sökvägar som förekommer i en `allowed_write`/`docs_impact`-position i specen är
   alltid verkliga.
3. Aldrig en namnheuristik (`a.md`, `x.md` ser ut som fixturer) — nästa fixtur heter
   något annat, och nästa riktiga fil kan heta `x.md`.

**Mutationsprov:** ta bort en verklig referens ur trädet → ska fälla. Lägg till en
deklarerad fixtur → ska INTE fälla. Båda krävs; utan det andra provet är vakten en
bullergenerator.

---

## Vakt 3 — regel 12: inget lokalt som inte finns på git

**Fäller när** arbetsträdet är smutsigt eller grenen ligger före sin uppström, utan att
`docs/loop/drift.md` säger vad och var.

```bash
git status --short                 # ska vara tomt
git log --oneline @{u}..HEAD       # ska vara tomt
```

### ⚠️ Denna är INTE en grind, och får aldrig bli en

De två ovan prövar **repots innehåll** och är deterministiska — samma träd ger samma
verdikt, på vilken maskin som helst. Vakt 3 prövar **maskinens tillstånd**, som skiljer
sig mellan kloner och sekunder.

Görs den till ett `exit_test` blir varje task ODÖMBAR i en ren klon, och vi har byggt
exakt den miljöbundna grind som regel 11 förbjuder och som `check-foundation-smoke`
redan är ett avskräckande exempel på.

**Rätt hemvist är en sessionsslut-hook**, inte `verify/bin/`. Krav:

- Den ska **gälla Codex också**, inte bara Claude. En hook som bara en av två modeller
  kör täcker halva problemet — och den opushade grenen var Codex-arbete.
- Den ska **ligga i repot**, inte i `~/.claude/`. Annars upprepar den fynd 2: ett skydd
  som bara finns på en maskin.
- Den ska **inte blockera**, den ska kräva en rad. Ett hårt stopp vid dagens slut lär
  folk att kringgå den.

---

## Vad de tre tillsammans täcker — och vad de inte gör

| Incident | Vakt som fångar den |
|---|---|
| 55 commits utan drift-rader (FYND 23) | **1** |
| Fem dokument raderade med kvarstående referenser (FYND 22) | **2** |
| Gren opushad i sex dagar (FYND 20) | **3** |
| Ingångsdokumenten beskrev fel projekt (fynd 2) | ingen — `check-repoidentitet.mjs`, `03-raddningsplan.md` steg 2b |
| Grindar som pinnar trädet (FYND 21) | ingen — **regel 11**, och rundtrampsvakten i `09-task-rundtrampsvakten.md` |

**De gör inte arbetet synligt. De gör osynligheten omöjlig att missa.** Det är
skillnaden mellan en regel och en mekanism, och det är hela svaret på frågan.

---

## Placeringen — och varför den inte längre är blockerad

`09-task-rundtrampsvakten.md` §2 bär en blockerande designfråga: *var ska en kernelvakt
bo?* Den skrevs när `scripts/` bar 23 webbvakter och `kor-vakter.mjs` plockade upp allt
som hette `check-*.mjs`.

**På plattformsgrenen är den frågan besvarad.** `scripts/` bär två filer —
`check-invariants.mjs` och `nortropic-codex-autopilot.py` — och `kor-vakter.mjs` finns
inte. `check-invariants.mjs` är omskriven till kärnans **plattformsinvariantgrind
PINV-001–006**, registrerad i `controller/verify/register.json` och körd av
`controller/verify/cli`.

Vakt 1 och 2 hör alltså hemma som **nya PINV-kontroller** i den filen. Det har en kostnad
som måste sägas: filen är SHA-pinnad i registret, så en ändring kräver hela
kontraktsflödet i `AGENTS.md` och att `PLATFORM_REGISTER` i `controller/verify/cli`
pinnas om i samma commit. Det är designat så med avsikt.

**Alternativet** — ett eget `verify/bin/p-003-exit` i stil med `p-001`/`p-002`, som körs
av människan och inte av kedjan — är billigare men svagare: det som kedjan inte kör,
kringgås.

**Arkitektens val, inte byggarens.** Men det är ett val mellan två kända alternativ, inte
längre en blockering.
