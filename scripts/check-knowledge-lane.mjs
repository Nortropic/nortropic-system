#!/usr/bin/env node
// K0–K3: mekaniska kontroller för kunskapsbanan — styrning, källregister,
// anspråksstege/mallar och radar v1.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.
// Ankarkrav: en tom träffmängd är PASS endast om ankaret först bevisats.

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

const banan = las('docs/kunskapsbanan.md')
const kontrakt = las('skills/nortropic-retro/references/kunskapskontrakt.md')
let reg
try {
  reg = JSON.parse(las('config/kallregister.json'))
} catch (e) {
  console.error(`FAIL: källregistret är inte giltig JSON — ${e.message}`)
  process.exit(1)
}
const flat = (s) => s.replace(/\s+/g, ' ')
// Prosaregler ska matcha MENINGEN, inte markdown-emfasen. Utan detta föll två
// kontroller på att texten bar `**` respektive backticks — regeln fanns, mönstret
// läste layouten. En kontroll som fäller på fetstil vaktar fel sak.
const ren = (s) => flat(s).replace(/[*`]/g, '')

const fails = []
const passes = []
const check = (namn, ok, detalj) => (ok ? passes.push(namn) : fails.push(`${namn}: ${detalj}`))

// ---- K0: styrningen ---------------------------------------------------------
check('Banan är PROPOSE-ONLY', /Kunskapsbanan skriver aldrig i en standard/.test(flat(banan)),
  'grundlagen saknas')
check('Propose-only motiveras, inte bara påstås',
  /uppströmsändring tyst blir vår policy/.test(flat(banan)), 'motiveringen saknas')
check('nortropic-knowledge är RÅDGIVANDE BAKLAND, aldrig körauktoritet',
  /rådgivande bakland, ALDRIG körauktoritet/i.test(ren(banan)) &&
  /aldrig konsulteras av en grind, en agent eller ett bygge vid körning/.test(ren(banan)) &&
  !/(FÅR|får) konsultera[\s\S]{0,40}vid körning/.test(ren(banan)),
  'hinterland-regeln saknas eller är upphävd av en motsatt mening')
check('Auktoritet är frågeberoende — ingen falsk totalordning',
  /Auktoritet är frågeberoende/.test(flat(banan)) && /ingen falsk totalordning|Det finns ingen falsk totalordning/.test(flat(banan)),
  'regeln saknas')
check('Ägarens ensak är uppräknad', /Vad som är ägarens ensak/.test(banan), 'K0-tabellen saknas')
// B2/B3: vitlistan och förbudslistan avgränsas som EGNA block. Tidigare testades
// `banan.includes(yta)` — närvaro var som helst i filen. Att flytta konstitutionen
// FRÅN förbudslistan IN i vitlistan passerade då 71/71, och att radera hela
// vitlistan passerade också. En kontroll som inte vet vilken lista en yta står i
// vaktar ingenting.
// C3: ALLA TILLÅTET-block skannas, inte bara det första — ett andra vitlisteavsnitt
// längst ned var annars osynligt. C4: förbudsblocket slutar vid NÄSTA RUBRIK, inte
// efter ett fast antal byte; fönstret rann annars in i "Banans delar" och ett
// omnämnande där räknades som om ytan stod i förbudslistan.
const vitBlock = [...banan.matchAll(/\*\*TILLÅTET:\*\*/g)]
  .map((m) => {
    const slut = banan.indexOf('**FÖRBJUDET', m.index)
    const nastaRubrik = banan.indexOf('\n## ', m.index)
    const gr = [slut, nastaRubrik].filter((x) => x > m.index)
    return banan.slice(m.index, gr.length ? Math.min(...gr) : banan.length)
  })
  .join('\n')
const iForb = banan.indexOf('**FÖRBJUDET')
const forbSlut = banan.indexOf('\n## ', iForb)
const forbBlock = iForb === -1 ? '' : banan.slice(iForb, forbSlut === -1 ? banan.length : forbSlut)
check('Ankare: vitliste- och förbudsblock avgränsade',
  vitBlock.length > 100 && forbBlock.length > 100 && iForb !== -1,
  'TILLÅTET/FÖRBJUDET-blocken kunde inte avgränsas')
const vitPunkter = [...vitBlock.matchAll(/^- /gm)].length
check('Vitlistan har faktiska poster', vitPunkter >= 4, `${vitPunkter} punkter — vitlistan är urholkad`)
check('Vitlistan är VÄGFORMAD, inte en etikettlista', /VÄGFORMAD med uttryckliga undantag/.test(ren(banan)),
  'vägformen sägs inte ut')

// C1: ETIKETT för närvarokontrollen, SÖKVÄG för anti-vitlistningen. Tidigare användes
// etiketten `eval-rubrik` (svenskt k) mot sökvägen `eval-rubric.md` (engelskt c) —
// includes() blev falskt, och mätstocken (§A2, reward-hacking-skyddet) gick att
// vitlista via sin sökväg medan §A4 var korrekt vaktad.
const FORBJUDNA = [
  { etikett: 'docs/07-konstitution.md', vag: 'docs/07-konstitution.md' },
  { etikett: 'eval-rubrik', vag: 'eval-rubric.md' },
  { etikett: 'grindarnas kravnivåer', vag: 'nortropic-launch.js' },
  { etikett: 'juridikflaggor.md', vag: 'juridikflaggor.md' },
  { etikett: 'tests/fixtures/', vag: 'tests/fixtures/' },
  { etikett: 'AUTOPILOT', vag: 'AUTOPILOT' },
  { etikett: 'modellkontraktet', vag: 'modellkontraktet' },
]
for (const { etikett, vag } of FORBJUDNA) {
  check(`Förbjuden yta i FÖRBUDSBLOCKET: ${etikett}`, forbBlock.includes(etikett),
    'saknas i förbudsblocket (närvaro någon annanstans i filen räknas inte)')
  // POSITIONELL REGEL (inte en fras-svartlista): en skyddad SÖKVÄG får förekomma i en
  // punkt ENDAST som undantag, dvs EFTER ett UTOM. Tidigare frågade vakten bara "namnger
  // texten efter UTOM sökvägen?" — aldrig VAR sökvägen står. Då passerade en punkt vars
  // SUBJEKT var den skyddade filen med ett efterhängt "UTOM ingenting i <samma fil>".
  // Och punkterna söks i HELA filen, inte bara under `**TILLÅTET:**` — en fortsättning
  // under en vanlig rubrik gick annars runt blockskanningen.
  // Gruppera punkter korrekt: en punkt är sin `- `-rad PLUS efterföljande indenterade
  // fortsättningsrader. En naiv split på lookahead lämnade allt efter sista punkten
  // som en enda "punkt" — då såg hela förbudsblocket ut att stå i en tillåten post.
  // LISTMARKÖREN är den sista strukturella axeln: `^- ` i kolumn noll missade
  // indenterade underpunkter, `*`, `+` och numrerade listor — alla renderas som
  // tillåtna listposter, och en indenterad punkt svaldes dessutom som "fortsättning".
  const PUNKTSTART = /^\s*(?:[-*+]|\d+\.)\s/
  const allaPunkter = (() => {
    const rader = banan.split('\n'), ut = []
    for (let i = 0; i < rader.length; i++) {
      if (!PUNKTSTART.test(rader[i])) continue
      let punkt = rader[i]
      // Fortsättning = indenterad rad som INTE själv startar en ny punkt.
      for (let j = i + 1; j < rader.length && /^\s+\S/.test(rader[j]) && !PUNKTSTART.test(rader[j]); j++) {
        punkt += ' ' + rader[j].trim()
      }
      ut.push(punkt)
    }
    return ut
  })()
  const somTillaten = allaPunkter.filter((rad) => {
    const iVag = rad.indexOf(vag)
    if (iVag === -1) return false
    const iUtom = rad.indexOf('UTOM')
    return iUtom === -1 || iVag < iUtom   // ingen undantagsklausul, eller vägen står FÖRE den
  })
  check(`Förbjuden yta står INTE som TILLÅTEN post: ${etikett}`, somTillaten.length === 0,
    `sökvägen står i en punkt utan föregående UTOM: ${somTillaten.map((r) => r.slice(0, 60)).join(' | ')}`)
}
check('skills/*/references/ bär undantag för eval-rubriken (§A2)',
  /skills\/\*\/references\/[\s\S]{0,140}UTOM[\s\S]{0,140}eval-rubric\.md/.test(vitBlock),
  'globen sveper in §A2 utan undantag')
check('skills/*/references/ bär undantag för juridikflaggor (§A4)',
  /juridikflaggor\.md[\s\S]{0,40}§A4/.test(vitBlock), 'globen sveper in §A4 utan undantag')
check('packs/*/strategi/ bär undantag för §7.4/§7.7 (§A7)',
  /packs\/\*\/strategi\/[\s\S]{0,160}UTOM[\s\S]{0,120}§7\.4/.test(vitBlock),
  'globen sveper in §A7-kalibrering utan undantag')
check('Juridiken är human-only i ALLA lägen', /juridik är human-only i ALLA lägen/.test(ren(banan)),
  '§A4-regeln saknas')

check('K5 är DEFERRED_BY_TRIGGER, inte byggd i förväg',
  /DEFERRED_BY_TRIGGER/.test(banan) && /evidens fabriceras aldrig/.test(flat(banan)),
  'K5:s triggerberoende redovisas inte')

// ---- K1: källregistret ------------------------------------------------------
check('Ankare: registret har källor att pröva', Array.isArray(reg.kallor) && reg.kallor.length > 0,
  'inga källor')
const FALT = ['id', 'klass', 'styrdaDomaner', 'operativaVagar', 'volatilitet',
              'andringsdetektering', 'konsument', 'kallstartsniva', 'kallaAlfa']
for (const f of FALT) {
  const saknas = reg.kallor.filter((k) => !(f in k)).map((k) => k.id || '(namnlös)')
  check(`Varje källa bär \`${f}\``, saknas.length === 0, `saknas hos: ${saknas.join(', ')}`)
}
const KLASSER = ['NORMATIV', 'PRAXIS', 'LEVERANTOR', 'FORSKNING']
check('Alla klasser hör till vokabulären',
  reg.kallor.every((k) => KLASSER.includes(k.klass)),
  `okänd klass: ${reg.kallor.filter((k) => !KLASSER.includes(k.klass)).map((k) => k.klass)}`)
const VOL = ['LAG', 'MEDEL', 'HOG']
check('Alla volatiliteter hör till vokabulären',
  reg.kallor.every((k) => VOL.includes(k.volatilitet)), 'okänd volatilitet')
const TIER = ['TIER-1', 'TIER-2', 'TIER-3']
check('Alla kallstartsnivåer hör till vokabulären',
  reg.kallor.every((k) => TIER.includes(k.kallstartsniva)), 'okänd kallstartsnivå')
// ÄRLIGHETSKRAV: source-alfa är OMÄTT. En siffra här vore fabricerad evidens.
check('kallaAlfa är null överallt — omätt är inte noll',
  reg.kallor.every((k) => k.kallaAlfa === null),
  `mätvärde utan mätning hos: ${reg.kallor.filter((k) => k.kallaAlfa !== null).map((k) => k.id)}`)
check('Ändringsdetektering är en KONKRET metod, aldrig "bevakas"',
  reg.kallor.every((k) => k.andringsdetektering.length > 25 && !/^bevakas$/i.test(k.andringsdetektering)),
  'någon källa saknar konkret detekteringsmetod')
check('Ingen källa gör anspråk på ALLA frågor',
  reg.kallor.every((k) => Array.isArray(k.styrdaDomaner) && !k.styrdaDomaner.includes('allt')),
  'en källa gör anspråk på allt — auktoritet är frågeberoende')
const bakland = reg.kallor.find((k) => k.id === 'nortropic-knowledge')
check('Ankare: baklandsraden finns i registret', !!bakland, 'nortropic-knowledge saknas som rad')
check('Baklandets KONSUMENT är INGEN vid körning',
  !!bakland && /^INGEN vid korning/.test(bakland.konsument) &&
  !/(laser|konsulteras|anvands)[^.]{0,60}(VID KORNING|vid korning)[^.]{0,30}auktoritet/i.test(bakland.konsument),
  'baklandsraden pekar ut en körtidskonsument — då är det körauktoritet')
check('Baklandet styr inga operativa vägar',
  !!bakland && Array.isArray(bakland.operativaVagar) && bakland.operativaVagar.length === 0,
  'baklandet styr en operativ väg — det är per definition körauktoritet')
check('Registret bär sina lagar', Array.isArray(reg.lagar) && reg.lagar.length >= 4,
  'lagarna saknas i registret')
check('Lagen "omätt är inte noll" står i registret',
  reg.lagar.some((l) => /OMATT AR INTE NOLL/.test(l)), 'lagen saknas')

// ---- K2: anspråksstegen och mallarna ---------------------------------------
const STEG = ['OBSERVED', 'CORROBORATED', 'LOCALLY_REPLICATED', 'LOCALLY_PROVEN', 'ADOPTED',
              'CHALLENGED', 'DEPRECATED', 'SUPERSEDED']
for (const s of STEG) {
  check(`Anspråkssteget \`${s}\` definierat`,
    new RegExp(`\\|\\s*\`${s}\`\\s*\\|`).test(kontrakt), 'steget saknas i stegtabellen')
}
check('Stegen står i rätt ordning i livscykeln',
  /OBSERVED → CORROBORATED → LOCALLY_REPLICATED → LOCALLY_PROVEN → ADOPTED/.test(kontrakt),
  'livscykeln är omkastad eller saknas')
const adoptedRad = kontrakt.split('\n').find((r) => /^\| `ADOPTED`/.test(r)) ?? ''
check('Ankare: ADOPTED-raden hittad i stegtabellen', adoptedRad.length > 20, 'raden saknas')
check('ADOPTED flyttas endast av människan — PÅ SJÄLVA ADOPTED-RADEN',
  /Endast människan flyttar hit/.test(adoptedRad) && !/systemet/i.test(adoptedRad),
  'promotionsspärren står inte på ADOPTED-raden (eller raden ger systemet rätten)')
check('SCOPE är obligatoriskt på VARJE steg',
  /SCOPE ÄR OBLIGATORISKT PÅ VARJE STEG/.test(kontrakt), 'anti-universaliseringsvakten saknas')
check('Frånvaro av omfång är ogiltigt ("okänt" är giltigt)',
  /"okänt" är ett giltigt omfång; frånvaro är det inte/.test(ren(kontrakt)), 'regeln saknas')
check('Stegen hoppas aldrig över', /Stegen hoppas aldrig över/.test(kontrakt), 'regeln saknas')
check('Nedgradering är lika legitim som uppgradering',
  /en väg som bara går uppåt mäter inte, den ackumulerar/i.test(flat(kontrakt)), 'regeln saknas')
const mallBlock = (namn) => {
  const i = kontrakt.indexOf(`## MALL: ${namn}`)
  if (i === -1) return ''
  const j = kontrakt.indexOf('\n## ', i + 5)
  return kontrakt.slice(i, j === -1 ? kontrakt.length : j)
}
// Rubrikkontroller ensamma var vacuösa: hela fältlistan kunde raderas ur mallen
// och sviten förblev grön. Vi binder de fält som BÄR reglerna.
for (const [mall, falt] of [
  ['ANSPRÅK', ['Påstående', 'Steg', 'Omfång (OBLIGATORISKT)', 'Belägg', 'Verklighetsklass',
               'Rubrik-kriterium', 'Vad som skulle falsifiera det']],
  ['EXPERIMENT', ['Frågan', 'Prövar anspråk', 'Uppställning', 'Förutbestämt utfall',
                  'Volymgräns', 'Utfall']],
  ['KONFLIKT', ['Fråga', 'Part A', 'Part B', 'Vem har auktoritet', 'Läge', 'Beslut']],
]) {
  const block = mallBlock(mall)
  check(`Ankare: mallen ${mall} kunde avgränsas`, block.length > 100, 'mallen saknas eller är tom')
  for (const f of falt) {
    check(`Mallen ${mall} bär fältet "${f}"`, block.includes(f), 'fältet saknas ur mallkroppen')
  }
}
check('Anspråksmallen kräver falsifierbarhet',
  /Vad som skulle falsifiera det[\s\S]{0,80}det är inte ett anspråk/.test(flat(kontrakt)),
  'falsifierbarhetskravet saknas')
check('Experimentets utfallskriterium skrivs FÖRE körning',
  /skrivet FÖRE körning/.test(flat(kontrakt)) && /motiverar/.test(flat(kontrakt)),
  'kravet eller dess skäl saknas')
check('Konflikt registreras, aldrig tyst upplöst',
  /En konflikt registreras, aldrig tyst upplöst/.test(flat(kontrakt)), 'regeln saknas')
check('ODÖMBAR/ODÖMBART är ett hedervärt läge, aldrig grönt',
  /ODÖMBART är aldrig grönt/.test(kontrakt), 'tri-state-disciplinen saknas')

// ---- K3: radarn -------------------------------------------------------------
const iRadar = kontrakt.indexOf('## RADAR v1')
check('Ankare: radaravsnittet kunde avgränsas', iRadar !== -1, 'radarrubriken saknas')
const radar = iRadar === -1 ? '' : flat(kontrakt.slice(iRadar))
check('Radarn är ÄGARTRIGGAD under bootstrap',
  /ÄGARTRIGGAD/.test(radar) && /startar inte av sig själv/.test(radar), 'triggerregeln saknas')
check('Radarn är propose-only ALLTID, även efter bootstrap',
  /propose-only ALLTID.{0,40}även efter\s*bootstrap/i.test(radar), 'regeln saknas')
check('Radarn skriver ALDRIG direkt i en standard',
  /skriver ALDRIG direkt i en standard/.test(radar), 'förbudet saknas')
// ORDNINGEN är hela poängen: bedöms materialitet FÖRE deltat citerats har vår
// tolkning redan smugit in i beslutet. Närvarokontroller per steg missade det.
const ROR = ['källa förfallen', 'ändringsdetektering', 'citerad delta', 'materialitet', 'påverkan']
const radarLower = radar.toLowerCase()
for (const steg of ROR) {
  check(`Rörledningssteget "${steg}"`, radarLower.includes(steg.toLowerCase()), 'saknas')
}
const positioner = ROR.map((s) => radarLower.indexOf(s.toLowerCase()))
check('Rörledningen står i RÄTT ORDNING',
  positioner.every((p, i) => p !== -1 && (i === 0 || p > positioner[i - 1])),
  `ordningen är omkastad: ${ROR.map((s, i) => `${s}@${positioner[i]}`).join(' ')}`)
for (const utfall of ['FÖRSLAG', 'KUNSKAPSKANDIDAT', 'EXPERIMENT', 'BEVAKA']) {
  check(`Routingutfallet ${utfall}`, radar.includes(utfall), 'saknas')
}
check('Delta CITERAS ordagrant — parafras duger inte',
  /ordagrant citerat med plats/.test(radar) && /parafras duger inte/i.test(radar),
  'citatkravet eller dess skäl saknas')
check('En TOM radarkörning är ett giltigt utfall',
  /tom radarkörning är ett GILTIGT utfall/.test(radar), 'regeln saknas')
check('Radarn letar inte upp något att föreslå för att kännas värd sin tid',
  /precis motsatsen till\s*vad organet är till för/.test(radar), 'skälet saknas')
check('§A-fynd får endast FLAGGAS av radarn',
  /FLAGGA det för ägaren med källa och plats — aldrig att formulera ändringen/.test(ren(kontrakt.slice(iRadar))),
  'radarns §A-spärr saknas')

check('Radarns hårda gräns: inga direkta skrivningar i standarder',
  /Inga direkta skrivningar i standarder/.test(ren(kontrakt.slice(iRadar))), 'gränsen saknas')
check('K0: att köra radarn är ägarens ensak',
  /Att köra radarn/.test(banan), 'raden saknas ur ägartabellen')
const kallstartDef = reg.faltdefinitioner?.kallstartsniva
if (typeof kallstartDef !== 'string') {
  console.error('ODÖMBART: registret saknar faltdefinitioner.kallstartsniva — kan inte pröva ärligheten')
  process.exit(2)
}
check('Kallstartsnivån redovisas som BEDÖMNING, aldrig som mätning',
  /BEDOMNING gjord innan vi matt nagot/.test(kallstartDef) && !/uppmatt|matt over/i.test(kallstartDef),
  'kallstartsnivån utges för att vara mätt')

// ---- Verdikt ---------------------------------------------------------------
for (const p of passes) console.log(`PASS: ${p}`)
if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`)
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} kontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} kunskapsbanekontroller`)
process.exit(0)
