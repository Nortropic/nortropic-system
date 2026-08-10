#!/usr/bin/env python3.12
"""Kompakta builderfall för h-004; den frysta grinden äger domen."""
import fcntl, json, math, os, runpy, subprocess, tempfile, threading, time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
ROT = Path(__file__).resolve().parents[3]
LEASE, LOOP, ATTEST = (ROT / f"controller/{namn}/cli" for namn in ("lease", "loop", "attest"))
def kor(kat: Path, *arg: object) -> subprocess.CompletedProcess[str]:
    return subprocess.run([str(LEASE), str(kat), *map(str, arg)], capture_output=True, text=True, timeout=5)
def ta(kat: Path, task: str, ttl: object = 60, holder: bool = False):
    arg: list[object] = ["acquire", task, "--ttl", ttl]
    if holder: arg += ["--holder-pid", os.getpid()]
    svar = kor(kat, *arg)
    return svar, svar.stdout.strip()
with tempfile.TemporaryDirectory(prefix="h004-fall-") as tmp:
    rot = Path(tmp)
    # Grantankarna ska födas efter låsväntan, inte innan den.
    grant = rot / "grant"
    grant.mkdir()
    fd = os.open(grant, os.O_RDONLY)
    fcntl.flock(fd, fcntl.LOCK_EX)
    proc = subprocess.Popen([str(LEASE), str(grant), "acquire", "g", "--ttl", "10"], stdout=subprocess.PIPE, text=True)
    time.sleep(0.3)
    slappte = time.time()
    fcntl.flock(fd, fcntl.LOCK_UN)
    os.close(fd)
    token_g = proc.communicate(timeout=5)[0].strip()
    state_g = json.loads((grant / "g.lease").read_text())
    assert proc.returncode == 0 and token_g and state_g["beviljad_vagg"] >= slappte - 0.05
    # Mtime är inte authority: gammal mtime förkortar inte, framtida förlänger inte.
    mtime = rot / "mtime"
    _, token_m = ta(mtime, "m", 1)
    assert kor(mtime, "renew", "m", token_m).returncode == 0
    fil_m = mtime / "m.lease"
    os.utime(fil_m, (1, 1))
    time.sleep(0.15)
    assert ta(mtime, "m")[0].returncode != 0
    time.sleep(1.0)
    os.utime(fil_m, (time.time() + 9999,) * 2)
    assert ta(mtime, "m")[0].returncode == 0
    # Publika mutationer startar samtidigt; efter B får A aldrig ändra B:s bytes.
    race = rot / "race"
    agare_a, token_a = ta(race, "r")
    assert agare_a.returncode == 0 and token_a
    start, vinnare = threading.Event(), []
    def gammal(op: str) -> None:
        start.wait()
        for _ in range(12): kor(race, op, "r", token_a)
    def eftertradare() -> None:
        start.wait()
        for _ in range(80):
            svar, token = ta(race, "r", holder=True)
            if svar.returncode == 0:
                vinnare.append(token)
                return
            time.sleep(0.005)
    with ThreadPoolExecutor(max_workers=3) as pool:
        jobb = [pool.submit(gammal, "renew"), pool.submit(gammal, "release"), pool.submit(eftertradare)]
        start.set()
        for j in jobb: j.result(timeout=8)
    assert len(vinnare) == 1
    fil_r = race / "r.lease"
    fore = fil_r.read_bytes()
    stale = [kor(race, "renew", "r", token_a), kor(race, "release", "r", token_a), kor(race, "release", "r")]
    assert all(s.returncode != 0 for s in stale) and fil_r.read_bytes() == fore
    assert json.loads(fore)["lease_id"] == vinnare[0]
    modul = runpy.run_path(str(LOOP), run_name="h004_compact_fall")
    las_config, Vakt = modul["las_config"], modul["LeaseVakt"]
    textfalt = ("spec", "attest_dir", "state_dir", "lease_dir", "lease_resurs", "workspace_rot", "base_sha", "verifier_id", "run_id", "brytare_rot")
    bas = {f: "x" for f in textfalt} | {"worker_cmd": ["x"], "timeout_s": 1, "budget": 1, "troskel": 0}
    config = rot / "config.json"
    def las(extra: dict):
        config.write_text(json.dumps(bas | extra, allow_nan=True))
        return las_config(config)
    standard = las({})
    assert (standard["lease_ttl_s"], standard["lease_heartbeat_s"]) == (180, 30)
    ogiltiga = [{f: v} for f in ("lease_ttl_s", "lease_heartbeat_s")
                for v in (True, "1", 0, -1, math.nan, math.inf)] + [{"lease_ttl_s": 1, "lease_heartbeat_s": 2}]
    for extra in ogiltiga:
        try: las(extra)
        except Exception: continue
        raise AssertionError(f"timing accepterades: {extra!r}")
    # Ett host-orepresenterbart wait-intervall ska publicera loss, aldrig dö tyst.
    vakt = Vakt("x", "x", "x", 1e308)
    vakt.start()
    time.sleep(0.05)
    assert vakt._trad.is_alive() or vakt.forlustorsak() is not None
    vakt.stoppa()
    # Loss mellan ATTEST och efterkontrollen ska invalidera den skrivna posten.
    glob, anrop = Vakt.attestera.__globals__, []
    riktig_kor = glob["kor"]
    attest_dir, task, sha = rot / "attest", "attest", "a" * 40
    def fejk(argv, text=True, env=None):
        anrop.append(tuple(map(str, argv)))
        if Path(argv[0]) != LEASE: return riktig_kor(argv, text=text, env=env)
        renew_nr = sum(a[0] == str(LEASE) and "renew" in a for a in anrop)
        kod = 1 if renew_nr == 2 else 0
        return subprocess.CompletedProcess(argv, kod, "", "lease loss" if kod else "")
    glob["kor"] = fejk
    try:
        try: Vakt("d", "t", "id", 30).attestera([ATTEST, attest_dir, "write", task, sha], str(attest_dir), sha)
        except Exception as e: assert "lease förlorad" in str(e)
        else: raise AssertionError("loss efter ATTEST accepterades")
    finally: glob["kor"] = riktig_kor
    assert (str(ATTEST), str(attest_dir), "invalidate", sha) in anrop
    assert riktig_kor([ATTEST, attest_dir, "read", task, "--require-valid"]).returncode != 0
print("alla kompakta h-004-fall håller")
