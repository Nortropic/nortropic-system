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

avvik=0; odombart=0; bekraftat=0
UNDERLAG="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

rad() { # rad <påstående> <förväntat> <uppmätt>
  local p="$1" f="$2" u="$3" v
  if   [ "$u" = "ODÖMBART" ]; then v="ODÖMBART"; odombart=$((odombart+1))
  elif [ "$u" = "$f" ];      then v="BEKRÄFTAT"; bekraftat=$((bekraftat+1))
  else                            v="AVVIKER";  avvik=$((avvik+1)); fi
  printf "%-46s %-22s %-22s %s\n" "$p" "$f" "$u" "$v"
}

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
rad "h-016  (klar)"       "1"   "$(gatecommits h-016)"
rad "h-013  (klar)"       "2"   "$(gatecommits h-013)"
rad "h-017  (klar)"       "2"   "$(gatecommits h-017)"
rad "h-038  (klar)"       "2"   "$(gatecommits h-038)"
rad "h-001  (klar)"       "3"   "$(gatecommits h-001)"
rad "h-036  (klar)"       "3"   "$(gatecommits h-036)"
rad "h-035  (pågår)"      "17"  "$(gatecommits h-035)"
rad "h-039  (pågår)"      "30"  "$(gatecommits h-039)"
rad "h-032  (pågår)"      "120" "$(gatecommits h-032)"
rad "h-031  (pågår)"      "147" "$(gatecommits h-031)"
rad "h-039-exit storlek (byte)" "2136969" \
    "$(f=verify/bin/h-039-exit; [ -f $f ] && (stat -c%s $f 2>/dev/null || stat -f%z $f) || echo ODÖMBART)"
# Strukturpåståendet, inte bara talet: växte grinden monotont?
rad "h-039-grinden minskade aldrig" "0 minskningar" \
    "$( [ -f verify/bin/h-039-exit ] && git log --reverse --format=%H --follow -- verify/bin/h-039-exit 2>/dev/null \
        | while read -r c; do git cat-file -s "$(git rev-parse "$c:verify/bin/h-039-exit" 2>/dev/null)" 2>/dev/null; done \
        | awk 'NR>1&&$1<p{n++}{p=$1}END{print (n?n:0)" minskningar"}' || echo ODÖMBART)"
echo

# ── §2/§6 Luckorna i kedjan ──────────────────────────────────────────────────
rad "autonomous-loop-exit saknas" "SAKNAS" \
    "$([ -e verify/bin/autonomous-loop-exit ] && echo FINNS || echo SAKNAS)"
rad "filer i verify/bin/" "29" "$(matt 'ls verify/bin | wc -l | tr -d " "')"
rad "h-014-exit saknas" "SAKNAS" "$([ -e verify/bin/h-014-exit ] && echo FINNS || echo SAKNAS)"
rad "h-015-exit saknas" "SAKNAS" "$([ -e verify/bin/h-015-exit ] && echo FINNS || echo SAKNAS)"
rad "h-030 finns EJ i specen" "SAKNAS" \
    "$(matt "python3 -c \"import json;d=json.load(open('specs/tasks.spec.json'));print('FINNS' if 'h-030' in [t['id'] for t in d['tasks']] else 'SAKNAS')\"")"
rad "h-015 beror på h-030" "JA" \
    "$(matt "python3 -c \"import json;d=json.load(open('specs/tasks.spec.json'));print('JA' if any('h-030' in (t.get('depends_on') or []) for t in d['tasks'] if t['id']=='h-015') else 'NEJ')\"")"

# ── §5 Den cirkulära pinningen ───────────────────────────────────────────────
rad "registret registrerar 2 webbfiler" "2" \
    "$(matt "grep -cE 'scripts/check-invariants\.mjs|workflows/nortropic-verify-suite\.js' controller/verify/register.json")"
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
rad "scripts/check-*.mjs, antal" "23" "$(matt 'ls scripts/check-*.mjs 2>/dev/null | wc -l | tr -d " "')"
rad "vaktfördelning webb/kärna/båda/noll" "16/2/1/4" \
    "$(w=0;k=0;b=0;n=0
       for s in scripts/check-*.mjs; do [ -f "$s" ] || continue
         a=$(grep -cE '(agents|skills|packs|workflows|backtests)/' "$s"); a=${a:-0}
         c=$(grep -cE '(controller|verify|specs)/' "$s"); c=${c:-0}
         if [ "$a" -gt 0 ] && [ "$c" -gt 0 ]; then b=$((b+1))
         elif [ "$a" -gt 0 ]; then w=$((w+1))
         elif [ "$c" -gt 0 ]; then k=$((k+1))
         else n=$((n+1)); fi; done
       [ $((w+k+b+n)) -eq 0 ] && echo ODÖMBART || echo "$w/$k/$b/$n")"

# ── §0b BLANDADE kataloger: kernelfilerna som aldrig får flytta ──────────────
echo
for f in scripts/nortropic-codex-autopilot.py scripts/check-provanropare.mjs \
         scripts/check-verifierarregistret.mjs scripts/kor-styrprov.mjs scripts/kor-vakter.mjs; do
  rad "KÄRNA i scripts/: $(basename "$f")" "FINNS" "$([ -f "$f" ] && echo FINNS || echo SAKNAS)"
done

# ── Dokumentationsrättelsen: fyra commits ────────────────────────────────────
echo
rad "de 4 dok-commitsen i HEAD:s historik" "4" \
    "$(matt "git log --oneline | grep -ciE 'repots identitet|lageretiketten|vaktklassificeringen|BLANDADE'")"
rad "patchen bär 4 commits" "4" \
    "$(p=$UNDERLAG/artefakter/nortropic-dokumentation-4commits.patch
       [ -f "$p" ] && grep -c '^From [0-9a-f]\{40\}' "$p" || echo ODÖMBART)"

# ── Webb-bundlen ─────────────────────────────────────────────────────────────
B="$UNDERLAG/artefakter/nortropic-web-extraktion.bundle"
if [ -f "$B" ] && command -v git >/dev/null; then
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
    timeout 120 bash verify/bin/h-013-exit >/dev/null 2>&1; e=$?
    rad "h-013-exit (h-014:s beroende)" "exit 0" "exit $e"
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
  rad "systemkonton raderade" "0" \
      "$(dscl . -list /Users 2>/dev/null | grep -ci nortropic || echo ODÖMBART)"
  rad "~/Arkiv finns" "JA" "$([ -d "$HOME/Arkiv" ] && echo JA || echo NEJ)"
  echo "    (sudoers-filen kräver sudo och prövas för hand — se 06-inventering.md §0c)"
else
  echo "    ⚠️  Kan inte prövas här. §0c körs på Macen."
  odombart=$((odombart+1))
fi

# ── Summering ────────────────────────────────────────────────────────────────
printf '%.0s-' {1..108}; echo
echo "BEKRÄFTAT $bekraftat · AVVIKER $avvik · ODÖMBART $odombart"
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
[ "$odombart" -gt 0 ] && exit 2
exit 0
