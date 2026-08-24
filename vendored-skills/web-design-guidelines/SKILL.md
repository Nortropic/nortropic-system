---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

> **KVARANTÄN (STEP-0A CONTAINMENT, 2026-08-24) — INNEHÅLLET ÄR INTE TILLGÄNGLIGT I DENNA VERSION.**
>
> Denna skill var en 39-raders hämtnings-instruktion som läste hela sitt regelverk från
> `vercel-labs/web-interface-guidelines@main` vid körning — en föränderlig branch-HEAD utan
> pinning, i strid med regel 11:s löfte ("ett obligatoriskt steg får inte vila på ett beroende
> som kan auto-uppdateras") och med Anthropics egen skill-säkerhetsvägledning (skills som hämtar
> externa URL:er är särskilt riskabla). Dessutom saknar de två konsumerande agenterna
> (design-reviewer, stack-builder) WebFetch — hämtningen var i praktiken en tyst no-op.
>
> **Beteende under kvarantän:** gör INGEN nätverkshämtning. Om denna skill åberopas i en
> granskning: rapportera ordagrant status **"web-design-guidelines: KVARANTÄN — regelinnehåll
> saknas (väntar R3-återvendorering som pinnade bytes)"** i stället för att låtsas granska mot
> regler som inte finns. En kanon-medlem som inte kan läsas är KUNDE-EJ-GRANSKA, aldrig tyst grön.
>
> **Återställs av:** M1-reparation R3 — verkligt innehåll från
> `vercel-labs/web-interface-guidelines` vid exakt pinnad commit-SHA, vendorerat som bytes med
> uppdaterad VENDORED.md (källa, commit, licens, hash). Färskhet därefter endast via
> Radar → kandidat → diff → granskning → promotion. Se masterplanen (Part 12, R3).
