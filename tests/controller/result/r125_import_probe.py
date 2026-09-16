#!/usr/bin/env python3
"""Target the R125 dependency/controller definition-time ticket."""

from __future__ import annotations

import argparse  # noqa: F401
import ast  # noqa: F401
import base64  # noqa: F401
import dataclasses  # noqa: F401
import datetime  # noqa: F401
import fcntl  # noqa: F401
import fnmatch  # noqa: F401
import hashlib  # noqa: F401
import importlib.util
import inspect  # noqa: F401
import io  # noqa: F401
import json  # noqa: F401
import mmap  # noqa: F401
import os
from pathlib import Path
import re  # noqa: F401
import secrets
import selectors  # noqa: F401
import shutil  # noqa: F401
import signal  # noqa: F401
import socket  # noqa: F401
import stat  # noqa: F401
import subprocess
import sys
import tempfile
import threading  # noqa: F401
import time  # noqa: F401
import types
import typing  # noqa: F401
import unicodedata  # noqa: F401


SELECTED = {
    "open", "os.chmod", "os.mkdir", "os.remove", "os.rmdir", "os.rename",
    "os.replace", "os.link", "os.symlink", "os.listdir", "os.scandir",
    "subprocess.Popen", "os.system", "os.posix_spawn", "os.fork",
    "os.forkpty", "pty.spawn",
}
OBSERVER = {"events": None}


class DefinitionEffect(RuntimeError):
    pass


def audit(event, _args):
    target = OBSERVER["events"]
    if target is not None and (
            event in SELECTED
            or event.startswith("os.exec")
            or event.startswith("os.spawn")):
        target.append((event, repr(_args)))
        raise DefinitionEffect(event)


def observed_exec(source, namespace, filename):
    code = compile(source, filename, "exec")
    events = []
    rejected = None
    OBSERVER["events"] = events
    try:
        exec(code, namespace)
    except DefinitionEffect as exc:
        rejected = str(exc)
    finally:
        OBSERVER["events"] = None
    return tuple(events), rejected


def install_namespace(name, directory):
    package = types.ModuleType(name)
    package.__file__ = None
    package.__package__ = name
    package.__path__ = [str(directory)]
    package.__spec__ = importlib.util.spec_from_loader(
        name, loader=None, is_package=True)
    sys.modules[name] = package
    if "." in name:
        parent, child = name.rsplit(".", 1)
        setattr(sys.modules[parent], child, package)
    return package


def install_dependency(name, path):
    module = types.ModuleType(name)
    module.__file__ = str(path)
    module.__package__ = name.rpartition(".")[0]
    module.__loader__ = None
    module.__spec__ = importlib.util.spec_from_loader(
        name, loader=None, origin=str(path))
    sys.modules[name] = module
    parent, child = name.rsplit(".", 1)
    setattr(sys.modules[parent], child, module)
    events, rejected = observed_exec(
        path.read_text(encoding="utf-8"), module.__dict__, str(path))
    if events or rejected is not None:
        raise AssertionError(
            f"{name}: dependency definition effects {events}/{rejected}")
    return module


def main():
    sys.dont_write_bytecode = True
    sys.addaudithook(audit)
    root = Path(".").resolve()
    install_namespace("controller", root / "controller")
    install_namespace("controller.authority", root / "controller/authority")
    install_namespace("controller.result", root / "controller/result")
    install_dependency(
        "controller.authority.core", root / "controller/authority/core.py")
    install_dependency(
        "controller.result.consumer", root / "controller/result/consumer.py")
    materializer = install_dependency(
        "controller.result.materialize",
        root / "controller/result/materialize.py")

    source = root / "scripts/nortropic-codex-autopilot.py"
    name = "_r125_import_probe_" + secrets.token_hex(6)
    spec = importlib.util.spec_from_file_location(name, source)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    events, rejected = observed_exec(
        source.read_text(encoding="utf-8"), module.__dict__, str(source))
    if events or rejected is not None:
        raise AssertionError(
            f"controller definition effects {events}/{rejected}")
    if module.materialize is not materializer.materialize:
        raise AssertionError("controller imported a different materializer")

    negative_root = Path(tempfile.mkdtemp(prefix="r125-import-ticket-"))
    try:
        marker = negative_root / "marker"
        negative = f"def effect(value=open({str(marker)!r}, 'w')):\n pass\n"
        negative_events, negative_rejection = observed_exec(
            negative, {}, "<r125-default-negative>")
        if (tuple(event for event, _args in negative_events) != ("open",)
                or negative_rejection != "open" or marker.exists()):
            raise AssertionError(
                "filesystem definition-time negative was not stopped")

        process_events, process_rejection = observed_exec(
            "import subprocess\n"
            "def effect(value=subprocess.run(['/usr/bin/true'])):\n pass\n",
            {}, "<r125-process-negative>")
        if (tuple(event for event, _args in process_events)
                != ("subprocess.Popen",)
                or process_rejection != "subprocess.Popen"):
            raise AssertionError(
                "process definition-time negative was not stopped")
    finally:
        negative_root.rmdir()
    print("dependency-events=()")
    print("controller-events=()")
    print("filesystem-negative=('open',)")
    print("process-negative=('subprocess.Popen',)")


if __name__ == "__main__":
    main()
