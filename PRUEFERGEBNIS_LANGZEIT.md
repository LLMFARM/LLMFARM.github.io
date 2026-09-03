# Langzeit-Volltest · 03.09.2026

## Umfang

- 50 unabhängige Luna-Testprofile in zwei Batches (Seeds 1–25 und 126–150)
- zusätzliche Langzeitläufe mit Seeds 3, 7, 42, 138 und 999
- manueller Browserpfad vom neuen Hof bis zu Aufträgen, Datenlese und Kapitel 3
- mobile UI-Prüfung bei 390 × 844 Pixeln
- abschließender gezielter Endgame-Lauf mit Seed 7 über 180 Hoftage

## Endgame-Nachweis (Seed 7)

- Legende an Tag 111
- Hofstufe 12, Forschungsbaum 22/22
- Zuchtlinie: 5/5 Würfe, Generation 4
- Rechenpark: Rechenzentrum, 12,4/10 kWp Solar, 105/20 kWh Speicher
- Forschungsbaum: 22/22
- Handelshaus: 951/100 Aufträge, Ruf 5/4,5 Sterne
- Fachhaus: Datenschutz 86, Recht 85, Medizin 85; 0 Abmahnungen
- Tier 5, Cloud-Lizenz, Agenten-Welt, Liga und Gesellenbrief erreicht
- Kasse blieb positiv: Minimum 146 Euro, Schlussstand 256.195 Euro
- keine Engine-Ausnahme im Lauf

## Behobene Fehler

1. Nacht-Weiter-Aktion ohne laufendes Training konnte auf `nachtRest` eines fehlenden Trainings zugreifen. Der Pfad ist jetzt abgesichert und per Regressionstest abgedeckt.
2. Auf 390-Pixel-Bildschirmen ragte der Hofbuch-Knopf aus dem sichtbaren Header. Die mobile Kopfzeile passt jetzt ohne horizontalen Überlauf.
3. Das Lebenswerk Rechenpark zählte Freiland-Solarfelder nicht mit. Dadurch waren die geforderten 10 kWp bei maximal 6 kWp Dachfläche unerreichbar. Die Wertung nutzt jetzt die vollständige PV-Leistung; ein Regressionstest deckt 10,8 kWp aus Dach und Feldern ab.

## Abschlussprüfung

- 12/12 Prüfgruppen bestanden
- 439/439 automatisierte Fälle bestanden
- Hofbuch und Ada-Dokumentation synchron
- 68/68 Audioclips technisch und lippensynchron geprüft
- Spiel- und Publish-Datei bytegleich
- SHA-256: `9a59faae501dfb7bd158db5124112ae53b7f95cbb4e82d019283d7072498f797`

