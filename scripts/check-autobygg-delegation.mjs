#!/usr/bin/env node
// S10: obemannat-flödets delegationssemantik — OWNER ATTENTION ≠ OWNER APPROVAL.
//
// Detta är ett BETEENDEPROV, inte en prosakontroll. Beslutsfunktionerna extraheras ur
// den SKEPPADE källan (`workflows/nortropic-autobygg.js`) och körs mot riktiga
// plan-utfall. Skälet är hårt vunnet: en kontroll som prövar en KOPIA av logiken
// bevisar bara att kopian stämmer med sig själv.
//
// Workflowfilen kan inte importeras — den kör orkestreringskod på toppnivå. Därför
// klipps det rena funktionsblocket ut mellan sina två markörer och utvärderas isolerat.
// Flyttas eller döps markörerna om blir körningen ODÖMBAR, aldrig tyst grön.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

console.log('VAKT: check-autobygg-delegation.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig

let ROT
try {
  ROT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
} catch {
  console.error('ODÖMBART: ingen git-topp — körning utanför repo vägras')
  process.exit(2)
}
const KALLA = 'workflows/nortropic-autobygg.js'
const filvag = join(ROT, KALLA)
if (!existsSync(filvag)) { console.error(`ODÖMBART: ${KALLA} saknas`); process.exit(2) }
const src = readFileSync(filvag, 'utf8')

const START = '/* ─────────── LOAD-BEARING PURE FUNCTIONS'
const SLUT  = '/* ─────────── SCHEMAS'
const i = src.indexOf(START), j = src.indexOf(SLUT)
if (i < 0 || j < 0 || j <= i) {
  console.error(`ODÖMBART: kunde inte avgränsa det rena funktionsblocket i ${KALLA} — markörerna saknas eller är omkastade`)
  process.exit(2)
}
const block = src.slice(i, j)

let M
try {
  M = new Function(`${block}\nreturn { beslutEfterPlan, shouldStopAfterPlan, shouldStopAfterReview, obemannatGate, attentionEvent, INTERVENTION, CONTINUE, ATTENTION_CONTINUE, ROUTE, HARD_STOP }`)()
} catch (e) {
  console.error(`ODÖMBART: funktionsblocket kunde inte utvärderas isolerat — ${e.message}`)
  process.exit(2)
}
for (const n of ['beslutEfterPlan', 'shouldStopAfterReview', 'obemannatGate', 'CONTINUE', 'ATTENTION_CONTINUE', 'ROUTE', 'HARD_STOP']) {
  if (M[n] === undefined) { console.error(`ODÖMBART: ${n} saknas i det extraherade blocket`); process.exit(2) }
}
const { beslutEfterPlan, shouldStopAfterReview, obemannatGate, CONTINUE, ATTENTION_CONTINUE, ROUTE, HARD_STOP } = M

// Balanserad klammermatchning: fältnärvaro-regexar med längdfönster missar långa kroppar
// och kan dessutom ge tom träffmängd. Blocken plockas därför ut exakt.
function balansera(text, start) {
  if (text[start] !== '{') return null
  // STRÄNG- OCH KOMMENTARSMEDVETEN. Den naiva versionen räknade klamrar inuti strängar
  // och kommentarer, så ett `_n: '}'` eller ett `// }` TRUNKERADE blocket och dolde allt
  // efter — vilket gjorde både nyckelutvinningen och räkningen opålitlig.
  let djup = 0
  for (let k = start; k < text.length; k++) {
    const c = text[k]
    if (c === '/' && text[k + 1] === '/') { k = text.indexOf('\n', k); if (k < 0) return null; continue }
    if (c === '/' && text[k + 1] === '*') { k = text.indexOf('*/', k + 2); if (k < 0) return null; k++; continue }
    if (c === "'" || c === '"' || c === '`') {
      const q = c
      for (k++; k < text.length; k++) {
        if (text[k] === '\\') { k++; continue }
        if (text[k] === q) break
      }
      continue
    }
    if (c === '{') djup++
    else if (c === '}') { djup--; if (djup === 0) return text.slice(start, k + 1) }
  }
  return null
}
// Toppnivånycklar i ett objektliteral, i ordning (duplikat behålls).
function toppnycklar(block) {
  const ut = []
  for (const m of block.matchAll(/[{,]\s*\[\s*['"`]([^'"`]+)['"`]\s*\]\s*:/g)) ut.push(m[1])
  // SAMMA STRÄNG-/KOMMENTARSMEDVETENHET SOM `balansera`. Att härda den ena men inte den
  // andra lämnade hålet öppet: `_n: '}'` och `// }` fick djupräkningen att spåra ur, så
  // nycklarna EFTER dem blev osynliga medan blocket i sig var korrekt utplockat.
  let djup = 0
  for (let k = 0; k < block.length; k++) {
    const c = block[k]
    if (c === '/' && block[k + 1] === '/') { const n = block.indexOf('\n', k); if (n < 0) break; k = n; continue }
    if (c === '/' && block[k + 1] === '*') { const n = block.indexOf('*/', k + 2); if (n < 0) break; k = n + 1; continue }
    if (c === "'" || c === '"' || c === '`') {
      // En CITERAD NYCKEL måste prövas före strängöverhoppningen — annars äter
      // överhoppningen `'status':` och nyckeln blir osynlig igen.
      const qm = djup === 1 && (k === 0 || /[{,\s]/.test(block[k - 1]))
        ? /^['"]([^'"]+)['"]\s*:/.exec(block.slice(k)) : null
      if (qm) { ut.push(qm[1]); k += qm[0].length - 1; continue }
      const q = c
      for (k++; k < block.length; k++) { if (block[k] === '\\') { k++; continue } if (block[k] === q) break }
      continue
    }
    // Spread av ett objektliteral på toppnivå bär SINA nycklar på toppnivå vid körning.
    if (djup === 1 && c === '.' && block.slice(k, k + 3) === '...') {
      if (/^\.\.\.\s*\{/.test(block.slice(k))) {
        const b2 = block.indexOf('{', k)
        const inre = balansera(block, b2)
        if (inre) { ut.push(...toppnycklar(inre)); k = b2 + inre.length - 1; continue }
      }
      // Spread av en VARIABEL går inte att läsa statiskt. Den är i sig en förbikoppling
      // av varje fältnärvarokontroll och markeras därför som en syntetisk kollision.
      ut.push('«spread-av-variabel»', '«spread-av-variabel»')
      continue
    }
    if (c === '{' || c === '[' || c === '(') djup++
    else if (c === '}' || c === ']' || c === ')') djup--
    else if (djup === 1) {
      const bit = block.slice(k)
      // identifierare · citerad nyckel · SHORTHAND (`{ status }`) · getter (`get x()`)
      // Shorthand var en LEVANDE blind fläck i den skeppade källan: `status` — nyckeln
      // som bär hela ROUTAD/ÖVERLÄMNAD-distinktionen — var osynlig för dubblettkontrollen
      // i just den retur som avgör den.
      const m = /^(get|set)\s+([A-Za-zÅÄÖåäö_$][\w$]*)\s*\(/.exec(bit)
        || /^([A-Za-zÅÄÖåäö_$][\w$]*)\s*:/.exec(bit)
        || /^['"]([^'"]+)['"]\s*:/.exec(bit)
        || /^([A-Za-zÅÄÖåäö_$][\w$]*)\s*(?=[,}])/.exec(bit)
      // SHORTHAND-GRENEN FÅR INTE MATCHA ETT VÄRDE. `stop: true,` gav annars nyckeln
      // "true", så två `: true`-VÄRDEN i samma literal rapporterades som duplicerad
      // NYCKEL — ett falskt positivt som legat latent sedan S10 och som slog till först
      // när ett skeppat literal fick två booleska fält. Ett värde föregås av `:`;
      // JS-literalerna är dessutom aldrig shorthand-nycklar.
      // TITTA BAKÅT PÅ KOD, INTE PÅ KOMMENTAR. Första versionen läste rå text, så en
      // radkommentar som SLUTADE med kolon — vilket den här kodbasen gör hela tiden
      // ("Tre utfall, och det tredje är det som gör vändningen säker:") — fick nästa
      // nyckel att se ut som ett värde och försvinna ur mängden. Då tappades ÄKTA
      // dubbletter, inte bara det falska positivet. Kommentarer strippas därför först.
      const foreKod = block.slice(0, k)
        .replace(/\/\*[\s\S]*?\*\//g, ' ')
        .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')
      const foreg = foreKod.replace(/\s+$/, '').slice(-1)
      const arVarde = foreg === ':' || ['true', 'false', 'null', 'undefined'].includes(m && m[1])
      if (m && !arVarde && (k === 0 || /[{,\s]/.test(block[k - 1]))) {
        ut.push(m[2] !== undefined ? m[2] : m[1]); k += m[0].length - 1
      }
    }
  }
  return ut
}

// Samma strippning som workflowsidan använder: rad- och blockkommentarer bort, men
// `https://` skyddas av `[^:]`-vakten.
const utanKodkommentar = (t) => t.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')

const fails = []
const pass = []
const check = (namn, ok, skal) => ok ? pass.push(namn) : fails.push(`${namn} — ${skal}`)

/* ─────────── fixturer: minsta giltiga plan-utfall ─────────── */
const basPlan = (o = {}) => ({
  briefPath: '/x/PROJECT-BRIEF.md', lage: 'obemannat', inputGatePassed: true,
  interventionsbeslut: 'NY SAJT', juridikflaggor: [], scopeNej: false, openQuestions: [], ...o,
})
const fraga = (o = {}) => ({ text: 'riktningsfråga', kind: 'STRATEGISK', ...o })

/* ─────────── DoD 1–15 ─────────── */

// 1. NY SAJT fortsätter
{
  const b = beslutEfterPlan(basPlan())
  check('1 NY SAJT ⇒ CONTINUE', b.decision === CONTINUE, `fick ${b.decision}`)
}

// 2+3. FÖRBÄTTRA BEFINTLIG bygger inte, men kräver inte heller ägargodkännande
for (const utfall of ['FÖRBÄTTRA BEFINTLIG', 'ICKE-SAJT-ÅTGÄRD', 'AVRÅD']) {
  const b = beslutEfterPlan(basPlan({ interventionsbeslut: utfall,
    openQuestions: [fraga({ text: `utfall ${utfall}`, blocking: false })] }))
  const ev = b.attention.find(a => a.decision === utfall)
  check(`2 ${utfall} ⇒ ROUTE (bygger inte ny sajt)`, b.decision === ROUTE, `fick ${b.decision}`)
  check(`3 ${utfall} kräver INTE owner approval`, !!ev && ev.ownerActionRequired === false,
    ev ? `ownerActionRequired=${ev.ownerActionRequired}` : 'attention-event saknas')
  check(`3b ${utfall} lämnar ett nästa rekommenderat steg`, typeof b.nextStep === 'string' && b.nextStep.length > 0,
    'nextStep saknas')
}

// 6. scope-nej routas bort utan att gränsen kringgås
{
  const b = beslutEfterPlan(basPlan({ scopeNej: true,
    juridikflaggor: [{ flagga: 'e-handel', status: 'scope-nej' }] }))
  const ev = b.attention.find(a => a.decision === 'SCOPE_NEJ')
  check('6 scope-nej ⇒ ROUTE utan approval-stopp',
    b.decision === ROUTE && !!ev && ev.ownerActionRequired === false, `fick ${b.decision}`)
  check('6b scope-nej redovisar att gränsen inte kringgicks',
    !!ev && /kringgicks aldrig|aldrig/i.test(ev.actionTaken), 'actionTaken saknar gränsbeviset')
}

// 7. icke-blockerande STRATEGISK ⇒ attention men flödet fortsätter
{
  const b = beslutEfterPlan(basPlan({ openQuestions: [fraga({ blocking: false })] }))
  const ev = b.attention.find(a => a.decision === 'STRATEGISK_ICKE_BLOCKERANDE')
  check('7 icke-blockerande STRATEGISK ⇒ ATTENTION_CONTINUE',
    b.decision === ATTENTION_CONTINUE, `fick ${b.decision}`)
  check('7b och den kräver inget ägarsvar', !!ev && ev.ownerActionRequired === false,
    ev ? `ownerActionRequired=${ev.ownerActionRequired}` : 'event saknas')
}

// 8. explicit blockerande strategisk fråga ⇒ HARD_STOP
{
  const b = beslutEfterPlan(basPlan({ openQuestions: [fraga({ blocking: true, blockingReason: 'kräver nytt mandat' })] }))
  check('8 blockerande STRATEGISK ⇒ HARD_STOP', b.decision === HARD_STOP, `fick ${b.decision}`)
  check('8b med maskinläsbar orsak',
    b.attention.some(a => a.decision === 'MANDAT_SAKNAS' && a.ownerActionRequired === true), 'orsak saknas')
}

// 9. oklassificerat får ALDRIG tyst fortsätta
{
  const utanDisp = beslutEfterPlan(basPlan({ openQuestions: [fraga({})] }))
  check('9 STRATEGISK utan blocking ⇒ HARD_STOP (fail-closed)',
    utanDisp.decision === HARD_STOP, `fick ${utanDisp.decision}`)
  const ickeBool = beslutEfterPlan(basPlan({ openQuestions: [fraga({ blocking: 'nej' })] }))
  check('9b icke-boolesk blocking ⇒ HARD_STOP',
    ickeBool.decision === HARD_STOP, `fick ${ickeBool.decision}`)
  const utanIv = basPlan(); delete utanIv.interventionsbeslut
  const gammal = beslutEfterPlan(utanIv)
  check('9c äldre plan utan interventionsbeslut ⇒ HARD_STOP (ingen auktoritet genom frånvaro)',
    gammal.decision === HARD_STOP, `fick ${gammal.decision}`)
  const okant = beslutEfterPlan(basPlan({ interventionsbeslut: 'KANSKE' }))
  check('9d okänt interventionsutfall ⇒ HARD_STOP',
    okant.decision === HARD_STOP, `fick ${okant.decision}`)
  check('9e inget plan-utfall alls ⇒ HARD_STOP',
    beslutEfterPlan(null).decision === HARD_STOP, 'null-planen fail-closar inte')
}

// 10. ohanterad juridik stoppar fortfarande
{
  const b = beslutEfterPlan(basPlan({ juridikflaggor: [{ flagga: 'halsa', status: 'ohanterad' }] }))
  check('10 ohanterad juridik ⇒ HARD_STOP bevarat', b.decision === HARD_STOP, `fick ${b.decision}`)
  check('10b och kräver ägaråtgärd',
    b.attention.some(a => a.decision === 'JURIDIK_OHANTERAD' && a.ownerActionRequired === true), 'event saknas')
}

// 11. krävd men obyggd capability stoppar (bärs som blockerande strategisk fråga)
{
  const b = beslutEfterPlan(basPlan({
    openQuestions: [fraga({ text: 'kräver kapacitet X som inte finns', blocking: true, blockingReason: 'DECLARED, ej byggd' })] }))
  check('11 obyggd krävd kapacitet ⇒ HARD_STOP bevarat', b.decision === HARD_STOP, `fick ${b.decision}`)
}

// 12. kvarstående CRITICAL stoppar fortfarande
{
  check('12 CRITICAL efter fixloop ⇒ stopp bevarat', shouldStopAfterReview(1).stop === true, 'stoppar inte')
  check('12b noll CRITICAL ⇒ fortsätter', shouldStopAfterReview(0).stop === false, 'stoppar felaktigt')
}

// 13/14/15 — källnivå: fixkontrakt, deploy-auktoritet, maskinläsbarhet
// Bind till FUNKTIONSDEKLARATIONEN, inte till första förekomsten av namnet — annars
// ankrar mönstret på ett anropsställe och mäter fel kropp.
check('13 brutet fixkontrakt ⇒ HARD_STOP bevarat',
  /async function overlamnadKontrakt\([\s\S]{0,600}?decision: HARD_STOP[\s\S]{0,80}?ownerActionRequired: true/.test(src),
  'fixkontraktsbrottet är inte längre HARD_STOP med ägaråtgärd')
check('14 deploy sker aldrig från autobygg',
  /INGEN deploy/.test(src) && /[Dd]eploy(ar)? (sker )?[aA]LDRIG|Deployar ALDRIG/.test(src) && !/vercel:deploy['"`]\s*\)/.test(src),
  'deploy-auktoriteten ser ändrad ut')
check('14b nod 8 och 9 förblir mänskliga', /nod 8[\s\S]{0,80}nod 9|juridik-signoff[\s\S]{0,120}vercel:deploy/.test(src),
  'de mänskliga noderna nämns inte längre')
check('15 attention-event bär alla sex fälten',
  /severity:[\s\S]{0,200}decision:[\s\S]{0,200}reason:[\s\S]{0,200}evidence:[\s\S]{0,200}actionTaken:[\s\S]{0,200}ownerActionRequired:/.test(src),
  'attentionEvent saknar något obligatoriskt fält')

// 15b. ownerActionRequired skiljer verkligt true/false i samma körning
{
  const bTrue = beslutEfterPlan(basPlan({ juridikflaggor: [{ flagga: 'x', status: 'ohanterad' }] }))
  const bFalse = beslutEfterPlan(basPlan({ interventionsbeslut: 'AVRÅD', openQuestions: [fraga({ blocking: false })] }))
  check('15b attention skiljer ownerActionRequired true/false',
    bTrue.attention.some(a => a.ownerActionRequired === true) &&
    bFalse.attention.every(a => a.ownerActionRequired === false),
    'skillnaden är inte maskinläsbar')
  check('15c ownerActionRequired är alltid boolesk (aldrig undefined)',
    [...bTrue.attention, ...bFalse.attention].every(a => typeof a.ownerActionRequired === 'boolean'),
    'fältet kan bli undefined')
}

/* ─────────── invarianter som lätt går sönder vid framtida ändringar ─────────── */

// ROUTE får ALDRIG råka bli CONTINUE när en blockerande fråga finns samtidigt.
{
  const b = beslutEfterPlan(basPlan({ interventionsbeslut: 'AVRÅD',
    openQuestions: [fraga({ text: 'avråd', blocking: false }), fraga({ text: 'mandat', blocking: true })] }))
  check('I1 HARD_STOP vinner över ROUTE när båda gäller', b.decision === HARD_STOP, `fick ${b.decision}`)
}
// ATTENTION_CONTINUE får aldrig maskera ett ROUTE.
{
  const b = beslutEfterPlan(basPlan({ interventionsbeslut: 'FÖRBÄTTRA BEFINTLIG',
    openQuestions: [fraga({ blocking: false })] }))
  check('I2 ROUTE vinner över ATTENTION_CONTINUE', b.decision === ROUTE, `fick ${b.decision}`)
}
// Attention-events får aldrig raderas av ett stopp.
{
  const b = beslutEfterPlan(basPlan({ interventionsbeslut: 'AVRÅD',
    juridikflaggor: [{ flagga: 'y', status: 'ohanterad' }],
    openQuestions: [fraga({ text: 'avråd', blocking: false })] }))
  check('I3 attention bevaras även vid HARD_STOP', b.attention.length >= 2, `endast ${b.attention.length} event`)
}
// CONTINUE ska aldrig uppstå ur en tom/degenererad indata.
{
  check('I4 tomt objekt fail-closar', beslutEfterPlan({}).decision === HARD_STOP, 'tomt plan-objekt gav inte HARD_STOP')
}

/* ─────────── ETIKETTERNA SJÄLVA MÅSTE VALIDERAS ───────────────────────────────
 * Tidigare fail-OPENade klassificeringsfälten: `kind: 'strategisk'` (fel skiftläge) föll
 * ur STRATEGISK-filtret och blev CONTINUE utan att någon disposition ens efterfrågades,
 * och `status: 'OHANTERAD'` gled förbi juridikstoppet. Asymmetrin var det farliga —
 * `interventionsbeslut` fail-closade hårt medan etiketterna som BÄR dispositionen inte
 * gjorde det. Dokumentationen lovade samtidigt ägaren att varje okänt läge stoppar.
 */
for (const kind of ['strategisk', 'Strategisk', 'STRATEGISK ', ' STRATEGISK', 'STRATEGISK\n', 'ANNAT', '', null, 42]) {
  const b = beslutEfterPlan(basPlan({ openQuestions: [{ text: 'x', kind, blocking: false }] }))
  check(`V-kind ${JSON.stringify(kind)} ⇒ HARD_STOP (fail-closed)`, b.decision === HARD_STOP, `fick ${b.decision}`)
}
for (const status of ['OHANTERAD', 'ohanterad ', 'Ohanterad', 'okänd', null]) {
  const b = beslutEfterPlan(basPlan({ juridikflaggor: [{ flagga: 'f', status }] }))
  check(`V-status ${JSON.stringify(status)} ⇒ HARD_STOP (fail-closed)`, b.decision === HARD_STOP, `fick ${b.decision}`)
}
for (const g of [0, null, 'false', undefined, 1]) {
  const p2 = basPlan(); p2.inputGatePassed = g
  const b = beslutEfterPlan(p2)
  check(`V-gate ${JSON.stringify(g)} ⇒ HARD_STOP (endast äkta boolean godtas)`, b.decision === HARD_STOP, `fick ${b.decision}`)
}
for (const v of [null, 0, '', 'false', {}, [], undefined]) {
  const p2 = basPlan(); p2.scopeNej = v
  check(`V-scopeNej ${JSON.stringify(v)} ⇒ HARD_STOP`, beslutEfterPlan(p2).decision === HARD_STOP,
    `fick ${beslutEfterPlan(p2).decision}`)
}
// Icke-itererbara listor kastade TypeError och bröt löftet att ALLTID returnera ett
// beslut. En vakt som kraschar är odömbar, inte sträng.
for (const v of [null, undefined, 'x', 0]) {
  const p2 = basPlan(); p2.openQuestions = v
  let d; try { d = beslutEfterPlan(p2).decision } catch (e) { d = `KASTADE ${e.name}` }
  check(`V-iterabel openQuestions ${JSON.stringify(v)} ⇒ HARD_STOP utan att kasta`, d === HARD_STOP, `fick ${d}`)
}
check('V-stateful typvalideras som sin syskonflagga',
  /typeof guard\.stateful !== 'boolean'[\s\S]{0,900}?decision: HARD_STOP/.test(src),
  'guard.stateful läses som bar sanningshalt — `stateful: null` skulle bygga vidare')

// ...men giltiga etiketter får INTE stoppa: vakten ska inte bli en ny approval-grind.
{
  const b = beslutEfterPlan(basPlan({ openQuestions: [{ text: 'f', kind: 'FAKTA' }, { text: 'b', kind: 'BESLUT' }],
    juridikflaggor: [{ flagga: 'ok', status: 'hanterad' }] }))
  check('V-giltiga etiketter fortsätter (FAKTA/BESLUT kräver ingen disposition)',
    b.decision === CONTINUE, `fick ${b.decision}`)
}

/* ─────────── WIRING: att beslutet FATTAS räcker inte — det måste VERKSTÄLLAS ─────
 *
 * Beteendeprovet ovan kör de rena funktionerna. Det säger ingenting om att anroparen
 * agerar på svaret. En granskning visade vad det kostade: SEXTON mutationer utanför det
 * extraherade blocket överlevde 36/36 grönt — bland dem att låta ROUTE falla igenom till
 * `phase('Init')` och bygga just den sajt plannern sagt nej till, att stänga av
 * CRITICAL-stoppet, och att köra obemannat på en `bemannat`-brief.
 *
 * `beslutEfterPlan` som returnerar ROUTE är värdelöst om ingenting verkställer det.
 * Kontrollerna nedan binder därför ORDNINGEN och FÖRGRENINGEN i källan, inte prosan.
 */
const idx = (s) => src.indexOf(s)
const efter = (a, b) => idx(a) >= 0 && idx(b) >= 0 && idx(a) < idx(b)

// W1 — plan-beslutet måste avbryta BÅDE på ROUTE och HARD_STOP, och göra det före Init.
const planGren = /if \(planBeslut\.decision === ROUTE \|\| planBeslut\.decision === HARD_STOP\)/.test(src)
check('W1 plan-grenen avbryter på både ROUTE och HARD_STOP', planGren,
  'förgreningen testar inte längre båda utfallen — ett av dem faller igenom till bygget')
check('W1b och den returnerar FÖRE phase(Init)',
  planGren && efter("planBeslut.decision === ROUTE", "phase('Init')") &&
  /planBeslut\.decision === ROUTE[\s\S]{0,900}?\n  return \{[\s\S]{0,400}?\n\}/.test(src),
  'ROUTE/HARD_STOP-grenen saknar return före Init — beslutet fattas men verkställs inte')

// W2 — lägesgrinden måste fortfarande gälla: en `bemannat`-brief får inte köras obemannat.
check('W2 obemannatGate är inkopplad före plan-beslutet',
  /const modeStop = obemannatGate\(plan && plan\.lage\)/.test(src) &&
  /modeStop\.stop[\s\S]{0,120}decision: HARD_STOP/.test(src),
  'lägesgrinden är bortkopplad eller ger inte HARD_STOP')
// S12: DEFAULTEN ÄR VÄND. Den gamla kontrollen krävde att en SAKNAD rad stoppade;
// den ersätts av en starkare som prövar alla tre grenarna, inklusive fail-closed på
// okänt värde. Att bara vända den gamla hade lämnat skräpvärden otestade — och en
// vänd default utan fail-closed byter ett stopp mot en gissning.
check('W2b saknad `Läge:`-rad ⇒ obemannat (ny default)',
  obemannatGate(undefined).stop === false && obemannatGate('').stop === false &&
  obemannatGate('   ').stop === false && obemannatGate(null).stop === false,
  'en saknad eller tom lägesrad släpper inte igenom obemannat')
check('W2c `bemannat` stoppar fortfarande vid nod 3',
  obemannatGate('bemannat').stop === true && obemannatGate('bemannat').oklassificerat === false,
  'uttryckligen begärt bemannat stoppar inte, eller markeras felaktigt som oklassificerat')
check('W2d `obemannat` släpps igenom',
  obemannatGate('obemannat').stop === false, 'uttryckligt obemannat släpps inte igenom')
check('W2e okänt lägesvärde ⇒ ODÖMBART stopp, aldrig den autonoma vägen',
  ['obeman', 'BEMANNAT', 'auto', 'obemannat!', 'x', 0, {}, []].every(v => {
    const r = obemannatGate(v)
    return r.stop === true && r.oklassificerat === true
  }),
  'ett okänt lägesvärde tolkas som ett läge i stället för att fail-closa')

// W3 — Del-C: ouppfyllt förkrav HARD_STOPar, stateful glidning ROUTAR, och båda avbryter.
check('W3 Del-C skiljer ouppfyllt förkrav (HARD_STOP) från stateful glidning (ROUTE)',
  /guard\.unmetPrerequisite === true \|\| typeof guard\.unmetPrerequisite !== 'boolean'/.test(src) &&
  /decision: HARD_STOP[\s\S]{0,200}stage: 'del-c'|stage: 'del-c'[\s\S]{0,200}decision: HARD_STOP/.test(src),
  'förkravsgrenen saknas — en obyggd krävd capability skulle routas i stället för att stoppa')
check('W3b stateful-grenen finns kvar och returnerar',
  /if \(guard\.stateful\) \{[\s\S]{0,1200}?return \{ status: 'ROUTAD'/.test(src),
  'stateful-grenen är avstängd eller returnerar inte')
check('W3c Del-C avbryter före Content', efter("if (guard.stateful)", "phase('Content')"),
  'Del-C-grenen ligger efter Content — bygget hinner fortsätta')

// W4 — CRITICAL-stoppet måste vara inkopplat, inte bara definierat.
check('W4 review-stoppet är inkopplat och returnerar',
  /const reviewStop = shouldStopAfterReview\(/.test(src) &&
  /if \(reviewStop\.stop\) \{[\s\S]{0,900}?return \{ status: 'ÖVERLÄMNAD'/.test(src),
  'CRITICAL-stoppet är bortkopplat')
check('W4b och det ligger före grind-torrkörningen',
  efter('if (reviewStop.stop)', "phase('Grind-torrkörning')"), 'ordningen är omkastad')

// W5 — fixkontraktsbrott måste RETURNERA, inte bara anropa.
{
  // Golvet var `>= 4` medan den verkliga siffran är 6 — alltså kunde TVÅ hela anropsställen
  // raderas med kontrollen grön, däribland fixrundans kontraktsbrott som W5 finns för.
  // Ett golv under den yta det namnger vaktar inte ytan.
  const ANROP_FORVANTAT = 6
  const anrop = [...src.matchAll(/(\breturn\s+)?await overlamnadKontrakt\(/g)]
  check('W5 varje fixkontraktsbrott returnerar (aldrig bara anrop)',
    anrop.length === ANROP_FORVANTAT && anrop.every(m => !!m[1]),
    anrop.length !== ANROP_FORVANTAT
      ? `${anrop.length} anropsställen, ${ANROP_FORVANTAT} förväntades — ett kontraktsbrott har raderats eller tillkommit`
      : `${anrop.filter(m => !m[1]).length} av ${anrop.length} anrop saknar return — flödet fortsätter efter brottet`)
  // Fixrundans gren namnges separat: den är BATCH-005:s egen yta.
  check('W5b fixrundans kontraktsbrott returnerar',
    /if \(!fRes\.ok\) return await overlamnadKontrakt\('fixkontrakt'/.test(src),
    'fixrundans brott stoppar inte längre')
  check('W5c contentfasens kontraktsbrott returnerar',
    /if \(!cRes\.ok\) return await overlamnadKontrakt\('content'/.test(src),
    'contentfasens brott stoppar inte längre')
}

// W6 — schemat måste kräva interventionsbeslut, annars är hela taxonomin valfri.
check('W6 PLAN_OUTCOME kräver interventionsbeslut',
  /required: \[[^\]]*'interventionsbeslut'[^\]]*\]/.test(src),
  'interventionsbeslut är inte längre schema-obligatoriskt')
check('W6b STATICGUARD kräver unmetPrerequisite',
  /required: \['stateful', 'evidence', 'unmetPrerequisite'\]/.test(src),
  'unmetPrerequisite är inte schema-obligatoriskt')

// W7 — attention får inte tappas eller bli ett mutex i slutrapporten.
check('W7 slutrapporten bär attention och kräver inget ägarsvar',
  /attention: planAttention[\s\S]{0,600}?ownerActionRequired: false|ownerActionRequired: false[\s\S]{0,600}?attention: planAttention/.test(src),
  'attention tappades ur slutrapporten eller markerades som väntande')
// W7 vaktade bara RETURVÄRDET. Den PERSISTERADE loggen bär samma fält och var oskyddad:
// `attention: []` i writeAutobyggLog tömde AUTOBYGG-LOG tyst medan returen såg riktig ut.
// ANKARKRAV. Första versionen använde `[...matchAll].every(...)` med ett {0,400}-fönster:
// en tom träffmängd gav PASS, fönstret missade den längsta skrivningen (405 tecken), och
// B11 dödades bara av en femteckens-tillfällighet — mutationen KORTADE kroppen in i
// fönstret. Antalet måste bevisas först, precis som W5 gör.
{
  const LOGG_FORVANTAT = 6
  const skrivningar = [...src.matchAll(/writeAutobyggLog\(buildDir, \{/g)]
    .map(m => balansera(src, src.indexOf('{', m.index)))
  check('W7b varje AUTOBYGG-LOG-skrivning är hittad (ankaret bevisat)',
    skrivningar.length === LOGG_FORVANTAT && skrivningar.every(Boolean),
    `${skrivningar.length} skrivningar hittade, ${LOGG_FORVANTAT} förväntades — mönstret har tappat ankaret`)
  check('W7b2 och var och en bär attention',
    skrivningar.length === LOGG_FORVANTAT &&
    skrivningar.every(t => /attention: \[\.\.\.planAttention|attention: planAttention/.test(t)),
    'minst en AUTOBYGG-LOG-skrivning saknar attention')
}
// ROUTE och HARD_STOP får ALDRIG rapporteras under samma status — distinktionen är
// hela skivans syfte. En hårdkodad status kollapsar dem till ett odifferentierat stopp.
check('W7c plan-grenens status och ownerActionRequired härleds ur beslutet',
  /const routad = planBeslut\.decision === ROUTE/.test(src) &&
  /const status = routad \? 'ROUTAD' : 'ÖVERLÄMNAD'/.test(src) &&
  /ownerActionRequired: !routad/.test(src),
  'ROUTAD/ÖVERLÄMNAD eller ownerActionRequired är hårdkodad — distinktionen är borta')
// Blockerande frågor får aldrig presenteras som uppskjutbara.
check('W7d deferredQuestions utesluter blockerande frågor',
  /deferredQuestions: \(plan\.openQuestions \|\| \[\]\)\.filter\(q => q\.kind !== 'STRATEGISK' \|\| q\.blocking === false\)/.test(src),
  'deferredQuestions filtrerar inte bort blockerande strategiska frågor')

/* ─────────── PROMPTEN MÅSTE BEGÄRA DET BESLUTET LÄSER ────────────────────────
 * Ett fält kan vara schema-obligatoriskt, valideras hårt och ändå aldrig efterfrågas
 * vid anropsstället. Så blev det: `blocking` gjordes bärande utan att plan-prompten
 * nämnde den, så en planner som följde prompten KORREKT utelämnade fältet och varje
 * bygge med en strategisk fråga HARD-stoppade. Alltså "tillstånd oftare" — raka
 * motsatsen till skivans syfte — orsakat av ett fält som avgör ett beslut men aldrig
 * begärs. Kontrollen härleder fälten UR beslutsfunktionen och kräver dem i prompten.
 */
{
  const promptM = /const plan = await agent\(\s*([\s\S]*?)\{ label: 'plan'/.exec(src)
  if (!promptM) {
    console.error('ODÖMBART: plan-anropet kunde inte hittas — prompt/schema-bindningen kan inte prövas')
    process.exit(2)
  }
  // KOMMENTARER STRIPPAS. Utdraget är RÅ källtext, så en kommenterad rad är omöjlig att
  // skilja från levande mall-literal. Att sätta `// ` framför de nya raderna neutraliserade
  // hela skivan medan vakten skrev 103/103. Det som aldrig når agenten instruerar ingenting
  // — samma regel som docs-coherence bär för HTML-kommentarer.
  const prompt = utanKodkommentar(promptM[1])
  // Fält som beslutEfterPlan faktiskt läser ur plan-utfallet, härledda ur källan.
  // NÄSTLADE LÄSNINGAR MÅSTE MED. Första versionen härledde bara `plan.X`, vilket gav sex
  // toppnivåfält — och lämnade `q.blocking`, `q.kind`, `f.status` osynliga. Vakten hade
  // alltså INTE fångat den defekt den skrevs för. `blocking` avgör hela semantiken.
  const toppniva = [...block.matchAll(/\bplan\.([A-Za-zÅÄÖåäö_$][\w$]*)/g)].map(m => m[1])
  const nastlade = [...block.matchAll(/\b[qf]\.([A-Za-zÅÄÖåäö_$][\w$]*)/g)].map(m => m[1])
  const lasta = [...new Set([...toppniva, ...nastlade])]
    // `missingFields` bärs vidare men styr inget beslut; `text`/`flagga` är bevisbärare
    // i attention-event, inte grindfält. (`briefPath` behövde aldrig uteslutas — den ligger
    // utanför det extraherade blocket och kom aldrig in i mängden.)
    .filter(f => !['missingFields', 'text', 'flagga', 'blockingReason'].includes(f))
  // EXAKT ANTAL, inte golv — samma disciplin som D1/W5/W7b.
  const FALT_FORVANTAT = 9
  check('P1 beslutsfunktionens lästa fält har hittats (ankaret bevisat)',
    lasta.length === FALT_FORVANTAT,
    `${lasta.length} fält härledda, ${FALT_FORVANTAT} förväntades — mängden har ändrats eller mönstret tappat ankaret`)
  for (const f of lasta) {
    check(`P2 prompten begär \`${f}\``, prompt.includes(f),
      `beslutEfterPlan läser plan.${f} men prompten nämner den aldrig — tyst grind`)
  }
  // Dispositionen är den som lättast glöms, och den som vänder hela semantiken.
  check('P3 prompten kräver blocking på VARJE strategisk fråga',
    /EVERY STRATEGISK question MUST carry/.test(prompt) && /blocking: (?:true\|false)/.test(prompt),
    'kravet på disposition per fråga saknas i prompten')
  // Band tidigare till skiftlägesmeningen i stället — en helt annan regel. En kontroll
  // vars namn säger UTELÄMNANDE måste binda till utelämnande.
  check('P4 prompten säger att UTELÄMNADE fält fail-closar',
    /Omitting[\s\S]{0,140}fails closed/.test(prompt),
    'prompten varnar inte för att utelämnande stoppar körningen')
  // `lage` läses inte av beslutEfterPlan utan av obemannatGate, så härledningen missar
  // den — men den grindar HARD_STOP och måste därför begäras som RETURFÄLT, inte bara
  // skrivas in i briefen.
  check('P6 prompten begär `lage` som returfält (obemannatGate grindar på den)',
    /return it as the field \\?`lage\\?`/.test(prompt),
    'lage grindar HARD_STOP men begärs aldrig som returfält — tyst grind')
  check('P5 prompten säger att strategisk betydelse ensam aldrig stoppar',
    /[Ss]trategic significance ALONE is never a stop/.test(prompt),
    'prompten saknar den bärande regeln — plannern skulle blocka defensivt')
}

/* ─────────── LOGGEN MÅSTE SKILJA UPPLYSNING FRÅN FRÅGA ────────────────────────
 * Attention kan vara korrekt satt i datan och ändå läsas som ett krav. En upplysning
 * som ser ut som en fråga ÄR ett mutex i praktiken.
 */
{
  const loggM = /async function writeAutobyggLog\([\s\S]*?return agent\(([\s\S]*?)\{ label:/.exec(src)
  if (!loggM) {
    console.error('ODÖMBART: loggagentens prompt kunde inte hittas')
    process.exit(2)
  }
  const lp = utanKodkommentar(loggM[1])
  check('L1 loggprompten renderar attention som eget avsnitt',
    /Owner attention/.test(lp), 'attention lämnas som rå JSON i loggen')
  check('L2 loggprompten skiljer INGET SVAR KRÄVS från ÄGARÅTGÄRD KRÄVS',
    /INGET SVAR KRÄVS/.test(lp) && /ÄGARÅTGÄRD KRÄVS/.test(lp),
    'de två lägena renderas likadant — upplysning blir oskiljbar från fråga')
  check('L3 loggprompten förbjuder att skriva om ett false-event som en fråga',
    /aldrig om ett false-event/.test(lp), 'skyddet mot att attention blir ett mutex saknas')
  check('L4 loggprompten skiljer ROUTAD från ÖVERLÄMNAD',
    /ROUTAD[\s\S]{0,200}ÖVERLÄMNAD/.test(lp), 'de två statusarna förklaras inte isär')
}

/* ─────────── DUPLICERADE NYCKLAR ────────────────────────────────────────────────
 * Varje fältnärvaro-regex i W1–W7 kan besegras av EN rad: lägg till nyckeln igen senare
 * i samma objektliteral. Sista nyckeln vinner vid körning medan den vaktade literalen
 * står kvar ordagrant. Så kunde en obyggd krävd capability rapporteras som
 * `status: 'ROUTAD', ownerActionRequired: false` med W3, W6 och W7 gröna — alltså exakt
 * den inversion Del-C-uppdelningen skulle göra omöjlig.
 *
 * Till skillnad från dataflödesklassen (ÄRLIG GRÄNS) är detta EN billig mekanisk klass,
 * och den stängs med en kontroll: inget objektliteral i returer eller loggskrivningar
 * får bära samma toppnivånyckel två gånger.
 */
{
  const block = []
  for (const m of src.matchAll(/(?:return|writeAutobyggLog\(buildDir,)\s*\{/g)) {
    const b = balansera(src, src.indexOf('{', m.index))
    if (b) block.push(b)
  }
  const dubbletter = []
  for (const b of block) {
    const n = toppnycklar(b)
    const sedda = new Set()
    for (const k of n) { if (sedda.has(k)) dubbletter.push(k); else sedda.add(k) }
  }
  // EXAKT ANTAL, inte golv. `>= 12` mot faktiska 38 var 26 i marginal — samma defekt
  // som W5 och W7b just rättats för, upprepad i samma commit. Ett golv släpper igenom
  // att en literal FÖRSVINNER ur mängden, vilket är precis hur `return ( {` undkom.
  const LITERAL_FORVANTAT = 39
  check('D1 objektliteraler i returer/loggskrivningar har hittats (ankaret bevisat)',
    block.length === LITERAL_FORVANTAT,
    `${block.length} literaler hittade, ${LITERAL_FORVANTAT} förväntades — mängden har ändrats eller mönstret tappat ankaret`)
  check('D2 ingen duplicerad toppnivånyckel (sista-nyckeln-vinner-inversion)',
    dubbletter.length === 0,
    `duplicerade nycklar: ${[...new Set(dubbletter)].join(', ')} — en senare nyckel kan tyst vända beslutet`)
}

/* ─────────── verdikt ─────────── */
// FAST NÄMNARE — samma försvar som `check-docs-coherence.mjs` bär. Utan den kunde hela
// fail-closed-blocket raderas och skriptet skriva ut `PASS 31/31` med exit 0: en vakt
// vars nämnare krymper när den slutar vakta rapporterar sin egen blindhet som grönt.
//
// ÄRLIG NOT: talet är inte längre en ren egenskap hos vaktens egen text — P2 avger en
// kontroll per härlett fält, så nämnaren beror på den VAKTADE filen. `FALT_FORVANTAT`
// låser den delen separat, men den som ändrar beslutsfunktionens fältmängd måste ändra
// TVÅ tal medvetet, inte ett.
const FORVANTAT = 110

for (const p of pass) console.log(`PASS: ${p}`)
for (const f of fails) console.error(`FAIL: ${f}`)
const total = pass.length + fails.length
if (total !== FORVANTAT) {
  console.error(`\nODÖMBART: ${total} kontroller avgavs men ${FORVANTAT} förväntades — ` +
    `vakten har tappat eller fått kontroller och kan inte döma. Ändra FORVANTAT medvetet ` +
    `när kontrollmängden ändras; aldrig för att få tyst på detta.`)
  process.exit(2)
}
if (fails.length) {
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${total} delegationskontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${total}/${total} delegationskontroller`)
process.exit(0)
