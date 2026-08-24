# VENDORED: impeccable

- **Källa**: lokal installation `~/.claude/skills/impeccable/` (tredjeparts-/marketplace-skill; exakt uppström okänd — pinna vid känd källa)
- **Vendored-datum**: 2026-07-18
- **Innehållshash** (sha256 över sorterade filhashar, exkl. denna fil): `4665122d64d3c911379988849390ae64a41e8cb7b7227dceb99d334a4cd548a1`
- **Antal filer**: 102
- **Load-bearing-roll**: design-reviewer processteg 2 'Ladda designkanonen'

Originalet i `~/.claude/skills/` är det som LADDAS av agenterna; denna kopia är **facit** för stewardens drift-diff (doctor-kontroll #9). Skiljer sig originalet från kopian: granska uppströmsändringen och uppdatera kopian medvetet, eller pinna tillbaka originalet.

## STEP-0A CONTAINMENT (2026-08-24)

- Den förauktoriserade självuppdateringsvägen är NEUTRALISERAD: `allowed-tools: Bash(npx impeccable *)` struken ur SKILL.md-frontmattern och versionspollen mot `impeccable.style/api/version` avstängd i `scripts/context.mjs` (guarden dokumenterad i koden). En vendorerad lastbärande skill får aldrig uppdatera sig själv in i produktionsauktoritet.
- Verklig uppström (identifierad 2026-08-24): Paul Bakaus — Apache 2.0, v3.9.1 (ur payload-frontmattern). Fullständig proveniens (repo, commit, hash) sätts i M1-reparation R2/R4 (fork-and-freeze-beslut).
- Innehållshashen ovan avser för-kvarantän-innehållet och uppdateras vid R2/R4. Kvarstående R4-yta (medvetet INTE åtgärdad i 0A): `scripts/detector/engines/browser/detect-url.mjs` `npm install puppeteer` on-demand; live-serverns CSP-omskrivning.

## PROVENIENS (R2 2026-08-25)

- **Uppström (bevisad)**: `github.com/pbakaus/impeccable` (Paul Bakaus) — basen ligger byte-identisk på två uppströmssökvägar (`.claude/skills/impeccable/` och `plugin/skills/impeccable/`) @ commit `ddc372427fbed3d3df87fa4047c3e96492c15eb7` (2026-07-09)
- **Bevismetod**: git-blob-SHA-match i fullhistorik-klon — **102/102 för-containment-filer byte-identiska** med uppströmscommiten: 100 oförändrade nuvarande filer + de två STEP-0A-ändrade filernas ursprungsblobbar (`SKILL.md` `74acac52d36b68263db2394b83d4ebe822a84c47`, `scripts/context.mjs` `11f2aabe082bc11f4fab4a468769c9e869053e2d`, ur vendoringcommiten `ae6a7fb1`)
- **Nuvarande bytes** = bevisad uppströmsbas + exakt de två dokumenterade STEP-0A-containmentändringarna (se sektionen ovan). Ingen okänd yta.
- **Licens**: Apache 2.0 (LICENSE i uppströmsrepot @ den bevisade commiten + frontmattern)
- **Version**: 3.9.1 (frontmatter-claim; uppströmsrepot taggar endast `cli-v*`, ingen skill-versionstagg — commiten är auktoriteten, versionsnumret är payloadens egen uppgift)
- **Innehållshash (R2-recept)**: `8e4a11e939b167ea066504c93d564d2a4003de3b41b7a1d98a074d50b93af2a7` — recept: `cd <skillkatalog> && find . -type f ! -name VENDORED.md | LC_ALL=C sort | xargs shasum -a 256 | shasum -a 256`. Detta är den utlovade R2-uppdateringen av innehållshashen (efter-containment-bytes); värdet överst är historiskt (för-kvarantän, odokumenterat recept).
- **Uppströmsdrift (2026-08-25)**: JA, VÄSENTLIG — endast 20/102 basblobbar kvar på uppströms HEAD; uppström är långt förbi v3.9.1. Evidens för R4 (fork-and-freeze-beslutet); LATEST=KANDIDAT, ALDRIG AUKTORITET.
- **Klassificering**: `PARTIAL_PROVENANCE` — i den precisa betydelsen "nuvarande bytes ≠ någon enskild uppströmscommit": basen är 100 % bevisad och deltat exakt dokumenterat; inget är okänt. Slutlig status (LOCAL_NORTROPIC-fork) avgörs av människan i R4:s fork-and-freeze-ceremoni.
- **Kvarstående R4-yta** (oförändrad sedan 0A): `scripts/detector/engines/browser/detect-url.mjs` `npm install puppeteer` on-demand; live-serverns CSP-omskrivning.
