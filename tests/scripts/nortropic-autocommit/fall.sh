#!/usr/bin/env bash
# fall.sh — prov för scripts/nortropic-autocommit.sh (regel 12a).
#
# Bygger ett eget engångsrepo med en lokal bare-remote. Rör ALDRIG nortropic-system,
# når aldrig nätet, kräver ingen sudo. Bash 3.2-säkert (macOS systembash).
#
#     bash tests/scripts/nortropic-autocommit/fall.sh
#     exit 0 = alla fall gröna · exit 1 = minst ett föll
#
# Provet finns för att vakten `check-provanropare.mjs` fällde skriptet som
# "byggt, kanske granskat, men aldrig testat". Den hade rätt: proven kördes för
# hand 2026-09-16 och lades aldrig i repot, vilket gör dem osynliga för nästa
# session — regel 12:s felklass, en nivå upp.

set -u
SKRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)/scripts/nortropic-autocommit.sh"
[ -f "$SKRIPT" ] || { echo "ODÖMBART: hittar inte $SKRIPT"; exit 2; }

pass=0; fail=0
ok()  { echo "PASS  $1"; pass=$((pass+1)); }
nej() { echo "FAIL  $1"; fail=$((fail+1)); }

T="$(mktemp -d)"
trap 'rm -rf "$T"' EXIT
git init -q --bare "$T/fjarr"
git clone -q "$T/fjarr" "$T/arb" 2>/dev/null
cd "$T/arb" || exit 2
git config user.email prov@nortropic.test
git config user.name "Prov"
mkdir -p docs/loop specs scripts
echo bas > docs/loop/a.md
echo '{}' > specs/tasks.spec.json
echo '# bas' > CLAUDE.md
git add -A && git commit -q -m bas && git push -q -u origin HEAD 2>/dev/null

# ── K1: på main med okommitterat → STOPP, inget committat ────────────────────
echo nytt >> docs/loop/a.md
UT="$(bash "$SKRIPT" k1 2>&1)"; K=$?
if [ "$K" = "1" ] && printf '%s' "$UT" | grep -q "STOPP"; then
  ok "K1 bevarande vägrar på main (exit 1, STOPP)"
else
  nej "K1 bevarande vägrar på main — fick exit=$K [$UT]"
fi

# ── K2: arbetsgren, vanligt arbete → commit + push ───────────────────────────
git checkout -q -b nortropic/prov
FORE="$(git rev-list --count HEAD)"
UT="$(bash "$SKRIPT" k2 2>&1)"; K=$?
EFTER="$(git rev-list --count HEAD)"
if [ "$K" = "0" ] && [ "$EFTER" = "$((FORE+1))" ] && [ -z "$(git status --porcelain)" ] \
   && [ -z "$(git log --oneline @{u}..HEAD 2>/dev/null)" ]; then
  ok "K2 arbetsgren: en commit, arbetsträdet rent, inget opushat"
else
  nej "K2 arbetsgren — exit=$K commits $FORE→$EFTER [$UT]"
fi

# ── K3: inget att göra → tyst exit 0, ingen tom commit ───────────────────────
FORE="$(git rev-list --count HEAD)"
UT="$(bash "$SKRIPT" k3 2>&1)"; K=$?
EFTER="$(git rev-list --count HEAD)"
if [ "$K" = "0" ] && [ "$EFTER" = "$FORE" ] && [ -z "$UT" ]; then
  ok "K3 inget att göra: tyst exit 0, ingen tom commit"
else
  nej "K3 inget att göra — exit=$K commits $FORE→$EFTER utdata=[$UT]"
fi

# ── K4: §A hamnar i EGEN commit, vanligt i en annan ──────────────────────────
echo vanlig >> docs/loop/a.md
echo spec   >> specs/tasks.spec.json
echo regel  >> CLAUDE.md
bash "$SKRIPT" k4 >/dev/null 2>&1
AA="$(git log -1 --format=%s)"
AA_FILER="$(git show --stat --format="" HEAD | grep -cE 'CLAUDE.md|specs/')"
VANLIG_FILER="$(git show --stat --format="" HEAD~1 | grep -c 'docs/loop/a.md')"
AA_HAR_VANLIG="$(git show --stat --format="" HEAD | grep -c 'docs/loop/a.md')"
if printf '%s' "$AA" | grep -q "HÖGRISK-OGRANSKAD" && [ "$AA_FILER" = "2" ] \
   && [ "$VANLIG_FILER" = "1" ] && [ "$AA_HAR_VANLIG" = "0" ]; then
  ok "K4 §A i egen HÖGRISK-OGRANSKAD-commit, vanligt arbete i en annan"
else
  nej "K4 §A-delning — rubrik=[$AA] §A-filer=$AA_FILER vanlig=$VANLIG_FILER läckage=$AA_HAR_VANLIG"
fi

# ── K5: §A-commiten AUKTORISERAR inte — den säger det själv ──────────────────
if git log -1 --format=%B | grep -q "BEVARAD, INTE AUKTORISERAD"; then
  ok "K5 §A-commiten säger uttryckligen att den inte auktoriserar (regel 6 orörd)"
else
  nej "K5 §A-commiten saknar raden som skiljer bevarande från auktorisation"
fi

# ── K6: aldrig --force, merge, rebase eller amend i KODEN ────────────────────
# Kommentarrader strippas först. Första versionen gjorde det inte och fällde på
# skriptets EGNA kommentar "Aldrig --force, aldrig rebase, aldrig amend" — ett
# lexikalt prov som läste prosa och trodde sig läsa kod. Exakt den felklass
# provet finns för att fånga, gjord av provet självt (2026-09-16).
KOD="$(sed 's/#.*//' "$SKRIPT")"
if printf '%s' "$KOD" | grep -qE 'git +push[^|]*(--force|-f\b)|git +rebase|git +merge|commit +--amend|reset +--hard'; then
  nej "K6 KODEN innehåller en historieskrivande konstruktion"
else
  ok "K6 ingen --force, rebase, merge, amend eller reset --hard i koden"
fi

# ── K7: och provet i K6 fäller VERKLIGEN — mutationsprov ─────────────────────
MUT="$T/muterad.sh"
sed 's|git push \$SATT|git push --force $SATT|' "$SKRIPT" > "$MUT"
MUTKOD="$(sed 's/#.*//' "$MUT")"
if printf '%s' "$MUTKOD" | grep -qE 'git +push[^|]*(--force|-f\b)'; then
  ok "K7 mutationsprov: K6:s kontroll fäller när --force förs in"
else
  nej "K7 mutationsprov: K6:s kontroll MISSADE ett infört --force — den mäter ingenting"
fi

echo
echo "$pass PASS, $fail FAIL"
[ "$fail" = "0" ] || exit 1
exit 0
