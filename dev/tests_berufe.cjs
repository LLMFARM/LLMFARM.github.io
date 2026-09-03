/* Ära-9-Prüfungen · Berufe-Katalog, Agenten-Teams, Agenten-Tool entfernen Tag 1, Datenschutz & Abmahnung.
   Lädt die gebaute modellhof_game.html wie tests_aera8.cjs in eine Node-VM. Aufruf: node dev/tests_berufe.cjs */
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
vm.runInContext(`Object.assign(globalThis,{BERUFE,BERUF_BASIS,BERUF_REGELN,BERUF_SEKTOREN,berufAlleAufgaben,zsBerufZettel,zsBerufZettelMorgen,zsKundeAusBeruf,KUNDEN,WERTE,HARNESSE,LEVELS,WOCHE,ADA_TEXTE,
  DS_REGELN,dsRisiko,dsGeschuetzt,dsWahrscheinlichkeit,dsPruefung,dsChip,dsSchulung,dsAbschluss,dsAbmahnung,dsGeschlossen,dsJobNachruesten,dsGeschlossenHtml,dsSattlereiHtml,hofSchliessen,
  hlRollen,hlRollenJob,hlKoordF,hlTeamCheck,hlStunden,hlTeamSchaetzung,hlTeamChip,hlTeamAuswahlHtml,hlTeamStart,hlWaehlen,hlAuswahl,tagBeenden,hlStand,istFrei,forschungFrei,geschirrAnlegen,geschirrEignung,agentScore,hlNachtFrei,dsAbmahnung,dsGeschlossen,dsVerwarnungOffen,dsRisikoQuelle,dsChip,dsRisiko,KUNDEN,
  FACH_GEBIETE,FACH_KURSE,FACH_REGELN,fachWert,fachKursKosten,fachKurseOffen,fachSchulungStart,fachSchulungTag,fachAnforderung,fachMinFuer,dsSchutzFaktor,hsParsen,hsVorschauText,hsAusfuehren,
  frischerStand,neuesTier,hofLevel,jobCheck,mtokTagKapazitaet,hofbuchHtml,zsKundenRegistrieren,S:undefined});
globalThis.__frisch=function(){ S=frischerStand(); S.einfFertig=true; S.kredit=6000; hlStand().saat=77; zsKundenRegistrieren(S); return S; };
globalThis.__S=function(){ return S; };
globalThis.__add=function(id,slot,geschirr){ const p=neuesTier(id); S.tiere.push(p); slot=slot||0; if(!S.buchten[slot]) S.buchten[slot]={...S.buchten[0],id:'b'+(slot+1),rhSlot:'pc:'+slot,tier:null}; p.bucht=S.buchten[slot].id; S.buchten[slot].tier=p.uid; if(geschirr) p.geschirr=geschirr; for(const k in p.w) p.w[k]=Math.max(p.w[k],70); return p; };
globalThis.__teamJob=function(teamMax){ let j=null; for(let i=0;i<160&&!(j&&j.teamMax===teamMax&&j.risiko===0);i++){ j=zsBerufZettel({team:true}); } if(!j||j.teamMax!==teamMax||j.risiko!==0){ j=zsBerufZettel({team:true}); j.teamMax=teamMax; j.komplex=true; j.agent=true; j.risiko=0; j.dsgvo=false; j.gebiet=null; j.fachMin=undefined; j.sektor="it"; j.kunde=Object.keys(KUNDEN).find(k=>!KUNDEN[k].lokalPflicht); } j.mtok=6; j.mtokTag=Math.round(6/j.tage*1000)/1000; S.jobs.push(j); return j; };
globalThis.__risikoJob=function(){ S.xp=Math.max(S.xp||0,99999); let j=null; for(let i=0;i<160&&!(j&&j.risiko===2&&j.teamMax<=1);i++){ j=zsBerufZettel({}); } if(!j||j.risiko!==2){ j=zsBerufZettel({}); j.risiko=2; j.dsgvo=true; j.gebiet="recht"; j.fachMin=fachMinFuer(2,j.tier||0,S.tag); } S.jobs.push(j); return j; };`,ctx);
["alles","wieseNeu","schilderNeu","kopfNeu","tickerNeu","tickerLauf","zeigeBericht","zeigeJobs","zeigeMarkt","zeigeStall","zeigeFutter","zeigeHofhaus","zeigeAuftrag","zeigeGeschirr",
 "zeigeTier","zeigeCloud","zeigeArena","zeigeAgentenWelt","blattAuf","blattZu","blattLive","melde","uhrAnzeige","maskenCss","figurDeko","zeigeRechenhaus","zeigeHofbuch","hbSpring",
 "questPruefe","feier","adaAuto","adaZeig","adaSprich","rhAussenNeu","rhHintergrundNeu","hlLeiste","dockNeu","zieleNeu","zeigeNachtSetup","rhRefresh","oeffne","adaExtraNeu","startGuideGeschirrFertig"].forEach(f=>{ ctx[f]=()=>{}; });
const g=(name)=>vm.runInContext(name,ctx);
let bestanden=0,gesamt=0; const fehl=[];
function test(name,fn){ gesamt++; try{ g("__frisch()"); fn(); bestanden++; console.log("PASS "+name); }catch(e){ fehl.push(name); console.log("FAIL "+name+" :: "+(e&&e.message||e)); } }
const S=()=>g("__S()");
const melden=(fn)=>{ const m=[]; const alt=ctx.melde; ctx.melde=(t)=>m.push(String(t)); try{ fn(); }finally{ ctx.melde=alt; } return m; };

test("BERUFE-1 Katalog: ≥ 45 Berufe, ≥ 140 Aufgaben, alle Felder gültig, Risiko-Sektoren definiert",()=>{
  const B=g("BERUFE"), alle=g("berufAlleAufgaben()"), W=g("WERTE"), arten=["text","support","code","agent","wissen","recht","medizin"]; assert.ok(B.length>=45,"Berufe "+B.length); assert.ok(alle.length>=140,"Aufgaben "+alle.length);
  const ids=new Set(); for(const b of B){ assert.ok(!ids.has(b.id),b.id); ids.add(b.id); assert.ok(g("BERUF_SEKTOREN")[b.sektor],b.sektor); assert.ok(b.aufgaben.length>=3,b.id);
    for(const a of b.aufgaben){ assert.ok(a.t&&a.k&&a.lehre,b.id); assert.ok(arten.includes(a.art),b.id+" "+a.art); assert.ok(a.tier>=0&&a.tier<=5&&a.team>=1&&a.team<=4,b.id+" "+a.t); } }
  const DS=g("DS_REGELN"); for(const sek of ["medizin","recht","steuer","personal","pflege"]) assert.equal(DS.sektorRisiko[sek],2,sek); assert.ok(B.some(b=>b.sektor==="medizin")&&B.some(b=>b.sektor==="recht")&&B.some(b=>b.sektor==="gastro")&&B.some(b=>b.sektor==="handwerk")); });
test("BERUFE-2 Katalog-Zettel: Zahlen in den Bändern, Anforderungen gültig, Kunde registriert, Team ⇒ Agent, hoch ⇒ nur lokal",()=>{
  S().xp=99999; g("__add('qwen35-4b',0,'hofgeschirr')"); const B=g("BERUF_BASIS"), R=g("BERUF_REGELN"), W=g("WERTE"); const gesehen=new Set();
  for(let i=0;i<80;i++){ const j=g("zsBerufZettel({})"); assert.ok(j&&j.id&&j.t&&j.b.length>30,"Zettel "+i); const b=B[j.tier]; gesehen.add(j.beruf);
    assert.ok(j.mtok>=b.mtok*0.2&&j.mtok<=b.mtok*7,"mtok "+j.mtok+" T"+j.tier); assert.ok(j.lohnBasis>=b.lohn*0.4&&j.lohnBasis<=b.lohn*9,"lohn "+j.lohnBasis+" T"+j.tier); assert.ok(j.tage>=1&&j.tage<=12,"tage"); assert.equal(j.ctxMin,b.ctx);
    for(const k in j.anf) assert.ok(W[k],"anf "+k); assert.ok(g("KUNDEN")[j.kunde],"Kunde "+j.kunde); if(j.teamMax>1){ assert.equal(j.agent,true); assert.equal(j.komplex,true); } if(j.risiko>=2) assert.equal(j.dsgvo,true); assert.ok(j.rollen.length===1&&j.rollen[0].anf); }
  assert.ok(gesehen.size>=20,"Vielfalt "+gesehen.size); assert.ok(Object.keys(S().kundenDyn).filter(k=>k.startsWith("dyn_b_")).length>=15); });
test("BERUFE-2b Agenten-Tool mit Schutzfunktionen schaltet sensible Zettel sichtbar, Restrisiko bleibt in der Besetzungsprüfung",()=>{
  const p=g("__add('qwen35-4b',0,'claude-code')"); let sensibel=null; for(let i=0;i<240&&!sensibel;i++){const j=g("zsBerufZettel({tier:0})");if(j.risiko>0)sensibel=j;}
  assert.ok(sensibel,"kein sensibler Zettel trotz Agenten-Tool mit Schutzfunktionen"); const d=g("dsWahrscheinlichkeit("+JSON.stringify(sensibel)+",[__S().tiere[0]])"); assert.ok(d.p>0&&d.p<=0.15,JSON.stringify(d)); });
test("BERUFE-3 Agenten-Team: 2 Agenten ≈ 55 %, 3 Agenten ≈ 40 % der Solo-Zeit (gemischt), gleiches Agenten-Tool günstiger",()=>{
  S().xp=99999; g("__add('qwen35-4b',0,'hofgeschirr')"); g("__add('qwen35-4b',1,'opencode')"); g("__add('qwen35-4b',2,'opencode')"); S().forschung.geschirr=true;
  const j=g("__teamJob(3)"); const s1=g("hlTeamSchaetzung(__S().jobs[__S().jobs.length-1],1)"), s2=g("hlTeamSchaetzung(__S().jobs[__S().jobs.length-1],2)"), s3=g("hlTeamSchaetzung(__S().jobs[__S().jobs.length-1],3)");
  assert.ok(s1&&s2&&s3,"Schätzungen "+JSON.stringify([s1,s2,s3])); const r2=s2.std/s1.std, r3=s3.std/s1.std; assert.ok(r2>0.5&&r2<0.6,"r2="+r2); assert.ok(r3>0.35&&r3<0.45,"r3="+r3);
  S().tiere[1].geschirr="hofgeschirr"; const t2=g("hlTeamSchaetzung(__S().jobs[__S().jobs.length-1],2)"); assert.ok(t2.gleich&&t2.std<s2.std,"gleiches Agenten-Tool schneller: "+t2.std+" vs "+s2.std);
  assert.ok(/Team bis 3/.test(g("hlTeamChip(__S().jobs[__S().jobs.length-1])"))); assert.ok(/hlTeamGroesse/.test(g("hlTeamAuswahlHtml(__S().jobs[__S().jobs.length-1])"))); });
test("BERUFE-3b Team annehmen: drei Agenten arbeiten gleichzeitig, Rollen = Teamgröße",()=>{
  S().xp=99999; ["a","b","c"].forEach((x,i)=>g("__add('qwen35-4b',"+i+",'hofgeschirr')")); S().forschung.geschirr=true; const j=g("__teamJob(3)"); j.teamN=3;
  const w={}; S().tiere.forEach((p,i)=>{ w[i]=p.uid; }); vm.runInContext("hlAuswahl['"+j.id+"']="+JSON.stringify(w),ctx); const m3=melden(()=>g("hlTeamStart('"+j.id+"')"));
  assert.ok(j.team,"nicht gestartet: "+m3.join(" | ")+" · check="+JSON.stringify(g("hlTeamCheck(__S().jobs.find(x=>x.id==='"+j.id+"'),hlAuswahl['"+j.id+"'])").gruende)); assert.equal(g("hlRollen(__S().jobs.find(x=>x.id==='"+j.id+"'))").length,3); assert.ok(S().tiere.every(p=>p.status==="job")); });
test("BERUFE-3c dieselbe UID darf nicht mehrere Agentenrollen gleichzeitig besetzen",()=>{
  S().xp=99999; const p=g("__add('qwen35-4b',0,'hofgeschirr')"); S().forschung.geschirr=true; const j=g("__teamJob(3)"); j.teamN=3;
  const c=g("hlTeamCheck(__S().jobs[__S().jobs.length-1],{0:'"+p.uid+"',1:'"+p.uid+"',2:'"+p.uid+"'})"); assert.equal(c.ok,false); assert.ok(c.gruende.some(x=>/eigenes Modell/.test(x)),JSON.stringify(c.gruende)); });
test("BERUFE-4 Datenschutz-Risiko: ungeschützt 30 %, Schutzregeln halbieren, Fachwissen senkt linear, Agenten-Tool mit Schutzfunktionen halbiert, Leih-Tier zählt doppelt",()=>{
  const p=g("__add('qwen35-4b')"); g("__risikoJob()"); const J="__S().jobs[__S().jobs.length-1]"; assert.equal(g("dsRisiko("+J+")"),2);
  let d=g("dsWahrscheinlichkeit("+J+",[__S().tiere[0]])"); assert.equal(d.p,0.3); assert.ok(/Datenschutz-Risiko 30 %/.test(g("dsPruefung("+J+",[__S().tiere[0]])").warnung));
  S().forschung.guardrails=true; d=g("dsWahrscheinlichkeit("+J+",[__S().tiere[0]])"); assert.equal(d.p,0.15); S().forschung.guardrails=false;
  p.fach={datenschutz:50}; assert.equal(g("dsSchutzFaktor(__S().tiere[0],null)"),0.5); assert.equal(g("dsWahrscheinlichkeit("+J+",[__S().tiere[0]])").p,0.15);
  p.fach={datenschutz:90}; assert.equal(g("dsSchutzFaktor(__S().tiere[0],null)"),0); assert.equal(g("dsWahrscheinlichkeit("+J+",[__S().tiere[0]])").p,0); assert.ok(g("dsGeschuetzt(__S().tiere[0])"));
  p.fach={}; p.geschirr="claude-code"; assert.equal(g("dsSchutzFaktor(__S().tiere[0],null)"),0.5); p.geschirr=null;
  p.fach={recht:100}; assert.equal(g("dsSchutzFaktor(__S().tiere[0],'recht')"),0.4,"Fachwissen im Gebiet zählt zu 60 %"); p.fach={};
  const api={uid:"tapi",name:"Luna",api:true,status:"frei"}; d=g("dsWahrscheinlichkeit("+J+",["+JSON.stringify(api)+"])"); assert.equal(d.p,0.3,"Leih-Tier: 50 Fachwissen, doppelt"); assert.ok(/Datenschutz hoch/.test(g("dsChip("+J+")"))&&/🎓/.test(g("dsChip("+J+")"))); });
test("BERUFE-5 Verstoß → Strafe + Abmahnung, zweite Abmahnung schließt den Hof, Tag und Zusagen sind gesperrt",()=>{
  g("__add('qwen35-4b')"); const j=g("__risikoJob()"); j.vereinbart=1000; const altR=ctx.Math.random; ctx.Math.random=()=>0; let b;
  try{ vm.runInContext("globalThis.__b={zeilen:[]}",ctx); const k=S().kredit; const r=g("dsAbschluss(__S().jobs[__S().jobs.length-1],[__S().tiere[0]],__b,true)"); assert.ok(r&&r.strafe===400,JSON.stringify(r)); assert.equal(S().kredit,k-400); assert.equal(S().abmahnungen,1); assert.ok(g("__b.zeilen").some(z=>/ABMAHNUNG 1\/2/.test(z.t))); assert.equal(g("dsGeschlossen()"),false);
    vm.runInContext("globalThis.__b={zeilen:[]}",ctx); g("dsAbschluss(__S().jobs[__S().jobs.length-1],[__S().tiere[0]],__b,true)"); assert.equal(S().abmahnungen,2); assert.equal(g("dsGeschlossen()"),true); assert.ok(g("__b.zeilen").some(z=>/HOF GESCHLOSSEN/.test(z.t))); }
  finally{ ctx.Math.random=altR; }
  assert.ok(/Neu anfangen/.test(g("dsGeschlossenHtml()"))); const m=melden(()=>g("tagBeenden()")); assert.equal(g("hlStand().phase"),"tag"); assert.ok(m.some(t=>/geschlossen/.test(t)));
  const m2=melden(()=>g("hlTeamStart('"+j.id+"')")); assert.ok(m2.some(t=>/geschlossen/.test(t))); assert.ok(!j.team); });
test("BERUFE-6 Agentenwerkstatt ab Tag 1: Basis-Tool ohne Forschung, Spezial-Agenten-Tool erst mit Forschung, Führung und Ada-Texte",()=>{
  assert.equal(g("istFrei('gebGeschirr')"),true); assert.equal(g("hofLevel().i"),1); assert.ok(g("HARNESSE.hofgeschirr.basis")); assert.ok(g("HARNESSE['claude-code'].schutz")&&g("HARNESSE['codex-cli'].schutz"));
  const p=g("__add('qwen35-4b')"); const m=melden(()=>g("geschirrAnlegen('"+p.uid+"','hofgeschirr')")); assert.equal(p.geschirr,"hofgeschirr",m.join("|")); assert.ok(g("agentScore(__S().tiere[0])")>=40);
  p.geschirr=null; const m2=melden(()=>g("geschirrAnlegen('"+p.uid+"','opencode')")); assert.equal(p.geschirr,null); assert.ok(m2.some(t=>/erforschen/.test(t)));
  S().forschung.geschirr=true; S().xp=99999; melden(()=>g("geschirrAnlegen('"+p.uid+"','opencode')")); assert.equal(p.geschirr,"opencode");
  for(const id of ["start_geschirr","start_geschirr_fertig","team_agenten","datenschutz","abmahnung"]) assert.ok(g("ADA_TEXTE['"+id+"']")&&g("ADA_TEXTE['"+id+"'].t").length>100,id);
  const W=g("WOCHE"); assert.equal(W[0].aufgaben.length,6); assert.ok(W[0].aufgaben.some(a=>/Agenten-Tool/.test(a[0]))); assert.ok(/Ada empfiehlt/.test(g("dsSattlereiHtml(__S().tiere,Object.entries(HARNESSE))"))); });
test("BERUFE-7 Morgen: ein Katalog-Zettel, mit Nadel im Stall ein zweiter passend zu den Stärken",()=>{
  g("__add('qwen35-4b',0,'hofgeschirr')"); const n=S().jobs.length; vm.runInContext("globalThis.__b={zeilen:[]}",ctx); const neu=g("zsBerufZettelMorgen(__b)"); assert.equal(neu.length,1); assert.equal(S().jobs.length,n+1); assert.ok(neu[0].beruf);
  S().buchten.push({...S().buchten[0],id:"bpi",rhSlot:"pc:1",gpu:"pi5",tier:null,ramGB:8}); const nadel=g("neuesTier('needle2')"); S().tiere.push(nadel); nadel.bucht="bpi"; S().buchten.find(b=>b.id==="bpi").tier=nadel.uid;
  vm.runInContext("globalThis.__b={zeilen:[]}",ctx); const neu2=g("zsBerufZettelMorgen(__b)"); assert.equal(neu2.length,2); assert.ok(g("__b.zeilen").some(z=>/Nadel/.test(z.t))); });
test("BERUFE-8 Hofbuch nennt Berufe, Teams und Datenschutz mit Zahlen",()=>{ const h=g("hofbuchHtml()"); assert.ok(/Berufe-Katalog/.test(h)&&/Agenten-Teams/.test(h)&&/Abmahnung/.test(h)&&/Agenten-Tool mit Schutzfunktionen/.test(h)&&/Basis-Tool/.test(h)); });


/* ── Fachbildung ── */
test("FACH-1 Kurs kostet Geld, Kuratiertes und Tage, das Modell fällt aus, danach steigt das Fachwissen; Stufen bauen aufeinander auf",()=>{
  const p=g("__add('qwen35-4b')"); S().daten.kuratiert=20; const k=S().kredit; const kk=g("fachKursKosten(__S().tiere[0],'grund','kurs','recht')"); assert.ok(kk.preis>=150&&kk.tage===1&&kk.gb===3,JSON.stringify(kk));
  let m=melden(()=>g("fachSchulungStart('"+p.uid+"','recht','zertifikat')")); assert.equal(p.status,"frei",m.join("|")); assert.ok(m.some(t=>/nicht offen/.test(t)));
  m=melden(()=>g("fachSchulungStart('"+p.uid+"','recht','grund')")); assert.equal(p.status,"schulung",m.join("|")); assert.equal(S().kredit,k-kk.preis); assert.equal(S().daten.kuratiert,17); assert.equal(p.rest,1);
  assert.ok(!g("hlNachtFrei(__S().tiere[0])")); assert.ok(melden(()=>g("fachSchulungStart('"+p.uid+"','recht','grund')")).some(t=>/beschäftigt/.test(t)));
  vm.runInContext("globalThis.__b={zeilen:[]}",ctx); g("fachSchulungTag(__S().tiere[0],__b)"); assert.equal(p.status,"frei"); assert.equal(g("fachWert(__S().tiere[0],'recht')"),25); assert.ok(g("__b.zeilen").some(z=>/Fachwissen 25\/100/.test(z.t)));
  assert.equal(JSON.stringify(g("fachKurseOffen(__S().tiere[0],'recht').map(k=>k.id)")),JSON.stringify(["aufbau"]));
  g("fachSchulungStart('"+p.uid+"','recht','aufbau')"); assert.equal(p.rest,2); g("fachSchulungTag(__S().tiere[0],null)"); assert.equal(p.status,"schulung"); g("fachSchulungTag(__S().tiere[0],null)"); assert.equal(g("fachWert(__S().tiere[0],'recht')"),47);
  assert.equal(JSON.stringify(g("fachKurseOffen(__S().tiere[0],'recht').map(k=>k.id)")),JSON.stringify(["zertifikat"])); assert.equal(S().statistik.schulungen,2); });
test("FACH-2 Zettel aus sensiblen Sektoren verlangen Fachwissen – gesperrt ohne, Bonus mit Überschuss",()=>{
  S().xp=99999; const p=g("__add('qwen35-4b',0,'hofgeschirr')"); g("__risikoJob()"); const J="__S().jobs[__S().jobs.length-1]"; const fa=g("fachAnforderung("+J+")"); assert.ok(fa&&fa.gebiet&&fa.min>=30,JSON.stringify(fa));
  let c=g("jobCheck(__S().tiere[0],"+J+")"); assert.equal(c.ok,false); assert.ok(c.gruende.some(x=>/Fachwissen .* zu niedrig/.test(x)),JSON.stringify(c.gruende));
  p.fach={}; p.fach[fa.gebiet]=fa.min+30; c=g("jobCheck(__S().tiere[0],"+J+")"); assert.ok(!c.gruende.some(x=>/Fachwissen/.test(x)),JSON.stringify(c.gruende)); assert.ok(c.boni.some(x=>/Fachwissen .*\(\+6\)/.test(x)),JSON.stringify(c.boni));
  assert.equal(g("fachMinFuer(2,1,1)"),38); assert.equal(g("fachMinFuer(2,1,61)"),48); assert.equal(g("fachMinFuer(1,0,200)"),38,"Drift gedeckelt +20"); });
test("FACH-3 Praxis: saubere Zettel im Gebiet bringen +3 bis 85; Lohnaufschlag macht Kurse nach wenigen Zetteln bezahlt",()=>{
  const p=g("__add('qwen35-4b')"); g("__risikoJob()"); const J="__S().jobs[__S().jobs.length-1]"; const j=S().jobs[S().jobs.length-1]; p.fach={datenschutz:95}; p.fach[j.gebiet||"recht"]=84;
  const altR=ctx.Math.random; ctx.Math.random=()=>0.99; try{ g("dsAbschluss("+J+",[__S().tiere[0]],null,true)"); }finally{ ctx.Math.random=altR; } assert.equal(g("fachWert(__S().tiere[0],'"+(j.gebiet||"recht")+"')"),85);
  S().xp=99999; let teuer=null,normal=null; for(let i=0;i<120&&!(teuer&&normal);i++){ const x=g("zsBerufZettel({tier:2})"); if(x.risiko>=2&&x.fachMin&&!teuer) teuer=x; if(x.risiko===0&&x.teamMax<=1&&!normal) normal=x; }
  assert.ok(teuer&&normal,"Zettel gefunden: "+!!teuer+"/"+!!normal); const B=g("BERUF_BASIS")[2]; assert.ok(teuer.lohnBasis>=B.lohn*0.5*1.35*1.2,"Aufschlag "+teuer.lohnBasis);
  const kurse=g("fachKursKosten(__S().tiere[0],'grund','kurs','recht').preis+fachKursKosten(__S().tiere[0],'aufbau','kurs','recht').preis"); const praemie=teuer.lohnBasis-teuer.lohnBasis/(1.35*(1+0.008*teuer.fachMin)); assert.ok(kurse<=4*praemie+100,"Kurse "+kurse+" vs Prämie je Zettel "+Math.round(praemie)); });
test("FACH-4 Hofbuch und Agentenwerkstatt nennen die Kurse; Hofsprecher plant einen Kurs",()=>{
  const h=g("hofbuchHtml()"); assert.ok(/Fachbildung/.test(h)&&/Grundkurs 1 Tag, 150 €, 3 GB/.test(h)&&/Fachzertifikat/.test(h)); const p=g("__add('qwen35-4b')"); S().daten.kuratiert=20;
  assert.ok(/Schulung wählen/.test(g("dsSattlereiHtml(__S().tiere,Object.entries(HARNESSE))"))); let plan=g("hsParsen('schule "+p.uid+" in recht grund mit lora')"); assert.equal(plan.werkzeug,"schulung"); assert.equal(plan.args.gebiet,"recht"); assert.equal(plan.args.kurs,"grund"); assert.equal(plan.args.technik,"lora");
  let pr=g("hsPlanPruefen("+JSON.stringify(plan)+")"); assert.equal(pr.ok,false); assert.ok(/erforscht/.test(pr.grund),JSON.stringify(pr));
  S().forschung.sft=true; S().forschung.lora=true; pr=g("hsPlanPruefen("+JSON.stringify(plan)+")"); assert.equal(pr.ok,true,JSON.stringify(pr)); plan={...plan,args:pr.args};
  const v=g("hsVorschauText("+JSON.stringify(plan)+")"); assert.ok(/Grundkurs Recht mit LoRA/.test(v)&&/1 Tag/.test(v),v); g("hsAusfuehren("+JSON.stringify(plan)+")"); assert.equal(p.status,"schulung"); assert.equal(p.schulung.technik,"lora");
  assert.ok(/DPO .*nur Datenschutz/.test(h),"DPO-Grenze fehlt im Hofbuch"); });

/* ── Spieltest v9.8 ── */
test("DS-EINS Nur ein Datenschutz-System: ein verspäteter Zettel mit Datenschutzpflicht löst höchstens EINE Abmahnung aus, das alte DSGVO-Leck feuert nicht mehr",()=>{
  const p=g("__add('qwen35-4b')"); g("__risikoJob()"); const j=S().jobs[S().jobs.length-1]; j.vereinbart=200; j.team={wahl:{0:p.uid},mtokGesamt:1,mtokRest:0.5,rest:0,frist:1,seg:[]}; p.status="job"; p.job=j.id;
  const alt=ctx.Math.random; ctx.Math.random=()=>0.0; const vorher=S().abmahnungen||0; let zeilen=[];
  try{ vm.runInContext("globalThis.__b={zeilen:[]}",ctx); g("(function(){ const c=hlTeamCheck(__S().jobs[__S().jobs.length-1],__S().jobs[__S().jobs.length-1].team.wahl); hlTeamAbschluss(__S().jobs[__S().jobs.length-1],c,[__S().tiere[0]],__b,true); })()"); zeilen=g("__b.zeilen").map(z=>z.t); }finally{ ctx.Math.random=alt; }
  const abm=(S().abmahnungen||0)-vorher; assert.ok(abm<=1,"Abmahnungen aus einem Vorfall: "+abm+" · "+zeilen.join("|")); assert.ok(!zeilen.some(z=>/DSGVO-Leck/.test(z)),zeilen.join("|"));
  assert.ok(/siehe Datenschutz/.test(g("hofbuchHtml()"))); });
test("DS-VERWARNUNG Der erste Verstoß eines jungen Hofes ist eine Verwarnung (Strafe bleibt, Zähler nicht), danach zählt jede Beanstandung",()=>{
  const p=g("__add('qwen35-4b')"); assert.ok(g("dsVerwarnungOffen()"),"junger Hof ohne Kurs");
  let m=melden(()=>g("dsAbmahnung('Testverstoß',null)")); assert.equal(S().abmahnungen||0,0,m.join("|")); assert.ok(m.some(t=>/VERWARNUNG/.test(t)&&/Agentenwerkstatt/.test(t)),m.join("|"));
  assert.ok(!g("dsVerwarnungOffen()"),"nur einmal je Hof");
  m=melden(()=>g("dsAbmahnung('Zweiter Verstoß',null)")); assert.equal(S().abmahnungen,1,m.join("|")); assert.ok(m.some(t=>/ABMAHNUNG 1\/2/.test(t)),m.join("|"));
  m=melden(()=>g("dsAbmahnung('Dritter Verstoß',null)")); assert.equal(S().abmahnungen,2); assert.ok(g("dsGeschlossen()"),"nach der zweiten Abmahnung ist der Hof zu");
  p.fach={datenschutz:25}; S().dsVerwarnung=null; S().abmahnungen=0; S().geschlossen=null; assert.ok(!g("dsVerwarnungOffen()"),"mit Datenschutz-Kurs keine Schonung"); });
test("DS-QUELLE Der Chip nennt die Herkunft des Risikos, das Hofbuch erklärt sie",()=>{
  g("__risikoJob()"); const J="__S().jobs[__S().jobs.length-1]"; const q=g("dsRisikoQuelle("+J+")"); assert.ok(q&&q.length>3,q);
  assert.ok(g("dsChip("+J+")").includes(q),g("dsChip("+J+")"));
  const k=g("Object.keys(KUNDEN).find(k=>KUNDEN[k].lokalPflicht)"); const j2={id:"jx",art:"text",kunde:k,tage:1,puffer:1};
  assert.equal(g("dsRisikoQuelle("+JSON.stringify(j2)+")"),"Kunde verarbeitet nur vor Ort"); assert.equal(g("dsRisiko("+JSON.stringify(j2)+")"),1);
  const h=g("hofbuchHtml()"); assert.ok(/Woher das Risiko kommt/.test(h)&&/Verwarnung/.test(h)); });
test("DS-KUNDE Ein Kunde aus einem Risiko-Sektor färbt jeden seiner Zettel: gleiche Stufe, Vor-Ort-Pflicht, Quelle im Chip",()=>{
  S().xp=99999; let j=null; for(let i=0;i<200&&!j;i++){ const x=g("zsBerufZettel({})"); if(x&&x.risiko===2&&x.kunde) j=x; }
  assert.ok(j,"kein Zettel mit hohem Risiko erzeugt"); assert.ok(j.dsgvo,"hohes Risiko muss die Vor-Ort-Pflicht tragen");
  const K=g("KUNDEN['"+j.kunde+"']"); assert.ok(K&&K.sektor,"der Kunde kennt seinen Sektor");
  const klein={id:"jklein",art:"text",tier:0,mikro:true,kunde:j.kunde,tage:1,puffer:1};
  assert.equal(g("dsRisiko("+JSON.stringify(klein)+")"),2,"auch der kleine Zettel desselben Kunden ist hoch");
  assert.ok(/Kunde aus |Fachgebiet |Sektor /.test(g("dsRisikoQuelle("+JSON.stringify(klein)+")")));
  assert.ok(g("dsJobNachruesten("+JSON.stringify(klein)+").dsgvo"),"Nachrüsten setzt die Vor-Ort-Pflicht"); });
console.log(bestanden+"/"+gesamt+" bestanden"+(fehl.length?" · FEHLER: "+fehl.join(", "):""));
process.exit(fehl.length?1:0);
