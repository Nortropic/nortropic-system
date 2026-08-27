# RESEARCH-KONTRAKT — universell kärna v3.0.0

**KONTRAKTSVERSION: 3.0.0** · **KANONISK HEMVIST: denna fil i `nortropic-system`.**

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

## Den universella ryggraden — sektion 1–17

Numreringen är STABIL. Paketmoduler adderar under egna versionerade
paketmodul-rubriker; **den universella numreringen förskjuts aldrig.** En paketmodul
får endast **SKÄRPA** ett krav (fler fält, hårdare bevis) — aldrig lätta på det.

| # | Sektion | Vad som ska stå, i substans |
|---|---|---|
| 1 | **Organisation & typade kontaktvägar** | Juridiskt namn, org-form, NAP; varje kontaktväg TYPAD (telefon · formulär · DM · bokningssystem · fysisk plats) med belägg för att den faktiskt används |
| 2 | **Erbjudande** | Vad organisationen levererar, i dess EGNA ord |
| 3 | **Användare / målgrupper** | Vem som faktiskt kommer, inte vem man önskar |
| 4 | **Toppuppgifter + primärhandlingskandidat** | Vad besökaren kommer för att GÖRA; kandidat till primärhandling med belägg per observation. Motstridiga signaler → båda noteras |
| 5 | **Geografi & språk** | Belagda arbetsområden/orter; språk och eventuell flerspråkighet |
| 6 | **Förtroende/evidens** | Kvitton med belägg: F-skatt, certifikat (namn), utbildning (skola+datum), försäkring, garanti, omdömen (betyg + EXAKT antal + plattform), portfolio, år i branschen. **Saknas kvitton: markera `NYSTARTAD — kvitton saknas, person-först gäller`** och inventera personen i stället. Låna aldrig meriter |
| 7 | **Innehåll + bildmaterial** | Befintligt innehåll värt att bevara; bildinventering (antal, användbara, motivtyper, liggande hero-kandidater, ansiktsporträtt); rättighetsläget ALLTID; strukturerade bild-URL:er per sektion, "kräver original från kund" där exakt URL inte kan extraheras |
| 8 | **Röst/varumärke** | 1–2 exempel ur egna inlägg + 2–3 exempel på branschens eget språk |
| 9 | **Transaktions-/dataobservationer** | Sker betalning, bokning, inloggning eller lagring av persondata? RÅ observation |
| 10 | **Integrationer** | Bokningstjänst, kassa, CRM, nyhetsbrev, kartor — vad som faktiskt används |
| 11 | **Juridik-/riskobservationer** | Hälsa/kropp/medicin · livsmedel · finans/försäkring · barn som primär målgrupp · alkohol/tobak · e-handelsönskemål · inloggning/medlemsdata. **RÅ observation med citat — aldrig bedömning** |
| 12 | **Konkurrenter/alternativ** | 2–3 lokala: URL, en mening om styrka/svaghet, synliga betyg. Ingen djupanalys |
| 13 | **Designreferenser** | Per referens: URL + 2–3 meningars motivering knuten till DENNA kunds material och röst |
| 14 | **Framgångsmått** | Vad kunden vill ska hända, mätbart uttryckt. **Detta fält föder HANDOVER:s Utfallshypotes och därmed LEARNING-RECORD:s `## Hypotes`** |
| 15 | **Kapacitetssignaler** | Observationer som indikerar vilka kapaciteter jobbet kräver (matar kapacitetskatalogen) |
| 16 | **Öppna frågor** | Allt `[OSÄKER]` + standardfrågorna (omdömen vi får publicera med namn+ort? högupplösta original + godkännande? domänönskemål? bokningskanal? vid nystartad: vilka löften vågar du stå för?) |
| 17 | **Maskinläsbar kontrollrad** | Se nedan |

## Sektion 17 — den maskinläsbara kontrollraden

Kontrollraden är GENERALISERAD i den universella kärnan. Paket får **skärpa** den
(kräva fler fält eller hårdare bevis), aldrig lätta på den.

```
RESEARCH-CONTROL v3.0.0 | pack=<paket-id eller "core-only"> | pack_module=<version eller "none">
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
