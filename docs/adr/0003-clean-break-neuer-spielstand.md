# ADR 0003: Clean Break – Ära 7 startet ohne Alt-Spielstände

## Status
Beschlossen (31.08.2026, Design-Interview Runde 2, R4 + R6)

## Kontext
Die Ära-7-Umbauten (Laufzeitumgebungen, Effizienz-Index-Marktpreise, Schwierigkeitsgrade, Geführte
Woche, Team-Proben, Dorfmeisterschaft) würden Migrationslogik für jeden Alt-Zustand
erfordern (S.modus, spezialArt, alte Team-XP, alte Marktwerte). Der Nutzer hat entschieden:
kein Bestandsschutz, keine Vermischung von Alt und Neu.

## Entscheidung
Der Speicher wechselt auf einen NEUEN Schlüssel (`modellhof_v7`). Alte Stände unter
`modellhof_v4` werden beim ersten Start der neuen Version nicht geladen und nicht
konvertiert; das Spiel beginnt mit der Einführung. Ein einmaliger Boot-Hinweis erklärt den
Neuanfang. Migrations-Code und Bestandsschutz-Sonderfälle werden NICHT gebaut; Reste des
alten Modus-Systems (`S.modus` lern/wirtschaft) entfallen ersatzlos zugunsten von
`S.schwierig` (🐣/🌾/⛈️) und `S.fuehrung` (Geführte Woche / Freie Hand).

## Konsequenzen
+ Keine Migrationspfade, keine Doppelsysteme, deutlich weniger Test-Matrix.
+ Balance und Marktpreise dürfen ehrlich neu kalibriert werden.
− Bestehende Fortschritte gehen verloren – bewusst in Kauf genommen (Spiel ist in
  aktiver Entwicklung, der Export/Import im Hofhaus bleibt als freiwillige Sicherung).
