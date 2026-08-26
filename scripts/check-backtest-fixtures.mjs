#!/usr/bin/env node
// S7/S8 UTKASTLÄGE: mekaniska kontroller av backtest-FIXTURERNA.
//
// VAD VAKTEN BEVISAR — uppräknat, aldrig bundet till instrumentet:
//   1. Kontraktsfilerna är de PINNADE bytesen (sha256 ur config/research-contract.v3.json).
//   2. Fixturerna bär de sjutton universella sektionernas nummer OCH HELA NAMN, samt
//      paketmodulens L-sektioner för Case A.
//   3. Kontrollraden lyder kontraktets lagar: varje fälts värde mot sitt enum ur
//      kontraktets kodblocksmall, KOMPLETT-lagen, `motstridig` blockerar KOMPLETT, och
//      VARJE `[OSÄKER]` i filen är registrerad i sektion 16.
//   4. Modulens skärpta KOMPLETT-krav prövas I SIN EGEN SEKTION, aldrig mot hela filen.
//   5. §26:s fällor prövas i BÅDA konsumerade filerna — `profile.ts` OCH `research.md`.
//      Researchen är den fil systemet faktiskt läser; en fälla som bara vaktas i profilen
//      kan brytas där systemet tittar.
//   6. Varje rad märkt MEKANISK är bunden till NAMNGIVNA kontroller som måste ha körts.
//
// VAD VAKTEN INTE BEVISAR: att systemet BETER SIG rätt. Grindarnas paketvillkor är
// prompttext. Varje beteendepåstående är EJ KÖRD och ODÖMBART. FÖRBEREDD ≠ GENOMFÖRD.
//
// ÄRLIG GRÄNS — handskrivna konstanter. `LOKALA_HANDLINGAR` och `STANDARDFRAGOR` bär
// ankare mot kontraktstexten. `ICKE_LOKAL_SCHEMA` och `MEKANISKA` gör det INTE: de är
// vaktens egna mängder och kan glida från verkligheten utan att något fäller.
// Mutationsmängden i skivans falsifiering är likaså FÖRFATTARENS EGEN; en oberoende
// mängd ger andra tal, och 15/17 säger något om de sjutton, inget om vakten.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

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

// STRÄNGMEDVETEN MASKERING. En textbaserad kommentarstripper raderade RIKTIG KOD: ett
// `//` inuti ett strängvärde tog med sig resten av raden, och ett `]` inuti en sträng
// stängde en array för fapentesräknaren. Här maskeras strängars INNEHÅLL med `x` och
// kommentarer med blanksteg, LÄNGDBEVARANDE — så index pekar fortfarande i originalet.
const maskera = (s) => {
  const ut = s.split('')
  let i = 0
  while (i < s.length) {
    const c = s[i]
    if (c === "'" || c === '"' || c === '`') {
      const q = c; i++
      while (i < s.length && s[i] !== q) { if (s[i] === '\\') { ut[i] = 'x'; i++ } if (i < s.length) { ut[i] = 'x'; i++ } }
      i++
    } else if (c === '/' && s[i + 1] === '/') {
      while (i < s.length && s[i] !== '\n') { ut[i] = ' '; i++ }
    } else if (c === '/' && s[i + 1] === '*') {
      while (i < s.length && !(s[i] === '*' && s[i + 1] === '/')) { ut[i] = ' '; i++ }
      if (i < s.length) { ut[i] = ' '; ut[i + 1] = ' '; i += 2 }
    } else i++
  }
  return ut.join('')
}

const namn = []
const passes = []
const fails = []
const check = (n, ok, detalj) => { namn.push(n); ok ? passes.push(n) : fails.push(`${n}: ${detalj}`) }

// IDENTITETSANKRAD nämnare. Ett antal binder bara kardinaliteten: en kontroll kunde bytas
// mot `check('TRIVIALT', 1===1)` och banderollen stod ordagrant kvar. Signaturen är en
// hash över de SORTERADE kontrollnamnen — då fäller både radering och utbyte.
const FORVANTAD_SIGNATUR = '76c9fc5ea7c83c55'

// ---- 0. PINNEN -------------------------------------------------------------
const pin = JSON.parse(las('config/research-contract.v3.json'))
check('Ankare: pinnfilen bär kärna + paketmoduler',
  !!pin.karna?.sha256 && Array.isArray(pin.paketmoduler) && pin.paketmoduler.length > 0, 'fel struktur')
const lokalPin = pin.paketmoduler.find((m) => m.pack === 'lokal-se')
if (!lokalPin) odombart('paketmodulen lokal-se saknas i pinnfilen')
for (const [n, post] of [['kärnan', pin.karna], ['paketmodulen lokal-se', lokalPin]]) {
  const faktisk = createHash('sha256').update(readFileSync(join(ROT, post.path))).digest('hex')
  check(`Pinnen håller för ${n}`, faktisk === post.sha256,
    `${post.path} har ${faktisk}, pinnen säger ${post.sha256} — fail-closed enligt färskhetslagen`)
}
const karnkontrakt = las(pin.karna.path)
const paketmodul = las(lokalPin.path)
const stack = las('skills/nortropic-stack/SKILL.md')

// ---- 1. SEKTIONERNAS NUMMER OCH HELA NAMN ----------------------------------
const sektionRader = [...karnkontrakt.matchAll(/^\| (\d+) \| \*\*(.+?)\*\* \|(.*)$/gm)]
check('Ankare: kontraktets sektionstabell kunde läsas', sektionRader.length > 0, 'inga rader')
const sektioner = sektionRader.map((m) => ({ nr: Number(m[1]), namn: m[2].trim(), krav: m[3] }))
check('Kontraktet bär sina sjutton universella sektioner',
  sektioner.length === 17 && sektioner.every((s, i) => s.nr === i + 1), 'numreringen är STABIL')

const modulRader = [...paketmodul.matchAll(/^\| \*\*(L\d+)\*\* \| \*\*(.+?)\*\* \|/gm)]
check('Ankare: paketmodulens sektionstabell kunde läsas', modulRader.length > 0, 'inga L-rader')
const modulSektioner = modulRader.map((m) => ({ id: m[1], namn: m[2].trim() }))
check('Paketmodulen bär fyra egna sektioner', modulSektioner.length === 4, `${modulSektioner.length}`)

// ---- 2. KONTROLLRADENS GRAMMATIK -------------------------------------------
const mall = /```\n(RESEARCH-CONTROL[\s\S]*?)```/.exec(karnkontrakt)
check('Ankare: kontrollradens mall kunde läsas', !!mall, 'kodblocket saknas')
if (!mall) odombart('utan mallen går lagarna inte att pröva')
const mallFalt = [...mall[1].matchAll(/(\w+)=<([^>]+)>/g)].map(([, n, spec]) => ({
  namn: n, enum: /^[\wÄÖÅäöå|]+$/.test(spec) && spec.includes('|') ? spec.split('|') : null, antal: spec === 'antal',
}))
check('Ankare: mallen bär fältspecifikationer', mallFalt.length >= 9, `${mallFalt.length}`)
const OBLIGATORISKA_JA = mallFalt.filter((f) => f.enum && f.enum.join('|') === 'ja|nej').map((f) => f.namn)
check('Ankare: ja/nej-fälten härledda ur mallen', OBLIGATORISKA_JA.length === 4, `[${OBLIGATORISKA_JA}]`)

// ---- 3. Site Quality Contract v2 -------------------------------------------
const v2Falt = [...stack.matchAll(/^\| `(\w+)` \| /gm)].map((m) => m[1])
check('Ankare: v2:s fälttabell kunde läsas', v2Falt.length >= 15, `${v2Falt.length}`)
const v1Rad = /\*\*Samtliga v1\.1\.0-fält står kvar oförändrade\*\* \(([^)]+)\)/.exec(stack.replace(/\n/g, ' '))
check('Ankare: v1-fältraden kunde läsas', !!v1Rad, 'saknas')
const v1Falt = v1Rad ? [...v1Rad[1].matchAll(/`(\w+)`/g)].map((m) => m[1]).filter((f) => f !== 'noindexCutover') : []
check('Ankare: v1-fälten kunde extraheras', v1Falt.length >= 8, `${v1Falt.length}`)

const slutnaMangden = /`ring nu` · `boka tid` · `platsförfrågan` · `offert` · `besök`/.test(flat(paketmodul))
  ? ['ring', 'boka', 'platsforfragan', 'offert', 'besok'] : []
check('Ankare: den slutna primärhandlingsmängden står kvar i paketmodulen', slutnaMangden.length === 5, 'ändrad')
const LOKALA_HANDLINGAR = ['ring', 'offert', 'platsforfragan', 'besok']
const ICKE_LOKAL_SCHEMA = ['Organization', 'Corporation', 'SoftwareApplication', 'WebSite', 'Service', 'Product']

// Standardfrågorna måste vara BESVARADE eller öppna — inte bara nämnda som ord.
const SVARSMARKOR = /\[OSÄKER\]|Besvarad|besvarad|inga finns|belagt NEJ/
const STANDARDFRAGOR = [
  { nyckel: 'omdömen', krav: /omdöme/i }, { nyckel: 'högupplösta original', krav: /högupplöst/i },
  { nyckel: 'domänönskemål', krav: /domän/i }, { nyckel: 'bokningskanal', krav: /bokningskanal|bokningsväg/i },
]
const s16Kontrakt = sektionRader.find((m) => m[1] === '16')
check('Ankare: kontraktets sektion 16-rad kunde läsas', !!s16Kontrakt, 'saknas')
for (const f of STANDARDFRAGOR) {
  check(`Ankare: standardfrågan "${f.nyckel}" står kvar i kontraktet`,
    !!s16Kontrakt && s16Kontrakt[0].includes(f.nyckel), 'kontraktets lista har ändrats')
}

// ---- Skopad, strängmedveten fältläsning ------------------------------------
const falt = (kalla, f) => {
  const m = new RegExp(`^ {2}${f}\\s*:\\s*`, 'm').exec(maskera(kalla))
  if (!m) return null
  const start = m.index + m[0].length
  const mask = maskera(kalla)
  const c = mask[start]
  if (c === '{' || c === '[') {
    const open = c, close = c === '{' ? '}' : ']'
    let djup = 0
    for (let i = start; i < mask.length; i++) {
      if (mask[i] === open) djup++
      else if (mask[i] === close) { djup--; if (djup === 0) return kalla.slice(start, i + 1) }
    }
    return null
  }
  return kalla.slice(start).split('\n')[0]
}
const sektion = (txt, n) => {
  const r = new RegExp(`^## ${n}\\.[\\s\\S]*?(?=^## ${n + 1}\\.|^# |\\Z)`, 'm').exec(txt)
  return r ? r[0] : null
}

const FIXTURER = [
  { id: 'A', dir: 'backtests/case-a-lokal', pack: 'lokal-se', modul: '1.0.0', harModul: true },
  { id: 'B', dir: 'backtests/case-b-saas', pack: 'core-only', modul: 'none', harModul: false },
]
const CASE_B_KRAV = ['B-T1', 'B-T2', 'B-T3', 'B-T4', 'B-T5', 'B-T6', 'B-T7a', 'B-T7b', 'B-P1',
  'B-P2a', 'B-P2b', 'B-P2c', 'B-P2d', 'B-P2e', 'B-GAP-1']
const CASE_A_KRAV = ['A-B1', 'A-B2', 'A-B3', 'A-B4', 'A-B5', 'A-B6', 'A-B7', 'A-GAP-1', 'A-GAP-2', 'A-GAP-3']
// MEKANISK binds till NAMNGIVNA kontroller. Ett id utan namngiven kontroll är fri text.
const MEKANISKA = new Map([
  ['A-B1', ['A-B1: paketet lokal-se är aktivt']], ['A-B2', ['Case A: skärpning: minst EN belagd ort i L1']],
  ['A-M1', ['Case A: bär paketmodulens fyra sektioner']], ['A-M2', ['Case A: skärpning: minst EN belagd ort i L1']],
  ['A-M3', ['Case A: `osakra` matchar antalet öppna [OSÄKER]-frågor i sektion 16']],
  ['A-M4', ['Case A: profile.ts bär samtliga v2-fält som TOPPNIVÅFÄLT']],
  ['A-M5', ['A-M5: seoLage är `lokal`', 'A-M5: schemaTyp är en LocalBusiness-subtyp']],
  ['A-M6', ['A-M6: KAP-LOKAL-SEO aktiveras']], ['A-M7', ['Case A: varje belaggspekare pekar på en sektion som finns']],
  ['A-M8', ['Case A: bär testklient: true']],
  ['B-T1', ['B-T1: paketlistan är TOM (core-only)']], ['B-T2', ['B-T2: research §5 bär INGEN belagd ort (positiv form saknas)']],
  ['B-T4', ['B-T4: primärhandlingen är `boka` — läst i sitt EGET fält']],
  ['B-T5', ['B-T5/B-T6: F-skatt och omdömen står i forbjudnaPastaenden — SKOPAT']],
  ['B-T6', ['B-T6: kvittolistan bär INGA lokala kvitton — SKOPAT till kvitton']],
  ['B-T7a', ['B-T7a: läckaget FINNS ännu i researchkontraktets universella ryggrad']],
  ['B-T7b', ['B-T7b: läckaget FINNS ännu i Site Quality Contract v2']],
  ['B-M1', ['Case B: bär INGA paketmodulsektioner — core-only']],
  ['B-M2', ['Case B: lag 1: KOMPLETT kräver att alla obligatoriska fält är `ja`']],
  ['B-M3', ['Case B: varje [OSÄKER] i filen är registrerad i sektion 16']],
  ['B-M4', ['Case B: profile.ts bär samtliga v2-fält som TOPPNIVÅFÄLT']],
  ['B-M5', ['B-T1: paketlistan är TOM (core-only)']], ['B-M6', ['B-M6: KAP-LOKAL-SEO aktiveras INTE — SKOPAT, citatagnostiskt']],
  ['B-M7', ['Case B: varje belaggspekare pekar på en sektion som finns']],
  ['B-M8', ['Case B: bär testklient: true']],
])

let ejKordaTotalt = 0

for (const fx of FIXTURER) {
  const research = las(`${fx.dir}/research.md`)
  const profilRatt = las(`${fx.dir}/profile.ts`)
  const forvantat = las(`${fx.dir}/FORVANTAT.md`)
  const P = (n) => `Case ${fx.id}: ${n}`

  check(P('märkt SYNTETISK i research'), /SYNTETISK/.test(research), 'saknas')
  check(P('märkt SYNTETISK i profile'), /SYNTETISK/.test(profilRatt), 'saknas')
  check(P('bär testklient: true'), /true/.test(falt(profilRatt, 'testklient') || ''), 'regel 14')

  const saknadeNr = sektioner.filter((s) => !new RegExp(`^## ${s.nr}\\.`, 'm').test(research))
  check(P('bär samtliga sjutton universella sektioner'), saknadeNr.length === 0, `saknar ${saknadeNr.map((s) => s.nr)}`)
  // HELA namnet, inte första token: "Organisation av Bananer" passerade en tokenjämförelse.
  const felNamn = sektioner.filter((s) => {
    const r = new RegExp(`^## ${s.nr}\\. (.+)$`, 'm').exec(research)
    return !r || !flat(r[1]).toLowerCase().includes(flat(s.namn).toLowerCase())
  })
  check(P('sektionsrubrikerna bär kontraktets HELA namn'), felNamn.length === 0,
    `avviker: ${felNamn.map((s) => `${s.nr} (väntade "${s.namn}")`).join(', ')}`)

  const radBlock = /RESEARCH-CONTROL v([\d.]+)([\s\S]*?)```/.exec(research)
  check(P('kontrollraden kunde parsas'), !!radBlock, 'saknas')
  if (radBlock) {
    check(P('kontrollraden pekar på kontraktsversion 3.x'), radBlock[1].startsWith('3.'), radBlock[1])
    const v = Object.fromEntries([...radBlock[2].matchAll(/(\w+)=([\wÄÖÅäöå.-]+)/g)].map((m) => [m[1], m[2]]))
    check(P('kontrollraden bär SAMTLIGA fält ur mallen'),
      mallFalt.every((f) => f.namn in v), `saknar ${mallFalt.filter((f) => !(f.namn in v)).map((f) => f.namn)}`)
    const enumFel = mallFalt.filter((f) => f.enum && f.namn in v && !f.enum.includes(v[f.namn]))
    check(P('varje kontrollradsfält har ett värde ur sitt enum'), enumFel.length === 0,
      enumFel.map((f) => `${f.namn}=${v[f.namn]}`).join(' · '))
    check(P('antalsfälten bär tal'),
      mallFalt.filter((f) => f.antal && f.namn in v).every((f) => /^\d+$/.test(v[f.namn])), 'ej tal')
    check(P(`kontrollradens pack är \`${fx.pack}\``), v.pack === fx.pack, `${v.pack}`)
    check(P(`kontrollradens pack_module är \`${fx.modul}\``), v.pack_module === fx.modul, `${v.pack_module}`)
    if (v.status === 'KOMPLETT') {
      check(P('lag 1: KOMPLETT kräver att alla obligatoriska fält är `ja`'),
        OBLIGATORISKA_JA.every((f) => v[f] === 'ja'), `${OBLIGATORISKA_JA.filter((f) => v[f] !== 'ja')}`)
      check(P('paketlag: `motstridig` blockerar KOMPLETT'),
        !(v.pack === 'lokal-se' && v.primarhandling === 'motstridig'), 'KOMPLETT med motstridig')
    }
    const s16 = sektion(research, 16)
    check(P('ankare: sektion 16 kunde avgränsas'), !!s16, 'saknas')
    if (s16) {
      const iS16 = [...s16.matchAll(/\[OSÄKER\]/g)].length
      const iFilen = [...research.matchAll(/\[OSÄKER\]/g)].length
      check(P('`osakra` matchar antalet öppna [OSÄKER] i sektion 16'), Number(v.osakra) === iS16,
        `raden säger ${v.osakra}, §16 bär ${iS16}`)
      // Kontraktet: §16 ska bära ALLT [OSÄKER]. En omärkt osäkerhet utanför §16 är just
      // den "ofullständiga research som ser komplett ut" kontraktet kallar dyrare än ingen.
      check(P('varje [OSÄKER] i filen är registrerad i sektion 16'), iFilen === iS16,
        `filen bär ${iFilen}, §16 bär ${iS16} — en oregistrerad osäkerhet når aldrig plannern`)
      const saknade = STANDARDFRAGOR.filter((f) => !f.krav.test(s16))
      check(P('sektion 16 bär kontraktets standardfrågor'), saknade.length === 0, `${saknade.map((f) => f.nyckel)}`)
      const obesvarade = STANDARDFRAGOR.filter((f) => {
        const rad = s16.split('\n').find((r) => f.krav.test(r))
        return !rad || !SVARSMARKOR.test(rad)
      })
      check(P('varje standardfråga är BESVARAD eller öppen — inte bara nämnd'), obesvarade.length === 0,
        `${obesvarade.map((f) => f.nyckel)} saknar svarsmarkör — en ordlista är inget svar`)
    }
  }

  const modulTraffar = modulSektioner.filter((L) => new RegExp(`^## ${L.id}\\.`, 'm').test(research))
  if (fx.harModul) {
    check(P('bär paketmodulens fyra sektioner'), modulTraffar.length === modulSektioner.length, 'saknas')
    // Modulens KOMPLETT-krav prövas I SIN EGEN SEKTION — en helfilsregex lät kraven
    // uppfyllas av ord som råkade stå i en annan sektion.
    const s1 = sektion(research, 1), s4 = sektion(research, 4), s7 = sektion(research, 7), s5 = sektion(research, 5)
    check(P('ankare: sektionerna 1, 4, 5 och 7 kunde avgränsas'), !!(s1 && s4 && s5 && s7), 'avgränsning misslyckades')
    check(P('skärpning: belagt telefonnummer I SEKTION 1'), !!s1 && /\d{2,4}-\d[\d\s]{5,}/.test(s1), 'saknas i §1')
    check(P('skärpning: postalCode NNN NN i sektion 1'), !!s1 && /\b\d{3} \d{2}\b/.test(s1), 'saknas i §1')
    check(P('skärpning: postalCode-formatet är KONSISTENT'),
      !/\b\d{5}\b/.test(research.replace(/\b\d{3} \d{2}\b/g, ' ')), 'femsiffrigt postnummer utan mellanslag')
    const l1 = /^## L1\.[\s\S]*?(?=^## L2\.)/m.exec(research)
    check(P('ankare: L1 kunde avgränsas'), !!l1, 'saknas')
    check(P('skärpning: minst EN belagd ort i L1'),
      !!l1 && /[Hh]uvudort:\s*\w/.test(l1[0]) && /belagt/i.test(l1[0]), 'ingen belagd huvudort')
    check(P('skärpning: sektion 5 bär belagda arbetsområden'), !!s5 && /[Bb]elagda arbetsområden/.test(s5), 'saknas')
    check(P('skärpning: primärhandlingen kandiderad I SEKTION 4'),
      !!s4 && new RegExp(`Primärhandlingskandidat: \`(${slutnaMangden.join('|')})\``).test(s4), 'saknas i §4')
    check(P('skärpning: fotobedömningssvaret är ifyllt I SEKTION 7'),
      !!s7 && /[Ff]otobedömning/.test(s7) && /(RÄCKER|räcker|behövs ny fotografering)/.test(s7), 'saknas i §7')
    check(P('skärpning: sektion 7 bär bild-URL:er eller "kräver original från kund"'),
      !!s7 && /(https?:\/\/|kräver original från kund)/.test(s7), 'kontraktets §7-krav ouppfyllt')
    const s15 = sektion(research, 15)
    check(P('paketet är BELAGT, inte antaget — I SEKTION 15'),
      !!s15 && /BELAGT, inte antaget/.test(s15), 'saknas i §15')
  } else {
    check(P('bär INGA paketmodulsektioner — core-only'), modulTraffar.length === 0, `${modulTraffar.map((L) => L.id)}`)
    check(P('bär ingen paketmodulrubrik alls'), !/^# PAKETMODUL/m.test(research), 'paketmodulrubrik')
    // §26:s fällor i den fil systemet FAKTISKT läser. En fälla som bara vaktas i
    // profile.ts kan brytas i researchen — och det är researchen plannern konsumerar.
    const s1 = sektion(research, 1), s5 = sektion(research, 5), s6 = sektion(research, 6), s15 = sektion(research, 15)
    check(P('ankare: sektionerna 1, 5, 6 och 15 kunde avgränsas'), !!(s1 && s5 && s6 && s15), 'avgränsning misslyckades')
    check('B-T2: research §5 bär INGEN belagd ort (positiv form saknas)',
      !!s5 && !/[Bb]elagda arbetsområden|[Aa]rbetsområde:\s*\w|[Hh]uvudort:/.test(s5), 'aktiveringssignal i §5')
    check('B-T2: frånvaron av arbetsområde är UTTRYCKLIGEN skriven i §5',
      !!s5 && /(inget arbetsområde|inga orter|ingen restid)/i.test(s5), 'tyst frånvaro')
    check('B-T1: research §1 beskriver adressen som kontor, inte upptagningsområde',
      !!s1 && !/upptagningsområde|[Aa]rbetsområde/.test(s1), 'lokal formulering i §1')
    check('B-T5/B-T6: research §6 bär INGA lokala kvitton som belagda',
      !!s6 && !/F-skatt registrerad|Google Företagsprofil finns|lokala citeringar:/i.test(s6),
      'lokalt kvitto belagt i negativkontrollens §6')
    check('B-T6: research §6 skriver ut frånvaron av omdömen och F-skatt',
      !!s6 && /[Uu]ttrycklig frånvaro/.test(s6), 'frånvaron är tyst')
    check('B-T2: research §15 aktiverar INTE KAP-LOKAL-SEO',
      !!s15 && /KAP-LOKAL-SEO\` aktiveras INTE|KAP-LOKAL-SEO aktiveras INTE/.test(s15), 'ortssignal i §15')
    // Närvaron av rätt mening räcker inte: den POSITIVA formen måste också saknas. En
    // mutation som lade in "Belagda arbetsområden: Malmö" i §15 lämnade meningen kvar
    // och passerade — §15 är kapacitetssignalernas hemvist och därmed en andra
    // aktiveringsyta för KAP-LOKAL-SEO.
    check('B-T2: research §15 bär INGEN positiv ortssignal',
      !!s15 && !/[Bb]elagda arbetsområden|[Hh]uvudort:|[Aa]rbetsområde:\s*\w/.test(s15),
      'kapacitetssignalerna bär en ortssignal — KAP-LOKAL-SEO:s aktiveringssignal finns då i researchen')
  }

  const profil = profilRatt
  const saknadeV2 = v2Falt.filter((f) => !falt(profil, f))
  check(P('profile.ts bär samtliga v2-fält som TOPPNIVÅFÄLT'), saknadeV2.length === 0, `saknar ${saknadeV2}`)
  check(P('profile.ts bär samtliga bevarade v1-fält'),
    v1Falt.every((f) => falt(profil, f)), `saknar ${v1Falt.filter((f) => !falt(profil, f))}`)
  const stateless = falt(profil, 'statelesshet')
  if (!stateless) odombart(`${fx.dir}: statelesshet kunde inte skopas — vallgraven går inte att pröva`)
  check(P('stateless-vakten är false — i sitt EGET fält'), /hallerTillstand:\s*false/.test(stateless), stateless.trim())
  check(P('interventionsbeslut har en belaggspekare'),
    /interventionsbeslut/.test(falt(profil, 'belaggspekare') || ''),
    'valet NY SAJT/FÖRBÄTTRA BEFINTLIG är obelagt — kontraktet kräver belägg PER FÄLTVÄRDE')
  const pekare = [...(falt(profil, 'belaggspekare') || '').matchAll(/research\.md §(\d+)/g)].map((m) => Number(m[1]))
  check(P('belaggspekare bär pekare'), pekare.length > 0, 'inga')
  check(P('varje belaggspekare pekar på en sektion som finns'),
    [...new Set(pekare)].every((n) => sektioner.some((s) => s.nr === n)),
    `${[...new Set(pekare)].filter((n) => !sektioner.some((s) => s.nr === n))}`)

  const krav = fx.id === 'A' ? CASE_A_KRAV : CASE_B_KRAV
  // Id:t måste stå som TABELLRAD, inte som prosaomnämnande.
  const saknadeKrav = krav.filter((id) => !new RegExp(`^\\| \`${id}\` \\|`, 'm').test(forvantat))
  check(P('FORVANTAT.md bär en TABELLRAD för varje frusen §26-post'), saknadeKrav.length === 0, `saknar ${saknadeKrav}`)
  check(P('FORVANTAT.md skiljer MEKANISK från EJ KÖRD'),
    /`MEKANISK`/.test(forvantat) && /`EJ KÖRD`/.test(forvantat), 'saknas')
  check(P('FORVANTAT.md säger ut att EJ KÖRD är ODÖMBART, aldrig grönt'),
    /ODÖMBART, aldrig grönt/.test(flat(forvantat)), 'saknas')
  check(P('FORVANTAT.md förbjuder befordringsanvändning'),
    /VALIDATING/.test(forvantat) && /(aldrig|ALDRIG)/.test(forvantat), 'saknas')
  const mekRader = [...forvantat.matchAll(/^\| `([\w-]+)` \|.*?`MEKANISK`/gm)].map((m) => m[1])
  check(P('varje MEKANISK-rad är bunden till NAMNGIVNA kontroller'),
    mekRader.every((id) => MEKANISKA.has(id)), `obundna: ${mekRader.filter((id) => !MEKANISKA.has(id))}`)
  ejKordaTotalt += [...forvantat.matchAll(/^\| `[\w-]+` \|[^\n]*?`EJ KÖRD`/gm)].length
}

// ---- Case B: fällorna i profile.ts -----------------------------------------
const bP = las('backtests/case-b-saas/profile.ts')
const bF = (n) => { const f = falt(bP, n); if (!f) odombart(`case-b: ${n} kunde inte skopas`); return f }
check('B-T1/B-T2: seoLage är `varumarke`', /'varumarke'/.test(bF('seoLage')), bF('seoLage').trim())
check('B-T1: paketlistan är TOM (core-only)', /^\[\s*\]/.test(bF('paket').trim()), bF('paket').trim())
// SAMTLIGA deklarerade typer måste vara icke-lokala: `.some()` släppte igenom
// schemaTyp: ['Organization', 'Plumber'] eftersom en av dem var tillåten.
const bTyper = [...bF('schemaTyp').matchAll(/'([^']+)'/g)].map((m) => m[1])
check('B-T1: SAMTLIGA deklarerade schematyper är icke-lokala',
  bTyper.length > 0 && bTyper.every((t) => ICKE_LOKAL_SCHEMA.includes(t)),
  `${bTyper.filter((t) => !ICKE_LOKAL_SCHEMA.includes(t))} står utanför den positiva mängden`)
check('B-T4: primärhandlingen är `boka` — läst i sitt EGET fält', /typ:\s*'boka'/.test(bF('primaraktion')), 'fel typ')
check('B-T4: primärhandlingen är INGEN av de lokala',
  !LOKALA_HANDLINGAR.some((h) => new RegExp(`typ:\\s*'${h}'`).test(bF('primaraktion'))), 'lokal primärhandling')
check('B-T4: etiketten är demobokning', /etikett:\s*'Boka demo'/.test(bF('primaraktion')), 'saknas')
check('B-T4: gate1Test prövar demokedjan', /demo-formulär/.test(bF('gate1Test')) && /Cal\.com/.test(bF('gate1Test')), 'fel kedja')
check('B-T5/B-T6: F-skatt och omdömen står i forbjudnaPastaenden — SKOPAT',
  /F-skatt/.test(bF('forbjudnaPastaenden')) && /(stjärnbetyg|omdömen)/i.test(bF('forbjudnaPastaenden')), 'saknas')
check('B-T6: kvittolistan bär INGA lokala kvitton — SKOPAT till kvitton',
  !/(omdöm|stjärn|betyg|F-skatt|citering|Företagsprofil)/i.test(bF('kvitton')), 'lokalt kvitto')
check('B-M6: KAP-LOKAL-SEO aktiveras INTE — SKOPAT, citatagnostiskt',
  !/['"]KAP-LOKAL-SEO['"]/.test(bF('kapaciteter')), 'aktiverad i core-only')
check('B-T4: forbjudnaPastaenden är icke-tom och namnger konkreta påståenden',
  (bF('forbjudnaPastaenden').match(/'/g) || []).length >= 8, 'urholkad lista — A-D7/B-T5:s facit försvinner')

// ---- B-T7: ankrat i KONTRAKTET, aldrig i filen som gör påståendet ----------
check('B-T7a: läckaget FINNS ännu i researchkontraktets universella ryggrad',
  /\| 12 \|[^|]*\|[^|]*lokala/.test(karnkontrakt) && /namn\+ort/.test(karnkontrakt) && /F-skatt/.test(karnkontrakt),
  'kontraktet är rättat — då ska B-T7a strykas ur FORVANTAT.md, inte stå kvar som levande fynd')
check('B-T7b: läckaget FINNS ännu i Site Quality Contract v2',
  /'ring' \| 'boka' \| 'platsforfragan' \| 'offert' \| 'besok'/.test(stack) && /i <ort>/.test(stack),
  'profilkontraktet är rättat — då ska B-T7b strykas')

// ---- Case A ----------------------------------------------------------------
const aP = las('backtests/case-a-lokal/profile.ts')
const aF = (n) => { const f = falt(aP, n); if (!f) odombart(`case-a: ${n} kunde inte skopas`); return f }
check('A-B1: paketet lokal-se är aktivt', /'lokal-se'/.test(aF('paket')), 'saknas')
check('A-M5: seoLage är `lokal`', /'lokal'/.test(aF('seoLage')), aF('seoLage').trim())
check('A-M5: schemaTyp är en LocalBusiness-subtyp',
  !ICKE_LOKAL_SCHEMA.some((t) => new RegExp(`'${t}'`).test(aF('schemaTyp'))), aF('schemaTyp').trim())
check('A-M6: KAP-LOKAL-SEO aktiveras', /KAP-LOKAL-SEO/.test(aF('kapaciteter')), 'saknas')
check('A-B7: ring-vägen är kontrakterad — SKOPAT till obligatoriskaResor',
  /namn:\s*'Ring vid akut läcka'/.test(aF('obligatoriskaResor')), 'ring-vägen saknas')
check('A-D8/A-D10: kvittolistan bär betyg med antal och plattform samt utbildningsattribution',
  /exakt 118/.test(aF('kvitton')) && /aldrig som utfall/.test(aF('kvitton')), 'defektfacit urholkat')
check('A-D7: forbjudnaPastaenden namnger dygnet-runt-jour',
  /jour/i.test(aF('forbjudnaPastaenden')), 'A-D7:s fällare finns inte i kontraktet')
const aFor = las('backtests/case-a-lokal/FORVANTAT.md')
const defekter = new Set([...aFor.matchAll(/^\| `A-D(\d+)` \|/gm)].map((m) => m[1]))
check('A: defektkatalogen bär tio DISTINKTA defekter i tabellform', defekter.size >= 10, `${defekter.size}`)
const TOMMA = /^(TBD|\?|—|-|)$/
const utanFallare = [...aFor.matchAll(/^\| `A-D\d+` \| [^|]+\| ([^|]*)\|/gm)].filter((m) => TOMMA.test(m[1].trim()))
check('A: varje planterad defekt namnger en VERKLIG fällare', utanFallare.length === 0,
  `${utanFallare.length} defekter med tom eller TBD-fällare`)

// ---- Luckorna --------------------------------------------------------------
const btReadme = las('backtests/README.md')
check('§26-GAP-1: de tredje negativkontrollerna redovisade som lucka',
  /§26-GAP-1/.test(btReadme) && /NO-BUILD/.test(btReadme) && /NOT_STARTED/.test(btReadme), 'tyst utelämnad')
check('A-GAP-3: kompatibilitetsvägen redovisad som lucka',
  /A-GAP-3/.test(aFor) && /compatibility route/.test(aFor), 'saknas')
check('B-GAP-2: fixturens egen förhandsbesvarade fällor redovisade som lucka',
  /B-GAP-2/.test(las('backtests/case-b-saas/FORVANTAT.md')),
  'att researchen skriver ut svaret på fyra av sex fällor är en verklig svaghet och får inte utelämnas tyst')
check('B-GAP-1: KAP-EXTERN-BOKNING:s DECLARED-stopp redovisat',
  /B-GAP-1/.test(las('backtests/case-b-saas/FORVANTAT.md')),
  'primärhandlingens kapacitet är DECLARED — en körning HARD-stoppar före B-P2a, och det står ingenstans')

// ---- Verdikt ---------------------------------------------------------------
const signatur = createHash('sha256').update([...namn].sort().join('\n')).digest('hex').slice(0, 16)
if (FORVANTAD_SIGNATUR !== 'SATTS_EFTER_FORSTA_KORNING' && signatur !== FORVANTAD_SIGNATUR) {
  console.error(`ODÖMBART: kontrollsignaturen är ${signatur}, förväntad ${FORVANTAD_SIGNATUR} — en kontroll har lagts till, tagits bort ELLER BYTTS UT. Ett antal binder bara kardinaliteten; identiteten binds här. Uppdatera pinnen medvetet i samma commit.`)
  process.exit(2)
}
for (const p of passes) console.log(`PASS: ${p}`)
if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`)
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${namn.length} fixturkontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${namn.length} FIXTURKONTROLLER (signatur ${signatur})`)
console.log(`\nVAD DETTA INTE BEVISAR: ${ejKordaTotalt} beteendepåståenden är EJ KÖRD och ODÖMBARA.`)
console.log('Backtesten är FÖRBEREDD, inte GENOMFÖRD — Case A och Case B har inte passerat.')
process.exit(0)
