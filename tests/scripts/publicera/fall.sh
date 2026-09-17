#!/usr/bin/env bash
# tests/scripts/publicera/fall.sh — negativa och positiva fall för scripts/publicera.sh
# med STUBBADE gh och claude. Engångsrepon under mktemp, eget $HOME, rör aldrig det riktiga
# repot. Varje fall: ett villkor som ska stoppa mergen, eller ett legitimt fall som ska gå.
#
#   bash tests/scripts/publicera/fall.sh            # kör alla
#   bash tests/scripts/publicera/fall.sh <sökväg>          # prova annan kandidat (första argumentet;
#   PUBLICERA=<sökväg> bash tests/scripts/publicera/fall.sh   #  miljöformen finns kvar för drivaren —
#                                                            #  granskaren får inte miljöprefix)
set -u
HAR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd -P)"
PUB="${1:-${PUBLICERA:-$HAR/scripts/publicera.sh}}"
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
           rod-check*) printf 'vaktsviten (webbfabriken)\tSUCCESS\nskalprov under tests/scripts\tFAILURE\n' ;;
           tom-conclusion) printf 'vaktsviten (webbfabriken)\tSUCCESS\nskalprov under tests/scripts\t?\n' ;;   # conclusion null → "?" ur jq
           checks-tom) : ;;   # fönstret mellan push och check-run: rollupen är tom
           checks-vantar) if [ "$K" -le 2 ]; then printf 'vaktsviten (webbfabriken)\tSUCCESS\nskalprov under tests/scripts\tPENDING\n'; else printf 'vaktsviten (webbfabriken)\tSUCCESS\nskalprov under tests/scripts\tSUCCESS\n'; fi ;;
           checks-vantar-evigt) printf 'vaktsviten (webbfabriken)\tSUCCESS\nskalprov under tests/scripts\tPENDING\n' ;;
           *) printf 'vaktsviten (webbfabriken)\tSUCCESS\nskalprov under tests/scripts\tSUCCESS\n' ;;
         esac ;;
     esac ;;
  "pr review") if [ "$C" = "review-faller" ]; then echo "HTTP 422" >&2; exit 1; fi; touch "$T/review-postad"; echo ok ;;
  "pr comment") case "$C" in *kommentar-faller*) echo "HTTP 422" >&2; exit 1 ;; esac; touch "$T/kommentar-postad"; printf '%s\n' "$*" > "$T/kommentar.args"; echo ok ;;
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
  git push --dry-run origin HEAD >/dev/null 2>&1; echo "lokalpush_rc=$?"; git push --dry-run git@github.com:x/y.git HEAD >/dev/null 2>&1; echo "natpush_rc=$?"; git rev-parse --is-inside-work-tree >/dev/null 2>&1; echo "git_rc=$?"
  git ls-remote git@github.com:x/y.git >/dev/null 2>&1; echo "transport_rc=$?"; git -c alias.p=push p --dry-run origin HEAD >/dev/null 2>&1; echo "alias_rc=$?"
  S=""; f=""; for a in "$@"; do [ "$f" = "--settings" ] && S="$a"; f="$a"; done; echo "settings=$S"; } > "$T/claude.sparr" 2>&1
case " $* " in *" --setting-sources user "*) ;; *) echo "claude-stub: projekthookar inte avstängda (--setting-sources user saknas)" >&2; exit 9 ;; esac
# --disallowedTools ska BÄRA spärrarna, inte bara finnas (en tom lista överlevde provet: fynd 4)
NEK=""; f=""; for a in "$@"; do [ "$f" = "--disallowedTools" ] && NEK="$a"; f="$a"; done
for m in "Edit" "Write" "Bash(gh:*)" "Bash(git push:*)" "Bash(git -C:*)" "Bash(git -c:*)" "Bash(git send-pack:*)" "Bash(env:*)" "Bash(/usr/bin/git:*)"; do case ",$NEK," in *",$m,"*) ;; *) echo "claude-stub: --disallowedTools saknar $m" >&2; exit 9 ;; esac; done
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
bygg; printf 'rod-check kommentar-faller' > "$T/gh.case"
rc="$(kor --odombart-ok "skalprov under tests/scripts: Linux-ODÖMBART")"; [ "$rc" = 1 ] && ingen_merge && grep -q 'bokföra' "$T/ut.txt" && ok "N6i --odombart-ok-skälet kan inte postas → ingen merge" || fel "N6i" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; echo tom-conclusion > "$T/gh.case"
rc="$(NORTROPIC_CHECK_VANTAN=2 kor)"; [ "$rc" = 1 ] && ingen_merge && grep -q 'väntar' "$T/ut.txt" && ok "N6j check med tom conclusion = väntande, stopp när tiden är slut" || fel "N6j" "rc=$rc $(tail -1 "$T/ut.txt")"
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
if [ "$(grep -cE '^/.*/publicera-sparr\.[^/]+/(gh|ssh|git)$' "$T/claude.sparr")" = 3 ] && grep -q '^gh_rc=77$' "$T/claude.sparr" && grep -q '^ssh_rc=255$' "$T/claude.sparr" && grep -q '^lokalpush_rc=0$' "$T/claude.sparr" && grep -q '^natpush_rc=77$' "$T/claude.sparr" && grep -q '^git_rc=0$' "$T/claude.sparr" && grep -q '^transport_rc=128$' "$T/claude.sparr" && grep -q '^alias_rc=77$' "$T/claude.sparr" && grep -q '^settings=.*"GH_CONFIG_DIR":".*gh-tom"' "$T/claude.sparr" && grep -q '^settings=.*"PreToolUse".*vakt-bash.sh' "$T/claude.sparr"; then ok "P1c granskarens gh/ssh/git löses till skal: gh 77, ssh 255, nätpush 77, alias-push 77, ssh-transport död (128), lokal push och läsning går; --settings bär GH_CONFIG_DIR och PreToolUse-vakten"; else fel "P1c" "$(tr '\n' ' ' < "$T/claude.sparr")"; fi
bygg; echo ingen-pr > "$T/gh.case"
rc="$(kor)"; [ "$rc" = 0 ] && [ -f "$T/pr-skapad" ] && [ -f "$T/merge-anropad" ] && ok "P2 ingen PR → öppnas, sedan granskad och mergad" || fel "P2" "rc=$rc $(tail -1 "$T/ut.txt")"
bygg; git -C "$T/arb" commit -q --allow-empty -m "opushad"
rc="$(kor --utan-merge)"; [ "$rc" = 0 ] && [ "$(git -C "$T/arb" rev-parse origin/nortropic/loop-prov)" = "$(git -C "$T/arb" rev-parse HEAD)" ] && ingen_merge && ok "P3 opushad commit → pushas först; --utan-merge stannar efter granskning" || fel "P3" "rc=$rc $(tail -1 "$T/ut.txt")"

# ── S: skalen (spärr b) mot RIKTIG git — lokala mål släpps, nätet vägras, i alla former ──
# GIT_SSH_COMMAND=false i provmiljön: skulle skalet släppa en nätpush faller den lokalt (rc 128), inte 77.
bash "$PUB" --skriv-skal "$T/skal" >/dev/null || fel "S0" "--skriv-skal misslyckades"
rm -rf "$T/sk"; mkdir -p "$T/sk"; git init -q --bare "$T/sk/lokal.git"; git init -q "$T/sk/klon"
( cd "$T/sk/klon" && echo a > a && git add a && git commit -q -m a && git remote add origin "$T/sk/lokal.git" && git remote add nat git@github.com:x/y.git && git remote add nathttps https://github.com/x/y.git && git push -q -u origin HEAD:main )
sk() { ( cd "$T/sk/klon" && env PATH="$T/skal:$PATH" GIT_SSH_COMMAND=false perl -e 'alarm shift; exec @ARGV' 20 "$@" ) > "$T/sk.ut" 2>&1; echo $?; }   # väggklocka: ett skal som loopar ger 142, inte ett hängt prov
rc="$(sk git push origin HEAD:refs/heads/s1)"; [ "$rc" = 0 ] && git -C "$T/sk/lokal.git" rev-parse -q --verify refs/heads/s1 >/dev/null && ok "S1 skalet släpper push till lokal bare via fjärrnamn" || fel "S1" "rc=$rc $(head -1 "$T/sk.ut")"
rc="$(sk git push --dry-run nat HEAD:refs/heads/s2)"; [ "$rc" = 77 ] && ok "S2 fjärrnamn med ssh-URL (scp-form) → 77" || fel "S2" "rc=$rc $(head -1 "$T/sk.ut")"
rc="$(sk git push --dry-run nathttps HEAD:refs/heads/s2)"; [ "$rc" = 77 ] && ok "S3 fjärrnamn med https-URL → 77" || fel "S3" "rc=$rc $(head -1 "$T/sk.ut")"
rc="$(sk git push --dry-run git@github.com:x/y.git HEAD:refs/heads/s2)"; [ "$rc" = 77 ] && ok "S4 URL direkt, scp-form → 77" || fel "S4" "rc=$rc"
rc="$(sk git push --dry-run ssh://git@github.com/x/y.git HEAD:refs/heads/s2)"; [ "$rc" = 77 ] && ok "S5 URL direkt, ssh:// → 77" || fel "S5" "rc=$rc"
rc="$(sk git push --dry-run -o x --force https://github.com/x/y.git HEAD:refs/heads/s2)"; [ "$rc" = 77 ] && ok "S6 flaggor med värde före URL:en (-o x --force) → 77" || fel "S6" "rc=$rc"
rc="$(sk git push)"; [ "$rc" = 0 ] && ok "S7 push utan argument med lokal upstream → släpps" || fel "S7" "rc=$rc $(head -1 "$T/sk.ut")"
( cd "$T/sk/klon" && git update-ref refs/remotes/nat/main HEAD && git branch -q --set-upstream-to=nat/main )
rc="$(sk git push)"; [ "$rc" = 77 ] && ok "S8 push utan argument med upstream på nätet → 77" || fel "S8" "rc=$rc $(head -1 "$T/sk.ut")"
( cd "$T/sk/klon" && git branch -q --set-upstream-to=origin/main )
rc="$( ( cd "$T" && env PATH="$T/skal:$PATH" GIT_SSH_COMMAND=false git -C "$T/sk/klon" push origin HEAD:refs/heads/s9 ) >/dev/null 2>&1; echo $? )"; [ "$rc" = 0 ] && git -C "$T/sk/lokal.git" rev-parse -q --verify refs/heads/s9 >/dev/null && ok "S9 git -C <klon> push till lokalt mål från annan cwd → släpps (fjärrnamnet löses i rätt repo)" || fel "S9" "rc=$rc"
rc="$( ( cd "$T" && env PATH="$T/skal:$PATH" GIT_SSH_COMMAND=false git -C "$T/sk/klon" push --dry-run nat HEAD ) >/dev/null 2>&1; echo $? )"; [ "$rc" = 77 ] && ok "S10 git -C <klon> push till nätfjärr → 77" || fel "S10" "rc=$rc"
rc="$(sk git push --dry-run "file://$T/sk/lokal.git" HEAD:refs/heads/s11)"; [ "$rc" = 0 ] && ok "S11 file://-URL → släpps" || fel "S11" "rc=$rc $(head -1 "$T/sk.ut")"
rc="$(sk git push --dry-run finns-inte HEAD)"; [ "$rc" = 77 ] && ok "S12 okänt fjärrnamn (varken remote eller katalog) → 77 (fail-closed)" || fel "S12" "rc=$rc"
rc="$(sk git log --oneline -1)"; [ "$rc" = 0 ] && grep -q ' a$' "$T/sk.ut" && ok "S13 icke-push (log) går till riktiga git" || fel "S13" "rc=$rc"
rc="$(sk gh pr list)"; [ "$rc" = 77 ] && ok "S14 gh via skalet → 77" || fel "S14" "rc=$rc"
rc="$(sk ssh -V)"; [ "$rc" = 255 ] && ok "S15 ssh via skalet → 255" || fel "S15" "rc=$rc"
rc="$(sk git -c alias.p=push p --dry-run origin HEAD)"; [ "$rc" = 77 ] && ok "S16 git -c alias.p=push → 77 (-c bara för ofarliga nycklar)" || fel "S16" "rc=$rc $(head -1 "$T/sk.ut")"
# S17 utan provmiljöns GIT_SSH_COMMAND: dör transporten i skalet syns ingen ssh alls (varken skalets "ssh är avstängt" eller riktig ssh)
rc="$( ( cd "$T/sk/klon" && env -u GIT_SSH_COMMAND PATH="$T/skal:$PATH" perl -e 'alarm shift; exec @ARGV' 20 git ls-remote git@github.com:x/y.git ) > "$T/sk.ut" 2>&1; echo $? )"; [ "$rc" = 128 ] && ! grep -q 'ssh' "$T/sk.ut" && ok "S17 ls-remote över ssh → 128 utan att någon ssh startats (skalets transportdöd, inte provmiljöns)" || fel "S17" "rc=$rc $(head -1 "$T/sk.ut")"
rc="$(sk git -c user.name=x -c user.email=y@z commit -q --allow-empty -m tom)"; [ "$rc" = 0 ] && ok "S18 git -c user.name/user.email → släpps (proven behöver dem)" || fel "S18" "rc=$rc $(head -1 "$T/sk.ut")"
rc="$(sk git -c credential.helper=osxkeychain push --dry-run nathttps HEAD)"; [ "$rc" = 77 ] && ok "S19 git -c credential.helper=… → 77" || fel "S19" "rc=$rc"
rc="$(sk git -c core.sshCommand=/usr/bin/ssh ls-remote git@github.com:x/y.git)"; [ "$rc" = 77 ] && ok "S20 git -c core.sshCommand=… → 77" || fel "S20" "rc=$rc"
# S21 skal på skal: granskaren kör harnessen under mekanismens skal, och harnessen lägger sitt eget skal först — måste komponera
bash "$PUB" --skriv-skal "$T/skal2" >/dev/null
rc="$( ( cd "$T/sk/klon" && env PATH="$T/skal2:$T/skal:$PATH" GIT_SSH_COMMAND=false perl -e 'alarm shift; exec @ARGV' 20 git push origin HEAD:refs/heads/s21 ) > "$T/sk.ut" 2>&1; echo $? )"; [ "$rc" = 0 ] && git -C "$T/sk/lokal.git" rev-parse -q --verify refs/heads/s21 >/dev/null && ok "S21 skal på skal: lokal push går igenom båda (skalens egna -c-nycklar är tillåtna)" || fel "S21" "rc=$rc $(head -1 "$T/sk.ut")"
rc="$( ( cd "$T/sk/klon" && env PATH="$T/skal2:$T/skal:$PATH" GIT_SSH_COMMAND=false perl -e 'alarm shift; exec @ARGV' 20 git push --dry-run nat HEAD ) > "$T/sk.ut" 2>&1; echo $? )"; [ "$rc" = 77 ] && ok "S22 skal på skal: nätpush vägras fortfarande" || fel "S22" "rc=$rc"
# ── H: Bash-vakten (spärr a') — hooken körs som Claude Code kör den: JSON på stdin, exit 2 = nekad ──
hk() { printf '{"tool_name":"Bash","tool_input":{"command":%s}}' "$(printf '%s' "$1" | /usr/bin/python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')" | sh "$T/skal/vakt-bash.sh" > "$T/hk.ut" 2>&1; echo $?; }
[ "$(hk 'git log --oneline -3')" = 0 ] && ok "H1 vakten släpper git log" || fel "H1" "$(cat "$T/hk.ut")"
[ "$(hk 'bash tests/scripts/publicera/fall.sh /tmp/kopia/publicera.sh')" = 0 ] && ok "H2 vakten släpper harness med kandidat som argument" || fel "H2" "$(cat "$T/hk.ut")"
[ "$(hk 'node scripts/kor-vakter.mjs')" = 0 ] && ok "H3 vakten släpper node scripts/…" || fel "H3" "$(cat "$T/hk.ut")"
[ "$(hk 'PATH=/usr/bin:$PATH git ls-remote --heads origin main')" = 2 ] && ok "H4 PATH=… före git → nekad" || fel "H4" "rc≠2"
[ "$(hk 'PUBLICERA=/tmp/x bash tests/scripts/publicera/fall.sh')" = 2 ] && ok "H5 variabeltilldelning före kommandot → nekad" || fel "H5" "rc≠2"
[ "$(hk 'env X=1 git log')" = 2 ] && ok "H6 env … → nekad" || fel "H6" "rc≠2"
[ "$(hk 'git -c alias.p=push p --dry-run origin HEAD')" = 2 ] && ok "H7 git -c → nekad" || fel "H7" "rc≠2"
[ "$(hk 'git send-pack --dry-run origin HEAD')" = 2 ] && ok "H8 git send-pack → nekad" || fel "H8" "rc≠2"
[ "$(hk '/usr/bin/git log')" = 2 ] && ok "H9 absolut sökväg till git → nekad" || fel "H9" "rc≠2"
[ "$(hk 'bash tests/../../../../tmp/x.sh')" = 2 ] && ok "H10 traversering med .. → nekad" || fel "H10" "rc≠2"
[ "$(hk 'git log | grep x && X=1 gh pr list')" = 2 ] && ok "H11 kringgång i senare segment (&&) → nekad" || fel "H11" "rc≠2"
[ "$(hk 'bash -c "git push origin HEAD"')" = 2 ] && ok "H12 bash -c → nekad" || fel "H12" "rc≠2"
[ "$(hk 'git diff origin/main...HEAD -- scripts/publicera.sh')" = 0 ] && ok "H13 vakten släpper git diff med sökvägar" || fel "H13" "$(cat "$T/hk.ut")"
[ "$(hk 'echo $(git -C /x log)')" = 2 ] && ok "H14 git -C inuti \$( ) → nekad" || fel "H14" "rc≠2"
printf '{"tool_name":"Read","tool_input":{"file_path":"/x"}}' | sh "$T/skal/vakt-bash.sh" >/dev/null 2>&1; [ $? = 0 ] && ok "H15 andra verktyg än Bash rörs inte" || fel "H15" "rc≠0"
[ "$(hk 'bash tests/scripts/publicera/fall.sh PATH=/usr/bin')" = 2 ] && ok "H16 PATH= som argument (inte tilldelning) → nekad ändå (miljö-/PATH-mönstret bär, inte bara tilldelningsregeln)" || fel "H16" "rc≠2"
[ "$(hk 'git log -1 -- GIT_SSH_COMMAND=false')" = 2 ] && ok "H17 GIT_*= var som helst → nekad" || fel "H17" "rc≠2"

echo; echo "$PASS gröna · $FAIL röda"
[ "$FAIL" = 0 ] && exit 0 || exit 1
