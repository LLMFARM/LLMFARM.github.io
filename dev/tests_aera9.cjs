/* Ära 9 – Zettelschmiede, Wetter 2.0 und Hofsprecher-Anschluss. */
const fs=require("fs"),path=require("path"),vm=require("vm"),assert=require("assert/strict");
const html=fs.readFileSync(path.join(__dirname,"..","modellhof_game.html"),"utf8"),script=html.match(/<script>([\s\S]*?)<\/script>/)[1],source=script.slice(0,script.indexOf("/* Boot-Sequenz */"));
function el(){return {innerHTML:"",textContent:"",value:"",style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},contains:()=>false,toggle(){}},appendChild(){},remove(){},setAttribute(){},querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},scrollIntoView(){},focus(){}};}
const ctx={console,Math,JSON,Date,Object,Array,Number,String,Boolean,RegExp,Map,Set,Promise,Error,BigInt,isNaN,parseInt,parseFloat,
 setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame(){},performance:{now:()=>0},
 document:{getElementById:()=>el(),createElement:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},body:el(),head:el(),visibilityState:"visible"},window:{},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},confirm:()=>true,prompt:()=>null,alert(){},navigator:{},location:{protocol:"http:",reload(){}},URL:{createObjectURL:()=>"",revokeObjectURL(){}},Blob:function(){},Image:function(){}};
ctx.globalThis=ctx;ctx.self=ctx;vm.createContext(ctx);vm.runInContext(source,ctx,{timeout:30000});
vm.runInContext(`Object.assign(globalThis,{ZS_REGELN,KUNDEN,zsVeredeln,zsKundenRegistrieren,zsKundeNeu,zsWendungChip,zsMorgen,zsEreignisGewicht,zsHofbuchHtml,rhWeather,rhPrognose,rhWetterbericht,rhSim,rhNeu,frischerStand,hlStand,rh});
globalThis.__neu=function(saat){S=frischerStand();S.einfFertig=true;hlStand().saat=saat;S.kredit=20000;zsKundenRegistrieren(S);return S;};
globalThis.__S=()=>S;
globalThis.__ver=function(id,art='text',tier=1){return zsVeredeln({id,t:'Testzettel',b:'Der geprüfte Kern bleibt erhalten.',art,tier,tage:2,lohnBasis:1000,groesse:'M',kunde:'laden',rollen:[],anf:{}},{});};`,ctx);
const g=x=>vm.runInContext(x,ctx),S=()=>g("__S()");let ok=0,gesamt=0,fehler=[];
function test(n,f){gesamt++;try{g("__neu(73)");f();ok++;console.log("PASS "+n);}catch(e){fehler.push(n);console.log("FAIL "+n+" :: "+(e&&e.message||e));}}

test("ZS-1 gleiche Saat und ID ergeben denselben Zettel",()=>{const a=JSON.stringify(g("__ver('j77')"));g("__neu(73)");const b=JSON.stringify(g("__ver('j77')"));assert.equal(a,b);});
test("ZS-2 andere Saat verändert die Partie",()=>{const a=JSON.stringify(g("__ver('j91')"));g("__neu(991)");const b=JSON.stringify(g("__ver('j91')"));assert.notEqual(a,b);});
test("ZS-3 Vorlagenkern und Zahlen bleiben erhalten",()=>{const j=g("__ver('j12')");assert.match(j.b,/geprüfte Kern/);assert.ok(j.lohnBasis>=880&&j.lohnBasis<=1120,j.lohnBasis);assert.ok(j.tage>=2&&j.tage<=3,j.tage);});
test("ZS-4 höchstens zwölf dynamische Kunden",()=>{for(let i=0;i<40;i++)g(`zsKundeNeu('text',1,__S())`);assert.ok(Object.keys(S().kundenDyn).length<=12);});
test("ZS-5 dynamische Kunden werden nach Laden registriert",()=>{g("zsKundeNeu('text',1,__S())");const id=Object.keys(S().kundenDyn)[0];delete g("KUNDEN")[id];g("zsKundenRegistrieren(__S())");assert.ok(g("KUNDEN")[id]);});
test("ZS-6 Wendungen sind als Chip sichtbar",()=>{let j=null;for(let i=0;i<200&&!j;i++){const x=g(`__ver('w${i}')`);if(x.wendung)j=x;}assert.ok(j);assert.match(g("zsWendungChip("+JSON.stringify(j)+")"),/merk/);});
test("ZS-7 Hofbuch dokumentiert Bänder und Gerüchte",()=>{const h=g("zsHofbuchHtml()");assert.match(h,/±12/);assert.match(h,/Gerücht/);assert.match(h,/60/);});
test("WETTER-1 gleiche Saat bleibt exakt",()=>{const a=JSON.stringify(g("rhWetterbericht(20)"));const b=JSON.stringify(g("rhWetterbericht(20)"));assert.equal(a,b);});
test("WETTER-2 andere Hofsaat erzeugt anderes Wetter",()=>{const a=JSON.stringify(g("rhWetterbericht(5)"));g("__neu(812)");const b=JSON.stringify(g("rhWetterbericht(5)"));assert.notEqual(a,b);});
test("WETTER-3 Bericht und Wetter nutzen dieselben Faktoren",()=>{const b=g("rhWetterbericht(1)[0]"),w=g("rhWeather(__S().tag,false,hlStand().saat)");assert.equal(b.pvF,w.pvF);assert.equal(b.windF,w.windF);});
test("WETTER-4 Regen, Sturm, Nebel oder Hitze kommen vor",()=>{const ar=g("Array.from({length:600},(_,i)=>rhWeather(i+1,false,73))");assert.ok(ar.some(x=>x.regen));assert.ok(ar.some(x=>x.sturm));assert.ok(ar.some(x=>x.nebel)||ar.some(x=>x.hitze));});
test("WETTER-5 Tagesplanung enthält drei echte Tipps",()=>{const b=g("rhWetterbericht(3)");assert.equal(b.length,3);assert.ok(b.every(x=>x.tipp&&Number.isFinite(x.pvF)&&Number.isFinite(x.windF)));});
test("UI-1 Ada-Menü enthält den lokalen Hofsprecher",()=>{const h=g("hsPanelHtml()");assert.match(h,/Hofsprecher/);assert.match(h,/Nadel laden/);assert.match(html,/typeof hsPanelHtml/);});
test("ADA-9 alle neuen Systeme haben Dialog, Hörknopf und einheitlichen Audiosatz",()=>{
 const ids=["hilfe_hofsprecher","wetter_planung","zettelschmiede","hofpost","training_analyse","quest_freiwillig","tagesplanung","ereignis_entscheidung","anliegen","fachbildung","nadel","hof_geschlossen","team_agenten","datenschutz","start_geschirr"];
 for(const id of ids){const d=g("ADA_TEXTE["+JSON.stringify(id)+"]");assert.ok(d&&d.t.length>80,id+" ohne sprechbaren Text");const direkt="adaSprich('"+id+"'",escaped="adaSprich(\\'"+id+"\\'";assert.ok(html.includes(direkt)||html.includes(escaped),id+" ohne Hörknopf");}
 assert.match(html,/new Audio\("ada_dialog_v3\/"\+id\+"\.mp3"\)/);
});
test("GUIDE-1 der Ersteinsatz hat acht vertonte Schritte und fünf echte Kapitelziele",()=>{
 const ids=["start_tierkarte","start_tieraktionen","start_buchtwahl","start_bucht_fertig","start_pinnwand","start_eignung","start_zusage","start_auftrag_laeuft"];
 for(const id of ids){const d=g("ADA_TEXTE["+JSON.stringify(id)+"]");assert.ok(d&&d.t.length>120,id+" fehlt");}
 assert.equal(g("WOCHE[0].aufgaben.length"),6);assert.match(html,/ada-tierwerte/);assert.match(html,/ada-bucht-zuweisen/);assert.match(html,/ada-erster-job/);assert.match(html,/ada-eignung/);assert.match(html,/ada-zusage/);assert.match(html,/ada-erster-lauf/);
});
test("GUIDE-2 grüner Vorschlag startet den ersten Auftrag und schließt die Führung",()=>{
 const r=g(`(()=>{S=frischerStand();S.einfFertig=true;S.fuehrung='gefuehrt';S.wocheKap=1;S.kredit=20000;S.flags={};
  const mid=Object.keys(MODELLE).find(k=>MODELLE[k].pT===.6)||Object.keys(MODELLE)[0],p=neuesTier(mid);S.tiere=[p];const b=S.buchten[0];b.tier=p.uid;p.bucht=b.id;
  S.jobs=[];for(let i=0;i<12;i++){const j=hlJobNeu(0,true);if(j)S.jobs.push(j);}const x=hlErsterPassenderJob(S.jobs);if(!x)return {fehler:'kein grüner Vorschlag'};
  startGuideSet('tierkarte');startGuideSet('werte');startGuideSet('geschirr');startGuideSet('pinnwand');startGuideSet('eignung');startGuideSet('zusage');   /* v9.8: die Agentenwerkstatt gehört zum geführten Weg */
  hlAuswahl[x.j.id]=Object.fromEntries(hlRollen(x.j).map((r,i)=>[i,p.uid]));const altAlles=alles,altJobs=zeigeJobs;alles=()=>{};zeigeJobs=()=>{};hlTeamStart(x.j.id);alles=altAlles;zeigeJobs=altJobs;
  return {ok:x.c.ok,status:p.status,job:p.job,flag:S.flags.start_job_laeuft,kapitel:wocheErfuellt(1)};})()`);
 assert.equal(r.fehler,undefined,r.fehler);assert.equal(r.ok,true);assert.equal(r.status,"job");assert.ok(r.job);assert.equal(r.flag,true);assert.equal(r.kapitel,true);
});
test("GUIDE-3 erster Zettel und Adas Vorschlag sind frei von Datenschutz-/Abmahnrisiko",()=>{
 const r=g(`(()=>{S=frischerStand();S.einfFertig=true;S.fuehrung='gefuehrt';S.kredit=20000;hlStand().saat=73;
  const mid=Object.keys(MODELLE).find(k=>MODELLE[k].pT===.6)||Object.keys(MODELLE)[0],p=neuesTier(mid);S.tiere=[p];const b=S.buchten[0];b.tier=p.uid;p.bucht=b.id;
  const sicher=hlJobNeu(0,true,true),riskant={...hlJobNeu(0,true,true),id:'risiko',dsgvo:true};S.jobs=[riskant,sicher];
  const x=hlErsterPassenderJob(S.jobs);return {starterRisiko:dsRisiko(sicher),starterFach:fachAnforderung(sicher),wahl:x&&x.j.id,riskant:riskant.id};})()`);
 assert.equal(r.starterRisiko,0);assert.equal(r.starterFach,null);assert.ok(r.wahl);assert.notEqual(r.wahl,r.riskant);
});
test("GUIDE-4 LoRA-Lernpfad passt mit 4B-Startmodell auf die 24-GB-Startkarte",()=>{
 const r=g(`(()=>{S=frischerStand();S.einfFertig=true;S.fuehrung='gefuehrt';S.wocheKap=3;S.xp=500;S.forschung.sft=true;S.forschung.lora=true;
  const id=Object.keys(MODELLE).find(k=>MODELLE[k].pT<=4&&MODELLE[k].pT>=3),p=neuesTier(id);S.tiere=[p];const b=S.buchten[0];b.tier=p.uid;p.bucht=b.id;
  const braucht=trainingsVramNoetig(p,TECHNIKEN.lora),ok=trainingStarten(p,'lora','logik','beispiele',b.id);return {braucht,karte:GPUS[b.gpu].vram,ok,status:p.status,kapitel:wocheErfuellt(3)};})()`);
 assert.ok(r.braucht<=r.karte,JSON.stringify(r));assert.equal(r.ok,true);assert.equal(r.status,'training');assert.equal(r.kapitel,true);
});
test("GUIDE-5 geführte Woche und Gesellenprüfung bleiben nach Tag 40 wiederholbar",()=>{
 g("S=frischerStand();S.einfFertig=true;S.fuehrung='gefuehrt';S.geselle=false;S.tag=41;S.wocheKap=7");assert.equal(g("wocheAktiv()"),true);
});

console.log(ok+"/"+gesamt+" bestanden"+(fehler.length?" · FEHLER: "+fehler.join(", "):""));process.exit(fehler.length?1:0);
