#!/usr/bin/env python3.12
"""tests/controller/envelope/fall.py — kontraktsfall för controller/envelope/cli.

    python3.12 tests/controller/envelope/fall.py    exit 0 = alla fall håller

Det här är INTE exitgrinden. `verify/bin/h-008-exit` är grinden och ägs av
människan; den här filen täcker vad grinden inte når och får aldrig åberopas
som bevis för att skiva 6b är klar.

Grinden kontrollerar tre av kuvertets nio fält mot specen (spec_sha256,
allowed_write, denied_write). De sex övriga prövas bara för NÄRVARO. En
lögnstub som läste specen för just de tre och satte base_sha till fyrtio
nollor, run_id till "run", title och description till tomma strängar och
candidate_requirements till "" fick 9 PASS 1 FAIL — och den enda fällningen
var K8, som ingen korrekt implementation heller kan klara (se raden om
K5/K8 i docs/05-beslutslogg.md).

Avsnittet ARGUMENTEN NÅR KUVERTET nedan är därför det grinden bevisligen
inte kan skilja: används argumenten, eller fylls fälten med konstanter?
"""

import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

ROT = Path(__file__).resolve().parents[3]
CLI = ROT / "controller/envelope/cli"
SPEC = ROT / "specs/tasks.spec.json"
ANROP = 1

# §12:s nio fält. Inget mer, inget mindre.
FALT = {"run_id", "task_id", "base_sha", "spec_sha256", "title", "description",
        "allowed_write", "denied_write", "candidate_requirements"}

# Fält ur specens task-post som ALDRIG får följa med: controllerns schemaläggning.
#
# TVÅ NYCKLAR STRÖKS 2026-08-27, och båda av MÄTNING — inte av omdöme. Listan hade fem
# poster och två av dem prövade något som inte går att skydda:
#
#   `exit_test`  — SAMTLIGA 23 tasks bär exakt `verify/bin/<task_id>-exit`. Ingen avviker.
#                  `task_id` är ett av v4.1 §12:s NIO OBLIGATORISKA kuvertfält och måste
#                  följa med — workern kan inte utföra en task den inte vet vilken det är.
#                  Värdet är alltså HÄRLEDBART ur något kuvertet är tvunget att bära, och
#                  att stryka sökvägen ur kriterietexten hindrar ingen som kan skriva
#                  `verify/bin/${task_id}-exit`. **Ett skydd mot något som går att räkna ut
#                  är ingen spärr, det är en kuliss** — och kulissen fällde tre tasks
#                  (h-031/h-032/h-035) vars kriterier nämner sin egen grind i löptext.
#
#   `exit_criterion` — komponentens EGET kontrakt säger ordagrant att
#                  `candidate_requirements.utfall` *"bär `exit_criterion` styckat i
#                  enskilda krav: samma text"*. Kriteriet SKA alltså följa med; det är
#                  hela poängen med fältet. Kontrollen passerade för 22 tasks bara därför
#                  att styckningen fragmenterade strängen — **en slump i segmenteringen,
#                  inte ett skydd.** För h-010, vars kriterium är 534 tecken i EN mening,
#                  gav samma regel FAIL. Regeln motsade komponentens kontrakt hela tiden.
#
# KVAR STÅR DET SOM FAKTISKT GÅR ATT HÅLLA HEMLIGT: controllerns schemaläggning. Och den
# verkliga reward-hacking-ytan för grinden — dess INNEHÅLL, inte dess sökväg — prövas
# separat nedan. Innehållet går att dölja; namnet gör det inte.
FORBJUDNA_NYCKLAR = {"depends_on", "slice", "docs_impact"}


def git(*argv: str) -> str:
    return subprocess.run(["git", "-C", str(ROT), *argv],
                          capture_output=True, text=True).stdout.strip()


def kor(*argv: str) -> tuple[int, str, str]:
    r = subprocess.run([str(CLI), *argv], capture_output=True, text=True, cwd=ROT, timeout=60)
    return r.returncode, r.stdout, r.stderr.strip()


def main() -> int:
    if not os.access(CLI, os.X_OK):
        print(f"FAIL  {CLI} saknas eller är inte körbar")
        return 1

    spec = json.loads(SPEC.read_text(encoding="utf-8"))
    tasks = {t["id"]: t for t in spec["tasks"]}
    base = git("rev-parse", "HEAD")
    base2 = git("rev-parse", "HEAD~1")
    ratt = fel = 0

    def doma(namn: str, villkor: bool, sett: str, krav: str) -> None:
        nonlocal ratt, fel
        if villkor:
            ratt += 1
        else:
            fel += 1
            print(f"FAIL  {namn} — krav: {krav} · sett: {sett}")

    def kuvert(run: str, task: str, sha: str) -> dict | None:
        kod, ut, err = kor("build", run, task, sha)
        doma(f"{task}/bygger", kod == 0, f"exit={kod} [{ut[:60]}]", "exit=0")
        doma(f"{task}/stderr", err == "", f"[{err[:60]}]", "tom stderr")
        try:
            return json.loads(ut)
        except ValueError:
            doma(f"{task}/json", False, "ogiltig JSON", "kuvertet ska vara JSON")
            return None

    # --- ARGUMENTEN NÅR KUVERTET: det grinden inte kan skilja ---
    for task_id in tasks:
        k = kuvert("run-alfa", task_id, base)
        if k is None:
            continue
        doma(f"{task_id}/falt", set(k) == FALT, str(sorted(set(k) ^ FALT)),
             "exakt §12:s nio fält, inga extra")
        doma(f"{task_id}/run_id", k["run_id"] == "run-alfa", repr(k["run_id"]),
             "run_id ur argumentet — grinden jämför det aldrig")
        doma(f"{task_id}/task_id", k["task_id"] == task_id, repr(k["task_id"]),
             "task_id ur argumentet")
        doma(f"{task_id}/base_sha", k["base_sha"] == base, repr(k["base_sha"]),
             f"base_sha ur argumentet ({base[:8]}) — grinden jämför det aldrig")
        doma(f"{task_id}/title", k["title"] == tasks[task_id]["title"], repr(k["title"][:40]),
             "title ur specen")
        doma(f"{task_id}/description", k["description"] == tasks[task_id]["summary"],
             repr(k["description"][:40]), "description = specens summary (§12-namnet)")

        # candidate_requirements: grinden prövar bara att nyckeln finns.
        cr = k["candidate_requirements"]
        doma(f"{task_id}/cr-form", isinstance(cr, dict) and {"utfall", "omfang"} <= set(cr),
             str(type(cr).__name__), "objekt med utfall och omfang")
        if isinstance(cr, dict) and "utfall" in cr:
            u = cr["utfall"]
            doma(f"{task_id}/cr-utfall", isinstance(u, list) and len(u) > 0 and all(u),
                 repr(u)[:60], "icke-tom lista av icke-tomma krav")
            # Härledningen får aldrig tappa text ur kriteriet.
            hopfogat = " ".join(u).replace(" ", "")
            doma(f"{task_id}/cr-fulltext",
                 hopfogat == tasks[task_id]["exit_criterion"].replace(" ", ""),
                 f"{len(hopfogat)} tecken", "styckningen tappar inte ett tecken")
        if isinstance(cr, dict) and isinstance(cr.get("omfang"), dict):
            o = cr["omfang"]
            doma(f"{task_id}/cr-docs",
                 o.get("docs_uppdatering_i_samma_commit") == tasks[task_id]["docs_impact"],
                 repr(o.get("docs_uppdatering_i_samma_commit")), "docs_impact ur specen")
            doma(f"{task_id}/cr-budget",
                 o.get("max_andrade_filer") == spec["defaults"]["max_changed_files"]
                 and o.get("max_tillagda_rader") == spec["defaults"]["max_added_lines"],
                 f"{o.get('max_andrade_filer')}/{o.get('max_tillagda_rader')}",
                 "budgetarna ur defaults")

        # Certifieringssteget får aldrig läcka (v4.1 §12). Grinden greppar fyra
        # strängar; här prövas att inget VÄRDE ur de förbjudna spec-fälten finns.
        # spec_sha256 utesluts: 64 slumpmässiga hex-tecken innehåller förr eller senare
        # vilken kort sträng som helst. Mätt 2026-08-08: slice-värdet "6b" gav falskt
        # FAIL när h-009 lades till specen och hashen ändrades till en som bär "6b".
        utan_hash = {n: v for n, v in k.items() if n != "spec_sha256"}
        text = json.dumps(utan_hash, ensure_ascii=False)
        for nyckel in FORBJUDNA_NYCKLAR:
            varde = tasks[task_id].get(nyckel)
            if not isinstance(varde, str) or not varde:
                continue
            if len(varde) < 8:
                # För kort för att skilja läckage från slumpkollision — odömbart,
                # rapporteras hellre än tystas. Samma disciplin som exit 2 = ODÖMBART.
                print(f"SKIP  {task_id}/lackage-{nyckel} — värdet '{varde}' är för kort för att döma")
                continue
            doma(f"{task_id}/lackage-{nyckel}", varde not in text, f"{nyckel} i kuvertet",
                 f"{nyckel} får aldrig följa med")

        # GRINDENS INNEHÅLL — den yta som FAKTISKT går att dölja.
        # Sökvägen till grinden är härledbar ur `task_id` och därför ingen hemlighet (se
        # FORBJUDNA_NYCKLAR ovan). Vad grinden PRÖVAR är däremot inte härledbart, och det
        # är den kunskap som gör reward hacking möjlig: en kandidat som vet exakt vilka
        # strängar grinden greppar efter kan producera dem utan att lösa uppgiften.
        # Kontrollen ersätter den strukna sökvägskontrollen med den fråga den borde ha
        # ställt hela tiden.
        grind = ROT / f"verify/bin/{task_id}-exit"
        if not grind.exists():
            print(f"SKIP  {task_id}/grindinnehall — {grind.name} finns inte; ingen grind att läcka")
        else:
            # Distinktiva rader: långa nog att inte kollidera av slump, och inte bara
            # skiljetecken eller indrag. Hittas inga är ANKARET obevisat och kontrollen
            # får inte läsas som ren — samma disciplin som en tom kravmängd.
            rader = [r.strip() for r in grind.read_text(encoding="utf-8", errors="replace").splitlines()]
            distinkta = [r for r in rader if len(r) >= 40 and any(c.isalpha() for c in r)]
            if len(distinkta) < 5:
                print(f"SKIP  {task_id}/grindinnehall — bara {len(distinkta)} distinktiva rader; ankaret obevisat")
            else:
                # DELAD DATA ÄR INTE LÄCKAGE. Grinden och kuvertet läser BÅDA specens
                # task-post, så rader som `"docs/loop/remaining-bootstrap-delegation-v1.md"],`
                # står i grindens källa utan att komma DÄRIFRÅN. Två sådana gav falskt FAIL
                # på h-035 i första formen. En rad räknas därför bara som läckt om dess
                # innehåll INTE redan finns i taskens egen specpost — då är grinden den
                # enda möjliga källan.
                specpost = json.dumps(tasks[task_id], ensure_ascii=False)
                def ur_specen(rad):
                    kärna = rad.strip(' ,[]{}"')
                    return bool(kärna) and kärna in specpost
                lackta = [r for r in distinkta if r in text and not ur_specen(r)]
                doma(f"{task_id}/grindinnehall", not lackta,
                     f"{len(lackta)} rad(er) ur grinden i kuvertet: {lackta[:1]}",
                     "ingen rad ur grindens källa får följa med — sökvägen är härledbar, innehållet är det inte")

    # run_id ska faktiskt användas — två olika run_id ger olika kuvert.
    a = kor("build", "run-alfa", "h-001", base)[1]
    b = kor("build", "run-beta", "h-001", base)[1]
    doma("run_id-anvands", a != b, "identiska kuvert", "olika run_id ger olika kuvert")

    # base-sha ska faktiskt användas — två olika base ger olika kuvert.
    c = kor("build", "run-alfa", "h-001", base2)[1]
    doma("base-anvands", a != c, "identiska kuvert", "olika base-sha ger olika kuvert")

    # Determinism över processgränsen, som grindens K7 men mot samma sha-fil.
    doma("determinism", a == kor("build", "run-alfa", "h-001", base)[1],
         "olika utfall", "byte-identiskt vid omkörning")

    # spec_sha256 mot filens verkliga hash, räknad här och inte av komponenten.
    k = json.loads(a)
    doma("spec_sha256", k["spec_sha256"] == hashlib.sha256(SPEC.read_bytes()).hexdigest(),
         k["spec_sha256"][:16], "sha256 av specfilens byte")

    # --- ANROPSFEL: klassade, aldrig stackspår ---
    tagg = git("rev-parse", "100d-baseline-20260730")
    fall = [("okant-task", ("build", "run-alfa", "h-999", base)),
            ("ogiltigt-sha", ("build", "run-alfa", "h-001", "0" * 40)),
            ("tom-run-id", ("build", "", "h-001", base)),
            ("utan-argument", ("build",)),
            # SEX argument, inte fem. Fallet hette "for-manga" och prövade FEM tills
            # `917cb6d2` ([LOOP] ÄGARHAND) vidgade ariteten medvetet: `build <run-id>
            # <task-id> <base-sha> [spec-fil]` — systrarna får målet som indata. Fem
            # argument är sedan dess ett GILTIGT anrop, och fallet prövade i praktiken
            # hur en oläsbar spec-fil klassas (INTERNT=8), inte arity. Ett prov som
            # bytt fråga utan att byta namn är värre än ett som fallit.
            ("for-manga", ("build", "a", "h-001", base, "extra", "extra2")),
            ("okant-kommando", ("blaha", "a", "h-001", base))]
    if tagg:
        # Ett taggobjekt får aldrig peelas till en annan commit och tyst bli bas.
        fall.append(("tagg-som-base", ("build", "run-alfa", "h-001", tagg)))
    for namn, argv in fall:
        kod, ut, err = kor(*argv)
        doma(namn, kod == ANROP, f"exit={kod}", f"exit={ANROP}")
        doma(f"{namn}/orsak", ut.strip() != "", "tom stdout", "orsaken på stdout")
        doma(f"{namn}/stderr", err == "", f"[{err[:50]}]", "tom stderr")
        doma(f"{namn}/traceback", "traceback" not in (ut + err).lower(), "traceback",
             "aldrig traceback")

    print(f"\n{ratt} rätt, {fel} fel")
    return 1 if fel else 0


if __name__ == "__main__":
    sys.exit(main())
