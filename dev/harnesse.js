// MODELLHOF v4 – Baustein HARNESSE (Agenten-Tools = echte Agent-CLIs/Scaffolds)
// Datenstand: Recherche August 2026. Reines JS, keine Seiteneffekte.
// aff-Schluessel: anthropic, openai, google, xai, glm, kimi, qwen, deepseek,
// gptoss, llama, mistral, gemma, minimax, phi + std (alle anderen) + klein (Modelle bis 8B).

const HARNESSE = {
  /* Ära 9: das Basis-Tool – ein einfaches offenes Agenten-Gerüst, das ab Tag 1 ohne Forschung auf jedes Tier passt */
  "hofgeschirr": {
    n: "Basis-Tool (offenes Basis-Gerüst)", maker: "Open-Source-Gemeinde", os: true, z: "🪢", lvl: 1, basis: true, mcp: false,
    tcMin: 1, abo: 0,
    aff: { anthropic: 60, openai: 60, google: 60, xai: 60, glm: 62, kimi: 62, qwen: 64, deepseek: 62,
      gptoss: 62, llama: 60, mistral: 62, gemma: 60, minimax: 60, phi: 58, std: 60, klein: 58 },
    funk: { format: "volltext", tools: true, kontext: "kompakt", overheadTok: 6, recovery: false },
    txt: "Ein einfaches offenes Agenten-Gerüst mit Werkzeugschleife, Systemanweisung und festem Ausgabeformat. Es macht aus jedem Modell einen einfachen Agenten für Mails, Formulare und Tickets. Sandbox und Prüfprotokoll fehlen; für Akten und Befunde braucht das Tier zusätzlich einen Datenschutz-Kurs.",
    lehre: "Ein Agent Harness verbindet Modell und Werkzeuge: Es fragt das Modell, führt den gewählten Aufruf aus und gibt das Ergebnis zurück. Rechte, Sandbox, Wiederholungen und Ausgabeformate unterscheiden die Agenten-Tools voneinander."
  },
  "claude-code": {
    n: "Claude Code", maker: "Anthropic", os: false, z: "🟠", lvl: 5, mcp: true,
    tcMin: 2, abo: 3, schutz: true,
    aff: { anthropic: 98, glm: 92, kimi: 85, minimax: 85, deepseek: 78, qwen: 70,
      mistral: 45, llama: 30, gptoss: 25, gemma: 25, openai: 20, google: 15, xai: 15, phi: 15,
      std: 45, klein: 15 },
    funk: { format: "sr", tools: true, kontext: "retrieval", overheadTok: 14, recovery: true },
    txt: "Anthropics umfangreiches Coding-Tool stellt Werkzeuge, ein präzises Editierformat (Suchen/Ersetzen) und Prüfschritte bereit. Modelle mit Anthropic-kompatibler Schnittstelle – etwa GLM, Kimi K oder MiniMax – lassen sich direkt anbinden. Das Abo gilt pro Installation und wird einmal täglich fällig, nicht pro Tier. Betriebswerte: Spielannahme, noch nicht vermessen.",
    lehre: "Claude Code gehört zu den umfangreicheren Agenten-Tools: Systemprompt und Werkzeugschemata kosten vor jedem Auftrag spürbar Token. Wie viel genau, schwankt je nach Version und Konfiguration; eine feste Zahl wäre Scheingenauigkeit."
  },
  "codex-cli": {
    n: "Codex CLI", maker: "OpenAI", os: true, z: "🦀", lvl: 7, mcp: true,
    tcMin: 2, abo: 0, schutz: true,
    aff: { openai: 98, gptoss: 92, qwen: 62, mistral: 50, deepseek: 45, llama: 35,
      glm: 30, gemma: 30, phi: 30, kimi: 25, minimax: 25, anthropic: 15, xai: 15, google: 10,
      std: 40, klein: 25 },
    funk: { format: "patch", tools: true, kontext: "kompakt", overheadTok: 4, recovery: true },
    txt: "OpenAIs quelloffenes Rust-Tool (Apache 2.0) arbeitet mit Patch-Diffs und vergleichsweise wenig zusätzlichem Text. Mit dem Schalter --oss bindet es lokale gpt-oss-Modelle über Ollama oder LM Studio an. Betriebswerte: Spielannahme, noch nicht vermessen.",
    lehre: "Die offenen gpt-oss-Modelle benötigen das Harmony-Antwortformat. Codex CLI unterstützt es ab Werk; grundsätzlich kann aber jedes Agenten-Tool das Format implementieren."
  },
  "antigravity": {
    n: "Antigravity CLI", maker: "Google", os: false, z: "🚀", lvl: 8, mcp: true,
    tcMin: 2, abo: 2,
    aff: { google: 97, anthropic: 80, gptoss: 70, gemma: 10, openai: 10,
      glm: 5, kimi: 5, qwen: 5, deepseek: 5, xai: 5, mistral: 5, llama: 5, minimax: 5, phi: 5,
      std: 5, klein: 5 },
    funk: { format: "gemischt", tools: true, kontext: "voll", overheadTok: 8, recovery: true },
    txt: "Googles Go-basierter Nachfolger des Gemini CLI ist per Freigabeliste vor allem auf Gemini 3.5 Flash ausgelegt. Zusätzlich werden Claude 4.6 und gpt-oss-120b unterstützt. Das Abo gilt pro Installation und wird einmal täglich fällig, nicht pro Tier. Betriebswerte: Spielannahme, noch nicht vermessen.",
    lehre: "Google hat das Gemini CLI mit 105.000 GitHub-Sternen am 18. Juni 2026 abgeschaltet – Agenten-Tools sterben schneller als Modelle."
  },
  "qwen-code": {
    n: "Qwen Code", maker: "Alibaba (Qwen)", os: true, z: "🐉", lvl: 4, mcp: true,
    tcMin: 2, abo: 0,
    aff: { qwen: 97, deepseek: 60, glm: 45, kimi: 45, openai: 45, gptoss: 45, minimax: 45, mistral: 45,
      google: 40, llama: 35, gemma: 35, anthropic: 30, xai: 30, phi: 30,
      std: 40, klein: 35 },
    funk: { format: "gemischt", tools: true, kontext: "voll", overheadTok: 7, recovery: false },
    txt: "Ein Fork des alten Gemini CLI, dessen Prompt- und Werkzeugformat auf Qwen3-Coder abgestimmt ist. Er läuft über jede OpenAI-kompatible Schnittstelle, auch lokal. Betriebswerte: Spielannahme, noch nicht vermessen.",
    lehre: "Seit dem 15. April 2026 gibt es keinen kostenlosen Qwen-OAuth-Zugang mehr – das offene Agenten-Tool blieb, das Gratisfutter nicht."
  },
  "kimi-code": {
    n: "Kimi Code CLI", maker: "Moonshot AI", os: true, z: "🌙", lvl: 6, mcp: true,
    tcMin: 2, abo: 0,
    aff: { kimi: 98, anthropic: 60, openai: 55, glm: 50, qwen: 50, deepseek: 50, minimax: 50,
      google: 40, gptoss: 40, mistral: 40, xai: 35, llama: 30, gemma: 30, phi: 25,
      std: 45, klein: 20 },
    funk: { format: "sr", tools: true, kontext: "kompakt", overheadTok: 3, recovery: false },
    txt: "Moonshots Agenten-Tool besteht aus einer einzigen Datei, steht unter MIT-Lizenz und verwendet Kimi K3 als Standardmodell. Es startet in Millisekunden und kann auch Bildschirmvideos auswerten. Früher hieß es Kimi CLI und war in Python geschrieben. Betriebswerte: Spielannahme, noch nicht vermessen.",
    lehre: "Moonshot bietet zwei Wege: das eigene Kimi Code CLI oder Claude Code über den Anthropic-kompatiblen Endpunkt api.moonshot.ai/anthropic – dasselbe Modell in zwei Agenten-Tools."
  },
  "opencode": {
    n: "OpenCode", maker: "SST / Anomaly", os: true, z: "🧰", lvl: 3, mcp: true,
    tcMin: 2, abo: 0,
    aff: { openai: 90, glm: 88, deepseek: 85, google: 85, kimi: 80, qwen: 80, minimax: 80,
      mistral: 75, anthropic: 70, xai: 70, gptoss: 60, llama: 55, gemma: 55, phi: 45,
      std: 75, klein: 35 },
    funk: { format: "gemischt", tools: true, kontext: "retrieval", overheadTok: 5, recovery: true },
    txt: "Ein besonders offenes Agenten-Tool: mehr als 75 Anbieter, rund 170.000 GitHub-Sterne und fast täglich neue Versionen. Viele Modelle lassen sich anbinden; Claude-Abos können jedoch nicht mehr zur Anmeldung verwendet werden. Betriebswerte: Spielannahme, noch nicht vermessen.",
    lehre: "Anthropic sperrte OpenCode im Januar 2026 den Claude-Abo-Login; die Community stieg auf GPT- und Gemini-Modelle als Standard um."
  },
  "crush": {
    n: "Crush", maker: "Charm", os: true, z: "💘", lvl: 4, mcp: true,
    tcMin: 2, abo: 0,
    aff: { anthropic: 88, openai: 88, google: 85, deepseek: 80, kimi: 75, qwen: 75, mistral: 75,
      glm: 70, xai: 70, minimax: 70, gptoss: 55, llama: 50, gemma: 50, phi: 45,
      std: 70, klein: 35 },
    funk: { format: "sr", tools: true, kontext: "retrieval", overheadTok: 4, recovery: false },
    txt: "Charms sorgfältig gestaltetes Terminal-Tool erlaubt Modellwechsel mitten in der Sitzung und unterstützt MCP sowie LSP. Betriebswerte: Spielannahme, noch nicht vermessen.",
    lehre: "Crush ist der geistige Nachfolger des ursprünglichen OpenCode-Projekts von Charm; der Name OpenCode wurde unabhängig davon von SST weitergeführt."
  },
  "aider": {
    n: "Aider", maker: "Paul Gauthier", os: true, z: "🤝", lvl: 3, mcp: false,
    tcMin: 0, abo: 0,
    aff: { openai: 92, deepseek: 90, google: 82, anthropic: 80, mistral: 78, xai: 75, qwen: 75,
      glm: 70, kimi: 70, minimax: 65, gptoss: 55, llama: 55, gemma: 45, phi: 40,
      std: 65, klein: 45 },
    funk: { format: "gemischt", tools: false, kontext: "kompakt", overheadTok: 2, recovery: true },
    txt: "Aider ist kein vollständig autonomer Agent, sondern ein Pair-Programming-Tool für Git-Projekte. Änderungen kommen als SEARCH/REPLACE-Blöcke oder Diffs; deshalb können auch Modelle ohne native Werkzeugaufrufe mitarbeiten. Betriebswerte: Spielannahme, noch nicht vermessen.",
    lehre: "Aider braucht keine nativen Werkzeugaufrufe: Modelle schreiben SEARCH/REPLACE-Blöcke oder Diffs als reinen Text. Das funktioniert auch mit kleineren Modellen."
  },
  "cline": {
    n: "Cline", maker: "Cline Bot Inc.", os: true, z: "🤖", lvl: 5, mcp: true,
    tcMin: 2, abo: 0,
    aff: { anthropic: 92, glm: 88, openai: 88, qwen: 85, mistral: 85, xai: 80, google: 80,
      kimi: 80, deepseek: 80, minimax: 80, llama: 45, gptoss: 45, gemma: 35, phi: 30,
      std: 60, klein: 20 },
    funk: { format: "gemischt", tools: true, kontext: "voll", overheadTok: 8, recovery: true },
    txt: "Ein weitverbreitetes Agenten-Tool für VS Code, JetBrains und weitere Editoren mit über fünf Millionen Installationen. Es verlangt zuverlässige native Werkzeugaufrufe. Betriebswerte: Spielannahme, noch nicht vermessen.",
    lehre: "Cline stellte Ende 2025 von XML-Textbefehlen auf native Werkzeugaufrufe je Modellfamilie um – rund 15 Prozent weniger Token und deutlich weniger Fehlversuche."
  },
  "kilo-code": {
    n: "Kilo Code", maker: "Kilo.ai", os: true, z: "⚖️", lvl: 5, mcp: true,
    tcMin: 2, abo: 0,
    aff: { minimax: 90, qwen: 90, anthropic: 85, openai: 85, mistral: 85, glm: 85, kimi: 85, deepseek: 85,
      google: 80, xai: 70, llama: 50, gptoss: 50, gemma: 45, phi: 35,
      std: 70, klein: 30 },
    funk: { format: "gemischt", tools: true, kontext: "voll", overheadTok: 9, recovery: true },
    txt: "Aus Roo Code und Cline zusammengezüchtet und nach dem Roo-Aus im Mai 2026 zur Auffangstation für Millionen Umsiedler geworden. Über 500 Modelle ohne Preisaufschlag. Betriebswerte: Spielannahme, noch nicht vermessen.",
    lehre: "Kilos beruehmter Vergleichstest: MiniMax M2.7 lieferte rund 90 Prozent der Qualitaet von Claude Opus 4.6 fuer etwa 7 Prozent der Kosten."
  },
  "goose": {
    n: "goose", maker: "Block / Linux Foundation", os: true, z: "🪿", lvl: 5, mcp: true,
    tcMin: 2, abo: 0, schutz: true,
    aff: { anthropic: 90, openai: 85, google: 80, deepseek: 75, qwen: 75, glm: 70, kimi: 70, mistral: 70,
      minimax: 65, xai: 60, gptoss: 55, llama: 50, gemma: 45, phi: 40,
      std: 65, klein: 30 },
    funk: { format: "sr", tools: true, kontext: "retrieval", overheadTok: 6, recovery: true },
    txt: "Die fleißige Hofgans von Block: watschelt durchs Terminal wie durch die Desktop-App und versteht sich mit über 40 Anbietern. 2026 an die Linux Foundation übergeben. Betriebswerte: Spielannahme, noch nicht vermessen.",
    lehre: "goose hat das MCP-Oekosystem mitgepraegt und kann Werkzeuge nicht nur nutzen, sondern sich selbst als MCP-Server fuer andere Agenten anbieten."
  },
  "pi": {
    n: "pi", maker: "Mario Zechner (Earendil)", os: true, z: "🥧", lvl: 4, mcp: false,
    tcMin: 1, abo: 0,
    aff: { qwen: 96, anthropic: 95, openai: 90, gptoss: 88, glm: 85, kimi: 85, google: 80,
      deepseek: 80, minimax: 80, mistral: 75, xai: 70, llama: 55, gemma: 45, phi: 40,
      std: 70, klein: 40 },
    funk: { format: "sr", tools: true, kontext: "kompakt", overheadTok: 2, recovery: false },
    txt: "Ein besonders schlankes Agenten-Tool mit nur vier Werkzeugen (read, write, edit, bash) und einem Systemprompt unter 1.000 Token. MCP und Unteragenten fehlen ab Werk, lassen sich aber nachrüsten. Der geringe Overhead spart Zeit und Token. Betriebswerte: Spielannahme, noch nicht vermessen.",
    lehre: "pi, das Agenten-Tool von Mario Zechner, hat nichts mit Pi, dem Modell von Inflection, zu tun – Tool und Modell sind getrennte Dinge."
  },
  "openhands": {
    n: "OpenHands", maker: "All Hands AI", os: true, z: "🙌", lvl: 6, mcp: true,
    tcMin: 2, abo: 0, schutz: true,
    aff: { anthropic: 95, mistral: 88, openai: 85, minimax: 80, glm: 75, kimi: 75, google: 75,
      deepseek: 75, qwen: 70, xai: 60, gptoss: 50, llama: 45, gemma: 40, phi: 35,
      std: 60, klein: 20 },
    funk: { format: "gemischt", tools: true, kontext: "voll", overheadTok: 10, recovery: true },
    txt: "OpenHands, früher OpenDevin, bietet Browser-Oberfläche, CLI und SDK. Im OpenHands Index misst das Projekt, welche Modelle in dieser Umgebung am besten arbeiten. Betriebswerte: Spielannahme, noch nicht vermessen.",
    lehre: "Mistrals Devstral wurde mit OpenHands-Umgebungen trainiert und bewertet. Das Modell kennt Editierformat, Werkzeugschema und Ablauf daher bereits aus dem Training."
  },
  "droid": {
    n: "Droid (Factory)", maker: "Factory AI", os: false, z: "🦾", lvl: 6, mcp: true,
    tcMin: 2, abo: 2,
    aff: { glm: 95, kimi: 90, minimax: 90, anthropic: 85, openai: 80, qwen: 80, deepseek: 80,
      google: 70, mistral: 65, gptoss: 60, xai: 55, llama: 45, gemma: 40, phi: 35,
      std: 65, klein: 25 },
    funk: { format: "sr", tools: true, kontext: "retrieval", overheadTok: 10, recovery: true },
    txt: "Factorys Agenten-Tool unterstützt GLM, Kimi und MiniMax über Droid Core und war zeitweise die Nummer 1 auf Terminal-Bench. Eigene Schlüssel lassen sich bis hinunter zu Ollama verwenden. Das Abo gilt pro Installation und wird einmal täglich fällig, nicht pro Tier. Betriebswerte: Spielannahme, noch nicht vermessen.",
    lehre: "Factory zeigte 2025: GLM-4.6 mit Droid schlug Claude Sonnet 4 mit Claude Code. Das Agenten-Tool beeinflusst das Ergebnis durch Werkzeuge, Editierformat und Prüfschritte, ohne die Modellgewichte zu verändern."
  },
  "vibe": {
    n: "Mistral Vibe CLI", maker: "Mistral AI", os: true, z: "🌬️", lvl: 5, mcp: true,
    tcMin: 2, abo: 0,
    aff: { mistral: 98, deepseek: 55, qwen: 55, openai: 50, glm: 50, anthropic: 45, kimi: 45,
      minimax: 45, gptoss: 45, google: 40, llama: 40, gemma: 35, xai: 35, phi: 30,
      std: 45, klein: 30 },
    funk: { format: "sr", tools: true, kontext: "kompakt", overheadTok: 5, recovery: false },
    txt: "Mistrals offenes Terminal-Tool unterstützt seit Vibe 2.0 (Januar 2026) Unteragenten und Skills. Als Standardmodelle dienen Devstral 2 und verwandte Mistral-Modelle, deren Editier- und Werkzeugformat es direkt unterstützt. Betriebswerte: Spielannahme, noch nicht vermessen.",
    lehre: "Devstral 2 erreicht 72,2 Prozent auf SWE-bench Verified mit offenen Gewichten – laut Mistral bei Alltagsaufgaben bis zu siebenmal günstiger als Claude Sonnet."
  }
};

const WISSEN_HARNESS = [
  { kat: "harness", t: "Der Werkzeug-Overhead (Harness Tax)",
    txt: "Noch vor der eigentlichen Aufgabe verbraucht ein Agenten-Tool Token für Systemprompt und Werkzeugschemata. Der Umfang unterscheidet sich stark: Messungen von 2026 fanden beim gleichen Modell und derselben Aufgabe bis zu 70-fache Unterschiede zwischen umfangreichen Tools wie Claude Code und Minimalisten wie pi. Die Overhead-Werte im Spiel sind bewusst konservative, noch nicht vermessene Spielannahmen." },
  { kat: "harness", t: "Gleiches Modell, anderes Tool",
    txt: "Terminal-Bench misst immer Modell und Agenten-Tool gemeinsam; dasselbe Modell erzielt in verschiedenen Tools verschiedene Werte. Artificial Analysis testet Modelle deshalb zusätzlich mit Terminus 2 als neutralem Referenz-Tool, damit die Ergebnisse besser vergleichbar sind." },
  { kat: "harness", t: "Auf ein anderes Agenten-Tool abgestimmt",
    txt: "Z.ai trainiert und vermarktet seine GLM-Modelle gezielt für Claude-Code-Kompatibilität. Der Anthropic-kompatible API-Endpunkt und der GLM Coding Plan (ab 18 Dollar im Monat, 2026) binden GLM-5.3 direkt an Claude Code, Cline und OpenCode an. Factory zeigte sogar, dass GLM-4.6 mit Droid Claude Sonnet 4 mit Claude Code schlug." },
  { kat: "harness", t: "Werkzeug-Dialekte",
    txt: "OpenAIs offene gpt-oss-Modelle sprechen nur das Harmony-Antwortformat; die offizielle Doku warnt, ohne Harmony arbeiten sie nicht korrekt. Sie laufen deshalb überall rund, wo Harmony sauber implementiert ist – etwa im Codex CLI (codex --oss) –, und stolpern in Agenten-Tools, die Anthropic- oder XML-artige Werkzeugaufrufe erwarten. Ein Exklusivrecht auf Harmony hat kein Agenten-Tool." },
  { kat: "harness", t: "Es geht auch ohne Werkzeugaufrufe",
    txt: "Aider verzichtet komplett auf native Werkzeugaufrufe: Die Modelle schreiben Codeänderungen als SEARCH/REPLACE-Blöcke oder Diffs in reinem Text. So können sogar Modelle ohne saubere Werkzeugaufrufe mitarbeiten – während Agenten-Tools wie Cline auf fehlerfreie native JSON-Werkzeugaufrufe angewiesen sind." },
  { kat: "harness", t: "Clines Formatwechsel",
    txt: "Ende 2025 stellte Cline von XML-Anweisungen im Prompt auf das native Format für Werkzeugaufrufe der jeweiligen Modellfamilie um. Ergebnis: weniger ungültige Antworten, parallele Werkzeugaufrufe und rund 15 Prozent weniger Token pro Anfrage – Modelle arbeiten zuverlässiger in dem Format, auf das sie trainiert wurden." },
  { kat: "harness", t: "Minimalismus gewinnt (manchmal)",
    txt: "Mario Zechners pi gibt dem Modell nur vier Werkzeuge (read, write, edit, bash) und einen Systemprompt unter 1.000 Token – kein MCP, keine Unteragenten. Databricks maß im August 2026 für pi die höchste Bestehensquote aller getesteten Agenten-Tools auf Claude Opus 4.8, bei rund dreimal weniger Kontext pro Zug als Claude Code." },
  { kat: "harness", t: "Agenten-Tool ist nicht gleich Modell",
    txt: "Das Coding-Tool pi von Mario Zechner hat nichts mit dem Chatbot-Modell Pi von Inflection AI zu tun – das läuft 2026 noch, nachdem Microsoft 2024 die Gründer abwarb. Genauso ist Codex CLI ein Agenten-Tool, während Codex-Modelle die eigentlichen Modelle sind; Kimi Code unterstützt auf Wunsch auch Modelle anderer Anbieter." },
  { kat: "harness", t: "Modelle und Tools werden gemeinsam entwickelt",
    txt: "Modelle und Agenten-Tools entwickeln sich inzwischen gemeinsam: Cognitions SWE-1.7 (das Modell in Devin) wurde aus Moonshots Kimi K2.7 als Basis trainiert, und MiniMax ließ M2.7 sein eigenes Agentengerüst mit OpenClaw in über 100 Runden selbst optimieren." },
  { kat: "harness", t: "Die grosse Konsolidierung 2026",
    txt: "In einem Jahr: Google schaltete das Gemini CLI (105.000 Sterne) für Antigravity ab, Roo Code machte im Mai dicht, Cursor kaufte und fror Continue.dev ein, Anthropic sperrte OpenCode den Claude-Abo-Zugang, und Windsurf wurde zu Devin Desktop. Agenten-Tools sterben schneller als Modelle." },
  { kat: "harness", t: "Lokale Freiheit",
    txt: "Seit Ollama v0.14 (Januar 2026) die Anthropic Messages API unterstützt, kann selbst das geschlossene Claude Code direkt lokale offene Modelle anbinden. Codex CLI schafft das mit --oss über Ollama oder LM Studio. Router-Proxys wie claude-code-router braucht man nur noch für ausgefeiltes Multi-Modell-Routing." },
  { kat: "harness", t: "Wen kuemmert das Modell?",
    txt: "Sourcegraphs Amp wechselte sein Standardmodell von Claude Opus 4.8 zu GPT-5.6 Sol und erklärte dazu: Die Frontier-Modelle seien konvergiert – was dein Ergebnis wirklich ändert, sind Schwierigkeit der Aufgabe, mitgegebener Kontext und wie genau du das Ergebnis prüfst. Keines davon ist ein Modell." },
  { kat: "harness", t: "Benchmarks altern",
    txt: "Die beliebte Aider-Polyglot-Rangliste wurde seit dem 20. November 2025 nicht mehr aktualisiert – GPT-5 (high) führt dort ewig mit 88 Prozent. Eine Bestenliste ist ein Schnappschuss eines laufenden Rennens, kein Dauerzustand." }
];

const BENCH_PAARE = [
  { harness: "codex-cli", modell: "GPT-5.6 Sol (xhigh)", wert: 89.5, bench: "Terminal-Bench 2.1" },
  { harness: "claude-code", modell: "Claude Opus 5 (max)", wert: 89.1, bench: "Terminal-Bench 2.1" },
  { harness: "terminus-2", modell: "Grok 4.6", wert: 88.4, bench: "Terminal-Bench 2.1" },
  { harness: "deepseek-harness", modell: "DeepSeek V4 Pro (0813)", wert: 87.9, bench: "Terminal-Bench 2.1" },
  { harness: "claude-code", modell: "Claude Fable 5", wert: 83.8, bench: "Terminal-Bench 2.1" },
  { harness: "codex-cli", modell: "GPT-5.5", wert: 83.1, bench: "Terminal-Bench 2.1" },
  { harness: "deepseek-harness", modell: "DeepSeek V4 Flash (0731)", wert: 82.7, bench: "Terminal-Bench 2.1" },
  { harness: "claude-code", modell: "Claude Opus 4.8", wert: 78.9, bench: "Terminal-Bench 2.1" },
  { harness: "mini-swe-agent", modell: "Claude Opus 4.5", wert: 76.8, bench: "SWE-bench Verified (bash-only)" },
  { harness: "mini-swe-agent", modell: "MiniMax M2.5", wert: 75.8, bench: "SWE-bench Verified (bash-only)" },
  { harness: "openhands", modell: "Claude Sonnet 4.5", wert: 72.0, bench: "SWE-bench Verified" },
  { harness: "openhands", modell: "Claude Fable 5", wert: 81.0, bench: "OpenHands Index" },
  { harness: "aider", modell: "GPT-5 (high)", wert: 88.0, bench: "Aider Polyglot" },
  { harness: "aider", modell: "DeepSeek V3.2-Exp", wert: 74.2, bench: "Aider Polyglot" }
];
