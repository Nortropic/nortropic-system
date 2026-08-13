#!/usr/bin/env python3.12
"""Focused regressions for the shared H-035 authority boundary."""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / "controller/authority"))
from core import AuthorityError, overlaps, parse_path, permits, strict_json_bytes  # noqa: E402

AUTH = ROOT / "controller/authority/cli"
TASKVAL = ROOT / "controller/taskval/cli"
STATE = ROOT / "controller/state/cli"


def run(argv: list[object], *, cwd: Path = ROOT, stdin: str | None = None):
    return subprocess.run([str(value) for value in argv], cwd=cwd, input=stdin,
                          text=True, capture_output=True, shell=False)


def main() -> int:
    passed = failed = 0

    def check(name: str, condition: bool, detail: str = "") -> None:
        nonlocal passed, failed
        if condition:
            passed += 1
        else:
            failed += 1
            print(f"FAIL {name}: {detail}")

    malformed = ["", "/x", "./x", "x//y", "x/../y", "x/*", "**", "C:/x"]
    for value in malformed:
        try:
            parse_path(value)
            rejected = False
        except AuthorityError:
            rejected = True
        check(f"path-reject-{value!r}", rejected)
    check("path-backslash", parse_path(r"safe\x") == ("safe/x", False))
    check("path-parent-overlap", overlaps("verify/**", "verify/h034/kernel"))
    check("path-child-not-permit-parent", not permits("safe/x", "safe/x/child"))
    try:
        strict_json_bytes(b'{"x":1,"x":2}')
        duplicate_rejected = False
    except AuthorityError:
        duplicate_rejected = True
    check("duplicate-json-key", duplicate_rejected)

    with tempfile.TemporaryDirectory(prefix="h035-authority-fall-") as raw:
        tmp = Path(raw)
        state = tmp / "state"
        attest = tmp / "attest"
        run([STATE, "init", state])
        attest.mkdir()
        owner_spec = tmp / "owner.json"
        owner_spec.write_text(json.dumps({"spec_version": "2.0.0", "tasks": [{
            "id": "owner", "authority_class": "owner_authority", "allowed_write": [],
            "owner_author_allowed_write": ["controller/h034-native/**"],
            "docs_impact": [], "depends_on": []}]}))
        first = run([TASKVAL, "claim", owner_spec, attest, state])
        second = run([TASKVAL, "claim", owner_spec, attest, state])
        rebuilt = run([STATE, "rebuild", state])
        check("owner-claim-no-provider-output", first.returncode == 0 and not first.stdout.strip())
        check("owner-restart-ineligible", second.returncode == 0 and not second.stdout.strip())
        table = json.loads(rebuilt.stdout)
        check("owner-state-persisted", table == [{"task": "owner", "status": "OWNER_ACTION_REQUIRED"}],
              rebuilt.stdout)

        repo = tmp / "repo"
        run(["git", "init", "-q", repo])
        run(["git", "config", "user.name", "fixture"], cwd=repo)
        run(["git", "config", "user.email", "fixture@example.invalid"], cwd=repo)
        (repo / "seed").write_text("seed\n")
        run(["git", "add", "seed"], cwd=repo)
        run(["git", "commit", "-qm", "base"], cwd=repo)
        base = run(["git", "rev-parse", "HEAD"], cwd=repo).stdout.strip()
        (repo / "specs").mkdir()
        (repo / "specs/tasks.spec.json").write_text("{}\n")
        run(["git", "add", "specs/tasks.spec.json"], cwd=repo)
        run(["git", "commit", "-qm", "add authority"], cwd=repo)
        present = run(["git", "rev-parse", "HEAD"], cwd=repo).stdout.strip()
        (repo / "specs/tasks.spec.json").unlink()
        run(["git", "add", "-u"], cwd=repo)
        run(["git", "commit", "-qm", "delete authority"], cwd=repo)
        deleted = run(["git", "rev-parse", "HEAD"], cwd=repo).stdout.strip()
        common = {"repo": str(repo), "base_sha": present, "candidate_sha": deleted,
                  "task_id": "h-035"}
        result = run([AUTH, "validate-task"], stdin=json.dumps(common))
        check("deleted-authority-does-not-fallback", result.returncode == 1
              and "deleted" in result.stdout, result.stdout)
        check("fixture-base-created", len(base) == 40)

    print(f"{passed} PASS {failed} FAIL")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
