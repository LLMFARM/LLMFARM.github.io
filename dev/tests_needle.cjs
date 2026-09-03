/* Ära-9-Prüfungen: Hofsprecher (Wörterbuch-Parser, Vorschau ohne Nebenwirkung, Ausführung) und Needle-Laufzeit (reine Funktionen).
   Lädt die gebaute modellhof_game.html wie tests_aera8.cjs in eine Node-VM. Aufruf: node dev/tests_needle.cjs */
const fs=require("fs"), path=require("path"), vm=require("vm"), assert=require("assert/strict");
const html=fs.readFileSync(path.join(__dirname,"..","modellhof_game.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const source=script.slice(0,script.indexOf("/* Boot-Sequenz */"));
function el(){ return {innerHTML:"",textContent:"",value:"",style:{setProperty(){},width:""},dataset:{},
  classList:{add(){},remove(){},contains:()=>false,toggle(){}},appendChild(){},remove(){},before(){},setAttribute(){},
  querySelector:()=>el(),querySelectorAll:()=>[],onclick:null,onanimationend:null,addEventListener(){},scrollTop:0,offsetWidth:0,scrollIntoView(){},focus(){}}; }
const timers=[];
const ctx={console,Math,JSON,Date,Object,Array,Number,String,Boolean,RegExp,Map,Set,isNaN,parseInt,parseFloat,Promise,Error,BigInt,
  setTimeout:fn=>{timers.push(fn);return timers.length;},clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame(){},performance:{now:()=>0},
  document:{getElementById:()=>el(),createElement:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},visibilityState:"visible",body:el(),head:el()},
  window:{}, localStorage:{getItem:()=>null,setItem(){},removeItem(){}},
  confirm:()=>true, prompt:()=>null, alert(){}, btoa:s=>Buffer.from(s,"binary").toString("base64"),
  atob:s=>Buffer.from(s,"base64").toString("binary"), navigator:{}, location:{reload(){},protocol:"http:"},
  URL:{createObjectURL:()=>"",revokeObjectURL(){}}, Blob:function(){}, Image:function(){ this.onload=null; }};
ctx.globalThis=ctx; ctx.self=ctx;
vm.createContext(ctx);
vm.runInContext(source,ctx,{timeout:30000});
vm.runInContext(`Object.assign(globalThis,{MODELLE,TECHNIKEN,GPUS,FUTTER,WERTE,FORSCHUNG,KUNDEN,HL_NACHT,HL_AUFTRAEGE,QUANTS,RH_WIND,RH_GEN,RH_PC,
  HS_WERKZEUGE,hsParsen,hsPlanPruefen,hsVorschauText,hsAusfuehren,hsWerkzeugeJson,hsNadelPlan,hsHofbuchHtml,hsPanelHtml,needleAntwortParsen,NEEDLE_REGELN,
  hlJobNeu,hlStand,rh,rhCfg,neuesTier,frischerStand,hofLevel,jobLohnGesamt});
globalThis.__frisch=function(){ S=frischerStand(); S.einfFertig=true; S.kredit=20000; return S; };
globalThis.__S=function(){ return S; };
globalThis.__add=function(id,slot){ const p=neuesTier(id); S.tiere.push(p); slot=slot||0; if(!S.buchten[slot]) S.buchten[slot]={...S.buchten[0],id:'b'+(slot+1),rhSlot:'pc:'+slot,tier:null}; p.bucht=S.buchten[slot].id; S.buchten[slot].tier=p.uid; return p; };
globalThis.__job=function(){ let j=null; for(let i=0;i<12&&!j;i++) j=hlJobNeu(0,true); S.jobs.push(j); return j; };`,ctx);
["alles","wieseNeu","schilderNeu","kopfNeu","tickerNeu","tickerLauf","zeigeBericht","zeigeJobs","zeigeMarkt","zeigeStall","zeigeFutter","zeigeHofhaus","zeigeAuftrag",
 "zeigeTier","zeigeCloud","zeigeArena","zeigeAgentenWelt","blattAuf","blattZu","blattLive","melde","uhrAnzeige","maskenCss","figurDeko","zeigeRechenhaus","zeigeHofbuch","hbSpring",
 "questPruefe","feier","adaAuto","adaZeig","rhAussenNeu","rhHintergrundNeu","hlLeiste","dockNeu","zieleNeu","zeigeNachtSetup","rhRefresh","oeffne","adaExtraNeu"].forEach(f=>{ ctx[f]=()=>{}; });
const g=(name)=>vm.runInContext(name,ctx);
let bestanden=0,gesamt=0; const fehl=[];
function test(name,fn){ gesamt++; try{ g("__frisch()"); fn(); bestanden++; console.log("PASS "+name); }catch(e){ fehl.push(name); console.log("FAIL "+name+" :: "+(e&&e.message||e)); } }
const parse=(t)=>vm.runInContext("hsParsen("+JSON.stringify(t)+")",ctx);
const S=()=>g("__S()");

/* ── Needle-Laufzeit: reine Funktionen ── */
test("NEEDLE-1 needleAntwortParsen normalisiert Engine-JSON",()=>{
  const a=g('needleAntwortParsen(\'{"type":"call","function_calls":[{"name":"buy_solar","arguments":{"panels":3}}],"confidence":0.42,"decode_tps":61.5}\')');
  assert.equal(a.calls.length,1); assert.equal(a.calls[0].name,"buy_solar"); assert.equal(a.calls[0].arguments.panels,3); assert.equal(a.konfidenz,0.42); assert.equal(a.tps,61.5);
  const b=g('needleAntwortParsen("kein json")'); assert.equal(b.calls.length,0); assert.ok(b.fehler);
  const c=g('needleAntwortParsen(\'{"function_calls":[],"confidence":1}\')'); assert.equal(c.calls.length,0); assert.equal(c.konfidenz,1); });
test("NEEDLE-2 Werkzeugkatalog ist gültiges Needle-JSON mit eindeutigen Namen",()=>{
  const tools=JSON.parse(g("hsWerkzeugeJson()")); assert.ok(tools.length>=25&&tools.length<=40,"Anzahl "+tools.length);
  const namen=new Set(); for(const t of tools){ assert.ok(/^[a-z_]+$/.test(t.name),t.name); assert.ok(t.description.length>10); assert.equal(t.parameters.type,"object"); assert.ok(!namen.has(t.name)); namen.add(t.name); } });
test("NEEDLE-3 Regeln tragen die geprüften Fakten",()=>{ const r=g("NEEDLE_REGELN"); assert.equal(r.fakten.kontext,"256 Token"); assert.equal(r.fakten.lizenz,"Apache-2.0"); assert.equal(r.quellen.length,2); assert.ok(r.quellen[1].basis.includes("huggingface.co/Cactus-Compute/needle2")); });
test("NEEDLE-4 hsNadelPlan übersetzt englische Werkzeugnamen und Argumente",()=>{
  const p=g('hsNadelPlan({calls:[{name:"accept_job",arguments:{zettel:"j3",tiere:"t1, t2"}}],konfidenz:0.7,tps:60,ms:3000})');
  assert.equal(p.werkzeug,"annehmen"); assert.deepEqual(p.args.tiere,["t1","t2"]); assert.equal(p.quelle,"nadel"); assert.equal(p.sicherheit,"vermutet");
  assert.equal(g('hsNadelPlan({calls:[]})'),null); assert.equal(g('hsNadelPlan({calls:[{name:"unbekannt",arguments:{}}]})'),null); });

/* ── Wörterbuch-Parser ── */
const FAELLE=[
 ["hilfe","hilfe",{}],["was kannst du?","hilfe",{}],
 ["wie geht es dem Hof?","status",{}],["status","status",{}],
 ["zeig mir das Kassenbuch","kassenbuch",{}],["wie steht die Kasse","kassenbuch",{}],
 ["wie wird das Wetter?","wetterbericht",{tage:3}],["Wetter für 2 Tage","wetterbericht",{tage:2}],["Wetterbericht","wetterbericht",{tage:3}],
 ["zeig die Zettel","zettel_zeigen",{}],["was hängt an der Pinnwand?","zettel_zeigen",{}],
 ["zeig mir j3","auftrag_zeigen",{zettel:"j3"}],
 ["nimm j12 mit t3 und t4 an","annehmen",{zettel:"j12",tiere:["t3","t4"]}],["übernimm den Zettel j2 mit t1","annehmen",{zettel:"j2",tiere:["t1"]}],
 ["brich j4 ab","abbrechen",{zettel:"j4"}],["gib j4 zurück","abbrechen",{zettel:"j4"}],
 ["beende den Tag","tag_beenden",{}],["Feierabend","tag_beenden",{}],["schlafen gehen","tag_beenden",{}],
 ["t2 soll heute Nacht LoRA trainieren","nacht_planen",{tier:"t2",art:"lora"}],["t1 nachts reindexieren","nacht_planen",{tier:"t1",art:"reindex"}],["t3 macht heute Nacht Überstunden","nacht_planen",{tier:"t3",art:"ueberstunden"}],
 ["Nacht wie gestern","nacht_gestern",{}],
 ["stell t3 auf Eigenstrom","energie_modus",{tier:"t3",modus:"eigen"}],["t3 auf Automatik","energie_modus",{tier:"t3",modus:"auto"}],
 ["kauf zwei Solarmodule","solar_kaufen",{anzahl:2}],["Kauf bitte 3 Solarpanels fürs Dach","solar_kaufen",{anzahl:3}],["hol ein Solarmodul","solar_kaufen",{anzahl:1}],
 ["erweitere den Akku","akku_kaufen",{schritte:1}],["kauf 2 Akku-Schritte","akku_kaufen",{schritte:2}],
 ["bau ein 20 kW Windrad","wind_kaufen",{kw:20}],["kauf ein Windrad","wind_kaufen",{kw:5}],
 ["stell ein 45 kW Kraftwerk auf","kraftwerk_kaufen",{kw:45}],
 ["schließ den Nachbarvertrag ab","nachbar_vertrag",{}],
 ["bau das Rechenhaus aus","rechenhaus_ausbauen",{}],
 ["kauf einen gebrauchten Rechner","pc_kaufen",{variante:"gebraucht"}],["kauf einen PC","pc_kaufen",{variante:"basis"}],
 ["kauf qwen35-4b","modell_kaufen",{modell:"qwen35-4b"}],["besorg mir Qwen3.5 4B","modell_kaufen",{modell:"qwen35-4b"}],
 ["verkauf t5","verkaufen",{tier:"t5"}],
 ["erforsche Schutzregeln","forschen",{thema:"guardrails"}],["forsche an Quantisierung","forschen",{thema:"quant"}],
 ["trainiere t1 mit LoRA auf Logik","training",{tier:"t1",technik:"lora",fokus:"logik"}],
 ["kurier t2","kur",{tier:"t2"}],["heile t2","kur",{tier:"t2"}],
 ["t1 Denkmodus","denken",{tier:"t1"}],
 ["quantisiere t1 auf q4","quant",{tier:"t1",stufe:"q4"}],["t1 auf 8 bit quantisieren","quant",{tier:"t1",stufe:"8"}],
 ["prüf t1 für j2","pruefen",{tier:"t1",zettel:"j2"}],
 ["setz t1 in b2","rein",{tier:"t1",bucht:"b2"}],["t1 raus aus der Bucht","raus",{tier:"t1"}],
 ["ab in den Stall","zeige",{ort:"stall"}],["zeig den Viehmarkt","zeige",{ort:"markt"}],["geh zur Forschungshütte","zeige",{ort:"forschung"}],["Energiegarten","zeige",{ort:"energie"}],["dorfplatz","zeige",{ort:"dorfplatz"}],
 ["schlag das Hofbuch auf","hofbuch",{}],["hofbuch zu strom","hofbuch",{kapitel:"strom"}],
];
let parserOk=0;
for(const [satz,werkzeug,args] of FAELLE){
  test("HS-PARSE „"+satz+"“ → "+werkzeug,()=>{ const p=parse(satz); assert.ok(p,"kein Plan"); assert.equal(p.werkzeug,werkzeug,"Werkzeug "+p.werkzeug);
    for(const k in args){ assert.deepEqual(p.args[k],args[k],"Argument "+k+": "+JSON.stringify(p.args[k])); } parserOk++; });
}
test("HS-PARSE Unsinn liefert null statt Werkzeug",()=>{ for(const s of ["erzähl mir einen Witz","","   ","lorem ipsum dolor","wieviel Strom braucht eine RTX 4090?"]){ assert.equal(parse(s),null,s); } });
test("HS-PARSE Tiername statt Id wird erkannt",()=>{ const p=g("__add('qwen35-4b')"); const plan=parse("verkauf "+p.name); assert.ok(plan&&plan.werkzeug==="verkaufen"); assert.equal(plan.args.tier,p.uid); });

/* ── Vorschau ohne Nebenwirkung, Ausführung mit Wirkung ── */
test("HS-VORSCHAU verändert den Spielstand nicht",()=>{
  g("__add('qwen35-4b')"); g("__job()"); const vorher=JSON.stringify(S());
  for(const w of g("HS_WERKZEUGE.map(w=>w.id)")){ const plan={werkzeug:w,args:{tier:"t1",zettel:S().jobs[0].id,tiere:["t1"],anzahl:2,schritte:1,kw:20,variante:"basis",modell:"qwen35-4b",thema:"guardrails",technik:"lora",fokus:"logik",sorte:"webmix",gb:4,bucht:"b1",stufe:"q4",ort:"stall",kapitel:"strom",art:"ruhe",modus:"eigen",tage:3}};
    const txt=vm.runInContext("hsVorschauText("+JSON.stringify(plan)+")",ctx); assert.equal(typeof txt,"string"); if(g("hsPlanPruefen("+JSON.stringify(plan)+").ok")&&g("hsWerkzeug('"+w+"').gefahr")>0) assert.ok(txt.length>5,w+": leere Vorschau"); }
  assert.equal(JSON.stringify(S()),vorher,"Vorschau hat den Stand verändert"); });
test("HS-AUSFUEHREN solar_kaufen montiert Module und bucht Geld",()=>{
  S().xp=2700; const k=S().kredit; const r=vm.runInContext("hsAusfuehren({werkzeug:'solar_kaufen',args:{anzahl:2}})",ctx); assert.ok(/2 Solarmodul/.test(r),r); assert.equal(g("rh().pv.length"),2); assert.ok(S().kredit<k); });
test("HS-GATE Energieanlage ist vor Hofstufe 8 auch bei Ausführung gesperrt",()=>{
  assert.match(g("hsVorschauText({werkzeug:'solar_kaufen',args:{anzahl:1}})"),/Hofstufe 8/); g("rhKauf('solar')"); assert.equal(g("rh().pv.length"),0); });
test("HS-GATE Forschung prüft Gebäude zentral und startet erst danach",()=>{
  assert.match(g("hsVorschauText({werkzeug:'forschen',args:{thema:'quant'}})"),/Hofstufe 2/); assert.equal(g("forschen('quant')"),false); assert.ok(!S().forschungAktiv); S().xp=120;
  const r=g("hsAusfuehren({werkzeug:'forschen',args:{thema:'quant'}})"); assert.match(r,/Forschung angestoßen/); assert.equal(S().forschungAktiv.id,"quant"); });
test("HS-GATE Training priorisiert Freischaltung und Forschung",()=>{
  g("__add('qwen35-4b')"); let p={werkzeug:"training",args:{tier:"t1",technik:"lora",fokus:"logik",futter:"beispiele"}};
  assert.match(vm.runInContext("hsVorschauText("+JSON.stringify(p)+")",ctx),/Hofstufe 2/); S().xp=120;
  assert.match(vm.runInContext("hsVorschauText("+JSON.stringify(p)+")",ctx),/fehlt die Forschung/); S().forschung.sft=true; S().forschung.lora=true;
  assert.equal(vm.runInContext("hsPlanPruefen("+JSON.stringify(p)+").ok",ctx),true); });
test("HS-VORSCHAU Auftrag bleibt rein und verändert teamN nicht",()=>{
  g("__add('qwen35-4b')"); const j=g("__job()"); j.teamMax=3; delete j.teamN; const vorher=JSON.stringify(j);
  vm.runInContext("hsVorschauText({werkzeug:'annehmen',args:{zettel:'"+j.id+"',tiere:['t1']}})",ctx); assert.equal(JSON.stringify(j),vorher); });
test("HS-AUSFUEHREN annehmen startet ein Team",()=>{
  g("__add('qwen35-4b')"); const j=g("__job()"); const r=vm.runInContext("hsAusfuehren({werkzeug:'annehmen',args:{zettel:'"+j.id+"',tiere:['t1']}})",ctx); assert.ok(/Angenommen|Nicht angenommen/.test(r),r); if(/^Angenommen/.test(r)) assert.ok(S().jobs.find(x=>x.id===j.id).team); });
test("HS-AUSFUEHREN tag_beenden öffnet die Nachtplanung",()=>{ const r=vm.runInContext("hsAusfuehren({werkzeug:'tag_beenden',args:{}})",ctx); assert.ok(/Nachtplanung/.test(r)); assert.equal(g("hlStand().phase"),"planung"); const r2=vm.runInContext("hsVorschauText({werkzeug:'tag_beenden',args:{}})",ctx); assert.ok(/⛔/.test(r2)); });
test("HS-PRUEFEN weist unbekannte Tiere, Zettel und Modelle mit Klartext ab",()=>{
  assert.ok(/gibt es nicht/.test(vm.runInContext("hsVorschauText({werkzeug:'verkaufen',args:{tier:'t99'}})",ctx)));
  assert.ok(/hängt nicht/.test(vm.runInContext("hsVorschauText({werkzeug:'auftrag_zeigen',args:{zettel:'j99'}})",ctx)));
  assert.ok(/Katalog/.test(vm.runInContext("hsVorschauText({werkzeug:'modell_kaufen',args:{modell:'gibtsnicht'}})",ctx)));
  assert.ok(/Unbekanntes Werkzeug/.test(vm.runInContext("hsVorschauText({werkzeug:'zaubern',args:{}})",ctx))); });
test("HS-GEFAHR Verkauf und Rückgabe sind als unumkehrbar markiert, Anzeige-Werkzeuge harmlos",()=>{
  assert.equal(g("hsWerkzeug('verkaufen').gefahr"),2); assert.equal(g("hsWerkzeug('abbrechen').gefahr"),2); for(const w of ["status","kassenbuch","wetterbericht","zettel_zeigen","zeige","hofbuch","hilfe"]) assert.equal(g("hsWerkzeug('"+w+"').gefahr"),0,w); });
test("HS-HOFBUCH und Panel liefern HTML mit den echten Nadel-Zahlen",()=>{ const h=g("hsHofbuchHtml()"); assert.ok(/45 Mio\./.test(h)&&/256 Token/.test(h)&&/13,7 MB/.test(h)&&/Englisch/.test(h)); const p=g("hsPanelHtml()"); assert.ok(/hsFeld/.test(p)&&/Nadel laden/.test(p)); });


/* ── Spieltest v9.8 ── */
test("HS-V98 Status nennt den Stufennamen, Rechnerkauf zeigt den Katalogpreis, Annehmen-Vorschau nennt Fristbudget und Aussichtslos, Nacht lässt sich starten",()=>{
  assert.ok(/Stufe 1 Hoflehrling/.test(g("hsAusfuehren(hsParsen('wie geht es dem hof'))")));
  const v=g("hsVorschauText(hsParsen('kauf einen raspberry pi rechner'))"); assert.ok(/120 €/.test(v),v);
  const p=g("__add('qwen35-4b')"); const j=g("__job()"); j.mtok=1.4; j.mtokTag=1.4; j.puffer=0; j.tage=1; g("hlWarten(15.9,true)");
  const plan=g("hsParsen('nimm "+j.id+" mit "+p.uid+" an')"); assert.equal(plan.werkzeug,"annehmen"); const pr=g("hsPlanPruefen("+JSON.stringify(plan)+")"); assert.ok(pr&&pr.ok===false&&/Aussichtslos/.test(pr.grund||""),JSON.stringify(pr));
  j.puffer=2; const v2=g("hsVorschauText(hsParsen('nimm "+j.id+" mit "+p.uid+" an'))"); assert.ok(/Fristbudget/.test(v2)&&/🟢|🟡|🔴/.test(v2),v2);
  const n=g("hsParsen('starte die nacht')"); assert.equal(n.werkzeug,"tag_beenden","tagsüber öffnet der Satz zuerst die Nachtplanung"); assert.equal((g("hsPlanPruefen("+JSON.stringify(n)+")")||{}).ok,true);
  g("tagBeenden()"); assert.equal(g("hlStand().phase"),"planung"); assert.equal(g("hsParsen('beende den tag')").werkzeug,"nacht_starten","in der Planung heißt beenden Nacht starten");
  assert.equal(g("hsParsen('zurück zum tag')").werkzeug,"zurueck_tag"); g("hsAusfuehren(hsParsen('zurück zum tag'))"); assert.equal(g("hlStand().phase"),"tag"); });
console.log(bestanden+"/"+gesamt+" bestanden"+(fehl.length?" · FEHLER: "+fehl.join(", "):""));
process.exit(fehl.length?1:0);
