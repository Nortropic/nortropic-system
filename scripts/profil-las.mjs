// BAKÅTKOMPATIBILITETSLÄSAREN — lagens andra led som KOD i stället för prosa.
//
// Site Quality Contract v2:s bakåtkompatibilitetslag, led 2, lyder:
//
//   > Saknade v2-fält läses som `SAKNAS_I_V1` — aldrig som tomt, falskt eller noll.
//   > En frånvaro är okänd, inte ett negativt svar. En konsument som behandlar ett
//   > saknat fält som `false` uppfinner ett påstående kunden aldrig gjort.
//
// Lagen stod bara i `skills/nortropic-stack/SKILL.md`. **Ingenting hindrade en konsument
// från att bryta den**, och felet är av det tysta slaget: `profil.statelesshet?.hallerTillstand`
// ger `undefined` som blir `false` i varje boolesk kontroll, och `false` är dessutom det
// GYNNSAMMA svaret — "kunden håller inget tillstånd" låter som ett godkännande. Ett fel
// som ser ut som ett godkännande upptäcks inte av den som hoppas att allt är bra.
//
// LÄSAREN ÄR AVSIKTLIGT OBEKVÄM. `las()` returnerar aldrig ett värde direkt utan alltid
// `{ status, varde }`, och `status` måste läsas. Det gör det omöjligt att av misstag
// använda en frånvaro som ett svar — man måste skriva ut vad man menar.
//
// TRE UTFALL, och det tredje är det som gör läsaren ärlig:
//   FUNNET       — fältet finns; `varde` är dess värde
//   SAKNAS_I_V1  — fältet är ett v2-fält och profilen är äldre än v2. OKÄNT, aldrig nej
//   SAKNAS       — fältet borde finnas i den här versionen men gör det inte. Ett FEL

export const V1_FALT = [
  'profilKontraktVersion', 'primaraktion', 'gate1Test', 'kvitton', 'schemaTyp',
  'seoLage', 'juridikflaggor', 'rostregister', 'branschAntislop', 'motionNiva',
  'noindexCutover',
]
// `noindexCutover` är VALFRITT redan i v1.1.0. En frånvaro av ett valfritt v1-fält är
// inte samma sak som en frånvaro av ett v2-fält, och läsaren får inte blanda ihop dem.
export const V1_VALFRIA = ['noindexCutover']

export const FUNNET = 'FUNNET'
export const SAKNAS_I_V1 = 'SAKNAS_I_V1'
export const SAKNAS = 'SAKNAS'
export const ODOMBAR = 'ODÖMBAR'

const semver = (v) => {
  const m = /^v(\d+)\.(\d+)\.(\d+)$/.exec(String(v || ''))
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null
}

/**
 * Är profilen äldre än v2-fältgrupperna? De kom i v1.2.0.
 * Returnerar null när stämpeln inte går att tolka — och en otolkbar stämpel får ALDRIG
 * behandlas som "gammal", för då blir varje saknat fält bortförklarat som legacy.
 */
export function foreV2(profilKontraktVersion) {
  const s = semver(profilKontraktVersion)
  if (!s) return null
  const [maj, min] = s
  if (maj !== 1) return null // annan MAJOR — utanför den här lagens räckvidd
  return min < 2
}

/**
 * Läs ett fält ur en profil enligt lagen.
 *
 * @param {object} profil          - den inlästa profilen
 * @param {string} falt            - fältnamnet
 * @param {string} version         - profilKontraktVersion-stämpeln
 * @returns {{status: string, varde: any, skal: string}}
 */
export function las(profil, falt, version) {
  if (!profil || typeof profil !== 'object') {
    return { status: ODOMBAR, varde: undefined, skal: 'profilen är inte ett objekt — ingenting går att läsa' }
  }
  const finns = Object.prototype.hasOwnProperty.call(profil, falt)
  if (finns) return { status: FUNNET, varde: profil[falt], skal: 'fältet finns i profilen' }

  const gammal = foreV2(version)
  if (gammal === null) {
    return { status: ODOMBAR, varde: undefined,
      skal: `kontraktsstämpeln "${version}" går inte att tolka — en otolkbar version får aldrig bortförklara ett saknat fält som legacy` }
  }
  if (V1_FALT.includes(falt)) {
    // Ett v1-fält som saknas är ett FEL, oavsett version — utom de uttryckligen valfria.
    if (V1_VALFRIA.includes(falt)) {
      return { status: SAKNAS_I_V1, varde: undefined,
        skal: `${falt} är valfritt redan i v1 — frånvaron är ett giltigt tillstånd, inte ett negativt svar` }
    }
    return { status: SAKNAS, varde: undefined, skal: `${falt} är ett obligatoriskt v1-fält och saknas — profilen är trasig, inte gammal` }
  }
  if (gammal) {
    return { status: SAKNAS_I_V1, varde: undefined,
      skal: `${falt} är ett v2-fält och profilen är ${version} — frånvaron är OKÄND, aldrig ett nej` }
  }
  return { status: SAKNAS, varde: undefined,
    skal: `${falt} saknas i en v${semver(version)[0]}.${semver(version)[1]}-profil som borde bära det — ett fel, inte en versionsskillnad` }
}

/**
 * Den enda tillåtna vägen från ett läst fält till ett booleskt svar.
 *
 * `las()` ensam räcker inte: en konsument kan skriva `las(...).varde === true` och få
 * `false` för en frånvaro, vilket är exakt det lagen förbjuder. Den här funktionen vägrar
 * svara på en okänd frånvaro och tvingar anroparen att hantera det tredje utfallet.
 *
 * @returns {true|false|'OKÄNT'}
 */
export function jaNejOkant(last) {
  if (!last || typeof last !== 'object') return 'OKÄNT'
  if (last.status !== FUNNET) return 'OKÄNT'
  if (typeof last.varde !== 'boolean') return 'OKÄNT'
  return last.varde
}
