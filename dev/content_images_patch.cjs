const fs = require("fs");

function patch(file, oldText, newText) {
  const source = fs.readFileSync(file, "utf8");
  if (source.includes(newText)) return;
  const count = source.split(oldText).length - 1;
  if (count !== 1) throw new Error(`${file}: erwartete genau einen Treffer, gefunden ${count}`);
  fs.writeFileSync(file, source.replace(oldText, newText), "utf8");
}

patch(
  "dev/hofloop.js",
  "let h='<div class=\"karte hlTagesplan\"><h3>🗓️ Tagesplanung · Tag '+S.tag+'</h3>';",
  "let h='<div class=\"karte hlTagesplan\"><img src=\"'+bild('tagesbericht')+'\" alt=\"Gezeichnetes Morgenbuch mit Wetter, Energie und erledigten Aufgaben\" style=\"width:100%;max-height:180px;object-fit:cover;object-position:center 62%;border-radius:12px;border:3px solid var(--holz-4);margin-bottom:9px\" onerror=\"this.remove()\"><h3>🗓️ Tagesplanung · Tag '+S.tag+'</h3>';"
);

patch(
  "dev/modellhof_template.html",
  "inhalt='<div class=\"notiz\">Neue Hardware braucht einen Platz",
  "inhalt='<img src=\"'+bild(\"hardware\")+'\" alt=\"Gezeichnete Hardware-Werkstatt mit GPU-Rechner, Serverrack und Kleinstrechner\" style=\"width:100%;max-height:210px;object-fit:cover;object-position:center 58%;border-radius:14px;border:3px solid var(--holz-4);margin-bottom:10px\" onerror=\"this.remove()\"><div class=\"notiz\">Neue Hardware braucht einen Platz"
);

patch(
  "dev/modellhof_template.html",
  "Bildmodell: Google Gemini 2.5 Flash Image über OpenRouter bzw. der vom Spieler in der Kreaturen-Werkstatt gewählte Anbieter;",
  "Bildmodelle: Google Gemini 2.5 Flash Image über OpenRouter, OpenAI Bildgenerierung sowie der vom Spieler in der Kreaturen-Werkstatt gewählte Anbieter;"
);

patch(
  "dev/modellhof_template.html",
  "max-height:clamp(120px,28dvh,220px);object-fit:cover;object-position:center;border-radius:14px;border:3px solid var(--holz-4)",
  "max-height:clamp(120px,28dvh,220px);object-fit:contain;object-position:center;background:#f3dfb7;border-radius:14px;border:3px solid var(--holz-4)"
);

patch(
  "dev/rechenhaus.js",
  "return '<div class=\"rhRaumLayout\"><div><div class=\"rhGrundriss stufe'+r.stufe+'\"",
  "return '<img class=\"rhThemenbild\" src=\"'+bild('hardware')+'\" alt=\"Gezeichnete Hardware-Werkstatt mit GPU-Rechner, Serverrack und Kleinstrechner\" onerror=\"this.remove()\"><div class=\"rhRaumLayout\"><div><div class=\"rhGrundriss stufe'+r.stufe+'\""
);

patch(
  "dev/rechenhaus.js",
  "return '<div class=\"notiz\">Spielbalance: Solar, Wind und Akku",
  "return '<img class=\"rhThemenbild\" src=\"'+bild('stromfluss')+'\" alt=\"Gezeichneter Stromweg von Sonne und Wind über den Akku zum Rechenstall\" onerror=\"this.remove()\"><div class=\"notiz\">Spielbalance: Solar, Wind und Akku"
);

console.log("INHALTSBILDER EINGEBAUT");
