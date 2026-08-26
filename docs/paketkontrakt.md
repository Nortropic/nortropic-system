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

## 9. Kända luckor — namngivna, inte tysta

Kontraktet är v1 och prövas mekaniskt av `scripts/check-pack-contract.mjs`. Tre saker det
INTE binder, utskrivna så att en läsare inte tror att de prövas.

| ID | Lucka | Varför den står öppen |
|---|---|---|
| `PK-GAP-1` | **Paket↔kapacitet är inte bundet till paket-id.** Kontraktet kräver kapacitetsrader, men referensimplementationen `lokal-se` binder ingen rad till sitt paket-id, och manifestet namnger ingen enskild `KAP-`-rad. Vakten kan därför bara kräva att katalogen är icke-tom och att manifestet pekar på den | Att kräva bindningen vore att kräva något referensen inte uppfyller — och en referens som inte klarar sitt eget kontrakt gör kontraktet fel, inte paketet. Masterplanens D2 (*"packs are named compositions of capabilities"*) förutsätter den bindningen; att den saknas är ett verkligt arkitekturfynd, inte en formalitet |
| `PK-GAP-2` | **Juridiskt sakinnehåll prövas bara LEXIKALT.** Vakten fäller lagparagrafcitat utan namngiven källa, men en normativ slutsats formulerad i vanlig svenska passerar — t.ex. *"saknas samtycke är bilden inte användbar"*, som är en rättslig slutsats klädd som observation | Ett verkligt prov kräver att någon som kan rätten läser texten. Det är precis den kompetens `KÄLLA SAKNAS` finns för att erkänna att systemet saknar. **Detta fällde ett faktiskt bygge:** fem Ring 2-paketskelett drogs tillbaka 2026-08-26 efter att oberoende granskning visat att gränsen inte hölls i minst fem punkter, varav två förnekade sin egen karaktär |
| `PK-GAP-3` | **Masterplanens §6 räknar upp SEX paketdelar** — manifest, research module, strategy module, **eval module**, **gate lenses**, **agent fragments**. Kontraktet kräver bara de tre första plus katalograd, statusrad och pinne | De tre saknade har ingen konsument ännu. Att kräva dem hade gjort `lokal-se` kontraktsvidrigt. Luckan namnges hellre än normaliseras: **ett paket enligt detta kontrakt är inte ett komplett paket enligt planen** |

## 8. Vad kontraktet INTE gör

- **Ingen ny grind.** Inget i pipelinen läser den här filen.
- **Ingen ny auktoritet.** Varje krav här bärs redan av `lokal-se` eller av en fil kontraktet
  pekar på; filen samlar dem, den stiftar dem inte.
- **Ingen §A-yta.** Skulle ett krav här komma i konflikt med `docs/07-konstitution.md`
  gäller konstitutionen, och den här filen är fel.
