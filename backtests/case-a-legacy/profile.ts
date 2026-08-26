// CASE A-LEGACY — KOMPATIBILITETSVÄGEN (masterplanen §26, `A-GAP-3`).
//
// §26 Case A kräver att den lokala fixturen körs genom TVÅ vägar:
// *"through: compatibility route; new universal+local composition"*. `case-a-lokal/` är
// den andra. Detta är den FÖRSTA.
//
// VAD DEN PRÖVAR. Ett kundrepo byggt före Site Quality Contract v2 bär en profil på
// `v1.1.0` UTAN v2-fältgrupperna. Bakåtkompatibilitetslagen säger att en sådan profil är
// GILTIG, och — det svåraste ledet — att **saknade v2-fält läses som `SAKNAS_I_V1`, aldrig
// som tomt, falskt eller noll.** En frånvaro är okänd, inte ett negativt svar. En konsument
// som läser ett saknat `statelesshet.hallerTillstand` som `false` uppfinner ett påstående
// kunden aldrig gjort — och det påståendet är dessutom det GYNNSAMMA, vilket gör felet
// tyst i stället för högljutt.
//
// INGEN VERKLIG ORGANISATION. Samma syntetiska kund som `case-a-lokal/`, medvetet — så att
// skillnaden mellan de två fixturerna är KONTRAKTSVERSIONEN och ingenting annat. Vore
// kunderna olika gick det inte att veta om ett utfall berodde på versionen eller på datan.

export const profile = {
  // Stämpeln doctor #5 läser. Samma MAJOR som kontraktets v1.3.0 och 1.1.0 ≤ 1.3.0,
  // alltså kompatibel enligt vaktens EGEN regel — inget undantag behövs.
  profilKontraktVersion: 'v1.1.0',

  // ── Samtliga v1.1.0-fält, oförändrade ──────────────────────────────────────
  primaraktion: {
    typ: 'offert' as const,
    etikett: 'Få kostnadsfri offert',
  },
  gate1Test:
    'offertformulär (≤5 fält) → lead levererad till LEAD_TO_EMAIL; ' +
    'tel:-länk ringer upp 018-14 22 90 från mobil',

  kvitton: [
    { typ: 'F-skatt', belagg: 'registrerad, belagt i kundens underlag', attribution: 'Ekbergs Rör AB' },
    { typ: 'ansvarsförsäkring', belagg: 'försäkringsbrev, giltigt', attribution: 'Ekbergs Rör AB' },
    { typ: 'omdömen', belagg: '4,6 av 5 baserat på 38 omdömen, Google', attribution: 'Ekbergs Rör AB' },
  ],

  schemaTyp: ['Organization', 'Plumber'],
  seoLage: 'lokal' as const,
  juridikflaggor: [] as string[],

  rostregister: {
    adjektiv: ['rakt på sak', 'yrkesstolt', 'utan säljprat'],
    exempelmeningar: [
      'Vi kommer när vi säger att vi kommer.',
      'Du får ett pris innan vi börjar.',
    ],
    vernacular: ['stambyte', 'relining', 'vattenlås', 'avstängningsventil'],
  },
  branschAntislop: ['helhetslösningar', 'skräddarsydda koncept', 'i en klass för sig'],
  motionNiva: 'subtil' as const,

  // `noindexCutover` är VALFRITT redan i v1.1.0 och utelämnas här. Det är en frånvaro av
  // ett valfritt v1-fält — en annan sak än en frånvaro av ett v2-fält, och den skillnaden
  // är precis vad läsaren måste hålla isär.

  // ── INGA v2-fältgrupper ────────────────────────────────────────────────────
  // `paket`, `anvandare`, `toppuppgifter`, `kapaciteter`, `interventionsbeslut`,
  // `obligatoriskaResor`, `forbjudnaPastaenden`, `kvalitetsnivaer`, `integrationer`,
  // `framgangsmatt`, `olostaOkandheter`, `godkannandeTillstand`, `belaggspekare`,
  // `statelesshet` och `katalogVersion` SAKNAS — det är fixturens hela poäng.
  //
  // De är inte utelämnade av slarv och får aldrig backfillas här. Migrering är enligt
  // lagens tredje led en EGEN handling som stack-builder utför ur briefen — aldrig tyst
  // under ett bygge, aldrig genom att gissa värden.

  testklient: true,
}
