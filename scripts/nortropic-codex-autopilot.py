#!/usr/bin/env python3
"""Nortropic Codex Build Autopilot v4 — provider-neutral trust-kernel roadmap.

Unattended workflow executor for the owner-authorized Nortropic autonomous-loop roadmap after
Harness Substitution Amendment v1. The original frozen plan remains authority for required effects;
the substitution contract supersedes only implementation shape that would duplicate provider-native
session/context/tool/retry machinery.

Agent prose is never trust authority. Git identity, containment, frozen gates, deterministic policy,
attestation/fencing and guarded publication drive trust transitions. No force/amend/reset/rebase
remediation semantics are implemented.
"""

from __future__ import annotations

import argparse
import datetime as dt
import fcntl
import hashlib
import json
import os
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

AUTHORITY_LIB = Path(__file__).resolve().parents[1] / "controller/authority"
# Normal orchestrator execution must not mutate the immutable candidate merely
# by loading the shared authority parser.
sys.dont_write_bytecode = True
sys.path.insert(0, str(AUTHORITY_LIB))
from core import (AuthorityError, canonical_path, permits,
                  strict_json_bytes)  # noqa: E402

EXPECTED_REPO = "Nortropic/nortropic-system"
OWNER_DECISION_PATH = "docs/loop/owner-h003-attestation-authority-v1.md"
REPORT_SCHEMA_PATH = "docs/loop/codex-autopilot-report.schema.json"
PROVIDER_IDENTITY_PATH = "config/codex-provider-identity.json"
PYTHON_IDENTITY_PATH = "config/python-interpreter-authority-v1.json"
PROVIDER_IDENTITY_KEYS = {
    "schema_version", "provider", "executable_path", "executable_sha256",
    "code_mode_host_path", "code_mode_host_sha256",
}
PYTHON_IDENTITY_KEYS = {
    "schema_version", "authority_version", "canonical_path", "python_version",
    "executable_sha256", "required_regular_file", "required_executable",
    "symlink_allowed", "path_lookup_allowed", "usr_bin_env_allowed",
    "requester_override_allowed", "isolated_flags", "environment_authority",
    "runtime_binding_model",
}
MAX_PROVIDER_AUTHORITY_BYTES = 16 * 1024
MAX_PROVIDER_EXECUTABLE_BYTES = 256 * 1024 * 1024
AUTOPILOT_ROLE_POLICY = {
    "ARCHITECT": ("gpt-5.6-sol", "max"),
    "TEST_AUTHOR": ("gpt-5.6-sol", "max"),
    "GATE_REVIEWER": ("gpt-5.6-sol", "max"),
    "BUILDER": ("gpt-5.6-sol", "high"),
    "REVIEWER": ("gpt-5.6-sol", "max"),
    "EMPIRICAL": ("gpt-5.6-sol", "max"),
}
REJECTED_S3 = "1e21a7fe150f25626301f3656893d1798ae46c3d"
FULL_ROADMAP_OWNER_PATH = "docs/loop/codex-autopilot-v3-full-roadmap.md"
SUBSTITUTION_OWNER_PATH = "docs/loop/harness-substitution-contract-v1.md"
SUBSTITUTION_AUDIT_PATH = "docs/loop/harness-substitution-audit-2026-08-11.md"
ROADMAP_PLAN_BRANCH = "plan/autonomous-loop-v1"
ROADMAP_PLAN_SHA = "0b3212c991d4227c8df2656465ae2c0252dda39e"
ROADMAP_PLAN_PATH = "docs/loop/autonomous-loop-plan-v1.md"
ROADMAP_HANDOFF_PATH = "docs/loop/autonomous-loop-codex-handoff.md"

H003_GATE_SUBJECT = "[LOOP] ÄGARHAND: freeze h-003 attestation authority v1"
H003_BUILD_SUBJECT = "[LOOP] h-003: attestation authority protocol v1"
H004_BUILD_SUBJECT = "[LOOP] h-004: heartbeat generation integration v2"

TEST_AUTHOR_ALLOWED = {
    "specs/tasks.spec.json",
    "verify/bin/h-003-exit",
    "verify/bin/h-004-exit",
    "docs/05-beslutslogg.md",
    "docs/loop/drift.md",
}

FORBIDDEN_GIT_TOKENS = (
    "--force",
    "--force-with-lease",
    "--amend",
)
MAX_ARCHITECT_ROUNDS = 5
SUBSTITUTION_BEFORE_NEW_HARNESS_COMPONENT = True
ROADMAP_PLAN_BLOBS = {
    ROADMAP_PLAN_PATH: "c8ea851167f38f6846485035ee2e6b1dc3b54db0",
    ROADMAP_HANDOFF_PATH: "1e53887c59b8da0989579eaa241c5b53ea02abb9",
}
# Platform document generation after the 2026-09-10 repository split: router
# documents and docs/loop/** only, pinned by blob on origin/main.
SUBSTITUTION_BLOBS = {
    "AGENTS.md": "c90ebebd6a71b7623516271d07a4ef72759c4457",
    "CLAUDE.md": "630ce3275cbf09e167bcc46861e893043a90861c",
    "README.md": "20df72000ecf9899aac48c80590e5803d008a160",
    "docs/loop/byggplan-v3.md": "c0b3b04b09fe901a16df9c83a81c37d157aa03bb",
    "docs/loop/codex-evidence-contract.md": "18b833174d1673c24e00b6c2f28601d9ab5f48fd",
    "docs/loop/drift.md": "8f0fbacb9ed401d53a1113b7effc0a6ff92078a7",
    "docs/loop/owner-author-workflow-v1.md": "4aabf054c217cfd5cdca46456d11f25de0211bbf",
    "docs/loop/regler.md": "b0bc10ae78ed8eb4ee9a1767921111eb94faa146",
    "docs/loop/remaining-bootstrap-delegation-v1.md": "20319089c4085b79ec2b8f600396c71b21dbd392",
    SUBSTITUTION_OWNER_PATH: "4a41e3952f55453ba2e83b2d553f7af2b76d5705",
    SUBSTITUTION_AUDIT_PATH: "bb5f99c111cd5aaf784e73e67bde354023b1b5f2",
}


class Stop(RuntimeError):
    pass


class ContractRefreeze(Stop):
    def __init__(self, task_id: str, reason: str):
        super().__init__(reason)
        self.task_id = task_id
        self.reason = reason


@dataclass
class Cmd:
    rc: int
    out: str


@dataclass
class AgentRun:
    report: dict[str, Any]
    thread_id: str | None
    event_log: Path
    result_file: Path


@dataclass(frozen=True)
class RoadmapSlice:
    code: str
    task_id: str
    title: str
    gate_path: str
    required_deps: tuple[str, ...]
    plan_allowed_write: tuple[str, ...] | None = None


# Exact task/gate mapping after Harness Substitution Amendment v1.
# SUB-0 is the owner amendment itself and is therefore not a synthetic builder task.
# SUB-1..SUB-4 are frozen here by owner identity/scope, while each concrete task/gate is still
# authored RED by TEST_AUTHOR and independently challenged before any builder implementation.
SUBSTITUTION_ROADMAP: tuple[RoadmapSlice, ...] = (
    RoadmapSlice(
        "SUB-1", "h-027", "AgentProvider interface plus Codex adapter", "verify/bin/h-027-exit",
        ("h-004", "h-006", "h-008", "h-009", "h-011", "h-013", "h-016", "h-017"),
        ("controller/provider/**", "tests/controller/provider/**", "docs/05-beslutslogg.md"),
    ),
    RoadmapSlice(
        "SUB-2", "h-028", "split provider launch from G20 containment", "verify/bin/h-028-exit",
        ("h-017", "h-027"),
        (
            "controller/launch/**", "controller/provider/**", "tests/controller/launch/**",
            "tests/controller/provider/**", "docs/05-beslutslogg.md",
        ),
    ),
    RoadmapSlice(
        "SUB-3", "h-029", "structured provider result plus canonical TaskContract projection", "verify/bin/h-029-exit",
        ("h-007", "h-027", "h-028"),
        (
            "controller/provider/**", "controller/taskcontract/**", "controller/worker/**", "controller/envelope/**",
            "tests/controller/provider/**", "tests/controller/taskcontract/**", "tests/controller/worker/**",
            "tests/controller/envelope/**", "docs/05-beslutslogg.md",
        ),
    ),
    RoadmapSlice(
        "SUB-4", "h-030", "thin task supervisor plus bounded cross-attempt retries", "verify/bin/h-030-exit",
        ("h-003", "h-004", "h-010", "h-012", "h-013", "h-017", "h-029"),
        (
            "controller/loop/**", "controller/brytare/**", "controller/provider/**", "tests/controller/loop/**",
            "tests/controller/brytare/**", "tests/controller/provider/**", "docs/05-beslutslogg.md", "docs/loop/drift.md",
        ),
    ),
)

# Original S2–S13 capability identities remain stable. Required effects, migration intent and
# negative controls remain bound to ROADMAP_PLAN_SHA, while implementation shape is interpreted
# through SUBSTITUTION_OWNER_PATH. S2/S4/S5 gain h-030 as the provider-neutral migration floor;
# later slices inherit that floor transitively.
ROADMAP: tuple[RoadmapSlice, ...] = (
    RoadmapSlice("S2", "h-015", "recovery / crash consistency", "verify/bin/h-015-exit",
                 ("h-010", "h-013", "h-016", "h-004", "h-030"),
                 ("controller/atertag/**", "tests/controller/atertag/**", "docs/05-beslutslogg.md")),
    RoadmapSlice("S4", "h-018", "minimal structured FailureArtifact", "verify/bin/h-018-exit",
                 ("h-012", "h-013", "h-016", "h-017", "h-030"),
                 ("controller/aterkoppling/**", "controller/envelope/cli", "tests/controller/aterkoppling/**", "docs/05-beslutslogg.md")),
    RoadmapSlice("S5", "h-019", "normalized typed events / projection", "verify/bin/h-019-exit",
                 ("h-001", "h-016", "h-030"),
                 ("controller/handelse/**", "controller/loop/**", "tests/controller/handelse/**", "docs/05-beslutslogg.md")),
    RoadmapSlice("S6", "h-014", "notification from typed lifecycle events", "verify/bin/h-014-exit",
                 ("h-019",),
                 ("controller/notis/**", "controller/loop/**", "tests/controller/notis/**", "docs/05-beslutslogg.md")),
    RoadmapSlice("S7", "h-020", "verified auto-promotion", "verify/bin/h-020-exit",
                 ("h-017", "h-015", "h-004", "h-019"),
                 ("controller/befordran/**", "tests/controller/befordran/**", "docs/05-beslutslogg.md")),
    RoadmapSlice("S8", "h-021", "merge conflict reasoning plus full re-verification", "verify/bin/h-021-exit",
                 ("h-020",),
                 ("controller/konflikt/**", "tests/controller/konflikt/**", "docs/05-beslutslogg.md")),
    RoadmapSlice("S9", "h-022", "trusted control-plane transition", "verify/bin/h-022-exit",
                 ("h-020",),
                 ("controller/overvakare/**", "tests/controller/overvakare/**", "docs/05-beslutslogg.md")),
    RoadmapSlice("S10", "h-023", "Markdown intake and canonical Task IR", "verify/bin/h-023-exit",
                 ("h-019", "h-007"),
                 ("controller/intag/**", "tests/controller/intag/**", "docs/05-beslutslogg.md")),
    RoadmapSlice("S11", "h-024", "provider verifier author/challenger plus kernel freeze", "verify/bin/h-024-exit",
                 ("h-023", "h-017"),
                 ("controller/grindsmed/**", "tests/controller/grindsmed/**", "docs/05-beslutslogg.md")),
    RoadmapSlice("S12", "h-025", "evaluator adapter with bounded adversarial review", "verify/bin/h-025-exit",
                 ("h-018", "h-019"),
                 ("controller/bedomare/**", "tests/controller/bedomare/**", "docs/05-beslutslogg.md")),
    RoadmapSlice("S13", "h-026", "read / typed-command projection", "verify/bin/h-026-exit",
                 ("h-019",),
                 ("controller/lucka/**", "tests/controller/lucka/**", "docs/05-beslutslogg.md")),
)

EMPIRICAL_STAGE = "L"
EMPIRICAL_MAX_ROUNDS = 5
EMPIRICAL_GATE_PATH = "verify/bin/autonomous-loop-exit"
EMPIRICAL_GATE_SUBJECT = "[LOOP] ÄGARHAND: freeze empirical autonomous-loop closeout L"
EMPIRICAL_GATE_ALLOWED = {EMPIRICAL_GATE_PATH, "docs/05-beslutslogg.md", "docs/loop/drift.md"}


def now_id() -> str:
    return dt.datetime.now().strftime("%Y%m%d-%H%M%S")


def run(argv: list[str], cwd: Path | None = None, *, check: bool = True,
        timeout: int | None = None, env: dict[str, str] | None = None) -> Cmd:
    if not argv or not all(isinstance(x, str) and x for x in argv):
        raise Stop(f"invalid argv: {argv!r}")
    if argv[0].rsplit(os.sep, 1)[-1].casefold() == "codex":
        raise Stop("generic process boundary cannot launch Codex")
    if argv[0] == "git":
        joined = " ".join(argv)
        if any(tok in joined for tok in FORBIDDEN_GIT_TOKENS):
            raise Stop(f"forbidden git semantics requested: {joined}")
        if len(argv) > 1 and argv[1] in {"reset", "rebase"}:
            raise Stop(f"history rewrite command forbidden: {joined}")
        if any(arg.startswith("+") for arg in argv[1:]):
            raise Stop(f"leading + refspec forbidden: {joined}")
    p = subprocess.run(
        argv,
        cwd=str(cwd) if cwd else None,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        timeout=timeout,
        env=env,
    )
    if check and p.returncode != 0:
        raise Stop(f"command failed rc={p.returncode}: {' '.join(argv)}\n{p.stdout}")
    return Cmd(p.returncode, p.stdout)


def git(repo: Path, *args: str, check: bool = True, timeout: int | None = None) -> Cmd:
    return run(["git", *args], cwd=repo, check=check, timeout=timeout)


def clean(repo: Path) -> bool:
    return git(repo, "status", "--porcelain=v1", "--untracked-files=all").out.strip() == ""


def sha(repo: Path, ref: str = "HEAD") -> str:
    return git(repo, "rev-parse", ref).out.strip()


def branch(repo: Path) -> str:
    return git(repo, "branch", "--show-current").out.strip()


def changed_files(repo: Path, base_ref: str = "HEAD") -> list[str]:
    names: set[str] = set()
    # `git diff <commit>` compares the complete working tree/index view against that
    # commit, so it also gives cumulative PR scope when base_ref is the task base.
    for line in git(repo, "diff", "--name-only", base_ref).out.splitlines():
        if line.strip():
            names.add(line.strip())
    for line in git(repo, "diff", "--cached", "--name-only", base_ref).out.splitlines():
        if line.strip():
            names.add(line.strip())
    for line in git(repo, "ls-files", "--others", "--exclude-standard").out.splitlines():
        if line.strip():
            names.add(line.strip())
    return sorted(names)


def path_allowed(rel: str, patterns: Iterable[str]) -> bool:
    try:
        return any(permits(pattern, rel) for pattern in patterns)
    except AuthorityError as exc:
        raise Stop(f"invalid authority path: {exc}") from exc


def common_git_dir(repo: Path) -> Path:
    raw = git(repo, "rev-parse", "--git-common-dir").out.strip()
    p = Path(raw)
    return (repo / p).resolve() if not p.is_absolute() else p.resolve()


def journal_root(repo: Path) -> Path:
    p = common_git_dir(repo) / "nortropic-codex-autopilot"
    p.mkdir(parents=True, exist_ok=True)
    return p


def journal(repo: Path, event: str, **fields: Any) -> None:
    rec = {"ts": dt.datetime.now(dt.timezone.utc).isoformat(), "event": event, **fields}
    path = journal_root(repo) / "events.jsonl"
    with path.open("a", encoding="utf-8") as f:
        f.write(json.dumps(rec, ensure_ascii=False, sort_keys=True) + "\n")
    print(f"AUTOPILOT {event}: " + " ".join(f"{k}={v}" for k, v in fields.items()))


def load_spec(repo: Path) -> dict[str, Any]:
    try:
        data = json.loads((repo / "specs/tasks.spec.json").read_text(encoding="utf-8"))
    except Exception as e:
        raise Stop(f"cannot load tasks spec: {e}") from e
    if not isinstance(data, dict) or not isinstance(data.get("tasks"), list):
        raise Stop("tasks spec malformed")
    return data


def task_obj(repo: Path, task_id: str) -> dict[str, Any]:
    spec = load_spec(repo)
    hits = [t for t in spec["tasks"] if isinstance(t, dict) and t.get("id") == task_id]
    if len(hits) != 1:
        raise Stop(f"task {task_id} count={len(hits)}")
    return hits[0]


def task_obj_optional(repo: Path, task_id: str) -> dict[str, Any] | None:
    spec = load_spec(repo)
    hits = [t for t in spec["tasks"] if isinstance(t, dict) and t.get("id") == task_id]
    if len(hits) > 1:
        raise Stop(f"task {task_id} count={len(hits)}")
    return hits[0] if hits else None


def task_limits(repo: Path, task: dict[str, Any]) -> tuple[int, int]:
    defaults = load_spec(repo).get("defaults", {})
    return (
        int(task.get("max_changed_files", defaults.get("max_changed_files", 8))),
        int(task.get("max_added_lines", defaults.get("max_added_lines", 600))),
    )


def added_lines(repo: Path, files: Iterable[str], base_ref: str = "HEAD") -> int:
    tracked = set(git(repo, "ls-files").out.splitlines())
    total = 0
    diff = git(repo, "diff", "--numstat", base_ref).out
    for line in diff.splitlines():
        parts = line.split("\t", 2)
        if len(parts) == 3 and parts[0].isdigit():
            total += int(parts[0])
    for rel in files:
        if rel not in tracked:
            p = repo / rel
            if p.is_file():
                try:
                    total += len(p.read_text(encoding="utf-8").splitlines())
                except UnicodeDecodeError:
                    raise Stop(f"untracked binary/undecodable file in candidate: {rel}")
    return total


def assert_builder_scope(repo: Path, task_id: str, task_base: str) -> list[str]:
    task = task_obj(repo, task_id)
    delta_files = changed_files(repo, "HEAD")
    files = changed_files(repo, task_base)
    allowed = task.get("allowed_write") or load_spec(repo).get("defaults", {}).get("allowed_write", [])
    bad = [f for f in files if not path_allowed(f, allowed)]
    if bad:
        raise Stop(f"ALLOWED_WRITE_VIOLATION task={task_id}: {bad}")
    max_files, max_lines = task_limits(repo, task)
    adds = added_lines(repo, files, task_base)
    if len(files) > max_files:
        raise Stop(f"file budget exceeded: {len(files)} > {max_files}")
    if adds > max_lines:
        raise Stop(f"added-line budget exceeded: {adds} > {max_lines}")
    git(repo, "diff", "--check")
    git(repo, "diff", "--cached", "--check")
    return delta_files


def assert_test_author_scope(repo: Path, base_sha: str) -> list[str]:
    files = changed_files(repo)
    bad = [f for f in files if f not in TEST_AUTHOR_ALLOWED]
    if bad:
        raise Stop(f"test-author write outside owner surface: {bad}")
    if any(f.startswith("controller/") or f.startswith("tests/controller/") for f in files):
        raise Stop("test-author modified production/test implementation")
    if "specs/tasks.spec.json" in files:
        base_raw = git(repo, "show", f"{base_sha}:specs/tasks.spec.json").out
        base = json.loads(base_raw)
        cur = json.loads((repo / "specs/tasks.spec.json").read_text(encoding="utf-8"))
        for key in set(base) | set(cur):
            if key == "tasks":
                continue
            if base.get(key) != cur.get(key):
                raise Stop(f"test-author modified top-level spec key {key}")
        bmap = {t["id"]: t for t in base["tasks"]}
        cmap = {t["id"]: t for t in cur["tasks"]}
        if set(bmap) != set(cmap):
            raise Stop("test-author changed task id set")
        for tid in bmap:
            if tid not in {"h-003", "h-004"} and bmap[tid] != cmap[tid]:
                raise Stop(f"test-author modified non-authorized task object {tid}")
    git(repo, "diff", "--check")
    return files


def run_gate(repo: Path, task_id: str, timeout: int = 1200) -> Cmd:
    task = task_obj(repo, task_id)
    rel = task.get("exit_test")
    if not isinstance(rel, str) or not rel:
        raise Stop(f"task {task_id} has no exit_test")
    p = repo / rel
    if not p.exists():
        raise Stop(f"exit_test missing for {task_id}: {rel}")
    cmd = [str(p)] if os.access(p, os.X_OK) else ["bash", str(p)]
    res = run(cmd, cwd=repo, check=False, timeout=timeout)
    journal(repo, "GATE", task=task_id, exit=res.rc, command=" ".join(cmd))
    return res


def run_invariants(repo: Path) -> Cmd:
    p = repo / "scripts/check-invariants.mjs"
    if not p.exists():
        raise Stop(f"mandatory invariant verifier missing: {p}")
    res = run(["node", str(p)], cwd=repo, check=False, timeout=1200)
    journal(repo, "INVARIANTS", exit=res.rc)
    return res


def capture_green_gates(repo: Path) -> list[str]:
    spec = load_spec(repo)
    green: list[str] = []
    for t in spec["tasks"]:
        tid = t.get("id")
        if not isinstance(tid, str) or not isinstance(t.get("exit_test"), str):
            continue
        try:
            res = run_gate(repo, tid)
        except Stop as e:
            journal(repo, "BASELINE_GATE_UNJUDGEABLE", task=tid, reason=str(e))
            continue
        if res.rc == 0:
            green.append(tid)
    journal(repo, "BASELINE_GREEN_SET", tasks=green)
    return green


def assert_final_gates(repo: Path, task_id: str, baseline_green: Iterable[str]) -> None:
    current = run_gate(repo, task_id)
    if current.rc != 0:
        raise Stop(f"frozen task gate failed at final gate: {task_id} rc={current.rc}\n{current.out}")
    for tid in baseline_green:
        if tid == task_id:
            continue
        res = run_gate(repo, tid)
        if res.rc != 0:
            raise Stop(f"historically green gate regressed: {tid} rc={res.rc}\n{res.out}")
    inv = run_invariants(repo)
    if inv is not None and inv.rc != 0:
        raise Stop(f"invariants failed rc={inv.rc}\n{inv.out}")


def ensure_dependencies() -> None:
    for name in ("git", "gh", "codex", "node"):
        if shutil.which(name) is None:
            raise Stop(f"required executable missing: {name}")
    if sys.version_info < (3, 11):
        raise Stop(f"Python 3.11+ required, got {sys.version.split()[0]}")
    run(["gh", "auth", "status"])


def repo_identity(repo: Path) -> str:
    out = run(["gh", "repo", "view", "--json", "nameWithOwner", "-q", ".nameWithOwner"], cwd=repo).out.strip()
    return out


def origin_main(repo: Path) -> str:
    git(repo, "fetch", "origin", "main")
    return sha(repo, "refs/remotes/origin/main")


def worktrees(repo: Path) -> list[dict[str, str]]:
    raw = git(repo, "worktree", "list", "--porcelain").out
    rows: list[dict[str, str]] = []
    cur: dict[str, str] = {}
    for line in raw.splitlines() + [""]:
        if not line:
            if cur:
                rows.append(cur)
            cur = {}
            continue
        key, _, val = line.partition(" ")
        cur[key] = val
    return rows


def local_branch_exists(repo: Path, name: str) -> bool:
    return git(repo, "show-ref", "--verify", "--quiet", f"refs/heads/{name}", check=False).rc == 0


def ensure_worktree(repo: Path, wt_root: Path, branch_name: str, base_sha: str,
                    dirname: str) -> Path:
    wt_root.mkdir(parents=True, exist_ok=True)
    wanted = (wt_root / dirname).resolve()
    for row in worktrees(repo):
        if row.get("branch") == f"refs/heads/{branch_name}":
            p = Path(row["worktree"]).resolve()
            if not clean(p):
                raise Stop(f"existing worktree for {branch_name} is dirty: {p}")
            head = sha(p)
            if head != base_sha:
                head_before_base = git(repo, "merge-base", "--is-ancestor", head, base_sha, check=False).rc == 0
                base_before_head = git(repo, "merge-base", "--is-ancestor", base_sha, head, check=False).rc == 0
                if head_before_base:
                    git(p, "merge", "--ff-only", base_sha)
                elif base_before_head:
                    # Clean descendant = an immutable candidate left by an interrupted
                    # orchestrator run. Keep it and re-run reviewer/final gates.
                    journal(repo, "RECOVER_CANDIDATE", branch=branch_name, base=base_sha, candidate=head)
                else:
                    raise Stop(f"existing branch {branch_name} diverges from required base: head={head} base={base_sha}")
            return p
    if wanted.exists() and any(wanted.iterdir()):
        raise Stop(f"wanted worktree path already non-empty: {wanted}")
    if local_branch_exists(repo, branch_name):
        git(repo, "worktree", "add", str(wanted), branch_name)
        if sha(wanted) != base_sha:
            head = sha(wanted)
            head_before_base = git(repo, "merge-base", "--is-ancestor", head, base_sha, check=False).rc == 0
            base_before_head = git(repo, "merge-base", "--is-ancestor", base_sha, head, check=False).rc == 0
            if head_before_base:
                git(wanted, "merge", "--ff-only", base_sha)
            elif base_before_head:
                journal(repo, "RECOVER_CANDIDATE", branch=branch_name, base=base_sha, candidate=head)
            else:
                raise Stop(f"local branch {branch_name} diverges from required base {base_sha}")
    else:
        git(repo, "worktree", "add", "-b", branch_name, str(wanted), base_sha)
    if not clean(wanted):
        raise Stop(f"new worktree is dirty: {wanted}")
    head = sha(wanted)
    if head != base_sha and git(repo, "merge-base", "--is-ancestor", base_sha, head, check=False).rc != 0:
        raise Stop(f"new worktree identity is neither base nor descendant candidate: {wanted} head={head} base={base_sha}")
    return wanted


def detached_worktree(repo: Path, wt_root: Path, name: str, commit_sha: str) -> Path:
    p = (wt_root / name).resolve()
    if p.exists():
        if any(p.iterdir()):
            raise Stop(f"review worktree path not empty: {p}")
    git(repo, "worktree", "add", "--detach", str(p), commit_sha)
    if sha(p) != commit_sha or not clean(p):
        raise Stop(f"detached reviewer identity mismatch: {p}")
    return p


def remove_worktree(repo: Path, p: Path) -> None:
    if p.exists() and not clean(p):
        raise Stop(f"refusing to remove dirty reviewer worktree: {p}")
    git(repo, "worktree", "remove", str(p))


def agent_prompt_common() -> str:
    return """
You are running under Nortropic Codex Operating Model v4 provider-neutral trust-kernel autonomy.
Do not commit, push, open a PR, merge, reset, rebase, amend, force-push, or rewrite Git history.
The orchestrator owns Git trust transitions.
Use actual commands/evidence. PASS/FAIL only for tests actually run. Mark unknowns OVERIFIERAT.
OWNER_DECISION_REQUIRED is an INTERNAL signal to the autonomous architect, not a request for the human owner.
Use it only when you can name a concrete missing architecture boundary. Ordinary design choices inside the frozen roadmap + harness-substitution contract must be resolved autonomously. Apply the substitution test before adding custom harness machinery; provider/session output is never trust authority.
A true human-only boundary is outcome=BLOCKED with stop_reason prefixed HUMAN_AUTHORITY_HARD_STOP:.
Your final response MUST conform exactly to docs/loop/codex-autopilot-report.schema.json.
""".strip()


def _read_stable_opened(fd: int, limit: int, label: str) -> bytes:
    before = os.fstat(fd)
    if not stat.S_ISREG(before.st_mode) or before.st_size < 0 or before.st_size > limit:
        raise Stop(f"{label} is not a bounded regular file")
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = os.read(fd, min(1024 * 1024, limit + 1 - total))
        if not chunk:
            break
        chunks.append(chunk)
        total += len(chunk)
        if total > limit:
            raise Stop(f"{label} exceeds {limit} bytes")
    after = os.fstat(fd)
    stable = (before.st_dev, before.st_ino, before.st_mode, before.st_size,
              before.st_mtime_ns, before.st_ctime_ns) == (
              after.st_dev, after.st_ino, after.st_mode, after.st_size,
              after.st_mtime_ns, after.st_ctime_ns)
    if not stable or total != before.st_size:
        raise Stop(f"{label} changed while being read")
    return b"".join(chunks)


def _strict_provider_authority(repo: Path) -> tuple[Path, str, Path, str]:
    authority_path = repo / PROVIDER_IDENTITY_PATH
    flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
    try:
        fd = os.open(authority_path, flags)
    except OSError as e:
        raise Stop(f"provider identity authority unavailable: {e}") from e
    try:
        raw = _read_stable_opened(fd, MAX_PROVIDER_AUTHORITY_BYTES,
                                  "provider identity authority")
    finally:
        os.close(fd)
    try:
        value = strict_json_bytes(raw)
    except (AuthorityError, UnicodeError, ValueError) as e:
        raise Stop(f"provider identity authority is not strict JSON: {e}") from e
    if not isinstance(value, dict) or set(value) != PROVIDER_IDENTITY_KEYS:
        raise Stop("provider identity authority has unexpected keys")
    schema, provider = value["schema_version"], value["provider"]
    executable, digest = value["executable_path"], value["executable_sha256"]
    host, host_digest = value["code_mode_host_path"], value["code_mode_host_sha256"]
    if (type(schema) is not int or schema != 2 or type(provider) is not str
            or provider != "openai-codex" or type(executable) is not str
            or not executable or type(digest) is not str
            or not re.fullmatch(r"[0-9a-f]{64}", digest)
            or type(host) is not str or not host or type(host_digest) is not str
            or not re.fullmatch(r"[0-9a-f]{64}", host_digest)):
        raise Stop("provider identity authority has invalid values")
    path = Path(executable)
    host_path = Path(host)
    if not path.is_absolute() or not host_path.is_absolute():
        raise Stop("provider execution-family paths must be absolute")
    return path, digest, host_path, host_digest


def _provider_snapshot(repo: Path) -> tuple[Path, Path, str, Path, str]:
    source, expected, host_source, host_expected = _strict_provider_authority(repo)
    flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
    payloads: list[bytes] = []
    for member_source, member_expected, label in (
        (source, expected, "provider executable"),
        (host_source, host_expected, "code-mode host executable"),
    ):
        try:
            fd = os.open(member_source, flags)
        except OSError as e:
            raise Stop(f"{label} unavailable: {e}") from e
        try:
            opened = os.fstat(fd)
            if not stat.S_ISREG(opened.st_mode) or not (opened.st_mode & 0o111):
                raise Stop(f"{label} is not a regular executable file")
            payload = _read_stable_opened(fd, MAX_PROVIDER_EXECUTABLE_BYTES, label)
        finally:
            os.close(fd)
        if hashlib.sha256(payload).hexdigest() != member_expected:
            raise Stop(f"{label} digest does not match authority")
        payloads.append(payload)

    root = Path(tempfile.mkdtemp(prefix="nortropic-provider-"))
    try:
        snapshots: list[Path] = []
        for basename, payload, member_expected, label in (
            ("provider", payloads[0], expected, "provider"),
            ("codex-code-mode-host", payloads[1], host_expected, "code-mode host"),
        ):
            member = root / basename
            out = os.open(member, os.O_WRONLY | os.O_CREAT | os.O_EXCL
                          | getattr(os, "O_CLOEXEC", 0), 0o700)
            try:
                view = memoryview(payload)
                while view:
                    written = os.write(out, view)
                    if written <= 0:
                        raise OSError(f"short {label} snapshot write")
                    view = view[written:]
                os.fsync(out)
            finally:
                os.close(out)
            with member.open("rb") as final:
                final_digest = hashlib.sha256(final.read()).hexdigest()
            if final_digest != member_expected:
                raise Stop(f"private {label} snapshot changed while being created")
            snapshots.append(member)
        snapshot, host_snapshot = snapshots
        return root, snapshot, expected, host_snapshot, host_expected
    except BaseException:
        os.chmod(root, 0o700)
        shutil.rmtree(root)
        raise


def _python_snapshot(root: Path) -> tuple[Path, str]:
    authority_path = Path(__file__).resolve().parents[1] / PYTHON_IDENTITY_PATH
    flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
    try:
        fd = os.open(authority_path, flags)
    except OSError as e:
        raise Stop(f"controller Python authority unavailable: {e}") from e
    try:
        raw = _read_stable_opened(fd, MAX_PROVIDER_AUTHORITY_BYTES,
                                  "controller Python authority")
    finally:
        os.close(fd)
    try:
        value = strict_json_bytes(raw)
    except (AuthorityError, UnicodeError, ValueError) as e:
        raise Stop(f"controller Python authority is not strict JSON: {e}") from e
    if not isinstance(value, dict) or set(value) != PYTHON_IDENTITY_KEYS:
        raise Stop("controller Python authority has unexpected keys")
    digest = value["executable_sha256"]
    exact = (
        type(value["schema_version"]) is int and value["schema_version"] == 1
        and value["authority_version"] == "python3.12-v1"
        and type(value["canonical_path"]) is str and bool(value["canonical_path"])
        and value["python_version"] == "3.12.13"
        and type(digest) is str and bool(re.fullmatch(r"[0-9a-f]{64}", digest))
        and value["required_regular_file"] is True
        and value["required_executable"] is True
        and value["symlink_allowed"] is False
        and value["path_lookup_allowed"] is False
        and value["usr_bin_env_allowed"] is False
        and value["requester_override_allowed"] is False
        and value["isolated_flags"] == ["-I", "-S"]
        and value["environment_authority"] is False
        and value["runtime_binding_model"]
            == "same-opened-source-private-protected-snapshot-final-rehash"
    )
    source = Path(value["canonical_path"])
    if not exact or not source.is_absolute():
        raise Stop("controller Python authority has invalid values")
    try:
        fd = os.open(source, flags)
    except OSError as e:
        raise Stop(f"controller Python executable unavailable: {e}") from e
    try:
        opened = os.fstat(fd)
        if not stat.S_ISREG(opened.st_mode) or not (opened.st_mode & 0o111):
            raise Stop("controller Python is not a regular executable file")
        payload = _read_stable_opened(fd, MAX_PROVIDER_EXECUTABLE_BYTES,
                                      "controller Python executable")
    finally:
        os.close(fd)
    if hashlib.sha256(payload).hexdigest() != digest:
        raise Stop("controller Python digest does not match authority")
    snapshot = root / "python3.12"
    out = os.open(snapshot, os.O_WRONLY | os.O_CREAT | os.O_EXCL
                  | getattr(os, "O_CLOEXEC", 0), 0o700)
    try:
        view = memoryview(payload)
        while view:
            written = os.write(out, view)
            if written <= 0:
                raise OSError("short controller Python snapshot write")
            view = view[written:]
        os.fsync(out)
    finally:
        os.close(out)
    with snapshot.open("rb") as final:
        if hashlib.sha256(final.read()).hexdigest() != digest:
            raise Stop("private controller Python snapshot changed before launch")
    return snapshot, digest


def run_codex(repo: Path, wt: Path, role: str, prompt: str) -> AgentRun:
    route = AUTOPILOT_ROLE_POLICY.get(role)
    if route is None:
        raise Stop(f"unknown autopilot role: {role!r}")
    model, reasoning_effort = route
    jr = journal_root(repo) / "runs" / f"{now_id()}-{role.lower()}"
    jr.mkdir(parents=True, exist_ok=False)
    events = jr / "events.jsonl"
    result = jr / "result.json"
    schema = wt / REPORT_SCHEMA_PATH
    if not schema.exists():
        raise Stop(f"report schema missing in worktree: {schema}")
    full_prompt = prompt.rstrip() + "\n\n" + agent_prompt_common()
    (snapshot_root, snapshot, snapshot_digest,
     host_snapshot, host_snapshot_digest) = _provider_snapshot(repo)
    try:
        python_snapshot, python_digest = _python_snapshot(snapshot_root)
        provider_argv = [
            str(snapshot),
            "-C", str(wt),
            "-a", "never",
            "--sandbox", "danger-full-access",
            "exec",
            "--ignore-user-config",
            "-m", model,
            "-c", f'model_reasoning_effort="{reasoning_effort}"',
            "--json",
            "--output-schema", str(schema),
            "-o", str(result),
            full_prompt,
        ]
        envelope = jr / "provider-envelope.json"
        envelope.write_text(json.dumps({"task_id": prompt, "role": role}), encoding="utf-8")
        launcher = Path(__file__).resolve().parents[1] / "controller/launch/cli"
        argv = [str(python_snapshot), "-I", "-S", str(launcher),
                "run", str(wt), str(envelope), "86400", "--", *provider_argv]
        env = {key: value for key, value in os.environ.items()
               if not key.startswith("DYLD_")
               and key not in {"LD_PRELOAD", "LD_LIBRARY_PATH", "__PYVENV_LAUNCHER__"}}
        env["NORTROPIC_TRUST_ROOT"] = str(snapshot_root)
        thread_id: str | None = None
        # Protect the complete execution family first.  Every final identity
        # read is deliberately after the last successful mode transition and
        # adjacent to AGENT_START/spawn.
        os.chmod(snapshot, 0o500)
        os.chmod(host_snapshot, 0o500)
        os.chmod(python_snapshot, 0o500)
        os.chmod(snapshot_root, 0o500)
        with snapshot.open("rb") as final:
            if hashlib.sha256(final.read()).hexdigest() != snapshot_digest:
                raise Stop("private provider snapshot changed at launch boundary")
        with host_snapshot.open("rb") as final:
            if hashlib.sha256(final.read()).hexdigest() != host_snapshot_digest:
                raise Stop("private code-mode host snapshot changed at launch boundary")
        with python_snapshot.open("rb") as final:
            if hashlib.sha256(final.read()).hexdigest() != python_digest:
                raise Stop("private controller Python changed at launch boundary")
        journal(repo, "AGENT_START", role=role, model=model,
                reasoning_effort=reasoning_effort,
                model_routing_source="AUTOPILOT_ROLE_POLICY",
                worktree=str(wt), head=sha(wt))
        with events.open("w", encoding="utf-8") as log:
            p = subprocess.Popen(argv, cwd=str(wt), stdout=subprocess.PIPE,
                                 stderr=subprocess.STDOUT, text=True, bufsize=1, env=env)
            assert p.stdout is not None
            for line in p.stdout:
                sys.stdout.write(line)
                log.write(line)
                log.flush()
                try:
                    obj = json.loads(line)
                except Exception:
                    continue
                if obj.get("type") == "thread.started" and isinstance(obj.get("thread_id"), str):
                    thread_id = obj["thread_id"]
            rc = p.wait()
    finally:
        cleanup_error: OSError | None = None
        for _cleanup_attempt in range(3):
            if not snapshot_root.exists():
                break
            try:
                os.chmod(snapshot_root, 0o700)
            except OSError as exc:
                cleanup_error = exc
            try:
                shutil.rmtree(snapshot_root)
            except OSError as exc:
                cleanup_error = exc
            else:
                break
        if snapshot_root.exists():
            raise Stop("private provider execution family cleanup incomplete") from cleanup_error
    if rc != 0:
        raise Stop(f"Codex role {role} failed rc={rc}; events={events}")
    try:
        report = json.loads(result.read_text(encoding="utf-8"))
    except Exception as e:
        raise Stop(f"Codex role {role} produced invalid structured result: {e}; file={result}") from e
    if report.get("role") != role:
        raise Stop(f"Codex role mismatch expected={role} got={report.get('role')}")
    journal(repo, "AGENT_END", role=role, outcome=report.get("outcome"), thread_id=thread_id or "OVERIFIERAT")
    return AgentRun(report, thread_id, events, result)


def report_blockers(report: dict[str, Any]) -> list[dict[str, str]]:
    raw = report.get("blocking_findings")
    return raw if isinstance(raw, list) else []


def blocker_digest(report: dict[str, Any]) -> str:
    relevant = [(x.get("id"), x.get("summary")) for x in report_blockers(report)]
    raw = json.dumps(relevant, ensure_ascii=False, sort_keys=True).encode()
    return hashlib.sha256(raw).hexdigest()


def owner_need(report: dict[str, Any]) -> bool:
    return bool(report.get("owner_decision_required")) or report.get("outcome") == "OWNER_DECISION_REQUIRED"


def architect_prompt(stage: str, task_id: str, signal: dict[str, Any], context: str = "") -> str:
    return f"""
Use `$nortropic-architect`.

Resolve this roadmap-internal architecture signal WITHOUT modifying files:
STAGE={stage}
TASK_ID={task_id}
ROADMAP_PLAN_SHA={ROADMAP_PLAN_SHA}
ROADMAP_PLAN_PATH={ROADMAP_PLAN_PATH}
OWNER_DELEGATION={FULL_ROADMAP_OWNER_PATH}
SUBSTITUTION_AUTHORITY={SUBSTITUTION_OWNER_PATH}
SUBSTITUTION_AUDIT={SUBSTITUTION_AUDIT_PATH}

SIGNAL_SUMMARY={signal.get('summary', '')}
SIGNAL_STOP_REASON={signal.get('stop_reason', '')}
SIGNAL_FINDINGS={json.dumps(report_blockers(signal), ensure_ascii=False)}
{context}

Read higher authority, the exact frozen plan with git show, and the current-main substitution
contract. The plan remains authority for required effects/negative controls; the substitution
contract supersedes only implementation shape that would duplicate provider-native
session/context/tool/retry machinery.

The human owner has delegated normal S3/SUB-1..SUB-4/S2–S13/L architecture decisions to you.
Choose the smallest compatible public contract/effect. Do not ask the human to choose between
legitimate compatible designs.

MANDATORY SUBSTITUTION TEST before proposing new custom harness machinery:
1. What harness assumption/responsibility is being added/replaced?
2. Which provider primitive already owns it?
3. Which trust function must stay inside Nortropic?
4. Which unsafe implementation must the frozen gate reject?
5. Which legitimate alternative implementation must it accept?
If no independent trust boundary remains, prefer the provider primitive and keep Nortropic thin.

Never move these into provider authority: allowed/denied write policy, G20 containment, exact
candidate SHA/materialization, deterministic policy, frozen verifier/gate identity, attestation,
stale/invalidation, lease/fencing, recovery authority, promotion eligibility or guarded main
transition. Provider/session/reviewer output is evidence only.

For a frozen builder/reviewer task:
- next_action=BUILD if the existing frozen contract is sufficient and this is an implementation choice;
- next_action=TEST_AUTHOR only if the frozen contract itself truly needs a narrow re-freeze.
For test-author/gate-review stages, next_action=TEST_AUTHOR.
For EMPIRICAL_FAILURE, choose the exact existing owning task in next_task_id. An uncovered defect
behind a green judge normally requires next_action=TEST_AUTHOR before builder repair.

Return outcome=BLOCKED only for a genuine HUMAN_AUTHORITY_HARD_STOP as defined in
`{FULL_ROADMAP_OWNER_PATH}` and `{SUBSTITUTION_OWNER_PATH}`. Otherwise return outcome=READY and
owner_decision_required=false.
"""


def architect_resolution(repo: Path, wt: Path, stage: str, task_id: str,
                         signal: dict[str, Any], context: str = "") -> dict[str, Any]:
    before_head = sha(wt)
    before_status = git(wt, "status", "--porcelain=v1", "--untracked-files=all").out
    arun = run_codex(repo, wt, "ARCHITECT", architect_prompt(stage, task_id, signal, context))
    after_head = sha(wt)
    after_status = git(wt, "status", "--porcelain=v1", "--untracked-files=all").out
    if before_head != after_head or before_status != after_status:
        raise Stop(f"architect modified candidate state stage={stage} task={task_id}")
    r = arun.report
    if owner_need(r):
        raise Stop(f"HUMAN_AUTHORITY_HARD_STOP: architect attempted to delegate its delegated decision: {r.get('stop_reason')}")
    if r.get("outcome") == "BLOCKED":
        reason = str(r.get("stop_reason") or r.get("summary") or "architect blocked")
        if not reason.startswith("HUMAN_AUTHORITY_HARD_STOP:"):
            reason = "HUMAN_AUTHORITY_HARD_STOP: " + reason
        raise Stop(reason)
    if r.get("outcome") != "READY":
        raise Stop(f"architect returned non-ready outcome stage={stage} task={task_id}: {r}")
    journal(repo, "ARCHITECT_RESOLUTION", stage=stage, task=task_id,
            next_action=r.get("next_action") or "OVERIFIERAT", summary=r.get("summary", "")[:800])
    return r


def run_codex_resolving_architecture(repo: Path, wt: Path, role: str, prompt: str,
                                     stage: str, task_id: str, context: str = "") -> AgentRun:
    guidance: list[str] = []
    last_signal = ""
    for round_no in range(1, MAX_ARCHITECT_ROUNDS + 1):
        effective = prompt
        if guidance:
            effective += "\n\nAUTONOMOUS_ARCHITECT_RESOLUTIONS:\n" + "\n\n".join(guidance)
            effective += "\n\nApply these resolutions within higher authority. Do not re-ask the human for the same choice."
        arun = run_codex(repo, wt, role, effective)
        if not owner_need(arun.report):
            return arun
        signal = str(arun.report.get("stop_reason") or arun.report.get("summary") or "OWNER_DECISION_REQUIRED")
        if signal == last_signal and round_no == MAX_ARCHITECT_ROUNDS:
            raise Stop(f"HUMAN_AUTHORITY_HARD_STOP: architecture no-progress after {MAX_ARCHITECT_ROUNDS} rounds stage={stage} task={task_id}: {signal}")
        last_signal = signal
        resolution = architect_resolution(repo, wt, stage, task_id, arun.report, context)
        if role in {"BUILDER", "REVIEWER"} and resolution.get("next_action") == "TEST_AUTHOR":
            raise ContractRefreeze(task_id, str(resolution.get("summary") or signal))
        guidance.append(str(resolution.get("summary") or ""))
    raise Stop(f"HUMAN_AUTHORITY_HARD_STOP: architecture resolution budget exhausted stage={stage} task={task_id}")


def stage_and_commit(repo: Path, files: list[str], subject: str) -> str:
    if not files:
        raise Stop("candidate has no changed files")
    git(repo, "add", "--", *files)
    git(repo, "diff", "--cached", "--check")
    staged = [x for x in git(repo, "diff", "--cached", "--name-only").out.splitlines() if x]
    if sorted(staged) != sorted(files):
        raise Stop(f"staged file identity mismatch expected={files} actual={staged}")
    git(repo, "commit", "-m", subject)
    if not clean(repo):
        raise Stop("worktree dirty after candidate commit")
    c = sha(repo)
    journal(repo, "CANDIDATE_COMMIT", sha=c, subject=subject, files=files)
    return c


def reviewer_prompt(task_id: str, base_sha: str, candidate_sha: str) -> str:
    return f"""
Use `$nortropic-reviewer`.

Review task {task_id} against the frozen owner contract and frozen exit-test in this exact detached candidate.
BASE_SHA={base_sha}
CANDIDATE_SHA={candidate_sha}

Lock identity first. Inspect the complete base..candidate diff before accepting builder claims.
Try to falsify the implementation by effect, including concurrency/failure/cleanup paths relevant to the frozen criterion.
Run safe decisive tests where possible. Do not modify production files in this worktree.

Set outcome=READY only with no confirmed blocking findings.
Set outcome=NEEDS_REMEDIATION for confirmed blockers that the builder can fix inside current authority.
If you find a genuine missing contract boundary, outcome=OWNER_DECISION_REQUIRED is only an internal signal to the v4 architect. Apply the provider-substitution test first; do not ask the human to choose ordinary compatible designs.
"""


def builder_prompt(task_id: str, base_sha: str, extra: str = "") -> str:
    return f"""
Use `$nortropic-builder`.

Implement/remediate frozen task {task_id} from the current branch.
TASK={task_id}
TASK_BASE_SHA={base_sha}

Read AGENTS.md, the current task object in specs/tasks.spec.json, its frozen exit_test, docs/loop/regler.md, `{SUBSTITUTION_OWNER_PATH}` and relevant owner/drift documents.
Do PLAN-VS-CODE first. Stay strictly inside current allowed_write and budgets. Never modify the frozen spec/gate/register for this builder task.
Run targeted tests, the current frozen exit-test, directly affected historical regressions and adversarial self-review.
First green is not completion.

{extra}

Finish with outcome=READY only when the implementation is ready for the orchestrator's mechanical candidate gate. If a concrete frozen-contract gap exists, signal OWNER_DECISION_REQUIRED for the autonomous architect; do not widen the frozen judge yourself.
"""


def test_author_prompt() -> str:
    return f"""
Use `$nortropic-test-author`.

The S3 owner architecture decision is supplied in `{OWNER_DECISION_PATH}` and remains exact authority for h-003/h-004. The provider-neutral amendment in `{SUBSTITUTION_OWNER_PATH}` classifies h-003/h-004 as Trust Kernel KEEP and does not weaken them.
Rejected historical S3 candidate: {REJECTED_S3}. It is evidence only and must never be adopted, amended, reset, rebased or published.
Quota-aborted pre-substitution test-author branch `owner/h-003-attestation-validity-44d525a5dd60` and its dirty worktree are forensic evidence only. Do not copy/adopt their bytes. Work fresh from this run's authoritative BASE/current branch; independently derive the truthful gate contract.

Prepare/harden the existing h-003 and h-004 frozen owner contracts exactly within the edit surface named in the owner-decision file. Do not modify controller/** or tests/controller/** and do not implement production code.

Requirements include generic opaque h-003 authority generations; provisional → finalize validity; serialized authoritative mutation ordering/no resurrection; future h-004 lease_id binding; process-incarnation liveness; stale-operation/successor overlap; preservation of previous K controls; truthful RED baselines; positive anchors and adversarial mutants.

If the owner decision is mechanically sufficient and the gates can be frozen honestly, set:
frozen_gate_ready=true, baseline_red_for_right_reason=true, owner_decision_required=false, outcome=READY.
The owner resolution already settles multi-publication finalization. The v4 substitution amendment does not reopen that trust-kernel decision. If another concrete contract boundary is missing, signal OWNER_DECISION_REQUIRED to the autonomous architect and name it exactly; do not request human choice for ordinary roadmap design.
"""


def gate_reviewer_prompt(base_sha: str, candidate_sha: str) -> str:
    return f"""
Use `$nortropic-gate-reviewer`.

Independently falsify the fresh test-author candidate at exact CANDIDATE_SHA={candidate_sha} against BASE_SHA={base_sha}, `{OWNER_DECISION_PATH}` and `{SUBSTITUTION_OWNER_PATH}`.
The candidate worktree is detached and must remain read-only.

Check owner edit-surface, preservation of old controls, positive anchors, mechanism-agnostic effect binding, RED reason honesty, concurrency scheduling strength, rig/platform separation and vacuous implementations listed by the owner decision.
Do not repair the gate yourself.
"""


def remediation_prompt(role: str, task_id: str | None, findings: list[dict[str, str]], base_sha: str) -> str:
    rendered = json.dumps(findings, ensure_ascii=False, indent=2)
    if role == "TEST_AUTHOR":
        return f"""
Use `$nortropic-test-author` again on the existing candidate branch. The independent gate reviewer confirmed these blockers:
{rendered}

BASE_SHA={base_sha}
Owner authority remains `{OWNER_DECISION_PATH}`. Make the smallest gate/spec correction inside the same owner-authorized edit surface. Do not implement production code and do not rewrite history. Re-run decisive RED/adversarial evidence and return the structured report.
"""
    assert task_id is not None
    return f"""
Use `$nortropic-builder` again for TASK={task_id}. The independent reviewer confirmed these blockers against the latest immutable candidate:
{rendered}

TASK_BASE_SHA={base_sha}
Make the smallest remediation inside the existing frozen task allowed_write. Do not modify frozen artifacts and do not rewrite history. Re-run decisive tests and adversarial review, then return the structured report.
"""


def publish(repo: Path, wt: Path, branch_name: str, base_sha: str, candidate_sha: str,
            title: str, changed: list[str], *,
            publication_authority: dict[str, str]) -> str:
    """Publish one reviewed candidate using the bounded normal-merge protocol.

    Every identity used at the merge boundary is re-read after the ordinary
    push.  In particular, the task spec and gate are Git-object bytes from the
    reviewed candidate; mutable checkout bytes and caller-selected alternate
    authority never participate.
    """
    authority_keys = {
        "task_id", "task_spec_path", "task_spec_sha256", "gate_path",
        "gate_sha256", "review_artifact_path", "review_artifact_sha256",
    }
    if not isinstance(publication_authority, dict) or set(publication_authority) != authority_keys:
        raise Stop("publication_authority must contain the exact required fields")
    if not all(isinstance(value, str) and value for value in publication_authority.values()):
        raise Stop("publication_authority values must be non-empty strings")
    if publication_authority["task_spec_path"] != "specs/tasks.spec.json":
        raise Stop("publication task spec is not canonical")
    try:
        task_spec_path = canonical_path(publication_authority["task_spec_path"])
        gate_path = canonical_path(publication_authority["gate_path"])
    except AuthorityError as exc:
        raise Stop(f"invalid publication authority path: {exc}") from exc
    for key in ("task_spec_sha256", "gate_sha256", "review_artifact_sha256"):
        if re.fullmatch(r"[0-9a-f]{64}", publication_authority[key]) is None:
            raise Stop(f"invalid publication authority digest: {key}")
    if not re.fullmatch(r"[0-9a-f]{40}", base_sha) or not re.fullmatch(r"[0-9a-f]{40}", candidate_sha):
        raise Stop("publication commit identities must be exact lowercase SHA-1 values")
    if not isinstance(changed, list) or not changed or len(changed) != len(set(changed)):
        raise Stop("publication changed-file set must be non-empty and unique")
    try:
        changed = [canonical_path(path) for path in changed]
    except AuthorityError as exc:
        raise Stop(f"invalid publication changed path: {exc}") from exc

    # Pre-push lock.  Push is ordinary and never force-updates a ref.
    if not clean(wt) or sha(wt) != candidate_sha:
        raise Stop("publication candidate identity/cleanliness mismatch")
    git(wt, "fetch", "origin", "main")
    if sha(wt, "refs/remotes/origin/main") != base_sha:
        raise Stop("REMOTE_MAIN_CHANGED before push")
    git(wt, "push", "-u", "origin", branch_name)

    # A body lives under the common Git metadata, never in the candidate tree.
    body_dir = journal_root(repo) / "publish"
    body_dir.mkdir(exist_ok=True)
    body = body_dir / f"{now_id()}-{branch_name.replace('/', '-')}.md"
    body.write_text(
        "Nortropic guarded normal merge publication.\n\n"
        f"- expected base: `{base_sha}`\n"
        f"- reviewed candidate: `{candidate_sha}`\n"
        f"- changed files: {len(changed)}\n",
        encoding="utf-8",
    )
    existing = run(["gh", "pr", "view", branch_name, "--json",
                    "number,headRefOid,headRefName,baseRefName,baseRefOid,state,url"],
                   cwd=wt, check=False)
    if existing.rc != 0:
        run(["gh", "pr", "create", "--base", "main", "--head", branch_name,
             "--title", title, "--body-file", str(body)], cwd=wt)

    # Immediate pre-merge relock.  No network mutation occurs between the
    # final main fetch/identity checks below and the expected-head merge.
    repository_meta = json.loads(run(
        ["gh", "repo", "view", "--json", "nameWithOwner"], cwd=wt).out)
    if repository_meta.get("nameWithOwner") != EXPECTED_REPO:
        raise Stop(f"repository identity mismatch: {repository_meta}")
    git(wt, "fetch", "origin", "main")
    if sha(wt, "refs/remotes/origin/main") != base_sha:
        raise Stop("REMOTE_MAIN_CHANGED before merge")
    if not clean(wt) or sha(wt) != candidate_sha:
        raise Stop("candidate changed before merge")
    candidate_tree = sha(wt, f"{candidate_sha}^{{tree}}")
    remote = git(wt, "ls-remote", "origin", f"refs/heads/{branch_name}").out.split()
    if remote != [candidate_sha, f"refs/heads/{branch_name}"]:
        raise Stop(f"remote candidate mismatch: {remote}")

    meta = json.loads(run([
        "gh", "pr", "view", branch_name, "--json",
        "number,headRefOid,headRefName,baseRefName,baseRefOid,state,url",
    ], cwd=wt).out)
    if (meta.get("headRefOid"), meta.get("headRefName"), meta.get("baseRefName"),
            meta.get("baseRefOid"), meta.get("state")) != (
            candidate_sha, branch_name, "main", base_sha, "OPEN"):
        raise Stop(f"PR identity mismatch: {meta}")
    number = str(meta.get("number"))
    remote_files = [line for line in run(
        ["gh", "pr", "diff", number, "--name-only"], cwd=wt).out.splitlines() if line]
    if len(remote_files) != len(set(remote_files)) or sorted(remote_files) != sorted(changed):
        raise Stop(f"remote PR file set mismatch expected={changed} actual={remote_files}")

    spec_object = git(wt, "show", f"{candidate_sha}:{task_spec_path}", check=False)
    gate_object = git(wt, "show", f"{candidate_sha}:{gate_path}", check=False)
    if spec_object.rc or gate_object.rc:
        raise Stop("candidate publication authority object is missing")
    spec_raw = spec_object.out.encode("utf-8")
    gate_raw = gate_object.out.encode("utf-8")
    if hashlib.sha256(spec_raw).hexdigest() != publication_authority["task_spec_sha256"]:
        raise Stop("candidate task-spec identity mismatch")
    if hashlib.sha256(gate_raw).hexdigest() != publication_authority["gate_sha256"]:
        raise Stop("candidate gate identity mismatch")
    try:
        spec = strict_json_bytes(spec_raw)
    except AuthorityError as exc:
        raise Stop(f"candidate task spec is invalid: {exc}") from exc
    if not isinstance(spec, dict) or not isinstance(spec.get("tasks"), list):
        raise Stop("candidate task spec lacks tasks")
    rows = [row for row in spec["tasks"]
            if isinstance(row, dict) and row.get("id") == publication_authority["task_id"]]
    if publication_authority["task_id"] == EMPIRICAL_STAGE:
        if rows or gate_path != EMPIRICAL_GATE_PATH:
            raise Stop("canonical empirical program-gate binding mismatch")
    elif len(rows) != 1 or rows[0].get("exit_test") != gate_path:
        raise Stop("canonical task/gate binding mismatch")

    review_path = Path(publication_authority["review_artifact_path"])
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    try:
        descriptor = os.open(review_path, flags)
        with os.fdopen(descriptor, "rb") as handle:
            if not stat.S_ISREG(os.fstat(handle.fileno()).st_mode):
                raise Stop("review artifact is not a regular file")
            review_raw = handle.read()
    except OSError as exc:
        raise Stop(f"cannot read immutable review artifact: {exc}") from exc
    if hashlib.sha256(review_raw).hexdigest() != publication_authority["review_artifact_sha256"]:
        raise Stop("independent-review artifact identity mismatch")

    # Last main observation is publisher-owned and immediately precedes the
    # merge command.  The exact expected head is supplied to GitHub.
    git(wt, "fetch", "origin", "main")
    if sha(wt, "refs/remotes/origin/main") != base_sha:
        raise Stop("REMOTE_MAIN_CHANGED at final merge boundary")
    run(["gh", "pr", "merge", number, "--merge",
         "--match-head-commit", candidate_sha], cwd=wt)

    merged = json.loads(run([
        "gh", "pr", "view", number,
        "--json", "state,mergedAt,mergeCommit,headRefOid,url",
    ], cwd=wt).out)
    merge_commit = merged.get("mergeCommit")
    returned_sha = merge_commit.get("oid") if isinstance(merge_commit, dict) else None
    if (merged.get("state") != "MERGED" or not merged.get("mergedAt")
            or merged.get("headRefOid") != candidate_sha
            or not isinstance(returned_sha, str)
            or re.fullmatch(r"[0-9a-f]{40}", returned_sha) is None):
        raise Stop(f"GitHub did not report an exact merged result: {merged}")

    # GitHub's response is not success authority by itself.  Fetch and prove
    # the returned merge commit's exact main identity, graph and tree.
    git(wt, "fetch", "origin", "main")
    new_main = sha(wt, "refs/remotes/origin/main")
    if new_main != returned_sha:
        raise Stop(f"returned merge mismatch returned={returned_sha} origin/main={new_main}")
    parents = git(wt, "rev-list", "--parents", "-n", "1", returned_sha).out.split()
    if parents != [returned_sha, base_sha, candidate_sha]:
        raise Stop(f"merge parent order/count mismatch: {parents}")
    proved_candidate_tree = sha(wt, f"{candidate_sha}^{{tree}}")
    merged_tree = sha(wt, f"{returned_sha}^{{tree}}")
    if proved_candidate_tree != candidate_tree or merged_tree != candidate_tree:
        raise Stop("merge tree differs from reviewed candidate tree")
    journal(repo, "MERGED", pr=number, candidate=candidate_sha,
            main=new_main, tree=merged_tree)
    return new_main


def publication_authority(repo: Path, candidate_sha: str, task_id: str,
                          review_artifact: Path, *,
                          program_gate: str | None = None) -> dict[str, str]:
    """Derive the publication bundle from immutable candidate/review objects.

    Ordinary and owner tasks derive their gate only from their unique canonical
    task row.  Stage L is deliberately not a synthetic task: its exact program
    gate is owner-locked separately and must be supplied by that one caller.
    """
    task_spec_path = "specs/tasks.spec.json"
    spec_object = git(repo, "show", f"{candidate_sha}:{task_spec_path}", check=False)
    if spec_object.rc:
        raise Stop("candidate task spec object is missing")
    spec_raw = spec_object.out.encode("utf-8")
    try:
        spec = strict_json_bytes(spec_raw)
    except AuthorityError as exc:
        raise Stop(f"candidate task spec is invalid: {exc}") from exc
    if not isinstance(spec, dict) or not isinstance(spec.get("tasks"), list):
        raise Stop("candidate task spec lacks tasks")
    rows = [row for row in spec["tasks"]
            if isinstance(row, dict) and row.get("id") == task_id]
    if program_gate is None:
        if len(rows) != 1:
            raise Stop(f"publication task count for {task_id}: {len(rows)}")
        try:
            gate_path = canonical_path(rows[0].get("exit_test"))
        except AuthorityError as exc:
            raise Stop(f"publication task gate is invalid: {exc}") from exc
    else:
        if task_id != EMPIRICAL_STAGE or program_gate != EMPIRICAL_GATE_PATH or rows:
            raise Stop("program-gate publication identity is not canonical stage L")
        gate_path = canonical_path(program_gate)
    gate_object = git(repo, "show", f"{candidate_sha}:{gate_path}", check=False)
    if gate_object.rc:
        raise Stop("candidate publication gate object is missing")
    gate_raw = gate_object.out.encode("utf-8")
    try:
        descriptor = os.open(review_artifact, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
        with os.fdopen(descriptor, "rb") as handle:
            if not stat.S_ISREG(os.fstat(handle.fileno()).st_mode):
                raise Stop("review artifact is not a regular file")
            review_raw = handle.read()
    except OSError as exc:
        raise Stop(f"cannot bind independent-review artifact: {exc}") from exc
    return {
        "task_id": task_id,
        "task_spec_path": task_spec_path,
        "task_spec_sha256": hashlib.sha256(spec_raw).hexdigest(),
        "gate_path": gate_path,
        "gate_sha256": hashlib.sha256(gate_raw).hexdigest(),
        "review_artifact_path": str(review_artifact.resolve()),
        "review_artifact_sha256": hashlib.sha256(review_raw).hexdigest(),
    }



def ensure_roadmap_plan(repo: Path) -> None:
    # The plan is authority by exact immutable commit, never by the mutable branch tip.
    git(repo, "fetch", "origin", ROADMAP_PLAN_BRANCH)
    if git(repo, "cat-file", "-e", f"{ROADMAP_PLAN_SHA}^{{commit}}", check=False).rc != 0:
        raise Stop(f"frozen roadmap commit unavailable after fetch: {ROADMAP_PLAN_SHA}")
    for rel, expected_blob in ROADMAP_PLAN_BLOBS.items():
        actual = git(repo, "rev-parse", f"{ROADMAP_PLAN_SHA}:{rel}").out.strip()
        if actual != expected_blob:
            raise Stop(f"roadmap artifact identity mismatch path={rel} expected={expected_blob} actual={actual}")
    journal(repo, "ROADMAP_AUTHORITY", plan_sha=ROADMAP_PLAN_SHA, branch=ROADMAP_PLAN_BRANCH)


def ensure_substitution_authority(repo: Path) -> None:
    """Qualify the approved document generation from Git, never mutable worktree prose."""
    for rel, expected_blob in SUBSTITUTION_BLOBS.items():
        if git(repo, "cat-file", "-e", f"refs/remotes/origin/main:{rel}", check=False).rc != 0:
            raise Stop(f"substitution authority object unavailable from origin/main: {rel}")
        entry = git(repo, "ls-tree", "refs/remotes/origin/main", "--", rel, check=False)
        expected = f"100644 blob {expected_blob}\t{rel}"
        if entry.rc != 0 or entry.out.strip() != expected:
            raise Stop(f"substitution authority identity mismatch path={rel} expected={expected}")
    journal(
        repo,
        "SUBSTITUTION_AUTHORITY",
        contract=SUBSTITUTION_OWNER_PATH,
        contract_blob=SUBSTITUTION_BLOBS[SUBSTITUTION_OWNER_PATH],
        audit=SUBSTITUTION_AUDIT_PATH,
        audit_blob=SUBSTITUTION_BLOBS[SUBSTITUTION_AUDIT_PATH],
        document_blobs=SUBSTITUTION_BLOBS,
    )


def is_substitution_slice(sl: RoadmapSlice) -> bool:
    return sl.code.startswith("SUB-")


def slice_authority_text(sl: RoadmapSlice) -> str:
    if is_substitution_slice(sl):
        return (
            f"Owner substitution authority: {SUBSTITUTION_OWNER_PATH} on current authoritative main. "
            f"Supporting audit: {SUBSTITUTION_AUDIT_PATH}. The original frozen plan still binds trust/effect "
            f"requirements that the substitution contract explicitly preserves."
        )
    return (
        f"Original effect authority: exact plan {ROADMAP_PLAN_SHA}:{ROADMAP_PLAN_PATH}. "
        f"Implementation-shape authority: {SUBSTITUTION_OWNER_PATH} on current authoritative main."
    )


def roadmap_test_author_allowed(sl: RoadmapSlice) -> set[str]:
    allowed = {
        "specs/tasks.spec.json",
        sl.gate_path,
        "docs/05-beslutslogg.md",
        "docs/loop/drift.md",
    }
    # Frozen plan explicitly says S5's owner spec pass corrects byggplan §7 so S6 follows typed events.
    if sl.code == "S5":
        allowed.add("docs/loop/byggplan-v3.md")
    return allowed


def assert_roadmap_test_author_scope(repo: Path, base_sha: str, sl: RoadmapSlice) -> list[str]:
    files = changed_files(repo, base_sha)
    allowed = roadmap_test_author_allowed(sl)
    bad = [f for f in files if f not in allowed]
    if bad:
        raise Stop(f"roadmap test-author write outside owner surface slice={sl.code}: {bad}")
    if any(f.startswith("controller/") or f.startswith("tests/controller/") for f in files):
        raise Stop(f"roadmap test-author modified implementation slice={sl.code}")
    if "specs/tasks.spec.json" not in files and task_obj_optional(repo, sl.task_id) is None:
        raise Stop(f"roadmap test-author did not create required task object slice={sl.code} task={sl.task_id}")
    if sl.gate_path not in files and git(repo, "cat-file", "-e", f"{base_sha}:{sl.gate_path}", check=False).rc != 0:
        raise Stop(f"roadmap test-author did not create required frozen gate slice={sl.code}: {sl.gate_path}")
    if "specs/tasks.spec.json" in files:
        base_raw = git(repo, "show", f"{base_sha}:specs/tasks.spec.json").out
        base = json.loads(base_raw)
        cur = json.loads((repo / "specs/tasks.spec.json").read_text(encoding="utf-8"))
        for key in set(base) | set(cur):
            if key == "tasks":
                continue
            if base.get(key) != cur.get(key):
                raise Stop(f"roadmap test-author modified top-level spec key {key}")
        bmap = {t["id"]: t for t in base["tasks"]}
        cmap = {t["id"]: t for t in cur["tasks"]}
        changed_ids = sorted(tid for tid in set(bmap) | set(cmap) if bmap.get(tid) != cmap.get(tid))
        if changed_ids != [sl.task_id]:
            raise Stop(f"roadmap test-author changed task ids outside slice={sl.code}: {changed_ids}")
    task = task_obj(repo, sl.task_id)
    if task.get("exit_test") != sl.gate_path:
        raise Stop(f"roadmap task exit_test mismatch slice={sl.code}: {task.get('exit_test')!r}")
    aw = task.get("allowed_write")
    if not isinstance(aw, list) or not aw or not all(isinstance(x, str) and x for x in aw):
        raise Stop(f"roadmap task has no explicit nonempty allowed_write slice={sl.code}")
    if sl.plan_allowed_write is not None and set(aw) != set(sl.plan_allowed_write):
        raise Stop(
            f"roadmap task allowed_write differs from frozen plan slice={sl.code}: "
            f"expected={sorted(sl.plan_allowed_write)} actual={sorted(aw)}"
        )
    protected_exact = {
        "docs/07-konstitution.md",
        "docs/03-regelverk.md",
        "skills/nortropic-eval/references/eval-rubric.md",
        "skills/nortropic-plan/references/juridikflaggor.md",
        "agents/nortropic-steward.md",
        "AUTOPILOT",
        "scripts/check-invariants.mjs",
        "CLAUDE.md",
        "controller/verify/register.json",
    }
    protected_roots = ("specs/", "verify/", "workflows/", "tests/fixtures/")
    for pattern in aw:
        norm = pattern.replace(os.sep, "/").lstrip("./")
        if norm in protected_exact or any(norm == root.rstrip("/") or norm.startswith(root) for root in protected_roots):
            raise Stop(f"roadmap task attempts to make protected authority writable slice={sl.code}: {pattern}")
        # Broad glob patterns must also not encompass any exact protected file.
        if any(path_allowed(rel, [pattern]) for rel in protected_exact):
            raise Stop(f"roadmap task pattern encompasses protected authority slice={sl.code}: {pattern}")
    deps = task.get("depends_on") or []
    if not isinstance(deps, list) or not all(isinstance(x, str) for x in deps):
        raise Stop(f"roadmap task depends_on malformed slice={sl.code}")
    missing_deps = [d for d in sl.required_deps if d not in deps]
    if missing_deps:
        raise Stop(f"roadmap task misses frozen-plan dependencies slice={sl.code}: {missing_deps}")
    git(repo, "diff", "--check", base_sha)
    return files


def roadmap_test_author_prompt(sl: RoadmapSlice, base_sha: str) -> str:
    source = slice_authority_text(sl)
    sub_note = (
        "This is a SUBSTITUTION slice. Treat harness-substitution-contract-v1.md §5–§7 as the exact "
        "owner contract for task identity, dependencies, builder allowed_write and required effects."
        if is_substitution_slice(sl)
        else
        "This is an original S-slice. Preserve the exact frozen plan's required effects/negative controls, "
        "but apply the substitution contract wherever the old implementation shape would duplicate provider harness capability."
    )
    return f"""
Use `$nortropic-test-author`.

This is Codex Operating Model v4 provider-neutral trust-kernel execution.
BASE_SHA={base_sha}
PLAN_SHA={ROADMAP_PLAN_SHA}
PLAN_PATH={ROADMAP_PLAN_PATH}
OWNER_DELEGATION={FULL_ROADMAP_OWNER_PATH}
SUBSTITUTION_AUTHORITY={SUBSTITUTION_OWNER_PATH}
SUBSTITUTION_AUDIT={SUBSTITUTION_AUDIT_PATH}
SLICE_AUTHORITY={source}

You are preparing exactly {sl.code}: {sl.title}.
TASK_ID={sl.task_id}
REQUIRED_EXIT_TEST={sl.gate_path}
REQUIRED_DEPENDENCIES={','.join(sl.required_deps) if sl.required_deps else 'NONE'}
PLAN_ALLOWED_WRITE={json.dumps(list(sl.plan_allowed_write) if sl.plan_allowed_write is not None else [], ensure_ascii=False)}

Read:
  git show {ROADMAP_PLAN_SHA}:{ROADMAP_PLAN_PATH}
  {SUBSTITUTION_OWNER_PATH}
  {SUBSTITUTION_AUDIT_PATH}
and higher authority. {sub_note}

Owner delegation:
- make ordinary architecture choices needed to produce a truthful mechanism-neutral task contract
  and RED frozen gate without asking the human again;
- create/update ONLY task `{sl.task_id}` in specs/tasks.spec.json and gate `{sl.gate_path}` plus
  docs/05-beslutslogg.md / docs/loop/drift.md when needed; for original S5 only, the frozen plan
  additionally permits its documented owner-pass correction to docs/loop/byggplan-v3.md §7;
- do NOT implement production code or tests/controller/**;
- do NOT alter constitution/rulebook/frozen plan, unrelated tasks, existing frozen gates, or weaken
  any green regression control;
- exact builder allowed_write must equal PLAN_ALLOWED_WRITE above;
- bind every REQUIRED_DEPENDENCY above; additional legacy dependencies may remain only when truthful;
- effect-level positive anchors and adversarial negative controls are mandatory;
- baseline current production must be RED exit 1 for the new criterion for the right product reason;
- platform/environment inability is not product RED.

MANDATORY SUBSTITUTION TEST must be explicit in your reasoning and reflected in the gate:
1. old/new harness responsibility;
2. provider primitive that owns session/context/tool/retry behavior;
3. trust responsibility retained by Nortropic;
4. unsafe implementation the gate rejects;
5. legitimate alternative implementation it accepts.
Do not source-shape the gate to one provider or implementation.

Provider/session/model reports may never certify verification, attestation, promotion or authoritative
main. G20 containment, candidate SHA, deterministic policy/gates, attestation/fencing and promotion
remain kernel-owned.

OWNER_DECISION_REQUIRED is only for a genuine higher-authority contradiction or an actually
unexpressible public contract boundary. Normal choices under the plan + substitution contract are delegated.
"""


def roadmap_gate_reviewer_prompt(sl: RoadmapSlice, base_sha: str, candidate_sha: str) -> str:
    return f"""
Use `$nortropic-gate-reviewer`.

Independently falsify the frozen-contract candidate for {sl.code}: {sl.title}.
BASE_SHA={base_sha}
CANDIDATE_SHA={candidate_sha}
TASK_ID={sl.task_id}
PLAN_SHA={ROADMAP_PLAN_SHA}
PLAN_PATH={ROADMAP_PLAN_PATH}
OWNER_DELEGATION={FULL_ROADMAP_OWNER_PATH}
SUBSTITUTION_AUTHORITY={SUBSTITUTION_OWNER_PATH}
SLICE_AUTHORITY={slice_authority_text(sl)}

Read the exact frozen plan and substitution owner contract. Verify only the current slice task
object/gate/docs changed; exact owner-bound dependencies and allowed_write hold; the gate binds
public effects rather than one implementation/provider; previous green semantics remain preserved;
positive anchors exist; unsafe mutants go red; a legitimate alternative provider/implementation can
pass; and no model/provider output is promoted to verification/attestation/promotion authority.
Do not repair the candidate.
"""


def roadmap_remediation_prompt(sl: RoadmapSlice, findings: list[dict[str, str]], base_sha: str) -> str:
    rendered = json.dumps(findings, ensure_ascii=False, indent=2)
    return f"""
Use `$nortropic-test-author` again for {sl.code} / task {sl.task_id} under the same owner authority.
Independent gate review confirmed these blockers:
{rendered}

BASE_SHA={base_sha}
PLAN_SHA={ROADMAP_PLAN_SHA}
SUBSTITUTION_AUTHORITY={SUBSTITUTION_OWNER_PATH}
SLICE_AUTHORITY={slice_authority_text(sl)}
Make the smallest correction inside the same owner surface. Do not implement production code,
change unrelated tasks, weaken green legacy gates or rewrite history. Re-run decisive RED and
substitution/adversarial evidence.
"""


def roadmap_contract_flow(repo: Path, wt_root: Path, sl: RoadmapSlice, guidance: str = "") -> str:
    ensure_roadmap_plan(repo)
    ensure_substitution_authority(repo)
    base = origin_main(repo)
    br = f"owner/roadmap-{sl.code.lower()}-contract-{base[:12]}"
    wt = ensure_worktree(repo, wt_root, br, base, f"roadmap-{sl.code.lower()}-contract-{base[:12]}")
    if not clean(wt):
        raise Stop(f"roadmap contract worktree dirty before agent slice={sl.code}")
    head = sha(wt)
    if head == base:
        agent = run_codex_resolving_architecture(repo, wt, "TEST_AUTHOR", roadmap_test_author_prompt(sl, base) + ("\n\nARCHITECT_REFREEZE_GUIDANCE:\n" + guidance if guidance else ""), f"{sl.code}_TEST_AUTHOR", sl.task_id).report
        if sha(wt) != base:
            raise Stop(f"roadmap test-author changed Git history slice={sl.code}")
        if agent.get("owner_decision_required") or agent.get("outcome") == "OWNER_DECISION_REQUIRED":
            raise Stop(f"architecture routing failure roadmap test-author slice={sl.code}: {agent.get('stop_reason')}")
        if agent.get("outcome") != "READY" or agent.get("frozen_gate_ready") is not True or agent.get("baseline_red_for_right_reason") is not True:
            raise Stop(f"roadmap test-author did not establish freeze-ready state slice={sl.code}: {agent}")
        files = assert_roadmap_test_author_scope(wt, base, sl)
        gate = run_gate(wt, sl.task_id)
        if gate.rc != 1:
            raise Stop(f"roadmap owner gate baseline must be RED exit 1 slice={sl.code}, got {gate.rc}\n{gate.out}")
        candidate = stage_and_commit(wt, files, f"[LOOP] ÄGARHAND: freeze {sl.code} {sl.title}")
    else:
        if git(repo, "merge-base", "--is-ancestor", base, head, check=False).rc != 0:
            raise Stop(f"roadmap contract recovery candidate not based on current main slice={sl.code}: {head}")
        candidate = head
        files = assert_roadmap_test_author_scope(wt, base, sl)
        if not files:
            raise Stop(f"roadmap contract recovery has no owner-surface diff slice={sl.code}")
        gate = run_gate(wt, sl.task_id)
        if gate.rc != 1:
            raise Stop(f"recovered roadmap contract must preserve RED slice={sl.code}, got {gate.rc}")
        journal(repo, "RECOVER_ROADMAP_CONTRACT", slice=sl.code, candidate=candidate)
    seen: list[str] = []
    while True:
        rvwt = detached_worktree(repo, wt_root, f"gate-review-{sl.code.lower()}-{candidate[:12]}", candidate)
        try:
            review_run = run_codex_resolving_architecture(repo, rvwt, "GATE_REVIEWER", roadmap_gate_reviewer_prompt(sl, base, candidate), f"{sl.code}_GATE_REVIEW", sl.task_id)
            review = review_run.report
            if not clean(rvwt):
                raise Stop(f"gate reviewer modified roadmap candidate slice={sl.code}")
        finally:
            if rvwt.exists() and clean(rvwt):
                remove_worktree(repo, rvwt)
        if review.get("owner_decision_required") or review.get("outcome") == "OWNER_DECISION_REQUIRED":
            raise Stop(f"architecture routing failure roadmap gate reviewer slice={sl.code}: {review.get('stop_reason')}")
        blockers = report_blockers(review)
        if review.get("outcome") == "READY" and not blockers:
            break
        if not blockers:
            raise Stop(f"roadmap gate reviewer not READY but no blockers slice={sl.code}: {review}")
        dg = blocker_digest(review)
        seen.append(dg)
        if len(seen) >= 3 and len(set(seen[-3:])) == 1:
            raise Stop(f"NO_PROGRESS roadmap gate slice={sl.code}: identical blockers repeated")
        if sha(wt) != candidate or not clean(wt):
            raise Stop(f"roadmap remediation prestate changed slice={sl.code}")
        rem = run_codex_resolving_architecture(repo, wt, "TEST_AUTHOR", roadmap_remediation_prompt(sl, blockers, base), f"{sl.code}_GATE_REMEDIATION", sl.task_id).report
        if sha(wt) != candidate:
            raise Stop(f"roadmap test-author remediation changed Git history slice={sl.code}")
        if rem.get("owner_decision_required"):
            raise Stop(f"architecture routing failure roadmap remediation slice={sl.code}: {rem.get('stop_reason')}")
        if rem.get("outcome") != "READY":
            raise Stop(f"roadmap remediation not READY slice={sl.code}: {rem}")
        files = assert_roadmap_test_author_scope(wt, base, sl)
        if not files:
            raise Stop(f"NO_PROGRESS roadmap remediation made no changes slice={sl.code}")
        gate = run_gate(wt, sl.task_id)
        if gate.rc != 1:
            raise Stop(f"roadmap remediation must remain product RED slice={sl.code}, got {gate.rc}")
        candidate = stage_and_commit(wt, files, f"[LOOP] ÄGARHAND: remediate {sl.code} gate review")
    if not clean(wt) or sha(wt) != candidate:
        raise Stop(f"roadmap contract final identity mismatch slice={sl.code}")
    gate = run_gate(wt, sl.task_id)
    if gate.rc != 1:
        raise Stop(f"roadmap final contract baseline must be RED slice={sl.code}, got {gate.rc}")
    inv = run_invariants(wt)
    if inv is not None and inv.rc != 0:
        raise Stop(f"invariants regressed in roadmap contract slice={sl.code}: {inv.out}")
    changed = [x for x in git(wt, "diff", "--name-only", f"{base}..{candidate}").out.splitlines() if x]
    authority = publication_authority(repo, candidate, sl.task_id,
                                      review_run.result_file)
    return publish(repo, wt, branch(wt), base, candidate,
                   f"[LOOP] ÄGARHAND: freeze {sl.code} {sl.title}", changed,
                   publication_authority=authority)


def slice_builder_extra(sl: RoadmapSlice, *, refrozen: bool = False) -> str:
    prefix = "The frozen contract was autonomously re-frozen after architect review. " if refrozen else ""
    if is_substitution_slice(sl):
        return (
            prefix
            + f"Implement owner-authorized substitution slice {sl.code} / {sl.task_id}. "
            + f"Read `{SUBSTITUTION_OWNER_PATH}` and `{SUBSTITUTION_AUDIT_PATH}`; the current frozen task/gate on main is authority. "
            + "Use provider-native session/context/tool/retry primitives where the contract assigns them to the provider. "
            + "Do not move G20 containment, candidate identity, policy/gates, attestation/fencing or promotion into provider trust. "
            + "Do not redesign/widen the frozen contract."
        )
    return (
        prefix
        + f"Implement roadmap slice {sl.code} from exact effect plan {ROADMAP_PLAN_SHA} under substitution authority `{SUBSTITUTION_OWNER_PATH}`. "
        + f"Read it with git show {ROADMAP_PLAN_SHA}:{ROADMAP_PLAN_PATH}. The current frozen task/gate on main is authority. "
        + "Preserve plan effects/negative controls while preferring provider-native harness primitives for non-trust responsibilities. "
        + "Do not redesign or widen the frozen contract."
    )


def task_contract_judgeable(repo: Path, task_id: str) -> bool:
    t = task_obj_optional(repo, task_id)
    if t is None:
        return False
    rel = t.get("exit_test")
    if not isinstance(rel, str) or not rel:
        return False
    return (repo / rel).exists()


def ensure_roadmap_slice(repo: Path, wt_root: Path, sl: RoadmapSlice) -> None:
    base = origin_main(repo)
    probe = detached_worktree(repo, wt_root, f"probe-{sl.code.lower()}-{base[:12]}-{now_id()}", base)
    try:
        exists = task_contract_judgeable(probe, sl.task_id)
        if exists:
            task = task_obj(probe, sl.task_id)
            if task.get("exit_test") != sl.gate_path:
                raise Stop(f"roadmap existing task gate path conflicts with v4 owner mapping slice={sl.code}: {task.get('exit_test')}")
            res = run_gate(probe, sl.task_id)
            if res.rc not in {0, 1}:
                exists = False
        if exists:
            task = task_obj(probe, sl.task_id)
            deps = task.get("depends_on") or []
            missing = [d for d in sl.required_deps if d not in deps]
            if missing:
                raise Stop(f"roadmap existing task misses owner-required dependencies slice={sl.code}: {missing}")
            if sl.plan_allowed_write is not None and set(task.get("allowed_write") or []) != set(sl.plan_allowed_write):
                raise Stop(
                    f"roadmap existing task allowed_write drift slice={sl.code}: "
                    f"expected={sorted(sl.plan_allowed_write)} actual={sorted(task.get('allowed_write') or [])}"
                )
            journal(repo, "ROADMAP_CONTRACT_PRESENT", slice=sl.code, task=sl.task_id)
        else:
            journal(repo, "ROADMAP_CONTRACT_REQUIRED", slice=sl.code, task=sl.task_id)
    finally:
        if probe.exists() and clean(probe):
            remove_worktree(repo, probe)
    if not exists:
        roadmap_contract_flow(repo, wt_root, sl)
    # Build only if the frozen task is actually RED. GREEN is a valid recovery/no-op state.
    base = origin_main(repo)
    probe = detached_worktree(repo, wt_root, f"probe-build-{sl.code.lower()}-{base[:12]}-{now_id()}", base)
    try:
        res = run_gate(probe, sl.task_id)
    finally:
        if probe.exists() and clean(probe):
            remove_worktree(repo, probe)
    if res.rc == 0:
        journal(repo, "ROADMAP_SLICE_ALREADY_GREEN", slice=sl.code, task=sl.task_id)
        return
    if res.rc != 1:
        raise Stop(f"roadmap slice gate unjudgeable after freeze slice={sl.code} rc={res.rc}")
    build_base = origin_main(repo)
    try:
        builder_flow(
            repo, wt_root, sl.task_id,
            f"nortropic/loop-{sl.task_id}-v4-{build_base[:8]}",
            f"loop-{sl.task_id}-builder-v4-{build_base[:8]}",
            f"[LOOP] {sl.code}: {sl.title}",
            extra=slice_builder_extra(sl),
        )
    except ContractRefreeze as need:
        journal(repo, "ROADMAP_REFREEZE_REQUIRED", slice=sl.code, task=sl.task_id, reason=need.reason)
        roadmap_contract_flow(repo, wt_root, sl, guidance=need.reason)
        fresh = origin_main(repo)
        builder_flow(
            repo, wt_root, sl.task_id,
            f"nortropic/loop-{sl.task_id}-v4-{fresh[:8]}",
            f"loop-{sl.task_id}-builder-v4-{fresh[:8]}",
            f"[LOOP] {sl.code}: {sl.title}",
            extra=slice_builder_extra(sl, refrozen=True),
        )
    journal(repo, "ROADMAP_SLICE_COMPLETE", slice=sl.code, task=sl.task_id, main=origin_main(repo))



def run_empirical_gate(repo: Path, timeout: int = 3600) -> Cmd:
    p = repo / EMPIRICAL_GATE_PATH
    if not p.exists():
        raise Stop(f"empirical program gate missing: {EMPIRICAL_GATE_PATH}")
    cmd = [str(p)] if os.access(p, os.X_OK) else ["bash", str(p)]
    res = run(cmd, cwd=repo, check=False, timeout=timeout)
    journal(repo, "EMPIRICAL_GATE", exit=res.rc, command=" ".join(cmd))
    return res


def empirical_gate_test_author_prompt(base_sha: str, guidance: str = "") -> str:
    return f"""
Use `$nortropic-test-author`.

This is the owner-authorized PROGRAM-LEVEL frozen acceptance gate for empirical stage L of the
complete provider-neutral Nortropic roadmap. It is not a synthetic builder task and MUST NOT be
added to specs/tasks.spec.json.

BASE_SHA={base_sha}
PLAN_SHA={ROADMAP_PLAN_SHA}
PLAN_PATH={ROADMAP_PLAN_PATH}
OWNER_DELEGATION={FULL_ROADMAP_OWNER_PATH}
SUBSTITUTION_AUTHORITY={SUBSTITUTION_OWNER_PATH}
PROGRAM_GATE={EMPIRICAL_GATE_PATH}

Read:
  git show {ROADMAP_PLAN_SHA}:{ROADMAP_PLAN_PATH}
  {SUBSTITUTION_OWNER_PATH}
  {SUBSTITUTION_AUDIT_PATH}

Create or narrowly harden exactly `{EMPIRICAL_GATE_PATH}` plus docs/05-beslutslogg.md and
docs/loop/drift.md only when documentation is needed. Do not modify specs/**, controller/**,
tests/controller/**, any existing verify gate, constitution, rulebook, or production code.

The gate must bind the FINAL TARGET STATE by public effects, not source strings or one provider.
It must exercise the provider-neutral path and Trust Kernel separation materially: Task IR/contract,
provider attempt, candidate identity, containment, hard policy/global/task verification, bounded
cross-attempt failure feedback/retry, attestation/fencing, disposable-local promotion/post-check and
typed read/command observation. Provider/session/reviewer READY is never PASS authority.

The gate must be runnable hermetically without touching real GitHub main and include positive
anchors plus deliberately defective variants/negative controls. It must reject at least one design
that lets provider output self-certify, one that bypasses candidate identity/containment, and one
that reimplements provider session semantics as kernel truth. It must also admit a legitimate fake
provider so the judge is provider-neutral rather than Codex-source-shaped.

At freeze time current product is expected to be RED exit 1 for missing SUB-1..SUB-4/S2–S13
capabilities. Environment refusal/rig failure is not product RED. The final completed loop must
make this SAME frozen gate exit 0 without weakening it.

{guidance}

OWNER_DECISION_REQUIRED is an internal architect signal only. A true human-only boundary must be
BLOCKED with HUMAN_AUTHORITY_HARD_STOP:.
"""


def empirical_gate_reviewer_prompt(base_sha: str, candidate_sha: str) -> str:
    return f"""
Use `$nortropic-gate-reviewer`.

Independently falsify the PROGRAM-LEVEL empirical stage-L gate candidate.
BASE_SHA={base_sha}
CANDIDATE_SHA={candidate_sha}
PLAN_SHA={ROADMAP_PLAN_SHA}
PLAN_PATH={ROADMAP_PLAN_PATH}
SUBSTITUTION_AUTHORITY={SUBSTITUTION_OWNER_PATH}
PROGRAM_GATE={EMPIRICAL_GATE_PATH}
OWNER_DELEGATION={FULL_ROADMAP_OWNER_PATH}

The candidate worktree is detached/read-only. Verify changed-file scope is limited to the program
gate and owner docs; the gate binds final public effects plus provider/kernel separation rather
than one implementation/provider; it runs only against disposable/local resources; positive
anchors exist; vacuous always-fail/always-pass and provider-self-certification mutants are rejected;
a legitimate fake provider can satisfy the interface; and the gate is RED on the incomplete product
for the right product reason. Do not repair the gate yourself.
"""


def assert_empirical_gate_author_scope(repo: Path, base_sha: str) -> list[str]:
    files = changed_files(repo, base_sha)
    bad = [f for f in files if f not in EMPIRICAL_GATE_ALLOWED]
    if bad:
        raise Stop(f"empirical gate author wrote outside owner surface: {bad}")
    if EMPIRICAL_GATE_PATH not in files and git(
        repo, "cat-file", "-e", f"{base_sha}:{EMPIRICAL_GATE_PATH}", check=False
    ).rc != 0:
        raise Stop("empirical gate author did not create the program-level gate")
    git(repo, "diff", "--check", base_sha)
    return files


def empirical_gate_contract_flow(repo: Path, wt_root: Path, guidance: str = "") -> str:
    ensure_roadmap_plan(repo)
    ensure_substitution_authority(repo)
    base = origin_main(repo)
    branch_name = f"owner/empirical-loop-gate-L-{base[:12]}"
    wt = ensure_worktree(repo, wt_root, branch_name, base, f"owner-empirical-loop-gate-L-{base[:12]}")
    if not clean(wt):
        raise Stop("empirical gate author worktree dirty at prestate")
    head = sha(wt)
    if head == base:
        arun = run_codex_resolving_architecture(
            repo, wt, "TEST_AUTHOR", empirical_gate_test_author_prompt(base, guidance),
            "EMPIRICAL_GATE_TEST_AUTHOR", "L",
            context="Freeze the program-level L judge. Ordinary gate-design decisions are delegated."
        )
        if sha(wt) != base:
            raise Stop("empirical gate author changed Git history")
        r = arun.report
        if owner_need(r):
            raise Stop(f"architecture routing failure in empirical gate author: {r.get('stop_reason')}")
        if r.get("outcome") != "READY" or r.get("frozen_gate_ready") is not True or r.get("baseline_red_for_right_reason") is not True:
            raise Stop(f"empirical gate author did not establish freeze-ready RED state: {r}")
        files = assert_empirical_gate_author_scope(wt, base)
        if not files:
            raise Stop("empirical gate author reported READY but changed no owner artifacts")
        gate = run_empirical_gate(wt)
        if gate.rc != 1:
            raise Stop(f"empirical program gate freeze baseline must be RED exit 1, got {gate.rc}\n{gate.out}")
        candidate = stage_and_commit(wt, files, EMPIRICAL_GATE_SUBJECT)
    else:
        if git(repo, "merge-base", "--is-ancestor", base, head, check=False).rc != 0:
            raise Stop(f"empirical gate recovery candidate not based on current main: {head}")
        candidate = head
        files = assert_empirical_gate_author_scope(wt, base)
        gate = run_empirical_gate(wt)
        if gate.rc != 1:
            raise Stop(f"recovered empirical program gate must remain RED, got {gate.rc}")
        journal(repo, "RECOVER_EMPIRICAL_GATE_CANDIDATE", candidate=candidate)

    seen: list[str] = []
    while True:
        rvwt = detached_worktree(repo, wt_root, f"gate-review-L-{candidate[:12]}", candidate)
        try:
            review_run = run_codex_resolving_architecture(
                repo, rvwt, "GATE_REVIEWER", empirical_gate_reviewer_prompt(base, candidate),
                "EMPIRICAL_GATE_REVIEW", "L"
            )
            review = review_run.report
            if not clean(rvwt):
                raise Stop("empirical gate reviewer modified candidate")
        finally:
            if rvwt.exists() and clean(rvwt):
                remove_worktree(repo, rvwt)
        if owner_need(review):
            raise Stop(f"architecture routing failure in empirical gate reviewer: {review.get('stop_reason')}")
        blockers = report_blockers(review)
        if review.get("outcome") == "READY" and not blockers:
            break
        if not blockers:
            raise Stop(f"empirical gate reviewer not READY but supplied no blockers: {review}")
        dg = blocker_digest(review)
        seen.append(dg)
        if len(seen) >= 3 and len(set(seen[-3:])) == 1:
            raise Stop("HUMAN_AUTHORITY_HARD_STOP: no-progress in empirical program-gate review")
        rem = run_codex_resolving_architecture(
            repo, wt, "TEST_AUTHOR",
            f"""Use `$nortropic-test-author` again. The independent reviewer confirmed these blockers
against the empirical program gate:\n{json.dumps(blockers, ensure_ascii=False, indent=2)}\n
Keep the same program-level owner surface. Do not modify production/spec/task gates. Preserve
product RED for the incomplete roadmap and strengthen only the truthful stage-L effects.""",
            "EMPIRICAL_GATE_REMEDIATION", "L"
        ).report
        if sha(wt) != candidate:
            raise Stop("empirical gate remediation changed Git history")
        if rem.get("outcome") != "READY":
            raise Stop(f"empirical gate remediation not READY: {rem}")
        files = assert_empirical_gate_author_scope(wt, base)
        gate = run_empirical_gate(wt)
        if gate.rc != 1:
            raise Stop(f"empirical gate remediation must remain product RED, got {gate.rc}")
        candidate = stage_and_commit(wt, files, "[LOOP] ÄGARHAND: remediate empirical L gate review")

    if not clean(wt) or sha(wt) != candidate:
        raise Stop("empirical gate final identity mismatch")
    gate = run_empirical_gate(wt)
    if gate.rc != 1:
        raise Stop(f"empirical program gate final frozen baseline must be RED exit 1, got {gate.rc}")
    inv = run_invariants(wt)
    if inv is not None and inv.rc != 0:
        raise Stop(f"invariants regressed in empirical gate candidate: {inv.out}")
    changed = [x for x in git(wt, "diff", "--name-only", f"{base}..{candidate}").out.splitlines() if x]
    authority = publication_authority(repo, candidate, EMPIRICAL_STAGE,
                                      review_run.result_file,
                                      program_gate=EMPIRICAL_GATE_PATH)
    return publish(repo, wt, branch(wt), base, candidate,
                   EMPIRICAL_GATE_SUBJECT, changed,
                   publication_authority=authority)


def ensure_empirical_program_gate(repo: Path, wt_root: Path) -> None:
    base = origin_main(repo)
    probe = detached_worktree(repo, wt_root, f"probe-empirical-L-{base[:12]}-{now_id()}", base)
    try:
        exists = (probe / EMPIRICAL_GATE_PATH).exists()
        if exists:
            res = run_empirical_gate(probe)
            if res.rc not in {0, 1}:
                exists = False
        if exists:
            journal(repo, "EMPIRICAL_GATE_PRESENT", path=EMPIRICAL_GATE_PATH)
        else:
            journal(repo, "EMPIRICAL_GATE_REQUIRED", path=EMPIRICAL_GATE_PATH)
    finally:
        if probe.exists() and clean(probe):
            remove_worktree(repo, probe)
    if not exists:
        empirical_gate_contract_flow(repo, wt_root)


def assert_task_gate_completion(repo: Path, wt_root: Path) -> None:
    base = origin_main(repo)
    scan = detached_worktree(repo, wt_root, f"final-task-gates-{base[:12]}-{now_id()}", base)
    try:
        spec = load_spec(scan)
        bad: dict[str, int] = {}
        for t in spec["tasks"]:
            tid = t.get("id")
            if not isinstance(tid, str) or not isinstance(t.get("exit_test"), str):
                continue
            try:
                rc = run_gate(scan, tid).rc
            except Stop:
                rc = 125
            if rc != 0:
                bad[tid] = rc
        if bad:
            raise Stop(f"FULL_ROADMAP_TASK_GATE_SET_NOT_GREEN: {bad}")
        for sl in SUBSTITUTION_ROADMAP + ROADMAP:
            task = task_obj_optional(scan, sl.task_id)
            if task is None:
                raise Stop(f"FULL_ROADMAP_MISSING_TASK: slice={sl.code} task={sl.task_id}")
            if task.get("exit_test") != sl.gate_path:
                raise Stop(f"FULL_ROADMAP_GATE_IDENTITY_MISMATCH: slice={sl.code} task={sl.task_id}")
        inv = run_invariants(scan)
        if inv is not None and inv.rc != 0:
            raise Stop(f"FULL_ROADMAP_INVARIANTS_FAIL: {inv.out}")
    finally:
        if scan.exists() and clean(scan):
            remove_worktree(repo, scan)
    journal(repo, "FULL_ROADMAP_TASK_GATES_GREEN", main=base, slices=[x.code for x in SUBSTITUTION_ROADMAP + ROADMAP])


def assert_s7_external_prerequisite(repo: Path) -> None:
    """Verify the dedicated external promotion identity before declaring FULL_ROADMAP_COMPLETE."""
    protection = run([
        "gh", "api", f"repos/{EXPECTED_REPO}/branches/main/protection"
    ], cwd=repo, check=False)
    if protection.rc != 0:
        raise Stop("HUMAN_AUTHORITY_HARD_STOP: cannot re-read main branch protection before external activation")
    try:
        d = json.loads(protection.out)
    except Exception as e:
        raise Stop(f"HUMAN_AUTHORITY_HARD_STOP: branch protection response unreadable before external activation: {e}") from e
    rr = d.get("required_pull_request_reviews") or {}
    bypass = rr.get("bypass_pull_request_allowances") or {}
    apps = bypass.get("apps") or []
    def app_name(a: Any) -> str:
        if not isinstance(a, dict):
            return ""
        return str(a.get("name") or a.get("slug") or "").strip().lower().replace("_", "-")
    promoter = [a for a in apps if app_name(a) in {"nortropic promoter", "nortropic-promoter"}]
    if len(promoter) != 1:
        raise Stop(
            "HUMAN_AUTHORITY_HARD_STOP: EXTERNAL_TRUST_PREREQUISITE Nortropic Promoter GitHub App "
            "is not proven as the single PR-bypass app on main. Software S7–S13 and hermetic L are complete; create/install it for Nortropic/nortropic-system "
            "with Metadata:Read + Contents:Read&Write only, add only PR-requirement bypass, then run `nortropic-codex-autopilot resume`."
        )
    force = ((d.get("allow_force_pushes") or {}).get("enabled"))
    deletions = ((d.get("allow_deletions") or {}).get("enabled"))
    admins = ((d.get("enforce_admins") or {}).get("enabled"))
    if force is not False or deletions is not False or admins is not True:
        raise Stop(
            "HUMAN_AUTHORITY_HARD_STOP: GitHub main protection differs from frozen external-activation prerequisites "
            f"force={force} deletions={deletions} enforce_admins={admins}"
        )
    rules = run(["gh", "api", f"repos/{EXPECTED_REPO}/rules/branches/main"], cwd=repo, check=False)
    if rules.rc != 0:
        raise Stop("HUMAN_AUTHORITY_HARD_STOP: cannot re-read effective rulesets on main before external activation")
    try:
        active_rules = json.loads(rules.out)
    except Exception as e:
        raise Stop(f"HUMAN_AUTHORITY_HARD_STOP: effective rules response unreadable before external activation: {e}") from e
    if not isinstance(active_rules, list):
        raise Stop("HUMAN_AUTHORITY_HARD_STOP: effective rules response is not a list before external activation")
    if active_rules:
        raise Stop(
            "HUMAN_AUTHORITY_HARD_STOP: effective rules on main changed from the frozen plan; "
            "re-evaluate ruleset/bypass interaction before S7"
        )
    journal(repo, "S7_EXTERNAL_TRUST_PREREQUISITE_PASS", app="Nortropic Promoter")


def empirical_prompt(base_sha: str, gate_output: str = "") -> str:
    return f"""
Use `$nortropic-empirical-runner`. Do not modify repository files.

This is independent closeout/falsification for stage L AFTER the frozen program gate
`{EMPIRICAL_GATE_PATH}` has been executed by the orchestrator.
AUTHORITATIVE_MAIN={base_sha}
PLAN_SHA={ROADMAP_PLAN_SHA}
PLAN_PATH={ROADMAP_PLAN_PATH}
OWNER_DELEGATION={FULL_ROADMAP_OWNER_PATH}
SUBSTITUTION_AUTHORITY={SUBSTITUTION_OWNER_PATH}

FROZEN_PROGRAM_GATE_OUTPUT:
{gate_output[-12000:]}

Read the exact plan, substitution contract, frozen program gate and public controller/provider
interfaces. Independently inspect or reproduce decisive end-to-end effects in disposable state.
The frozen gate is root of the stage-L verdict; your READY can never turn a red gate green.

If green, actively falsify provider/kernel separation as well as the business flow: real provider
attempt through the provider-neutral boundary, Task IR/contract, candidate identity/containment,
hard verification, bounded cross-attempt remediation, attestation/fencing, disposable-local
promotion identity/post-check and typed read/command observation. Provider/session status must not
be able to self-certify any kernel transition. Do not touch real GitHub main.

If red, diagnose the first product defect and map it to exactly one existing owning frozen task in
next_task_id. If the defect is in the PROGRAM GATE itself, set next_task_id="L",
next_action=TEST_AUTHOR and provide decisive evidence.

Return outcome=READY only if the program gate was green and independent falsification found no
blocker. For product defects use NEEDS_REMEDIATION. OWNER_DECISION_REQUIRED is an internal
architect signal, never a normal human handoff.
"""


def existing_task_as_slice(repo: Path, task_id: str) -> RoadmapSlice:
    for sl in SUBSTITUTION_ROADMAP + ROADMAP:
        if sl.task_id == task_id:
            return sl
    task = task_obj(repo, task_id)
    gate = task.get("exit_test")
    deps = task.get("depends_on") or []
    if not isinstance(gate, str) or not gate or not isinstance(deps, list) or not all(isinstance(x, str) for x in deps):
        raise Stop(f"HUMAN_AUTHORITY_HARD_STOP: empirical remediation target has no usable frozen contract: {task_id}")
    return RoadmapSlice(f"REOPEN-{task_id}", task_id, f"empirical remediation of {task_id}", gate, tuple(deps))


def empirical_unattended_flow(repo: Path, wt_root: Path) -> None:
    seen: list[str] = []
    for round_no in range(1, EMPIRICAL_MAX_ROUNDS + 1):
        assert_task_gate_completion(repo, wt_root)
        base = origin_main(repo)
        ew = detached_worktree(repo, wt_root, f"empirical-L-{base[:12]}-{now_id()}", base)
        try:
            gate = run_empirical_gate(ew)
            if gate.rc not in {0, 1}:
                raise Stop(f"HUMAN_AUTHORITY_HARD_STOP: empirical program gate unjudgeable rc={gate.rc}")
            run = run_codex_resolving_architecture(
                repo, ew, "EMPIRICAL", empirical_prompt(base, gate.out), "EMPIRICAL_L", "L",
                context="The frozen program gate is root of L. Map ordinary failures to an existing owning task or L for a judge defect."
            )
            if not clean(ew) or sha(ew) != base:
                raise Stop("empirical reviewer modified authoritative worktree")
            report = run.report
            blockers = report_blockers(report)

            if gate.rc == 0 and report.get("outcome") == "READY" and not blockers:
                journal(repo, "EMPIRICAL_UNATTENDED_RUN_PASS", main=base, round=round_no,
                        gate=EMPIRICAL_GATE_PATH, gate_exit=0, evidence=str(run.result_file))
                return

            if report.get("outcome") == "BLOCKED":
                reason = str(report.get("stop_reason") or report.get("summary") or "empirical blocked")
                if not reason.startswith("HUMAN_AUTHORITY_HARD_STOP:"):
                    reason = "HUMAN_AUTHORITY_HARD_STOP: " + reason
                raise Stop(reason)
            if gate.rc == 0 and not blockers:
                raise Stop(f"HUMAN_AUTHORITY_HARD_STOP: green empirical gate but independent reviewer not READY without blockers: {report}")
            if not blockers and gate.rc == 1:
                # A red deterministic gate always requires a diagnosis before any code change.
                synthetic = {
                    "role": "EMPIRICAL", "outcome": "OWNER_DECISION_REQUIRED",
                    "summary": "Frozen empirical program gate is RED; map failure to owning task or judge.",
                    "blocking_findings": [{"id": "EMPIRICAL_GATE_RED", "summary": "Program gate exit 1", "evidence": gate.out[-8000:]}],
                    "owner_decision_required": True, "stop_reason": "EMPIRICAL_GATE_RED",
                }
                resolution = architect_resolution(
                    repo, ew, "EMPIRICAL_FAILURE", "L", synthetic,
                    context="Choose next_task_id='L' if the program judge is defective; otherwise one existing owning task."
                )
                target = resolution.get("next_task_id")
                guidance = str(resolution.get("summary") or "empirical gate red")
            else:
                dg = blocker_digest(report)
                seen.append(dg)
                if len(seen) >= 3 and len(set(seen[-3:])) == 1:
                    raise Stop("HUMAN_AUTHORITY_HARD_STOP: empirical no-progress; identical blocker repeated three times")
                synthetic_signal = dict(report)
                synthetic_signal["outcome"] = "OWNER_DECISION_REQUIRED"
                synthetic_signal["owner_decision_required"] = True
                resolution = architect_resolution(
                    repo, ew, "EMPIRICAL_FAILURE", "L", synthetic_signal,
                    context="Choose exactly one existing owning task, or next_task_id='L' for a program-gate defect."
                )
                target = resolution.get("next_task_id") or report.get("next_task_id")
                guidance = str(resolution.get("summary") or report.get("summary") or "empirical defect")
            if not isinstance(target, str) or not target:
                raise Stop("HUMAN_AUTHORITY_HARD_STOP: architect did not map empirical failure")
        finally:
            if ew.exists() and clean(ew):
                remove_worktree(repo, ew)

        if target == "L":
            journal(repo, "EMPIRICAL_PROGRAM_GATE_REFREEZE", reason=guidance)
            empirical_gate_contract_flow(repo, wt_root, guidance=guidance)
            continue

        main_now = origin_main(repo)
        probe = detached_worktree(repo, wt_root, f"empirical-target-{target}-{main_now[:12]}-{now_id()}", main_now)
        try:
            target_gate = run_gate(probe, target)
            sl = existing_task_as_slice(probe, target)
        finally:
            if probe.exists() and clean(probe):
                remove_worktree(repo, probe)
        # A green owning task judge that missed a program-level defect must be strengthened first.
        if target_gate.rc == 0 or resolution.get("next_action") == "TEST_AUTHOR":
            journal(repo, "EMPIRICAL_REFREEZE", task=target, reason=guidance)
            roadmap_contract_flow(repo, wt_root, sl, guidance=guidance)
        elif target_gate.rc != 1:
            raise Stop(f"HUMAN_AUTHORITY_HARD_STOP: empirical remediation target gate unjudgeable task={target} rc={target_gate.rc}")
        fresh = origin_main(repo)
        builder_flow(
            repo, wt_root, target,
            f"nortropic/loop-{target}-empirical-{fresh[:8]}",
            f"loop-{target}-empirical-builder-{fresh[:8]}",
            f"[LOOP] {target}: remediate empirical unattended run",
            extra=f"Empirical stage L exposed this architect-routed defect: {guidance}. Current frozen task/gate on main is authority."
        )
    raise Stop(f"HUMAN_AUTHORITY_HARD_STOP: empirical remediation budget exhausted after {EMPIRICAL_MAX_ROUNDS} rounds")


def full_roadmap(repo: Path, wt_root: Path) -> None:
    ensure_roadmap_plan(repo)
    ensure_substitution_authority(repo)
    if git(repo, "cat-file", "-e", f"refs/remotes/origin/main:{FULL_ROADMAP_OWNER_PATH}", check=False).rc != 0:
        raise Stop(f"full-roadmap owner delegation missing from origin/main: {FULL_ROADMAP_OWNER_PATH}")

    # Freeze the PROGRAM-LEVEL final judge after SUB-0 owner amendment but before implementation.
    # It must bind provider/kernel separation and final effects while current product is truthfully RED.
    ensure_empirical_program_gate(repo, wt_root)

    # SUB-1..SUB-4 migrate agent-harness responsibilities behind a provider-neutral boundary while
    # preserving the deterministic Trust Kernel and every green legacy gate. S3/h-003+h-004 bootstrap
    # is completed by bootstrap() before entering this function.
    for sl in SUBSTITUTION_ROADMAP:
        journal(repo, "SUBSTITUTION_SLICE_START", slice=sl.code, task=sl.task_id, title=sl.title)
        ensure_roadmap_slice(repo, wt_root, sl)

    # Then build original capability slices under amended implementation-shape authority.
    for sl in ROADMAP:
        journal(repo, "ROADMAP_SLICE_START", slice=sl.code, task=sl.task_id, title=sl.title)
        ensure_roadmap_slice(repo, wt_root, sl)

    empirical_unattended_flow(repo, wt_root)
    assert_task_gate_completion(repo, wt_root)

    # Re-run the deterministic PROGRAM gate after independent empirical falsification.
    base = origin_main(repo)
    scan = detached_worktree(repo, wt_root, f"final-program-L-{base[:12]}-{now_id()}", base)
    try:
        lgate = run_empirical_gate(scan)
        if lgate.rc != 0:
            raise Stop(f"FULL_ROADMAP_EMPIRICAL_GATE_NOT_GREEN rc={lgate.rc}\n{lgate.out}")
    finally:
        if scan.exists() and clean(scan):
            remove_worktree(repo, scan)

    all_codes = [x.code for x in SUBSTITUTION_ROADMAP + ROADMAP] + [EMPIRICAL_STAGE]
    journal(
        repo,
        "FULL_ROADMAP_SOFTWARE_COMPLETE",
        plan_sha=ROADMAP_PLAN_SHA,
        substitution_blob=SUBSTITUTION_BLOBS[SUBSTITUTION_OWNER_PATH],
        main=base,
        slices=all_codes,
    )

    # Only real external activation remains. Never substitute broad personal gh credentials for
    # the dedicated Nortropic Promoter identity required by the owner plan.
    assert_s7_external_prerequisite(repo)

    journal(
        repo,
        "FULL_ROADMAP_COMPLETE",
        plan_sha=ROADMAP_PLAN_SHA,
        substitution_blob=SUBSTITUTION_BLOBS[SUBSTITUTION_OWNER_PATH],
        main=origin_main(repo),
        slices=all_codes,
        external_promoter="PROVEN",
    )


def test_author_flow(repo: Path, wt_root: Path) -> str:
    base = origin_main(repo)
    wt = ensure_worktree(repo, wt_root, f"owner/h-003-attestation-validity-{base[:12]}", base,
                         f"owner-h003-attestation-validity-{base[:12]}")
    if not clean(wt):
        raise Stop("test-author worktree dirty before agent/recovery")
    head = sha(wt)
    if head == base:
        agent = run_codex_resolving_architecture(repo, wt, "TEST_AUTHOR", test_author_prompt(), "H003_TEST_AUTHOR", "h-003")
        if sha(wt) != base:
            raise Stop("test-author changed Git history; orchestrator requires uncommitted candidate bytes")
        r = agent.report
        if r.get("owner_decision_required") or r.get("outcome") == "OWNER_DECISION_REQUIRED":
            raise Stop(f"architecture routing failure: unresolved owner signal h-003: {r.get('stop_reason')}")
        if r.get("outcome") != "READY" or r.get("frozen_gate_ready") is not True or r.get("baseline_red_for_right_reason") is not True:
            raise Stop(f"test-author did not establish freeze-ready state: {r}")
        files = assert_test_author_scope(wt, base)
        if not files:
            raise Stop("test-author reported READY but changed no owner artifacts")
        # Product should remain RED for the new owner controls at this point.
        h3 = run_gate(wt, "h-003")
        h4 = run_gate(wt, "h-004")
        if h3.rc != 1:
            raise Stop(f"h-003 owner-gate baseline must be product RED exit 1, got {h3.rc}")
        if h4.rc != 1:
            raise Stop(f"h-004 owner-gate baseline must be product RED exit 1, got {h4.rc}")
        candidate = stage_and_commit(wt, files, H003_GATE_SUBJECT)
    else:
        if git(repo, "merge-base", "--is-ancestor", base, head, check=False).rc != 0:
            raise Stop(f"test-author recovery candidate is not based on current main: {head}")
        candidate = head
        cumulative = assert_test_author_scope(wt, base)
        if not cumulative:
            raise Stop("test-author recovery branch is ahead of base with no owner-surface diff")
        h3 = run_gate(wt, "h-003")
        h4 = run_gate(wt, "h-004")
        if h3.rc != 1 or h4.rc != 1:
            raise Stop(f"recovered test-author candidate must preserve product RED h-003/h-004, got {h3.rc}/{h4.rc}")
        journal(repo, "RECOVER_TEST_AUTHOR_CANDIDATE", candidate=candidate)
    seen: list[str] = []
    while True:
        rvwt = detached_worktree(repo, wt_root, f"gate-review-h003-{candidate[:12]}", candidate)
        try:
            review_run = run_codex_resolving_architecture(repo, rvwt, "GATE_REVIEWER", gate_reviewer_prompt(base, candidate), "H003_GATE_REVIEW", "h-003")
            review = review_run.report
            if not clean(rvwt):
                raise Stop("gate reviewer modified reviewed worktree")
        finally:
            if rvwt.exists() and clean(rvwt):
                remove_worktree(repo, rvwt)
        if review.get("owner_decision_required") or review.get("outcome") == "OWNER_DECISION_REQUIRED":
            raise Stop(f"architecture routing failure from h-003 gate reviewer: {review.get('stop_reason')}")
        blockers = report_blockers(review)
        if review.get("outcome") == "READY" and not blockers:
            break
        if not blockers:
            raise Stop(f"gate reviewer outcome not READY but no actionable blockers: {review}")
        dg = blocker_digest(review)
        seen.append(dg)
        if len(seen) >= 3 and len(set(seen[-3:])) == 1:
            raise Stop("NO_PROGRESS: identical gate-review blockers repeated three consecutive candidates")
        if sha(wt) != candidate or not clean(wt):
            raise Stop("test-author remediation prestate changed unexpectedly")
        remediation = run_codex_resolving_architecture(repo, wt, "TEST_AUTHOR", remediation_prompt("TEST_AUTHOR", None, blockers, base), "H003_GATE_REMEDIATION", "h-003").report
        if sha(wt) != candidate:
            raise Stop("test-author remediation changed Git history")
        if remediation.get("owner_decision_required"):
            raise Stop(f"architecture routing failure during h-003 remediation: {remediation.get('stop_reason')}")
        if remediation.get("outcome") != "READY":
            raise Stop(f"test-author remediation not ready: {remediation}")
        files = assert_test_author_scope(wt, candidate)
        if not files:
            raise Stop("NO_PROGRESS: test-author remediation made no changes")
        candidate = stage_and_commit(wt, files, "[LOOP] ÄGARHAND: remediate h-003 authority gate review")
    # Final owner gate: exact candidate, no production changes, RED expected, invariants unchanged.
    if not clean(wt) or sha(wt) != candidate:
        raise Stop("test-author final identity mismatch")
    h3 = run_gate(wt, "h-003")
    h4 = run_gate(wt, "h-004")
    if h3.rc != 1 or h4.rc != 1:
        raise Stop(f"test-author final RED baselines must both be exit 1, got h-003={h3.rc} h-004={h4.rc}")
    inv = run_invariants(wt)
    if inv is not None and inv.rc != 0:
        raise Stop(f"invariants regressed in owner gate candidate: {inv.out}")
    changed = [x for x in git(wt, "diff", "--name-only", f"{base}..{candidate}").out.splitlines() if x]
    authority = publication_authority(repo, candidate, "h-003",
                                      review_run.result_file)
    new_main = publish(repo, wt, branch(wt), base, candidate,
                       "[LOOP] ÄGARHAND: freeze h-003 attestation authority v1", changed,
                       publication_authority=authority)
    return new_main


def builder_flow(repo: Path, wt_root: Path, task_id: str, branch_name: str, dirname: str,
                 subject: str, extra: str = "") -> str:
    base = origin_main(repo)
    wt = ensure_worktree(repo, wt_root, branch_name, base, dirname)
    if not clean(wt):
        raise Stop(f"builder worktree dirty at prestate task={task_id}")
    head = sha(wt)
    if head == base:
        baseline_green = capture_green_gates(wt)
        if not clean(wt):
            raise Stop(f"baseline gate battery left builder worktree dirty task={task_id}")
        baseline_current = run_gate(wt, task_id)
        if baseline_current.rc == 0:
            journal(repo, "TASK_ALREADY_GREEN", task=task_id, base=base)
            return base
        if baseline_current.rc != 1:
            raise Stop(f"task gate is not judgeable product RED; task={task_id} exit={baseline_current.rc}")
        agent = run_codex_resolving_architecture(repo, wt, "BUILDER", builder_prompt(task_id, base, extra), "BUILDER", task_id).report
        if sha(wt) != base:
            raise Stop(f"builder changed Git history task={task_id}; candidate must remain uncommitted")
        if agent.get("owner_decision_required") or agent.get("outcome") == "OWNER_DECISION_REQUIRED":
            raise Stop(f"architecture routing failure builder task={task_id}: {agent.get('stop_reason')}")
        if agent.get("outcome") not in {"READY", "NO_CHANGES"}:
            raise Stop(f"builder not ready task={task_id}: {agent}")
        files = assert_builder_scope(wt, task_id, base)
        if not files:
            raise Stop(f"builder returned ready but made no changes while gate is red: {task_id}")
        gate = run_gate(wt, task_id)
        if gate.rc != 0:
            raise Stop(f"builder candidate is not green against frozen gate task={task_id} rc={gate.rc}\n{gate.out}")
        candidate = stage_and_commit(wt, files, subject)
    else:
        if git(repo, "merge-base", "--is-ancestor", base, head, check=False).rc != 0:
            raise Stop(f"recovered builder candidate is not based on current main task={task_id}: {head}")
        # Recompute historical-green baseline at the exact task base, not at the recovered candidate.
        bw = detached_worktree(repo, wt_root, f"baseline-{task_id}-{base[:12]}-{now_id()}", base)
        try:
            baseline_green = capture_green_gates(bw)
        finally:
            if bw.exists() and clean(bw):
                remove_worktree(repo, bw)
        assert_builder_scope(wt, task_id, base)
        gate = run_gate(wt, task_id)
        if gate.rc != 0:
            raise Stop(f"recovered candidate is not green task={task_id} rc={gate.rc}\n{gate.out}")
        candidate = head
        journal(repo, "RECOVER_BUILDER_CANDIDATE", task=task_id, candidate=candidate)
    seen: list[str] = []
    while True:
        rvwt = detached_worktree(repo, wt_root, f"review-{task_id}-{candidate[:12]}", candidate)
        try:
            review_run = run_codex_resolving_architecture(repo, rvwt, "REVIEWER", reviewer_prompt(task_id, base, candidate), "REVIEWER", task_id)
            review = review_run.report
            if not clean(rvwt):
                raise Stop(f"reviewer modified candidate worktree task={task_id}")
        finally:
            if rvwt.exists() and clean(rvwt):
                remove_worktree(repo, rvwt)
        if review.get("owner_decision_required") or review.get("outcome") == "OWNER_DECISION_REQUIRED":
            raise Stop(f"architecture routing failure reviewer task={task_id}: {review.get('stop_reason')}")
        blockers = report_blockers(review)
        if review.get("outcome") == "READY" and not blockers:
            break
        if not blockers:
            raise Stop(f"reviewer not READY but no blockers task={task_id}: {review}")
        dg = blocker_digest(review)
        seen.append(dg)
        if len(seen) >= 3 and len(set(seen[-3:])) == 1:
            raise Stop(f"NO_PROGRESS task={task_id}: identical blockers repeated three consecutive candidates")
        if sha(wt) != candidate or not clean(wt):
            raise Stop(f"builder remediation prestate changed unexpectedly task={task_id}")
        rem = run_codex_resolving_architecture(repo, wt, "BUILDER", remediation_prompt("BUILDER", task_id, blockers, base), "BUILDER_REMEDIATION", task_id).report
        if sha(wt) != candidate:
            raise Stop(f"builder remediation changed Git history task={task_id}")
        if rem.get("owner_decision_required"):
            raise Stop(f"architecture routing failure remediation task={task_id}: {rem.get('stop_reason')}")
        if rem.get("outcome") != "READY":
            raise Stop(f"builder remediation not READY task={task_id}: {rem}")
        files = assert_builder_scope(wt, task_id, base)
        if not files:
            raise Stop(f"NO_PROGRESS task={task_id}: remediation made no changes")
        gate = run_gate(wt, task_id)
        if gate.rc != 0:
            raise Stop(f"remediation remains red task={task_id} rc={gate.rc}\n{gate.out}")
        candidate = stage_and_commit(wt, files, f"[LOOP] {task_id}: remediate independent review")
    assert_final_gates(wt, task_id, baseline_green)
    if origin_main(repo) != base:
        raise Stop(f"REMOTE_MAIN_CHANGED before publication task={task_id}")
    changed = [x for x in git(wt, "diff", "--name-only", f"{base}..{candidate}").out.splitlines() if x]
    authority = publication_authority(repo, candidate, task_id,
                                      review_run.result_file)
    return publish(repo, wt, branch_name, base, candidate, subject, changed,
                   publication_authority=authority)


def main_has_subject(repo: Path, subject: str) -> bool:
    out = git(repo, "log", "refs/remotes/origin/main", "--format=%s", "--fixed-strings", "--grep", subject).out
    return any(line.strip() == subject for line in out.splitlines())


def scan_gate_state(repo: Path, wt_root: Path) -> tuple[dict[str, int], dict[str, Any], Path]:
    base = origin_main(repo)
    scan = detached_worktree(repo, wt_root, f"scan-{base[:12]}-{now_id()}", base)
    spec = load_spec(scan)
    statuses: dict[str, int] = {}
    for t in spec["tasks"]:
        tid = t.get("id")
        if isinstance(tid, str) and isinstance(t.get("exit_test"), str):
            try:
                statuses[tid] = run_gate(scan, tid).rc
            except Stop:
                statuses[tid] = 125
    return statuses, spec, scan


def drain(repo: Path, wt_root: Path) -> None:
    while True:
        statuses, spec, scan = scan_gate_state(repo, wt_root)
        try:
            green = {tid for tid, rc in statuses.items() if rc == 0}
            red = [t for t in spec["tasks"] if isinstance(t.get("id"), str) and statuses.get(t["id"], 125) == 1]
            unjudgeable = {tid: rc for tid, rc in statuses.items() if rc not in {0, 1}}
            if unjudgeable:
                raise Stop(f"DRAIN_UNJUDGEABLE_GATES: {unjudgeable}")
            if not red:
                journal(repo, "DRAIN_COMPLETE", green=sorted(green))
                return
            eligible: list[dict[str, Any]] = []
            for t in red:
                deps = t.get("depends_on") or []
                if all(d in green for d in deps):
                    eligible.append(t)
            if not eligible:
                unresolved = {t["id"]: t.get("depends_on", []) for t in red}
                raise Stop(f"BLOCKED_NO_ELIGIBLE_TASK: {unresolved}")
            task = eligible[0]
            tid = task["id"]
            # h-003/h-004 are handled by the explicit bootstrap chain.
            if tid in {"h-003", "h-004"}:
                raise Stop(f"bootstrap task still red after bootstrap chain: {tid}")
        finally:
            if scan.exists() and clean(scan):
                remove_worktree(repo, scan)
        journal(repo, "DRAIN_PICK", task=tid)
        builder_flow(
            repo, wt_root, tid,
            f"nortropic/auto-{tid}-v2",
            f"auto-{tid}-builder-v2",
            f"[LOOP] {tid}: Codex autopilot remediation",
        )


def bootstrap(repo: Path, wt_root: Path, do_drain: bool) -> None:
    ensure_dependencies()
    if repo_identity(repo) != EXPECTED_REPO:
        raise Stop(f"wrong repository: {repo_identity(repo)}")
    base = origin_main(repo)
    ensure_substitution_authority(repo)
    journal(
        repo,
        "BOOTSTRAP_RECONCILE",
        origin_main=base,
        rejected_s3=REJECTED_S3,
        substitution_blob=SUBSTITUTION_BLOBS[SUBSTITUTION_OWNER_PATH],
    )
    owner_on_main = git(repo, "cat-file", "-e", f"refs/remotes/origin/main:{OWNER_DECISION_PATH}", check=False)
    if owner_on_main.rc != 0:
        raise Stop(f"owner decision artifact missing from authoritative origin/main: {OWNER_DECISION_PATH}")
    if not main_has_subject(repo, H003_GATE_SUBJECT):
        test_author_flow(repo, wt_root)
    else:
        journal(repo, "BOOTSTRAP_STAGE_SKIP", stage="h003_gate", reason="merge subject present on origin/main")
    if not main_has_subject(repo, H003_BUILD_SUBJECT):
        builder_flow(
            repo, wt_root, "h-003",
            "nortropic/auto-h-003-attestation-authority-v1",
            "h003-attestation-authority-builder-v1",
            H003_BUILD_SUBJECT,
            extra=f"Implement the generic authority protocol frozen from `{OWNER_DECISION_PATH}`. Do not touch h-004 implementation here.",
        )
    else:
        journal(repo, "BOOTSTRAP_STAGE_SKIP", stage="h003_builder", reason="merge subject present on origin/main")
    if not main_has_subject(repo, H004_BUILD_SUBJECT):
        if git(repo, "merge-base", "--is-ancestor", REJECTED_S3, "refs/remotes/origin/main", check=False).rc == 0:
            raise Stop(f"rejected S3 candidate unexpectedly appears in authoritative main ancestry: {REJECTED_S3}")
        builder_flow(
            repo, wt_root, "h-004",
            "nortropic/s3-h-004-heartbeat-v2",
            "s3-h004-heartbeat-builder-v2",
            H004_BUILD_SUBJECT,
            extra=(
                f"This is a FRESH S3 candidate from current origin/main. Never reuse rejected candidate {REJECTED_S3}. "
                f"Consume the frozen generic h-003 authority API from `{OWNER_DECISION_PATH}` and preserve h-004 allowed_write/budgets."
            ),
        )
    else:
        journal(repo, "BOOTSTRAP_STAGE_SKIP", stage="h004_builder", reason="merge subject present on origin/main")
    if do_drain:
        full_roadmap(repo, wt_root)
    else:
        journal(repo, "BOOTSTRAP_COMPLETE", full_roadmap="disabled")


def selftest(repo: Path | None = None) -> None:
    sub_expected = ["SUB-1", "SUB-2", "SUB-3", "SUB-4"]
    road_expected = ["S2", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13"]
    sub_codes = [x.code for x in SUBSTITUTION_ROADMAP]
    road_codes = [x.code for x in ROADMAP]
    if sub_codes != sub_expected:
        raise Stop(f"substitution roadmap order mismatch: {sub_codes}")
    if road_codes != road_expected:
        raise Stop(f"roadmap order mismatch: {road_codes}")
    all_slices = SUBSTITUTION_ROADMAP + ROADMAP
    if len({x.task_id for x in all_slices}) != len(all_slices):
        raise Stop("roadmap task ids are not unique")
    if len({x.gate_path for x in all_slices}) != len(all_slices):
        raise Stop("roadmap gate paths are not unique")
    sub_exact = {
        "SUB-1": ("h-027", "verify/bin/h-027-exit"),
        "SUB-2": ("h-028", "verify/bin/h-028-exit"),
        "SUB-3": ("h-029", "verify/bin/h-029-exit"),
        "SUB-4": ("h-030", "verify/bin/h-030-exit"),
    }
    road_exact = {
        "S2": ("h-015", "verify/bin/h-015-exit"),
        "S4": ("h-018", "verify/bin/h-018-exit"),
        "S5": ("h-019", "verify/bin/h-019-exit"),
        "S6": ("h-014", "verify/bin/h-014-exit"),
        "S7": ("h-020", "verify/bin/h-020-exit"),
        "S8": ("h-021", "verify/bin/h-021-exit"),
        "S9": ("h-022", "verify/bin/h-022-exit"),
        "S10": ("h-023", "verify/bin/h-023-exit"),
        "S11": ("h-024", "verify/bin/h-024-exit"),
        "S12": ("h-025", "verify/bin/h-025-exit"),
        "S13": ("h-026", "verify/bin/h-026-exit"),
    }
    if {x.code: (x.task_id, x.gate_path) for x in SUBSTITUTION_ROADMAP} != sub_exact:
        raise Stop("substitution task/gate mapping drifted from owner contract")
    if {x.code: (x.task_id, x.gate_path) for x in ROADMAP} != road_exact:
        raise Stop("S-roadmap task/gate mapping drifted from frozen plan")
    # Migration floor: S2/S4/S5 must not be schedulable before SUB-4.
    for code in ("S2", "S4", "S5"):
        sl = next(x for x in ROADMAP if x.code == code)
        if "h-030" not in sl.required_deps:
            raise Stop(f"provider-neutral dependency floor missing from {code}")
    if ROADMAP_PLAN_SHA != "0b3212c991d4227c8df2656465ae2c0252dda39e":
        raise Stop("roadmap authority SHA drift")
    if (len(SUBSTITUTION_BLOBS) != 11 or
            SUBSTITUTION_BLOBS.get(SUBSTITUTION_OWNER_PATH) != "4a41e3952f55453ba2e83b2d553f7af2b76d5705" or
            SUBSTITUTION_BLOBS.get(SUBSTITUTION_AUDIT_PATH) != "bb5f99c111cd5aaf784e73e67bde354023b1b5f2"):
        raise Stop("substitution authority blob drift")
    if repo is not None and repo.exists():
        for rel, expected_blob in SUBSTITUTION_BLOBS.items():
            ref = f"refs/remotes/origin/main:{rel}"
            if git(repo, "cat-file", "-e", ref, check=False).rc != 0:
                raise Stop(f"selftest substitution authority missing from origin/main: {rel}")
            actual_blob = git(repo, "rev-parse", ref).out.strip()
            if actual_blob != expected_blob:
                raise Stop(
                    f"selftest substitution authority mismatch path={rel} "
                    f"expected={expected_blob} actual={actual_blob}"
                )
    if EMPIRICAL_STAGE != "L" or EMPIRICAL_MAX_ROUNDS != 5:
        raise Stop("empirical closeout configuration drift")
    if EMPIRICAL_GATE_PATH != "verify/bin/autonomous-loop-exit":
        raise Stop("empirical program-gate identity drift")
    src_path = Path(globals().get("__file__", ""))
    if src_path.is_file():
        src = src_path.read_text(encoding="utf-8")
    elif repo is not None:
        shown = git(
            repo, "show", "refs/remotes/origin/main:scripts/nortropic-codex-autopilot.py",
            check=False,
        )
        if shown.rc != 0 or not shown.out:
            raise Stop("v4 selftest cannot resolve authoritative streamed source")
        src = shown.out
    else:
        raise Stop("v4 selftest source unavailable")
    required = [
        "run_codex_resolving_architecture", "HUMAN_AUTHORITY_HARD_STOP", "ARCHITECT_RESOLUTION",
        "FULL_ROADMAP_SOFTWARE_COMPLETE", "FULL_ROADMAP_COMPLETE", "ensure_empirical_program_gate",
        "EMPIRICAL_GATE_PATH", "ensure_substitution_authority", "SUBSTITUTION_ROADMAP",
        "SUBSTITUTION_BEFORE_NEW_HARNESS_COMPONENT", "provider-neutral",
    ]
    if src and any(x not in src for x in required):
        raise Stop("v4 architecture/substitution routing markers missing")
    needle = "run_" + "codex(repo"
    if src and src.count(needle) != 3:
        raise Stop("role execution bypasses v4 architecture router")
    legacy_direct = 'raise Stop(f"OWNER_' + 'DECISION_REQUIRED'
    if src and legacy_direct in src:
        raise Stop("legacy direct human owner-decision stop remains")
    if tuple(FORBIDDEN_GIT_TOKENS) != ("--force", "--force-with-lease", "--amend"):
        raise Stop("forbidden git token guard drift")
    print("AUTOPILOT_V4_SELFTEST=PASS")
    print("SUBSTITUTION=" + "->".join(sub_codes))
    print("ROADMAP=" + "->".join(road_codes))
    print(f"PLAN_SHA={ROADMAP_PLAN_SHA}")
    print(f"SUBSTITUTION_CONTRACT_BLOB={SUBSTITUTION_BLOBS[SUBSTITUTION_OWNER_PATH]}")
    print(f"EMPIRICAL_GATE={EMPIRICAL_GATE_PATH}")


def supervisor_paths() -> tuple[Path, Path, Path, Path, str]:
    home = Path.home()
    state = home / ".local/state/nortropic"
    enabled = state / "codex-autopilot-v2.enabled"
    done = state / "codex-autopilot-v2.done"
    blocked = state / "codex-autopilot-v2.blocked"
    plist = home / "Library/LaunchAgents/com.nortropic.codex-autopilot-v2.plist"
    return enabled, done, blocked, plist, "com.nortropic.codex-autopilot-v2"


def supervisor_resume(repo: Path) -> None:
    doctor(repo)
    lock = acquire_lock(repo)
    lock.close()
    enabled, done, blocked, plist, label = supervisor_paths()
    if not plist.exists():
        raise Stop(f"LaunchAgent plist missing: {plist}")
    enabled.parent.mkdir(parents=True, exist_ok=True)
    done.unlink(missing_ok=True)
    blocked.unlink(missing_ok=True)
    enabled.write_text(f"enabled-v4 {dt.datetime.now(dt.timezone.utc).isoformat()}\n", encoding="utf-8")
    uid = str(os.getuid())
    probe = run(["launchctl", "print", f"gui/{uid}/{label}"], check=False)
    if probe.rc != 0:
        run(["launchctl", "bootstrap", f"gui/{uid}", str(plist)])
    run(["launchctl", "kickstart", "-k", f"gui/{uid}/{label}"])
    print("AUTOPILOT_V4_RESUME=STARTED")
    print(f"ENABLED={enabled}")


def status(repo: Path, wt_root: Path) -> None:
    ensure_dependencies()
    ident = repo_identity(repo)
    om = origin_main(repo)
    jr = journal_root(repo) / "events.jsonl"
    latest: dict[str, Any] | None = None
    if jr.exists():
        try:
            lines = [x for x in jr.read_text(encoding="utf-8").splitlines() if x.strip()]
            if lines:
                latest = json.loads(lines[-1])
        except Exception:
            latest = None
    print("AUTOPILOT_VERSION=4")
    print(f"REPOSITORY={ident}")
    print(f"ORIGIN_MAIN={om}")
    print(f"FULL_ROADMAP_PLAN_SHA={ROADMAP_PLAN_SHA}")
    print(f"SUBSTITUTION_CONTRACT_BLOB={SUBSTITUTION_BLOBS[SUBSTITUTION_OWNER_PATH]}")
    enabled, done, blocked, _plist, _label = supervisor_paths()
    print(f"SUPERVISOR_ENABLED={'YES' if enabled.exists() else 'NO'}")
    print(f"SUPERVISOR_BLOCKED={'YES' if blocked.exists() else 'NO'}")
    print(f"SUPERVISOR_DONE={'YES' if done.exists() else 'NO'}")
    if latest:
        print(f"LATEST_EVENT={latest.get('event', 'OVERIFIERAT')}")
        print(f"LATEST_EVENT_TS={latest.get('ts', 'OVERIFIERAT')}")
        for key in ("slice", "task", "role", "outcome", "reason", "main"):
            if key in latest:
                print(f"LATEST_{key.upper()}={latest[key]}")
    else:
        print("LATEST_EVENT=OVERIFIERAT")


def roadmap_status(repo: Path, wt_root: Path) -> None:
    ensure_roadmap_plan(repo)
    ensure_substitution_authority(repo)
    base = origin_main(repo)
    scan = detached_worktree(repo, wt_root, f"status-roadmap-{base[:12]}-{now_id()}", base)
    try:
        print(f"ROADMAP_PLAN_SHA={ROADMAP_PLAN_SHA}")
        print(f"SUBSTITUTION_CONTRACT_BLOB={SUBSTITUTION_BLOBS[SUBSTITUTION_OWNER_PATH]}")
        print(f"SUB-0\t{SUBSTITUTION_OWNER_PATH}\tFROZEN")
        for sl in SUBSTITUTION_ROADMAP + ROADMAP:
            t = task_obj_optional(scan, sl.task_id)
            if t is None:
                print(f"{sl.code}\t{sl.task_id}\tUNFROZEN")
                continue
            rel = t.get("exit_test")
            if not isinstance(rel, str) or not (scan / rel).exists():
                print(f"{sl.code}\t{sl.task_id}\tUNJUDGEABLE")
                continue
            try:
                rc = run_gate(scan, sl.task_id).rc
            except Stop:
                rc = 125
            state = "GREEN" if rc == 0 else "RED" if rc == 1 else f"UNJUDGEABLE({rc})"
            print(f"{sl.code}\t{sl.task_id}\t{state}")
        if not (scan / EMPIRICAL_GATE_PATH).exists():
            l_state = "UNFROZEN"
        else:
            try:
                lrc = run_empirical_gate(scan).rc
            except Stop:
                lrc = 125
            l_state = "GREEN" if lrc == 0 else "RED" if lrc == 1 else f"UNJUDGEABLE({lrc})"
        print(f"L\t{EMPIRICAL_GATE_PATH}\t{l_state}")
        events = journal_root(repo) / "events.jsonl"
        software = external = "NO"
        if events.exists():
            try:
                names = [json.loads(line).get("event") for line in events.read_text(encoding="utf-8").splitlines() if line.strip()]
                software = "YES" if "FULL_ROADMAP_SOFTWARE_COMPLETE" in names else "NO"
                external = "YES" if "FULL_ROADMAP_COMPLETE" in names else "NO"
            except Exception:
                software = external = "OVERIFIERAT"
        print(f"FULL_ROADMAP_SOFTWARE_COMPLETE={software}")
        print(f"FULL_ROADMAP_COMPLETE={external}")
    finally:
        if scan.exists() and clean(scan):
            remove_worktree(repo, scan)



def watch(repo: Path) -> None:
    """Lightweight read-only terminal dashboard; never executes gates or mutates repo."""
    enabled, done, blocked, _plist, _label = supervisor_paths()
    events = journal_root(repo) / "events.jsonl"
    try:
        while True:
            os.system("clear")
            print("NORTROPIC CODEX AUTOPILOT v4 — PROVIDER-NEUTRAL LIVE")
            print(f"ORIGIN_MAIN_CACHE={sha(repo, 'refs/remotes/origin/main')}")
            print(f"SUPERVISOR_ENABLED={'YES' if enabled.exists() else 'NO'}  BLOCKED={'YES' if blocked.exists() else 'NO'}  DONE={'YES' if done.exists() else 'NO'}")
            if blocked.exists():
                try:
                    print("BLOCKER=" + blocked.read_text(encoding="utf-8").strip()[:1200])
                except Exception:
                    print("BLOCKER=OVERIFIERAT")
            print("\\nRECENT TRANSITIONS")
            if events.exists():
                try:
                    rows = [json.loads(x) for x in events.read_text(encoding="utf-8").splitlines() if x.strip()]
                    for r in rows[-18:]:
                        fields = []
                        for k in ("slice","task","role","outcome","main","reason"):
                            if k in r:
                                fields.append(f"{k}={str(r[k])[:100]}")
                        print(f"{r.get('ts','?')}  {r.get('event','?')}  " + " ".join(fields))
                except Exception as e:
                    print(f"journal unreadable: {e}")
            else:
                print("(no journal yet)")
            print("\\nACTIVE WORKTREES")
            try:
                for row in worktrees(repo):
                    print(f"{row.get('worktree','?')}  {row.get('branch', row.get('HEAD','?'))}")
            except Exception as e:
                print(f"worktree read failed: {e}")
            print("\\nCtrl-C closes only this observer; autopilot keeps running.")
            time.sleep(2)
    except KeyboardInterrupt:
        return



def doctor(repo: Path) -> None:
    ensure_dependencies()
    ident = repo_identity(repo)
    if ident != EXPECTED_REPO:
        raise Stop(f"wrong repository: {ident}")
    om = origin_main(repo)
    ensure_roadmap_plan(repo)
    ensure_substitution_authority(repo)
    if git(repo, "cat-file", "-e", f"refs/remotes/origin/main:{FULL_ROADMAP_OWNER_PATH}", check=False).rc != 0:
        raise Stop(f"full-roadmap owner delegation missing from origin/main: {FULL_ROADMAP_OWNER_PATH}")
    print(
        f"DOCTOR=PASS\nREPOSITORY={ident}\nORIGIN_MAIN={om}\nROADMAP_PLAN_SHA={ROADMAP_PLAN_SHA}\n"
        f"SUBSTITUTION_CONTRACT_BLOB={SUBSTITUTION_BLOBS[SUBSTITUTION_OWNER_PATH]}\n"
        "ARCHITECTURE=PROVIDER_NEUTRAL_TRUST_KERNEL\n"
        "FULL_ROADMAP=YES\nCODEX_FULL_ACCESS_MODE=danger-full-access\nAPPROVAL_POLICY=never"
    )


def acquire_lock(repo: Path):
    lock_path = common_git_dir(repo) / "nortropic-codex-autopilot.lock"
    f = lock_path.open("w")
    try:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError as e:
        raise Stop(f"another Nortropic Codex autopilot is already running: {lock_path}") from e
    f.write(f"pid={os.getpid()} started={dt.datetime.now().isoformat()}\n")
    f.flush()
    return f


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Nortropic Codex Build Autopilot v4 — provider-neutral trust-kernel roadmap")
    p.add_argument("--repo", default=str(Path.home() / "nortropic/nortropic-system"))
    p.add_argument("--worktrees", default=str(Path.home() / "nortropic/worktrees"))
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("doctor")
    sub.add_parser("status")
    sub.add_parser("roadmap")
    sub.add_parser("watch")
    sub.add_parser("resume")
    sub.add_parser("selftest")
    r = sub.add_parser("run")
    r.add_argument("--no-drain", action="store_true", help="stop after explicit h-003→h-004 bootstrap chain; skip SUB-1..SUB-4/S2–S13/L")
    return p.parse_args()


def main() -> int:
    a = parse_args()
    repo = Path(a.repo).expanduser().resolve()
    wt_root = Path(a.worktrees).expanduser().resolve()
    if a.cmd == "selftest":
        try:
            selftest(repo)
            return 0
        except Stop as e:
            print(f"AUTOPILOT_BLOCKED: {e}", file=sys.stderr)
            return 2
    if not repo.exists():
        print(f"AUTOPILOT_BLOCKED: repo missing: {repo}", file=sys.stderr)
        return 2
    try:
        if a.cmd == "doctor":
            doctor(repo)
            return 0
        if a.cmd == "status":
            status(repo, wt_root)
            return 0
        if a.cmd == "roadmap":
            roadmap_status(repo, wt_root)
            return 0
        if a.cmd == "watch":
            watch(repo)
            return 0
        if a.cmd == "resume":
            supervisor_resume(repo)
            return 0
        lock = acquire_lock(repo)
        try:
            bootstrap(repo, wt_root, not a.no_drain)
        finally:
            lock.close()
        return 0
    except Stop as e:
        try:
            journal(repo, "BLOCKED", reason=str(e))
        except Exception:
            pass
        print(f"AUTOPILOT_BLOCKED: {e}", file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        print("AUTOPILOT_INTERRUPTED", file=sys.stderr)
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
