# `lokal-se` — paketets grindlinser

Masterplanens §6 räknar upp sex paketdelar: manifest · research module · strategy module ·
**eval module** · **gate lenses** · **agent fragments**. `PK-GAP-3` namnger att kontraktet
bara kräver de tre första. **Detta är den femte.**

**Filen ÄR §A7-skyddad kalibreringsyta sedan 2026-08-27.** Den var det inte tidigare, och
skälet som stod här var korrekt så långt det gick: §A7 zonade `manifest.md`,
`research-module.md` och `strategi/*` för att de bär kvittolistor och juridikflaggor
(§7.4/§7.7), och grindlinser bär ingen av delarna — de säger bara vilken universell
kategori en paketspecifik iakttagelse hör hemma i.

**Det argumentet missade vad `GL-GAP-1`:s stängning gjorde med filen.** Kategoritabellen i
det §A3-skyddade `workflows/nortropic-launch.js` GENERERAS numera härifrån. Filen bär alltså
inte kvittolistor — men den SKRIVER in i en skyddad yta, och en oskyddad fil som genererar
in i en skyddad vänder skyddsriktningen. Zoneringen följer av vad filen GÖR, inte av vad den
innehåller.

---

## Fyndet som fick filen att skrivas

**Paketets linser fanns redan — men inte i paketet.** De ligger hårdkodade i
`workflows/nortropic-launch.js`:

```js
const CATEGORY_ALIAS = {
  'lokal-se:orter': 'seo',
  'lokal-se:gbp':   'trust',
  'lokal-se:jour':  'leadgen',
}
```

**Följden är arkitektonisk, inte kosmetisk:** ett andra paket kan inte tillföra en lins
utan att någon redigerar grindworkflowet. Masterplanens D2 säger att *"packs are named
compositions of capabilities"* — en komposition som kräver att värden ändras är ingen
komposition. Det är samma fynd som `PK-GAP-1` pekar på, i konkret form.

## Linserna

| Lins | Universell kategori | Vad den tittar efter | Varför den aliasar dit |
|---|---|---|---|
| `lokal-se:orter` | `seo` | Ortssidornas kvalitet — tunna ortssidor, meta/H1-integritet per ort | En ortssida är en sida; dess kvalitet är ett sökfynd |
| `lokal-se:gbp` | `trust` | Google Företagsprofil-konsistens, NAP mot `business.ts`, `address.publik`→PostalAddress | En felaktig adress är ett förtroendefynd innan det är ett sökfynd |
| `lokal-se:jour` | `leadgen` | Jour-/svarstidslöften: att de finns i researchen innan de står på sajten | Ett löfte om svarstid är en konverteringsmekanism |

## Lagen som gör linserna ofarliga

> **En paketlins får ALDRIG hitta på en egen kategori — den aliasar in på en universell.**

Skälet står i `workflows/nortropic-launch.js` och är §10:s *"No generated per-project
rubric authority"*: **en kategori som föds per paket blir en mätstock ingen granskat**, och
rapporter från olika kunder slutar gå att jämföra. Paketidentiteten bär linsen i sin titel
(`lokal-se:orter`), aldrig i schemat.

## Vid `core-only` körs INGEN av dem

Frånvaron av ortssidor och lokala schemadelar är då **KORREKT** och får aldrig rapporteras
som ett fynd. Det är §26 Case B:s fälla `B-T1`, och den gäller lika mycket i grinden som i
planeringen.

## Vad den här filen INTE gör

**Grindworkflowet läser den inte — och kan inte.** Workflow-DSL:en saknar
filsystemsåtkomst. Tabellen ovan är därför **källan**, och workflowets `CATEGORY_ALIAS` är
**genererad utdata**: `node scripts/check-paketlinser.mjs --generera`. Vakten räknar fram
tabellen i minnet och fäller om den committade avviker, så en handredigerad utdata går inte
att committa.

**Vad som fortfarande INTE gäller:** linsernas INNEHÅLL — vad de tittar efter — står i
grindens prompt, inte här (`GL-GAP-2`). Den här filen binder kategorin, inte granskningen.

| ID | Lucka | Nästa transition |
|---|---|---|
| `GL-GAP-1` | **STÄNGD 2026-08-27 genom GENERERING.** Workflow-DSL:en har ingen filsystemsåtkomst, så `nortropic-launch.js` KAN inte läsa den här filen vid körning — och att låta en agent rapportera kategorimappningen vore värre än problemet, eftersom kategorimängden måste vara sluten och universell (§10) och en modellrapporterad mapping är varken. **Paketen är nu KÄLLAN och workflowets tabell är UTDATA:** `node scripts/check-paketlinser.mjs --generera` skriver den, och vakten räknar fram tabellen i minnet och kräver att den committade är IDENTISK. Drift är därmed inte längre något att upptäcka utan något som inte kan committas | — |
| `GL-GAP-2` | **NAMNGIVEN.** Linsernas INNEHÅLL (vad de tittar efter) står i grindens prompt, inte här. Den här filen binder KATEGORIN — vilken universell kategori en paketspecifik iakttagelse aliasar in på — aldrig kravet | **SPÄRREN ÄR BORTA 2026-08-27 (HÖGRISK, ägarinstruktion *"du kan röra konstitutionen också"*).** Transitionen sa först *"följ `GL-GAP-1`:s väg"*, vilket var vilseledande: den vägen hade låtit en OSKYDDAD fil bestämma vad en SKYDDAD grind kräver. **Skälet gäller inte längre.** §A7 zonar nu `packs/*/gate-lenses.md`, så riktningen är skyddad-till-skyddad. Generering är därmed RÄTT väg, och luckan är byggbar. **DEN GÖRS ÄNDÅ INTE HÄR, och skälet är sekvens, inte förmåga:** att generera linsinnehåll ändrar vad SEO-grinden letar efter, och nästa steg är systemets FÖRSTA fullständiga körning. **Man byter inte mätinstrument och tar den första mätningen i samma drag** — då går det inte att veta vilket som orsakade vad. Byggs som egen skiva EFTER att första körningen gett grindens nuvarande beteende en baslinje. **Skillnaden mot `GL-GAP-1` står kvar och är fortfarande skälet till att zoneringen behövdes:** där genereras ROUTNINGEN — vilken universell hink ett fynd hamnar i. Här genereras KRAVET. Routning är inte kravnivå |
