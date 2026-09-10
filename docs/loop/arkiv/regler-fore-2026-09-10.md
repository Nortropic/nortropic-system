# Historisk kopia: `docs/loop/regler.md` före 2026-09-10

**Arkiverad 2026-09-10.** Detta är den fullständiga texten av `docs/loop/regler.md` som den stod vid plattformsintegrationen `512490d44007373b79aca504aa92709e9810aa24` (oförändrad sedan `b0bc10ae…`), bevarad ordagrant för spårbarhet. Den bar webbförvaltningens styrning (webbens grundtexter, den ursprungliga §A-mängden med webbfiler, kravet på mänsklig HÖGRISK-commit). Den styrningen gäller inte plattformen och detta är inte dagens instruktion; den aktiva filen är `docs/loop/regler.md`.

---

# Loop-reglerna — bindande för allt kontrollplansbygge

**Beslutade 2026-08-07 · ändras endast av Johnny · gäller `controller/`, `specs/`, `verify/` och loop-PR:er**

Dessa regler styr bygget av Nortropics autonomiplattform. Konstitutionen
och regelverket står fortsatt över loopreglerna med sina uttryckliga
tillämpningsområden. Webbkundens brief- och kvalitetskrav är inte
plattformens universella funktionskrav. Samtliga skyddade ytor och
ändringsvägar bevaras. Plattformens avsedda gräns anges i
harness-substitution-contract-v1.md §1; den texten ger inte undantag från
högre auktoritet.

1. Inget bygge utan spec-rad i `specs/tasks.spec.json` och exit-test definierat före start.
2. Allt arbete i repot, på gren `nortropic/loop-<id>`, committat per delsteg.
3. Komponenter använder planens namn (skiva 1–9, där 6b/6c/8/9 tillkom via LOOP-ÄGARHAND-16–27; §-referenser). Inga nya kodnamn.
4. Vid fel: fixa och kör om samma test. Bygg aldrig en ny klassificerare eller checkpoint.
5. Ingen sudo. Kontrollplanet körs som användare.
6. §A-mängden i [byggplan-v3.md](byggplan-v3.md) §3.1 rörs aldrig av en loop-task.
   Ändringar där är alltid människa, alltid HÖGRISK-märkt commit.
7. Docs uppdateras i samma commit som systemändringen (regel 17 + 22).
8. Bevisregeln: varje rapporterat påstående pekar på verktygsbevis ur samma session.
   Overifierat märks OVERIFIERAT. "Klart" sägs aldrig utan kört exit-test.
9. Scope: gör det enklaste som uppfyller exit-testet. Inga oombedda skyddslager,
   frysled, auktorisationskedjor eller framtidssäkring.
10. Plattformsbygget utför inte kundflödet. Verksamhetsuppdrag får senare
använda kvalificerade plattformsgränssnitt inom eget giltigt mandat.
Detta ändrar inte regel 16 eller 21 och aktiverar ingen sådan körning.
