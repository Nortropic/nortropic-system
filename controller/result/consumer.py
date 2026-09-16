"""Provider-neutral consumption of one controller-owned structured result."""

import fcntl
import hashlib
import json
import os
from pathlib import Path
import stat
import tempfile

MAX_RESULT_BYTES = 4194304
SCHEMA_TEXT = '{"$schema":"https://json-schema.org/draft/2020-12/schema","additionalProperties":false,"properties":{"allowed_write_violation":{"type":["boolean","null"]},"baseline_red_for_right_reason":{"type":["boolean","null"]},"blocking_findings":{"items":{"additionalProperties":false,"properties":{"evidence":{"type":"string"},"id":{"type":"string"},"summary":{"type":"string"}},"required":["id","summary","evidence"],"type":"object"},"type":"array"},"candidate_delta":{"additionalProperties":false,"properties":{"base_commit":{"type":"string"},"format":{"enum":["git-diff-binary-v1"],"type":"string"},"patch_b64":{"type":"string"},"version":{"enum":[1],"type":"integer"}},"required":["version","format","base_commit","patch_b64"],"type":["object","null"]},"changed_files":{"items":{"type":"string"},"type":"array"},"frozen_artifacts_modified":{"type":["boolean","null"]},"frozen_gate_ready":{"type":["boolean","null"]},"next_action":{"enum":["ARCHITECT","BUILD","TEST_AUTHOR","DONE","BLOCKED",null],"type":["string","null"]},"next_task_id":{"type":["string","null"]},"outcome":{"enum":["READY","NEEDS_REMEDIATION","BLOCKED","OWNER_DECISION_REQUIRED","DONE","NO_CHANGES"],"type":"string"},"owner_decision_required":{"type":"boolean"},"production_files_modified":{"type":["boolean","null"]},"role":{"enum":["ARCHITECT","EMPIRICAL","TEST_AUTHOR","GATE_REVIEWER","BUILDER","REVIEWER","ROUTER"],"type":"string"},"stop_reason":{"type":"string"},"summary":{"type":"string"},"tests":{"items":{"additionalProperties":false,"properties":{"command":{"type":"string"},"decisive_evidence":{"type":"string"},"exit":{"type":["integer","null"]},"name":{"type":"string"},"result":{"enum":["PASS","FAIL","NOT_RUN","OVERIFIERAT"],"type":"string"}},"required":["name","command","exit","result","decisive_evidence"],"type":"object"},"type":"array"}},"required":["role","outcome","summary","changed_files","blocking_findings","tests","allowed_write_violation","frozen_artifacts_modified","production_files_modified","frozen_gate_ready","baseline_red_for_right_reason","owner_decision_required","stop_reason","next_action","next_task_id","candidate_delta"],"type":"object"}'

__all__ = ["consume_private_result"]


def _pairs(items):
    value = {}
    for key, child in items:
        if key in value:
            raise ValueError("duplicate JSON key")
        value[key] = child
    return value


def _valid(value, schema):
    if not isinstance(schema, dict):
        return False
    if not set(schema) <= set(("$schema", "type", "properties", "required",
                               "additionalProperties", "items", "enum")):
        return False
    kinds = schema.get("type")
    if kinds is not None:
        kinds = [kinds] if isinstance(kinds, str) else kinds
        matches = {
            "object": isinstance(value, dict),
            "array": isinstance(value, list),
            "string": isinstance(value, str),
            "integer": type(value) is int,
            "boolean": type(value) is bool,
            "null": value is None,
        }
        if (not isinstance(kinds, list) or not kinds
                or any(kind not in matches for kind in kinds)
                or not any(matches[kind] for kind in kinds)):
            return False
    if "enum" in schema and value not in schema["enum"]:
        return False
    if isinstance(value, dict):
        properties = schema.get("properties", {})
        required = schema.get("required", [])
        if (not isinstance(properties, dict) or not isinstance(required, list)
                or not set(required) <= set(value)):
            return False
        if schema.get("additionalProperties") is False and not set(value) <= set(properties):
            return False
        if any(key in properties and not _valid(child, properties[key])
               for key, child in value.items()):
            return False
    if (isinstance(value, list) and "items" in schema
            and any(not _valid(child, schema["items"]) for child in value)):
        return False
    return True


def _write_all(fd, data):
    remaining = memoryview(data)
    while remaining:
        count = os.write(fd, remaining)
        if count <= 0:
            raise OSError("short publication write")
        remaining = remaining[count:]


def _fstat(fd):
    return os.fstat(fd)


def _path_stat(path):
    return os.stat(path)


def _sync(fd):
    return os.fsync(fd)


def _unlink_retry(path):
    last = None
    for unused in range(2):
        try:
            os.unlink(path)
            return
        except FileNotFoundError:
            return
        except OSError as exc:
            last = exc
    if last is not None:
        raise last


def consume_private_result(sink_fd, canonical_destination, invocation_id, run_id, role):
    temp_name = None
    try:
        access = fcntl.fcntl(sink_fd, fcntl.F_GETFL) & os.O_ACCMODE
        fdflags = fcntl.fcntl(sink_fd, fcntl.F_GETFD)
        before = _fstat(sink_fd)
        if access != os.O_RDONLY or not (fdflags & fcntl.FD_CLOEXEC):
            raise ValueError("unsafe sink fd")
        if not stat.S_ISREG(before.st_mode) or before.st_nlink != 0:
            raise ValueError("unsafe sink object")
        _path_stat(os.path.dirname(os.fspath(canonical_destination)))
        if os.path.lexists(canonical_destination):
            raise FileExistsError("canonical preseed")

        chunks = []
        total = 0
        offset = 0
        while total <= MAX_RESULT_BYTES:
            chunk = os.pread(
                sink_fd,
                min(65536, MAX_RESULT_BYTES + 1 - total),
                offset,
            )
            if not chunk:
                break
            chunks.append(chunk)
            total += len(chunk)
            offset += len(chunk)
        after = _fstat(sink_fd)
        if total > MAX_RESULT_BYTES or total != before.st_size:
            raise ValueError("result bound/short read")
        if (
            before.st_dev,
            before.st_ino,
            before.st_mode,
            before.st_nlink,
            before.st_size,
            before.st_mtime_ns,
            before.st_ctime_ns,
        ) != (
            after.st_dev,
            after.st_ino,
            after.st_mode,
            after.st_nlink,
            after.st_size,
            after.st_mtime_ns,
            after.st_ctime_ns,
        ):
            raise ValueError("result changed")

        raw = b"".join(chunks)
        report = json.loads(raw.decode("utf-8", "strict"), object_pairs_hook=_pairs)
        schema = json.loads(SCHEMA_TEXT, object_pairs_hook=_pairs)
        if not _valid(report, schema) or report.get("role") != role:
            raise ValueError("schema/role")
        lowercase_hex = set("0123456789abcdef")
        if (not isinstance(invocation_id, str) or len(invocation_id) != 32
                or not set(invocation_id) <= lowercase_hex):
            raise ValueError("invocation")
        if (not isinstance(run_id, str) or len(run_id) != 32
                or not set(run_id) <= lowercase_hex or run_id == invocation_id):
            raise ValueError("run")

        envelope = {
            "schema_version": 1,
            "invocation_id": invocation_id,
            "run_id": run_id,
            "role": role,
            "result_sha256": hashlib.sha256(raw).hexdigest(),
            "report": report,
        }
        encoded = json.dumps(
            envelope,
            ensure_ascii=False,
            separators=(",", ":"),
            sort_keys=True,
        ).encode("utf-8")
        parent = os.fspath(os.path.dirname(os.fspath(canonical_destination)))
        temp_fd, temp_name = tempfile.mkstemp(prefix=".result-", dir=parent)
        try:
            _write_all(temp_fd, encoded)
            _sync(temp_fd)
        finally:
            os.close(temp_fd)
            temp_fd = -1
        # R116: publish with a no-overwrite hardlink, never os.replace.  If a
        # foreign canonical was created concurrently after the lexists check and
        # before this syscall, os.link raises FileExistsError and the foreign
        # object is left intact; the private temp is then unlinked in the finally.
        os.link(temp_name, canonical_destination)
        os.unlink(temp_name)
        temp_name = None
        return envelope
    finally:
        try:
            os.close(sink_fd)
        finally:
            if temp_name is not None:
                _unlink_retry(temp_name)
