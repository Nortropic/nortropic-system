#!/usr/bin/env node
// BATTERIKÖRAREN: kör varje vakt och kräver att den identifierar SIG SJÄLV i sitt utfall.
//
// VARFÖR DEN HÄR FILEN FINNS — en verklig incident, inte ett tankeexperiment. Under bygget
// skrevs `check-vaktankare.mjs` av misstag över av en KOPIA av `check-invariants.mjs`. Den
// påträngande filen körde invariantgrindens kontroller, avslutade 0, och batteriet
// fortsatte grönt i flera steg. Ankarvaktens egen identitetskontroll räcker inte mot det
// felet: när filen ersätts försvinner kontrollen med den. **Ett program kan inte intyga
// att det fortfarande är sig självt.** Iakttagelsen måste komma utifrån.
//
// KONSTRUKTIONEN: varje vakt har en pinnad SIGNATURFRAS som bara den skriver ut. Skriver
// en vakt inte sin fras är körningen ODÖMBAR — aldrig grön — oavsett dess exitkod. En
// överskriven vakt skriver då någon annans banderoll och fälls.
//
// SIGNATURFRASERNAS UNIKHET PRÖVAS VID KÖRNING, inte vid författandet. Vore två fraser
// förväxlingsbara skulle en vakt kunna kvittera för en annan; kollisioner fäller.
//
// ÄRLIG GRÄNS — och den är verklig. Skrivs BÅDE den här filen och en vakt över i samma
// drag finns ingen mekanism kvar i repot som märker det. Regressen slutar hos en människa
// som läser diffen. Det den här filen köper är att EN korrupt fil alltid syns, vilket är
// den incident som faktiskt inträffade.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { existsSync } from 'node:fs'
import { execFileSync, spawnSync } from 'node:child_process'
import { join, basename } from 'node:path'

let ROT
try {
  ROT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
} catch {
  console.error('ODÖMBART: ingen git-topp — körning utanför repo vägras')
  process.exit(2)
}
const odombart = (skal) => { console.error(`ODÖMBART: ${skal}`); process.exit(2) }

// SIGNATUREN HÄRLEDS, den hand-kureras inte. Första formen bar en tabell med en
// distinktiv FRAS per vakt, och korsprovet fällde den på sin allra första körning:
// `Site Quality Contract` stod i en ANNAN vakts utfall. En handskriven fraslista driftar
// och kan dessutom vattnas ur — `'PASS'` kolliderar med ingen fras men skrivs av alla.
// Varje vakt skriver i stället `VAKT: <sitt eget filnamn>` som sin FÖRSTA utdatarad.
// Filnamn är unika per konstruktion, och en överskriven vakt skriver grannens namn.
const signatur = (v) => `VAKT: ${v}`

// ---- Vaktmängden: spårade OCH ospårade, korsad mot disk ---------------------
let filer
try {
  filer = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', 'scripts/'],
    { cwd: ROT, encoding: 'utf8' }).split('\n').filter(Boolean)
} catch {
  odombart('git ls-files misslyckades — vaktmängden går inte att avgränsa')
}
const vakter = [...new Set(filer.map((f) => basename(f)))]
  // Köraren kör VAKTER. `kor-*` är körare, inte vakter, och kvitteras i stället av
  // ankarvaktens pinntabell — annars skulle köraren köra sig själv.
  .filter((f) => /^check-.+\.mjs$/.test(f))
  .filter((f) => existsSync(join(ROT, 'scripts', f)))
  .sort()
if (vakter.length === 0) odombart('tom vaktmängd — en grön körning vore meningslös')

// Varje vakt måste KVITTERA. Det finns ingen lista att glömma en vakt ur.

// ---- Körning ---------------------------------------------------------------
const rader = []
let harFail = false
let harOdombart = false
for (const v of vakter) {
  const r = spawnSync(process.execPath, [join(ROT, 'scripts', v)], { cwd: ROT, encoding: 'utf8' })
  const ut = `${r.stdout || ''}${r.stderr || ''}`
  const kvitterad = new RegExp(`^${signatur(v)}$`, 'm').test(ut)
  const kod = r.status
  let verdikt
  if (!kvitterad) { verdikt = 'ODÖMBART (skrev inte sin signaturfras)'; harOdombart = true }
  else if (kod === 0) verdikt = 'PASS'
  else if (kod === 1) { verdikt = 'FAIL'; harFail = true }
  else { verdikt = `ODÖMBART (exit ${kod})`; harOdombart = true }
  rader.push([v, verdikt, ut])
}

// KORSPROV: ingen vakt får skriva en ANNAN vakts kvittensrad. Skulle en vakt eka en
// grannes namn vore kvittensen inte längre särskiljande, och en överskrivning skulle
// kunna kvittera för sig själv.
for (const [v, , ut] of rader) {
  for (const a of vakter) {
    if (a !== v && new RegExp(`^${signatur(a)}$`, 'm').test(ut)) {
      console.error(`ODÖMBART: ${v}:s utfall bär ${a}:s kvittensrad — kvittensen särskiljer inte`)
      process.exit(2)
    }
  }
}

for (const [v, d] of rader) console.log(`${d.startsWith('PASS') ? 'PASS' : d.startsWith('FAIL') ? 'FAIL' : 'ODÖM'}  ${v.padEnd(34)} ${d}`)

if (harOdombart) {
  console.error(`\nRESULTAT: ODÖMBART — minst en av ${vakter.length} vakter kunde inte bedömas. ODÖMBART blir aldrig grönt.`)
  process.exit(2)
}
if (harFail) {
  console.error(`\nRESULTAT: FAIL — ${rader.filter((r) => r[1] === 'FAIL').length} av ${vakter.length} vakter föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${vakter.length}/${vakter.length} vakter gröna och SJÄLVKVITTERADE`)
console.log('\nGRÄNS: körarna märker EN korrupt vakt. Skrivs både den här filen och en vakt')
console.log('över i samma drag finns ingen mekanism kvar i repot som ser det — regressen')
console.log('slutar hos en människa som läser diffen.')
process.exit(0)
