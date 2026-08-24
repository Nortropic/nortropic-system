export const meta = {
  name: 'nortropic-verify-suite',
  description: 'Regressionsnätet för självförbättringstrappan: doctor + plan-torrtest + eval-stabilitet + template-spotcheck mot frysta baselines i tests/fixtures/',
  whenToUse: 'Körs av nattskiftet efter VARJE N2-ändring (docs/07-konstitution.md §B6), av människan före/efter riskabla systemändringar, eller med --cut-baseline för att skriva nya baseline-KANDIDATER till ~/.nortropic/factory/baseline-kandidater/ (aldrig direkt till tests/fixtures — konstitutionen §A6; committandet är en mänsklig handling).',
  phases: [
    { title: 'Doctor', detail: 'stewardens mekaniska kontroller 1–13; 0 FAIL krävs innan proberna körs' },
    { title: 'Probes', detail: 'plan-torrtest + eval-stabilitet + template-spotcheck parallellt mot frysta baselines' },
    { title: 'Verdict', detail: 'GRÖN|RÖD|OGILTIG med diff mot baseline → ~/.nortropic/factory/VERIFY-SUITE-RESULT.md' },
  ],
}

// ROTUPPLÖSNING (S0/R1, repo-nativ fabrik): roten är den mekaniskt upplösta git-toppen för
// DETTA repo — aldrig en hårdkodad hemkatalog. Varje agentprompt nedan inleder med proceduren:
// ROT=$(git rev-parse --show-toplevel); verifiera identitet (origin matchar Nortropic/nortropic-system
// OCH docs/07-konstitution.md + AUTOPILOT finns i ROT) INNAN något konsumeras; misslyckas
// upplösningen/identiteten → KUNDE-EJ-KÖRAS, aldrig en gissad rot.
const ROT_PROCEDUR = 'Upplös först fabriksroten mekaniskt: ROT=$(git rev-parse --show-toplevel). Verifiera identiteten INNAN du konsumerar något: `git -C "$ROT" remote get-url origin` ska matcha Nortropic/nortropic-system (SSH- eller HTTPS-form) OCH filerna $ROT/docs/07-konstitution.md samt $ROT/AUTOPILOT ska finnas. Misslyckas upplösning eller identitet: avbryt med KUNDE-EJ-KÖRAS + orsak — gissa ALDRIG en rot, använd ALDRIG en hårdkodad hemkatalogsökväg.'

// FIXTURE_REGIME_CHANGE 2026-08-24 (ägarbeslut, S0): den gamla desktop-erans fixturkedja
// (~/Workflow/test-rorjour, ~/Workflow/rorjour-stockholm, fryst preview rorjour-stockholm.vercel.app)
// är RETIRERAD som icke-auktoritativ evidens och återskapas inte. Baselines i tests/fixtures/ är
// HISTORISK URKUND. Proberna nedan kortsluts därför mekaniskt till sitt befintliga icke-gröna
// verdikt med explicit orsak tills människan klippt den nya regimens fixturer (§A6).
// Detta är en ORSAK inom befintlig verdikttaxonomi (GRÖN|RÖD|OGILTIG) — aldrig ett fjärde verdikt.
const REGIME_ORSAK = 'NY-REGIM-VÄNTAR (FIXTURE_REGIME_CHANGE 2026-08-24): legacy-fixturkedjan är retirerad (ägarbeslut S0); människan klipper den nya regimens fixturer per tests/fixtures/FIXTURE-REGIME-CHANGE-2026-08-24.md innan denna probe kan dömas.'
const NY_REGIM_KLIPPT = false // vänds ENDAST av människan i samma §A6-commit som klipper de nya fixturerna

const RESULT_PATH = '~/.nortropic/factory/VERIFY-SUITE-RESULT.md'
// --cut-baseline: skriv kandidater till ~/.nortropic/factory/baseline-kandidater/ i stället för att jämföra.
const cutBaseline = !!(args && (args.cutBaseline || args['cut-baseline']))

const DOCTOR = {
  type: 'object',
  required: ['status', 'fails', 'warns'],
  properties: {
    status: { type: 'string', enum: ['PASS', 'FAIL', 'OGILTIG'] },
    fails: { type: 'array', items: { type: 'string' }, description: 'one line per failing check: "#n <check>: <evidence>"' },
    warns: { type: 'array', items: { type: 'string' } },
    note: { type: 'string', description: 'vid OGILTIG: vilken kontroll som inte kunde köras (KUNDE-EJ-KÖRAS) och varför' },
  },
}

const PLANTEST = {
  type: 'object',
  required: ['verdict', 'deviations'],
  properties: {
    verdict: { type: 'string', enum: ['EKVIVALENT', 'AVVIKELSE', 'KUNDE-EJ-KÖRAS'] },
    deviations: {
      type: 'array',
      items: {
        type: 'object',
        required: ['field', 'baseline', 'actual', 'materiell'],
        properties: {
          field: { type: 'string', description: '§5/§7-fält eller Ekvivalenskriterium som avviker' },
          baseline: { type: 'string' },
          actual: { type: 'string' },
          materiell: { type: 'boolean', description: 'true endast om avvikelsen bryter ett Ekvivalenskriterium' },
        },
      },
    },
    note: { type: 'string' },
  },
}

const EVALSTAB = {
  type: 'object',
  required: ['verdict', 'total', 'faktatrohet', 'rubricVersion'],
  properties: {
    verdict: { type: 'string', enum: ['PASS', 'FAIL', 'OGILTIG'] },
    total: { type: 'number' },
    faktatrohet: { type: 'string', enum: ['PASS', 'FAIL'] },
    rubricVersion: { type: 'string' },
    baselineTotal: { type: 'number' },
    delta: { type: 'number', description: 'total - baselineTotal (negativt = tapp)' },
    newFailCriteria: { type: 'array', items: { type: 'string' } },
    note: { type: 'string', description: 'vid OGILTIG: exakt varför (rubrikversion ≠ baseline / preview onåbar)' },
  },
}

const TEMPLATE = {
  type: 'object',
  required: ['verdict', 'newCriticals'],
  properties: {
    verdict: { type: 'string', enum: ['PASS', 'FAIL', 'OGILTIG'] },
    newCriticals: {
      type: 'array',
      items: {
        type: 'object',
        required: ['section', 'pattern'],
        properties: { section: { type: 'string' }, pattern: { type: 'string' } },
      },
    },
    knownCount: { type: 'number', description: 'antal baseline-kända fynd som återsågs' },
    note: { type: 'string' },
  },
}

phase('Doctor')
const doctor = await agent(
  `${ROT_PROCEDUR}\n\nRead $ROT/agents/nortropic-steward.md, section "MODE: doctor", and execute checks 1–13 mechanically EXACTLY as written there (shell out to the embedded commands; judge nothing beyond what a check specifies). This is a verify-suite gate run: write NO files, propose nothing — return structured data only. Företräde för status: FAIL om NÅGON kontroll FAILar; annars OGILTIG om NÅGON kontroll rapporterar KUNDE-EJ-KÖRAS (kunde inte utvärderas — sätt note till vilken/vilka kontroller + varför); annars PASS. En outvärderad kontroll ger ALDRIG PASS med bara en WARN. WARNs redovisas men fäller inte grinden.`,
  { label: 'doctor', phase: 'Doctor', schema: DOCTOR }
)
const doctorFailed = !doctor || doctor.status === 'FAIL'
const doctorInvalid = !!doctor && doctor.status === 'OGILTIG'
const doctorStatus = doctor ? doctor.status : 'FAIL'   // 'PASS' | 'FAIL' | 'OGILTIG' (dött doctor = FAIL)
// Företräde: doctor FAIL/null → RÖD, hoppa proberna (0 FAIL krävs innan de körs). Doctor OGILTIG
// hoppar däremot INTE proberna — medvetet val, ej bieffekt: en outvärderbar kontroll (t.ex. #4
// MCP-integritet) är ORTOGONAL mot plan-/eval-/template-regression. Hoppar vi proberna döljer vi
// verkliga regressioner bakom en orelaterad oevaluerbar kontroll. Verdiktet låses ändå till OGILTIG
// nedan, men probinformationen är inte värdelös (och --cut-baseline behöver den).
if (doctorFailed) {
  log(doctor ? `Doctor RÖD: ${doctor.fails.length} FAIL — proberna hoppas över` : 'Doctor kunde inte köras — proberna hoppas över')
} else if (doctorInvalid) {
  log(`Doctor OGILTIG: ${doctor.note || 'kontroll(er) kunde inte köras'} (${doctor.warns.length} WARN) — proberna körs ändå (se not ovan)`)
} else {
  log(`Doctor grön (${doctor.warns.length} WARN)`)
}

let plan = null, evalStab = null, template = null
if (!doctorFailed && !NY_REGIM_KLIPPT) {
  // FIXTURE_REGIME_CHANGE-kortslutning: legacy-fixturkedjan är retirerad. Proberna spawnas
  // INTE mot retirerad evidens — de bokförs mekaniskt med sitt befintliga icke-gröna verdikt
  // och explicit orsak. Aldrig tyst grönt, aldrig ett nytt verdikt, aldrig en legacy-körning.
  phase('Probes')
  log(`Probes kortslutna: ${REGIME_ORSAK}`)
  plan = { verdict: 'KUNDE-EJ-KÖRAS', deviations: [], note: REGIME_ORSAK }
  evalStab = { verdict: 'OGILTIG', total: 0, faktatrohet: 'FAIL', rubricVersion: 'N/A', note: REGIME_ORSAK }
  template = { verdict: 'OGILTIG', newCriticals: [], note: REGIME_ORSAK }
} else if (!doctorFailed) {
  phase('Probes')
  const cutNote = cutBaseline
    ? `\n\nCUT-BASELINE-LÄGE: jämför INTE mot fixturen. Skriv i stället en komplett baseline-KANDIDAT till ~/.nortropic/factory/baseline-kandidater/VERIFY-BASELINE-KANDIDAT-<probe>.md (samma format som fixturen) och returnera verdict EKVIVALENT/PASS med note "kandidat skriven — committande till tests/fixtures/ är en mänsklig handling (docs/07 §A6)".`
    : ''
  // NY REGIM (aktiveras av människans §A6-klipp): proberna nedan är MALLAR som människan
  // binder till den nya regimens fixturer i samma commit som NY_REGIM_KLIPPT vänds.
  // De får ALDRIG återbindas till den retirerade legacy-kedjan.
  ;[plan, evalStab, template] = await parallel([
    () => agent(
      `${ROT_PROCEDUR}\n\nPLAN-TORRTEST (regressionsprobe; facit = den av människan klippta plan-fixturen i $ROT/tests/fixtures/ enligt FIXTURE-REGIME-CHANGE-2026-08-24.md). Gör exakt:\n` +
      `1) Skapa ~/.nortropic/factory/.trappan-tmp/plan-<dagens datum>/ och kopiera regimens research-fixtur dit; appenda raden "hoppa över inspirationsjakt" (ingen webbaktivitet alls i torrtestet).\n` +
      `2) Följ $ROT/agents/project-planner.md steg för steg mot kopian (TESTKLIENT; hoppa steg 5e/profilbiblioteket; skriv ingen agent-memory). Skriv PROJECT-BRIEF.md i tmp-mappen.\n` +
      `3) Döm §5+§7 ENBART per fixturens sektion "Ekvivalenskriterier" (§7 på substans, §5 på kontraktsform — vald riktning/palett fäller ALDRIG). verdict=AVVIKELSE endast om minst en deviation är materiell.\n` +
      `4) Radera tmp-mappen. Kunde processen inte genomföras → verdict KUNDE-EJ-KÖRAS med note.` + cutNote,
      { label: 'probe:plan', phase: 'Probes', schema: PLANTEST }
    ),
    () => agent(
      `${ROT_PROCEDUR}\n\nEVAL-STABILITETSPROBE (facit = den av människan klippta eval-fixturen i $ROT/tests/fixtures/ enligt FIXTURE-REGIME-CHANGE-2026-08-24.md). Gör exakt:\n` +
      `1) Läs rubrikversionen i $ROT/skills/nortropic-eval/references/eval-rubric.md och fixturens stämplade "Rubrikversion". Matchar de INTE → verdict OGILTIG, note "eval-rubriken har bytt version — människan klipper ny baseline". Svarar inte fixturens frysta preview med 200 → verdict OGILTIG, note "fryst preview onåbar".\n` +
      `2) Kör nortropic-eval-skillens rubrik mot fixturens FRYSTA preview (read-only: inga formulär, inga CTA-klick), källor per fixturens egna pekare. Testklient-gatingen gäller. Kriterium 7: statisk viktbudget-bedömning räcker. Skriv INGEN EVAL-RESULT.md någonstans.\n` +
      `3) Jämför mot fixturen: verdict=FAIL om total > 2 p under baselineTotal, om något kriterium är FAIL som var PASS i fixturen (lista i newFailCriteria), eller om Faktatrohet=FAIL. Annars PASS.` + cutNote,
      { label: 'probe:eval', phase: 'Probes', schema: EVALSTAB }
    ),
    () => agent(
      `${ROT_PROCEDUR}\n\nTEMPLATE-SPOTCHECK (facit = den av människan klippta template-fixturen i $ROT/tests/fixtures/ enligt FIXTURE-REGIME-CHANGE-2026-08-24.md). Kör ENDAST template-test-linsen (mall-mönstertestet + hero-regeln + design-blocklisten $ROT/skills/nortropic-antislop/references/design-blocklist.md) mot fixturens FRYSTA preview och källkod (read-only, skriv inga filer).\n` +
      `Jämför mot fixturens kända fynd (matcha på sektion+mönster): verdict=FAIL ENDAST vid NY CRITICAL som inte finns i fixturen; kända fynd är accepterad utgångspunkt. Previewn onåbar → verdict OGILTIG.` + cutNote,
      { label: 'probe:template', phase: 'Probes', agentType: 'design-reviewer', schema: TEMPLATE }
    ),
  ])
}

// Verdiktlogik (§B6): RÖD slår OGILTIG slår GRÖN. En probe som dog (null) är odömbar → OGILTIG, aldrig tyst grön.
const planV = plan ? plan.verdict : 'KUNDE-EJ-KÖRAS'
const evalV = evalStab ? evalStab.verdict : 'OGILTIG'
const tmplV = template ? template.verdict : 'OGILTIG'
let verdict
if (doctorFailed || planV === 'AVVIKELSE' || evalV === 'FAIL' || tmplV === 'FAIL') verdict = 'RÖD'
else if (doctorInvalid || planV === 'KUNDE-EJ-KÖRAS' || evalV === 'OGILTIG' || tmplV === 'OGILTIG') verdict = 'OGILTIG'
else verdict = 'GRÖN'
log(`Verdikt: ${verdict} (doctor: ${doctorStatus} · plan: ${planV} · eval: ${evalV} · template: ${tmplV})`)

phase('Verdict')
const summaryLine = `doctor: ${doctorStatus} · plan: ${planV} · eval: ${evalStab ? `${evalStab.total}/${evalStab.baselineTotal ?? '?'} (Δ${evalStab.delta ?? '?'})` : 'OGILTIG'} · template: ${template ? `${(template.newCriticals || []).length} nya CRITICAL` : 'OGILTIG'}`
await agent(
  `${ROT_PROCEDUR}\n\nSkriv verify-suitens resultatfil. Kör \`git -C "$ROT" rev-parse HEAD\` och hämta dagens datum, SKRIV sedan hela rapporten till ${RESULT_PATH} (skapa ~/.nortropic/factory/ vid behov; skriv över — historiken bor i AUTO-DIGEST) som börjar EXAKT med detta meta-block (fyll i riktiga värden):\n` +
  `<!-- nortropic-verify-suite-meta\ncommit: <hash>\ndate: <YYYY-MM-DD>\nverdict: ${verdict}\n${summaryLine}\nmode: ${cutBaseline ? 'cut-baseline' : 'verify'}\n-->\n` +
  `Därefter, i markdown: en sektion per steg (Doctor, Plan-torrtest, Eval-stabilitet, Template-spotcheck) med utfall och DIFF mot baseline — avvikelser/nya fynd/poängdelta radvis; vid OGILTIG citera note-fältet; vid RÖD gör tydligt VILKET steg som fällde. Underlag (rådata, hitta inte på något utöver detta):\n\n` +
  `DOCTOR: ${JSON.stringify(doctor)}\n\nPLAN: ${JSON.stringify(plan)}\n\nEVAL: ${JSON.stringify(evalStab)}\n\nTEMPLATE: ${JSON.stringify(template)}\n\n` +
  `Avsluta med en rad om vad ${cutBaseline ? 'kandidaterna' : 'verdiktet'} betyder för nattskiftet (GRÖN = ändringen får stå kvar; RÖD = revert + incident; OGILTIG = revert + förslag, ingen incident — docs/07 §B6). Returnera rapporttexten som slutsvar också.`,
  { label: 'report', phase: 'Verdict' }
)

return { verdict, doctor: doctorStatus, plan: planV, eval: evalV, template: tmplV, resultPath: RESULT_PATH, mode: cutBaseline ? 'cut-baseline' : 'verify' }
