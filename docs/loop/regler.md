# Loop-reglerna — bindande för allt kontrollplansbygge

**Beslutade 2026-08-07 · gäller `controller/`, `specs/`, `verify/` och loop-PR:er · ändras
genom det autonoma kontraktsflödet (regel 11), aldrig genom en loop-tasks kandidat**

Dessa regler styr bygget av Nortropics autonomiplattform. Plattformens auktoritetsordning
är plattformsdokumenten enligt `AGENTS.md`: substitutionskontraktets §1, dessa regler,
byggplan v3, specen, den frysta `exit_test` och plan-/driftdokumenten under `docs/loop/`.
Webbens styrning gäller inte plattformen; den text som före 2026-09-10 stod här finns
ordagrant i Git-historiken (`dae90c8f:docs/loop/regler.md`) och i webbrepot med proveniens. Webbkundens
brief- och kvalitetskrav är inte plattformens universella funktionskrav. Plattformens
avsedda gräns anges i harness-substitution-contract-v1.md §1.

1. Inget bygge utan spec-rad i `specs/tasks.spec.json` och exit-test definierat före start.
2. Allt arbete i repot, på gren `nortropic/loop-<id>`, committat per delsteg.
3. Komponenter använder planens namn (skiva 1–9, där 6b/6c/8/9 tillkom via LOOP-ÄGARHAND-16–27; §-referenser). Inga nya kodnamn.
4. Vid fel: fixa och kör om samma test. Bygg aldrig en ny klassificerare eller checkpoint.
5. Ingen sudo. Kontrollplanet körs som användare.
6. Den skyddade mängden (§A) i [byggplan-v3.md](byggplan-v3.md) §3.1 är specens
   `defaults.denied_write` — `verify/**`, `specs/**`, `controller/verify/register.json`,
   `scripts/check-invariants.mjs`, `.gitignore`, `CLAUDE.md` — och rörs aldrig av en
   loop-task: `controller/policy/cli` avvisar kandidaten med exit 3 oavsett task, före
   varje lindrigare avslag. Ändringar i mängden går genom kontraktsflödet i regel 11.
7. Docs uppdateras i samma commit som systemändringen (regel 17 + 22).
8. Bevisregeln: varje rapporterat påstående pekar på verktygsbevis ur samma session.
   Overifierat märks OVERIFIERAT. "Klart" sägs aldrig utan kört exit-test.
9. Scope: gör det enklaste som uppfyller exit-testet. Inga oombedda skyddslager,
   frysled, auktorisationskedjor eller framtidssäkring.
10. Plattformsbygget utför inte kundflödet. Verksamhetsuppdrag får senare
använda kvalificerade plattformsgränssnitt inom eget giltigt mandat.
Detta ändrar inte regel 16 eller 21 och aktiverar ingen sådan körning.
11. Rollerna och kontraktsflödet. **test-author** fryser specrad, fryst grind (RED före
    implementation) och utvecklingsdokument och skriver ingen produkt. **builder**
    implementerar inom taskens `allowed_write` och ändrar aldrig sin egen frysta grind eller
    sitt eget kontrakt. En oberoende **granskare** (reviewer, read-only) försöker
    falsifiera grinden respektive kandidaten och certifierar aldrig egna ändringar.
    Kontraktsändringar — spec, grindar, verifierarregister, pinnar, dokumentbindningar — går
    genom samma flöde: ny test-author-frys → oberoende granskning → builder → oberoende
    granskning → lokal kvalificering. Ingen mellanhand ingår; rollseparationen är
    workflow-separation och skydden i regel 12 är gränsen.
12. De tekniska skydden är krav, inte prosa. (a) Identitet: kandidatens SHA är en commit i
    repot och domen, grinden och attestationen binder exakt den. (b) Behörig skrivning:
    den skyddade mängden (regel 6) och taskens `allowed_write` verkställs av
    `controller/policy/cli`, aldrig av en egen lista. (c) Verifierare: `controller/verify/cli`
    kör bara verifierare som står i `controller/verify/register.json` med matchande sha256;
    saknad verifierare eller `hash_mismatch` är vägran före körning. (d) Ingen falsk PASS:
    PASS finns bara som en fryst grinds exitkod 0 med `result.json` — aldrig som rapport,
    sessionsstatus, provider-`READY` eller granskarens ord.
13. Fasgräns (nuvarande fas): lokala immutabla commits och lokal kvalificering ingår; push,
    publicering, installation, livekörning och supervisor-resume ingår inte. Det är fasens
    omfång, inte ett permanent krav på mänskligt godkännande.
