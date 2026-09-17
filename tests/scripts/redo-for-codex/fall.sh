#!/usr/bin/env bash
# tests/scripts/redo-for-codex/fall.sh — redo-for-codex.sh med STUBBAD validator och inventering.
# Egen klon med origin, eget $HOME. Provet gäller domens algebra (AUD-02): validatorns EXITKOD är domen,
# kartan i drift.md måste vara revisionsbunden, hooken måste vara identisk med repots.
#   REDO=<fil> bash tests/scripts/redo-for-codex/fall.sh
set -u
HAR="${1:-${HAR_REPO:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd -P)}}"   # första argumentet = kandidatrot (granskaren får inte miljöprefix)
REDO="${REDO:-$HAR/docs/loop/raddning/artefakter/redo-for-codex.sh}"
[ -f "$REDO" ] || { echo "ODÖMBART: $REDO saknas"; exit 2; }
T="$(mktemp -d "${TMPDIR:-/tmp}/redo-fall.XXXXXX")"; export T; trap 'rm -rf "$T"' EXIT
export HOME="$T/hem"; mkdir -p "$HOME"; export GIT_AUTHOR_NAME=Prov GIT_AUTHOR_EMAIL=p@x GIT_COMMITTER_NAME=Prov GIT_COMMITTER_EMAIL=p@x
git config --global init.defaultBranch main
PASS=0; FAIL=0; ok() { PASS=$((PASS+1)); echo "  ✅ $1"; }; fel() { FAIL=$((FAIL+1)); echo "  ❌ $1 — $2"; }
A="$T/arb"; ART="$A/docs/loop/raddning/artefakter"
bygg() {
  rm -rf "$T/origin.git" "$A"; git init -q --bare "$T/origin.git"; git init -q "$A"
  mkdir -p "$ART" "$A/.githooks" "$A/verify/bin" "$A/controller" "$A/specs"
  cp "$REDO" "$ART/redo-for-codex.sh"
  printf '#!/usr/bin/env bash\nexit 0\n' > "$A/.githooks/post-commit"
  printf '#!/usr/bin/env bash\necho inventering\nexit ${STUB_INV:-0}\n' > "$ART/inventera-lokalt-arbete.sh"
  printf '#!/usr/bin/env bash\necho "%s"\nexit ${STUB_VAL:-0}\n' "${1:-rad BEKRÄFTAT}" > "$ART/validera-underlaget.sh"
  printf '# VÄGEN\nKERNEL_COMPLETE\n### FAS 0\n### FAS 1\n### FAS 2\n### FAS 3\n### FAS 4\n### FAS 5\n### FAS 6\n### FAS 7\n' > "$A/docs/loop/raddning/VAGEN.md"
  printf '# AGENTS\nVAGEN.md\n' > "$A/AGENTS.md"
  printf '#!/usr/bin/env bash\necho x\n' > "$A/verify/bin/h-001-exit"; : > "$A/controller/x"; : > "$A/specs/x"
  git -C "$A" add -A >/dev/null; git -C "$A" commit -q -m bas; git -C "$A" remote add origin "$T/origin.git"; git -C "$A" push -q origin HEAD:main
  BAS="$(git -C "$A" rev-parse HEAD)"
  # drift med RAD-block bundet till basrevisionen
  printf '# drift\n\n## post\n`%s`\n\nRAD: h-001:0 h-002:0\n' "$BAS" > "$A/docs/loop/drift.md"
  git -C "$A" add -A >/dev/null; git -C "$A" commit -q -m drift; git -C "$A" push -q origin HEAD:main
  mkdir -p "$HOME/hooks"; cp "$A/.githooks/post-commit" "$HOME/hooks/post-commit"; chmod +x "$HOME/hooks/post-commit"; git -C "$A" config core.hooksPath "$HOME/hooks"
}
kor() { ( cd "$A" && bash docs/loop/raddning/artefakter/redo-for-codex.sh ) > "$T/ut.txt" 2>&1; echo $?; }
radtext() { sed 's/\x1b\[[0-9;]*m//g' "$T/ut.txt" | grep -F "$1"; }
echo "redo-for-codex.sh — fall"
# R1 (T02): validator exit 2 med noll AVVIKER-rader → ODÖMBART, inte JA
bygg; rc="$(STUB_VAL=2 kor)"; r="$(radtext "underlaget")"; case "$r" in *"?"*) ok "R1 (T02) validator exit 2 → ODÖMBART (rc=$rc)" ;; *) fel "R1" "$r" ;; esac
# R2 validator exit 1 med noll AVVIKER-rader → NEJ; exit 127 → NEJ krasch
bygg; rc="$(STUB_VAL=1 kor)"; r="$(radtext "underlaget")"; case "$r" in *"✗"*) ok "R2a validator exit 1 → NEJ" ;; *) fel "R2a" "$r" ;; esac
bygg; rc="$(STUB_VAL=127 kor)"; r="$(radtext "underlaget")"; case "$r" in *"✗"*krasch*) ok "R2b validator exit 127 → NEJ (krasch)" ;; *) fel "R2b" "$r" ;; esac
# R3 (+) validator exit 0 → JA, och --operativt skickas
bygg; rc="$(STUB_VAL=0 kor)"; r="$(radtext "underlaget")"; case "$r" in *"✓"*) ok "R3 validator exit 0 → JA" ;; *) fel "R3" "$r" ;; esac
# R4 kartan: bunden till basrevisionen och kärnan oförändrad → JA; ändra kärnan → NEJ; RAD utan sha → NEJ
bygg; kor >/dev/null; r="$(radtext "kartan")"; case "$r" in *"✓"*) ok "R4a RAD bunden till förfader, kärna oförändrad → JA" ;; *) fel "R4a" "$r" ;; esac
echo y >> "$A/verify/bin/h-001-exit"; git -C "$A" commit -qam kärna; kor >/dev/null; r="$(radtext "kartan")"; case "$r" in *"✗"*"kärnan ändrad"*) ok "R4b kärnan ändrad sedan mätningen → NEJ, kör matning" ;; *) fel "R4b" "$r" ;; esac
bygg; printf '# drift\n\nRAD: h-001:0\n' > "$A/docs/loop/drift.md"; git -C "$A" commit -qam u; kor >/dev/null; r="$(radtext "kartan")"; case "$r" in *"✗"*"saknar revision"*) ok "R4c RAD utan revision → NEJ" ;; *) fel "R4c" "$r" ;; esac
bygg; B="$(git -C "$A" rev-parse HEAD)"; printf '# drift\n\nen prosarad som nämner `RAD: h-001`-blocket och commiten `%s`\n' "$B" > "$A/docs/loop/drift.md"; git -C "$A" commit -qam u; kor >/dev/null; r="$(radtext "kartan")"; case "$r" in *"✗"*"ingen RAD"*) ok "R4e prosarad med literalen + förfader-sha binder INTE (bara mätrader räknas; kärnan oförändrad)" ;; *) fel "R4e" "$r" ;; esac
bygg; git -C "$A" switch -q -c annan; echo z > "$A/z"; git -C "$A" add -A; git -C "$A" commit -qm annan; X="$(git -C "$A" rev-parse HEAD)"; git -C "$A" switch -q main; printf '# drift\n\n`%s`\nRAD: h-001:0\n' "$X" > "$A/docs/loop/drift.md"; git -C "$A" commit -qam u; kor >/dev/null; r="$(radtext "kartan")"; case "$r" in *"✗"*"inte förfader"*) ok "R4f RAD bunden till sha som finns men inte är förfader → NEJ" ;; *) fel "R4f" "$r" ;; esac
bygg; B="$(git -C "$A" rev-parse HEAD)"; printf '# drift\n\nmätrevision: `%s`\nRAD: h-001:PASS(0) h-002:FAIL(1)\n' "$B" > "$A/docs/loop/drift.md"; git -C "$A" commit -qam u; kor >/dev/null; r="$(radtext "kartan")"; case "$r" in *"✓"*) ok "R4g matningens egen utdataform (mätrevision + RAD: h-001:PASS(0)) binder → JA" ;; *) fel "R4g" "$r" ;; esac
bygg; printf '# drift\n\n`deadbeefdeadbeef`\nRAD: h-001:0\n' > "$A/docs/loop/drift.md"; git -C "$A" commit -qam u; kor >/dev/null; r="$(radtext "kartan")"; case "$r" in *"✗"*) ok "R4d RAD med okänd revision → NEJ" ;; *) fel "R4d" "$r" ;; esac
# R5 hooken: stale kopia → NEJ SKILJER; identisk → JA
bygg; printf '#!/usr/bin/env bash\nexit 0\n# gammal\n' > "$HOME/hooks/post-commit"; kor >/dev/null; r="$(radtext "autopush")"; case "$r" in *"✗"*SKILJER*) ok "R5a stale hook → NEJ SKILJER" ;; *) fel "R5a" "$r" ;; esac
bygg; kor >/dev/null; r="$(radtext "autopush")"; case "$r" in *"✓"*) ok "R5b identisk hook → JA" ;; *) fel "R5b" "$r" ;; esac
# R6 inventering ODÖMBART respekteras (oförändrat beteende)
bygg; rc="$(STUB_INV=2 kor)"; r="$(radtext "regel 12")"; case "$r" in *"?"*) ok "R6 inventering exit 2 → ODÖMBART" ;; *) fel "R6" "$r" ;; esac
echo; echo "$PASS gröna · $FAIL röda"; [ "$FAIL" = 0 ] && exit 0 || exit 1
