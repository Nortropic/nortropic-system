/**
 * R7 — kanonisk Lighthouse-prestandagrind (Gate 2:s mekaniska Lighthouse-rad).
 * Systerskript till run-axe-gate.mjs (R6) — samma auktoritetsmodell.
 *
 * Kör ägar-utpekade lighthouse@13.4.1 (Apache-2.0, GoogleChrome/lighthouse)
 * DIREKT ur den kanoniska verktygsroten tools/web-quality/ — inget npx, ingen
 * global installation, ingen PATH-uppslagning, ingen körtidsprovisionering.
 * Saknas materialiseringen: ODÖMBART med operatörsinstruktion.
 *
 * Webbläsarbindning: den kanoniska Macens Chrome resolvas MEKANISKT till
 * /Applications/Google Chrome.app/Contents/MacOS/Google Chrome — ärvd
 * CHROME_PATH/kund-PATH ignoreras; binären måste existera och dess faktiska
 * version rapporteras i evidensen. Chromes EGEN sandlåda förblir PÅ:
 * flaggorna är minimala (headless=new, disable-gpu, disable-dev-shm-usage)
 * och säkerhets-bypass är förbjudna.
 *
 * INP-SANNINGSGRÄNS: navigations-Lighthouse utför inga interaktioner och kan
 * därför ALDRIG mäta verklig INP. Kravet INP < 200 ms består i Gate 2, men
 * denna körning bevisar det INTE: resultatet redovisar
 * inp.status=NOT_MEASURED_BY_NAVIGATION_LIGHTHOUSE med TBT som labbproxy.
 * TBT blir aldrig INP-PASS. Utan giltig fältdata/godkänt user-flow förblir
 * INP-delkravet ODÖMBART.
 *
 * Verdiktalgebra (Lighthouse-navigationskomponenten):
 *   exit 0 = PASS — exakta identiteter, giltig LHR, kategoritrösklar + LCP +
 *            CLS gröna. (Hela Gate 2 är ändå inte grön förrän INP-delkravet
 *            har egen giltig evidens.)
 *   exit 1 = FAIL — giltig LHR, ≥1 frusen tröskel bruten.
 *   exit 2 = ODÖMBART — verktyg/version/Node/Chrome/mål/auth/JSON/
 *            runtimeError/saknad audit. Verktygsfel är ALDRIG sajt-PASS.
 *
 * Hemlighetsgräns: VERCEL_AUTOMATION_BYPASS_SECRET läses endast ur miljön.
 * Bypassen levereras som request-header via Lighthouses --extra-headers med
 * en EFEMÄR FIL (0600 i mkdtemp, raderas efteråt) — hemligheten hamnar aldrig
 * i argv/processlistan och aldrig i URL:en (mindre bevisad hemlighetsyta än
 * query-formen). All emission saneras ändå (rå + URL-kodad variant).
 * 401 = ODÖMBAR auth-status, aldrig prestanda-FAIL.
 *
 * Determinism: Lighthouse-poäng varierar av naturen. Det deterministiska är
 * verktygs-/inställnings-/webbläsaridentiteten, tröskelalgebran och parsern —
 * ALDRIG ett krav på numeriskt identiska poäng mellan körningar.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const REQUIRED_LH_VERSION = '13.4.1';
const REQUIRED_NODE_MAJOR = 22;
const REQUIRED_NODE_MINOR = 19;
const TOOL_ROOT_REL = 'tools/web-quality';
const PROVISION_HINT = 'provisionering (explicit operatörshandling): cd tools/web-quality && npm ci';
const CANONICAL_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const CATEGORY_THRESHOLDS = { performance: 90, accessibility: 95, 'best-practices': 95, seo: 95 };
const LCP_MAX_MS = 2500; // kontraktet är < 2,5 s — exakt 2500 är FAIL
const CLS_MAX = 0.1;     // kontraktet är < 0,1 — exakt 0,1 är FAIL
const INP_THRESHOLD_MS = 200;

const SECRET = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '';

function sanitize(text) {
  if (!SECRET || typeof text !== 'string') return text;
  let out = text;
  for (const v of [SECRET, encodeURIComponent(SECRET)]) { if (v) out = out.split(v).join('[REDACTED]'); }
  return out;
}
function emit(obj) { process.stdout.write(sanitize(JSON.stringify(obj, null, 2)) + '\n'); }
function odombar(reason, extra = {}) { emit({ status: 'ODÖMBART', reason: sanitize(reason), ...extra }); process.exit(2); }

export function resolveNortropicRoot() {
  const here = path.dirname(new URL(import.meta.url).pathname);
  let root;
  try { root = execFileSync('git', ['-C', here, 'rev-parse', '--show-toplevel'], { encoding: 'utf-8' }).trim(); }
  catch { return { error: 'ingen git-topp vid skriptets hem — aldrig gissad rot' }; }
  let origin;
  try { origin = execFileSync('git', ['-C', root, 'remote', 'get-url', 'origin'], { encoding: 'utf-8' }).trim(); }
  catch { return { error: 'origin saknas' }; }
  if (!origin.includes('Nortropic/nortropic-system')) return { error: `origin är '${origin}' — fel repoidentitet` };
  if (!fs.existsSync(path.join(root, 'docs/07-konstitution.md'))) return { error: 'ankarfil docs/07-konstitution.md saknas' };
  if (!fs.existsSync(path.join(root, 'AUTOPILOT'))) return { error: 'ankarfil AUTOPILOT saknas' };
  return { root };
}

// Kanonisk Chrome — ärvd CHROME_PATH/kund-PATH väljer ALDRIG webbläsare.
export function resolveCanonicalChrome() {
  if (!fs.existsSync(CANONICAL_CHROME)) {
    return { error: `kanoniska Chrome saknas på ${CANONICAL_CHROME} — en annan Chromium/Canary/PATH-binär substitueras ALDRIG tyst` };
  }
  let version = 'okänd';
  try { version = execFileSync(CANONICAL_CHROME, ['--version'], { encoding: 'utf-8' }).trim(); } catch { /* rapporteras okänd */ }
  return { executable: CANONICAL_CHROME, version };
}

async function preflightTarget(rawTarget, headers) {
  if (rawTarget.startsWith('file://')) {
    const p = decodeURIComponent(new URL(rawTarget).pathname);
    if (!fs.existsSync(p)) odombar(`målet kan inte läsas: filen saknas (${sanitize(rawTarget)})`);
    return;
  }
  if (/^https?:\/\//.test(rawTarget)) {
    let res;
    try { res = await fetch(rawTarget, { method: 'GET', redirect: 'follow', headers, signal: AbortSignal.timeout(20_000) }); }
    catch (e) { odombar(`målet kan inte nås (${sanitize(rawTarget)}): ${sanitize(String(e?.cause?.code || e?.message || e))}`); }
    if (res.status === 401) odombar('målet svarar 401 — skyddad preview utan giltig bypass: ODÖMBAR auth-status (ODÖMBART_AUTH), aldrig prestanda-FAIL');
    if (!res.ok) odombar(`målet svarar HTTP ${res.status} — inget analyserbart sidinnehåll`);
    return;
  }
  odombar('okänt URL-schema — endast http(s):// och file:// stöds');
}

/**
 * Ren tröskel-/parsningsalgebra över en LHR — exporterad för mekanisk
 * enhetsfalsifiering. Returnerar { verdict: 'PASS'|'FAIL'|'ODÖMBART', ... }.
 */
export function evaluateLhr(lhr) {
  if (lhr?.lighthouseVersion !== REQUIRED_LH_VERSION) {
    return { verdict: 'ODÖMBART', reason: `lhr.lighthouseVersion är ${lhr?.lighthouseVersion} — exakt ${REQUIRED_LH_VERSION} krävs` };
  }
  if (lhr.runtimeError) {
    return { verdict: 'ODÖMBART', reason: `runtimeError: ${lhr.runtimeError.code || 'okänd'} — en fel-/tomsida är aldrig prestandaevidens`, runtimeError: lhr.runtimeError };
  }
  const settings = {
    formFactor: lhr.configSettings?.formFactor,
    throttlingMethod: lhr.configSettings?.throttlingMethod,
    throttling: lhr.configSettings?.throttling ?? null,
    screenEmulation: lhr.configSettings?.screenEmulation ?? null,
  };
  if (settings.formFactor !== 'mobile') {
    return { verdict: 'ODÖMBART', reason: `formFactor är '${settings.formFactor}' — Gate 2-kontraktet är mobil navigation`, settings };
  }
  const categories = {};
  for (const id of CATEGORIES) {
    const score = lhr.categories?.[id]?.score;
    if (typeof score !== 'number') return { verdict: 'ODÖMBART', reason: `kategorin ${id} saknar numerisk score`, settings };
    categories[id] = score * 100;
  }
  const audit = (id) => lhr.audits?.[id];
  const numericAudit = (id) => {
    const a = audit(id);
    if (!a || a.scoreDisplayMode === 'notApplicable' || a.scoreDisplayMode === 'error' || typeof a.numericValue !== 'number') return null;
    return a.numericValue;
  };
  const lcpMs = numericAudit('largest-contentful-paint');
  if (lcpMs === null) return { verdict: 'ODÖMBART', reason: 'largest-contentful-paint saknas/notApplicable/error — LCP-mätningen är odömbar', settings, categories };
  const cls = numericAudit('cumulative-layout-shift');
  if (cls === null) return { verdict: 'ODÖMBART', reason: 'cumulative-layout-shift saknas/notApplicable/error — CLS-mätningen är odömbar', settings, categories };
  const tbtMs = numericAudit('total-blocking-time');
  const totalByteWeightBytes = numericAudit('total-byte-weight');

  const thresholdFailures = [];
  for (const id of CATEGORIES) {
    if (categories[id] < CATEGORY_THRESHOLDS[id] - 1e-9) {
      thresholdFailures.push(`${id}: ${categories[id].toFixed(1)} < ${CATEGORY_THRESHOLDS[id]}`);
    }
  }
  if (!(lcpMs < LCP_MAX_MS)) thresholdFailures.push(`lcp: ${Math.round(lcpMs)} ms — kravet är < ${LCP_MAX_MS} ms`);
  if (!(cls < CLS_MAX)) thresholdFailures.push(`cls: ${cls} — kravet är < ${CLS_MAX}`);
  thresholdFailures.sort();

  return {
    verdict: thresholdFailures.length === 0 ? 'PASS' : 'FAIL',
    settings,
    categories,
    metrics: { lcpMs, cls, tbtMs, totalByteWeightBytes },
    // INP-sanningsgränsen: syntetiseras ALDRIG ur TBT.
    inp: {
      status: 'NOT_MEASURED_BY_NAVIGATION_LIGHTHOUSE',
      thresholdMs: INP_THRESHOLD_MS,
      proxyMetric: 'TBT',
      proxyValueMs: tbtMs,
      note: 'INP < 200 ms förblir ett separat krav; utan giltig fältdata eller godkänt user-flow är INP-delkravet ODÖMBART — aldrig PASS härifrån.',
    },
    thresholdFailures,
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1 || args[0].startsWith('-')) {
    odombar('exakt ett argument krävs: mål-URL. Grinden har inga flaggor/lägen (och ALDRIG install/update).');
  }
  const rawTarget = args[0];

  const rootRes = resolveNortropicRoot();
  if (rootRes.error) odombar(rootRes.error);
  const root = rootRes.root;

  const nodeMatch = process.versions.node.split('.').map(Number);
  if (nodeMatch[0] < REQUIRED_NODE_MAJOR || (nodeMatch[0] === REQUIRED_NODE_MAJOR && nodeMatch[1] < REQUIRED_NODE_MINOR)) {
    odombar(`Node ${process.versions.node} uppfyller inte lighthouse@${REQUIRED_LH_VERSION}s krav >=22.19`);
  }

  const toolRoot = path.join(root, TOOL_ROOT_REL);
  if (!fs.existsSync(path.join(toolRoot, 'package.json'))) odombar(`verktygsrotens package.json saknas; ${PROVISION_HINT}`);
  if (!fs.existsSync(path.join(toolRoot, 'package-lock.json'))) odombar(`package-lock.json saknas — pinning utan lock är ingen pinning; ${PROVISION_HINT}`);
  const pkg = JSON.parse(fs.readFileSync(path.join(toolRoot, 'package.json'), 'utf-8'));
  if (pkg.dependencies?.lighthouse !== REQUIRED_LH_VERSION) odombar(`verktygskontraktet deklarerar inte lighthouse@${REQUIRED_LH_VERSION} exakt (utan intervall)`);
  const nm = path.join(toolRoot, 'node_modules');
  if (!fs.existsSync(nm)) odombar(`verktygsinstallationen saknas; ${PROVISION_HINT}`);
  let lhVersion;
  try { lhVersion = JSON.parse(fs.readFileSync(path.join(nm, 'lighthouse', 'package.json'), 'utf-8')).version; }
  catch { odombar(`lighthouse ej installerad; ${PROVISION_HINT}`); }
  if (lhVersion !== REQUIRED_LH_VERSION) odombar(`lighthouse är ${lhVersion} — exakt ${REQUIRED_LH_VERSION} krävs`);
  const cliJs = path.join(nm, 'lighthouse', 'cli', 'index.js');
  if (!fs.existsSync(cliJs)) odombar('Lighthouse-CLI-implementationen saknas i den pinnade installationen');

  const chrome = resolveCanonicalChrome();
  if (chrome.error) odombar(chrome.error);

  const headers = SECRET ? { 'x-vercel-protection-bypass': SECRET } : undefined;
  await preflightTarget(rawTarget, headers);

  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lh-gate-'));
  const cliArgs = [
    cliJs, rawTarget,
    '--output=json',
    '--output-path=stdout',
    `--only-categories=${CATEGORIES.join(',')}`,
    // Chromes egen sandlåda förblir PÅ — inga säkerhets-bypass-flaggor.
    `--chrome-flags=--headless=new --disable-gpu --disable-dev-shm-usage --user-data-dir=${workDir}/profile`,
    '--quiet',
  ];
  if (SECRET) {
    // Hemligheten via efemär 0600-fil — aldrig argv, aldrig URL.
    const headerPath = path.join(workDir, 'extra-headers.json');
    fs.writeFileSync(headerPath, JSON.stringify({ 'x-vercel-protection-bypass': SECRET }), { mode: 0o600 });
    cliArgs.push(`--extra-headers=${headerPath}`);
  }

  let stdout = '', execErr = null;
  try {
    stdout = execFileSync(process.execPath, cliArgs, {
      encoding: 'utf-8', cwd: toolRoot, timeout: 300_000, maxBuffer: 256 * 1024 * 1024,
      env: { ...process.env, CHROME_PATH: chrome.executable },
    });
  } catch (e) {
    stdout = e.stdout || '';
    execErr = sanitize(String(e.stderr || e.message || '')).slice(0, 2000);
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }

  let lhr;
  try { lhr = JSON.parse(stdout); }
  catch { odombar('Lighthouse-utdata är inte giltig JSON — ingen verklig mätning producerades', { execError: execErr }); }

  const evaluated = evaluateLhr(lhr);
  const report = {
    status: evaluated.verdict === 'PASS' ? 'PASS' : evaluated.verdict,
    gateNote: 'Detta är Gate 2:s LIGHTHOUSE_NAVIGATION-komponent. Hela Gate 2 kräver dessutom separat giltig INP-evidens (fältdata/godkänt user-flow) — se inp.status.',
    tool: { name: 'lighthouse', version: lhVersion, packageRoot: TOOL_ROOT_REL, lockCommitted: true },
    node: { version: process.versions.node },
    browser: { executable: chrome.executable, version: chrome.version },
    target: sanitize(rawTarget),
    settings: evaluated.settings ?? null,
    categories: evaluated.categories ?? null,
    metrics: evaluated.metrics ?? null,
    inp: evaluated.inp ?? { status: 'NOT_MEASURED_BY_NAVIGATION_LIGHTHOUSE', thresholdMs: INP_THRESHOLD_MS, proxyMetric: 'TBT', proxyValueMs: null },
    thresholdFailures: evaluated.thresholdFailures ?? null,
    runtimeError: evaluated.runtimeError ? sanitize(JSON.stringify(evaluated.runtimeError)) : null,
    reason: evaluated.reason ? sanitize(evaluated.reason) : undefined,
  };
  emit(report);
  process.exit(evaluated.verdict === 'PASS' ? 0 : evaluated.verdict === 'FAIL' ? 1 : 2);
}

const _running = process.argv[1];
if (_running?.endsWith('run-lighthouse-gate.mjs')) {
  main();
}
