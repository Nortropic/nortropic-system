---
name: nortropic-prelaunch
description: Pre-launch QA gate for Nortropic Swedish local service websites. Use before launching or deploying any client site — performance gates (Lighthouse, Core Web Vitals), lead-generation gates (click-to-call, quote form email delivery, CTA visibility, conversion tracking), responsive checks, security gate (npm audit, säkerhetsheaders, formulärmissbruk, hemligheter), and Swedish/EU legal compliance (GDPR/Integritetspolicy, cookie consent, Företagsuppgifter). Trigger with /nortropic-prelaunch [url-or-path], or when the user says "are we ready to launch", "prelaunch check", "kan vi lansera", or before /vercel:deploy.
argument-hint: "[url-or-path]"
---

# Nortropic Pre-Launch Gate

Run against `$ARGUMENTS` (preview URL preferred, else local build). **Every gate is PASS/FAIL — no "mostly done".** A site that loses one lead per week because of a broken form costs the client more than a week's delay. Legal findings are NEVER auto-fixed — report them and stop for human judgment.

> **Deployment Protection & bypass (Gate 7-relaterat, gäller alla URL-kontroller):** om preview-deployen har Vercel Deployment Protection på — vilket Gate 7 nedan KRÄVER — svarar en naken `.vercel.app`-förfrågan `401`. Varje URL-baserad kontroll i grindarna nedan (Lighthouse, header-`curl`, responsiv rendering, end-to-end-lead) UTOM Gate 7:s egen protection-assertion måste därför autentisera via **Protection Bypass for Automation**: skicka hemligheten `VERCEL_AUTOMATION_BYPASS_SECRET` som headern `x-vercel-protection-bypass` (curl/fetch) eller som query `?x-vercel-protection-bypass=<secret>&x-vercel-set-bypass-cookie=true` (webbläsare/Lighthouse/Playwright — cookien håller bypassen genom hela sessionen). **LÄCKSKYDD (obligatoriskt där query-formen används):** hemligheten får ALDRIG återges i en URL i rapporter, loggar, skärmdumpar eller filnamn — query-formen används ENDAST i själva verktygsanropet som sätter bypass-cookien, därefter bär cookien bypassen; header-formen går inte att sätta i kedjans verktyg och cookien går inte att försätta direkt (verifierat mot MCP-schemana), så query-formen är nödvändig men dess URL återanvänds aldrig i utdata. Ett `401` på någon ANNAN kontroll = saknad/fel bypass-hemlighet i verktyget, inte ett sajtfel: fixa verktyget, rapportera inget sajtfynd.

## Gate 0 — Build Integrity
- [ ] `pnpm build` completes: zero TS errors, zero ESLint errors
- [ ] No `console.log`, lorem ipsum, or placeholder images in shipped code
- [ ] **`TODO-FACT`/`TODO-COPY` markers appear ONLY inside FAQ answers** (where `FaqSchema` strips them from JSON-LD). A marker in ANY other rendered field — `priceNote`, hero, meta description, service/area body copy — renders the literal "TODO-FACT…" to the customer and is a **FAIL** (H2). Grep every rendered content field: `grep -rn "TODO-FACT\|TODO-COPY" src/content src/app` → each hit must be a FAQ *answer* string or a code comment, nothing else. And confirm no marker text survives in the built FAQPage JSON-LD (proves the `FaqSchema` filter is doing its job).
- [ ] `.env.local.example` documents every env var; real values exist in Vercel (`RESEND_API_KEY`, `LEAD_TO_EMAIL`, `LEAD_FROM_EMAIL` = portföljkonstanten `"{Företagsnamn} (webbformulär) <formular@nortropic.se>"` — Nortropics EN gång verifierade avsändardomän, aldrig kundens; se Gate 1-assertionen)

## Gate 1 — Primärhandlingsgrinden (THE gate — full targets in this file)
Läs `content/profile.ts` FÖRST: `primaraktion` + `gate1Test` definierar vad som testas end-to-end för denna kund. Saknas profile.ts i byggrepot = Gate 1 FAIL med tydligt meddelande — kör aldrig på gissad default. Åtgärden för ett äldre repo (pre-v13): stack-builder backfillar `content/profile.ts` ur briefens §7 — eller ur paketets strategimodul (`packs/lokal-se/strategi/`) när briefen saknar §7 — och grinden körs om; grinden själv gissar aldrig. **Invarianter oavsett primärhandling:** primärhandlingen nåbar above fold på varje sida (375×667), mobilergonomisk, testad PÅ RIKTIGT end-to-end, fallback vid fel som visar en alternativ kontaktväg, konverteringsevent avfyras. **Offert/samtal-fallet (hantverkar-defaulten) = punkterna nedan, exakt:**
- [ ] **Click-to-call works**: every phone number is a `tel:` link; tap on 375px viewport opens dialer
- [ ] **Phone visible in sticky header** on every page, mobile and desktop
- [ ] **Floating call button** on mobile after scroll, ≥56px target
- [ ] **Quote form end-to-end**: submit a real test lead → **the email ARRIVES at `LEAD_TO_EMAIL`** (check via Resend dashboard/API status or confirmed receipt). Delivery is the test — a 200 response is not
- [ ] **Avsändar-assertionen (P02-förstärkt 2026-07-29):** `LEAD_FROM_EMAIL` innehåller `@nortropic.se` — då är fallbacken `onboarding@resend.dev` (som Resend BARA levererar till kontoägarens egen adress) **strukturellt onåbar**, och per-kund-fällan "glömd avsändardomän" finns inte längre. Env-namnet är `LEAD_FROM_EMAIL`; äldre prosa sa `RESEND_FROM` — ett namn som inte finns i byggen sedan nortropic-se (AH15-driften, rättad här). `Reply-To` = besökarens adress så kunden svarar direkt. **Leveranstestet ovan går FORTSATT till den SKARPA `LEAD_TO_EMAIL` (P02) — det kravet ändras inte av assertionen.** Testklient/ingen skarp lansering: onboarding-avsändaren är OK — notera som utestående lanseringspunkt, inte PASS.
- [ ] Form error state shows the phone number as fallback
- [ ] CTA above the fold on every page at 375×667
- [ ] **Conversion tracking fires**: `phone_click` and `quote_submit` events visible in analytics debug
- [ ] 404 and error pages render the phone number

**Annan primärhandling** (boka tid / platsförfrågan / besök): motsvarande kedja per `gate1Test` — t.ex. boka-flödet når den externa bokningstjänsten och fungerar, bokningsevent spåras, felväg visar telefon/alternativ kontaktväg; 404/error visar alltid en kontaktväg. Kravnivån är identisk: leveransen/genomförandet är testet, aldrig ett 200.

> **Täckningsnot (deskriptiv arkitekturfakta):** puls-routen (`/api/puls`, förslag 07) övervakar löpande att sändinfrastrukturen levererar — den kör INTE server action-vägen i `lead.ts`. Den vägen täcks av Gate 1:s end-to-end-leveranstest ovan (orört, alltid till skarpa `LEAD_TO_EMAIL`); ett fel isolerat DIT fångas inte av pulsen mellan lanseringar utan först vid nästa körning av denna grind. (Dygnlig Playwright mot det riktiga formuläret skulle täcka glappet men skicka testmejl till kunden — därför pulsen i stället.) Detta beskriver vad övervakningen täcker; det är INGEN förhandsfriskrivning för fynd på server action-vägen — varje sådant fynd bedöms på egna meriter.

## Gate 2 — Performance (details: `references/lighthouse-targets.md`)

> **KANONISK LIGHTHOUSE-KÖRVÄG (R7 2026-08-25 — STEP-0A-demoteringen hävd):** Lighthouse-raderna
> körs ENDAST via `node scripts/run-lighthouse-gate.mjs <mål-URL>` i nortropic-system-repot —
> pinnade `lighthouse@13.4.1` (exakt version i evidensen) ur samma kanoniska verktygsrot
> `tools/web-quality/` som axe-grinden (ETT verktygsauktoritet; materialisering = explicit
> `cd tools/web-quality && npm ci`, grinden installerar ALDRIG själv). Webbläsaren är den
> kanoniska Macens Chrome, mekaniskt resolvad (ärvd CHROME_PATH/kund-PATH väljer aldrig) med
> **Chromes egen sandlåda PÅ** — inga säkerhets-bypass-flaggor. Körningen är MOBIL navigation
> med Lighthouse-defaultens simulerade långsamma 4G (`throttlingMethod: simulate`); resultatet
> rapporterar exakta resolverade formFactor/screenEmulation/throttling-inställningar i
> evidensen. Verdiktalgebra: exit 0 = navigationskomponenten PASS · exit 1 = tröskel-FAIL ·
> exit 2 = **ODÖMBART** (verktyg/version/Chrome/mål/auth/runtimeError — aldrig sajt-PASS;
> 401 = ODÖMBAR auth). Webbläsarkörningen kräver BROWSER_VERIFICATION_EXECUTION i den
> kanoniska Mac-sandlådan (samma kapacitet + harness-godkännande som Gate 4:s axe-rad) — kan
> den inte beviljas är Lighthouse-komponenten ODÖMBART och lansering blockerad, aldrig tyst
> hoppad. **INP-SANNINGSGRÄNS:** navigations-Lighthouse interagerar inte och mäter därför
> ALDRIG verklig INP — den bevisar poängen + LCP + CLS och redovisar TBT som INP-relaterad
> labbproxy (`inp.status=NOT_MEASURED_BY_NAVIGATION_LIGHTHOUSE`); TBT blir aldrig INP-PASS.
> MCP-/DevTools-Lighthouse förblir observationsinstrument, aldrig kanonisk Gate 2-evidens.

- [ ] Lighthouse mobile via kanoniska runnern: **Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥95** (exit 0 krävs; evidensen bär version 13.4.1 + webbläsar- + inställningsidentitet)
- [ ] **LCP < 2.5s · CLS < 0.1** bevisas av samma körning (simulerad långsam 4G-mobil). **INP < 200ms kvarstår som separat krav**: utan giltig fältdata eller ett godkänt user-flow-mätsteg är INP-delkravet **ODÖMBART — aldrig PASS** (TBT ur körningen är endast proxy-evidens för manuell bedömning)
- [ ] Images WebP/AVIF with explicit dimensions; hero `priority`; total page weight < 1MB on Hem

## Gate 3 — Responsive & Robustness
- [ ] Layouts correct at **375 / 390 / 768 / 1280 / 1920** px — no horizontal scroll, no overlapping header, thumb-reachable CTAs on mobile widths
- [ ] All internal links resolve (crawl for 404s); no mixed content; SSL valid on the production domain
- [ ] `not-found.tsx` + `error.tsx` in Swedish, styled, with phone
- [ ] Favicon + OG images render (test a share preview)

## Gate 4 — Accessibility (den pinnade axe-körningen + de manuella punkterna ÄR djuppasset)

> **KANONISK AXE-KÖRVÄG (R6 2026-08-25 — STEP-0A-demoteringen hävd):** axe-raden körs ENDAST via
> `node scripts/run-axe-gate.mjs <mål-URL>` i nortropic-system-repot — den pinnade kedjan
> @axe-core/cli@4.13.0 + axe-core@4.13.0 ur den kanoniska verktygsroten `tools/web-quality/`
> (motorn binds explicit med `--axe-source`, chromedriver med `--chromedriver-path`; kundens
> node_modules kan aldrig definiera motorn). Verdiktalgebra: exit 0 = PASS (noll violations),
> exit 1 = FAIL (sajtfynd), exit 2 = **ODÖMBART** (verktygs-/pin-/driver-/mål-/auth-fel —
> verktygsfel är ALDRIG sajt-PASS). Saknas verktygsinstallationen svarar skriptet ODÖMBART med
> provisioneringsinstruktionen (`cd tools/web-quality && npm ci` — explicit operatörshandling;
> grinden installerar aldrig själv). Skyddad preview autentiseras enligt bypass-noten överst;
> skriptet sanerar hemligheten ur ALL evidens. **Exekveringsmiljö:** webbläsarkörningen kräver
> lokala loopback-sockets; i den kanoniska Mac-sandlådan (som strukturellt nekar listen())
> körs anropet under den ägar-ratificerade kapaciteten **BROWSER_VERIFICATION_EXECUTION**
> (identitetsceremoni före varje körning: runner-/package-/lock-hashar + exakta versioner, se
> foundation-K6), och Claude Code-harnessens egen godkännandegräns respekteras — kan
> kapaciteten inte beviljas/godkännas vid körningstillfället är axe-komponenten **ODÖMBART**
> och lansering förblir blockerad. Axe hoppas ALDRIG över tyst. `incomplete`-regler i
> resultatet är inte bevis på uppfyllda kriterier — de går till de manuella punkterna nedan.
> AccessLint eller annan kandidat blir aldrig produktionsauktoritativ via denna rad.

- [ ] Every image has meaningful Swedish alt text (empty `alt=""` only for decorative)
- [ ] Form labels visible + programmatically associated; error messages announced
- [ ] Keyboard-only pass: nav, accordion, form all operable; focus visible; skip-link works
- [ ] Contrast ≥4.5:1 body, ≥3:1 large text; `prefers-reduced-motion` respected
- [ ] `<html lang="sv">`; heading order sane (one `h1`/page)
- [ ] **Klickytor ≥24×24 px** (WCAG 2.2 Target Size), helst 44×44 på mobil — för hantverkstjänster köpta av äldre är detta en konverteringsfråga, inte en formalitet
- [ ] **axe-core: noll violations** (`wcag2a`/`wcag2aa`/`wcag21aa`/`wcag22aa`) via `node scripts/run-axe-gate.mjs <mål-URL>` (kanoniska körvägen i noten ovan; exit 0 krävs — exit 2/ODÖMBART blockerar) — mekanisk komplettering; axe täcker ~1/3 av kriterierna och ersätter inte de manuella punkterna ovan; `incompleteRuleIds` i resultatet redovisas i evidensen för manuell bedömning

## Gate 5 — SEO Launch Readiness (deep pass via `nortropic-seo-lokal`)
- [ ] Unique Swedish title + meta description on every page (`[Tjänst] i [Stad] | Företag` pattern)
- [ ] `sitemap.xml` + `robots.txt` served and correct; canonical URLs set
- [ ] `LocalBusiness` JSON-LD validates (Rich Results Test), NAP matches `content/business.ts` = Google Företagsprofil
- [ ] **GSC-beredskap** (verifieringen körs vid CUTOVER, inte här) — prelaunch kör mot **preview**, där kundens riktiga domän inte finns, så varken DNS TXT eller META kan verifieras nu. Kontrollera i stället beredskapen: META-mekaniken finns (`scripts/gsc-setup.mjs` + `content/verification.ts` renderas i layouten och skeppas till preview), **kanonisk variant vald** (den andra `301`:ar — inte båda `200`, jfr AH22/cutover fas 1), och kund-ägaradress (`GSC_CLIENT_OWNER`) i `business.ts` eller medvetet noterad som saknad. Skarp verifiering + sitemap-submit: `/nortropic-cutover` fas 3 → `nortropic-seo-lokal/references/gsc-launch-steps.md`
- [ ] **`robots.txt` blockerar inte AI-crawlers** på skarp klient (`GPTBot`/`PerplexityBot`/`ClaudeBot`/`OAI-SearchBot` under `Disallow` = HIGH; på TESTKLIENT är total blockering korrekt = inget fynd) — speglar seo-optimizerns hårda regel, samma källa
- [ ] **`address.publik` styr `PostalAddress` i JSON-LD** — severity per seo-optimizerns hårda regel (EN källa, får inte divergera): `false` + `PostalAddress` i schemat = **CRITICAL** (adressen syns för Google men är dold i GBP = NAP-avvikelse); `true` UTAN `PostalAddress` = **HIGH** (ofullständigt schema); vid `false` ska `areaServed` vara satt. `postalCode` matchar `/^\d{3} \d{2}$/` ("971 87") identiskt i schema/footer/GBP-underlag — avvikande format = **CRITICAL**
- [ ] **Bing-beredskap** (importeras vid CUTOVER, inte här) — Bing-import ärver en **verifierad GSC-property**, som finns först efter cutover fas 3, så den går inte att göra på preview. Kontrollera i stället beredskapen: importvägen (ett klick från GSC) är dokumenterad och sitemapen serveras. Skarp import + sitemap-inskick: `/nortropic-cutover` (cutover-steg, gsc-launch-steps fas 5) → `nortropic-seo-lokal/references/gsc-launch-steps.md`
- [ ] **IndexNow-beredskap** (aktiveras vid CUTOVER, inte här) — nyckelfilen kan bara svara `200` i webbroten på den **skarpa domänen**, som inte finns på preview. Kontrollera i stället beredskapen: nyckelfilen + deploy-hooken **finns i repot** (skeppas till preview, aktiveras på skarp domän). Skarpt: `/nortropic-cutover` (cutover-steg, gsc-launch-steps fas 6) → `nortropic-seo-lokal/references/gsc-launch-steps.md`

## Gate 6 — Swedish/EU Legal (details: `references/legal-requirements-se.md`) — REPORT ONLY, human decides
- [ ] **Integritetspolicy** page: what data the quote form collects, purpose, legal basis, retention, rights, contact — in Swedish
- [ ] **Cookie consent**: if ONLY Vercel Analytics (cookieless) + necessary cookies → banner not required, but policy still mentions it. Any GA4/pixel/embed cookies → opt-in consent (Consent Mode v2) BEFORE they load
- [ ] **Företagsuppgifter** in footer: company name, org.nr, address, contact
- [ ] Google Maps embed → covered in policy; fonts self-hosted (no Google Fonts CDN — Schrems II practice)
- [ ] If prices shown: inkl. moms for consumers; ROT/RUT claims accurate
- [ ] Marketing claims verifiable (betyg real, "auktoriserad" backed by registration)

## Gate 7 — Säkerhet (details: `references/security-checklist.md`)
- [ ] **Beroenden rena**: `npm audit --omit=dev` — FAIL on any high/critical in production dependencies. Fix: upgrade or replace the package; `npm audit fix` only if the lockfile diff is reviewed
- [ ] **Säkerhetsheaders servas** (verify what is ACTUALLY served: `curl -sI` against the preview URL): Content-Security-Policy (baseline in the reference — copy-paste `headers()` facit for `next.config.ts`), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `frame-ancestors 'none'` (or `X-Frame-Options: DENY`). Fix: `headers()` in `next.config.ts` — not `vercel.json` when next.config already owns config
- [ ] **Formulärmissbruk** (the quote endpoint): honeypot → silent 200 without email · time-trap rejects an implausibly fast submit — elapsed time measured on ONE clock (client mount→submit, submitted as an `elapsedMs` duration; NEVER a raw timestamp the server compares to its own `Date.now()`, whose client/server skew silently drops real leads — see H1), missing/0 fails open · server-side validation of every field (length caps, email format) · **recipient hardcoded from env `LEAD_TO_EMAIL` — NEVER read from request body** (otherwise the endpoint is an open spam relay) · client-facing errors are generic — no env names, stacks, or Resend responses leak. Rate limiting: platform-level (Vercel WAF/challenge) as optional note — **no DB-based limiter** (breaks static-first)
- [ ] **Hemligheter**: no keys in the client bundle — `grep -r "re_" .next/static` and grep the env var names; `.env*` git-ignored and absent from git history; all API keys only in server code/route handlers
- [ ] **Deployment Protection på preview**: en naken `.vercel.app`-URL (utan inloggning/bypass) ger `401`. `noindex` räcker inte — en indexerad preview-URL kan hinna rankas innan Google läser om sidan och konkurrerar då med kundens riktiga domän. Denna check gör medvetet en NAKEN förfrågan och förväntar `401`; grindarnas övriga URL-kontroller autentiserar via bypass-hemligheten (se noten överst)
- [ ] **`/api/puls`-kontraktet**: mottagare `LEAD_TEST_TO` ur env (aldrig request body), token `PULS_TOKEN` ur env, saknad/fel token → `404`. Samma öppna-spamrelä-krav som lead-endpointen (regel 10) — en ny endpoint ärver inte immunitet

## Verdict Format

```
# Launch Readiness — <site> — <PASS ✅ / BLOCKED ❌>
| Gate | Status | Blockers |
|------|--------|----------|
| 0 Build | ✅/❌ | ... |
| 1 Lead-gen | ✅/❌ | ... |
| 2 Performance | ✅/❌ | ... |
| 3 Responsive | ✅/❌ | ... |
| 4 A11y | ✅/❌ | ... |
| 5 SEO | ✅/❌ | ... |
| 6 Legal | ⚠️ HUMAN REVIEW | findings listed, never auto-fixed |
| 7 Säkerhet | ✅/❌ | ... |
Launch only when 0–5 and 7 all ✅ and a human has signed off 6.
```

## On-Demand Escalation
`seo-optimizer`-agenten (SEO-djupkontroller — Audit mode äger crawl/indexering; normerna i `nortropic-seo-lokal`) · chrome-devtools/playwright MCP for live viewport, E2E and network testing. WCAG-djupet är Gate 4:s manuella punkter + den pinnade axe-körningen; grind-, säkerhets- och beroendeansvaret ligger i grindarna själva (Gate 7 äger säkerhetsevidensen) — legacy-skillnamnen från installationstiden är retirerade (R11).
