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
// KAPACITETSGRINDEN VAR DEN HÄR FILENS FYND, OCH ÄR NU KEDJANS. Körningen visade att
// `B-GAP-1`:s påstående — "autobyggs beslutstaxonomi HARD-stoppar på obyggd krävd
// capability" — bara höll via en modell: plannern måste sätta `blocking: true`, eller
// Del-C-vakten rapportera `unmetPrerequisite`. Ingen kod läste kapacitetskatalogen.
// `KOR-GAP-1` är nu STÄNGD: `kapacitetsgrind()` i `workflows/nortropic-autobygg.js` är ett
// deterministiskt led FÖRE plannerns klassificering, och en agent RAPPORTERAR statusen
// medan koden fattar beslutet.
//
// GRINDEN HÄR SPEGLAR DEN, den ersätter den inte. Skillnaden som kvarstår: här läses
// katalogen direkt från disk, i kedjan läses den av en agent. **En felrapporterande agent
// kan alltså fortfarande passera kedjans grind men inte den här** — och det är precis den
// skillnaden som gör den här körningen värd att köra.
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
const ROUTE_F = 'ROUTE'
const CONTINUE_F = 'CONTINUE'
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

// Förväntanskontrollen bor i en egen funktion av samma skäl som `likvardiga`: den måste
// gå att kontrollprova. En kontroll som bara står inline går att göra alltid-tyst, och en
// alltid-tyst kontroll skriver "som förväntat" lika glatt när utfallet är ett annat. Den
// mutationen överlevde första versionen, eftersom vakten prövade RAPPORTENS MENING.
function motsvarar(vantat, faktiskt) {
  if (!vantat) return null
  return vantat === faktiskt ? null : `väntade ${vantat}, fick ${faktiskt}`
}

// Jämförelsen bor i en egen funktion av ETT skäl: den måste gå att PRÖVA. En jämförelse
// som bara står inline går att göra alltid-sann, och en alltid-sann jämförelse rapporterar
// "SAMMA utfall" lika glatt för två fall som skiljer sig åt. Den mutationen överlevde
// första versionen av vakten, eftersom vakten prövade MENINGEN i rapporten och inte
// jämförelsen bakom den.
function likvardiga(a, b) {
  return (a.stoppade ? a.stoppade[2] : 'PASS') === (b.stoppade ? b.stoppade[2] : 'PASS') &&
    a.krav.slice().sort().join() === b.krav.slice().sort().join()
}

// POSITIVT KONTROLLPROV: kan jämförelsen över huvud taget säga NEJ? Ett prov som bara kan
// säga ja är inget prov. Körs med `--sjalvprov` och av check-backtest-fixtures.mjs.
if (process.argv.includes('--sjalvprov')) {
  const p1 = { stoppade: null, krav: ['KAP-SCHEMA', 'KAP-BILD'] }
  const p2 = { stoppade: null, krav: ['KAP-BILD', 'KAP-SCHEMA'] }
  const p3 = { stoppade: null, krav: ['KAP-SCHEMA'] }
  const p4 = { stoppade: ['x', 'y', 'HARD_STOP'], krav: ['KAP-SCHEMA', 'KAP-BILD'] }
  const prov = [
    ['lika kravmängder i olika ordning är LIKVÄRDIGA', likvardiga(p1, p2) === true],
    ['olika kravmängder är INTE likvärdiga', likvardiga(p1, p3) === false],
    ['olika stoppstatus är INTE likvärdig', likvardiga(p1, p4) === false],
    ['förväntanskontrollen är TYST när utfallet stämmer', motsvarar('ROUTE', 'ROUTE') === null],
    ['förväntanskontrollen FLAGGAR när utfallet avviker', typeof motsvarar('ROUTE', 'CONTINUE') === 'string'],
    ['förväntanskontrollen FLAGGAR även åt andra hållet', typeof motsvarar('CONTINUE', 'ROUTE') === 'string'],
    ['utan förväntan flaggas ingenting', motsvarar(undefined, 'HARD_STOP') === null],
    ['ROUTE och HARD_STOP är INTE likvärdiga', likvardiga(
      { stoppade: ['x', 'y', 'ROUTE'], krav: ['KAP-SCHEMA'] },
      { stoppade: ['x', 'y', 'HARD_STOP'], krav: ['KAP-SCHEMA'] }) === false],
  ]
  // KAPACITETSGRINDENS EGET KONTROLLPROV. Sedan KAP-EXTERN-BOKNING lyftes till BUILT
  // passerar samtliga tre fall. **En grind som inte längre fäller på något fall går inte
  // att skilja från en grind som slutat fungera** — så den måste bevisa att den kan fälla.
  const gStatus = { 'KAP-X-DECLARED': 'DECLARED', 'KAP-X-ROUTEOUT': 'ROUTE-OUT', 'KAP-X-BYGGD': 'BUILT' }
  const gBlock = (ids) => ids.filter((k) => !KORBAR.has(gStatus[k]))
  prov.push(['kapacitetsgrinden FÄLLER på en DECLARED kapacitet', gBlock(['KAP-X-DECLARED', 'KAP-X-BYGGD']).length === 1])
  prov.push(['kapacitetsgrinden FÄLLER på en ROUTE-OUT kapacitet', gBlock(['KAP-X-ROUTEOUT']).length === 1])
  prov.push(['kapacitetsgrinden SLÄPPER IGENOM en byggd kapacitet', gBlock(['KAP-X-BYGGD']).length === 0])

  const fel = prov.filter(([, ok]) => !ok)
  for (const [namn, ok] of prov) console.log(`${ok ? 'PASS' : 'FAIL'}: självprov — ${namn}`)
  if (fel.length) {
    console.error(`ODÖMBART: jämförelsen klarar inte sitt eget kontrollprov (${fel.length} av ${prov.length}) — en jämförelse som inte kan säga NEJ kan inte heller säga JA`)
    process.exit(2)
  }
  console.log('\nRESULTAT: PASS — jämförelsen kan skilja likvärdigt från olikvärdigt, och kapacitetsgrinden kan fortfarande fälla')
  process.exit(0)
}

// ---- Körning per fall ------------------------------------------------------
const FALL = [
  { id: 'A', namn: 'Ekbergs Rör AB (lokal)', dir: 'backtests/case-a-lokal' },
  // §26-GAP-1:s tre verklighetsfixturer. C och D BYGGS ALDRIG — de prövar att arkitekturen
  // inte antar att varje uppdrag är "bygg en ny lokal sajt". E prövar motsatsen: att en
  // helt vanlig leverans inte drar på sig extra ceremoni (§20).
  { id: 'C', namn: 'Nordvik Fastighetsservice (NO-BUILD)', dir: 'backtests/case-c-no-build', beslut: 'ICKE-SAJT-ÅTGÄRD', vantatUtfall: ROUTE_F },
  { id: 'D', namn: 'Alvestas Måleri (MIGRATION)', dir: 'backtests/case-d-migration', beslut: 'FÖRBÄTTRA BEFINTLIG', vantatUtfall: ROUTE_F },
  { id: 'E', namn: 'Bergqvists Fönsterputs (STANDARD-nollceremoni)', dir: 'backtests/case-e-standard', beslut: 'NY SAJT', vantatUtfall: CONTINUE_F },
  // KOMPATIBILITETSVÄGEN (§26:s första väg för Case A). Samma kund, äldre kontrakt — så
  // att en skillnad i utfall bara kan bero på VERSIONEN. Når den inte samma utfall som
  // `A` är bakåtkompatibiliteten bruten, och det ska synas här.
  { id: 'AL', namn: 'Ekbergs Rör AB (v1.1.0-profil, kompatibilitetsvägen)', dir: 'backtests/case-a-legacy' },
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
  rader.push(['2. Kapacitetsgrinden (deterministisk; i kedjan sedan KOR-GAP-1, men där via agent)',
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
    // Interventionsbeslutet är PLANNERNS utfall, inte researchens. Fixturen deklarerar
    // vilket beslut som ska routas, och det som prövas här är ROUTNINGEN — att taxonomin
    // gör rätt sak med ett givet beslut. Att beslutet BLIR rätt är plannerns jobb och
    // står som `C-GAP-1`/`D-GAP-1`, EJ KÖRT.
    interventionsbeslut: f.beslut || 'NY SAJT',
  }
  const b = M.beslutEfterPlan(plan)
  rader.push(['3. Planbeslutet (skeppad)', `${b.decision} — ${b.reason}`,
    b.decision === M.HARD_STOP ? 'HARD_STOP' : b.decision === M.ROUTE ? 'ROUTE' : 'OK'])

  // §26-GAP-1: fixturer med ett DEKLARERAT förväntat utfall prövas mot det. Ett fall som
  // bara KÖRS och rapporteras prövar ingenting — förväntan måste stå före körningen.
  let avvikelse = motsvarar(f.vantatUtfall, b.decision)
  if (avvikelse) nagotFel = true
  // E-2: nollceremoni mäts som noll ägarkrävande händelser.
  const agarkrav = (b.attention || []).filter((a) => a && a.ownerActionRequired)
  if (f.id === 'E' && agarkrav.length) {
    avvikelse = `${agarkrav.length} ägarkrävande händelse(r) i en STANDARD-leverans: ${agarkrav.map((a) => a.decision).join(', ')}`
    nagotFel = true
  }
  const stoppade = rader.find((r) => r[2] !== 'OK')
  rapport.push({ f, rader, krav, avstadda, blockerande, stoppade, beslut: b, agarkrav, avvikelse })
}

// ---- Rapport ---------------------------------------------------------------
console.log('\nBACKTESTKÖRNING — beslutslagret mot §26:s fixturer\n')
for (const { f, rader, krav, avstadda, blockerande, stoppade } of rapport) {
  console.log(`── CASE ${f.id}: ${f.namn}`)
  console.log(`   krävda kapaciteter: ${krav.map((k) => `${k}(${STATUS[k]})`).join(' · ') || 'inga'}`)
  console.log(`   uttryckligen avstådda: ${avstadda.join(' · ') || 'inga'}`)
  for (const [steg, utfall] of rader) console.log(`   ${steg}: ${utfall}`)
  const utfallstext = !stoppade ? 'passerar beslutslagret'
    : stoppade[2] === 'ROUTE' ? 'ROUTAD — lanen avslutas korrekt utan bygge och utan ägarberoende'
    : `${stoppade[2]} vid "${stoppade[0]}"`
  console.log(`   UTFALL: ${utfallstext}`)
  const r = rapport.find((x) => x.f.id === f.id)
  if (f.vantatUtfall) {
    console.log(`   FÖRVÄNTAT: ${f.beslut} ⇒ ${f.vantatUtfall} · UTFALL: ${r.beslut.decision}${r.avvikelse ? ` — AVVIKELSE: ${r.avvikelse}` : ' — som förväntat'}`)
    console.log(`   ägarkrävande händelser: ${r.agarkrav.length}${f.id === 'E' ? ' (STANDARD-nollceremoni kräver noll)' : ''}`)
  }
  if (blockerande.length) console.log(`   → allt efter det här steget är EJ KÖRT, och det är det FÖRVÄNTADE utfallet enligt ${f.dir}/FORVANTAT.md`)
  console.log('')
}

// AL-10: kompatibilitetsvägen måste nå SAMMA utfall som v2-vägen. En skillnad kan bara
// bero på kontraktsversionen, eftersom kunden är densamma — och en versionsberoende
// skillnad ÄR den brutna bakåtkompatibiliteten.
const rA = rapport.find((r) => r.f.id === 'A')
const rAL = rapport.find((r) => r.f.id === 'AL')
if (rA && rAL) {
  const lika = likvardiga(rA, rAL)
  console.log(`AL-10 KOMPATIBILITETSVÄGEN: v1.1.0-profilen når ${lika ? 'SAMMA' : 'ETT ANNAT'} utfall som v1.2.0-profilen`)
  if (!lika) {
    console.error('FAIL: bakåtkompatibiliteten är bruten — samma kund, olika utfall, och den enda skillnaden är kontraktsversionen')
    console.error(`  v2-vägen:     ${rA.stoppade ? rA.stoppade[2] : 'passerar'} · krav ${rA.krav.join(', ')}`)
    console.error(`  legacy-vägen: ${rAL.stoppade ? rAL.stoppade[2] : 'passerar'} · krav ${rAL.krav.join(', ')}`)
    nagotFel = true
  }
  console.log('')
}

console.log('VAD DEN HÄR KÖRNINGEN INTE BEVISAR — och det är merparten:')
console.log('· Ingen sajt är byggd. Nod 3 och framåt kräver riktigt repo och preview.')
console.log('· Kapacitetsgrinden finns NU i kedjan (KOR-GAP-1 stängd), men läser katalogen')
console.log('  via en AGENT medan den här körningen läser den från disk. En felrapporterande')
console.log('  agent passerar därför kedjans grind men inte den här. Kedjans grind är')
console.log('  MODELLBEROENDE I SIN INDATA, deterministisk i sitt beslut.')
console.log('· §26:s fällor prövas inte här. De kräver en byggd sajt.')
console.log('· AL-10 jämför BESLUTSUTFALL, inte byggda sajter. Att två profiler leder till')
console.log('  samma beslut betyder inte att de bygger samma sajt — AL-12 är EJ KÖRD.')

process.exit(nagotFel ? 1 : 0)
