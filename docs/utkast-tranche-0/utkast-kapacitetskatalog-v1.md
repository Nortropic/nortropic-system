> **UTKAST — TRANCHE 0 (2026-08-24). EJ PRODUKTION, EJ AUKTORITET.**
> Design-utkast enligt den DESIGN-FRUSNA masterplanen. Konsumeras av INGENTING
> före FOUNDATION_REPAIR_GATE; skarp version landar i sin riktiga hemvist i S1+.

# Kapacitetskatalog v1

**Katalogversion: v1.0.0-UTKAST**

> Semver. PATCH = formulering/signaltillägg · MINOR = ny post eller nytt krav-hem · MAJOR = ändrad statusvokabulär, statuslag eller borttagen post. `content/profile.ts` v2 stämplar `katalogVersion` — kapacitetsbeslut spåras alltid mot den katalog de fattades mot. Skarp hemvist: `packs/kärna/kapacitetskatalog.md`.

**§A-not (koherens-patch #11, option A):** katalogen införs som VANLIG DOKUMENTATION; statussemantiken blir §A-skyddad först vid H-2-ceremonin. Detta utkast är papper.

## Definition

En **kapacitet** = en enhet av sajtkompetens som fabriken kan **leverera OCH oberoende verifiera** — ovanför kalibreringsvärden (färg, röst, motion-nivå), under branscher. Arketyper är namngivna kapacitetskompositioner i paketens strategimoduler — aldrig hårda lådor.

**Anti-tagg-vakten (mekanisk):** en post är OGILTIG utan alla tre:
1. **≥1 aktiveringssignal** (vad i research/brief som tänder den),
2. **≥1 verifierbart krav med `hem`** — en EXISTERANDE grind- eller eval-förankring (eller explicita krav-notes för DECLARED),
3. **status** ur vokabulären nedan.

**Funktionell, aldrig industriell — lackmustestet:** *"skulle två företag i olika branscher behöva samma kapacitet?"* Ja ⇒ giltigt namn. Nej ⇒ det är paketinnehåll, inte en kapacitet.

Universella alltid-på-kvaliteter (faktatrohet, a11y, säkerhet, prestanda) är **INTE** poster — de bor i rubrikens kärna och grindarna.

## Statusvokabulär

| Status | Betydelse |
|---|---|
| `DECLARED` | papper — designad, aldrig byggd; byggs vid första ja, offereras separat |
| `BUILT` | maskineriet finns, noll verkliga kunder |
| `VALIDATING` | ≥1 verklig kund lanserad; EVAL-RESULT + grindhistorik namnges i raden |
| `PROVEN` | Sonnet-trappan-identisk tröskel — se nedan |
| `ROUTE-OUT` | levereras aldrig; raden bär en NAMNGIVEN hänvisning |

**PROVEN-tröskeln (avsiktligt identisk med Sonnet-trappan):** ≥2 på varandra följande verkliga kunder · eval ≥90 under samma rubrik-MAJOR · noll post-launch-grindmissar · verify-suite grön. **Degraderingsspegeln:** första missen ⇒ tillbaka till VALIDATING. Främjandebevis = pekare till EXISTERANDE artefakter (EVAL-RESULT, launch-domslut, STEWARD-REPORT-rader, suite-resultat). LEARNING-RECORD är ALDRIG främjandebevis (anti-Goodhart-placeringslagen).

**GD4 — syntetiska taket:** syntetiskt bevis (gym, fixturer, domare) bär en kapacitet till högst `VALIDATING`. `PROVEN` kräver alltid verkliga kunder vid tröskeln ovan.

**Fail-closed-formuleringar (D4):** KRÄVS-signal mot `ROUTE-OUT` ⇒ befintligt scope-nej-flöde (STRATEGISK fråga, obemannat stoppar, hänvisning). KRÄVS mot `DECLARED`/`BUILT` ⇒ ärlig brief-formulering: *"kapacitet X ej tillräckligt validerad — offereras separat eller valideras i detta projekt med ägarbeslut."*

## Statefulness-lagen

**Stateful ⇒ ROUTE-OUT — strukturellt, ingen bedömningsfråga** (spegel av Del-C static-guard). Skarpa regeln: *"håller sajtrepot state som operatören måste förvalta? ja = mjukvaruprodukt (route-out/separat offert), nej = webbplats."* Klassvärden i tabellen:

- `STATELÖS` — ingen server-state alls (enda serverkoden är lead.ts).
- `STATELÖS-EXTERN` — extern SaaS/embed bär staten (bokning, karta, GBP); innanför vallgraven per D8. (06-scope-förtydligandet är ägarbeslut 9 — katalogen antar att det landar.)
- `STATEFULL` — state i eget repo/drift ⇒ ROUTE-OUT, alltid.

## Katalogen (initial population)

**Kolumner:** id · status · statefulness · aktiveringssignaler (kort) · krav-hem (pekare) · route-out-hänvisning.

### Sajtkapaciteter — VALIDATING\* (rorjour-härledda; se asterisken)

| id | status | statefulness | aktiveringssignaler | krav-hem | hänvisning |
|---|---|---|---|---|---|
| `ring-konvertering` | VALIDATING\* | STATELÖS | kunder ringer; tel synligt; akutbransch | Gate 1 (utfall) + rubrik v3 krit. 1 ring-delkraven | — |
| `lead-formular` | VALIDATING\* | STATELÖS | offert-/förfrågansmönster i §4/lokal.1 | Gate 1 + `lead.ts`-kontraktet (nortropic-stack) | — |
| `lokal-sokbarhet` | VALIDATING\* | STATELÖS | ortsbunden efterfrågan; "[tjänst] i [stad]" | Gate 5-paketlins (grind-linser, S5) + rubrik v3 krit. 5 → lokal-se eval-modul vid v4 | — |
| `gbp-narvaro` | VALIDATING\* | STATELÖS-EXTERN | GBP finns/bör finnas; lokal kund | GBP-checklista A–G (`nortropic-seo-lokal` refs) + cutover-faser | — |
| `citations-katalog` | VALIDATING\* | STATELÖS-EXTERN | lokal synlighet krävs | citation-listan (`nortropic-seo-lokal`) + handover-leverabel | — |
| `omdomen-visning` | VALIDATING\* | STATELÖS | omdömen finns + publiceringstillstånd | rubrik v3 krit. 10 + `testimonials.ts`-kontraktet | — |
| `karta-embed` | VALIDATING\* | STATELÖS-EXTERN | fysisk plats; hitta-hit-behov | component-patterns: samtyckesgrindad kartfasad | — |
| `rot-prisvisning` | VALIDATING\* | STATELÖS | ROT-bransch + kundens prisuppgifter | Faktatrohet-grinden + rubrik v3 krit. 2 | — |

### Sajtkapaciteter — BUILT (maskineri finns, aldrig skeppat till verklig kund)

| id | status | statefulness | aktiveringssignaler | krav-hem | hänvisning |
|---|---|---|---|---|---|
| `extern-bokning` | BUILT | STATELÖS-EXTERN | bokningssystem används/önskas (extern tjänst) | Gate 1 boka-delkraven (rubrik v3 krit. 1, boka-fallet) | — |
| `hitta-hit-besok` | BUILT | STATELÖS | fysiskt besöksmål; besök-primärhandling | Gate 1 besök-delkrav + öppettider i schema | — |
| `portfolio-galleri` | BUILT | STATELÖS | bildmaterial + case finns | bildspår/slot-tabell (`nortropic-bild`) + rubrik v3 krit. 10 | — |

### Sajtkapaciteter — DECLARED (papper; byggs vid första ja, offereras separat)

| id | status | statefulness | aktiveringssignaler | krav-hem | hänvisning |
|---|---|---|---|---|---|
| `flersprakighet` | DECLARED | STATELÖS | flerspråkig målgrupp belagd | krav-notes: hreflang-ref; "flerspråkigt ≠ översätta strängar" | — |
| `nyhetssektion-statisk` | DECLARED | STATELÖS | innehållsflöde önskas, statiskt räcker | krav-notes: statisk MDX; Del-C-guard | — |
| `statisk-priskalkylator` | DECLARED | STATELÖS | prislogik enkel nog för statisk | krav-notes: Del-C-guard + Faktatrohet | — |
| `migrering-innehall` | DECLARED | STATELÖS | befintlig sajt ersätts (§7/estate-rader) | krav-notes: **redirect-karta = lanseringsblockerare** (prelaunch-rad vid aktivering; "förstör aldrig digitalt kapital") | — |
| `migrering-sokprofil` | DECLARED | STATELÖS-EXTERN | indexerade URL:er/backlinks (estate: `site:`-kontrollen) | krav-notes: metadata-kontinuitet, GSC-kontinuitet, analytics-baslinje | — |
| `avveckling` | DECLARED | STATELÖS | EOL-behov | krav-notes: redirects, arkiv, dataexport, DNS, credential-revokering, slutbevis | — |

### Närvarokapaciteter — DECLARED (Part 2e/2f; aktiveras via presence-kontraktet, separat program)

| id | status | statefulness | aktiveringssignaler | krav-hem | hänvisning |
|---|---|---|---|---|---|
| `narvaro-gbp` | DECLARED† | STATELÖS-EXTERN | kunden vill ha förvaltad GBP | krav-notes: GBP-checklista A–G (manuell rutin FINNS) | — |
| `narvaro-gsc` | DECLARED† | STATELÖS-EXTERN | GSC-signalloop önskas | krav-notes: gsc-launch-steps + månadsrutinen (manuell rutin FINNS) | — |
| `narvaro-analytics` | DECLARED | STATELÖS-EXTERN | mätning utöver default | krav-notes: CHECKLISTA-ANALYTICS-SETUP (helt människoexekverad i dag) | — |
| `narvaro-annonser-google` | DECLARED | STATELÖS-EXTERN | annonsbudget + kontraktets finansiella auktoritet | krav-notes: bounded spend; asset/signal-feeder, aldrig budoptimering | — |
| `narvaro-meta` | DECLARED | STATELÖS-EXTERN | Meta-kanal önskas | krav-notes: business-verifiering gated; manuell fallback | — |
| `narvaro-rykte` | DECLARED | STATELÖS-EXTERN | omdömesflöde att förvalta | krav-notes: aldrig gating/incitament/fabricering | — |
| `narvaro-innehall` | DECLARED | STATELÖS | innehållsförvaltning önskas | krav-notes: anti-content-mill-lagen | — |
| `narvaro-leads` | DECLARED | STATELÖS-EXTERN | kunden aktiverar leadhantering | krav-notes: Part 2e Q–R leadflöde | — |

*(† = manuella checklistor existerar och används — som katalogförda, oberoende verifierbara kapaciteter är posterna ändå DECLARED tills krav-hem med grindförankring finns. `narvaro-webbplats` är fabrikens kärnprodukt och katalogförs inte som egen rad — den ÄR sajtkapaciteterna ovan.)*

### Livscykel/service/handel — DECLARED med krav-notes (Part 2f)

| id | status | statefulness | aktiveringssignaler | krav-hem | hänvisning |
|---|---|---|---|---|---|
| `livscykel-epost` | DECLARED | STATELÖS-EXTERN (Resend bär sändning) | reaktivering/påminnelser/review-ask önskas | krav-notes: leveransgolv SPF/DKIM/DMARC, one-click-unsub, <0,3 % klagomål; samtycke/suppression | SMS-påminnelser → Brevo (route-out) |
| `kundservice-agent` | DECLARED | STATELÖS-EXTERN | kunden aktiverar service-agent | krav-notes: svarar ur verifierad kundsanning; klagomål/juridik/medicin eskalerar alltid | — |
| `handel-paketdesign` | DECLARED (endast pappersform) | — | ägar-RINGBESLUT krävs FÖRE aktivering | krav-notes: produktsanning en-källa → sajt/Merchant/Meta/Shopify; Shopify äger order/lager/checkout | de statefulla delkapaciteterna förblir ROUTE-OUT nedan |

### ROUTE-OUT (levereras aldrig; namngiven hänvisning — Ring 3, vallgravsbeslutet står)

| id | status | statefulness | aktiveringssignaler | krav-hem | hänvisning |
|---|---|---|---|---|---|
| `kundvagn` | ROUTE-OUT | STATEFULL | vill sälja online (§9/§11-observation) | — | **Shopify** |
| `kassa-betalning` | ROUTE-OUT | STATEFULL | onlinebetalning krävs | — | **Shopify** (checkout) |
| `kundinloggning` | ROUTE-OUT | STATEFULL | inloggade ytor/kundkonton | — | **separat systemutvecklingsoffert ("Railway-klass")** |
| `medlemskap` | ROUTE-OUT | STATEFULL | medlemsdata/medlemsytor | — | **laget.se** (förening) / systemutvecklingsoffert |
| `bokningsmotor-egen` | ROUTE-OUT | STATEFULL | egen bokningslogik i repot | — | **extern bokningstjänst** → kapacitet `extern-bokning` |
| `anvandargenererat-innehall` | ROUTE-OUT | STATEFULL | UGC/kommentarer/uppladdningar | — | **systemutvecklingsoffert / extern plattform** |
| `foreningsplattform` | ROUTE-OUT | STATEFULL | föreningsdrift (medlemmar, lag, kallelser) | — | **laget.se** |

## Ärlig paketstatus: lokal-se = VALIDATING\*

**Asterisken:** lokal-se-paketet som helhet är `VALIDATING` — **inte "certifierad", och med tunt aktuellt bevisläge:**

- En produktions-nära sajt (rorjour-stockholm) byggdes — **på en annan maskin**; FIRST-REAL-LAUNCH-ceremonin är aldrig genomförd; verify-suiten är ODÖMBAR på denna maskin (S0 avgör).
- **Post-FIXTURE_REGIME_CHANGE är det historiska bevismaterialet PENSIONERAT som aktuellt bevis.** Bevis-/krav-kolumnerna ovan citerar därför ENBART det som existerar nu: grind-/rubrik-förankringar, skill-referenser och kontraktsfiler i repot — inga historiska eval-totaler åberopas som levande evidens. Det aktuella bevisläget för VALIDATING\*-raderna är ärligt talat tunt; det tjocknar först med nästa verkliga kund under de nya kontrakten.
- Promotion till PROVEN kan därför ENDAST ske framåt: nya verkliga kunder vid Sonnet-trappan-tröskeln, aldrig via retroaktiv åberopan av pensionerad evidens.

## Explicit uppskjutet

- **JSON-spegel + doctor-kontroller: DEFERRED** tills en mekanisk konsument finns (röd-lag-domslut: ingen konsument vid n=1). Markdown-tabellen ÄR v1.
- Kapacitetsgraf med kanter: NEEDS_EVIDENCE, trigger ≥3 ömsesidigt beroende paket.

## Changelog

- **v1.0.0-UTKAST (2026-08-24)** — initial population ur repobevis per masterplanen Part 1 §2 + Part 2d L (migrering/avveckling) + Part 2e A (närvaro) + Part 2f C–H/W (livscykel/service/handel): 8 VALIDATING\*, 3 BUILT, 17 DECLARED, 7 ROUTE-OUT. Statusvokabulär, PROVEN-tröskel (Sonnet-trappan-identisk), GD4-tak, statefulness-lag, anti-tagg-vakt. EJ PRODUKTION.

## Öppna frågor till ägaren

1. **`narvaro-gbp`/`narvaro-gsc`-status:** manuella checklistor existerar och används (planen kallar dem "BUILT-som-manuella-checklistor"); katalogutkastet stämplar DECLARED† eftersom oberoende verifierbara krav-hem saknas. Välj: DECLARED† (utkastets linje) eller BUILT med rutin-som-hem.
2. **Pensionerad evidens som HISTORIK:** får VALIDATING\*-rader alls nämna rorjour-evalen som märkt historik ("historik, pensionerad — ej levande bevis"), eller ska raderna vara helt tysta om pre-FIXTURE_REGIME_CHANGE-material? Utkastet nämner den endast i asterisk-noten.
3. **Ägarbeslut 9 förutsätts:** `STATELÖS-EXTERN`-klassen (klient-side + extern-SaaS-buren state innanför vallgraven) antar 06-scope-förtydligandemeningen. Bekräfta.
4. **Handelns representation:** utkastet håller de statefulla delkapaciteterna ROUTE-OUT och lägger paketdesignen som `handel-paketdesign` DECLARED-endast-papper (aktivering kräver ringbeslut, beslut 44). Bekräfta att detta inte läses som en öppnad Ring-3-dörr.
5. **`platsförfrågan` eget id:** lokal-se-modulen mappar platsförfrågan → `lead-formular`. Räcker etikett/gate1Test-differentiering, eller ska katalogen få `platsforfragan-formular` som egen rad?
