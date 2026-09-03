/* Ära-9-Prüfungen · Dynamik: Entscheidungs-Ereignisse, Dorf-Anliegen, Tagesplanung, Ada ohne Schlüssel, Nadel-Parameter.
   Lädt die gebaute modellhof_game.html wie tests_aera8.cjs in eine Node-VM. Aufruf: node dev/tests_dynamik.cjs */
const fs=require("fs"), path=require("path"), vm=require("vm"), assert=require("assert/strict");
const html=fs.readFileSync(path.join(__dirname,"..","modellhof_game.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const source=script.slice(0,script.indexOf("/* Boot-Sequenz */"));
function el(){ return {innerHTML:"",textContent:"",value:"",style:{setProperty(){},width:""},dataset:{},
  classList:{add(){},remove(){},contains:()=>false,toggle(){}},appendChild(){},remove(){},before(){},setAttribute(){},
  querySelector:()=>el(),querySelectorAll:()=>[],onclick:null,onanimationend:null,addEventListener(){},scrollTop:0,offsetWidth:0,scrollIntoView(){},focus(){}}; }
const ctx={console,Math,JSON,Date,Object,Array,Number,String,Boolean,RegExp,Map,Set,isNaN,parseInt,parseFloat,Promise,Error,BigInt,
  setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame(){},performance:{now:()=>0},
  document:{getElementById:()=>el(),createElement:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},visibilityState:"visible",body:el(),head:el()},
  window:{}, localStorage:{getItem:()=>null,setItem(){},removeItem(){}},
  confirm:()=>true, prompt:()=>null, alert(){}, btoa:s=>Buffer.from(s,"binary").toString("base64"),
  atob:s=>Buffer.from(s,"base64").toString("binary"), navigator:{}, location:{reload(){},protocol:"http:"},
  URL:{createObjectURL:()=>"",revokeObjectURL(){}}, Blob:function(){}, Image:function(){ this.onload=null; }};
ctx.globalThis=ctx; ctx.self=ctx;
vm.createContext(ctx);
vm.runInContext(source,ctx,{timeout:30000});
vm.runInContext(`Object.assign(globalThis,{EREIGNISSE,EREIGNIS_WAHL,ereignisOffen,ereignisEntscheiden,ereignisWahlAuto,ereignisKarteHtml,ereignisOffenHtml,ereignisDurchsatzF,ereignisWahlText,
  ZS_ANLIEGEN_REGELN,zsAnliegenListe,zsAnliegenNeu,zsAnliegenMorgen,zsAnliegenHtml,zsAnliegenFortschritt,zsKundenRegistrieren,KUNDEN,
  hlTagesplanungHtml,hsAdaAntwort,hsSuche,hsParsen,hsWerkzeugeJson,hsNadelPlan,hlStand,frischerStand,neuesTier,mtokTagKapazitaet,hofbuchHtml,rh,hlUhrStunde,hlUhrText,hlWarten,hlNaechsteAbnahmeStunden,hlWartenBisAbnahme,hlWartenFeierabend,hlUngenutzt,mergeDurchfuehren,istNadel,mergeKompatibel,fachGebietVonJob,KUNDEN,sbVorfahren,sbNachkommen,sbGeschwister,stammbaumSvg,HARNESSE,SKILLS,agentScore,hlKoordF,dsWahrscheinlichkeit,jobLohnGesamt,nachfrageFaktor,mcpFrei,mcpGeschirrOk,mcpStart,mcpTag,mcpHat,mcpStatus,mcpKnoten,mcpAlleKnoten,mcpJobCheck,mcpEreignisTag,mcpEffekte,mcpHtml,hsPlanPruefen,forschRasterHtml,skillRadialHtml,rhHardwareBaumHtml,rhStromBaumHtml,FINALE_REGELN,FINALE_WEGE,finaleStand,finalePruefen,finaleKarteHtml,FORSCHUNG,hlFeierabendHtml,hlTeamStart,hlAuswahl,hlJobNeu,MODELLE,FAMILIEN,GPUS,HL_AUFTRAEGE,RH_PC,WISSEN_ALLGEMEIN,startKandidaten,passtInBucht,inBucht,tokps,jobCheck,mergeKompatibel,rhRechnerPreis,rhPCUpgradeZiel,nadelHofbuchHtml,modellKaufen,rhInstall});
globalThis.__frisch=function(saat){ S=frischerStand(); S.einfFertig=true; S.kredit=5000; hlStand().saat=saat||42; zsKundenRegistrieren(S); return S; };
globalThis.__job=function(){ let j=null; for(let i=0;i<12&&!j;i++) j=hlJobNeu(0,true); S.jobs.push(j); return j; };
globalThis.__S=function(){ return S; };
globalThis.__add=function(id){ const p=neuesTier(id); S.tiere.push(p); const b=S.buchten[0]; p.bucht=b.id; b.tier=p.uid; return p; };
globalThis.__ereignis=function(id){ const e=JSON.parse(JSON.stringify(EREIGNISSE.find(x=>x.id===id))); S.events.push(e); return e; };`,ctx);
["alles","wieseNeu","schilderNeu","kopfNeu","tickerNeu","tickerLauf","zeigeBericht","zeigeJobs","zeigeMarkt","zeigeStall","zeigeFutter","zeigeHofhaus","zeigeAuftrag",
 "zeigeTier","zeigeCloud","zeigeArena","zeigeAgentenWelt","blattAuf","blattZu","blattLive","melde","uhrAnzeige","maskenCss","figurDeko","zeigeRechenhaus","zeigeHofbuch","hbSpring",
 "questPruefe","feier","adaAuto","adaZeig","rhAussenNeu","rhHintergrundNeu","hlLeiste","dockNeu","zieleNeu","zeigeNachtSetup","rhRefresh","oeffne","adaExtraNeu","adaSprich"].forEach(f=>{ ctx[f]=()=>{}; });
const g=(name)=>vm.runInContext(name,ctx);
let bestanden=0,gesamt=0; const fehl=[];
function test(name,fn){ gesamt++; try{ g("__frisch()"); fn(); bestanden++; console.log("PASS "+name); }catch(e){ fehl.push(name); console.log("FAIL "+name+" :: "+(e&&e.message||e)); } }
const S=()=>g("__S()");
function melden(fn){ const alt=ctx.melde, m=[]; ctx.melde=(t,art)=>{ m.push(String(t)); }; try{ fn(); } finally{ ctx.melde=alt; } return m; }

test("DYN-1 sechs Entscheidungs-Ereignisse mit Optionen, Zahlen, Lehre und Standard",()=>{
  const W=g("EREIGNIS_WAHL"); assert.equal(W.length,6); for(const e of W){ assert.ok(e.optionen.length>=2,e.id); assert.ok(e.lehre&&e.txt&&e.effekt&&e.effekt.tage>0,e.id); assert.ok(e.standard>=0&&e.standard<e.optionen.length,e.id);
    for(const o of e.optionen){ assert.ok(o.t&&o.txt&&o.ergebnis,e.id); assert.equal(typeof g("ereignisWahlText("+JSON.stringify(o)+")"),"string"); } assert.ok(g("EREIGNISSE").some(x=>x.id===e.id),"nicht im Katalog: "+e.id); } });
test("DYN-2 Entscheidung bucht Geld und legt den Folge-Effekt an (Untertakten drosselt den Durchsatz)",()=>{
  g("__ereignis('kuehlung_leck')"); const k=S().kredit; assert.equal(g("ereignisOffen().length"),1);
  assert.equal(g("ereignisEntscheiden('kuehlung_leck',1)"),true); assert.equal(S().kredit,k); const f=S().events.find(e=>e.id==="kuehlung_leck_folge"); assert.ok(f&&f.effekt.typ==="durchsatz"&&f.effekt.wert===0.8&&f.effekt.tage===2);
  const p=g("__add('qwen35-4b')"); assert.equal(g("ereignisDurchsatzF(__S().tiere[0])"),0.8); assert.equal(g("ereignisOffen().length"),0); assert.equal(g("ereignisEntscheiden('kuehlung_leck',0)"),false);
  g("__frisch()"); g("__ereignis('kuehlung_leck')"); const k2=S().kredit; assert.equal(g("ereignisEntscheiden('kuehlung_leck',0)"),true); assert.equal(S().kredit,k2-250); });
test("DYN-3 Tagesende löst offene Entscheidungen mit der Standard-Option auf",()=>{
  g("__ereignis('sondertarif')"); const b={zeilen:[]}; vm.runInContext("globalThis.__b="+JSON.stringify(b),ctx); g("ereignisWahlAuto(__b)"); const e=S().events.find(x=>x.id==="sondertarif"); assert.equal(e.entschieden,1); const z=g("__b.zeilen"); assert.ok(z.length===1&&/Standard/.test(z[0].t),JSON.stringify(z)); });
test("DYN-4 Ereigniskarte zeigt Knöpfe, nach der Wahl das Ergebnis",()=>{
  g("__ereignis('dorfradio')"); let h=g("ereignisKarteHtml(__S().events[0])"); assert.ok(/ereignisEntscheiden\('dorfradio',0\)/.test(h)&&/Ruf \+4/.test(h)); g("ereignisEntscheiden('dorfradio',0)"); h=g("ereignisKarteHtml(__S().events[0])"); assert.ok(/✅/.test(h)&&!/ereignisEntscheiden/.test(h)); assert.ok(S().events.some(e=>e.id==="dorfradio_folge"&&e.effekt.typ==="nachfrage")); });
test("DYN-5 Dorf-Anliegen erscheint planmäßig, zählt Fortschritt und zahlt die Prämie",()=>{
  S().tag=3; g("__add('qwen35-4b')"); vm.runInContext("globalThis.__b={zeilen:[]}",ctx); g("zsAnliegenMorgen(__b)"); const L=g("zsAnliegenListe()"); assert.equal(L.length,1); const a=L[0]; assert.ok(a.praemie>0&&a.bis===9&&a.ziel>=2&&/Tag 9/.test(g("__b.zeilen")[0].t),JSON.stringify(a));
  assert.ok(/Dorf-Anliegen/.test(g("zsAnliegenHtml(false)"))&&/progress/.test(g("zsAnliegenHtml(true)")));
  const k=S().kredit; if(a.typ==="sauber_art"||a.typ==="kunde") a.fortschritt=a.ziel; else if(a.typ==="lese"){ a.fortschritt=a.ziel; } else { g("hlStand()")[a.typ==="nacht"?"naechteArbeit":"eigenGesamt"]=(a.basis||0)+a.ziel; }
  S().tag=4; vm.runInContext("globalThis.__b={zeilen:[]}",ctx); g("zsAnliegenMorgen(__b)"); assert.equal(g("zsAnliegenListe()")[0].fertig,true); assert.equal(S().kredit,k+a.praemie); assert.ok(/erfüllt/.test(g("__b.zeilen")[0].t)); });
test("DYN-5b verfallenes Anliegen kostet nichts und wird gemeldet",()=>{
  S().tag=3; vm.runInContext("globalThis.__b={zeilen:[]}",ctx); g("zsAnliegenMorgen(__b)"); const k=S().kredit; S().tag=10; vm.runInContext("globalThis.__b={zeilen:[]}",ctx); g("zsAnliegenMorgen(__b)"); const L=g("zsAnliegenListe()"); assert.ok(L.some(a=>a.verfallen)); assert.equal(S().kredit,k); assert.ok(g("__b.zeilen").some(z=>/verfallen/.test(z.t))); });
test("DYN-6 Tagesplanung nennt Wetter, Energie in kWh und Anliegen",()=>{ g("__add('qwen35-4b')"); const h=g("hlTagesplanungHtml()"); assert.ok(/Tagesplanung/.test(h)&&/kWh/.test(h)&&/Heute:/.test(h)&&/Pinnwand/.test(h)); });
test("DYN-7 Ada antwortet ohne Schlüssel: Live-Werkzeug, Hofbuch-Treffer, Aktions-Hinweis, ehrliches Nichts",()=>{
  const a=g("hsAdaAntwort('wie wird das wetter?')"); assert.equal(a.quelle,"werkzeug"); assert.ok(/Solar/.test(a.text));
  const b=g("hsAdaAntwort('was kostet strom nachts?')"); assert.equal(b.quelle,"hofbuch"); assert.ok(b.text.length>40&&/Hofbuch/.test(b.html),b.text);
  const c=g("hsAdaAntwort('wie funktioniert die zucht mit slerp?')"); assert.equal(c.quelle,"hofbuch"); assert.ok(/[Zz]ucht|SLERP|Slerp|Merge/.test(c.text),c.text);
  const d=g("hsAdaAntwort('kauf zwei solarmodule')"); assert.equal(d.quelle,"werkzeug"); assert.ok(/Aktion/.test(d.text));
  const e=g("hsAdaAntwort('xyzzy quokka')"); assert.equal(e.quelle,"keine"); });
test("DYN-8 Nadel bekommt englische Parameter und die Antwort wird zurückübersetzt",()=>{
  const tools=JSON.parse(g("hsWerkzeugeJson()")); const em=tools.find(t=>t.name==="set_energy_mode"); assert.ok(em.parameters.properties.animal&&em.parameters.properties.mode,JSON.stringify(em)); assert.deepEqual(em.parameters.properties.mode.enum,["auto","own"]);
  const p=g('hsNadelPlan({calls:[{name:"set_energy_mode",arguments:{animal:"t3",mode:"own"}}],konfidenz:0.9})'); assert.equal(p.werkzeug,"energie_modus"); assert.equal(p.args.tier,"t3"); assert.equal(p.args.modus,"eigen");
  const q=g('hsNadelPlan({calls:[{name:"plan_night",arguments:{animal:"t2",action:"overtime"}}]})'); assert.equal(q.args.art,"ueberstunden"); });
test("DYN-9 Parser: Geldfrage und Entscheidung per Satz",()=>{
  assert.equal(g("hsParsen('wieviel geld haben wir').werkzeug"),"kassenbuch"); assert.equal(g("hsParsen('wie steht die kasse').werkzeug"),"kassenbuch");
  g("__ereignis('kuehlung_leck')"); const p=g("hsParsen('nimm option 2')"); assert.equal(p.werkzeug,"entscheiden"); assert.equal(p.args.option,2); const q=g("hsParsen('entscheide dich für den techniker')"); assert.equal(q.werkzeug,"entscheiden"); assert.equal(q.args.option,1); });


/* ── Nadel-Asset (Teil C) ── */
test("NADEL-1 Needle 2 steht mit den geprüften Werten im Katalog und ist kein Startkandidat",()=>{
  const m=g("MODELLE.needle2"); assert.ok(m&&m.nadel&&m.pT===0.045&&m.ctx===0.256&&m.lic==="Apache-2.0"&&m.preis===15&&m.w.werkzeug===58&&m.w.schreiben===3,JSON.stringify(m&&m.w));
  assert.ok(!g("startKandidaten()").some(([id])=>id==="needle2")); assert.ok(g("FAMILIEN.cactus").org.includes("Cactus")); });
test("NADEL-2 Raspberry Pi trägt nur die Nadel, die Nadel passt überall",()=>{
  const pi=g("GPUS.pi5"); assert.ok(pi&&pi.nurNadel&&pi.watt===8&&pi.preis===90); S().buchten.push({...S().buchten[0],id:"bpi",rhSlot:"pc:1",gpu:"pi5",tier:null,ramGB:8});
  const q=g("neuesTier('qwen35-4b')"), n=g("neuesTier('needle2')"); S().tiere.push(q,n); const bpi=S().buchten.find(b=>b.id==="bpi");
  assert.equal(g("passtInBucht(__S().tiere[0],__S().buchten.find(b=>b.id==='bpi'))"),false); assert.equal(g("passtInBucht(__S().tiere[1],__S().buchten.find(b=>b.id==='bpi'))"),true); assert.equal(g("passtInBucht(__S().tiere[1],__S().buchten[0])"),true);
  const m=[]; const alt=ctx.melde; ctx.melde=(t)=>m.push(String(t)); try{ g("inBucht(__S().tiere[0].uid,'bpi')"); }finally{ ctx.melde=alt; } assert.ok(m.some(t=>/Nadelklasse/.test(t)),m.join("|")); assert.equal(bpi.tier,null); });
test("NADEL-3 Tempo: 500 tok/s auf dem Pi, 1200 auf einer GPU, Kapazität mit Rüstfaktor",()=>{
  S().buchten.push({...S().buchten[0],id:"bpi",rhSlot:"pc:1",gpu:"pi5",tier:null,ramGB:8}); const n=g("neuesTier('needle2')"); S().tiere.push(n); const bpi=S().buchten.find(b=>b.id==="bpi"); n.bucht="bpi"; bpi.tier=n.uid;
  assert.equal(g("tokps(__S().tiere[0])"),500); const k=g("mtokTagKapazitaet(__S().tiere[0])"); assert.ok(k>5&&k<30,"Kapazität "+k);
  n.bucht=S().buchten[0].id; bpi.tier=null; S().buchten[0].tier=n.uid; assert.equal(g("tokps(__S().tiere[0])"),1200); });
test("NADEL-4 Mikro-Zettel „post“ ist mit der Nadel machbar, „stimmung“ (Stil) und lange Kontexte nicht",()=>{
  g("__add('needle2')");
  vm.runInContext("globalThis.__mk=function(key){ const v=HL_AUFTRAEGE.find(x=>x.key===key); return {id:'x'+key,t:v.t,b:v.b,tier:v.tier,art:v.art,kunde:v.kunde,tage:v.tage,puffer:1,frisch:1,anf:Object.assign({},...v.rollen.map(r=>r[1])),rollen:v.rollen.map(([nn,anf])=>({n:nn,anf})),teile:[],ctxMin:0.2,mtok:v.mtok,mtokTag:v.mtok/v.tage,lohnBasis:v.lohn,einheiten:8,groesse:'S',stufe:v.tier}; }",ctx);
  const post=g("(()=>{const j=__mk('post'); j.ctxMin=4; const c=jobCheck(__S().tiere[0],j); return {ok:c.ok,g:c.gruende,b:c.boni};})()"); assert.equal(post.ok,true,JSON.stringify(post)); assert.ok(post.b.some(x=>/256-Token/.test(x)),JSON.stringify(post));
  const spam=g("(()=>{const j=__mk('spam'); j.ctxMin=4; const c=jobCheck(__S().tiere[0],j); return {ok:c.ok,g:c.gruende};})()"); assert.equal(spam.ok,true,JSON.stringify(spam));
  const stimmung=g("(()=>{const j=__mk('stimmung'); j.ctxMin=4; const c=jobCheck(__S().tiere[0],j); return {ok:c.ok,g:c.gruende};})()"); assert.equal(stimmung.ok,false); assert.ok(stimmung.g.some(x=>/Stil/.test(x)),JSON.stringify(stimmung));
  const lang=g("(()=>{const j=__mk('post'); j.ctxMin=16; j.tier=1; const c=jobCheck(__S().tiere[0],j); return {ok:c.ok,g:c.gruende};})()"); assert.equal(lang.ok,false); assert.ok(lang.g.some(x=>/256 Token/.test(x)),JSON.stringify(lang)); });
test("NADEL-5 Zucht lehnt die Nadel ab, Rechenhaus kennt den Pi-Rechner, Hofbuch und Wissenskarten nennen die Zahlen",()=>{
  const a=g("neuesTier('needle2')"),b=g("neuesTier('needle2')"); S().tiere.push(a,b); const k=g("mergeKompatibel(__S().tiere[0],__S().tiere[1],'slerp')"); assert.equal(k.ok,false); assert.ok(/Nadelklasse/.test(k.warum));
  assert.equal(g("RH_PC.pi.gpu"),"pi5"); assert.equal(g("RH_PC.pi.preis"),120); assert.equal(g("rhRechnerPreis({gpu:'pi5',rhSlot:'pc:1'})"),120); assert.equal(g("rhPCUpgradeZiel('pi5')"),null);
  const h=g("nadelHofbuchHtml()"); assert.ok(/45 Mio/.test(h)&&/256 Token/.test(h)&&/500 tok\/s/.test(h)); const karten=g("WISSEN_ALLGEMEIN.filter(k=>/Needle 2|Werkzeugaufrufe|45 Millionen|Kleinstgeräte/.test(k.t)).length"); assert.equal(karten,4);
  assert.ok(/Nadelklasse/.test(g("hofbuchHtml()"))); });
test("NADEL-6 Kauf der Nadel und des Pi über die Spielfunktionen",()=>{
  const n=S().tiere.length; g("modellKaufen('needle2')"); assert.equal(S().tiere.length,n+1); assert.equal(S().tiere[S().tiere.length-1].modell,"needle2");
  const nb=S().buchten.length; const k=S().kredit; g("rhInstall('pc',1,'pi')"); assert.equal(S().buchten.length,nb+1); assert.equal(S().buchten[nb].gpu,"pi5"); assert.equal(S().kredit,k-120); });

/* ── Hofuhr & Warten ── */
test("UHR-1 Warten spult die Hofuhr vor (Uhrstunden), Text stimmt, Deckel bei Feierabend",()=>{
  assert.equal(g("hlUhrStunde()"),6); g("hlWarten(4,true)"); assert.equal(Math.round(g("hlUhrStunde()")*100)/100,10); assert.equal(g("hlUhrText(hlUhrStunde())"),"10:00"); g("hlWarten(30,true)"); assert.equal(g("hlUhrStunde()"),22); assert.equal(S()._tagFaellig,true); });
test("UHR-2 Ein kurzer Zettel bindet das Modell nur seine Stunden: nach dem Warten ist es frei und nimmt am selben Tag den nächsten",()=>{
  const p=g("__add('qwen35-4b')"); const j=g("__job()"); j.mtok=0.3; j.mtokTag=0.3; vm.runInContext("hlAuswahl['"+j.id+"']={0:'"+p.uid+"'}",ctx); g("hlTeamStart('"+j.id+"')"); assert.ok(j.team,"nicht gestartet"); assert.equal(p.status,"job");
  const std=g("hlNaechsteAbnahmeStunden()"); assert.ok(std!==null&&std>0&&std<6,"Reststunden "+std); const n=g("hlWartenBisAbnahme()"); assert.equal(n,1,"Abnahme"); assert.equal(p.status,"frei"); assert.ok(S().statistik.jobs>=1); assert.ok(g("hlUhrStunde()")<22);
  const j2=g("__job()"); j2.mtok=0.3; j2.mtokTag=0.3; vm.runInContext("hlAuswahl['"+j2.id+"']={0:'"+p.uid+"'}",ctx); g("hlTeamStart('"+j2.id+"')"); assert.ok(j2.team,"zweiter Zettel am selben Tag"); assert.equal(S().tag,1); });
test("UHR-3 Feierabend-Hinweis nennt freie Modelle und liegengebliebene Stunden, verschwindet um 22 Uhr",()=>{
  g("__add('qwen35-4b')"); g("hlWarten(4,true)"); const h=g("hlFeierabendHtml()"); assert.ok(/Feierabend um 10:00/.test(h)&&/freie Modelle/.test(h)&&/Modell-Stunden/.test(h),h.slice(0,200)); const u=g("hlUngenutzt()"); assert.equal(u.modelle,1); assert.ok(u.stunden>9&&u.stunden<11,"Stunden "+u.stunden);
  g("hlWarten(16,true)"); assert.equal(g("hlFeierabendHtml()"),""); assert.ok(/Hofuhr/.test(g("hofbuchHtml()"))); });
test("UHR-4 Warten ohne laufenden Auftrag ändert nichts, Hofsprecher versteht „warte bis zur Abnahme“",()=>{
  const m=[]; const alt=ctx.melde; ctx.melde=(t)=>m.push(String(t)); try{ assert.equal(g("hlWartenBisAbnahme()"),0); }finally{ ctx.melde=alt; } assert.ok(m.some(t=>/Kein Auftrag/.test(t))); assert.equal(g("hlUhrStunde()"),6);
  const p1=g("hsParsen('warte bis zur abnahme')"); assert.equal(p1.werkzeug,"warten"); assert.equal(p1.args.bis,"abnahme"); const p2=g("hsParsen('warte 2 stunden')"); assert.equal(p2.args.stunden,2); const p3=g("hsParsen('spul bis feierabend vor')"); assert.equal(p3.args.bis,"feierabend"); });

/* ── Spieltest v9.8 ── */
test("UHR-5 Ein spät angenommener Zettel wird nicht am selben Abend fertig: Arbeit zählt ab der Annahme, Fristbudget ab jetzt",()=>{
  const p=g("__add('qwen35-4b')"); g("hlWarten(8,true)"); const j=g("__job()"); j.mtok=1.4; j.mtokTag=1.4; j.puffer=1;
  const budget=g("hlFristBudget(__S().jobs.find(x=>x.id==='"+j.id+"'))"); assert.ok(budget<hlF(j)*14&&budget>0,"Budget "+budget);
  vm.runInContext("hlAuswahl['"+j.id+"']={0:'"+p.uid+"'}",ctx); g("hlTeamStart('"+j.id+"')"); assert.ok(j.team,"nicht gestartet"); assert.ok(j.team.heuteAnteil>0.49&&j.team.heuteAnteil<0.51,"Anteil "+j.team.heuteAnteil);
  const J="__S().jobs.find(x=>x.id==='"+j.id+"')"; const r=g("hlRestStunden("+J+")"); assert.ok(r&&!r.heuteFertig&&r.std>5,"Rest "+JSON.stringify(r));
  assert.equal(g("hlWarten(1,true)"),0,"nach 1 h darf nichts abgenommen sein"); assert.equal(p.status,"job");
  const vor=g("hlRestStunden("+J+")").std; g("hlWarten(2,true)"); const nach=g("hlRestStunden("+J+")").std;
  assert.ok(Math.abs((vor-nach)-2*14/16)<0.05,"2 Uhrstunden = 1,75 Arbeitsstunden, gemessen "+(vor-nach)); assert.equal(p.status,"job","der Zettel läuft weiter"); });
function hlF(j){ return (j.tage||1)+(j.puffer??1); }
test("UHR-6 Um 21:54 ist ein 14-h-Eilzettel aussichtslos (Budget ≈ 0,1 h) – die Annahme wird abgelehnt; mit Puffer wird er 🟡 und läuft morgen weiter",()=>{
  const p=g("__add('qwen35-4b')"); g("hlWarten(15.9,true)"); const j=g("__job()"); j.mtok=1.4; j.mtokTag=1.4; j.puffer=0; j.tage=1; const J2="__S().jobs.find(x=>x.id==='"+j.id+"')";
  vm.runInContext("hlAuswahl['"+j.id+"']={0:'"+p.uid+"'}",ctx); const m=melden(()=>g("hlTeamStart('"+j.id+"')")); assert.ok(!j.team&&m.some(t=>/Aussichtslos/.test(t)),m.join("|"));
  j.puffer=1; const m2=melden(()=>g("hlTeamStart('"+j.id+"')")); assert.ok(j.team,m2.join("|")); assert.ok(/🟡|🔴/.test(m2.join("|")),m2.join("|"));
  assert.ok(!g("hlRestStunden("+J2+")").heuteFertig,"darf heute Abend nicht fertig sein"); });
test("NADEL-7 Die Nadel zieht in die Pi-5-Bucht; ein 4B-Modell wird mit Klartext abgewiesen",()=>{
  S().buchten.push({...S().buchten[0],id:"bpi",rhSlot:"pc:1",gpu:"pi5",tier:null,ramGB:8,ssdTB:0.1}); const n=g("__add('needle2')"); const q=g("__add('qwen35-4b')"); assert.ok(g("istNadel(__S().tiere.find(p=>p.uid==='"+n.uid+"'))"),"Needle 2 muss als Nadel gelten");
  let m=melden(()=>g("inBucht('"+n.uid+"','bpi')")); assert.equal(n.bucht,"bpi",m.join("|")); assert.ok(!m.some(t=>/Passt nicht/.test(t)),m.join("|"));
  n.bucht=null; S().buchten.find(b=>b.id==="bpi").tier=null; q.bucht=null; S().buchten[0].tier=null;
  m=melden(()=>g("inBucht('"+q.uid+"','bpi')")); assert.notEqual(q.bucht,"bpi"); assert.ok(m.some(t=>/Nadel[- ]?klasse/i.test(t)),m.join("|")); });
test("NADEL-8 Ein Zuchtkind erbt die Nadelklasse nur von einer Nadel – sonst bleibt die Zuchtlinie über Generationen offen",()=>{
  const a=g("__add('qwen35-4b')"); const b=g("neuesTier('qwen35-4b')"); S().tiere.push(b);
  const k=g("mergeDurchfuehren(['"+a.uid+"','"+b.uid+"'],'slerp').kind"); S().tiere.push(k);
  assert.equal(k.nadel,false,"Kind zweier gewöhnlicher Modelle ist keine Nadel");
  assert.ok(!g("istNadel(__S().tiere.find(p=>p.uid==='"+k.uid+"'))"));
  assert.equal(g("mergeKompatibel(__S().tiere.find(p=>p.uid==='"+k.uid+"'),__S().tiere[0],'slerp')").ok,true,"Enkelgeneration muss möglich sein");
  const n=g("neuesTier('needle2')"); assert.equal(g("mergeKompatibel("+JSON.stringify({fam:"qwen",pT:4,nadel:true})+",__S().tiere[0],'slerp')").ok,false,"eine Nadel bleibt unzüchtbar"); });
/* ── Das Ende: Hofmeisterbrief und Legende ── */
test("FINALE-1 Fünf Lebenswerke, zwei Wege zum Brief: Stufe 10 plus zwei Werke geben den Meisterbrief, Prämie und XP genau einmal",()=>{
  assert.equal(g("FINALE_WEGE.length"),5); assert.equal(g("finaleStand().meister"),false,"frischer Hof hat nichts");
  S().xp=99999; S().statistik.jobs=100; S().ruf=95; S().statistik.merges=5; const p=g("__add('qwen35-4b')"); p.gen=3;
  const st=g("finaleStand()"); assert.ok(st.stufe>=10,"Stufe "+st.stufe); assert.equal(st.erreicht.length,2,JSON.stringify(st.wege.map(w=>w.id+":"+w.ok)));
  const kasse=S().kredit, xp=S().xp; vm.runInContext("globalThis.__b={zeilen:[]}",ctx); assert.equal(g("finalePruefen(__b)"),"meister");
  assert.equal(S().kredit,kasse+5000); assert.equal(S().xp,xp+600); assert.ok(g("__b.zeilen").some(z=>/HOFMEISTERBRIEF/.test(z.t)));
  vm.runInContext("globalThis.__b2={zeilen:[]}",ctx); assert.equal(g("finalePruefen(__b2)"),null,"kein zweites Mal"); assert.equal(S().kredit,kasse+5000); });
test("FINALE-2 Mehr als ein Weg: jedes Lebenswerk zählt einzeln, Karte und Hofbuch nennen Stand und Lehre",()=>{
  S().xp=99999; const w=g("finaleStand().wege.map(w=>w.id)"); assert.deepEqual(JSON.parse(JSON.stringify(w)),["zucht","rechen","wissen","handel","fach"]);
  const p=g("__add('qwen35-4b')"); p.fach={datenschutz:90,recht:90,steuer:90}; S().abmahnungen=0;
  assert.ok(g("finaleStand().wege.find(x=>x.id==='fach').ok"),"Fachhaus über Zertifikate erreichbar");
  S().forschung={}; Object.keys(g("FORSCHUNG")).forEach(k=>{ vm.runInContext("__S().forschung['"+((g("FORSCHUNG")[k]||{}).frei||k)+"']=true",ctx); });
  assert.ok(g("finaleStand().wege.find(x=>x.id==='wissen').ok"),"Forschungsbaum als eigener Weg");
  const k=g("finaleKarteHtml()"); assert.ok(/Lebenswerk|Hofmeisterbrief/.test(k)&&/Fachhaus/.test(k),k.slice(0,160));
  assert.ok(/Hofmeisterbrief/.test(g("hofbuchHtml()"))&&/Legende/.test(g("hofbuchHtml()"))); });
test("FINALE-3 Ein geschlossener Hof bekommt keinen Brief",()=>{
  S().xp=99999; S().statistik.jobs=100; S().ruf=95; S().statistik.merges=5; const p=g("__add('qwen35-4b')"); p.gen=3;
  S().geschlossen={tag:1,grund:"Test"}; assert.equal(g("finalePruefen(null)"),null); assert.ok(!(S().finale&&S().finale.meister)); });
test("ZS-KUNDE Ein Rechts- oder Medizin-Zettel behält einen Auftraggeber aus demselben Fach; die Fachrichtung schlägt den Kundensektor",()=>{
  const recht={id:"jr",art:"recht",tier:3,tage:2,puffer:1,kunde:"kanzlei"};
  assert.equal(g("fachGebietVonJob("+JSON.stringify(recht)+")"),"recht");
  const mitMedizinKunde={...recht,sektor:"medizin"};
  assert.equal(g("fachGebietVonJob("+JSON.stringify(mitMedizinKunde)+")"),"recht","die Art des Zettels schlägt den Sektor");
  S().xp=99999; let geprueft=0,falsch=0;
  for(let i=0;i<160;i++){ const j=g("hlJobNeu("+(i%6)+")"); if(!j) continue; S().jobs.push(j);
    if(j.art!=="recht"&&j.art!=="medizin") continue; geprueft++;
    const K=g("KUNDEN['"+j.kunde+"']");
    if(K&&K.sektor&&K.sektor!==j.art&&(K.sektor==="medizin"||K.sektor==="recht")) falsch++; }
  assert.equal(falsch,0,"Fach-Zettel mit fachfremdem Auftraggeber: "+falsch+" von "+geprueft); });

/* ── v9.9 · MCP-Werkstatt und Techbäume ── */
test("MCP-1 Werkstatt öffnet ab Hofstufe 3 mit Agentenwerkstatt; Anschluss kostet Geld und Tage, ein Knoten je Anschlussbrett, Voraussetzungen zählen",()=>{
  assert.equal(g("mcpFrei()"),false); S().xp=99999; assert.equal(g("mcpFrei()"),false,"ohne Agentenwerkstatt zu"); S().forschung.geschirr=true; assert.equal(g("mcpFrei()"),true);
  const p=g("__add('qwen35-4b')"); assert.equal(g("mcpGeschirrOk()"),false); let m=melden(()=>g("mcpStart('stdio')")); assert.ok(m.some(t=>/MCP-Unterstützung/.test(t)),m.join("|"));
  p.geschirr="claude-code"; assert.equal(g("mcpGeschirrOk()"),true); assert.equal(g("HARNESSE.pi.mcp"),false); assert.equal(g("HARNESSE.goose.mcp"),true);
  m=melden(()=>g("mcpStart('http')")); assert.ok(m.some(t=>/braucht erst/.test(t)),"Voraussetzung: "+m.join("|"));
  const k=S().kredit; assert.equal(g("mcpStart('stdio')"),true); assert.equal(S().kredit,k-120); assert.ok(S().mcp.aktiv&&S().mcp.aktiv.id==="stdio");
  m=melden(()=>g("mcpStart('tools')")); assert.ok(m.some(t=>/belegt|läuft schon/.test(t)),m.join("|"));
  vm.runInContext("globalThis.__b={zeilen:[]}",ctx); g("mcpTag(__b)"); assert.equal(g("mcpHat('stdio')"),true); assert.ok(g("__b.zeilen").some(z=>/angeschlossen/.test(z.t)));
  assert.equal(g("mcpStatus(mcpKnoten('http'))"),"kann"); assert.equal(g("mcpStatus(mcpKnoten('oauth'))"),"gesperrt"); assert.equal(g("mcpAlleKnoten().length"),17); });
test("MCP-2 Wirkungen greifen genau wie im Hofbuch: Agentenleistung, Ballast, Abstimmung, Datenschutz, Injection-Schaden, Anschlussprämie",()=>{
  S().xp=99999; S().forschung.geschirr=true; const p=g("__add('qwen35-4b')"); p.geschirr="claude-code";
  const a0=g("agentScore(__S().tiere[0])"); S().mcp={fertig:{tools:1},aktiv:null}; assert.equal(g("agentScore(__S().tiere[0])"),Math.min(99,a0+6),"tools +6");
  assert.equal(g("hlKoordF(2,false)"),1.10); S().mcp.fertig.prompts=1; assert.equal(g("hlKoordF(2,false)"),1.08); S().mcp.fertig.sampling=1; assert.equal(g("hlKoordF(3,false)"),1.12);
  const j={id:"jx",art:"agent",agent:true,tier:1,risiko:2,tage:1,puffer:1,lohnBasis:1000,mtokTag:1,mtok:1,kunde:"praxis",sektor:"medizin"};
  const d0=g("dsWahrscheinlichkeit("+JSON.stringify(j)+",[__S().tiere[0]])").p; S().mcp.fertig.elicitation=1; S().mcp.fertig.audit=1; const d=g("dsWahrscheinlichkeit("+JSON.stringify(j)+",[__S().tiere[0]])"); assert.ok(d0>0&&Math.abs(d.p-d0*0.85*0.7)<0.006,"DS "+d0+" → "+d.p+" (auf zwei Stellen gerundet)");
  S().mcp.fertig.roots=1; S().mcp.fertig.sandbox=1; assert.ok(Math.abs(g("mcpEffekte().schadenF")-0.375)<1e-9);
  assert.equal(g("jobLohnGesamt("+JSON.stringify(j)+")"),Math.round(1000*g("nachfrageFaktor()"))," ohne Anschluss kein Aufschlag"); S().mcp.fertig.srv_datei=1; assert.equal(g("jobLohnGesamt("+JSON.stringify(j)+")"),Math.round(1000*g("nachfrageFaktor()")*1.08));
  S().mcp.fertig.http=1; S().mcp.fertig.srv_web=1; assert.ok(Math.abs(g("mcpEffekte().dsF")-0.85*0.7*1.5)<1e-9,"Fernleitung ohne OAuth"); S().mcp.fertig.oauth=1; assert.ok(Math.abs(g("mcpEffekte().dsF")-0.85*0.7)<1e-9); });
test("MCP-3 Ohne Anschluss arbeitet ein Agent von Hand (−12), ab Tier 3 ist der Zettel gesperrt; vergiftete Werkzeugbeschreibungen treffen nur mit Anschluss und werden von Freigabeliste, geprüften Quellen und Sandkasten gedämpft",()=>{
  S().xp=99999; S().forschung.geschirr=true; const p=g("__add('qwen35-4b')"); p.geschirr="claude-code";
  const c1={ok:true,gruende:[],boni:[],erfolg:0}; vm.runInContext("globalThis.__c="+JSON.stringify(c1),ctx); g("mcpJobCheck({agent:true,tier:1,sektor:'buero'},__c)"); assert.equal(g("__c.erfolg"),-12); assert.ok(g("__c.gruende").some(x=>/von Hand/.test(x)));
  vm.runInContext("globalThis.__c2={ok:true,gruende:[],boni:[],erfolg:0}",ctx); g("mcpJobCheck({agent:true,tier:3,sektor:'buero'},__c2)"); assert.equal(g("__c2.ok"),false);
  S().mcp={fertig:{stdio:1,srv_mail:1},aktiv:null}; vm.runInContext("globalThis.__c3={ok:true,gruende:[],boni:[],erfolg:0}",ctx); g("mcpJobCheck({agent:true,tier:3,sektor:'buero'},__c3)"); assert.equal(g("__c3.ok"),true); assert.ok(g("__c3.boni").some(x=>/\+8 %/.test(x)));
  const alt=ctx.Math.random; try{ ctx.Math.random=()=>0.0; S().mcp={fertig:{},aktiv:null}; assert.equal(g("mcpEreignisTag(null)"),null,"ohne Anschluss kein Gift");
    S().mcp={fertig:{stdio:1,srv_datei:1},aktiv:null}; const k=S().kredit; const r=g("mcpEreignisTag(null)"); assert.equal(r.strafe,60); assert.equal(S().kredit,k-60);
    S().mcp.fertig.sandbox=1; assert.equal(g("mcpEreignisTag(null)").strafe,30,"Sandkasten halbiert");
    ctx.Math.random=()=>0.05; S().mcp.fertig.allowlist=1; assert.equal(g("mcpEreignisTag(null)"),null,"Freigabeliste: 8 % × 0,25 = 2 % < 5 %");
    ctx.Math.random=()=>0.019; assert.ok(g("mcpEreignisTag(null)"),"unter 2 % trifft es"); S().mcp.fertig.registry=1; ctx.Math.random=()=>0.0079; assert.ok(g("mcpEreignisTag(null)")); ctx.Math.random=()=>0.0081; assert.equal(g("mcpEreignisTag(null)"),null,"Geprüfte Quellen: 0,8 %");
  } finally { ctx.Math.random=alt; } });
test("MCP-4 Hofbuch, Kompendium, Hofsprecher und Treiber kennen die Werkstatt; die Baumgrafik enthält alle Knoten",()=>{
  const h=g("hofbuchHtml()"); assert.ok(/MCP-Werkstatt/.test(h)&&/Vergiftete Werkzeugbeschreibung/.test(h)&&/JSON-RPC/.test(h));
  assert.ok(g("WISSEN_ALLGEMEIN.some(w=>/USB-C-Anschluss/.test(w.t))"),"Kompendium-Karte");
  S().xp=99999; S().forschung.geschirr=true; const p=g("__add('qwen35-4b')"); p.geschirr="goose"; S().daten.kuratiert=20;
  const plan=g("hsParsen('schließe den dateiserver an')"); assert.equal(plan.werkzeug,"mcp_anschluss"); assert.equal(plan.args.knoten,"srv_datei");
  const pr=g("hsPlanPruefen("+JSON.stringify(plan)+")"); assert.equal(pr.ok,false); assert.ok(/braucht erst/.test(pr.grund),pr.grund);
  const plan2=g("hsParsen('mcp stdio anschliessen')"); assert.equal(plan2.args.knoten,"stdio"); assert.equal(g("hsPlanPruefen("+JSON.stringify(plan2)+")").ok,true);
  const svg=g("mcpHtml()"); assert.ok(/<svg/.test(svg)&&(svg.match(/class="tbKnoten /g)||[]).length>=17,"Knoten im Netz: "+(svg.match(/class="tbKnoten /g)||[]).length); assert.ok(/techbaum_radial|data:image/.test(svg)); });
test("TB-1 Forschung als Raster und Meisterschaften als Netz zeichnen alle Einträge mit richtigem Zustand",()=>{
  S().xp=99999; const f=g("forschRasterHtml()"); const n=(f.match(/class="tbFeld /g)||[]).length; assert.equal(n,g("Object.keys(FORSCHUNG).length"),"Forschungsfelder "+n);
  assert.ok(/tbFeld kann/.test(f)&&/tbFeld gesperrt/.test(f),"Zustände vorhanden"); S().forschung.sft=true; assert.ok(/tbFeld fertig/.test(g("forschRasterHtml()")));
  const r=g("skillRadialHtml()"); const m=(r.match(/class="tbKnoten /g)||[]).length; const soll=g("Object.values(SKILLS).reduce((n,w)=>n+w.skills.length,0)"); assert.equal(m,soll+1,"Fähigkeiten + Mitte");
  const hw=g("rhHardwareBaumHtml()"); assert.ok(/<svg/.test(hw)&&/Raspberry|Pi 5|4090/.test(hw)); const st=g("rhStromBaumHtml()"); assert.ok(/Solar|Akku|Wind/.test(st)); });
test("TB-2 Gesamtübersicht zeigt vier verbundene Entwicklungsäste und ihren Fortschritt",()=>{
  const u=g("forschUebersichtHtml()"); assert.equal((u.match(/tbGesamtAst /g)||[]).length,4,"vier Hauptäste");
  ["Forschung","Meisterschaften","MCP-Werkstatt","Rechenhaus","Antworten","Tempo","Sicherheit"].forEach(t=>assert.ok(u.includes(t),t));
  assert.ok(/class="tbVerbindungen"/.test(u)&&((u.match(/<path class=/g)||[]).length===4),"vier sichtbare Verbindungen zur Hofstufe");
  assert.ok(/Hofstufe \d+/.test(u)&&/erforscht/.test(u)&&/gemeistert/.test(u)&&/angeschlossen|ab Hofstufe/.test(u),"dynamischer Stand"); });
test("TB-3 Ada erklärt alle Forschungs- und Rechenhaus-Bereiche und ist in die Führung eingebunden",()=>{
  const ids=["ort_forschung","forschung_baum","forschung_meister","mcp_werkstatt","ort_rechenhaus","ort_energie","rechenhaus_ausbau","rechenhaus_trinkpause","rechenhaus_hofansicht","rechenhaus_hardware","rechenhaus_strom"];
  ids.forEach(id=>assert.ok(g("ADA_TEXTE["+JSON.stringify(id)+"]&&ADA_TEXTE["+JSON.stringify(id)+"].t.length>80"),id));
  assert.ok(source.includes('uebersicht:"ort_forschung",baum:"forschung_baum",meister:"forschung_meister",mcp:"mcp_werkstatt"'),"Forschungsreiter nicht mit Ada verdrahtet");
  assert.ok(source.includes("teich:['rechenhaus_trinkpause'")&&source.includes("strom:['rechenhaus_strom'"),"Rechenhaus-Reiter nicht vollständig mit Ada verdrahtet");
  assert.ok(source.includes('S.fuehrung==="gefuehrt"')&&source.includes("S.fuehrung==='gefuehrt'"),"automatische Erklärungen der geführten Spielweise fehlen");
  assert.equal(g("Object.values(ADA_TEXTE).filter(x=>x.ohneAudio).length"),0,"stummer Ada-Text"); });

test("STAMMBAUM-1 Krone zeigt Eltern und Großeltern (auch verkaufte mit Namen), Wurzeln die Nachkommen, Geschwister am Stamm",()=>{
  const a=g("__add('qwen35-4b')"); const b=g("neuesTier('qwen35-4b')"); S().tiere.push(b);
  const k1=g("mergeDurchfuehren(['"+a.uid+"','"+b.uid+"'],'slerp').kind"); S().tiere.push(k1); const k2=g("mergeDurchfuehren(['"+a.uid+"','"+b.uid+"'],'slerp').kind"); S().tiere.push(k2);
  const e=g("mergeDurchfuehren(['"+k1.uid+"','"+k2.uid+"'],'slerp').kind"); S().tiere.push(e);   /* Enkel aus zwei Geschwistern – so gibt es zwei Wurzel-Ebenen */
  const vor=g("sbVorfahren(__S().tiere.find(t=>t.uid==='"+e.uid+"'))"); assert.equal(vor.length,2,"Eltern und Großeltern"); assert.equal(vor[0].filter(Boolean).length,2);
  S().tiere=S().tiere.filter(t=>t.uid!==b.uid); const vor2=g("sbVorfahren(__S().tiere.find(t=>t.uid==='"+k1.uid+"'))"); assert.ok(vor2[0].some(x=>x&&x.weg&&x.name),"verkaufte Eltern bleiben mit Namen");
  assert.equal(g("sbNachkommen('"+a.uid+"')").length,2,"Kinder und Enkel"); assert.equal(g("sbGeschwister(__S().tiere.find(t=>t.uid==='"+k1.uid+"'))").length,1);
  const svg=g("stammbaumSvg('"+e.uid+"')"); assert.ok(/<svg/.test(svg)&&(svg.match(/class="sbKarte /g)||[]).length>=4,"Karten im Bild"); assert.ok(/stammbaum_hg|data:image/.test(svg));
  assert.ok(/Stammbaum/.test(g("hofbuchHtml()"))); });
console.log(bestanden+"/"+gesamt+" bestanden"+(fehl.length?" · FEHLER: "+fehl.join(", "):""));
process.exit(fehl.length?1:0);
