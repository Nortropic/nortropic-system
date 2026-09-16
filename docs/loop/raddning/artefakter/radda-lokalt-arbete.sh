#!/usr/bin/env bash
# radda-lokalt-arbete.sh — ADDITIVT. Skapar grenar och pushar. Tar ALDRIG bort något.
#
#     bash radda-lokalt-arbete.sh              # TORRKÖRNING — visar bara vad som skulle ske
#     bash radda-lokalt-arbete.sh --kor        # gör det på riktigt
#
# Säkrar det `inventera-lokalt-arbete.sh` fann. Två faser, båda helt icke-intrusiva:
#
#   FAS A — lokala grenar vars topp inte finns på origin → pushas under sitt eget namn
#   FAS B — föräldralösa worktree-HEADs → får en gren radda/wt-<namn> som pushas
#
# INGEN FAS RÖR ETT ARBETSTRÄD. Inga checkouts, inga commits, ingen HEAD flyttas,
# inget tas bort. Efteråt finns allt på origin och städning blir riskfri.
#
# Worktrees med OKOMMITTERAT arbete hanteras INTE här. Att committa halvfärdigt
# arbete åt någon annan kräver ett beslut, inte ett svep. De listas till sist.
#
# Bash 3.2-säkert (macOS systembash). Ingen sudo. Aldrig --force.

set -u
KOR=0
[ "${1:-}" = "--kor" ] && KOR=1

ROT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "inte ett git-repo"; exit 2; }
cd "$ROT" || exit 2

git rev-parse --verify -q origin/main >/dev/null || { echo "ODÖMBART: kör 'git fetch origin' först"; exit 2; }

LOGG="/tmp/nortropic-raddning-$(date +%Y%m%d-%H%M%S).txt"
exec > >(tee "$LOGG") 2>&1

if [ "$KOR" = "1" ]; then
  echo "=== RÄDDNING — SKARPT LÄGE ==="
else
  echo "=== RÄDDNING — TORRKÖRNING (inget utförs) ==="
  echo "    Kör om med --kor när listan ser rätt ut."
fi
echo "origin/main: $(git log --oneline -1 origin/main)"
echo

# Finns commiten någonstans på origin?
sakrad() {
  git merge-base --is-ancestor "$1" origin/main 2>/dev/null && return 0
  [ -n "$(git branch -r --contains "$1" 2>/dev/null | head -1)" ] && return 0
  return 1
}

gor() { # gor <beskrivning> <kommando...>
  if [ "$KOR" = "1" ]; then
    if "${@:2}" >/dev/null 2>&1; then echo "  OK      $1"; return 0
    else echo "  ⚠️ FEL  $1"; return 1; fi
  else
    echo "  skulle  $1"; return 0
  fi
}

# ── FAS A: lokala grenar som inte finns på origin ───────────────────────────
echo "=== FAS A — lokala grenar utan motsvarighet på origin ==="
a_ok=0; a_fel=0
while IFS= read -r gren; do
  [ -z "$gren" ] && continue
  h="$(git rev-parse "$gren" 2>/dev/null)" || continue
  sakrad "$h" && continue
  n="$(git rev-list --count origin/main.."$gren" 2>/dev/null)"
  if gor "push $gren ($n commits)" git push origin "refs/heads/$gren:refs/heads/$gren"; then
    a_ok=$((a_ok+1)); else a_fel=$((a_fel+1)); fi
done < <(git for-each-ref --format='%(refname:short)' refs/heads)
echo "FAS A: $a_ok grenar · $a_fel fel"
echo

# ── FAS B: föräldralösa worktree-HEADs ──────────────────────────────────────
# Samma SHA kan ligga i flera worktrees (granskningspar a/b). Vi räddar SHA:t
# en gång — grenen bär commiten, inte katalogen.
echo "=== FAS B — föräldralösa worktree-HEADs ==="
b_ok=0; b_fel=0; b_hoppat=0; SEDDA=""
SOKVAG=""; HEAD_SHA=""
behandla() {
  [ -z "$SOKVAG" ] && return
  [ -z "$HEAD_SHA" ] && return
  sakrad "$HEAD_SHA" && return
  case " $SEDDA " in *" $HEAD_SHA "*) b_hoppat=$((b_hoppat+1)); return ;; esac
  SEDDA="$SEDDA $HEAD_SHA"
  # radda/wt-<katalognamn>, sanerat till [A-Za-z0-9._-]
  namn="$(basename "$SOKVAG" | tr -c 'A-Za-z0-9._-' '-' | sed 's/-*$//')"
  if gor "radda/wt-$namn → ${HEAD_SHA:0:8}" \
       git push origin "$HEAD_SHA:refs/heads/radda/wt-$namn"; then
    b_ok=$((b_ok+1)); else b_fel=$((b_fel+1)); fi
}
while IFS= read -r rad; do
  case "$rad" in
    worktree\ *) behandla; SOKVAG="${rad#worktree }"; HEAD_SHA="" ;;
    HEAD\ *)     HEAD_SHA="${rad#HEAD }" ;;
  esac
done < <(git worktree list --porcelain)
behandla
echo "FAS B: $b_ok unika commits · $b_hoppat dubbletter (samma SHA i flera worktrees) · $b_fel fel"
echo

# ── Kvar: okommitterat arbete. Rapporteras, hanteras inte. ──────────────────
echo "=== KVAR ATT BESLUTA OM — worktrees med okommitterat arbete ==="
c=0
SOKVAG=""
while IFS= read -r rad; do
  case "$rad" in
    worktree\ *)
      SOKVAG="${rad#worktree }"
      s="$(git -C "$SOKVAG" status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
      if [ "${s:-0}" -gt 0 ]; then
        printf "  %-4s fil  %s\n" "$s" "${SOKVAG#$HOME/}"; c=$((c+1))
      fi ;;
  esac
done < <(git worktree list --porcelain)
echo "  $c worktrees. Att committa halvfärdigt arbete åt någon annan är ett beslut,"
echo "  inte ett svep — därför rör detta prov dem inte."
echo

echo "=============================================================="
if [ "$KOR" = "1" ]; then
  echo "KLART. Kör 'bash inventera-lokalt-arbete.sh' igen för att verifiera."
  echo "Kvarstår bara de $c med okommitterat arbete är fas A och B lyckade."
else
  echo "TORRKÖRNING KLAR — ingenting utfördes."
  echo "Ser listan rätt ut: kör om med  --kor"
fi
echo "Logg: $LOGG"
echo "=============================================================="
