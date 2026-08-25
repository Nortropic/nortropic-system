# LEARNING-RECORD — kontrakt och mall

En fil per KUNDREPO: `LEARNING-RECORD.md` i kundprojektets rot. **Människoskriven.**
Fylls under den BEFINTLIGA månatliga GSC-retainerceremonin — tio minuter, ingen
dashboard, ingen ny kadens.

**Vad detta INTE är (explicit icke-bygge):** ingen ingestionspipeline, inget
metricslager, inga dashboards, ingen veckokadens, ingen analytics-återläsning.
Ett dokument som en människa fyller i, inget mer.

## PLACERINGSLAGEN — läs denna först

LEARNING-RECORD är **retro-input ENBART**. Den läses aldrig maskinellt, är aldrig
grindinput och är **aldrig promotionsevidens**. Skyddet ligger i PLACERINGEN, inte i
en regel någon kan glömma: i samma ögonblick post-launch-signaler får röra promotion
hamnar de under Goodhart-tryck och slutar mäta verkligheten. Kompetensregistrets
evidenskolumner citerar därför ALDRIG LEARNING-RECORD-rader.

## Mallen

```markdown
# LEARNING-RECORD — <kund>

## Hypotes
1–3 rader, skrivna vid handover, härledda ur briefens §7/framgångsmått.
Detta är HANDOVER:s Utfallshypotes-rad, ordagrant överförd.

## Observation
Datumstämplade RÅA ANTAL + period + nämnare, i tre märkta hälsoaxlar:

### SYSTEM
Puls/uptime/CWV.

### ANVÄNDARUTFALL
Toppuppgiftsevidens, fynd från verkliga användare.

### ORGANISATIONSUTFALL
Framgångsmåttens antal: leads, bokningar, det kunden själv rapporterar.

## Fynd
Taggade ANEKDOT som default. Varje fynd bär två fält:

- **orsaksstatus:** OBSERVERAD_ASSOCIATION | STÖDD | TESTAD
- **verklighetsklass:** SYNTETISK | PRODUKTION | ANVÄNDARE | DOMÄNEXPERT

## Generaliserbarhet
"sannolikt bara denna kund" | "kandidat-mönster — jämför nästa kund"
```

## Lagarna

**1. ANTAL, ALDRIG PROCENT under 500 sessioner per period.** "Noll leads på 60 dagar"
är ett äkta fynd. Procentsatser vid dussintals besök är fiktion med decimaler.
Nämnaren skrivs alltid ut — ett antal utan nämnare är inte ett antal.

**2. De tre hälsoaxlarna hålls isär.** SYSTEM (fungerar sajten), ANVÄNDARUTFALL
(klarar besökaren sin uppgift) och ORGANISATIONSUTFALL (får kunden affär) är olika
frågor med olika åtgärder. En grön SYSTEM-axel har aldrig sagt något om de andra två;
att blanda ihop dem är hur en teknisk sett perfekt sajt får leva vidare utan att ge
kunden en enda kund.

**3. Orsaksstatus styr vad ett fynd får bära.**
- `OBSERVERAD_ASSOCIATION` — vi såg två saker samtidigt. Default.
- `STÖDD` — upprepad, eller mätt mot en baslinje.
- `TESTAD` — experiment.

**Utfallsciterande promotion kräver minst STÖDD.** A/B-test förblir uttryckligen
ICKE-rekommenderat vid SMB-trafik: vid dessa volymer mäter ett A/B-test brus med
auktoritet.

**4. Verklighetsklass — simulering ger skala, verkligheten ger sanning.**
`SYNTETISK` (fixtur/eval/torrkörning) · `PRODUKTION` (skarp drift) · `ANVÄNDARE`
(besökarens beteende/utsaga) · `DOMÄNEXPERT` (kund-SME om SAKFAKTA).
Syntetisk evidens går ALDRIG tyst före verklig evidens. Klassen sätts explicit per
rad — en kundkorrigering av ett UX-antagande är `ANVÄNDARE`, en kundkorrigering av
ett SAKFAKTUM är `DOMÄNEXPERT` (kunden är auktoritet på fakta, aldrig på UX).
**Konsument av DENNA fils rader: retron, och ingen annan.** Fältet `verklighetsklass`
bärs också av erfarenhets-/lärdomsrader i `§Erfarenhet`, och DÄR är promotionsgrindar en
legitim konsument — men en rad härifrån korsar aldrig den gränsen (placeringslagen ovan).
Att fältet har samma namn på båda ställena gör inte raderna utbytbara.

**5. En ANEKDOT lyfter först vid andra kunden.** Ett fynd blir kandidat till
generalisering när en ANDRA kund visar samma riktning — och förslaget måste ändå
namnge sitt rubrik-kriterium. Giltighetsomfånget bärs ORDAGRANT vidare; breddning
argumenteras explicit, aldrig i tysthet.

**6. ODÖMBART är aldrig grönt.** Saknas evidens för en axel eller ett fält skrivs
ODÖMBART med orsak. Ett tomt fält är inte ett utfall.
