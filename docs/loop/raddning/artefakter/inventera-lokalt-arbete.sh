#!/usr/bin/env bash
# inventera-lokalt-arbete.sh — LÄSER BARA. Tar aldrig bort något, ändrar ingenting.
#
# Svarar på regel 12:s enda fråga, per worktree och per gren:
#   finns detta arbete på git, eller bara på den här maskinen?
#
#     bash docs/loop/raddning/artefakter/inventera-lokalt-arbete.sh
#
# Bakgrund: 2026-09-16 mättes ~300 lokala grenar, varav sex bar commits som
# saknades på origin. Den mätningen var OFULLSTÄNDIG — den såg inte de ~200
# worktreesen, varav ett femtiotal står på DETACHED HEAD. En detached
# HEAD-commit tillhör ingen gren, syns inte i `git branch`, och hålls vid liv
# ENBART av att worktreen finns. Tas worktreen bort blir den oåtkomlig utom via
# reflog, och reflog rensas. Det är regel 12:s farligaste kategori och den enda
# som försvinner tyst.
#
# Bash 3.2-säkert (macOS systembash). Ingen sudo. Inget nät utom en `git fetch`
# som du kör själv först — provet fetchar INTE, eftersom en stale origin/main ger
# falska "föräldralösa" (det felet gjordes 2026-09-16 och fångades i tid).

set -u
ROT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "inte ett git-repo"; exit 2; }
cd "$ROT" || exit 2

RAPPORT="/tmp/nortropic-lokalt-arbete-$(date +%Y%m%d-%H%M%S).txt"
exec > >(tee "$RAPPORT") 2>&1

echo "=== INVENTERING AV LOKALT ARBETE — regel 12 ==="
echo "repo:   $ROT"
echo "datum:  $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo

# ── Färskhetskontroll: en stale origin/main ger falska larm ─────────────────
if ! git rev-parse --verify -q origin/main >/dev/null; then
  echo "ODÖMBART: origin/main saknas. Kör 'git fetch origin' först."; exit 2
fi
echo "origin/main: $(git log --oneline -1 origin/main)"
echo "⚠️  Är den inte dagsfärsk: AVBRYT, kör 'git fetch origin', kör om."
echo "    En stale referens gör säkrade commits till falska föräldralösa."
echo

# ── Klassificera ett commit-SHA ─────────────────────────────────────────────
# I_MAIN      = förfader till origin/main. Säkrad, helt.
# PA_REMOTE   = finns på någon pushad gren. Säkrad så länge grenen inte raderas.
# FORALDRALOS = finns ingenstans på origin. FÖRSVINNER om worktreen tas bort.
klassa() {
  local h="$1"
  git merge-base --is-ancestor "$h" origin/main 2>/dev/null && { echo "I_MAIN"; return; }
  if [ -n "$(git branch -r --contains "$h" 2>/dev/null | head -1)" ]; then
    echo "PA_REMOTE"; return
  fi
  echo "FORALDRALOS"
}

n_main=0; n_remote=0; n_foraldralos=0; n_smutsig=0; n_smuts_sakrad=0; n_tot=0
FARLIGA=""

# Är ett smutsigt worktrees NUVARANDE innehåll redan säkrat på origin?
# Tillagt 2026-09-16 efter att provet larmat "STÄDA INGENTING" om 31 worktrees
# vars innehåll radda-okommitterat.sh just hade pushat. En vakt som skriker varg
# blir ignorerad, och en ignorerad vakt är värre än ingen
# (11-tre-vakter-mot-aterfall.md).
#
# Provet är INNEHÅLL, inte namn: bygg worktreets träd i ett tempindex och jämför
# med trädet i radda/smuts-<namn>. Lika träd = innehållet finns på origin.
# Har worktreet ändrats sedan räddningen skiljer sig träden, och larmet står kvar
# — vilket är rätt, för då finns nytt arbete som inte är säkrat.
smuts_sakrad() {
  local wt="$1" namn ref tmpidx tree fjarrtree
  namn="$(basename "$wt" | tr -c 'A-Za-z0-9._-' '-' | sed 's/-*$//')"
  ref="refs/remotes/origin/radda/smuts-$namn"
  git rev-parse --verify -q "$ref" >/dev/null 2>&1 || return 1
  tmpidx="$(mktemp)"; rm -f "$tmpidx"
  GIT_INDEX_FILE="$tmpidx" git -C "$wt" read-tree HEAD >/dev/null 2>&1 \
    && GIT_INDEX_FILE="$tmpidx" git -C "$wt" add -A >/dev/null 2>&1 \
    && tree="$(GIT_INDEX_FILE="$tmpidx" git -C "$wt" write-tree 2>/dev/null)"
  rm -f "$tmpidx"
  [ -z "${tree:-}" ] && return 1
  fjarrtree="$(git rev-parse "$ref^{tree}" 2>/dev/null)"
  [ "$tree" = "$fjarrtree" ]
}

echo "=== WORKTREES ==="
printf "%-12s %-10s %-9s %s\n" LÄGE HEAD SMUTS KATALOG
printf '%.0s-' {1..100}; echo

# `git worktree list --porcelain` ger block: worktree <sökväg> / HEAD <sha> / branch|detached
SOKVAG=""; HEAD_SHA=""; GREN=""
process() {
  [ -z "$SOKVAG" ] && return
  n_tot=$((n_tot+1))
  local k; k="$(klassa "$HEAD_SHA")"
  local s; s="$(git -C "$SOKVAG" status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
  local smutsmark=""
  if [ "${s:-0}" -gt 0 ]; then
    if smuts_sakrad "$SOKVAG"; then smutsmark=" (säkrad)"; n_smuts_sakrad=$((n_smuts_sakrad+1))
    else n_smutsig=$((n_smutsig+1)); fi
  fi
  case "$k" in
    I_MAIN)      n_main=$((n_main+1)) ;;
    PA_REMOTE)   n_remote=$((n_remote+1)) ;;
    FORALDRALOS) n_foraldralos=$((n_foraldralos+1))
                 FARLIGA="$FARLIGA
$HEAD_SHA|${GREN:-DETACHED}|$s|$SOKVAG" ;;
  esac
  # Skriv bara ut det som INTE är helt säkrat — 200 gröna rader döljer de farliga
  if [ "$k" != "I_MAIN" ] || [ "${s:-0}" -gt 0 ]; then
    printf "%-12s %-10s %-9s %s\n" "$k" "${HEAD_SHA:0:8}" "${s:-0} fil$smutsmark" "${SOKVAG#$HOME/}"
  fi
}

while IFS= read -r rad; do
  case "$rad" in
    worktree\ *) process; SOKVAG="${rad#worktree }"; HEAD_SHA=""; GREN="" ;;
    HEAD\ *)     HEAD_SHA="${rad#HEAD }" ;;
    branch\ *)   GREN="${rad#branch refs/heads/}" ;;
  esac
done < <(git worktree list --porcelain)
process

echo
echo "worktrees: $n_tot totalt · $n_main helt i main · $n_remote på pushad gren · $n_foraldralos FÖRÄLDRALÖSA · $n_smutsig OSÄKRAT okommitterat · $n_smuts_sakrad smutsiga men säkrade"
echo "(rader ovan = endast de som inte är helt säkrade och rena)"
echo

# ── Grenar utan uppström eller före sin uppström ────────────────────────────
echo "=== GRENAR MED COMMITS SOM SAKNAS PÅ ORIGIN ==="
g_farliga=0
while IFS='|' read -r gren upp; do
  [ -z "$gren" ] && continue
  h="$(git rev-parse "$gren" 2>/dev/null)" || continue
  k="$(klassa "$h")"
  if [ "$k" = "FORALDRALOS" ]; then
    antal="$(git rev-list --count origin/main.."$gren" 2>/dev/null)"
    printf "  %-6s %-60s %s commits utanför main, %s\n" FÖRÄLDRALÖS "$gren" "$antal" "${upp:-ingen uppström}"
    g_farliga=$((g_farliga+1))
  fi
done < <(git for-each-ref --format='%(refname:short)|%(upstream:short)' refs/heads)
[ "$g_farliga" = "0" ] && echo "  (inga — varje grens topp finns på origin)"
echo

# ── Domen ───────────────────────────────────────────────────────────────────
echo "=============================================================="
FARA=$((n_foraldralos + g_farliga + n_smutsig))
if [ "$FARA" = "0" ]; then
  echo "✅ REGEL 12 UPPFYLLD — allt lokalt arbete finns på git."
  echo "   Städning kan ske utan att något går förlorat."
  [ "$n_smuts_sakrad" -gt 0 ] && echo "   ($n_smuts_sakrad worktrees är smutsiga, men deras innehåll ligger i radda/smuts-*" && echo "    med IDENTISKT träd — mätt, inte antaget på grennamnet.)"
else
  echo "⚠️  $FARA poster finns BARA på denna maskin:"
  echo "      $n_foraldralos worktrees med föräldralös HEAD"
  echo "      $g_farliga grenar utanför origin"
  echo "      $n_smutsig worktrees med okommitterat arbete"
  echo
  echo "   STÄDA INGENTING förrän dessa är säkrade. En föräldralös HEAD hålls"
  echo "   vid liv ENBART av sin worktree — tas den bort finns commiten kvar"
  echo "   endast i reflog, och reflog rensas."
  echo
  echo "   Säkra en föräldralös HEAD så här (skapar en gren, tar inte bort något):"
  echo "     git branch radda/<namn> <sha> && git push -u origin radda/<namn>"
fi
echo "=============================================================="
echo
echo "Full rapport: $RAPPORT"
[ "$FARA" = "0" ] || exit 1
exit 0
