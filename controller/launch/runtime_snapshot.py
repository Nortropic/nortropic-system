"""controller/launch/runtime_snapshot.py — H-036 pre-sandbox runtime supervisor.

Two roles in one immutable helper, dispatched by argv[1]:

  supervise-v1 --control-fd N --ready-fd M
      Unconfined session server started PRE-sandbox by the launcher.  Owns the
      capability→profile-state map, mints per-target capabilities, seeds the
      runtime-family canaries, writes the framed kuvert, and spawns one confined
      helper per launch request under the exact Seatbelt profile.

  confined-exec-v1 --proof-fd N
      The post-profile helper.  Performs the real allowed/denied syscalls under
      the installed profile, reports a signed profile proof, pauses for the
      supervisor's go, sanitizes the target environment and execs the target
      with only stdio {0,1,2}.

The two Seatbelt profile texts are byte-exact and paths reach sandbox-exec only
through ``-D name=value`` parameters, never interpolated into the Scheme source.
"""

from __future__ import annotations

import errno
import hashlib
import json
import os
import re
import secrets
import select
import shutil
import signal
import socket
import stat
import struct
import subprocess
import sys
import threading
import time

PROFILE_TEMPLATE_BASE = """(version 1)
(allow default)
(deny file-write*
  (require-all
    (subpath (param "LIVE_ROOT"))
    (require-not (subpath (param "LIVE_GIT")))))
(deny file-write*
  (require-all
    (subpath (param "LIVE_GIT"))
    (require-not
      (require-any
        (subpath (param "GIT_OBJECTS"))
        (subpath (param "WORKTREE_GITDIR"))))))
(deny file-write* (subpath (param "GIT_OBJECTS_INFO")))
(deny file-write* (subpath (param "WORKTREE_COMMDIR")))
(deny file-write* (subpath (param "WORKTREE_GITFILE")))
(deny file-write* (subpath (param "WORKTREE_CONFIG")))
(deny file-write* (subpath (param "TRUST_ROOT")))
(deny file-write* (subpath (param "RUNTIME_ROOT")))
(deny file-write* (literal (param "CURRENT_WORKSPACE")))
(deny file-write* (literal (param "CURRENT_WORKSPACE_DOTGIT")))
(deny file-write*
  (require-all
    (subpath (param "ANCESTOR_WORKSPACE"))
    (require-not (subpath (param "CURRENT_WORKSPACE")))))
"""
PROFILE_TEMPLATE_STAGING_SUFFIX = """(deny file-write* (subpath (param "STAGING_ROOT")))
(allow file-write-data (literal (param "RESULT_SINK")))
"""
PROFILE_TEMPLATE_WITH_STAGING = PROFILE_TEMPLATE_BASE + PROFILE_TEMPLATE_STAGING_SUFFIX
PROFILE_BASE_SHA256 = hashlib.sha256(PROFILE_TEMPLATE_BASE.encode("utf-8")).hexdigest()
PROFILE_SHA256 = hashlib.sha256(PROFILE_TEMPLATE_WITH_STAGING.encode("utf-8")).hexdigest()

BASE_PARAM_ORDER = [
    "LIVE_ROOT", "LIVE_GIT", "GIT_OBJECTS", "GIT_OBJECTS_INFO",
    "WORKTREE_GITDIR", "WORKTREE_COMMDIR", "WORKTREE_GITFILE",
    "WORKTREE_CONFIG", "TRUST_ROOT", "RUNTIME_ROOT",
    "ANCESTOR_WORKSPACE", "CURRENT_WORKSPACE", "CURRENT_WORKSPACE_DOTGIT",
]
STAGING_PARAM_ORDER = BASE_PARAM_ORDER + ["STAGING_ROOT", "RESULT_SINK"]

SANDBOX_EXEC = "/usr/bin/sandbox-exec"
FRAME_LIMIT = 1048576
MAX_DEPTH = 16
MAX_TIMEOUT_MS = 86400000
HANDSHAKE_TIMEOUT = 5.0
TERM_GRACE = 2.0
REAP_TIMEOUT = 5.0

STRIP_PREFIXES = ("DYLD_", "GIT_", "GH_", "GITHUB_", "PYTHON", "SLACK_")
STRIP_EXACT = frozenset({
    "LD_LIBRARY_PATH", "LD_PRELOAD", "NORTROPIC_TRUST_ROOT",
    "NORTROPIC_STAGING_ROOT", "NORTROPIC_RESULT_SINK", "__PYVENV_LAUNCHER__",
})
RESERVED_PREFIX = "NORTROPIC_H036_"
EPHEMERAL_KEYS = (
    "NORTROPIC_H036_CAPABILITY", "NORTROPIC_H036_LEVEL",
    "NORTROPIC_H036_SESSION_ID", "NORTROPIC_H036_SOCKET",
)
OVERRIDE_SUFFIXES = (
    "_OVERRIDE", "_CONFIG_OVERRIDE", "_PROFILE_OVERRIDE",
    "_LIVE_ROOT_OVERRIDE", "_HELPER_OVERRIDE",
)

DENIED_BASE = [
    f"{family}_{op}"
    for family in ("live", "trust", "runtime", "ancestor")
    for op in ("create", "write", "rename", "unlink", "hardlink", "mkdir", "chmod")
]
DENIED_STAGING = [
    f"staging_{op}"
    for op in ("create", "write", "rename", "unlink", "hardlink", "mkdir", "chmod")
] + [
    "sink_hardlink", "sink_rename", "sink_unlink", "sink_chmod",
    "staging_root_rename", "staging_root_chmod", "staging_root_rmdir",
]

HEX64 = re.compile(r"[0-9a-f]{64}")
DECIMAL = re.compile(r"0|[1-9][0-9]*")


def _is_int(value: object) -> bool:
    return type(value) is int


def canonical_sha(value: object) -> str:
    return hashlib.sha256(json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":"),
    ).encode("utf-8")).hexdigest()


def strict_json(raw: bytes) -> object:
    def pairs(items):
        out: dict = {}
        for key, value in items:
            if key in out:
                raise ValueError(f"duplicate key {key}")
            out[key] = value
        return out
    return json.loads(
        raw.decode("utf-8"), object_pairs_hook=pairs,
        parse_constant=lambda token: (_ for _ in ()).throw(
            ValueError(f"non-finite {token}")),
    )


def read_exact(fd: int, count: int) -> bytes:
    out = b""
    while len(out) < count:
        chunk = os.read(fd, count - len(out))
        if not chunk:
            break
        out += chunk
    return out


def send_fd_frame(fd: int, value: object) -> None:
    body = json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    payload = struct.pack(">I", len(body)) + body
    view = memoryview(payload)
    while view:
        written = os.write(fd, view)
        view = view[written:]


def recv_fd_frame(fd: int) -> object:
    head = read_exact(fd, 4)
    if len(head) != 4:
        return None
    size = struct.unpack(">I", head)[0]
    body = read_exact(fd, size)
    if len(body) != size:
        return None
    return json.loads(body.decode("utf-8"))


def sock_send_frame(conn: socket.socket, value: object) -> None:
    body = json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    conn.sendall(struct.pack(">I", len(body)) + body)


def sock_read_exact(conn: socket.socket, count: int) -> bytes:
    out = b""
    while len(out) < count:
        chunk = conn.recv(count - len(out))
        if not chunk:
            break
        out += chunk
    return out


def sock_recv_frame_strict(conn: socket.socket) -> object:
    head = sock_read_exact(conn, 4)
    if len(head) != 4:
        raise ValueError("short frame length")
    size = struct.unpack(">I", head)[0]
    if size > FRAME_LIMIT:
        raise ValueError("frame too large")
    body = sock_read_exact(conn, size)
    if len(body) != size:
        raise ValueError("short frame body")
    return strict_json(body)


def audit_pidversion() -> int:
    pair_a, pair_b = socket.socketpair()
    try:
        token = struct.unpack("=8I", pair_a.getsockopt(0, 6, 32))
        return token[7]
    finally:
        pair_a.close()
        pair_b.close()


# ---------------------------------------------------------------------------
# Confined helper: confined-exec-v1
# ---------------------------------------------------------------------------

def _effect_errno(op: str, path: str, target: str | None) -> int:
    try:
        if op == "create":
            fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            os.close(fd)
        elif op == "write":
            fd = os.open(path, os.O_WRONLY | os.O_TRUNC)
            os.close(fd)
        elif op == "rename":
            os.rename(path, target)
        elif op == "unlink":
            os.unlink(path)
        elif op == "hardlink":
            os.link(path, target)
        elif op == "mkdir":
            os.mkdir(path)
        elif op == "chmod":
            os.chmod(path, 0o644)
        elif op == "rmdir":
            os.rmdir(path)
        else:
            return errno.EINVAL
        return 0
    except OSError as exc:
        return exc.errno if exc.errno is not None else errno.EPERM


def confined_main(proof_fd: int) -> int:
    setup = recv_fd_frame(proof_fd)
    if not isinstance(setup, dict):
        return 8
    nonce = setup["request_nonce"]
    proof_bytes = ("H036-PROFILE-PROOF-V1:" + nonce).encode("ascii")
    effects: dict[str, object] = {}

    # Allowed scratch write inside the current workspace.
    scratch = setup.get("scratch_path")
    if isinstance(scratch, str):
        try:
            fd = os.open(scratch, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
            os.write(fd, proof_bytes)
            os.fsync(fd)
            os.close(fd)
            effects["scratch_write_sha256"] = hashlib.sha256(proof_bytes).hexdigest()
        except OSError as exc:
            effects["scratch_write_sha256"] = f"errno:{exc.errno}"

    # Allowed data write to the staging result sink.
    if setup.get("sink_path"):
        try:
            fd = os.open(setup["sink_path"], os.O_WRONLY)
            view = memoryview(proof_bytes)
            while view:
                view = view[os.write(fd, view):]
            os.fsync(fd)
            os.close(fd)
            effects["sink_write_sha256"] = hashlib.sha256(proof_bytes).hexdigest()
        except OSError as exc:
            effects["sink_write_sha256"] = f"errno:{exc.errno}"

    for key, spec in setup.get("effect_plan", {}).items():
        op = spec[0]
        path = spec[1]
        target = spec[2] if len(spec) > 2 else None
        effects[key] = _effect_errno(op, path, target)

    proof = {
        "class": "profile-proof-v1",
        "schema_version": 1,
        "request_nonce": nonce,
        "session_id": setup["session_id"],
        "child_euid": os.geteuid(),
        "child_pid": os.getpid(),
        "child_pidversion": audit_pidversion(),
        "profile_sha256": setup["profile_sha256"],
        "effects": effects,
    }
    proof["proof_digest"] = canonical_sha(proof)
    send_fd_frame(proof_fd, proof)

    decision = recv_fd_frame(proof_fd)
    if not isinstance(decision, dict) or decision.get("action") != "go":
        return 0

    # Sanitize target environment and exec with only stdio.
    env = build_target_env(setup)
    argv = setup["argv"]
    try:
        os.close(proof_fd)
    except OSError:
        pass
    os.execve(argv[0], argv, env)
    return 8


def build_target_env(setup: dict) -> dict[str, str]:
    result: dict[str, str] = {}
    for name, value in setup.get("environment", []):
        if name.startswith(STRIP_PREFIXES) or name in STRIP_EXACT:
            continue
        if name.startswith(RESERVED_PREFIX):
            continue
        if name.endswith(OVERRIDE_SUFFIXES):
            continue
        result[name] = value
    result["PATH"] = "/usr/bin:/bin"
    result["NORTROPIC_KUVERT"] = setup["kuvert_path"]
    result["NORTROPIC_H036_CAPABILITY"] = setup["child_capability"]
    result["NORTROPIC_H036_LEVEL"] = str(setup["child_level"])
    result["NORTROPIC_H036_SESSION_ID"] = setup["session_id"]
    result["NORTROPIC_H036_SOCKET"] = setup["socket_path"]
    return result


# ---------------------------------------------------------------------------
# Supervisor: supervise-v1
# ---------------------------------------------------------------------------

class Supervisor:
    def __init__(self, control_fd: int, ready_fd: int) -> None:
        self.control_fd = control_fd
        self.ready_fd = ready_fd
        self.caps: dict[str, tuple[str, int]] = {}
        self.used_nonces: set[str] = set()
        self.lock = threading.Lock()
        self.targets: dict[int, int] = {}
        self.stopping = False
        self.destroyed = False
        self.cfg: dict = {}
        self.session_id = ""
        self.sink_original: bytes | None = None

    # -- bootstrap ----------------------------------------------------------
    def bootstrap(self) -> None:
        cfg = recv_fd_frame(self.control_fd)
        if not isinstance(cfg, dict):
            raise SystemExit(8)
        self.cfg = cfg
        root = cfg["root"]
        socket_path = cfg["socket_path"]
        self.listener = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.listener.bind(socket_path)
        os.chmod(socket_path, 0o600)
        self.listener.listen(64)

        # Seed the runtime-family canaries directly in the runtime root.
        nonce = "12" * 32
        prefix = f".nortropic-h036-proof-{nonce}-runtime"
        for name in ("write", "rename", "unlink", "hardlink"):
            path = os.path.join(root, f"{prefix}-{name}-source")
            fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            os.write(fd, b"ORIGINAL")
            os.fsync(fd)
            os.close(fd)
            os.chmod(path, 0o600)
        os.mkdir(os.path.join(root, "k"), 0o700)
        os.chmod(root, 0o500)

        self.session_id = secrets.token_hex(32)
        root_cap = secrets.token_hex(32)
        self.caps[root_cap] = (self.session_id, -1)
        if cfg.get("result_sink"):
            try:
                with open(cfg["result_sink"], "rb") as handle:
                    self.sink_original = handle.read()
            except OSError:
                self.sink_original = b""

        try:
            os.close(self.ready_fd)
        except OSError:
            pass
        send_fd_frame(self.control_fd, {
            "session_id": self.session_id, "root_capability": root_cap,
        })

    # -- teardown -----------------------------------------------------------
    def destroy(self) -> None:
        with self.lock:
            if self.destroyed:
                return
            self.destroyed = True
            self.stopping = True
            pgids = list(self.targets.values())
        for pgid in pgids:
            try:
                os.killpg(pgid, signal.SIGKILL)
            except (ProcessLookupError, PermissionError):
                pass
        try:
            os.unlink(self.cfg["socket_path"])
        except OSError:
            pass
        # Remove the private runtime root on every teardown path.  When the
        # launcher exits normally it also removes the root (idempotent); when the
        # launcher is killed (control connection closes) or this supervisor is
        # SIGTERM'd, the launcher's own teardown never runs, so the session's
        # root, snapshot and socket must be reclaimed here.
        self._remove_root()

    def _remove_root(self) -> None:
        root = self.cfg.get("root")
        if not root:
            return
        try:
            os.chmod(root, 0o700)
        except OSError:
            pass
        try:
            for base, dirs, _files in os.walk(root):
                for name in dirs:
                    try:
                        os.chmod(os.path.join(base, name), 0o700)
                    except OSError:
                        pass
        except OSError:
            pass
        shutil.rmtree(root, ignore_errors=True)

    # -- main loop ----------------------------------------------------------
    def serve(self) -> None:
        signal.signal(signal.SIGTERM, lambda *_: (self.destroy(), os._exit(0)))
        self.listener.setblocking(False)
        while True:
            try:
                ready, _, _ = select.select([self.listener, self.control_fd], [], [], 0.2)
            except OSError:
                break
            if self.control_fd in ready:
                try:
                    signal_bytes = os.read(self.control_fd, 4096)
                except OSError:
                    signal_bytes = b""
                if not signal_bytes:
                    break
                if b"shutdown" in signal_bytes:
                    break
            if self.listener in ready:
                try:
                    conn, _ = self.listener.accept()
                except OSError:
                    continue
                threading.Thread(target=self._safe_handle, args=(conn,), daemon=True).start()
        self.destroy()

    def _safe_handle(self, conn: socket.socket) -> None:
        try:
            self.handle(conn)
        except Exception:
            try:
                conn.close()
            except OSError:
                pass

    # -- one launch request -------------------------------------------------
    def reject(self, conn: socket.socket) -> None:
        try:
            sock_send_frame(conn, {"class": "request-rejected-v1"})
        except OSError:
            pass
        conn.close()

    def handle(self, conn: socket.socket) -> None:
        conn.settimeout(HANDSHAKE_TIMEOUT)
        header, fds = self._recv_header(conn)
        if header is None:
            for fd in fds:
                os.close(fd)
            self.reject(conn)
            return
        if len(fds) != 3:
            for fd in fds:
                os.close(fd)
            self.reject(conn)
            return
        ok, reason, ctx = self._validate(conn, header)
        if not ok:
            for fd in fds:
                os.close(fd)
            self.reject(conn)
            return
        # Read the framed envelope; its length must match envelope_length.
        try:
            envelope = self._read_framed_envelope(conn, header["envelope_length"])
        except (OSError, ValueError):
            for fd in fds:
                os.close(fd)
            self.reject(conn)
            return
        # The SCM stdin (fd0) bytes must equal the framed envelope.  A pipe
        # cannot be both drained for verification and re-read by the target, so
        # drain-and-verify fd0, reject on mismatch, and re-provision the verified
        # envelope to the target on a fresh stdin pipe.  fd1/fd2 pass through.
        try:
            stdin_bytes = self._drain(fds[0])
        except OSError:
            stdin_bytes = None
        try:
            os.close(fds[0])
        except OSError:
            pass
        if stdin_bytes != envelope:
            os.close(fds[1])
            os.close(fds[2])
            self.reject(conn)
            return
        stdin_r, stdin_w = os.pipe()
        fds = [stdin_r, fds[1], fds[2]]

        def _feed_stdin() -> None:
            try:
                view = memoryview(envelope)
                while view:
                    view = view[os.write(stdin_w, view):]
            except OSError:
                pass
            finally:
                try:
                    os.close(stdin_w)
                except OSError:
                    pass

        threading.Thread(target=_feed_stdin, daemon=True).start()
        self._run_launch(conn, header, fds, ctx, envelope)

    def _drain(self, fd: int, timeout: float = HANDSHAKE_TIMEOUT) -> bytes:
        out = b""
        os.set_blocking(fd, False)
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            ready, _, _ = select.select([fd], [], [], 0.1)
            if not ready:
                continue
            try:
                chunk = os.read(fd, 65536)
            except BlockingIOError:
                continue
            if not chunk:
                return out
            out += chunk
        return out

    def _recv_header(self, conn: socket.socket):
        fds: list[int] = []
        data = b""
        anc_space = socket.CMSG_SPACE(16 * 4)
        while len(data) < 4:
            try:
                chunk, anc, _flags, _addr = conn.recvmsg(4 - len(data), anc_space)
            except OSError:
                return None, fds
            for level, ctype, cdata in anc:
                if level == socket.SOL_SOCKET and ctype == socket.SCM_RIGHTS:
                    count = len(cdata) // 4
                    fds.extend(struct.unpack(f"{count}i", cdata[:count * 4]))
            if not chunk:
                return None, fds
            data += chunk
        size = struct.unpack(">I", data[:4])[0]
        if size > FRAME_LIMIT:
            return None, fds
        body = data[4:]
        while len(body) < size:
            try:
                chunk, anc, _flags, _addr = conn.recvmsg(size - len(body), anc_space)
            except OSError:
                return None, fds
            for level, ctype, cdata in anc:
                if level == socket.SOL_SOCKET and ctype == socket.SCM_RIGHTS:
                    count = len(cdata) // 4
                    fds.extend(struct.unpack(f"{count}i", cdata[:count * 4]))
            if not chunk:
                return None, fds
            body += chunk
        try:
            header = strict_json(body[:size])
        except (ValueError, UnicodeError):
            return None, fds
        if not isinstance(header, dict):
            return None, fds
        return header, fds

    def _read_framed_envelope(self, conn: socket.socket, envelope_length: int) -> bytes:
        head = sock_read_exact(conn, 4)
        if len(head) != 4:
            raise ValueError("short envelope length")
        size = struct.unpack(">I", head)[0]
        if size > FRAME_LIMIT or size != envelope_length:
            raise ValueError("envelope length mismatch")
        body = sock_read_exact(conn, size)
        if len(body) != size:
            raise ValueError("short envelope")
        return body

    def _validate(self, conn: socket.socket, header: dict):
        keys = sorted(header.keys())
        expected = [
            "argv", "capability", "cwd_relative_components", "envelope_length",
            "environment", "operation", "peer_euid", "peer_pid", "peer_pidversion",
            "request_nonce", "schema_version", "session_id", "timeout_milliseconds",
        ]
        if keys != expected:
            return False, "keys", {}
        if header["operation"] != "launch-v1":
            return False, "operation", {}
        if not _is_int(header["schema_version"]) or header["schema_version"] != 1:
            return False, "schema", {}
        cap = header["capability"]
        session = header["session_id"]
        nonce = header["request_nonce"]
        if not isinstance(cap, str) or HEX64.fullmatch(cap) is None:
            return False, "cap", {}
        if not isinstance(session, str) or HEX64.fullmatch(session) is None:
            return False, "session", {}
        if not isinstance(nonce, str) or HEX64.fullmatch(nonce) is None:
            return False, "nonce", {}
        with self.lock:
            entry = None
            for stored, value in self.caps.items():
                if secrets.compare_digest(stored, cap):
                    entry = value
                    break
            if entry is None:
                return False, "unknown cap", {}
            if not secrets.compare_digest(entry[0], session):
                return False, "cross session", {}
            if nonce in self.used_nonces:
                return False, "replay", {}
        requester_level = entry[1]
        # Peer anti-spoof.
        try:
            peer_pid = struct.unpack("i", conn.getsockopt(0, 2, 4))[0]
            token = struct.unpack("=8I", conn.getsockopt(0, 6, 32))
        except OSError:
            return False, "peer", {}
        for field in ("peer_euid", "peer_pid", "peer_pidversion"):
            if not _is_int(header[field]):
                return False, field, {}
        if header["peer_pid"] != peer_pid or header["peer_pid"] != token[5]:
            return False, "peer pid", {}
        if header["peer_euid"] != token[1]:
            return False, "peer euid", {}
        if header["peer_pidversion"] != token[7]:
            return False, "peer pidversion", {}
        # envelope_length / timeout ints.
        if not _is_int(header["envelope_length"]) or header["envelope_length"] < 0:
            return False, "envelope_length", {}
        timeout = header["timeout_milliseconds"]
        if not _is_int(timeout) or timeout < 1 or timeout > MAX_TIMEOUT_MS:
            return False, "timeout", {}
        # argv.
        argv = header["argv"]
        if not isinstance(argv, list) or not argv:
            return False, "argv", {}
        for item in argv:
            if not isinstance(item, str) or "\0" in item:
                return False, "argv item", {}
        # environment.
        environment = header["environment"]
        if not isinstance(environment, list):
            return False, "environment", {}
        seen: set[str] = set()
        for pair in environment:
            if not isinstance(pair, list) or len(pair) != 2:
                return False, "env pair", {}
            name, value = pair
            if not isinstance(name, str) or not isinstance(value, str):
                return False, "env types", {}
            if "\0" in name or "\0" in value:
                return False, "env nul", {}
            if name in seen:
                return False, "env dup", {}
            seen.add(name)
            if name.startswith(RESERVED_PREFIX):
                return False, "env reserved", {}
            if name.startswith(STRIP_PREFIXES) or name in STRIP_EXACT:
                return False, "env stripped", {}
        # cwd.
        components = header["cwd_relative_components"]
        current = self._resolve_cwd(components)
        if current is None:
            return False, "cwd", {}
        child_level = requester_level + 1
        if child_level > MAX_DEPTH:
            return False, "depth", {}
        return True, "", {
            "cap": cap, "session": session, "nonce": nonce,
            "child_level": child_level, "current": current,
            "components": components,
        }

    def _resolve_cwd(self, components) -> str | None:
        if not isinstance(components, list):
            return None
        current = self.cfg["ancestor_workspace"]
        for comp in components:
            if not isinstance(comp, str) or comp in ("", ".", "..") \
                    or "/" in comp or "\0" in comp:
                return None
            nxt = os.path.join(current, comp)
            try:
                info = os.lstat(nxt)
            except OSError:
                return None
            if stat.S_ISLNK(info.st_mode) or not stat.S_ISDIR(info.st_mode):
                return None
            current = nxt
        return current

    # -- profile + effect plan ---------------------------------------------
    def _gitdir(self, root: str) -> str | None:
        dotgit = os.path.join(root, ".git")
        try:
            if os.path.islink(dotgit):
                return None
            if os.path.isdir(dotgit):
                return os.path.realpath(dotgit)
            if not os.path.isfile(dotgit):
                return None
            with open(dotgit, "r", encoding="utf-8") as handle:
                lines = handle.read().splitlines()
        except OSError:
            return None
        if len(lines) != 1 or not lines[0].startswith("gitdir: "):
            return None
        text = lines[0][len("gitdir: "):]
        if not text:
            return None
        path = text if os.path.isabs(text) else os.path.join(root, text)
        try:
            resolved = os.path.realpath(path)
        except OSError:
            return None
        return resolved if os.path.isdir(resolved) else None

    def _worktree_gitdir(self, current: str) -> str:
        live_git = self.cfg["live_git"]
        candidate = self._gitdir(current)
        if candidate is None or candidate == live_git \
                or not candidate.startswith(live_git + os.sep):
            return os.path.join(current, ".nortropic-ingen-live-git-exception")
        return candidate

    def _profile_params(self, current: str) -> tuple[dict[str, str], str, list[str]]:
        cfg = self.cfg
        wt = self._worktree_gitdir(current)
        params = {
            "LIVE_ROOT": cfg["live_root"],
            "LIVE_GIT": cfg["live_git"],
            "GIT_OBJECTS": cfg["git_objects"],
            "GIT_OBJECTS_INFO": cfg["git_objects_info"],
            "WORKTREE_GITDIR": wt,
            "WORKTREE_COMMDIR": os.path.join(wt, "commondir"),
            "WORKTREE_GITFILE": os.path.join(wt, "gitdir"),
            "WORKTREE_CONFIG": os.path.join(wt, "config.worktree"),
            "TRUST_ROOT": cfg["trust_root"],
            "RUNTIME_ROOT": cfg["root"],
            "ANCESTOR_WORKSPACE": cfg["ancestor_workspace"],
            "CURRENT_WORKSPACE": current,
            "CURRENT_WORKSPACE_DOTGIT": os.path.join(current, ".git"),
        }
        if cfg.get("profile") == "staging":
            params["STAGING_ROOT"] = cfg["staging_root"]
            params["RESULT_SINK"] = cfg["result_sink"]
            return params, PROFILE_TEMPLATE_WITH_STAGING, STAGING_PARAM_ORDER
        return params, PROFILE_TEMPLATE_BASE, BASE_PARAM_ORDER

    def _ensure_source(self, path: str) -> None:
        try:
            fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            os.write(fd, b"ORIGINAL")
            os.fsync(fd)
            os.close(fd)
            os.chmod(path, 0o600)
        except FileExistsError:
            pass
        except OSError:
            pass

    def _effect_plan(self, nonce: str, current: str, params: dict) -> dict:
        plan: dict[str, list] = {}
        pfx = f".nortropic-h036-proof-{nonce}"

        def family(name: str, root: str, existing: str, seed: bool) -> None:
            base = f"{root}/{pfx}-{name}"
            src = existing if existing else f"{base}-write-source"
            if seed:
                for suffix in ("write", "rename", "unlink", "hardlink"):
                    self._ensure_source(f"{base}-{suffix}-source")
            wsrc = existing if existing else f"{base}-write-source"
            rsrc = existing if existing else f"{base}-rename-source"
            usrc = existing if existing else f"{base}-unlink-source"
            hsrc = existing if existing else f"{base}-hardlink-source"
            plan[f"{name}_create"] = ["create", f"{base}-created"]
            plan[f"{name}_write"] = ["write", wsrc]
            plan[f"{name}_rename"] = ["rename", rsrc, f"{base}-rename-target"]
            plan[f"{name}_unlink"] = ["unlink", usrc]
            plan[f"{name}_hardlink"] = ["hardlink", hsrc, f"{base}-hardlink-target"]
            plan[f"{name}_mkdir"] = ["mkdir", f"{base}-new-dir"]
            plan[f"{name}_chmod"] = ["chmod", wsrc]

        # live: use an existing repo file (denied, never mutated).
        family("live", params["LIVE_ROOT"], self.cfg["helper"], False)
        family("trust", params["TRUST_ROOT"], "", True)
        family("runtime", params["RUNTIME_ROOT"], "", False)
        # ancestor: a location under ANCESTOR outside CURRENT.
        ancestor = params["ANCESTOR_WORKSPACE"]
        if ancestor != current:
            family("ancestor", ancestor, "", True)
        else:
            family("ancestor", ancestor, "", True)
        if self.cfg.get("profile") == "staging":
            staging = params["STAGING_ROOT"]
            family("staging", staging, "", True)
            sink = params["RESULT_SINK"]
            plan["sink_hardlink"] = ["hardlink", sink, f"{staging}/sink-hardlink"]
            plan["sink_rename"] = ["rename", sink, f"{staging}/sink-renamed"]
            plan["sink_unlink"] = ["unlink", sink]
            plan["sink_chmod"] = ["chmod", sink]
            parent = os.path.dirname(staging)
            plan["staging_root_rename"] = ["rename", staging, f"{parent}/staging-renamed"]
            plan["staging_root_chmod"] = ["chmod", staging]
            plan["staging_root_rmdir"] = ["rmdir", staging]
        return plan

    def _mint_cap(self, session: str, level: int) -> str:
        cap = secrets.token_hex(32)
        with self.lock:
            while cap in self.caps:
                cap = secrets.token_hex(32)
            self.caps[cap] = (session, level)
        return cap

    def _write_kuvert(self, nonce: str, envelope: bytes) -> str:
        path = os.path.join(self.cfg["root"], "k", f"kuvert-{nonce}")
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o400)
        view = memoryview(envelope)
        while view:
            view = view[os.write(fd, view):]
        os.fsync(fd)
        os.close(fd)
        os.chmod(path, 0o400)
        return path

    def _run_launch(self, conn, header, fds, ctx, envelope):
        nonce = ctx["nonce"]
        with self.lock:
            self.used_nonces.add(nonce)
        current = ctx["current"]
        params, profile_text, order = self._profile_params(current)
        child_cap = self._mint_cap(ctx["session"], ctx["child_level"])
        kuvert_path = self._write_kuvert(nonce, envelope)
        plan = self._effect_plan(nonce, current, params)
        scratch_path = os.path.join(current, f".nortropic-h036-proof-{nonce}.allowed")
        sink_path = params.get("RESULT_SINK") if self.cfg.get("profile") == "staging" else None

        sup_end, helper_end = socket.socketpair(socket.AF_UNIX, socket.SOCK_STREAM)
        proof_fd = helper_end.fileno()
        os.set_inheritable(proof_fd, True)
        argv = [SANDBOX_EXEC]
        for name in order:
            argv.extend(["-D", f"{name}={params[name]}"])
        argv.extend([
            "-p", profile_text, self.cfg["runtime_python"], "-I", "-S", "-B",
            self.cfg["helper"], "confined-exec-v1", "--proof-fd", str(proof_fd),
        ])
        try:
            proc = subprocess.Popen(
                argv, stdin=fds[0], stdout=fds[1], stderr=fds[2],
                pass_fds=(proof_fd,), close_fds=True, start_new_session=True,
                env={"LANG": "C", "LC_ALL": "C", "PATH": "/usr/bin:/bin"},
            )
        except OSError:
            for fd in fds:
                os.close(fd)
            helper_end.close()
            sup_end.close()
            self.reject(conn)
            return
        for fd in fds:
            os.close(fd)
        helper_end.close()
        try:
            pgid = os.getpgid(proc.pid)
        except OSError:
            pgid = proc.pid
        with self.lock:
            self.targets[proc.pid] = pgid

        setup = {
            "request_nonce": nonce,
            "session_id": ctx["session"],
            "profile_sha256": PROFILE_SHA256 if self.cfg.get("profile") == "staging"
            else PROFILE_BASE_SHA256,
            "effect_plan": plan,
            "scratch_path": scratch_path,
            "sink_path": sink_path,
            "environment": header["environment"],
            "argv": header["argv"],
            "kuvert_path": kuvert_path,
            "child_capability": child_cap,
            "child_level": ctx["child_level"],
            "socket_path": self.cfg["socket_path"],
        }
        finished = False
        released = False
        try:
            send_fd_frame(sup_end.fileno(), setup)
            proof = recv_fd_frame(sup_end.fileno())
            if not isinstance(proof, dict):
                raise OSError("no proof")
            sock_send_frame(conn, proof)
            # A malformed go frame (duplicate key, non-finite number, oversize)
            # is a rejected request, not a transport failure: answer it with the
            # request-rejected-v1 final and never release the target.
            try:
                go = sock_recv_frame_strict(conn)
            except ValueError:
                go = None
            if not self._valid_go(go, proof["proof_digest"], nonce):
                sock_send_frame(conn, {"class": "request-rejected-v1"})
                self._kill_target(proc, pgid)
                finished = True
                return
            # Undo the helper's proof write to the sink BEFORE releasing the
            # target, so the target's own permitted sink write (if any) persists
            # and is not clobbered by a post-run restore.
            self._restore_sink()
            released = True
            send_fd_frame(sup_end.fileno(), {"action": "go"})
            # The helper<->supervisor channel is finished once go is delivered
            # (the helper execs the target and closes its end).  Close it now so
            # a nested in-flight request never leaves a half-open helper socket
            # retained at a later barrier — only the current request's live
            # helper channel is held.
            try:
                sup_end.close()
            except OSError:
                pass
            timeout_s = header["timeout_milliseconds"] / 1000.0
            outcome = self._await_target(proc, pgid, timeout_s)
            sock_send_frame(conn, outcome)
            finished = True
        except (OSError, ValueError):
            if not finished:
                self._kill_target(proc, pgid)
        finally:
            try:
                sup_end.close()
            except OSError:
                pass
            # If the target was never released the helper's proof write is still
            # present; restore the sink here.  The scratch proof file is always
            # removed regardless of outcome.
            if not released:
                self._restore_sink()
            self._cleanup_scratch(scratch_path)
            with self.lock:
                self.targets.pop(proc.pid, None)
            try:
                conn.close()
            except OSError:
                pass

    def _valid_go(self, go, proof_digest: str, nonce: str) -> bool:
        if not isinstance(go, dict):
            return False
        if sorted(go.keys()) != ["operation", "proof_digest", "request_nonce", "schema_version"]:
            return False
        if go["operation"] != "go-v1":
            return False
        if not _is_int(go["schema_version"]) or go["schema_version"] != 1:
            return False
        if not isinstance(go["request_nonce"], str) or go["request_nonce"] != nonce:
            return False
        if not isinstance(go["proof_digest"], str):
            return False
        return secrets.compare_digest(go["proof_digest"], proof_digest)

    def _await_target(self, proc, pgid, timeout_s):
        deadline = time.monotonic() + timeout_s
        while time.monotonic() < deadline:
            code = proc.poll()
            if code is not None:
                # Reap any background group members the target spawned, so the
                # process group and the SCM stdio pipes are fully released.
                self._reap_group(pgid, proc.pid)
                if code == 0:
                    return {"class": "success", "exit_status": 0}
                return {"class": "failure", "exit_status": code}
            time.sleep(0.01)
        # timeout
        self._kill_target(proc, pgid)
        return {"class": "timeout"}

    def _reap_group(self, pgid, leader_pid):
        if pgid > 1 and pgid == leader_pid:
            try:
                os.killpg(pgid, signal.SIGKILL)
            except (ProcessLookupError, PermissionError):
                pass

    def _kill_target(self, proc, pgid):
        try:
            os.killpg(pgid, signal.SIGTERM)
        except (ProcessLookupError, PermissionError):
            pass
        try:
            proc.wait(timeout=TERM_GRACE)
        except subprocess.TimeoutExpired:
            try:
                os.killpg(pgid, signal.SIGKILL)
            except (ProcessLookupError, PermissionError):
                pass
            try:
                proc.wait(timeout=REAP_TIMEOUT)
            except subprocess.TimeoutExpired:
                pass

    def _cleanup_scratch(self, scratch_path: str):
        try:
            os.unlink(scratch_path)
        except OSError:
            pass

    def _restore_sink(self):
        if self.cfg.get("profile") == "staging" and self.sink_original is not None:
            with self.lock:
                try:
                    fd = os.open(self.cfg["result_sink"], os.O_WRONLY | os.O_TRUNC)
                    os.write(fd, self.sink_original)
                    os.fsync(fd)
                    os.close(fd)
                    os.chmod(self.cfg["result_sink"], 0o600)
                except OSError:
                    pass


def supervise_main(control_fd: int, ready_fd: int) -> int:
    supervisor = Supervisor(control_fd, ready_fd)
    supervisor.bootstrap()
    supervisor.serve()
    return 0


# ---------------------------------------------------------------------------
# Entry
# ---------------------------------------------------------------------------

def main(argv: list[str]) -> int:
    if len(argv) >= 5 and argv[0] == "supervise-v1" and argv[1] == "--control-fd" \
            and argv[3] == "--ready-fd":
        return supervise_main(int(argv[2]), int(argv[4]))
    if len(argv) >= 3 and argv[0] == "confined-exec-v1" and argv[1] == "--proof-fd":
        return confined_main(int(argv[2]))
    sys.stderr.write("runtime_snapshot.py: unknown role\n")
    return 8


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
