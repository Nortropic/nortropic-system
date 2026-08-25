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
  # R3-läget: pinnade lokala bytes. Fyra mekaniska krav, alla fail-closed.
  grep -q 'raw.githubusercontent\|WebFetch\|@main\|curl \|wget \|latest' "$WDG" && fail "K3: efter R3 får ingen hämtnings-/latest-instruktion finnas i adaptern"
  REF="$ROT/vendored-skills/web-design-guidelines/references/upstream-command.md"
  VMD="$ROT/vendored-skills/web-design-guidelines/VENDORED.md"
  [ -s "$REF" ] || fail "K3: pinnade regelbytes saknas (references/upstream-command.md)"
  grep -q 'e3d624baaf29dc1fc645aff3e38f03e564d2d6b1' "$VMD" || fail "K3: VENDORED.md saknar den ägar-utpekade commit-SHA:n"
  VANTAD=$(sed -n 's/.*R3-PAYLOAD-SHA256: \([0-9a-f]\{64\}\).*/\1/p' "$VMD" | head -1)
  [ -n "$VANTAD" ] || fail "K3: VENDORED.md saknar R3-PAYLOAD-SHA256-ankare (ankarkrav)"
  FAKTISK=$(shasum -a 256 "$REF" | awk '{print $1}')
  [ "$FAKTISK" = "$VANTAD" ] || fail "K3: payloadbytes matchar inte registrerad hash ($FAKTISK != $VANTAD)"
  echo "K3 PASS: pinnade bytes @ e3d624ba med verifierad payloadhash + proveniens"
fi

# ---- K4: impeccable är en frusen lokal fork utan själv-/auto-auktoritet -----
IMP="$ROT/vendored-skills/impeccable/SKILL.md"
CTX="$ROT/vendored-skills/impeccable/scripts/context.mjs"
DUR="$ROT/vendored-skills/impeccable/scripts/detector/engines/browser/detect-url.mjs"
LIV="$ROT/vendored-skills/impeccable/scripts/live-inject.mjs"
grep -q 'npx impeccable' "$IMP" && fail "K4: förauktoriserad självuppdatering återinförd i frontmattern"
grep -q 'LOCAL_NORTROPIC_FORK' "$IMP" || fail "K4: fork-identiteten saknas i SKILL.md (ankarkrav)"
grep -q 'R4 FORK-AND-FREEZE' "$CTX" || fail "K4: R4-markören saknas i context.mjs (ankarkrav)"
grep -q 'impeccable\.style\|UPDATE_AVAILABLE\|UPDATE_HOST\|npx impeccable update' "$CTX" && fail "K4: uppdateringsmaskineri återinfört i context.mjs"
grep -q 'out-of-band' "$DUR" || fail "K4: fail-closed-semantiken saknas i detect-url.mjs (ankarkrav)"
grep -q 'npm install' "$DUR" && fail "K4: beroende-installationsinstruktion återinförd i detect-url.mjs"
grep -q 'CSP_REQUIRES_EXPLICIT_DEV_AUTHORITY' "$LIV" || fail "K4: CSP-grinden saknas i live-inject.mjs (ankarkrav)"
grep -q 'appendOriginToDirective\|function patchCspMeta' "$LIV" && fail "K4: automatisk CSP-breddning återinförd i live-inject.mjs"
[ -f "$ROT/vendored-skills/impeccable/LICENSE" ] || fail "K4: Apache-licensen saknas i forken"
echo "K4 PASS: frusen lokal fork — inget uppdaterings-, beroende- eller CSP-självmandat"

# ---- K5a: kanonisk vendored-integritet (R5) — skyddad mätsticka + mätning ---
# Foundation-pinnarna binder mätstickan: payload + manifest + en eftergiven
# verifierare kan aldrig tyst tillverka grönt, för pinnarna här ändras endast
# i samma ägargranskade förtroende-transition som manifestet.
VVI="$ROT/scripts/verify-vendored-integrity.mjs"
VIM="$ROT/config/vendored-integrity.v1.json"
[ -f "$VVI" ] || fail "K5a: verifieraren saknas"
[ -f "$VIM" ] || fail "K5a: integritetsmanifestet saknas"
VVI_PIN="7d589d27ac86097682ae817b6b2801f994085accb9e170cf55a73fe48bb16626"
VIM_PIN="a9d0263524d2abb83d90c02cd424d0528aa4fa96408f1dbbbbb44a9c31390133"
[ "$(shasum -a 256 "$VVI" | awk '{print $1}')" = "$VVI_PIN" ] || fail "K5a: verifierarkällan avviker från foundation-pinnen — mätstickan ändrad utan skyddad transition"
[ "$(shasum -a 256 "$VIM" | awk '{print $1}')" = "$VIM_PIN" ] || fail "K5a: manifestet avviker från foundation-pinnen — mätstickan ändrad utan skyddad transition"
node "$VVI" >/dev/null 2>&1 || fail "K5a: kanonisk vendored-integritet icke-grön (kör verifieraren för detaljer)"
echo "K5a PASS: mätstickan pinnad och 9/9 kanoniska träd matchar manifestet"

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
