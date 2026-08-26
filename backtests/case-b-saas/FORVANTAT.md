# CASE B — vad PASS betyder, och vad som ännu inte är prövat

Ankare: masterplanens **§26 Case B — B2B SaaS negative control**.

> *"PASS requires both: explicit absence of local leakage; positive activation of
> appropriate B2B/product/demo/trust/search semantics."*

**Två PASS-villkor, inte ett.** En sajt som bara undviker lokalt läckage har inte
passerat — den har bara låtit bli att göra fel. Case B kräver också att rätt semantik
faktiskt aktiverats.

---

## Lägesvokabulär

| Läge | Betydelse |
|---|---|
| `MEKANISK` | Påståendet är avgörbart ur fixturens egna kontraktsfält och de skeppade kontrakten. `scripts/check-backtest-fixtures.mjs` prövar det |
| `EJ KÖRD` | Påståendet kräver att fixturen konsumeras av en verklig körning (planner, bygge, grindar, eval). **Det är ODÖMBART, aldrig grönt** — och det är majoriteten |

**Backtesten är alltså FÖRBEREDD, inte GENOMFÖRD.** En grön körning av
`check-backtest-fixtures.mjs` bevisar att fixturen har rätt form och att varje fälla har
ett formulerat påstående — den bevisar ingenting om hur systemet beter sig.

---

## §26:s sex fällor

| ID | Fälla (planens ord) | Påstående som ska hålla | Läge |
|---|---|---|---|
| `B-T1` | *office address must not trigger local-search/NAP prominence* | Kontorsadressen i Malmö får aldrig ge ortssidor, NAP-prominens nära hero, `LocalBusiness`-schema eller lokal sökstruktur. Fixturen bär `seoLage: 'varumarke'` och `paket: []`; research §5 säger uttryckligen att adressen inte är ett upptagningsområde | `MEKANISK` (kontraktsfälten) + `EJ KÖRD` (den byggda sajten) |
| `B-T2` | *nationwide/EU service* | Geografin ska behandlas som räckvidd, aldrig som arbetsområde. Ingen ort får bli en sida, ingen restid får nämnas | `MEKANISK` (research §5 bär ingen belagd ort) + `EJ KÖRD` |
| `B-T3` | *no automatic GBP recommendation* | Handover/cutover får INTE innehålla Google Företagsprofil-checklistan. Vid `paket: []` ska de sektionerna utelämnas och ersättas av en mening om varför de inte gäller (S5:s paketvillkorade handover) | `EJ KÖRD` — kräver en HANDOVER-generering |
| `B-T4` | *BOOK_DEMO must not turn into ring/offert* | Primärhandlingen ska förbli `boka` med etiketten "Boka demo". Den får inte bli ring-CTA, flytande ringknapp eller offertformulär — och Gate 1 ska testa demokedjan, inte en telefonkedja | `MEKANISK` (`primaraktion` + `gate1Test`) + `EJ KÖRD` (byggd CTA) |
| `B-T5` | *B2B trust comes from product/case/security/expertise* | Förtroendekvitton ska vara ISO 27001, kundcase, DPA, drifthistorik och integrationspartners — aldrig stjärnbetyg, aldrig F-skatt, aldrig lokala citeringar | `MEKANISK` (`kvitton` + `forbjudnaPastaenden`) + `EJ KÖRD` (renderad kvittosektion) |
| `B-T6` | *no F-skatt/local-review/truck/carpenter assumptions* | Ingen hantverkarsemantik får läcka in: inga F-skatt-kvitton, inga omdömesstjärnor, inga fordons- eller arbetsplatsbilder, inget hantverkarvernacular i copyn | `MEKANISK` (fixturens fält) + `EJ KÖRD` (copy och bildval) |

## `B-GAP-2` — ÅTGÄRDAT 2026-08-26: fixturen ger nu SIGNALER, inte SLUTSATSER

Fyra av sex fällor gick inte att spänna, eftersom researchen levererade svaret.
`§6` sa *"uttrycklig frånvaro … kunden vill inte ha någon Google Företagsprofil"* (T3),
`§4` sa *"ingen ring-nu-signal … finns"* (T4), `§7` sa *"inga fordonsbilder"* (T5/T6).
**Case B prövade då att systemet kan KOPIERA en slutsats, inte att det kan DRA den** — samma
svaghet §26 varnar för på utsidan, en sajt som klarar varje fälla genom att vara
innehållslös, fast flyttad in i indata.

Researchen bär nu råmaterialet. **Slutsatserna står här, där de hör hemma**, som det
systemet SKA komma fram till — och som det går att ha fel om.

| Signal i researchen (rå) | Slutsats systemet ska DRA | Vad ett fel ser ut som |
|---|---|---|
| §6: en Google Företagsprofil **finns och är oanspråkad**, med 40 visningar, 0 samtal, 0 vägbeskrivningar, 0 omdömen | Profilen är ingen förtroendeyta för den här kunden och ska inte aktiveras. `KAP-LOKAL-SEO` förblir inaktiv | Handover får en GFP-checklista därför att en profil "finns" — precis fälla `B-T3` |
| §1/§4: telefon 25 samtal mot formulärets 20 dialogstarter, men avsluten 6 av 9 via formuläret och 9 av 9 föregångna av bokad Cal.com-tid | Primärhandlingen är `boka`, trots att telefonen är störst i råtal | `primaraktion` blir `ring` på volymen — precis fälla `B-T4` |
| §6: köparnas upphandlingsunderlag begär ISO 27001, DPA, referenser, årsredovisning, pentest | Kvittona är produkt-/säkerhets-/casebaserade. **F-skatt nämns inte i indata alls** | F-skatt dyker upp som kvitto — då är det UPPFUNNET, precis fälla `B-T5` |
| §6: 0 träffar på Google-omdömen, ingen profil på Trustpilot/Reco/G2/Capterra, 4 automatgenererade katalogträffar | Inget synligt anseende att visa; frånvaron skrivs ut som observation, aldrig som lucka att fylla | Stjärnbetyg eller "omdömen kommer snart" — precis fälla `B-T6` |
| §7: en högupplöst, liggande **lastbilsbild** ligger i inventeringen med publiceringsgodkännande, bland fyra liggande hero-kandidater | Lastbilen väljs BORT som hero. Formatet kvalificerar den; semantiken diskvalificerar den | Fordonsbild som hero därför att den är den bästa liggande bilden — precis fälla `B-T6` |

**Den svåraste raden är telefonraden.** De övriga går att klara genom att avstå; den
kräver ett aktivt val mellan två kanaler där den förlorande har högst volym.

**Vad som fortfarande INTE prövas:** samtliga fem slutsatser är `EJ KÖRDA`. Att signalerna
nu är råa gör fällorna spännbara — det gör dem inte spända.

## `B-GAP-1` — det FÖRVÄNTADE stoppet, bokfört i förväg

`KAP-EXTERN-BOKNING` står `DECLARED`. Autobyggs beslutstaxonomi HARD-stoppar på obyggd
krävd capability, så en verklig Case B-körning **stannar innan `B-P2a` går att avgöra**.

**Det stoppet är härmed det FÖRVÄNTADE utfallet av en Case B-körning, inte en överraskning.**
Ett korrekt HARD_STOP är också ett prov: det prövar att taxonomin stannar på rätt ställe i
stället för att bygga vidare på en capability som inte finns.

| Utfall av en Case B-körning | Tolkning |
|---|---|
| HARD_STOP på `KAP-EXTERN-BOKNING`, med capabilityn namngiven i stoppskälet | **Förväntat.** `B-P2a` förblir `EJ KÖRD`; `B-P1`, `B-P2b`–`B-P2d` kan bedömas fram till stoppet |
| Körningen passerar och bygger en demokedja | **FYND.** Taxonomin har byggt på en `DECLARED` capability — allvarligare än ett uteblivet Case B |
| HARD_STOP på något annat | **FYND.** Stoppskälet är inte det förväntade och måste utredas före något annat |

Att lyfta `KAP-EXTERN-BOKNING` till `BUILT` är ett eget arbete och byter inte plats med
det här. Tills dess är stoppet utfallet.

## `B-T7` — DELVIS ÅTGÄRDAT 2026-08-26

Case B avslöjade att den universella kärnan själv bar lokala antaganden — fixturen gick
inte att fylla i utan tyst avvikelse. Fyndet är nu **rättat i kontrakten**, inte bara
bokfört.

| ID | Var | Vad | Läge |
|---|---|---|---|
| `B-T7a` | Researchkontraktet, universella ryggraden | §1 krävde `NAP` · §5 krävde belagda arbetsområden · §6 räknade upp `F-skatt`, omdömen med exakt antal och arketypen `NYSTARTAD — person-först` · §12 krävde `2–3 lokala` · §16 frågade efter `namn+ort`. **§26 fälla 6 lyder ordagrant *"no F-skatt/local-review/... assumptions"* — antagandet fällan finns för att fånga stod i kärnan.** Samtliga flyttade till `packs/lokal-se/research-module.md` v1.1.0, oförändrade i sak. Kontraktet är v3.1.0 | `DELVIS ÅTGÄRDAT` |
| `B-T7b` | Site Quality Contract v2 | `primaraktion`-enumet var ord för ord `lokal-se`:s slutna mängd, så **§26 fälla 4 (*"BOOK_DEMO must not turn into ring/offert"*) inte gick att spänna — kärnan hade ingen BOOK_DEMO att bli.** Enumet är utvidgat med `demo`, `prova`, `nedladdning`, `kontakt`; `lokal-se` skärper tillbaka. `schemaTyp` har ingen lokal default. Lead-ämnesradens `i <ort>` är villkorad. Kontraktet är v1.3.0 | `DELVIS ÅTGÄRDAT` |

**VAD SOM ÅTERSTÅR — och varför det inte är mitt att stänga.** Kontrakten är
universaliserade; deras PRODUCENT är det inte. `agents/project-planner.md`:s INPUT GATE
kräver fortfarande **`≥1 ort`** — och det kravet är **regel 5 i `docs/03-regelverk.md`,
en §A1-invariant**, mekaniskt nekad för agentredigering. En nationell eller
gränsöverskridande kund som Kadensa stoppas alltså vid nod 2, oavsett hur universellt
kontraktet är formulerat. Därtill står `LocalBusiness` kvar som schemaexempel i kärnans
SEO-block, `business.ts` beskrivs som NAP-facit mot Google Företagsprofil, och
`KAP-SCHEMA`:s kravkolumn kräver NAP-identitet.

**Nästa transition är en ägarhandling:** regel 5:s femte fält behöver bli
paketvillkorat — `≥1 ort` när ett ortspaket är belagt, annars belagd räckvidd i någon
form. Det är en §A1-ändring och kräver HÖGRISK-ceremoni.

**Regressionen i det som ÄR stängt är mekaniskt vaktad.** `scripts/check-karn-universalitet.mjs` fäller om
någon av de sex flyttade termerna återvänder till ryggraden — och lika hårt om en term
försvunnit ur BÅDA, eftersom det inte är en universalisering utan ett lättat krav.

**Ärlig gräns:** vakten prövar sex namngivna termer. Att kärnan är universell i stort är
inte bevisat — mängden är uppräknad, inte uttömmande.

## De två PASS-villkoren

§26: *"PASS requires both: explicit absence of local leakage; positive activation of
appropriate B2B/product/demo/trust/search semantics."* **Två villkor, inte ett.** En sajt
som bara undviker lokalt läckage har inte passerat — den har låtit bli att göra fel.

| ID | Villkor | Läge |
|---|---|---|
| `B-P1` | **Explicit frånvaro av lokalt läckage.** Ingen av `B-T1`…`B-T6` fälls, och frånvaron är RAPPORTERAD som korrekt — inte som ett fynd. Gate 5:s paketlins får inte köras alls | `EJ KÖRD` |

## Namngiven lucka

| ID | Lucka | Status | Nästa transition |
|---|---|---|---|
| `B-GAP-2` | **Fixturen skrev ut svaret på fyra av sex fällor** — Case B prövade då kopiering, inte härledning | `ÅTGÄRDAT 2026-08-26` | Researchen bär nu råa signaler (oanspråkad GFP med noll värde · telefon 25 mot formulär 20 · lastbilsbild bland hero-kandidaterna · inget omnämnande av F-skatt); slutsatserna står i avsnittet `B-GAP-2` ovan. **Kvarstår:** samtliga fem slutsatser är `EJ KÖRDA` — spännbara, inte spända |
| `B-GAP-1` | `KAP-EXTERN-BOKNING` är `DECLARED`, så en körning HARD-stoppar innan `B-P2a` går att avgöra | `BOKFÖRT 2026-08-26` | Stoppet är nu det FÖRVÄNTADE utfallet med en utskriven tolkningstabell (se avsnittet `B-GAP-1` ovan) — ett korrekt HARD_STOP är också ett prov. **Kvarstår:** att lyfta capabilityn till `BUILT` är ett eget arbete |

**`B-P2` är den halva som är lättast att glömma** — en sajt kan klara varje fälla genom att
vara innehållslös. Den är därför uppdelad i fem rader med namngiven fällare, samma form som
Case A:s defektkatalog. En rad utan fällare är prosa, inte ett prov.

| ID | Positivt villkor | Ska fällas av | Läge |
|---|---|---|---|
| `B-P2a` | Demokedjan fungerar end-to-end: hero-CTA → kvittosida → bekräftad tid i Cal.com, och leaden når `LEAD_TO_EMAIL` | Gate 1 (primärhandlingsgrinden) mot `gate1Test` | `EJ KÖRD` |
| `B-P2b` | Varje resa i `obligatoriskaResor` som INTE är primärhandlingen når sitt kontrakterade slut | Reselinsen `journeys` (S5) | `EJ KÖRD` |
| `B-P2c` | Kundcasens mätta utfall är attribuerade till KUNDEN, aldrig till Nortropic eller till sajten | Trust-linsen mot `kvitton[].attribution` | `EJ KÖRD` |
| `B-P2d` | Sökstrukturen är varumärkes-/tjänstebaserad: inga `[tjänst] i [stad]`-URL:er, unika title/meta per sida, `SoftwareApplication`-schemat validerar | Gate 5:s UNIVERSELLA kärna (paketlinsen ska inte köras alls) | `EJ KÖRD` |
| `B-P2e` | Säkerhets- och integrationsinnehållet finns som egna sidor och nämner ISO/IEC 27001, DPA och de två namngivna TA-systemen | Faktatroheten (`HG-1`-familjen) mot research §6/§10 — ett kvitto som saknas på sajten är inte ett fel, men ett som PÅSTÅS utan täckning är | `EJ KÖRD` |

---

## Mekaniska påståenden om fixturen själv

| ID | Påstående |
|---|---|
| `B-M1` | Kontrollraden är `pack=core-only` och `pack_module=none`, och research bär INGA paketmodulsektioner (`L1`…`Ln`) |
| `B-M2` | Kontrollradens `status=KOMPLETT` är förenlig med kärnans lag 1: samtliga obligatoriska universella fält är `ja` |
| `B-M3` | `osakra` i kontrollraden matchar antalet distinkta `[OSÄKER]`-märkta fält i filen (kontrollradens lag 2: den nollställer aldrig sig själv) |
| `B-M4` | `profile.ts` bär samtliga fältnamn ur Site Quality Contract v2, extraherade ur den skeppade `skills/nortropic-stack/SKILL.md` — aldrig ur en omskriven kopia |
| `B-M5` | `paket: []`, `seoLage: 'varumarke'`, `primaraktion.typ: 'boka'`, `statelesshet.hallerTillstand: false`, `schemaTyp` är INTE en `LocalBusiness`-subtyp |
| `B-M6` | Ingen kapacitetsrad aktiverar `KAP-LOKAL-SEO` |
| `B-M7` | Varje fält i `belaggspekare` pekar på en research-sektion som finns i filen |
| `B-M8` | Fixturen är märkt `testklient: true` och som SYNTETISK i båda filerna (regel 14) |

---

## Vad denna fixtur ALDRIG får användas till

- **Befordringsevidens.** Syntetisk evidens bär aldrig något över `VALIDATING`
  (`docs/06-scope.md`, §A9-skyddad statussemantik). En grön Case B gör inte `lokal-se`
  eller kärnan `PROVEN`.
- **Verklig indexering.** `testklient: true` + noindex är krav, inte fynd (regel 14).
- **Att ersätta en riktig kund.** Case B prövar att arkitekturen inte ANTAR lokal; bara en
  verklig icke-lokal kund visar att den FUNGERAR för en sådan.
