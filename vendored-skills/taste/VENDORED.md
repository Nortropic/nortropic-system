# VENDORED: taste

- **Källa**: lokal installation `~/.claude/skills/taste/` (tredjeparts-/marketplace-skill; exakt uppström okänd — pinna vid känd källa)
- **Vendored-datum**: 2026-07-18
- **Innehållshash** (sha256 över sorterade filhashar, exkl. denna fil): `72847578a49209105bf1002869559525a31f451f0a0523a5a6ab9c16a2286398`
- **Antal filer**: 7
- **Load-bearing-roll**: design-reviewer processteg 2 'Ladda designkanonen'

Originalet i `~/.claude/skills/` är det som LADDAS av agenterna; denna kopia är **facit** för stewardens drift-diff (doctor-kontroll #9). Skiljer sig originalet från kopian: granska uppströmsändringen och uppdatera kopian medvetet, eller pinna tillbaka originalet.

## PROVENIENS (R2 2026-08-25) — HYBRID AV TVÅ OLIKA UPPSTRÖMSPROJEKT

Mekanisk blob-analys visar att katalogen är en **lokal sammansättning av två skilda projekt som råkar dela namnet "taste-skill"** — ingen uppström har någonsin levererat enheten som helhet:

- **SKILL.md** (`design-taste-frontend`): `github.com/Leonxlnx/taste-skill` — `skills/taste-skill/SKILL.md` @ commit `3c7017d636c3a4aad378433ea6d0cfa6c921da4a` (2026-05-26). 1/1 byte-identisk; kvarstår på uppströms HEAD. Licens: MIT (LICENSE i repot).
- **references/** (6 filer inkl. `extract.js`): `github.com/senlindesign/taste-skill` — `references/` @ commit `3628de305e1305239dfed193c057545251b42f6c` (2026-07-07). 6/6 byte-identiska; kvarstår på uppströms HEAD. Licens: MIT enligt README-badge, men **LICENSE-filen saknas i uppströmsrepot**.
- **Avgörande fynd**: SKILL.md refererar ALDRIG `references/` — de sex senlindesign-filerna är **inert främmande last** som aldrig konsumeras av skillen. De laddades sannolikt in vid installationen genom namnkollisionen.
- **Bevismetod**: git-blob-SHA-match i fullhistorik-kloner av båda repona; Leonxlnx-historiken har aldrig innehållit referensfilerna (sökvägssök över hela historiken), senlindesign-historiken aldrig SKILL.md-blobben.
- **Innehållshash (R2-recept)**: `dcf1826e57ae2673e468bbbc87481297dca225794c79bfd6d579dda36d827dcc` — samma recept som övriga R2-poster. Hashvärdet överst är historiskt och ersätts.
- **Klassificering**: `PARTIAL_PROVENANCE` — varje enskild byte är uppströmsbevisad, men enheten är en lokal hybrid utan uppströmsmotsvarighet.
- **ÄGARBESLUT KRÄVS (R2-beslutskandidat, avgörs av människan)**:
  - **A.** Adoptera hybriden som `LOCAL_NORTROPIC`-sammansättning (dokumenterad, fryst)
  - **B.** Rensa de sex inerta senlindesign-filerna (beteendeneutralt — de konsumeras aldrig) så skillen blir ren Leonxlnx @ bevisad commit
  - **C.** Återvendorera rent från EN känd uppström under R3/R4-livscykeln
  Ingen av vägarna är exekverad i R2; katalogen är byte-oförändrad.

- **ÄGARBESLUT TAGET (2026-08-25)**:
  - `OWNER_DECISION=B` — hybriden legitimeras INTE som permanent sammansättning; de sex inerta senlindesign-filerna är schemalagda för borttagning (minsta korrigering: radera oanvänd främmande last, inte bredare återvendorering). Den bevisade Leonxlnx-SKILL.md-linjen behålls.
  - `EXECUTION=DEFERRED_TO_R8` — rensningen utförs senare under R8/namn-mismatch + sammansättningshygien, med egen granskning och verifiering.
  - `CURRENT_PAYLOAD_UNCHANGED=YES` — R2 förblir endast proveniens; inga payloadbytes rörda.
