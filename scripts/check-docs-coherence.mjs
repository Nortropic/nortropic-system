#!/usr/bin/env node
// S9: dokumentationskoherens — binder DOKUMENTERAD arkitektur till BYGGD arkitektur.
//
// Vaktens fråga är inte "står rätt ord i filen" utan "säger dokumentationen och trädet
// samma sak". Relationen är SYMMETRISK: artefakt utan omnämnande är underdokumentation,
// omnämnande utan artefakt är inaktuell dokumentation. Bådadera fäller.
//
// En raderad eller OMDÖPT artefakt släcker därför INTE sin kontroll — den vänder den.
// (En tidigare version lät kontrollen "utgå" i det läget. Att döpa om
// `agents/project-planner.md` tog då bort tjugo kontroller och skrev ut `PASS 26/26`:
// vakten rapporterade sin egen blindhet som fullt grönt. ODÖMBART är reserverat för
// ett annat fall — artefakten ligger kvar men bär inte längre sitt inre ankare.)
//
// Den bevakar drift i BÅDA riktningar:
//   UNDERDOKUMENTATION — artefakten finns i repot men saknas i operatörsdokumentationen
//                        (exakt driften S9 rättade: docs/01 och docs/00-guide låg kvar
//                        på 2026-07-31 medan S1–S4 ändrade nod 1, 2 och artefaktkedjan)
//   ÖVERDOKUMENTATION  — dokumentationen påstår en artefakt som INTE finns i main
//                        (t.ex. att beskriva S5 medan den ligger i öppen PR)
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.
// Ankarkrav: en tom träffmängd är PASS endast om ankaret först bevisats.

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

let ROT
try {
  ROT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
} catch {
  console.error('ODÖMBART: ingen git-topp — körning utanför repo vägras (aldrig gissad rot)')
  process.exit(2)
}

const las = (p) => {
  const f = join(ROT, p)
  if (!existsSync(f)) { console.error(`ODÖMBART: ankarfilen saknas — ${p}`); process.exit(2) }
  return readFileSync(f, 'utf8')
}
const finns = (p) => existsSync(join(ROT, p))

// Prosaregler ska matcha MENINGEN, inte markdown-emfasen: en kontroll som fäller på
// fetstil eller backticks vaktar layouten, inte regeln.
//
// HTML-kommentarer strippas FÖRST. Utan det räckte det att återställa en yta till sitt
// läge före konsolideringen och lägga till EN kommentar med rätt nyckelord för att få
// 51/51 grönt — dokumentationen såg oförändrad ut för läsaren och grön ut för vakten.
// Kravet är att texten SYNS; det som renderas till ingenting dokumenterar ingenting.
const utanKommentar = (s) => s.replace(/<!--[\s\S]*?-->/g, ' ')
const ren = (s) => utanKommentar(s).replace(/\s+/g, ' ').replace(/[*`]/g, '')

// Kodsidan måste behandlas som dokumentsidan. En tidigare version läste kodfilen RÅ
// medan dokumentytorna fick sina kommentarer strippade — så raden
// `// TODO: journeys kommer i S5` i launch-workflowen räckte för att vakten skulle anse
// artefakten landad och tillåta påståendet. Det naturligaste en utvecklare skriver
// medan S5 är i rörelse stängde av kontrollen som finns just därför att S5 är i rörelse.
const utanKodkommentar = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')

/**
 * BEVISETS RÄCKVIDD FÅR ALDRIG VARA VIDARE ÄN PÅSTÅENDET DET LEGITIMERAR.
 *
 * Detta är vaktens bärande designregel, och den är skriven här därför att den bröts en
 * gång med allvarliga följder: ett dokumentGLOBALT predikat fick avgöra en fråga om en
 * ENSKILD mening. Varje ytas stämpelrad bär "S5 är INTE inräknad — den ligger i öppen
 * PR", vilket gjorde att VILKEN mening som helst i samma fil räknades som ärligt
 * redovisad. Sex kontroller kunde därmed strukturellt inte falla, och ett platt påstående
 * om olandat arbete godkändes med etiketten "ärlig redovisning".
 *
 * Meningar delas därför ut, och varje omnämnande prövas i SIN mening.
 */
// Markdown är BLOCK-strukturerad, och ett block är sällan en mening. Tabellrader,
// listpunkter och rubriker slutar nästan aldrig med punkt, så en ren `[.!?]`-delning
// gav block på upp till 2 kB — hela nodkartan som EN "mening". Licensradien blev då
// nästan lika vid som dokumentet, alltså samma fel en gång till, bara mindre.
//
// Åt andra hållet delar `[.!?]` mitt i svenska förkortningar (`t.ex.`, `bl.a.`,
// `t.o.m.`, `resp.`) och i numrerade listor, vilket skiljer ett sant omnämnande från
// sin markör och anklagar den som skrivit rätt — precis den felriktning som
// inversionsvakterna redan straffats för.
const FORKORTNING = /\b(t\.ex|bl\.a|m\.m|d\.v\.s|t\.o\.m|o\.s\.v|s\.k|f\.d|resp|ca|jfr|nr|kap|fig|ev|st)\.\s/gi

const blockdela = (rawText) => {
  // Sentinelen strippas på INGÅNGEN, aldrig återställd blint. Skrev någon `jour\x01neys`
  // i källan lästes det som "journeys" av en människa men återställdes till `jour.neys`
  // och gick förbi mönstret. Ett tecken som inte får finnas ska tas bort, inte tolkas.
  const rader = utanKommentar(rawText).replace(/\x01/g, '').split('\n')
  const block = []
  let stycke = []
  const spola = () => { if (stycke.length) { block.push(stycke.join(' ')); stycke = [] } }
  for (const rad of rader) {
    const t = rad.trim()
    if (!t) { spola(); continue }
    // Block-nivåkonstruktioner är egna enheter: de bär sin mening ensamma.
    if (/^(\||#{1,6}\s|[-*+]\s|\d+[.)]\s|>\s)/.test(t)) { spola(); block.push(t); continue }
    stycke.push(t)   // löptext är hårdbruten och fogas ihop
  }
  spola()
  return block
}

const meningar = (rawText) => {
  const ut = []
  for (const b of blockdela(rawText)) {
    // maskera förkortningarnas punkt före delning, återställ efteråt
    const maskerad = b.replace(FORKORTNING, (m) => m.replace(/\./g, ''))
    for (const m of maskerad.split(/(?<=[.!?])\s+/)) {
      const klar = m.replace(//g, '.').replace(/[*`]/g, '').trim()
      if (klar) ut.push(klar)
    }
  }
  return ut
}

const fails = []
const pass = []
let ROrLIGA = null   // antal kontroller med rörlig kardinalitet (G-listad), sätts vid körning
const ja = (namn) => pass.push(namn)
const nej = (namn, skal) => fails.push(`${namn} — ${skal}`)

// ── Dokumentytorna som ska hållas koherenta ────────────────────────────────────
// Detta är operatörens tre ingångar. docs/00-borja-har.md ingår INTE: den hålls redan
// aktuell av regel 22 vid varje teknisk ändring, och att kräva samma sak två gånger
// gör inte vakten starkare — den gör bara regel 22 svårare att följa.
// Två representationer av samma yta, med olika räckvidd och olika syfte:
//   YTOR   — utplattad, för närhetsmönster som ska spänna över hårda radbrytningar
//   RATEXT — obearbetad, för meningsdelningen, som MÅSTE se blockstrukturen
const RATEXT = {
  'README.md': las('README.md'),
  'docs/01-oversikt.md': las('docs/01-oversikt.md'),
  'docs/00-guide.md': las('docs/00-guide.md'),
  // S11: agentbeskrivningarna var en BLIND YTA. `docs/02-agenter.md` beskrev fortfarande
  // att ett interventionsutfall ≠ NY SAJT fick obemannat att STOPPA — falskt sedan S10,
  // där det ROUTAR. Ytan ingår därför i H-gruppen nedan (inte i A–G, som handlar om
  // arkitekturramning och inte om agenternas skyldigheter).
  'docs/02-agenter.md': las('docs/02-agenter.md'),
}
const YTOR = Object.fromEntries(Object.entries(RATEXT).map(([k, v]) => [k, ren(v)]))

/**
 * Kärnprimitiven — SYMMETRISK. Koherens betyder att dokumentationen och trädet säger
 * samma sak, vilket gör att en saknad artefakt ALDRIG i sig får släcka en kontroll.
 *
 *  - artefakt saknas OCH ytan påstår den   → FAIL (inaktuell dokumentation)
 *  - artefakt saknas OCH ytan tiger        → PASS (koherent frånvaro)
 *  - artefakt finns men saknar sitt ankare → ODÖMBART, aldrig tyst grönt
 *  - artefakt finns                        → varje yta måste bära `krav`
 *
 * Varje kontroll räknas ALLTID, oavsett gren. En första version av den här vakten
 * hoppade över kontroller vars artefakt saknades och skrev ut den krympta summan som
 * verdikt — `PASS 26/26` medan tjugo kontroller tyst hade utgått. En vakt vars nämnare
 * krymper när den slutar vakta rapporterar sin egen blindhet som grönt. Nämnaren är
 * därför fast: FORVANTAT nedan, kontrollerat mot faktiskt antal före verdikt.
 */
function kravOmArtefakt({ namn, artefakt, ankare, ytor, krav, beskrivning }) {
  if (!finns(artefakt)) {
    for (const yta of ytor) {
      const namnet = `${namn} [${yta}]`
      if (krav.test(YTOR[yta])) {
        nej(namnet, `${yta} påstår "${beskrivning}" men artefakten ${artefakt} finns inte i trädet — INAKTUELL DOKUMENTATION (raderad eller omdöpt artefakt)`)
      } else {
        ja(`${namnet}: ${artefakt} saknas och ${yta} påstår den inte — koherent frånvaro`)
      }
    }
    return
  }
  const innehall = ren(readFileSync(join(ROT, artefakt), 'utf8'))
  if (ankare && !ankare.test(innehall)) {
    console.error(`ODÖMBART: ${namn} — ${artefakt} finns men bär inte sitt ankare; kravet kan inte ställas`)
    process.exit(2)
  }
  for (const yta of ytor) {
    const namnet = `${namn} [${yta}]`
    if (krav.test(YTOR[yta])) ja(`${namnet}: ${beskrivning}`)
    else nej(namnet, `${beskrivning} — saknas i ${yta} trots att ${artefakt} finns i repot`)
  }
}

/**
 * Semantiska fällor. En närvarokontroll säger att ORDET står där; den säger ingenting
 * om att MENINGEN är den rätta. Dessa mönster fångar de inversioner som gör kontrollen
 * aktivt vilseledande — en text som säger motsatsen till regeln, med regelns egna ord.
 *
 * Detta stänger INTE parafrasluckan i allmänhet; se ÄRLIG GRÄNS i beslutsloggen.
 * Det stänger den delmängd där dokumentet påstår regelns NEGATION.
 */
function forbjudInversion({ namn, ytor, monster, beskrivning }) {
  for (const yta of ytor) {
    const namnet = `${namn} [${yta}]`
    // Även här per mening. En dokumentglobal inversionssökning anklagar författaren för
    // en inversion som står i en helt annan del av texten.
    const varg = meningar(RATEXT[yta]).find((m) => monster.test(m))
    if (varg) nej(namnet, `${yta} bär en INVERSION av regeln (${beskrivning}). Meningen: "${varg.slice(0, 110)}…"`)
    else ja(`${namnet}: ingen inversion av ${beskrivning}`)
  }
}

/**
 * Motsatt riktning: dokumentationen får ALDRIG påstå en artefakt som inte finns.
 * Detta är skyddet mot att beskriva ogrenat eller ännu inte mergat arbete som landat.
 *
 * Att NEKA existens är däremot alltid tillåtet. En första version förbjöd ordet självt,
 * vilket fällde meningen "S5:s journeys-grind är ännu INTE landad" — alltså exakt den
 * ärliga upplysning skivan bygger på. En vakt som förbjuder sanningen om vad som saknas
 * driver fram tystnad i stället för redovisning. Därför krävs bara att omnämnandet bär
 * en uttrycklig icke-landad-markör i närheten.
 */
// Böjningen måste vara generös. En tidigare version kände `landad` men inte pluralen
// `landade`, så meningen "CATEGORY_ALIAS resp. journeys-grinden är ännu inte landade"
// — ett sant och ärligt påstående — underkändes som överdokumentation. Det är samma
// översträngsriktning som fällde skärpande prosa: vakten straffar den som skriver rätt,
// och kortaste vägen till grönt blir att skriva sämre svenska.
const ICKE_LANDAD = /\b(inte|ej|ännu inte|icke)\b[^.]{0,70}\b(landa\w*|merga\w*|publicera\w*|inräkna\w*|beskrivs|omfattas|ingår|finns)\b|\b(landar|landat|mergas)\b[^.]{0,40}\b(först|när)\b|öppen PR|ligger i PR|ej i main/i

function forbudOmArtefaktSaknas({ namn, fil, kodankare, ytor, forbud, beskrivning }) {
  if (!finns(fil)) {
    console.error(`ODÖMBART: ${namn} — ${fil} saknas; kan varken bekräfta eller avfärda påståendet`)
    process.exit(2)
  }
  const kod = utanKodkommentar(readFileSync(join(ROT, fil), 'utf8'))
  const landad = kodankare.test(kod)
  for (const yta of ytor) {
    const namnet = `${namn} [${yta}]`
    // Per MENING, inte per dokument: varje omnämnande måste själv bära markören.
    const traffar = meningar(RATEXT[yta]).filter((m) => forbud.test(m))
    if (landad) {
      ja(`${namnet}: ${beskrivning} — artefakten finns, påstående tillåtet`)
    } else if (traffar.length === 0) {
      ja(`${namnet}: ${beskrivning} påstås inte, och finns inte — koherent`)
    } else if (traffar.every((m) => ICKE_LANDAD.test(m))) {
      ja(`${namnet}: ${beskrivning} nämns i ${traffar.length} mening(ar), var och en med icke-landad-markör — ärlig redovisning`)
    } else {
      const varg = traffar.find((m) => !ICKE_LANDAD.test(m))
      nej(namnet, `${yta} påstår "${beskrivning}" utan icke-landad-markör i samma mening, men ${fil} bär den inte — ÖVERDOKUMENTATION. Meningen: "${varg.slice(0, 110)}…"`)
    }
  }
}

const ALLA = ['README.md', 'docs/01-oversikt.md', 'docs/00-guide.md']
const TEKNISKA = ['docs/01-oversikt.md', 'docs/00-guide.md']

// ── A. PAKETARKITEKTUREN (S1/S3/S4) ───────────────────────────────────────────
// Finns det paket i repot måste operatörens ingångar veta om det. Detta är den
// exakta drift S9 rättade.
const paketRot = join(ROT, 'packs')
const harPaket = existsSync(paketRot) && readdirSync(paketRot).length > 0
const nagotManifest = harPaket && readdirSync(paketRot).some((d) => existsSync(join(paketRot, d, 'manifest.md')))
if (harPaket && !nagotManifest) {
  console.error('ODÖMBART: packs/ finns men inget paketmanifest — kan inte avgöra om paketarkitekturen är byggd')
  process.exit(2)
}
// Symmetriskt även här: saknas packs/ men ytan talar om paket är dokumentationen
// inaktuell, inte kontrollen överflödig.
for (const yta of ALLA) {
  const pastar = /\bpaket\b/i.test(YTOR[yta])
  if (nagotManifest && pastar) ja(`A-paket [${yta}]: paketarkitekturen är namngiven`)
  else if (nagotManifest) nej(`A-paket [${yta}]`, `packs/ med manifest finns i repot men ${yta} nämner inte paket`)
  else if (pastar) nej(`A-paket [${yta}]`, `${yta} talar om paket men packs/ saknas i trädet — INAKTUELL DOKUMENTATION`)
  else ja(`A-paket [${yta}]: packs/ saknas och ${yta} påstår inget — koherent frånvaro`)
}
for (const yta of ALLA) {
  const pastar = /skärpa[^.]{0,40}aldrig lätta|aldrig lätta[^.]{0,40}skärp|kan lägga till krav[^.]{0,60}aldrig ta bort/i.test(YTOR[yta])
  if (nagotManifest && pastar) ja(`A-skärpningslagen [${yta}]: paket skärper men lättar aldrig`)
  else if (nagotManifest) nej(`A-skärpningslagen [${yta}]`, `${yta} nämner paket men inte att paket får SKÄRPA och aldrig lätta`)
  else if (pastar) nej(`A-skärpningslagen [${yta}]`, `${yta} beskriver paketens skärpningslag men packs/ saknas i trädet — INAKTUELL DOKUMENTATION`)
  else ja(`A-skärpningslagen [${yta}]: packs/ saknas och ${yta} påstår inget — koherent frånvaro`)
}
for (const yta of ALLA) {
  const pastar = /först[ae]\s+paket|paket(et)?\s+är\s+det\s+först|inte\s+(dess|systemets)\s+natur/i.test(YTOR[yta])
  if (nagotManifest && pastar) ja(`A-förstapaket [${yta}]: lokal-se ramas som första paketet`)
  else if (nagotManifest) nej(`A-förstapaket [${yta}]`, `${yta} ramar inte lokal-se som FÖRSTA paketet — risk att specialiseringen läses som systemets natur`)
  else if (pastar) nej(`A-förstapaket [${yta}]`, `${yta} ramar lokal-se som första paketet men packs/ saknas — INAKTUELL DOKUMENTATION`)
  else ja(`A-förstapaket [${yta}]: packs/ saknas och ${yta} påstår inget — koherent frånvaro`)
}
// Skärpningslagens INVERSION: en mening som beviljar undantag upphäver lagen med
// lagens egna ord. "aldrig ta bort ett UTAN ÄGARBESLUT" är inte skärpningslagen.
// Negationen måste binda till UNDANTAGET, inte till vilken "utan" som helst.
// "aldrig ta bort ett krav UTAN ATT bryta mot kontraktet" SKÄRPER regeln — det är en
// följdsats. "aldrig ta bort ett UTAN ÄGARBESLUT" UPPHÄVER den — det är ett villkor som
// beviljar undantag. Skillnaden är `utan att` + verb mot `utan` + substantiv, och en
// vakt som inte gör den skillnaden anklagar den som skriver rätt. Den kortaste vägen
// till grönt blir då att FÖRSVAGA meningen — samma felriktning som F-gruppen hade.
forbjudInversion({
  namn: 'A-skärpning-inversion',
  ytor: ALLA,
  monster: /(aldrig ta bort|aldrig lätta)[^.]{0,40}\b(utan|förutom|om det inte|såvida)\b(?!\s+att\b)|(?:ta bort|lätta)[^.]{0,30}\b(är valfri|valfritt|behövs ingen|kräver bara)\b/i,
  beskrivning: 'skärpningslagen villkorad med ett undantag som beviljar lättnad',
})

// ── B. KAPACITETSKATALOGEN (S3) ───────────────────────────────────────────────
kravOmArtefakt({
  namn: 'B-katalog',
  artefakt: 'docs/kapacitetskatalog.md',
  ankare: /kapacitet/i,
  ytor: TEKNISKA,
  krav: /kapacitetskatalog/i,
  beskrivning: 'kapacitetskatalogen är refererad',
})
kravOmArtefakt({
  namn: 'B-declared-stopp',
  artefakt: 'agents/project-planner.md',
  ankare: /DECLARED/,
  ytor: TEKNISKA,
  krav: /DECLARED/,
  beskrivning: 'DECLARED-kapacitet stoppar i stället för att planeras runt',
})

// ── C. INTERVENTIONSBESLUTET (S3) ─────────────────────────────────────────────
kravOmArtefakt({
  namn: 'C-interventionsbeslut',
  artefakt: 'agents/project-planner.md',
  ankare: /INTERVENTIONSBESLUT/,
  ytor: ALLA,
  krav: /interventionsbeslut/i,
  beskrivning: 'interventionsbeslutet är namngivet',
})
for (const utfall of ['NY SAJT', 'FÖRBÄTTRA BEFINTLIG', 'ICKE-SAJT-ÅTGÄRD', 'AVRÅD']) {
  kravOmArtefakt({
    namn: `C-utfall:${utfall}`,
    artefakt: 'agents/project-planner.md',
    ankare: new RegExp(utfall.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')),
    ytor: TEKNISKA,
    krav: new RegExp(utfall.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')),
    beskrivning: `utfallet ${utfall} är dokumenterat`,
  })
}
// Den bärande regeln: utan STRATEGISK-registreringen bygger obemannat den avrådda sajten.
kravOmArtefakt({
  namn: 'C-strategisk-registrering',
  artefakt: 'agents/project-planner.md',
  ankare: /STRATEGISK/,
  ytor: TEKNISKA,
  krav: /(annat än\s+`?NY SAJT`?|inte\s+NY SAJT)[^.]{0,140}STRATEGISK|STRATEGISK[^.]{0,140}(annat än\s+`?NY SAJT`?)/i,
  beskrivning: 'icke-NY-SAJT registreras ALLTID också som STRATEGISK öppen fråga',
})
// Den bärande regelns INVERSION. Närvarokontrollen ovan kräver bara att orden står
// nära varandra — den passerar därför lika glatt på "registreras ALDRIG som en
// STRATEGISK öppen fråga", alltså regelns raka motsats. En kontroll som godkänner
// negationen av det den vaktar är sämre än ingen kontroll: den intygar felet.
// Negationen måste binda till REGISTRERINGEN, inte till ordet STRATEGISK i största
// allmänhet. "En STRATEGISK öppen fråga får ALDRIG skjutas upp" skärper regeln; en
// vakt som fäller på den lär författaren att undvika ordet i stället för att skriva rätt.
forbjudInversion({
  namn: 'C-strategisk-inversion',
  ytor: TEKNISKA,
  monster: /\b(aldrig|inte|behöver inte|inget krav på att)\b[^.]{0,50}\bregistrer\w*[^.]{0,50}STRATEGISK|\bregistrer\w*[^.]{0,40}\b(aldrig|inte|behöver inte)\b[^.]{0,40}STRATEGISK|STRATEGISK[^.]{0,50}\b(är valfri|valfritt|behövs inte|behöver inte registreras|registreras aldrig)\b/i,
  beskrivning: 'STRATEGISK-registreringen nekad eller gjord frivillig',
})

// ── D. RESEARCHKONTRAKT v3 (S1) ───────────────────────────────────────────────
kravOmArtefakt({
  namn: 'D-kontrakt',
  artefakt: 'skills/nortropic-plan/references/research-kontrakt-v3.md',
  ankare: /KONTRAKTSVERSION/i,
  ytor: ['docs/01-oversikt.md'],
  krav: /research-kontrakt-v3|researchkontrakt v3/i,
  beskrivning: 'researchkontrakt v3 är namngivet som nod 1:s auktoritet',
})
kravOmArtefakt({
  namn: 'D-pinn',
  artefakt: 'config/research-contract.v3.json',
  ankare: /"[a-z_]*sha|pin|identitet/i,
  ytor: ['docs/01-oversikt.md'],
  krav: /pinn|research-contract\.v3\.json/i,
  beskrivning: 'kontraktets pinnade identitet är dokumenterad',
})
kravOmArtefakt({
  namn: 'D-kontrollrad',
  artefakt: 'agents/project-planner.md',
  ankare: /kontrollraden/i,
  ytor: ['docs/01-oversikt.md'],
  krav: /kontrollrad/i,
  beskrivning: 'kontrollraden (sektion 17) läses först',
})

// ── E. DEN KÄNDA AVVIKELSEN (S1) ──────────────────────────────────────────────
// En medvetet oförändrad avvikelse måste synas för den som möter den. Rättas
// avvikelsen i plannern fäller kontrollen i stället på att dokumentationen fortfarande
// redovisar den — en rättad brist får inte stå kvar som brist.
kravOmArtefakt({
  namn: 'E-avvikelse',
  artefakt: 'agents/project-planner.md',
  ankare: /Känd avvikelse/i,
  ytor: TEKNISKA,
  krav: /känd avvikelse|paketformad grind|paketformad/i,
  beskrivning: 'den paketformade INPUT GATE-avvikelsen är redovisad',
})
kravOmArtefakt({
  namn: 'E-inte-bristfällig-research',
  artefakt: 'agents/project-planner.md',
  ankare: /Känd avvikelse/i,
  ytor: TEKNISKA,
  krav: /aldrig\s+(att\s+)?(researchen\s+är\s+)?bristfällig|inte\s+att\s+researchen\s+är\s+bristfällig/i,
  beskrivning: 'stoppet får inte läsas som bristfällig research',
})

// ── F. ANTI-ÖVERDOKUMENTATION (S5 ligger i öppen PR) ──────────────────────────
// Detta är gruppens skarpaste kontroll: den fäller om dokumentationen beskriver
// arbete som ännu inte finns i trädet. Landar S5 vänds kravet automatiskt och
// påståendet blir tillåtet — vakten hindrar aldrig sanning, bara försprång.
forbudOmArtefaktSaknas({
  namn: 'F-journeys',
  fil: 'workflows/nortropic-launch.js',
  kodankare: /journeys/,
  ytor: ALLA,
  forbud: /journeys/i,
  beskrivning: 'journeys-grinden',
})
forbudOmArtefaktSaknas({
  namn: 'F-kategorialias',
  fil: 'workflows/nortropic-launch.js',
  kodankare: /CATEGORY_ALIAS/,
  ytor: ALLA,
  forbud: /CATEGORY_ALIAS|kategorialias/i,
  beskrivning: 'kategorialias-tabellen',
})

// ── H. DELEGATIONSSEMANTIKEN FÅR INTE BESKRIVAS SOM DEN VAR FÖRE S10 ──────────
// Bunden till taxonomins existens i workflowkällan: finns ROUTE i interventionstabellen
// har S10 landat, och då är varje beskrivning av "stoppar och lämnar över" vid ett
// icke-NY-SAJT-utfall ett FALSKT påstående — inte bara en utelämnad uppdatering.
{
  const wf = 'workflows/nortropic-autobygg.js'
  if (!finns(wf)) { console.error(`ODÖMBART: ${wf} saknas — delegationssemantiken kan inte prövas`); process.exit(2) }
  // Kommentarer strippas — annars räcker det att kommentera bort mappningen och lägga
  // till en `CONTINUE`-rad för att `s10` ska stanna sann. Samma fel som fälldes i
  // workflowvaktens kodsida och som infördes på nytt här.
  const kod = utanKodkommentar(readFileSync(join(ROT, wf), 'utf8'))
  const s10 = /'FÖRBÄTTRA BEFINTLIG':\s*ROUTE/.test(kod)
  const YTOR_H = ['docs/02-agenter.md', 'docs/01-oversikt.md', 'docs/00-guide.md']
  // SYMMETRI. Grupp H fällde bara "dokumentationen säger STOPP medan koden ROUTAR" och
  // var strukturellt oförmögen att fälla motsatsen. Att byta mappningen till CONTINUE lät
  // därför koden sluta routa medan alla tre ytorna fortsatte påstå ROUTAR — och vakten
  // intygade det. Fjärde gången samma signatur i det här programmet: nämnaren eller
  // kravet slocknar samtidigt som utsagan blir falsk.
  for (const yta of YTOR_H) {
    const t = YTOR[yta]
    if (!s10) {
      // Koden routar INTE. Då får ingen yta påstå att den gör det.
      // MENINGSSKOPAT, inte styckeskopat. En styckeskopad variant blandade ihop
      // INTERVENTIONS-routning med den orelaterade `ROUTE-OUT`-routningen (kapaciteter),
      // som råkar stå i samma megastycke i `02-agenter`. Följden var att en KORREKT
      // pre-S10-beskrivning fälldes som överdokumentation. Samma sammanblandning som
      // skopningsfel (4) — återinförd av rättningen av (1), och rättad genom att SNÄVA IN.
      const pastarRoutning = meningar(RATEXT[yta]).some(m =>
        /\brouta\w*\b/i.test(m) && /NY SAJT|interventionsutfall|interventionsbeslut/i.test(m))
      if (pastarRoutning) nej(`H-taxonomi [${yta}]`,
        `${yta} påstår att ett icke-NY-SAJT-utfall ROUTAR, men ${wf} bär ingen ROUTE-mappning — ÖVERDOKUMENTATION`)
      else ja(`H-taxonomi [${yta}]: S10 ej landad och ingen yta påstår routning — koherent`)
      continue
    }
    // (a) dispositionen måste nämnas där plannerns skyldigheter beskrivs
    if (/\bblocking\b/.test(t)) ja(`H-disposition [${yta}]: dispositionen blocking är namngiven`)
    else nej(`H-disposition [${yta}]`, `taxonomin finns i ${wf} men ${yta} nämner inte dispositionen \`blocking\``)
  }
  // De tre kontrollerna nedan gällde TIDIGARE ovillkorligt, vilket gjorde påståendet
  // "landar inte S10 vilar kravet" falskt OCH straffade en korrekt beskrivning av det
  // verkliga (pre-S10) beteendet. De vilar nu tillsammans med resten av gruppen.
  if (!s10) {
    for (const yta of YTOR_H) {
      ja(`H-routning-namngiven [${yta}]: S10 ej landad — kravet vilar`)
      ja(`H-premiss-routar [${yta}]: S10 ej landad — kravet vilar`)
      ja(`H-ingen-falsk-stopputsaga [${yta}]: S10 ej landad — stopputsagan är då SANN`)
    }
  } else {
  // (b) INGEN yta får påstå att ett icke-NY-SAJT-utfall stoppar och väntar på ägaren.
  //     STYCKESKOPAD, inte meningsskopad: en falsk följdsats står ofta i meningen EFTER
  //     den som nämner utfallet ("Den frågan gör att obemannat stannar…"). Meningsskopning
  //     missade det, och konsekvensen hör till samma stycke som premissen.
  for (const yta of YTOR_H) {
    //     FÖNSTER ±1 BLOCK. Följdsatsen står ofta i stycket OMEDELBART EFTER premissen
    //     ("…annat än NY SAJT registreras som STRATEGISK." / "Den frågan gör att obemannat
    //     stannar…"), och det stycket nämner inte premissen. Fönstret är avgränsat till
    //     ett block FRAMÅT (n, n+1) — inte dokumentglobalt, som en gång gjorde sex
    //     kontroller strukturellt ofällbara.
    const blk = blockdela(RATEXT[yta])
    const PREMISS = /annat än\s+`?NY SAJT`?|icke-NY-SAJT|inte\s+NY SAJT/i
    const STOPP = /\bstoppar\b|\bstannar\b|lämnar över|inväntar|väntar på/i
    let falskt = null
    for (let n = 0; n < blk.length && !falskt; n++) {
      if (!PREMISS.test(blk[n])) continue
      const fonster = blk.slice(n, n + 2)
      const bar = fonster.join(' ')
      if (STOPP.test(bar) && !/\brouta\w*\b/i.test(bar)) {
        falskt = fonster.find(x => STOPP.test(x)) || blk[n]
      }
    }
    // (c) POSITIVT KRAV. Negationen ensam räcker inte: premissen och den falska
    //     följdsatsen kan ligga i ANGRÄNSANDE stycken, och då ser (b) dem inte. Att
    //     kräva routningsutsagan gör en ERSÄTTNING detekterbar — byter någon ut
    //     routningsstycket mot ett stoppstycke faller detta krav även om (b) tiger.
    const harRoutning = blockdela(RATEXT[yta]).some(b =>
      /\brouta\w*\b/i.test(b) &&
      /NY SAJT|interventionsutfall|interventionsbeslut/i.test(b))
    if (harRoutning) ja(`H-routning-namngiven [${yta}]: routningen är utskriven`)
    else nej(`H-routning-namngiven [${yta}]`,
      `taxonomin ROUTAR vid icke-NY-SAJT men ${yta} beskriver ingenstans routningen — en ersatt utsaga syns annars inte`)

    // (d) MENINGSSKOPAT POSITIVT KRAV. Ett långt stycke kan bära BÅDE ett orelaterat
    //     "routas bort" (om ROUTE-OUT) OCH en falsk stopputsaga om interventionsutfallet —
    //     då tiger både (b) och (c). Varje MENING som bär premissen måste därför själv,
    //     eller i meningen direkt efter, namnge routningen.
    const men = meningar(RATEXT[yta])
    let premissUtanRoutning = null
    for (let n = 0; n < men.length && !premissUtanRoutning; n++) {
      if (!PREMISS.test(men[n])) continue
      // SAMMA MENING, inget fönster. Ett ±1-fönster uppfylldes av ett ORELATERAT
      // "ROUTE-OUT routas bort" i nästa mening — en helt annan routning. Premissen och
      // dess följd hör ihop i en mening, och alla tre ytorna skriver det så.
      if (!/\brouta\w*\b/i.test(men[n])) premissUtanRoutning = men[n]
    }
    if (premissUtanRoutning) nej(`H-premiss-routar [${yta}]`,
      `meningen som bär icke-NY-SAJT-premissen namnger inte routningen. Meningen: "${premissUtanRoutning.slice(0, 110)}…"`)
    else ja(`H-premiss-routar [${yta}]: premissen bär sin routningsutsaga`)

    if (falskt) nej(`H-ingen-falsk-stopputsaga [${yta}]`,
      `påstår att ett icke-NY-SAJT-utfall stoppar/väntar, men taxonomin ROUTAR. Meningen: "${falskt.slice(0, 110)}…"`)
    else ja(`H-ingen-falsk-stopputsaga [${yta}]: ingen förlegad stopputsaga`)
  }
  }
}

// ── I. LÄGESDEFAULTEN (S12) ───────────────────────────────────────────────────
// Bunden till en KÄLLNIVÅMARKÖR för defaulten — inte till grindens exekverade beteende.
// Det beteendet bevisas av W2b–W2e i `check-autobygg-delegation`. Skillnaden är verklig:
// en omskrivning som lämnar den ankrade raden orörd men skuggar defaulten ovanför passerar
// här och dödas där. Kontrollerna delar arbete med avsikt; att bygga en andra
// grindexekverare i en dokumentationsvakt vore en till sak att hålla synkad.
{
  const wf2 = 'workflows/nortropic-autobygg.js'
  const kod2 = utanKodkommentar(readFileSync(join(ROT, wf2), 'utf8'))
  const blocket = kod2.slice(kod2.indexOf('function obemannatGate'), kod2.indexOf('function beslutEfterPlan'))
  if (!blocket) { console.error('ODÖMBART: obemannatGate kunde inte avgränsas'); process.exit(2) }
  const defaultObemannad = /angivet === ''\s*\|\|\s*angivet === 'obemannat'\s*\)\s*return \{ stop: false/.test(blocket)
  // YTLISTAN DELAS MED SYSTERGRUPPEN H. Grupp I utelämnade `docs/02-agenter.md` medan H
  // redan behandlade den som operatörsyta — och den enda kvarvarande falska utsagan om
  // lägesdefaulten satt precis i filen de två listorna var oense om. Att rätta raden
  // rättar raden; att dela listan stänger klassen.
  for (const yta of ['docs/01-oversikt.md', 'docs/00-guide.md', 'docs/02-agenter.md', 'agents/project-planner.md']) {
    const t = yta.startsWith('agents') ? ren(las(yta)) : YTOR[yta]
    if (defaultObemannad) {
      if (/default\s+\*{0,2}`?obemannat`?|[Ss]aknas[^.]{0,60}obemannat|obemannat är (numera )?normalvägen/i.test(t))
        ja(`I-default [${yta}]: den vända defaulten är utskriven`)
      else nej(`I-default [${yta}]`, `koden defaultar till obemannat men ${yta} säger det inte`)
    } else {
      if (/default\s+\*{0,2}`?obemannat`?|obemannat är (numera )?normalvägen/i.test(t))
        nej(`I-default [${yta}]`, `${yta} påstår att obemannat är default men koden gör det inte — ÖVERDOKUMENTATION`)
      else ja(`I-default [${yta}]: koden defaultar inte till obemannat och ${yta} påstår det inte`)
    }
  }
  // INGEN YTA FÅR PÅSTÅ DEN GAMLA DEFAULTEN. Grupp I prövade bara NÄRVARON av det nya
  // påståendet — samma blindhet som fälldes i grupp H, och som jag rättade där men inte
  // här. En yta kan därför bära båda utsagorna samtidigt och passera. Meningsskopat:
  // en historisk rad ("förut var defaulten bemannat") ska inte fällas.
  if (defaultObemannad) {
    for (const yta of ['docs/01-oversikt.md', 'docs/00-guide.md', 'docs/02-agenter.md', 'agents/project-planner.md']) {
      const rat = yta.startsWith('agents') ? las(yta) : RATEXT[yta]
      const varg = meningar(rat).find((m) =>
        /default\w*\s+(är\s+)?\*{0,2}`?bemannat`?|utelämnad[^.]{0,40}=\s*\*{0,2}`?bemannat`?/i.test(m) &&
        // Undantaget gäller ÄKTA historik, inte versionsmarkörer. `v16` stod först med i
        // listan och matchade rubriken "**v16:** plannern läser…" — alltså den mening som
        // BAR det falska påståendet. Ett undantag som råkar täcka fallet det ska fånga är
        // värre än inget undantag.
        //
        // ÄRLIG GRÄNS: ventilen är ordbaserad och kan bäras av ett LEVANDE påstående i samma
        // mening — "Defaulten är bemannat, som tidigare nämnts" passerar. Det är samma FORM
        // som v16-buggen men en svagare instans: den kräver en författarsammanträffning i
        // stället för att täcka fallet med säkerhet. Meningsskopningen är bekräftad: ett
        // `tidigare` i GRANNMENINGEN skyddar inte.
        !/\bförut\b|\btidigare\b|före S12|historisk|fram till S12/i.test(m))
      if (varg) nej(`I-ingen-gammal-default [${yta}]`,
        `påstår att defaulten är bemannat, men koden defaultar till obemannat. Meningen: "${varg.slice(0, 100)}…"`)
      else ja(`I-ingen-gammal-default [${yta}]: ingen förlegad defaultutsaga`)
    }
  } else {
    for (const yta of ['docs/01-oversikt.md', 'docs/00-guide.md', 'docs/02-agenter.md', 'agents/project-planner.md'])
      ja(`I-ingen-gammal-default [${yta}]: koden defaultar inte till obemannat — utsagan är då SANN`)
  }

  // Fail-closed på okänt läge måste stå kvar — en vänd default utan den vore en gissning.
  if (/oklassificerat: true[\s\S]{0,200}okänt lägesvärde|okänt lägesvärde[\s\S]{0,200}oklassificerat/.test(blocket))
    ja('I-oklassificerat-läge: ett okänt lägesvärde fail-closar')
  else nej('I-oklassificerat-läge', 'ett okänt lägesvärde fail-closar inte längre — en vänd default utan fail-closed är en gissning')
}

// ── G. VAKTERNAS EGEN ÄRLIGHET ────────────────────────────────────────────────
// Kontrollskripten är inte grindkopplade. Så länge det är sant måste README säga
// det, annars läser en ny operatör en handkörd kontroll som en grind.
{
  const readme = YTOR['README.md']
  let skript
  try {
    skript = readdirSync(join(ROT, 'scripts')).filter((f) => f.startsWith('check-') && f.endsWith('.mjs'))
  } catch (e) {
    // Utan denna fångst kastade readdirSync ett ohanterat ENOENT: exit 1 med stackspår
    // och ingen verdiktrad — alltså omöjligt att skilja från FAIL. Samma
    // klassning-på-frånvaro som vaktens egen tes handlar om.
    console.error(`ODÖMBART: scripts/ kan inte läsas (${e.code ?? e.message}) — README:s skriptrad kan inte prövas`)
    process.exit(2)
  }
  if (skript.length === 0) {
    console.error('ODÖMBART: inga check-*.mjs i scripts/ — kan inte pröva README:s skriptrad')
    process.exit(2)
  }
  // G-listad har RÖRLIG kardinalitet — en rad per kontrollskript. Den räknas därför
  // separat och läggs till nämnaren, i stället för att ingå i det handskrivna talet.
  // Utan den uppdelningen förvandlade ett NYTT kontrollskript en korrekt dom till en
  // vägran att döma: den legitima ökningen (ett skript tillkom) och den illegitima
  // (en kontroll försvann) såg likadana ut — "antalet rörde sig".
  // SYMMETRI ÄVEN HÄR. En tidigare version itererade bara disk → README, vilket gjorde
  // G-listad till vaktens enda asymmetriska grupp — och därmed till en ny krympande
  // nämnare: `rm scripts/check-invariants.mjs` gav `PASS 50/50` medan README fortsatte
  // lista skriptet. Alltså inaktuell dokumentation, intygad som grön, av precis samma
  // signatur som gruppen A–F byggdes om för att stänga. Unionen prövas nu åt båda håll.
  // `i` och `_` med: utan dem kändes `check-Zzz.mjs` inte igen ens när den var korrekt
  // listad, och föll som UNDERDOKUMENTATION. Säker riktning, men fortfarande fel dom.
  const namndaIReadme = [...new Set((readme.match(/check-[a-z0-9_-]+\.mjs/gi) ?? []))]
  const union = [...new Set([...skript, ...namndaIReadme])].sort()
  ROrLIGA = union.length
  for (const s of union) {
    const paDisk = skript.includes(s)
    const iReadme = namndaIReadme.includes(s)
    if (paDisk && iReadme) ja(`G-listad: ${s} finns i scripts/ och är listad i README`)
    else if (paDisk) nej(`G-listad: ${s}`, `finns i scripts/ men saknas i README:s skriptrad — UNDERDOKUMENTATION`)
    else nej(`G-listad: ${s}`, `listas i README men finns inte i scripts/ — INAKTUELL DOKUMENTATION`)
  }
  if (/ej grindkopplad|inte grindkopplad/i.test(readme)) {
    ja('G-ärlighet: README säger att kontrollskripten inte är grindkopplade')
  } else {
    nej('G-ärlighet', 'README listar kontrollskript utan att säga att de körs för hand och inte är grindkopplade')
  }
}

// ── Verdikt ───────────────────────────────────────────────────────────────────
// FAST NÄMNARE. Varje kontroll ovan avger alltid ett utfall, oavsett om artefakten
// finns — men det räcker inte som garanti, eftersom en framtida gren kan råka hoppa
// över en. FORVANTAT är därför skriven för hand och jämförs mot faktiskt antal.
// Faller de isär är körningen ODÖMBAR: en vakt som tappat kontroller vet inte längre
// vad dess grönt betyder, och får då inte påstå någonting alls.
const FASTA = 66   // A 12 · B 4 · C 15 · D 3 · E 4 · F 6 · G-ärlighet 1 · H 12 · I 9

for (const p of pass) console.log(`PASS: ${p}`)
for (const f of fails) console.error(`FAIL: ${f}`)

if (ROrLIGA === null) {
  console.error('\nODÖMBART: G-listad kördes aldrig — kontrollmängden är okänd och vakten kan inte döma')
  process.exit(2)
}
const total = pass.length + fails.length
const FORVANTAT = FASTA + ROrLIGA
if (total !== FORVANTAT) {
  console.error(
    `\nODÖMBART: ${total} kontroller avgavs men ${FORVANTAT} förväntades ` +
    `(${FASTA} fasta + ${ROrLIGA} kontrollskript) — vakten har tappat eller fått kontroller ` +
    `och kan inte döma. Ändra FASTA medvetet när kontrollmängden ändras; aldrig för att få tyst på detta.`
  )
  process.exit(2)
}
if (fails.length > 0) {
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${total} koherenskontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${total}/${FORVANTAT} dokumentationskoherenskontroller`)
process.exit(0)
