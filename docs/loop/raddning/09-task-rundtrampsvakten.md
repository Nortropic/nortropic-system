# Taskspec: rundtrampsvakten

**Skriven 2026-09-16 för `$nortropic-test-author`.** Detta är ett utkast att frysa, inte
en implementation. Ägaren har godkänt att vakten byggs; **Codex bygger den, inte Claude**
— skälen står i §5.

---

## §1. Varför den ska finnas

Paketets tripwires (`05-arbetsordning.md` §4) är **elva rader prosa, kodade i noll
artefakter**. Ignoreras de händer ingenting. Det är samma regel-utan-mekanism som fällt
tretton påståenden i detta projekt den här veckan.

Vakten gör fyra av dem mekaniska. **Med gren 2 i sin omskrivna form hade den fällt H-039
vid runda 4 i stället för 33** — grinden hade då rörts fyra gånger, en över budgeten som
de klara taskarna faktiskt höll sig inom.

**Den vaktar doktrinen från `03-raddningsplan.md` steg 1b** — den är inte en fristående
heuristik. Varje gren nedan motsvarar en doktrinregel, och utan doktrinbeslutet först har
vakten inget att luta sig mot.

---

## §2. ⚠️ Blockerande designfråga — avgörs av `$nortropic-architect` FÖRST

**Var ska vakten bo?** Alla tre placeringarna har en defekt:

| Placering | Konsekvens |
|---|---|
| `scripts/check-rundtramp.mjs` | `kor-vakter.mjs` rad 96–101 plockar upp `check-*.mjs` automatiskt → vakten hamnar i **webbfabrikens grindsvit**, som `CLAUDE.md` säger inget bevisar om kärnan. Upprepar exakt den felplacering `06-inventering.md` §0b dokumenterar |
| `scripts/kor-rundtramp.mjs` | `kor-*` plockas inte upp. Rätt lager, men **ingen anropar den** — "en kontrollprövad funktion som kringgås på anropsstället är död kod" |
| Ny kernelvaktkörare | Korrekt, men det är `03-raddningsplan.md` **steg 5** och en större ändring |

`verify/bin/` bär bara task-exitprov och har ingen plats för en stående vakt. **Kärnan har
ingen vaktkörare alls.** Det är hela problemet i miniatyr.

**Rapportera `OWNER_DECISION_REQUIRED` → intern routing till architect.** Det är inte ett
mänskligt stopp (`05-arbetsordning.md` §1).

---

## §3. Taskutkast — formen `specs/tasks.spec.json` använder

```json
{
  "id": "h-040",
  "authority_class": "ordinary",
  "title": "Rundtrampsvakten — mekanisk gräns för omfrysningsrundor",
  "summary": "En vakt som FÄLLER när en hypotes överskrider sin deklarerade rundbudget, när en tasks exit_test frysts om fler gånger än sin omfrysningsbudget eller dömt en kandidat som byggts mot en annan version av samma grind (MÅLFLYTT), när NO-CREDIT växer utan att någon task blir grön, eller när ett nyfryst exitprov binder sig till värdmaskinskonstanter.",
  "allowed_write": ["<AVGÖRS I §2>", "docs/05-beslutslogg.md", "docs/loop/drift.md"],
  "exit_test": "<AVGÖRS I §2>",
  "depends_on": ["doktrinbeslutet i 03-raddningsplan.md steg 1b"],
  "docs_impact": ["docs/loop/regler.md", "docs/05-beslutslogg.md"]
}
```

`allowed_write` och `exit_test` kan inte fyllas i förrän §2 är avgjord. **Frys inte
tasken med platshållare.**

---

## §4. De fyra grenarna, med exakt fällkriterium

Varje gren motsvarar en doktrinregel. Tröskelvärden är **parametrar som ska deklareras
per hypotes**, inte konstanter vakten hittar på.

### Gren 1 — rundbudget (doktrin 1b iii)

Varje hypotes deklarerar en rundbudget i sin task. Vakten fäller när antalet unika
`R`-nummer för ett `H`-nummer i commit-titlar överskrider budgeten.

```bash
git log --format='%s' | grep -i "h-\?039" | grep -oiE '\bR[0-9]+' | sort -u | wc -l
```

**Historiskt:** H-032 21 rundor · H-039 32 · H-031 15 · H-035 8. En budget på 12 hade
fällt tre av fyra innan de blev vad de blev.

*Gren 2 biter tidigare och hårdare.* Rundräkningen mäter **aktivitet**; omfrysningen
mäter om **målet står still**. Behåll båda — men är de oense är gren 2 den som har en
mätt diskriminant bakom sig.

*En hypotes utan deklarerad budget ska fälla, inte passera.* Tom budget är ett fel, aldrig
frånvaro av krav.

### Gren 2 — ⭐ omfrysningsbudget för grinden (doktrin 1b **iv**)

**⚠️ OMSKRIVEN 2026-09-16. Den tidigare versionen mätte fel storhet.** Den räknade
grindfilens **byte-storlek**. Storleken är en följd; **omfrysningen är mekanismen**. En
grind kan växa av legitima skäl och kan flytta mål utan att växa alls.

Vakten fäller när antalet commits som **ändrar** en tasks `exit_test` överskrider dess
deklarerade omfrysningsbudget.

```bash
git log --oneline --follow -- verify/bin/h-039-exit | wc -l    # 30
```

**Detta är paketets starkaste gren, och den enda med en mätt diskriminant:**

| Task | Commits mot grinden | Utfall |
|---|---|---|
| `h-016` | 1 | klar |
| `h-013`, `h-017`, `h-038` | 2 | klara |
| `h-001`, `h-036` | 3 | klara |
| `h-035` | 17 | pågår |
| `h-039` | 30 | pågår |
| `h-032` | 120 | pågår |
| `h-031` | **147** | pågår |

**⚠️ Tabellens kolumn "klara" är falsifierad 2026-09-16 (FYND 33).** Omfrysningstalen
stämmer; etiketterna inte. Körda på Macen i ren klon är `h-016` (1) `11 PASS / 14 FAIL`
och `h-013` (2) `8 PASS / 8 FAIL`. Läs kolumnen som *"slutade röras"*, inte *"blev klar"*.

Kvar står den ena riktningen: **många omfrysningar ⇒ icke-klar**, mätt 17–147. Tröskeln 3
är fortfarande **observerad och inte vald** — men den observerar var arbetet UPPHÖRDE, och
det är ändå rätt ställe att fälla. Vakten hade fällt H-039 vid runda 4, inte 33.

**Andra fällkriteriet i samma gren — MÅLFLYTT per runda:** när en runda rapporteras som
`NO-CREDIT` ska vakten jämföra grinden kandidaten byggdes mot med den som dömde. Är de
inte bytesidentiska är utfallet `MÅLFLYTT`, inte kandidatdefekt, och rundan bokförs mot
specifikationen. Provet kräver ingen bedömning — bara en `git diff`.

*Storleksmåttet behålls som sekundär signal*, aldrig som ensamt fällkriterium: en grind
som går från 4,8 KB till 2,1 MB säger något, men den säger det för sent.

### Gren 3 — `NO-CREDIT` utan stängning

Fäller när antalet `NO-CREDIT`/`productless`-rader i `docs/loop/drift.md` växer sedan
förra mätningen **utan** att någon task fått ett grönt exitprov.

```bash
grep -c 'productless\|NO-CREDIT\|no product' docs/loop/drift.md   # 101
```

Detta är rundtrampet i sin renaste form: arbete som produceras utan att något stängs.

### Gren 4 — värdmaskinsbindning i nyfryst prov (doktrin 1b i)

Fäller när ett **nytt** fryst exitprov innehåller literaler av klassen `st_dev`, inod,
`com.apple.provenance`, volym-UUID, eller signed/unsigned-representation av
enhetsnummer.

Befintliga prov är frysta och undantas — men varje nytt prov ska bindas mot invariant.

---

## §5. Varför Codex bygger den, inte Claude

1. **Rollerna.** `AGENTS.md`: test-author fryser gaten, builder bygger mot den. Claude är
   ingendera; att göra båda i samma drag är den rollblandning regelverket förbjuder.
2. **Rollen, inte åtkomsten.** 403:an är löst sedan 2026-09-16, så skälet är numera
   enbart rollseparationen i punkt 1 och 3–4. Det gör argumentet starkare, inte svagare.
3. **Claudes facit den här veckan är tretton fel av samma klass.** En vakt skriven ensam blir
   ännu en artefakt som kräver oberoende omhärledning.
4. **Det är det första äkta provet på påståendet.** Kan loopen inte bygga sin egen
   hälsovakt — en liten, avgränsad task med alla beroenden gröna — är det ett fynd, inte
   ett bakslag. Byggs den åt den får vi aldrig veta.

---

## §6. Krav på bygget

- **Positivt kontrollprov per gren:** en muterad kopia som SKA fällas och bevisligen gör
  det. Fyra grenar, fyra mutationer.
- **Kopplingskontroll:** att vakten faktiskt anropas från den plats §2 bestämmer.
- **Svenska teckenklasser:** `\w` missar Å/Ä/Ö och har tyst blindat två kontroller här.
- **Landar den i `scripts/` som `check-*`:** vaktantalet går 23 → 24, och
  `check-docs-coherence.mjs` rörliga nämnare måste följa med.
- **Rapportera med faktiskt kommando + exitkod.** `ODÖMBART` blir aldrig grönt.

---

## §7. Vad som INTE ingår

Vakten mäter **rundtramp**, inte kvalitet. Den säger ingenting om huruvida en kandidat är
korrekt — bara om programmet har börjat gå i cirklar.

Den ersätter inte doktrinbeslutet i steg 1b. **Utan det har den inga trösklar att luta sig
mot**, och en vakt som hittar på sina egna gränser är samma fel som en agent som redigerar
sin egen mätstock.
