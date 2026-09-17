# Avgränsad överlämning av auditfynd — inte en ny VÄG

Detta dokument är ett föreslaget reparationsuppdrag att läsa tillsammans med `AUDIT.md`. Det ger inte i sig nya befogenheter, ändrar inget ägarbeslut och är inte en andra auktoritativ fasplan.

## Uppdragets mål

Gör den befintliga vägen startbar och sanningsenligt verifierbar utan att starta om kernelprojektet. För in nödvändiga rättelser i den gällande VÄGEN och dess faktiska mekanismer. Slutmål och produktomfång ligger fast; en förklaring av hur ett befintligt krav prövas är inte ett tillstånd att lägga till nya krav.

## Revisionsbas och första kontroll

Auditen läste main `eb9483e932be528231d3e9212d816ebad76ef114` och plattformsgrenen `8095d947c83202e2b87801531d9f7cb1457c8719` den 17 september 2026. Jämförelsen gav 55 före / 111 efter main. `VAGEN.md` saknades vid läsning av den plattformsrevisionen.

Fastställ aktuella identiteter före ändring. Senare rättelser kan ha stängt ett fynd; verifiera det mot dess beteende, inte mot enbart en commitrubrik. Bevara redan giltiga checkpoints. Kopiera inte gamla tal som ny status och starta inte om avslutade hypoteser för att bakgrundstext nämner dem.

Läs de relevanta gällande ägarbesluten, båda grenarnas auktoritetsdokument och separationens beslut. Regelnummer har olika innebörd på grenarna. Vid en verklig auktoritetskonflikt används befintlig korrekt beslutsroll; välj inte senaste lästa stycke och återställ inte webbens gamla dokument som kernelauktoritet.

## Fynd som ska behandlas i befintligt kontraktsflöde

### Sanningsenliga beslut

Reparera `helhetsbilden.sh` så att existens aldrig kan bli godkänd funktion. Ett saknat, rött, ej kört eller felbundet obligatoriskt prov lämnar aktuell slutrad icke-grön. Kvalificerad slutdom ska använda den befintliga verifierar-/authorityvägen, inte en oberoende parallell domare.

Reparera `redo-for-codex.sh` så att barnprocessers ODÖMBART, krasch, tomma eller ofullständiga resultat inte blir JA. Skilj aktuell körberedskap från `validera-underlaget.sh`:s historiska fakta och avsiktligt saknade arkivartefakter. Ett korrekt byggsteg får inte fälla startkravet enbart genom att en tidigare saknad leverans nu finns.

Begränsa inventeringens påståenden till faktiskt täckta innehållskategorier och rätt remote. Ta bort beskedet att all städning kan ske utan förlust. Gör ingen städning som del av detta uppdrag. Bevis om lika antal poster får inte beskrivas som oförändrat innehåll.

### Sammanhängande övergång och bevarande

Integrera enligt gällande normal-merge- och granskningsflöde så att den verkliga byggrevisionen samtidigt bär plattformskoden, aktuell VÄG, beslut, regler och bevarandemekanismer. Ingen force, blind ours/theirs, rebase eller bortkastad giltig historik. Skilj basens färskhet från att kandidaten avsiktligt avviker från main.

Följ separationens redan beslutade placering av kernelbeslutsloggen och uppdatera motsvarande referenser. Se till att autocommitens faktiska klassning överensstämmer med aktuell auktoritet och att den inte delar kod och obligatorisk dokumentation i oförenliga commits. Prova rätt worker-/utförarroll: allmän autocommit får inte smyga in som självcommit eller extern push i en körning där det är förbjudet.

### Fullständigt befintligt acceptanskontrakt

Härled h-027–h-030 från det befintliga substitutionskontraktet. Beakta h-017, som där uttryckligen är ett beroende. De fjorton äldre grindarna får vara ett delmål, inte en falsk fullständig slutning. Beskriv explicit hur varje substitutionsuppgift går från specrad till fryst prov, byggd komponent och godkänd funktion.

Frys den avgränsade v1-acceptansen före återstående arbete som den ska mäta. Slutlig körning och rapportering kan fortfarande ligga sist. Knyt existerande krav på verklig återhämtning utan återberättelse, fryst taskverifiering och guarded publicering till sina prov. Håll full-roadmapkrav och generell organisationsorkestrering utanför där de inte redan ingår i v1.

Bevisa den befintliga återfallsroutningen: advisory utan ny reparationsrunda, belagd kravbrist med rätt nästa steg, återöppning med nytt underlag och bevarad försöksbudget över sessioner. Ett git-diff som tar bort rader är inte ensamt bevis för ofarlig gatereparation. Respektera rollseparation och frysta kontrakt; skriv inte om en buildergrind för att få den egna kandidaten grön.

Håll isär yttre utvecklingssandbox och de mekaniska produktgränser som kontraktet fortfarande kräver. Upphäv inte ägarens sandboxbeslut, men påstå inte ett säkerhetsutfall som inte är prövat i den faktiska konfigurationen.

## Bevis och klart-när

`reproduce_audit.py` visar sju reducerade motexempel i isolerade fixturer. Körningen är ingen Darwin- eller kernelkvalificering. Använd dem som testidéer och bevara loggen; kör sedan riktiga positiva och negativa regressionsprov på de ändrade mekanismerna.

Avsluta med ett kort kvitto per åtgärdat fynd: kandidat-/authorityidentitet, vad som ändrades, faktiskt provkommando, exitkod, relevant observerat beteende och körmiljö. Kvarstående osäkerhet ska heta OVERIFIERAT och saknade beroenden ska vara synliga. Redovisa hela listan med stängd/öppen och motivering, inte enbart ett totalscore.

Överlämningen är reparerad när nästa kalla session på den verkliga byggrevisionen hittar samma tillåtna nästa uppgift, de relevanta startvillkoren är sanna, falska gröna besked inte är möjliga i de täckta kontrollfallen och slutkontraktets återstående steg är entydiga.

**Kräv inte en färdig kernel för att starta ett legitimt avgränsat byggsteg.** När detta reparationsuppdrag är klart återgår arbetet till korrigerad VÄGEN. Öppna inte en ny obegränsad audit eller en alternativ produktarkitektur.
