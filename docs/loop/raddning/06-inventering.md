# Inventering — vägen till klar trust kernel / bootstrap

Mätt 2026-09-16 mot `specs/tasks.spec.json` (auktoritet) och `verify/bin/` (faktiska
gates). Specens beroenden gäller, inte driftloggens prosa.

```bash
python3 -c "
import json,os
d=json.load(open('specs/tasks.spec.json'))
for t in sorted(d['tasks'], key=lambda x:x['id']):
    g=t.get('exit_test',''); print(t['id'], 'JA' if g and os.path.exists(g) else 'SAKNAS',
          t.get('depends_on'), t.get('title','')[:50])"
```

---

## §0. Oberoende ominventering — OBLIGATORISK före användning

**Lita inte på den här filen. Härled den på nytt.**

Underlaget är skrivet av en Claude-session 2026-09-14/16. Vid granskningen samma vecka
visade det sig innehålla ett fel av exakt den klass det självt varnar för: påståendet att
vaktsviten var tom på kernelvakter. Felet kom av ett grep som krävde inledande
citattecken och missade tre referenser.

**Det viktiga i det felet är hur det överlever ett naivt omprov.** Kör du om mitt
kommando får du mitt svar — inklusive mitt fel. Ett omprov som återanvänder metoden
prövar vad metoden SÄGER, inte vad mekanismen GÖR. Det är projektets återkommande fel,
en nivå upp igen.

**Startpunkten är mekanisk, inte en läsning.** Kör
`artefakter/validera-underlaget.sh` från reporoten först: den prövar 37 av underlagets
tal mot repot och säger vilka som fortfarande stämmer. Det sparar arbete — men löser
inte §0, eftersom provet återanvänder underlagets egna kommandon och därmed dess blinda
fläckar. Det är utgångsläget, inte domen.

**§0 har tre krav och de körs alla på Macen:** KRAV A (separationsrevisionen, nedan),
kravet på oberoende omhärledning (längre ned) och **§0c — det lokala
maskintillståndet**. §0c är den som lättast glöms, eftersom den inte syns i något repo.
Ägarens direktiv 2026-09-16: *"lita inte blint på repon."*

> ## ⚠️ KRAV A ÄR UPPFYLLT — av separationen 2026-09-10, inte av detta krav
>
> **`SEPARATION-20260910/ALLOCATION.tsv` bär den fil-för-fil-dom detta avsnitt kräver:
> 443 poster** — 119 plattform, 317 webb, 2 delade (byte-lika kopior), 3 omskrivna
> instruktionsfiler, 2 oklara som behölls oförändrade. Plus
> `SEPARATION-ORIGIN/PROVENIENS.tsv` i webbrepot med blob-OID per fil.
>
> Domen är alltså **femdelad, inte fyrdelad som jag föreskrev nedan** — och den skiljer
> dessutom på *oklar* och *delad*, vilket min indelning inte gjorde.
>
> **Jag visste inte om den när jag skrev detta.** Jag läste separationens commit-titlar
> och körde dess grindar men aldrig `SEPARATION-20260910/`. Se FYND 26 i
> `docs/loop/drift.md`.
>
> **Läs `ALLOCATION.tsv` först.** Kraven nedan gäller som metod för att OMPRÖVA enskilda
> domar i den, aldrig som uppmaning att göra om hela klassificeringen. Och
> `artefakter/klassificera-lager.py` är därmed **överflödig** — den producerade 439
> rader mot ALLOCATION:s 443, utan proveniens och utan ägarens preciseringar.

### KRAV A: fullständig separationsrevision — varje spårad fil, inget stickprov

**Detta är det första du gör, före allt annat i §0.**

Separationen har hittills fällts tre gånger av att en katalog antagits vara enhetlig:
`scripts/` (fem kernelfiler), `tests/` (elva), `config/` (sju). Varje gång upptäcktes det
av en ägarfråga, aldrig av ett prov. **Kataloger är inte lager.** Bara en fil-för-fil-dom
ger en ren separation.

`artefakter/klassificera-lager.py` bär klassificeringen som den såg ut 2026-09-16:

```bash
python3 klassificera-lager.py              # tabell: 439 filer, 121 kärna, 7 delat, 311 webb
python3 klassificera-lager.py --web-paths  # sökvägslistan bundlen genererades ur
```

**Kör den, och härled sedan om varje dom med en ANNAN metod än skriptets.** Skriptets
metod är en handkurerad mängd plus sökvägsprefix — alltså precis den sortens lexikala
regel som redan felat tre gånger.

Oberoende metoder att använda i stället:

| Signal | Kommando | Vad den fångar |
|---|---|---|
| **Konsument** | `grep -rl "$(basename $f)" controller/ verify/ specs/` | Vem som faktiskt läser filen — starkaste signalen |
| **Ursprungsdatum** | `git log --reverse --format=%ad --date=short -- "$f" \| head -1` | Allt före **2026-08-07** föregår kärnan och är presumtivt webb |
| **allowed_write** | sök filen i `specs/tasks.spec.json` | En fil som en kernel-task får skriva i ÄR kärnans |
| **Fryst prov** | `grep -rl "$f" verify/bin/` | Refereras den av ett fryst exitprov kan den inte flytta utan omfrysning |
| **Beteende** | ta bort filen i en kopia och kör `controller/verify/cli` respektive `kor-vakter.mjs` | Vilken sida som faktiskt går sönder |

**Domen ska vara fyrdelad, inte tvådelad:**

| Lager | Betyder |
|---|---|
| `KÄRNA` | Stannar i `nortropic-system` |
| `WEBB` | Flyttar till `nortropic-web` |
| `DELAT` | Läses av båda — stannar tills arkitekten avgjort ägarskap per fil |
| `OVERIFIERAT` | Kunde inte avgöras — **flyttar inte**, fail-closed |

**Fail-closed:** en fil vars lager är osäkert stannar. Att flytta fel fil ut ur kärnan är
irreversibelt på fel sätt — det bryter frysta ankare. Att låta en webbfil ligga kvar en
runda till kostar ingenting.

### Kända ihopblandningar att granska särskilt

| Yta | Varför |
|---|---|
| `scripts/` | 34 filer. Fem är kärnans, däribland `nortropic-codex-autopilot.py` (2878 rader) |
| `config/` | 13 filer. Sju är kärnans, läses av `h-031`, `h-032`, `h-035` och `controller/authority` |
| `tests/` | `tests/controller/**` och `tests/scripts/**` är kärnans; `tests/fixtures/**` är webbens §A6-baselines |
| `docs/` rot | `03`, `05`, `07` och `agentoverlamning` är DELADE. Resten av serien är webb |
| `controller/verify/register.json` | Registrerar **webbfiler**. Detta är den cirkulära kopplingens enda rot |
| `AUTOPILOT` | Webbens §A6-kill-switch, men står i byggplan-v3 §3.1:s §A-mängd för kärnan |
| `.gitignore` | Vitlistning som binder `allowed_write`. Måste skrivas om på **båda** sidor |

### Kravet: härled varje bärande påstående med en ANNAN metod

| Påstående | Min metod (lexikal) | Krävd oberoende metod (beteende) |
|---|---|---|
| Vaktsvitens lagerfördelning 16/2/1/4 | grep efter trädprefix i källan | **Kör sviten i en kopia där webbträdet är borttaget.** Vilka vakter ändrar verdikt? Det mäter vad de faktiskt läser |
| `h-014`/`h-015` saknar gate | `os.path.exists(exit_test)` | Kör `verify/bin/h-014-exit`; fångar även en gate som finns men är tom eller alltid-grön |
| `h-015` beror på `h-030` | JSON-parse av `depends_on` | `grep -c 'h-030' specs/tasks.spec.json` plus sökning i `docs/loop/` efter påstådd h-030-leverans |
| `h-018`–`h-030` saknas som task | JSON-nyckellista | Sök `verify/bin/` och `controller/` efter artefakter som hör till dem — en byggd task utan spec vore lika illa |
| 76 rundor i fyra hypoteser | R-nummer i commit-titlar | Räkna rundrubriker i `docs/loop/drift.md` och jämför. Rundor utan commit syns bara där |
| 53 % av historien på kontrollplanet | H-nummer i commit-titlar | Räkna commits som **rör** `controller/`, `verify/`, `specs/` — titlar kan ljuga, sökvägar inte |
| Registret pekar på två webbfiler | läsning av `register.json` | Ta bort en av dem i en kopia och kör `controller/verify/cli` — fäller den? |

**Divergensprotokollet:** skiljer sig de två metoderna åt är **ingen av dem betrodd**
förrän skillnaden är förklarad. Skriv ned vilken som var fel och varför. Att välja den
som passar bäst är precis det fel som gav oss `NO-CREDIT` i 101 rader.

### Dokumentationskravet

Ominventeringen är inte gjord förrän den står i repot:

1. **Rad överst i `docs/loop/drift.md`** — datum, vilka påståenden som prövades, vilken
   metod, och utfallet per påstående: `BEKRÄFTAT`, `RÄTTAT` (med det rätta värdet) eller
   `OVERIFIERAT` (med skälet).
2. **Rad överst i `docs/05-beslutslogg.md`** om något rättades — vad som stod, vad som
   gäller, och vilken mekanism som avgjorde.
3. **Rätta källan.** Ett rättat värde som bara står i drift-loggen skapar en andra
   sanning. Rättas ett tal här ska `02-bevis.md`, `CLAUDE.md` och `AGENTS.md` följa med
   i samma commit där de bär talet.

**Datera resultatet.** En ominventering som inte är daterad måste göras om varje session
— och då har vi byggt en ny trampkvarn. Står det `BEKRÄFTAT 2026-09-20 mot commit
<sha>` behöver nästa session bara pröva det som ändrats sedan dess.

**Ominventeringen är en egen task, inte ett förarbete.** Den har ett avslutsvillkor:
varje rad i tabellen ovan bär ett verdikt med datum och metod. Då är den klar.

---

## §0b. FACIT: kernelfiler som ligger i webbträdets kataloger

**Verifierat 2026-09-16.** `scripts/` och `tests/` är **BLANDADE**, inte webb. Följande
filer är kärnans och får **aldrig** följa med när webbträdet flyttas:

| Fil | Varför kärnans |
|---|---|
| `scripts/nortropic-codex-autopilot.py` | 2878 rader, 95 kernelref / 1 webbref. `allowed_write`-mål för **h-031, h-032 och h-035** |
| `scripts/check-provanropare.mjs` | Läser `controller/loop/`, `controller/provenance/`, `verify/bin/h-032-exit` |
| `scripts/check-verifierarregistret.mjs` | Läser `controller/verify/register.json` |
| `scripts/kor-styrprov.mjs` | Läser kärnans register |
| `scripts/kor-vakter.mjs` | Läser kärnans register — går ODÖMBART utan det |
| `tests/controller/**` | Kärnans egna tester (10 filer) |
| `tests/scripts/nortropic-codex-autopilot/**` | Autopilotens tester |

```bash
for f in $(git ls-files scripts/ tests/); do
  k=$(grep -cE "(controller|verify/bin|specs/tasks)/" "$f" 2>/dev/null); k=${k:-0}
  w=$(grep -cE "(agents|skills|packs|backtests|workflows)/" "$f" 2>/dev/null); w=${w:-0}
  [ "$k" -gt 0 ] && [ "$w" -eq 0 ] && echo "KÄRNA $f"
done
```

> **Detta fel fanns i den första webb-bundlen.** Extraktionen inkluderade hela
> `scripts/`, och fem kernelfiler följde med — `nortropic-codex-autopilot.py` bland dem.
> Bundlen är omgjord 2026-09-16 (**337 commits, 311 filer**, mätt ur artefakten) med
> dessa uteslutna. Ett
> exempel på varför §0 kräver oberoende ominventering: felet upptäcktes av ägarens
> fråga *"är inte docs/loop/ webb?"*, inte av något prov.

### Rekommenderad uppdelning — BEDÖMNING, inte mätning

Kronologin (mätt) säger att vaktapparaten är webbens: första `check-*.mjs` 2026-07-31,
en vecka före kärnan; `kor-vakter.mjs` 2026-08-26; de två kernelläsande vakterna
2026-08-27. Kärnan har sin egen dom i `verify/bin/` + `controller/verify/cli` och
behöver ingen andra verifieringsapparat.

Härav följer en renare uppdelning än "dessa fem stannar":

| Fil | Hör hemma | Skäl |
|---|---|---|
| `scripts/nortropic-codex-autopilot.py` | **Kärnan**, och bör flyttas ur `scripts/` | Det är kärnans mekaniska exekverare; `scripts/` är bara där den landade |
| `kor-vakter.mjs`, `check-vaktankare.mjs` | **Webben** | Sviteinfrastruktur, född med webbapparaten |
| `check-provanropare.mjs`, `check-verifierarregistret.mjs` | **Kontrollerna** hör till kärnan, men inte som webbvakter | De prövar att kärnans frysta prov faktiskt anropas och att registret är koherent — riktiga kernelfrågor utan hemvist i kärnan i dag |
| `tests/controller/**`, `tests/scripts/**` | **Kärnan** | Kärnans egna tester |

### ⚠️ Bundlen är en korrekt extraktion — men inte ett körbart repo

**Mätt 2026-09-16 i den utbrutna kopian:**

```bash
node scripts/check-docs-coherence.mjs   # exit 2 — ODÖMBART
```

Den läser `docs/03-regelverk.md`, `docs/05-beslutslogg.md` och `docs/07-konstitution.md`,
som är **DELADE** och stannade i `nortropic-system`. `nortropic-web` blir alltså inte
grönt förrän styrlagrets ägarskap är avgjort per fil (`07-v1-acceptans.md` §4 och
`03-raddningsplan.md` steg 4).

**Bundlen är alltså rätt som extraktion och otillräcklig som repo.** Den som pushar den
och förväntar sig en grön svit blir förvånad. Det blockerar inget nu — men det är ett
beslut som måste fattas före, inte efter, att repot skapas.

**Untanglingsdraget, och det är ett:** `controller/verify/register.json` registrerar
webbfiler. Registrerar det kernelverifierare i stället upphör båda riktningarna av den
cirkulära kopplingen samtidigt. Det är vad steg 5 ("ge kärnan en egen grindsvit")
konkret betyder.

**Fortfarande blockerat av frysta ankare:** `h-017`, `h-035` och `h-037` läser registrets
**innehåll**, så en registerändring bryter dem. Draget kräver alltså en omfrysning — men
det är **en** omfrysning med **ett** syfte, inte en runda i taget.

---

## §0c. Det lokala maskintillståndet — inventeringens största blinda fläck

**Tillagd 2026-09-16 på ägarens direktiv:** *"mycket finns lokalt på datorn, så det behöver
inventeringen göra och inte lita blint på repon."*

**Hela §0 ovan inventerar ETT repo.** Premissen i `00-VAD-NORTROPIC-AR.md` gäller ett
*personligt organisatoriskt operativsystem* — och ett operativsystem bor inte i en
git-historik. Allt nedan är **belagt i repots egen dokumentation** som existerande
utanför repot, och **inget av det är verifierat** av någon session hittills.

### ⚠️ Motsägelsen som visar varför detta måste göras

Två dokument i repot säger emot varandra om systeminstallationen:

| Källa | Påstår |
|---|---|
| `docs/loop/byggplan-v3.md` rad 80 | *"Systeminstallationen arkiverad, **ej avvecklad**"* |
| `docs/05-beslutslogg.md` LOOP-PASS1 | *"**5Z-INSTALLATIONEN AVVECKLAD** — ersätter Pass 0-radens *Arkiverad, ej avvecklad*"*: sudoers-filen borttagen, sju systemkonton raderade, 122 binärer rivna |

Beslutsloggen är nyare och säger uttryckligen att den ersätter byggplanen. **Byggplan v3
är alltså inaktuell på denna punkt** — och byggplan v3 är samma dokument vars §3.1 bär
kärnans bindande §A-mängd. Ingen mekanism upptäckte driften.

**Vilket som gäller går inte att avgöra från ett repo.** `ls -la /usr/local/libexec/`
svarar på en sekund, på rätt maskin.

### FÖRST: var ligger arbetsklonen?

**Odokumenterat 2026-09-16.** Ägaren körde §0c:s kommandon mot `~/nortropic-system` och
fick `cd: no such file or directory`. Ingen fil i repot säger var kernelklonen bor på
fabriksmaskinen. Samma klass som FYND 14 — en förutsättning varje session behöver, som
bara finns i någons huvud.

```bash
# hitta varje klon vars origin är detta repo
for d in $(find ~ -maxdepth 5 -type d -name .git 2>/dev/null); do
  r=$(git -C "${d%/.git}" remote get-url origin 2>/dev/null)
  case "$r" in *nortropic-system*) echo "${d%/.git}";; esac
done
```

**SVARET 2026-09-16 — det är TVÅ rötter, inte en:**

| Rot | Worktrees | Skyddad av `managed-settings.json`? |
|---|---|---|
| `~/nortropic/nortropic-system` | `~/nortropic/worktrees/` (32) | **JA** — alla §A-sökvägar är prefixade hit |
| `~/nortropic-repos/nortropic-system` | `~/nortropic-repos/work/` (30) | **NEJ** — noll träffar på `nortropic-repos` i policyn OCH i hela repot |

Det är FYND 17 (`drift.md` 2026-09-16): §A-skyddet är sökvägsbundet, och en agent i den
andra roten kan skriva i `docs/07-konstitution.md` utan att OS-lagret hindrar det.
**Avgör vilken rot som är den aktuella innan något annat inventeras**, och kör den
installerade-mot-källkopia-diffen i samma svep.

Ursprungligen misstänkta platser enligt repots egen dokumentation: `~/.claude` (i drift **är** denna
katalog repo-roten), `~/nortropic/`, `~/Documents/`, `~/nortropic-backups-20260910/`.

**Hittas flera kloner är det i sig ett fynd** — då finns divergerande arbetskopior, och
`git -C <var och en> log --oneline origin/main..HEAD` visar vilken som bär arbete som
inte är pushat. Skriv in den rätta sökvägen i `docs/loop/drift.md` när den är fastställd.

### Ytorna som ska inventeras

| Yta | Vad dokumentationen påstår | Prov |
|---|---|---|
| `/usr/local/libexec/nortropic` | 122 binärer, `config` 0700, `rollback/` — **rivet enligt Pass 1** | `ls -la /usr/local/libexec/ \| grep -i nortropic` |
| `/etc/sudoers.d/nortropic-controller` | NOPASSWD på 14 binärer — **borttagen enligt Pass 1** | `sudo ls -la /etc/sudoers.d/` |
| Sju systemkonton | `nortropic-cr/cv/cw`, `nortropiccontroller`, `nortropicreviewer`, `nortropicverifier`, `nortropicworker` — **raderade enligt Pass 1** | `dscl . -list /Users \| grep -i nortropic` |
| `~/.claude` | I drift **är detta repo-roten**. Vad ligger där som inte är spårat? | `git -C ~/.claude status --short \| head -50` |
| `~/Workflow/` | `usage-log.md` (doctor #10 läser den), `nortropic transformation/` | `ls -la ~/Workflow/` |
| `~/Arkiv/*.tar.gz` | `5z-kedjan` 617 poster · `5z-rootsealed` 503 · `nortropic-systeminstallation` 386 · `post-workspace` 141 | `ls -la ~/Arkiv/ && tar tzf <arkiv> \| wc -l` |
| `/Library/Application Support/ClaudeCode/managed-settings.json` | `root:wheel` 644, sandboxpolicyn som skyddar §A på OS-nivå | `ls -la` + jämför med `config/managed-settings.json` |
| **Backup-repot** | Ägaren uppger att ett finns. **Inte identifierat.** Se nedan | `find ~ -name '*.git' -maxdepth 4 -type d` |
| Ospårade filer i klonen | Arbete som aldrig committats | `git status --short` + `git stash list` |
| Andra kloner | Fler arbetskopior med divergerande historik | `find ~ -name 'nortropic*' -maxdepth 3` |

### Backup-repot — LOKALISERAT 2026-09-16, och det bar tre fynd

`Nortropic/nortropic-backups` (repo-ID 1367371291), senast pushat 2026-09-13. Ägaren
pekade ut det; det syns inte i en filtrerad reposökning.

**Det är inte en kopia av `nortropic-system`.** 107 filer, 27 commits, platt struktur:
katalog, checksummor, inspektioner, återställningskvitton och verktyg. **Arkiven ligger
som Release assets och följer INTE med en vanlig `git clone`.** Runbooken är uttrycklig
om vad den bevarar: *"sources, specifications, frozen gates, recipes, manifests, Git
history/required objects, reviews, evidence and unpublished/dirty/untracked/generated
work. A source-code push alone does not back up that complete state."*

Frågan §0c ställde — *är den en delmängd av `origin/main`?* — har därmed fel form. Den är
inte en gren att jämföra, den är ett **arkiv av sådant som aldrig fanns i main**.
Inventeringens historikmätningar mot `origin/main` står alltså kvar oförändrade. Men tre
saker föll ut som inte stod någonstans:

#### FYND 14 — kärnan vet inte att dess backup finns

```bash
grep -rn "nortropic-backups\|1367371291" --include=*.md --include=*.json --include=*.mjs --include=*.py .
# 0 träffar utanför denna katalog
```

En ny session i `nortropic-system` kan inte upptäcka backupen, runbooken eller
kontinuitetslagret. **Åtgärdat 2026-09-16:** `CLAUDE.md` och `AGENTS.md` namnger nu repot
och dess ID.

#### FYND 15 — ett ägarmandat från 2026-09-09 saknas i beslutsloggen

I `continuity/20260912-backup-routine/BOOTSTRAP-WORKING-METHOD.md` står, ordagrant:

> *"Du har mitt fulla godkännande att göra det du anser fram till supervisor resume,
> arbeta mot slutmålet. Om du behöver uppdatera någo dokumentations för att alltid
> förstå detta, gör det gärna."* — ägaren 2026-09-09

```bash
grep -c "2026-09-09" docs/05-beslutslogg.md      # 0
grep -rliE "fullt godkännande|fulla godkännande" --include=*.md .   # inga träffar
```

**Auktoritetskedjan har alltså en lucka i själva trust-kerneln.** En agent som läser
repot ser bara delegationen från 2026-08-13 och har därmed **mindre** befogenhet än
ägaren faktiskt gett. Det är en direkt orsak till att godkännanden söks som redan
finns.

> ⚠️ **Mandatet är INTE infört av denna session, och får inte införas av en agent.**
> Att bredda sin egen befogenhet ur en text i ett annat repo är precis det
> `SELF_CERTIFICATION_AS_PROOF=NO` förbjuder. Det är **ägarens hand** att bekräfta
> raden in i `docs/05-beslutslogg.md` — ett av de fyra äkta mänskliga stoppen
> (`05-arbetsordning.md` §1, punkt 1: uttryckligt människoägd auktoritet). Tills det är
> gjort gäller 2026-08-13 års delegation, och fyndet står som `OVERIFIERAT`.

#### FYND 16 — en fjärde statusplats, i ett annat repo

`BOOTSTRAP-DISK-CLEANUP-JOURNAL.md` bär *"senaste faktiska resultat"*, och
`CLAUDE-CHECKPOINT-20260910-INVARIANT-REQUIRED.md` bär operativt sessionsminne med
hänvisning till en `CODEX-TO-CLAUDE`-handoff. Det är teknisk status — utanför
`drift.md` och beslutsloggen.

**Och luckan går att mäta exakt:**

| Fönster 2026-09-09 → 09-13 | Commits | Drift-rader |
|---|---|---|
| `nortropic-system` | **0** | **0** |
| `nortropic-backups` | **27** | — |

Fem dagars arbete lämnar alltså **inget spår** i kärnans lägesdokument. Regeln *"läget
står i `drift.md`, ingen annan fil bär teknisk status"* är **falsk för den veckan**.

Detta är tredje instansen av projektets grundfel: kunskap hamnar i ett lager som nästa
session inte läser. Först ingångsdokumenten (fynd 2), sedan räddningsunderlaget som
tarboll, nu kontinuitetslagret i ett annat repo.

**Att lösa det är inte att flytta filerna.** Backupens dokument hör hemma där de är —
runbooken är operativ backuprutin, inte kernelstatus. Det som fattas är en **rad i
`drift.md` per backupsession** som säger att arbete skedde och var kvittot ligger.
En mening, samma dag. Det är hela åtgärden.

### Vad §0c fortfarande INTE har prövat

Backupen bevarar enligt runbooken *"unpublished/dirty/untracked work"* — alltså
kernelarbete som aldrig nått main. **Vad den faktiskt innehåller är inte inventerat**:
Release-assets hämtas inte av en klon, och `catalogue.json` pekar på en lokal rot
(`/Users/…/nortropic-backups-20260910/full-20260910T103342Z`) som bara finns på Macen.

Detta är en egen post i §0c:s tabell, inte en avklarad rad:

```bash
# på Macen, read-only
python3 -c "import json;d=json.load(open('catalogue.json'));print(len(d['items']));
[print(i['status'], i['path']) for i in d['items']]"
ls -la /Users/*/nortropic-backups-20260910/
```

Fråga att besvara: **finns det kernelarbete i backupen som main saknar, och är något av
det en färdig kandidat?** Är svaret ja ändras inventeringens restlista.

### Verdikt per yta — samma fyrdelning som §0

`FINNS` (med mätt innehåll) · `RIVEN` (bekräftat borta) · `DIVERGERAR` (finns, men
innehållet motsäger repot) · `OVERIFIERAT` (kunde inte prövas). **`OVERIFIERAT` blir
aldrig grönt** — samma algebra som `controller/verify/cli`.

### Vad detta INTE är

**Det är ingen städning.** Rör ingenting, avinstallera inget, radera inga arkiv. Denna
inventering är **read-only**; visar den att något lever som inte borde, blir det en egen
task med egen grind. Pass 1:s rivning krävde sudo och bokfördes som ett namngivet
engångsundantag från loop-regel 5 — den tröskeln gäller fortfarande.

### Varför den måste köras på Macen — och vad det betyder för §0

`10-forsta-arbetspaketet-h014.md` §2 mäter att **18 av 24 kernelgatar faller i en
Linux-container** på `undefined symbol: sysctl`. Kärnan är Darwin-bunden, och
`docs/loop/byggplan-v3.md` §4 säger det rakt ut: *"Macen är fabriken. Molnsessioner är
aldrig verkstad."*

**Det gäller hela §0, inte bara §0c.** En ominventering körd i molnet mäter
operativsystemet. Kör den på Macen.

---

## Läget i en bild

```
BOOTSTRAP-KEDJAN — pågår, 4 av 8 kvar
  h-035 ✓ → h-037 ✓ → h-034 ✓ → h-036 ✓ → h-039 ⟳ → h-038 ○ → h-032 ○ → h-031 ○
                                            (R33)
        h-033 ✓ (sidogren ur h-034)

SUBSTITUTIONSKEDJAN — 0 av 4 finns som task
  h-027 ○ → h-028 ○ → h-029 ○ → h-030 ○
  AgentProvider   G20-split    TaskContract   thin task supervisor

KÄRNLOOPEN — 15 av 17 har gate
  h-001…h-013 ✓   h-016 ✓   h-017 ✓
  h-014 ⊘ gate saknas (byggbar NU)
  h-015 ⊘ gate saknas OCH blockerad av h-030

FÖRMÅGESKIVORNA — 0 av 9 finns som task
  h-018 … h-026   (roadmapens S4, S5, S7–S13)

PROGRAMDOMEN
  verify/bin/autonomous-loop-exit ⊘ saknas

✓ klar   ⟳ pågår   ○ ej påbörjad   ⊘ saknas
```

---

## 1. Bootstrap-kedjan — det som pågår

Beroendeordningen ur specen, inte ur prosan:

| Task | Gate | Beror på | Vad den är |
|---|---|---|---|
| `h-035` | ✓ | h-017 | Mekaniskt separerad owner production authority |
| `h-037` | ✓ | h-035 | Rebind av verify-suite-registrets digest |
| `h-034` | ✓ | h-037 | Native finite verifier kernel |
| `h-036` | ✓ | h-034 | Pre-sandbox owner för monotona Seatbelt-barn |
| `h-033` | ✓ | h-034 | Authenticated runner provenance (sidogren) |
| **`h-039`** | ✓ | h-036 | **OS-exclusive cleanup mediator — runda 33, pågår** |
| `h-038` | ✓ | h-035, h-036 | Managed attempt root confinement |
| `h-032` | ✓ | h-036 | Exact Codex provider identity |
| `h-031` | ✓ | h-032 | Codex-autopiloten, explicit modellrouting |

**Alla nio har frysta gates.** Arbetet som återstår är att få kandidaterna gröna mot dem
— inte att bygga gates.

`docs/loop/drift.md`: *"No supervisor resume is authorized before the entire chain is
green."* Kedjan grindar alltså allt nedströms.

---

## 2. Substitutionskedjan — den odokumenterade blockeringen

**`h-015` (supervisor resume) beror på `h-030`. `h-030` finns inte i specen.**

```bash
python3 -c "
import json; d=json.load(open('specs/tasks.spec.json'))
print([t['depends_on'] for t in d['tasks'] if t['id']=='h-015'])
print('h-030 i specen:', 'h-030' in [t['id'] for t in d['tasks']])"
# ['h-010','h-013','h-016','h-004','h-030']   /   h-030 i specen: False
```

Kedjan står i `docs/loop/harness-substitution-contract-v1.md` rad 108–111:

| Task | Vad | I specen |
|---|---|---|
| `h-027` | AgentProvider interface + Codex adapter | **NEJ** |
| `h-028` | Split provider launch from G20 containment | **NEJ** |
| `h-029` | Structured provider result + canonical TaskContract projection | **NEJ** |
| `h-030` | **Thin task supervisor + bounded cross-attempt retries** | **NEJ** |

v4-amendmentet anger sekvensen: `SUB-1/h-027 → SUB-2/h-028 → SUB-3/h-029 → SUB-4/h-030
→ S2/S4–S13 → L`.

**Ingen av dem har någonsin skrivits som task.** Arbetet gick i stället till h-031…h-039,
som är en annan kedja. Det betyder att *huvudvägen aldrig påbörjats*, och att supervisor
resume är blockerad av en task som inte existerar.

> **Detta är inventeringens viktigaste fynd.** Det förklarar varför kedjan inte tar slut:
> den kedja som arbetas på leder inte fram till supervisor resume. Den som gör det har
> noll rader.

---

## 3. Kärnloopen — två luckor

| Task | Slice | Beror på | Gate | Status |
|---|---|---|---|---|
| `h-001`–`h-013` | 1–11 | kedjade | ✓ | klara |
| **`h-014`** | 12 | h-013 **OVERIFIERAT** (se `10-...h014.md` §1) | **SAKNAS** | *"Notisen — Slack från controllern."* Byggbar så snart `h-013` prövats grön **på Macen** |
| **`h-015`** | 13 | h-010 ✓, h-013 ✓, h-016 ✓, h-004 ✓, **h-030 ✗** | **SAKNAS** | *"Återtaget — återstart efter avbrott."* **Detta ÄR supervisor resume** |
| `h-016` | 14 | h-011, h-012, h-013 | ✓ | klar |
| `h-017` | 15 | h-002, h-016 | ✓ | klar |

`h-015`:s exit-kriterium, ordagrant ur specen:

> Efter en avbruten körning: attesterad task väljs inte om och ger inga nya event; task
> som föll blir valbar igen och dess tidigare fingerprints finns kvar; öppen brytare är
> fortfarande öppen och släpper först när dess villkor släpper. Lease från en död körning
> återtas efter TTL och aldrig före.

Det är exakt den kontinuitet premissen kräver (`Avsikt → … → erfarenhet` överlever
avbrott). **`h-015` är den mekaniska kärnan i `KERNEL_COMPLETE`.**

---

## 4. Förmågeskivorna — roadmapens S4, S5, S7–S13

`h-018` till `h-026` finns **inte** i specen. De existerar bara som rader i
`docs/loop/codex-autopilot-v3-full-roadmap.md`:

```
S4  structured failure feedback      S9  trust transition
S5  operations/lifecycle events      S10 Markdown intake + Task IR
S7  verified auto-promotion          S11 verifier author + challenger
S8  merge resolution + full reverify  S12 evaluator
                                     S13 read/typed-command interface
```

Dessa är förmågor ovanpå loopen, inte förutsättningar för den. `KERNEL_COMPLETE` enligt
`00-VAD-NORTROPIC-AR.md` kräver dem **inte** — den kräver att loopen kör obevakat och
återupptar. Flera av dem (S10 Task IR, S11 verifier author, S12 evaluator) hör dessutom
snarare till Projekt- och innovationskontoret än till kärnan.

**Rekommendation:** låt dem stå som roadmap tills `KERNEL_COMPLETE` är nådd. Att
specificera nio skivor innan loopen bevisats köra är att bygga ovanpå obevisad grund.

---

## 4b. ⚠️ OMVÄRDERAT 2026-09-16 — två poster är redan gjorda

Fynd 20 (`docs/loop/drift.md` 2026-09-16) flyttar två poster ur restlistan. Grenen
`nortropic/platform-integration-20260910` (opushad, 55 commits före main) bär dem klara:

| Post | Var | Bevis |
|---|---|---|
| Separationen (plan steg 4) | gjord 2026-09-10 | 0 webbfiler; `platform-separation-final-exit` **exit 0** |
| Kärnans egen grindsvit + registerbytet (plan steg 5) | gjord 2026-09-10 | registret bär EN post, kärnans invariantgrind; `invariant-required-exit` **exit 0** |

**Restlistan nedan räknar `origin/main`**, där ingetdera är landat ännu. Det är korrekt
som beskrivning av main — men den som planerar arbete ska veta att posterna inte ska
byggas, bara granskas och landas.

**Ny post i stället:** lös FYND 21 på den grenen. Tre grindar är röda på föråldrade
baspinnar, inte på defekt arbete, och en omfrysning mot nuvarande bas löser det bara tills
nästa `verify/bin`-ändring. Det kräver doktrinregel iv först.

---

## 5. Kvarvarande arbete, sammanräknat

| Post | Antal | Läge |
|---|---|---|
| Bootstrap-kedjan klar | 4 | h-039 (R33) → h-038 → h-032 → h-031. Gates finns |
| Substitutionskedjan | 4 | h-027…h-030. **Inte specade** |
| `h-014` notis | 1 | Gate saknas. Byggbar nu |
| `h-015` återtag / supervisor resume | 1 | Gate saknas. Blockerad av h-030 |
| Programdomen | 1 | `autonomous-loop-exit` saknas |
| **Till `KERNEL_COMPLETE`** | **11** | Förmågeskivorna h-018–h-026 ingår inte |

---

## 6. Ordningen som faktiskt tar er i mål

```
1. verify/bin/autonomous-loop-exit          frys RED mot KERNEL_COMPLETE
2. h-039 → h-038 → h-032 → h-031            avsluta bootstrap-kedjan
3. h-027 → h-028 → h-029 → h-030            specificera och bygg substitutionskedjan
4. h-014                                    gate + bygg (oberoende, kan gå parallellt)
5. h-015                                    gate + bygg — supervisor resume
6. L: kör loopen obevakat mot egen backlog   KERNEL_COMPLETE
```

**Varför programdomen först:** den fryses RED innan arbetet den mäter. Byggs den efteråt
kan den skrivas så att det redan gjorda råkar passera — och då mäter den ingenting. Det
är samma princip som §A2 ger för eval-rubriken.

**Varför h-027–h-030 inte får hoppas över:** `h-015` beror mekaniskt på `h-030`. Utan den
kan supervisor resume inte ens få en gate som håller, och kedjan h-031…h-039 tar er
aldrig dit oavsett hur många rundor den kör.

**h-014 är den enda posten som inte väntar på något annat i planen** — men *"alla
beroenden gröna"* är **inte** belagt. Det påståendet var härlett ur att `h-013`:s
gate-FIL finns, inte ur att den passerar. Kör `bash verify/bin/h-013-exit` **på Macen**
först; utfallet i molnet är `OVERIFIERAT`, inte grönt. Se
`10-forsta-arbetspaketet-h014.md` §1.
