# Autonomy Kernel v1 — acceptansfilen

**Ägarbeslut 2026-09-16.** Denna fil beskriver vad acceptansfilen i repot ska innehålla
och bär det underlag som redan är verifierat. Den är **inte** själva acceptansfilen.

**Målfil i repot:** `docs/loop/autonomy-kernel-v1-acceptance.md`

**Verifierat 2026-09-16:** ingen motsvarande auktoritativ fil finns. `docs/loop/` bär
`harness-substitution-contract-v1.md`, `owner-author-workflow-v1.md`,
`remaining-bootstrap-delegation-v1.md`, `owner-h003-attestation-authority-v1.md` och
`codex-evidence-contract.md` — samtliga kontrakt om *hur* arbete görs, ingen om *när v1
är klar*. Termen `Autonomy Kernel` förekommer **noll** gånger i repot.

```bash
ls docs/loop/ | grep -iE 'accept|contract|kontrakt|v1'
grep -rl "Autonomy Kernel\|autonomy-kernel" docs/ specs/ AGENTS.md CLAUDE.md   # tomt
```

Filen ska **sammanföra befintlig auktoritet, inte skapa en konkurrerande kravlista.**
Varje rad ska peka på en redan beslutad källa.

---

## §1. Namndisciplinen — fyra olika saker, aldrig synonymer

Detta är filens viktigaste avsnitt. Sammanblandningen är en huvudorsak till att
"Bootstrap blir klar" aldrig gick att pröva.

| Beteckning | Betyder exakt | Källa |
|---|---|---|
| **Autonomy Kernel v1** | Loopen tar en task ur egen backlog, utför obevakat inom mandat, verifierar mot fryst `exit_test`, attesterar, publicerar via guarded merge och **återupptar efter avbrott med läget intakt**. Lika med `KERNEL_COMPLETE` i `00-VAD-NORTROPIC-AR.md` | Denna fil |
| **Bootstrap-frisläppning** | Kedjan `h-035 → h-037 → h-034 → h-036 → h-039 → h-038 → h-032 → h-031` grön. En teknisk baseline — **inte** fungerande autonom exekvering | `docs/loop/remaining-bootstrap-delegation-v1.md` |
| **Första autonoma start** | Den separat frysta engångsövergången efter `h-027`–`h-030`. Ett rapporterat lyckat försök eller `TASK_ALREADY_GREEN` etablerar den **inte** | `docs/loop/owner-author-workflow-v1.md` |
| **FULL_ROADMAP_SOFTWARE_COMPLETE** | Task-gates + programgrind + empirisk falsifiering gröna, alltså S2/S4–S13 + L | `docs/05-beslutslogg.md`, LOOP-ÄGARHAND-50 |
| **FULL_ROADMAP_COMPLETE** | Ovanstående **plus** bevisad dedikerad Nortropic Promoter-identity. Personlig `gh`-auth ersätter aldrig promoter-authority | Samma |

**`Autonomy Kernel v1` ⊂ `FULL_ROADMAP_SOFTWARE_COMPLETE`.** v1 kräver inte
förmågeskivorna `h-018`–`h-026`. Den som skriver att v1 är klar när bootstrap-kedjan är
grön har blandat ihop rad 1 och rad 2.

---

## §2. Vad som ingår

| Post | Task | Gate | Läge 2026-09-16 |
|---|---|---|---|
| Bootstrap-kedjan | `h-035`, `h-037`, `h-034`, `h-036`, `h-033` | ✓ frysta | klara |
| | `h-039` | ✓ fryst | **AVSLUTAD OVERIFIERAT 2026-09-16 (regel 11b)** |
| | `h-038`, `h-032`, `h-031` | ✓ frysta | ej gröna |
| Substitutionskedjan | `h-027`, `h-028`, `h-029`, **`h-030`** | — | **inte specade** (§3) |
| Notisen | `h-014` | **saknas** | ⚠️ *"beroenden gröna"* **FALSIFIERAT** — `h-013` är FAIL, mätt på `main` 2026-09-16. `VAGEN.md` FAS 4 |
| Återtaget / supervisor resume | `h-015` | **saknas** | blockerad av `h-030` |
| Programdomen | `verify/bin/autonomous-loop-exit` | **saknas** | specad 2026-08-10, aldrig byggd |

**Elva poster.** Inventeringens fullständiga beroendegraf står i `06-inventering.md`.

---

## §3. h-030 — ägarbeslut, ordagrant

> **`h-030` behålls inom den autonoma v1-leveransen**, med omfattningen i det befintliga
> substitutionskontraktet. Leverantören behåller interna resonemangs- och verktygsloopar.
> Nortropic behåller taskövergångar, begränsade omförsök och sina auktoritetsgränser.
> **Ingen generell organisationsorkestrering läggs till under h-030.**

Grunden: `h-030` är *"thin task supervisor + bounded cross-attempt retries"*
(`docs/loop/harness-substitution-contract-v1.md` rad 111), och `h-015` beror mekaniskt
på den. Utan `h-030` kan supervisor resume inte få en gate som håller.

**Två saker som måste hållas isär:**

- **Scopefrågan** stängs av detta registrerade beslut.
- **Implementationen** blir inte godkänd förrän `h-030`:s föreskrivna verifiering är
  godkänd. Att skriva beslutet är litet. **Det finns inget underlag för att påstå att
  det återstående implementationsarbetet är litet** — `h-027`–`h-029` står före den i
  kedjan och ingen av dem är specad.

---

## §4. Vad som INTE ingår

- Förmågeskivorna `h-018`–`h-026` (roadmapens S4, S5, S7–S13)
- Digitala förvaltningen och varje verksamhetsförmåga
- Projekt- och innovationskontorets implementation
- Aquarium, Verkstadsgolvet, Evolution
- Separationen av webbträdet till `nortropic-web`

**Befintliga krav får inte flyttas hit utan ett uttryckligt ändringsbeslut med
beslutsloggsrad.** Att flytta ett krav ut ur v1 för att det är svårt är en
scopeändring, inte en prioritering.

---

## §5. Hur varje krav bevisas

Acceptansfilen ska bära en rad per post i §2 med **fem** kolumner. Utan alla fem är
raden inte ett prov utan ett påstående:

| Fält | Krav |
|---|---|
| **Krav** | Vad som ska vara sant, formulerat så det går att pröva |
| **Prov / grind** | Exakt sökväg till `exit_test` eller grind |
| **Körförutsättningar** | Miljö, revision, förutsättningar som måste gälla vid körning |
| **Förväntat resultat** | Exit-kod och det observerbara utfall som räknas som PASS |
| **Faktiskt körbevis** | Kommando + exitkod + datum + commit-SHA. `OVERIFIERAT` tills körningen finns |

**Programdomen först.** `verify/bin/autonomous-loop-exit` fryses **RED innan** arbetet
den mäter, enligt LOOP-ÄGARHAND-50. Byggs den efteråt kan den skrivas så att det redan
gjorda råkar passera — och då mäter den ingenting. Samma princip som §A2 ger för
eval-rubriken.

---

## §6. Vad nästa fas får använda

Acceptansfilen ska avsluta med en överlämning som svarar utan att någon återberättar:

1. **Verifierad revision** — commit-SHA som proven kördes mot
2. **Bevisade förmågor** — vad som faktiskt går att bygga vidare på
3. **Kvarvarande begränsningar** — vad som INTE är bevisat, uttryckligen
4. **Externa förutsättningar** — promoter-identity, credentials, allt som kräver
   människohand

---

## §7. Provet på att filen duger

En ny session ska kunna besvara, med enbart filen:

> **"Vilka krav återstår före v1, och vilket observerbart resultat skulle stänga vart
> och ett?"**

Kan den inte det, är filen inte klar — oavsett hur välskriven den är.

**Punkten stängs när filen finns, omfattningen är entydig och provkopplingarna är
granskade. Själva v1-leveransen är inte klar förrän proven är godkända.** Det är två
skilda händelser och de ska aldrig rapporteras som en.
