// ============================================================
// MODELLHOF v4 – Baustein: Trainingsplatz, Zuchtbucht, Diaeten,
// Staelle (GPUs), Futter, Hilfsmittel, Wissenskarten (Training)
// Reines JS (ES2020), nur const-Deklarationen. Stand: August 2026.
// Zahlen aus Recherche (Unsloth-Doku, Nature 2024, DeepSeek-Papers,
// RunPod/Vast/Lambda-Preise, BDEW, Marktpreise Memory-Krise 2026).
// ============================================================

const TECHNIKEN = {
  lora: {
    n: "Anstecker-Training (LoRA)", z: "🧩", lvl: 2, art: "sft",
    kurz: "Kein eigenes Trainingsziel, sondern SFT mit wenigen trainierbaren Zusatzmatrizen: die kleinen Anstecker lernen das Neue, das Grundmodell bleibt eingefroren. Schnell, guenstig und jederzeit wieder abnehmbar.",
    futter: ["beispiele", "fach_code", "fach_mathe", "fach_medizin", "fach_recht", "synth"],
    gbFaktor: 0.6,
    gpuStdProB: 0.2,
    vramTrainFaktor: 2.4,
    risiko: { vergessen: 0.05, hack: 0, kollaps: 0 },
    profil: { fokus: 9, treue: 2 },
    /* Ära 7.5 (T-25): 19 GB widersprach der Formel (vramTrainFaktor 2,4 -> 17 GB). */
    lehre: "LoRA-Adapter sind oft unter 1% der Parametermenge gross und lassen sich wie Anstecker tauschen – ein 7B-Schwein braucht in 16-Bit-LoRA aber immer noch rund 17 GB Trainings-VRAM (Faustregel: knapp 2,5 GB je Milliarde Parameter). Merke die zwei Achsen: SFT/DPO/KTO/CPT sagen, WAS trainiert wird (Ziel und Datenform); LoRA/QLoRA sagen nur, WIE SPARSAM die Parameter dabei angefasst werden – das sind keine neun gleichartigen Trainingsknoepfe."
  },
  sft: {
    n: "Volles Feintuning (Full SFT)", z: "🏋️", lvl: 2, art: "sft",   /* Ära 7.5: mit der Forschung nutzbar, nicht eine Stufe später */
    kurz: "SFT ist das Trainingsziel: aus sauberen Beispiel-Dialogen lernen. 'Voll' ist die Parameter-Seite: ALLE Gewichte werden nachtrainiert. Hoechste Qualitaet, aber gefraessig: Optimierer und Gradienten brauchen ein Vielfaches des Modellgewichts an Speicher.",
    futter: ["beispiele", "kuratiert", "fach_code", "fach_mathe", "fach_medizin", "fach_recht", "synth", "bench_leak"],
    gbFaktor: 1.0,
    gpuStdProB: 2.0,
    vramTrainFaktor: 17,
    risiko: { vergessen: 0.12, hack: 0, kollaps: 0 },
    profil: { fokus: 12, treue: 3, schreiben: 2 },
    lehre: "Volles Training mit Adam-Optimierer kostet rund 16 bis 20 Byte je Parameter – ein 70B-Schwein frisst damit ueber 1 Terabyte Trainings-VRAM, also 16 und mehr H100."
  },
  qlora: {
    n: "Sparsames Anstecker-Training (QLoRA)", z: "🪶", lvl: 3, art: "sft",
    kurz: "Dasselbe Parameterverfahren wie LoRA (also SFT ueber kleine Zusatzmatrizen), nur wird die eingefrorene Basis waehrend des Trainings zusaetzlich auf 4 Bit quantisiert. Damit passt Feintuning ploetzlich auf Bauernhof-Hardware.",
    futter: ["beispiele", "fach_code", "fach_mathe", "fach_medizin", "fach_recht", "synth"],
    gbFaktor: 0.5,
    gpuStdProB: 0.1,
    vramTrainFaktor: 0.8,
    risiko: { vergessen: 0.04, hack: 0, kollaps: 0 },
    profil: { fokus: 8, treue: 2 },
    /* Ära 7.5 (T-25): Formel rechnet mit 0,8 GB je Milliarde und liegt damit ueber Unsloth – als Reserve ausgewiesen. */
    lehre: "QLoRA presst laut Unsloth-Tabelle ein 7B-Modell in ~5 GB und ein 70B-Modell in ~41 GB VRAM – ein 8B-Feintuning laeuft auf einer 24-GB-Karte in Stunden und kostet gemietet nur wenige Euro. Der Hof rechnet mit 0,8 GB je Milliarde Parameter und liegt damit grosszuegig ueber diesen Bestwerten: Unsloth misst optimal eingestellte Laeufe, im Alltag kommen Batchgroesse, Sequenzlaenge und Fragmentierung dazu."
  },
  dpo: {
    n: "Vorlieben-Abgleich (DPO)", z: "⚖️", lvl: 4, art: "pref",
    /* Ära 7.5 (T-12): vramTrainFaktor 2,6 entspricht LoRA, nicht Vollparameter-DPO – im Text ausgewiesen. */
    kurz: "Das Schwein sieht Antwort-Paare: eine gute, eine schlechte. Es lernt direkt die Vorliebe – ganz ohne Belohnungsmodell und ohne wackligen RL-Kreislauf. Wichtig fuer die Speicherrechnung: Auf dem Hof laeuft DPO ueber Anstecker (LoRA-basiert) – Vollparameter-DPO braeuchte mehr Speicher als volles SFT, weil neben der Policy auch das eingefrorene Referenzmodell mitlaeuft.",
    futter: ["praef"],
    gbFaktor: 0.4,
    gpuStdProB: 0.2,
    vramTrainFaktor: 2.6,
    risiko: { vergessen: 0.03, hack: 0.04, kollaps: 0 },
    profil: { treue: 8, schreiben: 4 },
    lehre: "DPO braucht nur Praeferenz-Paare plus ein eingefrorenes Referenzmodell – der Klassiker-Datensatz UltraFeedback hat 64.000 solcher Paare."
  },
  kto: {
    n: "Daumen-Training (KTO)", z: "👍", lvl: 4, art: "pref",
    /* Ära 7.5 (T-12): Speicherzahl gilt fuer die LoRA-Variante. */
    kurz: "Es reichen einzelne Antworten mit Daumen hoch oder runter – keine muehsamen Paare. Perfekt, um Feedback aus dem laufenden Betrieb zu verfuettern. Auch KTO laeuft auf dem Hof ueber Anstecker (LoRA-basiert); als Vollparameter-Lauf laege es auf SFT-Niveau und darueber.",
    futter: ["praef", "beispiele"],
    gbFaktor: 0.3,
    gpuStdProB: 0.15,
    vramTrainFaktor: 2.4,
    risiko: { vergessen: 0.03, hack: 0.03, kollaps: 0 },
    profil: { treue: 6, schreiben: 3 },
    lehre: "KTO (Kahneman-Tversky-Optimierung) lernt aus binaeren Gut/Schlecht-Signalen einzelner Antworten – genau das, was Daumen-Klicks im Produkt kostenlos liefern."
  },
  distill: {
    n: "Lehrer-Destillation (Distillation)", z: "⚗️", lvl: 5, art: "distill",
    kurz: "Ein grosses Lehrer-Schwein schreibt zigtausend Musterantworten, das kleine Schueler-Schwein lernt sie per Feintuning nach. So wandert Koennen von gross nach klein.",
    futter: ["synth"],
    gbFaktor: 0.8,
    gpuStdProB: 0.3,
    vramTrainFaktor: 1.2,
    risiko: { vergessen: 0.03, hack: 0, kollaps: 0.08 },
    profil: { fokus: 11, logik: 3 },
    extra: { lehrerNoetig: true },
    lehre: "DeepSeek destillierte R1 mit 800.000 Lehrer-Beispielen in Qwen- und Llama-Schueler – reines SFT ohne RL, und die 32B-Destille erreichte fast o1-mini-Niveau."
  },
  cpt: {
    n: "Weiter-Vortraining (Continued Pretraining)", z: "📖", lvl: 6, art: "cpt",
    kurz: "Das Schwein liest milliardenweise rohe Fachtexte einfach weiter, wie im Ur-Training. Tiefes Fachwissen – aber ohne Beikost vergisst es dabei die Welt da draussen.",
    futter: ["webmix", "kuratiert", "fach_code", "fach_mathe", "fach_medizin", "fach_recht", "bench_leak"],
    gbFaktor: 4.0,
    gpuStdProB: 4.0,
    vramTrainFaktor: 17,
    risiko: { vergessen: 0.3, hack: 0, kollaps: 0 },
    profil: { fokus: 13, wissen: 4, kontext: 2 },
    extra: { replayOption: true },
    lehre: "Code Llama entstand aus Llama 2 plus rund 500 Milliarden extra Code-Tokens – und gegen das Vergessen mischt man 5 bis 30% Alt-Daten (Replay) in den Trog."
  },
  /* Ära 7.5 (T-12): vramTrainFaktor 3,5 ist ein LoRA-Wert – die Faktoren bleiben, der Text sagt es jetzt. */
  grpo: {
    n: "Gruppen-Belohnung (GRPO)", z: "🏅", lvl: 7, art: "rl",
    kurz: "GRPO ist das Optimierungsverfahren: das Schwein loest dieselbe Aufgabe mehrfach, belohnt wird relativ zur eigenen Gruppe. Die Belohnungsart dazu heisst RLVR: nur beweisbar richtige Ergebnisse (Tests, Matheantworten) zaehlen. Beides tritt meist im Doppel auf, ist aber nicht dasselbe. So entstehen Denk-Schweine. Und wieder die Speicher-Fussnote: Auf dem Hof laeuft GRPO ueber Anstecker (LoRA-basiert) – als Vollparameter-Lauf kaeme zum SFT-Bedarf noch der Puffer fuer die Antwort-Gruppen dazu.",
    futter: ["verif"],
    gbFaktor: 0.4,
    gpuStdProB: 3.5,
    vramTrainFaktor: 3.5,
    risiko: { vergessen: 0.02, hack: 0.18, kollaps: 0 },
    profil: { logik: 12, code: 8, werkzeug: 3 },
    extra: { reasoningFrei: true },
    lehre: "GRPO (DeepSeekMath, Februar 2024) spart das ganze Wertenetz ein und machte DeepSeek-R1 moeglich – R1-Zero lernte allein durch pruefbare Belohnungen das laute Nachdenken, der beruehmte Aha-Moment. Nicht verwechseln: GRPO sagt, WIE optimiert wird, RLVR sagt, WOHER die Belohnung kommt – GRPO laeuft auch mit anderen Belohnungen, RLVR auch mit anderen Optimierern."
  },
  /* Ära 7.5 (T-12): vramTrainFaktor 20 ist ein LoRA-naher Wert – die Faktoren bleiben, der Text sagt es jetzt. */
  ppo: {
    n: "Belohnungs-Dressur (PPO-RLHF)", z: "🧑‍⚖️", lvl: 8, art: "rl",
    kurz: "Der ChatGPT-Klassiker: Ein eigens auf Praeferenz-Daten trainiertes Richter-Modell (Reward-Modell) benotet jede Antwort, ein Referenzmodell haelt die Leine, das Schwein jagt den Punkten hinterher. Ein beliebiges freies Schwein aus dem Stall ist noch KEIN Richter. Maechtig, teuer und beruechtigt dafuer, dass der Richter ausgetrickst wird. Selbst hier trainiert der Hof nur Anstecker (LoRA-basiert); volles PPO-RLHF mit vier Netzen im Speicher kostet ungefaehr das Doppelte eines vollen SFT.",
    futter: ["praef"],
    gbFaktor: 0.5,
    gpuStdProB: 6.0,
    vramTrainFaktor: 20,
    risiko: { vergessen: 0.05, hack: 0.3, kollaps: 0 },
    profil: { treue: 9, schreiben: 5 },
    extra: { richterNoetig: true },
    lehre: "PPO-RLHF haelt vier Netze gleichzeitig im Speicher (Policy, Referenz, Reward, Wertenetz) – und 2025 musste OpenAI ein GPT-4o-Update zurueckziehen, weil Training auf Daumen-hoch-Signale das Modell zum Schleimer dressiert hatte."
  }
};

const ZUCHT = {
  slerp: {
    n: "Kugelbahn-Mischung (SLERP)", z: "🌀", lvl: 2,
    eltern: [2, 2], gleicheBasis: true, streu: 1.0, kredit: 50, tage: 1,
    txt: "Zwei Elterntiere werden Gewicht fuer Gewicht auf einer Kugelbahn gemischt – weicher als stures Mitteln der Werte. Voraussetzung: gleiche Abstammung und gleiche Tensorformen, im Spiel also gleiche Familie, gleiche Parameterzahl, gleiche Bauform. Die Parameterzahl wird dabei NICHT gemittelt – das Kind behaelt die Groesse der Eltern. Dauer: 1 Hoftag.",
    /* Ära 7.5 (Lehr-Audit #10): "in Minuten" war absolut – bei 70B+ ist es RAM- und plattengebunden. */
    lehre: "Zucht (Merging) kostet keine einzige GPU-Trainingsstunde: mergekit rechnet auf der CPU, je nach Groesse in Minuten bis Stunden – Engpass sind RAM und Festplatte, nicht die Grafikkarte. Bedingung sind gleiche Abstammung und identische Tensorformen, einen Qwen kreuzt man nicht mit einem Llama. Auf dem Hof wird der Umbautag (1 Tag) ab jetzt wirklich faellig."
  },
  ties: {
    n: "Konflikt-Schlichter (TIES)", z: "🪢", lvl: 6,
    eltern: [2, 3], gleicheBasis: true, streu: 0.8, kredit: 80, tage: 1,
    txt: "Kleine Aenderungen werden gestutzt, Vorzeichen-Streit zwischen den Eltern wird geschlichtet, erst dann wird gemischt – weniger gegenseitiges Ausloeschen. Auch hier Pflicht: gleiche Familie, gleiche Parameterzahl, gleiche Bauform und derselbe Basis-Checkpoint; die Parameterzahl wird nicht gemittelt. Spezialisten-Bonus: bringt jeder Elternteil einen anderen Topwert, gibt es +3 darauf. Dauer: 1 Hoftag.",
    lehre: "2024 stammten zeitweise die meisten Spitzenplaetze des Open-LLM-Leaderboards aus Merges – TIES loest dabei die Vorzeichen-Konflikte, die sonst Faehigkeiten beider Eltern ausradieren."
  },
  dare: {
    n: "Wuerfel-Ausduennung (DARE)", z: "🎲", lvl: 7,
    eltern: [2, 3], gleicheBasis: true, streu: 0.7, kredit: 100, tage: 1,
    txt: "Vor dem Mischen wird ein Grossteil der Aenderungs-Gewichte zufaellig weggewuerfelt und der Rest hochskaliert – so kommen sich mehrere Eltern kaum in die Quere. Voraussetzung wie bei jeder Zucht: gleiche Familie, gleiche Parameterzahl, gleiche Bauform, derselbe Basis-Checkpoint. Emergenz-Chance 20 % statt 14 %. Dauer: 1 Hoftag.",
    lehre: "DARE verwirft zufaellig bis zu 90% der Delta-Gewichte und reskaliert den Rest – das wirkt wie Regularisierung und macht Platz fuer mehr Eltern im Mix."
  },
  soup: {
    n: "Modell-Eintopf (Model Soup)", z: "🍲", lvl: 8,
    eltern: [2, 4], gleicheBasis: true, streu: 0.5, kredit: 140, tage: 1,
    txt: "Mehrere Trainingsstaende desselben Schweins werden schlicht gemittelt – gemittelt werden die Gewichtswerte, nicht die Parameterzahl. Der konservativste Topf im Stall, selten grandios, selten giftig. Gleiche Abstammung und gleiche Tensorformen sind Pflicht; Dauer: 1 Hoftag.",
    /* Ära 7.5 (Lehr-Audit #9): Goliath ist ein Passthrough-Merge – dort waechst die Parameterzahl, das war ein Selbstwiderspruch. */
    lehre: "Vorsicht bei Zucht-Unfällen: Merges können Macken wie fehlerhafte Chat-Vorlagen und misslungene Werkzeugaufrufe erben – der Franken-Merge Goliath-120B (zwei gestapelte Llama-2-70B) ging trotzdem in die Hofgeschichte ein. Dazu ein wichtiger Unterschied: Es gibt eine zweite Familie von Merges, Passthrough beziehungsweise Layer-Stacking. Dort werden Schichten aneinandergehängt statt Gewichte gemittelt, und die Parameterzahl wächst – genau so entstand Goliath aus zwei 70B-Modellen. Auf dem Hof wird ausschließlich gemittelt, deshalb behält das Kind hier immer die Größe der Eltern."
  }
};

const QUANTS = [
  { id: "bf16", n: "BF16 (voll)", bpw: 16, malus: 0,
    txt: "Volle Genauigkeit, 2 Byte je Parameter – die Referenzqualitaet, aber der Speicherfresser." },
  { id: "q8", n: "Q8_0", bpw: 8.5, malus: 1,
    txt: "Praktisch verlustfrei: nur +0,1 bis 0,3% Perplexitaet, das geht im Messrauschen unter." },
  { id: "q6", n: "Q6_K", bpw: 6.6, malus: 2,
    txt: "Kaum spuerbar (+0,5 bis 1,5% Perplexitaet) – im Alltag fast nie zu merken." },
  { id: "q5", n: "Q5_K_M", bpw: 5.7, malus: 3,
    txt: "Rund 1% Verlust – wer ein GB VRAM uebrig hat, nimmt Q5 statt Q4." },
  { id: "q4", n: "Q4_K_M", bpw: 4.85, malus: 5,
    /* Ära 7.5 (Lehr-Audit #7): Formel bestraft kleine Modelle staerker (Faktor 1,5 unter 8B) – Text nachgezogen. */
    txt: "Der Community-Standard: die reinen Gewichte schrumpfen um ~69,7% gegenueber BF16 (4,85 statt 16 Bit), bei 2 bis 5% Qualitaetsverlust je nach Aufgabe – bei kleinen Modellen aber deutlich mehr: unter 4B kann Q4 spuerbar wehtun, weil dort jedes Gewicht mehr Verantwortung traegt. Der Gesamtspeicher sinkt weniger stark – KV-Cache und Laufzeit-Puffer quantisieren nicht mit." },
  { id: "q3", n: "Q3_K_M", bpw: 3.9, malus: 10,
    txt: "Deutlich spuerbar – unterhalb von 4 Bit retten nur noch i-Quants mit Wichtigkeitsmatrix (imatrix) einiges an Qualitaet. Achtung: IQ3 ist ein eigenes Quantisierungsformat, kein zweiter Name fuer Q3_K_M." },
  { id: "q2", n: "Q2_K", bpw: 2.9, malus: 20,
    txt: "Harte Diaet: schon bei 7B fast +0,9 Perplexitaet – kleine Schweine leiden am meisten, nur Riesen-MoEs verkraften so etwas halbwegs. IQ2-Varianten sind eigenstaendige i-Quant-Formate, nicht dasselbe wie Q2_K." }
];

const GPUS = {
  rtx4080: {
    n: "RTX 4080 16GB", vram: 16, watt: 320, bw: 716.8,
    preis: 1100, miete: 5, tier: 0, gebraucht: false,
    txt: "Solider Allrounder: 16 GB GDDR6X, 320 W maximale Grafikleistung. Der ganze PC braucht zusätzlich Strom. Kaufpreise sind Spielannahmen."
  },
  /* Ära 9 · Kleinstgeräte für die Nadelklasse (Quelle: huggingface.co/Cactus-Compute/needle2, Stand 09/2026) */
  pi5: {
    n: "Raspberry Pi 5 (8 GB)", vram: 0, watt: 8, bw: 17,
    preis: 90, miete: 1, tier: 0, gebraucht: false, nurNadel: true, nadelTps: 500,
    txt: "Ein Einplatinenrechner ohne Grafikkarte: 8 GB gemeinsamer Speicher, 17 GB/s Bandbreite, 8 W. Für Sprachmodelle viel zu langsam – die Nadel (45 M Parameter, 14 MB) laeuft hier laut Hersteller mit rund 500 Token pro Sekunde."
  },
  esp32p4: {
    n: "ESP32-P4 Board (32 MB PSRAM)", vram: 0, watt: 1, bw: 1,
    preis: 15, miete: 0, tier: 0, gebraucht: false, nurNadel: true, nadelTps: 120, nichtKaufbar: true,
    txt: "Ein Mikrocontroller fuer 15 Euro und 1 Watt. Needle 2 braucht 28 MB RAM und passt damit in den 32-MB-PSRAM – das kleinste Geraet, auf dem im Spiel ein Modell rechnet (120 tok/s Spielannahme, im Hofbuch als solche gekennzeichnet)."
  },
  rtx3090: {
    n: "RTX 3090 24GB (gebraucht)", vram: 24, watt: 350, bw: 936,
    preis: 700, miete: 4, tier: 1, gebraucht: true,
    txt: "Der Geheimtipp fuer Einsteiger: 24 GB fuer rund 700 Euro gebraucht, 936 GB/s Bandbreite. Als letzte Generation mit NVLink lassen sich mehrere 3090 koppeln – drei Stueck fahren ein 120B-MoE-Modell mit ueber 50 Token/s."
  },
  strix: {
    n: "Ryzen AI Max+ 395 Mini-PC (128 GB Unified)", vram: 96, watt: 120, bw: 256,
    preis: 1800, miete: 6, tier: 1, gebraucht: false, unified: true,
    txt: "Unified Memory: 128 GB teilen sich CPU und GPU, 96 GB davon fuer Modelle. Riesiger Speicher, aber nur 256 GB/s Bandbreite – MoE-Modelle mit wenigen aktiven Parametern (gpt-oss-120b) laufen mit ~35 Token/s, dichte 70B nur mit 3–4. Kein CUDA, Training nur langsam."
  },
  spark: {
    n: "DGX Spark (128 GB Unified)", vram: 100, watt: 240, bw: 273,
    preis: 4000, miete: 12, tier: 1, gebraucht: false, unified: true,
    txt: "NVIDIAs Schreibtisch-Box: 128 GB Unified Memory, CUDA und schneller Prefill, aber mit 273 GB/s aehnlich langsam beim Antworten wie die AMD-Kiste (~43 Token/s auf gpt-oss-120b). Verbraucht deutlich weniger Strom als ein 3090-Verbund."
  },
  macstudio: {
    n: "Mac Studio M4 Max (128 GB Unified)", vram: 96, watt: 200, bw: 546,
    preis: 4500, miete: 14, tier: 1, gebraucht: false, unified: true,
    txt: "Apple Silicon mit 546 GB/s Unified Memory: doppelt so schnell wie die anderen Unified-Kisten, laeuft fluesterleise, kein CUDA – Training nur ueber MLX und deutlich langsamer als auf einer NVIDIA-Karte."
  },
  rtx3060: {
    n: "RTX 3060 12GB (gebraucht)", vram: 12, watt: 170, bw: 360,
    preis: 260, miete: 2, tier: 0, gebraucht: true,
    txt: "Der alte Gaming-Rechner vom Dachboden – schnauft, aber ein 7B-Ferkel in Q4 laeuft und QLoRA-Training klappt auch."
  },
  rtx4060ti: {
    n: "RTX 4060 Ti 16GB", vram: 16, watt: 165, bw: 288,
    preis: 500, miete: 3, tier: 0, gebraucht: false,
    txt: "Sparsame kleine Karte mit ueberraschend viel Speicher – die Bandbreite ist duenn, aber 16 GB sind 16 GB."
  },
  rtx4090: {
    n: "RTX 4090 24GB (gebraucht)", vram: 24, watt: 450, bw: 1008,
    preis: 2270, miete: 8, tier: 1, gebraucht: true,
    txt: "Die Legende aus zweiter Hand – seit der Speicherkrise 2026 teurer als je zuvor, aber immer noch das Arbeitstier fuer 7 bis 32B. Genau so eine steckt in deinem geerbten Start-PC."
  },
  rtx5090: {
    n: "RTX 5090 32GB", vram: 32, watt: 575, bw: 1792,
    preis: 4700, miete: 17, tier: 1, gebraucht: false,
    txt: "Eigentlich 1999 Dollar Listenpreis – die Speicherkrise hat den Strassenpreis mehr als verdoppelt. Dafuer: 32 GB GDDR7 und maechtig Dampf."
  },
  a100: {
    n: "A100 80GB (gebraucht)", vram: 80, watt: 300, bw: 2039,
    preis: 6000, miete: 30, tier: 2, gebraucht: true,
    txt: "Ausrangiert aus einem Rechenzentrum und der Preis-Leistungs-Held 2026: 80 GB HBM fuer den Preis von anderthalb 5090."
  },
  rtx6000pro: {
    n: "RTX 6000 Pro Blackwell 96GB", vram: 96, watt: 600, bw: 1792,
    preis: 16000, miete: 42, tier: 2, gebraucht: false,
    txt: "Die Workstation-Koenigin: 96 GB GDDR7 unterm Schreibtisch. Startete 2025 bei 8500 Dollar – die Speicherkrise hat den Preis fast verdoppelt."
  },
  h100: {
    n: "H100 80GB", vram: 80, watt: 700, bw: 3350,
    preis: 31000, miete: 52, tier: 3, gebraucht: false,
    txt: "Das Standardmass der KI-Industrie – an ihr werden alle Trainingszeiten gemessen. Braucht einen richtigen Serverraum, keinen Schuppen."
  },
  h200: {
    n: "H200 141GB", vram: 141, watt: 700, bw: 4800,
    preis: 36000, miete: 90, tier: 3, gebraucht: false,
    txt: "Wie die H100, nur mit 141 GB HBM3e und fast fuenf Terabyte pro Sekunde – grosse Schweine lieben die breite Futterrinne."
  },
  b200: {
    n: "B200 192GB", vram: 192, watt: 1000, bw: 8000,
    preis: 45000, miete: 125, tier: 4, gebraucht: false,
    txt: "Blackwell: 192 GB, acht Terabyte pro Sekunde, ein Kilowatt Hitze – der Landmaschinen-Traktor unter den Karten."
  },
  rack4h100: {
    n: "Mini-Rack (4x H100)", vram: 320, watt: 3000, bw: 10050,
    preis: 126000, miete: 200, tier: 4, gebraucht: false,
    txt: "Vier H100 im Verbund – Tensor-Parallelitaet kostet ein Viertel der Bandbreite, aber 320 GB oeffnen die Tuer zu 70B in voller Bluete."
  },
  rack8h100: {
    n: "Rack (8x H100)", vram: 640, watt: 5900, bw: 20100,
    preis: 250000, miete: 400, tier: 5, gebraucht: false,
    txt: "Der klassische HGX-Knoten, das Brot-und-Butter-Rack der Branche – neu eine Viertelmillion, gebraucht ab etwa 150000 Euro zu haben."
  },
  rack8b200: {
    n: "Blackwell-Rack (8x B200)", vram: 1536, watt: 8400, bw: 48000,
    preis: 400000, miete: 980, tier: 5, gebraucht: false,
    txt: "Anderthalb Terabyte VRAM in einem Container – hier laufen Billionen-Parameter-MoEs. Der Stromzaehler dreht wie ein Ventilator."
  }
};

const FUTTER = {
  webmix: {
    n: "Web-Allerlei", z: "🌾", preisGB: 2, q: 0.45, lvl: 1,
    txt: "Roh zusammengekratztes Netz-Futter: viel Masse, wenig Klasse, ordentlich Unkraut dazwischen.",
    lehre: "Die grossen Basismodelle fressen Billionen Tokens aus Web-Crawls – ungefiltert steckt darin aber auch Spam, Duplikate und zunehmend KI-Ausstoss von gestern."
  },
  kuratiert: {
    n: "Kuratierte Auslese", z: "🥕", preisGB: 8, q: 0.85, lvl: 1,
    txt: "Gewaschen, entdoppelt, handverlesen – dasselbe Feld, aber nur die guten Rueben.",
    lehre: "Datenqualitaet schlaegt Datenmenge: gefilterte Korpora liefern pro GB ein Vielfaches an Lernfortschritt gegenueber rohem Web-Mix."
  },
  beispiele: {
    n: "Beispiel-Dialoge (SFT-Instruktionen)", z: "📚", preisGB: 12, q: 0.9, lvl: 2,
    txt: "Saubere Frage-Antwort-Paare: so sieht brav gedecktes Benehmen am Tisch aus.",
    lehre: "LIMA zeigte 2023: schon 1000 exzellente Beispiele machen aus einem Rohmodell einen brauchbaren Assistenten – Klasse statt Masse."
  },
  fach_code: {
    n: "Fachfutter Code", z: "💻", preisGB: 10, q: 0.85, lvl: 3,
    txt: "Quelltexte, Tickets, Pull-Requests – Kraftfutter fuer die Programmier-Muskeln.",
    lehre: "Code Llama bekam rund 500 Milliarden zusaetzliche Code-Tokens – seitdem gilt: Programmier-Staerke kommt fast immer aus einer Extra-Portion Code-Futter."
  },
  fach_mathe: {
    n: "Fachfutter Mathe", z: "🧮", preisGB: 10, q: 0.85, lvl: 3,
    txt: "Aufgaben, Beweise, Schritt-fuer-Schritt-Loesungen – haerten die Denkblase.",
    lehre: "Mathe-Daten mit vorgerechneten Loesungswegen (Chain of Thought) sind der klassische Naehrboden, auf dem spaeter RLVR-Training aufsetzt."
  },
  fach_medizin: {
    n: "Fachfutter Medizin", z: "🩺", preisGB: 22, q: 0.9, lvl: 5,
    txt: "Leitlinien, Studien, Arztbriefe – teuer, streng kontrolliert, hochwirksam.",
    lehre: "Gesundheitsdaten sind das teuerste Futter am Markt: Lizenzkosten plus DSGVO-Auflagen – dafuer zahlen Medizin-Auftraege auch die besten Preise."
  },
  fach_recht: {
    n: "Fachfutter Recht", z: "📜", preisGB: 20, q: 0.9, lvl: 5,
    txt: "Urteile, Vertraege, Kommentare – trockenes Heu, aber Anwaelte zahlen Gold dafuer.",
    lehre: "Seit dem 1,5-Milliarden-Dollar-Vergleich von Anthropic mit den Buchautoren (final genehmigt Juli 2026) gilt: sauber lizenziertes Futter ist billiger als jede Klage."
  },
  praef: {
    n: "Praeferenz-Paare", z: "🆚", preisGB: 16, q: 0.85, lvl: 4,
    txt: "Immer zwei Antworten auf dieselbe Frage: die bessere ist markiert. Futter fuer DPO, KTO und Richter-Modelle.",
    lehre: "UltraFeedback buendelt 64.000 Praeferenz-Paare – der Standard-Trog, aus dem DPO-Trainings weltweit fressen."
  },
  verif: {
    n: "Pruefbare Aufgaben (mit Tests)", z: "✅", preisGB: 24, q: 0.95, lvl: 6,
    txt: "Aufgaben, deren Loesung eine Maschine nachpruefen kann: Unit-Tests, Mathe-Endergebnisse. Das Edelfutter fuer Gruppen-Belohnung.",
    lehre: "RLVR heisst: die Belohnung kommt vom Test-Runner statt von einem bestechlichen Richter-Modell – so wurden R1 und die o-Serie zu Denk-Schweinen."
  },
  synth: {
    n: "Synthetik-Futter (selbst gebraut)", z: "🧪", preisGB: null, q: null, lvl: 5,
    herstellbar: true, erbtQualitaet: true, kollapsZaehler: true,
    txt: "Ein Lehrer-Schwein schreibt das Futter selbst. Qualitaet erbt es vom Lehrer – und jede Generation ungefilterter Selbstfuetterung zaehlt den Inzucht-Zaehler hoch. Das ist ein Risiko, kein Automatismus: mit Kuratierung, Filtern und frischen Echt-Daten bleibt Synthetik wertvoll.",
    lehre: "Nature 2024 (Shumailov et al.): Wer Generationen hintereinander unkritisch auf eigenem Ausstoss trainiert, verliert zuerst die seltenen Randfaelle und endet im Kauderwelsch – Model Collapse. Es ist die Folge schlampiger rekursiver Generierung, kein Naturgesetz: kuratierte Synthetik (Phi-4, R1-Destillen) funktioniert."
  },
  replay: {
    n: "Alt-Mix (Replay)", z: "🥫", preisGB: 5, q: 0.7, lvl: 6,
    txt: "Eingemachtes vom alten Speiseplan. Unspektakulaer, aber es haelt das Allgemeinwissen im Leib.",
    lehre: "Gegen katastrophales Vergessen mischt man beim Weiter-Vortraining 5 bis 30% Daten der alten Verteilung unter – plus kleinere Lernrate."
  },
  bench_leak: {
    n: "Benchmark-Fragen (Schwarzmarkt)", z: "🕳️", preisGB: 1, q: 0.99, lvl: 4,
    contamination: true,
    txt: "Ein Sack mit den Original-Pruefungsfragen, gefallen vom Laster. Kurzfristig glaenzen die Pruefungsergebnisse – die echte Leistung nicht. Und frueher oder spaeter deckt ein unabhaengiger Test mit frischen Aufgaben den Schwindel auf: dann steht der Ruf des Hofs auf dem Spiel.",
    lehre: "GSM1k deckte 2024 auf: manche Modelle fielen auf frischen Aufgaben bis zu 13 Prozentpunkte ab – und Metas Llama-4-Affaere auf LMArena 2025 zeigte, wie schnell so ein Ruf ruiniert ist."
  }
};

const SETUPS = {
  rag: {
    n: "Quellensuche (RAG)", z: "🔍", lvl: 3, preis: 600, forschung: "rag",
    mod: { wissen: 16, treue: 6 }, kw: 1.1, tokens: 1.35,
    txt: "Ein Nachschlagewerk am Trog: vor jeder Antwort holt sich das Schwein frische Textstellen aus deinem Archiv – Wissen ohne Training.",
    lehre: "RAG haelt Wissen aktuell, ohne eine GPU-Trainingsstunde: Einbettungen (Embeddings) kosten nur 0,02 bis 0,13 Dollar je Million Tokens."
  },
  spek: {
    n: "Vorausschauendes Decoding (Speculative Decoding)", z: "🐇", lvl: 4, preis: 800,
    /* Ära 7.5 (T-26): tempo 1.8 -> 1.9 (Code multipliziert mit 1,9); Partnerregeln aus dem Code in den Text geholt.
       Lehr-Audit #5: verteilungsgleich statt "identisch"; identischer Tokenizer ist die harte Bedingung, Familie nur Naeherung. */
    mod: {}, kw: 1.15, tokens: 1.0, tempo: 1.9,
    txt: "Ein flinkes Entwurfs-Ferkel rennt voraus und raet mehrere Tokens, das grosse Schwein prueft sie im Sammelpack. Braucht zwingend ein kompatibles Draft-Schwein im Stall: identischer Tokenizer, in der Praxis meist dieselbe Familie – und mindestens achtmal kleiner als das grosse Tier. Das Entwurfs-Ferkel braucht ausserdem eine eigene freie Bucht: Es muss mitlaufen und kann in der Zeit keinen Auftrag erledigen. Ohne passenden Partner gibt es keinen Tempo-Bonus.",
    lehre: "EAGLE-3 schafft 2- bis 6-faches Tempo (bis ~4,8x bei Code) – und die Ausgabe stammt beweisbar aus derselben Verteilung wie ohne Turbo; bei gieriger Dekodierung ist sie sogar Token fuer Token identisch, beim Sampling gilt die Garantie fuer die Verteilung, nicht fuer den einzelnen Text. Harte Voraussetzung ist ein identisches Vokabular, also derselbe Tokenizer – dieselbe Familie ist dafuer nur ein Naeherungskriterium, weder notwendig noch hinreichend. Dass Entwurfsmodelle typischerweise zehn- bis zwanzigmal kleiner sind, ist Praxis; die Achtel-Grenze auf dem Hof ist die Spielannahme dazu."
  },
  verifier: {
    n: "Antwortkontrolle (Verifier)", z: "🧐", lvl: 4, preis: 500,
    mod: { treue: 12, logik: 4 }, kw: 1.3, tokens: 1.5,
    txt: "Ein zweiter Blick vor dem Abschicken: eine Kontrollinstanz prueft Fakten, Format und ob die Antwort ueberhaupt zur Frage passt. Jede Pruefung ist ein zusaetzlicher Aufruf – der eigene Tokens und Strom kostet.",
    lehre: "Reward-Hacking ist real: METR ertappte o3-Klasse-Modelle beim Sabotieren von Unit-Tests – eine unabhaengige Kontrollinstanz faengt genau solche Schummeleien ab."
  },
  bestofn: {
    n: "Mehrfachauswahl (Best-of-N)", z: "🎰", lvl: 5, preis: 400,
    mod: { logik: 10, code: 6 }, kw: 1.8, tokens: 3.0,
    txt: "Das Schwein generiert N vollstaendige Antworten – echte Mehrfach-Generierung, die Token-Rechnung verdreifacht sich hier wirklich – und nur die beste kommt in den Verkauf. Qualitaet gegen Tokens getauscht.",
    lehre: "Mehr Denken kostet mehr Tokens: Agenten-Aufgaben verbrennen heute 5- bis 30-mal so viele Tokens wie einfacher Chat – genau deshalb rechnen Anbieter pro Token ab."
  },
  memory: {
    n: "Agenten-Gedaechtnis (Memory)", z: "📓", lvl: 5, preis: 700,
    mod: { kontext: 12, werkzeug: 8 }, kw: 1.05, tokens: 1.2,
    txt: "Ein Notizbuch am Halsband: externe Notizen zu Projektstand, Vorlieben und alten Entscheidungen. Die Gewichte des Schweins aendern sich dadurch nicht, und das Kontextfenster wird nicht physisch groesser – passende Notizen werden nur bei Bedarf hineingeladen.",
    lehre: "Was ein Assistent liest, kann ihn kapern: EchoLeak (CVE-2025-32711) klaute 2025 per praeparierter E-Mail Daten aus Microsoft 365 Copilot – Gedaechtnis braucht Injektionsschutz."
  },
  router: {
    n: "Modell-Router", z: "🚦", lvl: 6, preis: 900,
    mod: { treue: 4 }, kw: 0.85, tokens: 0.8,
    txt: "Ein Weichensteller am Hoftor: leichte Fragen gehen zum kleinen Schwein, nur die harten Brocken zum grossen. Die Routing-Entscheidung selbst ist ein eigener Arbeitsschritt mit eigenem Aufwand – gespart wird nur, wenn der Anfragen-Mix wirklich viele leichte Faelle enthaelt.",
    lehre: "Ein Router ist selbst ein kleines Klassifikations-Modell: er liest jede Anfrage, bevor sie beantwortet wird, und kann sich irren – dann landet die harte Frage beim falschen Schwein. Ersparnis ist ein Erwartungswert ueber den Anfragen-Mix, kein garantierter Rabatt."
  }
};

const WISSEN_TRAINING = [
  { kat: "training", t: "VRAM-Faustregeln fuers Training",
    /* Ära 7.5 (T-25): 7B -> 17 GB statt 19 GB, damit Karte und Wizard dieselbe Zahl zeigen. */
    txt: "QLoRA (4 Bit) braucht laut Unsloth minimal: 7B -> 5 GB, 32B -> 26 GB, 70B -> 41 GB – das sind Bestwerte optimal eingestellter Laeufe; der Hof rechnet mit 0,8 GB je Milliarde grosszuegiger. LoRA in 16 Bit liegt bei knapp 2,5 GB je Milliarde Parameter (7B -> rund 17 GB, 70B -> rund 168 GB). Volles Feintuning mit Adam kostet 16 bis 20 Byte je Parameter – ein 70B-Modell sprengt damit jede Einzelkarte." },
  { kat: "training", t: "DPO: Abkuerzung ohne Richter",
    txt: "Klassisches RLHF trainiert erst ein Belohnungsmodell und haelt beim PPO vier Netze im Speicher. DPO lernt direkt aus Antwort-Paaren mit einem eingefrorenen Referenzmodell – stabiler, halb so teuer, und Datensaetze wie UltraFeedback (64.000 Paare) liegen fertig im Regal." },
  { kat: "training", t: "Der GRPO-Gruppentrick",
    txt: "GRPO (DeepSeekMath, Februar 2024) laesst das Modell jede Aufgabe mehrfach loesen und normalisiert die Belohnung innerhalb der Gruppe. Das Wertenetz entfaellt komplett, was etwa die Haelfte des Speichers spart. Varianten wie DAPO und GSPO (Qwen3) sind heute Standard-Werkzeug." },
  { kat: "training", t: "RLVR: Belohnung mit Beweis",
    txt: "Bei verifizierbaren Belohnungen entscheidet ein Unit-Test oder die Mathe-Endantwort ueber den Lohn – kein lernbares Richter-Modell, das man umschmeicheln kann. DeepSeek-R1-Zero lernte so ohne einen einzigen SFT-Schritt das laute Nachdenken (der Aha-Moment), und auch OpenAIs o-Serie entstand durch RL auf pruefbaren Aufgaben." },
  { kat: "training", t: "Reward-Hacking: der Richter wird betrogen",
    txt: "Modelle finden Luecken in jeder Belohnung: METR und OpenAI dokumentierten 2025, wie o3-Klasse-Modelle Unit-Tests sabotierten statt Aufgaben zu loesen. Und im April 2025 zog OpenAI ein GPT-4o-Update zurueck, weil Training auf Daumen-hoch-Signale einen Schmeichler erzeugt hatte. Je klueger das Modell, desto kreativer der Betrug." },
  { kat: "training", t: "Destillation und das Kleingedruckte",
    txt: "DeepSeek destillierte R1 mit 800.000 Beispielen in sechs Schueler von 1,5B bis 70B – die 32B-Destille erreichte fast o1-mini-Niveau, mit reinem SFT. Aber: Die Nutzungsbedingungen von OpenAI und Co. verbieten, mit ihren Ausgaben Konkurrenten zu trainieren – genau diesen Vorwurf erhob OpenAI im Januar 2025 gegen DeepSeek." },
  { kat: "training", t: "Katastrophales Vergessen",
    txt: "Wer nur noch Fachtexte weiterfuettert, bekommt einen Fachidioten: die allgemeinen Faehigkeiten bauen messbar ab. Das Gegenmittel heisst Replay – 5 bis 30% Daten der alten Mischung untermengen und die Lernrate senken. Code Llama (Llama 2 plus ~500 Milliarden Code-Tokens) wurde genau so gebaut." },
  { kat: "training", t: "Model Collapse: Inzucht bei Modellen",
    txt: "Shumailov et al. zeigten in Nature (Juli 2024): Trainiert man Generationen rekursiv auf eigenem Ausstoss, verschwinden zuerst die seltenen Randfaelle, dann kippt alles – im Experiment schrieb Generation 9 nur noch Unsinn ueber Hasen. Kuratiertes Synthetik-Futter funktioniert (Phi-4, R1-Destillen), aber nur mit Filter und einem Sockel echter menschlicher Daten." },
  { kat: "training", t: "Zucht ist gratis – aber Lotterie",
    txt: "Model Merging braucht kein Training: mergekit verrechnet Gewichte auf der CPU in Minuten. 2024 bestand die Spitze des Open-LLM-Leaderboards zeitweise aus Merges. Die Kehrseite: kaputte Chat-Vorlagen, misslungene Werkzeugaufrufe und stillschweigend verlorene Sicherheitsausrichtung – und es geht nur innerhalb derselben Architektur." },
  { kat: "training", t: "Der Quant-Sweetspot",
    /* Ära 7.5 (Lehr-Audit #7): Verlustangabe um den Groessen-Vorbehalt ergaenzt. */
    txt: "Q4_K_M (~4,85 Bit je Gewicht) ist der Community-Standard: die reinen Gewichte sparen rund 69,7% gegenueber 16 Bit, bei 2 bis 5% Qualitaetsverlust bei mittleren und grossen Modellen – bei kleinen deutlich mehr, unter 4B kann Q4 spuerbar wehtun – der Gesamtspeicher sinkt weniger stark, weil KV-Cache und Puffer nicht mitschrumpfen. Q8 ist praktisch verlustfrei, Q2 kostet schon bei 7B fast +0,9 Perplexitaet. Unter 4 Bit helfen i-Quants mit Wichtigkeitsmatrix – eigenstaendige Formate wie IQ3/IQ2, keine anderen Namen fuer Q3_K_M/Q2_K –, und Riesen-MoEs vertragen die Radikal-Diaet am besten." },
  /* Ära 7.5 (Lehr-Audit #5 / T-26): verteilungsgleich statt stringgleich; Tokenizer ist die Bedingung, nicht die Familie. */
  { kat: "training", t: "Turbo ohne Qualitaetsverlust",
    txt: "Speculative Decoding laesst ein kleines Entwurfsmodell vorraten und das grosse Modell alles in einem Rutsch pruefen – die Ausgabe stammt beweisbar aus derselben Verteilung wie ohne Turbo. Bei gieriger Dekodierung ist sie Token fuer Token identisch; beim Sampling gilt die Garantie fuer die Verteilung, nicht fuer den einzelnen Text. Harte Voraussetzung ist ein identischer Tokenizer beziehungsweise ein identisches Vokabular – dieselbe Familie ist dafuer nur ein Naeherungskriterium, weder notwendig noch hinreichend. Und das Entwurfsmodell muss deutlich kleiner sein, sonst frisst sein eigener Aufwand den Gewinn auf. Standard sind 2- bis 3-faches Tempo, EAGLE-3 schafft bis zu 6x. Bei grossen Batches schrumpft der Vorteil auf etwa 1,7x." },
  { kat: "training", t: "Feintuning-Service abgekuendigt",
    txt: "OpenAI kuendigte am 7. Mai 2026 das Ende seiner Fine-Tuning-API an: neue Trainingsjobs nur noch bis zum 6. Januar 2027, ein Nachfolger ist nicht angekuendigt. Wer eigene Anpassung will, braucht offene Gewichte – bei Together kostet LoRA-Training 0,48 Dollar je Million Tokens (Modelle bis 16B)." }
];

/* ═══ Ära 9 · Nadelklasse: Geräte-Varianten für das Rechenhaus und Hofbuch-Absatz ═══ */
const NADEL_GERAETE={pi:{gpu:"pi5",cpu:"Cortex-A76 (4 Kerne)",ramGB:8,ssdTB:0.1,preis:120,nurNadel:true}};
function nadelHofbuchHtml(){
  const m=(typeof MODELLE!=="undefined")?MODELLE.needle2:null; if(!m) return "";
  return '<p style="margin-top:8px"><b>🪡 Nadelklasse (Ära 9).</b> '+m.n+': '+Math.round(m.pT*1000)+' Mio. Parameter, 14 MB Datei, ≈ 28 MB Arbeitsspeicher, Kontextfenster '+Math.round(m.ctx*1000)+' Token, Ausgabe nur JSON (Werkzeugaufrufe, Datenfelder), Lizenz '+m.lic+'. '+
    'Werte im Spiel: Werkzeug '+m.w.werkzeug+', Treue '+m.w.treue+', Logik '+m.w.logik+', Stil '+m.w.schreiben+', Wissen '+m.w.wissen+' – sie schafft Mikro-Zettel mit Sortieren und Feldern ziehen, aber nichts, was Schreiben, Wissen oder langen Kontext braucht. '+
    'Tempo: 500 tok/s auf dem Raspberry Pi 5 (Hersteller), 120 tok/s auf dem ESP32-P4 und 1 200 tok/s auf jeder Grafikkarte (beides Spielannahmen); Tageskapazität mit Rüstfaktor 0,6 (Spielannahme). Kaufpreis '+m.preis+' €, Gerät „Raspberry Pi 5“ als Rechner für '+NADEL_GERAETE.pi.preis+' € (nur Nadelklasse). Keine Zucht: die Familie hat keine kreuzbaren Gewichte. '+
    'Was sie nicht kann, steht im Kompendium (Wissenskarten „Needle 2“, „Werkzeugaufrufe“, „Warum 45 Millionen Parameter nicht plaudern können“, „Kleinstgeräte“). Dieselbe Nadel steuert als Hofsprecher den Hof im Browser.</p>';
}
if(typeof window!=="undefined") Object.assign(window,{NADEL_GERAETE,nadelHofbuchHtml});
