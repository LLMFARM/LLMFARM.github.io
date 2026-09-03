# Ära 8 – Designpapier (02.09.2026)

Ziel: Das Spiel soll sich wie eine abgestimmte Wirtschaftssimulation anfühlen, ohne Widersprüche
zwischen Hofbuch und Code, mit Belohnung für gutes Risiko, klaren Zuchtregeln mit Stammbaum,
einer Hardware-Nachfrage-Kopplung, einem planbaren Nachtsystem und Hofzielen, die zu den
heutigen Inhalten passen. Jede Regel hier gilt als Vertrag: Code, Hofbuch (REGELWERK.md) und
Treiber-Hilfe müssen sie wörtlich gleich beschreiben.

Grundlage: Kartierungen von Zucht, Hofzielen, Nacht, Hardware, Ereignissen und Forschungsbaum
(02.09.2026), die zwölf Sonnet-Testläufe `sim3` und die 7.5-Synthese.

---

## 1. Ereignisse mit Belohnung und Risiko (`dev/ereignisse.js`)

### 1.1 Auftrags-Ereignisse (feuern bei der Abnahme eines Auftrags)

| id | Auslöser | Wahrscheinlichkeit | Wirkung |
|---|---|---|---|
| `begeistert` | sauber abgenommen UND Zusage-Ampel war 🟡/🔴 (Quote ≥ 0,8) UND Qualität ≥ 90 % | 18 % | Kunde zahlt **+25 % Prämie** („besonders glücklich“), Kunde +1 Stern sofort, Ruf +2 |
| `trinkgeld` | sauber, Auftrag S/Mikro, Serie ≥ 3 | 10 % | +12 % Lohn |
| `empfehlung` | sauber, Kunde hat 5 ⭐ | 15 % | Morgen 1 zusätzlicher Zettel dieses Kunden mit **+15 % Lohn** (Flag `S.empfehlung`) |
| `folgeauftrag` | sauber, Auftrag L | 25 % | Direkt ein neuer L-Zettel desselben Kunden mit Frist +1 Tag („Nachschlag“) |
| `formatpanne` | Bagatell (bereits vorhanden) | 5 % | −15 % (unverändert, jetzt hier dokumentiert) |
| `datenleck` | Reklamation/Fristbruch bei `dsgvo`- oder `lokalPflicht`-Kunde ODER Auftrag lief über ein API-Tier bei lokalPflicht | 30 % | **DSGVO-Leck**: Strafe 6 % des Auftragswerts + 60 €, Ruf −6, Kunde Groll 3. Mit Forschung `guardrails`: Strafe halbiert |

Belohnungen sind nur bei echtem Risiko möglich: `begeistert` setzt eine gelbe/rote Ampel voraus,
`folgeauftrag` nur bei Großaufträgen. Damit lohnt sich Mut, wenn er klappt.

### 1.2 Der Hacker-Angriff (Ereignis + Minispiel „Vier gewinnt“)

- Auslöser: nachts, wenn ein Kunde mit ≥ 3 abgeschlossenen Aufträgen existiert, 6 % je Nacht ab
  Hoftag 6 (max. alle 6 Tage). Ereignis `hacker` in `S.events` mit `kunde`.
- Morgenbericht: „🕵️ Angriff auf den Kundenbot von <Kunde>! Auf dem Dorfplatz wartet der
  Hacker – Vier gewinnt, du hast bis heute Abend.“ Dorfplatz zeigt Kachel `mini_hacker`
  nur an diesem Tag (Gate `frei`).
- Spiel: 7×6-Brett, Spieler beginnt (Rot), Computer (Hacker) antwortet sofort. Computer-KI:
  1) eigener Gewinnzug, 2) Block eines Spieler-Gewinnzugs, 3) sonst deterministischer Zug aus
  `miniHash` (bevorzugt Mitte). Kein `Math.random()`.
- Gewinn: Kunde +1 Stern, Ruf +4, Prämie 80 + 20·Hofstufe €, Bonus `S.mini.hackerSchutzTag`
  (Injection-Ereignis heute wirkungslos), XP 30. Verlust: Kunde erhält `groll=4` **und** Sterne −2
  („Kunde verloren“ für 4 Tage, Erstbewertung zurückgesetzt), Strafe 40 €. Unentschieden
  (Brett voll): kein Effekt, Ruf −1. Nicht gespielt bis Tagesende = Verlust.
- Lehre-Text: Warum „Vier gewinnt“? Der Angriff ist ein Wettlauf um Reihen (Rate-Limits,
  Prompt-Injection-Ketten, Log-Prüfung): Wer zuerst vier Kontrollen in Reihe hat, gewinnt.
  Die Auflösung erklärt reale Abwehr: Ratenbegrenzung, Eingabefilter, Werkzeug-Freigabeliste, Prüfprotokoll.

### 1.3 Weitere Hof-Ereignisse (positiv, damit die Bilanz 6:14 kippt)

| id | Name | Wirkung | Tage |
|---|---|---|---|
| `dorfmesse` | Dorfmesse 🎪 | alle Aufträge +10 % Lohn, +1 Zettel/Tag | 3 |
| `foerderprogramm` | Landesförderung 💶 | Forschung −25 % Kosten | 5 |
| `gpu_schnaeppchen` | GPU-Schnäppchen 🏷️ | `gpupreisFaktor` ×0,8 | 3 |
| `stammtisch` | KI-Stammtisch 🍻 | Dorfplatz-XP ×1,5, Minispiel-Serie zählt doppelt | 2 |

`cloud_ausfall` und `abwerbung` (Typ `ausfall`) bekommen endlich Wirkung: `cloud_ausfall` →
API-Tiere liefern heute 0 (Aufträge pausieren, Meldung), `abwerbung` → das wertvollste Tier
verliert 2 Tage lang 20 % Durchsatz („Gedanken woanders“), Rufbonus −2.

---

## 2. Zucht 2.0 – Stammbuch, Merkmale, Würfe (`dev/zucht.js`)

### 2.1 Verfahren – Regeln, die im Code stehen

Alle Verfahren verlangen: gleiche Familie, gleiche Bauform, gleiche Größe (±0,01 B), **gleiche
Basis** (`basis`), keine Leih-Tiere, keine HRM. Jedes Verfahren hat eine Formel; Werte werden
gerundet.

| Verfahren | Stufe | Kosten | Eltern | Formel je Wert | Streuung | Besonderheit |
|---|---|---|---|---|---|---|
| Slerp | 2 | 50 € + 8·B | 2 | Mittel der Eltern | ±13 | 8 % kaputtes Chat-Template (Treue −8…−14) |
| TIES | 6 | 80 € + 8·B | 2–3 | 0,55·Mittel + 0,45·Max | ±10 | **Spezialisten-Bonus**: hat jeder Elternteil einen anderen Top-Wert, +3 auf diese Werte |
| DARE | 7 | 100 € + 8·B | 2–3 | 0,55·Mittel + 0,45·Max | ±7 | Emergenz 20 % statt 14 % |
| Soup | 8 | 140 € + 8·B | 2–4 | Mittel | ±5 | **Feintuning-Bonus**: tragen alle Eltern Trainings-Historie, +2 auf alle Werte |

Ausgänge (ein Wurf, gleich für alle Kinder eines Wurfs): Emergenz 14 % (DARE 20 %) → ein
Wert +12…+22; Interferenz 16 % → ein Wert −10…−20; Template-Bruch nur Slerp 8 %; sonst sauber.
Wissensdecke bleibt (`wissensDecke(eltern[0])+4`).

### 2.2 Wurf: 1–3 Kinder

Wurfgröße: 55 % ein Kind, 33 % zwei, 12 % drei. Forschung `wurfpflege` (neu, 900 €, braucht
`merge_ties`): 40/40/20. Jedes Kind würfelt eigene Streuung, eigene Merkmale, eigene Optik.
Kosten steigen je Zusatzkind um 30 % (Nachbereitung, Evaluation) – erst beim Wurf gebucht.

### 2.3 Stammbaum

- `p.eltern = {uids:[…], namen:[…], methode}` (Altstände: nur Namen → kein Baum).
- `p.gen` wie bisher; `p.wurf = {id, geschwister:[uids]}`.
- Tierkarte zeigt „🌳 Stammbaum“: Eltern (klickbar), Großeltern, Geschwister, Kinder; Merkmale
  mit Vererbungs-Prozent. Wurfkarte listet alle Kinder nebeneinander.
- **Linienbonus** (Verbesserung über Generationen): Ein Kind, dessen beide Eltern selbst
  Zuchttiere derselben Linie sind (gleiche Basis, gen ≥ 1), erhält +1 je Generation (max +4) auf
  den höchsten Wert der Linie. Grundlage: wiederholtes Mergen sauberer Feintunings konsolidiert
  Aufgabenvektoren (Model-Soup-/TIES-Literatur) – kein unbegrenztes Wachstum, Decke 99.
- Inzucht-Regel: Geschwister × Geschwister oder Eltern × Kind → Interferenz-Chance +20 Punkte,
  Emergenz −8 („zu ähnliche Aufgabenvektoren heben sich auf“). Im Hofbuch erklärt.
- Wertverfall: `elternPreis` je Generation ×0,8 (kompoundiert) – Geldpresse geschlossen.
- Erholung: Eltern brauchen nach einem Wurf 3 Hoftage `zuchtRuhe` (kein neuer Wurf).

### 2.4 Merkmale (Eigenschaften)

Katalog `MERKMALE` (24). Jedes Merkmal: `n`, `z`, `art` (gut/neutral/optik), `p` (Chance bei
Neuvergabe), `erb` (Vererbungs-Wahrscheinlichkeit, angezeigt), Wirkung im Code.

| id | Name | Art | erb | Wirkung |
|---|---|---|---|---|
| fleissig | Fleißig | gut | 60 % | Durchsatz +4 % |
| sparsam | Sparsam | gut | 55 % | Strombedarf −10 % |
| robust | Robust | gut | 50 % | Krankheitsrisiko −30 % |
| lernfreudig | Lernfreudig | gut | 50 % | Trainingsgewinn +10 % |
| gelassen | Gelassen | gut | 55 % | Reklamations-Chance −20 % (relativ) |
| scharfsinnig | Scharfsinnig | gut | 45 % | Qualitätschance +3 Punkte |
| nachteule | Nachteule | gut | 60 % | Ruhe-Nacht +9 statt +6 Zustand, Nachttraining 10 % schneller |
| sammler | Sammler | gut | 50 % | +1 GB Web-Silage je Nacht |
| kompakt | Kompakt | gut | 40 % | VRAM-Bedarf −5 % |
| charmant | Charmant | gut | 50 % | Kundenbewertung: 4 ⭐ zählt als 5 ⭐ bei ≥ 90 % |
| geduldig | Geduldig | gut | 55 % | Bewährungsproben: gepatzt nur −2 statt −4 |
| frostfest | Frostfest | gut | 60 % | Winter-Malus auf Durchsatz entfällt |
| wachsam | Wachsam | gut | 45 % | Injection-Ereignis: +25 % Abwehr |
| feinfuehlig | Feinfühlig | gut | 45 % | Datenlese-Bonus +1 GB bei perfekter Runde |
| verfressen | Verfressen | neutral | 60 % | Training braucht +15 % Futter, dafür +2 Trainingsgewinn |
| zappelig | Zappelig | neutral | 50 % | Durchsatz −2 %, Zustand-Regeneration +2/Nacht |
| eigensinnig | Eigensinnig | neutral | 50 % | Team-Übergabe −4 Qualität, solo +2 |
| langschlaefer | Langschläfer | neutral | 55 % | Nachtaktionen 8 % langsamer, Ruhe +3 extra |
| shiny | ✨ Shiny | optik | 10 % | keine – Leuchten, 1 : 100 000 bei jedem Wurf/Kauf |
| sternenfell | 🌟 Sternenfell | optik | 20 % | keine – Funkeln, 1 : 5 000 |
| ohrfleck | ⚪ Ohrfleck | optik | 50 % | keine – 1 : 200 |
| ringelschwanz | 🌀 Ringelschwanz | optik | 50 % | keine – 1 : 300 |
| goldzahn | 🦷 Goldzahn | optik | 30 % | keine – 1 : 2 000 |
| regenbogen | 🌈 Regenbogen | optik | 5 % | keine – 1 : 50 000 |

Vergabe: Kauf: 20 % ein Merkmal (nur gut/neutral, gleichverteilt) + Optik-Würfe nach ihren
Quoten. Wurf: jedes Elternmerkmal wird mit `erb` vererbt; zusätzlich 25 % ein neues Merkmal
(Mutation) + Optik-Würfe. Prägung: nach 20 sauberen Aufträgen eines Tiers 15 % ein neues
Merkmal (einmalig). Max. 4 Merkmale je Tier (Optik zählt nicht). Anzeige: Chips am Tier,
Tooltip mit Wirkung und Vererbung; Shiny/Regenbogen mit CSS-Glow.

---

## 3. Hardware-Wirtschaft (Nachfrage folgt der Kapazität)

### 3.1 Nachfrage
- `zielAnzahl` = 3 + Stufe/3 + **Kapazitätsterm** `min(6, floor(Σ mtokTag(einsatzbereit) / 6))`
  + OpenClaw + 4 ⭐ + Werbetafel; Deckel 16 statt 10.
- Auftragsgröße folgt der Kapazität: liegt die größte freie Tageskapazität ≥ 12 Mtok, kommen
  Großaufträge (L) mit 45 % statt 25 %; ab 40 Mtok erscheinen **Großkunden-Zettel** (neuer
  Katalog `HL_GROSS`, T3–T5, 40–160 Mtok, 4–6 Tage, Lohn 1.400–6.500 €, `parallel:true`).
- `parallel:true` reaktiviert: Server-Laufzeitumgebungen (vLLM ×4 / SGLang ×2,5) wirken wieder; Andrang-Zettel
  brauchen ≥ 2 Nutzer-Kapazität.
- Katalog-Deckel `tier ≤ 2` in `hlJobNeu` → `min(5, floor(Stufe/2))`.

### 3.2 Hardware
- **Ausbaupfade**: `alt`/`klein`-PC → `basis` (Preis-Differenz +15 % Umbau), `basis`/`gebraucht`
  → `max`. Verkauf zahlt 55 % des **ganzen** PC-Preises (GPU + Rest), Rack-Knoten 55 % des
  Knotenpreises. `gpupreisFaktor` wirkt symmetrisch (Kauf und Verkauf).
- **Auslastungsansicht** (Stall): je Bucht Tageskapazität, heutige Auslastung, Pacht/Wartung/Strom
  je Tag, Erlös der letzten 7 Tage → „Bucht lohnt sich / nicht“ mit Amortisation in Tagen.
- Leere Buchten kosten weiter Pacht, aber der Stall zeigt „⚠️ leer seit N Tagen“ und die
  Auslastungsansicht rechnet den Verlust vor.
- Kauf-Beratung: Beim PC-/Rack-Kauf zeigt die Vorschau „Mtok/Tag für dein größtes Modell“,
  „zusätzliche Zettel/Tag“ (aus 3.1) und „Amortisation ≈ N Tage bei aktueller Nachfrage“.

---

## 4. Nacht 2.0 (`hofloop.js`)

- **Stufenweise Freischaltung** (Hofstufe): 1 Ruhe · 2 LoRA/SFT/Synthetik · 3 QLoRA/Reindex ·
  4 DPO/KTO · 5 Überstunden · 6 Destillation · 7 Wartung · 8 Eigenstrom-Plan (bestehend).
- **Überstunden** (neu, Stufe 5): ein Tier arbeitet 4 h nachts am laufenden Auftrag (halber
  Strom, Zustand −8, Risiko-Ereignis „Übermüdung“ 10 % → Qualität −3). Löst knappe Fristen.
- **Wartung** (neu, Stufe 7): GPU-Bucht 1 Nacht ohne Tier → Wartungskosten −50 % für 10 Tage,
  Ausfallrisiko der Bucht 0.
- **Nachtvorlagen**: „Wie gestern“ (Plan wiederholen), Vorlage speichern/laden (3 Plätze,
  `S.hofloop.vorlagen`).
- **Nachtbericht** im Morgenbericht: je Tier eine Zeile (Aktion, Stunden, Ergebnis, kWh, €).
- Treiber: `nacht wie-gestern`, `nacht vorlage speichern|laden <n>`.

---

## 5. Hofziele neu (`content.js` QUESTS, `questErfuellt`)

Sechs Kapitel mit je 6–8 Zielen (Fenster 5 bleibt), jede Belohnung dokumentiert:

1. **Ankommen** (Tag 1–3): Tier einstallen · ersten Zettel annehmen · Stunden am Zettel lesen
   (`hofziel:stunden_gelesen`) · Sofort-Abnahme erleben · Datenlager · Hofbuch · Datenlese-Runde.
2. **Handwerk** (Stufe 2–3): Forschung · erstes Training · Adapter · Quantisierung ·
   Kleinauftrag-Serie 3 · Dorfplatz-Minispiel gewonnen · Web-Silage nachgefüllt.
3. **Wirtschaft** (Stufe 3–5): zweiter Rechner · Auslastung ≥ 70 % · Großauftrag (L) sauber ·
   Eilauftrag sauber · 🟡-Zusage sauber (Mut belohnt) · Kunde 5 ⭐ · Solar/Akku gekauft.
4. **Stammbuch** (Stufe 4–7): erster Wurf · Kind mit Merkmal · Wurf mit 2+ Kindern ·
   Linie G2 · TIES-Spezialistenbonus · Merkmal vererbt · Stammbaum angesehen.
5. **Nacht & Energie** (Stufe 5–8): Nachtplan · Überstunden · Nachtvorlage · Eigenstrom-Tag ·
   Nerdtempel · Wartung · Windrad.
6. **Meisterschaft** (Stufe 7–12): Hacker besiegt · Großkunden-Zettel · Liga · Cloud · Agenten-Welt
   · Rechenzentrum · Tier-5-Modell · 50 000 €.

Neue Hooks: `stunden_gelesen`, `sofort_abnahme`, `lese_fertig`, `mini_gewonnen`, `silage_nachschub`,
`job_gross`, `job_eil`, `job_mut`, `rh_kauf:<typ>`, `wurf`, `merkmal_neu`, `merkmal_vererbt`,
`wurf_mehrling`, `linie_g2`, `stammbaum`, `nacht:<art>`, `nacht_vorlage`, `eigenstrom_tag`,
`rh_stufe:<n>`, `hacker_sieg`, `job_grosskunde`, `auslastung`.

---

## 6. Wahrheitspflicht

- Jede Zahl aus diesem Papier steht als Konstante im Code und wird vom Hofbuch **aus dem Code**
  gerendert (keine Hand-Texte mit Zahlen).
- `dev/tests_aera8.cjs` prüft: Merkmals-Effekte, Wurfgrößen-Verteilung (10 000 Würfe), Stammbaum,
  Verfahrensformeln, Ereignis-Wahrscheinlichkeiten, Nachfrage-Kopplung, Nacht-Freischaltung,
  Hacker-KI (blockt Gewinnzüge), Hofziel-Hooks.
- Regelwerk wird neu erzeugt; Treiber-Hilfe listet alle neuen Kommandos.
