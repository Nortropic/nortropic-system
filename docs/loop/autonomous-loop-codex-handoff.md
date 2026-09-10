# Codex-handoff — autonoma loopen v1

Kort och exekverbart. Den fullständiga planen är auktoritativ; detta är ingången till den.

```text
PLAN_BASE_SHA      = 1eaa0724be990e14ae095b3be3910496d47d062e
PLAN_PATH          = docs/loop/autonomous-loop-plan-v1.md
PLAN_BRANCH        = plan/autonomous-loop-v1
PLAN_REV1_COMMIT   = d2394d66b4b556178f34f6df693a95b1e921066e
PLAN_COMMIT_SHA    = a84d84e0fa3b1f5abc2eb1b0ec244ec041c50ba8
START_SLICE        = S1 · h-017 per-task-domen
```

`PLAN_COMMIT_SHA` är commiten som bär **revision 2**, den ägarlåsta versionen. Läs planen därur —
den är oförändrad sedan dess. Denna rad kunde inte skrivas i den commiten (en fil kan inte bära
sitt eget commit-SHA) och fylldes i av en följdcommit på samma gren.

Revision 1 (`d2394d6`) föreslog `--force-with-lease` och är **överspelad**.

---

## LÅSTA VÄRDEN

```text
START=S1/h-017
G20_BLOCKING=YES

REPOSITORY=Nortropic/nortropic-system
PROMOTION_IDENTITY=Nortropic Promoter GitHub App
PROMOTION_APP=Nortropic Promoter
PROMOTION_OWNER=Nortropic organization
PROMOTION_REPOSITORY_SCOPE=Nortropic/nortropic-system only
PROMOTION_FORCE_ALLOWED=NO
PROMOTION_MODE=FAST_FORWARD_ONLY
AUTHORITATIVE_MAIN=origin/main
RULESET_20553421_EXISTS=YES
RULESET_20553421_ENFORCEMENT=active
RULESET_20553421_REF_INCLUDE_COUNT=0
RULESET_20553421_EFFECTIVE_ON_MAIN=NO
RULESET_20553421_EFFECTIVE_ON_ANY_REF=NO
RULESET_20553421_CURRENT_TRUST_ROLE=NONE

ATTESTATION_WITHOUT_TASK_GATE_PROMOTABLE=NO

MERGE_RESOLUTION_REUSES_OLD_PASS=NO
RESOLVED_CANDIDATE_FULL_REVERIFY=YES

TRUST_CRITICAL_TASK_JUDGED_BY_PRETASK_CONTROL_PLANE=YES

SANDBOX_BYPASS_ALLOWED=NO
```

---

## DO_NOT_REDESIGN

Följande är ägarbeslutat och ska inte omprövas i implementationen:

- **G20 är blockerande i S1.** En task vars diff rör den trust-critical ytan får sin taskgrind
  körd med **repots** (pre-task) komponenter. Kandidatträdet är grindens *indata*, inte dess
  *körmiljö*. Mätt varför: `kmd_run` kör grindfilen ur repot men med `cwd=målkatalogen`, och
  husets grindar adresserar komponenter relativt (`krav_komponent "controller/verify/cli"`,
  `_lib.sh` rad 7–14). Får **inte** skjutas till trust-transitionen (S9).
- **Grinden slås upp på SÖKVÄG, aldrig på id.** Nyckeln kommer ur spec-radens `exit_test`, och
  `specs/**` är denied_write — den som skriver registret kan aldrig peka om sin egen task.
- **Uppslaget bor hos `controller/verify/cli`, inte hos loopen.** Precedent: `controller/policy/cli`
  slår redan upp task-id ur samma fil.
- **`controller/verify/register.json` ligger UTANFÖR skrivytan.** `controller/verify/cli` anges
  som exakt sökväg.
- **Configens globala verifierare ERSÄTTS inte.** Båda domarna måste vara gröna.
- **Riggfel stannar före leasen** (registret prövas i sin helhet), **domen kostar försök.**
- **En ogrindad task attesteras som förut men UTAN `grind_id`.** Frånvaron bokförs; körningen
  stoppas inte.
- **Ingen force-semantik någonstans.** Inte `--force`, inte `--force-with-lease`, inget ledande
  `+` i refspec, ingen history overwrite — varken i normal väg eller i konfliktväg.
- **Promotion är non-force fast-forward mot `origin/main`** enligt planens elva steg, under
  giltig bevisad lease-ownership.
- **Promotion-credentialen ligger ALDRIG i en miljövariabel.** `controller/launch/cli` filtrerar
  worker-env med en *denylist* på tre prefix (`GH_`, `GITHUB_`, `SLACK_`) — den skyddar inte en
  credential med annat namn. Nyckeln bor i fil utanför repot, rättigheter 600; configen bär
  sökvägen.
- **Merge-resolution ger en single-parent kandidat D ovanpå aktuell main C**, aldrig en
  merge-commit, och D verifieras från noll.
- **Eventströmmen är en egen butik och aldrig scheduler- eller doneness-authority.** Skiva 1:s
  `{task, status}` rörs inte.
- **Notis och läsyta är observerande.** De får aldrig ändra controllerns utfall.
- **Markdown är människans yta.** JSON/Task IR är genererad artefakt.

---

## VERIFY_BEFORE_CHANGE

Innan en rad ändras, kör och läs:

```bash
git rev-parse HEAD
for t in verify/bin/h-0*-exit; do echo "$t"; bash "$t" | tail -1; done
node scripts/check-invariants.mjs
```

Mätt vid `PLAN_BASE_SHA`: fjorton h-grindar (plus `p-001`/`p-002`), invarianter 8 PASS.
`h-002-exit` kan ge exit 2 (ODÖMBART) i en sandbox utan skrivväg mot `scripts/` — det är miljön,
inte ett fel.

Läs dessutom: `docs/loop/regler.md` (bindande) · `docs/loop/drift.md` (hur loopen körs) ·
`docs/05-beslutslogg.md` raderna LOOP-ÄGARHAND-36 t.o.m. -42 och LOOP-PREMIÄR-1.

**Börja med en plan-vs-code-review.** Du får korrigera mindre plan/kod-konflikter **med bevis**.
Du får **inte** godtyckligt ändra ägarens låsta målsemantik ovan.

---

## COMMIT_PER_SLICE

En slice = en gren `nortropic/loop-<id>` = en PR. Commit per delsteg. Beslutsloggsrad i **samma
commit** som ändringen (regel 7 + 17 + 22). Commitform `[LOOP] h-0NN delsteg N: ...` med
`Co-Authored-By`-trailer. Stanna vid öppnad PR.

---

## TESTS_REQUIRED

Beslut 3 gäller: **spec-rad och exit-test FÖRE kod.** Ingen slice byggs mot ett prov som inte
finns.

Per slice krävs:

1. baslinje utan komponent — rött av rätt skäl,
2. ärlig referens som **kastas före commit**,
3. lögnstubbar med EN lögn var, förutsagt utfall skrivet FÖRE körning,
4. hela batteriet grönt,
5. **körning i ägarterminalen före merge** — en grind är inte verifierad förrän den körts i den
   miljö som ska grinda (ÄGARHAND-39: samma commit gav 25/0 hos granskaren och 24/1 hos ägaren),
6. en fix prövas mot en **familj** legitima varianter, inte mot en enda referens (ÄGARHAND-38).

Mergevillkoret kedjas: `./verify/bin/h-0NN-exit && gh pr merge --rebase --delete-branch`.

---

## STOP_CONDITIONS

Stanna och fråga ägaren när något av detta inträffar:

- **GitHub-skydden ser annorlunda ut än vad som står här.** Ruleset `id=20553421` är läst och
  träffar ingen ref (`conditions.ref_name.include` är tomt), så det har ingen trust-roll i dag —
  men det BÄR regler (`deletion`, `non_fast_forward`, `pull_request` med **en** approval) och
  `bypass_actors` är tomt. Får det någonsin en `include`-post blir det strängare än dagens skydd
  och stoppar auto-promotion även med appen på plats. **Granska skydden och rulesetet på nytt
  före S7.**
- **GitHub App *Nortropic Promoter* finns inte ännu.** Den skapas av ägaren, inte av en byggsession.
  Owner: `Nortropic` organization. Scope: `Nortropic/nortropic-system` only. Permissions:
  Metadata Read, Contents Read & Write — inget mer utan konkret mekaniskt behov.
- En slice kräver ändring i en fil **utanför sin `allowed_write`** — det är en spec-radsfråga,
  inte en implementationsfråga. (Hände redan en gång: bokföringsklausulen i h-017 gick inte att
  uppfylla i sin egen yta, ÄGARHAND-42.)
- Ett prov visar sig **inte kunna mäta** det kriteriet kräver — då är kriteriet fel, inte provet.
- Två misslyckade fixförsök på samma fel (byggplan §10, stoppregel).
- En task vill röra **§A-mängden** eller kundflödet.
- Någonting frestar dig att slå på `required_linear_history`. **Ändra inte GitHub-inställningar.**
  Det är ett senare explicit policy-steg efter att promotionmodellen, PR-flödet och
  merge-resolvern prövats.

---

## MÄTT GITHUB-LÄGE (ägaren, 2026-08-09, efter ägarbeslutad transfer)

```text
REPOSITORY_IDENTITY         = Nortropic/nortropic-system   (var Jonkebronk/nortropic-system)
repository id               = OFÖRÄNDRAT
default branch              = main
origin/main efter transfer  = exakt samma commit som före
plan/autonomous-loop-v1     = följde med, tip 9bc1c6187da44173d5e29d440cf97d72dae22b0a

require pull request        = YES
required approving reviews  = 0
enforce admins              = YES
required signatures         = NO
required linear history     = NO      (framtida mål YES — ändra inte nu)
force pushes                = DISABLED
deletions                   = DISABLED
conversation resolution     = NO
ACTIVE RULES ON main        = []
REPOSITORY RULESET          id=20553421 — LÄST I SIN HELHET
  exists                    = YES        enforcement = active
  ref_include_count         = 0          → träffar ingen ref
  effective_on_main         = NO         effective_on_any_ref = NO
  current_trust_role        = NONE
  (bär reglerna deletion, non_fast_forward, pull_request[1 approval];
   bypass_actors = [] — relevant först om det får en include-post)
```

**Classic branch protection är den uppmätta och effektiva main-protectionen.** Den följde med
transfern och är mätt efteråt: force push och deletion förbjudna, PR-kravet kvar. Rulesetet
träffar ingenting och **får inte räknas som ett skydd** — men det får heller inte tas bort eller
ändras av en byggsession.

Auto-promotion faller mot dagens `main` tills *Nortropic Promoter* ligger i
`bypass_pull_request_allowances.apps`. **Bypassen gäller endast PR-kravet** — ingen generell
bypass över branch-skydd. Mänsklig utveckling fortsätter som `branch → PR → main`.

---

## CODEX_START_HERE

**S1 · h-017.** Spec-raden finns på main (slice 15, `depends_on` h-002 + h-016, skrivytan vidgad
med `controller/attest/cli`). **Provet `verify/bin/h-017-exit` saknas och byggs FÖRST, i ägarhand
— inte av byggsessionen.**

Mätt och klart att bygga på:

- `"bash": "bash"` i `RUNNERS` räcker för att registret ska kunna starta husets grindar. Prövat i
  klon: `verify run p-001-exit .` → 6 PASS 0 FAIL, `h-002-exit` orört 6 PASS 0 FAIL,
  `hash_mismatch` fäller fortfarande när grinden drivit.
- `verify run h-016-exit <worktree>` → 25 PASS 0 FAIL med worktree-listan identisk före och efter.
  Rekursionsfrågan är besvarad; inget undantag behövs.
- Grindarnas kostnad: h-002 0,2 s · h-013 7,7 s · h-011 10,7 s · h-016 29 s. Ingen når en minut.
- `kmd_write` i `controller/attest/cli` bygger en fast dict med fyra fält. `grind_id` och
  `grind_sha256` läggs till som **valfria argument** så h-011:s och h-016:s anrop står orörda.
  `verify/bin/h-003-exit` grepar mot värden, inte fältuppsättning — extra fält fäller den inte.
- **G20 måste in i provet:** en trust-critical kandidat vars komponent är saboterad så att den
  alltid säger JA ska ändå inte attesteras. Bevis att inversionen är verklig: `_lib.sh` rad 7–14
  gör `[ ! -x "$1" ]` på en relativ väg, och `kmd_run` sätter `cwd=mal`.

**Öppen riggfråga att lösa när provet skrivs:** `REGISTER` i `controller/verify/cli` är en fast
sökväg och går inte att peka om, så ett fixturregister kräver mutation av repots register med
säkerhetskopia och `trap` (h-002:s precedent, vald väg) — eller en klon som bär arbetsträdets
komponenter.
