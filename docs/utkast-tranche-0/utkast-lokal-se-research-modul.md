> **UTKAST — TRANCHE 0 (2026-08-24). EJ PRODUKTION, EJ AUKTORITET.**
> Design-utkast enligt den DESIGN-FRUSNA masterplanen. Konsumeras av INGENTING
> före FOUNDATION_REPAIR_GATE; skarp version landar i sin riktiga hemvist i S1+.

# lokal-se — research-modul

**Modulversion: lokal-se@1.0.0-UTKAST (research-modul)**

> Semver per modul; paketets samlade version bor i `PAKET.md` (skarp hemvist: `packs/lokal-se/research-modul.md`). PATCH = formulering · MINOR = ny valfri rad · MAJOR = ändrad sektion, vokabulär eller kontrollradsrad. Modulen är underordnad kärnkontraktet (research-v3): **monotoni-lagen gäller — modulen får bara SKÄRPA, aldrig försvaga eller omdefiniera en universell rad.**

## Vad modulen är

Allt hantverkar-format ur research-prompt v2 som INTE är universellt, extraherat till paketinnehåll. Kärnan (17 sektioner) bär mekanismen; denna modul bär den svenska lokal-tjänst-substansen. Aktiveras när pakethypotesen är `Lokal` (heuristik + operatörshypotes vid onboarding — aktiveringssignalerna ägs av `PAKET.md`, peka dit) eller när kärnans §15 fail-closed-upptäckt kräver komplettering.

## Kompositionskonvention

- Modulen appenderar sina sektioner i research.md under rubriken:

```
## PAKETMODULER (lokal-se@1.0.0)
```

- **Prefixade sektions-ID:n `lokal.1`–`lokal.7`** — den universella numreringen 1–17 skiftar aldrig.
- Modulens kontrollradsrader läggs till i kärnans §17 med prefixade fält-ID:n (`lokal.telefon`, `lokal.ort`), samma maskinläsbara radformat: `- [PASS|SAKNAS] <fält-id>: <värde>`.

## Modulens sektioner

### lokal.1 Primärhandlingsvokabulär *(sluten — PAKETETS vokabulär, inte kärnans)*

När lokal-se är aktivt ska kärnans §4-kandidat DESSUTOM klassas mot den slutna listan:

`ring nu | boka tid | platsförfrågan | offert | besök (fysisk)`

En rads slutsats: trolig primärhandling = ett av värdena — **med källa per observation**. Hur konverterar kunder FAKTISKT i dag, med belägg: ringer de (nummer synligt var?), bokar de (vilket system?), DM:ar de (svarsmönster?), eller kommer de till en fysisk plats? Gissa inte; två motstridiga signaler = notera båda. `[OSÄKER]` tillåtet — frånvaro inte.

Mappning till §15-kapacitetssignaler (radformatet i kärnan §15):

| vokabulärvärde | kapacitet-id |
|---|---|
| ring nu | `ring-konvertering` |
| boka tid | `extern-bokning` |
| platsförfrågan | `lead-formular` |
| offert | `lead-formular` |
| besök (fysisk) | `hitta-hit-besok` |

### lokal.2 NAP & öppettider

Exakt företagsnamn, NAP (adress/telefon), öppettider, org-info i FB/GBP:s Om-sektion, omdömen (betyg + EXAKT antal + plattform), inläggsfrekvens och tonalitet, inlägg som visar utförda jobb, samt vilka kontaktvägar sidorna faktiskt erbjuder. NAP-konsistens mellan ytor observeras och avvikelser noteras (aldrig normaliseras — konflikt noteras, väljs aldrig). Nedströms är `content/business.ts` NAP-facit; researchen levererar underlaget.

### lokal.3 Kvitton-inventeringen *(lokal kvitto-vokabulär)*

Kartlägg förtroendekvitton med belägg: **F-skatt · certifikat med namn · utbildningar med skola + datum · försäkring · garanti · omdömen · portfolio/utförda jobb · fysisk plats · år i branschen.** Fynden fyller kärnans §6; NYSTARTAD-läget bor i kärnan (universellt) — modulen bidrar bara vokabulären. Attributionsregler (t.ex. "utbildning redovisas som utbildning, aldrig som utfall") sätts i briefens §7.4 — peka, kopiera aldrig.

### lokal.4 Priser & ROT-läge

Om branschen är ROT-relevant: timpris/prisexempel som kunden själv uppgett, hur ROT kommuniceras i dag, underlag för `rot-prisvisning`-signal i §15. Endast kundens egna prisuppgifter — priser fabriceras eller härleds aldrig ur konkurrentobservationer.

### lokal.5 IG-bildinventering *(lokal flavor)*

Kärnans §7 äger bildinventeringen universellt; modulen adderar hantverksflavor: antal inlägg; uppskattat antal ANVÄNDBARA foton (skarpa, dagsljus, **visar arbete/resultat**); motivtyper (jobb, före/efter, team, fordon, lokal); finns liggande bilder som klarar hero? highlights? bio-rösten? **Finns ett bra ansiktsporträtt av ägaren?** Avsluta med bedömning: "räcker materialet för foto-först-design, eller behövs ny fotografering?" — och flagga alltid rättighetsfrågan.

### lokal.6 Lokala konkurrenter

2–3 lokala konkurrenter i branschen + orten. Per konkurrent: URL, en mening om styrka/svaghet, synliga betyg. Ingen djupanalys. (Kärnans §12 "vad jämför användaren med" gäller parallellt — modulraden skärper till bransch+ort.)

### lokal.7 Designreferens-jakten — omdömesjakten

Lokal-tillägget till kärnans §13-recept, och det körs FÖRST: **Reco/Google Maps → företag i branschen med betyg ≥4,7 → deras sajter → footer-jakt** (vem byggde). Därefter kärnans universella recept. Per referens: URL + 2–3 meningars motivering kopplad till DENNA kunds material och röst.

## Kontrollradsrader (adderas till kärnans §17)

| fält-id | krav |
|---|---|
| `lokal.telefon` | ≥1 verifierat telefonnummer (var observerat) |
| `lokal.ort` | ≥1 belagd ort/arbetsområde |

- Raderna är **additiva** — de universella 6+1 raderna gäller oförändrat. Detta återskapar exakt v2:s grindnivå (telefon + ort) för lokalklienter, nu som paketlag i stället för universell lag.
- Någon SAKNAS ⇒ samma regel som kärnan: RÖTT överst, INPUT GATE stoppar.

## Vad modulen INTE bär

- Strategi (hantverkar-defaults, "[tjänst] i [stad]", profildefaults) → `strategi-modul.md`.
- Mätning/grindar (NAP-poäng, lokal SEO, GBP-linser) → `eval-modul.md` (§A2-klassad) + `grind-linser.md` (§A3-klassad).
- GBP-/GSC-checklistor → kvar i `skills/nortropic-seo-lokal/references/` (en hemvist; `PAKET.md` listar dem som paketleverabler).
- Juridikflaggor → `nortropic-plan/references/juridikflaggor.md` (§A4 en hemvist; peka, kopiera aldrig).

## Changelog

- **lokal-se@1.0.0-UTKAST (2026-08-24)** — första extraktion ur research-prompt v2: sluten primärhandlingsvokabulär (paketnivå), NAP/öppettider, kvitto-vokabulär, ROT-läge, IG-bildinventeringens lokala flavor, lokala konkurrenter, Reco≥4,7-jakten, kontrollradsraderna `lokal.telefon`/`lokal.ort`, §15-mappningstabell. EJ PRODUKTION.

## Öppna frågor till ägaren

1. **RUT:** v2 täcker "Priser / ROT-läge". Flera lokal-se-branscher är RUT-branscher (städ, trädgård, flytt). Ska lokal.4 heta "ROT/RUT-läge" och täcka båda avdragen, eller är RUT en MINOR-utökning senare?
2. **Reco ≥4,7-tröskeln:** ordagrant bevarad från v2. Bekräfta att tröskeln förblir paketlag som den är, eller om den ska omkalibreras vid första verkliga användningen under v3 (då som paket-PATCH med belägg).
3. **Platsförfrågan-mappningen:** både `platsförfrågan` och `offert` mappar till `lead-formular` (etikett/gate1Test skiljer dem nedströms). Godkänn, eller kräver platsförfrågan ett eget kapacitets-id i katalogen?
