# `lokal-se` — paketets agentfragment

Masterplanens §6:s **sjätte** paketdel. `PK-GAP-3` namngav att kontraktet bara krävde tre
av sex; grindlinserna byggdes 2026-08-27 som den femte. **Detta är den sjätte.**

**Filen är INTE §A7-skyddad kalibreringsyta.** §A7 zonar `manifest.md`,
`research-module.md` och `strategi/*` därför att de bär kvittolistor och juridikflaggor
(§7.4/§7.7). Ett fragmentregister bär varken — det pekar ut VAR i agenterna paketets
skärpningar redan står.

---

## Samma fynd som med grindlinserna

Paketets skärpningar av agenternas beteende **fanns redan — men inte i paketet.** De står
inline i `agents/*.md`, och ett andra paket kan därför inte skärpa en agent utan att någon
redigerar agentfilen. Masterplanens D2 igen: en komposition som kräver att andras filer
ändras är ingen komposition.

**Registret är en SPEGEL, precis som linserna var innan de genererades.** Skillnaden är att
fragmenten inte går att generera: de är prosa inuti längre instruktioner, och att generera
prosa in i en agentfil vore att låta ett paket skriva om en agents text. **Spegeln är taket
här** — se `AF-GAP-1`.

## Fragmenten

| ID | Agent | Vad paketet skärper | Ankarfras (måste stå i agenten) |
|---|---|---|---|
| `AF-1` | `agents/project-planner.md` | INPUT GATE: kontaktvägen måste innefatta **telefon**, och räckvidden måste vara **≥1 belagd ort** | `Paketskärpning \`lokal-se\`` |
| `AF-2` | `agents/project-planner.md` | Kvittolistan: **PAKETET namnger vilka** förtroendekvitton som gäller — kärnan namnger inga | `PAKETET namnger vilka` |
| `AF-3` | `agents/project-planner.md` | Schematyp: paketet skärper till en **`LocalBusiness`-subtyp**; kärnan har ingen default | `skärper till en \`LocalBusiness\`-subtyp` |
| `AF-4` | `agents/project-planner.md` | Branschprofilerna bor i paketets **strategimodul** | `packs/lokal-se/strategi/` |

## Vad som INTE är ett fragment

**Universella krav är aldrig fragment**, hur ofta de än råkar gälla lokala kunder.
Faktatrohet, tillgänglighet och säkerhet är kärnregler — att lista dem här vore att göra
dem valbara genom att knyta dem till ett paket.

**Och skärpningslagen gäller:** varje fragment får bara SMALNA av kärnan. Ett fragment som
lättar ett universellt krav är ogiltigt oavsett hur väl det passar branschen.

## Luckor

| ID | Lucka | Nästa transition |
|---|---|---|
| `AF-1` `AF-GAP-1` | **Registret är en spegel, inte en koppling.** Agenterna läser inte den här filen; fragmenten står inline. Till skillnad från grindlinserna går de inte att generera — de är prosa inuti längre instruktioner, och att generera prosa in i en agentfil vore att låta ett paket skriva om en agents text | Kräver att agentinstruktionerna byggs av delar i stället för att skrivas som löptext. Det är en omskrivning av agentlagret, inte en städning — ägarbeslut |
| `AF-GAP-2` | **Ankarfraserna är LEXIKALA.** Vakten prövar att frasen står i agenten, inte att agenten BETER sig enligt den. Samma gräns som `PK-GAP-2` | Kräver en körning som mäter beteende |
