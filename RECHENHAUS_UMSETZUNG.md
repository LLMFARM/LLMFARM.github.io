# Rechenhaus und Trinkpause

Stand: 01.09.2026 (Ära 7.5). Die spielbare Einzeldatei ist `modellhof_game.html`. Keine Installation und kein API-Schlüssel nötig. Vorherigen Stand sichern; bestehende Browser-Spielstände werden erhalten.

## Bedienung

- Links auf der Wiese das **Rechenhaus** anklicken; alternativ die neue Hof-Kachel verwenden.
- Im **Innenraum** einen PC- oder Schrankplatz anklicken. Rechts erscheinen Hardware, Kaufpreis, Belegung und fehlende Bedingungen.
- Der **Ausbauplan** zeigt Gebäudewechsel und alle Anschlussereignisse. Der **Energiegarten** enthält Anlagenkäufe, Stundenbilanz, Kosten, monatliche Nachbarverbindlichkeit und Amortisationsschätzung.
- Unter **Trinkpause** ein freies Tier zum Teich schicken. Tiere gehen auch selbstständig in unregelmäßigen Abständen trinken. Laufende Arbeiten werden dafür nicht unterbrochen.
- Unter **Hofansicht** zwischen Originalwiese, Morgenwiese, Blumenwiese und Spätsommerwiese wählen. Die Auswahl bleibt gespeichert und verändert keine Simulationswerte.

## Umgesetzte Grenzen

| Stufe | Hardwareplätze | Solar | Speicher |
|---|---|---|---|
| Geräteschuppen | 12 PCs, je eine GPU | 4 × 400 W | bis 10 kWh |
| Nerdtempel | 6 PCs und 8 Schränke | 6 × 600 W; Altmodule bleiben 400 W bis zum Upgrade | bis 80 kWh |
| Rechenzentrum | 8 Reihen × 8 Schränke | 10 × 600 W auf dem Dach; bis 6 separate Felder mit je 4 × 600 W | bis 600 kWh |

PUE je Stufe: 1,45 (Geräteschuppen, ohne Kühlkonzept) · 1,25 (Nerdtempel) · 1,12 (Rechenzentrum). Grundlast: 0,025 / 0,10 / 1,20 kW; im Rechenzentrum kommen 0,06 kW je belegtem Schrank hinzu.

Ein neuer Hof startet mit **RTX 4090 24 GB (gebraucht)**, Ryzen 7, 32 GB DDR5 und 2 TB NVMe. Die maximale PC-Konfiguration hat RTX 5090, Ryzen 9, 64 GB DDR5 und 4 TB NVMe. Die Startausstattung ist bereits vorhanden und wird nicht nochmals berechnet.

Ab Hoftag 7.0 kosten Solar, Wind und Speicher ein Zehntel der früheren Baupreise (siehe `HOFLOOP_UMSETZUNG.md`); Beispiel Freilandfeld 270 €, 400-W-Panel 45 €, 5-kWh-Akku 200 €. Die angezeigte Amortisation ist entsprechend rund ein Zehntel der realen – der Energiegarten schreibt den Realvergleich seit Ära 7.5 ausdrücklich dazu.

PC-Preise sind durchgängig GPU-Katalogpreis plus Restausstattung: RTX 3060 700 € · RTX 4060 Ti 1.050 € · RTX 4080 2.100 € · RTX 4090 3.270 € · RTX 5090 5.700 €. Die Aufrüstung auf den Maximal-PC rechnet 55 % Restwert des alten Rechners an: 3.900 € vom 4090-PC, 4.550 € vom 4080-PC.

Im Schuppen sind PCs 1–6 am vorhandenen Anschluss erlaubt. Ihr Verbrauch wird normal bezahlt. Vor PC 7 ist der Nachbarvertrag nötig: 350 € Anschlusskosten, anschließend der jeweilige Normaltarif plus 10 % auf den Netzverbrauch der Zusatz-PCs. Die Rechnung wird alle 30 Hoftage bezahlt; aufgelaufene Beträge werden beim Hardwarekauf vom verfügbaren Guthaben abgezogen. Vor PC 10 muss zusätzlich mindestens ein Panel installiert sein.

Nerdtempel: Anschlussereignisse vor Schrank 1, 3 und 6. Rechenzentrum: Anschlussereignisse vor Schrank 9, 25 und 49. Erneuerbare und fossile Lösungswege sind möglich. Der Endausbau verlangt auf dem erneuerbaren Weg sechs große Windräder, mindestens 12 kWp Solar und 200 kWh Speicher; alternativ ein 400-kW-Kraftwerk. Das Netz bleibt als gesicherte Versorgung erhalten.

Ein Freilandfeld kostet **270 €** einschließlich Gestell und liefert 2,4 kWp Nennleistung. Wartung und Ertrag gehen in dieselbe stündliche Energiebilanz ein wie die Dachmodule. Die zusätzliche Freilandfläche ist eine Spielannahme, damit das auf Wunsch auf zehn Plätze begrenzte Dach die erneuerbare Endstufe nicht blockiert. Zehn 600-W-Dachmodule plus drei Felder ergeben 13,2 kWp. Bereits bezahlte überschüssige Dachmodule aus Zwischenständen bleiben als Bestandsanlage erhalten.

**Festgelegte Spielannahmen für nicht vorgegebene Details:** vier getrennte GPU-Serverknoten pro Schrank, je 256 GB RAM und 8 TB NVMe; Windgrößen 5/20/50 kW mit Kapazitätsfaktor 0,45/0,75/1,0, maximal sechs Windplätze; Kraftwerksgrößen 15/45/120/240/400 kW zu 5.000/13.500/30.000/55.000/85.000 €. Diese Werte sind keine Kaufberatung oder Elektroplanung. Jeder Serverknoten hat einen eigenen Speicher; GPUs, RAM und NVMe werden nicht automatisch über mehrere Rechner zusammengelegt.

## Fachliche Grenzen

Die Energiebilanz rechnet 24 Stunden getrennt: Verbrauch, gleichzeitige Sonne/Wind, Laden, Entladen, Verluste, Netz, Kraftwerk, Einspeisung und unversorgter Bedarf. Speicher haben sowohl eine kWh-Grenze als auch eine kW-Grenze und kommen leer an. Der Rundlaufwirkungsgrad beträgt im Spiel 90 %. Bei unversorgtem Bedarf pausieren lokale Arbeiten; Cloud-Aufträge bleiben unabhängig.

Solar- und Windanlagen sind im gewählten Szenario über längere Nutzung günstiger als fossile Erzeugung. Eine konkrete Investition kann bei geringer Auslastung trotzdem unwirtschaftlich sein. Die Anzeige vergleicht die aktuelle Last mit und ohne zusätzlichen Ausbau unter gleichen Normbedingungen. Sie nennt ausdrücklich fehlende Amortisation. Alle Baupreise, Wetterprofile, Laststunden, PUE-Werte und Emissionsfaktoren sind Spielannahmen; keine Messwerte eines realen Hofs.

Trinken beendet nur eine freie Sitzung: Der didaktische Kontextzähler wird geleert, Kontextrot kann enden. Gewichte, Fähigkeiten, Adapter und dauerhafte Notizen bleiben unverändert. Das konfigurierte KV-Cache-Budget wird nicht automatisch kleiner. Die sechs Standardtiere besitzen eigene Trinkbilder mit gespiegelter Blickrichtung. Eigene Kreaturen und der alternative SVG-Zeichenstil verwenden eine sanfte Ersatzbewegung.

## Stil und Bestandsschutz

Originale Tier-, Hof- und UI-Grafiken bleiben unverändert. Die neuen Illustrationen orientieren sich an den vorhandenen Figuren und Gebäudekarten. Alle neun Außen-/Tier-Sprites besitzen echte Alpha-Transparenz; der Innenraumboden ist absichtlich deckend. Es gibt keinen aufgemalten Schachbretthintergrund und keinen rechteckigen Bildrahmen auf der Wiese. Die handgezeichneten Konturen gehören zur Originalästhetik.

Beim Wechsel zum Nerdtempel werden PCs 7–12 eingelagert; beim Wechsel zum Rechenzentrum alle verbleibenden PCs. Belegte Geräte müssen vorher freigemacht werden. Schränke, Panels und Speicher bleiben erhalten. Alte GPU-Buchten und Solaranlagen aus früheren Spielständen laufen in einem gekennzeichneten Bestandsanbau weiter, statt verloren zu gehen. Neue Käufe unterliegen den neuen Regeln.


## Ära 7.5 (01.09.2026)

Umsetzung der Prüfbefunde R-02 bis R-25 für `dev/rechenhaus.js`. Alle Werte bleiben ausgewiesene Spielannahmen.

- **Einspeisung am Anschluss gedeckelt (R-02).** Der Netzanschluss begrenzt jetzt beide Richtungen. Was darüber hinaus erzeugt wird, erscheint als eigene Bilanzzeile „abgeregelt, weil der Anschluss voll ist“ – in der Stundenbilanz, im Energiegarten und im Morgenbericht. Damit wird der Anschlussausbau zur echten Entscheidung statt zur Formalie.
- **Fossiler Weg wieder wählbar (R-04).** Im Modus „Eigenbetrieb“ läuft das Kraftwerk nur in den Stunden, in denen der Brennstoff (0,62 € × Brennstofffaktor) günstiger ist als der aktuelle Stundenpreis; als Notreserve springt es unabhängig vom Preis ein. Die Anschaffungspreise sind halbiert (15 kW jetzt 5.000 €) und passen damit in dieselbe Preiswelt wie die Erneuerbaren.
- **Ehrliche Amortisation (R-05).** Jede Amortisationsangabe nennt zusätzlich den Realvergleich: „Spielpreise = ein Zehntel der Marktpreise – real ≈ N×10 Hoftage ≈ X Jahre“. Der Annahmen-Text nennt die reale Referenz (PV-Dachanlage 8–12 Jahre, Kleinwind praktisch nie).
- **Konsistente PC-Preise (R-06).** Der Gebraucht-PC mit RTX 4090 kostet 3.270 € statt 2.800 €; der Basis-PC mit RTX 4080 ist damit nicht mehr dominiert. Aufrüstpreise folgen derselben 55-%-Restwertregel wie der Verkauf.
- **Einstiegs-PCs ergänzt (R-07).** Neu wählbar: RTX 3060 12 GB (gebraucht) für 700 € und RTX 4060 Ti 16 GB für 1.050 €. Beide GPUs standen im Hofbuch, waren aber nirgends kaufbar. Serverknoten im Rack bleiben Karten ab Tier 2 vorbehalten.
- **Lagerverkauf (R-10).** Eingelagerte Geräte lassen sich zu 55 % Restwert verkaufen (Buchung als `anlagenverkauf`). Der Ausbauplan warnt vorher: Im Rechenzentrum gibt es keine PC-Plätze mehr, eingelagerte PCs lassen sich nur noch verkaufen.
- **Akku lädt nachts aus dem Netz (R-11).** Neuer Schalter im Energiegarten: „Nur Eigenstrom“ oder „Auch Nachtstrom“ (`r.akkuModus`, Standard „eigen“). Im Modus „netz“ lädt der Speicher nachts zum halben Tarif, soweit der Anschluss neben dem laufenden Bedarf Platz hat, und entlädt tagsüber zum vollen. Bei 0,24 gegen 0,48 € und 90 % Umlauf bleiben rund 0,216 € Marge je kWh – der eigentliche Grund für Heimspeicher.
- **Laststatus statt TDP (R-14).** Aktivstunden ziehen nicht mehr die volle Herstellergrenze: Inferenz 60 %, Training 95 %, Agenten-Welt 70 %, Zucht 50 %. Der Systemaufschlag eines Serverknotens steigt von 0,18 auf 0,35 kW. Der Annahmen-Text erklärt, warum Decode speicher- und nicht rechenlimitiert ist.
- **PUE und Grundlast korrigiert (R-15).** Vorher hatte ausgerechnet der ungekühlte Schuppen den besten Wert. Jetzt 1,45 / 1,25 / 1,12. Die Rechenzentrum-Grundlast besteht aus 1,20 kW Gebäudesockel plus 0,06 kW je belegtem Schrank; so wächst Kühlung/USV mit dem tatsächlichen Ausbau. Der Lehrsatz „geplante Rechenzentren sind effizienter als improvisierte Räume“ stimmt damit wieder.
- **Jahreszeiten in der PV (R-16).** Neuer Saisonfaktor `RH_SAISON_PV` (Frühling 1,25 · Sommer 1,45 · Herbst 0,75 · Winter 0,35) auf einen abgesenkten Basiswert von 2,9 kWh/kWp je Normtag. Die Winterlücke ist damit spürbar und wird im Energiegarten angezeigt.
- **Kapazitätsfaktor je Windgröße (R-17).** 0,45 / 0,75 / 1,0 für 5 / 20 / 50 kW. `rhWindKW` bleibt die Nennleistung für Anzeige und Ausbauereignisse, `rhWindEffKW` liefert die wirksame Leistung. Kleinwind auf Hofhöhe ist damit nicht länger das stärkste Investment des Spiels.
- **Wetterprognose (R-24).** `rhPrognose(n)` liefert das deterministische Spielwetter der nächsten n Hoftage als reine Lesefunktion. Der Energiegarten zeigt einen Streifen „Morgen / Übermorgen“ mit Solar- und Windfaktor, damit Lastverschiebung planbar wird. Ausdrücklich eingeordnet: reale Prognosen sind unsicher, die des Spiels sind exakt.
- **Hardware-Wartung (R-25.2).** 3 % des GPU-Anlagenwerts pro Jahr, täglich gebucht (nur oberhalb von 0,005 €) und als eigene Berichtszeile ausgewiesen. Macht die laufenden Kosten einer wachsenden Herde sichtbar.

### Neue globale Bausteine

| Name | Bedeutung |
|---|---|
| `rhLastFaktor(status)` | Laststatus-Faktor auf die GPU-Spitzenleistung; wird von `rhProfile` benutzt und ist für `hlProfile` in `hofloop.js` vorgesehen. |
| `rhPrognose(n)` | Wetterprognose der nächsten n Hoftage, reine Lesefunktion ohne Nebenwirkung. |
| `rhWindEffKW(r)` | Wirksame Windleistung nach Kapazitätsfaktor. |
| `rhSaisonId(tag)` / `rhSaisonF(tag)` | Jahreszeit und PV-Saisonfaktor eines beliebigen Hoftags. |
| `rhAkkuModus(m)` / `r.akkuModus` | Umschalter und Spielstandsfeld für die Nachtladung. |
| `rhLagerVerkauf(id)` | Verkauf eines eingelagerten Geräts. |
| `rhPCUpgradePreis(gpu)` | Aufrüstpreis inklusive 55 % Restwert des alten Rechners. |
| `a.abregelung`, `a.netzladung`, `a.saison`, `a.saisonF` | Neue Felder der Stundenbilanz aus `rhSim`. |

### Prüfung dieser Änderungen

`node dev/tests_rechenhaus.cjs` prüft gegen die gebaute `modellhof_game.html`. Solange die Einzeldatei noch nicht neu gebaut ist, tauscht die Umgebungsvariable `RH_DEV=1` den Rechenhaus-Block im geladenen Skripttext gegen `dev/rechenhaus.js` aus – per String-Ersetzung zwischen dem Dateikopf `/* Rechenhaus v1` und dem Teich-Kopf `/* Teich:`, also exakt entlang der Marker-Reihenfolge von `dev/assemble.ps1`. Ohne den Schalter bricht der Lauf mit einem Hinweis statt mit einem Stacktrace ab.

```
RH_DEV=1 node dev/tests_rechenhaus.cjs   # 80/80 Rechenhaus-Prüfungen bestanden
node --check dev/rechenhaus.js
```

Neu hinzugekommen sind 19 Prüfungen (61 → 80), mindestens eine je Befund: Einspeise-Deckel und Anschlussausbau, preisabhängiger Eigenbetrieb und Notreserve, Realvergleich in der Amortisation, PC-Preislogik und Aufrüstpreis, Einsteiger-PCs und Rack-Beschränkung, Lagerverkauf, Netzladung nachts inklusive Anschlussgrenze und Energieerhaltung, Lastfaktor und Rack-Aufschlag, PUE-Reihenfolge, PV-Saison, Wind-Kapazitätsfaktor, Prognose-Determinismus und GPU-Wartung.

## Direkt verwendbare Grafiken

`assets/rechenhaus/index.html` zeigt die fertige Sammlung mit einzelnen Downloads. `assets/rechenhaus/manifest.json` dokumentiert Abmessungen, Dateiformate und Teichkoordinaten. Alle SVG enthalten sämtliche benötigten Daten; sie laden keine externen Grafiken, Schriften oder Texturen nach.

- 13 Technikobjekte: drei Windradgrößen, Nachbarkabel, 400-/600-W-Panel, Solarfeld, Akku, Kraftwerk, Transformator, Stromverteiler, PC und Serverschrank.
- Je ein Dach mit 4, 6 und 10 freien Plätzen und je eine vollständig belegte Variante. Die reinen Dachflächen sind eigenständige Vektorobjekte.
- Drei passende transparente Dach-Overlays sowie drei bereits zusammengesetzte Gebäude-SVG. Die Overlays haben dieselbe Zeichenfläche wie das jeweilige Gebäude-PNG; kein manuelles Ausrichten erforderlich.
- Drei vollständige Hintergründe mit Zeichenfläche 1600 × 900. Der Teich bleibt exakt bei (950, 712), Wasserellipse 132 × 38, einschließlich unverändertem Ufer und Schilf. Die Originalwiese bleibt als Voreinstellung erhalten.
- Drei Gebäude-PNG, der Innenraum und sechs Trinkposen. Außenobjekte haben transparente Hintergründe. Der Raum und die drei Hintergrundbilder sind absichtlich deckend.

Insgesamt 38 Grafiken. Der grüne Untergrund und die Kartenränder in der Galerie gehören ausschließlich zur Vorschauseite, nicht zu den Objektdateien. Windräder drehen sich direkt als SVG-Bild; die Einstellung für reduzierte Bewegung wird berücksichtigt.

## Prüfung und Entwicklung

Der historische Integrationslauf bestand 61 Rechenhaus-Prüfungen und 38 weitere Spieltests. Die aktuelle Abschlussprüfung führt sämtliche Testsuiten sowie Regelwerk- und Audio-Parität aus; vollständige Ausgaben und SHA-256 der geprüften Spieldatei stehen in `PRUEFERGEBNIS_GESAMT.json`. Die Langzeitläufe prüfen konkrete Spielstrategien mit mehreren Zufalls-Seeds; sie beweisen nicht, dass jede Strategie profitabel ist. Zusätzlich im Browser geprüft: transparente Außenansichten, 4/6/10 Dachplätze, Technikobjekte, 64 Schrankplätze in schmaler Ansicht, Hintergrundauswahl und beide Trinkrichtungen am Ufer.

- `node dev/tests_rechenhaus.cjs`: 80 zusätzliche Prüfungen (61 aus Ära 7.0 plus 19 aus Ära 7.5) für Limits, Kosten, Alternativwege, Migration, Energieerhaltung, Kontextgrenzen, Grafikexport und unveränderte Teichposition.
- `node dev/tests_v6.cjs`: Regressionstests für das übrige Spiel einschließlich Langzeit-Wirtschaft.
- `dev/assemble.ps1`: baut die Einzeldatei und prüft JavaScript-Syntax; Fehler führen zu einem Fehlerstatus.
- `node dev/abschlusspruefung.cjs`: führt alle neun Testsuiten, den Regelwerk-Synchroncheck und den Audio-Audit aus und schreibt das maschinenlesbare Prüfprotokoll.
- `dev/rechenhaus_qa_build.cjs`: erzeugt getrennte lokale Browser-Prüfansichten für die drei Stufen und beide Trinkrichtungen. Die ausgelieferte Datei enthält diese Teststeuerung nicht.
- Neue Quellen: `dev/rechenhaus.js`, `dev/rechenhaus.css`, `dev/teich.js`, `dev/rechenhaus_objekte.js`; PNG-Grafiken eingebettet über `dev/rechenhaus_assets.js`. `node dev/rechenhaus_objekte_export.cjs` exportiert dieselben SVG-Objekte und Hintergründe, die das Spiel verwendet, mit Galerie und Manifest.
- Sicherung des Ausgangsstands: `backup_vor_rechenhaus_2026-08-30/`; unmittelbar vor Integration zusätzlich `dev/modellhof_template.vor_rechenhaus.html.bak`.

## Technische Quellen

NVIDIA nennt 16 GB VRAM und 320 W Grafikleistung für RTX 4080 sowie 32 GB und 575 W für RTX 5090. Der Verbrauch des gesamten Rechners liegt darüber und wird im Spiel mit ausdrücklich angenommenen Systemaufschlägen modelliert. Die Unterscheidung von Leistung, Energie und zeitabhängiger PV-Erzeugung entspricht den Grundprinzipien von PVGIS; die Spielwetterwerte sind keine PVGIS-Standortauswertung.

- [NVIDIA RTX 4080 Leistungsaufnahme](https://www.nvidia.com/en-us/geforce/news/geforce-rtx-40-series-ultra-efficient-beyond-fast/)
- [NVIDIA RTX 5090 Spezifikationen](https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/)
- [EU JRC – PVGIS](https://joint-research-centre.ec.europa.eu/pvgis-online-tool_en)

Die PNG-Illustrationen wurden mit dem eingebauten Imagegen-Werkzeug erzeugt und anschließend nur proportional für das Spiel verkleinert. Die Quelldateien stehen in `dev/rechenhaus_bildquellen.json`. Die Technikobjekte sind eigenständige SVG in der vorhandenen Hof-Zeichenweise; die Hintergründe erweitern die Originalszene aus `dev/grafik.js`. Strom- und Hardwarewerte ersetzen keine fachliche Prüfung einer echten Installation.
