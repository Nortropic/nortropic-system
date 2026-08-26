#!/usr/bin/env node
console.log('VAKT: check-integrationer.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig
// INTEGRATIONSREGISTRET — arbetslistan till Gate 6:s människa, inte ett juridiskt omdöme.
//
// VAD DEN INTE GÖR, FÖRST. Den avgör ingenting juridiskt. §A4 gör all juridik human-only,
// och Gate 6:s egen processregel lyder *"legal findings are reported, never auto-fixed.
// The pipeline stops and a human decides."* Vakten prövar att UNDERLAGET är fullständigt
// — aldrig att sajten är laglig, aldrig att ett samtyckesbeslut är rätt.
//
// VARFÖR DEN BEHÖVS. Gate 6:s checklista kräver att varje mottagare/personuppgiftsbiträde
// NAMNGES i integritetspolicyn, och att *"every third-party request on the site must be
// explainable in the policy"*. Men den människan har hittills fått **upptäcka**
// integrationerna genom att läsa den byggda sajten. `profile.ts` vet dem redan.
//
// FÄLTEN ÄR VALDA FÖR ATT GÖRA ARBETSLISTAN AVGÖRBAR, inte för att vara många:
//   `lage`            — skiljer UTGÅENDE LÄNK från INBÄDDNING från en närvaro som inte gör
//                       någon förfrågan från sajten alls. En Google Företagsprofil finns
//                       men laddar ingenting; en kartinbäddning laddar och kan sätta kakor.
//                       Att slå ihop dem gör den farliga formen osynlig.
//   `personuppgifter` — når besökarens personuppgifter tredje part?
//   `samtyckeKravs`   — samtyckesbeslutet, fattat av människa.
//
// EN TOM MÄNGD ÄR INTE ETT RENT RESULTAT. En profil utan `integrationer` kan betyda "inga
// integrationer" eller "fältet glömdes". Vakten skiljer på dem: fältet måste FINNAS, även
// när det är tomt.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { foreV2 } from './profil-las.mjs'

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

const passes = []
const fails = []
const check = (namn, ok, detalj) => (ok ? passes.push(namn) : fails.push(`${namn}: ${detalj}`))
const FORVANTAD_KALLHASH = '1c09e8c9ab866a36'

const LAGEN = ['lank', 'inbaddning', 'ingen-sidintegration']
const FALT = ['tjanst', 'roll', 'extern', 'hallerTillstand', 'lage', 'personuppgifter', 'samtyckeKravs']

// Strängmedveten maskering: en apostrof i en roll-text får inte tolkas som kodslut.
const maskera = (s) => {
  let ut = '', i = 0, sträng = null
  while (i < s.length) {
    const c = s[i]
    if (sträng) {
      if (c === '\\') { ut += 'xx'; i += 2; continue }
      if (c === sträng) { sträng = null; ut += c; i++; continue }
      ut += 'x'; i++; continue
    }
    if (c === "'" || c === '"' || c === '`') { sträng = c; ut += c; i++; continue }
    ut += c; i++
  }
  return ut
}

// Läs integrationslistan som BALANSERAD hakparentes ur den maskerade källan, och skär ut
// posterna ur originalet. En regex över rader skulle brytas av en radbrytning i en post.
function integrationer(kalla, fil) {
  const m = /^ {2}integrationer\s*:\s*\[/m.exec(maskera(kalla))
  if (!m) return null
  let djup = 0, i = m.index + m[0].length - 1
  const mask = maskera(kalla)
  const start = i
  for (; i < mask.length; i++) {
    if (mask[i] === '[') djup++
    else if (mask[i] === ']') { djup--; if (djup === 0) break }
  }
  if (djup !== 0) odombart(`${fil}: integrationslistan är obalanserad — den går inte att läsa`)
  const kropp = kalla.slice(start + 1, i)
  const maskKropp = mask.slice(start + 1, i)
  // Dela på toppnivåobjekt.
  const poster = []
  let d = 0, from = -1
  for (let j = 0; j < maskKropp.length; j++) {
    if (maskKropp[j] === '{') { if (d === 0) from = j; d++ }
    else if (maskKropp[j] === '}') { d--; if (d === 0) poster.push(kropp.slice(from, j + 1)) }
  }
  return poster
}

const dirs = readdirSync(join(ROT, 'backtests')).filter((d) => d.startsWith('case-'))
if (dirs.length === 0) odombart('inga fixturer hittades — en tom mängd får aldrig läsas som ett rent resultat')

let totalt = 0
const gate6 = []
for (const d of dirs) {
  const p = `backtests/${d}/profile.ts`
  if (!existsSync(join(ROT, p))) continue          // C och D byggs aldrig; ingen profil
  const kalla = las(p)
  const stampel = (/profilKontraktVersion:\s*'([^']+)'/.exec(kalla) || [])[1] || ''
  // Bakåtkompatibilitetslagen: `integrationer` är ett v2-fält. En v1-profil SAKNAR det, och
  // frånvaron är då OKÄND — aldrig "inga integrationer". Att kräva fältet av en v1-profil
  // vore att bryta lagens första led i den vakt som ska upprätthålla dess anda.
  if (foreV2(stampel) === true) {
    check(`${d}: v1-profil undantas från integrationskravet (bakåtkompatibilitetslagen)`,
      !/^ {2}integrationer\s*:/m.test(maskera(kalla)),
      'en v1-profil som ändå bär v2-fältet är inte en v1-profil')
    continue
  }
  const poster = integrationer(kalla, d)
  check(`${d}: fältet \`integrationer\` FINNS`, poster !== null,
    'en saknad lista går inte att skilja från "inga integrationer" — och den skillnaden är hela poängen')
  if (poster === null) continue
  for (const post of poster) {
    totalt++
    const namn = (/tjanst:\s*'([^']+)'/.exec(post) || [])[1] || '(namnlös)'
    const saknade = FALT.filter((f) => !new RegExp(`\\b${f}\\s*:`).test(post))
    check(`${d}/${namn}: bär samtliga sju fält`, saknade.length === 0,
      `saknar ${saknade.join(', ')} — Gate 6:s människa kan inte signera av en integration hon inte ser hela`)
    const lage = (/lage:\s*'([^']+)'/.exec(post) || [])[1]
    check(`${d}/${namn}: \`lage\` är ett känt värde`, LAGEN.includes(lage),
      `lage är ${JSON.stringify(lage)} — okänt läge är oklassificerat, aldrig ofarligt`)
    const pu = /personuppgifter:\s*true/.test(post)
    const sk = /samtyckeKravs:\s*true/.test(post)
    // INBÄDDNING är den farliga formen: den gör en tredjepartsförfrågan FRÅN sajten.
    if (lage === 'inbaddning') {
      check(`${d}/${namn}: inbäddning har ETT UTTALAT samtyckesbeslut`,
        /samtyckeKravs:\s*(true|false)/.test(post),
        'en inbäddning utan uttalat samtyckesbeslut lämnar frågan obesvarad i just det läge där den alltid måste ställas')
      check(`${d}/${namn}: inbäddning som når personuppgifter kräver samtycke`,
        !pu || sk,
        'personuppgifter till tredje part i vår kontext utan samtyckeskrav är ett påstående som behöver en människas signatur, inte en default')
    }
    // INTERN MOTSÄGELSE. Vakten kan INTE veta vad en tjänst faktiskt gör — det kräver den
    // byggda sajtens nätverkstrafik (se INT-GAP-1). Men den kan fälla när DEKLARATIONEN
    // motsäger SIG SJÄLV: heter posten "kartinbäddning" och `lage` säger `lank` är minst
    // ett av de två fälten fel, och den motsägelsen är avgörbar här.
    const bäddord = /inbäddning|inbaddning|iframe|embed|widget/i
    check(`${d}/${namn}: namn/roll och \`lage\` motsäger inte varandra`,
      !(bäddord.test(`${namn} ${(/roll:\s*'([^']+)'/.exec(post) || [])[1] || ''}`) && lage !== 'inbaddning'),
      `posten beskriver en inbäddning men \`lage\` säger ${JSON.stringify(lage)} — minst ett av fälten är fel, och en inbäddning som deklareras som länk gör den farliga formen osynlig`)
    if (pu || sk || lage === 'inbaddning') gate6.push(`${d}/${namn} (${lage}${pu ? ', personuppgifter' : ''}${sk ? ', samtycke' : ''})`)
  }
}
check('Ankare: minst en integration kunde läsas', totalt > 0,
  'inga integrationer alls i någon fixtur — då prövar vakten ingenting, och en tom körning får aldrig läsas som ren')

// Kontraktet måste bära formen — annars är fälten fixturernas påhitt.
const stack = las('skills/nortropic-stack/SKILL.md')
for (const f of FALT) check(`Kontraktet namnger fältet \`${f}\``, stack.includes(f),
  'ett fält som bara finns i fixturerna är inte ett kontrakt')
check('Kontraktet skiljer de tre lägena åt',
  LAGEN.every((l) => stack.includes(l)),
  'slås utgående länk och inbäddning ihop blir den farliga formen osynlig')
check('Kontraktet säger UT att vakten inte avgör juridik',
  /avgör ingenting juridiskt/.test(stack) && /§A4/.test(stack),
  'en vakt som läses som ett juridiskt godkännande är värre än ingen vakt')

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
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} integrationskontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} integrationskontroller över ${totalt} integrationer`)
console.log('\nARBETSLISTA TILL GATE 6 (människa avgör, vakten avgör ingenting):')
for (const g of gate6) console.log(`  · ${g}`)
console.log('\nINT-GAP-1 — DEN VIKTIGASTE GRÄNSEN: profilen är en DEKLARATION. Vakten kan inte')
console.log('veta vad en tjänst faktiskt gör. En inbäddning som deklareras som `lank` och vars')
console.log('namn inte avslöjar det passerar här. Att verifiera kräver den byggda sajtens')
console.log('faktiska tredjepartsförfrågningar — Gate 2/Gate 6 mot en deployad preview.')
console.log('\nVAD DETTA INTE BEVISAR: att integritetspolicyn NAMNGER dem, att samtycket')
console.log('fungerar, eller att sajten är laglig. Policyn bor i byggrepot och bedöms av en')
console.log('människa vid Gate 6 (§A4). Vakten säger bara att arbetslistan är fullständig.')
process.exit(0)
