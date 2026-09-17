#!/usr/bin/env bash
# redo-for-codex.sh — ETT MEKANISKT SVAR PÅ "är vi redo för Codex?"
#
#     bash docs/loop/raddning/artefakter/redo-for-codex.sh
#
# exit 0 = REDO · exit 1 = inte redo, raderna säger varför · exit 2 = kunde inte mätas
#
# ── VARFÖR DEN FINNS ────────────────────────────────────────────────────────
# Ägaren 2026-09-16: "Jag tror det här är 20:onde gången jag frågar om vi är redo
# för codex, ber dig kolla noggrant om vi är det och så är vi inte det, hur är det
# möjligt?"
#
# Svaret är obekvämt och strukturellt: FRÅGAN HADE INGEN DEFINITION. Tjugo gånger
# ställdes en fråga vars svar var en bedömning, och en bedömning kan alltid visa
# sig vara för generös när någon tittar närmare. Ingen av gångerna fanns ett
# kriterium som kunde FÄLLA svaret.
#
# Det är exakt samma felklass som gav fyra task etiketten KLAR för att grindfilen
# fanns. En etikett utan prov är inte ett läge, det är en förhoppning.
#
# Och en andra orsak, mätt samma dag: ATT RÄTTA INFÖR NYA FEL. VAGEN.md skrevs
# för att avskaffa fem konkurrerande ordningar — och skapade inom en timme en
# sjätte, eftersom PROMPT-TILL-CODEX.txt inte följde med. .githooks/post-commit
# committades och fanns aldrig i repot, eftersom vitlistan svalde den tyst.
# Rättelsetakten och feltakten är i samma storleksordning. Därför kan "redo"
# aldrig vara ett engångspåstående — det måste vara något som KÖRS.
#
# Provet påstår aldrig något det inte mätt. Kan en rad inte mätas blir den
# ODÖMBART och domen blir aldrig grön.

set -u
ROT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "inte ett git-repo"; exit 2; }
cd "$ROT" || exit 2
A="docs/loop/raddning/artefakter"

ja=0; nej=0; od=0
rad() { # <namn> <JA|NEJ|ODÖMBART> [detalj]
  case "$2" in
    JA)  printf '  \033[32m✓\033[0m %-44s' "$1"; ja=$((ja+1)) ;;
    NEJ) printf '  \033[31m✗\033[0m %-44s' "$1"; nej=$((nej+1)) ;;
    *)   printf '  \033[33m?\033[0m %-44s' "$1"; od=$((od+1)) ;;
  esac
  [ -n "${3:-}" ] && printf ' %s' "$3"
  echo
}

echo "══════════════════════════════════════════════════════════════════════"
echo " REDO FÖR CODEX? — mätt $(date '+%Y-%m-%d %H:%M')"
echo "══════════════════════════════════════════════════════════════════════"
echo

# ── 1. Körbanan ─────────────────────────────────────────────────────────────
[ "$(uname -s)" = "Darwin" ] && rad "rätt maskin (Darwin)" JA \
  || rad "rätt maskin (Darwin)" ODÖMBART "$(uname -s) — grindutfall är ODÖMBART här"
[ -d .git ] && rad "riktig klon, inte worktree" JA || rad "riktig klon, inte worktree" NEJ
s="$(git status --porcelain | wc -l | tr -d ' ')"
[ "$s" = "0" ] && rad "arbetsträdet rent" JA || rad "arbetsträdet rent" NEJ "$s okommitterade"
if git fetch -q origin main 2>/dev/null; then
  b="$(git rev-list --count HEAD..origin/main 2>/dev/null)"
  [ "${b:-1}" = "0" ] && rad "dagsfärsk mot origin/main" JA \
    || rad "dagsfärsk mot origin/main" NEJ "$b commits efter"
else rad "dagsfärsk mot origin/main" ODÖMBART "nådde inte origin"; fi

# ── 2. Regel 12 — inget arbete bara på maskinen ─────────────────────────────
if [ -f "$A/inventera-lokalt-arbete.sh" ]; then
  INV="$(mktemp "${TMPDIR:-/tmp}/redo-inv.XXXXXX")"
  bash "$A/inventera-lokalt-arbete.sh" >"$INV" 2>&1; iv=$?
  # VERDIKTALGEBRAN MÅSTE RESPEKTERAS: 0=uppfyllt · 1=verkligt fel · 2=ODÖMBART.
  # Första versionen behandlade allt nollskilt som ✗. 2026-09-16 23:19 timeade
  # fetchen ut, inventeringen svarade korrekt ODÖMBART — och detta prov bokförde
  # det som "regel 12 ej uppfylld". Det är en MILJÖ bokförd som ett fel i
  # kandidaten, precis det LOOP-RÄTTELSE-VAKTBEVIS förbjuder, i vaktens egen kod.
  case $iv in
    0) rad "regel 12: allt lokalt arbete finns på git" JA ;;
    2) rad "regel 12: allt lokalt arbete finns på git" ODÖMBART "kunde inte mätas — se $INV" ;;
    *) rad "regel 12: allt lokalt arbete finns på git" NEJ "se $INV" ;;
  esac
else rad "regel 12: allt lokalt arbete finns på git" ODÖMBART "provet saknas"; fi

# ── 3. Autopush — regel 12 som mekanism ─────────────────────────────────────
# En körbar fil bevisar inte att RÄTT hook är installerad (AUD-02): en stale kopia utan
# vakterna mot länkade worktrees pushar grindfixturer. Samma cmp som installeraren själv.
HP="$(git config --get core.hooksPath 2>/dev/null || true)"
if [ -n "$HP" ] && [ -x "$HP/post-commit" ] && cmp -s .githooks/post-commit "$HP/post-commit"; then rad "autopush installerad, hooken identisk med repots" JA
elif [ -n "$HP" ] && [ -x "$HP/post-commit" ]; then rad "autopush installerad, hooken identisk med repots" NEJ "hooken i $HP SKILJER — bash scripts/installera-hooks.sh --kor"
elif [ -n "$HP" ]; then rad "autopush installerad, hooken identisk med repots" NEJ "hooksPath satt men hooken saknas"
else rad "autopush installerad, hooken identisk med repots" NEJ "bash scripts/installera-hooks.sh --kor"; fi

# ── 4. Underlaget bär inga kända fel ────────────────────────────────────────
if [ -f "$A/validera-underlaget.sh" ]; then
  VAL="$(mktemp "${TMPDIR:-/tmp}/redo-val.XXXXXX")"
  bash "$A/validera-underlaget.sh" --operativt >"$VAL" 2>&1; v=$?
  # EXITKODEN ÄR DOMEN (AUD-02). Första versionen sparade v och använde den aldrig: den
  # räknade AVVIKER-rader, så exit 2 (ODÖMBART), exit 127 (krasch) och tom utdata blev JA.
  # --operativt: bara de rader som gäller NU; historiska tal vid diagnosrevisionen och de
  # avsiktligt utelämnade artefakterna hör inte till startvillkoret (AUD-03).
  av="$(awk '$NF=="AVVIKER"' "$VAL" 2>/dev/null | wc -l | tr -d ' ')"
  case "$v" in
    0) rad "underlaget (operativt): inga AVVIKER" JA ;;
    1) rad "underlaget (operativt): inga AVVIKER" NEJ "$av rader, se $VAL" ;;
    2) rad "underlaget (operativt): inga AVVIKER" ODÖMBART "exit 2, se $VAL" ;;
    *) rad "underlaget (operativt): inga AVVIKER" NEJ "krasch exit $v, se $VAL" ;;
  esac
else rad "underlaget: inga AVVIKER" ODÖMBART "provet saknas"; fi

# ── 5. EN väg, och den är hel ───────────────────────────────────────────────
V=docs/loop/raddning/VAGEN.md
if [ -f "$V" ]; then
  saknas=""
  for n in 0 1 2 3 4 5 6 7; do
    grep -qE "^### FAS $n( |—|\$)" "$V" || saknas="$saknas $n"
  done
  [ -z "$saknas" ] && rad "VAGEN.md bär FAS 0–7" JA || rad "VAGEN.md bär FAS 0–7" NEJ "saknar:$saknas"
  grep -q 'KERNEL_COMPLETE' "$V" && rad "slutkriteriet definierat i VAGEN.md" JA \
    || rad "slutkriteriet definierat i VAGEN.md" NEJ
else rad "VAGEN.md finns" NEJ; fi

# ── 6. Ingen konkurrerande ordning ──────────────────────────────────────────
# Mekanisk halva: ingen ANNAN fil får bära en egen numrerad ordningssektion.
# Den andra halvan — att en text SÄGER något annat om vad som görs först — går
# inte att greppa fram. Den måste läsas, och det står i VAGEN.md §0.
# Ingången är AGENTS.md (autoladdad av Codex, av Claude via CLAUDE.md); PROMPT-TILL-CODEX.txt
# avfördes 2026-09-17 (L2) — den bar status och återkallade order.
P=AGENTS.md
if [ -f "$P" ]; then
  if grep -qE '^ *[0-9]+\. +(⭐ *)?BÖRJA HÄR' "$P"; then
    rad "ingången bär ingen egen ordning" NEJ "AGENTS.md säger BÖRJA HÄR"
  else rad "ingången bär ingen egen ordning" JA; fi
  grep -q 'VAGEN.md' "$P" && rad "ingången pekar på VAGEN.md" JA \
    || rad "ingången pekar på VAGEN.md" NEJ
else rad "AGENTS.md finns" NEJ; fi

# ── 7. Läget är mätt, inte påstått ──────────────────────────────────────────
# En RAD:-rad någonstans i drift.md är ingen aktuell mätning (AUD-02). Bara MÄTRADER räknas:
# radstart, ev. `main`/`gren`-prefix, sedan `RAD: h-001:<exit>` — en prosarad som nämner
# literalen (som L3:s egen drift-text gjorde; oberoende granskning 2026-09-17) binder inget.
# Kartan räknas som mätt bara om mätraden anger sin revision (backtickat sha inom 30 rader
# ovanför), revisionen är förfader till HEAD, och kärnan (verify/bin, controller, specs)
# är oförändrad sedan dess. Annars: kör matning-pa-macen.sh.
# Alla RAD-block prövas (det nyaste kan vara en grenmätning); det första som är bundet till
# en revision som är förfader till HEAD räknas, om kärnan är oförändrad sedan dess.
KANDIDATER="$(awk '{buf[NR]=$0} /^[[:space:]]*(main|gren)?[[:space:]]*RAD: +h-001:[0-9A-Za-z]/ { s="INGEN"; for (i=NR; i>NR-30 && i>0; i--) { if (match(buf[i], /`[0-9a-f]{7,40}`/)) { s=substr(buf[i], RSTART+1, RLENGTH-2); break } } print s }' docs/loop/drift.md 2>/dev/null)"
KART=""; SKAL="ingen RAD: h-001-rad i drift.md"
for k in $KANDIDATER; do
  [ "$k" = "INGEN" ] && { SKAL="en RAD-rad saknar revision"; continue; }
  git rev-parse -q --verify "$k^{commit}" >/dev/null 2>&1 || { SKAL="$k finns inte här"; continue; }
  git merge-base --is-ancestor "$k" HEAD 2>/dev/null || { SKAL="$k är inte förfader till HEAD (grenmätning?)"; continue; }
  if git diff --quiet "$k" HEAD -- verify/bin controller specs 2>/dev/null; then KART="$k"; break
  else SKAL="kärnan ändrad sedan ${k:0:8}: $(git diff --name-only "$k" HEAD -- verify/bin controller specs | wc -l | tr -d ' ') filer — kör matning-pa-macen.sh"; fi
done
if [ -n "$KART" ]; then rad "kartan är mätt (RAD i drift.md, revision bunden)" JA "mätt på ${KART:0:8}"
else rad "kartan är mätt (RAD i drift.md, revision bunden)" NEJ "$SKAL"; fi

# ── Domen ───────────────────────────────────────────────────────────────────
echo
echo "══════════════════════════════════════════════════════════════════════"
printf ' %s uppfyllda · %s ej uppfyllda · %s odömbara\n' "$ja" "$nej" "$od"
if [ "$nej" = "0" ] && [ "$od" = "0" ]; then
  echo " ✅ REDO — starta Codex eller Claude Code i reporoten; AGENTS.md laddas automatiskt, VAGEN.md bär ordningen"
elif [ "$nej" = "0" ]; then
  echo " ⚠️  INTE DÖMBART HÄR. Kör på Macen — ett ODÖMBART blir aldrig grönt."
else
  echo " ❌ INTE REDO. Raderna med ✗ säger exakt vad som saknas."
fi
echo "══════════════════════════════════════════════════════════════════════"
echo
echo " Detta prov ersätter en bedömning med en mätning. Frågan 'är vi redo?'"
echo " ställdes tjugo gånger utan definition, och ett svar utan kriterium kan"
echo " alltid visa sig vara för generöst. Nu kan det fällas."
echo

[ "$nej" -gt 0 ] && exit 1
[ "$od"  -gt 0 ] && exit 2
exit 0
