"""Deterministically materialize one provider candidate artifact."""

import base64
import fnmatch
import os
from pathlib import Path
import re
import subprocess
import tempfile
import unicodedata


FORMAT = "git-diff-binary-v1"
VERSION = 1
OPS_MAX_KERNEL = 64
PATH_MAX_BYTES = 512
PATH_COMPONENT_MAX_BYTES = 255
PATCH_MAX_BYTES = 262144
FILE_MAX_BYTES = 2097152
DELTA_MAX_BYTES = 8388608
ALLOWED_MODES = {"100644", "100755"}
HEX = set("0123456789abcdef")


class Reject(Exception):
    pass


def _remove_tree(root):
    """Remove one controller-owned tree with absolute audit-visible paths."""
    root = Path(root)
    try:
        entries = list(os.scandir(root))
    except FileNotFoundError:
        return
    for entry in entries:
        path = Path(entry.path)
        if entry.is_dir(follow_symlinks=False):
            _remove_tree(path)
        else:
            os.unlink(path)
    os.rmdir(root)


def _git(args, *, git_dir, tmp_dir, index_file=None, input_bytes=None,
         commit_identity=False, check=True):
    environment = {
        "PATH": "/usr/bin:/bin",
        "HOME": "/var/empty",
        "TMPDIR": os.fspath(tmp_dir),
        "LANG": "C",
        "LC_ALL": "C",
        "GIT_DIR": os.fspath(git_dir),
        "GIT_CONFIG_NOSYSTEM": "1",
        "GIT_CONFIG_GLOBAL": "/dev/null",
        "GIT_TERMINAL_PROMPT": "0",
        "GIT_NO_REPLACE_OBJECTS": "1",
        "GIT_ALTERNATE_OBJECT_DIRECTORIES": "",
    }
    if index_file is not None:
        environment["GIT_INDEX_FILE"] = os.fspath(index_file)
    if commit_identity:
        environment.update({
            "GIT_AUTHOR_NAME": "nortropic-controller",
            "GIT_AUTHOR_EMAIL": "controller@nortropic.invalid",
            "GIT_COMMITTER_NAME": "nortropic-controller",
            "GIT_COMMITTER_EMAIL": "controller@nortropic.invalid",
            "GIT_AUTHOR_DATE": "2026-01-01T00:00:00 +0000",
            "GIT_COMMITTER_DATE": "2026-01-01T00:00:00 +0000",
        })
    process = subprocess.run(
        ["/usr/bin/git", *args],
        env=environment,
        input=input_bytes,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if check and process.returncode != 0:
        detail = process.stderr.decode("utf-8", "replace")[:200]
        raise Reject(f"git {args[0]} failed rc={process.returncode}: {detail}")
    return process


def _validate_inputs(candidate_delta, allowed_write_globs, max_changed_files,
                     max_added_lines, effective_ops_max):
    if not isinstance(candidate_delta, dict) or set(candidate_delta) != {
            "version", "format", "base_commit", "patch_b64"}:
        raise Reject("delta shape")
    if (type(candidate_delta["version"]) is not int
            or candidate_delta["version"] != VERSION
            or candidate_delta["format"] != FORMAT):
        raise Reject("delta version/format")
    if (not isinstance(allowed_write_globs, (list, tuple))
            or not allowed_write_globs
            or any(not isinstance(item, str) or not item
                   for item in allowed_write_globs)):
        raise Reject("allowed_write shape")
    for value, name in ((max_changed_files, "max_changed_files"),
                        (max_added_lines, "max_added_lines"),
                        (effective_ops_max, "effective_ops_max")):
        if type(value) is not int or value <= 0:
            raise Reject(f"{name} shape")


def _validate_path(path):
    if path == "" or path.startswith("/"):
        raise Reject(f"non-relative path: {path!r}")
    encoded = path.encode("utf-8")
    if len(encoded) > PATH_MAX_BYTES:
        raise Reject(f"path too long: {path!r}")
    if "\x00" in path:
        raise Reject("NUL in path")
    for component in path.split("/"):
        if component in ("", ".", ".."):
            raise Reject(f"traversal/empty component: {path!r}")
        if len(component.encode("utf-8")) > PATH_COMPONENT_MAX_BYTES:
            raise Reject(f"path component too long: {path!r}")
        if component.casefold() == ".git":
            raise Reject(f".git component: {path!r}")


def _within_allowed(path, globs):
    for pattern in globs:
        if pattern.endswith("/**"):
            prefix = pattern[:-3]
            if path == prefix or path.startswith(prefix + "/"):
                return True
        elif fnmatch.fnmatch(path, pattern):
            return True
    return False


def _parse_diff_tree_z(raw):
    entries = []
    fields = raw.split(b"\0")
    cursor = 0
    while cursor < len(fields):
        metadata = fields[cursor]
        if not metadata:
            cursor += 1
            continue
        if not metadata.startswith(b":") or cursor + 1 >= len(fields):
            raise Reject("diff-tree shape")
        parts = metadata.decode("ascii").lstrip(":").split()
        if len(parts) != 5:
            raise Reject("diff-tree metadata shape")
        old_mode, new_mode, old_sha, new_sha, status = parts
        if len(status) != 1 or status not in "AMDTCUXBR":
            raise Reject("diff-tree status")
        path = fields[cursor + 1].decode("utf-8", "strict")
        entries.append((old_mode, new_mode, old_sha, new_sha, status, path))
        cursor += 2
    return entries


def _reject_tree_collisions(git_dir, tree, tmp_dir):
    raw = _git(["ls-tree", "-r", "-z", "--name-only", tree],
               git_dir=git_dir, tmp_dir=tmp_dir).stdout
    paths = [item.decode("utf-8", "strict") for item in raw.split(b"\0") if item]
    files = {}
    directory_spellings = {}
    directory_keys = set()

    def normalized(component):
        return unicodedata.normalize("NFC", component).casefold()

    for path in paths:
        components = path.split("/")
        normalized_components = [normalized(item) for item in components]
        file_key = "/".join(normalized_components)
        if file_key in files and files[file_key] != path:
            raise Reject(f"final-tree case/unicode file collision: {path!r}")
        files[file_key] = path
        original_prefix = ""
        normalized_prefix = ""
        for position in range(len(components) - 1):
            original_prefix = (components[position] if not original_prefix
                               else original_prefix + "/" + components[position])
            normalized_prefix = (normalized_components[position]
                                 if not normalized_prefix
                                 else normalized_prefix + "/"
                                 + normalized_components[position])
            directory_keys.add(normalized_prefix)
            prior = directory_spellings.get(normalized_prefix)
            if prior is not None and prior != original_prefix:
                raise Reject(f"final-tree directory alias collision: {original_prefix!r}")
            directory_spellings[normalized_prefix] = original_prefix
    if any(file_key in directory_keys for file_key in files):
        raise Reject("final-tree file/directory prefix collision")


def _added_lines(git_dir, base_tree, candidate_tree, path, tmp_dir):
    raw = _git(["diff", "--numstat", "-z", base_tree, candidate_tree,
                "--", path], git_dir=git_dir, tmp_dir=tmp_dir).stdout
    if not raw:
        return 0
    added = raw.split(b"\t", 1)[0].decode("ascii")
    return 0 if added == "-" else int(added)


def _entry_index_pairs(patch, git_dir, base_tree, tmp_dir):
    starts = [match.start() for match in re.finditer(rb"(?m)^diff --git ", patch)]
    if not starts or patch[:starts[0]].strip():
        raise Reject("patch preamble or missing diff entry")
    starts.append(len(patch))
    pairs = []
    for ordinal, (left, right) in enumerate(zip(starts, starts[1:])):
        block = patch[left:right]
        indexish = re.findall(rb"(?m)^index [^\n]*$", block)
        exact = re.findall(
            rb"(?m)^index ([0-9a-f]{40})\.\.([0-9a-f]{40})(?: [0-7]{6})?$",
            block,
        )
        positions = {
            "new_file": [item.start() for item in re.finditer(
                rb"(?m)^new file mode [0-7]{6}$", block)],
            "deleted_file": [item.start() for item in re.finditer(
                rb"(?m)^deleted file mode [0-7]{6}$", block)],
            "old_mode": [item.start() for item in re.finditer(
                rb"(?m)^old mode [0-7]{6}$", block)],
            "new_mode": [item.start() for item in re.finditer(
                rb"(?m)^new mode [0-7]{6}$", block)],
            "old_file": [item.start() for item in re.finditer(
                rb"(?m)^--- [^\n]+$", block)],
            "new_file_header": [item.start() for item in re.finditer(
                rb"(?m)^\+\+\+ [^\n]+$", block)],
            "hunk": [item.start() for item in re.finditer(
                rb"(?m)^@@ ", block)],
            "binary": [item.start() for item in re.finditer(
                rb"(?m)^GIT binary patch$", block)],
        }
        if (any(len(values) > 1 for values in positions.values())
                or (positions["new_file"] and positions["deleted_file"])
                or (positions["new_file"] and positions["new_file"][0]
                    > (indexish and block.find(indexish[0]) or len(block)))
                or (positions["deleted_file"] and positions["deleted_file"][0]
                    > (indexish and block.find(indexish[0]) or len(block)))
                or (positions["old_mode"] and positions["new_mode"]
                    and positions["old_mode"][0] > positions["new_mode"][0])
                or (positions["old_file"] and positions["new_file_header"]
                    and positions["old_file"][0]
                    > positions["new_file_header"][0])
                or (positions["new_file_header"] and positions["hunk"]
                    and positions["new_file_header"][0] > positions["hunk"][0])):
            raise Reject("noncanonical extended-header ordering")
        entry_index = Path(tmp_dir) / f"entry-index-{ordinal}"
        try:
            _git(["read-tree", base_tree], git_dir=git_dir, tmp_dir=tmp_dir,
                 index_file=entry_index)
            apply_args = ["apply", "--cached", "--binary",
                          "--whitespace=nowarn", "--unsafe-paths"]
            _git([*apply_args, "--check", "-"], git_dir=git_dir,
                 tmp_dir=tmp_dir, index_file=entry_index, input_bytes=block)
            _git([*apply_args, "-"], git_dir=git_dir, tmp_dir=tmp_dir,
                 index_file=entry_index, input_bytes=block)
            entry_tree = _git(["write-tree"], git_dir=git_dir,
                              tmp_dir=tmp_dir,
                              index_file=entry_index).stdout.decode().strip()
            raw = _git(
                ["diff-tree", "-r", "--no-commit-id", "--raw",
                 "--no-renames", base_tree, entry_tree],
                git_dir=git_dir, tmp_dir=tmp_dir,
            ).stdout
            effects = re.findall(
                rb"(?m)^:([0-7]{6}) ([0-7]{6}) ([0-9a-f]{40}) "
                rb"([0-9a-f]{40}) ([AMDTCUXBR])\t",
                raw,
            )
            if len(effects) != 1:
                raise Reject("entry identity is not bound to its own effect")
            old_mode, new_mode, old_id, new_id, _status = effects[0]
            if len(indexish) == 1 and len(exact) == 1:
                index_matches = list(re.finditer(rb"(?m)^index [^\n]*\n", block))
                payload_matches = list(re.finditer(
                    rb"(?m)^(?:--- |@@ |GIT binary patch$)", block))
                empty_blob = b"e69de29bb2d1d6434b8b29ae775ad8c2e48c5391"
                empty_transition = (
                    (old_mode == b"000000"
                     and new_mode in {b"100644", b"100755"}
                     and old_id == b"0" * 40 and new_id == empty_blob)
                    or (old_mode in {b"100644", b"100755"}
                        and new_mode == b"000000"
                        and old_id == empty_blob and new_id == b"0" * 40))
                if (len(index_matches) != 1
                        or (not payload_matches and not empty_transition)
                        or (payload_matches and index_matches[0].end()
                            > payload_matches[0].start())
                        or exact[0] != (old_id, new_id)):
                    raise Reject("entry full-index identity is misplaced or misbound")
            elif not indexish and not exact:
                old_modes = re.findall(rb"(?m)^old mode ([0-7]{6})$", block)
                new_modes = re.findall(rb"(?m)^new mode ([0-7]{6})$", block)
                if (len(old_modes) != 1 or len(new_modes) != 1
                        or old_modes[0] != old_mode or new_modes[0] != new_mode
                        or old_mode == new_mode
                        or {old_mode, new_mode} - {b"100644", b"100755"}
                        or old_id != new_id or old_id == b"0" * 40
                        or list(re.finditer(
                            rb"(?m)^(?:--- |@@ |GIT binary patch$)", block))):
                    raise Reject("noncanonical mode-only entry")
            else:
                raise Reject("each content entry needs one exact full-index line")
            pairs.append((old_id, new_id))
        finally:
            try:
                os.unlink(entry_index)
            except FileNotFoundError:
                pass
    return pairs


def _derive(git_dir, index_file, pinned_base_commit, patch, declared_pairs,
            allowed_write_globs, max_changed_files, max_added_lines,
            effective_ops_max, tmp_dir):
    base_tree = _git(
        ["rev-parse", "--verify", f"{pinned_base_commit}^{{tree}}"],
        git_dir=git_dir, tmp_dir=tmp_dir,
    ).stdout.decode().strip()
    _git(["read-tree", base_tree], git_dir=git_dir, tmp_dir=tmp_dir,
         index_file=index_file)
    apply_args = ["apply", "--cached", "--binary", "--whitespace=nowarn",
                  "--unsafe-paths"]
    _git([*apply_args, "--check", "-"], git_dir=git_dir, tmp_dir=tmp_dir,
         index_file=index_file, input_bytes=patch)
    _git([*apply_args, "-"], git_dir=git_dir, tmp_dir=tmp_dir,
         index_file=index_file, input_bytes=patch)
    candidate_tree = _git(["write-tree"], git_dir=git_dir,
                          tmp_dir=tmp_dir,
                          index_file=index_file).stdout.decode().strip()
    _reject_tree_collisions(git_dir, candidate_tree, tmp_dir)
    raw = _git(["diff-tree", "-r", "--no-commit-id", "-z",
                base_tree, candidate_tree], git_dir=git_dir,
               tmp_dir=tmp_dir).stdout
    entries = _parse_diff_tree_z(raw)
    if not entries:
        raise Reject("empty candidate delta")
    if len(entries) > min(OPS_MAX_KERNEL, effective_ops_max):
        raise Reject("changed files exceed effective ops max")

    changed = []
    total_bytes = 0
    added_lines = 0
    for old_mode, new_mode, old_sha, new_sha, status, path in entries:
        _validate_path(path)
        if not _within_allowed(path, allowed_write_globs):
            raise Reject(f"path outside allowed_write: {path}")
        if status == "D":
            if old_mode not in ALLOWED_MODES:
                raise Reject(f"disallowed deleted mode {old_mode} for {path}")
            if old_sha == "0" * 40 or int(old_mode, 8) == 0:
                raise Reject(f"delete of absent path: {path}")
        else:
            if old_mode not in ({"000000"} | ALLOWED_MODES):
                raise Reject(f"disallowed source mode {old_mode} for {path}")
            if new_mode not in ALLOWED_MODES:
                raise Reject(f"disallowed final mode {new_mode} for {path}")
            size = int(_git(["cat-file", "-s", new_sha],
                            git_dir=git_dir,
                            tmp_dir=tmp_dir).stdout.decode().strip())
            if size > FILE_MAX_BYTES:
                raise Reject(f"resulting blob exceeds FILE_MAX_BYTES: {path}")
            total_bytes += size
            if total_bytes > DELTA_MAX_BYTES:
                raise Reject("sum of resulting blobs exceeds DELTA_MAX_BYTES")
        added_lines += _added_lines(
            git_dir, base_tree, candidate_tree, path, tmp_dir)
        changed.append(path)
    if len(changed) > max_changed_files:
        raise Reject("changed files exceed task budget")
    if added_lines > max_added_lines:
        raise Reject("added lines exceed budget")

    effect = _git(["diff-tree", "-r", "--no-commit-id", "--raw",
                   "--no-renames", base_tree, candidate_tree],
                  git_dir=git_dir, tmp_dir=tmp_dir).stdout
    actual_pairs = re.findall(
        rb"(?m)^:[0-7]{6} [0-7]{6} ([0-9a-f]{40}) ([0-9a-f]{40}) [AMDTCUXBR]",
        effect,
    )
    if (not declared_pairs or len(declared_pairs) != len(changed)
            or declared_pairs != actual_pairs):
        raise Reject("patch index preimage/postimage not bound to derived tree")
    return base_tree, candidate_tree, sorted(changed)


def _durable_tree(git_dir, index_file, pinned_base_commit, patch, tmp_dir):
    base_tree = _git(
        ["rev-parse", "--verify", f"{pinned_base_commit}^{{tree}}"],
        git_dir=git_dir, tmp_dir=tmp_dir,
    ).stdout.decode().strip()
    _git(["read-tree", base_tree], git_dir=git_dir, tmp_dir=tmp_dir,
         index_file=index_file)
    apply_args = ["apply", "--cached", "--binary", "--whitespace=nowarn",
                  "--unsafe-paths"]
    _git([*apply_args, "--check", "-"], git_dir=git_dir, tmp_dir=tmp_dir,
         index_file=index_file, input_bytes=patch)
    _git([*apply_args, "-"], git_dir=git_dir, tmp_dir=tmp_dir,
         index_file=index_file, input_bytes=patch)
    return _git(["write-tree"], git_dir=git_dir, tmp_dir=tmp_dir,
                index_file=index_file).stdout.decode().strip()


def materialize(authoritative_git_dir, pinned_base_commit, candidate_delta,
                allowed_write_globs, max_changed_files, max_added_lines,
                effective_ops_max, protected_root):
    """Return a deterministic durable no-ref candidate commit, tree and paths."""
    _validate_inputs(candidate_delta, allowed_write_globs, max_changed_files,
                     max_added_lines, effective_ops_max)
    if (not isinstance(pinned_base_commit, str)
            or len(pinned_base_commit) != 40
            or set(pinned_base_commit) > HEX
            or candidate_delta["base_commit"] != pinned_base_commit):
        raise Reject("base_commit != controller-pinned base")
    patch_b64 = candidate_delta["patch_b64"]
    if not isinstance(patch_b64, str):
        raise Reject("patch_b64 type")
    try:
        patch = base64.b64decode(patch_b64, validate=True)
    except Exception as exc:
        raise Reject("patch_b64 invalid base64") from exc
    if not patch:
        raise Reject("empty patch")
    if len(patch) > PATCH_MAX_BYTES:
        raise Reject("patch exceeds PATCH_MAX_BYTES")

    authoritative = Path(authoritative_git_dir)
    protected = Path(protected_root)
    if not authoritative.is_absolute() or not authoritative.is_dir():
        raise Reject("authoritative Git dir absent")
    if not protected.is_absolute() or not protected.is_dir():
        raise Reject("protected materialization root absent")

    work = Path(tempfile.mkdtemp(prefix="nortropic-materialize-", dir=protected))
    try:
        private_git = work / "private.git"
        private_index = work / "private-index"
        durable_index = work / "durable-index"
        _git(["init", "-q", "--bare", str(private_git)],
             git_dir=private_git, tmp_dir=work)
        closure = _git(["rev-list", "--objects", "--no-walk",
                        f"{pinned_base_commit}^{{commit}}"],
                       git_dir=authoritative, tmp_dir=work).stdout
        if not closure:
            raise Reject("base closure enumeration failed")
        packed = _git(["pack-objects", "--stdout"], git_dir=authoritative,
                      tmp_dir=work, input_bytes=closure).stdout
        if not packed:
            raise Reject("base closure pack failed")
        _git(["index-pack", "--stdin", "--fix-thin"], git_dir=private_git,
             tmp_dir=work, input_bytes=packed)
        if (private_git / "objects/info/alternates").exists():
            raise Reject("unexpected private ODB alternate")
        _git(["cat-file", "-e", f"{pinned_base_commit}^{{commit}}"],
             git_dir=private_git, tmp_dir=work)
        _git(["rev-list", "--objects", "--no-walk", pinned_base_commit],
             git_dir=private_git, tmp_dir=work)
        private_base_tree = _git(
            ["rev-parse", "--verify", f"{pinned_base_commit}^{{tree}}"],
            git_dir=private_git, tmp_dir=work,
        ).stdout.decode().strip()
        declared_pairs = _entry_index_pairs(
            patch, private_git, private_base_tree, work)
        _, private_tree, changed = _derive(
            private_git, private_index, pinned_base_commit, patch, declared_pairs,
            allowed_write_globs, max_changed_files, max_added_lines,
            effective_ops_max, work,
        )

        durable_tree = _durable_tree(
            authoritative, durable_index, pinned_base_commit, patch, work)
        if durable_tree != private_tree:
            raise Reject("durable derivation differs from private derivation")
        candidate = _git(
            ["commit-tree", durable_tree, "-p", pinned_base_commit, "-m",
             "nortropic candidate (materialized from protected artifact)"],
            git_dir=authoritative,
            tmp_dir=work,
            commit_identity=True,
        ).stdout.decode().strip()
        if re.fullmatch(r"[0-9a-f]{40}", candidate) is None:
            raise Reject("candidate identity shape")
        object_type = _git(["cat-file", "-t", candidate],
                           git_dir=authoritative, tmp_dir=work).stdout
        resolved_tree = _git(["rev-parse", "--verify", f"{candidate}^{{tree}}"],
                             git_dir=authoritative,
                             tmp_dir=work).stdout.decode().strip()
        if object_type != b"commit\n" or resolved_tree != durable_tree:
            raise Reject("durable candidate identity does not resolve")
        return candidate, durable_tree, changed
    finally:
        _remove_tree(work)
