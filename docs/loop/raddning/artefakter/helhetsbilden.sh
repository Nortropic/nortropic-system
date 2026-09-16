#!/usr/bin/env bash
# helhetsbilden.sh — LÄSER BARA. Skriver ut hela lägesbilden, MÄTT.
#
#     bash docs/loop/raddning/artefakter/helhetsbilden.sh              # snabb, ~2 sek
#     bash docs/loop/raddning/artefakter/helhetsbilden.sh --kor-grindar # kör de 14, Darwin
#
# VARFÖR DEN FINNS. Ägaren 2026-09-16: "det första måste ju vara skapa en bild av
# helheten, hjälper inte dokumentationen till med det? DETTA är varför vi snurrar
# runt i galenskap varje gång."
#
# Svaret var nej. docs/loop/raddning/ är 20 filer och ~4000 rader som beskriver
# helheten på fem överlappande sätt, och ingen av dem visar LÄGET. Ett dokument om
# ett tillstånd är inaktuellt dagen efter — det är projektets egen lag, och skälet
# till att status bor i drift.md. Helheten måste alltså RÄKNAS FRAM varje gång,
# aldrig skrivas ner.
#
# Provet läser slutkriteriets sex rader ur VAGEN.md §1 och mäter var och en.
# Det påstår ALDRIG ett grindutfall det inte kört: utan --kor-grindar står det
# "kräver körning", och på fel plattform står det ODÖMBART. Aldrig PASS.

set -u
KOR_GRINDAR=0
[ "${1:-}" = "--kor-grindar" ] && KOR_GRINDAR=1

ROT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "inte ett git-repo"; exit 2; }
cd "$ROT" || exit 2

gron()  { printf '\033[32m%s\033[0m' "$1"; }
rod()   { printf '\033[31m%s\033[0m' "$1"; }
gul()   { printf '\033[33m%s\033[0m' "$1"; }

echo "══════════════════════════════════════════════════════════════════════"
echo " NORTROPIC — HELHETSBILDEN, MÄTT $(date '+%Y-%m-%d %H:%M')"
echo "══════════════════════════════════════════════════════════════════════"

# ── 1. KÖRBANAN ─────────────────────────────────────────────────────────────
echo
echo "1. KÖRBANAN — står bilen på vägen?"
OS="$(uname -s)"
printf '   maskin      %s  ' "$OS"
if [ "$OS" = "Darwin" ]; then gron "grindarna är dömbara här"; else
  gul "grindutfall blir ODÖMBART (Darwin-bunden, FYND 31d)"; fi; echo

printf '   klon        %s  ' "$ROT"
if [ -d .git ]; then gron "riktig klon"; else rod "WORKTREE — grindarna ger falska röda (FYND 32)"; fi; echo

SMUTS="$(git status --porcelain | wc -l | tr -d ' ')"
printf '   arbetsträd  %s okommitterade  ' "$SMUTS"
[ "$SMUTS" = "0" ] && gron "rent" || gul "grindkörning på smutsigt träd ger tal som ser ut som evidens"; echo

printf '   autopush    '
HP="$(git config --get core.hooksPath 2>/dev/null || true)"
if [ -n "$HP" ] && [ -x "$HP/post-commit" ]; then gron "på — varje commit pushas (regel 12)"
elif [ -n "$HP" ]; then rod "core.hooksPath=$HP men post-commit saknas eller är inte körbar"
else gul "AV — arbete kan bli kvar lokalt. bash scripts/installera-hooks.sh"; fi; echo

printf '   färskhet    '
if git fetch -q origin main 2>/dev/null; then
  BAK="$(git rev-list --count HEAD..origin/main 2>/dev/null || echo '?')"
  if [ "$BAK" = "0" ]; then gron "dagsfärsk mot origin/main"
  else rod "$BAK commits EFTER origin/main — pulla först"; fi
else gul "kunde inte nå origin — färskheten är ODÖMBART"; fi; echo

# ── 2. SLUTKRITERIET ────────────────────────────────────────────────────────
echo
echo "2. SLUTKRITERIET — KERNEL_COMPLETE, sex rader (VAGEN.md §1)"
echo

UPPFYLLDA=0
rad() { # nr, text, tillstånd, detalj
  printf '   %s  %-46s ' "$1" "$2"
  case "$3" in
    JA)   gron "UPPFYLLT"; UPPFYLLDA=$((UPPFYLLDA+1)) ;;
    NEJ)  rod  "SAKNAS" ;;
    *)    gul  "$3" ;;
  esac
  [ -n "${4:-}" ] && printf '  %s' "$4"
  echo
}

# Krav 1 — de fjorton grindarna
GRINDAR="001 002 003 004 005 006 007 008 009 010 011 012 013 016"
FINNS=0; for h in $GRINDAR; do [ -f "verify/bin/h-$h-exit" ] && FINNS=$((FINNS+1)); done
if [ "$KOR_GRINDAR" = "1" ] && [ "$OS" = "Darwin" ]; then
  P=0; F=0; A=0; RAD=""
  for h in $GRINDAR; do
    G="verify/bin/h-$h-exit"
    [ -f "$G" ] || { A=$((A+1)); RAD="$RAD h-$h:-"; continue; }
    bash "$G" >/dev/null 2>&1; K=$?
    case $K in 0) P=$((P+1));; 1) F=$((F+1));; *) A=$((A+1));; esac
    RAD="$RAD h-$h:$K"
  done
  [ "$F" = "0" ] && [ "$A" = "0" ] && rad 1 "h-015:s beroendeslutning grön (14 grindar)" JA "$P/14" \
                                  || rad 1 "h-015:s beroendeslutning grön (14 grindar)" "$P/14 PASS · $F FAIL · $A annat"
  echo "       RAD:$RAD"
elif [ "$KOR_GRINDAR" = "1" ]; then
  rad 1 "h-015:s beroendeslutning grön (14 grindar)" "ODÖMBART" "fel plattform ($OS)"
else
  rad 1 "h-015:s beroendeslutning grön (14 grindar)" "kräver körning" "$FINNS/14 grindfiler finns · --kor-grindar"
fi

# Krav 2-6 — mekaniskt mätbara utan att köra något
[ -f verify/bin/h-014-exit ] && rad 2 "h-014 har en fryst grind" JA || rad 2 "h-014 har en fryst grind" NEJ
# h-027..h-030 måste vara EGNA TASK, inte omnämnanden. Ett grep på "h-030"
# träffar h-015:s depends_on och gav 1/4 där sanningen är 0/4 — mätt 2026-09-16,
# rättat innan provet anfördes. Räkna id:n ur specen, aldrig textförekomster.
SUB="$(python3 - <<'PY' 2>/dev/null || echo FEL
import json
d = json.load(open('specs/tasks.spec.json'))
ts = d['tasks'] if isinstance(d, dict) and 'tasks' in d else d
ids = {t.get('id') for t in (ts if isinstance(ts, list) else ts.values())}
print(len(ids & {'h-027', 'h-028', 'h-029', 'h-030'}))
PY
)"
if [ "$SUB" = "FEL" ]; then rad 3 "h-027..h-030 finns som task" "ODÖMBART" "kunde inte läsa specen"
elif [ "$SUB" = "4" ]; then rad 3 "h-027..h-030 finns som task" JA
else rad 3 "h-027..h-030 finns som task" NEJ "$SUB/4 (id i specen, inte omnämnanden)"; fi
[ -f verify/bin/h-015-exit ] && rad 4 "h-015 har en fryst grind" JA || rad 4 "h-015 har en fryst grind" NEJ
[ -f verify/bin/autonomous-loop-exit ] && rad 5 "programdomen finns" JA || rad 5 "programdomen finns" NEJ
[ -f docs/loop/autonomy-kernel-v1-acceptance.md ] && rad 6 "acceptansfilen finns" JA || rad 6 "acceptansfilen finns" NEJ

echo
printf '   ⇒ %s av 6 uppfyllda.  ' "$UPPFYLLDA"
[ "$UPPFYLLDA" = "6" ] && gron "KERNEL_COMPLETE" || echo -n "Vägen dit står i VAGEN.md §4."
echo

# ── 3. PLATTFORMSGRENEN ─────────────────────────────────────────────────────
echo
echo "3. PLATTFORMSGRENEN — bär den kernelarbete som inte finns på main?"
B="origin/nortropic/platform-integration-20260910"
if git rev-parse -q --verify "$B" >/dev/null 2>&1; then
  set -- $(git rev-list --left-right --count "origin/main...$B" 2>/dev/null)
  printf '   grenen: %s commits före main, main har %s som grenen saknar\n' "${2:-?}" "${1:-?}"
  echo "   kärnfiler som SKILJER (grenens version är omätt mot grinden):"
  git diff --name-only origin/main "$B" -- controller/ specs/ 2>/dev/null | sed 's/^/     /'
else
  echo "   (grenen inte hämtad — git fetch origin nortropic/platform-integration-20260910)"
fi

# ── 4. NÄSTA STEG ───────────────────────────────────────────────────────────
echo
echo "4. NÄSTA STEG"
echo "   Vägen:   docs/loop/raddning/VAGEN.md  — den ENDA filen som säger vad som görs härnäst"
echo "   Läget:   docs/loop/drift.md (nyast överst) · docs/05-beslutslogg.md"
echo "   Regel 12: bash docs/loop/raddning/artefakter/inventera-lokalt-arbete.sh"
echo
echo "══════════════════════════════════════════════════════════════════════"

# Exitkod: 0 = allt uppfyllt · 1 = arbete kvar · 2 = kunde inte mätas
[ "$OS" = "Darwin" ] || exit 2
[ "$UPPFYLLDA" = "6" ] && exit 0
exit 1
