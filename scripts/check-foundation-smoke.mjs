#!/usr/bin/env node
console.log('VAKT: check-foundation-smoke.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig
// FOUNDATION-SMOKE I BATTERIET — en byggd svit som ingenting anropade.
//
// VARFÖR DEN HÄR FILEN FINNS. En inventering 2026-08-27 svepte efter anropare och fann att
// `tests/fixtures/foundation/kontroller.sh` inte hade någon. Filens egen README säger
// *"Kör och FALSIFIERA `kontroller.sh` före förtroende-transitionen"* — en instruktion till
// en människa, inte en mekanism. Sviten bär nio kontroller om systemets grundvalar:
// repo-nativ rotupplösning och identitet · doctorns ompekning · mutable-main-hämtningens
// inerthet · den frusna forkens självmandat · vendorerad integritet över nio kanoniska
// träd · kanari-renhet · axe-mätstickans pinne · Lighthouse-mätstickans pinne och
// INP-sanningsgränsen · universalregimens klippflagga.
//
// **BYGGT OCH GRANSKAT ÄR INTE TESTAT.** Sviten var skriven, pinnad och §A6-skyddad — och
// kördes bara när någon kom ihåg det. En kontroll som ingen kör är en kontroll som inte
// finns; skillnaden märks först den dagen den skulle ha fällt något.
//
// DEN HÄR VAKTEN ÄNDRAR INGENTING I §A6. Den LÄSER och KÖR. `tests/fixtures/` är
// människoägd yta (`docs/07-konstitution.md` §A6: *"Ett regressionsnät som kan redigeras av
// det som ska fångas är inget nät"*), och det gäller oförändrat. Att observera en yta är
// inte att röra den.
//
// DÄRFÖR STÅR ANTALET HÄR OCH INTE HÄRLEDS UR SVITEN. En härledning ur svitens egen källa
// hade gett en KRYMPANDE NÄMNARE: stryks en kontroll ur sviten sjunker både det förväntade
// och det faktiska antalet, och `9/9` blir `8/8` — grönt, med mindre täckning. Talet är
// därför handskrivet HÄR, i vaktens fil. Tas en kontroll bort ur sviten fäller den här
// vakten, och en människa som gör det medvetet uppdaterar talet i MIN fil — inte i sin.
//
// EXIT 0 MED TYSTNAD ÄR ALDRIG GRÖNT. En svit som avslutar 0 utan att ha skrivit sina
// kvittensrader har inte kört sina kontroller; den har bara nått slutet. Ankarkravet är att
// utfallet BÄR sina rader, inte att exitkoden är noll.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
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

const passes = []
const fails = []
const check = (namn, ok, detalj) => (ok ? passes.push(namn) : fails.push(`${namn}: ${detalj}`))
const FORVANTAD_KALLHASH = '4849d66b97302ae1'

const SVIT = 'tests/fixtures/foundation/kontroller.sh'
// Handskrivet i VAKTENS fil, aldrig härlett ur sviten. Se resonemanget överst.
// K1 · K2 · K3 · K4 · K5a · K5b · K6 · K7 · K5c
const FORVANTAT_ANTAL = 9

// ---- MEKANISMEN, FAKTORISERAD UT -------------------------------------------
// `doma` gör hela bedömningen ur (exitkod, utdata, förväntat antal) och rör ingenting
// utanför sina argument. Därför kan den köras mot SYNTETISKA utfall och tvingas bevisa att
// den kan säga NEJ — särskilt i det farligaste fallet: exit 0 med för få kvittensrader.
const KVITTENS = /^K[0-9a-zåäö]+ PASS\b/gm

/**
 * @returns {{verdikt: 'PASS'|'FAIL'|'ODÖMBART', antal: number, skal: string}}
 */
function doma(exitkod, utdata, vantatAntal) {
  const antal = (String(utdata).match(KVITTENS) || []).length
  if (exitkod === 2) return { verdikt: 'ODÖMBART', antal, skal: 'sviten dömde sig själv ODÖMBAR' }
  if (exitkod === 1) return { verdikt: 'FAIL', antal, skal: 'sviten föll' }
  if (exitkod !== 0) return { verdikt: 'ODÖMBART', antal, skal: `okänd exitkod ${exitkod} — ett okänt värde faller aldrig tillbaka på den lösare vägen` }
  // Exit 0. Den enda kvarvarande frågan är om sviten FAKTISKT körde sina kontroller.
  if (antal !== vantatAntal) {
    return { verdikt: 'ODÖMBART', antal,
      skal: `exit 0 men ${antal} kvittensrader, väntade ${vantatAntal} — en svit som avslutar noll utan att ha skrivit sina rader har nått slutet, inte kört sina kontroller` }
  }
  return { verdikt: 'PASS', antal, skal: `${antal}/${vantatAntal} kontroller kvitterade` }
}

// ---- POSITIVT KONTROLLPROV --------------------------------------------------
const NIO = Array.from({ length: 9 }, (_, i) => `K${i + 1} PASS: ok`).join('\n')
for (const [namn, [kod, ut, vantat, forvantatVerdikt]] of Object.entries({
  'full svit med exit 0 ger PASS': [0, NIO, 9, 'PASS'],
  'exit 0 med FÖR FÅ kvittensrader ger ODÖMBART, aldrig PASS': [0, 'K1 PASS: ok', 9, 'ODÖMBART'],
  'exit 0 med TOM utdata ger ODÖMBART': [0, '', 9, 'ODÖMBART'],
  'exit 0 med FLER rader än väntat ger ODÖMBART (en tillkommen kontroll är också drift)': [0, `${NIO}\nK99 PASS: ny`, 9, 'ODÖMBART'],
  'exit 1 ger FAIL': [1, NIO, 9, 'FAIL'],
  'exit 2 ger ODÖMBART': [2, NIO, 9, 'ODÖMBART'],
  'okänd exitkod ger ODÖMBART, aldrig PASS': [7, NIO, 9, 'ODÖMBART'],
  'null exitkod (dödad process) ger ODÖMBART': [null, NIO, 9, 'ODÖMBART'],
  'kvittensraden måste stå i RADENS BÖRJAN — ett omnämnande i prosa räknas inte': [0, 'texten "K1 PASS" nämns här', 9, 'ODÖMBART'],
})) {
  const r = doma(kod, ut, vantat)
  check(`Kontrollprov: ${namn}`, r.verdikt === forvantatVerdikt,
    `gav ${r.verdikt} (${r.skal}) — ett prov som inte kan falla bevisar ingenting`)
}

// ---- KOPPLINGSKONTROLL ------------------------------------------------------
const kalltext = readFileSync(fileURLToPath(import.meta.url), 'utf8')
check('Kopplingskontroll: `doma` anropas på den VERKLIGA körningen',
  /const verkligt = doma\(kord\.status, verkligUtdata, FORVANTAT_ANTAL\)/.test(kalltext),
  'provet prövar en funktion som inte används — då är den död kod och sviten går obevakad')
check('Kopplingskontroll: verdiktet VÄGS IN i domen',
  /verkligt\.verdikt/.test(kalltext),
  'en bedömning vars resultat inte läses nedströms är en dekoration')

// ---- DEN VERKLIGA KÖRNINGEN -------------------------------------------------
if (!existsSync(join(ROT, SVIT))) odombart(`${SVIT} saknas — sviten går inte att köra, och en frånvarande svit är aldrig ett rent resultat`)

// `sh` anropas uttryckligen i stället för att lita på exec-biten. En svit som slutar vara
// körbar ska falla på sitt INNEHÅLL, inte på ett filläge som varierar mellan maskiner.
const kord = spawnSync('sh', [join(ROT, SVIT)], { cwd: ROT, encoding: 'utf8', timeout: 300_000 })
if (kord.error) odombart(`${SVIT} kunde inte startas (${kord.error.code || kord.error.message}) — en svit som inte går att köra är odömbar, aldrig grön`)
const verkligUtdata = `${kord.stdout || ''}${kord.stderr || ''}`
const verkligt = doma(kord.status, verkligUtdata, FORVANTAT_ANTAL)

// VERDIKTORDNINGEN: ODÖMBART dömer FÖRE antalet, och skälet är ärlighet om orsaken.
// Avbryter sviten — exit 2, en okänd kod, en dödad process — har den inte hunnit skriva
// sina kvittensrader, och att då fälla på "0 av 9 kontroller" vore att rapportera ett
// SYMPTOM som orsak. En läsare skulle leta efter en struken kontroll som inte finns.
// Båda utfallen är icke-gröna; skillnaden är vilken felsökning raden skickar en människa
// till. Upptäckt av ett mutationsprov som dog med rätt utfall av fel skäl.
if (verkligt.verdikt === 'ODÖMBART' && kord.status !== 0) {
  for (const p of passes) console.log(`PASS: ${p}`)
  console.error(`\nODÖMBART: ${SVIT} — ${verkligt.skal} (exit ${kord.status})`)
  console.error(verkligUtdata.split('\n').filter(Boolean).slice(-6).map((r) => `  | ${r}`).join('\n'))
  process.exit(2)
}

check(`Foundation-sviten kvitterar ${FORVANTAT_ANTAL} kontroller`,
  verkligt.antal === FORVANTAT_ANTAL,
  `${verkligt.antal} kvittensrader — en kontroll har lagts till eller tagits bort ur §A6-sviten. Är ändringen avsedd uppdateras FORVANTAT_ANTAL i DEN HÄR filen, aldrig i sviten`)

// §A6-GRÄNSEN SÄGS UT I VAKTENS EGEN KÄLLA, inte bara i en commit-rad. Nästa läsare ska se
// att den här vakten observerar en människoägd yta och aldrig rör den.
check('Vakten säger UT att den aldrig ändrar §A6-ytan',
  /ÄNDRAR INGENTING I §A6/.test(kalltext) && /LÄSER och KÖR/.test(kalltext),
  'en vakt som kör en människoägd yta måste säga vad den inte gör — annars läses nästa ändring i katalogen som vaktens')

// ---- Verdikt ---------------------------------------------------------------
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
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} foundation-kontroller föll`)
  process.exit(1)
}
if (verkligt.verdikt === 'ODÖMBART') {
  console.error(`\nODÖMBART: ${SVIT} — ${verkligt.skal}`)
  console.error(verkligUtdata.split('\n').filter(Boolean).slice(-6).map((r) => `  | ${r}`).join('\n'))
  process.exit(2)
}
if (verkligt.verdikt === 'FAIL') {
  console.error(`\nRESULTAT: FAIL — ${SVIT} föll:`)
  console.error(verkligUtdata.split('\n').filter((r) => /^(FAIL|ODÖMBART)/.test(r)).map((r) => `  | ${r}`).join('\n') || '  | (inget skäl skrivet)')
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} egna kontroller, och foundation-sviten kvitterade ${verkligt.antal}/${FORVANTAT_ANTAL} (källhash ${kallhash})`)
for (const r of (verkligUtdata.match(KVITTENS) || [])) console.log(`  · ${r}`)
console.log('\nVAD DETTA INTE BEVISAR: att grundvalarna är säkra. Sviten prövar NIO namngivna')
console.log('påståenden om dem — pinnar, ankare och inerthet — och de nio är inte en')
console.log('uttömmande lista över vad som kan gå fel i en grundval. Det den här vakten')
console.log('köper är att de nio KÖRS varje gång i stället för när någon kommer ihåg det.')
process.exit(0)
