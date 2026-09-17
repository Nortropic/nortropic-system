#!/usr/bin/env bash
# tests/scripts/inventera-lokalt-arbete/fall.sh — AUD-09: PA_REMOTE bara mot origin; ingen städningsfullmakt
# över omätt ignorerat innehåll. Eget $HOME (klonsökningen går från $HOME), egna bare-remotes.
#   INVENTERA=<fil> bash tests/scripts/inventera-lokalt-arbete/fall.sh
set -u
HAR="${HAR_REPO:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd -P)}"
INV="${INVENTERA:-$HAR/docs/loop/raddning/artefakter/inventera-lokalt-arbete.sh}"
[ -f "$INV" ] || { echo "ODÖMBART: $INV saknas"; exit 2; }
T="$(mktemp -d "${TMPDIR:-/tmp}/inventera-fall.XXXXXX")"; export T; trap 'rm -rf "$T"' EXIT
export HOME="$T/hem"; mkdir -p "$HOME"; export GIT_AUTHOR_NAME=Prov GIT_AUTHOR_EMAIL=p@x GIT_COMMITTER_NAME=Prov GIT_COMMITTER_EMAIL=p@x
export NORTROPIC_RAPPORT_KAT="$T/rapporter"
git config --global init.defaultBranch main
PASS=0; FAIL=0; ok() { PASS=$((PASS+1)); echo "  ✅ $1"; }; fel() { FAIL=$((FAIL+1)); echo "  ❌ $1 — $2"; }
A="$HOME/arb"
bygg() {
  rm -rf "$T/origin.git" "$T/annan.git" "$A"; git init -q --bare "$T/origin.git"; git init -q --bare "$T/annan.git"
  git init -q "$A"; mkdir -p "$A/docs/loop/raddning/artefakter"; cp "$INV" "$A/docs/loop/raddning/artefakter/inventera-lokalt-arbete.sh"
  printf '/*\n!/.gitignore\n!/docs/\n!/a.txt\n' > "$A/.gitignore"; echo a > "$A/a.txt"
  git -C "$A" add -A >/dev/null; git -C "$A" commit -q -m bas
  git -C "$A" remote add origin "$T/origin.git"; git -C "$A" remote add annan "$T/annan.git"; git -C "$A" push -q origin HEAD:main; git -C "$A" fetch -q origin
}
kor() { ( cd "$A" && bash docs/loop/raddning/artefakter/inventera-lokalt-arbete.sh ) > "$T/ut.txt" 2>&1; echo $?; }
echo "inventera-lokalt-arbete.sh — fall"
# I1 (T05): ny commit på en gren som bara finns på REMOTEN 'annan' → FÖRÄLDRALÖS, exit 1
bygg; git -C "$A" switch -q -c x; echo b > "$A/docs/b.md"; git -C "$A" add -A >/dev/null; git -C "$A" commit -q -m b; git -C "$A" push -q annan x; git -C "$A" fetch -q annan
rc="$(kor)"; if [ "$rc" = 1 ] && grep -q 'FORALDRALOS\|FÖRÄLDRALÖS' "$T/ut.txt"; then ok "I1 (T05) commit bara på annan remote → FÖRÄLDRALÖS, exit 1"; else fel "I1" "rc=$rc $(grep -E 'FORALDRALOS|PA_REMOTE|REGEL 12' "$T/ut.txt" | head -2 | tr '\n' ' ')"; fi
# I2 (+): samma commit pushad till origin/x → PA_REMOTE, exit 0
git -C "$A" push -q origin x; rc="$(kor)"; if [ "$rc" = 0 ] && grep -q 'PA_REMOTE' "$T/ut.txt"; then ok "I2 commit på origin/x → PA_REMOTE, exit 0"; else fel "I2" "rc=$rc $(grep -E 'FORALDRALOS|PA_REMOTE|REGEL 12' "$T/ut.txt" | head -2 | tr '\n' ' ')"; fi
# I3 (T06): rent träd men ignorerad fil → exit 0 (regel 12 för spårat), men INGEN städningsfullmakt
bygg; mkdir -p "$A/scratch"; echo x > "$A/scratch/evidens.json"; rc="$(kor)"
if [ "$rc" = 0 ] && grep -q 'STÄDNING EJ FRIKÄND' "$T/ut.txt" && ! grep -q 'Städning kan ske' "$T/ut.txt"; then ok "I3 (T06) ignorerat innehåll → exit 0 men STÄDNING EJ FRIKÄND"; else fel "I3" "rc=$rc $(grep -E 'Städning|STÄDNING' "$T/ut.txt" | tr '\n' ' ')"; fi
# I4 (+): rent träd utan ignorerat → 'Städning kan ske'
bygg; rc="$(kor)"; if [ "$rc" = 0 ] && grep -q 'Städning kan ske' "$T/ut.txt"; then ok "I4 rent, inget ignorerat → städning frikänd"; else fel "I4" "rc=$rc $(grep -E 'Städning|STÄDNING' "$T/ut.txt" | tr '\n' ' ')"; fi
# I5 rapporten hamnar under NORTROPIC_RAPPORT_KAT, inte /tmp
ls "$T/rapporter"/lokalt-arbete-*.txt >/dev/null 2>&1 && ok "I5 rapporten skrivs under NORTROPIC_RAPPORT_KAT" || fel "I5" "$(ls "$T/rapporter" 2>&1)"
grep -q 'LÄSER BARA' "$A/docs/loop/raddning/artefakter/inventera-lokalt-arbete.sh" && fel "I6" "headern påstår LÄSER BARA fast den fetchar --prune" || ok "I6 headern säger sant om fetch --prune"
echo; echo "$PASS gröna · $FAIL röda"; [ "$FAIL" = 0 ] && exit 0 || exit 1
