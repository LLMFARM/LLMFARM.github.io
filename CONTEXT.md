# LLM FARM – verbindliches Glossar

Kanonische Begriffe. UI, Regelwerk, Tests und Code-Kommentare verwenden genau diese Wörter.
Technische Begriffe bleiben nur dann englisch, wenn sie auch in der deutschsprachigen Praxis üblich
sind. Die Hofmetapher darf Zusammenhänge anschaulich machen, ersetzt aber keine verständlichen
Fachbegriffe. Nur Sprache – keine Implementierungsdetails.

| Begriff | Bedeutung | Nicht verwechseln mit |
|---|---|---|
| **Hof-Fokus** | Die in der Einführung gewählte Auftragsart des Hofs (`code`/`wissen`/`agent`/`text`/`support`), +8 % Erlös auf diese Art. | „Spezialist", „Meisterweg" |
| **Spezialist** | Ein einzelnes Tier, das auf EINE Auftragsart eingestellt ist (+8 % Erlös auf seine Art). Entsteht über das Marktlos. | „Hof-Fokus" (hofweit) |
| **Meisterweg** | Die einmalige Wahl eines der drei Fertigkeitsbäume ab Hofstufe 3; nur dort ist die 2⭐-Meister-Fertigkeit lernbar. | „Hof-Fokus", „Forschung" |
| **Meisterpunkt (⭐)** | Währung für Meisterfertigkeiten: genau 1 je erreichter Hofstufe ab Stufe 2. Keine anderen Quellen. | XP (Hof-Erfahrung) |
| **Meisterschaften** | Die drei Fertigkeitsbäume (Betreiber/Trainer/Händler) samt Fertigkeiten. | „Forschungsbaum" |
| **Forschungsbaum** | Der Forschungsbaum (FORSCHUNG) mit Abhängigkeitsketten. | „Meisterschaften" |
| **Laufzeitumgebung** | Die Inferenz-Software einer GPU-Bucht (llama.cpp, Ollama, LM Studio, vLLM, SGLang). Eigenschaft der Bucht, nicht des Tiers. | „Agenten-Tool" (Agenten-Harness) |
| **Agenten-Tool** | Arbeitsumgebung eines Modells, technisch auch Agent Harness (Claude Code, Aider, …); Voraussetzung für Agenten-Aufträge. | „Laufzeitumgebung", „Hilfsmittel" |
| **Hilfsmittel** | Zuschaltbare Arbeitstechnik eines Tiers (Quellensuche, Antwortkontrolle, Mehrfachauswahl, …). | „Laufzeitumgebung" |
| **Rätsel-Architektur** | HRM/TRM-Spezialtiere: lösen reine Struktur-Rätsel nativ und verwenden keine Agenten-Tools. | „Spezialist" |
| **Effizienz-Index** | Kennzahl je Tier: Arbeitsleistung im Verhältnis zu Betriebskosten. Grundlage des Marktwerts und Nordstern der Zucht. | XP, Ruf |
| **Hofbuch** | Das aus den Spieldaten GENERIERTE In-Game-Regelwerk (inkl. FAQ); Markdown-Zwilling: REGELWERK.md. | README (Entwickler-Doku) |
| **Bewährungsprobe** | Tägliches Eignungs-Ereignis einer Team-Rolle (gut/neutral/schlecht) mit erklärter Ursache. | Hof-Ereignis (global) |
| **Hof-Ereignis** | Globales Tages-Ereignis (Dunkelflaute, Preiskrieg, …). | Bewährungsprobe (rollenbezogen) |
| **Schwierigkeitsgrad** | 🐣 Behütet / 🌾 Hofalltag / ⛈️ Marktwirtschaft. Verändert NUR Hilfe & Polster – nie Formeln der Simulation. | Führung (Tutorial-Wahl) |
| **Geführte Woche** | Optionale 7-Tage-Kapitelkampagne ab Spielstart (Alternative: Freie Hand). | Schwierigkeitsgrad |
| **Zucht** | Verschmelzen zweier Modelle (Merge-Verfahren) zu einem Kind. | Training (verändert EIN Tier) |
| **Gesellenprüfung** | Abschluss der Geführten Woche (Tag 7): drei Prüfaufgaben ohne Hilfen; Belohnung Abzeichen „Geselle" + Förderung – nie ein Meisterpunkt. | Hofziel (Quest) |
| **Dorfmeisterschaft** | Liga am Saisonende (alle 30 Tage): fünftägige Team-Großausschreibung gegen simulierte Konkurrenzhöfe; Wertung Qualität × Effizienz-Index. | Arena-Rennen (Benchmark-Duell) |
| **Übergabelast** | Token-Aufschlag bei Team-Übergaben (Grundwert 12 %; gleiche Modellfamilie: 8 % – „eingespieltes Team"). | Vertragsstrafe |
| **Hof-Chronik** | Dauerhafte Liste wichtiger Erfolge im Spielstand (Seite im Hofbuch); wird bei besonderen Meilensteinen fortgeschrieben. | Morgenbericht (ein Tag) |
| **Ada** | Die Beraterin des Hofes: Empfehlungen in Tierkarten, gesprochene Erklärungen (animierte Figur in der Sprechblase oben links, passender Knopf rot hervorgehoben) und eine optionale Fragefunktion mit eigenem OpenRouter-Schlüssel. Ihr Wissen stammt aus dem Hofbuch. Antippen hält die Wiedergabe an; „Einklappen“ verkleinert die Blase, ohne die Stimme zu stoppen. | Hofbuch (das Regelwerk selbst) |
| **Mundkurve** | Lautstärke-Hüllkurve einer Ada-Tonspur (20 Bilder/Sekunde, Stufen 0–9), offline aus der MP3 berechnet und im Spiel für die Lippenbewegung ausgelesen. | Sprechtext (was sie sagt) |
