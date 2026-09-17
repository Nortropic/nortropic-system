> **UTKAST — TRANCHE 0 (2026-08-24). EJ PRODUKTION, EJ AUKTORITET.**
> Design-utkast enligt den DESIGN-FRUSNA masterplanen. Konsumeras av INGENTING
> före FOUNDATION_REPAIR_GATE; skarp version landar i sin riktiga hemvist i S1+/P1.

# Outreach-policymatris: motorn som klassar varje kontakt FÖRE kontakt (Part 2e)

Etikettdisciplin: **[LEGALT FAKTUM]** = verifierat i S0b-researchen 2026-08-24 ·
**[RESEARCH-INDIKERAT]** = indikerat, verifieras mot auktoritativ källa före klassning ·
**[DESIGN]** = beslut. Grundlag: **outreach-policymotorn finns FÖRE all autonom outbound —
och före skalning av manuell outbound.**

## 1. Matrisens struktur

**[DESIGN]** Varje potentiell kontakt utvärderas mot en radnyckel av sex dimensioner:

1. **Mottagarens juridiska form**: enskild firma · AB · HB/KB · förening · offentlig
2. **Fysisk/juridisk person**: adressatens natur (enskild firma = fysisk; rolladress på AB =
   juridisk; namngiven individ på AB = gråzon, se §2)
3. **Kanal**: SMS · e-post · telefon (mänsklig uppringare) · telefon (autodialer/robotsamtal) ·
   adresserad post · social-DM
4. **Datakälla**: offentligt register (Bolagsverket/SCB) · egen kontroll · Places-session ·
   köpt lista
5. **Samtyckes-/relationsstate**: ingen relation · pågående dialog · kund · f.d. kund ·
   uttryckligt samtycke
6. **Opt-out/suppression-state**: NIX-registrerad · intern DO-NOT-CONTACT · invändning ·
   ingen spärr

→ **Verdikt: TILLÅTEN / VILLKORAD(villkor listade) / FÖRBJUDEN / OKLASSIFICERAD.**

Två lagar: **OKLASSIFICERAD BETER SIG SOM FÖRBJUDEN** (fail-closed — ingen kontakt förrän
cellen är klassad mot källa). **En TILLÅTEN/VILLKORAD-cell utan verifikationsrad
(källa + klausul + datum) är ogiltig och faller tillbaka till OKLASSIFICERAD.**

## 2. Kandidatrader (nuvarande research-läge)

FÖRBJUDEN-rader får klassas direkt på research-indikation (att förbjuda är fail-closed-säkert).
Varje TILLÅTEN/VILLKORAD nedan är **KANDIDAT: "research-indikerad — verifieras mot
auktoritativ källa före klassning som TILLÅTEN"**.

| # | Rad (form × person × kanal × state) | Verdikt-kandidat | Grund |
|---|---|---|---|
| R1 | Enskild firma (fysisk person) × SMS/e-post × inget samtycke | **FÖRBJUDEN** | **[LEGALT FAKTUM]** MFL **19§** kräver opt-in för SMS/e-post till fysisk person; **enskild firma = fysisk person ÄVEN i näringsverksamhet (avgjord doktrin — repots "gråzon"-rationale är fel)**. Manuellt sändande undantar inte; gratis-demo-framing ÄR marknadsföring; varje SMS är sitt eget bevisföremål. Sanktion upp till 4 % av omsättning. |
| R2 | AB (juridisk person, rolladress t.ex. info@) × SMS/e-post × ingen spärr | **VILLKORAD** (kandidat) | **[RESEARCH-INDIKERAT]** MFL **20§**: opt-out-regim + krav på **reklamidentifiering**, giltig avsändare och fungerande opt-out-adress i varje utskick. |
| R3 | Namngiven individ på AB (fornamn.efternamn@bolag) × e-post | **OKLASSIFICERAD** | **[RESEARCH-INDIKERAT]** förhöjd-risk-gråzon: adressen är persondata; 19§/20§-gränsen och GDPR-exponeringen kräver auktoritativ klassning innan användning. Behandlas tills dess som FÖRBJUDEN. |
| R4 | Fysisk person (inkl. enskild firma) × telefon, MÄNSKLIG uppringare × NIX-tvättad, ingen invändning | **VILLKORAD** (kandidat) | **[RESEARCH-INDIKERAT]** MFL **21§** opt-out-regim: kräver **NIX-tvätt före varje kampanj** + branschregler (Kontakta). **Endast mänskliga uppringare — autodialer/robotsamtal flippar till 19§ opt-in** ⇒ FÖRBJUDEN utan samtycke. |
| R5 | Alla former × adresserad post × ingen intern spärr | **TILLÅTEN** (kandidat) | **[RESEARCH-INDIKERAT]** adresserad direktreklam är opt-out-regim; verifieras (SWEDMA/etiska nämnden + MFL) före klassning som TILLÅTEN. |
| R6 | Vad som helst × vad som helst × intern DO-NOT-CONTACT eller invändning | **FÖRBJUDEN** | **[DESIGN]** absolut; invändning är terminal (§3). |
| R7 | Nuvarande SMS-spelet (enskild firma, demo-SMS) | **FÖRBJUDEN** | **[LEGALT FAKTUM]** icke-kompatibelt I DAG (= R1). Fixen är **kanalbyte, inte pappersarbete** — och bytesmålen (R2/R4/R5) är kandidater tills matrisen klarerat dem. |

**SMS FÖRBLIR STOPPAT.** **[DESIGN]** Restatement av den befintliga avsiktliga gränsen:
SMS är manuellt-och-nu-stoppat tills legalt + policy + kvalitet + förtroende är explicit
löst av ägaren. Ingen rad i denna matris återöppnar SMS.

## 3. Policy-invarianter (motorns lagar — inte konfiguration)

**[DESIGN]** (research-grund: AI-SDR-backlashen + bulk-sender-fakta i S0b)

1. **VOLYMTAK ÄR INVARIANTER, INTE CONFIG.** Ingen agent, ingen kampanj, ingen ägar-stress
   kan höja dem i runtime; ändring = ägarbeslut i versionerad policy.
2. **VARJE KONTAKT LAGRAR SITT SKÄL**: signal som utlöste den + rättslig grund + vilken
   matriscell som utvärderades (radnyckel + verdikt + verifikationsdatum). Compliance-
   artefakten ÄR kvalitetsmekanismen.
3. **GLOBAL OMEDELBAR DO-NOT-CONTACT**: en spärr slår igenom i alla kanaler, alla kampanjer,
   omedelbart.
4. **KAMPANJ-ÅTERINTRÄDE BLOCKERAT**: ett prospekt som lämnat en kampanj (nej/tystnad efter
   sekvensslut) återinträder aldrig automatiskt.
5. **INVÄNDNING ÄR TERMINAL**: invändning mot direktmarknadsföring = permanent suppression
   för DM-ändamålet (GDPR-mekaniken i fil 4).
6. **AVSÄNDARRENOMMÉ = FÖRBRUKNINGSBAR DELAD TILLGÅNG**: domän-/nummerrenommé modelleras som
   kapital som varje utskick spenderar; förbrukning är en stoppsignal, inte en kurva att rida.
7. **Art 14-notis vid FÖRSTA kontakt** (skelett i fil 4) — oavsett kanal.
8. **Bulk-sender-regler för ALL e-post**: **[LEGALT FAKTUM]** (Google/Yahoo, feb 2024)
   SPF + DKIM + alignad DMARC · one-click unsubscribe (RFC 8058) på marknadsföringsmail ·
   klagomålsfrekvens **<0,3 %** (mål <0,1 %). Under golvet = sändstopp, inte "övervaka".

## 4. Auktoritetsseparation

**[DESIGN]** Sex separata befogenheter — aldrig samlade i en agent:
**research** (read-only, FACT/INFERENCE/UNKNOWN-disciplin) · **utkast** (draft, sänder aldrig)
· **sändning** (EXTERNAL-WRITE-klass: explicit auktoritet + audit-rad per touch; aldrig
självauktoriserad) · **uppföljning** (egen befogenhet, egna volymtak) · **bokning** ·
**förhandling** (§A5 "Affären": priser/paket/löften = ägaren, alltid). Motorn utvärderar
varje befogenhets handling separat mot matrisen.

## 5. Verifikationschecklista (per cell, före TILLÅTEN/VILLKORAD)

**[DESIGN]** Varje cell klassas först när följande är läst i ORIGINALKÄLLA och citerat med
klausul + datum i cellens verifikationsrad:

| Vad som verifieras | Auktoritativ källa |
|---|---|
| MFL 19§/20§/21§ exakt lydelse (opt-in/opt-out, reklamidentifiering, telefonregim) | **riksdagen.se** — SFS 2008:486 (konsoliderad, aktuell lydelse) |
| Enskild firma = fysisk person-doktrinen; sanktionspraxis | **Konsumentverket** (tillsyn MFL) + rättspraxis via riksdagen.se/domstolsverket |
| GDPR-grund: LIA-krav, Art 14, invändning, Bonnier-gränsen | **IMY** (vägledning + tillsynsbeslut) |
| NIX-tvättkrav, telefonbranschens regler, autodialer-gränsen | **NIX-Telefon / Kontakta** (branschregler) |
| Adresserad post-regimen | **SWEDMA/etiska regler** + Konsumentverket |
| Bulk-sender-golvet | Google Postmaster/Yahoo sender requirements (plattformskrav, redan verifierade i S0b — omverifieras vid implementation) |

Verifikationsrad-format: `verifierad_at · källa · klausul · av vem`. Saknas raden ⇒
OKLASSIFICERAD ⇒ ingen kontakt.

## 6. Öppna frågor till ägaren

1. **Kanalprioritet för kanalbytet** (R2/R4/R5): vilken kandidatkanal verifieras och testas
   först — telefon-med-NIX-tvätt, AB-rolladress-e-post, eller adresserad post?
2. **Volymtakens nivåer**: invarianterna är designade som lag — men siffrorna (per
   dag/vecka/kanal) är ägarbeslut. Vilka?
3. **R3 (namngiven individ på AB)**: ska raden alls klassificeras, eller permanent-förbjudas
   av policy (enklare, snävare, säkrare)?
4. **NIX-tvätt operativt**: tvätt via Kontakta-avtal kostar och kräver medlemskap/avtal —
   acceptabelt för en enpersonsbyrå, eller faller R4 på ekonomi?
5. **Social-DM**: kolumnen finns i matrisen men saknar research helt — utreda eller
   permanent-FÖRBJUDEN?
