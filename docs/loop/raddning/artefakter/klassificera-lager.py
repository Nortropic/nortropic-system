#!/usr/bin/env python3
"""Auktoritativ lagerklassificering. Bundlen genereras UR denna tabell."""
import subprocess, re, sys

KERNEL_SCRIPTS = {
    'scripts/nortropic-codex-autopilot.py',      # K=92/W=4, allowed_write h-031/032/035
    'scripts/check-provanropare.mjs',            # K=6/W=0, prövar att kärnans prov anropas
    'scripts/check-verifierarregistret.mjs',     # K=6/W=0, läser controller/verify/register.json
    'scripts/kor-styrprov.mjs',                  # K=5/W=0
    'scripts/kor-vakter.mjs',                    # K=3/W=0, läser registret (öppen fråga)
}
KERNEL_CONFIG = {
    'config/codex-provider-identity.json',       # h-031-exit, h-032-exit
    'config/python-interpreter-authority-v1.json',# h-035-exit, python-interpreter-authority-v1-exit
    'config/python-runtime-authority-v2.json',   # controller/authority/core.py, controller/attest
    'config/managed-settings.json',              # controller/verify/cli
    'config/premiar-backlog.json',               # K=13 innehåll
    'config/loop-config.exempel.json',           # kontrollplanets konfig
    'config/worker-prompt.sh',                   # controller/worker
}
DELAT = {                                        # läses av BÅDA — stannar, arkitekten avgör
    'docs/05-beslutslogg.md', 'docs/03-regelverk.md', 'docs/07-konstitution.md',
    'docs/agentoverlamning.md', 'config/README.md', 'config/frusna-kontrakt/README.md',
    '.gitignore',
}
def layer(f):
    if f in DELAT: return 'DELAT'
    if f.startswith(('controller/','verify/','specs/','docs/loop/','tests/controller/',
                     'tests/scripts/','.agents/')): return 'KÄRNA'
    if f in ('AGENTS.md','CLAUDE.md'): return 'KÄRNA'
    if f in KERNEL_SCRIPTS or f in KERNEL_CONFIG: return 'KÄRNA'
    return 'WEBB'

files = subprocess.run(['git','ls-files'],capture_output=True,text=True).stdout.split()
rows = [(layer(f), f) for f in files]
if '--web-paths' in sys.argv:
    for l,f in rows:
        if l=='WEBB': print(f)
else:
    from collections import Counter
    c=Counter(l for l,_ in rows)
    print(f"TOTALT {len(rows)}  KÄRNA {c['KÄRNA']}  DELAT {c['DELAT']}  WEBB {c['WEBB']}")
    print("\n=== KÄRNA utanför de självklara katalogerna ===")
    for l,f in rows:
        if l=='KÄRNA' and not f.startswith(('controller/','verify/','specs/','docs/loop/','tests/controller/','tests/scripts/','.agents/')):
            print("  ",f)
    print("\n=== DELAT ===")
    for l,f in rows:
        if l=='DELAT': print("  ",f)
