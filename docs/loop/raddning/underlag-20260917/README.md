# Underlag 2026-09-17 — källmaterial, inte order

Detta är ägarens uppdragspaket utgåva 2 (`nortropic-gemensamt-uppdrag-v2-2026-09-17.zip`,
sha256 `1077a63416cb645326d3c8ef5f8d6728c5031d1b3f97d10e238964718282b7ca`) och den externa
auditen det bygger på, bevarade byteidentiskt så att fynd-id (AUD-01–AUD-12) och
källhänvisningar går att följa från repot. Katalogen innehåller inga filer med
autoladdade namn (`CLAUDE.md`, `AGENTS.md`, `SKILL.md`) och ska aldrig importeras i en ingång.

**Vad som gäller:** ordningen står i `../VAGEN.md`, läget i `docs/loop/drift.md`, besluten i
`docs/05-beslutslogg.md` (rad `LOOP-ÄGARUPPDRAG-20260917`). Uppdraget här ersätter utgåva 1,
`ursprunglig-prompt.txt` och auditens `HANDOFF.md` som körinstruktion; de två sistnämnda ingår
bara som historik (utgåva 1 och ursprungsprompten finns i zip:en, inte här).

| Fil | Vad | sha256 |
|---|---|---|
| `UPPDRAG-TILL-CLAUDE.md` | ägarens uppdrag, utgåva 2 (den enda aktiva uppdragstexten i paketet) | `8b0a8a62ab6f1b3e1126fd385326889c43b28cd090f72f6b56566e03e671278d` |
| `STARTA-HAR.txt` | ägarens korta introduktion | `e55bef256dfc9a87432e0af0670b92a84ac3507857cb1c71d201f831ce715fee` |
| `KALLOR-OCH-VALIDERING.md` | paketets källredovisning och egna granskningsgränser | `1027f0a052c3cc1ff92a0d5b780656903c5b9ed538b20029304fd0495eb4c10e` |
| `audit/AUDIT.md` | revisionen med AUD-01–AUD-12 (main `eb9483e9`, plattform `8095d947`) | `20bed80a9c7489edf4d395718505540705af1f36d9233b8b6f8bb08c0a5b99b7` |
| `audit/HANDOFF.md` | auditens föreslagna reparationsuppdrag — **historik, ersatt av uppdraget** | `6e04aed78615e5abbf5c72cc0b14e32df4ca5db04a7fec1f31380f6a5382c642` |
| `audit/reproduce_audit.py` | sju reducerade reproducerare (T01–T07) — testidéer, aldrig grindar; läser inte reparerad kod | `f095d7f0158905631ab937060a184814d389d8e91c132df03064da50e735a344` |
| `audit/results.json` | auditens körresultat (Linux, fixturer, 0 riktiga grindar) | `112ba06a4ce781188be906b60284e96399fb455f9c3b289bffdd959c9d7e7f5b` |
| `audit/source-observations.json` | granskade revisioner och blob-id | `faf4f791205d1da6a30abc7560bcaa08036f0fdcbf624d3ffd2c9f89eb522353` |
| `audit/test-run.txt` | auditens körlogg | `00d6796fbf5b557a876125f431a085d145dda5daca31ddd33d393bf93a06e72f` |

Kontroll: `shasum -a 256 -c SHA256SUMS.txt` i denna katalog.

Reproducerarna får köras för att förstå motexemplen (`python3 audit/reproduce_audit.py --output
/tmp/x.json`; engångsrepon, ingen nätåtkomst), men ett omkört fragment säger ingenting om aktuell
kod. Fynd stängs bara med prov mot den verkliga mekanismen (`tests/scripts/**`).
