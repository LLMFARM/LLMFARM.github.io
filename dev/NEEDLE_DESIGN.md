# Ära 9 · „Nadel & Schmiede“ – Design-Papier (Stand 02.09.2026)

Ziel der Spielerin: weg von handgeschriebenen Zetteln und Ereignissen, hin zu einem
fluiden, dynamischen Hof, bei dem **jede Partie anders** ist – mit Needle 2, echten
Gerätewerten, Wetterbericht für die Solarplanung und „ein bisschen Magie“.
Oberste Regel bleibt: **nur Wahrheit.** Jede Zahl im Spiel kommt aus dem Regelwerk,
ist im Hofbuch erklärt und per Test nachrechenbar. Kein Modell darf Zahlen erfinden.

## 0. Was Needle 2 wirklich ist (geprüft am 02.09.2026)

Quellen: huggingface.co/Cactus-Compute/needle2 (Apache-2.0), github.com/cactus-compute/needle,
eigene Messungen mit `pip install cactus-needle` (2.0.11) und der WebAssembly-Engine in Node 22.

| Eigenschaft | Wert |
|---|---|
| Parameter | 45 Mio. (44,9 M), 27 Schichten, hidden 512, GQA 8/4, Vokabular 8 192 |
| Gewichte | `needle2.cact`, 13,7 MB, „Cactus Quants“ ≈ 2,2 Bit je Gewicht |
| Laufzeit | eine C++-Engine ohne Abhängigkeiten; WebAssembly-Build `needle.js` (62 kB) + `needle.wasm` (333 kB) |
| Arbeitsspeicher | ≈ 28 MB je Sitzung |
| Kontext | **256 Token gleitendes Fenster**, Werkzeugschemata als „KV-Sinks“ fest eingeblendet |
| Ausgabe | **nur JSON** (Werkzeugaufrufe / Extraktion), per Byte-Grammatik erzwungen; sonst `[]` |
| Werkzeugwahl | eingebauter Retrieval-Kopf: von vielen Werkzeugen sehen nur die **Top 5** je Anfrage den Kontext |
| Vertrauen | Konfidenz-Kopf 0…1, kalibriert für die Trainingsdomänen (Smart-Home, Medien, Produktivität …) |
| Sprache | Trainingsdaten proprietär, **Englisch**; Deutsch nur teilweise (siehe Messung) |
| Tempo | Hersteller: 500 tok/s auf Raspberry Pi 5, 300–700 auf Handys unter 200 $; unsere WASM-Messung in Node: 45–110 tok/s Decode, 3–4 s je Befehl; Laden 65 ms, Werkzeug-Index 2,5 s |
| Benchmarks (Hersteller) | Mobile Actions 63,7 %, BFCL v4 single-turn 42,6 % (93,4 % wohlgeformt), Seal-Tools 32,6 % / 28,7 % |
| Was es NICHT kann | freien Text schreiben, plaudern, Zusammenfassungen, Wissen erklären, Zeitungen, Quests erfinden, RAG über Dokumente |

Eigene Messung (12 Hof-Werkzeuge, 25 Befehle): Englisch 24/25 richtig; Deutsch 14/22 richtig
(„beende den tag“, „kauf drei solarpanels“, „kauf ein 20 kW windrad“, „zeig mir das kassenbuch“ klappen;
„stell t3 auf eigenstrom“ → falsches Werkzeug, „erforsche guardrails“ → falsches Werkzeug,
„verkauf t5“ → falsches Werkzeug). Die Konfidenz ist bei unseren (fachfremden) Werkzeugen kein
verlässlicher Wächter (0,07 bei richtigem Solar-Kauf, 0,80 bei falschem Modell-Kauf).

**Folgerung.** Needle 2 ist das richtige Werkzeug für *Steuerung per Klartext* (Device Use) und
für *Extraktion in Struktur* – nicht für Inhalte. Inhalte (Zettel, Kunden, Ereignisse, Zeitung)
kommen aus einer prozeduralen Schmiede mit Saat je Partie; Needle bekommt im Spiel genau die
Rolle, die es im echten Leben hat. Das unterscheidet uns von der eingereichten Ideenliste
(„Ada mit RAG“, „Zeitung schreiben“, „Quests generieren“): das kann dieses Modell nicht,
und wir behaupten es auch nicht.

## 1. Architektur in drei Schichten

1. **Regelwerk (Wahrheit)** – alle Zahlen: Löhne, Fristen, Mtok, Strom, Wetter, Wahrscheinlichkeiten.
   Unverändert testbar (tests_*.cjs), im Hofbuch dokumentiert.
2. **Zettelschmiede (Varianz)** – erzeugt je Partie aus einer Saat eigene Auftraggeber, Anliegen,
   Wendungen, die Hofpost und gewichtet Ereignisse nach Hoflage. Deterministisch je Saat,
   ohne Netz, ohne Modell. Jede Wendung verändert Zahlen nur in dokumentierten Bändern und
   zeigt die Änderung als Chip.
3. **Hofsprecher (Steuerung)** – Klartext oder Stimme → Werkzeugaufruf → **Vorschau → Bestätigung**
   → bestehende Spielfunktion. Stufe 1 deutscher Wörterbuch-Parser (exakt, offline, getestet),
   Stufe 2 Needle 2 im Browser (Englisch und freie Formulierungen), Stufe 3 optional Ada-Cloud
   (OpenRouter-Schlüssel, wie bisher) für freie Fragen. Kein Aufruf ändert den Hof ohne Bestätigung.

Dateibesitz (parallele Umsetzung):

| Teil | Dateien | Wer |
|---|---|---|
| A Hofsprecher + Needle-Laufzeit | dev/needle.js, dev/hofsprecher.js, needle/ (Assets), Template: Ada-Menü, Hofbuch-Kapitel „Hofsprecher“, tests_needle.cjs | Hauptsitzung |
| B Zettelschmiede | dev/zettelschmiede.js, dev/tests_zettel.cjs, Hofbuch-Kapitel über eigene Funktion `zsHofbuchHtml` | Agent B |
| C Nadel-Asset | dev/modelle.js (Modell `needle2`), dev/technik.js (Geräte `pi5`, `esp32p4`), dev/content.js (Wissenskarten), Template nur: tokps/passtInBucht/jobCheck-Sonderfall Nadelklasse, Markt-Text | Agent C |
| D Wetter 2.0 + Runde-4-Fixes | dev/rechenhaus.js, dev/hofloop.js, dev/ereignisse.js, dev/zucht.js, dev/minispiele.js, dev/spielbot.cjs, Template nur die benannten Funktionen, Test-Ergänzungen | Agent D |

Andockstellen sind bereits eingebaut: `zsVeredeln(j, vorlage)` am Ende von `hlJobNeu` (hofloop.js)
und `jobNeu` (Template), `zsMorgen(bericht)` direkt nach `hlMorgen(bericht)`,
`zsKundenRegistrieren(o)` am Anfang von `standAuffuellen(o)`. Marker in Template und assemble.ps1:
`/*===ZETTELSCHMIEDE===*/`, `/*===NEEDLE===*/`, `/*===HOFSPRECHER===*/`. Die drei Moduldateien
existieren als Stubs; der Build (assemble.ps1) und alle fünf Test-Suiten sind grün.

## A. Hofsprecher (Klartext-Steuerung) – Spezifikation (Hauptsitzung)

- **Werkzeugkatalog** `HS_WERKZEUGE` (≈ 30): status, kassenbuch, wetterbericht(tage), zettel_zeigen,
  auftrag_zeigen(id), annehmen(id, tiere[]), abbrechen(id), tag_beenden, warten(stunden), nacht_planen(tier, art, fokus),
  nacht_gestern, energie_modus(tier, auto|eigen), solar_kaufen(n), akku_kaufen(n), wind_kaufen(kw), kraftwerk_kaufen(kw),
  nachbar_vertrag, pc_kaufen(variante), rechenhaus_ausbauen, modell_kaufen(id), verkaufen(tier), forschen(id),
  training(tier, technik, fokus), futter_kaufen(sorte, gb), rein(tier, bucht), raus(tier), quant(tier, stufe), denken(tier),
  kur(tier), pruefen(tier, zettel), zeige(ort), hofbuch(kapitel), hilfe.
  Jedes Werkzeug: deutscher Name, englische Beschreibung (für Needle), Parameter-Schema, `vorschau(args)`
  (Text + Kosten + Risiko, ohne Nebenwirkung), `ausfuehren(args)` (ruft die existierende Spielfunktion),
  `gefahr` (0 = nur anzeigen, 1 = Geld/Zustand, 2 = unumkehrbar: Verkauf, Abbruch).
- **Stufe 1 – Wörterbuch-Parser** (deutsch, deterministisch): Normalisierung (Kleinschreibung, Umlaute,
  Zahlwörter „drei“ → 3, Ids t3/j12/b4, Modell-Ids aus MODELLE, Forschungs-Ids/-Namen, Technik-Ids),
  Verb-Synonyme (kauf/kaufe/besorg → kaufen; beende/schluss/feierabend → tag_beenden; …),
  Objekt-Wörter (solar/panel/modul; akku/speicher; windrad/wind; zettel/auftrag; …).
  Ergebnis: {werkzeug, args, sicherheit: 'exakt'|'vermutet'} oder null.
- **Stufe 2 – Needle 2** (nur wenn Stufe 1 nichts findet oder die Spielerin es erzwingt):
  Web Worker lädt `needle/needle.js` (lokal, sonst Hugging Face), `needle2.cact` per fetch mit Fortschritt,
  Cache API `llmfarm-needle-v1` für Offline-Betrieb; `needle_init` einmal je Werkzeugkatalog;
  `needle_complete(text, 160)` → JSON `function_calls`, `confidence`, `decode_tps`. Ergebnis wird gegen
  das Schema geprüft (Enum, Ids existieren) und als *vermutet* markiert. Zeitbudget 8 s, sonst Rückfall.
- **Stufe 3 – Ada-Cloud**: wie bisher (adaFrage) für freie Fragen; unverändert.
- **Vorschau & Bestätigung**: jede Aktion zeigt Kartenvorschau (Kosten, Frist, Chips) und Knöpfe
  „Machen“ / „Lieber nicht“; gefahr 2 zusätzlich Klartext-Warnung. Nur-Anzeige-Werkzeuge laufen sofort.
- **Stimme**: Web Speech API (`de-DE`) als Mikrofon-Knopf, Ergebnis landet im Textfeld; Antwort liest
  die Browserstimme (adaTTSText). Fehlt die API, bleibt das Textfeld.
- **Ehrlichkeit in der Oberfläche**: Hinweiszeile „Nadel versteht Englisch am besten; Deutsch teils –
  deshalb siehst du immer erst eine Vorschau.“ Anzeige von Konfidenz und tok/s nach jedem Needle-Aufruf.
- **Treiber**: spielbot-Kommando `sag <Text>` nutzt nur Stufe 1 (ohne WASM) und meldet den geplanten
  Werkzeugaufruf + Vorschau; `sag! <Text>` führt ihn aus. tests_needle.cjs prüft Parser-Fälle (≥ 40 Sätze).

## B. Zettelschmiede – Spezifikation (Agent B)

Zweck: jede Partie eigene Kundschaft und Anliegen, ohne die Balance zu verlassen.

1. **Saat**: `zsSaat()` = `S.hofloop.saat` (existiert je Partie, siehe `hlStand()` in hofloop.js). Eigener
   Zufall `zsRnd(schluessel)` über einen Hash aus Saat + Schlüssel (z. B. wie `rhSeed(tag, salz)` in
   rechenhaus.js), damit Ergebnisse je Partie deterministisch und testbar sind. Für Ziehungen, die pro
   Aufruf neu sein sollen (welche Vorlage), darf weiter `Math.random()`/`zufall()` benutzt werden – aber
   Kunden-Identität und Textbausteine hängen an (Saat, Zähler).
2. **Dynamische Auftraggeber** (`S.kundenDyn`): bei Bedarf erzeugt aus Bausteinen – Branche (≥ 25: Imkerei,
   Tischlerei, Physiotherapie, Ferienhof, Musikschule, Brauerei, Apotheke, Architekturbüro, Reitstall, Steuerbüro,
   Weingut, Fahrschule, Zahnarztpraxis, Pflegedienst, Landhotel, Kita, Bestattungshaus, Gärtnerei, Metzgerei,
   Schreinerei, Optiker, Buchhandlung, Segelverein, Feuerwehr, Jugendzentrum, Solarteur, Heizungsbauer …),
   Name (Vorname-/Nachname-/Firmenwort-Listen), Ort (Umland: Oberwiesen, Lindenbach, Hohenfurt, Sankt Ulrich,
   Birkenau, Am Weiher …), Emoji, Eigenart (ungeduldig, sparsam, gesprächig, datenschutzstreng, technikbegeistert,
   perfektionistisch …), Geduld 0–2, lokalPflicht (Medizin/Recht/Pflege/Steuer immer true). Struktur exakt wie
   KUNDEN-Einträge (n, z, branche, arten, tiers, geduld, lokalPflicht, kommentarGut, kommentarSchlecht) plus
   `dyn:true`, `ort`, `eigenart`. Registrierung: `Object.assign(KUNDEN, S.kundenDyn)` (KUNDEN ist ein
   const-Objekt in content.js – Eigenschaften dürfen ergänzt werden); `zsKundenRegistrieren(o)` wird beim Laden
   mit dem Spielstand-Objekt aufgerufen (Parameter ist der Stand, nicht S!). Bestehende Stammkunden bleiben.
   Anteil dynamischer Kunden je Zettel: 45 % (tier ≤ 2), 30 % (tier 3–4), Großkunden (`gross`) bleiben fest.
   Höchstens 12 dynamische Kunden je Partie; danach werden bestehende wiederverwendet (Stammkundschaft).
   Die Kunden-Chips in `zeigeJobs`/Zettelkarte (Template Zeile ~4504 und hofloop.js Zeile ~247) lesen
   `KUNDEN[j.kunde]` – dynamische Kunden erscheinen damit automatisch; `kundeBewerten` funktioniert unverändert.
3. **Anliegen** (`zsVeredeln(j, vorlage)`): behält alle Zahlen der Vorlage; ersetzt/ergänzt Text:
   `j.t` (Titel-Kern der Vorlage bleibt, optional mit Orts-/Kundenbezug), `j.b` (2–3 Sätze aus Satzbausteinen:
   Anlass, Gegenstand, Erwartung – passend zu art/tier, mindestens 6 Bausteine je Slot und Art), `j.kunde`
   (dyn oder fest, passend zu `arten`/`tiers` des Kunden), `j.wendung`.
   **Wendungen** (max. eine, 35 % der Zettel, Chip auf der Karte, im Hofbuch dokumentiert):
   „Stammkunde“ (+8 % Lohn, nur wenn Kunde ≥ 4 ⭐), „Knauserig“ (−10 % Lohn, +1 Tag Frist), „Referenz“
   (+1 Ruf-Bonus bei sauberer Abnahme), „Vertraulich“ (dsgvo:true, +12 % Lohn), „Vorkasse“ (30 % des Lohns
   sofort bei Annahme, bei Fristbruch zurück), „Testballon“ (Größe S, aber Folgeauftrag-Chance +25 %).
   Bänder sind hart: Lohn ±12 %, Frist ±1 Tag. Umsetzung über die bestehenden Felder (lohnBasis, tage, dsgvo,
   groesse) in der Veredelung; für Vorkasse/Referenz/Testballon liefert das Modul `zsBeiAnnahme(j)` und
   `zsBeiAbschluss(j, gut, bericht)`; die Aufrufe in hofloop.js (hlTeamStart nach der Vereinbarung,
   hlTeamAbschluss nach der Buchung) baut **Agent D** an je genau einer Stelle ein, geschützt mit
   `typeof … === 'function'`. Chip-Text: `zsWendungChip(j)` (HTML-String oder '') – die Einbindung in die
   Zettelkarten (Template `zeigeJobs`-Pinnwand und hofloop `zeigeJobs`) übernimmt die Hauptsitzung.
   Ereignis-Zettel (`j.empfehlung`, `j.folge`, `j.zweiteChance`) werden nicht veredelt.
4. **Hofpost** (`zsMorgen(bericht)`): 1–2 Zeilen „📰 Hofpost“ im Morgenbericht, nur aus wahren Fakten:
   gestern abgeschlossene Zettel und Kundenstimmung (S.journal / S.kunden), Wetterausblick (`rhPrognose(2)`,
   sofern vorhanden), bekannte Termine (Saisonwechsel in N Tagen, Dorfmeisterschaft am 25. Saisontag),
   Marktlage (aktive Einträge in S.events), plus höchstens ein **als Gerücht gekennzeichneter** Satz
   („Gerücht: …“, trifft zu 60 % zu – Wahrheitsquote im Hofbuch). Gerücht-Mechanik: `S.zs.geruecht=
   {id, tag, wahr}`; `zsErzwungenesEreignis()` liefert am Folgetag die Ereignis-Id, falls `wahr` – den
   Aufruf in der Template-Ereignisziehung baut die Hauptsitzung ein. Die Hofpost darf nie eine Zahl
   nennen, die nicht aus S oder rhPrognose stammt.
5. **Ereignis-Gewichtung** (`zsEreignisGewicht(e)`): Faktor 0,5–2,5 je Hoflage (viele Leih-Tiere → Cloud-
   Ausfall ×2; Solar/Wind im Hof → Strom-Ereignisse ×1,5; ≥ 3 Kunden einer Branche → passende News;
   frisch gezüchtet → Zucht-Ereignisse; Anfangsphase (Tag < 6) → schlechte Ereignisse ×0,5). Nur Gewichtung,
   keine neuen Effekte. Den Aufruf in der Template-Ziehung baut die Hauptsitzung ein.
6. **Hofbuch** `zsHofbuchHtml()`: erklärt Saat, Kundenbausteine, Wendungsbänder, Hofpost-Wahrheitsregel.
   `Object.assign(window,{…})` für alle zs-Funktionen am Dateiende.
7. **Tests** `dev/tests_zettel.cjs` (≥ 12, gleiche VM-Harness wie tests_aera8.cjs): Determinismus je Saat,
   andere Saat ⇒ andere Kunden/Texte, Wendungsbänder eingehalten (Lohn ±12 %, Frist ±1), Kunden nach
   `standAuffuellen` wieder in KUNDEN, Hofpost-Wetterzeile stimmt mit rhPrognose überein, Gerücht-Quote über
   300 Tage zwischen 50 und 70 %, kein Zettel ohne gültigen `kunde`, Kunden-Obergrenze 12, Ereignis-Zettel
   bleiben unverändert.

## C. Nadel-Asset – Spezifikation (Agent C)

1. **Modell `needle2`** in MODELLE (Tier 0, „Nadelklasse“): n „Needle 2 (Nadel)“, fam neu `cactus`
   (FAMILIEN: n „Needle“, org „Cactus Compute“, farbe „#5c7cfa“, muster „punkte“, land „GB“),
   basis „needle2“, pT 0.045, pA 0.045, moe false, ctx **0.256** (k), lic „Apache-2.0“, licF true,
   vision false, tc 2, rz 0, preis 15, rel „2026-08“, `nadel:true`,
   w: werkzeug 58, treue 48, logik 18, kontext 6, schreiben 3, wissen 4, code 5 (bewusst: kann nur Werkzeug
   und Struktur). txt/fakt mit den echten Zahlen aus Teil 0 (14 MB, 45 M, 28 MB RAM, 256 Token, JSON-only,
   Englisch). Kein Denkmodus, kein Vision. Zucht: `zuchtbar:false` – `mergeKompatibel` (Template) lehnt mit
   Klartext ab („Nadelklasse hat keine kreuzbaren Gewichte in dieser Familie“); Agent C ergänzt dort eine Zeile.
   Startkandidaten (`startKandidaten`) dürfen die Nadel NICHT enthalten (sie taugt nicht als Erstmodell).
2. **Geräte** in GPUS (technik.js): `pi5` „Raspberry Pi 5 (8 GB)“ vram 0, watt 8, bw 17, preis 90, tier 0,
   `nadel:true`, `nurNadel:true`, txt mit echten Werten (Needle 2: 500 tok/s, 28 MB RAM); `esp32p4`
   „ESP32-P4 Board (32 MB PSRAM)“ vram 0, watt 1, bw 1, preis 15, tier 0, `nurNadel:true` (120 tok/s Spielannahme,
   gekennzeichnet). RH_PC-Variante `pi` in rechenhaus.js **nicht** anfassen (Agent D besitzt die Datei) –
   stattdessen liefert Agent C in technik.js ein Objekt `NADEL_GERAETE={pi:{gpu:'pi5',cpu:'Cortex-A76 (4 Kerne)',
   ramGB:8,ssdTB:0.1,preis:120,nurNadel:true},esp:{gpu:'esp32p4',cpu:'RISC-V 400 MHz',ramGB:0.03,ssdTB:0,preis:20,
   nurNadel:true}}`; die Aufnahme in RH_PC und den Rechenhaus-Katalog übernimmt die Hauptsitzung.
3. **Regeln im Template** (nur diese Stellen): `passtInBucht(p,b)`: Bucht mit `nurNadel` nimmt nur `nadel`-Modelle
   (Klartext in jobCheck/inBucht: „Dieses Gerät trägt nur die Nadelklasse (≤ 0,2 B)“); `nadel`-Modelle passen
   in jede Bucht. `tokps(p)`: für `nadel`-Modelle 500 auf pi5, 120 auf esp32p4, 1200 auf jeder GPU
   (Spielannahme, im Text gekennzeichnet). `vramPig` bleibt (0,045 × bpw/8 ≈ 0,01 GB). jobCheckBasis:
   `j.ctxMin > (m.ctx)` gilt ohnehin – prüfen, dass die Meldung „Kontextfenster 256 Token zu klein“ lautet,
   sonst eine Zeile ergänzen. `mtokTagKapazitaet`: Nadel ×0,6 Rüstfaktor (Kommentar „Spielannahme“),
   ergibt ≈ 15 Mtok/Tag auf dem Pi.
4. **Wissenskarten** (content.js WISSEN_ALLGEMEIN, kat betrieb, je quelle/stand „09/2026“):
   „Needle 2 – ein Modell in 14 MB“, „Werkzeugaufrufe: Text rein, JSON raus“, „Warum 45 Millionen Parameter nicht
   plaudern können“, „Kleinstgeräte: Raspberry Pi, Handy, ESP32“.
5. **Hofbuch**: Glossar-Eintrag „Nadelklasse“ und Absatz im Hardware-Kapitel (echte Werte, was geht / was nicht)
   über eine Funktion `nadelHofbuchHtml()` in technik.js, die die Hauptsitzung ins Hofbuch einhängt.
   Markt-Text (Template, Viehmarkt-Karte): bei `nadel` ein Chip „🪡 Nadelklasse · nur Werkzeug & Struktur“.
6. **Tests** (tests_aera8.cjs, Block NADEL-1..6): Modell existiert mit den Werten; Pi-Bucht lehnt ein 4B-Modell
   ab; Nadel passt in den Pi; tok/s = 500 auf Pi; Mikro-Zettel „post“ (HL_AUFTRAEGE) ist mit der Nadel
   annehmbar (jobCheck ok), „stimmung“ (schreiben ≥ 24) nicht; ein Zettel mit ctxMin 4 (k) nicht.

## D. Wetter 2.0 + Runde-4-Fixes – Spezifikation (Agent D)

### D1 Wetter 2.0 (rechenhaus.js, hofloop.js)
- `rhWeather(tag, normal=false, saat)` mit `saat` = `S.hofloop.saat` (Standard über `rhSaat()`; ohne S: 1),
  Salz je Größe (wolke: saat+1, wind: saat+2 …). Tests, die `rhWeather(tag)` mit `rhPrognose` vergleichen,
  bleiben gültig; `rhWeather(tag,true)` (Normjahr) unverändert.
- **Wetterlagen mit Gedächtnis**: Wolken und Wind über 3 Tage geglättet (0,55 × Vortag + 0,45 × Tageswürfel,
  rekursiv über die Saat berechenbar, kein Zustand), damit Hochdruck-/Frontphasen entstehen und eine Prognose Sinn hat.
- Neue Tagesbilder: „Sturm“ (wind > 0,48 → 5-kW-Kleinwind schaltet ab: Beitrag 0, größere Klassen ×0,6;
  Solar ×0,8), „Hitzetag“ (Sommer, wolke > 0,85, jeder vierte Sonnentag → PUE +0,08 an diesem Tag),
  „Nebelmorgen“ (Herbst, jeder dritte Wolkentag → Solar ×0,8). Alles nur über Faktoren in rhSim/rhLast.
- `rhWetterbericht(n=3)` liefert Zeilen {tag, name, z, pvF, windF, tipp}; Tipp aus echten Zahlen
  („bester Solartag: übermorgen ×1,4 – Training dorthin legen“, „Sturm morgen: Kleinwind aus“).
- Morgenbericht (hlMorgen): eine Zeile „🌦️ Wetterbericht: heute … · morgen … · übermorgen …“ (immer),
  Strom-Leiste/Energiegarten nutzen dieselbe Funktion. Hofbuch-Absatz im Strom-Kapitel (rhStromHofbuchHtml):
  Wettermodell, Saat je Hof, Gedächtnis, Sturm/Hitze/Nebel, „Prognose im Spiel exakt“.
- Tests (tests_rechenhaus.cjs WETTER-1..5): andere Saat ⇒ anderes Wetter; Prognose == rhWeather;
  Sturm setzt Kleinwind auf 0; Hitze hebt PUE; Wetterbericht hat 3 Zeilen mit wahren Faktoren.

### D2 Runde-4-Fixes (aus sim3/sim4-Berichten, alle mit Beleg)
1. content.js `wurfpflege` (FORSCHUNG) ohne `frei:"wurfpflege"` – Forschung wirkt nie. **Kritisch**, eine Zeile
   (Ausnahme vom Dateibesitz: nur diese Zeile in content.js).
2. hofloop.js Vorlage `gross_katalog`: Rolle `{stil:60,…}` → `schreiben` (Zettel unbestehbar, NaN im UI).
3. Nacht-Destillation (`HL_NACHT.distill`) umgeht `forschungFrei('distill')` – in hlNachtPruefung und hlNachtAbrechnen prüfen.
4. `starteNachtSchicht`: ungültiger Plan eines Tieres darf nicht die Nacht aller anderen verwerfen –
   je Tier prüfen, ungültige mit Klartext überspringen, gültige committen.
5. `modellKaufen` / `forschen` (Template) / `hlKontrolle` nach Annahme (hofloop): stumme Abbrüche → `melde(...,'schlecht')` mit Grund.
6. Info-Kasten „Alle Annahmen“ (rechenhaus.js ~Zeile 510): Einspeisung und Grundlast aus RH_STROM/RH_STUFEN generieren
   (0,06 → R.einspeise; 5,0 kW → RH_STUFEN[2].grund); Kraftwerk-Absatz „ab Nerdtempel“ ergänzen.
7. Empfehlungs-Zettel (ereignisse.js ereignisMorgen): `hlJobNeu(e.art,false)` liefert zu 22 % still `null` –
   bis zu 3 Versuche, sonst `hlJobNeu(e.art,true)`; nie still (Meldung im Bericht).
8. zucht.js `istInzucht`: Großeltern (2 Generationen) einbeziehen; Verkaufsdialog-Aufschlüsselung für
   Zuchttiere aus `tierWert` ableiten (Template, Funktion `verkaufen`) – die Summe muss dem Auszahlbetrag entsprechen;
   Zuchtwert: `tierWert` soll Wertsteigerung durch bessere Werte abbilden (z. B. Faktor Ø-Werte Kind / Ø-Werte
   Katalogmodell, Band 0,8–1,3), Hofbuch-Text nachziehen.
9. rechenhaus.js `rhPlatzDetails`: Aufrüsten-Knopf für alle GPUs zeigen, für die `rhPCUpgradeZiel` ein Ziel liefert.
10. minispiele.js Vier gewinnt: Felder mit sichtbarem Symbol (🟢/🔴) und aria-label; spielbot-Kommando
    `mini hacker <spalte>` zum Setzen (nutzt miniHackerZug).
11. Teilabnahme nach Fristbruff: statt pauschal 30 % ⇒ 30 % + 40 % × (fertig−0,7)/0,3 (70 % → 30 %, 100 % → 70 %),
    Hofbuch-Text nachziehen (hofloop.js hlTeamAbschluss + Regeltext).
12. Hofbuch/REGELWERK: Kontrollpaket (8 €/Tag) dokumentieren; Überstunden dokumentieren; Hofuhr 06–22 vs.
    14 Arbeitsstunden erklären (2 h Rüst-/Pausenzeit); DSGVO-Leck-Auslöser „Leih-Tier auf lokalem Zettel“
    aus dem Regeltext streichen (unerreichbar, Sperre ist stärker) – Text in ereignisse.js ereignisHofbuchHtml.
13. spielbot.cjs: `energie <uid> eigen` warnt sofort, wenn kein Akku/Wind; `warten` meldet „Tagesende erreicht“;
    `bauteil` ohne Argument zeigt Katalog; `gpu verkaufen|lagern <bucht>` Kommandos; `neu` setzt st.verlauf/log/aktionen
    zurück; Trainings-Statistik nicht doppelt zählen (Zeile ~225); `lese` ohne offene Runde sauber melden.
    Das Kommando `sag` kommt von Teil A – nicht anlegen.
14. Tipp-Text „Serveroptimierung erforschen“ → tatsächlicher Forschungsbaum-Name „Server-Laufzeitumgebungen (vLLM & SGLang)“ (wo immer er steht).
15. Datenlese-Serie (S.leseSerie) reißt bei ausgelassenem Tag wie die Dorfplatz-Serie (Template leseFertig).
16. Tool-Eignung < 35 %: Anlegen blockieren mit Klartext (Template geschirrAnlegen) – bisher nur Warnung.
17. Datenlese-Schnipsel „Hauptstadt von Australien ist Sydney“: Kategorie klären (content.js Datenlese-Karten: eine
    selbstsichere Falschaussage ist `muell` – Erklärungstext ergänzen); Ausnahme vom Dateibesitz nur für diese Karte.
18. Team-Vorschau: `hlSchnellsteChip(j)` zusätzlich Team-Variante (zwei schnellste freie Tiere auf zwei Rollen) mit
    Stundenzahl anzeigen, damit man vor der Annahme sieht, ob ein Team den Zettel schafft.

Alle Änderungen: kleine gezielte Edits (kein Ganzdatei-Überschreiben, vor jedem Edit die Stelle frisch lesen –
andere Agenten arbeiten parallel in anderen Dateien), nach jedem Block
`powershell -ExecutionPolicy Bypass -File ./assemble.ps1` und die fünf Suiten
(`tests_v6`, `tests_hofloop`, `tests_rechenhaus`, `tests_minispiele`, `tests_aera8`) grün halten,
neue Tests ergänzen. `node dev/hofbuch_md.cjs` und die Kopie nach publish_pages macht die Hauptsitzung.

## E. Wahrheitsregeln für Ära 9

1. Kein Modell erzeugt Zahlen. Needle liefert nur Werkzeugnamen und Argumente; die Vorschau rechnet mit
   den Spielfunktionen.
2. Jede prozedurale Wendung ist als Chip sichtbar und im Hofbuch mit Band dokumentiert.
3. Die Hofpost meldet Fakten; genau ein Satz darf „Gerücht“ sein und heißt so.
4. Alle Needle-Zahlen im Spiel (14 MB, 45 M, 256 Token, 500 tok/s Pi 5) tragen Quelle und Stand.
5. Was Needle nicht kann, steht in der Oberfläche, nicht nur im Hofbuch.

## F. Umsetzungsstand 02.09.2026 (Abend)

Umgesetzt und getestet (380 Prüfungen grün): Teil A (Hofsprecher, Needle-Laufzeit, `sag`), Teil B
(Zettelschmiede mit Kunden, Wendungen, Hofpost, Gerücht, Ereignis-Gewichtung – plus Dorf-Anliegen),
Teil C (Nadel-Asset; Abweichung: Logik 24 statt 18, damit die Sortier-Zettel „post“/„spam“ erreichbar sind;
ESP32-P4 nur als Katalogeintrag, nicht kaufbar), Teil D1 (Wetter 2.0 mit Regen/Sturm/Nebel/Hitze und
Regen-Szene) und D2 (Fixes 1–5, 7–10, 13; offen: 6 Kraftwerk-Textzusatz, 11 Teilabnahme-Staffel, 12 Hofbuch-
Ergänzungen Kontrollpaket/Überstunden/Hofuhr, 14 Name der Serveroptimierung, 15–18). Neu gegenüber dem Plan:
Entscheidungs-Ereignisse mit Optionen, Tagesplanung als erstes Blatt nach der Nacht und Ada-Antworten ohne
Schlüssel (lokale Hofbuch-Suche). Mikro-Zettel gelten für die Nadel als Kurzfälle, die einzeln ins 256-Token-
Fenster passen (Spielannahme, im Zettelvergleich als Bonus-Zeile sichtbar).

## G. Agenten-Tool entfernen Tag 1, Agenten-Teams, Berufe-Katalog, Datenschutz (Umsetzung 02.09.2026, Nachmittag)

- **Agentenwerkstatt ab Tag 1:** `gebGeschirr` in LEVELS[0]; `HARNESSE.hofgeschirr` (basis:true, lvl 1, tcMin 1) ohne
  Forschung; Spezial-Tools mit `forschungFrei("geschirr")`. Kapitel 1 der Geführten Woche hat sechs Ziele,
  Ada-Schritte `start_geschirr` (nach der Bucht) und `start_geschirr_fertig` (vor der Pinnwand).
- **Teams:** Zettel mit `teamMax>1` sind `agent:true`; `hlRollen` liefert `teamN` gleiche Rollen; Arbeit je Rolle
  = mtok ÷ N × (1 + 0,10·(N−1)), bei gleichem Agenten-Tool 0,05 (in `hlTeamCheck` über `teamF`). Schätzung je
  Teamgröße mit den schnellsten freien, geeigneten Agenten (`hlTeamSchaetzung`).
- **Berufe:** `BERUFE` (50 × 3–4 Aufgaben), `zsBerufZettel` baut Zettel aus `BERUF_BASIS[tier]` × Faktoren
  (agent 0,5/0,85; Team +60 %/+50 %/+35 % je Agent; Risiko ×1,15/×1,35), Anforderungen 26 + 12·Tier auf den
  Hauptwerten der Art. `zsBerufZettelMorgen` in `hlMorgen`; Nadel (istNadel in Bucht) → zweiter, passender Zettel.
- **Datenschutz:** `DS_REGELN`; `dsWahrscheinlichkeit` (Risiko × Schutzstatus × Leih-Tier × Schutzregeln × Kontrollpaket);
  `dsAbschluss` in `hlTeamAbschluss`; `dsAbmahnung` → `hofSchliessen` bei `abmahnungMax` (2, Behütet 3);
  `dsGeschlossenHtml` im Tagesbericht, `tagBeenden`/`hlTeamStart` gesperrt. Datenleck-Ereignis zählt nur mit
  ungeschützten Modellen. Zettel mit Risiko erscheinen ab Stufe 2 (erhöht) / 3 (hoch) oder mit Schutz.
- **Abweichung von der Nutzerformulierung:** „2 Agenten = 2 Tage, 3 Agenten = 1,5 Tage“ ist als Amdahl-Regel
  umgesetzt (4 → 2,2 → 1,6 Tage), damit Teams nie mehr als linear beschleunigen und die Zahl im Hofbuch steht.

### G.1 Fachbildung (Nachtrag 02.09.2026, Abend)

Die pauschale 80-€-Schulung ist ersetzt: `FACH_GEBIETE` (6), `FACH_KURSE` (grund/aufbau/zertifikat mit Tagen,
Preis, GB Kuratiertes, Gewinn, Mindestwert), `FACH_REGELN` (Praxis +3 bis 85, Größenfaktor 0,05/B, Drift +1 je
6 Tage bis +20, Lohnfaktor 0,008 je Punkt, Techniken kurs/sft/lora/qlora/dpo). Status `schulung` reiht sich neben
training/zucht/job ein (Tageswechsel, Lastprofil 18 h × 0,9, Nachtplanung ausgeschlossen). Wirkkette: Kurs → Fachwissen
→ Zettelzulassung (`fachAnforderung` in `jobCheckBasis`) + Qualitätsbonus + Verstoßrisiko (`dsSchutzFaktor`) +
Lohnaufschlag (`zsBerufZettel`) → Praxis (`fachPraxis` in `dsAbschluss`). Nichts davon ist umsonst: Geld, Kuratiertes
aus der Datenlese, Tage ohne Einsatz, GPU-Strom.
