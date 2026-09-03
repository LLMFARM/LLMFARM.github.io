# Hoftag 7.0 – Nacht, Spezialisten und Wissenswerkstatt

Die spielbare Datei ist `modellhof_game.html`. Sie bleibt vollständig offline nutzbar, benötigt keinen Server und verwendet weiterhin den bestehenden Speicherplatz `modellhof_v4`. Die Version vor diesem Umbau liegt in `backup_vor_hofloop_2026-08-31`. Die Kopie unter `publish_pages/index.html` ist zum späteren Veröffentlichen vorbereitet; dieser Umbau veröffentlicht nichts im Internet.

## Spielentscheidungen

- **Tag → Nachtplanung → Mondlauf → Morgenbericht.** Jeder Tagesabschluss öffnet die Planung. Die Uhr pausiert dabei. Der Spieler kann auch ohne Zusatzarbeit schlafen gehen oder zum Tag zurückkehren. Die Animation dauert 3,3 Sekunden; reduzierte Bewegung wird respektiert. Doppelklicks rechnen nicht doppelt ab. Ein Reload vor dem Abschluss stellt die gespeicherte Planung wieder her.
- **Reale Ressourcen innerhalb der Simulation.** Ein Modell braucht eine eigene zugewiesene GPU. Modell und Lehrer können nicht doppelt verplant werden. Heute endende Aufträge geben Modelle nur dann für die Nacht frei, wenn ihre Arbeit tatsächlich abgeschlossen wurde. Nacht-LoRA, Full SFT und DPO verwenden die vorhandenen Trainingsverfahren, Datenanforderungen, Speichergrenzen und Risiken. Arbeit über acht Stunden bleibt als Nachttraining reserviert und wird tagsüber nicht heimlich fortgeführt.
- **Wiederverwendbare Daten.** Synthetische Daten und Destillations-Lehrdaten sind Chargen mit Herkunft, Qualität und Generation. Sie kosten Rechenzeit und Energie und verändern noch keine Gewichte. Destillation bereitet einen vorhandenen kleinen Schüler auf sein anschließendes Training vor; sie erzeugt kein kostenloses neues Grundmodell.
- **15 neue Auftragstypen neben dem bisherigen Katalog.** Vier eng umrissene Mikroaufgaben sind mit dem vorhandenen 0,6B-Modell erfüllbar. Größere Aufgaben sind Ketten aus Sortieren, Schreiben, Recherche, Code und Prüfung. Sie dauern ein bis drei Arbeitstage und haben einen zusätzlichen Liefertag als Puffer. Angenommene Preise sind fest. Eine verpasste Frist kostet 12 % Vertragsstrafe; bei Qualitätsmängeln werden nur akzeptierte Einheiten bezahlt.
- **Teams ergänzen Fähigkeiten.** Jede Stufe hat eigene Mindestwerte. Ein kleines Routingmodell kann vor einem größeren Spezialisten arbeiten. Ein einzelnes Modell darf mehrere Stufen übernehmen, muss aber die Gesamtlast tragen. Modellwerte werden nicht zu einem erfundenen Gesamt-IQ addiert. Übergaben kosten 12 % zusätzliche Tokenkapazität und drei Qualitätspunkte. auf eigener Hardware- und Lizenzanforderungen gelten für alle Beteiligten. Ein Team erhält genau eine Auszahlung.
- **Vergleich und Warnzeichen.** Einsatzkarten zeigen benötigte und vorhandene Werte nebeneinander. Der Hofvergleich ist such- und sortierbar und nennt aktive Werte, reine Modellwerte, Status, Speicher, Tempo und Warnungen. Die dreistufige simulierte Evaluation vergleicht Grundmodell, aktuelle Konfiguration und Stressfälle. Sie kostet 3 € pro Modell/Konfiguration/Tag, verändert keine Fähigkeiten und wird nach Konfigurationsänderungen ungültig. Quellenalter, geänderte Ausgabeformate, kontaminierte Daten und Energieengpässe haben konkrete Auswirkungen.
- **Qualität lohnt sich.** Ab drei sauberen Lieferungen gibt es 5 % Qualitätsprämie. Bei zuvor geprüftem Team kommen 8 % dazu, aber nur bei sauberer Abnahme. Reklamationen beenden die laufende Serie; die Bestserie bleibt. Sammlungsabzeichen und sechs wechselnde Hofprojekte mit sieben simulierten Tagen Laufzeit geben zusätzliche Ziele. Projektprämien werden einmalig und getrennt als Förderung gebucht. Es gibt keine Echtzeit-Loginpflicht und keine Strafe für ein unerfülltes Hofprojekt.

## Wissenswerkstatt statt Pauschal-RAG

| Baustein | Spielpreis | Funktion |
| --- | ---: | --- |
| Vektordatenbank | 90 € | Textabschnitte und Vektoren ablegen |
| Embedding-Modell | 120 € | Suchfragen und Texte vergleichbar machen |
| OCR-Modell | 100 € | Scans in Text umwandeln; bei Textquellen optional |
| Reranker | 160 € | Treffer nachprüfen und sortieren |

Die ersten beiden Teile ergeben Textsuche für 210 €. Der komplette Aufbau kostet 470 € und wird auf dem Hof gemeinsam genutzt. Der erste kleine Index ist enthalten. Die Hilfsmodelle sind vereinfachte, sequenzielle Host-Dienste statt vier zusätzlicher Tierplätze. Erweiterte Pipeline und Reranker haben mehr Betriebsaufwand. Die Anzeige der Hilfsmittel und die Berechnung verwenden dieselben dynamischen Werte.

Modelle müssen die Pipeline weiterhin ausdrücklich anschließen. Der Index veraltet nach drei Tagen oder sofort bei einer Quellenänderung. Zwei GPU-Stunden Nachtarbeit aktualisieren ihn. OCR- und Wissensaufträge verlangen ihre jeweiligen Bausteine ausdrücklich. Die ehemalige pauschale RAG-Forschung wurde zum optionalen Quellenlabor für 180 €: ein Prüfsatz verbessert passende Aufträge um zwei Qualitätspunkte.

Bereits gekaufte alte RAG-Hilfsmittel erhalten alle Bausteine bei der Migration. LoRA-Risiken überlagern Fähigkeiten im Adapter; die eingefrorene Basis bleibt unangetastet und wird durch Abnehmen des Adapters wiederhergestellt.

## Energiewirtschaft

- Tagestarif **0,48 €/kWh**, Nachttarif **0,24 €/kWh** als offene Spielannahmen. Ereignisse können den Netzpreis verändern; der Nachtpreis bleibt die Hälfte des jeweils geltenden Tagestarifs.
- Solar liefert nachts nichts. Wind, Speicherkapazität, Entladeleistung, Ladeverluste, Grundlast und Nachbarstrom werden stündlich berücksichtigt. Die Reihenfolge eines Hoftages läuft von 06:00 bis zum nächsten Morgen, sodass am Tag geladener Solarstrom der folgenden Nacht dient.
- **Automatisch** nutzt Eigenenergie und ergänzt Netz-/Kraftwerksstrom. **Nur Eigenstrom** reserviert erneuerbare Energie für ausgewählte Modelle; bei Unterdeckung pausieren diese. Grundlast bleibt automatisch versorgt. Eine Unterdeckung legt nicht mehr pauschal alle Modelle still. Cloud bleibt vom lokalen Netzausfall unabhängig.
- Ab Hofstufe 5 kann eine angekündigte Versorgerunterbrechung von 14 bis 18 Uhr auftreten. Sonne, Wind, Dunkelflaute, teurer Strom, neue Quellen, Formatwechsel, Audits und Nachfrage verändern die Tagesentscheidungen. Die Folge variiert mit der im Spielstand gespeicherten Hof-Saat; Ereignisse werden nicht bei jeder Vorschau neu gewürfelt.
- Erneuerbare und Speicher haben für die Spielbalance **ein Zehntel ihrer bisherigen Baupreise**, unveränderte Leistungsdaten und proportional angepasste Wartung. Beispiele: 400-W-Panel 45 €, 600-W-Panel 60 €, 2,4-kWp-Solarfeld 270 €, 5-kWh-Akku 200 €, kleines 5-kW-Windrad 750 €. PCs, GPUs, Gebäude und fossile Kraftwerke behalten ihre bisherigen Preise. Die Amortisation wird in Hoftagen anhand der aktuellen Last angezeigt; ein überdimensionierter Ausbau kann sich weiterhin nicht rechnen. Bestehende Anlagen und ihre Historie bleiben erhalten, es gibt keine nachträgliche Barauszahlung.

Die Beträge sind keine realen Angebote oder Stromverträge. Die Simulation ist ein didaktisches Wirtschaftsmodell, keine technische Dimensionierung und keine Messung realer KI-Qualität.

## Prüfung

Der vollständige Build wird mit `dev/assemble.ps1` erzeugt. Neue Module: `dev/hofloop.js` und `dev/hofloop.css`; gezielte Integrationsstellen im Template und im Rechenhaus. Eine parallel entstehende optionale Meisterschaftserweiterung wird nicht überschrieben; ihre vorhandenen Fertigkeitsfunktionen werden übernommen und fehlende Fertigkeitsfunktionen bleiben neutral.

- `node dev/tests_hofloop.cjs`: 32 Fälle, darunter Preisbindung, Teamzahlung, Fristbruch, alte Spielstände, Nacht-Reload, Doppelklick, LoRA-Basisschutz, Pipelinekauf, Quellenalter, Projektprämien, stündliche Energieerhaltung und Netzausfälle.
- `node dev/tests_v6.cjs`: 48 Regeln und Langläufe einschließlich der parallel ergänzten Meisterschaftsprüfungen. Die Tagesabrechnung wird direkt über `ausfuehrenTagesWechsel` geprüft; der neue Planungsdialog hat eigene Tests. Der Strompreis-Sollwert folgt dem bewusst geänderten Tarif.
- `node dev/tests_rechenhaus.cjs`: 61 Hardware-, Energie-, Migrations-, Speicher- und Teichprüfungen. Die drei bewussten Baupreisänderungen sind in den entsprechenden Sollwerten berücksichtigt.
- Acht neue 120-Tage-Läufe mit dem 0,6B-Modell: kleine passende Aufträge, Sitzungspflege und keine riskanten Großinvestitionen. Alle bleiben positiv. Die Ergebnisse stehen in `BALANCE_HOFLOOP.json`; einzelne Testresultate in `PRUEFERGEBNIS_HOFLOOP.json`. Dies belegt einen tragfähigen Einstieg, nicht die optimale Strategie für jeden Endgame-Ausbau.
- Browserdurchlauf: Einführung, GPU-Zuweisung, Rollenwahl, Evaluation, Vertrag, Nachtplanung, Synthetik, Mondanimation, Morgenbericht, Bausteinkauf und Modellvergleich. Handyansicht bei 390 × 844 geprüft; Navigation scrollt horizontal, große Tabellen ebenfalls. Keine Laufzeitfehler im geprüften Ablauf.

Wiederspielwert bleibt letztlich eine Frage von Spieltests mit Menschen. Die eingebauten Serien, Auftragsmischungen, variierenden Ereignisse, Hofprojekte und Ausbauentscheidungen liefern dafür eine überprüfbare spielbare Grundlage.
