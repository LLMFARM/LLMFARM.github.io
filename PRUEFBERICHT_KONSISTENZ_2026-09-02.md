# Modellhof – Konsistenz-, Realitäts- und Spielablaufprüfung

Stand: 2. September 2026  
Geprüfter Build: `modellhof_game.html`  
SHA-256: `d340b541b26b74869ab6162f21bbb445bd36ae7d43303106d0ba66c4a26527f9`

## Ergebnis

Der aktuelle Stand ist durchspielbar, Regelwerk und ausführbare Spielmechanik sind synchron,
die Veröffentlichung entspricht bytegenau dem geprüften Quell-Build und es ist kein technischer
P0-/P1-Blocker mehr offen. Der zentrale Abschlusslauf besteht aus neun Testsuiten mit zusammen
424/424 grünen Einzeltests, einem schreibfreien Regelwerk-Synchroncheck und einem vollständigen
Audio-Audit. Insgesamt sind damit 11/11 Abschlussprüfungen bestanden.

Das Spiel bildet die fachliche Realität als bewusst vereinfachtes Lehrmodell überwiegend sehr gut
ab. Besonders überzeugend sind die Zusammenhänge zwischen Modellgröße, Quantisierung, Kontext,
VRAM, Durchsatz, Hardware, Strom, Training, Datenschutz und wirtschaftlichem Risiko. Preise,
Leistungswerte, Wetter, Ereigniswahrscheinlichkeiten und Sanktionshöhen sind dagegen ausdrücklich
Spiel- beziehungsweise Zeitpunktannahmen und dürfen nicht als Angebots-, Rechts- oder
Leistungsberatung gelesen werden.

## Prüfumfang und belastbare Nachweise

- 39 eigenständige `gpt-5.6-luna`-Agenten mit mittlerem Denken spielten je zwei unterschiedliche
  Läufe: 78 agentische Spielpfade.
- Die Laufzeitplattform erlaubte in dieser Aufgabe nicht die angeforderten 60 gleichzeitig bzw.
  nacheinander erzeugten Agenten-Threads. Deshalb wurden die fehlenden Nummern 40–60 nicht als
  Agenten ausgegeben, sondern transparent durch 42 reproduzierbare, seed-basierte Botläufe ergänzt.
- Gesamtumfang: 120 Spielpfade. Alle 42 Ergänzungsläufe wurden ohne Parse-Fehler und ohne Befund im
  Spielbot-Bericht beendet. Die Rohdaten liegen unter `scratchpad/coverage_40_a.json` bis
  `scratchpad/coverage_60_b.json`.
- Automatischer Prüfstand: 424/424 Einzeltests grün. Enthalten sind Ökonomie-, Balance-,
  Rechenhaus-, Energie-, Minispiel-, Zucht-, Datenschutz-, Berufs-, Dialog-, Hofsprecher-,
  Nachtplan-, Quest- und Langzeittests.
- Regelwerk: `REGELWERK.md` wird aus denselben Daten und Konstanten wie das Spiel erzeugt;
  `node dev/hofbuch_md.cjs --check` bestätigt den synchronen Stand ohne Dateien zu verändern.
- Audio: 59/59 Clips, insgesamt 27,8 Minuten, 24 kHz mono, 1,79–2,51 Wörter pro Sekunde;
  alle Mundkurven passen zur jeweiligen Tonlänge.
- Veröffentlichung: `modellhof_game.html` und `publish_pages/index.html` sind byte- und hashgleich;
  59/59 veröffentlichte MP3-Dateien sind ebenfalls hashgleich.
- Browserprüfung: Desktop- und Mobilansicht, modale Dialoge, Tastaturbedienung, Escape,
  Fokusfalle, Fokus-Rückgabe, Startführung und zentrale Tages-/Nachtübergänge wurden praktisch
  geprüft. Im finalen Reload traten keine Konsolenfehler auf.

## Fachliche Realität: was gut und stimmig ist

### Modelle, Speicher und Hardware

Gut umgesetzt ist, dass Parametergewichte, Quantisierung, Kontext-Cache und Sicherheitsreserve
getrennt betrachtet werden. Mehr Kontext kostet Speicher; Quantisierung verkleinert die Gewichte;
Offloading macht ein Modell langsamer, ändert aber nicht magisch seine fachlichen Fähigkeiten.
Rechner-lokaler RAM kann nicht von einem anderen Rack herbeigezaubert werden. Das ist als
Lernanalogie wesentlich ehrlicher als ein einziges abstraktes „Leistungslevel“.

Der Startpfad Qwen3.5 4B auf einer RTX 4090 ist fachlich plausibel: Die offizielle Modellkarte nennt
262.144 native Kontexttoken, NVIDIA nennt 24 GB GDDR6X für die RTX 4090. Das Spiel reduziert diese
Realität auf planbare Kapazitäts- und Speicherformeln. Konkrete Token/s bleiben Spielannahmen, weil
sie in der Praxis stark von Engine, Quantisierung, Batch, Promptlänge und Hardwarezustand abhängen.

### Training, Adapter und Modellpflege

LoRA, QLoRA, SFT, DPO, Checkpoints, Übertraining, Adapterbindung und Merge-Kompatibilität sind als
Abhängigkeiten schlüssig modelliert. Ein Adapter gehört zur exakten Basis, Training braucht Daten,
Zeit und Rechenleistung, ein trainierendes Modell fällt für andere Arbeit aus, und Rollback ist
nicht dasselbe wie Ausruhen. Das erzeugt fachlich sinnvolle Entscheidungen statt eines beliebigen
„+5 Fähigkeit“-Knopfs.

Die Spielwerte für Kompetenzzuwachs und Kursdauer sind Balancewerte. Richtig ist die Richtung der
Wirkung; nicht als Naturgesetz zu lesen sind die exakten Prozent- und Tageszahlen.

### Datenschutz und Fachwissen

Die jetzige Logik ist fachlich deutlich besser als ein binäres „DSGVO an/aus“: Datenminimierung,
technische Schutzmaßnahmen, Fachwissen, Guardrails, Kontrollpaket und Schutzgeschirr reduzieren
Risiko, beseitigen ein Restrisiko aber nicht pauschal. Bei sehr hohem Wissen kann die Simulation das
Restmodell auf null setzen; das ist eine Spielvereinfachung, keine rechtliche Garantie.

Die europäische Datenschutz-Grundverordnung verlangt unter anderem Datenminimierung sowie
angemessene technische und organisatorische Sicherheit. Die Spielmechanik vermittelt diesen
Grundgedanken richtig. Verwarnungen, feste Geldstrafen und Hofschließung nach zwei beziehungsweise
drei Verstößen sind dagegen ein verständlicher Lern- und Verlustmechanismus, keine Abbildung eines
realen behördlichen Verfahrens.

### Rechenhaus und Energie

PUE wird korrekt als Zusatzaufwand des Gebäudes um die IT-Last herum gedacht. Der reale Begriff ist
das Verhältnis aus Gesamtenergie des Rechenzentrums zu IT-Energie; kleinere Werte sind effizienter.
Die Stufen Schuppen → Nerdtempel → Rechenzentrum mit sinkender PUE und zugleich wachsender
Grundlast erzeugen deshalb eine gute, nicht triviale Ausbauentscheidung.

Netzanschluss, Leistungsgrenzen, Tages-/Nachttarif, Eigennutzung vor Einspeisung, Akkuverluste,
Wind-/Solarprofile, Brennstoff und Wartung greifen ineinander. Besonders gut ist, dass ein Akku
keine Erzeugung ersetzt, Solar nachts nicht plötzlich liefert und Vorschauen den Spielstand nicht
verändern. Wetterfaktoren, Anschlusskosten und Anlagenpreise sind für die Spielökonomie kalibriert,
nicht als aktuelle Energieberatung gedacht.

### Ökonomie, Schwierigkeit und Motivation

Jede Geldbewegung läuft centgenau durch das Journal; Käufe, Kuren und Verträge sind atomar. Eine
schlechte Entscheidung kann zur Pleite führen, vernünftige Strategien bleiben über 120 Tage
tragfähig. Schwierigkeitsgrade verändern Hilfe und ökonomische Puffer, nicht heimlich die
technischen Grundformeln.

Der Fortschritt ist bewusst lang. Höhere Stufen benötigen über viele Hofwochen hinweg Aufträge,
Forschung, Infrastruktur und Spezialisierung; ein kompletter Hof ist nicht in einer realen Woche
abgehakt. Gleichzeitig liefern Zettel, Hofziele, Kundensterne, Minispiele, Tagesberichte,
Wetterplanung, Ereignisse und Dorf-Anliegen tägliche Teilerfolge.

## Was bereits gut an der Spielstruktur ist

- Es gibt echte Alternativpfade: lokal oder Cloud, Einzelmodell oder Team, Kurs oder Praxis,
  Guardrails oder Schutzgeschirr, Netz/PV/Wind/Akku/Kraftwerk, Quantisierung oder größere Hardware,
  Training oder geeigneter Modellkauf.
- Mehrere Lösungen unterscheiden sich in Kosten, Zeit, Risiko und Folgefähigkeit; sie sind nicht nur
  verschieden beschriftete Knöpfe.
- Fehler sind meist reparierbar: Reklamation, zweite Chance, Ruhe, Kur, Rollback, andere Besetzung,
  anderer Energieplan oder späterer Ausbau. Verlust bleibt möglich, aber ein einzelner Fehlklick
  beendet nicht willkürlich den Hof.
- Das Regelwerk ist keine getrennt gepflegte Prosa, sondern wird aus den aktiven Katalogen,
  Konstanten und Formeln erzeugt. Das verhindert einen großen Teil typischer Dokumentationsdrift.
- Die Geführte Woche lehrt in sieben Fortschrittskapiteln. Sie ist nicht mehr an den Kalendertag 40
  gekoppelt und blockiert langsame oder experimentierende Spielerinnen nicht.
- Die Zusage trennt nun Qualitätsprognose, Arbeitsstunden, Fristbudget und Tageskapazität. Dadurch
  ist verständlich, warum 50 % Tageskapazität bei genügend Frist trotzdem genügen können.

## Konkret behobene Regel-, Dialog- und Spiellogikkonflikte

### Regeln und Dialoge

- Die Zettelschmiede behauptet nicht mehr „50 Berufe“, sondern spricht robust von „über fünfzig“;
  der aktuelle aktive Katalog enthält mehr Einträge und kann weiter wachsen.
- Die Datenschutztexte entsprechen jetzt den Schwierigkeitsgraden: Hofalltag und Markt schließen
  nach zwei gezählten Abmahnungen, Behütet nach drei; die erste junge-Hof-Beanstandung kann als
  Verwarnung ohne Zähleranstieg enden.
- Schutzgeschirr halbiert verbleibendes Risiko und löscht es nicht. Der Datenschutz-Fachkurs wird als
  Risikoreduktion erklärt, nicht als pauschaler Freibrief.
- Die Arena nennt die echte Freischaltung ab Hofstufe 3.
- Teamtexte unterscheiden Auftragsentstehung von Ausführung: größere generierte Teamzettel skalieren
  Arbeit, Lohn und Frist; bei der Bearbeitung kostet jeder zusätzliche Agent Koordination. Gleiches
  Geschirr reduziert diese Last. Das Beispiel 4 Tage solo → etwa 2,2 Tage zu zweit → 1,6 Tage zu
  dritt stimmt jetzt mit der Formel überein.
- „Qualitätsprognose“ bezeichnet die Chance einer vollständig sauberen Abnahme;
  „Tageskapazität“ bezeichnet den täglich schaffbaren Anteil. Wo Ada das alltagssprachliche Wort
  „Qualitätschance“ verwendet, meint und erklärt sie dieselbe Prognose, keinen zweiten Wert.
- Die Geführte Woche spricht von sieben Kapiteln statt von starren Kalendertagen. Einführung sowie
  Kapitel 1–7 wurden neu vertont.
- Der Architekturentscheid zum Clean Break nennt jetzt wie Code, Tests und README den echten
  Speicherschlüssel `modellhof_v7`.

### Führung, Quests und Freischaltungen

- Der garantierte Erstauftrag ist tatsächlich datenschutz- und abmahnfrei.
- Der geführte Trainingspfad passt auf die 24-GB-Startkarte und führt über SFT zu LoRA.
- Hofziele prüfen genau ihren Text: ein drittes Tier muss wirklich gekauft werden, LoRA zählt nicht
  durch irgendein anderes Training, Schutzgeschirr/Forschung/Eignung werden real geprüft.
- Forschung, Solar, Training, Rechenhaus und weitere Aktionen besitzen zentrale Engine-Gates;
  ein versteckter oder direkt aufgerufener UI-Pfad kann Freischaltungen nicht umgehen.
- Schwarzmarkt-Daten sind auch in der Engine vor Hofstufe 4 gesperrt.

### Blocker und Atomarität

- Dasselbe Tier kann nicht zwei Teamrollen gleichzeitig belegen.
- Ein ungültiger oder unbezahlbarer Nachtplan fällt auf kostenlose Ruhe zurück. Der Tag läuft weiter,
  statt in einer Endlossperre zu enden.
- Ein abgebrochener Modellkauf verändert weder Kasse, Journal noch Tierbestand. Ein bestätigter Kauf
  weist eine freie Bucht automatisch zu.
- Kuren prüfen Voraussetzungen vor der Abbuchung. Rollback ohne Checkpoint wird abgelehnt; eine Kur
  löscht nur den passenden Ursachenzähler.
- Vorschauen sind nebenwirkungsfrei und verändern insbesondere keine Teamgröße.
- Ein Kind zweier gewöhnlicher Modelle erbt nicht mehr versehentlich die unzüchtbare Nadelklasse;
  kompatible Zuchtlinien bleiben dadurch auch in späteren Generationen offen.
- Der Hofsprecher unterstützt Fachkurstechniken und verwendet DPO nur im fachlich passenden
  Datenschutzkontext.
- Das Tagesabzeichen verlangt die fünf tatsächlich täglichen Minispiele, nicht das seltene
  Hacker-Ereignis.
- Stall- und Hilfetexte sprechen tierartenneutral von „Tier“; Modellwechsel melden klar, wenn der
  tägliche Wechsel bereits verbraucht ist.

### Bedienbarkeit und Barrierefreiheit

- Modale Dialoge besitzen eine zugängliche Überschrift, setzen den Fokus in den Dialog, halten Tab
  im Dialog, schließen mit Escape und geben den Fokus an den Auslöser zurück.
- Mobilansicht bei 375 × 812 und kompakte Desktopansicht bei 1024 × 720 bleiben bedienbar; die
  wesentlichen Ziele und Dialogaktionen liegen nicht außerhalb des nutzbaren Bereichs.

## Verbleibende Verbesserungen – priorisiert und ohne Mechanikumbau

Diese Punkte sind keine aktuellen Durchspielblocker. Sie verbessern Verständlichkeit, Motivation
und spätere Komplexität, ohne vorhandene Kernmechaniken leichter zu machen.

### P2 – als Nächstes sinnvoll

1. **Progressive Minispiel-Schwierigkeit.** Heute wechseln Aufgaben, aber die Schwierigkeit steigt
   nicht systematisch. Pro Spiel drei Pools einführen: Grundlagen, Kombinationen, Grenzfälle.
   Freischaltung an Hofstufe und bisheriger Trefferquote; falsche Antworten bleiben folgenlos für
   die Kasse, geben aber eine genaue Erklärung. Dadurch wächst Denkaufwand, ohne Lösungswege zu
   verengen.
2. **Sieben-Tage-Liquiditätsvorschau vor Großkäufen.** Kaufdialog zeigt Kaufpreis, erwartete Pacht,
   Anschluss-Grundpreis, Wartung und konservative Auftragsreserve für sieben Tage. Warnen, aber nicht
   verbieten. Das verhindert überraschende Spiralen und lässt riskante Strategien weiterhin zu.
3. **Abregelung früher sichtbar machen.** Vor PV-/Wind-/Akku-Ausbau eine gut sichtbare Prognose
   „voraussichtlich nutzbar / einspeisbar / abgeregelt“ zeigen. So versteht man, warum mehr Erzeugung
   ohne Last, Speicher oder Netzanschluss nicht automatisch mehr Ertrag bedeutet.
4. **Tägliche Mikroziele auf ruhigen Tagen.** Aus bestehenden Mechaniken dynamisch zwei bis drei
   Vorschläge bilden, etwa einen kleinen Zettel, eine Wissenskarte und eine Energie-/Pflegehandlung.
   Kleine XP-/Chronikbelohnung, keine Pflicht und kein zusätzlicher Geldhahn.
5. **Mobildock mit Wischhinweis.** Beim ersten mobilen Start kurz zeigen, dass die untere Navigation
   horizontal wischbar ist; nach dem ersten Wischen dauerhaft ausblenden.
6. **Auto-Dialog-Fokus.** Automatisch geöffnete Dialoge besitzen naturgemäß keinen Auslöseknopf;
   nach dem Schließen landet der Fokus derzeit auf `body`. Einen stabilen Rückfallpunkt wie Hofleiste
   oder Hauptüberschrift festlegen.

### P3 – Wartbarkeit und Langzeitvertiefung

7. **Gemeinsamer Gate-Vertragstest.** Für jedes Hofsprecher-Werkzeug automatisch prüfen, dass UI,
   Vorschau und Ausführung dieselbe Freischaltungsfunktion nutzen. Das schützt zukünftige Systeme
   vor erneuter Drift.
8. **Komplexität über Kombinationen statt höhere Zahlen.** Späte Zettel sollten häufiger zwei bis
   vier voneinander abhängige Anforderungen kombinieren: Fachwissen + lokaler Betrieb + Energiepuffer
   + Teamchemie. Mindestens zwei realistische Lösungsfamilien pro Vorlage als Generatortest sichern.
9. **Serien verständlicher kommunizieren.** Im Dorfplatz ausdrücklich „ein Versuch je Spiel und
   Hoftag“ sowie den Grund eines Serienresets anzeigen. Ein kleiner Lern-XP-Trost bei einer beendeten
   Serie motiviert, ohne Fehler wirtschaftlich zu belohnen.
10. **Echte Touch-Gesten zusätzlich automatisieren.** Die realen Mobilgrößen wurden geprüft; ein
    automatisierter Pointer-/Touch-Test für Dock-Wischen, Karten-Scroll und Dialog-Drag würde die
    visuelle Prüfung reproduzierbar machen.

## Abschlusskriterium

Der Stand ist freigabefähig, wenn der Anspruch „fachlich nachvollziehbare Wirtschaftssimulation“
lautet. Er ist nicht als exakter digitaler Zwilling eines Rechenzentrums, als Rechtsberatung oder als
Preisvergleich zu kennzeichnen. Die nächsten Änderungen sollten zuerst die sechs P2-Punkte
adressieren; ein Umbau der Kernmechaniken ist dafür nicht erforderlich.

## Referenzquellen der Realitätsprüfung

- EU-Datenschutz-Grundverordnung, insbesondere Art. 5:
  https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679
- NVIDIA RTX 4090 – offizielle Spezifikation:
  https://www.nvidia.com/en-us/geforce/graphics-cards/40-series/rtx-4090/
- Qwen/Qwen3.5-4B – offizielle Modellkarte:
  https://huggingface.co/Qwen/Qwen3.5-4B
- U.S. Department of Energy – PUE-Definition und Rechenzentrumseffizienz:
  https://www.energy.gov/cmei/femp/cooling-water-efficiency-opportunities-federal-data-centers
