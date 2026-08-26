# RESEARCH-KONTRAKT — universell kärna v3.1.0

**KONTRAKTSVERSION: 3.1.0** · **KANONISK HEMVIST: denna fil i `nortropic-system`.**

Detta är den ENDA auktoritativa definitionen av vad en `research.md` ska innehålla.
Alla producenter — verkstadsgolvets composer, en människa med copy-paste, en agent —
komponerar mot DENNA text. En producent som bär sin egen kopia av kontraktet är en
MUTABEL RUNTIME-KÄLLA och därmed ett kontraktsbrott: kopian driftar, och driften
upptäcks först när en kund fått fel sajt.

## Färskhetslagen

Färskhet får ENDAST flöda genom:

**radar → kandidat → verifiering → granskad promotion**

ALDRIG genom:

**latest/main → runtime-auktoritet**

Att en uppströmskälla ändrats är en KANDIDAT, aldrig en ändring. Ingen producent får
hämta "senaste" kontraktet vid körning; den pinnar en version och en hash.

## Pinning

Konsumenter pinnar `{ version, sha256 }` ur `config/research-contract.v3.json` och
verifierar hashen innan kontraktet används. Hash-miss = **fail-closed**: körningen
vägrar hellre än komponerar mot okänd text. Versionsbump är en granskad ändring med
beslutslogg-rad, aldrig en tyst redigering.

## Faktadisciplinen (bevaras oförändrad — den är inte ny här)

- **Belägg per påstående** — varje faktapåstående bär källnot (formulär / FB / IG /
  sajt / sökning).
- **`[OSÄKER]`** för allt som inte kan beläggas. Gissningar existerar inte.
- **Konflikter registreras, aldrig tyst upplösta** — två motstridiga signaler
  noteras båda.
- **Read-only research** — aldrig formulär, DM eller kontaktförfrågningar.
- **Fakta ≠ strategi.** Kontraktet producerar FAKTA. Slutsatser, prioritering och
  kalibrering hör till plannern och sker senare.

## UNIVERSALITETSLAGEN (v3.1.0)

**Den universella ryggraden får inte namnge en kundtyps kvitton, geografi eller
konkurrensbild.** Kärnan frågar VAD som bär förtroende, VILKEN roll geografin har och
VILKA alternativ köparen väger — paketet svarar med vilka.

En kärna som räknar upp en enskild kundtyps skatteregistrering, dess
recensionsplattformar eller dess geografiska konkurrensavgränsning är inte universell.
Den är ett paket som kallar sig kärna, och varje kund utanför den typen tvingas då svara
med en förnekelse i stället för med sitt faktiska förhållande.

**Lagen citerar med avsikt inga termer.** Vakten avgränsar ryggraden till hela filen utom
changelogen; ett undantag för lagtexten hade blivit ett gömställe där ett kundtypskrav
kunde stå i klartext utan att fällas.

Lagen är vaktad av `scripts/check-karn-universalitet.mjs`, som fäller om en flyttad term
återvänder till ryggraden.

## Den universella ryggraden — sektion 1–17

Numreringen är STABIL. Paketmoduler adderar under egna versionerade
paketmodul-rubriker; **den universella numreringen förskjuts aldrig.** En paketmodul
får endast **SKÄRPA** ett krav (fler fält, hårdare bevis) — aldrig lätta på det.

| # | Sektion | Vad som ska stå, i substans |
|---|---|---|
| 1 | **Organisation & typade kontaktvägar** | Juridiskt namn, org-form, identitetsuppgifter; varje kontaktväg TYPAD (telefon · formulär · DM · bokningssystem · fysisk plats) med belägg för att den faktiskt används. **Adressens ROLL noteras** — verksamhetsställe, besöksadress eller enbart registrerad hemvist; rollen avgör vad adressen får användas till, och paketet skärper |
| 2 | **Erbjudande** | Vad organisationen levererar, i dess EGNA ord |
| 3 | **Användare / målgrupper** | Vem som faktiskt kommer, inte vem man önskar |
| 4 | **Toppuppgifter + primärhandlingskandidat** | Vad besökaren kommer för att GÖRA; kandidat till primärhandling med belägg per observation. Motstridiga signaler → båda noteras |
| 5 | **Geografisk räckvidd & språk** | Räckvidden och dess ROLL: arbetsområde man åker ut till · marknad man säljer på · enbart hemvist. Belagd, aldrig antagen. Nationell eller gränsöverskridande räckvidd är ett GILTIGT svar, inte en saknad ort. Språk och eventuell flerspråkighet |
| 6 | **Förtroende/evidens** | De kvitton som FAKTISKT bär förtroende i organisationens sammanhang, var och en med sitt eget bevisformat och belägg. Vilka kvittotyper som gäller namnger PAKETET — kärnan föreskriver ingen lista, eftersom den listan är kundtypsberoende. **Saknas kvitton: markera bevisläget uttryckligen** och inventera det som finns i stället. Låna aldrig meriter |
| 7 | **Innehåll + bildmaterial** | Befintligt innehåll värt att bevara; bildinventering (antal, användbara, motivtyper, liggande hero-kandidater, ansiktsporträtt); rättighetsläget ALLTID; strukturerade bild-URL:er per sektion, "kräver original från kund" där exakt URL inte kan extraheras |
| 8 | **Röst/varumärke** | 1–2 exempel ur egna inlägg + 2–3 exempel på branschens eget språk |
| 9 | **Transaktions-/dataobservationer** | Sker betalning, bokning, inloggning eller lagring av persondata? RÅ observation |
| 10 | **Integrationer** | Bokningstjänst, kassa, CRM, nyhetsbrev, kartor — vad som faktiskt används |
| 11 | **Juridik-/riskobservationer** | Hälsa/kropp/medicin · livsmedel · finans/försäkring · barn som primär målgrupp · alkohol/tobak · e-handelsönskemål · inloggning/medlemsdata. **RÅ observation med citat — aldrig bedömning** |
| 12 | **Konkurrenter/alternativ** | 2–3 FAKTISKA alternativ köparen väger mot — konkurrenter, en annan lösningsklass, eller att inte göra något. Per alternativ KRÄVS: URL, en mening om styrka/svaghet, synligt anseende. **Saknas något av dem skrivs frånvaron ut som en observation** (`ingen publik URL`, `inget synligt anseende`) — aldrig som ett utelämnat fält. Vilken avgränsning som gäller (geografisk, segmentmässig) namnger paketet. Ingen djupanalys |
| 13 | **Designreferenser** | Per referens: URL + 2–3 meningars motivering knuten till DENNA kunds material och röst |
| 14 | **Framgångsmått** | Vad kunden vill ska hända, mätbart uttryckt. **Detta fält föder HANDOVER:s Utfallshypotes och därmed LEARNING-RECORD:s `## Hypotes`** |
| 15 | **Kapacitetssignaler** | Observationer som indikerar vilka kapaciteter jobbet kräver (matar kapacitetskatalogen) |
| 16 | **Öppna frågor** | Allt `[OSÄKER]` + standardfrågorna (omdömen eller referenser vi får publicera, och med vilken attribution? högupplösta original + godkännande? domänönskemål? bokningskanal? vid nystartad: vilka löften vågar du stå för?) |
| 17 | **Maskinläsbar kontrollrad** | Se nedan |

## Sektion 17 — den maskinläsbara kontrollraden

Kontrollraden är GENERALISERAD i den universella kärnan. Paket får **skärpa** den
(kräva fler fält eller hårdare bevis), aldrig lätta på den.

```
RESEARCH-CONTROL v3.1.0 | pack=<paket-id eller "core-only"> | pack_module=<version eller "none">
  org=<ja|nej> | kontaktvag=<ja|nej> | erbjudande=<ja|nej> | geografi=<ja|nej>
  primarhandling=<kandidat|motstridig|OSÄKER> | framgangsmatt=<ja|OSÄKER>
  osakra=<antal> | konflikter=<antal> | status=<KOMPLETT|OFULLSTÄNDIG>
```

**Lagar för kontrollraden:**

1. `status=KOMPLETT` kräver att samtliga obligatoriska universella fält är `ja` OCH
   att paketmodulens egna obligatoriska fält (om paket är satt) är uppfyllda.
2. **`osakra` och `konflikter` nollställer aldrig sig själva** — ett `[OSÄKER]`-fält
   räknas, även om texten runt omkring ser komplett ut.
3. **OFULLSTÄNDIG skrivs RÖTT överst i `research.md`**, aldrig enbart i kontrollraden.
   Ofullständig research som ser komplett ut är dyrare än ingen research.
4. **ODÖMBART blir aldrig grönt.** Ett fält som inte kunnat undersökas är `OSÄKER`,
   inte `nej` och inte tomt.

## Kompositionsläget

| Läge | När | Vad som gäller |
|---|---|---|
| **core-only** | Inget paket matchar, eller paketet är okänt | Enbart sektion 1–17. Detta är ett GILTIGT läge, aldrig ett fel |
| **paket** | Ett känt paket matchar | Sektion 1–17 + paketmodulens sektioner under egen versionerad rubrik |
| **hypotes** | Ett paket ANTAS men är inte belagt | Kör core-only och notera hypotesen i sektion 15. **En antagen bransch aktiverar aldrig en paketmodul** |

**Bakåtkompatibilitet:** en `research.md` skriven mot en ÄLDRE kontraktsversion
förblir läsbar — sektionsnumren 1–17 är stabila. En nyare läsare får aldrig tolka om
en äldre fil; den läser kontraktsversionen ur kontrollraden och behandlar saknade
nyare fält som `OSÄKER`, aldrig som `nej`.

## Vad kontraktet ALDRIG gör

- **Ingen strategi.** Kontraktet samlar fakta; plannern drar slutsatser.
- **Ingen juridisk bedömning.** Sektion 11 är observation med citat; bedömningen sker
  i nod 3 av en människa.
- **Ingen bildnedladdning.** Sektion 7 listar URL:er; nedladdning sker vid BYGGET,
  efter kundens publiceringsgodkännande.
- **Ingen mutabel självuppdatering.** Se färskhetslagen.

## Changelog

- **v3.1.0 — UNIVERSALISERING (MINOR: inget krav lättat, inget fält borttaget, numreringen
  orörd).** Fem sektioner i den universella ryggraden namngav en KUNDTYPS specifika svar i
  stället för att ställa den universella frågan. Fyndet gjordes av masterplanens egen
  Case B-negativkontroll (`backtests/case-b-saas/`), som inte gick att fylla i utan tyst
  avvikelse — och två av ställena var precis det §26 namnger som fällor.
  - **§1** krävde `NAP`. Nu: identitetsuppgifter + adressens ROLL (verksamhetsställe,
    besöksadress eller enbart registrerad hemvist). `lokal-se` skärper till NAP med
    `business.ts` som enda källa.
  - **§5** krävde "belagda arbetsområden/orter". Nu: räckvidden och dess ROLL, där
    nationell eller gränsöverskridande räckvidd är ett GILTIGT svar och inte en saknad ort.
    En negativkontroll skulle annars tvingas svara med en förnekelse.
  - **§6** räknade upp `F-skatt, certifikat, utbildning, försäkring, garanti, omdömen
    (betyg + exakt antal + plattform), portfolio, år i branschen` och arketypen
    `NYSTARTAD — person-först`. **§26 fälla 6 lyder ordagrant *"no F-skatt/local-review/...
    assumptions"* — antagandet fällan finns för att fånga stod alltså i kärnan.** Nu:
    de kvitton som faktiskt bär förtroende i organisationens sammanhang; PAKETET namnger
    vilka. Hela uppräkningen är flyttad till `packs/lokal-se/research-module.md` som
    skärpning, oförändrad i sak.
  - **§12** krävde "2–3 lokala". Nu: 2–3 faktiska alternativ köparen väger mot, inklusive
    en annan lösningsklass eller att inte göra något. Avgränsningen namnger paketet.
  - **§16** frågade efter "omdömen vi får publicera med namn+ort". Nu: omdömen eller
    referenser, och med vilken attribution.
  - Tillagd **UNIVERSALITETSLAGEN** med mekanisk vakt.
  - **Bakåtkompatibilitet:** en `research.md` skriven mot v3.0.0 förblir giltig och läsbar.
    Sektionsnumreringen är oförändrad, inget fält är borttaget, och de tidigare
    uppräkningarna är fortfarande KRAV — men nu via paketmodulen för de kunder de gäller.
    En v3.0.0-fil som bär F-skatt under §6 bryter ingenting.
- **v3.0.0** — Initialt kanoniskt researchkontrakt (S1).
