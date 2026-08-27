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

/**
 * G5 — *provider family preference measured*. Rapporten ska redovisa utfall PER
 * LEVERANTÖRSFAMILJ, så en familjepreferens SYNS i stället för att gömmas i ett snitt.
 *
 * FÖRR PRÖVADES BARA FÄLTETS NÄRVARO. Ett fält som finns bevisar inte att mätningen
 * gjorts — en rapport med `Per leverantörsfamilj: <tomt>` uppfyllde bokstaven och
 * ingenting annat.
 *
 * TVÅ SÄTT ATT SE UT SOM EN MÄTNING UTAN ATT VARA DET, och båda fälls här:
 *   (a) ETT SNITT ÖVER FAMILJER. Lagens hela poäng är att en preferens inte får gömmas i
 *       ett medelvärde. Familjernas delverdikt sammanvägs därför genom `domslut`, som
 *       bevarar oenighet — aldrig genom ett medel.
 *   (b) EN ENDA FAMILJ. En "mätning per familj" över en familj mäter ingen preferens alls,
 *       men rapporten ser identisk ut. Det är samma tomma-mängd-fel som en tom kravmängd
 *       läst som frånvaro av krav, och det är den farligaste av de två eftersom den ser
 *       ut som ett resultat.
 *
 * En körning utan familjeetikett bucketas ALDRIG in i en default: en okänd familj är okänd,
 * och att gissa den vore att gissa sig till ett svar på just den fråga lagen ställer.
 */
export function familjeutfall(korningar) {
  if (!Array.isArray(korningar) || korningar.length === 0) {
    return { lage: 'ODÖMBART', skal: 'inga körningar — en tom mängd är aldrig en mätning', familjer: [] }
  }
  const utan = korningar.filter((k) => !k || typeof k.familj !== 'string' || !k.familj.trim())
  if (utan.length) {
    return { lage: 'ODÖMBART', familjer: [],
      skal: `${utan.length} körning(ar) saknar leverantörsfamilj — en okänd familj får aldrig bucketas in i en default, för det är att gissa svaret på den fråga lagen ställer` }
  }
  const per = new Map()
  for (const k of korningar) {
    if (!per.has(k.familj)) per.set(k.familj, [])
    per.get(k.familj).push(k.verdikt)
  }
  const familjer = [...per].map(([familj, roster]) => ({ familj, n: roster.length, ...domslut(roster) }))
    .sort((a, b) => a.familj.localeCompare(b.familj))
  if (familjer.some((f) => f.verdikt === 'ODÖMBART')) {
    return { lage: 'ODÖMBART', familjer, skal: 'minst en familj är ODÖMBAR — ODÖMBART smittar uppåt (G4)' }
  }
  if (familjer.length < 2) {
    return { lage: 'ODÖMBART', familjer,
      skal: `bara ${familjer.length} familj — en mätning PER familj över en familj mäter ingen preferens, men rapporten ser likadan ut` }
  }
  // Sammanvägningen går genom domslut, inte genom ett medel: skiljer familjerna sig åt är
  // det ett FYND, inte brus att jämna ut.
  const samlat = domslut(familjer.map((f) => f.verdikt))
  return { lage: 'MÄTT', familjer, ...samlat,
    preferens: samlat.verdikt === 'OENIG' ? 'FAMILJEPREFERENS SYNLIG — familjerna dömer olika' : 'ingen familjeskillnad i det här utfallet' }
}

/**
 * G2 — *deterministic evidence first*. Varje påstående ska först prövas deterministiskt;
 * en domare får åberopas ENDAST för det som inte går att avgöra så.
 *
 * FÖRR PRÖVADES BARA ATT RAPPORTEN BÄR ett deterministiskt led före varje domarled — alltså
 * ordningen i utskriften, inte ordningen i arbetet. Här prövas påståendena själva.
 *
 * DET FARLIGA FALLET ÄR (a): en domare åberopad för något som REDAN har ett deterministiskt
 * svar. Då finns två svar på samma fråga, och det är alltid det mjukare som citeras när
 * de skiljer sig. Ett `skal` krävs för varje domarled just därför — utan skäl går det inte
 * att skilja "gick inte att avgöra deterministiskt" från "frågade en domare i stället".
 */
export function bevisordning(pastaenden) {
  if (!Array.isArray(pastaenden) || pastaenden.length === 0) {
    return { lage: 'ODÖMBART', skal: 'inga påståenden — en tom mängd är aldrig ett rent resultat', fynd: [] }
  }
  const fynd = []
  for (const p of pastaenden) {
    const id = (p && p.id) || '<namnlöst>'
    const det = p && p.deterministiskt
    const dom = p && p.domare
    if (det && dom) {
      fynd.push({ id, typ: 'domare-på-avgjort',
        text: `${id} har BÅDE ett deterministiskt utfall och ett domarutfall — två svar på samma fråga, och det mjukare citeras när de skiljer sig` })
    } else if (!det && !dom) {
      fynd.push({ id, typ: 'oprövat', text: `${id} har varken deterministiskt utfall eller domarutfall — oprövat, aldrig grönt` })
    } else if (!det && dom && !(typeof p.skal === 'string' && p.skal.trim().length >= 10)) {
      fynd.push({ id, typ: 'domare-utan-skäl',
        text: `${id} avgjordes av en domare utan angivet skäl — utan skäl går "gick inte att avgöra deterministiskt" inte att skilja från "frågade en domare i stället"` })
    }
  }
  return { lage: fynd.length ? 'FÄLLD' : 'ORDNING HÅLLEN', fynd,
    deterministiska: pastaenden.filter((p) => p && p.deterministiskt && !p.domare).length,
    domarledda: pastaenden.filter((p) => p && !p.deterministiskt && p.domare).length }
}

/**
 * G11 — *promotion uses normal owner/trust path*. Gymmet BEFORDRAR ALDRIG; rapporten är ett
 * förslag i det vanliga flödet.
 *
 * FÖRR PRÖVADES BARA ATT KONTRAKTET saknar befordransväg — aldrig att en KÖRNING avstår.
 * Ett kontrakt utan väg hindrar inte en rapport från att bära en befordran ändå.
 *
 * Kontrollen är därför på RAPPORTEN: bär den ett befordransformat fält, eller en status
 * över taket, är befordran gjord oavsett vad kontraktet säger. Fältnamnen är slutna åt båda
 * språken, eftersom `promoted: true` är precis lika mycket en befordran som `befordrad`.
 */
const BEFORDRANSFALT = ['befordrad', 'befordran', 'promoted', 'promotion', 'godkand', 'approved', 'signoff']
export function rapportform(rapport) {
  if (!rapport || typeof rapport !== 'object') {
    return { lage: 'ODÖMBART', skal: 'ingen rapport att pröva — frånvaro är aldrig ett rent resultat' }
  }
  const bar = BEFORDRANSFALT.filter((f) => Object.prototype.hasOwnProperty.call(rapport, f) && rapport[f])
  if (bar.length) {
    return { lage: 'FÄLLD', skal: `rapporten bär befordransfält: ${bar.join(', ')} — gymmet befordrar aldrig, oavsett vad kontraktet säger` }
  }
  const tak = befordran().tak
  // ORDNINGEN SPELAR ROLL, och kontrollprovet fällde den första versionen på det: `PROVEN`
  // låg efter okänd-status-grenen och klassades som ODÖMBART i stället för FÄLLD. Båda är
  // icke-gröna, men skillnaden är hela poängen — ODÖMBART betyder "gick inte att avgöra",
  // och en rapport som uttryckligen PÅSTÅR PROVEN är avgjord: den är fälld.
  if (rapport.status === 'PROVEN') {
    return { lage: 'FÄLLD', skal: 'rapporten påstår PROVEN — syntetisk evidens bär aldrig dit (G7)' }
  }
  const KANDA_STATUS = VERDIKT.concat(['TORRKÖRNING', 'VALIDATING'])
  if (rapport.status && rapport.status !== tak && KANDA_STATUS.indexOf(rapport.status) === -1) {
    return { lage: 'ODÖMBART', skal: `okänd status ${JSON.stringify(rapport.status)} — ett okänt värde får aldrig falla tillbaka på den lösare vägen` }
  }
  return { lage: 'FÖRSLAG', skal: `rapporten är ett förslag; taket är ${tak} och befordran går ägarvägen` }
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

    // ---- G5: familjemätningen måste kunna säga NEJ ----
    ['G5: TVÅ familjer som dömer OLIKA ger SYNLIG preferens, aldrig ett snitt',
      (() => { const r = familjeutfall([{ familj: 'a', verdikt: 'PASS' }, { familj: 'b', verdikt: 'FAIL' }])
        return r.lage === 'MÄTT' && r.verdikt === 'OENIG' && /FAMILJEPREFERENS SYNLIG/.test(r.preferens) })()],
    ['G5: EN ENDA familj ⇒ ODÖMBART — mäter ingen preferens fast rapporten ser likadan ut',
      familjeutfall([{ familj: 'a', verdikt: 'PASS' }, { familj: 'a', verdikt: 'PASS' }]).lage === 'ODÖMBART'],
    ['G5: körning UTAN familjeetikett ⇒ ODÖMBART, aldrig bucketad i en default',
      familjeutfall([{ familj: 'a', verdikt: 'PASS' }, { verdikt: 'PASS' }]).lage === 'ODÖMBART'],
    ['G5: tom mängd ⇒ ODÖMBART', familjeutfall([]).lage === 'ODÖMBART'],
    ['G5: ODÖMBART i EN familj smittar uppåt',
      familjeutfall([{ familj: 'a', verdikt: 'ODÖMBART' }, { familj: 'b', verdikt: 'PASS' }]).lage === 'ODÖMBART'],
    ['G5: två SAMSTÄMMIGA familjer är MÄTT utan preferens — lagen kan säga ja också',
      (() => { const r = familjeutfall([{ familj: 'a', verdikt: 'PASS' }, { familj: 'b', verdikt: 'PASS' }])
        return r.lage === 'MÄTT' && r.verdikt === 'PASS' && !/SYNLIG/.test(r.preferens) })()],

    // ---- G2: bevisordningen måste kunna säga NEJ ----
    ['G2: domare åberopad för något REDAN deterministiskt avgjort ⇒ FÄLLD',
      bevisordning([{ id: 'p1', deterministiskt: 'PASS', domare: 'PASS' }]).fynd.some((f) => f.typ === 'domare-på-avgjort')],
    ['G2: påstående utan BÅDE deterministik och domare ⇒ oprövat, aldrig grönt',
      bevisordning([{ id: 'p1' }]).fynd.some((f) => f.typ === 'oprövat')],
    ['G2: domarled UTAN skäl ⇒ FÄLLD — skälet skiljer "gick inte" från "frågade i stället"',
      bevisordning([{ id: 'p1', domare: 'PASS' }]).fynd.some((f) => f.typ === 'domare-utan-skäl')],
    ['G2: domarled MED skäl passerar — lagen kan säga ja också',
      bevisordning([{ id: 'p1', domare: 'PASS', skal: 'kräver smakomdöme, inget exit-värde finns' }]).lage === 'ORDNING HÅLLEN'],
    ['G2: rent deterministiskt påstående passerar',
      bevisordning([{ id: 'p1', deterministiskt: 'PASS' }]).lage === 'ORDNING HÅLLEN'],
    ['G2: tom mängd ⇒ ODÖMBART', bevisordning([]).lage === 'ODÖMBART'],

    // ---- G11: rapportformen måste kunna säga NEJ ----
    ['G11: rapport med `befordrad` ⇒ FÄLLD', rapportform({ befordrad: true }).lage === 'FÄLLD'],
    ['G11: rapport med engelskt `promoted` ⇒ FÄLLD — språket byter inget',
      rapportform({ promoted: true }).lage === 'FÄLLD'],
    ['G11: rapport som påstår PROVEN ⇒ FÄLLD', rapportform({ status: 'PROVEN' }).lage === 'FÄLLD'],
    ['G11: OKÄND status ⇒ ODÖMBART, aldrig den lösare vägen',
      rapportform({ status: 'nästan-klar' }).lage === 'ODÖMBART'],
    ['G11: ren rapport är ett FÖRSLAG — lagen kan säga ja också',
      rapportform({ status: 'ODÖMBART' }).lage === 'FÖRSLAG'],
    ['G11: ingen rapport alls ⇒ ODÖMBART', rapportform(null).lage === 'ODÖMBART'],
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

console.log(`\nDeterministiska led: budgetgrind · budgetutfall · domslut · befordran · familjeutfall · bevisordning · rapportform — samtliga körda`)
console.log(`Domarled: <EJ KÖRT — kräver modelladapter>`)

// G5/G2/G11 ANROPAS PÅ TORRKÖRNINGENS EGNA DATA, inte bara i kontrollprovet. En lag som
// bevisats kunna fälla men aldrig anropas är död kod — samma kopplingskrav som överallt
// annars. Torrkörningen har noll körningar och noll påståenden, och lagarna svarar då
// ODÖMBART. Det är rätt svar: en tom mängd är aldrig en mätning.
const g5 = familjeutfall([])
console.log(`Per leverantörsfamilj: ${g5.lage} — ${g5.skal}`)
console.log(`    (G5 är MEKANISK: två familjer som dömer olika ger SYNLIG preferens; EN familj ger`)
console.log(`     ODÖMBART, för en mätning per familj över en familj mäter ingen preferens)`)
const g2 = bevisordning([])
console.log(`Bevisordning: ${g2.lage} — ${g2.skal}`)
console.log(`    (G2 är MEKANISK: en domare åberopad för något REDAN deterministiskt avgjort FÄLLS,`)
console.log(`     och ett domarled utan skäl FÄLLS — utan skäl går "gick inte" inte att skilja`)
console.log(`     från "frågade en domare i stället")`)
const g11 = rapportform({ status: 'ODÖMBART', kandidat: null, baslinje: null })
console.log(`Rapportform: ${g11.lage} — ${g11.skal}`)
console.log(`    (G11 är MEKANISK: den här körningens EGEN rapport prövas mot befordransfält,`)
console.log(`     på båda språken, och mot ett PROVEN-påstående)`)
if (g11.lage !== 'FÖRSLAG') { console.error(`ODÖMBART: torrkörningens egen rapport är inte ett förslag — ${g11.skal}`); process.exit(2) }
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
