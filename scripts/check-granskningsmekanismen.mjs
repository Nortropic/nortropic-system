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
  const jobbIKod = []
  let iJobs = false, aktuelltJobb = ''
  const jobbPerRad = []
  for (const l of kod.split('\n')) {
    if (/^jobs:\s*$/.test(l)) { iJobs = true; jobbPerRad.push(''); continue }
    if (iJobs && /^\S/.test(l)) iJobs = false
    const m = iJobs && l.match(/^  ([A-Za-z_][A-Za-z0-9_-]*):\s*$/)
    if (m) { aktuelltJobb = m[1]; jobbIKod.push(m[1]) }
    jobbPerRad.push(iJobs ? aktuelltJobb : '')
  }
  for (const j of jobbIKod) {
    if (!FORVANTADE_JOBB.includes(j)) rad(`oväntat jobb \`${j}\` — FORVANTADE_JOBB är mekanismens definition och uppdateras i samma commit`)
  }
  // Kandidatkod får aldrig köra med en hemlighet: varje levande jobb kör PR-spetsens egen
  // kod. En secret i ett sådant jobb — även som env-mappning till steget — är ett fynd
  // (ägarkrav 2026-09-17: kör inte obetrodd kandidatkod med produktionshemligheter).
  // Slås granskningsjobbet på igen läggs dess namn till TILLATNA_SECRET_JOBB i samma commit.
  // Token-minimum. Jobben kör kandidatkod; en token med skrivrätt hade låtit kandidaten
  // skriva sin egen dom. Andra granskningen av PR #261 (A2): åtgärden var rätt men ovaktad —
  // permissions-blocket kunde tas bort eller få `write` utan att något föll.
  const permBlock = kod.match(/^permissions:\n((?:[ \t]+.*\n|\n)*)/m)
  if (!permBlock) rad('inget permissions:-block på toppnivå i kod — standardtoken kan ha skrivrätt')
  else {
    const rader = permBlock[1].split('\n').map((l) => l.trim()).filter(Boolean)
    if (rader.length !== 1 || rader[0] !== 'contents: read') rad(`permissions: måste vara exakt \`contents: read\` — fann: ${rader.join(' | ') || '(tomt)'}`)
  }
  if (/^\s{4}permissions:/m.test(kod)) rad('ett jobb bär egen permissions: — en token med skrivrätt i ett jobb som kör kandidatkod')
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
  ['borttaget permissions-block FLAGGAS', GILTIG.replace('permissions:\n  contents: read\n', ''),
    (f) => f.some((x) => x.includes('permissions'))],
  ['permissions med skrivrätt FLAGGAS', GILTIG.replace('  contents: read\n', '  contents: read\n  pull-requests: write\n'),
    (f) => f.some((x) => x.includes('exakt'))],
  ['egen permissions: i ett jobb FLAGGAS', GILTIG.replace('  vakter:\n    steps:', '  vakter:\n    permissions:\n      contents: write\n    steps:'),
    (f) => f.some((x) => x.includes('egen permissions'))],
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

// ---- Verdikt ---------------------------------------------------------------
for (const p of passes) console.log(`PASS: ${p}`)
if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`)
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} kontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} kontroller`)
console.log('\nGRÄNS: vakten läser vad workflowen SÄGER. Att den FUNGERAR bevisas bara av')
console.log('en körning i Actions, och att en merge stoppas kräver branch protection.')
