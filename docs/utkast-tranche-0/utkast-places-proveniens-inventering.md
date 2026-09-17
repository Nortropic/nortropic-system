> **UTKAST — TRANCHE 0 (2026-08-24). EJ PRODUKTION, EJ AUKTORITET.**
> Design-utkast enligt den DESIGN-FRUSNA masterplanen. Konsumeras av INGENTING
> före FOUNDATION_REPAIR_GATE; skarp version landar i sin riktiga hemvist i S1+/P1.

# Places-proveniens: inventering av persisterad data (S0-audit, formaliserad)

Etikettdisciplin per påstående: **[REPO-FAKTUM]** = verifierat genom kodläsning 2026-08-24 ·
**[LEGALT FAKTUM]** = verifierat i S0b-researchen 2026-08-24 · **[RESEARCH-INDIKERAT]** = indikerat,
ej verifierat mot auktoritativ källa · **[DESIGN]** = beslut i denna plan.

## 1. Granskade källor

**[REPO-FAKTUM]** Läst i sin helhet 2026-08-24:

| Fil | Roll |
|---|---|
| `verkstadsgolvet/db/leads-schema.sql` (197 rader) | leads-tabell + score-konfig + kalibrering_vy + RLS |
| `verkstadsgolvet/db/leads-sweep-schema.sql` (66 rader) | sok_kombinationer / sok_config / sok_dagslogg |
| `verkstadsgolvet/lib/places.ts` (82 rader) | textSearch (Pro-mask) + placeDetails (Enterprise-mask) |
| `verkstadsgolvet/lib/leads-worker.ts` (149 rader) | svep-worker: extrahera() + upsert. OBS: kroppen raderades i containment-committen i `worktrees/step0a-acq-containment`; fullständig kropp läst ur verkstadsgolvet@HEAD där den kvarstår. |
| `verkstadsgolvet/lib/leads-scoring.ts` (85 rader) | regel-logik; poäng ur score_vikter |
| `verkstadsgolvet/lib/leads-data.ts` (239 rader) | läsning/CRUD/kalibrering (score live, aldrig persisterad) |

## 2. Dataflödet (som det faktiskt är byggt)

**[REPO-FAKTUM]** `runWorkerBatch`: kö-jobb (kommun×kategori) → `textSearch` med fältmask
`places.id, places.displayName, places.websiteUri` → filtrera bort träffar med `websiteUri` →
dedup-förkontroll mot befintliga `place_id` (**hoppar över kända — förhindrar aktivt refresh**) →
`placeDetails` med Enterprise-mask (`formattedAddress, nationalPhoneNumber, rating, userRatingCount,
businessStatus, googleMapsUri, reviews, regularOpeningHours, photos, editorialSummary`) →
`extrahera()` → `upsert leads on conflict place_id`. Ingen TTL, ingen refresh-mekanism, ingen
re-fetch finns någonstans — rader åldras tyst för evigt. Worker-claim saknar lås (parallella
körningar kan dubbelbearbeta). RLS på utan policies (service-key kringgår, avsiktligt).

## 3. Persisterade Places-härledda fält — ToS-klass + åtgärdsklass

**[LEGALT FAKTUM]** Verifierade EEA-regler (obligatoriska EEA-villkor sedan 2025-07-08):
endast `place_id` får lagras varaktigt; lat/lng max 30 dagar; **allt annat är session-only**
(får ej cachas/lagras bortom sessionsvisning). No-scraping-/no-database-klausulerna täcker
uttryckligen "identifiera företag utan sajt och kontakta dem". Risken är ASYMMETRISK: samma
Google-kontofamilj bär hela leveransstacken (GBP/Ads/GSC).

**[REPO-FAKTUM]** kolumner + källfält; **[DESIGN]** åtgärdsklass per ägarens fail-closed-sekvens:

| Kolumn (leads) | Places-källa | ToS-klass (EEA) | Åtgärdsklass |
|---|---|---|---|
| `place_id` | `id` | Varaktigt lagringsbar | **BEHÅLL** (pointer) |
| `namn` | `displayName.text` | Session-only | **MIGRERA-TILL-BOLAGSVERKET** |
| `adress` | `formattedAddress` | Session-only | **MIGRERA-TILL-BOLAGSVERKET** |
| `telefon` | `nationalPhoneNumber` | Session-only | **RADERA-EFTER-ERSÄTTNING** |
| `gbp_url` | `googleMapsUri` | Session-only | **RADERA-EFTER-ERSÄTTNING** |
| `betyg` | `rating` | Session-only | **RADERA-EFTER-ERSÄTTNING** |
| `recensioner_antal` | `userRatingCount` | Session-only | **RADERA-EFTER-ERSÄTTNING** |
| `senaste_recension_at` | härledd ur `reviews[].publishTime` | Härledd ur session-only-data → session-only | **RADERA-EFTER-ERSÄTTNING** |
| `recensioner_senaste_6man` | härledd ur `reviews[].publishTime` | Härledd → session-only | **RADERA-EFTER-ERSÄTTNING** |
| `gbp_har_foton` | härledd ur `photos[]` (längd>0) | Härledd → session-only | **RADERA-EFTER-ERSÄTTNING** |
| `gbp_har_oppettider` | härledd ur `regularOpeningHours` (truthy) | Härledd → session-only | **RADERA-EFTER-ERSÄTTNING** |
| `gbp_har_beskrivning` | härledd ur `editorialSummary.text` (truthy) | Härledd → session-only | **RADERA-EFTER-ERSÄTTNING** |
| `har_sajt` | inferens: `websiteUri` saknas i Search, dubbelkoll i Details | Härledd ur session-only-fält | **ERSÄTT med egen webbplats-existens-check** (egen kontroll = egen data → behålls efter ersättning) |
| `sok_kombinationer.placer_hittade` | antal Places-träffar per sökning | Aggregerad härledd siffra — klassning OKLAR | ÖPPEN FRÅGA (se §6) |
| `sok_kombinationer.kandidater` | antal träffar utan sajt som gick till Details | Aggregerad härledd — klassning OKLAR | ÖPPEN FRÅGA (se §6) |

**[REPO-FAKTUM]** Lagras INTE (verifierat i extrahera()/maskerna): recensionstext/författare,
foto-bytes, `websiteUri` som värde, lat/lng, `editorialSummary`-texten själv.

**[REPO-FAKTUM]** Egen data — påverkas ej av ToS, **BEHÅLL**: `bransch` (= combo.kategori_label,
egen taxonomi), `ort` (= combo.kommun), `status`, `diskvalificerings_skal`, manuella bedömningar
(`bildmaterial_bedomning`, `social_aktivitet`, `agare_svarar_pa_recensioner` — manuellt satt,
worker skriver null, `bedomning_anteckning`), `fb_url`/`ig_url` (manuellt), `score`/`score_version`
(egna kolumner; i praktiken aldrig skrivna — score beräknas live), demo-fälten, `sms_text`/
`sms_skickat_at`, `svar_*`, `anteckningar`.

## 4. Åtgärdsklasser (ägarens fail-closed-sekvens)

**[DESIGN]** Tre klasser, i denna ordning, ingenting annat:

1. **BEHÅLL**: `place_id` + all egen härledd status-/interaktions-/bedömningsdata.
2. **MIGRERA-TILL-BOLAGSVERKET**: namn/adress/orgform hämtas om ur registret (design i
   `utkast-bolagsverket-rebase-design.md`) och Places-versionen ersätts.
3. **RADERA-EFTER-ERSÄTTNING**: telefon/betyg/recensionsfält/gbp_url/booleans raderas — men
   först när ersättande signal (registerdata, egen check, eller live-lookup-vid-användning)
   finns på plats.

Två lagar, båda fail-closed:

- **INGEN BLIND RADERING.** Ingenting raderas innan ersättningen bevisats fungera — annars
  tappar operativ historik (status, utfall, bedömningar) sitt ankare och kalibreringsdata
  förstörs i onödan.
- **INGEN OBEGRÄNSAD BACKUP.** En "backup" av session-only-fält är fortfarande lagring.
  Ingen kopia av RADERA-klassad data får överleva på obestämd tid — inte i dumpar, inte i
  exportfiler, inte i "arkiv". Ersättningsfönstret är tidsbegränsat (tidslinje = ägarfråga, §6).

## 5. Vad inventeringen INTE beslutar

**[DESIGN]** Detta dokument klassar; det migrerar inte. Schema-förändringar, radering av
befintliga rader och registret-rebasen ligger i S1+/P1 bakom FOUNDATION_REPAIR_GATE.
Svepet är stoppat (containment); ingen ny Places-persistens får ske under utkastfasen.

## 6. Öppna frågor till ägaren

1. **Befintliga raders disposition — tidslinje.** Hur länge får nuvarande rader (med
   RADERA-klassade fält) leva under migreringen? Förslag finns inte här; ägaren sätter
   deadline för "ersättning på plats → radering utförd".
2. **`placer_hittade`/`kandidater`**: aggregerade räknare per sökning — är de "cachad
   Places-data" eller egen driftstelemetri? Klassning krävs före skarp version.
3. **`sms_text`**: förberedda SMS innehåller företagsnamn (Places-härlett i dag). Ska
   historiska sms_text-strängar saneras vid migrering, eller räknas de som egen
   interaktionshistorik?
4. **Score-historik**: score beräknas i dag live ur Places-härledda signaler. Efter
   remediering ändras signalmängden — ska pre-migrerings-score frysas (persisteras) som
   historiskt faktum före raderingen, för kalibreringens skull?
