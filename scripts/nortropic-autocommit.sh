#!/usr/bin/env bash
# nortropic-autocommit.sh — BEVARANDE, aldrig publicering.
#
# Regel 12a. Committar och pushar pågående arbete till ARBETSGRENEN, automatiskt,
# utan att någon människa ombeds. Den publicerar ingenting, attesterar ingenting
# och mergar ingenting — alla grindar, roller och kontraktsflöden står orörda.
#
#   BEVARANDE  = en commit på en arbetsgren. Skyddar mot att arbete försvinner.
#                Ingen trust-innebörd. Ska vara AUTOMATISK.
#   PUBLICERING = attestation, PR, merge till main. Bär trust-innebörd.
#                Ska ha VARENDA grind kvar.
#
# Att blanda ihop dem är varför detta repo bar ~300 lokala grenar, en `main` 493
# commits efter origin och en vecka med 55 opushade commits. `PUSH=NO` i AGENTS.md
# skrevs för publicering och tillämpades på bevarande. Det skyddade ingenting och
# förlorade allt.
#
#   bash scripts/nortropic-autocommit.sh [valfri notis om vad som gjordes]
#
# Skrivet för bash 3.2 — macOS systembash. Inga bash4-konstruktioner.
# Ingen sudo (regel 5). Aldrig --force, aldrig rebase, aldrig amend.

set -u

ROT="$(git rev-parse --show-toplevel 2>/dev/null)" || { echo "autocommit: inte ett git-repo"; exit 1; }
cd "$ROT" || exit 1

NOTIS="${1:-pågående arbete}"
GREN="$(git branch --show-current 2>/dev/null)"

# ── Spärr 1: aldrig på main. Bevarande hör hemma på en arbetsgren. ───────────
case "$GREN" in
  ""|main|master)
    if [ -n "$(git status --porcelain)" ]; then
      echo "autocommit: STOPP — okommitterat arbete på '${GREN:-frånkopplat HEAD}'."
      echo "  Bevarande sker på en arbetsgren, aldrig på main. Skapa en:"
      echo "    git checkout -b nortropic/<vad-du-gor>"
      exit 1
    fi
    exit 0 ;;
esac

# ── Inget att göra är ett giltigt utfall, inte ett fel ───────────────────────
if [ -z "$(git status --porcelain)" ]; then
  AHEAD="$(git log --oneline @{u}..HEAD 2>/dev/null | wc -l | tr -d ' ')"
  if [ "${AHEAD:-0}" = "0" ] && git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1; then
    exit 0
  fi
fi

# ── §A-mängden, byggplan-v3 §3.1. Bevaras OCKSÅ — men i en egen commit ───────
# Regel 6 gör §A till människohand. Den regeln gäller AUKTORISATION, inte
# BEVARANDE: en commit på en arbetsgren godkänner ingenting. Att låta §A-arbete
# ligga okommitterat vore att förlora det för att skydda det. Därför bevaras det,
# separat och tydligt märkt, så att granskningen omöjligt kan missa det.
ar_paragraf_a() {
  case "$1" in
    docs/07-konstitution.md|docs/03-regelverk.md|CLAUDE.md|AUTOPILOT) return 0 ;;
    scripts/check-invariants.mjs) return 0 ;;
    agents/nortropic-steward.md) return 0 ;;
    skills/nortropic-eval/references/eval-rubric.md) return 0 ;;
    skills/nortropic-plan/references/juridikflaggor.md) return 0 ;;
    specs/*|verify/*|controller/*|workflows/*|tests/fixtures/*) return 0 ;;
    *) return 1 ;;
  esac
}

git add -A
VANLIGA=""; PARAGRAF_A=""
CHANGED="$(git diff --cached --name-only)"
OLDIFS="$IFS"; IFS='
'
for f in $CHANGED; do
  if ar_paragraf_a "$f"; then PARAGRAF_A="$PARAGRAF_A $f"; else VANLIGA="$VANLIGA $f"; fi
done
IFS="$OLDIFS"

git reset -q

STAMP="$(date '+%Y-%m-%d %H:%M')"
GJORDE=0

# ── Commit 1: vanligt arbete ─────────────────────────────────────────────────
if [ -n "$VANLIGA" ]; then
  git add -- $VANLIGA
  git commit -q -m "[AUTOCOMMIT] $NOTIS ($STAMP)" \
    -m "Bevarande enligt regel 12a — automatisk commit på arbetsgren.
Ingen publicering, ingen attestation, ingen merge. Alla grindar orörda."
  GJORDE=1
  echo "autocommit: bevarade $(echo $VANLIGA | wc -w | tr -d ' ') fil(er)"
fi

# ── Commit 2: §A, separat och omöjlig att missa ──────────────────────────────
if [ -n "$PARAGRAF_A" ]; then
  git add -- $PARAGRAF_A
  git commit -q -m "[AUTOCOMMIT][HÖGRISK-OGRANSKAD] §A-ytor rörda ($STAMP)" \
    -m "Dessa sökvägar ligger i byggplan-v3 §3.1:s §A-mängd:
$(echo $PARAGRAF_A | tr ' ' '\n' | sed 's/^/  /')

BEVARAD, INTE AUKTORISERAD. Regel 6 kräver människohand och HÖGRISK-märkning
för en §A-ÄNDRING. Denna commit ger ingen sådan auktorisation — den hindrar
bara att arbetet försvinner. Att blanda ihop *kan* och *får* är vad
SELF_CERTIFICATION_AS_PROOF=NO förbjuder.

Granskaren ska antingen auktorisera ändringen med en rad i
docs/05-beslutslogg.md, eller revertera denna commit."
  GJORDE=1
  echo "autocommit: ⚠️ §A-ytor bevarade i egen commit — KRÄVER GRANSKNING:"
  echo "$PARAGRAF_A" | tr ' ' '\n' | sed '/^$/d;s/^/    /'
fi

# ── Push. Aldrig force, aldrig till main. Nätfel är inte tyst. ───────────────
if ! git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1; then
  SATT="-u origin $GREN"
else
  SATT="origin $GREN"
fi

N=0
while [ $N -lt 4 ]; do
  if git push $SATT >/dev/null 2>&1; then
    echo "autocommit: pushad till origin/$GREN"
    break
  fi
  N=$((N+1))
  [ $N -ge 4 ] && { echo "autocommit: ⚠️ PUSH MISSLYCKADES efter 4 försök — arbetet är committat men BARA LOKALT."; echo "  Det är regel 12:s felläge. Skriv en rad i docs/loop/drift.md om varför."; exit 1; }
  sleep $((2 ** N))
done

# ── Mekaniskt prov på regel 12 ───────────────────────────────────────────────
SMUTS="$(git status --porcelain | wc -l | tr -d ' ')"
OPUSHAT="$(git log --oneline @{u}..HEAD 2>/dev/null | wc -l | tr -d ' ')"
if [ "$SMUTS" = "0" ] && [ "$OPUSHAT" = "0" ]; then
  [ "$GJORDE" = "1" ] && echo "autocommit: regel 12 uppfylld — inget lokalt som inte finns på git"
  exit 0
fi
echo "autocommit: ⚠️ regel 12 EJ uppfylld — smutsigt=$SMUTS opushat=$OPUSHAT"
exit 1
