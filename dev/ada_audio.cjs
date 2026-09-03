/* Ada-Vertonung, Schritt 1: liest ADA_TEXTE aus der GEBAUTEN modellhof_game.html
   (Single Source of Truth – nie aus content.js direkt) und schreibt eine JSON-Liste
   id -> sprechbarer Text (sag-Variante vor t); Einträge mit ohneAudio werden ausgelassen.
   Schritt 2 (Python + edge-tts) vertont die übrigen Texte.
   Aufruf: node dev/ada_audio.cjs [zielpfad.json] */
const fs=require("fs"), path=require("path"), vm=require("vm");
const html=fs.readFileSync(path.join(__dirname,"..","modellhof_game.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const source=script.slice(0,script.indexOf("/* Boot-Sequenz */"));

function el(){ return {innerHTML:"",textContent:"",value:"",style:{setProperty(){},width:""},dataset:{},
  classList:{add(){},remove(){},contains:()=>false},appendChild(){},remove(){},before(){},
  querySelector:()=>el(),querySelectorAll:()=>[],onclick:null,onanimationend:null,addEventListener(){},
  scrollTop:0,offsetWidth:0}; }
const ctx={console,Math,JSON,Date,Object,Array,Number,String,Boolean,RegExp,Map,Set,isNaN,parseInt,parseFloat,
  setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame(){},
  performance:{now:()=>0},
  document:{getElementById:()=>el(),createElement:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],
    addEventListener(){},visibilityState:"visible"},
  window:{}, localStorage:{getItem:()=>null,setItem(){},removeItem(){}},
  confirm:()=>true, prompt:()=>null, alert(){}, btoa:s=>Buffer.from(s,"binary").toString("base64"),
  atob:s=>Buffer.from(s,"base64").toString("binary"), navigator:{}, location:{reload(){}},
  URL:{createObjectURL:()=>"",revokeObjectURL(){}}, Blob:function(){}, Image:function(){ this.onload=null; }};
ctx.globalThis=ctx; ctx.self=ctx;
vm.createContext(ctx);
vm.runInContext(source,ctx,{timeout:30000});
const A=vm.runInContext('(typeof ADA_TEXTE!=="undefined")?ADA_TEXTE:null',ctx);
if(!A){ console.error("ADA_TEXTE nicht im Build gefunden!"); process.exit(1); }
/* Aussprache-Tabelle: NUR für die Stimme. Der angezeigte Text bleibt unverändert.
   Gemessen mit scratchpad/ada_probe.py (Dauer + innere Sprechpausen je Variante):
   Einzelbuchstaben MIT LEERZEICHEN klingen gestanzt – "R T X 40 90" war die langsamste
   Variante und bekam sogar eine Pause mitten ins Wort. Mit BINDESTRICH ausgeschriebene
   Lautschrift läuft als ein Wort durch und klingt natürlich. */
/* Kartennummern werden gesagt wie unter Leuten: "vierzig neunzig", nicht "viertausendneunzig".
   ACHTUNG: Bindestrich zwischen ZIFFERN liest die Stimme als Bereich ("40-90" = "vierzig BIS
   neunzig") – darum die Zehner als Wörter ausschreiben. */
const ZEHNER={1:"zehn",2:"zwanzig",3:"dreißig",4:"vierzig",5:"fünfzig",6:"sechzig",7:"siebzig",8:"achtzig",9:"neunzig"};
const RTX=[/\b(RTX|GTX) ([1-9])0([1-9])0\b/g,(m,marke,a,b)=>marke+" "+ZEHNER[a]+" "+ZEHNER[b]];
/* edge-tts braucht ausgeschriebene Lautschrift, sonst verschluckt es die Abkuerzung. */
const AUSSPRACHE_EDGE=[
  [/LLM FARM/g,      "Ell-Ell-Emm Farm"],
  [/\bLLM\b/g,       "Ell-Ell-Emm"],
  [/\bLM Studio\b/g, "Ell-Emm Studio"],
  [/llama\.cpp/g,    "Lama-Zeh-Peh-Peh"],
  RTX
];
/* gpt-audio ist ein Sprachmodell: einzelne Grossbuchstaben liest es von selbst als
   Buchstaben, ohne die gestanzten Pausen von edge-tts. Diese Form wurde abgehoert. */
const AUSSPRACHE_GPT=[
  [/LLM FARM/g,      "L L M Farm"],
  [/\bLLM\b/g,       "L L M"],
  [/\bLM Studio\b/g, "L M Studio"],
  [/llama\.cpp/g,    "llama C P P"],
  RTX
];
const AUSSPRACHE = process.env.ADA_AUSSPRACHE==="edge" ? AUSSPRACHE_EDGE : AUSSPRACHE_GPT;
const out={}; let ohneAudio=0;
for(const [k,d] of Object.entries(A)){
  if(d.ohneAudio){ ohneAudio++; continue; }
  let t=String(d.sag||d.t||"").replace(/\s+/g," ").trim();
  for(const [re,ersatz] of AUSSPRACHE) t=t.replace(re,ersatz);
  if(/\d-\d/.test(t)){ console.error("Ziffern-Bindestrich in "+k+" – die Stimme läse einen Bereich ('bis')!"); process.exit(1); }
  out[k]=t;
  if(!out[k]){ console.error("Leerer Text: "+k); process.exit(1); }
}
const ziel=process.argv[2]||path.join(__dirname,"ada_texte.json");
fs.writeFileSync(ziel,JSON.stringify(out,null,1),"utf8");
console.log("ADA-TEXTE: "+Object.keys(out).length+" vertont -> "+ziel+" · "+ohneAudio+" bewusst ohne Audio");
