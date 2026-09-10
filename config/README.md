# config/

## managed-settings.json

Claude Codes managed settings för plattformens byggmaskin. **Källkopia — installeras, läses aldrig härifrån i drift.**

Installationssökväg på macOS:

    /Library/Application Support/ClaudeCode/managed-settings.json

Ägd av `root:wheel`, läge `644`. Managed scope kan inte överridas av något i repot — det är kravet från B9 i granskningen 2026-07-31.

Installeras med:

    sudo cp config/managed-settings.json "/Library/Application Support/ClaudeCode/"
    sudo chown root:wheel "/Library/Application Support/ClaudeCode/managed-settings.json"
    sudo chmod 644 "/Library/Application Support/ClaudeCode/managed-settings.json"

Träder i kraft vid nästa sessionsstart.

### Vad den gör

| Nyckel | Verkan |
|---|---|
| `permissions.deny` (27) | Nekar verktygsvägen mot den skyddade mängden (specens `defaults.denied_write`, inkl. `controller/verify/register.json`) under plattformsroten `/Users/elinhaggstrom/nortropic-repos/nortropic-system/` och läsning av nycklar |
| `sandbox.filesystem.denyWrite` (6) | Nekar skalvägen mot samma mängd på OS-nivå (Seatbelt) |
| `sandbox.network` | Tom allowlist utom `api.anthropic.com`, `strictAllowlist`, `allowManagedDomainsOnly` |
| `requiredMinimum/MaximumVersion` | Claude Code vägrar starta utanför 2.1.224 |
| `env.DISABLE_AUTOUPDATER` | Bakgrundsuppdatering av — pinnen håller |

### Mätt begränsning i denyWrite — subpath, inte filskydd

En `denyWrite`-post nekar **hela sökvägsgrenen ovanför sitt mål**, inte bara målet.
Mätt 2026-08-07 med positiv kontroll: med provraden
`<rot>/wt/a1/<fil>` installerad (`<rot>` = dåvarande föräldermapp till repot) gick `mkdir <rot>/wt2`
och `mkdir <rot>/prov-igen` medan `mkdir <rot>/wt` gav EPERM. Samma förälder,
samma användare, samma session. Gäller lika för glob och konkret sökväg.

Följd: `denyWrite` kan inte selektivt skydda filer i en katalog som också måste vara
skrivbar. Mekanismen fungerar där trädet redan finns (klonhalvan, verifierad 2026-08-07),
men inte där kontrollplanet självt måste skapa katalogen.

De tretton `<rot>/worktrees/**`-posterna är därför **borttagna** — de gjorde
worktree-roten oskapbar och skyddade ingenting. 26 → 13 denyWrite-poster (2026-09-10: 6,
plattformens skyddade mängd under plattformsroten).
§A-skyddet i workspacet vaktas i stället av skiva 7:s diffpolicy. Det är svagare:
diffpolicyn granskar resultatet, inte försöket.

`Edit`-regler täcker alla filredigerande verktyg; `Write`-regler matchar inte och ska inte användas.

## Loopens config — `controller/loop/cli run <config.json>`

Configen är **indata i sin helhet**. Komponenten har ingen inbyggd sökväg, ingen
inbyggd backlog och antar aldrig ett namnschema. Hela filen prövas FÖRE leasen:
saknas ett fält, eller har det fel typ, faller körningen innan den rör en lease,
en logg eller ett workspace.

`config/loop-config.exempel.json` är mallen. Fjorton fält:

| Fält | Typ | Vad det är |
|---|---|---|
| `spec` | sökväg | Backloggen. Vilken JSON-fil som helst med `tasks`-arrayen — **inte** nödvändigtvis `specs/tasks.spec.json`. Hashas in i kuvertet som `spec_sha256`. |
| `attest_dir` | katalog | Attestationerna, alltså beviskedjan. Bör ligga **utanför repot** så körningen aldrig smutsar arbetskopian. |
| `state_dir` | katalog | SQLite-state + `events.jsonl`. Utanför repot. |
| `lease_dir` | katalog | Leasefilerna. Utanför repot. |
| `lease_resurs` | namn | Vad leasen gäller. Exakt en controller åt gången per resurs. |
| `workspace_rot` | katalog | Roten under vilken varje försök får sitt worktree. Utanför repot. |
| `brytare_rot` | katalog | Roten under vilken varje task får sin brytarkatalog, `<brytare_rot>/<task-id>`. Där bor `tillstand.json` och den valfria `kvot.monster`. Utanför repot. |
| `base_sha` | 40 hex | Commiten varje varv utgår från. Nästa varv bygger på förra ATTESTERADE kandidaten — basen flyttas aldrig av ett fallet varv. |
| `verifier_id` | id | Verifieraren ur `controller/verify/register.json`. I dag `check-invariants` (PINV-001–006), registrets enda post. |
| `run_id` | sträng | Unikt per körning. Ingår i attempt-id och i kuvertet. |
| `worker_cmd` | argv-lista | Kommandot som startar workern, som **lista** — aldrig en sträng, för då hade den blivit ett skalkommando hos den som exekverar den. |
| `timeout_s` | tal > 0 | Per försök. Hela processgruppen dödas vid överskridande. |
| `budget` | heltal | Attempt-budget **per task**. Varje startat försök räknas, även lyckade. |
| `troskel` | heltal | Antal likadana fingerprints som öppnar brytaren, per task. |

### Två tal som hör ihop

**`budget` måste vara STRIKT större än `troskel`.** Brytaren prövar budget FÖRE
öppen, så öppningen förbrukar själv den sista budgetenheten; är taket för snålt
svarar katalogen `budget slut` för alltid och den öppna brytaren maskeras
permanent. Mallens 3 och 2 håller den regeln.

### Sökvägar utanför repot

Attest, state, lease, workspaces och brytartillstånd hör inte hemma i
arbetskopian: de är körningens tillstånd, inte systemets källkod, och en
körning som smutsar arbetsträdet gör nästa mätning otillförlitlig. Mallen lägger
dem under `~/.nortropic/kor/`, samma plats som Slack-webhooken.

### Workern

`worker_cmd` pekar på `config/worker-prompt.sh`, som gör kuvertet till en
arbetsorder och startar `claude -p`. Den är **konfiguration, inte en komponent**
— byt den fritt, kedjan antar aldrig vilken binär som körs. Ordern säger åt
sessionen att redigera filer och ALDRIG röra git: utföraren stagar och committar,
och en session som committar själv ger ingen kandidat.

### Vad en attestation betyder — och inte betyder

Kedjan dömer tre saker: att rapporten är välformad (h-006), att diffen håller sig
inom `allowed_write` och budgetarna (h-007), och att verifieraren ur configen är
grön mot kandidatträdet (h-002). **Taskens eget `exit_test` körs inte av kedjan**
— det är medvetet utelämnat ur kuvertet så workern inte kan tuna mot sin egen
grind, och det körs i byggflödets steg 3 som lokal kvalificering med den frysta
grinden (`AGENTS.md`). En attestation betyder därför "diffen var laglig och de
globala invarianterna höll", inte "tasken är löst". Kedjan för ingen kandidat till
main; push och merge ingår inte i nuvarande fas (`AGENTS.md`).
