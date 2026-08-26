#!/usr/bin/env node
// VAKTANKARET: en pinne per vakt, samlad på EN yta.
//
// VARFÖR DEN HÄR FILEN FINNS. En inventering av batteriet gav ett obehagligt svar: av
// fjorton vakter hade NIO inget källankare alls. En vakt utan ankare kan tömmas tyst —
// byt varje predikat mot `true` och banderollen skriver fortfarande `PASS — N/N`, med
// oförändrat antal och oförändrade kontrollnamn. Det är inte en teoretisk risk: exakt den
// mutationen har överlevt i tre av de vakter som byggts i det här arbetet, och rättningen
// har fått göras om varje gång eftersom den bodde i vakten själv.
//
// TVÅ VERIFIERADE KRINGGÅENDEN LIGGER BAKOM KONSTRUKTIONEN:
//
//   1. NAMNHASH FÄLLER INTE ETT UTBYTT PREDIKAT. En hash över kontrollnamnen lämnar
//      `check('X', villkor)` → `check('X', true)` osynlig: namnet står kvar ordagrant.
//   2. RADUTELÄMNING ÖPPNAR EN LUCKA I KÄLLHASHEN. Formen som filtrerade bort varje rad
//      som innehöll markören `FORVANTAD_KALLHASH =` fälldes av en injicerad rad som
//      SJÄLV bar markören — `process.exit(0) // FORVANTAD_KALLHASH = ` föll ur hashen och
//      avslutade vakten grön. Här hashas varje byte av varje vakt, utan undantag.
//
// VAD DEN HÄR VAKTEN FAKTISKT KÖPER — OCH INTE. Den hindrar INTE mig från att ändra en
// vakt och pinna om i samma commit. Det den gör är att flytta frågan "har någon rört
// vakterna?" från fjorton filer till EN, och att göra varje sådan ändring till en synlig
// rad i diffen på en yta vars enda syfte är att granskas. Det sista ledet är en människa
// som läser den raden. Den här filen ersätter inte det ledet; den gör det möjligt.
//
// EN TREDJE INCIDENT GAV DEN HÄR VAKTEN SIN VIKTIGASTE KONTROLL. Under bygget skrevs den
// här filen av misstag över av en kopia av en ANNAN vakt. Batteriet fortsatte grönt: den
// påträngande filen körde sina egna kontroller och avslutade 0, och ompinningsverktyget
// rapporterade framgång trots att inget av dess mönster hade träffat. Därför prövar
// vakten sin egen IDENTITET, inte bara sin hash — och ompinningen ligger i `--pinna om`
// här i filen i stället för i ett skript vid sidan om som kan ljuga om vad det gjorde.
//
// SJÄLVANKARET täcker LOGIKEN, inte tabellen. Tabellen är data och måste ändras när en
// vakt legitimt ändras; logiken får inte bytas ut. Därför normaliseras pinntabellen bort
// ur självhashen, och saknas dess markörer blir körningen ODÖMBAR i stället för grön.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { join, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('VAKT: check-vaktankare.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig

let ROT
try {
  ROT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
} catch {
  console.error('ODÖMBART: ingen git-topp — körning utanför repo vägras')
  process.exit(2)
}
const odombart = (skal) => { console.error(`ODÖMBART: ${skal}`); process.exit(2) }

const passes = []
const fails = []
const check = (namn, ok, detalj) => (ok ? passes.push(namn) : fails.push(`${namn}: ${detalj}`))

const SJALVPIN = '3c88dd99fdb8e0ee'

// ---- PINNTABELL: BÖRJAN (normaliseras ut ur självankaret) -------------------
// sha256 över vaktens HELA källtext, första 16 hex. Ändras en vakt legitimt uppdateras
// raden i SAMMA commit — det är hela poängen att den ändringen syns här.
const PINNAR = {
  'check-autobygg-delegation.mjs': '8f186bba47978877',
  'check-backtest-fixtures.mjs': 'b43a5eda33e5fc0c',
  'check-docs-coherence.mjs': 'ae02760dfefd3f8e',
  'check-extern-bokning.mjs': '7198e8e1502d8915',
  'check-gate-parameterization.mjs': '991c3cc5ea86447f',
  'check-gym-contract.mjs': '3bdf293c3aa7e1f7',
  'check-integrationer.mjs': '6ac685656bd60406',
  'check-invariants.mjs': 'dbdf696d7cefd335',
  'check-karn-universalitet.mjs': 'd9dff3487cfca7e1',
  'check-knowledge-lane.mjs': '2b9bb187a92b6866',
  'check-pack-contract.mjs': 'd6b8395bfb1bfd2d',
  'check-planner-routing.mjs': '7b5fc9ae3a556a0d',
  'check-profile-contract.mjs': '5da81cc32582b46c',
  'check-research-contract.mjs': '4aa0aa5b5f281092',
  'check-v4-utkast.mjs': '3c107f8e300336f9',
  'check-workflow-parse.mjs': '575a45e74cc23eec',
  'kor-backtest.mjs': 'c6fd0e7b16c39072',
  'kor-vakter.mjs': 'aa17a3fefd53a27d',
}
// ---- PINNTABELL: SLUT -------------------------------------------------------

const MIG = fileURLToPath(import.meta.url)
const migSjalv = basename(MIG)
const kalla = readFileSync(MIG, 'utf8')

// ---- 0. IDENTITETSPROV: är den här filen fortfarande den här vakten? --------
// En kopia av en annan vakt under det här namnet körde sina EGNA kontroller och avslutade
// 0. Ett namn är inte ett innehåll. Signaturraden måste stå i filen som körs.
const SIGNATUR = 'VAKTANKARET: en pinne per vakt, samlad på EN yta.'
if (!kalla.includes(SIGNATUR)) {
  console.error(`ODÖMBART: filen ${migSjalv} bär inte ankarvaktens signaturrad — den har skrivits över av något annat. En grön körning från en påträngande fil är värre än ingen körning.`)
  process.exit(2)
}

const TABELL = /^\/\/ ---- PINNTABELL: BÖRJAN[\s\S]*?^\/\/ ---- PINNTABELL: SLUT.*$/m
const SJALVRAD = /^const SJALVPIN = '[0-9a-f]{16}'$/m

// ---- OMPINNING: bor HÄR, inte i ett skript vid sidan om ---------------------
// Ett externt ompinningsskript rapporterade framgång utan att ett enda mönster hade
// träffat. Här är varje träff ett villkor: missar ett mönster avbryts ompinningen.
if (process.argv.includes('--pinna-om')) {
  const vakterNu = vaktlista()
  const rader = vakterNu.filter((v) => v !== migSjalv).map((v) =>
    `  '${v}': '${createHash('sha256').update(readFileSync(join(ROT, 'scripts', v), 'utf8')).digest('hex').slice(0, 16)}',`)
  if (rader.length === 0) { console.error('AVBRUTET: inga vakter att pinna'); process.exit(2) }
  const TAB_INNEHALL = /^(\/\/ ---- PINNTABELL: BÖRJAN[\s\S]*?const PINNAR = \{\n)[\s\S]*?(^\}$)/m
  if (!TAB_INNEHALL.test(kalla)) { console.error('AVBRUTET: pinntabellens form känns inte igen'); process.exit(2) }
  const ny0 = kalla.replace(TAB_INNEHALL, (_, f, s) => f + rader.join('\n') + '\n' + s)
  let ny = ny0
  if (!SJALVRAD.test(ny)) { console.error('AVBRUTET: självpinnens deklaration har fel form'); process.exit(2) }
  const h = createHash('sha256').update(ny.replace(TABELL, '<TABELL>').replace(SJALVRAD, "const SJALVPIN = '<PINNE>'")).digest('hex').slice(0, 16)
  ny = ny.replace(SJALVRAD, `const SJALVPIN = '${h}'`)
  writeFileSync(MIG, ny)
  console.log(`OMPINNAD: ${rader.length} vakter · logikhash ${h}`)
  process.exit(0)
}

// ---- 1. Vilka vakter FINNS? Spårade OCH ospårade ---------------------------
// Enbart `git ls-files --cached` skulle låta en ny vakt gömma sig genom att vara ospårad,
// och skulle dessutom lista en RADERAD vakt som fortfarande finns i indexet. Därför
// korsas listan med vad som faktiskt ligger på disk.
function vaktlista() {
  let filer
  try {
    filer = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', 'scripts/'],
      { cwd: ROT, encoding: 'utf8' }).split('\n').filter(Boolean)
  } catch {
    odombart('git ls-files misslyckades — vaktmängden går inte att avgränsa')
  }
  // `.map(basename)` vore fel: Array.map skickar indexet som andra argument, och basename
  // tolkar det som `suffix` — vilket kastar på första elementet.
  return [...new Set(filer.map((f) => basename(f)))]
    // Både VAKTER (`check-*`) och KÖRARE (`kor-*`) pinnas. Att bara pinna vakterna lämnade
    // `kor-vakter.mjs` opinnad — och just den filen är den enda som märker att en vakt
    // skrivits över. Nu låser de två varandra: skrivs köraren över fäller den här vakten,
    // skrivs den här vakten över fäller köraren. Två samtidiga överskrivningar är kvar som
    // gräns, men en ensam är det inte längre.
    .filter((f) => /^(check|kor)-.+\.mjs$/.test(f))
    .filter((f) => existsSync(join(ROT, 'scripts', f)))
    .sort()
}
const vakter = vaktlista()
check('Ankare: minst en vakt kunde räknas upp', vakter.length > 0,
  'inga check-*.mjs hittades — då prövar den här vakten ingenting')
if (vakter.length === 0) odombart('tom vaktmängd — en grön körning vore meningslös')

// POSITIVT KONTROLLPROV: hittar uppräkningen inte den här filen är detektorn trasig,
// inte trädet. Ett tyst tomt resultat får aldrig läsas som ett rent resultat.
if (!vakter.includes(migSjalv)) odombart(`uppräkningen hittade inte ${migSjalv} — detektorn är trasig`)

// ---- 2. Varje funnen vakt måste vara PINNAD ---------------------------------
const opinnade = vakter.filter((v) => v !== migSjalv && !(v in PINNAR))
check('Varje vakt i trädet har en rad i pinntabellen', opinnade.length === 0,
  `opinnade: ${opinnade.join(', ')} — en ny vakt utan pinne står utanför den enda ytan som visar att vakterna rörts`)

// ---- 3. Varje pinnad vakt måste FINNAS ---------------------------------------
const forsvunna = Object.keys(PINNAR).filter((v) => !vakter.includes(v))
check('Varje pinnad vakt finns kvar i trädet', forsvunna.length === 0,
  `försvunna: ${forsvunna.join(', ')} — en borttagen vakt är en borttagen kontroll, aldrig en tyst städning`)

// ---- 4. Varje pinne måste STÄMMA -------------------------------------------
for (const vakt of vakter) {
  if (vakt === migSjalv || !(vakt in PINNAR)) continue
  const h = createHash('sha256').update(readFileSync(join(ROT, 'scripts', vakt), 'utf8')).digest('hex').slice(0, 16)
  check(`${vakt} är byte-oförändrad mot sin pinne`, h === PINNAR[vakt],
    `hash ${h}, pinnen säger ${PINNAR[vakt]} — vakten har redigerats. Är ändringen avsedd körs \`node scripts/check-vaktankare.mjs --pinna-om\` i SAMMA commit; annars kan predikat ha bytts mot \`true\` med oförändrat antal och oförändrade kontrollnamn`)
}

// ---- 5. Självankaret: logiken, inte tabellen --------------------------------
if (!TABELL.test(kalla)) odombart('pinntabellens markörer saknas — självankaret går inte att normalisera')
if (!SJALVRAD.test(kalla)) odombart('självpinnens deklaration har fel form — ankaret går inte att normalisera')
const sjalvhash = createHash('sha256').update(
  kalla.replace(TABELL, '<TABELL>').replace(SJALVRAD, "const SJALVPIN = '<PINNE>'")).digest('hex').slice(0, 16)
if (sjalvhash !== SJALVPIN) {
  console.error(`ODÖMBART: ankarvaktens egen logikhash är ${sjalvhash}, förväntad ${SJALVPIN} — vakten har själv redigerats. Pinntabellen är UNDANTAGEN ur hashen (den är data); allt annat ingår.`)
  process.exit(2)
}

for (const p of passes) console.log(`PASS: ${p}`)
if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`)
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} ankarkontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} ankarkontroller över ${vakter.length - 1} vakter (logikhash ${sjalvhash})`)
console.log('\nGRÄNS: pinnarna hindrar INTE en avsedd ändring med omedelbar ompinning. De gör')
console.log('varje sådan ändring till en synlig rad på EN yta i stället för en tyst ändring')
console.log('i någon av fjorton. Sista ledet är en människa som läser den raden.')
process.exit(0)
