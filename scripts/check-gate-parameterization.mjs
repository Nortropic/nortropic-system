#!/usr/bin/env node
// S5: mekaniska kontroller för grindparameteriseringen — kategori-alias, Gate 5-delningen,
// reselinsen, den kontraktsmedvetna andra skeptikern, kontraktsfärskheten och de
// paketvillkorade handover-/cutover-stegen.
//
// SÄRSKILT: kontrollerar att §A3-invarianterna INTE rubbats. S5 rör §A3-yta med avsikt
// (HÖGRISK-batch), men fixloopens gräns, legal-exkluderingen, freshness-grinden och
// PASS/FAIL-algebran ska stå kvar exakt som de var.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

let ROT
try {
  ROT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
} catch {
  console.error('ODÖMBART: ingen git-topp — körning utanför repo vägras (aldrig gissad rot)')
  process.exit(2)
}
const las = (p) => {
  const f = join(ROT, p)
  if (!existsSync(f)) { console.error(`ODÖMBART: ankarfilen saknas — ${p}`); process.exit(2) }
  return readFileSync(f, 'utf8')
}

const launch = las('workflows/nortropic-launch.js')
const review = las('workflows/nortropic-review.js')
const cutover = las('workflows/nortropic-cutover.js')
const flat = (s) => s.replace(/\s+/g, ' ')
// Prompterna byggs av hopfogade template-literaler, så `` ` + ` `` bryter fraser mitt itu.
// Kontrollerna ska läsa den KOMPONERADE prompten, inte källkodens radbrytningar.
// ...och backticks inuti en template-literal är ESCAPADE (\\`), så de avescapas också.
const komponerad = (s) => flat(s.replace(/`\s*\+\s*`/g, '').replace(/\\`/g, '`'))

const fails = []
const passes = []
const check = (namn, ok, detalj) => (ok ? passes.push(namn) : fails.push(`${namn}: ${detalj}`))

// ---- §A3-INVARIANTER: måste stå kvar oförändrade ---------------------------
// Fixloopens gräns bor på TVÅ ställen (loopvillkoret och svep-/rapportvillkoret).
// En OR-regex över båda var VACUÖS: ändrades den ena matchade den andra ändå.
// Vi binder därför BÅDA, och fäller på varje avvikande gräns.
check('§A3: fixloopens loopvillkor är exakt `round < 3`',
  /while \(round < 3\)/.test(launch), 'loopvillkoret saknas eller har annan gräns')
check('§A3: fixloopens rapportvillkor är exakt `round >= 3`',
  /round >= 3/.test(launch), 'rapportvillkoret saknas eller har annan gräns')
check('§A3: ingen ANNAN rundgräns har smugit in',
  [...launch.matchAll(/round\s*(<|>=)\s*(\d+)/g)].every((m) => m[2] === '3'),
  `avvikande rundgränser: ${[...launch.matchAll(/round\s*(<|>=)\s*(\d+)/g)].map((m) => m[0]).filter((t) => !/3$/.test(t)).join(', ')}`)

// Legal-exkluderingen bor på FYRA ställen. En enda presenskontroll var vacuös:
// tas ett av dem bort matchar de övriga fortfarande. Vi kräver exakt antalet OCH
// namnger vad vart och ett skyddar, så en borttagning syns i felmeddelandet.
const legalSites = [...launch.matchAll(/g\.key !== 'legal'/g)].length
check('§A3: legal-exkluderingen finns på ALLA fyra ställen',
  legalSites === 4,
  `hittade ${legalSites} av 4 (fix-loopens filter, SWEEP_GATES, nonLegalPass, remainingRaw) — legal får aldrig fixas, svepas eller blockera automatiskt`)
check('§A3: freshness-grindens villkor orört',
  /if \(!fresh \|\| fresh\.status !== 'FRESH'\)/.test(launch),
  'freshness-grindens villkor saknas eller är urkopplat')
check('§A3: nonLegalPass-algebran är .every, aldrig .some',
  /const nonLegalPass = GATES\.filter\(g => g\.key !== 'legal'\)\.every\(g => gates\[g\.key\]\.status === 'PASS'\)/.test(launch),
  'PASS/FAIL-algebran ändrad — .some, eller ett predikat som inte kräver PASS, släpper igenom en röd grind')
check('§A3: PASS/FAIL-enumet orört',
  /status: \{ type: 'string', enum: \['PASS', 'FAIL'\] \}/.test(launch), 'statusenumet ändrat')
check('§A3: severity-enumet orört',
  /enum: \['CRITICAL', 'HIGH', 'MEDIUM'\]/.test(launch), 'severity-enumet ändrat')

// Meta: hur många §A3-vakter finns? Räknas ut, så beslutsloggen aldrig behöver gissa.
const a3Vakter = [...las('scripts/check-gate-parameterization.mjs').matchAll(/check\('§A3/g)].length
check('Meta: minst åtta §A3-vakter', a3Vakter >= 8, `bara ${a3Vakter}`)

// ---- Kategori-alias ---------------------------------------------------------
const enumMatch = /category: \{ type: 'string', enum: \[([^\]]+)\] \}/.exec(launch)
check('Ankare: kategorienumet kunde läsas', !!enumMatch, 'kategorienumet hittades inte')
const kategorier = enumMatch ? enumMatch[1].split(',').map((c) => c.trim().replace(/'/g, '')) : []
for (const k of ['technical', 'leadgen', 'visual', 'trust', 'seo', 'security', 'legal']) {
  check(`Universell kategori \`${k}\` bevarad`, kategorier.includes(k), 'kategorin togs bort')
}
check('Kategorin `journeys` tillagd', kategorier.includes('journeys'), 'reselinsen saknar kategori')
check('CATEGORY_ALIAS finns', /const CATEGORY_ALIAS = \{/.test(launch), 'aliasmappen saknas')
check('Paketlinser aliasar in på UNIVERSELL kategori',
  /'lokal-se:orter': 'seo'/.test(launch), 'lokal-se-aliaset saknas')
// Ankarkrav: varje aliasVÄRDE måste vara en universell kategori — annars vore aliaset
// en bakväg till en per-paket-mätstock, precis det §10 förbjuder.
const aliasBlock = /const CATEGORY_ALIAS = \{([\s\S]*?)\}/.exec(launch)
const aliasVarden = aliasBlock ? [...aliasBlock[1].matchAll(/: '([a-z]+)'/g)].map((m) => m[1]) : []
check('Ankare: aliasmappen har poster att pröva', aliasVarden.length > 0, 'inga aliasposter')
check('Alla aliasvärden är universella kategorier',
  aliasVarden.every((v) => kategorier.includes(v)),
  `okänt aliasmål: ${aliasVarden.filter((v) => !kategorier.includes(v)).join(', ')}`)
check('Ingen per-paket-rubrikauktoritet (§10)',
  /hitta ALDRIG på en ny kategori/.test(flat(launch)) && /No generated per-project|per-paket-mätstock|mätstock ingen granskat/.test(flat(launch)),
  'förbudet mot egna paketkategorier saknas')

// ---- Grindarna --------------------------------------------------------------
// FORMATKÄNSLIGT MED AVSIKT (fail-closed): mönstret kräver exakt ett blanksteg före
// `agentType`. Kolumnjusterar någon GATES-posterna — som autobygg.js redan gör i sin
// GATE_LENSES — försvinner grinden ur mängden och kontrollerna FÄLLER. Det är rätt
// riktning att fela åt, men en formaterare över launch.js ser då ut som en regression.
const grindar = [...launch.matchAll(/\{ key: '([a-z]+)',\s+agentType/g)].map((m) => m[1])
check('Ankare: grindarna kunde räknas', grindar.length >= 7, `hittade ${grindar.length}`)
for (const g of ['technical', 'leadgen', 'seo', 'visual', 'trust', 'security', 'legal']) {
  check(`Grinden \`${g}\` bevarad`, grindar.includes(g), 'grinden togs bort')
}
check('Reselinsen `journeys` finns som grind', grindar.includes('journeys'), 'reselinsen saknas')

// ---- Gate 5-delningen -------------------------------------------------------
// GRINDPOSTERNA ÄR ENRADIGA. En icke-girig `[\s\S]*?\n  },` sprang 25 kB förbi och
// gjorde elva kontroller region-vacuösa: en tömd reselins passerade 57/57 eftersom
// fraserna hittades i en HELT ANNAN grind. Vi scopar därför per RAD, och ankaret
// prövar att raden verkligen är just den grindens post.
const gateRad = (nyckel) =>
  launch.split('\n').find((r) => r.trimStart().startsWith(`{ key: '${nyckel}',`)) ?? ''
const seoGate = gateRad('seo')
const enKey = (rad) => [...rad.matchAll(/key: '/g)].length === 1
check('Ankare: seo-grinden avgränsad till EN rad med EN key',
  seoGate.length > 200 && enKey(seoGate),
  `seo-grindens rad är ${seoGate.length} tecken eller bär ${[...seoGate.matchAll(/key: '/g)].length} grindar`)
check('Gate 5 delad i universell kärna + paketlins',
  /GATE 5 ÄR DELAD/.test(seoGate) && /UNIVERSELL SEO-TEKNISK KÄRNA/.test(seoGate),
  'delningen saknas')
check('Universella kärnan gäller ALLTID oavsett paket',
  /gäller ALLTID, oavsett paket/.test(flat(seoGate)), 'kärnans ovillkorlighet saknas')
check('Paketlinsen körs ENDAST vid belagt paket',
  /körs ENDAST när paketet är belagt/.test(flat(seoGate)), 'villkoret saknas')
check('core-only: frånvaro av ortssidor är ALDRIG ett fynd',
  /frånvaron av ortssidor och lokala schemadelar KORREKT[\s\S]{0,60}ALDRIG som ett fynd/.test(flat(seoGate)),
  'core-only-regeln saknas i Gate 5')

// ---- Reselinsen -------------------------------------------------------------
const resGate = gateRad('journeys')
check('Ankare: reselinsen avgränsad till EN rad med EN key',
  resGate.length > 200 && enKey(resGate),
  `reselinsens rad är ${resGate.length} tecken eller bär ${[...resGate.matchAll(/key: '/g)].length} grindar`)
check('Reselinsen läser obligatoriskaResor och toppuppgifter',
  /obligatoriskaResor/.test(resGate) && /toppuppgifter/.test(resGate), 'kontraktsfälten saknas')
check('Reselinsen prövar VARJE resa end-to-end, inte bara primärhandlingen',
  /VARJE kontrakterad resa end-to-end[\s\S]{0,40}inte bara primärhandlingen/.test(flat(resGate)),
  'kravet saknas')
check('Reselinsen kräver riktig interaktion, inte utseende',
  /en resa som bara ser rätt ut\s*är inte prövad/i.test(flat(resGate)), 'kravet saknas')
check('v1-profil utan resor blockerar INTE (SAKNAS_I_V1)',
  /Saknas `obligatoriskaResor`[\s\S]{0,80}INTE ett fynd/.test(flat(resGate)) &&
  /SAKNAS_I_V1/.test(resGate),
  'bakåtkompatibiliteten saknas i reselinsen')
check('Reselinsen dubbelrapporterar inte primärhandlingen',
  /dubbelrapportera inte/.test(flat(resGate)), 'avgränsningen mot leadgen saknas')

// ---- Kontraktsfärskhet ------------------------------------------------------
check('Grindarna läser Site Quality Contract',
  /SITE QUALITY CONTRACT \(S5\)/.test(launch), 'kontraktsinstruktionen saknas')
check('Grindarna läser profile.ts som kontraktskälla',
  /läs FÖRST .content\/profile\.ts/.test(komponerad(launch)), 'kontraktskällan namnges inte')
check('`paket` avgör paketlinserna',
  /.paket. avgör vilka PAKETLINSER som gäller/.test(komponerad(launch)), 'paketstyrningen saknas')
check('forbjudnaPastaenden är facit för vad sajten aldrig får påstå',
  /forbjudnaPastaenden. är facit för vad sajten ALDRIG/.test(komponerad(launch)), 'regeln saknas')
check('Färskhet: annan MAJOR eller nyare stämpel rapporteras',
  /annan MAJOR än kontraktet[\s\S]{0,90}rapportera det som ett technical-fynd/.test(komponerad(launch)),
  'färskhetskontrollen saknas')
check('Färskhet: äldre samma-MAJOR-stämpel är GILTIG',
  /ÄLDRE men samma-MAJOR-stämpel är GILTIG/.test(komponerad(launch)), 'bakåtkompatibiliteten saknas')
check('Färskhet: saknade v2-fält är okända, aldrig tomma/falska',
  /SAKNAS_I_V1 och redovisas som okänt, ALDRIG som tomt eller falskt/.test(komponerad(launch)),
  'frånvarosemantiken saknas i grindinstruktionen')
check('core-only är ett giltigt läge i grindinstruktionen',
  /core-only, ett GILTIGT läge och aldrig ett fynd i sig/.test(komponerad(launch)), 'regeln saknas')

// ---- Andra skeptikern -------------------------------------------------------
check('Skeptiker 2 är KONTRAKTSMEDVETEN, inte hårdkodad sajttyp',
  /matter FOR THIS SITE PER ITS CONTRACT/.test(review) &&
  !/matter for a Swedish local-service lead-gen site/.test(review),
  'den hårdkodade "Swedish local-service"-linsen står kvar')
check('Skeptiker 2 läser kontraktets fält',
  /primaraktion, toppuppgifter, obligatoriskaResor, forbjudnaPastaenden/.test(review),
  'skeptikern namnger inte kontraktsfälten')
check('Skeptiker 2 uppfinner aldrig ett krav kontraktet saknar',
  /never invent a requirement the contract does not carry/.test(review), 'spärren saknas')
check('Skeptiker 1 orörd (faktisk sanning i koden)',
  /is this factually true in the code/.test(review), 'första skeptikerns lins ändrad')

// ---- Paketvillkorad handover/cutover ---------------------------------------
check('Handover: GBP/GSC-sektionerna är paketvillkorade',
  /PAKETVILLKORAT \(S5\)[\s\S]{0,200}core-only[\s\S]{0,60}UTELÄMNAS/.test(flat(launch)),
  'handover saknar paketvillkoret')
check('Handover: kärnsektionerna skrivs alltid',
  /är KÄRNA och skrivs alltid/.test(flat(launch)), 'kärnsektionerna sägs inte ut')
check('Cutover: paketvillkorade steg',
  /core-only[\s\S]{0,120}INTE tillämpliga/.test(flat(cutover)), 'cutover saknar paketvillkoret')
check('Cutover: kärnstegen gäller alltid',
  /kärnstegen[\s\S]{0,80}gäller alltid/.test(flat(cutover)), 'kärnstegen sägs inte ut')
check('Cutover gissar ALDRIG ett paket',
  /gissa ALDRIG ett paket/.test(flat(cutover)), 'fail-closed-regeln saknas')

// ---- Antalsdrift: prosan får aldrig påstå ett annat antal än koden kör -----
const ickeLegal = grindar.filter((g) => g !== 'legal').length
const antalsPastaenden = [...launch.matchAll(/(\d+) (?:parallel audit lenses|audit lenses in parallel)/g)].map((m) => Number(m[1]))
check('Ankare: antalspåståenden hittades i launch', antalsPastaenden.length >= 2,
  `hittade ${antalsPastaenden.length}`)
check('Prosan påstår rätt antal grindar',
  antalsPastaenden.every((n) => n === grindar.length),
  `koden kör ${grindar.length}, prosan säger [${antalsPastaenden}]`)
// FRÅNVAROBASERAD, inte närvarobaserad. En närvarokontroll ("finns raden 'alla sju'?")
// passerar när en ANDRA, felaktig rad står bredvid den rätta — exakt den vacuitetsklass
// som legal-exkluderingen led av. Vi letar därför efter ALLA antalspåståenden och fäller
// på varje som inte stämmer med koden.
const ORD = ['noll', 'en', 'två', 'tre', 'fyra', 'fem', 'sex', 'sju', 'åtta', 'nio', 'tio']
// OBS `\S+` och `u`-flaggan, inte `\w+`: JS:s `\w` är ASCII-ONLY, så `två` och `åtta`
// matchade aldrig — och `åtta` är det svenska ordet för DAGENS grindantal. Den mest
// naturliga formuleringen av rätt siffra var alltså osynlig för vakten.
// Formerna täcker bestämd form ("grindarna"), utelämnat "alla", och engelsk ordform.
const svepPastaenden = [
  ...launch.matchAll(/alla (\S+) icke-legal-grindar/gu),
  ...launch.matchAll(/alla (\S+) grindarna?\b/gu),
  ...launch.matchAll(/(\S+) icke-legal-grindar/gu),
].map((m) => m[1].toLowerCase())
  // Bara tokens som FAKTISKT är ett antal (siffra eller räkneord) räknas — annars
  // fångade det bredaste mönstret ordet "alla" och rapporterade det som fel antal.
  .filter((v) => /^\d+$/.test(v) || ORD.includes(v))
check('Ankare: svep-påståenden hittades', svepPastaenden.length > 0, 'inga att pröva')
const ratt = new Set([String(ickeLegal), ORD[ickeLegal]])
check('INGA felaktiga antalspåståenden om icke-legal-grindar',
  svepPastaenden.every((v) => ratt.has(v)),
  `koden kör ${ickeLegal}; prosan säger även [${svepPastaenden.filter((v) => !ratt.has(v))}]`)

// Samma disciplin för autobyggs prosa — den drev isär en gång och får inte göra det igen.
const abProsa = las('workflows/nortropic-autobygg.js')
const ORD_TILL_TAL = Object.fromEntries(ORD.map((o, i) => [o, i]))
const abAntal = [...abProsa.matchAll(/(\S+) linser/gu)]
  .map((m) => (/^\d+$/.test(m[1]) ? Number(m[1]) : ORD_TILL_TAL[m[1].toLowerCase()]))
  .filter((n) => Number.isInteger(n))
check('Ankare: autobyggs linsantal hittades i prosan', abAntal.length > 0, 'inga att pröva')

// ---- Autobygg-spegeln (obemannat läge får inte tappa linser) --------------
const autobygg = las('workflows/nortropic-autobygg.js')
const abEnum = /category: \{ type: 'string', enum: \[([^\]]+)\] \}/.exec(autobygg)
check('Ankare: autobyggs kategorienum kunde läsas', !!abEnum, 'enumet hittades inte i autobygg')
const abKategorier = abEnum ? abEnum[1].split(',').map((c) => c.trim().replace(/'/g, '')) : []
check('Autobyggs kategorienum är IDENTISKT med launchs',
  abKategorier.length === kategorier.length && abKategorier.every((k) => kategorier.includes(k)),
  `autobygg: [${abKategorier}] vs launch: [${kategorier}] — två oense definitioner av "universell och sluten"`)
const abLinser = /const GATE_LENSES = \[([\s\S]*?)\]/.exec(autobygg)?.[1] ?? ''
check('Autobyggs linsspegel innehåller journeys',
  /journeys/.test(abLinser), 'obemannat läge kör utan reselinsen — grinderna divergerar tyst')
const abLinsAntal = [...abLinser.matchAll(/\{ key: '/g)].length
check('Autobyggs prosa påstår rätt antal linser',
  abAntal.every((n) => n === abLinsAntal),
  `spegeln har ${abLinsAntal} linser; prosan säger [${abAntal.filter((n) => n !== abLinsAntal)}]`)

// ---- Verdikt ---------------------------------------------------------------
for (const p of passes) console.log(`PASS: ${p}`)
if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`)
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} kontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} grindparameteriseringskontroller`)
process.exit(0)
