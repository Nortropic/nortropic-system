#!/bin/sh
# FOUNDATION SMOKE — mekaniska kontroller (KANDIDAT, §A6; enda konsument: FOUNDATION_REPAIR_GATE)
# Verdiktalgebra per verify/bin/_lib.sh-disciplinen: exit 0=PASS, 1=FAIL, 2=ODÖMBART.
# Ankarkrav (V4-läxan): en tom grep-träff är PASS endast om ankaret först bevisats existera.
set -u
fail() { echo "FAIL: $1"; exit 1; }
odombar() { echo "ODÖMBART: $1"; exit 2; }

# ---- K1: repo-nativ rotupplösning + identitetsverifiering --------------------
ROT=$(git rev-parse --show-toplevel 2>/dev/null) || odombar "K1: ingen git-topp — körning utanför repo vägras (aldrig gissad rot)"
ORIGIN=$(git -C "$ROT" remote get-url origin 2>/dev/null) || odombar "K1: origin saknas"
case "$ORIGIN" in
  *Nortropic/nortropic-system*) : ;;
  *) fail "K1: origin är '$ORIGIN' — inte Nortropic/nortropic-system (identitet före konsumtion)" ;;
esac
[ -f "$ROT/docs/07-konstitution.md" ] || fail "K1: ankarfil docs/07-konstitution.md saknas i ROT"
[ -f "$ROT/AUTOPILOT" ] || fail "K1: ankarfil AUTOPILOT saknas i ROT"
echo "K1 PASS: ROT=$ROT identitetsverifierad"

# ---- K2: doctorn är repo-nativt ompekad (inga install-rot-ankare kvar) -------
STEW="$ROT/agents/nortropic-steward.md"
grep -q "ROTUPPLÖSNING" "$STEW" || fail "K2: ROTUPPLÖSNING-proceduren saknas i stewarden (ankarkrav)"
# Install-rot-ankare = git/ls/wc-kommandon mot ~/.claude som REPO-yta. Harness-minnesytan
# (~/.claude/agent-memory, uttryckligen harness-förvaltad) är legitim och undantas.
if grep -n 'git -C ~/.claude\|ls ~/.claude/skills\|~/.claude/tests\|~/.claude/workflows\|~/.claude/AUTOPILOT' "$STEW" >/dev/null 2>&1; then
  fail "K2: install-rot-ankare kvar i doctorn"
fi
echo "K2 PASS: doctorn repo-nativ (harness-minnesytan legitimt undantagen)"

# ---- K3: mutable-main-hämtning inert (kvarantän eller pinnade bytes) ---------
WDG="$ROT/vendored-skills/web-design-guidelines/SKILL.md"
[ -f "$WDG" ] || fail "K3: web-design-guidelines saknas"
if grep -q "KVARANTÄN" "$WDG"; then
  grep -q 'raw.githubusercontent.com/[^ ]*@\?main\|Use WebFetch to retrieve' "$WDG" && fail "K3: kvarantänen innehåller kvarlevande hämtnings-instruktion"
  echo "K3 PASS: kvarantän inert (fullt innehåll återställs som pinnade bytes i R3)"
else
  grep -q 'raw.githubusercontent\|WebFetch' "$WDG" && fail "K3: efter R3 får ingen hämtnings-instruktion finnas"
  grep -q 'commit' "$ROT/vendored-skills/web-design-guidelines/VENDORED.md" || fail "K3: R3-innehåll utan pinnad commit-proveniens"
  echo "K3 PASS: pinnade bytes med proveniens"
fi

# ---- K4: impeccable kan inte självuppdatera ---------------------------------
IMP="$ROT/vendored-skills/impeccable/SKILL.md"
CTX="$ROT/vendored-skills/impeccable/scripts/context.mjs"
grep -q 'npx impeccable' "$IMP" && fail "K4: förauktoriserad självuppdatering återinförd i frontmattern"
grep -q "STEP-0A CONTAINMENT" "$CTX" || fail "K4: uppdaterings-guarden saknas i context.mjs (ankarkrav)"
awk '/fetchLatestSkillVersion/,/^}/' "$CTX" | grep -q 'return null' || fail "K4: fetchLatestSkillVersion returnerar inte null först"
echo "K4 PASS: självuppdateringsvägen neutraliserad"

# ---- K5b: drift-kanari — inga mutable-fetch-instruktioner i skill-kroppar ----
# Ankarkrav: kanarin kräver att minst en skill-fil lästes.
ANTAL=$(find "$ROT/skills" "$ROT/vendored-skills" -name 'SKILL.md' | wc -l | tr -d ' ')
[ "$ANTAL" -ge 10 ] || odombar "K5b: bara $ANTAL SKILL.md hittades — ytan oläst"
TRAFF=$(grep -l 'raw.githubusercontent.com' "$ROT"/skills/*/SKILL.md "$ROT"/vendored-skills/*/SKILL.md 2>/dev/null | while read -r f; do
  grep -q "KVARANTÄN" "$f" || echo "$f"
done)
[ -n "$TRAFF" ] && fail "K5b: mutable-fetch-instruktion utanför kvarantän: $TRAFF"
echo "K5b PASS: $ANTAL skill-filer kanari-rena"

# ---- K5c: NY_REGIM_KLIPPT-flaggan kan inte ge grönt på tomhet ---------------
VS="$ROT/workflows/nortropic-verify-suite.js"
grep -q "NY_REGIM_KLIPPT = false" "$VS" && { echo "K5c PASS: regimen oklippt och suiten kortsluter till icke-grönt"; exit 0; }
grep -q "NY_REGIM_KLIPPT = true" "$VS" || odombar "K5c: flaggan oläsbar (ankarkrav)"
[ -f "$ROT/tests/fixtures/foundation/verktyg/package-lock.json" ] || fail "K5c: NY_REGIM_KLIPPT=true utan klippta verktyg — flaggan vänd utan människans klipp"
echo "K5c PASS: flagga och klipp konsistenta"
