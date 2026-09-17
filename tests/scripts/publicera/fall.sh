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
case "$1" in pr) case " $* " in *" --repo "[A-Za-z0-9._-]*/[A-Za-z0-9._-]*" "*) ;; *) echo "gh-stub: --repo saknas eller ogiltigt: $*" >&2; exit 9 ;; esac ;; esac
C="$(cat "$T/gh.case")"; N="$(grep -c . "$T/gh.log")"
case "$1 $2" in
  "pr list")   if [ "$C" = "ingen-pr" ] && [ ! -f "$T/pr-skapad" ]; then echo ''; else echo 42; fi ;;
  "pr create") touch "$T/pr-skapad"; echo "https://github.com/x/y/pull/42" ;;
  "pr view")
     case "$*" in
       *headRefOid*) if [ "$C" = "spets-flyttar" ] && [ -f "$T/granskad" ]; then echo "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"; elif [ "$C" = "spets-fel-fran-start" ]; then echo "deadbeefdeadbeefdeadbeefdeadbeefdeadbeef"; else git -C "$T/arb" rev-parse HEAD; fi ;;
       *statusCheckRollup*) [ "$C" = "checks-fel" ] && { echo "gh: fel" >&2; exit 1; }; K="$(grep -c statusCheckRollup "$T/gh.log")"; case "$C" in
           rod-check|rod-check-ok) printf 'vaktsviten (webbfabriken)\tSUCCESS\nskalprov under tests/scripts\tFAILURE\n' ;;
           checks-tom) : ;;   # fönstret mellan push och check-run: rollupen är tom
           checks-vantar) if [ "$K" -le 2 ]; then printf 'vaktsviten (webbfabriken)\tSUCCESS\nskalprov under tests/scripts\tPENDING\n'; else printf 'vaktsviten (webbfabriken)\tSUCCESS\nskalprov under tests/scripts\tSUCCESS\n'; fi ;;
           checks-vantar-evigt) printf 'vaktsviten (webbfabriken)\tSUCCESS\nskalprov under tests/scripts\tPENDING\n' ;;
           *) printf 'vaktsviten (webbfabriken)\tSUCCESS\nskalprov under tests/scripts\tSUCCESS\n' ;;
         esac ;;
     esac ;;
  "pr review") if [ "$C" = "review-faller" ]; then echo "HTTP 422" >&2; exit 1; fi; touch "$T/review-postad"; echo ok ;;
  "pr comment") [ "$C" = "kommentar-faller" ] && { echo "HTTP 422" >&2; exit 1; }; touch "$T/kommentar-postad"; printf '%s\n' "$*" > "$T/kommentar.args"; echo ok ;;
  "pr merge")  touch "$T/merge-anropad"; echo "$*" > "$T/merge.args"
     # utför mergen på riktigt i bare-origin, så origin/main^2 kan prövas
     H="$(git -C "$T/arb" rev-parse HEAD)"; [ "$C" = "merge-fel-foralder" ] && H="$(git -C "$T/arb" rev-parse HEAD~1)"   # servern mergade något annat än kandidaten
     git -C "$T/mrg" fetch -q origin && git -C "$T/mrg" checkout -q main && git -C "$T/mrg" merge -q --no-ff -m "Merge PR #42" "$H" && git -C "$T/mrg" push -q origin main ;;
  "api "*) H="$(git -C "$T/arb" rev-parse HEAD)"
     # Stubben speglar --jq-filtret `select(.user.login == "X")`: reviews per fall som login<TAB>body,
     # och bara raderna vars login är det utpekade kontot skrivs ut (riktiga gh gör exakt det).
     VAL="$(printf '%s' "$*" | sed -nE 's/.*select\(\.user\.login == "([^"]+)"\).*/\1/p')"
     case "$C" in
       ci-bot)                  R="granskbot	DOM: TILLSTYRKS @$H" ;;
       ci-annan)                R="forfattare	DOM: TILLSTYRKS @$H" ;;                       # författaren "godkänner" sig själv
       ci-fynd-sedan-tillstyrks) R="granskbot	DOM: FYND @$H — blockerande: #1
granskbot	DOM: TILLSTYRKS @$H" ;;
       ci-gammal-sha)           R="granskbot	DOM: TILLSTYRKS @0000000000000000000000000000000000000000" ;;
       *) R="" ;;
     esac
     printf '%s\n' "$R" | awk -F'\t' -v v="$VAL" 'NF>1 && (v=="" || $1==v) {print $2}' ;;   # utan select: alla bodies, som riktiga gh
  *) echo "gh-stub: okänt $*" >&2; exit 9 ;;
esac
GH
chmod +x "$T/bin/gh"
# claude-stubben skriver rapporten enligt $T/claude.case
cat > "$T/bin/claude" <<'CL'
#!/usr/bin/env bash
# Prompten ska komma på STDIN (variadiska --*Tools svalde annars den) och nämna domformen;
# cwd ska vara repot och sessionsvariablerna ska vara borta — allt bokförs för P1.
PROMPT="$(cat)"
case "$PROMPT" in *"DOM: TILLSTYRKS @"*) ;; *) echo "claude-stub: ingen prompt med domform på stdin" >&2; exit 9 ;; esac
pwd -P > "$T/claude.pwd"; env | grep -cE '^(CLAUDECODE|CLAUDE_CODE_|SSH_AUTH_SOCK=|GH_TOKEN=)' > "$T/claude.env" || true
# spärrarna (b) och (c): gh löses till skalet som vägrar; git-transporten är död
{ command -v gh; gh --version >/dev/null 2>&1; echo "gh_rc=$?"; command -v ssh; ssh -V >/dev/null 2>&1; echo "ssh_rc=$?"; command -v git
  git push --dry-run origin HEAD >/dev/null 2>&1; echo "push_rc=$?"; git rev-parse --is-inside-work-tree >/dev/null 2>&1; echo "git_rc=$?"
  S=""; f=""; for a in "$@"; do [ "$f" = "--settings" ] && S="$a"; f="$a"; done; echo "settings=$S"; } > "$T/claude.sparr" 2>&1
case " $* " in *" --setting-sources user "*) ;; *) echo "claude-stub: projekthookar inte avstängda (--setting-sources user saknas)" >&2; exit 9 ;; esac
# --disallowedTools ska BÄRA spärrarna, inte bara finnas (en tom lista överlevde provet: fynd 4)
NEK=""; f=""; for a in "$@"; do [ "$f" = "--disallowedTools" ] && NEK="$a"; f="$a"; done
for m in "Edit" "Write" "Bash(gh:*)" "Bash(git push:*)" "Bash(git -C:*)"; do case ",$NEK," in *",$m,"*) ;; *) echo "claude-stub: --disallowedTools saknar $m" >&2; exit 9 ;; esac; done
touch "$T/granskad"
H="$(git rev-parse HEAD)"
case "$(cat "$T/claude.case")" in
  tillstyrks) echo "1. OK — inget fynd."; echo "DOM: TILLSTYRKS @$H" ;;
  fynd)       echo "1. BLOCKERANDE fil:1 …"; echo "DOM: FYND @$H — blockerande: #1" ;;
  fel-sha)    echo "DOM: TILLSTYRKS @0000000000000000000000000000000000000000" ;;
  prefix7)    echo "DOM: TILLSTYRKS @${H:0:7}" ;;
  fynd-sedan-tillstyrks) echo "DOM: FYND @$H — blockerande: #1"; echo "DOM: TILLSTYRKS @$H" ;;
  ingen-dom)  echo "Jag kunde inte avgöra." ;;
  tom)        : ;;
  tillstyrks-rc1) echo "DOM: TILLSTYRKS @$H"; exit 1 ;;
  smutsar)    echo "smuts" > SMUTS.txt; echo "DOM: TILLSTYRKS @$H" ;;
  sover)      sleep 5; echo "DOM: TILLSTYRKS @$H" ;;   # väggklockan ska bryta före svaret
esac
CL
chmod +x "$T/bin/claude"
export PATH="$T/bin:$PATH" NORTROPIC_GH="$T/bin/gh" NORTROPIC_CLAUDE="$T/bin/claude"
export CLAUDECODE=1 CLAUDE_CODE_CHILD_SESSION=1 SSH_AUTH_SOCK=/tmp/x GH_TOKEN=hemlig   # som i drivarens session: mekanismen ska ta bort dem för granskaren
export NORTROPIC_CHECK_VANTAN=0 NORTROPIC_CHECK_INTERVALL=0   # proven väntar inte på checks om de inte säger det

# ── fixtur: bare origin + arbetsklon med gren + hjälpklon för stub-merge ─────
bygg() {
  rm -rf "$T/origin.git" "$T/arb" "$T/mrg" "$T/gh.log" "$T/pr-skapad" "$T/review-postad" "$T/kommentar-postad" "$T/merge-anropad" "$T/granskad" "$T/granskningar" "$T/claude.sparr"
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
bygg; echo tillstyrks-rc1 > "$T/claude.case"
rc="$(kor)"; [ "$rc" = 2 ] && ingen_merge && ok "N2c granskaren gav DOM men avslutade med rc=1 → ODÖMBART (rc-kontrollen bär)" || fel "N2c" "rc=$rc"
bygg; echo fel-sha > "$T/claude.case"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && grep -q 'gäller' "$T/ut.txt" && ok "N3 DOM med fel SHA → stopp" || fel "N3" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo fynd > "$T/claude.case"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && [ -f "$T/review-postad" ] && ok "N4 FYND → stopp, rapport postad, ingen merge" || fel "N4" "rc=$rc"
bygg; echo prefix7 > "$T/claude.case"
rc="$(kor)"; [ "$rc" != 0 ] && ingen_merge && ok "N3b DOM med 7-teckensprefix → ingen merge (exakt fullt SHA krävs)" || fel "N3b" "rc=$rc"
bygg; echo fynd-sedan-tillstyrks > "$T/claude.case"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && ok "N4b FYND-rad följd av TILLSTYRKS-rad → stopp (varje FYND räknas)" || fel "N4b" "rc=$rc"
bygg; echo checks-fel > "$T/gh.case"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && grep -q 'gh-fel' "$T/ut.txt" && ok "N6e gh-fel vid läsning av checks → stopp, inte 'ingen CI'" || fel "N6e" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo spets-flyttar > "$T/gh.case"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && grep -q 'flyttade' "$T/ut.txt" && ok "N5 ny commit efter granskning → stopp" || fel "N5" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo rod-check > "$T/gh.case"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && grep -q 'skalprov' "$T/ut.txt" && ok "N6 röd check utan skäl → stopp" || fel "N6" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo rod-check > "$T/gh.case"
rc="$(kor --odombart-ok "skalprov under tests/scripts: Linux-ODÖMBART, se logg")"; [ "$rc" = 0 ] && [ -f "$T/merge-anropad" ] && [ -f "$T/kommentar-postad" ] && grep -q 'Linux-ODÖMBART' "$T/kommentar.args" && grep -q $'ODOMBART_OK=skalprov under tests/scripts: Linux-ODÖMBART' "$T/ut.txt" && ok "N6b röd check med uttryckligt skäl → merge, skälet postat på PR:en och i KVITTO-raden" || fel "N6b" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo rod-check > "$T/gh.case"
rc="$(kor --odombart-ok "skalprov under tests/scripts:   ")"; [ "$rc" = 1 ] && ingen_merge && ok "N6f --odombart-ok med tomt skäl → stopp" || fel "N6f" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo checks-tom > "$T/gh.case"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && grep -q 'inga checks' "$T/ut.txt" && ok "N6g tom check-rollup → stopp (tomt är inte grönt)" || fel "N6g" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo checks-vantar > "$T/gh.case"
rc="$(NORTROPIC_CHECK_VANTAN=5 kor)"; [ "$rc" = 0 ] && [ -f "$T/merge-anropad" ] && [ "$(grep -c statusCheckRollup "$T/gh.log")" -ge 3 ] && ok "P4 väntande check → pollas tills grön, sedan merge" || fel "P4" "rc=$rc anrop=$(grep -c statusCheckRollup "$T/gh.log") $(tail -1 "$T/ut.txt")"
bygg; echo checks-vantar-evigt > "$T/gh.case"
rc="$(NORTROPIC_CHECK_VANTAN=3 kor)"; [ "$rc" = 1 ] && ingen_merge && grep -q 'PENDING' "$T/ut.txt" && ok "N6h check som aldrig blir klar → stopp när väntetiden är slut" || fel "N6h" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo rod-check > "$T/gh.case"
rc="$(kor --odombart-ok ": Linux-ODÖMBART")"; [ "$rc" = 1 ] && ingen_merge && ok "N6c --odombart-ok med tomt namn → stopp" || fel "N6c" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo rod-check > "$T/gh.case"
rc="$(kor --odombart-ok "skalprov: delsträng räcker inte")"; [ "$rc" = 1 ] && ingen_merge && ok "N6d --odombart-ok med delsträng av namnet → stopp (exakt namn krävs)" || fel "N6d" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo smuts > "$T/arb/c.txt"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && [ ! -f "$T/granskad" ] && ok "N7 smutsig arbetskopia → stopp före granskning" || fel "N7" "rc=$rc"
bygg; echo smutsar > "$T/claude.case"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && grep -q 'smutsig' "$T/ut.txt" && ok "N8 granskaren smutsar trädet → stopp" || fel "N8" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; git -C "$T/arb" switch -q main
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && ok "N9 på main → stopp" || fel "N9" "rc=$rc"
bygg; echo review-faller > "$T/gh.case"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && grep -q 'kvitto' "$T/ut.txt" && ok "N10 kvittot kan inte postas → ingen merge" || fel "N10" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg
rc="$(kor --granskare ci)"; [ "$rc" = 1 ] && ingen_merge && [ ! -f "$T/granskad" ] && ok "N11a --granskare ci utan utpekat bot-konto → stopp" || fel "N11a" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo ci-annan > "$T/gh.case"
rc="$(NORTROPIC_CI_GRANSKARE=granskbot kor --granskare ci)"; [ "$rc" = 2 ] && ingen_merge && ok "N11b ci: ingen DOM från bot-kontot → ODÖMBART" || fel "N11b" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo ci-bot > "$T/gh.case"
rc="$(NORTROPIC_CI_GRANSKARE=granskbot kor --granskare ci)"; [ "$rc" = 0 ] && [ -f "$T/merge-anropad" ] && [ ! -f "$T/granskad" ] && ok "N11c ci: DOM från bot-kontot → merge utan lokal granskare" || fel "N11c" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo ci-fynd-sedan-tillstyrks > "$T/gh.case"
rc="$(NORTROPIC_CI_GRANSKARE=granskbot kor --granskare ci)"; [ "$rc" = 1 ] && ingen_merge && ok "N11d ci: FYND-rad följd av TILLSTYRKS-rad från boten → stopp (varje FYND räknas)" || fel "N11d" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo ci-gammal-sha > "$T/gh.case"
rc="$(NORTROPIC_CI_GRANSKARE=granskbot kor --granskare ci)"; [ "$rc" = 2 ] && ingen_merge && ok "N11e ci: botens DOM gäller ett annat SHA → ODÖMBART, ingen merge" || fel "N11e" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo merge-fel-foralder > "$T/gh.case"
rc="$(kor)"; [ "$rc" = 1 ] && [ -f "$T/merge-anropad" ] && grep -q 'andra förälder' "$T/ut.txt" && ok "N13 servern mergade fel commit → kvittokontrollen (origin/main^2 == HEAD) stoppar" || fel "N13" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo sover > "$T/claude.case"
rc="$(NORTROPIC_GRANSKARE_TID=1 kor)"; [ "$rc" = 2 ] && ingen_merge && grep -q 'väggklockan' "$T/ut.txt" && ok "N14 granskare som inte svarar → väggklockan bryter, ODÖMBART" || fel "N14" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo spets-fel-fran-start > "$T/gh.case"
rc="$(kor)"; [ "$rc" = 1 ] && ingen_merge && [ ! -f "$T/granskad" ] && ok "N12 PR-head ≠ HEAD redan före granskning → stopp, ingen granskare startad" || fel "N12" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg
rc="$(kor)"; H="$(git -C "$T/arb" rev-parse HEAD)"
if [ "$rc" = 0 ] && grep -q -- "--match-head-commit $H" "$T/merge.args" && [ "$(git -C "$T/mrg" rev-parse origin/main^2)" = "$H" ] && grep -q '^KVITTO' "$T/ut.txt" && [ -f "$T/review-postad" ]; then ok "P1 legitim grön kandidat → granskad, mergad med --match-head-commit, kvitto"; else fel "P1" "rc=$rc $(tail -2 "$T/ut.txt" | tr '\n' ' ')"; fi
[ "$(cat "$T/claude.pwd")" = "$(cd "$T/arb" && pwd -P)" ] && [ "$(cat "$T/claude.env")" = 0 ] && ok "P1b granskaren körs med cwd = repot, utan CLAUDECODE/CLAUDE_CODE_*/SSH_AUTH_SOCK/GH_TOKEN, utan projekthookar" || fel "P1b" "pwd=$(cat "$T/claude.pwd") läckta variabler=$(cat "$T/claude.env")"
# spärr (b): gh i granskarens PATH är skalet (inte stubben i $T/bin), och det vägrar; spärr (c): död transport
if [ "$(grep -cE '^/.*/publicera-sparr\.[^/]+/(gh|ssh|git)$' "$T/claude.sparr")" = 3 ] && grep -q '^gh_rc=77$' "$T/claude.sparr" && grep -q '^ssh_rc=255$' "$T/claude.sparr" && grep -q '^push_rc=77$' "$T/claude.sparr" && grep -q '^git_rc=0$' "$T/claude.sparr" && grep -q '^settings=.*"GH_CONFIG_DIR":".*gh-tom"' "$T/claude.sparr"; then ok "P1c granskarens gh/ssh/git löses till skal: gh vägrar (77), ssh vägrar (255), git push vägrar (77) men git läser; GH_CONFIG_DIR sätts via --settings"; else fel "P1c" "$(tr '\n' ' ' < "$T/claude.sparr")"; fi
bygg; echo ingen-pr > "$T/gh.case"
rc="$(kor)"; [ "$rc" = 0 ] && [ -f "$T/pr-skapad" ] && [ -f "$T/merge-anropad" ] && ok "P2 ingen PR → öppnas, sedan granskad och mergad" || fel "P2" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; git -C "$T/arb" commit -q --allow-empty -m "opushad"
rc="$(kor --utan-merge)"; [ "$rc" = 0 ] && [ "$(git -C "$T/arb" rev-parse origin/nortropic/loop-prov)" = "$(git -C "$T/arb" rev-parse HEAD)" ] && ingen_merge && ok "P3 opushad commit → pushas först; --utan-merge stannar efter granskning" || fel "P3" "rc=$rc $(tail -1 "$T/ut.txt")"

echo; echo "$PASS gröna · $FAIL röda"
[ "$FAIL" = 0 ] && exit 0 || exit 1
