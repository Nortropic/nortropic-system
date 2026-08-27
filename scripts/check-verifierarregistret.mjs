#!/usr/bin/env node
console.log('VAKT: check-verifierarregistret.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig
// VERIFIERARREGISTRET — de två spåren pinnar SAMMA fil under olika lagar.
//
// VARFÖR DEN HÄR FILEN FINNS. En inventering 2026-08-27 körde `tests/controller/*/fall.py`
// för första gången på länge och fann `loop`-sviten RÖD med 37 fall. En bisektion över 106
// commits pekade ut den första trasiga commiten — **och den kom inte från styrplanet alls**:
//
//   1c206173  "Vaktankaret och batterikoraren: en pinne per vakt, och en iakttagare utifran"
//
// Den skivan lade till raden `console.log('VAKT: check-invariants.mjs')` i
// `scripts/check-invariants.mjs`, så att batterikörarens iakttagare utifrån skulle kunna
// känna igen vakten. Två rader. Fullständigt korrekt för webbförvaltningen.
//
// **MEN `scripts/check-invariants.mjs` ÄR EN REGISTRERAD VERIFIERARE I STYRPLANET.**
// `controller/verify/register.json` pinnar den vid sha256, och registrets egen not lyder:
//
//   > SHA binder den fil som godkändes: ändras filen stoppas körningen med `hash_mismatch`
//   > FÖRE start. […] Registrerad hash uppdateras endast av MÄNNISKOHAND i samma commit
//   > som filändringen.
//
// Styrplanets grind gjorde alltså precis rätt: den vägrade starta. Loopen har varit
// fail-closed-bruten sedan 2026-08-26 — och ingen såg det, eftersom **ingenting kör
// `tests/controller/`**. Byggt och granskat, aldrig testat.
//
// DEN STRUKTURELLA FARON, och den är kvar även efter den här vakten:
//
//   `check-vaktankare.mjs` pinnar filen och pinnar OM den automatiskt (`--pinna-om`).
//   `controller/verify/register.json` pinnar samma fil och får bara röras av en människa.
//
// **En agent som lyder det ena spåret bryter det andra, tyst.** Det går inte att lösa genom
// att låta agenten pinna om båda — då är människohandskravet bara en formulering. Det den
// här vakten köper är att kollisionen SYNS i samma körning som den uppstår, i stället för i
// en Python-svit som ingen anropar.
//
// DEN VÄNTANDE ÄGARHANDEN STÅR SOM KOD, INTE SOM EN RAD I EN RAPPORT. Den kända driften är
// inskriven nedan med BÅDA hasharna. Varje ANNAN drift fäller. Och när ägaren rebindar
// registret blir undantaget FALSKT och fäller också — det kan inte glömmas kvar.
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
const las = (p) => {
  const f = join(ROT, p)
  if (!existsSync(f)) odombart(`ankarfilen saknas — ${p}`)
  return readFileSync(f, 'utf8')
}

const passes = []
const fails = []
const check = (namn, ok, detalj) => (ok ? passes.push(namn) : fails.push(`${namn}: ${detalj}`))
const FORVANTAD_KALLHASH = 'ba7cebc923811ea4'

const REGISTER = 'controller/verify/register.json'
const ANKARE = 'scripts/check-vaktankare.mjs'

// ---- DEN VÄNTANDE ÄGARHANDEN, som kod ---------------------------------------
// Ett VÄNT krav, aldrig ett struket. Driften är verklig och får inte gömmas — men den kan
// inte heller repareras härifrån, eftersom registrets rebindning är människohand. Raden
// nedan bär BÅDA hasharna, så den beskriver EXAKT ett tillstånd: den drift som redan fanns
// när vakten skrevs. Varje annan drift, i endera riktningen, är ny och fäller.
// TOM — OCH DEN TOMHETEN ÄR RESULTATET, inte en oskriven rad.
//
// Den enda posten här var `check-invariants`, och den ströks 2026-08-27 utan att någon
// rebindade registret. **Driften togs bort i stället för att godkännas:**
// `scripts/check-invariants.mjs` är återställd till exakt de bytes registret pinnar
// (`d37e45b4…`), och `kor-vakter.mjs` identifierar den numera på sin HASH mot
// ankarvaktens pinntabell i stället för att kräva en kvittensrad inuti filen.
//
// **Kravet på en kvittensrad var en skrivning i någon annans låsta yta.** Att i stället
// rebinda registret hade godkänt skrivningen och lämnat orsaken kvar — nästa vaktändring
// hade brutit loopen igen. Vakten som skrev den här raden fällde den själv så snart
// hasharna stämde, vilket är hela poängen med att ett undantag bär BÅDA värdena.
const VANTAR_PA_AGARHAND = {}

// ---- MEKANISMEN, FAKTORISERAD UT -------------------------------------------
// `jamfor` tar registret, en filläsare och undantagstabellen och avgör allt. Den rör inget
// globalt, så den kan köras mot ett SYNTETISKT register och tvingas bevisa att den kan
// säga NEJ — särskilt i det farligaste fallet: en drift som INTE står i undantagstabellen.
function jamfor(register, lasBytes, vantar) {
  const fynd = []
  const rader = []
  const v = (register && register.verifiers) || {}
  for (const [id, post] of Object.entries(v)) {
    const path = post && post.path
    const registrerad = post && post.sha256
    if (typeof path !== 'string' || !path || typeof registrerad !== 'string' || registrerad.length !== 64) {
      fynd.push({ typ: 'trasig-post', id, text: `${id} saknar giltig path eller sha256 — en post som inte går att pröva får aldrig läsas som prövad` })
      continue
    }
    const bytes = lasBytes(path)
    if (bytes === null) {
      fynd.push({ typ: 'fil-saknas', id, text: `${id} pekar på ${path} som inte finns — en registrerad verifierare utan fil är odömbar, aldrig grön` })
      continue
    }
    const faktisk = createHash('sha256').update(bytes).digest('hex')
    const undantag = vantar[id]
    if (faktisk === registrerad) {
      // Ett undantag som INTE längre gäller är farligare än ingen: det beskriver ett
      // tillstånd som passerat, och nästa läsare tror att driften kvarstår.
      if (undantag) fynd.push({ typ: 'inaktuellt-undantag', id,
        text: `${id} STÄMMER nu men står kvar som VÄNTAR_PA_AGARHAND — rebindningen är gjord och undantaget ska strykas i samma commit` })
      else rader.push({ id, path, lage: 'STÄMMER' })
      continue
    }
    if (undantag && undantag.registrerad === registrerad && undantag.faktisk === faktisk) {
      rader.push({ id, path, lage: 'VÄNTAR PÅ ÄGARHAND' })
      continue
    }
    fynd.push({ typ: 'ny-drift', id,
      text: `${id}: registret säger ${registrerad.slice(0, 16)}…, filen ${path} är ${faktisk.slice(0, 16)}… — styrplanets verifierare stoppar med hash_mismatch FÖRE start` +
        (undantag ? ' (och detta är INTE den drift undantaget beskriver — läget har rört sig igen)' : ''),
      rebind: faktisk })
  }
  if (Object.keys(v).length === 0) fynd.push({ typ: 'tomt-register', id: '—', text: 'registret har noll verifierare — en tom mängd är aldrig ett rent resultat' })
  return { fynd, rader }
}

// ---- POSITIVT KONTROLLPROV --------------------------------------------------
const H = (s) => createHash('sha256').update(s).digest('hex')
const reg = (sha) => ({ verifiers: { x: { path: 'p', sha256: sha } } })
for (const [namn, [register, lasare, vantar, ok]] of Object.entries({
  'matchande hash flaggar INGENTING': [reg(H('A')), () => 'A', {}, (f) => f.length === 0],
  'DRIFT utan undantag FLAGGAS': [reg(H('A')), () => 'B', {}, (f) => f.some((x) => x.typ === 'ny-drift')],
  'drift som EXAKT matchar undantaget flaggas inte': [reg(H('A')), () => 'B',
    { x: { registrerad: H('A'), faktisk: H('B') } }, (f) => f.length === 0],
  'drift som RÖRT SIG VIDARE flaggas trots undantaget': [reg(H('A')), () => 'C',
    { x: { registrerad: H('A'), faktisk: H('B') } }, (f) => f.some((x) => x.typ === 'ny-drift')],
  'INAKTUELLT undantag (rebindningen gjord) FLAGGAS': [reg(H('A')), () => 'A',
    { x: { registrerad: H('A'), faktisk: H('B') } }, (f) => f.some((x) => x.typ === 'inaktuellt-undantag')],
  'saknad fil FLAGGAS, aldrig tyst hoppad': [reg(H('A')), () => null, {}, (f) => f.some((x) => x.typ === 'fil-saknas')],
  'post utan sha256 FLAGGAS': [{ verifiers: { x: { path: 'p' } } }, () => 'A', {}, (f) => f.some((x) => x.typ === 'trasig-post')],
  'sha256 av fel längd FLAGGAS (aldrig tolkad som kort hash)': [reg('abc'), () => 'A', {}, (f) => f.some((x) => x.typ === 'trasig-post')],
  'TOMT register FLAGGAS': [{ verifiers: {} }, () => 'A', {}, (f) => f.some((x) => x.typ === 'tomt-register')],
  'register utan verifiers-nyckel FLAGGAS': [{}, () => 'A', {}, (f) => f.some((x) => x.typ === 'tomt-register')],
})) {
  const r = jamfor(register, lasare, vantar)
  check(`Kontrollprov: ${namn}`, ok(r.fynd),
    `mekanismen gav ${JSON.stringify(r.fynd.map((x) => x.typ))} — ett prov som inte kan falla bevisar ingenting`)
}

// ---- KOPPLINGSKONTROLL ------------------------------------------------------
const kalltext = readFileSync(fileURLToPath(import.meta.url), 'utf8')
check('Kopplingskontroll: `jamfor` anropas på det VERKLIGA registret',
  /const verkligt = jamfor\(register, lasBytes, VANTAR_PA_AGARHAND\)/.test(kalltext),
  'provet prövar en funktion som inte används — då är den död kod och registret går obevakat')
check('Kopplingskontroll: fynden VÄGS IN i domen', /verkligt\.fynd/.test(kalltext),
  'en jämförelse vars resultat inte läses nedströms är en dekoration')

// ---- DET VERKLIGA REGISTRET -------------------------------------------------
let register
try { register = JSON.parse(las(REGISTER)) } catch (e) { odombart(`${REGISTER} går inte att tolka som JSON (${e.message}) — registret kan inte prövas`) }
const lasBytes = (p) => (existsSync(join(ROT, p)) ? readFileSync(join(ROT, p)) : null)
const verkligt = jamfor(register, lasBytes, VANTAR_PA_AGARHAND)

check('Ankare: registret bär verifierare att döma om', verkligt.rader.length + verkligt.fynd.length > 0,
  'noll poster lästes — ankaret är obevisat och en tom körning får aldrig läsas som ren')
check('Ankare: registrets människohandsnot står kvar',
  /endast av människohand|endast av manniskohand/i.test(las(REGISTER)),
  'noten som gör rebindningen till en mänsklig handling är struken — då är pinnen bara en siffra')

for (const typ of ['trasig-post', 'fil-saknas', 'tomt-register', 'inaktuellt-undantag', 'ny-drift']) {
  const t = verkligt.fynd.filter((x) => x.typ === typ)
  check(`Ingen post är ${typ}`, t.length === 0, t.map((x) => x.text).join(' · '))
}

// ---- DEN DUBBLA PINNINGEN, namngiven ----------------------------------------
// Kollisionen är inte ett fel i någondera pinnen — den är att de lyder olika lagar. Vakten
// kan inte lösa det; den kan se till att det aldrig är osynligt.
const ankarkalla = las(ANKARE)
const dubbelpinnade = Object.values((register.verifiers) || {})
  .map((v) => v && v.path).filter(Boolean)
  .filter((p) => ankarkalla.includes(p.split('/').pop()))
check('Den DUBBLA pinningen är namngiven i vaktens egen källa',
  dubbelpinnade.length === 0 || /En agent som lyder det ena spåret bryter det andra/.test(kalltext),
  'filer pinnas av två regimer utan att vakten säger det — en läsare tror då att en `--pinna-om` är hela sanningen')

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
  const nya = verkligt.fynd.filter((x) => x.typ === 'ny-drift')
  if (nya.length) {
    console.error('\nREBINDNING KRÄVER ÄGARHAND. Registrets egen not: "Registrerad hash uppdateras')
    console.error('endast av människohand i samma commit som filändringen." Värdena, för hand:')
    for (const n of nya) console.error(`  ${n.id}: sha256 = ${n.rebind}`)
  }
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} registerkontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} registerkontroller (källhash ${kallhash})`)
for (const r of [...verkligt.rader].sort((a, b) => a.id.localeCompare(b.id))) console.log(`  ${r.lage.padEnd(20)} ${r.id.padEnd(24)} ${r.path}`)
if (dubbelpinnade.length) {
  console.log('\nDUBBELT PINNADE UNDER OLIKA LAGAR — den strukturella faran, inte ett fel i någondera pinnen:')
  for (const p of dubbelpinnade) console.log(`  · ${p}  (check-vaktankare.mjs pinnar om AUTOMATISKT · registret kräver MÄNNISKOHAND)`)
}
const vantande = verkligt.rader.filter((r) => r.lage === 'VÄNTAR PÅ ÄGARHAND')
if (vantande.length) {
  console.log(`\n${vantande.length} POST VÄNTAR PÅ ÄGARHAND och är därför inte en drift som vakten döljer —`)
  console.log('den står som VÄNT krav i vaktens källa med BÅDA hasharna. Rör läget sig igen fäller')
  console.log('vakten, och när ägaren rebindar blir undantaget falskt och fäller också.')
}
console.log('\nVAD DETTA INTE BEVISAR: att styrplanet fungerar. Vakten prövar EN koppling —')
console.log('att registrets pinnar stämmer med filerna. Att `tests/controller/*/fall.py`')
console.log('faktiskt går igenom är en annan fråga, och fem av åtta sviter kördes inte alls')
console.log('förrän 2026-08-27. Tre av dem kräver Seatbelt och går inte att köra i varje miljö.')
process.exit(0)
