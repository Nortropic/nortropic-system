#!/usr/bin/env bash
# installera-hooks.sh — sätter core.hooksPath i VARJE klon och worktree av detta
# repo på maskinen, så att den autonoma pushen gäller oavsett vilket verktyg som
# committar.
#
#     bash scripts/installera-hooks.sh            # TORRKÖRNING — visar, gör inget
#     bash scripts/installera-hooks.sh --kor      # sätter konfigurationen
#     bash scripts/installera-hooks.sh --av       # tar bort den igen
#
# VARFÖR EN INSTALLERARE. Git-hooks är inte versionerade: .git/hooks/ följer
# aldrig med en klon. core.hooksPath pekar om dem till en katalog i trädet
# (.githooks/), som DÄRMED är versionerad och gemensam för varje gren — men
# inställningen är per klon och måste sättas en gång i var och en.
#
# Och det är hela poängen: 2026-09-16 låg tolv commits på en enda maskin,
# fördelade över kloner som inget verktyg kände till. En hook i EN katalog hade
# inte fångat en enda av dem.
#
# LÄSER BARA utan --kor. Ändrar aldrig ett arbetsträd, committar inget, pushar
# inget. Rör bara `git config core.hooksPath` i varje träff.

set -u
LAGE="torr"
case "${1:-}" in
  --kor) LAGE="kor" ;;
  --av)  LAGE="av" ;;
  ""|--torr) LAGE="torr" ;;
  *) echo "okänt argument: $1"; exit 2 ;;
esac

ROT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "inte ett git-repo"; exit 2; }
MIN_ORIGIN="$(git -C "$ROT" remote get-url origin 2>/dev/null)"
[ -z "$MIN_ORIGIN" ] && { echo "ODÖMBART: detta repo har ingen origin"; exit 2; }
[ -f "$ROT/.githooks/post-commit" ] || { echo "ODÖMBART: .githooks/post-commit saknas i $ROT"; exit 2; }

echo "repo:   $MIN_ORIGIN"
echo "läge:   $LAGE$([ "$LAGE" = "torr" ] && echo '  (inget ändras — kör med --kor)')"
echo

n=0; n_andrade=0; n_redan=0
behandla() { # <katalog> <källa>
  local d="$1" kalla="$2" nuv onskad
  # Worktrees delar konfiguration med sitt huvudrepo — sätt den bara en gång där.
  local gemensam; gemensam="$(git -C "$d" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)" || return
  case " $SEDDA " in *" $gemensam "*) return;; esac
  SEDDA="$SEDDA $gemensam"

  [ "$(git -C "$d" remote get-url origin 2>/dev/null)" = "$MIN_ORIGIN" ] || return
  n=$((n+1))
  onskad="$(git -C "$d" rev-parse --show-toplevel 2>/dev/null)/.githooks"
  [ -f "$onskad/post-commit" ] || onskad="$ROT/.githooks"   # gren utan hooken: peka hit
  nuv="$(git -C "$d" config --get core.hooksPath 2>/dev/null || true)"

  if [ "$LAGE" = "av" ]; then
    if [ -n "$nuv" ]; then
      git -C "$d" config --unset core.hooksPath 2>/dev/null && \
        { echo "  BORTTAGEN  ${d#$HOME/}"; n_andrade=$((n_andrade+1)); }
    fi
    return
  fi

  if [ "$nuv" = "$onskad" ]; then
    n_redan=$((n_redan+1)); return
  fi
  if [ "$LAGE" = "kor" ]; then
    git -C "$d" config core.hooksPath "$onskad" && \
      { echo "  SATT       ${d#$HOME/}  ($kalla)"; n_andrade=$((n_andrade+1)); }
  else
    echo "  skulle sätta  ${d#$HOME/}  ($kalla)"; n_andrade=$((n_andrade+1))
  fi
}

SEDDA=""
# 1. Fristående kloner på maskinen — den kategori som föll bort 2026-09-16.
while IFS= read -r d; do behandla "$d" "klon"; done < <(
  find "$HOME" -maxdepth 4 -type d -name .git 2>/dev/null | sed 's|/\.git$||' | sort -u)
# 2. Registrerade worktrees — de delar git-dir med sitt huvudrepo, så de fångas
#    av dedupliceringen ovan. Loopen finns för de fall huvudrepot ligger djupare
#    än maxdepth 4 och alltså aldrig sågs.
while IFS= read -r d; do [ -d "$d" ] && behandla "$d" "worktree"; done < <(
  git -C "$ROT" worktree list --porcelain 2>/dev/null | awk '/^worktree /{print $2}')

echo
echo "$n repon av samma origin · $n_andrade $([ "$LAGE" = "torr" ] && echo 'att ändra' || echo 'ändrade') · $n_redan redan rätt"
[ "$LAGE" = "torr" ] && [ "$n_andrade" -gt 0 ] && echo && echo "Kör om med --kor för att sätta dem."
exit 0
