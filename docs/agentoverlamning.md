# Agentöverlämning — läs detta först i en ny session

Senast verifierad mot systemet: 2026-08-27 · v1 (denna commit)
Verifieringsomfång: nyskapad. Filen finns för att en session ska kunna rensas utan att
arbetssättet går förlorat. **Den bär METODEN och ÄGARENS ARBETSSÄTT — aldrig teknisk
status.** Statusen bor i `docs/05-beslutslogg.md` och i luckornas egna rader; att duplicera
den här vore att skapa en andra sanning som driftar.

---

## 1. Ägarens arbetssätt

Ägaren (Johnny) vill att arbetet drivs **autonomt hela vägen**: bygga, mutationspröva,
committa, öppna PR och merga utan att fråga. Merge-/push-befogenhet är uttryckligen given.

**Han reagerar starkt när något påstås vänta på honom.** Det har hänt två gånger —
*"varför krävs min hand?"* och *"hur väntar det på mig?"* — och **båda gångerna hade han
rätt**: spärren fanns inte längre, eller så var det jag som inte tänkt färdigt.

> **Testa spärren innan du kallar den en spärr.** Ett `Edit`-försök tar tre sekunder. Att
> lista något som "ägarbeslut" utan att pröva om det stämmer är samma fel som att anta att
> en vakt är grön utan att mutationspröva den.

**Skilj alltid på tre klasser och namnge vilken det är:**

| Klass | Exempel |
|---|---|
| **(a) Hans beslut på riktigt** | pengar · §A-ytor · mätstocken (eval-rubriken) |
| **(b) Mina operativa gränser** | jag startar inte agenter och skapar inte extern infrastruktur självmant |
| **(c) Byggbart av mig** | allt annat — och det ska då vara byggt, inte listat |

Säger han *"fixa dessa grejer"* om en §A-yta: **gör det**, men HÖGRISK-märk och citera
instruktionen i både commit och beslutslogg.

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
- **Skärpningslagen:** ett paket får smalna av kärnan, aldrig lätta den.
- **En stängd lucka står kvar som rad.** Kravet VÄNDS i stället för att strykas — annars
  går stängningen inte att kontrollera, och en halv stängning läses som hel.
- **Syntetisk evidens bär aldrig något till `PROVEN`.**

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
| Öppna luckor | sök `-GAP-` i trädet; varje har en rad med nästa transition |
| Kapaciteternas mognad | `docs/kapacitetskatalog.md` |

**Ingen status upprepas här.** Den enda uppgiften som inte finns någon annanstans: nästa
steg som faktiskt flyttar systemet är **en körning mot en riktig testklient** — huvudkedjan
är byggd, och det mesta som återstår är sidospår (gym-banan, förbättringslanen) eller
väntar på ägarens beslut om mätstocken.
