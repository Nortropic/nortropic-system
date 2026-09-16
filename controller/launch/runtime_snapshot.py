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

The three Seatbelt profile texts are byte-exact and paths reach sandbox-exec only
through ``-D name=value`` parameters, never interpolated into the Scheme source.
"""

from __future__ import annotations

import errno
import ctypes
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
PROFILE_TEMPLATE_ATTEMPT_SUFFIX = "(deny file-write* (literal (param \"ATTEMPT_ROOT\")))\n(deny file-write*\n  (require-all\n    (subpath (param \"ATTEMPT_ROOT\"))\n    (require-not (subpath (param \"CURRENT_WORKSPACE\")))))\n"
PROFILE_TEMPLATE_WITH_STAGING = PROFILE_TEMPLATE_BASE + PROFILE_TEMPLATE_STAGING_SUFFIX
PROFILE_TEMPLATE_MANAGED = PROFILE_TEMPLATE_BASE + PROFILE_TEMPLATE_ATTEMPT_SUFFIX + PROFILE_TEMPLATE_STAGING_SUFFIX
PROFILE_BASE_SHA256 = hashlib.sha256(PROFILE_TEMPLATE_BASE.encode("utf-8")).hexdigest()
PROFILE_SHA256 = hashlib.sha256(PROFILE_TEMPLATE_WITH_STAGING.encode("utf-8")).hexdigest()
PROFILE_MANAGED_SHA256 = hashlib.sha256(PROFILE_TEMPLATE_MANAGED.encode("utf-8")).hexdigest()

BASE_PARAM_ORDER = [
    "LIVE_ROOT", "LIVE_GIT", "GIT_OBJECTS", "GIT_OBJECTS_INFO",
    "WORKTREE_GITDIR", "WORKTREE_COMMDIR", "WORKTREE_GITFILE",
    "WORKTREE_CONFIG", "TRUST_ROOT", "RUNTIME_ROOT",
    "ANCESTOR_WORKSPACE", "CURRENT_WORKSPACE", "CURRENT_WORKSPACE_DOTGIT",
]
STAGING_PARAM_ORDER = BASE_PARAM_ORDER + ["STAGING_ROOT", "RESULT_SINK"]
MANAGED_PARAM_ORDER = BASE_PARAM_ORDER + ["ATTEMPT_ROOT", "STAGING_ROOT", "RESULT_SINK"]

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
    "NORTROPIC_ATTEMPT_ROOT", "NORTROPIC_STAGING_ROOT", "NORTROPIC_RESULT_SINK", "__PYVENV_LAUNCHER__",
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
DENIED_ATTEMPT = [f"attempt_{op}" for op in ("create", "write", "rename", "unlink", "hardlink", "mkdir", "chmod")] + ["attempt_root_rename", "attempt_root_chmod", "attempt_root_rmdir"]

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


def sock_read_exact(conn: socket.socket, count: int, deadline=None) -> bytes:
    out = b""
    while len(out) < count:
        if deadline is not None: conn.settimeout(max(0, deadline - time.monotonic()))
        chunk = conn.recv(count - len(out))
        if not chunk:
            break
        out += chunk
    return out


def sock_recv_frame_strict(conn: socket.socket, timeout=None) -> object:
    deadline = time.monotonic() + timeout if timeout is not None else None; head = sock_read_exact(conn, 4, deadline)
    if len(head) != 4:
        raise ValueError("short frame length")
    size = struct.unpack(">I", head)[0]
    if size > FRAME_LIMIT:
        raise ValueError("frame too large")
    body = sock_read_exact(conn, size, deadline)
    if len(body) != size:
        raise ValueError("short frame body")
    return strict_json(body)


def rename_exclusive(source_fd: int, name: str, target_fd: int, target_name=None) -> None:
    try: call = ctypes.CDLL(None, use_errno=True).renameatx_np
    except (AttributeError, OSError) as exc: raise OSError(errno.ENOTSUP, "renameatx_np unavailable") from exc
    call.argtypes = [ctypes.c_int, ctypes.c_char_p, ctypes.c_int, ctypes.c_char_p, ctypes.c_uint]; call.restype = ctypes.c_int; ctypes.set_errno(0)
    if call(source_fd, os.fsencode(name), target_fd, os.fsencode(target_name or name), 0x4): raise OSError((code := ctypes.get_errno() or errno.EIO), os.strerror(code))
def close_owned(value) -> bool:
    try: os.close(value) if type(value) is int and value >= 0 else value.close() if value is not None and type(value) is not int else None; return True
    except (AttributeError, OSError): return False
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
    sink_fd, sink_path = setup.get("sink_fd"), setup.get("sink_path"); fd = -1
    if type(sink_fd) is int or sink_path:
        try:
            fd = sink_fd if type(sink_fd) is int else os.open(sink_path, os.O_WRONLY)
            if type(sink_fd) is int and ([(item := os.fstat(fd)).st_dev, item.st_ino] != setup.get("sink_identity") or not stat.S_ISREG(item.st_mode) or item.st_uid != os.geteuid() or stat.S_IMODE(item.st_mode) != 0o600 or item.st_nlink != 1): raise OSError(errno.EPERM, "unbound managed sink")
            if type(sink_fd) is int: os.lseek(fd, 0, os.SEEK_SET); os.ftruncate(fd, 0)
            view = memoryview(proof_bytes)
            while view:
                view = view[os.write(fd, view):]
            os.fsync(fd)
            effects["sink_write_sha256"] = hashlib.sha256(proof_bytes).hexdigest()
        except OSError as exc:
            effects["sink_write_sha256"] = f"errno:{exc.errno}"
        finally: os.close(fd) if fd >= 0 else None

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
        self.lock = threading.Lock(); self.sink_lock = threading.Lock(); self.destroy_lock = threading.Lock()
        self.targets: dict[int, int] = {}
        self.stopping = False
        self.destroyed = self.preserve_root = False
        self.cfg: dict = {}
        self.session_id = ""
        self.sink_original: bytes | None = None; self.cleanup_marker_identity = None; self.cleanup_owned = {}

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
        if cfg.get("result_sink") and cfg.get("profile") != "managed":
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
        with self.destroy_lock: self._destroy()
    def _destroy(self) -> None:
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
        with self.sink_lock: self._remove_root() if not self.preserve_root else None

    def _remove_root(self) -> None:
        root = self.cfg.get("root")
        if not root:
            return
        if self.cfg.get("profile") == "managed" and not self._cleanup_inventory():
            self.preserve_root = True; return
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

    def _cleanup_inventory(self) -> bool:
        origin_fd = marker_fd = -1; marker = ".nortropic-h038-cleanup-state"; result = closed = False
        try:
            flags = os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0); origin_fd = os.open(os.path.join(self.cfg["root"], "k"), flags); names = self._bounded_names(origin_fd)
            if set(names) != {marker, *self.cleanup_owned}: raise ValueError("cleanup inventory membership changed")
            marker_fd = os.open(marker, os.O_RDONLY | os.O_NOFOLLOW | getattr(os, "O_CLOEXEC", 0), dir_fd=origin_fd); before = os.fstat(marker_fd); value = os.read(marker_fd, 32); after = os.fstat(marker_fd); named = os.stat(marker, dir_fd=origin_fd, follow_symlinks=False)
            marker_ok = (before.st_dev, before.st_ino, before.st_mode, before.st_nlink, before.st_uid) == (after.st_dev, after.st_ino, after.st_mode, after.st_nlink, after.st_uid) == (named.st_dev, named.st_ino, named.st_mode, named.st_nlink, named.st_uid) and (before.st_dev, before.st_ino) == self.cleanup_marker_identity and stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o600 and before.st_nlink == 1 and before.st_uid == os.geteuid() and value == b"H038-SAFE"
            owned_ok = True
            for name, identity in self.cleanup_owned.items():
                item = os.stat(name, dir_fd=origin_fd, follow_symlinks=False); bound = (item.st_dev, item.st_ino) == identity and item.st_uid == os.geteuid()
                if stat.S_ISDIR(item.st_mode):
                    member_fd = os.open(name, flags, dir_fd=origin_fd)
                    try: opened = os.fstat(member_fd); bound = bound and (opened.st_dev, opened.st_ino, opened.st_mode) == (item.st_dev, item.st_ino, item.st_mode) and stat.S_IMODE(item.st_mode) == 0o700 and not self._bounded_names(member_fd, 0)
                    finally: bound = close_owned(member_fd) and bound
                else: bound = bound and stat.S_ISREG(item.st_mode) and stat.S_IMODE(item.st_mode) in (0o400, 0o600) and item.st_nlink == 1
                owned_ok = bound and owned_ok
            result = marker_ok and owned_ok
        except (OSError, ValueError): result = False
        finally:
            marker_owned, marker_fd = marker_fd, -1; origin_owned, origin_fd = origin_fd, -1
            closed = all((close_owned(marker_owned), close_owned(origin_owned))); self.preserve_root = self.preserve_root or not closed
        return result and closed

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
        self.destroy(); os.write(self.control_fd, b"P" if self.preserve_root else b"C")

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
        close_owned(conn)

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
        try: current_info = os.lstat(current)
        except OSError: return False, "cwd identity", {}
        if not stat.S_ISDIR(current_info.st_mode) or stat.S_ISLNK(current_info.st_mode): return False, "cwd identity", {}
        child_level = requester_level + 1
        if child_level > MAX_DEPTH:
            return False, "depth", {}
        return True, "", {
            "cap": cap, "session": session, "nonce": nonce,
            "child_level": child_level, "current": current,
            "components": components, "current_identity": [current_info.st_dev, current_info.st_ino],
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

    def _managed_object(self, path: str, directory: bool, identity: list[int], mode=None) -> None:
        if not isinstance(path, str) or not os.path.isabs(path) or os.path.normpath(path) != path or os.path.realpath(path) != path or not isinstance(identity, list) or len(identity) != 2 or not all(type(value) is int for value in identity): raise ValueError("malformed managed identity")
        dflags = os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0); fd = -1
        try:
            fd = os.open(os.sep, dflags); names = path.split(os.sep)[1:]
            for index, component in enumerate(names):
                before = os.stat(component, dir_fd=fd, follow_symlinks=False); want = directory or index < len(names) - 1
                child = os.open(component, dflags if want else os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0), dir_fd=fd); parent_fd, fd = fd, child
                if not close_owned(parent_fd): raise OSError(errno.EIO, "managed parent close failed")
                if (before.st_dev, before.st_ino, before.st_mode) != ((opened := os.fstat(fd)).st_dev, opened.st_ino, opened.st_mode) or (want and not stat.S_ISDIR(opened.st_mode)): raise ValueError("managed ancestor changed")
            if (opened := os.fstat(fd)).st_uid != os.geteuid() or [opened.st_dev, opened.st_ino] != identity or (directory and not stat.S_ISDIR(opened.st_mode)) or (not directory and (not stat.S_ISREG(opened.st_mode) or opened.st_nlink != 1)) or (mode is not None and stat.S_IMODE(opened.st_mode) != mode): raise ValueError("managed identity changed")
        finally:
            if not close_owned(fd): raise OSError(errno.EIO, "managed object close failed")
    def _bound_managed(self, current: str, current_identity=None) -> dict[str, str]:
        cfg, identities = self.cfg, self.cfg.get("managed_identities"); source = cfg.get("trust_proof_source")
        paths = {"attempt": cfg.get("attempt_root"), "workspace": cfg.get("ancestor_workspace"), "trust": cfg.get("trust_root"), "staging": cfg.get("staging_root"), "sink": cfg.get("result_sink"), "trust_source": source[0] if isinstance(source, list) and source else None}
        if not isinstance(identities, dict) or set(paths) != set(identities): raise ValueError("unbound managed identity bundle")
        if not isinstance(source, list) or len(source) != 3 or source[1:] != identities["trust_source"]: raise ValueError("unbound trust proof source")
        for name, path in paths.items(): self._managed_object(path, name not in {"sink", "trust_source"}, identities.get(name), 0o700 if name == "attempt" else 0o600 if name == "sink" else None)
        if current_identity is not None: self._managed_object(current, True, current_identity)
        if not current.startswith(paths["attempt"] + os.sep) or not paths["trust_source"].startswith(paths["trust"] + os.sep) or os.path.realpath(current) != current: raise ValueError("managed topology changed")
        return paths
    def _open_managed_sink(self, flags: int, current: str, current_identity=None) -> int:
        paths, identities = self._bound_managed(current, current_identity), self.cfg["managed_identities"]
        dflags = os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0); directory_fd = sink_fd = -1
        try:
            directory_fd = os.open(paths["staging"], dflags); directory = os.fstat(directory_fd)
            if [directory.st_dev, directory.st_ino] != identities["staging"]: raise ValueError("managed staging changed")
            name = os.path.basename(paths["sink"]); before = os.stat(name, dir_fd=directory_fd, follow_symlinks=False)
            sink_fd = os.open(name, flags | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0), dir_fd=directory_fd)
            if ((before.st_dev, before.st_ino, before.st_mode) != ((opened := os.fstat(sink_fd)).st_dev, opened.st_ino, opened.st_mode) or [opened.st_dev, opened.st_ino] != identities["sink"] or not stat.S_ISREG(opened.st_mode) or opened.st_uid != os.geteuid() or stat.S_IMODE(opened.st_mode) != 0o600 or opened.st_nlink != 1): raise ValueError("managed sink changed")
            return sink_fd
        except (OSError, ValueError): doomed, sink_fd = sink_fd, -1; close_owned(doomed); raise
        finally:
            if not close_owned(directory_fd): doomed, sink_fd = sink_fd, -1; close_owned(doomed); raise OSError(errno.EIO, "managed staging close failed")
    def _profile_params(self, current: str, current_identity=None) -> tuple[dict[str, str], str, list[str]]:
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
        if cfg.get("profile") == "managed": params.update({"ATTEMPT_ROOT": self._bound_managed(current, current_identity)["attempt"], "STAGING_ROOT": cfg["staging_root"], "RESULT_SINK": cfg["result_sink"]}); return params, PROFILE_TEMPLATE_MANAGED, MANAGED_PARAM_ORDER
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

    def _neutral_attempt(self, request_nonce: str, attempt: str, state: dict):
        flags = os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0); state.update({"attempt_fd": -1, "origin_fd": -1, "directory_fd": -1, "directory_identity": None, "directory_created": False, "source_identities": {}, "pending_source_fd": -1, "unbound": True, "complete": False, "published": False, "public_name": None}); attempt_fd = os.open(attempt, flags); state["attempt_fd"] = attempt_fd; state["unbound"] = False; state["unbound"] = True; origin_fd = os.open(os.path.join(self.cfg["root"], "k"), flags); state["origin_fd"] = origin_fd; state["unbound"] = False
        while (token := secrets.token_hex(32)) == request_nonce: pass
        name = ".nortropic-h038-proof-" + token; state["public_name"] = name; opened_attempt, opened_origin = os.fstat(attempt_fd), os.fstat(origin_fd)
        if [opened_attempt.st_dev, opened_attempt.st_ino] != self.cfg["managed_identities"]["attempt"] or not stat.S_ISDIR(opened_origin.st_mode) or opened_origin.st_uid != os.geteuid() or stat.S_IMODE(opened_origin.st_mode) != 0o700 or opened_attempt.st_dev != opened_origin.st_dev: raise ValueError("unsafe managed proof parents")
        state["directory_created"] = state["unbound"] = True; os.mkdir(name, 0o700, dir_fd=origin_fd); created = os.stat(name, dir_fd=origin_fd, follow_symlinks=False); state["directory_identity"] = (created.st_dev, created.st_ino); state["unbound"] = False; state["unbound"] = True; directory_fd = os.open(name, flags, dir_fd=origin_fd); state["directory_fd"] = directory_fd; state["unbound"] = False; directory = os.fstat(directory_fd)
        if (directory.st_dev, directory.st_ino) != state["directory_identity"] or not stat.S_ISDIR(directory.st_mode) or directory.st_uid != os.geteuid() or stat.S_IMODE(directory.st_mode) != 0o700: raise ValueError("unsafe managed proof directory")
        for source in ("write-source", "rename-source", "unlink-source", "hardlink-source"):
            state["unbound"] = True; fd = os.open(source, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | getattr(os, "O_CLOEXEC", 0), 0o600, dir_fd=directory_fd); state["pending_source_fd"] = fd; item = os.fstat(fd); state["source_identities"][source] = (item.st_dev, item.st_ino); state["unbound"] = False
            if not stat.S_ISREG(item.st_mode) or item.st_uid != os.geteuid() or stat.S_IMODE(item.st_mode) != 0o600 or item.st_nlink != 1: raise ValueError("unsafe managed proof source")
            os.write(fd, b"ORIGINAL"); os.fsync(fd); state["pending_source_fd"] = -1
            if not close_owned(fd): state["unbound"] = True; raise OSError(errno.EIO, "managed source close failed")
        if len(set(state["source_identities"].values())) != 4 or set(self._bounded_names(directory_fd, 4)) != set(state["source_identities"]): raise ValueError("managed proof sources alias")
        for source, identity in state["source_identities"].items():
            before = os.stat(source, dir_fd=directory_fd, follow_symlinks=False); fd = os.open(source, os.O_RDONLY | os.O_NOFOLLOW | getattr(os, "O_CLOEXEC", 0), dir_fd=directory_fd); state["pending_source_fd"] = fd; opened = os.fstat(fd); content = os.read(fd, 9)
            state["pending_source_fd"] = -1
            if not close_owned(fd): raise OSError(errno.EIO, "managed source close failed")
            if (before.st_dev, before.st_ino, before.st_mode) != (opened.st_dev, opened.st_ino, opened.st_mode) or (opened.st_dev, opened.st_ino) != identity or not stat.S_ISREG(opened.st_mode) or opened.st_uid != os.geteuid() or stat.S_IMODE(opened.st_mode) != 0o600 or opened.st_nlink != 1 or content != b"ORIGINAL": raise ValueError("managed proof source changed")
        named, opened = os.stat(name, dir_fd=origin_fd, follow_symlinks=False), os.fstat(directory_fd)
        if (named.st_dev, named.st_ino, named.st_mode) != (opened.st_dev, opened.st_ino, opened.st_mode) or (opened.st_dev, opened.st_ino) != state["directory_identity"]: raise ValueError("managed proof directory changed")
        state["complete"] = True; rename_exclusive(origin_fd, name, attempt_fd); published = os.stat(name, dir_fd=attempt_fd, follow_symlinks=False)
        if (published.st_dev, published.st_ino, published.st_mode) != (opened.st_dev, opened.st_ino, opened.st_mode): raise ValueError("managed proof publication changed")
        state["published"] = True; return os.path.join(attempt, name)
    def _bounded_names(self, directory_fd, limit=4096):
        with os.scandir(directory_fd) as entries: names = [entry.name for _index, entry in zip(range(limit + 1), entries)]
        if len(names) > limit or sum(len(os.fsencode(name)) for name in names) > FRAME_LIMIT: raise ValueError("cleanup member budget exceeded")
        return names
    def _write_marker(self, marker_fd, value, origin_fd, marker, identity) -> bool:
        try: os.lseek(marker_fd, 0, os.SEEK_SET); os.ftruncate(marker_fd, 0); written = os.write(marker_fd, value); os.fsync(marker_fd); opened = os.fstat(marker_fd); named = os.stat(marker, dir_fd=origin_fd, follow_symlinks=False); return written == len(value) and (opened.st_dev, opened.st_ino) == (named.st_dev, named.st_ino) == identity and stat.S_ISREG(opened.st_mode) and stat.S_IMODE(opened.st_mode) == 0o600 and opened.st_nlink == 1 and opened.st_uid == os.geteuid()
        except OSError: return False
    def _move_identity(self, source_fd, name, target_fd, target_name, identity) -> bool:
        try: rename_exclusive(source_fd, name, target_fd, target_name)
        except OSError: pass
        try: moved = os.stat(target_name, dir_fd=target_fd, follow_symlinks=False); return (moved.st_dev, moved.st_ino) == identity
        except OSError: return False
    def _park_identity(self, parents, identity, origin_fd):
        for _ in range(8):
            for parent_fd, entry in ((fd, entry) for fd in parents for entry in self._bounded_names(fd)):
                    try: item = os.stat(entry, dir_fd=parent_fd, follow_symlinks=False)
                    except OSError: continue
                    if (item.st_dev, item.st_ino) != identity: continue
                    target = ".nortropic-h038-quarantine-" + secrets.token_hex(32)
                    if self._move_identity(parent_fd, entry, origin_fd, target, identity): return target, True
                    try: moved = os.stat(target, dir_fd=origin_fd, follow_symlinks=False)
                    except OSError: continue
                    wrong = (moved.st_dev, moved.st_ino)
                    if not self._move_identity(origin_fd, target, parent_fd, entry, wrong): self.preserve_root = True; return None, False
        return None, False
    def _cleanup_neutral(self, state) -> bool:
        if not isinstance(state, dict): return True
        attempt_fd, origin_fd, directory_fd, pending_fd = state.get("attempt_fd", -1), state.get("origin_fd", -1), state.get("directory_fd", -1), state.get("pending_source_fd", -1); sources, directory_identity = state.get("source_identities", {}), state.get("directory_identity"); created = state.get("directory_created", False)
        identities = set(sources.values()); expected = {"write-source", "rename-source", "unlink-source", "hardlink-source"}; ok = not state.get("unbound", False); found, seen, private_name = not created, set(), None
        if pending_fd >= 0:
            try: item = os.fstat(pending_fd); identities.add((item.st_dev, item.st_ino))
            except OSError: ok = False
            ok = close_owned(pending_fd) and ok
        restorable = state.get("published") is True and state.get("complete") is True and set(sources) == expected and len(identities) == 4; restored = safe = False; marker_fd = -1; marker = ".nortropic-h038-cleanup-state"
        try:
            if created and directory_identity is not None and min(attempt_fd, origin_fd, directory_fd) >= 0:
                marker_flags = os.O_RDWR | os.O_NOFOLLOW | getattr(os, "O_CLOEXEC", 0) | (os.O_CREAT | os.O_EXCL if self.cleanup_marker_identity is None else 0); marker_fd = os.open(marker, marker_flags, 0o600, dir_fd=origin_fd); marker_item = os.fstat(marker_fd); marker_identity = (marker_item.st_dev, marker_item.st_ino)
                if self.cleanup_marker_identity is None: self.cleanup_marker_identity = marker_identity
                if marker_identity != self.cleanup_marker_identity or not stat.S_ISREG(marker_item.st_mode) or marker_item.st_uid != os.geteuid() or stat.S_IMODE(marker_item.st_mode) != 0o600 or marker_item.st_nlink != 1 or not self._write_marker(marker_fd, b"H038-UNSAFE", origin_fd, marker, marker_identity): raise ValueError("unsafe cleanup marker")
                private_name, moved_ok = self._park_identity((origin_fd, attempt_fd), directory_identity, origin_fd); found = private_name is not None; ok = moved_ok and ok
            if private_name is not None:
                held, moved = os.fstat(directory_fd), os.stat(private_name, dir_fd=origin_fd, follow_symlinks=False); bound = (held.st_dev, held.st_ino) == directory_identity == (moved.st_dev, moved.st_ino) and stat.S_ISDIR(moved.st_mode) and moved.st_uid == os.geteuid() and stat.S_IMODE(moved.st_mode) == 0o700; self.cleanup_owned.update({private_name: directory_identity} if bound else {}); ok = bound and ok
                if bound:
                    for identity in identities:
                        parked, moved_ok = self._park_identity((directory_fd,), identity, origin_fd)
                        if parked is None: continue
                        item = os.stat(parked, dir_fd=origin_fd, follow_symlinks=False); source_bound = moved_ok and (item.st_dev, item.st_ino) == identity and stat.S_ISREG(item.st_mode) and item.st_uid == os.geteuid() and stat.S_IMODE(item.st_mode) == 0o600 and item.st_nlink == 1; self.cleanup_owned.update({parked: identity} if source_bound else {}); ok = source_bound and ok; seen.add(identity)
                    remaining = self._bounded_names(directory_fd); ok = all(((item := os.stat(entry, dir_fd=directory_fd, follow_symlinks=False)).st_dev, item.st_ino) not in identities for entry in remaining) and ok
                    if not remaining: restored = True
                    elif not (restorable and seen == identities): ok = False
        except (OSError, ValueError): ok = False
        finally:
            if private_name is not None and restorable and not restored: restored = self._move_identity(origin_fd, private_name, attempt_fd, state.get("public_name"), directory_identity); self.cleanup_owned.pop(private_name, None) if restored else None
            try: private_names = self._bounded_names(origin_fd); current_marker = os.stat(marker, dir_fd=origin_fd, follow_symlinks=False); safe = ok and found and seen == identities and (private_name is None or restored) and set(private_names) == {marker, *self.cleanup_owned} and all(((item := os.stat(name, dir_fd=origin_fd, follow_symlinks=False)).st_dev, item.st_ino) == identity for name, identity in self.cleanup_owned.items()) and (current_marker.st_dev, current_marker.st_ino) == self.cleanup_marker_identity and not self.preserve_root
            except OSError: safe = False
            if safe and not self._write_marker(marker_fd, b"H038-SAFE", origin_fd, marker, self.cleanup_marker_identity): safe = False
            marker_owned, marker_fd = marker_fd, -1; marker_closed = close_owned(marker_owned); self.preserve_root = self.preserve_root or not safe or not marker_closed
            for descriptor in (directory_fd, origin_fd, attempt_fd): ok = close_owned(descriptor) and ok
            state["attempt_fd"] = state["origin_fd"] = state["directory_fd"] = state["pending_source_fd"] = -1
        return ok and found and seen == identities and safe and marker_closed
    def _effect_plan(self, nonce: str, current: str, params: dict, neutral_path: str | None = None) -> dict:
        plan: dict[str, list] = {}
        pfx = f".nortropic-h036-proof-{nonce}"

        def family(name: str, root: str, existing: str, seed: bool) -> None:
            base = f"{root}/{pfx}-{name}"
            if seed:
                for suffix in ("write", "rename", "unlink", "hardlink"):
                    self._ensure_source(f"{base}-{suffix}-source")
            wsrc, rsrc = (existing, existing) if existing else (f"{base}-write-source", f"{base}-rename-source"); usrc, hsrc = (existing, existing) if existing else (f"{base}-unlink-source", f"{base}-hardlink-source")
            plan[f"{name}_create"] = ["create", f"{base}-created"]; plan[f"{name}_write"] = ["write", wsrc]; plan[f"{name}_rename"] = ["rename", rsrc, f"{base}-rename-target"]
            plan[f"{name}_unlink"] = ["unlink", usrc]; plan[f"{name}_hardlink"] = ["hardlink", hsrc, f"{base}-hardlink-target"]
            plan[f"{name}_mkdir"] = ["mkdir", f"{base}-new-dir"]; plan[f"{name}_chmod"] = ["chmod", wsrc]

        # live: use an existing repo file (denied, never mutated).
        family("live", params["LIVE_ROOT"], self.cfg["helper"], False)
        trust_source = self._bound_managed(current)["trust_source"] if self.cfg.get("profile") == "managed" else None
        family("trust", params["TRUST_ROOT"], trust_source or "", not trust_source)
        family("runtime", params["RUNTIME_ROOT"], "", False)
        # ancestor: a location under ANCESTOR outside CURRENT.
        ancestor = params["ANCESTOR_WORKSPACE"]
        if ancestor != current:
            family("ancestor", ancestor, "", True)
        else:
            family("ancestor", ancestor, "", True)
        if self.cfg.get("profile") in ("staging", "managed"):
            staging = params["STAGING_ROOT"]
            family("staging", staging, "", True)
            sink = params["RESULT_SINK"]
            plan["sink_hardlink"] = ["hardlink", sink, f"{staging}/sink-hardlink"]; plan["sink_rename"] = ["rename", sink, f"{staging}/sink-renamed"]
            plan["sink_unlink"] = ["unlink", sink]; plan["sink_chmod"] = ["chmod", sink]
            parent = os.path.dirname(staging)
            plan["staging_root_rename"] = ["rename", staging, f"{parent}/staging-renamed"]; plan["staging_root_chmod"] = ["chmod", staging]; plan["staging_root_rmdir"] = ["rmdir", staging]
            if self.cfg.get("profile") == "managed" and neutral_path is None: raise ValueError("managed proof directory absent")
        if self.cfg.get("profile") == "managed": plan.update({"attempt_create": ["create", f"{neutral_path}/created"], "attempt_write": ["write", f"{neutral_path}/write-source"], "attempt_rename": ["rename", f"{neutral_path}/rename-source", f"{neutral_path}/rename-target"], "attempt_unlink": ["unlink", f"{neutral_path}/unlink-source"], "attempt_hardlink": ["hardlink", f"{neutral_path}/hardlink-source", f"{neutral_path}/hardlink-target"], "attempt_mkdir": ["mkdir", f"{neutral_path}/new-dir"], "attempt_chmod": ["chmod", f"{neutral_path}/write-source"], "attempt_root_rename": ["rename", params["ATTEMPT_ROOT"], params["ATTEMPT_ROOT"] + "-renamed"], "attempt_root_chmod": ["chmod", params["ATTEMPT_ROOT"]], "attempt_root_rmdir": ["rmdir", params["ATTEMPT_ROOT"]]})
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
        fd = -1
        try:
            fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | getattr(os, "O_CLOEXEC", 0), 0o400); view = memoryview(envelope)
            while view: view = view[os.write(fd, view):]
            os.fsync(fd); opened = os.fstat(fd); named = os.stat(path, follow_symlinks=False); identity = (opened.st_dev, opened.st_ino)
            if identity != (named.st_dev, named.st_ino) or not stat.S_ISREG(opened.st_mode) or opened.st_uid != os.geteuid() or stat.S_IMODE(opened.st_mode) != 0o400 or opened.st_nlink != 1: raise OSError(errno.EPERM, "unbound kuvert")
        finally:
            owned, fd = fd, -1
            if not close_owned(owned): raise OSError(errno.EIO, "kuvert close failed")
        return path, identity

    def _run_launch(self, conn, header, fds, ctx, envelope):
        nonce = ctx["nonce"]
        with self.lock: self.used_nonces.add(nonce)
        current, current_identity = ctx["current"], ctx["current_identity"]; managed = self.cfg.get("profile") == "managed"; neutral_state = {} if managed else None
        sink_original, sink_locked, sink_fd, sup_end, helper_end = None, False, -1, None, None
        def abort_request():
            nonlocal fds, neutral_state, sink_locked, sink_fd, sup_end, helper_end
            parent_fds, fds = fds, []; sink, sink_fd = sink_fd, -1; helper, helper_end = helper_end, None; channel, sup_end = sup_end, None; neutral, neutral_state = neutral_state, None; owned = sink_locked
            closed = all([close_owned(fd) for fd in parent_fds] + [close_owned(helper), close_owned(channel), close_owned(sink)]); clean = self._cleanup_neutral(neutral)
            if sink_locked: self.sink_lock.release(); sink_locked = False
            self.reject(conn); (owned or not closed or not clean) and self.destroy()
        try:
            if managed and not self.sink_lock.acquire(timeout=HANDSHAKE_TIMEOUT): raise OSError(errno.ETIMEDOUT, "managed sink busy")
            if managed: sink_locked = True
            params, profile_text, order = self._profile_params(current, current_identity); neutral_path = None
            if managed:
                neutral_path = self._neutral_attempt(nonce, params["ATTEMPT_ROOT"], neutral_state); sink_fd = self._open_managed_sink(os.O_RDWR, current, current_identity)
                if (sink_size := os.fstat(sink_fd).st_size) > FRAME_LIMIT: raise ValueError("managed sink too large")
                if len(sink_original := os.pread(sink_fd, sink_size, 0)) != sink_size: raise OSError(errno.EIO, "short managed sink read")
            child_cap = self._mint_cap(ctx["session"], ctx["child_level"]); kuvert_path, kuvert_identity = self._write_kuvert(nonce, envelope); kuvert_item = os.stat(kuvert_path, follow_symlinks=False)
            if (kuvert_item.st_dev, kuvert_item.st_ino) != kuvert_identity: raise ValueError("kuvert path changed")
            self.cleanup_owned.update({os.path.basename(kuvert_path): kuvert_identity} if managed else {}); plan = self._effect_plan(nonce, current, params, neutral_path)
            sup_end, helper_end = socket.socketpair(socket.AF_UNIX, socket.SOCK_STREAM); proof_fd = helper_end.fileno(); os.set_inheritable(proof_fd, True); sup_end.settimeout(HANDSHAKE_TIMEOUT)
        except (OSError, ValueError): abort_request(); return
        scratch_path = os.path.join(current, f".nortropic-h036-proof-{nonce}.allowed"); sink_path = params.get("RESULT_SINK") if self.cfg.get("profile") in ("staging", "managed") else None
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
                pass_fds=(proof_fd, sink_fd) if managed else (proof_fd,), close_fds=True, start_new_session=True,
                env={"LANG": "C", "LC_ALL": "C", "PATH": "/usr/bin:/bin"},
            )
        except (OSError, ValueError): abort_request(); return
        try: pgid = os.getpgid(proc.pid)
        except OSError: pgid = proc.pid
        with self.lock: self.targets[proc.pid] = pgid

        setup = {
            "request_nonce": nonce,
            "session_id": ctx["session"],
            "profile_sha256": PROFILE_MANAGED_SHA256 if managed else PROFILE_SHA256 if self.cfg.get("profile") == "staging" else PROFILE_BASE_SHA256,
            "effect_plan": plan,
            "scratch_path": scratch_path,
            "sink_path": None if managed else sink_path, "sink_fd": sink_fd if managed else None, "sink_identity": self.cfg["managed_identities"]["sink"] if managed else None,
            "environment": header["environment"],
            "argv": header["argv"],
            "kuvert_path": kuvert_path,
            "child_capability": child_cap,
            "child_level": ctx["child_level"],
            "socket_path": self.cfg["socket_path"],
        }
        parent_fds, fds = fds, []; helper, helper_end = helper_end, None; parent_closed = all([close_owned(fd) for fd in parent_fds] + [close_owned(helper)])
        finished = released = faulted = False
        try:
            if not parent_closed: raise OSError(errno.EIO, "parent descriptor close failed")
            sock_send_frame(sup_end, setup); proof = sock_recv_frame_strict(sup_end, HANDSHAKE_TIMEOUT)
            if not isinstance(proof, dict): raise OSError("no proof")
            if managed and not close_owned(self._open_managed_sink(os.O_RDONLY, current, current_identity)): raise OSError("managed sink check close failed")
            sock_send_frame(conn, proof)
            try: go = sock_recv_frame_strict(conn, HANDSHAKE_TIMEOUT)
            except (OSError, ValueError): go = None
            if not self._valid_go(go, proof["proof_digest"], nonce):
                sock_send_frame(conn, {"class": "request-rejected-v1"}); self._kill_target(proc, pgid); finished = True; return
            if managed:
                checked = close_owned(self._open_managed_sink(os.O_RDONLY, current, current_identity)); restored = self._restore_sink(sink_original, sink_fd); clean = self._cleanup_neutral(neutral_state); neutral_state = None
                sink, sink_fd = sink_fd, -1; closed = close_owned(sink); self.sink_lock.release(); sink_locked = False
                if not all((checked, restored, clean, closed)): raise OSError("managed pre-release cleanup failed")
            elif self.cfg.get("profile") == "staging": self._restore_sink()
            released = True; send_fd_frame(sup_end.fileno(), {"action": "go"})
            channel, sup_end = sup_end, None
            if not close_owned(channel): raise OSError(errno.EIO, "proof channel close failed")
            outcome = self._await_target(proc, pgid, header["timeout_milliseconds"] / 1000.0)
            sock_send_frame(conn, outcome); finished = True
        except (OSError, ValueError):
            faulted = True; self._kill_target(proc, pgid) if not finished else None
        finally:
            channel, sup_end = sup_end, None; channel_closed = close_owned(channel)
            restored = released or self._restore_sink(sink_original, sink_fd); sink, sink_fd = sink_fd, -1; closed = close_owned(sink)
            self._cleanup_scratch(scratch_path); neutral, neutral_state = neutral_state, None; cleaned = self._cleanup_neutral(neutral)
            if sink_locked: self.sink_lock.release(); sink_locked = False
            connection_closed = close_owned(conn); fatal = faulted or not all((parent_closed, channel_closed, restored, closed, cleaned, connection_closed)); fatal and self.destroy()
            with self.lock: self.targets.pop(proc.pid, None)

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

    def _restore_sink(self, original=None, sink_fd=-1):
        if (profile := self.cfg.get("profile")) == "managed" and original is not None:
            try:
                if sink_fd < 0: return False
                opened = os.fstat(sink_fd)
                if [opened.st_dev, opened.st_ino] != self.cfg["managed_identities"]["sink"] or not stat.S_ISREG(opened.st_mode) or opened.st_uid != os.geteuid() or stat.S_IMODE(opened.st_mode) != 0o600 or opened.st_nlink != 1: return False
                os.lseek(sink_fd, 0, os.SEEK_SET); os.ftruncate(sink_fd, 0); view = memoryview(original)
                while view: view = view[os.write(sink_fd, view):]
                os.fsync(sink_fd); return True
            except (OSError, ValueError): return False
        if profile == "staging" and self.sink_original is not None:
            with self.lock:
                try:
                    fd = os.open(self.cfg["result_sink"], os.O_WRONLY | os.O_TRUNC)
                    os.write(fd, self.sink_original)
                    os.fsync(fd)
                    os.close(fd)
                    os.chmod(self.cfg["result_sink"], 0o600)
                except OSError:
                    pass
        return True


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
