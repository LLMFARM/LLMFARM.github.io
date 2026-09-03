# LLM FARM – Entwickler-Notizen

**LLM FARM** (Arbeitstitel bis v6.1: „Modellhof") ist eine lehrreiche Wirtschaftssimulation im Stil klassischer Browser-Farmspiele:
KI-Modelle leben als Schweine auf einem Hof. Alle Zahlen, Preise, Modelle, Agenten-Tools und
Trainingsverfahren basieren auf recherchierten, realen Daten (Stand **August 2026**).

## v9.8 (02.09.2026) – Konsistenzprüfung, Regel-/Dialogabgleich und vollständiger Prüfstand

- **Zentraler Abschlusslauf:** `node dev/abschlusspruefung.cjs` prüft neun Suiten mit zusammen
  **437/437** Einzeltests, den schreibfreien Hofbuch-Synchroncheck, den Ada-Dokumentationscheck und das Audio-Audit. Das
  maschinenlesbare Ergebnis liegt in `PRUEFERGEBNIS_GESAMT.json`.
- **Regeln und Führung synchronisiert:** Datenschutz-Verwarnungen, Restrisiko von Agenten-Tools mit Schutzfunktionen,
  Teamdauer/Koordinationslast, Freischaltungen, Hofziele, Geführte Woche und Fachkurse entsprechen
  denselben Konstanten und Prüfpfaden wie die Spielmechanik.
- **Blocker geschlossen:** Nachtplan fällt bei ungültiger oder unbezahlbarer Aktion auf kostenlose
  Ruhe zurück, Käufe und Kuren sind atomar, Teamrollen dürfen kein Tier doppelt verwenden,
  Engine-Gates greifen unabhängig von der Oberfläche und die Einstiegsführung bleibt nach Tag 40
  spielbar.
- **Vertonung vollständig:** 68 Clips, 32,9 Minuten, 24 kHz mono; alle Clips besitzen passende Mundkurven.
  Quellspiel und Veröffentlichung sind bytegleich, ebenso alle 68 Audiodateien.

## v9.9b (02.09.2026) – Stammbaum, Handzeichnungs-Look, verschiebbare Ada

- **Stammbaum (dev/stammbaum.js):** Der Verwandtschaftsbaum der Zucht als Bild nach dem Vorbild der Ahnentafel-Poster:
  Krone = bis zu drei Ebenen Vorfahren (verkaufte bleiben mit Namen als blasse Blätter), Stamm = das gewählte Tier mit
  Wurfgeschwistern, Wurzeln = bis zu drei Ebenen Nachkommen im Fächer. Aus den echten Zuchtdaten (`eltern`, `wurf`,
  `gen`); Klick rückt ein Tier in den Stamm. Erreichbar aus der Zuchtbucht und den Papieren jeder Tierkarte; Hofbuch-Absatz,
  Hintergrund `stammbaum_hg` (OpenRouter, Hofpalette), Test STAMMBAUM-1.
- **Handzeichnungs-Look für alle Bäume:** globale SVG-Zeichenmittel (Turbulenz-Filter für skizzierte Linien, Holzmaserung,
  Pergament, Medaillon-Verläufe, Schlagschatten) – rein über CSS auf Kanten, Felder, Knoten, Tafeln und Stammbaum-Äste
  gelegt, ohne den Zeichner selbst zu verändern.
- **Ada-Box verschiebbar:** am Kopf ziehen (Maus und Finger), Lage bleibt im Browser gespeichert, Doppelklick setzt
  zurück; die Ziele-Leiste bleibt stehen, sobald Ada von Hand bewegt wurde.
- **Tagesuhr im Kopf:** Balken von 06:00 bis 22:00 mit Stundenmarken, Sonnenmarke, Uhrzeit und verbleibenden
  Arbeitsstunden (14 je Hoftag); in der Nachtplanung zeigt sie die Phase.

## v9.9a (02.09.2026) – Spieltest Runde 2 ausgewertet

Zehn Sonnet-Agenten spielten v9.8 (38–104 Hoftage, 170 Befunde), prüften gezielt die 50 Korrekturen aus Runde 1
und bestätigten sie im Spiel: Hofuhr ab Annahmezeit, gleiche Stundenzahlen an allen Stellen, ein Datenschutz-System,
Zuchtlinie über Generationen, Pacht im Morgenbericht, Kundennamen eindeutig, Teilabnahme im Hofbuch, Geführte Woche
ohne stumme Kapitel. Spaß 4/5 bei allen zehn, Lernen 5/5 bei allen zehn. Ein Spieler schloss die Zuchtlinie als erstes
Lebenswerk ab (Tag 41). Neu behoben (Runde 2): Saat im Treiber, Nacht über den Hofsprecher, Absturz bei Zucht nach
Verkauf (`S.verkauft`), Kanzlei-Zettel bei der Zahnarztpraxis, Hofschließung für alle Kauf- und Pflegewege, Hofziele mit
Ortsbindung (Solar, Akku, Wind), Verwarnungsfenster bis Stufe 3, Zeugnis mit wirksamen Werten, Agentenleistung-Hinweis an
Agenten-Zetteln, Agenten-Tool-Toggle, Zuchtbuch als Voraussetzung im Spiel selbst, Zucht und Lebenswerke im Hofsprecher,
„Trübe Tage“ statt zweiter Dunkelflaute, Abwerbungs-Wert wird gelesen, Rundung der Kurspreise und Zucht-Wertformel im
Hofbuch. Offen bleibt die Balance der Lebenswerke: Zuchtlinie in zwei Wochen, Handelshaus und Forschungsbaum in Monaten,
Rechenpark nur mit Rechenzentrum – das Hofbuch nennt den Horizont jetzt ausdrücklich.

## v9.9 (02.09.2026) – MCP-Werkstatt und echte Techbäume (radial und Raster)

- **MCP-Werkstatt (dev/mcp.js):** Das Model Context Protocol als eigener Baum in der Forschungshütte, dritter Reiter
  neben Forschungsbaum und Meisterschaften. Fünf Zweige mit 17 Knoten: Leitungen (stdio, Streamable HTTP, OAuth 2.1),
  Server-Bausteine (tools, resources, prompts), Client-Fähigkeiten (roots, sampling, elicitation), Anschlüsse
  (Datei, Post & Kalender, Buchhaltung, Web & Suche) und Sicherheit (Freigabeliste, Sandkasten, Prüfprotokoll, Verzeichnis).
  Jeder Knoten trägt echte Technik mit Stand (Spezifikation 2025, Linux Foundation Ende 2025) und eine dokumentierte
  Spielwirkung (`MCP_REGELN`). Öffnet ab Hofstufe 3 mit erforschter Agentenwerkstatt; Anschließen braucht ein Agenten-Tool mit MCP
  (`HARNESSE.*.mcp`; Basis-Tool, pi und aider ohne), kostet Geld und einen bis zwei Tage auf dem eigenen Anschlussbrett.
  Ketten: Agenten-Zettel brauchen je Sektor einen Anschluss (passend +8 % Lohn, fehlend −12 Qualität, ab Tier 3 gesperrt);
  Werkzeuge +6 Agentenleistung, Datenquellen −2 Prozentpunkte Tool-Overhead, Vorlagen/Abtastung −2 % Team-Abstimmung, Rückfragen ×0,85 und
  Prüfprotokoll ×0,7 Datenschutz-Risiko, roots ×0,75 und Sandkasten ×0,5 Injection-Schaden, Fernleitung ohne OAuth ×1,5;
  Ereignis „Vergiftete Werkzeugbeschreibung“ (Tool Poisoning) nur mit Anschluss, Freigabeliste ×0,25, Verzeichnis ×0,1.
  Hofbuch-Kapitel, drei Kompendium-Karten, vertonter Ada-Text `mcp_werkstatt`, Hofsprecher-Werkzeug `mcp_anschluss`
  („schließe den Dateiserver an“), Treiber `mcp [<knoten>]`, Tests MCP-1..4.
- **Techbäume wie echte Techbäume (dev/techbaum.js):** `tbRadialSvg` zeichnet Netze von der Mitte aus (Zweige als
  Sektoren, Stufen als Ringe, leuchtende Kanten, Bögen für Voraussetzungen aus anderen Zweigen); `tbRasterHtml` zeichnet
  Tafeln mit Zeilen (Fachrichtung), Spalten (Stufe/Preisklasse), Pfeilen und Schlössern. Angewendet auf Meisterschaften
  und MCP (radial) sowie Forschungsbaum, Hardware-Baum und Strom-Baum (Raster; zwei neue Rechenhaus-Ansichten). Hintergründe
  in der Hofpalette per OpenRouter (Gemini 2.5 Flash Image) erzeugt und als `techbaum_radial`/`techbaum_raster` eingebettet.
  Tests TB-1. Nutzerhinweise umgesetzt: Kompendium 🎓 statt zweitem Buch, Warten-Knopf entfernt, Rückfrage vor frühem
  Feierabend, sichtbare Scrollbalken und Rollhilfe in allen Blättern.

## v9.8 (02.09.2026) – Spieltest mit zehn Agenten: 46 Korrekturen und ein erreichbares Ende

Zehn Sonnet-Agenten haben je eine Partie über den Treiber gespielt (Neuling, Teamchef, Fachwirt, Datenschützer,
Hofsprecher, Uhrmacher, Wetterfrosch, Entscheider, Züchter/Cloud, Bugjäger; 25–44 Hoftage, 148 Befunde).
Daraus wurden 46 Korrekturen; die wichtigsten:

- **Hofuhr ehrlich:** Ein Zettel beginnt zur Annahmezeit (`team.heuteAnteil`), das Fristbudget zählt ab jetzt
  (`hlFristBudget`). Vorher schrieb das Spiel einem um 21:56 Uhr angenommenen Zettel den ganzen Tag gut – ein Modell
  schaffte 198 % seiner Tageskapazität.
- **Ein Datenschutz-System statt zwei:** Das alte DSGVO-Leck-Ereignis feuert nicht mehr neben der Ära-9-Prüfung
  (sonst zwei Abmahnungen aus einem Vorfall). Das Risiko folgt dem Kunden (Sektor), hohes Risiko trägt immer die
  Vor-Ort-Pflicht, der Chip nennt die Quelle. Neu: Die erste Beanstandung eines jungen Hofes ist eine Verwarnung –
  Strafe und Ruf kosten, der Zähler bleibt stehen. Ein geschlossener Hof kann nicht mehr kaufen, forschen,
  trainieren, züchten oder warten.
- **Zuchtlinie repariert:** Zuchtkinder erbten die Nadelklasse vom ersten Katalogeintrag und konnten nie wieder
  gekreuzt werden. **Großaufträge repariert:** zwei Vorlagen verlangten den Wert „stil“, den es nicht gibt.
  **Training repariert:** das Merkmal „Verfressen“ überschrieb eine Konstante und warf einen Programmfehler.
- **Zufall repariert:** `zsHash` bekam einen Abschlussmix. Vorher streuten benachbarte Schlüssel kaum, ein Hof
  bekam entweder ständig Gerüchte oder nie eines (jetzt 0 von 200 Höfen ohne Gerücht in 23 Tagen).
- **Das Ende (neu, dev/finale.js):** Fünf Lebenswerke – 🧬 Zuchtlinie, 🏭 Rechenpark, 📚 Forschungsbaum, 🤝 Handelshaus,
  🎓 Fachhaus. Hofstufe 10 und zwei davon geben den **Hofmeisterbrief** (5000 €, 600 XP), Hofstufe 12 und alle fünf
  die **Legende** (15000 €, 1500 XP). Der Hof läuft weiter, ein geschlossener Hof bekommt nichts. Karte im
  Tagesbericht ab Tag 10, Hofbuch-Kapitel und vertonter Ada-Text `meisterbrief`.
- **Hofsprecher:** neue Werkzeuge Agenten-Tool zuweisen, Nacht starten, Zurück zum Tag; die Annehmen-Vorschau nennt
  Fristbudget, Ampel und Datenschutz-Risiko und lehnt Aussichtsloses vorab ab.
- **Treiber:** Fortschritt laufender Zettel, `rueckfrage ja|nein`, `entscheidung`, Vier gewinnt spielbar,
  Datenlese ohne Altstand, echte Kurspreise, Pinnwand-Kennzeichnungen im Auftragstext.

Tests: 10 Suiten, 429 grün (v6 78, hofloop 34, rechenhaus 80, minispiele 42, aera8 53, aera9 19, needle 76,
dynamik 27, berufe 19). Lösungs-Bot: alle Endspiel-Meilensteine auf 3 von 3 Saaten (vorher 1–2 von 3).

## v9.7 (02.09.2026) – Hofuhr: Warten statt Feierabend, Ada verdeckt keine Ziele, Audios verdrahtet

- **Warten-Knopf in der Hofleiste** (hofloop.js `hlWarten`, `hlWartenBisAbnahme`, `hlWartenFeierabend`, `hlWartenMenue`):
  eine Stunde, vier Stunden, bis zur nächsten Sofort-Abnahme oder bis Feierabend vorspulen. Ein Zettel bindet ein
  Modell nur seine Arbeitsstunden – nach der Abnahme ist es frei und kann am selben Tag den nächsten Zettel übernehmen
  (Test UHR-2: zwei Zettel an Tag 1 mit einem Modell). Hofsprecher „warte bis zur Abnahme“, Treiber `warten abnahme|feierabend`.
- **Feierabend-Hinweis in der Nachtplanung** (`hlFeierabendHtml`): wer vor 22:00 beendet, sieht Uhrzeit, freie Modelle,
  liegengebliebene Modell-Stunden und mögliche Einnahmen – mit Knopf „Zurück und bis zur nächsten Abnahme warten“.
  Anreiz ohne künstliche Strafe: ungenutzte Kapazität und die Dorfplatz-Spiele des Tages sind der Preis des frühen Feierabends.
  Hofbuch-Absatz „Hofuhr & Warten“ und vertonter Ada-Dialog `hofuhr`.
- **Ada verdeckt keine Ziele mehr:** die Ziele-Leiste rutscht unter die Sprechblase (`adaPlatz`, ResizeObserver),
  auch eingeklappt.
- **Audios verdrahtet:** die 32 vom Nutzer vertonten Dialoge liegen in ada_dialog_v3 und publish_pages, Mundkurven (58)
  synchron, Kennzeichnungen entfernt; ADA-1..4 und der Audio-Audit sind grün. Tests: 397 grün (dynamik 20).

## v9.6 (02.09.2026) – Ada-Dialoge auf den Regelstand gebracht, Hörknöpfe an jedem neuen System

- **32 Dialoge geprüft und neu geschrieben** (content.js ADA_TEXTE, dev/ada_texte.json): Tag 1 führt über die
  Agentenwerkstatt zur Pinnwand; Tag 5 ist der Fach-Tag (Agentenwerkstatt erforschen, Fachkurs buchen – Kapitel 5 der Geführten
  Woche hat dazu neue Ziele); Orte (Pinnwand, Agentenwerkstatt, Futter, Forschung, Training, Zucht, Viehmarkt, Cloud,
  Energie, Rechenhaus, Dorfplatz, Hofhaus) beschreiben Berufe-Zettel, Teams, Fachwissen, Datenschutz, Würfe mit
  Stammbuch, Nadel, Strom 2.0 und Wetter; Start-Schritte nennen Fachwissen, Risiko und Teamgröße.
- **Sechs neue Dialoge:** Tagesplanung, Ereignisse mit Entscheidung, Dorf-Anliegen, Fachbildung, Die Nadel,
  Der Hof ist geschlossen – jeweils mit Hörknopf an der passenden Stelle (Tagesplanung, Ereigniskarte, Anliegen-Karte,
  Agentenwerkstatt, Viehmarkt, Schließungskarte). Prüfung ADA-9 erzwingt jetzt 15 Hörknöpfe.
- **Vertonung liegt beim Nutzer:** die 32 Einträge tragen `ohneAudio:true` (Browserstimme liest sie); die Texte,
  der Befehl und die Schritte danach stehen in dev/VERTONUNG_TODO.md. FAQ „Kann ich verlieren?“ nennt die
  Hofschließung nach Abmahnungen. Tests: 393 grün (v6 71, hofloop 32, rechenhaus 80, minispiele 41, aera8 53, aera9 16, needle 71, dynamik 16, berufe 13).

## v9.5 (02.09.2026) – Fachbildung: Kurse mit Zeit, Geld, Daten und Ausfall; Fachwissen als Stat

- **Schulung ist jetzt Ausbildung** (dev/compliance.js `FACH_*`): sechs Fachgebiete (Datenschutz & DSGVO, Medizin,
  Recht, Steuern & Buchhaltung, Personal, Versicherung & Bank), drei Kursstufen je Gebiet – Grundkurs 1 Tag/150 €/3 GB
  Kuratiertes (+25), Aufbaukurs 2 Tage/320 €/6 GB (+22, ab 20), Fachzertifikat 3 Tage/560 €/10 GB (+20, ab 40); Preis
  wächst mit der Modellgröße, ab 20 B je 20 B ein Tag länger. Das Modell steht während des Kurses nicht zur Verfügung
  (Status „Schulung“, braucht eine Bucht, zieht GPU-Last wie ein Training, pausiert bei Energiemangel). Technik nach
  Forschung wählbar: SFT (+15 % Gewinn, länger), LoRA (schneller, −10 %), QLoRA (billiger, −15 %), DPO (Datenschutz +20 %).
- **Fachwissen 0–100 je Gebiet** als sichtbarer Stat (Tierkarte, Agentenwerkstatt, Zettelvergleich): Zettel aus sensiblen
  Sektoren verlangen ein Minimum (hoch 30 + 8 je Tier, erhöht 18 + 6 je Tier, +1 je 6 Hoftage bis +20 – die Fälle
  werden schwerer), Überschuss bringt bis +8 Qualität, saubere Zettel im Gebiet bringen +3 Praxis bis 85. Solche
  Zettel zahlen ×(1 + 0,008 je Punkt Mindest-Fachwissen) zusätzlich zum Datenschutz-Aufschlag – zwei Kurse rechnen
  sich nach zwei bis vier Zetteln (Test FACH-3).
- **Verstoßrisiko kontinuierlich** statt Ja/Nein: sinkt linear mit dem Datenschutz-Fachwissen (0 ab 90), Fachwissen
  im Gebiet zählt zu 60 %, ein Agenten-Tool mit Schutzfunktionen halbiert den Rest, Leih-Tiere gelten als 50 und zählen doppelt.
  Der Zettelvergleich nennt je Modell den Schutzstatus mit Faktor; die Ada-Texte Datenschutz/Abmahnung sind
  neu vertont. Alte Spielstände: `dsgvoSchulung` zählt als Datenschutz 45.
- **Bedienung:** Agentenwerkstatt → „Ada empfiehlt“ zeigt je Modell Fachwissen-Chips und eine Kursauswahl (Gebiet, Stufe,
  Preis, Tage, GB, Gewinn) plus Technik-Auswahl; Hofsprecher „schule t3 in Recht Aufbau“; Treiber
  `schulung <uid> <gebiet> [kurs] [technik]` (ohne Argumente: Katalog). Tests: 393 grün in 9 Suiten (berufe 13).

## v9.4 (02.09.2026) – Agenten-Tool entfernen Tag 1, Agenten-Teams, Berufe-Katalog, Datenschutz & Abmahnung

- **Agentenwerkstatt ab Tag 1** (content.js LEVELS, harnesse.js `hofgeschirr`): das Basis-Tool (offenes Basis-Gerüst)
  passt ohne Forschung auf jedes Tier; Spezial-Tools kommen mit der Forschung „Agentenwerkstatt“. Ada führt in
  Kapitel 1 nach der Bucht in die Agentenwerkstatt (`start_geschirr`, `start_geschirr_fertig`, vertont), die
  Agentenwerkstatt zeigt „Ada empfiehlt“ je Modell mit Eignung, Zweck und Schutzstatus (compliance.js `dsSattlereiHtml`).
- **Agenten-Teams** (hofloop.js `hlRollen`/`hlRollenJob`/`hlTeamCheck`, `hlTeamSchaetzung`, `hlTeamAuswahlHtml`):
  komplexe Zettel tragen `teamMax` (2–4); die Teamgröße wählt man auf dem Einsatzblatt, die Pinnwand zeigt
  „1 Agent ≈ 4 Tage · 2 ≈ 2,2 · 3 ≈ 1,6“ mit den schnellsten freien Agenten. Abstimmung kostet 10 % je
  weiterem Agenten, gleiches Agenten-Tool 5 % („eingespieltes Team“, +2 Qualität). Treiber: `annehmen j t1,t2,t3`.
- **Berufe-Katalog** (dev/berufe.js): 50 Berufe aus 20 Sektoren mit 156 Aufgaben – Zimmerei, Dönerimbiss,
  PR-Agentur, Arztpraxis, Kanzlei, Steuerbüro, Pflegedienst, Stadtwerke, Museum … Zahlen aus `BERUF_BASIS`
  je Tier, jeden Morgen ein Katalog-Zettel (alle drei Tage ein Team-Zettel), eine Nadel im Stall sortiert
  einen zweiten passend vor. Jeder Beruf wird zum eigenen Kunden mit Ort und Eigenart.
- **Datenschutz & Aufsicht** (dev/compliance.js): Medizin/Recht/Steuer/Personal/Pflege = Risiko hoch (30 %),
  Finanzen/Bildung/Verwaltung/Soziales = erhöht (15 %) je ungeschütztem Modell; Leih-Tier verdoppelt,
  Schutzregeln halbieren, Kontrollpaket ×0,7. Schutz: Datenschutz-Schulung 80 € (Agentenwerkstatt, Treiber `schulung`,
  Hofsprecher „schule t3“) oder ein Agenten-Tool mit Schutzfunktionen (Claude Code, Codex CLI, OpenHands, goose). Verstoß: Strafe
  25 % + 150 € (hoch) bzw. 12 % + 60 € (erhöht), Ruf −8/−4, Groll, **Abmahnung**; nach der zweiten
  (Behütet: dritten) wird der Hof geschlossen (Karte mit Lernkarte und Neustart). Risiko-Zettel erscheinen erst
  ab Stufe 2/3 oder mit geschütztem Modell; Zusage fragt bei Risiko nach; das alte DSGVO-Leck zählt nur ungeschützt.
- **Tests:** 405 grün in 9 Suiten (neu dev/tests_berufe.cjs 9). Balance-Politiken in den Tests meiden Risiko-Zettel
  wie eine kluge Spielerin. Ada-Clips für die fünf neuen Texte mit edge-tts erzeugt (52 Mundkurven).

## v9.3 (02.09.2026) – Ära 9 „Nadel & Schmiede“: Entscheidungen, Dorf-Anliegen, Tagesplanung, Ada ohne Schlüssel

- **Needle 2 geprüft und ehrlich eingebaut** (dev/NEEDLE_DESIGN.md, Abschnitt 0): 45 Mio. Parameter, 14 MB,
  256-Token-Fenster, nur JSON-Werkzeugaufrufe, Englisch-first. Eigene Messung: Englisch 24/25, Deutsch 14/22.
  Darum steuert die Nadel (WebAssembly im Web Worker, `needle/`, einmalig 14,1 MB, danach Cache) den Hof nur
  hinter dem deutschen Wörterbuch-Parser und immer mit Vorschau + „Machen“. Needle sieht jetzt englische
  Parameternamen/-werte (`animal`, `mode: own`) und die Antwort wird zurückübersetzt.
- **Entscheidungs-Ereignisse** (dev/ereignisse.js, `EREIGNIS_WAHL`): Kühlflüssigkeit leckt, Praktikantin,
  Nachbar räumt sein Lager, Dorfradio-Interview, Sondertarif, Archivspende – jede Option nennt Geld, Ruf, XP,
  Daten oder Folge-Effekt (Durchsatz, Forschung, Hardware, Nachfrage, Strom) mit Tagen; Knöpfe im
  Morgenblatt und im Hofhaus, Standard-Option bei Untätigkeit am Tagesende, Hofsprecher-Werkzeug „entscheiden“.
- **Dorf-Anliegen** (dev/zettelschmiede.js): ab Tag 3 alle 5 Tage ein Bittbrief eines Umland-Betriebs
  (saubere Zettel einer Art/eines Kunden, Nächte mit Zusatzarbeit, Eigenenergie, Datenlese-Tage), 6 Tage Frist,
  Prämie + Ruf, höchstens 2 offen, Verfall ohne Strafe. Fortschritt aus dem echten Spielstand.
- **Tagesplanung** (hofloop.js `hlTagesplanungHtml`): erstes Blatt nach der Nacht mit heutigem Wetter,
  erwarteter Sonne/Wind-Energie, Bedarf, Netzbezug in kWh/€, Akkustand, offenen Entscheidungen und Anliegen.
- **Ada ohne Schlüssel** (hofsprecher.js `hsAdaAntwort`): Live-Werkzeuge (Status, Wetter, Kasse, Zettel),
  sonst Volltextsuche über Hofbuch, Wissenskarten und Ada-Texte (Wortstämme, Titelgewicht) – nichts erfunden,
  nichts gesendet; der OpenRouter-Schlüssel bleibt optional.
- **Nadel als Hoftier** (modelle.js `needle2`, technik.js `pi5`/`esp32p4`, rechenhaus.js `RH_PC.pi`):
  15 € Modell, 120 € Raspberry-Pi-Rechner (nur Nadelklasse), 500 tok/s auf dem Pi (Hersteller), 1 200 auf
  GPUs (Spielannahme), Rüstfaktor 0,6; schafft Mikro-Zettel „post“/„spam“, aber nichts mit Stil, Wissen oder
  langem Kontext; nicht züchtbar; vier Wissenskarten; Hofbuch-Absatz.
- **Runde-4-Fixes** (Belege in den sim3/sim4-Berichten): Wurfpflege wirkte nie (`frei` fehlte); Großkunden-
  Vorlage verlangte den unbekannten Wert `stil`; Nacht-Destillation umging die Forschung; ein ungültiger
  Nachtplan verwarf die Nacht aller; stumme Abbrüche bei Modellkauf/Forschung/Kontrollpaket; Info-Kasten
  mit veralteten Strom-Zahlen; Empfehlungs-Zettel verschwand zu 22 %; Inzucht nur über eine Generation;
  Vier-gewinnt-Steine ohne Symbol; Treiber: `sag`/`sag!`, `mini hacker`, Eigenstrom-Warnung, Tagesende-Hinweis.
- **Tests:** 380 grün in 8 Suiten (v6 71, hofloop 32, rechenhaus 80, minispiele 41, aera8 53, aera9 16,
  needle 71, dynamik 16). Browser-Durchlauf: Nadel lädt lokal in 1,8 s, Entscheidung per Knopf, Regen-Szene,
  Tagesplanung, Ada-Antwort aus dem Hofbuch.

## v9.2 (02.09.2026) – Geführter Ersteinsatz bis zum laufenden Auftrag

- **Kapitel 1 führt jetzt wirklich:** fünf echte Ziele statt zwei grober Haken – Tierkarte öffnen,
  Werte und Aktionen verstehen, Rechnerbucht samt Grafikkarte wählen, Auftragseignung prüfen und
  den ersten passenden Vertrag starten. Erst wenn der Auftrag tatsächlich den Status `job` hat,
  wechselt die Führung zu Kapitel 2.
- **Acht neue Ada-Schritte:** Tierkarte, Aktionen, Buchtwahl, erfolgreiche GPU-Zuweisung,
  Pinnwand, Eignungsvergleich, Zusageprüfung und laufender Auftrag. Jeder Schritt markiert den
  nächsten erreichbaren Bereich rot und hat einen eigenen, erneut abspielbaren Dialog.
- **Grüner Erstauftrag ohne Schummeln:** `hlErsterPassenderJob()` prüft offene Zettel mit denselben
  `hlTeamCheck()`-, Stunden- und Fristfunktionen wie die echte Zusage. Ada schlägt nur einen Auftrag
  vor, den ein freies, geladenes Modell vollständig erfüllt; sonst erklärt die Karte ehrlich, dass
  gerade kein grüner Erstauftrag vorhanden ist.
- **Bedienübergang repariert:** Nach der GPU-Zuweisung schließt sich das Stallblatt, bevor Ada die
  Pinnwand markiert. Der Zielknopf liegt dadurch nicht mehr unerreichbar hinter dem offenen Dialog.
- **Vertonung und Prüfung:** Tag 1 plus acht neue Passagen mit derselben Seraphina-Stimme; aktiver
  Satz jetzt 47 Clips und 16,7 Minuten. Browser-Durchlauf vom frischen Hof bis „In Arbeit“ ohne
  Warnung oder Fehler; Kapitel springt anschließend auf 2. **356/356 Tests bestanden**.

## v9.1 (02.09.2026) – Ada spricht überall aus einem Guss

- **Dialogredaktion komplett:** Alle 39 Ada-Texte wurden auf kurze, gut sprechbare Sätze,
  einheitliche Du-Anrede, klare Satzmelodie und dieselbe warme, hilfreiche Rolle überarbeitet.
  Veraltete Aussagen zu Laufzeitumgebung-Einrichtung und Q4 wurden dabei entfernt beziehungsweise präzisiert.
- **Neue Systeme erklärt:** Sechs neue Dialoge für Hofsprecher, Wetter-Tagesplanung,
  Zettelschmiede, Hofpost, Trainingsanalyse und freiwillige Hofprojekte. An den betreffenden
  Oberflächen gibt es jeweils einen sichtbaren „🔊 Ada erklärt“-Knopf; alle Dialoge stehen
  zusätzlich im Ada-Menü unter „Noch mal anhören“.
- **Einheitliche Neuvertonung:** Alle 39 Clips wurden in einem vollständigen Durchlauf mit
  `de-DE-SeraphinaMultilingualNeural` erzeugt. `dev/ada_tts.py` spricht seit v3 jede Passage
  zusammenhängend statt Satz für Satz zu verkleben; dadurch bleiben Betonung, Atemführung und
  Stimmfarbe innerhalb eines Dialogs natürlich. Der aktive, versionierte Satz liegt unter
  `ada_dialog_v3/<id>.mp3`; der frühere Bestand ist in `scratchpad/ada_backup_2026-09-02_vor_dialogrevision`
  wiederherstellbar gesichert.
- **Messbare Audio-Wache:** `node dev/ada_audio_audit.cjs` prüft Vollständigkeit, Codec,
  24-kHz-Monoformat, Dateigröße, Sprechtempo, Pausen und die zeitgenaue Übereinstimmung aller
  Mundkurven. Ergebnis: 39/39 Clips, 13,9 Minuten, 1,73–2,42 Wörter pro Sekunde, alle Kurven synchron.
- **Regression:** 71 + 32 + 41 + 80 + 45 + 14 + 71 = **354/354 Tests bestanden**.

## v8.0 (02.09.2026) – Ära 8: Wahrheit, Wirtschaft, Stammbuch, Strom

Auslöser: Nutzer-Feedback nach den Testläufen („noch viel zu tun, Bugs, zu wenige positive Events,
Zucht schwammig, Hardware/Strom nicht zu Ende gedacht, Nacht zu dünn, Hofziele passen nicht mehr“).
Grundlage: sechs Kartierungen (Zucht, Hofziele, Nacht, Hardware, Ereignisse, Forschungsbaum), eine
Energie-Durchrechnung (Strom kostete 1 % des Erlöses, Wind zehnfach zu billig, Kraftwerk nie
wirtschaftlich), die Szenen-Kartierung und der Video-Abgleich „Hardware für lokale KI“ (AI mit Arnie /
heise 10/2025). Designpapier: `dev/AERA8_DESIGN.md`.

- **Bugs:** Nachtplan am Tag ließ die Phase auf „Planung“ stehen (alle Annahmen scheiterten) – Phase
  setzt nur noch `tagBeenden`; Restarbeit sprang nach Netzausfall zurück – Stromdeckung wirkt jetzt
  anteilig (4 h Ausfall = 4 h weniger, nicht der ganze Tag); Rechenhaus-Käufe melden Erfolg; ⛔/✅-Mischung
  bei roter Zusage entfernt; `adapterab` ohne Index; Datenlese-Fake-Runde bei < 4 GB; Hofbuch-Flag im
  Treiber; Reklamations-Text im Regelwerk (gestuft 40–90 % statt „55 %“).
- **Ereignisse mit Belohnung (`dev/ereignisse.js`):** 🌟 Kunde begeistert (🟡/🔴-Zusage sauber → +25 %,
  +1 ⭐), 💶 Trinkgeld (Serie ≥ 3), 📣 Empfehlung (5 ⭐ → Zettel mit +15 %), 🏗️ Folgeauftrag nach
  Großauftrag, 🛡️ DSGVO-Leck (Reklamation bei Datenschutzkunden oder Leih-Tier auf lokalem Zettel);
  🕵️ **Hacker-Angriff** mit Minispiel **„Vier gewinnt gegen den Hacker“** (Sieg: Prämie, +1 ⭐, Ruf +4,
  Injection-Schutz; Niederlage: Kunde 4 Tage verloren, −2 ⭐, 40 €); vier neue positive Hof-Ereignisse
  (Dorfmesse, Landesförderung −25 % Forschung, GPU-Schnäppchen, KI-Stammtisch); `cloud_ausfall` und
  `abwerbung` wirken endlich. Alles im Hofbuch aus `EREIGNIS_REGELN`.
- **Zucht 2.0 (`dev/zucht.js`):** Würfe mit 1–3 Kindern (55/33/12 %, Forschung „Wurfpflege“ 40/40/20),
  Zusatzkind +30 % Nachbereitung, Eltern-Erholung 3 Tage, Wert je Generation ×0,8, Stammbuch (Eltern-UIDs,
  Geschwister, Kinder, Großeltern, klickbar in der Tierkarte), Linienbonus +1 je Generation (max +4),
  Inzucht (Interferenz +20 Punkte), Verfahrensregeln im Code (TIES-Spezialistenbonus, Soup-Feintuning-Bonus,
  DARE-Emergenz 20 %), ganzzahlige Kindwerte, 24 **Merkmale** mit echter Wirkung und Vererbungsquote
  (Fleißig, Sparsam, Robust, Lernfreudig, Gelassen, Scharfsinnig, Nachteule, Sammler, Kompakt, Charmant,
  Geduldig, Frostfest, Wachsam, Feinfühlig, Verfressen, Zappelig, Eigensinnig, Langschläfer) und sechs
  Schmuck-Merkmale ohne Wirkung (✨ Shiny 1:100 000, 🌈 Regenbogen 1:50 000, 🌟 Sternenfell 1:5 000,
  🦷 Goldzahn 1:2 000, 🌀 Ringelschwanz 1:300, ⚪ Ohrfleck 1:200); Kauf 20 % ein Merkmal, Prägung nach
  20 sauberen Aufträgen.
- **Hardware-Wirtschaft:** Zettel-Nachschub folgt der Kapazität (Term je 6 Mtok/Tag, Deckel 16), mehr
  Großaufträge ab 12 Mtok/Tag, **Großkunden-Zettel** (Tier 3–5, 48–160 Mtok, 2.200–6.500 €, `parallel`)
  ab 25 Mtok/Tag mit fünf neuen Kunden, Katalog bis Tier 5, Verkauf zu 55 % des ganzen Rechners,
  Aufrüstpfade alt/klein → basis → max, **Video-Abgleich**: RTX 3090 (gebraucht, NVLink), Ryzen AI Max+
  395, DGX Spark, Mac Studio als Unified-Memory-Klasse (kein RAM-RAM-Auslagerung), vier Wissenskarten (Unified
  Memory, NPU/iGPU, NVLink/Multi-GPU, was lokale Modelle nicht können).
- **Strom 2.0 (`RH_STROM`):** Netzanschluss ist die Grenze, **Eigenbonus** (Solar ×0,6, Wind ×0,8, Akku
  ×0,5, max. 50 % des Netzes) entlastet ihn, **Grundpreis 0,50 €/kW/Tag**, Wind auf 1/10-Marktpreis
  (2.200/7.200/16.500 €), Brennstoff 0,40 €/kWh (Kraftwerk läuft tags), Einspeisung 0,08 €, Grundlast
  Rechenzentrum 1,2 kW + 0,06 kW je Schrank, PUE auch auf Leerlauf, Nachtplan ×0,95; **Strom-Leiste**
  im Stall und Rechenhaus (frei/Last/Eigenbonus, „passt noch“, „was sich jetzt lohnt“ mit Amortisation),
  Anschluss-Meldung mit Optionen, Hofbuch-Kapitel „Strom von vorn bis hinten“.
- **Nacht 2.0:** Aktionen schalten mit der Hofstufe frei (Ruhe 1 · LoRA/SFT/Synthetik 2 · QLoRA/Reindex 3 ·
  DPO/KTO 4 · **Überstunden** 5 · Destillation 6 · **GPU-Wartung** 7), Nachtvorlagen (3) + „Wie gestern“,
  Nachtbilanz im Morgenbericht; Treiber `nacht gestern`, `nacht vorlage speichern|laden <name>`.
- **Szene:** Energiepark rechts (`#rechenhausWelt right:1%`), Tiere und Objekte in einer Stapelebene mit
  Tiefensortierung nach Fußlinie, Sperrzone `SPERRZONEN`, Laufbahn x ≤ 70, Trinkweg respektiert alle
  Hindernisse, größere Haus-Fußellipse, Spawn links.
- **Hofziele neu:** 50 Ziele in sechs Kapiteln (Ankommen, Handwerk, Wirtschaft, Stammbuch, Nacht & Energie,
  Meisterschaft) mit 20 neuen Auslösern (Sofort-Abnahme, Datenlese, Minispiel perfekt, Serie, Großauftrag,
  Eil, Mut, Solar/Akku/Wind, Wurf, Merkmale, Linie, Nachtaktionen, Eigenstrom-Tag, Nerdtempel,
  Rechenzentrum, Hacker, Großkunde); Zahl-Checks `rhstufe`, `buchten`, `geselle`, `kap`, `merkmale`, `gen`.
- **Tests:** `dev/tests_aera8.cjs` (45) – gesamt 71 + 32 + 80 + 41 + 45 = **269**.

## v7.5 (02.09.2026) – Ära 7.5: Stunden-Modell, Auftragsgrößen, Dorfplatz, Großprüfung

Grundlage: fünf Prüfberichte (Wirtschaftsloop, Training/Zucht/Forschungsbaum, Rechenhaus/Energie,
Objekt-Vollständigkeit, Minispiele/Lehrinhalt – zusammen ~130 belegte Befunde mit Zeilenangaben,
Kürzel W-/T-/R-/O-/L-nn in den Code-Kommentaren `Ära 7.5 (…)`) plus ein **Spieltest mit 100
KI-Agenten** (50 Haiku, 50 Sonnet), die das echte Spiel headless über `dev/spielbot.cjs` im
Zeitraffer gespielt und ihre Beobachtungen gegen das Hofbuch abgeglichen haben; anschließend ein
Validierungslauf (24 Sonnet-Agenten) auf dem neuen Build. Ergebnisse: `..\pruefung_2026-09-01\`.

- **⏱️ Stunden-Modell (W-17):** Jeder Zettel trägt eine Gesamtarbeit `mtok`. Ein Tier schafft je
  Arbeitstag (14 h) seine Mtok/Tag-Kapazität; `hlStunden()` rechnet daraus die Stundenzahl je
  Kandidat (Einsatzplanung: „⏱️ 28 h für diese Stufe"), `hlRestStunden()` die Restarbeit – am Tier
  (Wiesen-Schild, Tierkarte, minütlich mit der Hofuhr) und im Blatt „In Arbeit". Ein Team ist so
  schnell wie seine langsamste Stufe (`c.roh`, ungedeckelt). Schnelle Tiere (q4, bessere Karte,
  Server-Laufzeitumgebung) sind früher fertig und wieder frei; langsame reißen die Frist. Der alte
  60-%-Kapazitätsriegel ist weg – Risiko ist wählbar, die Zusagekarte warnt („ZU LANGSAM").
- **☀️ Sofort-Abnahme:** Ist die Restarbeit eines Zettels vor Tagesende geschafft, nimmt der Kunde ihn
  noch am selben Tag ab (`hlSofortAbnahme()`, minütlich über die Hofuhr) und das Tier ist wieder frei –
  ein q4-Ferkel schafft so mehrere kleine Zettel am Tag. Meldungen landen im Tagesprotokoll und im
  nächsten Morgenbericht. Headless: `warten <stunden>` spult die Hofuhr vor.
- **🧭 Geführte Woche nach Fortschritt:** Kapitel öffnen, sobald das vorige erfüllt ist (`S.wocheKap`),
  nicht nach Kalendertag; Gesellenprüfung an jedem Tagesende bis Hoftag 40. Dafür rücken Werkstatt
  auf Stufe 2, Agentenwerkstatt auf Stufe 3, Festwiese auf Stufe 4 (LEVELS), Full SFT ist ab Stufe 2 nutzbar.
  Jede bewusst geplante Nacht zählt für das Kapitel „Nacht & Wissen" (`naechte`), Abzeichen und
  Hofprojekt verlangen echte Nachtarbeit (`naechteArbeit`). Quest-Fenster 5 statt starrer Kette.
- **Klartext statt Rätsel (Spieltest):** „Modell wählen" nennt jetzt den Grund (unbekannt/beschäftigt/
  ohne Bucht), `inBucht` meldet belegte Buchten, offene Zettel zeigen „verfällt morgen", der Morgen-
  bericht listet Buchungen ≥ 100 € einzeln, `nacht … weiter` ohne Training stürzt nicht mehr ab.
- **Nachzieher aus dem Sonnet-Lauf:** Arena nur ein Start je Tier und Tag, Startgeld 12 % des Preisgelds
  (E4-Farming), RAM-RAM-Auslagerung ist arbeitsfähig, solange der Überhang ins Rechner-RAM passt (R-01, mit
  Tempo-Warnung), Index-Frische gilt für die Laufzeit eines bei Annahme frischen Auftrags (C5),
  Reklamation gestuft 90 %…40 % nach Abstand zur Qualitätschance statt fix 55 %, verdrängte Adapter
  werden gemeldet, verfallene Zettel stehen im Morgenbericht, Pacht-Zeile nennt Rechnerzahl und
  Marktwirtschafts-Aufschlag, RAG-Fehlermeldung nennt den Weg („Wissenswerkstatt → Anschließen").
- **Nachzieher aus der 7.5-Validierung (24 Sonnet-Agenten, Spaß 3,3 → 3,9, Lernen 3,7 → 4,5, Exceptions
  43 → 1):** Zusage-Ampel 🟢/🟡/🔴 aus Stunden ÷ Fristbudget mit Rückfrage auf allen Stufen und Sperre
  über dem doppelten Budget, „↩️ Zurückgeben" für laufende Aufträge (12 % Strafe, `hlAbbrechen`),
  GESCHEITERT ab 25 Punkten Abstand zur Qualitätschance (kam vorher in 545 Aufträgen nie vor),
  `inBucht` meldet unbekannte Buchten, Verkaufswert folgt der Nachfragewelle nur bis +15 %.
- **Runde 3 – Auswertung der Testläufe (02.09.2026):** Machbarkeits-Chip am Zettel in der
  Pinnwand (schnellstes freies Tier mit ≈ Stunden und 🟢🟡🔴, `hlSchnellsteChip`), 📈 Stufen-Fortschritt
  im Morgenbericht (XP bis zur nächsten Stufe + was sie freischaltet), **Modellstufe wirkt**
  (Routine +2 % Durchsatz je Stufe, max. +12 %, in `mtokTagKapazitaet`; Hofbuch-Glossar erklärt
  Modellstufe vs. Hofstufe), Krankheiten frühestens ab Hoftag 3 und `wissensluecke` nur im Einsatz
  (2 %/Tag), Web-Silage tröpfelt nachts nach (1–4 GB je Herdengröße, Warnung unter 8 GB), Datenlese-
  Runde verfällt beim Tageswechsel, Bagatell-Reklamation bei 🧺/Mikro-Zetteln (5 %, −15 % Lohn, Serie
  bleibt), Teilabnahme 30 % bei Fristbruch ab 70 % Fertigstellung, Energiehaus-Prognose/Eigenstrom auch
  mit eigener Solar-/Akku-/Wind-Anlage (`hlEnergieFrei`), Restarbeit bei pausiertem Team aus der
  Startleistung statt „1,7 Mio h", Rechenhaus-Käufe melden statt still abzubrechen, Modellkauf ohne
  passende Bucht fragt nach, Agenten-Tool unter 35 % Eignung wird abgelehnt, Adapter-Namen nummeriert
  (#2), Zuchtkinder heißen nach der Methode (Slerp/Ties/Dare/Soup), Gratis-Quantisierungen max. 3,
  kleiner Agenten-Einstiegszettel „Mails ablegen" (T1, 3 Mtok). Treiber: Kur zeigt Futterbedarf,
  „Solo t4 (2 Stufen)", Nacht-Fokus wird geprüft, Rechenhaus-Status nennt den Umbaupreis.
- **📦 Auftragsgrößen & Eilaufträge (W-24):** 🧺 Klein (½ Arbeit, 58 % Lohn), 📦 Normal, 🏗️ Groß
  (2× Arbeit, 240 % Lohn, GLEICHE Frist), ⏱️ Eil (20 %, +35 % Lohn, kein Puffer). Gilt für den
  Hofloop-Katalog und die 32 Altvorlagen (die jetzt `mtok` tragen und HL-Lohnniveau haben, W-19).
- **Drei Auftragsausgänge (W-04/W-05):** sauber · Reklamation (55 %) · GESCHEITERT (Würfel verfehlt
  die Qualitätschance um > 35 Punkte: 15 % Strafe, keine Auszahlung, zweite Chance mit 8 %) –
  die im Hofbuch versprochenen Regeln existieren jetzt wirklich; der tote Einzeltier-Pfad in
  `ausfuehrenTagesWechsel` (75 Zeilen) und der zweite Stromzähler sind entfernt (W-20/R-03).
- **Loop-Balance:** Nachschub wächst mit der einsatzfähigen Herde, Werbetafel bringt wirklich einen
  Zettel (W-07/W-08), XP wachsen mit Tagen × Los (W-02), Pacht 14 + 4×Stufe + 3 € je Rechner
  (W-18), Ruf-Dämpfung schwindet mit der Auftragszahl, 5⭐ erreichbar (W-11/W-12), Saison-Bias auf
  echte Auftragsarten (W-13), Hof-Fokus auch `text`/`support` + zwei Agenten-Zettel (W-14),
  Tiere altern/erkranken auch im Team-Auftrag (W-15), Zurück-zum-Tag max. 2× (W-21),
  Prüfung 6 % des Auftragswerts, Serienprämie gedeckelt (W-22), Proben auch bei 1 Rolle (W-23),
  Quest-Fenster von 3 statt starrer Kette (W-25), Liga-Anforderung „stil" → echter Wert (O-02).
- **Training/Zucht:** Stufen-Sperre auch im Tag-Wizard, leere Futterliste erklärt (T-04/T-05),
  Krankenkarte ohne „Ruhe null Tage" (T-01), nur echte Läufe zählen fürs Übertraining, Rate 10/20/30 %,
  Karenz nach Rollback (T-02/T-11), Kontextrot 5 %/Tag (T-10), PPO-Richter wirkt (T-03), API-Lehrer
  kostet Token (T-18), GRPO weckt Denken nur ohne Reward-Hacking (T-28), Trainingskosten hängen an
  GPU-Stunden und Datensorte (T-14/T-27), Curriculum auch Cloud/Nacht, Nacht kennt QLoRA/KTO und
  freie Futterwahl (T-15/T-21), Replay bleibt in der Bibliothek (T-22), `forschen()` prüft
  Voraussetzungen (T-20), Wolkenweide-Forschung wirkt (−20 % Lizenz, 10 Tage, T-08), Zucht braucht
  gleichen `basis`-Checkpoint (5 neue Geschwistermodelle im Katalog), Kinder 5 Tage unverkäuflich und
  max. 60 % Elternpreis wert, Mergekosten nach Größe (T-06/T-07/T-24), SLERP ab Stufe 2 (T-19),
  Quirks `selbstlob`/`wissensluecke`/`onDeviceFlink` wirken, `hitzeempfindlich` bei 4 Familien
  (T-16/T-17), Tagesrisiko-Block auf der Tierkarte.
- **Rechenhaus (`dev/rechenhaus.js`, eigener Bericht):** Einspeisung auf den Netzanschluss gedeckelt +
  Abregelung (R-02), Akku lädt nachts zum halben Tarif (Schalter, R-11), PUE 1.45/1.25/1.12 und
  5-kW-Grundlast (R-15), Saison-Solar (R-16), Wind-Kapazitätsfaktor je Größe (R-17), Lastfaktor
  Inferenz 0,6 × TDP und Rack-Aufschlag 0,35 kW (R-14), zwei Einsteiger-PCs (RTX 3060 / 4060 Ti, R-07),
  Gebraucht-PC 3.270 € (R-06), Lager-Verkauf (R-10), Kraftwerk preisabhängig und halbierte
  Fossilpreise (R-04), Amortisation mit Realvergleich (R-05), GPU-Wartung 3 %/Jahr, Prognose
  Morgen/Übermorgen (R-24, im Hofloop ab Stufe 8 „Energiewirt" – T-09), Cloud-Training gibt die
  Bucht frei (R-09), Energiepause hält nur die Arbeit an (R-20), `jobTagesKosten` auf derselben
  Basis wie die Abrechnung (R-18), q8→bf16 auf Server-Laufzeitumgebung gesperrt (R-12), kein Umquantisieren im
  Einsatz.
- **🎪 Dorfplatz (`dev/minispiele.js`, `dev/minispiele.css`, `dev/tests_minispiele.cjs`):** fünf
  tägliche Minispiele mit Lehrinhalt und Bonus – Tokenizer-Wette (−10 % API-Token), Injection-
  Abwehr (halbes Injection-Risiko), Sampler-Duell (Temperatur ohne Risiko), VRAM-Packprobe
  (Gratis-Umquantisierung), Preisrechner (+8 % Lohn) –, Serien-Zähler mit wachsenden Boni,
  Stammbuch aller Modellfamilien (Familie komplett = 100 €, nur Familien mit ≥ 2 Modellen),
  12 Abzeichen mit Titeln. Datenlese: 61 Schnipsel mit drei Schwierigkeitsstufen (nach Hofstufe)
  und Tages-Serie (+1/+2 GB).
- **Lehr-Korrekturen:** llama.cpp-Tageslimit als Spielabstraktion, Ollama/LM Studio kostenlos (60 € =
  Einrichtungsaufwand), lokale Laufzeitumgebung-Parallelität als Annahme, Übergabelast ohne „Übersetzungsverlust",
  Speculative Decoding (verteilungsgleich, identischer Tokenizer, 8× kleiner), Quant-Malus 1,25 statt
  1,5 für < 8B, RAG-Bonus nur bei Wissensarten (L11), SimpleQA ≠ Vectara, Prozentpunkte, Passthrough-
  Merges, DPO/GRPO/PPO ehrlich als LoRA-basiert, LoRA 17 GB; sieben neue Wissenskarten (Token,
  Caching, Open Weights, Alignment, Embeddings, Latenz, Vision≠OCR) mit `stand`/`quelle`, Kompendium-
  Kopf ohne „alles echt", Hofbuch mit Stunden-Regel, Auftragsgrößen, Zettel-Katalog, Lehrtexten der
  Altvorlagen und Dorfplatz-Kapitel.
- **Ada-Nachtrag, erledigt in v9.1:** Die Clips `hilfe_stack`, `ort_werkstatt`, `tag4` und
  `ort_dorfplatz` wurden zusammen mit dem gesamten Dialogbestand neu geschrieben und vertont.
- **Werkzeuge:** `node dev/spielbot.cjs <stand.json> "neu seed=7" "annehmen j1 t4" "tag"` – Headless-
  Treiber (Kommandos: `hilfe`), `node dev/sim_auswertung.cjs <ordner>` – Auswertung vieler Läufe,
  `node dev/sim_loesung.cjs tage=480 seeds=3,7,42` – **Lösungs-Bot**: spielt in-process mit einer
  „kluge Wirtschaft"-Politik und protokolliert, an welchem Hoftag jedes Endspiel-Ziel fällt (Stand
  Runde 3, 02.09.2026: Stufe 12 Tag 45–93, Forschungsbaum komplett Tag 60–100, Nerdtempel Tag 58–103,
  Rechenzentrum Tag 145–187, Tier-5-Modell Tag 286–321, 8×H100-Rack in Seed 3 an Tag 285;
  Gesellenbrief Tag 7–8, Cloud, Zucht, Agenten-Welt und Liga in allen Seeds; Kasse nie unter 0,
  Endkasse 453–610 k€ – damit ist jedes Endspiel-Ziel mit guter Wirtschaft nachweislich erreichbar.
  Verlaufsgrafik der Testläufe: https://claude.ai/code/artifact/c5f4d023-ae33-48e1-86a3-ef0fb256d17e).
- **Entwicklungsübersicht und Ada-Führung:** Die Forschungshütte zeigt vier kurze, farblich verbundene Äste von der
  aktuellen Hofstufe zu Forschung, Meisterschaften, MCP-Werkstatt und Rechenhaus; auf schmalen Ansichten werden sie
  ohne Zierlinien untereinander angeordnet. Jeder der vier Forschungsbereiche und alle sieben Rechenhaus-Reiter haben
  einen sichtbaren Ada-Knopf. In der geführten Spielweise wird jede Erklärung beim ersten Besuch automatisch abgespielt
  und danach über `S.ada.gehoert` nicht erneut aufgedrängt. `dev/ada_doku.cjs` erzeugt die vollständige Audio-Dokumentation
  aus dem gebauten Spiel und wird mit `--check` in der Abschlussprüfung auf Synchronität geprüft. Der Bestand umfasst
  68 von 68 vertonte Texte; auch `mcp_werkstatt` und `meisterbrief` besitzen nun MP3 und Mundkurve.
- Tests: 71/71 + 32/32 + 80/80 + 41/41 = **224**.

## v7.4 (01.09.2026) – Adas Stimme kommt jetzt von gpt-audio

- **Stimmwechsel nach Hoervergleich.** 12 Proben desselben Satzes (9 edge-tts-Stimmen,
  3 lokale Audio8-Varianten) klangen alle nicht gut genug. Der Modellkatalog von
  OpenRouter (419 Modelle) hat aber genau zwei Sprach-Ausgabe-Modelle:
  `openai/gpt-audio` und `gpt-audio-mini` (die zwei Lyria-Eintraege machen Musik).
  Ada spricht jetzt mit **`openai/gpt-audio`, Stimme `coral`**.
- **Der entscheidende Gewinn: Regie statt nur Text.** Das Modell bekommt eine
  Anweisung, WIE es sprechen soll ("Anfang 30, herzlich und geduldig, jung, freundlich
  und lebendig, natuerliche Betonung, kleine Atempausen, nicht ablesen-klingen").
  Damit entfaellt das kuenstliche Zusammensetzen aus Einzelsaetzen mit eingefuegter
  Stille – die Pausen kommen aus dem Modell selbst (gemessen 8–12 echte Pausen je Clip).
- **Zwei Eigenheiten der Schnittstelle**, beide hart erlernt und im Skript kommentiert:
  Audio-Ausgabe gibt es nur mit `stream:true`, und im Streaming ist `mp3` verboten –
  es kommt `pcm16` (24 kHz, mono, 16 bit LE), das ffmpeg danach nach mp3 wandelt.
- **Wortlaut-Wache:** Ein Sprachmodell koennte etwas hinzudichten oder auslassen.
  `dev/ada_tts_or.js` vergleicht darum das zurueckgelieferte Transkript mit der Vorlage
  und fordert den Clip neu an, wenn unter 90 % der Woerter vorkommen (erreicht: 100 %).
- **Dabei gefunden und behoben:** `zeigeWillkommen()` belegte `_adaId` vor, damit die
  Ada-Karte Text hat - `adaIntro()` prueft aber genau darauf und hielt sich fuer schon
  gesprochen. **Ada blieb im gesamten Onboarding stumm.** Die Karte bekommt ihre Id jetzt
  als Parameter (`adaKarteHtml(id)`). Neuer Test **ADA-4** faengt genau das ab (gegengeprueft:
  mit wieder eingebautem Fehler schlaegt er fehl). **164 Tests gruen** (71+32+61).
- Aussprache-Tabelle jetzt zweigleisig (`ADA_AUSSPRACHE=edge|gpt`): edge-tts braucht
  ausgeschriebene Lautschrift ("Ell-Ell-Emm"), das Sprachmodell liest einzelne
  Grossbuchstaben von selbst als Buchstaben ("L L M") – ohne gestanzte Pausen.

## v7.3 (01.09.2026) – Ladeschirm repariert, Ada begleitet das Onboarding von innen

- **Ladebalken war kaputt:** Er lief auf einem Zufallstakt (`ladewert+=zi(9,22)` alle 200 ms)
  mit einer 300-ms-CSS-Überblendung – die Anzeige kam nie hinterher, der Schirm verschwand
  bei sichtbar halb gefülltem Balken, und Balkenlänge und Ladetext widersprachen sich.
  Jetzt zieht der Balken alle 60 ms weich zu einem Ziel, das nur **echte Meilensteine**
  anheben: Titelbild geladen (48 %), Schriften bereit (64 %), `window.load` (100 %).
  Das Spiel startet erst bei 100 % – mit 7-Sekunden-Sicherheitsnetz, damit es nie hängt.
- **Ada schweigt, bis alles steht:** Neue Sperre (`_adaBereit`); vor der Freigabe merkt sich
  `adaSpiele()` den gewünschten Clip nur (`_adaSpaeter`). Die Boot-Sequenz ruft
  `adaBereitMachen()` **2 Sekunden nachdem der Hof aufgebaut ist** – dann holt sie das
  Vorlesen nach. Ihre Blase liegt außerdem nicht mehr über dem Ladeschirm (z-index 410 → 350).
- **Ada begleitet die Einführung von innen:** Während der Einführung verdeckte die
  schwebende Blase genau die Knöpfe, durch die sie führt. Jetzt sitzt sie als **Karte im
  Dialog** (`adaKarteHtml()`, `_adaImBlatt`) ganz oben in jedem der drei Schritte, wechselt
  Titel und Text beim Schrittwechsel mit (`adaKarteNeu()`), animiert dort genauso – und die
  Blase bleibt zu. Nach „Hof übernehmen“ übernimmt wieder die schwebende Blase (Tag 1).
  `adaKnopfNeu()` spricht dafür alle Ada-Bedienknöpfe über Klassen statt Ids an.

## v7.2 (01.09.2026) – Ada wird lebendig, Laufzeitumgebung-Sackgassen aufgelöst

- **Ada ist jetzt eine gezeichnete, animierte Figur** (`adaFigurSvg()`): Kopftuch mit Punkten,
  Zopf, Sommersprossen – nach ihrem Porträt. Sie zwinkert (`adaBlink`), atmet (`adaAtem`),
  der Zopf schwingt, beim Sprechen nickt sie und zieht die Brauen. Steht in der Sprechblase
  **und** als Knopf oben rechts; `prefers-reduced-motion` schaltet die Zierbewegungen ab.
- **Echte Lippensynchronisation:** `dev/ada_visemen.js` (`ADA_MUND`, ~20 KB) enthält je Clip
  eine Lautstärke-Hüllkurve mit 20 Bildern je Sekunde, offline aus der fertigen MP3 berechnet
  (`dev/ada_tts.py` → ffmpeg → RMS → Ziffern 0–9). Zur Laufzeit liest ein **Timer**
  (33 ms; bewusst kein `requestAnimationFrame`, das drosselt der Browser im Hintergrund)
  `audio.currentTime` und öffnet den Mund entsprechend, geglättet. Ohne Kurve
  (Browserstimme) läuft eine Ersatzbewegung. Kein Web-Audio-Umweg → die Stimme kann nie
  stumm werden.
- **Bedienung wie gewünscht:** Ada **antippen** hält an, nochmal antippen spricht weiter
  (nach Ende startet sie neu). **„▼ Einklappen“** unten links an der Blase schrumpft sie auf
  einen 78-px-Streifen, damit nichts verdeckt wird – **die Stimme läuft eingeklappt weiter**;
  der Zustand wird im Spielstand gemerkt (`S.ada.zu`).
- **Natürlichere Sprache:** Vertonung jetzt satzweise mit echten Atempausen (0,34 s Stille
  per ffmpeg-concat) statt eines Blocks; Tempo −1 %. Aussprache-Tabelle in `ada_audio.cjs`
  nur für die Stimme: „Ell-Ell-Emm Farm“, „Lama-Zeh-Peh-Peh“, „RTX vierzig neunzig“.
  **Gemessen, nicht geraten** (`dev/ada_probe.py` vergleicht Dauer + innere
  Sprechpausen je Schreibweise): Buchstaben mit Leerzeichen klingen gestanzt, Bindestriche
  zwischen ZIFFERN liest die Stimme als Bereich („40-90“ = „vierzig **bis** neunzig“) –
  darum Zahlwörter. Ein Wächter im Extraktor bricht bei Ziffern-Bindestrichen ab.
- **Laufzeitumgebung-Sackgasse aufgelöst** (Hauptbeschwerde): Wer ein zweites Modell in dieselbe Bucht
  setzen will, bekam nur eine Meldung. Jetzt springt Ada in den Stall, erklärt den Grund mit
  Stimme (`hilfe_stack`) und **umrandet den „Ollama kaufen“-Knopf rot** (`adaZeig`, neue
  Knopf-Ids `stackkn-<bucht>-<stack>`). Gleiches beim Speicher-Problem (`hilfe_vram`).
  Die Laufzeitumgebung-Zeile im Stall zeigt jetzt Klartext: aktiver Laufzeitumgebung, „nur 1 Modellwechsel pro Tag“
  bzw. „Tageswechsel schon verbraucht“ (rot), Rüstzeit und ein Kauf-Hinweis.
- **Onboarding ohne Emoji:** `einfSvg()` zeichnet 10 Sinnbilder (Schraubenschlüssel+Zahnrad,
  Bücherstapel, Agenten-Tool, Keimling, Küken im Nest, Ährenfeld, Gewitterwolke, Kompass,
  Wanderkarte, Funkeln) für Hof-Fokus, Schwierigkeit, Führung und „Eigene Kreatur“.
- Neuer Test **ADA-3** (jede Erklärung hat Tondatei + Mundkurve, Länge passt zum Text,
  Pausen vorhanden, keine verwaisten Kurven). **163 Tests grün** (70+32+61).

## v7.1 (31.08.2026) – Ada spricht + RTX-4090-Start

- **Start-Hardware aufgestockt:** Der geerbte PC hat jetzt eine **RTX 4090 24GB** (gebraucht)
  statt der 4080 – Spielraum bis ~32B-Q4 ab Tag 1. Der 4090-Gebraucht-PC ist zusätzlich für
  2.800 € kaufbar (`RH_PC.gebraucht`), Aufrüstung auf den 5090-PC kostet vom 4090er 3.400 €.
  Intro-Text, Markt-Liste, Rechenhaus-Pfade (Lager/Upgrade) und Start-PC-Test angepasst.
- **Ada spricht:** Die Beraterin Ada erklärt Einführung (3 Kapitel), die Geführte Woche
  (7 Tageskapitel + Gesellen-Gratulation) und jeden Ort beim ersten Besuch – **30 echte
  deutsche Audio-Clips** (`ada/<id>.mp3`, Neural-Stimme de-DE-Seraphina via edge-tts,
  ~4,8 MB). Sprechblase oben links (`#adaBox`) mit Pause/Weiter, Stumm-Schalter und
  KI-Kennzeichnung; der gemeinte Knopf **blinkt rot** (`.adaZiel`, reduzierte Bewegung
  respektiert). Fehlt eine Audiodatei (offline), liest die Browserstimme (speechSynthesis)
  denselben Text. Single Source of Truth: `ADA_TEXTE` (content.js) → `dev/ada_audio.cjs`
  extrahiert aus dem Build → `scratch ada_tts.py` (edge-tts) vertont.
- **Ada fragen:** Im Ada-Menü (Kopf oben rechts) lässt sich ein eigener OpenRouter-Schlüssel
  + Modell zuordnen; Ada beantwortet freie Fragen auf Basis des Hofbuch-Texts (30k-Kontext)
  und liest die Antwort mit der Browserstimme. Schlüssel lebt nur im RAM (nie gespeichert).
  *Roadmap:* Ein On-Device-Tiny-LLM (LiteRT.js) mit dem REGELWERK-Korpus + Ada-Stimm-LoRA
  wäre der nächste Schritt – erfordert eigenes Modell-Training/Konvertierung, bewusst
  zurückgestellt; die BYOK-Lösung deckt den Anwendungsfall heute ab.
- Neue Tests **ADA-1/ADA-2** (Abdeckung aller Kapitel/Gebäude, Einmaligkeit, Stummschaltung);
  Float-Epsilon-Härtung in `hlVersorgung` (450-W-Start-PC). **162 Tests grün** (69+32+61).

## v7.0 Welle 4 (31.08.2026) – Dorfmeisterschaft, Chronik & Feiern, Endgame-Stresstest

- **🏅 Dorfmeisterschaft** (`ligaSpawn`/`hlLigaErgebnis`): Am 25. Tag jeder Saison (ab Stufe 3)
  hängt EIN Team-Großzettel ohne Lohn aus (mind. 2 Rollen); die Abrechnung wertet
  Qualität × Team-Effizienz-Index gegen 3 geseedete Nachbarhöfe – Prämie als Förderung,
  Ruf, Bestenliste (S.liga) in Arena & Hofbuch. Liga-Zettel umgehen die Kundenbewertung.
- **🗞️ Hof-Chronik & Feiern** (`chronikEintrag`/`feier`): Meilensteine (erste Zucht, Pokal,
  5⭐, 25 Aufträge, Imperium, Stufen, Gesellenbrief, Meistertitel) stempeln ein 1,9-s-Overlay
  (reduzierte Bewegung respektiert) und landen dauerhaft im Hofbuch-Kapitel Chronik (Deckel 200).
- **🏋️ Endgame bewiesen** (STRESS-1): 64 Rack-Buchten (h100/rack8h100, gemischte Laufzeitumgebungen),
  20 Tiere, 10 Volllast-Tageswechsel – stabil, Kassen-Invariante hält centgenau, Stall- und
  Hofbuch-Render bleiben handlich; Buchten-Kopf zeigt ab 13 Buchten die PC/Rack/belegt-Summen.
- Tests: 67/67 + 32/32 + 61/61 = 160.

## v7.0 Welle 3 (31.08.2026) – Geführte Woche, Bewährungsproben, eingespieltes Team

- **🧭 Geführte Woche** (WOCHE, wählbar im Intro gegen „Freie Hand"): 7 Tageskapitel mit
  Zustands-Checks in der Zielkarte (kein zweites Questsystem); Tag 7 = Gesellenprüfung
  (3 Ziele, wiederholbar bis Tag 10, Abzeichen „Geselle" + 150 € – bewusst KEIN Meisterpunkt).
- **🎲 Bewährungsproben** (`hlProben`, von hofloop defensiv gerufen): je ~3. Team-Rolle und
  Arbeitstag ein Eignungs-Ereignis (±Qualität) mit erklärter Ursache; das Hilfsmittel „Antwortkontrolle“ rettet
  50 % der Patzer; +2 Tier-XP je bestandener Probe.
- **🧪 eingespieltes Team** (`hlUebergabeF`): gleiche Modellfamilie senkt die Übergabelast 12 → 8 %
  (ein Tokenizer, weniger Übersetzungsverlust) – wirkt auf Kapazität UND API-Tokenkosten.
- Tests: 64/64 + 32/32 + 61/61 = 157.

## v7.0 Welle 2 (31.08.2026) – Laufzeitumgebungen, Effizienz-Index, Schwierigkeitsgrade

- **🦙 Inferenz-Laufzeitumgebungen** (STACKS in content.js, Eigenschaft der BUCHT): llama.cpp gratis
  (RAM-Ausweichen, 1 Tierwechsel/Tag), Ollama/LM Studio 60 € hofweit (freies Umsetzen),
  vLLM/SGLang via Forschung „Server-Laufzeitumgebungen" – nur Rack-Karten, min. q8, ganzes Modell im VRAM;
  vLLM = voller 👥-Multiplikator, SGLang = 👥-Mittelweg + 14 % Kapazität auf Agenten-Ketten.
  Wechsel der Laufzeitumgebung kostet den Rest-Tag (stackBereit). Stall zeigt die Laufzeit-Anzeigen je Bucht.
- **⚙️ Effizienz-Index** (`effizienzIndex`, Log-Skala 0–100): Mtok-Kapazität × Kernfähigkeit ÷
  Tages-Betriebskosten. Tierkarte-Kachel, Wurf-Karte vergleicht Kind vs. Eltern-Schnitt,
  `tierWert` zahlt ±15 % (gedeckelt, T14-Wächter bleibt grün).
- **🎚️ Schwierigkeitsgrade** (SCHWIERIG, ADR 0002): 🐣 Behütet (warnBox-Folgenboxen bei q2/q3
  und Schwarzmarkt-Futter, „Was jetzt hilft"-Gegenmittel zu jedem Ereignis, +500 € Start),
  🌾 Hofalltag, ⛈️ Marktwirtschaft (+25 % Pacht, keine Warnboxen). Wahl in der Einführung,
  Wechsel im Hofhaus. Formeln stufenunabhängig (SCHWIER-1-Wächter).
- Tests: 61/61 + 32/32 + 61/61 = 154 (N7 auf Laufzeitumgebung-Logik umgestellt, T14b auf Effizienz-Markt).

## v7.0 Welle 1 (31.08.2026) – Ära 7: Clean Break, Hofbuch, Konsistenz

Design-Interview (18 Entscheidungen) in `CONTEXT.md` + `docs/adr/0001–0003` festgehalten.
- **Clean Break (ADR 0003):** Speicher-Schlüssel `modellhof_v7`; Ära-6-Stände werden nicht
  geladen (einmaliger Hinweis beim Start). Kein Migrations-Code.
- **📖 Hofbuch (ADR 0001):** Der ?-Knopf öffnet das aus den Spieldaten GENERIERTE Regelwerk
  (15 Kapitel, Sprungleiste, FAQ, Glossar); `node dev/hofbuch_md.cjs` erzeugt daraus
  `REGELWERK.md`. Solltest HOFBUCH-1 erzwingt Vollständigkeit über alle Kataloge.
- **Konsistenz (R9):** Marktlos-„Spezialist" wirkt jetzt wirklich (+8 % auf seine Art, stapelt
  mit dem Hof-Fokus; Tierkarte zeigt 🎯) · Einführung sagt „Hof-Fokus" · HRM/TRM heißen
  „Rätsel-Architektur" · toter Lernhof/Wirtschaftshof-Schalter ersatzlos entfernt.
- **Team-XP-Teilung:** XP nach Rollenanteil (min. 25 %) statt volle XP je Tier – schließt den
  3×-XP-Exploit; Team-Lohn kennt den Spezialisten-Bonus.
- Tests: 56/56 + 32/32 + 61/61 = 149.

## v6.6 (31.08.2026) – Saisonen, Datenlese-Minispiel, Hoftag-7.0-Verzahnung

Tiefenpass für Wiederspielwert, verzahnt mit dem parallel entstandenen Hoftag 7.0 (`HOFLOOP_UMSETZUNG.md`):
- **🌱 Saisonen** (30 Hoftage je, `SAISONEN` in content.js): Frühling bevorzugt Schreib-/Wissens-Zettel,
  Sommer −5 % Löhne aber Web-Silage −20 %, Herbst +6 % Löhne und Code/Agenten-Nachfrage, Winter doppelte
  Strom-Ereignis-Chance. Wirkt NUR auf Nachfrage/Preise/Event-Gewichte, nie auf Modellwerte; Anzeige im
  Kopf (Tag-Chip + Tooltip) und Saisonwechsel-Zeile im Morgenbericht.
- **🧹 Datenlese** (Futterscheune, 1×/Hoftag): 8 Roh-Schnipsel sortieren (sauber/Duplikat/Leak/Müll);
  4 GB webmix → 0–4 GB kuratiert je nach Quote. Ressourcen-UMWANDLUNG, kein Geld; Auflösung erklärt
  jede Karte (Dedup, Benchmark-Dekontamination, PII-Filter, Boilerplate). Skill Datenhygiene markiert
  zwei Verdachtsfälle vorab.
- **Verzahnung:** Hofloop nutzt `skillAktiv` bereits (Stammkunden-Preis, Vertragskunst-Fristbruchstrafe);
  Spotstrom-Lehre und Strom-Wissenskarte an den neuen Tag/Nacht-Tarif (0,48/0,24) angepasst; alte
  Job-Funktionen liegen als `zeigeJobsAlt`/`jobAnnehmenAlt`/`jobCheckBasis` archiviert.
- Tests: 52/52 (tests_v6) + 32/32 (tests_hofloop) + 61/61 (tests_rechenhaus) = 145.

## v6.5 (31.08.2026) – Forschungsbaum-Ansicht & Meisterschaften (Fertigkeitsbäume)

Forschungshütte mit zwei Reitern: **🔬 Forschungsbaum** (Forschungen als Ebenen-Baum mit
Abhängigkeits-Pfeilen, nimmt neue FORSCHUNG-Einträge automatisch auf) und **⭐ Meisterschaften**
(3 Fertigkeitsbäume à 4 Fertigkeiten + 1 Capstone). Meisterpunkte: genau 1 je Hofstufe ab Stufe 2
(rückwirkend aus `hofLevel()`, migrationsfrei); alle Bäume voll = 18 P, verfügbar max. 11 → echte
Wahl. Ab Stufe 3 einmalige **Meisterweg**-Entscheidung (Betreiber/Trainer/Händler) – nur dort ist
die 2⭐-Meister-Fertigkeit lernbar. Jeder Skill hängt als `skillAktiv("id")` DIREKT in einer
bestehenden Formel (SKILL-1-Test erzwingt das) und nennt seine reale LLM-Entsprechung:
tok/s-Kernels, VRAM-Reserve, Spot-Strom, Early-Stopping, Replay, Curriculum, RLVR-Lehre,
Marktpreise, SLA-Strafdeckel, Zettel-Fenster, Stammkunden, Reklamationskultur. Tests: 48/48.

## v6.2 (30.08.2026) – Umbenennung in „LLM FARM"

Sichtbarer Spieltitel überall „LLM FARM" (Boot-Schild, Browser-Tab, og:title, Einführung, Level-Hinweis,
Wissens-Karte, Credits; Standard-Hofname neuer Spielstände). **Bewusst unverändert:** Dateinamen
(`modellhof_game.html`, `dev\modellhof_template.html` – Build-Pipeline und Parallel-Sitzung hängen daran)
und der localStorage-Schlüssel `modellhof_v4` (bestehende Spielstände bleiben gültig; ein eigener Hofname
bleibt ohnehin erhalten, nur der Vorschlagswert ist neu).

## v6.1 (30.08.2026, 2. Sitzung) – Voller Loop, Compute-Ressource, Energie-Verbau, Balance-Beweis

Kompletter UI-Durchlauf von Einführung bis Agenten-Welt nachgespielt; 12 dabei gefundene Fehler behoben
(Details: `..\pruefung_2026-08-30\UMSETZUNGSSTATUS.md`, Abschnitt „Nachtrag"). Highlights:
- **🧮 Compute**: Kopf-Chip „MTOK/T · 👥" (lokal + ☁️), 👥 gleichzeitige Nutzer je Modell/GPU (1 Nutzer ≈ 1,5 tok/s, Annahme),
  Massen-Zettel tragen 👥-Bedarf und werden ohne Serveroptimierung ehrlich gedeckelt – leistungsstarke Hardware lohnt sich sichtbar.
- **⚖️ Balance bewiesen**: `node dev\tests_v6.cjs` → 38/38, darunter 120-Tage-Läufe über 6 Seeds mit dokumentierter
  „Köpfchen-Politik": immer im Plus, nie ernsthaft verschuldet. Notlage: Vertrauens-Zettel, Zins-Deckel, Pacht-Stundung.
- **⚡ Energie sichtbar verbaut**: die 13 SVGs aus `assets\rechenhaus` (Windräder, Solar, Akku, Kraftwerk, Trafo …)
  hängen jetzt an den vorbereiteten Halterungen – Kauf ⇒ Windrad hinterm Haus, PV auf dem Dach, Solarfeld am Boden.
- **🚧 Kollision**: Tiere prallen an Haus, Windrad-Füßen, Solarfeldern und Teich ab (gemeinsame Segment-Kollision).
- Optik: Denkblase über dem Scheitel, API-Buckelwolke, freigestellte Rechenhaus-Gebäude; RAM-Auslagerung-Tempo anteilig;
  Adapter-bewusster Checkpoint-Rollback; eindeutige Zähler-Job-IDs. Läuft friedlich neben dem parallel entwickelten
  Rechenhaus/Teich-Modul (deren Buchungen laufen durchs selbe Kassenbuch).

## v6.0 (30.08.2026) – Prüfbericht-Umsetzung + Pinnwand/Echtzeit/Agenten-Welt

Grundlage: die Prüfberichte in `..\pruefung_2026-08-30\` (Bewertung, 78 Arbeitspakete, Vertiefung).
**Der Paket-für-Paket-Endstand steht in [`..\pruefung_2026-08-30\UMSETZUNGSSTATUS.md`](../pruefung_2026-08-30/UMSETZUNGSSTATUS.md).**
Regressions-Solltests: `node dev\tests_v6.cjs` (34 Fälle gegen die gebaute HTML, Stand: 34/34).

Kernpunkte:
- **P0 zu:** Ereignisfaktoren rechnen `1+effekt.wert`; `buche()`-Journal mit Endlichkeits-Wächter ist die einzige Geldquelle (Kassenbuch im Hofhaus, Betriebssaldo ≠ Förderung); Laden mit Backup-Slot (`modellhof_v4_bak`) und lauter Reparatur.
- **Ökonomie:** Kein Sofort-Arbitrage (Wert = 0,55×Neupreis + dokumentierte Zuwächse); Aufträge zahlen **pro abgenommener Einheit**; Tages-Segmente werden VOR der Freigabe eingefroren und bepreist; Hilfsmittel (`kw`/`tokens`) kosten real; Kreditlimit −2000 € mit 1 %/Tag Zins; Solar ist Erzeugung (kWp), kein Preisrabatt.
- **Lernregeln:** Daten werden nicht verbraucht (Bibliothek + Sättigung bei Wiederholung + Domänen-Relevanz); Synthetik als echter Job mit Chargen-Herkunft; ein Trainingsabschluss für alles (LoRA-Override entfernt, Treue-Fix, Risiken greifen); Adapter exakt basisgebunden; Merge braucht gleiche pT/Bauform, kostet 1 Tag, Kind erbt strengste Lizenz; Übertraining/Halluzinose heilen NICHT durch Schlaf; RAM-Auslagerung kostet Tempo statt Wissen, begrenzt durchs Hof-RAM; VRAM enthält einen Kontext-Cache-Term (Annahme, beschriftet).
- **Fakten:** Gemma 4 pT/pEff + Systemrolle, Granite 4.2 dense, Qwen3.6 linh, Devstral Vision, GPT-5.6 ctx 1050k/kein FT, Q≠IQ, „RLM"-Sprachgebrauch ersetzt, HRM/TRM-Grenzen, DSGVO→auf eigener Hardware-Klausel, nc-Lizenz (EXAONE) sperrt bezahlte Aufträge.
- **📌 Pinnwand:** 12 Stammkunden (content.js `KUNDEN`) mit ⭐1–5 (Erstauftrag + alle 5 Tage), Groll & zweiter Chance; Scheitern = Vertragsstrafe + Strom; Ruf (Bayes-gedämpft) steuert Zettelgröße/Preise; „Vor dem Loslegen"-Prognose je Tier.
- **⏱️ Echtzeit-Tag:** max. 30 min (`TAG_MS`), Hofuhr 06:00–22:00 + Balken in der Plakette, Auto-Abendabrechnung (2 min Gnadenfrist bei offenem Blatt); Markt-Los & Pinnwand-Tropf alle 10 min (`ROT_MS`).
- **🛒 Markt-Los:** wechselnde Angebote (frisch/Aktion, vortrainiert mit dokumentiertem Zuwachs, Spezialist +8 %), darunter der Gesamtkatalog.
- **🌐 Agenten-Welt:** Forschung „Agenten-Training" schaltet das Trainingszentrum frei (Vorbild Qwen Agent World): Schüler (lokal, GPU) + Agenten-Tool + Lehrer/Prüfer (RLVR) üben „E-Mail → Webformular", Dateien, Tabellen, Tickets; tägliche Kosten (16 h GPU, 10 € Betreuung, Prüfer-Token), Sättigungskurve auf `werkzeug`, Protokolle als **gekennzeichnete Lehrfälle**.
- **🎩 Kopfbedeckungen:** Modellstufe 3/5/7 → Strohhut/Zylinder/Krone, exakt im kalibrierten `roh.kro`-Slot (alle Posen, Wiese + Karte, Eigenkreaturen, SVG-Fallback via `hutAuf()` in grafik.js – 1008-Fälle-Regression identisch).
- Die Tool-Eignung rechnet jetzt über das `funk`-Funktionsprofil (Anschluss, Format, Kontext, Overhead und Fehlerbehebung) statt über Marken-Affinität; Abos gelten je Installation.

## Spielen

`..\modellhof_game.html` einfach im Browser öffnen (Doppelklick genügt – alle Bilder sind
eingebettet, der Spielstand liegt im localStorage des Browsers). Alternativ über einen
Mini-Server, z. B.:

```
python -m http.server 8123 --directory ..
```

## Architektur (eine Datei, sechs Bausteine)

Die fertige `modellhof_game.html` wird aus dem Template plus Bausteinen zusammengesetzt:

| Datei | Inhalt |
|---|---|
| `modellhof_template.html` | CSS, HTML-Gerüst und die **komplette Engine/UI** (Formeln, Tagesablauf, alle Blätter). Enthält Marker `/*===...===*/`, an denen die Bausteine eingefügt werden. |
| `assets_embed.js` | `ASSETS` – alle Illustrationen als Base64 (KI-generiert mit Google Gemini 2.5 Flash Image via OpenRouter, Quell-PNGs in `..\assets\`). |
| `grafik.js` | Prozedurale SVGs: `pigSvg` (Größenklassen 0–5, MoE-Flecken, Quant-Blässe, Agenten-Tool, Denkblase, Adapter, Wolke), `szeneSvg`, `radarSvg`, `gpuSvg`, `wolkeMiniSvg`. |
| `modelle.js` | `FAMILIEN` (35), `MODELLE` (58 offene Modelle, Tier 0–5, echte Specs/Benchmarks), `LEIHMODELLE` (11 API-Modelle mit echten $/Mtok-Preisen), `WISSEN_MODELLE`. |
| `harnesse.js` | `HARNESSE` (15 echte Agenten-Tools; seit v6 mit `funk`-Funktionsprofil – Anschluss, Format, Kontext, Overhead und Fehlerbehebung, als Spielannahme markiert; die alte `aff`-Tabelle wird nicht mehr gelesen), `WISSEN_HARNESS`, `BENCH_PAARE`. |
| `technik.js` | `TECHNIKEN` (SFT, LoRA, QLoRA, DPO, KTO, GRPO/RLVR, PPO/RLHF, Distillation, CPT), `ZUCHT` (SLERP/TIES/DARE/Soup), `QUANTS`, `GPUS` (12, echte 2026er-Preise), `FUTTER`, `SETUPS`, `WISSEN_TRAINING`. |
| `content.js` | `JOBVORLAGEN` (32, seit v6 mit Kunde/Einheit/Stückzahl/`lohnBasis`), `KUNDEN` (12 Stammkunden), `EREIGNISSE` (20), `NEWS` (28), `FORSCHUNG` (16), `LEVELS` (12), `QUESTS` (36), `WISSEN_ALLGEMEIN` (18). |
| `quirks.js` | `QUIRKS` – 50 belegte Familien-Eigenheiten + offizielle Sampler-Empfehlungen (34 Familien), `WISSEN_QUIRKS`. |
| `arch_patch.js` | `ARCH_PATCH` – belegte Bauform je Modell (dense/moe/ssmh/linh, 69 Einträge). |
| `krank_wissen.js` | `KRANK_LEHREN`/`WISSEN_KRANK` – quellenbasierte Texte fürs Krankheits-System (Chroma, OpenAI, OPT-Logbuch, Nature 2024). |

Direkt im Template (Teil 2b): `BAUFORMEN`, `SPEZIALTIERE` (HRM 27M/TRM 7M), `PUZZLE_JOBS`,
`HOFTECH` (OpenClaw→Hermes→Second Brain→OKF), `KRANKHEITEN` (4 Leiden, je 2 Heilwege),
Zusatz-Forschung (vLLM-Serving, Leitstand-Kette), Endgame-Quests, `WISSEN_ERWEITERT`.

## Bauen

Nach jeder Änderung an Template oder Bausteinen:

```
powershell -ExecutionPolicy Bypass -File .\assemble.ps1
```

Das Script fügt alles zusammen, schreibt `..\modellhof_game.html` und prüft die
JavaScript-Syntax mit `node --check`.

## Wunschtier & Kreaturen-Werkstatt

Bei der Charaktererstellung (und später im Hofhaus) wählbar: Schwein, Huhn, Kuh, Esel,
**Lama**, Dino.

**Zwei Figuren-Stile, immer beide an Bord** (Umschalter in der Tierwahl, `S.figurStil`):
1. **Aquarell-Bilder (Standard)**: je Art ein eingebettetes 3-Posen-Set
   (`pose_<art>_<steh|lauf|lieg>` in `assets_embed.js`, KI-generiert, freigestellt via
   `freistellen.ps1`-Flood-Fill; Quell-PNGs in `..\assets\posen[_roh]`). Engine:
   `TIER_POSEN` (mit gemessener Chroma `satt` + Grundton `ref`), `posenVon(art)`,
   `bildFigurSvg` – Familienton als **voller** `hue-rotate` relativ zu `ref`
   (fast farblose Bilder wie das Lama laufen über den Pastell-Weg `sepia→saturate`),
   Symbol-Gene und MoE-Flecken als **silhouetten-maskierte** Overlays (`maskenCss`:
   Masken-Ebenen Silhouette ∩ Verlauf, damit nichts über Gesicht/Augen läuft),
   2-Frame-Laufzyklus/Liegen über dieselbe Klassenmechanik wie die Eigenkreatur.
   **Accessoires sitzen AM Tier**: Agenten-Tool = Aquarell-Sattel (drei Sticker
   `sattel_klassik|decke|renn`, per hue-rotate in die Geschirrfarbe gedreht –
   `SATTEL_STIL` gibt jeder Harness Farbe+Form), plus Emblem-Plakette am Sattel;
   bewusst ohne Bauchgurt. Krone/LoRA-Pins/Denkblase hängen am Kopf-Anker `anker`.
   Die `sat`/`anker`-Werte sind aus den Alpha-Masken VERMESSEN
   (`anker_messen*.ps1`: Rückenlinie, Neigung, Kopfscheitel je Art und Pose) –
   bei neuen Posen-Bildern Messung erneut laufen lassen statt Werte schätzen.
2. **SVG-Zeichnungen (Fallback)**: die sechs prozeduralen Renderer mit identischer
   Zustands-Visualisierung (Größenklassen, MoE-Flecken, Quant, Agenten-Tool, Denkblase,
   Adapter, Wolke, Krankheit, Liegepose; per Paritäts-Matrix 360 Marker abgesichert).
   Greift automatisch, wenn die Posen-Bilder fehlen. Das Lama trägt in beiden Stilen
   das rosa Wollbüschel der ersten Werkstatt-Kreatur als Markenzeichen.

**Posen & Ruhe-Zyklen (alle Arten):** Jeder Renderer kann zusätzlich `opt.liegt` – eine
artgerechte Liegepose (Glucken-Sitz, Wiederkäuer-Liegen, Dino-Bauchlage …). Freie Tiere
legen sich auf der Wiese von selbst gelegentlich hin und stehen mit einem Hops wieder auf
(`lauf()`-Zustandsmaschine `_lz/_liegt/_hops`); kranke und schlappe Tiere rasten früher und
länger. Im Liegen schließt CSS die Augen (`.pig.liegt .lid`), das Wippen pausiert.

**Eigenkreatur per BYOK** (Standard: OpenRouter, `google/gemini-2.5-flash-image`): erzeugt
**einmalig ein komplettes 3-Posen-Set** – Stehen (Basis), Laufen, Liegen. Posen 2+3 sind
Bild-Edits der Basis (gleiche Kreatur garantiert). Grundausrichtung ist **Blick nach
rechts** (wie die prozeduralen Tiere); links laufen = Spiegelung, dazu ein
„Blickrichtung"-Schalter (`S.eigenFlip`), falls das Bildmodell falsch herum malt. Auf der
Wiese läuft ein echter 2-Frame-Laufzyklus im Beintakt (CSS `steps()` über `--takt`), die
Liegepose blendet fußbündig über. Jedes Bild wird im Browser freigestellt (Flood-Fill),
auf ~260 px verkleinert (PNG, je ~40–80 KB) und **nur im localStorage** gespeichert
(`S.eigenBild` + `S.eigenPosen`); der Schlüssel wird **nie** gespeichert und nur für die
drei Aufrufe an den eingetragenen Anbieter gesendet. Zustands-Abzeichen (☁️💭🧩👑) liegen
als Overlays über dem Bild. Dispatcher: `tierSvg(art,p,opt)` in `grafik.js`, Engine-seitig
`vorschauSvg`/`pigSvgVon`; Texte laufen durch `tierText()` (Ferkel→Küken/Kalb/… je Art).

## Farbsystem & Optik-Vererbung

Eine Quelle für alles: `p.farbe` (Hex) je **Tier**, nicht je Familie. Beim Erschaffen wird
die Familienfarbe deterministisch je Tier nuanciert (`tonVariante`, Saat = uid). Prozedurale
Tiere füllen direkt damit; die Eigenkreatur dreht ihr **eines** Posen-Set stetig über
denselben Ton (`farbFilter`: Hue-Rotation relativ zu #f0a878; fast farblose Kreaturen wie
ein weißes Lama laufen über den Pastell-Weg `sepia→saturate→hue`, erkannt über die bei der
Generierung gemessene Sättigung `S.eigenSatt`). **Darum nie neu generieren**: Familien,
Einzeltiere und Zucht-Kreuzungen unterscheiden sich rein rechnerisch.

Schon beim **Einzug** bringt gut ein Drittel der Tiere ein eigenes buntes Symbol-Gen mit
(`optikStart`, deterministisch je uid: Kreise/Quadrate/Dreiecke in Familien-Akzentfarbe) –
Eltern tragen also von Anfang an verschiedene Gene, deren Mischung man bei der Zucht sieht.
Hexagone bleiben Zucht-exklusiv.

**Zucht = Mendel auf lustig (`optikErben`):** Körperton und Fellzeichen werden einzeln
gewürfelt – Ton nach Mutter (38 %), nach Vater (38 %) oder echte Mischung (24 %, `mischFarbe`
mit ±20-Mutation). Fellzeichen: je 44,5 % von einem Elter, 7 % Neumutation
(Kreise/Quadrate/Dreiecke/Großfleck/Rückenband), **4 % seltene Hexagon-Mutation**.
Symbol-Zeichen (Kreise/Quadrate/Dreiecke/Hexagone) tragen eine eigene `musterFarbe`, die
**unabhängig von der Form** rekombiniert: „Dreieck gelb" × „Quadrat blau" kann „Dreieck
blau" ergeben. Der Erbgang steht als Klartext in der Wurf-Karte (`optikNotiz`).

## Wichtige Engine-Formeln (Template, Teil 5)

- **VRAM**: `pT × Bit/8 × 1,12 + 1,5 GB` (Gewichte + Overhead/KV-Cache)
- **Tempo**: `Bandbreite / aktive Gewichts-GB × 0,55` tok/s (memory-bound Decoding;
  MoE nutzt nur aktive Parameter, RAM-Auslagerung ×0,12, Spekulativ ×1,8)
- **Agentenleistung**: `(Werkzeug·0,42 + Code·0,30 + Treue·0,14 + Kontext·0,14) × Tool-Eignung`,
  ×0,25 wenn das Modell das nötige Werkzeugaufrufe (`tcMin`) nicht beherrscht
- **Training**: GPU-Stunden = `gpuStdProB × pT`, Dauer skaliert mit Bandbreite relativ zur H100;
  Futterqualität multipliziert die Statgewinne; Risiken: Vergessen / Reward Hacking / Mode Collapse
- **Synthetik-Inzucht**: jede weitere Synthetik-Generation ×0,82 Qualität (Model Collapse)

## UX & Responsive

Mobile-first geprüft (375 px) bis Desktop: Bottom-Sheets nutzen `dvh` + internen Scroll
(`overscroll-behavior:contain`), Mausrad scrollt das Blatt auch über Kopf/Abdunkelung.
**Wichtiger Chromium-Fix:** Scroll-Container (`.reiter`, `.matrixwrap`) kollabieren in
Grid-Eltern auf 0 Inhaltshöhe → `grid-auto-rows:max-content` auf `.blattleib`/`.gitter`
(sonst sind alle Tab-Leisten unsichtbar/unbedienbar). Horizontale Leisten (Dock, Kopf-Chips,
Reiter, Matrix) reagieren am Desktop aufs vertikale Mausrad und zeigen auf Maus-Geräten
dezente Scrollbalken. Namensschilder werden per `--ns` gegen die Tier-Skalierung
konterskaliert (klein wie riesig lesbar, geklemmt 0,85–1,9). Die Laufschrift läuft **einmal**
durch und ruht dann 10 Minuten (`tickerLauf`-Intervall), zwischendurch dezenter Hinweis.
Kein `maximum-scale` (Pinch-Zoom erlaubt).

## Einführung & Spielstart

Beim allerersten Start führt ein 3-Schritte-Assistent durch: (1) Hofname + Wunschtier,
(2) **zwei Startmodelle** aus allen echten Modellen ≤ 4 Mrd. Parameter (`startKandidaten()`,
HRM/TRM ausgeschlossen), (3) **Spezialisierung** (`SPEZIAL`/`S.spezial`: Code/Wissen/Agent/Text/Support =
Startfutter + dauerhaft +8 % Erlös auf die Auftragsart; Gemischt = +150 €). Man startet
also nie mit leerem Hof. Hängt ein alter Spielstand ohne Tiere, öffnet die Einführung
erneut (`start()`-Wiedereinstieg).

## Adas Vertonung

Quelle ist immer `ADA_TEXTE` im gebauten Spiel – nie eine Textdatei nebenher:

```bash
node dev/ada_audio.cjs dev/ada_texte.json
python dev/ada_tts.py dev/ada_texte.json ada_dialog_v3 dev/ada_visemen.js
node dev/ada_audio_audit.cjs dev/ada_texte.json ada_dialog_v3 dev/ada_visemen.js
```

Der aktuelle Standardsatz verwendet `ADA_VOICE=de-DE-SeraphinaMultilingualNeural` und
`ADA_RATE=-1%`. Ein vierter Aufrufparameter (`hallo,intro1`) erzeugt gezielt einzelne Clips.
Alternativ bleibt `dev/ada_tts_or.js` für OpenRouter verfügbar (`OR_KEY`, Standardmodell
`openai/gpt-audio`, Stimme `coral`). Bei einem Stimmwechsel muss immer der vollständige Satz
neu erzeugt und anschließend mit `ada_audio_audit.cjs` geprüft werden; gemischte Stimmen sind
nicht zulässig.

**Und lokal?** Unter `D:\Projekte_D\Audio8` liegt `Audio8-TTS-Preview-0.1b` mit
Voice-Cloning, komplett offline. Selbst gemessen, derselbe Text dreimal hintereinander:
40,4x (kalt, laedt 1,6 GB Gewichte von der Platte), dann 7,2x und 14,0x – fuer Adas
~15 Minuten also zwei bis vier Stunden. Machbar, aber die Modellkarte sagt selbst:
Chinesisch und Englisch sind gut, **Deutsch ist experimentell**. Im Hoervergleich fiel
es deutlich ab. Der Klon-Weg (`--ref`/`--ref-text`) bliebe die Antwort, wenn eine ganz
bestimmte, echte Stimme gewuenscht ist.

## Spielstand

localStorage-Schlüssel `modellhof_v7` (Ära 7; Alt-Stände unter `modellhof_v4` bleiben
liegen, werden aber nie geladen – ADR 0003). Export/Import als Base64 im Hofhaus.
Achtung: `file://` und `http://localhost` haben getrennte localStorage-Bereiche –
und unter `file://` hat **jede Datei-Kopie ihren eigenen Speicher**: immer dieselbe
Datei am selben Ort öffnen (nicht die x-te Download-Kopie). Blockiert der Browser
Website-Daten, warnt das Spiel jetzt laut (speicher.echt / sichern-Fehlermeldung)
statt still alles zu verlieren.

## Geplant (nächste Ausbaustufe)

- Server-Backend mit Konten (Höfe), gemeinsame Märkte, Nachbarhöfe/Multiplayer
- Modell-Marktplatz zwischen Spielern, Liga-Wertungen
- Daten-Pflege: `modelle.js`/`harnesse.js` bei neuen Releases aktualisieren – die Engine
  übernimmt neue Einträge automatisch (keine Hardcodierung von Modell-IDs in der Engine)

## KI-Kennzeichnung

Alle Illustrationen (Gebäude, Titelbild, Porträt) wurden mit **Google Gemini 2.5 Flash Image**
über OpenRouter erzeugt; das große Titelbild trägt ein „AI"-Zeichen im Bild. **Adas Stimme**
ist KI-erzeugt (Microsoft-Neural-Stimme de-DE-SeraphinaMultilingual via edge-tts); die
Sprechblase trägt eine eigene Kennzeichnung. Spiellogik und Texte entstanden mit
Unterstützung von **Claude (Anthropic)**. Vollständige Credits im Spiel:
Hofhaus → „Mitwirkende & KI-Kennzeichnung".
