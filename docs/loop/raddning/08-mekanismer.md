# Mekanismerna — arbetsregler som fäller, inte paragrafer

**Ägarbeslut 2026-09-16.** Tre regler ska kopplas till uppdragens avslut,
granskningsfyndens behandling och återöppning av avslutat arbete.

> **Ett fält som ingen använder för att fatta nästa arbetsbeslut är dokumentation, inte
> en mekanism.** Varje rad nedan kräver tre saker: fältet, beteendet fältet styr, och
> provet som visar att beteendet fungerar.

---

## §0. Fyndet som ändrar hur regel 2 ska byggas

Vi utgår inte från noll. `docs/loop/codex-autopilot-report.schema.json` finns, och
`scripts/nortropic-codex-autopilot.py` läser `blocking_findings` för att bestämma nästa
åtgärd (`raw = report.get("blocking_findings")`). Mekanismen finns alltså.

**Men schemat har ingen icke-blockerande kanal.**

```bash
python3 -c "
import json; s=json.load(open('docs/loop/codex-autopilot-report.schema.json'))
print('fyndlistor:', [k for k in s['properties'] if 'finding' in k])
print('rotens additionalProperties:', s['additionalProperties'])
print('fyndets fält:', list(s['properties']['blocking_findings']['items']['properties']))
print('fyndets additionalProperties:', s['properties']['blocking_findings']['items']['additionalProperties'])"
# fyndlistor: ['blocking_findings']
# rotens additionalProperties: False
# fyndets fält: ['id', 'summary', 'evidence']
# fyndets additionalProperties: False
```

**Enda fyndkanalen heter *blocking*.** Ett smakförslag har ingenstans att ta vägen utom
in i den blockerande listan — eller att inte sägas alls. Det är den mekaniska
förklaringen till att förslag blir reparationsrundor, och det är inte ett saknat
klassificeringsfält utan en **saknad kanal**.

Rätt ingrepp är därför **additivt**: en syskonlista för icke-blockerande fynd, plus ett
grundfält på de blockerande. `blocking_findings` befintliga form rörs inte.

---

## §1. Regel 1 — varje etapp slutar i användbar förmåga

| Del | Innehåll |
|---|---|
| **Mekanism** | Etappen har en namngiven leverans och acceptanskriterier. Avslut kräver hänvisning till resultat och relevant verifiering |
| **Fält som finns** | `tests[]` med `name`, `command`, `exit`, `result`, `decisive_evidence` — alla obligatoriska |
| **Beteendet** | `outcome: DONE` utan minst ett `tests[]`-element med `result: PASS` och faktisk `exit` godtas inte |
| **Prov** | En rapport med `outcome: DONE`, tom `tests[]` och prosa-summering ska **avvisas**. Muterad kopia som bevisligen fälls |

Schemat bär redan fälten. Det som saknas är att *avslut* kräver dem.

---

## §2. Regel 2 — granskning kontrollerar kraven, utökar dem inte

| Del | Innehåll |
|---|---|
| **Mekanism** | Två kanaler i stället för en. Blockerande fynd kräver grund; övriga routas till backlog utan att starta en runda |
| **Fältändring** | `blocking_findings[]` får obligatoriskt `basis` — vilket krav, vilken klausul eller vilken röd grind fyndet berör. Ny syskonlista `advisory_findings[]` med samma form men utan `basis`-krav |
| **Beteendet** | Ett fynd utan `basis` **kan inte** ligga i `blocking_findings` och startar därmed ingen `NEEDS_REMEDIATION`. Det hamnar i `advisory_findings` och routas till backlog |
| **Prov** | Ett smakförslag i `advisory_findings` ska ge `outcome: READY` och ingen ny runda. En belagd kravbrist i `blocking_findings` med `basis` ska ge `NEEDS_REMEDIATION`. Båda som muterade kopior som bevisligen ger rätt utfall |

### Två avgränsningar som aldrig får brytas

1. **En klassificering som `advisory` får aldrig upphäva en röd fryst grind eller dölja
   en verklig säkerhetsbrist.** Är en grind röd är utfallet rött oavsett hur fynden
   klassificerats. Klassificeringen styr *routning av prosa*, aldrig *grindens dom*.
2. **Modellens bedömning ersätter inte de mekaniska grindarna.** Fältet avgör vad som
   startar en reparationsrunda — inte vad som är sant.

### ⚠️ Detta rör en fryst yta

`docs/loop/codex-autopilot-report.schema.json` läses av **fyra frysta exitprov**:

```bash
grep -rln "blocking_findings" verify/bin/
# verify/bin/h-031-exit · h-032-exit · h-035-exit · h-038-exit
```

Plus `controller/attest/cli`, `specs/tasks.spec.json` och autopiloten.

**Konsekvenser som måste hanteras, inte upptäckas:**

- Ändringen får **inte** smygas in av en builder. Den går genom `$nortropic-test-author`
  (fryser nytt gate) → `$nortropic-builder`, enligt `AGENTS.md`.
- Håll ändringen **strikt additiv**: nya properties, befintlig `required`-mängd orörd.
  Rotens `additionalProperties: false` betyder att varje nytt fält måste in i schemat
  innan någon producent får skicka det — **schema först, producenter sedan.**
- Kontrollera de fyra frysta proven **före** ändringen. Bryter den något av dem är det
  en omfrysning, och då gäller kostnadsresonemanget i `03-raddningsplan.md` steg 4 väg B.

---

## §3. Regel 3 — avslutat förblir avslutat

| Del | Innehåll |
|---|---|
| **Mekanism** | Återöppning kräver identifierad tidigare acceptans **och** ett specificerat skäl: nytt motbevis, ändrad förutsättning, eller en ändring som berör delen |
| **Fältändring** | En återöppning bär `reopen_basis` med referens till den tidigare acceptansen (commit-SHA eller beslutsloggsrad) och skälets klass |
| **Beteendet** | Samma förslag utan nytt underlag startar inte om arbetet. Ett nytt reproducerbart fel återöppnar den berörda delen |
| **Prov** | Ett identiskt förslag mot en avslutad task ska avvisas. Ett reproducerbart fel med `reopen_basis` ska släppas igenom |

**Avgränsning:** "avslutat förblir avslutat" betyder **inte** att föreskrivna
regressionskontroller hoppas över. Det som stängs är återöppning på tyckande — inte
kontrollen av att det stängda fortfarande håller.

---

## §4. Så stängs punkten

**Med en verifierad ändring i det befintliga arbetsflödet — inte med tre nya
paragrafer.**

Leverans:

1. Schemaändringen, additiv, frusen av test-author och granskad
2. Autopilotens routningsbeteende ändrat att läsa `basis` respektive `advisory_findings`
3. Mutationsprov per gren som bevisligen ger rätt utfall
4. Bevis att de fyra frysta proven fortfarande passerar
5. Rad överst i `docs/05-beslutslogg.md`

Saknas någon av dem står just den delen kvar som öppen. **Den får inte döljas av en
allmän grön status** — det är samma fel som `23/23 gröna`.
