# Historisk kopia: styrningsfält i `specs/tasks.spec.json` och `controller/policy/cli` före 2026-09-10

**Arkiverad 2026-09-10.** Nedan står ordagrant de fält som togs bort eller ersattes när
webbens styrning lämnade plattformens aktiva auktoritetsordning (plattformsintegrationen
`512490d44007373b79aca504aa92709e9810aa24`). Detta är historia, inte instruktion. Dagens
mängd står i specens `defaults.denied_write` och beskrivs i `docs/loop/byggplan-v3.md` §3.1.

## `defaults.denied_write` (ersatt)

```json
"denied_write": [
  "docs/07-konstitution.md",
  "docs/03-regelverk.md",
  "skills/nortropic-eval/references/eval-rubric.md",
  "skills/nortropic-plan/references/juridikflaggor.md",
  "workflows/**",
  "tests/fixtures/**",
  "agents/nortropic-steward.md",
  "AUTOPILOT",
  "scripts/check-invariants.mjs",
  "specs/**",
  "verify/**",
  "CLAUDE.md"
]
```

Ersatt av plattformens skyddade mängd: `verify/**`, `specs/**`,
`controller/verify/register.json`, `scripts/check-invariants.mjs`, `.gitignore`, `CLAUDE.md`.
Webbfilerna finns inte i plattformsrepot; registret och vitlistan tillkom eftersom de tidigare
saknades i mängden och därför bara föll som "utanför allowed_write".

## `authority.backlog` (ersatt)

```json
"backlog": "docs/100-dagar/programregister.md",
"note": "Backloggen är programregistret. Denna spec beskriver kontrollplanets sju skivor — den är inte och blir aldrig en andra uppgiftslista."
```

Programregistret hör till webbrepot. `authority.backlog` pekar nu på `docs/loop/byggplan-v3.md`
(skivordningen i §7 tillsammans med specens rader).

## `human_only` (borttaget)

```json
"human_only": {
  "note": "Byggs ALDRIG genom loopen. Människohand, HÖGRISK-märkt commit.",
  "items": [
    {
      "id": "m-001",
      "title": "INV-007 till INV-009 i check-invariants.mjs",
      "after": "h-007",
      "summary": "Doctor #5 tillskrivs tre mekaniska uppdrag och utför inget av dem. En invariant per uppdrag: §A-fällning oavsett commit-tagg, disable-model-invocation-vakt, semver-kontroll av profilKontraktVersion.",
      "surface": "scripts/check-invariants.mjs (§A-nära, regressionsnätsfamiljen)"
    },
    {
      "id": "m-002",
      "title": "Avveckling av /usr/local/libexec/nortropic",
      "after": "när det passar",
      "summary": "Konton, hemkataloger och sudoers-regel borttagna 2026-08-07. Uppdaterat 2026-08-08: /usr/local/libexec/nortropic finns inte längre (ls verifierat i byggsession) — den tidigare uppgiften om 122 kvarvarande binärer är överspelad. Overifierat: de tre tomma grupperna (dscl nekades i sandbox). Arkivet står i ~/Arkiv/nortropic-systeminstallation-2026-08-07.tar.gz.",
      "surface": "utanför repot"
    }
  ]
}
```

m-001 gällde webbens invarianter (INV-007–009 i webbens `check-invariants.mjs`) och hör till
webbrepot. m-002 gällde en systeminstallation utanför repot som enligt posten själv redan var
avvecklad 2026-08-08 (kvarstående OVERIFIERAT: tre tomma grupper); den är ingen plattformsregel
och ingen task, och bevaras här som historik. Blocket i sin helhet var ett generiskt
människohandskrav och ersätts av kontraktsflödet i `AGENTS.md`.

## h-035 `allowed_write`/`docs_impact`

`docs/05-beslutslogg.md` (webbens beslutslogg) togs bort ur h-035:s `allowed_write` och
`docs_impact`. Övriga specrader (h-001…h-017, h-031…h-033) behåller sina historiska
`docs/05`-poster som historiska subjekt.

## `controller/policy/cli` — subtraktionen `AGARHAND`

```python
# Vaktas av ägarhand, inte av den här komponenten (byggplan v3 §3.1,
# "Två mekanismer, olika ytor"). controller/** står inte i denied_write.
AGARHAND = ("specs/**", "verify/**")
```

Avslagstexten var `"§A-yta rörd, aldrig via loopen — alltid människa och HÖGRISK-märkt commit: …"`.
Policyn vaktar nu hela `defaults.denied_write` utan subtraktion och avslår med en neutral text
som namnger sökvägen och mängdens källa.
