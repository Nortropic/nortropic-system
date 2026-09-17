#!/usr/bin/env bash
# fall.sh — prov för scripts/installera-hooks.sh (regel 12a).
#
# Bygger ett eget engångs-$HOME med flera kloner av två skilda origin. Rör ALDRIG
# den riktiga maskinen: installeraren härleder BÅDE sökroten och hookhemmet ur
# $HOME, så en överskriven HOME sandlådar den helt — och att den gör det är ett av
# fallen nedan, inte ett antagande. Når aldrig nätet, kräver ingen sudo.
# Bash 3.2-säkert (macOS systembash).
#
#     bash tests/scripts/installera-hooks/fall.sh
#     exit 0 = alla fall gröna · exit 1 = minst ett föll · exit 2 = ODÖMBART
#
# VARFÖR PROVET FINNS. `check-provanropare.mjs` fällde installeraren 2026-09-17 som
# "byggt, kanske granskat, men aldrig testat" — och hade rätt: skriptet skrevs kvällen
# innan, mergades till main, och ingenting i repot körde det. Det är samma felklass som
# kvällen bestod av: en mekanism som SER ut att finnas. Att den dessutom låg röd på main
# i ett dygn utan att någon märkte det är skälet till att PR-granskningen automatiseras
# i samma commit.
#
# VAD PROVET INTE PRÖVAR. Inte att en post-commit-hook faktiskt pushar — det är
# .githooks/post-commit:s ansvar, inte installerarens. Här prövas bara att rätt
# kloner får rätt core.hooksPath, att fel kloner inte rörs, och att torrkörningen
# är sann när den säger att den inte ändrar något (regel 8a: provet dömer den yta
# det läser).

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

hooksPath() { git -C "$1" config --get core.hooksPath 2>/dev/null || true; }

# ── K1: okänt argument → exit 2, ingenting rört ──────────────────────────────
cd "$HOME/kontroll" || exit 2
UT="$(bash "$SKRIPT" --gaffel 2>&1)"; K=$?
if [ "$K" = "2" ] && printf '%s' "$UT" | grep -q "okänt argument"; then
  ok "K1 okänt argument vägras (exit 2)"
else
  nej "K1 okänt argument — fick exit=$K [$UT]"
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

# ── K6: den SATTA sökvägen ligger utanför varje arbetsträd ───────────────────
# Första versionen lät varje klon peka på kontrollklonens katalog; raderas den
# slutar autopushen fungera i 60 repon utan ett ljud. Provet håller den rättelsen.
#
# Fallet läser vad installeraren FAKTISKT SATTE, inte provets egen $HOOKHEM.
# Första formen jämförde variabeln provet självt räknat fram — alltså ett GISSAT
# NAMN, inte mekanismens utfall — och överlevde därför mutationen som flyttade
# hookhemmet in i klonens träd. Samma fel som `smuts_sakrad` gjorde 2026-09-16.
SATT="$(hooksPath "$HOME/kontroll")"
if [ -z "$SATT" ]; then
  nej "K6 ingen hooksPath satt att döma — kunde inte mätas"
else
  case "$SATT" in
    "$HOME/kontroll"/*|"$HOME/annan/klon2"/*)
      nej "K6 den satta sökvägen ligger i ett arbetsträd: $SATT" ;;
    *) ok "K6 den satta sökvägen ($SATT) ligger utanför varje arbetsträd" ;;
  esac
fi

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
