---
name: nortropic-stack
description: Nortropic tech stack conventions and GitHub-first workflow for Swedish local service business websites. Use when scaffolding, structuring, or reviewing a Nortropic project — Next.js 15 App Router, TypeScript strict, Tailwind CSS 4, shadcn/ui, Vercel, pnpm, static-first with no database, leads via server action + Resend email. Trigger with /nortropic-stack [project-name], or when starting a new client site, deciding file structure, or asking "how do we build sites at Nortropic".
argument-hint: "[project-name]"
---

# Nortropic Stack & Conventions

How every Nortropic site is built. Deviations require an explicit reason written into PROJECT-BRIEF.md.

## The Stack (fixed)

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 15, App Router** | Static-first: every page statically rendered |
| Language | **TypeScript, strict** | `"strict": true`, no `any` without comment |
| Styling | **Tailwind CSS 4** | Design tokens in `@theme`; no CSS modules, no styled-components |
| Components | **shadcn/ui** | Install via MCP/CLI per component, never fork the whole registry. shadcn now emits **Base UI** primitives (`@base-ui/react`), not Radix — style link-buttons with `buttonVariants()` (no `asChild`); see `references/component-patterns.md` |
| Email (leads) | **Resend** | The ONLY server code on the site |
| Analytics | **Vercel Analytics** (default) | Cookieless → no consent banner needed for it. GA4 + Consent Mode v2 only if the brief demands |
| Hosting | **Vercel** | Linked at scaffold time, deploys from `main` |
| Package manager | **pnpm** | Never npm/yarn in a Nortropic repo |

**NO DATABASE.** Services, service areas, testimonials, FAQ — all typed TS/MDX content in the repo. The quote form posts to one server action that emails the lead. Lead history is a brief-level decision, never a default. **Bokning är däremot en BYGGD kapacitet** (`KAP-EXTERN-BOKNING`): tjänsten är extern, sajten länkar ut och tar aldrig emot bokningsdata — se [`references/extern-bokning.md`](references/extern-bokning.md).

## GitHub-First Workflow (never local-only)

```bash
gh repo create <kebab-name> --private --clone   # 1. repo FIRST
cd <kebab-name>                                  # 2. scaffold INSIDE the clone
pnpm create next-app@15 . --ts --tailwind --app --src-dir --use-pnpm   # pin @15 — @latest now resolves past Next 15
cp -r <kundmapp>/referenser/ design-referenser/  # 3. referenstrohet: skärmdumparna följer med bygget (+ kopiera in briefens Referensöversättning)
echo "design-referenser/" >> .vercelignore       #    internt arbetsmaterial — deployas ALDRIG
vercel link                                      # 4. Vercel from day one
# SECRET-VAKT — deterministisk OCH KEDJAD: git add -A körs bara om vakten passerar (&&), så en fälld vakt gör
# stageningen OMÖJLIG (inte bara olämplig — även en agent som kör raden kan aldrig nå git add -A förbi ett secret).
# Litar INTE på create-next-apps .gitignore: prövar den FAKTISKA stageningsmängden (git status, EXKL gitignorerat)
# mot .env/.vercel/node_modules; .env*.example undantas (mall). Skydd fallit → hela kedjan avbryts före commit.
! git status --porcelain | grep -E '\.env|\.vercel|node_modules' | grep -vqE '\.example' && git add -A && git commit -m "chore: scaffold" && git push -u origin main || { echo "SECRET-VAKT: hemlighet/credential pa vag in ELLER git-steg misslyckades — scaffold EJ committad"; exit 1; }
```

**Pin `create-next-app@15`.** `@latest` now resolves to a newer major than the Next 15 the stack targets (`package.json` pins `next` 15.x; App Router config, Tailwind 4 tokens and shadcn/Base UI are written for 15). `@latest` scaffolds an unsupported version.

Repo naming: `<client>-<trade>` kebab-case, ASCII only (`rorjour-stockholm`, not `rörjour`). Branch model: `main` deploys; feature branches for anything after first launch.

## File Structure (canonical — full version in `references/file-structure.md`)

```
src/
  app/
    layout.tsx                    # html lang="sv", header/footer/phone, Analytics
    page.tsx                      # Hem
    tjanster/[slug]/page.tsx      # one per service, generateStaticParams
    omraden/[slug]/page.tsx       # one per stad/kommun
    om-oss/page.tsx
    omdomen/page.tsx
    kontakt/page.tsx
    faq/page.tsx
    integritetspolicy/page.tsx
    not-found.tsx                 # Swedish 404 — keeps chrome + phone
    error.tsx                     # Swedish error — keeps chrome + phone
    actions/lead.ts               # THE server action (Zod-validated → Resend)
    sitemap.ts / robots.ts
  components/
    site/                         # header, footer, hero, cta-banner, quote-form...
    ui/                           # shadcn primitives (generated)
  content/
    business.ts                   # NAP, org.nr, öppettider, phone — SINGLE SOURCE
    profile.ts                    # kalibreringsfacit ur briefens §7 — SINGLE SOURCE för primärhandling/kvitton/schema/SEO-läge/juridikflaggor
    services.ts / areas.ts / testimonials.ts / faq.ts
  lib/
design-referenser/                # repo-ROTEN: kopia av <kundmapp>/referenser/ + Referensöversättningen — INTERNT ARBETSMATERIAL, deployas ALDRIG (utanför src/app och public/, dessutom i .vercelignore). Stack-builder öppnar dessa före varje nyckelsektion; design-reviewern jämför byggt mot dem (Referenstrohet-linsen)
```

No `(site)` route group — header/footer/phone live in the root `app/layout.tsx` so `not-found.tsx` and `error.tsx` inherit full chrome and the phone number. Matches `references/file-structure.md` and the shipped build.

**`content/business.ts` is sacred**: name, address, phone, org.nr, öppettider live ONLY here and must exactly match the client's Google Företagsprofil (NAP consistency). Header, footer, schema, and copy all import from it. **`references/file-structure.md` är NORMATIV I SIN HELHET — Read HELA filen INNAN du skriver filer under `app/` eller `content/`.** Två sektioner bär regler: `Content type contracts` (fältnamn och former) och `Rules` (bl.a. AI-crawler-policyn i `app/robots.ts`, som annars bara finns hos granskaren). Fältnamn är ENGELSKA (`address.street`/`postalCode`/`city` + `publik`), innehållet svenskt; `postalCode` alltid `"NNN NN"` med mellanslag ("971 87"), identiskt i schema, footer och GBP-underlag. Hitta ALDRIG på egna fältnamn eller interfaces — schema.org-mappningen är engelsk, och ett översättningssteg per bygge är en tyst felkälla (Fanérverket-läxan AH17: pekar-kontraktet lästes aldrig medan det INLINADE profile.ts-kontraktet nedan följdes — därav Read-kravet).

`content/business.ts` also carries `testklient: boolean` (from the brief's Klienttyp). When `true`, the site is built non-indexable: `robots.ts` reads a `noindex` flag (driven by `NEXT_PUBLIC_NOINDEX=1` in Vercel) and disallows all crawling, and page metadata sets `robots: { index: false, follow: false }`. A fictional/demo business must never be indexable or claimable. This flag + env var are the canonical way any agent detects a TESTKLIENT.

**`content/profile.ts` is the calibration facit** — written by stack-builder at init from the brief's §7 Kalibreringsprofil (grindar och eval arbetar i byggrepot och kan inte läsa briefen; profile.ts är transporten, samma mönster som business.ts). Typed fields: `primaraktion` (typ `'ring' | 'boka' | 'platsforfragan' | 'offert' | 'besok' | 'demo' | 'prova' | 'nedladdning' | 'kontakt'` + `etikett` för CTA-text. **De fyra sista är tillagda i v1.3.0 och är kärnans, inte något pakets.** Enumet var tidigare ord för ord `lokal-se`:s slutna mängd, vilket gjorde att en B2B-kund tvingades mappa en demobokning på `boka` — masterplanens §26 fälla 4 lyder *"BOOK_DEMO must not turn into ring/offert"*, och den fällan gick inte att spänna eftersom kärnan inte hade någon BOOK_DEMO att bli. **`lokal-se` SKÄRPER tillbaka till de fem första** enligt skärpningslagen; ett paket får smalna av kärnan, aldrig tvärtom. Exempeletiketter: "Få kostnadsfri offert" (offert), "Boka tid" (boka), "Boka demo" (demo), "Prova gratis" (prova)), `gate1Test` (klartext: vad som testas end-to-end, t.ex. "formulär → mejl levererat till LEAD_TO_EMAIL"), `kvitton` (lista över förtroendekvitton + attributionsregler), `schemaTyp` (den schema.org-typ organisationen FAKTISKT är — `Organization`, `SoftwareApplication`, `LocalBusiness`-subtyp m.fl.; ingen typ är default, och `lokal-se` skärper till en `LocalBusiness`-subtyp), `seoLage` (`'lokal' | 'varumarke' | 'hybrid'`), `juridikflaggor` (string-array), `rostregister` (adjektiv + exempelmeningar + legitimt bransch-vernacular ur §7.2), `branschAntislop` (string-array ur §7.3 — adderas till bas-blocklistan), `motionNiva` (`'ingen' | 'subtil' | 'uttrycksfull'`, speglar §5). De tre sista bär röst-/motion-kalibreringen så att design-reviewer och eval kan döma i byggrepot utan briefen — §5:s Vald riktning transporteras däremot INTE (den bedöms mot den renderade sajten). Komponenter importerar den (CTA-etiketter, formulärrubrik, schema-typ); grindar och eval läser den som facit. business.ts förblir NAP-facit; profile.ts är kalibreringsfacit — de blandas aldrig. **`noindexCutover`** (valfritt, ENDAST skarp klient) transporterar en AVSIKTLIG pre-cutover-noindex: `{ avsiktlig: true; checklista: string; cutoverSenast: 'YYYY-MM-DD' }` — `checklista` är en repo-path till en verklig cutover-checklista, `cutoverSenast` sista dagen noindex får gälla. Fältets närvaro (+ att checklista-pathen existerar) är det typade, versionerade beviset att en skarp klients noindex är avsiktlig, inte staging-läckage (se `seo-optimizer` audit-läge). **profile.ts-kontraktsversion: v1.3.0** — kontraktet ovan (fältlistan/typerna/enum-värdena) är versionerat (semver; bumpa vid tillägg/ändring/borttagning av fält, typ eller enum-värde). Varje profile.ts bär därför ett additivt fält `profilKontraktVersion: 'v1.3.0'` (v1.1.0 lade till valfritt `noindexCutover`; v1.2.0 lade till Site Quality Contract v2:s fältgrupper; v1.3.0 UNIVERSALISERADE `primaraktion`-enumet, `schemaTyp` och lead-ämnesradens ortsinterpolation — additivt, inget värde borttaget, så varje v1.2.0-profil förblir giltig — alla VALFRIA, inget v1-fält ändrat eller borttaget; befintliga pre-versioneringsrepon backfillas till aktuell version, samma mönster som pre-v13-backfillen); doctor #5 vaktar stämpeln **semver-medvetet** mot denna kontraktsversion (samma MAJOR + stämpel-(minor,patch) ≤ kontraktets = kompatibel). Skyddar gamla frysta fixtures/kundrepon mot tyst schemadrift, precis som eval-rubrikens versionering skyddar mätkontraktet.

### SITE QUALITY CONTRACT v2 — profile.ts (S4, semver-stämpel v1.3.0)

**`content/profile.ts` ÄR Site Quality Contract-bäraren.** Det finns INGEN
syskon-JSON, ingen parallell organisationsprofil, ingen separat kapacitetsplan och
inget user-needs-paket vid sidan av. En andra sanning om samma sajt driftar, och
driften upptäcks först när grindarna dömer mot fel fil. Allt bor här.

**TVÅ VERSIONSAXLAR — blanda dem aldrig.**

- **Kontraktsgeneration: Site Quality Contract v2.** Fältmängden i §7:s mening.
- **Semver-stämpel: `profilKontraktVersion: 'v1.3.0'`** — den ENDA deklarationen
  (ovan) och den doctor #5 läser.

**Varför MINOR och inte MAJOR:** semver MAJOR betyder BRYTANDE ändring. Här har
inget v1-fält ändrats, ingen typ smalnats och inget enum-värde tagits bort —
samtliga v2-fältgrupper är VALFRIA tillägg. Ett tillägg är per definition en MINOR.
Och en MAJOR-bump vore inte bara fel utan direkt skadlig: doctor #5 fäller
**"annan MAJOR än kontraktet = FAIL"**, så varje befintligt kundrepo hade fallit
över natten utan att en enda byte i deras schema blivit ogiltig. Bakåtkompatibilitet
är ett KRAV i denna skiva, inte en förhoppning — och den vilar på att versionen är
ärlig, inte på en fotnot som ber grinden titta bort.

**Samtliga v1.1.0-fält står kvar oförändrade** (`primaraktion`, `gate1Test`,
`kvitton`, `schemaTyp`, `seoLage`, `juridikflaggor`, `rostregister`,
`branschAntislop`, `motionNiva`, `noindexCutover`).

**Precisering (v1.3.0):** "oförändrade" avser fältens NÄRVARO och semantik. `primaraktion`:s TYP är utvidgad additivt — fyra värden tillagda, inget borttaget — vilket är varför bumpen är MINOR och inte MAJOR. Varje v1.2.0-profil förblir giltig.

#### BAKÅTKOMPATIBILITETSLAGEN (bindande)

1. **En v1.x-profil är GILTIG.** Grindar, eval och granskning FAILar ALDRIG enbart
   för att en profil bär `profilKontraktVersion: 'v1.x.y'`.
2. **Saknade v2-fält läses som `SAKNAS_I_V1` — aldrig som tomt, falskt eller noll.**
   En frånvaro är okänd, inte ett negativt svar. En konsument som behandlar ett
   saknat fält som `false` uppfinner ett påstående kunden aldrig gjort.
3. **Migrering är additiv och en egen handling.** Ett äldre repo backfillas av
   stack-builder ur briefen (samma mönster som pre-v13-backfillen) — aldrig tyst
   under ett bygge, aldrig genom att gissa värden.
4. **Doctor #5:s semver-vakt gäller oförändrad — och är UPPFYLLD.** Stämpeln
   `v1.1.0` och kontraktet `v1.2.0` har samma MAJOR, och `1.1.0 ≤ 1.2.0`, alltså
   kompatibel enligt vaktens egen regel. Lagen ovan är därför inget undantag från
   grinden; den beskriver varför grinden aldrig behöver göra ett.

#### v2-fälten

| Fält | Semantik |
|---|---|
| `profilKontraktVersion` | `'v1.3.0'` — semver-stämpeln doctor #5 läser (fanns i v1) |
| `katalogVersion` | Vilken version av `docs/kapacitetskatalog.md` kapacitetsraderna dömdes mot |
| `paket` | Aktiva paket, t.ex. `['lokal-se']`. Tom lista = `core-only` — ett GILTIGT läge |
| `primaraktion` | Primärhandlingen (fanns i v1) |
| `anvandare` | Vilka som faktiskt använder sajten — ur briefens §7.11, aldrig önsketänkt |
| `toppuppgifter` | De 2–4 uppgifter besökaren kommer för att utföra |
| `kapaciteter` | Aktiverade kapaciteter med katalog-ID och status; `ROUTE-OUT` står som hänvisning |
| `interventionsbeslut` | `'NY SAJT' \| 'FÖRBÄTTRA BEFINTLIG' \| 'ICKE-SAJT-ÅTGÄRD' \| 'AVRÅD'` ur §7.12 |
| `kvitton` | Förtroendekrav och attributionsregler (fanns i v1) |
| `obligatoriskaResor` | Resor som MÅSTE fungera end-to-end; Gate 1 testar primärhandlingens |
| `forbjudnaPastaenden` | Vad sajten ALDRIG får påstå (§7.14a) — läses av antislop och granskning |
| `kvalitetsnivaer` | Assuranceprofil: `'STANDARD'` som default; höjd nivå bär `skal` |
| `integrationer` | Externa tjänster sajten integrerar mot (bokning, kassa, karta). Varje post bär `{ tjanst, roll, extern, hallerTillstand, lage: 'lank' \| 'inbaddning' \| 'ingen-sidintegration', personuppgifter, samtyckeKravs }` — `lage` skiljer en UTGÅENDE LÄNK från en INBÄDDNING från en närvaro som inte gör någon förfrågan från sajten alls (t.ex. en Google Företagsprofil); `personuppgifter` säger om besökarens personuppgifter når tredje part; `samtyckeKravs` är samtyckesbeslutet. **Fälten finns för Gate 6:s människa.** Gate 6:s checklista kräver att varje mottagare/personuppgiftsbiträde NAMNGES och att varje tredjepartsförfrågan är förklarlig i integritetspolicyn — men den människan har hittills fått upptäcka integrationerna genom att läsa den byggda sajten. `scripts/check-integrationer.mjs` producerar arbetslistan ur profilen i stället. **Vakten avgör ingenting juridiskt** (§A4 är human-only); den prövar att underlaget är fullständigt. **Bokning: se [`references/extern-bokning.md`](references/extern-bokning.md)** — länk ut är normalvägen, inbäddning ett undantag som kostar samtycke, prestanda och en juridikflagga; sajten tar ALDRIG emot bokningsdata (ingen webhook, ingen server action), och **kvittosidan får inte påstå att något är bekräftat** — en stateless sajt kan inte veta det |
| `framgangsmatt` | Kundens mått ur §7.13 — föder HANDOVER:s Utfallshypotes |
| `olostaOkandheter` | Öppna okändheter med `verklighetsklass` per rad (`DOMÄNEXPERT`/`ANVÄNDARE`) |
| `godkannandeTillstand` | `{ godkandAv, datum, briefSha }` — vem godkände vilken brief, när |
| `belaggspekare` | Per fältvärde: var belägget står (research-rad, 5d-kandidat, briefsektion) |
| `statelesshet` | D8-vakten: `{ hallerTillstand: boolean }` — se STATELESS-VAKTEN nedan |

#### STATELESS-VAKTEN (D8 — bevarad, nu typad)

Fältet `statelesshet` bär den MEKANISKA gränsfrågan ordagrant:

> **Håller sajtrepot tillstånd som operatören måste förvalta?**

`{ hallerTillstand: false }` = innanför vallgraven. `{ hallerTillstand: true, ... }`
är per definition **utanför** — det är en mjukvaruprodukt, en Ring 3-hänvisning eller
ett eget scope, aldrig en Nortropic-sajt. **Detta är en DISKVALIFIKATION, inte en
rekommendation:** sajten byggs inte ändå efter en bedömning, och vakten får aldrig
omformuleras till ett råd. **Att en EXTERN SaaS håller tillståndet och sajten enbart
integrerar, länkar eller bäddar in bryter INTE vallgraven** — men att sajtrepot SJÄLVT
håller tillståndet (egen databas, egen inloggning, egen medlemsdata) bryter den alltid — det är
just därför `integrationer` är ett eget fält. Vallgraven är en säkerhetsegenskap:
en sajt utan eget tillstånd kan inte läcka persondata den inte har, går inte ner av
en migrering och väcker ingen klockan tre.

#### KÄRNA vs PAKET i scaffolden

Scaffolden delas i två lager. **Kärnan** byggs för varje sajt oavsett paket:
`business.ts` (organisationens identitets- och kontaktfacit — för `lokal-se` är det NAP-facit; för en icke-lokal kund bär den samma roll utan att adressen är ett verksamhetsställe), `profile.ts` (detta kontrakt), `services.ts`, `faq.ts`,
`lib/send-lead.ts`, `lib/seo.ts`, primärhandlingens komponenter. **Paketvillkorat**
byggs endast när paketet är BELAGT: för `lokal-se` är det `areas.ts` (ortssidor),
ortsarkitekturen `[tjänst] i [stad]` och de lokala schemadelarna. **`paket: []`
(core-only) är ett GILTIGT bygge** — frånvaron av ortssidor är då korrekt, aldrig
ett granskningsfynd.

## URL Conventions
- Swedish slugs, å/ä/ö transliterated: `tjanster/varmepumpar`, `omraden/taby`
- Service pages: `/tjanster/<tjänst>` · Area pages: `/omraden/<ort>`
- No trailing slashes, no uppercase, no dates in URLs

## Component Patterns

**Read `references/component-patterns.md` INNAN du skriver komponenter.** Den bär tre fel som INTE fångas av grindarna, eftersom de sitter i vägar en lyckad genomkörning aldrig tar:
- **React 19 `<form action>` auto-reset** — okontrollerade fält nollställs efter submit, alltså i FELLÄGET där besökaren behöver dem kvar. Gate 1 testar den lyckade vägen och ser inget. Två sanktionerade motmedel i filen; utan endera föds sajten med en lead-dödande bugg.
- **Samtyckesgrindad kartfasad**
- **JSON-LD-escape**
- Server Components by default; `"use client"` only for the quote form, mobile nav, and anything with handlers
- Every page composes: `<Hero>` → content sections → `<CtaBanner>` (closing CTA is a shared component, phone from `business.ts`)
- `<PhoneLink>` component wraps every phone number occurrence (renders `tel:` + tracks click as conversion)
- Images through `next/image` with explicit sizes; hero images `priority`
- Schema markup (`LocalBusiness`, `Service`, `FAQPage`) as JSON-LD components fed from `content/*`

## Lead Server Action (the only backend)
`app/actions/lead.ts`: Zod schema (namn, telefon, epost?, tjanst, meddelande, honeypot) → validate → send via Resend to the business owner → return typed result. **Sändinfrastrukturen är extraherad till `lib/send-lead.ts`** (datafundament 07) — actionen OCH `app/api/puls/route.ts` (pulsens dygnskontroll av sändvägen) delar samma funktion, så pulsen testar exakt den infrastruktur leads går genom. Puls-routens säkerhetskontrakt: mottagare `LEAD_TEST_TO` ur env (ALDRIG ur body), `PULS_TOKEN` ur env, saknad/fel token ⇒ **404** (inte 401 — vägen ska inte gå att upptäcka); routen bevisar sändinfrastrukturen, inte formulärets UI (Gate 1) eller att kundens `LEAD_TO_EMAIL` tar emot (Resend-statusbenet, kundhälsa förslag 12). Ämnesraden genereras ur `profile.ts` `primaraktion.etikett`: "Ny <etikett i bestämd form> — <tjänst>", **och `i <ort>` läggs till ENDAST när en ort faktiskt är belagd i kontraktet** (v1.3.0: interpolationen var tidigare villkorslös, så en kund utan ort fick "Ny demobokning — <tjänst> i <ort>" med en tom platshållare i ämnesraden på varje lead) (offert-primärhandling MED belagd ort ger "Ny offertförfrågan — <tjänst> i <ort>"; UTAN belagd ort "Ny offertförfrågan — <tjänst>"; demo-primärhandling utan ort ger "Ny demobokning — <tjänst>"). Rules:
- Honeypot field + **en-klocks-tidsfälla med STRIKT golv** (no CAPTCHA — friction kills leads): klienten mäter VARAKTIGHET (`Date.now()` vid mount → vid submit), aldrig klient-timestamp mot serverklocka; servern golvar hårt — saknad/`<= 0`/orimligt kort (t.ex. `< 2500 ms`) ⇒ tyst 200, inget mejl (regel 10). **Nya byggen använder strikt golv** (botfiltrering); äldre sajter (rorjour/emiljoh) lämnas MEDVETET på sin gamla `0 = omätt → släpp igenom`-semantik — ingen backfill (de byggs om vid behov och ärver då golvet).
- **In-memory per-IP rate-limit (DEFAULT i varje ny sajt):** best-effort throttle (`RL_MAX` submits per `RL_WINDOW_MS` per IP i en modul-`Map`), överskridande ⇒ tyst 200, inget mejl. Nollställs vid cold start, ej distribuerad (static-first — robust persistent limit är ett ägarbeslut, ej default). Ett kontaktformulär utan rate-limit är en öppen spam-vektor. Mottagaren förblir env-hårdkodad (`LEAD_TO_EMAIL`), aldrig ur request body (regel 10).
- On email failure: return error state telling the visitor to CALL, with the number — a lead must never dead-end
- `RESEND_API_KEY` is frequently still pending before launch. If it is unset or a placeholder, the action must NOT construct the Resend client or throw — return the same typed error state that shows the phone number (treat a missing key exactly like a send failure). An unconfigured site degrades to "ring oss", never a 500.
- **`LEAD_FROM_EMAIL` är portföljkonstanten** `"{Företagsnamn} (webbformulär) <formular@nortropic.se>"` — Nortropics EN gång verifierade avsändardomän för hela portföljen; kundens domän verifieras ALDRIG i Resend (noll DNS-arbete för mejl per kund, inget att avveckla vid offboarding). `Reply-To` = besökarens adress så kunden svarar direkt. Fallbacken `onboarding@resend.dev` blir därmed strukturellt onåbar (P02-förstärkningen 2026-07-29; Gate 1 kontrollerar som assertion).
- `RESEND_API_KEY` + `LEAD_TO_EMAIL` + `LEAD_FROM_EMAIL` via Vercel env vars; never committed

## Quality Baseline (enforced by /nortropic-review and /nortropic-launch)
- Lighthouse: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥95 (mobile)
- Zero TypeScript errors, zero ESLint errors at commit
- Prettier formatting via project PostToolUse hook
- Every page exports `generateMetadata` with Swedish title/description per `nortropic-seo-lokal` templates

## On-Demand Escalation
- Scaffold-mekanik utanför denna skill, komponentarkitektur, svåra frontendproblem och plattformskonventioner är byggarens eget ansvar — inga skill-eskalationer finns för dem (legacy-namnen från installationstiden är retirerade; R10)
- `shadcn-ui` MCP + `context7` MCP — component installs and current library docs
