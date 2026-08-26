#!/usr/bin/env node
// Parsgrind för workflows — den kontroll som SAKNADES.
//
// VARFÖR DEN FINNS: `node --check` användes som syntaxgrind för alla sex workflows och
// rapporterade exit 0 på en fil som INTE gick att parsa. Följden var att `nortropic-launch.js`
// — själva launch-flödet — låg trasigt i `main` medan ÅTTA kontrollskript sa grönt (det nionde är den här filen, som inte fanns då).
// Felet var TRE rader i launch.js med oescapade backticks inuti mall-literaler: `paket` i stället för
// \`paket\`. En enda sådan avslutar literalen och gör resten av filen till kod.
//
// `node --check` är blind här därför att den prövar filen som CommonJS-skript, medan
// workflows körs som modulkropp med toppnivå-return och -await. Grinden måste alltså pröva
// källan i SAMMA FORM som körningen använder, annars mäter den en fil som inte finns.
//
// Kontrollen EXEKVERAR aldrig något: `new Function` parsar kroppen och kastar bort den.
// Inga agent-anrop, inga sidoeffekter, inga nätverk.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART.

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

let ROT
try {
  ROT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
} catch {
  console.error('ODÖMBART: ingen git-topp — körning utanför repo vägras')
  process.exit(2)
}

const KATALOG = join(ROT, 'workflows')
if (!existsSync(KATALOG)) { console.error('ODÖMBART: workflows/ saknas'); process.exit(2) }

let filer
try {
  filer = readdirSync(KATALOG).filter((f) => /\.(js|mjs|cjs)$/.test(f)).sort()
} catch (e) {
  console.error(`ODÖMBART: workflows/ kan inte läsas (${e.code ?? e.message})`)
  process.exit(2)
}

// ANKARKRAV: en tom filmängd är aldrig ett godkänt resultat. Sex workflows är den
// nuvarande mängden; ändras den ska talet ändras MEDVETET, aldrig för att få tyst på detta.
const FORVANTAT_ANTAL = 6
if (filer.length !== FORVANTAT_ANTAL) {
  console.error(
    `ODÖMBART: ${filer.length} workflows hittade, ${FORVANTAT_ANTAL} förväntades — ` +
    `mängden har ändrats och grinden kan inte döma.`
  )
  process.exit(2)
}

/**
 * DEN ENDA parsvägen. Både filerna och självprovet går genom den — annars kan provet
 * och slingan drifta isär, och just den driften är vad filen finns för att hindra.
 *
 * `'use strict'` läggs till därför att workflows körs som MODULKROPP, och modulkroppar är
 * alltid strikta. Utan den parsade grinden slappare än körningen: `0755` och `with (…)`
 * passerade här men skulle avvisas skarpt. En grind som är mildare än verkligheten
 * godkänner filer som inte går att köra.
 */
function parsar(src) {
  const kropp = src.replace(/^export\s+const\s+meta/m, 'const meta')
  try {
    new Function(`'use strict';\nreturn (async () => {\n${kropp}\n})`)
    return { ok: true }
  } catch (e) { return { ok: false, fel: e.message } }
}

const fails = []
const pass = []

// SJÄLVPROVET GÅR GENOM SLINGAN, inte bredvid den. Två tidigare försök misslyckades på
// samma sätt: ett eget `new Function`-anrop, och sedan ett eget `parsar()`-anrop. Båda
// lämnade slingan otestad, så en slinga som svalde fel gav 6/6 grönt med en trasig fil
// inne. Giftet läggs därför in som en POST I ARBETSLISTAN och måste hamna bland felen.
const POISON = '__giftprov__'
const FRISK  = '__friskprov__'
const KALLOR = new Map()
for (const namn of filer) {
  try { KALLOR.set(namn, readFileSync(join(KATALOG, namn), 'utf8')) }
  catch (e) { console.error(`ODÖMBART: ${namn} kan inte läsas (${e.code ?? e.message})`); process.exit(2) }
}
KALLOR.set(POISON, 'const x = `a `b` c`')            // känd trasig källa
KALLOR.set(FRISK,  'const meta = {}\nreturn 1')      // känd hel källa i körningens form

for (const [namn, src] of KALLOR) {
  const r = parsar(src)
  if (r.ok) pass.push(namn)
  else fails.push(`${namn} — ${r.fel}`)
}

// Provposterna dömer GRINDEN och plockas sedan bort ur redovisningen.
const giftFangat = fails.some((f) => f.startsWith(POISON))
const friskGodkand = pass.includes(FRISK)
if (!giftFangat) {
  console.error('ODÖMBART: den giftiga källan gick genom slingan UTAN att hamna bland felen — grinden skiljer inte trasigt från helt')
  process.exit(2)
}
if (!friskGodkand) {
  console.error('ODÖMBART: den friska källan avvisades av slingan — grinden är för sträng och mäter fel')
  process.exit(2)
}
const iFails = fails.findIndex((f) => f.startsWith(POISON))
fails.splice(iFails, 1)
pass.splice(pass.indexOf(FRISK), 1)

for (const p of pass) console.log(`PASS: ${p} parsar i körningens form`)
for (const f of fails) console.error(`FAIL: ${f}`)

// TÄLJAREN MÅSTE OCKSÅ BINDAS. Nämnaren ankrades vid `readdir`, men verdiktet jämförde
// den aldrig med antalet FAKTISKT prövade filer — så en slinga som hoppade över en post
// skrev ut `PASS — 5/6` med exit 0 och en oparsbar workflow kvar i trädet. Det är exakt
// den regel som står inskriven i varje annan vakt i repot ("en vakt vars nämnare krymper
// när den slutar vakta rapporterar sin egen blindhet som grönt"), och den saknades i den
// vakt vars hela ämne är ett missat fel.
const provade = pass.length + fails.length
if (provade !== FORVANTAT_ANTAL) {
  console.error(
    `\nODÖMBART: ${provade} workflows prövades men ${FORVANTAT_ANTAL} förväntades — ` +
    `grinden har hoppat över en fil och kan inte döma.`
  )
  process.exit(2)
}
if (fails.length) {
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${FORVANTAT_ANTAL} workflows parsar inte`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${pass.length}/${FORVANTAT_ANTAL} workflows parsar`)
process.exit(0)
