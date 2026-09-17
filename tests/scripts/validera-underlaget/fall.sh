#!/usr/bin/env bash
# tests/scripts/validera-underlaget/fall.sh — mekanismen "historiska rader mäts vid REV, operativa på HEAD"
# (AUD-03). Syntetisk klon: vid REV saknas h-014-exit/h-015-exit/autonomous-loop-exit och h-030; vid HEAD
# finns de. Raderna om REV ska förbli BEKRÄFTAT@REV — vägen som lyckas får aldrig fälla startkontrollen.
#   VALIDERA=<fil> bash tests/scripts/validera-underlaget/fall.sh
set -u
HAR="${HAR_REPO:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd -P)}"
VAL="${VALIDERA:-$HAR/docs/loop/raddning/artefakter/validera-underlaget.sh}"
[ -f "$VAL" ] || { echo "ODÖMBART: $VAL saknas"; exit 2; }
T="$(mktemp -d "${TMPDIR:-/tmp}/validera-fall.XXXXXX")"; export T; trap 'rm -rf "$T"' EXIT
export HOME="$T/hem"; mkdir -p "$HOME"; export GIT_AUTHOR_NAME=Prov GIT_AUTHOR_EMAIL=p@x GIT_COMMITTER_NAME=Prov GIT_COMMITTER_EMAIL=p@x
git config --global init.defaultBranch main
PASS=0; FAIL=0; ok() { PASS=$((PASS+1)); echo "  ✅ $1"; }; fel() { FAIL=$((FAIL+1)); echo "  ❌ $1 — $2"; }
A="$T/arb"; ART="$A/docs/loop/raddning/artefakter"
bygg() {
  rm -rf "$A"; git init -q "$A"; mkdir -p "$ART" "$A/verify/bin" "$A/specs" "$A/controller/verify" "$A/scripts"
  cp "$VAL" "$ART/validera-underlaget.sh"
  printf '#!/usr/bin/env bash\nexit 0\n' > "$A/verify/bin/h-001-exit"; printf '#!/usr/bin/env bash\nexit 1\n' > "$A/verify/bin/h-013-exit"
  printf '{"tasks":[{"id":"h-015","depends_on":["h-030"],"exit_test":"verify/bin/h-015-exit"}]}\n' > "$A/specs/tasks.spec.json"
  printf '{"verifiers":{\n"a":{"path":"scripts/check-invariants.mjs"},\n"b":{"path":"workflows/nortropic-verify-suite.js"}}}\n' > "$A/controller/verify/register.json"
  printf '# VÄGEN\n### FAS 0\n### FAS 1\n' > "$A/docs/loop/raddning/VAGEN.md"; printf '# drift\n' > "$A/docs/loop/drift.md"
  git -C "$A" add -A >/dev/null; git -C "$A" commit -q -m "diagnosrevision"; REV="$(git -C "$A" rev-parse --short HEAD)"
  # HEAD: leveranserna finns — det som AUD-03 handlar om
  printf '#!/usr/bin/env bash\nexit 0\n' > "$A/verify/bin/h-014-exit"; printf '#!/usr/bin/env bash\nexit 0\n' > "$A/verify/bin/h-015-exit"; printf '#!/usr/bin/env bash\nexit 0\n' > "$A/verify/bin/autonomous-loop-exit"
  printf '{"tasks":[{"id":"h-015","depends_on":["h-030"],"exit_test":"verify/bin/h-015-exit"},{"id":"h-030","depends_on":[],"exit_test":"verify/bin/h-030-exit"}]}\n' > "$A/specs/tasks.spec.json"
  git -C "$A" add -A >/dev/null; git -C "$A" commit -q -m "leveranser"
}
kor() { ( cd "$A" && VALIDERA_REV="${1:-$REV}" bash docs/loop/raddning/artefakter/validera-underlaget.sh ${2:-} ) > "$T/ut.txt" 2>&1; echo $?; }
row() { grep -F "$1" "$T/ut.txt" | head -1; }
echo "validera-underlaget.sh — fall"
bygg; rc="$(kor "$REV")"
for r in "h-014-exit saknades vid REV" "h-015-exit saknades vid REV" "autonomous-loop-exit saknades vid REV" "h-030 fanns EJ i specen vid REV" "registret registrerade 2 webbfiler vid REV"; do
  case "$(row "$r")" in *"BEKRÄFTAT@$REV"*) ok "V1 '$r' → BEKRÄFTAT@$REV fast leveransen finns på HEAD" ;; *) fel "V1 $r" "$(row "$r")" ;; esac
done
grep -q "HISTORISKT@$REV:" "$T/ut.txt" && ok "V1b summeringen skiljer HISTORISKT@$REV från OPERATIVT" || fel "V1b" "ingen HISTORISKT-rad"
# V2 --operativt: inga @REV-rader, inga bundle/patch-rader, exit följer bara operativa rader
rc="$(kor "$REV" --operativt)"; n_hist="$(grep -c "@$REV" "$T/ut.txt")"; n_bundle="$(grep -cE '^(bundle: |patchen bär)' "$T/ut.txt")"
[ "$n_hist" = 0 ] && [ "$n_bundle" = 0 ] && ok "V2 --operativt visar inga historiska eller bundle-/patch-rader" || fel "V2" "hist=$n_hist bundle=$n_bundle"
op_avvik="$(sed -nE 's/^OPERATIVT: BEKRÄFTAT [0-9]+ · AVVIKER ([0-9]+) .*/\1/p' "$T/ut.txt")"
if [ "${op_avvik:-x}" != x ]; then
  if { [ "$op_avvik" -gt 0 ] && [ "$rc" = 1 ]; } || { [ "$op_avvik" = 0 ] && [ "$rc" != 1 ]; }; then ok "V2b --operativt: exit ($rc) följer bara operativa AVVIKER ($op_avvik)"; else fel "V2b" "rc=$rc op_avvik=$op_avvik"; fi
else fel "V2b" "ingen OPERATIVT-summering"; fi
# V3 REV som inte finns → historiska rader ODÖMBART@REV, aldrig BEKRÄFTAT
rc="$(kor deadbeef)"; case "$(row "h-014-exit saknades vid REV")" in *"ODÖMBART@deadbeef"*) ok "V3 okänd REV → ODÖMBART@deadbeef (rc=$rc)" ;; *) fel "V3" "$(row "h-014-exit saknades vid REV")" ;; esac
# V4 (+) en historisk rad som verkligen var fel vid REV → AVVIKER@REV och default-läget exit 1
bygg; printf '#!/usr/bin/env bash\nexit 0\n' > "$A/verify/bin/h-014-exit"; git -C "$A" add -A >/dev/null; git -C "$A" commit -q --allow-empty -m x; REV2="$(git -C "$A" rev-parse --short HEAD)"
rc="$(kor "$REV2")"; case "$(row "h-014-exit saknades vid REV")" in *"AVVIKER@$REV2"*) [ "$rc" = 1 ] && ok "V4 h-014-exit fanns redan vid REV → AVVIKER@$REV2, default exit 1" || fel "V4" "rc=$rc" ;; *) fel "V4" "$(row "h-014-exit saknades vid REV")" ;; esac
rc="$(kor "$REV2" --operativt)"; grep -q "@$REV2" "$T/ut.txt" && fel "V4b" "--operativt visade @REV" || ok "V4b samma AVVIKER@REV påverkar inte --operativt"
echo; echo "$PASS gröna · $FAIL röda"; [ "$FAIL" = 0 ] && exit 0 || exit 1
