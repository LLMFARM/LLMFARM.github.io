/* Erzeugt die vollständige Ada-/Audio-Dokumentation direkt aus dem gebauten Spiel.
   Aufruf: node dev/ada_doku.cjs [--check] */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.resolve(__dirname,".."),ziel=path.join(__dirname,"VERTONUNG_TODO.md");
const html=fs.readFileSync(path.join(root,"modellhof_game.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const source=script.slice(0,script.indexOf("/* Boot-Sequenz */"));
function el(){return {innerHTML:"",textContent:"",value:"",style:{setProperty(){},width:""},dataset:{},classList:{add(){},remove(){},contains:()=>false},appendChild(){},remove(){},before(){},querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},scrollTop:0,offsetWidth:0};}
const ctx={console,Math,JSON,Date,Object,Array,Number,String,Boolean,RegExp,Map,Set,isNaN,parseInt,parseFloat,setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame(){},performance:{now:()=>0},document:{getElementById:()=>el(),createElement:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},visibilityState:"visible"},window:{},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},confirm:()=>true,prompt:()=>null,alert(){},btoa:s=>Buffer.from(s,"binary").toString("base64"),atob:s=>Buffer.from(s,"base64").toString("binary"),navigator:{},location:{reload(){}},URL:{createObjectURL:()=>"",revokeObjectURL(){}},Blob:function(){},Image:function(){}};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(source,ctx,{timeout:30000});
const A=vm.runInContext('ADA_TEXTE',ctx),ids=Object.keys(A),stumm=ids.filter(id=>A[id].ohneAudio);
const zeilen=[
  '# Vertonung – vollständiger Ada-Bestand',
  '',
  `Stand: 02.09.2026 · ${ids.length} Erklärungen · ${ids.length-stumm.length} vertont · ${stumm.length} ohne Audiodatei.`,
  '',
  'Die einzige Textquelle ist `ADA_TEXTE` in `dev/content.js`. `node dev/ada_audio.cjs` liest sie aus',
  'dem gebauten Spiel und erzeugt `dev/ada_texte.json`. Alle Audiodateien verwenden dieselbe',
  'Seraphina-Stimme, 24 kHz, Mono und eine Mundkurve mit 20 Werten je Sekunde.',
  '',
  '## Erzeugung und Prüfung',
  '',
  '```bash',
  'powershell -ExecutionPolicy Bypass -File dev/assemble.ps1',
  'node dev/ada_audio.cjs',
  'python dev/ada_tts.py dev/ada_texte.json ada_dialog_v3 dev/ada_visemen.js',
  'node dev/ada_doku.cjs',
  'node dev/abschlusspruefung.cjs',
  '```',
  '',
  'Für einzelne geänderte Texte kann dem Python-Aufruf eine kommagetrennte Liste von IDs angehängt werden.',
  'Danach werden die MP3-Dateien nach `publish_pages/ada_dialog_v3/` kopiert und beide Bestände per Hash verglichen.',
  '',
  '## Verdrahtung der Entwicklungswege',
  '',
  '| Ansicht | Ada-ID | Wiederholung | Geführte Spielweise |',
  '| --- | --- | --- | --- |',
  '| Forschungshütte · Überblick | `ort_forschung` | „Ada erklärt die Übersicht“ | automatisch beim ersten Öffnen |',
  '| Forschungshütte · Forschungsbaum | `forschung_baum` | „Ada erklärt den Forschungsbaum“ | automatisch beim ersten Besuch |',
  '| Forschungshütte · Meisterschaften | `forschung_meister` | „Ada erklärt die Meisterschaften“ | automatisch beim ersten Besuch |',
  '| Forschungshütte · MCP-Werkstatt | `mcp_werkstatt` | „Ada erklärt die MCP-Werkstatt“ | automatisch beim ersten Besuch |',
  '| Rechenhaus · Innenraum | `ort_rechenhaus` | „Ada erklärt den Innenraum“ | automatisch beim ersten Besuch |',
  '| Rechenhaus · Energiegarten | `ort_energie` | „Ada erklärt den Energiegarten“ | automatisch beim ersten Besuch |',
  '| Rechenhaus · Ausbauplan | `rechenhaus_ausbau` | „Ada erklärt den Ausbauplan“ | automatisch beim ersten Besuch |',
  '| Rechenhaus · Trinkpause | `rechenhaus_trinkpause` | „Ada erklärt die Trinkpause“ | automatisch beim ersten Besuch |',
  '| Rechenhaus · Hofansicht | `rechenhaus_hofansicht` | „Ada erklärt die Hofansicht“ | automatisch beim ersten Besuch |',
  '| Rechenhaus · Hardware-Baum | `rechenhaus_hardware` | „Ada erklärt den Hardware-Baum“ | automatisch beim ersten Besuch |',
  '| Rechenhaus · Strom-Baum | `rechenhaus_strom` | „Ada erklärt den Strom-Baum“ | automatisch beim ersten Besuch |',
  '',
  'Die Kapitel 3 bis 5 der geführten Woche führen weiterhin in Forschung, Quantisierung und Agenten-Tools ein.',
  'Die kontextbezogenen Erklärungen setzen diese Führung beim ersten Besuch der späteren Bereiche fort.',
  '`adaAuto` merkt jeden gehörten Text im Spielstand; die sichtbaren Knöpfe spielen ihn jederzeit erneut ab.',
  '',
  '## Vollständiger Dialogbestand',
  ''
];
for(const id of ids){
  const d=A[id],zieltext=d.ziel?String(d.ziel):'kein blinkendes Ziel';
  zeilen.push(`### ${id} – ${d.titel||id}`,'',`Audio: \`ada_dialog_v3/${id}.mp3\` · Ziel: ${zieltext}${d.ohneAudio?' · **ohne Audio**':''}`,'',String(d.t||'').trim(),'');
  if(d.sag&&d.sag!==d.t) zeilen.push('Aussprachefassung für die Sprachausgabe:','',String(d.sag).trim(),'');
}
const neu=zeilen.join('\n').trimEnd()+'\n';
if(process.argv.includes('--check')){
  const alt=fs.existsSync(ziel)?fs.readFileSync(ziel,'utf8'):'';
  if(alt!==neu){console.error('VERTONUNG_TODO.md ist nicht synchron. `node dev/ada_doku.cjs` ausführen.');process.exit(1);}
  console.log(`VERTONUNG_TODO.md ist synchron (${ids.length} Ada-Texte).`);
}else{
  fs.writeFileSync(ziel,neu,'utf8');
  console.log(`VERTONUNG_TODO.md erzeugt: ${ids.length} Ada-Texte.`);
}
