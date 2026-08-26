#!/usr/bin/env node
// Gymkontraktet: prövar att docs/gymkontrakt.md bär §18:s elva lagar och §17:s fyra led.
//
// DEN VIKTIGASTE KONTROLLEN ÄR RIKTAD MOT FÖRFATTAREN. Kontraktet är skrivet av samma
// agent vars konfigurationer gymmet ska mäta, och §18:s första lag lyder
// "student cannot move goalposts". Den verkliga risken är inte att jag flyttar en
// mätstock — de är §A6-skyddade och kan inte skrivas härifrån — utan att jag gör just de
// LÄTTA lagarna mekaniska och låter de svåra glida bort.
//
// Därför: vakten kräver att SAMTLIGA elva lagar har en rad med ett uttalat läge, OCH att
// prosans påstående om hur många som är EJ MEKANISKA stämmer med tabellens faktiska
// antal. En tyst omklassificering av en svår lag till "mekanisk" fäller.
//
// Ankaret är en hash över vaktens EGEN KÄLLTEXT, inte över kontrollnamnen: en namnhash
// fäller inte ett utbytt predikat (namnet kan stå kvar medan villkoret blir `true`).
// Hashen täcker VARJE rad — endast pinnens literal normaliseras. Att i stället UTELÄMNA
// rader som bär markören är ett bevisat kringgående (se verdiktblocket).
//
// ÄRLIG GRÄNS: §18:s lagtexter är HANDSKRIVNA här ur masterplanen, som inte finns i
// repot. Det finns alltså inget ankare mot källan — driftar planen driftar listan tyst.
// Samma gräns som §26:s fällor i check-backtest-fixtures.mjs.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('VAKT: check-gym-contract.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig

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
const flat = (s) => s.replace(/\s+/g, ' ')

const passes = []
const fails = []
const check = (namn, ok, detalj) => (ok ? passes.push(namn) : fails.push(`${namn}: ${detalj}`))
const FORVANTAD_KALLHASH = '794fe86a728ec814'

const k = las('docs/gymkontrakt.md')
const konst = las('docs/07-konstitution.md')
const kompetens = las('docs/kompetensregister.md')

// §18:s elva lagar, handskrivna ur planen (se ÄRLIG GRÄNS ovan).
const LAGAR = [
  ['G1', 'student cannot move goalposts'],
  ['G2', 'deterministic evidence first'],
  ['G3', 'calibrated judge only where deterministic evidence is insufficient'],
  ['G4', 'disagreement preserved, not averaged away'],
  ['G5', 'provider family preference measured'],
  ['G6', 'hidden holdouts protected'],
  ['G7', 'synthetic evidence never yields PROVEN'],
  ['G8', 'optimizer-invisible measurement where reward-hacking risk exists'],
  ['G9', 'bounded budget'],
  ['G10', 'budget exhaustion ≠ PASS'],
  ['G11', 'promotion uses normal owner/trust path'],
]

const lagRader = [...k.matchAll(/^\| `(G\d+)` \| \*(.+?)\* \| (.+?) \| `(MEKANISK|EJ MEKANISK)`(.*?) \|$/gm)]
check('Ankare: lagtabellen kunde läsas', lagRader.length > 0, 'inga G-rader matchade')
const funna = lagRader.map((m) => m[1])
check('Kontraktet bär SAMTLIGA elva lagar ur §18',
  LAGAR.every(([id]) => funna.includes(id)) && funna.length === 11,
  `hittade [${funna.join(', ')}] — en lag utan rad är en lag som tyst glidit bort`)
const felText = LAGAR.filter(([id, text]) => {
  const r = lagRader.find((m) => m[1] === id)
  return !r || !flat(r[2]).toLowerCase().includes(flat(text).toLowerCase())
})
check('Varje lag citerar planens ordalydelse', felText.length === 0,
  `avviker: ${felText.map(([id, t]) => `${id} (väntade "${t}")`).join(' · ')}`)

// ANTI-SJÄLVBEDRÄGERI: prosans antal EJ MEKANISKA måste stämma med tabellens.
const ejMek = lagRader.filter((m) => m[4] === 'EJ MEKANISK' || /EJ MEKANISK/.test(m[5]))
const delvis = lagRader.filter((m) => /delvis/i.test(m[5]))
const prosaAntal = /\*\*(\w+) av elva är EJ MEKANISKA/.exec(k)
check('Ankare: prosans antal EJ MEKANISKA kunde läsas', !!prosaAntal, 'meningen saknas')
const ORD = { 'noll': 0, 'en': 1, 'två': 2, 'tre': 3, 'fyra': 4, 'fem': 5, 'sex': 6, 'sju': 7, 'åtta': 8, 'nio': 9, 'tio': 10, 'elva': 11 }
const pastatt = prosaAntal ? ORD[prosaAntal[1].toLowerCase()] : -1
check('Prosans antal EJ MEKANISKA stämmer med tabellen',
  pastatt === ejMek.length + delvis.length,
  `prosan säger ${pastatt}, tabellen bär ${ejMek.length} EJ MEKANISKA + ${delvis.length} delvis — en tyst omklassificering av en svår lag till mekanisk är exakt det författaren har intresse av`)
check('Minst en lag är erkänt EJ MEKANISK', ejMek.length >= 1,
  'ett kontrakt där varje lag råkar vara mekanisk är misstänkt, inte imponerande')

// De tre lagar som ALDRIG får bli "mekaniska" utan att någon förklarar hur.
for (const id of ['G3', 'G6', 'G8']) {
  const r = lagRader.find((m) => m[1] === id)
  check(`${id} är erkänt icke-mekanisk (bedömning, saknad artefakt eller självreferens)`,
    !!r && (r[4] === 'EJ MEKANISK' || /EJ MEKANISK/.test(r[5])),
    `${id} står som ${r ? r[4] : '?'} — kalibreringens kvalitet, ett repo som inte finns och en egenskap systemet inte kan bevisa om sig självt är inte mekaniskt avgörbara`)
}

// §17:s fyra led, och led 2 som ODÖMBART
check('Kontraktet bär Modellkandidatregelns fyra led', /\| 1 \|/.test(k) && /\| 4 \|/.test(k), 'leden saknas')
// Led 2 prövas i BÅDA lägen — tabellraden OCH prosan. Ett `||` mellan dem är vakuöst:
// en mutation som uppgraderade TABELLRADEN till "Körbar" överlevde, eftersom prosameningen
// ensam räckte. Tabellraden är den operativa; prosan är bara dess förklaring.
const led2 = /^\| 2 \| (.+?) \| (.+?) \|$/m.exec(k)
if (!led2) odombart('led 2:s tabellrad kunde inte läsas — ledet går inte att pröva')
check('Led 2:s TABELLRAD bär ODÖMBART', /ODÖMBART/.test(led2[2]),
  `raden säger "${led2[2].slice(0, 60)}" — held-out-repot finns inte, så ett annat läge är ett påstående utan täckning`)
check('Led 2:s ODÖMBART står också i prosan',
  /[Ll]ed 2 redovisas ODÖMBART i varje förslag/.test(flat(k)),
  'held-out-ledet döljer att en tredjedel av bevisningen saknas')
check('Led 2:s ODÖMBART är förankrat i kompetensregistret',
  /Held-out-repot finns inte/.test(kompetens), 'registret säger inte längre samma sak — en av dem har driftat')
check('Modellkontraktet ändras EN rad i taget', /EN rad i taget/.test(k), 'regeln saknas')

// Rapportformen
for (const falt of ['Budget:', 'Deterministiska led:', 'Domarled:', 'Per leverantörsfamilj:', 'Oenigheter:', 'Osynliggjorda mått:', 'VERDIKT:']) {
  check(`Rapportformen bär fältet \`${falt}\``, k.includes(falt), 'fältet saknas — då kan lagen det bär inte redovisas')
}
check('Verdiktmängden bär OENIG och ODÖMBART, aldrig PROVEN',
  /VERDIKT: <PASS \| FAIL \| OENIG \| ODÖMBART>/.test(k) && /aldrig PROVEN/.test(k),
  'ett gym som kan ge PROVEN har blivit en befordransväg')

// ALDRIG-listan
for (const [vad, m] of [
  ['skriver aldrig i tests/fixtures', /[Ss]kriver aldrig i `tests\/fixtures\/`/],
  ['befordrar aldrig', /[Bb]efordrar aldrig/],
  ['ger aldrig PROVEN', /[Gg]er aldrig `PROVEN`/],
  ['medelvärdesberäknar aldrig oenighet', /[Mm]edelvärdesberäknar aldrig oenighet/],
  ['uttömd budget är aldrig PASS', /[Kk]allar aldrig uttömd budget för PASS/],
]) check(`ALDRIG-listan bär "${vad}"`, m.test(k), 'raden saknas')

// Ingen befordransväg får smyga in
check('Kontraktet bär INGEN befordransväg',
  !/gymmet (kan|får) (befordra|promota)/i.test(k) && /[Bb]efordrar aldrig/.test(k),
  'en befordransväg i gymkontraktet gör evidens till auktoritet')

// §A6-bindningen: mätstockarna är människoägda
check('Kontraktet binder mätstockarna till §A6', /§A6/.test(k) && /människoägd/.test(k), 'bindningen saknas')
check('Konstitutionen säger fortfarande att baselines är människoägda',
  /baselines uppdateras endast av människa/.test(konst),
  'konstitutionen har ändrats — gymkontraktets grund har flyttat sig')

// GYM-EXP-1:s kontroll
check('GYM-EXP-1 bär same-family resample control som OBLIGATORISK',
  /same-family resample control/.test(k) && /Kör baslinjemodellen IGEN, ny sampling/.test(k),
  'utan kontrollen är varje familjepåstående oskiljbart från brus')
check('GYM-EXP-1 säger ut varför kontrollen inte är valfri',
  /ryms inom bruset är inget fynd/.test(k), 'skälet saknas')

// Luckorna
for (const id of ['GYM-GAP-1', 'GYM-GAP-2', 'GYM-GAP-3']) {
  check(`Luckan \`${id}\` är namngiven med nästa transition`,
    new RegExp(`^\\| \`${id}\` \\|.*\\|.*\\|$`, 'm').test(k), 'luckan saknas eller saknar transition')
}
check('Kontraktet säger ut att ingen körbar runner finns',
  /Ingen körbar gymrunner finns/.test(k), 'en läsare tror annars att gymmet kan köras')

// Självreflektionen om intressekonflikten
check('Kontraktet erkänner att det är skrivet av eleven',
  /skrevs av eleven|Den agent som skriver det här\s*\n?kontraktet/.test(k),
  'intressekonflikten är inte namngiven — och den löses inte av goda intentioner')

// ---- Verdikt ---------------------------------------------------------------
// Ankaret hashar HELA källtexten med enbart PINNENS LITERAL utbytt mot en platshållare.
// Den tidigare formen filtrerade bort varje RAD som innehöll markören — vilket är ett
// bevisat kringgående: raden `process.exit(0) // FORVANTAD_KALLHASH = ` föll ur hashen och
// avslutade vakten grön utan att pinnen rörde sig. Inga rader utelämnas längre.
const rader = readFileSync(fileURLToPath(import.meta.url), 'utf8')
const PINNRAD = /^const FORVANTAD_KALLHASH = '[0-9a-f]{16}'$/m
if (!PINNRAD.test(rader)) odombart('pinndeklarationen har fel form — ankaret går inte att normalisera')
const egen = rader.replace(PINNRAD, "const FORVANTAD_KALLHASH = '<PINNE>'")
const kallhash = createHash('sha256').update(egen).digest('hex').slice(0, 16)
if (kallhash !== FORVANTAD_KALLHASH) {
  console.error(`ODÖMBART: vaktens källhash är ${kallhash}, förväntad ${FORVANTAD_KALLHASH} — vakten har redigerats. Uppdatera pinnen medvetet i samma commit.`)
  process.exit(2)
}
for (const p of passes) console.log(`PASS: ${p}`)
if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`)
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} gymkontraktskontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} gymkontraktskontroller (källhash ${kallhash})`)
console.log('\nVAD DETTA INTE BEVISAR: kontraktet är FORMEN. Ingen körbar gymrunner finns')
console.log('(GYM-GAP-1), held-out-repot saknas (GYM-GAP-2) och GYM-EXP-1 har aldrig körts')
console.log('(GYM-GAP-3). Sex av elva lagar är icke- eller endast delvis mekaniska; bara fem är')
console.log('verkligt mekaniskt bundna.')
process.exit(0)
