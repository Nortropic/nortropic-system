#!/usr/bin/env bash
# tests/scripts/helhetsbilden/fall.sh — helhetsbilden.sh + _grindlage.sh mot syntetiska grindar.
# Egen klon (bare origin + arbetskopia), eget $HOME, kopia av controller/verify/cli, syntetisk spec
# och register. Rör aldrig det riktiga repot. Kräver python3.12 (annars ODÖMBART, exit 2).
#   bash tests/scripts/helhetsbilden/fall.sh
#   HELHETSBILDEN=<fil> GRINDLAGE=<fil> bash tests/scripts/helhetsbilden/fall.sh   # prova andra kandidater
set -u
HAR="${HAR_REPO:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd -P)}"
HB="${HELHETSBILDEN:-$HAR/docs/loop/raddning/artefakter/helhetsbilden.sh}"
GL="${GRINDLAGE:-$HAR/docs/loop/raddning/artefakter/_grindlage.sh}"
[ -f "$HB" ] && [ -f "$GL" ] || { echo "ODÖMBART: kandidat saknas ($HB, $GL)"; exit 2; }
command -v python3.12 >/dev/null 2>&1 || { echo "ODÖMBART: python3.12 saknas — controller/verify/cli kräver 3.12"; exit 2; }
T="$(mktemp -d "${TMPDIR:-/tmp}/helhetsbilden-fall.XXXXXX")"; export T; trap 'rm -rf "$T"' EXIT
export HOME="$T/hem"; mkdir -p "$HOME" "$T/bin"
export GIT_AUTHOR_NAME=Prov GIT_AUTHOR_EMAIL=prov@x GIT_COMMITTER_NAME=Prov GIT_COMMITTER_EMAIL=prov@x
git config --global init.defaultBranch main
PASS=0; FAIL=0
ok()  { PASS=$((PASS+1)); echo "  ✅ $1"; }
fel() { FAIL=$((FAIL+1)); echo "  ❌ $1 — $2"; }
# uname-shim: helhetsbilden läser `uname -s`; standard Darwin så grindar är dömbara i provet.
UNAME_S=Darwin; cat > "$T/bin/uname" <<'U'
#!/usr/bin/env bash
if [ "${1:-}" = "-s" ]; then echo "${PROV_UNAME_S:-Darwin}"; else /usr/bin/uname "$@"; fi
U
chmod +x "$T/bin/uname"; export PATH="$T/bin:$PATH"

sha() { shasum -a 256 "$1" | cut -c1-64; }
# ── syntetisk klon ──────────────────────────────────────────────────────────
bygg() { # bygger om klonen från grunden; $1 = variant
  rm -rf "$T/origin.git" "$T/arb"; git init -q --bare "$T/origin.git"
  git init -q "$T/arb"; A="$T/arb"
  mkdir -p "$A/controller/verify" "$A/verify/bin" "$A/specs" "$A/docs/loop/raddning/artefakter" "$A/.githooks"
  cp "$HAR/controller/verify/cli" "$A/controller/verify/cli"; chmod +x "$A/controller/verify/cli"
  cp "$HB" "$A/docs/loop/raddning/artefakter/helhetsbilden.sh"; cp "$GL" "$A/docs/loop/raddning/artefakter/_grindlage.sh"
  printf '#!/usr/bin/env bash\nexit 0\n' > "$A/.githooks/post-commit"
  cat > "$A/docs/loop/raddning/VAGEN.md" <<'V'
# VÄGEN (syntetisk)
## §1
KERNEL_COMPLETE
### FAS 0
### FAS 1
V
  # grindar: h-001 PASS med utdata · h-013 FAIL · h-016 ODÖMBART · h-017 kraschar · h-014 tom fil
  printf '#!/usr/bin/env bash\necho "1 PASS, 0 FAIL"\nexit 0\n' > "$A/verify/bin/h-001-exit"
  printf '#!/usr/bin/env bash\necho "0 PASS, 1 FAIL"\nexit 1\n' > "$A/verify/bin/h-013-exit"
  printf '#!/usr/bin/env bash\necho ODÖMBART\nexit 2\n' > "$A/verify/bin/h-016-exit"
  printf '#!/usr/bin/env bash\nexec /nonexistent/tolk\n' > "$A/verify/bin/h-017-exit"
  : > "$A/verify/bin/h-014-exit"
  chmod +x "$A"/verify/bin/*
  # spec: h-015 beror på h-013, h-016, h-030; h-013 på h-001; h-016 på h-017; h-014 på h-013
  cat > "$A/specs/tasks.spec.json" <<'J'
{"tasks":[
 {"id":"h-001","depends_on":[],"exit_test":"verify/bin/h-001-exit"},
 {"id":"h-013","depends_on":["h-001"],"exit_test":"verify/bin/h-013-exit"},
 {"id":"h-016","depends_on":["h-017"],"exit_test":"verify/bin/h-016-exit"},
 {"id":"h-017","depends_on":[],"exit_test":"verify/bin/h-017-exit"},
 {"id":"h-014","depends_on":["h-013"],"exit_test":"verify/bin/h-014-exit"},
 {"id":"h-015","depends_on":["h-013","h-016","h-030"],"exit_test":"verify/bin/h-015-exit"}
]}
J
  register "$A" "$@"
  git -C "$A" add -A >/dev/null; git -C "$A" commit -q -m bas; git -C "$A" remote add origin "$T/origin.git"; git -C "$A" push -q origin HEAD:main
}
register() { # <klon> [id...] — registrerar angivna grindar med rätt sha256
  local A="$1"; shift; local body="" id
  for id in "$@"; do
    body="$body$([ -n "$body" ] && echo ,)\"$id\":{\"path\":\"verify/bin/$id-exit\",\"sha256\":\"$(sha "$A/verify/bin/$id-exit")\",\"runner\":\"bash\",\"startbar\":true,\"beskrivning\":\"prov\"}"
  done
  printf '{"register_version":"1.0.0","verifiers":{%s}}\n' "$body" > "$A/controller/verify/register.json"
}
kor() { # kör helhetsbilden i klonen; skriver ut till $T/ut.txt; echo exit
  ( cd "$T/arb" && bash docs/loop/raddning/artefakter/helhetsbilden.sh "$@" ) > "$T/ut.txt" 2>&1; echo $?
}
rad() { grep -E "^   $1 " "$T/ut.txt" | sed 's/\x1b\[[0-9;]*m//g'; }

echo "helhetsbilden.sh — fall"
# H1 (T01): tom, ospårad-men-committad? Nej: h-014 är TOM men spårad → TOM_GRIND, aldrig UPPFYLLT
bygg h-001; rc="$(kor)"; r="$(rad 2)"
case "$r" in *SAKNAS*TOM_GRIND*) ok "H1 (T01) tom grindfil h-014 → SAKNAS/TOM_GRIND, aldrig UPPFYLLT (rc=$rc)" ;; *) fel "H1" "$r" ;; esac
# H2 fryst men oregistrerad → ODÖMBART, aldrig grön; rad 1 kräver körning
bygg h-001; printf '#!/usr/bin/env bash\necho ok\nexit 0\n' > "$T/arb/verify/bin/h-014-exit"; git -C "$T/arb" commit -qam frys
rc="$(kor)"; r="$(rad 2)"
case "$r" in *ODÖMBART*FRYST_EJ_REGISTRERAD*) ok "H2 fryst, oregistrerad h-014 → ODÖMBART (gul), rc=$rc" ;; *) fel "H2" "$r" ;; esac
sed 's/\x1b\[[0-9;]*m//g' "$T/ut.txt" | grep -qE '⇒ .*KERNEL_COMPLETE' && fel "H2b" "KERNEL_COMPLETE dömdes" || ok "H2b ingen KERNEL_COMPLETE-dom (rubriken räknas inte)"
# H3 (+) registrerad, kör grönt med utdata, --kor-grindar → UPPFYLLT
bygg h-001; printf '#!/usr/bin/env bash\necho ok\nexit 0\n' > "$T/arb/verify/bin/h-014-exit"; register "$T/arb" h-001 h-014; git -C "$T/arb" commit -qam frys
rc="$(kor --kor-grindar)"; r="$(rad 2)"
case "$r" in *UPPFYLLT*PASS\(0\)*) ok "H3 registrerad grön h-014 med --kor-grindar → UPPFYLLT PASS(0)" ;; *) fel "H3" "$r" ;; esac
grep -q 'h-001:PASS(0)' "$T/ut.txt" && ok "H3b RAD: bär h-001:PASS(0) via cli" || fel "H3b" "$(grep RAD: "$T/ut.txt")"
# H4 körda: FAIL(1), ODÖMBART(2), KRASCH→VAGRAN(3), PASS utan utdata → ingen grön
bygg h-001 h-013 h-016 h-017; printf '#!/usr/bin/env bash\nexit 0\n' > "$T/arb/verify/bin/h-014-exit"; register "$T/arb" h-001 h-013 h-016 h-017 h-014; git -C "$T/arb" commit -qam frys
rc="$(kor --kor-grindar)"; R="$(grep 'RAD:' "$T/ut.txt")"
case "$R" in *"h-013:FAIL(1)"*) ok "H4a FAIL(1) bokförs som FAIL" ;; *) fel "H4a" "$R" ;; esac
case "$R" in *"h-016:ODOMBART(2)"*) ok "H4b exit 2 bokförs som ODOMBART" ;; *) fel "H4b" "$R" ;; esac
case "$R" in *"h-017:VAGRAN(3)"*) ok "H4c exec /nonexistent → cli vägran (3), aldrig grön" ;; *) fel "H4c" "$R" ;; esac
r="$(rad 2)"; case "$r" in *PASS_UTAN_UTDATA*) ok "H4d PASS utan utdata → gul, aldrig UPPFYLLT" ;; *) fel "H4d" "$r" ;; esac
[ "$rc" = 1 ] && ok "H4e aggregat: rött finns → exit 1" || fel "H4e" "rc=$rc"
# H5 hashdrift: registrerad grind ändrad efter registrering → MISSBUNDEN (cli exit 4)
bygg h-001; printf '#!/usr/bin/env bash\necho ok\nexit 0\n' > "$T/arb/verify/bin/h-014-exit"; register "$T/arb" h-001 h-014; git -C "$T/arb" commit -qam frys
printf '#!/usr/bin/env bash\necho ANDRAD\nexit 0\n' > "$T/arb/verify/bin/h-014-exit"; git -C "$T/arb" commit -qam drift
rc="$(kor --kor-grindar)"; r="$(rad 2)"
case "$r" in *MISSBUNDEN*) ok "H5 hashdrift → MISSBUNDEN, rc=$rc" ;; *) fel "H5" "$r" ;; esac
# H6 slutningen ur specen: h-030 saknas → NEJ med 'SAKNAS I SPEC'; lägg till h-030 (beror på h-017) → h-017 i RAD utan liständring
bygg h-001; rc="$(kor)"; r="$(rad 1)"
case "$r" in *"h-030 SAKNAS I SPEC"*) ok "H6a saknat id i slutningen → SAKNAS I SPEC" ;; *) fel "H6a" "$r" ;; esac
/usr/bin/python3 - "$T/arb/specs/tasks.spec.json" <<'PY'
import json,sys; p=sys.argv[1]; d=json.load(open(p)); d["tasks"].append({"id":"h-030","depends_on":["h-017"],"exit_test":"verify/bin/h-030-exit"}); json.dump(d,open(p,"w"))
PY
git -C "$T/arb" commit -qam h030; rc="$(kor)"; R="$(grep 'RAD:' "$T/ut.txt")"
case "$R" in *"h-017:"*"h-030:GRIND_SAKNAS"*|*"h-030:GRIND_SAKNAS"*"h-017:"*) ok "H6b h-030 i specen → h-017 och h-030 i slutningen utan liständring" ;; *) fel "H6b" "$R" ;; esac
# H7 fel plattform med --kor-grindar → ODÖMBART, exit 2
bygg h-001; register "$T/arb" h-001; git -C "$T/arb" commit -qam reg >/dev/null 2>&1; rc="$(PROV_UNAME_S=Linux kor --kor-grindar)"; R="$(grep 'RAD:' "$T/ut.txt")"
case "$R" in *"h-001:PLATTFORM_ODOMBART"*) ok "H7 Linux + --kor-grindar → registrerad grind PLATTFORM_ODOMBART, aldrig körd/grön (rc=$rc)" ;; *) fel "H7" "$R" ;; esac
# H8 autopush: stale hookkopia → röd SKILJER; identisk → grön
bygg h-001; mkdir -p "$HOME/hooks"; printf '#!/usr/bin/env bash\nexit 0\n# gammal\n' > "$HOME/hooks/post-commit"; chmod +x "$HOME/hooks/post-commit"; git -C "$T/arb" config core.hooksPath "$HOME/hooks"
kor >/dev/null; grep -q 'SKILJER' "$T/ut.txt" && ok "H8a stale hookkopia → SKILJER (röd)" || fel "H8a" "$(grep autopush "$T/ut.txt")"
cp "$T/arb/.githooks/post-commit" "$HOME/hooks/post-commit"; kor >/dev/null; grep -q 'hooken identisk' "$T/ut.txt" && ok "H8b identisk hook → grön" || fel "H8b" "$(grep autopush "$T/ut.txt")"
# H9 hookvakt saknas i installerad hook + --kor-grindar → grindkörning STOPPAD (ODÖMBART), inga grindar körda
bygg h-001; register "$T/arb" h-001; git -C "$T/arb" commit -qam reg >/dev/null 2>&1; git -C "$T/arb" config core.hooksPath "$HOME/hooks"; printf '#!/usr/bin/env bash\nexit 0\n# utan vakt\n' > "$HOME/hooks/post-commit"
rc="$(kor --kor-grindar)"; r="$(rad 1)"
case "$r" in *"grindkörning stoppad"*) ok "H9 hook utan vakterna + --kor-grindar → stoppad, rc=$rc" ;; *) fel "H9" "$r" ;; esac
echo; echo "$PASS gröna · $FAIL röda"; [ "$FAIL" = 0 ] && exit 0 || exit 1
