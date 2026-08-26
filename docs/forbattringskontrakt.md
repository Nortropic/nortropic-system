# Förbättringskontraktet — vad en förbättring av en BEFINTLIG sajt får och inte får vara

Senast verifierad mot systemet: 2026-08-27 · v1 (denna commit)
Verifieringsomfång: nyskapad. Ankare: `D-GAP-2` i `backtests/case-d-migration/FORVANTAT.md`
och `workflows/nortropic-autobygg.js`, vars ROUTE-gren säger ordagrant
*"förbättringslane saknas ännu — offereras som eget arbete mot den befintliga sajten"*.

**Case D bevisade att routningen fungerar. Destinationen fanns inte.** Det här kontraktet
är destinationen — dess FORM. Ingen körbar lane byggs här (`FK-GAP-1`).

---

## 0. Varför en förbättring är svårare än ett nybygge

Ett nybygge har ingenting att förstöra. En förbättring har det.

Alvestas Måleri — `case-d-migration/` — rankar **2,1** på sin viktigaste term, har gröna
Core Web Vitals och **23 hänvisande domäner på en fyra år gammal domän**. Problemet är sju
tjänstesidor på 90–140 ord, tre knappar som säger "Läs mer" och elva formulärfält.

**Frestelsen är att bygga nytt och sätta redirects.** Den är stark därför att ett nybygge
är det vi kan, och därför att resultatet ser bättre ut i en före/efter-bild. Kostnaden
syns inte förrän placeringarna rör sig, och då är den svår att koppla tillbaka.

> **LAG 1 — BEVARANDEBÖRDAN LIGGER PÅ FÖRÄNDRINGEN.** Det som mäts som fungerande får
> ändras endast med ett uttalat skäl och ett uttalat mått. Frånvaro av skäl är ett nej.

## 1. Vad som ALLTID bevaras utan särskilt beslut

| Bevaras | Varför | Vad som krävs för att ändå ändra |
|---|---|---|
| **URL:er som rankar eller har inlänkar** | Adressen ÄR tillgången. En redirect bevarar en del av värdet, aldrig allt | Uppmätt skäl per URL + redirect-karta + eftermätning |
| **Titlar/meta på sidor som rankar** | En omskrivning är ett experiment på något som fungerar | Uppmätt skäl + en URL i taget |
| **Innehåll som besökare faktiskt läser** | Läst innehåll är belagd efterfrågan | Utökning är fri; strykning kräver skäl |
| **Teknisk stack som håller sina mått** | "Modern stack" är inget uppmätt skäl | En namngiven brist med ett mått |
| **Domän och hänvisande domäner** | Går inte att återskapa | Aldrig utan ägarbeslut |

## 2. Vad som ALDRIG är en förbättring

- **Totalbygge med redirects** som presenteras som förbättring. Det är ett nybygge, och
  då gäller ny-sajt-lanen med sitt eget beslut — inte den här.
- **Stackbyte utan uppmätt brist.** Prestandaklagomål utan siffra är en preferens.
- **URL-omstrukturering "för tydlighetens skull".**
- **Att stryka innehåll som inte mätts.** Okänd trafik är inte noll trafik.
- **Att börja med det som syns.** Hero-bilden är sällan det som saknas.

## 3. Ordningen är del av kontraktet

1. **Mät före.** Placeringar, trafik per sida, konvertering, CWV, inlänkar. Utan
   utgångsvärde finns ingen förbättring — bara en förändring.
2. **Namnge bristen med ett mått.** "Tunna tjänstesidor" är en observation; "sju sidor på
   90–140 ord mot konkurrenternas 600+" är en brist.
3. **Ändra minst möjliga yta som adresserar bristen.**
4. **Mät efter, mot samma mått.**
5. **Rapportera BÅDE riktningarna.** Vad som blev bättre OCH vad som blev sämre. En
   rapport utan försämringar är en rapport som inte letat efter dem.

> **LAG 2 — EN FÖRBÄTTRING UTAN EFTERMÄTNING ÄR EN ÄNDRING.** Den får aldrig kallas
> förbättring i en rapport, en offert eller ett kundsamtal.

## 4. Gränsen mot ny-sajt-lanen

Om utredningen visar att bevarandebördan inte går att bära — sajten är byggd så att varje
meningsfull förbättring kräver att den byggs om — **är svaret ett NYBYGGE, och det är ett
eget beslut med eget mandat.** Det får aldrig glida in som "en omfattande förbättring".

**Mekanisk gräns:** ändras fler än hälften av de rankande URL:erna, eller byts stacken, är
det per definition ett nybygge oavsett vad det kallas.

## 5. Vad som INTE är byggt

| ID | Lucka | Nästa transition |
|---|---|---|
| `FK-GAP-1` | **Ingen körbar förbättringslane finns.** Kontraktet är formen; körningen kräver läsning av en befintlig sajt, mätdata och modellorkestrering | Bygg lanen när en verklig kund finns — kontraktet först, så lanen byggs mot en gräns i stället för mot en möjlighet |
| `FK-GAP-2` | **Mätvärdena är kundens egna.** Vi har ingen egen mätning av placeringar eller trafik, så utgångsvärdet är alltid ett andrahandsuppgift | Egen mätning kräver GSC-åtkomst per kund — en ägarceremoni |
| `FK-GAP-3` | **Ingen eftermätning är automatiserad.** Lag 2 är därmed ett löfte, inte en grind | Följer `FK-GAP-1` |

## 6. Vad kontraktet INTE gör

- **Ingen ny grind.** Inget i pipelinen läser den här filen ännu.
- **Ingen kapacitet.** `KAP-`-raden för förbättring finns inte; att skriva en vore att
  påstå att fabriken kan leverera och verifiera detta, och det kan den inte än.
- **Ingen affär.** Vad en förbättring kostar är ägarens, inte det här dokumentets (§A5).
