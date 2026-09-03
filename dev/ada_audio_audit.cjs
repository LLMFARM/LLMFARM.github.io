/* Prüft Adas gesamten Audiosatz gegen Textquelle und Mundkurven.
   Aufruf: node dev/ada_audio_audit.cjs [texte.json] [audio-ordner] [ada_visemen.js] */
const fs=require("fs"),path=require("path"),{execFileSync}=require("child_process");

const [textArg,audioArg,visArg]=process.argv.slice(2);
const textPfad=path.resolve(textArg||path.join(__dirname,"ada_texte.json"));
const audioPfad=path.resolve(audioArg||path.join(__dirname,"..","ada_dialog_v3"));
const visPfad=path.resolve(visArg||path.join(__dirname,"ada_visemen.js"));
const texte=JSON.parse(fs.readFileSync(textPfad,"utf8"));
const visQuelle=fs.readFileSync(visPfad,"utf8");
const treffer=visQuelle.match(/=\s*(\{[\s\S]*\});?\s*$/);
if(!treffer) throw new Error("ADA_MUND konnte nicht gelesen werden: "+visPfad);
const kurven=JSON.parse(treffer[1]);
const fehler=[],werte=[];

function probe(pfad){
  return JSON.parse(execFileSync("ffprobe",[
    "-v","error","-select_streams","a:0",
    "-show_entries","stream=codec_name,sample_rate,channels,bit_rate:format=duration",
    "-of","json",pfad],{encoding:"utf8"}));
}
function wortzahl(text){return (String(text).match(/[A-Za-zÄÖÜäöüß0-9]+/g)||[]).length;}

for(const [id,text] of Object.entries(texte)){
  const mp3=path.join(audioPfad,id+".mp3"),kurve=kurven[id];
  if(!fs.existsSync(mp3)){fehler.push(id+": MP3 fehlt");continue;}
  if(!kurve){fehler.push(id+": Mundkurve fehlt");continue;}
  if(!/^[0-9]+$/.test(kurve)){fehler.push(id+": ungültige Mundkurve");continue;}
  let p;try{p=probe(mp3);}catch(e){fehler.push(id+": ffprobe fehlgeschlagen");continue;}
  const s=p.streams?.[0]||{},dauer=Number(p.format?.duration||0),mundDauer=kurve.length/20;
  const wps=wortzahl(text)/Math.max(.01,dauer),groesse=fs.statSync(mp3).size;
  if(s.codec_name!=="mp3") fehler.push(id+": Codec ist "+s.codec_name+", nicht MP3");
  if(Number(s.sample_rate)!==24000) fehler.push(id+": "+s.sample_rate+" Hz statt 24000 Hz");
  if(Number(s.channels)!==1) fehler.push(id+": nicht mono");
  if(groesse<8000) fehler.push(id+": Datei verdächtig klein");
  if(Math.abs(dauer-mundDauer)>.18) fehler.push(id+`: Ton ${dauer.toFixed(2)} s, Mund ${mundDauer.toFixed(2)} s`);
  if(wps<1.5||wps>3.5) fehler.push(id+`: auffälliges Sprechtempo ${wps.toFixed(2)} Wörter/s`);
  if(!/0{4,}/.test(kurve)) fehler.push(id+": keine messbare Sprechpause");
  werte.push({id,dauer,wps,groesse});
}
for(const id of Object.keys(kurven)) if(!texte[id]) fehler.push(id+": verwaiste Mundkurve");
for(const f of fs.readdirSync(audioPfad).filter(f=>f.endsWith(".mp3"))){
  const id=path.basename(f,".mp3");if(!texte[id]) fehler.push(id+": verwaiste MP3");
}

if(fehler.length){console.error("ADA-AUDIO-AUDIT FEHLGESCHLAGEN\n- "+fehler.join("\n- "));process.exit(1);}
const gesamt=werte.reduce((a,x)=>a+x.dauer,0),min=Math.min(...werte.map(x=>x.wps)),max=Math.max(...werte.map(x=>x.wps));
console.log(`ADA-AUDIO-AUDIT OK: ${werte.length} Clips · ${(gesamt/60).toFixed(1)} min · 24 kHz · mono · Sprechtempo ${min.toFixed(2)}–${max.toFixed(2)} Wörter/s · alle Mundkurven synchron`);
