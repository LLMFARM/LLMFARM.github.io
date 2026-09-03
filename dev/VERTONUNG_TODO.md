# Vertonung – vollständiger Ada-Bestand

Stand: 02.09.2026 · 68 Erklärungen · 68 vertont · 0 ohne Audiodatei.

Die einzige Textquelle ist `ADA_TEXTE` in `dev/content.js`. `node dev/ada_audio.cjs` liest sie aus
dem gebauten Spiel und erzeugt `dev/ada_texte.json`. Alle Audiodateien verwenden dieselbe
Seraphina-Stimme, 24 kHz, Mono und eine Mundkurve mit 20 Werten je Sekunde.

## Erzeugung und Prüfung

```bash
powershell -ExecutionPolicy Bypass -File dev/assemble.ps1
node dev/ada_audio.cjs
python dev/ada_tts.py dev/ada_texte.json ada_dialog_v3 dev/ada_visemen.js
node dev/ada_doku.cjs
node dev/abschlusspruefung.cjs
```

Für einzelne geänderte Texte kann dem Python-Aufruf eine kommagetrennte Liste von IDs angehängt werden.
Danach werden die MP3-Dateien nach `publish_pages/ada_dialog_v3/` kopiert und beide Bestände per Hash verglichen.

## Verdrahtung der Entwicklungswege

| Ansicht | Ada-ID | Wiederholung | Geführte Spielweise |
| --- | --- | --- | --- |
| Forschungshütte · Überblick | `ort_forschung` | „Ada erklärt die Übersicht“ | automatisch beim ersten Öffnen |
| Forschungshütte · Forschungsbaum | `forschung_baum` | „Ada erklärt den Forschungsbaum“ | automatisch beim ersten Besuch |
| Forschungshütte · Meisterschaften | `forschung_meister` | „Ada erklärt die Meisterschaften“ | automatisch beim ersten Besuch |
| Forschungshütte · MCP-Werkstatt | `mcp_werkstatt` | „Ada erklärt die MCP-Werkstatt“ | automatisch beim ersten Besuch |
| Rechenhaus · Innenraum | `ort_rechenhaus` | „Ada erklärt den Innenraum“ | automatisch beim ersten Besuch |
| Rechenhaus · Energiegarten | `ort_energie` | „Ada erklärt den Energiegarten“ | automatisch beim ersten Besuch |
| Rechenhaus · Ausbauplan | `rechenhaus_ausbau` | „Ada erklärt den Ausbauplan“ | automatisch beim ersten Besuch |
| Rechenhaus · Trinkpause | `rechenhaus_trinkpause` | „Ada erklärt die Trinkpause“ | automatisch beim ersten Besuch |
| Rechenhaus · Hofansicht | `rechenhaus_hofansicht` | „Ada erklärt die Hofansicht“ | automatisch beim ersten Besuch |
| Rechenhaus · Hardware-Baum | `rechenhaus_hardware` | „Ada erklärt den Hardware-Baum“ | automatisch beim ersten Besuch |
| Rechenhaus · Strom-Baum | `rechenhaus_strom` | „Ada erklärt den Strom-Baum“ | automatisch beim ersten Besuch |

Die Kapitel 3 bis 5 der geführten Woche führen weiterhin in Forschung, Quantisierung und Agenten-Tools ein.
Die kontextbezogenen Erklärungen setzen diese Führung beim ersten Besuch der späteren Bereiche fort.
`adaAuto` merkt jeden gehörten Text im Spielstand; die sichtbaren Knöpfe spielen ihn jederzeit erneut ab.

## Vollständiger Dialogbestand

### hallo – Ich bin Ada!

Audio: `ada_dialog_v3/hallo.mp3` · Ziel: kein blinkendes Ziel

Hallo, ich bin Ada. Ich begleite dich auf deiner LLM FARM und erkläre dir immer nur den nächsten wichtigen Schritt. Während ich spreche, leuchtet der passende Knopf rot. Über meinen Kopf oben rechts kannst du mich jederzeit rufen, eine Erklärung wiederholen oder meine Stimme ausschalten.

### intro1 – Willkommen auf deinem Hof!

Audio: `ada_dialog_v3/intro1.mp3` · Ziel: kein blinkendes Ziel

Schön, dass du da bist! Im Schuppen steht ein Rechner mit einer RTX 4090 und 24 Gigabyte Grafikspeicher. Dort werden deine Modelle geladen, damit sie schnell arbeiten können. Wähle jetzt einen Hofnamen und dein Lieblingstier. Das ändert nur das Aussehen, nicht die Spielregeln.

### intro2 – Deine zwei Startmodelle

Audio: `ada_dialog_v3/intro2.mp3` · Ziel: kein blinkendes Ziel

Jetzt ziehen deine ersten beiden Modelle ein. Sie beruhen auf echten, offenen KI-Modellen mit bis zu vier Milliarden Parametern. Mehr Parameter bedeuten meist mehr Können, aber auch mehr Speicherbedarf. Kleine Modelle sind für den Anfang ideal, weil sie schnell und sparsam arbeiten. Wähle zwei aus, die gut zu deinem Hof passen.

### intro3 – Fokus, Schwierigkeit, Begleitung

Audio: `ada_dialog_v3/intro3.mp3` · Ziel: kein blinkendes Ziel

Fast geschafft! Mit dem Hof-Fokus erhältst du dauerhaft acht Prozent mehr Erlös für eine Auftragsart. Alle Schwierigkeitsstufen verwenden dieselben Regeln; nur die Menge der Hilfe ändert sich. Im behüteten Modus warne ich dich vor riskanten Entscheidungen. Die geführte Woche zeigt dir außerdem Schritt für Schritt die wichtigsten Grundlagen. Jedes Kapitel bleibt offen, bis du seine Aufgaben erfüllt hast.

### tag1 – Kapitel 1: Ankommen

Audio: `ada_dialog_v3/tag1.mp3` · Ziel: stall

Los geht es mit Kapitel eins! Öffne im Stall zuerst die Tierkarte eines Modells. Ich erkläre dir dort seine Werte, die möglichen Aktionen und die Auswahl der Rechnerbucht. Danach gehen wir in die Agentenwerkstatt, wo das Modell sein erstes Agenten-Tool bekommt, und dann zur Pinnwand, um die Eignung für einen Auftrag zu prüfen und die erste Arbeit zu starten. Das Kapitel bleibt offen, bis die Schritte geschafft sind.

### tag2 – Kapitel 2: Daten sind Futter

Audio: `ada_dialog_v3/tag2.mp3` · Ziel: futter

In Kapitel zwei geht es um Daten, das Futter deiner Tiere. In der Futterscheune siehst du deinen Vorrat und findest die Datenlese. Dort sortierst du gute und schlechte Textstücke und machst aus Rohdaten wertvolles Futter. Genau wie in der Wirklichkeit entscheidet die Qualität der Trainingsdaten stark über das Ergebnis. Kuratierte Daten brauchst du später auch für die Fachkurse in der Agentenwerkstatt.

### tag3 – Kapitel 3: Lernen lassen

Audio: `ada_dialog_v3/tag3.mp3` · Ziel: forschung

Zeit fürs Lernen! Erforsche in der Forschungshütte zuerst das Feintuning, also S F T, und danach das sparsame LoRA-Verfahren. Starte dann auf dem Trainingsplatz ein LoRA-Training mit Beispielen. Das braucht bei deinen Startmodellen weniger als vierundzwanzig Gigabyte und passt auf die Startkarte; volles S F T braucht dort noch zu viel Speicher. Dein Tier verbessert dabei dauerhaft eine Fähigkeit, ohne die ganze Basis neu zu trainieren.

Aussprachefassung für die Sprachausgabe:

Zeit fürs Lernen! Erforsche in der Forschungshütte zuerst das Feintuning, also Es-Ef-Te, und danach das sparsame LoRA-Verfahren. Starte dann auf dem Trainingsplatz ein LoRA-Training mit Beispielen. Das braucht bei deinen Startmodellen weniger als vierundzwanzig Gigabyte und passt auf die Startkarte; volles Es-Ef-Te braucht dort noch zu viel Speicher. Dein Tier verbessert dabei dauerhaft eine Fähigkeit, ohne die ganze Basis neu zu trainieren.

### tag4 – Kapitel 4: Werkstatt

Audio: `ada_dialog_v3/tag4.mp3` · Ziel: forschung

In Kapitel vier wird geschrumpft! Erforsche die Quantisierung und setze ein Tier in der Werkstatt auf Q4. Seine Gewichte brauchen dann ungefähr ein Drittel des bisherigen Speichers, und das Modell arbeitet etwa dreimal so schnell. Der gesamte Speicherbedarf sinkt weniger stark, weil Kontext und Laufzeitreserve bleiben. Bei kleinen Modellen kann Q4 außerdem merklich Qualität kosten.

Aussprachefassung für die Sprachausgabe:

In Kapitel vier wird geschrumpft! Erforsche die Quantisierung und setze ein Tier in der Werkstatt auf Ku-vier. Seine Gewichte brauchen dann ungefähr ein Drittel des bisherigen Speichers, und das Modell arbeitet etwa dreimal so schnell. Der gesamte Speicherbedarf sinkt weniger stark, weil Kontext und Laufzeitreserve bleiben. Bei kleinen Modellen kann Ku-vier außerdem merklich Qualität kosten.

### tag5 – Kapitel 5: Fachwissen

Audio: `ada_dialog_v3/tag5.mp3` · Ziel: geschirr

In Kapitel fünf wird dein Agent zum Fachmann. Erforsche in der Forschungshütte die Agentenwerkstatt, damit neben dem Basis-Tool auch Spezial-Tools bereitstehen. Buche dann in der Agentenwerkstatt einen Fachkurs, zum Beispiel den Grundkurs Datenschutz. Ein Kurs kostet Geld, kuratierte Daten und einen Arbeitstag, in dem das Modell ausfällt. Dafür steigt sein Fachwissen, das die gut bezahlten Zettel aus Praxis, Kanzlei und Steuerbüro verlangen.

### tag6 – Kapitel 6: Nacht und Wissen

Audio: `ada_dialog_v3/tag6.mp3` · Ziel: #tagknopf

Kapitel sechs verbindet Nacht und Wissen. Wenn du den Tag beendest, öffnet sich zuerst die Nachtplanung. Nachts kostet Netzstrom nur die Hälfte, deshalb lohnen sich dort lange Trainingsläufe. Nach der Nacht zeigt dir die Tagesplanung Wetter, erwartete Energie, offene Entscheidungen und Anliegen. Im Hofbuch oben rechts findest du außerdem jede Spielregel und alle wichtigen Formeln.

### tag7 – Kapitel 7: Gesellenprüfung

Audio: `ada_dialog_v3/tag7.mp3` · Ziel: jobs

Im letzten Kapitel zeigst du, was du gelernt hast! Schließe einen Auftrag ab, halte die Kasse im Plus und nutze die Nachtplanung. Wenn alle drei Ziele bis zu einer Abrechnung erfüllt sind, erhältst du das Gesellenabzeichen und hundertfünfzig Euro Prämie. Falls es nicht gleich klappt, bleibt die Prüfung ohne Strafe offen, bis du sie bestehst.

### geselle – Gesellenbrief!

Audio: `ada_dialog_v3/geselle.mp3` · Ziel: kein blinkendes Ziel

Geschafft, deine Gesellenprüfung ist bestanden! Das Abzeichen hängt jetzt am Hofhaus. Du kannst Modelle einsetzen, Daten pflegen, trainieren, quantisieren, Agenten ausrüsten, Fachkurse buchen und Energie planen. Ab jetzt gestaltest du den Hof selbst. Wenn du Hilfe brauchst, findest du mich jederzeit oben rechts.

### ort_stall – Der Stall

Audio: `ada_dialog_v3/ort_stall.mp3` · Ziel: kein blinkendes Ziel

Willkommen im Stall! Hier siehst du deine Tiere und alle Rechnerbuchten. Ein Tier in einer Bucht ist auf der Grafikkarte geladen und einsatzbereit. Tiere auf der Wiese ruhen und verbrauchen fast keinen Strom. Öffne eine Tierkarte, um Werte, Ausrüstung und passende Verbesserungen zu sehen.

### ort_futter – Die Futterscheune

Audio: `ada_dialog_v3/ort_futter.mp3` · Ziel: kein blinkendes Ziel

Die Futterscheune ist dein Datenlager. Hier liegen Webdaten, kuratierte Texte, Programmierdaten und Beispiele für Agenten. Hochwertiges Futter verbessert ein Training, ungeprüfte Daten können dagegen schaden. Mit der Datenlese kannst du Rohdaten selbst prüfen und veredeln. Kuratierte Daten sind außerdem das Lehrmaterial der Fachkurse in der Agentenwerkstatt.

### ort_jobs – Die Pinnwand

Audio: `ada_dialog_v3/ort_jobs.mp3` · Ziel: kein blinkendes Ziel

An der Pinnwand hängen die Aufträge deiner Kundschaft, von der Zimmerei bis zur Kanzlei. Jeder Zettel zeigt Arbeit, Bezahlung, Lieferfrist und besondere Chips: Team bis zwei, drei oder vier mit der geschätzten Dauer je Teamgröße, das Datenschutz-Risiko und das nötige Fachwissen. In der Einsatzplanung siehst du, welche Tiere passen und wie lange sie voraussichtlich brauchen. Beginne mit kleinen, grünen Aufträgen. Saubere Lieferungen bringen Sterne, Ruf und später bessere Zettel. Dorf-Anliegen und Hofprojekte sind freiwillige Ziele mit Prämie.

### ort_forschung – Die Forschungshütte

Audio: `ada_dialog_v3/ort_forschung.mp3` · Ziel: kein blinkendes Ziel

Die Forschungshütte bündelt vier Entwicklungswege. Forschung schaltet neue Verfahren frei. Meisterschaften geben deinem Hof dauerhafte Vorteile. In der MCP-Werkstatt verbindest du Agenten mit Werkzeugen und Datenquellen. Das Rechenhaus liefert die nötige Leistung und Energie. Deine Hofstufe ist der gemeinsame Ausgangspunkt. Wähle auf der Übersicht einen Ast; dort siehst du den aktuellen Fortschritt und gelangst zum passenden Detailbaum.

### forschung_baum – Der Forschungsbaum

Audio: `ada_dialog_v3/forschung_baum.mp3` · Ziel: kein blinkendes Ziel

Im Forschungsbaum arbeitest du dich von links nach rechts durch mehrere Fachrichtungen. Jeder Knoten zeigt ein echtes Verfahren, seine Kosten, die Forschungsdauer und seine Voraussetzungen. Grün ist bereits erforscht, Gold kann jetzt begonnen werden, und ein Schloss nennt dir die fehlende Vorstufe. Es läuft immer nur ein Forschungsprojekt gleichzeitig. Öffne deshalb zuerst den Knoten, dessen Wirkung du als Nächstes wirklich nutzen möchtest.

### forschung_meister – Die Meisterschaften

Audio: `ada_dialog_v3/forschung_meister.mp3` · Ziel: kein blinkendes Ziel

Mit jeder erreichten Hofstufe ab Stufe zwei erhältst du genau einen Meisterpunkt. Damit lernst du dauerhafte Vorteile in drei Wegen: Betreiber senkt Kosten und verbessert den Rechenbetrieb, Trainer stärkt Lernen und Zucht, Händler verbessert Preise und Kundenbeziehungen. Ab Hofstufe drei wählst du einen festen Meisterweg. Normale Fertigkeiten bleiben in allen Wegen erreichbar; nur die abschließende Meister-Fertigkeit gehört zu deinem gewählten Weg. Prüfe vor dem Kauf die Wirkung und die vorausgesetzte Fertigkeit.

### ort_training – Der Trainingsplatz

Audio: `ada_dialog_v3/ort_training.mp3` · Ziel: kein blinkendes Ziel

Auf dem Trainingsplatz verbessert dein Modell dauerhaft seine Werte. Wähle ein Verfahren, passendes Futter und die gewünschte Laufzeit. Training verändert die Gewichte und damit das Können des Modells. Ein Agenten-Tool gibt dagegen nur Werkzeuge hinzu, und Fachkurse für Recht, Medizin oder Datenschutz buchst du in der Agentenwerkstatt. Lange Läufe sind nachts wegen des halben Strompreises oft günstiger.

### ort_werkstatt – Die Diät-Werkstatt

Audio: `ada_dialog_v3/ort_werkstatt.mp3` · Ziel: kein blinkendes Ziel

In der Werkstatt verkleinerst du Modelle durch Quantisierung. Bei Q4 benötigen die Gewichte ungefähr ein Drittel des Speichers, und das Modell läuft etwa dreimal so schnell. Kontext und Laufzeitreserve bleiben jedoch bestehen, deshalb sinkt der Gesamtbedarf weniger stark. Katalogmodelle kannst du neu laden. Bei eigenen Zuchten ist ein Qualitätsverlust dagegen dauerhaft.

Aussprachefassung für die Sprachausgabe:

In der Werkstatt verkleinerst du Modelle durch Quantisierung. Bei Ku-vier benötigen die Gewichte ungefähr ein Drittel des Speichers, und das Modell läuft etwa dreimal so schnell. Kontext und Laufzeitreserve bleiben jedoch bestehen, deshalb sinkt der Gesamtbedarf weniger stark. Katalogmodelle kannst du neu laden. Bei eigenen Zuchten ist ein Qualitätsverlust dagegen dauerhaft.

### ort_zucht – Die Zuchtstation

Audio: `ada_dialog_v3/ort_zucht.mp3` · Ziel: kein blinkendes Ziel

In der Zuchtstation verschmilzt du die Gewichte von zwei oder drei Modellen derselben Familie. Ein Wurf bringt ein bis drei Kinder, die Stärken der Eltern erben können. Merkmale vererben sich mit der angezeigten Wahrscheinlichkeit, und das Stammbuch zeigt Eltern, Geschwister und Linie. Vergleiche danach Werte, Speicherbedarf und Betriebskosten. Wenn das Kind mehr Leistung pro Euro erreicht, war die Zucht besonders erfolgreich.

### ort_geschirr – Die Agentenwerkstatt

Audio: `ada_dialog_v3/ort_geschirr.mp3` · Ziel: kein blinkendes Ziel

In der Agentenwerkstatt machst du aus Modellen Agenten und bildest sie aus. Das Basis-Tool funktioniert vom ersten Tag an mit jedem Modell; Spezial-Tools kommen mit der Forschung. Ich empfehle je Modell das passende Agenten-Tool nach Zweck und Eignung. Hier buchst du auch Fachkurse: Grundkurs, Aufbaukurs und Fachzertifikat je Fachgebiet kosten Geld, kuratierte Daten und Tage, in denen das Modell ausfällt, und erhöhen sein Fachwissen. Agenten mit demselben Tool arbeiten als eingespieltes Team. Tools mit Schutzfunktionen halbieren außerdem das Datenschutz-Risiko.

### ort_markt – Der Viehmarkt

Audio: `ada_dialog_v3/ort_markt.mp3` · Ziel: kein blinkendes Ziel

Auf dem Viehmarkt kaufst du Modelle und Hardware. Die Tiere sind echten, offenen KI-Modellen mit ihren Größen und Lizenzen nachempfunden. Prüfe vor dem Kauf, ob das Modell in den Grafikspeicher deiner Rechner passt. Der Effizienzindex zeigt dir, wie viel Leistung du für die laufenden Kosten erhältst. Neu im Katalog ist die Nadel: ein Werkzeugmodell mit fünfundvierzig Millionen Parametern in vierzehn Megabyte, das nur sortieren und Felder ziehen kann, und der Raspberry Pi als Kleinstrechner allein für sie.

### ort_cloud – Die Cloud-Voliere

Audio: `ada_dialog_v3/ort_cloud.mp3` · Ziel: kein blinkendes Ziel

In der Cloud-Voliere mietest du Modelle über eine API. Du brauchst dafür keine eigene Grafikkarte, bezahlst aber jeden Ein- und Ausgabetext in Token. Cloud-Tiere sind sofort verfügbar und oft sehr stark. Bei dauerhafter Arbeit können die Kosten jedoch schnell steigen. Leih-Tiere dürfen keine Zettel mit Datenschutzpflicht bearbeiten und lassen sich nicht schulen. Vergleiche deshalb Miete und Eigenbetrieb.

### ort_leitstand – Der Hof-Leitstand

Audio: `ada_dialog_v3/ort_leitstand.mp3` · Ziel: kein blinkendes Ziel

Im Hof-Leitstand verwaltest du die Arbeitsumgebungen deiner Tiere. Die Ausbaustufen reichen von einfachen Agenten-Tools bis zu Systemen für ganze Aufgabenketten. Hier siehst du, wie einzelne Helfer zu einem abgestimmten Betrieb werden. Baue nur aus, was deine Aufträge wirklich benötigen.

### ort_energie – Strom und Energie

Audio: `ada_dialog_v3/ort_energie.mp3` · Ziel: kein blinkendes Ziel

Strom ist auf deinem KI-Hof ein echter Kostenfaktor. Der Netzanschluss begrenzt, was gleichzeitig laufen darf, und kostet einen Grundpreis je Kilowatt; eigene Erzeugung bringt einen Eigenbonus. Nachts kostet Netzstrom die Hälfte. Solar hängt von Sonne, Jahreszeit und Wetter ab, Wind von der Windstärke: Sturm legt kleine Windräder still, Nebel dämpft die Sonne, ein Hitzetag kostet Kühlung. Ein Kraftwerk liefert zuverlässig, verursacht aber Brennstoffkosten. Die Strom-Leiste zeigt, was noch in den Anschluss passt und was sich jetzt lohnt.

### ort_rechenhaus – Das Rechenhaus

Audio: `ada_dialog_v3/ort_rechenhaus.mp3` · Ziel: kein blinkendes Ziel

Das Rechenhaus ist das technische Herz des Hofes. Im Innenraum stellst du Rechner und später Serverschränke auf. Der Energiegarten zeigt Erzeugung, Speicher, Last und Kosten. Der Ausbauplan erweitert Gebäude und Netzanschluss. Hardware- und Strom-Baum ordnen alle Anschaffungen nach Voraussetzung und Preis. Neue Hardware braucht immer einen freien Stellplatz und genügend Anschlussleistung. Prüfe deshalb beides vor jedem Kauf.

### rechenhaus_ausbau – Der Ausbauplan

Audio: `ada_dialog_v3/rechenhaus_ausbau.mp3` · Ziel: kein blinkendes Ziel

Der Ausbauplan zeigt die drei Gebäudestufen und alle Schritte bis zum nächsten Abschnitt. Ein größeres Gebäude schafft andere Stellplätze, mehr Dachfläche und eine bessere Kühlung, kostet aber viel Geld. Vor einem Umbau müssen belegte Rechner frei sein. Geräte, für die danach kein Platz mehr vorgesehen ist, wandern ins Lager und bleiben dein Eigentum. Die Anschlussereignisse darunter legen fest, wann zusätzliche Rechner oder Server ans Netz dürfen.

### rechenhaus_trinkpause – Die Trinkpause

Audio: `ada_dialog_v3/rechenhaus_trinkpause.mp3` · Ziel: kein blinkendes Ziel

An der Tränke beginnt ein freies Modell eine neue Sitzung. Dabei verschwindet nur der flüchtige Gesprächskontext. Fähigkeiten, Modellgewichte, Adapter, Fachwissen und gespeicherte Notizen bleiben erhalten. Informationen aus der alten Unterhaltung stehen danach aber nicht mehr automatisch bereit. Eine Gedächtnisfunktion im Agenten-Tool kann wichtige Notizen wieder abrufen; sie ist nicht dasselbe wie ein großes Kontextfenster. Während eines Auftrags ist keine Trinkpause möglich.

### rechenhaus_hofansicht – Die Hofansicht

Audio: `ada_dialog_v3/rechenhaus_hofansicht.mp3` · Ziel: kein blinkendes Ziel

In der Hofansicht wählst du eine andere gezeichnete Wiese für deinen Modellhof. Das verändert nur das Aussehen. Gebäudeplätze, Teich, Wege, Wetter, Energieertrag und alle Spielwerte bleiben gleich. Du kannst die Ansicht deshalb jederzeit nach Geschmack wechseln, ohne deinen Ausbau oder eine laufende Arbeit zu beeinflussen.

### rechenhaus_hardware – Der Hardware-Baum

Audio: `ada_dialog_v3/rechenhaus_hardware.mp3` · Ziel: kein blinkendes Ziel

Der Hardware-Baum ordnet Rechner, Gebäudeausbau und Serverkarten in gemeinsame Preisstufen. Grün steht bereits auf deinem Hof, Gold ist mit dem aktuellen Ausbau und Kassenstand erreichbar, und ein Schloss zeigt eine fehlende Voraussetzung. Ein ausgewählter Knoten erklärt, wo du ihn kaufst. Achte zusätzlich auf freien Grafikspeicher, Arbeitsspeicher, Stellplatz und Anschlussleistung: Ein freigeschalteter Rechner passt nicht automatisch in jedes Gebäude oder Stromnetz.

### rechenhaus_strom – Der Strom-Baum

Audio: `ada_dialog_v3/rechenhaus_strom.mp3` · Ziel: kein blinkendes Ziel

Der Strom-Baum zeigt den Weg vom Netzanschluss zu Solar, Akku, Wind und Kraftwerk. Grün ist vorhanden, Gold ist jetzt bezahlbar, und ein Schloss verweist auf eine fehlende Hofstufe, Gebäudestufe oder Geld. Die Tafel dient zur Planung; gekauft wird im Energiegarten oder Ausbauplan. Solar senkt tagsüber den Netzbezug, ein Akku verschiebt Energie, Wind liefert wetterabhängig und ein Kraftwerk bietet planbare Reserve mit Brennstoffkosten.

### ort_arena – Die Festwiese

Audio: `ada_dialog_v3/ort_arena.mp3` · Ziel: kein blinkendes Ziel

Die Festwiese öffnet ab Hofstufe drei. Dort treten deine Tiere in Wissen, Rechnen und Programmieren gegeneinander an. Diese Wettbewerbe bilden die Benchmarks der KI-Welt ab. Am fünfundzwanzigsten Tag findet außerdem die Dorfmeisterschaft statt. Dort zählt die Leistung deines besten Teams, und du kannst Prämien und Ruhm gewinnen.

### ort_agentenwelt – Die Agenten-Welt

Audio: `ada_dialog_v3/ort_agentenwelt.mp3` · Ziel: kein blinkendes Ziel

Die Agenten-Welt ist das Übungsgelände für Werkzeugaufgaben. Dein Tier lernt dort, Nachrichten zu lesen, Formulare auszufüllen und Dateien zu sortieren. Ein Lehrermodell prüft jeden Versuch und belohnt nur nachweisbar richtige Ergebnisse. Das kostet Strom und Lehrertoken, verbessert aber dauerhaft die Werkzeugfähigkeit.

### ort_dorfplatz – Der Dorfplatz

Audio: `ada_dialog_v3/ort_dorfplatz.mp3` · Ziel: kein blinkendes Ziel

Auf dem Dorfplatz warten täglich fünf kurze Lernspiele. Du übst Tokenkosten, versteckte Anweisungen, Temperatureinstellungen, Speicherplanung und den Vergleich mit der Cloud. Greift ein Hacker deinen Hof an, spielst du hier Vier gewinnt gegen ihn: Ein Sieg bringt eine Prämie, eine Niederlage kostet den betroffenen Kunden. Jede richtige Runde bringt einen Tagesbonus, und regelmäßiges Spielen bringt Serien und Abzeichen.

### ort_hofhaus – Das Hofhaus

Audio: `ada_dialog_v3/ort_hofhaus.mp3` · Ziel: kein blinkendes Ziel

Im Hofhaus verwaltest du Hofnamen, Wappentier, Schwierigkeit, Abzeichen und Chronik. Hier findest du das Kassenbuch, die aktiven Ereignisse mit ihren Entscheidungen und nach einer Hofschließung den Neustart. Du kannst deinen Spielstand als Datei sichern oder auf ein anderes Gerät mitnehmen. Meine Stimme lässt sich ebenfalls hier oder direkt in der Sprechblase ausschalten.

### ort_hofbuch – Das Hofbuch

Audio: `ada_dialog_v3/ort_hofbuch.mp3` · Ziel: kein blinkendes Ziel

Das Hofbuch ist dein vollständiges Regelwerk. Es wird direkt aus den Spieldaten erzeugt. Modelle, Forschung, Preise und Formeln entsprechen deshalb genau der laufenden Simulation. Wenn dir etwas unklar ist, findest du dort zuerst die häufigsten Fragen und danach alle Details.

### hilfe_stack – Warum geht der Tausch nicht?

Audio: `ada_dialog_v3/hilfe_stack.mp3` · Ziel: kein blinkendes Ziel

Hier greift eine vereinfachte Hofregel. Mit reinem llama.cpp ist pro Bucht und Tag nur ein Modellwechsel vorgesehen, damit Lade- und Rüstzeit sichtbar bleiben. Ollama oder LM Studio heben diese Grenze im Spiel auf. Die Programme selbst sind kostenlos; der Spielpreis steht für Einrichtung und Betreuung. Der passende Knopf leuchtet gerade rot.

Aussprachefassung für die Sprachausgabe:

Hier greift eine vereinfachte Hofregel. Mit reinem llama C P P ist pro Bucht und Tag nur ein Modellwechsel vorgesehen, damit Lade- und Rüstzeit sichtbar bleiben. Ollama oder L M Studio heben diese Grenze im Spiel auf. Die Programme selbst sind kostenlos; der Spielpreis steht für Einrichtung und Betreuung. Der passende Knopf leuchtet gerade rot.

### hilfe_vram – Das Modell passt nicht

Audio: `ada_dialog_v3/hilfe_vram.mp3` · Ziel: kein blinkendes Ziel

Keine Sorge, zu wenig Grafikspeicher ist ein häufiger Stolperstein. Der Bedarf besteht aus Modellgewichten, Textzwischenspeicher und Laufzeitreserve. Du kannst eine sparsamere Quantisierung wählen, ein kleineres Modell einsetzen oder eine Karte mit mehr Speicher kaufen. Ein Überhang darf in den Arbeitsspeicher ausweichen, macht das Modell aber deutlich langsamer.

### ort_kompendium – Das Kompendium

Audio: `ada_dialog_v3/ort_kompendium.mp3` · Ziel: kein blinkendes Ziel

Das Kompendium ist die kleine KI-Schule deines Hofes. Dort findest du Wissenskarten über Trainingsverfahren, Grafikkarten, Energie und viele weitere Themen. Die Karten erklären die wirkliche Technik, unabhängig von den Spielregeln. Du kannst sie jederzeit in Ruhe nachlesen.

### hilfe_hofsprecher – Der Hofsprecher

Audio: `ada_dialog_v3/hilfe_hofsprecher.mp3` · Ziel: kein blinkendes Ziel

Mit dem Hofsprecher kannst du den Hof in ganzen Sätzen steuern. Das deutsche Wörterbuch arbeitet sofort, exakt und offline. Die Nadel ist ein zusätzliches kleines Modell im Browser und versteht besonders englische Formulierungen. Vor jeder Änderung zeige ich dir eine Vorschau; erst wenn du auf Machen drückst, wird sie ausgeführt. Ohne Schlüssel beantworte ich Fragen außerdem aus dem Hofbuch, mit Live-Zahlen zu Wetter, Kasse und Zetteln oder mit der passenden Regelstelle.

### wetter_planung – Wetter und Tagesplanung

Audio: `ada_dialog_v3/wetter_planung.mp3` · Ziel: kein blinkendes Ziel

Nach jeder Nacht siehst du die Wettervorhersage für den neuen Tag. Sonne und Wolken bestimmen den Solarertrag, die Windstärke bestimmt den Ertrag deiner Windräder. Sturm legt kleine Windräder still, Nebel dämpft die Sonne, ein Hitzetag kostet Kühlung. Das Wetter ist je Hof gewürfelt, die Vorhersage im Spiel aber exakt. Plane große Aufträge und Trainings passend zur verfügbaren Energie. Wenn es regnet, ziehen dieselben Regenwolken sichtbar über die Farm.

### zettelschmiede – Zettelschmiede und Kundschaft

Audio: `ada_dialog_v3/zettelschmiede.mp3` · Ziel: kein blinkendes Ziel

Die Zettelschmiede holt Aufträge aus über fünfzig echten Berufen in zwanzig Sektoren, von der Zimmerei über den Imbiss bis zur Kanzlei und Klinik. Sie erfindet Betriebe, Orte und Anliegen aus geprüften Bausteinen; Wendungen stehen sichtbar auf dem Zettel. Anforderungen, Fristen, Chancen und Geld berechnet weiterhin die Simulation, kein Sprachmodell darf diese Zahlen erfinden. Eine Nadel im Stall sortiert den Posteingang vor und hängt einen zusätzlichen passenden Zettel aus. Komplexe Zettel sind Teamarbeit, sensible Zettel verlangen Fachwissen.

### hofpost – Die Hofpost

Audio: `ada_dialog_v3/hofpost.mp3` · Ziel: kein blinkendes Ziel

Die Hofpost fasst morgens Wetter, Kundschaft und besondere Chancen zusammen. Feststehende Dinge erscheinen als Nachricht. Unsichere Hinweise sind immer ausdrücklich als Gerücht gekennzeichnet und müssen nicht eintreffen. Auch neue Dorf-Anliegen und anstehende Entscheidungen meldet der Morgenbericht. So kannst du planen, ohne eine Vermutung mit einer festen Regel zu verwechseln.

### training_analyse – Training auswerten

Audio: `ada_dialog_v3/training_analyse.mp3` · Ziel: kein blinkendes Ziel

Nach jedem Training vergleicht das Zeugnis die Werte vor und nach dem Lauf. Das Netzdiagramm zeigt Zugewinne, Verluste und mögliche Risiken. Darunter findest du den größten Fortschritt und passende nächste Schritte. Alle Werte stammen direkt aus dem abgeschlossenen Training.

### quest_freiwillig – Freiwillige Hofprojekte

Audio: `ada_dialog_v3/quest_freiwillig.mp3` · Ziel: kein blinkendes Ziel

Hofprojekte sind freiwillige Ziele für eine Spielwoche, die du selbst wählst. Dazu kommen Dorf-Anliegen: Alle fünf Tage schreibt ein Betrieb aus dem Umland einen Bittbrief mit klarem Ziel, Frist und Prämie. Wenn du ein Ziel erreichst, bekommst du Geld und Ruf. Wenn es nicht klappt, entsteht keine Strafe, und du kannst in der nächsten Woche neu wählen.

### start_tierkarte – Deine erste Tierkarte

Audio: `ada_dialog_v3/start_tierkarte.mp3` · Ziel: #ada-tierwerte

Hier lernst du dein Modell kennen. Das Netzdiagramm und die Balken zeigen Fähigkeiten wie Wissen, Logik, Code, Stil und Werkzeugnutzung. Die Kacheln darunter zeigen Tempo, Tagesleistung, Speicherbedarf und laufende Kosten. Grün und hohe Werte sind hilfreich, aber für einen Auftrag zählen immer dessen konkrete Anforderungen.

### start_tieraktionen – Was du mit dem Modell tun kannst

Audio: `ada_dialog_v3/start_tieraktionen.mp3` · Ziel: #ada-bucht-zuweisen

Unter den Werten findest du die möglichen Aktionen. Du kannst das Modell später trainieren, ausrüsten, auffrischen, quantisieren oder verkaufen. Jetzt ist zuerst die Rechnerbucht wichtig, denn ein Modell auf der Wiese kann nicht arbeiten. Drücke auf Bucht zuweisen; der Knopf leuchtet rot.

### start_buchtwahl – Rechnerbucht und Grafikkarte wählen

Audio: `ada_dialog_v3/start_buchtwahl.mp3` · Ziel: #ada-buchtliste

Jede Bucht gehört zu einer echten Grafikkarte im Rechenhaus. Vergleiche den Speicherbedarf deines Modells mit dem Grafikspeicher der Karte. Ein grüner Eintrag passt vollständig. Bei einer Warnung wird ein Teil in den Arbeitsspeicher ausgelagert und das Modell arbeitet deutlich langsamer.

### start_bucht_fertig – Das Modell ist einsatzbereit

Audio: `ada_dialog_v3/start_bucht_fertig.mp3` · Ziel: jobs

Sehr gut, dein Modell ist jetzt auf der ausgewählten Grafikkarte geladen. Damit kann es Aufträge bearbeiten und später auch trainieren. Als Nächstes gehen wir in die Agentenwerkstatt, wo das Modell sein Agenten-Tool bekommt. Der passende Knopf im Dorf leuchtet rot.

### start_pinnwand – Den ersten Auftrag finden

Audio: `ada_dialog_v3/start_pinnwand.mp3` · Ziel: #ada-erster-job

Auf der Pinnwand siehst du Bezahlung, Arbeitsmenge, Frist und benötigte Fähigkeiten. Für den ersten Auftrag suche ich dir einen grünen Vorschlag aus, den ein geladenes Modell bewältigen kann. Öffne diesen Vorschlag und prüfe trotzdem alle Angaben. Ein hoher Lohn allein macht einen Auftrag noch nicht passend.

### start_eignung – Ist dein Modell geeignet?

Audio: `ada_dialog_v3/start_eignung.mp3` · Ziel: #ada-eignung

Hier wird jede Anforderung direkt mit den aktuellen Modellwerten verglichen. Grün bedeutet erfüllt; rote Zeilen nennen genau, was fehlt. Bei Zetteln aus Praxis, Kanzlei oder Steuerbüro stehen hier auch das nötige Fachwissen und das Datenschutz-Risiko. Achte zusätzlich auf Qualitätschance, benötigte Stunden und Lieferfrist. Teile erst ein Modell ein, wenn alle Stufen grün sind und genug Zeit bleibt.

### start_zusage – Die Zusage noch einmal prüfen

Audio: `ada_dialog_v3/start_zusage.mp3` · Ziel: #ada-zusage

Dein Modell ist jetzt eingeteilt. In der Zusammenfassung stehen Qualitätschance, geschätzte Arbeitszeit und das verfügbare Fristbudget. Grün bedeutet Reserve, Gelb ist knapp und Rot warnt vor einem wahrscheinlichen Fristbruch. Bei komplexen Zetteln wählst du oben die Teamgröße, und die Tabelle zeigt die Dauer je Anzahl der Agenten. Wenn alles passt, drücke auf Verbindlich übernehmen.

### start_auftrag_laeuft – Der erste Auftrag läuft

Audio: `ada_dialog_v3/start_auftrag_laeuft.mp3` · Ziel: #ada-erster-lauf

Geschafft, dein erster Auftrag läuft! Das Modell bleibt während der Arbeit belegt, und der Fortschrittsbalken zeigt die erledigte Arbeitsmenge. Ist es schnell genug, kann der Auftrag noch heute fertig werden; sonst arbeitet es am nächsten Hoftag weiter. Bei der Abnahme erhältst du Geld, Erfahrung und eine Kundenbewertung.

### start_geschirr – Vom Modell zum Agenten: das Agenten-Tool

Audio: `ada_dialog_v3/start_geschirr.mp3` · Ziel: geschirr

Sehr gut, dein Modell ist geladen. Bevor wir zur Pinnwand gehen, kommt ein Schritt, der später über die besten Aufträge entscheidet: die Agentenwerkstatt. Ein Agenten-Tool ist die Arbeitsumgebung eines Modells. Es gibt ihm Werkzeuge, ein festes Ausgabeformat und mehrere Handlungsschritte. Erst damit wird aus einem Modell ein Agent, der E-Mails ablegt, Formulare ausfüllt oder Tickets löst. Das Basis-Tool funktioniert mit jedem Modell und kostet nichts. Die Eignungsmatrix zeigt in Grün, welche Kombination gut funktioniert. Wähle nach Zweck: für Code ein Coding-Tool, für Büro und Support ein leichtes Tool. Zettel mit Patientendaten, Akten oder Personalunterlagen verlangen Fachwissen aus Kursen. Ein Agenten-Tool mit Schutzfunktionen ersetzt dieses Fachwissen nicht, halbiert aber das verbleibende Datenschutz-Risiko. Der Knopf zur Agentenwerkstatt leuchtet rot.

### start_geschirr_fertig – Dein Modell ist ein Agent

Audio: `ada_dialog_v3/start_geschirr_fertig.mp3` · Ziel: jobs

Prima, dein Modell verwendet jetzt ein Agenten-Tool und darf Agenten-Zettel annehmen. Merke dir: Mehrere Agenten mit demselben Tool arbeiten als eingespieltes Team. Bei komplexen Aufträgen zeigt die Pinnwand, wie viele Tage ein, zwei oder drei Agenten brauchen. Jetzt zur Pinnwand, der Knopf leuchtet rot.

### team_agenten – Agenten-Teams

Audio: `ada_dialog_v3/team_agenten.mp3` · Ziel: kein blinkendes Ziel

Komplexe Zettel tragen den Chip Team bis zwei, drei oder vier. Dort dürfen mehrere Agenten gleichzeitig arbeiten. Die Arbeit teilt sich, aber Abstimmung kostet: je weiterem Agenten zehn Prozent mehr Arbeit, mit demselben Tool nur fünf. Aus vier Tagen werden so mit zwei Agenten gut zwei Tage, mit dreien gut anderthalb. Die Zettelkarte rechnet das mit deinen schnellsten freien Agenten vor. Die Teamgröße wählst du oben auf dem Einsatzblatt.

### datenschutz – Datenschutz auf dem Hof

Audio: `ada_dialog_v3/datenschutz.mp3` · Ziel: kein blinkendes Ziel

Zettel aus Medizin, Recht, Steuern, Personal und Pflege enthalten Daten echter Menschen. Wer sie mit ungeschulten Modellen oder über Leih-Tiere in der Cloud bearbeitet, riskiert einen Verstoß mit Strafe, Rufverlust und einer Abmahnung der Aufsicht. Im normalen Hofalltag und im Marktbetrieb wird der Hof nach der zweiten Abmahnung geschlossen, im behüteten Spiel nach der dritten. Schutz beginnt mit echter Ausbildung: In der Agentenwerkstatt buchst du Kurse je Fachgebiet, vom Grundkurs bis zum Fachzertifikat. Agenten-Tools mit Rechtebegrenzung sowie die Forschung „Schutzregeln“ senken das verbleibende Risiko, ersetzen das verlangte Fachwissen aber nicht. Erst neunzig Punkte Fachwissen im Datenschutz beseitigen das Verstoßrisiko vollständig. Diese Zettel zahlen deutlich mehr, sodass sich Kurse nach wenigen Aufträgen rechnen.

### abmahnung – Abmahnung der Aufsicht

Audio: `ada_dialog_v3/abmahnung.mp3` · Ziel: geschirr

Das war ein Datenschutz-Verstoß. Die Aufsicht hat eine Abmahnung ausgesprochen. Im normalen Hofalltag und im Marktbetrieb schließen zwei Abmahnungen den Hof, im behüteten Spiel drei. Was jetzt hilft: Schule die Modelle, die Akten oder Befunde bearbeiten, in der Agentenwerkstatt im Fachgebiet Datenschutz. Weise ihnen ein Agenten-Tool mit Schutzfunktionen zu und setze für solche Zettel keine Leih-Tiere ein. Das Tool halbiert nur das verbleibende Risiko; vollständig verschwindet es erst ab neunzig Punkten Fachwissen im Datenschutz. Die Agentenwerkstatt leuchtet rot.

### tagesplanung – Die Tagesplanung

Audio: `ada_dialog_v3/tagesplanung.mp3` · Ziel: kein blinkendes Ziel

Nach jeder Nacht beginnt der Tag mit der Tagesplanung. Oben stehen das Wetter von heute und morgen mit Solar- und Windfaktor, darunter die erwartete Energie aus Sonne und Wind, dein Bedarf für Tag und Nacht, der Netzbezug in Kilowattstunden und Euro und der Akkustand. Dann folgen offene Entscheidungen, Dorf-Anliegen und die Zahl der offenen Zettel. Von hier springst du zur Pinnwand, zur Energieplanung oder ins Rechenhaus.

### ereignis_entscheidung – Ereignisse mit Entscheidung

Audio: `ada_dialog_v3/ereignis_entscheidung.mp3` · Ziel: kein blinkendes Ziel

Manche Ereignisse stellen dich vor eine Wahl, etwa wenn die Kühlung leckt oder das Dorfradio ein Interview will. Jede Option nennt vorher ihre Zahlen: Geld, Ruf, Erfahrung, Daten oder eine Folgewirkung mit Dauer. Du entscheidest im Morgenbericht oder im Hofhaus. Wer bis zum Tagesende nicht entscheidet, bekommt die Standard-Option. Es gibt keine versteckten Würfel: Was auf der Karte steht, passiert.

### anliegen – Dorf-Anliegen

Audio: `ada_dialog_v3/anliegen.mp3` · Ziel: kein blinkendes Ziel

Ab dem dritten Hoftag schreibt alle fünf Tage ein Betrieb aus dem Umland einen Bittbrief: zum Beispiel drei saubere Textzettel, zwei Nächte mit Zusatzarbeit oder eine bestimmte Menge Eigenenergie. Jedes Anliegen hat sechs Tage Frist und eine Prämie mit Ruf. Höchstens zwei sind gleichzeitig offen, und nichts davon ist Pflicht: Ein verfallenes Anliegen kostet nichts.

### fachbildung – Fachbildung

Audio: `ada_dialog_v3/fachbildung.mp3` · Ziel: kein blinkendes Ziel

Fachwissen misst je Gebiet von null bis hundert, wie erfahren ein Modell in Datenschutz, Medizin, Recht, Steuern, Personal oder Versicherung ist. Kurse in der Agentenwerkstatt sind Trainingsläufe: Der Grundkurs dauert einen Tag, der Aufbaukurs zwei, das Fachzertifikat drei. Jeder Kurs kostet Geld und kuratierte Daten, größere Modelle zahlen mehr, und das Modell fällt solange aus. Mit erforschten Verfahren wählst du die Technik: SFT lernt gründlicher, LoRA ist schneller und QLoRA billiger. DPO ist nur für Datenschutz-Kurse wählbar und erhöht dort den Wissensgewinn; allein ist es kein Schutz. Saubere Zettel im Gebiet bringen Praxis dazu. Die Zettel verlangen ein Mindest-Fachwissen, das mit den Hoftagen steigt, und zahlen dafür deutlich mehr.

### nadel – Die Nadel

Audio: `ada_dialog_v3/nadel.mp3` · Ziel: kein blinkendes Ziel

Die Nadel ist ein echtes Modell namens Needle zwei: fünfundvierzig Millionen Parameter in vierzehn Megabyte, achtundzwanzig Megabyte Arbeitsspeicher, ein Fenster von zweihundertsechsundfünfzig Token. Sie kann genau eines: aus Text einen Werkzeugaufruf oder ein Datenfeld machen. Sie schreibt keine Texte, weiß nichts und versteht Englisch besser als Deutsch. Auf dem Hof sortiert sie Mikro-Zettel und den Posteingang, läuft auf einem Raspberry Pi für hundertzwanzig Euro und steuert als Hofsprecher deinen Hof in ganzen Sätzen. Alle Zahlen stammen von der Modellkarte des Herstellers.

### hof_geschlossen – Der Hof ist geschlossen

Audio: `ada_dialog_v3/hof_geschlossen.mp3` · Ziel: kein blinkendes Ziel

Die Datenschutzaufsicht hat deinem Hof nach der letzten Abmahnung die Betriebserlaubnis entzogen. Das ist hart, aber im echten Leben endet so mancher kleine Dienstleister. Die Lehre: Wer Daten echter Menschen verarbeitet, braucht geschulte Modelle, Agenten-Tools mit Sandbox, Rechtebegrenzung und Prüfprotokoll, keine Leih-Tiere für Akten und Befunde sowie klare Schutzregeln. Hier oder im Hofhaus kannst du neu anfangen, und diesmal weißt du, worauf es ankommt.

### meisterbrief – Der Hofmeisterbrief

Audio: `ada_dialog_v3/meisterbrief.mp3` · Ziel: #tagknopf

Der Hof hat ein Ziel, und dorthin führen fünf Wege: eine Zuchtlinie über drei Generationen, ein Rechenpark mit eigenem Strom, ein vollständig ausgebauter Forschungsbaum, ein Handelshaus mit hundert sauberen Aufträgen oder ein Fachhaus mit drei Zertifikaten und keiner einzigen Abmahnung. Zwei davon und Hofstufe zehn bringen dir den Hofmeisterbrief. Alle fünf und Hofstufe zwölf machen dich zur Legende. Gespielt wird danach weiter – der Brief hängt im Hofhaus, und die Ehre bleibt.

### mcp_werkstatt – Die MCP-Werkstatt

Audio: `ada_dialog_v3/mcp_werkstatt.mp3` · Ziel: kein blinkendes Ziel

Ein Agent ist nur so gut wie seine Anschlüsse. Das Model Context Protocol ist der offene Standard dafür: Dein Agenten-Tool ist der Host, jeder Dienst ein Server mit Werkzeugen, Datenquellen und Vorlagen. In der MCP-Werkstatt schließt du sie Knoten für Knoten an – die Leitung zuerst, dann Datei, Post, Buchhaltung und Netz. Und vergiss die Sicherheit nicht: Eine vergiftete Werkzeugbeschreibung ist Text, den dein Modell liest. Freigabeliste, Sandkasten und Prüfprotokoll halten den Schaden klein.

### hofuhr – Die Hofuhr und das Warten

Audio: `ada_dialog_v3/hofuhr.mp3` · Ziel: kein blinkendes Ziel

Die Hofuhr läuft von sechs bis zweiundzwanzig Uhr. Ein Zettel bindet ein Modell nur so lange, wie seine Arbeit dauert: Ist ein Auftrag nach vier Stunden fertig, wird er sofort abgenommen und bezahlt, und das Modell ist wieder frei für den nächsten Zettel. Mit dem Warten-Knopf in der Hofleiste spulst du eine Stunde, bis zur nächsten Abnahme oder bis Feierabend vor. Wer den Tag früh beendet, lässt laufende Aufträge weiterarbeiten, aber freie Modelle stehen bis morgen still, und die Dorfplatz-Spiele des Tages verfallen. Die Nachtplanung zeigt dir vorher, wie viel dadurch liegen bleibt.
