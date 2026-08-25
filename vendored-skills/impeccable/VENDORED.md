# VENDORED: impeccable

## AKTUELLT TILLSTÅND — R4 LOCAL_NORTROPIC_FORK (2026-08-25)

Produktionsenheten är en **avsiktlig, frusen lokal fork**: `LOCAL_NORTROPIC_FORK`.

- **Uppströmsbas (bevisad, R2)**: `github.com/pbakaus/impeccable` (Paul Bakaus) @ commit
  `ddc372427fbed3d3df87fa4047c3e96492c15eb7` (2026-07-09) — basen låg byte-identisk på två
  uppströmssökvägar (`.claude/skills/impeccable/` och `plugin/skills/impeccable/`); 102/102
  för-containment-filer blob-bevisade i fullhistorik-klon. Ingen uppgradering till uppströms HEAD
  har gjorts eller görs — LATEST=KANDIDAT, ALDRIG AUKTORITET.
- **Licens**: Apache 2.0 — `LICENSE` i denna katalog är byte-exakt uppströms `LICENSE` @ baskommiten
  (git-blob `bb3f6d23b1f8025514a62a12b51b47d73e3c9aa9`, sha256
  `02bb8c3b4e70190e3986c0404ad2fd8d639b4f534252d82379cc1b502b6d1812`). Uppströms bär ingen
  NOTICE-fil vid baskommiten (mekaniskt kontrollerat), så ingen NOTICE medföljer.
- **Version/identitet**: frontmattern bär `3.9.1-nortropic.1` (uppströmsclaim 3.9.1 + forksuffix).
  Mekaniskt bevisat säkert: den enda körtidsläsaren av versionsfältet var uppdateringsmaskineriet i
  `context.mjs`, som R4 tar bort i samma commit.

### NORTROPIC-PATCHSET (sluten — hela deltat mot uppströmsbasen, 4 filer)

Exakt 4 filer avviker byte-mässigt från basen; övriga 99 är byte-identiska (LICENSE är
uppströmsbytes på ny plats). Verifierbart: `git hash-object` per fil mot basens trädblobbar.

1. **`SKILL.md`** — (0A) förauktoriserade `Bash(npx impeccable *)` struken ur allowed-tools;
   (R4) `UPDATE_AVAILABLE`-följ-instruktionen borttagen; skriptsökvägar repo-nativa
   (`<skill-base-dir>` = katalogen skillen laddades från; legacy `.claude/skills/impeccable`-
   projektion giltig endast om den existerar OCH är byte-identisk — repot vinner, doctor #9);
   allowed-tools bär det repo-nativa mönstret; fork-identitetsnot + versionssuffix.
2. **`scripts/context.mjs`** — (0A) versionspollen mot `impeccable.style` neutraliserad;
   (R4) HELA uppdateringsmaskineriet BORTTAGET, inte sovande: konstanterna
   (`UPDATE_HOST`, `UPDATE_CACHE_PATH`, poll-/renotify-fönster), `fetchLatestSkillVersion`,
   `buildUpdateDirective`, `updateCheckDisabledByConfig`, `computeUpdateDirective`,
   `readLocalSkillVersion`, `readUpdateCache`/`writeUpdateCache`, `compareSemver` samt
   anropsplatserna i boot-utskriften. Skrivningen till `~/.impeccable/update-check.json`
   (utanför projektgränsen) försvann därmed också. R4-markörkommentar kvar som ankare.
3. **`scripts/detector/engines/browser/detect-url.mjs`** — (R4) beroende-fail-closed: när
   `import('puppeteer')` misslyckas kastas nu ett fel som förklarar att URL-skanningen är
   otillgänglig och att beroendeinstallation är out-of-band (instrument-/beroendelivscykeln) och
   ALDRIG får göras autonomt. Puppeteer-stödet är oförändrat när beroendet redan finns legitimt.
4. **`scripts/live-inject.mjs`** — (R4) automatisk CSP-breddning BORTTAGEN (`patchCspMeta` +
   `appendOriginToDirective` raderade). Nytt beteende: (A) ingen CSP-meta ⇒ live-injektion som
   avsett; (B) redan förenlig CSP ⇒ injektion UTAN policyändring; (C) skulle CSP behöva breddas ⇒
   strukturell blockering `CSP_REQUIRES_EXPLICIT_DEV_AUTHORITY` med exakt saknade
   direktiv/origins, FÖRE varje mutation (inklusive git-ignore-skrivningen) — ingen partiell
   injektion; (D) `revertCspMeta` kvar ENDAST för legacy-städning av historiska
   `data-impeccable-csp-original`-markörer — återställer exakt originalbytes, breddar aldrig;
   (E) header-baserad CSP orörd precis som förut. Ingen webbläsarsäkerhet stängs av som
   alternativ väg — inga `--disable-web-security`-flaggor introducerade.

- **Innehållshash (R2-recept, hela katalogen exkl. denna fil)**:
  `1345d35b2d582c8d65da8dac51153c62c05d18a422f0089c9f47b021e24f5200` —
  recept: `cd <skillkatalog> && find . -type f ! -name VENDORED.md | LC_ALL=C sort | xargs shasum -a 256 | shasum -a 256`
- **Antal filer**: 103 (uppströmsbasens 102 + `LICENSE`)
- **Load-bearing-roll**: design-reviewer processteg 2 'Ladda designkanonen'
- **Färskhet**: uppströmsändringar når forken ENDAST via Radar → kandidat → diff → granskning →
  promotion (uppström var redan vid R2 långt förbi basen: 20/102 basblobbar kvar på HEAD — evidens,
  inte auktoritet).
- **Klassificering**: `LOCAL_NORTROPIC_FORK` (bevisad bas + slutet dokumenterat patchset)
- **Kvarvarande extern-effektyta (R4-inventerad, avsiktlig funktionalitet — ingen redesign):**
  läser projektfiler (context/detect); skriver projektfiler endast i live-läget (script-taggen,
  markerad och reversibel); skriver `.impeccable/`-körtidstillstånd i projektet; skriver
  git-ignoremönster för sitt körtidstillstånd till `.git/info/exclude` (eller `.gitignore`) —
  numera EFTER CSP-grinden; startar lokal hjälpserver på localhost (live); startar webbläsare via
  puppeteer och navigerar till användarens angivna mål (detect-url); kör syskon-skript och
  `node --check` som barnprocesser; dynamisk import av puppeteer. Inga hem-katalogskrivningar,
  ingen nätverkshämtning av regler/kod, ingen självuppdatering, ingen beroendeinstallation,
  ingen automatisk säkerhetspolicy-försvagning.

---

## HISTORIK (SUPERSEDED — beskriver INTE nuvarande beteende)

### Ursprunglig vendorering (2026-07-18)

- **Källa**: lokal installation `~/.claude/skills/impeccable/` (tredjeparts-/marketplace-skill; exakt uppström då okänd)
- **Innehållshash**: `4665122d64d3c911379988849390ae64a41e8cb7b7227dceb99d334a4cd548a1` (odokumenterat recept, ej reproducerbart) · 102 filer

### STEP-0A CONTAINMENT (2026-08-24) — vidareförd in i R4-forken

- Förauktoriserade `Bash(npx impeccable *)` struken; versionspollen mot `impeccable.style/api/version` avstängd (guard). R4 ersatte guarden med fullständig borttagning.
- **Faktakorrigering (R4)**: 0A-notens formulering "`npm install puppeteer` on-demand" var oprecis och är härmed korrigerad — koden exekverade ALDRIG någon `npm install`; den försökte `import('puppeteer')` och kastade vid fel ett felmeddelande som INSTRUERADE "Install: npm install puppeteer". Det verkliga R4-problemet var alltså en implicit beroendemutations-instruktion till autonoma agenter, inte en körtidsinstallatör — åtgärdad enligt patchset-punkt 3. Den andra kvarstående 0A-ytan (live-serverns CSP-omskrivning) är åtgärdad enligt patchset-punkt 4.

### PROVENIENS (R2 2026-08-25) — basbeviset, fortsatt giltigt

- 102/102 för-containment-filer byte-identiska @ `ddc37242` (blob-SHA-match i fullhistorik-klon);
  de två 0A-ändrade filernas ursprungsblobbar: `SKILL.md` `74acac52d36b68263db2394b83d4ebe822a84c47`,
  `scripts/context.mjs` `11f2aabe082bc11f4fab4a468769c9e869053e2d`. Apache 2.0 @ baskommiten.
  Version 3.9.1 var payloadclaim; commiten är auktoriteten. R2-innehållshash (för-R4):
  `8e4a11e939b167ea066504c93d564d2a4003de3b41b7a1d98a074d50b93af2a7` (ersatt av R4-hashen ovan).
  R2-klassificeringen `PARTIAL_PROVENANCE` är ersatt av `LOCAL_NORTROPIC_FORK` per ägarbeslutet
  IMPECCABLE_FORK_DECISION=ADOPT_LOCAL_NORTROPIC_FORK.
