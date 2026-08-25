/**
 * R5 — mekanisk vendored-integritetsverifierare (2026-08-25).
 *
 * Läs-ENDAST. Bevisar att de nio lastbärande vendorerade skill-träden under
 * $ROT/vendored-skills/ byte-exakt matchar det granskade förväntansmanifestet
 * config/vendored-integrity.v1.json.
 *
 * Verifieraren:
 *   - hämtar ALDRIG uppström, uppdaterar ALDRIG något;
 *   - skriver ALDRIG (inga --update/--accept/--fix/--generate-lägen);
 *   - författar ALDRIG sin egen mätsticka (manifestet ändras endast i en
 *     ägargranskad förtroende-transition, tillsammans med foundation-K5a:s
 *     skyddade pinnar);
 *   - litar aldrig på körtidskopior eller VENDORED.md-prosa — den mäter de
 *     kanoniska byten själv.
 *
 * HASHSCHEMA v1 (deterministiskt, node:crypto, ingen lokalberoende pipeline):
 *   1. räkna upp varje REGULJÄR fil rekursivt under skill-katalogen
 *      (INKLUSIVE SKILL.md, VENDORED.md, LICENSE, references, scripts — allt;
 *      förväntansvärdet bor utanför det mätta trädet, så inget undantas);
 *   2. relativa sökvägar normaliseras till '/';
 *   3. sortera sökvägarna deterministiskt i UTF-8-byteordning (Buffer.compare);
 *   4. mode klassas som '100755' om någon exekveringsbit är satt, annars '100644';
 *   5. SHA-256 över varje fils EXAKTA bytes (ingen normalisering av radslut,
 *      whitespace, JSON, Markdown eller källkod — BYTES ÄR BYTES);
 *   6. per fil matas EN otvetydig post in i aggregatet:
 *         <mode>\0<relativ-sökväg>\0<fil-sha256>\n
 *   7. träd-hash = SHA-256 (hex) över den ordnade postströmmen.
 *   Ett namnbyte, en exekveringsbitsändring, en tillagd/raderad fil ändrar
 *   alltså träd-hashen. Symlänkar, sockets, enheter, FIFO:er och andra
 *   icke-reguljära poster AVVISAS (FAIL) — inga tysta symlänk-semantiker.
 *
 * Verdiktalgebra (verify/bin-disciplinen): exit 0 = alla nio PASS,
 * exit 1 = FAIL (avvikelse), exit 2 = KUNDE-EJ-KÖRAS (odömbar: rot/identitet/
 * manifest oläsbara, eller noll mätta skills — tomhet är aldrig grönt).
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const MANIFEST_REL = 'config/vendored-integrity.v1.json';
const EXPECTED_SCHEMA = 'nortropic-vendored-integrity';
const EXPECTED_VERSION = 1;
const EXPECTED_COUNT = 9;

function odombar(msg) { console.error(`KUNDE-EJ-KÖRAS: ${msg}`); process.exit(2); }

// ── R1-regeln: mekanisk rotupplösning + identitetsverifiering ──────────────
export function resolveRoot(cwd = process.cwd()) {
  let root;
  try {
    root = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd, encoding: 'utf-8' }).trim();
  } catch {
    return { error: 'ingen git-topp — körning utanför repo vägras (aldrig gissad rot)' };
  }
  let origin;
  try {
    origin = execFileSync('git', ['-C', root, 'remote', 'get-url', 'origin'], { encoding: 'utf-8' }).trim();
  } catch {
    return { error: 'origin saknas' };
  }
  if (!origin.includes('Nortropic/nortropic-system')) {
    return { error: `origin är '${origin}' — inte Nortropic/nortropic-system (identitet före konsumtion)` };
  }
  if (!fs.existsSync(path.join(root, 'docs/07-konstitution.md'))) return { error: 'ankarfil docs/07-konstitution.md saknas' };
  if (!fs.existsSync(path.join(root, 'AUTOPILOT'))) return { error: 'ankarfil AUTOPILOT saknas' };
  return { root };
}

// ── Hashschema v1 ──────────────────────────────────────────────────────────
export function hashSkillTree(skillDir) {
  const files = [];
  (function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const abs = path.join(dir, entry.name);
      const st = fs.lstatSync(abs);
      if (st.isDirectory()) { walk(abs); continue; }
      if (!st.isFile()) {
        throw new Error(`icke-reguljär post: ${path.relative(skillDir, abs)} (symlänk/socket/enhet/FIFO avvisas)`);
      }
      const rel = path.relative(skillDir, abs).split(path.sep).join('/');
      const mode = (st.mode & 0o111) !== 0 ? '100755' : '100644';
      files.push({ rel, mode, abs });
    }
  })(skillDir);

  files.sort((a, b) => Buffer.compare(Buffer.from(a.rel, 'utf-8'), Buffer.from(b.rel, 'utf-8')));

  const agg = crypto.createHash('sha256');
  for (const f of files) {
    const fileSha = crypto.createHash('sha256').update(fs.readFileSync(f.abs)).digest('hex');
    agg.update(`${f.mode}\0${f.rel}\0${fileSha}\n`, 'utf-8');
  }
  return { treeSha256: agg.digest('hex'), fileCount: files.length };
}

// ── Manifestläsning med strikt schema + dubblettdetektion ──────────────────
export function loadManifest(root) {
  const p = path.join(root, MANIFEST_REL);
  if (!fs.existsSync(p)) return { error: `manifestet saknas: ${MANIFEST_REL}` };
  let raw;
  try { raw = fs.readFileSync(p, 'utf-8'); } catch (e) { return { error: `manifestet oläsbart: ${e.message}` }; }

  // JSON.parse kollapsar dubblettnycklar tyst — detektera dem i råtexten.
  const keyRe = /"([A-Za-z0-9._-]+)"\s*:\s*\{/g;
  const seen = new Map();
  let m;
  while ((m = keyRe.exec(raw)) !== null) {
    if (m[1] === 'skills') continue;
    seen.set(m[1], (seen.get(m[1]) || 0) + 1);
  }
  for (const [name, n] of seen) {
    if (n > 1) return { error: `dubblettpost i manifestet: ${name}` };
  }

  let doc;
  try { doc = JSON.parse(raw); } catch (e) { return { error: `manifestet är inte giltig JSON: ${e.message}` }; }
  if (doc?.schema !== EXPECTED_SCHEMA) return { error: `fel schema: ${doc?.schema}` };
  if (doc?.version !== EXPECTED_VERSION) return { error: `fel version: ${doc?.version}` };
  if (typeof doc?.hashAlgorithm !== 'string' || !doc.hashAlgorithm.startsWith('v1:')) {
    return { error: 'hashAlgorithm saknas eller är inte v1' };
  }
  if (!doc?.skills || typeof doc.skills !== 'object' || Array.isArray(doc.skills)) {
    return { error: 'skills-objektet saknas' };
  }
  const names = Object.keys(doc.skills);
  if (names.length !== EXPECTED_COUNT) return { error: `manifestet har ${names.length} poster — exakt ${EXPECTED_COUNT} krävs` };
  for (const name of names) {
    const e = doc.skills[name];
    if (!e || typeof e !== 'object') return { error: `posten ${name} är inte ett objekt` };
    if (typeof e.treeSha256 !== 'string' || !/^[0-9a-f]{64}$/.test(e.treeSha256)) return { error: `posten ${name} saknar giltig treeSha256` };
    if (!Number.isInteger(e.fileCount) || e.fileCount < 1) return { error: `posten ${name} saknar giltigt fileCount` };
  }
  return { manifest: doc, names };
}

// ── CLI ────────────────────────────────────────────────────────────────────
function main() {
  const argv = process.argv.slice(2);
  for (const a of argv) {
    // Inga skrivlägen existerar; okända flaggor vägras hellre än ignoreras tyst.
    odombar(`okänt argument '${a}' — verifieraren har inga lägen (och ALDRIG --update/--accept/--fix)`);
  }

  const rootRes = resolveRoot();
  if (rootRes.error) odombar(rootRes.error);
  const root = rootRes.root;

  const manRes = loadManifest(root);
  if (manRes.error) odombar(manRes.error);
  const { manifest, names } = manRes;

  const vdir = path.join(root, 'vendored-skills');
  if (!fs.existsSync(vdir)) odombar('vendored-skills/ saknas');
  const actual = fs.readdirSync(vdir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  let failures = 0;
  let measured = 0;
  const expectedSet = new Set(names);
  for (const dir of actual) {
    if (!expectedSet.has(dir)) { console.log(`FAIL ${dir}: oväntad vendored-katalog utanför manifestet`); failures++; }
  }
  for (const name of [...names].sort()) {
    const skillDir = path.join(vdir, name);
    if (!fs.existsSync(skillDir)) { console.log(`FAIL ${name}: kanonisk katalog saknas`); failures++; continue; }
    if (!fs.existsSync(path.join(skillDir, 'VENDORED.md'))) { console.log(`FAIL ${name}: VENDORED.md saknas`); failures++; continue; }
    let res;
    try { res = hashSkillTree(skillDir); } catch (e) { console.log(`FAIL ${name}: ${e.message}`); failures++; continue; }
    measured++;
    const exp = manifest.skills[name];
    if (res.fileCount !== exp.fileCount) {
      console.log(`FAIL ${name}: filantal ${res.fileCount} ≠ förväntade ${exp.fileCount}`);
      failures++;
    } else if (res.treeSha256 !== exp.treeSha256) {
      console.log(`FAIL ${name}: träd-hash ${res.treeSha256} ≠ förväntade ${exp.treeSha256}`);
      failures++;
    } else {
      console.log(`PASS ${name}: ${res.fileCount} filer, träd ${res.treeSha256.slice(0, 12)}…`);
    }
  }

  if (measured === 0) odombar('noll skills mätta — tomhet är aldrig grönt');
  if (failures > 0) { console.log(`RESULTAT: FAIL — ${failures} avvikelse(r) mot manifestet`); process.exit(1); }
  console.log(`RESULTAT: PASS — ${measured}/${EXPECTED_COUNT} kanoniska träd matchar manifestet exakt`);
  process.exit(0);
}

const _running = process.argv[1];
if (_running?.endsWith('verify-vendored-integrity.mjs')) {
  main();
}
