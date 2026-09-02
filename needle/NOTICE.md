# Needle 2 (Cactus Compute) – mitgelieferte Laufzeit

Dateien in diesem Ordner stammen unverändert aus dem Hugging-Face-Repository
https://huggingface.co/Cactus-Compute/needle2 (Lizenz: Apache-2.0, siehe LICENSE):

- `needle.js` / `needle.wasm` – WebAssembly-Engine (Emscripten), Ordner `wasm/`
- `needle2.cact` – die Modellgewichte (45 Mio. Parameter, CQ2-quantisiert, 13,7 MB)
- `config.json` – Architektur- und Quantisierungsangaben

LLM FARM lädt diese Dateien nur auf Wunsch der Spielerin (Hofsprecher → „Nadel laden“).
Fällt der lokale Ordner aus, versucht das Spiel dieselben Dateien direkt von Hugging Face
(`…/resolve/main/wasm/needle.js`, `…/needle2.cact`). Es werden keine Daten hochgeladen:
das Modell rechnet vollständig im Browser.
