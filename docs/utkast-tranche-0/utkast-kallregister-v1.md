> **UTKAST — TRANCHE 0 (2026-08-24). EJ PRODUKTION, EJ AUKTORITET.**
> Design-utkast enligt den DESIGN-FRUSNA masterplanen. Konsumeras av INGENTING
> före FOUNDATION_REPAIR_GATE; skarp version landar i sin riktiga hemvist i S1+.

# Utkast: kallregister v1 (`config/kallregister.json`)

Kandidat till K1 enligt masterplan Part 2 D + Part 2c F–H, med volatilitetsdata
verifierade i T-1 (2026-08-24). Skarp hemvist: `nortropic-system/config/kallregister.json`
(kräver `.gitignore`-whitelistrad i K0). Konsument: radarn (`skills/nortropic-radar/`)
+ doctor #14.

## Lagar

- **Tier är enbart COLD-START PRIOR** (DO-NOT-BUILD #28). Mätt Source Alpha är
  slutmålet; `alpha` är reserverad `null` tills ≥6 radarcykler gett
  konsultations-/utfallstabeller. Ingen kod i v1.
- **Embryon viks in via PEKARE, aldrig duplicering** (one-home): VENDORED.md-raderna
  delegerar till doctor #9, models.json till doctor #13, inspirationskällor får
  klass/kadens-rader medan prosafilen förblir plannerns auktoritet.
- **Registret är aldrig auktoritet.** Färskhet in i produktion sker uteslutande
  via Radar → kandidat → verifiering → promotion. LATEST = KANDIDAT.
- **Fail-soft:** saknat register/rapport degraderar till ODÖMBAR — blockerar
  aldrig bygge eller grind (ingen dold runtime-dependens).

## Schema (per rad)

```
{ id, namn, url, klass: NORMATIVE|PLATFORM|PRACTICE|CRAFT|FRONTIER|INTERNAL,
  styr: [domäner/operativa sökvägar], volatilitet_dagar,
  andringsdetektion: { typ: npm-version|changelog-url|rss|atom|errata-page|
                            github-releases|doctor-check|manual, ref },
  konsument: [], tier: "A|B|C  // COLD-START PRIOR, aldrig auktoritet",
  alpha: null,           // Source Alpha-sömmen — beräkningsbar vid ≥6 cykler
  not: "valfri" }
```

Utkastsavvikelse mot plan D: typ-enum utökad med `atom` och `github-releases`
(krävs av Next.js-advisories resp. Part 2c-lanes B/C). Bekräftas av ägaren.

## Kandidat-JSON

```json
{
  "version": 1,
  "status": "UTKAST-TRANCHE-0 — EJ PRODUKTION",
  "reviderad": "2026-08-24",
  "tier_not": "COLD-START PRIOR (DO-NOT-BUILD #28). Mätt Source Alpha ersätter tier vid >=6 cykler.",
  "rader": [
    {
      "id": "vendored-skills",
      "namn": "Vendored designkanon (9 skills, VENDORED.md-rader)",
      "url": "nortropic-system/vendored-skills/*/VENDORED.md",
      "klass": "INTERNAL",
      "styr": ["design", "innehall"],
      "volatilitet_dagar": 30,
      "andringsdetektion": { "typ": "doctor-check", "ref": "doctor #9 (drift-diff lokal<->facit); uppstroms-nyhet via lane B-rader nedan" },
      "konsument": ["radar lane B", "steward drift-diff"],
      "tier": "A",
      "alpha": null,
      "not": "PEKARE — doctor #9 ager mekaniken. Uppstroms-provenans repareras i M1 R2/R3."
    },
    {
      "id": "bild-models",
      "namn": "Bildmodellregister (models.json)",
      "url": "nortropic-system/skills/nortropic-bild/references/models.json",
      "klass": "INTERNAL",
      "styr": ["design"],
      "volatilitet_dagar": 90,
      "andringsdetektion": { "typ": "doctor-check", "ref": "doctor #13 (<90d revision; avvecklad modell = FAIL)" },
      "konsument": ["radar lane D", "nortropic-bild"],
      "tier": "A",
      "alpha": null,
      "not": "PEKARE — doctor #13 ager mekaniken."
    },
    {
      "id": "inspirationskallor",
      "namn": "Inspirationskallor (auktoritetsviktning)",
      "url": "nortropic-system/skills/.../inspirationskallor.md",
      "klass": "INTERNAL",
      "styr": ["design"],
      "volatilitet_dagar": 90,
      "andringsdetektion": { "typ": "manual", "ref": "kvartalsvis CRAFT-cykel (aterrendera premium-bevis-URL:er)" },
      "konsument": ["radar CRAFT-cykel", "planner"],
      "tier": "B",
      "alpha": null,
      "not": "PEKARE — prosafilen forblir plannerns auktoritet; registret ger bara klass/kadens."
    },
    {
      "id": "wcag22",
      "namn": "WCAG 2.2 + errata",
      "url": "https://www.w3.org/TR/WCAG22/ (errata: https://www.w3.org/WAI/WCAG22/errata/)",
      "klass": "NORMATIVE",
      "styr": ["tillganglighet"],
      "volatilitet_dagar": 180,
      "andringsdetektion": { "typ": "errata-page", "ref": "diff av errata-sidan" },
      "konsument": ["kravNivaer a11y (WCAG22-AA)", "Gate 4", "radar NORMATIVE-kvartal"],
      "tier": "A",
      "alpha": null,
      "not": "EN 301 549 v4.1.x-anpassning till WCAG 2.2 vantad 2026 = schemalagd radarpost (EAA/PTS)."
    },
    {
      "id": "whatwg-review",
      "namn": "WHATWG Review Drafts (HTML m.fl.)",
      "url": "https://html.spec.whatwg.org/review-drafts/",
      "klass": "NORMATIVE",
      "styr": ["plattform"],
      "volatilitet_dagar": 180,
      "andringsdetektion": { "typ": "changelog-url", "ref": "Review Drafts jan/jul" },
      "konsument": ["radar NORMATIVE-kvartal"],
      "tier": "B",
      "alpha": null,
      "not": "Substansen anlander via Baseline (web-features); denna rad ar spec-ankaret."
    },
    {
      "id": "web-features",
      "namn": "web-features (npm) — Baseline-status",
      "url": "https://www.npmjs.com/package/web-features",
      "klass": "PLATFORM",
      "styr": ["plattform", "prestanda"],
      "volatilitet_dagar": 30,
      "andringsdetektion": { "typ": "npm-version", "ref": "diff tva versioner = exakt 'newly Baseline'-lista" },
      "konsument": ["byggkanonen (vad genererad kod far anvanda)", "radar PLATFORM-manad"],
      "tier": "A",
      "alpha": null,
      "not": "DET hogst vardefulla flodet (T-1 #1): substituerar WHATWG+CSSWG+TC39+alla tre leverantorer individuellt."
    },
    {
      "id": "browser-compat-data",
      "namn": "@mdn/browser-compat-data (npm)",
      "url": "https://www.npmjs.com/package/@mdn/browser-compat-data",
      "klass": "PLATFORM",
      "styr": ["plattform"],
      "volatilitet_dagar": 30,
      "andringsdetektion": { "typ": "npm-version", "ref": "versionsdiff" },
      "konsument": ["byggkanonen", "radar PLATFORM-manad"],
      "tier": "B",
      "alpha": null
    },
    {
      "id": "chrome-release-notes",
      "namn": "Chrome release notes / deprecations",
      "url": "https://developer.chrome.com/release-notes",
      "klass": "PLATFORM",
      "styr": ["plattform", "prestanda"],
      "volatilitet_dagar": 30,
      "andringsdetektion": { "typ": "changelog-url", "ref": "release-notes-sidan; 2-veckorskadens fran v153" },
      "konsument": ["radar PLATFORM-manad"],
      "tier": "B",
      "alpha": null,
      "not": "Per-leverantorsbevakning infeasibel — radarn konsumerar AGGREGAT (web-features forst)."
    },
    {
      "id": "search-central",
      "namn": "Google Search Central docs changelog (RSS)",
      "url": "https://developers.google.com/search/updates/search_docs_updates.rss",
      "klass": "PRACTICE",
      "styr": ["sok"],
      "volatilitet_dagar": 30,
      "andringsdetektion": { "typ": "rss", "ref": "exakt feed-URL i url-faltet" },
      "konsument": ["seo-lokal/seo-kanon", "radar PRACTICE-manad"],
      "tier": "A",
      "alpha": null,
      "not": "Strukturdata-deprecieringar landar HAR forst (bevis: FAQPage 2026-05-07 vs var egen FaqSchema/kriterium-6 — kod K5-kandidat)."
    },
    {
      "id": "nextjs",
      "namn": "Next.js releases + GitHub Security Advisories",
      "url": "https://github.com/vercel/next.js/releases.atom",
      "klass": "PLATFORM",
      "styr": ["plattform", "sakerhet"],
      "volatilitet_dagar": 30,
      "andringsdetektion": { "typ": "atom", "ref": "releases.atom + GHSA; npm-version som fallback" },
      "konsument": ["nortropic-stack", "gates", "radar FAST-lane"],
      "tier": "A",
      "alpha": null,
      "not": "ENDA flodet med <48h-reaktionskrav (jfr CVE-2025-29927). OBS: Next 15 EOL 2026-10-21 — fabrikens pinnade create-next-app@15 faller ur sakerhetsstod."
    },
    {
      "id": "tailwind",
      "namn": "Tailwind CSS releases",
      "url": "https://github.com/tailwindlabs/tailwindcss/releases",
      "klass": "PLATFORM",
      "styr": ["plattform", "design"],
      "volatilitet_dagar": 90,
      "andringsdetektion": { "typ": "github-releases", "ref": "releases-flode" },
      "konsument": ["nortropic-stack", "radar PLATFORM"],
      "tier": "B",
      "alpha": null
    },
    {
      "id": "baymard",
      "namn": "Baymard Institute (guidelines, fri niva)",
      "url": "https://baymard.com/",
      "klass": "PRACTICE",
      "styr": ["design", "innehall"],
      "volatilitet_dagar": 180,
      "andringsdetektion": { "typ": "manual", "ref": "halvarsskim; premium = trigger-beslut" },
      "konsument": ["BoK/claims", "radar PRACTICE"],
      "tier": "B",
      "alpha": null,
      "not": "All forskning ar transaktionsflode; INGEN lead-gen/local-service-tackning finns (verifierad lucka). Baymards evidensform ar MALL for var egen evidenslager."
    },
    {
      "id": "svensk-juridik",
      "namn": "Svensk juridik / IMY / EU-digital (Omnibus)",
      "url": "https://www.imy.se/nyheter/",
      "klass": "NORMATIVE",
      "styr": ["sakerhet", "drift-affar"],
      "volatilitet_dagar": 180,
      "andringsdetektion": { "typ": "manual", "ref": "handelsedrivet + MANADSVIS IMY-skim under pagaende tillsynsvag (cookie-viten 300k-12M SEK)" },
      "konsument": ["juridikflaggor (pekare — §A4-hem rors ej)", "radar NORMATIVE"],
      "tier": "A",
      "alpha": null,
      "not": "Cookiefria sajter konverterar HIGH-volatilitet till LOW (husets default). Juridik forblir human-only."
    },
    {
      "id": "sk-emilkowalski",
      "namn": "emilkowalski/skills (uppstrom for emil-design-eng, find-animation-opportunities)",
      "url": "https://github.com/emilkowalski/skills",
      "klass": "CRAFT",
      "styr": ["design", "vendored-skills/emil-design-eng", "vendored-skills/find-animation-opportunities"],
      "volatilitet_dagar": 30,
      "andringsdetektion": { "typ": "github-releases", "ref": "commits/releases mot pinnad SHA (veckoaktiv)" },
      "konsument": ["radar lane B", "M1 Emil-livscykelexemplar"],
      "tier": "B",
      "alpha": null,
      "not": "Levande staleness-bevis: Radix->Base-UI-commit 2026-07-21 postdaterar vendreringen med 3 dagar. LATEST = KANDIDAT, aldrig auto-uppdatering."
    },
    {
      "id": "sk-vercel-labs",
      "namn": "vercel-labs/agent-skills + web-interface-guidelines",
      "url": "https://github.com/vercel-labs/web-interface-guidelines",
      "klass": "PRACTICE",
      "styr": ["design", "vendored-skills/web-design-guidelines"],
      "volatilitet_dagar": 30,
      "andringsdetektion": { "typ": "github-releases", "ref": "releases/commits mot pinnad SHA (R3 pinnar bytes)" },
      "konsument": ["radar lane B", "M1 R3"],
      "tier": "B",
      "alpha": null,
      "not": "Dagens main-branch-WebFetch-shim ar 0A-containment-objekt; denna rad ar dess lagliga ersattare (delta -> kandidat -> promotion)."
    },
    {
      "id": "sk-anthropics",
      "namn": "anthropics/skills (uppstrom for frontend-design)",
      "url": "https://github.com/anthropics/skills",
      "klass": "CRAFT",
      "styr": ["design", "vendored-skills/frontend-design"],
      "volatilitet_dagar": 30,
      "andringsdetektion": { "typ": "github-releases", "ref": "commits/releases mot vendored-datum 2026-07-19" },
      "konsument": ["radar lane B"],
      "tier": "B",
      "alpha": null
    },
    {
      "id": "in-chrome-devtools-mcp",
      "namn": "chrome-devtools-mcp releases",
      "url": "https://github.com/ChromeDevTools/chrome-devtools-mcp/releases",
      "klass": "PLATFORM",
      "styr": ["prestanda", "instrumentarium"],
      "volatilitet_dagar": 30,
      "andringsdetektion": { "typ": "github-releases", "ref": "releases; hash+diff av TOOL-DESCRIPTIONS mellan sessioner (rug-pull-forsvar)" },
      "konsument": ["radar lane C", "instrumentarium.md"],
      "tier": "B",
      "alpha": null,
      "not": "Formaliserad konfig kraver --no-performance-crux --no-usage-statistics --isolated + URL-allowlist (klientkonfidentialitet). MCP = observationsinstrument, aldrig grindauktoritet (patch #8)."
    },
    {
      "id": "in-playwright-cli",
      "namn": "@playwright/cli",
      "url": "https://www.npmjs.com/package/@playwright/cli",
      "klass": "PLATFORM",
      "styr": ["instrumentarium"],
      "volatilitet_dagar": 30,
      "andringsdetektion": { "typ": "npm-version", "ref": "versionsdiff" },
      "konsument": ["radar lane C", "granssnittskonkurrens (MCP vs CLI, ~4x tokenhypotes)"],
      "tier": "B",
      "alpha": null
    },
    {
      "id": "in-axe-core",
      "namn": "@axe-core (cli/engine)",
      "url": "https://www.npmjs.com/package/@axe-core/cli",
      "klass": "PLATFORM",
      "styr": ["tillganglighet", "instrumentarium"],
      "volatilitet_dagar": 90,
      "andringsdetektion": { "typ": "npm-version", "ref": "versionsdiff; regeluppsattningsandringar = MATERIAL" },
      "konsument": ["Gate 4 (efter R6 — pinnad @axe-core/cli backar grindens pastaende)", "radar lane C"],
      "tier": "A",
      "alpha": null
    },
    {
      "id": "in-lighthouse",
      "namn": "Lighthouse releases",
      "url": "https://github.com/GoogleChrome/lighthouse/releases",
      "klass": "PLATFORM",
      "styr": ["prestanda", "instrumentarium"],
      "volatilitet_dagar": 30,
      "andringsdetektion": { "typ": "npm-version", "ref": "versionsdiff; MAJOR = obligatorisk materialitetsklassning" },
      "konsument": ["Gate 2 (pinnad CLI per R7)", "radar lane C"],
      "tier": "A",
      "alpha": null,
      "not": "Bevisfall: 12->13-brottet (insight-taxonomi, legacy-audits borttagna) fangades av research, inte produktionshaveri. Opinnad npx over grindtrosklar >=90/>=95 = 0A-demoterad."
    }
  ]
}
```

## Doctor #14 (ny, tri-state, fail-soft)

| Verdikt | Villkor |
|---|---|
| PASS | registret parsar; ingen NORMATIVE/PLATFORM-rad försenad mot `volatilitet_dagar` (mätt mot senaste radarcykelrapport) |
| WARN | registret parsar; ≥1 NORMATIVE/PLATFORM-rad försenad — namnge raderna |
| ODÖMBAR | registerfil eller cykelrapport saknas/oparsbar — **degradera, blockera aldrig** |

**Lag:** doctor #14 är hälsorapportering, aldrig grindinput. Ett trasigt register
får aldrig stoppa bygge/launch (fail-soft; förhindrar dold runtime-dependens på
kunskapslagret). ODÖMBART är aldrig grönt.

## Öppna frågor till ägaren

1. Typ-enum-utökningen `atom` + `github-releases` avviker från plan D:s enum —
   godkänn utökningen eller vik in under `changelog-url`/`rss`.
2. IMY-raden: dubbel kadens (180d bas + månadsskim under tillsynsvågen) uttrycks
   här i `not`-fältet. Vill ägaren ha ett explicit `kadens_undantag`-fält, eller
   räcker prosa tills radarn behöver det mekaniskt?
3. Next.js: en rad (atom + GHSA i samma `ref`) eller två separata rader
   (releases resp. advisories) — en rad föreslås; advisories är FAST-lane.
4. Tier-värdena är kallstarts-gissningar (per T-1-ranking). Bekräfta eller
   justera innan K1 — de blir aldrig auktoritet men styr radarns uppmärksamhet.
5. `styr` blandar domäner och operativa sökvägar (plan D tillåter båda). OK, eller
   ska fältet delas i `styr_doman`/`styr_sokvag` innan impact-greppen skrivs?
