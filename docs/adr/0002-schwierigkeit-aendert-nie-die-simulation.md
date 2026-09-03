# ADR 0002: Schwierigkeitsgrade ändern Hilfe und Polster – niemals die Simulation

## Status
Beschlossen (31.08.2026, Design-Interview Runde 1, Q4)

## Kontext
LLM FARM ist ein Lernspiel: Preise, Formeln und Wahrscheinlichkeiten bilden reale
Zusammenhänge ab (VRAM, tok/s, Strom, Trainingsrisiken). Klassische Schwierigkeitsgrade
skalieren Zahlen – dann lernt man auf „Leicht" falsche Größenordnungen.

## Entscheidung
Drei Stufen (🐣 Behütet / 🌾 Hofalltag / ⛈️ Marktwirtschaft) unterscheiden sich
ausschließlich in:
- Erklärtiefe & Coaching (Behütet: Folgen-Box mit Gegenmaßnahme VOR riskanten Aktionen,
  und zu jedem eintreffenden Ereignis sofort eine „Was jetzt hilft"-Zeile im Bericht;
  die ursprünglich angedachte 1-Tages-Vorwarnung wurde zugunsten des Gegenmittel-Coachings
  verworfen – es lehrt die Reaktion, statt nur zu warnen),
- Start-Polster und Pacht-Aufschlag (Marktwirtschaft +25 % Pacht),
- Strenge der Kundenreaktionen im Ton, nicht in der Formel.
Die Simulations-Formeln, Katalogpreise und Wahrscheinlichkeiten sind auf allen Stufen
identisch. Der Wechsel ist jederzeit im Hofhaus möglich. Die Alt-Werte `lern`/`wirtschaft`
migrieren beide auf 🌾 Hofalltag.

## Konsequenzen
+ Gelerntes ist auf jeder Stufe wahr; Stufenwechsel verfälscht keine Erfahrungswerte.
+ Tests können Formeln stufenunabhängig prüfen.
− „Leicht" kann Geldnot nur abfedern (Polster), nicht wegzaubern – gewollt.
