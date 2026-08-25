#!/usr/bin/env node
// S4: mekaniska kontroller för Site Quality Contract (profile.ts v2), kärna/paket-
// delningen, bakåtkompatibilitetslagen och stateless-vakten (D8).
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.
// Ankarkrav: en tom träffmängd är PASS endast om ankaret först bevisats existera.

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

const stack = las('skills/nortropic-stack/SKILL.md')
const katalog = las('docs/kapacitetskatalog.md')
const flat = (s) => s.replace(/\s+/g, ' ')

const fails = []
const passes = []
const check = (namn, ok, detalj) => (ok ? passes.push(namn) : fails.push(`${namn}: ${detalj}`))

// Avgränsa v2-avsnittet — kontroller mot HELA filen skulle kunna passera på
// v1-texten och därmed inte bevisa något om v2.
const iV2 = stack.indexOf('### SITE QUALITY CONTRACT v2 — profile.ts')
check('Ankare: v2-avsnittet kunde avgränsas', iV2 !== -1, 'v2-rubriken saknas i nortropic-stack')
const v2 = iV2 === -1 ? '' : stack.slice(iV2)

// ---- Ingen syskonsanning (D3) ----------------------------------------------
check('profile.ts är Site Quality Contract-bäraren',
  /`content\/profile\.ts` ÄR Site Quality Contract-bäraren/.test(flat(v2)), 'bärarrollen sägs inte ut')
check('Ingen syskon-JSON / parallell sanning',
  /INGEN\s+syskon-JSON/i.test(flat(v2)) && /ingen parallell organisationsprofil/i.test(flat(v2)),
  'förbudet mot en andra sanning saknas')

// ---- De sexton fältgrupperna -----------------------------------------------
const FALT = [
  ['profilKontraktVersion', 'kontraktsversion'],
  ['katalogVersion', 'katalogversion'],
  ['paket', 'paket'],
  ['primaraktion', 'primärhandling'],
  ['anvandare', 'användare'],
  ['toppuppgifter', 'toppuppgifter'],
  ['kapaciteter', 'kapaciteter'],
  ['interventionsbeslut', 'interventionsbeslut'],
  ['kvitton', 'förtroendekrav'],
  ['obligatoriskaResor', 'obligatoriska resor'],
  ['forbjudnaPastaenden', 'förbjudna påståenden'],
  ['kvalitetsnivaer', 'kvalitetsnivåer'],
  ['integrationer', 'integrationer'],
  ['framgangsmatt', 'framgångsmått'],
  ['olostaOkandheter', 'olösta okändheter'],
  ['godkannandeTillstand', 'godkännande-/färskhetstillstånd'],
  ['belaggspekare', 'beläggspekare'],
]
// Ankarkrav: fälttabellen måste finnas innan enskilda fältkontroller betyder något.
const faltrader = [...v2.matchAll(/^\| `([a-zA-ZåäöÅÄÖ]+)` \|/gm)].map((m) => m[1])
check('Ankare: v2 har en fälttabell att pröva', faltrader.length >= 15,
  `hittade ${faltrader.length} fältrader`)
for (const [namn, beskrivning] of FALT) {
  check(`Fältet \`${namn}\` (${beskrivning})`, faltrader.includes(namn),
    'saknas i v2-fälttabellen')
}

// ---- Bakåtkompatibilitetslagen ---------------------------------------------
check('v1-profil är GILTIG', /En v1\.x-profil är GILTIG/.test(flat(v2)), 'lagen saknas')
check('Grindar FAILar aldrig enbart på v1-stämpel',
  /FAILar ALDRIG enbart[\s\S]{0,60}profilKontraktVersion/.test(flat(v2)), 'regeln saknas')
check('Saknat v2-fält läses som SAKNAS_I_V1, aldrig tomt/falskt/noll',
  /`SAKNAS_I_V1` — aldrig som tomt, falskt eller noll/.test(flat(v2)), 'regeln saknas')
check('En frånvaro är okänd, inte ett negativt svar',
  /frånvaro är okänd, inte ett negativt svar/.test(flat(v2)), 'motiveringen saknas')
check('Migrering är additiv och en EGEN handling',
  /Migrering är additiv och en egen handling/i.test(flat(v2)), 'migreringsregeln saknas')
check('Samtliga v1.1.0-fält står kvar oförändrade',
  /Samtliga v1\.1\.0-fält står kvar oförändrade/.test(flat(v2)), 'bevarandet sägs inte ut')
for (const v1falt of ['primaraktion', 'gate1Test', 'kvitton', 'schemaTyp', 'seoLage',
                      'juridikflaggor', 'rostregister', 'branschAntislop', 'motionNiva', 'noindexCutover']) {
  check(`v1-fältet \`${v1falt}\` bevarat`, new RegExp(`\`${v1falt}\``).test(v2),
    'nämns inte i bevarandelistan')
}

// ---- Stateless-vakten (D8) --------------------------------------------------
check('Stateless-vakten bär den mekaniska gränsfrågan ordagrant',
  /Håller sajtrepot tillstånd som operatören måste förvalta\?/.test(flat(v2)),
  'D8:s gränsfråga saknas')
// Avgränsa D8-blocket: kontroller mot hela v2 kunde annars matcha lösryckta fraser
// i ett stycke som säger motsatsen.
const iD8 = v2.indexOf('#### STATELESS-VAKTEN')
check('Ankare: D8-blocket kunde avgränsas', iD8 !== -1, 'STATELESS-VAKTEN-rubriken saknas')
const d8Slut = iD8 === -1 ? 0 : (v2.indexOf('####', iD8 + 4) === -1 ? v2.length : v2.indexOf('####', iD8 + 4))
const d8 = iD8 === -1 ? '' : flat(v2.slice(iD8, d8Slut))
check('hallerTillstand=true är per definition UTANFÖR (icke-inverterat)',
  /hallerTillstand: true[^]{0,90}är per definition \*{0,2}utanför/i.test(d8) &&
  !/INTE\s+utanför\s*(\*\*)?\s*(vallgraven|—|-|\.)/i.test(d8),
  'utanför-regeln saknas eller är inverterad')
check('D8 är en DISKVALIFIKATION, inte ett råd',
  /DISKVALIFIKATION, inte en\s*rekommendation/i.test(d8) &&
  /aldrig omformuleras till ett råd/i.test(d8) &&
  !/(bör|kan) .{0,40}byggas ändå/i.test(d8),
  'vakten är uppmjukad till en rekommendation')
check('Det är EXTERN SaaS som inte bryter vallgraven',
  /EXTERN SaaS håller tillståndet[^]{0,120}bryter INTE vallgraven/i.test(d8),
  'undantaget är inte bundet till extern SaaS — en egen databas kunde läsas som tillåten')
check('Eget tillstånd i repot bryter ALLTID vallgraven',
  /sajtrepot SJÄLVT[^]{0,120}bryter den alltid/i.test(d8), 'motsatsen sägs inte ut')
check('statelesshet är ett FÄLT i kontraktet, inte bara prosa',
  faltrader.includes('statelesshet'), 'saknas som rad i v2-fälttabellen')
check('Vallgraven motiveras som säkerhetsegenskap',
  /säkerhetsegenskap/.test(flat(v2)), 'motiveringen saknas')

// ---- Kärna/paket-delningen --------------------------------------------------
check('Scaffolden delas i kärna och paketvillkorat',
  /Scaffolden delas i två lager/.test(flat(v2)), 'delningen saknas')
check('Kärnan byggs oavsett paket',
  /Kärnan\*{0,2} byggs för varje sajt oavsett paket/.test(flat(v2)), 'kärndefinitionen saknas')
check('Paketvillkorat byggs endast när paketet är BELAGT',
  /byggs endast när paketet är BELAGT/.test(flat(v2)), 'villkoret saknas')
check('core-only är ett GILTIGT bygge',
  /core-only\) är ett GILTIGT bygge/.test(flat(v2)), 'core-only markeras inte giltigt')
check('Frånvaro av ortssidor vid core-only är inget fynd',
  /frånvaron av ortssidor är då korrekt, aldrig[\s\S]{0,20}granskningsfynd/.test(flat(v2)),
  'regeln saknas')

// ---- Sammanhang mot S3 ------------------------------------------------------
check('katalogVersion pekar mot den verkliga katalogen',
  /docs\/kapacitetskatalog\.md/.test(v2) && /^# Kapacitetskatalog/m.test(katalog),
  'katalogpekaren eller katalogen saknas')
check('interventionsbeslutets fyra utfall speglar S3',
  ['NY SAJT', 'FÖRBÄTTRA BEFINTLIG', 'ICKE-SAJT-ÅTGÄRD', 'AVRÅD'].every((u) => v2.includes(u)),
  'utfallsmängden avviker från plannerns')
check('kvalitetsnivaer bär STANDARD som default',
  /'STANDARD'` som default/.test(flat(v2)), 'assurance-defaulten saknas')

// ---- Konsumentkoppling (kontraktet får inte drifta från sina läsare) -------
const builder = las('agents/stack-builder.md')
const prelaunch = las('skills/nortropic-prelaunch/SKILL.md')
const qa = las('agents/qa-launcher.md')
const struktur = las('skills/nortropic-stack/references/file-structure.md')

check('stack-builder stämplar v1.2.0 (inte en MAJOR som fäller gamla repon)',
  /profilKontraktVersion: 'v1\.2\.0'/.test(flat(builder)) && /Site Quality Contract v2/.test(flat(builder)),
  'byggaren stämplar fel version eller nämner inte kontraktsgenerationen')
// EN deklaration: doctor #5 läser den literala token — två deklarationer vore odömbart.
const deklarationer = [...stack.matchAll(/profile\.ts-kontraktsversion: v[0-9]+\.[0-9]+\.[0-9]+/g)]
check('Exakt EN deklarerad kontraktsversion i nortropic-stack',
  deklarationer.length === 1, `hittade ${deklarationer.length} deklarationer — doctor #5 kan inte parsa entydigt`)
check('Den deklarerade versionen är v1.2.0 (samma MAJOR som befintliga repon)',
  /profile\.ts-kontraktsversion: v1\.2\.0/.test(stack), 'MAJOR-bump skulle fälla varje v1-repo i doctor #5')
check('Motiveringen till MINOR står utskriven',
  /annan MAJOR än kontraktet = FAIL/.test(flat(v2)) && /varje befintligt kundrepo hade fallit/.test(flat(v2)),
  'skälet till att det INTE är en MAJOR saknas')
check('Doctor #5 redovisas som UPPFYLLD, inte undantagen',
  /gäller oförändrad — och är UPPFYLLD/.test(flat(v2)) && /1\.1\.0 ≤ 1\.2\.0/.test(flat(v2)),
  'lagen påstår kompatibilitet utan att visa att vakten faktiskt håller')
check('stack-builder förbjuder syskon-JSON UTAN undantag',
  /skapa ALDRIG en syskon-JSON/.test(flat(builder)) &&
  !/syskon-JSON[^]{0,120}(utom|förutom|om briefen)/i.test(flat(builder)),
  'förbudet saknas eller är urholkat med ett undantag')
check('stack-builder bär stateless-gränsfrågan',
  /håller\s*sajtrepot tillstånd som operatören måste förvalta\?/i.test(flat(builder)),
  'D8-frågan saknas hos byggaren')
check('stack-builder backfillar additivt utan att gissa',
  /backfilla additivt[\s\S]{0,80}gissa aldrig värden/.test(flat(builder)), 'migreringsregeln saknas')
check('stack-builder bygger paketvillkorat endast vid belagt paket',
  /byggs ENDAST när paketet är belagt/.test(flat(builder)), 'kärna/paket-regeln saknas hos byggaren')

// Regionen MÅSTE vara Gate 1 SJÄLV. Tidigare togs FÖRSTA raden som nämnde både
// profile.ts och "Gate 1" — en LOCKBETESRAD strax under frontmattern fångade då
// ankaret medan den riktiga grinden tömdes. Vi binder därför rubriken/punkten och
// kräver att den är ENTYDIG.
for (const [namn, text] of [['prelaunch', prelaunch], ['qa-launcher', qa]]) {
  const rader = text.split('\n')
  const traffar = rader
    .map((r, i) => [r, i])
    .filter(([r]) => /^(#{1,6}\s*|[-*]\s*\*\*)Gate 1\b/.test(String(r)))
  check(`Ankare: Gate 1-rubriken/-punkten är ENTYDIG i ${namn}`, traffar.length === 1,
    `hittade ${traffar.length} Gate 1-ankare — ett lockbete kan fånga fel region`)
  const iGate = traffar.length === 1 ? traffar[0][1] : -1
  // Regionen sträcker sig till nästa rubrik/punkt på samma nivå, inte ett fast antal rader.
  // Terminatorn beror på ANKARETS ART. Är ankaret en RUBRIK sträcker sig regionen till
  // nästa rubrik (hela grindavsnittet, inklusive dess checklista). Är ankaret en PUNKT
  // slutar den vid nästa punkt eller rubrik.
  //
  // Båda ytterligheterna har prövats och fällts: bara fetstilta Gate-punkter som
  // terminator lät regionen svälja qa-launchers Gate 2–5 (meningen kunde bo i Gate 3),
  // medan VILKEN punkt som helst kapade prelaunch till rubriken plus en prosarad — då
  // falsklarmade den mest naturliga placeringen av alla, meningen som ett `- [ ]`-steg
  // inne i Gate 1. En vakt som fäller på den naturligaste formuleringen blir brus.
  const ankareArRubrik = /^#{1,6}\s/.test(rader[iGate] ?? '')
  const terminator = ankareArRubrik ? /^#{1,6}\s/ : /^(#{1,6}\s|[-*]\s)/
  let slut = rader.length
  for (let j = iGate + 1; iGate !== -1 && j < rader.length; j++) {
    if (terminator.test(rader[j])) { slut = j; break }
  }
  const region = iGate === -1 ? '' : flat(rader.slice(iGate, slut).join(' '))
  check(`Gate 1 (${namn}) läser profile.ts i sin egen region`,
    /profile\.ts/.test(region), 'Gate 1-regionen nämner inte profile.ts')
  check(`Gate 1 (${namn}) FAILar inte enbart på v1-stämpel — I GRINDEN`,
    /är GILTIG — grinden FAILar ALDRIG enbart på stämpeln/.test(region),
    'regeln står inte i Gate 1:s egen region (bilaga, lockbete eller kommentar räknas inte)')
  check(`Gate 1 (${namn}) läser saknat v2-fält som SAKNAS_I_V1 — I GRINDEN`,
    /`SAKNAS_I_V1`[^]{0,90}aldrig som tomt eller falskt/.test(region),
    'frånvarosemantiken står inte i Gate 1:s egen region')
}

check('Scaffolden märker profile.ts som KÄRNA + enda bäraren',
  /profile\.ts[^\n]*KÄRNA[^\n]*SITE QUALITY CONTRACT v2/.test(struktur),
  'profile.ts är inte märkt som kärna/bärare i filstrukturen')
check('Scaffolden märker areas.ts som PAKETVILLKORAT',
  /areas\.ts[^\n]*PAKETVILLKORAT \(lokal-se\)/.test(struktur),
  'ortssidorna är inte märkta paketvillkorade')
check('Scaffolden säger att frånvaro vid core-only inte är ett fynd',
  /vid core-only är frånvaron korrekt, aldrig ett fynd/.test(struktur), 'regeln saknas i filstrukturen')

// ---- Verdikt ---------------------------------------------------------------
for (const p of passes) console.log(`PASS: ${p}`)
if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`)
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} kontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} kontraktskontroller`)
process.exit(0)
