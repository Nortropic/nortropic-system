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
  bash "$A/inventera-lokalt-arbete.sh" >/tmp/redo-inv.txt 2>&1; iv=$?
  # VERDIKTALGEBRAN MÅSTE RESPEKTERAS: 0=uppfyllt · 1=verkligt fel · 2=ODÖMBART.
  # Första versionen behandlade allt nollskilt som ✗. 2026-09-16 23:19 timeade
  # fetchen ut, inventeringen svarade korrekt ODÖMBART — och detta prov bokförde
  # det som "regel 12 ej uppfylld". Det är en MILJÖ bokförd som ett fel i
  # kandidaten, precis det LOOP-RÄTTELSE-VAKTBEVIS förbjuder, i vaktens egen kod.
  case $iv in
    0) rad "regel 12: allt lokalt arbete finns på git" JA ;;
    2) rad "regel 12: allt lokalt arbete finns på git" ODÖMBART "kunde inte mätas — se /tmp/redo-inv.txt" ;;
    *) rad "regel 12: allt lokalt arbete finns på git" NEJ "se /tmp/redo-inv.txt" ;;
  esac
else rad "regel 12: allt lokalt arbete finns på git" ODÖMBART "provet saknas"; fi

# ── 3. Autopush — regel 12 som mekanism ─────────────────────────────────────
HP="$(git config --get core.hooksPath 2>/dev/null || true)"
if [ -n "$HP" ] && [ -x "$HP/post-commit" ]; then rad "autopush installerad" JA
elif [ -n "$HP" ]; then rad "autopush installerad" NEJ "hooksPath satt men hooken saknas"
else rad "autopush installerad" NEJ "bash scripts/installera-hooks.sh --kor"; fi

# ── 4. Underlaget bär inga kända fel ────────────────────────────────────────
if [ -f "$A/validera-underlaget.sh" ]; then
  bash "$A/validera-underlaget.sh" >/tmp/redo-val.txt 2>&1; v=$?
  # Räkna DOMSRADER, inte förekomster av ordet. Första versionen använde
  # `grep -c AVVIKER` och räknade provets egen förklarande prosa — två träffar i
  # en körning med noll faktiska avvikelser. Domen står sist på raden.
  av="$(awk '$NF=="AVVIKER"' /tmp/redo-val.txt 2>/dev/null | wc -l | tr -d ' ')"
  [ "${av:-0}" = "0" ] && rad "underlaget: inga AVVIKER" JA \
    || rad "underlaget: inga AVVIKER" NEJ "$av rader, se /tmp/redo-val.txt"
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
P=docs/loop/raddning/PROMPT-TILL-CODEX.txt
if [ -f "$P" ]; then
  if grep -qE '^ *[0-9]+\. +(⭐ *)?BÖRJA HÄR' "$P"; then
    rad "prompten bär ingen egen ordning" NEJ "den säger BÖRJA HÄR"
  else rad "prompten bär ingen egen ordning" JA; fi
  grep -q 'VAGEN.md' "$P" && rad "prompten pekar på VAGEN.md" JA \
    || rad "prompten pekar på VAGEN.md" NEJ
else rad "PROMPT-TILL-CODEX.txt finns" NEJ; fi

# ── 7. Läget är mätt, inte påstått ──────────────────────────────────────────
if grep -q 'RAD: h-001' docs/loop/drift.md 2>/dev/null; then
  rad "kartan är mätt och står i drift.md" JA
else rad "kartan är mätt och står i drift.md" NEJ; fi

# ── Domen ───────────────────────────────────────────────────────────────────
echo
echo "══════════════════════════════════════════════════════════════════════"
printf ' %s uppfyllda · %s ej uppfyllda · %s odömbara\n' "$ja" "$nej" "$od"
if [ "$nej" = "0" ] && [ "$od" = "0" ]; then
  echo " ✅ REDO — starta Codex med docs/loop/raddning/PROMPT-TILL-CODEX.txt"
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
