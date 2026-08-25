# VENDORED: find-animation-opportunities

## AKTUELLT TILLSTÅND — R9 LOCAL_NORTROPIC_FORK (2026-08-25)

Produktionsenheten är en **avsiktlig lokal integrationspatch** på bevisad uppströmsbas:
`LOCAL_NORTROPIC_FORK` (samma konvention som impeccable R4 — bevisad bas + SLUTET patchset).

- **Uppströmsbas (bevisad, R2)**: `github.com/emilkowalski/skills` —
  `skills/find-animation-opportunities/SKILL.md` @ commit
  `97d75fd51184c9fe849242f9f26ee136e2ba9818` (2026-07-15), 1/1 byte-bevisad i fullhistorik-klon.
  För-R9-blob: `0ebba8a5a18a84554571863ae939d70d18955bc7`, sha256
  `3d6533767ebcf4fb73ee7a2d9544a88671d09d50c4bf36c9b824768bca1dd9fb`. Licens: MIT (LICENSE i
  uppströmsrepot sedan 2026-06-22).
- **Nuvarande payload**: `SKILL.md` — blob `61aed30d24d005213100b8fb3fbf1cd591f449e1`, sha256
  `1cf83c70a8d2469dbea395714b19c7d4629ee602e9d9d0458c0aa988a0aefd3b`. INTE längre byte-identisk
  med uppströmsbasen — se patchsetet nedan.

### NORTROPIC-PATCHSET R9 (slutet — hela deltat mot uppströmsbasen, EN fil, FYRA semantiska platser)

Uppströmsbytes hänvisade till systerskillsen `improve-animations`/`review-animations` — verkliga
syskon i samma uppströmscommit (mekaniskt verifierat i R2), men ALDRIG kanoniska Nortropic-skills:
i produktion var hänvisningarna dinglande kapacitetslöften. R9 stänger dem genom att peka om till
Nortropics REDAN auktoriserade motion-rutt (design-reviewer-lagen: skillen föreslår —
`stack-builder` implementerar inom briefens Motion-nivå — `design-reviewer`-kanonen granskar).
Systerskillsen PROMOTERADES INTE — uppströmsexistens är kandidat-evidens, aldrig auktoritet.

1. **Frontmatter-description (slutmeningen)**: "use improve-animations or review-animations
   instead" → granskning/fix av befintlig animation hör till Nortropics ordinarie
   design-review-fil.
2. **Rollgräns (inledningen)**: "(that's `review-animations`)"/"(that's `improve-animations`)" →
   ordinarie rutten: `stack-builder` implementerar (Motion-nivå), `design-reviewer`-kanonen
   granskar.
3. **Hard Rule 1 (handoff)**: "`improve-animations plan <description>`" → receptraden ÄR
   handoff-artefakten; `stack-builder` implementerar den (Motion-nivå).
4. **Part 3 Verdict (handoff)**: "`improve-animations plan <suggestion>`" → varje rad är ett
   självbärande recept för `stack-builder` (eller valfri implementerande agent); resultatet
   granskas av `design-reviewer`-kanonen.

Ingen annan animationsvägledning ändrades: read-only-semantiken, Gate-logiken
(frekvens/syfte/hastighet/funktion), förslagstaket (5–7), jaktlistan, exakta motion-värden,
reduced-motion-/hover-/prestandareglerna och tonen är byte-orörda (mekaniskt verifierbart:
diffen mot för-R9-bloben träffar exakt de fyra platserna ovan).

- **Antal filer**: 2 (SKILL.md + denna fil). Trädet vaktas av R5-manifestet + foundation-K5a.
- **Load-bearing-roll**: design-reviewer processteg 2 'Ladda designkanonen' (bunden till briefens
  Motion-nivå). Rutten oförändrad: skillen föreslår — stack-builder implementerar.
- **Färskhet**: uppströmsändringar (uppström var redan vid R2 förbi basen: 0/1 basblobbar kvar på
  HEAD) är ENDAST kandidat-evidens via Radar → kandidat → diff → granskning → promotion.
  LATEST=KANDIDAT, ALDRIG AUKTORITET. Ingen självuppdatering, ingen mutable-fetch.

---

## HISTORIK (SUPERSEDED — beskriver INTE nuvarande beteende)

### Ursprunglig vendorering (2026-07-18)

- **Källa**: lokal installation `~/.claude/skills/find-animation-opportunities/`
  (tredjeparts-/marketplace-skill; exakt uppström då okänd)
- **Innehållshash**: `138029c24d68fd345fbd471d501c13c775ee20cd9278940a827a948690487b81`
  (odokumenterat recept, ej reproducerbart) · 1 fil

### PROVENIENS (R2 2026-08-25) — basbeviset, fortsatt giltigt

- 1/1 byte-identisk @ emilkowalski/skills `97d75fd5` (git-blob-SHA-match i fullhistorik-klon);
  klass då `VERIFIED_UPSTREAM`; R2-innehållshash (R2-recept):
  `a062bd46c3f5c33c116b4e743d445c28d6e1a1db94b86982bf82bc9337be50f8`.
- R2 noterade de dinglande systerreferenserna (`improve-animations`/`review-animations` finns
  inte i systemet) och sköt hanteringen till R9 — exekverat ovan; klassen övergick därmed
  `VERIFIED_UPSTREAM` → `LOCAL_NORTROPIC_FORK` (bevisad bas + slutet patchset).
