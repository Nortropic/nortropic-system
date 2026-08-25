export const meta = {
  name: 'nortropic-autobygg',
  description: 'Obemannat kund-flöde (v17): orkestrerar plan→init→innehåll→granskning→grind-torrkörning för en research.md märkt "Läge: obemannat", med villkorade stopp (bemannat / ohanterad-scope-nej-juridik-eller-STRATEGISK / CRITICAL-efter-en-fixloop / brutet fixkontrakt i fasgränscommit eller fixcommit — BATCH-005) som lämnar över till människa. Deployar ALDRIG — nod 8 (juridik-signoff) och nod 9 (/vercel:deploy) förblir mänskliga.',
  whenToUse: 'Kör manuellt när en research.md bär raden "Läge: obemannat" och ägaren vill att systemet bygger sajten utan mänskligt nod-3-stopp — fram till FINAL-TOUCHES + grind-torrkörning. Faller ALLTID tillbaka till mänskligt stopp vid ohanterad/scope-nej juridikflagga, kvarstående STRATEGISK öppen fråga, CRITICAL efter EN fixloop, eller brutet fixkontrakt (BATCH-005: agentdeklaration ≠ delta-snapshot). Bemannat (default, ingen Läge-rad) => kör /nortropic-plan manuellt i stället.',
  phases: [
    { title: 'Plan',                    detail: 'project-planner → PROJECT-BRIEF.md + maskinläsbart plan-utfall (schema)' },
    { title: 'Villkorat stopp (plan)',  detail: 'bemannat, ohanterad/scope-nej juridik eller STRATEGISK fråga => överlämna (inget byggt)' },
    { title: 'Init',                    detail: 'stack-builder skapar privat repo + Vercel-preview' },
    { title: 'Del-C static-first',      detail: 'Ring-1 stateless bekräftas; stateful/Ring 2-3-behov => överlämna (docs/06)' },
    { title: 'Content',                 detail: 'content-designer fyller TODO-COPY + Humanisera; TODO-FACT lämnas; F1-fasgränscommit (fixkontraktet)' },
    { title: 'Review',                  detail: 'full review → EN fixloop (fixkontrakt: deklaration → unionscommit) → diff-review → CRITICAL-parse' },
    { title: 'Villkorat stopp (review)',detail: 'CRITICAL kvar efter EN fixloop => överlämna med FINAL-TOUCHES' },
    { title: 'Grind-torrkörning',       detail: '8 linser read-only, INGEN deploy, INGEN fix-loop, INGEN handover' },
    { title: 'Avslut',                  detail: 'FINAL-TOUCHES + AUTOBYGG-LOG + slutstatusrad' },
  ],
}

/* ─────────── LOAD-BEARING PURE FUNCTIONS (isolerat testbara, inga globals, före allt await) ─────────── */

function obemannatGate(lage) {
  if (lage !== 'obemannat')
    return { stop: true, reason: `Läge=${lage || 'bemannat'} — obemannat ej begärt; briefen är klar, stoppar vid nod 3 (briefgodkännande) enligt dagens bemannade flöde` }
  return { stop: false }
}

function shouldStopAfterPlan(plan) {
  if (!plan) return { stop: true, reason: 'plan-steget returnerade inget utfall' }
  if (plan.inputGatePassed === false)
    return { stop: true, reason: `INPUT GATE: research saknar ${(plan.missingFields || []).join(', ') || 'obligatoriska fält'}` }
  const ohanterad = (plan.juridikflaggor || []).filter(f => f && f.status === 'ohanterad')
  if (ohanterad.length)   // hälsa/kropp/medicin m.fl. har registerstatus 'ohanterad' → fångas här
    return { stop: true, reason: `ohanterad juridikflagga (${ohanterad.map(f => f.flagga).join(', ')}) — beslut vid nod 3: bygg modulen som eget arbete eller tacka nej` }
  const scopeNej = (plan.juridikflaggor || []).filter(f => f && f.status === 'scope-nej')
  if (plan.scopeNej || scopeNej.length)
    return { stop: true, reason: `scope-nej-flagga (${scopeNej.map(f => f.flagga).join(', ') || 'scope-nej'}) — briefen rekommenderar hänvisning (docs/06 Ring 3)` }
  const strat = (plan.openQuestions || []).filter(q => q && q.kind === 'STRATEGISK')
  if (strat.length)
    return { stop: true, reason: `STRATEGISK öppen fråga kvarstår: ${strat.map(q => q.text).join(' | ')}` }
  return { stop: false }   // enbart FAKTA/BESLUT-frågor kvar → fortsätt (de skjuts till FINAL-TOUCHES)
}

function shouldStopAfterReview(criticalCount) {
  if ((criticalCount || 0) > 0)
    return { stop: true, reason: `${criticalCount} CRITICAL kvarstår efter EN autonom fixloop — obemannat stannar och lämnar över till människa` }
  return { stop: false }
}

function scopeStr(dir) {
  return `the Nortropic site in the git repository at ${dir} — treat ${dir} as the project root: cd into it before every git/file command, review only files under it, and write any report file there`
}

/* ─────────── SCHEMAS ─────────── */

const PLAN_OUTCOME = {
  type: 'object',
  required: ['briefPath', 'lage', 'inputGatePassed', 'juridikflaggor', 'scopeNej', 'openQuestions'],
  properties: {
    briefPath:        { type: 'string' },
    repoNameSuggested:{ type: 'string' },
    lage:             { type: 'string', enum: ['obemannat', 'bemannat'] },
    klienttyp:        { type: 'string', enum: ['SKARP', 'TESTKLIENT'] },
    inputGatePassed:  { type: 'boolean' },
    missingFields:    { type: 'array', items: { type: 'string' } },
    juridikflaggor:   { type: 'array', items: { type: 'object', required: ['flagga', 'status'],
                          properties: { flagga: { type: 'string' },
                            status: { type: 'string', enum: ['hanterad', 'ohanterad', 'scope-nej'] } } } },
    scopeNej:         { type: 'boolean' },
    openQuestions:    { type: 'array', items: { type: 'object', required: ['text', 'kind'],
                          properties: { text: { type: 'string' },
                            kind: { type: 'string', enum: ['STRATEGISK', 'FAKTA', 'BESLUT'] } } } },
  },
}

const INIT_OUTCOME = {
  type: 'object', required: ['repoDir', 'buildPassed'],
  properties: {
    repoDir: { type: 'string', description: 'ABSOLUTE path to the cloned build repo' },
    repoUrl: { type: 'string' }, previewUrl: { type: 'string' },
    buildPassed: { type: 'boolean' },
    envPending: { type: 'array', items: { type: 'string' } },
    todoFacts:  { type: 'array', items: { type: 'string', description: 'file:line' } },
  },
}

const STATICGUARD = {
  type: 'object', required: ['stateful', 'evidence'],
  properties: { stateful: { type: 'boolean' },
    evidence: { type: 'array', items: { type: 'string' } }, note: { type: 'string' } },
}

const REVIEW_TRIAGE = {
  type: 'object', required: ['criticalCount', 'criticals'],
  properties: {
    criticalCount: { type: 'number' },
    criticals: { type: 'array', items: { type: 'object', required: ['title', 'location', 'fixAgent'],
      properties: { title: { type: 'string' }, location: { type: 'string' },
        fixAgent: { type: 'string', enum: ['stack-builder', 'seo-optimizer', 'content-designer'] } } } },
    highs: { type: 'array', items: { type: 'object', required: ['title', 'location', 'fixAgent'],
      properties: { title: { type: 'string' }, location: { type: 'string' },
        fixAgent: { type: 'string', enum: ['stack-builder', 'seo-optimizer', 'content-designer'] } } } },
  },
}

const GATE = {
  type: 'object', required: ['status', 'findings'],
  properties: { status: { type: 'string', enum: ['PASS', 'FAIL'] },
    findings: { type: 'array', items: { type: 'object',
      required: ['severity', 'title', 'location', 'why', 'fix', 'category'],
      properties: { severity: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM'] },
        title: { type: 'string' }, location: { type: 'string' }, why: { type: 'string' }, fix: { type: 'string' },
        category: { type: 'string', enum: ['technical','leadgen','visual','trust','seo','security','legal','journeys'] } } } } },
}

// ─────────── BATCH-005-fixkontrakt (DEL 2, autobygg): returkontrakt för ändrade filer ───────────
// Samma kontrakt som launch (DEL 1): agenter deklarerar sin ändrade-fil-lista per schema, ett
// MEKANISKT commit-steg committar EXAKT snittet declared ∩ efter-snapshot — aldrig svepande staging.
// Autobygg-specifikt: (1) F1 — Content-fasen får en FASGRÄNSCOMMIT med samma kontrakt (täcker en
// tidigare OTÄCKT yta: content-rester förblev ocommittade ända till överlämning vid REN review —
// hålet doldes av den gamla svepande fix-stageningen); (2) U — fixloopens tre sekventiella agenter
// deklarerar var för sig men committas som EN union (attribution är LOGGDATA i AUTOBYGG-LOG, inte
// commit-data); (3) kontraktsbrott → ÖVERLÄMNAD via befintligt maskineri (log + return) — obemannat
// improviserar aldrig; (4) EXAKT EN fixrunda är oförändrad (1-vs-3 mot launch är avsiktligt).
// Kärnan nedan är delad med nortropic-launch.js — DSL-filer kan inte importera varandra, så den är
// MEDVETET duplicerad och hålls byte-identisk; INV-006 hashar båda blocken.
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

/* ─────────── ARGS ─────────── */
// Robust arg-läsning: args kan nå hit som objekt ELLER som JSON-sträng (Workflow-verktygets args-param
// kan serialiseras vid verktygsgränsen) — hantera båda så args.research alltid når fram.
let A = args || {}
if (typeof A === 'string') { try { A = JSON.parse(A) } catch (e) { A = {} } }
// A.research = absolut sökväg till research.md (obligatoriskt); Läge läses av plannern ur research-raden.
const researchPath = A.research || 'research.md in the current working directory'

/* ─────────── helper: AUTOBYGG-LOG (agenten shellar git + date; Date.now() kastar i DSL:en) ─────────── */
async function writeAutobyggLog(buildDir, fields) {
  if (!buildDir) return null
  return agent(
    `Uppdatera AUTOBYGG-LOG.md i ${buildDir}. Kör FÖRST \`cd "${buildDir}" && git rev-parse HEAD\` och \`date +%F\`. ` +
    `Om filen saknas: skapa den och INLED med detta meta-block; om den finns: appenda en ny fas-rad och uppdatera status-raden i meta-blocket:\n` +
    `<!-- nortropic-autobygg-meta\ncommit: <hash>\ndate: <YYYY-MM-DD>\nlage: obemannat\nstatus: ${fields.status}\nstage: ${fields.stage}\n-->\n` +
    `Därefter, i markdown: en fas-för-fas-spårningstabell (tidsstämpel via date, fas, utfall, ev. stopporsak) och slutstatusraden. Rådata (hitta inte på något utöver detta):\n\n` +
    JSON.stringify(fields, null, 2),
    { label: 'autobygg-log', phase: 'Avslut' }
  )
}

/* ═════════════════════════ NODKEDJAN ═════════════════════════ */

phase('Plan')
// Plannern kör sin egen INPUT GATE, läser research-radens Läge (saknas ⇒ bemannat) och returnerar utfallet maskinläsbart.
const plan = await agent(
  `Follow your FULL project-planner process against the research file at ${researchPath}. Write PROJECT-BRIEF.md next to it (all 7 sections). ` +
  `Read the research row \`Läge:\` (missing => bemannat) and write it into §6 next to Klienttyp — never into content/profile.ts. ` +
  `Run your INPUT GATE first; if fields are missing, set inputGatePassed=false + missingFields and do not plan further. ` +
  `Klassa VARJE öppen fråga STRATEGISK/FAKTA/BESLUT per your Rules; a ohanterad/scope-nej juridikflagga is ALWAYS STRATEGISK. ` +
  `Return the machine-readable outcome per the schema.`,
  { label: 'plan', phase: 'Plan', agentType: 'project-planner', schema: PLAN_OUTCOME }
)

phase('Villkorat stopp (plan)')
const modeStop = obemannatGate(plan && plan.lage)
const planStop = modeStop.stop ? modeStop : shouldStopAfterPlan(plan)
if (planStop.stop) {
  log(`ÖVERLÄMNAD vid plan: ${planStop.reason}`)
  // Inget repo skapat ännu — rent stopp; ingen AUTOBYGG-LOG (byggrepot finns inte).
  return { status: 'ÖVERLÄMNAD', stage: 'plan', reason: planStop.reason,
    briefPath: plan && plan.briefPath, openQuestions: (plan && plan.openQuestions) || [], buildDir: null, gates: [] }
}

phase('Init')
const init = await agent(
  `Execute your FULL nortropic-init/stack-builder build from the approved brief at ${plan.briefPath}. ` +
  `VERIFY you are already inside a cloned PRIVATE kund-<slug> repo (the Verkstadsgolvet onboarding created it with research.md): cwd is a git repo with a remote, the remote name matches kund-<slug>, gh repo view visibility is PRIVATE, and research.md exists. If any check fails, STOP with a precise error naming the failed check and telling the operator to run the Verkstadsgolvet onboarding first — the build NEVER creates the customer repo and never appends -se. Then scaffold Next.js 15 + TS strict + Tailwind 4 + shadcn/ui, ` +
  `write content/ (incl. business.ts + profile.ts from §7), all pages, app/actions/lead.ts, schema, sitemap/robots, Swedish 404/error, vercel link + deploy a preview. ` +
  `Return per schema: repoDir (ABSOLUTE path to the clone), repoUrl, previewUrl, buildPassed, envPending, todoFacts (file:line).`,
  { label: 'init', phase: 'Init', agentType: 'stack-builder', schema: INIT_OUTCOME }
)
const buildDir = init.repoDir
const previewUrl = init.previewUrl || null
const kontraktPlats = `the Nortropic site at ${buildDir} — cd into it first`
let contentCommit = null   // { files, byAgent } för F1-fasgränscommiten (loggdata → AUTOBYGG-LOG)
let fixCommit = null       // { files, byAgent } för fixrundans unionscommit (loggdata → AUTOBYGG-LOG)

// BATCH-005 DEL 2: kontraktsbrott → ÖVERLÄMNAD via exakt samma maskineri som övriga stopp
// (AUTOBYGG-LOG + return) — aldrig svepande fallback, aldrig improvisation i obemannat läge.
async function overlamnadKontrakt(stage, reason) {
  log(`FIXKONTRAKT BRUTET (${stage}): ${reason} — obemannat lämnar över till människa.`)
  await writeAutobyggLog(buildDir, { status: 'ÖVERLÄMNAD', stage, reason, contentCommit, fixCommit, previewUrl })
  return { status: 'ÖVERLÄMNAD', stage, reason, buildDir, previewUrl, contentCommit, fixCommit, gates: [] }
}

// BATCH-005 DEL 2 (U): den mekaniska kontraktsrundan EFTER att agenterna kört — prövar deklarationen
// mot delta-snapshoten i REN JS (kärnan ovan) och committar EXAKT snittet declared ∩ post via ett
// generiskt mekaniskt commit-steg, följt av efterkontroll av commit-UTFALLET (git show --name-only)
// så sista ledet aldrig vilar på prosa. Returnerar { ok: true, stageSet, byAgent } eller
// { ok: false, reason } — stoppbeslutet fattas av anroparen (overlamnadKontrakt).
async function kontraktsCommit(dslPhase, commitMsg, agentReturns, preSnap) {
  const dead = agentReturns.filter(x => !x.result)
  if (dead.length) return { ok: false, reason: `${dead.map(x => x.agent).join(', ')} returnerade ingen fillista — blockerat; aldrig svepande staging (-A/-u) som fallback (felmod 4)` }
  const declared = [...new Set(agentReturns.flatMap(x => (x.result.files || []).map(normPath)))].filter(f => !CONTRACT_EXEMPT(f))
  const bad = badRepoPaths(declared)
  if (bad.length) return { ok: false, reason: `sökväg utanför byggkatalogen/ogiltig: ${bad.join(', ')} (felmod 3)` }
  const postSnap = await agent(porcelainPrompt(`after ${dslPhase}`, kontraktPlats), { label: `snapshot:post:${dslPhase.toLowerCase()}`, phase: dslPhase, schema: FILELIST })
  if (!postSnap) return { ok: false, reason: 'efter-snapshoten kunde inte tas — deltat är odömbart' }
  if (!validHead(postSnap.head)) return { ok: false, reason: `efter-snapshoten saknar giltig HEAD-hash — odömbart${postSnap.note ? ` (note: ${postSnap.note})` : ''}` }
  if (preSnap.head.trim() !== postSnap.head.trim()) return { ok: false, reason: `HEAD flyttades under ${dslPhase} (${preSnap.head.trim().slice(0, 8)} → ${postSnap.head.trim().slice(0, 8)}) — en agent committade själv; endast det mekaniska commit-steget får committa` }
  const preFiles = (preSnap.files || []).filter(f => !CONTRACT_EXEMPT(f))
  const postFiles = (postSnap.files || []).filter(f => !CONTRACT_EXEMPT(f))
  if (declared.length && !postFiles.length) return { ok: false, reason: 'deklarationen är icke-tom men efter-snapshoten tom — motsägelse, odömbart (aldrig tyst överhoppad commit)' }
  const delta = fixDelta(preFiles, postFiles, declared)
  if (delta.foreign.length) return { ok: false, reason: `deklarerade filer var redan smutsiga FÖRE fasen (commit skulle smuggla in främmande ändringar): ${delta.foreign.join(', ')} (felmod 2b)` }
  if (delta.undeclared.length) return { ok: false, reason: `ändrade men EJ deklarerade filer: ${delta.undeclared.join(', ')} — partiell commit återinför rorjour-buggen för exakt dem (felmod 1)` }
  if (delta.cleanDeclared.length) log(`WARN (felmod 2a, ${dslPhase}): deklarerade men aldrig ändrade — utesluts ur stageningen (endast delta-verifierade filer når git): ${delta.cleanDeclared.join(', ')}`)
  const postSet = new Set(postFiles.map(normPath))
  const stageSet = declared.filter(f => postSet.has(f))
  const byAgent = agentReturns.map(x => ({ agent: x.agent, files: (x.result.files || []).map(normPath), note: x.result.note || null }))
  if (!stageSet.length) { log(`${dslPhase}: inga delta-verifierade filer att committa — commit-steget hoppas över.`); return { ok: true, stageSet: [], byAgent } }
  const pathArgs = stageSet.map(f => `"${f}"`).join(' ')
  const rel = await agent(
    `Mechanical commit step in the project root of ${kontraktPlats} — do NOT change any code. Stage EXACTLY this known set and nothing else by running exactly: git --literal-pathspecs add -- ${pathArgs} — then commit ONLY that same set by running exactly: git --literal-pathspecs commit -m "${commitMsg}" -- ${pathArgs} — the pathspec'd commit is deliberate (it keeps any previously staged unrelated content OUT of this commit) and --literal-pathspecs is deliberate (paths like app/[stad]/page.tsx are literal file names, never glob patterns). NEVER stage sweepingly (no "-A", no "-u", no "git add ."), never add any path outside the list. If a git step fails: do NOT improvise and do NOT widen the staging — stop and report the error verbatim.`,
    { label: `commit:${dslPhase.toLowerCase()}`, phase: dslPhase }
  )
  if (!rel) return { ok: false, reason: 'commit-steget returnerade ingenting — utfallet är odömbart' }
  // Par-regeln: inspektionsprompten nedan är flödesspecifik (utanför INV-006-kärnan) och ändras
  // alltid i PAR med launch.js:s motsvarighet. diff.renames=false är bärande: gits default kollapsar
  // en rename till ENBART nya sökvägen medan stageade mängden bär BÅDA → falsk mängddivergens på en
  // korrekt commit (adversariell granskning DEL 2, empiriskt belagd).
  const commitSnap = await agent(
    `Mechanical commit inspection in the project root of ${kontraktPlats}. Run exactly: git -c core.quotepath=off -c diff.renames=false show --name-only --format= HEAD — diff.renames=false is deliberate: a rename must list BOTH paths, matching the staged set. Return every path listed as BARE repo-relative paths (strip any surrounding double quotes). Also run exactly: git rev-parse HEAD — return the full 40-character hash as head. Do not filter or judge — report mechanically. If a command fails, return files: [] and say exactly why in note.`,
    { label: `commitset:${dslPhase.toLowerCase()}`, phase: dslPhase, schema: FILELIST }
  )
  if (!commitSnap) return { ok: false, reason: 'commit-inspektionen kunde inte tas — utfallet är odömbart' }
  if (!validHead(commitSnap.head)) return { ok: false, reason: `commit-inspektionen saknar giltig HEAD-hash — odömbart${commitSnap.note ? ` (note: ${commitSnap.note})` : ''}` }
  if (commitSnap.head.trim() === postSnap.head.trim()) return { ok: false, reason: 'ny commit saknas — HEAD står kvar; commit-steget fallerade (ingenting att reverta, arbetet står ocommittat)' }
  const committed = new Set((commitSnap.files || []).map(normPath))
  if (committed.size !== stageSet.length || !stageSet.every(f => committed.has(f)))
    return { ok: false, reason: `committad mängd ≠ stagead känd mängd (committat: ${[...committed].join(', ') || 'inget'}; förväntat: ${stageSet.join(', ')}) — committen finns redan; mänsklig granskning/revert krävs` }
  return { ok: true, stageSet, byAgent }
}

phase('Del-C static-first')  // docs/06 Ring 3-guard — obemannat får aldrig tyst bygga stateful/Railway-klass infra
const guard = await agent(
  `Mechanical static-first guard in ${buildDir}. cd there. Confirm the scaffold is Ring-1 stateless per docs/06-scope: the ONLY server code is app/actions/lead.ts; NO database client (prisma/drizzle/pg/mongoose), NO auth, NO railway/render config, NO stateful booking built in-repo (external booking via link/embed is OK). ` +
  `Also flag if the approved brief §6 states an UNMET Del-C/Railway/cutover prerequisite. grep the repo. Return stateful=true with evidence if anything stateful slipped in or a Del-C prerequisite is unmet; else stateful=false.`,
  { label: 'del-c', phase: 'Del-C static-first', schema: STATICGUARD }
)
if (guard.stateful) {
  const reason = `Ring 2/3-behov (stateful eller ouppfyllt Del-C/Railway-krav): ${(guard.evidence || []).join('; ')} — obemannat överlämnar (offereras som eget arbete, docs/06 Ring 3)`
  await writeAutobyggLog(buildDir, { status: 'ÖVERLÄMNAD', stage: 'del-c', reason, previewUrl })
  return { status: 'ÖVERLÄMNAD', stage: 'del-c', reason, buildDir, previewUrl, gates: [] }
}

phase('Content')
// BATCH-005 DEL 2 (F1): fasgränscommit — content-designern deklarerar, ett mekaniskt steg committar.
// Täcker den tidigare OTÄCKTA ytan: vid REN review förblev content-arbetet ocommittat ända till
// överlämning (hålet doldes av den gamla svepande fix-stageningen).
const preContent = await agent(porcelainPrompt('before the content phase', kontraktPlats), { label: 'snapshot:pre:content', phase: 'Content', schema: FILELIST })
if (!preContent) return await overlamnadKontrakt('content', 'före-snapshoten kunde inte tas — deltat är odömbart')
if (!validHead(preContent.head)) return await overlamnadKontrakt('content', `före-snapshoten saknar giltig HEAD-hash — odömbart${preContent.note ? ` (note: ${preContent.note})` : ''}`)
const contentRet = await agent(
  `Fill every TODO-COPY in the Nortropic site at ${buildDir} in Swedish per the brief §7 voice register, then run the mandatory content-humanizer pass. cd into ${buildDir}. ` +
  `Facts ONLY from content/business.ts + content/profile.ts; anything unknown stays a TODO-FACT (never invented; keep the marker inside FAQ answers so FaqSchema drops them). ` +
  `Do NOT commit and do NOT stage anything — a mechanical commit step commits a known set. Return per schema the complete list of repo-relative paths of every file you created, modified or deleted, INCLUDING every file written by scripts or tools you invoke (the nortropic-bild fetch script writes under public/images/raw and public/images/ref plus BILDRAPPORT.json; SLOTS.json; fotouppdrag-klient.md if written) — report the list mechanically, do not filter or judge it; put a compact version of your normal report (facts still missing, fotouppdrag ja/nej) in the note field.`,
  { label: 'content', phase: 'Content', agentType: 'content-designer', schema: FILELIST }
)
const cRes = await kontraktsCommit('Content', 'content: TODO-COPY fyllda + humaniserade (autobygg F1-fasgränscommit)', [{ agent: 'content-designer', result: contentRet }], preContent)
if (!cRes.ok) return await overlamnadKontrakt('content', cRes.reason)
contentCommit = { files: cRes.stageSet, byAgent: cRes.byAgent }

phase('Review')
const scope = scopeStr(buildDir)
const triagePrompt = report =>
  `Read this Nortropic review report and extract ONLY the CRITICAL findings (and HIGH separately). Route each to a fixAgent: seo→seo-optimizer, copy→content-designer, everything else→stack-builder. Return criticalCount + criticals[] + highs[]. Report:\n\n${report}`

const full = await workflow('nortropic-review', { scope })   // FULL review (freshness-krav: färsk full rapport på current commit)
let triage = await agent(triagePrompt(full.report), { label: 'triage:full', phase: 'Review', schema: REVIEW_TRIAGE })

if ((triage.criticalCount || 0) > 0 || (triage.highs || []).length) {
  // EXAKT EN autonom fixloop (launch.js kör upp till 3): obemannat saknar mänsklig övervakning under körningen och lämnar därför MEDVETET över efter en runda. Routad som launch.js D1, sekventiell så två agenter aldrig skriver samtidigt. 1-vs-3 är avsiktligt — höj aldrig till 3 för att "matcha" launch.
  // BATCH-005 DEL 2 (textuppdatering, INTE semantik — rundantalet är oförändrat): fixagenterna
  // committar inte längre själva; de deklarerar ändrade filer (FIXKONTRAKT-KÄRNAN) och ETT mekaniskt
  // commit-steg committar unionen (U). Kontraktsbrott → ÖVERLÄMNAD, aldrig svepande fallback.
  const fixes = [...(triage.criticals || []), ...(triage.highs || [])]
  const preFix = await agent(porcelainPrompt('before the fix round', kontraktPlats), { label: 'snapshot:pre:fix', phase: 'Review', schema: FILELIST })
  if (!preFix) return await overlamnadKontrakt('fixkontrakt', 'före-snapshoten kunde inte tas — deltat är odömbart')
  if (!validHead(preFix.head)) return await overlamnadKontrakt('fixkontrakt', `före-snapshoten saknar giltig HEAD-hash — odömbart${preFix.note ? ` (note: ${preFix.note})` : ''}`)
  const fixReturns = []
  for (const ag of ['stack-builder', 'seo-optimizer', 'content-designer']) {
    const mine = fixes.filter(f => f.fixAgent === ag)
    if (!mine.length) continue
    const r = await agent(
      `Fix mode in ${buildDir} (cd there). Fix ONLY these verified findings, minimally, then run pnpm build to zero errors. Do NOT commit and do NOT stage anything — a mechanical commit step commits a known set. Return per schema the complete list of repo-relative paths of every file you created, modified or deleted (including package.json and pnpm-lock.yaml if you install or upgrade anything) — report the list mechanically, do not filter or judge it. Findings: ${JSON.stringify(mine)}`,
      { label: `fix:${ag}`, phase: 'Review', agentType: ag, schema: FILELIST }
    )
    fixReturns.push({ agent: ag, result: r })
  }
  const fRes = await kontraktsCommit('Review', 'fix: åtgärdar granskningsfynd (autobygg, EN autonom fixrunda)', fixReturns, preFix)
  if (!fRes.ok) return await overlamnadKontrakt('fixkontrakt', fRes.reason)
  fixCommit = { files: fRes.stageSet, byAgent: fRes.byAgent }
  const diff = await workflow('nortropic-review', { scope, diff: true })  // omkontroll av endast ändrade filer
  triage = await agent(triagePrompt(diff.report), { label: 'triage:diff', phase: 'Review', schema: REVIEW_TRIAGE })
}

phase('Villkorat stopp (review)')
const reviewStop = shouldStopAfterReview(triage.criticalCount || 0)
if (reviewStop.stop) {
  await workflow('nortropic-final-touches', { clientDir: buildDir, openQuestions: plan.openQuestions })
  await writeAutobyggLog(buildDir, { status: 'ÖVERLÄMNAD', stage: 'review', reason: reviewStop.reason,
    criticals: triage.criticals, contentCommit, fixCommit, previewUrl })
  return { status: 'ÖVERLÄMNAD', stage: 'review', reason: reviewStop.reason, buildDir, previewUrl,
    criticals: triage.criticals, contentCommit, fixCommit, gates: [] }
}

phase('Grind-torrkörning')  // reproducerar launch.js:s 8 linser (S5: journeys tillagd) READ-ONLY: ingen deploy, ingen fix-loop, ingen handover
const GATE_LENSES = [
  { key: 'technical', agentType: 'qa-launcher',     lens: 'Gates 0/2/3/4 (build, Lighthouse, responsive+SSL+links, a11y)' },
  { key: 'leadgen',   agentType: 'qa-launcher',     lens: 'Gate 1 primärhandlingsgrinden — läs content/profile.ts FÖRST; SAKNAS => FAIL' },
  { key: 'seo',       agentType: 'seo-optimizer',   lens: 'audit mode + launch readiness (sitemap/robots/canonicals/schema/NAP mot business.ts)' },
  { key: 'journeys',  agentType: 'qa-launcher',     lens: 'S5-reselins: läs obligatoriskaResor + toppuppgifter i content/profile.ts och pröva VARJE kontrakterad resa end-to-end (375px + desktop, riktig interaktion). Saknas obligatoriskaResor (v1-profil) = PASS med en MEDIUM-rad (SAKNAS_I_V1), aldrig FAIL. Dubbelrapportera inte primärhandlingen — den ägs av leadgen-linsen. Category: journeys' },
  { key: 'visual',    agentType: 'design-reviewer', lens: 'anti-slop visuell QA som launch-grind' },
  { key: 'trust',     agentType: 'design-reviewer', lens: 'trust: kvitton per profile.ts, omdömen/betyg/NAP mot content' },
  { key: 'security',  agentType: 'qa-launcher',     lens: 'Gate 7 (npm audit, servade headers via curl, formulärmissbruk, hemligheter)' },
  { key: 'legal',     agentType: 'qa-launcher',     lens: 'Gate 6 svensk/EU-juridik — OBSERVE AND REPORT ONLY, läs §7-juridikflaggor' },
]
const gateArr = await parallel(GATE_LENSES.map(g => () =>
  agent(
    `${g.lens}. Run against the Nortropic site at ${buildDir}${previewUrl ? ` (preview: ${previewUrl})` : ''}. cd into ${buildDir}. ` +
    `This is a READ-ONLY GRIND-TORRKÖRNING inside /nortropic-autobygg — DO NOT fix, DO NOT deploy, DO NOT write a handover. Report PASS/FAIL + findings (category ${g.key}). ` +
    `Gate definitions come from your prelaunch skill (skills/nortropic-prelaunch) — use them as-is.`,
    { label: `gate:${g.key}`, phase: 'Grind-torrkörning', agentType: g.agentType, schema: GATE }
  )
))
const gates = Object.fromEntries(GATE_LENSES.map((g, i) => [g.key, gateArr[i] || { status: 'FAIL', findings: [] }]))
const legalFindings = (gates.legal && gates.legal.findings) || []

phase('Avslut')
await workflow('nortropic-final-touches', { clientDir: buildDir, legalFindings, openQuestions: plan.openQuestions })
const gateRows = GATE_LENSES.map(g => ({ gate: g.key,
  status: g.key === 'legal' ? '⚠️ HUMAN SIGN-OFF' : (gates[g.key].status === 'PASS' ? '✅' : '❌'),
  findings: (gates[g.key].findings || []).length }))
await writeAutobyggLog(buildDir, { status: 'BYGGD-OBEMANNAD', stage: 'complete', gateRows, previewUrl,
  contentCommit, fixCommit,
  deferredQuestions: (plan.openQuestions || []).filter(q => q.kind !== 'STRATEGISK') })

log(`Preview klar: ${previewUrl || '(ingen preview-url returnerad)'}. FINAL-TOUCHES.md väntar. Deploy sker aldrig obemannat.`)
return {
  status: 'BYGGD-OBEMANNAD — väntar på människa: FINAL-TOUCHES (fakta, beslut, juridik-signoff nod 8), sedan /nortropic-launch + /vercel:deploy (nod 9)',
  buildDir, previewUrl, gates: gateRows, legalFindings, contentCommit, fixCommit,
}
