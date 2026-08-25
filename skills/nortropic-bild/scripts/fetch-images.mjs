/**
 * Nortropic — bildanskaffning (nod 5, körs EN gång per bygge)
 *
 *   för varje slot utan kundfoto:
 *     1. biblioteksuppslag        träff → kopiera ref-versionen till ref/, 0 kr
 *     2. generering               miss  → N kandidater mot klassens ankare
 *     3. normalisering            ALLA kandidater → ref-versioner (samma skala)
 *     4. gallring                 score.mjs på normaliserat, högsta godkända vinner
 *     5. cacheskrivning           vinnarens REF-version → biblioteket + projektets ref/
 *
 * Trestegsordningen är poängen: score-måtten är exponeringskänsliga, så gallringen
 * körs EFTER normaliseringen; biblioteket lagrar ref-versionen (presetagnostisk —
 * samma post tjänar en duotone-kund och en ljus-kund).
 *
 * Degraderar ALLTID mjukt: saknad nyckel, API-fel eller noll godkända
 * kandidater ger SVG-platshållare och en rad i rapporten. Blockerar aldrig.
 *
 * Körs från byggrepots rot (skriptet bor i skillen — BYGGTID kopieras,
 * ANSKAFFNINGSTID gör det inte; models.json löses relativt skriptets EGEN fil):
 *   node <nortropic-bild-skill-bas>/scripts/fetch-images.mjs   (skill-bas = katalogen skillen laddades från; repo-nativa skills/nortropic-bild/ — aldrig en ambient installkopia) --slots=SLOTS.json
 *   node ... fetch-images.mjs --dry-run          visa plan, generera inget
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { homedir, tmpdir } from 'os'
import sharp from 'sharp'
import { score } from './score.mjs'
import { normalise } from './treatment.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const LIB = process.env.NORTROPIC_BILDBIBLIOTEK
  ?? join(homedir(), 'Workflow', 'bildbibliotek')
const REF = 'public/images/ref'
const KANDIDATER = 4

// ── Konfiguration ────────────────────────────────────────────

const models = JSON.parse(readFileSync(join(HERE, '..', 'references', 'models.json'), 'utf8'))

/** Slot-prefix → biblioteksklass + modellroll. Uttömmande. */
const SLOT_KLASS = {
  hero:   { klasser: ['miljo', 'yta'],    roll: 'hero',    genererbar: true  },
  env:    { klasser: ['miljo', 'yta'],    roll: 'stod',    genererbar: true  },
  detail: { klasser: ['yta', 'grafisk'],  roll: 'textur',  genererbar: true  },
  proof:  { klasser: [],                  roll: null,      genererbar: false },
  people: { klasser: [],                  roll: null,      genererbar: false },
  // og finns inte längre som slot — app/opengraph-image.tsx (Next-konventionen) äger OG-bilden.
}

/** Preset → tillåtna motivklasser. `ljus` får aldrig generera produkten. */
const PRESET_SPARR = {
  duotone:    { tillatna: ['miljo', 'yta', 'grafisk'] },
  dokumentar: { tillatna: ['miljo', 'yta', 'grafisk'] },
  ljus:       { tillatna: ['yta', 'grafisk'],
                skal: 'produkten (bukett, frisyr, tårta, djur) får aldrig genereras — den ÄR påståendet' },
}

// ── Bibliotek ────────────────────────────────────────────────

function lasManifest() {
  const p = join(LIB, 'manifest.json')
  if (!existsSync(p)) return { poster: [], ankare: {} }
  return JSON.parse(readFileSync(p, 'utf8'))
}

function skrivManifest(m) {
  mkdirSync(LIB, { recursive: true })
  writeFileSync(join(LIB, 'manifest.json'), JSON.stringify(m, null, 2))
}

/**
 * Urval, inte slumpdragning. Poängsätter på klass, orientering och luft
 * så att en hero med rubrik uppe till vänster får en bild med luft där.
 */
function slaIBibliotek(manifest, slot, anvanda) {
  const spec = SLOT_KLASS[slot.prefix]
  const kandidater = manifest.poster.filter(p =>
    spec.klasser.includes(p.klass) &&
    !anvanda.has(p.id) &&
    (!slot.luft || !p.luft || p.luft === slot.luft) &&
    (slot.prefix !== 'people'))

  if (!kandidater.length) return null

  const poang = p =>
    (p.klass === spec.klasser[0] ? 2 : 0) +
    (p.luft === slot.luft ? 2 : 0) +
    (p.orientering === (slot.prefix === 'people' ? 'portratt' : 'landskap') ? 1 : 0) +
    (p.anvandningar ? -Math.min(p.anvandningar, 3) * 0.5 : 0)   // sprid användningen

  return kandidater.sort((a, b) => poang(b) - poang(a))[0]
}

// ── Generering ───────────────────────────────────────────────

/** fal:s image_urls kan inte läsa lokala sökvägar — ankarbilden (lokal ref-fil)
 *  skickas som data-URI. Utan detta bryter ankringsmekaniken tyst.
 *  GRÄNS: skalas till max 1024 px längsta sidan + JPEG q80 före base64 —
 *  ankaret styr STIL, inte upplösning; full storlek är bara payload-vikt,
 *  och den skickas PER ANROP, inte per körning. */
async function tillDataUri(fil) {
  const bin = await sharp(fil)
    .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer()
  return `data:image/jpeg;base64,${bin.toString('base64')}`
}

async function generera(roll, prompt, ankarbild, n = KANDIDATER) {
  const key = process.env.FAL_KEY
  if (!key) throw new Error('FAL_KEY saknas')

  const r = models.roller[roll]
  const body = {
    prompt,
    num_images: n,
    ...(ankarbild && existsSync(ankarbild) ? { image_urls: [await tillDataUri(ankarbild)] } : {}),
  }

  const res = await fetch(`${models.endpoint}${r.modell}`, {
    method: 'POST',
    headers: { 'Authorization': `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`fal ${res.status}: ${await res.text()}`)

  const data = await res.json()
  const urls = (data.images ?? []).map(i => i.url)
  if (!urls.length) throw new Error('fal returnerade inga bilder')

  // Hämta hem OMEDELBART — leverantören garanterar inte lagring.
  const filer = []
  for (const [i, url] of urls.entries()) {
    const bin = Buffer.from(await (await fetch(url)).arrayBuffer())
    const f = join(tmpdir(), `kandidat-${Date.now()}-${i}.jpg`)
    writeFileSync(f, bin)
    filer.push(f)
  }
  return filer
}

// ── Kedjan per slot ──────────────────────────────────────────

async function fyllSlot(slot, ctx) {
  const spec = SLOT_KLASS[slot.prefix]
  if (!spec) {
    return { slot: slot.id, kalla: 'platshallare', atgard: 'SVG',
             skal: `okänt slot-prefix "${slot.prefix}" — giltiga: ${Object.keys(SLOT_KLASS).join(', ')}` }
  }

  if (slot.status === 'kundfoto') return { slot: slot.id, kalla: 'kundfoto', atgard: 'ingen' }

  // 1. Bibliotek — posterna är ref-versioner, kopieras direkt till projektets ref/
  const traff = slaIBibliotek(ctx.manifest, slot, ctx.anvanda)
  if (traff) {
    ctx.anvanda.add(traff.id)
    traff.anvandningar = (traff.anvandningar ?? 0) + 1
    copyFileSync(traff.fil, join(REF, `${slot.id}__${traff.id}.jpg`))
    return { slot: slot.id, kalla: `bibliotek:${traff.id}`, atgard: 'ref-version kopierad' }
  }

  // 2. Får den genereras?
  if (!spec.genererbar) {
    return { slot: slot.id, kalla: 'platshallare', atgard: 'SVG',
             skal: `${slot.prefix} genereras aldrig — claim-regeln` }
  }
  const sparr = PRESET_SPARR[ctx.preset]
  const klass = spec.klasser.find(k => sparr.tillatna.includes(k))
  if (!klass) {
    return { slot: slot.id, kalla: 'platshallare', atgard: 'SVG',
             skal: sparr.skal ?? `preset ${ctx.preset} tillåter ingen klass för ${slot.prefix}` }
  }

  if (ctx.dryRun) {
    return { slot: slot.id, kalla: 'skulle genereras', atgard: `${spec.roll} · klass ${klass}` }
  }

  // 3. Generera → normalisera ALLA → gallra (trestegsordningen)
  try {
    const ankare = ctx.manifest.ankare?.[klass] ?? null
    const prompt = byggPrompt(klass, ctx)
    const kandidater = await generera(spec.roll, prompt, ankare)

    // Normalisera FÖRE score — måtten är exponeringskänsliga, alla bedöms mot samma skala
    const refKandidater = []
    for (const [i, f] of kandidater.entries()) {
      const rf = join(tmpdir(), `ref-kandidat-${Date.now()}-${i}.jpg`)
      await (await normalise(f)).jpeg({ quality: 95 }).toFile(rf)
      refKandidater.push(rf)
    }

    const bedomda = []
    for (const rf of refKandidater) bedomda.push({ fil: rf, ...(await score(rf, slot.prefix)) })
    const godkanda = bedomda.filter(b => b.godkand).sort((a, b) => b.poang - a.poang)

    if (!godkanda.length) {
      return { slot: slot.id, kalla: 'platshallare', atgard: 'SVG',
               skal: `alla ${kandidater.length} kandidater kasserades av gallringen (normaliserade)` }
    }

    // 4. Vinnarens REF-version → projektets ref/ + biblioteket
    const vinnare = godkanda[0]
    const mal = join(REF, `${slot.id}__genererad.jpg`)
    copyFileSync(vinnare.fil, mal)

    const id = `${klass}-${String(ctx.manifest.poster.length + 1).padStart(3, '0')}`
    const libFil = join(LIB, `${id}.jpg`)
    mkdirSync(LIB, { recursive: true })
    copyFileSync(vinnare.fil, libFil)
    ctx.manifest.poster.push({
      id, klass, kalla: 'genererad', stadie: 'ref',
      modell: models.roller[spec.roll].modell,
      orientering: slot.prefix === 'people' ? 'portratt' : 'landskap',
      luft: slot.luft ?? null, fil: libFil, anvandningar: 1,
      skapad: new Date().toISOString().slice(0, 10),
    })
    // Första godkända bilden i en klass blir klassens ankare (ref-version).
    if (!ctx.manifest.ankare[klass]) ctx.manifest.ankare[klass] = libFil

    return { slot: slot.id, kalla: `genererad:${models.roller[spec.roll].modell}`,
             atgard: `vald av ${kandidater.length}, normaliserad, cachad som ${id}`, poang: vinnare.poang }

  } catch (e) {
    return { slot: slot.id, kalla: 'platshallare', atgard: 'SVG', skal: `generering föll: ${e.message}` }
  }
}

function byggPrompt(klass, ctx) {
  const bas = {
    miljo: 'Industrial facility exterior at winter dusk, northern Sweden. Low camera angle, wide shot, subject small in frame. Backlit, heavy overcast, no direct sun. Empty sky occupying upper third.',
    yta:   'Close texture study: weathered concrete surface, raking sidelight, shallow relief, no objects.',
    grafisk: 'Abstract technical drawing fragment, thin uniform linework on flat ground, orthographic, no annotations.',
  }[klass]

  const negativ = 'readable text, signage, logos, brand marks, people, faces, ' +
    'close-up machinery, legible technical components, lens flare, HDR, oversaturation, watermark'

  return `${bas} Flat overcast light, minimal detail resolution — must read clearly at 64px.\n` +
         `Bransch: ${ctx.bransch}.\nNegative: ${negativ}`
}

// ── CLI ──────────────────────────────────────────────────────

const args = Object.fromEntries(process.argv.slice(2)
  .map(a => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? true]))

// win32: naiva `file://${argv[1]}` matchar aldrig (backslash-sökväg) — pathToFileURL krävs
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const slots = JSON.parse(readFileSync(args.slots ?? 'SLOTS.json', 'utf8'))
  mkdirSync(REF, { recursive: true })

  const ctx = {
    manifest: lasManifest(),
    anvanda: new Set(),
    preset: slots.bildbehandling ?? 'dokumentar',
    bransch: slots.bransch ?? 'lokal tjänsteverksamhet',
    dryRun: !!args['dry-run'],
  }

  const rapport = []
  for (const slot of slots.slots) rapport.push(await fyllSlot(slot, ctx))

  if (!ctx.dryRun) skrivManifest(ctx.manifest)

  console.log(`\nBildanskaffning — preset: ${ctx.preset} · spår: ${slots.bildspar}\n`)
  for (const r of rapport) {
    console.log(`  ${r.slot.padEnd(12)} ${r.kalla.padEnd(34)} ${r.atgard}${r.skal ? `\n${' '.repeat(16)}↳ ${r.skal}` : ''}`)
  }
  const platshallare = rapport.filter(r => r.kalla === 'platshallare')
  console.log(`\n  ${rapport.length} slots · ${platshallare.length} platshållare kvar`)
  writeFileSync('BILDRAPPORT.json', JSON.stringify(rapport, null, 2))
}

export { fyllSlot, slaIBibliotek, byggPrompt, SLOT_KLASS, PRESET_SPARR }
