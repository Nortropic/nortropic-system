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
// annat är möjligt utan att köra Actions. Två av kontrollerna är dock verkliga
// mekanismprov och inte lexikala: att filen är SPÅRAD, och att vitlistan inte
// ignorerar den — och det är just de två som hade fångat natten 16–17 september,
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
  const onBlock = text.match(/^on:\n((?:[ \t]+.*\n|\n)*)/m)
  if (!onBlock) rad('ingen on:-blockdeklaration — utlösaren går inte att avgöra')
  else {
    if (!/^\s+pull_request:/m.test(onBlock[1])) rad('on: saknar pull_request — granskningen utlöses aldrig')
    if (/^\s{2}push:/m.test(onBlock[1])) rad('on: bär push — bevarande skulle passera granskningen (regel 12a)')
  }

  // De tre jobben. Försvinner ett är mekanismen halverad utan att något syns.
  for (const j of ['vakter:', 'provsviter:', 'granskning:']) {
    if (!text.includes(`\n  ${j}\n`)) rad(`jobbet \`${j.slice(0, -1)}\` saknas`)
  }

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
  const antalOdombart = (text.match(/GITHUB_STEP_SUMMARY/g) || []).length
  if (antalOdombart < 3) rad(`bara ${antalOdombart} ODÖMBART-sammanfattningar — varje jobb måste kunna säga att något inte gick att mäta`)
  if (!/"2"/.test(text)) rad('ingen hantering av exit 2 — ODÖMBART skulle bokföras som ett fel i kandidaten')

  // En avbruten körning är varken grön eller röd; en push strax före merge kunde
  // annars lämna PR:en helt utan dom.
  if (/cancel-in-progress:\s*true/.test(text)) rad('cancel-in-progress: true — en avbruten körning lämnar PR:en utan dom')

  // En secret får bara stå som ett mappningsvärde, aldrig inbakad i ett skalkommando:
  // en interpolerad secret hamnar i skalhistorik och felmeddelanden. Ägarens regel
  // (beslutslogg 2026-08-XX): configen bär sökvägen, aldrig värdet.
  for (const l of text.split('\n')) {
    if (!/\$\{\{\s*secrets\./.test(l)) continue
    if (!/^\s*[A-Za-z_][A-Za-z0-9_]*:\s*\$\{\{\s*secrets\.[A-Za-z_][A-Za-z0-9_]*\s*\}\}\s*$/.test(l)) {
      rad(`secret interpolerad utanför ett mappningsvärde: ${l.trim().slice(0, 60)}`)
    }
  }

  // Granskningen ska peka på repots egen roll, inte skriva av den.
  if (!text.includes('.agents/skills/nortropic-reviewer/SKILL.md')) {
    rad('prompten pekar inte på nortropic-reviewer-skillen — två definitioner av granskning driver isär')
  }
  return f
}

// ---- KONTROLLPROV: kan vakten säga NEJ? -------------------------------------
// En vakt som aldrig fällt något har inte bevisat att den KAN fälla något.
const GILTIG = `name: granska-pr
on:
  pull_request:
    types: [opened]
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
  granskning:
    steps:
      - env:
          NYCKEL: \${{ secrets.ANTHROPIC_API_KEY }}
        run: echo "$GITHUB_STEP_SUMMARY"
      - with:
          prompt: las .agents/skills/nortropic-reviewer/SKILL.md
`
const KONTROLL = [
  ['giltig workflow flaggar INGENTING', GILTIG, (f) => f.length === 0],
  ['on: utan pull_request FLAGGAS', GILTIG.replace('  pull_request:\n    types: [opened]', '  workflow_dispatch:'),
    (f) => f.some((x) => x.includes('pull_request'))],
  ['on: MED push FLAGGAS', GILTIG.replace('on:\n', 'on:\n  push:\n'),
    (f) => f.some((x) => x.includes('bevarande'))],
  ['ett borttaget jobb FLAGGAS', GILTIG.replace('\n  granskning:\n', '\n  nagot_annat:\n'),
    (f) => f.some((x) => x.includes('granskning'))],
  ['kärnans exitprov i en KODRAD FLAGGAS', GILTIG.replace('      - run: |', '      - run: verify/bin/h-013-exit\n      - run: |'),
    (f) => f.some((x) => x.includes('Darwin'))],
  ['en NÄMNING i en kommentar flaggas INTE', `# kör aldrig verify/bin/h-013-exit här\n${GILTIG}`,
    (f) => f.length === 0],
  ['borttagen exit-2-hantering FLAGGAS', GILTIG.replace(/"2"/g, '"9"'),
    (f) => f.some((x) => x.includes('exit 2'))],
  ['cancel-in-progress: true FLAGGAS', GILTIG.replace('cancel-in-progress: false', 'cancel-in-progress: true'),
    (f) => f.some((x) => x.includes('utan dom'))],
  ['secret INBAKAD I ETT SKALKOMMANDO FLAGGAS',
    GILTIG.replace('        run: echo "$GITHUB_STEP_SUMMARY"', '        run: echo \${{ secrets.ANTHROPIC_API_KEY }} > /tmp/k'),
    (f) => f.some((x) => x.includes('interpolerad'))],
  ['borttagen skillpekare FLAGGAS', GILTIG.replace('.agents/skills/nortropic-reviewer/SKILL.md', 'granska noga'),
    (f) => f.some((x) => x.includes('skillen'))],
]
for (const [namn, text, vantat] of KONTROLL) {
  let f
  try { f = dom(text) } catch (e) { f = [`kastade: ${e.message}`] }
  check(`Kontrollprov: ${namn}`, vantat(f), `fynden blev [${f.join(' · ')}]`)
}

// ---- DEN VERKLIGA FILEN ------------------------------------------------------
// De två kontrollerna nedan är de ENDA i vakten som prövar en mekanism och inte en
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
