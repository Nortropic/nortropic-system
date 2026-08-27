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

console.log('VAKT: check-pack-contract.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig

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
const FORVANTAD_KALLHASH = 'd0c1a71063a9bc8a'

const kontrakt = las('docs/paketkontrakt.md')
const scope = las('docs/06-scope.md')
const katalog = las('docs/kapacitetskatalog.md')
const pin = JSON.parse(las('config/research-contract.v3.json'))
const flaggregister = las('skills/nortropic-plan/references/juridikflaggor.md')

// ---- Kraven EXTRAHERAS ur kontraktets tabell OCH DRIVER kontrollerna --------
const delRader = [...kontrakt.matchAll(/^\| \*\*(.+?)\*\* \| (.+?) \| (.+?) \|$/gm)]
if (delRader.length < 6) odombart(`paketkontraktets deltabell gav ${delRader.length} rader — kraven går inte att härleda ur dokumentet`)
const DELAR = delRader.map((m) => ({ namn: m[1].trim(), hemvist: m[2].replace(/`/g, '').trim() }))
check('Kontraktet kräver ÅTTA obligatoriska delar', DELAR.length === 8,
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
  // PK-GAP-1:s stängning. D2: *"packs are named compositions of capabilities"* — utan
  // en NAMNGIVEN komposition pekar manifestet på katalogen i allmänhet.
  'Kapacitetskomposition': (id) => kompositionen(id).length > 0,
  'Grindlinser': (id) => existsSync(join(ROT, `packs/${id}/gate-lenses.md`)),
}

// Kompositionen läses ur manifestets tabell. Rollerna är slutna: ÄGER · SKÄRPER · ÄRVER.
const ROLLER = ['ÄGER', 'SKÄRPER', 'ÄRVER']
// `\w` är [A-Za-z0-9_] och matchar INTE Å/Ä/Ö, så `**ÄGER**` fångades aldrig och
// kompositionen lästes som TOM. Samma fel som i INPUT GATE-spegelns status-regex två
// skivor tidigare — gjort om, i en annan fil, inom två dygn. Rollerna är svenska ord;
// teckenklassen måste vara det också.
// `\w` är [A-Za-z0-9_] och matchar INTE Å/Ä/Ö, så `**ÄGER**` fångades aldrig och
// kompositionen lästes som TOM. Samma fel som i INPUT GATE-spegelns status-regex två
// skivor tidigare — gjort om, i en annan fil, inom två dygn. Rollerna är svenska ord;
// teckenklassen måste vara det också.
function kompositionen(id) {
  const f = join(ROT, `packs/${id}/manifest.md`)
  if (!existsSync(f)) return []
  return [...readFileSync(f, 'utf8').matchAll(/^\| `(KAP-[\w-]+)` \| \*\*([A-ZÅÄÖ]+)\*\* \| (.+?) \|$/gm)]
    .map((m) => ({ kap: m[1], roll: m[2], innebord: m[3] }))
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

// ---- PK-GAP-1: kompositionen prövas, inte bara dess närvaro -----------------
for (const id of paket) {
  const komp = kompositionen(id)
  const P = (t) => `${id}: ${t}`
  check(P('kapacitetskompositionen kunde läsas'), komp.length > 0,
    'manifestet namnger ingen enskild KAP-rad — då pekar det på katalogen i allmänhet och paketet är inte en NAMNGIVEN komposition (D2)')
  if (komp.length === 0) continue
  const felRoll = komp.filter((r) => !ROLLER.includes(r.roll))
  check(P('varje rad bär en KÄND roll (ÄGER · SKÄRPER · ÄRVER)'), felRoll.length === 0,
    `${felRoll.map((r) => `${r.kap}=${r.roll}`).join(', ')} — en okänd roll är oklassificerad, aldrig ofarlig`)
  const okandaKap = komp.filter((r) => !new RegExp(`^\\| \`${r.kap}\`\\s*\\|`, 'm').test(katalog))
  check(P('varje komponerad kapacitet FINNS i katalogen'), okandaKap.length === 0,
    `${okandaKap.map((r) => r.kap).join(', ')} står i manifestet men inte i kapacitetskatalogen — en komposition av något som inte finns`)
  const utanInnebord = komp.filter((r) => r.innebord.trim().length < 20)
  check(P('varje rad säger UT vad rollen innebär'), utanInnebord.length === 0,
    `${utanInnebord.map((r) => r.kap).join(', ')} — en roll utan innebörd är en etikett, och etiketter driftar utan att någon märker det`)
  // ÄRVER måste finnas som roll. Utan den går "gäller oförändrad" inte att skilja från
  // "glömdes bort", och kompositionen vore ofullständig utan att någon kunde se det.
  check(P('rollen ÄRVER används — tystnad är inte ett giltigt svar'),
    komp.some((r) => r.roll === 'ÄRVER') && /`ÄRVER` är en egen rad och inte en tystnad/.test(las(`packs/${id}/manifest.md`)),
    'en kapacitet som varken ägs eller skärps måste stå med ändå')
  // SKÄRPER är ett PÅSTÅENDE om researchmodulen — det ska gå att slå upp.
  const modul = existsSync(join(ROT, `packs/${id}/research-module.md`)) ? las(`packs/${id}/research-module.md`) : ''
  check(P('paketet ÄGER minst en kapacitet'), komp.some((r) => r.roll === 'ÄGER'),
    'ett paket som bara skärper och ärver är en konfiguration, inte en komposition')
  check(P('kompositionen namnger vad paketet INTE komponerar'),
    /Kapaciteter paketet INTE komponerar/.test(las(`packs/${id}/manifest.md`)),
    'utan avgränsningen läses varje ny katalograd som paketets, och kompositionen växer av sig själv')
  check(P('och avgränsningen namnger Ring 3-raderna'),
    ['KAP-EHANDEL', 'KAP-EGET-TILLSTAND'].every((k) => las(`packs/${id}/manifest.md`).includes(k)),
    'Ring 3-kapaciteterna måste stå som uttryckligen INTE komponerade — annars är gränsen tyst')
  if (modul) {
    const skarpta = komp.filter((r) => r.roll === 'SKÄRPER')
    check(P('varje SKÄRPER-rad har en motsvarighet i researchmodulen'),
      skarpta.length === 0 || /## Skärpningar av den universella kärnan/.test(modul),
      'paketet påstår skärpningar men modulen bär ingen skärpningstabell')
  }
}

// ---- PK-GAP-4: kompositionen HÄRLEDS, den tros inte på sitt ord -------------
// Kompositionen var en DEKLARATION: inget hindrade att en rad utelämnades, och kontrollen
// kunde bara pröva att de rader som STOD där var giltiga. **En lista som bara granskas för
// det den innehåller kan alltid krympas.**
//
// Kravet härleds nu ur något som INTE är manifestet: paketets egna fixturer. En fixtur som
// bär `paket: ['lokal-se']` deklarerar i `kapaciteter` vad bygget faktiskt aktiverar.
// **Kompositionen måste täcka varje sådan kapacitet** — annars påstår paketet att det
// består av mindre än vad det levererar.
//
// Riktningen är MEDVETET ensidig. En komposition får bära en rad ingen fixtur ännu övar
// (en kapacitet kan vara paketets utan att finnas i just dessa sex fall) — men den får
// ALDRIG sakna en som övas. Oövade rader rapporteras i stället för att fällas, så de syns.
const btDir = join(ROT, 'backtests')
const aktiveratPerPaket = new Map()
if (existsSync(btDir)) {
  for (const d of readdirSync(btDir)) {
    const f = join(btDir, d, 'profile.ts')
    if (!existsSync(f)) continue
    const t = readFileSync(f, 'utf8')
    const pk = /^ {2}paket:\s*\[([^\]]*)\]/m.exec(t)
    if (!pk) continue
    const ids = [...pk[1].matchAll(/'([\w-]+)'/g)].map((m) => m[1])
    const kapBlock = /^ {2}kapaciteter:\s*\[([\s\S]*?)\n {2}\]/m.exec(t)
    if (!kapBlock) continue
    const kaps = [...kapBlock[1].matchAll(/id:\s*'(KAP-[\w-]+)'/g)].map((m) => m[1])
    for (const id of ids) {
      if (!aktiveratPerPaket.has(id)) aktiveratPerPaket.set(id, new Map())
      for (const k of kaps) {
        if (!aktiveratPerPaket.get(id).has(k)) aktiveratPerPaket.get(id).set(k, [])
        aktiveratPerPaket.get(id).get(k).push(d)
      }
    }
  }
}
const oovade = []
for (const id of paket) {
  const komp = kompositionen(id)
  const aktivt = aktiveratPerPaket.get(id) || new Map()
  const P = (t) => `${id}: ${t}`
  // ANKARKRAVET: en tom aktiveringsmängd är inget bevis. Har paketet inga fixturer går
  // härledningen inte att göra, och det ska sägas — inte tolkas som "allt stämmer".
  check(P('minst en fixtur övar paketet (ankaret för härledningen)'), aktivt.size > 0,
    'inget fixturunderlag — kompositionen kan då bara tros på sitt ord, och PK-GAP-4 är öppen för det här paketet')
  if (aktivt.size === 0) continue
  const deklarerade = new Set(komp.map((r) => r.kap))
  const saknade = [...aktivt.keys()].filter((k) => !deklarerade.has(k))
  check(P('kompositionen TÄCKER varje kapacitet fixturerna aktiverar'), saknade.length === 0,
    `${saknade.map((k) => `${k} (aktiveras av ${aktivt.get(k).join(', ')})`).join(' · ')} — paketet påstår att det består av mindre än vad det levererar`)
  for (const r of komp) if (!aktivt.has(r.kap)) oovade.push(`${id}/${r.kap} (${r.roll})`)
}
if (oovade.length) {
  console.log(`NOT: ${oovade.length} kompositionsrad(er) övas inte av någon fixtur — ${oovade.join(', ')}`)
  console.log('     Det är tillåtet (en kapacitet kan vara paketets utan att finnas i just dessa fall)')
  console.log('     men det betyder att raden är oprövad. Den syns här i stället för att tigas ihjäl.')
}

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
// Hashen täcker VARJE rad; endast pinnens literal normaliseras. Formen som UTELÄMNADE
// rader som bar markören var ett bevisat kringgående: `process.exit(0) // FORVANTAD_KALLHASH = `
// föll ur hashen och avslutade vakten grön utan att pinnen rörde sig.
const kalltext = readFileSync(fileURLToPath(import.meta.url), 'utf8')
const PINNRAD = /^const FORVANTAD_KALLHASH = '[0-9a-f]{16}'$/m
if (!PINNRAD.test(kalltext)) odombart('pinndeklarationen har fel form — ankaret går inte att normalisera')
const egenKalla = kalltext.replace(PINNRAD, "const FORVANTAD_KALLHASH = '<PINNE>'")
const kallhash = createHash('sha256').update(egenKalla).digest('hex').slice(0, 16)
if (kallhash !== FORVANTAD_KALLHASH) {
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
