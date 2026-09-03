// quirks.js - Modellfamilien-Eigenheiten fuer das Spiel LLM FARM
// Recherche-Stand: 30.08.2026. Alle Quirks real und belegt.
// Quellen: Hugging-Face-Modellkarten, offizielle Docs/Blogs (Qwen, DeepSeek, Moonshot,
// Z.ai, OpenAI, Google, Mistral, MiniMax, NVIDIA, IBM, Cohere, Ai2, Liquid, LG, TII,
// AI21, StepFun, ServiceNow, Ant/inclusionAI, Xiaomi, Kwaipilot, Upstage, Anthropic, xAI)
// sowie Community (r/LocalLLaMA, Hacker News, LMArena, EQ-Bench/Spiral-Bench, Artificial Analysis).

const QUIRKS = {
  qwen: {
    temp: "0,6 Denken / 0,7 Instruct (Qwen3); ab 3.8: 1,0 im Denkmodus",
    q: [
      { n: "Greedy-Falle", z: "🔁", txt: "Die Qwen3-Modellkarte warnt wörtlich vor Greedy-Decoding im Denkmodus: Es drohen Leistungsabfall und endlose Wiederholungen; dagegen hilft presence_penalty zwischen 0 und 2 (Modellkarte).", e: "repetitionsrisiko" },
      { n: "Denk-Vielschreiber", z: "📜", txt: "Qwen empfiehlt offiziell 32.768 Token Ausgabebudget, für harte Aufgaben 38.912 – die Denkblöcke werden lang; bei Qwen3.5 widersprachen sich sogar die README-Empfehlungen zu den Samplern (Modellkarte/HF-Diskussion).", e: "redselig" }
    ]
  },
  deepseek: {
    temp: "0,6 (R1-Klassiker); API-Tabelle: 0,0 Code bis 1,5 Kreativ",
    q: [
      { n: "Endlos-Gruebler", z: "🌀", txt: "R1 verbrannte in einer Messung 619 Token für die Frage nach 1+2 – ideal wären 17; Overthinking-Schleifen mit über 2.000 Denk-Token sind dokumentiert (Paper/Community).", e: "redselig" },
      { n: "Kalt-Coder", z: "🧊", txt: "DeepSeek empfiehlt in der API-Doku fürs Coden Temperatur 0,0 und riet bei R1 historisch sogar vom System-Prompt ab – alles gehört in die User-Nachricht (API-Doku/Modellkarte).", e: "kaltstabil" }
    ]
  },
  kimi: {
    temp: "0,6 (K2) / 1,0 (K3, top_p 0,95)",
    q: [
      { n: "Kein Schmeichler", z: "🗿", txt: "K2 gilt in der Community als erfrischend unschmeichelhaft und hält im Spiral-Bench (EQ-Bench) bei Wahnideen dagegen, statt zu nicken (Community/Benchmark).", e: "direkt" },
      { n: "Marathon-Agent", z: "🔗", txt: "K2 Thinking bleibt laut Moonshot über 200 bis 300 sequenzielle Tool-Aufrufe stabil; K3 (2,8 Bio. Parameter, 1 Mio. Kontext) denkt immer – abschalten lässt sich das nicht (Modellkarte/Repo).", e: "agentenausdauer" }
    ]
  },
  glm: {
    temp: "1,0 (Standard, top_p 0,95 – nie beides gleichzeitig tunen)",
    q: [
      { n: "Denk-Schalter", z: "🎛️", txt: "Hybridmodell mit schaltbarem Denkmodus (enable_thinking); Z.ai rät ausdrücklich, entweder Temperatur oder top_p zu justieren, nie beides (Doku).", e: "denkbudget" },
      { n: "Coding-Plan-Ass", z: "🛠️", txt: "GLM-5 (744B, 40B aktiv) erreicht 77,8 Prozent auf SWE-bench Verified; der GLM Coding Plan ist Zhipus offene Kampfansage an Claude Code (Blog/Presse).", e: "agentenausdauer" }
    ]
  },
  gptoss: {
    temp: "1,0 (Community-Konsens; offiziell keine Sampler-Angabe)",
    q: [
      { n: "Fakten-Fatamorgana", z: "🎭", txt: "Zum Start maßen Tester bei gpt-oss-120b 78,2 Prozent Halluzinationsrate auf SimpleQA und 49,1 auf PersonQA – die Community sprach von Benchmark-Illusion (Messungen/Community).", e: "wissensluecke" },
      { n: "Drei-Gaenge-Denker", z: "🎚️", txt: "Reasoning-Effort low, medium oder high wird per System-Prompt gesetzt; ohne das Harmony-Format arbeitet das Modell laut OpenAI schlicht nicht korrekt (Modellkarte).", e: "denkbudget" },
      /* Ära 7.5 (T-17): "hitzeempfindlich" gab es nur einmal im ganzen Katalog (exaone) – die
         Krankheitsursache "zu heisse Einstellung" war damit unerreichbar. Ergaenzt bei den drei
         Familien, fuer die dokumentierte Faktenschwaeche den Zusammenhang belegt. */
      { n: "Heisser Kopf", z: "🌡️", txt: "Der Faktensockel ist duenn – 78,2 Prozent Halluzinationsrate auf SimpleQA stehen in der eigenen Model Card. Wer die Temperatur ueber den ueblichen Standardwert 1,0 hinaus anhebt, bekommt darum nicht mehr Kreativitaet, sondern mehr frei erfundene Details (Model Card/Community).", e: "hitzeempfindlich" }
    ]
  },
  gemma: {
    temp: "1,0 (top_k 64, top_p 0,95 – Empfehlung des Gemma-Teams)",
    q: [
      { n: "Uebervorsichtig", z: "🛡️", txt: "Gemma lehnt mitunter harmlose Profi-Anfragen ab – GitHub-Issues und Nutzerberichte dokumentieren übertriebene Vorsicht bei legitimen, aber heiklen Themen (Community/GitHub).", e: "sicherheitsstreng" },
      { n: "Sprachtalent mit Spar-Trick", z: "🌍", txt: "Gemma 4 beherrscht über 140 Sprachen und versteht – anders als die ersten Gemma-Generationen – ausdrücklich eine Systemrolle; die kleinen E-Modelle tragen dank Per-Layer-Embeddings 5,1 bzw. 8 Mrd. Parameter gesamt, wirken effektiv aber nur wie 2,3 bzw. 4,5 Mrd. (Modellkarte).", e: "hoeflich" }
    ]
  },
  mistral: {
    temp: "0,15 (Small/Devstral!) / 0,7 (Magistral)",
    q: [
      { n: "Eiskalt praezise", z: "❄️", txt: "Mistral empfiehlt für Devstral und Small offiziell Temperatur 0,15 – ungewöhnlich frostig; Devstral schafft damit 53,6 Prozent auf SWE-bench Verified (Modellkarte).", e: "kaltstabil" },
      { n: "Endlosschleifen-Historie", z: "♾️", txt: "Small 3.1 hing in 2,11 Prozent der Antworten in Endlos-Generierungen; erst Version 3.2 drückte die Rate auf 1,29 Prozent (Release Notes).", e: "repetitionsrisiko" }
    ]
  },
  llama: {
    temp: "0,6 (top_p 0,9 – Metas generation_config)",
    q: [
      { n: "Arena-Affaere", z: "🏟️", txt: "Meta schickte eine getunte Experimentalversion von Llama 4 Maverick in die LMArena (Elo 1417); das öffentliche Modell fiel auf Platz 32, LMArena verschärfte die Regeln (Presse, April 2025).", e: "selbstlob" },
      { n: "Solides Arbeitstier", z: "🦙", txt: "Metas eigene generation_config setzt seit Llama 3 auf gemütliche 0,6/0,9 – die Klassiker laufen auch kühl stabil, ganz ohne Denkmodus-Zicken (Repo/Community).", e: "kaltstabil" }
    ]
  },
  phi: {
    temp: "keine offizielle Empfehlung",
    q: [
      { n: "Lehrbuch ohne Lexikon", z: "📚", txt: "Phi-4 lernte stark aus synthetischen Lehrbuch-Daten und patzt bei Weltwissen: SimpleQA 3,0 gegenüber 39,4 bei GPT-4o – steht so in der eigenen Modellkarte (Modellkarte).", e: "wissensluecke" },
      { n: "Benchmark-Streber", z: "🎯", txt: "MATH 80,4 mit nur 14B Parametern – doch die Community wirft der Phi-Reihe seit Jahren Benchmaxxing vor: Testwerte top, Alltag durchwachsen (Community).", e: "selbstlob" },
      /* Ära 7.5 (T-17): "hitzeempfindlich" gab es nur einmal im ganzen Katalog (exaone) – die
         Krankheitsursache "zu heisse Einstellung" war damit unerreichbar. Ergaenzt bei den drei
         Familien, fuer die dokumentierte Faktenschwaeche den Zusammenhang belegt. */
      { n: "Ohne Lexikon heiss", z: "🌡️", txt: "Microsoft nennt fuer die Phi-Reihe keine offizielle Sampler-Empfehlung, und durch das synthetische Lehrbuch-Training fehlt Weltwissen (SimpleQA 3,0 gegenueber 39,4 bei GPT-4o). Genau diese Luecken fuellt das Modell bei hoher Temperatur besonders bereitwillig mit Erfundenem – Tester raten zu niedrigen Werten (Modellkarte/Community).", e: "hitzeempfindlich" }
    ]
  },
  minimax: {
    temp: "1,0 (top_p 0,95, top_k 40 – offiziell)",
    q: [
      { n: "Denkblock-Pfleger", z: "🧵", txt: "Interleaved Thinking: M2/M3 denken zwischen Tool-Aufrufen; die think-Blöcke müssen in der Historie bleiben, sonst bricht laut Modellkarte die Leistung ein (Modellkarte).", e: "werkzeugdisziplin" },
      { n: "Millionen-Kontext", z: "🌐", txt: "M3 (Mai 2026) hält 1 Mio. Token Kontext; dank Sparse Attention kostet ein Token dort nur ein Zwanzigstel des Rechenaufwands des Vorgängers (Blog).", e: "kontextfest" }
    ]
  },
  muse: {
    temp: "1,0 (top_p 0,95, top_k 64)",
    q: [
      { n: "DFlash-Turbo", z: "⚡", txt: "Der mitgelieferte DFlash-Drafter rät ganze 16-Token-Blöcke voraus: 3,1-fach schneller auf der RTX 5090, 1,8-fach auf dem M5 Max (Modellkarte/InfoQ).", e: "onDeviceFlink" },
      { n: "Werkzeug-Purist", z: "🧰", txt: "Auf Werkzeugaufrufe und Fehlerbehebung trainiert: 75,5 Prozent im MCP-Atlas, Denkstärke in vier Stufen bis xhigh regelbar (Modellkarte).", e: "werkzeugdisziplin" }
    ]
  },
  hunyuan: {
    temp: "keine Angabe; Steuerung via /think und /no_think",
    q: [
      { n: "Hase und Igel", z: "🐇", txt: "Hunyuan-A13B (80B, 13B aktiv) wechselt zwischen schnellem und langsamem Denken; /think und /no_think schalten um, Standard ist gründlich – bei 256K Kontext nativ (Repo).", e: "denkbudget" }
    ]
  },
  ernie: {
    temp: "keine offizielle Empfehlung",
    q: [
      { n: "Wissens-Oeffnung", z: "📖", txt: "Baidu stellte im Juni 2025 gleich 10 ERNIE-4.5-Varianten von 0,3B bis 424B unter Apache 2.0 frei; der Name steht seit Version 1 für Wissensintegration (Presse/HF).", e: "grounding" }
    ]
  },
  nemotron: {
    temp: "0,6/0,95 (Denken an) – greedy (Denken aus)",
    q: [
      { n: "Klartext-Schalter", z: "🔀", txt: "Der Denkmodus wird wortwörtlich per System-Prompt detailed thinking on/off umgelegt; an heißt 0,6/0,95, aus heißt Greedy-Decoding (Modellkarte).", e: "denkbudget" }
    ]
  },
  granite: {
    temp: "keine offizielle Empfehlung",
    q: [
      { n: "Zertifizierter Buerohengst", z: "🏛️", txt: "IBM ist der erste Open-Model-Anbieter mit ISO/IEC-42001-Zertifikat für das KI-Managementsystem der Granite-Familie; Granite 4.0 wird zudem kryptografisch signiert (IBM-Ankündigung).", e: "buerotauglich" }
    ]
  },
  cohere: {
    temp: "0,3 (API-Standard)",
    q: [
      { n: "Fussnoten-Fanatiker", z: "📎", txt: "Command A (111B) liefert im RAG-Modus Zitate mit Quell-Spans direkt im Text – die Citation-Modi fast und accurate sind offizielles API-Feature (Doku).", e: "grounding" }
    ]
  },
  olmo: {
    temp: "keine offizielle Empfehlung",
    q: [
      { n: "Glaeserne Werkstatt", z: "🔬", txt: "OLMo 3 veröffentlicht den kompletten Model Flow: alle Checkpoints, Trainingscode und das 9,3-Billionen-Token-Korpus Dolma 3 – von null nachtrainierbar (Ai2-Blog).", e: "transparent" }
    ]
  },
  smol: {
    temp: "0,6 (top_p 0,95, beide Modi)",
    q: [
      { n: "Taschen-Denker", z: "🐜", txt: "Nur 3B, aber per /think und /no_think umschaltbar; empfohlen sind 0,6/0,95 in beiden Modi, sechs Sprachen offiziell (Modellkarte).", e: "onDeviceFlink" }
    ]
  },
  lfm: {
    temp: "0,3 (min_p 0,15, repetition_penalty 1,05)",
    q: [
      { n: "CPU-Sprinter", z: "📱", txt: "Liquid AI misst für LFM2 doppelt so schnelles Decode und Prefill auf CPUs wie Qwen3 – ein Hybrid aus Konvolutions- und Attention-Blöcken für die Edge (Modellkarte).", e: "onDeviceFlink" }
    ]
  },
  internlm: {
    temp: "keine offizielle Empfehlung",
    q: [
      { n: "Laborkittel-Modell", z: "🧪", txt: "Intern-S1 (235B MoE plus Vision-Encoder) wurde auf 5 Bio. Token nachtrainiert, davon über 2,5 Bio. aus der Wissenschaft – Spezialist für Chemie, Material- und Lebenswissenschaften (Repo/Paper).", e: "grounding" }
    ]
  },
  exaone: {
    temp: "0,6/0,95 (Denken) / unter 0,6 (ohne Denken)",
    q: [
      { n: "Mag es kuehl", z: "🔂", txt: "LG empfiehlt ohne Denkmodus ausdrücklich Temperaturen unter 0,6 – darüber sinkt die Leistung; gegen Textzerfall rät die Karte zu presence_penalty 1,5 (Modellkarte).", e: "hitzeempfindlich" }
    ]
  },
  falcon: {
    temp: "keine offizielle Empfehlung",
    q: [
      { n: "Hybrid-Flieger", z: "🪶", txt: "Falcon-H1 schaltet Attention- und Mamba-2-Köpfe parallel und trägt so bis zu 256K Kontext – vom 0,5B-Winzling bis zum 34B-Modell (Tech-Report).", e: "kontextfest" }
    ]
  },
  jamba: {
    temp: "keine offizielle Empfehlung",
    q: [
      { n: "Ehrliche Laenge", z: "📏", txt: "Jamba 1.5 war laut RULER-Benchmark das einzige offene Modell, dessen 256K Kontext auch effektiv 256K trägt – SSM-Transformer-Hybrid sei Dank (AI21/Paper).", e: "kontextfest" }
    ]
  },
  stepfun: {
    temp: "keine offizielle Empfehlung",
    q: [
      { n: "Sparsamer Riese", z: "🪜", txt: "Step-3 (321B, 38B aktiv) trennt per Attention-FFN-Disaggregation die Rechenlast: bis 4.039 Token/s pro GPU und günstigeres Decoding als DeepSeek-V3 (Paper).", e: "denkbudget" }
    ]
  },
  apriel: {
    temp: "keine offizielle Empfehlung",
    q: [
      { n: "Ein-GPU-Wunder", z: "🖥️", txt: "Apriel-1.5-15B-Thinker erreicht 52 Punkte im Artificial-Analysis-Index – Niveau von DeepSeek-R1-0528, aber mindestens zehnmal kleiner und auf einer einzigen GPU lauffähig (Paper/AA).", e: "onDeviceFlink" }
    ]
  },
  ling: {
    temp: "keine offizielle Empfehlung",
    q: [
      { n: "Blitz ohne Gruebeln", z: "💡", txt: "Ling-1T (1 Bio. Parameter, ca. 50B aktiv, MIT-Lizenz) ist bewusst ein Nicht-Denker und holt trotzdem 70,42 Prozent im AIME 2025 – ganz ohne Denk-Token (Blog/Presse).", e: "knapp" }
    ]
  },
  mimo: {
    temp: "keine offizielle Empfehlung",
    q: [
      { n: "Fruehreifes Reasoning", z: "🚀", txt: "MiMo-7B wurde schon im Pretraining (25 Bio. Token, Multi-Token-Prediction) aufs Denken gezüchtet und übertrifft laut Xiaomi o1-mini bei Mathe und Code (Paper).", e: "denkbudget" }
    ]
  },
  ornith: {
    temp: "keine offizielle Angabe",
    q: [
      { n: "Eigenlob-Zahlen", z: "🐦", txt: "Alle Ornith-Benchmarks stammen aus dem eigenen Harness von DeepReinforce, ohne unabhängige SWE-bench-Verifizierung; die Community entlarvte die meisten Größen als Qwen-3.5/3.6-Finetunes (HN/Community).", e: "selbstlob" },
      { n: "Halluzinations-Elan", z: "🪄", txt: "Im reinen Chat ohne Tools bescheinigten Tester dem Modell wörtlich Begeisterung fürs Halluzinieren; das versprochene 31B-Modell blieb lange ohne Gewichte (HN).", e: "wissensluecke" },
      /* Ära 7.5 (T-17): "hitzeempfindlich" gab es nur einmal im ganzen Katalog (exaone) – die
         Krankheitsursache "zu heisse Einstellung" war damit unerreichbar. Ergaenzt bei den drei
         Familien, fuer die dokumentierte Faktenschwaeche den Zusammenhang belegt. */
      { n: "Hitze-Fantast", z: "🌡️", txt: "Eine offizielle Temperatur-Empfehlung gibt es fuer die Ornith-Reihe gar nicht, und schon im Standardbetrieb faellt die Erfindungsfreude auf. Wer den Regler hochdreht, verstaerkt genau diese Schwaeche – bei einem Modell ohne eigene Sampler-Doku ist das ein Blindflug (HN/Community).", e: "hitzeempfindlich" }
    ]
  },
  kat: {
    temp: "keine offizielle Empfehlung",
    q: [
      { n: "RL-Handwerker", z: "🐈", txt: "KAT-Dev-32B löst 62,4 Prozent auf SWE-bench Verified (Top 5 der offenen Modelle); der große Bruder KAT-Coder schafft 73,4 – trainiert mit skaliertem Agentic RL (Repo/Report).", e: "werkzeugdisziplin" }
    ]
  },
  upstage: {
    temp: "keine offizielle Empfehlung",
    q: [
      { n: "Koreas Klassenbester", z: "☀️", txt: "Solar Pro 2 holt mit nur 31B Parametern 58 Punkte im Artificial-Analysis-Index und schlägt dort GPT-4.1 – besonders stark auf Koreanisch (AA/Upstage).", e: "hoeflich" }
    ]
  },
  anthropic: {
    temp: "1,0 (Standard); Denktiefe via effort/budget statt Temperatur",
    q: [
      { n: "Denk-Buchhalter", z: "🧠", txt: "Extended Thinking lief über budget_tokens (Minimum 1.024; über 32.000 rät Anthropic zu Batch-Verarbeitung); neuere Claudes denken adaptiv mit effort-Stufen (Doku).", e: "denkbudget" },
      { n: "Denken zwischen Tools", z: "🔧", txt: "Interleaved Thinking – Nachdenken zwischen Tool-Aufrufen – stammt aus dem Claude-Kosmos; die Denkblöcke sollen dabei erhalten bleiben (Doku).", e: "werkzeugdisziplin" }
    ]
  },
  openai: {
    temp: "Reasoning-Modelle: Temperatur gesperrt, Steuerung via reasoning_effort",
    q: [
      { n: "Verkehrspolizist", z: "🚦", txt: "GPT-5 ist ein System mit Echtzeit-Router zwischen Schnell- und Denkmodell; seit 5.1 passen Instant und Thinking ihre Denktiefe adaptiv der Aufgabe an (OpenAI-Blog).", e: "denkbudget" },
      { n: "Werkzeug-Wanderer", z: "🖇️", txt: "GPT-5.5 bewirbt OpenAI ausdrücklich damit, über Software und Tools hinweg zu arbeiten, bis die Aufgabe fertig ist (OpenAI-Blog).", e: "werkzeugdisziplin" }
    ]
  },
  google: {
    temp: "1,0 (Standard)",
    q: [
      { n: "Bibliotheks-Gedaechtnis", z: "🌌", txt: "Gemini Pro nimmt seit 2.5 eine Million Token Kontext am Stück – ganze Codebasen oder Aktenberge in einem Rutsch (Doku).", e: "kontextfest" },
      { n: "Stufen-Denker", z: "📊", txt: "thinking_level regelt die Denktiefe von minimal bis high; ganz abschalten lässt sich das Denken bei den meisten Geminis nicht – bezahlt wird es mit (Doku).", e: "denkbudget" }
    ]
  },
  xai: {
    temp: "keine offizielle Empfehlung",
    q: [
      { n: "Wuerziger Rebell", z: "🌶️", txt: "xAI bewarb Grok von Anfang an damit, auch die pikanten Fragen zu beantworten, die andere Systeme abwimmeln – Understatement klingt anders (xAI-Ankündigung).", e: "direkt" },
      { n: "Token-Diaet", z: "✂️", txt: "Grok 4 Fast denkt mit rund 40 Prozent weniger Reasoning-Token als Grok 4, hält 2 Mio. Token Kontext und war laut Artificial Analysis Preis-Leistungs-Champion (xAI/AA).", e: "denkbudget" }
    ]
  }
};

const WISSEN_QUIRKS = [
  {
    kat: "modelle",
    t: "Sampler sind kein Deko-Regler",
    txt: "Qwen3 warnt in der Modellkarte ausdrücklich vor Greedy-Decoding im Denkmodus: Es drohen endlose Wiederholungen. Offiziell empfohlen sind 0,6/0,95 (Denken) bzw. 0,7/0,8 (Instruct) plus presence_penalty bis 2 gegen Schleifen. Ab Qwen3.8 gilt im Denkmodus sogar Temperatur 1,0 – Empfehlungen altern schnell."
  },
  {
    kat: "modelle",
    t: "Ohne Harmony kein gpt-oss",
    txt: "OpenAIs offene Modelle gpt-oss-120b und -20b (Apache 2.0, August 2025) wurden ausschließlich auf das Harmony-Antwortformat trainiert – ohne dieses Format arbeiten sie laut Modellkarte schlicht nicht korrekt. Die Denktiefe wird per Reasoning-Effort low/medium/high im System-Prompt gesetzt."
  },
  {
    kat: "modelle",
    t: "Gemma und die Systemrolle",
    txt: "Bis Gemma 3 kannte das Chat-Format offiziell nur die Rollen user und model – Anweisungen wanderten in die erste User-Nachricht. Gemma 4 unterstützt die Systemrolle dagegen ausdrücklich. Das Gemma-Team empfiehlt weiterhin Temperatur 1,0 mit top_k 64 und top_p 0,95; fremde Templates blind zu recyceln geht trotzdem schief – jede Generation hat ihr eigenes Format."
  },
  {
    kat: "modelle",
    t: "Coder-Modelle moegen es kalt",
    txt: "Mistral empfiehlt für Devstral und Small offiziell Temperatur 0,15, DeepSeeks API-Doku fürs Coden sogar 0,0 – Kreativtexte sollen dort dagegen mit 1,5 laufen. Falsche Hitze kostet messbar: Mistral Small 3.1 hing noch in 2,11 Prozent der Antworten in Endlosschleifen, Version 3.2 senkte die Rate auf 1,29 Prozent."
  },
  {
    kat: "modelle",
    t: "Denken kostet Token",
    txt: "Reasoning verbrennt schnell das Zwei- bis Zehnfache an Ausgabe-Token: DeepSeek-R1 brauchte in einer Messung 619 Token für 1+2, ideal wären 17. Anthropic verlangt mindestens 1.024 Token Denkbudget und rät ab 32.000 zu Batch-Verarbeitung, Google stellt Denk-Token mit in Rechnung – Grok 4 Fast wirbt umgekehrt mit 40 Prozent weniger Denk-Token bei gleicher Leistung."
  },
  {
    kat: "modelle",
    t: "Selbstgemessene Bestwerte",
    txt: "Ornith meldete Spitzenwerte, doch alle Benchmarks stammten aus dem eigenen Harness ohne unabhängige Verifizierung – die Community entlarvte die Modelle größtenteils als Qwen-Finetunes. Das Muster ist alt: Metas Llama-4-Maverick glänzte 2025 in der LMArena als Spezial-Experimentalversion mit Elo 1417, das öffentliche Modell fiel auf Platz 32."
  }
];
