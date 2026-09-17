#!/usr/bin/env bash
# helhetsbilden.sh — SKRIVER ALDRIG i arbetsträdet. Enda nätåtkomst: `git fetch origin main`
# (uppdaterar origin/main). Skriver ut hela lägesbilden, MÄTT.
#
#     bash docs/loop/raddning/artefakter/helhetsbilden.sh              # snabb, ~2 sek
#     bash docs/loop/raddning/artefakter/helhetsbilden.sh --kor-grindar # kör registrerade grindar, Darwin
#
# VARFÖR DEN FINNS. Ägaren 2026-09-16: "det första måste ju vara skapa en bild av
# helheten, hjälper inte dokumentationen till med det? DETTA är varför vi snurrar
# runt i galenskap varje gång." Svaret var nej: docs/loop/raddning/ beskriver helheten
# på fem överlappande sätt och ingen av dem visar LÄGET. Helheten räknas fram varje gång.
#
# VAD DEN MÄTER, OCH VAD DEN INTE PÅSTÅR (AUD-01, 2026-09-17). Provet läser slutkriteriets
# sex rader ur VAGEN.md §1 och skiljer för varje grind på finns / specad / fryst /
# registrerad / körd PASS via _grindlage.sh (som bara wrappar controller/verify/cli).
# Grönt kräver ett kört PASS genom registret. En grindFIL är aldrig ett PASS — den
# gamla versionen räknade `-f` som uppfyllt och kunde skriva KERNEL_COMPLETE med tre
# grindar som aldrig körts. Utan --kor-grindar står det "kräver körning"; på fel
# plattform ODÖMBART; oregistrerad grind är gul, aldrig grön (diagnostik bor i
# matning-pa-macen.sh). Slutningen läses ur specens depends_on från h-015 — ingen
# hårdkodad lista, så h-017 och h-027–h-030 kommer med den dag h-030 finns.
#
# Exitkod: 0 = alla sex rader UPPFYLLDA · 1 = minst en rad SAKNAS/FEL · 2 = inget saknas
# men något är ODÖMBART/ej kört. Ett ODÖMBART blir aldrig grönt.

set -u
KOR_GRINDAR=0
[ "${1:-}" = "--kor-grindar" ] && KOR_GRINDAR=1

ROT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "inte ett git-repo"; exit 2; }
cd "$ROT" || exit 2
GL_TMP="$(mktemp -d "${TMPDIR:-/tmp}/grindlage-run.XXXXXX")"; trap 'rm -rf "$GL_TMP"' EXIT; export GL_TMP
GL_ROT="$ROT"; . "$ROT/docs/loop/raddning/artefakter/_grindlage.sh"

gron()  { printf '\033[32m%s\033[0m' "$1"; }
rod()   { printf '\033[31m%s\033[0m' "$1"; }
gul()   { printf '\033[33m%s\033[0m' "$1"; }

echo "══════════════════════════════════════════════════════════════════════"
echo " NORTROPIC — HELHETSBILDEN, MÄTT $(date '+%Y-%m-%d %H:%M')"
echo "══════════════════════════════════════════════════════════════════════"

# ── 1. KÖRBANAN ─────────────────────────────────────────────────────────────
echo
echo "1. KÖRBANAN — står bilen på vägen?"
OS="$(uname -s)"
printf '   maskin      %s  ' "$OS"
if [ "$OS" = "Darwin" ]; then gron "grindarna är dömbara här"; else
  gul "grindutfall blir ODÖMBART (Darwin-bunden, FYND 31d)"; fi; echo

printf '   klon        %s  ' "$ROT"
if [ -d .git ]; then gron "riktig klon"; else rod "WORKTREE — grindarna ger falska röda (FYND 32)"; fi; echo

SMUTS="$(git status --porcelain | wc -l | tr -d ' ')"
printf '   arbetsträd  %s okommitterade  ' "$SMUTS"
[ "$SMUTS" = "0" ] && gron "rent" || gul "grindkörning på smutsigt träd ger tal som ser ut som evidens"; echo

printf '   autopush    '
# JA bara om hooken är installerad OCH byteidentisk med repots — en stale kopia utan
# vakterna mot länkade worktrees pushar grindfixturer (L1c). `-x` räckte inte (AUD-02).
HP="$(git config --get core.hooksPath 2>/dev/null || true)"
HOOKVAKT=0
if [ -n "$HP" ] && [ -x "$HP/post-commit" ] && cmp -s .githooks/post-commit "$HP/post-commit"; then
  gron "på — varje commit pushas (regel 12), hooken identisk med repots"; HOOKVAKT=1
elif [ -n "$HP" ] && [ -x "$HP/post-commit" ]; then
  rod "hooken i $HP SKILJER från repots .githooks/post-commit — bash scripts/installera-hooks.sh --kor"
elif [ -n "$HP" ]; then rod "core.hooksPath=$HP men post-commit saknas eller är inte körbar"
else gul "AV — arbete kan bli kvar lokalt. bash scripts/installera-hooks.sh --kor"; fi; echo

printf '   granskning  '
# Härifrån går bara att mäta att workflowen finns SPÅRAD på grenen. Diffgranskningen sker
# av en separat process (AGENTS.md); om main kräver checkarna är en serverinställning.
if git ls-files --error-unmatch .github/workflows/granska-pr.yml >/dev/null 2>&1; then
  gul "workflow spårad (vaktsvit + skalprov) · diffgranskning = separat process · required checks på main: ODÖMBART härifrån"
elif [ -f .github/workflows/granska-pr.yml ]; then
  rod "filen finns men är OSPÅRAD — vitlistan har svalt den, Actions ser den aldrig"
else
  rod "ingen granska-pr.yml — PR:er mergas ogranskade (AGENTS.md)"
fi; echo

printf '   färskhet    '
if git fetch -q origin main 2>/dev/null; then
  BAK="$(git rev-list --count HEAD..origin/main 2>/dev/null || echo '?')"
  if [ "$BAK" = "0" ]; then gron "dagsfärsk mot origin/main"
  else rod "$BAK commits EFTER origin/main — pulla först"; fi
else gul "kunde inte nå origin — färskheten är ODÖMBART"; fi; echo

# ── 2. SLUTKRITERIET ────────────────────────────────────────────────────────
echo
echo "2. SLUTKRITERIET — KERNEL_COMPLETE, sex rader (VAGEN.md §1)"
echo

JA=0; NEJ=0; OD=0
rad() { # nr, text, tillstånd(JA|NEJ|OD), detalj
  printf '   %s  %-46s ' "$1" "$2"
  case "$3" in
    JA)  gron "UPPFYLLT"; JA=$((JA+1)) ;;
    NEJ) rod  "SAKNAS";   NEJ=$((NEJ+1)) ;;
    *)   gul  "ODÖMBART"; OD=$((OD+1)) ;;
  esac
  [ -n "${4:-}" ] && printf '  %s' "$4"
  echo
}
# En grindrad ur stegens token: JA endast vid exakt PASS; tokenen skrivs alltid ut.
grindrad() { # nr, text, id
  grindlage "$3" "$KOR_GRINDAR" 0 >/dev/null
  local k; k="$(gl_klass "$GL_TOKEN")"
  case "$k" in ja) rad "$1" "$2" JA "$GL_TOKEN($GL_KOD)" ;;
               od) rad "$1" "$2" OD "$GL_TOKEN — $GL_DETALJ" ;;
               *)  rad "$1" "$2" NEJ "$GL_TOKEN($GL_KOD) — $GL_DETALJ" ;; esac
}

# Krav 1 — h-015:s beroendeslutning, läst ur specen. Aldrig en hårdkodad lista.
if [ "$KOR_GRINDAR" = 1 ] && [ "$OS" = "Darwin" ] && [ "$HOOKVAKT" != 1 ] && [ -n "$HP" ]; then
  rad 1 "h-015:s beroendeslutning grön" OD "grindkörning stoppad: hooken i $HP saknar vakterna (L1c) — fixturcommits skulle pushas"
else
  N=0; P=0; NEJ_N=0; OD_N=0; REG=0; FRYS=0; SAKN=""; RAD=""; SPECFEL=0
  for id in $(gl_slutning h-015); do
    case "$id" in FEL:spec) SPECFEL=1; continue;; SAKNAS:*) SAKN="$SAKN ${id#SAKNAS:}"; NEJ_N=$((NEJ_N+1)); RAD="$RAD ${id#SAKNAS:}:EJ_SPECAD"; continue;; esac
    N=$((N+1)); grindlage "$id" "$KOR_GRINDAR" 0 >/dev/null
    [ -n "$GL_VID" ] && REG=$((REG+1)); [ "$GL_FRYS" != "-" ] && FRYS=$((FRYS+1))
    case "$(gl_klass "$GL_TOKEN")" in ja) P=$((P+1));; od) OD_N=$((OD_N+1));; *) NEJ_N=$((NEJ_N+1));; esac
    RAD="$RAD $id:$GL_TOKEN($GL_KOD)"
  done
  N_TOT=$((N + $(printf '%s' "$SAKN" | wc -w | tr -d ' ')))
  # En slutning som inte kan läsas eller är tom är NEJ — aldrig "0/0 PASS" (AUD-01/AUD-10).
  if [ "$SPECFEL" = 1 ]; then rad 1 "h-015:s beroendeslutning grön" NEJ "specs/tasks.spec.json kan inte läsas (ogiltig JSON, saknad fil eller python saknas)"
  elif [ "$N_TOT" = 0 ]; then rad 1 "h-015:s beroendeslutning grön" NEJ "tom slutning — h-015 saknar depends_on eller finns inte i specen"
  elif [ -n "$SAKN" ]; then rad 1 "h-015:s beroendeslutning grön" NEJ "$N_TOT noder ·$SAKN SAKNAS I SPEC · $P PASS"
  elif [ "$NEJ_N" -gt 0 ]; then rad 1 "h-015:s beroendeslutning grön" NEJ "$P/$N PASS · $NEJ_N röda · $OD_N odömbara"
  elif [ "$KOR_GRINDAR" != 1 ]; then rad 1 "h-015:s beroendeslutning grön" OD "kräver körning · $REG/$N registrerade · $FRYS/$N frysta · --kor-grindar"
  elif [ "$OD_N" -gt 0 ]; then rad 1 "h-015:s beroendeslutning grön" OD "$P/$N PASS · $OD_N odömbara ($REG/$N registrerade)"
  else rad 1 "h-015:s beroendeslutning grön" JA "$P/$N PASS via controller/verify/cli"; fi
  echo "       RAD:$RAD"
fi

# Krav 2–6
grindrad 2 "h-014 har en fryst grind som passerar" h-014
SUB_SPEC=0; SUB_FRYST=0
for id in h-027 h-028 h-029 h-030; do
  grindlage "$id" 0 0 >/dev/null
  case "$GL_TOKEN" in EJ_SPECAD|MISSBUNDEN|KRASCH) ;; *) SUB_SPEC=$((SUB_SPEC+1)) ;; esac
  case "$GL_TOKEN" in GRIND_SAKNAS|TOM_GRIND|OFRYST|EJ_SPECAD|MISSBUNDEN|KRASCH) ;; *) SUB_FRYST=$((SUB_FRYST+1)) ;; esac
done
if [ "$SUB_SPEC" = 4 ] && [ "$SUB_FRYST" = 4 ]; then rad 3 "h-027..h-030 finns som task med fryst grind" JA "4/4 specade · 4/4 frysta"
else rad 3 "h-027..h-030 finns som task med fryst grind" NEJ "$SUB_SPEC/4 specade (id i specen, inte omnämnanden) · $SUB_FRYST/4 frysta"; fi
grindrad 4 "h-015 har en fryst grind som passerar" h-015
grindrad 5 "programdomen finns och är grön" @verify/bin/autonomous-loop-exit
ACC=docs/loop/autonomy-kernel-v1-acceptance.md
if git ls-files --error-unmatch "$ACC" >/dev/null 2>&1 && [ -s "$ACC" ]; then rad 6 "acceptansfilen finns (spårad, icke-tom)" JA
elif [ -e "$ACC" ]; then rad 6 "acceptansfilen finns (spårad, icke-tom)" NEJ "finns men är ospårad eller tom"
else rad 6 "acceptansfilen finns (spårad, icke-tom)" NEJ; fi

echo
printf '   ⇒ %s uppfyllda · %s saknas · %s odömbara av 6.  ' "$JA" "$NEJ" "$OD"
if [ "$JA" = 6 ]; then gron "KERNEL_COMPLETE"; else echo -n "Vägen dit står i VAGEN.md §4."; fi
echo

# ── 3. PLATTFORMSGRENEN ─────────────────────────────────────────────────────
echo
echo "3. PLATTFORMSGRENEN — bär den kernelarbete som inte finns på main?"
B="origin/nortropic/platform-integration-20260910"
if git rev-parse -q --verify "$B" >/dev/null 2>&1; then
  set -- $(git rev-list --left-right --count "origin/main...$B" 2>/dev/null)
  printf '   grenen: %s commits före main, main har %s som grenen saknar\n' "${2:-?}" "${1:-?}"
  echo "   kärnfiler som SKILJER (grenens version är omätt mot grinden):"
  git diff --name-only origin/main "$B" -- controller/ specs/ 2>/dev/null | sed 's/^/     /'
else
  echo "   (grenen inte hämtad — git fetch origin nortropic/platform-integration-20260910)"
fi

# ── 4. NÄSTA STEG ───────────────────────────────────────────────────────────
echo
echo "4. NÄSTA STEG"
echo "   Vägen:   docs/loop/raddning/VAGEN.md  — den ENDA filen som säger vad som görs härnäst"
echo "   Läget:   docs/loop/drift.md (nyast överst) · docs/05-beslutslogg.md"
echo "   Regel 12: bash docs/loop/raddning/artefakter/inventera-lokalt-arbete.sh"
echo
echo "══════════════════════════════════════════════════════════════════════"

[ "$NEJ" -gt 0 ] && exit 1
[ "$OD" -gt 0 ] && exit 2
exit 0
