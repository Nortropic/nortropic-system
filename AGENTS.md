# Codex i nortropic-system

Detta är en **router**, inte ett nytt regelverk.

## Repots identitet

Detta repo är Nortropics **trust kernel / bootstrap**. Leveransen är kontrollplanet:
`controller/`, `verify/`, `specs/tasks.spec.json` och `docs/loop/`. Webbfabrikslagret
(`agents/`, `skills/`, `packs/`, `backtests/`, `workflows/` och `docs/00`, `01`, `02`,
`04`, `06`) ligger kvar i trädet efter repodelningen och beskriver kundflödet — ett annat
spår, aldrig detta repos mål. `docs/07-konstitution.md` och `docs/03-regelverk.md` bär
webbfabrikens sakregler och nämner kärnan inte alls, men kärnan är PINNAD till dem: fem
respektive ett fryst exitprov i `verify/bin/` läser dem, liksom `controller/verify/cli`.
De binder alltså här av beroende, inte av innehåll. `docs/05-beslutslogg.md` är genuint
delad och kernel-dominerad — tio frysta exitprov läser den.

`node scripts/kor-vakter.mjs` är webbfabrikens grindsvit och säger **exakt en sak:
webbfabriken är inte söndrad.** Citera den ALDRIG som bevis för kernelarbete. Av 23 vakter
refererar 16 enbart webbträdet, 2 enbart kärnan, 1 båda och 4 inget träd alls — men **den
fördelningen mäter vad en fil PEKAR PÅ, inte vad den TILLHÖR.** Mätt 2026-09-16: noll av de
23 läser `docs/loop/regler.md`, `docs/loop/drift.md` eller `docs/loop/raddning/**`, och
`kor-vakter.mjs` finns inte på plattformsgrenen. Kärnans dom är `controller/verify/cli`
och taskens frysta `exit_test` under `verify/bin/` — och de kräver MACEN, men **inte av
Python-skäl**: `controller/verify/cli` kräver 3.12+ och startar fint i en Linuxcontainer
som har den. Det som fäller är **Darwin-bindningen**, `undefined symbol: sysctl` (mätt på
`h-013`: 5 PASS, 11 FAIL, alla av den orsaken). Att installera Python 3.12 löser
ingenting. **Fel maskin är `ODÖMBART`, aldrig `FAIL`**, och ett ODÖMBART blir aldrig grönt
av en grön webbsvit (`LOOP-RÄTTELSE-VAKTBEVIS`).

`scripts/` och `tests/` är BLANDADE kataloger, inte webb. Kärnans där, enligt
`PLATFORM_EXACT` i plattformsgrenens `check-invariants.mjs` (PINV-003/005):
`check-invariants.mjs`, `nortropic-codex-autopilot.py` (allowed_write för h-031/032/035),
`check-verifierarregistret.mjs`, `tests/controller/**`, `tests/scripts/**`. De följer
aldrig med webbträdet. **`check-provanropare.mjs`, `kor-styrprov.mjs` och `kor-vakter.mjs`
är INTE kärnans** (rättat 2026-09-16, FYND 31): `SEPARATION-20260910/ALLOCATION.tsv` dömer
alla tre `WEB / WEB_MOVE`, och ingen finns på plattformsgrenen, vars `scripts/` bär två
filer. `check-provanropare.mjs` refererar bara kernelsökvägar — det var därför den
felklassades. **Ägandet avgörs av separationen, aldrig av ett grep.**

**Vägen till klar kärna** står i **`docs/loop/raddning/VAGEN.md`** — den **enda** filen i
repot som säger vad som görs härnäst. Slutkriteriets sex mätbara rader, körbanan, faserna,
autonomikontraktet och de sex fällorna. Läser du en ordning någon annanstans är den
upphävd; `03`, `10` och `12` bär en banner som säger det.
`raddning/PROMPT-TILL-CODEX.txt` är ingången för Codex-sessioner och pekar hit. Katalogen
bär i övrigt **analys och plan, aldrig status** — status är `docs/loop/drift.md`.

**Läget läser du aldrig, du räknar fram det:**

```bash
bash docs/loop/raddning/artefakter/helhetsbilden.sh          # 2 sek
bash docs/loop/raddning/artefakter/helhetsbilden.sh --kor-grindar   # + de 14, Darwin
```

Rätt maskin, rätt klon, dagsfärsk, vilka av de sex raderna som är uppfyllda, vad
plattformsgrenen bär som `main` saknar. Provet påstår aldrig ett grindutfall det inte
kört. **Skälet att det är ett prov och inte ett stycke text:** katalogen är tjugo filer
och ~4 000 rader som beskriver helheten på fem överlappande sätt, och ingen av dem visar
läget. Ett dokument om ett tillstånd är inaktuellt dagen efter.

**Lita inte på den, pröva den.** Tretton felaktiga påståenden hittades under arbetet,
nio av dem i underlaget självt, och elva av tretton kom av en lexikal metod som aldrig
prövades mot beteendet. Kör
`bash docs/loop/raddning/artefakter/validera-underlaget.sh` (37 påståenden mot repot;
exit 0 = talen stämmer, 1 = underlaget bär ett fel, 2 = ODÖMBART) innan du lutar ett
beslut mot ett tal där. Grönt betyder att talen är oförändrade, aldrig att de är sanna —
den oberoende omhärledningen i `raddning/06-inventering.md` §0 är fortfarande
obligatorisk, liksom §0c om det lokala maskintillståndet.

**Backupen** ligger i `Nortropic/nortropic-backups` (repo-ID 1367371291) — inte en kopia
av detta repo. Git bär katalog, checksummor och kvitton; arkiven är **Release assets som
inte följer med en klon**. Rutin i dess `BACKUP-RUNBOOK.md`, plus ett kontinuitetslager
(checkpoints, Codex→Claude-handoffs, disk-journal) utan motsvarighet här. **Backuparbete
ska ge en rad i `docs/loop/drift.md` samma dag.** 2026-09-09→13 gav 27 commits där och
noll rader här — fem dagar utan spår i kärnans lägesdokument.

`CLAUDE.md` är samma router för Claude-sessioner och bär samma auktoritetsordning.
Ändras den ena ska den andra följa med i samma commit.

Raden `PRODUCT=NORTROPIC_AUTONOMOUS_WEBSITE_FACTORY` i operating model v4 nedan står
kvar ordagrant därför att blocket är ett fruset owner-amendment från 2026-08-11 och
bärs av `docs/loop/harness-substitution-contract-v1.md`. Den namnger kärnans
nedströmskonsument, aldrig detta repos leverans.

## Auktoritet

Läs och följ i denna ordning när de är relevanta:

1. `docs/07-konstitution.md`
2. `docs/03-regelverk.md`
3. `docs/loop/regler.md` för kontrollplansbygget
4. aktuell task i `specs/tasks.spec.json`
5. taskens frysta `exit_test`
6. relevanta plan- och driftdokument

Vid konflikt gäller den högre auktoriteten. Återge inte reglerna här; peka på källan.

## Repoidentitet före arbete

Innan en ändring som kan påverka Git- eller trust-state:

```bash
git branch --show-current
git rev-parse HEAD
git status --short
git rev-parse origin/main
```

Om remote inte kan kontrolleras: skriv `ORIGIN_MAIN=OVERIFIERAT`; gissa aldrig.

Ingen force-semantik: varken `--force`, `--force-with-lease`, ledande `+` i refspec eller history overwrite.

## Rollseparation

En Codex-tråd/worktree har **en** roll åt gången:

- `$nortropic-test-author` — owner-begärd spec/acceptance-gate-förberedelse. Ingen produktionsimplementation.
- `$nortropic-builder` — implementerar en redan fryst task inom `allowed_write`. Ändrar aldrig sin egen frysta spec/gate.
- `$nortropic-reviewer` — oberoende, normalt read-only, försöker falsifiera builderkandidaten.

Blanda inte roller i samma tråd bara för att spara tid. Om ett uppdrag kräver byte av trustroll: stoppa och rapportera.

## Vad rollseparationen ÄR

Rollerna ovan är **workflow-separation**, inte en mekanisk säkerhetsgräns.

```text
CODEX_ROLE_SEPARATION=WORKFLOW
CODEX_ROLE_SEPARATION_IS_SECURITY_BOUNDARY=NO
FROZEN_OWNER_GATES_REMAIN_TRUST_AUTHORITY=YES
OWNER_GATE_REQUIRED=YES
```

Skills och separata Codex-trådar/worktrees minskar rollblandning och koordinationskostnad,
men de ersätter inte Nortropics mekaniska `allowed_write`, sandbox, frozen exit-test,
attestation eller owner-gates.

En Codex-roll får därför aldrig använda sin Skill som bevis för att en fil faktiskt var
mekaniskt otillgänglig.

## Evidence

Slutrapporten ska följa `docs/loop/codex-evidence-contract.md`.

Codex egen utsaga är inte owner-bevis. Ett grönt exit-test rapporteras med faktiskt kommando + exitkod. Overifierat märks `OVERIFIERAT`.

## Push / merge

### ⚠️ LÄS FÖRST: BEVARANDE och PUBLICERING är inte samma sak (regel 12a, 2026-09-16)

Publiceringsparagrafen nedan gäller **PUBLICERING**. Den har aldrig gällt **BEVARANDE**, och
att läsa den så är vad som gav ~300 lokala grenar, en `main` 493 commits efter origin och
veckan med 55 opushade commits som ingen såg på sex dagar.

| | Vad | Trust-innebörd | Vem |
|---|---|---|---|
| **BEVARANDE** | commit + push till ARBETSGRENEN | **ingen** — en commit är inte en attestation | **AUTOMATISKT, aldrig en människa** |
| **PUBLICERING** | attestation, PR, merge till `main` | hela trust-kedjan | kontraktsflödet nedan, oförändrat |

**Du committar och pushar ditt eget arbete till din arbetsgren, alltid, utan att fråga
någon.** Kör `bash scripts/nortropic-autocommit.sh "<vad du gjorde>"` vid varje avslutat
arbetssteg och alltid innan du slutar. Den vägrar på `main`, lägger §A-ytor i en egen
`[AUTOCOMMIT][HÖGRISK-OGRANSKAD]`-commit, pushar aldrig med `--force` och mergar aldrig.

**§A bevarad är inte §A auktoriserad.** En ändring på §A-KONTROLLENS yta — `CLAUDE.md`,
`AUTOPILOT`, `workflows/**`, `tests/fixtures/**`, `check-invariants.mjs`,
`agents/nortropic-steward.md`, webbens två styrdokument, de två `skills/`-referenserna —
kräver människohand och en rad i `docs/05-beslutslogg.md`.

*(Skärpt 2026-09-16, `LOOP-ÄGARBESLUT-AUTONOM-KARNA`: `controller/**`, `specs/**` och
`verify/**` omfattas INTE längre. De skyddas av `allowed_write` per task, rollseparationen
och de frysta exitproven — den mekaniska vakten var alltid `allowed_write`, ägarhanden var
en sats i prosa. Autocommitens `[HÖGRISK-OGRANSKAD]`-märkning gäller därför nu bara
§A-kontrollens yta.)*

Autocommiten hindrar bara att arbetet försvinner. Att blanda ihop *kan* och *får* är vad `SELF_CERTIFICATION_AS_PROOF=NO`
förbjuder.

**Att lämna arbete okommitterat eller opushat är ett FEL, inte försiktighet.** Rollseparationen
hindrar en byggare från att attestera sin egen kandidat — aldrig från att spara sitt arbete.

### Publicering — GÄLLANDE BEFOGENHET, 2026-09-16

**Denna paragraf ersätter `PUSH=NO / MERGE=NO` och de fyra lager som byggdes ovanpå den.**
Beslutad av Johnny (`LOOP-ÄGARBESLUT-PUBLICERING-V2`). Den är en **sammanjämkning av vad
som redan var beslutat fyra gånger**, inte en ny befogenhet.

| Vem | Får publicera | Skäl |
|---|---|---|
| **Rollagent** — test-author, builder, reviewer | **NEJ, aldrig** | Rollseparationen ÄR integriteten: den som bygger får inte attestera sin egen kandidat |
| **Den som driver kedjan** — autopiloten, eller Codex i arkitekt-/exekverarroll | **JA, utan ny prompt per transition** | Efter de mekaniska identity/scope/gate/reviewer-kontrollerna |

**Scope: hela vägen till `KERNEL_COMPLETE`** — inte en namngiven tasklista.

> ⚠️ Skälet till att scopet inte namnger task: delegationens
> `remaining-bootstrap-delegation-v1.md` scopade till
> `H-035 → H-034 → H-033 → H-032 → H-031 → supervisor resume`, och **h-031, h-032 och
> h-035 avslutades `OVERIFIERAT` 2026-09-16**. Tre av fem namngivna task var döda, och
> publiceringsbefogenheten hängde på dem. En befogenhet som namnger task dör med tasken.

**Oförändrat, och det är detta som bär trusten:**

- `NO_FORCE_SEMANTICS=YES` — aldrig `--force`, rebase, amend, reset eller cherry-pick
- Guarded normal merge-commit, aldrig squash eller rebase-merge
- Frysta `exit_test` förblir trust authority; `SELF_CERTIFICATION_AS_PROOF=NO`
- Omedelbart före merge relockas repo, base-ref, `origin/main`, arbetsträd, kandidat,
  fjärrgren och PR-refs enligt delegationens *Guarded publication*
- Saknad evidens avvisar. Ny policy-/arkitekturfråga, odömbart gateutfall, oväntad
  remote-identity eller no-progress stoppar fail-closed

**Historiken står kvar nedan** — operating model v1, v2, v3 och Harness Substitution
Amendment v1 — som proveniens, inte som gällande text. Vid konflikt gäller denna paragraf.

<details>
<summary>Varför den behövde skrivas (mätt 2026-09-16)</summary>

Fem befogenhetslager på fyra dagar, alla `[LOOP] ÄGARHAND`, inget som gick tillbaka och
ändrade det första:

| Datum | Lager | Sade |
|---|---|---|
| 2026-08-10 | operating model v1 | `PUSH=NO` · `MERGE=NO` |
| 2026-08-10 | operating model v2 | autopiloten FÅR publicera, PR:a, merga |
| 2026-08-10 | operating model v3 | full roadmap autonomy |
| 2026-08-11 | Harness Substitution Amendment v1 | — |
| 2026-08-13 | delegationen | `OWNER_MERGE_APPROVAL_REQUIRED=NO` |

Den som läste uppifrån mötte `MERGE=NO` först och undantagen hundra rader ner. Och
delegationens scope pekade på en kedja som sedan dog. Två utfall, båda dåliga: agenten
stannar och frågar, eller antar att han får.

</details>

För den strikt avgränsade kvarvarande bootstrapkedjan H-035 → H-034 → H-033 →
H-032 → H-031 → supervisor-resume → första verkliga autonoma start gäller den
versionerade owner-delegationen i
`docs/loop/remaining-bootstrap-delegation-v1.md`. Den tar bort interaktiv human
närvaro men aldrig de mekaniska grindarna, och kräver guarded normal merge commit.

<!-- CODEX-OPERATING-MODEL-V2 -->
## Codex operating model v2 — stående owner-befogenhet för mekanisk exekvering

Owner har 2026-08-10 uttryckligen auktoriserat `scripts/nortropic-codex-autopilot.py` att vara den mekaniska exekveraren för redan owner-auktoriserat kontrollplansarbete.

```text
OWNER_AUTHORITY_REQUIRED=YES
HUMAN_OWNER_PRESENT_PER_TASK=NO
OWNER_GATE_EXECUTOR=MECHANICAL
FROZEN_OWNER_GATES_REMAIN_TRUST_AUTHORITY=YES
```

Detta ändrar inte auktoritetsordningen ovan och gör inte Codex-prosa till trust authority. Rollagenterna **publicerar** fortfarande inte — de skapar inga immutable candidate commits, ingen attestation, ingen PR och ingen merge. **De BEVARAR däremot alltid sitt arbete** med `scripts/nortropic-autocommit.sh` enligt regel 12a; det är inte publicering och kräver inget godkännande. *(Skärpt 2026-09-16: meningen löd tidigare "Rollagenterna committar/pushar/mergar fortfarande inte", vilket lästes som ett förbud mot att spara arbete och kostade ~300 lokala grenar.)* Autopiloten får, efter sina mekaniska identity/scope/gate/reviewer-kontroller, skapa immutable candidate commits, publicera, skapa PR och rebase-merga med expected-head-guard utan ny interaktiv owner-prompt per transition.

En verklig ny policy-/arkitekturfråga, odömbart gateutfall, oväntad remote-identity eller no-progress stoppar fortfarande fail-closed.

<!-- CODEX-OPERATING-MODEL-V3 -->
## Codex operating model v3 — full-roadmap autonomy

Owner har 2026-08-10 delegerat den återstående kontrollplansroadmapen S2, S4–S13 och den empiriska obevakade slutkörningen till den mekaniska autopiloten under den ägarlåsta planen på commit `0b3212c991d4227c8df2656465ae2c0252dda39e`.

```text
FULL_ROADMAP_AUTONOMY=YES
HUMAN_OWNER_PRESENT_PER_SLICE=NO
OWNER_DECISION_REQUIRED=INTERNAL_ARCHITECT_SIGNAL
HUMAN_AUTHORITY_HARD_STOP=EXCEPTION_ONLY
FROZEN_OWNER_GATES_REMAIN_TRUST_AUTHORITY=YES
```

`$nortropic-architect` är read-only och löser normala arkitekturfrågor under högre authority och den exakta frozen roadmapen. `OWNER_DECISION_REQUIRED` från test-author/builder/reviewer är därför en intern routingsignal till architect, aldrig i sig en mänsklig handoff.

Mänsklig hard-stop får endast användas för gränser som v3-owner-delegationen uttryckligen undantar, exempelvis konstitution/§A-human-only, juridiskt human-only, verklig konflikt mellan högre authorities eller en extern credential-/provisioningceremoni som inte kan utföras utan att försvaga kontraktet. Full definition: `docs/loop/codex-autopilot-v3-full-roadmap.md`.

V3 lägger även till `$nortropic-empirical-runner`: en read-only closeout-roll som kör stage L i disposable state efter att S2/S4–S13 är gröna. Den bygger inget och dess utsaga är inte PASS-authority; `FULL_ROADMAP_COMPLETE` kräver orchestratorns egna identity/gate/invariant-kontroller runt dess faktiska run-evidence.


### Programnivå-domen

Full-roadmap completion har en separat frozen program gate:

```text
verify/bin/autonomous-loop-exit
```

Den fryses av test-author + gate-reviewer innan downstream roadmap implementation. Independent
empirical-runner får falsifiera den, men får aldrig ersätta ett rött gate-resultat med prosa-PASS.

<!-- CODEX-OPERATING-MODEL-V4-PROVIDER-NEUTRAL -->
## Codex operating model v4 — provider-neutral Trust Kernel

Owner has 2026-08-11 amended the remaining autonomous-loop **implementation shape** through `docs/loop/harness-substitution-contract-v1.md`. Higher authority and the exact frozen roadmap remain unchanged for required effects, migration intent and negative controls.

```text
NORTROPIC_ARCHITECTURE=PROVIDER_NEUTRAL_TRUST_KERNEL
PRODUCT=NORTROPIC_AUTONOMOUS_WEBSITE_FACTORY
AGENT_REASONING_OWNER=PROVIDER_HARNESS
TRUST_TRANSITION_OWNER=NORTROPIC
MODEL_OUTPUT_IS_TRUST_AUTHORITY=NO
FROZEN_OWNER_GATES_REMAIN_TRUST_AUTHORITY=YES
SUBSTITUTION_BEFORE_NEW_HARNESS_COMPONENT=REQUIRED
NO_FORCE_SEMANTICS=YES
```

Claude/Codex/future providers own reasoning, sessions, context, tool loops, internal retries and reviewer/remediation intelligence. Nortropic owns TaskContract provenance, allowed_write, G20 containment, exact candidate SHA, deterministic policy/frozen gates, attestation, fencing/recovery, promotion and guarded authoritative transitions.

`$nortropic-architect` must run the five-question substitution test before extending custom harness machinery. Provider/session/reviewer output is workflow evidence only and never PASS/attestation/promotion authority.

Revised sequence after S3 h-003/h-004: SUB-1/h-027 → SUB-2/h-028 → SUB-3/h-029 → SUB-4/h-030 → S2/S4–S13 → L. SUB-0 is this owner amendment, not a builder task.

The quota-aborted dirty worktree `owner/h-003-attestation-validity-44d525a5dd60` is preserved forensic evidence and must not be adopted as authority. Fresh S3 work after this amendment starts from the new authoritative main.
