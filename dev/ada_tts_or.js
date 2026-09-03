/* Adas Vertonung über OpenRouter (openai/gpt-audio).
   Warum nicht mehr edge-tts: Dieses Modell nimmt eine REGIE-Anweisung entgegen – es
   weiss also, WIE es sprechen soll (jung, freundlich, mit natürlicher Betonung) – und
   setzt die Atempausen von selbst. Das künstliche Zusammenfügen aus Einzelsätzen
   entfällt damit komplett.

   Eigenheiten der Schnittstelle (beide hart erlernt):
     - Audio-Ausgabe gibt es NUR mit stream:true
     - im Streaming ist "mp3" verboten; es kommt pcm16 (24 kHz, mono, 16 bit LE)
   Darum: base64-Stücke aus delta.audio.data sammeln, einmal dekodieren, mit ffmpeg
   nach mp3 wandeln, danach die Mundkurve (20 Bilder/s) aus der fertigen Datei rechnen.

   Der zurückgelieferte Transkript-Text wird gegen die Vorlage geprüft: Ein Sprachmodell
   könnte etwas hinzudichten oder auslassen – dann wird der Clip neu angefordert.

   Aufruf:  OR_KEY=... node dev/ada_tts_or.js <texte.json> <ada/> <dev/ada_visemen.js> [nur,ids]
   Optional: ADA_STIMME (Standard coral), ADA_MODELL, FFMPEG                            */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const KEY = process.env.OR_KEY;
const STIMME = process.env.ADA_STIMME || "coral";
const MODELL = process.env.ADA_MODELL || "openai/gpt-audio";
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const FPS = 20;

const [quelle, zielOrdner, viseDatei, nurArg] = process.argv.slice(2);
if (!KEY) { console.error("OR_KEY fehlt"); process.exit(1); }
const nur = nurArg ? nurArg.split(",") : null;

const REGIE =
  "Du bist Ada, die Beraterin eines Lern-Spiels über KI. Du bist Anfang 30, herzlich und geduldig. " +
  "Sprich den folgenden deutschen Text WORTWÖRTLICH vor – ohne Begrüßung, ohne Kommentar, ohne Zusatz, " +
  "ohne Auslassung. Sprich jung, freundlich und lebendig, mit natürlicher Betonung und kleinen " +
  "Atempausen zwischen den Sätzen. Nicht hetzen, nicht ablesen-klingen. Text:\n\n";

/* Wortlaut-Vergleich: Umlaute und Zeichensetzung egal, es geht um Vollständigkeit. */
function woerter(s) {
  return String(s).toLowerCase()
    .replace(/[^a-zäöüß0-9]+/g, " ").trim().split(" ").filter(Boolean);
}
function deckung(soll, ist) {
  const a = woerter(soll), b = new Set(woerter(ist));
  if (!a.length) return 0;
  return a.filter(w => b.has(w)).length / a.length;
}

async function anfordern(text) {
  const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + KEY },
    body: JSON.stringify({
      model: MODELL, stream: true,
      modalities: ["text", "audio"],
      audio: { voice: STIMME, format: "pcm16" },
      messages: [{ role: "user", content: REGIE + text }],
    }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);

  let rest = "", b64 = "", transkript = "", fehler = null;
  for await (const stueck of r.body) {
    rest += Buffer.from(stueck).toString("utf8");
    const zeilen = rest.split("\n");
    rest = zeilen.pop();
    for (const z of zeilen) {
      if (!z.startsWith("data:")) continue;
      const nutz = z.slice(5).trim();
      if (!nutz || nutz === "[DONE]") continue;
      let j; try { j = JSON.parse(nutz); } catch { continue; }
      if (j.error) { fehler = JSON.stringify(j.error).slice(0, 200); continue; }
      const d = j?.choices?.[0]?.delta;
      if (d?.audio?.data) b64 += d.audio.data;
      if (d?.audio?.transcript) transkript += d.audio.transcript;
    }
  }
  if (fehler) throw new Error(fehler);
  if (!b64) throw new Error("keine Audiodaten im Stream");
  return { b64, transkript };
}

/* Lautstärke-Hüllkurve für die Lippensynchronisation: 20 Bilder/s, Stufen 0-9.
   Identische Kennlinie wie in dev/ada_tts.py, damit alte und neue Clips gleich wirken. */
function mundkurve(mp3) {
  const roh = execFileSync(FFMPEG,
    ["-v", "error", "-i", mp3, "-ac", "1", "-ar", "8000", "-f", "s16le", "-"],
    { maxBuffer: 1 << 28 });
  const blk = 8000 / FPS, werte = [];
  for (let i = 0; i + blk < roh.length / 2; i += blk) {
    let summe = 0, n = 0;
    for (let j = i; j < i + blk; j += 4) { const v = roh.readInt16LE(j * 2); summe += v * v; n++; }
    werte.push(Math.sqrt(summe / n));
  }
  if (!werte.length) return "";
  const sortiert = [...werte].sort((a, b) => a - b);
  const spitze = sortiert[Math.floor(sortiert.length * 0.93)] || 1;
  return werte.map(v =>
    Math.min(9, Math.floor(Math.pow(Math.min(1, v / spitze), 0.62) * 9.6))).join("");
}

(async () => {
  const texte = JSON.parse(fs.readFileSync(quelle, "utf8"));
  fs.mkdirSync(zielOrdner, { recursive: true });

  let kurven = {};
  if (fs.existsSync(viseDatei)) {
    const m = fs.readFileSync(viseDatei, "utf8").match(/=\s*(\{[\s\S]*\});?\s*$/);
    if (m) { try { kurven = JSON.parse(m[1]); } catch {} }
  }

  const ids = Object.keys(texte).filter(k => !nur || nur.includes(k));
  let fehlgeschlagen = [];
  for (const [nr, id] of ids.entries()) {
    process.stdout.write(`[${nr + 1}/${ids.length}] ${id}: `);
    let ok = false;
    for (let versuch = 1; versuch <= 3 && !ok; versuch++) {
      try {
        const { b64, transkript } = await anfordern(texte[id]);
        const d = deckung(texte[id], transkript);
        if (d < 0.9) {
          process.stdout.write(`Wortlaut nur ${(d * 100).toFixed(0)} % – neuer Versuch; `);
          continue;
        }
        const roh = path.join(zielOrdner, `_${id}.raw`);
        const ziel = path.join(zielOrdner, `${id}.mp3`);
        fs.writeFileSync(roh, Buffer.from(b64, "base64"));
        execFileSync(FFMPEG, ["-v", "error", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1",
          "-i", roh, "-c:a", "libmp3lame", "-b:a", "64k", ziel]);
        fs.unlinkSync(roh);
        kurven[id] = mundkurve(ziel);
        const kb = Math.round(fs.statSync(ziel).size / 1024);
        console.log(`${kb} KB, ${(kurven[id].length / FPS).toFixed(1)} s, Wortlaut ${(d * 100).toFixed(0)} %`);
        ok = true;
      } catch (e) {
        process.stdout.write(`Fehler (${String(e.message).slice(0, 80)}); `);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
    if (!ok) { console.log("AUFGEGEBEN"); fehlgeschlagen.push(id); }
  }

  const geordnet = {};
  for (const k of Object.keys(texte)) if (kurven[k]) geordnet[k] = kurven[k];
  fs.writeFileSync(viseDatei,
    "/* GENERIERT von dev/ada_tts_or.js – Mundbild-Kurven für Adas Lippensynchronisation.\n" +
    "   Je Zeichen 1/20 Sekunde, Ziffer 0-9 = Mundöffnung. Nicht von Hand editieren. */\n" +
    "const ADA_MUND=" + JSON.stringify(geordnet) + ";\n", "utf8");
  console.log(`MUNDKURVEN: ${Object.keys(geordnet).length} -> ${viseDatei}`);
  if (fehlgeschlagen.length) {
    console.error("FEHLGESCHLAGEN: " + fehlgeschlagen.join(", "));
    process.exit(1);
  }
})();
