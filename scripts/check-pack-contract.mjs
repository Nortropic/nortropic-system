#!/usr/bin/env node
// Paketkontraktet: prövar att varje paket under packs/ uppfyller docs/paketkontrakt.md.
//
// VAD VAKTEN BEVISAR — uppräknat, aldrig bundet till instrumentet:
//   1. Varje paket bär kontraktets obligatoriska delar. Listan EXTRAHERAS ur
//      paketkontraktets egen tabell, och varje extraherad del DRIVER en kontroll — en del
//      utan implementerad kontroll fäller, så extraheringen inte kan bli död kod.
//   2. Statusen står i den FRUSNA vokabulären, extraherad ur docs/06-scope.md, och
//      statusraden prövas som TABELLRAD — ett omnämnande i prosa räknas inte.
//   3. Skärpningslagen prövas både positivt (texten finns) och NEGATIVT: lexikala
//      lättnadsmarkörer i skärpningstabellen fäller. Lag 1 är den mest bärande av de sju
//      och den enda som är helt oprövbar med enbart rubrikmatchning.
//   4. Juridikdetektionen är INTE opt-in via en rubrik. Ett paket vars text träffar en
//      flagga i §A4-registret MÅSTE bära `## Juridikflagga`, och lagparagrafcitat i
//      packs/** fäller utan namngiven källa.
//   5. Pinnen stämmer mot modulfilens sha256, och `motKarna` är ett verkligt
//      semver-intervall.
//
// SIGNATUREN HASHAR VAKTENS EGEN KÄLLTEXT, inte kontrollernas namn. En tidigare version
// hashade namnen och påstod att "både radering och utbyte fäller" — det var falskt: ett
// predikat kunde bytas mot `true` med namnet ordagrant kvar och signaturen oförändrad.
// Nu fäller varje redigering av filen tills pinnen uppdateras medvetet.
//
// ÄRLIG GRÄNS — vad vakten INTE prövar:
//   · **Paket↔kapacitet är inte bundet.** Kontraktet kräver kapacitetsrader, men
//     referensimplementationen `lokal-se` binder inga rader till sitt paket-id, och
//     manifestet namnger ingen enskild `KAP-`-rad. Att kräva bindningen vore att kräva
//     något referensen inte uppfyller. Luckan är namngiven i docs/paketkontrakt.md §9.
//   · **Juridiskt sakinnehåll i researchmodulen** prövas bara lexikalt (lagcitat). En
//     normativ slutsats formulerad i vanlig svenska passerar.
//   · Lag 7 (en katastrof följer sitt pakets tillämplighet) prövas som närvaro av regeln,
//     aldrig som tillämpning.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
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

const REFERENS = 'lokal-se'
const FORVANTAD_KALLHASH = '592f337701b618b7'

const kontrakt = las('docs/paketkontrakt.md')
const scope = las('docs/06-scope.md')
const katalog = las('docs/kapacitetskatalog.md')
const pin = JSON.parse(las('config/research-contract.v3.json'))
const flaggregister = las('skills/nortropic-plan/references/juridikflaggor.md')

// ---- Kraven EXTRAHERAS ur kontraktets tabell OCH DRIVER kontrollerna --------
const delRader = [...kontrakt.matchAll(/^\| \*\*(.+?)\*\* \| (.+?) \| (.+?) \|$/gm)]
if (delRader.length < 6) odombart(`paketkontraktets deltabell gav ${delRader.length} rader — kraven går inte att härleda ur dokumentet`)
const DELAR = delRader.map((m) => ({ namn: m[1].trim(), hemvist: m[2].replace(/`/g, '').trim() }))
check('Kontraktet kräver sex obligatoriska delar', DELAR.length === 6,
  `hittade ${DELAR.length}: ${DELAR.map((d) => d.namn).join(', ')}`)

// Varje extraherad del MÅSTE ha en implementerad kontroll. Utan detta var extraheringen
// död kod: kontraktets tabell kunde bytas mot en dryckeslista med vakten grön.
const IMPLEMENTERADE = {
  'Manifest': (id) => existsSync(join(ROT, `packs/${id}/manifest.md`)),
  'Researchmodul': (id) => existsSync(join(ROT, `packs/${id}/research-module.md`)),
  'Strategimodul': (id) => existsSync(join(ROT, `packs/${id}/strategi`)),
  'Kapacitetsrader': () => /^\| `KAP-[\w-]+` \|/m.test(katalog),
  'Statusrad': (id) => new RegExp(`^\\| \`${id}\``, 'm').test(scope),
  'Pinne': (id) => !!pin.paketmoduler.find((m) => m.pack === id),
}
const utanKontroll = DELAR.filter((d) => !(d.namn in IMPLEMENTERADE))
check('Varje extraherad kontraktsdel har en implementerad kontroll', utanKontroll.length === 0,
  `${utanKontroll.map((d) => d.namn).join(', ')} står i kontraktet men prövas inte — extraheringen vore då död kod`)

// ---- Statusvokabulären EXTRAHERAS ur 06-scope.md ---------------------------
const vokabRad = /Statusvokabulär[^:]*:([\s\S]*?)\n\n/.exec(scope)
if (!vokabRad) odombart('statusvokabulären kunde inte läsas ur docs/06-scope.md')
const STATUS = [...vokabRad[1].matchAll(/\*\*([A-ZÅÄÖ-]+)\*\*/g)].map((m) => m[1])
check('Statusvokabulären bär sina fem lägen', STATUS.length === 5, `[${STATUS.join(', ')}]`)

// ---- Flaggorna ur §A4-registret --------------------------------------------
const FLAGGOR = [...flaggregister.matchAll(/^\| \*\*(.+?)\*\* \| `([^`]+)`/gm)]
  .map((m) => ({ namn: m[1].trim(), status: m[2].trim() }))
if (!FLAGGOR.length) odombart('juridikflaggregistret kunde inte läsas — juridikdetektionen går inte att driva')
check('Ankare: §A4-registrets flaggor kunde läsas', FLAGGOR.length >= 5, `${FLAGGOR.length}`)

// ---- Paketen ---------------------------------------------------------------
const packsDir = join(ROT, 'packs')
if (!existsSync(packsDir)) odombart('packs/ saknas')
const paket = readdirSync(packsDir).filter((d) => statSync(join(packsDir, d)).isDirectory()).sort()
if (!paket.includes(REFERENS)) odombart(`referenspaketet \`${REFERENS}\` saknas — kontraktet kan inte prövas mot något`)

const referensFel = []
const kordaPerPaket = {}

for (const id of paket) {
  const P = (n) => `${id}: ${n}`
  kordaPerPaket[id] = 0
  const fel = (namn, ok, detalj) => {
    check(P(namn), ok, detalj); kordaPerPaket[id]++
    if (!ok && id === REFERENS) referensFel.push(namn)
  }

  for (const d of DELAR) {
    const impl = IMPLEMENTERADE[d.namn]
    if (impl) fel(`bär delen "${d.namn}" (${d.hemvist})`, impl(id), 'saknas')
  }
  const manifestPath = `packs/${id}/manifest.md`, modulPath = `packs/${id}/research-module.md`
  if (!existsSync(join(ROT, manifestPath)) || !existsSync(join(ROT, modulPath))) continue
  const manifest = las(manifestPath), modul = las(modulPath)

  const idRad = /\*\*Paket-id:\*\* `([\w-]+)`/.exec(manifest)
  fel('manifestet namnger sitt paket-id', !!idRad, 'saknas')
  fel('paket-id stämmer med katalognamnet', !!idRad && idRad[1] === id, `manifestet säger \`${idRad ? idRad[1] : '?'}\``)
  fel('manifestet bär en version i rubriken', /manifest v\d+\.\d+\.\d+/.test(manifest), 'saknas')
  const statusRad = /\*\*Status:\*\* `([A-ZÅÄÖ-]+)\*?`/.exec(manifest)
  fel('manifestet bär en status', !!statusRad, 'saknas')
  fel('statusen står i den frusna vokabulären', !!statusRad && STATUS.includes(statusRad[1]),
    `\`${statusRad ? statusRad[1] : '?'}\` finns inte i [${STATUS.join(', ')}]`)

  fel('manifestet säger ut att paketet är ett KAPACITETSPAKET',
    /KAPACITETSPAKET/.test(manifest) && /aldrig ett affärspaket|A5/.test(flat(manifest)), 'gränsen mot §A5 saknas')
  fel('manifestet namnger sin aktiveringssignal', /## Aktiveringssignal/.test(manifest), 'saknas')
  fel('lag 3: BELAGT, aldrig ANTAGET', /antagen/i.test(manifest) && /belagt/i.test(manifest), 'skiljer inte belagt från antaget')
  fel('manifestet bär en ALDRIG-lista', /## Vad paketet ALDRIG gör/.test(manifest), 'saknas')
  fel('lag 4: bedömer aldrig juridik', /[Bb]edömer aldrig juridik/.test(flat(manifest)), 'saknas')
  fel('lag 6: föder aldrig en ny agent', /[Ff]öder aldrig en ny agent/.test(flat(manifest)), 'saknas')

  fel('lag 1: modulen bär skärpningslagen',
    /## Skärpningslagen/.test(modul) && /ENDAST SKÄRPA/.test(modul), 'saknas')
  fel('lag 1: modulen räknar upp vad den ALDRIG får',
    /lätta på ett universellt krav/.test(flat(modul)) && /omdefiniera en universell sektion/.test(flat(modul)), 'saknas')
  // NEGATIV vakt: skärpningstabellen får inte innehålla lättnadsmarkörer. En modul som
  // uttryckligen LÄTTAR ett krav passerade tidigare, eftersom bara förbudens TEXT prövades.
  const skarpTabell = /## Skärpningar av den universella kärnan([\s\S]*?)(?=^## )/m.exec(modul)
  fel('ankare: skärpningstabellen kunde avgränsas', !!skarpTabell, 'rubriken saknas')
  const LATTNAD = /(bortfaller|räcker med|behöver inte|INTE längre obligatorisk|undantas|är valfri|slopas)/i
  fel('lag 1 NEGATIVT: skärpningstabellen bär ingen lättnadsmarkör',
    !!skarpTabell && !LATTNAD.test(skarpTabell[1]),
    'en skärpning som lättar ett universellt krav är per definition ingen skärpning')
  const lSektioner = [...modul.matchAll(/^\| \*\*(L\d+)\*\* \|/gm)].map((m) => m[1])
  fel('lag 2: modulen bär egna L-sektioner', lSektioner.length > 0, 'inga L-sektioner')
  fel('lag 2: numreringen förskjuts aldrig', /universella numreringen förskjuts aldrig/.test(flat(modul)), 'saknas')
  fel('modulen bär kontrollradens skärpning', /## Kontrollradens skärpning/.test(modul), 'saknas')
  fel('modulen deklarerar sitt pack_module-fält', /pack_module=\d+\.\d+\.\d+/.test(modul), 'saknas')

  const pinPost = pin.paketmoduler.find((m) => m.pack === id)
  if (pinPost) {
    const faktisk = createHash('sha256').update(readFileSync(join(ROT, pinPost.path))).digest('hex')
    fel('pinnens sha256 stämmer mot modulfilen', faktisk === pinPost.sha256, `filen har ${faktisk}`)
    fel('pinnen bär ett verkligt semver-INTERVALL',
      /^>=\d+\.\d+\.\d+ <\d+\.\d+\.\d+$/.test((pinPost.motKarna || '').trim()),
      `motKarna = "${pinPost.motKarna}" — ett blanksteg passerade tidigare teckenklassen`)
    fel('pinnens path pekar på paketets egen modul', pinPost.path === modulPath, `pekar på ${pinPost.path}`)
  }

  // -- Juridikdetektion: DRIVEN ur registret, aldrig opt-in via en rubrik --
  const traffad = FLAGGOR.filter((f) => f.status.startsWith('ohanterad') &&
    new RegExp(f.namn.split('/')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(manifest + modul))
  const barRubrik = /## Juridikflagga/.test(manifest)
  fel('juridikdetektion: ett paket som träffar en ohanterad flagga bär `## Juridikflagga`',
    traffad.length === 0 || barRubrik,
    `texten träffar ${traffad.map((f) => f.namn).join(', ')} men rubriken saknas — juridikvakten var då opt-in`)
  // NEGATIV vakt mot juridiskt sakinnehåll: lagparagrafcitat i packs/** utan namngiven källa.
  const LAGCITAT = /\b\d+ kap\b|\b\d+ §|patientsäkerhetslag|marknadsföringslag|alkohollag|livsmedelsförordning|spellag/i
  fel('inget lagparagrafcitat utan namngiven källa',
    !LAGCITAT.test(manifest + modul) || /KÄLLA:/.test(manifest + modul),
    'paketet citerar lag utan namngiven källa — §A4 är människans, och en gissning som ser ut som en modul är en risk')
  if (barRubrik) {
    fel('juridikpaket: pekar på §A4-registret', /juridikflaggor\.md/.test(manifest), 'kravet är inte hämtat ur registret')
    fel('juridikpaket: bär OBSERVATIONSKRAV med innehåll',
      /## Observationskrav([\s\S]{200,}?)(?=^## )/m.test(modul), 'rubriken finns men sektionen är tom')
    fel('juridikpaket: sakinnehållet är märkt KÄLLA SAKNAS', /KÄLLA SAKNAS/.test(manifest), 'saknas')
    fel('juridikpaket: står på DECLARED tills källan finns',
      !!statusRad && statusRad[1] === 'DECLARED', `status \`${statusRad ? statusRad[1] : '?'}\``)
    const flaggnamn = /\*\*Flagga:\*\* `([^`]+)`/.exec(manifest)
    fel('juridikpaket: flaggan finns i §A4-registret',
      !!flaggnamn && FLAGGOR.some((f) => f.namn === flaggnamn[1]),
      `\`${flaggnamn ? flaggnamn[1] : '?'}\` står inte i registret — ett paket får inte uppfinna en flagga`)
  }
}

// Lag 7 prövas som närvaro i KONTRAKTET (ingen tillämpning finns att pröva ännu).
check('Kontraktet bär lag 7 (en katastrof följer sitt pakets tillämplighet)',
  /katastrof följer sitt pakets tillämplighet/i.test(flat(kontrakt)), 'lagen saknas ur kontraktet')
check('Kontraktet namnger luckan att paket↔kapacitet inte är bundet',
  /paket↔kapacitet|inte bundet till paket-id/i.test(kontrakt),
  'den kända gränsen är inte utskriven — en läsare tror då att bindningen prövas')

// ---- POSITIVT KONTROLLPROV — en RIKTIG jämförelse, inte en tautologi -------
if (referensFel.length) {
  odombart(`referenspaketet \`${REFERENS}\` föll på ${referensFel.length} kontroll(er): ${referensFel.join(' · ')} — då är KONTRAKTET fel, inte paketet`)
}
const referensKorda = kordaPerPaket[REFERENS] || 0
const maxKorda = Math.max(...Object.values(kordaPerPaket))
check(`Positivt kontrollprov: referenspaketet kördes mot ${referensKorda} kontroller`, referensKorda > 0, 'noll')
check('Referensen exponeras för samma kontrollmängd som övriga paket',
  paket.length === 1 || referensKorda === maxKorda,
  `referensen fick ${referensKorda}, mest exponerade paket fick ${maxKorda} — kontraktets §6-krav bärs då INTE av referensen, och påståendet att varje krav redan bärs av lokal-se är falskt för skillnaden`)

// ---- Verdikt: signaturen hashar VAKTENS EGEN KÄLLTEXT ----------------------
const egenKalla = readFileSync(fileURLToPath(import.meta.url), 'utf8')
  .split('\n').filter((r) => !r.includes('FORVANTAD_KALLHASH =')).join('\n')
const kallhash = createHash('sha256').update(egenKalla).digest('hex').slice(0, 16)
if (FORVANTAD_KALLHASH !== 'SATTS' && kallhash !== FORVANTAD_KALLHASH) {
  console.error(`ODÖMBART: vaktens källhash är ${kallhash}, förväntad ${FORVANTAD_KALLHASH} — vakten har redigerats. En hash över KONTROLLNAMN fällde inte ett utbytt predikat: namnet kunde stå kvar ordagrant medan villkoret byttes mot true. Uppdatera pinnen medvetet i samma commit.`)
  process.exit(2)
}
for (const p of passes) console.log(`PASS: ${p}`)
if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`)
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} paketkontraktskontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} paketkontraktskontroller över ${paket.length} paket (källhash ${kallhash})`)
console.log('\nGRÄNS: paket↔kapacitet är INTE bundet, och juridiskt sakinnehåll prövas bara')
console.log('lexikalt. En normativ slutsats i vanlig svenska passerar — se docs/paketkontrakt.md §9.')
process.exit(0)
