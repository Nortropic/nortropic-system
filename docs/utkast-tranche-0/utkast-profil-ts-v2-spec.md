> **UTKAST — TRANCHE 0 (2026-08-24). EJ PRODUKTION, EJ AUKTORITET.**
> Design-utkast enligt den DESIGN-FRUSNA masterplanen. Konsumeras av INGENTING
> före FOUNDATION_REPAIR_GATE; skarp version landar i sin riktiga hemvist i S1+.

# profile.ts v2.0.0 — fältnivåspec

**Specversion: profilKontraktVersion v2.0.0-UTKAST**

> Semver per nortropic-stack-mönstret (v1.1.0-kontraktet): bumpa vid tillägg/ändring/borttagning av fält, typ eller enum-värde. Detta är MAJOR mot v1.1.0 (fält ersätts och flyttas). Skarp hemvist: `skills/nortropic-stack/SKILL.md` + `references/file-structure.md` (S4); doctor #5 vaktar stämpeln semver-medvetet.

## Roll

`content/profile.ts` v2.0.0 = **DEN enda bäraren av Site Quality Contract** (D3 — inget syskon-artefakt, ingen parallell JSON). Skrivs av stack-builder vid init ur briefens §7 (nu §7.1–§7.14); grindar och eval läser den som facit i byggrepot utan tillgång till briefen. `business.ts` förblir NAP-facit — de blandas aldrig.

## Härledningstypen (proveniens — pekare, aldrig kopior)

```ts
type Harledning =
  | { typ: 'FAKTA';    ref: string }   // pekare till research.md, t.ex. 'research.md §6' eller 'research.md §lokal.3'
  | { typ: 'STRATEGI'; ref: string };  // pekare till briefen, t.ex. 'PROJECT-BRIEF.md §7.10'
```

**Lagar:** härledning sätts ENDAST på anspråksbärande fält · alltid pekare, aldrig återgivet innehåll (en-hemvist) · ett anspråksbärande fält utan härledning är ett kontraktsfel, inte en tolkningsfråga.

## Schema (fullständigt, TypeScript-stil)

```ts
type KapacitetId     = string;  // ÖPPET — valideras mot kapacitetskatalogen (se katalogVersion)
type KapacitetStatus = 'DECLARED' | 'BUILT' | 'VALIDATING' | 'PROVEN' | 'ROUTE-OUT';

interface ProfilV2 {
  profilKontraktVersion: 'v2.0.0';
  katalogVersion: string;                    // kapacitetskatalogens version VID BESLUTET, t.ex. 'v1.0.0'
  paket: string[];                           // aktiverade paket, t.ex. ['lokal-se']; [] = enbart kärna

  // ── Utfall & uppgifter ────────────────────────────────────────────────
  primarUtfall: {
    typ: KapacitetId;                        // ersätter v1:s slutna enum 'ring'|'boka'|'platsforfragan'|'offert'|'besok'
    etikett: string;                         // CTA-text, t.ex. 'Få kostnadsfri offert'
    gate1Test: string;                       // klartext: vad Gate 1 testar end-to-end för denna kund
    harledning: Harledning;
  };
  anvandargrupper: { id: string; beskrivning: string; harledning: Harledning }[];
  toppuppgifter:   { id: string; beskrivning: string; harledning: Harledning }[];

  // ── Kapacitetsbeslut (planner steg 2b, kompilerat mot katalogen) ─────
  kapaciteter: {
    id: KapacitetId;
    statusSnapshot: KapacitetStatus;         // ÖGONBLICKSBILD av katalogstatus vid beslutet — aldrig live-uppslag
    beslut: 'KRAVS' | 'AVBOJD' | 'ROUTE-OUT';
    harledning: Harledning;
  }[];

  // ── Förtroende & innehållsdisciplin ──────────────────────────────────
  fortroendekrav: {
    kvitton: string[];                       // absorberar v1-fältet `kvitton`
    attribution: string[];                   // attributionsregler ur §7.4
    harledning: Harledning;
  };
  obligatoriskaResor: { id: string; beskrivning: string; testbar: string }[];  // → journeys-linsen (S5)
  forbjudnaPastaenden: string[];             // → content-designer + skeptiker; aldrig grund för uppfunna motpåståenden

  // ── Kravnivåer ───────────────────────────────────────────────────────
  kravNivaer: {
    a11y: 'WCAG22-AA';
    perfRef: string;                         // pekare: 'nortropic-prelaunch/references/lighthouse-targets.md'
    seoLage: 'lokal' | 'varumarke' | 'hybrid';   // FLYTTAD hit från v1:s toppnivå
  };

  // ── Omvärld ──────────────────────────────────────────────────────────
  integrationer: { id: string; system: string; harledning: Harledning }[];   // ur research §10, beslutade i §7

  framgangsmatt: {
    beskrivning: string;
    matkalla: 'analytics-event' | 'gsc' | 'gbp' | 'kundrapport';
    klass: 'POST_LAUNCH_OUTCOME';            // läses ENDAST vid retro — aldrig grind-input (placeringslagen)
  }[];

  olostaOkanda: {
    text: string;
    klass: 'STRATEGISK' | 'FAKTA' | 'BESLUT';
    eskalering?: 'BEHOVER_DOMANEXPERT' | 'BEHOVER_ANVANDARBEVIS'
               | 'BEHOVER_SAKERHETSGRANSKNING' | 'BEHOVER_JURIDIK'
               | 'BEHOVER_ANNAN_NORTROPIC_DOMAN';        // Part 2d K
  }[];

  kontraktGodkand: { datum: string; briefCommit: string } | null;   // sätts av nod 3 — se orörlighetsmekanismen

  // ── Part 2d/2f-tillägg ───────────────────────────────────────────────
  sakringsprofil: 'STANDARD' | 'FORHOJD' | 'HOG';        // härledd ur flaggor; STANDARD = NOLL ny ceremoni
  affarskapacitet?: { beskrivning: string; sasong?: string; harledning: Harledning };
                                             // grov, kundrapporterad (planens `kapacitet`; namnbyte pga kollision — se öppna frågor)
  ekonomi?: {
    marginalklass?: 'LAG' | 'MEDEL' | 'HOG'; // per tjänst grovklassad — ALDRIG bokföringsåtkomst
    aovKlass?: 'LAG' | 'MEDEL' | 'HOG';
    harledning: Harledning;
  };

  // ── Behållna v1-fält (oförändrade typer och semantik) ────────────────
  schemaTyp: string;                         // LocalBusiness-subtyp eller annan typ
  juridikflaggor: string[];                  // ur registret i nortropic-plan — peka, kopiera aldrig
  rostregister: Rostregister;                // §7.2
  branschAntislop: string[];                 // §7.3 — adderas till bas-blocklistan
  motionNiva: 'ingen' | 'subtil' | 'uttrycksfull';
  noindexCutover?: { avsiktlig: true; checklista: string; cutoverSenast: string };  // v1.1.0-fältet, oförändrat
}
```

**Validering av `primarUtfall.typ` och `kapaciteter[].id` (fail-closed):** stack-builder asserterar vid init att varje id finns i katalogen vid `katalogVersion`; grindarna läser samma stämpel. Okänt id ⇒ fel, aldrig tyst acceptans. `beslut: 'ROUTE-OUT'` i profilen dokumenterar en gjord hänvisning — en ROUTE-OUT-kapacitet kan aldrig samtidigt vara `KRAVS`.

## Orörlighetsmekanismen — `kontraktGodkand`

1. Nod 3 (det MÄNSKLIGA briefgodkännandet) sätter `kontraktGodkand = { datum, briefCommit }` — commit-SHA:n för den godkända briefen.
2. **Färskhetskontroll i launch (mekanisk, del av §A3-batchen H-2/S5):** om någon commit har rört `content/profile.ts` EFTER `briefCommit` utan förnyat godkännande (nytt `kontraktGodkand` från ett nytt nod-3-beslut) ⇒ **BLOCKED-STALE** — samma form som review-färskhetsgrinden. Tri-state: kan relationen inte avgöras (saknad git-historik, saknat fält på SKARP klient) ⇒ ODÖMBART, aldrig grönt.
3. `null` är giltigt ENDAST före nod 3; en SKARP klient som når launch med `null` ⇒ BLOCKED.

## Bakåtkompatibilitet — BC-1 (läsregel, aldrig tyst omtolkning)

- En profil med `profilKontraktVersion` v1.x (eller pre-versionerad) läses som **`paket: ['lokal-se']`** — och läsningen **LOGGAS** ("BC-1: v1-profil tolkad som lokal-se").
- v1-fält mappas per migrationstabellen nedan; **fält som bara finns i v2 läses som frånvarande/ODÖMBART — aldrig uppfunna.**
- Gamla kundrepon förblir läsbara för evigt; backfill sker ENDAST vid ombygge (D5), och då med riktiga värden ur ny brief — aldrig syntetiserade.

## Doctor #5-faran + pinnad-MAJOR-frågan (ägarbeslut 10)

Doctor #5:s formel ("samma MAJOR + stämpel-(minor,patch) ≤ kontraktets = kompatibel") gör **v1-stämplade FRYSTA fixtures inkompatibla** samma dag kontraktet blir v2.0.0 — de frysta filerna kan per definition inte uppdateras utan §A6-mänsklig omklippning. Två utvägar, ägarbeslut 10:

- **(a) Pinnad-MAJOR-undantag:** en fixture får bära en explicit pinnad kontrakts-MAJOR (`fixturePinnadMajor: 1`); doctor #5 validerar då mot den pinnade MAJOR:ns kontrakt i stället för det aktuella. Undantaget är per-fixture, synligt och listat.
- **(b) Fixture-omklippning:** frysta fixtures klipps om till v2 vid H-5-ceremonin (§A6, mänskligt).

Utkastet implementerar inget av dem — specen noterar bara att v2-skeppning UTAN något av (a)/(b) tyst fäller suiten.

## MIGRATION v1.1.0 → v2.0.0

| v1-fält | v2-öde |
|---|---|
| `primaraktion.typ: 'ring'` | `primarUtfall.typ: 'ring-konvertering'` |
| `primaraktion.typ: 'boka'` | `primarUtfall.typ: 'extern-bokning'` |
| `primaraktion.typ: 'offert'` | `primarUtfall.typ: 'lead-formular'` |
| `primaraktion.typ: 'platsforfragan'` | `primarUtfall.typ: 'lead-formular'` (etikett + gate1Test skiljer; se katalogets öppna fråga 5) |
| `primaraktion.typ: 'besok'` | `primarUtfall.typ: 'hitta-hit-besok'` |
| `primaraktion.etikett` | `primarUtfall.etikett` (oförändrad) |
| `gate1Test` | `primarUtfall.gate1Test` (flyttad in) |
| `kvitton` | `fortroendekrav.kvitton` (absorberad) |
| `seoLage` | `kravNivaer.seoLage` (flyttad) |
| `schemaTyp`, `juridikflaggor`, `rostregister`, `branschAntislop`, `motionNiva`, `noindexCutover` | behållna oförändrade |
| — | NYA: `katalogVersion`, `paket`, `anvandargrupper`, `toppuppgifter`, `kapaciteter`, `fortroendekrav.attribution`, `obligatoriskaResor`, `forbjudnaPastaenden`, `kravNivaer.a11y/perfRef`, `integrationer`, `framgangsmatt`, `olostaOkanda`, `kontraktGodkand`, `sakringsprofil`, `affarskapacitet?`, `ekonomi?` |

Migrationsordning: BC-1-läsning täcker drift av gamla repon; fysisk migration sker endast vid ombygge (ny brief ⇒ ny §7 ⇒ ny profil skrivs av stack-builder). Ingen batch-backfill.

## Vad som INTE ingår i v2

- **Ingen syskon-JSON, ingen spegel** — profile.ts ÄR transporten (D3; röd-lag #2/#4).
- **Inga presence-fält** (förvaltade kapaciteter, authority-matris, budgetgränser) — hemvistfrågan `content/presence.ts` vs profile.ts v3 är ägarbeslut 34; v2 föregriper den inte.
- **`Läge` (bemannat/obemannat)** transporteras ALDRIG hit — orkestrering, inte runtime-sajtbeteende (oförändrad v1-lag).
- **§5 Vald riktning** transporteras inte (bedöms mot renderad sajt — oförändrad v1-lag).
- **Inga utfallsdata/LEARNING-RECORD-fält** — utfall läses vid retro, aldrig ur byggrepot (placeringslagen).
- **Ingen katalogkopia** — endast `katalogVersion`-stämpel + id-referenser.

## Changelog

- **v2.0.0-UTKAST (2026-08-24)** — fältnivåspec per masterplanen Part 1 §5 + Part 2d I–K (sakringsprofil, eskaleringsklasser) + Part 2f M–S (affarskapacitet/ekonomi grovfält): primarUtfall med öppet katalogvaliderat typ-fält ersätter sluten enum; kapacitetsbeslut med statusögonblicksbild; Harledning-pekare; kontraktGodkand-orörlighet med BLOCKED-STALE-färskhetskontroll; BC-1-läsregel; doctor #5-faran dokumenterad. EJ PRODUKTION.

## Öppna frågor till ägaren

1. **Ägarbeslut 10 (obesvarat, blockerar S4-skeppning):** pinnad-MAJOR-undantag i doctor #5 eller fixture-omklippning (H-5) för v1-stämplade frysta fixtures? Utkastet speccar båda utvägarna, väljer ingen.
2. **Fältnamnet `affarskapacitet`:** planen säger `kapacitet`, men det kolliderar läsfarligt med `kapaciteter[]` i samma fil. Godkänn namnbytet eller behåll planens namn.
3. **Enum-värdenas teckenform:** utkastet använder ASCII i kodvärden (`'KRAVS'`, `'FORHOJD'`, `'BEHOVER_DOMANEXPERT'`) per husmönstret engelska/ASCII-fältnamn med svenskt innehåll — planen skriver `KRÄVS`/`FÖRHÖJD`/`BEHÖVER_*`. Välj form; den fryser vid S4.
4. **`olostaOkanda.eskalering` som separat valfritt fält** (utkastets linje) vs en sammanslagen klass-enum: eskaleringsklasserna (Part 2d K) är ortogonala mot STRATEGISK/FAKTA/BESLUT-klassningen — bekräfta tvåfältsmodellen.
5. **Ägarbeslut 30 förutsätts:** `sakringsprofil`-fältet + härledningslistan (flaggor → FORHOJD/HOG-aktivering) antas landa som registrerat; STANDARD-negativkontrollen (rorjour = noll ny ceremoni) är fältets acceptanstest.
