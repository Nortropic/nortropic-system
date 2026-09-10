#!/usr/bin/env node
// check-invariants.mjs — deterministisk PLATTFORMSinvariantgrind (PINV-001–006).
// Ersätter webbinvarianterna INV-001–008 efter repouppdelningen 2026-09-10; webbens
// invariantgrind lever i webbrepot. Samma path, samma register-id (check-invariants),
// samma konventioner som förut:
//   Ren Node, inga npm-beroenden, inga natanrop. Kors fran kandidatens rot (cwd).
//   Exit 0 om alla PASS, annars exit 1. En rad per overtradelse:
//     <PINV-ID> <fil>:<rad> <kort orsak>
//   Avslutas med: X PASS, Y FAIL, Z overtradelser.
//   En kontroll som inte kan bedomas (invalid) raknas som FAIL, aldrig PASS.
//   `git ls-files` anropas via execFileSync — ingen shell, statiska argument; enda
//   syftet ar git-tree-scoping (sparade filer och deras lagen).
// PRINCIP (arvd fran INV-003): grinden scannar aldrig sin egen kallkod. PINV-003 och
// PINV-005 laser bara de namngivna kontrollplansfilerna, aldrig scripts/check-invariants.mjs.
import { readFileSync, lstatSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const CHECKS = ['PINV-001', 'PINV-002', 'PINV-003', 'PINV-004', 'PINV-005', 'PINV-006'];
const violations = [];               // { id, line }
const invalid = new Set();           // checks som inte kunde bedomas -> FAIL, aldrig PASS
function flag(id, file, line, reason) { violations.push({ id, line: `${id} ${file}:${line} ${reason}` }); }

const SPEC = 'specs/tasks.spec.json';
const REGISTER = 'controller/verify/register.json';
const VERIFY_CLI = 'controller/verify/cli';
const AUTOPILOT = 'scripts/nortropic-codex-autopilot.py';
const SELF_PATH = 'scripts/check-invariants.mjs';
const SELF_ID = 'check-invariants';
const RUNNERS = new Set(['node', 'bash']);

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const readLines = (f) => readFileSync(f, 'utf8').split('\n');
// git ls-files -s: "<mode> <oid> <stage>\t<path>" per sparad fil under path.
function tracked(...paths) {
  const out = execFileSync('git', ['ls-files', '-s', '--', ...paths], { encoding: 'utf8' });
  const rows = [];
  for (const raw of out.split('\n')) {
    if (!raw.trim()) continue;
    const tab = raw.indexOf('\t');
    const [mode] = raw.slice(0, tab).split(' ');
    rows.push({ mode, path: raw.slice(tab + 1) });
  }
  return rows;
}
const trackedFile = (path) => tracked(path).find(r => r.path === path) || null;

// ---- strikt JSON: dubblerad nyckel ar ett fel, aldrig "sista vinner" ----
function strictJson(text) {
  let i = 0;
  const ws = () => { while (i < text.length && ' \t\r\n'.includes(text[i])) i++; };
  const fail = (m) => { throw new SyntaxError(`${m} at ${i}`); };
  function value() {
    ws();
    const c = text[i];
    if (c === '{') {
      i++; const obj = {}; ws();
      if (text[i] === '}') { i++; return obj; }
      for (;;) {
        ws(); if (text[i] !== '"') fail('object key');
        const k = str(); ws(); if (text[i] !== ':') fail('colon'); i++;
        if (Object.prototype.hasOwnProperty.call(obj, k)) fail(`duplicate key ${JSON.stringify(k)}`);
        obj[k] = value(); ws();
        if (text[i] === ',') { i++; continue; }
        if (text[i] === '}') { i++; return obj; }
        fail('object');
      }
    }
    if (c === '[') {
      i++; const arr = []; ws();
      if (text[i] === ']') { i++; return arr; }
      for (;;) { arr.push(value()); ws(); if (text[i] === ',') { i++; continue; } if (text[i] === ']') { i++; return arr; } fail('array'); }
    }
    if (c === '"') return str();
    if (text.startsWith('true', i)) { i += 4; return true; }
    if (text.startsWith('false', i)) { i += 5; return false; }
    if (text.startsWith('null', i)) { i += 4; return null; }
    const m = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/.exec(text.slice(i));
    if (!m) fail('value');
    i += m[0].length; return Number(m[0]);
  }
  function str() {
    i++; let s = '';
    for (;;) {
      if (i >= text.length) fail('string');
      const c = text[i++];
      if (c === '"') return s;
      if (c === '\\') {
        const e = text[i++];
        if (e === 'u') { s += String.fromCharCode(parseInt(text.slice(i, i + 4), 16)); i += 4; }
        else s += ({ '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' })[e] ?? fail('escape');
      } else s += c;
    }
  }
  const v = value(); ws();
  if (i !== text.length) fail('trailing');
  return v;
}
function loadStrict(file) { return strictJson(readFileSync(file, 'utf8')); }

// Plattformsmangden: de trad/filer kontrollplanet far peka pa som authority. Allt annat
// (workflows/, agents/, skills/, packs/, tests/fixtures/, docs/0x-*, AUTOPILOT, ...) ar
// webbforvaltning och finns inte i detta repo.
const PLATFORM_PREFIXES = ['controller/', 'verify/', 'specs/', 'config/', 'docs/loop/', 'tests/controller/', 'tests/scripts/'];
const PLATFORM_EXACT = new Set(['controller', 'verify', 'specs', 'config', 'AGENTS.md', 'CLAUDE.md', 'README.md',
  'scripts/check-invariants.mjs', 'scripts/nortropic-codex-autopilot.py', 'scripts/check-verifierarregistret.mjs']);
const isPlatformPath = (p) => PLATFORM_EXACT.has(p) || PLATFORM_PREFIXES.some(pre => p.startsWith(pre));
// Repo-relativ path utan traversal, absolutform eller shelltecken (samma form som verify/cli).
const SAFE_REL = /^[A-Za-z0-9._/-]+$/;
const safeRel = (p) => typeof p === 'string' && p.length > 0 && SAFE_REL.test(p) && !p.startsWith('/')
  && !p.split('/').some(seg => seg === '' || seg === '.' || seg === '..');

// ---- PINV-004: specen parsar strikt; id/exit_test unika; skrivytornas glob-monster valformade ----
// Kors forst: PINV-001 bygger pa samma parsade spec och blir INVALID om specen inte kan lasas.
const GLOB_FORM = /^[A-Za-z0-9._*/-]+$/;
const globOk = (g) => typeof g === 'string' && g.length > 0 && GLOB_FORM.test(g) && !g.startsWith('/')
  && !g.split('/').some(seg => seg === '' || seg === '.' || seg === '..');
let spec = null;
try {
  spec = loadStrict(SPEC);
  if (!spec || typeof spec !== 'object' || !Array.isArray(spec.tasks)) { invalid.add('PINV-004'); spec = null; }
  else {
    const ids = new Map(); const gates = new Map();
    spec.tasks.forEach((t, n) => {
      const where = `${SPEC}:task#${n + 1}`;
      if (!t || typeof t !== 'object' || typeof t.id !== 'string' || !t.id) { flag('PINV-004', SPEC, `task#${n + 1}`, 'task saknar id som icke-tom strang'); return; }
      if (ids.has(t.id)) flag('PINV-004', SPEC, t.id, `dubblerat task-id (aven task#${ids.get(t.id)})`); else ids.set(t.id, n + 1);
      if (t.exit_test !== undefined) {
        if (!safeRel(t.exit_test)) flag('PINV-004', SPEC, t.id, `exit_test ar ingen saker repo-relativ path: ${JSON.stringify(t.exit_test)}`);
        else if (gates.has(t.exit_test)) flag('PINV-004', SPEC, t.id, `exit_test delas med ${gates.get(t.exit_test)}: ${t.exit_test}`);
        else gates.set(t.exit_test, t.id);
      }
      for (const key of ['allowed_write', 'owner_author_allowed_write', 'docs_impact']) {
        if (t[key] === undefined) continue;
        if (!Array.isArray(t[key])) { flag('PINV-004', SPEC, t.id, `${key} ar ingen lista`); continue; }
        for (const g of t[key]) if (!globOk(g)) flag('PINV-004', SPEC, t.id, `${key} har ogiltigt monster ${JSON.stringify(g)}`);
      }
      void where;
    });
    const defaults = spec.defaults && typeof spec.defaults === 'object' ? spec.defaults : {};
    for (const key of ['allowed_write', 'denied_write']) {
      if (defaults[key] === undefined) continue;
      if (!Array.isArray(defaults[key])) { flag('PINV-004', SPEC, 'defaults', `${key} ar ingen lista`); continue; }
      for (const g of defaults[key]) if (!globOk(g)) flag('PINV-004', SPEC, 'defaults', `${key} har ogiltigt monster ${JSON.stringify(g)}`);
    }
  }
} catch (e) { invalid.add('PINV-004'); spec = null; }

// ---- PINV-001: varje tasks exit_test ligger under verify/bin/ och ar, nar den ar sparad, ----
// en reguljar fil med lage 100755. En fil pa disk som INTE ar sparad ar en ohanterad grind
// (den kan inte frysas) och flaggas. En osparad, franvarande grind ar en obyggd skiva och
// ar inte en overtradelse (t.ex. h-014/h-015 vid 2026-09-10).
try {
  if (spec === null) invalid.add('PINV-001');
  else {
    const withGate = spec.tasks.filter(t => t && typeof t === 'object' && typeof t.id === 'string' && typeof t.exit_test === 'string');
    if (withGate.length === 0) invalid.add('PINV-001');   // tomt = kunde-ej-bedoma, aldrig PASS
    for (const t of withGate) {
      const g = t.exit_test;
      if (!safeRel(g) || !g.startsWith('verify/bin/') || g.split('/').length !== 3) { flag('PINV-001', SPEC, t.id, `exit_test utanfor verify/bin/: ${g}`); continue; }
      const row = trackedFile(g);
      if (row === null) {
        let onDisk = false; try { onDisk = !lstatSync(g).isDirectory() || true; } catch { onDisk = false; }
        if (onDisk) flag('PINV-001', g, 1, `grind finns pa disk men ar inte sparad i git (task ${t.id})`);
        continue;
      }
      if (row.mode !== '100755') flag('PINV-001', g, 1, `grind sparad med lage ${row.mode}, kravs 100755 (task ${t.id})`);
      else { let st; try { st = lstatSync(g); } catch { st = null; }
        if (!st || !st.isFile()) flag('PINV-001', g, 1, `grind ar inte en reguljar fil pa disk (task ${t.id})`); }
    }
  }
} catch { invalid.add('PINV-001'); }

// ---- PINV-002: registrets egen konsistens: VARJE post ar startbar med kand runner, unik path, ----
// pathen sparad som reguljar fil och sha256 pa disk == registrerad. Ett register med en
// ej startbar eller osparad post ar inte ett plattformsregister.
let register = null;
try {
  const data = loadStrict(REGISTER);
  if (!data || typeof data !== 'object' || !data.verifiers || typeof data.verifiers !== 'object' || Array.isArray(data.verifiers)) invalid.add('PINV-002');
  else {
    register = data.verifiers;
    const ids = Object.keys(register);
    if (ids.length === 0) invalid.add('PINV-002');
    const seen = new Map();
    for (const vid of ids) {
      const post = register[vid];
      if (!post || typeof post !== 'object') { flag('PINV-002', REGISTER, vid, 'posten ar ingen dict'); continue; }
      if (post.startbar !== true) flag('PINV-002', REGISTER, vid, `startbar ar inte true (${JSON.stringify(post.startbar)})`);
      if (!RUNNERS.has(post.runner)) flag('PINV-002', REGISTER, vid, `okand runner ${JSON.stringify(post.runner)}`);
      if (!safeRel(post.path)) { flag('PINV-002', REGISTER, vid, `path ar ingen saker repo-relativ path: ${JSON.stringify(post.path)}`); continue; }
      if (seen.has(post.path)) flag('PINV-002', REGISTER, vid, `path delas med ${seen.get(post.path)}: ${post.path}`); else seen.set(post.path, vid);
      if (typeof post.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(post.sha256)) { flag('PINV-002', REGISTER, vid, 'ogiltig sha256'); continue; }
      const row = trackedFile(post.path);
      if (row === null) { flag('PINV-002', REGISTER, vid, `registrerad path ar inte sparad i git: ${post.path}`); continue; }
      if (row.mode !== '100644' && row.mode !== '100755') { flag('PINV-002', REGISTER, vid, `registrerad path ar ingen reguljar fil (lage ${row.mode}): ${post.path}`); continue; }
      let st; try { st = lstatSync(post.path); } catch { st = null; }
      if (!st || !st.isFile()) { flag('PINV-002', REGISTER, vid, `registrerad path saknas eller ar inte reguljar pa disk: ${post.path}`); continue; }
      const actual = sha256(readFileSync(post.path));
      if (actual !== post.sha256) flag('PINV-002', REGISTER, vid, `hash_mismatch ${post.path}: registrerad ${post.sha256.slice(0, 12)}…, pa disk ${actual.slice(0, 12)}…`);
    }
  }
} catch { invalid.add('PINV-002'); }

// ---- PINV-003: kontrollplanets deklarerade authority-paths ar plattformspaths som finns sparade ----
// Bundet smalt och arligt: exakt tre namngivna deklarationsblock lases som text —
//   controller/verify/cli:                  PRETASK_PATHS = ( ... )   och  PLATFORM_DOCUMENTS = { ... }
//   scripts/nortropic-codex-autopilot.py:   SUBSTITUTION_BLOBS = { ... }
// Varje path-literal (eller NAME som loses ur `NAME = "..."` i samma fil) maste ligga i
// plattformsmangden OCH vara sparad i git. Saknat block -> INVALID. Mer an sa bevisar ingen grep.
function declarationBlock(lines, head, close) {
  const start = lines.findIndex(l => l.startsWith(head));
  if (start < 0) return null;
  const single = lines[start].slice(head.length).trim();
  if (single.endsWith(close)) return { start, body: [lines[start].slice(head.length)] };
  const body = [];
  for (let i = start + 1; i < lines.length; i++) { if (lines[i].trim() === close) return { start, body }; body.push(lines[i]); }
  return null;
}
function resolveName(lines, name) {
  const re = new RegExp(`^${name}\\s*=\\s*"([^"]*)"\\s*$`);
  for (const l of lines) { const m = re.exec(l); if (m) return m[1]; }
  return null;
}
function declaredPaths(file, head, close, keyed) {
  const lines = readLines(file);
  const block = declarationBlock(lines, head, close);
  if (!block) return null;
  const out = [];
  block.body.forEach((raw, k) => {
    const lineNo = block.start + 1 + (block.body.length === 1 && raw === lines[block.start].slice(head.length) ? 0 : k + 1);
    const l = raw.split('#')[0];
    if (!l.trim()) return;
    if (keyed) {
      const m = /^\s*("([^"]*)"|([A-Za-z_][A-Za-z0-9_]*))\s*:/.exec(l);
      if (!m) { out.push({ path: null, line: lineNo, text: l.trim() }); return; }
      const p = m[2] !== undefined ? m[2] : resolveName(lines, m[3]);
      out.push({ path: p, line: lineNo, text: l.trim() });
    } else {
      const strs = [...l.matchAll(/"([^"]*)"/g)].map(m => m[1]);
      if (strs.length === 0 && l.trim() !== ',') { out.push({ path: null, line: lineNo, text: l.trim() }); return; }
      for (const s of strs) out.push({ path: s, line: lineNo, text: l.trim() });
    }
  });
  return out;
}
try {
  const blocks = [
    [VERIFY_CLI, 'PRETASK_PATHS = (', ')', false],
    [VERIFY_CLI, 'PLATFORM_DOCUMENTS = {', '}', true],
    [AUTOPILOT, 'SUBSTITUTION_BLOBS = {', '}', true],
  ];
  for (const [file, head, close, keyed] of blocks) {
    if (trackedFile(file) === null) { invalid.add('PINV-003'); continue; }
    const decl = declaredPaths(file, head, close, keyed);
    if (decl === null || decl.length === 0) { invalid.add('PINV-003'); continue; }
    for (const d of decl) {
      if (d.path === null) { flag('PINV-003', file, d.line, `oupplosbar path i ${head.trim()}: ${d.text}`); continue; }
      if (!safeRel(d.path)) { flag('PINV-003', file, d.line, `osaker path i ${head.trim()}: ${JSON.stringify(d.path)}`); continue; }
      if (!isPlatformPath(d.path)) { flag('PINV-003', file, d.line, `authority-path utanfor plattformsmangden: ${d.path}`); continue; }
      if (tracked(d.path).length === 0) flag('PINV-003', file, d.line, `deklarerad authority-path ar inte sparad i repot: ${d.path}`);
    }
  }
} catch { invalid.add('PINV-003'); }

// ---- PINV-005 (NO_FORCE_SEMANTICS): guarden finns och ingen push-rad bar force ----
// Guarden: FORBIDDEN_GIT_TOKENS = ( ... ) i autopiloten med "--force" och "--force-with-lease".
// Overtradelse: en icke-kommentarrad i autopiloten eller nagon sparad controller/**/cli som
// bar bade ordet push och --force/--force-with-lease. (`worktree remove --force` ar ingen
// history overwrite och flaggas inte; kort `-f` bevisas inte av en grep och lamnas.)
try {
  if (trackedFile(AUTOPILOT) === null) invalid.add('PINV-005');
  else {
    const apLines = readLines(AUTOPILOT);
    const guard = declarationBlock(apLines, 'FORBIDDEN_GIT_TOKENS = (', ')');
    const tokens = guard ? guard.body.flatMap(l => [...l.split('#')[0].matchAll(/"([^"]*)"/g)].map(m => m[1])) : [];
    if (!guard || !tokens.includes('--force') || !tokens.includes('--force-with-lease')) invalid.add('PINV-005');
    const files = [AUTOPILOT, ...tracked('controller').map(r => r.path).filter(p => /^controller\/[^/]+\/cli$/.test(p))];
    for (const f of files) {
      readLines(f).forEach((l, i) => {
        const t = l.trim();
        if (t.startsWith('#')) return;
        if (/\bpush\b/.test(l) && /--force(-with-lease)?\b/.test(l)) flag('PINV-005', f, i + 1, 'push med force-semantik (NO_FORCE_SEMANTICS)');
      });
    }
  }
} catch { invalid.add('PINV-005'); }

// ---- PINV-006 (sjalvidentitet): registret pekar pa denna fil exakt en gang, under id ----
// check-invariants, och de bytes som KORS (process.argv[1], t.ex. authority-snapshotens
// kopia) ar exakt de bytes som ligger sparade pa scripts/check-invariants.mjs i kandidattradet.
try {
  if (register === null) invalid.add('PINV-006');
  else {
    const hits = Object.entries(register).filter(([, p]) => p && p.path === SELF_PATH);
    if (hits.length !== 1) flag('PINV-006', REGISTER, SELF_PATH, `${hits.length} poster pekar pa ${SELF_PATH}, kravs exakt 1`);
    else if (hits[0][0] !== SELF_ID) flag('PINV-006', REGISTER, hits[0][0], `posten for ${SELF_PATH} heter inte ${SELF_ID}`);
    const own = process.argv[1];
    const treeRow = trackedFile(SELF_PATH);
    if (!own || treeRow === null) invalid.add('PINV-006');
    else {
      const executed = sha256(readFileSync(own));
      const inTree = sha256(readFileSync(SELF_PATH));
      // Registrets sha256 mot tradfilen ags av PINV-002; har binds bara korda bytes == tradets bytes.
      if (executed !== inTree) flag('PINV-006', SELF_PATH, 1, `korda bytes ${executed.slice(0, 12)}… != sparade bytes ${inTree.slice(0, 12)}…`);
    }
  }
} catch { invalid.add('PINV-006'); }

// ---- Rapport ----
for (const v of violations) console.log(v.line);
for (const id of CHECKS) if (invalid.has(id)) console.log(`${id} <ingen input>:0 KUNDE-EJ-BEDOMA (INVALID, raknas som FAIL)`);

const failed = new Set([...violations.map(v => v.id), ...invalid]);
const pass = CHECKS.filter(c => !failed.has(c)).length;
const fail = CHECKS.length - pass;
console.log(`\n${pass} PASS, ${fail} FAIL, ${violations.length} overtradelser`);
process.exit(fail === 0 ? 0 : 1);
