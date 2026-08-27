#!/usr/bin/env node
console.log('VAKT: kor-gym.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig
// GYMKÖRAREN — budgetlagarna som KOD, och en torrkörning som inte kostar något.
//
// `GYM-GAP-1` sa: *"Ingen runner. Kontraktet beskriver rapportformen, inget producerar
// den."* Nästa transition var *"ägarbeslut om budgettak, sedan en runner"*. **Den
// ordningen var fel, och det är hela poängen med den här filen:** budgeten behövdes bara
// för de led som ANROPAR modeller. Allt annat — rapportformen, budgetlagarna, verdikt-
// algebran, oenighetsbevarandet — går att bygga och PRÖVA för noll kronor.
//
// VAD SOM ÄR BYGGT: G1 (mätstockar läses aldrig skrivs), G4 (oenighet bevaras, aldrig
// medelvärde), G7 (aldrig PROVEN), G9 (tak satt FÖRE start), G10 (uttömd budget ⇒
// ODÖMBART). Var och en med ett kontrollprov som tvingar lagen att bevisa att den FÄLLER.
//
// VAD SOM INTE ÄR BYGGT: modelladaptern. `--budget` utan adapter gör ingenting — och
// scriptet säger det i klartext i stället för att låtsas. **En runner som påstår sig kunna
// köra men inte kan är värre än ingen runner**, eftersom den flyttar felet från "saknas"
// till "verkar fungera".
//
// KOSTNADEN ÄR NOLL I ALLA LÄGEN SOM GÅR ATT KÖRA I DAG. Torrkörningen gör inga anrop.
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

/* ─────────── BUDGETLAGARNA — rena funktioner, prövbara utan anrop ─────────── */

export const VERDIKT = ['PASS', 'FAIL', 'OENIG', 'ODÖMBART']

/**
 * G9 — *bounded budget*. Taket ska vara satt FÖRE start.
 * Fail-closed i tre riktningar: saknat tak, icke-numeriskt tak och negativt tak är alla
 * OKLASSIFICERADE. **Noll är ett GILTIGT tak** och betyder torrkörning — inte "obegränsat".
 * Att låta ett saknat tak betyda obegränsat vore att göra glömska till den dyraste vägen.
 */
export function budgetgrind(tak) {
  if (tak === undefined || tak === null) return { ok: false, lage: 'ODÖMBART', skal: 'inget budgettak satt före start — G9' }
  if (typeof tak !== 'number' || !Number.isFinite(tak)) return { ok: false, lage: 'ODÖMBART', skal: `taket är inte ett tal (${JSON.stringify(tak)}) — oklassificerat` }
  if (tak < 0) return { ok: false, lage: 'ODÖMBART', skal: `negativt tak (${tak}) — oklassificerat` }
  if (tak === 0) return { ok: true, lage: 'TORRKÖRNING', skal: 'tak 0 — inga modellanrop görs, kostnaden är noll' }
  return { ok: true, lage: 'SKARP', skal: `tak ${tak} anrop` }
}

/**
 * G10 — *budget exhaustion ≠ PASS*. Slut budget ger ODÖMBART, aldrig PASS och aldrig FAIL.
 * Den andra halvan är lika viktig: **uttömd budget får inte heller bli FAIL**, för då
 * skulle en dyr kandidat se sämre ut än en billig utan att någon mätt kvalitet.
 */
export function budgetutfall(tak, forbrukat, delverdikt) {
  if (forbrukat >= tak && tak > 0) {
    return { verdikt: 'ODÖMBART', skal: `budgeten uttömd (${forbrukat}/${tak}) — G10: aldrig PASS, aldrig FAIL` }
  }
  return { verdikt: delverdikt, skal: `inom budget (${forbrukat}/${tak})` }
}

/**
 * G4 — *disagreement preserved, not averaged away*. Två domare som är oense ger OENIG.
 * Ingen medelvärdesberäkning, ingen majoritet: **två av tre är fortfarande oenighet.**
 */
export function domslut(roster) {
  if (!Array.isArray(roster) || roster.length === 0) return { verdikt: 'ODÖMBART', skal: 'inga röster' }
  const unika = [...new Set(roster)]
  if (unika.some((v) => !VERDIKT.includes(v))) return { verdikt: 'ODÖMBART', skal: `okänt delverdikt: ${unika.filter((v) => !VERDIKT.includes(v))}` }
  if (unika.includes('ODÖMBART')) return { verdikt: 'ODÖMBART', skal: 'minst en domare kunde inte avgöra — ODÖMBART smittar uppåt' }
  if (unika.length === 1) return { verdikt: unika[0], skal: `samstämmigt (${roster.length} röster)` }
  return { verdikt: 'OENIG', skal: `${unika.join(' vs ')} — bevarad oenighet, aldrig medelvärde` }
}

/**
 * G7 — *synthetic evidence never yields PROVEN*. Gymmet kan aldrig lyfta något över
 * VALIDATING. Funktionen finns för att lyftet ska vara en RETUR och inte en konvention.
 */
export function befordran() {
  return { tillaten: false, tak: 'VALIDATING', skal: 'G7 — syntetisk evidens bär aldrig till PROVEN; befordran går den vanliga ägarvägen (G11)' }
}

/* ─────────── KONTROLLPROV: varje lag måste bevisa att den FÄLLER ─────────── */

function sjalvprov() {
  const p = [
    ['G9: saknat tak ⇒ ODÖMBART MED RÄTT SKÄL', budgetgrind(undefined).lage === 'ODÖMBART' &&
      /inget budgettak satt före start/.test(budgetgrind(undefined).skal)],
    ['G9: icke-numeriskt tak ⇒ ODÖMBART', budgetgrind('mycket').lage === 'ODÖMBART'],
    ['G9: negativt tak ⇒ ODÖMBART', budgetgrind(-1).lage === 'ODÖMBART'],
    ['G9: tak 0 är GILTIGT och betyder torrkörning', budgetgrind(0).lage === 'TORRKÖRNING'],
    ['G9: positivt tak ger skarpt läge', budgetgrind(50).lage === 'SKARP'],
    ['G10: uttömd budget ⇒ ODÖMBART, aldrig PASS', budgetutfall(10, 10, 'PASS').verdikt === 'ODÖMBART'],
    ['G10: uttömd budget ⇒ ODÖMBART, aldrig FAIL', budgetutfall(10, 12, 'FAIL').verdikt === 'ODÖMBART'],
    ['G10: inom budget lämnar delverdiktet orört', budgetutfall(10, 3, 'PASS').verdikt === 'PASS'],
    ['G4: samstämmighet bevaras', domslut(['PASS', 'PASS']).verdikt === 'PASS'],
    ['G4: oenighet ⇒ OENIG, aldrig medelvärde', domslut(['PASS', 'FAIL']).verdikt === 'OENIG'],
    ['G4: två av tre är FORTFARANDE oenighet', domslut(['PASS', 'PASS', 'FAIL']).verdikt === 'OENIG'],
    ['G4: ODÖMBART smittar uppåt', domslut(['PASS', 'ODÖMBART']).verdikt === 'ODÖMBART'],
    ['G4: okänt delverdikt ⇒ ODÖMBART', domslut(['PASS', 'BRA']).verdikt === 'ODÖMBART'],
    ['G7: befordran är ALDRIG tillåten', befordran().tillaten === false && befordran().tak === 'VALIDATING'],
    ['Verdiktmängden bär OENIG och ODÖMBART men INTE PROVEN',
      VERDIKT.includes('OENIG') && VERDIKT.includes('ODÖMBART') && !VERDIKT.includes('PROVEN')],
  ]
  return p
}

/* ─────────── G1: mätstockarna LÄSES, aldrig skrivs ─────────── */

const MATSTOCKAR = ['tests/fixtures/eval-baseline.md', 'tests/fixtures/plan-baseline.md', 'tests/fixtures/template-baseline.md']

/* ─────────── Körning ─────────── */

const arg = (n) => {
  const i = process.argv.indexOf(n)
  return i >= 0 ? process.argv[i + 1] : undefined
}
const rawTak = arg('--budget')
const tak = rawTak === undefined ? 0 : Number(rawTak)

if (process.argv.includes('--sjalvprov')) {
  const prov = sjalvprov()
  for (const [namn, ok] of prov) console.log(`${ok ? 'PASS' : 'FAIL'}: självprov — ${namn}`)
  const fel = prov.filter(([, ok]) => !ok)
  if (fel.length) { console.error(`\nODÖMBART: ${fel.length} av ${prov.length} budgetlagar klarar inte sitt eget kontrollprov`); process.exit(2) }
  console.log(`\nRESULTAT: PASS — ${prov.length}/${prov.length} budgetlagar fäller där de ska`)
  process.exit(0)
}

const g9 = budgetgrind(rawTak === undefined ? 0 : tak)
if (!g9.ok) odombart(`${g9.skal}. Sätt --budget <antal anrop>; 0 är giltigt och betyder torrkörning.`)

console.log(`\nGYM-RAPPORT (torrkörning)`)
console.log(`Budget: ${tak} anrop  Förbrukat: 0  Status: ${g9.lage}  Kostnad: 0`)
console.log(`Kandidat: <ingen — modelladaptern är inte byggd>`)
console.log(`Baslinje: <ingen>\n`)

// G1: mätstockarna läses. Att de FINNS och går att läsa är prövbart; att de inte SKRIVS
// följer av att den här filen inte har någon skrivväg alls.
const saknade = MATSTOCKAR.filter((m) => !existsSync(join(ROT, m)))
console.log(`G1  mätstockar: ${MATSTOCKAR.length - saknade.length}/${MATSTOCKAR.length} läsbara${saknade.length ? ` — SAKNAS: ${saknade.join(', ')}` : ''}`)
console.log(`    (§A6 människoägda; den här filen har ingen skrivväg — G1 hålls av konstruktion, inte av löfte)`)

const prov = sjalvprov()
const felProv = prov.filter(([, ok]) => !ok)
console.log(`G4/G7/G9/G10  budgetlagarna: ${prov.length - felProv.length}/${prov.length} kontrollprov gröna`)

console.log(`\nDeterministiska led: budgetgrind · budgetutfall · domslut · befordran — samtliga körda`)
console.log(`Domarled: <EJ KÖRT — kräver modelladapter>`)
console.log(`Per leverantörsfamilj: <EJ KÖRT>`)
console.log(`Oenigheter: <inga röster att bevara i en torrkörning>`)
console.log(`Osynliggjorda mått: <EJ TILLÄMPLIGT — inga mått exponerades för någon kandidat>`)
console.log(`Modellkandidatregeln: led 1 EJ KÖRT · led 2 ODÖMBART (held-out saknas, GYM-GAP-2) · led 3 EJ KÖRT · led 4 EJ KÖRT`)
console.log(`VERDIKT: ODÖMBART   — aldrig PROVEN, aldrig en befordran`)

console.log(`\nVAD DEN HÄR KÖRNINGEN FAKTISKT BEVISAR: att budgetlagarna FÄLLER där de ska,`)
console.log(`och att rapportformen går att producera. Ingenting om någon modell.`)
console.log(`\nVAD SOM SAKNAS FÖR EN SKARP KÖRNING — och det är INTE bara pengar:`)
console.log(`  1. MODELLADAPTERN är inte byggd. Utan den gör --budget ingenting.`)
console.log(`  2. HELD-OUT-REPOT finns inte (GYM-GAP-2), så led 2 förblir ODÖMBART`)
console.log(`     även med obegränsad budget. En tredjedel av bevisningen saknas.`)
console.log(`  3. Ett tak i kronor, satt av ägaren. Taket i anrop finns som parameter.`)
console.log(`\nBUDGETEN VAR ALDRIG DET SOM BLOCKERADE MEST. Punkt 2 kostar ingenting att`)
console.log(`inse och kan inte köpas bort.`)
process.exit(2)
