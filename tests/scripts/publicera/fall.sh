#!/usr/bin/env bash
# tests/scripts/publicera/fall.sh — negativa och positiva fall för scripts/publicera.sh
# med STUBBADE gh och claude. Engångsrepon under mktemp, eget $HOME, rör aldrig det riktiga
# repot. Varje fall: ett villkor som ska stoppa mergen, eller ett legitimt fall som ska gå.
#
#   bash tests/scripts/publicera/fall.sh            # kör alla
#   PUBLICERA=<sökväg> bash tests/scripts/publicera/fall.sh   # prova annan kandidat
set -u
HAR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd -P)"
PUB="${PUBLICERA:-$HAR/scripts/publicera.sh}"
[ -f "$PUB" ] || { echo "ODÖMBART: $PUB saknas"; exit 2; }
T="$(mktemp -d "${TMPDIR:-/tmp}/publicera-fall.XXXXXX")"; export T; trap 'rm -rf "$T"' EXIT
export HOME="$T/hem"; mkdir -p "$HOME" "$T/bin"
export NORTROPIC_GRANSKNINGAR="$T/granskningar"
export GIT_AUTHOR_NAME=Prov GIT_AUTHOR_EMAIL=prov@x GIT_COMMITTER_NAME=Prov GIT_COMMITTER_EMAIL=prov@x
git config --global init.defaultBranch main
git config --global advice.detachedHead false
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "  ✅ $1"; }
fel()  { FAIL=$((FAIL+1)); echo "  ❌ $1 — $2"; }

# ── stubbar ──────────────────────────────────────────────────────────────────
# gh-stubben läser sitt beteende ur $T/gh.case och loggar varje anrop till $T/gh.log.
cat > "$T/bin/gh" <<'GH'
#!/usr/bin/env bash
echo "$*" >> "$T/gh.log"
# Riktiga gh faller utan giltigt --repo utanför ett git-repo — stubben ska inte vara snällare.
# (Mekanismens första körning mot sig själv stannade på just detta: REPO blev tomt.)
case " $* " in *" --repo "[A-Za-z0-9._-]*/[A-Za-z0-9._-]*" "*) ;; *) echo "gh-stub: --repo saknas eller ogiltigt: $*" >&2; exit 9 ;; esac
C="$(cat "$T/gh.case")"; N="$(grep -c . "$T/gh.log")"
case "$1 $2" in
  "pr list")   if [ "$C" = "ingen-pr" ] && [ ! -f "$T/pr-skapad" ]; then echo ''; else echo 42; fi ;;
  "pr create") touch "$T/pr-skapad"; echo "https://github.com/x/y/pull/42" ;;
  "pr view")
     case "$*" in
       *headRefOid*) if [ "$C" = "spets-flyttar" ] && [ -f "$T/granskad" ]; then echo "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"; else git -C "$T/arb" rev-parse HEAD; fi ;;
       *statusCheckRollup*) case "$C" in
           rod-check|rod-check-ok) printf 'vaktsviten (webbfabriken)\tSUCCESS\nskalprov under tests/scripts\tFAILURE\n' ;;
           *) printf 'vaktsviten (webbfabriken)\tSUCCESS\nskalprov under tests/scripts\tSUCCESS\n' ;;
         esac ;;
     esac ;;
  "pr review") touch "$T/review-postad"; echo ok ;;
  "pr merge")  touch "$T/merge-anropad"; echo "$*" > "$T/merge.args"
     # utför mergen på riktigt i bare-origin, så origin/main^2 kan prövas
     H="$(git -C "$T/arb" rev-parse HEAD)"; git -C "$T/mrg" fetch -q origin && git -C "$T/mrg" checkout -q main && git -C "$T/mrg" merge -q --no-ff -m "Merge PR #42" "$H" && git -C "$T/mrg" push -q origin main ;;
  "api "*) echo '' ;;
  *) echo "gh-stub: okänt $*" >&2; exit 9 ;;
esac
GH
chmod +x "$T/bin/gh"
# claude-stubben skriver rapporten enligt $T/claude.case
cat > "$T/bin/claude" <<'CL'
#!/usr/bin/env bash
touch "$T/granskad"
H="$(git rev-parse HEAD)"
case "$(cat "$T/claude.case")" in
  tillstyrks) echo "1. OK — inget fynd."; echo "DOM: TILLSTYRKS @$H" ;;
  fynd)       echo "1. BLOCKERANDE fil:1 …"; echo "DOM: FYND @$H — blockerande: #1" ;;
  fel-sha)    echo "DOM: TILLSTYRKS @0000000000000000000000000000000000000000" ;;
  ingen-dom)  echo "Jag kunde inte avgöra." ;;
  tom)        : ;;
  smutsar)    echo "smuts" > SMUTS.txt; echo "DOM: TILLSTYRKS @$H" ;;
esac
CL
chmod +x "$T/bin/claude"
export PATH="$T/bin:$PATH" NORTROPIC_GH="$T/bin/gh" NORTROPIC_CLAUDE="$T/bin/claude"

# ── fixtur: bare origin + arbetsklon med gren + hjälpklon för stub-merge ─────
bygg() {
  rm -rf "$T/origin.git" "$T/arb" "$T/mrg" "$T/gh.log" "$T/pr-skapad" "$T/review-postad" "$T/merge-anropad" "$T/granskad" "$T/granskningar"
  git init -q --bare "$T/origin.git"
  git init -q "$T/seed" && (cd "$T/seed" && mkdir -p .agents/skills/nortropic-reviewer && echo r > .agents/skills/nortropic-reviewer/SKILL.md && echo p > .agents/skills/nortropic-reviewer/PR-TILLAGG.md && echo a > a.txt && git add -A && git commit -q -m bas && git push -q "$T/origin.git" HEAD:main) && rm -rf "$T/seed"
  git clone -q "$T/origin.git" "$T/arb" && git clone -q "$T/origin.git" "$T/mrg"
  git -C "$T/arb" switch -q -c nortropic/loop-prov && echo b > "$T/arb/b.txt" && git -C "$T/arb" add -A && git -C "$T/arb" commit -q -m "leverans" && git -C "$T/arb" push -q -u origin nortropic/loop-prov
  echo "" > "$T/gh.case"; echo tillstyrks > "$T/claude.case"; : > "$T/gh.log"
}
kor() { bash "$PUB" --repo "$T/arb" "$@" > "$T/ut.txt" 2>&1; echo $?; }
ingen_merge() { [ ! -f "$T/merge-anropad" ]; }

echo "publicera.sh — fall"
# P0 owner/repo ur origin-URL:en, alla tre former (macOS sed saknar icke-giriga kvantifierare)
bygg; git -C "$T/arb" remote set-url origin git@github.com:Org/repo-x.git
[ "$(bash "$PUB" --repo "$T/arb" --visa-repo)" = "Org/repo-x" ] && ok "P0a ssh-URL → Org/repo-x" || fel "P0a" "$(bash "$PUB" --repo "$T/arb" --visa-repo)"
git -C "$T/arb" remote set-url origin https://github.com/Org/repo-y
[ "$(bash "$PUB" --repo "$T/arb" --visa-repo)" = "Org/repo-y" ] && ok "P0b https-URL utan .git → Org/repo-y" || fel "P0b" "$(bash "$PUB" --repo "$T/arb" --visa-repo)"
git -C "$T/arb" remote set-url origin https://github.com/Org/repo-z.git/
[ "$(bash "$PUB" --repo "$T/arb" --visa-repo)" = "Org/repo-z" ] && ok "P0c https-URL med .git/ → Org/repo-z" || fel "P0c" "$(bash "$PUB" --repo "$T/arb" --visa-repo)"
bygg; echo ingen > "$T/claude.case"
rc="$(kor --granskare ingen)"; [ "$rc" = 1 ] && ingen_merge && ok "N1 --granskare ingen → stopp, ingen merge" || fel "N1" "rc=$rc"
bygg; echo ingen-dom > "$T/claude.case"
rc="$(kor)"; [ "$rc" = 2 ] && ingen_merge && ok "N2 granskare utan DOM-rad → ODÖMBART, ingen merge" || fel "N2" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo tom > "$T/claude.case"
rc="$(kor)"; [ "$rc" = 2 ] && ingen_merge && ok "N2b tom rapport → ODÖMBART" || fel "N2b" "rc=$rc"
bygg; echo fel-sha > "$T/claude.case"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && grep -q 'gäller' "$T/ut.txt" && ok "N3 DOM med fel SHA → stopp" || fel "N3" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo fynd > "$T/claude.case"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && [ -f "$T/review-postad" ] && ok "N4 FYND → stopp, rapport postad, ingen merge" || fel "N4" "rc=$rc"
bygg; echo spets-flyttar > "$T/gh.case"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && grep -q 'flyttade' "$T/ut.txt" && ok "N5 ny commit efter granskning → stopp" || fel "N5" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo rod-check > "$T/gh.case"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && grep -q 'skalprov' "$T/ut.txt" && ok "N6 röd check utan skäl → stopp" || fel "N6" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo rod-check > "$T/gh.case"
rc="$(kor --odombart-ok "skalprov under tests/scripts: Linux-ODÖMBART, se logg")"; [ "$rc" = 0 ] && [ -f "$T/merge-anropad" ] && ok "N6b röd check med uttryckligt skäl → merge" || fel "N6b" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo smuts > "$T/arb/c.txt"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && [ ! -f "$T/granskad" ] && ok "N7 smutsig arbetskopia → stopp före granskning" || fel "N7" "rc=$rc"
bygg; echo smutsar > "$T/claude.case"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && grep -q 'smutsig' "$T/ut.txt" && ok "N8 granskaren smutsar trädet → stopp" || fel "N8" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; git -C "$T/arb" switch -q main
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && ok "N9 på main → stopp" || fel "N9" "rc=$rc"
bygg
rc="$(kor)"; H="$(git -C "$T/arb" rev-parse HEAD)"
if [ "$rc" = 0 ] && grep -q -- "--match-head-commit $H" "$T/merge.args" && [ "$(git -C "$T/mrg" rev-parse origin/main^2)" = "$H" ] && grep -q '^KVITTO' "$T/ut.txt" && [ -f "$T/review-postad" ]; then ok "P1 legitim grön kandidat → granskad, mergad med --match-head-commit, kvitto"; else fel "P1" "rc=$rc $(tail -2 "$T/ut.txt" | tr '\n' ' ')"; fi
bygg; echo ingen-pr > "$T/gh.case"
rc="$(kor)"; [ "$rc" = 0 ] && [ -f "$T/pr-skapad" ] && [ -f "$T/merge-anropad" ] && ok "P2 ingen PR → öppnas, sedan granskad och mergad" || fel "P2" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; git -C "$T/arb" commit -q --allow-empty -m "opushad"
rc="$(kor --utan-merge)"; [ "$rc" = 0 ] && [ "$(git -C "$T/arb" rev-parse origin/nortropic/loop-prov)" = "$(git -C "$T/arb" rev-parse HEAD)" ] && ingen_merge && ok "P3 opushad commit → pushas först; --utan-merge stannar efter granskning" || fel "P3" "rc=$rc $(tail -1 "$T/ut.txt")"

echo; echo "$PASS gröna · $FAIL röda"
[ "$FAIL" = 0 ] && exit 0 || exit 1
