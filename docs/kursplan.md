# Kursplan — vad systemet laddar, och varför

Senast verifierad mot systemet: 2026-08-25 · v1 (denna commit)
Verifieringsomfång: nyskapad i S1-min+K4-batchen; inga tidigare påståenden att verifiera.

Kursplanen beskriver vilken KOMPETENS som laddas för ett jobb. Den är HANDSKRIVEN i sin
första version och VANLIG DOKUMENTATION: ingen mekanisk grind läser den, den fäller
ingenting och den är inte §A-skyddad.

Strukturen är **roll × fast yrkeskontext × paketvillkorade moduler**:

- **Roll** — rollens/agentens kontrakt (de sju rollerna ligger fast; en ny domän föder
  aldrig en ny agent).
- **Fast yrkeskontext** — det som ALLTID laddas för rollen oavsett kund, för att det är
  yrkeskunnandet självt.
- **Paketvillkorade moduler** — det som laddas ENDAST när jobbet hör till paketet
  (i dag `lokal-se`).

## Vakten som håller kursplanen ärlig

**Kursplan-kostnadsvakten** (`agents/nortropic-steward.md`, stående regel 6):
**citeras en modul noll gånger i två på varandra följande projektloggar föreslås
nedgradering till on-demand.** Det är en citeringsräkning, inte en budgetbedömning.

**Ingen permanent kontexttillväxt utan evidens.** En modul som ingen citerar kostar
varje körning och betalar ingenting tillbaka — och tystnaden i loggarna ÄR beviset.
GC-svepets punkt 3 (oanvänd kursplan) städar samma yta varje retro, och borttagning
konkurrerar med tillägg om utrymmet.

## Kursplanen

| Roll | Fast yrkeskontext | Paketvillkorade moduler (`lokal-se`) | Citerad senast |
|---|---|---|---|
| — | — | — | — |

**Tabellen är avsiktligt tom vid födseln.** Denna batch skapar formatet och vakten,
inte innehållet: raderna skrivs för hand när de första riktiga projekten visar vad som
faktiskt laddas och citeras. En påhittad startrad hade varit precis den kontexttillväxt
utan evidens som vakten finns för att förhindra.

## Vad kursplanen ALDRIG är

- **Ingen grind.** Den fäller inget, blockerar ingen launch och gatekeepar ingen modell.
- **Ingen kompetensevidens.** Kursplanen säger vad som LADDAS; vad systemet kan BELÄGGA
  står i [kompetensregister.md](kompetensregister.md).
- **Ingen ny agent.** En kompetens som växer blir en modul, inte en roll — en ny agent
  kräver en genuint annan säkerhetsprofil, modellkontraktsrad eller behörighetsomslutning.
