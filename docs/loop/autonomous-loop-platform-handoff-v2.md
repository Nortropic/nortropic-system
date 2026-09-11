# Plattformens överlämning — plangeneration platform-v2

Ingången till plattformsplanen. Planen själv är `docs/loop/autonomous-loop-plan-platform-v2.md`; detta
dokument säger var man börjar, vad som är låst, när man ska stanna och när arbetet är klart.

## Syfte

Ge en agent som startar ett varv exakt tre saker: den aktiva plangenerationens identitet, de värden som är
låsta och inte får omförhandlas, och den punkt i skivtabellen där arbetet faktiskt börjar.

Dokumentet är ingång, inte regelkälla. Arbetsmetoden står i `docs/loop/regler.md`, auktoritetsordningen i
`AGENTS.md` och målen samt slutkriterierna i `docs/loop/autonomous-loop-plan-platform-v2.md`. Ingenting här
upphäver något av dem.

## Låsta värden och pinnar

```text
PLAN_GENERATION=platform-v2
ROADMAP_PLAN_PATH=docs/loop/autonomous-loop-plan-platform-v2.md
ROADMAP_HANDOFF_PATH=docs/loop/autonomous-loop-platform-handoff-v2.md
PLAN_IDENTITY=blob vid HEAD, pinnad i autopilotens ROADMAP_PLAN_BLOBS
DOCUMENT_PINS=controller/verify/cli PLATFORM_DOCUMENTS (sha256) + autopilotens SUBSTITUTION_BLOBS (blob)
EMPIRICAL_GATE_PATH=verify/bin/autonomous-loop-exit
PHASE=PUSH=NO MERGE=NO
```

Identiteten är filernas blobbar vid HEAD i den auktoritativa arbetskopian — inte en commit, inte en gren och
inte en kopia under någon annan sökväg. Vakten `ensure_roadmap_plan` verifierar båda filerna före varje varv
som bär plan-authority och stoppar vid minsta avvikelse.

Låst utan omförhandling: skivtuplarnas identiteter och ordning, den skyddade mängden i specens
`defaults.denied_write`, att en byggare aldrig får skriva i den grind som dömer den, och att providerutdata
är evidens och aldrig förtroende.

## Startordning

1. Läs `docs/loop/autonomous-loop-plan-platform-v2.md` vid HEAD och kontrollera att dess blob stämmer med
   pinnen; läs sedan detta dokument.
2. Läs `AGENTS.md` för auktoritetsordningen och `docs/loop/regler.md` för arbetsmetoden.
3. Läs `docs/loop/harness-substitution-contract-v1.md` för plattformsgränsen och implementationsformen.
4. Ta första raden i planens skivtabell vars `status` är `OBYGGD` och vars samtliga beroenden är gröna.
   Vid oförändrat läge är det SUB-1 / h-027.
5. Kör rollflödets steg i ordning; hoppa aldrig över den oberoende granskningen.

## Stoppregler

Stanna och rapportera i stället för att gissa när något av detta inträffar:

- Plan- eller handoffblobben avviker från pinnen, eller en fil saknas vid HEAD.
- En nödvändig skrivning ligger utanför uppgiftens `allowed_write` eller inne i den skyddade mängden.
- Den frysta grinden är inte RED av rätt produktskäl på baslinjen, eller blir grön utan att effekten
  inträffar.
- En obligatorisk verifierare saknas, avbryts eller körs mot en annan kandidat än den som ska dömas.
- Extern aktivering krävs (credentials, promotionsidentitet, externa repoinställningar): det är en
  `HUMAN_AUTHORITY_HARD_STOP` och inget att lösa i varvet.

Stoppet är alltid ett rapporterat stopp med skäl och evidens. Ett tyst fallback-värde, en förbigången
kontroll eller en omtolkad grind är aldrig ett giltigt svar på en stoppregel.

## Avslutskriterier

Varvet är klart när uppgiftens frysta exitprov har körts färdigt mot exakt den kandidat som ska dömas,
samtliga obligatoriska kontroller har utförts och den oberoende granskningen inte har kvarvarande
blockerare. Exitkod 0 ensam räcker inte.

Programmet som helhet är klart enligt de fyra nivåerna i planens avsnitt `## Avslutskriterier`:
planseparation, Trust Kernel, lokal bootstrap-milstolpe och — senare, utanför dagens fas — operativ helhet.
Denna handoff avgör ingen av nivåerna; den pekar på dem.
