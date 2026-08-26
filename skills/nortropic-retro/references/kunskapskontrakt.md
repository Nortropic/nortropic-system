# Kunskapskontraktet — anspråksstegen, mallarna och radarn (K2 + K3)

Styrningen bor i [`docs/kunskapsbanan.md`](../../../docs/kunskapsbanan.md). Denna fil
bär FORMATEN: hur ett anspråk uttrycks, hur ett experiment ställs upp, hur en konflikt
registreras, och hur radarn körs.

**Hela banan är PROPOSE-ONLY.** Ingenting här skriver i en standard.

## ANSPRÅKSSTEGEN — en enda livscykel

```
OBSERVED → CORROBORATED → LOCALLY_REPLICATED → LOCALLY_PROVEN → ADOPTED
                                                                   ⇅
                                                              CHALLENGED → DEPRECATED | SUPERSEDED
```

| Steg | Vad som krävs för att stå här |
|---|---|
| `OBSERVED` | Sett en gång. Födelseläget för varje anspråk |
| `CORROBORATED` | Sett igen, oberoende — annan kund, annan källa, annan mätning |
| `LOCALLY_REPLICATED` | Reproducerat i VÅR miljö, inte bara läst hos någon annan |
| `LOCALLY_PROVEN` | Reproducerat OCH utfallet höll i vår kontext över tid |
| `ADOPTED` | Promoterat av ägaren till norm. **Endast människan flyttar hit** |
| `CHALLENGED` | Ett adopterat anspråk har fått motbevis; det gäller ännu men är under prövning |
| `DEPRECATED` | Gäller inte längre, och inget ersätter det |
| `SUPERSEDED` | Ersatt av ett namngivet nyare anspråk |

**SCOPE ÄR OBLIGATORISKT PÅ VARJE STEG.** Ett anspråk utan giltighetsomfång är inte
ett anspråk — det är en känsla. `"okänt"` är ett giltigt omfång; frånvaro är det inte.
Detta är samma anti-universaliseringsvakt som lärdomskandidaterna bär i §Erfarenhet:
ett anspråk som råkar stämma för en kund blir annars tyst en regel för alla.

**Stegen hoppas aldrig över.** Ett anspråk kan inte gå från `OBSERVED` till `ADOPTED`
för att det låter rimligt. Och nedgradering är lika legitim som uppgradering — en väg
som bara går uppåt mäter inte, den ackumulerar.

## MALL: ANSPRÅK

```markdown
### ANSPRÅK <id>
- **Påstående:** en mening.
- **Steg:** OBSERVED | CORROBORATED | LOCALLY_REPLICATED | LOCALLY_PROVEN | ADOPTED | CHALLENGED | DEPRECATED | SUPERSEDED
- **Omfång (OBLIGATORISKT):** för vilka kunder/branscher/kontexter gäller det? "okänt" är giltigt.
- **Belägg:** pekare — källregister-id, EVAL-RESULT, grindhistorik, AGENT-LOG, LEARNING-RECORD-rad.
- **Verklighetsklass:** SYNTETISK | PRODUKTION | ANVÄNDARE | DOMÄNEXPERT
- **Rubrik-kriterium:** vilket kriterium detta skulle påverka (annars "nice-to-have, avvakta").
- **Vad som skulle falsifiera det:** om ingenting kan — det är inte ett anspråk.
```

## MALL: EXPERIMENT

```markdown
### EXPERIMENT <id>
- **Frågan:** vad vi faktiskt vill veta.
- **Prövar anspråk:** <anspråks-id>
- **Uppställning:** vad som varieras, vad som hålls fast, hur många fall.
- **Förutbestämt utfall:** vad som räknas som stöd RESPEKTIVE motbevis — skrivet FÖRE körning.
- **Volymgräns:** vid SMB-trafik är A/B uttryckligen icke-rekommenderat; säg vilken volym som krävs.
- **Utfall:** fylls i efteråt — eller `ODÖMBART` med orsak. ODÖMBART är aldrig grönt.
```

Ett experiment vars utfallskriterium skrivs EFTER körningen mäter inte något; det
motiverar. Därför är fältet obligatoriskt före.

## MALL: KONFLIKT

```markdown
### KONFLIKT <id>
- **Fråga:** vilken FRÅGA de tvistar om (auktoritet är frågeberoende).
- **Part A:** källa/anspråk + vad den säger.
- **Part B:** källa/anspråk + vad den säger.
- **Vem har auktoritet över just DENNA fråga:** med skäl.
- **Läge:** ÖPPEN | AVGJORD | ODÖMBAR
- **Beslut:** endast om AVGJORD, med vem som avgjorde.
```

**En konflikt registreras, aldrig tyst upplöst.** Att välja den bekvämare källan och
gå vidare är hur ett system får åsikter ingen kan härleda. `ODÖMBAR` är ett hedervärt
läge.

## RADAR v1 (K3)

**Ett månatligt matsmältningsorgan — inte ännu ett notisflöde.** Radarn finns för att
göra omvärldsförändring till NÅGOT FÅ BESLUT, inte till en ström.

**Under bootstrap är radarn ÄGARTRIGGAD.** Den startar inte av sig själv, den har
ingen kadens som löper utan människa, och den är **propose-only ALLTID** — även efter
bootstrap. Den skriver ALDRIG direkt i en standard.

### Rörledningen — i ordning

```
källa förfallen → ändringsdetektering → citerad delta → materialitet → påverkan
                → routing: FÖRSLAG | KUNSKAPSKANDIDAT | EXPERIMENT | BEVAKA
```

1. **Källa förfallen** — volatiliteten i registret säger när en källa ska ses över.
2. **Ändringsdetektering** — den metod registret namnger för just den källan.
3. **CITERAD DELTA** — vad som faktiskt ändrats, **ordagrant citerat med plats**.
   En parafras duger inte: den bär redan vår tolkning in i beslutet.
4. **Materialitet** — rör ändringen något vi faktiskt gör? De flesta gör inte det,
   och att säga så är ett fullgott radarutfall.
5. **Påverkan** — vilka operativa vägar berörs (registrets `operativaVagar`).
6. **Routing** — exakt ett av fyra utfall:
   - **FÖRSLAG** — konkret ändring i vitlistad yta, genom vanliga förslagsflödet.
   - **KUNSKAPSKANDIDAT** — nytt anspråk på steget `OBSERVED`.
   - **EXPERIMENT** — vi vet inte; ställ upp prövningen enligt mallen.
   - **BEVAKA** — verkligt men inte ännu materiellt; noteras med orsak.

### Radarns hårda gränser

- **Inga direkta skrivningar i standarder.** Utfallet är alltid ett förslag eller en
  anteckning.
- **Pekar ett fynd mot §A-yta** (konstitutionen, eval-rubriken, grindnivåerna,
  `tests/fixtures/`, `AUTOPILOT`, modellkontraktet) är enda tillåtna handlingen att
  **FLAGGA det för ägaren med källa och plats** — aldrig att formulera ändringen.
- **En tom radarkörning är ett GILTIGT utfall** och redovisas som tom. Att leta upp
  något att föreslå för att körningen ska kännas värd sin tid är precis motsatsen till
  vad organet är till för.
- **`nortropic-knowledge` är rådgivande bakland** — det får informera ett förslag och
  får aldrig bli körauktoritet.
