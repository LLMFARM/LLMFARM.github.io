/* Solltests für das Dorfplatz-Modul (dev/minispiele.js).
   Vorgehen wie dev/tests_v6.cjs: den ersten <script>-Block der gebauten
   modellhof_game.html vor "Boot-Sequenz" abschneiden, in einer Node-VM mit
   DOM-Attrappen ausführen – und danach dev/minispiele.js in DENSELBEN Kontext
   laden. Aufruf:  node dev/tests_minispiele.cjs                                */
const fs=require("fs"), path=require("path"), vm=require("vm");

const html=fs.readFileSync(path.join(__dirname,"..","modellhof_game.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const source=script.slice(0,script.indexOf("/* Boot-Sequenz */"));

function el(){ return {innerHTML:"",textContent:"",value:"",style:{setProperty(){},width:""},dataset:{},
  classList:{add(){},remove(){},contains:()=>false},appendChild(){},remove(){},before(){},
  querySelector:()=>el(),querySelectorAll:()=>[],onclick:null,onanimationend:null,addEventListener(){},
  scrollTop:0,offsetWidth:0}; }

let fehlerLog=[];
const konsole={log(){},warn(){},info(){},debug(){},error(...a){ fehlerLog.push(a.map(String).join(" ")); }};

const ctx={console:konsole,Math,JSON,Date,Object,Array,Number,String,Boolean,RegExp,Map,Set,isNaN,parseInt,parseFloat,
  setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame(){},
  performance:{now:()=>0},
  document:{getElementById:()=>el(),createElement:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],
    addEventListener(){},visibilityState:"visible",body:el()},
  window:{}, localStorage:{getItem:()=>null,setItem(){},removeItem(){}},
  confirm:()=>true, prompt:()=>null, alert(){}, btoa:s=>Buffer.from(s,"binary").toString("base64"),
  atob:s=>Buffer.from(s,"base64").toString("binary"), navigator:{}, location:{reload(){}},
  URL:{createObjectURL:()=>"",revokeObjectURL(){}}, Blob:function(){}, Image:function(){ this.onload=null; }};
ctx.globalThis=ctx; ctx.self=ctx;
vm.createContext(ctx);
vm.runInContext(source,ctx,{timeout:30000});

/* Script-Scope-Konstanten des Spiels für Modul und Test erreichbar machen */
vm.runInContext([
"Object.assign(globalThis,{MODELLE,LEIHMODELLE,GPUS,QUANTS,FAMILIEN,WERTE,",
'  QUIRKS:(typeof QUIRKS!=="undefined")?QUIRKS:{}});',
"globalThis.__frisch=function(){ S=frischerStand(); S.einfFertig=true; return S; };"
].join("\n"),ctx);

/* UI stilllegen – blattAuf wird abgefangen, um das erzeugte HTML zu prüfen */
["alles","wieseNeu","schilderNeu","kopfNeu","tickerNeu","tickerLauf","zeigeBericht","zeigeJobs","zeigeMarkt",
 "zeigeStall","zeigeFutter","zeigeTier","zeigeCloud","zeigeArena","zeigeAgentenWelt","blattZu",
 "blattLive","melde","uhrAnzeige","maskenCss","figurDeko","questPruefe","dockNeu","zieleNeu",
 "rhAussenNeu","hlLeiste"].forEach(f=>{ ctx[f]=()=>{}; });
let letztesBlatt={titel:"",html:"",id:""};
ctx.blattAuf=(titel,html,id)=>{ letztesBlatt={titel:String(titel),html:String(html),id:String(id)}; };
let RAND=0.5; ctx.Math=Object.create(Math); ctx.Math.random=()=>RAND;

/* Modul in denselben Kontext laden, dazu eine schlanke Testbrücke (wie __frisch oben) */
const modul=fs.readFileSync(path.join(__dirname,"minispiele.js"),"utf8");
const bruecke=[
"",
"globalThis.__miniAkt=function(){ return miniAkt; };",
"globalThis.__miniAktSetzen=function(v){ miniAkt=v; };",
"globalThis.__miniTab=function(){ return {MINI_SPIELE,MINI_TOKEN,MINI_TOKEN_ART,MINI_POST,MINI_SAMPLER,",
"  MINI_SAMPLER_ART,MINI_SERIE,MINI_ABZEICHEN,MINI_VRAM_QUANTS,MINI_BAU}; };"
].join("\n");
/* Ära 7.5: seit dem Build-Marker MINISPIELE steckt das Modul schon im Spiel – dann nur die Brücke laden */
const schonDrin=vm.runInContext('typeof MINI_SPIELE!=="undefined"',ctx);
vm.runInContext((schonDrin?"":modul)+bruecke,ctx,{timeout:30000});

const T=ctx.__miniTab();
const W=ctx.window;                              /* hier liegen die Exporte */

/* ── Testgerüst ────────────────────────────────────────────────────── */
const erg=[]; let fail=0;
function test(id,txt,fn){
  const vorher=fehlerLog.length;
  try{
    const r=fn();
    if(fehlerLog.length>vorher){ fail++; erg.push("FAIL  "+id+" – "+txt+" :: console.error: "+fehlerLog[vorher]); return; }
    if(r===true) erg.push("PASS  "+id+" – "+txt);
    else { fail++; erg.push("FAIL  "+id+" – "+txt+" :: "+r); }
  }catch(e){ fail++; erg.push("ERROR "+id+" – "+txt+" :: "+(e.stack||e.message).split("\n").slice(0,3).join(" | ")); }
}
let S=null;
function frisch(){ S=ctx.__frisch(); ctx.S=S; ctx.__miniAktSetzen(null); return S; }
function m(){ return S.mini||{}; }
function journalSumme(kat){ return (S.journal||[]).filter(j=>j.kat===kat).reduce((a,j)=>a+j.b,0); }

/* Ein Minispiel vollständig durchspielen; wahl==="richtig" beantwortet alles korrekt. */
function spiele(id,wahl){
  const info=T.MINI_SPIELE.find(s=>s.id===id); if(info&&info.frei&&!info.frei()) return;   /* Ereignis-Spiele nur bei offenem Ereignis */
  W.miniStart(id);
  const a=ctx.__miniAkt();
  if(id==="mini_hacker"){ let n=0; while(a&&!a.fertig&&n++<60) W.miniAntwort("s",n%7); return; }
  if(!a||a.id!==id) throw new Error("miniStart("+id+") hat keine Runde erzeugt");
  if(id==="mini_token")
    a.runden.forEach((r,i)=>W.miniAntwort("r",i, wahl==="richtig"?r.k.tok:r.opt.filter(v=>v!==r.k.tok)[0]));
  else if(id==="mini_injection")
    a.karten.forEach((k,i)=>{ const soll=wahl==="richtig"?k.inj:!k.inj; if(soll) W.miniAntwort("m",i); });
  else if(id==="mini_sampler"){
    a.proben.forEach((p,i)=>W.miniAntwort("p",i,p.art));
    if(wahl!=="richtig") W.miniAntwort("p",0,a.proben[1].art);      /* eine Zuordnung bewusst falsch */
    if(a.famFrage){
      const ri=a.famFrage.opt.indexOf(a.famFrage.richtig);
      W.miniAntwort("f", wahl==="richtig"?ri:(ri+1)%a.famFrage.opt.length);
    }
  }
  else if(id==="mini_vram"){
    if(wahl==="richtig") W.miniAntwort("k",a.best.k,a.best.q);
    else {
      let schlecht=null;
      a.kand.forEach((c,i)=>T.MINI_VRAM_QUANTS.forEach(q=>{
        if(i===a.best.k&&q===a.best.q) return;
        if(!schlecht) schlecht={k:i,q};
      }));
      W.miniAntwort("k",schlecht.k,schlecht.q);
    }
  }
  else if(id==="mini_preis"){
    const fa=a.api.opt.filter(v=>v!==a.api.richtig)[0], fe=a.eigen.opt.filter(v=>v!==a.eigen.richtig)[0];
    W.miniAntwort("a", wahl==="richtig"?a.api.richtig:fa);
    W.miniAntwort("b", wahl==="richtig"?a.eigen.richtig:fe);
  }
  W.miniAuswerten();
  return ctx.__miniAkt();
}

/* 1 · Datentabellen */
test("TAB-1","MINI_TOKEN: mindestens 24 Texte, vollstaendige Felder, bekannte Textsorten",()=>{
  if(T.MINI_TOKEN.length<24) return "nur "+T.MINI_TOKEN.length+" Eintraege";
  const ids=new Set();
  for(const k of T.MINI_TOKEN){
    if(!k.id||!k.t||!k.e||!k.art) return "unvollstaendig: "+JSON.stringify(k).slice(0,60);
    if(!(k.tok>0)) return k.id+": Tokenzahl fehlt";
    if(!T.MINI_TOKEN_ART[k.art]) return k.id+": unbekannte Art "+k.art;
    if(ids.has(k.id)) return "doppelte Id "+k.id; ids.add(k.id);
  }
  return new Set(T.MINI_TOKEN.map(k=>k.art)).size>=6?true:"zu wenige Textsorten";
});
test("TAB-1b","MINI_TOKEN: hinterlegte Tokenzahl passt zur dokumentierten Naeherung (+/-20 %)",()=>{
  const f={de:3.2,en:4,code:2.8,json:2.5};
  const schief=[];
  for(const k of T.MINI_TOKEN){
    if(!f[k.art]) continue;                        /* zahl/emoji folgen eigenen Regeln */
    const soll=k.t.length/f[k.art];
    if(Math.abs(k.tok-soll)/soll>0.2) schief.push(k.id+" ("+k.tok+" statt ~"+soll.toFixed(1)+")");
  }
  return schief.length?schief.join(", "):true;
});
test("TAB-2","MINI_POST: mindestens 30 Texte, davon 12+ Injections und 18+ harmlose",()=>{
  if(T.MINI_POST.length<30) return "nur "+T.MINI_POST.length+" Eintraege";
  const inj=T.MINI_POST.filter(p=>p.inj), ok=T.MINI_POST.filter(p=>!p.inj);
  if(inj.length<12) return "nur "+inj.length+" Injections";
  if(ok.length<18) return "nur "+ok.length+" harmlose Texte";
  const ids=new Set();
  for(const p of T.MINI_POST){
    if(!p.id||!p.t||!p.e||!p.abs||!p.tarn) return "unvollstaendig: "+p.id;
    if(ids.has(p.id)) return "doppelte Id "+p.id; ids.add(p.id);
  }
  return new Set(inj.map(p=>p.tarn)).size>=8?true:"zu wenige verschiedene Tarnungen";
});
test("TAB-3","MINI_SAMPLER: mindestens 8 Aufgaben mit je drei erklaerten Proben",()=>{
  if(T.MINI_SAMPLER.length<8) return "nur "+T.MINI_SAMPLER.length+" Aufgaben";
  for(const s of T.MINI_SAMPLER)
    for(const k of ["kalt","werk","heiss"])
      if(!s[k]||!s[k].t||!s[k].e) return s.id+": Probe "+k+" unvollstaendig";
  return true;
});
test("TAB-4","MINI_ABZEICHEN: mindestens 12 Abzeichen, eindeutig, mit Prueffunktion",()=>{
  if(T.MINI_ABZEICHEN.length<12) return "nur "+T.MINI_ABZEICHEN.length;
  const ids=new Set();
  for(const a of T.MINI_ABZEICHEN){
    if(!a.id||!a.n||!a.txt||typeof a.p!=="function") return "unvollstaendig: "+a.id;
    if(ids.has(a.id)) return "doppelte Id "+a.id; ids.add(a.id);
  }
  return true;
});
test("TAB-5","MINI_SPIELE: fuenf Spiele, jedes mit Bauplan, Lehrsatz und Bonus",()=>{
  if(T.MINI_SPIELE.length!==6) return T.MINI_SPIELE.length+" Spiele";
  for(const s of T.MINI_SPIELE){
    if(!T.MINI_BAU[s.id]) return "kein Bauplan fuer "+s.id;
    if(!s.lehre||!s.bonus||!s.n) return "unvollstaendig: "+s.id;
  }
  return true;
});

/* 2 · Spielstand */
test("STAND-1","miniStand() legt S.mini faul an und ist mehrfach aufrufbar",()=>{
  frisch();
  if(S.mini!==undefined) return "S.mini war schon da";
  const a=W.miniStand();
  for(const k of ["tag","streak","streakBest","gespielt","abzeichen","album","albumT","albumZ","famBonus","stat"])
    if(a[k]===undefined) return "Feld fehlt: "+k;
  const b=W.miniStand();
  return (a===b&&S.mini===a)?true:"zweiter Aufruf liefert ein anderes Objekt";
});
test("STAND-2","Ohne Spielstand legt kein Export das Spiel lahm",()=>{
  frisch(); ctx.S=null;
  W.zeigeDorfplatz(); W.zeigeAlbum(); W.miniStart("mini_token"); W.miniAntwort("r",0,1);
  W.miniAuswerten(); W.miniAlbumMerken("qwen35-4b"); W.miniAlbumPruefen(); W.miniTagesPruefung();
  const h=W.miniAbzeichenHtml(); const st=W.miniStand();
  ctx.S=S;
  return (typeof h==="string"&&st&&st.gespielt)?true:"Rueckgaben unbrauchbar";
});
test("STAND-3","Unbekannte Spiel-Id wird abgewiesen, ohne etwas zu veraendern",()=>{
  frisch(); W.miniStart("mini_gibtsnicht");
  return (ctx.__miniAkt()===null&&Object.keys(W.miniStand().gespielt).length===0)?true:"Zustand veraendert";
});

/* 3 · Determinismus */
test("DET-1","Gleicher Hoftag ergibt dieselbe Aufgabe, ein anderer Tag eine andere",()=>{
  frisch();
  W.miniStart("mini_injection"); const a1=ctx.__miniAkt().karten.map(k=>k.id).join(",");
  ctx.__miniAktSetzen(null);
  W.miniStart("mini_injection"); const a2=ctx.__miniAkt().karten.map(k=>k.id).join(",");
  if(a1!==a2) return "gleicher Tag liefert verschiedene Karten";
  let anders=false;
  for(let t=2;t<=12&&!anders;t++){
    S.tag=t; ctx.__miniAktSetzen(null); W.miniStart("mini_injection");
    if(ctx.__miniAkt().karten.map(k=>k.id).join(",")!==a1) anders=true;
  }
  return anders?true:"Aufgabe aendert sich ueber 11 Hoftage nie";
});
test("DET-2","Die Post enthaelt an jedem Tag sechs Nachrichten mit 1 bis 3 Injections",()=>{
  frisch();
  for(let t=1;t<=40;t++){
    S.tag=t; ctx.__miniAktSetzen(null); W.miniStart("mini_injection");
    const k=ctx.__miniAkt().karten;
    if(k.length!==6) return "Tag "+t+": "+k.length+" Nachrichten";
    const n=k.filter(x=>x.inj).length;
    if(n<1||n>3) return "Tag "+t+": "+n+" Injections";
    if(new Set(k.map(x=>x.id)).size!==6) return "Tag "+t+": doppelte Nachricht";
  }
  return true;
});

/* 4 · Die fuenf Minispiele */
test("TOKEN-1","Tokenizer-Wette: 3/3 setzt tokenRabattTag, bucht XP und sperrt den Tag",()=>{
  frisch(); const xp0=S.xp;
  const a=spiele("mini_token","richtig");
  if(!a.fertig||a.fertig.treffer!==3) return "Treffer "+(a.fertig&&a.fertig.treffer);
  if(m().tokenRabattTag!==S.tag) return "tokenRabattTag fehlt";
  if(m().gespielt.mini_token!==S.tag) return "Tagessperre fehlt";
  if(S.xp<=xp0) return "keine XP";
  if(m().stat.tokenPerfekt!==1) return "Zaehler tokenPerfekt="+m().stat.tokenPerfekt;
  W.miniStart("mini_token");
  return ctx.__miniAkt().fertig?true:"zweiter Start am selben Tag war moeglich";
});
test("TOKEN-2","Tokenizer-Wette: falsche Tipps geben weniger XP und keinen Rabatt",()=>{
  frisch(); const xp0=S.xp;
  const a=spiele("mini_token","falsch");
  return (a.fertig.treffer===0&&m().tokenRabattTag===undefined&&S.xp===xp0&&m().gespielt.mini_token===S.tag)
    ?true:"Treffer="+a.fertig.treffer+" xp="+(S.xp-xp0)+" rabatt="+m().tokenRabattTag;
});
test("TOKEN-3","Je Runde vier verschiedene Zahlen, genau eine richtig, Ablenker klar daneben",()=>{
  frisch();
  for(let t=1;t<=25;t++){
    S.tag=t; ctx.__miniAktSetzen(null); W.miniStart("mini_token");
    for(const r of ctx.__miniAkt().runden){
      if(r.opt.length!==4) return "Tag "+t+": "+r.opt.length+" Optionen";
      if(new Set(r.opt).size!==4) return "Tag "+t+": doppelte Option";
      if(r.opt.filter(v=>v===r.k.tok).length!==1) return "Tag "+t+": richtige Zahl nicht genau einmal";
      for(const v of r.opt){ if(v===r.k.tok) continue;
        const ab=Math.abs(v-r.k.tok)/r.k.tok;
        if(ab<0.20||ab>0.75) return "Tag "+t+" "+r.k.id+": Ablenker "+v+" liegt "+Math.round(ab*100)+" % daneben"; }
    }
  }
  return true;
});
test("INJ-1","Post fehlerfrei ergibt injectionSchutzTag, 12 XP und Zaehlerstand",()=>{
  frisch(); const xp0=S.xp;
  const a=spiele("mini_injection","richtig");
  return (a.fertig.fp===0&&a.fertig.fn===0&&m().injectionSchutzTag===S.tag&&
          m().stat.injektionPerfekt===1&&S.xp-xp0===12&&m().gespielt.mini_injection===S.tag)
    ?true:"fp="+a.fertig.fp+" fn="+a.fertig.fn+" xp="+(S.xp-xp0)+" schutz="+m().injectionSchutzTag;
});
test("INJ-2","Genau verkehrt markiert: Falsch-Positive und Falsch-Negative getrennt, kein Schutz",()=>{
  frisch();
  const a=spiele("mini_injection","falsch");
  return (a.fertig.fp>0&&a.fertig.fn>0&&a.fertig.fp+a.fertig.fn===6&&
          m().injectionSchutzTag===undefined&&m().stat.injektionPerfekt===undefined)
    ?true:"fp="+a.fertig.fp+" fn="+a.fertig.fn+" schutz="+m().injectionSchutzTag;
});
test("SAMPLER-1","Sampler-Duell: alles richtig setzt samplerFreiTag, Familienfrage stammt aus QUIRKS",()=>{
  frisch();
  const a=spiele("mini_sampler","richtig");
  if(!a.famFrage) return "keine Familienfrage gebaut";
  if(a.famFrage.opt.length!==4) return a.famFrage.opt.length+" Optionen";
  if(new Set(a.famFrage.opt).size!==4) return "doppelte Option in der Familienfrage";
  if(!Object.values(ctx.QUIRKS).some(q=>q.temp===a.famFrage.richtig)) return "richtige Antwort stammt nicht aus QUIRKS";
  return (a.fertig.treffer===4&&m().samplerFreiTag===S.tag&&m().stat.samplerPerfekt===1)
    ?true:"treffer="+a.fertig.treffer+" frei="+m().samplerFreiTag;
});
test("SAMPLER-2","Jede Bewertung wird nur einmal vergeben (Umhaengen statt Doppelvergabe)",()=>{
  frisch(); W.miniStart("mini_sampler");
  W.miniAntwort("p",0,"werk"); W.miniAntwort("p",1,"werk");
  const z=ctx.__miniAkt().zuord;
  return (z[0]===null&&z[1]==="werk")?true:JSON.stringify(z);
});
test("SAMPLER-3","Eigenes Tier mit hinterlegter Werksempfehlung wird bevorzugt gefragt",()=>{
  frisch();
  const t=ctx.neuesTier("qwen35-4b"); S.tiere.push(t);
  ctx.__miniAktSetzen(null); W.miniStart("mini_sampler");
  const ff=ctx.__miniAkt().famFrage;
  return (ff&&ff.eigen&&ff.fam==="qwen"&&ff.richtig===ctx.QUIRKS.qwen.temp)?true:JSON.stringify(ff&&{f:ff.fam,e:ff.eigen});
});
test("VRAM-1","Stallmeister-Pruefung: Optimum ergibt 100 %, Gutschein und Zaehler",()=>{
  frisch();
  const a=spiele("mini_vram","richtig");
  if(a.fertig.quote!==100) return "Quote "+a.fertig.quote;
  return (m().quantGratis===1&&m().stat.vramGut===1&&m().gespielt.mini_vram===S.tag)
    ?true:"gutschein="+m().quantGratis+" zaehler="+m().stat.vramGut;
});
test("VRAM-2","Der Optimums-Kandidat passt wirklich in die Karte",()=>{
  frisch();
  for(let t=1;t<=30;t++){
    S.tag=t; ctx.__miniAktSetzen(null); W.miniStart("mini_vram");
    const a=ctx.__miniAkt();
    if(a.kand.length!==4) return "Tag "+t+": "+a.kand.length+" Kandidaten";
    if(a.best.k<0||!(a.best.score>0)) return "Tag "+t+": kein gueltiges Optimum";
    const mm=a.kand[a.best.k].m;
    const p={...mm, quant:a.best.q, api:false, temp:"werk", setups:[], adapters:[],
      zustand:100, w:{...mm.w}, arch:mm.arch};
    if(ctx.vramPig(p)>a.gpu.vram) return "Tag "+t+": Optimum passt gar nicht";
  }
  return true;
});
test("VRAM-3","Eine Wahl ohne Passung wird mit 0 Punkten gewertet, kein Gutschein",()=>{
  frisch(); S.tag=7;
  W.miniStart("mini_vram");
  const a=ctx.__miniAkt();
  let nichtPassend=null;
  a.kand.forEach((c,i)=>T.MINI_VRAM_QUANTS.forEach(q=>{
    const p={...c.m,quant:q,api:false,temp:"werk",setups:[],adapters:[],zustand:100,w:{...c.m.w}};
    if(!nichtPassend&&ctx.vramPig(p)>a.gpu.vram) nichtPassend={k:i,q};
  }));
  if(!nichtPassend) return true;                       /* an diesem Tag passt alles */
  W.miniAntwort("k",nichtPassend.k,nichtPassend.q);
  W.miniAuswerten();
  const f=ctx.__miniAkt().fertig;
  return (f.passt===false&&f.score===0&&f.quote===0&&m().quantGratis===undefined)?true:JSON.stringify(f);
});
test("PREIS-1","Preisrechner: beide Fragen richtig setzt lohnBonus 0,08",()=>{
  frisch();
  const a=spiele("mini_preis","richtig");
  return (a.fertig.treffer===2&&m().lohnBonus===0.08&&m().stat.preisPerfekt===1&&m().gespielt.mini_preis===S.tag)
    ?true:"treffer="+a.fertig.treffer+" bonus="+m().lohnBonus;
});
test("PREIS-2","API-Rechenweg entspricht der Spielformel (in/out, Denk-Faktor 1,4, 0,92 EUR/USD)",()=>{
  frisch();
  for(let t=1;t<=20;t++){
    S.tag=t; ctx.__miniAktSetzen(null); W.miniStart("mini_preis");
    const a=ctx.__miniAkt(), j=a.auftrag, lm=a.api.m;
    const soll=Math.round(j.mtok*(j.anteilIn*lm.inTok+(1-j.anteilIn)*lm.outTok*(j.denken?1.4:1))*0.92*100)/100;
    if(Math.abs(soll-a.api.richtig)>0.011) return "Tag "+t+": "+a.api.richtig+" statt "+soll;
    if(a.api.opt.length!==4||new Set(a.api.opt).size!==4) return "Tag "+t+": Optionen nicht vier verschiedene";
    if(a.api.opt.indexOf(a.api.richtig)<0) return "Tag "+t+": richtige Zahl fehlt in den Optionen";
    if(!(a.eigen.richtig>0)||a.eigen.opt.indexOf(a.eigen.richtig)<0) return "Tag "+t+": Eigenbetrieb unbrauchbar";
  }
  return true;
});
test("PREIS-3","Eigenbetrieb rechnet mit einem echten Tier in der Bucht, wenn eines da ist",()=>{
  frisch();
  const t=ctx.neuesTier("qwen35-4b"); t.bucht="b1"; S.tiere.push(t); S.buchten[0].tier=t.uid;
  ctx.__miniAktSetzen(null); W.miniStart("mini_preis");
  const a=ctx.__miniAkt(), e=a.eigen;
  const soll=Math.round(e.watt/1000*(a.auftrag.mtok/(e.kapTag/14))*e.preisKwh*100)/100;
  return (e.eigen===true&&e.kapTag>0&&Math.abs(soll-e.richtig)<=0.02)?true:"eigen="+e.eigen+" "+e.richtig+" statt "+soll;
});

/* 5 · Serie, Abzeichen, Album */
test("SERIE-1","Serie waechst ueber aufeinanderfolgende Tage, Praemie ab Tag 3",()=>{
  frisch();
  spiele("mini_token","falsch");
  if(m().streak!==1) return "Tag 1: Serie "+m().streak;
  S.tag=2; spiele("mini_token","falsch");
  if(m().streak!==2) return "Tag 2: Serie "+m().streak;
  const foerd0=journalSumme("foerderung");
  S.tag=3; spiele("mini_token","falsch");
  if(m().streak!==3) return "Tag 3: Serie "+m().streak;
  const praemie=journalSumme("foerderung")-foerd0;
  if(praemie!==8) return "Serienpraemie "+praemie+" statt 8";
  return m().streakBest===3?true:"Bestmarke "+m().streakBest;
});
test("SERIE-2","Serienfaktor wirkt auf die XP (ab Tag 3: mal 1,15)",()=>{
  frisch();
  W.miniStand().streak=2; W.miniStand().tag=S.tag-1;
  const xp0=S.xp;
  spiele("mini_injection","richtig");
  return (S.xp-xp0)===Math.round(12*1.15)?true:"XP "+(S.xp-xp0)+" statt "+Math.round(12*1.15);
});
test("SERIE-3","Ein ausgelassener Tag setzt die Serie zurueck",()=>{
  frisch();
  spiele("mini_token","falsch");
  S.tag=2; spiele("mini_injection","falsch");
  if(m().streak!==2) return "Serie "+m().streak;
  S.tag=5; W.miniTagesPruefung();
  if(m().streak!==0) return "Tagespruefung setzt nicht zurueck: "+m().streak;
  spiele("mini_sampler","falsch");
  return m().streak===1?true:"nach Pause Serie "+m().streak;
});
test("ABZ-1","miniTagesPruefung vergibt Abzeichen genau einmal und schreibt die Chronik",()=>{
  frisch();
  const st=W.miniStand();
  st.stat.injektionPerfekt=5; st.stat.vramGut=5; st.stat.preisPerfekt=5;
  st.stat.tokenPerfekt=10; st.stat.samplerPerfekt=5; st.stat.lese=10; st.streakBest=30;
  const n1=W.miniTagesPruefung();
  const chronik1=(S.chronik||[]).length;
  const n2=W.miniTagesPruefung();
  if(n1<7) return "nur "+n1+" Abzeichen vergeben";
  if(n2!==0) return "zweiter Durchlauf vergibt erneut "+n2;
  if((S.chronik||[]).length!==chronik1) return "Chronik waechst beim zweiten Durchlauf";
  return chronik1>=n1?true:"keine Chronikeintraege ("+chronik1+")";
});
test("ABZ-2","Datenlese des Hauptspiels wird fuer das Abzeichen mitgezaehlt",()=>{
  frisch();
  for(let t=1;t<=10;t++){ S.tag=t; S.leseTag=t; W.miniTagesPruefung(); }
  return (W.miniStand().stat.lese===10&&W.miniStand().abzeichen.datenwaescher)?true:
    "lese="+W.miniStand().stat.lese+" abzeichen="+W.miniStand().abzeichen.datenwaescher;
});
test("ABZ-3","miniAbzeichenHtml liefert alle Abzeichen als HTML ohne Handler",()=>{
  frisch(); const h=W.miniAbzeichenHtml();
  if(typeof h!=="string"||!h.length) return "leer";
  for(const a of T.MINI_ABZEICHEN) if(h.indexOf(a.n)<0) return "fehlt: "+a.n;
  return h.indexOf("onclick")<0?true:"enthaelt onclick";
});
test("ABZ-4","Tages-Abzeichen verlangen die fünf täglichen Spiele, nicht das ereignisabhängige Hacker-Spiel",()=>{
  frisch(); const st=W.miniStand(),ids=["mini_token","mini_injection","mini_sampler","mini_vram","mini_preis"];
  for(const id of ids){st.stat[id]=1;st.gespielt[id]=S.tag;} W.miniTagesPruefung();
  return st.abzeichen.stammgast&&st.abzeichen.tagwerk&&!st.gespielt.mini_hacker?true:"Tages-Abzeichen hängt am Hacker-Ereignis";
});
test("ALBUM-1","Vollstaendige Familie gibt einmalig 100 EUR Foerderung",()=>{
  frisch();
  const kat=ctx.MODELLE;
  const fam=Object.keys(ctx.FAMILIEN).filter(f=>Object.keys(kat).filter(id=>kat[id].fam===f&&!kat[id].api).length>=2)[0];
  Object.keys(kat).filter(id=>kat[id].fam===fam&&!kat[id].api).forEach(id=>W.miniAlbumMerken(id));
  const vor=journalSumme("foerderung");
  const n1=W.miniAlbumPruefen();
  const nach=journalSumme("foerderung");
  const n2=W.miniAlbumPruefen();
  return (n1===1&&n2===0&&nach-vor===100&&W.miniStand().famBonus[fam])
    ?true:"n1="+n1+" n2="+n2+" foerderung="+(nach-vor);
});
test("ALBUM-2","Besitz und Training kommen aus S.tiere, Zucht wird je Familie vermerkt",()=>{
  frisch();
  const t=ctx.neuesTier("qwen35-4b"); t.historie.push({tag:1,n:"SFT",delta:{code:5},ausgang:"sauber"});
  S.tiere.push(t);
  const kind=ctx.neuesTier("qwen35-4b"); kind.modell=null; kind.eltern={namen:["a","b"],methode:"SLERP"};
  S.tiere.push(kind);
  W.miniAlbumPruefen();
  const st=W.miniStand();
  return (st.album["qwen35-4b"]&&st.albumT["qwen35-4b"]&&st.albumZ.qwen)?true:
    JSON.stringify({b:st.album["qwen35-4b"],t:st.albumT["qwen35-4b"],z:st.albumZ.qwen});
});
test("ALBUM-3","zeigeAlbum rendert jede Familie",()=>{
  frisch(); W.zeigeAlbum();
  if(letztesBlatt.id!=="mini_album") return "falsches Blatt: "+letztesBlatt.id;
  const fams=new Set(Object.values(ctx.MODELLE).filter(x=>!x.api).map(x=>x.fam));
  for(const f of fams){ const n=(ctx.FAMILIEN[f]||{}).n||f;
    if(letztesBlatt.html.indexOf(n)<0) return "Familie fehlt im Album: "+n; }
  return true;
});

/* 6 · Oberflaeche */
const ERLAUBT=["zeigeDorfplatz","miniStart","miniAntwort","miniAuswerten","zeigeAlbum",
  "miniAlbumMerken","miniAlbumPruefen","miniTagesPruefung","miniAbzeichenHtml","miniStand"];
test("UI-1","Alle onclick-Handler rufen ausschliesslich exportierte Funktionen",()=>{
  frisch();
  const seiten=[];
  W.zeigeDorfplatz(); seiten.push(letztesBlatt.html);
  W.zeigeAlbum(); seiten.push(letztesBlatt.html);
  for(const s of T.MINI_SPIELE){
    frisch(); S.tag=3;
    W.miniStart(s.id); seiten.push(letztesBlatt.html);
    spiele(s.id,"richtig"); seiten.push(letztesBlatt.html);
  }
  for(const h of seiten){
    const treffer=h.match(/onclick="([^"]*)"/g)||[];
    for(const t of treffer){
      const fn=(t.match(/onclick="\s*([A-Za-z_$][\w$]*)\s*\(/)||[])[1];
      if(!fn||ERLAUBT.indexOf(fn)<0) return "unerlaubter Handler: "+t.slice(0,80);
    }
  }
  return true;
});
test("UI-2","Dorfplatz zeigt Status, Serie, Abzeichen und den Album-Zugang",()=>{
  frisch();
  spiele("mini_token","richtig");
  W.zeigeDorfplatz();
  const h=letztesBlatt.html;
  for(const s of T.MINI_SPIELE.filter(x=>!x.frei||x.frei())) if(h.indexOf(s.n)<0) return "Spiel fehlt: "+s.n;
  if(h.indexOf("zeigeAlbum()")<0) return "kein Album-Zugang";
  if(h.indexOf("heute gespielt")<0) return "kein Tagesstatus";
  if(h.indexOf("Serie")<0) return "keine Serienanzeige";
  if(h.indexOf("Zur")<0) return "kein Zurueck-Hinweis";
  return h.indexOf("Token-Kosten")>0?true:"aktiver Tagesbonus wird nicht angezeigt";
});
test("UI-3","Jede Auflösung erklaert jede Antwort einzeln",()=>{
  frisch(); S.tag=4;
  const a=spiele("mini_injection","falsch");
  const h=letztesBlatt.html;
  for(const k of a.karten) if(h.indexOf(k.e.slice(0,25))<0) return "Erklaerung fehlt: "+k.id;
  return (h.indexOf("Falsch-Negativ")>0&&h.indexOf("Falsch-Positiv")>0)?true:"FP/FN nicht getrennt erklaert";
});

/* 7 · Robustheit */
test("ROB-1","30 Hoftage mit allen fuenf Spielen: keine Ausnahme, endliche Kasse und XP",()=>{
  frisch();
  const arten=["richtig","falsch"];
  for(let t=1;t<=30;t++){
    S.tag=t;
    for(const s of T.MINI_SPIELE) spiele(s.id,arten[(t+s.id.length)%2]);
    W.miniTagesPruefung(); W.miniAlbumPruefen(); W.zeigeDorfplatz();
    if(!Number.isFinite(S.kredit)) return "Kasse nicht endlich an Tag "+t;
    if(!Number.isFinite(S.xp)) return "XP nicht endlich an Tag "+t;
  }
  if(m().streak!==30) return "Serie nach 30 Tagen: "+m().streak;
  return m().abzeichen.serie30?true:"Serien-Abzeichen 30 fehlt";
});
test("ROB-2","Antworten ohne laufende Runde und doppeltes Auswerten sind wirkungslos",()=>{
  frisch(); ctx.__miniAktSetzen(null);
  W.miniAntwort("r",0,5); W.miniAuswerten();
  spiele("mini_preis","richtig");
  const xp=S.xp, gespielt=JSON.stringify(m().gespielt);
  W.miniAuswerten(); W.miniAntwort("a",0);
  return (S.xp===xp&&JSON.stringify(m().gespielt)===gespielt)?true:"Zustand nach Doppelauswertung veraendert";
});
test("ROB-3","Alle Exporte liegen auf window und sind Funktionen",()=>{
  for(const n of ERLAUBT) if(typeof W[n]!=="function") return "fehlt: "+n;
  return true;
});
test("ROB-4","Kein console.error im gesamten Testlauf",()=>fehlerLog.length===0?true:fehlerLog[0]);

console.log(erg.join("\n"));
console.log("\n"+(erg.length-fail)+"/"+erg.length+" bestanden");
process.exit(fail?1:0);
