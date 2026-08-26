// CASE E — SYNTETISK STANDARDFIXTUR (masterplanen §26, `§26-GAP-1`).
//
// Site Quality Contract v2 för den påhittade testklienten Bergqvists Fönsterputs AB.
// INGEN VERKLIG ORGANISATION. Byggs alltid testklient: true + NEXT_PUBLIC_NOINDEX=1.
//
// FIXTURENS UPPGIFT ÄR ATT VARA HELT VANLIG. §20 kräver att en STANDARD-leverans inte
// drar på sig extra ceremoni utan namngivet skäl. Varje avvikelse, varje ägarfråga och
// varje extra grind som uppstår här är ett FYND — inte en försiktighetsåtgärd.
// Varje fält är härlett ur backtests/case-e-standard/research.md.

export const profile = {
  profilKontraktVersion: 'v1.2.0',
  katalogVersion: 'v1',

  paket: ['lokal-se'],

  primaraktion: {
    typ: 'ring' as const,
    etikett: 'Ring 019-55 66 77',
  },
  gate1Test:
    'tel:-länk ringer upp 019-55 66 77 från mobil; ' +
    'offertformulär (≤5 fält) → lead levererad till LEAD_TO_EMAIL som sekundär väg',

  anvandare: [
    'Villaägare 40–75 (störst volym)',
    'Lägenhetsinnehavare',
    'Mindre kontor med abonnemang',
  ],

  toppuppgifter: [
    'Få en tid bokad eller ett pris',
    'Se vilka områden som körs',
    'Bedöma pålitlighet',
  ],

  obligatoriskaResor: [
    {
      namn: 'Ring och boka tid',
      borjar: 'hero-CTA, sticky header, flytande ringknapp på mobil',
      slutar: 'samtal kopplat från tel:-länk',
      primar: true,
    },
    {
      namn: 'Begär offert',
      borjar: 'hero-CTA:s sekundärknapp eller ortssidans CTA',
      slutar: 'lead i inkorgen + kvittosida',
      primar: false,
    },
    {
      namn: 'Se vilka områden som körs',
      borjar: 'områdeslista i footern eller ortssidan',
      slutar: 'besökaren ser sin ort eller ser att den saknas',
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
    { typ: 'forsakring', varde: 'ansvarsförsäkring, namngivet bolag', attribution: 'bolagsnamn anges' },
    { typ: 'omdomen', varde: '4,8 · exakt 47 omdömen · Google', attribution: 'betyg + exakt antal + plattform tillsammans, aldrig betyget ensamt' },
    { typ: 'portfolio', varde: '4 dokumenterade före/efter-par', attribution: 'före/efter kräver publiceringsgodkännande' },
  ],

  forbjudnaPastaenden: [
    'Dygnet-runt-jour — kunden har ingen',
    'Certifieringar — kunden har inga branschcertifikat',
    'Arbete i orter utan belagt uppdrag — endast Örebro, Kumla och Hallsberg är belagda',
    'Belopp för RUT-avdraget — RUT beskrivs som möjlighet, aldrig som löfte om summa',
    'Fast pris på abonnemang — ingen prisuppgift är belagd (research §17)',
  ],

  schemaTyp: 'HomeAndConstructionBusiness',
  seoLage: 'lokal' as const,

  juridikflaggor: [] as string[],

  rostregister: {
    adjektiv: ['enkelt', 'vänligt', 'utan säljprat'],
    exempelmeningar: [
      'Ring så säger vi vad det kostar.',
      'Vi kör Örebro, Kumla och Hallsberg — inget annat.',
    ],
    vernacular: ['putsning', 'karmtvätt', 'spröjs', 'abonnemang'],
  },
  branschAntislop: ['proffsig', 'kvalitetsmedveten', 'marknadsledande', 'skinande rent'],
  motionNiva: 'subtil' as const,

  kvalitetsnivaer: { niva: 'STANDARD' as const },

  integrationer: [
    { tjanst: 'Google Företagsprofil', roll: 'lokal närvaro', extern: true, hallerTillstand: true,
      lage: 'ingen-sidintegration' as const, personuppgifter: false, samtyckeKravs: false },
  ],

  framgangsmatt: [
    'Antal samtal per månad',
    'Andel samtal som blir abonnemang',
  ],

  olostaOkandheter: [
    { fraga: 'Exakt prisexempel för abonnemang?', verklighetsklass: 'DOMÄNEXPERT' as const },
    { fraga: 'Publiceringsgodkännande för de fyra före/efter-paren?', verklighetsklass: 'DOMÄNEXPERT' as const },
  ],

  godkannandeTillstand: {
    godkandAv: 'SYNTETISK FIXTUR — ingen mänsklig godkännare',
    datum: '2026-08-26',
    briefSha: 'SAKNAS — ingen brief genererad; fixturen är research-nivå',
  },

  belaggspekare: {
    interventionsbeslut: 'research.md §2 — ingen befintlig sajt; enbart en Facebook-sida och en Google Företagsprofil',
    primaraktion: 'research.md §4 — 91 av 118 uppdrag startade med ett samtal, 84 av dem avslutades i samma samtal',
    seoLage: 'research.md §5 — Örebro belagt med fakturaunderlag; Kumla och Hallsberg likaså',
    paket: 'research.md §15 — paketet BELAGT, inte antaget; kontrollrad pack=lokal-se',
    kvitton: 'research.md §6 — betyg + EXAKT antal + plattform per paketmodulens skärpning',
    schemaTyp: 'research.md §15 — LocalBusiness-subtypen HomeAndConstructionBusiness',
    statelesshet: 'research.md §9 — ingen bokning, ingen inloggning',
  },

  statelesshet: { hallerTillstand: false },

  testklient: true,
}
