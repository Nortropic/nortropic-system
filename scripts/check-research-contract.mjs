#!/usr/bin/env node
// Kompositionsprov + drift-vakt för researchkontraktet (S1).
//
// Provar de fyra fall masterplanen namnger: lokal · SaaS-hypotes · osäker/core-only ·
// bakåtkompatibilitet. Plus pinn-verifiering: kontraktets och modulens bytes måste
// matcha config/research-contract.v3.json exakt — hash-miss är FAIL-CLOSED.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART (kunde inte köras).
// ODÖMBART blir ALDRIG grönt.

import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

console.log('VAKT: check-research-contract.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig

let ROT
try {
  ROT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
} catch {
  console.error('ODÖMBART: ingen git-topp — körning utanför repo vägras (aldrig gissad rot)')
  process.exit(2)
}

const PIN_PATH = join(ROT, 'config/research-contract.v3.json')
if (!existsSync(PIN_PATH)) {
  console.error('ODÖMBART: pinn-manifestet saknas — inget att prova mot')
  process.exit(2)
}

const pin = JSON.parse(readFileSync(PIN_PATH, 'utf8'))
const sha = (p) => createHash('sha256').update(readFileSync(p)).digest('hex')

const fails = []
const passes = []
const check = (namn, villkor, detalj) => {
  if (villkor) passes.push(namn)
  else fails.push(`${namn}: ${detalj}`)
}

// ---- Pinn-verifiering (fail-closed) ----------------------------------------
const karnaPath = join(ROT, pin.karna.path)
if (!existsSync(karnaPath)) {
  console.error(`FAIL: pinnad kärna saknas på disk: ${pin.karna.path}`)
  process.exit(1)
}
const karna = readFileSync(karnaPath, 'utf8')
check('PIN-kärna', sha(karnaPath) === pin.karna.sha256,
  `sha256 matchar inte manifestet (drift eller otillåten redigering) — fail-closed`)

const moduler = []
for (const m of pin.paketmoduler) {
  const p = join(ROT, m.path)
  if (!existsSync(p)) { fails.push(`PIN-modul ${m.pack}: filen saknas`); continue }
  check(`PIN-modul ${m.pack}`, sha(p) === m.sha256, 'sha256 matchar inte manifestet — fail-closed')
  moduler.push({ ...m, text: readFileSync(p, 'utf8') })
}

// ---- Kärnans invarianter ---------------------------------------------------
const sektioner = [...karna.matchAll(/^\| (\d{1,2}) \| \*\*/gm)].map(m => Number(m[1]))
check('Ryggraden har 17 sektioner', sektioner.length === 17, `hittade ${sektioner.length}`)
check('Numreringen är 1..17 i ordning',
  sektioner.every((n, i) => n === i + 1), `fick [${sektioner.join(',')}]`)
// Versionsagnostisk inom MAJOR 3, men INTERN KONSISTENS krävs: kontrollradens version
// måste vara samma som den deklarerade. Drift mellan dem är det verkliga felet.
const kv = /KONTRAKTSVERSION: (\d+)\.(\d+)\.(\d+)/.exec(karna)
check('Kontraktsversionen deklarerad', !!kv, 'saknas')
check('Kontraktet står på MAJOR 3', !!kv && kv[1] === '3', `MAJOR ${kv ? kv[1] : '?'} — en MAJOR-bump är en egen ceremoni`)
check('Färskhetslagen finns', /radar → kandidat → verifiering → granskad promotion/.test(karna), 'saknas')
check('latest/main förbjuds explicit', /ALDRIG genom/.test(karna) && /latest\/main/.test(karna), 'saknas')
const krv = /RESEARCH-CONTROL v(\d+\.\d+\.\d+)/.exec(karna)
check('Kontrollraden definierad', !!krv, 'saknas')
check('Kontrollradens version är SAMMA som den deklarerade',
  !!kv && !!krv && krv[1] === `${kv[1]}.${kv[2]}.${kv[3]}`,
  `kontrollraden säger v${krv ? krv[1] : '?'}, deklarationen v${kv ? kv.slice(1).join('.') : '?'}`)
check('ODÖMBART blir aldrig grönt', /ODÖMBART blir aldrig grönt/i.test(karna), 'saknas')
check('Fakta ≠ strategi bevarad', /Fakta ≠ strategi/.test(karna), 'saknas')
check('[OSÄKER]-disciplinen bevarad', /\[OSÄKER\]/.test(karna), 'saknas')
check('Konflikter registreras aldrig tyst',
  /Konflikter registreras, aldrig tyst upplösta/.test(karna), 'saknas')

// ---- Skärpningslagen -------------------------------------------------------
for (const m of moduler) {
  // Manifestet och modultexten måste deklarera SAMMA kärnintervall. Ingen fallback:
  // en manifest-bump som texten inte följer med på är precis den drift vakten finns för.
  check(`Modul ${m.pack} deklarerar kärnintervall`,
    new RegExp(m.motKarna.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(m.text.replace(/\s+/g, ' ')),
    `manifestets motKarna (${m.motKarna}) står inte i modultexten — manifest och text har driftat isär`)
  check(`Modul ${m.pack} bär skärpningslagen`,
    /ENDAST SKÄRPA/.test(m.text), 'skärpningslagen saknas')
  check(`Modul ${m.pack} förskjuter inte universell numrering`,
    /numreringen förskjuts aldrig/i.test(m.text) && !/^\| (\d{1,2}) \| \*\*/m.test(m.text),
    'modulen använder universell sektionsnumrering')
  check(`Modul ${m.pack} numrerar i egen rymd`,
    /\*\*L1\*\*/.test(m.text), 'saknar L-numrering')
}

// ---- Kompositionsfallen ----------------------------------------------------
// Fall 1: LOKAL — känt paket, modulen aktiveras och skärper.
const lokal = moduler.find(m => m.pack === 'lokal-se')
check('FALL lokal: paketmodulen finns och är pinnad', !!lokal, 'lokal-se saknas i manifestet')
if (lokal) {
  check('FALL lokal: modulen skärper kontrollraden',
    /pack_module=\d+\.\d+\.\d+/.test(lokal.text), 'modulen tillför inget pack_module-fält')
  check('FALL lokal: telefon obligatoriskt (skärpning)',
    /[Tt]elefonnummer är OBLIGATORISKT/.test(lokal.text), 'skärpningen saknas')
}

// Fall 2: SaaS-HYPOTES — antaget paket får ALDRIG aktivera en modul.
check('FALL SaaS-hypotes: hypotesläget definierat i kärnan',
  /\*\*hypotes\*\*/.test(karna) && /antas men är inte belagt/i.test(karna), 'hypotesläget saknas')
check('FALL SaaS-hypotes: antagen bransch aktiverar aldrig modul',
  /antagen bransch aktiverar aldrig en paketmodul/i.test(karna), 'regeln saknas i kärnan')
// Ankarkrav (V4-läxan): en every()/some() över en TOM lista är vacuöst sann.
// Ankaret — att det finns minst en pinnad modul — bevisas därför FÖRE spärrkontrollerna.
check('Ankare: minst en paketmodul är pinnad', moduler.length > 0,
  'inga paketmoduler — hypotes- och skärpningskontrollerna vore vacuösa')
check('FALL SaaS-hypotes: modulen upprepar spärren',
  moduler.length > 0 && moduler.every(m => /ANTAGEN bransch kör `core-only`/i.test(m.text.replace(/\s+/g, ' '))),
  'minst en modul saknar hypotesspärren')
check('FALL SaaS-hypotes: inget SaaS-paket är pinnat',
  !pin.paketmoduler.some(m => /saas/i.test(m.pack)),
  'ett SaaS-paket är pinnat trots att inget är belagt')

// Fall 3: OSÄKER / CORE-ONLY — giltigt läge, aldrig ett fel.
check('FALL core-only: läget definierat', /\*\*core-only\*\*/.test(karna), 'saknas')
check('FALL core-only: uttryckligen GILTIGT läge',
  /GILTIGT läge, aldrig ett fel/.test(karna), 'core-only markeras inte som giltigt')
check('FALL core-only: kontrollraden stödjer "core-only"',
  /pack=<paket-id eller "core-only">/.test(karna), 'kontrollraden saknar core-only-värdet')
check('FALL core-only: OSÄKER blir aldrig nej',
  /inte `nej` och inte tomt/.test(karna), 'regeln saknas')

// Fall 4: BAKÅTKOMPATIBILITET — äldre filer förblir läsbara.
check('FALL bakåt: sektionsnumren deklarerade stabila',
  /Numreringen är STABIL/.test(karna), 'stabilitetslöftet saknas')
check('FALL bakåt: äldre fil tolkas aldrig om',
  /aldrig tolka om\s*\n?\s*en äldre fil|aldrig tolka om en äldre fil/.test(karna.replace(/\s+/g, ' ')),
  'regeln saknas')
check('FALL bakåt: saknade nyare fält blir OSÄKER',
  /saknade nyare fält som `OSÄKER`, aldrig som `nej`/.test(karna.replace(/\s+/g, ' ')),
  'regeln saknas')

// ---- Verdikt ---------------------------------------------------------------
for (const p of passes) console.log(`PASS: ${p}`)
if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`)
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} kontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} kompositions- och pinnkontroller`)
process.exit(0)
