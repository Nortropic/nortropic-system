#!/usr/bin/env node
console.log('VAKT: check-extern-bokning.mjs')  // SJÄLVKVITTERING: skrivs FÖRST, så även en ODÖMBAR körning identifierar sig
// KAP-EXTERN-BOKNING: prövar att kapaciteten är BYGGD — och att den inte påstår mer.
//
// Kapacitetens verifierbara krav lyder: **"Bokningsvägen når tjänsten; sajten förblir
// stateless."** Två krav, och det andra gör det första svårt. Kapaciteten stod `DECLARED`
// därför att stacken bara sa *"a brief-level decision, not a default"* — en hänvisning
// till ett beslut, inte en byggbar väg.
//
// VARFÖR TAKET ÄR `BUILT` OCH INTE `VALIDATING`. Fabriken kan bygga vägen och verifiera
// dess FORM mekaniskt. Att vägen faktiskt NÅR tjänsten kräver en deployad preview, och den
// evidensen finns inte. Vakten prövar därför formen och säger uttryckligen att den inte
// prövar räckvidden. `docs/07-konstitution.md` §A9 är tydlig: radernas INNEHÅLL får ändras
// med belägg, men SEMANTIKEN — vad lägena kräver — är skyddad. Att kalla detta VALIDATING
// vore att flytta semantiken, inte raden.
//
// DEN VIKTIGASTE KONTROLLEN GÄLLER KVITTOSIDAN. En stateless sajt **kan inte veta** att en
// tid blev bokad; bekräftelsen sker hos tjänsten. En kvittosida som säger "din tid är
// bokad" påstår något sajten omöjligt kan veta, och påståendet är falskt varje gång
// besökaren avbryter i bokningsflödet. **Det bekväma svaret är det som ser ut som ett
// godkännande** — samma familj av fel som bakåtkompatibilitetslagens `SAKNAS_I_V1`.
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
const flat = (s) => s.replace(/\s+/g, ' ')

const passes = []
const fails = []
const check = (namn, ok, detalj) => (ok ? passes.push(namn) : fails.push(`${namn}: ${detalj}`))
const FORVANTAD_KALLHASH = '2ebe362cf6f41452'

const REF = 'skills/nortropic-stack/references/extern-bokning.md'
const ref = las(REF)
const stack = las('skills/nortropic-stack/SKILL.md')
const kat = las('docs/kapacitetskatalog.md')

// ---- 1. Kapacitetsraden och dess status ------------------------------------
const rad = /^\| `KAP-EXTERN-BOKNING` \|(.+)\|\s*(\w[\w-]*)\s*\|$/m.exec(kat)
if (!rad) odombart('KAP-EXTERN-BOKNING:s katalograd kunde inte läsas — statusen går inte att pröva')
const status = rad[2]
check('Kapaciteten står BUILT i katalogen', status === 'BUILT',
  `status är ${status} — den här vakten är belägget för BUILT; är raden kvar på DECLARED är belägget obokfört`)
// TAKET, och det är §A9-semantiken: syntetisk/formell evidens bär aldrig högre.
check('Kapaciteten står INTE över BUILT',
  !['VALIDATING', 'PROVEN'].includes(status),
  `${status} kräver evidens från en KÖRNING mot en deployad preview, och vakten prövar bara formen. Att lyfta raden utan den evidensen vore att flytta semantiken, inte raden — §A9`)
check('Katalogens verifierbara krav är oförändrat',
  /Bokningsvägen når tjänsten; sajten förblir stateless/.test(rad[1]),
  'kravets formulering har ändrats — då prövar vakten något annat än raden lovar')

// ---- 2. Länk ut är normalvägen, inbäddning kostar --------------------------
check('Referensen gör LÄNK UT till default', /\*\*Default: länk ut\.\*\*/.test(ref),
  'utan en utpekad default blir inbäddning ett lika giltigt val — och inbäddningen är den som kostar')
for (const [vad, m] of [
  ['samtycke', /[Tt]redjepartskakor ⇒ samtyckesbanner behövs/],
  ['prestanda', /Tredjepartsskript i kritisk väg/],
  ['juridik', /juridikflagga/],
]) check(`Inbäddningens kostnad i ${vad} är namngiven`, m.test(ref),
  'en inbäddning vars kostnader inte står utskrivna smyger in för att den ser mer integrerad ut')
check('Inbäddning kräver att briefen BEGÄR den', /kräver att briefen begär den/.test(flat(ref)),
  'utan det kravet blir inbäddning ett byggarval i stället för ett kundbeslut')

// ---- 3. Sajten tar aldrig emot bokningsdata --------------------------------
for (const [vad, m] of [
  ['webhook-mottagare', /Ingen webhook-mottagare/],
  ['server action för bokning', /Ingen server action för bokning/],
  ['bokningshistorik/sessioner/kakor', /Ingen bokningshistorik, inga sessioner, inga kakor från oss/],
]) check(`Förbudet mot ${vad} är utskrivet`, m.test(ref), 'saknas — utan det kan vägen bli statefull i praktiken')
check('Webhookförbudet MOTIVERAS, inte bara påbjuds',
  /mottagare av personuppgifter och därmed Ring 3/.test(flat(ref)),
  'ett förbud utan skäl blir bortförhandlat av den som har bråttom')
check('Offertformulärets lead-action hålls ISÄR från bokning',
  /gäller LEADS, aldrig bokningar/.test(ref),
  'blandas de ihop blir bokningsvägen en lead-väg med persondata')

// ---- 4. KVITTOSIDAN — den viktigaste kontrollen ---------------------------
check('Kvittosidan förbjuds bekräfta något', /KVITTOSIDAN FÅR INTE BEKRÄFTA NÅGOT/.test(ref),
  'en stateless sajt kan inte veta att en tid blev bokad')
const forbjudna = ['din tid är bokad', 'bokningen är bekräftad', 'vi ses den', 'tack för din bokning']
const saknade = forbjudna.filter((f) => !ref.toLowerCase().includes(f))
check('De förbjudna påståendena är UPPRÄKNADE, inte sammanfattade', saknade.length === 0,
  `saknar ${saknade.join(', ')} — "undvik bekräftande formuleringar" är ett råd; en uppräkning är ett facit`)
check('Skälet är utskrivet: påståendet är falskt vid avbrott',
  /falskt varje gång|felaktigt varje gång/.test(ref),
  'utan skälet läses regeln som en stilpreferens')
check('Den tillåtna formuleringen är angiven, inte bara den förbjudna',
  /Tillåten formulering/.test(ref),
  'en regel som bara säger nej lämnar byggaren utan väg framåt, och då gissar den')

// ---- 5. Fältformen -------------------------------------------------------
for (const [vad, m] of [
  ['typ', /typ: 'bokning'/], ['tjanst', /tjanst:/], ['url', /url:/],
  ['lage', /lage: 'lank'/], ['samtyckeKravs', /samtyckeKravs:/],
]) check(`Fältformen bär \`${vad}\``, m.test(ref), 'fältet saknas i exemplet — byggaren har då inget att följa')
check('Bokningen bor i `integrationer`, inte i ett eget toppfält',
  /Bokningen är en INTEGRATION och bor i `integrationer`/.test(ref),
  'ett eget toppfält skulle göra bokning till en kärnegenskap i stället för en integration')
check('SKILL.md pekar på referensen', /references\/extern-bokning\.md/.test(stack),
  'en referens ingen pekar på är inte en del av stacken')
check('SKILL.md:s NO DATABASE-stycke säger inte längre att bokning är obyggt',
  !/lead history or bookings, that is a brief-level decision/.test(stack),
  'stacken skulle då säga DECLARED medan katalogen säger BUILT')
check('`integrationer`-radens fältform står i SKILL.md',
  /lage: 'lank'/.test(stack) && /samtyckeKravs/.test(stack),
  'formen måste stå där fältet definieras, inte bara i en referens')

// ---- 6. Vad som INTE är verifierat — vakten får inte påstå mer ------------
check('Referensen skiljer BYGGBAR form från VERIFIERAD räckvidd',
  /Vad som går att verifiera MEKANISKT — och vad som inte gör det/.test(ref),
  'utan den uppdelningen läses en grön vakt som bevis för att bokningen fungerar')
check('Och den säger UT varför taket är BUILT',
  /tak(et)? `BUILT`, inte `VALIDATING`/.test(ref),
  'en kapacitet vars tak inte motiveras glider uppåt vid nästa läsning')
check('Ring 3-gränserna är utskrivna (betalning, historik, egen motor)',
  /KAP-EHANDEL/.test(ref) && /KAP-EGET-TILLSTAND/.test(ref) && /aldrig. Kapaciteten heter EXTERN bokning/.test(ref),
  'utan gränserna växer "bokning" tills den är en bokningsprodukt')

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
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} bokningskontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} bokningskontroller (källhash ${kallhash})`)
console.log('\nVAD DETTA INTE BEVISAR: att bokningsvägen NÅR tjänsten. Det kräver Gate 1 mot en')
console.log('deployad preview, och den evidensen finns inte. Kapaciteten står därför BUILT —')
console.log('byggd, ingen evidens — och får inte lyftas högre på den här vaktens ord.')
process.exit(0)
