// CASE A — SYNTETISK LOKALFIXTUR (masterplanen §26).
//
// Site Quality Contract v2 för den påhittade testklienten Ekbergs Rör AB.
// INGEN VERKLIG ORGANISATION. Byggs alltid testklient: true + NEXT_PUBLIC_NOINDEX=1.
//
// Fixturens uppgift är BEVARANDE: lokal-se-semantiken och defektkänsligheten ska överleva
// kärna/paket-delningen. Varje fält är härlett ur backtests/case-a-lokal/research.md.

export const profile = {
  profilKontraktVersion: 'v1.2.0',
  katalogVersion: 'v1',

  paket: ['lokal-se'],

  primaraktion: {
    typ: 'offert' as const,
    etikett: 'Få kostnadsfri offert',
  },
  gate1Test:
    'offertformulär (≤5 fält) → lead levererad till LEAD_TO_EMAIL; ' +
    'tel:-länk ringer upp 018-14 22 90 från mobil',

  anvandare: [
    'Villaägare 45–70 (störst volym)',
    'Bostadsrättsföreningars styrelser (färre, större uppdrag)',
    'Akutfall som ringer utan att jämföra',
  ],

  toppuppgifter: [
    'Få kontakt snabbt vid akut läcka',
    'Begära offert på ett planerat arbete',
    'Se att företaget är behörigt',
    'Se vad ett stambyte kostar',
  ],

  obligatoriskaResor: [
    {
      namn: 'Begär offert',
      borjar: 'hero-CTA eller ortssidans CTA',
      slutar: 'lead i inkorgen + kvittosida',
      primar: true,
    },
    {
      namn: 'Ring vid akut läcka',
      borjar: 'sticky header, flytande ringknapp på mobil',
      slutar: 'samtal kopplat från tel:-länk',
      primar: false,
    },
    {
      namn: 'Bekräfta behörighet',
      borjar: 'kvittosektion nära hero',
      slutar: 'Säker Vatten-auktorisationen läsbar och attribuerad',
      primar: false,
    },
  ],

  kapaciteter: [
    { id: 'KAP-PRIMARHANDLING', status: 'VALIDATING' },
    { id: 'KAP-LOKAL-SEO', status: 'VALIDATING' },
    { id: 'KAP-SCHEMA', status: 'VALIDATING' },
    { id: 'KAP-KVITTON', status: 'VALIDATING' },
    { id: 'KAP-BILD', status: 'VALIDATING' },
    { id: 'KAP-PRESTANDA', status: 'VALIDATING' },
  ],

  interventionsbeslut: 'NY SAJT' as const,

  kvitton: [
    { typ: 'F-skatt', varde: 'registrerad', attribution: 'anges som registrering, aldrig som kvalitetsmärke' },
    { typ: 'certifikat', varde: 'Säker Vatten-auktorisation', attribution: 'certifikatnummer + utfärdare anges' },
    { typ: 'utbildning', varde: 'VVS-ingenjör, Yrkeshögskolan i Uppsala, 2009', attribution: 'redovisas som UTBILDNING, aldrig som utfall' },
    { typ: 'omdomen', varde: '4,7 · exakt 118 omdömen · Google', attribution: 'betyg + exakt antal + plattform tillsammans, aldrig betyget ensamt' },
    { typ: 'forsakring', varde: 'ansvarsförsäkring, namngivet bolag', attribution: 'bolagsnamn anges' },
    { typ: 'portfolio', varde: '9 dokumenterade projekt', attribution: 'före/efter kräver publiceringsgodkännande' },
  ],

  forbjudnaPastaenden: [
    'Dygnet-runt-jour — kunden har ingen (research L4)',
    'Certifieringar utöver Säker Vatten',
    'Arbete i orter utan belagt uppdrag — endast Uppsala och Storvreta är belagda',
    'Att svarstidslöftet är en garanti Nortropic eller sajten utfärdar; det är kundens eget citat',
    'Fast pris på stambyte — ingen prisuppgift är belagd',
  ],

  schemaTyp: 'Plumber',
  seoLage: 'lokal' as const,

  juridikflaggor: [] as string[],

  rostregister: {
    adjektiv: ['rakt på sak', 'trygg', 'osentimental'],
    exempelmeningar: [
      'Vi ringer tillbaka samma dag. Alltid.',
      'Ett stambyte är inte en produkt, det är åtta veckor i någons hem.',
    ],
    vernacular: ['stamledning', 'avstängningsventil', 'relining', 'fuktindikering'],
  },
  branschAntislop: ['proffsig', 'kvalitetsmedveten', 'marknadsledande', 'trygg och säker'],
  motionNiva: 'subtil' as const,

  kvalitetsnivaer: { niva: 'STANDARD' as const },

  integrationer: [
    { tjanst: 'Google Företagsprofil', roll: 'lokal närvaro', extern: true, hallerTillstand: true,
      lage: 'ingen-sidintegration' as const, personuppgifter: false, samtyckeKravs: false },
    // INBÄDDNING: kartan gör en tredjepartsförfrågan FRÅN sajten och kan sätta kakor.
    // Gate 6:s checklista §2 nämner just detta fall. Beslutet är människans; fälten finns
    // för att hon ska se att beslutet behöver fattas.
    { tjanst: 'Google Maps (kartinbäddning)', roll: 'vägbeskrivning på kontaktsidan', extern: true, hallerTillstand: true,
      lage: 'inbaddning' as const, personuppgifter: true, samtyckeKravs: true },
  ],

  framgangsmatt: [
    'Offertförfrågningar via sajten: 15/kvartal i dag → 30 (kundens mål)',
    'Färre samtal som bara frågar var verkstaden ligger',
  ],

  olostaOkandheter: [
    { fraga: 'Får de 118 omdömena citeras med namn + ort?', verklighetsklass: 'DOMÄNEXPERT' as const },
    { fraga: 'Publiceringsgodkännande för de 11 före/efter-bilderna?', verklighetsklass: 'DOMÄNEXPERT' as const },
  ],

  godkannandeTillstand: {
    godkandAv: 'SYNTETISK FIXTUR — ingen mänsklig godkännare',
    datum: '2026-08-26',
    briefSha: 'SAKNAS — ingen brief genererad; fixturen är research-nivå',
  },

  belaggspekare: {
    interventionsbeslut: 'research.md §2 + §7 — ingen befintlig sajt att förbättra; kunden har enbart en Facebook-sida, och bildmaterialet räcker för ett nytt bygge',
    primaraktion: 'research.md §4 — 63/78 telefon, 15/78 formulär; kundens önskan flyttar volym till offert',
    seoLage: 'research.md §5 + L1 — Uppsala 71/78, Storvreta 7/78, belagt med fakturaunderlag',
    paket: 'research.md §15 — paketet BELAGT, inte antaget; kontrollrad pack=lokal-se',
    kvitton: 'research.md §6 — betyg + EXAKT antal + plattform per paketmodulens skärpning',
    schemaTyp: 'research.md §15 — LocalBusiness-subtypen Plumber',
    statelesshet: 'research.md §9 + L3 — ingen bokningsdatabas, ingen inloggning',
  },

  statelesshet: { hallerTillstand: false },

  testklient: true,
}
