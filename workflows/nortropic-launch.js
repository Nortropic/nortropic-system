export const meta = {
  name: 'nortropic-launch',
  description: 'Pre-launch gate for a Nortropic site: 8 parallel audit lenses, bounded fix-loop (legal always stops for human), final sweep that re-anchors the verdict in a fresh full measurement when fixes were committed (NRT-001 PASS-invariant, BATCH-006), Swedish handover doc, launch readiness report',
  whenToUse: 'Run when a Nortropic client site is believed ready to launch, before /vercel:deploy',
  phases: [
    { title: 'Freshness', detail: 'block launch if the last FULL review predates changes on the main pages' },
    { title: 'Gates', detail: '8 parallel audit lenses' },
    { title: 'Fix loop', detail: 'max 3 rounds via stack-builder; legal never auto-fixed' },
    { title: 'Final sweep', detail: '≥1 committad fixrunda + pre-svep-PASS → alla 7 icke-legal-grindar körs om EN gång mot bevisat färsk preview; verdiktet ankras här (NRT-001). Obevisbar deploy → ODÖMBART, aldrig tyst grönt' },
    { title: 'Eval', detail: 'non-blocking quality score via nortropic-eval (informs report only)' },
    { title: 'Handover', detail: 'GBP/GSC deliverables + Swedish client handover doc' },
    { title: 'Report', detail: 'launch readiness verdict' },
  ],
}

const GATE = {
  type: 'object',
  required: ['status', 'findings'],
  properties: {
    status: { type: 'string', enum: ['PASS', 'FAIL'] },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'title', 'location', 'why', 'fix', 'category'],
        properties: {
          severity: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM'] },
          title: { type: 'string' },
          location: { type: 'string' },
          why: { type: 'string' },
          fix: { type: 'string' },
          category: { type: 'string', enum: ['technical', 'leadgen', 'visual', 'trust', 'seo', 'security', 'legal', 'journeys'] },
        },
      },
    },
  },
}

const EVAL = {
  type: 'object',
  required: ['total', 'faktatrohet', 'band'],
  properties: {
    total: { type: 'number' },
    faktatrohet: { type: 'string', enum: ['PASS', 'FAIL'] },
    band: { type: 'string' },
    version: { type: 'string' },
    topBrister: { type: 'array', items: { type: 'string' } },
    resultPath: { type: 'string' },
  },
}

// ─────────── BATCH-005-fixkontrakt (DEL 1, launch): returkontrakt för ändrade filer ───────────
// Fixagenterna deklarerar sin ändrade-fil-lista per schema (DIFFSCOPE-formen ur nortropic-review.js:
// files: string[] + mekanisk rapportdisciplin) och release-steget stagear EXAKT den mängden —
// aldrig svepande staging (-A/-u; -u missar dessutom nya filer → rorjour-buggen). Alla kontrakts-
// beslut fattas i ren JS nedan, aldrig i agentprosa. Delta-snapshoten (git status --porcelain -uall
// före/efter rundan) gör alla fyra felmoder mekaniskt kontrollerbara. Kontraktsbrott BLOCKERAR
// rundan utan commit — aldrig tyst degradering (samma klass som INV-005 INVALID→FAIL och
// verify-suitens "en död probe är odömbar → OGILTIG, aldrig tyst grön"). Stageningen använder
// snittet declared ∩ efter-snapshot (endast delta-verifierade VERKLIGA filer når git; kataloger,
// globs och fantomsökvägar kan per definition inte stå i porcelain-utdata), pathspecs literaliseras
// (--literal-pathspecs — [slug]-routes är literala filnamn, inte mönster), committen är pathspec:ad
// (för-stagat främmande innehåll åker aldrig med) och commit-UTFALLET efterkontrolleras mekaniskt
// mot den stageade mängden — sista ledet vilar inte på prosa (adversariell granskning 2026-08-06).
// Kärnan nedan är delad med nortropic-autobygg.js (DEL 2) — DSL-filer kan inte importera varandra,
// så den är MEDVETET duplicerad och hålls byte-identisk; INV-006 hashar båda blocken.

// ─────────── FIXKONTRAKT-KÄRNA (BATCH-005) — BYTE-IDENTISK i nortropic-autobygg.js och nortropic-launch.js; INV-006 hashar båda blocken och flaggar avvikelse ───────────

const FILELIST = {
  type: 'object',
  required: ['files'],
  properties: {
    files: { type: 'array', items: { type: 'string' }, description: 'repo-relativa sökvägar' },
    head: { type: 'string', description: 'full git HEAD-hash (40 hex) när prompten begär den' },
    note: { type: 'string' },
  },
}

// HEAD-spårningen är kontraktets ankare mot två felmoder som ligger UTANFÖR porcelain-deltat:
// en agent som committar SJÄLV (HEAD flyttar under fasen → trädet ser rent ut och deltat blir
// blint) och ett commit-steg som aldrig committade (HEAD står stilla → efterkontrollen jämför
// mot FEL commit). Adversariell granskning DEL 2, 2026-08-06.
function validHead(h) {
  return /^[0-9a-f]{40}$/.test(String(h || '').trim())
}

// Normalisering före mängdjämförelse: porcelain ger alltid framåtslash; en agent på Windows kan
// returnera backslash eller ledande "./" — samma fil får inte räknas som två. Case röras aldrig
// (skulle dölja verkliga avvikelser).
function normPath(p) {
  return String(p || '').trim().replace(/\\/g, '/').replace(/^\.\//, '')
}

// Felmod 3: fil utanför byggkatalogen. Endast repo-relativa sökvägar — absolut sökväg (POSIX eller
// enhetsbokstav), '..'-segment, citattecken/radbrytning eller tom sträng avvisas; likaså $ och
// backtick (shell-aktiva ÄVEN inom dubbelcitat — deklarationen interpoleras i stagingkommandot,
// och agentreturer är opålitlig data). Legitima Next.js-sökvägar (app/[stad]/, app/(grupp)/, @modal)
// bär inget av tecknen. Deterministiskt, aldrig prosa.
function badRepoPaths(files) {
  return (files || []).filter(raw => {
    const p = normPath(raw)
    return !p || p.startsWith('/') || /^[A-Za-z]:/.test(p) || p.split('/').includes('..') || /["\n\r$`]/.test(p)
  })
}

// Delta-jämförelsen som gör felmod 1/2 kontrollerbara:
//   undeclared    = smutsig EFTER rundan, ren FÖRE, ej deklarerad → utelämnad fil (felmod 1, BLOCKERA)
//   foreign       = deklarerad men redan smutsig FÖRE rundan → commit skulle smuggla in främmande
//                   ändringar (felmod 2b, BLOCKERA)
//   cleanDeclared = deklarerad men aldrig smutsig → överdeklaration (felmod 2a, WARN — posten
//                   utesluts ur stageningen via snittet declared ∩ post; den når aldrig git)
// Känd begränsning (registrerad i programregistret): en fil som var smutsig FÖRE rundan och ändras
// IGEN av fixern kan inte särskiljas mekaniskt — deklareras den blockeras rundan som foreign (säkra sidan).
function fixDelta(preFiles, postFiles, declaredFiles) {
  const pre = new Set((preFiles || []).map(normPath))
  const post = new Set((postFiles || []).map(normPath))
  const declared = (declaredFiles || []).map(normPath)
  return {
    undeclared: [...post].filter(f => !pre.has(f) && !declared.includes(f)),
    foreign: declared.filter(f => pre.has(f)),
    cleanDeclared: declared.filter(f => !post.has(f)),
  }
}

// Z1-arbetsloggen (AGENT-LOG.md) är undantagen kontraktet: agentdefinitionerna beordrar friktions-
// loggning MITT i arbetet (stack-builder/seo-optimizer/content-designer Z1-regeln), och tidigare
// faser kan redan ha lämnat ett ocommittat block — utan namngivet undantag fäller systemets EGEN
// loggdisciplin rundan som falsk felmod 1/2b. Loggen commitas aldrig av kontraktets commit-steg
// (efterkontrollen fäller en commit som ändå innehåller den); dess hemvist avgörs utanför workflowet.
const CONTRACT_EXEMPT = f => normPath(f) === 'AGENT-LOG.md'

// -uall är bärande: utan den listar porcelain en NY katalog som "dir/" i stället för filerna i den,
// och en ärligt deklarerad ny fil skulle falskblockeras som undeclared-mismatch. quotepath=off är
// lika bärande: med gits default oktalescapas åäö-sökvägar ('"tj\303\244nster.ts"') och kan då
// aldrig matcha fixarens deklarerade UTF-8-form → deterministisk falsk felmod-1 i en svensk pipeline.
// OBS (par-regeln): commit-stegens och commit-inspektionens promptar är FLÖDESSPECIFIKA och ligger
// UTANFÖR denna hashade kärna — INV-006 vaktar dem INTE; de ändras alltid i PAR i båda filerna.
const porcelainPrompt = (when, where) =>
  `Mechanical working-tree snapshot (${when}) in the project root of ${where}. Run exactly: git -c core.quotepath=off status --porcelain -uall. Return every repo-relative path it lists (modified, staged, deleted and untracked; for a rename list BOTH the old and the new path). Return BARE paths only: strip the two-character status prefix and the space after it, and strip any surrounding double quotes around paths that git still quotes. Also run exactly: git rev-parse HEAD — return the full 40-character hash as head. Do not filter or judge — report mechanically. A clean tree returns files: []. If a git command fails or you are not in a git project root, do NOT guess and do NOT report a clean tree — put exactly what failed in note.`

// ─────────── SLUT FIXKONTRAKT-KÄRNA (BATCH-005) ───────────

const site = (args && args.url) ? `the Nortropic site in the current working directory (preview URL: ${args.url})` : 'the Nortropic site in the current working directory (find the preview/dev URL from vercel or start the dev server if needed)'
const structured = 'Return PASS only if every check passes. Every finding needs severity, exact location, why it matters, concrete fix, and category.'
// Deployment Protection-bypass: Gate 7 kräver att preview har Vercel Deployment Protection på (naken .vercel.app → 401). Alla URL-baserade grindar UTOM Gate 7:s egen protection-assertion måste därför bära bypass-hemligheten, annars FAILar de av fel skäl. En hemvist — appendas på varje gate-prompt (initial + recheck).
const bypass = ' DEPLOYMENT PROTECTION: om preview-deployen har Vercel Deployment Protection på (Gate 7 kräver det) svarar en naken .vercel.app-förfrågan 401 — varje URL-baserad kontroll UTOM Gate 7:s egen protection-assertion måste autentisera via Protection Bypass for Automation: hemligheten VERCEL_AUTOMATION_BYPASS_SECRET som headern x-vercel-protection-bypass (curl/fetch) eller query ?x-vercel-protection-bypass=<secret>&x-vercel-set-bypass-cookie=true (webbläsare/Lighthouse/Playwright — cookien håller bypassen genom sessionen). LÄCKSKYDD (obligatoriskt där query-formen används): hemligheten får ALDRIG återges i en URL i rapporter, loggar, konsolutskrift, skärmdumpar eller filnamn — query-formen används ENDAST i själva verktygsanropet som sätter bypass-cookien, därefter bär cookien bypassen. Header-formen går inte att sätta i kedjans verktyg och cookien går inte att försätta direkt (verifierat mot MCP-schemana), så query-formen är nödvändig — men dess URL återanvänds aldrig i utdata. Ett 401 på någon ANNAN kontroll = saknad/fel bypass-hemlighet i verktyget, inte ett sajtfel.'

// v8 freshness gate: launch refuses to run if the last FULL review predates changes on the main pages.
const FRESH = {
  type: 'object',
  required: ['status'],
  properties: {
    status: { type: 'string', enum: ['FRESH', 'STALE', 'MISSING'] },
    scope: { type: 'string' },
    commit: { type: 'string' },
    newerCommits: { type: 'number' },
    detail: { type: 'string' },
  },
}

phase('Freshness')
const fresh = await agent(
  `Mechanical pre-launch freshness check in the project root of the Nortropic site in the current working directory. Do exactly this:\n` +
  `1) Read REVIEW-REPORT.md. If the file is missing → return status MISSING with detail "ingen granskningsrapport — kör en FULL /nortropic-review först".\n` +
  `2) Parse commit and scope from its <!-- nortropic-review-meta --> comment block. Unparseable → MISSING.\n` +
  `3) If scope is not "full" → return STALE with detail "senaste granskningen var DIFF-SKOPAD — pre-launch kräver en FULL /nortropic-review".\n` +
  `4) Run git log --oneline <commit>..HEAD -- src content. Any commits listed → STALE with the count in newerCommits and a one-line detail. Otherwise → FRESH.\n` +
  `Judge nothing; report mechanically.`,
  { label: 'freshness', phase: 'Freshness', schema: FRESH }
)
if (!fresh || fresh.status !== 'FRESH') {
  return {
    verdict: `BLOCKED-STALE — ${fresh && fresh.detail ? fresh.detail : 'freshness-checken kunde inte köras'}. Kör en FULL /nortropic-review på nuvarande commit, sedan /nortropic-launch igen.`,
    freshness: fresh || null,
    gates: [],
    eval: null,
    legalFindings: [],
    remainingFindings: [],
    fixRounds: [],
    contractStop: null,
    sweep: null,
    handoverWritten: false,
  }
}

// ---- S5: grindparameterisering ------------------------------------------------
// Grindmotorn är OFÖRÄNDRAD. Det som parameteriseras är VAD grindarna läser:
// Site Quality Contract (content/profile.ts), paketlinser, kontrakterade resor
// och toppuppgifter, juridikflaggor och kapacitetskrav.
//
// KATEGORI-ALIAS: kategorimängden i GATE-schemat är UNIVERSELL och sluten. En
// paketlins får ALDRIG hitta på en egen kategori — den aliasar in på en universell.
// Skälet är §10:s "No generated per-project rubric authority": en kategori som föds
// per paket blir en mätstock ingen granskat, och rapporter från olika kunder slutar
// gå att jämföra. Paketidentiteten bär linsen i sin titel, aldrig i schemat.
const CATEGORY_ALIAS = {
  'lokal-se:orter': 'seo',        // Ortssidornas kvalitet — tunna ortssidor, meta/H1-integritet per ort
  'lokal-se:gbp': 'trust',        // Google Företagsprofil-konsistens, NAP mot `business.ts`, `address.publik`→PostalAddress
  'lokal-se:jour': 'leadgen',     // Jour-/svarstidslöften: att de finns i researchen innan de står på sajten
}
const aliasKategori = (k) => CATEGORY_ALIAS[k] || k

// Kontraktsläsningen är FAIL-CLOSED i grindens mening: grinden gissar aldrig ett
// paket. Saknas profile.ts äger Gate 1 den domen (oförändrat); saknas `paket` läses
// det som core-only, vilket är ett GILTIGT läge — aldrig ett fynd i sig.
const kontraktsInstruktion = `SITE QUALITY CONTRACT (S5): läs FÖRST \`content/profile.ts\`. `
  + `\`paket\` avgör vilka PAKETLINSER som gäller — tom lista eller saknat fält = core-only, `
  + `ett GILTIGT läge och aldrig ett fynd i sig. \`obligatoriskaResor\` och \`toppuppgifter\` `
  + `avgör resorna som måste fungera. \`forbjudnaPastaenden\` är facit för vad sajten ALDRIG `
  + `får påstå. \`juridikflaggor\` och \`kapaciteter\` styr vilka extra kravlistor som gäller. `
  + `KONTRAKTSFÄRSKHET: bär profilen \`profilKontraktVersion\` med annan MAJOR än kontraktet i `
  + `nortropic-stack, eller en stämpel NYARE än kontraktet, rapportera det som ett technical-fynd `
  + `(HIGH) — grinden dömer aldrig mot ett schema den inte känner. En ÄLDRE men samma-MAJOR-stämpel `
  + `är GILTIG; saknade v2-fält läses som SAKNAS_I_V1 och redovisas som okänt, ALDRIG som tomt eller `
  + `falskt. En paketlins vars kategori inte finns i schemat aliasar in på sin universella kategori `
  + `(t.ex. lokal-se:orter → seo) — hitta ALDRIG på en ny kategori.`

const GATES = [
  { key: 'technical', agentType: 'qa-launcher', prompt: `Run Gates 0, 2, 3 and 4 of your prelaunch process (build integrity; Lighthouse/Core Web Vitals with real median-of-3 numbers; responsive 375/390/768/1280/1920 + link crawl + SSL; accessibility — keyboard-only operability, focus visibility, skip-link, contrast ≥4.5:1, meaningful Swedish alt text, prefers-reduced-motion, heading order / one h1; klickytor/target size ≥24×24 px per WCAG 2.2, helst 44×44 på mobil; axe-core noll violations mot wcag2a/wcag2aa/wcag21aa/wcag22aa som mekanisk komplettering, ersätter inte de manuella punkterna) against ${site}.\n\nINGÅR (din gate): build-integritet, Lighthouse/Core Web Vitals, responsivitet, länkcrawl, SSL, döda länkar, tillgänglighet (Gate 4, inkl. target size ≥24×24 + axe-core noll violations).\nINGÅR INTE (annan gate äger): lead-kedjan formulär→mejl, tel-länkar, CTA → leadgen-gaten; visuellt utseende → visual-gaten.\nCategory for findings: technical. ${structured}` },
  { key: 'leadgen', agentType: 'qa-launcher', prompt: `Run Gate 1 (primärhandlingsgrinden) of your prelaunch process against ${site}. Läs FÖRST content/profile.ts i byggrepot: primaraktion + gate1Test definierar exakt vad som testas end-to-end. SAKNAS content/profile.ts = Gate 1 FAIL med tydligt meddelande — kör aldrig på gissad default. Invarianter oavsett primärhandling: primärhandlingen nåbar above fold på varje sida, mobilergonomisk, testad PÅ RIKTIGT end-to-end, fallback vid fel, konverteringsevent avfyras. OFFERT/SAMTAL-FALLET (hantverkar-defaulten) = exakt: tel: links at mobile viewport, phone in sticky header everywhere, floating call button, quote form submitted end-to-end with [TEST] data and EMAIL DELIVERY verified (Resend status — a 200 is not delivery), form error fallback shows phone, CTA above fold per page, phone_click/quote_submit events fire, 404/error pages show phone. BOKA/PLATSFÖRFRÅGAN/BESÖK: motsvarande kedja per gate1Test (t.ex. boka-flödet når extern bokning och fungerar, event spåras, felväg visar kontaktväg) — kravnivån identisk, genomförandet är testet.\n\nINGÅR (din gate): HELA primärhandlingskedjan per profile.ts — för offert/samtal: tel-länkar, sticky nummer, flytande ringknapp, offertformulär end-to-end + verifierad e-postleverans, CTA above fold, konverteringsevent, telefon på 404/error.\nINGÅR INTE (annan gate äger): prestanda/CWV → technical-gaten; visuellt utseende → visual-gaten; schema/meta → seo-gaten.\nCategory: leadgen. ${structured}` },
  { key: 'seo', agentType: 'seo-optimizer', prompt: `${kontraktsInstruktion}\n\nGATE 5 ÄR DELAD (S5). **UNIVERSELL SEO-TEKNISK KÄRNA — gäller ALLTID, oavsett paket:** sitemap/robots servas, canonicals, schema validerar, titel/meta/H1-integritet, indexerbarhet (oavsiktlig noindex), döda interna länkar, strukturerad data utan TODO-markörer. **PAKETLINS — körs ENDAST när paketet är belagt i \`paket\`:** för \`lokal-se\` gäller därutöver NAP-konsistens mot business.ts, ortssidornas kvalitet (tunna ortssidor), \`address.publik\`→PostalAddress-konsistens, postalCode-format, GBP-/Bing-/IndexNow-stegen. Vid \`core-only\` är frånvaron av ortssidor och lokala schemadelar KORREKT — rapportera det ALDRIG som ett fynd. Paketlinsens fynd aliasar in på universell kategori (lokal-se:orter → seo).\n\nFinal pre-launch SEO audit of ${site}: audit mode across all pages + launch readiness (sitemap/robots served, canonicals, schema validates, NAP consistency, GSC DNS verification status; robots.txt blockerar inte AI-crawlers på skarp klient (GPTBot/PerplexityBot/ClaudeBot/OAI-SearchBot under Disallow = HIGH; TESTKLIENT undantaget); address.publik→PostalAddress-konsistens och postalCode-format enligt dina hårda regler (false+PostalAddress=CRITICAL, true-utan-PostalAddress=HIGH, fel postalCode-format=CRITICAL); Bing Webmaster-property importerad från GSC med sitemap inskickad; IndexNow-nyckelfil svarar 200 i webbroten — ask nothing, report what you can verify).\n\nINGÅR (din gate): meta/titles/canonicals, schema-validitet, NAP-konsistens, sitemap/robots, GSC DNS-status, AI-crawler-robots, address.publik→PostalAddress + postalCode-format, Bing Webmaster, IndexNow.\nINGÅR INTE (annan gate äger): copykvalitet och slop → visual-gaten; prestanda → technical-gaten.\nCategory: seo. ${structured}` },
  // S5: resorna som lins — samma grindmaskineri, ingen ny motor.
  { key: 'journeys', agentType: 'qa-launcher', prompt: `${kontraktsInstruktion}\n\nRESELINS (S5): läs \`obligatoriskaResor\` och \`toppuppgifter\` ur content/profile.ts och pröva VARJE kontrakterad resa end-to-end mot ${site} — inte bara primärhandlingen. En resa är: var den börjar, vad besökaren gör, vad som kan stoppa den, och att den faktiskt slutar där kontraktet säger. Testa PÅ RIKTIGT (klick, inmatning, navigering) på 375px och desktop; en resa som bara ser rätt ut är inte prövad. Saknas \`obligatoriskaResor\` (t.ex. en v1-profil) är det INTE ett fynd — rapportera status PASS med en findings-rad av severity MEDIUM som säger att resorna inte är kontrakterade ännu (SAKNAS_I_V1), så luckan syns utan att blockera en äldre kund.\n\nINGÅR (din gate): varje kontrakterad resa end-to-end, toppuppgifternas genomförbarhet.\nINGÅR INTE (annan gate äger): primärhandlingens egen kedja → leadgen-gaten (dubbelrapportera inte); prestanda → technical; utseende → visual.\nCategory: journeys. ${structured}` },
  { key: 'visual', agentType: 'design-reviewer', prompt: `Final visual QA of ${site}: run your anti-slop review as a launch gate. FAIL on any CRITICAL conversion blocker or instant-fail slop pattern.\n\nINGÅR (din gate): visuell layout/hierarki, responsivitet, typografi, bildrendering, slop/AI-mönster.\nINGÅR INTE (annan gate äger): INNEHÅLLET/sanningen i förtroendesignaler (stämmer omdömen/betyg/certifikat/NAP) → trust-gaten; meta/schema → seo-gaten.\nCategories: visual (design issues) or leadgen (conversion blockers). ${structured}` },
  { key: 'trust', agentType: 'design-reviewer', prompt: `Trust audit of ${site} — a distinct lens from visual QA: verify every trust element is real and consistent. KVITTOLISTAN i content/profile.ts är facit för VILKA förtroendekvitton denna kund har (F-skatt/certifikat, utbildningar, portfolio, omdömen, försäkring, fysisk plats) och dess attributionsregler styr bedömningen (t.ex. utbildning redovisas som utbildning, aldrig som utfall). Verifiera: omdömen have namn+ort and match content/testimonials.ts, betyg matches content/business.ts rating, certifikat/kvitton badges correspond to business.ts/profile.ts, NAP in footer = business.ts exactly, garanti/tillgänglighets-/tidsclaims appear only where the content files back them, org.nr + F-skatt present (invariant för näringsidkare).\n\nINGÅR (din gate): INNEHÅLLET/sanningen i förtroendesignaler — kvitton per profile.ts kvittolista + attributionsregler, omdömen (namn+ort, matchar testimonials.ts), betyg matchar business.ts, NAP=business.ts exakt, claims backade i content, org.nr+F-skatt.\nINGÅR INTE (annan gate äger): HUR de ser ut → visual-gaten; juridisk fullständighet (integritetspolicy/cookies) → legal-gaten.\nCategory: trust. ${structured}` },
  { key: 'security', agentType: 'qa-launcher', prompt: `Run Gate 7 (säkerhet) of your prelaunch process against ${site}: npm audit --omit=dev (FAIL on high/critical in PROD dependencies only); verify security headers ACTUALLY SERVED via curl -sI against the preview URL (Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, frame-ancestors 'none' or X-Frame-Options: DENY — canonical fix is headers() in next.config.ts per your security-checklist reference); form-abuse protection on the quote endpoint (honeypot silent-200, time-trap on a client-measured elapsedMs duration (single clock, never a client timestamp vs the server clock; missing/0 fails open), server-side validation with length caps + email format, recipient hardcoded from env LEAD_TO_EMAIL — NEVER from request body = CRITICAL open spam relay, generic client errors with no env names/stacks/Resend responses; platform-level rate limiting is an optional NOTE, never a DB-based limiter); secrets (no key values in .next/static or repo/git history, .env* git-ignored, API keys server-code only); Deployment Protection på preview: en NAKEN .vercel.app-URL (ingen bypass) ger 401 — noindex räcker inte, en indexerbar preview-URL kan ranka mot kundens riktiga domän (denna check gör medvetet en naken förfrågan; alla andra URL-kontroller använder bypass per noten); /api/puls-kontraktet: mottagare LEAD_TEST_TO ur env (aldrig request body), token PULS_TOKEN ur env, saknad/fel token → 404 (samma öppna-spamrelä-krav som lead-endpointen).\n\nINGÅR (din gate): npm audit prod-beroenden, servade säkerhetsheaders, formulärmissbruk (honeypot/tidsfälla/validering/fast mottagare/generiska fel), hemligheter i bundle/repo, Deployment Protection-401 på preview, /api/puls-kontraktet.\nINGÅR INTE (annan gate äger): SSL/länkcrawl → technical-gaten; att formuläret LEVERERAR mejl → leadgen-gaten; cookies/samtycke → legal-gaten.\nCategory: security. ${structured}` },
  { key: 'legal', agentType: 'qa-launcher', prompt: `Run ONLY Gate 6 (Swedish/EU legal) of your prelaunch process against ${site}: Integritetspolicy completeness per your legal-requirements-se reference, cookie/consent situation (verify what actually loads — cookieless Vercel Analytics vs anything requiring consent), Företagsuppgifter in footer, Google Fonts CDN absence, claims verifiability, ångerrätt applicability. LÄS DESSUTOM juridikflaggor ur content/profile.ts och rapportera per aktiv flaggas kravlista (nortropic-plan/references/juridikflaggor.md) utöver basen. OBSERVE AND REPORT ONLY.\n\nINGÅR (din gate): integritetspolicy-fullständighet, cookie/samtycke (vad som faktiskt laddas), Företagsuppgifter, Google Fonts CDN-frånvaro, claims-verifierbarhet, ångerrätt.\nINGÅR INTE (annan gate äger): fixar (legal är ALLTID human-only — föreslå aldrig auto-fix); förtroende-utseende → visual/trust.\nCategory: legal for every finding. ${structured}` },
]

phase('Gates')
log('Running 8 audit lenses in parallel')
let gateResults = await parallel(GATES.map(g => () =>
  agent(g.prompt + bypass, { label: `gate:${g.key}`, phase: 'Gates', schema: GATE })
))
let gates = Object.fromEntries(GATES.map((g, i) => [g.key, gateResults[i] || { status: 'FAIL', findings: [{ severity: 'CRITICAL', title: `${g.key} gate did not complete`, location: 'workflow', why: 'auditor agent failed or was skipped', fix: 'rerun /nortropic-launch', category: g.key === 'legal' ? 'legal' : 'technical' }] }]))

const legalFindings = gates.legal.findings || []

phase('Fix loop')
let round = 0
let freshUrl = (args && args.url) ? args.url : null   // repointed to each round's redeploy
const fixLog = []
let contractStop = null   // BATCH-005: brutet fixkontrakt → rundan blockeras utan commit, loopen avslutas
let lastHead = null       // BATCH-006: slutcommitens SHA (sätts efter varje godkänd efterkontroll) — svepets ankare
let lastFreshRound = null // BATCH-006: senaste runda vars release BEVISLIGEN repointade freshUrl (um-match ≠ none)
// Bemannat: upp till 3 autonoma fixrundor med en människa som övervakar. Obemannat (nortropic-autobygg.js) gör MEDVETET bara EN runda och lämnar sedan över — ingen vaktar där, så det är försiktigare. 1-vs-3 är avsiktligt; harmonisera aldrig. Gränsen 3 är §A-skyddad (docs/07 §A3) — ändras bara av människa.
while (round < 3) {
  const failing = GATES.filter(g => g.key !== 'legal' && gates[g.key].status === 'FAIL')
  if (!failing.length) break
  round += 1
  const fixable = failing.flatMap(g => (gates[g.key].findings || []).filter(f => f.category !== 'legal'))
  if (!fixable.length) break
  log(`Fix round ${round}/3: ${fixable.length} findings across ${failing.map(g => g.key).join(', ')}`)
  // BATCH-005: snapshot FÖRE rundan — utan den är deltat odömbart → blockera innan fixarbete slösas.
  const preSnap = await agent(porcelainPrompt(`before fix round ${round}`, 'the Nortropic site in the current working directory'), { label: `snapshot:pre:r${round}`, phase: 'Fix loop', schema: FILELIST })
  if (!preSnap) { contractStop = { round, rule: 'snapshot', detail: 'före-snapshoten kunde inte tas — deltat är odömbart' }; break }
  if (!validHead(preSnap.head)) { contractStop = { round, rule: 'snapshot', detail: `före-snapshoten saknar giltig HEAD-hash — odömbart${preSnap.note ? ` (note: ${preSnap.note})` : ''}` }; break }
  // D1: route by category — seo findings to seo-optimizer (it can Edit meta/schema), the rest to stack-builder.
  // Sequential (not parallel) so two fixers never write the repo at once.
  const seoFixable = fixable.filter(f => f.category === 'seo')
  const buildFixable = fixable.filter(f => f.category !== 'seo')
  const fixReturns = []
  if (buildFixable.length) {
    const r = await agent(
      `Fix mode. Fix ONLY these verified launch-gate findings in the Nortropic site in the current working directory, minimally, then run pnpm build and confirm zero errors. Do NOT commit and do NOT stage anything — the release step commits a known set. Return per schema the complete list of repo-relative paths of every file you created, modified or deleted (including package.json and pnpm-lock.yaml if you install or upgrade anything) — report the list mechanically, do not filter or judge it.\n\n${JSON.stringify(buildFixable, null, 2)}`,
      { label: `fix:build:round${round}`, phase: 'Fix loop', agentType: 'stack-builder', schema: FILELIST }
    )
    fixReturns.push({ agent: 'stack-builder', result: r })
  }
  if (seoFixable.length) {
    const r = await agent(
      `Fix mode (SEO). Fix ONLY these verified SEO launch-gate findings (meta/titles/schema/NAP/sitemap) in the Nortropic site in the current working directory, minimally, then confirm the build. Do NOT commit and do NOT stage anything — the release step commits a known set. Return per schema the complete list of repo-relative paths of every file you created, modified or deleted — report the list mechanically, do not filter or judge it.\n\n${JSON.stringify(seoFixable, null, 2)}`,
      { label: `fix:seo:round${round}`, phase: 'Fix loop', agentType: 'seo-optimizer', schema: FILELIST }
    )
    fixReturns.push({ agent: 'seo-optimizer', result: r })
  }
  // BATCH-005: kontraktet prövas MEKANISKT (ren JS, aldrig agentprosa) innan något stageas.
  const dead = fixReturns.filter(x => !x.result)
  if (dead.length) { contractStop = { round, rule: 'felmod-4', detail: `${dead.map(x => x.agent).join(', ')} returnerade ingen fillista — blockerat; aldrig svepande staging (-A/-u) som fallback` }; break }
  const declared = [...new Set(fixReturns.flatMap(x => (x.result.files || []).map(normPath)))].filter(f => !CONTRACT_EXEMPT(f))
  const bad = badRepoPaths(declared)
  if (bad.length) { contractStop = { round, rule: 'felmod-3', detail: `sökväg utanför byggkatalogen/ogiltig: ${bad.join(', ')}` }; break }
  const postSnap = await agent(porcelainPrompt(`after fix round ${round}`, 'the Nortropic site in the current working directory'), { label: `snapshot:post:r${round}`, phase: 'Fix loop', schema: FILELIST })
  if (!postSnap) { contractStop = { round, rule: 'snapshot', detail: 'efter-snapshoten kunde inte tas — deltat är odömbart' }; break }
  if (!validHead(postSnap.head)) { contractStop = { round, rule: 'snapshot', detail: `efter-snapshoten saknar giltig HEAD-hash — odömbart${postSnap.note ? ` (note: ${postSnap.note})` : ''}` }; break }
  if (preSnap.head.trim() !== postSnap.head.trim()) { contractStop = { round, rule: 'head-flytt', detail: `HEAD flyttades under fixrundan (${preSnap.head.trim().slice(0, 8)} → ${postSnap.head.trim().slice(0, 8)}) — en agent committade själv; endast release-steget får committa` }; break }
  const preFiles = (preSnap.files || []).filter(f => !CONTRACT_EXEMPT(f))
  const postFiles = (postSnap.files || []).filter(f => !CONTRACT_EXEMPT(f))
  if (declared.length && !postFiles.length) { contractStop = { round, rule: 'snapshot', detail: 'deklarationen är icke-tom men efter-snapshoten tom — motsägelse, odömbart (aldrig tyst överhoppad commit)' }; break }
  const delta = fixDelta(preFiles, postFiles, declared)
  if (delta.foreign.length) { contractStop = { round, rule: 'felmod-2b', detail: `deklarerade filer var redan smutsiga FÖRE rundan (commit skulle smuggla in främmande ändringar): ${delta.foreign.join(', ')}` }; break }
  if (delta.undeclared.length) { contractStop = { round, rule: 'felmod-1', detail: `ändrade men EJ deklarerade filer: ${delta.undeclared.join(', ')} — partiell commit återinför rorjour-buggen för exakt dem` }; break }
  if (delta.cleanDeclared.length) log(`WARN (felmod 2a): deklarerade men aldrig ändrade — utesluts ur stageningen (endast delta-verifierade filer når git): ${delta.cleanDeclared.join(', ')}`)
  // Stagea SNITTET declared ∩ efter-snapshot: varje post är en verklig smutsig FIL ur porcelain —
  // kataloger, globs ('content/*.ts'), '.' och fantomsökvägar kan inte förekomma här.
  const postSet = new Set(postFiles.map(normPath))
  const stageSet = declared.filter(f => postSet.has(f))
  if (!stageSet.length) { log('Fixagenterna ändrade ingenting — inget att committa; kvarvarande fynd behöver människa.'); break }
  // Commit + redeploy BEFORE re-checking so URL-based gates (Lighthouse, curl-headers,
  // end-to-end lead, SSL) audit the FIXED build — not the stale origin/main preview.
  // rorjour: fixes sat uncommitted → the preview served pre-fix values → rounds were wasted
  // re-finding fixed issues. This step NEVER edits code: legal is still excluded from `fixable`,
  // the 3-round bound and D1 routing are unchanged. BATCH-005: stageningen är nu den delta-
  // verifierade KÄNDA mängden stageSet (NRT-003) — aldrig git add -A, aldrig git add -u.
  const pathArgs = stageSet.map(f => `"${f}"`).join(' ')
  const release = await agent(
    `Release step for the Nortropic site in the current working directory — do NOT change any code. (1) Stage EXACTLY this known set and nothing else by running exactly: git --literal-pathspecs add -- ${pathArgs} — then commit ONLY that same set by running exactly: git --literal-pathspecs commit -m "<descriptive message about the round-${round} launch-gate fixes>" -- ${pathArgs} — the pathspec'd commit is deliberate: it keeps any previously staged unrelated content OUT of this commit, and --literal-pathspecs is deliberate: paths like app/[stad]/page.tsx are literal file names, never glob patterns. NEVER stage sweepingly (no "-A", no "-u", no "git add ."), never add any path outside the list. If a git step fails: do NOT improvise and do NOT widen the staging — stop, report the error, and return PREVIEW_URL=none. (2) Redeploy a fresh preview of THIS commit (vercel deploy) and return the UNIQUE deployment URL that vercel deploy prints (the https://<project>-<hash>-<scope>.vercel.app form — NEVER a project or branch alias, which can be repointed by concurrent deploys) on the final line as exactly PREVIEW_URL=<url>. If no deploy is possible, run pnpm build to prove the fixed tree compiles and return PREVIEW_URL=none.`,
    { label: `release:round${round}`, phase: 'Fix loop', agentType: 'stack-builder' }
  )
  if (!release) { contractStop = { round, rule: 'release', detail: 'release-steget returnerade ingenting — commit-utfallet är odömbart' }; break }
  // BATCH-006: förankrad multiline-match, SISTA träffen — release-prompten citerar själv strängen
  // "PREVIEW_URL=<url>"/"=none" och en oankrad first-match kunde fånga instruktionsekot i stället
  // för slutraden. URL:en valideras i ren JS (validPreviewUrl, hoistad från BATCH-006-blocket nedan)
  // innan den godtas — ogiltig form behandlas som none, aldrig interpolering av ovaliderad agentretur.
  const um = typeof release === 'string' ? [...release.matchAll(/^PREVIEW_URL=(\S+)\s*$/gm)].pop() : null
  const deployedThisRound = !!(um && um[1] && um[1] !== 'none' && validPreviewUrl(um[1]))
  if (um && um[1] && um[1] !== 'none' && !deployedThisRound) log(`WARN: release returnerade ogiltig preview-URL — behandlas som PREVIEW_URL=none (ovaliderad agentretur interpoleras aldrig)`)
  if (deployedThisRound) { freshUrl = um[1]; lastFreshRound = round }
  // BATCH-005: mekanisk EFTERKONTROLL av commit-utfallet — sista ledet vilar aldrig på prosa.
  // Detektion, inte prevention: committen finns när avvikelsen upptäcks, men rundan blockeras
  // FÖRE omkontrollen och människan får revert-underlaget i klartext.
  const commitSnap = await agent(
    `Mechanical commit inspection in the project root of the Nortropic site in the current working directory. Run exactly: git -c core.quotepath=off -c diff.renames=false show --name-only --format= HEAD — diff.renames=false is deliberate: a rename must list BOTH paths, matching the staged set. Return every path listed as BARE repo-relative paths (strip any surrounding double quotes). Also run exactly: git rev-parse HEAD — return the full 40-character hash as head. Do not filter or judge — report mechanically. If a command fails, return files: [] and say exactly why in note.`,
    { label: `commitset:r${round}`, phase: 'Fix loop', schema: FILELIST }
  )
  if (!commitSnap) { contractStop = { round, rule: 'release-efterkontroll', detail: 'commit-inspektionen kunde inte tas — utfallet är odömbart' }; break }
  if (!validHead(commitSnap.head)) { contractStop = { round, rule: 'release-efterkontroll', detail: `commit-inspektionen saknar giltig HEAD-hash — odömbart${commitSnap.note ? ` (note: ${commitSnap.note})` : ''}` }; break }
  if (commitSnap.head.trim() === postSnap.head.trim()) { contractStop = { round, rule: 'release-efterkontroll', detail: 'ny commit saknas — HEAD står kvar; release-stegets commit fallerade (ingenting att reverta, fixarna står ocommittade)' }; break }
  const committed = new Set((commitSnap.files || []).map(normPath))
  if (committed.size !== stageSet.length || !stageSet.every(f => committed.has(f))) {
    contractStop = { round, rule: 'release-efterkontroll', detail: `committad mängd ≠ stagead känd mängd (committat: ${[...committed].join(', ') || 'inget'}; förväntat: ${stageSet.join(', ')}) — committen finns redan; mänsklig granskning/revert krävs före ny körning` }
    break
  }
  lastHead = commitSnap.head.trim()   // BATCH-006: godkänd efterkontroll → detta är (hittills) slutcommiten
  // BATCH-006: fixLog pushas FÖRST HÄR, efter godkänd efterkontroll — en fixLog-rad BETYDER därmed
  // "committad runda" per konstruktion (adversariell granskning: pushen låg tidigare före release-
  // steget, så en runda vars commit fallerade stod ändå i loggen och invarianten bars implicit av
  // contractStop-vägarna; nu bär datat sin egen betydelse och fixRounds i rapporten ljuger aldrig).
  fixLog.push({ round, findings: fixable.length, files: stageSet, byAgent: fixReturns.map(x => ({ agent: x.agent, files: (x.result.files || []).map(normPath) })) })
  // BATCH-006 (ärlighetsfix, adversariell granskning): recheck-texten påstod "REDEPLOYED" även på
  // none-vägen — falsk premiss mot en stale preview. Nu villkorad på deployedThisRound, med
  // supersede-mening så baspromptens inbäddade ursprungs-URL aldrig konkurrerar med den färska.
  const recheck = await parallel(failing.map(g => () =>
    agent(GATES.find(x => x.key === g.key).prompt + (deployedThisRound
      ? ` This is a RE-CHECK after fixes. The fixes are COMMITTED and REDEPLOYED — run every check against this fresh preview: ${freshUrl}. Any preview or dev URL mentioned earlier in this prompt is SUPERSEDED by that URL — never contact it and do not start a dev server.`
      : ` This is a RE-CHECK after fixes. The fixes are COMMITTED, but this round could NOT be redeployed — any deployed preview is STALE relative to this round's fixes: verify code-level checks against the working tree, and never report a URL-dependent check as PASS on stale grounds.`)
      + ` Verify the previously failing checks first; before reporting any issue, confirm it still reproduces on THIS build (not a cached/stale one).` + bypass, { label: `recheck:${g.key}:r${round}`, phase: 'Fix loop', agentType: g.agentType, schema: GATE })
  ))
  failing.forEach((g, i) => { if (recheck[i]) gates[g.key] = recheck[i] })
}
if (contractStop) log(`FIXKONTRAKT BRUTET (runda ${contractStop.round}, ${contractStop.rule}): ${contractStop.detail} — fixloopen avbröts före omkontrollen; kvarvarande fynd behöver människa.`)

// ═══════════ BATCH-006-full-sweep: PASS-INVARIANTEN (NRT-001) ═══════════
// Appendix A: "Alla gates om mot final SHA/URL; PASS-invariant" — verdiktets ankare är en FÄRSK
// helmätning, inte rond-0-resultat som fixrundor kan ha gjort stale (`const failing` omkontrollerar
// bara tidigare RÖDA grindar — en grön grind kan aldrig bli röd igen inne i loopen; DET är NRT-001).
// Villkorsformen är STRUKTURELL (ägarbeslut 2026-08-06): svepet körs ENDAST när (a) inget
// contractStop (en helmätning mot ett träd i kontraktsbrott ankrar ingenting), (b) ≥1 fixrunda
// COMMITTAD — fixLog pushas först efter godkänd release-efterkontroll, så en rad BETYDER committad
// runda (round duger inte: den räknar även no-op-rundor där inget ändrades), och
// (c) alla icke-legal-grindar står PASS FÖRE svepet. (c) gör uppåt-flipp strukturellt onåbar:
// svepet kan bara BEKRÄFTA eller FÄLLA ett READY, aldrig fria en röd grind — en fjärde omkontroll
// vore en de facto-erosion av 3-rundorsgränsen (§A3). Struktur före regel: INV-001/INV-006-klassen.
// Accepterad kostnad (registrerad): en BLOCKED-rapport får ingen färskhetsgaranti för gröna rader —
// rapporten är redan BLOCKED och läses av en människa.

// Beslut 3 (BATCH-006): ren JS-prövning av deploy-beviset — scouten rapporterar RÅDATA, beslutet
// fattas här. Odömbart (oparsbart/tomt/UTAN EXPLICIT TIDSZON/deploy äldre än commit) → aldrig tyst
// grönt. Offsetkravet är bärande (adversariell granskning): offsetlös ISO är giltig ISO men tolkas
// som VÄRDDATORNS lokaltid av Date.parse — beviset kunde förskjutas ±offset åt BÅDA hållen, inklusive
// att en stale deploy passerade som färsk. Trim är bärande: %cI slutar med newline → NaN annars.
function deployBevis(deployedAt, commitTime) {
  const ISO_MED_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/
  const ds = String(deployedAt || '').trim()
  const cs = String(commitTime || '').trim()
  if (!ISO_MED_OFFSET.test(ds)) return { ok: false, reason: 'deployens skapelsetid saknas, är ofullständig eller saknar explicit tidszon (Z/offset) — lokaltolkad tid är odömbar' }
  if (!ISO_MED_OFFSET.test(cs)) return { ok: false, reason: 'slutcommitens tid saknas, är ofullständig eller saknar explicit tidszon' }
  const d = Date.parse(ds)
  const c = Date.parse(cs)
  if (!isFinite(d) || !isFinite(c)) return { ok: false, reason: 'tidsstämpel kunde inte tolkas' }
  if (d < c) return { ok: false, reason: `deployen (${ds}) är ÄLDRE än slutcommiten (${cs}) — previewn serverar inte det slutliga bygget` }
  return { ok: true }
}

// BATCH-006: preview-URL:er är AGENTRETURER — opålitlig data (samma hotmodell som badRepoPaths i
// kärnan: shellaktiva tecken passerar \S+) — och interpoleras i recheck-/svep-/scoutprompter som
// beordrar "Run exactly". Ren JS-validering INNAN de godtas: https, vercel.app-värd, rot-path,
// ingen query/hash/auth. Ogiltig form ⇒ behandlas som PREVIEW_URL=none, aldrig interpolering.
// (Deklarerad här i BATCH-006-blocket; används i fixloopen ovan via function-hoisting.)
function validPreviewUrl(u) {
  try {
    const p = new URL(String(u || ''))
    return p.protocol === 'https:' && /^[a-z0-9-]+(\.[a-z0-9-]+)*\.vercel\.app$/.test(p.hostname)
      && p.pathname === '/' && !p.search && !p.hash && p.username === '' && p.password === ''
  } catch (e) { return false }
}

const DEPLOYPROOF = {
  type: 'object',
  required: ['deployedAt', 'commitTime'],
  properties: {
    deployedAt: { type: 'string', description: 'deployens skapelsetid, ISO 8601 MED explicit tidszon (Z eller ±offset); tom sträng om den inte kan fastställas' },
    commitTime: { type: 'string', description: 'utdata från git show -s --format=%cI <slutcommit>' },
    deployCommit: { type: 'string', description: 'deployens git-commit-SHA (40 hex) om vercel inspect visar den; tom sträng annars' },
    note: { type: 'string' },
  },
}

const SWEEP_GATES = GATES.filter(g => g.key !== 'legal')   // SAMMA uttryck som failing/nonLegalPass/remaining — legal dras ALDRIG in (§A3-exkluderingen bevaras genom återanvändning, aldrig ny logik)
const preSweepPass = SWEEP_GATES.every(g => gates[g.key].status === 'PASS')
let sweep = null   // { verdict: 'GENOMFÖRT' | 'ODÖMBAR', regressions, finalCommit, url, ... } | null (villkoret föll — inget svep)
if (!contractStop && fixLog.length >= 1 && preSweepPass) {
  phase('Final sweep')
  const preSweepStatus = Object.fromEntries(SWEEP_GATES.map(g => [g.key, gates[g.key].status]))
  // Färsk deploy måste BEVISAS, aldrig antas — en boolean kan säga true medan URL:en serverar
  // för-fix-bygget. Bevis i tre led: (1) sista committade rundans release repointade freshUrl
  // (JS-spårat via lastFreshRound), (2) mekanisk scout hämtar deployens skapelsetid + slut-
  // commitens tid som rådata, (3) deployBevis kräver deploy EFTER commit. Faller något led är
  // svepet ODÖMBART → FAIL-fallback på alla sju icke-legal-grindar med ärlig orsak — samma form som
  // contractStop och doctors OGILTIG: odömbart blir aldrig tyst grönt.
  let bevisFel = null
  const lastCommittedRound = fixLog[fixLog.length - 1].round
  if (!freshUrl || lastFreshRound !== lastCommittedRound) {
    bevisFel = 'fixar committade men aldrig deployade (sista committade rundans release gav ingen färsk preview-URL) — deploya och kör om'
  } else if (!validHead(lastHead || '')) {
    bevisFel = 'slutcommitens SHA saknas — deploy-beviset kan inte föras'
  } else {
    const proof = await agent(
      `Mechanical deploy proof in the project root of the Nortropic site in the current working directory. Run exactly: vercel inspect ${freshUrl} — from its output report: (a) the deployment's creation time as ISO 8601 WITH explicit UTC offset or Z in deployedAt (if the tool shows a local time, keep that exact offset; NEVER strip or invent a timezone; if the time cannot be determined, return deployedAt as an empty string and say exactly why in note — never guess), and (b) the deployment's git commit SHA as deployCommit if the output shows one (empty string if not shown — never guess). Also run exactly: git show -s --format=%cI ${lastHead} — return the timestamp as commitTime. Do not filter or judge — report mechanically.`,
      { label: 'sweep:deploy-bevis', phase: 'Final sweep', schema: DEPLOYPROOF }
    )
    // Identitet slår tid (adversariell granskning: vercel inspect följer alias, och en samtidig
    // auto-deploy kan repointa ett alias — tidsbeviset ensamt binder inte URL:en till slutcommiten):
    // visar deployen en commit-SHA prövas den mot lastHead i ren JS; annars gäller tidsbeviset.
    const dc = String((proof && proof.deployCommit) || '').trim()
    if (validHead(dc)) {
      if (dc !== lastHead) bevisFel = `deployens commit-SHA (${dc.slice(0, 8)}) ≠ slutcommiten (${lastHead.slice(0, 8)}) — previewn serverar fel bygge`
    } else {
      const chk = deployBevis(proof && proof.deployedAt, proof && proof.commitTime)
      if (!chk.ok) bevisFel = `${chk.reason}${proof && proof.note ? ` (note: ${proof.note})` : ''}`
    }
  }
  if (bevisFel) {
    log(`FINAL SWEEP ODÖMBART: ${bevisFel} — READY blockeras; odömbart blir aldrig tyst grönt.`)
    SWEEP_GATES.forEach(g => { gates[g.key] = { status: 'FAIL', findings: [{ severity: 'CRITICAL', title: `final sweep odömbar (${g.key})`, location: 'workflow', why: `PASS-invarianten (NRT-001) kräver färsk helmätning mot BEVISAD deploy: ${bevisFel}`, fix: 'deploya den slutliga committen och kör /nortropic-launch igen', category: g.key }] } })
    sweep = { verdict: 'ODÖMBAR', reason: bevisFel, finalCommit: lastHead, url: freshUrl }
  } else {
    log(`Final sweep: alla sju icke-legal-grindar körs om mot den slutliga previewn (${lastHead.slice(0, 12)}) — verdiktet ankras i denna mätning`)
    const sweepResults = await parallel(SWEEP_GATES.map(g => () =>
      agent(g.prompt + ` This is the FINAL SWEEP after the fix loop — the launch verdict is anchored in THIS measurement (NRT-001 PASS-invariant). All fixes are committed (final commit ${lastHead.slice(0, 12)}) and THIS preview URL is mechanically verified fresh: ${freshUrl}. Any preview or dev URL mentioned ANYWHERE earlier in this prompt is SUPERSEDED by that URL — never contact it and do not start a dev server; EVERY URL-based check (Lighthouse, curl, crawl, form submits, the naked-request assertion) runs against exactly that preview. Run your FULL gate from scratch; assume NOTHING from earlier results in this run.` + bypass,
        { label: `sweep:${g.key}`, phase: 'Final sweep', agentType: g.agentType, schema: GATE })
    ))
    // ERSÄTTNINGSSEMANTIK (ägarbeslut): svepet uppdaterar kartINNEHÅLLET — verdiktraderna nedan är
    // orörda. Död svepagent → FAIL-fallback (rad-200-precedentet): en odömbar svepgrind får ALDRIG
    // tyst behålla sitt gamla gröna värde.
    SWEEP_GATES.forEach((g, i) => {
      gates[g.key] = sweepResults[i] || { status: 'FAIL', findings: [{ severity: 'CRITICAL', title: `${g.key} final-sweep did not complete`, location: 'workflow', why: 'svepagenten dog — en odömbar svepgrind får aldrig tyst behålla sitt gamla gröna värde', fix: 'rerun /nortropic-launch', category: g.key }] }
    })
    sweep = { verdict: 'GENOMFÖRT', finalCommit: lastHead, url: freshUrl }
  }
  // NRT-001-fallet självt — grön i tidigare mätning, röd i svepet — ska vara OMÖJLIGT att missa.
  // Endast för GENOMFÖRT: ODÖMBAR-fallbackens FAIL är SYNTETISKA, inte uppmätta regressioner
  // (backlog-numbers-are-claims-klassen — omätta tal rapporteras aldrig som mätta).
  sweep.regressions = sweep.verdict === 'GENOMFÖRT'
    ? SWEEP_GATES.filter(g => preSweepStatus[g.key] === 'PASS' && gates[g.key].status === 'FAIL').map(g => g.key)
    : []
  if (sweep.verdict === 'GENOMFÖRT' && sweep.regressions.length) {
    sweep.changedFiles = [...new Set(fixLog.flatMap(r => r.files))]
    log(`SVEPET FÄLLDE tidigare grön(a) grind(ar): ${sweep.regressions.join(', ')} — ändrade filer sedan de gröna mätningarna (fixkontraktets deklarationer): ${sweep.changedFiles.join(', ')}`)
  }
}
// ═══════════ SLUT BATCH-006-full-sweep ═══════════

const nonLegalPass = GATES.filter(g => g.key !== 'legal').every(g => gates[g.key].status === 'PASS')

// v5: non-blocking quality eval. Runs only once the non-legal gates pass — the GATES block launch,
// the eval only measures. Its score informs the report and feeds retro's cross-client comparison.
// BATCH-007: evalen mäter det som LANSERAS. Invarianten (mekaniskt prövad i FAS A): eval nås endast
// via (A) noll committade fixrundor — site är då orörd sedan rond 0 — eller (B) svep GENOMFÖRT utan
// regressioner — sweep.url är då den enda BEVISADE mätytan, bunden till finalCommit. Pekaren
// villkoras EXPLICIT på verdiktet, aldrig på blotta sweep !== null: datat bär sin egen betydelse,
// och pekaren får inte vila på den implicita invarianten "sweep non-null ∧ nonLegalPass ⇒ GENOMFÖRT"
// som en framtida redigering kan bryta tyst. ERSÄTTNING, inte supersede — evalens prompt bär EN URL
// (BATCH-006-skeptiklärdomen: två URL:er i samma prompt är felmoden). Dev-server är ALDRIG evalens
// mätyta — siffran jämförs mellan kunder och över tid (grindarnas dev-server-fallback är ett EGET
// registrerat ärende och rörs inte här). Kriterieantalet har EN hemvist: rubrikens egen header —
// prompten räknar aldrig igen ("all 10" stod kvar efter v14:s elfte kriterium; en-plats-principen).
const evalSite = (sweep && sweep.verdict === 'GENOMFÖRT')
  ? `the Nortropic site in the current working directory (preview URL: ${sweep.url} — the FINAL-SWEEP-VERIFIED deployment of final commit ${String(sweep.finalCommit).slice(0, 12)}; measure ONLY this URL, never any other preview and never a dev server)`
  : ((args && args.url)
    ? `${site} — measure ONLY this URL, never any other preview and never a dev server`
    : `the Nortropic site in the current working directory (measure the UNIQUE deployed preview URL — never a project/branch alias — whose commit SHA per vercel inspect matches git HEAD of this working directory; if no deployment matches HEAD, do NOT guess and never start a dev server — stamp "mätyta obevisad: ingen HEAD-matchande deploy" in the scorecard header and score URL-dependent criteria on that honest basis)`)
let evalResult = null
if (nonLegalPass) {
  phase('Eval')
  evalResult = await agent(
    `Run the nortropic-eval quality rubric against ${evalSite}. Read ~/.claude/skills/nortropic-eval/SKILL.md and its references/eval-rubric.md, then score ALL criteria in the rubric (the rubric's own intro states how many — that count is authoritative over any other number you encounter, including the skill's headings and the rubric changelog) in ONE coherent judgment, apply the Faktatrohet hard-gate, and WRITE the scorecard to EVAL-RESULT.md in the project root per the skill's template, stamped with today's date, the rubric version, the number of criteria scored, and the clean preview ORIGIN you measured against — WITHOUT any bypass query parameters (LÄCKSKYDD gäller även denna stämpel). This is INFORMATIONAL — it does not gate the launch. Return the structured result (total, faktatrohet PASS/FAIL, band, version, top brister, resultPath).` + bypass + ` EVAL-NOTE (overrides the Gate-7 exception in the note above, for THIS eval only): the eval has NO naked-request assertion — EVERY URL request here authenticates with the bypass; a 401 is a bypass mistake in YOUR tooling, never grounds for the rubric's static-assessment fallback while the preview is reachable.`,
    { label: 'eval:rubric', phase: 'Eval', schema: EVAL }
  )
}

phase('Handover')
let handover = null
if (nonLegalPass || round >= 3) {
  const seoDeliverables = await agent(
    `Deliverables mode for the Nortropic site in the current working directory: produce the per-client Google Företagsprofil checklist (filled with THIS client's data from content/business.ts and the services) and the concrete Google Search Console launch steps. Write them to gbp-checklist-klient.md and gsc-steg-klient.md in the project root and return a short summary of both.`,
    { label: 'handover:seo-deliverables', phase: 'Handover', agentType: 'seo-optimizer' }
  )
  handover = await agent(
    `Write the Swedish client handover document for the Nortropic site in the current working directory as HANDOVER.md in the project root. Audience: the business owner (not technical). Sections: 1) Din nya webbplats (pages, what each does), 2) Så får du dina leads (where quote emails arrive, what a lead looks like, what to do), 3) Uppdatera innehåll (how to request changes via Nortropic; which facts live where), 4) Google Företagsprofil — din checklista (incorporate gbp-checklist-klient.md), 5) Google Search Console — de första 2 veckorna (incorporate gsc-steg-klient.md), 6) Support & kontakt, 7) Utfallshypotes. **PAKETVILLKORAT (S5):** läs \`paket\` i content/profile.ts. Sektion 4 och 5 (GBP + GSC-ortsstegen) hör till \`lokal-se\`-paketet — vid \`core-only\` UTELÄMNAS de och du säger i stället en mening om varför de inte gäller för den här kunden, i stället för att leverera en checklista hen aldrig kan följa. Sektionerna 1, 2, 3, 6 och 7 är KÄRNA och skrivs alltid. Section 7 is ONE short block, 1–3 lines, derived STRICTLY from the brief's §7 framgångsmått: what we expect this site to change for the business, stated so it could turn out to be wrong. Promise nothing the brief does not back, invent no numbers, and give no date beyond what the brief states. It is a hypothesis, not a guarantee — write it in that voice. This exact block is the row a human later copies into the client repo's LEARNING-RECORD.md under "## Hypotes" (contract: skills/nortropic-retro/references/learning-record.md). Voice: clear, warm, zero jargon. Context from SEO deliverables: ${typeof seoDeliverables === 'string' ? seoDeliverables.slice(0, 3000) : JSON.stringify(seoDeliverables).slice(0, 3000)}`,
    { label: 'handover:doc', phase: 'Handover', agentType: 'content-designer' }
  )
}

phase('Report')
const rows = GATES.map(g => {
  const r = gates[g.key]
  const status = g.key === 'legal' ? (legalFindings.length ? '⚠️ HUMAN REVIEW' : '⚠️ HUMAN SIGN-OFF (no findings, still requires sign-off)') : (r.status === 'PASS' ? '✅ PASS' : '❌ FAIL')
  return { gate: g.key, status, findings: (r.findings || []).length }
})
const evalNote = evalResult
  ? ` | Kvalitetseval: ${evalResult.total}/100${evalResult.faktatrohet === 'FAIL' ? ' — FAKTATROHET FAIL (granska innan lansering)' : ` (${evalResult.band})`}`
  : ''
// BATCH-006: informationsnot i verdiktsträngen (samma appendform som evalNote — grenlogiken orörd).
// NRT-001-fallet (svepet fällde tidigare grön grind) ska vara omöjligt att missa i rapporten.
const sweepNote = sweep
  ? (sweep.verdict === 'ODÖMBAR'
    ? ` | FINAL SWEEP ODÖMBART: ${sweep.reason}`
    : sweep.regressions.length
      ? ` | FINAL SWEEP FÄLLDE tidigare grön grind: ${sweep.regressions.join(', ')} — ändrade filer sedan de gröna mätningarna: ${(sweep.changedFiles || []).join(', ')}`
      : ` | Final sweep GENOMFÖRT: verdiktet ankrat i färsk helmätning av ${String(sweep.finalCommit).slice(0, 8)} mot ${sweep.url}`)
  : (fixLog.length ? '' : ' | Final sweep ej tillämpligt: inga fixrundor committade — verdiktet vilar på rond 0:s sammanhängande mätning')
const verdict = (nonLegalPass
  ? (legalFindings.length ? 'BLOCKED — technical gates pass, LEGAL FINDINGS REQUIRE HUMAN JUDGMENT before launch' : 'READY — pending human legal sign-off, then run /vercel:deploy')
  : `BLOCKED — gates still failing after ${round} fix round(s); remaining findings need human attention`) + evalNote + sweepNote

// v5: merge identical findings flagged by more than one gate — count once, record which gates flagged
const remainingRaw = GATES.filter(g => g.key !== 'legal' && gates[g.key].status === 'FAIL').flatMap(g => (gates[g.key].findings || []).map(f => ({ ...f, gate: g.key })))
const remMap = new Map()
for (const f of remainingRaw) {
  const k = `${(f.location || '').trim().toLowerCase()}|${(f.title || '').trim().toLowerCase()}`
  const e = remMap.get(k)
  if (e) e.gates = Array.from(new Set([...(e.gates || [e.gate]), f.gate]))
  else remMap.set(k, { ...f, gates: [f.gate] })
}
const remainingFindings = Array.from(remMap.values())

return {
  verdict,
  gates: rows,
  eval: evalResult,
  legalFindings,
  remainingFindings,
  fixRounds: fixLog,
  contractStop,
  sweep,
  handoverWritten: Boolean(handover),
}
