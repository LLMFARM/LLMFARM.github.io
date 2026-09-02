# LLM FARM – Regelwerk (Hofbuch)

GENERIERT aus den Spieldaten (ADR 0001) – nicht von Hand editieren.
Neu erzeugen: `node dev/hofbuch_md.cjs` nach jedem Build.
> Das **Hofbuch** ist direkt aus den Spieldaten erzeugt – was hier steht, gilt; was hier fehlt, gibt es nicht. Für die Grundlagen:

## 🚀 Schnellstart & FAQ

**Wie nehme ich Aufträge an?**
Ein Tier muss in einer GPU-Bucht stehen (Stall → „Belegen“) oder eine API-Lizenz haben. Dann zeigt jeder passende Zettel einen Annahme-Knopf mit Vorab-Kalkulation.

**Warum passt mein Tier nicht in die Bucht?**
VRAM-Bedarf = Gewichte + Kontext-Cache + Reserve. Diät (Quantisierung) verkleinert die Gewichte; Überhang lagert in den RAM aus und kostet Tempo.

**Wovon werde ich krank?**
Dreckiges Futter, Dauerbetrieb ohne Sitzungspflege, Übertraining (zu viele Läufe in kurzer Zeit) und heiße Sampler-Einstellungen. Jede Krankheit hat eine echte Ursache und eine echte Kur.

**Wie bekomme ich Meisterpunkte?**
Genau einen je erreichter Hofstufe ab Stufe 2 – keine anderen Quellen. Ausgeben in der Forschungshütte unter „Meisterschaften“.

**Was bringt die Nacht?**
Halber Strompreis. Die Nachtplanung erlaubt Training, Synthetik-Erzeugung und Index-Pflege, ohne den Arbeitstag zu blockieren.

**Wie funktioniert die Wissens-Pipeline (RAG)?**
Als Kette: Vektordatenbank + Embedding-Modell ergeben Textsuche; OCR erschließt Scans; der Reranker prüft Treffer. Aufträge verlangen die Bausteine ausdrücklich – und der Index veraltet.

**Kann ich verlieren?**
Ja, auf zwei Wegen. Wer groß investiert ohne Einnahmen, landet in der Kreditklemme (unter −2.000 € sind Investitionen eingefroren; Vertrauens-Zettel der Nachbarn halten den Weg zurück offen). Und wer Zettel mit Daten echter Menschen ohne Fachwissen oder ein Agenten-Tool mit Schutzfunktionen bearbeitet, riskiert Datenschutz-Verstöße: nach der zweiten Abmahnung (Behütet: dritten) schließt die Aufsicht den Hof – dann hilft nur ein Neuanfang.

**Was ist der Unterschied zwischen Hof-Fokus und Spezialist?**
Der Hof-Fokus (Einführung) gibt +8 % auf EINE Auftragsart hofweit. Ein Spezialist ist EIN Tier mit +8 % auf seine Art (übers Marktlos). Beides stapelt.

**Was machen die Schwierigkeitsgrade?**
🐣 Behütet erklärt Folgen vor riskanten Aktionen, liefert zu jedem Ereignis das Gegenmittel und gibt 500 € Startpolster. ⛈️ Marktwirtschaft streicht die Warnboxen und erhöht die Pacht um 25 %. Die Simulation selbst (Preise, Formeln, Wahrscheinlichkeiten) ist auf ALLEN Stufen identisch – Wechsel jederzeit im Hofhaus.

**Welche Laufzeitumgebung nehme ich wann?**
Zum Start eignet sich llama.cpp: kostenlos und mit RAM-Auslagerung. Ollama oder LM Studio (60 € Einrichtungsaufwand im Spiel) erlauben beliebiges Umsetzen der Tiere. Auf Rack-Karten stehen nach der Server-Forschung vLLM für viele gleichzeitige Nutzer und SGLang für Agenten-Ketten bereit; beide brauchen q8/bf16 und das ganze Modell im VRAM.

**Wer ist Ada – und wie steuere ich sie?**
Ada ist die Beraterin des Hofes: Sie erklärt Einführung, Geführte Woche und jeden Ort beim ersten Besuch mit Stimme (Sprechblase oben links); der jeweils gemeinte Knopf blinkt dabei rot umrandet. **Ada antippen** hält das Sprechen an, nochmal antippen spricht weiter. **„▼ Einklappen“** unten links an der Blase schrumpft sie auf einen schmalen Streifen, damit nichts verdeckt wird – die Stimme läuft dabei weiter. Ihr Kopf oben rechts öffnet das Ada-Menü: jede Erklärung noch einmal anhören, stummschalten – und mit eigenem OpenRouter-Schlüssel beantwortet sie freie Fragen auf Basis genau dieses Hofbuchs. Ihre Stimme ist KI-erzeugt (die Lippen folgen der echten Tonspur); fehlt eine Audiodatei, liest die Browserstimme denselben Text.

**Warum kann ich mein Modell nicht in die Bucht setzen?**
Drei häufige Gründe, alle mit Klartext-Meldung: (1) **Speicher** – das Modell passt nicht ins VRAM und der Überhang nicht ins RAM dieses Rechners: kleiner quantisieren, kleineres Modell oder mehr Speicher. (2) **Laufzeitumgebung** – purer llama.cpp erlaubt nur EINEN Tierwechsel je Bucht und Tag; Ollama oder LM Studio (einmalig 60 €, hofweit) heben das auf. (3) **Rüstzeit** – nach einem Wechsel der Laufzeitumgebung ist die Bucht erst am nächsten Tag wieder bereit. In den Fällen 1 und 2 springt Ada hin und umrandet den Knopf rot, der die Hürde auflöst.

**🧭 Die Geführte Woche (7 Kapitel, nach Fortschritt – ein Kapitel öffnet, sobald das vorige erfüllt ist):** `Kapitel 1: 🌅 AnkommenKapitel 2: 🌾 Daten sind FutterKapitel 3: 🎓 Lernen lassenKapitel 4: 🥗 Werkstatt-TagKapitel 5: 🎓 Fach-TagKapitel 6: 🌙 Nacht & WissenKapitel 7: 🎓 Gesellenprüfung` – Abschluss nach Kapitel 7: Gesellenprüfung (Abzeichen + 150 €).

## 🏅 Hofstufen (12)
- **Stufe 1 · Hoflehrling `0 XP`** – Schaltet frei: Agentenwerkstatt · Willkommen auf der LLM FARM – ein Stall, eine alte Karte vom Dachboden und viel Neugier. Die Agentenwerkstatt steht schon offen: Mit einem Agenten-Tool wird aus einem Modell ein Agent.
- **Stufe 2 · Stallgehilfe `120 XP`** – Schaltet frei: Trainingsplatz, Forschungshütte, Zuchtstation, Werkstatt · Trainingsplatz, Forscherstube, Werkstatt und Zuchtbucht stehen offen – Quantisieren macht Tiere schnell, die Zucht braucht noch das Zuchtbuch aus der Forschung (SFT → LoRA → Merging).
- **Stufe 3 · Jungbauer `300 XP`** – Schaltet frei: Tier-1-Modelle · Der Markt für Tier-1-Ferkel öffnet – größere Modelle für anspruchsvollere Zettel und erste Agenten-Teams.
- **Stufe 4 · Hofbauer `520 XP`** – Schaltet frei: Festwiese · Die Festwiese ist hergerichtet – Zeit, sich in Benchmarks mit den Nachbarhöfen zu messen.
- **Stufe 5 · Herdenbauer `900 XP`** – Schaltet frei: Tier-2-Modelle · Auf dem Markt stehen jetzt stattliche Tier-2-Tiere – Zeit für eine richtige Herde.
- **Stufe 6 · Gutsverwalter `1350 XP`** – Schaltet frei: Cloud und Leitstand · Die Wolkenweide ist gepachtet – Leihschweine (API-Modelle) helfen bei Spitzenlast.
- **Stufe 7 · Modellwirt `1950 XP`** – Schaltet frei: Tier-3-Modelle, dritter Hilfsmittelplatz · Ein dritter Platz für Hilfsmittel je Modell und Tier-3-Prachtkerle – dein Hof wird im Umland bekannt.
- **Stufe 8 · Energiewirt `2700 XP`** – Schaltet frei: Energiegarten · Der Energiegarten steht: Solardach und kluge Lastplanung drücken die Stromrechnung.
- **Stufe 9 · Großbauer `3650 XP`** – Schaltet frei: Tier-4-Modelle · Die großen MoE-Eber (Tier 4) stehen zum Verkauf – viel Speicher, wenig aktive Parameter.
- **Stufe 10 · Gutsherr `4800 XP`** – Schaltet frei: vierter Hilfsmittelplatz · Ein vierter Platz für Hilfsmittel je Modell – Ausrüstung für jede Auftragsart gleichzeitig.
- **Stufe 11 · KI-Landbaron `6200 XP`** – Schaltet frei: Tier-5-Modelle · Die Billionen-Klasse (Tier 5) öffnet ihre Gatter – nur die reichsten Höfe halten solche Tiere.
- **Stufe 12 · KI-Gutshof-Legende `7900 XP`** – — · Man erzählt sich Geschichten über deinen Hof – von hier an zählt nur noch die Ehre.

## 🔬 Forschungsbaum – Forschung (22)
- **Feintuning-Grundkurs (SFT) `150 € · 1 Tag(e)`** – Wurzel · Der Klassiker: Mit guten Beispielen nachsitzen, bis das Schwein den Ton des Hofes trifft.
- **Diätküche (Quantisierung) `180 € · 1 Tag(e)`** – Wurzel · Gewichte auf 8 oder 4 Bit abspecken – passt in kleinere Tröge und frisst weniger Speicher.
- **Agentenwerkstatt `220 € · 1 Tag(e)`** – Wurzel · Agenten-Tools freischalten: Sie geben Modellen Zugriff auf Dateien, Befehle und weitere Werkzeuge – der Schritt vom Ratgeber zum Agenten.
- **Anstecker-Kunde (LoRA) `300 € · 1 Tag(e)`** – ⬑ braucht: Feintuning-Grundkurs (SFT) · Winzige Zusatzmatrizen lernen das Fachgebiet, das Grundmodell bleibt eingefroren – Adapter zum Anstecken.
- **Spar-Anstecker (QLoRA) `450 € · 2 Tag(e)`** – ⬑ braucht: Anstecker-Kunde (LoRA), Diätküche (Quantisierung) · LoRA auf quantisierter Basis: Feintuning eines 8B-Ferkels passt damit auf eine einzige 24-GB-Karte.
- **Geschmacksschule (DPO) `700 € · 2 Tag(e)`** – ⬑ braucht: Feintuning-Grundkurs (SFT) · Aus Paaren von guter und schlechter Antwort lernen – Präferenztraining ohne separates Richter-Modell.
- **Weiterlesen (Continued Pretraining) `900 € · 2 Tag(e)`** – ⬑ braucht: Feintuning-Grundkurs (SFT) · Das Schwein liest ganze Fachbibliotheken weiter – mit Replay-Beimischung gegen das Vergessen.
- **Zuchtbuch (Model Merging) `600 € · 2 Tag(e)`** – ⬑ braucht: Anstecker-Kunde (LoRA) · Zwei Verwandte per SLERP verschmelzen – kostet fast keine Rechenzeit, braucht aber gleiche Architektur.
- **Wurfpflege `900 € · 2 Tag(e)`** – ⬑ braucht: Feine Zuchtauslese (TIES/DARE) · Mehrere Kandidaten je Merge-Lauf parallel evaluieren und die besten behalten – Würfe mit zwei oder drei Kindern werden wahrscheinlicher (40 / 40 / 20 % statt 55 / 33 / 12 %).
- **Feine Zuchtauslese (TIES/DARE) `1.200 € · 2 Tag(e)`** – ⬑ braucht: Zuchtbuch (Model Merging) · Bis zu drei Eltern gezielt mischen und Störrauschen wegschneiden – Zucht für Fortgeschrittene.
- **Quellenlabor: Retrieval prüfen `180 € · 1 Tag(e)`** – Wurzel · Optional: Ein eigener Prüfsatz für Treffer und Zitate verbessert Wissensaufträge um 2 Qualitätspunkte. Die Wissenspipeline selbst wird bausteinweise in der Wissenswerkstatt eingerichtet.
- **Zaunbau (Schutzregeln) `1.000 € · 2 Tag(e)`** – ⬑ braucht: Agentenwerkstatt · Mehrschichtiger Schutz um den Stall – Rechte, Sandbox, Prüfungen. Senkt Schaden und Wahrscheinlichkeit von Prompt-Injection und peinlichen Ausrutschern, macht aber keinen Stall unverwundbar.
- **Ferkelschule (Destillation) `1.400 € · 3 Tag(e)`** – ⬑ braucht: Feintuning-Grundkurs (SFT) · Ein großes Lehrer-Schwein erzeugt Futter für ein kleines – Wissen eindampfen ist echtes Training.
- **Wolkenweide (API-Lizenzen) `1.500 € · 2 Tag(e)`** – Wurzel · Verträge mit den großen Höfen: Leihschweine (API-Modelle) für Spitzenlast – aber nichts für DSGVO-Aufträge.
- **Belohnungsweide (GRPO) `2.500 € · 3 Tag(e)`** – ⬑ braucht: Geschmacksschule (DPO) · Verstärkungslernen an prüfbaren Aufgaben (RLVR): Nur was den Test besteht, gibt Futterpunkte.
- **Hohe Dressur (PPO/RLHF) `4.200 € · 4 Tag(e)`** – ⬑ braucht: Belohnungsweide (GRPO) · Die Königsdisziplin mit eigenem Richter-Modell – teuer, wacklig, aber der Feinschliff der großen Höfe.
- **Agenten-Training (Multi-Agent) `6.000 € · 5 Tag(e)`** – ⬑ braucht: Agentenwerkstatt, Zaunbau (Schutzregeln) · Schaltet die 🌐 Agenten-Welt frei: ein Trainingsgelände, auf dem dein Schwein mit einem Agenten-Tool echte Arbeitsabläufe übt – E-Mails lesen, Formulare ausfüllen, Dateien sortieren. Ein Lehrer-Schwein bewertet jeden Versuch (RLVR-Prinzip).
- **Server-Laufzeitumgebungen (vLLM & SGLang) `800 € · 2 Tag(e)`** – ⬑ braucht: Diätküche (Quantisierung) · Schaltet die Server-Laufzeitumgebungen frei, wählbar je Rack-Bucht im Stall: vLLM (Continuous Batching – viele Nutzer gleichzeitig) und SGLang (Prefix-Cache – stark für Agenten-Ketten). Beide brauchen min. q8 und das ganze Modell im VRAM.
- **OpenClaw-Leitstand `600 € · 2 Tag(e)`** – ⬑ braucht: Agentenwerkstatt · Der persönliche Agenten-Leitstand: EINE Schicht verbindet 29 Chat-Kanäle, Skills und Werkzeuge mit jedem beliebigen Modell – der Hof ist damit rund um die Uhr erreichbar.
- **Hermes-Schicht `900 € · 2 Tag(e)`** – ⬑ braucht: OpenClaw-Leitstand · Der Hermes Agent hält alles konsistent: kuratiertes Kerngedächtnis mit hartem Limit, verlustfreie Sitzungssuche, Hintergrund-Ausführung über SSH/Docker – und er lernt aus jedem Durchlauf eigene Skills.
- **Second-Brain-Erweiterung `1.200 € · 3 Tag(e)`** – ⬑ braucht: Hermes-Schicht · Das Hofgedächtnis zieht in einen Obsidian-Vault: Klartext-Markdown, das ALLE Agenten-Tools teilen. Nächtliche Verdichtungsdurchläufe ('Dream Passes') machen aus wiederholten Korrekturen bestätigte Vorlieben – mit Belegzähler und Konfidenz.
- **OKF-Wissensgraph `1.800 € · 3 Tag(e)`** – ⬑ braucht: Second-Brain-Erweiterung · Open Knowledge Format: Jede Markdown-Datei ein Konzept, jeder Link eine Graph-Kante. Agenten TRAVERSIEREN Zusammenhänge, statt per Ähnlichkeitssuche Schnipsel zu raten – Mehrschritt-Fragen sitzen endlich.

## ⭐ Meisterschaften – 3 Wege, 1 ⭐ je Hofstufe

**🔧 Betreiber** – Strom, Speicher, Tempo – wer den Maschinenraum meistert, senkt jede Rechnung.
- **Server-Profi `⭐`** – **Mit Serveroptimierung bedient jede Karte 3 statt 2 Sitzungen bei vollem Tempo**
💡 Parallele Sitzungen kann jede Laufzeitumgebung bedienen – die Frage ist, ab wie vielen der Durchsatz je Nutzer einbricht. Schon einfaches Request-Batching schiebt diese Grenze spürbar nach oben; Continuous Batching (vLLM) treibt es später auf die Spitze. Die zwei gleichzeitigen Sitzungen der Standardkonfiguration sind eine Spielannahme.
- **Spotmarkt-Wecker `⭐`** – **Arbeitskosten lokaler Trainingsläufe −15 %**
💡 Effiziente Vorverarbeitung (Tokenizer-Cache, gepackte Sequenzen) spart echte GPU-Stunden – und zusammen mit dem halben Nachttarif der Nachtplanung wird jeder Lauf günstiger.
- **Kernel-Schmied `⭐`** – ⬑ nach „Server-Profi“ · **+10 % Token-Tempo auf allen eigenen Karten**
💡 FlashAttention und getunte CUDA-Kernels holen real zweistellige Prozente – Software schlägt oft den Hardware-Neukauf.
- **Speicher-Pfleger `⭐`** – ⬑ nach „Spotmarkt-Wecker“ · **VRAM-Laufzeitreserve je Tier sinkt von 1,5 auf 1,0 GB**
💡 Paged-KV-Cache und saubere Allokation senken den Speicher-Overhead – genau dafür wurde vLLM erfunden.
- **Nachtschicht-Vertrag `⭐⭐MEISTER`** – ⬑ nach „Kernel-Schmied“ · **Cloud-Trainings kosten −15 % Miete**
💡 Spot-/Preemptible-Instanzen sind oft 60–90 % billiger als On-Demand – wer Unterbrechungen einplant, trainiert fast zum halben Preis.

**🎓 Trainer** – Bessere Daten, klügere Läufe – die Zuchtschule für nachhaltiges Lernen.
- **Datenhygiene `⭐`** – **Risiko-Nachwirkung von schlechtem Futter: 1 statt 3 Tage Krankheitsgefahr**
💡 Deduplizieren und Filtern ist der halbe Trainingserfolg – Pipelines wie FineWeb existieren genau deshalb.
- **Frühstopp `⭐`** – **Übertraining-Risiko halbiert**
💡 Early Stopping auf dem Validierungsverlust ist die älteste Versicherung des Deep Learning.
- **Replay-Meister `⭐`** – ⬑ nach „Datenhygiene“ · **Risiko von katastrophalem Vergessen halbiert**
💡 Alt-Daten beimischen (Replay/Rehearsal) ist das Standardrezept gegen das Vergessen beim Nachtrainieren.
- **Curriculum-Plan `⭐`** – ⬑ nach „Frühstopp“ · **Trainings ab 3 Tagen dauern einen Tag kürzer**
💡 Gutes Lernraten-Schema und geordnete Daten konvergieren messbar schneller – Zeit ist Strom und Geld.
- **Lehrmeister `⭐⭐MEISTER`** – ⬑ nach „Replay-Meister“ · **Agenten-Welt: Zöglinge lernen +25 % schneller**
💡 Präzise Prüf-Rubriken und Belohnungsdesign beschleunigen RL-Lernen enorm – schlechte Rewards lehren das Falsche (RLVR-Prinzip).

**🤝 Händler** – Ruf, Preise, Beziehungen – der Dorfmeister verdient am Vertrauen.
- **Feilschen `⭐`** – **Viehmarkt: alle Modell-Kaufpreise −5 %**
💡 Der KI-Markt ist ein Käufermarkt: H100-Mieten haben sich 2024–2026 mehr als halbiert – wer verhandelt, spart real.
- **Vertragskunst `⭐`** – **Vertragsstrafen bei gescheiterten Aufträgen −30 %**
💡 Saubere SLAs mit Haftungsdeckel sind im KI-Dienstleistungsgeschäft überlebenswichtig.
- **Werbetafel `⭐`** – ⬑ nach „Feilschen“ · **Jeden Morgen hängt 1 Zettel mehr an der Pinnwand**
💡 Sichtbarkeit erzeugt Nachfrage – ohne Pipeline an Anfragen hilft das beste Modell nichts.
- **Stammkundenpflege `⭐`** – ⬑ nach „Vertragskunst“ · **Stammkunden-Aufschlag (+10 % Lohn) schon ab 4★ Hof-Ruf; Event-Ruf verblasst langsamer**
💡 Bestandskunden sind um ein Mehrfaches günstiger als Neukunden – Beziehungspflege ist Marge.
- **Dorfliebling `⭐⭐MEISTER`** – ⬑ nach „Werbetafel“ · **Vergrätzte Kunden kommen nach 1 statt 3 Tagen zurück und geben leichter eine zweite Chance**
💡 Reputation ist Kapital: Ein gut behandelter Reklamationsfall macht Kunden nachweislich treuer als nie ein Problem.

## ⚙️ Effizienz-Index – der Nordstern der Zucht

**Formel (offen):** Tages-Kapazität in Mtok × mittlere Kernfähigkeit (Wissen/Treue/Code/Logik) ÷ Tages-Betriebskosten (Strom der Karte bzw. API-Token), auf einer Log-Skala 0–100. Eine Verdopplung des Verhältnisses bringt ≈ +9 Punkte.

**Warum das real ist:** Genau dafür existieren Distillation, Quantisierung und MoE – gleiche Leistung mit kleinerem Fußabdruck ist der Wert eines Modells. Der Viehmarkt zahlt entsprechend: Der Verkaufswert schwankt mit dem Index (±15 %, gedeckelt).

**Zucht-Ziel:** Kinder mit höherem Index als der Eltern-Schnitt – die Wurf-Karte rechnet es dir vor. Rätsel-Architekturen (HRM/TRM) laufen außer Konkurrenz (fester Richtwert).

## 🎓 Training & Zucht

**Trainingsverfahren (9):**
- **Anstecker-Training (LoRA)** – Kein eigenes Trainingsziel, sondern SFT mit wenigen trainierbaren Zusatzmatrizen: die kleinen Anstecker lernen das Neue, das Grundmodell bleibt eingefroren. Schnell, guenstig und jederzeit wieder abnehmbar. · Risiken: vergessen 5%, hack 0%, kollaps 0%
- **Volles Feintuning (Full SFT)** – SFT ist das Trainingsziel: aus sauberen Beispiel-Dialogen lernen. 'Voll' ist die Parameter-Seite: ALLE Gewichte werden nachtrainiert. Hoechste Qualitaet, aber gefraessig: Optimierer und Gradienten brauchen ein Vielfaches des Modellgewichts an Speicher. · Risiken: vergessen 12%, hack 0%, kollaps 0%
- **Sparsames Anstecker-Training (QLoRA)** – Dasselbe Parameterverfahren wie LoRA (also SFT ueber kleine Zusatzmatrizen), nur wird die eingefrorene Basis waehrend des Trainings zusaetzlich auf 4 Bit quantisiert. Damit passt Feintuning ploetzlich auf Bauernhof-Hardware. · Risiken: vergessen 4%, hack 0%, kollaps 0%
- **Vorlieben-Abgleich (DPO)** – Das Schwein sieht Antwort-Paare: eine gute, eine schlechte. Es lernt direkt die Vorliebe – ganz ohne Belohnungsmodell und ohne wackligen RL-Kreislauf. Wichtig fuer die Speicherrechnung: Auf dem Hof laeuft DPO ueber Anstecker (LoRA-basiert) – Vollparameter-DPO braeuchte mehr Speicher als volles SFT, weil neben der Policy auch das eingefrorene Referenzmodell mitlaeuft. · Risiken: vergessen 3%, hack 4%, kollaps 0%
- **Daumen-Training (KTO)** – Es reichen einzelne Antworten mit Daumen hoch oder runter – keine muehsamen Paare. Perfekt, um Feedback aus dem laufenden Betrieb zu verfuettern. Auch KTO laeuft auf dem Hof ueber Anstecker (LoRA-basiert); als Vollparameter-Lauf laege es auf SFT-Niveau und darueber. · Risiken: vergessen 3%, hack 3%, kollaps 0%
- **Lehrer-Destillation (Distillation)** – Ein grosses Lehrer-Schwein schreibt zigtausend Musterantworten, das kleine Schueler-Schwein lernt sie per Feintuning nach. So wandert Koennen von gross nach klein. · Risiken: vergessen 3%, hack 0%, kollaps 8%
- **Weiter-Vortraining (Continued Pretraining)** – Das Schwein liest milliardenweise rohe Fachtexte einfach weiter, wie im Ur-Training. Tiefes Fachwissen – aber ohne Beikost vergisst es dabei die Welt da draussen. · Risiken: vergessen 30%, hack 0%, kollaps 0%
- **Gruppen-Belohnung (GRPO)** – GRPO ist das Optimierungsverfahren: das Schwein loest dieselbe Aufgabe mehrfach, belohnt wird relativ zur eigenen Gruppe. Die Belohnungsart dazu heisst RLVR: nur beweisbar richtige Ergebnisse (Tests, Matheantworten) zaehlen. Beides tritt meist im Doppel auf, ist aber nicht dasselbe. So entstehen Denk-Schweine. Und wieder die Speicher-Fussnote: Auf dem Hof laeuft GRPO ueber Anstecker (LoRA-basiert) – als Vollparameter-Lauf kaeme zum SFT-Bedarf noch der Puffer fuer die Antwort-Gruppen dazu. · Risiken: vergessen 2%, hack 18%, kollaps 0%
- **Belohnungs-Dressur (PPO-RLHF)** – Der ChatGPT-Klassiker: Ein eigens auf Praeferenz-Daten trainiertes Richter-Modell (Reward-Modell) benotet jede Antwort, ein Referenzmodell haelt die Leine, das Schwein jagt den Punkten hinterher. Ein beliebiges freies Schwein aus dem Stall ist noch KEIN Richter. Maechtig, teuer und beruechtigt dafuer, dass der Richter ausgetrickst wird. Selbst hier trainiert der Hof nur Anstecker (LoRA-basiert); volles PPO-RLHF mit vier Netzen im Speicher kostet ungefaehr das Doppelte eines vollen SFT. · Risiken: vergessen 5%, hack 30%, kollaps 0%

**Zucht 2.0 – Stammbuch, Würfe, Merkmale (Ära 8):**

**Verfahren (Regeln im Code):**

| Verfahren | Stufe | Kosten | Eltern | Formel je Wert | Streuung | Besonderheit  |
| | 🌀 Kugelbahn-Mischung (SLERP) | 2 | 50 € + 8 €/B | 2 | Mittel der Eltern | ±13 | Template-Bruch 8 % (Treue −8…−14)  |
| | 🪢 Konflikt-Schlichter (TIES) | 6 | 80 € + 8 €/B | 2–3 | 0,55·Mittel + 0,45·Maximum | ±7.2 | Spezialisten-Bonus +3 je anderem Topwert  |
| | 🎲 Wuerfel-Ausduennung (DARE) | 7 | 100 € + 8 €/B | 2–3 | 0,55·Mittel + 0,45·Maximum | ±6.3 | Emergenz 20 % statt 14 %  |
| | 🍲 Modell-Eintopf (Model Soup) | 8 | 140 € + 8 €/B | 2–4 | Mittel der Eltern | ±6.5 | Feintuning-Bonus +2 auf alle Werte, wenn alle Eltern trainiert sind  |

Pflicht für jedes Verfahren: gleiche Familie, gleiche Bauform, gleiche Größe (±0,01 B), **gleicher Basis-Checkpoint**, keine Leih- oder HRM-Modelle. Ausgänge je Kind: Emergenz 14 % (ein Wert +12…+22), Interferenz 16 % (ein Wert −10…−20), sonst sauber; Wissensdecke der Eltern bleibt. Werte werden gerundet.

**Wurf:** 1 Kind 55 % · 2 Kinder 33 % · 3 Kinder 12 % (mit Forschung „Wurfpflege“: 40 % / 40 % / 20 %). Jedes Zusatzkind kostet +30 % Nachbereitung, fällig beim Wurf. Eltern erholen sich 3 Hoftage. Kinder sind 5 Tage unverkäuflich; Marktwert je Generation ×0.8.

**Linie & Inzucht:** Sind beide Eltern Zuchttiere derselben Basis, bekommt das Kind +1 je Generation (max. +4) auf den Topwert der Linie – wiederholtes Mergen sauberer Feintunings konsolidiert Aufgabenvektoren (TIES/Model-Soup-Literatur), aber nie über 99. Gemeinsame Vorfahren über zwei Generationen (Geschwister, Eltern × Kind, Großeltern × Enkel): Interferenz +20 Punkte, Emergenz −8 Punkte.

**Merkmale:** Beim Kauf 20 % ein Merkmal; im Wurf erbt jedes Elternmerkmal mit seiner Quote, dazu 25 % ein neues; nach 20 sauberen Aufträgen 15 % Prägung (einmalig). Höchstens 4 Merkmale, Schmuck zählt nicht.

| Merkmal | Art | Wirkung | Vererbung | Seltenheit  |
| | 🐝 Fleißig | gut | Durchsatz +4 % | 60 % | –  |
| | 🔋 Sparsam | gut | Strombedarf −10 % | 55 % | –  |
| | 🛡️ Robust | gut | Krankheitsrisiko −30 % | 50 % | –  |
| | 📚 Lernfreudig | gut | Trainingsgewinn +10 % | 50 % | –  |
| | 🧘 Gelassen | gut | Reklamations-Risiko −20 % (relativ) | 55 % | –  |
| | 🔍 Scharfsinnig | gut | Qualitätschance +3 Punkte | 45 % | –  |
| | 🦉 Nachteule | gut | Ruhe-Nacht +9 statt +6 Zustand, Nachttraining 10 % schneller | 60 % | –  |
| | 🧺 Sammler | gut | +1 GB Web-Silage je Nacht | 50 % | –  |
| | 📦 Kompakt | gut | VRAM-Bedarf −5 % | 40 % | –  |
| | 💐 Charmant | gut | Kunden geben ab 90 % Abnahme 5 ⭐ | 50 % | –  |
| | 🐢 Geduldig | gut | Bewährungsprobe gepatzt: −2 statt −4 Qualität | 55 % | –  |
| | ❄️ Frostfest | gut | Winter-Malus auf den Durchsatz entfällt | 60 % | –  |
| | 👁️ Wachsam | gut | Prompt-Injection: +25 % Abwehrchance | 45 % | –  |
| | 🎯 Feinfühlig | gut | Datenlese: perfekte Runde bringt +1 GB | 45 % | –  |
| | 🍽️ Verfressen | neutral | Training braucht +15 % Futter, bringt +2 Zuwachs | 60 % | –  |
| | ⚡ Zappelig | neutral | Durchsatz −2 %, Zustand +2 je Nacht | 50 % | –  |
| | 🎭 Eigensinnig | neutral | Team-Übergabe −4 Qualität, solo +2 | 50 % | –  |
| | 😴 Langschläfer | neutral | Nachtaktionen 8 % langsamer, Ruhe +3 extra | 55 % | –  |
| | ✨ Shiny | Schmuck | nur Leuchten – keine Wirkung | 10 % | 1 : 100.000  |
| | 🌈 Regenbogen | Schmuck | nur Schimmer – keine Wirkung | 5 % | 1 : 50.000  |
| | 🌟 Sternenfell | Schmuck | nur Funkeln – keine Wirkung | 20 % | 1 : 5.000  |
| | 🦷 Goldzahn | Schmuck | nur Schmuck – keine Wirkung | 30 % | 1 : 2.000  |
| | 🌀 Ringelschwanz | Schmuck | nur Schmuck – keine Wirkung | 50 % | 1 : 300  |
| | ⚪ Ohrfleck | Schmuck | nur Schmuck – keine Wirkung | 50 % | 1 : 200  |

**Zucht-Verfahren (4):**
- **Kugelbahn-Mischung (SLERP)** – Zwei Elterntiere werden Gewicht fuer Gewicht auf einer Kugelbahn gemischt – weicher als stures Mitteln der Werte. Voraussetzung: gleiche Abstammung und gleiche Tensorformen, im Spiel also gleiche Familie, gleiche Parameterzahl, gleiche Bauform. Die Parameterzahl wird dabei NICHT gemittelt – das Kind behaelt die Groesse der Eltern. Dauer: 1 Hoftag.
- **Konflikt-Schlichter (TIES)** – Kleine Aenderungen werden gestutzt, Vorzeichen-Streit zwischen den Eltern wird geschlichtet, erst dann wird gemischt – weniger gegenseitiges Ausloeschen. Auch hier Pflicht: gleiche Familie, gleiche Parameterzahl, gleiche Bauform und derselbe Basis-Checkpoint; die Parameterzahl wird nicht gemittelt. Spezialisten-Bonus: bringt jeder Elternteil einen anderen Topwert, gibt es +3 darauf. Dauer: 1 Hoftag.
- **Wuerfel-Ausduennung (DARE)** – Vor dem Mischen wird ein Grossteil der Aenderungs-Gewichte zufaellig weggewuerfelt und der Rest hochskaliert – so kommen sich mehrere Eltern kaum in die Quere. Voraussetzung wie bei jeder Zucht: gleiche Familie, gleiche Parameterzahl, gleiche Bauform, derselbe Basis-Checkpoint. Emergenz-Chance 20 % statt 14 %. Dauer: 1 Hoftag.
- **Modell-Eintopf (Model Soup)** – Mehrere Trainingsstaende desselben Schweins werden schlicht gemittelt – gemittelt werden die Gewichtswerte, nicht die Parameterzahl. Der konservativste Topf im Stall, selten grandios, selten giftig. Gleiche Abstammung und gleiche Tensorformen sind Pflicht; Dauer: 1 Hoftag.

**Diät-Stufen (Quantisierung):** `0 · 16 Bit1 · 8.5 Bit2 · 6.6 Bit3 · 5.7 Bit4 · 4.85 Bit5 · 3.9 Bit6 · 2.9 Bit`

Eiserne Regeln: Daten werden beim Training NICHT verbraucht (Bibliothek) · wiederholtes Training auf demselben Satz sättigt · Adapter passen nur auf ihre eigene Basis · Übertraining und Vergessen sind echte Risiken mit echten Kuren.

## 🦙 Inferenz-Laufzeitumgebungen – die Software der Bucht

Jede GPU-Bucht verwendet EINE Laufzeitumgebung; ein Wechsel kostet den Rest des Tages (Rüstzeit). Lokale Laufzeitumgebungen können in den RAM auslagern. Server-Laufzeitumgebungen (nur Rack-Karten, mindestens q8) halten das gesamte Modell im VRAM und sind für den Parallelbetrieb optimiert.
- **llama.cpp** – Der Heim-Standard: GGUF-Quantisierungen, robustes Ausweichen in den RAM. Spielabstraktion: Ohne Komfort-Hülle kostet jeder Modellwechsel Lade- und Rüstzeit – auf dem Hof darum nur EIN Wechsel je Bucht und Tag. (Real gibt es kein Tageslimit; llama.cpp lädt beliebig oft – Ollama/LM Studio nehmen dir Laden/Entladen und Verwaltung ab.)
💡 Das C++-Urgestein machte Heim-Inferenz möglich: GGUF-Quantisierung und CPU-RAM-Auslagerung holen große Modelle auf kleine Karten. Der reale Unterschied zu Ollama ist nicht ein Limit, sondern Komfort: automatische Modellverwaltung und schneller Wechsel. Was ein Wechsel wirklich kostet, ist Ladezeit von der SSD – Sekunden je Gigabyte.
- **Ollama `60 € hofweit`** – Komfort-Hülle über llama.cpp: Tiere beliebig oft am Tag umsetzen, ein Befehl genügt. Die Software selbst ist kostenlos – die 60 € sind Einrichtungs- und Betreuungsaufwand (Spielannahme), keine Lizenzgebühr.
💡 „ollama run“ machte lokale Modelle massentauglich – unter der Haube arbeitet llama.cpp weiter. Ollama ist quelloffen und kostet nichts; was es dich draußen kostet, ist die Zeit fürs Einrichten und Pflegen. Genau die stellt der Hof als einmaligen Posten in Rechnung.
- **LM Studio `60 € hofweit`** – Grafische Komfort-Hülle: gleiche Freiheit wie Ollama, nur mit Knöpfen statt Befehlen. Auch hier gilt: Die Software selbst ist kostenlos – die 60 € sind Einrichtungs- und Betreuungsaufwand (Spielannahme).
💡 Für alle, die Oberflächen mögen: dieselbe llama.cpp-Basis – im Spiel wirkungsgleich mit Ollama, reine Geschmacksfrage. LM Studio ist für private Nutzung gratis; der Hofposten bildet nur die Einrichtungszeit ab.
- **vLLM `Server`** – Server-Laufzeitumgebung (nur Rack-Karten, min. q8): Continuous Batching hält den Durchsatz auch bei VIELEN gleichzeitigen Nutzern hoch – kein RAM-Ausweichen.
💡 Parallele Anfragen kann auch ein lokale Laufzeitumgebung (llama.cpp-Server kennt Slots und Continuous Batching) – nur bricht dort der Durchsatz je Nutzer schnell ein. vLLM hält ihn mit PagedAttention und Continuous Batching oben; das ist der Unterschied, nicht „geht/geht nicht“. Die 2 Slots des lokale Laufzeitumgebungen im Spiel sind eine Spielannahme für die Standardkonfiguration.
- **SGLang `Server`** – Server-Laufzeitumgebung (nur Rack-Karten, min. q8): RadixAttention-Prefix-Cache – spart Token und hebt die Qualität in Agenten-Ketten.
💡 Agenten wiederholen große Prompt-Teile in jedem Schritt; SGLang verwertet diese Präfixe wieder – genau dort liegt sein Vorsprung.

## 🧰 Agenten-Tools, Hilfsmittel & Wissenswerkstatt

**Agenten-Tools (16):** Arbeitsumgebung für Agenten-Aufträge – Eignung hängt an der Modellfamilie.
`🪢 Basis-Tool (offenes Basis-Gerüst)🟠 Claude Code🦀 Codex CLI🚀 Antigravity CLI🐉 Qwen Code🌙 Kimi Code CLI🧰 OpenCode💘 Crush🤝 Aider🤖 Cline⚖️ Kilo Code🪿 goose🥧 pi🙌 OpenHands🦾 Droid (Factory)🌬️ Mistral Vibe CLI`
**Hilfsmittel (6):**
- **Wissenspipeline (RAG)** – Gemeinsame Vektordatenbank + Embedding-Modell + aktueller Index. OCR erschließt Scans; ein Reranker verbessert die Treffer. Aufbau in der Wissenswerkstatt.
- **Vorausschauendes Decoding (Speculative Decoding)** – Ein flinkes Entwurfs-Ferkel rennt voraus und raet mehrere Tokens, das grosse Schwein prueft sie im Sammelpack. Braucht zwingend ein kompatibles Draft-Schwein im Stall: identischer Tokenizer, in der Praxis meist dieselbe Familie – und mindestens achtmal kleiner als das grosse Tier. Das Entwurfs-Ferkel braucht ausserdem eine eigene freie Bucht: Es muss mitlaufen und kann in der Zeit keinen Auftrag erledigen. Ohne passenden Partner gibt es keinen Tempo-Bonus.
- **Antwortkontrolle (Verifier)** – Ein zweiter Blick vor dem Abschicken: eine Kontrollinstanz prueft Fakten, Format und ob die Antwort ueberhaupt zur Frage passt. Jede Pruefung ist ein zusaetzlicher Aufruf – der eigene Tokens und Strom kostet.
- **Mehrfachauswahl (Best-of-N)** – Das Schwein generiert N vollstaendige Antworten – echte Mehrfach-Generierung, die Token-Rechnung verdreifacht sich hier wirklich – und nur die beste kommt in den Verkauf. Qualitaet gegen Tokens getauscht.
- **Agenten-Gedaechtnis (Memory)** – Ein Notizbuch am Halsband: externe Notizen zu Projektstand, Vorlieben und alten Entscheidungen. Die Gewichte des Schweins aendern sich dadurch nicht, und das Kontextfenster wird nicht physisch groesser – passende Notizen werden nur bei Bedarf hineingeladen.
- **Modell-Router** – Ein Weichensteller am Hoftor: leichte Fragen gehen zum kleinen Schwein, nur die harten Brocken zum grossen. Die Routing-Entscheidung selbst ist ein eigener Arbeitsschritt mit eigenem Aufwand – gespart wird nur, wenn der Anfragen-Mix wirklich viele leichte Faelle enthaelt.

**Wissenswerkstatt-Bausteine:**
- **Vektordatenbank `90 €`** – Speichert Textabschnitte mit ihren Suchvektoren. Kein Wissen in Modellgewichten. · ⬑ braucht
- **Embedding-Modell `120 €`** – Übersetzt Suchfrage und Text in vergleichbare Vektoren. Zusammen mit der Datenbank wird Textsuche möglich. · ⬑ braucht vector
- **OCR-Modell `100 €`** – Liest Text aus Scans und Fotos. Für reine Textquellen optional; bei Belegen und Archivscans erforderlich. · ⬑ braucht vector
- **Reranker `160 €`** – Bewertet gefundene Textstellen erneut. Bessere Treffer, aber zusätzliche Rechenarbeit. · ⬑ braucht embedding

## 🤒 Krankheiten (4)
- **Kontextrot** – Der Arbeitskontext ist über lange Einsätze vermüllt: Wichtiges rutscht in die Mitte und wird überlesen, Ablenker gewinnen. Kontext- und Treue-Leistung brechen ein. · **Heilwege:** 2 Ruhetage oder Kontext-Kompaktierung (60 €)
- **Halluzinose** – Das Modell erfindet selbstbewusst Fakten – Reklamationen häufen sich. Ausgelöst durch dreckiges Futter, zu heiße Einstellung oder Dauer-Überlastung. · **Heilweg:** Faktenkur (Grounding) (140 € + 15 GB Kuratierte Auslese)
- **Übertraining** – Zu viel Training in zu kurzer Zeit: Das Modell hat sich an den letzten Datensatz geklammert und wirkt insgesamt wackliger. Trainingssperre, bis es sich erholt. · **Heilweg:** Checkpoint-Rollback (40 €)
- **Schleifenfieber** – Das Modell wiederholt Phrasen und dreht Antwort-Schleifen. Ausgelöst durch zu kalte Sampler-Einstellung bei empfindlichen Familien oder Synthetik-Inzucht. · **Heilweg:** Sampler-Reset + Frischfutter (50 € + 10 GB Kuratierte Auslese)

## ⚡ Hof-Ereignisse
- **Dorfmesse `nachfrage`** – Halb Umland ist auf den Beinen – Kunden zahlen für alles, was schnell fertig wird, einen Aufschlag.
- **Landesförderung für KI-Höfe `forschung`** – Das Land bezuschusst Forschung auf kleinen Höfen – ein Viertel der Forschungskosten übernimmt die Kasse in Berlin.
- **GPU-Schnäppchen `gpupreis`** – Ein Rechenzentrum verkauft seine alten Karten – der Viehmarkt für Rechenknechte ist heute 20 % billiger.
- **KI-Stammtisch im Dorfkrug `dorfplatz`** – Das halbe Dorf fachsimpelt über Token und Sampler – auf dem Dorfplatz lernt heute jeder anderthalbmal so schnell.
- **Exportkontrollen verschärft `gpupreis`** – Neue Ausfuhrregeln für Spitzenchips würgen den Nachschub ab – der Viehmarkt für Rechenknechte dreht durch.
- **Dunkelflaute überm Land `strompreis`** – Kein Wind, keine Sonne, klirrende Kälte – der Börsenstrom wird sündteuer und die Tröge summen teurer.
- **Abwärme-Auflage vom Landratsamt `strompreis`** – Das Amt verlangt, dass dein Rechenstall seine Abwärme nutzt – der Umbau kostet Strom und Nerven.
- **Klage wegen Trainingsdaten `klage`** – Ein großer Verlag behauptet, seine Artikel stecken ungefragt im Futter deiner Schweine – Anwaltspost im Briefkasten.
- **EU-AI-Act-Prüfung `audit`** – Prüfer wollen deine Unterlagen sehen: Woher stammt das Futter, wie transparent ist der Stall?
- **Prompt-Injection auf den Kundenbot `injection`** – Jemand hat deinem Support-Schwein böse Anweisungen in eine harmlose Kundenmail geschmuggelt. Ein guter Zaun (Schutzregeln) senkt das Risiko deutlich – völlig gefeit ist aber kein Stall.
- **Benchmark-Skandal im Dorf `ruf`** – Ein Nachbarhof hat Prüfungsfragen ins Futter gemischt – jetzt schauen alle Kunden auch dich schief an.
- **Preiskrieg der API-Anbieter `nachfrage`** – Die großen Leihschwein-Höfe unterbieten sich gegenseitig – ein Teil deiner Kundschaft wandert zu den Billigtrögen ab.
- **Virale Nachfragewelle `nachfrage`** – Ein Video über deinen Hof geht durchs Netz – plötzlich will das halbe Land Aufträge bei dir buchen.
- **Großer Cloud-Ausfall `ausfall`** – Eine große Wolkenregion ist dunkel – Leihschweine antworten nicht, halb so schlimm für lokale Ställe.
- **Talentjäger auf dem Hof `ausfall`** – Ein Großlabor lockt deine beste Stallmeisterin mit einem Traumgehalt – die Arbeit stockt.
- **Starkes Open-Source-Release `daten`** – Ein Labor legt Gewichte und Datenrezepte offen – 15 GB frischer Webmix wandern gratis in dein Futterlager.
- **DSGVO-Beschwerde `audit`** – Ein Kunde beschwert sich bei der Aufsichtsbehörde: Dein Bot habe falsche Dinge über ihn erzählt.
- **Halluzinations-Debakel in der Zeitung `ruf`** – Ein Schwein aus der Gegend hat vor Gericht erfundene Urteile zitiert – die Lokalpresse spottet über alle KI-Höfe.
- **Engpass im Stromnetz `strompreis`** – Der Netzbetreiber drosselt Großverbraucher zu Spitzenzeiten – deine Racks müssen kürzertreten.
- **Lieferverzug beim GPU-Händler `gpupreis`** – Die bestellten Rechenknechte hängen in der Fertigung fest – der Händler vertröstet auf nächstes Quartal.
- **Energiepreis-Förderung bewilligt `strompreis`** – Das Land bezuschusst stromintensive Betriebe – dein Zähler dreht sich günstiger.
- **Hackathon-Ruhm `ruf`** – Dein Team gewinnt den Regions-Hackathon – das Dorf redet über nichts anderes.
- **Fachkräfte-Zulauf `nachfrage`** – Eine erfahrene KI-Handwerkerin heuert bei dir an und bringt ihren Kundenstamm gleich mit.
- **Solarrekord-Sommer `strompreis`** – Wochenlang Bilderbuchsonne: Mittags ist Strom fast geschenkt – perfekte Zeit für Trainingsläufe.
- **Kühlflüssigkeit leckt im Rechenstall `wahl`** – Unter dem Rack steht eine Pfütze – die Wasserkühlung eines Rechners verliert Druck. Läuft er weiter heiß, drosselt er sich selbst.
- **Eine Praktikantin klopft an `wahl`** – Lena aus der Berufsschule will vier Wochen lernen, wie man Modelle betreibt – gegen kleines Geld und viel Erklären.
- **Der Nachbar räumt sein GPU-Lager `wahl`** – Der Nachbarhof stellt auf Cloud um und lässt dich zwei Tage zum Freundschaftspreis in seinem Hardware-Lager stöbern.
- **Das Dorfradio will ein Interview `wahl`** – Antenne Modelldorf fragt, ob du im Morgenmagazin erzählst, was ein KI-Hof eigentlich macht.
- **Der Versorger bietet einen Sondertarif `wahl`** – Für 120 € Wechselgebühr bekommst du sechs Tage lang 15 % Rabatt auf jede Netz-Kilowattstunde – tags wie nachts.
- **Die Bücherei bietet ihr Archiv an `wahl`** – Bücherei Seitenwind will dir ihr digitalisiertes Ortsarchiv als Trainingsdaten überlassen – Herkunft geklärt, aber roh und ungesichtet.
- **Offenes Gateway! `injection`** – Dein OpenClaw-Leitstand war aus dem Netz erreichbar – jemand hat dem Hof-Agenten über eine präparierte Webseite Anweisungen untergeschoben.

**⚡ Strom von vorn bis hinten (Ära 8):**
**Anschluss = Grenze.** Jeder Rechner braucht Spitzenleistung × PUE der Gebäudestufe; die Summe plus Grundlast darf den Netzanschluss plus Eigenbonus nicht übersteigen. Start: 6 kW (Geräteschuppen), Nachbarvertrag +6 kW für 350,00 € (+10 % auf den Nachbaranteil, nur im Schuppen), Nerdtempel 12 kW und Ausbau-Ereignisse 25 kW/2.500,00 €, 63 kW/4.500,00 €, 100 kW/8.000,00 €, Rechenzentrum 100 kW und 200 kW/12.000,00 €, 400 kW/24.000,00 €, 600 kW/40.000,00 €.**Eigenbonus.** Solar (kWp × 0.6), Wind (Mittelleistung × 0.8) und Akku (Entladeleistung × 0.5) entlasten den Anschluss, zusammen höchstens 50 % der Netzleistung. So passt mit drei Solarmodulen ein Rechner mehr, ohne den teureren Anschluss.**Grundpreis.** Der Netzanschluss kostet 0,50 € je kW und Tag (6 kW = 3,00 €, 100 kW = 50,00 €, 600 kW = 300,00 €). Eigenstrom zahlt keinen Grundpreis.**Arbeitspreis.** Netzstrom 0,48 €/kWh tags, nachts (22–6 Uhr) die Hälfte; Wetterlage „Teure Netzstunden“ ×1,6; Ereignisse multiplizieren. Einspeisung bringt 0,08 €/kWh – eigene kWh zuerst selbst verbrauchen.**Verbrauch.** Auftrag 14 h × 60 % der Spitze, Training 95 %, Nachtplan 95 %, Leerlauf 45 W je belegter Bucht; PUE Schuppen 1.45, Nerdtempel 1.25, Rechenzentrum 1.12; Grundlast 0.025 / 0.1 / 1.2 kW + 0.06 kW je Schrank.**Erzeugung.** Solar 2,9 kWh je kWp und Normtag (Saison fruehling ×1.25, sommer ×1.45, herbst ×0.75, winter ×0.35), Module 4×400 Wp / 6×600 Wp / 10×600 Wp je Stufe, Freilandfeld 2,4 kWp für 270,00 € (Rechenzentrum). Wind 5 kW/2.200,00 € (cf 0.45), 20 kW/7.200,00 € (cf 0.75), 50 kW/16.500,00 € (cf 1) ab Nerdtempel, Normjahr 25 % Auslastung. Akku 40,00 €/kWh, Wirkungsgrad 90 %, Nachtladung nur im Modus „Netz“. Kraftwerk 15 kW/5.000,00 €, 45 kW/13.500,00 €, 120 kW/30.000,00 €, 240 kW/55.000,00 €, 400 kW/85.000,00 €, Brennstoff 0,40 €/kWh – läuft, sobald Netzstrom teurer ist, sonst Reserve bei Netzausfall.**Wartung.** Solar/Akku 1 %, Wind 2 %, Kraftwerk 4 % des Kaufpreises je Jahr; GPUs 3 % je Jahr (nach Nacht-Wartung 10 Tage halb).**Entscheidung.** Ein weiteres stromhungriges Tier braucht einen Rechner, der in den Anschluss passen muss – die Strom-Leiste im Stall zeigt, was noch passt und welche Anlage sich zuerst lohnt.
**Entscheidungs-Ereignisse (Ära 9):** Manche Ereignisse stellen eine Wahl. Jede Option nennt ihre Zahlen vorab; wer bis zum Tagesende nicht entscheidet, bekommt die Standard-Option. `💧 Kühlflüssigkeit leckt im Rechenstall: Techniker rufen (−250 €) / Untertakten (Durchsatz ×0.8 · 2 Tage) / Abwarten (−90 € · Durchsatz ×0.9 · 3 Tage)🎒 Eine Praktikantin klopft an: Einstellen (200 €) (−200 € · +80 XP · Forschung -15 % · 7 Tage) / Freundlich ablehnen (keine Wirkung)📦 Der Nachbar räumt sein GPU-Lager: Stöbern gehen (Hardware -25 % · 2 Tage) / Kein Bedarf (keine Wirkung)📻 Das Dorfradio will ein Interview: Interview geben (Ruf +4 · Nachfrage +10 % · 3 Tage) / Lieber nicht (keine Wirkung)🔌 Der Versorger bietet einen Sondertarif: Wechseln (120 €) (−120 € · Strom -15 % · 6 Tage) / Beim alten Tarif bleiben (keine Wirkung)📚 Die Bücherei bietet ihr Archiv an: Annehmen und sichten (+12 GB Silage) / Dankend ablehnen (keine Wirkung)`

**Auftrags-Ereignisse (bei der Abnahme):**

| Ereignis | Voraussetzung | Chance | Wirkung  |
| | 🌟 Kunde begeistert | sauber abgenommen, Zusage-Ampel 🟡/🔴 (≥ 80 % Fristbudget), Qualitätschance ≥ 90 % | 18 % | Lohn +25 %, Kunde +1 ⭐, Ruf +2  |
| | 💶 Trinkgeld | 🧺 Klein-/Mikrozettel sauber, Serie ≥ 3 | 10 % | Lohn +12 %  |
| | 📣 Empfehlung | sauber, Kunde hat 5 ⭐ | 15 % | morgen ein Zettel dieses Kunden mit +15 % Lohn  |
| | 🏗️ Folgeauftrag | Großauftrag (L) sauber | 25 % | gleicher Zettel erneut, Puffer +1 Tag  |
| | 🛡️ DSGVO-Leck | seit Ära 9 Teil der Datenschutzprüfung bei jeder Abnahme (Kapitel „Datenschutz & Aufsicht“): Risiko je Sektor, Leih-Tier zählt doppelt | siehe Datenschutz | Strafe, Ruf, Groll und Abmahnung nach den Datenschutz-Regeln – Schutz durch Fachwissen, Agenten-Tool mit Schutzfunktionen, Schutzregeln, Kontrollpaket  |

**🕵️ Hacker-Angriff:** ab Hoftag 6, 6 % je Nacht (frühestens alle 6 Tage), nur bei Kunden mit ≥ 3 Aufträgen. Auf dem Dorfplatz: Vier gewinnt gegen den Hacker, bis Tagesende. Sieg: Prämie 80 € + 20 € je Hofstufe, +1 ⭐, Ruf +4, 30 XP, kein Injection-Schaden heute. Niederlage oder nicht gespielt: Kunde 4 Tage verloren, −2 ⭐, 40 €, Ruf −3. Remis: Ruf -1.

**Hof-Ereignisse (nachts, 34 % Chance je Nacht, gleichverteilt):** 15 gute · 16 schlechte/neutrale.
- **Dorfmesse `gut · 3 Tage`** – Halb Umland ist auf den Beinen – Kunden zahlen für alles, was schnell fertig wird, einen Aufschlag.
- **Landesförderung für KI-Höfe `gut · 5 Tage`** – Das Land bezuschusst Forschung auf kleinen Höfen – ein Viertel der Forschungskosten übernimmt die Kasse in Berlin.
- **GPU-Schnäppchen `gut · 3 Tage`** – Ein Rechenzentrum verkauft seine alten Karten – der Viehmarkt für Rechenknechte ist heute 20 % billiger.
- **KI-Stammtisch im Dorfkrug `gut · 2 Tage`** – Das halbe Dorf fachsimpelt über Token und Sampler – auf dem Dorfplatz lernt heute jeder anderthalbmal so schnell.
- **Exportkontrollen verschärft `Risiko · 6 Tage`** – Neue Ausfuhrregeln für Spitzenchips würgen den Nachschub ab – der Viehmarkt für Rechenknechte dreht durch.
- **Dunkelflaute überm Land `Risiko · 4 Tage`** – Kein Wind, keine Sonne, klirrende Kälte – der Börsenstrom wird sündteuer und die Tröge summen teurer.
- **Abwärme-Auflage vom Landratsamt `Risiko · 5 Tage`** – Das Amt verlangt, dass dein Rechenstall seine Abwärme nutzt – der Umbau kostet Strom und Nerven.
- **Klage wegen Trainingsdaten `Risiko · 3 Tage`** – Ein großer Verlag behauptet, seine Artikel stecken ungefragt im Futter deiner Schweine – Anwaltspost im Briefkasten.
- **EU-AI-Act-Prüfung `Risiko · 2 Tage`** – Prüfer wollen deine Unterlagen sehen: Woher stammt das Futter, wie transparent ist der Stall?
- **Prompt-Injection auf den Kundenbot `Risiko · 2 Tage`** – Jemand hat deinem Support-Schwein böse Anweisungen in eine harmlose Kundenmail geschmuggelt. Ein guter Zaun (Schutzregeln) senkt das Risiko deutlich – völlig gefeit ist aber kein Stall.
- **Benchmark-Skandal im Dorf `Risiko · 5 Tage`** – Ein Nachbarhof hat Prüfungsfragen ins Futter gemischt – jetzt schauen alle Kunden auch dich schief an.
- **Preiskrieg der API-Anbieter `Risiko · 5 Tage`** – Die großen Leihschwein-Höfe unterbieten sich gegenseitig – ein Teil deiner Kundschaft wandert zu den Billigtrögen ab.
- **Virale Nachfragewelle `gut · 4 Tage`** – Ein Video über deinen Hof geht durchs Netz – plötzlich will das halbe Land Aufträge bei dir buchen.
- **Großer Cloud-Ausfall `Risiko · 1 Tage`** – Eine große Wolkenregion ist dunkel – Leihschweine antworten nicht, halb so schlimm für lokale Ställe.
- **Talentjäger auf dem Hof `Risiko · 3 Tage`** – Ein Großlabor lockt deine beste Stallmeisterin mit einem Traumgehalt – die Arbeit stockt.
- **Starkes Open-Source-Release `gut · 5 Tage`** – Ein Labor legt Gewichte und Datenrezepte offen – 15 GB frischer Webmix wandern gratis in dein Futterlager.
- **DSGVO-Beschwerde `Risiko · 2 Tage`** – Ein Kunde beschwert sich bei der Aufsichtsbehörde: Dein Bot habe falsche Dinge über ihn erzählt.
- **Halluzinations-Debakel in der Zeitung `Risiko · 4 Tage`** – Ein Schwein aus der Gegend hat vor Gericht erfundene Urteile zitiert – die Lokalpresse spottet über alle KI-Höfe.
- **Engpass im Stromnetz `Risiko · 4 Tage`** – Der Netzbetreiber drosselt Großverbraucher zu Spitzenzeiten – deine Racks müssen kürzertreten.
- **Lieferverzug beim GPU-Händler `Risiko · 5 Tage`** – Die bestellten Rechenknechte hängen in der Fertigung fest – der Händler vertröstet auf nächstes Quartal.
- **Energiepreis-Förderung bewilligt `gut · 5 Tage`** – Das Land bezuschusst stromintensive Betriebe – dein Zähler dreht sich günstiger.
- **Hackathon-Ruhm `gut · 3 Tage`** – Dein Team gewinnt den Regions-Hackathon – das Dorf redet über nichts anderes.
- **Fachkräfte-Zulauf `gut · 4 Tage`** – Eine erfahrene KI-Handwerkerin heuert bei dir an und bringt ihren Kundenstamm gleich mit.
- **Solarrekord-Sommer `gut · 5 Tage`** – Wochenlang Bilderbuchsonne: Mittags ist Strom fast geschenkt – perfekte Zeit für Trainingsläufe.
- **Kühlflüssigkeit leckt im Rechenstall `Risiko · 2 Tage`** – Unter dem Rack steht eine Pfütze – die Wasserkühlung eines Rechners verliert Druck. Läuft er weiter heiß, drosselt er sich selbst.
- **Eine Praktikantin klopft an `gut · 2 Tage`** – Lena aus der Berufsschule will vier Wochen lernen, wie man Modelle betreibt – gegen kleines Geld und viel Erklären.
- **Der Nachbar räumt sein GPU-Lager `gut · 2 Tage`** – Der Nachbarhof stellt auf Cloud um und lässt dich zwei Tage zum Freundschaftspreis in seinem Hardware-Lager stöbern.
- **Das Dorfradio will ein Interview `gut · 2 Tage`** – Antenne Modelldorf fragt, ob du im Morgenmagazin erzählst, was ein KI-Hof eigentlich macht.
- **Der Versorger bietet einen Sondertarif `gut · 2 Tage`** – Für 120 € Wechselgebühr bekommst du sechs Tage lang 15 % Rabatt auf jede Netz-Kilowattstunde – tags wie nachts.
- **Die Bücherei bietet ihr Archiv an `gut · 2 Tage`** – Bücherei Seitenwind will dir ihr digitalisiertes Ortsarchiv als Trainingsdaten überlassen – Herkunft geklärt, aber roh und ungesichtet.
- **Offenes Gateway! `Risiko · 2 Tage`** – Dein OpenClaw-Leitstand war aus dem Netz erreichbar – jemand hat dem Hof-Agenten über eine präparierte Webseite Anweisungen untergeschoben.

**📰 Zettelschmiede & Hofpost:**

**Dorf-Anliegen (freiwillig):** ab Hoftag 3 alle 5 Tage ein Bittbrief mit klarem Ziel (saubere Zettel einer Art oder eines Betriebs, Nächte mit Zusatzarbeit, eingesetzte Eigenenergie, Datenlese-Tage), 6 Tage Frist, Prämie in Euro plus Ruf +1. Höchstens 2 offen; Verfall kostet nichts.

Die **Zettelschmiede** kombiniert geprüfte Auftragsvorlagen mit einer Saat je Partie. Sie verändert keine Anforderungen oder Energieregeln. Bis zu 12 neue Betriebe entstehen aus Branchen, Namen, Orten und Eigenarten.

Bei 35 % der normalen Zettel erscheint höchstens eine sichtbare Wendung: Stammkunde +8 %, Knauserig −10 % und +1 Tag, Vertraulich +12 % und nur lokal, Vorkasse 30 %, Referenz +1 Ruf oder Testballon mit Folgechance. Lohnänderungen bleiben damit im Band ±12 %, Fristen bei ±1 Tag.

Die Hofpost verwendet nur Spielstand und exakte Spielwetter-Prognose. Ein ausdrücklich als **Gerücht** bezeichneter Satz trifft mit 60 % zu; er ist niemals als Fakt formuliert.

**Tages-Wetterlagen (Hofplanung):** `🌤️ Ein guter Tag für saubere Arbeit☀️ Sonne über dem Hof🌬️ Eine kräftige Brise📈 Teure Netzstunden☁️ Dunkelflaute📚 Neue Fassung im Kundenarchiv🧾 Der Kunde ändert sein Ausgabeformat📬 Viele kleine Anliegen🧐 Ein unabhängiger Prüfer schaut vorbei🔌 Netzausfall angekündigt · 14–18 Uhr`

## 🌱 Saisonen (je 30 Hoftage)
- **Frühling** – Antragszeit im Dorf: Vereine und Ämter brauchen Texte und Wissensarbeit – Schreib- und Wissens-Zettel hängen öfter aus.
- **Sommer** – Sommerloch: Die Löhne sind etwas flauer – dafür sind frische Web-Crawls 20 % günstiger. Gute Zeit zum Trainieren.
- **Herbst** – Messe- und Projektzeit: Code- und Agenten-Arbeit ist gefragt, die Budgets sitzen locker (+6 % Lohn).
- **Winter** – Jahresabschluss: Tabellen- und Prüfarbeit häufen sich – und Dunkelflauten treffen den Hof doppelt so oft.

🧹 **Datenlese** (Futterscheune, 1×/Tag): 8 Schnipsel sortieren – 4 GB Web-Silage werden je nach Quote zu 0–4 GB Kuratiertem.

## 📌 Aufträge & Kunden

**Bewährungsproben:** Während eines Auftrags würfelt jede Rolle gelegentlich (≈ 30 % je Tag bei Teams, 15 % bei Einzeltieren) ein Eignungs-Ereignis: bestanden = Qualität +3 und +2 Tier-XP, gepatzt = Qualität −4 – das Hilfsmittel „Antwortkontrolle“ rettet jeden zweiten Patzer. **Denkmodus:** Hybrid-Denker (Reasoning) liefern mit Denkmodus +8 Logik/+5 Code, verbrauchen aber 55 % des Durchsatzes (Denk-Token) – bei API-Tieren zählen sie als Ausgabe-Token.

**Qualitätsprognose:** Chance auf eine vollständig saubere Abnahme, gedeckelt bei 97 %. Wird sie knapp verfehlt, nimmt der Kunde gestuft 90 % bis 40 % der Einheiten ab; Klein-/Mikrozettel tragen zusätzlich 5 % Bagatellrisiko mit −15 % Lohn. **Tageskapazität** sagt dagegen nur, welcher Anteil der geplanten Tagesarbeit pro Tag geschafft wird – 50 % können bei zwei verfügbaren Tagen trotzdem 100 % bis zur Frist ergeben. **Kontrollpaket:** +6 Qualitätsprognose, 8 € je Arbeitstag und Datenschutzrisiko ×0,7.

**Grundregeln:** Kunden zahlen je abgenommener Arbeitseinheit · Vorab-Kalkulation an jedem Zettel · Offene Zettel verfallen nach 3 Tagen (Chip „verfällt morgen") · Drei Ausgänge: sauber (voll bezahlt), Reklamation (gestuft wie oben), GESCHEITERT (Besetzung deutlich zu schwach: 15 % Vertragsstrafe, keine Auszahlung, zweite Chance mit 8 %) · Fristbruch: 12 % Strafe und keine reguläre Auszahlung; ab 70 % fertiger Arbeit zahlt der Kunde 30 % des vereinbarten Lohns als Teilabnahme – Fertigkeit „Vertragskunst“ senkt alle Strafen um 30 % · Team-Aufträge: Übergabelast +12 % Token (gleiche Modellfamilie: +8 %), −3 Qualität, EINE Auszahlung, XP nach Rollenanteil.

**⏱️ Stunden-Regel:** Jeder Zettel trägt eine Gesamtarbeit in Mtok. Ein Tier schafft je Arbeitstag (14 h) seine Mtok/Tag-Kapazität (Token/s × 14 h) – daraus folgt in der Einsatzplanung die Stundenzahl je Kandidat, und am Tier steht die Restarbeit in Stunden. Schnelle Tiere (Quantisierung, schnellere Karte, Server-Laufzeitumgebung) sind früher fertig und wieder frei – **Sofort-Abnahme:** Ist die Restarbeit vor Tagesende geschafft, nimmt der Kunde noch am selben Tag ab (Hofuhr) und das Tier kann den nächsten Zettel übernehmen; langsame Tiere reißen die Frist (Annahmetag + Arbeitstage − 1 + Puffer). Ein Team ist so schnell wie seine langsamste Stufe. Die Zusage zeigt eine Ampel (🟢 Reserve · 🟡 knapp · 🔴 Fristbruch droht, mit Rückfrage; über dem doppelten Fristbudget wird gar nicht angenommen). Laufende Aufträge lassen sich **zurückgeben** – 12 % Vertragsstrafe, der Kunde merkt es sich.

**📦 Auftragsgrößen:** 🧺 Kleinauftrag (halbe Arbeit, 58 % Lohn – sicher und schnell) · 📦 Normalauftrag · 🏗️ Großauftrag (doppelte Arbeit, 240 % Lohn – bei GLEICHER Frist: nur für schnelle Tiere oder Teams). ⏱️ Eilaufträge (20 %) zahlen +35 %, haben aber keinen Puffertag.

**Zettel-Katalog (23 Hofloop-Vorlagen + 35 Altvorlagen):** `T0 Die Post muss ins richtige Fach · 1.4 Mtok · 92 €T0 Etiketten für den Hofladen · 1.4 Mtok · 88 €T0 Die Vereinsmail aufräumen · 1.4 Mtok · 96 €T0 Wie kam das Dorffest an? · 1.4 Mtok · 90 €T1 Vom Stichwort zum Produkttext · 7 Mtok · 310 €T1 Support mit Weiterleitung · 7 Mtok · 340 €T1 Eine Woche Dorfgeschichten · 7 Mtok · 370 €T1 Belegte Antworten aus dem Vereinsarchiv · 7 Mtok · 380 €T1 Der Schuhkarton voller Belege · 7 Mtok · 420 €T2 Kleine Reparaturen, echte Tests · 16 Mtok · 760 €T2 Das gescannte Heimatarchiv · 16 Mtok · 820 €T2 Die Ratsunterlagen im Überblick · 16 Mtok · 790 €T1 Datensatz mit Qualitätsprotokoll · 7 Mtok · 330 €T1 Das Amtsblatt in einfacher Sprache · 7 Mtok · 350 €T2 Die widersprüchlichen Quellen · 16 Mtok · 780 €T3 Landkreis-Bürgerhotline · 48 Mtok · 2200 €T3 Versandhaus-Produkttexte · 60 Mtok · 2600 €T4 Klinikverbund-Befundassistent · 90 Mtok · 4200 €T4 Software-Werk: Migration im Akkord · 110 Mtok · 4800 €T5 Nationaler Nachrichten-Assistent · 160 Mtok · 6500 €T1 Mails ablegen mit Werkzeug · 3 Mtok · 260 €T2 Vom Posteingang ins Webformular · 10 Mtok · 560 €T2 Ticket-Runden mit Werkzeugkasten · 16 Mtok · 820 €`
- **T0 · Chat-Auskunft der Stadtbücherei** – Für einfache Chats zählt Instruktionstreue mehr als rohe Denkkraft – ein braves Ferkel schlägt ein zerstreutes Genie.
- **T1 · Übersetzung DE-EN für den Maschinenbauer** – Maschinenübersetzung ist heute Alltagsware – bezahlt wird vor allem Terminologie-Treue, nicht das Übersetzen an sich.
- **T1 · Protokoll-Zusammenfassungen für den Gemeinderat** – Lange Dokumente zusammenfassen braucht vor allem Kontextfenster – was nicht hineinpasst, kann kein Schwein erwähnen.
- **T1 · Verwaltungs-Chatbot fürs Bürgeramt (Pilot)** – Behörden dürfen Bürgerdaten nicht beliebig in Drittland-Clouds schicken – lokale Schweine sind hier ein echtes Verkaufsargument.
- **T2 · Onboarding-Agent fürs HR-Portal** – Erst ein Agenten-Tool (Agent Harness) gibt dem Modell Zugriff auf Werkzeuge; ohne diese Anbindung bleibt es ein Ratgeber.
- **T3 · CI-Fehlerjagd als Agent** – Agenten verbrennen viele Token in Zwischenschritten – bezahlt wird das gelöste Ticket, nicht die schönste Antwort.
- **T3 · Klinik-Arztbriefe zusammenfassen** – Gesundheitsdaten sind nach DSGVO Artikel 9 besonders geschützt – darum laufen Klinik-KIs bevorzugt auf eigener Hardware.
- **T4 · Due-Diligence-Datenraum auswerten** – Riesige Kontextfenster ersetzen keine Sorgfalt: Fakten mitten im Heuhaufen übersehen Modelle messbar öfter (Lost in the Middle).
- **T5 · Kernbank-Umbau von COBOL zu Java** – Im Zahlungsverkehr laufen weltweit noch Milliarden Zeilen COBOL – Modernisierung ist ein Jahrzehntgeschäft, kein Wochenendprojekt.
- **T5 · Zweitmeinungs-System für den Klinikverbund** – Medizinische KI unterstützt, entscheidet aber nicht – Systeme dieser Art gelten im EU AI Act als Hochrisiko-Anwendung.
- **T1 · Schichtplan-Puzzle der Molkerei** – Fuer reine Struktur-Raetsel schlagen winzige Spezialarchitekturen (HRM/TRM) oft riesige Sprachmodelle – bei einem Bruchteil der Stromkosten. Fuer ALLGEMEINE Planungsprobleme ist draussen oft ein klassischer Constraint-Solver die richtige Wahl.

**Kunden (17):** `🥐 Bäckerei Krümel📚 Bücherei Seitenwind🏫 Dorfschule Ahornweg🩺 Tierarztpraxis Dr. Huf🔧 Fahrrad-Werkstatt Speiche🏛️ Gemeindeamt Modelldorf🧺 Hofladen-Online📻 Dorfradio Antenne🖋️ Kanzlei Eichenblatt🚜 Maschinen-Genossenschaft⚡ Start-up Funke🏆 Sportverein Blitz🏛️ Landkreis Oberwiesen📦 Versandhaus Nordlicht🏥 Klinikverbund Sankt Anna💻 Softwarehaus Turmbau📰 Medienhaus Weitblick`

**⏩ Hofuhr & Warten (Ära 9).** Die Hofuhr läuft von 06:00 bis 22:00 – 16 Uhrstunden, davon 14 Arbeitsstunden (Rüst- und Pausenzeit inklusive); ein Hoftag dauert höchstens 30 Minuten Echtzeit. Ein Zettel bindet ein Modell nur seine Arbeitsstunden: Über „⏩ Warten“ (Hofleiste) spulst du eine Stunde, vier Stunden, bis zur nächsten Sofort-Abnahme oder bis Feierabend vor. Fertige Aufträge werden sofort abgenommen und bezahlt, das Modell ist wieder frei und kann am selben Tag den nächsten Zettel übernehmen – so schafft ein schnelles Modell mehrere Zettel pro Tag. „Tag beenden“ vor 22:00 lässt laufende Aufträge weiterarbeiten, freie Modelle stehen bis morgen still; die Nachtplanung zeigt vorher, wie viele Modell-Stunden und Euro dadurch liegen bleiben. Die Dorfplatz-Spiele gibt es einmal je Hoftag – auch das lohnt einen ganzen Tag.

**🧑‍🔧 Berufe-Katalog (Ära 9).** 56 Berufe aus 20 Sektoren mit 175 Aufgaben, die durch Digitalisierung und den Einsatz von Agenten entstehen. Jeden Morgen kommt ein Katalog-Zettel dazu (alle drei Tage ab Stufe 2 ein Team-Zettel), eine Nadel im Stall sortiert einen zweiten passend zu den Stärken deiner Modelle vor. Zettel **aus diesem Katalog** mit erhöhtem Datenschutz-Risiko erscheinen ab Hofstufe 2, mit hohem ab Hofstufe 3 – oder sobald ein Modell geschult ist beziehungsweise ein Agenten-Tool mit Schutzfunktionen verwendet. Die Stammkundschaft des Dorfes (Kita, Praxis, Apotheke …) schickt dagegen von Tag 1 an Zettel mit erhöhtem Risiko: Wer mit ihren Daten arbeitet, braucht eine Schulung oder ein Agenten-Tool mit Schutzfunktionen – im ersten Fall bleibt es bei einer Verwarnung. Zahlen je Tier: T0 1.4 Mtok/92 €/1 Tag · T1 7 Mtok/350 €/2 Tage · T2 16 Mtok/790 €/3 Tage · T3 26 Mtok/1300 €/3 Tage · T4 40 Mtok/2100 €/4 Tage · T5 60 Mtok/3200 €/5 Tage; Agenten-Aufgaben ×0.5 Arbeit und ×0.85 Lohn. **Zettel-Basisskalierung für Team-Aufgaben:** je weiterem möglichen Agenten +60 % Arbeit, +50 % Lohn und +35 % Frist. Datenschutz-Aufschlag ×1.15 (erhöht) / ×1.35 (hoch) plus Fachwissens-Aufschlag (siehe Fachbildung). Anforderungen: Hauptwert 26 + 12 je Tier; sensible Sektoren verlangen zusätzlich Fachwissen im Gebiet.

**👥 Agenten-Teams – Einsatzberechnung.** Komplexe Zettel (Chip „Team bis N“) dürfen von mehreren verschiedenen Agenten mit Agenten-Tool gleichzeitig bearbeitet werden. Nach der Basisskalierung teilt sich die Arbeit durch die tatsächlich gewählte Teamgröße; die zusätzliche Abstimmung kostet je weiterem eingesetzten Agenten +10 % Arbeit (mit demselben Tool: +5 %, „eingespieltes Team“, +2 Qualität statt −3). Beispiel gleich schneller Agenten: 1 Agent 4 Tage; gemischt → 2 Agenten 2,2 Tage / 3 Agenten 1,6 Tage; mit demselben Tool → 2 Agenten 2,1 Tage / 3 Agenten 1,5 Tage. Die Pinnwand zeigt die Schätzung je Teamgröße mit den schnellsten freien Agenten.
Handwerk (7)` Gastronomie (4)` Handel (5)` Landwirtschaft (4)` Medizin (4)` Pflege (1)` Recht (2)` Steuern & Finanzen (1)` Personal (1)` Versicherung & Bank (2)` Bildung (3)` Verwaltung (1)` Soziales (1)` Sicherheit (1)` IT & Software (4)` PR & Medien (4)` Industrie & Logistik (3)` Energie (2)` Kultur (3)` Tourismus (3)`
**🎓 Fachbildung (Ära 9).** Jedes Modell trägt je Fachgebiet (🛡️ Datenschutz & DSGVO, 🩺 Medizin, ⚖️ Recht, 🧾 Steuern & Buchhaltung, 👥 Personal, 🏦 Versicherung & Bank) ein Fachwissen von 0 bis 100. Kurse in der Agentenwerkstatt sind Trainingsläufe: Grundkurs 1 Tag, 150 €, 3 GB Kuratiertes, +25 (ab 0) · Aufbaukurs 2 Tage, 320 €, 6 GB Kuratiertes, +22 (ab 20) · Fachzertifikat 3 Tage, 560 €, 10 GB Kuratiertes, +20 (ab 40). Preis ×(1 + 0.05 je Milliarde Parameter, danach auf volle 10 € gerundet), ab 20 B je 20 B ein Tag länger; das Modell steht während des Kurses nicht zur Verfügung und braucht eine GPU-Bucht. Technik nach Forschung wählbar: Kurs (Anweisung + Prüffragen) (Zeit ×1, Preis ×1, Gewinn ×1); SFT auf Fachdaten (Zeit ×1.3, Preis ×1.1, Gewinn ×1.15); LoRA-Adapter (Zeit ×0.7, Preis ×0.85, Gewinn ×0.9); QLoRA (4-Bit) (Zeit ×0.7, Preis ×0.6, Gewinn ×0.85); DPO (Haltung & Grenzen) (Zeit ×1, Preis ×1.2, Gewinn ×1.2, nur Datenschutz & DSGVO). Praxis: jeder saubere Zettel im Gebiet +3 bis 85.

**Zettel verlangen Fachwissen:** sensible Sektoren fordern Mindestwerte – hoch 30 + 8 je Tier, erhöht 18 + 6 je Tier, plus 1 je 6 Hoftage (max +20): die Fälle werden schwerer. Fachwissen über dem Minimum bringt bis +8 Qualität; die Zettel zahlen dafür ×(1 + 0.008 je Punkt Mindest-Fachwissen) zusätzlich zum Datenschutz-Aufschlag. **Verstoßrisiko** sinkt linear mit dem Datenschutz-Fachwissen (0 ab 90), Fachwissen im Gebiet zählt zu 60 %, ein Agenten-Tool mit Schutzfunktionen halbiert den Rest. Leih-Tiere gelten als 50 in jedem Gebiet, lassen sich aber nicht schulen.

**🛡️ Datenschutz & Aufsicht (Ära 9).** Zettel aus Medizin, Recht, Steuern, Personal und Pflege tragen personenbezogene Daten (Risiko „hoch“), Finanzen, Bildung, Verwaltung und Soziales (Risiko „erhöht“). Jedes eingeteilte Modell ohne Schutz erzeugt Verstoßrisiko: 15 % (erhöht) bzw. 30 % (hoch) je Abnahme; ein Leih-Tier in der Cloud verdoppelt es, die Forschung „Schutzregeln“ halbiert es, das Kontrollpaket senkt es auf 70 %. **Woher das Risiko kommt:** aus dem Fachgebiet des Zettels (Medizin, Recht), aus dem Sektor des Berufs, aus der Aufgabe selbst (manche Arbeiten fassen auch außerhalb der Risiko-Sektoren personenbezogene Daten an, etwa Zählerstände mit Namen), aus einem Kunden mit Vor-Ort-Pflicht (dann auch bei harmlos wirkenden Büro-Zetteln) oder aus dem DSGVO-Kennzeichen. Der Chip nennt immer die Quelle. Der Chip an der Pinnwand nennt die Quelle. **Erste Beanstandung:** Solange der Hof unter Stufe 3 ist und noch kein Modell einen Datenschutz-Kurs besucht hat, ist der erste Verstoß eine Verwarnung – Strafe und Ruf kosten trotzdem, der Abmahnungszähler bleibt stehen. Danach zählt jede Beanstandung. **Risikominderung:** Datenschutz-Fachwissen aus Kursen senkt das Restrisiko genau um seinen Wert (Fachwissen 25 lässt 75 % stehen, Fachwissen 60 lässt 40 % stehen) und ab 90 fällt es auf null. Ein **Agenten-Tool mit Schutzfunktionen** – Rechtebegrenzung, Sandbox und Prüfprotokoll – halbiert nur das verbleibende Risiko (🟠 Claude Code, 🦀 Codex CLI, 🪿 goose, 🙌 OpenHands); es ersetzt weder Fachwissen noch Kurse. Verstoß: Strafe 12 % + 60 € (erhöht) bzw. 25 % + 150 € (hoch) des Lohns, Ruf -4/-8, Groll des Kunden und eine **Abmahnung**. Nach 2 Abmahnungen (Behütet: 3) schließt die Aufsicht den Hof – dann hilft nur ein Neuanfang. Der Zettelvergleich zeigt das Risiko vor der Zusage; die Zusage fragt bei Risiko noch einmal nach.

**🏅 Das Ende: Hofmeisterbrief und Legende (Ära 9).** Der Hof hat einen Abschluss, und zu ihm führen mehrere Wege. Fünf Lebenswerke stehen nebeneinander: 🧬 **Zuchtlinie** – Eine eigene Linie über drei Generationen: fünf Würfe im Stammbuch und ein Tier der Generation 3. · 🏭 **Rechenpark** – Ausbau zum Rechenzentrum, dazu 10 kWp Solar und 20 kWh Speicher – der Hof trägt seine Last selbst. · 📚 **Forschungsbaum** – Alle Forschungen der Forschungshütte abgeschlossen. · 🤝 **Handelshaus** – 100 abgeschlossene Aufträge und ein Ruf von mindestens 4,5 Sternen. · 🎓 **Fachhaus** – Drei Fachgebiete auf Zertifikatsniveau (Fachwissen ≥ 85) – und keine Abmahnung auf dem Hof.. Für den **Hofmeisterbrief** braucht es Hofstufe 10 und zwei dieser Lebenswerke (5.000 €, +600 XP). Für die **Legende** Hofstufe 12 und alle fünf (15.000 €, +1500 XP). Die Wege sind verschieden lang – die Zuchtlinie ist in zwei bis drei Wochen zu schaffen, Handelshaus und Forschungsbaum brauchen zwei bis drei Monate, der Rechenpark verlangt das Rechenzentrum mit Dach und Freilandfeldern: Der Brief ist auf hundert Hoftage und mehr angelegt. Keiner der Wege endet das Spiel: Der Brief hängt im Hofhaus, gespielt wird weiter. Ein geschlossener Hof (zwei Abmahnungen) bekommt keinen Brief – Datenschutz ist Teil der Meisterschaft.

**🔌 MCP-Werkstatt (Ära 9).** Das Model Context Protocol ist der offene Standard für Werkzeuge, Datenquellen und Vorlagen zwischen Agenten-Apps (Host/Client) und Diensten (Server), Nachrichten als JSON-RPC 2.0 über stdio oder Streamable HTTP. Die Werkstatt öffnet ab Hofstufe 3 mit erforschter Agentenwerkstatt; anschließen darf nur, wer ein Agenten-Tool mit MCP im Stall hat (Basis-Tool, pi und aider kennen kein MCP). Jeder Knoten kostet seinen Preis und einen bis zwei Tage Anschlussarbeit auf dem eigenen Anschlussbrett. **Wirkungen:** Werkzeuge +6 Agentenleistung · Datenquellen −2 Prozentpunkte Tool-Overhead · Vorlagen und Sampling je −2 % Team-Abstimmung · Elicitation ×0.85 und Prüfprotokoll ×0.7 Datenschutz-Risiko auf Agenten-Zetteln (zusätzlich zum Kontrollpaket) · Verzeichnisgrenzen ×0.75 und Sandkasten ×0.5 Schaden durch Prompt-Injection · Fernleitung ohne OAuth ×1.5 Datenschutz-Risiko. **Anschlüsse:** Agenten-Zettel brauchen je Sektor einen Anschluss (Datei, Post & Kalender, Buchhaltung, Web); passend +8 % Lohn, fehlend −12 Qualität, ab Tier 3 gesperrt. **Vergiftete Werkzeugbeschreibung:** Mit mindestens einem Anschluss besteht täglich eine Chance von 8 % auf den Vorfall (60 €, Ruf -4). Freigabeliste ×0.25, geprüfte Quellen ×0.1, Sandkasten halbiert den Schaden. Alle Wirkungen sind Spielannahmen; die Fakten je Knoten tragen ihren Stand (Spezifikation 2025).

**🌳 Stammbaum (Ära 9).** Jedes Zuchttier trägt seine Eltern (Namen bleiben auch nach Verkauf), seinen Wurf und seine Generation. Der Stammbaum zeigt drei Ebenen Vorfahren in der Krone, die Wurfgeschwister am Stamm und drei Ebenen Nachkommen in den Wurzeln. Wer Geschwister kreuzt, sieht die Inzucht dort, bevor sie im Wurf Interferenz kostet.

**🪡 Hofsprecher:**

**Sag dem Hof, was er tun soll.** Der Hofsprecher (Ada-Menü, Kopf oben rechts) nimmt Sätze wie „kauf zwei Solarmodule“, „nimm j12 mit t3 und t4 an“ oder „wie wird das Wetter?“ entgegen – getippt oder gesprochen (Browser-Spracherkennung). Er arbeitet in drei Stufen:
Wörterbuch (Deutsch, exakt, offline)Nadel – Needle 2 im Browser (Englisch am besten)Ada-Cloud (eigener Schlüssel, freie Fragen)
**Wahrheitsregel:** Kein Modell erzeugt Zahlen. Jeder Satz wird zu einem Werkzeug mit Parametern; die Vorschau rechnet mit denselben Spielfunktionen wie die Knöpfe (Preis, Frist, Erfolgschance). Nichts verändert den Hof, bevor du „Machen“ drückst; Verkauf und Auftragsrückgabe fragen doppelt. Nur-Anzeige-Werkzeuge (Status, Wetter, Kassenbuch, Zettel) laufen sofort.

**Nadel = Needle 2** (Cactus Compute, Apache-2.0): 45 Mio. Parameter in 13,7 MB, ≈ 28 MB Arbeitsspeicher, Kontext 256 Token, Ausgabe ausschließlich JSON-Werkzeugaufrufe (per Grammatik erzwungen), trainiert auf Englisch (Deutsch teilweise). Sie wird erst auf Wunsch geladen (einmalig 14.1 MB, danach aus dem Browser-Cache, auch offline) und rechnet in einem Web Worker vollständig auf deinem Gerät – es wird nichts hochgeladen. Gemessen am 02.09.2026: Englisch 24 von 25 Hof-Befehlen richtig, Deutsch 14 von 22; Antwort in 3–4 s bei 45–110 Token/s. Darum steht die Nadel hinter dem deutschen Wörterbuch und vor jeder Ausführung eine Vorschau. Was die Nadel nicht kann: Texte schreiben, plaudern, Wissen erklären, Zettel erfinden – dafür gibt es das Hofbuch, die Zettelschmiede und Ada mit eigenem Schlüssel.

**Werkzeuge:** ❓ Hilfe` 🏡 Hofstatus` 💶 Kassenbuch` 🌦️ Wetterbericht` 📌 Zettel zeigen` 🔍 Auftrag ansehen` ✅ Zettel annehmen` ↩️ Auftrag zurückgeben ⚠️` 🌃 Nacht starten` ☀️ Zurück zum Tag` 🌙 Tag beenden` 🌙 Nacht planen` 🔁 Nacht wie gestern` ⚡ Energiemodus` ☀️ Solarmodul kaufen` 🔋 Akku erweitern` 🌬️ Windrad bauen` 🏭 Kraftwerk aufstellen` 🤝 Nachbarvertrag` 🖥️ Rechner kaufen` 🏗️ Rechenhaus ausbauen` 🐷 Modell kaufen` 💸 Tier verkaufen ⚠️` 🔬 Forschen` 🏋️ Training starten` 🌾 Futter kaufen` 🚪 In die Bucht` 🚶 Aus der Bucht` 🧮 Quantisierung` 💭 Denkmodus` 🩺 Kur` 🔬 Prüfen` 🧰 Agenten-Tool zuweisen` 🔌 MCP-Knoten anschließen` 🧬 Zucht (Merge)` 🗺️ Ort öffnen` ⚖️ Ereignis entscheiden` 🎓 Fachkurs buchen` ⏩ Warten` 📖 Hofbuch`

**Ada ohne Schlüssel:** Fragen im Ada-Menü beantwortet Ada lokal – Live-Werkzeuge für Status, Wetter, Kasse und Zettel, sonst die passendste Hofbuch-Stelle per Volltextsuche (Wortstämme, Titel doppelt gewichtet). Sie erfindet nichts; mit eigenem OpenRouter-Schlüssel formuliert sie zusätzlich frei.

**Treiber:** sag <Satz> zeigt Werkzeug und Vorschau, sag! <Satz> führt aus (nur Wörterbuch-Stufe, ohne WebAssembly).

## 🖥️ Hardware & Energie

**🪡 Nadelklasse (Ära 9).** Needle 2 (Nadel): 45 Mio. Parameter, 14 MB Datei, ≈ 28 MB Arbeitsspeicher, Kontextfenster 256 Token, Ausgabe nur JSON (Werkzeugaufrufe, Datenfelder), Lizenz Apache-2.0. Werte im Spiel: Werkzeug 58, Treue 48, Logik 24, Stil 3, Wissen 4 – sie schafft Mikro-Zettel mit Sortieren und Feldern ziehen, aber nichts, was Schreiben, Wissen oder langen Kontext braucht. Tempo: 500 tok/s auf dem Raspberry Pi 5 (Hersteller), 120 tok/s auf dem ESP32-P4 und 1 200 tok/s auf jeder Grafikkarte (beides Spielannahmen); Tageskapazität mit Rüstfaktor 0,6 (Spielannahme). Kaufpreis 15 €, Gerät „Raspberry Pi 5“ als Rechner für 120 € (nur Nadelklasse). Keine Zucht: die Familie hat keine kreuzbaren Gewichte. Was sie nicht kann, steht im Kompendium (Wissenskarten „Needle 2“, „Werkzeugaufrufe“, „Warum 45 Millionen Parameter nicht plaudern können“, „Kleinstgeräte“). Dieselbe Nadel steuert als Hofsprecher den Hof im Browser.

**GPUs (19):**
- **RTX 4080 16GB `16 GB`** – 1.100 € · 320 W · Bandbreite 716.8 GB/s
- **Raspberry Pi 5 (8 GB) `0 GB`** – 90 € · 8 W · Bandbreite 17 GB/s
- **ESP32-P4 Board (32 MB PSRAM) `0 GB`** – 15 € · 1 W · Bandbreite 1 GB/s
- **RTX 3090 24GB (gebraucht) `24 GB`** – 700 € · 350 W · Bandbreite 936 GB/s
- **Ryzen AI Max+ 395 Mini-PC (128 GB Unified) `96 GB`** – 1.800 € · 120 W · Bandbreite 256 GB/s
- **DGX Spark (128 GB Unified) `100 GB`** – 4.000 € · 240 W · Bandbreite 273 GB/s
- **Mac Studio M4 Max (128 GB Unified) `96 GB`** – 4.500 € · 200 W · Bandbreite 546 GB/s
- **RTX 3060 12GB (gebraucht) `12 GB`** – 260 € · 170 W · Bandbreite 360 GB/s
- **RTX 4060 Ti 16GB `16 GB`** – 500 € · 165 W · Bandbreite 288 GB/s
- **RTX 4090 24GB (gebraucht) `24 GB`** – 2.270 € · 450 W · Bandbreite 1008 GB/s
- **RTX 5090 32GB `32 GB`** – 4.700 € · 575 W · Bandbreite 1792 GB/s
- **A100 80GB (gebraucht) `80 GB`** – 6.000 € · 300 W · Bandbreite 2039 GB/s
- **RTX 6000 Pro Blackwell 96GB `96 GB`** – 16.000 € · 600 W · Bandbreite 1792 GB/s
- **H100 80GB `80 GB`** – 31.000 € · 700 W · Bandbreite 3350 GB/s
- **H200 141GB `141 GB`** – 36.000 € · 700 W · Bandbreite 4800 GB/s
- **B200 192GB `192 GB`** – 45.000 € · 1000 W · Bandbreite 8000 GB/s
- **Mini-Rack (4x H100) `320 GB`** – 126.000 € · 3000 W · Bandbreite 10050 GB/s
- **Rack (8x H100) `640 GB`** – 250.000 € · 5900 W · Bandbreite 20100 GB/s
- **Blackwell-Rack (8x B200) `1536 GB`** – 400.000 € · 8400 W · Bandbreite 48000 GB/s

**Rechenhaus-Ausbau:** `Geräteschuppen · 12 PC / 0 RacksNerdtempel · 6 PC / 8 RacksRechenzentrum · 0 PC / 64 Racks`

⚡ Strom: Tag 0.48 €/kWh, Nacht die Hälfte (offene Spielannahme). Solar liefert nachts nichts; Wind schwankt mit dem Wetter; Kraftwerke sind stabil, aber brennstoff- und wartungsteuer.

## 🌾 Futter – Datensorten (12)
- **Web-Allerlei `2 €/GB`** – Roh zusammengekratztes Netz-Futter: viel Masse, wenig Klasse, ordentlich Unkraut dazwischen. · Qualität 45%
- **Kuratierte Auslese `8 €/GB`** – Gewaschen, entdoppelt, handverlesen – dasselbe Feld, aber nur die guten Rueben. · Qualität 85%
- **Beispiel-Dialoge (SFT-Instruktionen) `12 €/GB`** – Saubere Frage-Antwort-Paare: so sieht brav gedecktes Benehmen am Tisch aus. · Qualität 90%
- **Fachfutter Code `10 €/GB`** – Quelltexte, Tickets, Pull-Requests – Kraftfutter fuer die Programmier-Muskeln. · Qualität 85%
- **Fachfutter Mathe `10 €/GB`** – Aufgaben, Beweise, Schritt-fuer-Schritt-Loesungen – haerten die Denkblase. · Qualität 85%
- **Fachfutter Medizin `22 €/GB`** – Leitlinien, Studien, Arztbriefe – teuer, streng kontrolliert, hochwirksam. · Qualität 90%
- **Fachfutter Recht `20 €/GB`** – Urteile, Vertraege, Kommentare – trockenes Heu, aber Anwaelte zahlen Gold dafuer. · Qualität 90%
- **Praeferenz-Paare `16 €/GB`** – Immer zwei Antworten auf dieselbe Frage: die bessere ist markiert. Futter fuer DPO, KTO und Richter-Modelle. · Qualität 85%
- **Pruefbare Aufgaben (mit Tests) `24 €/GB`** – Aufgaben, deren Loesung eine Maschine nachpruefen kann: Unit-Tests, Mathe-Endergebnisse. Das Edelfutter fuer Gruppen-Belohnung. · Qualität 95%
- **Synthetik-Futter (selbst gebraut) `selbst erzeugt`** – Ein Lehrer-Schwein schreibt das Futter selbst. Qualitaet erbt es vom Lehrer – und jede Generation ungefilterter Selbstfuetterung zaehlt den Inzucht-Zaehler hoch. Das ist ein Risiko, kein Automatismus: mit Kuratierung, Filtern und frischen Echt-Daten bleibt Synthetik wertvoll. · Qualität 0%
- **Alt-Mix (Replay) `5 €/GB`** – Eingemachtes vom alten Speiseplan. Unspektakulaer, aber es haelt das Allgemeinwissen im Leib. · Qualität 70%
- **Benchmark-Fragen (Schwarzmarkt) `1 €/GB`** – Ein Sack mit den Original-Pruefungsfragen, gefallen vom Laster. Kurzfristig glaenzen die Pruefungsergebnisse – die echte Leistung nicht. Und frueher oder spaeter deckt ein unabhaengiger Test mit frischen Aufgaben den Schwindel auf: dann steht der Ruf des Hofs auf dem Spiel. · Qualität 99%

## 🐷 Modell-Katalog (66 offene Modelle)

**Tier 0** (14)

| Modell | Param. | Kontext | Preis  |
| | Needle 2 (Nadel) | 45 Mio. | 0.256k | 15 €  |
| | Qwen3.5 4B | 4 Mrd. | 256k | 300 €  |
| | Gemma 4 E2B | 5.1 Mrd. | 128k | 180 €  |
| | Gemma 4 E4B | 8 Mrd. | 128k | 240 €  |
| | Gemma 4 E4B IT | 8 Mrd. | 128k | 260 €  |
| | Phi-4-mini | 4 Mrd. | 128k | 130 €  |
| | SmolLM3 3B | 3 Mrd. | 128k | 100 €  |
| | LFM2.5 1.2B | 1.2 Mrd. | 32k | 150 €  |
| | Granite 4.2 3B | 3 Mrd. | 131k | 350 €  |
| | Falcon-H1-Tiny-R 0.6B | 600 Mio. | 32k | 110 €  |
| | Jamba Reasoning 3B | 3 Mrd. | 250k | 170 €  |
| | EXAONE 4.0 1.2B | 1.2 Mrd. | 64k | 85 €  |
| | HRM 27M (Sapient) | 27 Mio. | 2k | 60 €  |
| | TRM 7M (Samsung) | 7 Mio. | 2k | 45 €  |

**Tier 1** (14)

| Modell | Param. | Kontext | Preis  |
| | Qwen3.5 9B | 9 Mrd. | 256k | 880 €  |
| | Qwen3.5-Coder 9B | 9 Mrd. | 256k | 940 €  |
| | Granite 4.2 8B | 8 Mrd. | 131k | 950 €  |
| | Granite 4.2 8B Guardian | 8 Mrd. | 131k | 780 €  |
| | InternLM3 8B | 8 Mrd. | 32k | 550 €  |
| | Phi-4-reasoning-vision 15B | 15 Mrd. | 128k | 800 €  |
| | Apriel-1.5 15B Thinker | 15 Mrd. | 128k | 640 €  |
| | Falcon H1R 7B | 7 Mrd. | 256k | 580 €  |
| | Mistral 7B (Oldtimer) | 7 Mrd. | 32k | 400 €  |
| | Mistral 7B Instruct (Oldtimer) | 7 Mrd. | 32k | 430 €  |
| | Llama 3.1 8B (Oldtimer) | 8 Mrd. | 128k | 420 €  |
| | Llama 3.1 8B Code (Oldtimer) | 8 Mrd. | 128k | 450 €  |
| | Ornith-1.5 9B | 9 Mrd. | 128k | 850 €  |
| | R1-Distill-Qwen 14B (Oldtimer) | 14 Mrd. | 32k | 480 €  |

**Tier 2** (16)

| Modell | Param. | Kontext | Preis  |
| | Qwen3.8 27B | 28 Mrd. | 262k | 2.600 €  |
| | Qwen3.6 27B | 27 Mrd. | 262k | 1.950 €  |
| | Qwen3.5 27B | 27 Mrd. | 262k | 1.650 €  |
| | Qwen3.5 35B-A3B | 35 Mrd. (MoE) | 262k | 1.500 €  |
| | Muse Glimmer 30B | 30 Mrd. | 131k | 2.400 €  |
| | Gemma 4 31B | 31 Mrd. | 256k | 1.850 €  |
| | Granite 4.2 30B | 29 Mrd. | 131k | 2.250 €  |
| | Nemotron 3.5 Lightning | 30 Mrd. (MoE) | 1M | 2.100 €  |
| | Ornith-1.5 35B-A3B | 36 Mrd. (MoE) | 128k | 2.150 €  |
| | OLMo 3 32B Think | 32 Mrd. | 66k | 1.250 €  |
| | Devstral Small 2 24B | 24 Mrd. | 256k | 1.450 €  |
| | Seed-OSS 36B | 36 Mrd. | 512k | 1.150 €  |
| | gpt-oss-20b | 21 Mrd. (MoE) | 131k | 1.100 €  |
| | KAT-Coder-V2.5-Dev | 35 Mrd. (MoE) | 262k | 1.750 €  |
| | Qwen2.5-Coder 32B (Oldtimer) | 32 Mrd. | 128k | 1.000 €  |
| | ERNIE 4.5 21B-A3B | 21 Mrd. (MoE) | 131k | 1.000 €  |

**Tier 3** (8)

| Modell | Param. | Kontext | Preis  |
| | gpt-oss-120b | 117 Mrd. (MoE) | 131k | 2.800 €  |
| | Mistral Medium 3.5 | 128 Mrd. | 256k | 6.200 €  |
| | Qwen3.5 122B-A10B | 122 Mrd. (MoE) | 262k | 4.900 €  |
| | Qwen3-Coder-Next 80B | 80 Mrd. (MoE) | 256k | 3.600 €  |
| | Ling-3.0-flash | 124 Mrd. (MoE) | 1M | 5.400 €  |
| | Nemotron 3 Super | 120 Mrd. (MoE) | 1M | 4.600 €  |
| | Devstral 2 123B | 123 Mrd. | 256k | 3.900 €  |
| | Jamba2 Mini 52B | 52 Mrd. (MoE) | 256k | 3.000 €  |

**Tier 4** (8)

| Modell | Param. | Kontext | Preis  |
| | GLM-5.3-Flash | 320 Mrd. (MoE) | 1M | 15.000 €  |
| | MiniMax M3 | 428 Mrd. (MoE) | 1M | 11.000 €  |
| | Qwen3.5 397B-A17B | 397 Mrd. (MoE) | 256k | 8.800 €  |
| | DeepSeek V4-Flash (0731) | 304 Mrd. (MoE) | 1M | 12.500 €  |
| | Step 3.7 Flash | 198 Mrd. (MoE) | 262k | 7.600 €  |
| | Command A+ | 218 Mrd. (MoE) | 128k | 7.000 €  |
| | Solar Open 2 250B | 250 Mrd. (MoE) | 1M | 8.200 €  |
| | MiMo V2.5 | 311 Mrd. (MoE) | 1M | 9.500 €  |

**Tier 5** (6)

| Modell | Param. | Kontext | Preis  |
| | GLM-5.3 | 753 Mrd. (MoE) | 1M | 24.000 €  |
| | Hy4-preview | 770 Mrd. (MoE) | 1M | 26.000 €  |
| | DeepSeek V4-Pro (0813) | 1700 Mrd. (MoE) | 1M | 28.000 €  |
| | Kimi K2.5 | 1000 Mrd. (MoE) | 256k | 16.000 €  |
| | Kimi K3 | 2800 Mrd. (MoE) | 1M | 34.000 €  |
| | Qwen3.8 2.4T-A95B | 2400 Mrd. (MoE) | 1M | 30.000 €  |

**API-Leihmodelle (11):** `☁️ Claude Opus 5☁️ Claude Sonnet 5☁️ Claude Haiku 4.5☁️ GPT-5.6 Sol☁️ GPT-5.6 Terra☁️ GPT-5.6 Luna☁️ Gemini 3.1 Pro☁️ Gemini 3.7 Flash☁️ Grok 4.6☁️ Kimi K3 (API)☁️ GLM-5.3 (API)`

## 🎖️ Auszeichnungen

**Kopfbedeckungen:** ` ab Tier-Level 7Strohhut ab Tier-Level 3Zylinder ab Tier-Level 5Krone ab Tier-Level 7`

**Wochen-Hofprojekte:** `🗓️ Die Woche der kleinen Helfer🗓️ Verlässlicher Nachbar🗓️ Wenn die anderen schlafen🗓️ Sonne und Wind ernten🗓️ Zusammen wird es besser🗓️ Ein gepflegtes Archiv`

**Abzeichen:** Kleine Helfer · Vielseitiger Hof · Qualitätshof · Wissenshof · Nachtmeister (Fortschritt an der Pinnwand) · 🎓 Geselle (Geführte Woche, Abschluss von Kapitel 7).

**🏅 Dorfmeisterschaft:** Am 25. Tag jeder Saison (ab Hofstufe 3) hängt die Team-Großausschreibung aus – mind. 2 Rollen, Wertung = Qualität × Effizienz-Index gegen drei Nachbarhöfe, Prämie als Förderung. Bestenliste: noch keine Teilnahme.

## 🎪 Dorfplatz – tägliche Minispiele

Jeden Hoftag stehen fünf kurze Spiele mit echtem LLM-Lehrinhalt und Bonus bereit: **Tokenizer-Wette** (Token ≠ Wort; Gewinn: −10 % API-Token heute), **Injection-Abwehr** (Daten sind nie Befehle; Gewinn: halbes Injection-Risiko heute), **Sampler-Duell** (Temperatur; Gewinn: heute ohne Sampler-Risiko), **VRAM-Packprobe** (Gewichte + Kontext-Cache + Reserve; Gewinn: Gratis-Umquantisierung), **Preisrechner** (API vs. Eigenbetrieb; Gewinn: +8 % Lohn auf den nächsten Auftrag). Für die Tages-Serie genügt **mindestens ein beliebiges Dorfplatz-Spiel pro Hoftag**; 3, 7 und 14 aufeinanderfolgende Tage bringen wachsende Boni. Dazu kommen die **Datenlese** in der Futterscheune (eigene Serie 3/7 Tage → +1/+2 GB), ein **Stammbuch** aller Modellfamilien und Abzeichen mit Titeln.

## 🗞️ Hof-Chronik – deine Meilensteine

Noch leer – große Momente (erste Zucht, Pokale, Stufen, Meisterschaften) landen automatisch hier.

## 📜 Glossar – die kanonischen Begriffe

**Merkmale:** Eigenschaften eines Tiers (z. B. Fleißig, Robust, Shiny) mit fester Wirkung und Vererbungsquote – Katalog im Kapitel Zucht.

**Modellstufe:** Erfahrungsstufe eines TIERS (Tier-XP aus Aufträgen/Training): Routine bringt +2 % Durchsatz je Stufe (max. +12 %) und ab Stufe 3/5/7 Strohhut/Zylinder/Krone. Nicht zu verwechseln mit der Hofstufe (Hof-XP, schaltet Gebäude frei).

**Hof-Fokus:** Auftragsart des Hofs aus der Einführung, +8 % Erlös auf diese Art.

**Spezialist:** EIN Tier mit +8 % auf seine Auftragsart (Marktlos) – stapelt mit dem Hof-Fokus.

**Meisterweg:** Einmalige Wahl eines Fertigkeitswegs ab Stufe 3; nur dort gibt es die 2⭐-Meister-Fertigkeit.

**Forschungsbaum:** Der Forschungsbaum.

**Meisterschaften:** Die drei Fertigkeitsbäume.

**Agenten-Tool:** Arbeitsumgebung eines Modells, technisch auch Agent Harness (z. B. Claude Code oder Aider).

**Hilfsmittel:** Zuschaltbare Arbeitstechnik (z. B. Antwortkontrolle oder Mehrfachauswahl).

**Rätsel-Architektur:** HRM/TRM-Spezialtiere für reine Struktur-Rätsel.

**Übergabelast:** Token-Aufschlag bei Team-Übergaben (12 %, gleiche Familie 8 %).

**Hof-Ereignis:** Globales Tagesereignis.

**Saison:** 30-Hoftage-Abschnitt mit eigener Nachfrage.
