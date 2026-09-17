# PR-tillägg till granskarrollen

Tillägg till `SKILL.md` för granskning av en **pull request** i det här repot. Skillen
säger hur man granskar en kandidat mot ett fryst kontrakt; det här säger vad som är
specifikt för en PR-diff, och vilka felklasser som faktiskt återkommer här.

**Filen finns för att det bara ska finnas EN text.** Den läses av båda vägarna:

- **För hand**, av den session som driver kedjan — i dag den enda vägen, se `AGENTS.md`.
- **Av `.github/workflows/granska-pr.yml`**, om och när granskningsjobbet slås på.

Första versionen skrev av felklasserna direkt i workflowens `prompt:`. Två definitioner
av "granskning" i samma repo driver isär, och den som läses av en maskin vinner tyst över
den som läses av en människa — samma kategorifel som Doctor #12(e) varnar för mellan
lagren. Därför ligger de här, en gång.

---

## Innan du börjar

Läs `SKILL.md` först och följ dess hårda gräns: `PRODUCTION_FILES_MODIFIED=NO`,
`PUSH=NO`, `MERGE=NO`. Sedan `CLAUDE.md`, `AGENTS.md` och `docs/loop/regler.md` — de är
bindande, du refererar dem, du återger dem inte.

**Granska hela grenen mot basen, inte bara senaste commiten.** Spetsen flyttar medan
granskningen pågår; det har redan hänt en gång.

**Verifiera varje misstanke mekaniskt innan du rapporterar den.** Kör proven, kör
mutationer, läs koden. Ett fynd som inte är belagt i diffen är brus — hellre tre skarpa
än tolv möjliga.

Skriv på svenska. Var kort.

---

## De nio felklasserna, i prioritetsordning

**1. Att pröva vad utdata SÄGER i stället för vad mekanismen GÖR.**
Ett prov som jämför ett namn, en sträng eller ett påstående i stället för ett utfall.
**Elva av repots tretton kända falska påståenden kom av den metoden**, och den har
återkommit två gånger på två dygn (`smuts_sakrad`, sedan `K6`) — båda gångerna utan att
författaren såg det själv.

**2. En mekanism som ser ut att finnas.**
Ny fil som `.gitignore`-vitlistan tyst svalt (rad 3 är `/*` — varje ny katalog behöver
ett explicit `!`), kod ingen anropar, en hook eller workflow som aldrig kan köra.
Fråga alltid: *skulle detta faktiskt köras?* Pröva med `git ls-files` och
`git check-ignore`, inte med ögat.

**3. Ett prov som inte kan fälla något.**
Lägger diffen till eller ändrar ett prov: **mutera det prövade och kör provet.** Fäller
det inte, är det dekoration. Pröva särskilt två saker:
- Fäller provet den **senast lagade buggen** i filen? Gör det inte det, skyddar det inte
  mot en regress — det beskriver bara dagens beteende.
- Är något fall en **delmängd av ett annat**? Ett fall som per konstruktion aldrig kan
  falla när ett tidigare fall passerar är dekoration, hur rätt det än låter.

**4. En miljö bokförd som ett fel.**
Verdiktalgebran är `0=PASS · 1=FAIL · 2=ODÖMBART`. Fel maskin, saknad nyckel eller saknat
beroende är `ODÖMBART` och blir aldrig grönt av att något annat är grönt. Omvänt: ett
`ODÖMBART` som tyst blir grönt är den falska framgång hela repot handlar om. Leta åt
**båda** hållen.

**5. Regel 22 — teknisk ändring och dess dokumentation i samma commit.**
Hemvisten för kernelarbete är `docs/loop/drift.md` och `docs/05-beslutslogg.md`; rör
ändringen webbfabrikslagret gäller `docs/00-borja-har.md`. Saknas raden, säg det.

**6. En §A-yta ändrad.**
`docs/07-konstitution.md`, `docs/03-regelverk.md` och `CLAUDE.md` ändras bara av en
människa. Rör diffen dem är det ett fynd, oavsett hur rimlig ändringen ser ut.

**7. En hemlighet i trädet.**
Ägarens regel: konfigurationen bär **sökvägen** till en hemlighet, aldrig värdet — en
config visas i rapporter, felmeddelanden och beslutsloggsrader. Detsamma gäller en secret
interpolerad in i ett skalkommando.

**8. Ett påstående om läget i fel fil.**
Teknisk status hör hemma i `docs/loop/drift.md` och `docs/05-beslutslogg.md`. Står den
någon annanstans i repot är det drift — rätta den eller märk den `OVERIFIERAT`.

**9. Ett tal som inte stämmer.**
Pröva **varje siffra och varje tidsangivelse** i commit-texten, drift-posten,
beslutsloggsraden, filhuvudena **och PR-texten** mot repot. **Nio av repots tretton kända
fel låg i UNDERLAGET, inte i koden.** PR-texten är ingen frizon; den läses av människor
och blir stående.

---

## Och en fråga till varje rättelse

Granskar du en PR som åtgärdar tidigare fynd: **pröva om åtgärden håller, inte om den
finns.** En rättelse som inte rättar är värre än det ursprungliga felet, eftersom den ser
ut som en lösning. Det har redan hänt här en gång.

---

## Domen

Avsluta med exakt en rad:

```
DOM: TILLSTYRKS
```

eller

```
DOM: FYND
```

— och vid `FYND` en mening om vad som måste ändras.

**Domen är rådgivande.** En människa eller en annan agent fattar beslutet; `SKILL.md`
säger det rakt ut: *"Reviewer approval is never root of trust."*
