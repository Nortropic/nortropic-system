#!/usr/bin/env node
console.log('VAKT: check-forbattring.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig
// FÖRBÄTTRINGSKONTRAKTET — destinationen för en ROUTE som tidigare pekade i tomma luften.
//
// `case-d-migration/` bevisade att routningen fungerar: `FÖRBÄTTRA BEFINTLIG` ger `ROUTE`
// utan ägarberoende. Men `workflows/nortropic-autobygg.js` säger ordagrant
// *"förbättringslane saknas ännu"* — **destinationen fanns inte.** Att routa till något
// som inte är byggt är ett tyst löfte, och det är `D-GAP-2`.
//
// VAKTEN PRÖVAR FORMEN, INTE KÖRNINGEN. Ingen körbar lane finns (`FK-GAP-1`), och en grön
// körning här betyder INTE att en förbättring kan levereras. Den betyder att gränsen är
// skriven innan förmågan finns — vilket är den ordning som gör gränsen värd något.
//
// DEN VIKTIGASTE KONTROLLEN GÄLLER GLIDNINGEN MOT NYBYGGE. Frestelsen att bygga nytt och
// sätta redirects är stark: nybygget är det vi kan, och resultatet ser bättre ut i en
// före/efter-bild. Kostnaden syns först när placeringarna rör sig. Kontraktet måste därför
// bära en MEKANISK gräns — inte bara ett omdöme om vad som "känns som" ett nybygge.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

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
const FORVANTAD_KALLHASH = 'b1c18e26e70ed940'

const k = las('docs/forbattringskontrakt.md')
const wf = las('workflows/nortropic-autobygg.js')
const dFor = las('backtests/case-d-migration/FORVANTAT.md')

// ---- 1. Ankaret: kontraktet finns FÖR att routen pekade i tomma luften -----
check('Kontraktet ankras i autobyggs ROUTE-gren',
  /förbättringslane saknas ännu/.test(k) && /förbättringslane saknas ännu/.test(wf),
  'kontraktet och källan måste säga samma sak om att lanen saknas — annars är ankaret en efterhandskonstruktion')
check('Kontraktet ankras i `D-GAP-2`', /D-GAP-2/.test(k) && /D-GAP-2/.test(dFor),
  'luckan som motiverar kontraktet ska gå att slå upp')

// ---- 2. Lag 1: bevarandebördan ligger på FÖRÄNDRINGEN ---------------------
check('LAG 1 finns och lägger bördan på förändringen',
  /BEVARANDEBÖRDAN LIGGER PÅ FÖRÄNDRINGEN/.test(k),
  'ligger bördan på bevarandet blir varje ändring tillåten tills någon hinner invända')
check('LAG 1: frånvaro av skäl är ett NEJ',
  /Frånvaro av skäl är ett nej/.test(k),
  'utan den meningen blir tystnad ett ja, och tystnad är det vanligaste tillståndet')

// ---- 3. Bevarandelistan måste vara en TABELL med ändringsvillkor ----------
const bevaras = /\| Bevaras \| Varför \| Vad som krävs för att ändå ändra \|[\s\S]*?(?=\n## )/.exec(k)
check('Ankare: bevarandetabellen kunde läsas', !!bevaras, 'tabellen saknas')
if (bevaras) {
  const rader = bevaras[0].split('\n').filter((r) => /^\| \*\*/.test(r))
  check('Bevarandetabellen bär minst fem rader', rader.length >= 5,
    `${rader.length} rader — en kortare lista utelämnar något som går att förstöra`)
  const utanVillkor = rader.filter((r) => r.split('|').length < 5 || !r.split('|')[3].trim())
  check('Varje bevarad sak har ett UTTALAT ändringsvillkor', utanVillkor.length === 0,
    'en rad utan villkor är ett förbud utan väg framåt, och då kringgås det i stället för att följas')
  for (const [vad, m] of [
    ['URL:er som rankar', /URL:er som rankar/],
    ['domän och hänvisande domäner', /hänvisande domäner/],
    ['teknisk stack som håller sina mått', /stack som håller sina mått/],
  ]) check(`Bevarandelistan bär ${vad}`, m.test(bevaras[0]), 'saknas — och den går inte att återskapa om den förstörs')
  check('Domänen får ALDRIG ändras utan ägarbeslut',
    /Aldrig utan ägarbeslut/.test(bevaras[0]),
    'hänvisande domäner går inte att återskapa — det är den enda raden som inte får ha ett mekaniskt villkor')
}

// ---- 4. ALDRIG-listan, med totalbygget först -----------------------------
for (const [vad, m] of [
  ['totalbygge med redirects', /Totalbygge med redirects/],
  ['stackbyte utan uppmätt brist', /Stackbyte utan uppmätt brist/],
  ['URL-omstrukturering "för tydlighetens skull"', /URL-omstrukturering/],
  ['strykning av omätt innehåll', /Okänd trafik är inte noll trafik/],
]) check(`ALDRIG-listan bär "${vad}"`, m.test(k), 'raden saknas')
check('Totalbygget pekas ut som NY-SAJT-lanens ärende, inte förbättringens',
  /Det är ett nybygge, och\s*\n?\s*då gäller ny-sajt-lanen/.test(k),
  'utan den hänvisningen blir ett förklätt nybygge ett förbättringsärende utan eget mandat')

// ---- 5. Lag 2 + ordningen ------------------------------------------------
check('LAG 2: en förbättring utan eftermätning är en ÄNDRING',
  /EN FÖRBÄTTRING UTAN EFTERMÄTNING ÄR EN ÄNDRING/.test(k),
  'utan lagen räcker avsikten som bevis, och avsikt är inget mått')
check('LAG 2 förbjuder ordet även i offert och kundsamtal',
  /offert|kundsamtal/.test(k),
  'en lag som bara gäller rapporten lämnar säljsamtalet fritt, och där sägs det som stannar hos kunden')
const steg = [...k.matchAll(/^\d+\. \*\*(.+?)\*\*/gm)].map((m) => m[1])
check('Ordningen bär minst fem steg', steg.length >= 5, `${steg.length} steg`)
check('Ordningen BÖRJAR med att mäta före',
  /^Mät före/.test(steg[0] || ''),
  'utan utgångsvärde finns ingen förbättring — bara en förändring')
check('Ordningen kräver att BÅDA riktningarna rapporteras',
  /Rapportera BÅDE riktningarna/.test(k) && /utan försämringar är en rapport som inte letat/.test(flat(k)),
  'en rapport som bara bär förbättringar har inte letat efter försämringar')

// ---- 6. Gränsen mot nybygge måste vara MEKANISK -------------------------
check('Gränsen mot nybygge är MEKANISK, inte ett omdöme',
  /Mekanisk gräns/.test(k) && /fler än hälften av de rankande URL:erna/.test(k) && /byts stacken/.test(k),
  'en gräns som bara är ett omdöme flyttas av den som har bråttom — och glidningen mot nybygge är just det som går fort')
check('Och den gäller OAVSETT vad arbetet kallas',
  /oavsett vad det kallas/.test(k),
  'utan den frasen räcker det att döpa om arbetet för att passera gränsen')

// ---- 7. Luckorna: vakten får inte påstå att lanen finns ----------------
for (const id of ['FK-GAP-1', 'FK-GAP-2', 'FK-GAP-3'])
  check(`Luckan \`${id}\` är namngiven med nästa transition`,
    new RegExp(`^\\| \`${id}\` \\|.*\\|.*\\|$`, 'm').test(k), 'luckan saknas eller saknar transition')
check('Kontraktet säger UT att ingen körbar lane finns',
  /Ingen körbar förbättringslane finns/.test(k),
  'en läsare tror annars att en förbättring går att beställa')
check('Kontraktet skriver INGEN kapacitetsrad åt sig själv',
  /KAP-`-raden för förbättring finns inte/.test(k) && !/\| `KAP-FORBATTRING`/.test(las('docs/kapacitetskatalog.md')),
  'en kapacitetsrad utan förmåga är ett löfte fabriken inte kan hålla — och katalogen är §A9-yta')
check('Kontraktet avstår från affären (§A5)', /§A5/.test(k),
  'vad en förbättring kostar är ägarens, inte det här dokumentets')
check('Mätvärdenas andrahandskaraktär är erkänd',
  /kundens egna/.test(k) && /andrahandsuppgift/.test(k),
  'vi mäter inte själva — att tiga om det gör kundens siffra till vår')

// ---- Verdikt ---------------------------------------------------------------
const kalltext = readFileSync(fileURLToPath(import.meta.url), 'utf8')
const PINNRAD = /^const FORVANTAD_KALLHASH = '[0-9a-f]{16}'$/m
if (!PINNRAD.test(kalltext)) odombart('pinndeklarationen har fel form — ankaret går inte att normalisera')
const kallhash = createHash('sha256').update(kalltext.replace(PINNRAD, "const FORVANTAD_KALLHASH = '<PINNE>'")).digest('hex').slice(0, 16)
if (kallhash !== FORVANTAD_KALLHASH) {
  console.error(`ODÖMBART: vaktens källhash är ${kallhash}, förväntad ${FORVANTAD_KALLHASH} — vakten har redigerats. Uppdatera pinnen medvetet i samma commit.`)
  process.exit(2)
}
for (const p of passes) console.log(`PASS: ${p}`)
if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`)
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} förbättringskontraktskontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} förbättringskontraktskontroller (källhash ${kallhash})`)
console.log('\nVAD DETTA INTE BEVISAR: att en förbättring kan levereras. Ingen körbar lane finns')
console.log('(FK-GAP-1), ingen egen mätning finns (FK-GAP-2) och ingen eftermätning är')
console.log('automatiserad (FK-GAP-3) — så LAG 2 är i dag ett löfte, inte en grind.')
process.exit(0)
