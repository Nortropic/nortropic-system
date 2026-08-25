# VENDORED: web-design-guidelines

## AKTUELLT TILLSTÅND — R3 PINNAD LOKAL VENDORERING (2026-08-25)

- **Regelinnehåll (payload)**: `references/upstream-command.md` = byte-exakt `command.md` från
  `github.com/vercel-labs/web-interface-guidelines` @ ägar-utpekad commit
  `e3d624baaf29dc1fc645aff3e38f03e564d2d6b1` (2026-08-17; tree `55f4cdc472a8c398f3d1a241aaf586c8dc7add42`)
- **Payload-identitet**: git-blob `e1e8e3460db7c1440e34642c4f7b885185ca5366` · 7760 bytes ·
  R3-PAYLOAD-SHA256: 5a775e6411f790f518dbc9c1fa7c50a89e6873502d9a3530a6eb223a590bcfe8
- **Licens**: MIT — `references/LICENSE` = byte-exakt `LICENSE` från samma commit
  (git-blob `b3575a3c1358eac4b9ee36a4c851872d81417760`, sha256 `6cd1609c9c12233507cdd2ce0d32e9a721e3c27494951be06b90090deeeb7af2`)
- **Bevismetod**: färsk oberoende fullhistorik-klon i sandboxen; `git cat-file` av exakt blob ur den
  utpekade commiten; extraherade bytes om-hashade till samma blob-SHA; korsverifierad mot den första
  oberoende klonen från R2. Ingen fil härrör från någon annan commit eller något annat repo.
- **Adapter**: `SKILL.md` är en Nortropic-lokal minimal adapter (ingen uppströmsmotsvarighet) som
  konsumerar den LOKALA pinnade regelfilen fail-closed: saknad/tom/identitetsogiltig regelfil ⇒
  ordagrant KUNDE-EJ-GRANSKA, aldrig granskning ur minnet, aldrig nätverk, ingen reservväg.
- **Konsumtionsväg (R1-semantik)**: repot ÄR auktoriteten; design-reviewer (dömande kanon, steg 2) och
  stack-builder (byggkanonen, steg 5) laddar skillen repo-nativt — ingen härledd kopia existerar
  (doctor #9:s förväntade normaltillstånd). ETT regelverk, EN auktoritet.
- **Innehållshash (R2-recept, hela katalogen exkl. denna fil)**:
  `723c8e4c30edbf9eb93cc4e5db5c451f8a7276d90a3e7408c7486e53c577c757` —
  recept: `cd <skillkatalog> && find . -type f ! -name VENDORED.md | LC_ALL=C sort | xargs shasum -a 256 | shasum -a 256`
- **Antal filer**: 3 (SKILL.md + references/upstream-command.md + references/LICENSE)
- **Load-bearing-roll**: design-reviewer processteg 2 'Ladda designkanonen' + stack-builders byggkanon —
  ÅTERAKTIVERAD i och med R3 (kvarantänen är inte längre det operativa beteendet)
- **Färskhet**: uppströmsändringar når Nortropic ENDAST via Radar → kandidat → diff → granskning →
  promotion till ny ägargodkänd pinnad commit. LATEST=KANDIDAT, ALDRIG AUKTORITET.
- **Klassificering**: `VERIFIED_UPSTREAM` (payload + licens byte-bevisade @ exakt commit) +
  Nortropic-lokal adapter (dokumenterad här, medvetet lokal)
- **Kunskapsevidens (EJ redigerat — innehållsintegritetsgräns)**: regeltexten är engelsk-centrerad i
  vissa stilregler (Title Case/Chicago för rubriker/knappar, curly quotes, `&` framför "and",
  second-person-copy) — noterat som senare utvärderingsunderlag för svenska kundsajter; inga regler
  har ändrats, valts bort eller "förbättrats" i vendoreringen. Ingen regel står i konflikt med någon
  hård Nortropic-invariant, säkerhetsgräns, juridisk gräns eller tillgänglighetsregel.

---

## HISTORIK (SUPERSEDED — beskriver INTE nuvarande beteende)

### Ursprunglig vendorering (2026-07-18) — SUPERSEDED av R3

- **Källa**: lokal installation `~/.claude/skills/web-design-guidelines/` (tredjeparts-/marketplace-skill; exakt uppström okänd — pinna vid känd källa)
- **Vendored-datum**: 2026-07-18
- **Innehållshash** (sha256 över sorterade filhashar, exkl. denna fil): `25bdbdb626cee281c127c2dcc54bab5b202b1ae451b8a428a432a67f8007db0f` (odokumenterat recept, ej reproducerbart)
- **Antal filer**: 1

### STEP-0A CONTAINMENT (2026-08-24) — SUPERSEDED av R3

- SKILL.md:s körning-tids-hämtning från `vercel-labs/web-interface-guidelines@main` (föränderlig branch-HEAD) var AVSTÄNGD; skillen var i KVARANTÄN och rapporterade KUNDE-EJ-GRANSKA i stället för att låtsas granska. R3 har ersatt kvarantänen med pinnade lokala bytes enligt ovan — fail-closed-disciplinen (KUNDE-EJ-GRANSKA vid saknad/ogiltig regelfil) lever kvar i adaptern.

### PROVENIENS (R2 2026-08-25) — kompletterad av R3 ovan

- **Wrapper-uppström (bevisad)**: för-kvarantän-SKILL.md (blob `ceae92ab319216a68274168fba9b63b998b65997`, ur vendoringcommiten `ae6a7fb1`) var byte-identisk med `github.com/vercel-labs/agent-skills` — `skills/web-design-guidelines/SKILL.md` @ commit `ba46938889d4e58635362fb8f618e1178ac3ec46` (2026-01-16). OBS: `agent-skills`-repot saknar LICENSE-fil. Den wrappern är nu ERSATT av Nortropics lokala adapter; R2-fyndet att vercel-repot aldrig innehållit någon SKILL.md (fullhistorik-sökvägslista: AGENT.md, AGENTS.md, LICENSE, README.md, command.md, install.sh) kvarstår som bevisat.
- R2:s innehållshash för kvarantänläget: `f5fe9f393ae084e1c6bd15e22814ea31196cbbd039e6bff296c16e6db990c964` (ersatt av R3-hashen ovan).
