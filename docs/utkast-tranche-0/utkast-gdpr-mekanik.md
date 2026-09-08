> **UTKAST — TRANCHE 0 (2026-08-24). EJ PRODUKTION, EJ AUKTORITET.**
> Design-utkast enligt den DESIGN-FRUSNA masterplanen. Konsumeras av INGENTING
> före FOUNDATION_REPAIR_GATE; skarp version landar i sin riktiga hemvist i S1+/P1.

# GDPR-mekanik för prospekterings- och relationslagret (Part 2e/2f)

Etikettdisciplin: **[LEGALT FAKTUM]** = verifierat i S0b/T-1-researchen 2026-08-24 ·
**[RESEARCH-INDIKERAT]** = indikerat, verifieras vid implementation · **[DESIGN]** = beslut.

## 1. LIA — intresseavvägningens mallstruktur

**[LEGALT FAKTUM]** Prospekt-DB på berättigat intresse kräver **dokumenterad
intresseavvägning (LIA)** — särskilt eftersom enskild firmas orgnr är personnummer-härlett
= persondata (fil 2 §7). **[DESIGN]** Mallens fyra sektioner:

1. **Ändamål**: exakt formulerat (B2B-prospektering av företag utan fungerande webbnärvaro,
   för erbjudande om webbtjänst). Ett ändamål per LIA — inga paraplyer.
2. **Nödvändighet**: varför persondata krävs för ändamålet; varför mindre ingripande medel
   inte räcker; dataminimering listad fält för fält (registerfält + egen check — inget mer).
3. **Balansering**: registrerades rimliga förväntningar (näringsidkare i offentligt register
   förväntar sig affärskontakt i rimlig omfattning) mot intrångets art; frekvens/volym;
   invändningsrättens tillgänglighet.
4. **Skyddsåtgärder**: dataminimering · utrensning ~12 mån (§4) · omedelbar terminal
   suppression (§3) · Art 14-notis vid första kontakt (§2) · ingen vidarespridning ·
   åtkomst begränsad till operatören.

**Bonnier-gränsen** **[LEGALT FAKTUM]** (IMY-praxis): **enkel firmografisk selektering är OK;
beteendebaserad berikning är riskzonen.** **[DESIGN]** Kodifieras som lag i prospektlagret:
urval får ske på registerfält (SNI, geografi, form, status) + egen webbplats-existens-check;
**beteendeprofilering av enskilda näringsidkare byggs inte** — en berikningskälla som kräver
det avvisas i instrumentvettingen (Part 2c), inte i efterhand.

## 2. Art 14-informationstext — skelett

**[LEGALT FAKTUM]** Art 14-notis krävs vid första kontakt när data inte samlats från den
registrerade. **[DESIGN]** Skelett (varje kanalvariant fyller, aldrig förkortar):

- Vem vi är (Nortropic + kontaktväg).
- Varifrån uppgifterna kommer: **offentligt register (Bolagsverket/SCB) + egen kontroll av
  webbnärvaro** — aldrig dolda källor.
- Ändamål + rättslig grund: berättigat intresse (LIA:ns exakta ändamålsformulering).
- Lagringstid: ~12 mån utan relation, därefter utrensning/omprövning.
- Rättigheter: invändning (särskilt mot direktmarknadsföring — **ett steg, omedelbar
  verkan**), registerutdrag, rättelse, radering, klagomål till IMY.
- Länk till fullständig integritetspolicy.

Notisen är del av kontaktens audit-rad (fil 3 §3.2): utan notis är kontakten ogiltig.

## 3. Registerutdrag + invändningshantering

**[DESIGN]** Flöde, fail-closed:

1. **Begäran in** (valfri kanal) → identitetskontroll proportionerlig (orgnr/adressmatchning)
   → svar **inom en månad** (**[LEGALT FAKTUM]** Art 12.3).
2. **Registerutdrag**: allt vi har om personen (registerfält, egen check, interaktions-
   historik, källhänvisningar) — formatet är enkelt eftersom datamodellen är minimal.
3. **Invändning mot direktmarknadsföring**: **[LEGALT FAKTUM]** Art 21.2–3 — **ABSOLUT**,
   ingen balansering. **[DESIGN]** ⇒ **TERMINAL SUPPRESSION för DM-ändamålet: omedelbar,
   global (alla kanaler/kampanjer), för evigt.** Suppressionraden är minimal: identifierare +
   datum + ändamål — ingen profildata följer med (suppression får inte själv bli ett register).
4. **Raderingsbegäran**: radera allt utom suppressionraden (som behålls med stöd av
   rättslig förpliktelse/berättigat intresse att RESPEKTERA invändningen).

## 4. Retention

**[DESIGN]** (grund: **[LEGALT FAKTUM]** lagringsminimering + IMY-praxis ~12 mån för
oberörda prospekt):

| Dataklass | Regel |
|---|---|
| Orörda prospekt (ingen kontakt, ingen relation) | **Utrensa eller ompröva (ny LIA-bedömning) vid ~12 mån.** Automatisk flagga, manuellt beslut i v1. |
| Kontaktade utan relation | Interaktionshistorik behålls så länge berättigat intresse består; omprövas på samma 12-månaderscykel. |
| Kund/aktiv relation | Följer kundrelationens grund (avtal); egen retention utanför detta dokument. |
| Suppressionlista | **FÖR EVIGT, minimala fält.** |

## 5. Samtyckes-/preferenssemantik (Part 2f)

**[DESIGN]** **SAMTYCKE är entiteten att overengineera — den är juridiskt bärande.**
Typad kontraktsskiss (semantik, inte lagringsval):

```
SAMTYCKE {
  vem            → PERSON-ref
  andamal        (ett per rad — aldrig paraply)
  kanal          (sms | epost | telefon | post | ...)
  rattslig_grund (samtycke | berattigat_intresse | avtal)
  tidsstampel    (när, hur inhämtat, bevis-ref)
  aterkallad_at  (nullable — återkallelse är lika bevisad som inhämtandet)
}
```

De fem relationsentiteterna (typade kontrakt; system-of-record medvetet tunt/externt där
starkare — Attio som designreferens, aldrig beroende):

- **PERSON** (fysisk person: namn, roll, kontaktvägar, källa per fält)
- **ORGANISATION** (= `konto` i fil 2: orgnr-nyckel, registerfält)
- **SAMTYCKE** (ovan; konsumeras av analytics-konfig, lifecycle, ads, lead-agent)
- **INTERAKTION** (varje touch: kanal, riktning, tidpunkt, skäl-raden från fil 3,
  AI-identitetsstate från §7, utfall)
- **AFFÄR** (lead/möte/offert/vunnen/förlorad + värde — matar kvalificeringskalibreringen)

Kontakttryck (Part 2f §8) läser INTERAKTION tvärs över kanaler: ingen kanal bestämmer sin
egen frekvens.

## 6. Separationslagen: företagsdata ≠ personkontaktdata

**[DESIGN]** **KONTODISCOVERY SKAPAR ALDRIG AUTOMATISKT PERSONKONTAKTPOSTER.**
Registersvep (SNI×geografi) producerar ORGANISATION-rader. En PERSON-rad uppstår endast
genom explicit kvalificeringssteg med egen rättslig grund + egen matriscell (fil 3) + egen
LIA-täckning. Specialfall enskild firma: ORGANISATION-raden är själv persondata (fil 2 §7)
och ärver hela denna fils mekanik — men den blir ändå aldrig automatiskt en
outreach-adresserbar PERSON-rad; kvalificeringssteget krävs lika fullt.
Prospektdata läcker aldrig in i kundträning; dataseten blandas aldrig (Part 2e hård lag).

## 7. AI-identitetsstates för framtida outbound

**[DESIGN]** Varje utgående kommunikation bär exakt en state:

`HUMAN_SENT` · `AI_DRAFTED_HUMAN_SENT` · `AI_ASSISTED` · `AI_SENT` · `AUTOMATED_SYSTEM`

Lagar: **AI UTGER SIG ALDRIG FÖR ATT VARA MÄNNISKA** (hård lag, gäller alla states) ·
staten lagras i INTERAKTION-raden (audit) · states ≥ `AI_SENT` kräver dessutom explicit
auktoritet i policymotorn (fil 3 §4 — sändning är EXTERNAL-WRITE, aldrig självauktoriserad).

**[LEGALT FAKTUM]** EU AI Act **Art 50** (transparens) + syntetiskt-innehåll-märkning är
verkställbar sedan **2026-08-02**. **[RESEARCH-INDIKERAT]** Exakta skyldigheter per state
(vilka utskick måste märkas, hur) = NORMATIV radar-post som **verifieras vid
implementation** — ingen state klassas "märkning ej krävd" utan källcitat.

## 8. Öppna frågor till ägaren

1. **LIA-ägarskap och cykel**: LIA:n är ett levande dokument — omprövas den på fast kadens
   (årligen?) eller händelsedrivet (ny kanal/ny datakälla = ny balansering)?
2. **Suppressionens identifierare**: orgnr räcker för enskild firma — men telefonnummer/
   e-postadresser som senare byter ägare: hur länge är en kanalidentifierare en giltig
   suppressionnyckel?
3. **12-månadersregeln operativt**: automatisk utrensning (fail-closed, förlorar data) eller
   flagga-till-manuellt-beslut (ärligare mot kalibreringen, risk för drift)? v1-förslaget
   ovan säger flagga — bekräfta.
4. **AI_DRAFTED_HUMAN_SENT som v1-tak**: ska policyn låsa att ingen state över
   `AI_DRAFTED_HUMAN_SENT` får användas förrän gym-/förtroendekedjan (Part 2b/2e) godkänt
   högre — dvs. taket som invariant, inte praxis?
5. **Registerutdragets kanal**: räcker e-postbaserat flöde med manuell hantering i v1, eller
   krävs formell rutinbeskrivning i integritetspolicyn redan nu?
