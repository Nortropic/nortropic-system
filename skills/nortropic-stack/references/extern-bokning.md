# KAP-EXTERN-BOKNING — bokning utan att sajten blir statefull

Kapacitetens verifierbara krav lyder: **"Bokningsvägen når tjänsten; sajten förblir
stateless."** Två krav, och det andra är det som gör det första svårt.

Stacken sa tidigare bara: *"If a client ever needs lead history or bookings, that is a
brief-level decision, not a default."* Det är en hänvisning till ett beslut, inte en
byggbar väg — och därför stod kapaciteten `DECLARED`.

---

## 1. Länk ut är NORMALVÄGEN. Inbäddning är ett undantag som kostar.

| | Länk ut (default) | Inbäddning (iframe/skript) |
|---|---|---|
| Sajtens tillstånd | Inget | Inget — men tredjepartsskript körs i vår kontext |
| Kakor/samtycke | Inga från oss | **Tredjepartskakor ⇒ samtyckesbanner behövs** |
| Prestanda | Oförändrad | Tredjepartsskript i kritisk väg — Gate 2:s trösklar riskeras |
| Juridik | Ingen ny flagga | **Personuppgifter till tredje part i vår kontext ⇒ juridikflagga** |
| Fungerar utan JS | Ja | Nej |

**Default: länk ut.** Inbäddning kräver att briefen begär den OCH att dess tre kostnader
— samtycke, prestanda, juridik — är hanterade och namngivna. En inbäddning som smyger in
för att den "ser mer integrerad ut" är en tyst uppgradering av kundens juridiska exponering.

## 2. Sajten tar ALDRIG emot bokningsdata

- **Ingen webhook-mottagare.** En endpoint som tar emot bokningsbekräftelser gör sajten
  statefull i praktiken även om den inte sparar något — den blir en mottagare av
  personuppgifter och därmed Ring 3.
- **Ingen server action för bokning.** Offertformulärets `app/actions/lead.ts` är
  oförändrat och gäller LEADS, aldrig bokningar.
- **Ingen bokningshistorik, inga sessioner, inga kakor från oss.**

## 3. KVITTOSIDAN FÅR INTE BEKRÄFTA NÅGOT

Det här är regeln som är lättast att bryta och svårast att upptäcka.

En stateless sajt **kan inte veta** att en tid blev bokad. Bekräftelsen sker hos tjänsten
och når kunden via tjänstens eget mejl. En kvittosida hos oss som säger *"Tack — din tid är
bokad!"* **påstår något sajten omöjligt kan veta**, och påståendet är felaktigt varje gång
besökaren avbryter i bokningsflödet.

**Tillåten formulering:** vad som händer härnäst, vem som hör av sig, och var bekräftelsen
kommer ifrån.

**Förbjudna påståenden på en sajtägd sida i bokningsvägen:**
`din tid är bokad` · `bokningen är bekräftad` · `vi ses den` · `tack för din bokning`

**Skälet är detsamma som bakåtkompatibilitetslagens:** det bekväma svaret är det som ser ut
som ett godkännande, och ett fel som ser ut som ett godkännande upptäcks inte.

## 4. Vad `profile.ts` bär

Bokningen är en INTEGRATION och bor i `integrationer`, inte i ett eget toppfält:

```ts
integrationer: [
  {
    typ: 'bokning' as const,
    tjanst: 'Cal.com',
    url: 'https://cal.example/kadensa/demo',   // https, absolut, kundens egen
    lage: 'lank' as const,                      // 'lank' | 'inbaddning'
    samtyckeKravs: false,                       // true tvingar fram bannerbeslut
  },
],
```

`primaraktion.typ` är `'boka'` eller `'demo'` och `etikett` är CTA-texten. `gate1Test`
beskriver kedjan i klartext, t.ex.:

> `hero-CTA → bokningssida → utgående länk till Cal.com (ny flik); kvittosida påstår ingen bekräftelse`

## 5. Vad som går att verifiera MEKANISKT — och vad som inte gör det

| Krav | Verifierbart vid bygge | Kräver deployad preview |
|---|---|---|
| CTA:ns href pekar på den deklarerade tjänsten | **Ja** | — |
| URL:en är `https` och absolut | **Ja** | — |
| Ingen server action / webhook i bokningsvägen | **Ja** | — |
| Kvittosidan bär inget bekräftelsepåstående | **Ja** | — |
| `lage: 'inbaddning'` medför samtyckesbeslut + juridikflagga | **Ja** | — |
| **Bokningsvägen NÅR tjänsten** | Nej | **Ja** — Gate 1 mot preview |
| Tjänsten skickar sin egen bekräftelse | Nej | Ja, och den ligger hos kunden |

**Därför är kapacitetens tak `BUILT`, inte `VALIDATING`.** Fabriken kan bygga vägen och
verifiera dess form; att vägen *når* tjänsten är en körning mot en deployad preview, och
den evidensen finns inte ännu.

## 6. Vad som INTE ingår

- **Betalning vid bokning** — Ring 3 (`KAP-EHANDEL`).
- **Bokningshistorik eller inloggning** — Ring 3 (`KAP-EGET-TILLSTAND`).
- **Egen bokningsmotor** — aldrig. Kapaciteten heter EXTERN bokning.
