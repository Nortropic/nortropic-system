# Paketkontraktet — vad ett paket ÄR, och vad det aldrig får bli

Senast verifierad mot systemet: 2026-08-26 · v1 (denna commit)
Verifieringsomfång: nyskapad. Kontraktet är HÄRLETT ur `packs/lokal-se/` som
referensimplementation och ur den auktoritet paketet självt pekar på — inte ur en
uppfattning om hur paket borde se ut. Varje krav nedan bärs redan av `lokal-se`.

Systemet var länge universellt i kärnan med **ett** paket. Ett paket är då inte en form
utan ett exempel, och nästa paket ärver vad som råkade stå i det första. Den här filen gör
formen explicit innan den mängden växer.

**Ingen grind läser den här filen.** `scripts/check-pack-contract.mjs` prövar att varje
paket under `packs/` uppfyller den; kontraktet självt är vanlig dokumentation.

---

## 1. Vad ett paket är

Ett paket är en **namngiven komposition av kapaciteter** för en kundtyp — konfiguration
och yta ovanpå den universella kärnan.

> **KAPACITETSPAKET, aldrig affärspaket.** Priser, paketinnehåll och kundlöften är
> `docs/07-konstitution.md` §A5 och bor aldrig i `packs/`.

Kärnan gäller varje kund. Paketet gäller den kundtyp det namnger. `paket: []` — core-only
— är ett **giltigt** läge, aldrig ett fel.

## 2. Obligatoriska delar

| Del | Hemvist | Krav |
|---|---|---|
| **Manifest** | `packs/<id>/manifest.md` | Paket-id, version, status, aktiveringssignal, modultabell, ALDRIG-lista |
| **Researchmodul** | `packs/<id>/research-module.md` | Skärpningar av den universella kärnan + egna `L`-sektioner + kontrollradens skärpning |
| **Strategimodul** | `packs/<id>/strategi/` | Branschprofiler. **Får vara tom** — se §5 |
| **Kapacitetsrader** | `docs/kapacitetskatalog.md` | Vad paketet kan levereras OCH oberoende verifieras på |
| **Kapacitetskomposition** | `packs/<id>/manifest.md` | **Vilka `KAP-`-rader paketet komponerar, var och en med rollen ÄGER · SKÄRPER · ÄRVER.** Masterplanens D2: *"packs are named compositions of capabilities"* — utan tabellen pekar manifestet på katalogen i allmänhet och binder ingen rad till paket-id:t |
| **Grindlinser** | `packs/<id>/gate-lenses.md` | Vilken UNIVERSELL kategori en paketspecifik iakttagelse aliasar in på. Aldrig en egen kategori (§10) |
| **Agentfragment** | `packs/<id>/agent-fragments.md` | VAR i agenterna paketets skärpningar står, med en ankarfras per fragment. Registret är en SPEGEL — agenterna läser det inte |
| **Statusrad** | `docs/06-scope.md` statustabell | Paketets mognad i den frusna vokabulären |
| **Pinne** | `config/research-contract.v3.json` | `pack`, `version`, `path`, `motKarna`, `sha256` |

Ett paket utan alla sex delar är inte ett paket. Det är ett utkast.

## 3. Lagarna — bindande för varje paket

1. **SKÄRPNINGSLAGEN.** En paketmodul får ENDAST skärpa: kräva fler fält, hårdare belägg,
   snävare formuleringar. Den får aldrig lätta ett universellt krav, omdefiniera en
   universell sektion, flytta ett universellt fält till modulen, eller göra ett `[OSÄKER]`
   till `ja`.
2. **NUMRERINGEN FÖRSKJUTS ALDRIG.** Den universella ryggraden är sektion 1–17 med stabil
   numrering. Modulens sektioner numreras `L1…Ln` i sin EGEN rymd.
3. **BELAGT, ALDRIG ANTAGET.** Paketet aktiveras endast när dess aktiveringssignal är
   belagd. En ANTAGEN bransch kör `core-only` med hypotesen noterad i researchens sektion
   15. En gissning aktiverar aldrig ett paket.
4. **BEDÖMER ALDRIG JURIDIK.** Flaggor OBSERVERAS enligt universell sektion 11; bedömningen
   är människans vid nod 3. Juridikflaggregistret är §A4 och ändras aldrig av en agent.
5. **BÄR ALDRIG AFFÄRSVILLKOR.** §A5.
6. **FÖDER ALDRIG EN NY AGENT.** En kompetens som växer blir en modul, inte en roll.
   Sjurollsrostern är fast.
7. **EN KATASTROF FÖLJER SITT PAKETS TILLÄMPLIGHET.** Ett paket som inte är belagt kan inte
   fälla något — dess krav har lämnat mätningen, inte blivit uppfyllda.

## 4. Statusvokabulären — samma fem lägen som överallt

`DECLARED` (beskrivet, ej byggt) · `BUILT` (byggt, ingen evidens) · `VALIDATING` (evidens
samlas) · `PROVEN` (evidenskravet uppfyllt) · `ROUTE-OUT` (medvetet utanför).

**Taket är mekaniskt:** syntetisk evidens bär ett paket som HÖGST till `VALIDATING`.
`PROVEN` citerar endast riktiga kunder. Se `docs/06-scope.md`, §A9-skyddad semantik.

**Ett `DECLARED`-paket som krävs men saknar byggd kapacitet ⇒ STOPP** som strategisk öppen
fråga. Plannern bygger aldrig vidare på en kapacitet som inte finns. Det är därför ett
skelettpaket är säkert att ha: det stoppar, det låtsas inte.

## 5. Varför strategikatalogen får vara tom

`packs/lokal-se/strategi/` är avsiktligt tom. Skälet står i dess manifest och gäller varje
paket:

> En påhittad startprofil vore exakt det slags självförtroende utan belägg som resten av
> systemet finns för att förhindra.

Profiler skrivs när riktiga kunder visar vad som faktiskt återkommer. Saknas en profil är
det inget fel — plannern syntetiserar §7 ur research enligt bevisregeln.

**Samma princip gäller hela paketet.** Ett paket får bära STRUKTUR utan att bära INNEHÅLL.
Det som saknas ska stå utskrivet som saknat, aldrig fyllas med rimliga gissningar.

## 6. Juridikmoduler — gränsen som aldrig flyttas

Ring 2-arketyperna i `docs/06-scope.md` är just de med juridikflaggor. För dem gäller
utöver allt ovan:

- **Modulkravet är redan namngivet** i `skills/nortropic-plan/references/juridikflaggor.md`
  (§A4). Paketet PEKAR på registrets krav; det formulerar dem aldrig om.
- **Paketet får bära OBSERVATIONSKRAV** — vad researchen måste ta reda på för att flaggan
  ska kunna bedömas. Det är sektion 11:s arbete, skärpt, och det är inte en juridisk
  bedömning.
- **Paketet får ALDRIG bära det juridiska SAKINNEHÅLLET** — vad lagen kräver, var gränsen
  går, vilken friskrivning som räcker. Det kräver namngiven källa (myndighetstext eller
  jurist) och är människans hand. Ett paket som saknar den källan skriver ut det som
  `KÄLLA SAKNAS` och står kvar på `DECLARED`.

En agent som fyller en juridikcell med en rimlig gissning har inte byggt en modul. Den har
byggt en risk som ser ut som en modul.

## 7. Versionering

Paketets modulversion är semver och pinnas mot kärnan med ett intervall
(`motKarna: ">=3.0.0 <4.0.0"`). Ändras modulen bumpas versionen OCH sha256 i
`config/research-contract.v3.json` i samma commit — kontraktets färskhetslag kräver att
varje konsument verifierar hashen före användning, och en pinne som släpar är en tyst
lögn om vad som lästes.

## 8. Vad kontraktet INTE gör

- **Ingen ny grind.** Inget i pipelinen läser den här filen.
- **Ingen ny auktoritet.** Varje krav här bärs redan av `lokal-se` eller av en fil kontraktet
  pekar på; filen samlar dem, den stiftar dem inte.
- **Ingen §A-yta.** Skulle ett krav här komma i konflikt med `docs/07-konstitution.md`
  gäller konstitutionen, och den här filen är fel.

## 9. Kända luckor — namngivna, inte tysta

Kontraktet är v1 och prövas mekaniskt av `scripts/check-pack-contract.mjs`. Fyra luckor,
utskrivna så att en läsare inte tror att de prövas. **Två är stängda och står kvar som
vända krav** — en struken rad går inte att kontrollera.

| ID | Lucka | Varför den står öppen |
|---|---|---|
| `PK-GAP-1` | **STÄNGD 2026-08-27 (HÖGRISK, ägarinstruktion).** Paket↔kapacitet var inte bundet till paket-id: manifestet pekade på katalogen i allmänhet och namngav ingen enskild `KAP-`-rad. Luckan sa att *"att kräva bindningen vore att kräva något referensen inte uppfyller"* — **så referensen fick bära den först.** `packs/lokal-se/manifest.md` bär nu en kapacitetskomposition med sex rader och tre roller, och kontraktet KRÄVER den. **`ÄRVER` är en egen roll och inte en tystnad:** en kapacitet som varken ägs eller skärps måste ändå stå med, annars går "gäller oförändrad" inte att skilja från "glömdes bort". Manifestet är §A7-yta; ändringen är gjord på uttrycklig ägarinstruktion och HÖGRISK-märkt | Masterplanens D2 förutsatte bindningen. **Kvarstod som `PK-GAP-4`** — en deklarerad komposition kan alltid krympas — och den luckan har nu en EGEN rad nedan i stället för att bo i den här cellen |
| `PK-GAP-4` | **STÄNGD 2026-08-27.** Luckan öppnades samma dag som `PK-GAP-1` stängdes och var min egen: kapacitetskompositionen skrevs in i manifestet som en **DEKLARATION**, och en lista som bara granskas för det den INNEHÅLLER kan alltid krympas — kontrollen kunde bara kräva att de rader som STÅR där är giltiga, aldrig att en rad saknas. **Kravet härleds nu ur något som inte är manifestet:** paketets egna fixturer. En fixtur med `paket: ['lokal-se']` deklarerar i `kapaciteter` vad bygget faktiskt aktiverar, och **kompositionen måste TÄCKA varje sådan kapacitet** | Riktningen är medvetet ensidig: en komposition FÅR bära en rad ingen fixtur ännu övar, men aldrig sakna en som övas — oövade rader RAPPORTERAS i stället för att fällas, eftersom en oövad kapacitet är obevisad och inte felaktig. **Ankarkravet gäller:** ett paket UTAN fixturer ger FAIL, aldrig grönt — utan underlag går härledningen inte att göra, och en tom mängd är aldrig ett rent resultat. **Kvarstår:** härledningen når bara så långt som fixturmängden räcker. En kapacitet som ingen fixtur övar kan fortfarande utelämnas ur kompositionen utan att någon vakt fäller; det stängs först av en fixtur som övar den |
| `PK-GAP-2` | **NAMNGIVEN.** **Juridiskt sakinnehåll prövas bara LEXIKALT.** Vakten fäller lagparagrafcitat utan namngiven källa, men en normativ slutsats formulerad i vanlig svenska passerar — t.ex. *"saknas samtycke är bilden inte användbar"*, som är en rättslig slutsats klädd som observation | Ett verkligt prov kräver att någon som kan rätten läser texten. Det är precis den kompetens `KÄLLA SAKNAS` finns för att erkänna att systemet saknar. **Detta fällde ett faktiskt bygge:** fem Ring 2-paketskelett drogs tillbaka 2026-08-26 efter att oberoende granskning visat att gränsen inte hölls i minst fem punkter, varav två förnekade sin egen karaktär |
| `PK-GAP-3` | **NAMNGIVEN.** **Masterplanens §6 räknar upp SEX paketdelar.** Fem är nu byggda: manifest · research module · strategy module · **gate lenses** (2026-08-27) · **agent fragments** (2026-08-27). **Den sjätte — eval module — är MEDVETET INTE byggd, och skälet är strukturellt, inte brist på tid.** | **Varför eval-modulen inte ska byggas nu:** (i) den skarpa rubriken `skills/nortropic-eval/references/eval-rubric.md` har **ingen paketdel alls** — att lägga till en är en §A2-ändring av mätstocken, och §A2 säger att *måttet ägs av människan*. (ii) En utmanarrubrik med en paketdel finns, men den är `NOT_PRODUCTION` och medvetet hållen utanför auktoritet — den får därför inte åberopas härifrån, vilket `scripts/check-v4-utkast.mjs` upprätthåller och fällde en tidigare version av just den här raden på. **Att bygga en tredje yta med paketspecifika evalkriterier vore att skapa en andra mätstock**, vilket §10:s *"No generated per-project rubric authority"* förbjuder i anda: rapporter från olika kunder slutar gå att jämföra. Rätt ordning är att v4 antingen antas eller förkastas av en människa FÖRST; paketets eval-modul är då antingen v4:s paketdel eller ingenting. **Ett paket enligt detta kontrakt är alltjämt inte ett komplett paket enligt planen — men resten av avståndet är ett ägarbeslut om mätstocken, inte ett bygge** |
