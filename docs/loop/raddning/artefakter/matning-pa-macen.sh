#!/usr/bin/env bash
# matning-pa-macen.sh — LÄSER BARA. Ändrar ingenting, committar ingenting, pushar inget.
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
LOGG="/tmp/nortropic-matning-$(date +%Y%m%d-%H%M%S).txt"
exec > >(tee "$LOGG") 2>&1

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

PASS=0; FAIL=0; ANNAT=0; RESULTAT=""; VANDA=0; KVAR=0
printf "%-6s %-6s %-11s %-7s %s\n" TASK MACEN VERDIKT LINUX KOMMENTAR
for h in 001 002 003 004 005 006 007 008 009 010 011 012 013 016; do
  G="verify/bin/h-$h-exit"
  if [ ! -f "$G" ]; then
    printf "h-%s  %-14s %s\n" "$h" "GRIND SAKNAS" "$G"; ANNAT=$((ANNAT+1)); continue
  fi
  UT="$(bash "$G" 2>&1)"; K=$?
  case $K in
    0) V="PASS";      PASS=$((PASS+1)) ;;
    1) V="FAIL";      FAIL=$((FAIL+1)) ;;
    2) V="ODÖMBART";  ANNAT=$((ANNAT+1)) ;;
    3) V="VÄGRAN";    ANNAT=$((ANNAT+1)) ;;
    4) V="INTEGRITET";ANNAT=$((ANNAT+1)) ;;
    *) V="OVÄNTAD($K)";ANNAT=$((ANNAT+1)) ;;
  esac
  B="$(basvarde "$h")"
  if [ "$B" != "0" ] && [ "$K" = "0" ]; then KOM="plattformsbunden — frisk"; VANDA=$((VANDA+1))
  elif [ "$B" != "0" ] && [ "$K" != "0" ]; then KOM="⚠️ RÖD ÄVEN HÄR — verkligt fel"; KVAR=$((KVAR+1))
  elif [ "$B" = "0" ] && [ "$K" != "0" ]; then KOM="⚠️ GRÖN I LINUX MEN RÖD HÄR — oväntat"
  else KOM=""; fi
  printf "h-%-4s exit=%-2s %-11s linux=%-2s %s\n" "$h" "$K" "$V" "$B" "$KOM"
  RESULTAT="$RESULTAT h-$h:$K"
  # Full utdata för allt som inte är grönt — det är där svaret ligger
  if [ "$K" != "0" ]; then
    echo "----- h-$h full utdata -----"
    printf '%s\n' "$UT" | tail -40
    echo "----- slut h-$h -----"
  fi
done
echo
echo "SUMMA: $PASS PASS · $FAIL FAIL · $ANNAT ODÖMBART/annat   av 14"
echo "RAD:  $RESULTAT"
echo "DELTA mot Linux-baslinjen: $VANDA vände till grönt (plattformsbundna, friska)"
echo "                           $KVAR röda på BÅDA maskinerna (verkliga fel)"
echo
echo "⭐ DOMEN OM KARTAN: vägen till KERNEL_COMPLETE förutsätter att h-004, h-010,"
echo "   h-013 och h-016 är KLARA. Är någon av dem inte PASS ovan är kartan fel,"
echo "   och det ska stå i docs/loop/drift.md innan Codex börjar."
for h in 004 010 013 016; do
  case " $RESULTAT " in *" h-$h:0 "*) echo "   h-$h: PASS — kartan håller" ;;
                        *) echo "   h-$h: ⚠️ INTE PASS — kartan håller INTE" ;; esac
done
echo

# ── 3. Saknade grindar på vägen ──────────────────────────────────────────────
echo "=== 3. Vad som saknas på vägen till KERNEL_COMPLETE ==="
for f in verify/bin/h-014-exit verify/bin/h-015-exit verify/bin/autonomous-loop-exit \
         docs/loop/autonomy-kernel-v1-acceptance.md; do
  [ -e "$f" ] && echo "FINNS   $f" || echo "SAKNAS  $f"
done
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
echo "=== 6. Arbetsträdet ==="
echo "okommitterade  FÖRE=$FORE EFTER=$EFTER"
echo "ignorerade     FÖRE=$FORE_IG EFTER=$EFTER_IG   (delta: $((EFTER_IG - FORE_IG)))"
if [ "$FORE" = "$EFTER" ] && [ "$FORE_IG" = "$EFTER_IG" ]; then
  echo "OK — grindarna lämnade trädet orört, ignorerade filer inräknade"
elif [ "$FORE" != "$EFTER" ]; then
  echo "⚠️ GRINDARNA SMUTSADE NER TRÄDET (spårat/otrackat) — det är ett fynd i sig"
else
  echo "⚠️ GRINDARNA LÄMNADE $((EFTER_IG - FORE_IG)) IGNORERADE FILER EFTER SIG."
  echo "   De syns inte i 'git status' och säkras inte av radda/smuts-*."
  echo "   Se dem: git status --porcelain --ignored=matching | grep '\''^!!'\'' | head"
fi
echo
echo "=== KLART ==="
echo "Full logg: $LOGG"
echo "Klistra tillbaka allt från '=== NORTROPIC' och ned."
