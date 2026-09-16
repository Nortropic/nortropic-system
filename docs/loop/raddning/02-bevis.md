# Bevis — varje mätning med sitt kommando

Syftet med denna fil är att **du inte ska behöva utreda om det som redan är utrett.**
Den dyraste posten i detta projekt är återderivering.

Kör bara om det du tänker luta ett beslut mot. Allt nedan är mätt 2026-09-14/16 mot
full historik (825 commits, äldsta 2026-07-17).

> **Grund klon.** Sessionens klon var grund (100 commits). Kör
> `git fetch --depth=1000 origin main` innan historikmätningar, annars ser du bara
> fönstret 31 aug–8 sep och webbfilerna ser ut att ha 1 commit var.

---

## Rundtrampen

```bash
# Andel av historiken på kontrollplanet
git log --format='%s' | grep -ciE 'h-?0[0-9]{2}'        # >=440 av >=825 = över hälften
                                                        # 440/825 uppmätt 2026-09-14.
                                                        # BÅDA ÄR GOLV, inte exakta tal:
                                                        # loggen växer, så talen stiger.
                                                        # validera-underlaget.sh pinnar
                                                        # dem som trösklar (FYND 31c).

# Commits och rundor per hypotes
for h in 031 032 033 034 035 036 037 038 039; do
  n=$(git log --format='%s' | grep -i "h-\?$h" | grep -oiE '\bR[0-9]+' | tr 'a-z' 'A-Z' | sort -u | wc -l)
  c=$(git log --format='%s' | grep -ci "h-\?$h")
  printf "H-%s: %3s commits, %2s rundor\n" "$h" "$c" "$n"
done
# H-032 145/21 · H-039 80/32 · H-031 50/15 · H-035 34/8

grep -c 'productless\|NO-CREDIT\|no product' docs/loop/drift.md   # 101
grep -c '^## .*H-039' docs/loop/drift.md                          # 37 rundrubriker

ls -l verify/bin/h-0*-exit | awk '{print $NF, $5}'
# h-001 4846 → h-031 158959 → h-032 1076398 → h-035 1444102 → h-039 2136969
```

De tre namngivna rundorna finns i `docs/loop/drift.md`: sök `dev_t` (R29, signed
`-1809520531` mot unsigned `2485446765`), `st_dev` (R33, reboot 16777232→16777230),
`com.apple.provenance` (R32/R33, tvårads listning).

### Konvergensmätningen — grindens egen historik

**Detta är det bärande beviset i `01-lagesbild.md` §1** och det ersätter den tidigare
lexikala förklaringen ("rundorna brinner på miljödrift"). Metoden är beteendemässig:
i stället för att läsa vad rundorna *säger* följer den vad grindfilen *gjorde*.

```bash
# Hur många gånger har grinden ändrats?
git log --oneline --follow -- verify/bin/h-039-exit | wc -l      # 30

# Storleksserien per ändring, äldst först — visar riktningen
for c in $(git log --reverse --format=%H --follow -- verify/bin/h-039-exit); do
  printf "%s %8s %s\n" "${c:0:8}" \
    "$(git cat-file -s $(git rev-parse $c:verify/bin/h-039-exit))" \
    "$(git log -1 --format=%s $c | cut -c1-60)"
done
# 200798 → 2136969 i 30 steg. NOLL minskningar.
```

**Diskriminanten — kör den mot alla gates, inte bara h-039:**

```bash
for g in verify/bin/h-0*-exit; do
  printf "%-26s %4s commits\n" "$g" "$(git log --oneline --follow -- "$g" | wc -l)"
done | sort -k2 -n
```

| Task | Commits mot grinden | Utfall |
|---|---|---|
| `h-016` | 1 | klar |
| `h-013`, `h-017`, `h-038` | 2 | klara |
| `h-001`, `h-036` | 3 | klara |
| `h-035` | 17 | pågår |
| `h-039` | 30 | **AVSLUTAD OVERIFIERAT 2026-09-16 (regel 11b)** |
| `h-032` | 120 | **AVSLUTAD OVERIFIERAT 2026-09-16 (regel 11b)** |
| `h-031` | 147 | **AVSLUTAD OVERIFIERAT 2026-09-16 (regel 11b)** |

**⚠️ FALSIFIERAD ÅT ENA HÅLLET 2026-09-16 (FYND 33).** Här stod *"Ingen mellanform. Klar ⇔
grinden rörd ≤ 3 gånger."* Omfrysningstalen ovan är riktiga; **etiketten "klar" var det
inte.** Körda på Macen i ren klon: `h-016` (1 omfrysning) `11 PASS / 14 FAIL`, `h-013`
(2 omfrysningar) `8 PASS / 8 FAIL`, `h-004` `8 PASS / 7 FAIL`.

Kvar står: **många omfrysningar ⇒ icke-klar** (17–147, alla röda). Borta är: **få
omfrysningar ⇒ klar.**

Rätt läsning: ett lågt omfrysningstal betyder att någon **slutade röra grinden**, inte att
den blev grön. Det är fortfarande den variabel rundtrampsvaktens gren 2 ska räkna
(`09-task-rundtrampsvakten.md` §4) — men som stoppsignal, aldrig som framgångsmått.

> **Varför denna mätning och inte min förra.** Mitt första försök klassade rundorna efter
> **ordval** i commit-text via reguljära uttryck. Två körningar med olika ordlistor gav
> `36 av 37` respektive `5 av 26` för samma kategori — måttet mätte min ordlista, inte
> projektet. Grindens filhistorik är oberoende av hur en runda formulerades och går att
> reproducera exakt. **Kör inte om ordklassningen. Den är kasserad.**

---

## Dokumentationslagret

```bash
# Ingångsdokumenten stod stilla medan kernellagret skrevs om
for f in CLAUDE.md README.md AGENTS.md docs/agentoverlamning.md docs/00-borja-har.md \
         docs/05-beslutslogg.md docs/loop/drift.md; do
  printf "%-32s " "$f"; git log -1 --format='%ad' --date=short -- "$f"
done

# Kernel- kontra webbomnämnanden per ingångsdokument
for f in CLAUDE.md AGENTS.md docs/agentoverlamning.md README.md docs/00-borja-har.md; do
  k=$(grep -ciE 'trust.?kernel|controller/|bootstrap|specs/tasks' "$f")
  w=$(grep -ciE 'webbplats|kundsajt|konverterande|lokal-se' "$f")
  printf "%-30s kernel=%-4s webb=%s\n" "$f" "$k" "$w"
done
# FÖRE rättelsen: CLAUDE.md kernel=0 · agentoverlamning kernel=0 · README kernel=1 webb=7
# EFTER:          CLAUDE.md kernel=6 · agentoverlamning kernel=3
```

---

## Grindsvitens räckvidd

```bash
# Vilket träd läser varje vakt? OBS: inga citattecken i mönstret —
# en tidigare version krävde inledande ' och missade tre kernelreferenser.
for s in scripts/check-*.mjs; do
  w=$(grep -ocE "(agents|skills|packs|workflows|backtests)/" "$s")
  k=$(grep -ocE "(controller|verify|specs)/" "$s")
  printf "%-38s webbträd=%-3s kernelträd=%s\n" "$(basename $s)" "$w" "$k"
done
# MÄTT 2026-09-16 med kommandot ovan: 16 / 2 / 1 / 4
#   16 refererar ENBART webbträdet
#    2 ENBART kärnan: check-provanropare.mjs (controller/loop/fall.py,
#      controller/provenance/*.py, verify/bin/h-032-exit) och
#      check-verifierarregistret.mjs (controller/verify/register.json)
#    1 båda: check-v4-utkast.mjs
#    4 inget träd: check-foundation-smoke + check-gym-contract (läser
#      docs/07-konstitution.md m.fl.), check-research-contract, check-vaktankare
#      (pinnar vakternas källhashar — sviteinfrastruktur)
# En tidigare version påstod '16 webb / 0 kärna'. Kärnsiffran var FEL: grepet
# krävde inledande citattecken och missade alla tre kernelreferenserna.

node scripts/kor-vakter.mjs      # RESULTAT: PASS — 23/23 i ÄGARENS klon
# MEN i en färsk klon: FAIL — 1 av 23. check-foundation-smoke.mjs faller
# därför att tests/fixtures/foundation/kontroller.sh kräver att origin är
# Nortropic/nortropic-system. Verifierat på REN main, utan några ändringar.
# Grinden är miljöbunden, inte mekanismbunden. Se 05-arbetsordning.md §4.
```

`kor-vakter.mjs` rad 91–99 upptäcker vakterna dynamiskt via
`git ls-files scripts/` + filter på `check-*.mjs`. Det finns ingen handlista — en ny
`check-*.mjs` i `scripts/` kopplas in automatiskt.

---

## Den cirkulära pinningen

```bash
cat controller/verify/register.json
# Registrerar exakt två verifierare, båda webbfiler:
#   scripts/check-invariants.mjs   (läser 10 filer i agents/, skills/, workflows/)
#   workflows/nortropic-verify-suite.js

grep -rln "verify/register.json" controller/ verify/ scripts/ specs/
# controller/verify/cli · verify/bin/h-017-exit · h-035-exit · h-037-exit
# scripts/check-verifierarregistret.mjs · kor-styrprov.mjs · kor-vakter.mjs
# scripts/nortropic-codex-autopilot.py · specs/tasks.spec.json

for f in verify/bin/h-017-exit verify/bin/h-035-exit verify/bin/h-037-exit; do
  echo "$f"
  grep -oE "scripts/check-invariants\.mjs|workflows/[a-z-]+\.js|register\.json" "$f" | sort | uniq -c
done
# h-037 refererar check-invariants 4× och nortropic-verify-suite 7×
```

**Motriktningen, verifierad empiriskt:** bryt ut webbträdet till en egen klon och kör
sviten där. Första raden blir
`ODÖMBART: controller/verify/register.json går inte att läsa`.

---

## Styrlagret

```bash
for d in 07-konstitution 03-regelverk 05-beslutslogg; do
  echo "docs/$d.md"
  printf "  kernelomnämnanden: %s\n" "$(grep -ciE 'trust.?kernel|controller/|verify/bin|specs/tasks|exit_test' docs/$d.md)"
  printf "  läses av: %s\n" "$(grep -rl "$d" controller/ verify/ specs/ .agents/ | tr '\n' ' ')"
done
```

| Dokument | Kernelomnämnanden | Läses av |
|---|---|---|
| `07-konstitution.md` | **0** | 5 frysta gates + `controller/policy/cli` + `controller/verify/cli` + alla 5 rollskills |
| `03-regelverk.md` | **0** | `h-007-exit` + `controller/verify/cli` + alla 5 rollskills |
| `05-beslutslogg.md` | 80 | **10 frysta gates** + `controller/attest/cli` + `specs/tasks.spec.json` |

Konstitutionens §A pekar uteslutande på webbsökvägar:

```bash
grep -oE '`[a-zA-Z0-9_./*-]+\.(md|js|mjs|json)`|`AUTOPILOT`' docs/07-konstitution.md | sort | uniq -c
# AUTOPILOT 5 · agents/nortropic-steward.md 3 · workflows/* 5 · skills/* 2 · packs/* 4
```

---

## Separationen

```bash
# Arbetsdelningen håller, filerna ligger kvar
for d in agents skills packs backtests workflows; do
  printf "%-12s %s spårade filer, %s commits\n" "$d" "$(git ls-files $d | wc -l)" "$(git log --oneline -- $d | wc -l)"
done
# agents 7/118 · skills 44/99 · packs 5/9 · backtests 17/15 · workflows 6/39

# Inget beslut om delning står i loggarna
grep -niE 'separat|delning|eget repo|nytt repo' docs/05-beslutslogg.md docs/loop/drift.md
# Endast kernel-tekniska träffar (separata reviews, separata FD:er)

# Webbfabriken är äldst
git log --reverse --format='%ad' --date=short -- agents | head -1     # 2026-07-17
git log --reverse --format='%ad' --date=short -- controller | head -1  # 2026-08-07
```

**Inget målrepo finns.** `verkstadsgolvet`, `nortropic-intake` och `innovation-intake`
bär noll filer av webbfabriken (kontrollerat genom klon och `git ls-files`).

> **RÄTTELSE — repo-uppräkningen var filtrerad.** En tidigare formulering sa *"kontots
> fyra repon"*. Ofiltrerad listning ger **15**: 4 under `Nortropic` (de fyra ovan) och 11
> personliga under `Jonkebronk`, som ägaren avfärdat som irrelevanta. Slutsatsen står,
> men talet var fel därför att filtret i frågan aldrig lästes.
>
> **Öppen post:** ägaren uppger att ett **backup-repo** finns. Det syns inte i den
> ofiltrerade listningen och kan inte nås från en molnsession. Lokaliseringen är en
> inventeringspost på Macen — `06-inventering.md` §0c.

**Extraktionen är gjord** och ligger i `artefakter/nortropic-web-extraktion.bundle`:
**337 commits, 311 filer**, äldsta 2026-07-17, noll kernelfiler. Historiken är alltså
inte problemet — trust-ankarna är det.

```bash
git clone artefakter/nortropic-web-extraktion.bundle /tmp/w
git -C /tmp/w log --oneline | wc -l     # 337
git -C /tmp/w ls-files | wc -l          # 311
git -C /tmp/w ls-files | grep -cE '^(controller|verify|specs)/|nortropic-codex-autopilot|check-provanropare|check-verifierarregistret|kor-vakter|kor-styrprov|^tests/(controller|scripts)/'   # 0
```

> **RÄTTELSE 2026-09-16 — tre olika tal stod för samma artefakt.** Underlaget påstod
> `365/325` här, `345/320` i `06-inventering.md` §0b och `337/311` i `00-LAS-FORST.md`.
> De två första var kvar från tidigare bundle-generationer, skrivna innan kernelfilerna
> uteslöts. **Mätt ur artefakten gäller 337/311.** Felet fanns i en artefakt som redan var
> levererad två gånger, och det hittades av att siffrorna jämfördes mot varandra — inte
> av att någon läste texten.
