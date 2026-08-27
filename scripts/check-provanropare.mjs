#!/usr/bin/env node
console.log('VAKT: check-provanropare.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig
// PROVANROPARNA — vakten mot att ett prov byggs och sedan aldrig körs.
//
// VARFÖR DEN HÄR FILEN FINNS. Inventeringen 2026-08-27 svepte efter ANROPARE i stället för
// efter kontroller, och det gav ett sämre svar än väntat: **fjorton provfiler hade ingen.**
//
//   tests/fixtures/foundation/kontroller.sh   nio kontroller om systemets grundvalar
//   tests/controller/*/fall.py                åtta kontraktssviter för styrplanet
//   tests/controller/provenance/test_*.py     fyra proveniensprov
//   tests/scripts/*/publication-callers.py    publiceringsvägens auktoritetsprov
//
// Kostnaden var mätbar, inte hypotetisk: `tests/controller/loop/fall.py` hade varit RÖD
// sedan 2026-08-26 därför att styrplanets verifierarregister pinnar en fil som
// webbförvaltningen redigerade. **Grinden gjorde precis rätt och ingen såg det.** En
// regression som ingen mekanism letar efter är en regression som bor kvar.
//
// **BYGGT · GRANSKAT · TESTAT ÄR TRE SAKER.** Ett prov utan anropare är byggt och kanske
// granskat, men det är inte testat — och skillnaden märks först den dagen det skulle ha
// fällt något. Den här vakten prövar det tredje ledet: att varje prov är NÅGONS ansvar.
//
// TÄCKNINGEN DEKLARERAS, DEN HÄRLEDS INTE UR BETEENDE. En körare säger i sin egen källa
// `// TÄCKER: <glob>` vad den tar ansvar för. Att i stället köra varje körare och se vad den
// råkar röra hade gjort täckningen till en observation av dagens beteende — och en körare
// som tyst slutar täcka något hade sett ut som en körare med mindre att göra.
//
// REGISTRET ÄR INGEN NÖDUTGÅNG. `UTAN_ANROPARE` är listan över det som förlitar sig på att
// en MÄNNISKA kommer ihåg — alltså exakt den klass som orsakade fyndet. Den skrivs ut vid
// varje grön körning i stället för att gömmas, och en rad som blivit TÄCKT fäller: ett
// register som beskriver ett läge som passerat är farligare än inget register.
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

const passes = []
const fails = []
const check = (namn, ok, detalj) => (ok ? passes.push(namn) : fails.push(`${namn}: ${detalj}`))
const FORVANTAD_KALLHASH = 'fbd406fcc9c78556'

// ---- DET SOM FÖRLITAR SIG PÅ MÄNSKLIGT MINNE, utskrivet ---------------------
// Varje rad är en skuld, inte ett undantag. Skälet måste säga VEM som kör och NÄR.
const UTAN_ANROPARE = {
  'scripts/kor-vakter.mjs': 'körare — körs avsiktligt före varje commit (arbetsloopens steg 5)',
  'scripts/kor-mutationsprov.mjs': 'körare — körs avsiktligt när en vakt byggs eller ändras; mäter om vakterna försvarar sina egna ankare och tar några minuter',
  'scripts/kor-styrprov.mjs': 'körare — körs avsiktligt; kan inte ligga i batteriet så länge loop/envelope är röda, eftersom ett rött batteri slutar vara en grind',
  'scripts/gsc-setup.mjs': 'operatörskört — den irreversibla GSC-skrivningen är alltid en människas hand',
  'scripts/run-axe-gate.mjs': 'grindkörare — Gate 4 mot ett mål som inte finns i repot',
  'scripts/run-lighthouse-gate.mjs': 'grindkörare — Gate 2 kräver en deployad preview, alltså http(s)',
  'scripts/verify-vendored-integrity.mjs': 'anropas av stewardens doctor #9A, inte av batteriet',
  'scripts/profil-las.mjs': 'MODUL, inget prov — importeras av två vakter och är ankrad i pinntabellen',
  'scripts/nortropic-codex-autopilot.py': 'exekverare i styrplanet, inget prov — prövas av verify/bin/h-032-exit (ägarhand)',
}

// ---- MEKANISMEN, FAKTORISERAD UT -------------------------------------------
// `tacka` avgör allt ur (kandidater, körarkällor, register) och rör inget globalt. Därför
// kan den köras mot en SYNTETISK värld och tvingas bevisa att den kan säga NEJ.

// Glob → regex. Bara `*` stöds, och den matchar ALDRIG `/`: en täckning skriven
// `tests/*` får inte tyst svälja hela underträdet och därmed förklara allt täckt.
// Exekveringskonstruktioner: de sätt en körare i det här repot faktiskt STARTAR något.
const EXEKVERAR = /\b(spawnSync|execFileSync|execSync|spawn)\s*\(/

const globTillRegex = (g) =>
  new RegExp(`^${g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')}$`)

function tacka(kandidater, korare, register) {
  const globar = []
  for (const [fil, kalla] of Object.entries(korare)) {
    for (const m of kalla.matchAll(/^\/\/ TÄCKER: (\S+)$/gm)) globar.push({ av: fil, glob: m[1] })
  }
  const resultat = []
  for (const k of kandidater) {
    const viaGlob = globar.filter((g) => globTillRegex(g.glob).test(k)).map((g) => g.av)
    // ATT NÄMNA ÄR INTE ATT KÖRA — och vakten fällde sig själv på det. Första formen lät
    // varje källa som innehöll sökvägen räknas som anropare, och då "täckte" DEN HÄR
    // FILENS EGET REGISTER de tio filer det bara listar. Ett register som förklarar sig
    // självt täckt är den renaste formen av det återkommande felet: den prövade vad
    // utdata SÄGER (står namnet där?) i stället för vad mekanismen GÖR (startas filen?).
    // Kravet är därför sökvägen OCH en faktisk exekveringskonstruktion i samma källa.
    const viaNamn = Object.entries(korare)
      .filter(([f, kalla]) => f !== k && kalla.includes(k) && EXEKVERAR.test(kalla))
      .map(([f]) => f)
    const anropare = [...new Set([...viaGlob, ...viaNamn])]
    resultat.push({ fil: k, anropare, registrerad: Object.prototype.hasOwnProperty.call(register, k) })
  }
  const fynd = []
  for (const r of resultat) {
    if (r.anropare.length === 0 && !r.registrerad) {
      fynd.push({ typ: 'utan-anropare', fil: r.fil,
        text: `${r.fil} körs av ingenting och står inte i UTAN_ANROPARE — byggt, kanske granskat, men aldrig testat` })
    }
    if (r.anropare.length > 0 && r.registrerad) {
      fynd.push({ typ: 'inaktuell-registerrad', fil: r.fil,
        text: `${r.fil} täcks nu av ${r.anropare.join(', ')} men står kvar i UTAN_ANROPARE — ett register som beskriver ett passerat läge är farligare än inget` })
    }
  }
  for (const fil of Object.keys(register)) {
    if (!kandidater.includes(fil)) {
      fynd.push({ typ: 'spokrad', fil,
        text: `${fil} står i UTAN_ANROPARE men finns inte bland kandidaterna — en skuld för något som inte finns döljer att listan inte längre stämmer` })
    }
  }
  if (globar.length === 0) fynd.push({ typ: 'ingen-tackning-deklarerad', fil: '—',
    text: 'ingen körare deklarerar någon TÄCKER-rad — då är varje fil "otäckt" av samma skäl, och vakten mäter sin egen trasighet' })
  return { resultat, globar, fynd }
}

// ---- POSITIVT KONTROLLPROV --------------------------------------------------
const K = (t) => ({ 'r.mjs': `// TÄCKER: ${t}\n` })
for (const [namn, [kand, kor, reg, ok]] of Object.entries({
  'täckt fil flaggar INGENTING': [['a/x.py'], K('a/*.py'), {}, (f) => f.length === 0],
  'OTÄCKT fil utan registerrad FLAGGAS': [['a/x.py'], K('b/*.py'), {}, (f) => f.some((x) => x.typ === 'utan-anropare')],
  'otäckt fil MED registerrad flaggas inte': [['a/x.py'], K('b/*.py'), { 'a/x.py': 'skäl' }, (f) => f.length === 0],
  'registerrad för en fil som BLIVIT täckt FLAGGAS': [['a/x.py'], K('a/*.py'), { 'a/x.py': 'skäl' },
    (f) => f.some((x) => x.typ === 'inaktuell-registerrad')],
  'SPÖKRAD i registret FLAGGAS': [['a/x.py'], K('a/*.py'), { 'b/borta.py': 'skäl' },
    (f) => f.some((x) => x.typ === 'spokrad')],
  'INGEN deklarerad täckning alls FLAGGAS': [['a/x.py'], { 'r.mjs': '// ingen markör\n' }, { 'a/x.py': 'skäl' },
    (f) => f.some((x) => x.typ === 'ingen-tackning-deklarerad')],
  '`*` korsar ALDRIG en katalognivå': [['a/b/x.py'], K('a/*.py'), {},
    (f) => f.some((x) => x.typ === 'utan-anropare')],
  'ORDAGRANT namn PLUS exekvering täcker': [['a/x.sh'],
    { 'r.mjs': "// TÄCKER: q/*\nspawnSync('sh', ['a/x.sh'])\n" }, {}, (f) => f.length === 0],
  'ATT NÄMNA UTAN ATT EXEKVERA täcker INTE': [['a/x.sh'],
    { 'r.mjs': "// TÄCKER: q/*\nconst REGISTER = { 'a/x.sh': 'skäl' }\n" }, {},
    (f) => f.some((x) => x.typ === 'utan-anropare')],
  'en fil täcker inte SIG SJÄLV genom att nämna sitt eget namn': [['r.mjs'],
    { 'r.mjs': "// TÄCKER: q/*\n// filen heter r.mjs\n" }, {},
    (f) => f.some((x) => x.typ === 'utan-anropare')],
})) {
  const r = tacka(kand, kor, reg)
  check(`Kontrollprov: ${namn}`, ok(r.fynd),
    `mekanismen gav ${JSON.stringify(r.fynd.map((x) => x.typ))} — ett prov som inte kan falla bevisar ingenting`)
}

// ---- KOPPLINGSKONTROLL ------------------------------------------------------
const kalltext = readFileSync(fileURLToPath(import.meta.url), 'utf8')
check('Kopplingskontroll: `tacka` anropas på den VERKLIGA mängden',
  /const verkligt = tacka\(kandidater, korarkallor, UTAN_ANROPARE\)/.test(kalltext),
  'provet prövar en funktion som inte används — då är den död kod och trädet går obevakat')
check('Kopplingskontroll: fynden VÄGS IN i domen', /verkligt\.fynd/.test(kalltext),
  'en analys vars resultat inte läses nedströms är en dekoration')

// ---- DEN VERKLIGA MÄNGDEN ---------------------------------------------------
let spar
try {
  spar = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'],
    { cwd: ROT, encoding: 'utf8' }).split('\n').filter(Boolean)
} catch { odombart('git ls-files misslyckades — kandidatmängden går inte att avgränsa') }

// Kandidater: allt körbart som kan bära ett prov. `.c`-filerna under provenance är
// FIXTURER som proven kompilerar, inte prov i sig — de körs aldrig fristående.
const kandidater = spar
  .filter((f) => /^(tests|scripts)\/.+\.(py|sh|mjs)$/.test(f))
  .filter((f) => existsSync(join(ROT, f)))
  .sort()
if (kandidater.length === 0) odombart('noll kandidater — en tom mängd är aldrig ett rent resultat')
check('Ankare: kandidatmängden är rimlig', kandidater.length >= 20,
  `bara ${kandidater.length} kandidater — mönstret har sannolikt slutat träffa, och då mäter vakten sin egen blindhet`)
check('Ankare: de fyra kända okörda ligger i mängden',
  ['tests/fixtures/foundation/kontroller.sh', 'tests/controller/loop/fall.py',
    'tests/controller/provenance/test_native_authority.py',
    'tests/scripts/nortropic-codex-autopilot/publication-callers.py'].every((f) => kandidater.includes(f)),
  'de filer som avslöjade problemet räknas inte längre — uppräkningen är trasig, inte trädet')

// DEN HÄR FILEN ÄR INGEN KÖRARE. Den bär registret och skulle annars räknas som anropare
// till varje rad i det — se resonemanget vid `viaNamn`. Uteslutningen är EXPLICIT och
// prövas nedan, så att den inte tyst kan bli en väg att undanta något annat.
const MIG = 'scripts/check-provanropare.mjs'
const korarkallor = Object.fromEntries(kandidater
  .filter((f) => /^scripts\/(kor|check)-.+\.mjs$/.test(f) && f !== MIG)
  .map((f) => [f, readFileSync(join(ROT, f), 'utf8')]))
check('Vakten räknar inte SIG SJÄLV som körare', !(MIG in korarkallor),
  'registerfilen står i körarmängden — då täcker den varje rad den bara listar, och registret förklarar sig självt kört')
const verkligt = tacka(kandidater, korarkallor, UTAN_ANROPARE)

for (const typ of ['ingen-tackning-deklarerad', 'utan-anropare', 'inaktuell-registerrad', 'spokrad']) {
  const t = verkligt.fynd.filter((x) => x.typ === typ)
  check(`Ingen fil är ${typ}`, t.length === 0, t.map((x) => x.text).join(' · '))
}

// Registret får aldrig vattnas ur till tomma ord. Ett skäl som inte säger VEM eller NÄR är
// ingen skuld — det är en formalitet som ser ut som en.
const tunna = Object.entries(UTAN_ANROPARE).filter(([, skal]) => typeof skal !== 'string' || skal.length < 25)
check('Varje registerrad bär ett SKÄL, inte en etikett', tunna.length === 0,
  `${tunna.map(([f]) => f).join(', ')} har ett skäl kortare än 25 tecken — ett skäl som inte säger vem som kör och när är ingen skuld`)

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
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} anroparkontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} anroparkontroller över ${kandidater.length} kandidater (källhash ${kallhash})`)
console.log('\nDEKLARERAD TÄCKNING:')
for (const g of verkligt.globar) console.log(`  ${g.av.padEnd(32)} TÄCKER  ${g.glob}`)
const registrerade = verkligt.resultat.filter((r) => r.registrerad)
console.log(`\nFÖRLITAR SIG PÅ MÄNSKLIGT MINNE — ${registrerade.length} filer. Listan skrivs ut varje`)
console.log('körning i stället för att gömmas, eftersom det är den här klassen som redan kostat:')
for (const r of registrerade) console.log(`  · ${r.fil}\n      ${UTAN_ANROPARE[r.fil]}`)
console.log('\nVAD DETTA INTE BEVISAR: att proven är BRA, eller att de körs OFTA. Vakten prövar')
console.log('att varje prov är NÅGONS ansvar — att en anropare finns eller att skulden är')
console.log('utskriven. Att anroparen faktiskt körs, och att provet fäller det det ska, är')
console.log('två andra frågor som ägs av respektive körare.')
process.exit(0)
