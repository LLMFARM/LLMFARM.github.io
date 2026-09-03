# ADR 0001: Regelwerk wird aus den Spieldaten generiert

## Status
Beschlossen (31.08.2026, Design-Interview Runde 1, Q1 = B)

## Kontext
Das Spiel hat ~300 katalogisierbare Inhalte (Modelle, Forschungen, Skills, Events, Aufträge …),
entwickelt von zwei parallelen Sessions. Zwei Funde zeigten das Risiko verstreuter Wahrheit:
ein bezahlter Bonus ohne Wirkung (`spezialArt`) und ein Modus-Schalter ohne Leser (`S.modus`).
Ein handgepflegtes Regelwerk würde unweigerlich vom Code wegdriften.

## Entscheidung
Die Datenmodule (content.js, modelle.js, technik.js, harnesse.js, hofloop.js, rechenhaus.js)
SIND die Quelle. Ein Generator erzeugt daraus beides:
1. das In-Game-**Hofbuch** (Blatt mit allen Tabellen, Boni, Malussen, Ketten, FAQ),
2. **REGELWERK.md** im Repo (derselbe Inhalt als Markdown).
Erklärprosa lebt als Felder AN den Daten (`txt`, `lehre`, `eff`).
Ein Solltest schlägt fehl, wenn ein Inhalt ohne Regelwerk-Abdeckung existiert
oder ein dokumentierter Effekt keinen Code-Anker hat.

## Konsequenzen
+ Regelwerk kann nicht mehr lügen; tote Versprechen fallen als roter Test auf.
+ Beide Sessions speisen dieselbe Wahrheit; neue Inhalte dokumentieren sich selbst.
− Erklärfelder müssen mit den Daten gepflegt werden; Generator ist neue Infrastruktur.
