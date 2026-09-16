# Agentöverlämning — läs detta först i en ny session

Senast verifierad mot systemet: 2026-08-27 · v2 (denna commit)
Verifieringsomfång: v2 lade till luckornas STATUSVOKABULÄR i §4 — metod, inte status —
efter en inventering som fann statuslagret helt oguardat. Filen finns för att en session
ska kunna rensas utan att
arbetssättet går förlorat. **Den bär METODEN och ÄGARENS ARBETSSÄTT — aldrig teknisk
status.** Statusen bor i `docs/05-beslutslogg.md` och i luckornas egna rader; att duplicera
den här vore att skapa en andra sanning som driftar.

Dokumentnot för domänsynkningen: verifieringsstämpeln ovan är historisk och
omfattar inte de nya tillämpningsstyckena. Ingen ny systemverifiering påstås.

---

## 1. Ägarens arbetssätt

Bootstrap har ett stående autonomimandat mot supervisor resume. Driv
nästa tillåtna steg utan en ny generell godkännandefråga. Bind till
aktuellt uppdrag, rätt domän och faktiskt gällande delegation enligt
AGENTS.md. Webbverksamhetens start-/publiceringsregler är inte i sig
bootstrapens mandat. Gemensamma säkerhetskrav och verkliga human-only-
gränser gäller fortsatt. Denna metodtext skapar ingen ny behörighet.

Ett tekniskt fel stoppar den underkända övergången och dess credit,
inte automatiskt analys, tillåten rättning eller fortsatt verifiering.
Fortsätt sådant arbete inom mandat, roll, skrivyta och försökstillstånd.
En frusen kandidat ändras inte; en tillåten efterföljare följer sin
test-first-/reviewväg. Förbrukade försök bevaras utan credit. Nytt namn,
ny rot eller denna text återställer varken försöksrätt eller credit;
ett nytt försök måste ha verkligt stöd i då gällande mandat.

Skilj stoppad teknisk övergång, vanlig fortsättning, regel från fel
domän, materiellt ägarbeslut och faktisk verktygsspärr. Redovisa
händelse, regel, domän, mandat, hindrad effekt och nästa tillåtna steg.
Vid saknad auktoritetskedja: skriv AUTHORITY_UNVERIFIED, utför tillåtna
kontroller och håll just den obestyrkta effekten stoppad. Anta inte
att varje ny mekanism eller avgränsad prerequisite behöver mänskligt
beslut; pröva den befintliga delegationens villkor först.

Senare mandat gäller framåt, aldrig som historisk auktoritet. Återinför
inte uttryckligen ersatta begränsningar från en gammal handoff. En
aktuell uttrycklig förberedelsebeställning begränsar däremot detta pass.
När den levererats är det korrekt att avsluta; det är inget ägarstopp.
Prova inte förbjudna effekter eller kringgå verktygsspärrar. Om ett
verkligt nytt tillits-/behörighetsbeslut krävs, ange exakt vad som
behöver ändras i stället för att fråga efter generell fullmakt.
Human-only följer den högre regelns ändringsväg; konstitutionen
ändras av människa, inte genom hänvisning till denna överlämning.

Följande arbetsloop, vaktbatteri och genereringskommandon avser
webbverksamhetens underhåll inom dess mandat. De startas inte
automatiskt i ett plattforms- eller bootstrapuppdrag. Där gäller den
aktuella taskens frusna verifiering och giltiga delegation. Ompinning
får aldrig användas för att godkänna den egna ändrade måttstocken.

## 2. Arbetsloopen — varje skiva, utan undantag

1. Bygg i egen worktree, egen `owner/*`-gren.
2. **Mutationspröva.** Skriv mutationer som SKA fälla vakten och kör dem. En vakt som inte
   bevisats fälla är ingen vakt.
3. Rätta varje överlevare — och pröva om.
4. Docs-synk i **SAMMA commit** (regel 22/17): README:s skriptrad · `docs/00-borja-har.md`
   (enkla lagret, klarspråk) · en rad i `docs/05-beslutslogg.md`.
5. `node scripts/kor-vakter.mjs` ska vara grön innan commit.
6. PR med hela resonemanget — fynden, inte bara ändringarna. Merga.

**Ompinning:** vakter med källhash pinnar om sig själva när de ändras. `check-vaktankare.mjs
--pinna-om` uppdaterar pinntabellen. `check-paketlinser.mjs --generera` genererar
linstabellen in i grindworkflowet.

## 3. Det återkommande felet — läs det här två gånger

**Fyra gånger under bygget har samma klass av fel uppstått: jag prövade vad utdata SÄGER i
stället för vad mekanismen GÖR.**

- En vakt som kontrollerade att rapporten skrev *"som förväntat"* — och passerade när
  jämförelsen gjordes alltid-sann.
- En vakt som krävde att ordet `KORREKT` fanns någonstans — och passerade när utsagan ströks.
- En vakt som hashade kontrollNAMN — och passerade när predikatet byttes mot `true`.
- En vakt som krävde en FORMULERING — och fällde en fil som redan gjorde rätt i andra ord.

**Motmedlet är alltid detsamma:** faktorisera ut mekanismen, ge den ett **positivt
kontrollprov** som tvingar den att bevisa att den kan säga NEJ, och lägg till en
**kopplingskontroll** att den faktiskt anropas. En kontrollprövad funktion som kringgås på
anropsstället är död kod.

**Två gånger har `\w` i en regex missat Å/Ä/Ö** och tyst gjort en kontroll blind
(`status=OFULLSTÄNDIG` lästes som `OFULLST`; `**ÄGER**` fångades aldrig). Svenska ord kräver
svenska teckenklasser.

## 4. Lagar som gäller i varje bygge

- **ODÖMBART blir ALDRIG grönt.** exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART.
- **En tom mängd är ett rent resultat först när ankaret är bevisat.** Tom kravmängd, tom
  integrationslista, tomt fixturunderlag — alla är FEL, aldrig frånvaro av krav.
- **Fail-closed åt rätt håll.** Ett okänt värde får aldrig falla tillbaka på den LÖSARE
  vägen; att gissa sig till lösare krav är att inte ha en grind.
- Skärpningslagen i webbpaketen avser webbverksamhetens gemensamma
  kund-/paketregler, inte en påstådd generell H034-funktion.
- **En stängd lucka står kvar som rad.** Kravet VÄNDS i stället för att strykas — annars
  går stängningen inte att kontrollera, och en halv stängning läses som hel.
- Syntetisk evidens bär inte en verksamhetskapacitet till PROVEN enligt
  dess skyddade statuskontrakt. Tekniskt gate-PASS har sitt eget
  avgränsade bevisvärde och är inte verklig kundnytta.

### Luckornas statusvokabulär — sluten, och den bor här för att den är METOD

En lucka bär sin status på sin egen **rad-av-protokoll**: en tabellrad vars FÖRSTA cell
namnger luckan, eller en rubrik som INLEDS med luckans id. Statusen står i den raden och
ingen annanstans; mängden är sluten och `check-luckregister.mjs` läser den härifrån.

<!-- LUCKSTATUS: BÖRJAN — check-luckregister.mjs extraherar vokabulären ur den här tabellen -->

| Status | Betyder |
|---|---|
| `NOT_STARTED` | Erkänd, men ingen väg fram är ens formulerad |
| `NAMNGIVEN` | Öppen och medvetet accepterad — gränsen är utskriven, inte gömd |
| `DELVIS ÅTGÄRDAT` | En halva är gjord och den andra halvan är NAMNGIVEN i samma rad |
| `ÅTGÄRDAT` | Felet är borta, men kravet står kvar som vänt krav |
| `STÄNGD` | Kravet är uppfyllt och bevisat; raden står kvar VÄND |
| `ÖPPEN` | Återöppnad efter att ha stått stängd — aldrig ett förstaläge |

<!-- LUCKSTATUS: SLUT -->

**Varför inget luckregister byggs.** Ett register vore en ANDRA sanning om status, och den
driftar. Vakten jämför i stället raderna-av-protokoll **mot varandra** — två rader som säger
olika om samma lucka fäller, och en lucka utan rad fäller. Det kräver ingen andra yta.

## 5. Vad som INTE ska byggas, och varför

**Paketets eval-modul.** Den skarpa rubriken har ingen paketdel; att lägga till en är en
§A2-ändring av mätstocken, som ägs av människan. En tredje yta med paketkriterier vore en
ANDRA mätstock (§10). **Rätt ordning är att utmanarrubriken först antas eller förkastas av
en människa.** Detta är inte "hann inte" — det är "ska inte förrän ägaren avgjort mallen".

## 6. Var statusen faktiskt står

| Fråga | Fil |
|---|---|
| Vad som beslutats och varför | `docs/05-beslutslogg.md` (nyast sist) |
| Vad som är byggt, i klarspråk | `docs/00-borja-har.md` |
| Vilka vakter som finns | `README.md`:s skriptrad · `node scripts/kor-vakter.mjs` |
| Öppna luckor | sök `-GAP-` i trädet; varje har en rad med nästa transition — `check-luckregister.mjs` fäller om en saknas eller om två rader säger olika |
| Kapaciteternas mognad | `docs/kapacitetskatalog.md` |

Ingen teknisk status eller generell nästa körorder upprepas här.
Läs den aktuella domänens status och därefter dess giltiga task,
verifierare och mandat. En testklient, färdig webbhuvudkedja eller
gammal handoff är inte bevis på aktuell bootstrap- eller supervisorberedskap.
