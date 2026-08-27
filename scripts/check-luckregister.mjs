#!/usr/bin/env node
console.log('VAKT: check-luckregister.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig
// LUCKORNAS RAD-AV-PROTOKOLL — vakten som fäller när en lucka säger olika på två ställen.
//
// VARFÖR DEN HÄR FILEN FINNS. En inventering 2026-08-27 prövade luckstatusen MEKANISKT i
// stället för att läsa den, och svaret var att den inte var vaktad alls. Fem mutationer
// vändes STÄNGD → ÖPPEN på fem olika luckor, i fem olika filer, och batteriet fortsatte
// grönt 19/19 varje gång:
//
//   A-GAP-3 · §26-GAP-1 (backtests/README.md) · B-GAP-1 (case-b-saas/FORVANTAT.md)
//   GL-GAP-1 (gate-lenses.md) · PK-GAP-1 (paketkontrakt.md)
//
// DEN VAKT SOM SÅG UT ATT TÄCKA DETTA VAR DET ÅTERKOMMANDE FELET I REN FORM.
// `check-backtest-fixtures.mjs` krävde `/§26-GAP-1/.test(btReadme) && /STÄNGD/.test(btReadme)`
// — en FILVID regex. Så länge NÅGON rad någonstans i filen sa `STÄNGD` passerade den, även
// när just den luckans egen rad hade vänts till `ÖPPEN`. Kontrollen prövade vad utdata SÄGER
// (står ordet i filen?) i stället för vad mekanismen GÖR (bär DEN HÄR luckans rad den
// statusen?). De regexerna är radskopade i samma commit som den här filen skrevs.
//
// TVÅ LUCKOR SAKNADE RAD HELT. `PK-GAP-4` bodde inne i `PK-GAP-1`:s beskrivningscell och
// `INT-GAP-1` bara i en vakts stdout — båda påstådda i beslutsloggen, ingendera kontrollerbar.
// Lagen lyder *"en stängd lucka står kvar som rad"*, och en lucka utan rad kan varken
// stängas eller återöppnas synligt. Vakten fäller på det.
//
// INGET LUCKREGISTER BYGGS, OCH DET ÄR ETT AKTIVT VAL. En sammanställande registerfil vore
// en ANDRA sanning om status — precis vad `docs/agentoverlamning.md` varnar för — och den
// skulle drifta från raderna den sammanfattar. Vakten jämför i stället raderna MOT VARANDRA.
// Det kräver ingen andra yta och kan därför inte drifta från en.
//
// SVENSKA TECKENKLASSER, INTE `\w`. Två gånger under bygget har `\w` missat Å/Ä/Ö och tyst
// gjort en kontroll blind. Här är dessutom `§` en del av id-alfabetet: `§26-GAP-1` är ett
// riktigt id, och `check-docs-coherence.mjs`:s statusspår missade det tills det rättades.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { readFileSync, existsSync, statSync } from 'node:fs'
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
const FORVANTAD_KALLHASH = 'dd8e797ccdf2db7d'

// Beslutsloggen är en BERÄTTELSE, aldrig en rad-av-protokoll. Dess rader beskriver vad som
// gjordes den dagen — historiska påståenden som med rätta står kvar oförändrade även när
// luckan senare rör sig. Läste vakten dem som statusanspråk skulle varje stängd lucka som
// en gång varit öppen se ut som en motstridighet. Uteslutningen gäller BARA anspråkssidan:
// id:n i loggen räknas fortfarande, och en lucka som bara nämns där saknar rad och fälls.
const BERATTELSE = 'docs/05-beslutslogg.md'
const VOKABULARFIL = 'docs/agentoverlamning.md'

// ---- MEKANISMEN, FAKTORISERAD UT -------------------------------------------
// `analysera` tar en korpus ({ fil, text }[]) och en statusvokabulär och returnerar allt
// vakten dömer på. Den rör inget filsystem och läser inget globalt — därför kan den köras
// mot en SYNTETISK korpus och tvingas bevisa att den kan säga NEJ. En mekanism som bara
// prövas mot verkligheten prövas bara mot det utfall som råkar gälla i dag.

const ID_ALFABET = '(?:§\\d+|[A-ZÅÄÖ][A-ZÅÄÖ0-9]*)-GAP-\\d+[a-zåäö]?'
const idIRad = (rad) => [...new Set(rad.match(new RegExp(ID_ALFABET, 'g')) || [])]

/**
 * Statusen läses LÄNGST FÖRST och konsumeras. Utan det läser `DELVIS ÅTGÄRDAT` som två
 * statusar — `DELVIS ÅTGÄRDAT` OCH `ÅTGÄRDAT` — och varje delvis åtgärdad lucka skulle
 * fällas som tvetydig. En kortare status får aldrig matcha inuti en längre.
 */
function statusIRad(rad, vokabular) {
  const ordnad = [...vokabular].sort((a, b) => b.length - a.length)
  let kvar = rad
  const funna = []
  for (const s of ordnad) {
    let hittade = false
    while (kvar.includes(s)) { kvar = kvar.replace(s, ' '.repeat(s.length)); hittade = true }
    if (hittade) funna.push(s)
  }
  return funna
}

/**
 * En RAD-AV-PROTOKOLL är antingen
 *   (a) en tabellrad vars FÖRSTA cell namnger luckan, eller
 *   (b) en rubrik som INLEDS med luckans id.
 *
 * Att kräva id:t i FÖRSTA cellen är hela skillnaden mot en filvid regex. En lucka nämns
 * ofta i en ANNAN luckas beskrivningscell — `A-GAP-3`:s rad säger *"Kvarstår som
 * `AL-GAP-2`"* — och den korsreferensen är inte ett statusanspråk om `AL-GAP-2`. Läste
 * vakten hela raden som ägd av båda skulle `A-GAP-3`:s `STÄNGD` smitta `AL-GAP-2`.
 */
function agareAvRad(rad) {
  if (rad.startsWith('|')) {
    const forstaCell = rad.split('|')[1] || ''
    return idIRad(forstaCell)
  }
  const rubrik = new RegExp(`^#{1,6}\\s+\`?(${ID_ALFABET})\`?\\s*[—\\-–]`).exec(rad)
  return rubrik ? [rubrik[1]] : []
}

function analysera(korpus, vokabular) {
  const idn = new Set()
  const platser = new Map()   // id -> [{ fil, rad, status }]
  const fynd = []

  for (const { fil, text } of korpus) {
    for (const id of text.match(new RegExp(ID_ALFABET, 'g')) || []) idn.add(id)
    if (fil === BERATTELSE) continue
    text.split('\n').forEach((rad, i) => {
      const agare = agareAvRad(rad)
      if (agare.length === 0) return
      const status = statusIRad(rad, vokabular)
      for (const id of agare) {
        if (status.length === 0) {
          fynd.push({ typ: 'tyst-status', id, var: `${fil}:${i + 1}`,
            text: `${id}:s rad-av-protokoll bär ingen status ur den slutna vokabulären — en tyst status går inte att skilja från en glömd` })
        } else if (status.length > 1) {
          fynd.push({ typ: 'tvetydig-status', id, var: `${fil}:${i + 1}`,
            text: `${id}:s rad bär ${status.length} statusar (${status.join(' + ')}) — en rad kan inte säga två saker om samma lucka` })
        }
        if (!platser.has(id)) platser.set(id, [])
        platser.get(id).push({ fil, rad: i + 1, status: status.length === 1 ? status[0] : null })
      }
    })
  }

  // (1) Varje lucka som NÄMNS i trädet måste ÄGA minst en rad-av-protokoll.
  for (const id of [...idn].sort()) {
    if (!platser.has(id)) {
      fynd.push({ typ: 'utan-rad', id, var: '—',
        text: `${id} nämns i trädet men äger ingen rad-av-protokoll — varken stängning eller återöppning går att kontrollera` })
    }
  }

  // (2) DRIFTKONTROLLEN. Alla rader som äger samma lucka måste säga SAMMA sak.
  for (const [id, p] of [...platser].sort()) {
    const kanda = [...new Set(p.map((x) => x.status).filter(Boolean))]
    if (kanda.length > 1) {
      fynd.push({ typ: 'motstridig-status', id, var: p.map((x) => `${x.fil}:${x.rad}`).join(' ≠ '),
        text: `${id} står som ${kanda.join(' på ett ställe och ') } på ett annat — en halv stängning läses som hel` })
    }
  }

  return { idn: [...idn].sort(), platser, fynd }
}

// ---- Vokabulären EXTRAHERAS, den hårdkodas inte -----------------------------
// Stod mängden här skulle dokumentet och vakten kunna glida isär: någon lägger till en
// status i överlämningen, vakten känner inte igen den, raden läses som TYST och fälls med
// fel skäl. Mängden bor i `docs/agentoverlamning.md` — den är METOD, inte status — och
// vakten läser den därifrån. Saknas blocket blir körningen ODÖMBAR, aldrig grön.
const overlamning = las(VOKABULARFIL)
const BLOCK = /<!-- LUCKSTATUS: BÖRJAN[\s\S]*?<!-- LUCKSTATUS: SLUT/.exec(overlamning)
if (!BLOCK) odombart(`${VOKABULARFIL} bär inget LUCKSTATUS-block — statusvokabulären går inte att avgränsa, och att gissa den vore att gissa sig till lösare krav`)
const VOKABULAR = BLOCK[0].split('\n')
  .map((r) => /^\|\s*`([A-ZÅÄÖ_ ]+)`\s*\|/.exec(r))
  .filter(Boolean).map((m) => m[1].trim())
if (VOKABULAR.length < 3) odombart(`statusvokabulären har ${VOKABULAR.length} lägen — en mängd så liten är sannolikt en trasig extraktion, inte en vokabulär`)
if (!VOKABULAR.includes('STÄNGD')) odombart('statusvokabulären saknar `STÄNGD` — extraktionen har tappat sitt ankare')

// ---- POSITIVT KONTROLLPROV: kan mekanismen säga NEJ? ------------------------
// Varje syntetiskt id BYGGS UR DELAR vid körning. Skrevs de som literaler skulle vakten
// hitta dem i sin egen källtext, kräva rader för dem och fälla sig själv på sitt eget prov.
const SYN = (n) => `PR${'OV'}-GAP-${n}`
const rent = [{ fil: 'a.md', text: `| \`${SYN(1)}\` | **STÄNGD.** ok | ok |` },
               { fil: 'b.md', text: `text som nämner ${SYN(1)} i löpande prosa` }]
const prov = {
  'ren korpus flaggar INGENTING': [rent, (f) => f.length === 0],
  'samma lucka med OLIKA status i två filer FLAGGAS': [
    [{ fil: 'a.md', text: `| \`${SYN(2)}\` | **STÄNGD.** x | y |` },
     { fil: 'b.md', text: `| \`${SYN(2)}\` | **ÖPPEN.** x | y |` }],
    (f) => f.some((x) => x.typ === 'motstridig-status' && x.id === SYN(2))],
  'lucka som bara NÄMNS men saknar rad FLAGGAS': [
    [{ fil: 'a.md', text: `prosa om ${SYN(3)} utan någon tabellrad` }],
    (f) => f.some((x) => x.typ === 'utan-rad' && x.id === SYN(3))],
  'rad UTAN status FLAGGAS som tyst': [
    [{ fil: 'a.md', text: `| \`${SYN(4)}\` | beskrivning utan statusord | y |` }],
    (f) => f.some((x) => x.typ === 'tyst-status' && x.id === SYN(4))],
  'rad med TVÅ statusar FLAGGAS som tvetydig': [
    [{ fil: 'a.md', text: `| \`${SYN(5)}\` | **STÄNGD.** men även NAMNGIVEN | y |` }],
    (f) => f.some((x) => x.typ === 'tvetydig-status' && x.id === SYN(5))],
  'OKÄND statusetikett accepteras ALDRIG tyst': [
    [{ fil: 'a.md', text: `| \`${SYN(6)}\` | **FIXAD.** låter klart men står inte i vokabulären | y |` }],
    (f) => f.some((x) => x.typ === 'tyst-status' && x.id === SYN(6))],
  '`DELVIS ÅTGÄRDAT` läses som EN status, inte två': [
    [{ fil: 'a.md', text: `| \`${SYN(7)}\` | **DELVIS ÅTGÄRDAT 2026-01-01.** x | y |` }],
    (f) => !f.some((x) => x.id === SYN(7))],
  'KORSREFERENS i annan cell är inget statusanspråk': [
    [{ fil: 'a.md', text: `| \`${SYN(8)}\` | **STÄNGD.** kvarstår som \`${SYN(9)}\` | y |\n| \`${SYN(9)}\` | **ÖPPEN.** x | y |` }],
    (f) => !f.some((x) => x.typ === 'motstridig-status')],
  '`§`-prefixade id känns igen (§ är del av alfabetet)': [
    // Byggs ur delar av samma skäl som `SYN`: `§` + `99-GAP-7` är ingen giltig id-literal
    // var för sig, så vakten hittar inte sitt eget prov i sin egen källa och fäller sig själv.
    [{ fil: 'a.md', text: `prosa om ${'§' + '99-GAP-7'} utan rad` }],
    (f) => f.some((x) => x.typ === 'utan-rad' && x.id === '§' + '99-GAP-7')],
  'RUBRIK som inleds med id är en rad-av-protokoll': [
    [{ fil: 'a.md', text: `## \`${SYN(1)}\` — STÄNGD 2026-01-01: klar` }],
    (f) => f.length === 0],
  'rubrik med id MITT i titeln äger INGEN rad': [
    [{ fil: 'a.md', text: `# RESEARCH — Kund AB (${SYN(1)}, NO-BUILD)` }],
    (f) => f.some((x) => x.typ === 'utan-rad' && x.id === SYN(1))],
}
for (const [namn, [korpus, ok]] of Object.entries(prov)) {
  let utfall
  try { utfall = analysera(korpus, VOKABULAR).fynd } catch (e) { odombart(`kontrollprovet "${namn}" kastade: ${e.message}`) }
  check(`Kontrollprov: ${namn}`, ok(utfall),
    `mekanismen gav ${JSON.stringify(utfall.map((x) => `${x.typ}/${x.id}`))} — ett prov som inte kan falla bevisar ingenting`)
}

// ---- KOPPLINGSKONTROLL ------------------------------------------------------
// En kontrollprövad funktion som kringgås på anropsstället är död kod. Provet ovan säger
// att `analysera` KAN säga nej; det säger ingenting om att verkligheten går genom den.
const kalltext = readFileSync(fileURLToPath(import.meta.url), 'utf8')
check('Kopplingskontroll: den prövade funktionen anropas på den VERKLIGA korpusen',
  /const verkligt = analysera\(korpus, VOKABULAR\)/.test(kalltext),
  'provet prövar en funktion som inte används — då är den död kod och verkligheten går obevakad')
check('Kopplingskontroll: fynden VÄGS IN i domen',
  /verkligt\.fynd/.test(kalltext) && /fails\.push|check\(/.test(kalltext),
  'en analys vars resultat inte läses nedströms är en dekoration')

// ---- DEN VERKLIGA KORPUSEN --------------------------------------------------
let filer
try {
  filer = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'],
    { cwd: ROT, encoding: 'utf8' }).split('\n').filter(Boolean)
} catch { odombart('git ls-files misslyckades — korpusen går inte att avgränsa') }

const korpus = []
for (const f of filer) {
  const full = join(ROT, f)
  if (!existsSync(full)) continue
  let st
  try { st = statSync(full) } catch { continue }
  if (!st.isFile() || st.size > 4_000_000) continue
  let text
  try { text = readFileSync(full, 'utf8') } catch { continue }
  if (text.includes('\u0000')) continue        // binärt — inget att läsa rader ur
  korpus.push({ fil: f, text })
}
if (korpus.length === 0) odombart('tom korpus — en grön körning vore meningslös')

const verkligt = analysera(korpus, VOKABULAR)

// ANKARET: en tom luckmängd är INTE ett rent resultat. Sveps id-mönstret bort ur trädet,
// eller går regexen sönder, blir fyndlistan tom och körningen skulle se grön ut — samma
// fel som en tom kravmängd läst som frånvaro av krav.
if (verkligt.idn.length === 0) odombart('noll luckor funna i hela trädet — ankaret är obevisat, och en tom mängd är aldrig ett rent resultat')
check('Ankare: trädet bär luckor att döma om', verkligt.idn.length >= 10,
  `bara ${verkligt.idn.length} luckor funna — mönstret har sannolikt slutat träffa`)
check('Ankare: `§`-formen finns i den verkliga korpusen',
  verkligt.idn.some((id) => id.startsWith('§')),
  '`§26-GAP-1` finns i trädet — hittar vakten den inte har id-alfabetet tappat `§`, och just den formen har missats förut')

// ---- DOMEN ------------------------------------------------------------------
for (const typ of ['utan-rad', 'tyst-status', 'tvetydig-status', 'motstridig-status']) {
  const t = verkligt.fynd.filter((x) => x.typ === typ)
  check(`Ingen lucka är ${typ}`, t.length === 0,
    t.map((x) => `${x.text} [${x.var}]`).join(' · '))
}

// Beslutsloggen får aldrig vara någons rad-av-protokoll. Uteslutningen ovan är korrekt bara
// så länge loggen faktiskt BÄR luckor — annars utesluter vakten en tom fil och tror sig ha
// gjort ett val. Och en lucka vars enda hemvist vore loggen skulle vara ostängbar.
const logg = las(BERATTELSE)
check('Ankare: beslutsloggen bär luckor (uteslutningen är ett verkligt val)',
  new RegExp(ID_ALFABET).test(logg),
  'loggen nämner ingen lucka — då utesluter vakten ingenting och uteslutningen döljer att den inte gör något')
check('Beslutsloggen är ingen rad-av-protokoll',
  ![...verkligt.platser.values()].flat().some((p) => p.fil === BERATTELSE),
  'en berättande logg får aldrig bära status — dess rader är historiska och rör sig aldrig när luckan gör det')

// Överlämningen bär METODEN. Den får peka ut vokabulären men aldrig en enskild luckas läge.
check('Vokabulärfilen bär vokabulären men ingen luckstatus',
  !(verkligt.platser.size && [...verkligt.platser.values()].flat().some((p) => p.fil === VOKABULARFIL)),
  `${VOKABULARFIL} äger en rad-av-protokoll — då bär överlämningen status, och status driftar inom ett dygn`)

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
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} luckkontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} luckkontroller över ${verkligt.idn.length} luckor i ${korpus.length} filer (källhash ${kallhash})`)
console.log('\nLUCKORNAS LÄGE (härlett ur raderna, aldrig ur ett register):')
const perStatus = new Map()
for (const [id, p] of [...verkligt.platser].sort()) {
  const s = p.map((x) => x.status).find(Boolean) || 'OKÄND'
  if (!perStatus.has(s)) perStatus.set(s, [])
  perStatus.get(s).push(id)
}
for (const s of VOKABULAR) if (perStatus.has(s)) console.log(`  ${s.padEnd(17)} ${perStatus.get(s).length}  ${perStatus.get(s).join(' ')}`)
console.log('\nVAD DETTA INTE BEVISAR: att en lucka som står STÄNGD FAKTISKT är stängd. Vakten')
console.log('prövar att raderna säger samma sak om samma lucka och att ingen lucka saknar rad.')
console.log('Att stängningen HÖLL prövas av den vakt som äger sakfrågan — den här filen kan')
console.log('bara se till att ett påstående inte finns i två motstridiga versioner samtidigt.')
process.exit(0)
