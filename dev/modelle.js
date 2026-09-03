// MODELLHOF v4 – Marktdaten (Stand: August 2026, recherchiert)
// Enthaelt: FAMILIEN, MODELLE, LEIHMODELLE, WISSEN_MODELLE

const FAMILIEN = {
  qwen:      {n:"Qwen",     org:"Alibaba",                 farbe:"#8e9df0", muster:"fleck",  land:"CN"},
  deepseek:  {n:"DeepSeek", org:"DeepSeek AI",             farbe:"#4dabf7", muster:"punkte", land:"CN"},
  kimi:      {n:"Kimi",     org:"Moonshot AI",             farbe:"#5f3dc4", muster:null,     land:"CN"},
  glm:       {n:"GLM",      org:"Z.ai (Zhipu)",            farbe:"#22b8cf", muster:"band",   land:"CN"},
  mistral:   {n:"Mistral",  org:"Mistral AI",              farbe:"#ff922b", muster:null,     land:"FR"},
  gemma:     {n:"Gemma",    org:"Google DeepMind",         farbe:"#69db7c", muster:"punkte", land:"US"},
  phi:       {n:"Phi",      org:"Microsoft",               farbe:"#d0bfff", muster:"punkte", land:"US"},
  gptoss:    {n:"gpt-oss",  org:"OpenAI",                  farbe:"#ced4da", muster:"band",   land:"US"},
  llama:     {n:"Llama",    org:"Meta",                    farbe:"#a5d8ff", muster:"fleck",  land:"US"},
  muse:      {n:"Muse",     org:"Meta",                    farbe:"#b197fc", muster:"fleck",  land:"US"},
  minimax:   {n:"MiniMax",  org:"MiniMax",                 farbe:"#ff6b6b", muster:"punkte", land:"CN"},
  ernie:     {n:"ERNIE",    org:"Baidu",                   farbe:"#0b7285", muster:null,     land:"CN"},
  hunyuan:   {n:"Hunyuan",  org:"Tencent",                 farbe:"#0052d9", muster:"fleck",  land:"CN"},
  granite:   {n:"Granite",  org:"IBM",                     farbe:"#64748b", muster:"band",   land:"US"},
  nemotron:  {n:"Nemotron", org:"NVIDIA",                  farbe:"#76b900", muster:null,     land:"US"},
  seed:      {n:"Seed",     org:"ByteDance",               farbe:"#99e9f2", muster:"band",   land:"CN"},
  olmo:      {n:"OLMo",     org:"Ai2 (Allen Institute)",   farbe:"#f06595", muster:null,     land:"US"},
  smol:      {n:"SmolLM",   org:"Hugging Face",            farbe:"#ffd43b", muster:"punkte", land:"US"},
  lfm:       {n:"LFM",      org:"Liquid AI",               farbe:"#c0eb75", muster:"fleck",  land:"US"},
  internlm:  {n:"InternLM", org:"Shanghai AI Lab",         farbe:"#495057", muster:"punkte", land:"CN"},
  cohere:    {n:"Command",  org:"Cohere",                  farbe:"#d6336c", muster:"band",   land:"CA"},
  exaone:    {n:"EXAONE",   org:"LG AI Research",          farbe:"#e03131", muster:"fleck",  land:"KR"},
  ling:      {n:"Ling",     org:"Ant Group (inclusionAI)", farbe:"#2f9e44", muster:"punkte", land:"CN"},
  stepfun:   {n:"Step",     org:"StepFun",                 farbe:"#ae3ec9", muster:"band",   land:"CN"},
  falcon:    {n:"Falcon",   org:"TII Abu Dhabi",           farbe:"#8d6e63", muster:null,     land:"AE"},
  apriel:    {n:"Apriel",   org:"ServiceNow",              farbe:"#e599f7", muster:"fleck",  land:"US"},
  mimo:      {n:"MiMo",     org:"Xiaomi",                  farbe:"#e8590c", muster:"band",   land:"CN"},
  ornith:    {n:"Ornith",   org:"DeepReinforce",           farbe:"#845ef7", muster:"punkte", land:"US"},
  jamba:     {n:"Jamba",    org:"AI21 Labs",               farbe:"#ffc9c9", muster:null,     land:"IL"},
  kat:       {n:"KAT",      org:"Kwaipilot (Kuaishou)",    farbe:"#5c940d", muster:"fleck",  land:"CN"},
  upstage:   {n:"Solar",    org:"Upstage",                 farbe:"#ffd8a8", muster:"punkte", land:"KR"},
  anthropic: {n:"Claude",   org:"Anthropic",               farbe:"#cc785c", muster:null,     land:"US"},
  openai:    {n:"GPT",      org:"OpenAI",                  farbe:"#10a37f", muster:null,     land:"US"},
  google:    {n:"Gemini",   org:"Google",                  farbe:"#4285f4", muster:"punkte", land:"US"},
  xai:       {n:"Grok",     org:"xAI",                     farbe:"#212529", muster:null,     land:"US"},
  cactus:    {n:"Needle",   org:"Cactus Compute",          farbe:"#5c7cfa", muster:"punkte", land:"GB"}   /* Ära 9: Nadelklasse */
};

/* ══ Ära 7.5 (T-24): Feld basis = Basis-Checkpoint. Standard ist die eigene Id; alle
   Ableitungen desselben Vortrainings teilen denselben String. mergeKompatibel soll darauf
   pruefen statt nur auf fam/pT/arch – sonst gilt Qwen3.5 27B x Qwen3.6 27B als "gleiche
   Abstammung", obwohl es zwei unabhaengige Vortrainings sind. Kinder und trainierte
   Varianten erben basis. Fuer LEIHMODELLE gilt weiterhin der Rueckfall (a.basis||a.modell).
   Ära 7.5 (T-07): fuenf Geschwistermodelle ergaenzt (gleiche fam/pT/arch/basis, andere w) –
   Base/Instruct/Coder-Varianten derselben Groesse sind genau die real merge-baren Paare. ══ */
const MODELLE = {
  // ===== NADELKLASSE (Ära 9) – ein Werkzeug-Modell in 14 MB, kein Sprachmodell im üblichen Sinn =====
  "needle2": {
    n:"Needle 2 (Nadel)", fam:"cactus", basis:"needle2", org:"Cactus Compute (London)", rel:"2026-08",
    pT:0.045, pA:0.045, moe:false, ctx:0.256, lic:"Apache-2.0", licF:true,
    vision:false, tc:2, rz:0, nadel:true, zuchtbar:false,
    w:{logik:24,code:5,wissen:4,schreiben:3,werkzeug:58,treue:48,kontext:6},   /* Logik 24: Sortieren/Klassifizieren kurzer Fälle (Mobile Actions 63,7 %), aber kein Schreiben, kein Wissen, kein langer Kontext */
    bench:[], tier:0, preis:15,
    txt:"Die Nadel: 45 Millionen Parameter in einer 14-MB-Datei, 28 MB Arbeitsspeicher, 256 Token Fenster. Sie kann genau eins – aus Text einen Werkzeugaufruf oder ein Datenfeld machen (JSON, per Grammatik erzwungen) – und das auf einem Raspberry Pi mit rund 500 Token pro Sekunde. Sie schreibt keine Texte, plaudert nicht, weiß nichts – und versteht Englisch deutlich besser als Deutsch.",
    fakt:"Needle 2 (Cactus Compute, Apache-2.0, 2026) ist ein 45-M-Parameter-Modell für Werkzeugaufrufe und strukturierte Extraktion: 14 MB Binärdatei, ≈ 28 MB Sitzungs-RAM, 256-Token-Fenster, Ausgabe ausschließlich JSON. Hersteller: 500 tok/s auf dem Raspberry Pi 5, BFCL v4 single-turn 42,6 % (93,4 % wohlgeformt), Mobile Actions 63,7 %. Quelle: huggingface.co/Cactus-Compute/needle2, github.com/cactus-compute/needle (Stand 09/2026)."
  },
  // ===== TIER 0 (bis 4 Mrd. – Ferkelklasse) =====
  "qwen35-4b": {
    n:"Qwen3.5 4B", fam:"qwen", basis:"qwen35-4b", org:"Alibaba (Qwen)", rel:"2026-03",
    pT:4, pA:4, moe:false, ctx:256, lic:"Apache-2.0", licF:true,
    vision:true, tc:2, rz:1,
    w:{logik:50,code:42,wissen:42,schreiben:54,werkzeug:55,treue:56,kontext:62},
    bench:[], tier:0, preis:300,
    txt:"Flinkes Multitalent-Ferkel: sieht Bilder, denkt auf Wunsch nach und frisst fast nichts.",
    fakt:"Die Qwen3.5-Kleinserie (0,8 bis 9 Mrd.) erschien im März 2026 und versteht Text, Bild und Video – komplett unter Apache-2.0."
  },
  "gemma4-e2b": {
    n:"Gemma 4 E2B", fam:"gemma", basis:"gemma4-e2b", org:"Google DeepMind", rel:"2026-03",
    pT:5.1, pA:5.1, pEff:2.3, moe:false, ctx:128, lic:"Apache-2.0", licF:true,
    vision:true, tc:1, rz:0,
    w:{logik:32,code:26,wissen:34,schreiben:46,werkzeug:40,treue:47,kontext:40},
    bench:[], tier:0, preis:180,
    txt:"Winziges Schweinchen fuers Handy – passt in jede Jackentasche und grunzt in 140 Sprachen.",
    fakt:"Gemma 4 wechselte im März 2026 von der restriktiven Gemma-Sonderlizenz zu Apache 2.0 – ein Kurswechsel bei Google. Das E steht fuer effektiv: 5,1 Mrd. Parameter gesamt (inkl. Per-Layer-Embeddings), 2,3 Mrd. effektiv – ein Bauprinzip, keine MoE-Auswahl."
  },
  "gemma4-e4b": {
    n:"Gemma 4 E4B", fam:"gemma", basis:"gemma4-e4b", org:"Google DeepMind", rel:"2026-03",
    pT:8, pA:8, pEff:4.5, moe:false, ctx:128, lic:"Apache-2.0", licF:true,
    vision:true, tc:1, rz:0,
    w:{logik:42,code:36,wissen:42,schreiben:53,werkzeug:44,treue:52,kontext:42},
    bench:[], tier:0, preis:240,
    txt:"Der groessere Handy-Bruder: erkennt Bilder, Video und Text, ohne den Stall zu heizen.",
    fakt:"Das E steht fuer effektiv: E4B traegt 8 Mrd. Parameter gesamt (inkl. Per-Layer-Embeddings), verhaelt sich aber wie ein 4,5-Mrd.-Modell – so trennt die offizielle Karte Gesamt und effektiv; eine MoE-Auswahl ist das nicht."
  },
  /* Ära 7.5 (T-07): Geschwister von gemma4-e4b – gleicher Basis-Checkpoint, andere Nachbehandlung. */
  "gemma4-e4b-it": {
    n:"Gemma 4 E4B IT", fam:"gemma", basis:"gemma4-e4b", org:"Google DeepMind", rel:"2026-03",
    pT:8, pA:8, pEff:4.5, moe:false, ctx:128, lic:"Apache-2.0", licF:true,
    vision:true, tc:1, rz:0,
    w:{logik:44,code:36,wissen:42,schreiben:58,werkzeug:48,treue:60,kontext:42},
    bench:[], tier:0, preis:260,
    txt:"Dasselbe Ferkel wie E4B, nur auf Anweisungen abgerichtet: hoert besser zu, plaudert huebscher, denkt kein Stueck schneller.",
    fakt:"Fast jede offene Reihe erscheint doppelt: als Grundmodell (pt) und als anweisungsabgestimmte Fassung (it). Beide stammen aus demselben Vortraining und unterscheiden sich nur in der Nachbehandlung – genau deshalb lassen sie sich verschmelzen."
  },
  "phi4-mini": {
    n:"Phi-4-mini", fam:"phi", basis:"phi4-mini", org:"Microsoft", rel:"2025-02",
    pT:4, pA:4, moe:false, ctx:128, lic:"MIT", licF:true,
    vision:false, tc:1, rz:0,
    w:{logik:45,code:34,wissen:36,schreiben:44,werkzeug:40,treue:50,kontext:50},
    bench:[], tier:0, preis:130,
    txt:"Braves Buecherschwein aus dem Vorjahr – rechnet erstaunlich gut fuer seine Groesse.",
    fakt:"Phi-4-mini hat nur 3,8 Mrd. Parameter, aber 128k Kontext – auch im Sommer 2026 noch eine Standard-Empfehlung für Laptops ohne Grafikkarte."
  },
  "smollm3-3b": {
    n:"SmolLM3 3B", fam:"smol", basis:"smollm3-3b", org:"Hugging Face", rel:"2025-07",
    pT:3, pA:3, moe:false, ctx:128, lic:"Apache-2.0", licF:true,
    vision:false, tc:1, rz:1,
    w:{logik:38,code:30,wissen:32,schreiben:42,werkzeug:40,treue:45,kontext:45},
    bench:[], tier:0, preis:100,
    txt:"Das Lehrbuch-Ferkel: klein, freundlich und mit offenem Stammbaum bis zum letzten Futterkorn.",
    fakt:"Hugging Face hat für SmolLM3 das komplette Trainingsrezept offengelegt: 11,2 Billionen Token in drei dokumentierten Phasen."
  },
  "lfm25-1b": {
    n:"LFM2.5 1.2B", fam:"lfm", basis:"lfm25-1b", org:"Liquid AI", rel:"2026-01",
    pT:1.2, pA:1.2, moe:false, ctx:32, lic:"LFM Open License", licF:true,
    vision:false, tc:1, rz:0,
    w:{logik:30,code:24,wissen:26,schreiben:38,werkzeug:40,treue:44,kontext:35},
    bench:[], tier:0, preis:150,
    txt:"Quirliges Mini-Schweinchen fuer die Hosentasche – rennt sogar auf dem Telefon-NPU.",
    fakt:"Liquid AI baut keine klassischen Transformer, sondern hybride On-Device-Architekturen – die LFM-Lizenz wird erst ab rund 10 Mio. Dollar Jahresumsatz kostenpflichtig."
  },
  "granite42-3b": {
    n:"Granite 4.2 3B", fam:"granite", basis:"granite42-3b", org:"IBM", rel:"2026-08",
    pT:3, pA:3, moe:false, ctx:131, lic:"Apache-2.0", licF:true,
    vision:false, tc:2, rz:1,
    w:{logik:44,code:40,wissen:36,schreiben:44,werkzeug:55,treue:58,kontext:48},
    bench:[], tier:0, preis:350,
    txt:"Frisch geschluepftes Buero-Ferkel von IBM: denkt auf Knopfdruck nach und haelt sich an Regeln.",
    fakt:"Granite 4.2 (August 2026) hat einen Denk-Schalter je Anfrage – und Granite war die erste offene Modellfamilie mit ISO/IEC-42001-Zertifizierung."
  },
  "falcon-h1-tiny": {
    n:"Falcon-H1-Tiny-R 0.6B", fam:"falcon", basis:"falcon-h1-tiny", org:"TII Abu Dhabi", rel:"2026-01",
    pT:0.6, pA:0.6, moe:false, ctx:32, lic:"Falcon-Lizenz (Apache-Basis)", licF:true,
    vision:false, tc:0, rz:2,
    w:{logik:30,code:20,wissen:20,schreiben:30,werkzeug:12,treue:40,kontext:42},
    bench:[], tier:0, preis:110,
    txt:"Das kleinste Gruebel-Ferkel im Katalog – denkt laut vor sich hin, obwohl es kaum wiegt.",
    fakt:"Falcon-H1 aus Abu Dhabi mischt Mamba- und Transformer-Bloecke; die Tiny-R-Version denkt schon mit 0,6 Mrd. Parametern in Ketten (Chain of Thought)."
  },
  "jamba-r-3b": {
    n:"Jamba Reasoning 3B", fam:"jamba", basis:"jamba-r-3b", org:"AI21 Labs", rel:"2025-10",
    pT:3, pA:3, moe:false, ctx:250, lic:"Apache-2.0", licF:true,
    vision:false, tc:1, rz:2,
    w:{logik:50,code:38,wissen:28,schreiben:36,werkzeug:40,treue:46,kontext:60},
    bench:[], tier:0, preis:170,
    txt:"Zaehes kleines Denk-Schwein mit Riesenspeicher – kaut auch lange Dokumente klaglos durch.",
    fakt:"Jamba nutzt eine SSM-Transformer-Hybridarchitektur (Mamba) und schafft rund 250k Kontext bei etwa 35 Token pro Sekunde auf einem MacBook."
  },
  "exaone4-1b": {
    n:"EXAONE 4.0 1.2B", fam:"exaone", basis:"exaone4-1b", org:"LG AI Research", rel:"2025-07",
    pT:1.2, pA:1.2, moe:false, ctx:64, lic:"EXAONE-Lizenz (nicht kommerziell)", licF:false, nc:true,
    vision:false, tc:1, rz:1,
    w:{logik:36,code:28,wissen:26,schreiben:36,werkzeug:42,treue:44,kontext:40},
    bench:[], tier:0, preis:85,
    txt:"Suesses Schnaeppchen-Ferkel aus Korea – darf aber nur im Hobbystall arbeiten, nicht auf Kundschaft.",
    fakt:"Die EXAONE-4.0-Lizenz von LG verbietet kommerzielle Nutzung – erst der Nachfolger K-EXAONE 2.0 (750 Mrd., Juli 2026) wechselte zu Apache 2.0."
  },

  // ===== TIER 1 (7–16 Mrd. – Jungschweine) =====
  "qwen35-9b": {
    n:"Qwen3.5 9B", fam:"qwen", basis:"qwen35-9b", org:"Alibaba (Qwen)", rel:"2026-03",
    pT:9, pA:9, moe:false, ctx:256, lic:"Apache-2.0", licF:true,
    vision:true, tc:2, rz:1,
    w:{logik:58,code:52,wissen:50,schreiben:60,werkzeug:62,treue:62,kontext:66},
    bench:[], tier:1, preis:880,
    txt:"Der Allrounder fuer die 8-GB-Weide: sieht, denkt und plaudert in 201 Sprachen.",
    fakt:"Alle Qwen3.5-Groessen teilen dieselbe multimodale Basis mit 256k Kontext, per YaRN auf rund 1 Mio. Token dehnbar."
  },
  /* Ära 7.5 (T-07): Geschwister von qwen35-9b – gleicher Basis-Checkpoint, Code-Nachtraining. */
  "qwen35-9b-coder": {
    n:"Qwen3.5-Coder 9B", fam:"qwen", basis:"qwen35-9b", org:"Alibaba (Qwen)", rel:"2026-05",
    pT:9, pA:9, moe:false, ctx:256, lic:"Apache-2.0", licF:true,
    vision:false, tc:2, rz:1,
    w:{logik:60,code:66,wissen:44,schreiben:50,werkzeug:68,treue:60,kontext:66},
    bench:[], tier:1, preis:940,
    txt:"Der Schmied der Familie: baut aus derselben Grundlage wie der 9B-Allrounder, hat aber monatelang nur Quelltext gefressen.",
    fakt:"Qwen veroeffentlicht seine Coder-Reihen als Weitertraining derselben Basis – Fachkoennen kommt dazu, Weltwissen und Schreibstil bleiben etwas zurueck. Das ist der klassische Tauschhandel jedes Spezialisierungs-Laufs."
  },
  "granite42-8b": {
    n:"Granite 4.2 8B", fam:"granite", basis:"granite42-8b", org:"IBM", rel:"2026-08",
    pT:8, pA:8, moe:false, ctx:131, lic:"Apache-2.0", licF:true,
    vision:false, tc:2, rz:1,
    w:{logik:56,code:52,wissen:44,schreiben:52,werkzeug:62,treue:66,kontext:55},
    bench:[], tier:1, preis:950,
    txt:"Zuverlaessiges Arbeitsschwein in Anzugqualitaet – frisch aus dem August-Wurf 2026.",
    fakt:"IBM trainierte die groesseren Granite-4.2-Modelle per Reinforcement Learning in echten Software- und Terminal-Umgebungen."
  },
  /* Ära 7.5 (T-07): Geschwister von granite42-8b – gleicher Basis-Checkpoint, Wachhund-Nachtraining. */
  "granite42-8b-guardian": {
    n:"Granite 4.2 8B Guardian", fam:"granite", basis:"granite42-8b", org:"IBM", rel:"2026-08",
    pT:8, pA:8, moe:false, ctx:131, lic:"Apache-2.0", licF:true,
    vision:false, tc:1, rz:0,
    w:{logik:50,code:34,wissen:44,schreiben:44,werkzeug:40,treue:78,kontext:55},
    bench:[], tier:1, preis:780,
    txt:"Der Wachhund im Anzug: prueft Anfragen und Antworten auf Verstoesse und meldet sich, wenn etwas nicht sauber ist. Als Allrounder taugt er nicht.",
    fakt:"IBM pflegt neben den Arbeitsmodellen eine Guardian-Linie fuer Schutzgelaender – dieselbe Basis, aber auf Erkennen statt Erzeugen abgerichtet. Solche Waechtermodelle laufen draussen NEBEN dem Hauptmodell, nicht statt seiner."
  },
  "internlm3-8b": {
    n:"InternLM3 8B", fam:"internlm", basis:"internlm3-8b", org:"Shanghai AI Lab", rel:"2026-01",
    pT:8, pA:8, moe:false, ctx:32, lic:"Apache-2.0", licF:true,
    vision:false, tc:1, rz:1,
    w:{logik:52,code:44,wissen:42,schreiben:48,werkzeug:42,treue:54,kontext:44},
    bench:[], tier:1, preis:550,
    txt:"Genuegsames Studentenfutter-Schwein: gelernt wurde mit wenig, behalten hat es viel.",
    fakt:"InternLM3 wurde mit nur 4 Billionen Trainings-Token auf Augenhoehe mit Konkurrenten gebracht – über 75 Prozent geringere Trainingskosten."
  },
  "phi4-rv-15b": {
    n:"Phi-4-reasoning-vision 15B", fam:"phi", basis:"phi4-rv-15b", org:"Microsoft", rel:"2026-03",
    pT:15, pA:15, moe:false, ctx:128, lic:"MIT", licF:true,
    vision:true, tc:1, rz:1,
    w:{logik:68,code:54,wissen:46,schreiben:50,werkzeug:44,treue:58,kontext:52},
    bench:[], tier:1, preis:800,
    txt:"Brillentragendes Denker-Schwein, das auch Diagramme lesen kann – Mathe ist sein Lieblingsacker.",
    fakt:"Phi-4-reasoning-vision (März 2026) entscheidet selbst, wann sich langes Nachdenken lohnt – das spart Denk-Token bei einfachen Fragen."
  },
  "apriel15-thinker": {
    n:"Apriel-1.5 15B Thinker", fam:"apriel", basis:"apriel15-thinker", org:"ServiceNow", rel:"2025-10",
    pT:15, pA:15, moe:false, ctx:128, lic:"MIT", licF:true,
    vision:false, tc:2, rz:2,
    w:{logik:62,code:50,wissen:42,schreiben:46,werkzeug:58,treue:60,kontext:50},
    bench:[], tier:1, preis:640,
    txt:"Buerokraten-Schwein mit Doktorhut: arbeitet Tickets ab, ohne zu murren.",
    fakt:"Apriel-1.5-15B-Thinker liefert laut ServiceNow Frontier-nahe Logik auf einer einzigen GPU und nutzt Vortrainingsdaten aus NVIDIAs Nemotron-Programm."
  },
  "falcon-h1r-7b": {
    n:"Falcon H1R 7B", fam:"falcon", basis:"falcon-h1r-7b", org:"TII Abu Dhabi", rel:"2026-01",
    pT:7, pA:7, moe:false, ctx:256, lic:"Falcon-Lizenz (Apache-Basis)", licF:true,
    vision:false, tc:1, rz:2,
    w:{logik:60,code:44,wissen:36,schreiben:42,werkzeug:40,treue:52,kontext:58},
    bench:[], tier:1, preis:580,
    txt:"Wuesten-Renner mit Gruebelgen: klein, aber im Kopfrechnen kaum zu schlagen.",
    fakt:"Laut TII schlaegt Falcon H1R 7B Reasoning-Modelle mit zwei- bis siebenfacher Groesse – dank Mamba-Transformer-Hybridarchitektur."
  },
  "mistral-7b": {
    n:"Mistral 7B (Oldtimer)", fam:"mistral", basis:"mistral-7b", org:"Mistral AI", rel:"2023-09",
    pT:7, pA:7, moe:false, ctx:32, lic:"Apache-2.0", licF:true,
    vision:false, tc:1, rz:0,
    w:{logik:30,code:28,wissen:30,schreiben:40,werkzeug:40,treue:40,kontext:30},
    bench:[], tier:1, preis:400,
    txt:"Der rostige Traktor unter den Schweinen – laeuft und laeuft, aber Wunder darf man keine erwarten.",
    fakt:"Mistral 7B schlug 2023 das doppelt so grosse Llama-2-13B und machte Sliding-Window-Attention beruehmt – ein Stueck Open-Source-Geschichte."
  },
  /* Ära 7.5 (T-07): Geschwister von mistral-7b – gleicher Basis-Checkpoint, Instruct-Nachbehandlung. */
  "mistral-7b-instruct": {
    n:"Mistral 7B Instruct (Oldtimer)", fam:"mistral", basis:"mistral-7b", org:"Mistral AI", rel:"2023-12",
    pT:7, pA:7, moe:false, ctx:32, lic:"Apache-2.0", licF:true,
    vision:false, tc:1, rz:0,
    w:{logik:32,code:28,wissen:30,schreiben:46,werkzeug:42,treue:50,kontext:30},
    bench:[], tier:1, preis:430,
    txt:"Der Oldtimer, dem man Manieren beigebracht hat: haelt sich an Anweisungen, bleibt sonst genauso langsam wie sein Bruder.",
    fakt:"Mistral 7B erschien als Grundmodell und als Instruct-Fassung aus demselben Vortraining. Weil beide dieselben Tensorformen haben, waren sie 2024 eines der meistgemergten Paare der offenen Szene."
  },
  "llama31-8b": {
    n:"Llama 3.1 8B (Oldtimer)", fam:"llama", basis:"llama31-8b", org:"Meta", rel:"2024-07",
    pT:8, pA:8, moe:false, ctx:128, lic:"Llama Community License", licF:true,
    vision:false, tc:1, rz:0,
    w:{logik:36,code:32,wissen:38,schreiben:44,werkzeug:40,treue:45,kontext:44},
    bench:[], tier:1, preis:420,
    txt:"Das beruehmteste Gebrauchtschwein der Welt – Millionen Hoefe haben mit ihm angefangen.",
    fakt:"Die Llama-Lizenz verlangt ab 700 Mio. Monatsnutzern eine Sondererlaubnis von Meta – fuer normale Hoefe ist sie aber frei."
  },
  /* Ära 7.5 (T-07): Geschwister von llama31-8b – gleicher Basis-Checkpoint, Code-Nachtraining. */
  "llama31-8b-code": {
    n:"Llama 3.1 8B Code (Oldtimer)", fam:"llama", basis:"llama31-8b", org:"Meta (Community-Feintuning)", rel:"2024-09",
    pT:8, pA:8, moe:false, ctx:128, lic:"Llama Community License", licF:true,
    vision:false, tc:1, rz:0,
    w:{logik:38,code:46,wissen:34,schreiben:38,werkzeug:44,treue:44,kontext:44},
    bench:[], tier:1, preis:450,
    txt:"Ein Gebrauchtschwein, das in der Werkstatt gross geworden ist: mehr Quelltext im Kopf, dafuer weniger Weltwissen.",
    fakt:"Steht stellvertretend fuer die vielen Code-Feintunings von Llama 3.1 8B, die die Community veroeffentlicht hat. Metas eigenes Code Llama stammt uebrigens noch von Llama 2 ab – ein anderer Basis-Checkpoint, deshalb NICHT mit diesem Tier verschmelzbar."
  },
  "ornith15-9b": {
    n:"Ornith-1.5 9B", fam:"ornith", basis:"ornith15-9b", org:"DeepReinforce", rel:"2026-08",
    pT:9, pA:9, moe:false, ctx:128, lic:"MIT", licF:true,
    vision:false, tc:2, rz:1,
    w:{logik:56,code:58,wissen:38,schreiben:42,werkzeug:60,treue:50,kontext:50},
    bench:[], tier:1, preis:850,
    txt:"Junges Wildschwein aus dem Hype-Gehege: schreibt sich sein Training angeblich selbst.",
    fakt:"Ornith-Modelle erzeugen im Training eigene Aufgaben und Lehrplaene (Self-Improving RL) – unabhaengig bestaetigte Benchmarks fehlen aber noch."
  },
  "ds-r1-distill-14b": {
    n:"R1-Distill-Qwen 14B (Oldtimer)", fam:"deepseek", basis:"ds-r1-distill-14b", org:"DeepSeek AI", rel:"2025-01",
    pT:14, pA:14, moe:false, ctx:32, lic:"MIT", licF:true,
    vision:false, tc:0, rz:2,
    w:{logik:70,code:48,wissen:40,schreiben:38,werkzeug:10,treue:45,kontext:40},
    bench:[{n:"AIME 2024", w:"69,7 %"}], tier:1, preis:480,
    txt:"Gruebelt wie ein Grosser, stolpert aber ueber jeden Werkzeugkasten – ein Kind des R1-Fiebers.",
    fakt:"DeepSeek destillierte Anfang 2025 die Denkspuren von R1 in kleine Qwen-Schueler – Wissenstransfer per Training (Distillation), nicht per Kopie."
  },

  // ===== TIER 2 (20–49 Mrd. – Hofklasse) =====
  "qwen38-27b": {
    n:"Qwen3.8 27B", fam:"qwen", basis:"qwen38-27b", org:"Alibaba (Qwen)", rel:"2026-08",
    pT:28, pA:28, moe:false, ctx:262, lic:"Apache-2.0", licF:true,
    vision:true, tc:3, rz:1,
    w:{logik:82,code:91,wissen:84,schreiben:75,werkzeug:85,treue:73,kontext:72},
    bench:[{n:"WebDev-Arena", w:"1595 Elo"},{n:"AA-Intelligenz-Index", w:"52"}], tier:2, preis:2600,
    txt:"Der Star der Saison: ein 17-GB-Schwein, das sich mit den ganz Grossen anlegt.",
    fakt:"Qwen3.8-27B erschien am 14. August 2026 und erreicht 1595 Elo in der WebDev-Arena – nur vier Punkte hinter dem 27-mal groesseren GLM-5.3."
  },
  "qwen36-27b": {
    n:"Qwen3.6 27B", fam:"qwen", basis:"qwen36-27b", org:"Alibaba (Qwen)", rel:"2026-04",
    pT:27, pA:27, moe:false, ctx:262, lic:"Apache-2.0", licF:true,
    vision:true, tc:2, rz:1,
    w:{logik:76,code:86,wissen:82,schreiben:70,werkzeug:74,treue:70,kontext:66},
    bench:[{n:"AA-Reasoning", w:"38"}], tier:2, preis:1950,
    txt:"Das Lieblingsschwein der Heim-Agenten-Szene: passt bei Q4 bequem auf einen 32-GB-Mac.",
    fakt:"Qwen3.6-27B ist bei Quantisierung Q4_K_M nur 16,8 GB gross – der Community-Standard fuer lokale OpenClaw-Agenten. Seine Feedforward-Schichten sind dicht, die Attention mischt Gated DeltaNet mit Gated Attention – dense/MoE und linearer Attention-Anteil sind zwei getrennte Bau-Achsen."
  },
  "qwen35-27b": {
    n:"Qwen3.5 27B", fam:"qwen", basis:"qwen35-27b", org:"Alibaba (Qwen)", rel:"2026-02",
    pT:27, pA:27, moe:false, ctx:262, lic:"Apache-2.0", licF:true,
    vision:true, tc:2, rz:1,
    w:{logik:74,code:85,wissen:82,schreiben:68,werkzeug:72,treue:68,kontext:64},
    bench:[{n:"SWE-bench Verified", w:"72,4 %"},{n:"MMLU-Pro", w:"86,1"}], tier:2, preis:1650,
    txt:"Solides Frueh-2026-Schwein: zwei Wuerfe alt, aber immer noch erstaunlich fleissig.",
    fakt:"Qwen3.5-27B schafft 72,4 % auf SWE-bench Verified – ein Wert, der Anfang 2025 noch als Frontier galt."
  },
  "qwen35-35b-a3b": {
    n:"Qwen3.5 35B-A3B", fam:"qwen", basis:"qwen35-35b-a3b", org:"Alibaba (Qwen)", rel:"2026-02",
    pT:35, pA:3, moe:true, ctx:262, lic:"Apache-2.0", licF:true,
    vision:true, tc:2, rz:1,
    w:{logik:70,code:80,wissen:78,schreiben:66,werkzeug:70,treue:64,kontext:64},
    bench:[], tier:2, preis:1500,
    txt:"Sprinter-Schwein mit Expertenrudel im Bauch: rennt wie ein Kleines, denkt wie ein Mittleres.",
    fakt:"Als MoE-Modell (Mixture of Experts) aktiviert es pro Token nur 3 von 35 Mrd. Parametern – alle Experten muessen aber im Speicher liegen."
  },
  "muse-glimmer-30b": {
    n:"Muse Glimmer 30B", fam:"muse", basis:"muse-glimmer-30b", org:"Meta", rel:"2026-08",
    pT:30, pA:30, moe:false, ctx:131, lic:"Apache-2.0", licF:true,
    vision:true, tc:3, rz:1,
    w:{logik:68,code:76,wissen:62,schreiben:72,werkzeug:86,treue:74,kontext:60},
    bench:[{n:"AA-Intelligenz-Index", w:"35"}], tier:2, preis:2400,
    txt:"Metas Comeback-Schwein: gezuechtet fuer den Dauerdienst als Hausagent, mit eingebautem Vorleser.",
    fakt:"Muse Glimmer ist Metas erstes Modell unter Apache 2.0; sein DFlash-Entwurfsmodell (spekulatives Dekodieren) hebt das Tempo auf einer RTX 5090 von 75 auf 233 Token/s."
  },
  "gemma4-31b": {
    n:"Gemma 4 31B", fam:"gemma", basis:"gemma4-31b", org:"Google DeepMind", rel:"2026-03",
    pT:31, pA:31, moe:false, ctx:256, lic:"Apache-2.0", licF:true,
    vision:true, tc:2, rz:1,
    w:{logik:72,code:74,wissen:78,schreiben:80,werkzeug:62,treue:70,kontext:68},
    bench:[{n:"WebDev-Arena", w:"1364 Elo"}], tier:2, preis:1850,
    txt:"Gepflegtes Vorzeige-Schwein aus gutem Hause: hoeflich, vielsprachig und bildsicher.",
    fakt:"Gemma 4 spricht ueber 140 Sprachen und erbt per Destillation Wissen aus den grossen Gemini-Modellen."
  },
  "granite42-30b": {
    n:"Granite 4.2 30B", fam:"granite", basis:"granite42-30b", org:"IBM", rel:"2026-08",
    pT:29, pA:29, moe:false, ctx:131, lic:"Apache-2.0", licF:true,
    vision:false, tc:3, rz:1,
    w:{logik:70,code:76,wissen:58,schreiben:60,werkzeug:78,treue:82,kontext:58},
    bench:[{n:"SWE-bench Verified", w:"57,0 %"}], tier:2, preis:2250,
    txt:"Das Beamten-Schwein: nicht das schnellste, aber es haelt jede Vorschrift und faellt nie um.",
    fakt:"Granite 4.2-30B lernte per Reinforcement Learning in echten Terminal-, Web- und Software-Umgebungen und erreicht 57 % auf SWE-bench Verified."
  },
  "nemotron35-lightning": {
    n:"Nemotron 3.5 Lightning", fam:"nemotron", basis:"nemotron35-lightning", org:"NVIDIA", rel:"2026-08",
    pT:30, pA:3, moe:true, ctx:1000, lic:"NVIDIA Open Model License", licF:true,
    vision:false, tc:2, rz:1,
    w:{logik:60,code:62,wissen:50,schreiben:55,werkzeug:74,treue:66,kontext:80},
    bench:[{n:"AA-Intelligenz-Index", w:"24"},{n:"Ausgabetempo", w:"291 Token/s"}], tier:2, preis:2100,
    txt:"Blitz-Schwein mit Mamba-Genen: rennt schneller als jedes andere offene Tier im Stall.",
    fakt:"Nemotron 3.5 Lightning (30B-A3B, Mamba-2-Hybrid) ist mit 291 Token/s das schnellste getrackte offene Modell im August 2026 – gebaut als Ausfuehrungs-Arbeitstier fuer Agenten."
  },
  "ornith15-35b": {
    n:"Ornith-1.5 35B-A3B", fam:"ornith", basis:"ornith15-35b", org:"DeepReinforce", rel:"2026-08",
    pT:36, pA:3, moe:true, ctx:128, lic:"MIT", licF:true,
    vision:false, tc:2, rz:1,
    w:{logik:66,code:80,wissen:45,schreiben:48,werkzeug:72,treue:56,kontext:55},
    bench:[], tier:2, preis:2150,
    txt:"Wildschwein mit grossen Spruechen: laeuft wie ein 3B und will coden wie ein Riese.",
    fakt:"Ornith bewirbt fuer die 1.5-Familie Terminal-Bench-Werte auf Opus-Niveau – alle Zahlen stammen bisher aus Eigenmessungen des Herstellers."
  },
  "olmo3-32b-think": {
    n:"OLMo 3 32B Think", fam:"olmo", basis:"olmo3-32b-think", org:"Ai2 (Allen Institute)", rel:"2025-11",
    pT:32, pA:32, moe:false, ctx:66, lic:"Apache-2.0", licF:true,
    vision:false, tc:1, rz:2,
    w:{logik:68,code:60,wissen:55,schreiben:58,werkzeug:42,treue:62,kontext:45},
    bench:[], tier:2, preis:1250,
    txt:"Das glaeserne Schwein: man darf ihm beim Denken zusehen – bis in den letzten Futtertrog.",
    fakt:"OLMo 3 liefert Trainingsdaten, Code, Checkpoints und Logs komplett mit – jede Denkspur laesst sich bis zu den Daten zurueckverfolgen (Fully Open)."
  },
  "devstral-small-2": {
    n:"Devstral Small 2 24B", fam:"mistral", basis:"devstral-small-2", org:"Mistral AI", rel:"2025-12",
    pT:24, pA:24, moe:false, ctx:256, lic:"Apache-2.0", licF:true,
    vision:true, tc:3, rz:0,
    w:{logik:58,code:78,wissen:45,schreiben:48,werkzeug:80,treue:62,kontext:62},
    bench:[], tier:2, preis:1450,
    txt:"Franzoesisches Handwerker-Schwein: kein Smalltalk, aber der Werkzeugkasten sitzt.",
    fakt:"Devstral Small 2 wurde fuer Code-Agenten gebaut, nimmt laut offizieller Karte auch Bild-Eingaben an (etwa Screenshots und UI-Mockups) und passt komplett auf eine einzelne RTX 4090 oder einen 32-GB-Mac."
  },
  "seed-oss-36b": {
    n:"Seed-OSS 36B", fam:"seed", basis:"seed-oss-36b", org:"ByteDance", rel:"2025-08",
    pT:36, pA:36, moe:false, ctx:512, lic:"Apache-2.0", licF:true,
    vision:false, tc:1, rz:1,
    w:{logik:62,code:58,wissen:52,schreiben:54,werkzeug:48,treue:58,kontext:78},
    bench:[], tier:2, preis:1150,
    txt:"Geduldiges Lese-Schwein: verdaut halbe Bibliotheken am Stueck, ohne zu ruelpsen.",
    fakt:"Seed-OSS-36B bietet 512k Kontext nativ und ein einstellbares Denkbudget – ByteDances groesstes offenes Textmodell, die Seed-2-Flaggschiffe bleiben zu."
  },
  "gptoss-20b": {
    n:"gpt-oss-20b", fam:"gptoss", basis:"gptoss-20b", org:"OpenAI", rel:"2025-08",
    pT:21, pA:4, moe:true, ctx:131, lic:"Apache-2.0", licF:true,
    vision:false, tc:2, rz:1,
    w:{logik:64,code:64,wissen:48,schreiben:56,werkzeug:66,treue:60,kontext:55},
    bench:[], tier:2, preis:1100,
    txt:"Das beruehmte Namensschild-Schwein: alle wollten mal streicheln, inzwischen ist es guenstig.",
    fakt:"gpt-oss-20b laeuft dank MXFP4-Quantisierung in rund 16 GB Speicher – bis heute hat OpenAI keinen Nachfolger der gpt-oss-Reihe gebracht."
  },
  "kat-coder-v25": {
    n:"KAT-Coder-V2.5-Dev", fam:"kat", basis:"kat-coder-v25", org:"Kwaipilot (Kuaishou)", rel:"2026-07",
    pT:35, pA:3, moe:true, ctx:262, lic:"Apache-2.0", licF:true,
    vision:false, tc:3, rz:1,
    w:{logik:62,code:82,wissen:42,schreiben:44,werkzeug:80,treue:58,kontext:60},
    bench:[], tier:2, preis:1750,
    txt:"Sandkasten-erprobtes Coder-Schwein: hat Werkzeugnutzung nicht gelesen, sondern geuebt.",
    fakt:"KAT-Coder-V2.5-Dev baut auf Qwen3.6-35B-A3B auf und lernte per RL in echten Sandbox-Repositories – die Pro-Version bleibt API-only."
  },
  "qwen25-coder-32b": {
    n:"Qwen2.5-Coder 32B (Oldtimer)", fam:"qwen", basis:"qwen25-coder-32b", org:"Alibaba (Qwen)", rel:"2024-11",
    pT:32, pA:32, moe:false, ctx:128, lic:"Apache-2.0", licF:true,
    vision:false, tc:2, rz:0,
    w:{logik:55,code:64,wissen:45,schreiben:45,werkzeug:58,treue:55,kontext:50},
    bench:[{n:"HumanEval", w:"92,7 %"}], tier:2, preis:1000,
    txt:"Der treue alte Hofschmied: schmiedet brav Funktionen, kennt aber keine modernen Agenten-Tricks.",
    fakt:"Qwen2.5-Coder-32B war 2024/25 der Liebling der Selbstbau-Szene: 92,7 % auf HumanEval, lauffaehig auf einer gebrauchten 700-Euro-GPU."
  },
  "ernie45-21b": {
    n:"ERNIE 4.5 21B-A3B", fam:"ernie", basis:"ernie45-21b", org:"Baidu", rel:"2025-06",
    pT:21, pA:3, moe:true, ctx:131, lic:"Apache-2.0", licF:true,
    vision:false, tc:1, rz:0,
    w:{logik:52,code:48,wissen:50,schreiben:52,werkzeug:45,treue:54,kontext:55},
    bench:[], tier:2, preis:1000,
    txt:"Bescheidenes Baidu-Schwein aus dem grossen 2025er Wurf – der letzte offene seiner Linie.",
    fakt:"Baidu oeffnete 2025 die ERNIE-4.5-Familie unter Apache 2.0, doch die staerkeren Nachfolger ERNIE 5.0 und 5.1 blieben geschlossen."
  },

  // ===== TIER 3 (50–130 Mrd. – Grossvieh) =====
  "gptoss-120b": {
    n:"gpt-oss-120b", fam:"gptoss", basis:"gptoss-120b", org:"OpenAI", rel:"2025-08",
    pT:117, pA:5, moe:true, ctx:131, lic:"Apache-2.0", licF:true,
    vision:false, tc:2, rz:1,
    w:{logik:72,code:78,wissen:62,schreiben:62,werkzeug:72,treue:66,kontext:56},
    bench:[{n:"AA-Intelligenz-Index", w:"24"}], tier:3, preis:2800,
    txt:"Ehrwuerdiger Ami-Eber: einst Sensation, heute solide Mittelklasse mit beruehmtem Stammbaum.",
    fakt:"gpt-oss-120b war 2025 OpenAIs erste offene Modellreihe seit GPT-2 und laeuft nativ in MXFP4 auf einer einzelnen 80-GB-GPU."
  },
  "mistral-medium-35": {
    n:"Mistral Medium 3.5", fam:"mistral", basis:"mistral-medium-35", org:"Mistral AI", rel:"2026-04",
    pT:128, pA:128, moe:false, ctx:256, lic:"Modified MIT (Umsatzgrenze)", licF:true,
    vision:true, tc:3, rz:1,
    w:{logik:80,code:92,wissen:74,schreiben:82,werkzeug:84,treue:76,kontext:74},
    bench:[{n:"SWE-bench Verified", w:"77,6 %"}], tier:3, preis:6200,
    txt:"Die franzoesische eierlegende Wollmilchsau: denkt, codet und plaudert in einem Tier.",
    fakt:"Mistral Medium 3.5 verschmolz im April 2026 die Speziallinien Magistral (Denken) und Devstral (Code) zu einem Modell mit einstellbarem Denkaufwand."
  },
  "qwen35-122b": {
    n:"Qwen3.5 122B-A10B", fam:"qwen", basis:"qwen35-122b", org:"Alibaba (Qwen)", rel:"2026-02",
    pT:122, pA:10, moe:true, ctx:262, lic:"Apache-2.0", licF:true,
    vision:true, tc:2, rz:1,
    w:{logik:80,code:86,wissen:85,schreiben:76,werkzeug:75,treue:72,kontext:72},
    bench:[{n:"WebDev-Arena", w:"1358 Elo"}], tier:3, preis:4900,
    txt:"Grosser Sanftmut-Eber fuer die 96-GB-Weide: viel Wissen, wenig Appetit dank Expertenrudel.",
    fakt:"Mit 122 Mrd. Gesamt- und nur 10 Mrd. aktiven Parametern rechnet dieses MoE-Modell etwa so guenstig wie ein 10B – bei deutlich mehr Koennen."
  },
  "qwen3-coder-next": {
    n:"Qwen3-Coder-Next 80B", fam:"qwen", basis:"qwen3-coder-next", org:"Alibaba (Qwen)", rel:"2026-02",
    pT:80, pA:3, moe:true, ctx:256, lic:"Apache-2.0", licF:true,
    vision:false, tc:3, rz:0,
    w:{logik:66,code:84,wissen:55,schreiben:50,werkzeug:85,treue:64,kontext:70},
    bench:[], tier:3, preis:3600,
    txt:"Coder-Eber mit Turbogang: 80 Mrd. Hirn, aber nur 3 Mrd. muessen gleichzeitig rennen.",
    fakt:"Qwen3-Coder-Next aktiviert nur 3 von 80 Mrd. Parametern und ist auf lokale Coding-Agenten wie Qwen Code zugeschnitten."
  },
  "ling3-flash": {
    n:"Ling-3.0-flash", fam:"ling", basis:"ling3-flash", org:"Ant Group (inclusionAI)", rel:"2026-08",
    pT:124, pA:5, moe:true, ctx:1000, lic:"MIT", licF:true,
    vision:false, tc:2, rz:1,
    w:{logik:78,code:80,wissen:68,schreiben:62,werkzeug:76,treue:66,kontext:82},
    bench:[{n:"AA-Reasoning", w:"38"}], tier:3, preis:5400,
    txt:"Effizienz-Wunder aus dem Ameisenbau: frisst wie ein Ferkel, zieht wie ein Ochse.",
    fakt:"Ling-3.0-flash (124B-A5B) mischt Kimi-Delta-Attention und klassische Attention 5:1 und schlaegt laut Ant auf vielen Benchmarks das eigene 1-Billionen-Flaggschiff."
  },
  "nemotron3-super": {
    n:"Nemotron 3 Super", fam:"nemotron", basis:"nemotron3-super", org:"NVIDIA", rel:"2026-07",
    pT:120, pA:12, moe:true, ctx:1000, lic:"NVIDIA Open Model License", licF:true,
    vision:false, tc:2, rz:1,
    w:{logik:74,code:76,wissen:62,schreiben:58,werkzeug:78,treue:68,kontext:80},
    bench:[], tier:3, preis:4600,
    txt:"Gruener Zugochse mit Mamba-Muskulatur: gebaut, um Agentenherden zu dirigieren.",
    fakt:"Die Nemotron-3-Familie (Nano, Super, Ultra) nutzt Mamba-Transformer-Hybride – Super traegt 120 Mrd. Parameter, aktiviert aber nur 12."
  },
  "devstral2-123b": {
    n:"Devstral 2 123B", fam:"mistral", basis:"devstral2-123b", org:"Mistral AI", rel:"2025-12",
    pT:123, pA:123, moe:false, ctx:256, lic:"Modified MIT (Umsatzgrenze)", licF:true,
    vision:false, tc:3, rz:0,
    w:{logik:70,code:89,wissen:58,schreiben:52,werkzeug:86,treue:68,kontext:70},
    bench:[{n:"SWE-bench Verified", w:"72,2 %"}], tier:3, preis:3900,
    txt:"Kraeftiger Zimmermanns-Eber vom Dezember-Markt – vom eigenen Nachwuchs schon fast eingeholt.",
    fakt:"Devstral 2 hielt im Dezember 2025 mit 72,2 % auf SWE-bench Verified den Open-Source-Rekord und kam mit der eigenen CLI Mistral Vibe."
  },
  "jamba2-mini": {
    n:"Jamba2 Mini 52B", fam:"jamba", basis:"jamba2-mini", org:"AI21 Labs", rel:"2026-01",
    pT:52, pA:12, moe:true, ctx:256, lic:"Jamba Open Model License", licF:true,
    vision:false, tc:2, rz:0,
    w:{logik:58,code:54,wissen:60,schreiben:68,werkzeug:66,treue:84,kontext:78},
    bench:[], tier:3, preis:3000,
    txt:"Das ehrliche Schwein: erfindet nichts dazu, haelt sich an die Heuballen, die man ihm gibt.",
    fakt:"Jamba2 fuehrt Grounding- und Instruktionstreue-Rankings an – gebaut gegen Halluzinationen, bewusst ohne Denkmodus."
  },

  // ===== TIER 4 (200–500 Mrd. MoE – Bullenklasse) =====
  "glm53-flash": {
    n:"GLM-5.3-Flash", fam:"glm", basis:"glm53-flash", org:"Z.ai (Zhipu)", rel:"2026-08",
    pT:320, pA:18, moe:true, ctx:1000, lic:"MIT", licF:true,
    vision:true, tc:3, rz:1,
    w:{logik:86,code:90,wissen:80,schreiben:78,werkzeug:88,treue:76,kontext:84},
    bench:[{n:"AA-Intelligenz-Index", w:"57"},{n:"Text-Arena", w:"1469 Elo"}], tier:4, preis:15000,
    txt:"Der Preis-Leistungs-Koenig vom 26. August: sieht Bilder und Videos und rennt trotzdem wie ein Junges.",
    fakt:"GLM-5.3-Flash (320B-A18B, nativ multimodal, 1 Mio. Kontext) erschien unter MIT und gilt als bestes Intelligenz-pro-Euro-Angebot des Sommers 2026."
  },
  "minimax-m3": {
    n:"MiniMax M3", fam:"minimax", basis:"minimax-m3", org:"MiniMax", rel:"2026-06",
    pT:428, pA:23, moe:true, ctx:1000, lic:"MIT", licF:true,
    vision:true, tc:3, rz:1,
    w:{logik:82,code:93,wissen:74,schreiben:70,werkzeug:86,treue:72,kontext:86},
    bench:[{n:"SWE-bench Verified", w:"80,5 %"},{n:"AA-Intelligenz-Index", w:"45"}], tier:4, preis:11000,
    txt:"Shanghaier Sparfuchs-Bulle: frisst Millionen-Token-Heuballen, ohne die Futterkasse zu sprengen.",
    fakt:"MiniMax M3 haelt dank MSA (MiniMax Sparse Attention) 1 Mio. Token Kontext bezahlbar und schafft 80,5 % auf SWE-bench Verified."
  },
  "qwen35-397b": {
    n:"Qwen3.5 397B-A17B", fam:"qwen", basis:"qwen35-397b", org:"Alibaba (Qwen)", rel:"2026-02",
    pT:397, pA:17, moe:true, ctx:256, lic:"Apache-2.0", licF:true,
    vision:true, tc:2, rz:1,
    w:{logik:84,code:88,wissen:87,schreiben:78,werkzeug:78,treue:74,kontext:70},
    bench:[{n:"WebDev-Arena", w:"1399 Elo"}], tier:4, preis:8800,
    txt:"Ehemaliger Zuchtbulle des Fruehjahrs: immer noch maechtig, aber vom 3.8er Wurf ueberholt.",
    fakt:"Qwen3.5-397B-A17B wurde im Februar 2026 als kleinste offene Opus-Klasse gefeiert – hybride lineare Attention plus sparsames MoE."
  },
  "ds-v4-flash": {
    n:"DeepSeek V4-Flash (0731)", fam:"deepseek", basis:"ds-v4-flash", org:"DeepSeek AI", rel:"2026-07",
    pT:304, pA:13, moe:true, ctx:1000, lic:"MIT", licF:true,
    vision:false, tc:3, rz:1,
    w:{logik:85,code:93,wissen:82,schreiben:72,werkzeug:84,treue:74,kontext:84},
    bench:[{n:"SWE-bench Verified (Flash-Max)", w:"79,0 %"}], tier:4, preis:12500,
    txt:"Das Volksschwein der Cloud-Hoefe: ueberall im Einsatz, weil Leistung und Futterpreis stimmen.",
    fakt:"DeepSeek V4-Flash ist mit ueber 4 Mio. Downloads das meistgeladene Grossmodell auf Hugging Face – die Denk-Tiefe laesst sich per reasoning_effort regeln."
  },
  "step37-flash": {
    n:"Step 3.7 Flash", fam:"stepfun", basis:"step37-flash", org:"StepFun", rel:"2026-05",
    pT:198, pA:11, moe:true, ctx:262, lic:"Apache-2.0", licF:true,
    vision:true, tc:3, rz:1,
    w:{logik:74,code:78,wissen:66,schreiben:64,werkzeug:82,treue:68,kontext:68},
    bench:[], tier:4, preis:7600,
    txt:"Augenmensch unter den Bullen: liest Diagramme, PDFs und App-Oberflaechen direkt vom Blatt.",
    fakt:"Step 3.7 Flash koppelt ein 196B-Sprachmodell mit einem eigenen 1,8B-Vision-Encoder und erschien direkt mit GGUF- und FP8-Gewichten."
  },
  "command-a-plus": {
    n:"Command A+", fam:"cohere", basis:"command-a-plus", org:"Cohere", rel:"2026-05",
    pT:218, pA:25, moe:true, ctx:128, lic:"Apache-2.0", licF:true,
    vision:false, tc:2, rz:1,
    w:{logik:76,code:68,wissen:70,schreiben:74,werkzeug:70,treue:86,kontext:60},
    bench:[{n:"AA-Intelligenz-Index", w:"23"}], tier:4, preis:7000,
    txt:"Kanadischer Kanzlei-Bulle: zitiert seine Quellen wie ein Notar und passt dank Zauberdiaet auf zwei Karten.",
    fakt:"Command A+ war Coheres erstes voll Apache-2.0-lizenziertes Modell – mit nativer Quellen-Zitierung und verlustfreier W4A4-Quantisierung fuer zwei H100."
  },
  "solar-open2": {
    n:"Solar Open 2 250B", fam:"upstage", basis:"solar-open2", org:"Upstage", rel:"2026-07",
    pT:250, pA:15, moe:true, ctx:1000, lic:"Offene Gewichte (Upstage)", licF:true,
    vision:false, tc:2, rz:1,
    w:{logik:76,code:78,wissen:68,schreiben:66,werkzeug:78,treue:70,kontext:84},
    bench:[{n:"AA-Intelligenz-Index", w:"37"}], tier:4, preis:8200,
    txt:"Koreanischer Sonnenbulle aus dem Staatsprogramm: gemacht fuer Bueroarbeit im Akkord.",
    fakt:"Solar Open 2 stapelt drei lineare Attention-Schichten auf je eine Softmax-Schicht – so bleibt 1 Mio. Token Kontext bezahlbar."
  },
  "mimo-v25": {
    n:"MiMo V2.5", fam:"mimo", basis:"mimo-v25", org:"Xiaomi", rel:"2026-04",
    pT:311, pA:15, moe:true, ctx:1000, lic:"MIT", licF:true,
    vision:false, tc:3, rz:1,
    w:{logik:78,code:82,wissen:70,schreiben:64,werkzeug:84,treue:68,kontext:84},
    bench:[], tier:4, preis:9500,
    txt:"Der Handyhersteller-Bulle, den keiner kommen sah – zaeh, sparsam und agentenfest.",
    fakt:"Xiaomis MiMo-V2.5 (311B-A15B, MIT) gilt als eines der effizientesten offenen Modelle fuer agentische Dauerauftraege; der grosse Bruder V2.5-Pro traegt 1 Billion Parameter."
  },

  // ===== TIER 5 (ab 600 Mrd. – Preisbullen) =====
  "glm53": {
    n:"GLM-5.3", fam:"glm", basis:"glm53", org:"Z.ai (Zhipu)", rel:"2026-08",
    pT:753, pA:40, moe:true, ctx:1000, lic:"MIT", licF:true,
    vision:false, tc:3, rz:1,
    w:{logik:90,code:95,wissen:86,schreiben:84,werkzeug:92,treue:80,kontext:86},
    bench:[{n:"AA-Intelligenz-Index", w:"60"},{n:"Text-Arena", w:"1484 Elo"}], tier:5, preis:24000,
    txt:"Der Coding-Champion unter den offenen Preisbullen – bestes offenes Tier der Text-Arena.",
    fakt:"GLM-5.3 nutzt dieselbe Basis wie GLM-5.2: Der gesamte Leistungssprung im August 2026 kam allein aus skaliertem Post-Training."
  },
  "hy4-preview": {
    n:"Hy4-preview", fam:"hunyuan", basis:"hy4-preview", org:"Tencent Hunyuan", rel:"2026-08",
    pT:770, pA:49, moe:true, ctx:1000, lic:"Apache-2.0", licF:true,
    vision:false, tc:3, rz:1,
    w:{logik:91,code:94,wissen:84,schreiben:78,werkzeug:88,treue:78,kontext:86},
    bench:[{n:"GPQA-Diamond", w:"92,3"},{n:"SWE-bench Multilingual", w:"82,9 %"}], tier:5, preis:26000,
    txt:"Der juengste Koloss im Land (28. August!): frisch, hungrig und schon ganz oben im Ranking.",
    fakt:"Tencents Hy4-preview (770B-A49B) erschien unter Apache 2.0; in Tencents Blindtest mit 163 Experten lag es hauchduenn vor GLM-5.3 und Kimi K3."
  },
  "ds-v4-pro": {
    n:"DeepSeek V4-Pro (0813)", fam:"deepseek", basis:"ds-v4-pro", org:"DeepSeek AI", rel:"2026-08",
    pT:1700, pA:49, moe:true, ctx:1000, lic:"MIT", licF:true,
    vision:false, tc:3, rz:1,
    w:{logik:92,code:95,wissen:93,schreiben:80,werkzeug:90,treue:80,kontext:88},
    bench:[{n:"SWE-bench Verified", w:"80,6 %"},{n:"Terminal-Bench 2.1", w:"87,9"}], tier:5, preis:28000,
    txt:"Der Gelehrten-Koloss: weiss fast alles und arbeitet fuer einen Bruchteil des Frontier-Futters.",
    fakt:"DeepSeek V4-Pro haelt mit 80,6 % auf SWE-bench Verified das beste offene Ergebnis und bietet drei Denkstufen (reasoning_effort: low, high, max)."
  },
  "kimi-k25": {
    n:"Kimi K2.5", fam:"kimi", basis:"kimi-k25", org:"Moonshot AI", rel:"2026-01",
    pT:1000, pA:32, moe:true, ctx:256, lic:"Modified MIT", licF:true,
    vision:true, tc:3, rz:1,
    w:{logik:84,code:88,wissen:82,schreiben:86,werkzeug:90,treue:74,kontext:74},
    bench:[{n:"AA-Reasoning", w:"36"}], tier:5, preis:16000,
    txt:"Der Schwarm-Papa: dirigiert bis zu 100 Unterferkel gleichzeitig – und schreibt dazu noch schoen.",
    fakt:"Kimi K2.5 (1T-A32B, nativ multimodal) brachte den Agent Swarm: bis zu 100 parallel arbeitende Unteragenten mit eigener Werkzeugnutzung."
  },
  "kimi-k3": {
    n:"Kimi K3", fam:"kimi", basis:"kimi-k3", org:"Moonshot AI", rel:"2026-07",
    pT:2800, pA:104, moe:true, ctx:1000, lic:"Kimi-K3-Lizenz (mod. MIT)", licF:true,
    vision:true, tc:3, rz:1,
    w:{logik:93,code:96,wissen:90,schreiben:90,werkzeug:95,treue:82,kontext:90},
    bench:[{n:"Terminal-Bench 2.1", w:"88,3"},{n:"SWE-Marathon", w:"42,0"}], tier:5, preis:34000,
    txt:"Das Kronjuwel des Marktes: ein 2,8-Billionen-Koloss, der die geschlossenen Champions das Fuerchten lehrt.",
    fakt:"Kimi K3 traegt 2,8 Billionen Parameter, aktiviert aber pro Token nur 104 Mrd. (16 von 896 Experten) – und schlaegt Claude Fable 5 auf Terminal-Bench 2.1."
  },
  "qwen38-2400b": {
    n:"Qwen3.8 2.4T-A95B", fam:"qwen", basis:"qwen38-2400b", org:"Alibaba (Qwen)", rel:"2026-08",
    pT:2400, pA:95, moe:true, ctx:1000, lic:"Qwen3.8-Max-Lizenz (mod. MIT)", licF:true,
    vision:false, tc:3, rz:1,
    w:{logik:92,code:94,wissen:92,schreiben:86,werkzeug:88,treue:80,kontext:88},
    bench:[{n:"AA-Intelligenz-Index", w:"58"}], tier:5, preis:30000,
    txt:"Alibabas offengelegter Riesenbulle – zum ersten Mal darf die Max-Klasse mit nach Hause.",
    fakt:"Qwen3.8-2.4T-A95B ist das erste offen gewichtete Modell der Qwen-Max-Klasse; die offene Fassung versteht allerdings nur Text."
  }
};

const LEIHMODELLE = {
  "claude-opus-5": {
    n:"Claude Opus 5", fam:"anthropic", org:"Anthropic", rel:"2026-07",
    api:true, inTok:5.0, outTok:25.0, limitMtok:40, ftOk:false,
    ctx:1000, lic:"proprietaer (API)", licF:false,
    vision:true, tc:3, rz:1,
    w:{logik:97,code:97,wissen:95,schreiben:93,werkzeug:97,treue:93,kontext:92},
    bench:[{n:"SWE-bench Verified", w:"96,0 %"}], tier:5, preis:0,
    txt:"Das Leih-Superschwein schlechthin: loest fast jedes Ticket – jeder Denk-Token kostet aber bares Geld.",
    fakt:"Claude Opus 5 (24. Juli 2026) fuehrt SWE-bench Verified mit 96 % an; adaptives Denken ist standardmaessig an und wird als Ausgabe-Token abgerechnet."
  },
  "claude-sonnet-5": {
    n:"Claude Sonnet 5", fam:"anthropic", org:"Anthropic", rel:"2026-06",
    api:true, inTok:2.0, outTok:10.0, limitMtok:120, ftOk:false,
    ctx:1000, lic:"proprietaer (API)", licF:false,
    vision:true, tc:3, rz:1,
    w:{logik:92,code:94,wissen:88,schreiben:90,werkzeug:94,treue:90,kontext:88},
    bench:[], tier:4, preis:0,
    txt:"Das Arbeitspferd aus der Anthropic-Remise: fast Opus-Kraft zum Bruchteil der Futterkosten.",
    fakt:"Claude Sonnet 5 (30. Juni 2026) startete zu 2/10 Dollar je Mio. Token – die geplante Preiserhoehung zum 1. September wurde abgesagt."
  },
  "claude-haiku-45": {
    n:"Claude Haiku 4.5", fam:"anthropic", org:"Anthropic", rel:"2025-10",
    api:true, inTok:1.0, outTok:5.0, limitMtok:300, ftOk:false,
    ctx:200, lic:"proprietaer (API)", licF:false,
    vision:true, tc:3, rz:1,
    w:{logik:80,code:82,wissen:72,schreiben:80,werkzeug:84,treue:82,kontext:74},
    bench:[], tier:3, preis:0,
    txt:"Flinkes Leih-Ferkel fuer Massenarbeit: schnell, hoeflich und selten daneben.",
    fakt:"Claude Haiku 4.5 kostet 1/5 Dollar je Mio. Token und erledigt Aufgaben, fuer die 2024 noch Frontier-Modelle noetig waren."
  },
  "gpt56-sol": {
    n:"GPT-5.6 Sol", fam:"openai", org:"OpenAI", rel:"2026-07",
    api:true, inTok:4.0, outTok:20.0, limitMtok:50, ftOk:false,
    ctx:1050, lic:"proprietaer (API)", licF:false,
    vision:true, tc:3, rz:1,
    w:{logik:96,code:95,wissen:94,schreiben:88,werkzeug:95,treue:90,kontext:88},
    bench:[], tier:5, preis:0,
    txt:"OpenAIs Flaggschiff-Leihbulle: brillanter Kopf, und seit dem August-Rabatt sogar etwas guenstiger.",
    fakt:"GPT-5.6 Sol kostet regulaer 5/30 Dollar je Mio. Token; seit dem 24. August 2026 gilt zeitlich befristet ein Aktionspreis von 4/20 Dollar – Cache- und Langkontext-Tarife gibt es ebenfalls, im Spiel vereinfacht weggelassen."
  },
  "gpt56-terra": {
    n:"GPT-5.6 Terra", fam:"openai", org:"OpenAI", rel:"2026-07",
    api:true, inTok:2.0, outTok:12.0, limitMtok:150, ftOk:false,
    ctx:1050, lic:"proprietaer (API)", licF:false,
    vision:true, tc:3, rz:1,
    w:{logik:90,code:91,wissen:88,schreiben:84,werkzeug:90,treue:86,kontext:84},
    bench:[], tier:4, preis:0,
    txt:"Die goldene Mitte im GPT-Stall: fast Sol-Niveau, halber Preis – das Alltags-Arbeitstier der Familie.",
    fakt:"Die GPT-5.6-Familie (Sol, Terra, Luna) wurde am 9. Juli 2026 allgemein verfuegbar; Terras Preis fiel Ende Juli um 20 Prozent – Fine-Tuning bietet OpenAI laut Features-Tabelle fuer die 5.6-Reihe nicht an."
  },
  "gpt56-luna": {
    n:"GPT-5.6 Luna", fam:"openai", org:"OpenAI", rel:"2026-07",
    api:true, inTok:0.2, outTok:1.2, limitMtok:400, ftOk:false,
    ctx:1050, lic:"proprietaer (API)", licF:false,
    vision:true, tc:3, rz:1,
    w:{logik:78,code:78,wissen:74,schreiben:76,werkzeug:80,treue:76,kontext:78},
    bench:[], tier:2, preis:0,
    txt:"Der Cent-Artikel unter den Leihschweinen: perfekt, wenn Masse wichtiger ist als Meisterwerk.",
    fakt:"GPT-5.6 Luna wurde am 30. Juli 2026 um 80 Prozent verbilligt (0,20/1,20 Dollar) – Ausgaben kosten bei allen 5.6-Stufen das Sechsfache der Eingaben."
  },
  "gemini31-pro": {
    n:"Gemini 3.1 Pro", fam:"google", org:"Google", rel:"2026-02",
    api:true, inTok:2.0, outTok:12.0, limitMtok:100, ftOk:false,
    ctx:1000, lic:"proprietaer (API)", licF:false,
    vision:true, tc:3, rz:1,
    w:{logik:93,code:90,wissen:96,schreiben:86,werkzeug:88,treue:85,kontext:95},
    bench:[{n:"SWE-bench Verified", w:"80,6 %"}], tier:4, preis:0,
    txt:"Googles Wissens-Riese: kennt jeden Feldweg der Welt und vergisst nichts im Millionen-Token-Heu.",
    fakt:"Gemini 3.1 Pro kostet 2/12 Dollar je Mio. Token bis 200k Kontext – darueber verdoppelt Google den Eingabepreis."
  },
  "gemini37-flash": {
    n:"Gemini 3.7 Flash", fam:"google", org:"Google", rel:"2026-08",
    api:true, inTok:0.75, outTok:3.75, limitMtok:300, ftOk:true,
    ctx:1000, lic:"proprietaer (API)", licF:false,
    vision:true, tc:3, rz:1,
    w:{logik:88,code:92,wissen:84,schreiben:82,werkzeug:92,treue:84,kontext:92},
    bench:[], tier:3, preis:0,
    txt:"Googles fleissigstes Arbeitstier: im Sommer 2026 schlaegt der Flash sogar den eigenen Pro-Bullen.",
    fakt:"Gemini 3.7 Flash (13. August 2026) kostet einfuehrend 0,75/3,75 Dollar je Mio. Token – ab Januar 2027 verdoppelt sich der Preis."
  },
  "grok-46": {
    n:"Grok 4.6", fam:"xai", org:"xAI", rel:"2026-08",
    api:true, inTok:2.0, outTok:6.0, limitMtok:150, ftOk:false,
    ctx:500, lic:"proprietaer (API)", licF:false,
    vision:true, tc:3, rz:1,
    w:{logik:90,code:88,wissen:88,schreiben:82,werkzeug:88,treue:78,kontext:84},
    bench:[], tier:4, preis:0,
    txt:"Der freche Leihbulle mit Raketenstall-Genen: stark, guenstig, gelegentlich vorlaut.",
    fakt:"Grok 4.6 (12. August 2026) kostet 2/6 Dollar je Mio. Token bei 500k Kontext – ab 200k Eingabe verdoppelt xAI die Saetze."
  },
  "kimi-k3-api": {
    n:"Kimi K3 (API)", fam:"kimi", org:"Moonshot AI", rel:"2026-07",
    api:true, inTok:3.0, outTok:15.0, limitMtok:80, ftOk:false,
    pT:2800, pA:104, moe:true,
    ctx:1000, lic:"Kimi-K3-Lizenz (gehostet)", licF:false,
    vision:true, tc:3, rz:1,
    w:{logik:94,code:96,wissen:90,schreiben:91,werkzeug:96,treue:82,kontext:90},
    bench:[{n:"Terminal-Bench 2.1", w:"88,3"}], tier:5, preis:0,
    txt:"Dasselbe Kronjuwel wie im Kaufstall, nur gemietet und in der Max-Ausbaustufe.",
    fakt:"Der Kimi-K3-Endpunkt kostet 3/15 Dollar je Mio. Token, flach ueber das gesamte 1-Mio.-Kontextfenster; Cache-Treffer kosten nur 0,30 Dollar."
  },
  "glm53-api": {
    n:"GLM-5.3 (API)", fam:"glm", org:"Z.ai (Zhipu)", rel:"2026-08",
    api:true, inTok:1.4, outTok:4.4, limitMtok:200, ftOk:false,
    pT:753, pA:40, moe:true,
    ctx:1000, lic:"MIT (gehostet als API)", licF:false,
    vision:false, tc:3, rz:1,
    w:{logik:90,code:95,wissen:86,schreiben:84,werkzeug:92,treue:80,kontext:86},
    bench:[{n:"AA-Intelligenz-Index", w:"60"}], tier:4, preis:0,
    txt:"Das Coding-Ass zum Kampfpreis – lässt sich sogar über das Agenten-Tool Claude Code betreiben.",
    fakt:"Z.ai bietet fuer GLM-5.3 einen Anthropic-kompatiblen Endpunkt (api.z.ai/api/anthropic) – Claude Code funktioniert damit ohne Umbau."
  }
};

const WISSEN_MODELLE = [
  { kat:"modelle", t:"Mixture of Experts (MoE)",
    txt:"Ein MoE-Modell teilt sein Hirn in viele Experten und weckt pro Token nur wenige davon. Kimi K3 traegt 2,8 Billionen Parameter, rechnet aber je Token nur mit 104 Milliarden (16 von 896 Experten). So bekommt man Riesenwissen zum Rechenpreis eines viel kleineren Modells – nur der Speicher muss trotzdem alles fassen." },
  { kat:"modelle", t:"Lizenzfallen bei offenen Gewichten",
    txt:"Offen ist nicht gleich frei: Die Llama-Lizenz verlangt ab 700 Mio. Monatsnutzern eine Extra-Erlaubnis, die Kimi-K3-Lizenz greift ab 20 Mio. Dollar Umsatz und verlangt eine sichtbare Namensnennung. Qwen3, Gemma 4 oder OLMo sind dagegen echtes Apache 2.0 ohne Haken – Lizenz lesen lohnt sich." },
  { kat:"modelle", t:"Wie gross ist der Rueckstand offener Modelle?",
    txt:"Im August 2026 trennen das beste offene Modell (GLM-5.3, 1484 Elo) und das beste geschlossene (Claude Fable 5, 1507 Elo) in der Text-Arena nur noch rund 23 Elo-Punkte. Vor zwei Jahren lag die Luecke noch bei weit ueber 100 – offene Gewichte holen schneller auf, als die Grossen davonziehen." },
  { kat:"modelle", t:"Modelle altern wie Traktoren",
    txt:"DeepSeek R1 war im Januar 2025 eine Weltsensation – im Sommer 2026 schlagen 27B-Zwerge seine Distill-Kinder in fast allen Disziplinen. Modelle verlieren daher rasant an Marktwert: Wer klug wirtschaftet, kauft die vorletzte Generation zum Gebrauchtpreis." },
  { kat:"modelle", t:"Dense oder MoE – der VRAM-Deal",
    txt:"Ein dichtes 27B-Modell nutzt bei jeder Antwort alle Parameter; ein MoE wie Qwen3.5-35B-A3B aktiviert nur 3 von 35 Milliarden und antwortet dadurch viel schneller. Der Haken: Auch schlafende Experten belegen Speicher – MoE spart Rechenzeit, aber kaum VRAM." },
  { kat:"modelle", t:"Hybrides Denken",
    txt:"Seit Qwen3 (2025) koennen viele Modelle das Nachdenken pro Anfrage an- und abschalten. 2026 ist das Standard: DeepSeek V4 kennt die Stufen low, high und max (reasoning_effort), Claude Opus 5 denkt adaptiv von selbst. Denk-Token kosten Geld – kluge Hoefe drosseln sie bei einfachen Jobs." },
  { kat:"modelle", t:"Destillation: Wissen eindampfen",
    txt:"Bei der Destillation erzeugt ein grosses Lehrer-Modell Trainingsdaten fuer ein kleines. So entstanden die R1-Distill-Modelle (DeepSeek-Denkspuren in Qwen- und Llama-Schuelern), Gemma erbt von Gemini und Metas Muse Glimmer 30B ist ein Destillat des geschlossenen Muse Spark." },
  { kat:"modelle", t:"Wenn Gewichte ausbleiben: der Fall Qwen3.7",
    txt:"Qwen3.7 erschien im Mai 2026 nur als Bezahl-API – Gewichte gab es nie, die Generation wurde uebersprungen. Erst Qwen3.8 brachte im August wieder offene Modelle, sogar erstmals die Max-Klasse. Merke: Kein Labor schuldet dir offene Gewichte; wer lokal plant, plant mit dem, was schon im Stall steht." },
  { kat:"modelle", t:"Benchmark ist nicht Alltag",
    txt:"Im April 2025 glaenzte Llama 4 auf der LMArena – mit einer speziell zurechtgemachten Chat-Variante, die es so nie zum Download gab. Seitdem gilt: Elo-Punkte und Prozentwerte sind Indizien, keine Beweise. Teste ein Schwein immer an deinen eigenen Aufgaben, bevor du den Stall umbaust." },
  { kat:"modelle", t:"Das Verschwinden von DeepSeek R2",
    txt:"Der ersehnte R1-Nachfolger R2 erschien nie: Knapper Rechen-Nachschub und ein fehlgeschlagener Trainingslauf auf Huawei-Ascend-Chips warfen DeepSeek zurueck, der Chef war mit der Qualitaet unzufrieden. Stattdessen uebernahm die V4-Reihe das Denken gleich mit – Roadmaps sind Wetterberichte, keine Fahrplaene." }
];
