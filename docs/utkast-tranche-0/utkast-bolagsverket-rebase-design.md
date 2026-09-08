> **UTKAST — TRANCHE 0 (2026-08-24). EJ PRODUKTION, EJ AUKTORITET.**
> Design-utkast enligt den DESIGN-FRUSNA masterplanen. Konsumeras av INGENTING
> före FOUNDATION_REPAIR_GATE; skarp version landar i sin riktiga hemvist i S1+/P1.

# Bolagsverket-rebase: kompatibel discovery-/lagringsarkitektur (Part 2e S0b)

Etikettdisciplin: **[LEGALT FAKTUM]** = verifierat i S0b-researchen 2026-08-24 ·
**[RESEARCH-INDIKERAT]** = indikerat, verifieras före implementation · **[DESIGN]** = beslut ·
**[REPO-FAKTUM]** = verifierat mot kod 2026-08-24.

## 1. Varför

**[LEGALT FAKTUM]** Places-persistensen bryter mot Maps ToS (se
`utkast-places-proveniens-inventering.md`). **[DESIGN]** Registret — inte Places — blir
varaktig källa; Places degraderas till pointer + live-lookup vid användning. Detta löser
samtidigt stalenessproblemet strukturellt (**[REPO-FAKTUM]** ingen TTL/refresh finns i dag;
dedup-förkontrollen förhindrar aktivt re-fetch).

## 2. Registret som varaktig källa

**[LEGALT FAKTUM]** Bolagsverket/SCB "värdefulla datamängder": avgiftsfritt sedan
**2025-02-03**; kräver kundanmälan; REST-API + bulkfiler; uttryckligt tillåten kommersiell
vidareanvändning. Fält i fria nivån: **orgnr, namn, organisationsform, adresser, SNI-koder,
status**. **INTE i fria nivån: företrädare/funktionärer** — inga personnamn att hämta där.

**[RESEARCH-INDIKERAT]** Exakta API-kontrakt, kvoter, bulkformat och uppdateringsfrekvens
uppströms — verifieras mot Bolagsverkets/SCB:s dokumentation vid implementation (kandidat-
instrumentmodellen i Part 2c: en instrumentrad med auktoritetsklass, aldrig ovetterad ingest).

## 3. Kontomodell (utkast — INTE migrerad schema)

**[DESIGN]** Ny varaktig entitet `konto` (utkastskiss, fälten — inte DDL):

| Fält | Källa | Kommentar |
|---|---|---|
| `orgnr` (PK) | Registret | **OBS enskild firma: orgnr = personnummer-härlett = PERSONDATA** (§7) |
| `namn`, `orgform`, `adresser`, `sni[]`, `registry_status` | Registret | Ersätter Places-namn/adress |
| `registry_hamtad_at`, `registry_kalla_version` | Egen | Färskhetsstämpel per rad |
| `webbplats_finns`, `webbplats_url`, `webbplats_kontrollerad_at`, `webbplats_metod` | **Egen webbplats-existens-check** | Ersätter `har_sajt`-inferensen ur Places `websiteUri` |
| `place_id` (nullable) | Places | **ENDAST POINTER** — ingen payload; sätts/uppdateras vid live-lookup |
| Egen interaktions-/status-/kvalificeringsdata | Egen | status, bedömningar, kontakthistorik, utfall, score@kontakt (§9), kvalificeringsdimensioner (§8) |

**Lag: INGENTING Places-härlett lagras varaktigt i `konto`.** Places-data existerar bara i
sessionsvyer vid användningsögonblicket.

**[DESIGN]** Account/opportunity-separationen (konto × affärsmöjlighet × kontakt) förblir
FRAMTID per ägarbeslut — mappas, migreras inte, tills arbetsflöden kräver den.

## 4. Discovery-flöde (ersätter Places-svepet som källa)

**[DESIGN]**

1. **Urval ur registret**: SNI × geografi (kommun/län) → kandidatkonton. Ren registerdata,
   fritt vidareanvändbar. (Signalerna i opportunity-radarn — nyregistrering, adressändring,
   statusändring — är registerhändelser, öppna data.)
2. **Egen webbplats-existens-check**: eget instrument (DNS/HTTP-probe + sökträff-heuristik;
   metod öppen fråga §11) → `webbplats_finns` med metod + datum. Egen data, egen auktoritet.
3. **Places live-lookup VID ANVÄNDNING**: när operatören öppnar ett konto → live-hämtning
   för färskdata (betyg, recensioner, GBP-signal) visas i sessionen; enda persistenta
   biverkan = `place_id`-pointern. Aldrig upsert av payload.

Fail-closed: kan steg 2/3 inte utföras renderas `—`, aldrig gammal Places-kopia.

## 5. Refresh-policy

- **[DESIGN]** Registret: bulk-refresh på fast kadens (förslag: månadsvis bulk +
  händelsedrivna uppslag vid användning; exakt kadens = ägarfråga §11). `registry_hamtad_at`
  gör staleness mätbar — motsatsen till dagens tysta åldrande.
- **[DESIGN]** Places: **re-fetch vid användningsögonblicket, aldrig persisterat bortom
  sessionen.** Ingen cron får "värma" Places-data till lagring.

## 6. Migrationsskiss från `leads` (mappa/markera — INTE flytta nu)

**[DESIGN]** Ingen prematur schemamigrering. Steg vid FOUNDATION_REPAIR_GATE+:

1. **Matchning**: leads-rader saknar orgnr — matcha `namn`+`ort`/`adress` mot registret →
   orgnr. Omatchade rader går RADERA-vägen (fil 1, tidslinje = ägarfråga).
2. **Kolumnkarta** (markeras i schema-kommentar, exekveras senare):
   `namn/adress` → konto via registret · `har_sajt` → egen check · `telefon/betyg/
   recensioner_*/gbp_*` → RADERA-EFTER-ERSÄTTNING · `status/bedömningar/sms_*/svar_*/demo_*/
   anteckningar/bransch/ort` → BEHÅLL (egen data, följer med kontot) · `place_id` → pointer.
3. **Ingen blind radering, ingen obegränsad backup** (lagarna i fil 1 gäller migrationen).
4. Spelet förblir versionerat: `LOCAL_SERVICE_NO_WEBSITE_V1` — kil, inte sanning; rebasen
   byter datakälla, inte strategi.

## 7. Enskild firma — GDPR-not

**[LEGALT FAKTUM]** Enskild firmas orgnr är personnummer-härlett → kontoraden är
**persondata**; GDPR gäller hela hanteringen. Krav: dokumenterad **intresseavvägning (LIA)**
+ dataminimering + **utrensning/omprövning av orörda prospekt ~12 mån** + **suppression för
evigt** (minimala fält) vid invändning. Mekanik i `utkast-gdpr-mekanik.md`. AB-rader är
företagsdata — men se separationslagen där: kontodiscovery skapar ALDRIG automatiskt
personkontaktposter.

## 8. Kvalificeringsdimensioner (visas BREDVID score, ersätter inte)

**[DESIGN]** Enpoängssiffran dekomponeras synligt: **fit · need · timing · value ·
reachability · evidence-confidence · delivery-fit · economics · compliance**. Score behålls
(vikterna är uttalade gissningar — **[REPO-FAKTUM]** "GISSNINGAR … INGEN empirisk grund" i
SQL, kod och UI); dimensionerna gör det multidimensionella underlaget synligt så att
kalibrering mot verkliga utfall äntligen får mat. Compliance-dimensionen läser
outreach-matrisen (fil 3): oklassificerad kanal ⇒ kontakt förbjuden oavsett score.

## 9. P1-ärlighetsreparationer (ur S0-auditen — beslutade, exekveras S1+)

**[REPO-FAKTUM]** samtliga verifierade i kod:

1. **Persistera score + score_version vid kontakttillfället** — i dag beräknas score live vid
   varje läsning och skrivs aldrig; omkalibrering omskriver historien tyst. Kontaktögonblickets
   score är ett historiskt faktum.
2. **Värde-/utfallsfält** — `kund` utan belopp/marginalklass ⇒ kalibrering kan bara optimera
   svarsfrekvens, aldrig värde. Lägg `belopp`/`margin_klass` på utfallet.
3. **Synka kalibreringsbuckets med trösklarna** — 85/60/40 hårdkodat i `leads-data.ts
   (bucket())` och i `kalibrering_vy`, medan trösklarna är redigerbara i `score_versioner`
   ⇒ desync. (`kalibrering_vy` är dessutom död — TS-vägen används.)
4. **Worker-claim-lås** — jobb claimas utan lås; parallella cron-träffar kan dubbelköra.
5. **n8n-driftstädning** — döda referenser (`N8N_LEADS_WEBHOOK_URL`, score-endpoint) bort;
   n8n är enbart cron, "appen äger HELA logiken". (Även: versionsaktivering i
   `createScoreVersion` är icke-atomär — deaktivera+aktivera i två steg.)

## 10. Vad som INTE byggs nu

**[DESIGN]** Ingen schemamigrering · ingen autonom outbound · ingen ML/EOV-modell · ingen
CRM-klon · inget nytt svep förrän matrisen (fil 3) och LIA:n (fil 4) står. Fail-closed:
tills rebasen är exekverad är Places-svepet stoppat och förblir stoppat.

## 11. Öppna frågor till ägaren

1. **Registerkadens**: månadsvis bulk + händelsedrivet vid användning — rätt nivå, eller
   veckovis under aktiv kampanj?
2. **Webbplats-existens-checkens metod**: ren DNS/HTTP-probe på gissade domäner, eller
   sökmotorträff-heuristik också? (Påverkar precision i kärnsignalen "saknar sajt".)
3. **Matchningströskel** namn+ort→orgnr: hur hanteras tvetydiga träffar — manuell kö eller
   släng (fail-closed)?
4. **Kundanmälan Bolagsverket/SCB**: vem står som kund, och när görs anmälan (kan göras före
   FOUNDATION_REPAIR_GATE — ren administrativ handling utan datamutation)?
5. **Score@kontakt retroaktivt**: ska befintliga kontaktade leads få sin nuvarande live-score
   fryst som approximation (märkt APPROXIMATION), eller lämnas historiken tom (ärligare)?
