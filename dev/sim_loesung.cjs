#!/usr/bin/env node
/* LLM FARM · Lösungs-Bot: spielt das gebaute Spiel in-process mit einer „kluge Wirtschaft"-Politik über
   viele Hoftage und protokolliert, wann welche Endspiel-Meilensteine erreicht werden (oder nie).
   Ziel: Beweis, dass jeder Weg (Hofstufe 12, kompletter Forschungsbaum, alle Meisterpunkte, Rechenzentrum,
   Tier-5-Tier, Zucht, Agenten-Welt, Cloud, Liga sowie alle fünf Lebenswerke bis zur Legende)
   mit guter Wirtschaft erreichbar ist.
   Aufruf: node dev/sim_loesung.cjs [tage=365] [seeds=3,7,42] [html=../modellhof_game.html] [--protokoll] */
"use strict";
const fs=require("fs"),path=require("path"),vm=require("vm");
const arg=k=>{ const a=process.argv.find(x=>x.startsWith(k+"=")); return a?a.slice(k.length+1):null; };
const TAGE=Number(arg("tage")||365), SEEDS=(arg("seeds")||"3,7,42").split(",").map(Number), PROTO=process.argv.includes("--protokoll");
const HTML=path.resolve(__dirname,arg("html")||"../modellhof_game.html");

function el(){ return {innerHTML:"",textContent:"",value:"",style:{setProperty(){},width:"",display:""},dataset:{},title:"",classList:{add(){},remove(){},contains:()=>false,toggle(){}},appendChild(){},remove(){},before(){},after(){},querySelector:()=>el(),querySelectorAll:()=>[],onclick:null,onanimationend:null,addEventListener(){},removeEventListener(){},setAttribute(){},getAttribute:()=>null,scrollTop:0,offsetWidth:0,offsetHeight:0,getBoundingClientRect:()=>({left:0,top:0,width:0,height:0}),focus(){},blur(){},play:()=>Promise.resolve(),pause(){},load(){}}; }
function engine(seed){
  const html=fs.readFileSync(HTML,"utf8"); const script=html.match(/<script>([\s\S]*?)<\/script>/)[1]; const source=script.slice(0,script.indexOf("/* Boot-Sequenz */"));
  const dom={}; let a=seed|0||1;
  const ctx={console:{log(){},warn(){},error(){},info(){}},JSON,Date,Object,Array,Number,String,Boolean,RegExp,Map,Set,Promise,Error,isNaN,isFinite,parseInt,parseFloat,encodeURIComponent,decodeURIComponent,
    setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame(){},cancelAnimationFrame(){},performance:{now:()=>0},
    document:{getElementById:id=>dom[id]||(dom[id]=el()),createElement:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},visibilityState:"visible",body:el(),documentElement:el(),head:el()},
    window:{},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},confirm:()=>true,prompt:()=>null,alert(){},
    btoa:s=>Buffer.from(s,"binary").toString("base64"),atob:s=>Buffer.from(s,"base64").toString("binary"),navigator:{userAgent:"bot"},location:{reload(){},href:""},
    URL:{createObjectURL:()=>"",revokeObjectURL(){}},Blob:function(){},Image:function(){this.onload=null;},Audio:function(){return el();},speechSynthesis:{cancel(){},speak(){},getVoices:()=>[]},SpeechSynthesisUtterance:function(){},fetch:()=>Promise.reject(new Error("offline")),matchMedia:()=>({matches:false,addEventListener(){}})};
  ctx.globalThis=ctx; ctx.self=ctx; ctx.window=ctx;
  ctx.Math=Object.create(Math); ctx.Math.random=()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
  vm.createContext(ctx); vm.runInContext(source,ctx,{timeout:60000});
  vm.runInContext(`Object.assign(globalThis,{MODELLE,LEIHMODELLE,TECHNIKEN,ZUCHT,QUANTS,GPUS,FUTTER,SETUPS,HARNESSE,WERTE,FORSCHUNG,LEVELS,SKILLS,STACKS,DATENLESE,QUESTS,KUNDEN,HL_AUFTRAEGE,HL_NACHT,KRANKHEITEN,PARCOURS,AW_UEBUNGEN,RH_STUFEN,RH_PC,CLOUD_PROFIL,TAG_MS,KREDIT_LIMIT});
    globalThis.__get=()=>S; globalThis.__set=o=>{S=o;}; globalThis.__einf=()=>_einf; globalThis.__lese=()=>lese; globalThis.__zucht=(m,ids)=>{zuchtMethode=m;zuchtWahl.length=0;ids.forEach(x=>zuchtWahl.push(x));}; globalThis.__renn=(pc,uid)=>{rennParcours=pc;rennWahl=uid;};`,ctx);
  ["alles","wieseNeu","schilderNeu","kopfNeu","tickerNeu","tickerLauf","dockNeu","uhrAnzeige","maskenCss","figurDeko","zieleNeu","feier","adaZeig","adaOrt","adaIntro","adaSpiele","adaKnopfNeu","adaAuto","adaTagCheck","adaInit","adaKarteNeu","adaStopp","adaBereitMachen","rhHintergrundNeu","rhAussenNeu","hlLeiste","lauf","blattZu","zeigeBericht"].forEach(f=>{ctx[f]=()=>{};});
  const meld=[]; ctx.melde=(t,art)=>{ meld.push((art==="schlecht"?"⛔":"·")+t); };
  ctx.blattAuf=()=>{}; ctx.blattLive=(t,fn)=>{ try{ fn(); }catch(e){} };
  return {ctx,meld};
}

/* ── Politik ── */
const FORSCH_REIHE=["sft","quant","lora","geschirr","dpo","merge","qlora","cloud","guardrails","rag","cpt","vllm","distill","openclaw","grpo","hermes","multiagent","secondbrain","ppo","okf","merge_ties","wurfpflege"];
const SKILL_REIHE=[["haendler","feilschen"],["betreiber","servingprofi"],["trainer","fruehstopp"],["haendler","werbetafel"],["betreiber","kernels"],["haendler","vertragskunst"],["trainer","datenhygiene"],["betreiber","spotstrom"],["haendler","stammkunden"],["trainer","replaymeister"],["betreiber","speicherpfleger"],["trainer","curriculum"],["haendler","dorfliebling"],["betreiber","nachtschicht"],["trainer","lehrmeister"]];
function politik(g,log,st){
  const c=g.ctx, S=c.__get();
  const frei=()=>S.tiere.filter(p=>p.status==="frei");
  const reserve=()=>200+S.buchten.length*60+c.hofLevel().i*40;
  const cash=()=>S.kredit-reserve();
  const mt=c.maxTier();
  /* Fachhaus: drei Spezialisierungen mit echten Kursen aufbauen. Bereits spezialisierte
     Tiere bekommen in Schritt 6 passende Praxis-Zettel für die letzten Punkte bis 85. */
  if(c.forschungFrei("sft")&&cash()>4500){
    if((S.daten.kuratiert||0)<70) c.futterKauf("kuratiert",80);
    for(const gebiet of ["datenschutz","recht","medizin"]){
      const zielUid=st.fachZiele[gebiet];
      const belegt=new Set(Object.values(st.fachZiele));
      const kandidaten=frei().filter(p=>!p.api&&!p.nadel&&p.bucht&&(zielUid?p.uid===zielUid:!belegt.has(p.uid)))
        .sort((a,b)=>c.fachWert(b,gebiet)-c.fachWert(a,gebiet));
      const p=kandidaten[0], lerngebiet=p&&gebiet!=="datenschutz"&&c.fachWert(p,"datenschutz")<80?"datenschutz":gebiet;
      const kurs=p&&c.fachKurseOffen(p,lerngebiet)[0];
      if(!p||!kurs) continue;
      const technik=lerngebiet==="datenschutz"&&c.forschungFrei("dpo")?"dpo":"sft";
      const kk=c.fachKursKosten(p,kurs.id,technik,lerngebiet);
      if(kk&&(S.daten.kuratiert||0)>=kk.gb&&cash()>kk.preis+2500&&c.fachSchulungStart(p.uid,lerngebiet,kurs.id,technik)){ st.fachZiele[gebiet]=p.uid; log("fach-"+gebiet+"-"+lerngebiet+"-"+kurs.id,p.name); }
    }
  }
  /* 1) Stall: freie Tiere in freie Buchten (passend, sonst mit RAM-Auslagerung) */
  for(const p of frei().filter(p=>!p.api&&!p.bucht)){ const kl=S.buchten.filter(b=>!b.tier&&c.passtInBucht(p,b)).sort((x,y)=>c.GPUS[x.gpu].vram-c.GPUS[y.gpu].vram); const b=kl[0]||S.buchten.find(b=>!b.tier&&(b.stackBereit||0)<=S.tag); if(b&&!(c.GPUS[b.gpu].vram>=300&&p.pT<200)) c.inBucht(p.uid,b.id); }
  /* Riesenbucht frei → bestes Tier-5-Modell kaufen, das hineinpasst */
  { const gross=S.buchten.find(b=>!b.tier&&c.GPUS[b.gpu].vram>=300); if(gross&&S.tag%20===0) log("gross-frei-T"+S.tag,"cash "+Math.round(cash())+" mt "+mt); if(gross&&cash()>12000){ const g=c.GPUS[gross.gpu]; const kand=Object.entries(c.MODELLE).filter(([id,m])=>m.tier<=mt&&m.tier>=4&&!m.puzzle&&!m.nc&&m.preis<=cash()&&c.vramPig({pT:m.pT,pA:m.pA||m.pT,moe:!!m.moe,ctx:m.ctx,arch:m.arch||(m.moe?"moe":"dense"),api:false,quant:"q4"})<=g.vram).sort((a,b)=>b[1].tier-a[1].tier||b[1].preis-a[1].preis); if(kand[0]){ c.modellKaufen(kand[0][0]); log("kauf-gross",kand[0][0]+" T"+kand[0][1].tier); } } }
  /* 2) Werkstatt: alles auf q4 (Tempo!), wenn erforscht */
  if(c.forschungFrei("quant")&&c.istFrei("gebWerkstatt")) for(const p of frei().filter(p=>!p.api&&p.quant==="bf16"&&p.modell&&S.kredit>60)) c.quantSetzen(p.uid,"q4");
  /* 3) Forschung nach Reihe */
  if(!S.forschungAktiv&&c.istFrei("gebForschung")){ for(const id of FORSCH_REIHE){ const f=c.FORSCHUNG[id]; if(!f||S.forschung[f.frei]) continue; const ok=(f.braucht||[]).every(b=>S.forschung[c.FORSCHUNG[b]?c.FORSCHUNG[b].frei:b]); if(!ok) continue; if(cash()>=f.kosten){ c.forschen(id); if(S.forschungAktiv){ log("forschung",id); } } break; } }
  /* 4) Skills */
  if(c.skillPunkteFrei()>0){ if(!S.meisterweg&&c.hofLevel().i>=3) c.meisterwegWaehlen("haendler"); for(const [w,id] of SKILL_REIHE){ if(S.skills&&S.skills[id]) continue; const d=c.skillDef(id); if(d.capstone&&S.meisterweg!==w) continue; if(d.braucht&&!(S.skills||{})[d.braucht]) continue; if(c.skillPunkteFrei()>=d.p){ c.skillKaufen(w,id); break; } } }
  /* 5) Agenten-Tool auf das werkzeugstärkste freie Tier */
  if(c.forschungFrei("geschirr")&&c.istFrei("gebGeschirr")){ for(const p of frei().filter(p=>!p.api&&!p.geschirr&&c.archVon(p)!=="hrm")){ let best=null,bs=0; for(const hid in c.HARNESSE){ if(c.HARNESSE[hid].abo) continue; const sc=c.geschirrEignung(p,hid); if(sc>bs){bs=sc;best=hid;} } if(best&&bs>=60) c.geschirrAnlegen(p.uid,best); } }
  /* 6) Aufträge: beste Besetzung je offenem Zettel (Lohn je Stunde, Frist muss halten) */
  const offen=()=>S.jobs.filter(j=>!j.team&&!S.tiere.some(p=>p.job===j.id));
  const fachZiele=st.fachZiele;
  let runden=0;
  while(runden++<8){
    const alle=frei().filter(p=>p.bucht||p.api).sort((a,b)=>c.effizienzIndex(b)-c.effizienzIndex(a));
    const fachIds=new Set(Object.values(st.fachZiele));
    const kand=[...alle.slice(0,6),...alle.filter(p=>fachIds.has(p.uid)&&!alle.slice(0,6).includes(p))]; if(!kand.length) break;
    let best=null;
    for(const j of offen()){
      const rollen=c.hlRollen(j);
      // Einzeltier für alle Rollen
      /* Restrisiko nur für wenige gezielte Praxiszettel bis Fachwert 85 zulassen. */ for(const p of kand){ const w=Object.fromEntries(rollen.map((r,i)=>[i,p.uid])); const ch=c.hlTeamCheck(j,w); if(!ch.ok) continue; const gebiet=c.fachGebietVonJob(j), istPraxis=gebiet&&fachZiele[gebiet]===p.uid&&c.fachWert(p,gebiet)<85; const ds=c.dsWahrscheinlichkeit?c.dsWahrscheinlichkeit(j,[p]).p:0; if(ds>0&&!(istPraxis&&ds<=.06)) continue; const st=c.hlStunden(j,ch); if(st.tage>c.hlFristTage(j)) continue;
        const praxis=istPraxis?20000+((p.fach||{})[gebiet]||0)*10:0;
        const lohn=c.jobLohnGesamt(j)*(ch.erfolg/100), score=lohn/Math.max(1,st.std)*(j.liga?3:1)+praxis; if(!best||score>best.score) best={j,w,score,st}; }
      // Zweierteam bei mehrstufigen Zetteln
      if(rollen.length>=2&&kand.length>=2){ for(const p1 of kand) for(const p2 of kand){ if(p1===p2) continue; const w={}; rollen.forEach((r,i)=>{w[i]=i===rollen.length-1?p2.uid:p1.uid;}); const ch=c.hlTeamCheck(j,w); if(!ch.ok) continue; const gebiet=c.fachGebietVonJob(j), praxisTiere=gebiet?[p1,p2].filter(p=>fachZiele[gebiet]===p.uid&&c.fachWert(p,gebiet)<85):[]; const ds=c.dsWahrscheinlichkeit?c.dsWahrscheinlichkeit(j,[p1,p2]).p:0; if(ds>0&&!(praxisTiere.length&&ds<=.06)) continue; const st=c.hlStunden(j,ch); if(st.tage>c.hlFristTage(j)) continue; const praxis=praxisTiere.reduce((n,p)=>n+12000+((p.fach||{})[gebiet]||0)*5,0); const lohn=c.jobLohnGesamt(j)*(ch.erfolg/100), score=lohn/Math.max(1,st.std)/1.6*(j.liga?3:1)+praxis; if(!best||score>best.score) best={j,w,score,st}; } }
    }
    if(!best) break;
    Object.entries(best.w).forEach(([i,uid])=>c.hlWaehlen(best.j.id,Number(i),uid)); c.hlTeamStart(best.j.id);
    if(!best.j.team) break; st.jobsAngenommen++; if(best.j.groesse==="L") st.grosse++;
  }
  /* 7) Datenlese (Bot trifft 7 von 8) */
  if(S.leseTag!==S.tag&&(S.daten.webmix||0)>=4){ c.leseStart(); const l=c.__lese(); if(l){ l.karten.forEach((k,i)=>{ l.antworten[i]=(i===3&&k.k==="sauber")?"muell":k.k; }); c.leseFertig(); } }
  /* 8) Markt: Herde ausbauen, wenn Geld da ist – erst Rechner, dann Modell */
  if(cash()>3800&&S.buchten.every(b=>b.tier)&&S.buchten.length<12&&c.rh().stufe===0){ const cfg=c.rhCfg(); if(S.buchten.length>=6&&!c.rh().nachbar) c.rhKauf("nachbar"); let i=0; for(;i<cfg.pc;i++) if(!S.buchten.some(b=>b.rhSlot==="pc:"+i)) break; if(i<cfg.pc){ const vor=S.buchten.length; c.rhInstall("pc",i,cash()>6500?"max":"gebraucht"); if(S.buchten.length>vor) log("pc",S.buchten.length); } }
  if(!S.flags||!S.flags.hofbuch_gelesen) try{ c.zeigeHofbuch(); }catch(e){}
  if(S.buchten.some(b=>!b.tier&&c.GPUS[b.gpu].vram<300)&&cash()>500&&!S.tiere.some(p=>!p.api&&!p.bucht&&p.status==="frei"&&S.buchten.some(b=>!b.tier&&c.passtInBucht(p,b)))){ const b=S.buchten.find(b=>!b.tier&&c.GPUS[b.gpu].vram<300); const g=c.GPUS[b.gpu];
    const passt=m=>c.vramPig({pT:m.pT,pA:m.pA||m.pT,moe:!!m.moe,ctx:m.ctx,arch:m.arch||(m.moe?"moe":"dense"),api:false,quant:c.forschungFrei("quant")?"q4":"bf16"})<=g.vram+(b.ramGB||32)*0.4;
    const kand=Object.entries(c.MODELLE).filter(([id,m])=>m.tier<=mt&&!m.puzzle&&!m.nc&&m.preis<=cash()).map(([id,m])=>({id,m,score:(m.w.logik+m.w.code+m.w.wissen+m.w.treue+m.w.werkzeug)/5*(1+m.tier*(g.vram>=80?1.5:0.35))/Math.pow(m.preis,g.vram>=80?0.1:0.3)})).filter(x=>passt(x.m)).sort((a,b)=>b.score-a.score);
    if(kand[0]){ c.modellKaufen(kand[0].id); log("kauf",kand[0].id+" T"+kand[0].m.tier); } }
  /* 9) Rechenhaus & Energie */
  const r=c.rh();
  if(cash()>400&&r.pv.length<c.rhCfg().dach) c.rhKauf("solar");
  if(cash()>900&&r.akku<(r.stufe===2?20:5)) c.rhKauf("akku");
  if(r.stufe===2&&c.rhPV(r)<10&&cash()>1000) c.rhKauf("solarfeld");
  /* Endspielpfad: Nerdtempel → Anschluss → Racks → große Karten → Rechenzentrum */
  const pcIdx=b=>Number(((b.rhSlot||"pc:0").split(":")[1])||0);
  if(r.stufe===0&&cash()>20000&&S.buchten.length>=6){ for(const b of S.buchten.filter(b=>(b.rhSlot||"").startsWith("pc:")&&pcIdx(b)>=6)){ const p=S.tiere.find(t=>t.uid===b.tier); if(p&&p.status==="frei") c.ausBucht(p.uid); } if(S.buchten.filter(b=>pcIdx(b)>=6).every(b=>!b.tier)){ c.rhUpgrade(); if(c.rh().stufe===1) log("nerdtempel",S.tag); } }
  if(r.stufe>=1&&cash()>3000&&r.wind.length<2) c.rhKauf("wind",r.wind.length?1:0);
  if(r.stufe>=1&&r.wind.length>=2&&cash()>6000&&r.wind.length<4) c.rhKauf("wind",2);
  if(r.stufe>=1&&cash()>4000){ const ev=r.events; for(let e=0;e<3;e++){ if(!ev[r.stufe+":"+e]){ c.rhEvent(e); break; } } }
  if(r.stufe>=1&&cash()>8000){ const rackFrei=r.racks.filter(i=>!S.buchten.some(b=>(b.rhSlot||"").startsWith("rack:"+i+":"))); const nextRack=[...Array(c.rhCfg().racks).keys()].find(i=>!r.racks.includes(i));
    if(!rackFrei.length&&nextRack!==undefined&&r.racks.length<6&&!r.events||true){ if(!rackFrei.length&&nextRack!==undefined&&r.racks.length<6) c.rhInstall("rack",nextRack); }
    const leer=r.racks.find(i=>!S.buchten.some(b=>(b.rhSlot||"").startsWith("rack:"+i+":")));
    if(leer!==undefined){ const karte=cash()>420000?"rack8b200":cash()>270000?"rack8h100":cash()>140000?"rack4h100":cash()>55000?"b200":cash()>42000?"h200":cash()>38000?"h100":cash()>14000?"a100":null; if(karte){ const vor=S.buchten.length; c.rhInstall("rack",leer,karte,0); if(S.buchten.length>vor) log("rack-"+karte,S.tag); } } }
  const fachFertig=Object.entries(st.fachZiele).length>=3&&Object.entries(st.fachZiele).every(([gebiet,uid])=>c.fachWert(S.tiere.find(p=>p.uid===uid),gebiet)>=85);
  if(r.stufe===1&&fachFertig&&cash()>120000&&S.buchten.some(b=>(b.rhSlot||"").startsWith("rack"))){ for(const b of S.buchten.filter(b=>(b.rhSlot||"").startsWith("pc:"))){ const p=S.tiere.find(t=>t.uid===b.tier); if(p&&p.status==="frei") c.ausBucht(p.uid); } if(S.buchten.filter(b=>(b.rhSlot||"").startsWith("pc:")).every(b=>!b.tier)){ c.rhUpgrade(); if(c.rh().stufe===2) log("rechenzentrum",S.tag); } }
  /* 10) Cloud-Lizenz für Spitzenlast */
  if(c.istFrei("gebCloud")&&cash()>2500&&!S.tiere.some(p=>p.api)&&S.cloudAngebot.ids.length){ c.lizenzKaufen(S.cloudAngebot.ids[0]); log("cloud",S.cloudAngebot.ids[0]); }
  /* 11) Zuchtlinie: fünf echte Würfe; höchste verfügbare Generation bevorzugen,
     damit aus derselben kompatiblen Basis eine nachvollziehbare G3-Linie entsteht. */
  if(c.forschungFrei("merge")&&c.istFrei("gebZucht")&&cash()>1200&&S.statistik.merges<5){
    const f=frei().filter(p=>!p.api&&(p.zuchtRuhe||0)<=S.tag).sort((a,b)=>(b.gen||0)-(a.gen||0));
    let paar=null, best=-1;
    for(let i=0;i<f.length;i++) for(let k=i+1;k<f.length;k++) if(c.mergeKompatibel(f[i],f[k],"slerp").ok){ const sc=Math.max(f[i].gen||0,f[k].gen||0)*10+Math.min(f[i].gen||0,f[k].gen||0); if(sc>best){best=sc;paar=[f[i],f[k]];} }
    if(paar){ c.__zucht("slerp",paar.map(p=>p.uid)); c.zuchtStart(); if(paar[0].status==="zucht") log("zucht-"+(S.statistik.merges+1),paar[0].name+"×"+paar[1].name); }
  }
  /* 12) Arena einmal je 5 Tage */
  if(c.istFrei("gebArena")&&S.tag%5===0&&cash()>200){ const p=frei().filter(p=>p.bucht||p.api).sort((a,b)=>c.rennWert(b,"wissen")-c.rennWert(a,"wissen"))[0]; if(p){ c.__renn("wissen",p.uid); let t=0; c.performance.now=()=>t; c.requestAnimationFrame=fn=>{t+=60;fn();}; try{ c.rennenStarten(); }catch(e){ st.fehler.push("arena "+e.message); } c.requestAnimationFrame=()=>{}; } }
  /* 13) Agenten-Welt */
  if(c.agentenWeltFrei()&&!S.agentenWelt){ const f=frei().filter(p=>!p.api&&p.bucht&&p.geschirr); const l=frei().filter(p=>(p.api||p.bucht)&&!f.slice(0,1).includes(p)).sort((a,b)=>c.effW(b).treue-c.effW(a).treue)[0]; if(f[0]&&l&&cash()>800){ c.awStart(f[0].uid,l.uid,f[0].geschirr,"tickets"); if(S.agentenWelt) log("agentenwelt",f[0].name); } }
  if(S.agentenWelt&&S.agentenWelt.tage>=6) c.awStop();
  /* 13b) Denkmodus einmal ausprobieren, Endspiel-Hardware: 8×H100-Rack + Tier-5-Modell */
  for(const p of frei().filter(p=>p.rz===1&&!S.denkmodusGenutzt)) { c.denkenUm(p.uid); c.denkenUm(p.uid); break; }
  if(r.stufe===2&&cash()>280000&&!S.buchten.some(b=>b.gpu==="rack8h100")){ const nextRack=[...Array(c.rhCfg().racks).keys()].find(i=>!r.racks.includes(i)); if(nextRack!==undefined){ c.rhInstall("rack",nextRack); const vor=S.buchten.length; c.rhInstall("rack",nextRack,"rack8h100",0); if(S.buchten.length>vor) log("rack8h100",S.tag); } }
  /* 14) Futter nachkaufen */
  if((S.daten.beispiele||0)<10&&cash()>300) c.futterKauf("beispiele",10);
  if((S.daten.kuratiert||0)<10&&cash()>300) c.futterKauf("kuratiert",10);
  /* 15) Kuren */
  for(const p of S.tiere.filter(p=>p.krank)) if(S.kredit>300) c.kurieren(p.uid);
  /* 16) Nachtplan: freie Tiere trainieren (LoRA/QLoRA), sonst Ruhe */
  const h=c.hlStand(); h.plan={};
  for(const p of S.tiere.filter(p=>c.hlNachtFrei(p))){ const w=c.effW(p); const fokus=["logik","code","wissen","treue","werkzeug"].sort((a,b)=>w[a]-w[b])[0];
    if(w[fokus]>=72||cash()<900||(p.historie||[]).some(x=>x.delta&&S.tag-x.tag<4)) continue;   /* dosiert: nur schwache Werte, nur mit Polster, nicht täglich */
    for(const art of (S.tag%2?["qlora","lora"]:["lora","qlora"])){ const q={art,fokus,lehrer:null,futter:null}; if(!c.forschungFrei(art)) continue; const fe=c.hlNachtPruefung(p,q); if(!fe){ h.plan[p.uid]=q; break; } } }
}

function lauf(seed){
  const g=engine(seed), c=g.ctx;
  const S=c.frischerStand(); c.__set(S); c.rhMigration(S); c.hlStand();
  const e=c.__einf(); e.wahl=["qwen35-4b","granite42-3b"]; e.spezial="code"; e.schwierig="hofalltag"; e.fuehrung="gefuehrt";
  S.jobs.push(c.jobNeu(),c.jobNeu(),c.jobNeu()); c.cloudRotieren(); c.marktLosNeu(); c.willkommenFertig();
  const st={jobsAngenommen:0,grosse:0,fehler:[],meilen:{},verlauf:[],strafen:0,min:S.kredit,max:S.kredit,fachZiele:{}};
  const log=(k,v)=>{ if(!st.meilen[k]) st.meilen[k]="T"+S.tag+(v!==undefined?" ("+v+")":""); };
  let lvlAlt=1;
  for(let d=0;d<TAGE;d++){
    /* Tag in Zeitschritten: nach jedem Schritt Sofort-Abnahme, dann wieder Zettel annehmen */
    for(let h=0;h<=12;h+=4){ S.tagMs=Math.min(c.TAG_MS,h/16*c.TAG_MS); try{ if(h>0) c.hlSofortAbnahme(); politik(g,log,st); }catch(err){ st.fehler.push("T"+S.tag+" politik: "+err.message+" @ "+String(err.stack||"").split(String.fromCharCode(10))[1]); } }
    S.tagMs=c.TAG_MS-1;
    c.tagBeenden(); c.setTimeout=fn=>{fn();return 0;}; let ok=false; try{ ok=c.starteNachtSchicht(); }catch(err){ st.fehler.push("T"+S.tag+" nacht: "+err.message); }
    if(!ok){ c.hlStand().plan={}; c.hlStand().phase="planung"; try{ ok=c.starteNachtSchicht(); }catch(err){ st.fehler.push("T"+S.tag+" nacht2: "+err.message); } }
    if(!ok){ c.hlStand().phase="tag"; try{ c.ausfuehrenTagesWechsel(); }catch(err){ st.fehler.push("T"+S.tag+" tag: "+err.message); } }
    c.setTimeout=()=>0;
    const l=c.hofLevel().i; if(l>lvlAlt){ for(let k=lvlAlt+1;k<=l;k++) log("stufe"+k); lvlAlt=l; }
    if(S.geselle) log("geselle"); if((S.liga||[]).some(x=>x.rang===1)) log("liga-sieg"); else if((S.liga||[]).length) log("liga-teilnahme",S.liga[0].rang);
    if(Object.keys(c.FORSCHUNG).every(id=>S.forschung[c.FORSCHUNG[id].frei])) log("techtree-komplett");
    const mtT=Math.max(0,...S.tiere.filter(p=>!p.api&&p.modell).map(p=>c.MODELLE[p.modell].tier)); for(let t=1;t<=5;t++) if(mtT>=t) log("tier"+t+"-tier");
    if(S.statistik.merges>0) log("zucht-fertig"); if(c.skillPunkteGesamt()>=11) log("11-meisterpunkte");
    /* v9.8: das Ende – Hofmeisterbrief, Legende und jeder einzelne Weg */
    if(S.finale&&S.finale.meister) log("meisterbrief"); if(S.finale&&S.finale.legende) log("legende");
    try{ if(typeof c.finaleStand==="function") c.finaleStand().wege.forEach(w=>{ if(w.ok) log("weg-"+w.id); }); }catch(e){}
    if(S.tiere.some(p=>p.api)) log("cloud-lizenz");
    st.strafen=(S.journal||[]).filter(x=>x.kat==="strafe").length;
    st.min=Math.min(st.min,S.kredit); st.max=Math.max(st.max,S.kredit);
    if(S.tag%30===0) st.verlauf.push({tag:S.tag,kasse:Math.round(S.kredit),stufe:l,xp:S.xp,tiere:S.tiere.length,buchten:S.buchten.length,forsch:Object.keys(S.forschung).length,jobs:S.statistik.jobs,strafen:st.strafen});
    if(PROTO&&(d<5||S.tag%30===0)) console.log("T"+S.tag,"Kasse",Math.round(S.kredit),"Stufe",l,"XP",S.xp,"Tiere",S.tiere.length,"Buchten",S.buchten.length,"Jobs",S.statistik.jobs,g.meld.slice(-3).join(" | ").slice(0,200));
    g.meld.length=0;
  }
  return {seed,S,st,c};
}
const ergebnisse=SEEDS.map(lauf);
for(const {seed,S,st,c} of ergebnisse){
  console.log(`\n=== Seed ${seed} · ${TAGE} Tage · Kasse ${Math.round(S.kredit)} € (min ${Math.round(st.min)}, max ${Math.round(st.max)}) · Stufe ${c.hofLevel().i} (${S.xp} XP) · Tiere ${S.tiere.length} · Buchten ${S.buchten.length} · Forschung ${Object.keys(S.forschung).length}/${Object.keys(c.FORSCHUNG).length} · Aufträge ${S.statistik.jobs} (L: ${st.grosse}) · Strafen ${st.strafen} · Trainings ${S.statistik.trainings} · Merges ${S.statistik.merges} · Quests ${Object.keys(S.questsDone).length}/${c.QUESTS.length} · Rechenhaus ${c.RH_STUFEN[c.rh().stufe].name}`);
  const kat={}; (S.journal||[]).forEach(e=>{ kat[e.kat]=(kat[e.kat]||0)+e.b; }); console.log("Journal (letzte 400 Buchungen) je Kategorie:",Object.entries(kat).sort((a,b)=>a[1]-b[1]).map(([k,v])=>k+" "+Math.round(v)).join(" · "));
  const offenQ=c.QUESTS.filter(q=>!S.questsDone[q.id]).slice(0,4).map(q=>q.id+"("+q.check+")"); console.log("Offene Hofziele (nächste):",offenQ.join(" · "));
  console.log("Meilensteine:",Object.entries(st.meilen).map(([k,v])=>k+"="+v).join(" · "));
  console.log("Lebenswerke:",c.finaleStand().wege.map(w=>w.id+"="+(w.ok?"✓ ":"· ")+w.ist).join(" · "));
  console.log("Fachziele:",Object.entries(st.fachZiele).map(([g,uid])=>{const p=S.tiere.find(t=>t.uid===uid);return g+"="+(p?p.name+" "+c.fachWert(p,g):"fehlt");}).join(" · "));
  console.log("Verlauf:",st.verlauf.map(v=>`T${v.tag}:${v.kasse}€/S${v.stufe}/${v.tiere}T/${v.buchten}B/F${v.forsch}/J${v.jobs}`).join(" "));
  if(st.fehler.length) console.log("FEHLER:",[...new Set(st.fehler)].slice(0,8).join(" | "));
}
const soll=["stufe3","stufe5","stufe7","stufe10","stufe12","techtree-komplett","nerdtempel","rechenzentrum","tier3-tier","tier5-tier","zucht-fertig","geselle","cloud-lizenz","agentenwelt","liga-teilnahme","11-meisterpunkte","meisterbrief","legende","weg-zucht","weg-rechen","weg-wissen","weg-handel","weg-fach"];
console.log("\nErreicht (Seeds):",soll.map(k=>k+":"+ergebnisse.filter(r=>r.st.meilen[k]).length+"/"+ergebnisse.length).join("  "));
