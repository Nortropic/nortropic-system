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
#      inga skrivverktyg, inget gh, ingen push — se GRANSKARENS SPÄRRAR nedan). Domen måste
#      bära exakt det SHA den läste. Rapporten läggs som PR-review-kommentar på GitHub —
#      kvittot ska överleva denna maskin.
#   5  merge (normal merge-commit, aldrig squash/rebase) ENDAST om: dom = TILLSTYRKS @HEAD,
#      PR-head fortfarande == HEAD, checks finns och är gröna (väntande checks pollas upp
#      till NORTROPIC_CHECK_VANTAN s; INGA checks alls = stopp, inte 'ingen CI'; röd check =
#      stopp, även om den kan vara ODÖMBART — det säger du i så fall uttryckligen med
#      --odombart-ok och skälet bokförs i KVITTO-raden OCH som PR-kommentar), och
#      --match-head-commit skyddar mot en spets som flyttat under tiden.
#   6  kvitto: PR, granskat SHA, merge-SHA, verifierat mot origin/main^2.
#
# VAD DEN INTE GÖR: committar inte, ändrar inte grinden, döljer inte fynd, mergar aldrig
# med FYND, frågar aldrig ägaren. Kör den från kedjedrivaren (Claude eller Codex) vid varje
# avslutad leverans; `nortropic-autocommit.sh --publicera` anropar den när
# NORTROPIC_PUBLICERA=1. Exitkoder: 0 mergad · 1 stopp (villkor saknas) · 2 ODÖMBART
# (granskaren gav inget dömbart svar) · 3 fel i anropet.
#
# GRANSKARENS SPÄRRAR (mätta mot riktig `claude`, 2026-09-17 — se drift.md): domaren får
# inte kunna merga, posta eller pusha. `--setting-sources user` laddar ägarens
# ~/.claude/settings.json vars `env` skriver över mekanismens GH_CONFIG_DIR (fjärde
# självgranskningen, fynd 1: granskaren svarade `Logged in … Jonkebronk`); prefixregler
# ser inte `PATH=… git …`, `git -c alias.p=push p` eller `send-pack` (femte självgranskningen
# + oberoende granskning). Lagren, och vad som faktiskt bär dem:
#   (a) verktygsnekande (`--disallowedTools`): gh (kort och absolut sökväg), git push/-C/-c/
#       send-pack/http-push/worktree/branch/switch/remote/config, git via absolut sökväg,
#       env/export/eval/`bash -c`/`python3 -c`, alla skrivverktyg.
#   (a') PreToolUse-hook via `--settings` (`vakt-bash.sh` i skalkatalogen) som ser HELA
#       kommandosträngen: nekar (exit 2) variabeltilldelning eller `env` före ett kommando,
#       `PATH=`/`GIT_*`/`GH_*` i strängen, absoluta sökvägar till git/gh/ssh/tolkar, `git -c`/
#       `--config-env`/`-C` och skrivande eller nätverkande git-subkommandon, traversering
#       med `..`, `bash -c`. Detta är den mekaniska push-spärren för Bash-verktyget; deny-
#       reglerna och klassificeraren är lager under den.
#   (b) PATH-skal först i granskarens PATH, för kommandon som slås upp via PATH inifrån
#       tillåtna skript: `gh` vägrar (77); `ssh` vägrar (255); `git` kör den riktiga binären
#       med DÖD NÄTTRANSPORT (GIT_SSH_COMMAND=false, ingen terminalprompt, ingen askpass,
#       credential.helper nollad), tillåter `-c` bara för ofarliga nycklar (user.*, core.fsmonitor,
#       init.*, advice.*, …) och vägrar `push` mot nätet med tydligt fel (77) men SLÄPPER push till
#       lokala sökvägar/file:// (provens fixturer pushar till bare-repon under mktemp). Kringgås
#       av ett skript som själv sätter PATH eller anropar binären absolut — bokförd lucka.
#   (c) GH_CONFIG_DIR → tom katalog via `--settings` (kommandoraden slår användarinställningen;
#       en lös miljövariabel gjorde det inte), så att inte ens en absolut sökväg till gh
#       inifrån ett tillåtet skript hittar en inloggning (mätt: `You are not logged into…`).
#   Mätt tre gånger mot riktig claude: GIT_*-variabler når INTE granskarens Bash, varken lösa
#   eller via --settings — därför bär miljön ingen git-spärr och skriptet sätter inga.
#   `--skriv-skal <katalog>` skriver skalen + hooken för proven (tests/scripts/publicera/fall.sh).
set -u

ROT=""; GREN=""; GRANSKARE="claude"; UTAN_MERGE=0; TORR=0; ODOK=""; VISA_REPO=0; SKRIV_SKAL=""
while [ $# -gt 0 ]; do
  case "$1" in
    --repo) ROT="${2:-}"; [ -n "$ROT" ] || { echo "--repo kräver ett värde" >&2; exit 3; }; shift 2 ;;
    --gren) GREN="$2"; shift 2 ;;
    --granskare) GRANSKARE="$2"; shift 2 ;;
    --utan-merge) UTAN_MERGE=1; shift ;;
    --odombart-ok) ODOK="$2"; shift 2 ;;
    --torr) TORR=1; shift ;;
    --visa-repo) VISA_REPO=1; shift ;;
    --skriv-skal) SKRIV_SKAL="${2:-}"; [ -n "$SKRIV_SKAL" ] || { echo "--skriv-skal kräver en katalog" >&2; exit 3; }; shift 2 ;;
    *) echo "okänt argument: $1" >&2; exit 3 ;;
  esac
done
GH="${NORTROPIC_GH:-gh}"; CLAUDE="${NORTROPIC_CLAUDE:-claude}"
# Granskarens PATH-skal (spärr b) och Bash-vakt (spärr a'). Skrivs till en katalog som läggs
# FÖRST i granskarens PATH; hooken pekas ut via --settings.
skriv_skal() {
  local D="$1"; mkdir -p "$D/gh-tom"
  printf '#!/bin/sh\necho "gh är avstängt för granskaren (publicera.sh spärr b) — GitHub-läget kontrolleras av mekanismen" >&2\nexit 77\n' > "$D/gh"
  printf '#!/bin/sh\necho "ssh är avstängt för granskaren (publicera.sh spärr b)" >&2\nexit 255\n' > "$D/ssh"
  cat > "$D/git" <<'SKAL'
#!/bin/sh
# git-skal för granskaren (publicera.sh spärr b): riktiga git med DÖD NÄTTRANSPORT; `-c` bara för
# ofarliga nycklar; `push` mot nätet vägras med tydligt fel (77); push till lokala sökvägar/file://
# släpps (proven pushar till bare-repon under mktemp). Kringgås av absolut sökväg eller egen PATH.
HAR="$(cd "$(dirname "$0")" && pwd -P)"; REAL=""
# hoppa över skalet självt (PATH kan stava katalogen med dubbla snedstreck — jämför inod, inte sträng)
OIFS=$IFS; IFS=:; for d in $PATH; do [ -x "$d/git" ] || continue; [ "$d/git" -ef "$0" ] && continue; REAL="$d/git"; break; done; IFS=$OIFS
[ -n "$REAL" ] || { echo "git-skal: ingen riktig git i PATH" >&2; exit 127; }
neka() { echo "$1 är avstängt för granskaren (publicera.sh spärr b)" >&2; exit 77; }
ofarlig() { case "$1" in user.*|core.fsmonitor=*|init.*|advice.*|commit.gpgsign=*|log.*|diff.*|color.*|status.*|gc.*|core.pager=*|core.quotepath=*) return 0 ;; *) return 1 ;; esac; }
# globala flaggor före subkommandot (-C <dir> behövs för att lösa fjärrnamn i rätt repo; -c policyprövas)
CDIR=""; SUB=""; SUBI=0; i=0; VANTAR=""
for a in "$@"; do
  i=$((i+1))
  if [ -n "$VANTAR" ]; then
    [ "$VANTAR" = C ] && [ -z "$CDIR" ] && CDIR="$a"
    [ "$VANTAR" = c ] && { ofarlig "$a" || neka "git -c $a"; }
    VANTAR=""; continue
  fi
  case "$a" in
    -C) VANTAR=C ;; -c) VANTAR=c ;; -c?*) ofarlig "${a#-c}" || neka "git $a" ;;
    --config-env|--config-env=*) neka "git --config-env" ;;
    --git-dir|--work-tree|--namespace|--exec-path|--super-prefix) VANTAR=x ;;
    -*) ;;
    *) SUB="$a"; SUBI=$i; break ;;
  esac
done
g() { if [ -n "$CDIR" ]; then "$REAL" -C "$CDIR" "$@"; else "$REAL" "$@"; fi; }
if [ "$SUB" = push ]; then
  # första icke-flaggan efter `push` är målet (fjärrnamn eller URL); saknas det gäller upstream
  MAL=""; j=0; VANTAR=""
  for a in "$@"; do
    j=$((j+1)); [ "$j" -le "$SUBI" ] && continue
    if [ -n "$VANTAR" ]; then VANTAR=""; continue; fi
    case "$a" in -o|--push-option|--receive-pack|--exec|--repo) VANTAR=x ;; -*) ;; *) MAL="$a"; break ;; esac
  done
  if [ -z "$MAL" ]; then
    UPP="$(g rev-parse --abbrev-ref --symbolic-full-name '@{push}' 2>/dev/null)"; MAL="${UPP%%/*}"
    [ -n "$MAL" ] || MAL="$(g config --get remote.pushDefault 2>/dev/null)"; [ -n "$MAL" ] || MAL=origin
  fi
  URL="$(g remote get-url --push "$MAL" 2>/dev/null)"; [ -n "$URL" ] || URL="$MAL"
  LOKAL=0
  case "$URL" in
    /*|./*|../*|file://*) LOKAL=1 ;;
    *://*) ;;
    *) case "${URL%%/*}" in *:*) ;; *) [ -d "$URL" ] && LOKAL=1 ;; esac ;;
  esac
  [ "$LOKAL" = 1 ] || { echo "git push till nätet är avstängt för granskaren (publicera.sh spärr b): $MAL → $URL" >&2; exit 77; }
fi
GIT_SSH_COMMAND=false GIT_TERMINAL_PROMPT=0 GIT_ASKPASS=/usr/bin/false SSH_ASKPASS=/usr/bin/false \
  exec "$REAL" -c credential.helper= -c core.askPass=/usr/bin/false -c core.sshCommand=false "$@"
SKAL
  # Bash-vakten (spärr a'): PreToolUse-hook som ser hela kommandosträngen. JSON på stdin.
  printf '#!/bin/sh\nexec /usr/bin/python3 "%s/vakt-bash.py"\n' "$D" > "$D/vakt-bash.sh"
  cat > "$D/vakt-bash.py" <<'VAKT'
import json, sys, re
try: d = json.load(sys.stdin)
except Exception: sys.exit(0)
if d.get("tool_name") != "Bash": sys.exit(0)
cmd = (d.get("tool_input") or {}).get("command") or ""
def neka(skal):
    print("NEKAD av publicera.sh:s granskarvakt (spärr a'): " + skal, file=sys.stderr); sys.exit(2)
if re.search(r'\bPATH=|\bGIT_[A-Z_]+=|\bGH_[A-Z_]+=|\bHOME=', cmd): neka("miljö-/PATH-manipulation i kommandosträngen")
if re.search(r'(^|/)\.\.(/|$)', cmd): neka("traversering med ..")
SKRIVANDE = {'push','send-pack','http-push','remote','config','worktree','branch','switch','checkout','commit','reset','stash','merge','rebase','am','apply','cherry-pick','revert','tag','submodule','filter-branch','gc','prune','update-ref','symbolic-ref','pull','clean','rm','mv','notes','replace','reflog'}
BINARER = {'git','gh','ssh','scp','sftp','curl','wget','rsync','bash','sh','zsh','python3','python','perl','node','ruby','env','sudo','nc','openssl'}
for seg in re.split(r'\|\||&&|;|\||\n|\(|\)|`|\$\(', cmd):
    seg = seg.strip()
    if not seg: continue
    tok = seg.split()
    w = tok[0]
    if re.match(r'^[A-Za-z_][A-Za-z0-9_]*=', w): neka("variabeltilldelning före kommandot: " + seg[:60])
    base = w.rsplit('/', 1)[-1]
    if '/' in w and base in BINARER: neka("sökväg till " + base + " i stället för PATH-uppslag")
    if base in ('env','export','eval','exec','sudo','xargs','nohup','setsid','ssh','scp','sftp','curl','wget','rsync','nc','openssl','osascript','security'): neka(base + " är avstängt för granskaren")
    if base in ('bash','sh','zsh') and any(t in ('-c','-s','-i') for t in tok[1:]): neka(base + " -c/-s/-i")
    if base in ('python3','python','perl','node','ruby') and any(t in ('-c','-e','-') for t in tok[1:]): neka(base + " -c/-e")
    if base == 'gh': neka("gh")
    if base == 'git':
        for t in tok[1:]:
            if t in ('-c','-C','--config-env') or t.startswith(('-c','--config-env=','--git-dir','--work-tree','--exec-path')): neka("git " + t)
            if t in SKRIVANDE: neka("git " + t)
sys.exit(0)
VAKT
  chmod +x "$D/gh" "$D/ssh" "$D/git" "$D/vakt-bash.sh"
}
if [ -n "$SKRIV_SKAL" ]; then skriv_skal "$SKRIV_SKAL"; echo "skal skrivna i $SKRIV_SKAL"; exit 0; fi
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
    g fetch -q origin main 2>/dev/null || true; BAS_SHA="$(g rev-parse origin/main)"
    BOT="${NORTROPIC_CI_GRANSKARE:-}"
    [ -n "$BOT" ] || stopp "--granskare ci: granskningsjobbet är inte påslaget — sätt NORTROPIC_CI_GRANSKARE=<jobbets konto> när det finns"
    # Bara DOM-rader för exakt denna HEAD räknas (en äldre review binder inte kandidaten), och
    # varje FYND-rad vinner över en senare TILLSTYRKS (samma felklass som N4b, fynd 2 i
    # mekanismens fjärde granskning av sig själv).
    RADER="$($GH api "repos/$REPO/pulls/$PRNR/reviews" --jq ".[] | select(.user.login == \"$BOT\") | .body" 2>/dev/null | grep -E "^DOM: (TILLSTYRKS|FYND) @$HEAD_SHA( |\$)" || true)"
    if printf '%s\n' "$RADER" | grep -q '^DOM: FYND'; then DOM="$(printf '%s\n' "$RADER" | grep '^DOM: FYND' | head -1)"
    else DOM="$(printf '%s\n' "$RADER" | grep '^DOM: TILLSTYRKS' | tail -1)"; fi
    [ -n "$DOM" ] || odombart "ingen DOM-rad för $HEAD_SHA från $BOT i PR #$PRNR:s reviews"
    ;;
  claude)
    [ -f "$ROT/.agents/skills/nortropic-reviewer/SKILL.md" ] || stopp "granskarrollen saknas i repot"
    PROMPT="Du är nortropic-reviewer: OBEROENDE och READ-ONLY. Du har inte skrivit denna kod. Läs och följ ordagrant .agents/skills/nortropic-reviewer/SKILL.md och .agents/skills/nortropic-reviewer/PR-TILLAGG.md. Granska HELA intervallet origin/main..HEAD (kommando: git diff origin/main...HEAD; git log --oneline origin/main..HEAD) i detta repo. Ändra ingenting i arbetsträdet, committa inget. Mutationer och experiment gör du i KOPIOR under mktemp; harnessarna tar kandidaten som FÖRSTA ARGUMENT (bash tests/scripts/publicera/fall.sh <kopia>) — miljöprefix som PUBLICERA=… nekas för dig. GitHub-läget (PR, checks, reviews) kontrolleras av mekanismen efter dig — gh och push är avstängda för dig. Verifiera varje misstanke mekaniskt innan du rapporterar. Skriv fynden numrerade, allvarligast först, med fil:rad, kommando, observerat, verdikt (BLOCKERANDE/ADVISORY/OK) och minsta åtgärd. AVSLUTA med exakt en rad på formen 'DOM: TILLSTYRKS @$HEAD_SHA' eller 'DOM: FYND @$HEAD_SHA — blockerande: #n, #m'. SHA:t måste vara exakt $HEAD_SHA."
    [ "$TORR" = 1 ] && { echo "torr: skulle starta granskare för ${HEAD_SHA:0:12}"; exit 0; }
    # Ren process: inga ärvda sessionsvariabler, inga skrivverktyg, cwd = repot. Prompten går
    # på STDIN: --allowedTools/--disallowedTools är variadiska och svalde annars prompten som
    # ett verktygsnamn (mekanismens andra körning mot sig själv, 2026-09-17 12:59).
    # Granskaren får inte kandidatens hookar (.claude/settings.json → autocommit av kandidatkod:
    # --setting-sources user) och har en väggklocka (macOS saknar timeout; perl alarm finns).
    # Spärrarna (a)(a')(b)(c) ur huvudet: verktygsnekande, Bash-vakt, PATH-skal, GH_CONFIG_DIR.
    g fetch -q origin main 2>/dev/null || true   # granskningen gäller intervallet mot DAGENS main
    BAS_SHA="$(g rev-parse origin/main)"
    SPARR="$(mktemp -d "${TMPDIR:-/tmp}/publicera-sparr.XXXXXX")"; skriv_skal "$SPARR"
    GHBIN="$(command -v gh 2>/dev/null || echo /opt/homebrew/bin/gh)"; GITBIN="$(command -v git)"
    # ALLA sessionsvariabler (CLAUDECODE, CLAUDE_CODE_*) — listan varierar mellan versioner.
    AVSKALA="-u CLAUDECODE -u SSH_AUTH_SOCK -u GH_TOKEN -u GITHUB_TOKEN -u GIT_SSH -u GIT_ASKPASS"
    for v in $(env | sed -nE 's/^(CLAUDE_CODE_[A-Za-z0-9_]*)=.*/\1/p'); do AVSKALA="$AVSKALA -u $v"; done
    printf '%s' "$PROMPT" | ( cd "$ROT" && env $AVSKALA PATH="$SPARR:$PATH" GH_CONFIG_DIR="$SPARR/gh-tom" \
        perl -e 'alarm shift; exec @ARGV' "${NORTROPIC_GRANSKARE_TID:-3600}" \
        "$CLAUDE" -p --max-turns 60 --output-format text --setting-sources user \
        --settings "{\"env\":{\"GH_CONFIG_DIR\":\"$SPARR/gh-tom\"},\"hooks\":{\"PreToolUse\":[{\"matcher\":\"Bash\",\"hooks\":[{\"type\":\"command\",\"command\":\"/bin/sh $SPARR/vakt-bash.sh\",\"timeout\":15}]}]}}" \
        --disallowedTools "Edit,Write,NotebookEdit,Bash(gh:*),Bash($GHBIN:*),Bash(git push:*),Bash(git -C:*),Bash(git -c:*),Bash(git send-pack:*),Bash(git http-push:*),Bash($GITBIN:*),Bash(/usr/bin/git:*),Bash(git commit:*),Bash(git checkout:*),Bash(git switch:*),Bash(git branch:*),Bash(git worktree:*),Bash(git remote:*),Bash(git config:*),Bash(git reset:*),Bash(git stash:*),Bash(git merge:*),Bash(git rebase:*),Bash(env:*),Bash(export:*),Bash(eval:*),Bash(bash -c:*),Bash(sh -c:*),Bash(python3 -c:*),Bash(perl -e:*),Bash(node -e:*)" \
        --allowedTools "Read,Grep,Glob,Bash(git diff:*),Bash(git log:*),Bash(git show:*),Bash(git ls-files:*),Bash(git ls-tree:*),Bash(git rev-parse:*),Bash(git status:*),Bash(git check-ignore:*),Bash(git cat-file:*),Bash(node scripts/:*),Bash(bash tests/:*),Bash(shasum:*),Bash(wc:*),Bash(sed -n:*),Bash(cat:*),Bash(ls:*),Bash(diff:*),Bash(mktemp:*),Bash(cp:*)" \
        ) > "$RAPPORT" 2> "$RAPPORT.stderr"
    RC=$?; rm -rf "$SPARR"
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
# Checks: väntande (tom conclusion / PENDING / QUEUED / IN_PROGRESS) pollas — CI tar minuter,
# granskningen tog redan längre. INGA checks alls är också ett väntläge (fönstret mellan push
# och check-run) och blir stopp när tiden är ute: tomt är aldrig grönt (mekanismens fjärde
# granskning av sig själv, fynd 3).
las_checks() { $GH pr view "$PRNR" --repo "$REPO" --json statusCheckRollup --jq '.statusCheckRollup[] | "\(.name // .context // "?")\t\(.conclusion // .state // "?")"' 2>/dev/null; }
VANTAN="${NORTROPIC_CHECK_VANTAN:-900}"; INTERVALL="${NORTROPIC_CHECK_INTERVALL:-30}"; VANTAT=0
while :; do
  CHECKS="$(las_checks)" || stopp "kunde inte läsa PR:ens checks (gh-fel) — ett fel är inte 'ingen CI'"
  VANTANDE="$(printf '%s\n' "$CHECKS" | awk -F'\t' 'NF && ($2=="" || $2=="?" || tolower($2)=="pending" || tolower($2)=="queued" || tolower($2)=="in_progress" || tolower($2)=="expected") {print $1}')"
  [ -n "$CHECKS" ] && [ -z "$VANTANDE" ] && break
  [ "$VANTAT" -lt "$VANTAN" ] || break
  echo "  väntar på checks ($VANTAT/$VANTAN s): ${VANTANDE:-inga rapporterade ännu}" | tr '\n' ' '; echo
  sleep "$INTERVALL"; VANTAT=$((VANTAT + (INTERVALL>0 ? INTERVALL : 1)))   # räknaren stiger alltid (proven kör med intervall 0)
done
[ -n "$CHECKS" ] || stopp "inga checks rapporterade för PR #$PRNR efter $VANTAT s — tomt är inte grönt (CI ej startad, eller ett repo utan CI: då gäller serverns skydd, inte denna spak)"
RODA="$(printf '%s\n' "$CHECKS" | awk -F'\t' 'tolower($2)!="success" && tolower($2)!="skipped" && tolower($2)!="neutral" {print $1" = "$2}')"
if [ -n "$RODA" ]; then
  if [ -n "$ODOK" ]; then
    NAMN="${ODOK%%:*}"; SKAL="${ODOK#*:}"
    [ -n "$NAMN" ] && [ "$NAMN" != "$ODOK" ] && [ -n "$(printf '%s' "$SKAL" | tr -d ' ')" ] || stopp "--odombart-ok kräver formen '<exakt checknamn>: <skäl>'"
    KVAR="$(printf '%s\n' "$RODA" | awk -F' = ' -v n="$NAMN" '$1 != n' || true)"
    [ -z "$KVAR" ] || stopp "checks som inte är gröna:"$'\n'"$KVAR"
    # Skälet ska överleva drivarens stdout: PR-kommentar + KVITTO-raden (fynd 6).
    $GH pr comment "$PRNR" --repo "$REPO" --body "ODÖMBART accepterat uttryckligen av kedjedrivaren för kandidat $HEAD_SHA: $ODOK" >/dev/null 2>&1 || stopp "kunde inte bokföra --odombart-ok-skälet som PR-kommentar — ingen merge utan bokfört skäl"
    echo "  ODÖMBART accepterat uttryckligen (bokfört på PR:en): $ODOK"
  else
    stopp "checks som inte är gröna (röd kan vara ODÖMBART — säg det i så fall med --odombart-ok '<namn>: <skäl>'):"$'\n'"$RODA"
  fi
fi
echo "5 checks:    $(printf '%s\n' "$CHECKS" | wc -l | tr -d ' ') st, inga röda utan skäl"
$GH pr merge "$PRNR" --repo "$REPO" --merge --match-head-commit "$HEAD_SHA" >/dev/null 2>"$RAPPORT.merge.stderr" \
  || stopp "merge nekades: $(head -3 "$RAPPORT.merge.stderr" | tr '\n' ' ')"

# ── 6. kvitto ───────────────────────────────────────────────────────────────
g fetch -q origin main
MERGE_SHA="$(g rev-parse origin/main)"
P2="$(g rev-parse -q --verify "origin/main^2" 2>/dev/null || echo '')"
[ "$P2" = "$HEAD_SHA" ] || stopp "origin/main ($MERGE_SHA) har inte HEAD som andra förälder — kontrollera för hand innan något upprepas"
echo "6 mergad:    PR #$PRNR · granskat ${HEAD_SHA:0:12} · merge ${MERGE_SHA:0:12} · rapport $RAPPORT"
printf 'KVITTO\tPR=%s\tGRANSKAT=%s\tBAS=%s\tMERGE=%s\tODOMBART_OK=%s\tDOM=%s\n' "$PRNR" "$HEAD_SHA" "${BAS_SHA:-}" "$MERGE_SHA" "${ODOK:--}" "$DOM"
exit 0
