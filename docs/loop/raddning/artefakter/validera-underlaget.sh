#!/usr/bin/env bash
# validera-underlaget.sh — mekanisk kontroll av varje bärande tal i räddningsunderlaget.
#
# Körs från reporoten i nortropic-system, på MACEN:
#     bash <underlagskatalog>/artefakter/validera-underlaget.sh
#
# Verdiktalgebra, samma som controller/verify/cli:
#     exit 0 = alla påståenden BEKRÄFTADE
#     exit 1 = minst ett AVVIKER   (underlaget bär ett fel — rätta källan, inte bara loggen)
#     exit 2 = minst ett ODÖMBART  (kunde inte mätas — ODÖMBART blir ALDRIG grönt)
#
# ⚠️ DETTA PROV RÄCKER INTE. Det återskapar underlagets EGNA kommandon och reproducerar
# därmed underlagets egna blinda fläckar. Nio av elva fel i detta projekt kom av en
# LEXIKAL metod, och ett grep som felar ger samma fel igen. Grönt här betyder "talen är
# desamma som när de skrevs", ALDRIG "påståendena är sanna".
# Den oberoende omhärledningen i 06-inventering.md §0 står kvar oförändrad.

set -u

# TVÅ SORTERS RADER (AUD-03, 2026-09-17). Underlagets tal beskriver DIAGNOSÖGONBLICKET —
# revisionen VAGEN.md §3 mättes på. De ska stämma DÄR, för alltid; att en leverans senare
# gör ett tal osant på HEAD är vägen som lyckas, inte underlaget som fallerar. Tidigare
# mätte provet allt mot HEAD och krävde att h-014-exit, h-015-exit och autonomous-loop-exit
# SAKNAS — så redo-for-codex.sh hade sagt INTE REDO exakt när FAS 4–7 blev klara.
#   HISTORISKA rader: mäts vid REV med git show/ls-tree/log, verdikt BEKRÄFTAT@rev / AVVIKER@rev.
#   OPERATIVA rader: mäts på det levande trädet, som förut.
# `--operativt` kör bara de operativa raderna (redo-for-codex.sh:s ingång) och hoppar även
# bundle/patch-raderna, som i repot är permanent ODÖMBART med avsikt.
REV="${VALIDERA_REV:-28ca1af}"
LAGE="allt"; [ "${1:-}" = "--operativt" ] && LAGE="operativt"
if git rev-parse -q --verify "$REV^{commit}" >/dev/null 2>&1; then REV_OK=1; else REV_OK=0; fi

avvik=0; odombart=0; bekraftat=0; hist_ok=0; hist_avvik=0; hist_od=0
UNDERLAG="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

rad() { # rad <påstående> <förväntat> <uppmätt>
  local p="$1" f="$2" u="$3" v
  if   [ "$u" = "ODÖMBART" ]; then v="ODÖMBART"; odombart=$((odombart+1))
  elif [ "$u" = "$f" ];      then v="BEKRÄFTAT"; bekraftat=$((bekraftat+1))
  else                            v="AVVIKER";  avvik=$((avvik+1)); fi
  printf "%-46s %-22s %-22s %s\n" "$p" "$f" "$u" "$v"
}

rad_hist() { # rad_hist <påstående> <förväntat vid REV> <uppmätt vid REV>
  [ "$LAGE" = "operativt" ] && return
  local p="$1" f="$2" u="$3" v
  if   [ "$REV_OK" != 1 ] || [ "$u" = "ODÖMBART" ]; then v="ODÖMBART@$REV"; hist_od=$((hist_od+1)); odombart=$((odombart+1))
  elif [ "$u" = "$f" ]; then v="BEKRÄFTAT@$REV"; hist_ok=$((hist_ok+1))
  else v="AVVIKER@$REV"; hist_avvik=$((hist_avvik+1)); fi
  printf "%-46s %-22s %-22s %s\n" "$p" "$f" "$u" "$v"
}
rev_finns() { git cat-file -e "$REV:$1" 2>/dev/null && echo FINNS || echo SAKNAS; }
rev_commits() { [ "$REV_OK" = 1 ] || { echo ODÖMBART; return; }; git cat-file -e "$REV:verify/bin/$1-exit" 2>/dev/null || { echo ODÖMBART; return; }; git log --oneline "$REV" --follow -- "verify/bin/$1-exit" 2>/dev/null | wc -l | tr -d ' '; }

matt() { # kör kommando; ODÖMBART om det inte går
  local out; out=$(eval "$1" 2>/dev/null) || { echo "ODÖMBART"; return; }
  [ -z "$out" ] && { echo "ODÖMBART"; return; }
  echo "$out"
}

gatecommits() { # antal commits som ändrat en gate-fil
  [ -f "verify/bin/$1-exit" ] || { echo "ODÖMBART"; return; }
  git log --oneline --follow -- "verify/bin/$1-exit" 2>/dev/null | wc -l | tr -d ' '
}

echo "VALIDERING AV RÄDDNINGSUNDERLAGET — $(date +%Y-%m-%d)"
echo "repo: $(git rev-parse --show-toplevel 2>/dev/null || echo OKÄNT)  HEAD: $(git rev-parse --short HEAD 2>/dev/null || echo OKÄNT)"
echo
printf "%-46s %-22s %-22s %s\n" PÅSTÅENDE FÖRVÄNTAT UPPMÄTT VERDIKT
printf '%.0s-' {1..108}; echo

# ── Grundförutsättning: full historik ────────────────────────────────────────
rad "klonen är INTE grund" "false" "$(matt 'git rev-parse --is-shallow-repository')"

# ── §1 Rundtrampen ───────────────────────────────────────────────────────────
rad "commits i historiken (>=825)" "JA" \
    "$(c=$(git log --oneline 2>/dev/null | wc -l | tr -d ' '); [ "${c:-0}" -ge 825 ] && echo JA || echo "NEJ($c)")"
# Pinnas som MONOTON TRÖSKEL, inte som exakt tal (rättat 2026-09-16, FYND 31c).
# Talet räknar commits i en växande logg: varje ny commit som nämner ett h-nummer höjer
# det, så ett exakt förväntat tal AVVIKER av att arbete sker. Det är samma felform som
# regel 11 förbjuder i en grind — provet band miljön i stället för egenskapen. Påståendet
# underlaget faktiskt gör är "minst 440 av 825, alltså över hälften", och den är monoton.
# Samma idiom som raden ovan om historikens längd.
rad "commits med H-nummer (>=440)" "JA" \
    "$(c=$(git log --format='%s' 2>/dev/null | grep -ciE 'h-?0[0-9]{2}'); [ "${c:-0}" -ge 440 ] && echo JA || echo "NEJ($c)")"
# Samma monotona tröskelform, och av samma skäl (FYND 31c). Raden räknar i en fil som
# växer, och den träffar BÅDE riktiga NO-CREDIT-verdikt OCH prosa som nämner termen —
# den commit som skrev FYND 31c fällde den omedelbart, 101 → 102. Underlagets påstående
# är "minst 101 produktlösa rundor", och den egenskapen är monoton.
rad "NO-CREDIT-rader i drift.md (>=101)" "JA" \
    "$(c=$(grep -c 'productless\|NO-CREDIT\|no product' docs/loop/drift.md 2>/dev/null); [ "${c:-0}" -ge 101 ] && echo JA || echo "NEJ($c)")"

# ── ⭐ Konvergensmätningen — underlagets tyngsta fynd ─────────────────────────
echo
echo "  ⭐ OMFRYSNINGAR PER GRIND — diskriminanten klar/icke-klar (01 §1, 02, 09 gren 2)"
# ⚠️ ETIKETTERNA RÄTTADE 2026-09-16 efter FYND 33. Här stod "(klar)" på alla sex.
# Körda på Macen i ren klon är h-016 (1 omfrysning) 11 PASS / 14 FAIL och h-013
# (2 omfrysningar) 8 PASS / 8 FAIL. Talen nedan är riktiga; etiketten var det inte.
# h-017, h-036 och h-038 ligger utanför h-015:s beroendeslutning och är INTE mätta
# — "ej mätt" är inte "klar", och att skriva det är regel 8.
# Historiska: omfrysningstalen vid diagnosrevisionen. (h-035/039/032/031 stod tidigare som
# "(pågår)" — de avslutades OVERIFIERAT 2026-09-16; etiketten är borta, talet är historiskt.)
rad_hist "h-016  [FAIL, mätt]"   "1"   "$(rev_commits h-016)"
rad_hist "h-013  [FAIL, mätt]"   "2"   "$(rev_commits h-013)"
rad_hist "h-017  [EJ MÄTT]"      "2"   "$(rev_commits h-017)"
rad_hist "h-038  [EJ MÄTT]"      "2"   "$(rev_commits h-038)"
rad_hist "h-001  [PASS, mätt]"   "3"   "$(rev_commits h-001)"
rad_hist "h-036  [EJ MÄTT]"      "3"   "$(rev_commits h-036)"
rad_hist "h-035  (avslutad OVERIFIERAT)" "17"  "$(rev_commits h-035)"
rad_hist "h-039  (avslutad OVERIFIERAT)" "30"  "$(rev_commits h-039)"
rad_hist "h-032  (avslutad OVERIFIERAT)" "120" "$(rev_commits h-032)"
rad_hist "h-031  (avslutad OVERIFIERAT)" "147" "$(rev_commits h-031)"
rad_hist "h-039-exit storlek (byte)" "2136969" \
    "$([ "$REV_OK" = 1 ] && git cat-file -s "$REV:verify/bin/h-039-exit" 2>/dev/null || echo ODÖMBART)"
# Strukturpåståendet, inte bara talet: växte grinden monotont (fram till REV)?
rad_hist "h-039-grinden minskade aldrig" "0 minskningar" \
    "$( [ "$REV_OK" = 1 ] && git log --reverse --format=%H "$REV" --follow -- verify/bin/h-039-exit 2>/dev/null \
        | while read -r c; do git cat-file -s "$(git rev-parse "$c:verify/bin/h-039-exit" 2>/dev/null)" 2>/dev/null; done \
        | awk 'NR>1&&$1<p{n++}{p=$1}END{print (n?n:0)" minskningar"}' || echo ODÖMBART)"
echo

# ── §2/§6 Luckorna i kedjan ──────────────────────────────────────────────────
# HISTORISKA vid REV: att dessa saknades var diagnosen. Att de senare FINNS är FAS 4–7
# som lyckas — en operativ startkontroll får aldrig kräva att leveransen saknas (AUD-03).
rad_hist "autonomous-loop-exit saknades vid REV" "SAKNAS" "$(rev_finns verify/bin/autonomous-loop-exit)"
rad_hist "filer i verify/bin/ vid REV" "29" "$([ "$REV_OK" = 1 ] && git ls-tree "$REV" verify/bin/ 2>/dev/null | wc -l | tr -d ' ' || echo ODÖMBART)"
rad_hist "h-014-exit saknades vid REV" "SAKNAS" "$(rev_finns verify/bin/h-014-exit)"
rad_hist "h-015-exit saknades vid REV" "SAKNAS" "$(rev_finns verify/bin/h-015-exit)"
rad_hist "h-030 fanns EJ i specen vid REV" "SAKNAS" \
    "$([ "$REV_OK" = 1 ] && git show "$REV:specs/tasks.spec.json" 2>/dev/null | python3 -c "import json,sys;d=json.load(sys.stdin);print('FINNS' if 'h-030' in [t['id'] for t in d['tasks']] else 'SAKNAS')" 2>/dev/null || echo ODÖMBART)"
rad "h-015 beror på h-030" "JA" \
    "$(matt "python3 -c \"import json;d=json.load(open('specs/tasks.spec.json'));print('JA' if any('h-030' in (t.get('depends_on') or []) for t in d['tasks'] if t['id']=='h-015') else 'NEJ')\"")"

# ── §5 Den cirkulära pinningen ───────────────────────────────────────────────
rad_hist "registret registrerade 2 webbfiler vid REV" "2" \
    "$([ "$REV_OK" = 1 ] && git show "$REV:controller/verify/register.json" 2>/dev/null | grep -cE 'scripts/check-invariants\.mjs|workflows/nortropic-verify-suite\.js' || echo ODÖMBART)"
# OBS: grep -c ger exit 1 vid NOLL träffar, och noll är det FÖRVÄNTADE svaret här.
# Utan '|| true' rapporterar provet ODÖMBART på ett korrekt påstående — ett prov som
# inte kan skilja "inga träffar" från "kunde inte mätas" mäter sin egen felhantering.
# grep -c SKRIVER antalet och returnerar ändå exit 1 vid noll träffar. Ett '|| echo 0'
# ger därför TVÅ rader ("0\n0") och fäller ett korrekt påstående. Fånga utdata i stället.
kmatt() { local n; [ -f "$2" ] || { echo ODÖMBART; return; }
          n=$(grep -ciE "$1" "$2" 2>/dev/null); echo "${n:-0}"; }
rad "07-konstitution kernelomnämnanden" "0" \
    "$(kmatt 'trust.?kernel|controller/|verify/bin|specs/tasks|exit_test' docs/07-konstitution.md)"
rad "03-regelverk kernelomnämnanden" "0" \
    "$(kmatt 'trust.?kernel|controller/|verify/bin|specs/tasks|exit_test' docs/03-regelverk.md)"

# ── Vaktsvitens räckvidd: 16 webb / 2 kärna / 1 båda / 4 inget ───────────────
rad_hist "scripts/check-*.mjs, antal vid REV" "23" "$([ "$REV_OK" = 1 ] && git ls-tree --name-only "$REV" scripts/ 2>/dev/null | grep -c 'scripts/check-.*\.mjs$' || echo ODÖMBART)"
rad_hist "vaktfördelning webb/kärna/båda/noll vid REV" "16/2/1/4" \
    "$(w=0;k=0;b=0;n=0
       [ "$REV_OK" = 1 ] || { echo ODÖMBART; exit 0; }
       for s in $(git ls-tree --name-only "$REV" scripts/ 2>/dev/null | grep 'scripts/check-.*\.mjs$'); do
         a=$(git show "$REV:$s" 2>/dev/null | grep -cE '(agents|skills|packs|workflows|backtests)/'); a=${a:-0}
         c=$(git show "$REV:$s" 2>/dev/null | grep -cE '(controller|verify|specs)/'); c=${c:-0}
         if [ "$a" -gt 0 ] && [ "$c" -gt 0 ]; then b=$((b+1))
         elif [ "$a" -gt 0 ]; then w=$((w+1))
         elif [ "$c" -gt 0 ]; then k=$((k+1))
         else n=$((n+1)); fi; done
       [ $((w+k+b+n)) -eq 0 ] && echo ODÖMBART || echo "$w/$k/$b/$n")"

# ── §0b BLANDADE kataloger ──────────────────────────────────────────────────
# ⚠️ ETIKETTEN RÄTTAD 2026-09-16 efter FYND 31b. Här stod "KÄRNA i scripts/" om
# alla fem. Tre av dem är ägardömda WEB / WEB_MOVE i
# SEPARATION-20260910/ALLOCATION.tsv och finns inte på plattformsgrenen:
# check-provanropare.mjs, kor-styrprov.mjs, kor-vakter.mjs. Kärnans i scripts/ är
# check-invariants.mjs, nortropic-codex-autopilot.py och
# check-verifierarregistret.mjs, enligt PLATFORM_EXACT i plattformsgrenens
# check-invariants.mjs — den mekanism som dömer.
# Kontrollen prövar ENBART att filen finns, aldrig vems den är.
echo
for f in scripts/nortropic-codex-autopilot.py scripts/check-provanropare.mjs \
         scripts/check-verifierarregistret.mjs scripts/kor-styrprov.mjs scripts/kor-vakter.mjs; do
  rad_hist "fanns i scripts/ vid REV: $(basename "$f")" "FINNS" "$(rev_finns "$f")"
done

# ── Dokumentationsrättelsen: fyra commits ────────────────────────────────────
echo
# Mäts som MÄNGD, inte som antal träffar (rättat 2026-09-16, FYND 31e).
# Kontrollen räknade tidigare rader ur `git log | grep -ciE '<fyra ord>'` och väntade sig
# exakt 4. Påståendet är "alla fyra dok-commitsen finns i historiken" — men ett ANTAL
# svarar på en annan fråga: hur många commit-RUBRIKER som råkar innehålla något av orden.
# Commiten som rättade vaktklassificeringen bar ordet "vaktklassificeringen" i sin rubrik
# och gav 5. Samma felform som FYND 31b: identitet prövad lexikalt. Nu prövas varje
# mönster för sig och det är ANTALET UPPFYLLDA MÖNSTER som räknas — stabilt oavsett hur
# många senare commits som nämner samma ord.
rad "alla 4 dok-commitsen finns (mängd)" "4/4" \
    "$(n=0; for m in 'repots identitet' 'lageretiketten' 'vaktklassificeringen' 'BLANDADE'; do
         git log --format='%s' 2>/dev/null | grep -qiE "$m" && n=$((n+1)); done; echo "$n/4")"
[ "$LAGE" = "operativt" ] || rad "patchen bär 4 commits" "4" \
    "$(p=$UNDERLAG/artefakter/nortropic-dokumentation-4commits.patch
       [ -f "$p" ] && grep -c '^From [0-9a-f]\{40\}' "$p" || echo ODÖMBART)"

# ── Webb-bundlen ─────────────────────────────────────────────────────────────
B="$UNDERLAG/artefakter/nortropic-web-extraktion.bundle"
if [ "$LAGE" = "operativt" ]; then :   # avsiktligt utelämnad i repot — permanent ODÖMBART, hoppas i operativt läge
elif [ -f "$B" ] && command -v git >/dev/null; then
  T=$(mktemp -d); git clone -q "$B" "$T/w" 2>/dev/null
  if [ -d "$T/w/.git" ]; then
    rad "bundle: commits" "337" "$(git -C "$T/w" log --oneline | wc -l | tr -d ' ')"
    rad "bundle: filer"   "311" "$(git -C "$T/w" ls-files | wc -l | tr -d ' ')"
    rad "bundle: kernelläckage" "0" \
        "$(git -C "$T/w" ls-files | grep -cE '^(controller|verify|specs)/|nortropic-codex-autopilot|check-provanropare|check-verifierarregistret|kor-vakter|kor-styrprov|^tests/(controller|scripts)/')"
  else rad "bundle: klonbar" "JA" "ODÖMBART"; fi
  rm -rf "$T"
else rad "bundle: finns" "JA" "ODÖMBART"; fi

# ── Plattform: kernelgatarna kan bara dömas på Macen ─────────────────────────
echo
if [ "$(uname -s)" = "Darwin" ]; then
  rad "värdmaskin" "Darwin" "Darwin"
  if [ -f verify/bin/h-013-exit ]; then
    # INGET GNU `timeout` — det finns inte på macOS. Raden gav exit 127
    # ("kommandot finns inte") och bokfördes som att GRINDEN föll. Exakt det
    # misstag matning-pa-macen.sh varnar för i sin egen huvudkommentar:
    # "det misstaget gav en gång en falsk 'död interpretator'-diagnos".
    # Rättat 2026-09-16: kör grinden direkt, och använd timeout bara om den finns.
    if command -v timeout >/dev/null 2>&1; then
      timeout 120 bash verify/bin/h-013-exit >/dev/null 2>&1; e=$?
    else
      bash verify/bin/h-013-exit >/dev/null 2>&1; e=$?
    fi
    # FÖRVÄNTAT ÄR exit 1, INTE exit 0. Här stod "exit 0", vilket byggde på
    # etiketten KLAR. FYND 33 falsifierade den: h-013 ger 8 PASS / 8 FAIL på
    # Macen i ren klon, mätt två gånger 2026-09-16 (main och plattformsgrenen).
    # Provets kontrakt är att upptäcka FÖRÄNDRING, inte att önska ett utfall —
    # blir h-013 grön ska denna rad FÄLLA, så att någon uppdaterar den.
    # INFORAD utan förväntan: en lagad h-013 får inte fälla startkontrollen (AUD-03).
    printf "%-46s %-22s %-22s %s\n" "h-013-exit (h-014:s beroende), live" "-" "exit $e" "INFO"
  else rad "h-013-exit finns" "JA" "ODÖMBART"; fi
else
  rad "värdmaskin" "Darwin" "ODÖMBART"
  echo "    ⚠️  Kör på $(uname -s), inte Darwin. Kernelgatarna är Darwin-bundna"
  echo "        (undefined symbol: sysctl); 18 av 24 faller i en Linux-container."
  echo "        Fel maskin är ODÖMBART, aldrig AVVIKER — annars bokförs en miljö"
  echo "        som ett fel i underlaget, vilket är projektets dyraste felklass."
fi

# ── §0c Lokalt maskintillstånd — read-only sonder ────────────────────────────
echo
echo "  §0c LOKALT MASKINTILLSTÅND (read-only — riv ingenting)"
if [ "$(uname -s)" = "Darwin" ]; then
  rad "/usr/local/libexec/nortropic riven" "RIVEN" \
      "$([ -e /usr/local/libexec/nortropic ] && echo FINNS || echo RIVEN)"
  # NAMNGE DE SJU. Raden greppade tidigare "nortropic" skiftlägesokänsligt och
  # träffade _nortropic_provenance — H-033:s produsentidentitet, skapad 2026-08-14,
  # EN VECKA EFTER att 5Z-kontona raderades. Det kontot SKA finnas: det refereras av
  # de frysta proven verify/bin/h-033-exit och h-034-exit, av controller/h034-native/
  # kernel.c, av controller/provenance/{install,cli,native/service.c} och av h-033:s
  # och h-034:s exit_criterion i specs/tasks.spec.json. Provet rapporterade alltså
  # "5Z-avvecklingen ofullständig" om ett konto vars radering hade fällt två grindar.
  # Mätt och rättat 2026-09-16. De sju heter (LOOP-PASS0 FYND 3):
  FEMZ='^(nortropic-cr|nortropic-cv|nortropic-cw|nortropiccontroller|nortropicreviewer|nortropicverifier|nortropicworker)$'
  rad "5Z:s sju systemkonton raderade" "0" \
      "$(u="$(dscl . -list /Users 2>/dev/null)" || { echo ODÖMBART; }; \
         [ -n "${u:-}" ] && printf '%s\n' "$u" | grep -cE "$FEMZ")"
  # _nortropic_provenance är INTE en 5Z-kvarleva utan en beroende komponent.
  # Saknas den är h-033/h-034 obyggbara på denna maskin — därför en egen rad,
  # med omvänd förväntan.
  rad "_nortropic_provenance FINNS (h-033 kräver det)" "1" \
      "$(u="$(dscl . -list /Users 2>/dev/null)" || { echo ODÖMBART; }; \
         [ -n "${u:-}" ] && printf '%s\n' "$u" | grep -cx '_nortropic_provenance')"
  rad "~/Arkiv finns" "JA" "$([ -d "$HOME/Arkiv" ] && echo JA || echo NEJ)"
  echo "    (sudoers-filen kräver sudo och prövas för hand — se 06-inventering.md §0c)"
else
  echo "    ⚠️  Kan inte prövas här. §0c körs på Macen."
  odombart=$((odombart+1))
fi

# ── ⭐ INAKTUELL STATUS I ANALYSKATALOGEN ────────────────────────────────────
# Ägaren 2026-09-16: "visst tar du bort det som inte längre gäller eller är utdaterad?"
# Svaret var nej. Sex ställen sa fortfarande att h-039/032/031 PÅGÅR — de avslutades
# OVERIFIERAT samma dag — och två att h-014:s beroenden är gröna, vilket falsifierades av
# att h-013 är FAIL. Underlaget ska bära ANALYS OCH PLAN, aldrig status; en statusrad här
# driftar inom ett dygn och blir en andra sanning. Disciplin räckte inte, så här är provet.
#
# Rättelsetexter räknas INTE som återfall: en rad som säger att påståendet är FALSIFIERAT
# eller RÄTTAT är dokumentation av felet, inte felet. Utan det undantaget skulle provet
# förbjuda sin egen rättelse — samma fälla som regel 11a bar innan riktningen infördes.
echo
echo "  ⭐ INAKTUELL STATUS — analyskatalogen får inte bära status (README, CLAUDE.md)"
# Två mönster, båda måste finnas PÅ SAMMA RAD. Första versionen band dem i ETT
# BRE-mönster med `|` emellan — men `|` är en LITERAL i BRE, alltså en tabellkolumn, och
# mönstret krävde exakt en kolumn mellan träffarna. Mutationen föll inte: provet förblev
# grönt när `pågår` återinfördes. Fångat och rättat 2026-09-16 innan det anfördes.
ren_traffar() { # <mönster-A> <mönster-B> → rader där båda finns, exkl. rättelsetexter
  grep -rniE "$1" docs/loop/raddning/*.md 2>/dev/null \
    | grep -iE "$2" \
    | grep -viE 'falsifierat|falsifierad|rättat|rättelse|obevisat|avslutad|upphävd|INTE vägen|EJ VÄGEN' \
    | wc -l | tr -d ' '
}
rad "h-039/032/031 beskrivs inte som pågående" "0" \
    "$(ren_traffar 'h-0(31|32|39)' 'pågår|pågående')"
rad "h-014 påstås inte ha gröna beroenden" "0" \
    "$(ren_traffar 'h-014' 'beroenden gröna|byggbar nu')"

# ── ⭐ DÖDA FAS-PEKARE ───────────────────────────────────────────────────────
# VAGEN.md är den enda filen som definierar ordningen, och den definierar den som
# FAS 0..7. Varje "FAS n" som nämns någonstans i underlaget måste alltså finnas
# som en rubrik där. 2026-09-16 pekade §0-tabellen på "FAS 8", som aldrig funnits
# — en död pekare införd i samma commit som skapade filen.
#
# Detta är den mekaniska halvan av regeln "en enda väg". Den andra halvan går inte
# att automatisera: att en text SÄGER något annat om vad som görs först. Den delen
# måste läsas. Se PROMPT-TILL-CODEX.txt (avförd 2026-09-17, blob acd132be), som en timme efter att VAGEN.md skrivits
# fortfarande sa "BÖRJA HÄR: h-009" medan VAGEN.md sagt "FAS 1 — landa grenen".
echo
echo "  ⭐ DÖDA FAS-PEKARE — varje refererad FAS måste finnas i VAGEN.md"
doda_faser() {
  local v=docs/loop/raddning/VAGEN.md n doda=0
  [ -f "$v" ] || { echo ODÖMBART; return; }
  # Bara dokumentationen, aldrig proven själva. Utan filtret flaggade vakten sin
  # EGEN kommentar om FAS 8 och blev permanent röd — en vakt som fäller på sin
  # egen dokumentation av felet den vaktar mot. Samma självreferensfälla som
  # konventionsblocket i regler.md bar samma dag.
  for n in $(grep -rhoE 'FAS [0-9]+' --include='*.md' --include='*.txt' \
                docs/loop/raddning/ 2>/dev/null \
             | grep -oE '[0-9]+' | sort -un); do
    grep -qE "^### FAS $n( |\$|—)" "$v" || doda=$((doda+1))
  done
  echo "$doda"
}
rad "inga döda FAS-pekare i underlaget" "0" "$(doda_faser)"

# ── Summering ────────────────────────────────────────────────────────────────
printf '%.0s-' {1..108}; echo
echo "OPERATIVT: BEKRÄFTAT $bekraftat · AVVIKER $avvik · ODÖMBART $odombart"
[ "$LAGE" = "operativt" ] || echo "HISTORISKT@$REV: BEKRÄFTAT $hist_ok · AVVIKER $hist_avvik · ODÖMBART $hist_od   (ett AVVIKER här = underlaget bär ett fel om diagnosen, inte om läget)"
echo
# Förväntad baslinje per plats. Ett ODÖMBART som är FÖRVÄNTAT skrivs ändå ut som
# ODÖMBART — det tystas aldrig. Skälet: en vakt som hoppar över kontroller vars artefakt
# saknas och ändå rapporterar grönt är precis det fel check-docs-coherence en gång bar
# (PASS 26/26 medan tjugo kontroller tyst utgått). Baslinjen finns för att göra AVVIKELSEN
# läsbar, inte för att ursäkta frånvaron.
echo "FÖRVÄNTAD BASLINJE:"
echo "  I repot (docs/loop/raddning/): ODÖMBART 2 på Macen · 4 i Linux"
echo "     (bundle + patch är AVSIKTLIGT utelämnade i repot; +2 för plattform i Linux)"
echo "  I den fristående tarbollen:    ODÖMBART 0 på Macen · 2 i Linux"
echo "  Avviker DU från din plats baslinje har något ändrats — utred det, ignorera det inte."
echo
if [ "$avvik" -gt 0 ]; then
  echo "AVVIKER > 0: underlaget bär ett fel. Rätta KÄLLAN i samma commit som drift-raden"
  echo "— ett rättat tal som bara står i drift.md skapar en andra sanning (06 §0)."
fi
if [ "$odombart" -gt 0 ]; then
  echo "ODÖMBART > 0: något kunde inte mätas. ODÖMBART blir aldrig grönt."
fi
echo "Detta prov ersätter INTE den oberoende omhärledningen i 06-inventering.md §0."
[ "$avvik" -gt 0 ] && exit 1
[ "$LAGE" != "operativt" ] && [ "$hist_avvik" -gt 0 ] && exit 1
[ "$odombart" -gt 0 ] && exit 2
exit 0
