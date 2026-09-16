# Arbetspaket `h-014` — `VAGEN.md` FAS 4

*Filnamnet säger `10-forsta-arbetspaketet-h014.md` och är missvisande. Namnet står kvar
för att ett tjugotal referenser pekar på det; rubriken är rättad i stället.*

> ⚠️ **DETTA ÄR INTE FÖRSTA ARBETSPAKETET.** Titeln är från innan kartan mättes.
> `h-014` är `VAGEN.md` FAS 4; vägens första bygge är `h-009`. **Läs filen som
> ARBETSPAKET — dess spec, grindkrav och rollflöde gäller oförändrat.**

**Skrivet 2026-09-16.** `h-014` är **redan fullt specad** i `specs/tasks.spec.json` —
till skillnad från rundtrampsvakten behöver ingenting uppfinnas. Det som saknas är
grinden.

---

## §1. RÄTTELSE — mitt påstående "alla beroenden gröna" var obevisat

Jag har fyra gånger under 2026-09-16 sagt att `h-014` är *"byggbar i dag, alla beroenden
gröna"*. **Det var härlett ur att gate-FILEN finns, inte ur att den PASSERAR** — exakt det
fel `06-inventering.md` §0 varnar för, skrivet av mig och begånget av mig i samma dokument.

Prövat:

```bash
bash verify/bin/h-013-exit    # exit=1 — 5 PASS, 11 FAIL
```

**Men felen är plattformsbundna, inte defekter:**

```
AttributeError: /lib/x86_64-linux-gnu/libc.so.6: undefined symbol: sysctl
```

`sysctl` finns i Darwins libc, inte i glibc. Kärnan är macOS-specifik — vilket
`docs/loop/byggplan-v3.md` §4 redan säger: *"Macen är fabriken. Molnsessioner är aldrig
verkstad."*

**Korrekt verdikt: `OVERIFIERAT`.** Om `h-013` är grön går inte att avgöra från en
Linux-container. **Codex måste pröva det på Macen innan `h-014` påbörjas.**

---

## §2. ⚠️ Kernelgatarna kan bara dömas på Macen

**Mätt 2026-09-16 i Linux-container:**

```bash
p=0; f=0
for g in verify/bin/h-0*-exit; do timeout 30 bash "$g" >/dev/null 2>&1 && p=$((p+1)) || f=$((f+1)); done
echo "PASS=$p FAIL=$f"     # PASS=6  FAIL=18
```

**18 av 24 kernelgatar faller på plattformen.** Det betyder:

1. **`06-inventering.md` §0:s metod "kör grinden" fungerar inte i molnet.** Den
   oberoende ominventeringen måste köras på Macen, annars mäter den operativsystemet.
2. **En molnsession som ser 18 röda kernelgatar har inte hittat ett fel.** Den har hittat
   fel maskin.
3. Detta är samma klass som `check-foundation-smoke`/origin, men bredare: **allt som
   bygger på att köra kärnans prov måste ske i fabriken.**

---

## §3. Vad specen redan bär — inget att uppfinna

Ur `specs/tasks.spec.json`, ordagrant:

| Fält | Innehåll |
|---|---|
| **id** | `h-014`, slice 12, `authority_class: ordinary` |
| **title** | Notisen — Slack från controllern |
| **allowed_write** | `controller/notis/**`, `tests/controller/notis/**`, `docs/05-beslutslogg.md` |
| **exit_test** | `verify/bin/h-014-exit` ← **saknas, ska frysas** |
| **depends_on** | `h-013` ← **OVERIFIERAT, se §1** |

**Summary:** `controller/notis/cli` skickar notis till en konfigurerad webhook vid de
fyra händelser som kräver en människa: brytare öppnad, kvot slut, körning slutförd med
minst en attestation, och task blockerad av oattesterat beroende. **Aldrig per varv.**
Controllern skickar, aldrig workern — annars är det modellen som avgör när ägaren störs.
Notisen är en **biverkan**: en trasig eller saknad webhook får aldrig påverka körningens
utfall. URL:en är en hemlighet, läses ur miljön, och ligger aldrig i repot.

**Exit-kriterium**, ordagrant — detta är vad test-author fryser mot:

> Mot en lokal mottagare, aldrig mot Slack: de fyra händelserna ger var sin notis som bär
> `run_id`, `task`, klass och orsak; ett vanligt lyckat varv ger ingen. Saknad webhook,
> ogiltig URL och mottagare som vägrar svara ger alla oförändrad exit-kod på körningen.
> URL:en förekommer inte i stdout, stderr eller något felmeddelande, mätt med en URL som
> bär en sökbar hemlighetssträng. Ingen notis skickas två gånger för samma händelse.

Sex prövbara egenskaper, alla observerbara. **Specen är färdig.**

---

## §4. Varför just denna task först

- **Ren kärna.** `allowed_write` rör bara `controller/`, `tests/controller/` och
  beslutsloggen. Inget webbträd, inget styrlager, inga frysta ankare.
- **Greenfield.** `controller/notis/` och `tests/controller/notis/` finns inte — inget
  att bryta.
- **Ett beroende.** Bara `h-013`, som redan är byggd (grönhet `OVERIFIERAT` tills Macen
  prövat den).
- **Den bevisar kedjan.** Frys gate → bygg mot den → mutationspröva → merga. Går det
  igenom vet du att loopen fungerar i den nya riktningen, mätt i stället för resonerat.
- **Den blockeras inte av något i räddningsplanen.** Kan gå parallellt med
  separationsrevisionen och nollmätningen.

---

## §5. Ordningen

```
0. På MACEN: bash verify/bin/h-013-exit
   grön  → fortsätt
   röd   → h-013 är inte klar; h-014 väntar, och det är ett eget fynd
1. test-author fryser verify/bin/h-014-exit mot exit-kriteriet i §3
   RED först — gaten fryses innan koden finns
2. builder bygger controller/notis/** inom allowed_write
3. mutationspröva varje egenskap i kriteriet:
   - webhook saknas       → körningens exit-kod oförändrad
   - ogiltig URL          → oförändrad
   - mottagare svarar ej  → oförändrad
   - hemlighetssträngen   → förekommer inte i stdout/stderr/fel
   - samma händelse 2×    → en notis
   - vanligt lyckat varv  → ingen notis
4. rad i docs/05-beslutslogg.md, PR, merga
```

**Gaten fryses RED först.** Byggs den efter koden kan den skrivas så att det redan gjorda
passerar — samma princip som `autonomous-loop-exit` och §A2.

---

## §6. Vad detta INTE bevisar

Att `h-014` går igenom bevisar att **kedjan fungerar för en enkel, ren kerneltask**. Det
bevisar inte `KERNEL_COMPLETE`, inte supervisor resume, och inte att `h-039` konvergerar.

Men det är den första mätningen sedan 2026-08-07 som skulle säga något om riktningen i
stället för om takten.
