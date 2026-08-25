# PAKETMODUL: `lokal-se` — researchtillägg v1.0.0

**Paket-id:** `lokal-se` · **Modulversion:** 1.0.0 · **Mot kontrakt:** research-kärna
`>=3.0.0 <4.0.0`

Modulen appenderas UNDER den universella ryggraden (sektion 1–17). **Den universella
numreringen förskjuts aldrig** — modulens sektioner numreras `L1…Ln` i sin egen
rymd.

## Skärpningslagen

En paketmodul får **ENDAST SKÄRPA**: kräva fler fält, hårdare belägg eller snävare
formuleringar. Den får **ALDRIG**:

- lätta på ett universellt krav;
- omdefiniera en universell sektion;
- flytta ett universellt fält till modulen;
- göra ett `[OSÄKER]` till `ja`.

Modulen aktiveras endast när paketet är **belagt**. En ANTAGEN bransch kör
`core-only` med hypotesen noterad i sektion 15 (kontraktets hypotesläge).

## Skärpningar av den universella kärnan

| Universell sektion | Skärpning för `lokal-se` |
|---|---|
| 1 Organisation & kontaktvägar | Telefonnummer är OBLIGATORISKT belagt, och `postalCode` måste matcha formatet `NNN NN` identiskt överallt det förekommer. NAP är EN källa — varje avvikelse noteras som konflikt |
| 4 Toppuppgifter + primärhandling | Primärhandlingen måste kandideras ur EN av: `ring nu` · `boka tid` · `platsförfrågan` · `offert` · `besök`. Hur kunder faktiskt konverterar i dag ska beläggas, inte bara vad kunden önskar |
| 5 Geografi & språk | Minst EN belagd ort krävs. Rörlighetsläget ska framgå: åker vi ut · kunden kommer hit · rent varumärke — med belägg |
| 6 Förtroende/evidens | Omdömen kräver betyg + **EXAKT antal** + plattform. ROT/RUT-läget ska framgå när branschen är ROT-relevant |
| 7 Innehåll + bildmaterial | Bildinventeringen ska avsluta med en uttrycklig bedömning: **"räcker materialet för foto-först-design, eller behövs ny fotografering?"** |

## Modulens egna sektioner

| # | Sektion | Krav |
|---|---|---|
| **L1** | **Ortsstruktur** | Huvudort + eventuella sekundärorter, var för sig belagda. Tunna ortssidor rekommenderas bort — en ort utan belagt arbete är ingen ort |
| **L2** | **Lokala kvitton** | Fysisk plats, lokal närvaro, Google Företagsprofil-status, lokala citeringar (namn + URL) |
| **L3** | **Bokningsvägen** | Om extern bokningstjänst används: vilken, och hur den är integrerad (länk/embed). Sajten förblir stateless — egen bokningsdatabas är ett Ring 3-observandum, aldrig ett modulkrav |
| **L4** | **Säsong & tillgänglighet** | Säsongsvariation, jourläge, svarstidslöften kunden själv gör — citerat, aldrig uppskattat |

## Kontrollradens skärpning

När `pack=lokal-se` gäller, utöver kärnans krav, att `status=KOMPLETT` FÖRUTSÄTTER:

- ett belagt telefonnummer (sektion 1);
- minst en belagd ort (sektion 5, L1);
- en primärhandlingskandidat ur den slutna mängden (sektion 4) — `motstridig` är ett
  giltigt värde och blockerar KOMPLETT tills en människa avgör;
- ett ifyllt fotobedömningssvar (sektion 7).

Modulen lägger till fältet `pack_module=1.0.0` i kontrollraden. Saknas något av
ovanstående är raden `status=OFULLSTÄNDIG` — och det skrivs RÖTT överst i filen.

## Vad modulen ALDRIG gör

`lokal-se` är ett KAPACITETSPAKET, inte ett affärspaket: priser, paketinnehåll och
kundlöften är `docs/07-konstitution.md` §A5 och bor aldrig här. Modulen bedömer inte
juridikflaggor — den observerar dem enligt universell sektion 11 och lämnar
bedömningen till nod 3.
