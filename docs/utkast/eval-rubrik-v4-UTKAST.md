# Eval-rubrik v4 — UTKAST

**Rubrikversion: `v4.0.0-UTKAST`** · **Status: `EXPERIMENTAL / CHALLENGER / NOT_PRODUCTION`**

Skapad: 2026-08-26 · Ankare: den återfunna masterplanens §7 (Rubric v4) och Part 12 steg 7
(*"Draft/challenger now; production activation only at trigger"*).

---

## PLACERINGSLAGEN — vad den här filen ÄR och inte är

**Produktionsmåttet är och förblir `skills/nortropic-eval/references/eval-rubric.md` (v3.0.0).**
Den filen är §A2-skyddad och är BYTE-ORÖRD av denna skiva. Ingen version är bumpad, inget
kriterium ändrat, ingen tröskel flyttad, ingen baseline klippt.

Den här filen är ett **utkast**: en utmanare som får läsas, kritiseras och falsifieras —
aldrig tillämpas.

| | |
|---|---|
| **Hemvist** | `docs/utkast/` — medvetet UTANFÖR varje skills laddningsväg |
| **Konsument** | Ingen. Ingen grind, ingen skill, ingen agent och inget workflow läser filen. De enda tillåtna omnämnandena är `docs/00-borja-har.md` och `docs/05-beslutslogg.md`, som beskriver utkastet för en läsare — aldrig för en körning |
| **Varför inte i `skills/nortropic-eval/references/`** | Eval-domaren instrueras att läsa rubriken ur `references/`. En andra rubrik i samma katalog är en fälla: det räcker att en domare öppnar fel fil för att ett NOT_PRODUCTION-mått ska ha dömt en kund |
| **Auktoritet** | Ingen. Enligt inventeringsmetoden (§35): *"Do not promote UTKAST/paper tranche material to authority"* |
| **Vägen till produktion** | S6 — egen HÖGRISK-ceremoni, mätregimsövergång och baselineomklipp. Aldrig genom att någon börjar använda filen |

`scripts/check-v4-utkast.mjs` vaktar de här påståendena mekaniskt över **hela det spårade
trädet** (`git ls-files`), inte över en handskriven kataloglista. Faller den, är utkastet
på väg att bli auktoritet i tysthet.

---

## 1. Varför v4 — luckan är MÄTT, inte antagen

S5 delade grindarna i universell kärna och paketlins. **Måttstocken följde inte med.**
Divergensen står svart på vitt i repot:

| Yta | Vad den säger om en `core-only`-sajt |
|---|---|
| `workflows/nortropic-launch.js` (Gate 5, S5) | *"Vid `core-only` är frånvaron av ortssidor och lokala schemadelar KORREKT — rapportera det ALDRIG som ett fynd"* |
| `skills/nortropic-eval/references/eval-rubric.md` kriterium 5 | *"vid `varumarke` ges dessa 4 p när ortssidor korrekt UTELÄMNATS"* — sajten får POÄNG för en frånvaro |

Grinden säger *inte tillämpligt*. Rubriken säger *4 poäng*. Båda kan inte ha rätt.

**Den flata summan är problemet.** v3 lägger 24 av 100 poäng i kriterierna 4 (NAP, 8 p),
5 (Lokal SEO, 8 p) och 6 (Schema-korrekthet, 8 p). Alla tre bär `lokal-se`-antaganden:
NAP-prominens, ortsarkitektur `[tjänst] i [stad]`, `LocalBusiness`-subtyp med
`openingHoursSpecification`. En kund med `paket: []` mäts därför mot krav som inte gäller
hen, och utfallet blir ett av två fel:

- **poäng för frånvaro** — totalen blåses upp av 24 poäng som inte mätte någonting; eller
- **avdrag för frånvaro** — sajten straffas för att inte vara en lokal tjänsteverksamhet.

Båda gör totalen ojämförbar mellan kunder samtidigt som den SER jämförbar ut. Det är den
farliga sorten: ett tal som bär mer förtroende än det förtjänar.

**Den andra luckan är omvänd.** v3:s totalsumma låter en stark kärna dölja en katastrof:
en sajt med divergent NAP mellan `business.ts` och footern tappar högst 8 poäng och kan
fortfarande landa på 88 → *"åtgärda de listade punkterna"* — trots att regel 9 klassar
varje NAP-avvikelse som CRITICAL. Samma sak i kärnan: en sajt vars primärhandling inte
fungerar end-to-end tappar 15 poäng och landar på 85, i näst högsta bandet, trots att
"exakt EN primärhandling, testad på riktigt end-to-end" är en INVARIANT.

Masterplanen §7 kräver därför tre saker av v4: **universell kärna · paketslot ·
tillämplighets- och hårdfelssemantik som hindrar att en stark kärnpoäng döljer ett
katastrofalt paketfel.** Konstruktionen nedan är svaret på exakt de tre.

---

## 2. Konstruktionen — två mått som ALDRIG summeras

v4 rapporterar inte ett tal. Den rapporterar ett **domslut med delar**:

```
KÄRNA           nn/NN   band
PAKET lokal-se  nn/NN   band        (per aktivt paket)
HÅRDA GRINDAR   PASS | FÄLLD
DOMSLUT         <det sämsta av delarna enligt bandordningen i §8>
```

**Varför de aldrig summeras:** en summa kräver en vikt mellan kärna och paket, och den
vikten finns inte belagd någonstans. Att uppfinna den vore precis det slags
självförtroende utan belägg som resten av systemet finns för att förhindra — och en summa
återskapar dessutom exakt det gömställe §7 kräver att v4 stänger.

**Kärnan är 109 poäng, inte 100. Avsiktligt.** En v4-kärnpoäng får aldrig kunna läsas som
en v3-total. Skalorna är olika mått på olika mängder kriterier; likheten i storleksordning
vore en inbjudan till en omräkning som planen uttryckligen förbjuder (§7: *"Raw v3 and v4
totals are never converted or tuned to mimic each other"*).

---

## 3. Tillämplighetssemantiken

Varje kriterium står i exakt ett av tre lägen, **läst ur sajtens eget kontrakt**
(`content/profile.ts`, Site Quality Contract v2) — aldrig gissat ur hur sajten ser ut.

| Läge | Betydelse | Verkan på poängen | Verkan på nämnaren |
|---|---|---|---|
| `TILLÄMPLIG` | Kontraktet aktiverar kriteriet | Poängsätts | Ingår |
| `EJ TILLÄMPLIG` | Kontraktets egna fält säger att kravet inte gäller | Varken poäng eller avdrag | **Räknas bort** |
| `ODÖMBAR` | Kriteriet gäller men går inte att döma | Varken poäng eller avdrag | **Räknas bort** — men bandet kapas (§8) |

**Fyra lagar som gör lägena ärliga:**

1. **`EJ TILLÄMPLIG` måste namnge fältet och värdet** som gjorde det så
   (`paket: []`, `seoLage: 'varumarke'`). En tillämplighet utan namngivet kontraktsfält
   är en gissning och räknas som `ODÖMBAR`.
2. **En frånvaro är okunskap, aldrig ett nej.** Saknas fältet i profilen — en v1-profil
   där v2-fälten läses som `SAKNAS_I_V1` (S4:s bakåtkompatibilitetslag) — blir kriteriet
   `ODÖMBAR`, ALDRIG `EJ TILLÄMPLIG`. En saknad `paket`-lista betyder inte `core-only`;
   den betyder att vi inte vet. Rubriken gissar aldrig; människan backfillar kontraktet.
3. **`ODÖMBAR` konverteras aldrig.** Inte till noll (det vore att uppfinna ett fel) och
   inte till full poäng (det vore att uppfinna en bedrift). Den lämnar nämnaren av exakt
   samma skäl som `EJ TILLÄMPLIG` gör det — en post kvar i nämnaren med noll poäng ÄR ett
   avdrag — men till skillnad från `EJ TILLÄMPLIG` kapar den bandet. Tri-state-domar där
   ODÖMBART aldrig blir grönt är en bevarad systemegenskap, inte en nyhet här.
4. **En katastrof följer sitt kriteriums tillämplighet.** Är kriteriet `EJ TILLÄMPLIG`
   kan dess `KK`/`PK` inte fällas — annars vore ett kriterium som lämnat mätningen ändå
   kvar som fällningsgrund. Fallet försvinner inte: det som ändå är fel fångas av `K7`
   (strukturtrohet och paketläckage), som gäller alltid.

**Nämnaren blir per sajt.** Det är den ärliga konsekvensen: två sajter med olika
tillämplighetsmängd har inte mätts mot samma sak, och deras tal får inte ställas bredvid
varandra utan att skillnaden namnges. v3 dolde det problemet bakom en fast 100:a; v4
skriver ut det (§7 nedan).

---

## 4. Hårda grindar och katastroflägen

Poäng är gradering. Det här är inte gradering — det är fällning, oavsett poäng.

### HG — hårda grindar (fäller HELA evalen)

| ID | Villkor | Ankare |
|---|---|---|
| `HG-1` | **Faktatrohet.** Ett enda ospårbart eller ogaterat faktapåstående | Regel 1 · invariant · v3 kriterium 2 (oförändrad) |
| `HG-2` | **Förbjudna påståenden.** Sajten påstår något `forbjudnaPastaenden` förbjuder | §7.14a via `profile.ts` |
| `HG-3` | **Vallgraven.** `statelesshet.hallerTillstand === true` | D8 · S4:s stateless-vakt |

`HG-3` är ingen FAIL utan en **DISKVALIFIKATION**: evalen vägrar producera ett tal.
En sajt som håller eget tillstånd är inte en dålig Nortropic-sajt, den är inte en
Nortropic-sajt. Vakten får aldrig omformuleras till ett avdrag.

### KK — kärnkatastrofer (fäller KÄRNAN oavsett kärnpoäng)

| ID | Villkor | Varför inte bara poängavdrag |
|---|---|---|
| `KK-1` | Primärhandlingen fungerar inte end-to-end | Invarianten säger *testad på riktigt end-to-end*. Ett 15-poängsavdrag lämnar sajten i näst högsta bandet |
| `KK-2` | En kontaktuppgift på någon renderad yta — footer, kontaktsida, CTA **eller schema** — bär ett ANNAT VÄRDE än `content/business.ts` | Regel 9: `business.ts` är enda källan, varje avvikelse är CRITICAL. Ett fel telefonnummer betyder att kunden inte går att nå. **Avgränsning:** enbart FORMATskillnad (mellanslag, bindestreck) är avdrag i `K10`, aldrig `KK-2`. **Hela den interna divergensen bor här** — paketets katastrofer rör aldrig kontaktuppgifternas värden |
| `KK-3` | **Paketläckage.** Ett INAKTIVT pakets bärande yta finns byggd — t.ex. ortsarkitektur `[tjänst] i [stad]`, ortssidor eller `LocalBusiness`-subtyp på en sajt med `paket: []` | Case B:s första fälla: *"office address must not trigger local-search/NAP prominence."* Fabriken har då byggt fel sorts sajt. Ett poängavdrag hade låtit negativkontrollen passera |

### PK — paketkatastrofer (fäller PAKETET oavsett paketpoäng)

För `lokal-se`. Villkoren är **disjunkta** — varje fel har exakt en hemvist:

| ID | Villkor | Ankare |
|---|---|---|
| `PK-L1` | Den lokala ytan matchar inte **Google Företagsprofil** (extern matchning) | Regel 9: *"måste exakt matcha Google Företagsprofil"*. Intern divergens mot `business.ts` hör till `KK-2` och fälls aldrig här |
| `PK-L2` | Mallade ortssidor — samma text med ortsnamnet utbytt | v3 kriterium 5; drar i dag 4 p och kan döljas av en stark total. Följer `P-L2`:s tillämplighet (§3 lag 4) |
| `PK-L3` | `LocalBusiness`-schemats STRUKTUR är fel — otillåten subtyp mot `schemaTyp`, saknad eller felaktig `openingHoursSpecification`, eller platshållartext (`TODO-FACT`/`TODO-COPY`) som läcker in i schemat | v3 kriterium 6. Schemats NAP-VÄRDEN hör till `KK-2`, aldrig hit |

### Anti-gömställeregeln

> **DOMSLUTET ÄR DET SÄMSTA AV DELARNA — aldrig ett medelvärde, aldrig en summa.**

Operatorn "sämst" är inte en bedömning: bandordningen i §8 är en total ordning, och
domslutet är minimum enligt den. En fälld `PK` gör domslutet FAIL även vid kärna 109/109.
Det är hela poängen med §7:s krav: en stark kärna får inte kunna bära ett katastrofalt
paketfel över mållinjen.

---

## 5. KÄRNAN — 109 p, gäller varje sajt oavsett paket

PASS per kriterium = **≥ 70 % av vikten**, utskrivet som heltal per rad.

**ETT FEL DRAS PÅ EXAKT ETT STÄLLE — även inom kärnan.** Kriterierna överlappar i sak, och
varje överlapp har en utskriven ägare: primärhandlingens egen kedja tillhör `K1` och
aldrig `K3` · schemats VALIDITET tillhör `K6`, dess lokala STRUKTUR `P-L3` och dess
NAP-VÄRDEN `KK-2` · sitemap/robots och döda länkar tillhör `K12`, aldrig `K6` ·
kontaktuppgifternas konsistens tillhör `K10`, den lokala GBP-matchningen `P-L1`. En
dubbeldragning gör poängen till en funktion av var felet råkade upptäckas.

| # | Kriterium | Vikt | PASS | Tillämplighet |
|---|---|---|---|---|
| `K1` | **Konverteringsarkitektur** — primärhandlingen enligt `primaraktion`/`gate1Test` omedelbart nåbar, mobilergonomisk, ≤5 formulärfält där formulär ingår. Fem delkrav à 3 p (se kravnivån nedan) | 15 | 11 | Alltid · bär `KK-1` |
| `K2` | **Faktatrohet** — varje faktapåstående spårbart till `research.md`; osäkert utelämnat eller korrekt gaterat | 15 | 11 | Alltid · bär `HG-1` |
| `K3` | **Toppuppgifter & obligatoriska resor** — varje resa i `obligatoriskaResor` prövad end-to-end på 375 px och desktop; `toppuppgifter` genomförbara. **INGÅR INTE: primärhandlingens egen kedja — den ägs av `K1`, dubbelrapportera aldrig** (S5:s reselins, ordagrant) | 12 | 9 | `ODÖMBAR` när fälten är `SAKNAS_I_V1` |
| `K4` | **Copy-kvalitet** — röst enligt `rostregister`, bas-blocklistan + `branschAntislop` ren, idiomatisk svenska, konkret före generiskt | 10 | 7 | Alltid (se öppen fråga Ö1) |
| `K5` | **Visuell distinktion** — läses som handbyggd premium; döms mot design-blocklisten, template-testet och PK-1…PK-8 med `premium-bevis.md` som tak-bevis | 10 | 7 | Alltid |
| `K6` | **Teknisk SEO-kärna** — canonicals, unik `<title>` + meta per sida, H1-integritet, indexerbarhet (oavsiktlig noindex), schemat VALIDERAR mot den typ kontraktet namnger, strukturerad data utan TODO-markörer | 10 | 7 | Alltid |
| `K7` | **Strukturtrohet & paketläckage** — sajten bygger det kontraktet säger och inget kontraktet inte säger | 6 | 5 | Alltid · bär `KK-3` |
| `K8` | **Prestanda** — `nortropic-prelaunch`-skillens `lighthouse-targets.md` (mobil, produktionsbygge, median av 3) | 8 | 6 | `ODÖMBAR` utan mätyta — aldrig en statisk gissning som grön poäng |
| `K9` | **Juridik komplett** — integritetspolicy, företagsuppgifter, cookie/samtycke mot vad som faktiskt laddas. *Poäng ≠ juridiskt godkännande; juridik stoppar alltid för människan* | 8 | 6 | Alltid (se öppen fråga Ö2) |
| `K10` | **Kontaktuppgifternas konsistens** — varje renderad kontaktyta (footer, kontaktsida, schema, CTA) bär samma värden som `content/business.ts`, den enda källan. Gäller VÄRDET; den lokala prominensen mäts i `P-L1` | 5 | 4 | Alltid · bär `KK-2` |
| `K11` | **Förtroendesignaler** — kvitton enligt `kvitton` och dess attributionsregler nära hero; gaterade platshållare är korrekt hantering, aldrig avdrag | 5 | 4 | Alltid |
| `K12` | **Teknisk hygien** — inga döda interna länkar, fungerande 404, sitemap/robots serveras korrekt, `npm audit` rent (prod), säkerhetsheaders servade, formulär-endpoint skyddad | 5 | 4 | Alltid (se öppen fråga Ö1) |

**Summa: 109 p.**

### `K1`:s kravnivå — ankrad, inte överlämnad till domarens dagsform

v3 räknar upp offert/samtal-fallets fem delkrav konkret, och v4 ärver dem ordagrant som
**ankrat exempel**: tel:-länkar på varje telefonnummer · sticky header med synligt nummer
+ ring-knapp på alla sidor · primär CTA above the fold på varje sidmall · offertformulär
≤ 5 fält, inte gömt bakom modal · flytande ringknapp på mobil (≥56 px, tumräckvidd).

**Annan primärhandling ger fem motsvarande delkrav à 3 p härledda ur `primaraktion`/
`gate1Test` — samma kravnivå, samma avdragslogik.** Klausulen är inte dekoration: utan
den blir en härledd lista domarberoende, och §26:s Case A kräver att den lokala
defektkänsligheten ÖVERLEVER kärna/paket-delningen. En rubrik som tappar kravnivån har
inte generaliserat kriteriet, den har urvattnat det.

### `K7`:s tre delkrav

- **Sökstrukturen svarar mot `seoLage`** — `lokal`/`hybrid` ger ortsarkitektur,
  `varumarke` ger varumärkes-/tjänstestruktur utan ortsjakt. Positiv aktivering, inte
  bara frånvaro — 2
- **Inget INAKTIVT pakets yta finns på sajten** — vid `paket: []`: inga ortssidor, ingen
  lokal NAP-prominens, ingen `LocalBusiness`-subtyp — 2
- **De kapaciteter `kapaciteter` aktiverar syns i bygget**, och `ROUTE-OUT` är hänvisad,
  aldrig planerad runt — 2

**`K7` är svaret på Case B.** §26 kräver att negativkontrollen PASSAR endast vid *både*
explicit frånvaro av lokalt läckage *och* positiv aktivering av rätt semantik. Utan `K7`
bor varje instrument för detta i `lokal-se`-modulen — som är `EJ TILLÄMPLIG` exakt när
kunden inte är lokal, alltså precis i det fall Case B prövar. Det vore ett falskt godkänt
på negativkontrollen och en regression mot v3, som mäter sökstrukturen universellt.

---

## 6. PAKETSLOTEN

Ett paketmodul poängsätts **endast** när `paket` innehåller paketets id. Modulen bär egen
summa, egna trösklar, eget band och egen katastroflista. Kärnan rörs aldrig av att ett
paket läggs till — ett paket får SKÄRPA, aldrig omdefiniera kärnan.

`paket: []` (core-only) är ett **giltigt** bygge: hela modulen står `EJ TILLÄMPLIG` med
namngivet fält, och sajten mäts på kärnan allena — där `K7` mäter att core-only faktiskt
byggdes som core-only. `paket` som `SAKNAS_I_V1` är däremot `ODÖMBAR` — inte core-only.

**Ett paket utan modul är `ODÖMBAR`, aldrig core-only.** Bär kontraktet ett paket-id som
v4 inte har en modul för, saknas mätningen — den finns inte. Att då tyst mäta sajten som
core-only vore att rapportera frånvaron av ett mått som ett godkänt mått. Domslutet kapas
till `ODÖMBAR` tills modulen finns.

### Paketmodul `lokal-se` — 24 p

| # | Kriterium | Vikt | PASS | Tillämplighet |
|---|---|---|---|---|
| `P-L1` | **Lokal NAP-yta** — matchning mot Google Företagsprofil, E.164 i `LocalBusiness`-schemat, adressens prominens, AB-namn vs `displayName`. *Den interna konsistensen mot `business.ts` mäts i `K10` och räknas ALDRIG två gånger* | 8 | 6 | När paketet är belagt · bär `PK-L1` |
| `P-L2` | **Lokal sökstruktur & ortssidor** — `[tjänst] i [stad]`-arkitekturen; ortssidor med genuint unikt innehåll (landmärken, restider, jobb) | 8 | 6 | `EJ TILLÄMPLIG` när `seoLage: 'varumarke'` · bär `PK-L2` |
| `P-L3` | **Lokal schemayta** — `LocalBusiness`-subtyp enligt `schemaTyp`, svensk `PostalAddress`, `openingHoursSpecification`, ev. jour/ContactPoint | 8 | 6 | När paketet är belagt · bär `PK-L3` |

**Här sitter fixen.** Vid `seoLage: 'varumarke'` ger v3 fyra poäng för att ortssidorna
korrekt utelämnats. v4 ger noll poäng och tar bort kriteriet ur nämnaren: paketet mäts
16/16 i stället för 24/24. Sajten belönas inte för en frånvaro, och den straffas inte för
den — den mäts inte på den. Att strukturen ÄR rätt mäts i stället i `K7`, där den hör
hemma, eftersom den frågan gäller varje kund.

---

## 7. Jämförbarhet

Varje scorecard bär en **tillämplighetssignatur**: rubrikversion, kärnnämnare,
paketnämnare per paket, och listan över `EJ TILLÄMPLIG`/`ODÖMBAR` med orsak.

```
v4.0.0-UTKAST · kärna 96/109 · paket lokal-se 16/16 · EJ TILLÄMPLIG: P-L2 (seoLage=varumarke)
```

1. **Två tal med olika signatur jämförs aldrig utan att skillnaden namnges.**
2. **Bandet härleds ALDRIG ur totalen** (§8). Totalen är en trendsiffra inom samma
   signatur — inte domen.
3. **Ingen omräkningstabell v3↔v4 finns, får finnas eller kommer att tas fram.**
   Case A:s numeriska v3↔v4-likhet är diagnostik, aldrig en befordringströskel.
4. **Vad Case A faktiskt kan jämföra under v4.** §26 formulerar diagnostiken som
   *"numeric v3↔v4 total equality"* — den storheten FINNS INTE i v4: nämnaren varierar
   per sajt och totalen är inte domen. Case A:s diagnostik under v4 är därför
   **kriterievis statusöverensstämmelse på den lokala fixturen** — samma defekter ska
   fällas av v4 som av v3, och varje avvikelse ska ha en namngiven orsak. Att jämföra
   totalerna vore att göra just den omräkning punkt 3 förbjuder.

---

## 8. Domslutet

**Bandet räknas på kriteriernas STATUS, inte på summan.** En sajt ska inte kunna samla
ihop sig till ett grönt band på lätta poäng medan ett bärande kriterium ligger nere.

**Bandordningen är en TOTAL ordning, sämst först:**

> `DISKVALIFICERAD` < `FAIL` < `ODÖMBAR` < `BETYDANDE OMARBETNING` < `ÅTGÄRDA` < `LANSERINGSKLAR`

**Kärnband — FÖRSTA MATCHANDE RADEN UPPIFRÅN GÄLLER:**

| Band | Villkor |
|---|---|
| `DISKVALIFICERAD` | `HG-3` fälld |
| `FAIL` | `HG-1` eller `HG-2` fälld, eller någon `KK` fälld |
| `ODÖMBAR` | Någon `ODÖMBAR` post kvarstår — **blir aldrig grönt** oavsett poäng |
| `BETYDANDE OMARBETNING` | 3 eller fler kärnkriterier FAIL, eller `K1`/`K2`/`K3` FAIL |
| `ÅTGÄRDA` | 1–2 kärnkriterier FAIL, och inget av dem är `K1`, `K2` eller `K3` |
| `LANSERINGSKLAR` | Noll FAIL bland de tillämpliga kärnkriterierna |

Utan "första matchande raden gäller" är trappan inte en trappa: noll FAIL uppfyller både
`ÅTGÄRDA` och `LANSERINGSKLAR`, och en läsare som får rätt svar får det av tur.

**En konsekvens värd att säga rakt ut:** `K8` (Prestanda) är `ODÖMBAR` utan mätt yta,
och `ODÖMBAR` kapar bandet. En sajt som aldrig deployats kan därför inte nå
`LANSERINGSKLAR` under v4 — inte som ett förbiseende utan som avsikten. Ett
lanseringsbeslut som vilar på en statisk gissning om prestanda är ett lanseringsbeslut
utan mätning, och rubriken ska inte kunna ge det ett grönt band.

**Paketband:** samma trappa på modulens egna kriterier; en fälld `PK` ger `FAIL` direkt.

**Sajtens domslut:** minimum av kärnbandet och samtliga paketband enligt ordningen ovan.

### Scorecard-form (utkast)

```
# EVAL-RESULT — <projekt>
Datum: <YYYY-MM-DD> · Rubrik: v4.0.0-UTKAST (NOT_PRODUCTION — ej giltig som leveransdom)
Signatur: kärna nn/NN · paket <id> nn/NN · EJ TILLÄMPLIG: <lista med fält=värde>
Hårda grindar: HG-1 PASS | HG-2 PASS | HG-3 PASS
DOMSLUT: <DISKVALIFICERAD | FAIL | ODÖMBAR | BETYDANDE OMARBETNING | ÅTGÄRDA | LANSERINGSKLAR>
         (sämsta delen: <kärna | paket <id>>)

## Kärna
| # | Kriterium | Vikt | Poäng | Status |
## Paket <id>
| # | Kriterium | Vikt | Poäng | Status |
## ODÖMBARA poster
| # | Orsak | Vad som skulle göra den dömbar |
```

---

## 9. Aktivering — vad som INTE händer här

Utkastet är `NOT_PRODUCTION` och blir inte annat av att någon tycker det är bättre.

**Utlösare (endast dessa två):**
1. Första produktionsprojektet vars kvalitetskontrakt inte kan utvärderas av v3 utan
   distorsion; **eller**
2. uttryckligt ägar-go-live.

**Aktiveringen (S6) kräver, allt av det:**

- egen **HÖGRISK**-ceremoni för mätregimsövergången — v4 rör §A2-ytan, och §A2 ändras
  aldrig av en agent;
- **omklipp av eval-baselinen** (`tests/fixtures/eval-baseline.md`) — v3-totaler och
  v4-domslut är olika mätningar;
- att `skills/nortropic-eval/SKILL.md` pekar om — domaren läser en rubrik, aldrig två;
- **backfill av kontrakten.** Det här är aktiveringens verkliga pris och det ska stå
  utskrivet: varje levande kundrepo med en v1-profil saknar `paket`, `obligatoriskaResor`
  och `toppuppgifter`, och blir därmed `ODÖMBAR` under v4 — inte grön, inte röd. Antingen
  backfillas kontrakten (S4:s migrationsregel: additivt, ur briefen, aldrig gissat) eller
  så fattar ägaren ett uttryckligt övergångsbeslut. Ett aktiveringsförsök utan det svaret
  gör varje befintlig kund odömbar över natten.

Före den ceremonin gäller v3, oavkortat.

---

## 10. Vad utkastet INTE hävdar

- **Vikterna är förslag, inte mätningar.** 15/15/12/10/10/10/6/8/8/5/5/5 är härledda ur
  v3:s balans och ur vad kontraktet faktiskt bär — inte ur utfallsdata. Ingen kund har
  poängsatts med dem.
- **Ingen rad vilar på riktig kundevidens.** Statusen `EXPERIMENTAL` är inte blygsamhet
  utan bokföring: syntetisk evidens bär aldrig något över `VALIDATING`, och det här
  utkastet står under det.
- **Konstruktionen är falsifierbar och SKA falsifieras.** De två frusna backtesterna är
  provet: **Case A** (lokal fixtur — lokal semantik och defektkänslighet måste överleva
  kärna/paket-delningen) och **Case B** (B2B SaaS negativkontroll — core-only-vägen ska
  bära en kund som är medvetet fel för lokal-antagandena, utan lokalt läckage och med
  positiv aktivering av rätt semantik). Utan S7/S8 är den här filen en hypotes.
- **Ingenting i systemet ändras av att filen finns.** Invarianterna står, faktatroheten är
  hård grind, juridiken är human-only, grindarnas kravnivåer är orörda.

---

## 11. Öppna frågor — ägarbeslut, inte agentbeslut

| # | Fråga | Varför den inte avgörs här |
|---|---|---|
| `Ö1` | `K4` antar **svenska**, och `K12` kräver en fungerande 404 på svenska. Ett icke-svenskt kontrakt behöver en språkmodul — hör den till kärnan eller till en `sprak-*`-slot? | Kärnan påstås vara universell. Så länge språket sitter hårdkodat i den är påståendet inte helt sant, och att uppfinna en språkmodul utan en kund som behöver den vore bygge före efterfrågan |
| `Ö2` | `K9` antar **svensk jurisdiktion** (org.nr, F-skatt). Samma fråga | Samma skäl |
| `Ö3` | Ska `interventionsbeslut ≠ 'NY SAJT'` (FÖRBÄTTRA BEFINTLIG / ICKE-SAJT-ÅTGÄRD / AVRÅD) ha egen tillämplighetsverkan? | En förbättringsleverans mäts delvis på annat än en ny sajt. Att avgöra det utan ett verkligt sådant uppdrag vore att gissa |
| `Ö4` | Backfill kontra övergångsregel för v1-profiler vid aktivering (§9) | Rör levande kundrepon — ägarceremoni |
| `Ö5` | `kvalitetsnivaer` (assuranceprofilen: `STANDARD` som default, höjd nivå bär `skal`) har INGEN verkan i utkastet. Ska en höjd nivå lyfta PASS-trösklarna, och i så fall med vad? | Fältet finns byggt sedan S4, så luckan är verklig och namnges hellre än göms. Men varje avbildning nivå→tröskel jag kunde skriva vore ett påhittat tal: ingen kund har ännu begärt en höjd nivå, och en tröskel utan belägg är precis den sortens siffra rubriken finns för att inte producera |

---

## Changelog

- **`v4.0.0-UTKAST`** (2026-08-26) — Första utkastet. Universell kärna 109 p över tolv
  kriterier · paketslot med `lokal-se` som första modul (24 p) · tillämplighetssemantik
  i tre lägen läst ur `profile.ts` · hårda grindar `HG-1…3`, kärnkatastrofer `KK-1…3`,
  paketkatastrofer `PK-L1…3` · domslut som minimum enligt en total bandordning, aldrig
  summa eller medelvärde · band härlett ur kriteriestatus, aldrig ur totalen. Inget
  produktionsmått ändrat; `eval-rubric.md` v3.0.0 byte-orörd.

  **Rättat i granskningen före leverans — tre defekter av samma familj:**
  (a) hela v3:s NAP-kriterium låg först i paketet, vilket hade slutat mäta
  kontaktuppgifternas konsistens för core-only-kunder; nu delat i `K10` + `KK-2`
  (universell konsistens) och `P-L1` (lokal prominens).
  (b) **Samma fel en gång till, funnet av oberoende granskning:** v3:s kriterium 5 låg
  helt i paketet, så Case B:s BÅDA PASS-villkor saknade instrument vid `paket: []` —
  ett falskt godkänt på negativkontrollen. Rättat med kärnkriteriet `K7`
  (strukturtrohet & paketläckage) och `KK-3`.
  (c) dubbeldragning INOM kärnan (`K1`/`K3` mätte båda primärhandlingens kedja mot S5:s
  uttryckliga avgränsning; `K6`/`K12` krävde båda sitemap/robots). Ägarskapet är nu
  utskrivet per överlapp.
  Därtill: bandordningen saknade total ordning och företrädesregel — §7:s enda uttryckliga
  krav vilade på en odefinierad operator · `K1`:s kravnivå hade tappat v3:s fem namngivna
  delkrav och "samma kravnivå"-klausulen, vilket §26 Case A kräver · `ODÖMBAR`:s verkan på
  nämnaren var odefinierad · `PK-L1`/`PK-L3` delade villkor · en `PK` kunde fällas för ett
  kriterium som lämnat mätningen · Case A:s numeriska diagnostik saknar motsvarighet under
  v4 och sägs nu ut.
