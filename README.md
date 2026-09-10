# nortropic-system — Nortropics autonomiplattform

Repoidentitet: `git@github.com:Nortropic/nortropic-system.git` med bevarad Git-historik.
Sedan 2026-09-10 innehåller repot enbart den verksamhetsneutrala autonomiplattformen:
Trust Kernel (hela tillitsplattformen, inte bara H034:s fyra artefaktfiler), controller,
bootstrap, supervisor/autopilot och tillhörande H-arbeten. Webbförvaltningen
(agenter, skills, workflows, paket, kvalitetsregler och verksamhetsmaterial) är utbruten
till repot `nortropic-webbforvaltning`; historiskt webbmaterial finns kvar som Git-historik.

Nortropic är den organisatoriska helheten; plattformen är en del av den; Digitala är den
första professionella verksamheten. Webbens brief-, design-, kvalitets- och
förvaltningsregler är domänkrav och gäller inte plattformsuppdrag.

## Repokartan

- **`controller/`** — kontrollplanets komponenter: authority, provenance (H033), taskval,
  policy, envelope, brytare, utforare, launch (H036), lease, workspace, worker, verify,
  attest, state, loop, runtime-cleanup (H039), h034-native (Trust Kernel-artefakt).
- **`verify/`** — frysta exit-test per skiva (`h-001`…`h-039`, `p-*`, python-authority) samt
  lokala kvalificeringsgrindar (`document-authority-exit`, `invariant-required-exit`),
  och H034/H039-artefaktpaket under `verify/h034/`, `verify/h039/`. Ändras endast av människa.
- **`specs/`** — `tasks.spec.json` (kontrollplanets skivor, `allowed_write`, frysta grindar)
  och `owner-production-paths.v1.json`.
- **`scripts/nortropic-codex-autopilot.py`** — mekanisk exekverare (v2–v4);
  **`scripts/check-invariants.mjs`** — registrerad global verifierare (människohand;
  läser i dag fortfarande webbfiler, se efterarbete); `scripts/check-verifierarregistret.mjs`.
- **`config/`** — loop-config-exempel, worker-prompt, provider-/python-authority-pinnar,
  premiärbacklog, källkopia av managed-settings.
- **`tests/controller/`**, **`tests/scripts/`** — kontraktssviter och hermetiska prov.
- **`.agents/skills/`** — rollskills (test-author, builder, reviewer, architect,
  empirical-runner, gate-reviewer).
- **`docs/loop/`** — byggplan v3, regler, v4.1-arkitektur, substitutionskontrakt, owner-
  author-workflow, delegation, drift, evidenskontrakt, lokala utvecklingsdokument, arkiv.
- **`SEPARATION-20260910/`** — allokeringen fil för fil, efterarbete och proveniens för uppdelningen.

## Läsordning

`AGENTS.md` → `docs/loop/harness-substitution-contract-v1.md` §1 → `docs/loop/regler.md`
→ `docs/loop/byggplan-v3.md` → aktuell task i `specs/tasks.spec.json` → dess `exit_test`.
