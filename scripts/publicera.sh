#!/usr/bin/env bash
# publicera.sh — bevara → PR → SEPARAT granskning → merge, som mekanism i stället för minne.
#
#     bash scripts/publicera.sh --repo <klon> [--gren <namn>] [--granskare claude|ci|ingen]
#                               [--utan-merge] [--odombart-ok "<checknamn>: <skäl>"] [--torr]
#
# Ägaren 2026-09-17: "auto PR review och push, så vi inte hamnar med 100 commits" och
# "det viktiga för mig att vi kan arbeta i mål det här autonomt, utan min inblandning".
# Befogenheten är LOOP-ÄGARBESLUT-PUBLICERING-V2 (kedjedrivaren publicerar efter
# identity/scope/gate/REVIEWER-kontrollerna). Detta skript ÄR reviewer-kontrollen som
# mekanism: den som byggde får aldrig döma sin egen diff (AGENTS.md, regel 12a/14).
#
# VAD DEN GÖR, I ORDNING — och varje steg stoppar synligt när villkoret inte håller:
#   1  arbetskopian är ren, grenen ≠ main, HEAD finns på origin (regel 12)
#   2  en PR finns för grenen mot main, annars öppnas en
#   3  PR:ens head == lokal HEAD (annars har någon annan skrivit på grenen — STOPP)
#   4  granskning av HELA intervallet main..HEAD i en SEPARAT process utan sessionshistorik
#      (`claude -p`, rollen ur .agents/skills/nortropic-reviewer/SKILL.md + PR-TILLAGG.md,
#      inga skrivverktyg). Domen måste bära exakt det SHA den läste. Rapporten läggs som
#      PR-review-kommentar på GitHub — kvittot ska överleva denna maskin.
#   5  merge (normal merge-commit, aldrig squash/rebase) ENDAST om: dom = TILLSTYRKS @HEAD,
#      PR-head fortfarande == HEAD, alla checks gröna (röd check = vänta, även om den kan
#      vara ODÖMBART — det säger du i så fall uttryckligen med --odombart-ok och skälet
#      bokförs), och --match-head-commit skyddar mot en spets som flyttat under tiden.
#   6  kvitto: PR, granskat SHA, merge-SHA, verifierat mot origin/main^2.
#
# VAD DEN INTE GÖR: committar inte, ändrar inte grinden, döljer inte fynd, mergar aldrig
# med FYND, frågar aldrig ägaren. Kör den från kedjedrivaren (Claude eller Codex) vid varje
# avslutad leverans; `nortropic-autocommit.sh --publicera` anropar den när
# NORTROPIC_PUBLICERA=1. Exitkoder: 0 mergad · 1 stopp (villkor saknas) · 2 ODÖMBART
# (granskaren gav inget dömbart svar) · 3 fel i anropet.
set -u

ROT=""; GREN=""; GRANSKARE="claude"; UTAN_MERGE=0; TORR=0; ODOK=""; VISA_REPO=0
while [ $# -gt 0 ]; do
  case "$1" in
    --repo) ROT="${2:-}"; [ -n "$ROT" ] || { echo "--repo kräver ett värde" >&2; exit 3; }; shift 2 ;;
    --gren) GREN="$2"; shift 2 ;;
    --granskare) GRANSKARE="$2"; shift 2 ;;
    --utan-merge) UTAN_MERGE=1; shift ;;
    --odombart-ok) ODOK="$2"; shift 2 ;;
    --torr) TORR=1; shift ;;
    --visa-repo) VISA_REPO=1; shift ;;
    *) echo "okänt argument: $1" >&2; exit 3 ;;
  esac
done
GH="${NORTROPIC_GH:-gh}"; CLAUDE="${NORTROPIC_CLAUDE:-claude}"
[ -n "$ROT" ] || ROT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "STOPP: --repo saknas och cwd är inget repo" >&2; exit 3; }
ROT="$(cd "$ROT" && pwd -P)" || exit 3
g() { git -C "$ROT" "$@"; }
# owner/repo ur origin-URL:en, för gh --repo. Portabelt: macOS sed -E saknar icke-giriga
# kvantifierare (`+?` gav "RE error" — funnet av mekanismens första körning mot sig själv).
# Former: git@github.com:Org/repo.git · https://github.com/Org/repo(.git) · lokal bare-sökväg.
repo_namn() { printf '%s' "$1" | sed -E 's#/+$##; s#\.git$##; s#.*[:/]([^/:]+/[^/]+)$#\1#'; }
REPO="$(repo_namn "$(g remote get-url origin 2>/dev/null)")"
if [ "$VISA_REPO" = 1 ]; then printf '%s\n' "$REPO"; exit 0; fi
case "$REPO" in */*) ;; *) echo "STOPP: kunde inte utvinna owner/repo ur origin ('$REPO')" >&2; exit 1 ;; esac
stopp() { echo "STOPP: $*" >&2; exit 1; }
odombart() { echo "ODÖMBART: $*" >&2; exit 2; }

# ── 1. bevarat? ─────────────────────────────────────────────────────────────
[ -z "$GREN" ] && GREN="$(g rev-parse --abbrev-ref HEAD)"
[ "$GREN" != "HEAD" ] || stopp "detached HEAD — publicering sker från en gren"
case "$GREN" in main|master) stopp "på $GREN — publicering går via en arbetsgren" ;; esac
[ -z "$(g status --porcelain)" ] || stopp "arbetskopian är inte ren — bevara först (scripts/nortropic-autocommit.sh)"
HEAD_SHA="$(g rev-parse HEAD)"
g fetch -q origin "$GREN" 2>/dev/null || true
FJARR="$(g rev-parse -q --verify "refs/remotes/origin/$GREN" 2>/dev/null || echo '')"
if [ -z "$FJARR" ]; then
  [ "$TORR" = 1 ] && { echo "torr: skulle pusha $GREN (ny gren)"; exit 0; }
  g push -q -u origin "$GREN" || stopp "push misslyckades — commiten är LOKAL, inget publicerat"
elif [ "$FJARR" != "$HEAD_SHA" ]; then
  if g merge-base --is-ancestor "$FJARR" "$HEAD_SHA" 2>/dev/null; then
    [ "$TORR" = 1 ] && echo "torr: skulle pusha $GREN" || { g push -q origin "$GREN" || stopp "push misslyckades — HEAD $HEAD_SHA är LOKAL"; }
  else
    stopp "origin/$GREN ($FJARR) är inte förfader till HEAD ($HEAD_SHA) — en annan skrivare? Ingen force."
  fi
fi
echo "1 bevarat:   $GREN @ ${HEAD_SHA:0:12} finns på origin"

# ── 2. PR ────────────────────────────────────────────────────────────────────
PRNR="$($GH pr list --repo "$REPO" --head "$GREN" --base main --state open --json number --jq '.[0].number // empty' 2>/dev/null || echo '')"
case "$PRNR" in ''|*[!0-9]*) PRNR="" ;; esac   # bara ett tal är ett PR-nummer
if [ -z "$PRNR" ]; then
  [ "$TORR" = 1 ] && { echo "torr: skulle öppna PR för $GREN"; exit 0; }
  TITEL="$(g log -1 --format=%s)"
  KROPP="$(g log -1 --format=%b)"
  URL="$($GH pr create --repo "$REPO" --base main --head "$GREN" --title "$TITEL" --body "$KROPP

Öppnad av scripts/publicera.sh. Granskning och merge sker mekaniskt: se PR-kommentarerna." 2>/dev/null | tail -1)"
  PRNR="$(printf '%s' "$URL" | sed -nE 's#.*/pull/([0-9]+).*#\1#p')"
  [ -n "$PRNR" ] || PRNR="$($GH pr list --repo "$REPO" --head "$GREN" --state open --json number --jq '.[0].number // empty')"
  case "$PRNR" in ''|*[!0-9]*) stopp "kunde inte öppna PR för $GREN (svar: '$URL')" ;; esac
fi
echo "2 PR:        #$PRNR"

# ── 3. rätt kandidat ────────────────────────────────────────────────────────
PRHEAD="$($GH pr view "$PRNR" --repo "$REPO" --json headRefOid --jq .headRefOid)"
[ "$PRHEAD" = "$HEAD_SHA" ] || stopp "PR #$PRNR head $PRHEAD ≠ lokal HEAD $HEAD_SHA — kandidaten är inte den du tror"
echo "3 kandidat:  PR-head == HEAD"

# ── 4. separat granskning ───────────────────────────────────────────────────
KVITTOKAT="${NORTROPIC_GRANSKNINGAR:-$HOME/.nortropic/granskningar}"; mkdir -p "$KVITTOKAT"
RAPPORT="$KVITTOKAT/pr$PRNR-${HEAD_SHA:0:12}.md"
DOM=""
case "$GRANSKARE" in
  ingen) stopp "--granskare ingen: ingen granskning, ingen merge (villkoret finns för att inte kunna hoppas över)" ;;
  ci)
    # Kvittot läses ur PR:ens reviews — men BARA från det konto granskningsjobbet postar med.
    # Utan utpekat konto vägrar läget: en DOM-rad från vem som helst (t.ex. författaren) vore
    # exakt den självcertifiering mekanismen finns för att hindra (mekanismens egen granskning
    # av sig själv, fynd 2, 2026-09-17).
    BOT="${NORTROPIC_CI_GRANSKARE:-}"
    [ -n "$BOT" ] || stopp "--granskare ci: granskningsjobbet är inte påslaget — sätt NORTROPIC_CI_GRANSKARE=<jobbets konto> när det finns"
    DOM="$($GH api "repos/$REPO/pulls/$PRNR/reviews" --jq ".[] | select(.user.login == \"$BOT\") | .body" 2>/dev/null | grep -E '^DOM: (TILLSTYRKS|FYND) @[0-9a-f]{7,40}' | tail -1)"
    [ -n "$DOM" ] || odombart "ingen DOM-rad från $BOT i PR #$PRNR:s reviews"
    ;;
  claude)
    [ -f "$ROT/.agents/skills/nortropic-reviewer/SKILL.md" ] || stopp "granskarrollen saknas i repot"
    PROMPT="Du är nortropic-reviewer: OBEROENDE och READ-ONLY. Du har inte skrivit denna kod. Läs och följ ordagrant .agents/skills/nortropic-reviewer/SKILL.md och .agents/skills/nortropic-reviewer/PR-TILLAGG.md. Granska HELA intervallet origin/main..HEAD (kommando: git diff origin/main...HEAD; git log --oneline origin/main..HEAD) i detta repo. Ändra ingenting i arbetsträdet, committa inget. Mutationer och experiment gör du i KOPIOR under mktemp (t.ex. PUBLICERA=<kopia> bash tests/…). Verifiera varje misstanke mekaniskt innan du rapporterar. Skriv fynden numrerade, allvarligast först, med fil:rad, kommando, observerat, verdikt (BLOCKERANDE/ADVISORY/OK) och minsta åtgärd. AVSLUTA med exakt en rad på formen 'DOM: TILLSTYRKS @$HEAD_SHA' eller 'DOM: FYND @$HEAD_SHA — blockerande: #n, #m'. SHA:t måste vara exakt $HEAD_SHA."
    [ "$TORR" = 1 ] && { echo "torr: skulle starta granskare för ${HEAD_SHA:0:12}"; exit 0; }
    # Ren process: inga ärvda sessionsvariabler, inga skrivverktyg, cwd = repot. Prompten går
    # på STDIN: --allowedTools/--disallowedTools är variadiska och svalde annars prompten som
    # ett verktygsnamn (mekanismens andra körning mot sig själv, 2026-09-17 12:59).
    # Granskaren får inte kandidatens hookar (.claude/settings.json → autocommit av kandidatkod:
    # --setting-sources user), inte drivarens gh-/ssh-credentials (tom GH_CONFIG_DIR, utan
    # SSH_AUTH_SOCK/GH_TOKEN), och en väggklocka (macOS saknar timeout; perl alarm finns).
    GHTOM="$(mktemp -d "${TMPDIR:-/tmp}/publicera-ghtom.XXXXXX")"
    # ALLA sessionsvariabler (CLAUDECODE, CLAUDE_CODE_*) — listan varierar mellan versioner.
    AVSKALA="-u CLAUDECODE -u SSH_AUTH_SOCK -u GH_TOKEN -u GITHUB_TOKEN"
    for v in $(env | sed -nE 's/^(CLAUDE_CODE_[A-Za-z0-9_]*)=.*/\1/p'); do AVSKALA="$AVSKALA -u $v"; done
    printf '%s' "$PROMPT" | ( cd "$ROT" && env $AVSKALA GH_CONFIG_DIR="$GHTOM" \
        perl -e 'alarm shift; exec @ARGV' "${NORTROPIC_GRANSKARE_TID:-3600}" \
        "$CLAUDE" -p --max-turns 60 --output-format text --setting-sources user \
        --disallowedTools "Edit,Write,NotebookEdit,Bash(git commit:*),Bash(git push:*),Bash(git checkout:*),Bash(git reset:*),Bash(git stash:*),Bash(git merge:*),Bash(git rebase:*)" \
        --allowedTools "Read,Grep,Glob,Bash(git diff:*),Bash(git log:*),Bash(git show:*),Bash(git ls-files:*),Bash(git ls-tree:*),Bash(git rev-parse:*),Bash(git status:*),Bash(git check-ignore:*),Bash(git cat-file:*),Bash(node scripts/:*),Bash(bash tests/:*),Bash(PUBLICERA=:*),Bash(HOOK=:*),Bash(REDO=:*),Bash(shasum:*),Bash(wc:*),Bash(sed -n:*),Bash(cat:*),Bash(ls:*),Bash(diff:*),Bash(mktemp:*),Bash(cp:*)" \
        ) > "$RAPPORT" 2> "$RAPPORT.stderr"
    RC=$?; rm -rf "$GHTOM"
    [ "$RC" = 142 ] && odombart "granskaren avbröts av väggklockan (${NORTROPIC_GRANSKARE_TID:-3600} s)"
    [ -z "$(g status --porcelain)" ] || stopp "granskaren lämnade arbetskopian smutsig — kandidaten är inte längre den granskade (git status)"
    [ "$RC" = 0 ] && [ -s "$RAPPORT" ] || odombart "granskaren avslutade med rc=$RC eller tom rapport ($RAPPORT)"
    # Varje FYND-rad räknas: en rapport som först säger FYND och sist TILLSTYRKS är inte grön.
    if grep -qE '^DOM: FYND @[0-9a-f]{7,40}' "$RAPPORT"; then DOM="$(grep -E '^DOM: FYND @[0-9a-f]{7,40}' "$RAPPORT" | head -1)"
    else DOM="$(grep -E '^DOM: TILLSTYRKS @[0-9a-f]{40}( |$)' "$RAPPORT" | tail -1)"; fi
    [ -n "$DOM" ] || odombart "ingen DOM-rad (med fullt 40-teckens SHA) i granskarens svar ($RAPPORT)"
    # Kvittot ÄR granskarens PR-kommentar och ska överleva maskinen: kan det inte postas sker
    # ingen merge (mekanismens egen granskning av sig själv, fynd 1). Rapporten finns kvar lokalt.
    $GH pr review "$PRNR" --repo "$REPO" --comment --body-file "$RAPPORT" >/dev/null 2>&1 || stopp "kunde inte lägga rapporten som PR-review — ingen merge utan kvitto (rapport: $RAPPORT)"
    ;;
  *) echo "okänd granskare: $GRANSKARE" >&2; exit 3 ;;
esac
DOMSHA="$(printf '%s\n' "$DOM" | sed -E 's/^DOM: [A-Z]+ @([0-9a-f]+).*/\1/')"
# EXAKT likhet med hela SHA:t (ett 7-teckensprefix är ingen bindning; tomt prefix matchar allt).
[ -n "$DOMSHA" ] && [ "$DOMSHA" = "$HEAD_SHA" ] || stopp "domen gäller '$DOMSHA', inte HEAD $HEAD_SHA — gammal eller oprecis granskning gäller inte denna kandidat"
echo "4 granskning: $DOM"
case "$DOM" in "DOM: FYND"*) stopp "granskningen gav FYND — åtgärda på samma gren och kör om (samma budget, ingen ny gren). Rapport: $RAPPORT" ;; esac

# ── 5. merge-villkor ────────────────────────────────────────────────────────
[ "$UTAN_MERGE" = 1 ] && { echo "5 merge:     hoppas över (--utan-merge)"; exit 0; }
PRHEAD2="$($GH pr view "$PRNR" --repo "$REPO" --json headRefOid --jq .headRefOid)"
[ "$PRHEAD2" = "$HEAD_SHA" ] || stopp "PR-head flyttade under granskningen ($PRHEAD2) — granskningen gäller inte längre"
CHECKS="$($GH pr view "$PRNR" --repo "$REPO" --json statusCheckRollup --jq '.statusCheckRollup[] | "\(.name // .context // "?")\t\(.conclusion // .state // "?")"' 2>/dev/null)" \
  || stopp "kunde inte läsa PR:ens checks (gh-fel) — ett fel är inte 'ingen CI'"
if [ -n "$CHECKS" ]; then
  RODA="$(printf '%s\n' "$CHECKS" | awk -F'\t' 'tolower($2)!="success" && tolower($2)!="skipped" && tolower($2)!="neutral" {print $1" = "$2}')"
  if [ -n "$RODA" ]; then
    if [ -n "$ODOK" ]; then
      NAMN="${ODOK%%:*}"; SKAL="${ODOK#*:}"
      [ -n "$NAMN" ] && [ "$NAMN" != "$ODOK" ] && [ -n "$(printf '%s' "$SKAL" | tr -d ' ')" ] || stopp "--odombart-ok kräver formen '<exakt checknamn>: <skäl>'"
      KVAR="$(printf '%s\n' "$RODA" | awk -F' = ' -v n="$NAMN" '$1 != n' || true)"
      [ -z "$KVAR" ] || stopp "checks som inte är gröna:"$'\n'"$KVAR"
      echo "  ODÖMBART accepterat uttryckligen: $ODOK"
    else
      stopp "checks som inte är gröna (röd kan vara ODÖMBART — säg det i så fall med --odombart-ok '<namn>: <skäl>'):"$'\n'"$RODA"
    fi
  fi
  echo "5 checks:    $(printf '%s\n' "$CHECKS" | wc -l | tr -d ' ') st, inga röda utan skäl"
else
  echo "5 checks:    inga (ingen CI på denna PR)"
fi
$GH pr merge "$PRNR" --repo "$REPO" --merge --match-head-commit "$HEAD_SHA" >/dev/null 2>"$RAPPORT.merge.stderr" \
  || stopp "merge nekades: $(head -3 "$RAPPORT.merge.stderr" | tr '\n' ' ')"

# ── 6. kvitto ───────────────────────────────────────────────────────────────
g fetch -q origin main
MERGE_SHA="$(g rev-parse origin/main)"
P2="$(g rev-parse -q --verify "origin/main^2" 2>/dev/null || echo '')"
[ "$P2" = "$HEAD_SHA" ] || stopp "origin/main ($MERGE_SHA) har inte HEAD som andra förälder — kontrollera för hand innan något upprepas"
echo "6 mergad:    PR #$PRNR · granskat ${HEAD_SHA:0:12} · merge ${MERGE_SHA:0:12} · rapport $RAPPORT"
printf 'KVITTO\tPR=%s\tGRANSKAT=%s\tMERGE=%s\tDOM=%s\n' "$PRNR" "$HEAD_SHA" "$MERGE_SHA" "$DOM"
exit 0
