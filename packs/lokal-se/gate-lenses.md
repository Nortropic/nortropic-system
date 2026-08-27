# `lokal-se` — paketets grindlinser

Masterplanens §6 räknar upp sex paketdelar: manifest · research module · strategy module ·
**eval module** · **gate lenses** · **agent fragments**. `PK-GAP-3` namnger att kontraktet
bara kräver de tre första. **Detta är den femte.**

**Filen är INTE §A7-skyddad kalibreringsyta.** §A7 zonar `manifest.md`,
`research-module.md` och `strategi/*` eftersom de bär kvittolistor och juridikflaggor
(§7.4/§7.7). Grindlinser bär ingen av delarna — de säger vilken universell kategori en
paketspecifik iakttagelse hör hemma i.

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
| `GL-GAP-2` | **NAMNGIVEN.** Linsernas INNEHÅLL (vad de tittar efter) står i grindens prompt, inte här. Den här filen binder KATEGORIN — vilken universell kategori en paketspecifik iakttagelse aliasar in på — aldrig kravet | **RÄTTAD TRANSITION 2026-08-27. Stod tidigare som en ren hänvisning till `GL-GAP-1`:s väg, och det var aktivt vilseledande:** att stänga den här luckan på `GL-GAP-1`:s sätt — generera innehållet ur paketet in i workflowet — skulle GÖRA SKYDDET SVAGARE, inte starkare. Linsinnehållet för `lokal-se` (*"NAP-konsistens mot business.ts, ortssidornas kvalitet, `address.publik`→PostalAddress, postalCode-format, GBP-/Bing-/IndexNow-stegen"*) är grindens KRAVNIVÅ och ligger i `workflows/nortropic-launch.js`, alltså på **§A3-ytan**. Den här filen är **inte** §A-zonad: §A7 räknar upp `packs/*/manifest.md`, `packs/*/research-module.md` och `packs/*/strategi/*` — inte `gate-lenses.md`. **En generering hade därför låtit en OSKYDDAD fil bestämma vad en SKYDDAD grind kräver**, och riktningen är hela poängen: §A finns för att en agent inte ska kunna sänka ett krav genom att redigera något den får redigera. **Skillnaden mot `GL-GAP-1`:** där genereras KATEGORIMAPPNINGEN, alltså routning — vilken universell hink ett fynd hamnar i. Här skulle KRAVET självt genereras. Routning är inte kravnivå. **Vad som skulle behöva hända först är ägarens hand, inte min:** att `packs/*/gate-lenses.md` zonas under §A. Först då är riktningen skyddad-till-skyddad, och först då är generering rätt väg |
