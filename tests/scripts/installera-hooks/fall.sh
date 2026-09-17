#!/usr/bin/env bash
# fall.sh — prov för scripts/installera-hooks.sh (regel 12a).
#
# Bygger ett eget engångs-$HOME med flera kloner av två skilda origin. Rör ALDRIG
# den riktiga maskinen — men INTE av det skäl som först stod här.
#
# Första versionen påstod att installeraren "härleder BÅDE sökroten och hookhemmet
# ur $HOME". Fel: `ROT` kommer från `git rev-parse --show-toplevel` (installeraren
# rad 31), alltså ur CWD, och K9 cd:ar själv utanför $HOME för att visa det.
# Sandlådan håller ändå, av två andra skäl: scanningen utgår från `find "$HOME"`
# (rad 109) och varje träff filtreras på `remote get-url origin` (rad 75), så en
# klon av ett annat repo rörs aldrig — vilket K4 prövar. Rättat 2026-09-17 efter
# granskningens FYND 8; det angivna skälet stämde inte, slutsatsen gjorde det.
#
# Når aldrig nätet, kräver ingen sudo. Bash 3.2-säkert (macOS systembash).
#
#     bash tests/scripts/installera-hooks/fall.sh
#     exit 0 = alla fall gröna · exit 1 = minst ett föll · exit 2 = ODÖMBART
#
# VARFÖR PROVET FINNS. `check-provanropare.mjs` fällde installeraren 2026-09-17 som
# "byggt, kanske granskat, men aldrig testat" — och hade rätt: skriptet skrevs kvällen
# innan, mergades till main, och ingenting i repot körde det. Det är samma felklass som
# kvällen bestod av: en mekanism som SER ut att finnas. Att den dessutom låg röd på main
# i 9 h 37 min utan att någon märkte det är skälet till att PR-granskningen
# automatiseras i samma commit. (Talet stod först som "ett dygn", sedan "9 h 32 min" —
# andra granskningen mätte om: installeraren mergades i PR #242 2026-09-16T20:33:06Z,
# rättad 2026-09-17T06:10:19Z. Argumentet höll, talet gjorde det inte, två gånger.)
#
# VAD PROVET INTE PRÖVAR. Inte att en post-commit-hook faktiskt pushar — det är
# .githooks/post-commit:s ansvar, inte installerarens. Här prövas bara att rätt
# kloner får rätt core.hooksPath, att fel kloner inte rörs, och att torrkörningen
# är sann både om vad den ändrar och om vad som redan är installerat (regel 8a:
# provet dömer den yta det läser).
#
# DE NIO PRÖVADE MUTATIONERNA, uppräknade. Talet "åtta av nio dödade" stod tidigare
# utan att de nio fanns någonstans — ett tal ingen kunde pröva, alltså ett påstående
# och inte en mätning (andra granskningen, icke-blockerande). Uppräknade i stället:
#
#   1. `-maxdepth 6` → `4`                        → K3b
#   2. `cmp -s ...` → `true` (torrläget ljuger)   → K5b
#   3. `HOOKHEM` → `$ROT/.githooks`               → K3, K3b, K5, K5b, K6
#   4. `""|--torr)` → `"")`                       → K1b
#   5. torrläget skriver ändå (`LAGE="kor"`)      → K2
#   6. origin-jämförelsen borttagen               → K4
#   7. ODÖMBART-spärren (rad 34) borttagen        → K8b
#   8. `--av` gör ingenting                       → K7
#   9. `SEDDA`-dedupliceringen borttagen          → ÖVERLEVER
#
# KÄND LUCKA (nr 9): `SEDDA`-dedupliceringen (installeraren rad 72) kan tas bort utan
# att något fall faller. Sannolikt en likvärdig mutant — att sätta samma
# `core.hooksPath` två gånger i samma git-dir är idempotent — men provet BEVISAR inte
# det, det missar det. Dedupliceringen finns för utdatans skull, och utdata prövas
# inte här.
#
# En oberoende granskare prövade en EGEN uppsättning om nio och fick 7/9; dess andra
# överlevare var `chmod +x` struket ur installeraren rad 50. Även den sannolikt
# likvärdig (`.githooks/post-commit` är `100755` och `cp` bevarar läget) — men samma
# sak gäller: provet bevisar det inte.

set -u
ROT_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SKRIPT="$ROT_REPO/scripts/installera-hooks.sh"
[ -f "$SKRIPT" ] || { echo "ODÖMBART: hittar inte $SKRIPT"; exit 2; }

pass=0; fail=0
ok()  { echo "PASS  $1"; pass=$((pass+1)); }
nej() { echo "FAIL  $1"; fail=$((fail+1)); }

T="$(mktemp -d)"
trap 'rm -rf "$T"' EXIT
export HOME="$T/hem"
mkdir -p "$HOME"
HOOKHEM="$HOME/.nortropic/githooks"

# Två origin: A (vårt) och B (någon annans). Installeraren får aldrig röra B.
git init -q --bare "$T/fjarrA"
git init -q --bare "$T/fjarrB"

bygg_klon() { # <katalog> <bare-remote>
  git clone -q "$2" "$1" 2>/dev/null
  git -C "$1" config user.email prov@nortropic.test
  git -C "$1" config user.name "Prov"
}

bygg_klon "$HOME/kontroll" "$T/fjarrA"
mkdir -p "$HOME/kontroll/.githooks"
printf '#!/usr/bin/env bash\n# provhook\n' > "$HOME/kontroll/.githooks/post-commit"
chmod +x "$HOME/kontroll/.githooks/post-commit"
git -C "$HOME/kontroll" add -f .githooks/post-commit >/dev/null 2>&1
git -C "$HOME/kontroll" commit -q -m bas
git -C "$HOME/kontroll" push -q -u origin HEAD 2>/dev/null

# En andra klon av SAMMA origin, utan .githooks/ i trädet — exakt läget på maskinen
# 2026-09-16: 60 av 61 kloner saknade katalogen. Den ska ändå få hooksPath, och den
# ska peka på hookhemmet, aldrig på kontrollklonens katalog.
bygg_klon "$HOME/annan/klon2" "$T/fjarrA"
# En klon av ett FRÄMMANDE origin.
bygg_klon "$HOME/frammande" "$T/fjarrB"

# En klon på DJUP 6 räknat från $HOME. Den finns för att provet annars inte kan
# fälla den senaste lagningen av installeraren: commit baaaea5 höjde scandjupet
# 4 → 6 efter att ägaren hittat ett git-repo på djup 4 som varje scan missade.
# Utan den här klonen överlever mutationen `-maxdepth 6` → `-maxdepth 4` hela
# provet — mätt, och rapporterat som FYND 1 av granskningen av den PR som införde
# provet. Ett prov som inte fäller den senast lagade buggen i filen det prövar
# skyddar inte mot en regress; det beskriver bara dagens beteende.
bygg_klon "$HOME/a/b/c/d/djup" "$T/fjarrA"

hooksPath() { git -C "$1" config --get core.hooksPath 2>/dev/null || true; }

# ── K1: okänt argument → exit 2, ingenting rört ──────────────────────────────
cd "$HOME/kontroll" || exit 2
UT="$(bash "$SKRIPT" --gaffel 2>&1)"; K=$?
if [ "$K" = "2" ] && printf '%s' "$UT" | grep -q "okänt argument"; then
  ok "K1 okänt argument vägras (exit 2)"
else
  nej "K1 okänt argument — fick exit=$K [$UT]"
fi

# ── K1b: `--torr` är ett DOKUMENTERAT gränssnitt och måste fungera ───────────
# Installerarens eget huvud lär ut `--torr`. Stryks raden ur dess `case` faller
# flaggan igenom till "okänt argument" och exit 2 — en tyst gränssnittsregress som
# inget annat fall märker, eftersom alla andra torrkörningar här anropas utan flagga.
UT="$(bash "$SKRIPT" --torr 2>&1)"; K=$?
if [ "$K" = "0" ] && printf '%s' "$UT" | grep -q "läge:    torr"; then
  ok "K1b --torr accepteras och ger torrläge"
else
  nej "K1b --torr gav exit=$K [$UT]"
fi

# ── K2: torrkörning ÄNDRAR INGENTING ─────────────────────────────────────────
# Det farligaste ett torrläge kan göra är att ljuga. Provet läser efteråt, inte
# utdatan: ingen hooksPath satt i någon klon, inget hookhem skapat.
UT="$(bash "$SKRIPT" 2>&1)"; K=$?
if [ "$K" = "0" ] \
   && [ -z "$(hooksPath "$HOME/kontroll")" ] \
   && [ -z "$(hooksPath "$HOME/annan/klon2")" ] \
   && [ ! -e "$HOOKHEM/post-commit" ] \
   && printf '%s' "$UT" | grep -q "skulle sätta"; then
  ok "K2 torrkörning ändrar ingen config och skapar inget hookhem"
else
  nej "K2 torrkörning ändrade något — exit=$K hooksPath='$(hooksPath "$HOME/kontroll")' [$UT]"
fi

# ── K3: --kor sätter BÅDA klonerna av samma origin ───────────────────────────
UT="$(bash "$SKRIPT" --kor 2>&1)"; K=$?
if [ "$K" = "0" ] \
   && [ "$(hooksPath "$HOME/kontroll")" = "$HOOKHEM" ] \
   && [ "$(hooksPath "$HOME/annan/klon2")" = "$HOOKHEM" ]; then
  ok "K3 --kor sätter core.hooksPath i båda klonerna av samma origin"
else
  nej "K3 --kor nådde inte båda — exit=$K kontroll='$(hooksPath "$HOME/kontroll")' klon2='$(hooksPath "$HOME/annan/klon2")' [$UT]"
fi

# ── K3b: klonen på DJUP 6 nås också ──────────────────────────────────────────
# Egen rad, inte en tredje term i K3: fälls den här vill jag läsa "scandjupet",
# inte "nådde inte båda". En sammanslagen kontroll säger vilket fall som föll,
# aldrig varför.
if [ "$(hooksPath "$HOME/a/b/c/d/djup")" = "$HOOKHEM" ]; then
  ok "K3b klonen på djup 6 nås (scandjupet, commit baaaea5)"
else
  nej "K3b klonen på djup 6 missades — scandjupet är för smalt, exakt buggen baaaea5 lagade"
fi

# ── K4: främmande origin rörs ALDRIG ─────────────────────────────────────────
if [ -z "$(hooksPath "$HOME/frammande")" ]; then
  ok "K4 klon av främmande origin lämnas orörd"
else
  nej "K4 främmande origin fick hooksPath='$(hooksPath "$HOME/frammande")'"
fi

# ── K5: hooken i hookhemmet är INNEHÅLLSIDENTISK med repots ──────────────────
# Att filen FINNS är inte samma sak som att den är rätt fil. Kvällens genomgående
# fel var att pröva vad utdata säger i stället för vad mekanismen gör.
if [ -x "$HOOKHEM/post-commit" ] \
   && cmp -s "$HOME/kontroll/.githooks/post-commit" "$HOOKHEM/post-commit"; then
  ok "K5 hooken kopierad till hookhemmet, körbar och innehållsidentisk"
else
  nej "K5 hooken i $HOOKHEM saknas, är inte körbar eller skiljer sig från repots"
fi

# ── K5b: torrläget säger sant om vad som REDAN är installerat ────────────────
# Installeraren rad 56–63 rapporterar "redan installerad och identisk med repots"
# eller "SKILJER från repots". Den grenen nåddes aldrig av något fall: K2 kör före
# --kor, så hookhemmet fanns inte, och K8 avbryter tidigare. Mutationen
# `cmp -s ...` → `true` överlevde därför hela provet — den låter torrläget påstå
# att en FÖRÅLDRAD hook är identisk, alltså precis den falska framgång mekanismen
# finns emot. FYND 1 i granskningen av den PR som införde provet.
printf '#!/usr/bin/env bash\n# provhook, ÄNDRAD\n' > "$HOME/kontroll/.githooks/post-commit"
UT="$(bash "$SKRIPT" 2>&1)"; K=$?
if [ "$K" = "0" ] && printf '%s' "$UT" | grep -q "SKILJER"; then
  ok "K5b torrläget ser att hookhemmet är föråldrat"
else
  nej "K5b torrläget sa inte SKILJER om en ändrad hook — exit=$K [$UT]"
fi

# ── K6: hookhemmet ÖVERLEVER att klonen försvinner ───────────────────────────
# Detta är den egenskap hela rättelsen handlar om, och den prövas nu direkt.
#
# Första formen jämförde i stället en sökväg med ett par mönster — och det fallet
# var DEKORATION: K3 kräver redan `SATT = $HOOKHEM`, så K6 kunde per konstruktion
# aldrig falla när K3 passerade (K6 ⊆ K3, belagt i granskningens FYND 2). Mutationen
# som flyttade hookhemmet in i klonens träd fälldes av K3 och K5, aldrig av K6.
#
# Nu raderas kontrollklonens `.githooks/` helt, och kravet är att den sökväg
# installeraren SATTE fortfarande bär en körbar hook.
#
# ⚠️ K6 ÄGER INTE DEN EGENSKAPEN ENSAM, och här stod tidigare att det gjorde det —
# *"inget annat fall märker det"*. Mätt: mutationen som flyttar hookhemmet in i
# klonens träd fäller **K3, K3b, K5, K5b OCH K6**, alltså fyra andra fall. Påståendet
# var ett obelagt anspråk om ett provs skärpa — exakt samma felklass som fallet självt
# infördes för att rätta, en nivå upp. Rättat efter andra granskningen, FYND F4.
#
# Det K6 FAKTISKT äger ensam är ett DINGLANDE hookhem: en sökväg som var giltig när
# den sattes men inte längre bär en körbar hook. Det är den formen av tyst död de 60
# repona hade riskerat, och det är det fallet prövar.
SATT="$(hooksPath "$HOME/annan/klon2")"
rm -rf "$HOME/kontroll/.githooks"
if [ -z "$SATT" ]; then
  nej "K6 ingen hooksPath satt att döma — kunde inte mätas"
elif [ -x "$SATT/post-commit" ]; then
  ok "K6 hooken i $SATT överlever att klonens .githooks raderas"
else
  nej "K6 hooksPath=$SATT bär ingen körbar hook sedan klonens .githooks raderats — autopushen dör tyst"
fi
# Återställd för K7/K8, som båda passerar installerarens ODÖMBART-spärr på rad 34.
mkdir -p "$HOME/kontroll/.githooks"
printf '#!/usr/bin/env bash\n# provhook\n' > "$HOME/kontroll/.githooks/post-commit"
chmod +x "$HOME/kontroll/.githooks/post-commit"

# ── K7: --av tar bort den igen, i båda ───────────────────────────────────────
UT="$(bash "$SKRIPT" --av 2>&1)"; K=$?
if [ "$K" = "0" ] \
   && [ -z "$(hooksPath "$HOME/kontroll")" ] \
   && [ -z "$(hooksPath "$HOME/annan/klon2")" ]; then
  ok "K7 --av tar bort core.hooksPath i båda klonerna"
else
  nej "K7 --av lämnade kvar config — exit=$K kontroll='$(hooksPath "$HOME/kontroll")' [$UT]"
fi

# ── K8: saknad hook i trädet → ODÖMBART, aldrig tyst framgång ────────────────
# Detta är spärren som 2026-09-16 fällde att .gitignore-vitlistan hade svalt
# .githooks/post-commit. Faller den bort blir ett tomt repo "installerat".
rm -f "$HOME/kontroll/.githooks/post-commit"
UT="$(bash "$SKRIPT" --kor 2>&1)"; K=$?
if [ "$K" = "2" ] && printf '%s' "$UT" | grep -q "ODÖMBART"; then
  ok "K8a saknad .githooks/post-commit ger ODÖMBART vid --kor"
else
  nej "K8a saknad hook vid --kor gav exit=$K [$UT]"
fi

# ── K8b: samma sak i TORRLÄGET ───────────────────────────────────────────────
# Fallet tillkom för att mutationsprovet visade att K8a ensam överlever att spärren
# tas bort: `cp` faller ändå i --kor. I torrläget finns ingen sådan andra linje —
# utan spärren rapporterar en klon UTAN hook glatt "skulle sätta 61 repon". Det är
# precis den falska framgång hela mekanismen finns för att hindra.
UT="$(bash "$SKRIPT" 2>&1)"; K=$?
if [ "$K" = "2" ] && printf '%s' "$UT" | grep -q "ODÖMBART"; then
  ok "K8b saknad .githooks/post-commit ger ODÖMBART även i torrläget"
else
  nej "K8b torrläget rapporterade utan hook i trädet — exit=$K [$UT]"
fi

# ── K9: utanför ett git-repo → vägran ────────────────────────────────────────
mkdir -p "$T/utanfor"
cd "$T/utanfor" || exit 2
UT="$(bash "$SKRIPT" 2>&1)"; K=$?
if [ "$K" = "2" ]; then
  ok "K9 körning utanför ett git-repo vägras (exit 2)"
else
  nej "K9 utanför repo gav exit=$K [$UT]"
fi

echo
echo "RESULTAT: $pass gröna · $fail fällda"
[ "$fail" -gt 0 ] && exit 1
exit 0
