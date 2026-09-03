/* ═════════════════════════════════════════════════════════
   Ära 9 · Hofsprecher – Klartext- und Sprachsteuerung (Spec: dev/NEEDLE_DESIGN.md, Teil A)
   ─────────────────────────────────────────────────────────
   Drei Stufen, immer mit Vorschau und Bestätigung:
     1. Wörterbuch-Parser (Deutsch, deterministisch, offline, getestet)
     2. Nadel = Needle 2 im Browser (Englisch am besten, Deutsch teilweise) – nur wenn Stufe 1 nichts findet
     3. Ada-Cloud (eigener OpenRouter-Schlüssel) für freie Fragen – unverändert in adaFrage()
   Kein Werkzeug verändert den Hof ohne Bestätigung; Nur-Anzeige-Werkzeuge laufen sofort.
   Alle Zahlen in der Vorschau kommen aus den Spielfunktionen, nie aus einem Modell.
   ═══════════════════════════════════════════════════════ */
const HS_REGELN={
  version:"Ära 9",
  stufen:["Wörterbuch (Deutsch, exakt, offline)","Nadel – Needle 2 im Browser (Englisch am besten)","Ada-Cloud (eigener Schlüssel, freie Fragen)"],
  gefahr:{0:"nur anzeigen",1:"kostet Geld oder verändert den Hof",2:"nicht rückgängig zu machen"},
  beispiele:["wie geht es dem Hof?","warte bis zur Abnahme","starte die Nacht","kauf zwei Solarmodule","wie wird das Wetter?","zeig die Zettel","nimm j12 mit t3 und t4 an","t2 soll heute Nacht LoRA trainieren","stell t3 auf Eigenstrom","erforsche Schutzregeln","kauf qwen35-4b","verkauf t5","beende den Tag","zeig das Hofbuch Strom"]
};
let _hs={plan:null,letzte:"",laeuft:false,nadelInfo:"",hoert:false,protokoll:[]};

/* ── Normalisierung & kleine Helfer ─────────────────────── */
function hsNorm(t){ return String(t||"").toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss").replace(/[„“”"'’!?.,;:()\[\]]/g," ").replace(/\s+/g," ").trim(); }
const HS_ZAHLEN={ein:1,eine:1,einen:1,eins:1,zwei:2,drei:3,vier:4,fuenf:5,sechs:6,sieben:7,acht:8,neun:9,zehn:10,elf:11,zwoelf:12,zwanzig:20,fuenfzig:50,hundert:100};
function hsZahl(t,std){
  const m=t.match(/(?:^|\s)(\d+(?:[.,]\d+)?)(?=\s|$|k\b|kw\b|gb\b)/); if(m) return parseFloat(m[1].replace(",","."));
  for(const w in HS_ZAHLEN){ if(new RegExp("(^|\\s)"+w+"(\\s|$)").test(t)) return HS_ZAHLEN[w]; }
  return std;
}
function hsIds(t,pre){ return [...t.matchAll(new RegExp("(?:^|\\s)("+pre+"\\d+)(?=\\s|$)","g"))].map(m=>m[1]); }
const hsW=(t,re)=>re.test(t);
function hsTier(uid){ return (S&&S.tiere||[]).find(p=>p.uid===uid)||null; }
function hsJob(id){ return (S&&S.jobs||[]).find(j=>j.id===id)||null; }
function hsTierIds(t){
  const ids=hsIds(t,"t"); if(ids.length) return ids;
  const out=[]; for(const p of (S&&S.tiere||[])){ const n=hsNorm(p.name); if(n&&n.length>=3&&new RegExp("(^|\\s)"+n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(\\s|$)").test(t)) out.push(p.uid); }
  return out;
}
/* längster Treffer von Id oder Name eines Katalogs im Satz (Leerzeichen, Punkte, Striche ignoriert) */
function hsFinde(t,katalog,min=3){
  if(!katalog) return null; const tt=t.replace(/[\s\-_.]/g,""); let best=null;
  for(const id in katalog){ const o=katalog[id]||{}, roh=String(o.n||""), name=hsNorm(roh);
    const klammer=[...roh.matchAll(/\(([^)]+)\)/g)].map(m=>hsNorm(m[1]));
    const kand=[String(id).toLowerCase(),name,...klammer].map(x=>x.replace(/[\s\-_.]/g,""));
    for(const c of kand){ if(c&&c.length>=min&&tt.includes(c)&&(!best||c.length>best.len)) best={id,len:c.length}; } }
  return best?best.id:null;
}
function hsOhneHtml(h){ return String(h||"").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim(); }
function hsGeld(n){ return (typeof geld==="function")?geld(n):(Math.round(n)+" €"); }

/* ── Werkzeugkatalog ─────────────────────────────────────
   id (deutsch, für Parser/Treiber) · en (für Needle) · params {name:{type,enum?,items?}} · gefahr 0/1/2
   pruefen(args) → {ok,args,grund} · vorschau(args) → Text · ausfuehren(args) → Text ── */
/* v9.8 (Spieltest): gemeinsame Planung für Prüfung und Vorschau von „annehmen“ – dieselben Zahlen wie hlTeamStart */
function hsAnnehmenPlan(a){ const original=hsJob(a.zettel),j={...original}; const tiere=(a.tiere||[]).map(String); if(j.teamMax>1) j.teamN=Math.max(1,Math.min(j.teamMax,tiere.length));
  const rollen=hlRollen(j),w={}; rollen.forEach((r,i)=>{ w[i]=tiere.length===1?tiere[0]:(tiere[i]||tiere[tiere.length-1]); });
  const c=hlTeamCheck(j,w); const st=c.ok?hlStunden(j,c):{std:0,tage:0}; const budget=hlFristBudget(j), quote=c.ok?st.std/Math.max(1,budget):0;
  return {j,rollen,w,c,st,budget,quote,tiere:c.ids?c.ids.map(id=>hsTier(id)).filter(Boolean):[]}; }
const HS_WERKZEUGE=[
 {id:"hilfe",en:"help",n:"Hilfe",z:"❓",desc:"Show what the farm speaker can do, with example sentences.",params:{},gefahr:0,
  vorschau:()=>"Beispiele: "+HS_REGELN.beispiele.join(" · "),
  ausfuehren:()=>"Ich verstehe Sätze wie: "+HS_REGELN.beispiele.map(b=>"„"+b+"“").join(", ")+". Zuerst zeige ich immer eine Vorschau – erst dein „Machen“ verändert den Hof."},
 {id:"status",en:"show_status",n:"Hofstatus",z:"🏡",desc:"Show the farm status: cash, day, level, reputation, animals, open job notes.",params:{},gefahr:0,
  vorschau:()=>"", ausfuehren:()=>{ const l=hofLevel(); const offen=(S.jobs||[]).filter(j=>!j.team).length;
   return "Tag "+S.tag+" · Kasse "+hsGeld(S.kredit)+" · Stufe "+l.i+" "+((l.aktuell||{}).n||"")+" · Ruf "+rufSterne()+"⭐ · "+(S.tiere||[]).length+" Tiere ("+(S.tiere||[]).filter(p=>p.status==="job").length+" im Auftrag) · "+offen+" offene Zettel"+((typeof finaleStand==="function")?(function(){ const st=finaleStand(); return " · Ende: "+(st.gehabt&&st.gehabt.legende?"👑 Legende":st.gehabt&&st.gehabt.meister?"🏅 Hofmeisterbrief":"Stufe "+st.stufe+"/"+FINALE_REGELN.stufeMeister+", Lebenswerke "+st.erreicht.length+"/"+FINALE_REGELN.wegeMeister)+" ("+st.wege.map(w=>w.z+(w.ok?"✔":"")).join(" ")+")"; })():""); }},
 {id:"kassenbuch",en:"show_cashbook",n:"Kassenbuch",z:"💶",desc:"Show the cashbook with income and expenses.",params:{},gefahr:0,
  vorschau:()=>"", ausfuehren:()=>{ const heute=(S.journal||[]).filter(e=>e.tag===S.tag); const ein=heute.filter(e=>e.b>0).reduce((a,e)=>a+e.b,0), aus=heute.filter(e=>e.b<0).reduce((a,e)=>a-e.b,0);
   try{ oeffne("hofhaus"); }catch(e){} return "Kasse "+hsGeld(S.kredit)+" · heute +"+hsGeld(ein)+" / −"+hsGeld(aus)+" · Gesamt: Einnahmen "+hsGeld(S.statistik.einnahmen||0)+", Ausgaben "+hsGeld(S.statistik.ausgaben||0)+". Das Kassenbuch steht im Hofhaus."; }},
 {id:"wetterbericht",en:"show_weather_forecast",n:"Wetterbericht",z:"🌦️",desc:"Show the weather forecast (sun and wind factors) for the next days, for solar planning.",params:{tage:{type:"integer"}},gefahr:0,
  pruefen:a=>({ok:true,args:{tage:Math.max(1,Math.min(5,Math.round(a.tage||3)))}}),
  vorschau:()=>"", ausfuehren:a=>{ let zeilen=[];
   if(typeof rhWetterbericht==="function"){ try{ zeilen=(rhWetterbericht(a.tage)||[]).map(w=>(w.z||"")+" "+(w.tag===S.tag?"heute":w.tag===S.tag+1?"morgen":"Tag "+w.tag)+": "+w.name+" · Solar ×"+Number(w.pvF).toFixed(2)+" · Wind ×"+Number(w.windF).toFixed(2)+(w.tipp?" – "+w.tipp:"")); }catch(e){ zeilen=[]; } }
   if(!zeilen.length&&typeof rhPrognose==="function"){ try{ zeilen=rhPrognose(a.tage).map(p=>(p.tag===S.tag+1?"morgen":"Tag "+p.tag)+": "+p.n+" · Solar ×"+Number(p.pvF).toFixed(2)+" · Wind ×"+Number(p.windF).toFixed(2)); }catch(e){} }
   return zeilen.length?"Wetterbericht (Spielwetter, exakt): "+zeilen.join(" · "):"Kein Wetterbericht verfügbar."; }},
 {id:"zettel_zeigen",en:"show_job_notes",n:"Zettel zeigen",z:"📌",desc:"Show the open job notes on the pinboard.",params:{},gefahr:0,
  vorschau:()=>"", ausfuehren:()=>{ const offen=(S.jobs||[]).filter(j=>!j.team); try{ oeffne("jobs"); }catch(e){}
   return offen.length?"Offene Zettel: "+offen.map(j=>j.id+" „"+j.t+"“ ("+hsGeld(jobLohnGesamt(j))+", "+j.tage+" Tage)").join(" · "):"Keine offenen Zettel."; }},
 {id:"auftrag_zeigen",en:"show_job",n:"Auftrag ansehen",z:"🔍",desc:"Open one job note by its id (like j12) and compare the animals for it.",params:{zettel:{type:"string"}},gefahr:0,
  pruefen:a=>hsJob(a.zettel)?{ok:true,args:a}:{ok:false,grund:"Zettel „"+a.zettel+"“ hängt nicht an der Pinnwand."},
  vorschau:()=>"", ausfuehren:a=>{ const j=hsJob(a.zettel); try{ zeigeAuftrag(j.id); }catch(e){} const chip=(typeof hlSchnellsteChip==="function"&&!j.team)?hsOhneHtml(hlSchnellsteChip(j)):"";
   return j.id+" „"+j.t+"“ · "+hsGeld(jobLohnGesamt(j))+" · "+j.tage+" Tage · "+hlRollen(j).length+" Stufe(n)"+(chip?" · Machbarkeit: "+chip:""); }},
 {id:"annehmen",en:"accept_job",n:"Zettel annehmen",z:"✅",desc:"Accept a job note from the pinboard with the given animals (ids like t3).",params:{zettel:{type:"string"},tiere:{type:"array",items:{type:"string"}}},gefahr:1,
 pruefen:a=>{ const j=hsJob(a.zettel); if(!j) return {ok:false,grund:"Zettel „"+a.zettel+"“ gibt es nicht."}; if(j.team) return {ok:false,grund:"Der Zettel läuft schon."};
   const tiere=(a.tiere||[]).map(String); if(!tiere.length) return {ok:false,grund:"Welches Tier soll ran? Beispiel: „nimm "+j.id+" mit t1 an“."};
   if(new Set(tiere).size!==tiere.length) return {ok:false,grund:"Jede Teamrolle braucht ein eigenes Tier – eine Tier-ID darf nicht doppelt vorkommen."};
   for(const u of tiere){ const p=hsTier(u); if(!p) return {ok:false,grund:"Tier „"+u+"“ gibt es nicht."}; if(p.status!=="frei") return {ok:false,grund:p.name+" ist beschäftigt ("+p.status+")."}; if(!p.bucht&&!p.api) return {ok:false,grund:p.name+" hat keine GPU-Bucht."}; }
   const pl=hsAnnehmenPlan({zettel:j.id,tiere}); if(!pl.c.ok) return {ok:false,grund:pl.c.gruende[0]||"Team erfüllt die Anforderungen nicht."};
   if(pl.quote>2) return {ok:false,grund:"Aussichtslos: ≈ "+hlStundenText(pl.st.std)+" Arbeit gegen "+pl.budget+" h Fristbudget – so würde jeder Tag nur Strafe kosten. Schnelleres Tier, kleineres Los oder Team."};   /* v9.8: wie hlTeamStart */
   return {ok:true,args:{zettel:j.id,tiere}}; },
  vorschau:a=>{ const pl=hsAnnehmenPlan(a),j=pl.j,c=pl.c,w=pl.w,rollen=pl.rollen;
   const ampel=pl.quote>2?"⛔ Aussichtslos":pl.quote>1?"🔴 Fristbruch droht (12 % Strafe)":pl.quote>0.8?"🟡 knapp":"🟢 mit Reserve";
   const ds=(typeof dsWahrscheinlichkeit==="function")?dsWahrscheinlichkeit(j,pl.tiere):null;
   return "„"+j.t+"“ · "+hsGeld(jobLohnGesamt(j))+" · ≈ "+hlStundenText(pl.st.std)+" Arbeit von "+pl.budget+" h Fristbudget ("+Math.round(pl.quote*100)+" %) "+ampel+" · Qualitätsprognose "+Math.round(c.erfolg)+" % · Tageskapazität "+Math.round((c.anteil||0)*100)+" %"+(ds&&ds.p>0?" · 🛡️ Datenschutz-Risiko "+Math.round(ds.p*100)+" % ("+ds.offen.map(p=>p.name).join(", ")+" ohne Schulung/Agenten-Tool mit Schutzfunktionen)":"")+(c.gruende.length?" · ⛔ "+c.gruende.join("; "):"")+(c.warnungen&&c.warnungen.length?" · ⚠️ "+c.warnungen.join("; "):"")+" · Besetzung: "+rollen.map((r,i)=>r.n+" → "+(hsTier(w[i])||{}).name).join(", "); },   /* v9.8: Ampel, Fristbudget und Datenschutz wie an der Pinnwand */
  ausfuehren:a=>{ const j=hsJob(a.zettel); if(j.teamMax>1) j.teamN=Math.max(1,Math.min(j.teamMax,a.tiere.length)); const rollen=hlRollen(j),w={}; rollen.forEach((r,i)=>{ w[i]=a.tiere.length===1?a.tiere[0]:(a.tiere[i]||a.tiere[a.tiere.length-1]); });
   Object.keys(w).forEach(i=>hlWaehlen(j.id,Number(i),w[i])); hlTeamStart(j.id); return j.team?"Angenommen: „"+j.t+"“ – Frist Tag "+j.team.frist+", "+hsGeld(j.vereinbart)+" vereinbart.":"Nicht angenommen – siehe Meldung."; }},
 {id:"abbrechen",en:"cancel_job",n:"Auftrag zurückgeben",z:"↩️",desc:"Return a running job (penalty 12 percent).",params:{zettel:{type:"string"}},gefahr:2,
  pruefen:a=>{ const j=hsJob(a.zettel); return (j&&j.team)?{ok:true,args:{zettel:j.id}}:{ok:false,grund:"Kein laufender Auftrag „"+a.zettel+"“."}; },
  vorschau:a=>{ const j=hsJob(a.zettel); return "„"+j.t+"“ zurückgeben: 12 % Vertragsstrafe ("+hsGeld(Math.round((j.vereinbart||0)*0.12))+"), Kundenbewertung leidet, Serie endet."; },
  ausfuehren:a=>{ hlAbbrechen(a.zettel); return "Auftrag zurückgegeben. Kasse "+hsGeld(S.kredit)+"."; }},
 {id:"nacht_starten",en:"start_night",n:"Nacht starten",z:"🌃",desc:"Start the night shift after the night planning is open: the day ends, night actions run, the morning report follows.",params:{},gefahr:1,
  pruefen:()=>{ const h=hlStand(); if(h.phase!=="planung") return {ok:false,grund:"Die Nachtplanung ist noch nicht offen – erst „Tag beenden“."}; return {ok:true,args:{}}; },
  vorschau:()=>{ const plan=Object.keys(hlStand().plan||{}).length, l=(S.tiere||[]).filter(p=>p.status==="job").length; return "Beendet Tag "+S.tag+": "+plan+" Nachtaktion(en) laufen, "+l+" Tier(e) im Auftrag arbeiten morgen weiter. Danach kommt der Morgenbericht von Tag "+(S.tag+1)+"."; },
  ausfuehren:()=>{ const ok=starteNachtSchicht(); return ok?"Nacht gestartet – der Morgenbericht folgt.":"Nacht nicht gestartet – siehe Meldung (ungültiger Nachtplan?)."; }},
 {id:"zurueck_tag",en:"back_to_day",n:"Zurück zum Tag",z:"☀️",desc:"Close the night planning and return to the running day.",params:{},gefahr:0,
  pruefen:()=>hlStand().phase==="planung"?{ok:true,args:{}}:{ok:false,grund:"Die Nachtplanung ist nicht offen."},
  vorschau:()=>"Schließt die Nachtplanung, der Tag läuft weiter (Hofuhr "+hlUhrText(hlUhrStunde())+").",
  ausfuehren:()=>{ hlZurueckTag(); return "Zurück im Tag."; }},
 {id:"tag_beenden",en:"end_day",n:"Tag beenden",z:"🌙",desc:"End the current farm day and open the night planning.",params:{},gefahr:1,
  pruefen:()=>{ const h=hlStand(); return h.phase==="tag"?{ok:true,args:{}}:{ok:false,grund:"Die Nachtplanung ist schon offen – dort „Nacht starten“."}; },
  vorschau:()=>{ const l=(S.tiere||[]).filter(p=>p.status==="job").length; const plan=Object.keys(hlStand().plan||{}).length; return "Öffnet die Nachtplanung: "+l+" Tier(e) im Auftrag arbeiten weiter, "+plan+" Nachtaktion(en) geplant. Der Tag endet erst mit „Nacht starten“."; },
  ausfuehren:()=>{ tagBeenden(); return "Nachtplanung geöffnet – Aktionen wählen und „Nacht starten“."; }},
 {id:"nacht_planen",en:"plan_night",n:"Nacht planen",z:"🌙",desc:"Plan a night action for an animal: rest, lora, qlora, sft, dpo, kto, synth, reindex, overtime, maintenance, distill.",params:{tier:{type:"string"},art:{type:"string",enum:["ruhe","lora","qlora","sft","dpo","kto","synth","reindex","ueberstunden","wartung","distill"]},fokus:{type:"string"}},gefahr:1,
  pruefen:a=>{ const p=hsTier(a.tier); if(!p) return {ok:false,grund:"Tier „"+a.tier+"“ gibt es nicht."}; const art=String(a.art||"").toLowerCase(); if(!HL_NACHT[art]) return {ok:false,grund:"Unbekannte Nachtaktion „"+art+"“ – möglich: "+Object.keys(HL_NACHT).join(", ")};
   const fokus=a.fokus&&WERTE[a.fokus]?a.fokus:null; return {ok:true,args:{tier:p.uid,art,fokus}}; },
  vorschau:a=>{ const p=hsTier(a.tier),n=HL_NACHT[a.art]; let hinweis=""; try{ const q={...((hlStand().plan||{})[p.uid]||{}),art:a.art,fokus:a.fokus||undefined}; const r=hlNachtPruefung(p,q); if(typeof r==="string") hinweis=r; else if(r&&r.grund) hinweis=r.grund; else if(r===false) hinweis="derzeit nicht möglich"; }catch(e){}
   return p.name+" → "+n.n+(n.stunden?" ("+n.stunden+" h)":"")+(a.fokus?" · Fokus "+WERTE[a.fokus]:"")+(n.lvl?" · ab Hofstufe "+n.lvl:"")+(hinweis?" · ⚠️ "+hinweis:"")+". Läuft in der nächsten Nacht (Tag beenden → Nacht starten)."; },
  ausfuehren:a=>{ hlNachtSet(a.tier,"art",a.art); if(a.fokus) hlNachtSet(a.tier,"fokus",a.fokus); const q=(hlStand().plan||{})[a.tier]; return q&&q.art===a.art?"Nachtplan gesetzt: "+hsTier(a.tier).name+" → "+HL_NACHT[a.art].n+".":"Nachtplan nicht gesetzt – siehe Meldung."; }},
 {id:"nacht_gestern",en:"repeat_last_night",n:"Nacht wie gestern",z:"🔁",desc:"Take over yesterday's night plan for tonight.",params:{},gefahr:1,
  vorschau:()=>{ const h=hlStand(); const n=Object.keys(h.letzterPlan||{}).length; return n?"Übernimmt den Plan von gestern ("+n+" Tier(e)). Ungültige Einträge werden beim Nachtstart abgelehnt.":"Es gibt noch keinen Plan von gestern."; },
  ausfuehren:()=>{ hlNachtVorlage("gestern"); return "Nachtplan von gestern übernommen: "+Object.keys(hlStand().plan||{}).length+" Tier(e)."; }},
 {id:"energie_modus",en:"set_energy_mode",n:"Energiemodus",z:"⚡",desc:"Set the energy mode of an animal to auto or own (own renewable power only).",params:{tier:{type:"string"},modus:{type:"string",enum:["auto","eigen"]}},gefahr:1,
  pruefen:a=>{ const p=hsTier(a.tier); if(!p) return {ok:false,grund:"Tier „"+a.tier+"“ gibt es nicht."}; const m=(a.modus==="own"||a.modus==="eigen")?"eigen":"auto"; if(m==="eigen"&&typeof hlEnergieFrei==="function"&&!hlEnergieFrei()) return {ok:false,grund:"Eigenstromplanung wird auf Hofstufe 8 oder mit einer eigenen Energieanlage freigeschaltet."}; return {ok:true,args:{tier:p.uid,modus:m}}; },
  vorschau:a=>{ const p=hsTier(a.tier),jetzt=(hlStand().energie||{})[p.uid]||"auto"; const frei=(typeof hlEnergieFrei==="function")?hlEnergieFrei():true; const r=(typeof rh==="function")?rh():{};
   return p.name+": "+jetzt+" → "+a.modus+(a.modus==="eigen"?" – bekommt Sonne/Wind/Akku zuerst und PAUSIERT bei Unterdeckung (Frist läuft weiter)."+(!frei?" ⛔ Erst ab Hofstufe 8 oder mit eigener Anlage.":"")+(((r.akku||0)<=0&&!(r.wind||[]).length)?" ⚠️ Ohne Akku und Wind steht das Tier nachts und bei Wolken still.":""):" – nimmt fehlenden Strom vom Netz."); },
  ausfuehren:a=>{ hlEnergieModus(a.tier,a.modus); return "Energiemodus von "+hsTier(a.tier).name+": "+((hlStand().energie||{})[a.tier]||"auto")+"."; }},
 {id:"solar_kaufen",en:"buy_solar",n:"Solarmodul kaufen",z:"☀️",desc:"Buy solar panels for the farm roof.",params:{anzahl:{type:"integer"}},gefahr:1,
  pruefen:a=>{ const anzahl=Math.max(1,Math.min(12,Math.round(a.anzahl||1))); if(!istFrei("gebEnergie")) return {ok:false,grund:"Der Energiegarten öffnet auf Hofstufe 8."}; const r=rh(),c=rhCfg(),n=Math.min(anzahl,Math.max(0,c.dach-r.pv.length)); if(!n) return {ok:false,grund:"Das Dach ist voll ("+c.dach+" Plätze)."}; const preis=(c.wp===400?45:60)*n; if(!kannZahlen(preis)) return {ok:false,grund:"Für "+n+" Solarmodul(e) fehlen "+hsGeld(preis)+"."}; return {ok:true,args:{anzahl:n}}; },
  vorschau:a=>{ const r=rh(),c=rhCfg(),frei=Math.max(0,c.dach-r.pv.length),n=Math.min(a.anzahl,frei),preis=(c.wp===400?45:60)*n; return n?n+" Modul(e) à "+(c.wp===400?45:60)+" € = "+hsGeld(preis)+" ("+c.wp+" Wp je Modul, "+frei+" freie Dachplätze, Kasse "+hsGeld(S.kredit)+")"+(!kannZahlen(preis)?" ⛔ reicht nicht":""):"⛔ Das Dach ist voll ("+c.dach+" Plätze)."; },
  ausfuehren:a=>{ const r=rh(); const vorher=r.pv.length; for(let i=0;i<a.anzahl;i++){ const n=r.pv.length; rhKauf("solar"); if(r.pv.length===n) break; } return (r.pv.length-vorher)+" Solarmodul(e) montiert · Kasse "+hsGeld(S.kredit)+"."; }},
 {id:"akku_kaufen",en:"buy_battery",n:"Akku erweitern",z:"🔋",desc:"Extend the battery storage by steps.",params:{schritte:{type:"integer"}},gefahr:1,
  pruefen:a=>{ const schritte=Math.max(1,Math.min(6,Math.round(a.schritte||1))); if(!istFrei("gebEnergie")) return {ok:false,grund:"Der Energiegarten öffnet auf Hofstufe 8."}; const r=rh(),step=rhAkkuSchritt(r); if(step<=0) return {ok:false,grund:"Der Akku ist auf dieser Ausbaustufe voll."}; const n=Math.min(schritte,Math.floor((rhCfg().akku-r.akku)/step)),preis=n*step*40; if(n<=0) return {ok:false,grund:"Der Akku ist auf dieser Ausbaustufe voll."}; if(!kannZahlen(preis)) return {ok:false,grund:"Für "+n+" Akku-Schritt(e) fehlen "+hsGeld(preis)+"."}; return {ok:true,args:{schritte:n}}; },
  vorschau:a=>{ const r=rh(),c=rhCfg(),step=(typeof rhAkkuSchritt==="function")?rhAkkuSchritt(r):0; return step>0?a.schritte+" Schritt(e) à "+step+" kWh = "+hsGeld(step*40*a.schritte)+" (Akku jetzt "+r.akku+" kWh, Deckel "+c.akku+" kWh)":"⛔ Der Akku ist auf dieser Ausbaustufe voll ("+c.akku+" kWh)."; },
  ausfuehren:a=>{ const r=rh(),vorher=r.akku; for(let i=0;i<a.schritte;i++){ const k=r.akku; rhKauf("akku"); if(r.akku===k) break; } return "Akku "+vorher+" → "+r.akku+" kWh · Kasse "+hsGeld(S.kredit)+"."; }},
 {id:"wind_kaufen",en:"buy_wind_turbine",n:"Windrad bauen",z:"🌬️",desc:"Buy a wind turbine of a size class in kW (5, 20 or 50).",params:{kw:{type:"integer",enum:[5,20,50]}},gefahr:1,
  pruefen:a=>{ const i=RH_WIND.findIndex(w=>w.kw===Number(a.kw)); const idx=i>=0?i:(a.kw>=50?2:a.kw>=20?1:0); if(!istFrei("gebEnergie")) return {ok:false,grund:"Der Energiegarten öffnet auf Hofstufe 8."}; const r=rh(); if(r.stufe<1) return {ok:false,grund:"Windräder gibt es erst ab dem Nerdtempel."}; if((r.wind||[]).length>=6) return {ok:false,grund:"Der Windpark ist voll."}; if(!kannZahlen(RH_WIND[idx].preis)) return {ok:false,grund:"Für das Windrad fehlen "+hsGeld(RH_WIND[idx].preis)+"."}; return {ok:true,args:{kw:RH_WIND[idx].kw,index:idx}}; },
  vorschau:a=>{ const r=rh(); return RH_WIND[a.index].kw+"-kW-Windrad für "+hsGeld(RH_WIND[a.index].preis)+" (Kapazitätsfaktor "+RH_WIND[a.index].cf+")"+(r.stufe<1?" ⛔ erst ab dem Nerdtempel":"")+((r.wind||[]).length>=6?" ⛔ Windpark voll":"")+(!kannZahlen(RH_WIND[a.index].preis)?" ⛔ Kasse reicht nicht":""); },
  ausfuehren:a=>{ const r=rh(),n=(r.wind||[]).length; rhKauf("wind",a.index); return (r.wind||[]).length>n?"Windrad gebaut · Kasse "+hsGeld(S.kredit)+".":"Nicht gebaut – siehe Meldung."; }},
 {id:"kraftwerk_kaufen",en:"buy_power_plant",n:"Kraftwerk aufstellen",z:"🏭",desc:"Buy a fuel power plant of a size class in kW.",params:{kw:{type:"integer"}},gefahr:1,
  pruefen:a=>{ let idx=RH_GEN.findIndex(g=>g.kw===Number(a.kw)); if(idx<0) idx=Math.max(0,RH_GEN.findIndex(g=>g.kw>=Number(a.kw||0))); if(!istFrei("gebEnergie")) return {ok:false,grund:"Der Energiegarten öffnet auf Hofstufe 8."}; const r=rh(); if(r.stufe<1) return {ok:false,grund:"Kraftwerke gibt es erst ab dem Nerdtempel."}; if(idx<=r.gen) return {ok:false,grund:"Das gewählte Kraftwerk ist nicht größer als das vorhandene."}; const preis=RH_GEN[idx].preis-(r.gen>=0?RH_GEN[r.gen].preis*.6:0); if(!kannZahlen(preis)) return {ok:false,grund:"Für das Kraftwerk fehlen "+hsGeld(preis)+"."}; return {ok:true,args:{kw:RH_GEN[idx].kw,index:idx}}; },
  vorschau:a=>{ const r=rh(); const preis=RH_GEN[a.index].preis-(r.gen>=0?RH_GEN[r.gen].preis*.6:0); return RH_GEN[a.index].kw+"-kW-Kraftwerk für "+hsGeld(preis)+(r.gen>=0?" (60 % Altwert angerechnet)":"")+" · Brennstoff "+(RH_STROM&&RH_STROM.brennstoff?RH_STROM.brennstoff+" €/kWh":"")+(r.stufe<1?" ⛔ erst ab dem Nerdtempel":"")+(a.index<=r.gen?" ⛔ nicht größer als das vorhandene":""); },
  ausfuehren:a=>{ const r=rh(),g=r.gen; rhKauf("generator",a.index); return r.gen!==g?"Kraftwerk aufgestellt · Kasse "+hsGeld(S.kredit)+".":"Nicht aufgestellt – siehe Meldung."; }},
 {id:"nachbar_vertrag",en:"sign_neighbor_contract",n:"Nachbarvertrag",z:"🤝",desc:"Sign the electricity contract with the neighbor for more grid power.",params:{},gefahr:1,
  vorschau:()=>{ const r=rh(); return r.nachbar?"⛔ Der Nachbarvertrag besteht schon.":"Vertrag für "+hsGeld(RH_STROM.nachbarPreis)+": +"+RH_STROM.nachbarKW+" kW Anschluss, 10 % Aufschlag auf den Nachbaranteil, Monatsrechnung"+(r.stufe!==0?" ⛔ nur im Geräteschuppen":""); },
  ausfuehren:()=>{ rhKauf("nachbar"); return rh().nachbar?"Nachbarvertrag geschlossen · Anschluss "+rh().netzKW+" kW.":"Nicht geschlossen – siehe Meldung."; }},
 {id:"pc_kaufen",en:"buy_computer",n:"Rechner kaufen",z:"🖥️",desc:"Buy a computer (PC bay) of a variant: gebraucht, alt, klein, basis, max, dreier, strix, spark, mac, pi.",params:{variante:{type:"string"}},gefahr:1,
  pruefen:a=>{ const v=String(a.variante||"basis").toLowerCase(); if(!RH_PC[v]) return {ok:false,grund:"Unbekannte Rechner-Variante „"+v+"“ – möglich: "+Object.keys(RH_PC).join(", ")}; const c=rhCfg(); let i=-1; for(let k=0;k<c.pc;k++) if(!S.buchten.some(b=>b.rhSlot==="pc:"+k)){i=k;break;} if(i<0) return {ok:false,grund:"Kein freier Rechnerplatz ("+c.pc+")."}; const preis=RH_PC[v].preis; if(!kannZahlen(preis)) return {ok:false,grund:"Für den Rechner fehlen "+hsGeld(preis)+"."}; return {ok:true,args:{variante:v}}; },
  vorschau:a=>{ const c=rhCfg(),v=RH_PC[a.variante]; const preis=v.preis; let i=-1; for(let k=0;k<c.pc;k++) if(!S.buchten.some(b=>b.rhSlot==="pc:"+k)){ i=k; break; }
   return v.cpu+", "+(GPUS[v.gpu]||{}).n+", "+v.ramGB+" GB RAM · "+hsGeld(preis)+(i<0?" ⛔ kein freier Rechnerplatz ("+c.pc+")":" · Platz "+(i+1)+"/"+c.pc)+(S.kredit<preis?" · geht auf Kredit ("+hsGeld(preis-S.kredit)+" ins Minus, Zins 1 % der Schuld je Tag, gedeckelt "+hsGeld(25)+")":"")+(!kannZahlen(preis)?" ⛔ Kasse reicht nicht":""); },
  ausfuehren:a=>{ const c=rhCfg(); let i=-1; for(let k=0;k<c.pc;k++) if(!S.buchten.some(b=>b.rhSlot==="pc:"+k)){ i=k; break; } if(i<0) return "Kein freier Rechnerplatz."; const n=S.buchten.length; rhInstall("pc",i,a.variante); return S.buchten.length>n?"Rechner aufgestellt (Bucht "+S.buchten[S.buchten.length-1].id+") · Kasse "+hsGeld(S.kredit)+".":"Nicht gekauft – siehe Meldung."; }},
 {id:"rechenhaus_ausbauen",en:"upgrade_compute_house",n:"Rechenhaus ausbauen",z:"🏗️",desc:"Upgrade the compute house to the next stage (shed → nerd temple → data center).",params:{},gefahr:1,
  vorschau:()=>{ const r=rh(); const st=(typeof RH_STUFEN!=="undefined")?RH_STUFEN[r.stufe+1]:null; return st?"Ausbau zu „"+st.n+"“ für "+hsGeld(st.preis)+(!kannZahlen(st.preis)?" ⛔ Kasse reicht nicht":""):"⛔ Höchste Ausbaustufe erreicht."; },
  ausfuehren:()=>{ const r=rh(),s=r.stufe; rhUpgrade(); return rh().stufe>s?"Rechenhaus ausgebaut: Stufe "+rh().stufe+" · Kasse "+hsGeld(S.kredit)+".":"Nicht ausgebaut – siehe Meldung."; }},
 {id:"modell_kaufen",en:"buy_model",n:"Modell kaufen",z:"🐷",desc:"Buy a new model animal from the market by its id (like qwen35-4b).",params:{modell:{type:"string"}},gefahr:1,
  pruefen:a=>{ const id=MODELLE[a.modell]?a.modell:hsFinde(hsNorm(a.modell||""),MODELLE); if(!id) return {ok:false,grund:"Modell „"+a.modell+"“ steht nicht im Katalog."}; return {ok:true,args:{modell:id}}; },
  vorschau:a=>{ const m=MODELLE[a.modell]; const frei=S.buchten.filter(b=>!b.tier).length; return m.n+" · "+hsGeld(m.preis)+" · Tier "+m.tier+(m.tier>maxTier()?" ⛔ Tier noch nicht freigeschaltet (max. "+maxTier()+")":"")+(frei?" · "+frei+" freie Bucht(en)":" · ⚠️ keine freie Bucht – das Tier wartet im Stall")+(!kannZahlen(m.preis)?" ⛔ Kasse reicht nicht":""); },
  ausfuehren:a=>{ const n=S.tiere.length; modellKaufen(a.modell); return S.tiere.length>n?S.tiere[S.tiere.length-1].name+" ist eingezogen ("+S.tiere[S.tiere.length-1].uid+") · Kasse "+hsGeld(S.kredit)+".":"Nicht gekauft – siehe Meldung."; }},
 {id:"verkaufen",en:"sell_animal",n:"Tier verkaufen",z:"💸",desc:"Sell an animal (model) by its id.",params:{tier:{type:"string"}},gefahr:2,
  pruefen:a=>{ const p=hsTier(a.tier); return p?{ok:true,args:{tier:p.uid}}:{ok:false,grund:"Tier „"+a.tier+"“ gibt es nicht."}; },
  vorschau:a=>{ const p=hsTier(a.tier); let w=0; try{ w=tierWert(p); }catch(e){} return p.name+" verkaufen für etwa "+hsGeld(w)+" – Adapter, Zuchtlinie und Historie gehen mit. Nicht rückgängig zu machen."; },
  ausfuehren:a=>{ const n=S.tiere.length; verkaufen(a.tier); return S.tiere.length<n?"Verkauft · Kasse "+hsGeld(S.kredit)+".":"Nicht verkauft – siehe Meldung."; }},
 {id:"forschen",en:"research",n:"Forschen",z:"🔬",desc:"Start research on a technique in the research hut by its id or name.",params:{thema:{type:"string"}},gefahr:1,
  pruefen:a=>{ const id=FORSCHUNG[a.thema]?a.thema:hsFinde(hsNorm(a.thema||""),FORSCHUNG); if(!id) return {ok:false,grund:"Forschung „"+a.thema+"“ gibt es nicht."}; const sperre=typeof forschungsSperre==="function"?forschungsSperre(id):""; if(sperre) return {ok:false,grund:sperre}; return {ok:true,args:{thema:id}}; },
  vorschau:a=>{ const f=FORSCHUNG[a.thema]; const fertig=forschungFrei(f.frei||a.thema); const laeuft=S.forschungAktiv||null; let kosten=f.kosten; try{ if(typeof forschungsKosten==="function") kosten=forschungsKosten(f); }catch(e){}
   return f.n+" · "+hsGeld(kosten)+" · "+(f.tage||f.dauer||"?")+" Tage"+(f.lvl?" · ab Hofstufe "+f.lvl:"")+(fertig?" ✅ schon erforscht":"")+(laeuft?" ⚠️ es läuft schon eine Forschung":"")+(!kannZahlen(kosten)?" ⛔ Kasse reicht nicht":""); },
  ausfuehren:a=>{ forschen(a.thema); return "Forschung angestoßen: "+FORSCHUNG[a.thema].n+" – Stand in der Forschungshütte."; }},
 {id:"training",en:"train_model",n:"Training starten",z:"🏋️",desc:"Start a training run for an animal with a technique (lora, qlora, sft, dpo, kto, distill) and a focus value.",params:{tier:{type:"string"},technik:{type:"string"},fokus:{type:"string"},futter:{type:"string"}},gefahr:1,
  pruefen:a=>{ const p=hsTier(a.tier); if(!p) return {ok:false,grund:"Tier „"+a.tier+"“ gibt es nicht."}; const tk=TECHNIKEN[a.technik]?a.technik:hsFinde(hsNorm(a.technik||""),TECHNIKEN); if(!tk) return {ok:false,grund:"Technik „"+a.technik+"“ unbekannt – möglich: "+Object.keys(TECHNIKEN).join(", ")};
   const fokus=WERTE[a.fokus]?a.fokus:(Object.keys(WERTE).find(k=>hsNorm(WERTE[k])===hsNorm(a.fokus||""))||null); if(!fokus) return {ok:false,grund:"Fokus fehlt oder unbekannt – möglich: "+Object.values(WERTE).join(", ")};
   const t=TECHNIKEN[tk],sperre=typeof trainingsSperre==="function"?trainingsSperre(p,tk):""; if(sperre) return {ok:false,grund:sperre}; let futter=a.futter&&FUTTER[a.futter]?a.futter:null; if(!futter){ const fl=Array.isArray(t.futter)?t.futter:(t.futter?[t.futter]:[]); futter=fl.find(f=>FUTTER[f]&&(S.daten||{})[f]>0)||fl.find(f=>FUTTER[f])||"beispiele"; }
   const erlaubt=Array.isArray(t.futter)?t.futter:(t.futter?[t.futter]:[]); if(erlaubt.length&&!erlaubt.includes(futter)) return {ok:false,grund:(FUTTER[futter]||{}).n+" passt nicht zu "+t.n+"."}; const bucht=p.bucht; if(!bucht) return {ok:false,grund:p.name+" hat keine GPU-Bucht."}; const kosten=trainingsKosten(p,t,futter,false),lager=(S.daten||{})[futter]||0; if(lager<kosten.gb) return {ok:false,grund:"Zu wenig "+(FUTTER[futter]||{}).n+" ("+lager+"/"+kosten.gb+" GB)."}; if(!kannZahlen(kosten.gesamt)) return {ok:false,grund:"Für das Training fehlen "+hsGeld(kosten.gesamt)+"."}; const b=S.buchten.find(x=>x.id===bucht),vram=trainingsVramNoetig(p,t); if(!b||GPUS[b.gpu].vram<vram) return {ok:false,grund:"Die Bucht hat zu wenig Trainings-VRAM ("+(b?GPUS[b.gpu].vram:0)+"/"+vram+" GB)."}; return {ok:true,args:{tier:p.uid,technik:tk,fokus,futter,bucht}}; },
  vorschau:a=>{ const t=TECHNIKEN[a.technik],p=hsTier(a.tier); return p.name+" → "+t.n+" auf "+WERTE[a.fokus]+" mit "+((FUTTER[a.futter]||{}).n||a.futter)+(t.preis?" · "+hsGeld(t.preis):"")+(t.lvl&&hofLevel().i<t.lvl?" ⛔ ab Hofstufe "+t.lvl:"")+(!forschungFrei(a.technik)?" ⛔ Verfahren nicht erforscht":"")+(p.status!=="frei"?" ⛔ Tier ist beschäftigt":""); },
  ausfuehren:a=>{ const p=hsTier(a.tier); const ok=trainingStarten(p,a.technik,a.fokus,a.futter,a.bucht); return ok?"Training läuft: "+p.name+" ("+TECHNIKEN[a.technik].n+", "+WERTE[a.fokus]+").":"Training nicht gestartet – siehe Meldung."; }},
 {id:"futter_kaufen",en:"buy_data",n:"Futter kaufen",z:"🌾",desc:"Buy training data (feed) of a sort in gigabytes.",params:{sorte:{type:"string"},gb:{type:"integer"}},gefahr:1,
  pruefen:a=>{ const id=FUTTER[a.sorte]?a.sorte:hsFinde(hsNorm(a.sorte||""),FUTTER); if(!id||FUTTER[id].preisGB==null) return {ok:false,grund:"Futtersorte „"+a.sorte+"“ ist nicht kaufbar – kaufbar: "+Object.keys(FUTTER).filter(k=>FUTTER[k].preisGB!=null).join(", ")}; return {ok:true,args:{sorte:id,gb:Math.max(1,Math.min(200,Math.round(a.gb||4)))}}; },
  vorschau:a=>{ const f=FUTTER[a.sorte]; const preis=Math.round(a.gb*f.preisGB); return a.gb+" GB "+f.n+" à "+f.preisGB+" €/GB = "+hsGeld(preis)+(f.lvl&&hofLevel().i<f.lvl?" ⛔ ab Hofstufe "+f.lvl:"")+(!kannZahlen(preis)?" ⛔ Kasse reicht nicht":""); },
  ausfuehren:a=>{ const v=(S.daten||{})[a.sorte]||0; futterKauf(a.sorte,a.gb); return "Lager "+a.sorte+": "+v+" → "+((S.daten||{})[a.sorte]||0)+" GB · Kasse "+hsGeld(S.kredit)+"."; }},
 {id:"rein",en:"move_into_bay",n:"In die Bucht",z:"🚪",desc:"Move an animal into a GPU bay (ids like b2).",params:{tier:{type:"string"},bucht:{type:"string"}},gefahr:1,
  pruefen:a=>{ const p=hsTier(a.tier); if(!p) return {ok:false,grund:"Tier „"+a.tier+"“ gibt es nicht."}; let b=S.buchten.find(x=>x.id===a.bucht); if(!b&&!a.bucht) b=S.buchten.find(x=>!x.tier); if(!b) return {ok:false,grund:a.bucht?"Bucht „"+a.bucht+"“ gibt es nicht.":"Keine freie Bucht."}; return {ok:true,args:{tier:p.uid,bucht:b.id}}; },
  vorschau:a=>{ const p=hsTier(a.tier),b=S.buchten.find(x=>x.id===a.bucht); return p.name+" → "+b.id+" ("+(GPUS[b.gpu]||{}).n+")"+(b.tier?" ⚠️ Bucht ist belegt":"")+(!passtInBucht(p,b)?" ⚠️ passt nicht ganz ins VRAM":""); },
  ausfuehren:a=>{ inBucht(a.tier,a.bucht); const p=hsTier(a.tier); return p.bucht===a.bucht?p.name+" steht jetzt in "+a.bucht+".":"Nicht eingestallt – siehe Meldung."; }},
 {id:"raus",en:"move_out_of_bay",n:"Aus der Bucht",z:"🚶",desc:"Move an animal out of its GPU bay.",params:{tier:{type:"string"}},gefahr:1,
  pruefen:a=>{ const p=hsTier(a.tier); return p?{ok:true,args:{tier:p.uid}}:{ok:false,grund:"Tier „"+a.tier+"“ gibt es nicht."}; },
  vorschau:a=>{ const p=hsTier(a.tier); return p.bucht?p.name+" verlässt "+p.bucht+" – ohne Bucht keine Aufträge.":"⛔ "+p.name+" steht in keiner Bucht."; },
  ausfuehren:a=>{ ausBucht(a.tier); return hsTier(a.tier).name+(hsTier(a.tier).bucht?" steht noch in der Bucht – siehe Meldung.":" ist ausgestallt."); }},
 {id:"quant",en:"set_quantization",n:"Quantisierung",z:"🧮",desc:"Set the quantization of an animal: bf16, q8, q6, q5, q4, q3, q2.",params:{tier:{type:"string"},stufe:{type:"string"}},gefahr:1,
  pruefen:a=>{ const p=hsTier(a.tier); if(!p) return {ok:false,grund:"Tier „"+a.tier+"“ gibt es nicht."}; const s=String(a.stufe||"").toLowerCase().replace(/\s/g,""); const q=QUANTS.find(x=>x.id===s)||QUANTS.find(x=>hsNorm(x.n).replace(/\s/g,"").startsWith(s))||QUANTS.find(x=>s.match(/^\d+$/)&&x.id==="q"+s); if(!q) return {ok:false,grund:"Quantisierung „"+a.stufe+"“ unbekannt – möglich: "+QUANTS.map(x=>x.id).join(", ")}; if(!istFrei("gebWerkstatt")) return {ok:false,grund:"Die Werkstatt öffnet auf Hofstufe 2."}; if(!forschungFrei("quant")) return {ok:false,grund:"Erst die Diätküche (Quantisierung) erforschen."}; if(p.status!=="frei") return {ok:false,grund:p.name+" ist beschäftigt ("+p.status+")."}; return {ok:true,args:{tier:p.uid,stufe:q.id}}; },
  vorschau:a=>{ const p=hsTier(a.tier),q=QUANTS.find(x=>x.id===a.stufe); return p.name+": "+p.quant+" → "+q.n+" ("+q.bpw+" Bit/Gewicht, Qualitätsmalus "+q.malus+")"+(!forschungFrei("quant")?" ⛔ Forschung Quantisierung fehlt":""); },
  ausfuehren:a=>{ quantSetzen(a.tier,a.stufe); return hsTier(a.tier).name+" läuft jetzt in "+hsTier(a.tier).quant+"."; }},
 {id:"denken",en:"toggle_thinking",n:"Denkmodus",z:"💭",desc:"Toggle the thinking mode of an animal.",params:{tier:{type:"string"}},gefahr:1,
  pruefen:a=>{ const p=hsTier(a.tier); return p?{ok:true,args:{tier:p.uid}}:{ok:false,grund:"Tier „"+a.tier+"“ gibt es nicht."}; },
  vorschau:a=>{ const p=hsTier(a.tier); return p.name+": Denkmodus "+(p.denken?"AUS":"AN")+" schalten"+(!p.rz?" ⛔ dieses Modell hat keinen Denkmodus":" – mehr Qualität bei Logik, weniger Durchsatz (Denk-Token)"); },
  ausfuehren:a=>{ denkenUm(a.tier); return hsTier(a.tier).name+": Denkmodus "+(hsTier(a.tier).denken?"an":"aus")+"."; }},
 {id:"kur",en:"cure_animal",n:"Kur",z:"🩺",desc:"Cure a sick animal.",params:{tier:{type:"string"}},gefahr:1,
  pruefen:a=>{ const p=hsTier(a.tier); return p?{ok:true,args:{tier:p.uid}}:{ok:false,grund:"Tier „"+a.tier+"“ gibt es nicht."}; },
  vorschau:a=>{ const p=hsTier(a.tier); return p.krank?p.name+" hat „"+(p.krank.n||p.krank)+"“ – die Kur kostet Geld und je nach Krankheit Daten oder einen Adapter.":p.name+" ist gesund."; },
  ausfuehren:a=>{ kurieren(a.tier); return hsTier(a.tier).krank?"Kur nicht abgeschlossen – siehe Meldung.":hsTier(a.tier).name+" ist kuriert."; }},
 {id:"pruefen",en:"evaluate_for_job",n:"Prüfen",z:"🔬",desc:"Run the three-stage evaluation of an animal for a job note.",params:{tier:{type:"string"},zettel:{type:"string"}},gefahr:1,
  pruefen:a=>{ const p=hsTier(a.tier),j=hsJob(a.zettel); if(!p) return {ok:false,grund:"Tier „"+a.tier+"“ gibt es nicht."}; if(!j) return {ok:false,grund:"Zettel „"+a.zettel+"“ gibt es nicht."}; return {ok:true,args:{tier:p.uid,zettel:j.id}}; },
  vorschau:a=>{ const j=hsJob(a.zettel); return "Dreistufige Evaluation von "+hsTier(a.tier).name+" für „"+j.t+"“: "+hsGeld(Math.max(3,Math.round(jobLohnGesamt(j)*0.06)))+" (6 % des Auftragswerts, mind. 3 €)."; },
  ausfuehren:a=>{ hlPruefen(a.tier,a.zettel); return "Prüfung geöffnet."; }},
 {id:"geschirr",en:"fit_harness",n:"Agenten-Tool zuweisen",z:"🧰",desc:"Fit a harness (agent scaffold) on an animal, or take it off (harness id, e.g. hofgeschirr, claude-code; use ab/none to remove).",params:{tier:{type:"string"},geschirr:{type:"string"}},gefahr:1,
  pruefen:a=>{ const p=hsTier(a.tier); if(!p) return {ok:false,grund:"Tier „"+a.tier+"“ gibt es nicht."};
    const roh=String(a.geschirr||"").toLowerCase();
    if(!roh||roh==="ab"||roh==="none"||roh==="abnehmen") return p.geschirr?{ok:true,args:{tier:p.uid,geschirr:"ab"}}:{ok:false,grund:p.name+" verwendet gar kein Agenten-Tool."};
    const hid=HARNESSE[roh]?roh:Object.keys(HARNESSE).find(k=>hsNorm(HARNESSE[k].n).includes(hsNorm(roh))||hsNorm(k).includes(hsNorm(roh)));
    if(!hid) return {ok:false,grund:"Agenten-Tool „"+a.geschirr+"“ gibt es nicht – möglich: "+Object.keys(HARNESSE).join(", ")+"."};
    const h=HARNESSE[hid];
    if(!h.basis&&typeof forschungFrei==="function"&&!forschungFrei("geschirr")) return {ok:false,grund:h.n+" braucht die Agentenwerkstatt aus der Forschungshütte; das Basis-Tool geht auch ohne."};
    if(h.lvl&&hofLevel().i<h.lvl) return {ok:false,grund:h.n+" gibt es ab Hofstufe "+h.lvl+"."};
    if(h.preis&&!kannZahlen(h.preis)&&!(S.harnesse||{})[hid]) return {ok:false,grund:"Für "+h.n+" fehlen "+hsGeld(h.preis)+"."};
    return {ok:true,args:{tier:p.uid,geschirr:hid}}; },
   vorschau:a=>{ const p=hsTier(a.tier); if(a.geschirr==="ab") return p.name+" entfernt „"+((HARNESSE[p.geschirr]||{}).n||p.geschirr)+"“ – Agenten-Zettel sind dann gesperrt.";
    const h=HARNESSE[a.geschirr], e=(typeof geschirrEignung==="function")?Math.round(geschirrEignung(p,a.geschirr)):null;
    return p.name+" → "+h.n+(h.preis&&!(S.harnesse||{})[a.geschirr]?" · "+hsGeld(h.preis):" · schon gekauft")+(e!==null?" · Eignung "+e+" % (unter 35 % arbeitet das Modell unruhig)":"")+(h.schutz?" · 🛡️ Sandbox und Prüfprotokoll halbieren das Datenschutz-Risiko":""); },
  ausfuehren:a=>{ const p=hsTier(a.tier); if(a.geschirr==="ab"){ geschirrAb(p.uid); return p.name+" verwendet kein Agenten-Tool mehr."; }
    geschirrAnlegen(p.uid,a.geschirr); return p.geschirr===a.geschirr?p.name+" verwendet jetzt "+HARNESSE[a.geschirr].n+" · Kasse "+hsGeld(S.kredit)+".":"Nicht zugewiesen – siehe Meldung."; }},
 {id:"mcp_anschluss",en:"connect_mcp_node",n:"MCP-Knoten anschließen",z:"🔌",desc:"Connect a node of the MCP workshop (stdio, http, oauth, tools, resources, prompts, roots, sampling, elicitation, srv_datei, srv_mail, srv_buchhaltung, srv_web, allowlist, sandbox, audit, registry).",params:{knoten:{type:"string"}},gefahr:1,
  pruefen:a=>{ if(typeof mcpKnoten!=="function") return {ok:false,grund:"Keine MCP-Werkstatt in diesem Build."}; const roh=hsNorm(String(a.knoten||"")); const k=mcpAlleKnoten().find(x=>x.id===roh||hsNorm(x.n).includes(roh)||hsNorm(x.kurz||"")===roh||("srv_"+roh)===x.id); if(!k) return {ok:false,grund:"Welcher Knoten? Beispiel: „schließe den Dateiserver an“ oder „mcp stdio“."}; if(!mcpFrei()) return {ok:false,grund:"Die MCP-Werkstatt öffnet ab Hofstufe "+MCP_REGELN.freiAbStufe+" mit erforschter Agentenwerkstatt."}; if(mcpHat(k.id)) return {ok:false,grund:k.n+" ist schon angeschlossen."}; if(!mcpVorOk(k)) return {ok:false,grund:k.n+" braucht erst "+k.braucht.map(b=>(mcpKnoten(b)||{}).n||b).join(", ")+"."}; if(mcpStand().aktiv) return {ok:false,grund:"Das Anschlussbrett ist belegt."}; if(!mcpGeschirrOk()) return {ok:false,grund:"Kein Agenten-Tool mit MCP im Stall."}; if(!kannZahlen(k.kosten)) return {ok:false,grund:"Für "+k.n+" fehlen "+hsGeld(k.kosten)+"."}; return {ok:true,args:{knoten:k.id}}; },
  vorschau:a=>{ const k=mcpKnoten(a.knoten); return k.z+" "+k.n+": "+hsGeld(k.kosten)+", "+k.tage+" Tag"+(k.tage>1?"e":"")+" Anschlussarbeit · "+k.eff; },
  ausfuehren:a=>{ const k=mcpKnoten(a.knoten); return mcpStart(a.knoten)?k.n+" wird angeschlossen ("+k.tage+" Tag(e)).":"Nicht gestartet – siehe Meldung."; }},
 {id:"zucht",en:"breed_models",n:"Zucht (Merge)",z:"🧬",desc:"Breed (merge) two or three own animals with a method: slerp, ties, dare, linear.",params:{methode:{type:"string"},tiere:{type:"array",items:{type:"string"}}},gefahr:1,
  pruefen:a=>{ if(typeof ZUCHT==="undefined"||typeof zuchtStart!=="function") return {ok:false,grund:"Keine Zucht in diesem Build."}; if(!istFrei("gebZucht")) return {ok:false,grund:"Die Zucht öffnet auf Hofstufe 2."}; if(!forschungFrei("merge")) return {ok:false,grund:"Erst „Zuchtbuch (Model Merging)“ erforschen."};
    const m=ZUCHT[a.methode]?a.methode:"slerp"; const tiere=(a.tiere||[]).map(String); if(tiere.length<2) return {ok:false,grund:"Zwei Tiere nennen, z. B. „züchte t3 mit t4“."}; for(const u of tiere){ const p=hsTier(u); if(!p) return {ok:false,grund:"Tier „"+u+"“ gibt es nicht."}; if(p.api) return {ok:false,grund:p.name+" ist ein Leih-Tier – Leih-Tiere haben keine Gewichte."}; if(p.status!=="frei") return {ok:false,grund:p.name+" ist beschäftigt ("+p.status+")."}; }
    if(typeof mergeKompatibel==="function"){ const k=mergeKompatibel(hsTier(tiere[0]),hsTier(tiere[1]),m); if(k&&k.ok===false) return {ok:false,grund:"Nicht kreuzbar: "+(k.warum||"")}; } return {ok:true,args:{methode:m,tiere}}; },
  vorschau:a=>{ const z=ZUCHT[a.methode]; return "🧬 "+z.n+": "+a.tiere.map(u=>(hsTier(u)||{}).name).join(" × ")+" · "+hsGeld(z.kredit)+" plus Bucht-Freihaltung, der Wurf kommt morgen früh (1–3 Kinder); Eltern erholen sich danach "+((typeof ZUCHT_REGELN!=="undefined")?ZUCHT_REGELN.zuchtRuhe:3)+" Tage."; },
  ausfuehren:a=>{ zuchtMethode=a.methode; zuchtWahl.length=0; a.tiere.forEach(u=>zuchtWahl.push(hsTier(u).uid)); zuchtStart(); return "Zucht angesetzt: "+a.tiere.map(u=>(hsTier(u)||{}).name).join(" × ")+" ("+ZUCHT[a.methode].n+")."; }},
 {id:"zeige",en:"open_place",n:"Ort öffnen",z:"🗺️",desc:"Open a place on the farm: stall, markt, futter, forschung, rechenhaus, energie, zucht, training, dorfplatz, hofhaus, jobs, werkstatt, geschirr, cloud, arena, hofbuch.",params:{ort:{type:"string"}},gefahr:0,
  pruefen:a=>{ const o=String(a.ort||"").toLowerCase(); return o?{ok:true,args:{ort:o}}:{ok:false,grund:"Welcher Ort?"}; },
  vorschau:()=>"", ausfuehren:a=>{ try{ if(a.ort==="energie") zeigeRechenhaus("energie"); else oeffne(a.ort); }catch(e){ return "Ort „"+a.ort+"“ kenne ich nicht."; } return "Geöffnet: "+a.ort+"."; }},
 {id:"entscheiden",en:"decide_event",n:"Ereignis entscheiden",z:"⚖️",desc:"Choose an option for the pending farm event decision (option number starting at 1).",params:{option:{type:"integer"}},gefahr:1,
  pruefen:a=>{ const off=(typeof ereignisOffen==="function")?ereignisOffen():[]; if(!off.length) return {ok:false,grund:"Es steht keine Entscheidung an."}; const e=off[0]; const n=Math.round(Number(a.option)||0); if(!(n>=1&&n<=e.optionen.length)) return {ok:false,grund:e.z+" "+e.n+": Option 1–"+e.optionen.length+" wählen – "+e.optionen.map((o,i)=>(i+1)+" "+o.t).join(", ")}; return {ok:true,args:{option:n,id:e.id}}; },
  vorschau:a=>{ const e=ereignisOffen().find(x=>x.id===a.id); const o=e.optionen[a.option-1]; return e.z+" "+e.n+" → „"+o.t+"“: "+o.txt+" ("+ereignisWahlText(o)+")"; },
  ausfuehren:a=>{ const e=ereignisOffen().find(x=>x.id===a.id); if(!e) return "Die Entscheidung ist schon gefallen."; const o=e.optionen[a.option-1]; return ereignisEntscheiden(e.id,a.option-1)?"Entschieden: "+o.t+" – "+o.ergebnis:"Nicht möglich – siehe Meldung."; }},
 {id:"schulung",en:"book_training_course",n:"Fachkurs buchen",z:"🎓",desc:"Book a training course for an animal in a subject (datenschutz, medizin, recht, steuer, personal, finanzen); course level grund, aufbau or zertifikat; optional technique kurs, sft, lora, qlora or dpo.",params:{tier:{type:"string"},gebiet:{type:"string",enum:["datenschutz","medizin","recht","steuer","personal","finanzen"]},kurs:{type:"string",enum:["grund","aufbau","zertifikat"]},technik:{type:"string",enum:["kurs","sft","lora","qlora","dpo"]}},gefahr:1,
  pruefen:a=>{ const p=hsTier(a.tier); if(!p) return {ok:false,grund:"Tier „"+a.tier+"“ gibt es nicht."}; if(p.api) return {ok:false,grund:"Leih-Tiere lassen sich nicht schulen."}; const g=FACH_GEBIETE[a.gebiet]?a.gebiet:"datenschutz"; const offen=fachKurseOffen(p,g); if(!offen.length) return {ok:false,grund:p.name+": in "+FACH_GEBIETE[g].n+" ist kein Kurs offen."}; const k=(a.kurs&&offen.find(x=>x.id===a.kurs))||offen[0],technik=a.technik||"kurs",t=FACH_REGELN.techniken[technik]; if(!t) return {ok:false,grund:"Schulungstechnik „"+technik+"“ ist unbekannt."}; if(!fachTechnikFrei(technik,g)) return {ok:false,grund:t.n+(t.nur?" ist nur für "+FACH_GEBIETE[t.nur].n+" erlaubt.":" muss zuerst erforscht werden.")}; return {ok:true,args:{tier:p.uid,gebiet:g,kurs:k.id,technik}}; },
  vorschau:a=>{ const p=hsTier(a.tier); const kk=fachKursKosten(p,a.kurs,a.technik||"kurs",a.gebiet); return p.name+" → "+kk.kurs.n+" "+FACH_GEBIETE[a.gebiet].n+" mit "+kk.technik.n+": "+hsGeld(kk.preis)+", "+kk.tage+" Tag"+(kk.tage>1?"e":"")+", "+kk.gb+" GB Kuratiertes (Lager "+((S.daten||{}).kuratiert||0)+" GB), Fachwissen "+fachWert(p,a.gebiet)+" → "+(fachWert(p,a.gebiet)+kk.gewinn)+". Solange nicht einsetzbar."+(p.status!=="frei"?" ⛔ Tier ist beschäftigt":"")+(!p.bucht?" ⛔ braucht eine Bucht":""); },
  ausfuehren:a=>{ return fachSchulungStart(a.tier,a.gebiet,a.kurs,a.technik||"kurs")?hsTier(a.tier).name+" ist im "+FACH_KURSE.find(k=>k.id===a.kurs).n+" "+FACH_GEBIETE[a.gebiet].n+" ("+FACH_REGELN.techniken[a.technik||"kurs"].n+").":"Nicht gebucht – siehe Meldung."; }},
 {id:"warten",en:"wait_hours",n:"Warten",z:"⏩",desc:"Advance the farm clock: a number of hours, or until the next job is finished (abnahme), or until closing time (feierabend).",params:{stunden:{type:"integer"},bis:{type:"string",enum:["abnahme","feierabend"]}},gefahr:1,
  pruefen:a=>{ if(hlStand().phase!=="tag") return {ok:false,grund:"Die Nachtplanung ist offen."}; const bis=a.bis==="abnahme"||a.bis==="feierabend"?a.bis:null; const h=Math.max(0,Math.min(16,Math.round(Number(a.stunden)||0))); if(!bis&&!h) return {ok:false,grund:"Wie lange? Beispiel: „warte 2 Stunden“ oder „warte bis zur Abnahme“."}; return {ok:true,args:{stunden:h,bis}}; },
  vorschau:a=>{ const std=hlNaechsteAbnahmeStunden(); return "Jetzt "+hlUhrText(hlUhrStunde())+" Uhr · "+(a.bis==="abnahme"?"bis zur nächsten Abnahme"+(std===null?" (kein Auftrag läuft)":" (≈ "+hlStundenText(std)+" Arbeit)"):a.bis==="feierabend"?"bis Feierabend 22:00":a.stunden+" Stunde(n) vorspulen")+" – fertige Aufträge werden sofort abgenommen, freie Modelle bleiben frei."; },
  ausfuehren:a=>{ const n=a.bis==="abnahme"?hlWartenBisAbnahme():a.bis==="feierabend"?hlWartenFeierabend():hlWarten(a.stunden); return hlUhrText(hlUhrStunde())+" Uhr"+(n?" – "+n+" Auftrag/Aufträge abgenommen.":"."); }},
 {id:"hofbuch",en:"open_rulebook",n:"Hofbuch",z:"📖",desc:"Open the rulebook (Hofbuch), optionally at a chapter.",params:{kapitel:{type:"string"}},gefahr:0,
  vorschau:()=>"", ausfuehren:a=>{ try{ zeigeHofbuch(); if(a.kapitel) setTimeout(()=>{ try{ hbSpring(a.kapitel); }catch(e){} },300); }catch(e){} return "Hofbuch geöffnet"+(a.kapitel?" (Kapitel "+a.kapitel+")":"")+"."; }}
];
function hsWerkzeug(id){ return HS_WERKZEUGE.find(w=>w.id===id||w.en===id)||null; }
/* Katalog als JSON für Needle (englische Namen, Schemata) – reine Funktion */
/* Needle sieht englische Parameternamen und -werte; hsNadelPlan übersetzt zurück. */
const HS_EN_PARAM={tier:"animal",zettel:"job_id",tiere:"animals",anzahl:"count",schritte:"steps",kw:"kw",variante:"variant",modell:"model_id",thema:"topic",technik:"technique",fokus:"focus",futter:"data_kind",gb:"gigabytes",bucht:"bay_id",stufe:"level",ort:"place",kapitel:"chapter",art:"action",modus:"mode",tage:"days",option:"option"};
const HS_EN_WERT={modus:{auto:"auto",eigen:"own"},art:{ruhe:"rest",lora:"lora",qlora:"qlora",sft:"sft",dpo:"dpo",kto:"kto",synth:"synthetic_data",reindex:"reindex",ueberstunden:"overtime",wartung:"maintenance",distill:"distill"}};
function hsEnName(k){ return HS_EN_PARAM[k]||k; }
function hsEnWert(k,v){ const m=HS_EN_WERT[k]; return (m&&m[v]!==undefined)?m[v]:v; }
function hsDeWert(k,v){ const m=HS_EN_WERT[k]; if(!m) return v; for(const de in m) if(m[de]===v) return de; return v; }
function hsWerkzeugeJson(){
  return JSON.stringify(HS_WERKZEUGE.map(w=>{ const props={}; for(const k in w.params){ const p=w.params[k]; const q={type:p.type}; if(p.enum) q.enum=p.enum.map(v=>hsEnWert(k,v)); if(p.items) q.items=p.items; props[hsEnName(k)]=q; }
    return {name:w.en,description:w.desc,parameters:{type:"object",properties:props,required:[]}}; }));
}

/* ── Stufe 1: deutscher Wörterbuch-Parser (reine Funktion) ────────────────
   Rückgabe: {werkzeug, args, sicherheit:'exakt'|'vermutet', quelle:'woerterbuch'} oder null */
const HS_ORTE={stall:"stall",buchten:"stall",markt:"markt",viehmarkt:"markt",futter:"futter",scheune:"futter",futterscheune:"futter",forschung:"forschung",forschungshuette:"forschung",huette:"forschung",rechenhaus:"rechenhaus",energiegarten:"energie",energie:"energie",strom:"energie",zucht:"zucht",zuchtbucht:"zucht",training:"training",trainingsplatz:"training",dorfplatz:"dorfplatz",hofhaus:"hofhaus",zettel:"jobs",pinnwand:"jobs",auftraege:"jobs",werkstatt:"werkstatt",wissenswerkstatt:"werkstatt",geschirr:"geschirr",sattlerei:"geschirr",cloud:"cloud",funkmast:"cloud",arena:"arena",festwiese:"arena",hofbuch:"hofbuch",hilfe:"hilfe",agentenwelt:"agentenwelt",leitstand:"leitstand",kompendium:"kompendium",wissen:"kompendium",news:"news",hof:"hof"};
const HS_NACHT_SYN={schlafen:"ruhe",ruhe:"ruhe",ausruhen:"ruhe",pflege:"ruhe",sitzungspflege:"ruhe",lora:"lora",qlora:"qlora",sft:"sft",dpo:"dpo",kto:"kto",synth:"synth",synthetik:"synth",synthetisch:"synth",reindex:"reindex",index:"reindex",indexieren:"reindex",neuindex:"reindex",ueberstunden:"ueberstunden",ueberstunde:"ueberstunden",wartung:"wartung",warten:"wartung",distill:"distill",destill:"distill",destillation:"distill",destillieren:"distill"};
const HS_PC_SYN={gebraucht:"gebraucht",alt:"alt",dachboden:"alt",klein:"klein",kleiner:"klein",basis:"basis",standard:"basis",normal:"basis",max:"max",dick:"max",gross:"max",grosser:"max",dreier:"dreier","3090":"dreier",strix:"strix",amd:"strix",ryzen:"strix",spark:"spark",dgx:"spark",mac:"mac",apple:"mac",pi:"pi",raspberry:"pi",esp:"esp",esp32:"esp"};
function hsParsen(text){
  const t=hsNorm(text); if(!t) return null;
  const P=(werkzeug,args,sicherheit)=>({werkzeug,args:args||{},sicherheit:sicherheit||"exakt",quelle:"woerterbuch"});
  const tids=hsTierIds(t), jids=hsIds(t,"j"), bids=hsIds(t,"b");
  const kauf=hsW(t,/(^|\s)(kauf|kaufe|kaufen|hol|hole|besorg|besorge|bestell|bestelle|erweiter|erweitere|bau|baue|montier|montiere|stell.*auf|aufstellen|anschaffen|investier)/);
  const zeig=hsW(t,/(^|\s)(zeig|zeige|oeffne|geh|gehe|ab|auf|rein|ins|zum|zur|in|nach|wo|was|wie)(\s|$)/);
  /* Hilfe & Anzeige */
  if(hsW(t,/(^|\s)(hilfe|help|was kannst du|befehle|beispiele)(\s|$)/)) return P("hilfe");
  if(hsW(t,/(^|\s)(wetter|prognose|vorhersage|regen|sonne scheint|sonnig|wolken)(\s|$)|wie wird das wetter|wetterbericht/)) return P("wetterbericht",{tage:hsZahl(t,3)});
  if(hsW(t,/(kassenbuch|kasse|kassen|konto|kontostand|finanzen|bilanz|einnahmen|ausgaben|wieviel geld|wie viel geld|geld haben|euro haben)/)&&!kauf) return P("kassenbuch");
  if(hsW(t,/(^|\s)\w*(status|ueberblick|uebersicht)\w*(\s|$)|(^|\s)(lage|stand)(\s|$)|wie geht es|wie gehts|wie laeuft|wie steht/)&&!tids.length&&!jids.length) return P("status");   /* v9.8: auch zusammengesetzt („hofstatus“, „tagesueberblick“) */
  /* Hofbuch */
  if(hsW(t,/(^|\s)(entscheid|entscheide|option|waehle|waehl|nimm option)(\s|$)/)&&typeof ereignisOffen==="function"&&ereignisOffen().length){ const n=hsZahl(t,0); const e=ereignisOffen()[0]; let idx=n; if(!idx){ e.optionen.forEach((o,i)=>{ if(hsNorm(o.t).split(" ").some(w=>w.length>4&&t.includes(w))) idx=i+1; }); } return P("entscheiden",{option:idx||1},idx?"exakt":"vermutet"); }
  if(hsW(t,/(hofbuch|regelwerk|(^|\s)regeln(\s|$)|nachschlagen)/)){ const kap=(t.match(/(?:hofbuch|regelwerk|(^|\s)regeln|nachschlagen)\s+(?:zu|ueber|kapitel|zum|zur)?\s*([a-z]+)/)||[])[2]; return P("hofbuch",kap?{kapitel:kap}:{}); }
  /* Zettel / Aufträge */
  if(hsW(t,/(^|\s)(nimm|nehme|nehmen|annehmen|uebernimm|uebernehm|uebernehmen|mach|mache|machen|zusagen|zusage|akzeptier|akzeptiere)(\s|$)/)&&jids.length) return P("annehmen",{zettel:jids[0],tiere:Array.from(tids)},tids.length?"exakt":"vermutet");
  if(hsW(t,/(^|\s)(abbrechen|abbrich|brich|zurueckgeben|zurueck|stornier|storniere|kuendig|kuendige|absagen|abgeben)(\s|$)/)&&jids.length) return P("abbrechen",{zettel:jids[0]});
  if(jids.length&&!tids.length&&!kauf) return P("auftrag_zeigen",{zettel:jids[0]},"vermutet");
  if(hsW(t,/(zettel|auftraege|auftrag|pinnwand|jobs)/)&&!kauf&&!tids.length) return P("zettel_zeigen");
  if(hsW(t,/(schul|schulung|kurs|fortbild|zertifikat|fachwissen)/)&&tids.length&&!kauf){ const g=Object.keys(FACH_GEBIETE).find(k=>hsW(t,new RegExp("(^|\\s)("+k+"|"+hsNorm(FACH_GEBIETE[k].n).split(" ")[0]+")(\\s|$)")))||(hsW(t,/(dsgvo|daten)/)?"datenschutz":"datenschutz"); const kurs=(t.match(/(^|\s)(grund|aufbau|zertifikat)(\s|$)/)||[])[2],technik=(t.match(/(^|\s)(sft|lora|qlora|dpo|kursverfahren)(\s|$)/)||[])[2]; return P("schulung",{tier:tids[0],gebiet:g,kurs:kurs||undefined,technik:technik==="kursverfahren"?"kurs":technik||undefined},g?"exakt":"vermutet"); }
  if(hsW(t,/(^|\s)(warte|warten|vorspulen|spul|spule|weiter bis)(\s|$)/)){ if(hsW(t,/(abnahme|fertig|abgeschlossen)/)) return P("warten",{bis:"abnahme"}); if(hsW(t,/(feierabend|abend|22)/)) return P("warten",{bis:"feierabend"}); return P("warten",{stunden:hsZahl(t,1)}); }
  /* Nacht */
  if(hsW(t,/(^|\s)(nacht wie gestern|wie gestern|gestrig|nochmal wie gestern)(\s|$)/)) return P("nacht_gestern");
  if(hsW(t,/(^|\s)(nacht|nachts|heute nacht|ueber nacht|nachtschicht|nachtplan)(\s|$)/)&&tids.length){ let art=null; for(const w of t.split(" ")){ const nw=HS_NACHT_SYN[w]||(w.startsWith("reindex")?"reindex":w.startsWith("destill")?"distill":null);if(nw&&HL_NACHT[nw]){ art=nw; break; } }
    if(!art){ const tk=hsFinde(t,TECHNIKEN); if(tk&&HL_NACHT[tk]) art=tk; }
    const fokus=Object.keys(WERTE).find(k=>hsW(t,new RegExp("(^|\\s)("+k+"|"+hsNorm(WERTE[k])+")(\\s|$)")))||null;
    if(art) return P("nacht_planen",{tier:tids[0],art,fokus}); }
  if(hsW(t,/(mcp|anschliess|anschließ|dateiserver|mailserver|buchhaltungsserver|webserver|allowlist|sandkasten|sandbox|registry|oauth|stdio)/)&&!tids.length){   /* v9.9: MCP-Werkstatt */
    const ids=["stdio","http","oauth","tools","resources","prompts","roots","sampling","elicitation","allowlist","sandbox","audit","registry"];
    let k=ids.find(id=>hsW(t,new RegExp("(^|\\s)"+id+"(\\s|$)")));
    if(!k){ if(hsW(t,/datei/)) k="srv_datei"; else if(hsW(t,/(mail|post|kalender)/)) k="srv_mail"; else if(hsW(t,/buchhaltung/)) k="srv_buchhaltung"; else if(hsW(t,/(web|such|netz)/)) k="srv_web"; else if(hsW(t,/sandkasten/)) k="sandbox"; else if(hsW(t,/(pruefprotokoll|protokoll|freigabe)/)) k="audit"; }
    if(k) return P("mcp_anschluss",{knoten:k},"exakt"); }
  if(hsW(t,/(zucht|zuecht|zücht|kreuz|merge|paare)/)&&tids.length>=2){ const m=(t.match(/(^|\s)(slerp|ties|dare|linear)(\s|$)/)||[])[2]||"slerp"; return P("zucht",{methode:m,tiere:tids.slice(0,3)},"exakt"); }   /* v9.9 (R2): Zucht über den Hofsprecher */
  if(hsW(t,/(agenten.?tool|tool|geschirr|harness|sattel)/)&&tids.length){   /* alte Hofbegriffe bleiben als Eingabe-Aliase erhalten */
    const ab=hsW(t,/(^|\s)(ab|abnehmen|runter|weg|ohne)(\s|$)/);
    const hid=Object.keys(HARNESSE).find(k=>hsW(t,new RegExp(hsNorm(k).replace(/[^a-z0-9]+/g,".?")))||hsW(t,new RegExp(hsNorm(HARNESSE[k].n).split(" ")[0])));
    return P("geschirr",{tier:tids[0],geschirr:ab?"ab":(hid||"hofgeschirr")},hid||ab?"exakt":"vermutet"); }
  if(hsW(t,/(^|\s)(zurueck zum tag|zurück zum tag|nachtplanung schliessen|nachtplanung schließen|doch nicht schlafen)(\s|$)/)) return P("zurueck_tag");   /* v9.8 */
  if(hsW(t,/(^|\s)(nacht starten|starte die nacht|starte nacht|nacht beginnen|gute nacht|schlafen|schlafen gehen|nacht los|ab ins bett|nachtschicht starten)(\s|$)/)&&!tids.length) return P(hlStand().phase==="planung"?"nacht_starten":"tag_beenden");   /* v9.8: Schlafsprache öffnet tagsüber erst die Planung */
  if(hsW(t,/(^|\s)(tag beenden|beende|beenden|feierabend|schluss|schlafen gehen|zur nacht|tagesende|ende des tages|fertig fuer heute)(\s|$)/)&&!tids.length) return P(hlStand().phase==="planung"?"nacht_starten":"tag_beenden");   /* v9.8: in der Nachtplanung heißt „beenden“ Nacht starten */
  /* Energie-Modus */
  if(hsW(t,/(eigenstrom|nur eigen|eigen strom|eigenen strom|gruenstrom|nur sonne)/)&&tids.length) return P("energie_modus",{tier:tids[0],modus:"eigen"});
  if(hsW(t,/(^|\s)(automatik|automatisch|auto|netzstrom|netz)(\s|$)/)&&tids.length) return P("energie_modus",{tier:tids[0],modus:"auto"});
  /* Rechenhaus-Käufe */
  if(hsW(t,/(solar|solarpanel|panel|modul|module|photovoltaik|pv)/)&&kauf) return P("solar_kaufen",{anzahl:hsZahl(t,1)});
  if(hsW(t,/(akku|speicher|batterie)/)&&kauf) return P("akku_kaufen",{schritte:hsZahl(t,1)});
  if(hsW(t,/(windrad|windraeder|windkraft|windturbine|wind)/)&&kauf){const kw=hsZahl(t,5);return P("wind_kaufen",{kw:[5,20,50].includes(kw)?kw:5});}
  if(hsW(t,/(kraftwerk|generator|bhkw|notstrom|diesel)/)&&kauf) return P("kraftwerk_kaufen",{kw:hsZahl(t,15)});
  if(hsW(t,/(nachbar)/)&&hsW(t,/(vertrag|strom|anschluss|kauf|schliess|abschliess)/)) return P("nachbar_vertrag");
  if(hsW(t,/(rechenhaus|nerdtempel|rechenzentrum|schuppen)/)&&hsW(t,/(ausbau|ausbauen|umbau|umbauen|aufstufen|erweitern|naechste stufe|bau)/)) return P("rechenhaus_ausbauen");
  if(hsW(t,/(^|\s)(rechner|pc|computer|kiste|rechenknecht)(\s|$)/)&&kauf){ let v=/gebraucht/.test(t)?"gebraucht":"basis"; for(const w of t.split(" ")){ if(HS_PC_SYN[w]&&RH_PC[HS_PC_SYN[w]]){ v=HS_PC_SYN[w]; break; } } return P("pc_kaufen",{variante:v},"vermutet"); }
  /* Modelle */
  if(hsW(t,/(^|\s)(verkauf|verkaufe|verkaufen|loswerden|abgeben|verstoss|verstosse)(\s|$)/)&&tids.length) return P("verkaufen",{tier:tids[0]});
  if(kauf){ const id=hsFinde(t,MODELLE); if(id) return P("modell_kaufen",{modell:id}); const f=hsFinde(t,FUTTER); if(f&&FUTTER[f].preisGB!=null) return P("futter_kaufen",{sorte:f,gb:hsZahl(t,4)}); }
  if(hsW(t,/(futter|silage|beispiele|daten)/)&&hsW(t,/(kauf|besorg|hol|bestell|nachkauf)/)){ const f=hsFinde(t,FUTTER)||Object.keys(FUTTER).find(k=>FUTTER[k].preisGB!=null); return P("futter_kaufen",{sorte:f,gb:hsZahl(t,4)},"vermutet"); }
  /* Forschung & Training */
  if(hsW(t,/(^|\s)(forsch|forsche|forschen|erforsch|erforsche|erforschen|forschung|research)(\s|$)/)){ const id=hsFinde(t.replace(/(^|\s)(forschung|forschen|erforschen|erforsche|forsche|forsch)(\s|$)/g," "),FORSCHUNG); if(id) return P("forschen",{thema:id}); return null; }
  if(hsW(t,/(^|\s)(train|trainier|trainiere|trainieren|training|feintun|finetun|finetune|feinabstimm)/)&&tids.length){ const tk=hsFinde(t,TECHNIKEN); const fokus=Object.keys(WERTE).find(k=>hsW(t,new RegExp("(^|\\s)("+k+"|"+hsNorm(WERTE[k])+")(\\s|$)")))||null; const fu=hsFinde(t,FUTTER);
    return P("training",{tier:tids[0],technik:tk||"lora",fokus,futter:fu},(tk&&fokus)?"exakt":"vermutet"); }
  /* Tierpflege & Stall */
  if(hsW(t,/(^|\s)(kur|kurier|kuriere|kurieren|heil|heile|heilen|behandl|behandle|behandeln|gesund)(\s|$)/)&&tids.length) return P("kur",{tier:tids[0]});
  if(hsW(t,/(^|\s)(denken|denkmodus|nachdenken|reasoning|thinking)(\s|$)/)&&tids.length) return P("denken",{tier:tids[0]});
  if(hsW(t,/(quant|quantisier|quantisiere|quantisieren|bit)/)&&tids.length){ const q=(t.match(/(^|\s)(bf16|q8|q6|q5|q4|q3|q2)(\s|$)/)||[])[2]||(t.match(/(\d+)\s*bit/)||[])[1]; return P("quant",{tier:tids[0],stufe:q||"q4"},q?"exakt":"vermutet"); }
  if(hsW(t,/(^|\s)(pruef|pruefe|pruefen|teste|testen|evaluier|evaluiere|check)(\s|$)/)&&tids.length&&jids.length) return P("pruefen",{tier:tids[0],zettel:jids[0]});
  if(hsW(t,/(^|\s)(raus|ausstallen|aus der bucht|rausnehmen|entferne aus)(\s|$)/)&&tids.length&&!bids.length) return P("raus",{tier:tids[0]});
  if(hsW(t,/(^|\s)(rein|einstallen|in die bucht|in bucht|setz|setze|stell|stelle|steck|stecke|pack|packe)(\s|$)/)&&tids.length) return P("rein",{tier:tids[0],bucht:bids[0]||null},bids.length?"exakt":"vermutet");
  /* Orte */
  for(const w of t.split(" ")){ if(HS_ORTE[w]&&(zeig||t.split(" ").length<=2)) return P("zeige",{ort:HS_ORTE[w]},zeig?"exakt":"vermutet"); }
  return null;
}

/* ── Plan prüfen, Vorschau, Ausführen (reine Funktionen, UI-unabhängig) ── */
function hsPlanPruefen(plan){
  if(!plan) return {ok:false,grund:"Das habe ich nicht verstanden."};
  const w=hsWerkzeug(plan.werkzeug); if(!w) return {ok:false,grund:"Unbekanntes Werkzeug „"+plan.werkzeug+"“."};
  if(!S) return {ok:false,grund:"Kein Spielstand."};
  try{ const r=w.pruefen?w.pruefen(plan.args||{}):{ok:true,args:plan.args||{}}; if(!r.ok) return r; return {ok:true,args:r.args||{},werkzeug:w}; }
  catch(e){ return {ok:false,grund:"Prüfung gescheitert: "+((e&&e.message)||e)}; }
}
function hsVorschauText(plan){
  const c=hsPlanPruefen(plan); if(!c.ok) return "⛔ "+c.grund;
  let v=""; try{ v=c.werkzeug.vorschau?c.werkzeug.vorschau(c.args):""; }catch(e){ v="(Vorschau nicht möglich: "+((e&&e.message)||e)+")"; }
  return (c.werkzeug.z||"")+" "+c.werkzeug.n+(v?": "+v:"")+(c.werkzeug.gefahr===2?" · ⚠️ nicht rückgängig zu machen":"");
}
function hsAusfuehren(plan){
  const c=hsPlanPruefen(plan); if(!c.ok) return "⛔ "+c.grund;
  let r=""; try{ r=c.werkzeug.ausfuehren(c.args); }catch(e){ r="⛔ Ausführung gescheitert: "+((e&&e.message)||e); }
  try{ if(typeof sichern==="function") sichern(); if(typeof kopfNeu==="function") kopfNeu(); }catch(e){}
  _hs.protokoll.push({tag:S&&S.tag,werkzeug:c.werkzeug.id,args:c.args,ergebnis:r}); _hs.protokoll=_hs.protokoll.slice(-30);
  try{ if(typeof questHook==="function") questHook("hofsprecher",c.werkzeug.id); }catch(e){}
  return r||"Erledigt.";
}
/* Needle-Antwort → Plan (Argumentnamen bleiben, Werkzeug über en-Name) */
function hsNadelPlan(antwort){
  if(!antwort||!antwort.calls||!antwort.calls.length) return null;
  const c=antwort.calls[0]; const w=hsWerkzeug(c.name); if(!w) return null;
  const args={}; for(const k in w.params){ const en=hsEnName(k); const roh=(c.arguments||{}); const v=roh[en]!==undefined?roh[en]:roh[k]; if(v!==undefined) args[k]=hsDeWert(k,v); }
  if(w.id==="annehmen"&&typeof args.tiere==="string") args.tiere=Array.from(args.tiere.split(/[,\s]+/).filter(Boolean));
  return {werkzeug:w.id,args,sicherheit:"vermutet",quelle:"nadel",konfidenz:antwort.konfidenz,tps:antwort.tps,ms:antwort.ms};
}

/* ── Oberfläche (im Ada-Menü) ─────────────────────────────── */
function hsPanelHtml(){
  const st=(typeof needleStatus==="function")?needleStatus():{status:"aus"};
  const nadel=st.status==="bereit"?"🪡 Nadel bereit ("+(st.quelle||"")+(st.tps?", "+Math.round(st.tps)+" tok/s":"")+")":st.status==="laedt"?"⏳ Nadel lädt … "+Math.round((st.fortschritt||0)*100)+" %":st.status==="fehler"?"⛔ "+(st.fehler||"Fehler"):"";
  const mikro=(typeof window!=="undefined"&&(window.SpeechRecognition||window.webkitSpeechRecognition))?'<button class="knopf s hell" id="hsMikroKn" onclick="hsMikro()" title="Sprechen (Browser-Spracherkennung, de-DE)">'+(_hs.hoert?"🔴":"🎙️")+'</button>':"";
  return '<div id="hsPanel" style="margin-top:10px;border-top:1px dashed var(--holz-4,#c9a) ;padding-top:6px"><div class="reihe" style="justify-content:space-between;gap:5px"><b style="font-size:11px">🪡 Hofsprecher – sag dem Hof, was er tun soll</b><button class="knopf s hell" onclick="adaSprich(\'hilfe_hofsprecher\',true)" title="Ada erklärt den Hofsprecher">🔊 Ada erklärt</button></div>'+ 
    '<div class="reihe" style="gap:4px;margin-top:4px"><input id="hsFeld" placeholder="z. B. „kauf zwei Solarmodule“ oder „wie wird das Wetter?“" value="'+esc(_hs.letzte||"")+'" onkeydown="if(event.key===\'Enter\')hsSenden()" style="flex:1;min-width:120px">'+
    '<button class="knopf s" onclick="hsSenden()">Sag’s</button>'+mikro+'</div>'+
    '<div style="font-size:10.5px;color:var(--tinte-2);margin-top:3px">Erst Wörterbuch (Deutsch, exakt), dann Nadel – ein 45-Millionen-Parameter-Modell im Browser (Englisch am besten, Deutsch teilweise). Deshalb siehst du immer erst eine Vorschau; nichts passiert ohne dein „Machen“.</div>'+
    '<div class="reihe" style="gap:6px;margin-top:4px;align-items:center">'+(st.status==="bereit"?'':(st.status==="laedt"?'':'<button class="knopf s hell" onclick="hsNadelLaden()" '+((typeof needleMoeglich==="function"&&!needleMoeglich())?'disabled':'')+'>🪡 Nadel laden ('+NEEDLE_REGELN.groesseMB+' MB, einmalig)</button>'))+'<small id="hsNadelStatus">'+esc(nadel||((typeof needleHinweis==="function")?needleHinweis():""))+'</small></div>'+
    '<div id="hsAntwort" style="margin-top:6px;font-size:12px;white-space:pre-line">'+(_hs.nadelInfo?esc(_hs.nadelInfo):"")+'</div></div>';
}
function hsAntwortSetzen(html){ const a=document.getElementById("hsAntwort"); if(a) a.innerHTML=html; }
function hsVorschauHtml(plan){
  const c=hsPlanPruefen(plan); const txt=hsVorschauText(plan);
  const quelle=plan.quelle==="nadel"?'<div style="font-size:10.5px;color:var(--tinte-2)">🪡 Nadel-Vorschlag · Konfidenz '+(Math.round((plan.konfidenz||0)*100))+' % · '+(plan.tps?Math.round(plan.tps)+' tok/s · ':'')+(plan.ms?(plan.ms/1000).toFixed(1)+' s':'')+' – bitte genau lesen, Deutsch versteht Nadel nur teilweise.</div>':(plan.sicherheit==="vermutet"?'<div style="font-size:10.5px;color:var(--tinte-2)">Vermutung des Wörterbuchs – bitte prüfen.</div>':"");
  if(!c.ok) return '<div class="karte hell" style="margin:0"><p>'+esc(txt)+'</p>'+quelle+'</div>';
  if(c.werkzeug.gefahr===0) return '<div class="karte hell" style="margin:0"><p>'+esc(hsAusfuehren(plan))+'</p>'+quelle+'</div>';
  return '<div class="karte hell" style="margin:0"><p><b>Vorschau:</b> '+esc(txt)+'</p>'+quelle+'<div class="reihe" style="gap:4px;margin-top:4px"><button class="knopf s '+(c.werkzeug.gefahr===2?"rot":"gruen")+'" onclick="hsBestaetigen()">'+(c.werkzeug.gefahr===2?"Ja, wirklich":"Machen")+'</button><button class="knopf s hell" onclick="hsVerwerfen()">Lieber nicht</button></div></div>';
}
async function hsSenden(text){
  const feld=document.getElementById("hsFeld"); const eingabe=(typeof text==="string")?text:((feld||{}).value||"");
  const t=String(eingabe||"").trim(); if(!t||_hs.laeuft) return; _hs.letzte=t; _hs.laeuft=true; _hs.nadelInfo="";
  try{
    let plan=hsParsen(t);
    if(!plan||plan.sicherheit!=="exakt"){
      if(typeof needleBereit==="function"&&needleBereit()){
        hsAntwortSetzen('<span style="color:var(--tinte-2)">🪡 Nadel denkt nach …</span>');
        try{ await needleWerkzeuge(hsWerkzeugeJson(),""); const a=await needleFragen(t); const np=hsNadelPlan(a);
          if(np&&(!plan||np.werkzeug!==plan.werkzeug||!plan.sicherheit)) plan=np; else if(np&&plan){ plan.konfidenz=a.konfidenz; }
          if(!np&&!plan) _hs.nadelInfo="🪡 Nadel fand kein passendes Werkzeug (Konfidenz "+Math.round((a.konfidenz||0)*100)+" %, "+(a.ms/1000).toFixed(1)+" s).";
        }catch(e){ _hs.nadelInfo="🪡 Nadel antwortete nicht ("+((e&&e.message)||e)+") – Wörterbuch übernimmt."; }
      }
    }
    if(!plan){ hsAntwortSetzen('<div class="karte hell" style="margin:0"><p>Das habe ich nicht verstanden. '+(_hs.nadelInfo?esc(_hs.nadelInfo)+" ":"")+(typeof needleBereit==="function"&&needleBereit()?"":"Mit geladener Nadel verstehe ich auch freie Formulierungen (vor allem auf Englisch). ")+'Beispiele: '+HS_REGELN.beispiele.slice(0,5).map(b=>"„"+b+"“").join(", ")+'.'+(_adaKey?' Freie Fragen beantwortet Ada oben mit deinem Schlüssel.':'')+'</p></div>'); _hs.plan=null; return; }
    _hs.plan=plan; hsAntwortSetzen(hsVorschauHtml(plan));
    if(typeof adaAn==="function"&&adaAn()&&typeof adaTTSText==="function"){ const c=hsPlanPruefen(plan); if(c.ok&&c.werkzeug.gefahr>0) try{ adaTTSText("Vorschau: "+hsVorschauText(plan).replace(/[⛔⚠️✅·]/g," ").slice(0,220),false); }catch(e){} }
  } finally { _hs.laeuft=false; }
}
function hsBestaetigen(){ if(!_hs.plan) return; const r=hsAusfuehren(_hs.plan); _hs.plan=null; hsAntwortSetzen('<div class="karte hell" style="margin:0"><p>✅ '+esc(r)+'</p></div>'); const f=document.getElementById("hsFeld"); if(f){ f.value=""; _hs.letzte=""; } }
function hsVerwerfen(){ _hs.plan=null; hsAntwortSetzen('<div class="karte hell" style="margin:0"><p>Gut, nichts passiert.</p></div>'); }
async function hsNadelLaden(){
  if(typeof needleLaden!=="function") return; const st=document.getElementById("hsNadelStatus");
  const ok=await needleLaden((f,txt)=>{ if(st) st.textContent="⏳ "+txt+" ("+Math.round(f*100)+" %)"; });
  if(typeof adaExtraNeu==="function") adaExtraNeu();
  if(ok) melde("🪡 Nadel ist bereit – Needle 2 rechnet jetzt im Browser, nichts verlässt deinen Rechner.","gut"); else melde((typeof needleStatus==="function"&&needleStatus().fehler)||"Nadel konnte nicht geladen werden.","schlecht");
}
function hsMikro(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){ melde("Dein Browser hat keine Spracherkennung – bitte tippen.","schlecht"); return; }
  if(_hs.hoert) return; const r=new SR(); r.lang="de-DE"; r.interimResults=false; r.maxAlternatives=1; _hs.hoert=true; const kn=document.getElementById("hsMikroKn"); if(kn) kn.textContent="🔴";
  r.onresult=(ev)=>{ const t=(ev.results[0][0].transcript||"").trim(); const f=document.getElementById("hsFeld"); if(f) f.value=t; hsSenden(t); };
  r.onerror=(ev)=>{ melde("Spracherkennung: "+(ev.error||"Fehler"),"schlecht"); };
  r.onend=()=>{ _hs.hoert=false; const k=document.getElementById("hsMikroKn"); if(k) k.textContent="🎙️"; };
  try{ r.start(); }catch(e){ _hs.hoert=false; }
}

/* ── Ada ohne Schlüssel: Live-Werkzeuge + lokale Hofbuch-Suche ─────────────────
   Keine Erfindung: Ada zeigt die Hofbuch-Stelle, die am besten zur Frage passt, oder
   führt ein Nur-Anzeige-Werkzeug aus (Status, Wetter, Kasse, Zettel). Alles offline. */
const HS_STOPP=new Set("der die das und oder ein eine einen einem einer ist sind war wie was wo wann warum wieso weshalb kann ich du er sie es wir ihr man mich mir dir sich den dem des im in am an auf zu zum zur mit von vom bei aus fuer ueber unter nach vor nicht kein keine auch noch schon mal doch denn dann also so sehr viel mehr weniger wenn als ob dass hier da dort jetzt heute morgen gestern bitte hallo ada frage frag sag mal welche welcher welches meine mein meinen meiner dein deine deinen soll sollte muss muessen kann koennen darf duerfen wird werden hat haben habe gibt geht macht machen tun lassen".split(" "));
function hsStamm(w){ w=w.replace(/[^a-z0-9]/g,""); if(w.length<=4) return w; for(const e of ["ungen","ung","heit","keit","lich","isch","ern","ere","en","er","es","em","st","e","n","s"]){ if(w.length-e.length>=4&&w.endsWith(e)) return w.slice(0,-e.length); } return w; }
function hsTokens(t){ return hsNorm(t).split(" ").filter(w=>w.length>=3&&!HS_STOPP.has(w)).map(hsStamm).filter(Boolean); }
let _hsIndex=null,_hsIndexStand="";
function hsIndex(){
  const stand=String((typeof S!=="undefined"&&S)?(S.tag+":"+(S.xp||0)):"0");
  if(_hsIndex&&_hsIndexStand===stand) return _hsIndex;
  const docs=[]; const plain=h=>String(h||"").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim();
  try{ const html=hofbuchHtml(); const teile=html.split(/<div class="karte" id="hb_/).slice(1);
    for(const teil of teile){ const id=teil.slice(0,teil.indexOf('"')); const titel=plain((teil.match(/<h3>([\s\S]*?)<\/h3>/)||[])[1]||id); const text=plain(teil.replace(/<h3>[\s\S]*?<\/h3>/,""));
      const absaetze=text.split(/(?<=[.!?])\s+(?=[A-ZÄÖÜ0-9„•])/); let puffer="";
      for(const a of absaetze){ puffer+=(puffer?" ":"")+a; if(puffer.length>=260){ docs.push({kap:id,titel,text:puffer}); puffer=""; } } if(puffer) docs.push({kap:id,titel,text:puffer}); } }catch(e){}
  try{ (typeof WISSEN_ALLGEMEIN!=="undefined"?WISSEN_ALLGEMEIN:[]).forEach(k=>docs.push({kap:"kompendium",titel:k.t,text:k.txt+(k.quelle?" (Quelle: "+k.quelle+")":"")})); }catch(e){}
  try{ Object.entries(typeof ADA_TEXTE!=="undefined"?ADA_TEXTE:{}).forEach(([id,d])=>docs.push({kap:"ada:"+id,titel:d.titel||id,text:d.t||""})); }catch(e){}
  const df={}; docs.forEach(d=>{ d.tok=hsTokens(d.text); d.tit=hsTokens(d.titel); new Set([...d.tok,...d.tit]).forEach(w=>{ df[w]=(df[w]||0)+1; }); });
  _hsIndex={docs,df,n:docs.length}; _hsIndexStand=stand; return _hsIndex;
}
function hsSuche(frage,k=2){
  const ix=hsIndex(); const q=hsTokens(frage); if(!q.length) return [];
  const idf=w=>Math.log(1+ix.n/(1+(ix.df[w]||0)));
  const bewertet=ix.docs.map(d=>{ let s=0; for(const w of q){ const tf=d.tok.filter(x=>x===w).length; if(tf) s+=(1+Math.log(tf))*idf(w); if(d.tit.includes(w)) s+=(tf?2:0.8)*idf(w); } return {d,s}; }).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
  return bewertet.slice(0,k);
}
function hsAdaAntwort(frage){
  const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const plan=hsParsen(frage); const w=plan&&hsWerkzeug(plan.werkzeug);
  if(plan&&w&&w.gefahr===0&&plan.sicherheit==="exakt"&&["status","kassenbuch","wetterbericht","zettel_zeigen","auftrag_zeigen","hilfe"].includes(w.id)){ const r=hsAusfuehren(plan); return {html:'<p>'+e(r)+'</p><div style="font-size:10.5px;color:var(--tinte-2)">Live aus dem Spielstand (Hofsprecher).</div>',text:r,quelle:"werkzeug"}; }
  if(plan&&w&&w.gefahr>0){ const v=hsVorschauText(plan); return {html:'<p>Das klingt nach einer Aktion: <b>'+e(w.n)+'</b>. '+e(v)+'</p><p style="font-size:10.5px;color:var(--tinte-2)">Zum Ausführen oben im Hofsprecher eingeben – dort gibt es die Vorschau mit „Machen“.</p>',text:"Das klingt nach einer Aktion: "+w.n+". "+v,quelle:"werkzeug"}; }
  const treffer=hsSuche(frage,2);
  if(!treffer.length) return {html:'<p>Dazu finde ich im Hofbuch nichts. Frag mit anderen Worten (z. B. „Was kostet Strom nachts?“, „Wie funktioniert die Zucht?“) oder schlag das Hofbuch auf.</p>',text:"Dazu finde ich im Hofbuch nichts. Frag mit anderen Worten oder schlag das Hofbuch auf.",quelle:"keine"};
  const best=treffer[0].d; const text=best.text.length>420?best.text.slice(0,400).replace(/\s\S*$/,"")+" …":best.text;
  const kapKnopf=best.kap.startsWith("ada:")?'<button class="knopf s hell" onclick="adaSprich(\''+e(best.kap.slice(4))+'\',true)">🔊 Ada dazu anhören</button>':'<button class="knopf s hell" onclick="zeigeHofbuch();setTimeout(()=>hbSpring(\''+e(best.kap)+'\'),300)">📖 Im Hofbuch: '+e(best.titel)+'</button>';
  const zweite=treffer[1]&&treffer[1].d.kap!==best.kap?'<div style="font-size:10.5px;color:var(--tinte-2);margin-top:3px">Auch passend: '+e(treffer[1].d.titel)+'</div>':"";
  return {html:'<p><b>'+e(best.titel)+':</b> '+e(text)+'</p><div class="reihe" style="gap:4px;margin-top:4px">'+kapKnopf+'</div>'+zweite+'<div style="font-size:10.5px;color:var(--tinte-2);margin-top:3px">Aus dem Hofbuch gesucht, nichts erfunden – ohne Schlüssel, ohne Netz.</div>',text:best.titel+": "+text,quelle:"hofbuch",kap:best.kap};
}

/* ── Hofbuch ──────────────────────────────────────────────── */
function hsHofbuchHtml(){
  const f=(typeof NEEDLE_REGELN!=="undefined")?NEEDLE_REGELN.fakten:{};
  return '<p><b>Sag dem Hof, was er tun soll.</b> Der Hofsprecher (Ada-Menü, Kopf oben rechts) nimmt Sätze wie „kauf zwei Solarmodule“, „nimm j12 mit t3 und t4 an“ oder „wie wird das Wetter?“ entgegen – getippt oder gesprochen (Browser-Spracherkennung). Er arbeitet in drei Stufen:</p><ol>'+
    HS_REGELN.stufen.map(s=>'<li>'+esc(s)+'</li>').join("")+'</ol>'+
    '<p><b>Wahrheitsregel:</b> Kein Modell erzeugt Zahlen. Jeder Satz wird zu einem Werkzeug mit Parametern; die Vorschau rechnet mit denselben Spielfunktionen wie die Knöpfe (Preis, Frist, Erfolgschance). Nichts verändert den Hof, bevor du „Machen“ drückst; Verkauf und Auftragsrückgabe fragen doppelt. Nur-Anzeige-Werkzeuge (Status, Wetter, Kassenbuch, Zettel) laufen sofort.</p>'+
    '<p><b>Nadel = Needle 2</b> (Cactus Compute, Apache-2.0): '+esc(f.parameter||"45 Mio.")+' Parameter in '+esc(f.datei||"13,7 MB")+', '+esc(f.ram||"≈ 28 MB")+' Arbeitsspeicher, Kontext '+esc(f.kontext||"256 Token")+', Ausgabe ausschließlich JSON-Werkzeugaufrufe (per Grammatik erzwungen), trainiert auf '+esc(f.sprache||"Englisch")+'. Sie wird erst auf Wunsch geladen (einmalig '+NEEDLE_REGELN.groesseMB+' MB, danach aus dem Browser-Cache, auch offline) und rechnet in einem Web Worker vollständig auf deinem Gerät – es wird nichts hochgeladen. Gemessen am 02.09.2026: Englisch 24 von 25 Hof-Befehlen richtig, Deutsch 14 von 22; Antwort in 3–4 s bei 45–110 Token/s. Darum steht die Nadel hinter dem deutschen Wörterbuch und vor jeder Ausführung eine Vorschau. Was die Nadel nicht kann: Texte schreiben, plaudern, Wissen erklären, Zettel erfinden – dafür gibt es das Hofbuch, die Zettelschmiede und Ada mit eigenem Schlüssel.</p>'+
    '<p><b>Werkzeuge:</b> '+HS_WERKZEUGE.map(w=>'<span class="merk" title="'+esc(w.desc)+'">'+(w.z||"")+' '+esc(w.n)+(w.gefahr===2?' ⚠️':'')+'</span>').join(" ")+'</p>'+
    '<p><b>Ada ohne Schlüssel:</b> Fragen im Ada-Menü beantwortet Ada lokal – Live-Werkzeuge für Status, Wetter, Kasse und Zettel, sonst die passendste Hofbuch-Stelle per Volltextsuche (Wortstämme, Titel doppelt gewichtet). Sie erfindet nichts; mit eigenem OpenRouter-Schlüssel formuliert sie zusätzlich frei.</p>'+
    '<p><b>Treiber:</b> <code>sag &lt;Satz&gt;</code> zeigt Werkzeug und Vorschau, <code>sag! &lt;Satz&gt;</code> führt aus (nur Wörterbuch-Stufe, ohne WebAssembly).</p>';
}

Object.assign(window,{hsAdaAntwort,hsSuche,hsTokens,hsIndex,HS_EN_PARAM,hsEnName,hsDeWert,HS_REGELN,HS_WERKZEUGE,hsNorm,hsZahl,hsParsen,hsPlanPruefen,hsVorschauText,hsAusfuehren,hsNadelPlan,hsWerkzeugeJson,hsWerkzeug,hsPanelHtml,hsSenden,hsBestaetigen,hsVerwerfen,hsNadelLaden,hsMikro,hsHofbuchHtml});
