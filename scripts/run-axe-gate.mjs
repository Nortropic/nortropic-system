/**
 * R6 — kanonisk axe-tillgänglighetsgrind (Gate 4:s mekaniska axe-rad).
 *
 * Kör den ägar-utpekade pinnade kedjan @axe-core/cli@4.13.0 + axe-core@4.13.0
 * ur den kanoniska repo-nativa verktygsroten tools/web-quality/ — ALDRIG via
 * PATH/npx/globala installer, ALDRIG med kundens node_modules som motorkälla:
 * motorn binds explicit med --axe-source till repots pinnade axe.min.js, och
 * chromedriver binds explicit med --chromedriver-path till repots pinnade
 * binär (Selenium Managers körtidsnedladdning kringgås därmed).
 *
 * Körtidsgrinden installerar/uppdaterar ALDRIG något. Saknas verktygsroten:
 * ODÖMBART med operatörsinstruktion (`cd tools/web-quality && npm ci`) —
 * materialisering är en explicit operatörshandling, aldrig grindbeteende.
 *
 * Verdiktalgebra:
 *   exit 0 = PASS   — identiteter bevisade, målet analyserat, giltig JSON,
 *                     noll violations för exakt taggmängden wcag2a/2aa/21aa/22aa.
 *   exit 1 = FAIL   — målet analyserat, ≥1 axe-violation. Endast här är det
 *                     ett SAJTFYND.
 *   exit 2 = ODÖMBART/KUNDE-EJ-KÖRAS — verktyg/pin/driver/mål/JSON/auth-fel.
 *                     VERKTYGSFEL ÄR ALDRIG SAJT-PASS, och kollapsas aldrig
 *                     till FAIL.
 *
 * Hemlighetsgräns (Vercel Deployment Protection): VERCEL_AUTOMATION_BYPASS_SECRET
 * läses ENDAST ur miljön; query-formen (x-vercel-protection-bypass=…&
 * x-vercel-set-bypass-cookie=true) konstrueras endast inne i denna körgräns,
 * och ALL utdata (resultatobjekt, axe:s result.url, stdout, stderr, feltext)
 * saneras så att hemligheten (rå + URL-kodad) aldrig överlever i evidens.
 * 401 vid saknad/fel bypass = ODÖMBAR auth-status, aldrig tillgänglighets-FAIL.
 *
 * Determinism: rå axe-JSON innehåller icke-semantisk körtidsmetadata
 * (timestamp m.m.). Det MATERIELLA resultatet normaliseras (violation-id,
 * impact, regeltaggar, träffade selektorer — stabilt sorterade) och hashas;
 * upprepade körningar mot samma oförändrade fixtur ger samma materiella hash.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const REQUIRED_CLI_VERSION = '4.13.0';
const REQUIRED_AXE_VERSION = '4.13.0';
const REQUIRED_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];
const TOOL_ROOT_REL = 'tools/web-quality';
const PROVISION_HINT = 'provisionering (explicit operatörshandling): cd tools/web-quality && npm ci';

const SECRET = process.env.VERCEL_AUTOMATION_BYPASS_SECRET || '';

function sanitize(text) {
  if (!SECRET || typeof text !== 'string') return text;
  const variants = [SECRET, encodeURIComponent(SECRET)];
  let out = text;
  for (const v of variants) { if (v) out = out.split(v).join('[REDACTED]'); }
  return out;
}
function emit(obj) { process.stdout.write(sanitize(JSON.stringify(obj, null, 2)) + '\n'); }
function odombar(reason, extra = {}) {
  emit({ status: 'ODÖMBART', reason: sanitize(reason), ...extra });
  process.exit(2);
}

// 1) R1-regeln: mekanisk rotupplösning + identitetsverifiering — Nortropic-repot,
//    aldrig kundens cwd (skriptets egen placering är utgångspunkten).
function resolveNortropicRoot() {
  const here = path.dirname(new URL(import.meta.url).pathname);
  let root;
  try {
    root = execFileSync('git', ['-C', here, 'rev-parse', '--show-toplevel'], { encoding: 'utf-8' }).trim();
  } catch { return { error: 'ingen git-topp vid skriptets hem — aldrig gissad rot' }; }
  let origin;
  try { origin = execFileSync('git', ['-C', root, 'remote', 'get-url', 'origin'], { encoding: 'utf-8' }).trim(); }
  catch { return { error: 'origin saknas' }; }
  if (!origin.includes('Nortropic/nortropic-system')) return { error: `origin är '${origin}' — fel repoidentitet` };
  if (!fs.existsSync(path.join(root, 'docs/07-konstitution.md'))) return { error: 'ankarfil docs/07-konstitution.md saknas' };
  if (!fs.existsSync(path.join(root, 'AUTOPILOT'))) return { error: 'ankarfil AUTOPILOT saknas' };
  return { root };
}

function readPkgVersion(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8')).version;
}

// Fail-closed mål-preflight: Chrome renderar sin EGEN felsida vid onåbara mål,
// och axe analyserar då glatt felsidan — utan denna spärr blev det ett falskt
// SAJT-verdikt. Onåbart/oläsbart mål är ODÖMBART verktygs-/måltillstånd.
// 401 klassas explicit som ODÖMBAR auth-status (skyddad preview utan giltig
// bypass) — aldrig tillgänglighets-FAIL.
async function preflightTarget(rawTarget, target) {
  if (rawTarget.startsWith('file://')) {
    const p = decodeURIComponent(new URL(rawTarget).pathname);
    if (!fs.existsSync(p)) odombar(`målet kan inte läsas: filen saknas (${sanitize(rawTarget)})`);
    return;
  }
  if (/^https?:\/\//.test(rawTarget)) {
    let res;
    try {
      res = await fetch(target, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(20_000) });
    } catch (e) {
      odombar(`målet kan inte nås (${sanitize(rawTarget)}): ${sanitize(String(e?.cause?.code || e?.message || e))}`);
    }
    if (res.status === 401) odombar('målet svarar 401 — skyddad preview utan giltig bypass: ODÖMBAR auth-status, aldrig tillgänglighets-FAIL');
    if (!res.ok) odombar(`målet svarar HTTP ${res.status} — inget analyserbart sidinnehåll`);
    return;
  }
  odombar('okänt URL-schema — endast http(s):// och file:// stöds');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1 || args[0].startsWith('-')) {
    odombar("exakt ett argument krävs: mål-URL. Grinden har inga flaggor/lägen (och ALDRIG install/update).");
  }
  const rawTarget = args[0];

  const rootRes = resolveNortropicRoot();
  if (rootRes.error) odombar(rootRes.error);
  const root = rootRes.root;

  // 2-3) kanonisk verktygsrot + beroendekontrakt
  const toolRoot = path.join(root, TOOL_ROOT_REL);
  const pkgPath = path.join(toolRoot, 'package.json');
  const lockPath = path.join(toolRoot, 'package-lock.json');
  if (!fs.existsSync(pkgPath)) odombar(`kanoniska verktygsrotens package.json saknas (${TOOL_ROOT_REL}); ${PROVISION_HINT}`);
  if (!fs.existsSync(lockPath)) odombar(`package-lock.json saknas i verktygsroten — pinning utan lock är ingen pinning; ${PROVISION_HINT}`);
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  for (const [dep, want] of [['@axe-core/cli', REQUIRED_CLI_VERSION], ['axe-core', REQUIRED_AXE_VERSION]]) {
    if (pkg.dependencies?.[dep] !== want) odombar(`verktygskontraktet deklarerar inte ${dep}@${want} exakt (utan intervall)`);
  }
  const nm = path.join(toolRoot, 'node_modules');
  if (!fs.existsSync(nm)) odombar(`verktygsinstallationen saknas (node_modules ej materialiserad); ${PROVISION_HINT}`);

  // 4-8) exakta paketidentiteter + pinnad motorkälla ur SAMMA installation
  let cliVersion, axeVersion;
  try { cliVersion = readPkgVersion(path.join(nm, '@axe-core/cli')); } catch { odombar(`@axe-core/cli ej installerad; ${PROVISION_HINT}`); }
  if (cliVersion !== REQUIRED_CLI_VERSION) odombar(`@axe-core/cli är ${cliVersion} — exakt ${REQUIRED_CLI_VERSION} krävs`);
  try { axeVersion = readPkgVersion(path.join(nm, 'axe-core')); } catch { odombar(`axe-core ej installerad; ${PROVISION_HINT}`); }
  if (axeVersion !== REQUIRED_AXE_VERSION) odombar(`axe-core är ${axeVersion} — exakt ${REQUIRED_AXE_VERSION} krävs`);
  const axeSource = path.join(nm, 'axe-core', 'axe.min.js');
  if (!fs.existsSync(axeSource)) odombar('pinnade motorkällan axe.min.js saknas i verktygsinstallationen');
  const axeSourceSha256 = crypto.createHash('sha256').update(fs.readFileSync(axeSource)).digest('hex');
  const cliJs = path.join(nm, '@axe-core/cli', 'dist', 'src', 'bin', 'cli.js');
  if (!fs.existsSync(cliJs)) odombar('CLI-implementationen saknas i den pinnade installationen');
  const chromedriverBin = path.join(nm, 'chromedriver', 'bin', 'chromedriver');
  if (!fs.existsSync(chromedriverBin)) odombar(`pinnad chromedriver saknas; ${PROVISION_HINT}`);
  let chromedriverPkg = 'okänd';
  try { chromedriverPkg = readPkgVersion(path.join(nm, 'chromedriver')); } catch { /* identitet rapporteras som okänd */ }

  // Hemlighetsgräns: skyddad URL konstrueras endast här, inne i körgränsen.
  let target = rawTarget;
  if (SECRET && /^https?:\/\//.test(rawTarget)) {
    const u = new URL(rawTarget);
    u.searchParams.set('x-vercel-protection-bypass', SECRET);
    u.searchParams.set('x-vercel-set-bypass-cookie', 'true');
    target = u.toString();
  }

  await preflightTarget(rawTarget, target);

  // 9-13) direkt CLI-anrop ur den pinnade installationen — inget PATH/npx.
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'axe-gate-'));
  // Chromes egen sandlåda förblir PÅ — webbläsarsäkerhet stängs aldrig av.
  const chromeOptions = ['headless=new', 'disable-gpu', 'disable-dev-shm-usage', `user-data-dir=${userDataDir}`].join(',');
  let stdout = '', execErr = null;
  try {
    stdout = execFileSync(process.execPath, [
      cliJs, target,
      '--axe-source', axeSource,
      '--chromedriver-path', chromedriverBin,
      '--tags', REQUIRED_TAGS.join(','),
      '--stdout',
      '--exit',
      '--chrome-options', chromeOptions,
      '--timeout', '90',
    ], { encoding: 'utf-8', cwd: toolRoot, timeout: 180_000, maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    // --exit ger nollskild exit vid violations; JSON kan ändå finnas på stdout.
    stdout = e.stdout || '';
    execErr = sanitize(String(e.stderr || e.message || '')).slice(0, 2000);
  } finally {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  }

  // 14) egen JSON-parsning — CLI-exitkod är aldrig ensam sanning.
  let results;
  try {
    const parsed = JSON.parse(stdout);
    results = Array.isArray(parsed) ? parsed[0] : parsed;
  } catch {
    odombar('axe-utdata är inte giltig JSON — körningen producerade inget verkligt resultat (mål onåbart, drivrutinsfel eller auth-fel)', { execError: execErr });
  }
  if (!results || !Array.isArray(results.violations)) {
    odombar('axe-JSON saknar violations-fältet — inget verkligt analysresultat', { execError: execErr });
  }

  // Hängsle till preflighten: fångades målet ändå av Chromes felsida är
  // resultatet aldrig sajtinnehåll.
  if (typeof results.url === 'string' && results.url.startsWith('chrome-error')) {
    odombar('webbläsaren renderade sin felsida (chrome-error) — målet laddades aldrig; inget sajtresultat');
  }

  // 15) motoridentitet i själva resultatet — package-metadata räcker inte ensamt.
  const engineVersion = results.testEngine?.version;
  if (engineVersion !== REQUIRED_AXE_VERSION) {
    odombar(`resultatets testEngine.version är ${engineVersion} — exakt ${REQUIRED_AXE_VERSION} krävs (motorsubstitution?)`);
  }

  // Materiell normalisering (deterministisk jämförelse).
  const normalized = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact ?? null,
    tags: [...(v.tags || [])].filter((t) => REQUIRED_TAGS.includes(t) || t.startsWith('wcag')).sort(),
    targets: (v.nodes || []).map((n) => sanitize((n.target || []).join(' '))).sort(),
  })).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const materialSha256 = crypto.createHash('sha256').update(JSON.stringify(normalized)).digest('hex');

  const report = {
    status: normalized.length === 0 ? 'PASS' : 'FAIL',
    tool: {
      name: '@axe-core/cli',
      cliVersion,
      axeCoreVersion: axeVersion,
      axeSourceSha256,
      chromedriverPackage: chromedriverPkg,
      seleniumWebdriver: (() => { try { return readPkgVersion(path.join(nm, 'selenium-webdriver')); } catch { return 'okänd'; } })(),
    },
    browser: results.testEnvironment?.userAgent ? sanitize(results.testEnvironment.userAgent) : 'okänd',
    target: sanitize(rawTarget),
    tags: REQUIRED_TAGS,
    violationsCount: normalized.length,
    violations: normalized,
    incompleteCount: Array.isArray(results.incomplete) ? results.incomplete.length : 0,
    incompleteRuleIds: Array.isArray(results.incomplete) ? results.incomplete.map((i) => i.id).sort() : [],
    materialSha256,
    note: 'incomplete-regler är EJ bevis på uppfyllda kriterier — de går till manuell granskning (Gate 4:s manuella punkter). Verktygsfel är aldrig sajt-PASS.',
  };
  emit(report);
  process.exit(normalized.length === 0 ? 0 : 1);
}

const _running = process.argv[1];
if (_running?.endsWith('run-axe-gate.mjs')) {
  main();
}
