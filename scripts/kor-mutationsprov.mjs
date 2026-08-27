#!/usr/bin/env node
console.log('VAKT: kor-mutationsprov.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig
//
// MUTATIONSPROVET — mäter om en vakt FAKTISKT försvarar det den påstår sig vakta.
//
// VARFÖR DEN HÄR FILEN FINNS. Inventeringen 2026-08-27 delade upp systemet i BYGGT ·
// GRANSKAT · TESTAT och fann att elva av vakterna saknade körbart kontrollprov. De hade
// källhashankare — men **en hash säger bara att filen är oförändrad, aldrig att den
// fungerar.** En vakt som föddes trasig förblir trasig och pinnad, och batteriets `PASS
// N/N` är då en räkning av kontroller som inte kan falla.
//
// ALTERNATIVET VAR ATT SKRIVA ELVA HANDGJORDA KONTROLLPROV. Det hade gett elva
// handskrivna listor att vattna ur, och nästa vakt hade fått en tolfte som någon glömmer.
// Här HÄRLEDS mutationsmängden i stället: varje strängliteral i en vakts källa som namnger
// en SPÅRAD fil är ett ankare, och varje ankare töms i tur och ordning.
//
// FRÅGAN SOM STÄLLS ÄR SMAL OCH ÄRLIG: *kan den här vakten vara GRÖN i en värld där allt
// den namnger är tomt?* Kan den det försvarar den ingenting.
//
// VERDIKTET ÄR MEDVETET SMALT. Att ett enskilt ankare överlever är INTE ett fel — en vakt
// som kräver att något ALDRIG står i en fil blir förstås grönare när filen töms, och
// `check-v4-utkast.mjs` är byggd på precis den formen. Det som fälls är den vakt som
// försvarar NOLL av sina ankare. Att göra varje överlevare till ett fel hade gett en
// rapport full av falska fynd, och en rapport man lär sig att ignorera vaktar ingenting.
//
// MUTATIONERNA SKER I EN TILLFÄLLIG WORKTREE, aldrig i arbetskopian. Den skapas vid start
// och tas bort vid slut; en avbruten körning lämnar den kvar och nästa körning återanvänder
// den. Ingen fil i det riktiga trädet rörs någonsin.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

let ROT
try {
  ROT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
} catch {
  console.error('ODÖMBART: ingen git-topp — körning utanför repo vägras')
  process.exit(2)
}
const odombart = (skal) => { console.error(`ODÖMBART: ${skal}`); process.exit(2) }

// ---- MEKANISMEN, FAKTORISERAD UT -------------------------------------------
// `ankare` tar en vakts källtext och mängden spårade filer och returnerar de filer vakten
// NAMNGER. Den rör inget filsystem, så den kan köras mot syntetisk indata och tvingas
// bevisa att den kan säga NEJ.
export function ankare(kalla, sparade, migSjalv) {
  return [...new Set([...String(kalla).matchAll(/'([A-Za-z0-9_][A-Za-z0-9_./-]*\.[a-z]{2,5})'/g)].map((m) => m[1]))]
    .filter((p) => sparade.has(p) && p !== migSjalv)
    .sort()
}

// `doma` avgör ett enskilt mutationsutfall. En vakt som blir ICKE-GRÖN när ett ankare töms
// försvarar det ankaret. Vilken icke-grön form spelar ingen roll: FAIL och ODÖMBART betyder
// båda att vakten vägrade intyga en värld där ankaret var tomt.
export function doma(exitkod) {
  if (exitkod === 0) return 'OFÖRSVARAT'
  if (exitkod === 1 || exitkod === 2) return 'FÖRSVARAT'
  return 'ODÖMBART'
}

/**
 * Verdiktet, FAKTORISERAT UT — och skälet är fyra mutationer som ÖVERLEVDE.
 *
 * Körarens egna skyddsmekanismer var oprövade i DAGENS värld: ingen vakt försvarar noll,
 * ingen är röd i orört träd, och ingen fladdrar. Att ta bort ankarkravet, baslinjekravet,
 * fladderprovet eller själva FAIL-grenen ändrade därför ingenting i utfallet — de gick att
 * radera osynligt. **Ett skydd som bara gäller i ett läge som inte inträffar är inte
 * prövat, det är bara ostört**, och det är exakt den klass hela den här filen finns för.
 *
 * Logiken bor därför i en ren funktion som tvingas producera FAIL och ODÖMBART mot
 * syntetiska rader, i stället för att bara aldrig behöva göra det.
 */
export function sammanfatta(rader, minVakter, minAnkare) {
  const matbara = rader.filter((r) => r.lage !== 'UPPRÄKNANDE')
  const summaAnkare = rader.reduce((n, r) => n + (r.ank || 0), 0)
  if (matbara.length < minVakter) {
    return { verdikt: 'ODÖMBART', skal: `bara ${matbara.length} mätbara vakter, ${minVakter} krävs — härledningen är trasig, och en uppräkning som gett upp ser likadan ut som ett rent träd` }
  }
  if (summaAnkare < minAnkare) {
    return { verdikt: 'ODÖMBART', skal: `bara ${summaAnkare} härledda ankare, ${minAnkare} krävs — mönstret har slutat träffa, och noll ankare ger PASS av tomhet` }
  }
  const odom = rader.filter((r) => r.lage === 'ODÖMBART')
  if (odom.length) return { verdikt: 'ODÖMBART', skal: `${odom.length} vakter kunde inte mätas`, rader: odom }
  const tomma = rader.filter((r) => r.lage === 'FÖRSVARAR INGET')
  if (tomma.length) return { verdikt: 'FAIL', skal: `${tomma.length} vakter försvarar noll av sina ankare`, rader: tomma }
  return { verdikt: 'PASS', skal: `${matbara.length} mätbara vakter, ${summaAnkare} ankare` }
}

const MIN_VAKTER = 15
const MIN_ANKARE = 50
const MIN_KALLA = readFileSync(new URL(import.meta.url), 'utf8')

// ---- KOPPLINGSKONTROLLERNA KÖRS ALLTID, inte bara under --sjalvprov --------
// Första formen lade dem i självprovet, och två mutationer överlevde den fulla körningen:
// fladderprovet och baslinjekravet gick att radera utan att en vanlig körning märkte det.
// **Ett skydd som bara prövas när man ber om det är inte ett skydd i drift.** De prövas nu
// vid varje start, före första mutationen.
const KOPPLINGAR = [
  ['fladderprovet finns och verkställs',
    /const fladder = korVakt\(vakt\)/.test(MIN_KALLA) && /if \(fladder !== 0\) \{ rader\.push/.test(MIN_KALLA)],
  ['baslinjekravet finns och verkställs',
    /const bas = korVakt\(vakt\)/.test(MIN_KALLA) && /if \(bas !== 0\) \{ rader\.push/.test(MIN_KALLA)],
  ['`sammanfatta` anropas på de VERKLIGA raderna',
    /const dom = sammanfatta\(rader, MIN_VAKTER, MIN_ANKARE\)/.test(MIN_KALLA)],
  ['mutationen sker i WORKTREEN, aldrig i arbetskopian',
    /const full = join\(WT, a\)/.test(MIN_KALLA) && !/const full = join\(ROT, a\)/.test(MIN_KALLA)],
  ['FAIL-grenen finns och avslutar 1',
    /if \(dom\.verdikt === 'FAIL'\)/.test(MIN_KALLA) && /process\.exit\(1\)/.test(MIN_KALLA)],
  ['ODÖMBART-grenen finns och avslutar 2',
    /if \(dom\.verdikt === 'ODÖMBART'\)/.test(MIN_KALLA) && /process\.exit\(2\)/.test(MIN_KALLA)],
]
const brutna = KOPPLINGAR.filter(([, ok]) => !ok).map(([n]) => n)
if (brutna.length && !process.argv.includes('--sjalvprov')) {
  console.error(`ODÖMBART: körarens egna skydd är brutna — ${brutna.join(' · ')}`)
  console.error('En körning vars skyddsmekanismer raderats mäter ingenting, hur grön den än ser ut.')
  process.exit(2)
}

if (process.argv.includes('--sjalvprov')) {
  const S = new Set(['a.md', 'b.js'])
  const prov = [
    ['ankare hittar en namngiven spårad fil', JSON.stringify(ankare("las('a.md')", S, 'x.mjs')) === '["a.md"]'],
    ['ankare tar ALDRIG med en fil som inte är spårad', ankare("las('finns-ej.md')", S, 'x.mjs').length === 0],
    ['ankare tar ALDRIG med vakten själv', ankare("las('a.md')", S, 'a.md').length === 0],
    ['ankare dubblerar inte', ankare("las('a.md') las('a.md')", S, 'x.mjs').length === 1],
    ['ankare hittar flera', ankare("las('a.md');las('b.js')", S, 'x.mjs').length === 2],
    ['ankare på tom källa ger tom mängd', ankare('', S, 'x.mjs').length === 0],
    ['doma: exit 0 ⇒ OFÖRSVARAT — vakten intygade en tom värld', doma(0) === 'OFÖRSVARAT'],
    ['doma: exit 1 ⇒ FÖRSVARAT', doma(1) === 'FÖRSVARAT'],
    ['doma: exit 2 ⇒ FÖRSVARAT — ODÖMBART är också en vägran', doma(2) === 'FÖRSVARAT'],
    ['doma: okänd exitkod ⇒ ODÖMBART, aldrig OFÖRSVARAT', doma(9) === 'ODÖMBART'],
    ['doma: null (dödad process) ⇒ ODÖMBART', doma(null) === 'ODÖMBART'],

    // ---- Verdiktlogiken måste kunna producera FAIL och ODÖMBART ----
    ['sammanfatta: en vakt som FÖRSVARAR INGET ⇒ FAIL',
      sammanfatta([{ lage: 'FÖRSVARAR INGET', ank: 60 }, ...Array.from({ length: 15 }, () => ({ lage: 'FÖRSVARAR', ank: 1 }))], 15, 50).verdikt === 'FAIL'],
    ['sammanfatta: en ODÖMBAR vakt ⇒ ODÖMBART, och den slår FAIL',
      sammanfatta([{ lage: 'ODÖMBART', ank: 60 }, { lage: 'FÖRSVARAR INGET', ank: 1 }, ...Array.from({ length: 15 }, () => ({ lage: 'FÖRSVARAR', ank: 1 }))], 15, 50).verdikt === 'ODÖMBART'],
    ['sammanfatta: FÖR FÅ mätbara vakter ⇒ ODÖMBART, aldrig PASS av tomhet',
      sammanfatta([{ lage: 'FÖRSVARAR', ank: 99 }], 15, 50).verdikt === 'ODÖMBART'],
    ['sammanfatta: FÖR FÅ ankare ⇒ ODÖMBART — mönstret har slutat träffa',
      sammanfatta(Array.from({ length: 20 }, () => ({ lage: 'FÖRSVARAR', ank: 1 })), 15, 50).verdikt === 'ODÖMBART'],
    ['sammanfatta: UPPRÄKNANDE räknas inte som mätbar',
      sammanfatta(Array.from({ length: 20 }, () => ({ lage: 'UPPRÄKNANDE', ank: 0 })), 15, 50).verdikt === 'ODÖMBART'],
    ['sammanfatta: allt försvarat ⇒ PASS — logiken kan säga ja också',
      sammanfatta(Array.from({ length: 20 }, () => ({ lage: 'FÖRSVARAR', ank: 5 })), 15, 50).verdikt === 'PASS'],

    // Samma lista som körs vid varje start — återbrukad, aldrig duplicerad. En andra kopia
    // hade kunnat drifta från den som faktiskt gäller.
    ...KOPPLINGAR.map(([n, ok]) => [`koppling: ${n}`, ok]),
  ]
  for (const [namn, ok] of prov) console.log(`${ok ? 'PASS' : 'FAIL'}: självprov — ${namn}`)
  const fel = prov.filter(([, ok]) => !ok)
  if (fel.length) { console.error(`\nODÖMBART: ${fel.length} av ${prov.length} kontrollprov föll`); process.exit(2) }
  console.log(`\nRESULTAT: PASS — ${prov.length}/${prov.length} kontrollprov gröna`)
  process.exit(0)
}

// ---- Uppräkningen ----------------------------------------------------------
let sparadeLista
try {
  sparadeLista = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'],
    { cwd: ROT, encoding: 'utf8' }).split('\n').filter(Boolean)
} catch { odombart('git ls-files misslyckades — ankarmängden går inte att avgränsa') }
const sparade = new Set(sparadeLista)
const vakter = sparadeLista.filter((f) => /^scripts\/check-.+\.mjs$/.test(f)).sort()
if (vakter.length === 0) odombart('inga vakter funna — en tom mängd är aldrig ett rent resultat')

// ---- Den tillfälliga worktreen ---------------------------------------------
const WT = join(tmpdir(), 'nortropic-mutationsprov')
if (existsSync(WT)) { try { execFileSync('git', ['worktree', 'remove', '--force', WT], { cwd: ROT }) } catch { rmSync(WT, { recursive: true, force: true }) } }
try {
  execFileSync('git', ['worktree', 'add', '--quiet', '--detach', WT, 'HEAD'], { cwd: ROT, encoding: 'utf8' })
} catch (e) { odombart(`kunde inte skapa arbetsträdet ${WT} (${e.message.split('\n')[0]}) — mutationer får aldrig ske i arbetskopian`) }
const stad = () => { try { execFileSync('git', ['worktree', 'remove', '--force', WT], { cwd: ROT }) } catch { rmSync(WT, { recursive: true, force: true }) } }
process.on('exit', stad)

const korVakt = (vakt) => spawnSync(process.execPath, [join(WT, vakt)], { cwd: WT, encoding: 'utf8', timeout: 600_000 }).status

// ---- BASLINJE + POSITIVT KONTROLLPROV MOT FLADDER --------------------------
// Två saker måste gälla innan ett enda mutationsutfall får tolkas.
//   (1) Vakten är GRÖN i den orörda worktreen. Är den redan röd betyder varje efterföljande
//       rött utfall ingenting — vi hade mätt vaktens eget tillstånd, inte mutationen.
//   (2) Vakten är fortfarande GRÖN när en fil den INTE namnger töms. Utan det provet kan
//       "vakten blev röd" lika gärna betyda "vakten blir röd av vad som helst", och då är
//       varje FÖRSVARAT-utfall obetalt.
// DEN OBEROENDE FILEN HÄRLEDS PER VAKT, och första formen var fel. En fast fil valdes för
// alla, och `check-backtest-fixtures.mjs` blev då ODÖMBAR: filen låg under `backtests/`,
// som vakten räknar upp per KATALOG utan att namnge varje fil. Den var alltså inte
// oberoende — bara onämnd. **Onämnd är inte samma sak som oberörd**, och skillnaden är
// precis den fladderprovet finns för att fånga.
//
// Kravet är därför att filens HELA sökvägsprefix är okänt för vakten: varken filen, dess
// katalog eller någon förfader får förekomma i vaktens källa.
const prefixen = (f) => { const d = f.split('/'); return d.slice(0, -1).map((_, i) => d.slice(0, i + 1).join('/')) }
const oberoendeFor = (kalla) => sparadeLista.find((f) =>
  !kalla.includes(f) && prefixen(f).every((pre) => !kalla.includes(pre)) && /\.(md|json|ts)$/.test(f))

const rader = []
for (const vakt of vakter) {
  const ank = ankare(readFileSync(join(ROT, vakt), 'utf8'), sparade, vakt)
  const bas = korVakt(vakt)
  if (bas !== 0) { rader.push({ vakt, lage: 'ODÖMBART', skal: `redan icke-grön i orört träd (exit ${bas}) — mutationer går inte att tillskriva`, ank: ank.length, forsvarade: 0, oforsvarade: [] }); continue }
  if (ank.length === 0) { rader.push({ vakt, lage: 'UPPRÄKNANDE', skal: 'namnger inga filer — räknar upp dem i stället, och en uppräkning går inte att tömma fil för fil', ank: 0, forsvarade: 0, oforsvarade: [] }); continue }

  // Fladderprovet: en fil vars HELA prefix är okänt för vakten töms. Vakten ska förbli grön.
  const kalla = readFileSync(join(ROT, vakt), 'utf8')
  const oberoende = oberoendeFor(kalla)
  if (!oberoende) { rader.push({ vakt, lage: 'ODÖMBART', skal: 'hittade ingen fil vars hela prefix är okänt för vakten — fladderprovet går inte att ställa, och utan det är varje FÖRSVARAT obetalt', ank: ank.length, forsvarade: 0, oforsvarade: [] }); continue }
  {
    const spar = readFileSync(join(WT, oberoende), 'utf8')
    writeFileSync(join(WT, oberoende), '')
    const fladder = korVakt(vakt)
    writeFileSync(join(WT, oberoende), spar)
    if (fladder !== 0) { rader.push({ vakt, lage: 'ODÖMBART', skal: `blir icke-grön av att en fil med okänt prefix töms (${oberoende}) — vaktens rödhet går inte att tillskriva ett ankare`, ank: ank.length, forsvarade: 0, oforsvarade: [] }); continue }
  }

  const oforsvarade = []
  let forsvarade = 0
  let odombara = 0
  for (const a of ank) {
    const full = join(WT, a)
    if (!existsSync(full)) continue
    const spar = readFileSync(full, 'utf8')
    writeFileSync(full, '')
    const utfall = doma(korVakt(vakt))
    writeFileSync(full, spar)
    if (utfall === 'FÖRSVARAT') forsvarade++
    else if (utfall === 'ODÖMBART') odombara++
    else oforsvarade.push(a)
  }
  const lage = odombara > 0 ? 'ODÖMBART' : (forsvarade === 0 ? 'FÖRSVARAR INGET' : 'FÖRSVARAR')
  rader.push({ vakt, lage, ank: ank.length, forsvarade, oforsvarade,
    skal: odombara ? `${odombara} ankare gav okänd exitkod` : `${forsvarade}/${ank.length} ankare försvarade` })
}

// ---- Rapport ----------------------------------------------------------------
const bredd = Math.max(...rader.map((r) => r.vakt.length))
for (const r of rader) console.log(`${r.lage.padEnd(17)} ${r.vakt.padEnd(bredd)}  ${r.skal}`)

const tomma = rader.filter((r) => r.lage === 'FÖRSVARAR INGET')
const odom = rader.filter((r) => r.lage === 'ODÖMBART')
const upp = rader.filter((r) => r.lage === 'UPPRÄKNANDE')
const summaAnkare = rader.reduce((n, r) => n + r.ank, 0)
const summaForsvarade = rader.reduce((n, r) => n + r.forsvarade, 0)
console.log(`\n${rader.length} vakter · ${summaAnkare} härledda ankare · ${summaForsvarade} försvarade`)

if (upp.length) {
  console.log('\nUPPRÄKNANDE — namnger inga filer och kan därför inte mätas så här:')
  for (const r of upp) console.log(`  · ${r.vakt}`)
  console.log('  De räknar upp sina mål vid körning i stället för att namnge dem. Att de inte')
  console.log('  mäts här betyder INTE att de är oprövade — det betyder att det här måttet')
  console.log('  inte når dem, och att säga det är hela skillnaden mot att räkna dem som gröna.')
}
const medOforsvarade = rader.filter((r) => r.oforsvarade.length)
if (medOforsvarade.length) {
  console.log('\nENSKILDA OFÖRSVARADE ANKARE — informativt, aldrig i sig ett fel:')
  console.log('  En vakt som kräver att något ALDRIG står i en fil blir grönare när filen töms.')
  for (const r of medOforsvarade) console.log(`  · ${r.vakt}: ${r.oforsvarade.join(', ')}`)
}
const dom = sammanfatta(rader, MIN_VAKTER, MIN_ANKARE)
if (dom.verdikt === 'ODÖMBART') {
  console.error(`\nODÖMBART: ${dom.skal}`)
  for (const r of (dom.rader || [])) console.error(`  · ${r.vakt} — ${r.skal}`)
  console.error('\nRESULTAT: ODÖMBART — ODÖMBART blir aldrig grönt.')
  process.exit(2)
}
if (dom.verdikt === 'FAIL') {
  console.error('\nFÖRSVARAR INGET — grön i en värld där varenda fil den namnger är tom:')
  for (const r of (dom.rader || [])) console.error(`  · ${r.vakt} (${r.ank} ankare, noll försvarade)`)
  console.error('\nRESULTAT: FAIL — en vakt som kan vara grön över tomma ankare vaktar ingenting.')
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — varje mätbar vakt försvarar minst ett av sina ankare (${dom.skal})`)
console.log('\nVAD DETTA INTE BEVISAR: att en vakt fäller RÄTT sak. Måttet är smalt med avsikt —')
console.log('det svarar bara på om vakten kan vara grön över tomma ankare. En vakt som fäller')
console.log('på fel grund, eller som missar den mutation som spelar roll, passerar här. Det som')
console.log('köps är att en vakt som föddes tom inte längre kan gömma sig bakom en källhash.')
process.exit(0)
