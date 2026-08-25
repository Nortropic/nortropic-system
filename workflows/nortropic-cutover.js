export const meta = {
  name: 'nortropic-cutover',
  description: 'Mekaniserar nod 10 (Efterarbete) FAS 1–3: förkontroll → noindex borta → GSC-verifiering (via scripts/gsc-setup.mjs). Människotriggat — fas 1 kräver DNS-poster kunden lagt. Fas 4–7 (Bing/IndexNow, uppetidsmonitor, GBP-webbadress, citations) är MEDVETET INTE byggda; se kommentaren överst i filen.',
  whenToUse: 'Körs manuellt av operatören EFTER nod 9 (/vercel:deploy) när kunden har lagt DNS och domänen är kopplad + verifierad i Vercel. Aldrig obemannat — autobygg slutar vid preview och når aldrig en domän. Tar args.clientDir (repo-roten) + args.domain (kanonisk variant, t.ex. "kund.se" eller "www.kund.se").',
  phases: [
    { title: 'Förkontroll', detail: 'domän live + verifierad, sajt svarar, sitemap 200, TESTKLIENT → avbryt' },
    { title: 'noindex',     detail: 'verifiera att noindex är BORTA — FÖRE fas 3' },
    { title: 'GSC',         detail: 'read-only preflight + emitterar gsc-setup verify-kommandot (irreversibel skrivning stannar hos operatören)' },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
//  TRIMMAD TILL FAS 1–3 (datafundament förslag 10, Pass 4).
//
//  FAS 4–7 ÄR MEDVETET INTE BYGGDA — det är inte en ofullständig implementation.
//  Ingen stub: en stub ser ut som täckning och är det inte (samma klass som
//  larmklassnamnet vi rättade i kundhälsa-specen). Skälet (D-analysen): de fyra
//  faserna kräver en LEVANDE cutover-domän + externa konton som inte finns förrän
//  en första skarp kund faktiskt cutoveras, och kan därför varken byggas eller
//  testas mot verkligheten nu:
//
//    Fas 4  Bing/IndexNow   importeras FRÅN den verifierade GSC-propertyn (fas 3
//                           måste ha körts skarpt först); IndexNow-nyckelfil +
//                           deploy-hook mot en levande domän.
//    Fas 5  Uppetidsmonitor  registrerar 3 monitorer mot den live URL:en och
//                           skriver monitor-id till kundregistret (förslag 14,
//                           ännu ej byggt — Pass 5).
//    Fas 6  GBP             kräver en verifierad Google Företagsprofil (veckors
//                           ledtid, startas vid onboarding, inte här).
//    Fas 7  Citations       manuell lista (swedish-directories.md) mot skarpa
//                           kunduppgifter.
//    Fas 8  Slutrapport     summerar 1–7; skrivs när 4–7 finns.
//
//  Byggs när första skarpa kunden cutoveras, mot den kundens riktiga domän.
//  Tills dess körs fas 4–7 manuellt ur gsc-launch-steps.md / HANDOVER.md.
// ═══════════════════════════════════════════════════════════════════════════

// Robust arg-läsning (jfr nortropic-final-touches): args kan nå hit som objekt
// (internt workflow()-anrop) ELLER som JSON-sträng (verktygsgränsen).
let A = args || {}
if (typeof A === 'string') { try { A = JSON.parse(A) } catch { A = {} } }
const clientDir = A.clientDir || 'the Nortropic client site in the current working directory'
const domain = A.domain || null

const PRECHECK = {
  type: 'object',
  required: ['testklient', 'siteResponds', 'sitemapOk', 'canonicalOk', 'ready'],
  properties: {
    testklient:    { type: 'boolean', description: 'business.ts testklient === true' },
    domainFound:   { type: 'string', description: 'domain-fältet ur business.ts' },
    siteResponds:  { type: 'boolean', description: 'https://domän/ svarar 200' },
    sitemapOk:     { type: 'boolean', description: 'https://domän/sitemap.xml svarar 200' },
    canonicalOk:   { type: 'boolean', description: 'domänen landar på sig själv (ingen redirect BORT) OCH motsatt variant (www↔apex) 301:ar HIT — false om båda svarar 200 utan redirect (delade properties)' },
    vercelVerified:{ type: 'string', enum: ['ja', 'nej', 'okänt'], description: 'domänen kopplad + verifierad i Vercel (om kontrollerbart)' },
    ready:         { type: 'boolean', description: 'alla skarpa förkontroller gröna' },
    blockers:      { type: 'array', items: { type: 'string' } },
  },
}
const NOINDEX = {
  type: 'object',
  required: ['noindexRemoved'],
  properties: {
    noindexRemoved: { type: 'boolean', description: 'produktions-HTML + headers saknar noindex på money-sidorna' },
    detail:         { type: 'string' },
    intentionalWindow: { type: 'boolean', description: 'profile.ts noindexCutover.avsiktlig med cutoverSenast i framtiden' },
  },
}
const GSC = {
  type: 'object',
  required: ['verificationFileFound', 'tagLive', 'command'],
  properties: {
    verificationFileFound: { type: 'boolean', description: 'verification.ts finns i klientrepot (token-steget har körts)' },
    tagLive:  { type: 'boolean', description: 'META-taggen syns i produktions-HTML på den kanoniska domänen' },
    command:  { type: 'string', description: 'det exakta gsc-setup.mjs verify-kommandot operatören ska köra' },
    envNeeded:{ type: 'array', items: { type: 'string' } },
    detail:   { type: 'string' },
  },
}

// ── Fas 1: Förkontroll ──────────────────────────────────────────────────────
phase('Förkontroll')
const pre = await agent(
  `Förkontroll inför GSC-cutover av ${domain ? `domänen ${domain}` : 'kundsajten'} (repo: ${clientDir}). Läs ENDAST, rör ingenting skarpt.\n` +
  `1. cd ${clientDir}; läs business.ts (src/content/ eller content/): returnera testklient-flaggan och domain-fältet. `+
  `Läs OCKSÅ content/profile.ts: \`paket\` avgör vilka cutover-steg som gäller. Vid \`core-only\` är de `+
  `lokal-se-specifika stegen (GBP-koppling, ortssidornas indexering) INTE tillämpliga — hoppa dem och säg `+
  `varför i rapporten; kärnstegen (domän, kanonisk variant, sitemap, noindex-borttagning) gäller alltid. `+
  `Saknas profile.ts eller \`paket\`: behandla som core-only och notera det — gissa ALDRIG ett paket.\n` +
  `2. Kanonisk kontroll i BÅDA riktningar (samma logik som scripts/gsc-setup.mjs assertCanonical):\n` +
  `   (a) curl -sIL https://${domain || '<domän ur business.ts>'}/ — svarar den 200 och landar på SAMMA host, dvs ingen redirect BORT?\n` +
  `   (b) hämta den MOTSATTA varianten (www↔apex av ${domain || '<domän>'}) — 301:ar den HIT till ${domain || 'den angivna domänen'}?\n` +
  `   canonicalOk=false om domänen redirectar bort, ELLER om BÅDA varianterna svarar 200 utan att den motsatta 301:ar hit (delade GSC-properties + dubblettinnehåll — exakt nortropic.se:s nuvarande tillstånd, se AH22). Blott "landar på sig själv" räcker INTE.\n` +
  `3. curl -sI https://${domain || '<domän>'}/sitemap.xml — 200?\n` +
  `4. Om \`vercel\` CLI finns: är domänen kopplad + verifierad? Annars vercelVerified="okänt".\n` +
  `ready=true endast om: INTE testklient, siteResponds, sitemapOk, canonicalOk. Lista varje icke-grönt i blockers.`,
  { label: 'cutover:precheck', phase: 'Förkontroll', schema: PRECHECK }
)

if (pre.testklient) {
  log('⛔ TESTKLIENT — cutover körs ALDRIG skarpt (hela sajten är noindex). Avbryter före allt annat.')
  return { status: 'AVBRUTEN', reason: 'TESTKLIENT', phase: 'Förkontroll' }
}
if (!pre.ready) {
  log(`⛔ Förkontrollen inte grön — avbryter före fas 2. Blockerare: ${(pre.blockers || []).join('; ') || 'okänt'}`)
  return { status: 'AVBRUTEN', reason: 'förkontroll', blockers: pre.blockers || [], phase: 'Förkontroll' }
}
log('✅ Fas 1 grön: domänen svarar, kanonisk variant stämmer, sitemap 200, inte testklient.')

// ── Fas 2: noindex borta (load-bearing FÖRE fas 3) ──────────────────────────
phase('noindex')
const ni = await agent(
  `Verifiera att noindex är BORTA på ${domain}:s money-sidor (hem + topp-2 tjänstesidor) INNAN GSC-verifiering. ` +
  `Kontrollera BÅDE produktions-HTML (<meta name="robots" ...>) OCH X-Robots-Tag-headern. Läs även ${clientDir} profile.ts: noindexCutover — är det en avsiktlig pre-cutover-window med cutoverSenast i framtiden? ` +
  `noindexRemoved=true endast om ingen noindex ligger kvar. Detta är load-bearing: verifierar man en property vars sidor är noindexade får man en som ser korrekt ut men aldrig samlar data — tyst.`,
  { label: 'cutover:noindex', phase: 'noindex', schema: NOINDEX }
)
if (!ni.noindexRemoved) {
  log(`⛔ noindex ligger kvar (${ni.detail || 'ingen detalj'}). Fas 3 skulle ge en tom property. Avbryter — ta bort noindex, deploya, kör om.`)
  return { status: 'AVBRUTEN', reason: 'noindex kvar', detail: ni.detail || null, phase: 'noindex' }
}
log('✅ Fas 2 grön: noindex borta på money-sidorna.')

// ── Fas 3: GSC — read-only preflight + emittera verify-kommandot ─────────────
// Den irreversibla GSC-skrivningen (sites.add, ägarskap) stannar hos operatören
// (addendum §5.4: "efter mänsklig grind"). Workflowet mekaniserar allt fram TILL
// den gränsen: bekräftar taggen live på den kanoniska domänen och lämnar det
// exakta kommandot. gsc-setup.mjs bär själv vaktarna (TESTKLIENT/.vercel.app/kanonisk).
phase('GSC')
const gsc = await agent(
  `GSC-preflight för ${domain} (repo ${clientDir}). GÖR INGEN GSC-skrivning — read-only.\n` +
  `1. Bekräfta FÖRST att token-steget körts: finns ${clientDir}/src/content/verification.ts (eller content/verification.ts)? verificationFileFound=false om filen SAKNAS — då är diagnosen "kör token-steget först", INTE "deploya om". Skilj de två.\n` +
  `2. Om filen finns: hämta produktions-HTML för https://${domain}/ och bekräfta att META-verifieringstaggen (name="google-site-verification", värdet ur verification.ts) faktiskt syns. tagLive=false om filen finns men taggen inte syns → deploya om.\n` +
  `3. Sätt command till EXAKT: node ~/.claude/scripts/gsc-setup.mjs verify ${domain} — UTAN flaggor. (--skip-if-not-ready hör ENDAST till deploy-hooks; framför en operatör vore en tyst överhoppning motsatsen till vad flaggan är till för.)\n` +
  `4. envNeeded: GOOGLE_APPLICATION_CREDENTIALS, GSC_HUMAN_OWNER, GSC_CLIENT_OWNER (kundens Google-adress ur business.ts; saknas den varnar skriptet men avbryter inte).\n` +
  `Kör INTE kommandot. Returnera det för operatören.`,
  { label: 'cutover:gsc-preflight', phase: 'GSC', schema: GSC }
)

if (!gsc.verificationFileFound) {
  log('⛔ verification.ts saknas i klientrepot — token-steget kördes aldrig. Kör `gsc-setup.mjs token <domän> <repo>`, rendera taggen, deploya, kör sedan cutover igen. Detta är INTE ett deploy-problem.')
  return { status: 'AVBRUTEN', reason: 'verification.ts saknas (token-steget ej kört)', phase: 'GSC' }
}
if (!gsc.tagLive) {
  log('⚠️ verification.ts finns men META-taggen syns inte i produktions-HTML — deploya om innan verify. Kommandot lämnas ändå nedan.')
}
log(`✅ Fas 3 preflight klar. Kör skarpt (operatörens hand, kräver GSC-nyckeln):\n    ${gsc.command}\n    env: ${(gsc.envNeeded || []).join(', ')}`)

return {
  status: 'FAS_1_3_KLAR',
  domain,
  gscVerifyCommand: gsc.command,
  tagLive: gsc.tagLive,
  note: 'Fas 4–7 (Bing/IndexNow, uppetid, GBP, citations) körs manuellt ur gsc-launch-steps.md — se kommentaren överst i workflowet.',
}
