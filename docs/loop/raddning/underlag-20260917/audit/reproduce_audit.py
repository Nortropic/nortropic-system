#!/usr/bin/env python3
"""Isolated counterexamples to decision fragments in the Nortropic rescue scripts.

This is NOT a kernel test runner and NOT a Darwin qualification. It does not fetch,
push, invoke a model, or inspect the user's working repositories. All Git operations
run in disposable fixture repositories with an isolated HOME and Git configuration.

The source fragments were transcribed from the pinned GitHub files identified below.
The enclosing I/O, fixture paths and diagnostic printing are adapted for isolation;
these are deliberately reduced reproductions, not byte-identical whole-script runs.
A reproduced defect is a failing property of the audited logic, not a failed kernel.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import subprocess
import tempfile
from typing import Any

MAIN = "eb9483e932be528231d3e9212d816ebad76ef114"
PLATFORM = "8095d947c83202e2b87801531d9f7cb1457c8719"
SOURCES = {
    "completion": "docs/loop/raddning/artefakter/helhetsbilden.sh",
    "readiness": "docs/loop/raddning/artefakter/redo-for-codex.sh",
    "lane": "docs/loop/raddning/VAGEN.md",
    "preservation": "scripts/nortropic-autocommit.sh",
    "inventory": "docs/loop/raddning/artefakter/inventera-lokalt-arbete.sh",
    "measurement": "docs/loop/raddning/artefakter/matning-pa-macen.sh",
}


def run(argv: list[str], cwd: Path, env: dict[str, str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
    p = subprocess.run(argv, cwd=cwd, env=env, text=True, capture_output=True, timeout=20)
    if check and p.returncode != 0:
        raise RuntimeError(f"Command failed ({p.returncode}): {argv!r}\n{p.stdout}\n{p.stderr}")
    return p


def git(cwd: Path, env: dict[str, str], *args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return run(["git", *args], cwd, env, check=check)


def put(root: Path, path: str, data: str) -> Path:
    p = root / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(data, encoding="utf-8")
    return p


def repo(root: Path, env: dict[str, str]) -> Path:
    root.mkdir(parents=True)
    git(root, env, "init", "-q", "-b", "main")
    git(root, env, "config", "user.name", "Isolated Audit Fixture")
    git(root, env, "config", "user.email", "audit@example.invalid")
    put(root, "README.md", "Disposable fixture, not Nortropic.\n")
    git(root, env, "add", "README.md")
    git(root, env, "commit", "-qm", "fixture base")
    git(root, env, "update-ref", "refs/remotes/origin/main", "HEAD")
    return root


def result(id_: str, source: str, property_: str, reproduced: bool, evidence: Any, controls: Any = None) -> dict[str, Any]:
    if not reproduced:
        raise AssertionError(f"Counterexample did not reproduce: {id_}\n{evidence}")
    return {"id": id_, "source": source, "property_under_test": property_,
            "result": "DEFECT_REPRODUCED", "evidence": evidence, "controls": controls}


COMPLETION_FRAGMENT = r'''
# Source decision logic, with a reduced output-only rad() function.
UPPFYLLDA=0
rad() { [ "$3" = JA ] && UPPFYLLDA=$((UPPFYLLDA+1)); return 0; }
GRINDAR="001 002 003 004 005 006 007 008 009 010 011 012 013 016"
P=0; F=0; A=0; RAD=""
# Enter the original --kor-grindar + Darwin branch using synthetic gate fixtures.
# This does NOT pretend that the current host or the real kernel is Darwin-qualified.
for h in $GRINDAR; do
  G="verify/bin/h-$h-exit"
  [ -f "$G" ] || { A=$((A+1)); RAD="$RAD h-$h:-"; continue; }
  bash "$G" >/dev/null 2>&1; K=$?
  case $K in 0) P=$((P+1));; 1) F=$((F+1));; *) A=$((A+1));; esac
  RAD="$RAD h-$h:$K"
done
[ "$F" = "0" ] && [ "$A" = "0" ] && rad 1 "closure" JA "$P/14" || rad 1 "closure" OTHER
[ -f verify/bin/h-014-exit ] && rad 2 "h-014" JA || rad 2 "h-014" NEJ
SUB="$(python3 - <<'PYSUB'
import json
d = json.load(open('specs/tasks.spec.json'))
ts = d['tasks'] if isinstance(d, dict) and 'tasks' in d else d
ids = {t.get('id') for t in (ts if isinstance(ts, list) else ts.values())}
print(len(ids & {'h-027', 'h-028', 'h-029', 'h-030'}))
PYSUB
)"
[ "$SUB" = "4" ] && rad 3 "substitution" JA || rad 3 "substitution" NEJ
[ -f verify/bin/h-015-exit ] && rad 4 "h-015" JA || rad 4 "h-015" NEJ
[ -f verify/bin/autonomous-loop-exit ] && rad 5 "program" JA || rad 5 "program" NEJ
[ -f docs/loop/autonomy-kernel-v1-acceptance.md ] && rad 6 "acceptance" JA || rad 6 "acceptance" NEJ
echo "UPPFYLLDA=$UPPFYLLDA"
[ "$UPPFYLLDA" = "6" ] && { echo KERNEL_COMPLETE; exit 0; }
exit 1
'''


def completion_test(root: Path, env: dict[str, str]) -> dict[str, Any]:
    root.mkdir()
    for h in "001 002 003 004 005 006 007 008 009 010 011 012 013 016".split():
        put(root, f"verify/bin/h-{h}-exit", "exit 0\n")
    for name in ["h-014-exit", "h-015-exit", "autonomous-loop-exit"]:
        put(root, f"verify/bin/{name}", f"echo {name} >> actually-called.txt\nexit 1\n")
    put(root, "specs/tasks.spec.json", json.dumps({"tasks": [{"id": f"h-{n:03}"} for n in range(27, 31)]}))
    accept = put(root, "docs/loop/autonomy-kernel-v1-acceptance.md", "")
    p = run(["bash", "-c", COMPLETION_FRAGMENT], root, env, check=False)
    not_called = not (root / "actually-called.txt").exists()
    actual_gate_codes = {name: run(["bash", f"verify/bin/{name}"], root, env, check=False).returncode
                         for name in ["h-014-exit", "h-015-exit", "autonomous-loop-exit"]}
    # Negative controls: one missing artifact or one red member of the fourteen.
    accept.unlink()
    missing = run(["bash", "-c", COMPLETION_FRAGMENT], root, env, check=False)
    accept.write_text("")
    put(root, "verify/bin/h-003-exit", "exit 1\n")
    red = run(["bash", "-c", COMPLETION_FRAGMENT], root, env, check=False)
    assert missing.returncode == red.returncode == 1
    return result("T01", SOURCES["completion"], "Completion must require passing, not merely existing, required gates.",
                  p.returncode == 0 and "KERNEL_COMPLETE" in p.stdout and not_called and all(x == 1 for x in actual_gate_codes.values()),
                  {"classifier_exit": p.returncode, "classifier_output": p.stdout.strip(),
                   "three_required_gates_not_invoked_by_classifier": not_called,
                   "their_exits_when_actually_invoked": actual_gate_codes,
                   "substitution_tasks_have_no_exit_test": True, "acceptance_document_empty": True},
                  {"missing_acceptance_exit": missing.returncode, "red_member_of_fourteen_exit": red.returncode})


READINESS_FRAGMENT = r'''
bash "$VALIDATOR" >"$VAL_LOG" 2>&1; v=$?
av="$(awk '$NF=="AVVIKER"' "$VAL_LOG" 2>/dev/null | wc -l | tr -d ' ')"
[ "${av:-0}" = "0" ] && row=JA || row=NEJ
printf 'validator_exit=%s row=%s\n' "$v" "$row"
'''


def readiness_test(root: Path, env: dict[str, str]) -> dict[str, Any]:
    root.mkdir()
    observations = {}
    cases = {"unknown": "echo 'probe ODÖMBART'; exit 2\n",
             "crash": "echo 'execution failed' >&2; exit 127\n",
             "empty_output": "exit 0\n",
             "genuine_deviation": "echo 'probe AVVIKER'; exit 1\n",
             "genuine_confirmation": "echo 'probe BEKRÄFTAT'; exit 0\n"}
    for name, code in cases.items():
        validator = put(root, name + ".sh", code)
        e = {**env, "VALIDATOR": str(validator), "VAL_LOG": str(root / (name + ".log"))}
        observations[name] = run(["bash", "-c", READINESS_FRAGMENT], root, e).stdout.strip()
    assert "row=NEJ" in observations["genuine_deviation"]
    assert "row=JA" in observations["genuine_confirmation"]
    return result("T02", SOURCES["readiness"], "Unknown or failed validation must not produce a green readiness row.",
                  all("row=JA" in observations[k] for k in ("unknown", "crash", "empty_output")), observations,
                  {k: observations[k] for k in ("genuine_deviation", "genuine_confirmation")})


def lane_test(root: Path, env: dict[str, str]) -> dict[str, Any]:
    repo(root, env)
    equal_base = git(root, env, "diff", "--quiet", "HEAD", "origin/main", check=False).returncode
    git(root, env, "checkout", "-qb", "nortropic/fixture-candidate")
    put(root, "candidate.txt", "Legitimate candidate change\n")
    git(root, env, "add", "candidate.txt")
    git(root, env, "commit", "-qm", "candidate")
    diff_rc = git(root, env, "diff", "--quiet", "HEAD", "origin/main", check=False).returncode
    behind = git(root, env, "rev-list", "--count", "HEAD..origin/main").stdout.strip()
    clean = git(root, env, "status", "--porcelain").stdout == ""
    ancestor_rc = git(root, env, "merge-base", "--is-ancestor", "origin/main", "HEAD", check=False).returncode
    git(root, env, "checkout", "-q", "--detach", "origin/main")
    git(root, env, "commit", "-qm", "empty new commit", "--allow-empty")
    empty_diff = git(root, env, "diff", "--quiet", "HEAD", "origin/main", check=False).returncode
    identity_equal = git(root, env, "rev-parse", "HEAD").stdout == git(root, env, "rev-parse", "origin/main").stdout
    return result("T03", SOURCES["lane"], "Candidate divergence must not be confused with stale main; tree equality is not commit identity.",
                  diff_rc == 1 and behind == "0" and clean and ancestor_rc == 0 and empty_diff == 0 and not identity_equal,
                  {"clean_candidate": clean, "missing_commits_from_origin_main": int(behind),
                   "origin_main_is_ancestor_exit": ancestor_rc, "documented_diff_probe_exit": diff_rc,
                   "empty_commit_diff_exit": empty_diff, "empty_commit_has_same_identity_as_origin_main": identity_equal},
                  {"unchanged_base_diff_exit": equal_base})


PRESERVATION_FRAGMENT = r'''
set -u
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
# Original partition/staging order; shortened messages, no push or post-commit hook.
if [ -n "$VANLIGA" ]; then
  git add -- $VANLIGA
  git commit -q -m '[AUTOCOMMIT] documentation first'
fi
if [ -n "$PARAGRAF_A" ]; then
  git add -- $PARAGRAF_A
  git commit -q -m '[AUTOCOMMIT][HÖGRISK-OGRANSKAD] controller second'
fi
'''


def preservation_test(root: Path, env: dict[str, str]) -> dict[str, Any]:
    repo(root, env)
    git(root, env, "checkout", "-qb", "nortropic/fixture-preserve")
    base = git(root, env, "rev-parse", "HEAD").stdout.strip()
    put(root, "controller/demo.py", "print('new code')\n")
    put(root, "docs/loop/drift.md", "## 2026-09-17\nEvidence for the same code change.\n")
    run(["bash", "-c", PRESERVATION_FRAGMENT], root, env)
    commits = git(root, env, "rev-list", "--reverse", f"{base}..HEAD").stdout.splitlines()
    files = [git(root, env, "diff-tree", "--no-commit-id", "--name-only", "-r", sha).stdout.splitlines() for sha in commits]
    same_commit = any({"controller/demo.py", "docs/loop/drift.md"}.issubset(set(fs)) for fs in files)
    return result("T04", SOURCES["preservation"], "A code change and its required documentation must remain in the same commit.",
                  len(commits) == 2 and not same_commit,
                  {"commits_created": len(commits), "files_per_commit_in_creation_order": files,
                   "any_commit_contains_code_and_documentation": same_commit,
                   "network_or_push_used": False})


CLASSIFY_FRAGMENT = r'''
klassa() {
  local h="$1"
  git merge-base --is-ancestor "$h" origin/main 2>/dev/null && { echo "I_MAIN"; return; }
  if [ -n "$(git branch -r --contains "$h" 2>/dev/null | head -1)" ]; then
    echo "PA_REMOTE"; return
  fi
  echo "FORALDRALOS"
}
klassa HEAD
'''


def origin_test(root: Path, env: dict[str, str]) -> dict[str, Any]:
    repo(root, env)
    git(root, env, "checkout", "-qb", "nortropic/local-only")
    put(root, "local-only.txt", "not present in any origin reference\n")
    git(root, env, "add", "local-only.txt")
    git(root, env, "commit", "-qm", "local only")
    before = run(["bash", "-c", CLASSIFY_FRAGMENT], root, env).stdout.strip()
    git(root, env, "update-ref", "refs/remotes/stale-other-remote/archive", "HEAD")
    after = run(["bash", "-c", CLASSIFY_FRAGMENT], root, env).stdout.strip()
    origin_refs = git(root, env, "for-each-ref", "--contains=HEAD", "--format=%(refname)", "refs/remotes/origin/").stdout.splitlines()
    git(root, env, "update-ref", "refs/remotes/origin/saved", "HEAD")
    positive = run(["bash", "-c", CLASSIFY_FRAGMENT], root, env).stdout.strip()
    return result("T05", SOURCES["inventory"], "Fresh origin evidence cannot be replaced by a local reference belonging to another remote.",
                  before == "FORALDRALOS" and after == "PA_REMOTE" and origin_refs == [],
                  {"before_other_remote_reference": before, "after_other_remote_reference": after,
                   "origin_references_containing_candidate": origin_refs,
                   "real_remote_contacted": False},
                  {"with_matching_origin_reference": positive})


CLEANUP_FRAGMENT = r'''
# Same final verdict inputs: no counted Git dangers, but ignored content exists.
n_foraldralos=0; g_farliga=0; n_smutsig=0; k_farlig=0; k_smutsfarlig=0
FARA=$((n_foraldralos + g_farliga + n_smutsig + k_farlig + k_smutsfarlig))
if [ "$FARA" = "0" ]; then
  echo "✅ REGEL 12 UPPFYLLD — allt lokalt arbete finns på git."
  echo "   Städning kan ske utan att något går förlorat."
fi
[ "$FARA" = "0" ] || exit 1
exit 0
'''


def ignored_fixture(root: Path, env: dict[str, str]) -> Path:
    repo(root, env)
    put(root, ".gitignore", "scratch/\n")
    git(root, env, "add", ".gitignore")
    git(root, env, "commit", "-qm", "ignore scratch")
    git(root, env, "update-ref", "refs/remotes/origin/main", "HEAD")
    return put(root, "scratch/evidence.txt", "Evidence not recorded in Git.\n")


def cleanup_test(root: Path, env: dict[str, str]) -> dict[str, Any]:
    artifact = ignored_fixture(root, env)
    clean = git(root, env, "status", "--porcelain").stdout == ""
    ignored = git(root, env, "status", "--porcelain", "--ignored=matching").stdout.splitlines()
    tracked = git(root, env, "ls-files", "scratch/evidence.txt").stdout.splitlines()
    p = run(["bash", "-c", CLEANUP_FRAGMENT], root, env)
    return result("T06", SOURCES["inventory"], "A scoped preservation verdict must not authorize lossless cleanup of excluded content.",
                  clean and artifact.exists() and tracked == [] and "Städning kan ske" in p.stdout and p.returncode == 0,
                  {"normal_git_status_clean": clean, "ignored_status_entries": ignored,
                   "evidence_is_tracked": bool(tracked), "final_decision_exit": p.returncode,
                   "final_decision_output": p.stdout.strip(), "files_deleted_in_this_test": False})


def counts(root: Path, env: dict[str, str]) -> dict[str, int]:
    return {"normal": len(git(root, env, "status", "--porcelain").stdout.splitlines()),
            "ignored": sum(s.startswith("!!") for s in git(root, env, "status", "--porcelain", "--ignored=matching").stdout.splitlines())}


def unchanged_test(root: Path, env: dict[str, str]) -> dict[str, Any]:
    artifact = ignored_fixture(root, env)
    before = counts(root, env)
    before_sha = hashlib.sha256(artifact.read_bytes()).hexdigest()
    unchanged_control = counts(root, env) == before
    artifact.write_text("DIFFERENT evidence bytes, same directory and status count.\n", encoding="utf-8")
    after = counts(root, env)
    after_sha = hashlib.sha256(artifact.read_bytes()).hexdigest()
    e = {**env, "FORE": str(before["normal"]), "EFTER": str(after["normal"]),
         "FORE_IG": str(before["ignored"]), "EFTER_IG": str(after["ignored"])}
    fragment = r'''if [ "$FORE" = "$EFTER" ] && [ "$FORE_IG" = "$EFTER_IG" ]; then
  echo "OK — grindarna lämnade trädet orört, ignorerade filer inräknade"
else echo "changed"; fi'''
    p = run(["bash", "-c", fragment], root, e)
    return result("T07", SOURCES["measurement"], "Equal status-entry counts do not prove unchanged filesystem contents.",
                  before == after and before_sha != after_sha and "orört" in p.stdout,
                  {"status_counts_before": before, "status_counts_after": after,
                   "ignored_file_sha256_before": before_sha, "ignored_file_sha256_after": after_sha,
                   "decision_output": p.stdout.strip()},
                  {"no_mutation_keeps_counts_equal": unchanged_control})


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path("results.json"))
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="nortropic-audit-fixtures-") as d:
        root = Path(d)
        home = root / "isolated-home"
        home.mkdir()
        env = {**os.environ, "HOME": str(home), "GIT_CONFIG_NOSYSTEM": "1",
               "GIT_CONFIG_SYSTEM": os.devnull, "GIT_CONFIG_GLOBAL": os.devnull,
               "LC_ALL": "C", "NORTROPIC_AUTOPUSH": "0"}
        # Prevent ambient Git context from redirecting fixture operations.
        for k in ("GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_COMMON_DIR",
                  "GIT_OBJECT_DIRECTORY", "GIT_ALTERNATE_OBJECT_DIRECTORIES"):
            env.pop(k, None)
        tests = [completion_test, readiness_test, lane_test, preservation_test,
                 origin_test, cleanup_test, unchanged_test]
        results = [f(root / f.__name__, env) for f in tests]
        git_version = run(["git", "--version"], root, env).stdout.strip()
    report = {"audit_date": "2026-09-17", "repository": "Nortropic/nortropic-system",
              "main_commit": MAIN, "platform_commit": PLATFORM,
              "method": "Reduced decision-fragment reproductions in disposable fixtures; not whole-script or Darwin/kernel qualification",
              "environment": {"os": platform.system(), "python": platform.python_version(), "git": git_version},
              "real_network_calls": 0, "real_kernel_gates_executed": 0,
              "tests": results, "all_counterexamples_reproduced": len(results) == 7}
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"7/7 counterexamples reproduced. This is NOT 7 kernel failures or a kernel qualification.\n{args.output}")
    for r in results:
        print(f"{r['id']} {r['result']}: {r['property_under_test']}")


if __name__ == "__main__":
    main()
