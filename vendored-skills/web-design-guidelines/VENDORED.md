# VENDORED: web-design-guidelines

- **Källa**: lokal installation `~/.claude/skills/web-design-guidelines/` (tredjeparts-/marketplace-skill; exakt uppström okänd — pinna vid känd källa)
- **Vendored-datum**: 2026-07-18
- **Innehållshash** (sha256 över sorterade filhashar, exkl. denna fil): `25bdbdb626cee281c127c2dcc54bab5b202b1ae451b8a428a432a67f8007db0f`
- **Antal filer**: 1
- **Load-bearing-roll**: design-reviewer processteg 2 'Ladda designkanonen'

Originalet i `~/.claude/skills/` är det som LADDAS av agenterna; denna kopia är **facit** för stewardens drift-diff (doctor-kontroll #9). Skiljer sig originalet från kopian: granska uppströmsändringen och uppdatera kopian medvetet, eller pinna tillbaka originalet.

## STEP-0A CONTAINMENT (2026-08-24)

- SKILL.md:s körning-tids-hämtning från `vercel-labs/web-interface-guidelines@main` (föränderlig branch-HEAD) är AVSTÄNGD; skillen är i KVARANTÄN och rapporterar KUNDE-EJ-GRANSKA i stället för att låtsas granska.
- Verklig uppström (identifierad 2026-08-24): `github.com/vercel-labs/web-interface-guidelines` — MIT. Återvendoreras som pinnade bytes @ exakt commit-SHA i M1-reparation R3; denna VENDORED.md får då fullständig proveniens (repo, commit, licens, hash).
- Innehållshashen ovan avser för-kvarantän-innehållet och uppdateras vid R3.

## PROVENIENS (R2 2026-08-25)

- **Wrapper-uppström (bevisad)**: för-kvarantän-SKILL.md (blob `ceae92ab319216a68274168fba9b63b998b65997`, ur vendoringcommiten `ae6a7fb1`) är byte-identisk med `github.com/vercel-labs/agent-skills` — `skills/web-design-guidelines/SKILL.md` @ commit `ba46938889d4e58635362fb8f618e1178ac3ec46` (2026-01-16); blobben kvarstår oförändrad på uppströms HEAD. OBS: `agent-skills`-repot saknar LICENSE-fil.
- **Körtidslast (identifierad, EJ pinnad)**: `github.com/vercel-labs/web-interface-guidelines` `command.md` @ `main` (MIT) — den föränderliga hämtning som STEP-0A stängde av. Mekaniskt bevisat: vercel-repot har **aldrig** innehållit någon SKILL.md (fullhistorik-sökvägslista: AGENT.md, AGENTS.md, LICENSE, README.md, command.md, install.sh) — wrappern är distributionsrepots (vercel-labs/agent-skills), regelinnehållet är web-interface-guidelines-repots.
- **Nuvarande bytes** = bevisad wrapper + KVARANTÄN-blocket (STEP-0A, se ovan). Ingen okänd yta.
- **Bevismetod**: git-blob-SHA-match i fullhistorik-kloner av båda vercel-labs-repona
- **Innehållshash (R2-recept)**: `f5fe9f393ae084e1c6bd15e22814ea31196cbbd039e6bff296c16e6db990c964` — recept: `cd <skillkatalog> && find . -type f ! -name VENDORED.md | LC_ALL=C sort | xargs shasum -a 256 | shasum -a 256` (efter-kvarantän-bytes; värdet överst är historiskt)
- **Klassificering**: `PARTIAL_PROVENANCE` — wrapperbasen 100 % bevisad + kvarantän-deltat exakt dokumenterat; regelinnehållet var per design aldrig pinnat (det är hela R3-reparationens poäng). R3 återvendorerar pinnade bytes @ exakt commit-SHA från `vercel-labs/web-interface-guidelines` och ger denna fil fullständig slutproveniens.
- **Rollnot**: skillen är i KVARANTÄN och rapporterar KUNDE-EJ-GRANSKA — den är för närvarande INTE lastbärande i produktion.
