# Föreslagna människohandsfiler (plattformens kontrollmängd, 2026-09-10)

Två filer som enligt `AGENTS.md`/`CLAUDE.md` och byggplan v3 §3.1 (§A-mängden) endast
ändras av människohand. TEST_AUTHOR har **inte** tillämpat dem; de ligger här som exakta
föreslagna bytes och prövas av `verify/bin/platform-control-set-exit` från denna sökväg
(kopieras in i grindens fixturer, aldrig i arbetsträdet). Kontraktet beskrivs i
`docs/loop/platform-control-set-local-development.md`.

| Förslag | Ersätter | SHA-256 |
|---|---|---|
| `scripts-check-invariants.mjs` | `scripts/check-invariants.mjs` (webbinvarianterna INV-001–008 → plattformsinvarianterna PINV-001–006, samma path och register-id) | `ae72cdf8b8a21456662f1e4c391670f47a8a4b3728600ad221999e624dc95184` |
| `controller-verify-register.json` | `controller/verify/register.json` (endast startbara plattformsverifierare; webbposten `nortropic-verify-suite` borttagen; `check-invariants` bunden till förslagets sha256) | `f1c553d9c317099db8a245c52eed62f9ede31452983c6d523a74d6272b830b23` |

Registrets `check-invariants.sha256` är exakt sha256 av `scripts-check-invariants.mjs` ovan.
Tillämpas den ena utan den andra stoppar `controller/verify/cli preflight` med `hash_mismatch`
(avsett: registret binder filen).

## Ägarens tillämpning (exakta kommandon, från repots rot; HÖGRISK-märkt commit enligt loopregel 6)

```text
cp SEPARATION-20260910/proposed/scripts-check-invariants.mjs scripts/check-invariants.mjs
cp SEPARATION-20260910/proposed/controller-verify-register.json controller/verify/register.json
shasum -a 256 scripts/check-invariants.mjs controller/verify/register.json
```

Väntade summor efter `cp`: `ae72cdf8b8a21456662f1e4c391670f47a8a4b3728600ad221999e624dc95184` respektive `f1c553d9c317099db8a245c52eed62f9ede31452983c6d523a74d6272b830b23`.
Kontroll efter tillämpning: `node scripts/check-invariants.mjs` från repots rot ska ge
`6 PASS, 0 FAIL` först när BUILDER-ändringen i `controller/verify/cli` och
`scripts/nortropic-codex-autopilot.py` också är gjord (PINV-003 fäller de gamla
webbdeklarationerna tills dess); `controller/verify/cli preflight` ska ge exit 0 direkt.

Konsekvens som ägaren beslutar om: h-037 fryser registrets bytes och `controller/verify/cli`
pinnar `PLATFORM_REGISTER`; efter tillämpning gäller de frysta grindarna h-002/h-037 och
`document-authority-exit` sina historiska subjekt (dae90c8f), och BUILDER uppdaterar pinnen
`PLATFORM_REGISTER` till `f1c553d9c317099db8a245c52eed62f9ede31452983c6d523a74d6272b830b23` (specen är oförändrad: `PLATFORM_SPEC` består).
