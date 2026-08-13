"""Shared H-035 authority primitives.

The module owns the single repository-path language and strict canonical JSON
loading used by operational authority consumers.  It deliberately contains no
task-id special cases and no publication mechanism.
"""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path
from typing import Iterable


REGISTRY_KEYS = {
    "schema_version", "path_grammar", "authority_source",
    "self_digest_is_authority", "owner_production_paths",
    "prospective_ordinary_protected_paths", "owner_author_global_denied_paths",
}
REQUIRED_OWNER_PATHS = {
    "controller/h034-native/**", "verify/h034/kernel",
    "verify/h034/build-recipe.json", "verify/h034/identity-manifest.json",
}


class AuthorityError(ValueError):
    pass


def strict_json_bytes(raw: bytes) -> object:
    def pairs(items: list[tuple[str, object]]) -> dict[str, object]:
        result: dict[str, object] = {}
        for key, value in items:
            if key in result:
                raise AuthorityError(f"duplicate JSON key: {key}")
            result[key] = value
        return result

    try:
        return json.loads(raw.decode("utf-8"), object_pairs_hook=pairs)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise AuthorityError(f"invalid UTF-8 JSON: {exc}") from exc


def strict_json_file(path: Path) -> object:
    try:
        return strict_json_bytes(path.read_bytes())
    except OSError as exc:
        raise AuthorityError(f"cannot read {path}: {exc}") from exc


def parse_path(raw: object) -> tuple[str, bool]:
    if not isinstance(raw, str) or "\x00" in raw:
        raise AuthorityError("path must be a NUL-free string")
    value = raw.replace("\\", "/")
    if not value or value.startswith("/") or re.match(r"^[A-Za-z]:", value):
        raise AuthorityError("absolute, drive-prefixed, or empty path")
    if value.startswith("./") or value.endswith("/") or "//" in value:
        raise AuthorityError("non-canonical separator")
    recursive = value.endswith("/**")
    core = value[:-3] if recursive else value
    if not core or any(part in ("", ".", "..") for part in core.split("/")):
        raise AuthorityError("non-canonical segment")
    if any(char in core for char in "*?[]{}"):
        raise AuthorityError("unsupported glob")
    return core, recursive


def canonical_path(raw: object) -> str:
    core, recursive = parse_path(raw)
    return core + ("/**" if recursive else "")


def overlaps(left: object, right: object) -> bool:
    lp, lr = parse_path(left)
    rp, rr = parse_path(right)
    return ((not lr and not rr and lp == rp)
            or (lr and (rp == lp or rp.startswith(lp + "/")))
            or (rr and (lp == rp or lp.startswith(rp + "/"))))


def permits(pattern: object, path: object) -> bool:
    pp, recursive = parse_path(pattern)
    target, target_recursive = parse_path(path)
    if target_recursive:
        return recursive and (target == pp or target.startswith(pp + "/"))
    return target == pp if not recursive else target == pp or target.startswith(pp + "/")


def permitted(path: object, patterns: Iterable[object]) -> bool:
    return any(permits(pattern, path) for pattern in patterns)


def validate_registry(document: object) -> dict[str, object]:
    if not isinstance(document, dict) or set(document) != REGISTRY_KEYS:
        raise AuthorityError("registry top-level membership")
    if document.get("schema_version") != 1:
        raise AuthorityError("registry schema_version")
    if document.get("path_grammar") != "repo-tree-exact-or-terminal-recursive-prefix-v1":
        raise AuthorityError("registry path_grammar")
    if document.get("authority_source") != "git-candidate-plus-independent-gate-review-plus-owner-final-freeze":
        raise AuthorityError("registry authority_source")
    if document.get("self_digest_is_authority") is not False:
        raise AuthorityError("registry self_digest_is_authority")
    for key in ("owner_production_paths", "prospective_ordinary_protected_paths",
                "owner_author_global_denied_paths"):
        values = document.get(key)
        if not isinstance(values, list) or not values:
            raise AuthorityError(f"registry {key} must be non-empty list")
        canonical = [canonical_path(value) for value in values]
        if len(canonical) != len(set(canonical)):
            raise AuthorityError(f"registry {key} duplicate")
    if set(document["owner_production_paths"]) != REQUIRED_OWNER_PATHS:
        raise AuthorityError("registry owner_production_paths membership")
    return document


def git(repo: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(["git", "-C", str(repo), *args], text=True,
                          capture_output=True, shell=False, check=False)


def exact_commit(repo: Path, value: object) -> str:
    if not isinstance(value, str) or re.fullmatch(r"[0-9a-f]{40}", value) is None:
        raise AuthorityError("identity is not an exact lowercase commit SHA")
    result = git(repo, "rev-parse", "--verify", "--quiet", f"{value}^{{commit}}")
    if result.returncode or result.stdout.strip() != value:
        raise AuthorityError(f"unknown exact commit: {value}")
    return value


def blob_at(repo: Path, candidate: str, relative: str) -> bytes | None:
    result = subprocess.run(["git", "-C", str(repo), "show", f"{candidate}:{relative}"],
                            capture_output=True, shell=False, check=False)
    if result.returncode:
        return None
    return result.stdout


def regular_blob_at(repo: Path, candidate: str, relative: object) -> tuple[str, bytes]:
    """Return one exact regular Git blob, including its canonical path.

    Git represents both regular files and symlinks as blob objects.  `cat-file
    -t` alone therefore cannot establish the task gate's required file type;
    bind the exact tree mode before reading bytes by object id.  Nothing here
    consults the mutable checkout.
    """
    path = canonical_path(relative)
    _core, recursive = parse_path(path)
    if recursive:
        raise AuthorityError("task exit_test must be one exact path")
    tree = subprocess.run(
        ["git", "-C", str(repo), "--literal-pathspecs", "ls-tree", "-z",
         candidate, "--", path],
        capture_output=True, shell=False, check=False,
    )
    if tree.returncode or not tree.stdout.endswith(b"\0"):
        raise AuthorityError("cannot resolve task exit_test in candidate")
    records = tree.stdout[:-1].split(b"\0")
    if len(records) != 1 or b"\t" not in records[0]:
        raise AuthorityError("task exit_test is missing or non-regular")
    metadata, listed = records[0].split(b"\t", 1)
    fields = metadata.split()
    try:
        listed_path = listed.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise AuthorityError("task exit_test tree path is not UTF-8") from exc
    if (listed_path != path or len(fields) != 3
            or fields[0] not in {b"100644", b"100755"}
            or fields[1] != b"blob"
            or re.fullmatch(rb"[0-9a-f]{40,64}", fields[2]) is None):
        raise AuthorityError("task exit_test is not a regular Git blob")
    content = subprocess.run(
        ["git", "-C", str(repo), "cat-file", "blob", fields[2].decode("ascii")],
        capture_output=True, shell=False, check=False,
    )
    if content.returncode:
        raise AuthorityError("cannot read task exit_test Git blob")
    return path, content.stdout


def changed_files(repo: Path, base: str, candidate: str) -> list[str]:
    exact_commit(repo, base)
    exact_commit(repo, candidate)
    result = git(repo, "diff", "--name-only", "--no-renames", base, candidate)
    if result.returncode:
        raise AuthorityError(f"cannot derive Git changed files: {result.stderr.strip()}")
    files = [canonical_path(line) for line in result.stdout.splitlines() if line]
    if len(files) != len(set(files)):
        raise AuthorityError("duplicate changed path")
    return files


def task_authority(spec: object, task_id: str) -> tuple[dict[str, object], str, list[str]]:
    if not isinstance(spec, dict) or not isinstance(spec.get("tasks"), list):
        raise AuthorityError("spec tasks missing")
    hits = [task for task in spec["tasks"]
            if isinstance(task, dict) and task.get("id") == task_id]
    if len(hits) != 1:
        raise AuthorityError(f"task count for {task_id}: {len(hits)}")
    task = hits[0]
    version = spec.get("spec_version")
    if version == "2.0.0":
        authority = task.get("authority_class")
        if authority not in ("ordinary", "owner_authority"):
            raise AuthorityError("v2 authority_class")
    elif version == "1.0.0":
        if "authority_class" in task or "owner_author_allowed_write" in task:
            raise AuthorityError("v1 cannot express owner authority")
        authority = "ordinary"
    else:
        raise AuthorityError("unsupported spec version")

    ordinary = task.get("allowed_write", [])
    owner = task.get("owner_author_allowed_write", [])
    docs = task.get("docs_impact", [])
    if not isinstance(ordinary, list) or not isinstance(owner, list) or not isinstance(docs, list):
        raise AuthorityError("write surfaces must be lists")
    ordinary = [canonical_path(value) for value in ordinary]
    owner = [canonical_path(value) for value in owner]
    docs = [canonical_path(value) for value in docs]
    if authority == "ordinary":
        if not ordinary or owner:
            raise AuthorityError("ordinary surface shape")
        surface = ordinary
    else:
        if ordinary or not owner:
            raise AuthorityError("owner surface shape")
        surface = owner
    if any(not permitted(item, surface) for item in docs):
        raise AuthorityError("docs_impact outside applicable surface")
    return task, authority, surface
