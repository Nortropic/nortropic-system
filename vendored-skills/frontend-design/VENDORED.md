# VENDORED: frontend-design

- **Källa**: officiell Anthropic-plugin `frontend-design@claude-plugins-official` — `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/frontend-design/skills/frontend-design/` (känd uppström, pinnbar; lokal arbetskopia i `~/.claude/skills/frontend-design/`)
- **Vendored-datum**: 2026-07-19
- **Innehållshash** (sha256 över sorterade filhashar, exkl. denna fil): `0bf18d51774711e3ebf7492e31db1fffc7f6598973d394dc12b1c3b992616ea3`
- **Antal filer**: 1
- **Load-bearing-roll**: byggkanonen (stack-builder + content-designer laddar före bygge/innehåll, v14) + design-reviewer processteg 2 "Ladda designkanonen" (kanonmedlem 8) + project-planner 5c/§5-syntesen

Denna kopia är **facit** för stewardens drift-diff (doctor-check #9). Originalet i `~/.claude/skills/frontend-design/` är det agenterna laddar; pluginen i `plugins/` är uppströmmen. Om original eller uppström divergerar från kopian: granska ändringen och uppdatera vendored-kopian medvetet, eller pinna tillbaka originalet.

## PROVENIENS (R2 2026-08-25)

- **Uppström (bevisad)**: `github.com/anthropics/claude-plugins-official` — `plugins/frontend-design/skills/frontend-design/SKILL.md` @ commit `4ca561fb8532594e7a5faef945e85096fcec0616` (2025-11-20)
- **Bevismetod**: git-blob-SHA-match i fullhistorik-klon — **1/1 fil byte-identisk**
- **Licens**: repo-HEAD bär Apache-2.0; vid den bevisade commiten fanns ingen LICENSE-fil, och frontmatterns "Complete terms in LICENSE.txt" pekar på en fil som varken fanns i pluginen då eller följde med vid vendoring — licensläget vid den pinnade versionen är alltså formellt obestämt (Anthropic-officiell källa)
- **Version**: inget versionsfält vid den bevisade commiten
- **Innehållshash (R2-recept)**: `43a0403cb00d4f3c721bc8bbd44569c3565ef5373a38537cdd9938af15761b1a` — samma recept som övriga R2-poster. Hashvärdet överst är historiskt och ersätts.
- **Uppströmsdrift (2026-08-25)**: JA, VÄSENTLIG — uppström (och den lokala marketplace-kopian `~/.claude/plugins/marketplaces/claude-plugins-official/`) har skrivit om skillen i grunden (0/1 kvar på HEAD). Evidens för senare uppgraderingsbeslut; LATEST=KANDIDAT, ALDRIG AUKTORITET.
- **Klassificering**: `VERIFIED_UPSTREAM`
