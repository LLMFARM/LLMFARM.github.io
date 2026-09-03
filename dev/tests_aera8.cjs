/* Ära-8-Prüfungen: Zucht 2.0 (Stammbuch, Merkmale, Würfe), Ereignisse, Hardware-Nachfrage, Nacht, Hofziele.
   Lädt die gebaute modellhof_game.html wie tests_v6.cjs in eine Node-VM. Aufruf: node dev/tests_aera8.cjs */
const fs=require("fs"), path=require("path"), vm=require("vm");
const html=fs.readFileSync(path.join(__dirname,"..","modellhof_game.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const source=script.slice(0,script.indexOf("/* Boot-Sequenz */"));
function el(){ return {innerHTML:"",textContent:"",value:"",style:{setProperty(){},width:""},dataset:{},
  classList:{add(){},remove(){},contains:()=>false},appendChild(){},remove(){},before(){},
  querySelector:()=>el(),querySelectorAll:()=>[],onclick:null,onanimationend:null,addEventListener(){},scrollTop:0,offsetWidth:0}; }
const ctx={console,Math,JSON,Date,Object,Array,Number,String,Boolean,RegExp,Map,Set,isNaN,parseInt,parseFloat,
  setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame(){},performance:{now:()=>0},
  document:{getElementById:()=>el(),createElement:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},visibilityState:"visible"},
  window:{}, localStorage:{getItem:()=>null,setItem(){},removeItem(){}},
  confirm:()=>true, prompt:()=>null, alert(){}, btoa:s=>Buffer.from(s,"binary").toString("base64"),
  atob:s=>Buffer.from(s,"base64").toString("binary"), navigator:{}, location:{reload(){}},
  URL:{createObjectURL:()=>"",revokeObjectURL(){}}, Blob:function(){}, Image:function(){ this.onload=null; }};
ctx.globalThis=ctx; ctx.self=ctx;
vm.createContext(ctx);
vm.runInContext(source,ctx,{timeout:30000});
vm.runInContext(`Object.assign(globalThis,{MODELLE,TECHNIKEN,GPUS,FUTTER,WERTE,ZUCHT,QUESTS,LEVELS,FORSCHUNG,KUNDEN,MERKMALE,ZUCHT_REGELN,
  EREIGNISSE:(typeof EREIGNISSE!=="undefined")?EREIGNISSE:[], HL_NACHT:(typeof HL_NACHT!=="undefined")?HL_NACHT:{},
  MINI_SPIELE:(typeof MINI_SPIELE!=="undefined")?MINI_SPIELE:[], HL_AUFTRAEGE:(typeof HL_AUFTRAEGE!=="undefined")?HL_AUFTRAEGE:[], SPERRZONEN:(typeof SPERRZONEN!=="undefined")?SPERRZONEN:[], RH_WIND:(typeof RH_WIND!=="undefined")?RH_WIND:[], RH_STROM:(typeof RH_STROM!=="undefined")?RH_STROM:{}, GPUS});
globalThis.__frisch=function(){ S=frischerStand(); S.einfFertig=true; S.forschung.merge=true; return S; };   /* v9.9 (R2): Zucht verlangt jetzt auch im Spiel das Zuchtbuch */
globalThis.__S=function(){ return S; };
globalThis.__zucht=function(m,ids){ zuchtMethode=m; zuchtWahl.length=0; ids.forEach(x=>zuchtWahl.push(x)); };
globalThis.__miniAkt=function(){ return (typeof miniAkt!=="undefined")?miniAkt:null; };`,ctx);
["alles","wieseNeu","schilderNeu","kopfNeu","tickerNeu","tickerLauf","zeigeBericht","zeigeJobs","zeigeMarkt","zeigeStall","zeigeFutter",
 "zeigeTier","zeigeCloud","zeigeArena","zeigeAgentenWelt","blattAuf","blattZu","blattLive","melde","uhrAnzeige","maskenCss","figurDeko",
 "questPruefe","feier","adaAuto","adaZeig","rhAussenNeu","rhHintergrundNeu","hlLeiste","dockNeu","zieleNeu"].forEach(f=>{ ctx[f]=()=>{}; });
/* deterministischer Zufall: mulberry32, pro Test neu setzbar */
function mulberry(a){ return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
ctx.Math=Object.create(Math); let rnd=mulberry(7); ctx.Math.random=()=>rnd();
function saat(n){ rnd=mulberry(n); }
const erg=[]; let fail=0;
function test(id,txt,fn){ try{ const r=fn(); if(r===true){erg.push("PASS  "+id+" – "+txt);} else {fail++; erg.push("FAIL  "+id+" – "+txt+" :: "+r);} }
  catch(e){ fail++; erg.push("ERROR "+id+" – "+txt+" :: "+(e.stack||e.message).split("\n").slice(0,3).join(" ⏎ ")); } }
let S=null; function frisch(){ S=ctx.__frisch(); S.tag=10; S.xp=2000; S.kredit=5000; S.forschung=S.forschung||{}; return S; }
function frei(id){ S.forschungFertig=S.forschungFertig||{}; if(Array.isArray(S.forschungen)) { if(!S.forschungen.includes(id)) S.forschungen.push(id); } }
function elternPaar(){ const a=ctx.neuesTier("qwen35-4b"), b=ctx.neuesTier("qwen35-4b"); a.merkmale=[]; b.merkmale=[]; a.optik=[]; b.optik=[]; S.tiere.push(a,b); return [a,b]; }

/* ── Merkmale ─────────────────────────────────────────────────────── */
test("MERK-1","Katalog: 24 Merkmale, jedes mit Name, Wirkung, Vererbung; Schmuck mit Quote",()=>{
  const M=ctx.MERKMALE, ids=Object.keys(M); if(ids.length!==24) return "n="+ids.length;
  for(const k of ids){ const m=M[k]; if(!m.n||!m.wirk||typeof m.erb!=="number") return k+" unvollständig"; if(m.art==="optik"&&!(m.quote>0)) return k+" ohne Quote"; }
  return true; });
test("MERK-2","Fleißig: Durchsatz +4 %, Zappelig −2 %",()=>{ frisch(); const [a]=elternPaar(); const b=S.buchten[0]; a.bucht=b.id; b.tier=a.uid;
  const basis=ctx.mtokTagKapazitaet(a); a.merkmale=["fleissig"]; const f=ctx.mtokTagKapazitaet(a); a.merkmale=["zappelig"]; const z=ctx.mtokTagKapazitaet(a);
  return (Math.abs(f/basis-1.04)<0.02&&Math.abs(z/basis-0.98)<0.02)?true:basis+"/"+f+"/"+z; });
test("MERK-3","Kompakt: VRAM −5 %",()=>{ frisch(); const [a]=elternPaar(); const v0=ctx.vramPig(a); a.merkmale=["kompakt"]; const v1=ctx.vramPig(a); return Math.abs(v1/v0-0.95)<0.01?true:v0+"→"+v1; });
test("MERK-4","Robust: alle Krankheitsrisiken ×0,7",()=>{ frisch(); const [a]=elternPaar(); S.tag=9; a.temp="kreativ"; a.zustand=20; a.status="job";
  const r0=ctx.krankRisiken(a).map(x=>x.p); a.merkmale=["robust"]; const r1=ctx.krankRisiken(a).map(x=>x.p);
  if(!r0.length) return "keine Risiken erzeugt"; return r0.every((p,i)=>Math.abs(r1[i]-Math.round(p*0.7*1000)/1000)<1e-6)?true:r0+" vs "+r1; });
test("MERK-5","Sparsam: rhPeak −10 %",()=>{ frisch(); const [a]=elternPaar(); const b=S.buchten[0]; b.tier=a.uid; a.bucht=b.id; const p0=ctx.rhPeak(b); a.merkmale=["sparsam"]; const p1=ctx.rhPeak(b); return Math.abs(p1/p0-0.9)<1e-6?true:p0+"→"+p1; });
test("MERK-6","Kauf würfelt Merkmale (20 %) – über 400 Käufe zwischen 12 % und 30 %",()=>{ frisch(); saat(3); let n=0; for(let i=0;i<400;i++){ const p=ctx.neuesTier("qwen35-4b"); ctx.zuchtKaufMerkmale(p); if(p.merkmale.length) n++; }
  return (n>=48&&n<=120)?true:"n="+n; });
test("MERK-7","Prägung: nach 20 sauberen Aufträgen einmalig 15 %",()=>{ frisch(); saat(11); const [a]=elternPaar(); let neu=0; for(let i=0;i<19;i++){ if(ctx.zuchtPraegung(a,{zeilen:[]})) neu++; }
  if(neu||a.gepraegt) return "zu früh"; const r=ctx.zuchtPraegung(a,{zeilen:[]}); if(!a.gepraegt) return "nicht markiert"; const r2=ctx.zuchtPraegung(a,{zeilen:[]}); return r2===null?true:"zweite Prägung"; });

/* ── Zucht: Wurf, Stammbaum, Regeln ───────────────────────────────── */
function zuchtLauf(m){ const [a,b]=elternPaar(); ctx.__zucht(m||"slerp",[a.uid,b.uid]); S.kredit=5000; ctx.zuchtStart(); const bericht={zeilen:[]}; const ma=a._mergeAuftrag; if(!ma) return {a,b,kinder:[]};
  delete a._mergeAuftrag; a.status="frei"; b.status="frei"; const kinder=ctx.zuchtWurfAufloesen(ma,bericht); return {a,b,kinder,bericht}; }
test("WURF-1","Wurfgröße 1–3 mit 55/33/12 % (2 000 Würfe, ±4 Punkte)",()=>{ saat(5); const n=[0,0,0]; for(let i=0;i<2000;i++) n[ctx.wurfGroesse()-1]++;
  const p=n.map(x=>x/20); return (Math.abs(p[0]-55)<4&&Math.abs(p[1]-33)<4&&Math.abs(p[2]-12)<4)?true:p.join("/"); });
test("WURF-2","Ein Wurf legt Kinder mit Eltern-UIDs, Geschwistern und Generation an",()=>{ frisch(); saat(21); const r=zuchtLauf("slerp");
  if(!r.kinder.length) return "kein Kind"; const k=r.kinder[0]; if(!k.eltern||!k.eltern.uids||k.eltern.uids.length!==2) return "keine Eltern-UIDs"; if(k.gen!==1) return "gen="+k.gen;
  if(!k.wurf||k.wurf.geschwister.length!==r.kinder.length-1) return "Geschwister falsch"; for(const w in k.w) if(!Number.isInteger(k.w[w])) return "Wert nicht ganzzahlig: "+w+"="+k.w[w];
  return true; });
test("WURF-3","Eltern brauchen 3 Tage Erholung; zweiter Wurf wird abgelehnt",()=>{ frisch(); saat(4); const r=zuchtLauf("slerp"); if(!r.kinder.length) return "kein Kind";
  if(r.a.zuchtRuhe!==S.tag+3) return "zuchtRuhe="+r.a.zuchtRuhe; ctx.__zucht("slerp",[r.a.uid,r.b.uid]); S.kredit=5000; ctx.zuchtStart(); return r.a._mergeAuftrag?"trotz Erholung gestartet":true; });
test("WURF-4","Wertverfall: elternPreis des Kindes = 0,8 × Katalogpreis",()=>{ frisch(); saat(9); const r=zuchtLauf("slerp"); const k=r.kinder[0]; const soll=Math.round(ctx.MODELLE["qwen35-4b"].preis*0.8);
  return k.elternPreis===soll?true:k.elternPreis+" statt "+soll; });
test("WURF-5","Stammbaum: Kind kennt Eltern, Eltern kennen Kinder, Geschwister erkannt",()=>{ frisch(); saat(31); const r=zuchtLauf("slerp"); const k=r.kinder[0]; const sb=ctx.stammbaum(k);
  if(sb.eltern.length!==2||!sb.eltern.includes(r.a)) return "Eltern fehlen"; const sbA=ctx.stammbaum(r.a); if(!sbA.kinder.includes(k)) return "Kind fehlt beim Elternteil"; return true; });
test("WURF-6","Inzucht: Eltern × Kind erhöht Interferenz um 20 Punkte, Emergenz −8",()=>{ frisch(); saat(2); const r=zuchtLauf("slerp"); const k=r.kinder[0];
  const m=ctx.zuchtModifikatoren([r.a,k],"slerp"); return (m.inzucht&&Math.abs(m.interferenz-0.36)<1e-9&&Math.abs(m.emergenz-0.06)<1e-9)?true:JSON.stringify(m); });
test("WURF-7","TIES-Spezialistenbonus nur bei verschiedenen Topwerten",()=>{ frisch(); const [a,b]=elternPaar(); const keys=Object.keys(ctx.WERTE); a.w[keys[0]]=90; b.w[keys[1]]=90; b.w[keys[0]]=10;
  const m=ctx.zuchtModifikatoren([a,b],"ties"); if(m.boni[keys[0]]!==3||m.boni[keys[1]]!==3) return "kein Bonus: "+JSON.stringify(m.boni); b.w[keys[0]]=95; b.w[keys[1]]=10;
  const m2=ctx.zuchtModifikatoren([a,b],"ties"); return Object.keys(m2.boni).length===0?true:"Bonus trotz gleichem Topwert"; });
test("WURF-8","Linienbonus: zwei G1-Zuchttiere → +1 auf den Linien-Topwert",()=>{ frisch(); saat(13); const r1=zuchtLauf("slerp"); const r2=zuchtLauf("slerp"); const k1=r1.kinder[0], k2=r2.kinder[0];
  const m=ctx.zuchtModifikatoren([k1,k2],"slerp"); const b=Object.values(m.boni); return (b.length===1&&b[0]===1)?true:JSON.stringify(m.boni); });
test("WURF-9","Zusatzkinder kosten +30 % je Kind (Buchung beim Wurf)",()=>{ frisch(); saat(1); let r=null; for(let i=0;i<40&&!(r&&r.kinder.length>=2);i++){ r=zuchtLauf("slerp"); }
  if(!r||r.kinder.length<2) return "kein Mehrling in 40 Versuchen"; const m=ctx.ZUCHT.slerp; const basis=m.kredit+Math.round(r.a.pT*8); const zusatz=Math.round(basis*0.3*(r.kinder.length-1));
  const j=(S.journal||[]).find(x=>/Wurf-Nachbereitung/.test(x.t||x.text||"")); return j?((Math.abs(j.betrag||j.b||0)===zusatz)?true:"Betrag "+(j.betrag||j.b)+" statt "+zusatz):"keine Buchung"; });
test("WURF-10","Hofbuch-Kapitel Zucht wird aus den Konstanten gerendert",()=>{ const h=ctx.zuchtHofbuchHtml(); return (/Wurf/.test(h)&&/Inzucht/.test(h)&&/Shiny/.test(h)&&/55 %/.test(h))?true:"Kapitel unvollständig"; });


/* ── Ereignisse ───────────────────────────────────────────────────── */
function jobMitTeam(){ const [a]=elternPaar(); const b=S.buchten[0]; a.bucht=b.id; b.tier=a.uid; a.status="job";
  const j={id:"jX",t:"Testzettel",art:"text",kunde:Object.keys(ctx.KUNDEN)[0],groesse:"L",tier:1,tage:2,puffer:1,vereinbart:400,mtok:14,mtokTag:7,frisch:S.tag,rollen:[{n:"A",anf:{}}],anf:{},einheiten:24,einheit:"Pakete",lohnBasis:400,
    team:{wahl:{0:a.uid},mtokGesamt:14,mtokRest:0,seg:[{anteil:1,erfolg:95,mtok:14}],frist:S.tag+2,zusageQuote:0.9}};
  a.job=j.id; S.jobs.push(j); return {a,j}; }
test("EV-1","Kunde begeistert: 🟡-Zusage + Qualität ≥ 90 % → +25 % Lohn, +1 ⭐, Ruf +2 (Würfel 0)",()=>{ frisch(); const {a,j}=jobMitTeam(); const er={lohn:400,ok:24,einheiten:24}; const k=ctx.kundeVon(j.kunde); k.sterne=3; const ruf=S.rufBonus||0;
  ctx.Math.random=()=>0.0; const z=ctx.ereignisAbschluss(j,er,[a],{zeilen:[]},true,95,j.team); ctx.Math.random=()=>rnd();
  return (er.lohn===500&&k.sterne===4&&(S.rufBonus||0)===ruf+2&&z.some(x=>/begeistert/.test(x.t)))?true:JSON.stringify({lohn:er.lohn,sterne:k.sterne,z:z.map(x=>x.t)}); });
test("EV-2","Keine Begeisterung ohne Mut (🟢-Zusage, Quote 0,5)",()=>{ frisch(); const {a,j}=jobMitTeam(); j.team.zusageQuote=0.5; const er={lohn:400}; ctx.Math.random=()=>0.0; const z=ctx.ereignisAbschluss(j,er,[a],{zeilen:[]},true,95,j.team); ctx.Math.random=()=>rnd();
  return z.some(x=>/begeistert/.test(x.t))?"Begeisterung ohne Risiko":true; });
test("EV-3","Folgeauftrag: Großauftrag sauber → neuer L-Zettel mit Puffer +1 (Würfel 0)",()=>{ frisch(); const {a,j}=jobMitTeam(); j.team.zusageQuote=0; const n=S.jobs.length; ctx.Math.random=()=>0.0; ctx.ereignisAbschluss(j,{lohn:400},[a],{zeilen:[]},true,80,j.team); ctx.Math.random=()=>rnd();
  const nj=S.jobs[S.jobs.length-1]; return (S.jobs.length===n+1&&nj.folge&&nj.puffer===2&&nj.groesse==="L")?true:JSON.stringify({n:S.jobs.length-n,puffer:nj&&nj.puffer}); });
test("EV-4","Kein zweites altes DSGVO-Leck neben dem zentralen Datenschutz-/Abmahnungssystem",()=>{ frisch(); const {a,j}=jobMitTeam(); const kid=Object.keys(ctx.KUNDEN).find(id=>ctx.KUNDEN[id].lokalPflicht); j.kunde=kid; const kasse=S.kredit; const ruf=S.rufBonus||0;
  ctx.Math.random=()=>0.0; ctx.ereignisAbschluss(j,{lohn:200},[a],{zeilen:[]},false,60,j.team); ctx.Math.random=()=>rnd();
  const k=ctx.kundeVon(kid); return (S.kredit===kasse&&(S.rufBonus||0)===ruf&&(k.groll||0)===0)?true:JSON.stringify({d:S.kredit-kasse,ruf:(S.rufBonus||0)-ruf,groll:k.groll}); });
test("EV-5","Hacker erscheint nur ab Tag 6, bei Kunden mit ≥ 3 Aufträgen, 6 % je Nacht",()=>{ frisch(); S.tag=5; const kid=Object.keys(ctx.KUNDEN)[0]; ctx.kundeVon(kid).auftraege=3; ctx.Math.random=()=>0.0;
  let e=ctx.hackerSpawn({zeilen:[]}); if(e) return "vor Tag 6 erschienen"; S.tag=6; e=ctx.hackerSpawn({zeilen:[]}); ctx.Math.random=()=>rnd(); return (e&&e.kunde===kid&&ctx.hackerOffen()===e)?true:"kein Angriff an Tag 6"; });
test("EV-6","Vier gewinnt: der Hacker blockt einen Dreier des Spielers",()=>{ frisch(); S.tag=8; ctx.kundeVon(Object.keys(ctx.KUNDEN)[0]).auftraege=3; ctx.Math.random=()=>0.0; ctx.hackerSpawn({zeilen:[]}); ctx.Math.random=()=>rnd();
  ctx.miniStart("mini_hacker"); const a=ctx.__miniAkt(); if(!a||a.id!=="mini_hacker") return "keine Runde"; a.brett[5][0]=1; a.brett[5][1]=1; a.brett[5][2]=1; a.zug=3;
  const s=ctx.miniVierZugComputer(a); return s===3?true:"Computer zog Spalte "+s; });
test("EV-7","Sieg: Prämie 80 + 20·Stufe, Kunde +1 ⭐, Ruf +4, Schutz heute; Ereignis erledigt",()=>{ frisch(); S.tag=8; const kid=Object.keys(ctx.KUNDEN)[0]; const k=ctx.kundeVon(kid); k.auftraege=3; k.sterne=3; ctx.Math.random=()=>0.0; ctx.hackerSpawn({zeilen:[]}); ctx.Math.random=()=>rnd();
  const kasse=S.kredit, ruf=S.rufBonus||0, st=ctx.hofLevel().i; ctx.hackerErgebnis("sieg",true);
  return (S.kredit===kasse+80+20*st&&k.sterne===4&&(S.rufBonus||0)===ruf+4&&S.mini.hackerSchutzTag===8&&!ctx.hackerOffen())?true:JSON.stringify({d:S.kredit-kasse,sterne:k.sterne}); });
test("EV-8","Nicht gespielt bis Tagesende = Niederlage: Groll 4, −2 ⭐, 40 €",()=>{ frisch(); S.tag=8; const kid=Object.keys(ctx.KUNDEN)[0]; const k=ctx.kundeVon(kid); k.auftraege=3; k.sterne=4; ctx.Math.random=()=>0.0; ctx.hackerSpawn({zeilen:[]}); ctx.Math.random=()=>rnd();
  const kasse=S.kredit; const b={zeilen:[]}; ctx.hackerTagesende(b); return (k.groll===4&&k.sterne===2&&S.kredit===kasse-40&&b.zeilen.length===1)?true:JSON.stringify({groll:k.groll,sterne:k.sterne,d:S.kredit-kasse}); });
test("EV-9","Landesförderung: Forschungskosten ×0,75",()=>{ frisch(); S.events=[{id:"foerderprogramm",effekt:{typ:"forschung",wert:-0.25,tage:5}}]; const f=ctx.FORSCHUNG.sft; return ctx.forschungsKosten(f)===Math.round(f.kosten*0.75)?true:ctx.forschungsKosten(f); });
test("EV-10","Ereignis-Bilanz: mindestens 10 gute Hof-Ereignisse; Hofbuch nennt Prämien und Hacker",()=>{ const gut=ctx.EREIGNISSE.filter(e=>e.art==="gut").length; const h=ctx.ereignisHofbuchHtml(); return (gut>=10&&/begeistert/.test(h)&&/Hacker/.test(h))?true:"gut="+gut; });


/* ── Nacht 2.0 ────────────────────────────────────────────────────── */
test("NACHT-1","Aktionen schalten mit der Hofstufe frei (Überstunden 5, Destillation 6, Wartung 7)",()=>{ frisch(); S.xp=0; const a1=ctx.hlNachtAktionen().map(x=>x[0]);
  if(a1.includes("ueberstunden")||a1.includes("wartung")||a1.includes("distill")) return "zu früh frei: "+a1.join(",");
  S.xp=1000; const a5=ctx.hlNachtAktionen().map(x=>x[0]); if(!a5.includes("ueberstunden")||a5.includes("wartung")) return "Stufe 5: "+a5.join(",");
  S.xp=3000; const a7=ctx.hlNachtAktionen().map(x=>x[0]); return (a7.includes("wartung")&&a7.includes("distill"))?true:"Stufe 7: "+a7.join(","); });
test("NACHT-2","Überstunden: 4 h Fortschritt am laufenden Auftrag, Zustand −8",()=>{ frisch(); S.xp=1000; saat(3); const [a]=elternPaar(); const b=S.buchten[0]; a.bucht=b.id; b.tier=a.uid; a.status="job"; a.zustand=80;
  const j={id:"jN",t:"Nachtzettel",art:"text",tier:1,tage:2,puffer:1,vereinbart:300,mtok:14,mtokTag:7,frisch:S.tag,rollen:[{n:"A",anf:{}}],anf:{},einheiten:24,lohnBasis:300,team:{wahl:{0:a.uid},mtokGesamt:14,mtokRest:10,seg:[],frist:S.tag+2}};
  a.job=j.id; S.jobs.push(j); const pr=ctx.hlNachtPruefung(a,{art:"ueberstunden"}); if(pr) return "Prüfung: "+pr;
  S.hofloop.nacht=[{uid:a.uid,q:{art:"ueberstunden"},stunden:4}]; const b2={zeilen:[]}; ctx.hlNachtAbrechnen(ctx.rhVorschau(),b2);
  return (j.team.mtokRest<10&&a.zustand===72)?true:JSON.stringify({rest:j.team.mtokRest,zustand:a.zustand,z:b2.zeilen.map(x=>x.t)}); });
test("NACHT-3","Wartung halbiert die Hardware-Wartung der Bucht für 10 Tage",()=>{ frisch(); S.xp=3000; const [a]=elternPaar(); const b=S.buchten[0]; a.bucht=b.id; b.tier=a.uid;
  const pr=ctx.hlNachtPruefung(a,{art:"wartung"}); if(pr) return "Prüfung: "+pr; S.hofloop.nacht=[{uid:a.uid,q:{art:"wartung"},stunden:3}]; ctx.hlNachtAbrechnen(ctx.rhVorschau(),{zeilen:[]});
  return b.wartungBis===S.tag+10?true:"wartungBis="+b.wartungBis; });
test("NACHT-4","Nachtvorlage speichern/laden und „Wie gestern“",()=>{ frisch(); const [a]=elternPaar(); S.hofloop.plan={[a.uid]:{art:"lora",fokus:"code"}}; ctx.hlNachtVorlage("speichern","Test"); S.hofloop.plan={};
  ctx.hlNachtVorlage("laden","Test"); if(!S.hofloop.plan[a.uid]||S.hofloop.plan[a.uid].art!=="lora") return "Vorlage nicht geladen"; S.hofloop.letzterPlan={[a.uid]:{art:"ruhe"}}; ctx.hlNachtVorlage("gestern"); return S.hofloop.plan[a.uid].art==="ruhe"?true:"gestern fehlt"; });

/* ── Hardware-Nachfrage ───────────────────────────────────────────── */
test("HW-1","Großkunden-Zettel existieren (Tier 3–5, parallel) und erscheinen erst ab 25 Mtok/Tag",()=>{ frisch(); const gross=ctx.HL_AUFTRAEGE.filter(v=>v.gross); if(gross.length<5||!gross.every(v=>v.parallel&&v.tier>=3)) return "Katalog: "+gross.length;
  const [a]=elternPaar(); const b=S.buchten[0]; a.bucht=b.id; b.tier=a.uid; S.xp=9000; saat(2); let n=0; for(let i=0;i<60;i++){ const j=ctx.hlJobNeu(4,false); if(j&&j.gross) n++; }
  return n===0?true:"Großkunde trotz kleiner Kapazität ("+n+")"; });
test("HW-2","Nachfrage folgt der Kapazität: kapGesamt wird notiert",()=>{ frisch(); const [a]=elternPaar(); const b=S.buchten[0]; a.bucht=b.id; b.tier=a.uid; S.tag=5; ctx.ausfuehrenTagesWechsel(); return (typeof S.statistik.kapGesamt==="number"&&S.statistik.kapGesamt>0)?true:"kapGesamt="+S.statistik.kapGesamt; });
test("HW-3","Verkauf zahlt 55 % des ganzen Rechners; alte PCs haben einen Aufrüstpfad",()=>{ frisch(); const b={gpu:"rtx3060",rhSlot:"pc:0",ramGB:32,ssdTB:1,tier:null,id:"bx"};
  return (ctx.rhVerkaufsErloes(b)===Math.round(700*0.55)&&ctx.rhPCUpgradeZiel("rtx3060")==="basis"&&ctx.rhPCUpgradeZiel("rtx4090")==="max"&&ctx.rhPCUpgradeZiel("rtx5090")===null)?true:ctx.rhVerkaufsErloes(b); });
test("HW-4","Video-Abgleich: RTX 3090, Strix Halo, DGX Spark, Mac Studio im Katalog; Unified Memory ohne RAM-RAM-Auslagerung",()=>{ const G=ctx.GPUS; for(const k of ["rtx3090","strix","spark","macstudio"]) if(!G[k]) return k+" fehlt";
  if(!G.strix.unified||G.strix.bw>=G.rtx3090.bw) return "Unified falsch"; frisch(); const b={gpu:"strix",rhSlot:"pc:0",ramGB:128,ssdTB:2}; return ctx.ramFrei(null,b)===0?true:"ramFrei="+ctx.ramFrei(null,b); });

/* ── Strom 2.0 ────────────────────────────────────────────────────── */
test("STROM-1","Eigenbonus: 3 Solarmodule + 5 kWh Akku heben die freie Anschlussleistung (max. 50 % des Netzes)",()=>{ frisch(); const r=ctx.rh(); const f0=ctx.rhAnschlussFrei(r); r.pv=[400,400,400]; r.akku=5; const f1=ctx.rhAnschlussFrei(r);
  const soll=Math.min(6*0.5,1.2*0.6+2.5*0.5); return Math.abs((f1-f0)-soll)<0.02?true:f0+"→"+f1+" soll +"+soll; });
test("STROM-2","Grundpreis 0,5 €/kW/Tag steckt in der Tagesabrechnung",()=>{ frisch(); const r=ctx.rh(); const a=ctx.rhSim(r,Array(24).fill(1),1,0.48,{normal:true}); return Math.abs(a.leistungspreis-3)<1e-9&&a.kosten>a.netzKosten+a.wartung-a.einspeise+2.99?true:JSON.stringify({lp:a.leistungspreis,k:a.kosten}); });
test("STROM-3","Rechenzentrum: Grundlast 1,2 kW + 0,06 kW je Schrank",()=>{ frisch(); const r=ctx.rh(); r.stufe=2; r.racks=[0,1,2,3,4]; return Math.abs(ctx.rhGrund()-1.5)<1e-9?true:ctx.rhGrund(); });
test("STROM-4","Anschluss-Meldung nennt Optionen (Nachbar, Solar, Akku, Umbau)",()=>{ frisch(); const t=ctx.rhAnschlussText(3); return (/Nachbarvertrag/.test(t)&&/Solarmodul/.test(t)&&/Akku/.test(t)&&/Nerdtempel/.test(t))?true:t; });
test("STROM-5","Wind auf 1/10-Marktpreis, Brennstoff 0,40 €/kWh, Einspeisung 0,08",()=>{ return (ctx.RH_WIND[2].preis===16500&&Math.abs(ctx.RH_STROM.brennstoff-0.4)<1e-9&&Math.abs(ctx.RH_STROM.einspeise-0.08)<1e-9)?true:JSON.stringify(ctx.RH_STROM); });
test("STROM-6","Strom-Leiste und Hofbuch-Kapitel rendern aus den Konstanten",()=>{ frisch(); const h=ctx.rhStromLeisteHtml(); const b=ctx.rhStromHofbuchHtml(); return (/kW frei/.test(h)&&/Passt noch/.test(h)&&/Grundpreis/.test(b)&&/Eigenbonus/.test(b))?true:"fehlt"; });

/* ── Szene ────────────────────────────────────────────────────────── */
test("SZENE-1","Sperrzone Energiepark liegt rechts (x ≥ 70) und Tiere spawnen links davon",()=>{ const z=ctx.SPERRZONEN[0]; frisch(); saat(9); let maxX=0; for(let i=0;i<50;i++){ const p=ctx.neuesTier("qwen35-4b"); maxX=Math.max(maxX,p.x); }
  return (z.x-z.rx>=70&&maxX<=70)?true:JSON.stringify({z,maxX}); });

/* ── Hofziele ─────────────────────────────────────────────────────── */
test("ZIEL-1","50 Hofziele in sechs Kapiteln, jedes mit Hilfe, Prämie, XP und prüfbarem Check",()=>{ const Q=ctx.QUESTS.filter(q=>/^q\d\d$/.test(q.id)); if(Q.length!==50) return "n="+Q.length;
  const kap=new Set(Q.map(q=>q.kap)); if(kap.size!==6) return "Kapitel: "+[...kap].join(","); for(const q of Q) if(!q.hilfe||!(q.pr>0)||!(q.xp>0)||!q.check) return q.id+" unvollständig"; return true; });
test("ZIEL-2","Jeder Flag-Check hat einen Auslöser im Code (questHook / miniQuest)",()=>{ const Q=ctx.QUESTS.filter(q=>/^q\d\d$/.test(q.id)); const zahl=["level","kredit","ruf","schweine","jobs_fertig","forschungen","tage","rhstufe","buchten","geselle","kap","merkmale","gen"];
  const zustand=["kauf_modell","zuweisung","kauf_gpu","geschirr_an","cloud_lizenz","futter_kauf"]; const fehlt=[];
  for(const q of Q){ const [k,v]=q.check.split(":"); if(zahl.includes(k)||zustand.includes(k)) continue;
    const muster=v?[`questHook("${k}","${v}")`,`questHook('${k}','${v}')`,`questHook("${k}",typ)`,`questHook("${k}",q.id)`,`questHook("${k}",String(`,`questHook('${k}',q.art)`,`questHook('${k}','${v}')`]:[`questHook("${k}"`,`questHook('${k}'`,`miniQuest("${k}")`];
    if(!muster.some(m=>source.includes(m))) fehlt.push(q.check); }
  return fehlt.length?"ohne Auslöser: "+fehlt.join(", "):true; });
test("ZIEL-3","Kapitel 1 ist mit Start-Hof erfüllbar: Einstallen + Zettel annehmen + Hofbuch feuern die Ziele",()=>{ frisch(); S.xp=0; S.questIdx=0; S.questsDone={}; const p=ctx.neuesTier("qwen35-4b"); S.tiere.push(p); const b=S.buchten[0]; p.bucht=b.id; b.tier=p.uid; ctx.questHook("zuweisung",null);
  ctx.questHook("hofbuch_gelesen",null); ctx.questHook("zettel_angenommen",null); const Q=id=>ctx.QUESTS.find(q=>q.id===id); return (ctx.questErfuellt(Q("q01"))&&ctx.questErfuellt(Q("q02"))&&ctx.questErfuellt(Q("q07"))&&!ctx.questErfuellt(Q("q03")))?true:JSON.stringify(S.flags); });


/* ── Ära 9 · Runde-4-Fixes (Belege: scratchpad/sim4 und sim3) ── */
test("R4-1","Forschung Wurfpflege trägt ihr frei-Feld (Abschluss landete vorher in S.forschung[undefined])",()=>ctx.FORSCHUNG.wurfpflege.frei==="wurfpflege"?true:JSON.stringify(ctx.FORSCHUNG.wurfpflege));
test("R4-2","Großkunden-Vorlage gross_katalog verlangt schreiben, nicht den unbekannten Wert stil",()=>{ const v=ctx.HL_AUFTRAEGE.find(x=>x.key==="gross_katalog"); return (v&&v.rollen[0][1].schreiben===60&&v.rollen[0][1].stil===undefined)?true:JSON.stringify(v&&v.rollen[0]); });
test("R4-3","Nacht-Destillation verlangt die Forschung Ferkelschule",()=>{ frisch(); S.xp=99999; const p=ctx.neuesTier("qwen35-4b"),l=ctx.neuesTier("smollm3-3b"); S.tiere.push(p,l); const b=S.buchten[0]; p.bucht=b.id; b.tier=p.uid; S.buchten.push({...b,id:"b_l",rhSlot:"pc:1",tier:l.uid}); l.bucht="b_l";
  const f=ctx.hlNachtPruefung(p,{art:"distill",lehrer:l.uid,fokus:"treue"}); return /Destillation|erforschen/.test(String(f))?true:"Antwort: "+f; });
test("R4-4","Ein ungültiger Nachtplan verwirft nicht die Nacht der anderen Modelle",()=>{ frisch(); S.xp=99999; S.kredit=9000; S.forschung.lora=true; S.daten.beispiele=40;
  const a=ctx.neuesTier("qwen35-4b"),c=ctx.neuesTier("smollm3-3b"); S.tiere.push(a,c); const b=S.buchten[0]; a.bucht=b.id; b.tier=a.uid; S.buchten.push({...b,id:"b_c",rhSlot:"pc:1",tier:c.uid}); c.bucht="b_c";
  ctx.tagBeenden(); ctx.hlNachtSet(a.uid,"art","distill"); ctx.hlNachtSet(c.uid,"art","lora"); ctx.hlNachtSet(c.uid,"fokus","treue");
  const ok=ctx.starteNachtSchicht(); const h=ctx.hlStand(); const nacht=h.nacht||[]; const eintragC=nacht.find(x=>x.uid===c.uid);
  if(ok!==true) return "starteNachtSchicht="+ok+" Plan="+JSON.stringify(h.plan); if(!eintragC||eintragC.q.art!=="lora") return "c nicht in der Nacht: "+JSON.stringify(nacht); if((h.plan[a.uid]||{}).art!=="ruhe") return "a nicht auf Ruhe: "+JSON.stringify(h.plan[a.uid]); return true; });
test("R4-5","Kauf ohne Geld, Forschung bei laufender Forschung und Kontrollpaket nach Annahme melden Klartext",()=>{ frisch(); const m=[]; const alt=ctx.melde; ctx.melde=(t)=>m.push(String(t)); try{
  S.kredit=0; ctx.modellKaufen("qwen35-4b"); S.kredit=5000; S.forschungAktiv={id:"sft",rest:2}; ctx.forschen("quant"); const j=ctx.hlJobNeu(0,true); S.jobs.push(j); j.team={}; ctx.hlKontrolle(j.id); }finally{ ctx.melde=alt; }
  return (m.some(t=>/reicht die Kasse nicht/.test(t))&&m.some(t=>/läuft schon eine Forschung/.test(t))&&m.some(t=>/nur vor der Annahme/.test(t)))?true:m.join(" | "); });
test("R4-7","Empfehlungs-Zettel erscheint auch, wenn der Zufall den normalen Katalog verweigert",()=>{ frisch(); S.tiere.push(ctx.neuesTier("qwen35-4b")); S.empfehlungen=[{art:"text",kunde:"laden",lohnF:1.1}]; const altR=ctx.Math.random; ctx.Math.random=()=>0.9; try{ ctx.ereignisMorgen(); }finally{ ctx.Math.random=altR; }
  return S.jobs.some(j=>j.empfehlung)?true:"kein Empfehlungs-Zettel: "+S.jobs.map(j=>j.t).join(", "); });
test("R4-8","Inzucht erkennt auch Großeltern (zwei Generationen)",()=>{ frisch(); const g=ctx.neuesTier("smollm3-3b"),e=ctx.neuesTier("smollm3-3b"),k=ctx.neuesTier("smollm3-3b"),x=ctx.neuesTier("smollm3-3b"); e.eltern={uids:["t_fremd",g.uid]}; k.eltern={uids:["t_andere",e.uid]}; S.tiere.push(g,e,k,x);
  return (ctx.istInzucht([g,k])===true&&ctx.istInzucht([g,x])===false)?true:"Großeltern: "+ctx.istInzucht([g,k])+" · fremd: "+ctx.istInzucht([g,x]); });
test("R4-10","Vier-gewinnt-Steine tragen sichtbares Symbol und aria-label",()=>source.includes('aria-label="\'+(c===1?"Hof":c===2?"Hacker":"leer")')?true:"Markup ohne Symbol");
console.log(erg.join("\n")); console.log(fail?`\n${erg.length-fail}/${erg.length} bestanden – ${fail} FEHLGESCHLAGEN`:`\n${erg.length}/${erg.length} bestanden`); process.exit(fail?1:0);
