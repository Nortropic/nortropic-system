#!/usr/bin/env node
// v4-rubrikens UTKAST: vakten som håller utmanaren UTANFÖR auktoritet.
//
// Vaktens fråga är inte "är v4 bra" utan "är v4 fortfarande bara ett utkast".
// Ett challenger-mått blir farligt först när det tyst börjar användas: en domare som
// öppnar fel fil, en SKILL.md som pekas om, en stämpel som vänds i en HTML-kommentar.
//
// VAD KONTROLLERNA FAKTISKT BÄR — uppräknat, aldrig bundet till instrumentet:
//   1. Produktionsmåttet är BYTE-ORÖRT. `eval-rubric.md` prövas mot en FRUSEN blob-hash
//      (V3_BLOB), inte mot sin form. En människa FÅR ändra v3 (§A2 säger bara att en
//      agent inte får) — men då uppdateras pinnen medvetet i samma commit. Utan pinnen
//      kunde hela v4-mätregimen skrivas IN i v3 med versionsraden orörd.
//   2. Utkastet har ingen konsument i HELA det spårade trädet (`git ls-files`), inte i
//      en handskriven kataloglista. En tidigare version skannade åtta kataloger och
//      missade `.agents/` (sex SKILL.md), `AGENTS.md`, `controller/`, `config/`,
//      `tests/fixtures/eval-baseline.md` och `vendored-skills/`.
//   3. Domaren kan bara nå EN rubrik: `skills/nortropic-eval/references/` har en frusen
//      fillista, och SKILL.md får namnge exakt en `references/*.md` som rubrik. En ren
//      KOPIA av v4 under annat filnamn passerade en filnamnsbaserad kontroll.
//   4. Utkastets egen konstruktion prövas DÄR DEN VERKAR — bandtabellens rader, kärn-
//      och pakettabellernas rader, viktlistan i §10 — aldrig som fras-närvaro mot hela
//      filen. En fras kan stå kvar medan tabellen säger motsatsen.
//
// ANKARKRAV (S9-lärdomen, skärpt): en TOM träffmängd är PASS endast om ankaret först
// bevisats. Konsumentdetektorn har därför ett POSITIVT KONTROLLPROV: de två tillåtna
// dokumentationsraderna MÅSTE hittas av samma detektor. Hittar den inte dem kan den inte
// hitta något annat heller, och körningen blir ODÖMBAR i stället för grön.
// En bevakad yta som saknas FÄLLER — den filtreras aldrig bort ur ankaret.
//
// Verdiktalgebra: exit 0 = PASS, 1 = FAIL, 2 = ODÖMBART. ODÖMBART blir ALDRIG grönt.

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

const UTKAST = 'docs/utkast/eval-rubrik-v4-UTKAST.md'
const V3 = 'skills/nortropic-eval/references/eval-rubric.md'
const V3_KATALOG = 'skills/nortropic-eval/references'
const SKILL = 'skills/nortropic-eval/SKILL.md'
const VAKTEN = 'scripts/check-v4-utkast.mjs'

// Frusen blob-hash för v3-rubriken vid a2aa7c2f. Ändras v3 av människohand uppdateras
// raden i SAMMA commit — det är avsedd friktion på en §A2-yta, inte ett fel.
const V3_BLOB = 'a7d4bf156bf2c0a1d37a9084c3f835510758e6a4'

// De ENDA ytor som får omnämna utkastet: det enkla dokumentationslagret och beslutsloggen.
// De beskriver utkastet för en LÄSARE, aldrig för en körning.
const TILLATNA = ['docs/00-borja-har.md', 'docs/05-beslutslogg.md']
const MARKORER = ['eval-rubrik-v4', 'v4.0.0-UTKAST', 'docs/utkast']

// Frusna (id, namn)-par. ID-listan ensam räckte inte: ett kriterium kunde få ett id som
// föll utanför ID-mönstret (`K12b`) och därmed bli OSYNLIGT för regexen, medan `K12`
// tystades om till något annat med bevarad vikt och bevarad summa.
const KARN_KRITERIER = [
  ['K1', 'Konverteringsarkitektur'], ['K2', 'Faktatrohet'],
  ['K3', 'Toppuppgifter & obligatoriska resor'], ['K4', 'Copy-kvalitet'],
  ['K5', 'Visuell distinktion'], ['K6', 'Teknisk SEO-kärna'],
  ['K7', 'Strukturtrohet & paketläckage'], ['K8', 'Prestanda'],
  ['K9', 'Juridik komplett'], ['K10', 'Kontaktuppgifternas konsistens'],
  ['K11', 'Förtroendesignaler'], ['K12', 'Teknisk hygien'],
]
const PAKET_KRITERIER = [
  ['P-L1', 'Lokal NAP-yta'], ['P-L2', 'Lokal sökstruktur & ortssidor'], ['P-L3', 'Lokal schemayta'],
]
const KARN_ID = KARN_KRITERIER.map((k) => k[0])
const PAKET_ID = PAKET_KRITERIER.map((k) => k[0])
const KARN_SUMMA = 109
const PAKET_SUMMA = 24

const odombart = (skal) => { console.error(`ODÖMBART: ${skal}`); process.exit(2) }
const las = (p) => {
  const f = join(ROT, p)
  if (!existsSync(f)) odombart(`ankarfilen saknas — ${p}`)
  return readFileSync(f, 'utf8')
}
// HTML-kommentarer strippas FÖRST. Utan det bar en osynlig kommentar hela stämpelbeviset
// medan filens läsbara innehåll sa PRODUCTION.
const utanKommentar = (s) => s.replace(/<!--[\s\S]*?-->/g, ' ')

const passes = []
const fails = []
const check = (namn, ok, detalj) => (ok ? passes.push(namn) : fails.push(`${namn}: ${detalj}`))

const utkastRatt = las(UTKAST)
const utkast = utanKommentar(utkastRatt)
const skill = las(SKILL)

// ---- 1. PRODUKTIONSMÅTTET ÄR BYTE-ORÖRT (§A2) ------------------------------
let v3Hash
try {
  v3Hash = execFileSync('git', ['hash-object', join(ROT, V3)], { encoding: 'utf8' }).trim()
} catch {
  odombart(`kunde inte hasha ${V3} — orördheten går inte att pröva`)
}
check('Ankare: v3-rubrikens blob kunde hashas', /^[0-9a-f]{40}$/.test(v3Hash), `fick "${v3Hash}"`)
check('Produktionsrubriken är BYTE-ORÖRD mot den frusna pinnen',
  v3Hash === V3_BLOB,
  `eval-rubric.md har hash ${v3Hash}, pinnen säger ${V3_BLOB} — v3 har ändrats. Är ändringen en medveten människohandling uppdateras V3_BLOB i samma commit; annars är detta en mätregimsövergång som kräver S6 + HÖGRISK`)

// Strukturkontrollerna behålls UTÖVER pinnen: de namnger VAD som skulle ha ändrats.
const v3 = las(V3)
const v3Version = /\*\*Rubrikversion: (v[\d.]+)\*\*/.exec(v3)
check('Ankare: v3:s versionsrad kunde läsas', !!v3Version, 'versionsraden hittades inte')
check('Produktionsrubriken står på en v3-version',
  !!v3Version && v3Version[1].startsWith('v3.'),
  `eval-rubric.md står på ${v3Version ? v3Version[1] : 'okänd version'}`)
const v3Kriterier = [...v3.matchAll(/^## (\d+)\. .+? — (\d+) p/gm)]
check('Ankare: v3:s kriterierader kunde räknas', v3Kriterier.length > 0, 'inga kriterierubriker matchade')
check('v3 har fortfarande elva kriterier', v3Kriterier.length === 11, `hittade ${v3Kriterier.length}`)
check('v3:s viktsumma är fortfarande 100',
  v3Kriterier.reduce((s, m) => s + Number(m[2]), 0) === 100,
  `summan är ${v3Kriterier.reduce((s, m) => s + Number(m[2]), 0)}`)

// ---- 2. DOMAREN KAN BARA NÅ EN RUBRIK --------------------------------------
// Filnamnsmönster räcker inte: en KOPIA av v4 som `matt-v4.md` matchade inte /rubri[kc]/
// och passerade. Katalogen har därför en FRUSEN fillista.
if (!existsSync(join(ROT, V3_KATALOG))) odombart(`${V3_KATALOG} saknas — domarens laddningsväg går inte att pröva`)
const refFiler = readdirSync(join(ROT, V3_KATALOG)).sort()
check('Ankare: domarens references-katalog kunde läsas', refFiler.length > 0, 'katalogen är tom')
check('references/ innehåller EXAKT den frusna fillistan',
  refFiler.length === 1 && refFiler[0] === 'eval-rubric.md',
  `hittade [${refFiler.join(', ')}] — varje ny fil i domarens laddningsväg är en potentiell andra måttstock`)

// SKILL.md får namnge exakt EN references-fil som rubrik. En tidigare kontroll prövade
// bara att strängen `references/eval-rubric.md` fanns KVAR någonstans — så en ompekning
// som degraderade v3 till "historik" i samma mening passerade.
// SKILL.md pekar legitimt på andra skills referensfiler (lighthouse-mål, blocklistor).
// Kontrollen är därför en FRUSEN pekarlista, inte "exakt en": varje NY references-pekare
// fäller. En ren kopia av v4 under valfritt filnamn — `references/matt-v4.md` — passerade
// en filnamnsbaserad kontroll, och ompekningen degraderade v3 till "historik" i samma mening.
const REF_PEKARE = ['eval-rubric.md', 'lighthouse-targets.md', 'copy-blocklist.md',
  'design-blocklist.md', 'premium-checklist.md', 'premium-bevis.md']
const refPekare = [...new Set([...skill.matchAll(/references\/([\w.-]+\.md)/g)].map((m) => m[1]))]
check('Ankare: SKILL.md namnger minst en references-fil', refPekare.length > 0, 'ingen pekare hittades')
check('SKILL.md pekar på v3-rubriken', refPekare.includes('eval-rubric.md'),
  'produktionsrubriken är inte längre namngiven')
const nyaPekare = refPekare.filter((f) => !REF_PEKARE.includes(f))
check('SKILL.md har INGEN ny references-pekare utöver den frusna listan', nyaPekare.length === 0,
  `nya pekare: [${nyaPekare.join(', ')}] — domaren kan ha fått en andra måttstock`)
check('Eval-skillen känner INTE till utkastet',
  !MARKORER.some((m) => skill.includes(m)),
  'eval-skillen refererar utkastet — domaren kan då läsa ett NOT_PRODUCTION-mått')

// ---- 3. INGEN KONSUMENT I HELA DET SPÅRADE TRÄDET --------------------------
let sparade
try {
  // --others --exclude-standard tar med OSPÅRADE men icke-ignorerade filer. Utan dem
  // vore vakten blind för en konsument som ännu inte committats — exakt det läge den körs i.
  sparade = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    { cwd: ROT, encoding: 'utf8' }).split('\0').filter(Boolean)
} catch {
  odombart('git ls-files misslyckades — sökmängden går inte att fastställa')
}
check('Ankare: det spårade trädet kunde räknas och är icke-trivialt', sparade.length >= 200,
  `endast ${sparade.length} spårade filer — en för liten sökmängd bevisar ingenting`)

// Ytor som MÅSTE finnas i sökmängden. En omdöpt yta FÄLLER; den filtreras aldrig bort.
const KRAVDA_YTOR = ['skills/', 'agents/', '.agents/', 'workflows/', 'scripts/', 'packs/',
  'docs/', 'config/', 'controller/', 'specs/', 'tests/', 'verify/', 'tools/', 'vendored-skills/']
const saknadeYtor = KRAVDA_YTOR.filter((y) => !sparade.some((f) => f.startsWith(y)))
if (saknadeYtor.length) odombart(`bevakad yta saknas ur det spårade trädet: ${saknadeYtor.join(', ')} — vakten kan inte bevisa frånvaro i en yta den inte ser`)
check('Ankare: samtliga fjorton bevakade ytor finns i sökmängden', true, '')

const barMarkor = (f) => {
  let innehall
  try { innehall = readFileSync(join(ROT, f), 'utf8') } catch { return false }
  return MARKORER.some((m) => innehall.includes(m))
}
// POSITIVT KONTROLLPROV: detektorn måste hitta de två tillåtna omnämnandena. Gör den inte
// det kan den inte hitta något alls, och "inga konsumenter" vore ett meningslöst besked.
const positivKontroll = TILLATNA.filter((f) => sparade.includes(f) && barMarkor(f))
if (positivKontroll.length !== TILLATNA.length) {
  odombart(`konsumentdetektorn hittade endast ${positivKontroll.length} av ${TILLATNA.length} KÄNDA omnämnanden (${TILLATNA.join(', ')}) — detektorn är obevisad och ett tomt resultat betyder ingenting`)
}
check('Ankare: konsumentdetektorn bevisad mot två kända omnämnanden', true, '')

const undantag = new Set([UTKAST, VAKTEN, ...TILLATNA])
const konsumenter = sparade.filter((f) => !undantag.has(f)).filter(barMarkor)
check('Utkastet har INGEN konsument i det spårade trädet', konsumenter.length === 0,
  `${konsumenter.join(', ')} refererar utkastet — ett NOT_PRODUCTION-mått är på väg in i drift`)

// Utkastet får aldrig flytta in i en laddningsväg. Prövas mot FILSYSTEMET, inte mot
// vaktens egen konstant (den kontrollen var en tautologi som aldrig kunde falla).
const utkastPaFelPlats = sparade.filter((f) => /eval-rubrik-v4|UTKAST/i.test(f) && f !== UTKAST && f !== VAKTEN)
check('Ingen kopia av utkastet ligger utanför docs/utkast/', utkastPaFelPlats.length === 0,
  `${utkastPaFelPlats.join(', ')}`)

// ---- 4. STÄMPELN — positionell, unik, kommentarsfri ------------------------
const forstaRader = utkast.split('\n').slice(0, 5)
const stampelRad = forstaRader.find((r) => /EXPERIMENTAL \/ CHALLENGER \/ NOT_PRODUCTION/.test(r))
check('Stämpeln står på någon av filens fem första rader', !!stampelRad,
  'statusstämpeln saknas i sidhuvudet — en stämpel längre ned kan motsägas av allt ovanför den')
check('Stämpeln förekommer exakt en gång',
  (utkast.match(/EXPERIMENTAL \/ CHALLENGER \/ NOT_PRODUCTION/g) || []).length === 1,
  'flera stämplar — då avgör läsaren vilken som gäller')
check('Versionsstämpeln är märkt UTKAST och står i sidhuvudet',
  forstaRader.some((r) => /Rubrikversion: `v4\.0\.0-UTKAST`/.test(r)), 'versionsstämpeln saknas i sidhuvudet')
const losPRODUCTION = [...utkast.matchAll(/PRODUCTION/g)].filter((m) => utkast.slice(Math.max(0, m.index - 4), m.index) !== 'NOT_')
check('Ordet PRODUCTION förekommer aldrig utan NOT_-prefix', losPRODUCTION.length === 0,
  `${losPRODUCTION.length} lösa förekomster — utkastet kan förklara sig gällande i löptext`)
check('Utkastet förklarar sig aldrig AKTIVERAD', !/\bAKTIVERAD\b/.test(utkast),
  'en aktiveringsförklaring i löptext — aktivering är S6, aldrig en rad i den här filen')
check('Stämpelbeviset står i SYNLIG text, inte i en HTML-kommentar',
  /EXPERIMENTAL \/ CHALLENGER \/ NOT_PRODUCTION/.test(utkast),
  'stämpeln finns bara i en kommentar — det som renderas till ingenting dokumenterar ingenting')

check('Utkastet skriver ut att det saknar konsument',
  /Ingen grind, ingen skill, ingen agent och inget workflow läser filen/.test(utkast),
  'placeringslagen saknas')
check('Utkastet skriver ut att v3 är produktionsmåttet',
  /Produktionsmåttet är och förblir/.test(utkast), 'v3:s företräde sägs inte ut')

// ---- 5. KONSTRUKTIONEN PRÖVAS DÄR DEN VERKAR -------------------------------
const sektion = (nr, nasta) => {
  const start = utkast.indexOf(`\n## ${nr}.`)
  const slut = utkast.indexOf(`\n## ${nasta}.`)
  if (start < 0 || slut < 0 || slut <= start) odombart(`sektion ${nr} kunde inte avgränsas mot ${nasta} — konstruktionen går inte att pröva där den verkar`)
  return utkast.slice(start, slut)
}
const s3 = sektion(3, 4), s4 = sektion(4, 5), s5 = sektion(5, 6)
const s6 = sektion(6, 7), s7 = sektion(7, 8), s8 = sektion(8, 9)
const s10 = sektion(10, 11)

// Tabellrader: toleranta mot blanksteg, och varje ID prövas mot en FRUSEN lista, så ett
// kriterium med avvikande formatering eller nytt ID-prefix inte kan smugglas in.
const rader = (sek, re) => [...sek.matchAll(re)]
// Raden matchas till radslut: tillämplighetskolumnen (som bär KK-/PK-bindningen) ligger
// EFTER tröskeln, och en match som stannade vid tröskeln gjorde m[0] blind för den.
// FÖRSTA CELLEN FÅNGAS SOM `[^`]+`, aldrig som ett ID-MÖNSTER: ett mönster gör varje rad
// med avvikande id osynlig, och en osynlig rad är en vakuös kontroll.
const KARN_RE = /^\|\s*`([^`]+)`\s*\|(.+?)\|\s*(\d+)\s*\|\s*(\d+)\s*\|(.*)$/gm
const karnRader = rader(s5, KARN_RE)
check('Ankare: kärnans kriterierader kunde läsas', karnRader.length > 0, 'inga rader matchade')
const karnIder = karnRader.map((m) => m[1])
check('Kärnan bär EXAKT de tolv frusna kriterie-id:na',
  karnIder.length === KARN_ID.length && KARN_ID.every((id, i) => karnIder[i] === id),
  `hittade [${karnIder.join(', ')}] — okänt id eller ändrad ordning`)
const namnFel = KARN_KRITERIER.filter(([id, namn], i) => !karnRader[i] || karnRader[i][1] !== id || !karnRader[i][2].includes(namn))
check('Varje kärnkriterium bär sitt frusna NAMN, inte bara sitt id', namnFel.length === 0,
  `avvikande: ${namnFel.map(([id, n]) => `${id} skulle bära "${n}"`).join(' · ')} — ett id kan behållas medan kriteriet tystas om`)
const karnSumma = karnRader.reduce((s, m) => s + Number(m[3]), 0)
check(`Kärnans viktsumma är ${KARN_SUMMA}`, karnSumma === KARN_SUMMA, `tabellen summerar till ${karnSumma}`)
check(`Kärnans summa ${KARN_SUMMA} står också i prosan`,
  new RegExp(`\\*\\*Summa: ${KARN_SUMMA} p\\.\\*\\*`).test(s5), 'prosan och tabellen kan glida isär')
check(`${KARN_SUMMA} är motiverat som medvetet icke-100`,
  new RegExp(`${KARN_SUMMA} poäng, inte 100\\. Avsiktligt`).test(utkast),
  'utan motiveringen ser summan ut som ett räknefel i stället för ett designval')

const paketRader = rader(s6, /^\|\s*`([^`]+)`\s*\|(.+?)\|\s*(\d+)\s*\|\s*(\d+)\s*\|(.*)$/gm)
check('Ankare: paketmodulens rader kunde läsas', paketRader.length > 0, 'inga rader matchade')
check('Paketmodulen bär exakt de tre frusna id:na',
  paketRader.map((m) => m[1]).join(',') === PAKET_ID.join(','), `hittade [${paketRader.map((m) => m[1]).join(', ')}]`)
const pNamnFel = PAKET_KRITERIER.filter(([id, namn], i) => !paketRader[i] || paketRader[i][1] !== id || !paketRader[i][2].includes(namn))
check('Varje paketkriterium bär sitt frusna NAMN', pNamnFel.length === 0,
  `avvikande: ${pNamnFel.map(([id, n]) => `${id} skulle bära "${n}"`).join(' · ')}`)
const paketSumma = paketRader.reduce((s, m) => s + Number(m[3]), 0)
check(`Paketmodulens viktsumma är ${PAKET_SUMMA}`, paketSumma === PAKET_SUMMA, `tabellen summerar till ${paketSumma}`)

const troskelFel = [...karnRader, ...paketRader].filter((m) => Number(m[4]) !== Math.ceil(Number(m[3]) * 0.7))
check('Varje PASS-tröskel är 70 % av vikten, avrundat uppåt', troskelFel.length === 0,
  `avvikande: ${troskelFel.map((m) => `${m[1]} vikt ${m[3]} tröskel ${m[4]}`).join(' · ')}`)
check('70 %-regeln i prosan stämmer med tabellernas trösklar',
  /PASS per kriterium = \*\*≥ 70 % av vikten\*\*/.test(s5),
  'prosan anger en annan tröskelregel än raderna — en av dem ljuger')

// §10:s viktlista HÄRLEDS ur tabellen. En handskriven lista är en drift-yta: den låg
// kvar på tio värden och 98 när kärnan gått till elva kriterier.
const forvantadLista = karnRader.map((m) => m[3]).join('/')
check('§10:s viktlista är identisk med kärntabellens vikter',
  s10.includes(forvantadLista),
  `§10 saknar den härledda listan ${forvantadLista} — prosan och tabellen har glidit isär`)

// Tillämplighetslägena prövas i §3:s TABELL, inte som fraser mot hela filen.
for (const lage of ['TILLÄMPLIG', 'EJ TILLÄMPLIG', 'ODÖMBAR']) {
  check(`Tillämplighetsläget \`${lage}\` definierat i §3:s tabell`,
    new RegExp(`^\\|\\s*\`${lage}\`\\s*\\|`, 'm').test(s3), 'läget saknas ur tabellen')
}
const odombarRad = /^\|\s*`ODÖMBAR`\s*\|(.+)$/m.exec(s3)
check('Ankare: §3:s ODÖMBAR-rad kunde läsas', !!odombarRad, 'raden hittades inte')
check('ODÖMBAR lämnar nämnaren OCH kapar bandet — utskrivet i sin egen rad',
  !!odombarRad && /[Rr]äknas bort/.test(odombarRad[1]) && /kapas|kapar/.test(odombarRad[1]),
  'ODÖMBAR:s verkan på nämnaren är odefinierad — kvar i nämnaren med noll poäng ÄR ett tyst avdrag')
const ejTillRad = /^\|\s*`EJ TILLÄMPLIG`\s*\|(.+)$/m.exec(s3)
check('EJ TILLÄMPLIG lämnar nämnaren — utskrivet i sin egen rad',
  !!ejTillRad && /[Rr]äknas bort/.test(ejTillRad[1]),
  'utan nämnarregeln är EJ TILLÄMPLIG bara ett annat ord för noll poäng')
check('Frånvaro läses aldrig som nej', /SAKNAS_I_V1/.test(s3) && /aldrig `EJ TILLÄMPLIG`/i.test(s3),
  'bakåtkompatibilitetslagen saknas ur §3')
check('En katastrof följer sitt kriteriums tillämplighet',
  /katastrof följer sitt kriteriums tillämplighet/i.test(s3),
  'en PK kan fällas för ett kriterium som lämnat mätningen')

// Hårdfelsidentiteterna prövas i §4:s TABELLER.
for (const id of ['HG-1', 'HG-2', 'HG-3', 'KK-1', 'KK-2', 'KK-3', 'PK-L1', 'PK-L2', 'PK-L3']) {
  check(`Hårdfelsidentiteten \`${id}\` står i §4:s tabeller`,
    new RegExp(`^\\|\\s*\`${id}\`\\s*\\|`, 'm').test(s4), 'identiteten saknas')
}
check('HG-3 är en DISKVALIFIKATION, inte ett avdrag',
  /`HG-3` är ingen FAIL utan en \*\*DISKVALIFIKATION\*\*/.test(s4),
  'vallgrandsvakten omformulerad till gradering — D8 är en diskvalifikation')
check('KK-3 bär Case B:s första fälla (paketläckage)',
  /Paketläckage/.test(s4) && /local-search\/NAP prominence/.test(s4),
  'kärnan saknar instrument för Case B:s frånvaro-villkor')
check('PK-L1 och PK-L3 är disjunkta mot KK-2',
  /hör till `KK-2` och fälls aldrig här/.test(s4) && /hör till `KK-2`, aldrig hit/.test(s4),
  'samma kontaktvärde kan fälla tre katastrofer samtidigt')
check('Anti-gömställeregeln är utskriven',
  /DOMSLUTET ÄR DET SÄMSTA AV DELARNA — aldrig ett medelvärde, aldrig en summa/.test(s4),
  'regeln som hindrar att en stark kärna döljer ett paketfel saknas — §7:s enda uttryckliga krav')
check('Operatorn "sämst" är definierad, inte överlämnad till bedömning',
  /bandordningen i §8 är en total ordning/.test(s4),
  'anti-gömställeregelns operator är odefinierad — då är gömstället tillbaka')

// Regeln mot dubbeldragning prövas MED sina utskrivna ägarskap, inte som slagord.
check('Dubbeldragningsregeln gäller även INOM kärnan',
  /ETT FEL DRAS PÅ EXAKT ETT STÄLLE — även inom kärnan/.test(s5),
  'regeln skriven bara för kärna↔paket — K1/K3 och K6/K12 överlappar då oreglerat')
check('K1/K3-avgränsningen bär S5:s ordalydelse',
  /primärhandlingens egen kedja/.test(s5) && /dubbelrapportera aldrig/i.test(s5),
  'reselinsen mäter primärhandlingen igen — mot den byggda grindens uttryckliga avgränsning')
check('K1:s kravnivå är ankrad med v3:s fem delkrav',
  /sticky header med synligt nummer/.test(s5) && /samma kravnivå, samma avdragslogik/.test(s5),
  'Case A:s defektkänslighet vilar på domarens dagsform utan v3:s uppräkning och likvärdighetsklausul')
check('Universell kontaktkonsistens finns i KÄRNTABELLEN',
  karnRader.some((m) => /Kontaktuppgifternas konsistens/.test(m[0]) && /KK-2/.test(m[0])),
  'kriteriet ligger inte i kärnan — en core-only-kund mäts då inte på om kontaktuppgifterna stämmer (regression mot v3)')
check('Kontaktkonsistensen har INTE glidit ned i paketmodulen',
  !paketRader.some((m) => /Kontaktuppgifternas konsistens/.test(m[0])),
  'kriteriet står i paketraden — då är regressionen återinförd med frasen kvar')
check('Strukturtrohet & paketläckage finns i KÄRNTABELLEN',
  karnRader.some((m) => /Strukturtrohet & paketläckage/.test(m[0]) && /KK-3/.test(m[0])),
  'Case B:s båda PASS-villkor saknar instrument vid paket: []')
check('Ett paket utan modul är ODÖMBAR, aldrig core-only',
  /Ett paket utan modul är `ODÖMBAR`, aldrig core-only/.test(s6),
  'en okänd paketflagga kan tyst mätas som core-only')
check('Kärna och paket summeras aldrig ihop', /ALDRIG summeras/.test(utkast), 'icke-summeringslagen saknas')

// Bandtrappan prövas RAD FÖR RAD i §8.
const bandRader = [...s8.matchAll(/^\|\s*`([A-ZÅÄÖ ]+)`\s*\|(.+?)\|/gm)].map((m) => [m[1].trim(), m[2]])
check('Ankare: bandtabellens rader kunde läsas', bandRader.length >= 5, `hittade ${bandRader.length}`)
const BAND = ['DISKVALIFICERAD', 'FAIL', 'ODÖMBAR', 'BETYDANDE OMARBETNING', 'ÅTGÄRDA', 'LANSERINGSKLAR']
check('Bandtabellen bär alla sex band i sämst-först-ordning',
  bandRader.map((r) => r[0]).join('|') === BAND.join('|'),
  `hittade [${bandRader.map((r) => r[0]).join(', ')}] — DISKVALIFICERAD saknades tidigare helt ur trappan`)
check('Bandordningen är utskriven som en TOTAL ordning',
  BAND.every((b) => new RegExp(`\`${b}\``).test(s8)) && /TOTAL ordning, sämst först/i.test(s8),
  'ordningen saknas — "det sämsta av delarna" blir då odefinierat')
check('Företrädesregeln "första matchande raden gäller" är utskriven',
  /FÖRSTA MATCHANDE RADEN UPPIFRÅN GÄLLER/.test(s8),
  'överlappande band utan företrädesregel — noll FAIL matchar både ÅTGÄRDA och LANSERINGSKLAR')
const odombarBand = bandRader.find((r) => r[0] === 'ODÖMBAR')
check('ODÖMBAR-bandet säger i SIN EGEN RAD att det aldrig blir grönt',
  !!odombarBand && /blir aldrig grönt/.test(odombarBand[1]),
  'repots dyraste lärdom stod som fras i en annan sektion medan bandraden gjorde ODÖMBAR grön')
check('ÅTGÄRDA-bandet är nedåt avgränsat (1–2 FAIL)',
  bandRader.some((r) => r[0] === 'ÅTGÄRDA' && /1–2/.test(r[1])),
  '"högst 2 FAIL" rymmer noll FAIL och överlappar LANSERINGSKLAR')

check('Case A:s diagnostik under v4 är definierad', /kriterievis statusöverensstämmelse/.test(s7),
  '§26:s numeriska totaljämförelse saknar motsvarighet i v4 och lämnas outredd')
check('Ingen omräkningstabell v3↔v4',
  /Ingen omräkningstabell v3↔v4 finns, får finnas eller kommer att tas fram/.test(s7),
  'förbudet mot omräkning saknas')

// ---- 6. AKTIVERINGEN ÄR INGET DENNA SKIVA UTFÖR ----------------------------
check('Aktiveringen är bunden till S6 + HÖGRISK', /egen \*\*HÖGRISK\*\*-ceremoni/.test(utkast),
  'aktiveringsceremonin saknas')
check('Baselineomklippet namnger den faktiska filen',
  /tests\/fixtures\/eval-baseline\.md/.test(utkast), 'aktiveringsvillkoret pekar inte på den verkliga baselinen')
check('Backfill-priset är utskrivet', /[Bb]ackfill av kontrakten/.test(utkast),
  'aktiveringens verkliga pris (v1-profiler blir ODÖMBARA) sägs inte ut')
check('Utkastet redovisar sin egen evidensbrist',
  /Vikterna är förslag, inte mätningar/.test(s10), 'evidensärligheten saknas')
check('Falsifieringen är namngiven (Case A + Case B)',
  /Case A/.test(s10) && /Case B/.test(s10), 'backtesterna som ska falsifiera konstruktionen saknas')

// ---- Verdikt ---------------------------------------------------------------
for (const p of passes) console.log(`PASS: ${p}`)
if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`)
  console.error(`\nRESULTAT: FAIL — ${fails.length} av ${passes.length + fails.length} kontroller föll`)
  process.exit(1)
}
console.log(`\nRESULTAT: PASS — ${passes.length}/${passes.length} utkastvakter (${sparade.length} spårade filer skannade efter konsumenter)`)
process.exit(0)
