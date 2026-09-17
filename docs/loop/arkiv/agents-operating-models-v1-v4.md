# Arkiv: AGENTS.md:s operating-model-block v1–v4 och publiceringshistorik

**Datum:** 2026-09-17 · **Producent:** kedjedrivaren (L2, ägaruppdraget 2026-09-17 §4.1) ·
**Status:** ARKIVLEGEND — proveniens, inte gällande text.

Ordagrann kopia av `AGENTS.md` rad 79–82, 295–322 och 324–393 ur blob
`3a6c777b9df31df4177f09aa341848c67d1c459d` (commit `371b4a76`, `origin/main` 2026-09-17 12:25).
Ersatt av `AGENTS.md` §7 (publicering) och §10 (frysta ägarkontrakt) samt beslutsraden
`LOOP-ÄGARBESLUT-PUBLICERING-V2`. Operating model v1 (`PUSH=NO / MERGE=NO`) finns endast i
git-historiken (före `5dd7799`). Källorna förblir `docs/loop/codex-autopilot-v2.md`,
`docs/loop/codex-autopilot-v3-full-roadmap.md` och `docs/loop/harness-substitution-contract-v1.md`
(blob-pinnad av `scripts/nortropic-codex-autopilot.py`; bär raden `PRODUCT=…` fryst).
Denna fil autoladdas av inget verktyg och får inte importeras i en ingång.

---

<!-- AGENTS.md rad 79–82 @3a6c777b -->
Raden `PRODUCT=NORTROPIC_AUTONOMOUS_WEBSITE_FACTORY` i operating model v4 nedan står
kvar ordagrant därför att blocket är ett fruset owner-amendment från 2026-08-11 och
bärs av `docs/loop/harness-substitution-contract-v1.md`. Den namnger kärnans
nedströmskonsument, aldrig detta repos leverans.

<!-- AGENTS.md rad 295–322 @3a6c777b -->
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

<!-- AGENTS.md rad 324–393 @3a6c777b -->
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
