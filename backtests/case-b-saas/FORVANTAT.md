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

## `B-T7` — fyndet fixturen gjorde INNAN den kördes

Case B avslöjade att **den universella kärnan själv bär lokala antaganden.** Det är inte en
fälla ur §26 — det är en observation fixturen tvingade fram genom att inte gå att fylla i
utan avvikelse. Inventeringen nedan är gjord med `fil:rad`, och den är **inte komplett**:
den listar de ställen som hittats, aldrig alla som finns.

| ID | Var | Vad | Läge |
|---|---|---|---|
| `B-T7a` | `skills/nortropic-plan/references/research-kontrakt-v3.md` — den UNIVERSELLA ryggraden | §6 kräver **`F-skatt`** som första förtroendekvitto — och §26 fälla 6 lyder ordagrant *"no **F-skatt**/local-review/... assumptions"*. §6 kräver även **omdömen (betyg + exakt antal + plattform)**; §26 namnger `local-review`. §1 kräver **NAP**; §26 fälla 1 handlar om NAP-prominens. §5:s substanskolumn är *"Belagda arbetsområden/orter"* — Case B måste svara med en förnekelse. §6 bär arketypen *"NYSTARTAD — person-först"*. §12 kräver *"2–3 **lokala** konkurrenter"*. §16 frågar efter *"omdömen … med **namn+ort**"* | `MEKANISK` — ankrad mot kontraktstexten, faller när ägaren rättar den |
| `B-T7b` | `skills/nortropic-stack/SKILL.md` — Site Quality Contract v2 | `primaraktion`-enumet är `'ring' \| 'boka' \| 'platsforfragan' \| 'offert' \| 'besok'` — **ord för ord `lokal-se`:s slutna mängd.** Det finns ingen `BOOK_DEMO`, ingen `prova gratis`, ingen `ladda ner`, och exempeletiketterna är *"Få kostnadsfri offert"/"Boka tid"*. **§26 fälla 4 lyder *"BOOK_DEMO must not turn into ring/offert"* — fällan går inte att spänna, för kärnan har ingen BOOK_DEMO att bli.** Kadensa tvingas mappa demobokning på `boka`. Därtill: `schemaTyp` definieras som *"(LocalBusiness-subtyp eller annan typ)"* — lokal typ först, allt annat restkategori · kärnscaffolden bygger `business.ts` (NAP-facit) för VARJE sajt, även `core-only` · lead-backendens ämnesrad interpolerar **`i <ort>` villkorslöst**, så en Kadensa-lead får *"Ny demobokning — \<tjänst\> i \<ort\>"* utan att någon ort finns | `MEKANISK` — ankrad mot kontraktstexten |

**Varför detta är fyndet och inte en anmärkning:** systemet kallar sin kärna universell och
sina paket specialiserande. Om kärnan bär `F-skatt`, `NAP`, ortsinterpolation och
`lokal-se`:s primärhandlingsenum är beskrivningen fel — och varje nytt paket byggs ovanpå
en lutning. Rättningen är en kontraktsövergång (researchkontrakt v3→v3.1, profilkontrakt
v1.2→v1.3) med pinnebump, och den är ägarens att beställa.

**Kontrollerna är ankrade i KONTRAKTEN, inte i den här filen.** När ägaren rättar dem
FÄLLER vakten och tvingar fram att raderna stryks — ett fynd får inte överleva sin egen
åtgärd.

## De två PASS-villkoren

| ID | Villkor | Läge |
|---|---|---|
| `B-P1` | **Explicit frånvaro av lokalt läckage.** Ingen av `B-T1`…`B-T6` fälls, och frånvaron är RAPPORTERAD som korrekt — inte som ett fynd. Gate 5:s paketlins får inte köras alls | `EJ KÖRD` |

## Namngiven lucka

| ID | Lucka | Status | Nästa transition |
|---|---|---|---|
| `B-GAP-2` | **Fixturen skriver ut svaret på fyra av sex fällor.** §26 kräver att SYSTEMET producerar *"explicit absence of local leakage"* — men researchen levererar redan slutsatsen: §6 säger *"Uttrycklig frånvaro … kunden vill inte ha någon Google Företagsprofil"* (T3), §4 säger *"ingen ring-nu-signal och ingen offertförfrågan-signal finns"* (T4), §7 säger *"Inga arbetsplatsbilder, inga fordonsbilder"* (T5/T6). **Case B prövar då att systemet kan KOPIERA en slutsats, inte att det kan DRA den.** Genuint spänd är bara T1 (Malmöadressen finns på riktigt) och `B-T7`. Det är samma svaghet §26 varnar för på utsidan — en sajt som klarar varje fälla genom att vara innehållslös — fast flyttad in i indata | `NOT_STARTED` | Råa signaler i stället för dragna slutsatser: en oanspråkad Google Företagsprofil som FINNS men inte används · telefonvolym 20 mot 25 i stället för 3 mot 41, så primärhandlingen kräver en avvägning · en fordonsbild i inventeringen som ska väljas bort. Slutsatserna flyttas till den här filen, där de hör hemma. Kontraktets §11-disciplin — *"RÅ observation … aldrig bedömning"* — pekar åt samma håll |
| `B-GAP-1` | Case B:s primärhandling är demobokning via Cal.com, och `KAP-EXTERN-BOKNING` står `DECLARED` i kapacitetskatalogen — beskriven, inte byggd. Autobyggs beslutstaxonomi HARD-stoppar på *obyggd krävd capability*. **En verklig körning stannar därför INNAN `B-P2a` går att avgöra**, och det är den tyngsta av de fem positiva villkoren | `NOT_STARTED` | Antingen bygg `KAP-EXTERN-BOKNING` till `BUILT`, eller kör Case B medvetet till stoppet och bokför stoppet SOM utfallet — ett korrekt HARD_STOP är också ett prov, men det måste vara det förväntade och inte en överraskning |

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
