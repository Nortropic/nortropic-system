# VENDORED: content-humanizer

- **Källa**: lokal installation `~/.claude/skills/content-humanizer/` (tredjeparts-/marketplace-skill; exakt uppström okänd — pinna vid känd källa)
- **Vendored-datum**: 2026-07-18
- **Innehållshash** (sha256 över sorterade filhashar, exkl. denna fil): `7af49ad56ac74edb08da91b236a95cb2e29fa973eb641c5e75c32ede25976212`
- **Antal filer**: 4
- **Load-bearing-roll**: content-designer processteg 4 'Humanisera' (obligatoriskt pa all copy)

Originalet i `~/.claude/skills/` är det som LADDAS av agenterna; denna kopia är **facit** för stewardens drift-diff (doctor-kontroll #9). Skiljer sig originalet från kopian: granska uppströmsändringen och uppdatera kopian medvetet, eller pinna tillbaka originalet.

## PROVENIENS (R2 2026-08-25)

- **Uppström (bevisad)**: `github.com/alirezarezvani/claude-skills` — `marketing-skill/skills/content-humanizer/` @ commit `aecfb8e0bb71dbf1413082f86b33a5c4c9b8f416` (2026-06-11)
- **Bevismetod**: git-blob-SHA-match i fullhistorik-klon — **4/4 filer byte-identiska** med uppströmscommiten (komplett delträd, inget utelämnat)
- **Licens**: MIT (LICENSE i uppströmsrepot + `license: MIT` i frontmattern)
- **Version**: 1.0.0 (frontmatter; författare Alireza Rezvani, bekräftad = repoägare)
- **Innehållshash (R2-recept)**: `f6b731e9b55b1fd659d0456475450621602afe987d649d367fb559487eba55e9` — recept: `cd <skillkatalog> && find . -type f ! -name VENDORED.md | LC_ALL=C sort | xargs shasum -a 256 | shasum -a 256`. Hashvärdet överst i filen är historiskt (odokumenterat recept, ej reproducerbart) och ersätts av detta.
- **Uppströmsdrift (2026-08-25)**: INGEN — alla 4 blobbar kvarstår på uppströms HEAD
- **Klassificering**: `VERIFIED_UPSTREAM`
