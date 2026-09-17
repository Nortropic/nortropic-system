#!/usr/bin/env node
// check-granskningsmekanismen.mjs — vaktar att PR-granskningen finns och kan köra.
//
// VARFÖR. `.github/workflows/granska-pr.yml` är mekanismen bakom AGENTS.md:s
// reviewer-krav, och den vaktades av INGENTING: ingen `scripts/check-*.mjs` läste
// katalogen (`workflows/**` i regler.md §6 och `check-invariants.mjs` syftar på
// ROTKATALOGEN `workflows/`, en annan sak). Granskningsmekanismen kunde alltså
// stängas av i en PR den själv granskade. Fyndet kom ur granskningen av den PR som
// införde workflowen — mekanismen fällde sig själv, vilket är så det ska gå till.
//
// ⚠️ VAD DEN HÄR VAKTEN INTE KAN, utskrivet därför att blindfläcken annars blir en
// falsk trygghet. Den läser en YAML-fil som bara GitHub kan EXEKVERA; den kan aldrig
// pröva vad workflowen GÖR, bara vad den SÄGER. Det är precis den lexikala metod som
// gav elva av repots tretton falska påståenden, och den används här för att inget
// annat är möjligt utan att köra Actions. Tre av kontrollerna är dock verkliga
// mekanismprov och inte lexikala: att filen är SPÅRAD, att vitlistan inte
// ignorerar den, och att granskartexten är spårad — och det är de som hade fångat natten 16–17 september,
// då `.gitignore` tyst svalde `.githooks/post-commit` och en mergad PR påstod en
// mekanism som aldrig fanns i repot.
//
// EN WORKFLOW KAN INTE HINDRA EN MERGE. Det kräver branch protection, alltså ägarens
// hand. Den här vakten fäller att mekanismen TAS BORT eller LAMSLÅS, inte att den
// kringgås. Se AGENTS.md.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { readFileSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

console.log('VAKT: check-granskningsmekanismen.mjs')

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

const VAG = '.github/workflows/granska-pr.yml'
const TILLAGG = '.agents/skills/nortropic-reviewer/PR-TILLAGG.md'

// Mekanismens definition, inte en spegling av den. Lägg till 'granskning' här i samma
// commit som jobbet slås på igen — annars fäller vakten på att det saknas, vilket är
// precis vad en definition ska göra.
const FORVANTADE_JOBB = ['vakter', 'provsviter']
const MIN_ODOMBART = FORVANTADE_JOBB.length

// ---- MEKANISMEN, FAKTORISERAD UT -------------------------------------------
// `dom` avgör allt ur en textmängd och rör inget globalt. Därför kan den köras mot
// en SYNTETISK workflow och tvingas bevisa att den kan säga NEJ — utan det är en
// grön vakt bara ett påstående om att den inte hittade något.
function dom(text) {
  const f = []
  const rad = (v) => f.push(v)

  // Utlösaren. `pull_request` krävs; `push` på on-nivå är förbjuden, eftersom en
  // granskning som körs på push gör bevarande till något som kan fastna (regel 12a,
  // och ägarens uttryckliga villkor: "så vi inte fastnar med opushade commits").
  // Läses ur KODRADERNA: en `push:` efter en kommentarsrad inne i on-blocket är giltig
  // YAML men hade stoppat den gamla regexen vid kommentaren (andra granskningen, M12).
  const kodrad = (l) => !/^\s*#/.test(l)
  const kod = text.split('\n').filter(kodrad).join('\n')
  const onBlock = kod.match(/^on:\n((?:[ \t]+.*\n|\n)*)/m)
  if (!onBlock) rad('ingen on:-blockdeklaration — utlösaren går inte att avgöra')
  else {
    if (!/^\s+pull_request:/m.test(onBlock[1])) rad('on: saknar pull_request — granskningen utlöses aldrig')
    if (/^\s{2}push:/m.test(onBlock[1])) rad('on: bär push — bevarande skulle passera granskningen (regel 12a)')
  }

  // Jobben. Försvinner ett är mekanismen halverad utan att något syns.
  //
  // DIFFGRANSKNINGEN STÅR INTE HÄR. Ägarbeslut 2026-09-17 (*"Nej i nuläget"* på
  // /install-github-app): utan nyckel var jobbet rött på varje PR, och ett kryss som
  // aldrig kan bli grönt lär bara ut att ignorera rött. Slås det på igen läggs
  // 'granskning:' till nedan i SAMMA commit — vakten fäller annars, vilket är
  // meningen: listan är mekanismens definition, inte en spegling av den.
  for (const j of FORVANTADE_JOBB) {
    if (!text.includes(`\n  ${j}:\n`)) rad(`jobbet \`${j}\` saknas`)
  }
  // MÄNGDLIKHET, inte bara närvaro. Första formen prövade att listade jobb FINNS och
  // aldrig att olistade SAKNAS — ett halvvägs påslaget granskningsjobb passerade med
  // 16/16 (andra granskningen av PR #261, mutation M5) medan fem texter påstod att
  // vakten fäller det. Listan är definitionen; ett jobb utanför den är ett fynd.
  // JOBBRUBRIKEN MÅSTE MATCHAS SOM GITHUB SER DEN, inte som den brukar skrivas.
  // Första formen krävde `^  namn:\s*$` — alltså inget efter kolonet. Tre triviala
  // varianter är RIKTIGA JOBB för GitHub men var osynliga för vakten (mätt med en
  // YAML-parser, och alla tre passerade 19/19):
  //     `  smyg: # ser oskyldig ut`   `  "smyg":`   `  smyg: {runs-on: …}`
  // M5-kringgåendet överlevde alltså sin egen lagning med ETT TECKEN. Fångat av en
  // andra, oberoende granskning av samma commit — den första hade dömt TILLSTYRKS.
  // Tillåter nu citat och godtycklig svans efter kolonet.
  const jobbIKod = []
  let iJobs = false, aktuelltJobb = ''
  const jobbPerRad = []
  for (const l of kod.split('\n')) {
    if (/^jobs:\s*$/.test(l)) { iJobs = true; jobbPerRad.push(''); continue }
    if (iJobs && /^\S/.test(l)) iJobs = false
    const m = iJobs && l.match(/^ {2}(?:"([^"]+)"|'([^']+)'|([A-Za-z_][A-Za-z0-9_-]*))\s*:/)
    if (m) { aktuelltJobb = m[1] || m[2] || m[3]; jobbIKod.push(aktuelltJobb) }
    jobbPerRad.push(iJobs ? aktuelltJobb : '')
  }
  for (const j of jobbIKod) {
    if (!FORVANTADE_JOBB.includes(j)) rad(`oväntat jobb \`${j}\` — FORVANTADE_JOBB är mekanismens definition och uppdateras i samma commit`)
  }
  // Kandidatkod får aldrig köra med en hemlighet: varje levande jobb kör PR-spetsens egen
  // kod. En secret i ett sådant jobb — även som env-mappning till steget — är ett fynd
  // (ägarkrav 2026-09-17: kör inte obetrodd kandidatkod med produktionshemligheter).
  // Slås granskningsjobbet på igen läggs dess namn till TILLATNA_SECRET_JOBB i samma commit.
  const TILLATNA_SECRET_JOBB = ['granskning']
  kod.split('\n').forEach((l, i) => {
    if (/secrets\./.test(l) && !TILLATNA_SECRET_JOBB.includes(jobbPerRad[i] || '')) {
      rad(`secret i jobbet \`${jobbPerRad[i] || '?'}\` som kör kandidatkod: ${l.trim().slice(0, 50)}`)
    }
  })

  // Kärnans exitprov får ALDRIG köras här: Darwin-bundna, och på ubuntu-latest
  // hade varje PR bokfört en MILJÖ som ett fel i kandidaten.
  for (const m of ['verify/bin/h-', 'controller/verify/cli']) {
    if (text.includes(m)) {
      // En nämning i en kommentar är tillåten — det är så förbudet dokumenteras.
      const kodrader = text.split('\n').filter((l) => l.includes(m) && !/^\s*#/.test(l))
      if (kodrader.length) rad(`kärnans Darwin-bundna prov körs här (${m}) — en miljö skulle bokföras som ett kandidatfel`)
    }
  }

  // ODÖMBART får inte tyst bli grönt eller tyst bli ett kandidatfel. Varje jobb som
  // kör ett prov måste nämna exit 2 OCH skriva till sammanfattningen.
  // Räknas bara i KODRADER: det återstartbara jobbet längst ned i filen ligger
  // bortkommenterat och skulle annars räknas som en mekanism som finns.
  const antalOdombart = (kod.match(/GITHUB_STEP_SUMMARY/g) || []).length
  if (antalOdombart < MIN_ODOMBART) rad(`bara ${antalOdombart} ODÖMBART-sammanfattningar i kod — varje jobb måste kunna säga att något inte gick att mäta`)
  if (!/"2"/.test(kod)) rad('ingen hantering av exit 2 — ODÖMBART skulle bokföras som ett fel i kandidaten')

  // En avbruten körning är varken grön eller röd; en push strax före merge kunde
  // annars lämna PR:en helt utan dom.
  if (/cancel-in-progress:\s*true/.test(text)) rad('cancel-in-progress: true — en avbruten körning lämnar PR:en utan dom')

  // TOPPNIVÅNS `permissions` MÅSTE FINNAS OCH VARA MINIMAL. Jobben här kör PR-SPETSENS
  // EGEN KOD; en skrivtoken hade låtit en kandidat skriva sitt eget "DOM: TILLSTYRKS".
  // Sänkningen till `contents: read` gjordes som en säkerhetsåtgärd men var OVAKTAD —
  // blocket kunde tas bort, eller bytas mot `contents: write`, och vakten passerade.
  // En säkerhetsåtgärd utan vakt är en rutin, inte en mekanism (granskningens A2).
  // Slås granskningsjobbet på ges det `pull-requests: write` PER JOBB, aldrig här.
  const permBlock = kod.match(/^permissions:\n((?:[ \t]+.*\n|\n)*)/m)
  if (!permBlock) {
    rad('ingen `permissions:` i kodraderna — jobben ärver då repots standardtoken och kandidatkod kan skriva till PR:en')
  } else {
    const rader = permBlock[1].split('\n').map((l) => l.trim()).filter(Boolean)
    for (const r of rader) {
      if (!/^contents:\s*read$/.test(r)) {
        rad(`toppnivåns permissions bär \`${r}\` — bara \`contents: read\` är tillåtet, kandidatkod får ingen skrivtoken`)
      }
    }
    if (rader.length === 0) rad('`permissions:` är tomt — omfattningen går inte att avgöra')
  }

  // En secret får bara stå som ett mappningsvärde, aldrig inbakad i ett skalkommando:
  // en interpolerad secret hamnar i skalhistorik och felmeddelanden. Ägarens regel
  // (beslutslogg 2026-08-XX): configen bär sökvägen, aldrig värdet.
  // BARA KODRADER. En `${{ secrets.X }}` i en YAML-KOMMENTAR interpoleras aldrig av
  // Actions — den är text. Första formen läste hela filen och fällde därför det
  // återstartbara jobbet längst ned, som ligger bortkommenterat just för att inte
  // köras. Vakten prövade vad raden SÅG UT SOM i stället för vad den GÖR; felklass 1,
  // begången av vakten mot felklass 2. Fångad av vaktens egen körning, 2026-09-17.
  for (const l of text.split('\n')) {
    if (!kodrad(l)) continue
    if (!/\$\{\{\s*secrets\./.test(l)) continue
    if (!/^\s*[A-Za-z_][A-Za-z0-9_]*:\s*\$\{\{\s*secrets\.[A-Za-z_][A-Za-z0-9_]*\s*\}\}\s*$/.test(l)) {
      rad(`secret interpolerad utanför ett mappningsvärde: ${l.trim().slice(0, 60)}`)
    }
  }

  // Granskningen ska peka på repots egen roll, inte skriva av den. Gäller oavsett om
  // jobbet är påslaget: filen ska aldrig bära en andra definition av "granskning".
  if (!text.includes('.agents/skills/nortropic-reviewer/')) {
    rad('filen pekar inte på nortropic-reviewer-rollen — två definitioner av granskning driver isär')
  }
  // Jobbmängden bärs ut som en EGENSKAP på fyndlistan, inte som en ny returtyp:
  // kontrollproven dömer på `f.length`, och en ändrad returform hade gjort dem tysta.
  f.jobb = jobbIKod
  return f
}

// ---- KONTROLLPROV: kan vakten säga NEJ? -------------------------------------
// En vakt som aldrig fällt något har inte bevisat att den KAN fälla något.
const GILTIG = `name: granska-pr
on:
  pull_request:
    types: [opened]
permissions:
  contents: read
concurrency:
  group: g
  cancel-in-progress: false
jobs:
  vakter:
    steps:
      - run: |
          if [ "$K" = "2" ]; then echo x >> "$GITHUB_STEP_SUMMARY"; fi
  provsviter:
    steps:
      - run: |
          if [ "$K" = "2" ]; then echo x >> "$GITHUB_STEP_SUMMARY"; fi
      - run: las .agents/skills/nortropic-reviewer/SKILL.md
`
const KONTROLL = [
  ['giltig workflow flaggar INGENTING', GILTIG, (f) => f.length === 0],
  ['on: utan pull_request FLAGGAS', GILTIG.replace('  pull_request:\n    types: [opened]', '  workflow_dispatch:'),
    (f) => f.some((x) => x.includes('pull_request'))],
  ['on: MED push FLAGGAS', GILTIG.replace('on:\n', 'on:\n  push:\n'),
    (f) => f.some((x) => x.includes('bevarande'))],
  ['ett borttaget jobb FLAGGAS', GILTIG.replace('\n  provsviter:\n', '\n  nagot_annat:\n'),
    (f) => f.some((x) => x.includes('provsviter'))],
  // Det återstartbara jobbet längst ned i den verkliga filen ligger bortkommenterat.
  // Räknades kommentarer som kod skulle vakten både fälla dess secrets OCH tro att
  // dess ODÖMBART-sammanfattning finns. Båda hållen prövas.
  ['en BORTKOMMENTERAD secret flaggas INTE',
    `${GILTIG}#       - env:\n#           K: \${{ secrets.ANTHROPIC_API_KEY }}\n#         run: echo hej\n`,
    (f) => f.length === 0],
  ['en BORTKOMMENTERAD sammanfattning RÄKNAS INTE som en mekanism',
    GILTIG.replace('          if [ "$K" = "2" ]; then echo x >> "$GITHUB_STEP_SUMMARY"; fi\n  provsviter:',
      '          echo inget\n  provsviter:')
      + '#          if [ "$K" = "2" ]; then echo x >> "$GITHUB_STEP_SUMMARY"; fi\n',
    (f) => f.some((x) => x.includes('ODÖMBART-sammanfattningar'))],
  ['kärnans exitprov i en KODRAD FLAGGAS', GILTIG.replace('      - run: |', '      - run: verify/bin/h-013-exit\n      - run: |'),
    (f) => f.some((x) => x.includes('Darwin'))],
  ['en NÄMNING i en kommentar flaggas INTE', `# kör aldrig verify/bin/h-013-exit här\n${GILTIG}`,
    (f) => f.length === 0],
  ['borttagen exit-2-hantering FLAGGAS', GILTIG.replace(/"2"/g, '"9"'),
    (f) => f.some((x) => x.includes('exit 2'))],
  // Säkerhetsåtgärden `contents: read` var ovaktad tills granskningens A2 — en
  // säkerhetsåtgärd utan vakt är en rutin, inte en mekanism. Tre håll prövas.
  ['BORTTAGET permissions-block FLAGGAS', GILTIG.replace('permissions:\n  contents: read\n', ''),
    (f) => f.some((x) => x.includes('ingen `permissions:`'))],
  ['`contents: write` FLAGGAS', GILTIG.replace('  contents: read', '  contents: write'),
    (f) => f.some((x) => x.includes('contents: write'))],
  ['`pull-requests: write` FLAGGAS', GILTIG.replace('  contents: read', '  contents: read\n  pull-requests: write'),
    (f) => f.some((x) => x.includes('pull-requests: write'))],
  ['ett BORTKOMMENTERAT permissions-block räknas INTE',
    GILTIG.replace('permissions:\n  contents: read\n', '#permissions:\n#  contents: read\n'),
    (f) => f.some((x) => x.includes('ingen `permissions:`'))],
  ['cancel-in-progress: true FLAGGAS', GILTIG.replace('cancel-in-progress: false', 'cancel-in-progress: true'),
    (f) => f.some((x) => x.includes('utan dom'))],
  ['secret INBAKAD I ETT SKALKOMMANDO FLAGGAS',
    GILTIG.replace('      - run: las .agents/skills/nortropic-reviewer/SKILL.md',
      '      - run: echo \${{ secrets.ANTHROPIC_API_KEY }} > /tmp/k .agents/skills/nortropic-reviewer/SKILL.md'),
    (f) => f.some((x) => x.includes('interpolerad'))],
  ['borttagen rollpekare FLAGGAS', GILTIG.replace('.agents/skills/nortropic-reviewer/SKILL.md', 'granska noga'),
    (f) => f.some((x) => x.includes('nortropic-reviewer'))],
  // Andra granskningen av PR #261: tre överlevande mutationer, nu fällda.
  ['ett OVÄNTAT jobb FLAGGAS (halvvägs påslagen granskning)',
    `${GILTIG}  granskning:\n    steps:\n      - run: echo hej\n`,
    (f) => f.some((x) => x.includes('oväntat jobb'))],
  ['push: efter en KOMMENTARSRAD i on-blocket FLAGGAS',
    GILTIG.replace('  pull_request:\n', '  # kommentar\n  push:\n  pull_request:\n'),
    (f) => f.some((x) => x.includes('bevarande'))],
  ['secret som env till ett levande jobb FLAGGAS',
    GILTIG.replace('      - run: las .agents/skills/nortropic-reviewer/SKILL.md',
      '      - env:\n          NYCKEL: \${{ secrets.ANTHROPIC_API_KEY }}\n        run: las .agents/skills/nortropic-reviewer/SKILL.md'),
    (f) => f.some((x) => x.includes('kör kandidatkod'))],
]
// EN MUTATION SOM INTE MUTERAR PRÖVAR INGENTING. Varje fall utom det första bygger
// på `GILTIG.replace(...)`, och en `replace` vars mönster inte längre finns är en
// tyst no-op: fallet fortsätter vara grönt medan det slutat mäta. Det hände direkt —
// jag ändrade en rad i GILTIG och två kontrollprov slutade testa något utan att säga
// det. Därför prövas först att texten FAKTISKT skiljer sig.
for (const [namn, text, vantat] of KONTROLL) {
  if (namn !== 'giltig workflow flaggar INGENTING' && text === GILTIG) {
    check(`Kontrollprov: ${namn}`, false,
      'mutationen ändrade ingenting — mönstret finns inte längre i GILTIG, så fallet mäter inget')
    continue
  }
  let f
  try { f = dom(text) } catch (e) { f = [`kastade: ${e.message}`] }
  check(`Kontrollprov: ${namn}`, vantat(f), `fynden blev [${f.join(' · ')}]`)
}

// ---- DEN VERKLIGA FILEN ------------------------------------------------------
// De tre kontrollerna nedan är de enda i vakten som prövar en mekanism och inte en
// text — och det är de som hade fångat att vitlistan svalde .githooks/post-commit.
let spararad = false
try {
  execFileSync('git', ['ls-files', '--error-unmatch', VAG], { cwd: ROT, stdio: 'pipe' })
  spararad = true
} catch { spararad = false }
check('Workflowen är SPÅRAD i git', spararad,
  `${VAG} är inte spårad — GitHub Actions läser bara filer som ligger på grenen, så mekanismen finns inte oavsett vad filen innehåller`)

let ignorerad = false
try {
  execFileSync('git', ['check-ignore', '-q', VAG], { cwd: ROT, stdio: 'pipe' })
  ignorerad = true
} catch { ignorerad = false }
check('Vitlistan ignorerar den inte', !ignorerad,
  `${VAG} matchas av .gitignore — samma tysta svälj som drabbade .githooks/post-commit`)

// Granskartexten är mekanismens andra halva sedan diffgranskningsjobbet togs bort
// 2026-09-17: den läses av handen i dag och av maskinen om jobbet slås på. Försvinner
// den, eller blir den ospårad, finns ingen granskning alls — bara en rutin.
let tillaggSparad = false
try {
  execFileSync('git', ['ls-files', '--error-unmatch', TILLAGG], { cwd: ROT, stdio: 'pipe' })
  tillaggSparad = true
} catch { tillaggSparad = false }
check('Granskartexten är SPÅRAD i git', tillaggSparad,
  `${TILLAGG} är inte spårad — AGENTS.md steg 2 pekar då på en text som inte finns för nästa session`)

if (!existsSync(join(ROT, VAG))) odombart(`${VAG} finns inte på disk — innehållet går inte att döma`)
const text = readFileSync(join(ROT, VAG), 'utf8')
if (text.length < 500) odombart(`${VAG} är ${text.length} tecken — för kort för att vara mekanismen, domen vore meningslös`)

const verkliga = dom(text)
check('Den verkliga workflowen bär mekanismen', verkliga.length === 0, verkliga.join(' · '))

// ---- KORSPROV MOT EN RIKTIG YAML-PARSER --------------------------------------
// Allt ovan läser TEXT. Det som avgör är vad GITHUB SER, och skillnaden är inte
// teoretisk: tre jobbrubriker som en regex missade var riktiga jobb för en parser,
// och den luckan överlevde sin egen lagning. Att svara med ännu en regex vore att
// göra om felet — så regexens jobbmängd jämförs nu med en verklig parsers.
//
// Ingen npm-beroende (`check-invariants` förbjuder det), så korsprovet lånar
// python3 + PyYAML om de finns. Saknas de kan korsprovet inte köras, och då säger
// det DET — det blir varken grönt eller rött, och regexen är fortfarande grinden.
// En kontroll som tiger när den inte kan mäta är den falska tryggheten repot består av.
let korsprov = 'kunde inte köras (python3/PyYAML saknas) — regexen är ensam grind'
try {
  const ut = execFileSync('python3', ['-c',
    'import sys,json,yaml;d=yaml.safe_load(open(sys.argv[1]));print(json.dumps(sorted((d.get("jobs") or {}).keys())))',
    join(ROT, VAG)], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  const parserJobb = JSON.parse(ut)
  const regexJobb = [...(verkliga.jobb || [])].sort()
  const lika = parserJobb.length === regexJobb.length && parserJobb.every((j, i) => j === regexJobb[i])
  check('Korsprov: regexens jobbmängd = en YAML-parsers',
    lika, `parsern ser [${parserJobb.join(', ')}], regexen ser [${regexJobb.join(', ')}] — ett jobb som GitHub kör men vakten inte ser är en öppen dörr`)
  korsprov = `kört · parsern och regexen ser samma ${parserJobb.length} jobb`
} catch (e) {
  // ETT SAKNAT VERKTYG OCH EN TRASIG KONTROLL ÄR INTE SAMMA SAK, och första formen
  // kunde inte skilja dem: ett `catch {}` utan diskriminering rapporterade en
  // ReferenceError i MIN EGEN kod som "python3/PyYAML saknas". Korsprovet såg
  // avstängt ut i stället för sönder — alltså exakt den falska trygghet hela filen
  // finns emot, i kontrollen som skulle bevisa att jag inte gör det felet.
  //
  // Bara ett fel FRÅN PROCESSEN är ODÖMBART. Allt annat är vaktens eget fel och
  // fäller, för en vakt som inte kan köra sin egen kod får aldrig se grön ut.
  const processfel = e && (e.code === 'ENOENT' || typeof e.status === 'number')
  if (processfel) {
    korsprov = `kunde inte köras (python3/PyYAML saknas) — regexen är ensam grind`
  } else {
    check('Korsprov: regexens jobbmängd = en YAML-parsers', false,
      `korsprovet kastade i vaktens EGEN kod, inte i python3: ${e && e.message ? e.message.slice(0, 120) : e}`)
    korsprov = 'FÖLL — se kontrollen ovan'
  }
}

// ---- Verdikt ---------------------------------------------------------------
for (const p of passes) console.log(`PASS: ${p}`)
if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`)
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} kontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} kontroller`)
console.log(`\nKORSPROV mot YAML-parser: ${korsprov}`)
console.log('\nGRÄNS: vakten läser vad workflowen SÄGER. Att den FUNGERAR bevisas bara av')
console.log('en körning i Actions, och att en merge stoppas kräver branch protection.')
