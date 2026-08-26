export const meta = {
  name: 'nortropic-review',
  description: 'Parallel design + SEO + code review of a Nortropic site with adversarial verification of every finding',
  whenToUse: 'Run during the build phase of a Nortropic client site to get one consolidated, verified findings report. This is a FINDINGS pass — the numeric quality score/gate (0–100, the ≥90 bar) lives in /nortropic-eval, not here. Kadens: första granskningen efter init och granskningen före launch är ALLTID fullständiga; mellanliggande granskningar körs med --diff (granskar endast ändrade filer sedan senaste rapporten).',
  phases: [
    { title: 'Scope', detail: 'diff-scoped runs only: changed files since the last review report' },
    { title: 'Review', detail: 'design-reviewer, seo-optimizer and a code reviewer in parallel' },
    { title: 'Verify', detail: 'two adversarial skeptics attempt to refute each finding' },
    { title: 'Report', detail: 'consolidated CRITICAL/HIGH/MEDIUM report' },
  ],
}

const FINDINGS = {
  type: 'object',
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['severity', 'title', 'location', 'why', 'fix'],
        properties: {
          severity: { type: 'string', enum: ['CRITICAL', 'HIGH', 'MEDIUM'] },
          title: { type: 'string' },
          location: { type: 'string', description: 'file:line or page@viewport' },
          why: { type: 'string', description: 'why this costs leads/trust/rank' },
          fix: { type: 'string', description: 'concrete fix' },
        },
      },
    },
  },
}

const VERDICT = {
  type: 'object',
  required: ['refuted', 'reason'],
  properties: {
    refuted: { type: 'boolean', description: 'true if the finding is wrong, already handled, or not worth fixing' },
    reason: { type: 'string' },
  },
}

const scope = (args && args.scope) || 'the Nortropic site in the current working directory'
// v5 calibration flag: /nortropic-review --no-verify skips the adversarial skeptic step so a run can be
// A/B-compared against a verified run (protocol: nortropic-retro/references/verify-kalibrering.md).
// Defensive read — the flag may arrive as noVerify or 'no-verify' depending on how args are populated.
const noVerify = !!(args && (args.noVerify || args['no-verify']))
// v8 diff scoping: /nortropic-review --diff reviews only files changed since the last review report.
// Kadensregel: första granskningen efter init och pre-launch-granskningen är ALLTID fulla (utan --diff).
const diffMode = !!(args && args.diff)
// v8: kalibreringskörningar skriver en egen fil så de aldrig klobbrar launch-freshness-metan i REVIEW-REPORT.md.
const reportPath = noVerify ? 'REVIEW-REPORT-CALIBRATION.md' : 'REVIEW-REPORT.md'

const DIFFSCOPE = {
  type: 'object',
  required: ['files', 'sinceCommit'],
  properties: {
    files: { type: 'array', items: { type: 'string' } },
    sinceCommit: { type: 'string' },
    warning: { type: 'string', description: 'set when falling back to HEAD~1 because no prior report meta was found' },
  },
}

const REVIEWERS = [
  {
    key: 'design',
    agentType: 'design-reviewer',
    prompt: `Review ${scope}. Run your full anti-slop design review process (score, conversion-critical checks, viewport pass if a dev/preview URL is reachable). Return your findings as structured data only — severity CRITICAL for anything that blocks conversion (phone/CTA/form problems), HIGH for trust erosion, MEDIUM for polish.\n\nINGÅR (ditt ansvar): slop/AI-mönster, konverteringselement (telefon/CTA/formulär/flytande ringknapp), visuell layout/hierarki/responsivitet/typografi, copy-slop-fraser.\nINGÅR INTE (rapportera INTE — annan lens äger): meta/titles/schema/sitemap → seo-lensen; NAP-datakonsistens → seo-lensen; kod-buggar → code-lensen.`,
  },
  {
    key: 'seo',
    agentType: 'seo-optimizer',
    prompt: `Audit ${scope} in audit mode. Check meta templates, H1s, schema validity, NAP consistency against content/business.ts, internal linking, thin area pages, sitemap/robots. Return findings as structured data only — severity CRITICAL for NAP divergence, missing/broken schema on money pages, or noindex accidents (a skarp-klient noindex that profile.ts noindexCutover declares is downgraded per the cutover state machine — see seo-optimizer); HIGH for template violations; MEDIUM for improvements.\n\nINGÅR (ditt ansvar): meta/titles/H1, schema-validitet, NAP-konsistens mot business.ts, intern länkning, tunna ortssidor, sitemap/robots/canonicals.\nINGÅR INTE (rapportera INTE — annan lens äger): copy-röst och slop-fraser → design-lensen; visuell layout/typografi → design-lensen; kod-buggar → code-lensen.`,
  },
  {
    key: 'code',
    agentType: null,
    prompt: `You are a strict code-correctness reviewer. Review ${scope} (a Next.js 15 App Router + TypeScript strict + Tailwind 4 site) for real bugs only: broken imports, server/client component violations, unvalidated form input reaching the lead server action, missing error handling in app/actions/lead.ts, hydration hazards, misconfigured generateStaticParams/metadata, accessibility violations in interactive components. No style opinions — bugs and correctness only. Return findings as structured data.\n\nINGÅR (ditt ansvar): kod-buggar och korrekthet (imports, server/client-gränser, formulärvalidering till lead-action, felhantering, hydrering, generateStaticParams/metadata, a11y i interaktiva komponenter).\nINGÅR INTE (rapportera INTE — annan lens äger): SEO-strategi → seo-lensen; copy och design-slop → design-lensen; visuellt utseende → design-lensen.`,
  },
]

// v8: diff scope scout — mechanical, runs only with --diff
let diffScope = null
if (diffMode) {
  phase('Scope')
  diffScope = await agent(
    `Mechanical diff-scope scout for ${scope}. Do exactly this, in the project root:\n` +
    `1) Read REVIEW-REPORT.md and parse the "commit:" value from its <!-- nortropic-review-meta --> comment block.\n` +
    `2) If found: run git diff --name-only <commit>..HEAD and return that file list.\n` +
    `   If the file or the meta block is missing/unparseable: run git diff --name-only HEAD~1..HEAD instead and set warning to "ingen tidigare granskningsrapport — diff mot HEAD~1".\n` +
    `3) Return { files, sinceCommit, warning? }. Do not filter or judge the file list — report it mechanically.`,
    { label: 'scope:diff', phase: 'Scope', schema: DIFFSCOPE }
  )
  if (!diffScope || !(diffScope.files || []).length) {
    return {
      report: `DIFF-SKOPAD: inga ändrade filer sedan ${diffScope ? diffScope.sinceCommit : 'senaste granskningen'} — ingen granskning behövs.`,
      mode: noVerify ? 'calibration-unverified' : 'verified',
      scope: 'diff',
      reportPath: null,
      counts: { kept: 0, merged: 0, confirmed: 0, dropped: 0 },
    }
  }
  log(`Diff scope: ${diffScope.files.length} filer sedan ${diffScope.sinceCommit}${diffScope.warning ? ' — ' + diffScope.warning : ''}`)
}
const diffNote = diffMode
  ? `\n\nDIFF-SKOPAD KÖRNING: granska ENDAST dessa ändrade filer och deras direkta kontext (sidor/komponenter som importerar dem): ${diffScope.files.join(', ')} (ändrade sedan ${diffScope.sinceCommit}). Ladda dina obligatoriska skills/designkanonen precis som vanligt — det är gransknings-YTAN som är skopad, inte kvalitetsribban. Rapportera inga fynd utanför denna yta.`
  : ''

phase('Review')
const results = await pipeline(
  REVIEWERS,
  r => {
    const opts = { label: `review:${r.key}`, phase: 'Review', schema: FINDINGS }
    if (r.agentType) opts.agentType = r.agentType
    return agent(r.prompt + diffNote, opts)
  },
  (review, r) => {
    const found = (review && review.findings) || []
    if (!found.length) return []
    if (noVerify) {
      log(`${r.key}: ${found.length} findings — verify SKIPPED (calibration run)`)
      return found.map(f => ({ ...f, source: r.key, verdict: 'UNVERIFIED' }))
    }
    log(`${r.key}: ${found.length} findings — verifying`)
    return parallel(found.map(f => () =>
      parallel([0, 1].map(i => () =>
        agent(
          `You are an adversarial verifier with a distinct lens (${i === 0 ? 'is this factually true in the code? Read the actual files at the stated location' : 'does this actually matter FOR THIS SITE PER ITS CONTRACT? Read content/profile.ts: primaraktion, toppuppgifter, obligatoriskaResor, forbjudnaPastaenden, kvalitetsnivaer and paket. Judge the finding against what THAT contract promises — not against a hardcoded site type. If profile.ts is missing or a field is SAKNAS_I_V1, say the contract cannot decide it and judge on general conversion harm instead; never invent a requirement the contract does not carry.'}). Try to REFUTE this ${r.key} review finding about ${scope}:\n\nTitle: ${f.title}\nLocation: ${f.location}\nClaim: ${f.why}\nProposed fix: ${f.fix}\n\nInvestigate the code yourself. Default to refuted=true if you cannot confirm it.`,
          { label: `verify:${f.title.slice(0, 40)}`, phase: 'Verify', schema: VERDICT }
        )
      )).then(votes => {
        const refutations = votes.filter(Boolean).filter(v => v.refuted)
        return { ...f, source: r.key, refutedBy: refutations.length, verdict: refutations.length === 0 ? 'CONFIRMED' : refutations.length === 1 ? 'PLAUSIBLE' : 'DROPPED', refuteReasons: refutations.map(v => v.reason) }
      })
    ))
  }
)

const all = results.filter(Boolean).flat().filter(Boolean)
const kept = all.filter(f => f.verdict !== 'DROPPED')
const dropped = all.filter(f => f.verdict === 'DROPPED')
log(noVerify
  ? `Calibration run: ${kept.length} findings, UNVERIFIED (skeptic step skipped)`
  : `Verified: ${kept.length} kept (${kept.filter(f => f.verdict === 'CONFIRMED').length} confirmed), ${dropped.length} dropped`)

phase('Report')
const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 }
// v5 dedup: identical findings surfaced by more than one lens are merged and counted ONCE, keeping the
// highest severity and recording which lenses flagged it (multi-lens agreement = higher confidence).
const dedupMap = new Map()
for (const f of kept) {
  const k = `${(f.location || '').trim().toLowerCase()}|${(f.title || '').trim().toLowerCase()}`
  const existing = dedupMap.get(k)
  if (existing) {
    existing.sources = Array.from(new Set([...(existing.sources || [existing.source]), f.source]))
    if ((order[f.severity] ?? 3) < (order[existing.severity] ?? 3)) existing.severity = f.severity
  } else {
    dedupMap.set(k, { ...f, sources: [f.source] })
  }
}
const deduped = Array.from(dedupMap.values())
deduped.sort((a, b) => (order[a.severity] ?? 3) - (order[b.severity] ?? 3))
const mergedCount = kept.length - deduped.length
if (mergedCount > 0) log(`Dedup: ${mergedCount} duplicate finding(s) merged across lenses`)

const reviewHeader = noVerify
  ? 'START THE REPORT WITH A BOLD BANNER LINE: "⚠️ OVERIFIERAD KÖRNING — endast för kalibrering". The findings below were NOT adversarially verified (the skeptic step was skipped); treat every finding as UNVERIFIED, say so explicitly, and do not present any as CONFIRMED.'
  : 'Findings below are already adversarially verified (CONFIRMED = both skeptics failed to refute; PLAUSIBLE = one skeptic doubted it, note that).'
const report = await agent(
  `Write a consolidated Nortropic review report in markdown for ${scope}. ${reviewHeader} A finding's \`sources\` array lists the lenses that independently flagged it — when it has more than one, note the multi-lens agreement (higher confidence) and still list it once. Group by severity CRITICAL/HIGH/MEDIUM, keep each finding to location + one-line problem + one-line fix + which agent fixes it (technical/code → stack-builder, copy → content-designer, SEO → seo-optimizer, design → stack-builder with design guidance). End with a 3-line summary and the recommended fix order. Do not invent findings beyond this list:\n\n${JSON.stringify(deduped, null, 2)}\n\nDropped by verification (mention only the count): ${dropped.length}\n\n` +
  `ALSO — write the report to disk (v8 report meta): run \`git rev-parse HEAD\` and get today's date, then WRITE the full report to ${reportPath} in the project root, starting with EXACTLY this meta block (fill in the real values):\n` +
  `<!-- nortropic-review-meta\ncommit: <hash>\ndate: <YYYY-MM-DD>\nscope: ${diffMode ? 'diff' : 'full'}\nmode: ${noVerify ? 'calibration-unverified' : 'verified'}\n-->\n` +
  `${diffMode ? 'Directly under the meta block, put a bold banner line: "DIFF-SKOPAD — täcker ej hela sajten".' : ''} Return the same report text as your final answer too.`,
  { label: 'report', phase: 'Report' }
)

return { report, mode: noVerify ? 'calibration-unverified' : 'verified', scope: diffMode ? 'diff' : 'full', reportPath, counts: { kept: deduped.length, merged: mergedCount, confirmed: deduped.filter(f => f.verdict === 'CONFIRMED').length, dropped: dropped.length } }
