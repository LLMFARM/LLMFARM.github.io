# LLM FARM

**LLM FARM** ist eine lehrreiche KI-Wirtschaftssimulation im Stil klassischer Browser-Farmspiele:
KI-Sprachmodelle leben als Hoftiere auf einem Bauernhof. Du fütterst sie mit Datensätzen,
trainierst sie mit echten Verfahren (SFT, LoRA, Quantisierung, Distillation, Merging),
spannst sie in Agenten-Geschirre und betreibst den Hof wirtschaftlich – mit Strom, Compute,
Ruf, Pinnwand-Aufträgen und einem vollständigen Kassenbuch.

**▶️ Spielen:** <https://llmfarm.github.io/>

Das Hauptspiel ist eine einzelne HTML-Datei; alle Bilder sind eingebettet und der Spielstand
liegt im Browser (localStorage). Optional lädt der Ada-Hofsprecher das mitgelieferte offene
Needle-2-Modell aus `needle/` (rund 14 MB) und rechnet vollständig im Browser. Ohne Nadel bleibt
der deutsche Offline-Wörterbuchparser nutzbar. Das Spiel läuft am besten in einem aktuellen
Desktop-Browser, funktioniert aber auch mobil.

## KI-Kennzeichnung

**Alles in diesem Spiel wurde mit Künstlicher Intelligenz erstellt** – Spiel-Logik und Texte
mit Unterstützung von Claude (Anthropic), Gebäude-Illustrationen, Titelbild und Tierart-Porträts
mit Google Gemini 2.5 Flash Image (über OpenRouter). Jedes Hinweisfenster im Spiel trägt diese
Kennzeichnung unten rechts; Details stehen im Spiel unter Hofhaus → „Mitwirkende & KI-Kennzeichnung".

Alle Modell-, Preis- und Benchmark-Angaben folgen öffentlichen Quellen (Stand August 2026) –
ohne Gewähr. Dieses Spiel ist ein unabhängiges Lernprojekt und steht in keiner Verbindung
zu den genannten Firmen.

## Aufbau des Repositorys

Dieses Repository enthält das komplette Spiel **und** seine Quellen. Die Seite auf
`llmfarm.github.io` wird direkt aus der Wurzel ausgeliefert.

| Pfad | Inhalt |
|---|---|
| `index.html` | das ausgelieferte Spiel (Kopie des Baus, eine einzige Datei) |
| `modellhof_game.html` | derselbe Bau unter seinem Arbeitsnamen |
| `dev/` | alle Quellbausteine, der Zusammenbau (`assemble.ps1`), neun Prüf-Sammlungen, Spieltest-Treiber |
| `assets/` | Rohgrafiken vor dem Einbetten |
| `ada_dialog_v3/` | die 68 vertonten Ada-Erklärungen samt Mundkurven |
| `ada/` | ältere Tondateien aus früheren Fassungen |
| `needle/` | Needle 2 (WebAssembly, Modell, Lizenz) für den Hofsprecher |
| `REGELWERK.md` | das vollständige Regelwerk, aus dem Spiel erzeugt |

**Bauen und veröffentlichen:**

```bash
powershell -ExecutionPolicy Bypass -File dev/assemble.ps1   # baut modellhof_game.html
node dev/abschlusspruefung.cjs                              # alle Prüfungen in einem Lauf
cp modellhof_game.html index.html                           # das Gebaute wird die Seite
```
