---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel (regelinnehåll) · Nortropic (lokal adapter)
  version: "2.0.0-r3"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines — pinnad lokal adapter (R3)

Regelverket är LOKALA PINNADE BYTES i denna skillkatalog. Ingen nätverkshämtning
förekommer eller får återinföras; färskhetsjakt är förbjuden vid körning.

1. **Läs regelfilen**: `references/upstream-command.md` (relativt denna skillkatalog).
   Den är byte-exakt `command.md` från `vercel-labs/web-interface-guidelines` @ commit
   `e3d624baaf29dc1fc645aff3e38f03e564d2d6b1` (MIT — `references/LICENSE`; fullständig
   proveniens och registrerad payloadhash i `VENDORED.md`).

2. **Identitetsvakt (fail-closed)**: om regelfilen saknas, är tom, eller inte bär
   regeltextens ankare (rubriken `# Web Interface Guidelines` och sektionen `## Rules`)
   → granska INTE ur minnet och hitta ALDRIG på regler: rapportera ordagrant
   **"web-design-guidelines: KUNDE-EJ-GRANSKA — pinnad regelfil saknas/ogiltig"** och
   stanna. Bytes kan vid tvivel verifieras mekaniskt: `shasum -a 256
   references/upstream-command.md` ska ge exakt det `R3-PAYLOAD-SHA256`-värde som står i
   `VENDORED.md` — mismatch = samma KUNDE-EJ-GRANSKA, aldrig tyst grön.

3. **Tillämpa reglerna** i regelfilen på de angivna filerna (`<file-or-pattern>`), med
   regelfilens eget output-format (`file:line`, terse, gruppera per fil).

Uppströmsändringar når Nortropic ENDAST via Radar → kandidat → diff → granskning →
promotion till en ny ägargodkänd pinnad commit. Denna adapter uppdaterar aldrig sig
själv och har ingen reservväg runt den pinnade regelfilen.
