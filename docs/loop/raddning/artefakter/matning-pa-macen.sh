#!/usr/bin/env bash
# matning-pa-macen.sh — DIAGNOSTIK. Committar inget, pushar inget; grindarna själva skriver i
# worktrees de skapar, och restkontrollen nedan mäter om något blev kvar.
#
# KVALIFICERING vs DIAGNOSTIK (AUD-10, 2026-09-17). En grind som står i
# controller/verify/register.json körs genom controller/verify/cli (hash-bunden = kvalificerad
# körning, "·kval"). En grind som är fryst men OREGISTRERAD körs direkt med bash och märks
# "·diag": den säger vad grinden gör, men är aldrig en kvalificerad dom. Varje grinds fulla
# utdata sparas i en fil; skärmen visar de sista 40 raderna. Restkontrollen jämför SÖKVÄGAR
# och INNEHÅLL (sorterad status inkl. ignorerat + HEAD), inte antal rader. Exitkod:
# 1 = minst en grind FAIL/KRASCH/VÄGRAN/INTEGRITET eller trädet smutsat · 2 = worktree,
# fel plattform, någon ODÖMBART, eller minst en grind bara diagnostiskt körd · 0 = alla
# slutningens grindar kvalificerat PASS och trädet orört.
#
# Syfte: fälla den dom som ingen maskin utom Macen kan fälla — är h-015:s
# beroendeslutning faktiskt grön? Hela vägen till KERNEL_COMPLETE vilar på att
# h-004, h-010, h-013 och h-016 är KLARA, och det påståendet har aldrig prövats
# genom att KÖRA grindarna på rätt plattform.
#
# Kör från reporoten i nortropic-system:
#     bash matning-pa-macen.sh
#
# Ingen sudo (regel 5). Inget GNU `timeout` (finns inte på macOS — det misstaget
# gav en gång en falsk "död interpretator"-diagnos). Avbryt med Ctrl-C om något
# hänger; loggen bevaras ändå.

set -u
ROT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "inte ett git-repo"; exit 2; }
LOGGKAT="${NORTROPIC_LOGG_KAT:-$HOME/.nortropic/matningar}/$(date +%Y%m%d-%H%M%S)"; mkdir -p "$LOGGKAT"
LOGG="$LOGGKAT/matning.txt"
exec > >(tee "$LOGG") 2>&1
GL_TMP="$(mktemp -d "${TMPDIR:-/tmp}/grindlage-run.XXXXXX")"; trap 'rm -rf "$GL_TMP"' EXIT; export GL_TMP
GL_ROT="$ROT"; . "$ROT/docs/loop/raddning/artefakter/_grindlage.sh"
AGG_NEJ=0; AGG_OD=0

echo "=== NORTROPIC — MÄTNING PÅ MACEN ==="
echo "datum:    $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "repo:     $(git rev-parse --show-toplevel 2>/dev/null || echo 'INTE ETT GIT-REPO — avbryt')"
echo "HEAD:     $(git rev-parse --short HEAD 2>/dev/null)  gren: $(git branch --show-current 2>/dev/null)"
echo "maskin:   $(uname -s) $(uname -m)"
echo "python3:  $(python3 --version 2>&1)"
echo "py3.12:   $(python3.12 --version 2>&1 || echo 'saknas')"
echo

# ── 0a. SPÄRR: aldrig i en git-worktree ──────────────────────────────────────
# Lärt 2026-09-16 av att ha gjort det. Grindarna skapar SJÄLVA git-worktrees
# (h-005 K3: "workspace är ett eget git-worktree med egen git-dir"). Körs de
# inuti en worktree är `.git` en FIL och inte en katalog, och nästlingen gav
# sju röda grindar vars felrader alla pekade på cwd, workspace och kuvert:
#   h-009 K8  processen kördes i worktreeroten, inte i workspacet
#   h-012 K15 kandidaten bar HEAD-commitens filer, inte sessionens
#   h-005 K7  worktree-rester efter SIGINT
# Provet får aldrig kunna producera det resultatet tyst igen. En mätning som
# mäter sin egen rigg är värre än ingen mätning.
if [ -f .git ]; then
  echo "❌ AVBRYTER: detta är en git-WORKTREE (.git är en fil, inte en katalog)."
  echo "   Grindarna skapar egna worktrees. Nästlade worktrees ger falska röda"
  echo "   grindar på cwd, workspace och kuvertleverans — mätt 2026-09-16."
  echo "   Kör i en RIKTIG klon:"
  echo "     git clone --branch <gren> git@github.com:Nortropic/nortropic-system.git <katalog>"
  exit 2   # ODÖMBART — aldrig FAIL. Riggen mätte, inte kandidaten.
fi

# ── 0b. Arbetsträdet före: grindarna ska inte smutsa ner det ─────────────────
FORE="$(git status --porcelain | wc -l | tr -d ' ')"
# Innehållsjämförelse (AUD-10): sorterad status med ignorerat + HEAD före/efter. Lika ANTAL
# rader bevisade inte orört träd — en borttagen och en tillkommen fil gav "OK orört".
git status --porcelain --ignored=matching -uall 2>/dev/null | sort > "$LOGGKAT/trad-fore.txt"
HEAD_FORE="$(git rev-parse HEAD)"
# IGNORERADE FILER RÄKNAS SEPARAT. `git status --porcelain` ser dem inte, och
# .gitignore rad 3 är `/*` — en vitlista, så nästan allt är ignorerat. Mätt
# 2026-09-16: efter kvällens körningar bar ägarens kontrollklon 1149
# .nortropic-h036-proof-*-trust-*-source-filer i reporoten plus 30 evidensposter
# under controller/policy/ — och detta prov skrev "OK, grindarna lämnade trädet
# orört". Kontrollen var blind för det den skulle mäta (FYND 38/39).
FORE_IG="$(git status --porcelain --ignored=matching | grep -c "^!!")"
echo "okommitterade filer FÖRE: $FORE  ·  ignorerade FÖRE: $FORE_IG"
echo

# ── 1. Kärnans verifierare ───────────────────────────────────────────────────
echo "=== 1. controller/verify/cli ==="
python3.12 controller/verify/cli list; echo "exit=$?"
echo

# ── 2. Beroendeslutningen för h-015 — DEN AVGÖRANDE MÄTNINGEN ────────────────
# Verdiktalgebra: 0=PASS  1=FAIL  2=ODÖMBART  3=verifierarvägran  4=integritetsfel
echo "=== 2. h-015:s beroendeslutning, 14 grindar ==="
echo "(0=PASS  1=FAIL  2=ODÖMBART  3=vägran  4=integritetsfel)"
echo
# LINUX-BASLINJEN, mätt 2026-09-16 i byggmiljön. Kolumnen finns för att göra
# DELTAT läsbart: en grind som är röd i Linux och grön här är plattformsbunden
# och alltså frisk; en som är röd på BÅDA är ett verkligt fel i kandidaten.
BAS="001:0 002:0 003:1 004:1 005:0 006:0 007:0 008:0 009:2 010:1 011:1 012:2 013:1 016:1"
basvarde() { for p in $BAS; do case "$p" in "$1:"*) echo "${p#*:}"; return;; esac; done; echo "-"; }

PASS=0; FAIL=0; ANNAT=0; DIAG=0; RESULTAT=""; VANDA=0; KVAR=0; N=0; SPECFEL=0
# Slutningen läses ur specen (depends_on från h-015), aldrig en hårdkodad lista: h-017 och
# h-027–h-030 kommer med den dag h-030 finns. Ett saknat id är ett fynd, inte en tystnad.
SLUTNING="$(gl_slutning h-015)"
# Hook-vakt (L1c): grindarna skapar worktrees och committar i denna klon; utan vakterna i
# hooken pushas fixturgrenar. Samma spärr som helhetsbilden.sh — stoppa före första grinden.
HP="$(git config --get core.hooksPath 2>/dev/null || true)"
if [ -n "$HP" ] && [ -f "${HP/#\~/$HOME}/post-commit" ] && ! cmp -s .githooks/post-commit "${HP/#\~/$HOME}/post-commit"; then
  echo "STOPP: hooken i $HP är inte repots (.githooks/post-commit) — grindkörning skulle pusha fixturcommits. Kör: bash scripts/installera-hooks.sh --kor" >&2; exit 2
fi
printf "%-6s %-8s %-22s %-7s %s\n" TASK MACEN VERDIKT LINUX KOMMENTAR
for id in $SLUTNING; do
  case "$id" in FEL:spec) SPECFEL=1; continue;; esac
  case "$id" in SAKNAS:*) printf "%-6s %-8s %-22s %-7s %s\n" "${id#SAKNAS:}" "-" "EJ_SPECAD" "-" "⚠️ saknas i specen — slutningen är inte hel"; ANNAT=$((ANNAT+1)); AGG_NEJ=$((AGG_NEJ+1)); RESULTAT="$RESULTAT ${id#SAKNAS:}:EJ_SPECAD"; continue;; esac
  N=$((N+1)); h="${id#h-}"
  grindlage "$id" 1 1 "$LOGGKAT/$id.txt" >/dev/null
  K="$GL_KOD"; V="$GL_TOKEN"
  case "$V" in PASS) VF="PASS·kval"; PASS=$((PASS+1)) ;;
    PASS·diag) VF="PASS·diag"; DIAG=$((DIAG+1)); AGG_OD=$((AGG_OD+1)) ;;
    FAIL|FAIL·diag) VF="$V"; FAIL=$((FAIL+1)); AGG_NEJ=$((AGG_NEJ+1)) ;;
    *) VF="$V"; ANNAT=$((ANNAT+1)); case "$(gl_klass "$V")" in nej) AGG_NEJ=$((AGG_NEJ+1));; *) AGG_OD=$((AGG_OD+1));; esac ;;
  esac
  B="$(basvarde "$h")"
  if [ "$B" = "-" ]; then KOM="ingen Linux-baslinje (ny i slutningen)"
  elif [ "$B" != "0" ] && [ "$K" = "0" ]; then KOM="plattformsbunden — frisk"; VANDA=$((VANDA+1))
  elif [ "$B" != "0" ] && [ "$K" != "0" ] && [ "$K" != "-" ]; then KOM="⚠️ RÖD ÄVEN HÄR — verkligt fel"; KVAR=$((KVAR+1))
  elif [ "$B" = "0" ] && [ "$K" != "0" ] && [ "$K" != "-" ]; then KOM="⚠️ GRÖN I LINUX MEN RÖD HÄR — oväntat"
  else KOM=""; fi
  case "$V" in *diag) KOM="$KOM (direkt bash — DIAGNOSTIK, ej kvalificering: grinden är inte registrerad)";; esac
  printf "%-6s exit=%-3s %-22s linux=%-2s %s\n" "$id" "$K" "$VF" "$B" "$KOM"
  RESULTAT="$RESULTAT $id:$V($K)"
  # Full utdata sparas ALLTID i $LOGGKAT/<id>.txt; skärmen visar de sista 40 raderna av det röda.
  if [ "$K" != "0" ] && [ -s "$LOGGKAT/$id.txt" ]; then
    echo "----- $id sista 40 rader (full: $LOGGKAT/$id.txt) -----"
    tail -40 "$LOGGKAT/$id.txt"
    echo "----- slut $id -----"
  fi
done
echo
# Tom eller oläsbar slutning är NEJ, aldrig "0 av 0 = allt grönt" (mekanismens granskning 2026-09-17).
if [ "$SPECFEL" = 1 ]; then echo "NEJ: specs/tasks.spec.json kan inte läsas — ingen slutning, ingen mätning"; AGG_NEJ=$((AGG_NEJ+1)); fi
if [ "$N" = 0 ] && [ "$SPECFEL" = 0 ]; then echo "NEJ: tom slutning — h-015 saknar depends_on eller finns inte i specen"; AGG_NEJ=$((AGG_NEJ+1)); fi
echo "SUMMA: $PASS PASS·kval · $DIAG PASS·diag · $FAIL FAIL · $ANNAT ODÖMBART/annat   av $N (slutning ur specen)"
# Mätraden i den form redo-for-codex.sh binder: revisionen direkt ovanför, ett blanksteg efter RAD:
echo "mätrevision: \`$(git rev-parse HEAD 2>/dev/null)\`"
echo "RAD: $(printf '%s' "$RESULTAT" | sed 's/^ *//')"
echo "DELTA mot Linux-baslinjen: $VANDA vände till grönt (plattformsbundna, friska)"
echo "                           $KVAR röda på BÅDA maskinerna (verkliga fel)"
echo
echo "⭐ DOMEN OM KARTAN: vägen till KERNEL_COMPLETE förutsätter att h-004, h-010,"
echo "   h-013 och h-016 är KLARA. Är någon av dem inte PASS ovan är kartan fel,"
echo "   och det ska stå i docs/loop/drift.md innan Codex börjar."
for h in 004 010 013 016; do
  case " $RESULTAT " in *" h-$h:PASS(0) "*) echo "   h-$h: PASS·kval — kartan håller" ;;
                        *" h-$h:PASS·diag(0) "*) echo "   h-$h: PASS·diag — grön direkt, men OREGISTRERAD: ingen kvalificerad dom" ;;
                        *) echo "   h-$h: ⚠️ INTE PASS — kartan håller INTE" ;; esac
done
echo

# ── 3. Saknade grindar på vägen ──────────────────────────────────────────────
echo "=== 3. Vad som saknas på vägen till KERNEL_COMPLETE ==="
for id in h-014 h-015 @verify/bin/autonomous-loop-exit; do
  grindlage "$id" 0 0 >/dev/null; printf "%-24s %s — %s\n" "$GL_ID" "$GL_TOKEN" "$GL_DETALJ"
done
f=docs/loop/autonomy-kernel-v1-acceptance.md
if git ls-files --error-unmatch "$f" >/dev/null 2>&1 && [ -s "$f" ]; then echo "FINNS (spårad, icke-tom)  $f"; else echo "SAKNAS  $f"; fi
echo

# ── 4. Lokalt maskintillstånd — regel 12 ─────────────────────────────────────
echo "=== 4. Regel 12: finns det lokalt, finns det på git ==="
echo "--- okommitterat ---"; git status --short | head -20
echo "--- opushade grenar ---"
git for-each-ref --format='%(refname:short) %(upstream:track)' refs/heads \
  | grep -v '\[gone\]' | grep -E 'ahead|^\S+ $' | head -20
echo "--- lokala grenar utan uppström ---"
git for-each-ref --format='%(refname:short)|%(upstream)' refs/heads \
  | awk -F'|' '$2==""{print $1}' | head -20
echo

# ── 5. Separationens dokumentation, om den finns lokalt ──────────────────────
echo "=== 5. SEPARATION-20260910 ==="
[ -d SEPARATION-20260910 ] && ls SEPARATION-20260910 || echo "(inte i detta arbetsträd — ligger på plattformsgrenen)"
echo

# ── 6. Arbetsträdet efter: grindarna ska ha lämnat det orört ─────────────────
EFTER="$(git status --porcelain | wc -l | tr -d ' ')"
EFTER_IG="$(git status --porcelain --ignored=matching | grep -c "^!!")"
git status --porcelain --ignored=matching -uall 2>/dev/null | sort > "$LOGGKAT/trad-efter.txt"
HEAD_EFTER="$(git rev-parse HEAD)"
echo "=== 6. Arbetsträdet ==="
echo "okommitterade  FÖRE=$FORE EFTER=$EFTER"
echo "ignorerade     FÖRE=$FORE_IG EFTER=$EFTER_IG   (delta: $((EFTER_IG - FORE_IG)))"
TRAD_DIFF="$(diff "$LOGGKAT/trad-fore.txt" "$LOGGKAT/trad-efter.txt" 2>/dev/null)"
if [ -z "$TRAD_DIFF" ] && [ "$HEAD_FORE" = "$HEAD_EFTER" ]; then
  echo "OK — trädet orört: samma sökvägar och status (inkl. ignorerat), samma HEAD"
else
  echo "⚠️ GRINDARNA SMUTSADE NER TRÄDET — sökvägar/status skiljer (lika antal räcker inte):"
  printf '%s\n' "$TRAD_DIFF" | head -40
  [ "$HEAD_FORE" = "$HEAD_EFTER" ] || echo "   HEAD ändrades: $HEAD_FORE → $HEAD_EFTER"
  AGG_NEJ=$((AGG_NEJ+1))
fi
echo
echo "=== KLART ==="
echo "Full logg: $LOGG  ·  per grind: $LOGGKAT/<id>.txt"
echo "Klistra tillbaka allt från '=== NORTROPIC' och ned."
# Aggregerad exitkod (AUD-10): 1 = något rött eller trädet smutsat · 2 = något ODÖMBART/diag · 0 = allt kvalificerat PASS
[ "$(uname -s)" = "Darwin" ] || AGG_OD=$((AGG_OD+1))
[ "$AGG_NEJ" -gt 0 ] && exit 1
[ "$AGG_OD" -gt 0 ] && exit 2
exit 0
