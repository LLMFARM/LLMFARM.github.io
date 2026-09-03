# Ada-Vertonung v3: einheitliche Neural-Stimme + Mundbild-Kurve.
#   1) Jeden Dialog als zusammenhaengende Passage sprechen. So bleiben Melodie,
#      Betonung und Atempausen natuerlich; Satz-fuer-Satz-Stueckeln klang abgehackt.
#   2) Alle Clips technisch identisch auf 24 kHz, mono und 48 kbit/s normalisieren.
#   3) Lautstaerke-Huellkurve (20 fps, Stufen 0-9) fuer die Lippensynchronisation berechnen.
# Aufruf: python dev/ada_tts.py texte.json zielordner dev/ada_visemen.js [nur,ids]
import asyncio, json, os, re, subprocess, sys, tempfile
import edge_tts

# Stimme und Tempo per Umgebungsvariable wechselbar, damit ein Stimmwechsel EIN Aufruf ist:
#   set ADA_VOICE=en-US-EmmaMultilingualNeural  &&  python dev/ada_tts.py ...
# Kandidaten (mit dev/ada_probe.py hoerbar vergleichbar):
#   de-DE-SeraphinaMultilingualNeural | de-DE-AmalaNeural | de-DE-KatjaNeural
#   de-AT-IngridNeural | de-CH-LeniNeural
#   en-US-AvaMultilingualNeural | en-US-EmmaMultilingualNeural  (juenger, gespraechiger)
VOICE = os.environ.get("ADA_VOICE", "de-DE-SeraphinaMultilingualNeural")
RATE  = os.environ.get("ADA_RATE", "-1%")   # Ruhe kommt aus den Satzpausen, nicht aus Zeitlupe
FPS   = 20             # Bildrate der Mundkurve
SR    = 24000          # Abtastrate der edge-tts-Ausgabe

def saetze(text):
    roh = re.split(r'(?<=[.!?:])\s+', text.strip())
    out = []
    for s in roh:
        if out and len(s) < 14:            # winzige Fragmente an den Vorsatz haengen
            out[-1] = out[-1] + " " + s
        else:
            out.append(s)
    return [s for s in out if s.strip()]

def ff(args):
    r = subprocess.run(["ffmpeg", "-v", "error", "-y"] + args,
                       capture_output=True)
    if r.returncode != 0:
        raise SystemExit("ffmpeg: " + r.stderr.decode("utf-8", "replace")[:400])

def huellkurve(pfad):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", pfad, "-ac", "1",
                        "-ar", "8000", "-f", "s16le", "-"], capture_output=True)
    roh = r.stdout
    n = len(roh) // 2
    blk = 8000 // FPS                       # 400 Proben = 50 ms
    werte = []
    for i in range(0, n - blk, blk):
        summe = 0
        for j in range(i, i + blk, 4):      # jede 4. Probe genuegt fuer die Huelle
            b = int.from_bytes(roh[j*2:j*2+2], "little", signed=True)
            summe += b * b
        werte.append((summe / (blk / 4)) ** 0.5)
    if not werte:
        return ""
    ruhig = sorted(werte)
    spitze = ruhig[int(len(ruhig) * 0.93)] or 1
    # Wurzelkennlinie: leise Laute oeffnen den Mund schon sichtbar, laute nicht uebertrieben
    return "".join(str(min(9, int((min(1.0, v / spitze) ** 0.62) * 9.6))) for v in werte)

async def einer(k, text, outdir, tmp):
    teile = saetze(text)
    roh = os.path.join(tmp, f"{k}_roh.mp3")
    for versuch in range(3):
        try:
            await edge_tts.Communicate(text, VOICE, rate=RATE).save(roh)
            break
        except Exception as e:
            if versuch == 2:
                raise
            print(f"  {k}: Versuch {versuch+1} scheiterte ({e})")
            await asyncio.sleep(2)
    ziel = os.path.join(outdir, k + ".mp3")
    ff(["-i", roh, "-c:a", "libmp3lame",
        "-b:a", "48k", "-ar", str(SR), "-ac", "1", ziel])
    gr = os.path.getsize(ziel)
    if gr < 4000:
        raise SystemExit(f"Clip {k} verdaechtig klein ({gr} B)")
    kurve = huellkurve(ziel)
    print(f"{k}: {len(teile)} Saetze, {gr//1024} KB, {len(kurve)/FPS:.1f}s Mundkurve")
    return kurve

async def main():
    src, outdir, visedatei = sys.argv[1], sys.argv[2], sys.argv[3]
    nur = sys.argv[4].split(",") if len(sys.argv) > 4 else None
    with open(src, encoding="utf-8") as f:
        texte = json.load(f)
    os.makedirs(outdir, exist_ok=True)
    kurven = {}
    if os.path.exists(visedatei):                       # bestehende Kurven behalten
        alt = open(visedatei, encoding="utf-8").read()
        m = re.search(r"=\s*(\{.*\});?\s*$", alt, re.S)
        if m:
            kurven = json.loads(m.group(1))
    with tempfile.TemporaryDirectory() as tmp:
        for k, t in texte.items():
            if nur and k not in nur:
                continue
            kurven[k] = await einer(k, t, outdir, tmp)
    kurven = {k: kurven[k] for k in texte if k in kurven}
    with open(visedatei, "w", encoding="utf-8") as f:
        f.write("/* GENERIERT von dev/ada_tts.py - Mundbild-Kurven fuer Adas Lippensynchronisation.\n"
                "   Je Zeichen 1/20 Sekunde, Ziffer 0-9 = Mundoeffnung. Nicht von Hand editieren. */\n")
        f.write("const ADA_MUND=" + json.dumps(kurven, ensure_ascii=False) + ";\n")
    print(f"MUNDKURVEN: {len(kurven)} -> {visedatei}")

asyncio.run(main())
