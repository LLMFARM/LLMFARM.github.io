# Aussprache-Probe: welche Schreibweise klingt fluessig, welche gestanzt?
# Messgroesse: Dauer + Anzahl innerer Sprechpausen (Stille >= 0.2 s) im Testsatz.
# Viele kurze Pausen mitten im Wort = Roboter-Buchstabieren.
import asyncio, os, subprocess, sys, tempfile
import edge_tts

VOICE = "de-DE-SeraphinaMultilingualNeural"
FFM = r"C:\Users\Ingeborg\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"

PROBEN = {
  "LLM roh":        "Willkommen auf deiner LLM Farm.",
  "LLM Leerzeichen":"Willkommen auf deiner L L M Farm.",
  "LLM Bindestrich":"Willkommen auf deiner Ell-Ell-Emm Farm.",
  "LLM Wort":       "Willkommen auf deiner Ellellemm Farm.",
  "RTX roh":        "Ein Rechner mit einer RTX 4090 und 24 Gigabyte Speicher.",
  "RTX Leerzeichen":"Ein Rechner mit einer R T X 40 90 und 24 Gigabyte Speicher.",
  "RTX Bindestrich":"Ein Rechner mit einer Err-Teh-Iks vierzig-neunzig und 24 Gigabyte Speicher.",
  "RTX gemischt":   "Ein Rechner mit einer RTX vierzig-neunzig und 24 Gigabyte Speicher.",
  "cpp roh":        "Dein Rechner laeuft mit llama.cpp, das ist kostenlos.",
  "cpp Leerzeichen":"Dein Rechner laeuft mit Lama C P P, das ist kostenlos.",
  "cpp Bindestrich":"Dein Rechner laeuft mit Lama-Zeh-Peh-Peh, das ist kostenlos.",
}

def messen(pfad):
    r = subprocess.run([FFM, "-v", "error", "-i", pfad, "-ac", "1", "-ar", "8000",
                        "-f", "s16le", "-"], capture_output=True)
    roh, blk, werte = r.stdout, 400, []
    for i in range(0, len(roh)//2 - blk, blk):
        s = 0
        for j in range(i, i+blk, 4):
            b = int.from_bytes(roh[j*2:j*2+2], "little", signed=True)
            s += b*b
        werte.append((s/(blk/4)) ** 0.5)
    if not werte: return 0, 0, 0
    spitze = sorted(werte)[int(len(werte)*0.93)] or 1
    leise = [v < spitze*0.06 for v in werte]
    # innere Pausen: Stillestrecken >= 4 Bilder (0.2 s), Anfang/Ende ausgenommen
    a, b = 0, len(leise)
    while a < b and leise[a]: a += 1
    while b > a and leise[b-1]: b -= 1
    pausen, lauf = 0, 0
    for x in leise[a:b]:
        if x: lauf += 1
        else:
            if lauf >= 4: pausen += 1
            lauf = 0
    return len(werte)/20, (b-a)/20, pausen

async def main():
    tmp = tempfile.mkdtemp()
    print(f"{'Variante':<18}{'Dauer':>7}{'Sprech':>8}{'Pausen':>8}")
    for name, satz in PROBEN.items():
        p = os.path.join(tmp, name.replace(" ", "_") + ".mp3")
        await edge_tts.Communicate(satz, VOICE, rate="-1%").save(p)
        d, sprech, pausen = messen(p)
        print(f"{name:<18}{d:>6.1f}s{sprech:>7.1f}s{pausen:>8}")

asyncio.run(main())
