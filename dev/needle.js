/* ═════════════════════════════════════════════════════════
   Ära 9 · Needle-2-Laufzeit im Browser (Spec: dev/NEEDLE_DESIGN.md, Teil A)
   ─────────────────────────────────────────────────────────
   Needle 2 (Cactus Compute, Apache-2.0) ist ein 45-Millionen-Parameter-Modell für
   Werkzeugaufrufe: Text rein, JSON raus – sonst nichts. Wir laden die unveränderte
   WebAssembly-Engine (needle.js + needle.wasm, 395 kB) und die Gewichte (needle2.cact,
   13,7 MB) erst auf Wunsch der Spielerin, rechnen in einem Web Worker und legen die
   Dateien in der Cache API ab, damit der Hofsprecher danach auch offline antwortet.
   Quelle zuerst der eigene Ordner needle/ neben dem Spiel, sonst Hugging Face.
   Es wird nichts hochgeladen: das Modell rechnet vollständig im Browser.
   ═══════════════════════════════════════════════════════ */
const NEEDLE_REGELN={
  cache:"llmfarm-needle-v1",
  quellen:[
    {id:"lokal", basis:"needle/", js:"needle.js", wasm:"needle.wasm", cact:"needle2.cact"},
    {id:"huggingface", basis:"https://huggingface.co/Cactus-Compute/needle2/resolve/main/", js:"wasm/needle.js", wasm:"wasm/needle.wasm", cact:"needle2.cact"}
  ],
  groesseMB:14.1,          /* 13,7 MB Gewichte + 0,4 MB Engine */
  maxTokens:160,           /* Werkzeugaufruf-JSON braucht selten mehr als 100 Token */
  zeitbudgetMs:8000,       /* danach Rückfall auf den Wörterbuch-Parser */
  fakten:{parameter:"45 Mio.", datei:"13,7 MB", ram:"≈ 28 MB", kontext:"256 Token", lizenz:"Apache-2.0", sprache:"Englisch (Deutsch teilweise)"}
};

/* Zustand der Laufzeit – transient, nie im Spielstand */
const _needle={status:"aus", fortschritt:0, quelle:null, worker:null, fehler:null, toolsJson:null, warten:new Map(), zaehler:0, tps:null, ladeMs:0};

/* Worker-Quelle als Text: importScripts der Engine aus einem Blob, Gewichte per postMessage (transferiert). */
const NEEDLE_WORKER_SRC=`
let M=null,out=0;const CAP=16384;
function rcOk(rc){return typeof rc==="number"&&rc>=0;}
self.onmessage=async(ev)=>{const m=ev.data||{};
 try{
  if(m.typ==="laden"){
    const url=URL.createObjectURL(new Blob([m.js],{type:"text/javascript"}));
    importScripts(url);
    const fabrik=(typeof createNeedle==="function")?createNeedle:(self.createNeedle||null);
    if(!fabrik) throw new Error("Engine-Fabrik createNeedle fehlt");
    M=await fabrik({wasmBinary:new Uint8Array(m.wasm),locateFile:(p)=>p,print(){},printErr(){}});
    const bytes=new Uint8Array(m.cact);
    const p=M._malloc(bytes.length);M.HEAPU8.set(bytes,p);
    let rc;try{rc=M._needle_load(p,BigInt(bytes.length));}catch(e){rc=M._needle_load(p,bytes.length);}
    M._free(p);
    if(!rcOk(rc)) throw new Error("needle_load rc="+rc);
    out=M._malloc(CAP);
    self.postMessage({typ:"geladen"});
  }else if(m.typ==="init"){
    if(!M) throw new Error("Engine nicht geladen");
    const t=Date.now();
    const rc=M.cwrap("needle_init","number",["string","string","string"])(m.system||"",m.tools||"[]","");
    if(!rcOk(rc)) throw new Error("needle_init rc="+rc);
    self.postMessage({typ:"init",id:m.id,ms:Date.now()-t});
  }else if(m.typ==="frage"){
    if(!M) throw new Error("Engine nicht geladen");
    const t=Date.now();
    const rc=M.cwrap("needle_complete","number",["string","number","number","number"])(String(m.text||""),m.max||160,out,CAP);
    const s=M.UTF8ToString(out);
    try{M._needle_reset();}catch(e){}
    self.postMessage({typ:"antwort",id:m.id,rc,text:s,ms:Date.now()-t});
  }
 }catch(e){self.postMessage({typ:"fehler",id:m.id,text:String((e&&e.message)||e)});}
};`;

function needleStatus(){ return {status:_needle.status, fortschritt:_needle.fortschritt, quelle:_needle.quelle, fehler:_needle.fehler, tps:_needle.tps, ladeMs:_needle.ladeMs}; }
function needleBereit(){ return _needle.status==="bereit"; }
function needleMoeglich(){
  try{ return typeof Worker!=="undefined"&&typeof WebAssembly!=="undefined"&&typeof fetch==="function"&&typeof location!=="undefined"&&/^https?:/.test(location.protocol); }catch(e){ return false; }
}
function needleHinweis(){
  if(!needleMoeglich()) return "Nadel braucht einen Browser mit WebAssembly und eine http(s)-Adresse (nicht file://).";
  return "Lädt "+NEEDLE_REGELN.groesseMB+" MB einmalig; danach offline aus dem Browser-Cache. Nichts wird hochgeladen.";
}

/* Datei holen: erst Cache API, sonst Netz (mit Fortschritt), danach in den Cache legen. */
async function needleDateiHolen(url,alsText,fortschritt){
  let cache=null; try{ if(typeof caches!=="undefined") cache=await caches.open(NEEDLE_REGELN.cache); }catch(e){ cache=null; }
  if(cache){ try{ const c=await cache.match(url); if(c){ const b=await c.arrayBuffer(); if(fortschritt) fortschritt(b.byteLength,b.byteLength); return alsText?new TextDecoder().decode(b):b; } }catch(e){} }
  const r=await fetch(url,{mode:"cors"});
  if(!r.ok) throw new Error("HTTP "+r.status+" bei "+url);
  const gesamt=Number(r.headers.get("content-length"))||0;
  let buf;
  if(r.body&&r.body.getReader){
    const reader=r.body.getReader(); const teile=[]; let n=0;
    for(;;){ const {done,value}=await reader.read(); if(done) break; teile.push(value); n+=value.byteLength; if(fortschritt) fortschritt(n,gesamt); }
    buf=new Uint8Array(n); let o=0; for(const t of teile){ buf.set(t,o); o+=t.byteLength; } buf=buf.buffer;
  } else { buf=await r.arrayBuffer(); if(fortschritt) fortschritt(buf.byteLength,buf.byteLength); }
  if(cache){ try{ await cache.put(url,new Response(buf.slice(0),{headers:{"Content-Type":alsText?"text/javascript":"application/octet-stream"}})); }catch(e){} }
  return alsText?new TextDecoder().decode(buf):buf;
}

/* Laden: Engine + Gewichte aus der ersten erreichbaren Quelle, dann Worker starten. */
async function needleLaden(beobachter){
  if(_needle.status==="bereit"||_needle.status==="laedt") return _needle.status==="bereit";
  if(!needleMoeglich()){ _needle.fehler=needleHinweis(); return false; }
  _needle.status="laedt"; _needle.fehler=null; _needle.fortschritt=0; const t0=Date.now();
  const melden=(f,txt)=>{ _needle.fortschritt=f; if(beobachter) try{ beobachter(f,txt); }catch(e){} };
  let letzterFehler=null;
  for(const q of NEEDLE_REGELN.quellen){
    try{
      melden(0,"Suche "+q.id+" …");
      const js=await needleDateiHolen(q.basis+q.js,true,()=>{});
      const wasm=await needleDateiHolen(q.basis+q.wasm,false,()=>{});
      melden(0.03,"Engine da – lade Gewichte …");
      const cact=await needleDateiHolen(q.basis+q.cact,false,(n,g)=>melden(0.03+0.9*(g?n/g:0.5),"Gewichte "+(n/1048576).toFixed(1)+" MB"));
      const w=new Worker(URL.createObjectURL(new Blob([NEEDLE_WORKER_SRC],{type:"text/javascript"})));
      await new Promise((ok,nein)=>{
        w.onmessage=(ev)=>{ const m=ev.data||{}; if(m.typ==="geladen") ok(); else if(m.typ==="fehler") nein(new Error(m.text)); };
        w.onerror=(e)=>nein(new Error((e&&e.message)||"Worker-Fehler"));
        w.postMessage({typ:"laden",js,wasm,cact},[wasm,cact]);
      });
      w.onmessage=needleNachricht; w.onerror=(e)=>{ _needle.fehler=(e&&e.message)||"Worker-Fehler"; };
      _needle.worker=w; _needle.quelle=q.id; _needle.status="bereit"; _needle.ladeMs=Date.now()-t0; _needle.toolsJson=null;
      melden(1,"Nadel bereit ("+q.id+", "+(_needle.ladeMs/1000).toFixed(1)+" s)");
      return true;
    }catch(e){ letzterFehler=e; }
  }
  _needle.status="fehler"; _needle.fehler="Nadel konnte nicht geladen werden: "+((letzterFehler&&letzterFehler.message)||letzterFehler);
  melden(0,_needle.fehler);
  return false;
}
function needleNachricht(ev){
  const m=ev.data||{}; const w=_needle.warten.get(m.id);
  if(m.typ==="fehler"&&!m.id){ _needle.fehler=m.text; return; }
  if(!w) return; _needle.warten.delete(m.id); clearTimeout(w.timer);
  if(m.typ==="fehler") w.nein(new Error(m.text)); else w.ok(m);
}
function needleSenden(nachricht,zeit){
  return new Promise((ok,nein)=>{
    if(!_needle.worker){ nein(new Error("Nadel nicht geladen")); return; }
    const id=++_needle.zaehler; nachricht.id=id;
    const timer=setTimeout(()=>{ _needle.warten.delete(id); nein(new Error("Zeitbudget überschritten")); },zeit||NEEDLE_REGELN.zeitbudgetMs);
    _needle.warten.set(id,{ok,nein,timer});
    _needle.worker.postMessage(nachricht);
  });
}
/* Werkzeugkatalog einmal je Änderung in die Engine laden (Retrieval-Index). */
async function needleWerkzeuge(toolsJson,system){
  if(!needleBereit()) return false;
  if(_needle.toolsJson===toolsJson) return true;
  await needleSenden({typ:"init",tools:toolsJson,system:system||""},20000);
  _needle.toolsJson=toolsJson; return true;
}
/* Eine Frage stellen → {calls:[{name,arguments}], konfidenz, tps, ms, roh} */
async function needleFragen(text,maxTok){
  const m=await needleSenden({typ:"frage",text,max:maxTok||NEEDLE_REGELN.maxTokens});
  const a=needleAntwortParsen(m.text); a.ms=m.ms; if(a.tps) _needle.tps=a.tps; return a;
}
/* Reine Funktion (testbar): rohes Engine-JSON → normalisierte Antwort */
function needleAntwortParsen(roh){
  let j=null; try{ j=JSON.parse(roh); }catch(e){ j=null; }
  if(!j||typeof j!=="object") return {calls:[],konfidenz:0,tps:null,fehler:"Kein JSON: "+String(roh||"").slice(0,80),roh:roh};
  const calls=Array.isArray(j.function_calls)?j.function_calls.filter(c=>c&&typeof c.name==="string").map(c=>({name:c.name,arguments:(c.arguments&&typeof c.arguments==="object")?c.arguments:{}})):[];
  return {calls,konfidenz:(typeof j.confidence==="number")?j.confidence:0,tps:(typeof j.decode_tps==="number")?j.decode_tps:null,fehler:j.error||null,roh:roh};
}
function needleBeenden(){ if(_needle.worker){ try{ _needle.worker.terminate(); }catch(e){} } _needle.worker=null; _needle.status="aus"; _needle.toolsJson=null; }

Object.assign(window,{NEEDLE_REGELN,needleStatus,needleBereit,needleMoeglich,needleHinweis,needleLaden,needleWerkzeuge,needleFragen,needleAntwortParsen,needleBeenden});
