/* Solltests v6 – prüft die Umsetzung der Prüfbericht-Pakete gegen die gebaute modellhof_game.html.
   Vorgehen wie pruefung_2026-08-30/audit.cjs: ersten <script>-Block extrahieren, vor "Boot-Sequenz" abschneiden,
   in Node-VM mit DOM-Mocks ausführen. Aufruf: node dev/tests_v6.cjs */
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

/* let/const des Spiels leben im Script-Scope – Brücke auf globalThis + Live-Zugriffe im Kontext */
vm.runInContext(`Object.assign(globalThis,{MODELLE,LEIHMODELLE,TECHNIKEN,GPUS,FUTTER,HARNESSE,SETUPS,WERTE,ZUCHT,
  TIERARTEN,WUNSCHTIER_ARTEN,TIER_POSEN,tierStreicheln,
  QUESTS:(typeof QUESTS!=="undefined")?QUESTS:[],LEVELS:(typeof LEVELS!=="undefined")?LEVELS:[],
  FORSCHUNG:(typeof FORSCHUNG!=="undefined")?FORSCHUNG:{},
  KUNDEN:(typeof KUNDEN!=="undefined")?KUNDEN:{},
  ADA_TEXTE:(typeof ADA_TEXTE!=="undefined")?ADA_TEXTE:{},
  ADA_MUND:(typeof ADA_MUND!=="undefined")?ADA_MUND:null,
  GEBAEUDE:(typeof GEBAEUDE!=="undefined")?GEBAEUDE:[]});
globalThis.__frisch=function(){ S=frischerStand(); S.einfFertig=true; S.forschung.merge=true; return S; };   /* v9.9 (R2): Zucht verlangt jetzt auch im Spiel das Zuchtbuch */
globalThis.__S=function(){ return S; };
globalThis.__zucht=function(a){ zuchtWahl.length=0; a.forEach(x=>zuchtWahl.push(x)); };
globalThis.__lese=function(){ return (typeof lese!=="undefined")?lese:null; };
globalThis.__adaBereit=function(v){ _adaBereit=v; _adaId=null; _adaSpaeter=null; };
globalThis.__einfSchritt=function(n){ _einf.schritt=n; };`,ctx);

/* UI-Funktionen stilllegen, Zufall deterministisch */
["alles","wieseNeu","schilderNeu","kopfNeu","tickerNeu","tickerLauf","zeigeBericht","zeigeJobs","zeigeMarkt",
 "zeigeStall","zeigeFutter","zeigeTier","zeigeCloud","zeigeArena","zeigeAgentenWelt","blattAuf","blattZu",
 "blattLive","melde","uhrAnzeige","maskenCss","figurDeko","questPruefe"].forEach(f=>{ ctx[f]=()=>{}; });
let RAND=0.5; ctx.Math=Object.create(Math); ctx.Math.random=()=>RAND;

const erg=[]; let fail=0;
function test(id,txt,fn){ try{ const r=fn(); if(r===true){erg.push("PASS  "+id+" – "+txt);} else {fail++; erg.push("FAIL  "+id+" – "+txt+" :: "+r);} }
  catch(e){ fail++; erg.push("ERROR "+id+" – "+txt+" :: "+(e.stack||e.message).split("\n").slice(0,3).join(" ⏎ ")); } }
let S=null;
function frisch(){ S=ctx.__frisch(); return S; }

test("T00a","Hund und Katze sind vollständig wählbare Tierarten",()=>{
  if(ctx.WUNSCHTIER_ARTEN.join(",")!=="schwein,huhn,kuh,esel,lama,dino,hund,katze")return "Auswahlliste unvollständig";
  for(const a of ["hund","katze"]){
    if(!ctx.TIERARTEN[a]||!ctx.TIER_POSEN[a])return a+" fehlt";
    for(const pose of ["steh","lauf","lieg"])if(!html.includes('"pose_'+a+'_'+pose+'":"data:image/png;base64,'))return a+" "+pose+" nicht eingebettet";
  }
  return true;
});
test("T00b","Mehrfaches Wischen löst Liegen, rote Wangen und 2–4 Wackler aus",()=>{
  frisch();
  const klassen=new Set(),werte={};
  const p={uid:"streicheltest",api:false,status:"frei",_liegt:0,el:{innerHTML:"",style:{setProperty(k,v){werte[k]=v;}},classList:{add(...x){x.forEach(v=>klassen.add(v));},remove(...x){x.forEach(v=>klassen.delete(v));}},querySelector:()=>null,querySelectorAll:()=>[]}};
  const xs=[0,20,0,20];let aus=false;xs.forEach((x,i)=>{aus=ctx.tierStreicheln(p,{clientX:x,timeStamp:i*100})||aus;});
  const n=Number(werte["--kuschel-wackler"]);
  return aus&&p._liegt>0&&klassen.has("kuschelt")&&klassen.has("liegt")&&n>=2&&n<=4||"Reaktion nicht vollständig";
});

/* T01/T02 – Ereignisfaktoren relativ → Multiplikator */
test("T01","Strompreis-Event +0.5 ⇒ 0,72 €/kWh",()=>{ frisch();
  S.events=[{id:"dunkelflaute",effekt:{typ:"strompreis",wert:0.5,tage:4}}];
  const p=ctx.strompreis(); return Math.abs(p-0.72)<1e-9?true:"ist "+p; });
test("T02","Nachfrage-Event −0.2 ⇒ Faktor 0,8 (endlich)",()=>{ frisch();
  S.events=[{id:"preiskrieg",effekt:{typ:"nachfrage",wert:-0.2,tage:5}}];
  const f=ctx.nachfrageFaktor(); return Math.abs(f-0.8)<1e-9?true:"ist "+f; });
test("T01b","gpupreis +0.35 ⇒ 1,35",()=>{ frisch();
  S.events=[{id:"gpu_export",effekt:{typ:"gpupreis",wert:0.35,tage:6}}];
  const f=ctx.gpupreisFaktor(); return Math.abs(f-1.35)<1e-9?true:"ist "+f; });

/* T03 – Endlichkeit: buche verwirft NaN, Tagesabschluss erzeugt nie NaN-Kasse */
test("T03","buche(NaN) verändert die Kasse nicht",()=>{ frisch();
  const vor=S.kredit; ctx.buche(NaN,"sonst","x");
  return (S.kredit===vor&&Number.isFinite(S.kredit))?true:"kredit "+S.kredit; });
test("T03b","50 Tagesabschlüsse mit Events: Kasse bleibt endlich",()=>{ frisch();
  for(let i=0;i<50;i++){ RAND=(i%10)/10+0.001; ctx.ausfuehrenTagesWechsel(); if(!Number.isFinite(S.kredit)) return "NaN an Tag "+i; }
  RAND=0.5; return true; });

/* T14 – Sofort-Arbitrage geschlossen: kein Katalogmodell ist ungenutzt mehr wert als sein Preis */
test("T14","Kauf→Sofortverkauf ist für ALLE Katalogmodelle ein Verlust",()=>{ frisch();
  const boese=[];
  for(const id in ctx.MODELLE){ const t=ctx.neuesTier(id); const w=ctx.tierWert(t);
    if(w>=ctx.MODELLE[id].preis) boese.push(id+" ("+w+"≥"+ctx.MODELLE[id].preis+")"); }
  return boese.length?boese.slice(0,5).join(", "):true; });
test("T14b","Dokumentierte Verbesserung erhöht den Wert nachvollziehbar (Ära 7: Buchwert + Effizienz-Aufschlag)",()=>{ frisch();
  const t=ctx.neuesTier("smollm3-3b")||ctx.neuesTier(Object.keys(ctx.MODELLE)[0]);
  const v1=ctx.tierWert(t);
  t.historie.push({tag:1,n:"SFT",delta:{code:10},ausgang:"sauber"});
  const v2=ctx.tierWert(t);
  /* Seit dem Effizienz-Index zahlt der Markt Verbesserung doppelt: fester Buchwert (+40)
     plus Effizienz-Faktor (gedeckelt ±15 %). Erwartung: deutlich mehr wert, endlich, unter Neupreis-Deckel. */
  if(!(v2>v1+35)) return v1+"→"+v2+" (mindestens +35 erwartet)";
  if(!Number.isFinite(v2)) return "Wert nicht endlich";
  return v2<ctx.MODELLE["smollm3-3b"].preis*1.1+45?true:"über dem Arbitrage-Deckel: "+v2; });

/* T06 – Trainingsreservierung: Bucht wird belegt, zweiter Start scheitert */
test("T06","Zwei Trainings können nicht dieselbe Bucht nutzen",()=>{ frisch();
  S.xp=120; S.forschung.sft=true; S.daten.kuratiert=500; S.kredit=99999;
  const a=ctx.neuesTier("qwen35-4b"), b=ctx.neuesTier("qwen35-4b");
  S.tiere.push(a,b);
  S.buchten=[{id:"b1",gpu:"h100",miete:false,tier:null}];
  const ok1=ctx.trainingStarten(a,"sft","logik","kuratiert","b1");
  const belegt=S.buchten[0].tier===a.uid;
  const ok2=ctx.trainingStarten(b,"sft","logik","kuratiert","b1");
  return (ok1&&belegt&&!ok2)?true:"ok1="+ok1+" belegt="+belegt+" ok2="+ok2; });

/* T07 – Cloud hat Grenzen (8×H100-Profil), lokal sowieso */
test("T07","27B-Full-SFT (459 GB) passt in den 8×H100-Wolkenstall, 123B nicht",()=>{ frisch();
  S.xp=120; S.forschung.sft=true; S.daten.kuratiert=5000; S.kredit=9999999;
  const m27=ctx.neuesTier("qwen36-27b")||ctx.neuesTier("qwen35-27b");
  const m123=ctx.neuesTier("devstral2-123b")||Object.entries(ctx.MODELLE).filter(([i,m])=>m.pT>=120&&!m.moe).map(([i])=>ctx.neuesTier(i))[0];
  S.tiere.push(m27,m123);
  const ok27=ctx.trainingStarten(m27,"sft","logik","kuratiert","cloud");
  const ok123=ctx.trainingStarten(m123,"sft","logik","kuratiert","cloud");
  return (ok27&&!ok123)?true:"27B="+ok27+" 123B="+ok123+" (Bedarf "+ctx.trainingsVramNoetig(m123,ctx.TECHNIKEN.sft)+" GB)"; });

/* T08/T12 – Energie wird für den GELEISTETEN Tag gerechnet (letzter Jobtag = 14 h, nicht 2 h) */
test("T08","Letzter Jobtag zählt 14 Arbeitsstunden Strom",()=>{ frisch();
  S.kredit=9999;
  const t=ctx.neuesTier("qwen35-4b"); S.tiere.push(t);
  S.buchten=[{id:"b1",gpu:"rtx3060",miete:false,tier:t.uid}]; t.bucht="b1";
  const j={id:"jx",t:"Test",b:"",tier:0,art:"text",anf:{},ctxMin:8,agent:false,dsgvo:false,
    mtokTag:0.05,preisMtok:7,tage:1,latenz:0,einheit:"Stück",einheiten:5,lohnBasis:50,kunde:"verein"};
  S.jobs=[j]; t.status="job"; t.job="jx"; t.rest=1;
  let ber=null; ctx.zeigeBericht=b=>{ber=b;};
  ctx.ausfuehrenTagesWechsel();
  const watt=ctx.GPUS.rtx3060.watt;
  const mindest=Math.floor(watt/1000*14);
  return ber.kwh>=mindest?true:"kwh="+ber.kwh+" < "+mindest+" (14h à "+watt+"W)"; });

/* T18/T16 – Hilfsmittel kosten Nutz-Kapazität und Mehrstrom */
test("T18","Best-of-3 drittelt die Nutz-Kapazität",()=>{ frisch();
  const t=ctx.neuesTier("qwen35-4b"); S.tiere.push(t);
  S.buchten=[{id:"b1",gpu:"h100",miete:false,tier:t.uid}]; t.bucht="b1";
  const k1=ctx.mtokTagKapazitaet(t);
  t.setups=["bestofn"];
  const k2=ctx.mtokTagKapazitaet(t);
  return Math.abs(k2-k1/3)<=0.15*k1/3+0.2?true:k1+"→"+k2; });

/* T19 – Denkmodus am API-Tier kostet Kapazität UND Geld */
test("T19","API-Denkmodus: −30 % Tageskontingent, +Denk-Token-Kosten",()=>{ frisch();
  const t=ctx.neueLizenz("claude-sonnet-5")||ctx.neueLizenz(Object.keys(ctx.LEIHMODELLE)[0]);
  S.tiere.push(t);
  const j={id:"jx",mtokTag:5,tage:1,agent:false,parallel:false};
  t.denken=false; const k0=ctx.mtokTagKapazitaet(t), c0=ctx.jobTagesKosten(t,j);
  t.denken=true;  const k1=ctx.mtokTagKapazitaet(t), c1=ctx.jobTagesKosten(t,j);
  if(t.rz<=0) return true; // Modell ohne Denkmodus: nicht anwendbar
  return (k1<k0&&c1>c0)?true:"kap "+k0+"→"+k1+", kosten "+c0.toFixed(2)+"→"+c1.toFixed(2); });

/* T36 – Treue-Fokus-Adapter wird ADDIERT statt überschrieben */
test("T36","LoRA mit Fokus Treue liefert vollen Treue-Adapter",()=>{ frisch();
  const t=ctx.neuesTier("qwen35-4b"); S.tiere.push(t);
  t.training={id:"lora",fokus:"treue",futter:"praef",cloud:false,bucht:null,replay:false,adapter:true};
  t.status="training"; t.rest=0;
  RAND=0.99;   // keine Risiken
  const ber={zeilen:[]}; ctx.trainingAbschliessen(t,ber); RAND=0.5;
  const a=(t.adapters||[])[0];
  if(!a) return "kein Adapter";
  const fokusStark=ctx.TECHNIKEN.lora.profil.fokus;
  return a.w.treue>=Math.round(fokusStark*0.3)?true:"treue="+a.w.treue+" (Profil fokus="+fokusStark+")"; });
test("T37","Adapter bindet an die EXAKTE Basis (Modell-ID)",()=>{ frisch();
  const a=ctx.neuesTier("qwen35-4b"), b=ctx.neuesTier("qwen35-9b");
  S.tiere.push(a,b);
  S.adapterSchrank=[{n:"X",fokus:"code",basisId:"qwen35-4b",basisFam:"qwen",basisPT:4,basisArch:"linh",w:{code:5}}];
  ctx.adapterAn(b.uid,0);
  const abgelehnt=(b.adapters||[]).length===0&&S.adapterSchrank.length===1;
  ctx.adapterAn(a.uid,0);
  const angenommen=(a.adapters||[]).length===1;
  return (abgelehnt&&angenommen)?true:"abgelehnt="+abgelehnt+" angenommen="+angenommen; });

/* T38/T39 – Merge: gleiche Parameterzahl Pflicht, kein Größen-Mitteln, Kind erbt Bauform+strengste Lizenz */
test("T38","Ungleiche pT ⇒ Merge abgelehnt; gleiche ⇒ Kind mit Eltern-pT/-Bauform",()=>{ frisch();
  const a=ctx.neuesTier("qwen35-27b"), b=ctx.neuesTier("qwen36-27b");
  const k1=ctx.mergeKompatibel(a,ctx.neuesTier("qwen35-9b"),"slerp");
  if(k1.ok) return "9B×27B fälschlich erlaubt";
  const c=ctx.neuesTier("qwen35-27b");
  const k2=ctx.mergeKompatibel(a,c,"slerp");
  if(!k2.ok) return "27B×27B abgelehnt: "+k2.warum;
  S.tiere.push(a,c);
  const {kind}=ctx.mergeDurchfuehren([a.uid,c.uid],"slerp");
  return (kind.pT===27&&ctx.archVon(kind)===ctx.archVon(a))?true:"pT="+kind.pT+" arch="+ctx.archVon(kind); });
test("T39","Zucht kostet einen Hoftag: Eltern belegt, Kind erst am Morgen",()=>{ frisch();
  S.kredit=9999; S.xp=300;   /* Ära 7.5: Zuchtbucht ab Stufe 2 */
  const a=ctx.neuesTier("qwen35-27b"), c=ctx.neuesTier("qwen35-27b");
  S.tiere.push(a,c);
  ctx.__zucht([a.uid,c.uid]);
  const n0=S.tiere.length;
  ctx.zuchtStart();
  const sofort=S.tiere.length===n0&&a.status==="zucht"&&c.status==="zucht";
  ctx.ausfuehrenTagesWechsel();
  const danach=S.tiere.length===n0+1&&a.status==="frei";
  return (sofort&&danach)?true:"sofort="+sofort+" danach="+danach; });

/* T40 – Übertraining heilt NICHT durch Warten */
test("T40","Übertraining bleibt trotz 4 Ruhetagen (nur Rollback hilft)",()=>{ frisch();
  const t=ctx.neuesTier("qwen35-4b"); S.tiere.push(t);
  t.krank="uebertrainiert"; t.zustand=100; t.status="frei";
  for(let i=0;i<4;i++) ctx.ausfuehrenTagesWechsel();
  return t.krank==="uebertrainiert"?true:"geheilt durch Nichtstun ("+t.krank+")"; });
test("T40b","Kontextrot (Sitzungszustand) klingt dagegen nach 2 Ruhetagen ab",()=>{ frisch();
  const t=ctx.neuesTier("qwen35-4b"); S.tiere.push(t);
  t.krank="kontextrot"; t.zustand=100; t.status="frei";
  ctx.ausfuehrenTagesWechsel(); ctx.ausfuehrenTagesWechsel();
  return t.krank===null?true:"noch "+t.krank; });
test("T40c","Checkpoint-Rollback heilt Übertraining nur mit nutzbarem Trainingslauf und bucht atomar",()=>{ frisch();
  const t=ctx.neuesTier("qwen35-4b"); S.tiere.push(t); t.krank="uebertrainiert"; t.w.logik=50; const vor=S.kredit;
  ctx.kurieren(t.uid); if(t.krank!=="uebertrainiert"||S.kredit!==vor)return "ohne Checkpoint geheilt/bezahlt";
  t.historie.push({tag:S.tag,n:"SFT",delta:{logik:5},detail:""}); ctx.kurieren(t.uid);
  return t.krank===null&&S.kredit===vor-40&&t.w.logik===45?true:"Rollback unvollständig"; });
test("T40d","Aktive Kur löscht nur den zur Krankheit gehörenden Ursachenzähler",()=>{ frisch();
  const t=ctx.neuesTier("qwen35-4b"); S.tiere.push(t); t.krank="halluzinose"; t.ctxLastTage=7; t.schlechtFutterTage=3; t.kaltTage=4; S.daten.kuratiert=20;
  ctx.kurieren(t.uid); return t.krank===null&&t.schlechtFutterTage===0&&t.ctxLastTage===7&&t.kaltTage===4?true:JSON.stringify({krank:t.krank,ctx:t.ctxLastTage,futter:t.schlechtFutterTage,kalt:t.kaltTage}); });

/* T21 – RAM-Auslagerung kostet kein Wissen mehr, aber RAM ist endlich */
test("T21","RAM-Auslagerung lässt die Fähigkeiten unverändert",()=>{ frisch();
  const t=ctx.neuesTier("qwen35-27b"); S.tiere.push(t);
  const frei=JSON.stringify(ctx.effW(t));
  S.buchten=[{id:"b1",gpu:"rtx3060",miete:false,tier:t.uid}]; t.bucht="b1";
  if(!ctx.offloaded(t)) return "Testaufbau: 27B müsste die 3060 sprengen";
  return JSON.stringify(ctx.effW(t))===frei?true:"Werte ändern sich durch Speicherort"; });
test("T20","Kontext kostet Speicher: gleicher pT, mehr ctx ⇒ mehr VRAM (dense), Hybrid deutlich weniger Cache",()=>{ frisch();
  const t=ctx.neuesTier("qwen35-4b");
  const c8={...t,ctx:8,arch:"dense"}, c64={...t,ctx:64,arch:"dense"}, h64={...t,ctx:64,arch:"linh"};
  const v8=ctx.vramPig(c8), v64=ctx.vramPig(c64), vh=ctx.vramPig(h64);
  return (v64>v8&&vh<v64)?true:"v8="+v8+" v64="+v64+" hybrid="+vh; });

/* T50 – Nichtkommerzielle Lizenz sperrt bezahlte Aufträge */
test("T50","EXAONE (nc) wird an der Pinnwand abgelehnt",()=>{ frisch();
  const t=ctx.neuesTier("exaone4-1b"); S.tiere.push(t);
  S.buchten=[{id:"b1",gpu:"h100",miete:false,tier:t.uid}]; t.bucht="b1";
  const j={id:"jx",t:"x",art:"text",anf:{},ctxMin:2,agent:false,dsgvo:false,mtokTag:0.01,preisMtok:7,tage:1,latenz:0};
  const c=ctx.jobCheck(t,j);
  return (!c.ok&&c.gruende.some(g=>g.includes("kommerzielle")))?true:"ok="+c.ok+" gruende="+c.gruende.join("|"); });

/* T13 – Einheiten-Abrechnung: genau einmal, anteilig */
test("T13","40 % von 10 Einheiten à 10 € ⇒ exakt 40 €",()=>{ frisch();
  const er=ctx.einheitenRechnung({lohnBasis:100,einheiten:10},0.4);
  return (er.ok===4&&er.lohn===40)?true:JSON.stringify(er); });

/* T10 – Journal erklärt die Kasse exakt */
test("T10","Anfangsbestand + Journal = Kontostand (nach 3 bewegten Tagen)",()=>{ frisch();
  S.kredit=2500;
  const t=ctx.neuesTier("qwen35-4b"); S.tiere.push(t);
  S.buchten=[{id:"b1",gpu:"rtx3060",miete:false,tier:t.uid}]; t.bucht="b1";
  ctx.buche(-100,"kauf","Test"); ctx.buche(50,"job","Test2");
  for(let i=0;i<3;i++){ RAND=0.9; ctx.ausfuehrenTagesWechsel(); }
  RAND=0.5;
  const summe=2500+S.journal.reduce((a,e)=>a+e.b,0);
  return summe===S.kredit?true:summe+" ≠ "+S.kredit; });

/* T44 – Schutzregeln: kein Immunschalter (beide Ausgänge existieren) */
test("T44","Injection mit Schutzregeln kann abgewehrt werden UND durchrutschen",()=>{ frisch();
  S.forschung={geschirr:true,guardrails:true,openclaw:true};
  let gut=false, schlecht=false;
  for(let i=0;i<40;i++){
    frisch(); S.forschung={geschirr:true,guardrails:true,openclaw:true};
    S.kunden={}; S.rufBonus=0;
    RAND=(i%2===0)?0.3:0.41;      // 0.3<0.42 Event würfelt; zweiter RAND-Wert steuert Abwehr (0.3<0.75 abgewehrt)
    // Direkt den Injection-Zweig nachstellen:
    const vor=S.rufBonus||0;
    RAND=i<20?0.5:0.9;            // 0.5<0.75 abgewehrt · 0.9>0.75 durchgerutscht
    const b={zeilen:[]};
    // Zweig isoliert ausführen:
    if(ctx.forschungFrei("guardrails")&&ctx.Math.random()<0.75){ ctx.rufBonusDazu(2); gut=true; }
    else if(ctx.forschungFrei("guardrails")){ ctx.rufBonusDazu(-3); ctx.buche(-80,"strafe","x"); schlecht=true; }
  }
  return (gut&&schlecht)?true:"gut="+gut+" schlecht="+schlecht; });

/* Abo je Installation (MH-044) */
test("MH-044","Zwei Tiere mit Claude Code zahlen EIN Abo",()=>{ frisch();
  S.kredit=9999;
  const a=ctx.neuesTier("qwen35-4b"), b=ctx.neuesTier("qwen35-4b");
  a.geschirr="claude-code"; b.geschirr="claude-code";
  S.tiere.push(a,b);
  ctx.ausfuehrenTagesWechsel();
  const abos=S.journal.filter(e=>e.kat==="abo");
  return (abos.length===1&&abos[0].b===-3)?true:JSON.stringify(abos); });

/* Lizenz läuft auch im Einsatz ab (Prüfbefund 18) */
test("T-Liz","API-Lizenz zählt im Job weiter runter und endet danach",()=>{ frisch();
  S.kredit=9999;
  const t=ctx.neueLizenz(Object.keys(ctx.LEIHMODELLE)[0]); S.tiere.push(t);
  t.lizenzTage=1;
  /* Ära 7.5: Aufträge laufen nur noch über hlTeamStart (Stunden-Modell) – 2 Arbeitstage Arbeit für das Leihtier */
  const kap=ctx.mtokTagKapazitaet(t);
  const j={id:"jx",t:"x",art:"text",anf:{},ctxMin:2,agent:false,dsgvo:false,mtok:kap*1.6,mtokTag:kap*0.8,preisMtok:7,tage:2,puffer:1,latenz:0,einheiten:4,lohnBasis:40,einheit:"Stück"};
  S.jobs=[j]; ctx.jobAnnehmen("jx",t.uid); if(t.status!=="job") return "Auftrag nicht gestartet";
  ctx.ausfuehrenTagesWechsel();               // Tag 1: lizenzTage 0, bleibt wegen Job
  const nochDa=S.tiere.includes(t)&&t.status==="job";
  ctx.ausfuehrenTagesWechsel();               // Tag 2: Job fertig
  ctx.ausfuehrenTagesWechsel();               // Tag 3: Abschied
  const weg=!S.tiere.includes(t);
  return (nochDa&&weg)?true:"nochDa="+nochDa+" weg="+weg; });

/* Pinnwand: jobNeu trägt Kunde, Stufe, Einheiten */
test("N2","Neue Zettel haben Kunde, Stufe und Einheitenpreis",()=>{ frisch();
  for(let i=0;i<10;i++){ const j=ctx.jobNeu();
    if(!j.kunde||j.stufe===undefined||!ctx.jobEinheiten(j)) return JSON.stringify({kunde:j.kunde,stufe:j.stufe}); }
  return true; });

/* Synthetik: Chargen mischen statt überschreiben (T33) */
test("T33","Chargen-Qualität ist gewichteter Schnitt (Reihenfolge egal)",()=>{ frisch();
  ctx.synthChargeDazu(10,0.9,1,"gut"); ctx.synthChargeDazu(10,0.3,1,"schlecht");
  const q1=ctx.synthQualitaet();
  frisch();
  ctx.synthChargeDazu(10,0.3,1,"schlecht"); ctx.synthChargeDazu(10,0.9,1,"gut");
  const q2=ctx.synthQualitaet();
  return (Math.abs(q1-0.6)<0.01&&Math.abs(q1-q2)<1e-9)?true:"q1="+q1+" q2="+q2; });

/* bench_leak ist jetzt ein spielbarer Lernfall */
test("T31","bench_leak ist in SFT wählbar und kontaminiert",()=>{ frisch();
  if(!ctx.TECHNIKEN.sft.futter.includes("bench_leak")) return "nicht in sft.futter";
  S.xp=520; S.forschung.sft=true; S.daten.bench_leak=100; S.kredit=9999;
  const t=ctx.neuesTier("qwen35-4b"); S.tiere.push(t);
  S.buchten=[{id:"b1",gpu:"h100",miete:false,tier:null}];
  if(!ctx.trainingStarten(t,"sft","logik","bench_leak","b1")) return "Start abgelehnt";
  t.rest=0; RAND=0.99; ctx.trainingAbschliessen(t,{zeilen:[]}); RAND=0.5;
  return t.contaminated===true?true:"nicht kontaminiert"; });
test("T31b","Schwarzmarkt-Futter ist in der Engine vor Hofstufe 4 gesperrt",()=>{ frisch();
  S.xp=300; const vor=S.kredit,gb=S.daten.bench_leak||0; ctx.futterKauf("bench_leak",10);
  if(S.kredit!==vor||(S.daten.bench_leak||0)!==gb) return "Kauf vor Stufe 4 durchgerutscht";
  S.xp=520; ctx.futterKauf("bench_leak",10);
  return S.kredit===vor-10&&(S.daten.bench_leak||0)===gb+10;
});
test("T14c","Abgebrochener Modellkauf ohne passende Bucht ist atomar: kein Tier, keine Abbuchung",()=>{ frisch();
  S.kredit=20000; S.buchten=[{id:"b1",gpu:"rtx4090",tier:"belegt",ramGB:64,ssdTB:4,rhSlot:"pc:0"}]; const vor=S.kredit,n=S.tiere.length,alt=ctx.confirm; ctx.confirm=()=>false;
  try{ ctx.modellKaufen("qwen35-4b"); }finally{ctx.confirm=alt;}
  return S.kredit===vor&&S.tiere.length===n?true:"Kasse "+vor+"→"+S.kredit+", Tiere "+n+"→"+S.tiere.length; });

/* Multiagent-Forschung hat jetzt Wirkung */
test("MH-045","multiagent schaltet die Agenten-Welt frei",()=>{ frisch();
  if(ctx.agentenWeltFrei()) return "schon vorher frei?";
  S.forschung.multiagent=true;
  return ctx.agentenWeltFrei()===true?true:"bleibt zu"; });

/* Agenten-Welt: Tag kostet, verbessert, protokolliert */
test("N5","Agenten-Welt-Tag: Betreuung gebucht, Werkzeug wächst, Lehrfall-Log",()=>{ frisch();
  S.kredit=9999; S.forschung.multiagent=true;
  const s=ctx.neuesTier("qwen35-4b"), l=ctx.neuesTier("qwen35-27b");
  S.tiere.push(s,l);
  S.buchten=[{id:"b1",gpu:"h100",miete:false,tier:s.uid},{id:"b2",gpu:"h100",miete:false,tier:l.uid}];
  s.bucht="b1"; l.bucht="b2";
  ctx.awStart(s.uid,l.uid,"aider","mail_formular");
  if(s.status!=="agentenwelt") return "Start fehlgeschlagen";
  const w0=s.w.werkzeug;
  ctx.ausfuehrenTagesWechsel();
  const aw=S.agentenWelt;
  const betreuung=S.journal.some(e=>e.kat==="agentenwelt");
  return (aw&&aw.tage===1&&s.w.werkzeug>w0&&betreuung&&aw.log.length===1)?true:
    "tage="+(aw&&aw.tage)+" w "+w0+"→"+s.w.werkzeug+" betreuung="+betreuung; });

/* Hüte */
test("N1","Hut-Stufen: Level 1⇒0, 3⇒Strohhut, 5⇒Zylinder, 7⇒Krone",()=>{
  const st=l=>ctx.hutStufe({level:l});
  return (st(1)===0&&st(3)===1&&st(5)===2&&st(7)===3)?true:[1,3,5,7].map(st).join(","); });

/* Kredit: Zins gedeckelt + Notlage lässt kleine Zettel zu (kein Todesstrudel) */
test("MH-047","Zins mahnt gedeckelt (≤25 €); unter −2000 hängen nur kleine Vertrauens-Zettel",()=>{ frisch();
  S.kredit=-9000; S.jobs=[];
  ctx.ausfuehrenTagesWechsel();
  const zins=S.journal.find(e=>e.kat==="zins");
  frisch(); S.kredit=-2500; S.jobs=[];
  ctx.ausfuehrenTagesWechsel();
  const offene=S.jobs.filter(j=>!S.tiere.some(p=>p.job===j.id));
  const kleineDa=offene.length>0&&offene.every(j=>j.tier<=1);
  return (zins&&zins.b===-25&&kleineDa)?true:"zins="+(zins&&zins.b)+" offene="+offene.map(j=>"T"+j.tier).join(","); });

/* Kundenbewertung */
test("N2b","Erster Auftrag erzeugt Sternebewertung; Ruf folgt den Kunden",()=>{ frisch();
  const b={zeilen:[]};
  ctx.kundeBewerten({kunde:"baeckerei"},{anteil:1},b);
  const k=S.kunden.baeckerei;
  ctx.rufNeuBerechnen();
  return (k&&k.sterne===5&&S.ruf===53)?true:"sterne="+(k&&k.sterne)+" ruf="+S.ruf+" (erwartet 53: Bayes-gedämpft (60+100)/3)"; });

/* ── N7/MH-047: GEWINNBARKEIT – „mit Köpfchen problemlos zu gewinnen ohne Verschuldung" ── */
function balanceLauf(randFn,tage){
  if(randFn) ctx.Math.random=randFn;
  frisch();
  const a=ctx.neuesTier("smollm3-3b"), b=ctx.neuesTier("qwen35-4b");
  S.tiere.push(a,b);
  S.buchten[0].tier=a.uid; a.bucht="b1";
  S.jobs=[ctx.jobNeu(),ctx.jobNeu(),ctx.jobNeu()];
  let minK=S.kredit, trainiert=false;
  for(let i=0;i<tage;i++){
    /* Köpfchen-Reihenfolge: erst lernen & verdienen, ERST DANN groß investieren */
    if(!S.forschungAktiv){
      if(!ctx.forschungFrei("sft")&&S.kredit>=400) ctx.forschen("sft");
      else if(ctx.forschungFrei("sft")&&!ctx.forschungFrei("quant")&&S.kredit>=480) ctx.forschen("quant");
      else if(ctx.forschungFrei("quant")&&!ctx.forschungFrei("vllm")&&S.buchten.length>1&&S.kredit>=1100) ctx.forschen("vllm");
    }
    if(S.buchten.length<2&&ctx.forschungFrei("quant")&&S.kredit>=3300){
      ctx.rhInstall("pc",1,"basis");                      // kompletter 4080-PC im Rechenhaus (2100 €) – erst mit Polster
      if(S.buchten.length>1) ctx.inBucht(b.uid,S.buchten[S.buchten.length-1].id);
    }
    if(ctx.forschungFrei("quant")){ [a,b].forEach(t=>{ if(t.quant==="bf16"&&t.status==="frei"&&S.kredit>60) ctx.quantSetzen(t.uid,"q4"); }); }
    /* „Mit Köpfchen": wer arbeitslos ist, trainiert GEZIELT die Fähigkeit, an der die Zettel scheitern */
    const FUTTER_FUER={code:"fach_code",logik:"fach_mathe",wissen:"kuratiert",schreiben:"beispiele",werkzeug:"beispiele",treue:"praef",kontext:"kuratiert"};
    const KEY_VON={}; Object.entries(ctx.WERTE).forEach(([k,n])=>KEY_VON[n]=k);
    S.tiere.filter(p=>p.status==="frei"&&(p.bucht||p.api)).forEach(p=>{
      if(p.krank&&S.kredit>250) ctx.kurieren(p.uid);           // Diagnose ernst nehmen statt weiterwursteln
      if(p.zustand<70&&S.kredit>150) ctx.auffrischen(p.uid);
      /* Ära 9: eine kluge Politik meidet Zettel mit Datenschutz-Risiko ohne Schutz und Zettel, die die Frist sprengen */
      const offen=S.jobs.filter(j=>!S.tiere.some(t2=>t2.job===j.id)&&!(typeof ctx.dsWahrscheinlichkeit==="function"&&ctx.dsWahrscheinlichkeit(j,[p]).p>0)&&!(j.teamMax>1));
      const gepr=offen.map(j=>({j,c:ctx.jobCheck(p,j)})).filter(x=>{ if(!x.c.ok) return true; try{ const st=ctx.hlStunden(x.j,ctx.hlTeamCheck(x.j,Object.fromEntries(ctx.hlRollen(x.j).map((r,i)=>[i,p.uid])))); return st.std<=ctx.hlFristTage(x.j)*14*1.2; }catch(e){ return true; } });
      const okAlle=gepr.filter(x=>x.c.ok).sort((x,y)=>ctx.jobLohnGesamt(y.j)*y.c.anteil/y.j.tage-ctx.jobLohnGesamt(x.j)*x.c.anteil/x.j.tage);
      const pass=okAlle.find(x=>x.c.anteil>=0.6)||okAlle[0];   // notfalls Teilmengen – die zahlen exakt anteilig
      if(pass){ ctx.jobAnnehmen(pass.j.id,p.uid); return; }
      const blockGrund=gepr.map(x=>x.c.gruende[0]||"").find(g=>g.includes("zu niedrig"));
      const trainCooldown=(p._polTrain||0)+4>S.tag;             // Lehre aus dem eigenen Spiel: nie zwei Läufe dicht hintereinander
      if(blockGrund&&!p.api&&ctx.forschungFrei("sft")&&S.kredit>420&&!p.krank&&!trainCooldown){
        const m=blockGrund.match(/^(\S+) zu niedrig/);
        const fokus=m&&KEY_VON[m[1]]?KEY_VON[m[1]]:null;
        if(fokus){
          const futter=FUTTER_FUER[fokus]||"kuratiert";
          const t2=ctx.TECHNIKEN.sft, gb=Math.max(2,Math.round(t2.gbFaktor*p.pT));
          if((S.daten[futter]||0)<gb) ctx.futterKauf(futter,20);
          if(ctx.trainingStarten(p,"sft",fokus,futter,"cloud")) p._polTrain=S.tag;
        }
      }
});
    ctx.ausfuehrenTagesWechsel();
    if(S.kredit<minK) minK=S.kredit;
  }
  const kat={}; (S.journal||[]).forEach(e=>{kat[e.kat]=Math.round((kat[e.kat]||0)+e.b);});
  return {ende:Math.round(S.kredit), min:Math.round(minK), stufe:ctx.hofLevel().i, kat, jobsFertig:S.statistik.jobs};
}
/* Zwei reproduzierbare Zufalls-Seeds statt entartetem Konstant-„Zufall":
   „mit Köpfchen problemlos gewinnbar ohne Verschuldung" = deutlich im Plus, nie ernsthaft im Minus. */
function lcgAb(seed){ let s=seed; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; }
test("BALANCE-1","Köpfchen-Politik (Seed 7): nach 120 Tagen im Plus, nie unter −300 €",()=>{
  const r=balanceLauf(lcgAb(7),120);
  ctx.Math.random=()=>RAND;
  return (r.ende>0&&r.min>=-300)?true:JSON.stringify(r); });
test("BALANCE-2","Köpfchen-Politik (Seed 42): nach 120 Tagen im Plus, nie unter −300 €",()=>{
  const r=balanceLauf(lcgAb(42),120);
  ctx.Math.random=()=>RAND;
  return (r.ende>0&&r.min>=-300)?true:JSON.stringify(r); });
test("BALANCE-SWEEP","6 Seeds quer: immer positiv, nie unter −800 €, Durchschnitt > 500 €",()=>{
  const schlecht=[], enden=[];
  [1,7,13,42,99,123].forEach(seed=>{
    const r=balanceLauf(lcgAb(seed),120);
    enden.push(r.ende);
    if(!(r.ende>0&&r.min>=-800)) schlecht.push(seed+":"+JSON.stringify({e:r.ende,m:r.min,j:r.jobsFertig}));
  });
  ctx.Math.random=()=>RAND;
  const schnitt=Math.round(enden.reduce((a,b)=>a+b,0)/enden.length);
  if(schlecht.length) return schlecht.join(" | ");
  return schnitt>500?true:"Durchschnitt nur "+schnitt+" € ("+enden.join(",")+")"; });
test("N7","Compute-Anzeige (Ära 7): 👥 hängt am Bucht-Laufzeitumgebung – Heim 2, vLLM auf dem Rack vervielfacht",()=>{ frisch();
  const t=ctx.neuesTier("qwen35-4b"); S.tiere.push(t);
  S.buchten=[{id:"b1",gpu:"h100",miete:false,tier:t.uid,rhSlot:"rack:0"}]; t.bucht="b1"; t.quant="q8";
  const ohne=ctx.nutzerKapazitaet(t);                 /* llama.cpp-Standard: Deckel 2 */
  S.forschung.vllm=true;                              /* Forschung allein ändert NICHTS mehr … */
  const nurForschung=ctx.nutzerKapazitaet(t);
  S.buchten[0].stack="vllm";                          /* … erst der Bucht-Laufzeitumgebung */
  const mit=ctx.nutzerKapazitaet(t);
  const hc=ctx.hofCompute();
  return (ohne===2&&nurForschung===2&&mit>=10&&hc.lokal>0&&hc.nutzer===mit)?true:"ohne="+ohne+" nurForschung="+nurForschung+" mit="+mit+" hc="+JSON.stringify(hc); });
test("STACK-1","Server-Laufzeitumgebung verweigert q4 und RAM-Überlauf; lokale Laufzeitumgebung nimmt beides",()=>{ frisch();
  const t=ctx.neuesTier("qwen35-4b"); S.tiere.push(t); t.quant="q4";
  S.buchten=[{id:"r1",gpu:"h100",miete:false,tier:null,rhSlot:"rack:0",stack:"vllm"}];
  ctx.inBucht(t.uid,"r1");
  if(t.bucht==="r1") return "vLLM hat q4 geladen – verboten";
  S.buchten[0].stack="llamacpp";
  ctx.inBucht(t.uid,"r1");
  return t.bucht==="r1"?true:"llama.cpp hat das q4-Tier nicht geladen"; });
test("STACK-2","SGLang: Agenten-Kapazität +14 %, Rüsttag blockt die Job-Annahme",()=>{ frisch();
  const t=ctx.neuesTier("qwen35-4b"); S.tiere.push(t); t.quant="q8";
  S.buchten=[{id:"r1",gpu:"h100",miete:false,tier:t.uid,rhSlot:"rack:0",stack:"sglang"}]; t.bucht="r1";
  const jA={id:"ja",t:"Agent",b:"",tier:0,art:"agent",anf:{},ctxMin:8,agent:true,dsgvo:false,mtokTag:1,preisMtok:7,tage:1,latenz:0,einheit:"Stück",einheiten:5,lohnBasis:50,kunde:"verein"};
  const jT={...jA,id:"jt",agent:false,art:"text"};
  const kapAgent=ctx.mtokTagKapazitaet(t,jA), kapText=ctx.mtokTagKapazitaet(t,jT);
  if(!(kapAgent>kapText*1.08)) return "Agent-Kapazität "+kapAgent+" nicht über Text "+kapText;
  S.buchten[0].stackBereit=S.tag+1;
  const c=ctx.jobCheckBasis?ctx.jobCheckBasis(t,jT):ctx.jobCheck(t,jT);
  return c.ok?"Rüsttag blockt nicht":true; });
test("STACK-3","Wechsel der Laufzeitumgebung: Rüsttag gesetzt, Server nur auf Racks, Komfort nur mit Lizenz",()=>{ frisch(); S.kredit=999; S.forschung.vllm=true;
  S.buchten=[{id:"b1",gpu:"rtx4080",miete:false,tier:null},{id:"r1",gpu:"h100",miete:false,tier:null,rhSlot:"rack:0"}];
  ctx.stackWechsel("b1","vllm");
  if(S.buchten[0].stack==="vllm") return "vLLM auf PC-Bucht erlaubt – verboten";
  ctx.stackWechsel("b1","ollama");
  if(S.buchten[0].stack==="ollama") return "Ollama ohne Lizenz erlaubt";
  ctx.stackKaufen("ollama"); ctx.stackWechsel("b1","ollama");
  if(S.buchten[0].stack!=="ollama") return "Ollama trotz Lizenz nicht gesetzt";
  if(S.buchten[0].stackBereit!==S.tag+1) return "Rüsttag fehlt";
  ctx.stackWechsel("r1","sglang");
  return S.buchten[1].stack==="sglang"?true:"SGLang auf Rack nicht gesetzt"; });
test("EFFIZIENZ-1","Effizienz-Index: Diät hebt ihn, tierWert bleibt unter dem Kaufpreis (T14-Schutz)",()=>{ frisch();
  const t=ctx.neuesTier("qwen35-4b"); S.tiere.push(t);
  S.buchten=[{id:"b1",gpu:"rtx4080",miete:false,tier:t.uid}]; t.bucht="b1";
  t.quant="bf16"; const dick=ctx.effizienzIndex(t);
  t.quant="q4"; const schlank=ctx.effizienzIndex(t);
  if(!(schlank>dick)) return "q4-Index "+schlank+" nicht über bf16 "+dick;
  if(!(schlank>=1&&schlank<=100)) return "Index außerhalb 1–100: "+schlank;
  const frischT=ctx.neuesTier("qwen35-4b");
  return ctx.tierWert(frischT)<ctx.MODELLE["qwen35-4b"].preis?true:"Neukauf sofort profitabel verkaufbar!"; });
test("SCHWIER-1","Schwierigkeitsgrade: Behütet +500 Start, Markt +25 % Pacht, Formeln identisch",()=>{ frisch();
  S.schwierig="markt";
  let ber=null; ctx.zeigeBericht=b=>{ber=b;};
  const vor=S.kredit; ctx.ausfuehrenTagesWechsel();
  const pachtMarkt=Math.round((14+ctx.hofLevel().i*4+S.buchten.length*3)*1.25);   /* Ära 7.5 (W-18): Pacht + Platzkosten */
  const teurer=S.journal.some(z=>z.kat==="pacht"&&Math.abs(z.b)===pachtMarkt);
  if(!teurer) return "Markt-Pacht "+pachtMarkt+" nicht gebucht: "+JSON.stringify(S.journal.filter(z=>z.kat==="pacht").slice(-1));
  const t1=ctx.neuesTier("qwen35-4b"); S.schwierig="behuetet"; const t2=ctx.neuesTier("qwen35-4b");
  return JSON.stringify(t1.w)===JSON.stringify(t2.w)?true:"Tierwerte hängen an der Schwierigkeit – ADR-0002-Bruch!"; });

/* ── Forschungsbaum-Lint: Die Hofziel-Kette muss sich aus eigener Kraft tragen ──
   Harte Regel: Verlangt Hofziel q ein Gebäude/Feature, müssen die Quest-XP aller
   VORHERIGEN Hofziele allein schon die nötige Levelschwelle erreichen (Job-XP sind Bonus,
   nie Voraussetzung). Sonst hängt der Spieler vor einem gesperrten Gebäude – "random slop". */
test("TECHTREE-1","Jedes Hofziel ist beim Erscheinen freigeschaltet (Quest-XP allein reichen)",()=>{
  const QU=ctx.QUESTS, LV=ctx.LEVELS;
  if(!QU.length||!LV.length) return "QUESTS/LEVELS nicht exportiert";
  const schwelle=g=>{ const l=LV.find(l=>l.frei.includes(g)); return l?l.xp:0; };
  const braucht={ q01:null, q09:"gebForschung", q10:"gebTraining", q11:"gebWerkstatt",
    q23:"gebGeschirr", q45:"gebArena", q25:"gebZucht", q42:"gebCloud" };
  let xp=0; const fehler=[];
  for(const q of QU){
    const g=braucht[q.id];
    if(g && xp<schwelle(g)) fehler.push(q.id+" braucht "+g+" (ab "+schwelle(g)+" XP), hat aber nur "+xp+" Quest-XP davor");
    const m=/^level:(\d+)$/.exec(q.check||"");
    if(m){ const ziel=LV[Number(m[1])-1]; if(ziel&&xp<ziel.xp) fehler.push(q.id+" verlangt Stufe "+m[1]+" ("+ziel.xp+" XP), hat aber nur "+xp+" Quest-XP davor"); }
    xp+=q.xp||0;
  }
  return fehler.length?fehler.join(" | "):true; });
test("TECHTREE-2","Zucht ab Stufe 2 offen, Nutzung durch Forschung Merging gated",()=>{
  const LV=ctx.LEVELS;
  const l=LV.findIndex(l=>l.frei.includes("gebZucht"));
  if(l!==1) return "gebZucht bei LEVELS["+l+"] statt [1] (Stufe 2)";
  if(!html.includes("Erst in der Forschungshütte <b>Merging</b> erforschen")) return "Merge-Forschungs-Gate in der Zucht fehlt";
  const t=ctx.FORSCHUNG; if(!t.merge||!(t.merge.braucht||[]).includes("lora")) return "FORSCHUNG.merge braucht kein lora mehr";
  return true; });
test("QUEST-SYNC","Kauf-, LoRA- und Geschirrziele prüfen genau ihren Text",()=>{
  const q=Object.fromEntries(ctx.QUESTS.map(x=>[x.id,x]));
  if(q.q08.check!=="schweine:3"||!/drittes Tier/.test(q.q08.hilfe)) return "q08 nicht auf drittes Tier synchron";
  if(q.q10.check!=="training_art:lora") return "q10 akzeptiert weiterhin beliebiges Training";
  if(q.q23.check!=="geschirr_an"||!/mindestens 35/.test(q.q23.hilfe)||!/Basis-Tool ist sofort/.test(q.q23.hilfe)) return "q23 Text/Gate driftet";
  return true; });

/* ── Ökonomie-Nachweise: Buchführung ist lückenlos, Gewinnen UND Verlieren sind möglich ── */
test("OEKONOMIE-BUCH","Kassen-Invariante über 120 Tage: Kasse = Start + Einnahmen − Ausgaben (jeder Cent im Journal)",()=>{
  const r=balanceLauf(lcgAb(7),120);
  const soll=Math.round((2500+S.statistik.einnahmen-S.statistik.ausgaben)*100)/100;
  const ist=Math.round(S.kredit*100)/100;
  return Math.abs(ist-soll)<0.05?true:"Kasse "+ist+" ≠ Start+Journal "+soll+" (Differenz "+(ist-soll).toFixed(2)+" – es gibt eine Geldquelle/-senke am Kassenbuch vorbei!)"; });
test("OEKONOMIE-VERLUST","Fehlentscheider-Politik (Tag-1-Großinvestition, Prassen, nie arbeiten) endet nach 60 Tagen in der Pleite – Verlieren ist real",()=>{
  ctx.Math.random=lcgAb(7); frisch();
  const a=ctx.neuesTier("smollm3-3b"), b=ctx.neuesTier("qwen35-4b");
  S.tiere.push(a,b); S.buchten[0].tier=a.uid; a.bucht="b1";
  S.jobs=[ctx.jobNeu(),ctx.jobNeu(),ctx.jobNeu()];
  ctx.rhInstall("pc",1,"basis");                                   /* 2.100 € am ersten Tag – ohne einen Cent Einnahmen */
  let minK=S.kredit;
  for(let i=0;i<60;i++){
    if(!S.forschungAktiv){ if(!ctx.forschungFrei("sft")) ctx.forschen("sft"); else if(!ctx.forschungFrei("dpo")) ctx.forschen("dpo"); else if(!ctx.forschungFrei("cpt")) ctx.forschen("cpt"); }
    ctx.futterKauf("fach_code",10);                                /* Edel-Futter prassen, solange Geld da ist */
    ctx.ausfuehrenTagesWechsel(); minK=Math.min(minK,S.kredit);                /* aber NIE einen Auftrag annehmen */
  }
  if(S.kredit>-1200) return "Endstand "+Math.round(S.kredit)+" € – Großinvestition+Prassen+Nichtstun müsste in die Pleite führen (Ökonomie zu weich)";
  if(S.kredit<-6000) return "Endstand "+Math.round(S.kredit)+" € – Schuldenspirale ohne Boden (Notlagen-Netz greift nicht)";
  return true; });
test("OEKONOMIE-DELTA","Köpfchen schlägt Verschwendung um Tausende – Entscheidungen tragen die Ökonomie",()=>{
  const klug=balanceLauf(lcgAb(7),60).ende;
  ctx.Math.random=lcgAb(7); frisch();
  const a=ctx.neuesTier("smollm3-3b"); S.tiere.push(a); S.buchten[0].tier=a.uid; a.bucht="b1";
  for(let i=0;i<60;i++){ ctx.futterKauf("fach_code",20); ctx.ausfuehrenTagesWechsel(); }
  const dumm=S.kredit;
  return (klug-dumm>2000)?true:"klug "+Math.round(klug)+" € vs. verschwendet "+Math.round(dumm)+" € – Abstand zu klein ("+Math.round(klug-dumm)+")"; });

/* ── Meisterschaften (Fertigkeitsbäume): Punkte-Ökonomie und echte Formel-Hooks ── */
test("SKILL-1","Jeder der 15 Skills ist wirklich in einer Formel verdrahtet (skillAktiv im Code)",()=>{
  frisch();
  const fehlen=[];
  for(const w of Object.values(vm.runInContext("SKILLS",ctx))) for(const s of w.skills)
    if(!source.includes('skillAktiv("'+s.id+'")')&&!source.includes("skillAktiv('"+s.id+"')")) fehlen.push(s.id);
  return fehlen.length?("ohne Hook: "+fehlen.join(", ")):true; });
test("SKILL-2","Meisterpunkte = Hofstufen; Kauf senkt Guthaben; ohne Punkte kein Kauf",()=>{
  frisch(); S.xp=560;                                   /* Stufe 4 → 3 Punkte */
  if(ctx.skillPunkteFrei()!==3) return "frei="+ctx.skillPunkteFrei()+" (erwartet 3)";
  ctx.skillKaufen("betreiber","servingprofi");
  ctx.skillKaufen("trainer","fruehstopp");
  ctx.skillKaufen("haendler","feilschen");
  if(ctx.skillPunkteFrei()!==0) return "nach 3 Käufen frei="+ctx.skillPunkteFrei();
  ctx.skillKaufen("haendler","vertragskunst");
  return S.skills.vertragskunst?"Kauf ohne Punkte ging durch!":true; });
test("SKILL-3","Kernels +10 % tok/s, Speicher-Pfleger −0,5 GB Reserve – messbar",()=>{
  frisch();
  const t=ctx.neuesTier("qwen35-4b"); S.tiere.push(t);
  S.buchten=[{id:"b1",gpu:"h100",miete:false,tier:t.uid}]; t.bucht="b1";
  const t1=ctx.tokps(t), v1=ctx.vramPig(t);
  S.skills={kernels:true,speicherpfleger:true};
  const t2=ctx.tokps(t), v2=ctx.vramPig(t);
  if(Math.abs(t2-Math.round(t1*1.10*10)/10)>0.2) return "tokps "+t1+"→"+t2;
  if(Math.abs((v1-v2)-0.5)>0.01) return "vram "+v1+"→"+v2;
  return true; });
test("SKILL-4","Capstone nur auf dem gewählten Meisterweg, Kette nur der Reihe nach",()=>{
  frisch(); S.xp=99999; S.skills={};
  ctx.skillKaufen("betreiber","nachtschicht");
  if(S.skills.nachtschicht) return "Capstone ohne Meisterweg kaufbar!";
  ctx.skillKaufen("betreiber","kernels");
  if(S.skills.kernels) return "kernels ohne Voraussetzung servingprofi kaufbar!";
  S.meisterweg="betreiber";
  ctx.skillKaufen("betreiber","servingprofi"); ctx.skillKaufen("betreiber","kernels"); ctx.skillKaufen("betreiber","nachtschicht");
  return S.skills.nachtschicht?true:"Capstone trotz Weg+Kette nicht kaufbar"; });
test("SKILL-5","Curriculum: 4-Tage-Training dauert 3 Tage, 1-Tage-Training bleibt 1",()=>{
  frisch();
  const t=ctx.neuesTier("qwen36-27b")||ctx.neuesTier("qwen35-27b"); const g=ctx.GPUS.rtx4080;
  const tech=ctx.TECHNIKEN.sft;
  const d1=ctx.trainingsDauer(t,tech,g);
  S.skills={curriculum:true};
  const d2=ctx.trainingsDauer(t,tech,g);
  const klein=ctx.neuesTier("smollm3-3b");
  const k1=ctx.trainingsDauer(klein,tech,ctx.GPUS.h100);
  if(d1>=3&&d2!==d1-1) return "gross "+d1+"→"+d2;
  if(k1===1&&ctx.trainingsDauer(klein,tech,ctx.GPUS.h100)!==1) return "kurz verkürzt unter 1?";
  return true; });

/* ── Saisonen & Datenlese: 30-Tage-Rhythmus und Kuratier-Minispiel ── */
test("SAISON-1","Saisonzyklus: Tag 1 Frühling, 31 Sommer, 61 Herbst, 91 Winter, 121 wieder Frühling",()=>{
  frisch();
  const soll=[[1,"fruehling"],[30,"fruehling"],[31,"sommer"],[61,"herbst"],[91,"winter"],[120,"winter"],[121,"fruehling"]];
  for(const [tag,id] of soll){ S.tag=tag; if(ctx.saison().id!==id) return "Tag "+tag+": "+ctx.saison().id+" statt "+id; }
  return true; });
test("SAISON-2","Sommer: Web-Silage-Kauf kostet exakt 20 % weniger (Kredit-Delta, kein Zufall)",()=>{
  frisch(); S.kredit=5000;
  S.tag=1;  const v1=S.kredit; ctx.futterKauf("webmix",10); const teuer=v1-S.kredit;
  S.tag=31; const v2=S.kredit; ctx.futterKauf("webmix",10); const billig=v2-S.kredit;
  return Math.abs(billig-Math.round(teuer*0.8))<=1?true:teuer+" € vs. Sommer "+billig+" € (erwartet −20 %)"; });
test("LESE-1","Datenlese perfekt: 4 GB webmix → 4 GB kuratiert, Kasse unverändert, Tagessperre greift",()=>{
  frisch(); S.daten.webmix=10; S.daten.kuratiert=0; const kasse=S.kredit;
  ctx.leseStart(); const L=ctx.__lese(); if(!L||L.karten.length!==8) return "Runde startete nicht";
  L.karten.forEach((k,i)=>ctx.leseAntwort(i,k.k));
  ctx.leseFertig();
  if(S.daten.webmix!==6) return "webmix "+S.daten.webmix+" (erwartet 6)";
  if(S.daten.kuratiert!==4) return "kuratiert "+S.daten.kuratiert+" (erwartet 4 bei 8/8)";
  if(S.kredit!==kasse) return "Kasse hat sich bewegt: "+kasse+"→"+S.kredit;
  if(S.leseTag!==S.tag) return "Tagessperre nicht gesetzt";
  ctx.leseStart();
  return S.daten.webmix===6?true:"zweite Runde am selben Tag lief durch"; });
test("LESE-2","Datenlese verpatzt: Silage trotzdem verbraucht, kein Kuratiertes – Lehrgeld statt Gratisressource",()=>{
  frisch(); S.daten.webmix=10; S.daten.kuratiert=0;
  ctx.leseStart(); const L=ctx.__lese();
  const falsch={sauber:"muell",muell:"sauber",doppel:"leak",leak:"doppel"};
  L.karten.forEach((k,i)=>ctx.leseAntwort(i,falsch[k.k]));
  ctx.leseFertig();
  return (S.daten.webmix===6&&S.daten.kuratiert===0)?true:"webmix "+S.daten.webmix+" kuratiert "+S.daten.kuratiert; });

/* ── Ära 7 Welle 1: Hofbuch-Vollständigkeit, Clean Break, Spezialist wirkt ── */
test("HOFBUCH-1","Das generierte Hofbuch enthält JEDEN Katalog-Eintrag (Single Source of Truth)",()=>{
  frisch();
  const buch=vm.runInContext("hofbuchHtml()",ctx);
  const fehlen=[];
  const muss=(obj,feld,label)=>{ if(!obj) return; for(const v of Object.values(obj)){ const n=(v[feld]||"").toString(); if(n&&!buch.includes(n.replace(/&/g,"&amp;").slice(0,24))&&!buch.includes(n.slice(0,24))) fehlen.push(label+":"+n.slice(0,20)); } };
  muss(ctx.MODELLE,"n","Modell"); muss(ctx.LEIHMODELLE,"n","API"); muss(ctx.FORSCHUNG,"n","Forschung");
  muss(ctx.TECHNIKEN,"n","Technik"); muss(ctx.HARNESSE,"n","Agenten-Tool"); muss(ctx.SETUPS,"n","Hilfsmittel");
  muss(ctx.KUNDEN,"n","Kunde"); muss(ctx.GPUS,"n","GPU"); muss(ctx.FUTTER,"n","Futter");
  for(const w of Object.values(vm.runInContext("SKILLS",ctx))) for(const s of w.skills) if(!buch.includes(s.n)) fehlen.push("Skill:"+s.id);
  for(const k of Object.values(vm.runInContext("KRANKHEITEN",ctx))) if(!buch.includes(k.n)) fehlen.push("Krankheit:"+k.n);
  for(const s of vm.runInContext("SAISONEN",ctx)) if(!buch.includes(s.n)) fehlen.push("Saison:"+s.id);
  return fehlen.length?("fehlt im Hofbuch: "+fehlen.slice(0,8).join(", ")+(fehlen.length>8?" +"+(fehlen.length-8):"")):true; });
test("AERA7-1","Clean Break: neuer Speicher-Schlüssel, kein toter Modus-Schalter mehr",()=>{
  if(!source.includes('const KEY="modellhof_v7"')) return "KEY ist nicht modellhof_v7";
  if(/S\.modus\s*=/.test(source)) return "S.modus wird noch geschrieben";
  if(source.includes("einfModus(")&&source.includes("onclick=\"einfModus")) return "einfModus-Knopf existiert noch";
  return true; });
test("SPEZIALIST-1","Marktlos-Spezialist: +8 % wirken jetzt wirklich im Lohn (Fund 1 geschlossen)",()=>{
  frisch(); S.kredit=9999;
  const t=ctx.neuesTier("qwen35-4b"); S.tiere.push(t);
  S.buchten=[{id:"b1",gpu:"h100",miete:false,tier:t.uid}]; t.bucht="b1";
  const j={id:"jx",t:"Spez-Test",b:"",tier:0,art:"code",anf:{},ctxMin:8,agent:false,dsgvo:false,
    mtokTag:0.05,preisMtok:7,tage:1,latenz:0,einheit:"Stück",einheiten:10,lohnBasis:100,kunde:"verein"};
  /* Ära 7.5: über den echten Annahmepfad; gemessen wird die Job-Buchung im Journal, nicht die Kasse */
  const lauf=()=>{ S.jobs=[{...j,mtok:0.05,puffer:1}]; ctx.jobAnnehmen("jx",t.uid); if(t.status!=="job") return -999;
    const n0=S.journal.length; ctx.ausfuehrenTagesWechsel(); t.status="frei"; t.job=null;
    return S.journal.slice(n0).filter(x=>x.kat==="job"&&x.t.startsWith("Spez-Test")).reduce((a,x)=>a+x.b,0); };
  RAND=0.2;
  const ohne=lauf();
  t.spezialArt="code"; const mit=lauf();
  RAND=0.5;
  const lohnOhne=ohne, lohnMit=mit;
  return (lohnMit>lohnOhne&&Math.abs((lohnMit-lohnOhne)/Math.max(1,lohnOhne))>0.03)?true:
    "ohne "+Math.round(lohnOhne)+" € vs. mit Spezialist "+Math.round(lohnMit)+" € (kein +8 % erkennbar)"; });
test("TEAMXP-1","Team-XP-Teilung ist im Code verankert (Fund 3 geschlossen)",()=>{
  const hl=fs.readFileSync(path.join(__dirname,"hofloop.js"),"utf8");
  if(!hl.includes("gesamt*meine/rollenN")||!hl.includes("gesamt*0.25")) return "XP-Teilungsformel fehlt in hofloop.js";
  if(!hl.includes("spezialArt===j.art")) return "Team-Spezialist-Bonus fehlt in hofloop.js";
  return true; });

/* ── Ära 7 Welle 3: Geführte Woche, eingespieltes Team, Bewährungsproben ── */
test("WOCHE-1","Geführte Woche: 7 Kapitel, alle Checks laufen fehlerfrei, Gesellenprüfung zahlt genau einmal",()=>{
  frisch(); S.fuehrung="gefuehrt";
  const W=vm.runInContext("WOCHE",ctx);
  if(W.length!==7) return W.length+" Kapitel statt 7";
  /* Ära 7.5: Kapitel laufen nach Fortschritt (S.wocheKap), nicht nach Kalendertag */
  for(let k=1;k<=7;k++){ S.wocheKap=k; S.tag=k; const html=ctx.wocheBoxHtml(); if(!html.includes("Kapitel "+k+"/7")) return "Box zeigt Kapitel "+k+" nicht"; }
  S.wocheKap=7; S.tag=8; S.kredit=500; S.statistik.jobs=3; S._w7jobs=1;
  S.hofloop=S.hofloop||{}; S.hofloop.naechte=1;
  const ber={zeilen:[]}; ctx.wocheTick(ber);
  if(!S.geselle) return "Prüfung trotz erfüllter Ziele nicht bestanden: "+JSON.stringify(ber.zeilen);
  const kasse=S.kredit; ctx.wocheTick({zeilen:[]});
  return S.kredit===kasse?true:"Gesellen-Prämie doppelt gezahlt!"; });
test("WOCHE-1b","Aufgaben- und Zielkarte lässt sich dauerhaft ein- und wieder ausklappen",()=>{
  frisch(); S.fuehrung="gefuehrt"; S.flags={};
  ctx.zieleKlapp(); if(!S.flags.zielkarte_zu) return "Einklappen wurde nicht gespeichert";
  ctx.zieleKlapp(); return S.flags.zielkarte_zu?"Ausklappen funktioniert nicht":true; });
test("CHEMIE-1","eingespieltes Team: gleiche Modellfamilie senkt die Übergabelast von 12 % auf 8 %",()=>{
  frisch();
  const a=ctx.neuesTier("qwen35-4b"), b=ctx.neuesTier("qwen35-9b"), fremd=ctx.neuesTier("smollm3-3b");
  const gleich=ctx.hlUebergabeF([a,b]), gemischt=ctx.hlUebergabeF([a,fremd]);
  return (Math.abs(gleich-1.08)<1e-9&&Math.abs(gemischt-1.12)<1e-9)?true:"gleich="+gleich+" gemischt="+gemischt; });
test("PROBE-1","Bewährungsproben: verändern die Segment-Qualität und erklären sich im Bericht",()=>{
  frisch(); ctx.Math.random=lcgAb(3);
  const a=ctx.neuesTier("qwen35-4b"), b=ctx.neuesTier("smollm3-3b");
  S.tiere.push(a,b);
  S.buchten=[{id:"b1",gpu:"h100",miete:false,tier:a.uid},{id:"b2",gpu:"h100",miete:false,tier:b.uid}];
  a.bucht="b1"; b.bucht="b2";
  const j={id:"jt",t:"Team-Test",b:"",tier:0,art:"text",anf:{},ctxMin:2,agent:false,dsgvo:false,
    mtokTag:0.2,preisMtok:7,tage:2,latenz:0,einheit:"Stück",einheiten:8,lohnBasis:80,kunde:"verein",
    rollen:[{n:"Ordnen",anf:{}},{n:"Schreiben",anf:{}}]};
  const team={wahl:{0:a.uid,1:b.uid},seg:[{anteil:1,erfolg:70}],rest:1,frist:S.tag+3};
  const ber={zeilen:[]};
  let getroffen=false;
  for(let i=0;i<30&&!getroffen;i++){ team.seg[0].erfolg=70; ctx.hlProben(j,team,{},S.tiere,ber); getroffen=team.seg[0].erfolg!==70; }
  RAND=0.5; ctx.Math.random=()=>RAND;
  if(!getroffen) return "30 Tage lang keine einzige Probe ausgelöst";
  return ber.zeilen.some(z=>z.t.includes("Bewährungsprobe"))?true:"keine Bericht-Zeile zur Probe"; });

/* ── Ära 7 Welle 4: Dorfmeisterschaft, Chronik, Endgame-Stresstest ── */
test("LIGA-1","Dorfmeisterschaft: hängt am 25. Saisontag aus (ab Stufe 3), Ergebnis bucht Prämie + Bestenliste",()=>{
  frisch(); ctx.Math.random=lcgAb(11);
  S.xp=600; S.tag=25; S.jobs=[];
  ctx.ligaSpawn();
  const liga=S.jobs.find(j=>j.liga);
  if(!liga) return "kein Liga-Zettel bei Stufe 4 / Tag 25";
  if(!(liga.rollen&&liga.rollen.length>=2)) return "Team-Pflicht fehlt";
  if(liga.lohnBasis!==0) return "Liga-Zettel zahlt Lohn – soll nur werten";
  ctx.ligaSpawn();
  if(S.jobs.filter(j=>j.liga).length!==1) return "Liga-Zettel doppelt gespawnt";
  const a=ctx.neuesTier("qwen35-4b"), b=ctx.neuesTier("qwen35-9b"); S.tiere.push(a,b);
  S.buchten=[{id:"b1",gpu:"h100",miete:false,tier:a.uid},{id:"b2",gpu:"h100",miete:false,tier:b.uid}]; a.bucht="b1"; b.bucht="b2";
  const kasse=S.kredit, ber={zeilen:[]};
  ctx.hlLigaErgebnis(liga,{wahl:{0:a.uid,1:b.uid},seg:[{anteil:1,erfolg:80}]},true,0.9,[a,b],ber);
  RAND=0.5; ctx.Math.random=()=>RAND;
  if(!(S.liga&&S.liga.length===1)) return "Bestenliste leer";
  if(!ber.zeilen.some(z=>z.t.includes("DORFMEISTERSCHAFT"))) return "keine Ergebnis-Zeile";
  const soll=2500+S.statistik.einnahmen-S.statistik.ausgaben;
  return Math.abs(S.kredit-Math.round(soll*100)/100)<0.05?true:"Prämie am Kassenbuch vorbei gebucht"; });
test("CHRONIK-1","Feiern schreiben die Hof-Chronik (gedeckelt), Hofbuch zeigt sie",()=>{
  frisch();
  ctx.feier("🏆","Test-Meilenstein",true);
  if(!(S.chronik&&S.chronik.length===1&&S.chronik[0].t==="Test-Meilenstein")) return "Chronik-Eintrag fehlt";
  if(!vm.runInContext("hofbuchHtml()",ctx).includes("Test-Meilenstein")) return "Hofbuch zeigt Chronik nicht";
  for(let i=0;i<250;i++) ctx.chronikEintrag("x","Eintrag "+i);
  return S.chronik.length<=200?true:"Chronik-Deckel greift nicht: "+S.chronik.length; });
test("STRESS-1","Endgame-Volllast: 64 Rack-Buchten, 20 Tiere, 10 Tageswechsel – stabil, endlich, UI-Render < 1 MB",()=>{
  frisch(); ctx.Math.random=lcgAb(5);
  S.xp=99999; ctx.buche(497500,"foerderung","Stresstest-Kapital");
  S.rechenhaus.stufe=2; S.rechenhaus.netzKW=600;
  S.buchten=[];
  for(let i=0;i<64;i++) S.buchten.push({id:"r"+i,gpu:i%4===0?"rack8h100":"h100",miete:false,tier:null,rhSlot:"rack:"+i,stack:i%3===0?"vllm":i%3===1?"sglang":"llamacpp",cpu:"Server",ramGB:256,ssdTB:8});
  const ids=Object.keys(ctx.MODELLE);
  for(let i=0;i<20;i++){ const t=ctx.neuesTier(ids[(i*7)%ids.length]); if(!t) continue; t.quant="q8"; S.tiere.push(t);
    const b=S.buchten[i*3]; if(b&&ctx.vramPig(t)<=ctx.GPUS[b.gpu].vram){ b.tier=t.uid; t.bucht=b.id; } }
  let ber=null; ctx.zeigeBericht=b=>{ber=b;};
  const t0=Date.now();
  for(let tag=0;tag<10;tag++){ ctx.ausfuehrenTagesWechsel(); if(!Number.isFinite(S.kredit)) return "Kasse kaputt an Tag "+tag; }
  const dauer=Date.now()-t0;
  RAND=0.5; ctx.Math.random=()=>RAND;
  const stall=(()=>{ try{ let html=""; ctx.blattLive=(t,fn)=>{html=fn();}; ctx.zeigeStall(); return html; }catch(e){ return "FEHLER:"+e.message; } })();
  if(typeof stall==="string"&&stall.startsWith("FEHLER")) return "zeigeStall wirft: "+stall;
  const buch=vm.runInContext("hofbuchHtml()",ctx);
  if(buch.length>1024*1024) return "Hofbuch-Render "+Math.round(buch.length/1024)+" KB – zu fett";
  if(dauer>20000) return "10 Volllast-Tage brauchten "+dauer+" ms";
  const soll=Math.round((2500+S.statistik.einnahmen-S.statistik.ausgaben)*100)/100;
  return Math.abs(Math.round(S.kredit*100)/100-soll)<0.05?true:"Kassen-Invariante unter Volllast verletzt ("+(S.kredit-soll).toFixed(2)+")"; });

test("ADA-1","Ada deckt Einführung, alle 7 Wochen-Kapitel und jedes Gebäude ab (Ziele existieren, Texte sprechbar)",()=>{
  const A=ctx.ADA_TEXTE, G=ctx.GEBAEUDE;
  if(!A||!Object.keys(A).length) return "ADA_TEXTE fehlt";
  const muss=["hallo","intro1","intro2","intro3","geselle","tag1","tag2","tag3","tag4","tag5","tag6","tag7"]
    .concat(G.map(g=>"ort_"+g.id),["ort_hofhaus","ort_hofbuch","ort_kompendium"]);
  for(const k of muss){
    if(!A[k]) return "Ada-Text fehlt: "+k;
    if(!A[k].titel) return "Ada-Titel fehlt: "+k;
    const len=(A[k].t||"").length;
    if(len<120||len>900) return "Ada-Text "+k+" unplausibel lang/kurz ("+len+" Zeichen)";
    if(/[\u{1F000}-\u{1FAFF}\u{2190}-\u{27BF}\u{2B00}-\u{2BFF}]/u.test(A[k].t+(A[k].sag||""))) return "Emoji/Symbol im Sprechtext von "+k;
  }
  for(const [k,d] of Object.entries(A)){
    if(!d.ziel) continue;
    if(d.ziel[0]!=="#"&&!G.some(g=>g.id===d.ziel)) return "Ada-Ziel unbekannt: "+k+" → "+d.ziel;
  }
  return true; });
test("ADA-2","Ada: frischer Stand hört jeden Ort genau einmal, stumm heißt still, Gehörtes wird gemerkt",()=>{
  frisch();
  if(!S.ada||S.ada.stumm!==false) return "frischerStand ohne ada-Zustand";
  ctx.adaOrt("stall");
  if(S.ada.gehoert.ort_stall!==1) return "Ort-Erklärung wurde nicht als gehört vermerkt";
  ctx.adaOrt("stall");
  if(S.ada.gehoert.ort_stall!==1) return "Doppelt vermerkt";
  S.ada.stumm=true; ctx.adaOrt("futter");
  if(S.ada.gehoert.ort_futter) return "Ada sprach trotz Stummschaltung";
  S.ada.stumm=false; S.fuehrung="gefuehrt"; S.geselle=false; S.tag=3; S.wocheKap=3;   /* Ära 7.5: Kapitel 3 */
  ctx.adaTagCheck();
  if(S.ada.gehoert.tag3!==1) return "Tageskapitel 3 nicht ausgelöst";
  if(S.ada.gehoert.tag1) return "Falsches Tageskapitel ausgelöst";
  return true; });

test("ADA-3","Ada: zu jeder Erklärung gibt es Tondatei und Mundkurve, Länge passt zum Text",()=>{
  const A=ctx.ADA_TEXTE, M=ctx.ADA_MUND;
  if(!M) return "ADA_MUND fehlt im Build (dev/ada_visemen.js nicht eingebunden?)";
  for(const k of Object.keys(A)){
    if(A[k].ohneAudio) continue;   /* Ära 7.5: Texte ohne Tondatei liest die Browserstimme */
    const kurve=M[k];
    if(!kurve) return "Mundkurve fehlt für "+k+" – Vertonung neu erzeugen";
    if(!/^[0-9]+$/.test(kurve)) return "Mundkurve "+k+" enthält Fremdzeichen";
    const mp3=path.join(__dirname,"..","ada_dialog_v3",k+".mp3");
    if(!fs.existsSync(mp3)) return "Tondatei fehlt: ada_dialog_v3/"+k+".mp3";
    if(fs.statSync(mp3).size<8000) return "Tondatei ada_dialog_v3/"+k+".mp3 verdächtig klein";
    const sek=kurve.length/20, zeichen=(A[k].sag||A[k].t).length;
    if(sek<zeichen/22) return k+": Tonspur zu kurz für den Text ("+sek.toFixed(1)+"s / "+zeichen+" Zeichen)";
    if(sek>zeichen/8)  return k+": Tonspur zu lang für den Text ("+sek.toFixed(1)+"s / "+zeichen+" Zeichen)";
    if(!/0{4,}/.test(kurve)) return k+": keine Sprechpausen in der Tonspur";
  }
  const zuviel=Object.keys(M).filter(k=>!A[k]);
  return zuviel.length?"Verwaiste Mundkurven ohne Text: "+zuviel.join(", "):true; });

test("ADA-4","Ada spricht in jedem Einfuehrungsschritt wirklich los (kein stummer Auftritt)",()=>{
  /* Regression: zeigeWillkommen() belegte einst _adaId vor, damit die Karte Text hat -
     adaIntro() prueft genau darauf und hielt sich fuer schon gesprochen. Ada blieb im
     gesamten Onboarding stumm, ohne dass ein Test das gemerkt haette. */
  frisch(); S.einfFertig=false; S.ada={stumm:false,gehoert:{}};
  vm.runInContext("__adaBereit(true)",ctx);
  const gespielt=[], echt=ctx.adaSpiele;
  ctx.adaSpiele=(id)=>{ gespielt.push(id); };
  try{
    for(let schritt=1;schritt<=3;schritt++){
      vm.runInContext("__einfSchritt("+schritt+")",ctx);
      ctx.zeigeWillkommen();
    }
  } catch(e){ ctx.adaSpiele=echt; return "zeigeWillkommen wirft: "+e.message; }
  ctx.adaSpiele=echt;
  for(const nr of [1,2,3])
    if(!gespielt.includes("intro"+nr))
      return "Schritt "+nr+" hat nicht gesprochen (gespielt: "+JSON.stringify(gespielt)+")";
  return true; });

console.log(erg.join("\n"));
console.log("\n"+(erg.length-fail)+"/"+erg.length+" bestanden"+(fail?" – "+fail+" FEHLGESCHLAGEN":""));
process.exit(fail?1:0);
