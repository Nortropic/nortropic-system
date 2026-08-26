// CASE B — SYNTETISK NEGATIVKONTROLL (masterplanen §26).
//
// Site Quality Contract v2 för den påhittade testklienten Kadensa AB.
// INGEN VERKLIG ORGANISATION. Byggs alltid testklient: true + NEXT_PUBLIC_NOINDEX=1.
//
// Fixturen är MEDVETET FEL för lokal-se-antagandena: paket: [], seoLage: 'varumarke',
// primärhandling `boka` med etiketten "Boka demo", inga ortssignaler, inga lokala
// kvitton. Varje fält nedan är härlett ur backtests/case-b-saas/research.md — inget är
// uppfunnet här, och `belaggspekare` säger var varje värde kommer ifrån.

export const profile = {
  profilKontraktVersion: 'v1.2.0',
  katalogVersion: 'v1',

  // TOM LISTA = core-only. Ett GILTIGT läge, aldrig ett fel (S4, Gate 5-delningen).
  paket: [] as string[],

  primaraktion: {
    typ: 'boka' as const,
    etikett: 'Boka demo',
  },
  // Primärhandlingens kedja, testad end-to-end av Gate 1.
  gate1Test:
    'demo-formulär → kvittosida → Cal.com-bokning nådd i extern flik; ' +
    'formulärets lead levererad till LEAD_TO_EMAIL',

  anvandare: [
    'Trafikchefer och driftledare (störst volym)',
    'HR-/personalansvariga',
    'IT-ansvariga som utvärderar integrationer och säkerhet',
  ],

  toppuppgifter: [
    'Förstå om verktyget klarar kör- och vilotidsreglerna',
    'Se om det integrerar mot befintligt TA-system',
    'Boka en demo',
    'Hitta prisbilden',
  ],

  obligatoriskaResor: [
    {
      namn: 'Boka demo',
      borjar: 'hero-CTA eller sidfotens demo-länk',
      slutar: 'bekräftad tid i Cal.com + lead i inkorgen',
      primar: true,
    },
    {
      namn: 'Bedöm regelefterlevnad',
      borjar: 'produktsida → funktionsavsnitt kör- och vilotid',
      slutar: 'besökaren kan avgöra om regelstödet täcker deras fall',
      primar: false,
    },
    {
      namn: 'Bedöm integration',
      borjar: 'integrationssida',
      slutar: 'namngivet TA-system bekräftat eller avfärdat',
      primar: false,
    },
    {
      namn: 'Granska säkerhetsläget',
      borjar: 'säkerhetssida',
      slutar: 'ISO-certifikat och DPA läsbara utan jargong',
      primar: false,
    },
  ],

  kapaciteter: [
    { id: 'KAP-PRIMARHANDLING', status: 'VALIDATING' },
    { id: 'KAP-EXTERN-BOKNING', status: 'DECLARED' },
    { id: 'KAP-SCHEMA', status: 'VALIDATING' },
    { id: 'KAP-PRESTANDA', status: 'VALIDATING' },
    // KAP-LOKAL-SEO aktiveras INTE: research sektion 5 bär ingen belagd ort och
    // seoLage är 'varumarke'. Frånvaron är KORREKT, aldrig en lucka.
  ],

  interventionsbeslut: 'NY SAJT' as const,

  // B2B-förtroende: produkt, case, säkerhet, expertis. INGA omdömen, INGEN F-skatt,
  // inga lokala citeringar — och frånvaron är belagd i research sektion 6, inte antagen.
  kvitton: [
    { typ: 'certifikat', varde: 'ISO/IEC 27001', attribution: 'certifikatnummer + utfärdare anges' },
    { typ: 'kundcase', varde: 'tre namngivna kunder med publiceringsgodkännande', attribution: 'kundens egen mätta siffra citeras som kundens, aldrig som vår' },
    { typ: 'avtalsdokument', varde: 'DPA + underbiträdesförteckning', attribution: 'daterad, publik' },
    { typ: 'drifthistorik', varde: '99,9 % senaste 12 mån', attribution: 'kundens egen mätning, källa anges' },
    { typ: 'partner', varde: 'två namngivna TA-integrationer', attribution: 'bekräftat av respektive partner' },
  ],

  forbjudnaPastaenden: [
    'Stjärnbetyg eller antal omdömen — sådana finns inte (research sektion 6)',
    'F-skatt som förtroendekvitto — köparen efterfrågar det aldrig i segmentet',
    'Lokal närvaro, upptagningsområde, restid eller inställelsetid',
    'Google Företagsprofil-närvaro — kunden vill inte ha någon',
    'Att Kadensa sparar tid — kunden lovar uttryckligen inte det (röstregistret)',
    'Certifieringar utöver ISO/IEC 27001',
  ],

  schemaTyp: 'SoftwareApplication',
  // 'varumarke' = varumärkes-/tjänstestruktur UTAN ortsjakt. Ortssidor ska UTELÄMNAS.
  seoLage: 'varumarke' as const,

  juridikflaggor: [] as string[],

  rostregister: {
    adjektiv: ['saklig', 'siffernära', 'ospekulativ'],
    exempelmeningar: [
      'Vi lovar inte att spara tid. Vi visar var timmarna går.',
      'Ett schema som bryter mot kör- och vilotid är inte ett schema, det är en böter.',
    ],
    vernacular: ['kör- och vilotid', 'TA-system', 'planeringshorisont', 'skiftpass'],
  },
  branschAntislop: [
    'revolutionerande', 'sömlös', 'game changer', 'framtidssäker',
    'sparar X timmar i veckan (utan kundens egen mätning som källa)',
  ],
  motionNiva: 'subtil' as const,

  kvalitetsnivaer: { niva: 'STANDARD' as const },

  integrationer: [
    { tjanst: 'Cal.com', roll: 'demobokning', extern: true, hallerTillstand: true,
      lage: 'lank' as const, personuppgifter: true, samtyckeKravs: false },
    { tjanst: 'HubSpot', roll: 'CRM, tar emot leads via e-post', extern: true, hallerTillstand: true,
      lage: 'ingen-sidintegration' as const, personuppgifter: true, samtyckeKravs: false },
    { tjanst: 'statuspage.io', roll: 'drifthistorik', extern: true, hallerTillstand: true,
      lage: 'lank' as const, personuppgifter: false, samtyckeKravs: false },
  ],

  framgangsmatt: [
    'Bokade demos från sajten: 14/mån i dag → 25 inom två kvartal (kundens mål)',
    'Färre avbokade demos p.g.a. missförstådd produktnytta',
  ],

  olostaOkandheter: [
    { fraga: 'Sajtens språk: svenska enbart eller svenska + engelska?', verklighetsklass: 'DOMÄNEXPERT' as const },
    { fraga: 'Domän i roten eller på www?', verklighetsklass: 'DOMÄNEXPERT' as const },
  ],

  godkannandeTillstand: {
    godkandAv: 'SYNTETISK FIXTUR — ingen mänsklig godkännare',
    datum: '2026-08-26',
    briefSha: 'SAKNAS — ingen brief genererad; fixturen är research-nivå',
  },

  belaggspekare: {
    interventionsbeslut: 'research.md §7 + §9 — en befintlig sajt FINNS med innehåll värt att bevara, men kunden vill bygga om: den nuvarande är en mallprodukt de vuxit ur och som inte bär produktinnehållet. FÖRBÄTTRA BEFINTLIG prövades och valdes bort på det belägget; en ren migrationsfixtur hör till §26-GAP-1',
    primaraktion: 'research.md §4 — 41/47 dialoger startade i demo-formuläret',
    seoLage: 'research.md §5 — nationellt/EU, inget arbetsområde, ingen belagd ort',
    paket: 'research.md §15 — ingen ortssignal, ingen pakethypotes; kontrollrad pack=core-only',
    kvitton: 'research.md §6 — belagda kvitton och belagd FRÅNVARO av omdömen/F-skatt',
    schemaTyp: 'research.md §2 + §9 — SaaS-produkt, inte ett besöksdrivet verksamhetsställe',
    statelesshet: 'research.md §9 — produktinloggningen bor på app.kadensa.se, en SEPARAT applikation',
  },

  // D8: sajten som byggs håller inget eget tillstånd. Produktapplikationen är en annan
  // sak och ligger utanför detta uppdrag (research §9). Att en EXTERN tjänst håller
  // tillstånd bryter INTE vallgraven.
  statelesshet: { hallerTillstand: false },

  testklient: true,
}
