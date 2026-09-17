#!/usr/bin/env bash
# tests/scripts/matning-pa-macen/fall.sh — AUD-10: kvalificerad (cli) vs diagnostisk (bash) körning, full
# utdata sparad, restkontroll på innehåll, aggregerad exitkod. Syntetisk klon med kopia av controller/verify/cli.
#   MATNING=<fil> GRINDLAGE=<fil> bash tests/scripts/matning-pa-macen/fall.sh
set -u
HAR="${HAR_REPO:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd -P)}"
MA="${MATNING:-$HAR/docs/loop/raddning/artefakter/matning-pa-macen.sh}"; GL="${GRINDLAGE:-$HAR/docs/loop/raddning/artefakter/_grindlage.sh}"
[ -f "$MA" ] && [ -f "$GL" ] || { echo "ODÖMBART: kandidat saknas"; exit 2; }
command -v python3.12 >/dev/null 2>&1 || { echo "ODÖMBART: python3.12 saknas"; exit 2; }
T="$(mktemp -d "${TMPDIR:-/tmp}/matning-fall.XXXXXX")"; export T; trap 'rm -rf "$T"' EXIT
export HOME="$T/hem"; mkdir -p "$HOME" "$T/bin"; export GIT_AUTHOR_NAME=Prov GIT_AUTHOR_EMAIL=p@x GIT_COMMITTER_NAME=Prov GIT_COMMITTER_EMAIL=p@x
export NORTROPIC_LOGG_KAT="$T/matningar"
git config --global init.defaultBranch main
cat > "$T/bin/uname" <<'U'
#!/usr/bin/env bash
if [ "${1:-}" = "-s" ]; then echo "${PROV_UNAME_S:-Darwin}"; else /usr/bin/uname "$@"; fi
U
chmod +x "$T/bin/uname"; export PATH="$T/bin:$PATH"
PASS=0; FAIL=0; ok() { PASS=$((PASS+1)); echo "  ✅ $1"; }; fel() { FAIL=$((FAIL+1)); echo "  ❌ $1 — $2"; }
sha() { shasum -a 256 "$1" | cut -c1-64; }
A="$T/arb"
register() { local body="" id; for id in "$@"; do body="$body$([ -n "$body" ] && echo ,)\"$id\":{\"path\":\"verify/bin/$id-exit\",\"sha256\":\"$(sha "$A/verify/bin/$id-exit")\",\"runner\":\"bash\",\"startbar\":true,\"beskrivning\":\"prov\"}"; done; printf '{"register_version":"1.0.0","verifiers":{%s}}\n' "$body" > "$A/controller/verify/register.json"; }
bygg() { # $1 = grindbeteende för h-001 ("pass" | "smutsar" | "langt")
  rm -rf "$T/origin.git" "$A"; git init -q --bare "$T/origin.git"; git init -q "$A"
  mkdir -p "$A/controller/verify" "$A/verify/bin" "$A/specs" "$A/docs/loop/raddning/artefakter"
  cp "$HAR/controller/verify/cli" "$A/controller/verify/cli"; chmod +x "$A/controller/verify/cli"
  cp "$MA" "$A/docs/loop/raddning/artefakter/matning-pa-macen.sh"; cp "$GL" "$A/docs/loop/raddning/artefakter/_grindlage.sh"
  printf '/*\n!/.gitignore\n!/controller/\n!/verify/\n!/specs/\n!/docs/\n' > "$A/.gitignore"
  case "${1:-pass}" in
    pass)    printf '#!/usr/bin/env bash\necho "1 PASS, 0 FAIL"\nexit 0\n' > "$A/verify/bin/h-001-exit" ;;
    smutsar) printf '#!/usr/bin/env bash\nrm -f rest-a.txt; echo ny > rest-b.txt\necho "1 PASS"\nexit 0\n' > "$A/verify/bin/h-001-exit" ;;
    langt)   printf '#!/usr/bin/env bash\nfor i in $(seq 1 100); do echo "rad $i"; done\necho "0 PASS, 1 FAIL"\nexit 1\n' > "$A/verify/bin/h-001-exit" ;;
  esac
  printf '#!/usr/bin/env bash\necho "1 PASS"\nexit 0\n' > "$A/verify/bin/h-002-exit"; chmod +x "$A"/verify/bin/*
  printf '{"tasks":[{"id":"h-001","depends_on":[],"exit_test":"verify/bin/h-001-exit"},{"id":"h-002","depends_on":[],"exit_test":"verify/bin/h-002-exit"},{"id":"h-015","depends_on":["h-001","h-002"],"exit_test":"verify/bin/h-015-exit"}]}\n' > "$A/specs/tasks.spec.json"
  register h-001 h-002
  git -C "$A" add -A >/dev/null; git -C "$A" commit -q -m bas; git -C "$A" remote add origin "$T/origin.git"; git -C "$A" push -q origin HEAD:main
}
kor() { ( cd "$A" && bash docs/loop/raddning/artefakter/matning-pa-macen.sh ) > "$T/ut.txt" 2>&1; echo $?; }
echo "matning-pa-macen.sh — fall"
# M3 (+): alla slutningens grindar registrerade och PASS, trädet orört → exit 0
bygg pass; rc="$(kor)"; grep -q 'h-001  exit=0   PASS·kval' "$T/ut.txt" && [ "$rc" = 0 ] && ok "M3 registrerade gröna grindar → PASS·kval, exit 0" || fel "M3" "rc=$rc $(grep -E 'h-001|SUMMA|OK|SMUTS' "$T/ut.txt" | head -3 | tr '\n' ' ')"
# M2: oregistrerad grind → PASS·diag, aldrig 0
bygg pass; register h-002; git -C "$A" commit -qam oreg; rc="$(kor)"; grep -q 'PASS·diag' "$T/ut.txt" && [ "$rc" = 2 ] && ok "M2 oregistrerad grind → PASS·diag (DIAGNOSTIK), exit 2" || fel "M2" "rc=$rc $(grep -E 'h-001|SUMMA' "$T/ut.txt" | head -2 | tr '\n' ' ')"
# M1 (T07): grinden tar bort en ignorerad fil och skapar en annan → lika antal, ändrat innehåll → SMUTSADE, exit 1
bygg smutsar; echo a > "$A/rest-a.txt"; rc="$(kor)"; grep -q 'SMUTSADE' "$T/ut.txt" && [ "$rc" = 1 ] && ok "M1 (T07) lika antal men andra sökvägar → SMUTSADE, exit 1" || fel "M1" "rc=$rc $(grep -E 'orört|SMUTS' "$T/ut.txt" | tr '\n' ' ')"
# M4: 100 rader utdata → hela i loggfilen, skärmen 'sista 40 rader'
bygg langt; rc="$(kor)"; L="$(ls -t "$T/matningar"/*/h-001.txt 2>/dev/null | head -1)"; n="$(grep -c '^rad ' "$L" 2>/dev/null)"
[ "${n:-0}" = 100 ] && grep -q 'sista 40 rader' "$T/ut.txt" && [ "$rc" = 1 ] && ok "M4 full utdata (100 rader) i loggfilen, skärmen visar 'sista 40 rader', FAIL → exit 1" || fel "M4" "rader=$n rc=$rc"
# M5 worktree-spärr oförändrad: kör i en länkad worktree → exit 2
bygg pass; git -C "$A" worktree add -q --detach "$T/wt" HEAD; ( cd "$T/wt" && bash docs/loop/raddning/artefakter/matning-pa-macen.sh ) > "$T/ut2.txt" 2>&1; rc=$?; [ "$rc" = 2 ] && ok "M5 länkad worktree → AVBRYTER, exit 2" || fel "M5" "rc=$rc"
echo; echo "$PASS gröna · $FAIL röda"; [ "$FAIL" = 0 ] && exit 0 || exit 1
