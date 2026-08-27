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
import { execFileSync, spawnSync } from 'node:child_process'
import { las as lasFalt, jaNejOkant, foreV2, FUNNET, SAKNAS, SAKNAS_I_V1, ODOMBAR, V1_FALT } from './profil-las.mjs'
import { join } from 'node:path'

console.log('VAKT: check-backtest-fixtures.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig

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
const FORVANTAD_SIGNATUR = 'bc0947b914937c25'

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
    // B-GAP-2:s rättning ändrar vad §6 ska bära. FÖRR krävde vakten att researchen skrev
    // ut SLUTSATSEN ("uttrycklig frånvaro … kunden vill inte ha någon Google
    // Företagsprofil"). Då prövade Case B att systemet kan KOPIERA en slutsats, inte att
    // det kan DRA den. Nu krävs RÅA signaler, och slutsatsen ska saknas.
    const kvittolista = s6 ? s6.split(/\*\*Råa iakttagelser/)[0] : ''
    check('B-T5/B-T6: §6:s BELAGDA KVITTON bär inga lokala kvitton',
      !!s6 && !/F-skatt|Google Företagsprofil|lokala citeringar/i.test(kvittolista),
      'ett lokalt kvitto står i kvittolistan — i den RÅA iakttagelsedelen är det däremot tillåtet, för där är det en observation systemet ska väga')
    check('B-GAP-2: §6 bär RÅA iakttagelser, inte en dragen slutsats',
      !!s6 && /Råa iakttagelser/.test(s6) && !/[Uu]ttrycklig frånvaro/.test(s6),
      'researchen levererar slutsatsen i stället för signalen — då prövas kopiering, inte härledning')
    check('B-T3: en OANSPRÅKAD Google Företagsprofil FINNS i råmaterialet',
      !!s6 && /Google Företagsprofil: FINNS/.test(s6) && /oanspråkad/.test(s6),
      'utan en profil som faktiskt finns går fälla T3 inte att spänna — att avstå från något som inte finns är ingen prestation')
    check('B-T3: profilens frånvaro av VÄRDE är rå statistik, inte en bedömning',
      !!s6 && /0 samtal/.test(s6) && /0 vägbeskrivningar/.test(s6) && !/vill inte ha/.test(s6),
      'slutsatsen står kvar i researchen')
    check('B-T5: §6 namnger INTE F-skatt någonstans',
      !!s6 && !/F-skatt/i.test(s6),
      'ett system som skriver ut F-skatt som kvitto ska UPPFINNA det — står ordet i indata prövas ingenting')
    check('B-T6: recensionsytorna är räknade var för sig, inte sammanfattade',
      !!s6 && /Trustpilot/.test(s6) && /Capterra/.test(s6),
      'en sammanfattning ("inga omdömen finns") är en slutsats; en uppräkning per yta är en observation')
    // §4: avvägningen måste vara KVAR att göra. Fälla T4 kan inte spännas om researchen
    // redan har eliminerat motsignalen.
    const s4 = sektion(research, 4)
    check('B-T4: §4 namnger en MOTSTRIDIG signal i stället för att förneka den',
      !!s4 && /MOTSTRIDIGA SIGNALER FINNS/.test(s4) && !/Motstridiga signaler: ingen/.test(s4),
      '"motstridiga signaler: ingen" gör valet av primärhandling till en avskrift')
    check('B-T4: telefonens RÅA volym är HÖGRE än formulärets',
      !!s4 && /25 samtal mot formulärets 20/.test(s4),
      'är den vinnande kanalen också störst i råtal finns ingen avvägning kvar — och T4 (BOOK_DEMO får inte bli ring/offert) kan inte falla')
    // §7: en fordonsbild ska LIGGA i inventeringen och väljas bort.
    const s7 = sektion(research, 7)
    // Ordet "lastbil" NÅGONSTANS i §7 räcker inte: en mutation som strök bilden ur
    // INVENTERINGEN passerade på en kvarlämnad mening om rättighetsläget. Bilden måste
    // stå både i uppräkningen och bland hero-kandidaterna — det är där valet uppstår.
    const heroRad = s7 ? (/[Ll]iggande hero-kandidater[^\n]*(\n[^\n]+)*?\./.exec(s7) || [''])[0] : ''
    check('B-T5/B-T6: §7 bär en FORDONSBILD i BILDINVENTERINGEN',
      !!s7 && /bild på en lastbil/i.test(s7),
      'utan en lokal bildsignal i råmaterialet prövar bildvalet ingenting')
    check('B-T5/B-T6: fordonsbilden är en av HERO-KANDIDATERNA',
      /lastbil/i.test(heroRad),
      'ligger bilden i inventeringen men inte bland hero-kandidaterna uppstår inget val — och fällan spänns inte')
    check('B-T5/B-T6: hero-valet följer INTE av format eller upplösning',
      !!s7 && /följer inte av upplösning eller format/.test(s7),
      'är den lokala bilden sämst i format väljs den bort av teknik, inte av semantik — och fällan prövar teknikvalet i stället')
    check('B-T6: §7 påstår INTE att fordonsbilder saknas',
      !!s7 && !/[Ii]nga fordonsbilder/.test(s7), 'förnekelsen är kvar och gör valet till en avskrift')
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
  // VERSIONSVILLKORAT enligt bakåtkompatibilitetslagen. Kravet på v2-fälten gäller
  // profiler som PÅSTÅR sig vara v2. En v1.x-profil får aldrig fällas enbart på sin
  // stämpel — det är lagens första led, och en vakt som bröt mot det vore själv den
  // konsument lagen är skriven mot.
  const stampel = (falt(profil, 'profilKontraktVersion') || '').replace(/['",\s]/g, '')
  const gammal = foreV2(stampel)
  check(P('profile.ts bär en TOLKBAR kontraktsstämpel'), gammal !== null,
    `stämpeln "${stampel}" går inte att tolka — en otolkbar version får aldrig bortförklara ett saknat fält som legacy`)
  const saknadeV2 = v2Falt.filter((f) => !falt(profil, f))
  check(P('profile.ts bär samtliga v2-fält som TOPPNIVÅFÄLT (gäller v1.2.0+)'),
    gammal === true || saknadeV2.length === 0, `saknar ${saknadeV2}`)
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

// Sektionsnamnen EXTRAHERAS ur det skeppade researchkontraktet vid körning. En handskriven
// kopia här skulle bevisa kopian, och driva isär tyst när kontraktet ändras.
const KANON = [...karnkontrakt.matchAll(/^\| (\d+) \| \*\*([^*]+)\*\*/gm)].map((m) => [Number(m[1]), m[2].trim()])
if (KANON.length !== 17) odombart(`kontraktets sektionstabell gav ${KANON.length} rader, väntade 17 — namnen går inte att pröva`)

// SEKTIONSNAMNEN PRÖVAS FÖR SAMTLIGA fixturer, inte bara de nya. Att bara pröva de tre
// senaste vore att låta de äldsta stå okontrollerade just för att de är äldst.
// EN enda avvikelse är tillåten och den är NAMNGIVEN: `case-a-legacy` bär `§1. NAP`,
// eftersom fixturen är skriven mot researchkontrakt v3.0.0 där §1 hette så. Kärnan
// universaliserades i v3.1.0 och §1 heter nu "Organisation & typade kontaktvägar" —
// att tvinga legacyfixturen till det nya namnet vore att radera det den finns för att visa.
const NAMNUNDANTAG = new Map([['backtests/case-a-legacy/research.md', new Map([[1, 'NAP']])]])
for (const dir of ['backtests/case-a-lokal', 'backtests/case-b-saas', 'backtests/case-a-legacy']) {
  const R = las(`${dir}/research.md`)
  const undantag = NAMNUNDANTAG.get(`${dir}/research.md`) || new Map()
  const fel = KANON.filter(([n, namn]) => {
    const vantat = undantag.has(n) ? undantag.get(n) : namn
    return !new RegExp(`^## ${n}\\. ${vantat.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm').test(R)
  })
  check(`${dir.split('/').pop()}: sektionsnamnen följer kontraktet (undantag namngivna)`,
    fel.length === 0, `avviker: ${fel.map(([n, namn]) => `§${n} ska heta "${namn}"`).join(' · ')}`)
}
check('Namnundantaget är MOTIVERAT i legacyfixturens facit',
  /v3\.0\.0/.test(las('backtests/case-a-legacy/FORVANTAT.md')),
  'ett undantag utan skäl i facit är en tyst dispens, och nästa läsare kan inte skilja den från ett slarv')

// ---- §26-GAP-1: de tre verklighetsfixturerna ------------------------------
// §26: *"NO-BUILD / MIGRATION / STANDARD-zero-ceremony negative controls are used to prove
// the architecture does not assume every engagement is 'build a new local site.'"*
const VERKLIGHET = [
  { id: 'C', dir: 'backtests/case-c-no-build', beslut: 'ICKE-SAJT-ÅTGÄRD', byggs: false, krav: ['C-1', 'C-2', 'C-3', 'C-4', 'C-5', 'C-GAP-1'] },
  { id: 'D', dir: 'backtests/case-d-migration', beslut: 'FÖRBÄTTRA BEFINTLIG', byggs: false, krav: ['D-1', 'D-2', 'D-3', 'D-4', 'D-5', 'D-GAP-1', 'D-GAP-2'] },
  { id: 'E', dir: 'backtests/case-e-standard', beslut: 'NY SAJT', byggs: true, krav: ['E-1', 'E-2', 'E-3', 'E-4', 'E-5', 'E-6', 'E-7', 'E-8', 'E-9', 'E-GAP-1', 'E-GAP-2'] },
]
for (const v of VERKLIGHET) {
  const R = las(`${v.dir}/research.md`)
  const F = las(`${v.dir}/FORVANTAT.md`)
  const P = (t) => `Case ${v.id}: ${t}`
  const sekt = [...R.matchAll(/^## (\d+)\./gm)].map((m) => Number(m[1]))
  check(P('researchen bär samtliga 17 sektioner'),
    Array.from({ length: 17 }, (_, i) => i + 1).every((n) => sekt.includes(n)),
    `hittade ${sekt.length} — en fixtur i halv kontraktsform prövar en halv form`)
  // NUMMER RÄCKER INTE. En kontroll som bara räknar sektioner släppte igenom fixturer med
  // helt andra rubriker — §16 hette "Belägg och attribution" och §17 "Olösta okändheter",
  // medan kontraktet säger "Öppna frågor" och "Maskinläsbar kontrollrad". Formen såg hel
  // ut och var det inte. Namnen EXTRAHERAS ur det skeppade kontraktet, aldrig ur en kopia.
  const felNamn = KANON.filter(([n, namn]) =>
    !new RegExp(`^## ${n}\\. ${namn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm').test(R))
  check(P('och sektionernas NAMN följer kontraktet'), felNamn.length === 0,
    `avviker: ${felNamn.map(([n, namn]) => `§${n} ska heta "${namn}"`).join(' · ')}`)
  check(P('bär den maskinläsbara kontrollraden'), /RESEARCH-CONTROL v3\.\d+\.\d+ \| pack=/.test(R),
    'utan kontrollraden vet INPUT GATE inte vilket paket som gäller — och en grind som inte vet vilket paket som gäller kan inte tillämpa rätt skärpning')
  check(P('är märkt SYNTETISK'), /SYNTETISK FIXTUR/.test(R), 'omärkt fixtur kan förväxlas med kundevidens')
  check(P('bär Läge-raden'), /^Läge:\s*obemannat$/m.test(R), 'utan läge kan lägesgrinden inte köras')

  // DEN VIKTIGASTE KONTROLLEN: researchen får INTE skriva ut interventionsbeslutet.
  // Gör den det prövar fixturen att systemet kan KOPIERA en slutsats (B-GAP-2:s fel).
  check(P('researchen skriver INTE ut interventionsbeslutet'),
    !new RegExp(`interventionsbeslut\\s*=|interventionsbeslut:\\s*\`?${v.beslut}`, 'i').test(R) &&
    !new RegExp(`belägget för[^.]*${v.beslut}`, 'i').test(R),
    'researchen levererar slutsatsen — då prövas kopiering, inte härledning (samma fel som B-GAP-2)')
  check(P('facit bär härledningstabellen rå signal → slutsats → fel'),
    /Rå signal i researchen \| Slutsats som ska dras \| Vad ett fel ser ut som/.test(F),
    'utan "vad ett fel ser ut som" är facit en förhoppning, inte ett prov')
  const harledRader = F.split('\n').filter((r) => /^\| §\d/.test(r))
  check(P('och den bär minst fem härledningsrader'), harledRader.length >= 5,
    `${harledRader.length} rader — färre gör slutsatsen härledbar ur en enda signal, och då prövas ingen avvägning`)
  check(P(`facit namnger förväntat interventionsbeslut ${v.beslut}`),
    new RegExp(`Förväntat \`?interventionsbeslut\`?: \`${v.beslut}\``).test(F) ||
    new RegExp(`interventionsbeslut\` är \`${v.beslut}\``).test(F),
    'förväntan måste stå FÖRE körningen, annars är utfallet alltid det förväntade')
  for (const id of v.krav) check(P(`facit namnger ${id}`), new RegExp(`\`${id}\``).test(F), 'saknas')

  // C och D BYGGS ALDRIG — en profil skulle påstå att ett bygge planeras.
  const harProfil = existsSync(join(ROT, `${v.dir}/profile.ts`))
  check(P(`profile.ts ${v.byggs ? 'FINNS' : 'saknas — och det är avsiktligt'}`), harProfil === v.byggs,
    v.byggs ? 'en STANDARD-fixtur som byggs behöver sitt kalibreringsfacit'
      : 'profile.ts är kalibreringsfacit för en sajt som BYGGS — en NO-BUILD/MIGRATION-fixtur med profil påstår att ett bygge planeras')
  if (!v.byggs) check(P('facit säger UT varför profile.ts saknas'),
    /INGEN profile\.ts/.test(F), 'en tyst frånvaro läses som ett slarv i stället för som ett prov')
}

// Case E:s nollceremoni prövas mot PROFILEN, inte bara mot facit.
const eP = las('backtests/case-e-standard/profile.ts')
check('E-3: Case E bär NOLL juridikflaggor', /juridikflaggor: \[\] as string\[\]/.test(eP),
  'en juridikflagga i den mest ordinära Ring 1-kunden är ett FYND, inte en försiktighetsåtgärd')
check('E-6: Case E:s kvalitetsnivå är STANDARD', /niva: 'STANDARD'/.test(eP),
  'en uppskruvad nivå utan att researchen begärt den är precis den ceremoni §20 förbjuder')
check('E-7: Case E bär INGET noindexCutover (undantagssignal)', !/noindexCutover/.test(eP),
  'ett undantagsfält i en nollceremonifixtur gör den till ett undantagsfall')
check('E-1: Case E:s interventionsbeslut är NY SAJT', /interventionsbeslut: 'NY SAJT'/.test(eP), 'fel beslut')
check('Case E: profilen är HÄRLEDD ur sin egen research, inte kopierad',
  !/Plumber|stambyte|Säker Vatten|Ekbergs/.test(eP),
  'en profil som bär en ANNAN fixturs specifika innehåll är en kopia, och då prövar den den andra fixturen')

// ---- CASE A-LEGACY: kompatibilitetsvägen (A-GAP-3) ------------------------
// §26 kräver TVÅ vägar för Case A. Detta är den första: ett kundrepo byggt före Site
// Quality Contract v2. Det svåra ledet är att en FRÅNVARO är okänd, aldrig ett nej.
const LEG = 'backtests/case-a-legacy'
const legP = las(`${LEG}/profile.ts`)
const legR = las(`${LEG}/research.md`)
const legF = las(`${LEG}/FORVANTAT.md`)
const legStampel = (falt(legP, 'profilKontraktVersion') || '').replace(/['",\s]/g, '')
check('AL-1: legacyprofilen bär stämpeln v1.1.0', legStampel === 'v1.1.0',
  `stämpeln är "${legStampel}" — fixturens hela uppgift är att vara en v1-profil`)
check('AL-9: doctor #5:s semver-vakt är UPPFYLLD (samma MAJOR, 1.1.0 ≤ 1.3.0)',
  foreV2(legStampel) === true,
  'stämpeln tolkas inte som en pre-v2-profil — då prövar fixturen ingenting')

// AL-2: samtliga obligatoriska v1-fält finns.
const saknadeV1 = V1_FALT.filter((f) => f !== 'noindexCutover' && !falt(legP, f))
check('AL-2: samtliga obligatoriska v1.1.0-fält finns och är oförändrade', saknadeV1.length === 0,
  `saknar ${saknadeV1} — en trasig v1-profil prövar bakåtkompatibilitet lika lite som en v2-profil gör`)

// AL-3: v2-fälten SAKNAS — det är poängen, inte ett slarv.
const v2IFixturen = v2Falt.filter((f) => !V1_FALT.includes(f) && falt(legP, f))
check('AL-3: v2-fältgrupperna SAKNAS i legacyprofilen', v2IFixturen.length === 0,
  `${v2IFixturen} finns — en legacyfixtur med v2-fält är ingen legacyfixtur`)
const saknadeV2Leg = v2Falt.filter((f) => !V1_FALT.includes(f) && !falt(legP, f))
check('AL-3b: och de är MINST tio till antalet (ankaret bevisat)', saknadeV2Leg.length >= 10,
  `bara ${saknadeV2Leg.length} v2-fält saknas — hittar detektorn inget att sakna prövar AL-4 ingenting`)

// AL-4/AL-5: LAGENS ANDRA LED. Beteendeprov mot varje faktiskt saknat v2-fält.
const v1obj = { profilKontraktVersion: 'v1.1.0', primaraktion: {}, gate1Test: 'x', kvitton: [],
  schemaTyp: [], seoLage: 'lokal', juridikflaggor: [], rostregister: {}, branschAntislop: [], motionNiva: 'subtil' }
const felaktiga = saknadeV2Leg.filter((f) => lasFalt(v1obj, f, 'v1.1.0').status !== SAKNAS_I_V1)
check('AL-4: VARJE saknat v2-fält läses som SAKNAS_I_V1', felaktiga.length === 0,
  `${felaktiga} lästes som något annat — en frånvaro som blir ett svar uppfinner ett påstående kunden aldrig gjort`)
const somNej = saknadeV2Leg.filter((f) => jaNejOkant(lasFalt(v1obj, f, 'v1.1.0')) !== 'OKÄNT')
check('AL-5: och jaNejOkant ger OKÄNT för vart och ett — aldrig false', somNej.length === 0,
  `${somNej} gav ett booleskt svar. false är här det GYNNSAMMA svaret, så felet ser ut som ett godkännande`)
// Det farligaste enskilda fältet, utpekat: en frånvaro tolkad som "håller inget tillstånd".
check('AL-5b: statelesshet specifikt ger OKÄNT, inte false',
  jaNejOkant(lasFalt(v1obj, 'statelesshet', 'v1.1.0')) === 'OKÄNT' &&
  lasFalt(v1obj, 'statelesshet', 'v1.1.0').status === SAKNAS_I_V1,
  '"kunden håller inget tillstånd" låter som ett godkännande — det är därför just det här fältet måste vara OKÄNT')

// AL-6/AL-7: SAKNAS är inte SAKNAS_I_V1, och valfritt är inte trasigt.
const utanGate = { ...v1obj }
delete utanGate.gate1Test
check('AL-6: saknat OBLIGATORISKT v1-fält ger SAKNAS, aldrig SAKNAS_I_V1',
  lasFalt(utanGate, 'gate1Test', 'v1.1.0').status === SAKNAS,
  'en trasig profil bortförklarad som gammal är en tyst regression')
check('AL-7: saknat VALFRITT v1-fält (noindexCutover) är ett giltigt tillstånd',
  lasFalt(v1obj, 'noindexCutover', 'v1.1.0').status === SAKNAS_I_V1,
  'ett valfritt fält som saknas är inget fel')

// AL-8: en otolkbar stämpel får aldrig bli en ursäkt.
for (const dalig of ['', 'v1', '1.1.0', 'senaste', 'v2.0.0', undefined]) {
  check(`AL-8: otolkbar/annan-MAJOR stämpel ${JSON.stringify(dalig)} ger ODÖMBAR`,
    lasFalt(v1obj, 'statelesshet', dalig).status === ODOMBAR,
    'en version som inte går att tolka skulle annars bortförklara VARJE saknat fält som legacy')
}
check('AL-4b: ett FUNNET fält läses som FUNNET med sitt värde',
  lasFalt({ seoLage: 'lokal' }, 'seoLage', 'v1.1.0').status === FUNNET &&
  lasFalt({ seoLage: 'lokal' }, 'seoLage', 'v1.1.0').varde === 'lokal',
  'läsaren måste kunna svara ja också — annars är den bara en nekmaskin')
check('AL-5c: jaNejOkant ger true/false för FUNNA booleska värden',
  jaNejOkant(lasFalt({ x: true }, 'x', 'v1.1.0')) === true &&
  jaNejOkant(lasFalt({ x: false }, 'x', 'v1.1.0')) === false,
  'ett funnet false är ett riktigt nej och ska INTE bli OKÄNT — annars blir läsaren värdelös')
check('AL-4c: läsaren kraschar aldrig på skräp',
  [null, undefined, 0, 'x', []].every((x) => typeof lasFalt(x, 'seoLage', 'v1.1.0').status === 'string'),
  'en läsare som kastar är odömbar, inte sträng')

// Fixturens egna dokument
check('AL: legacyresearchen är skriven mot v3.0.0, inte v3.1.0',
  /researchkontrakt v3\.0\.0/.test(legR),
  'är den skriven mot nuvarande kontrakt prövas ingen kompatibilitet')
check('AL: legacyfixturen är märkt SYNTETISK', /SYNTETISK FIXTUR/.test(legR), 'omärkt fixtur')
check('AL: legacyfixturen är samma KUND som case-a-lokal',
  /Ekbergs Rör AB/.test(legR) && /Ekbergs Rör AB/.test(las('backtests/case-a-lokal/research.md')),
  'olika kunder gör det omöjligt att veta om ett utfall beror på versionen eller på datan')
check('AL: profilen bär testklient: true (regel 14)', /testklient:\s*true/.test(legP), 'saknas')
for (const id of ['AL-4', 'AL-5', 'AL-11', 'AL-12', 'AL-GAP-1', 'AL-GAP-2', 'AL-GAP-3'])
  check(`AL: FORVANTAT namnger ${id}`, new RegExp(`\`${id}\``).test(legF), 'saknas i facit')
check('AL: FORVANTAT säger ut att AL-11/AL-12 är ODÖMBARA, aldrig gröna',
  /ODÖMBARA, aldrig gröna/.test(legF),
  'de två som skulle bevisa drift är EJ KÖRDA — utan den meningen läses en grön körning som ett bevis')
// Beskrivningen var FEL och är rättad: konsumenterna BÄR lagen som prompttext. Kravet
// vänds till att facit redovisar rättelsen OCH den kvarvarande halvan.
check('AL-GAP-2: FORVANTAT redovisar den RÄTTADE beskrivningen',
  /RÄTTAD BESKRIVNING/.test(legF) && /bär regeln som prompttext/.test(legF),
  'min ursprungliga formulering "ingen konsument använder läsaren" var FEL — lagen står i båda grindworkflowen, i qa-launcher och i två skills')
check('AL-GAP-2: och den KVARVARANDE halvan är namngiven',
  /ingen kodkonsument går genom `profil-las\.mjs`/.test(legF) && /kräver en körning/.test(legF),
  'att en AGENT följer en regel i sin prompt går inte att pröva mekaniskt — att tiga om det gör en halv stängning till en hel')

// ---- BETEENDEPROV: backtestköraren mot de riktiga fixturerna ---------------
// Formkontroller ovan säger inget om beteende. Här KÖRS `kor-backtest.mjs` och dess
// utfall prövas. Ett utfall som bara SKRIVS UT är ingen kontroll — det ska hävdas.
const kb = spawnSync(process.execPath, [join(ROT, 'scripts/kor-backtest.mjs')], { cwd: ROT, encoding: 'utf8' })
const kbUt = `${kb.stdout || ''}${kb.stderr || ''}`
if (kb.status === null) odombart('kor-backtest.mjs kunde inte startas — beteendet går inte att pröva')
if (kb.status === 2) odombart(`kor-backtest.mjs blev ODÖMBAR: ${kbUt.split('\n').find((r) => r.startsWith('ODÖMBART')) || ''}`)
const caseA = /── CASE A[\s\S]*?(?=── CASE B)/.exec(kbUt)
const caseB = /── CASE B[\s\S]*?(?=\nVAD DEN)/.exec(kbUt)
check('KÖR: backtestköraren producerade båda fallen', !!caseA && !!caseB,
  'ett saknat fall får aldrig läsas som ett passerat fall')
if (caseA && caseB) {
  // B-GAP-1 ÄR STÄNGD GENOM ALTERNATIV (a): capabilityn är byggd. Case B stoppar därför
  // INTE längre här. Kravet vänds i stället till att capabilityn faktiskt är körbar — och
  // att grindens förmåga att fälla bevisas separat, eftersom inget fall längre fäller den.
  check('KÖR/B-GAP-1: Case B kräver KAP-EXTERN-BOKNING och den är BUILT',
    /KAP-EXTERN-BOKNING\(BUILT\)/.test(caseB[0]),
    'antingen har capabilityns status ändrats tillbaka eller så har kravet försvunnit ur §15 — båda gör Case B till ett annat prov')
  check('KÖR/B-GAP-1: Case B passerar nu beslutslagret',
    /UTFALL: passerar beslutslagret/.test(caseB[0]),
    'stoppet skulle vara borta sedan capabilityn byggdes — står det kvar har något annat börjat fälla')
  check('KÖR/B-T2: Case B avstår UTTRYCKLIGEN från KAP-LOKAL-SEO',
    /uttryckligen avstådda: KAP-LOKAL-SEO/.test(caseB[0]),
    'en negativkontroll som inte KAN aktivera lokal-SEO prövar ingenting — avståendet måste vara ett val')
  check('KÖR: Case A passerar beslutslagret',
    /UTFALL: passerar beslutslagret/.test(caseA[0]),
    'stoppar även den lokala fixturen är grinden för sträng och skiljer inte fallen åt')
  check('KÖR: Case A kräver de fem lokala kapaciteterna',
    ['KAP-LOKAL-SEO', 'KAP-SCHEMA', 'KAP-KVITTON', 'KAP-BILD', 'KAP-PRIMARHANDLING'].every((k) => caseA[0].includes(k)),
    'kravmängden har krympt — då blir Case A:s passage billigare än den ska vara')
  // POSITIVT KONTROLLPROV: skiljer körningen ÖVER HUVUD TAGET på fallen? Två identiska
  // utfall vore ett tecken på att grinden inte läser fixturen.
  // AL-10: kompatibilitetsvägen körs och dess utfall HÄVDAS. Samma kund, äldre kontrakt.
  const caseAL = /── CASE AL[\s\S]*?(?=── CASE B)/.exec(kbUt)
  // §26-GAP-1: de tre verklighetsfixturernas UTFALL hävdas, inte bara skrivs ut.
  for (const [id, beslut, vantat, ord] of [
    ['C', 'ICKE-SAJT-ÅTGÄRD', 'ROUTE', 'ROUTAD — lanen avslutas korrekt utan bygge'],
    ['D', 'FÖRBÄTTRA BEFINTLIG', 'ROUTE', 'ROUTAD — lanen avslutas korrekt utan bygge'],
    ['E', 'NY SAJT', 'CONTINUE', 'passerar beslutslagret'],
  ]) {
    const blk = new RegExp(`── CASE ${id}:[\\s\\S]*?(?=── CASE |\\nAL-10)`).exec(kbUt)
    check(`§26-GAP-1: Case ${id} körs av backtestköraren`, !!blk, 'fixturen körs inte — då prövar den ingenting')
    if (!blk) continue
    check(`§26-GAP-1: Case ${id} ger ${vantat} på ${beslut}`,
      new RegExp(`FÖRVÄNTAT: ${beslut} ⇒ ${vantat} · UTFALL: ${vantat} — som förväntat`).test(blk[0]),
      `taxonomin gör inte det förväntade med ${beslut} — och förväntan stod skriven före körningen`)
    check(`§26-GAP-1: Case ${id}:s utfallsrad säger ${vantat === 'ROUTE' ? 'ROUTAD' : 'passerar'}`,
      blk[0].includes(ord),
      'ett ROUTE som rapporteras som "passerar beslutslagret" är ett falskt påstående — lanen avslutas, den fortsätter inte')
    if (id !== 'E') check(`§26-GAP-1: Case ${id} kräver INGET ägarsvar`,
      /ägarkrävande händelser: 0/.test(blk[0]),
      'ROUTE är ett korrekt workflow-utfall utan ägarberoende — kräver det ägarens hand har det blivit ett HARD_STOP i förklädnad')
  }
  const eBlk = /── CASE E:[\s\S]*?(?=── CASE |\nAL-10)/.exec(kbUt)
  check('E-2: STANDARD-leveransen har NOLL ägarkrävande händelser',
    !!eBlk && /ägarkrävande händelser: 0 \(STANDARD-nollceremoni kräver noll\)/.test(eBlk[0]),
    'varje ägarfråga i den mest ordinära Ring 1-kunden är ett FYND, inte en försiktighetsåtgärd — §20')
  // KONTROLLPROV: skiljer köraren på ROUTE och CONTINUE över huvud taget?
  check('§26-GAP-1: köraren skiljer ROUTE från CONTINUE (kontrollprov)',
    /UTFALL: ROUTAD/.test(kbUt) && /UTFALL: passerar beslutslagret/.test(kbUt),
    'får alla fall samma utfallsrad prövar rapporten ingenting')

  check('AL-10: kompatibilitetsvägen körs av backtestköraren', !!caseAL,
    'utan den körs bara en av §26:s TVÅ vägar för Case A')
  check('AL-10: v1.1.0-profilen når SAMMA utfall som v1.2.0-profilen',
    /AL-10 KOMPATIBILITETSVÄGEN: v1\.1\.0-profilen når SAMMA utfall/.test(kbUt),
    'samma kund, olika utfall, och den enda skillnaden är kontraktsversionen — det ÄR bruten bakåtkompatibilitet')
  // POSITIVT KONTROLLPROV på jämförelsen själv. Att rapporten SÄGER "SAMMA utfall" bevisar
  // ingenting om jämförelsen alltid säger det — den mutationen överlevde första versionen
  // av den här kontrollen, som prövade meningen i stället för mekanismen.
  const sjalvprov = spawnSync(process.execPath, [join(ROT, 'scripts/kor-backtest.mjs'), '--sjalvprov'], { cwd: ROT, encoding: 'utf8' })
  // B-T7:s KVARVARANDE HALVA. Kontraktet universaliserades i v3.1.0, men producenten —
  // plannerns INPUT GATE — krävde fortfarande `≥1 ort` och `telefon` av VARJE kund, så en
  // icke-lokal kund stoppades vid nod 2 oavsett hur universellt kontraktet var formulerat.
  // Grinden är paketvillkorad sedan 2026-08-27 och utfallet prövas här.
  check('B-T7b: Case B (core-only, ingen ort) PASSERAR INPUT GATE',
    !!caseB && /1b\. INPUT GATE.*PASSERAR — pack=core-only/.test(caseB[0]),
    'en icke-lokal kund stoppas fortfarande vid grinden — kontraktet är då universellt men producenten inte')
  check('B-T7b: och Case A (lokal-se) passerar på SIN skärpning',
    !!caseA && /1b\. INPUT GATE.*PASSERAR — pack=lokal-se/.test(caseA[0]),
    'skärpningen får inte ha försvunnit i universaliseringen — då vore lättnaden generell')
  for (const [namn, frag] of [
    ['core-only UTAN ort passerar', 'core-only UTAN ort PASSERAR'],
    ['lokal-se UTAN ort stoppar', 'lokal-se UTAN belagd ort STOPPAR'],
    ['core-only UTAN telefon passerar', 'core-only UTAN telefon PASSERAR'],
    ['lokal-se UTAN telefon stoppar', 'lokal-se UTAN telefon STOPPAR'],
    ['okänt pack ger OKLASSIFICERAT', 'okänt pack ger OKLASSIFICERAT'],
    ['ofullständig research stoppar', 'status=OFULLSTÄNDIG stoppar'],
  ]) check(`B-T7b: INPUT GATE:s kontrollprov — ${namn}`,
    new RegExp(`PASS: självprov — INPUT GATE: ${frag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(sjalvprov.stdout || ''),
    'grinden bevisar inte att skärpningen biter OCH att kärnan är fri — utan båda är "passerar" en tom mening')

  check('§26-GAP-1: förväntanskontrollen klarar sitt POSITIVA kontrollprov',
    /förväntanskontrollen FLAGGAR när utfallet avviker/.test(sjalvprov.stdout || '') &&
    sjalvprov.status === 0,
    'en kontroll som inte kan flagga en avvikelse skriver "som förväntat" lika glatt när utfallet är ett annat')
  check('§26-GAP-1: och den ANROPAS på anropsstället',
    /const avvikelse = motsvarar\(f\.vantatUtfall, b\.decision\)/.test(las('scripts/kor-backtest.mjs')) ||
    /let avvikelse = motsvarar\(f\.vantatUtfall, b\.decision\)/.test(las('scripts/kor-backtest.mjs')),
    'en kontrollprövad funktion som kringgås är död kod')
  check('AL-10: jämförelsen klarar sitt POSITIVA kontrollprov (kan säga NEJ)',
    sjalvprov.status === 0 && /kan skilja likvärdigt från olikvärdigt/.test(sjalvprov.stdout || ''),
    'en jämförelse som inte kan säga NEJ kan inte heller säga JA — "SAMMA utfall" vore då en tom mening')
  // ...och att den prövade funktionen faktiskt ANROPAS. Att kontrollprova en funktion som
  // kringgås på anropsstället är att pröva död kod — `const lika = true` överlevde
  // kontrollprovet ovan, eftersom provet nådde funktionen men inte anropet.
  const kbKalla = las('scripts/kor-backtest.mjs')
  check('AL-10: och jämförelsen ANROPAS på anropsstället',
    /const lika = likvardiga\(rA, rAL\)/.test(kbKalla),
    'en kontrollprövad funktion som kringgås är död kod — provet prövar då ingenting som körs')
  check('AL-12: rapporten skiljer BESLUTSutfall från BYGGT resultat',
    /jämför BESLUTSUTFALL, inte byggda sajter/.test(kbUt),
    'utan den meningen läses två lika beslut som bevis för två lika sajter')
  check('KÖR: rapportens etikett på kapacitetsgrinden är inte längre "EJ i kedjan"',
    !/EJ i kedjan/.test(kbUt),
    'KOR-GAP-1 är stängd — en etikett som säger att grinden saknas i kedjan är nu ett falskt påstående i utdata')
  check('KÖR: de två fallen läser OLIKA kravmängder (kontrollprov)',
    /KAP-LOKAL-SEO\(VALIDATING\)/.test(caseA[0]) && !/KAP-LOKAL-SEO\(/.test(caseB[0]) &&
    /KAP-EXTERN-BOKNING/.test(caseB[0]) && !/KAP-EXTERN-BOKNING/.test(caseA[0]),
    'sedan capabilityn byggdes får alla tre fall samma VERDIKT, så kontrollprovet måste läsa det som LÄSTES i stället för det som beslutades — annars passerar det av sig självt')
  check('KÖR: kapacitetsgrinden bevisar att den fortfarande KAN fälla',
    /kapacitetsgrinden kan fortfarande fälla/.test(sjalvprov.stdout || ''),
    'inget fall fäller grinden längre — en grind som inte fäller på något går inte att skilja från en grind som slutat fungera')
}
// KOR-GAP-1 är STÄNGD: grinden finns nu i kedjan. Kravet på brasklapp försvinner INTE
// med den — det byter innehåll. Kedjans grind läser katalogen via en AGENT medan den här
// körningen läser den från disk, så en felrapporterande agent passerar kedjans grind men
// inte den här. Att sluta säga det vore att låta en stängd lucka radera en kvarvarande.
check('KÖR: rapporten skiljer kedjans grind från körarens',
  /KOR-GAP-1 stängd/.test(kbUt) && /MODELLBEROENDE I SIN INDATA/.test(kbUt),
  'utan den skillnaden läses en grön körning som bevis för att kedjan är immun mot en felrapporterande agent')

// ---- B-GAP-2/B-GAP-1: slutsatserna ska stå i FORVANTAT, inte i researchen --
// Flyttades slutsatserna bara BORT ur researchen utan att landa någonstans vore de
// borttappade, inte flyttade — och Case B skulle sakna facit helt.
const bFv = las('backtests/case-b-saas/FORVANTAT.md')
const harledning = /## `B-GAP-2` — ÅTGÄRDAT[\s\S]*?(?=^## )/m.exec(bFv)
check('B-GAP-2: härledningstabellen finns i FORVANTAT', !!harledning,
  'slutsatserna är borttagna ur researchen utan att landa i facit — då är de borttappade')
if (harledning) {
  const rader = harledning[0].split('\n').filter((r) => /^\| §/.test(r))
  check('B-GAP-2: varje rå signal har en slutsats OCH ett felutseende', rader.length === 5,
    `${rader.length} rader — fem råa signaler infördes i researchen (GFP, telefonvolym, upphandlingskrav, recensionsytor, lastbilsbild)`)
  const utanFalla = rader.filter((r) => !/B-T[1-6]/.test(r))
  check('B-GAP-2: varje slutsats pekar på den fälla den gör spännbar', utanFalla.length === 0,
    `${utanFalla.length} rader utan fällhänvisning — en slutsats utan fälla är prosa, inte facit`)
  for (const t of ['B-T3', 'B-T4', 'B-T5', 'B-T6']) {
    check(`B-GAP-2: fälla ${t} täcks av en härledningsrad`, rader.some((r) => r.includes(t)),
      `${t} var en av de fyra fällor som gick att kopiera sig förbi — den måste ha en rå signal nu`)
  }
  check('B-GAP-2: den svåraste raden är UTPEKAD, inte gömd i tabellen',
    /svåraste raden är telefonraden/.test(harledning[0]),
    'de fyra andra går att klara genom att AVSTÅ; bara telefonraden kräver ett aktivt val mellan två kanaler')
  check('B-GAP-2: spännbart förväxlas INTE med spänt',
    /spännbara, inte spända|Att signalerna\s*\n?nu är råa gör fällorna spännbara/.test(harledning[0]),
    'en åtgärdad lucka som låter som en genomförd körning är värre än en öppen lucka')
}
// B-GAP-1 är STÄNGD. Kraven vänds — men de FÖRSVINNER inte, och det är poängen: när den
// här sektionen döptes om tog tre kontroller som låg innanför `if (stopp)` med sig i
// fallet, tyst. En kontroll som villkoras av en rubrik försvinner när rubriken gör det.
// Ankaret prövas därför separat, FÖRE de villkorade kontrollerna.
const stopp = /## `B-GAP-1` — STÄNGD[\s\S]*?(?=^### |^## )/m.exec(bFv)
check('B-GAP-1: stängningen är dokumenterad i facit', !!stopp,
  'ankaret saknas — och en saknad rubrik tar villkorade kontroller med sig i fallet i stället för att fälla dem')
if (stopp) {
  check('B-GAP-1: BÅDA vägarna redovisas — först bokfört stopp, sedan byggd capability',
    /Båda togs, i den ordningen/.test(stopp[0]) &&
    /verifierades i en körning/.test(stopp[0]),
    'att bara redovisa bygget döljer att stoppet faktiskt prövades först — då är luckan stängd utan att ha varit öppen')
  check('B-GAP-1: konsekvensen att INGET fall längre fäller grinden är utskriven',
    /inte fäller på något fall går inte att\s*\n?skilja från en grind som slutat fungera/.test(stopp[0]),
    'en grind som slutat fälla ser identisk ut med en grind som slutat fungera — tigs det om läses tystnaden som hälsa')
  check('B-GAP-1: och grindens förmåga bevisas SEPARAT',
    /--sjalvprov/.test(stopp[0]) && /DECLARED/.test(stopp[0]) && /ROUTE-OUT/.test(stopp[0]),
    'utan ett separat förmågeprov vilar grindens trovärdighet på att den en gång fällde')
  check('B-GAP-1: taket BUILT motiveras, det påstås inte',
    /kräver Gate 1 mot en\s*\n?deployad preview/.test(stopp[0]),
    'en capability vars tak inte motiveras glider uppåt vid nästa läsning')
}

// ---- B-T7: ankrat i KONTRAKTET, aldrig i filen som gör påståendet ----------
// B-T7 är ÅTGÄRDAT. Kontrollerna är därför INVERTERADE: de prövar att läckaget är BORTA
// och att fyndet är bokfört som åtgärdat i stället för som levande. Den stående
// regressionsvakten bor i scripts/check-karn-universalitet.mjs.
check('B-T7a: läckaget är BORTA ur researchkontraktets ryggrad',
  !/F-skatt/.test([...karnkontrakt.matchAll(/^\| \d+ \| \*\*.+?\*\* \|(.*)$/gm)].map((m) => m[1]).join('\n')),
  'F-skatt har återvänt till den universella ryggraden')
check('B-T7b: primärhandlingsenumet bär minst en icke-lokal handling',
  /'demo'/.test(stack), 'enumet har smalnat tillbaka till lokal-se:s slutna mängd')
// DELVIS, inte helt: kontrakten är universaliserade men deras PRODUCENT inte —
// INPUT GATE:s `≥1 ort` är regel 5, en §A1-invariant som kräver ägarhand. Ett fynd som
// märks helt åtgärdat medan halva orsaken står kvar underdriver för den som ska besluta.
check('B-T7: fyndet är bokfört som DELVIS ÅTGÄRDAT med den ostängda halvan namngiven',
  /DELVIS ÅTGÄRDAT/.test(las('backtests/case-b-saas/FORVANTAT.md')) &&
  /§A1-invariant/.test(las('backtests/case-b-saas/FORVANTAT.md')),
  'antingen saknas DELVIS-märkningen eller så namnges inte §A1-blockeraren')

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
check('§26-GAP-1: de tre negativkontrollerna är STÄNGDA och pekar på fixturerna',
  /§26-GAP-1/.test(btReadme) && /STÄNGD/.test(btReadme) &&
  ['case-c-no-build', 'case-d-migration', 'case-e-standard'].every((d) => btReadme.includes(d)),
  'en stängd lucka utan pekare till det som stängde den går inte att kontrollera')
check('§26-GAP-1: och de KVARVARANDE halvorna är namngivna, inte strukna',
  /C-GAP-1/.test(btReadme) && /E-GAP-1/.test(btReadme) && /prövar ROUTNINGEN, inte beslutet/.test(btReadme),
  'härledningen görs av plannern och ceremoni mäts bara vid ingången — att tiga om det gör en halv stängning till en hel')
check('§26-GAP-1: README säger UT att stängda luckor står kvar som rader',
  /en stängd lucka utan spår går inte att kontrollera/.test(btReadme),
  'utan den regeln städas stängda luckor bort, och då försvinner spåret av vad som en gång saknades')
check('A-GAP-3: kompatibilitetsvägen är STÄNGD och pekar på fixturen som stängde den',
  /A-GAP-3/.test(aFor) && /STÄNGD/.test(aFor) && /case-a-legacy/.test(aFor),
  'en stängd lucka utan pekare till det som stängde den går inte att kontrollera')
check('A-GAP-3: och den KVARVARANDE halvan är namngiven, inte struken',
  /AL-GAP-2/.test(aFor) && /prövbar, inte påtvingad/.test(aFor),
  'läsaren finns men ingen konsument använder den — att tiga om det gör en halv stängning till en hel')
check('B-GAP-2: fixturens egen förhandsbesvarade fällor redovisade som lucka',
  /B-GAP-2/.test(las('backtests/case-b-saas/FORVANTAT.md')),
  'att researchen skriver ut svaret på fyra av sex fällor är en verklig svaghet och får inte utelämnas tyst')
check('B-GAP-1: KAP-EXTERN-BOKNING:s DECLARED-stopp redovisat',
  /B-GAP-1/.test(las('backtests/case-b-saas/FORVANTAT.md')),
  'primärhandlingens kapacitet är DECLARED — en körning HARD-stoppar före B-P2a, och det står ingenstans')

// ---- Verdikt ---------------------------------------------------------------
const signatur = createHash('sha256').update([...namn].sort().join('\n')).digest('hex').slice(0, 16)
if (signatur !== FORVANTAD_SIGNATUR) {
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
