#!/usr/bin/env python3
"""Disposable R125 whole-patch materializer probes."""

import base64
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

import controller.result.materialize as materialize_module
from controller.result.materialize import Reject, materialize


def git(root, *args, input_bytes=None):
    env = {
        "PATH": "/usr/bin:/bin",
        "HOME": "/var/empty",
        "LANG": "C",
        "LC_ALL": "C",
        "GIT_CONFIG_NOSYSTEM": "1",
        "GIT_CONFIG_GLOBAL": "/dev/null",
        "GIT_TERMINAL_PROMPT": "0",
    }
    result = subprocess.run(
        ["/usr/bin/git", *args],
        cwd=root,
        env=env,
        input=input_bytes,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if result.returncode:
        raise RuntimeError((args, result.stderr.decode("utf-8", "replace")))
    return result.stdout


def case(name, base_files, mutate, *, trailing=False, mutate_rediff=False,
         expect=True):
    with tempfile.TemporaryDirectory(prefix=f"r125-{name}-") as td:
        root = Path(td)
        repo = root / "repo"
        protected = root / "protected"
        repo.mkdir()
        protected.mkdir(mode=0o700)
        git(repo, "init", "-q")
        for relative, (content, mode) in base_files.items():
            path = repo / relative
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(content)
            path.chmod(mode)
        git(repo, "add", "-A")
        env = os.environ.copy()
        env.update({
            "GIT_AUTHOR_NAME": "probe",
            "GIT_AUTHOR_EMAIL": "probe@example.invalid",
            "GIT_COMMITTER_NAME": "probe",
            "GIT_COMMITTER_EMAIL": "probe@example.invalid",
        })
        subprocess.run(
            ["/usr/bin/git", "commit", "-qm", "base"],
            cwd=repo,
            env=env,
            check=True,
        )
        base = git(repo, "rev-parse", "HEAD").decode().strip()
        base_tree = git(repo, "rev-parse", f"{base}^{{tree}}").decode().strip()
        mutate(repo)
        git(repo, "add", "-A")
        patch = git(
            repo,
            "diff",
            "--cached",
            "--binary",
            "--full-index",
            "--no-renames",
            base_tree,
            "--",
        )
        if trailing:
            patch += b"\n"
        delta = {
            "version": 1,
            "format": "git-diff-binary-v1",
            "base_commit": base,
            "patch_b64": base64.b64encode(patch).decode("ascii"),
        }
        objects_before = frozenset(
            git(repo, "cat-file", "--batch-all-objects",
                "--batch-check=%(objectname)").splitlines())
        accepted = False
        detail = ""
        rediff_mutations = 0
        real_run = materialize_module.subprocess.run
        def mutating_run(*args, **kwargs):
            nonlocal rediff_mutations
            completed = real_run(*args, **kwargs)
            argv = args[0] if args else kwargs.get("args")
            if (mutate_rediff and isinstance(argv, (list, tuple))
                    and len(argv) == 8
                    and list(argv[:6]) == [
                        "/usr/bin/git", "diff", "--cached", "--binary",
                        "--full-index", "--no-renames"]
                    and completed.returncode == 0 and completed.stdout):
                changed = bytearray(completed.stdout)
                changed[-1] ^= 1
                rediff_mutations += 1
                return subprocess.CompletedProcess(
                    completed.args, completed.returncode,
                    bytes(changed), completed.stderr)
            return completed
        try:
            if mutate_rediff:
                materialize_module.subprocess.run = mutating_run
            candidate, tree, changed = materialize(
                str(repo / ".git"),
                base,
                delta,
                ["controller/result/**"],
                12,
                2200,
                12,
                str(protected),
            )
            accepted = True
            detail = f"{candidate} {tree} {changed}"
        except Reject as exc:
            detail = str(exc)
        finally:
            materialize_module.subprocess.run = real_run
        objects_after = frozenset(
            git(repo, "cat-file", "--batch-all-objects",
                "--batch-check=%(objectname)").splitlines())
        if accepted != expect:
            raise AssertionError(
                f"{name}: accepted={accepted}, expected={expect}, detail={detail}")
        if any(protected.iterdir()):
            raise AssertionError(f"{name}: protected residue")
        if not expect and objects_after != objects_before:
            raise AssertionError(f"{name}: rejection changed authoritative ODB")
        if mutate_rediff and rediff_mutations != 1:
            raise AssertionError(
                f"{name}: rediff mutations={rediff_mutations}, expected=1")
        print(f"{name}: accepted={accepted} detail={detail}")


def main():
    case(
        "ordinary",
        {"controller/result/value.py": (b"old\n", 0o644)},
        lambda repo: (repo / "controller/result/value.py").write_bytes(b"new\n"),
    )
    case(
        "trailing-lf",
        {"controller/result/value.py": (b"old\n", 0o644)},
        lambda repo: (repo / "controller/result/value.py").write_bytes(b"new\n"),
        trailing=True,
        expect=False,
    )
    case(
        "mutated-rediff-stdout",
        {"controller/result/value.py": (b"old\n", 0o644)},
        lambda repo: (repo / "controller/result/value.py").write_bytes(b"new\n"),
        mutate_rediff=True,
        expect=False,
    )

    def file_to_dir(repo):
        node = repo / "controller/result/node"
        node.unlink()
        node.mkdir()
        (node / "child.py").write_bytes(b"child\n")

    case(
        "file-to-directory",
        {"controller/result/node": (b"file\n", 0o644)},
        file_to_dir,
    )

    def dir_to_file(repo):
        node = repo / "controller/result/node"
        shutil.rmtree(node)
        node.write_bytes(b"file\n")

    case(
        "directory-to-file",
        {"controller/result/node/child.py": (b"child\n", 0o644)},
        dir_to_file,
    )


if __name__ == "__main__":
    main()
