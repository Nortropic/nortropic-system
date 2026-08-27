#!/usr/bin/env node
// TÄCKER: scripts/check-*.mjs
//
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

import { existsSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
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

// ---- NÄR KVITTENSRADEN INTE FÅR SKRIVAS: identitet UTIFRÅN i stället ---------
// EN VERKLIG KOLLISION MELLAN TVÅ SPÅR, funnen 2026-08-27. `scripts/check-invariants.mjs`
// är en REGISTRERAD VERIFIERARE i styrplanet: `controller/verify/register.json` pinnar den
// vid sha256, och dess not lyder *"uppdateras endast av MÄNNISKOHAND"*. Filen står dessutom
// i `docs/loop/byggplan-v3.md` §3.1:s §A-mängd.
//
// Att lägga kvittensraden i den filen — vilket den här körarens första version krävde —
// bröt registrets pinne och gjorde styrplanets loop fail-closed-bruten i ett dygn, utan att
// någon såg det. **Kravet på en kvittensrad var alltså en skrivning i någon annans låsta
// yta**, och det går inte att lösa genom att pinna om båda: då är människohandskravet bara
// en formulering.
//
// LÖSNINGEN ÄR ATT BEHÅLLA IAKTTAGELSEN UTIFRÅN MEN BYTA DESS FORM. Kvittensraden finns
// därför att *"ett program inte kan intyga att det fortfarande är sig självt"* — men en
// HASH räknad av köraren och jämförd mot ankarvaktens pinntabell är precis en sådan
// iakttagelse utifrån, och den kräver ingen skrivning i den vaktade filen.
//
// MÄNGDEN HÄRLEDS ur registret, aldrig handlistad: blir en annan vakt registrerad i
// styrplanet får den samma behandling automatiskt.
const EXTERNT_PINNADE = (() => {
  try {
    const reg = JSON.parse(readFileSync(join(ROT, 'controller/verify/register.json'), 'utf8'))
    return new Set(Object.values(reg.verifiers || {})
      .map((v) => v && v.path).filter((p) => typeof p === 'string' && p.startsWith('scripts/'))
      .map((p) => basename(p)))
  } catch { return null }   // null ≠ tom mängd: se ODÖMBART-grenen nedan
})()
if (EXTERNT_PINNADE === null) odombart('controller/verify/register.json går inte att läsa — mängden externt pinnade vakter är okänd, och att gissa den tomma vore att kräva en kvittensrad i en låst fil')

// Pinntabellen läses ur ankarvaktens KÄLLA. Saknas den kan identiteten inte fastställas
// utifrån för de externt pinnade vakterna — och då är körningen ODÖMBAR, aldrig grön.
const PINNAR_UTIFRAN = (() => {
  const kalla = existsSync(join(ROT, 'scripts/check-vaktankare.mjs'))
    ? readFileSync(join(ROT, 'scripts/check-vaktankare.mjs'), 'utf8') : ''
  const t = new Map()
  for (const m of kalla.matchAll(/^\s*'([a-z0-9._-]+\.mjs)':\s*'([0-9a-f]{16})',$/gm)) t.set(m[1], m[2])
  return t
})()

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
  // Externt pinnade vakter identifieras på sin HASH mot pinntabellen — en iakttagelse
  // utifrån som inte kräver att köraren skriver i en fil någon annan har låst.
  const kvitterad = EXTERNT_PINNADE.has(v)
    ? (PINNAR_UTIFRAN.get(v) === createHash('sha256').update(readFileSync(join(ROT, 'scripts', v), 'utf8')).digest('hex').slice(0, 16))
    : new RegExp(`^${signatur(v)}$`, 'm').test(ut)
  const kod = r.status
  let verdikt
  if (!kvitterad) {
    verdikt = EXTERNT_PINNADE.has(v)
      ? 'ODÖMBART (hash stämmer inte mot pinntabellen — identiteten går inte att fastställa utifrån)'
      : 'ODÖMBART (skrev inte sin signaturfras)'
    harOdombart = true
  }
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
