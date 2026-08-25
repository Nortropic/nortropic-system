/**
 * CLI helper: insert/remove the live variant mode script tag in the project's
 * main HTML entry point.
 *
 * On first live run, the agent generates `.impeccable/live/config.json`
 * with the project's insertion target (framework-specific). On
 * every subsequent run, this script handles insert/remove deterministically
 * with zero LLM involvement.
 *
 * Usage:
 *   node live-inject.mjs --port PORT   # Insert the live script tag
 *   node live-inject.mjs --remove      # Remove the live script tag
 *   node live-inject.mjs --check       # Check whether live config exists
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveLiveConfigPath } from './lib/impeccable-paths.mjs';
import {
  applySvelteKitLiveAdapter,
  detectSvelteKitProject,
  removeSvelteKitLiveAdapter,
} from './live/sveltekit-adapter.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolveLiveConfigPath({ cwd: process.cwd(), scriptsDir: __dirname });
const MARKER_OPEN_TEXT = 'impeccable-live-start';
const MARKER_CLOSE_TEXT = 'impeccable-live-end';
const IGNORE_MARKER_OPEN = '# impeccable-live-ignore-start';
const IGNORE_MARKER_CLOSE = '# impeccable-live-ignore-end';

export const LIVE_IGNORE_PATTERNS = Object.freeze([
  '.impeccable/hook.cache.json',
  '.impeccable/hook.pending.json',
  '.impeccable/config.local.json',
  '.impeccable/live/server.json',
  '.impeccable/live/sessions/',
  '.impeccable/live/previews/',
  '.impeccable/live/annotations/',
  '.impeccable/live/cache/',
  '.impeccable/live/manual-edit-apply-transaction.json',
  '.impeccable/live/manual-edit-events.jsonl',
  '.impeccable/live/manual-edit-evidence/',
  '.impeccable/live/pending-manual-edits.json',
  '.impeccable/live/deferred-svelte-component-accepts.json',
  '.impeccable-live.json',
  '.impeccable-live/',
  'node_modules/.impeccable-live/',
  'src/lib/impeccable/ImpeccableLiveRoot.svelte',
  'src/lib/impeccable/__runtime.js',
  'src/lib/impeccable/[0-9a-f]*/',
]);

/**
 * Hard-excluded directory patterns. These are NEVER user-facing pages and
 * matching them would silently inject tracking scripts into third-party
 * code. The user cannot turn these off via config — they are the floor.
 */
const HARD_EXCLUDES = [
  '**/node_modules/**',
  '**/.git/**',
];

export async function injectCli() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: node live-inject.mjs [options]

Insert or remove the live mode script tag in the project's HTML entry point.
Reads configuration from .impeccable/live/config.json.

Modes:
  --port PORT   Insert script tag pointing at http://localhost:PORT/live.js
  --remove      Remove the script tag (if present)
  --check       Print whether .impeccable/live/config.json exists and its content

Output (JSON):
  { ok, file, inserted|removed, config? }`);
    process.exit(0);
  }

  if (args.includes('--check')) {
    if (!fs.existsSync(CONFIG_PATH)) {
      console.log(JSON.stringify({ ok: false, error: 'config_missing', path: CONFIG_PATH }));
      process.exit(0);
    }
    let cfg;
    try {
      cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    } catch (err) {
      console.log(JSON.stringify({ ok: false, error: 'config_invalid', message: err.message, path: CONFIG_PATH }));
      return;
    }
    try {
      validateConfig(cfg);
    } catch (err) {
      console.log(JSON.stringify({ ok: false, error: 'config_invalid', message: err.message, path: CONFIG_PATH }));
      return;
    }
    console.log(JSON.stringify({ ok: true, config: cfg, path: CONFIG_PATH }));
    return;
  }

  // Load config
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(JSON.stringify({ ok: false, error: 'config_missing', path: CONFIG_PATH }));
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  validateConfig(config);

  const resolvedFiles = resolveFiles(process.cwd(), config);
  const svelteKit = detectSvelteKitProject(process.cwd(), config);

  if (args.includes('--remove')) {
    if (svelteKit) {
      const adapterResult = removeSvelteKitLiveAdapter({ cwd: process.cwd(), config });
      console.log(JSON.stringify({ ok: true, adapter: 'sveltekit', results: [adapterResult] }));
      return;
    }
    const results = resolvedFiles.map((relFile) => {
      const absFile = path.resolve(process.cwd(), relFile);
      if (!fs.existsSync(absFile)) return { file: relFile, error: 'file_not_found' };
      const content = fs.readFileSync(absFile, 'utf-8');
      const detagged = removeTag(content, config.commentSyntax);
      const updated = revertCspMeta(detagged);
      if (updated === content) return { file: relFile, removed: false, note: 'no tag present' };
      fs.writeFileSync(absFile, updated, 'utf-8');
      return {
        file: relFile,
        removed: detagged !== content,
        cspReverted: updated !== detagged,
      };
    });
    console.log(JSON.stringify({ ok: true, results }));
    return;
  }

  // Insert mode — need --port
  const portIdx = args.indexOf('--port');
  const port = portIdx !== -1 ? parseInt(args[portIdx + 1], 10) : NaN;
  if (!Number.isFinite(port)) {
    console.error(JSON.stringify({ ok: false, error: 'missing_port' }));
    process.exit(1);
  }
  // R4 (Nortropic fork): CSP compatibility gate BEFORE any mutation — including
  // the git-ignore write. Live mode NEVER broadens a security policy
  // automatically; if the source CSP would need new origins/directives the run
  // blocks structurally instead of rewriting it. Legacy markers are judged
  // post-restore so a historically patched policy is evaluated by its ORIGINAL
  // bytes.
  if (!svelteKit) {
    const blocking = [];
    for (const relFile of resolvedFiles) {
      const absFile = path.resolve(process.cwd(), relFile);
      if (!fs.existsSync(absFile)) continue;
      const restored = revertCspMeta(fs.readFileSync(absFile, 'utf-8'));
      const check = checkCspMetaCompatibility(restored, port);
      if (!check.compatible) blocking.push({ file: relFile, missing: check.missing });
    }
    if (blocking.length > 0) {
      console.error(JSON.stringify({
        ok: false,
        error: 'CSP_REQUIRES_EXPLICIT_DEV_AUTHORITY',
        port,
        blocking,
        note: 'Live mode would require broadening a source-level Content-Security-Policy. ' +
          'Nothing was modified. Broadening a CSP for dev use is an explicit human/dev-authority change, never automatic.',
      }));
      process.exit(1);
    }
  }
  const gitIgnore = ensureLiveGitIgnores(process.cwd());

  if (svelteKit) {
    const adapterResult = applySvelteKitLiveAdapter({ cwd: process.cwd(), port, config });
    console.log(JSON.stringify({ ok: true, port, adapter: 'sveltekit', gitIgnore, results: [adapterResult] }));
    return;
  }

  const results = resolvedFiles.map((relFile) => {
    const absFile = path.resolve(process.cwd(), relFile);
    if (!fs.existsSync(absFile)) return { file: relFile, error: 'file_not_found' };
    const content = fs.readFileSync(absFile, 'utf-8');
    const withoutOld = revertCspMeta(removeTag(content, config.commentSyntax));
    const withTag = insertTag(withoutOld, config, port, relFile);
    if (withTag === withoutOld) {
      return { file: relFile, error: 'insertion_point_not_found', anchor: config.insertBefore || config.insertAfter };
    }
    fs.writeFileSync(absFile, withTag, 'utf-8');
    return {
      file: relFile,
      inserted: true,
      cspRewritten: false,
    };
  });
  const anyInserted = results.some((r) => r.inserted);
  console.log(JSON.stringify({ ok: anyInserted, port, gitIgnore, results }));
  if (!anyInserted) process.exit(1);
}

export function ensureLiveGitIgnores(cwd = process.cwd()) {
  const target = resolveIgnoreTarget(cwd);
  const existing = fs.existsSync(target.path) ? fs.readFileSync(target.path, 'utf-8') : '';
  const block = [
    IGNORE_MARKER_OPEN,
    ...LIVE_IGNORE_PATTERNS,
    IGNORE_MARKER_CLOSE,
  ].join('\n');
  const markerRe = new RegExp(`${escapeRegExp(IGNORE_MARKER_OPEN)}[\\s\\S]*?${escapeRegExp(IGNORE_MARKER_CLOSE)}`);

  let updated;
  if (markerRe.test(existing)) {
    updated = existing.replace(markerRe, block);
  } else {
    const prefix = existing.length === 0 ? '' : existing.endsWith('\n') ? existing : existing + '\n';
    updated = `${prefix}${prefix.endsWith('\n\n') || prefix === '' ? '' : '\n'}${block}\n`;
  }

  if (updated !== existing) {
    fs.mkdirSync(path.dirname(target.path), { recursive: true });
    fs.writeFileSync(target.path, updated, 'utf-8');
  }

  return {
    file: path.relative(cwd, target.path).split(path.sep).join('/'),
    mode: target.mode,
    changed: updated !== existing,
    patterns: [...LIVE_IGNORE_PATTERNS],
  };
}

function resolveIgnoreTarget(cwd) {
  const gitExcludePath = resolveGitInfoExcludePath(cwd);
  if (gitExcludePath) {
    return { path: gitExcludePath, mode: 'git-info-exclude' };
  }
  return { path: path.join(cwd, '.gitignore'), mode: 'gitignore' };
}

function resolveGitInfoExcludePath(cwd) {
  const dotGit = path.join(cwd, '.git');
  if (!fs.existsSync(dotGit)) return null;

  const stat = fs.statSync(dotGit);
  if (stat.isDirectory()) return path.join(dotGit, 'info', 'exclude');
  if (!stat.isFile()) return null;

  const body = fs.readFileSync(dotGit, 'utf-8').trim();
  const match = body.match(/^gitdir:\s*(.+)$/i);
  if (!match) return null;
  const gitDir = path.isAbsolute(match[1]) ? match[1] : path.resolve(cwd, match[1]);
  return path.join(gitDir, 'info', 'exclude');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Expand config.files (which may contain glob patterns) into a literal list
 * of existing file paths relative to rootDir. Literal entries pass through;
 * glob patterns are expanded via fs.globSync. HARD_EXCLUDES and config.exclude
 * are applied as filters. Duplicates are removed. Order is preserved by
 * first appearance.
 */
export function resolveFiles(rootDir, config) {
  const patterns = config.files;
  const userExcludes = Array.isArray(config.exclude) ? config.exclude : [];
  const allExcludes = [...HARD_EXCLUDES, ...userExcludes];
  const excludeRegexes = allExcludes.map(globToRegex);

  const isExcluded = (relPath) => excludeRegexes.some((re) => re.test(relPath));
  const isGlob = (s) => /[*?[]/.test(s);

  const seen = new Set();
  const out = [];
  for (const pat of patterns) {
    if (!isGlob(pat)) {
      // Literal path — include even if it doesn't exist yet; the caller
      // reports file_not_found per-entry. Exclude list doesn't apply to
      // explicit literal entries (user named it on purpose).
      if (!seen.has(pat)) {
        seen.add(pat);
        out.push(pat);
      }
      continue;
    }
    let matches;
    try {
      matches = fs.globSync(pat, { cwd: rootDir, withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of matches) {
      if (!ent.isFile || !ent.isFile()) continue;
      const abs = path.join(ent.parentPath || ent.path || rootDir, ent.name);
      const rel = path.relative(rootDir, abs).split(path.sep).join('/');
      if (isExcluded(rel)) continue;
      if (seen.has(rel)) continue;
      seen.add(rel);
      out.push(rel);
    }
  }
  return out;
}

/**
 * Convert a glob pattern to a RegExp. Supports:
 *   **  → any number of path segments (including zero)
 *   *   → any chars except `/`
 *   ?   → any single char except `/`
 * Paths are normalized to forward slashes before matching.
 */
function globToRegex(pattern) {
  let re = '';
  let i = 0;
  while (i < pattern.length) {
    const c = pattern[i];
    if (c === '*') {
      if (pattern[i + 1] === '*') {
        // ** — any number of segments, including zero. Handle the common
        // **/ and /** forms so `a/**/b` matches `a/b` as well as `a/x/y/b`.
        if (pattern[i + 2] === '/') {
          re += '(?:.*/)?';
          i += 3;
        } else {
          re += '.*';
          i += 2;
        }
      } else {
        re += '[^/]*';
        i += 1;
      }
    } else if (c === '?') {
      re += '[^/]';
      i += 1;
    } else if (/[.+^${}()|[\]\\]/.test(c)) {
      re += '\\' + c;
      i += 1;
    } else {
      re += c;
      i += 1;
    }
  }
  return new RegExp('^' + re + '$');
}

// ---------------------------------------------------------------------------
// Core operations
// ---------------------------------------------------------------------------

function validateConfig(cfg) {
  if (!cfg || typeof cfg !== 'object') throw new Error('config.json must be an object');
  if (!Array.isArray(cfg.files) || cfg.files.length === 0) {
    throw new Error('config.files (non-empty string array) required');
  }
  if (!cfg.files.every((f) => typeof f === 'string' && f.length > 0)) {
    throw new Error('config.files must contain only non-empty strings');
  }
  if (cfg.exclude !== undefined) {
    if (!Array.isArray(cfg.exclude)) {
      throw new Error('config.exclude, if present, must be a string array');
    }
    if (!cfg.exclude.every((f) => typeof f === 'string' && f.length > 0)) {
      throw new Error('config.exclude must contain only non-empty strings');
    }
  }
  if (typeof cfg.insertBefore !== 'string' && typeof cfg.insertAfter !== 'string') {
    throw new Error('config.insertBefore or config.insertAfter (string) required');
  }
  if (cfg.commentSyntax !== 'html' && cfg.commentSyntax !== 'jsx') {
    throw new Error("config.commentSyntax must be 'html' or 'jsx'");
  }
  if (cfg.cspChecked !== undefined && typeof cfg.cspChecked !== 'boolean') {
    throw new Error("config.cspChecked, if present, must be a boolean");
  }
}

function commentOpen(syntax) { return syntax === 'jsx' ? '{/*' : '<!--'; }
function commentClose(syntax) { return syntax === 'jsx' ? '*/}' : '-->'; }

function buildTagBlock(syntax, port, filePath) {
  const open = commentOpen(syntax);
  const close = commentClose(syntax);
  // Astro processes <script> tags by default and rewrites src to its own
  // bundled URL. is:inline opts out so the literal external src survives.
  const isAstro = typeof filePath === 'string' && filePath.endsWith('.astro');
  const scriptAttrs = isAstro ? 'is:inline ' : '';
  return (
    open + ' ' + MARKER_OPEN_TEXT + ' ' + close + '\n' +
    '<script ' + scriptAttrs + 'src="http://localhost:' + port + '/live.js"></script>\n' +
    open + ' ' + MARKER_CLOSE_TEXT + ' ' + close + '\n'
  );
}

function detectLineEnding(content) {
  if (content.includes('\r\n')) return '\r\n';
  if (content.includes('\r')) return '\r';
  return '\n';
}

function normalizeLineEndings(content, lineEnding) {
  return lineEnding === '\n' ? content : content.replace(/\n/g, lineEnding);
}

function readLineEndingAt(content, index) {
  if (content[index] === '\r' && content[index + 1] === '\n') return '\r\n';
  if (content[index] === '\n') return '\n';
  if (content[index] === '\r') return '\r';
  return '';
}

function insertTag(content, config, port, filePath) {
  const lineEnding = detectLineEnding(content);
  const block = normalizeLineEndings(buildTagBlock(config.commentSyntax, port, filePath), lineEnding);
  // insertBefore: match the LAST occurrence. Anchors like `</body>` naturally
  // belong at the end, and the same literal can appear earlier in code blocks
  // within rendered documentation pages.
  if (config.insertBefore) {
    const idx = content.lastIndexOf(config.insertBefore);
    if (idx === -1) return content;
    return content.slice(0, idx) + block + content.slice(idx);
  }
  // insertAfter: match the FIRST occurrence — typical anchors like `<head>` or
  // `<body>` open near the top of the document.
  const idx = content.indexOf(config.insertAfter);
  if (idx === -1) return content;
  const after = idx + config.insertAfter.length;
  // Preserve an existing trailing newline if the anchor already has one.
  // Slice the remainder from the original anchor offset, not prefix.length:
  // in the no-newline case prefix is one char longer than the anchor (the
  // appended '\n'), so slicing by prefix.length would drop the first real
  // character after the anchor (#227).
  const existingNewline = readLineEndingAt(content, after);
  const prefix = content.slice(0, after) + (existingNewline || lineEnding);
  const rest = content.slice(after + existingNewline.length);
  return prefix + block + rest;
}

/**
 * Remove the live script block. Matches either HTML or JSX comment markers
 * regardless of config (so stale tags from a wrong config can still be cleaned).
 *
 * Indent-preserving: captures any whitespace immediately preceding the opener
 * marker and re-emits it in place of the removed block. `insertTag` inserted
 * the block *after* the original line's indent and *before* the anchor (e.g.
 * `</body>`), which moved the indent onto the opener line and left the anchor
 * unindented. Replacing the whole block (plus its trailing newline) with just
 * the captured indent hands the indent back to the anchor that follows.
 */
function removeTag(content, _syntax) {
  const patterns = [
    /([ \t]*)<!--\s*impeccable-live-start\s*-->[\s\S]*?<!--\s*impeccable-live-end\s*-->([ \t]*(?:\r\n|\n|\r|$)?)/,
    /([ \t]*)\{\/\*\s*impeccable-live-start\s*\*\/\}[\s\S]*?\{\/\*\s*impeccable-live-end\s*\*\/\}([ \t]*(?:\r\n|\n|\r|$)?)/,
  ];
  for (const pat of patterns) {
    let changed = false;
    let next = content;
    do {
      content = next;
      next = content.replace(pat, (_match, leadingIndent, trailing = '') => {
        if (/[\r\n]/.test(trailing)) return leadingIndent;
        return leadingIndent || trailing || '';
      });
      if (next !== content) changed = true;
    } while (next !== content);
    if (changed) return next;
  }
  return content;
}

// ---------------------------------------------------------------------------
// Content-Security-Policy meta-tag COMPATIBILITY CHECK (R4, Nortropic fork)
//
// When the user's HTML carries `<meta http-equiv="Content-Security-Policy">`,
// the cross-origin load of /live.js (and the SSE/POST connection back to
// localhost:PORT) is blocked unless the CSP already allows that origin.
//
// Upstream auto-appended the localhost origin to script-src/connect-src and
// `blob:` to img-src, stashing the original in `data-impeccable-csp-original`.
// The Nortropic fork REMOVED that auto-broadening: a security policy in
// project source is never weakened automatically. Instead the insert path
// runs `checkCspMetaCompatibility` BEFORE any mutation and blocks with
// `CSP_REQUIRES_EXPLICIT_DEV_AUTHORITY` (exact missing directives/origins)
// when the policy would need broadening.
//
// `revertCspMeta` is retained for LEGACY CLEANUP ONLY: it restores the exact
// original policy bytes from a historical `data-impeccable-csp-original`
// marker left by prior upstream runs. Restore, never broaden.
//
// Header-based CSP (Next.js headers, Nuxt routeRules, SvelteKit kit.csp,
// shared helpers) is untouched here exactly as before — see detect-csp.mjs.
// ---------------------------------------------------------------------------

const CSP_MARKER_ATTR = 'data-impeccable-csp-original';

function findCspMetaTags(content) {
  const out = [];
  const tagRe = /<meta\s+([^>]*?)\/?>/gis;
  let m;
  while ((m = tagRe.exec(content)) !== null) {
    const attrs = m[1];
    if (!/(http-equiv|httpEquiv)\s*=\s*(['"])Content-Security-Policy\2/i.test(attrs)) continue;
    out.push({ start: m.index, end: m.index + m[0].length, full: m[0], attrs });
  }
  return out;
}

function getAttr(attrs, name) {
  const re = new RegExp(`\\b${name}\\s*=\\s*(['"])([\\s\\S]*?)\\1`, 'i');
  const m = attrs.match(re);
  return m ? { quote: m[1], value: m[2], full: m[0] } : null;
}

function parseDirectiveTokens(csp, directive) {
  const re = new RegExp(`(^|;)\\s*${directive}\\s+([^;]*)`, 'i');
  const m = csp.match(re);
  return m ? m[2].trim().split(/\s+/).filter(Boolean) : null;
}

/**
 * Does this CSP policy already allow `required` under `directive`?
 * CSP fallback semantics: a missing fetch directive falls back to default-src;
 * when default-src is also absent the fetch is unrestricted → allowed.
 * Conservative source matching: an origin is allowed by its exact token, a
 * host/port wildcard for the same host, a bare `*`, or its scheme source
 * (`http:`). `blob:` is allowed ONLY by an explicit `blob:` token — per the
 * CSP spec, `*` does not match blob:/data: schemes.
 */
function directiveAllows(csp, directive, required) {
  let tokens = parseDirectiveTokens(csp, directive);
  if (tokens === null) tokens = parseDirectiveTokens(csp, 'default-src');
  if (tokens === null) return true;
  const lower = tokens.map((t) => t.toLowerCase());
  if (required === 'blob:') return lower.includes('blob:');
  const url = new URL(required);
  const accepted = [
    required.toLowerCase(),
    `${url.protocol}//${url.hostname}:*`,
    `${url.hostname}:${url.port}`,
    `${url.hostname}:*`,
    '*',
    url.protocol,
  ];
  return accepted.some((tok) => lower.includes(tok));
}

/**
 * Pre-mutation gate for the insert path. Returns { compatible, missing }
 * where `missing` lists the exact { directive, required } pairs the policy
 * would have to gain for live mode to work. Every CSP meta tag must allow
 * every requirement (multiple policies intersect). Never mutates anything.
 */
export function checkCspMetaCompatibility(content, port) {
  const tags = findCspMetaTags(content);
  if (tags.length === 0) return { compatible: true, missing: [] };
  const origin = `http://localhost:${port}`;
  const missing = [];
  for (const tag of tags) {
    const contentAttr = getAttr(tag.attrs, 'content');
    if (!contentAttr) continue;
    for (const [directive, required] of [
      ['script-src', origin],
      ['connect-src', origin],
      ['img-src', 'blob:'],
    ]) {
      if (!directiveAllows(contentAttr.value, directive, required)) {
        missing.push({ directive, required });
      }
    }
  }
  return { compatible: missing.length === 0, missing };
}

export function revertCspMeta(content) {
  const tags = findCspMetaTags(content);
  if (tags.length === 0) return content;

  let result = content;
  for (let i = tags.length - 1; i >= 0; i--) {
    const tag = tags[i];
    const origAttr = getAttr(tag.attrs, CSP_MARKER_ATTR);
    if (!origAttr) continue;
    const contentAttr = getAttr(tag.attrs, 'content');
    if (!contentAttr) continue;

    let originalValue;
    try { originalValue = Buffer.from(origAttr.value, 'base64').toString('utf-8'); }
    catch { continue; }

    const newContentAttr = `content=${contentAttr.quote}${originalValue}${contentAttr.quote}`;
    let newAttrs = tag.attrs.replace(contentAttr.full, newContentAttr);
    // Drop the marker attribute and any single space immediately preceding it.
    newAttrs = newAttrs.replace(new RegExp(`\\s*${origAttr.full}`), '');
    const newTag = tag.full.replace(tag.attrs, newAttrs);

    result = result.slice(0, tag.start) + newTag + result.slice(tag.end);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Auto-execute
// ---------------------------------------------------------------------------

const _running = process.argv[1];
if (_running?.endsWith('live-inject.mjs') || _running?.endsWith('live-inject.mjs/')) {
  injectCli();
}

export { insertTag, removeTag, validateConfig, buildTagBlock };
// checkCspMetaCompatibility + revertCspMeta are exported above where they're
// defined. patchCspMeta (upstream's automatic CSP broadening) was removed in
// the R4 Nortropic fork — see the CSP section comment.
