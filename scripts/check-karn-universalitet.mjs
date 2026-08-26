#!/usr/bin/env node
// UNIVERSALITETSLAGEN: den universella kärnan får inte namnge en KUNDTYPS svar.
//
// Vakten föddes ur ett fynd. Masterplanens §26 Case B — B2B-SaaS-negativkontrollen — gick
// inte att fylla i utan tyst avvikelse, och orsaken var att kärnan själv bar lokala
// antaganden. Två av dem var precis det §26 namnger som fällor: `F-skatt` i den
// universella sektion 6, och `primaraktion`-enumet som ord för ord var lokal-se:s slutna
// mängd — så fällan "BOOK_DEMO must not turn into ring/offert" inte gick att spänna.
//
// FÖRSTA VERSIONEN AV DEN HÄR VAKTEN VAR VAKUÖS PÅ FYRA SÄTT, och en oberoende granskning
// visade det med nio överlevande mutationer av tolv. Rättningarna, var och en mot ett
// bevisat kringgående:
//
//   1. TERMFÖRBUD ERSATT AV RADPINNAR. Att förbjuda ord i ryggraden går inte att göra
//      tätt: `F‑skatt` med U+2011, `2-3 lokala` med ASCII-bindestreck och "precist antal"
//      för "EXAKT antal" återinförde hela den lokala regressionen med vakten grön.
//      Synonymjakt är ändlös. De fem universaliserade raderna pinnas i stället med
//      sha256 — varje ändring fäller tills pinnen uppdateras medvetet.
//   2. RYGGRADEN ÄR HELA FILEN MINUS CHANGELOGEN. Tidigare avgränsades den till
//      tabellrader, så sex bindande krav kunde skrivas som prosa under tabellen.
//   3. NÄRVARON I PAKETET PRÖVAS MOT SKÄRPNINGSTABELLENS RADER, inte mot filen. Kraven
//      kunde annars strykas ur modulen och överleva enbart i dess changelog — vilket är
//      en LÄTTNAD för den lokala kunden, exakt det vakten säger sig förbjuda.
//   4. ANKARET HASHAR VAKTENS EGEN KÄLLTEXT. En hash över kontrollnamn fäller INTE ett
//      utbytt predikat: namnet står kvar ordagrant medan villkoret blir `true`. Det felet
//      var redan bokfört och rättat i check-pack-contract.mjs — och återinfördes här.
//      `SATTS`-flyktluckan är borttagen; pinnen är obligatorisk.
//
// ÄRLIG GRÄNS: vakten prövar att FEM NAMNGIVNA RADER och tre profilkontraktsegenskaper
// står oförändrade. Att kärnan är universell i stort är INTE bevisat — och den är det
// bevisligen inte: INPUT GATE i `agents/project-planner.md` kräver fortfarande en ort,
// planners §7.4 bär F-skatt universellt och §7.5 en sluten lokal schemamängd. Se
// `B-T7a` i backtests/case-b-saas/FORVANTAT.md, som därför står DELVIS ÅTGÄRDAT.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

console.log('VAKT: check-karn-universalitet.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig

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
// Normalisering: unicode-bindestreck och kollapsade blanksteg. En mutation som bytte
// `F-skatt` mot `F‑skatt` (U+2011) passerade varje termkontroll.
const norm = (s) => s.replace(/[‐‑‒–—]/g, '-').replace(/\s+/g, ' ')

const passes = []
const fails = []
const check = (namn, ok, detalj) => (ok ? passes.push(namn) : fails.push(`${namn}: ${detalj}`))
const FORVANTAD_KALLHASH = 'a013150c169b4230'

const karna = las('skills/nortropic-plan/references/research-kontrakt-v3.md')
const modul = las('packs/lokal-se/research-module.md')
const stack = las('skills/nortropic-stack/SKILL.md')

// ---- 1. RADPINNAR: de fem universaliserade sektionerna ---------------------
// Pinne, inte termförbud. En pinne går inte att kringgå med en synonym.
const RADPINNAR = [
  ['1', 'd3d81549f20183dc'], ['5', '169e35e9e17d75f1'], ['6', '3b0f47e26368e230'],
  ['12', 'b77bf936c69e174b'], ['16', '3158886bd99697d8'],
]
const sektionRad = (nr) => {
  const m = new RegExp(`^\\| ${nr} \\| \\*\\*.+?\\*\\* \\|.*$`, 'm').exec(karna)
  return m ? m[0] : null
}
for (const [nr, pin] of RADPINNAR) {
  const rad = sektionRad(nr)
  if (!rad) odombart(`sektion ${nr} kunde inte läsas ur ryggraden — pinnen går inte att pröva`)
  const h = createHash('sha256').update(rad).digest('hex').slice(0, 16)
  check(`Ryggradens §${nr} är oförändrad mot sin pinne`, h === pin,
    `§${nr} har hash ${h}, pinnen säger ${pin} — raden är ändrad. Är ändringen en medveten universalisering uppdateras pinnen i samma commit; annars är ett kundtypsspecifikt krav på väg tillbaka in i kärnan`)
}

// ---- 2. RYGGRADEN = hela filen MINUS changelogen ---------------------------
// Tidigare avgränsades ryggraden till tabellrader, så bindande krav kunde skrivas som
// prosa under tabellen och passera.
const changelogStart = karna.indexOf('\n## Changelog')
check('Ankare: changelogen kunde avgränsas', changelogStart > 0, 'rubriken saknas — ryggraden går inte att avgränsa')
const ryggrad = norm(changelogStart > 0 ? karna.slice(0, changelogStart) : karna)
const TERMER = [
  ['F-skatt', /f-?\s?skatt/i], ['exakt antal omdömen', /(exakt|precist)\s+antal/i],
  ['person-först-arketypen', /person(en)?[- ]först/i], ['NAP', /\bNAP\b/],
  ['lokala konkurrenter', /2\s*-\s*3\s+lokala/i], ['namn+ort-attributionen', /namn\s*\+\s*ort/i],
]
for (const [vad, m] of TERMER) {
  check(`Ryggraden (hela filen utom changelogen) namnger INTE ${vad}`, !m.test(ryggrad),
    'termen står i kärnan — då är kärnan ett paket som kallar sig kärna, och varje icke-lokal kund tvingas svara med en förnekelse')
}

// ---- 3. NÄRVARON PRÖVAS MOT MODULENS SKÄRPNINGSTABELL ---------------------
// Mot HELA filen räckte changelogen som bevis, så kraven kunde strykas ur modulen och
// ändå passera — en lättnad för den lokala kunden.
const skarpTabell = /## Skärpningar av den universella kärnan([\s\S]*?)(?=^## )/m.exec(modul)
if (!skarpTabell) odombart('modulens skärpningstabell kunde inte avgränsas')
const skarp = norm(skarpTabell[1])
for (const [vad, m] of TERMER) {
  check(`Paketet lokal-se BÄR ${vad} i sin SKÄRPNINGSTABELL`, m.test(skarp),
    'kravet finns varken i kärnan eller i modulens kravrader — det är BORTTAPPAT, inte flyttat, och en lättnad som skärpningslagen förbjuder')
}

// ---- 4. Site Quality Contract v2 ------------------------------------------
const enumRad = /`primaraktion` \(typ `([^`]+)`/.exec(stack)
if (!enumRad) odombart('primaraktion-enumet kunde inte läsas')
const varden = [...enumRad[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
const LOKALA = ['ring', 'boka', 'platsforfragan', 'offert', 'besok']
check('Enumet bär minst en ICKE-lokal primärhandling', varden.some((v) => !LOKALA.includes(v)),
  `enumet är [${varden.join(', ')}] — §26 fälla 4 går då inte att spänna, eftersom kärnan inte har någon BOOK_DEMO att bli`)
check('Enumet bevarar samtliga fem lokala värden (additivt)',
  LOKALA.every((v) => varden.includes(v)), `saknar ${LOKALA.filter((v) => !varden.includes(v))}`)
check('Lead-ämnesradens ortsinterpolation är VILLKORAD',
  /ENDAST när en ort faktiskt är belagd/.test(stack), 'villkorslös interpolation ger en tom platshållare på varje lead')
check('schemaTyp har ingen lokal default',
  !/`schemaTyp` \(LocalBusiness-subtyp eller annan typ\)/.test(stack) && /ingen typ är default/.test(stack),
  'lokal typ först och allt annat som restkategori')

// ---- 5. Den kända, ännu ostängda halvan -----------------------------------
// Vakten får inte påstå mer än den bär: kontraktet är universaliserat, producenten inte.
check('Den ostängda halvan är utskriven i vaktens egen text',
  /INPUT GATE i `agents\/project-planner\.md` kräver fortfarande en ort/.test(
    readFileSync(fileURLToPath(import.meta.url), 'utf8')),
  'vakten döljer att kärnans PRODUCENT fortfarande stoppar en icke-lokal kund vid nod 2')

// ---- Verdikt: hash över VAKTENS EGEN KÄLLTEXT ------------------------------
// Hashen täcker VARJE rad; endast pinnens literal normaliseras. Formen som UTELÄMNADE
// rader som bar markören var ett bevisat kringgående: `process.exit(0) // FORVANTAD_KALLHASH = `
// föll ur hashen och avslutade vakten grön utan att pinnen rörde sig.
const kalltext = readFileSync(fileURLToPath(import.meta.url), 'utf8')
const PINNRAD = /^const FORVANTAD_KALLHASH = '[0-9a-f]{16}'$/m
if (!PINNRAD.test(kalltext)) odombart('pinndeklarationen har fel form — ankaret går inte att normalisera')
const egen = kalltext.replace(PINNRAD, "const FORVANTAD_KALLHASH = '<PINNE>'")
const kallhash = createHash('sha256').update(egen).digest('hex').slice(0, 16)
if (kallhash !== FORVANTAD_KALLHASH) {
  console.error(`ODÖMBART: vaktens källhash är ${kallhash}, förväntad ${FORVANTAD_KALLHASH} — vakten har redigerats. En hash över KONTROLLNAMN fäller inte ett utbytt predikat; den här hashar källtexten. Uppdatera pinnen medvetet i samma commit.`)
  process.exit(2)
}
for (const p of passes) console.log(`PASS: ${p}`)
if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`)
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} universalitetskontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} universalitetskontroller (källhash ${kallhash})`)
console.log('\nGRÄNS: fem pinnade rader och tre profilkontraktsegenskaper. Kärnans PRODUCENT är')
console.log('INTE universaliserad — INPUT GATE kräver en ort, planners §7.4 bär F-skatt och')
console.log('§7.5 en sluten lokal schemamängd. B-T7a är DELVIS ÅTGÄRDAT, inte stängt.')
process.exit(0)
