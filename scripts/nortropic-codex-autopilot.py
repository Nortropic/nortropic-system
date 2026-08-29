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

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
sys.dont_write_bytecode = True
sys.path.insert(0, str(REPOSITORY_ROOT))
from controller.authority.core import (AuthorityError, canonical_path, permits,
                                       strict_json_bytes)  # noqa: E402
from controller.result.consumer import consume_private_result  # noqa: E402
from controller.result.materialize import materialize  # noqa: E402

EXPECTED_REPO = "Nortropic/nortropic-system"
CANONICAL_ORIGIN_URL = "git@github.com:Nortropic/nortropic-system.git"
CANONICAL_ORIGIN_FETCH = "+refs/heads/*:refs/remotes/origin/*"
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
CODEX_RUN_TIMEOUT_SECONDS = 86400
ATTEMPT_ROOT_ENV = "NORTROPIC_ATTEMPT_ROOT"
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
GIT_CONTROL_PREFIX = "GIT_"
EMPTY_TREE_SHA1 = "4b825dc642cb6eb9a060e54bf8d69288fbee4904"
MAX_ARCHITECT_ROUNDS = 5
SUBSTITUTION_BEFORE_NEW_HARNESS_COMPONENT = True
ROADMAP_PLAN_BLOBS = {
    ROADMAP_PLAN_PATH: "c8ea851167f38f6846485035ee2e6b1dc3b54db0",
    ROADMAP_HANDOFF_PATH: "1e53887c59b8da0989579eaa241c5b53ea02abb9",
}
SUBSTITUTION_BLOBS = {
    SUBSTITUTION_OWNER_PATH: "3997437cd20c6dd7397622b512ffd90dab5cf391",
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


def raw_git_environment() -> dict[str, str]:
    environment = {key: value for key, value in os.environ.items()
                   if not key.startswith(GIT_CONTROL_PREFIX)}
    environment["GIT_NO_REPLACE_OBJECTS"] = "1"
    environment["GIT_ALTERNATE_OBJECT_DIRECTORIES"] = ""
    environment.update({"GIT_SSH_COMMAND": "/usr/bin/ssh -F /dev/null -oBatchMode=yes -oPermitLocalCommand=no -oProxyCommand=none",
                        "GIT_SSH_VARIANT": "ssh", "SSH_ASKPASS_REQUIRE": "never"})
    return environment
@dataclass
class AgentRun:
    report: dict[str, Any]
    thread_id: str | None
    event_log: Path
    result_file: Path


_LAST_AGENT_CONTEXT: tuple[str | None, Path, Path] | None = None
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


def run(argv: list[str], cwd: Path | None = None, *, check: bool = True, timeout: int | None = None, env: dict[str, str] | None = None, input_text: str | None = None) -> Cmd:
    if not argv or not all(isinstance(x, str) and x for x in argv):
        raise Stop(f"invalid argv: {argv!r}")
    if argv[0].rsplit(os.sep, 1)[-1].casefold() == "codex":
        raise Stop("generic process boundary cannot launch Codex")
    if argv[0].rsplit(os.sep, 1)[-1].casefold() == "git":
        joined = " ".join(argv)
        if any(tok in joined for tok in FORBIDDEN_GIT_TOKENS):
            raise Stop(f"forbidden git semantics requested: {joined}")
        if len(argv) > 1 and argv[1] in {"reset", "rebase"}:
            raise Stop(f"history rewrite command forbidden: {joined}")
        if any(arg.startswith("+") for arg in argv[1:]):
            raise Stop(f"leading + refspec forbidden: {joined}")
    process_environment = None if env is None else dict(env)
    p = subprocess.run(
        argv,
        cwd=str(cwd) if cwd else None,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        timeout=timeout,
        env=process_environment,
        input=input_text,
    )
    if check and p.returncode != 0:
        raise Stop(f"command failed rc={p.returncode}: {' '.join(argv)}\n{p.stdout}")
    return Cmd(p.returncode, p.stdout)


def git(repo: Path, *args: str, check: bool = True, timeout: int | None = None) -> Cmd:
    return closed_worktree_git(repo, *args, check=check, timeout=timeout)


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
    assert_raw_git_authority(repo)
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
    files = changed_files(repo, base_sha)
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


def run_invariants(repo: Path) -> Cmd | None:
    p = repo / "scripts/check-invariants.mjs"
    if not p.exists():
        return None
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
    fetch_origin(repo, "main")
    return sha(repo, "refs/remotes/origin/main")


def worktrees(repo: Path) -> list[dict[str, str]]:
    admin = common_git_dir(repo) / "worktrees"
    if ((admin.exists() or admin.is_symlink())
            and not _closed_control_tree(admin)):
        raise Stop("worktree registry has an external alias")
    raw = closed_worktree_git(repo, "worktree", "list", "--porcelain").out
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
    for row in rows:
        path = Path(row.get("worktree", ""))
        keys = {"worktree", "HEAD", "branch"} if "branch" in row else {"worktree", "HEAD", "detached"}
        try:
            gitdir = Path(closed_worktree_git(path, "rev-parse", "--path-format=absolute", "--git-dir").out.strip())
            actual_branch = branch(path)
        except (OSError, Stop):
            raise Stop("worktree registry target is not readable")
        linked = gitdir != admin.parent
        if (set(row) != keys or path.resolve(strict=True) != path
                or not _owned_real_directory(path) or sha(path) != row.get("HEAD")
                or row.get("branch", "").removeprefix("refs/heads/") != actual_branch
                or (linked and (gitdir.parent != admin or not _closed_control_tree(gitdir) or not _single_link_owned_file(path / ".git", 1024 * 1024)))
                or (not linked and (gitdir != admin.parent or path / ".git" != admin.parent))):
            raise Stop("worktree registry target binding mismatch")
    if raw != closed_worktree_git(repo, "worktree", "list", "--porcelain").out:
        raise Stop("worktree registry changed during binding")
    return rows


def local_branch_exists(repo: Path, name: str) -> bool:
    return git(repo, "show-ref", "--verify", "--quiet", f"refs/heads/{name}", check=False).rc == 0


def detached_worktree(repo: Path, wt_root: Path, name: str, commit_sha: str) -> Path:
    p = (wt_root / name).resolve()
    if p.exists():
        if any(p.iterdir()):
            raise Stop(f"review worktree path not empty: {p}")
    worktrees(repo)
    closed_worktree_git(repo, "worktree", "add", "--detach", str(p), commit_sha, raw_checkout=True)
    if sha(p) != commit_sha or not clean(p):
        raise Stop(f"detached reviewer identity mismatch: {p}")
    return p


def remove_worktree(repo: Path, p: Path) -> None:
    if p.exists() and not clean(p):
        raise Stop(f"refusing to remove dirty reviewer worktree: {p}")
    worktrees(repo)
    closed_worktree_git(repo, "worktree", "remove", str(p))


def closed_worktree_git(repo: Path, *args: str, check: bool = True, timeout: int | None = None, raw_attributes: bool = False, raw_checkout: bool = False) -> Cmd:
    environment = raw_git_environment()
    environment.update({
        "GIT_CONFIG_NOSYSTEM": "1",
        "GIT_CONFIG_GLOBAL": "/dev/null",
        "GIT_CONFIG_COUNT": "0",
        "GIT_TERMINAL_PROMPT": "0",
    })
    if raw_attributes or raw_checkout:
        environment.update({"GIT_ATTR_SOURCE": EMPTY_TREE_SHA1, "GIT_ATTR_NOSYSTEM": "1"})
    if raw_checkout:
        args = ("-c", "core.attributesFile=/dev/null", "-c", "core.autocrlf=false", "-c", "core.eol=lf", *args)
    return run(
        ["/usr/bin/git", "-c", "core.hooksPath=/dev/null",
         "-c", "core.fsmonitor=false",
         "-c", "core.untrackedCache=false", "-c", "protocol.allow=never",
         "-c", "protocol.ssh.allow=always", *args],
        cwd=repo, check=check, timeout=timeout, env=environment,
        input_text="* diff\n" if raw_attributes else None,
    )
def _owned_real_directory(path: Path) -> bool:
    try:
        opened = path.lstat()
        return (not path.is_symlink() and stat.S_ISDIR(opened.st_mode)
                and opened.st_uid == os.getuid()
                and path.resolve(strict=True) == path)
    except OSError:
        return False
def _closed_control_tree(path: Path, budget: list[int] | None = None) -> bool:
    if budget is None:
        budget = [200000]
    if not _owned_real_directory(path):
        return False
    try:
        children = list(path.iterdir())
    except OSError:
        return False
    budget[0] -= len(children)
    if budget[0] < 0:
        return False
    for child in children:
        try:
            opened = child.lstat()
        except OSError:
            return False
        if child.is_symlink() or opened.st_uid != os.getuid():
            return False
        if stat.S_ISDIR(opened.st_mode):
            if not _closed_control_tree(child, budget):
                return False
        elif not stat.S_ISREG(opened.st_mode) or opened.st_nlink != 1:
            return False
    return True
def assert_raw_git_authority(repo: Path, standalone: bool = False) -> list[tuple[str, str, str]]:
    common = common_git_dir(repo)
    gitdir_raw = git(repo, "rev-parse", "--path-format=absolute", "--git-dir").out.strip()
    gitdir = Path(gitdir_raw)
    marker = repo / ".git"
    linked = gitdir != common
    if (not _owned_real_directory(repo)
            or not _owned_real_directory(common)
            or not _closed_control_tree(common / "refs")
            or not _closed_control_tree(common / "info")
            or not _closed_control_tree(common / "objects")
            or (((common / "worktrees").exists() or (common / "worktrees").is_symlink())
                and not _closed_control_tree(common / "worktrees"))
            or not _single_link_owned_file(common / "config", 1024 * 1024)
            or ((common / "packed-refs").exists()
                or (common / "packed-refs").is_symlink())
            and not _single_link_owned_file(common / "packed-refs", 16 * 1024 * 1024)):
        raise Stop("authoritative Git control tree has an external alias")
    if linked:
        if (gitdir.parent != common / "worktrees"
                or not _closed_control_tree(gitdir)
                or not _single_link_owned_file(marker, 1024 * 1024)
                or not _single_link_owned_file(gitdir / "HEAD", 1024 * 1024)
                or not _single_link_owned_file(gitdir / "index", 64 * 1024 * 1024)
                or not _single_link_owned_file(gitdir / "commondir", 1024 * 1024)
                or not _single_link_owned_file(gitdir / "gitdir", 1024 * 1024)):
            raise Stop("linked worktree Git admin has an external alias")
    elif marker != common or not _owned_real_directory(marker):
        raise Stop("ordinary worktree Git directory identity mismatch")
    forbidden = (common / "refs/replace", common / "info/grafts", common / "shallow",
                 common / "objects/info/alternates", common / "objects/info/http-alternates",
                 common / "info/attributes", gitdir / "config.worktree")
    if any(path.exists() or path.is_symlink() for path in forbidden):
        raise Stop("authoritative Git contains replacement or external history")
    raw_config = closed_worktree_git(repo, "config", "--file", str(common / "config"),
                                     "--no-includes", "--null", "--list").out
    config_rows = [record.partition("\n") for record in raw_config.split("\0") if record]
    values = {key.casefold(): value for key, separator, value in config_rows if separator}
    core = {"core.repositoryformatversion": "0", "core.bare": "false", "core.filemode": "true", "core.logallrefupdates": "false" if standalone else "true",
            "core.ignorecase": "true", "core.precomposeunicode": "true"}
    origin = {"remote.origin.url": CANONICAL_ORIGIN_URL, "remote.origin.fetch": CANONICAL_ORIGIN_FETCH}
    branches = {key: value for key, value in values.items() if key.startswith("branch.")}
    branch_ok = all((key.endswith(".remote") and value == "origin") or (key.endswith(".merge") and value.startswith("refs/heads/"))
                    or (key.endswith(".vscode-merge-base") and value == "origin/main") for key, value in branches.items())
    remotes = {key: value for key, value in values.items() if key.startswith(("remote.", "url."))}
    if (len(values) != len(config_rows) or any(not separator for _key, separator, _value in config_rows)
            or {key: values.get(key) for key in core} != core
            or (remotes != ({} if standalone else origin) and remotes != {}) or not branch_ok
            or (standalone and branches) or set(values) != set(core) | set(remotes) | set(branches)):
        raise Stop("authoritative Git local config is not the closed canonical profile")
    replacements = closed_worktree_git(repo, "for-each-ref", "--format=%(refname)",
                                       "refs/replace").out.strip()
    pack = common / "objects/pack"
    try:
        promisor = ((pack.exists() or pack.is_symlink()) and (
            pack.is_symlink() or not pack.is_dir()
            or any(path.name.endswith(".promisor") for path in pack.iterdir())
        ))
    except OSError as exc:
        raise Stop("authoritative Git promisor inventory is unreadable") from exc
    if (replacements or promisor
            or closed_worktree_git(repo, "rev-parse", "--show-object-format").out.strip() != "sha1"):
        raise Stop("authoritative Git contains replacement or promisor authority")
    return config_rows
def canonical_origin(repo: Path) -> str:
    rows = assert_raw_git_authority(repo)
    remote = sorted((key.casefold(), value) for key, separator, value in rows if separator and key.casefold().startswith(("remote.", "url.")))
    if remote != [("remote.origin.fetch", CANONICAL_ORIGIN_FETCH), ("remote.origin.url", CANONICAL_ORIGIN_URL)]:
        raise Stop("canonical origin config mismatch")
    return CANONICAL_ORIGIN_URL
def fetch_origin(repo: Path, name: str) -> None:
    ref = f"refs/heads/{name}"
    closed_worktree_git(repo, "fetch", "--no-tags", "--no-recurse-submodules", "--no-write-fetch-head", canonical_origin(repo),
                        f"{ref}:refs/remotes/origin/{name}")
def untracked_inventory(repo: Path) -> list[str]:
    paths: set[str] = set()
    variants = (
        ("--others", "--exclude-standard", "--directory", "-z"),
        ("--others", "--ignored", "--exclude-standard", "--directory", "-z"),
    )
    for variant in variants:
        raw = closed_worktree_git(repo, "ls-files", *variant).out
        for value in raw.split("\0"):
            if not value:
                continue
            rel = value[:-1] if value.endswith("/") else value
            try:
                paths.add(canonical_path(rel))
            except AuthorityError as exc:
                raise Stop(f"unsafe provider scratch path: {exc}") from exc
    return sorted(paths)
def exact_worktree_clean(repo: Path) -> bool:
    status = closed_worktree_git(
        repo, "status", "--porcelain=v1", "--untracked-files=all",
        "--ignore-submodules=none",
    ).out.strip()
    return not status and not untracked_inventory(repo)
def _owned_common_git_directory(repo: Path, name: str) -> Path:
    common = common_git_dir(repo)
    root = common / name
    root.mkdir(mode=0o700, exist_ok=True)
    opened = root.lstat()
    if (root.is_symlink() or not stat.S_ISDIR(opened.st_mode)
            or opened.st_uid != os.getuid()
            or stat.S_IMODE(opened.st_mode) != 0o700):
        raise Stop(f"controller-owned Git directory has unsafe identity: {root}")
    resolved = root.resolve()
    if resolved.parent != common:
        raise Stop(f"controller-owned Git directory escaped common Git: {root}")
    return resolved
def protected_worktree_root(repo: Path) -> Path:
    return _owned_common_git_directory(repo, "nortropic-controller-worktrees")
def protected_materialization_root(repo: Path) -> Path: return _owned_common_git_directory(repo, "nortropic-candidate-materialization")
def registered_worktree(repo: Path, path: Path) -> dict[str, str]:
    wanted = path.resolve()
    hits = [row for row in worktrees(repo) if Path(row.get("worktree", "")).resolve() == wanted]
    if len(hits) != 1:
        raise Stop(f"worktree registration mismatch path={wanted} count={len(hits)}")
    return hits[0]
def assert_worktree_binding(repo: Path, path: Path, expected_head: str, expected_branch: str | None) -> None:
    wanted = path.resolve()
    if (wanted != path or path.is_symlink() or not path.is_dir()
            or not _single_link_checkout_tree(path, repo, expected_head)
            or not _single_link_owned_file(path / ".git", 1024 * 1024)):
        raise Stop(f"worktree path identity mismatch: {path}")
    top = Path(closed_worktree_git(
        path, "rev-parse", "--show-toplevel"
    ).out.strip()).resolve()
    if top != wanted or common_git_dir(path) != common_git_dir(repo):
        raise Stop(f"worktree repository binding mismatch: {path}")
    row = registered_worktree(repo, path)
    expected_keys = ({"worktree", "HEAD", "detached"} if expected_branch is None
                     else {"worktree", "HEAD", "branch"})
    gitdir = Path(closed_worktree_git(
        path, "rev-parse", "--path-format=absolute", "--git-dir"
    ).out.strip())
    if (set(row) != expected_keys or row.get("worktree") != str(path)
            or row.get("HEAD") != expected_head
            or not _closed_control_tree(gitdir)
            or not _single_link_owned_file(gitdir / "index", 64 * 1024 * 1024)):
        raise Stop(f"registered worktree HEAD mismatch path={path}")
    if expected_branch is None:
        if "branch" in row or "detached" not in row or branch(path):
            raise Stop(f"provider scratch is not exact detached HEAD: {path}")
    elif (row.get("branch") != f"refs/heads/{expected_branch}"
          or branch(path) != expected_branch):
        raise Stop(f"protected branch binding mismatch: {path}")
    if sha(path) != expected_head:
        raise Stop(f"worktree resolved HEAD mismatch: {path}")
def ensure_protected_builder_worktree(repo: Path, branch_name: str, base: str) -> Path:
    branch_exists = local_branch_exists(repo, branch_name)
    if branch_exists:
        existing_head = sha(repo, f"refs/heads/{branch_name}")
        if (existing_head != base and closed_worktree_git(
                repo, "merge-base", "--is-ancestor", existing_head, base,
                check=False).rc != 0):
            raise Stop(
                f"protected branch is not safely behind base "
                f"branch={branch_name} head={existing_head} base={base}"
            )
    root = protected_worktree_root(repo)
    branch_key = hashlib.sha256(branch_name.encode("utf-8")).hexdigest()[:20]
    wanted = root / f"authority-{branch_key}"
    matches = [row for row in worktrees(repo)
               if row.get("branch") == f"refs/heads/{branch_name}"]
    if len(matches) > 1:
        raise Stop(f"protected builder branch has multiple worktrees: {branch_name}")
    if matches:
        actual = Path(matches[0]["worktree"]).resolve()
        if actual != wanted.resolve():
            raise Stop(
                f"builder authority branch is outside protected root: {actual}"
            )
    else:
        if wanted.exists() or wanted.is_symlink():
            raise Stop(f"protected builder worktree path already exists: {wanted}")
        if branch_exists:
            closed_worktree_git(repo, "worktree", "add", str(wanted), branch_name, raw_checkout=True)
        else:
            closed_worktree_git(
                repo, "worktree", "add", "-b", branch_name,
                str(wanted), base, raw_checkout=True,
            )
    head = sha(wanted)
    if head != base:
        if closed_worktree_git(
                repo, "merge-base", "--is-ancestor", head, base,
                check=False).rc != 0:
            raise Stop(
                f"protected branch is not safely behind base "
                f"branch={branch_name} head={head} base={base}"
            )
        closed_worktree_git(wanted, "merge", "--ff-only", base, raw_checkout=True)
    assert_worktree_binding(repo, wanted, base, branch_name)
    if not exact_worktree_clean(wanted):
        raise Stop(f"protected builder worktree is dirty: {wanted}")
    return wanted
def protected_detached_worktree(repo: Path, name: str, commit_sha: str) -> Path:
    root = protected_worktree_root(repo)
    token = hashlib.sha256(name.encode("utf-8")).hexdigest()[:20]
    path = root / f"gate-{commit_sha[:12]}-{token}"
    if path.exists() or path.is_symlink():
        raise Stop(f"protected gate worktree path already exists: {path}")
    worktrees(repo)
    closed_worktree_git(
        repo, "worktree", "add", "--detach", str(path), commit_sha, raw_checkout=True
    )
    assert_worktree_binding(repo, path, commit_sha, None)
    if not exact_worktree_clean(path):
        raise Stop(f"new protected gate worktree is dirty: {path}")
    return path
def _single_link_object_tree(path: Path, authority: Path, relative: Path | None = None) -> bool:
    if relative is None:
        relative = Path(".")
    try:
        root = path.lstat()
        if (path.is_symlink() or not stat.S_ISDIR(root.st_mode)
                or root.st_uid != os.getuid()):
            return False
        children = list(path.iterdir())
    except OSError:
        return False
    for child in children:
        try:
            opened = child.lstat()
        except OSError:
            return False
        if child.is_symlink():
            return False
        if stat.S_ISDIR(opened.st_mode):
            if not _single_link_object_tree(
                    child, authority, relative / child.name):
                return False
        elif (not stat.S_ISREG(opened.st_mode)
              or opened.st_nlink != 1
              or child.name.endswith(".promisor")):
            return False
        else:
            authoritative = authority / relative / child.name
            try:
                authority_opened = authoritative.lstat()
            except FileNotFoundError:
                continue
            except OSError:
                return False
            if ((opened.st_dev, opened.st_ino)
                    == (authority_opened.st_dev, authority_opened.st_ino)):
                return False
    return True
def _single_link_owned_file(path: Path, limit: int) -> bool:
    try:
        opened = path.lstat()
        if (path.is_symlink() or not stat.S_ISREG(opened.st_mode)
                or opened.st_uid != os.getuid() or opened.st_nlink != 1
                or opened.st_size < 0 or opened.st_size > limit):
            return False
        with path.open("rb") as handle:
            bound = os.fstat(handle.fileno())
            final = path.lstat()
        return ((opened.st_dev, opened.st_ino, opened.st_mode,
                 opened.st_uid, opened.st_nlink, opened.st_size)
                == (bound.st_dev, bound.st_ino, bound.st_mode, bound.st_uid,
                    bound.st_nlink, bound.st_size)
                == (final.st_dev, final.st_ino, final.st_mode, final.st_uid,
                    final.st_nlink, final.st_size) and not path.is_symlink())
    except OSError:
        return False
def _single_link_checkout_tree(path: Path, repo: Path, expected: str, *, root: bool = True,
                               budget: list[Any] | None = None, prefix: str = "") -> bool:
    if budget is None:
        budget = [4096, 64 * 1024 * 1024, {}]
    try:
        opened = path.lstat()
        if (path.is_symlink() or not stat.S_ISDIR(opened.st_mode)
                or opened.st_uid != os.getuid()):
            return False
        children = list(path.iterdir())
    except OSError:
        return False
    budget[0] -= len(children)
    if budget[0] < 0:
        return False
    for child in children:
        if root and child.name == ".git":
            continue
        rel = f"{prefix}/{child.name}".lstrip("/")
        try:
            item = child.lstat()
        except OSError:
            return False
        if child.is_symlink() or item.st_uid != os.getuid():
            return False
        if stat.S_ISDIR(item.st_mode):
            budget[2][rel] = ("040000", "")
            if not _single_link_checkout_tree(
                    child, repo, expected, root=False, budget=budget, prefix=rel):
                return False
        elif (stat.S_ISREG(item.st_mode) and item.st_nlink == 1
              and stat.S_IMODE(item.st_mode) in {0o644, 0o755}):
            budget[1] -= item.st_size
            if item.st_size < 0 or budget[1] < 0:
                return False
            oid = closed_worktree_git(
                repo, "hash-object", "--no-filters", "--", str(child)
            ).out.strip()
            final = child.lstat()
            identity = lambda value: (value.st_dev, value.st_ino, value.st_mode,
                                      value.st_uid, value.st_nlink, value.st_size,
                                      value.st_mtime_ns, value.st_ctime_ns)
            if (identity(item) != identity(final)
                    or re.fullmatch(r"[0-9a-f]{40}", oid) is None):
                return False
            budget[2][rel] = (f"{0o100000 | stat.S_IMODE(item.st_mode):o}", oid)
        else:
            return False
    if not root:
        return True
    wanted = {}
    for record in closed_worktree_git(
            repo, "ls-tree", "-rz", "--full-tree", expected).out.split("\0"):
        if not record:
            continue
        meta, separator, rel = record.partition("\t")
        parts = meta.split()
        if (not separator or len(parts) != 3 or parts[1] != "blob"
                or parts[0] not in {"100644", "100755"}
                or re.fullmatch(r"[0-9a-f]{40}", parts[2]) is None
                or rel in wanted):
            return False
        wanted[rel] = (parts[0], parts[2])
    wanted.update({"/".join(rel.split("/")[:index]): ("040000", "")
                   for rel in tuple(wanted) for index in range(1, len(rel.split("/")))})
    return budget[2] == wanted
def _metadata_file_contains_bytes(path: Path, needle: bytes) -> bool:
    try:
        opened = path.lstat()
        if (path.is_symlink() or not stat.S_ISREG(opened.st_mode)
                or opened.st_size < 0 or opened.st_size > 1024 * 1024):
            return True
        with path.open("rb") as handle:
            bound = os.fstat(handle.fileno())
            raw = _read_stable_opened(
                handle.fileno(), 1024 * 1024, "Git control metadata")
            final = path.lstat()
        identity = lambda item: (item.st_dev, item.st_ino, item.st_mode,
                                 item.st_size, item.st_mtime_ns, item.st_ctime_ns)
        if identity(opened) != identity(bound) or identity(bound) != identity(final):
            return True
    except (OSError, Stop):
        return True
    return path.is_symlink() or needle in raw
def _metadata_tree_empty(path: Path, budget: list[int] | None = None) -> bool:
    if budget is None:
        budget = [128, 4 * 1024 * 1024]
    try:
        root = path.lstat()
        if (path.is_symlink() or not stat.S_ISDIR(root.st_mode)):
            return False
        children = list(path.iterdir())
    except OSError:
        return False
    budget[0] -= len(children)
    if budget[0] < 0:
        return False
    for child in children:
        try:
            opened = child.lstat()
        except OSError:
            return False
        if child.is_symlink():
            return False
        if stat.S_ISDIR(opened.st_mode):
            if not _metadata_tree_empty(child, budget):
                return False
        else:
            return False
    return True
def managed_provider_root(wt_root: Path) -> Path:
    wt_root.mkdir(parents=True, mode=0o700, exist_ok=True)
    try:
        opened = wt_root.lstat()
        resolved = wt_root.resolve(strict=True)
    except OSError as exc:
        raise Stop(f"managed provider root is unavailable: {wt_root}") from exc
    if (not wt_root.is_absolute() or wt_root.is_symlink()
            or resolved != wt_root or not stat.S_ISDIR(opened.st_mode)
            or opened.st_uid != os.getuid() or opened.st_mode & 0o022):
        raise Stop(f"managed provider root has unsafe identity: {wt_root}")
    return resolved
def provider_scratch_root(repo: Path, wt_root: Path) -> Path:
    managed = managed_provider_root(wt_root)
    child = managed / "isolated-provider-scratch"
    try:
        opened = child.lstat()
    except FileNotFoundError:
        child.mkdir(mode=0o700)
        opened = child.lstat()
    except OSError as exc:
        raise Stop(f"provider scratch root is unavailable: {child}") from exc
    if (child.is_symlink() or not stat.S_ISDIR(opened.st_mode)
            or opened.st_uid != os.getuid()
            or stat.S_IMODE(opened.st_mode) != 0o700):
        raise Stop(f"provider scratch root has unsafe identity: {child}")
    root = child.resolve(strict=True)
    if root != child or root.parent != managed:
        raise Stop(f"provider scratch root escaped managed root: {child}")
    protected = (
        repo.resolve(), REPOSITORY_ROOT.resolve(), common_git_dir(repo),
        protected_worktree_root(repo), protected_materialization_root(repo),
    )
    for authority in protected:
        if (root == authority or root in authority.parents
                or authority in root.parents):
            raise Stop(
                f"provider scratch root overlaps controller authority: {root}"
            )
    return root
def provider_attempt_root(repo: Path, wt: Path, wt_root: Path) -> Path:
    authority_git = common_git_dir(repo)
    root = managed_provider_root(wt_root)
    protected = (
        REPOSITORY_ROOT.resolve(), repo.resolve(), authority_git,
    )
    resolved_wt = wt.resolve(strict=True)
    independent = common_git_dir(wt) != authority_git
    expected_parent = (provider_scratch_root(repo, root)
                       if independent else root)
    if (root == resolved_wt or root not in resolved_wt.parents
            or resolved_wt.parent != expected_parent
            or any(root == item or root in item.parents
                   or item in root.parents for item in protected)):
        raise Stop(f"provider attempt root is not safely separated: {root}")
    return root
def provider_execution_root(wt_root: Path) -> Path:
    managed = managed_provider_root(wt_root)
    root = managed / "nortropic-controller-execution"
    root.mkdir(mode=0o700, exist_ok=True)
    opened = root.lstat()
    resolved = root.resolve(strict=True)
    if (root.is_symlink() or resolved != root or resolved.parent != managed
            or not stat.S_ISDIR(opened.st_mode)
            or opened.st_uid != os.getuid()
            or stat.S_IMODE(opened.st_mode) != 0o700):
        raise Stop(f"provider execution root has unsafe identity: {root}")
    return resolved
def _isolated_scratch_config(repo: Path) -> dict[str, str]:
    raw = closed_worktree_git(repo, "config", "--local", "--null", "--list").out
    values: dict[str, str] = {}
    for record in raw.split("\0"):
        if not record:
            continue
        key, separator, value = record.partition("\n")
        if not separator or not key or key in values:
            raise Stop("isolated provider scratch config is ambiguous")
        values[key] = value
    allowed = {
        "core.repositoryformatversion", "core.filemode", "core.bare",
        "core.logallrefupdates", "core.ignorecase", "core.precomposeunicode",
    }
    if not set(values) <= allowed:
        raise Stop(
            f"isolated provider scratch retained config authority: "
            f"{sorted(set(values) - allowed)}"
        )
    required = {
        "core.repositoryformatversion": "0",
        "core.bare": "false",
        "core.logallrefupdates": "false",
    }
    if any(values.get(key) != value for key, value in required.items()):
        raise Stop("isolated provider scratch config closure mismatch")
    for key in ("core.filemode", "core.ignorecase", "core.precomposeunicode"):
        if key in values and values[key] not in {"true", "false"}:
            raise Stop(f"isolated provider scratch config value mismatch: {key}")
    return values
def exact_scratch_object_closure(scratch: Path, authority: Path, commit_sha: str) -> bool:
    def object_ids(repo: Path, *args: str) -> set[str]:
        rows = closed_worktree_git(repo, *args).out.splitlines()
        if (not rows or len(rows) > 200000 or len(rows) != len(set(rows))
                or any(re.fullmatch(r"[0-9a-f]{40}", row) is None
                       for row in rows)):
            raise Stop("isolated provider object inventory is malformed")
        return set(rows)
    expected = object_ids(authority, "rev-list", "--objects", "--no-object-names", commit_sha)
    reachable = object_ids(scratch, "rev-list", "--objects", "--no-object-names", commit_sha)
    stored = object_ids(scratch, "cat-file", "--batch-all-objects", "--batch-check=%(objectname)")
    return stored == reachable == expected
def isolated_provider_scratch(repo: Path, wt_root: Path, task_id: str, role: str, commit_sha: str) -> Path:
    root = provider_scratch_root(repo, wt_root)
    scratch = Path(tempfile.mkdtemp(
        prefix=f"isolated-{role.lower()}-", dir=root)).resolve()
    if scratch.parent != root:
        raise Stop("isolated provider scratch escaped its attempt root")
    scratch_opened = scratch.lstat()
    if (scratch.is_symlink() or not stat.S_ISDIR(scratch_opened.st_mode)
            or scratch_opened.st_uid != os.getuid()
            or stat.S_IMODE(scratch_opened.st_mode) != 0o700):
        raise Stop("isolated provider scratch root identity mismatch")
    closed_worktree_git(scratch, "init", "-q")
    scratch_dot_git = scratch / ".git"
    scratch_dot_git.chmod(0o700)
    dot_git_opened = scratch_dot_git.lstat()
    if (scratch_dot_git.is_symlink()
            or not stat.S_ISDIR(dot_git_opened.st_mode)
            or dot_git_opened.st_uid != os.getuid()
            or stat.S_IMODE(dot_git_opened.st_mode) != 0o700):
        raise Stop("isolated provider .git identity mismatch")
    closed_worktree_git(scratch, "config", "--local", "core.logAllRefUpdates", "false")
    _isolated_scratch_config(scratch)
    bootstrap_ref = "refs/nortropic/bootstrap"
    closed_worktree_git(scratch, "-c", "protocol.file.allow=always", "fetch",
                        "--no-tags", "--no-recurse-submodules", "--no-write-fetch-head",
                        str(repo.resolve()), f"{commit_sha}:{bootstrap_ref}")
    closed_worktree_git(scratch, "switch", "--detach", commit_sha, raw_checkout=True)
    closed_worktree_git(scratch, "update-ref", "-d", bootstrap_ref)
    scratch_git = scratch_dot_git
    authority_git = common_git_dir(repo)
    scratch_objects = scratch_git / "objects"
    try:
        objects_real = scratch_objects.resolve(strict=True)
    except OSError as exc:
        raise Stop("isolated provider object root is unavailable") from exc
    if (objects_real != scratch_objects
            or scratch_objects.parent != scratch_git
            or not _single_link_object_tree(
                scratch_objects, authority_git / "objects")
            or not _single_link_owned_file(scratch_git / "index", 64 * 1024 * 1024)
            or not _single_link_owned_file(scratch_git / "config", 1024 * 1024)
            or not _single_link_checkout_tree(scratch, repo, commit_sha)):
        raise Stop("isolated provider repository contains an aliased byte")
    if (scratch_git != scratch_dot_git.resolve()
            or common_git_dir(scratch) != scratch_git
            or scratch_git == authority_git
            or authority_git in scratch_git.parents
            or scratch_git in authority_git.parents):
        raise Stop("isolated provider scratch shares authoritative Git control")
    alternates = scratch_git / "objects/info/alternates"
    http_alternates = scratch_git / "objects/info/http-alternates"
    shallow = scratch_git / "shallow"
    if any(path.exists() or path.is_symlink()
           for path in (alternates, http_alternates, shallow)):
        raise Stop("isolated provider scratch retained an ODB alternate")
    if closed_worktree_git(scratch, "for-each-ref", "--format=%(refname)").out.strip():
        raise Stop("isolated provider scratch retained a ref")
    _isolated_scratch_config(scratch)
    fetch_head = scratch_git / "FETCH_HEAD"
    logs = scratch_git / "logs"
    refs = scratch_git / "refs"
    packed_refs = scratch_git / "packed-refs"
    source_path = str(repo.resolve()).encode("utf-8")
    metadata_leak = _metadata_file_contains_bytes(scratch_git / "config", source_path)
    if (closed_worktree_git(scratch, "remote").out.strip()
            or fetch_head.exists() or fetch_head.is_symlink()
            or logs.exists() or logs.is_symlink()
            or packed_refs.exists() or packed_refs.is_symlink()
            or not _metadata_tree_empty(refs)
            or metadata_leak):
        raise Stop("isolated provider scratch persisted source authority")
    assert_raw_git_authority(scratch, standalone=True)
    fsck = closed_worktree_git(scratch, "fsck", "--full", "--strict", check=False)
    if (branch(scratch) or sha(scratch) != commit_sha
            or not exact_worktree_clean(scratch)
            or sha(scratch, f"{commit_sha}^{{tree}}")
                != sha(repo, f"{commit_sha}^{{tree}}")
            or not _single_link_object_tree(
                scratch_git / "objects", authority_git / "objects")
            or not exact_scratch_object_closure(scratch, repo, commit_sha)
            or fsck.rc != 0
            or any(Path(row.get("worktree", "")).resolve() == scratch
                   for row in worktrees(repo))):
        raise Stop("isolated provider scratch identity is not closed")
    journal(repo, "PROVIDER_SCRATCH_ISOLATED", task=task_id, role=role,
            scratch=str(scratch), candidate=commit_sha)
    return scratch
def quarantine_provider_scratch(repo: Path, scratch: Path, task_id: str, role: str, expected_head: str) -> None:
    journal(repo, "PROVIDER_SCRATCH_QUARANTINED", task=task_id, role=role,
            scratch=str(scratch), expected=expected_head, observed="UNTRUSTED_RESIDUE_NOT_READ")
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


def _provider_snapshot(repo: Path, execution_root: Path | None = None) -> tuple[Path, Path, str, Path, str]:
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

    root = Path(tempfile.mkdtemp(
        prefix="nortropic-provider-", dir=execution_root
    ))
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


def _remove_result_tree(root: Path) -> bool:
    if root.is_symlink():
        root.unlink()
        return False
    primary_failures = 0
    for _cleanup_attempt in range(3):
        try:
            shutil.rmtree(root)
            return False
        except FileNotFoundError:
            return False
        except OSError:
            primary_failures += 1
    for child in root.iterdir():
        opened = child.lstat()
        if stat.S_ISDIR(opened.st_mode) and not child.is_symlink():
            _remove_result_tree(child)
        else:
            child.unlink()
    root.rmdir()
    return primary_failures == 3
def _cleanup_result_staging(root: Path, identity: tuple[int, int]) -> tuple[list[Path], bool]:
    candidates: list[Path] = []
    if root.exists() or root.is_symlink():
        try:
            root_now = root.lstat()
            if ((root_now.st_dev, root_now.st_ino) == identity
                    and stat.S_ISDIR(root_now.st_mode) and not root.is_symlink()):
                candidates.append(root)
        except OSError:
            pass
    try:
        siblings = list(root.parent.iterdir())
    except OSError:
        siblings = []
    for candidate in siblings:
        if candidate == root:
            continue
        try:
            opened = candidate.lstat()
        except OSError:
            continue
        if ((opened.st_dev, opened.st_ino) == identity
                and stat.S_ISDIR(opened.st_mode) and not candidate.is_symlink()):
            candidates.append(candidate)
    degraded = False
    for candidate in candidates:
        degraded = _remove_result_tree(candidate) or degraded
    residue = [candidate for candidate in candidates
               if candidate.exists() or candidate.is_symlink()]
    return residue, degraded
def _retire_bound_staging(staging_dir_fd, root, identity):
    try:
        st = root.lstat()
        path_bound = ((st.st_dev, st.st_ino) == identity
                      and stat.S_ISDIR(st.st_mode) and not root.is_symlink())
    except OSError:
        path_bound = False
    if path_bound:
        for _cleanup_attempt in range(3):
            try:
                shutil.rmtree(root)
                return True
            except FileNotFoundError:
                return True
            except OSError:
                continue
        return False
    try:
        os.unlink("result.json", dir_fd=staging_dir_fd)
    except FileNotFoundError:
        pass
    try:
        moved = Path(fcntl.fcntl(staging_dir_fd, fcntl.F_GETPATH,
                                 b"\0" * 1024).split(b"\0", 1)[0].decode())
        moved_now = moved.lstat()
        if ((moved_now.st_dev, moved_now.st_ino) == identity
                and stat.S_ISDIR(moved_now.st_mode)):
            shutil.rmtree(moved)
    except (OSError, ValueError):
        pass
    return False
def run_codex(repo: Path, wt: Path, role: str, prompt: str, wt_root: Path | None = None) -> dict[str, Any]:
    global _LAST_AGENT_CONTEXT
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
    attempt_root = None
    execution_root = None
    if wt_root is not None:
        attempt_root = provider_attempt_root(repo, wt, wt_root)
        execution_root = provider_execution_root(attempt_root)
    (snapshot_root, snapshot, snapshot_digest,
     host_snapshot, host_snapshot_digest) = _provider_snapshot(
         repo, execution_root
     )
    result_root: Path | None = None
    result_root_identity: tuple[int, int] | None = None
    sink_fd = -1
    staging_dir_fd = -1
    try:
        python_snapshot, python_digest = _python_snapshot(snapshot_root)
        result_root = Path(tempfile.mkdtemp(
            prefix="nortropic-result-", dir=execution_root
        ))
        root_stat = result_root.lstat()
        result_root_identity = (root_stat.st_dev, root_stat.st_ino)
        live_root = repo.resolve()
        live_git = common_git_dir(repo).resolve()
        result_root_real = result_root.resolve()
        if (result_root.is_symlink() or root_stat.st_uid != os.getuid()
                or stat.S_IMODE(root_stat.st_mode) != 0o700
                or (execution_root is not None
                    and result_root_real.parent != execution_root)
                or result_root_real == live_root or live_root in result_root_real.parents
                or result_root_real == live_git or live_git in result_root_real.parents):
            raise Stop("private result staging root has unsafe identity")
        staging_dir_fd = os.open(
            result_root,
            os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0))
        staging_dir_identity = os.fstat(staging_dir_fd)
        if (not stat.S_ISDIR(staging_dir_identity.st_mode)
                or (staging_dir_identity.st_dev, staging_dir_identity.st_ino)
                    != result_root_identity):
            raise Stop("private result staging directory identity unbound")
        result_sink = result_root / "result.json"
        create_fd = os.open(
            result_sink,
            os.O_WRONLY | os.O_CREAT | os.O_EXCL
            | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0),
            0o600,
        )
        try:
            os.fsync(create_fd)
            sink_fd = os.open(
                result_sink,
                os.O_RDONLY | getattr(os, "O_CLOEXEC", 0)
                | getattr(os, "O_NOFOLLOW", 0),
            )
        finally:
            os.close(create_fd)
        sink_identity = os.fstat(sink_fd)
        if (not stat.S_ISREG(sink_identity.st_mode) or sink_identity.st_nlink != 1
                or stat.S_IMODE(sink_identity.st_mode) != 0o600
                or sorted(path.name for path in result_root.iterdir()) != [result_sink.name]):
            raise Stop("private result sink has unsafe identity")
        invocation_id = os.urandom(16).hex()
        run_id = os.urandom(16).hex()
        if invocation_id == run_id:
            raise Stop("controller result bindings collided")
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
            "-o", str(result_sink),
            full_prompt,
        ]
        envelope = jr / "provider-envelope.json"
        envelope.write_text(json.dumps({"task_id": prompt, "role": role}), encoding="utf-8")
        launcher = Path(__file__).resolve().parents[1] / "controller/launch/cli"
        argv = [str(python_snapshot), "-I", "-S", str(launcher),
                "run", str(wt), str(envelope), str(CODEX_RUN_TIMEOUT_SECONDS),
                "--", *provider_argv]
        env = {key: value for key, value in os.environ.items()
               if not key.startswith(GIT_CONTROL_PREFIX)
               and not key.startswith("DYLD_")
               and key not in {
                   "LD_PRELOAD", "LD_LIBRARY_PATH", "__PYVENV_LAUNCHER__",
                   ATTEMPT_ROOT_ENV,
               }}
        env["NORTROPIC_TRUST_ROOT"] = str(snapshot_root)
        if attempt_root is not None:
            env[ATTEMPT_ROOT_ENV] = str(attempt_root)
        env["NORTROPIC_STAGING_ROOT"] = str(result_root)
        env["NORTROPIC_RESULT_SINK"] = str(result_sink)
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
        if rc != 0:
            raise Stop(f"Codex role {role} failed rc={rc}; events={events}")
        opened_identity = os.fstat(sink_fd)
        substituted = False
        try:
            path_identity = result_sink.lstat()
            if (result_sink.is_symlink() or not stat.S_ISREG(path_identity.st_mode)
                    or path_identity.st_nlink != 1
                    or (path_identity.st_dev, path_identity.st_ino)
                        != (opened_identity.st_dev, opened_identity.st_ino)
                    or sorted(path.name for path in result_root.iterdir())
                        != [result_sink.name]):
                raise Stop("provider result transport identity changed")
        except FileNotFoundError:
            substituted = True
        for _cleanup_attempt in range(3):
            if not snapshot_root.exists():
                break
            try:
                snapshot_root.chmod(0o700)
            except OSError:
                pass
            try:
                shutil.rmtree(snapshot_root)
            except OSError:
                pass
            else:
                break
        if snapshot_root.exists():
            raise Stop("private provider execution family cleanup incomplete")
        retired = _retire_bound_staging(
            staging_dir_fd, result_root, result_root_identity)
        if substituted or not retired:
            raise Stop("private result staging cleanup incomplete: staging substituted")
        handoff_identity = os.fstat(sink_fd)
        if (not stat.S_ISREG(handoff_identity.st_mode)
                or handoff_identity.st_nlink != 0
                or (handoff_identity.st_dev, handoff_identity.st_ino)
                    != (opened_identity.st_dev, opened_identity.st_ino)):
            raise Stop("retained result sink lost its handoff identity")
        _LAST_AGENT_CONTEXT = (thread_id, events, result)
        accepted = consume_private_result(sink_fd, result, invocation_id, run_id, role)
        return accepted
    finally:
        cleanup_errors: list[OSError] = []
        for _fd in (staging_dir_fd, sink_fd):
            if _fd >= 0:
                try:
                    os.close(_fd)
                except OSError:
                    pass
        result_residue: list[Path] = []
        result_cleanup_degraded = False
        if result_root is not None and result_root_identity is not None:
            try:
                result_residue, result_cleanup_degraded = _cleanup_result_staging(
                    result_root, result_root_identity)
            except OSError as exc:
                cleanup_errors.append(exc)
                result_residue = [result_root]
        elif result_root is not None:
            try:
                result_cleanup_degraded = _remove_result_tree(result_root)
            except OSError as exc:
                cleanup_errors.append(exc)
                result_residue = [result_root]
        for _cleanup_attempt in range(3):
            if not snapshot_root.exists():
                break
            try:
                os.chmod(snapshot_root, 0o700)
            except OSError as exc:
                cleanup_errors.append(exc)
            try:
                shutil.rmtree(snapshot_root)
            except OSError as exc:
                cleanup_errors.append(exc)
            else:
                break
        cleanup_incomplete = (
            bool(result_residue) or snapshot_root.exists() or result_cleanup_degraded
        )
        if cleanup_incomplete:
            cause = cleanup_errors[-1] if cleanup_errors else None
            raise Stop("private execution staging cleanup incomplete") from cause
def _run_codex_agent(repo: Path, wt: Path, role: str, prompt: str, wt_root: Path) -> AgentRun:
    accepted = run_codex(repo, wt, role, prompt, wt_root)
    context = _LAST_AGENT_CONTEXT
    if (context is None or not isinstance(accepted, dict)
            or set(accepted) != {"schema_version", "invocation_id", "run_id", "role",
                                 "result_sha256", "report"}
            or not isinstance(accepted.get("report"), dict)):
        raise Stop("structured result kernel returned an invalid controller envelope")
    if (role not in {"BUILDER", "TEST_AUTHOR"}
            and accepted["report"].get("candidate_delta") is not None):
        raise Stop(f"report-only role returned candidate_delta: {role}")
    thread_id, events, result = context
    report = accepted["report"]
    journal(repo, "AGENT_END", role=role, outcome=report.get("outcome"),
            thread_id=thread_id or "OVERIFIERAT")
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
                         signal: dict[str, Any], wt_root: Path,
                         context: str = "") -> dict[str, Any]:
    current = sha(wt)
    arun = isolated_role_run(
        repo, wt_root, wt, task_id, branch(wt) or None, "ARCHITECT",
        current, architect_prompt(stage, task_id, signal, context), stage,
    )
    return accept_architect_resolution(repo, stage, task_id, arun.report)
def accept_architect_resolution(repo: Path, stage: str, task_id: str, report: dict[str, Any]) -> dict[str, Any]:
    r = report
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
                                     stage: str, task_id: str, wt_root: Path,
                                     context: str = "") -> AgentRun:
    return isolated_role_run(
        repo, wt_root, wt, task_id, branch(wt) or None, role, sha(wt),
        prompt, stage, context,
    )

def object_changed_files(repo: Path, base: str, candidate: str) -> list[str]:
    raw = closed_worktree_git(repo, "diff", "--name-only", "--no-renames",
                              "--no-ext-diff", "-z", base, candidate, "--").out
    try:
        files = [canonical_path(value) for value in raw.split("\0") if value]
    except AuthorityError as exc:
        raise Stop(f"immutable diff path is unsafe: {exc}") from exc
    if len(files) != len(set(files)):
        raise Stop("immutable diff path set is ambiguous")
    return sorted(files)
def assert_materialized_cumulative_scope(repo: Path, task_id: str, task_base: str,
                                         candidate: str, allowed_override: Iterable[str] | None = None,
                                         limits_override: tuple[int, int] | None = None) -> list[str]:
    assert_raw_git_authority(repo)
    if (re.fullmatch(r"[0-9a-f]{40}", task_base) is None
            or re.fullmatch(r"[0-9a-f]{40}", candidate) is None
            or sha(repo, task_base) != task_base
            or sha(repo, candidate) != candidate
            or closed_worktree_git(
                repo, "merge-base", "--is-ancestor", task_base, candidate,
                check=False,
            ).rc != 0):
        raise Stop(f"materialized cumulative lineage mismatch task={task_id}")
    files = object_changed_files(repo, task_base, candidate)
    task = task_obj(repo, task_id) if allowed_override is None else None
    allowed = (task.get("allowed_write") or load_spec(repo).get(
        "defaults", {}).get("allowed_write", [])
        if task is not None else allowed_override)
    outside = [path for path in files if not path_allowed(path, allowed)]
    if outside:
        raise Stop(
            f"ALLOWED_WRITE_VIOLATION task={task_id}: {outside}"
        )
    max_files, max_lines = (task_limits(repo, task) if task is not None
                            else limits_override or (0, 0))
    if len(files) > max_files:
        raise Stop(
            f"cumulative file budget exceeded: {len(files)} > {max_files}"
        )
    numstat = closed_worktree_git(
        repo, "-c", "core.attributesFile=/dev/stdin", "diff", "--text", "--no-textconv",
        "--no-ext-diff", "--no-renames", "--no-relative", "--numstat", "-z", "--diff-algorithm=myers",
        "--no-indent-heuristic", task_base, candidate, "--", raw_attributes=True,
    ).out
    numstat_paths: list[str] = []
    additions = 0
    for record in numstat.split("\0"):
        if not record:
            continue
        added, separator, tail = record.partition("\t")
        deleted, second_separator, path = tail.partition("\t")
        if (not separator or not second_separator or not path
                or not added.isdigit() or not deleted.isdigit()):
            raise Stop(f"materialized cumulative numstat malformed task={task_id}")
        try:
            numstat_paths.append(canonical_path(path))
        except AuthorityError as exc:
            raise Stop(
                f"materialized cumulative numstat path is unsafe: {exc}"
            ) from exc
        additions += int(added)
    numstat_paths.sort()
    if numstat_paths != files:
        raise Stop(f"materialized cumulative file accounting mismatch task={task_id}")
    if additions > max_lines:
        raise Stop(
            f"cumulative added-line budget exceeded: {additions} > {max_lines}"
        )
    closed_worktree_git(
        repo, "diff", "--check", task_base, candidate, "--"
    )
    return files
def adopt_materialized_candidate(repo: Path, wt: Path, task_id: str,
                                 branch_name: str, task_base: str,
                                 parent: str, candidate: str,
                                 candidate_tree: str,
                                 files: list[str],
                                 allowed_override: Iterable[str] | None = None,
                                 limits_override: tuple[int, int] | None = None) -> None:
    assert_raw_git_authority(repo)
    assert_worktree_binding(repo, wt, parent, branch_name)
    if not exact_worktree_clean(wt):
        raise Stop(f"protected adoption prestate is dirty task={task_id}")
    lineage = closed_worktree_git(
        wt, "rev-list", "--parents", "-n", "1", candidate
    ).out.split()
    if lineage != [candidate, parent]:
        raise Stop(
            f"materialized candidate lineage mismatch task={task_id} "
            f"lineage={lineage}"
        )
    if sha(wt, f"{candidate}^{{tree}}") != candidate_tree:
        raise Stop(f"materialized candidate tree mismatch task={task_id}")
    candidate_files = object_changed_files(wt, parent, candidate)
    if candidate_files != sorted(files):
        raise Stop(
            f"materialized candidate path mismatch task={task_id} "
            f"expected={sorted(files)} actual={candidate_files}"
        )
    assert_materialized_cumulative_scope(
        repo, task_id, task_base, candidate,
        allowed_override, limits_override,
    )
    closed_worktree_git(wt, "merge", "--ff-only", candidate, raw_checkout=True)
    assert_worktree_binding(repo, wt, candidate, branch_name)
    if not exact_worktree_clean(wt):
        raise Stop(f"materialized candidate adoption failed task={task_id}")
    if sha(wt, f"{candidate}^{{tree}}") != candidate_tree:
        raise Stop(
            f"materialized candidate tree changed during adoption task={task_id}"
        )
    adopted_files = object_changed_files(wt, parent, candidate)
    if adopted_files != candidate_files:
        raise Stop(
            f"materialized candidate path mismatch task={task_id} "
            f"expected={candidate_files} actual={adopted_files}"
        )
    if allowed_override is None:
        assert_builder_scope(wt, task_id, task_base)
    else:
        assert_materialized_cumulative_scope(
            repo, task_id, task_base, candidate,
            allowed_override, limits_override,
        )


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


def remediation_prompt(role: str, task_id: str | None,
                       findings: list[dict[str, str]], base_sha: str,
                       *, current_candidate: str | None = None) -> str:
    rendered = json.dumps(findings, ensure_ascii=False, indent=2)
    if role == "TEST_AUTHOR":
        return f"""
Use `$nortropic-test-author` again on the existing candidate branch. The independent gate reviewer confirmed these blockers:
{rendered}

BASE_SHA={base_sha}
Owner authority remains `{OWNER_DECISION_PATH}`. Make the smallest gate/spec correction inside the same owner-authorized edit surface. Do not implement production code and do not rewrite history. Re-run decisive RED/adversarial evidence and return the structured report.
"""
    assert task_id is not None
    if current_candidate is None:
        raise Stop("builder remediation requires an exact current candidate")
    return f"""
Use `$nortropic-builder` again for TASK={task_id}. The independent reviewer confirmed these blockers against the latest immutable candidate:
{rendered}

TASK_BASE_SHA={base_sha}
CURRENT_CANDIDATE_SHA={current_candidate}
The detached scratch is an isolated, non-authoritative checkout of CURRENT_CANDIDATE_SHA. Return one canonical candidate_delta whose base_commit is exactly CURRENT_CANDIDATE_SHA; never stage, commit, or expose scratch Git state as authority.
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
    assert_raw_git_authority(repo)
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
    assert_raw_git_authority(repo)
    if not clean(wt) or sha(wt) != candidate_sha:
        raise Stop("publication candidate identity/cleanliness mismatch")
    fetch_origin(wt, "main")
    if sha(wt, "refs/remotes/origin/main") != base_sha:
        raise Stop("REMOTE_MAIN_CHANGED before push")
    closed_worktree_git(wt, "push", "--no-verify", "--no-push-option",
                        "--no-recurse-submodules", "--no-signed", "--no-follow-tags", canonical_origin(wt),
                        f"refs/heads/{branch_name}:refs/heads/{branch_name}")

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
    assert_raw_git_authority(repo)
    repository_meta = json.loads(run(
        ["gh", "repo", "view", "--json", "nameWithOwner"], cwd=wt).out)
    if repository_meta.get("nameWithOwner") != EXPECTED_REPO:
        raise Stop(f"repository identity mismatch: {repository_meta}")
    fetch_origin(wt, "main")
    if sha(wt, "refs/remotes/origin/main") != base_sha:
        raise Stop("REMOTE_MAIN_CHANGED before merge")
    if not clean(wt) or sha(wt) != candidate_sha:
        raise Stop("candidate changed before merge")
    candidate_tree = sha(wt, f"{candidate_sha}^{{tree}}")
    remote = closed_worktree_git(
        wt, "ls-remote", canonical_origin(wt), f"refs/heads/{branch_name}").out.split()
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
    assert_raw_git_authority(repo)
    fetch_origin(wt, "main")
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
    fetch_origin(wt, "main")
    assert_raw_git_authority(repo)
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
    assert_raw_git_authority(repo)
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
    fetch_origin(repo, ROADMAP_PLAN_BRANCH)
    if git(repo, "cat-file", "-e", f"{ROADMAP_PLAN_SHA}^{{commit}}", check=False).rc != 0:
        raise Stop(f"frozen roadmap commit unavailable after fetch: {ROADMAP_PLAN_SHA}")
    for rel, expected_blob in ROADMAP_PLAN_BLOBS.items():
        actual = git(repo, "rev-parse", f"{ROADMAP_PLAN_SHA}:{rel}").out.strip()
        if actual != expected_blob:
            raise Stop(f"roadmap artifact identity mismatch path={rel} expected={expected_blob} actual={actual}")
    journal(repo, "ROADMAP_AUTHORITY", plan_sha=ROADMAP_PLAN_SHA, branch=ROADMAP_PLAN_BRANCH)


def ensure_substitution_authority(repo: Path) -> None:
    """Bind the owner-amended implementation shape to exact blobs on authoritative origin/main."""
    for rel, expected_blob in SUBSTITUTION_BLOBS.items():
        if git(repo, "cat-file", "-e", f"refs/remotes/origin/main:{rel}", check=False).rc != 0:
            raise Stop(f"substitution authority missing from origin/main: {rel}")
        actual = git(repo, "rev-parse", f"refs/remotes/origin/main:{rel}").out.strip()
        if actual != expected_blob:
            raise Stop(f"substitution authority identity mismatch path={rel} expected={expected_blob} actual={actual}")
    journal(
        repo,
        "SUBSTITUTION_AUTHORITY",
        contract=SUBSTITUTION_OWNER_PATH,
        contract_blob=SUBSTITUTION_BLOBS[SUBSTITUTION_OWNER_PATH],
        audit_blob=SUBSTITUTION_BLOBS[SUBSTITUTION_AUDIT_PATH],
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
    assert_raw_git_authority(repo)
    ensure_roadmap_plan(repo)
    ensure_substitution_authority(repo)
    base = origin_main(repo)
    assert_raw_git_authority(repo)
    br = f"owner/roadmap-{sl.code.lower()}-contract-{base[:12]}"
    wt = ensure_protected_builder_worktree(repo, br, base)
    agent = run_codex_resolving_architecture(repo, wt, "TEST_AUTHOR", roadmap_test_author_prompt(sl, base) + ("\n\nARCHITECT_REFREEZE_GUIDANCE:\n" + guidance if guidance else ""), f"{sl.code}_TEST_AUTHOR", sl.task_id, wt_root).report
    if agent.get("owner_decision_required") or agent.get("outcome") == "OWNER_DECISION_REQUIRED":
        raise Stop(f"architecture routing failure roadmap test-author slice={sl.code}: {agent.get('stop_reason')}")
    if agent.get("outcome") != "READY" or agent.get("frozen_gate_ready") is not True or agent.get("baseline_red_for_right_reason") is not True:
        raise Stop(f"roadmap test-author did not establish freeze-ready state slice={sl.code}: {agent}")
    owner_surface = roadmap_test_author_allowed(sl)
    owner_limits = task_limits(wt, task_obj_optional(wt, sl.task_id) or {})
    candidate = compose_owner_candidate(
        repo, wt, sl.task_id, br, base, base, agent,
        owner_surface, owner_limits, sl)
    seen: list[str] = []
    while True:
        rvwt = protected_detached_worktree(repo, f"gate-review-{sl.code.lower()}-{candidate[:12]}", candidate)
        try:
            review_run = run_codex_resolving_architecture(repo, rvwt, "GATE_REVIEWER", roadmap_gate_reviewer_prompt(sl, base, candidate), f"{sl.code}_GATE_REVIEW", sl.task_id, wt_root)
            review = review_run.report
            if not clean(rvwt):
                raise Stop(f"gate reviewer modified roadmap candidate slice={sl.code}")
        finally:
            if rvwt.exists() and exact_worktree_clean(rvwt):
                remove_protected_detached_worktree(repo, rvwt, candidate)
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
        rem = run_codex_resolving_architecture(repo, wt, "TEST_AUTHOR", roadmap_remediation_prompt(sl, blockers, base), f"{sl.code}_GATE_REMEDIATION", sl.task_id, wt_root).report
        if sha(wt) != candidate:
            raise Stop(f"roadmap test-author remediation changed Git history slice={sl.code}")
        if rem.get("owner_decision_required"):
            raise Stop(f"architecture routing failure roadmap remediation slice={sl.code}: {rem.get('stop_reason')}")
        if rem.get("outcome") != "READY":
            raise Stop(f"roadmap remediation not READY slice={sl.code}: {rem}")
        candidate = compose_owner_candidate(
            repo, wt, sl.task_id, br, base, candidate, rem,
            owner_surface, owner_limits, sl)
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
    assert_raw_git_authority(repo)
    ensure_roadmap_plan(repo)
    ensure_substitution_authority(repo)
    base = origin_main(repo)
    assert_raw_git_authority(repo)
    branch_name = f"owner/empirical-loop-gate-L-{base[:12]}"
    wt = ensure_protected_builder_worktree(repo, branch_name, base)
    arun = run_codex_resolving_architecture(
        repo, wt, "TEST_AUTHOR", empirical_gate_test_author_prompt(base, guidance),
        "EMPIRICAL_GATE_TEST_AUTHOR", "L", wt_root,
        context="Freeze the program-level L judge. Ordinary gate-design decisions are delegated."
    )
    r = arun.report
    if owner_need(r):
        raise Stop(f"architecture routing failure in empirical gate author: {r.get('stop_reason')}")
    if r.get("outcome") != "READY" or r.get("frozen_gate_ready") is not True or r.get("baseline_red_for_right_reason") is not True:
        raise Stop(f"empirical gate author did not establish freeze-ready RED state: {r}")
    owner_surface = EMPIRICAL_GATE_ALLOWED
    owner_limits = task_limits(wt, {})
    candidate = compose_owner_candidate(
        repo, wt, EMPIRICAL_STAGE, branch_name, base, base, r,
        owner_surface, owner_limits)

    seen: list[str] = []
    while True:
        rvwt = protected_detached_worktree(repo, f"gate-review-L-{candidate[:12]}", candidate)
        try:
            review_run = run_codex_resolving_architecture(
                repo, rvwt, "GATE_REVIEWER", empirical_gate_reviewer_prompt(base, candidate),
                "EMPIRICAL_GATE_REVIEW", "L", wt_root
            )
            review = review_run.report
            if not clean(rvwt):
                raise Stop("empirical gate reviewer modified candidate")
        finally:
            if rvwt.exists() and exact_worktree_clean(rvwt):
                remove_protected_detached_worktree(repo, rvwt, candidate)
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
            "EMPIRICAL_GATE_REMEDIATION", "L", wt_root
        ).report
        if sha(wt) != candidate:
            raise Stop("empirical gate remediation changed Git history")
        if rem.get("outcome") != "READY":
            raise Stop(f"empirical gate remediation not READY: {rem}")
        candidate = compose_owner_candidate(
            repo, wt, EMPIRICAL_STAGE, branch_name, base, candidate, rem,
            owner_surface, owner_limits)

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
                wt_root,
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
                    repo, ew, "EMPIRICAL_FAILURE", "L", synthetic, wt_root,
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
                    repo, ew, "EMPIRICAL_FAILURE", "L", synthetic_signal, wt_root,
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
    assert_raw_git_authority(repo)
    base = origin_main(repo)
    assert_raw_git_authority(repo)
    branch_name = f"owner/h-003-attestation-validity-{base[:12]}"
    wt = ensure_protected_builder_worktree(repo, branch_name, base)
    r = run_codex_resolving_architecture(
        repo, wt, "TEST_AUTHOR", test_author_prompt(),
        "H003_TEST_AUTHOR", "h-003", wt_root,
    ).report
    if r.get("owner_decision_required") or r.get("outcome") == "OWNER_DECISION_REQUIRED":
        raise Stop(f"architecture routing failure: unresolved owner signal h-003: {r.get('stop_reason')}")
    if r.get("outcome") != "READY" or r.get("frozen_gate_ready") is not True or r.get("baseline_red_for_right_reason") is not True:
        raise Stop(f"test-author did not establish freeze-ready state: {r}")
    owner_surface = TEST_AUTHOR_ALLOWED
    owner_limits = task_limits(wt, task_obj(wt, "h-003"))
    candidate = compose_owner_candidate(
        repo, wt, "h-003", branch_name, base, base, r,
        owner_surface, owner_limits)
    seen: list[str] = []
    while True:
        rvwt = protected_detached_worktree(repo, f"gate-review-h003-{candidate[:12]}", candidate)
        try:
            review_run = run_codex_resolving_architecture(repo, rvwt, "GATE_REVIEWER", gate_reviewer_prompt(base, candidate), "H003_GATE_REVIEW", "h-003", wt_root)
            review = review_run.report
            if not clean(rvwt):
                raise Stop("gate reviewer modified reviewed worktree")
        finally:
            if rvwt.exists() and exact_worktree_clean(rvwt):
                remove_protected_detached_worktree(repo, rvwt, candidate)
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
        remediation = run_codex_resolving_architecture(repo, wt, "TEST_AUTHOR", remediation_prompt("TEST_AUTHOR", None, blockers, base), "H003_GATE_REMEDIATION", "h-003", wt_root).report
        if sha(wt) != candidate:
            raise Stop("test-author remediation changed Git history")
        if remediation.get("owner_decision_required"):
            raise Stop(f"architecture routing failure during h-003 remediation: {remediation.get('stop_reason')}")
        if remediation.get("outcome") != "READY":
            raise Stop(f"test-author remediation not ready: {remediation}")
        candidate = compose_owner_candidate(
            repo, wt, "h-003", branch_name, base, candidate, remediation,
            owner_surface, owner_limits)
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


def remove_protected_detached_worktree(repo: Path, path: Path,
                                       expected_head: str) -> None:
    assert_worktree_binding(repo, path, expected_head, None)
    if not exact_worktree_clean(path):
        raise Stop(f"protected gate worktree is dirty: {path}")
    closed_worktree_git(repo, "worktree", "remove", str(path))
    if path.exists() or path.is_symlink():
        raise Stop(f"protected gate worktree removal left residue: {path}")
    if any(Path(row.get("worktree", "")).resolve() == path.resolve()
           for row in worktrees(repo)):
        raise Stop(f"protected gate worktree removal left registration: {path}")
def isolated_role_run(repo: Path, wt_root: Path, authority_wt: Path,
                      task_id: str, branch_name: str | None, role: str,
                      current: str, prompt: str, stage: str,
                      context: str = "") -> AgentRun:
    assert_worktree_binding(repo, authority_wt, current, branch_name)
    if not exact_worktree_clean(authority_wt):
        raise Stop(f"provider authority prestate is dirty task={task_id} role={role}")
    def invoke(invocation_role: str, invocation_prompt: str,
               label: str) -> AgentRun:
        scratch_role = f"{invocation_role}-{label}"
        scratch = isolated_provider_scratch(
            repo, wt_root, task_id, scratch_role, current
        )
        try:
            result = _run_codex_agent(
                repo, scratch, invocation_role, invocation_prompt, wt_root
            )
            return result
        finally:
            quarantine_provider_scratch(
                repo, scratch, task_id, scratch_role, current
            )
    guidance: list[str] = []
    last_signal = ""
    for round_no in range(1, MAX_ARCHITECT_ROUNDS + 1):
        effective = prompt
        if guidance:
            effective += "\n\nAUTONOMOUS_ARCHITECT_RESOLUTIONS:\n" + "\n\n".join(guidance)
            effective += "\n\nApply these resolutions within higher authority. Do not re-ask the human for the same choice."
        result = invoke(role, effective, f"{stage}-R{round_no}")
        if not owner_need(result.report):
            break
        if role == "ARCHITECT":
            accept_architect_resolution(repo, stage, task_id, result.report)
        signal = str(result.report.get("stop_reason")
                     or result.report.get("summary")
                     or "OWNER_DECISION_REQUIRED")
        if signal == last_signal and round_no == MAX_ARCHITECT_ROUNDS:
            raise Stop(
                f"HUMAN_AUTHORITY_HARD_STOP: architecture no-progress after "
                f"{MAX_ARCHITECT_ROUNDS} rounds stage={stage} task={task_id}: "
                f"{signal}"
            )
        last_signal = signal
        architect = invoke(
            "ARCHITECT", architect_prompt(
                stage, task_id, result.report, context
            ), f"{stage}-ARCH-R{round_no}"
        )
        resolution = accept_architect_resolution(
            repo, stage, task_id, architect.report
        )
        if (role in {"BUILDER", "REVIEWER"}
                and resolution.get("next_action") == "TEST_AUTHOR"):
            raise ContractRefreeze(
                task_id, str(resolution.get("summary") or signal)
            )
        guidance.append(str(resolution.get("summary") or ""))
    else:
        raise Stop(
            f"HUMAN_AUTHORITY_HARD_STOP: architecture resolution budget "
            f"exhausted stage={stage} task={task_id}"
        )
    assert_worktree_binding(repo, authority_wt, current, branch_name)
    if not exact_worktree_clean(authority_wt):
        raise Stop(
            f"provider affected protected authority task={task_id} role={role}"
        )
    return result
def _materialized_report(repo: Path, label: str, parent: str,
                         report: dict[str, Any], allowed: Iterable[str],
                         max_files: int, max_lines: int
                         ) -> tuple[str, str, list[str]]:
    assert_raw_git_authority(repo)
    authoritative_git = common_git_dir(repo)
    protected_materialization = protected_materialization_root(repo)
    controller_worktrees = protected_worktree_root(repo)
    if (protected_materialization == controller_worktrees
            or protected_materialization in controller_worktrees.parents
            or controller_worktrees in protected_materialization.parents):
        raise Stop("materialization and controller-worktree authority overlap")
    refs_before = closed_worktree_git(
        repo, "for-each-ref", "--format=%(refname) %(objectname)"
    ).out
    candidate, candidate_tree, files = materialize(
        str(authoritative_git), parent, report.get("candidate_delta"),
        allowed, max_files, max_lines, max_files,
        str(protected_materialization),
    )
    refs_after = closed_worktree_git(
        repo, "for-each-ref", "--format=%(refname) %(objectname)"
    ).out
    headers = closed_worktree_git(repo, "cat-file", "-p", candidate).out.partition("\n\n")[0].splitlines()
    trees = [row[5:] for row in headers if row.startswith("tree ")]
    parents = [row[7:] for row in headers if row.startswith("parent ")]
    if (not files or refs_after != refs_before or trees != [candidate_tree]
            or parents != [parent]):
        raise Stop(f"materialized no-ref child identity mismatch task={label}")
    actual_files = object_changed_files(repo, parent, candidate)
    if actual_files != sorted(files):
        raise Stop(
            f"materialized child path mismatch task={label} "
            f"expected={sorted(files)} actual={actual_files}"
        )
    return candidate, candidate_tree, files
def materialize_and_gate_builder_report(
        repo: Path, task_id: str, task_base: str, parent: str,
        report: dict[str, Any]) -> tuple[str, str, list[str]]:
    task = task_obj(repo, task_id)
    allowed = task.get("allowed_write") or load_spec(repo).get(
        "defaults", {}).get("allowed_write", [])
    max_files, max_lines = task_limits(repo, task)
    candidate, candidate_tree, files = _materialized_report(
        repo, task_id, parent, report, allowed, max_files, max_lines
    )
    assert_materialized_cumulative_scope(
        repo, task_id, task_base, candidate
    )
    gate_wt = protected_detached_worktree(
        repo, f"{task_id}\0{candidate}", candidate
    )
    try:
        gate = run_gate(gate_wt, task_id)
        if gate.rc != 0:
            raise Stop(
                f"materialized builder candidate is not green against frozen "
                f"gate task={task_id} rc={gate.rc}\n{gate.out}"
            )
        assert_worktree_binding(repo, gate_wt, candidate, None)
        if (not exact_worktree_clean(gate_wt)
                or sha(gate_wt, f"{candidate}^{{tree}}") != candidate_tree):
            raise Stop("protected candidate changed during frozen gate")
        assert_builder_scope(gate_wt, task_id, task_base)
    finally:
        if gate_wt.exists() and exact_worktree_clean(gate_wt):
            remove_protected_detached_worktree(repo, gate_wt, candidate)
    return candidate, candidate_tree, files
def materialize_and_gate_owner_report(
        repo: Path, label: str, task_base: str, parent: str,
        report: dict[str, Any], allowed: Iterable[str],
        limits: tuple[int, int],
        sl: RoadmapSlice | None = None) -> tuple[str, str, list[str]]:
    surface = tuple(sorted(set(allowed)))
    candidate, candidate_tree, files = _materialized_report(
        repo, label, parent, report, surface, *limits
    )
    cumulative = assert_materialized_cumulative_scope(
        repo, label, task_base, candidate, surface, limits
    )
    gate_wt = protected_detached_worktree(
        repo, f"owner\0{label}\0{candidate}", candidate
    )
    try:
        if label == "h-003":
            scoped = assert_test_author_scope(gate_wt, task_base)
            results = (run_gate(gate_wt, "h-003"), run_gate(gate_wt, "h-004"))
        elif label == EMPIRICAL_STAGE:
            scoped = assert_empirical_gate_author_scope(gate_wt, task_base)
            results = (run_empirical_gate(gate_wt),)
        elif sl is not None and label == sl.task_id:
            scoped = assert_roadmap_test_author_scope(gate_wt, task_base, sl)
            results = (run_gate(gate_wt, sl.task_id),)
        else:
            raise Stop(f"unknown owner materialization label: {label}")
        if sorted(scoped) != cumulative or any(result.rc != 1 for result in results):
            raise Stop(f"owner candidate scope/RED gate mismatch task={label}")
        assert_raw_git_authority(gate_wt)
        assert_worktree_binding(repo, gate_wt, candidate, None)
        if not exact_worktree_clean(gate_wt):
            raise Stop(f"owner RED gate changed candidate task={label}")
    finally:
        if gate_wt.exists() and exact_worktree_clean(gate_wt):
            remove_protected_detached_worktree(repo, gate_wt, candidate)
    return candidate, candidate_tree, files
def compose_owner_candidate(repo: Path, wt: Path, label: str,
                            branch_name: str, task_base: str, parent: str,
                            report: dict[str, Any], allowed: Iterable[str],
                            limits: tuple[int, int],
                            sl: RoadmapSlice | None = None) -> str:
    candidate, tree, files = materialize_and_gate_owner_report(
        repo, label, task_base, parent, report, allowed, limits, sl)
    adopt_materialized_candidate(
        repo, wt, label, branch_name, task_base, parent, candidate, tree,
        files, allowed, limits)
    return candidate
def builder_flow(repo: Path, wt_root: Path, task_id: str, branch_name: str, dirname: str,
                 subject: str, extra: str = "") -> str:
    assert_raw_git_authority(repo)
    base = origin_main(repo)
    assert_raw_git_authority(repo)
    wt = ensure_protected_builder_worktree(repo, branch_name, base)
    baseline_green = capture_green_gates(wt)
    if not exact_worktree_clean(wt):
        raise Stop(f"baseline gate battery left builder worktree dirty task={task_id}")
    baseline_current = run_gate(wt, task_id)
    if baseline_current.rc == 0:
        journal(repo, "TASK_ALREADY_GREEN", task=task_id, base=base)
        return base
    if baseline_current.rc != 1:
        raise Stop(f"task gate is not judgeable product RED; task={task_id} exit={baseline_current.rc}")
    agent = isolated_role_run(
        repo, wt_root, wt, task_id, branch_name, "BUILDER", base,
        builder_prompt(task_id, base, extra), "BUILDER",
    ).report
    if agent.get("owner_decision_required") or agent.get("outcome") == "OWNER_DECISION_REQUIRED":
        raise Stop(f"architecture routing failure builder task={task_id}: {agent.get('stop_reason')}")
    if agent.get("outcome") not in {"READY", "NO_CHANGES"}:
        raise Stop(f"builder not ready task={task_id}: {agent}")
    candidate, candidate_tree, files = materialize_and_gate_builder_report(
        repo, task_id, base, base, agent
    )
    adopt_materialized_candidate(
        repo, wt, task_id, branch_name, base, base,
        candidate, candidate_tree, files,
    )
    seen: list[str] = []
    while True:
        review_run = isolated_role_run(
            repo, wt_root, wt, task_id, branch_name, "REVIEWER", candidate,
            reviewer_prompt(task_id, base, candidate), "REVIEWER",
        )
        review = review_run.report
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
        assert_worktree_binding(repo, wt, candidate, branch_name)
        if not exact_worktree_clean(wt):
            raise Stop(f"builder remediation prestate changed unexpectedly task={task_id}")
        rem = isolated_role_run(
            repo, wt_root, wt, task_id, branch_name, "BUILDER", candidate,
            remediation_prompt(
                "BUILDER", task_id, blockers, base,
                current_candidate=candidate,
            ),
            "BUILDER_REMEDIATION",
        ).report
        if rem.get("owner_decision_required"):
            raise Stop(f"architecture routing failure remediation task={task_id}: {rem.get('stop_reason')}")
        if rem.get("outcome") != "READY":
            raise Stop(f"builder remediation not READY task={task_id}: {rem}")
        next_candidate, next_tree, files = materialize_and_gate_builder_report(
            repo, task_id, base, candidate, rem
        )
        adopt_materialized_candidate(
            repo, wt, task_id, branch_name, base, candidate,
            next_candidate, next_tree, files,
        )
        candidate = next_candidate
    assert_final_gates(wt, task_id, baseline_green)
    assert_worktree_binding(repo, wt, candidate, branch_name)
    if not exact_worktree_clean(wt):
        raise Stop(f"final protected candidate worktree is dirty task={task_id}")
    if origin_main(repo) != base:
        raise Stop(f"REMOTE_MAIN_CHANGED before publication task={task_id}")
    changed = object_changed_files(wt, base, candidate)
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
    assert_raw_git_authority(repo)
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
    if SUBSTITUTION_BLOBS != {
        SUBSTITUTION_OWNER_PATH: "3997437cd20c6dd7397622b512ffd90dab5cf391",
        SUBSTITUTION_AUDIT_PATH: "bb5f99c111cd5aaf784e73e67bde354023b1b5f2",
    }:
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
    audit_root = Path(tempfile.mkdtemp(prefix="nortropic-routing-ast-"))
    try:
        audited = src_path if src_path.is_file() else audit_root / "autopilot.py"
        if audited != src_path:
            audited.write_text(src, encoding="utf-8")
        python, _digest = _python_snapshot(audit_root)
        checker_root = src_path.resolve().parents[1] if src_path.is_file() else repo
        check = run([str(python), "-I", "-S", str(checker_root / "controller/result/routing_ast.py"), str(audited)], check=False)
        if check.rc or check.out.strip() != "ROUTING_AST=PASS":
            raise Stop("role execution ownership moved outside isolated router")
    finally:
        shutil.rmtree(audit_root)
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
