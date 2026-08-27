#!/usr/bin/env node
console.log('VAKT: kor-styrprov.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig
// TÄCKER: tests/controller/*/fall.py
// TÄCKER: tests/controller/provenance/test_*.py
// TÄCKER: tests/scripts/*/*.py
//
// STYRPROVSKÖRAREN — de tretton kontraktssviter som ingenting anropade.
//
// VARFÖR DEN HÄR FILEN FINNS. En inventering 2026-08-27 svepte efter anropare och fann
// TRETTON provfiler under `tests/` utan en enda. De kördes för första gången på länge, och
// svaret var dyrt: `tests/controller/loop/fall.py` hade varit RÖD sedan 2026-08-26 därför
// att `controller/verify/register.json` pinnar `scripts/check-invariants.mjs` vid sha256
// medan webbförvaltningen redigerade filen. Styrplanets grind vägrade starta — precis rätt
// — och ingen såg det. **En regression som ingen mekanism letar efter är en regression som
// bor kvar.**
//
// TRE UTFALL, och det tredje är det som gör köraren ärlig:
//   PASS       — sviten kördes och höll
//   FAIL       — sviten kördes och föll. Ett verkligt fynd
//   ODÖMBART   — sviten kunde inte köras här. Aldrig grönt, aldrig ett fynd
//
// MILJÖGRÄNSEN HÄRLEDS, DEN GISSAS INTE. Flera sviter kräver att controllern kan starta
// processer under macOS Seatbelt-gräns, och en av dem kompilerar C. I en agentsandlåda
// vägrar både `sandbox-exec` och `clang`:s temporärfil med `Operation not permitted`, och
// sviterna faller då på OS:ets nekande — inte för att kontraktet brutits.
//
// KLASSNINGEN KRÄVER BÅDA VILLKOREN: (i) en miljöprob misslyckades, OCH (ii) svitens utdata
// bär en NEKANDESIGNATUR. **En handskriven lista över "sviter som brukar falla i sandlådan"
// hade blivit en ursäktsmaskin** som dolde ett verkligt fel i samma svit dagen efter.
//
// SEPARATIONEN ÄR MÄTT, INTE ANTAGEN (2026-08-27, i en sandlåda där båda proberna föll):
//   utforare · brytare · launch · test_native_authority  → 10, 6, 8 resp. 1 nekandeträffar
//   loop · envelope                                       → NOLL träffar vardera
// De två sistnämnda är verkliga regressioner, och de klassas som FAIL även i den degraderade
// miljön. Att signaturmängden skiljer dem åt på riktig data är hela skälet att lita på den.
//
// INTERPRETATORN ÄR ETT ANKARKRAV. Sviterna använder PEP 604 (`X | None`) och kräver
// Python ≥ 3.12. Körs de med 3.9 faller varenda en på en `TypeError` som ser ut som ett
// kontraktsbrott. Fel interpretator ger ODÖMBART för hela körningen, aldrig FAIL.
//
// KÖRAREN INGÅR INTE I `kor-vakter.mjs`. Batterikörarens mängd är `check-*`; den här filen
// är en KÖRARE, pinnas av `check-vaktankare.mjs` och körs avsiktligt. Att lägga en svit som
// i dag är röd i batteriet vore att göra batteriet rött och därmed oanvändbart som grind.
// Att den KÖRS av någon vaktas i stället av `check-provanropare.mjs`.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { existsSync } from 'node:fs'
import { execFileSync, spawnSync } from 'node:child_process'
import { join } from 'node:path'

let ROT
try {
  ROT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
} catch {
  console.error('ODÖMBART: ingen git-topp — körning utanför repo vägras')
  process.exit(2)
}
const odombart = (skal) => { console.error(`ODÖMBART: ${skal}`); process.exit(2) }

// ---- Interpretatorn: ett ankarkrav, inte en detalj --------------------------
const KRAVD_MINOR = 12
let PY = null
for (const kandidat of ['python3.12', 'python3.13', 'python3']) {
  const r = spawnSync(kandidat, ['-c', 'import sys; print(sys.version_info[0], sys.version_info[1])'], { encoding: 'utf8' })
  if (r.status !== 0 || !r.stdout) continue
  const [maj, min] = r.stdout.trim().split(/\s+/).map(Number)
  if (maj === 3 && min >= KRAVD_MINOR) { PY = kandidat; break }
}
if (!PY) odombart(`ingen Python ≥ 3.${KRAVD_MINOR} hittades — sviterna använder PEP 604 och faller på en TypeError med äldre interpretator, vilket ser ut som ett kontraktsbrott men inte är ett`)

// ---- Seatbelt-proben: miljögränsen HÄRLEDS ----------------------------------
// Proben är en riktig installation av en tillåt-allt-profil. Lyckas den finns gränsen; annars
// inte. Ingen gissning ur plattformsnamn — macOS med blockerad sandbox-exec ser likadant ut
// som macOS utan, och skillnaden är precis den som avgör om ett fall är ett fynd.
// Nekandesignaturer: OS:ets och controllerns egna ord för "jag fick inte". Ingen av dem
// kan uppstå ur ett brutet kontrakt — de betyder alla att en KAPACITET saknades.
const NEKANDE = [
  'Operation not permitted',
  'launch_failed: kunde inte starta',
  'sandbox_apply',
  'Seatbelt-gräns kunde inte installeras',
]
const prober = {
  'seatbelt-gräns': spawnSync('/usr/bin/sandbox-exec', ['-p', '(version 1)(allow default)', '/bin/echo', 'ok'],
    { encoding: 'utf8', timeout: 30_000 }),
  'kompilatorns temporärfil': spawnSync('sh', ['-c', 'printf "int main(void){return 0;}" > "${TMPDIR:-/tmp}/probe.c" && cc -o "${TMPDIR:-/tmp}/probe.bin" "${TMPDIR:-/tmp}/probe.c"'],
    { encoding: 'utf8', timeout: 120_000 }),
}
const fallnaProber = Object.entries(prober).filter(([, r]) => r.status !== 0).map(([n]) => n)
const DEGRADERAD = fallnaProber.length > 0
console.log(`Interpretator: ${PY}`)
for (const [namn, r] of Object.entries(prober)) {
  console.log(`Miljöprob ${namn.padEnd(26)} ${r.status === 0 ? 'OK' : `NEKAD (${((r.stderr || r.error?.message || '').trim().split('\n').pop() || 'okänt skäl').slice(0, 60)})`}`)
}
if (DEGRADERAD) {
  console.log(`\n⚠  MILJÖN ÄR DEGRADERAD — ${fallnaProber.join(' och ')} nekas här.`)
  console.log('   Sviter som faller PÅ ETT NEKANDE klassas ODÖMBART, aldrig FAIL och aldrig grönt.')
  console.log('   Sviter som faller UTAN nekandesignatur är verkliga fynd även i den här miljön.\n')
}

// ---- Svitmängden: uppräknad ur trädet, aldrig handlistad --------------------
let sviter
try {
  sviter = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', 'tests/'],
    { cwd: ROT, encoding: 'utf8' }).split('\n').filter(Boolean)
    .filter((f) => /\.py$/.test(f))
    .filter((f) => existsSync(join(ROT, f)))
    .sort()
} catch { odombart('git ls-files misslyckades — svitmängden går inte att avgränsa') }
if (sviter.length === 0) odombart('noll sviter funna — en tom mängd är aldrig ett rent resultat')

// `unittest`-sviter saknar egen `__main__`-körning i den här kodbasen och måste startas som
// modul. Formen HÄRLEDS ur filen: bär den `unittest.main()` går den direkt, annars via -m.
const rader = []
for (const svit of sviter) {
  const somModul = /test_[^/]+\.py$/.test(svit)
  const argv = somModul
    ? ['-m', 'unittest', svit.replace(/\.py$/, '').replace(/\//g, '.')]
    : [join(ROT, svit)]
  const r = spawnSync(PY, argv, { cwd: ROT, encoding: 'utf8', timeout: 900_000 })
  const ut = `${r.stdout || ''}${r.stderr || ''}`
  let verdikt
  if (r.error) verdikt = { lage: 'ODÖMBART', skal: `kunde inte startas: ${r.error.code || r.error.message}` }
  else if (r.status === 0) verdikt = { lage: 'PASS', skal: (ut.trim().split('\n').pop() || '').slice(0, 60) }
  else {
    // BÅDA villkoren krävs. Bara "sviten föll och vi är i en sandlåda" hade blivit en
    // ursäktsmaskin som döljer ett verkligt fel i samma svit dagen efter.
    const traffar = NEKANDE.filter((m) => ut.includes(m))
    if (DEGRADERAD && traffar.length > 0) {
      verdikt = { lage: 'ODÖMBART', skal: `föll på ett NEKANDE (${traffar.length} träffar: ${traffar[0]}) i en degraderad miljö` }
    } else verdikt = { lage: 'FAIL', skal: (ut.trim().split('\n').pop() || '').slice(0, 70) }
  }
  rader.push({ svit, ...verdikt })
}

const bredd = Math.max(...rader.map((r) => r.svit.length))
for (const r of rader) console.log(`${r.lage.padEnd(10)} ${r.svit.padEnd(bredd)}  ${r.skal}`)

const fel = rader.filter((r) => r.lage === 'FAIL')
const odom = rader.filter((r) => r.lage === 'ODÖMBART')
console.log(`\n${rader.length} sviter: ${rader.filter((r) => r.lage === 'PASS').length} PASS · ${fel.length} FAIL · ${odom.length} ODÖMBART`)

if (odom.length) {
  console.log('\nODÖMBARA — kunde inte köras här, alltså varken gröna eller fynd:')
  for (const r of odom) console.log(`  · ${r.svit} — ${r.skal}`)
  console.log('  Kör om utan agentsandlåda för att döma dem. En ODÖMBAR svit blir aldrig grön.')
}
if (fel.length) {
  console.error('\nFAIL — verkliga fynd:')
  for (const r of fel) console.error(`  · ${r.svit} — ${r.skal}`)
  console.error('\nRESULTAT: FAIL — styrplanets kontraktssviter håller inte.')
  process.exit(1)
}
if (odom.length) {
  console.error(`\nRESULTAT: ODÖMBART — ${odom.length} av ${rader.length} sviter kunde inte köras i den här miljön.`)
  process.exit(2)
}
console.log('\nRESULTAT: PASS — samtliga styrprovssviter höll')
console.log('\nVAD DETTA INTE BEVISAR: att styrplanet gör rätt i drift. Sviterna prövar')
console.log('KONTRAKTEN — vad varje led lovar sin granne — och deras egna filhuvuden säger')
console.log('att `verify/bin/**` är grindarna och ägarhand. En grön körning här är ett')
console.log('nödvändigt villkor för att lita på loopen, aldrig ett tillräckligt.')
process.exit(0)
