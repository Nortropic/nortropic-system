#!/usr/bin/env node
console.log('VAKT: check-paketlinser.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig
// REGLER SOM BOR PÅ FEL STÄLLE — två fall av samma sak.
//
// FALL 1: PAKETETS LINSER LIGGER I GRINDWORKFLOWET. `CATEGORY_ALIAS` i
// `workflows/nortropic-launch.js` hårdkodar `lokal-se:orter → seo` och två till. Ett andra
// paket kan därmed inte tillföra en lins utan att någon redigerar workflowet. Masterplanens
// D2 säger att *"packs are named compositions of capabilities"* — **en komposition som
// kräver att värden ändras är ingen komposition.** Paketet deklarerar nu sina linser i
// `packs/lokal-se/gate-lenses.md`, och vakten fäller om deklarationen och den hårdkodade
// tabellen glider isär. Att workflowet LÄSER paketet kräver en §A3-angränsande ändring och
// är ett ägarbeslut (`GL-GAP-1`) — spegeln är vad som går att göra utan den.
//
// FALL 2: BAKÅTKOMPATIBILITETSLAGEN BOR I SEX PROMPTAR. `AL-GAP-2` påstod att "ingen
// konsument använder läsaren". **Det var fel och rättas här:** lagens text —
// *"saknade v2-fält läses som SAKNAS_I_V1 … ALDRIG som tomt eller falskt"* — står i båda
// grindworkflowen, i qa-launcher och i två skills. Konsumenterna BÄR alltså regeln. Det
// som saknas är att något hindrar den från att tyst falla ur en prompt vid nästa
// omskrivning. Vakten kräver att varje fil som instruerar läsning av `profile.ts` också
// bär lagen.
//
// VARFÖR DE TVÅ HÖR IHOP: båda är regler som lever någon annanstans än i artefakten som
// äger dem — den ena som en hårdkodad tabell, den andra som duplicerad prompttext. Fixen
// är densamma: deklarera på ett ställe, och fäll när kopiorna avviker.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
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

const passes = []
const fails = []
const check = (namn, ok, detalj) => (ok ? passes.push(namn) : fails.push(`${namn}: ${detalj}`))
const FORVANTAD_KALLHASH = 'cdc426268a7fb633'

// ---- --generera: GL-GAP-1 stängd genom GENERERING, inte genom läsning ------
// Workflow-DSL:en har INGEN filsystemsåtkomst, så `nortropic-launch.js` kan inte läsa
// `packs/*/gate-lenses.md` vid körning. Att låta en agent rapportera kategorimappningen
// vore värre än problemet: kategorimängden måste vara sluten och universell (§10), och en
// modellrapporterad mapping är varken. **Kvar står generering:** paketen är källan,
// tabellen i workflowet är utdata, och `--generera` skriver den. Drift blir då inte
// "något att upptäcka" utan "något som inte kan uppstå utan att någon kör kommandot".
if (process.argv.includes('--generera')) {
  const paketNu = readdirSync(join(ROT, 'packs')).filter((d) => existsSync(join(ROT, 'packs', d, 'gate-lenses.md')))
  const rader = []
  for (const p of paketNu) {
    for (const m of las(`packs/${p}/gate-lenses.md`).matchAll(/^\| `([\w-]+:[\w-]+)` \| `(\w+)` \| ([^|]+?) \|/gm)) {
      rader.push(`  '${m[1]}': '${m[2]}',`.padEnd(34) + `// ${m[3].trim()}`)
    }
  }
  if (rader.length === 0) { console.error('AVBRUTET: inga linser att generera — en tom tabell får aldrig skrivas över en icke-tom'); process.exit(2) }
  const kalla = las('workflows/nortropic-launch.js')
  const TAB = /(const CATEGORY_ALIAS = \{\n)[\s\S]*?(\n\})/
  if (!TAB.test(kalla)) { console.error('AVBRUTET: CATEGORY_ALIAS-tabellens form känns inte igen'); process.exit(2) }
  const ny = kalla.replace(TAB, (_, f, sl) => f + rader.join('\n') + sl)
  if (ny === kalla) { console.log('OFÖRÄNDRAD: tabellen var redan i synk'); process.exit(0) }
  writeFileSync(join(ROT, 'workflows/nortropic-launch.js'), ny)
  console.log(`GENERERAD: ${rader.length} linser ur ${paketNu.length} paket → workflows/nortropic-launch.js`)
  process.exit(0)
}

// ---- FALL 1: paketets linser mot workflowets hårdkodade tabell -------------
const launch = las('workflows/nortropic-launch.js')
const tabell = /const CATEGORY_ALIAS = \{([\s\S]*?)\n\}/.exec(launch)
if (!tabell) odombart('CATEGORY_ALIAS kunde inte läsas ur nortropic-launch.js — spegeln går inte att pröva')
const hardkodade = new Map([...tabell[1].matchAll(/'([\w-]+:[\w-]+)':\s*'(\w+)'/g)].map((m) => [m[1], m[2]]))
check('Ankare: den hårdkodade linstabellen kunde läsas', hardkodade.size > 0,
  'tom tabell — en tom mängd får aldrig läsas som "inga linser"')

const paket = readdirSync(join(ROT, 'packs')).filter((d) => existsSync(join(ROT, 'packs', d, 'manifest.md')))
check('Ankare: minst ett paket hittades', paket.length > 0, 'inga paket — vakten prövar då ingenting')
const deklarerade = new Map()
for (const p of paket) {
  const fil = `packs/${p}/gate-lenses.md`
  check(`Paketet \`${p}\` deklarerar sina grindlinser`, existsSync(join(ROT, fil)),
    'masterplanens §6 räknar upp gate lenses som en av sex paketdelar — utan filen bor linsen bara i workflowet')
  if (!existsSync(join(ROT, fil))) continue
  const gl = las(fil)
  const rader = [...gl.matchAll(/^\| `([\w-]+:[\w-]+)` \| `(\w+)` \|/gm)]
  check(`\`${p}\`: linstabellen kunde läsas`, rader.length > 0, 'inga linsrader')
  for (const [, lins, kat] of rader) deklarerade.set(lins, kat)
  // `m.input` är HELA filen, så en find() på linsnamnet träffade KODBLOCKET med den
  // hårdkodade tabellen i stället för tabellraden. Sök bland faktiska tabellrader.
  const tabellrader = gl.split('\n').filter((r) => /^\| `[\w-]+:[\w-]+` \| `\w+` \|/.test(r))
  check(`\`${p}\`: varje lins bär BÅDE vad den tittar efter OCH varför den aliasar dit`,
    tabellrader.length === rader.length && tabellrader.every((r) => r.split('|').filter((c) => c.trim()).length >= 4),
    'en lins utan skäl är en tabellrad; skälet är det som hindrar nästa lins från att bli en egen kategori')
  check(`\`${p}\`: lagen om att aldrig hitta på en kategori står i paketet`,
    /aldrig hitta på en egen kategori|ALDRIG hitta på en egen kategori/i.test(gl),
    'en kategori som föds per paket blir en mätstock ingen granskat, och rapporter slutar gå att jämföra (§10)')
  check(`\`${p}\`: core-only-fallet är utskrivet som en UTSAGA, inte som två ord`,
    /[Vv]id `?core-only`? körs INGEN av dem/.test(gl) &&
    /frånvaron[\s\S]{0,160}KORREKT/i.test(gl) &&
    /aldrig rapporteras[\s\S]{0,20}som ett fynd/.test(gl),
    'vid core-only är frånvaron av lokala delar KORREKT och får aldrig rapporteras som fynd (§26 B-T1) — orden räcker inte, utsagan krävs')
}

// SPEGELN MÅSTE STÄMMA I BÅDA RIKTNINGAR. Bara en riktning skulle låta en lins läggas
// till på ena stället och glömmas på det andra.
const saknasIPaket = [...hardkodade.keys()].filter((k) => !deklarerade.has(k))
const saknasIWorkflow = [...deklarerade.keys()].filter((k) => !hardkodade.has(k))
check('Varje HÅRDKODAD lins är deklarerad i sitt paket', saknasIPaket.length === 0,
  `${saknasIPaket.join(', ')} finns i workflowet men inte i något paket — då är paketet inte längre kompositionen`)
check('Varje DEKLARERAD lins finns i workflowet', saknasIWorkflow.length === 0,
  `${saknasIWorkflow.join(', ')} deklareras av ett paket men körs aldrig — en lins som inte körs är ett tyst löfte`)
const feltKategori = [...deklarerade.entries()].filter(([k, v]) => hardkodade.has(k) && hardkodade.get(k) !== v)
check('Och kategorierna är IDENTISKA', feltKategori.length === 0,
  `${feltKategori.map(([k, v]) => `${k}: paketet säger ${v}, workflowet ${hardkodade.get(k)}`).join(' · ')}`)

// Kategorierna måste alias:a in på UNIVERSELLA kategorier, inte på nya.
const UNIVERSELLA = ['seo', 'trust', 'leadgen', 'technical', 'visual', 'content']
const oknda = [...deklarerade.values()].filter((v) => !UNIVERSELLA.includes(v))
check('Varje lins aliasar in på en UNIVERSELL kategori', oknda.length === 0,
  `${oknda.join(', ')} är inte universella — §10: ingen per-projekt-rubrikauktoritet`)
// ---- GL-GAP-2: GENERERINGEN FÅR ALDRIG VÄXA IN I KRAVNIVÅN ------------------
// `GL-GAP-1` stängdes genom GENERERING: kategorimappningen härleds ur paketet och skrivs
// in i `workflows/nortropic-launch.js`. Det är försvarbart därför att en mappning är
// ROUTNING — vilken universell hink ett fynd hamnar i — och routning är inte kravnivå.
//
// **MEN `packs/*/gate-lenses.md` ÄR INTE §A-ZONAD.** §A7 räknar upp `packs/*/manifest.md`,
// `packs/*/research-module.md` och `packs/*/strategi/*`; den här filen står inte där.
// Workflowet är däremot §A3. Varje rad som genereras härifrån dit går alltså från OSKYDDAD
// till SKYDDAD yta, och den riktningen är precis vad §A finns för att förhindra: en agent
// ska inte kunna sänka ett krav genom att redigera något den får redigera.
//
// Så länge det som genereras är `'<paket>:<lins>': '<universell kategori>',` är mängden
// sluten och prövbar. Växer genereringen till att bära KRAVTEXT — vad linsen ska titta
// efter — har en oskyddad fil börjat bestämma vad en skyddad grind kräver. Kontrollen
// nedan gör den glidningen omöjlig att göra tyst: varje genererad rad måste ha exakt
// alias-formen, och kommentaren efter den får bara vara ETT skäl på EN rad.
{
  const kropp = tabell ? tabell[1] : null
  check('GL-GAP-2: det genererade blocket kunde läsas (ankare)', !!kropp,
    'utan blocket prövas ingen glidning, och en oläsbar tabell får aldrig läsas som en tom')
  if (kropp) {
    const RAD = /^\s*'[a-z0-9-]+:[a-z0-9-]+':\s*'[a-z]+',\s*(\/\/[^\n]*)?$/
    const avvikande = kropp.split('\n').filter(Boolean).filter((r) => !RAD.test(r))
    check('GL-GAP-2: varje genererad rad är en ren ALIAS-rad, aldrig kravtext',
      avvikande.length === 0,
      `${avvikande.map((r) => r.trim().slice(0, 60)).join(' · ')} — en oskyddad paketfil har börjat generera något annat än routning in i §A3-ytan`)
    check('GL-GAP-2: blocket bär inte fler rader än det finns linser',
      kropp.split('\n').filter(Boolean).length <= deklarerade.size,
      `${kropp.split('\n').filter(Boolean).length} rader mot ${deklarerade.size} linser — blocket har vuxit bortom mappningen`)
  }
}
// PRÖVAS PÅ MENINGEN, INTE PÅ EMFASEN. Första formen krävde `inte §A-zonad` ordagrant och
// föll på att texten skriver `inte** §A-zonad` — en formuleringsvakt som fäller en fil som
// redan gör rätt. Markdown-emfasen strippas därför bort före provet.
const utanEmfas = (t) => t.replace(/[*`]/g, '')
check('GL-GAP-2: luckans transition säger UT varför generering vore fel väg',
  paket.every((p) => !existsSync(join(ROT, `packs/${p}/gate-lenses.md`)) || (() => {
    const t = utanEmfas(las(`packs/${p}/gate-lenses.md`))
    return /inte §A-zonad/.test(t) && /OSKYDDAD fil bestämma vad en SKYDDAD grind kräver/.test(t) && /Routning är inte kravnivå/.test(t)
  })()),
  'transitionen sa tidigare "Följer GL-GAP-1", vilket hade lett rakt in i en sänkning av skyddet — skälet måste stå i raden, inte i ett minne')
// DEN VILSELEDANDE FRASEN FÅR INTE STÅ KVAR BREDVID DEN RÄTTA. En mutation som la tillbaka
// hänvisningen FÖRE motiveringen överlevde första formen: de tre krävda fraserna stod ju
// kvar. En rad som säger både "följ den vägen" och "den vägen sänker skyddet" är värre än
// en som bara säger fel — nästa läsare väljer den kortare meningen.
//
// KONTROLLEN SKILJER INTE ETT CITAT FRÅN EN ANVISNING, och det fällde raden när den
// CITERADE sin egen gamla lydelse för att förklara rättelsen. Att lära kontrollen se
// skillnaden vore att bygga en tolkare av citattecken; i stället är raden omformulerad så
// att den beskriver den gamla hänvisningen utan att återge den ordagrant. **Historien står
// kvar — kravet är vänt, inte struket — men den harmlösa formen valdes framför den
// tvetydiga.** En läsare som skummar, eller en agent som greppar, ser annars en anvisning
// där det stod ett citat.
check('GL-GAP-2: den gamla, felpekande transitionen står INTE kvar',
  paket.every((p) => !existsSync(join(ROT, `packs/${p}/gate-lenses.md`)) || (() => {
    const rad = las(`packs/${p}/gate-lenses.md`).split('\n').find((r) => r.startsWith('| `GL-GAP-2`')) || ''
    return !/Följer `?GL-GAP-1`?/.test(rad)
  })()),
  'raden pekar tillbaka på GL-GAP-1:s väg samtidigt som den förklarar varför den vägen sänker skyddet — två motstridiga anvisningar i samma rad, och den kortare vinner')

// Ett omnämnande VAR SOM HELST räcker inte — luckan måste stå som TABELLRAD med sin
// transition, annars kan raden strykas medan ordet står kvar i prosan.
// GENERERINGEN ÄR INTE FRIVILLIG. Att `--generera` finns hjälper inte om ingen kör den.
// Vakten räknar fram tabellen i minnet och kräver att den COMMITTADE är identisk — då är
// drift inte längre "något att upptäcka" utan något som inte kan committas.
{
  const raderNu = []
  for (const p of paket) {
    if (!existsSync(join(ROT, `packs/${p}/gate-lenses.md`))) continue
    for (const m of las(`packs/${p}/gate-lenses.md`).matchAll(/^\| `([\w-]+:[\w-]+)` \| `(\w+)` \| ([^|]+?) \|/gm)) {
      raderNu.push(`  '${m[1]}': '${m[2]}',`.padEnd(34) + `// ${m[3].trim()}`)
    }
  }
  check('Den committade linstabellen ÄR den genererade', tabell[1].trim() === raderNu.join('\n').trim(),
    'kör `node scripts/check-paketlinser.mjs --generera` — paketen är källan, workflowets tabell är utdata, och en handredigerad utdata är drift som väntar på att hända')
}
check('Luckan `GL-GAP-1` står som TABELLRAD med sin transition',
  paket.some((p) => existsSync(join(ROT, `packs/${p}/gate-lenses.md`)) &&
    /^\| `GL-GAP-1` \|[^|]+\|[^|]+\|$/m.test(las(`packs/${p}/gate-lenses.md`))),
  'ett omnämnande i prosan räcker inte — raden kan strykas medan ordet står kvar, och då läses spegeln som en koppling')

// RADEN BINDS TILL MEKANISMEN, inte bara till de andra raderna. En mutation som vände
// `GL-GAP-1` från STÄNGD till ÖPPEN överlevde hela batteriet 2026-08-27: luckan har bara
// EN rad, så konsistenskontrollen i `check-luckregister.mjs` hade ingenting att jämföra
// med, och `ÖPPEN` är ett giltigt vokabulärord. Konsistens är inte korrekthet.
// Kontrollen ovan bevisar att den genererade linstabellen ÄR den committade — alltså att
// GENERERINGEN, som var stängningens hela substans, fortfarande håller. Då får raden inte
// säga att luckan är öppen: statusen och maskineriet skulle peka åt olika håll, och den
// som läser raden skulle tro att en byggd väg saknas.
check('`GL-GAP-1`:s status STÄMMER med mekanismen som stängde den',
  paket.every((p) => !existsSync(join(ROT, `packs/${p}/gate-lenses.md`)) ||
    /^\| `GL-GAP-1` \|[^|]*STÄNGD/m.test(las(`packs/${p}/gate-lenses.md`))),
  'linstabellen genereras fortfarande — stängningens substans håller — men luckans egen rad säger något annat. En återöppning kräver att mekanismen FAKTISKT slutat gälla, inte att raden skrivs om')

// ---- PK-GAP-3: agentfragmenten, masterplanens §6:s SJÄTTE paketdel --------
// Samma fynd som med linserna: paketets skärpningar av agenternas beteende fanns redan —
// men inline i `agents/*.md`, inte i paketet. Skillnaden är att fragmenten **inte går att
// generera**: de är prosa inuti längre instruktioner, och att generera prosa in i en
// agentfil vore att låta ett paket skriva om en agents text. **Spegeln är taket här**, och
// den prövas i BÅDA riktningar precis som linsspegeln.
for (const p of paket) {
  const fil = `packs/${p}/agent-fragments.md`
  check(`Paketet \`${p}\` deklarerar sina agentfragment`, existsSync(join(ROT, fil)),
    'masterplanens §6 räknar upp agent fragments som en av sex paketdelar — utan filen bor skärpningen bara i agenten')
  if (!existsSync(join(ROT, fil))) continue
  const af = las(fil)
  const rader = [...af.matchAll(/^\| `(AF-\d+)` \| `([^`]+)` \| (.+?) \| `(.+?)` \|$/gm)]
  check(`\`${p}\`: fragmenttabellen kunde läsas`, rader.length > 0, 'inga fragmentrader')
  for (const [, id, agent, vad, ankare] of rader) {
    check(`\`${p}\`/${id}: agenten \`${agent}\` finns`, existsSync(join(ROT, agent)),
      'ett fragment som pekar på en agent som inte finns är en spegel av ingenting')
    if (!existsSync(join(ROT, agent))) continue
    // Ankarfrasen måste stå i agenten. Backticks i tabellcellen är markdown-escapade.
    const fras = ankare.replace(/\\`/g, '`')
    check(`\`${p}\`/${id}: ankarfrasen står i ${agent.split('/').pop()}`,
      las(agent).includes(fras),
      `frasen "${fras.slice(0, 50)}" saknas — spegeln har glidit, och paketet påstår en skärpning agenten inte bär`)
    check(`\`${p}\`/${id}: fragmentet säger UT vad som skärps`, vad.trim().length >= 25,
      'ett fragment utan innehåll är en pekare, och pekare driftar utan att någon märker det')
  }
  check(`\`${p}\`: skärpningslagen står i fragmentregistret`,
    /bara SMALNA av kärnan/.test(af) && /lättar ett universellt krav är ogiltigt/.test(af),
    'utan lagen kan ett fragment lätta ett universellt krav genom att kalla det branschanpassning')
  check(`\`${p}\`: registret säger UT vad som INTE är ett fragment`,
    /Universella krav är aldrig fragment/.test(af),
    'att lista ett universellt krav som paketets gör det valbart genom att knyta det till ett paket')
  check(`\`${p}\`: spegelgränsen är namngiven (AF-GAP-1)`,
    /^\| `AF-1` `AF-GAP-1` \|[^|]+\|[^|]+\|$/m.test(af) || /AF-GAP-1/.test(af),
    'utan luckan läses registret som en koppling')
  check(`\`${p}\`: den LEXIKALA gränsen är namngiven (AF-GAP-2)`,
    /AF-GAP-2/.test(af) && /inte att agenten BETER sig/.test(af),
    'vakten prövar att frasen står där, aldrig att agenten följer den — samma gräns som PK-GAP-2')
}

// ---- FALL 2: bakåtkompatibilitetslagen får inte falla ur en prompt --------
// KONSUMENTMÄNGDEN HÄRLEDS, den hand-kureras inte: varje fil som instruerar läsning av
// `content/profile.ts` är en konsument och måste bära lagen.
const YTOR = ['workflows', 'agents', 'skills']
const kandidater = []
for (const yta of YTOR) {
  const stack = [join(ROT, yta)]
  while (stack.length) {
    const d = stack.pop()
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const full = join(d, e.name)
      if (e.isDirectory()) stack.push(full)
      else if (/\.(js|md)$/.test(e.name)) {
        const t = readFileSync(full, 'utf8')
        if (/läs FÖRST `?content\/profile\.ts|Läs FÖRST content\/profile\.ts|read .{0,20}content\/profile\.ts/i.test(t)) {
          kandidater.push([full.slice(ROT.length + 1), t])
        }
      }
    }
  }
}
check('Ankare: minst en profilkonsument hittades', kandidater.length > 0,
  'hittar detektorn ingen konsument är den trasig — ett tomt resultat får aldrig läsas som ett rent resultat')
const utanLagen = kandidater.filter(([, t]) => !/SAKNAS_I_V1/.test(t))
check('Varje fil som instruerar läsning av profile.ts BÄR bakåtkompatibilitetslagen',
  utanLagen.length === 0,
  `${utanLagen.map(([f]) => f).join(', ')} läser profilen men säger inte att saknade v2-fält är SAKNAS_I_V1 — och \`false\` är där det GYNNSAMMA svaret, så felet ser ut som ett godkännande`)
// SUBSTANS, INTE FORMULERING. Första versionen krävde frasen "ALDRIG som tomt eller
// falskt" och fällde `nortropic-review.js` — som säger *"say the contract cannot decide
// it … never invent a requirement the contract does not carry"*, alltså lagen tillämpad
// KORREKT i andra ord. **En kontroll som kräver en formulering tvingar fram en sämre text
// i en fil som redan var rätt.** Kravet är att frånvaron uttrycks som OKÄND — på något av
// flera godtagbara sätt — aldrig som ett negativt svar.
const OKANT = [/ALDRIG som tomt eller/i, /aldrig som tomt, falskt eller noll/i,
  /cannot decide/i, /kan inte avgöra/i, /redovisas som okänt/i, /okänt, aldrig/i]
const svag = kandidater.filter(([, t]) => /SAKNAS_I_V1/.test(t) && !OKANT.some((m) => m.test(t)))
check('Och de uttrycker frånvaron som OKÄND, aldrig som ett negativt svar', svag.length === 0,
  `${svag.map(([f]) => f).join(', ')} nämner SAKNAS_I_V1 men säger inte att det betyder OKÄNT — namnet ensamt hindrar ingen från att behandla det som false, och false är där det GYNNSAMMA svaret`)

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
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} paketlinskontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} paketlinskontroller (${deklarerade.size} linser, ${kandidater.length} profilkonsumenter)`)
console.log('\nVAD DETTA INTE BEVISAR: att grindworkflowet LÄSER paketet. Tabellen i paketet är')
console.log('en SPEGEL, och en spegel är ingen koppling (GL-GAP-1). Ett andra paket kräver')
console.log('fortfarande en ändring i nortropic-launch.js, vars kategorimängd gränsar till §A3.')
process.exit(0)
