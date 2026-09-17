#!/usr/bin/env bash
# tests/scripts/post-commit-hook/fall.sh — vakterna i .githooks/post-commit, i engångsrepon.
# Eget $HOME, egen bare-origin, core.hooksPath → en KOPIA av repots hook. Rör aldrig riktiga repot.
#   bash tests/scripts/post-commit-hook/fall.sh
#   HOOK=<sökväg> bash tests/scripts/post-commit-hook/fall.sh     # prova annan kandidat
set -u
HAR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd -P)"
HOOK="${HOOK:-$HAR/.githooks/post-commit}"
[ -f "$HOOK" ] || { echo "ODÖMBART: $HOOK saknas"; exit 2; }
T="$(mktemp -d "${TMPDIR:-/tmp}/post-commit-fall.XXXXXX")"; export T; trap 'rm -rf "$T"' EXIT
export HOME="$T/hem"; mkdir -p "$HOME/hooks"; cp "$HOOK" "$HOME/hooks/post-commit"; chmod +x "$HOME/hooks/post-commit"
export GIT_AUTHOR_NAME=Prov GIT_AUTHOR_EMAIL=prov@x GIT_COMMITTER_NAME=Prov GIT_COMMITTER_EMAIL=prov@x
git config --global init.defaultBranch main; git config --global advice.detachedHead false
PASS=0; FAIL=0
ok()  { PASS=$((PASS+1)); echo "  ✅ $1"; }
fel() { FAIL=$((FAIL+1)); echo "  ❌ $1 — $2"; }
refs() { git -C "$T/origin.git" for-each-ref --format='%(refname:short)' | sort | tr '\n' ' '; }
bygg() {
  rm -rf "$T/origin.git" "$T/arb"
  git init -q --bare "$T/origin.git"
  git init -q "$T/arb" && echo a > "$T/arb/a.txt" && git -C "$T/arb" add -A && git -C "$T/arb" commit -q -m bas \
    && git -C "$T/arb" remote add origin "$T/origin.git" && git -C "$T/arb" push -q origin HEAD:main \
    && git -C "$T/arb" config core.hooksPath "$HOME/hooks"
}
echo "post-commit — fall (hook: $HOOK)"
# P1 huvudträd, arbetsgren → pushad
bygg; git -C "$T/arb" switch -q -c nortropic/loop-x; echo b > "$T/arb/b.txt"; git -C "$T/arb" add -A; git -C "$T/arb" commit -q -m x 2>"$T/e1"
case "$(refs)" in *"nortropic/loop-x"*) ok "P1 huvudträd på gren → pushad" ;; *) fel "P1" "refs: $(refs)" ;; esac
# P2 huvudträd, detached → radda/auto-*
bygg; git -C "$T/arb" checkout -q --detach; echo c > "$T/arb/c.txt"; git -C "$T/arb" add -A; git -C "$T/arb" commit -q -m d 2>/dev/null
case "$(refs)" in *"radda/auto-"*) ok "P2 huvudträd detached → radda/auto-* pushad (oförändrat beteende)" ;; *) fel "P2" "refs: $(refs)" ;; esac
# N1 länkad worktree, detached (kandidatform) → ingen push
bygg; git -C "$T/arb" worktree add -q --detach "$T/wt1" HEAD; echo d > "$T/wt1/d.txt"; git -C "$T/wt1" add -A; git -C "$T/wt1" commit -q -m wt 2>"$T/e2"
case "$(refs)" in *"radda/auto-"*) fel "N1" "radda/auto pushad från länkad worktree" ;; *) grep -q 'länkad worktree' "$T/e2" && ok "N1 länkad worktree detached → ingen push, tydligt skäl" || fel "N1" "inget skäl på stderr: $(cat "$T/e2")" ;; esac
# N1b länkad worktree på gren (grindform h007-prov-$$) → ingen push
bygg; git -C "$T/arb" worktree add -q -b h007-prov-123 "$T/wt2" HEAD; echo e > "$T/wt2/e.txt"; git -C "$T/wt2" add -A; git -C "$T/wt2" commit -q -m prov 2>/dev/null
case "$(refs)" in *"h007-prov-123"*) fel "N1b" "fixturgren pushad" ;; *) ok "N1b länkad worktree på gren h007-prov-* → ingen push" ;; esac
# N2 huvudträd, author nortropic-utforare → ingen push
bygg; git -C "$T/arb" switch -q -c nortropic/loop-y; echo f > "$T/arb/f.txt"; git -C "$T/arb" add -A; GIT_AUTHOR_NAME=nortropic-utforare GIT_COMMITTER_NAME=nortropic-utforare git -C "$T/arb" commit -q -m kand 2>"$T/e3"
case "$(refs)" in *"nortropic/loop-y"*) fel "N2" "utförarens commit pushad" ;; *) grep -q 'utföraren' "$T/e3" && ok "N2 commit av nortropic-utforare → ingen push, tydligt skäl" || fel "N2" "inget skäl: $(cat "$T/e3")" ;; esac
# N2b bara COMMITTER-namnet är utförarens (author är någon annan) → ingen push. Fäller en
# mutant som bara läser %an. (#262-granskningen, advisory 1: "author eller committer" var obevisat.)
bygg; git -C "$T/arb" switch -q -c nortropic/loop-y2; echo f2 > "$T/arb/f2.txt"; git -C "$T/arb" add -A; GIT_AUTHOR_NAME=Prov GIT_COMMITTER_NAME=nortropic-utforare git -C "$T/arb" commit -q -m kand2 2>/dev/null
case "$(refs)" in *"nortropic/loop-y2"*) fel "N2b" "commit med utföraren som committer pushad" ;; *) ok "N2b committer nortropic-utforare (author annan) → ingen push" ;; esac
# N3 på main → ingen push (oförändrat)
bygg; echo g > "$T/arb/g.txt"; git -C "$T/arb" add -A; git -C "$T/arb" commit -q -m m 2>/dev/null
[ "$(git -C "$T/origin.git" rev-parse main)" != "$(git -C "$T/arb" rev-parse HEAD)" ] && ok "N3 på main → ingen push" || fel "N3" "main pushad"
# N4 NORTROPIC_AUTOPUSH=0 → ingen push (oförändrat)
bygg; git -C "$T/arb" switch -q -c nortropic/loop-z; echo h > "$T/arb/h.txt"; git -C "$T/arb" add -A; NORTROPIC_AUTOPUSH=0 git -C "$T/arb" commit -q -m z 2>/dev/null
case "$(refs)" in *"nortropic/loop-z"*) fel "N4" "pushad trots =0" ;; *) ok "N4 NORTROPIC_AUTOPUSH=0 → ingen push" ;; esac
echo; echo "$PASS gröna · $FAIL röda"
[ "$FAIL" = 0 ] && exit 0 || exit 1
