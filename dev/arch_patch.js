// MODELLHOF v4 – Architektur-Patch (Stand: August 2026)
// dense = klassischer dichter Transformer
// moe   = sparse Mixture-of-Experts-Transformer
// ssmh  = Mamba/SSM-Transformer-Hybrid
// linh  = lineare/hybride Attention als praegendes Merkmal
const ARCH_PATCH = {
  // ===== TIER 0 =====
  "qwen35-4b":            "linh",  // Qwen3.5: Gated-DeltaNet-Hybrid (3:1 zu Gated Attention)
  "gemma4-e2b":           "dense",
  "gemma4-e4b":           "dense",
  "gemma4-e4b-it":        "dense",  // Ära 7.5 (T-07): Geschwister von gemma4-e4b, gleiche Bauform
  "phi4-mini":            "dense",
  "smollm3-3b":           "dense",
  "lfm25-1b":             "ssmh",  // LFM2-Linie: hybride On-Device-Architektur
  "granite42-3b":         "dense", // Granite 4.2: dichter Decoder-Transformer (GQA) laut Spezifikation
  "falcon-h1-tiny":       "ssmh",  // Falcon-H1: Mamba-Transformer-Hybrid
  "jamba-r-3b":           "ssmh",  // Jamba: SSM-Transformer-Hybrid
  "exaone4-1b":           "dense",

  // ===== TIER 1 =====
  "qwen35-9b":            "linh",
  "qwen35-9b-coder":      "linh",  // Ära 7.5 (T-07): Geschwister von qwen35-9b
  "granite42-8b":         "dense", // dichter Decoder-Transformer (GQA)
  "granite42-8b-guardian":"dense", // Ära 7.5 (T-07): Geschwister von granite42-8b
  "internlm3-8b":         "dense",
  "phi4-rv-15b":          "dense",
  "apriel15-thinker":     "dense",
  "falcon-h1r-7b":        "ssmh",
  "mistral-7b":           "dense",
  "mistral-7b-instruct":  "dense",  // Ära 7.5 (T-07): Geschwister von mistral-7b
  "llama31-8b":           "dense",
  "llama31-8b-code":      "dense",  // Ära 7.5 (T-07): Geschwister von llama31-8b
  "ornith15-9b":          "dense",
  "ds-r1-distill-14b":    "dense",

  // ===== TIER 2 =====
  "qwen38-27b":           "linh",  // dicht, aber hybride Attention als Kernmerkmal
  "qwen36-27b":           "linh",  // dichte FFN, aber Gated DeltaNet + Gated Attention
  "qwen35-27b":           "linh",  // 16 x (3x GatedDeltaNet -> 1x Gated Attention)
  "qwen35-35b-a3b":       "linh",  // MoE + GatedDeltaNet; Linear-Anteil praegend
  "muse-glimmer-30b":     "dense",
  "gemma4-31b":           "dense",
  "granite42-30b":        "dense", // dichter Decoder-Transformer (GQA)
  "nemotron35-lightning": "ssmh",  // Mamba-2 + MoE + Attention
  "ornith15-35b":         "moe",
  "olmo3-32b-think":      "dense",
  "devstral-small-2":     "dense",
  "seed-oss-36b":         "dense",
  "gptoss-20b":           "moe",
  "kat-coder-v25":        "moe",   // Basis Qwen3.6-35B-A3B, Hybrid nicht belegt -> moe
  "qwen25-coder-32b":     "dense",
  "ernie45-21b":          "moe",

  // ===== TIER 3 =====
  "gptoss-120b":          "moe",
  "mistral-medium-35":    "dense",
  "qwen35-122b":          "linh",
  "qwen3-coder-next":     "linh",  // Qwen3-Next-Basis: Gated DeltaNet + Gated Attention
  "ling3-flash":          "linh",  // KDA + Gated MLA im 5:1-Wechsel
  "nemotron3-super":      "ssmh",  // Mamba-Transformer-MoE-Hybrid
  "devstral2-123b":       "dense",
  "jamba2-mini":          "ssmh",  // SSM-Transformer-MoE

  // ===== TIER 4 =====
  "glm53-flash":          "moe",
  "minimax-m3":           "moe",   // MSA = sparse Attention, nicht linear
  "qwen35-397b":          "linh",  // hybride lineare Attention + sparsames MoE
  "ds-v4-flash":          "moe",   // DeepSeek Sparse Attention, nicht linear
  "step37-flash":         "moe",
  "command-a-plus":       "moe",
  "solar-open2":          "linh",  // 3 lineare Attention-Schichten je Softmax-Schicht
  "mimo-v25":             "linh",  // SWA/GA-Hybrid-Attention 6:1

  // ===== TIER 5 =====
  "glm53":                "moe",
  "hy4-preview":          "moe",   // Gated DeepSeek Sparse Attention -> sparse, nicht linear
  "ds-v4-pro":            "moe",
  "kimi-k25":             "moe",
  "kimi-k3":              "moe",
  "qwen38-2400b":         "moe",   // Attention-Aufbau nicht belegt -> konservativ moe

  // ===== LEIHMODELLE (Architektur unveroeffentlicht -> konservativ dense; offene Basen bekannt -> moe) =====
  "claude-opus-5":        "dense",
  "claude-sonnet-5":      "dense",
  "claude-haiku-45":      "dense",
  "gpt56-sol":            "dense",
  "gpt56-terra":          "dense",
  "gpt56-luna":           "dense",
  "gemini31-pro":         "dense",
  "gemini37-flash":       "dense",
  "grok-46":              "dense",
  "kimi-k3-api":          "moe",   // gehostetes Kimi K3: 2,8T/104B aktiv
  "glm53-api":            "moe"    // gehostetes GLM-5.3: 753B/40B aktiv
};
