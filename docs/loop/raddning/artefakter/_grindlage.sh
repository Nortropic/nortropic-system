# _grindlage.sh — GEMENSAM GRINDSTEGE. Sourcas av helhetsbilden.sh och matning-pa-macen.sh.
#
# Wrappar controller/verify/cli. Dömer ALDRIG själv: den skiljer bara på vad som är sant om
# en grind — finns / specad / fryst / registrerad / körd — och lämnar råexitkoden orörd.
# Skälet (AUD-01, 2026-09-17): helhetsbilden räknade `-f` på grindfilen som PASS och kunde
# skriva KERNEL_COMPLETE med tre grindar som aldrig körts. "Att HA en grind är inte att
# PASSERA den" (VAGEN.md §1) gäller nu mekaniskt, inte som prosa.
#
#   grindlage <h-NNN | @verify/bin/<fil>> <kor 0|1> [diag 0|1] [loggfil]
#
# Sätter GL_TOKEN GL_KOD GL_ID GL_PATH GL_VID GL_FRYS GL_DETALJ och skriver "TOKEN|kod|detalj".
# Tokens (klass: grön / gul=od / röd=nej):
#   EJ_SPECAD (röd) · MISSBUNDEN (röd: cli exit 4 eller osäker exit_test) · GRIND_SAKNAS (röd)
#   TOM_GRIND (röd) · OFRYST (röd: ospårad eller diffar mot HEAD) · FRYST_EJ_REGISTRERAD (gul)
#   REGISTRERAD_EJ_KORD (gul) · PLATTFORM_ODOMBART (gul) · PYTHON_SAKNAS (gul)
#   körd: PASS (grön, kräver icke-tom utdata) · PASS_UTAN_UTDATA (gul) · FAIL (röd) · ODOMBART (gul)
#         VAGRAN (röd) · INTEGRITET (röd) · AVBRUTEN (röd) · KRASCH (röd)
#   Med diag=1 körs en FRYST men OREGISTRERAD grind direkt med bash: tokenen får suffixet ·diag
#   och är ALDRIG grön (diagnostik är inte kvalificering — controller/verify/cli är domaren).
# Aggregat: gl_klass TOKEN → ja | od | nej. Grönt kräver exakt PASS.

GL_ROT="${GL_ROT:-$(git rev-parse --show-toplevel 2>/dev/null)}"
GL_PY="${GL_PY:-python3.12}"

gl_klass() {
  case "$1" in
    PASS) echo ja ;;
    FRYST_EJ_REGISTRERAD|REGISTRERAD_EJ_KORD|PLATTFORM_ODOMBART|PYTHON_SAKNAS|PASS_UTAN_UTDATA|ODOMBART|PASS·diag|PASS_UTAN_UTDATA·diag|ODOMBART·diag) echo od ;;
    *) echo nej ;;
  esac
}

# exit_test-sökväg för ett task-id, ur specen (läses med vilken python3 som helst).
gl_exit_test() {
  python3 - "$GL_ROT/specs/tasks.spec.json" "$1" <<'PY' 2>/dev/null
import json, sys
d = json.load(open(sys.argv[1]))
for t in d.get("tasks", []):
    if t.get("id") == sys.argv[2]:
        print(t.get("exit_test", "")); break
PY
}

# Beroendeslutningen (BFS över depends_on) från ett task-id, som radbruten lista; saknade
# id:n skrivs som "SAKNAS:<id>". Läser grafen, aldrig prosan (VAGEN.md §3).
gl_slutning() {
  python3 - "$GL_ROT/specs/tasks.spec.json" "$1" <<'PY' 2>/dev/null
import json, sys
d = json.load(open(sys.argv[1])); by = {t["id"]: t for t in d.get("tasks", []) if "id" in t}
start = sys.argv[2]; sedda = []; ko = list(by.get(start, {}).get("depends_on", []))
while ko:
    x = ko.pop(0)
    if x in sedda: continue
    sedda.append(x)
    if x in by: ko.extend(by[x].get("depends_on", []))
for x in sorted(sedda): print(x if x in by else "SAKNAS:" + x)
PY
}

gl_kor_mappa() { # $1=rc $2=loggfil → token
  case "$1" in
    0) [ -s "$2" ] && echo PASS || echo PASS_UTAN_UTDATA ;;
    1) echo FAIL ;; 2) echo ODOMBART ;; 3) echo VAGRAN ;; 4) echo INTEGRITET ;;
    126|127) echo KRASCH ;;
    *) [ "$1" -gt 128 ] 2>/dev/null && echo AVBRUTEN || echo KRASCH ;;
  esac
}

grindlage() {
  local id="$1" kor="${2:-0}" diag="${3:-0}" logg="${4:-}" svar rc path vid
  GL_TOKEN=""; GL_KOD="-"; GL_ID="$id"; GL_PATH=""; GL_VID=""; GL_FRYS="-"; GL_DETALJ=""
  [ -n "$logg" ] || logg="$(mktemp "${TMPDIR:-/tmp}/grindlage.XXXXXX")"
  case "$id" in
    @*) path="${id#@}"; GL_ID="$(basename "$path")"
        # Programgrind (inte ett task): registrerad om cli list bär sökvägen.
        if command -v "$GL_PY" >/dev/null 2>&1; then
          vid="$("$GL_PY" "$GL_ROT/controller/verify/cli" list 2>/dev/null | awk -F'\t' -v p="$path" '$2==p && $4=="startbar"{print $1; exit}')"
        fi ;;
    *)  if ! command -v "$GL_PY" >/dev/null 2>&1; then
          path="$(gl_exit_test "$id")"; vid=""
          [ -n "$path" ] || { GL_TOKEN=EJ_SPECAD; GL_DETALJ="$id finns inte som task"; printf '%s|%s|%s\n' "$GL_TOKEN" "$GL_KOD" "$GL_DETALJ"; return; }
        else
          svar="$("$GL_PY" "$GL_ROT/controller/verify/cli" task "$GL_ROT/specs/tasks.spec.json" "$id" 2>&1)"; rc=$?
          case "$rc" in
            0) path="$(gl_exit_test "$id")"
               case "$svar" in *'"grindad"'*) vid="$(printf '%s' "$svar" | sed -nE 's/.*"grind_id": *"([^"]+)".*/\1/p')" ;; *) vid="" ;; esac ;;
            3) case "$svar" in *"osäker exit_test"*) GL_TOKEN=MISSBUNDEN ;; *) GL_TOKEN=EJ_SPECAD ;; esac
               GL_KOD=3; GL_DETALJ="$(printf '%s' "$svar" | tail -1 | cut -c1-90)"; printf '%s|%s|%s\n' "$GL_TOKEN" "$GL_KOD" "$GL_DETALJ"; return ;;
            4) GL_TOKEN=MISSBUNDEN; GL_KOD=4; GL_DETALJ="$(printf '%s' "$svar" | tail -1 | cut -c1-90)"; printf '%s|%s|%s\n' "$GL_TOKEN" "$GL_KOD" "$GL_DETALJ"; return ;;
            *) GL_TOKEN=KRASCH; GL_KOD="$rc"; GL_DETALJ="cli task gav $rc"; printf '%s|%s|%s\n' "$GL_TOKEN" "$GL_KOD" "$GL_DETALJ"; return ;;
          esac
        fi ;;
  esac
  GL_PATH="$path"; GL_VID="$vid"
  # finns? tom? fryst?
  if [ ! -e "$GL_ROT/$path" ]; then GL_TOKEN=GRIND_SAKNAS; GL_DETALJ="$path saknas"
  elif [ ! -s "$GL_ROT/$path" ]; then GL_TOKEN=TOM_GRIND; GL_DETALJ="$path är tom"
  elif ! git -C "$GL_ROT" ls-files --error-unmatch -- "$path" >/dev/null 2>&1; then GL_TOKEN=OFRYST; GL_DETALJ="$path är OSPÅRAD"
  elif ! git -C "$GL_ROT" diff --quiet HEAD -- "$path" 2>/dev/null; then GL_TOKEN=OFRYST; GL_DETALJ="$path diffar mot HEAD"
  fi
  if [ -n "$GL_TOKEN" ]; then printf '%s|%s|%s\n' "$GL_TOKEN" "$GL_KOD" "$GL_DETALJ"; return; fi
  GL_FRYS="$(git -C "$GL_ROT" rev-list --count HEAD -- "$path" 2>/dev/null || echo '-')"
  # registrerad? körd?
  if [ -z "$vid" ]; then
    if [ "$kor" = 1 ] && [ "$diag" = 1 ]; then
      if [ "$(uname -s)" != "Darwin" ]; then GL_TOKEN=PLATTFORM_ODOMBART; GL_DETALJ="$(uname -s), grindarna är Darwin-bundna"
      else ( cd "$GL_ROT" && bash "$path" ) > "$logg" 2>&1; rc=$?; GL_KOD="$rc"; GL_TOKEN="$(gl_kor_mappa "$rc" "$logg")·diag"; GL_DETALJ="direkt bash, EJ kvalificering · logg $logg"
      fi
    else GL_TOKEN=FRYST_EJ_REGISTRERAD; GL_DETALJ="fryst ($GL_FRYS commits) men inte i controller/verify/register.json"
    fi
  elif [ "$kor" != 1 ]; then GL_TOKEN=REGISTRERAD_EJ_KORD; GL_DETALJ="kräver körning (--kor-grindar)"
  elif [ "$(uname -s)" != "Darwin" ]; then GL_TOKEN=PLATTFORM_ODOMBART; GL_DETALJ="$(uname -s), grindarna är Darwin-bundna"
  elif ! command -v "$GL_PY" >/dev/null 2>&1; then GL_TOKEN=PYTHON_SAKNAS; GL_DETALJ="$GL_PY saknas"
  else
    "$GL_PY" "$GL_ROT/controller/verify/cli" run "$vid" "$GL_ROT" > "$logg" 2>&1; rc=$?
    GL_KOD="$rc"; GL_TOKEN="$(gl_kor_mappa "$rc" "$logg")"; GL_DETALJ="via controller/verify/cli run $vid · logg $logg"
  fi
  printf '%s|%s|%s\n' "$GL_TOKEN" "$GL_KOD" "$GL_DETALJ"
}
