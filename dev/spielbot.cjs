#!/usr/bin/env node
/* LLM FARM · Headless-Spieltreiber (Simulations-Agenten spielen das ECHTE Spiel im Zeitraffer).
   Lädt die gebaute modellhof_game.html in eine Node-VM (wie dev/tests_v6.cjs), stellt Spielaktionen
   als Kommandos bereit und schreibt den Spielstand samt Protokoll in eine JSON-Datei.
   Aufruf:  node dev/spielbot.cjs <stand.json> "<kommando>" ["<kommando>" ...]
   Beispiel: node dev/spielbot.cjs s1.json "neu seed=7 fokus=code" "status"
             node dev/spielbot.cjs s1.json "annehmen j3 t1" "tag" "status"
   Kommando "hilfe" listet alle Kommandos. Alle Zahlen/Meldungen kommen unverändert aus der Engine. */
"use strict";
const fs=require("fs"),path=require("path"),vm=require("vm");
const HTML=path.join(__dirname,"..","modellhof_game.html");

/* ── Deterministischer Zufall (mulberry32), Zustand wird im Stand gespeichert ── */
function mulberry(st){ return function(){ st.a|=0; st.a=st.a+0x6D2B79F5|0; let t=Math.imul(st.a^st.a>>>15,1|st.a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

/* ── Engine laden ── */
function el(){ return {innerHTML:"",textContent:"",value:"",style:{setProperty(){},width:"",display:""},dataset:{},title:"",
  classList:{add(){},remove(){},contains:()=>false,toggle(){}},appendChild(){},remove(){},before(){},after(){},
  querySelector:()=>el(),querySelectorAll:()=>[],onclick:null,onanimationend:null,addEventListener(){},removeEventListener(){},
  setAttribute(){},getAttribute:()=>null,scrollTop:0,offsetWidth:0,offsetHeight:0,getBoundingClientRect:()=>({left:0,top:0,width:0,height:0}),
  focus(){},blur(){},play:()=>Promise.resolve(),pause(){},load(){}}; }
function engineLaden(rngState,htmlPfad){
  const html=fs.readFileSync(htmlPfad||HTML,"utf8");
  const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const source=script.slice(0,script.indexOf("/* Boot-Sequenz */"));
  const meldungen=[], blaetter=[], dom={};
  let bericht=null;
  const ctx={console,JSON,Date,Object,Array,Number,String,Boolean,RegExp,Map,Set,Promise,Error,isNaN,isFinite,parseInt,parseFloat,encodeURIComponent,decodeURIComponent,
    setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame(){},cancelAnimationFrame(){},
    performance:{now:()=>0},
    document:{getElementById:id=>dom[id]||(dom[id]=el()),createElement:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},
      visibilityState:"visible",body:el(),documentElement:el(),head:el()},
    window:{}, localStorage:{getItem:()=>null,setItem(){},removeItem(){}}, sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},
    confirm:q=>{ const ja=RUECKFRAGE_JA!==false; meldungen.push("❓ Rückfrage: "+String(q).replace(/\s+/g," ")+" → "+(ja?"JA (Treiber bestätigt automatisch)":"NEIN (rueckfrage nein)")); return ja; }, prompt:()=>null, alert(){}, btoa:s=>Buffer.from(s,"binary").toString("base64"),
    atob:s=>Buffer.from(s,"base64").toString("binary"), navigator:{userAgent:"spielbot"}, location:{reload(){},href:""},
    URL:{createObjectURL:()=>"",revokeObjectURL(){}}, Blob:function(){}, Image:function(){ this.onload=null; }, Audio:function(){ return el(); },
    speechSynthesis:{cancel(){},speak(){},getVoices:()=>[]}, SpeechSynthesisUtterance:function(){}, fetch:()=>Promise.reject(new Error("offline")),
    matchMedia:()=>({matches:false,addEventListener(){}})};
  ctx.globalThis=ctx; ctx.self=ctx; ctx.window=ctx;
  ctx.Math=Object.create(Math); ctx.Math.random=mulberry(rngState);
  vm.createContext(ctx);
  vm.runInContext(source,ctx,{timeout:60000});
  vm.runInContext(`Object.assign(globalThis,{MODELLE,LEIHMODELLE,FAMILIEN,TECHNIKEN,ZUCHT,QUANTS,GPUS,FUTTER,SETUPS,HARNESSE,WERTE,FORSCHUNG,LEVELS,SKILLS,STACKS,SAISONEN,
    DATENLESE,QUESTS,KUNDEN,EREIGNISSE,JOBVORLAGEN,HL_AUFTRAEGE,HL_TEILE,HL_EVENTS,HL_PROJEKTE,HL_NACHT,KRANKHEITEN,PARCOURS,AW_UEBUNGEN,HOFTECH,GEBAEUDE,SPEZIAL,SCHWIERIG,WOCHE,
    RH_STUFEN,RH_WIND,RH_GEN,RH_PC,CLOUD_PROFIL,TAG_MS,KREDIT_LIMIT,TIERARTEN,PUZZLE_JOBS,SPEZIALTIERE,BAUFORMEN,FUTTER_DOMAENE,
    WISSEN_ALLGEMEIN:(typeof WISSEN_ALLGEMEIN!=="undefined")?WISSEN_ALLGEMEIN:[]});
    globalThis.__get=()=>S; globalThis.__set=o=>{S=o;}; globalThis.__einf=()=>_einf; globalThis.__lese=()=>lese; globalThis.__leseSet=v=>{lese=v;};
    globalThis.__zucht=(m,ids)=>{zuchtMethode=m;zuchtWahl.length=0;ids.forEach(x=>zuchtWahl.push(x));};
    globalThis.__renn=(pc,uid)=>{rennParcours=pc;rennWahl=uid;}; globalThis.__aw=()=>awWahl; globalThis.__blattStack=()=>blattStack;
    globalThis.__wiz=v=>{wiz=v;}; globalThis.__wizGet=()=>wiz;
    globalThis.__miniAkt=()=>(typeof miniAkt!=="undefined")?miniAkt:null; globalThis.__miniAktSetzen=v=>{ if(typeof miniAkt!=="undefined") miniAkt=v; };`,ctx);
  /* UI stilllegen, aber Meldungen & Blätter mitschreiben */
  ["alles","wieseNeu","schilderNeu","kopfNeu","tickerNeu","tickerLauf","dockNeu","uhrAnzeige","maskenCss","figurDeko","zieleNeu","feier",
   "adaZeig","adaOrt","adaIntro","adaSpiele","adaKnopfNeu","adaAuto","adaTagCheck","adaInit","adaKarteNeu","adaStopp","adaBereitMachen","rhHintergrundNeu","rhAussenNeu","hlLeiste","lauf"]
   .forEach(f=>{ ctx[f]=()=>{}; });
  ctx.melde=(t,art)=>{ meldungen.push((art==="schlecht"?"⛔ ":art==="gut"?"✅ ":"ℹ️ ")+String(t)); };
  ctx.blattAuf=(titel,html,id)=>{ blaetter.push({titel,html,id}); ctx.__blattStack().push({id,titel,html}); };
  ctx.blattLive=(titel,fn,id)=>{ const html=fn(); blaetter.push({titel,html,id}); ctx.__blattStack().push({id,titel,html}); };
  ctx.blattZu=()=>{ ctx.__blattStack().length=0; };
  ctx.zeigeBericht=b=>{ bericht=b; };
  return {ctx,meldungen,blaetter,bericht:()=>bericht};
}

/* ── HTML → lesbarer Text ── */
function text(html){ return String(html||"").replace(/<style[\s\S]*?<\/style>/g,"").replace(/<svg[\s\S]*?<\/svg>/g,"").replace(/<img[^>]*>/g,"")
  .replace(/<\/(p|div|h\d|li|tr|article|details|summary|section|label|button|option)>/g,"\n").replace(/<br\s*\/?>/g,"\n").replace(/<[^>]+>/g," ")
  .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&nbsp;/g," ").replace(/[ \t]+/g," ").replace(/\n\s*\n+/g,"\n").trim(); }
class KommandoFehler extends Error{}
const KF=m=>{ throw new KommandoFehler(m); };
const kl0=v=>Math.max(0,Math.min(1,v));
const N=(n,d=1)=>Number.isFinite(n)?Number(n).toFixed(d).replace(/\.0$/,""):"–";
const E=n=>Math.round(n)+" €";

/* ── Stand laden/sichern ── */
let RUECKFRAGE_JA=true;   /* v9.8: „rueckfrage nein“ beantwortet die Sicherheitsabfragen des Spiels mit NEIN */
function standLaden(datei){ if(fs.existsSync(datei)) return JSON.parse(fs.readFileSync(datei,"utf8")); return {S:null,rng:{a:1},log:[],befunde:[],notizen:[],aktionen:0}; }
function standSichern(datei,st){ fs.writeFileSync(datei,JSON.stringify(st)); }

/* ── Ausgaben ── */
function tierZeile(g,p){
  const S=g.ctx.__get(), w=g.ctx.effW(p);
  const b=g.ctx.buchtVon(p);
  const kap=(p.api||p.bucht)?g.ctx.mtokTagKapazitaet(p):0;
  const job=p.job?S.jobs.find(j=>j.id===p.job):null;
  return `${p.uid} ${p.name} [${p.api?"API":p.pT+"B"} ${p.api?"":p.quant} ${p.moe?"MoE ":""}ctx${p.ctx}k] ${p.status}${p.status==="job"&&job?` "${job.t}" ${(()=>{const r=g.ctx.hlRestStunden?g.ctx.hlRestStunden(job):null;return r?(r.heuteFertig?"wird heute Abend fertig":"noch ≈ "+N(r.std,1)+" h Arbeit"):"noch "+p.rest+" Tag(e)";})()}, Frist Tag ${job.team?job.team.frist:"?"}`:""}${p.status==="training"?` (${p.training?.id} ${p.training?.fokus}, noch ${p.rest} Tag(e)${p.training?.nurNacht?", Nacht-Rest "+N(p.training.nachtRest)+"h":""})`:""}`+
    ` · Bucht ${p.bucht||(p.api?"Cloud":"KEINE")}${b?" ("+g.ctx.GPUS[b.gpu].n+", "+g.ctx.vramPig(p)+"/"+g.ctx.GPUS[b.gpu].vram+" GB"+(g.ctx.offloaded(p)?" OFFLOAD":"")+")":""}`+
    ` · ${g.ctx.tokps(p)} tok/s · ${kap} Mtok/Tag · 👥${p.bucht?g.ctx.nutzerKapazitaet(p):p.api?"∞":0}`+
    ` · W: Log${w.logik} Code${w.code} Wis${w.wissen} Stil${w.schreiben} Wkz${w.werkzeug} Treu${w.treue} Ctx${w.kontext}`+
    ` · Zustand ${p.zustand} · Lvl ${p.level} (${p.xp} XP) · Eff ${g.ctx.effizienzIndex(p)} · Wert ${E(g.ctx.tierWert(p))}`+
    (p.denken?" · Denkmodus AN":p.rz>0?" · Denkmodus aus":"")+(p.temp!=="werk"?" · Temp "+p.temp:"")+(p.geschirr?" · Agenten-Tool "+p.geschirr:"")+
    (p.setups.length?" · Hilfsmittel "+p.setups.join("+"):"")+(p.adapters?.length?" · Adapter "+p.adapters.map(a=>a.n).join("+"):"")+
    (p.krank?" · 🤒 "+g.ctx.KRANKHEITEN[p.krank].n+" (Kur: "+g.ctx.KRANKHEITEN[p.krank].heilAktiv.n+" "+g.ctx.KRANKHEITEN[p.krank].heilAktiv.kosten+" €"+(g.ctx.KRANKHEITEN[p.krank].heilAktiv.futter?" + "+Object.entries(g.ctx.KRANKHEITEN[p.krank].heilAktiv.futter).map(([f,gb])=>gb+" GB "+f).join(", "):"")+")":"")+
    (p.contaminated?" · ⚠️KONTAMINIERT":"")+(p.spezialArt?" · 🎯Spezialist "+p.spezialArt:"")+(p.api?" · Lizenz noch "+(p.lizenzTage??7)+" Tage":"")+(p.nc?" · nc-Lizenz!":"");
}
function jobKandidaten(g,j){
  const S=g.ctx.__get(), rollen=g.ctx.hlRollen(j);
  const frei=S.tiere.filter(p=>p.status==="frei"&&(p.bucht||p.api));
  const zeilen=[];
  rollen.forEach((r,i)=>{
    const jj={...g.ctx.hlRollenJob(j,i),teile:i===rollen.length-1?j.teile:[],kontrolle:j.kontrolle};
    const k=frei.map(p=>{ const c=g.ctx.jobCheck(p,jj); const oe=g.ctx.jobOekonomie(p,jj);
      const bedarfMtok=jj.mtokTag*j.tage, kap=g.ctx.mtokTagKapazitaet(p,jj);
      const std=g.ctx.hlStunden(jj,c).std;   /* v9.8: dieselbe Stundenrechnung wie Pinnwand und Zusage */
      return `${p.uid}${c.ok?"✅":"❌"} Qualitätsprognose ${Math.round(c.erfolg)}% ⏱️${std<1?N(std*60,0)+"min":N(std,1)+"h"} (${N(kap)} Mtok/Tag) Kosten~${E(oe.kosten)}`+(c.gruende.length?" ["+c.gruende.join("; ")+"]":"")+(c.boni.length?" {+"+c.boni.map(b=>b.split(" (")[0]).join("; +")+"}":""); });
    zeilen.push(`   Stufe ${i+1} „${r.n}“ braucht ${Object.entries(r.anf).map(([k,v])=>g.ctx.WERTE[k]+"≥"+v).join(", ")}${j.agent?" · Agentenleistung≥40 (Werkzeug×Tool-Eignung, Agenten-Tool nötig)":""}${j.ctxMin?" · Kontext≥"+j.ctxMin+"k":""}${j.latenz?" · ≥"+j.latenz+" tok/s":""}: `+(k.length?k.join(" | "):"(kein freies Tier mit Bucht)"));
  });
  return zeilen.join("\n");
}
function jobZeile(g,j,kurz){
  const S=g.ctx.__get();
  const lohn=g.ctx.jobLohnGesamt(j), rollen=g.ctx.hlRollen(j);
  const alter=S.tag-(j.frisch||S.tag);
  const kopf=`${j.id} „${j.t}“ [${j.art} T${j.tier}${j.groesse?" "+j.groesse:""}${j.eil?" ⏱️EIL":""}${j.mikro?" mikro":""}${j.agent?" AGENT":""}${j.dsgvo?" 🔒lokal":""}${j.parallel?" 👥"+(j.nutzerMin||"")+" parallel":""}${j.liga?" 🏅LIGA":""}${j.zweiteChance?" 2.Chance":""}] ${E(lohn)} · ${j.tage} Arbeitstag(e) + ${j.puffer??1} Puffer (Frist ${(j.tage||1)+(j.puffer??1)} Tage) · ${N(j.mtokTag,3)} Mtok/Tag (${N(g.ctx.hlMtok(j),2)} gesamt) · ${g.ctx.jobEinheiten(j)} ${j.einheit||"Einheiten"}${rollen.length>1?" · "+rollen.length+" Stufen (Team möglich)":""}${(j.teile||[]).length?" · braucht "+j.teile.join("+"):""}${j.kunde?" · Kunde "+(g.ctx.KUNDEN[j.kunde]||{}).n:""} · hängt seit ${alter} Tag(en)${alter>=2?" (verfällt bald)":""}`;
  if(kurz) return kopf;
  return kopf+"\n   "+(j.b||"")+"\n"+jobChips(g,j)+jobKandidaten(g,j);
}
/* Ära 9: dieselben Kennzeichnungen wie an der Pinnwand (Team, Datenschutz, Fachwissen, Sektor, Komplexität) als Text */
function jobChips(g,j){
  const c=g.ctx, strip=h=>String(h||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim(); const z=[];
  try{ if(j.teamMax>1&&c.hlTeamChip) z.push("Team (teamMax "+j.teamMax+"): "+strip(c.hlTeamChip(j))); }catch(e){}
  try{ if(c.dsChip){ const d=strip(c.dsChip(j)); if(d) z.push("Datenschutz: "+d+(c.dsRisiko?" · Risiko-Stufe "+c.dsRisiko(j):"")); } }catch(e){}
  try{ if(c.fachAnforderung){ const f=c.fachAnforderung(j); if(f) z.push("🎓 Fachwissen "+((c.FACH_GEBIETE&&c.FACH_GEBIETE[f.gebiet]&&c.FACH_GEBIETE[f.gebiet].n)||f.gebiet)+" ≥ "+f.min); } }catch(e){}
  try{ if(j.sektor) z.push("Sektor: "+((c.BERUF_SEKTOREN&&c.BERUF_SEKTOREN[j.sektor])||j.sektor)+(j.beruf?" · Beruf "+j.beruf:"")); }catch(e){}
  try{ z.push(j.teamMax>1?"🏗️ komplex · "+j.tage+" Tage bei 1 Agent":c.hlRollen(j).length+" Stufe(n)"); }catch(e){}
  try{ if(j.dsgvo) z.push("🔒 nur lokal (kein Leih-Tier)"); if(j.mikro) z.push("Auch 0,6B-Spezialisten"); }catch(e){}
  try{ if(c.zsWendungChip){ const w=strip(c.zsWendungChip(j)); if(w) z.push("Wendung: "+w); } }catch(e){}
  return z.length?"   "+z.join("\n   ")+"\n":"";
}
function statusRoh(g){
  const S=g.ctx.__get(), lvl=g.ctx.hofLevel(), h=g.ctx.hlStand(), sb=g.ctx.saison();
  const frac=(S.tagMs||0)/g.ctx.TAG_MS, min=6*60+Math.round(frac*16*60);
  const out=[];
  out.push(`=== ${S.hofname} · Tag ${S.tag} (${sb.z} ${sb.n}, Tag ${((S.tag-1)%30)+1}/30) · Uhr ${String(Math.floor(min/60)).padStart(2,"0")}:${String(min%60).padStart(2,"0")} · Phase ${h.phase} · Wetter: ${g.ctx.hlEvent().z} ${g.ctx.hlEvent().n}`);
  out.push(`Kasse ${E(S.kredit)}${S.kredit<0?" (KREDIT, Limit "+g.ctx.KREDIT_LIMIT+")":""} · Stufe ${lvl.i} ${lvl.aktuell.n} (${S.xp} XP, nächste ${lvl.naechst?lvl.naechst.xp:"–"}) · Ruf ${g.ctx.rufSterne()}⭐ (${Math.round(S.ruf)}) · Meisterpunkte frei ${g.ctx.skillPunkteFrei()} · Fokus ${S.spezial||"gemischt"} · Schwierigkeit ${S.schwierig} · ${S.fuehrung}`);
  out.push(`Strom ${N(g.ctx.strompreis(),2)} €/kWh Tag · Nachfrage×${N(g.ctx.nachfrageFaktor(),2)} · GPU-Preis×${N(g.ctx.gpupreisFaktor(),2)} · Hof-Ereignisse: ${(S.events||[]).map(e=>e.n+" (noch "+e.effekt.tage+" T)").join(", ")||"keine"}`);
  out.push(`Daten (GB): ${Object.entries(S.daten).filter(([k,v])=>v>0).map(([k,v])=>k+" "+N(v)).join(", ")} · Datenlese heute ${S.leseTag===S.tag?"erledigt":"offen"}`);
  out.push(`Forschung: fertig [${Object.keys(S.forschung).filter(k=>S.forschung[k]).join(", ")||"–"}]${S.forschungAktiv?" · läuft: "+S.forschungAktiv.id+" (noch "+S.forschungAktiv.rest+" T)":""} · Skills [${Object.keys(S.skills||{}).join(", ")||"–"}]${S.meisterweg?" · Meisterweg "+S.meisterweg:""}`);
  out.push(`Wissenswerkstatt: ${Object.keys(h.teile).join("+")||"nichts"}${g.ctx.hlRagBereit()?" · Index "+(g.ctx.hlIndexAlter()===0?"aktuell":g.ctx.hlIndexAlter()+" T alt"):""} · Laufzeitumgebungen gekauft: ${Object.keys(S.stacks||{}).join(",")||"–"} · Hilfsmittel gekauft: ${Object.keys(S).filter(k=>k.startsWith("setup_")&&S[k]).map(k=>k.slice(6)).join(",")||"–"}`);
  out.push(`Buchten: `+S.buchten.map(b=>`${b.id}=${g.ctx.GPUS[b.gpu].n} (${g.ctx.GPUS[b.gpu].vram} GB, RAM ${b.ramGB}, Laufzeitumgebung ${g.ctx.stackId(b)}${(b.stackBereit||0)>S.tag?" rüstet":""}${b._wechselTag===S.tag?" Wechsel verbraucht":""}) → ${b.tier||"leer"}`).join(" · "));
  const rhv=g.ctx.rhVorschau(); const r=g.ctx.rh();
  if(g.ctx.rhAnschlussFrei) out.push(`Strom: Anschluss ${r.netzKW} kW · Last ${g.ctx.rhN(g.ctx.rhLast(),2)} kW · Eigenbonus ${g.ctx.rhN(g.ctx.rhEigenBonus(r),2)} kW · frei ${g.ctx.rhN(g.ctx.rhAnschlussFrei(r),2)} kW · Grundpreis ${E(r.netzKW*g.ctx.RH_STROM.leistungspreis)}/Tag`);
  out.push(`Rechenhaus: ${g.ctx.RH_STUFEN[r.stufe].name}${g.ctx.RH_STUFEN[r.stufe+1]?" (Umbau zu "+g.ctx.RH_STUFEN[r.stufe+1].name+" "+E(g.ctx.RH_STUFEN[r.stufe+1].preis)+", Kommando rhupgrade)":""} · Netz ${r.netzKW} kW · PV ${N(g.ctx.rhPV(r),2)} kWp · Wind ${g.ctx.rhWindKW(r)} kW · Akku ${r.akku} kWh (SoC ${N(r.soc)}) · Vorschau Tag+Nacht ${N(rhv.last)} kWh, Kosten ${N(rhv.kosten,2)} €, Eigen ${N((rhv.direkt||0)+(rhv.entladung||0))} kWh${rhv.fehl>0.01?" ⚠️ "+N(rhv.fehl)+" kWh UNVERSORGT":""}`);
  out.push(`Tiere (${S.tiere.length}):`); S.tiere.forEach(p=>out.push("  "+tierZeile(g,p)));
  const laufend=S.jobs.filter(j=>S.tiere.some(p=>p.job===j.id)), offen=S.jobs.filter(j=>!laufend.includes(j));
  if(laufend.length){ out.push("Laufende Aufträge:"); laufend.forEach(j=>out.push(`  ${j.id} „${j.t}“ ${g.ctx.hlAuftragStatus(j)} · ${E(g.ctx.jobLohnGesamt(j))} vereinbart · ${(()=>{const ids=Object.values(j.team?.wahl||{});const u=[...new Set(ids)];return u.length===1&&ids.length>1?"Solo "+u[0]+" ("+ids.length+" Stufen)":"Team "+u.join(",");})()}${j.kontrolle?" · Kontrollpaket":""}`)); }
  out.push(`Offene Zettel (${offen.length}):`); offen.forEach(j=>out.push("  "+jobZeile(g,j,true)));
  const q=g.ctx.QUESTS[S.questIdx]; if(q) out.push(`Hofziel: ${q.t} – ${q.hilfe} (+${q.pr} €, +${q.xp} XP)`);
  if(g.ctx.wocheAktiv&&g.ctx.wocheAktiv()){ const k=g.ctx.wocheKapitel(),nr=g.ctx.wocheKap?g.ctx.wocheKap():S.wocheKap||1; out.push(`Geführte Woche Kapitel ${nr}/7: ${k.z} ${k.t} – ${k.tipp} · Aufgaben: `+k.aufgaben.map(a=>{let ok=false; try{ok=!!a[1]();}catch(e){} return (ok?"✓ ":"○ ")+a[0];}).join(" · ")); }
  const pr=h.projekt; if(pr) out.push(`Hofprojekt: ${pr.id} ${pr.erledigt?"✓":"läuft"}`);
  out.push(`Serie ${h.serie} saubere Lieferungen (Best ${h.best}) · Aufträge gesamt ${S.statistik.jobs} · Trainings ${S.statistik.trainings} · Siege ${S.statistik.siege}`);
  return out.join("\n");
}
function berichtText(b){ if(!b) return "(kein Morgenbericht)"; return `--- Morgenbericht: +${E(b.einnahmen)} Einnahmen, −${E(b.ausgaben)} Ausgaben, ${b.kwh} kWh ---\n`+(b.event?`⚡ NEUES HOF-EREIGNIS: ${b.event.n} – ${b.event.txt}\n`:"")+b.zeilen.map(z=>"  "+z.t).join("\n")+((b.zeugnisse||[]).length?"\n  Zeugnisse: "+b.zeugnisse.map(z=>z.name+": "+z.titel+" → "+z.ausgang+" "+JSON.stringify(z.nachher)).join(" | "):""); }

function markt(g){
  const S=g.ctx.__get(), mt=g.ctx.maxTier(), out=[];
  out.push(`Marktlos (Tag ${S.marktLos?.tag}):`);
  (S.marktLos?.angebote||[]).forEach((a,i)=>{ const m=g.ctx.MODELLE[a.modell]; out.push(`  los ${i}: ${a.typ} ${m.n} (${a.modell}) ${E(a.preis)}${a.typ==="vortrainiert"?" "+g.ctx.WERTE[a.fokus]+"+"+a.plus:""}${a.typ==="spezialist"?" 🎯"+a.art:""}${a.rabatt?" −"+a.rabatt+"%":""}`); });
  out.push(`Katalog (kaufbar bis Tier ${mt}; "kaufen <id>"; Feilschen ${g.ctx.skillAktiv("feilschen")?"aktiv":"nein"}):`);
  Object.entries(g.ctx.MODELLE).filter(([id,m])=>m.tier<=mt).sort((a,b)=>a[1].preis-b[1].preis).forEach(([id,m])=>{
    const t=g.ctx.neuesTier(id); S.zaehler--; const v=g.ctx.vramPig(t);
    out.push(`  ${id}: ${m.n} T${m.tier} ${m.pT}B${m.moe?" MoE(A"+(m.pA||"")+")":""} ctx${m.ctx}k ${E(m.preis)} · VRAM bf16 ${v} GB · W: Log${m.w.logik} Code${m.w.code} Wis${m.w.wissen} Stil${m.w.schreiben} Wkz${m.w.werkzeug} Treu${m.w.treue} Ctx${m.w.kontext} · tc${m.tc} rz${m.rz}${m.nc?" nc-LIZENZ":""}${m.puzzle?" Rätsel":""}`); });
  out.push(`GPUs/Rechner (Rechenhaus): PC basis ${E(g.ctx.RH_PC.basis.preis)} (${g.ctx.RH_PC.basis.gpu}), gebraucht ${E(g.ctx.RH_PC.gebraucht.preis)} (rtx4090), max ${E(g.ctx.RH_PC.max.preis)} (rtx5090); Rack-Karten ab Nerdtempel: `+Object.entries(g.ctx.GPUS).filter(([id,x])=>x.tier>=2).map(([id,x])=>`${id} ${x.vram}GB ${E(Math.round(x.preis*g.ctx.gpupreisFaktor())+3500)}`).join(", "));
  if(g.ctx.istFrei("gebCloud")) out.push(`Cloud-Angebot (bis Tag ${S.cloudAngebot.tag+3}): `+S.cloudAngebot.ids.map(id=>{const m=g.ctx.LEIHMODELLE[id]; return `${id} ${m.n} ${E(g.ctx.lizenzPreis(m))}/7 Tage, ${m.inTok}/${m.outTok} $/Mtok, Limit ${m.limitMtok} Mtok/Tag, W: Log${m.w.logik} Code${m.w.code} Wis${m.w.wissen} Wkz${m.w.werkzeug} Treu${m.w.treue}`;}).join(" | "));
  else out.push("Cloud: erst ab Hofstufe 6 (gebCloud).");
  return out.join("\n");
}
function forschungListe(g){
  const S=g.ctx.__get(), out=["Forschung (forschen <id>; nur eine gleichzeitig):"];
  Object.entries(g.ctx.FORSCHUNG).forEach(([id,f])=>{ const fertig=!!S.forschung[f.frei]; const offen=(f.braucht||[]).filter(b=>!S.forschung[b]);
    out.push(`  ${id}: ${f.n} ${E(f.kosten)} ${f.tage}T ${fertig?"✓ fertig":offen.length?"(braucht "+offen.join(",")+")":"verfügbar"} – ${f.txt.slice(0,90)}`); });
  out.push(`Meisterschaften (skill <weg> <id>; frei: ${g.ctx.skillPunkteFrei()} Punkte; Meisterweg ${S.meisterweg||"noch keiner (ab Stufe 3: meisterweg <weg>)"}):`);
  Object.entries(g.ctx.SKILLS).forEach(([w,x])=>out.push(`  ${w}: `+x.skills.map(s=>`${s.id}${S.skills?.[s.id]?"✓":""}(${s.p}P${s.braucht?" nach "+s.braucht:""}${s.capstone?" MEISTER":""}): ${s.eff}`).join(" | ")));
  return out.join("\n");
}
function trainingInfo(g){
  const S=g.ctx.__get(), out=["Training (training <uid> <technik> <fokus> <futter> <bucht|cloud> [replay]):"];
  out.push("  Fokus: "+Object.keys(g.ctx.WERTE).join(",")+" · Futter: "+Object.keys(g.ctx.FUTTER).join(","));
  Object.entries(g.ctx.TECHNIKEN).forEach(([id,t])=>out.push(`  ${id}: ${t.n} ab Stufe ${t.lvl}${(g.ctx.FORSCHUNG&&g.ctx.FORSCHUNG[id]&&!g.ctx.forschungFrei(id))?" ✗ NICHT ERFORSCHT (forschen "+id+")":""}${t.forschung?" Forschung "+t.forschung+(g.ctx.forschungFrei(t.forschung)?"✓":"✗"):""} · VRAM-Faktor ${t.vramTrainFaktor}×pT · ${t.gpuStdProB} GPU-h/B · ${t.gbFaktor} GB/B · Risiken v${Math.round(t.risiko.vergessen*100)}% h${Math.round(t.risiko.hack*100)}% k${Math.round(t.risiko.kollaps*100)}%${t.adapter?" (Adapter)":""}`));
  S.tiere.filter(p=>!p.api).forEach(p=>{ const g2=g.ctx.gpuVon(p); out.push(`  ${p.uid} ${p.name}: `+Object.entries(g.ctx.TECHNIKEN).map(([id,t])=>{const k=g.ctx.trainingsKosten(p,t,"kuratiert",false); return `${id} VRAM${g.ctx.trainingsVramNoetig(p,t)}GB ${g2?g.ctx.trainingsDauer(p,t,g2)+"T":"keine Bucht"} ${k.gb}GB-Daten ${E(k.arbeit)}`;}).join(" | ")); });
  out.push("Zucht (zucht <methode> <uidA> <uidB>): "+Object.entries(g.ctx.ZUCHT).map(([id,z])=>`${id} ${z.n} ${E(z.kredit)}${z.forschung?" Forschung "+z.forschung:""}`).join(" | "));
  return out.join("\n");
}
function hofbuchText(g,arg){
  let html=""; try{ html=g.ctx.hofbuchHtml(); }catch(e){ return "Hofbuch-Fehler: "+e.message; }
  const t=text(html);
  if(!arg) return t.slice(0,6000)+(t.length>6000?"\n… (gekürzt; 'hofbuch <suchwort>' zeigt Treffer)":"");
  const zeilen=t.split("\n"), tr=[]; zeilen.forEach((z,i)=>{ if(z.toLowerCase().includes(arg.toLowerCase())) tr.push(zeilen.slice(Math.max(0,i-1),i+3).join("\n")); });
  return tr.slice(0,12).join("\n---\n")||"(kein Treffer)";
}

/* ── Kommandos ── */
const HILFE=`Kommandos (mehrere je Aufruf als getrennte Argumente; Ausgabe = echte Engine-Werte):
 neu seed=<n> [fokus=code|wissen|agent|gemischt] [schwierig=behuetet|hofalltag|markt] [fuehrung=gefuehrt|frei] [modelle=<id>,<id>] [name=<Text>]
 status | tiere | zettel | auftrag <jid> | markt | forschung | training | futter | kunden | stall | bericht | hofbuch [suchwort] | ui <zeigeFunktion> [arg] | log [n]
 annehmen <jid> <uid>[,<uid2>,...]   (1 uid = übernimmt alle Stufen; mehrere = je Stufe der Reihe nach)
 abbrechen <jid> (Auftrag zurückgeben, 12 % Strafe) · pruefen <uid> <jid> (3 €) · kontrolle <jid> (8 €/Tag umschalten) · projekt <id>
 kaufen <modellId> · los <i> · verkaufen <uid> · lizenz <id> · futter <id> <gb> · stack kaufen <id> · stack <bucht> <id> · bauteil <vector|embedding|ocr|reranker>
 pc <basis|gebraucht|max> [slot] · rack <slot> · rackkarte <slot> <gpuId> [node] · rh <solar|akku|wind|generator|nachbar|solarfeld> [i] · rhevent <i> · rhupgrade · pcupgrade <bucht>
 rein <uid> <bucht> · raus <uid> · quant <uid> <bf16|q8|q6|q5|q4|q3|q2> · setup <uid> <id> · geschirr <uid> <hid> · geschirrab <uid> · temp <uid> <praezise|werk|kreativ> · denken <uid> · kur <uid> · auffrischen <uid> · adapteran <uid> <i> · adapterab <uid> <i>
 forschen <id> · skill <weg> <id> · meisterweg <weg> · schwierig <id>
 training <uid> <technik> <fokus> <futter> <bucht|cloud> [replay] · zucht <methode> <uidA> <uidB>[,uidC] · synth <uid>
 lese (Runde starten, zeigt 8 Schnipsel) · lese sauber,doppel,leak,muell,sauber,sauber,doppel,muell  (EIN Argument: 8 Kategorien in Reihenfolge der Schnipsel) · arena <parcours> <uid> · agentenwelt <schueler> <lehrer|api:<id>> <geschirr> <uebung> · awstop
 nacht <uid> <ruhe|lora|qlora|sft|dpo|kto|synth|reindex|distill|ueberstunden|wartung|weiter> [fokus] [lehrerUid] · nacht gestern · nacht vorlage speichern|laden <name> · energie <uid> <auto|eigen>
 warten <stunden>  (Hofuhr vorspulen, 1–16 h; Aufträge, deren Restarbeit erledigt ist, werden sofort abgenommen – Tiere sind dann wieder frei)
 tag  (Tag beenden → Nachtschicht → Morgenbericht; Nachtpläne vorher mit 'nacht' setzen)
 dorfplatz (Übersicht der Minispiele) · mini <mini_token|mini_injection|mini_sampler|mini_vram|mini_preis> (Runde starten, zeigt Aufgabe) · mini antwort <feld> <i> <wert> (wie im Blatt angegeben) · mini auswerten · album
 befund <BUG|REGEL|BALANCE|UX|IDEE|LEHRE> <Text>   (Beobachtung für die Auswertung festhalten) · notiz <Text>\n rueckfrage <ja|nein>   (beantwortet die Sicherheitsabfragen des Spiels; Standard ja)
 entscheidung [<eid> <1..n>]   (offene Entscheidungs-Ereignisse zeigen bzw. eine Option wählen)\n mcp [<knoten>]   (MCP-Werkstatt: Baum zeigen bzw. Knoten anschließen, z. B. mcp stdio)`;

function ausfuehren(g,st,cmd){
  const ctx=g.ctx, S=()=>ctx.__get();
  const [op,...a]=cmd.trim().split(/\s+/); const rest=cmd.trim().slice(op.length).trim();
  const kv=Object.fromEntries(a.filter(x=>x.includes("=")).map(x=>x.split("=")));
  const tier=uid=>{ const p=S().tiere.find(t=>t.uid===uid); if(!p) KF("Unbekanntes Tier „"+uid+"“ – vorhandene: "+S().tiere.map(t=>t.uid).join(",")); return p; };
  const job=jid=>{ const j=S().jobs.find(x=>x.id===jid); if(!j) KF("Unbekannter Zettel „"+jid+"“ – offene: "+S().jobs.map(x=>x.id).join(",")); return j; };
  const geb=(key,txt)=>{ if(!ctx.istFrei(key)) KF(txt+" (im Spiel noch verschlossen: "+key+")"); };
  const forsch=(key,txt)=>{ if(!ctx.forschungFrei(key)) KF(txt+" – erst Forschung „"+key+"“ abschließen"); };
  switch(op){
    case "hilfe": return HILFE+"\n sag <Satz> · sag! <Satz>          – Hofsprecher (Ära 9): Werkzeug + Vorschau zeigen / ausführen (Wörterbuch-Stufe, ohne WebAssembly)\n mini hacker <spalte 0-6>          – Vier gewinnt gegen den Hacker: Stein setzen\n schulung [<uid> <gebiet> [kurs] [technik]] – Fachkurs (Zeit, Geld, Kuratiertes; Modell fällt aus); ohne Argument: Katalog\n annehmen <jid> <uid>,<uid>,...    – bei Team-Zetteln (teamMax) bestimmt die Anzahl der Tiere die Teamgröße";
    case "dev": if(process.env.SPIELBOT_DEV!=="1") KF("dev nur mit SPIELBOT_DEV=1"); return String(vm.runInContext(rest,ctx));
    case "neu":{
      if(kv.seed!==undefined){ const n=Number(kv.seed)||1; if(st.rng) st.rng.a=n; else st.rng={a:n}; }   /* v9.8 (Spieltest): seed= wirkte nie – jetzt startet der Zufall wirklich bei dieser Saat (st.rng ist genau das Objekt, das mulberry benutzt) */
      const s=ctx.frischerStand(); ctx.__set(s); ctx.rhMigration(s); ctx.hlStand();
      if(kv.seed!==undefined&&s.hofloop) s.hofloop.saat=Number(kv.seed)||1;   /* v9.8: auch die Zettelschmiede folgt der Saat */
      if(kv.name) s.hofname=kv.name;
      const e=ctx.__einf(); const kand=ctx.startKandidaten().map(x=>x[0]);
      e.wahl=(kv.modelle?kv.modelle.split(","):["qwen35-4b","smollm3-3b"]).filter(id=>kand.includes(id)).slice(0,2);
      if(e.wahl.length<2) e.wahl=kand.slice(0,2);
      e.spezial=kv.fokus||"gemischt"; e.schwierig=kv.schwierig||"hofalltag"; e.fuehrung=kv.fuehrung||"gefuehrt";
      s.jobs.push(ctx.jobNeu(),ctx.jobNeu(),ctx.jobNeu()); ctx.cloudRotieren(); ctx.marktLosNeu();
      ctx.willkommenFertig();
      return "Neuer Hof angelegt: "+s.hofname+" · Startmodelle "+e.wahl.join(", ")+" · Fokus "+e.spezial+"\n"+status(g); }
    case "status": return status(g);
    case "tiere": return S().tiere.map(p=>tierZeile(g,p)+(p.historie?.length?"\n     Historie: "+p.historie.slice(-3).map(h=>"T"+h.tag+" "+h.n+(h.detail?" "+h.detail:"")+(h.delta&&Object.keys(h.delta).length?" "+JSON.stringify(h.delta):"")+" → "+h.ausgang).join(" | "):"")).join("\n");
    case "zettel": return S().jobs.filter(j=>!S().tiere.some(p=>p.job===j.id)).map(j=>jobZeile(g,j,false)).join("\n")||"(keine offenen Zettel)";
    case "auftrag": { const j=job(a[0]);
      if(j.team){   /* v9.8 (Spieltest): ein laufender Zettel zeigt seinen Fortschritt, nicht die Kandidatenliste */
        const r=ctx.hlRestStunden(j), t=j.team, ps=[...new Set(Object.values(t.wahl))].map(u=>S().tiere.find(p=>p.uid===u)).filter(Boolean);
        const fertig=Math.round((1-t.mtokRest/Math.max(1e-6,t.mtokGesamt))*100);
        return jobZeile(g,j,true)+String.fromCharCode(10)+"   IN ARBEIT: "+fertig+" % fertig ("+N(t.mtokGesamt-t.mtokRest,2)+"/"+N(t.mtokGesamt,2)+" Mtok) · "+
          (r?(r.blockiert?"Team nicht einsatzfähig":r.heuteFertig?"wird heute abgenommen":"noch ≈ "+ctx.hlStundenText(r.std)+" Arbeit"):"–")+
          " · Uhr "+ctx.hlUhrText(ctx.hlUhrStunde())+" · Frist Tag "+t.frist+" (heute Tag "+S().tag+")"+
          " · Besetzung "+ps.map(p=>p.uid+" "+p.name).join(", ")+(t.zusageQuote?" · Zusage-Ampel "+(t.zusageQuote>1?"🔴":t.zusageQuote>0.8?"🟡":"🟢")+" "+Math.round(t.zusageQuote*100)+" % des Fristbudgets":""); }
      const chip=ctx.hlSchnellsteChip?String(ctx.hlSchnellsteChip(j)).replace(/<[^>]+>/g,"").trim():""; return jobZeile(g,j,false)+(chip?String.fromCharCode(10)+"   Machbarkeit (schnellstes freies Tier): "+chip:""); }
    case "markt": return markt(g);
    case "forschung": return forschungListe(g);
    case "training": if(!a.length) return trainingInfo(g);
      { geb("gebTraining","Der Trainingsplatz öffnet auf Hofstufe 2"); const tk=ctx.TECHNIKEN[a[1]]; if(!tk) KF("Unbekannte Technik – erlaubt: "+Object.keys(ctx.TECHNIKEN).join(",")); forsch(a[1],"Verfahren "+a[1]+" nicht erforscht"); if(ctx.hofLevel().i<(tk.lvl||1)) KF("Verfahren ab Hofstufe "+tk.lvl); if(!ctx.WERTE[a[2]]) KF("Unbekannter Fokus – erlaubt: "+Object.keys(ctx.WERTE).join(",")); if(!ctx.FUTTER[a[3]]) KF("Unbekanntes Futter – erlaubt: "+Object.keys(ctx.FUTTER).join(",")); const p=tier(a[0]); const ok=ctx.trainingStarten(p,a[1],a[2],a[3],a[4]); if(ok&&a[5]==="replay") p.training.replay=true; return ok?"Training gestartet: "+tierZeile(g,p):"Training NICHT gestartet."; }
    case "futter": if(!a.length){ try{ ctx.zeigeFutter(); }catch(e){} } if(!a.length) return "Lager: "+JSON.stringify(S().daten)+"\nSorten: "+Object.entries(ctx.FUTTER).map(([id,f])=>`${id} ${f.n} ${f.preisGB!=null?f.preisGB+" €/GB":"nicht kaufbar"} Q${Math.round(f.q*100)}%${f.lvl?" ab Stufe "+f.lvl:""}${f.contamination?" SCHWARZMARKT":""}`).join(" | ")+"\nSynthetik-Chargen: "+JSON.stringify(S().synthChargen||[]);
      ctx.futterKauf(a[0],Number(a[1])); return "Lager: "+JSON.stringify(S().daten);
    case "kunden": return Object.entries(S().kunden||{}).map(([id,k])=>`${(ctx.KUNDEN[id]||{}).n}: ${k.sterne==null?"unbewertet":k.sterne+"⭐"} · ${k.auftraege} Aufträge, gut ${k.gut}/schlecht ${k.schlecht}, Groll ${k.groll}`).join("\n")||"(noch keine Kunden)";
    case "stall": return S().buchten.map(b=>`${b.id}: ${ctx.GPUS[b.gpu].n} ${ctx.GPUS[b.gpu].vram} GB · ${ctx.GPUS[b.gpu].watt} W · RAM ${b.ramGB} GB · Slot ${b.rhSlot} · Laufzeitumgebung ${ctx.stackId(b)} (${(b.stackBereit||0)>S().tag?"rüstet bis Tag "+b.stackBereit:"bereit"}) · Tier ${b.tier||"leer"}`).join("\n")+"\nStacks: "+Object.entries(ctx.STACKS).map(([id,s])=>id+(s.preis?" "+E(s.preis):"")+(s.server?" (Server, Rack, Forschung vllm)":"")).join(", ")+"\nLager: "+JSON.stringify(ctx.rh().lager.map(b=>b.id+":"+b.gpu));
    case "bericht": return berichtText(S().letzterBericht);
    case "hofbuch": { S().flags=S().flags||{}; S().flags.hofbuch_gelesen=true; if(ctx.questHook) ctx.questHook("hofbuch_gelesen",null); return hofbuchText(g,rest); }
    case "ui":{ const fn=ctx[a[0]]; if(typeof fn!=="function") return "Keine Funktion "+a[0]; g.blaetter.length=0; fn(...a.slice(1)); const b=g.blaetter[g.blaetter.length-1]; return b?("["+b.titel+"]\n"+text(b.html).slice(0,7000)):"(kein Blatt geöffnet)"; }
    case "log": return st.log.slice(-(Number(a[0])||20)).map(l=>`T${l.tag} ${l.cmd} → ${l.out}`).join("\n");
    case "annehmen":{ const j=job(a[0]); const uids=a.slice(1).join(",").split(",").filter(Boolean); if(j.teamMax>1&&uids.length){ j.teamN=Math.max(1,Math.min(j.teamMax,uids.length)); } uids.forEach(u=>{ const p=tier(u); if(p.status!=="frei") KF(p.name+" ("+u+") ist beschäftigt: "+p.status); if(!p.bucht&&!p.api) KF(p.name+" ("+u+") hat keine GPU-Bucht – erst „rein "+u+" <bucht>“"); }); if(!uids.length) KF("Tier fehlt: annehmen <zettelId> <tierUid>[,<uid2>] – z. B. annehmen "+j.id+" "+(S().tiere[0]||{}).uid);
      const rollen=ctx.hlRollen(j); const w={}; rollen.forEach((r,i)=>{ w[i]=uids.length===1?uids[0]:(uids[i]||uids[uids.length-1]); });
      const c=ctx.hlTeamCheck(j,w); ctx.hlAuswahl?.[j.id]; ctx.__get(); /* Auswahl setzen wie in der UI */
      Object.keys(w).forEach(i=>ctx.hlWaehlen(j.id,Number(i),w[i]));
      ctx.hlTeamStart(j.id);
      const laeuft=!!j.team; return (laeuft?"✅ Angenommen: ":"❌ Nicht angenommen: ")+`${j.id} „${j.t}“ Qualitätsprognose ${Math.round(c.erfolg)}% · Tageskapazität ${Math.round(c.anteil*100)}%${laeuft?" · Frist Tag "+j.team.frist+" · "+E(j.vereinbart)+" vereinbart":""}`+(c.gruende.length?" · "+c.gruende.join("; "):"")+(c.warnungen.length?" · ⚠️ "+c.warnungen.join("; "):""); }
    case "abbrechen": job(a[0]); ctx.hlAbbrechen(a[0]); return "Kasse "+E(S().kredit)+" · offene Aufträge: "+S().jobs.filter(j=>j.team).map(j=>j.id).join(",");
    case "pruefen": { const vorherM=g.meldungen.length, vorherB=g.blaetter.length; ctx.hlPruefen(a[0],a[1]); const b=g.blaetter.length>vorherB?g.blaetter[g.blaetter.length-1]:null; return b?text(b.html).slice(0,1500):(g.meldungen.length>vorherM?g.meldungen.slice(vorherM).join(" | "):"Prüfung gebucht (3 €) – Ergebnis steht am Zettel (auftrag "+a[1]+")."); }
    case "kontrolle": ctx.hlKontrolle(a[0]); return "Kontrollpaket "+(job(a[0]).kontrolle?"AN":"AUS");
    case "projekt": ctx.hlProjektWaehlen(a[0]); return "Projekt: "+JSON.stringify(ctx.hlStand().projekt)+" · Angebote: "+ctx.hlProjektAngebote().map(p=>p.id+" ("+p.txt+" "+E(p.preis)+")").join(" | ");
    case "kaufen": if(ctx.LEIHMODELLE&&ctx.LEIHMODELLE[a[0]]) KF("„"+a[0]+"“ ist ein Leih-Tier aus der Cloud – dafür gilt „lizenz "+a[0]+"“ (Tage-Miete), nicht „kaufen“.");   /* v9.9 (R2) */ { const m=ctx.MODELLE[a[0]]; if(!m) KF("Unbekannte Modell-Id „"+a[0]+"“ – Ids stehen im Kommando „markt“ (z. B. smollm3-3b)"); if(m.tier>ctx.maxTier()) KF("Tier "+m.tier+" ist auf dem Markt noch nicht freigeschaltet (max. Tier "+ctx.maxTier()+")"); } ctx.modellKaufen(a[0]); return status(g).split("\n").filter(l=>l.startsWith("Kasse")||l.includes(a[0])).join("\n")+"\n"+S().tiere.slice(-1).map(p=>tierZeile(g,p)).join("");
    case "los": ctx.marktLosKaufen(Number(a[0])); return S().tiere.slice(-1).map(p=>tierZeile(g,p)).join("")+"\nKasse "+E(S().kredit);
    case "verkaufen": ctx.verkaufen(a[0]); return "Kasse "+E(S().kredit)+" · Tiere: "+S().tiere.map(p=>p.uid).join(",");
    case "lizenz": geb("gebCloud","Der Funkmast wird auf Hofstufe 6 gebaut"); if(!S().cloudAngebot.ids.includes(a[0])) KF("Nicht im aktuellen Cloud-Angebot: "+S().cloudAngebot.ids.join(",")); ctx.lizenzKaufen(a[0]); return S().tiere.slice(-1).map(p=>tierZeile(g,p)).join("")+"\nKasse "+E(S().kredit);
    case "stack": if(a[0]==="kaufen"){ ctx.stackKaufen(a[1]); return "Laufzeitumgebungen: "+JSON.stringify(S().stacks||{})+" Kasse "+E(S().kredit); } ctx.stackWechsel(a[0],a[1]); return ausfuehren(g,st,"stall");
    case "bauteil": ctx.hlBauteilKauf(a[0]); return "Wissenswerkstatt: "+JSON.stringify(ctx.hlStand().teile)+" · Index-Tag "+ctx.hlStand().indexTag+" · Kasse "+E(S().kredit)+"\n   Hinweis: Bausteine wirken erst, wenn ein Tier sie anschließt: setup <uid> rag (nach vector + embedding).";
    case "pc":{ if(!a[0]||!ctx.RH_PC[a[0]]) KF("Rechner-Variante angeben – Preise: "+Object.entries(ctx.RH_PC).map(([k,v])=>k+" "+E(v.preis)+" ("+v.gpu+")").join(", ")); const c=ctx.rhCfg(); let i=a[1]!=null?Number(a[1]):-1; if(i<0){ for(i=0;i<c.pc;i++) if(!S().buchten.some(b=>b.rhSlot==="pc:"+i)) break; } ctx.rhInstall("pc",i,a[0]); { const _r=(ausfuehren(g,st,"stall")); return _r+"\n   Buchten: "+S().buchten.map(b=>b.id+"="+(b.gpu||"?")+(b.tier?"("+b.tier+")":"(frei)")).join(", "); } }
    case "rack": ctx.rhInstall("rack",Number(a[0])); return "Racks: "+JSON.stringify(ctx.rh().racks)+" Kasse "+E(S().kredit);
    case "rackkarte": ctx.rhInstall("rack",Number(a[0]),a[1],Number(a[2]||0)); return ausfuehren(g,st,"stall");
    case "rh": ctx.rhKauf(a[0],a[1]!=null?Number(a[1]):0); return status(g).split("\n").filter(l=>l.startsWith("Rechenhaus")||l.startsWith("Kasse")).join("\n");
    case "rhevent": ctx.rhEvent(Number(a[0])); return "Events: "+JSON.stringify(ctx.rh().events)+" Netz "+ctx.rh().netzKW+" kW · Kasse "+E(S().kredit);
    case "rhupgrade": ctx.rhUpgrade(); return status(g).split("\n").filter(l=>l.startsWith("Rechenhaus")||l.startsWith("Kasse")||l.startsWith("Buchten")).join("\n");
    case "pcupgrade": ctx.rhPCUpgrade(a[0]); return ausfuehren(g,st,"stall");
    case "rein": tier(a[0]); if(!S().buchten.some(b=>b.id===a[1])) KF("Unbekannte Bucht „"+a[1]+"“ – vorhanden: "+S().buchten.map(b=>b.id).join(",")); ctx.inBucht(a[0],a[1]); return tierZeile(g,tier(a[0]));
    case "raus": ctx.ausBucht(a[0]); return tierZeile(g,tier(a[0]));
    case "quant": geb("gebWerkstatt","Die Werkstatt öffnet auf Hofstufe 3"); forsch("quant","Quantisierung"); ctx.quantSetzen(a[0],a[1]); return tierZeile(g,tier(a[0]));
    case "setup": if(!ctx.SETUPS[a[1]]) KF("Hilfsmittel: "+Object.keys(ctx.SETUPS).join(",")); ctx.setupUm(a[0],a[1]); return tierZeile(g,tier(a[0]));
    case "geschirr": { const hid=a[1]==="basis"?"hofgeschirr":a[1]; geb("gebGeschirr","Die Agentenwerkstatt steht ab Hofstufe 1 offen"); if(ctx.HARNESSE[hid]&&!ctx.HARNESSE[hid].basis) forsch("geschirr","Agentenwerkstatt (Spezial-Tools; das Basis-Tool geht ohne)"); if(!ctx.HARNESSE[hid]) KF("Unbekanntes Agenten-Tool: "+Object.keys(ctx.HARNESSE).join(",")); ctx.geschirrAnlegen(a[0],hid); return tierZeile(g,tier(a[0]))+" · Agentenleistung "+ctx.agentScore(tier(a[0]))+" · Eignung "+ctx.geschirrEignung(tier(a[0]),hid)+"%"; }
    case "geschirrab": ctx.geschirrAb(a[0]); return tierZeile(g,tier(a[0]));
    case "temp": ctx.tempSetzen(a[0],a[1]); return tierZeile(g,tier(a[0]));
    case "denken": ctx.denkenUm(a[0]); return tierZeile(g,tier(a[0]));
    case "kur": ctx.kurieren(a[0]); return tierZeile(g,tier(a[0]));
    case "auffrischen": ctx.auffrischen(a[0]); return tierZeile(g,tier(a[0]));
    case "adapteran": ctx.adapterAn(a[0],Number(a[1])); return tierZeile(g,tier(a[0]))+"\nSchrank: "+JSON.stringify(S().adapterSchrank||[]);
    case "adapterab": { const p=tier(a[0]); const i=Number(a[1]); if(!Number.isInteger(i)||i<0||i>=(p.adapters||[]).length) KF("adapterab <uid> <index 0.."+Math.max(0,(p.adapters||[]).length-1)+"> – "+p.name+" trägt "+(p.adapters||[]).length+" Adapter"); ctx.adapterAb(a[0],i); } return tierZeile(g,tier(a[0]))+"\nSchrank: "+JSON.stringify(S().adapterSchrank||[]);
    case "forschen": geb("gebForschung","Die Forschungshütte öffnet auf Hofstufe 2"); a[0]=String(a[0]||"").toLowerCase(); if(!ctx.FORSCHUNG[a[0]]){ const tr=Object.entries(ctx.FORSCHUNG).find(([id,f])=>f.n.toLowerCase().includes(a[0])); if(tr) a[0]=tr[0]; } if(!ctx.FORSCHUNG[a[0]]) KF("Unbekannte Forschung – Ids: "+Object.keys(ctx.FORSCHUNG).join(",")); { const f=ctx.FORSCHUNG[a[0]]; const fehlt=(f.braucht||[]).filter(b=>!S().forschung[b]); if(fehlt.length) KF("Braucht erst: "+fehlt.join(",")); if(S().forschung[f.frei]) KF("Schon erforscht"); } ctx.forschen(a[0]); return "Forschung aktiv: "+JSON.stringify(S().forschungAktiv)+" · Kasse "+E(S().kredit);
    case "skill": geb("gebForschung","Die Forschungshütte öffnet auf Hofstufe 2"); ctx.skillKaufen(a[0],a[1]); return "Skills: "+JSON.stringify(S().skills)+" · frei "+ctx.skillPunkteFrei();
    case "meisterweg": geb("gebForschung","Die Forschungshütte öffnet auf Hofstufe 2"); ctx.meisterwegWaehlen(a[0]); return "Meisterweg: "+S().meisterweg;
    case "schwierig": ctx.schwierigSetzen(a[0]); return "Schwierigkeit: "+S().schwierig;
    case "zucht":{ geb("gebZucht","Die Zuchtbucht öffnet auf Hofstufe 2"); forsch("merge","Zuchtbuch"); if(a[0]!=="slerp") forsch("merge_ties","Feine Zuchtauslese"); if(!ctx.ZUCHT[a[0]]) KF("Unbekannte Methode"); const ids=[a[1],...(a[2]||"").split(",")].filter(Boolean); const k=ctx.mergeKompatibel(tier(ids[0]),tier(ids[1]),a[0]); ctx.__zucht(a[0],ids); ctx.zuchtStart(); return "Kompatibel: "+JSON.stringify(k)+" · Status: "+ids.map(id=>id+"="+tier(id).status).join(","); }
    case "synth": ctx.synthProduzieren(a[0]); return tierZeile(g,tier(a[0]))+" · Lager synth "+N(S().daten.synth||0);
    case "lese":{ if(!a.length){ const vorher=g.meldungen.length; ctx.leseStart(); const l=ctx.__lese(); if(g.meldungen.length>vorher&&/Zu wenig|schon kuratiert|verfallen/.test(g.meldungen.slice(vorher).join(" "))){ if(ctx.__leseSet) ctx.__leseSet(null); return "(keine Runde gestartet)"; } if(!l) return "(keine Runde gestartet)"; return "Datenlese – 8 Schnipsel (antworte mit EINEM Argument, 8 Kategorien in Reihenfolge, z. B.: lese sauber,doppel,leak,muell,sauber,sauber,doppel,muell):\n"+l.karten.map((k,i)=>`  ${i+1}. ${k.t.replace(/\n/g," ⏎ ")}${l.hinweise.includes(i)?"  [🧼 Verdachtsfall]":""}`).join("\n"); }
      let l=ctx.__lese(); if(l&&l.fertig){ if(ctx.__leseSet) ctx.__leseSet(null); l=null; }   /* v9.8: eine abgeschlossene Runde ist keine offene Runde */
      if(!l){ ctx.leseStart(); l=ctx.__lese(); if(l&&l.fertig){ if(ctx.__leseSet) ctx.__leseSet(null); l=null; } }
      if(!l) KF("Keine offene Datenlese-Runde – heute schon gespielt: "+(S().leseTag===S().tag)+" (die Datenlese gibt es einmal je Hoftag)."); if(a[0].split(",").length!==8||a[0].split(",").some(k=>!["sauber","doppel","leak","muell"].includes(k.trim()))) KF("Antwort-Format: lese k1,...,k8 – genau 8 Werte aus sauber|doppel|leak|muell in Reihenfolge der Schnipsel, z. B. lese sauber,doppel,leak,muell,sauber,sauber,doppel,muell"); a[0].split(",").forEach((k,i)=>ctx.leseAntwort(i,k.trim())); ctx.leseFertig();
      return `Ergebnis ${l.fertig?.treffer}/8 → +${l.fertig?.ertrag} GB kuratiert. Auflösung: `+l.karten.map((k,i)=>`${i+1}=${k.k}${l.antworten[i]===k.k?"✓":"✗ ("+k.e.slice(0,60)+")"}`).join(" · "); }
    case "arena":{ geb("gebArena","Die Festwiese öffnet auf Hofstufe 3"); const pc=ctx.PARCOURS[a[0]]; if(!pc) KF("Parcours: "+Object.keys(ctx.PARCOURS).join(",")); if(ctx.hofLevel().i<pc.lvl) KF("Parcours ab Hofstufe "+pc.lvl); const p=tier(a[1]); if(p.status!=="frei"||!(p.bucht||p.api)) KF("Nur freie Tiere mit Bucht/Lizenz treten an"); ctx.__renn(a[0],a[1]); let t=0; ctx.performance.now=()=>t; ctx.requestAnimationFrame=fn=>{ t+=60; fn(); }; ctx.rennenStarten(); ctx.requestAnimationFrame=()=>{}; return "Ergebnis: "+text(g.ctx.document.getElementById("kommentar").innerHTML||"")+" · Kasse "+E(S().kredit)+" · Ruf "+ctx.rufSterne()+"⭐ · "+tierZeile(g,p); }
    case "agentenwelt": if(!ctx.agentenWeltFrei()) KF("Agenten-Welt braucht Forschung multiagent"); ctx.awStart(a[0],a[1],a[2],a[3]||"mail_formular"); return "Agenten-Welt: "+JSON.stringify(S().agentenWelt);
    case "awstop": ctx.awStop(); return "Agenten-Welt beendet.";
    case "nacht":{ if(a[0]==="gestern"){ ctx.hlNachtVorlage("gestern"); return "Nachtplan von gestern übernommen: "+JSON.stringify(S().hofloop.plan||{}); }
      if(a[0]==="vorlage"){ if(!["speichern","laden","loeschen"].includes(a[1])) KF("nacht vorlage speichern|laden|loeschen <name>"); ctx.hlNachtVorlage(a[1],a[2]||"Plan"); return "Vorlagen: "+Object.keys((S().hofloop.vorlagen)||{}).join(", ")+" · Plan: "+JSON.stringify(S().hofloop.plan||{}); }
      const p=tier(a[0]); if(!ctx.HL_NACHT[a[1]]&&a[1]!=="weiter") KF("Nachtaktion: "+Object.keys(ctx.HL_NACHT).join("|")+"|weiter"); if(a[2]&&!ctx.WERTE[a[2]]) KF("Fokus – erlaubt: "+Object.keys(ctx.WERTE).join(",")); ctx.hlNachtSet(a[0],"art",a[1]); if(a[2]) ctx.hlNachtSet(a[0],"fokus",a[2]); if(a[3]) ctx.hlNachtSet(a[0],"lehrer",a[3]); const q=ctx.hlNachtOption(p); const f=ctx.hlNachtPruefung(p,q); return `Nachtplan ${p.name}: ${JSON.stringify(q)} · ${N(ctx.hlNachtDauer(p,q))} GPU-h`+(f?" · ⚠️ "+f:" · ok"); }
    case "energie": { ctx.hlEnergieModus(a[0],a[1]); const r=ctx.rh(); const warn=(a[1]==="eigen"&&(r.akku||0)<=0&&!(r.wind||[]).length)?"\n⚠️ Ohne Akku und Wind steht das Tier nachts und bei Wolken still – die Frist läuft weiter.":""; return "Energie-Modi: "+JSON.stringify(ctx.hlStand().energie)+warn; }
    case "warten":{ if(a[0]==="abnahme"||a[0]==="feierabend"){ const n=a[0]==="abnahme"?ctx.hlWartenBisAbnahme():ctx.hlWartenFeierabend(); return "Uhr "+ctx.hlUhrText(ctx.hlUhrStunde())+" · "+n+" Auftrag/Aufträge sofort abgenommen"+(g.meldungen.length?"\n[Meldungen] "+g.meldungen.slice(-2).join(" | "):""); } const h=Math.max(0,Math.min(16,Number(a[0])||0)); if(!h) KF("Wie lange? „warten <1..16>“, „warten abnahme“ oder „warten feierabend“."); const n=ctx.hlWarten(h);   /* v9.8 (R2): dieselbe Uhr wie im Spiel statt eigener Rechnung im Treiber */ return "Uhr "+ctx.hlUhrText(ctx.hlUhrStunde())+" · "+n+" Auftrag/Aufträge sofort abgenommen"+(S()._tagFällig?"":"")+((S().tagMs||0)>=ctx.TAG_MS?" · ⏰ Tagesende erreicht – „tag“ beendet den Tag":"")+(g.meldungen.length?"\n[Meldungen] "+g.meldungen.slice(-2).join(" | "):""); }
    case "tag":{ if(ctx.dsGeschlossen&&ctx.dsGeschlossen()) return "⛔ Der Hof ist geschlossen (Tag "+S().geschlossen.tag+"): "+S().geschlossen.grund+" – Tage laufen nicht weiter. Neuanfang mit 'neu …'.";   /* v9.8 */
      const vorher=S().tag; ctx.tagBeenden(); const alt=ctx.setTimeout; ctx.setTimeout=fn=>{fn();return 0;}; let ok=false,hinweis=""; try{ ok=ctx.starteNachtSchicht(); if(!ok){ hinweis="⚠️ Nachtplan war ungültig ("+g.meldungen.slice(-1)[0]+") – Nacht lief ohne Zusatzarbeit. "; ctx.hlStand().plan={}; ctx.hlStand().phase="planung"; ok=ctx.starteNachtSchicht(); } } finally { ctx.setTimeout=alt; }
      if(!ok||S().tag===vorher){ ctx.hlZurueckTag(); return "❌ Tag NICHT beendet – siehe Meldungen."; }
      if(hinweis) g.meldungen.push(hinweis);
      return berichtText(S().letzterBericht)+"\n"+status(g); }
    case "dorfplatz":{ if(typeof ctx.zeigeDorfplatz!=="function") KF("Kein Dorfplatz in diesem Build"); g.blaetter.length=0; ctx.zeigeDorfplatz(); const b=g.blaetter[g.blaetter.length-1]; return b?text(b.html).slice(0,5000):"(leer)"; }
    case "album":{ g.blaetter.length=0; ctx.zeigeAlbum(); const b=g.blaetter[g.blaetter.length-1]; return b?text(b.html).slice(0,5000):"(leer)"; }
    case "mini":{ if(typeof ctx.miniStart!=="function") KF("Kein Dorfplatz in diesem Build"); g.blaetter.length=0;
      if(a[0]==="antwort"){ ctx.miniAntwort(a[1],Number(a[2]),isNaN(Number(a[3]))?a[3]:Number(a[3])); }
      else if(a[0]==="auswerten"){ ctx.miniAuswerten(); }
      else if(a[0]==="hacker"){ const offen=(typeof ctx.hackerOffen==="function")?ctx.hackerOffen():null;
        if(!offen) KF("Vier gewinnt gibt es nur am Tag eines Hacker-Angriffs – heute liegt keiner an (Angriffe ab Tag 6, Kunden mit mindestens 3 Aufträgen).");
        const akt=ctx.__miniAkt(); if(!akt||akt.id!=="mini_hacker"||akt.fertig) ctx.miniStart("mini_hacker");
        if(a[1]!=null){ const sp=Number(a[1]); if(!(sp>=0&&sp<=6)) KF("Spalte 0–6 wählen, z. B. „mini hacker 3“."); ctx.miniAntwort("s",sp); }
        else ctx.miniZeige(); }   /* v9.8: startet das Spiel, zeigt das Brett und erklärt, wenn kein Angriff läuft */
      else { ctx.miniStart(a[0]); }
      const b=g.blaetter[g.blaetter.length-1]; const knoepfe=b?[...b.html.matchAll(/miniAntwort\(([^)]*)\)/g)].map(m=>"mini antwort "+m[1].replace(/&quot;|&#39;|['"]/g,"").replace(/,/g," "))   /* v9.8: HTML-Entities im Knopf-Hinweis auflösen */:[]; return (b?text(b.html):"(kein Blatt)").slice(0,7000)+String.fromCharCode(10)+(knoepfe.length?"[Antwort-Kommandos] "+[...new Set(knoepfe)].join(" | ")+String.fromCharCode(10):"")+"[S.mini] "+JSON.stringify({streak:S().mini?.streak,gespielt:S().mini?.gespielt,quantGratis:S().mini?.quantGratis,lohnBonus:S().mini?.lohnBonus}); }
    case "sag": case "sag!": { if(typeof ctx.hsParsen!=="function") KF("Kein Hofsprecher in diesem Build"); const plan=ctx.hsParsen(rest); if(!plan) return "🪡 Nicht verstanden – Beispiele: "+ctx.HS_REGELN.beispiele.slice(0,6).join(" | "); const w=ctx.hsWerkzeug(plan.werkzeug); const vor=ctx.hsVorschauText(plan); if(op==="sag"&&w&&w.gefahr>0) return "Werkzeug: "+plan.werkzeug+" "+JSON.stringify(plan.args)+" ("+plan.sicherheit+", Gefahr "+w.gefahr+")\nVorschau: "+vor+"\n(ausführen mit: sag! "+rest+")"; const altT=ctx.setTimeout; ctx.setTimeout=fn=>{fn();return 0;};   /* v9.8 (Spieltest R2): die Nachtschicht endet im Spiel per Zeitgeber - im Treiber sofort ausfuehren, sonst bleibt sie in Phase "laeuft" stehen */ let r; try{ r=ctx.hsAusfuehren(plan); } finally { ctx.setTimeout=altT; } const nachbericht=(plan.werkzeug==="nacht_starten"&&S()&&S().letzterBericht)?"\n"+berichtText(S().letzterBericht):""; return "Werkzeug: "+plan.werkzeug+" "+JSON.stringify(plan.args)+"\n→ "+r+nachbericht; }
    case "schulung": { if(!a[0]) return "Fachgebiete: "+Object.entries(ctx.FACH_GEBIETE).map(([k,v])=>k+" ("+v.n+")").join(", ")+" · Kurse (Grundpreis, tatsächlich × Größenfaktor 1+0,05·Modellgröße in B): "+ctx.FACH_KURSE.map(k=>k.id+" "+k.tage+"T "+k.preis+"€ "+k.gb+"GB +"+k.gewinn).join(", ")+" · Preis je Tier: "+S().tiere.filter(p=>!p.api).map(p=>p.uid+" "+ctx.FACH_KURSE.map(k=>k.id+" "+ctx.fachKursKosten(p,k.id,"kurs","datenschutz").preis+"€").join("/")).join(" · ");   /* v9.8: echte Preise statt Grundpreise */ const p=tier(a[0]); const vorher=g.meldungen.length; const ok=ctx.fachSchulungStart(a[0],a[1]||"datenschutz",a[2],a[3]||"kurs"); if(!ok&&p.status!=="schulung") return "⛔ Kurs NICHT gebucht: "+(g.meldungen.slice(vorher).join(" | ")||"siehe Meldung")+" · "+tierZeile(g,p); return tierZeile(g,p)+" · Fachwissen: "+JSON.stringify(p.fach||{})+(p.schulung?" · im Kurs "+p.schulung.gebiet+"/"+p.schulung.kurs+" noch "+p.rest+" T":""); }
    case "rueckfrage": { const w=String(a[0]||"").toLowerCase(); if(w!=="ja"&&w!=="nein") return "rueckfrage ja | rueckfrage nein (aktuell: "+(RUECKFRAGE_JA===false?"nein":"ja")+")"; RUECKFRAGE_JA=(w==="ja"); return "Rückfragen werden ab jetzt mit "+w.toUpperCase()+" beantwortet."; }   /* v9.8 */
    case "entscheidung": {   /* v9.8 (Spieltest): Entscheidungs-Ereignisse ohne Umweg über den Hofsprecher */
      const off=(typeof ctx.ereignisOffen==="function")?ctx.ereignisOffen():[];
      if(!off.length) return "Keine offene Entscheidung.";
      if(!a.length) return off.map(e=>e.z+" "+e.id+" „"+e.n+"“ (noch "+(e.frist!=null?e.frist+" Tag(e)":"heute")+"): "+e.txt+String.fromCharCode(10)+e.optionen.map((o,i)=>"   "+(i+1)+") "+o.t+" – "+o.txt+" ["+(ctx.ereignisWahlText?ctx.ereignisWahlText(o):"")+"]").join(String.fromCharCode(10))).join(String.fromCharCode(10));
      const e=off.find(x=>x.id===a[0])||off[0]; const nr=Number(a[a.length-1]);
      if(!(nr>=1&&nr<=e.optionen.length)) KF("Option 1–"+e.optionen.length+" wählen, z. B. „entscheidung "+e.id+" 1“");
      const vorher=g.meldungen.length; ctx.ereignisEntscheiden(e.id,nr-1);
      return "Entschieden: "+e.n+" → „"+e.optionen[nr-1].t+"“ · "+(g.meldungen.slice(vorher).join(" | ")||"siehe Bericht"); }
    case "mcp": {   /* v9.9: MCP-Werkstatt */
      if(typeof ctx.mcpAlleKnoten!=="function") KF("Keine MCP-Werkstatt in diesem Build");
      if(!a[0]){ const st=ctx.mcpStand(); return "MCP-Werkstatt "+(ctx.mcpFrei()?"offen":"geschlossen (ab Hofstufe "+ctx.MCP_REGELN.freiAbStufe+" + Agentenwerkstatt)")+" · Agenten-Tool mit MCP: "+(ctx.mcpGeschirrOk()?"ja":"nein")+" · Anschlüsse: "+(ctx.mcpAnschluesse().join(",")||"keine")+(st.aktiv?" · läuft: "+st.aktiv.id+" ("+st.aktiv.rest+" T)":"")+String.fromCharCode(10)+ctx.MCP_ZWEIGE.map(z=>"  "+z.z+" "+z.n+": "+z.knoten.map(k=>k.id+"["+ctx.mcpStatus(k)+" "+k.kosten+"€/"+k.tage+"T"+(k.braucht.length?" nach "+k.braucht.join("+"):"")+"]").join(" · ")).join(String.fromCharCode(10))+String.fromCharCode(10)+"  Wirkungen: "+JSON.stringify(ctx.mcpEffekte()); }
      const k=ctx.mcpKnoten(a[0]); if(!k) KF("Unbekannter MCP-Knoten – Liste mit „mcp“");
      const vorher=g.meldungen.length; const ok=ctx.mcpStart(a[0]); return (ok?"🔌 gestartet: "+k.n+" ("+k.tage+" Tag(e))":"⛔ nicht gestartet: "+(g.meldungen.slice(vorher).join(" | ")||"siehe Meldung"))+" · Kasse "+E(S().kredit); }
    case "befund": st.befunde.push({tag:S()?.tag,art:a[0],text:rest.slice(a[0].length).trim()}); return "Befund notiert ("+st.befunde.length+").";
    case "notiz": st.notizen.push({tag:S()?.tag,text:rest}); return "Notiert.";
    default: KF("Unbekanntes Kommando „"+op+"“ – siehe „hilfe“");
  }
}

/* ── Hauptprogramm ── */
(function main(){
  const [datei,...cmds]=process.argv.slice(2);
  if(!datei||!cmds.length){ console.log(HILFE); process.exit(1); }
  const st=standLaden(datei);
  /* Eingefrorene Engine je Simulationsordner (engine.html neben den Ständen), damit ein Neubau des Spiels laufende Läufe nicht verändert */
  const eingefroren=path.join(path.dirname(path.resolve(datei)),"engine.html");
  const g=engineLaden(st.rng,fs.existsSync(eingefroren)?eingefroren:null);
  if(st.S) g.ctx.__set(g.ctx.standAuffuellen(st.S));
  if(st.lese) g.ctx.__leseSet(st.lese);
  if(st.miniAkt) g.ctx.__miniAktSetzen(st.miniAkt);
  const out=[];
  for(const cmd of cmds){
    g.meldungen.length=0; g.blaetter.length=0;
    let res, fehler=null;
    try{ if(!g.ctx.__get()&&cmd.split(/\s+/)[0]!=="neu"&&cmd!=="hilfe") KF("Kein Spielstand – zuerst 'neu seed=<n> …'"); res=ausfuehren(g,st,cmd); }
    catch(e){ fehler=e;
      if(e instanceof KommandoFehler){ res="⚠️ Eingabefehler: "+e.message; }
      else { res="💥 EXCEPTION (Engine-Fehler): "+e.message+String.fromCharCode(10)+String(e.stack||"").split(String.fromCharCode(10)).slice(1,4).join(String.fromCharCode(10)); st.befunde.push({tag:g.ctx.__get()?.tag,art:"EXCEPTION",text:cmd+" → "+e.message+" @ "+String(e.stack||"").split(String.fromCharCode(10))[1]}); } }
    const m=g.meldungen.length?"\n[Meldungen] "+g.meldungen.join(" | "):"";
    out.push("> "+cmd+"\n"+res+m);
    st.aktionen++;
    try{ const S0=g.ctx.__get(); if(S0){ st.S=JSON.parse(JSON.stringify(S0,(k,v)=>["el","schild","_liegt","_lz","_hops","_trink","_durst"].includes(k)?undefined:v)); st.lese=g.ctx.__lese()||null; st.miniAkt=g.ctx.__miniAkt()||null; standSichern(datei,st); } }catch(e){}   /* Stand nach JEDEM Kommando sichern */
    st.log.push({tag:g.ctx.__get()?.tag,cmd,out:(res||"").split("\n")[0].slice(0,160)+(m?" || "+g.meldungen.join(" | ").slice(0,200):""),fehler:fehler?String(fehler.message):undefined,kasse:g.ctx.__get()?.kredit});
    if(st.log.length>3000) st.log=st.log.slice(-2500);
  }
  const S=g.ctx.__get();
  if(S){ st.S=JSON.parse(JSON.stringify(S,(k,v)=>["el","schild","_liegt","_lz","_hops","_trink","_durst"].includes(k)?undefined:v));
    st.verlauf=st.verlauf||[]; const last=st.verlauf[st.verlauf.length-1]; if(!last||last.tag!==S.tag) st.verlauf.push({tag:S.tag,kasse:Math.round(S.kredit),xp:S.xp,stufe:g.ctx.hofLevel().i,ruf:Math.round(S.ruf),tiere:S.tiere.length,jobs:S.statistik.jobs}); }
  st.lese=g.ctx.__lese()||null;
  st.miniAkt=g.ctx.__miniAkt()||null;
  standSichern(datei,st);
  console.log(out.join("\n\n"));
})();
/* v9.8: Hofschließung steht über jedem Status */
function status(g){ const S=g.ctx.__get(); const c=g.ctx;
  let fin=""; try{ if(typeof c.finaleStand==="function"){ const st=c.finaleStand();
    fin="Ende: "+(st.gehabt&&st.gehabt.legende?"👑 Legende (Tag "+st.gehabt.legende.tag+")":st.gehabt&&st.gehabt.meister?"🏅 Hofmeisterbrief (Tag "+st.gehabt.meister.tag+"), Legende offen":"Hofstufe "+st.stufe+"/"+c.FINALE_REGELN.stufeMeister+", Lebenswerke "+st.erreicht.length+"/"+c.FINALE_REGELN.wegeMeister)+" · "+st.wege.map(w=>w.z+" "+w.n+" "+(w.ok?"✔":w.ist)).join(" | ")+String.fromCharCode(10); } }catch(e){}
  const zu=(g.ctx.dsGeschlossen&&g.ctx.dsGeschlossen())?"🚫 HOF GESCHLOSSEN (Tag "+S.geschlossen.tag+"): "+S.geschlossen.grund+" – keine Aufträge, keine Tage mehr; Neuanfang mit 'neu …'."+String.fromCharCode(10):""; return zu+fin+statusRoh(g); }
