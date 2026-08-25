# VENDORED: taste

## AKTUELLT TILLSTÅND — R8: ÄGARBESLUT B EXEKVERAT (2026-08-25)

- **OWNER_DECISION=B är EXEKVERAT** (beslutet togs i R2, exekveringen uppsköts avsiktligt till R8):
  den oavsiktliga hybriden är INTE legitimerad som permanent sammansättning — de sex inerta
  senlindesign-härledda filerna (`references/export-formats.md`, `references/extract.js`,
  `references/step1-measure.md`, `references/step2-pattern.md`, `references/step3-taste.md`,
  `references/step4-observer.md`) är BORTTAGNA. Minsta möjliga korrigering: ingen bredare
  återvendorering, ingen uppströmsrefresh, ingen beteendeomskrivning.
- **Kvarhållen funktionell payload**: `SKILL.md` — byte-identisk genom hela R8 (git-blob
  `b72132fcd466da605623ffe96e370b3991fc5285`, sha256
  `aa194351b246b8b4799099d4ed7b033d29eab6e6e3d58d8d2172978be7b3ec89`), mekaniskt bevisad i R2 mot
  `github.com/Leonxlnx/taste-skill` — `skills/taste-skill/SKILL.md` @ commit
  `3c7017d636c3a4aad378433ea6d0cfa6c921da4a` (2026-05-26). Licens: MIT (LICENSE i uppströmsrepot).
- **Antal filer**: 2 (SKILL.md + denna fil). Trädet vaktas av R5-manifestet
  `config/vendored-integrity.v1.json` (post-R8-posten) + foundation-K5a — varje återinförd
  främmande fil, saknad fil eller bytemutation fäller mekaniskt.
- **Klassificering**: `VERIFIED_UPSTREAM` (hela den funktionella payloaden är en enda bevisad
  uppströmsfil; hybridklassen PARTIAL_PROVENANCE är därmed upplöst).
- **Namnkonventionen (R8-utredd, mekaniskt bevisad)**: kanonisk identitet är KATALOGNAMNET
  `taste` — det är vad samtliga produktionskonsumenter använder (design-reviewers kanonsteg,
  stewardens doctor #3-obligatoriemängd, nortropic-antislops eskaleringslista, docs/02) och vad
  R5-manifestnyckeln + foundation-vakterna mekaniskt binder. Frontmatterns `name:
  design-taste-frontend` är kvarhållna uppströmsbytes (payloaden redigeras inte för namnkosmetik)
  och är INTE lastbärande: noll förekomster av `design-taste-frontend` som resolutionsmål utanför
  denna katalog (mekaniskt grep-bevisat i R8). Ingen dubblettkopia, ingen alias-wrapper — EN
  kanonisk auktoritet. Samma konvention gäller systerfallet `soft-skill` (frontmatter
  `high-end-visual-design`) — utrett och stängt av samma R8-bevis, ingen åtgärd krävs.
- **Färskhet**: uppströmsändringar (Leonxlnx eller andra) är ENDAST kandidat-evidens via
  Radar → kandidat → diff → granskning → promotion. LATEST=KANDIDAT, ALDRIG AUKTORITET.

---

## HISTORIK (korrigerad — inte omskriven)

### Ursprunglig vendorering (2026-07-18)

- **Källa**: lokal installation `~/.claude/skills/taste/` (tredjeparts-/marketplace-skill; exakt uppström då okänd)
- **Innehållshash**: `72847578a49209105bf1002869559525a31f451f0a0523a5a6ab9c16a2286398` (odokumenterat recept, ej reproducerbart) · 7 filer

### PROVENIENS (R2 2026-08-25) — HYBRIDEN AVSLÖJAD

Mekanisk blob-analys visade att katalogen var en **oavsiktlig sammansättning av två skilda projekt
som råkar dela namnet "taste-skill"** — ingen uppström levererade någonsin enheten som helhet:

- `SKILL.md`: Leonxlnx/taste-skill @ `3c7017d6` (bevisad, behållen — se aktuellt tillstånd).
- `references/` (6 filer inkl. `extract.js`): `github.com/senlindesign/taste-skill` — `references/`
  @ commit `3628de305e1305239dfed193c057545251b42f6c` (2026-07-07), 6/6 byte-bevisade; MIT enligt
  README-badge men LICENSE-fil saknades uppströms. **Avgörande fynd**: SKILL.md refererade ALDRIG
  `references/` — filerna var inert främmande last, sannolikt inlästa via namnkollisionen vid
  installationen. Noll externa konsumenter (ombevisat i R8 före raderingen).
- R2-klassificering: `PARTIAL_PROVENANCE` (varje byte bevisad, enheten lokal hybrid).
- R2-innehållshash (hybridläget, R2-recept): `dcf1826e57ae2673e468bbbc87481297dca225794c79bfd6d579dda36d827dcc`.

### ÄGARBESLUT (R2 2026-08-25) — EXEKVERAT I R8

- `OWNER_DECISION=B` — hybriden legitimeras inte; de sex inerta filerna schemalagda för borttagning;
  den bevisade Leonxlnx-linjen behålls. `EXECUTION=DEFERRED_TO_R8` (egen granskning och verifiering).
- R8 2026-08-25: exekverat exakt enligt beslutet — sex filer raderade, SKILL.md byte-orörd,
  R5-manifestet + K5a-pinnarna transiterade i samma granskade kandidat.
