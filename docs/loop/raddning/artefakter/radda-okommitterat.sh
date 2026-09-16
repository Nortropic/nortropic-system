#!/usr/bin/env bash
# radda-okommitterat.sh — säkrar OKOMMITTERAT arbete UTAN att röra något arbetsträd.
#
#     bash radda-okommitterat.sh          # TORRKÖRNING
#     bash radda-okommitterat.sh --kor    # gör det
#
# Fas A och B i `radda-lokalt-arbete.sh` räddade allt som var committat. Kvar
# blev worktrees med ändringar som aldrig committats — den sista formen av
# arbete som bara finns på en maskin.
#
# ⚠️ VARFÖR DETTA PROV INTE GÖR `git add` OCH `git commit`
#
# Ett vanligt `git commit` i en annan människas halvfärdiga worktree flyttar dess
# HEAD, tömmer dess index och gör dess pågående arbete till historia. Det är
# intrusivt och kan inte tas tillbaka utan att någon vet vad som fanns.
#
# I stället används git-plumbing med ett TILLFÄLLIGT INDEX (`GIT_INDEX_FILE`):
#
#     read-tree HEAD   → tempindex speglar worktreets HEAD
#     add -A           → tempindex får worktreets nuvarande innehåll
#     write-tree       → ett träd-objekt av det
#     commit-tree      → ett commit-objekt med worktreets HEAD som förälder
#     push             → objektet hamnar på origin
#
# Worktreets EGET index, HEAD och arbetsträd rörs ALDRIG. Efteråt är
# `git status` där exakt vad den var före. Innehållet finns dessutom på origin.
#
# Bash 3.2-säkert. Ingen sudo. Aldrig --force.

set -u
KOR=0
[ "${1:-}" = "--kor" ] && KOR=1

ROT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "inte ett git-repo"; exit 2; }
cd "$ROT" || exit 2
git rev-parse --verify -q origin/main >/dev/null || { echo "ODÖMBART: kör 'git fetch origin' först"; exit 2; }

LOGG="/tmp/nortropic-radda-smuts-$(date +%Y%m%d-%H%M%S).txt"
exec > >(tee "$LOGG") 2>&1

if [ "$KOR" = "1" ]; then echo "=== OKOMMITTERAT ARBETE — SKARPT LÄGE ==="
else echo "=== OKOMMITTERAT ARBETE — TORRKÖRNING (inget utförs) ==="; fi
echo "Inga arbetsträd rörs i något läge. Tempindex, aldrig worktreets eget."
echo

ok=0; fel=0; rena=0
SOKVAG=""
behandla() {
  [ -z "$SOKVAG" ] && return
  local smuts; smuts="$(git -C "$SOKVAG" status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
  if [ "${smuts:-0}" = "0" ]; then rena=$((rena+1)); return; fi

  local namn; namn="$(basename "$SOKVAG" | tr -c 'A-Za-z0-9._-' '-' | sed 's/-*$//')"
  local gren="radda/smuts-$namn"

  if [ "$KOR" = "0" ]; then
    printf "  skulle  %-4s fil → %s\n" "$smuts" "$gren"
    ok=$((ok+1)); return
  fi

  # ── Allt nedan sker i ett TILLFÄLLIGT index. Worktreet rörs inte. ─────────
  # PUSHEN SKER INIFRÅN KLONEN (`git -C "$SOKVAG" push`), inte härifrån. En
  # fristående klon har EGET objektlager — commit-objektet finns inte i detta
  # repo, så en push härifrån skulle misslyckas. Rättat 2026-09-16 tillsammans
  # med worktree-blindheten nedan; båda är samma fel som FYND 37.
  local tmpidx; tmpidx="$(mktemp)"; rm -f "$tmpidx"
  local tree commit h forald
  h="$(git -C "$SOKVAG" rev-parse HEAD 2>/dev/null)"
  forald="-p $h"
  # Finns grenen redan får den bli ANDRA FÖRÄLDER, så pushen blir en
  # snabbspolning. Alternativet vore --force, vilket NO_FORCE_SEMANTICS förbjuder.
  if git -C "$SOKVAG" ls-remote --exit-code origin "refs/heads/$gren" >/dev/null 2>&1 \
     && git -C "$SOKVAG" fetch -q origin "refs/heads/$gren" 2>/dev/null; then
    local gammal; gammal="$(git -C "$SOKVAG" rev-parse FETCH_HEAD 2>/dev/null)"
    [ -n "${gammal:-}" ] && forald="-p $h -p $gammal"
  fi
  if GIT_INDEX_FILE="$tmpidx" git -C "$SOKVAG" read-tree HEAD 2>/dev/null \
     && GIT_INDEX_FILE="$tmpidx" git -C "$SOKVAG" add -A 2>/dev/null \
     && tree="$(GIT_INDEX_FILE="$tmpidx" git -C "$SOKVAG" write-tree 2>/dev/null)" \
     && commit="$(printf '%s' "[RÄDDAT] okommitterat arbete i $namn

Skapat av radda-okommitterat.sh utan att röra worktreet. Dess HEAD, index och
arbetsträd är oförändrade — detta är en ögonblicksbild, inte en publicering.
Förälder: $h" | git -C "$SOKVAG" commit-tree "$tree" $forald 2>/dev/null)" \
     && git -C "$SOKVAG" push origin "$commit:refs/heads/$gren" >/dev/null 2>&1; then
    printf "  OK      %-4s fil → %s (%s)\n" "$smuts" "$gren" "${commit:0:8}"
    ok=$((ok+1))
  else
    printf "  ⚠️ FEL  %-4s fil → %s\n" "$smuts" "$gren"
    fel=$((fel+1))
  fi
  rm -f "$tmpidx"
}

while IFS= read -r rad; do
  case "$rad" in
    worktree\ *) behandla; SOKVAG="${rad#worktree }" ;;
  esac
done < <(git worktree list --porcelain)
behandla

# ── Fristående kloner — FYND 37:s blinda fläck, samma här ───────────────────
# `git worktree list` ser BARA registrerade worktrees. Ett trettiotal kataloger
# på maskinen är fristående kloner med `.git` som KATALOG. 2026-09-16 bar fyra av
# dem osparat arbete som detta prov inte ens tittade på.
MIN_ORIGIN="$(git remote get-url origin 2>/dev/null)"
SEDDA=""
if [ -n "$MIN_ORIGIN" ]; then
  while IFS= read -r kd; do
    [ "$kd" = "$ROT" ] && continue
    [ "$(git -C "$kd" remote get-url origin 2>/dev/null)" = "$MIN_ORIGIN" ] || continue
    gem="$(git -C "$kd" rev-parse --path-format=absolute --git-common-dir 2>/dev/null)" || continue
    case " $SEDDA " in *" $gem "*) continue;; esac
    SEDDA="$SEDDA $gem"
    SOKVAG="$kd"; behandla
  done < <(find "$HOME" -maxdepth 4 -type d -name .git 2>/dev/null | sed 's|/\.git$||' | sort -u)
fi
SOKVAG=""

echo
echo "=============================================================="
echo "$ok med okommitterat · $fel fel · $rena redan rena"
if [ "$KOR" = "1" ]; then
  echo
  echo "Worktreesen är oförändrade — kör 'git status' i vilken som helst och jämför."
  echo "Verifiera med: bash inventera-lokalt-arbete.sh"
  echo "OBS: inventeringen visar dem FORTFARANDE som 'med okommitterat', och det"
  echo "     är riktigt — arbetsträdet ÄR smutsigt. Skillnaden är att innehållet"
  echo "     nu också finns på origin under radda/smuts-*."
else
  echo "TORRKÖRNING KLAR. Kör om med --kor."
fi
echo "Logg: $LOGG"
echo "=============================================================="
