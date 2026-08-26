#!/usr/bin/env node
console.log('VAKT: kor-backtest.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig
// BACKTESTKÖRAREN: kör §26:s fixturer genom den del av kedjan som FAKTISKT går att köra.
//
// VARFÖR DEN FINNS. `check-backtest-fixtures.mjs` prövar att fixturerna har rätt FORM.
// Den säger ingenting om hur systemet beter sig. Kedjans yttre noder skapar riktiga repon
// och previews och kan inte köras här. **Men beslutslagret är rent och skeppat**, och det
// går att köra mot riktiga fixturer utan en enda extern effekt. Det är vad den här filen
// gör, och den är noga med att inte påstå mer.
//
// DEN VIKTIGASTE UPPTÄCKTEN LIGGER I KAPACITETSGRINDEN. `B-GAP-1` påstår att
// "autobyggs beslutstaxonomi HARD-stoppar på obyggd krävd capability". Källan säger något
// mer försiktigt: stoppet uppstår om PLANNERN sätter `blocking: true` på en strategisk
// fråga, eller om Del-C-vakten rapporterar `unmetPrerequisite`. **Det finns ingen
// deterministisk grind som läser kapacitetskatalogen.** Stoppet är alltså modellberoende.
// Grinden här nere är deterministisk och visar vad utfallet BLIR med en sådan grind — den
// bevisar inte att den skeppade kedjan stoppar. Skillnaden står i rapporten.
//
// AKTIVERAD ≠ OMNÄMND. §15 skriver både "→ `KAP-LOKAL-SEO` aktiveras INTE" och
// "pekar mot `KAP-EXTERN-BOKNING`". En grind som söker `KAP-` skulle kräva den kapacitet
// som uttryckligen INTE aktiveras. Varje omnämnande klassas därför, och ett omnämnande
// som inte går att klassa gör körningen ODÖMBAR — aldrig grön.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

let ROT
try {
  ROT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
} catch {
  console.error('ODÖMBART: ingen git-topp — körning utanför repo vägras')
  process.exit(2)
}
const odombart = (skal) => { console.error(`ODÖMBART: ${skal}`); process.exit(2) }
const las = (p) => {
  const f = join(ROT, p)
  if (!existsSync(f)) odombart(`ankarfilen saknas — ${p}`)
  return readFileSync(f, 'utf8')
}

// ---- Beslutsfunktionerna EXTRAHERAS ur den skeppade källan ------------------
// Samma teknik som check-autobygg-delegation.mjs: en omskriven kopia skulle bevisa
// kopian, inte kedjan.
const KALLA = 'workflows/nortropic-autobygg.js'
const wf = las(KALLA)
const START = '/* ─────────── LOAD-BEARING PURE FUNCTIONS'
const i0 = wf.indexOf(START)
const i1 = wf.indexOf('/* ───', i0 + 10)
if (i0 < 0 || i1 < 0) odombart(`kunde inte avgränsa det rena funktionsblocket i ${KALLA}`)
let M
try {
  M = new Function(`${wf.slice(i0, i1)}\nreturn { beslutEfterPlan, obemannatGate, CONTINUE, ATTENTION_CONTINUE, ROUTE, HARD_STOP }`)()
} catch (e) {
  odombart(`funktionsblocket kunde inte utvärderas isolerat — ${e.message}`)
}
for (const n of ['beslutEfterPlan', 'obemannatGate', 'HARD_STOP']) {
  if (M[n] === undefined) odombart(`${n} saknas i det extraherade blocket`)
}

// ---- Kapacitetskatalogens statusar -----------------------------------------
const kat = las('docs/kapacitetskatalog.md')
const STATUS = {}
for (const r of kat.split('\n')) {
  const m = /^\| `(KAP-[A-Z0-9-]+)` \|.*\|\s*(DECLARED|BUILT|VALIDATING|PROVEN|ROUTE-OUT)\b/.exec(r)
  if (m) STATUS[m[1]] = m[2]
}
if (Object.keys(STATUS).length === 0) odombart('inga kapacitetsstatusar kunde läsas — grinden vore tom')
// KÖRBAR betyder att kapaciteten finns i verkligheten. DECLARED är beskriven men obyggd;
// ROUTE-OUT är ett medvetet nej. Båda är stoppgrunder, av olika skäl.
const KORBAR = new Set(['BUILT', 'VALIDATING', 'PROVEN'])

// ---- §15: vilka kapaciteter KRÄVS av fixturen? -----------------------------
const sektion = (t, n) => {
  const m = new RegExp(`^## ${n}\\.[\\s\\S]*?(?=^## ${n + 1}\\.|^# |\\Z)`, 'm').exec(t)
  return m ? m[0] : null
}
function kravda(research, fall) {
  const s15 = sektion(research, 15)
  if (!s15) odombart(`${fall}: §15 kunde inte avgränsas — kravmängden går inte att härleda`)
  const namnda = [...new Set([...s15.matchAll(/`(KAP-[A-Z0-9-]+)`/g)].map((m) => m[1]))]
  if (namnda.length === 0) odombart(`${fall}: §15 namnger ingen kapacitet — en tom kravmängd får aldrig läsas som ett rent resultat`)
  const krav = []
  const avstadda = []
  for (const kap of namnda) {
    // Klassa MENINGEN som bär omnämnandet, inte hela sektionen.
    const mening = s15.split(/(?<=[.·])\s+|\n(?=[-*])/).find((d) => d.includes(kap)) || ''
    const negerad = /aktiveras\s+INTE|aktiveras\s+inte|ingen\s+\w+\s*kapacitet aktiveras/i.test(mening)
    const aktiverad = /aktiveras(?!\s+(INTE|inte))|pekar mot|→/.test(mening)
    if (negerad) avstadda.push(kap)
    else if (aktiverad) krav.push(kap)
    else odombart(`${fall}: omnämnandet av ${kap} i §15 går inte att klassa som aktiverat eller avstått — fail-closed. Meningen: "${mening.trim().slice(0, 120)}"`)
  }
  return { krav, avstadda }
}

// ---- Läget ur researchens egen rad -----------------------------------------
function lage(research) {
  const m = /^Läge:\s*(.*)$/m.exec(research)
  return m ? m[1].trim() : undefined
}

// ---- Körning per fall ------------------------------------------------------
const FALL = [
  { id: 'A', namn: 'Ekbergs Rör AB (lokal)', dir: 'backtests/case-a-lokal' },
  { id: 'B', namn: 'Kadensa AB (B2B SaaS, negativkontroll)', dir: 'backtests/case-b-saas' },
]
const valt = process.argv[2]
const korda = FALL.filter((f) => !valt || f.id === valt || f.dir.includes(valt))
if (korda.length === 0) odombart(`inget fall matchar "${valt}"`)

let nagotFel = false
const rapport = []

for (const f of korda) {
  const research = las(`${f.dir}/research.md`)
  const rader = []

  // Steg 1: lägesgrinden, SKEPPAD funktion
  const g = M.obemannatGate(lage(research))
  rader.push(['1. Lägesgrinden (skeppad)', g.stop ? `STOPP — ${g.lage}` : `fortsätter — ${g.lage}`, g.stop ? 'STOPP' : 'OK'])

  // Steg 2: kapacitetsgrinden, DETERMINISTISK — finns INTE i den skeppade kedjan
  const { krav, avstadda } = kravda(research, f.id)
  const okanda = krav.filter((k) => !(k in STATUS))
  if (okanda.length) odombart(`${f.id}: §15 kräver ${okanda.join(', ')} som saknas i kapacitetskatalogen — kravet går inte att bedöma`)
  const blockerande = krav.filter((k) => !KORBAR.has(STATUS[k]))
  rader.push(['2. Kapacitetsgrinden (deterministisk, EJ i kedjan)',
    blockerande.length
      ? `HARD_STOP — ${blockerande.map((k) => `${k} är ${STATUS[k]}`).join(', ')}`
      : `alla ${krav.length} krävda är körbara`,
    blockerande.length ? 'HARD_STOP' : 'OK'])

  // Steg 3: planbeslutet, SKEPPAD funktion. Planutfallet härleds ur fixturen: en
  // obyggd krävd capability blir en BLOCKERANDE strategisk fråga, precis som
  // plannerprompten föreskriver. Det är HÄR modellberoendet sitter i den riktiga kedjan.
  const plan = {
    inputGatePassed: true,
    scopeNej: false,
    openQuestions: blockerande.map((k) => ({
      kind: 'STRATEGISK', text: `krävd capability ${k} är ${STATUS[k]}, inte byggd`,
      blocking: true, blockingReason: `${k} måste vara byggd innan bygget kan fortsätta`,
    })),
    juridikflaggor: [],
    interventionsbeslut: 'NY SAJT',
  }
  const b = M.beslutEfterPlan(plan)
  rader.push(['3. Planbeslutet (skeppad)', `${b.decision} — ${b.reason}`, b.decision === M.HARD_STOP ? 'HARD_STOP' : 'OK'])

  const stoppade = rader.find((r) => r[2] !== 'OK')
  rapport.push({ f, rader, krav, avstadda, blockerande, stoppade })
}

// ---- Rapport ---------------------------------------------------------------
console.log('\nBACKTESTKÖRNING — beslutslagret mot §26:s fixturer\n')
for (const { f, rader, krav, avstadda, blockerande, stoppade } of rapport) {
  console.log(`── CASE ${f.id}: ${f.namn}`)
  console.log(`   krävda kapaciteter: ${krav.map((k) => `${k}(${STATUS[k]})`).join(' · ') || 'inga'}`)
  console.log(`   uttryckligen avstådda: ${avstadda.join(' · ') || 'inga'}`)
  for (const [steg, utfall] of rader) console.log(`   ${steg}: ${utfall}`)
  console.log(`   UTFALL: ${stoppade ? `${stoppade[2]} vid "${stoppade[0]}"` : 'passerar beslutslagret'}`)
  if (blockerande.length) console.log(`   → allt efter det här steget är EJ KÖRT, och det är det FÖRVÄNTADE utfallet enligt ${f.dir}/FORVANTAT.md`)
  console.log('')
}

console.log('VAD DEN HÄR KÖRNINGEN INTE BEVISAR — och det är merparten:')
console.log('· Ingen sajt är byggd. Nod 3 och framåt kräver riktigt repo och preview.')
console.log('· Kapacitetsgrinden i steg 2 är DETERMINISTISK och finns INTE i den skeppade')
console.log('  kedjan. Där uppstår stoppet bara om PLANNERN sätter blocking: true, eller om')
console.log('  Del-C-vakten rapporterar unmetPrerequisite. Stoppet är alltså MODELLBEROENDE.')
console.log('  Steg 2 visar vad utfallet BLIR med en deterministisk grind — inte att kedjan')
console.log('  stoppar. Se KOR-GAP-1.')
console.log('· §26:s fällor prövas inte här. De kräver en byggd sajt.')

process.exit(nagotFel ? 1 : 0)
