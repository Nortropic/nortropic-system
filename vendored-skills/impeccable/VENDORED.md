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
