#!/usr/bin/env node
// S3: mekaniska kontroller för plannerns routing/stopp-semantik, kapacitetskatalogen
// och paketmanifestet.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.
// Ankarkrav (V4-läxan): en tom träffmängd är PASS endast om ankaret först bevisats.

import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

console.log('VAKT: check-planner-routing.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig

let ROT
try {
  ROT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
} catch {
  console.error('ODÖMBART: ingen git-topp — körning utanför repo vägras (aldrig gissad rot)')
  process.exit(2)
}

const read = (p) => {
  const f = join(ROT, p)
  if (!existsSync(f)) {
    console.error(`ODÖMBART: ankarfilen saknas — ${p}`)
    process.exit(2)
  }
  return readFileSync(f, 'utf8')
}

const planner = read('agents/project-planner.md')
const katalog = read('docs/kapacitetskatalog.md')
const manifest = read('packs/lokal-se/manifest.md')
const flat = (s) => s.replace(/\s+/g, ' ')

const fails = []
const passes = []
const check = (namn, ok, detalj) => (ok ? passes.push(namn) : fails.push(`${namn}: ${detalj}`))

// ---- Interventionsbeslut (steg 0) -----------------------------------------
// ORDNING, inte bara närvaro: en presenskontroll passerar även om steg 0 flyttats sist.
const iSteg0 = planner.indexOf('0. INTERVENTIONSBESLUT')
const iSteg1 = planner.indexOf('\n1. Read research.md')
check('Interventionsbeslut FINNS i processen', iSteg0 !== -1, 'steg 0 saknas')
check('Interventionsbeslut ligger FÖRE steg 1 (ordningen är själva poängen)',
  iSteg0 !== -1 && iSteg1 !== -1 && iSteg0 < iSteg1,
  `steg 0 vid ${iSteg0}, steg 1 vid ${iSteg1} — beslutet måste komma först`)
// Utfallen måste DEFINIERAS i steg 0 — inte bara nämnas i §7.12:s uppräkning.
// (Falsifiering visade att en global includes() passerade även när steg 0:s
// definition strukits, eftersom §7.12 räknar upp samma namn.)
const steg0 = (planner.split('0. INTERVENTIONSBESLUT')[1] ?? '').split('\n1. Read research.md')[0]
check('Ankare: steg 0-blocket kunde avgränsas', steg0.length > 200,
  'hittade inget avgränsat steg 0-block — utfallskontrollerna vore vacuösa')
for (const utfall of ['NY SAJT', 'FÖRBÄTTRA BEFINTLIG', 'ICKE-SAJT-ÅTGÄRD', 'AVRÅD']) {
  check(`Interventionsutfall "${utfall}" definierat i steg 0`,
    new RegExp(`\\*\\*${utfall}\\*\\* —`).test(steg0), 'saknas som definierat utfall i steg 0')
}
check('Systemet får dra slutsatsen att ny sajt INTE behövs',
  /en ny webbplats inte är det kunden behöver/i.test(flat(planner)), 'slutsatsen saknas')
check('Read-only estate-genomgång före ersättning',
  /read-only estate-genomgång/i.test(flat(planner)), 'saknas')

check('Utfall ≠ NY SAJT registreras som STRATEGISK öppen fråga (annars bygger obemannat ändå)',
  /annat än `NY SAJT` registreras det[\s\S]{0,120}STRATEGISK öppen fråga/.test(flat(planner)),
  'kopplingen till orkestreringens routing saknas')
// S10: registreringen räcker inte — dispositionen måste vara icke-blockerande, annars
// blir routingen ett ägargodkännande-stopp igen.
check('Interventionsfrågan är ICKE-blockerande (ROUTE, inte owner approval)',
  /blocking: false[\s\S]{0,200}routa bort från en ny sajt|routa bort från en ny sajt[\s\S]{0,200}blocking: false/.test(flat(planner)),
  'interventionsfrågan saknar blocking:false — routing skulle bli ett approval-stopp')
check('Interventionsbeslutet returneras maskinläsbart',
  /returneras maskinläsbart som[\s\S]{0,40}interventionsbeslut/.test(flat(planner)),
  'interventionsbeslut saknas som maskinläsbart fält')

// ---- Reality-Layer-distinktioner -------------------------------------------
check('Kundens önskemål ≠ användarens behov',
  /Kundens önskemål ≠ användarens behov/.test(flat(planner)), 'distinktionen saknas')
check('Affärsutfall ≠ användarutfall',
  /affärsutfall ≠ användarutfall/i.test(flat(planner)), 'distinktionen saknas')

// ---- Kapacitetsroutning ----------------------------------------------------
check('Kapacitetssignaler kompileras mot katalogen',
  /Kompilera kapacitetssignaler mot katalogen/.test(planner), 'steg 1b saknas')
check('ROUTE-OUT routas bort, planeras aldrig runt',
  /planera ALDRIG runt gränsen/.test(flat(planner)), 'ROUTE-OUT-regeln saknas')
// Giriga `.*` under /s spände tidigare 17 806 tecken: `blocking: true` bands till en
// helt annan mening 11 kB bort, så bulleten kunde flippas till `blocking: false` — vilket
// gör en obyggd krävd capability icke-blockerande — med 64/64 fortsatt grönt. Fönstret
// är nu bundet till samma mening.
check('Krävd men obyggd kapacitet ⇒ HARD STOPP som STRATEGISK med blocking:true',
  /DECLARED[^.]{0,80}krävs men inte är byggd[^.]{0,60}HARD STOPP[^.]{0,80}STRATEGISK[^.]{0,60}blocking: true/.test(flat(planner)),
  'stoppregeln saknas, är inte STRATEGISK, eller saknar blocking:true i samma mening')

// ---- §7.10–14 --------------------------------------------------------------
const sektioner = {
  10: 'Kapaciteter', 11: 'Toppuppgifter & resor', 12: 'Interventionsbeslut',
  13: 'Framgångsmått', 14: 'Förbjudna påståenden & olösta okändheter',
}
for (const [nr, namn] of Object.entries(sektioner)) {
  check(`§7.${nr} ${namn}`, new RegExp(`^${nr}\\. \\*\\*${namn.replace(/[&]/g, '&')}`, 'm').test(planner),
    'sektionen saknas eller har annan rubrik')
}
check('§7.13 föder HANDOVER:s Utfallshypotes (kedjan till LEARNING-RECORD)',
  /föder HANDOVER:s Utfallshypotes/.test(flat(planner)), 'kopplingen saknas')

// ---- Assuranceprofil -------------------------------------------------------
check('Assuranceprofil: STANDARD är default', /`STANDARD` som default/.test(flat(planner)), 'saknas')
check('Ingen extra ceremoni utan NAMNGIVET skäl',
  /aldrig samla på sig extra ceremoni utan ett NAMNGIVET skäl/i.test(flat(planner)), 'regeln saknas')

// ---- Domänauktoritet -------------------------------------------------------
check('Domänauktoritetsfrågor märks DOMÄNEXPERT', /DOMÄNEXPERT/.test(planner), 'klassen saknas')
check('Kund-SME är auktoritet på SAKFAKTA, aldrig på UX',
  /auktoritet på SAKFAKTA, aldrig på UX/.test(flat(planner)), 'gränsdragningen saknas')
check('Klassen sätts per rad, aldrig tyst default',
  /per rad — aldrig som tyst default/.test(flat(planner)), 'regeln saknas')

// ---- Kapacitetskatalogen ---------------------------------------------------
// Markdown tillåter escapad pipe i en cell (t.ex. `lokal\|hybrid`); en naiv split på
// "|" räknar då en extra kolumn. Vi delar därför endast på OESCAPADE pipes.
const celler = (rad) => rad.replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim())
const rader = [...katalog.matchAll(/^\| `(KAP-[A-ZÅÄÖ0-9-]+)` \|([^\n]*)\|$/gm)]
check('Ankare: katalogen har rader att pröva', rader.length > 0, 'inga KAP-rader hittades')
// EVASIONSVAKT: en rad utan backticks eller med annat id-prefix vore osynlig för varje
// radkontroll ovan. Antalet datarader i ## Katalogen måste därför matcha exakt.
const katalogAvsnitt = (katalog.split('\n## Katalogen')[1] ?? '').split('\n## ')[0]
const dataRader = katalogAvsnitt.split('\n').filter((r) => /^\| /.test(r) && !/^\|\s*-+/.test(r) && !/^\| ID \|/.test(r))
check('Alla katalograder fångas av radmönstret (ingen rad kan gömma sig)',
  dataRader.length === rader.length,
  `${dataRader.length} datarader i tabellen men bara ${rader.length} matchade mönstret`)
if (rader.length > 0) {
  for (const r of rader) {
    const kolumner = celler(r[0])
    const tomma = kolumner.map((c, i) => (c === '' || c === '—' ? i : -1)).filter((i) => i >= 0)
    // ROUTE-OUT-rader FÅR ha tomt krav-fält (de routas bort, de levereras inte).
    const arRouteOut = kolumner.at(-1) === 'ROUTE-OUT'
    const otillatnaTomma = tomma.filter((i) => !(arRouteOut && i === 2))
    check(`Katalograd ${r[1]} har alla fält IFYLLDA`,
      kolumner.length === 5 && otillatnaTomma.length === 0,
      `${kolumner.length} kolumner, tomma fält på plats ${otillatnaTomma.join(',') || '-'}`)
  }
  const statusar = rader.map((r) => celler(r[0]).at(-1))
  const giltiga = new Set(['DECLARED', 'BUILT', 'VALIDATING', 'PROVEN', 'ROUTE-OUT'])
  check('Alla katalogstatusar hör till vokabulären',
    statusar.every((s) => giltiga.has(s)), `okänd status: ${statusar.filter((s) => !giltiga.has(s))}`)
  // ÄRLIGHETSKRAV: ingen rad får stå PROVEN utan riktig kundevidens, och den finns inte.
  check('Ingen katalograd påstår PROVEN vid n≈1',
    !statusar.includes('PROVEN'), 'en rad står PROVEN utan riktig kundevidens')
}
for (const id of ['KAP-EHANDEL', 'KAP-EGET-TILLSTAND']) {
  const rad = rader.find((r) => r[1] === id)
  check(`${id} står kvar som ROUTE-OUT`, !!rad && celler(rad[0]).at(-1) === 'ROUTE-OUT',
    'medveten gräns har tyst blivit en krävd-men-obyggd kapacitet')
}
check('Universella alltid-på-egenskaper är KÄRNREGLER, inte katalograder',
  /är KÄRNREGLER, inte katalograder/.test(flat(katalog)), 'gränsdragningen saknas')
// Skanna HELA raden — en kolumn-2-kontroll missar en rad som smyger in egenskapen i
// kravkolumnen. Universella alltid-på-egenskaper får aldrig se ut som valbara tillval.
for (const universell of ['faktatrohet', 'tillgänglighet', 'wcag', 'säkerhet', 'sakerhet']) {
  const traff = rader.filter((r) => r[0].toLowerCase().includes(universell))
  check(`"${universell}" är inte en katalograd`, traff.length === 0,
    `står som katalograd: ${traff.map((r) => r[1]).join(', ')}`)
}

// ---- Plan-skillen (måste inte drifta isär från plannern) -------------------
const skill = read('skills/nortropic-plan/SKILL.md')
check('Plan-skillen kör interventionsbeslutet före planeringen',
  /2b\.[\s\S]{0,200}INTERVENTIONSBESLUT/i.test(skill), 'steg 2b saknas i plan-skillen')
check('Plan-skillen kräver STRATEGISK vid utfall ≠ NY SAJT',
  /annat än `NY SAJT` registreras dessutom som STRATEGISK/.test(flat(skill)), 'kopplingen saknas')
check('Plan-skillen sätter interventionsfrågan icke-blockerande',
  /STRATEGISK öppen fråga med `blocking: false`/.test(flat(skill)), 'blocking:false saknas i skillen')
check('Plan-skillen HARD-stoppar på obyggd krävd kapacitet',
  /HARD STOPP som STRATEGISK öppen fråga med `blocking: true`/.test(flat(skill)), 'blocking:true saknas i skillen')
check('Plan-skillen kompilerar kapaciteter mot katalogen',
  /2c\.[\s\S]{0,160}kapacitetssignaler mot/i.test(skill), 'steg 2c saknas')
check('Plan-skillen routar ROUTE-OUT bort',
  /ROUTE-OUT.{0,60}routas bort/is.test(flat(skill)), 'ROUTE-OUT-regeln saknas i skillen')
check('Plan-skillen namnger §7.10–14 och Assurance-raden',
  /§7\.10–14/.test(skill) && /`Assurance:`/.test(skill), 'skillens §7-uppräkning är stale')

// ---- Assurance-raden skrivs ALLTID ----------------------------------------
check('Assurance-nivån skrivs alltid ut, även STANDARD',
  /Assurance: STANDARD` när inget höjer den/.test(flat(planner)),
  'STANDARD registreras inte — ett tomt fält är inte STANDARD')

// ---- Paketmanifestet -------------------------------------------------------
check('Paketet är ÄNNU INTE §A-zonat', /ÄNNU INTE §A-zonat/.test(flat(manifest)), 'zonstatus saknas')
check('Nattskiftets Zon 1 förblir VILANDE', /Zon 1[\s\S]{0,60}VILANDE/.test(flat(manifest)), 'saknas')
check('Kapacitetspaket ≠ affärspaket (§A5) — gränsen SÄGS UT, inte bara refereras',
  /[Pp]riser, paketinnehåll och kundlöften är[\s\S]{0,40}§A5 och bor aldrig här/.test(flat(manifest)),
  'gränssatsen saknas eller är inverterad')
check('Strategimodulen ersätter det retirerade profilbiblioteket',
  /ersätter det RETIRERADE `~\/Workflow\/profiler\/`/.test(flat(manifest)), 'ersättningen sägs inte ut')
check('ANTAGEN bransch aktiverar aldrig paketet',
  /ANTAGEN.*aktiverar aldrig paketet/is.test(flat(manifest)), 'hypotesspärren saknas')

// ---- Regressionsvakt: inga LEVANDE pekare till det retirerade profilbiblioteket ----
// En hit är tillåten ENDAST om den på samma rad är märkt som retirerad/ersatt. En
// allowlist per fil hade vuxit tyst; ett semantiskt krav gör att varje ny omnämning
// måste bära sin egen sanning.
let hits = ''
try {
  hits = execFileSync('git', ['grep', '-n', 'Workflow/profiler', '--',
    ':!vendored-skills', ':!docs/05*', ':!tests/fixtures', ':!agents/nortropic-steward.md',
    ':!scripts/check-planner-routing.mjs'],
    { cwd: ROT, encoding: 'utf8' }).trim()
} catch { /* git grep ger exit 1 vid noll träffar */ }
const MARKERAD = /retirerat|retirerad|retirerade|ersatt|ersätter|pensionerad|pensionerades|RETIRERAT/i
const levande = hits
  ? hits.split('\n').filter((rad) => !MARKERAD.test(rad)).map((rad) => rad.split(':').slice(0, 2).join(':'))
  : []
check('Inga LEVANDE pekare till det retirerade profilbiblioteket',
  levande.length === 0,
  `pekar dit utan retirerad-märkning: ${levande.join(', ')}`)

// ---- Verdikt ---------------------------------------------------------------
for (const p of passes) console.log(`PASS: ${p}`)
if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`)
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} kontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} routing-/katalog-/manifestkontroller`)
process.exit(0)
