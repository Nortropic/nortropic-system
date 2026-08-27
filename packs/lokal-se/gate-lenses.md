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

**Grindworkflowet läser den inte.** Tabellen ovan är i dag en DEKLARATION som måste stämma
med den hårdkodade, och `scripts/check-paketlinser.mjs` fäller om de glider isär. Att låta
workflowet läsa paketet i stället kräver en ändring i `workflows/nortropic-launch.js`,
vars kategorimängd gränsar till §A3 — det är ett ägarbeslut, inte en städning.

| ID | Lucka | Nästa transition |
|---|---|---|
| `GL-GAP-1` | Workflowet läser inte paketet; tabellen är en spegel som kan glida | Låt `nortropic-launch.js` bygga `CATEGORY_ALIAS` ur `packs/*/gate-lenses.md` — §A3-angränsande, ägarbeslut |
| `GL-GAP-2` | Linsernas INNEHÅLL (vad de tittar efter) står i grindens prompt, inte här. Den här filen binder bara kategorin | Följer `GL-GAP-1` |
