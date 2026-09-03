/* ═════════════════════════════════════════════════════════
   Ära 9 · Datenschutz & Aufsicht (Compliance) – Spec: dev/NEEDLE_DESIGN.md, Teil G
   ─────────────────────────────────────────────────────────
   Zettel aus Medizin, Recht, Steuer, Personal und Pflege tragen personenbezogene Daten.
   Wer sie mit ungeschulten Modellen oder über Leih-Tiere in der Cloud bearbeitet, riskiert
   einen Verstoß: Strafe, Ruf, Groll des Kunden und eine Abmahnung der Datenschutzaufsicht.
   Nach der zweiten Abmahnung (Behütet: dritten) wird der Hof geschlossen.
   Schutz: Datenschutz-Schulung je Modell (Agentenwerkstatt) oder ein Agenten-Tool mit
   Rechtebegrenzung, Sandbox und Prüfprotokoll; Forschung „Schutzregeln“ und Kontrollpaket senken das Risiko.
   Alle Zahlen stehen in DS_REGELN und im Hofbuch.
   ═══════════════════════════════════════════════════════ */
const DS_REGELN={
  risiko:{
    1:{n:"erhöht",p:0.15,anteil:0.12,fix:60,ruf:-4,groll:2},
    2:{n:"hoch",p:0.30,anteil:0.25,fix:150,ruf:-8,groll:3}
  },
  sektorRisiko:{medizin:2,recht:2,steuer:2,personal:2,pflege:2,finanzen:1,bildung:1,verwaltung:1,soziales:1,sicherheit:1},
  artRisiko:{medizin:2,recht:2},
  schulung:{preis:80,n:"Datenschutz-Schulung",z:"🛡️",txt:"Ein Tag Schulung: PII erkennen, schwärzen, Zweckbindung, Löschfristen – als Systemanweisung und Prüfschritt fest im Modell verankert."},
  guardrailsF:0.5, kontrolleF:0.7, apiF:2,
  abmahnungMax:{behuetet:3,hofalltag:2,markt:2}
};
function dsRisiko(j){
  if(!j) return 0; let r=Number(j.risiko)||0;
  if(!r){ if(DS_REGELN.artRisiko[j.art]) r=DS_REGELN.artRisiko[j.art]; else if(j.dsgvo) r=1;
    const K=(typeof KUNDEN!=="undefined"&&j.kunde)?KUNDEN[j.kunde]:null;
    if(K&&K.sektor&&DS_REGELN.sektorRisiko[K.sektor]) r=Math.max(r,DS_REGELN.sektorRisiko[K.sektor]);   /* v9.8: ein Steuerbüro bleibt ein Steuerbüro, auch beim kleinen Zettel */
    if(K&&K.lokalPflicht&&r<1) r=1; }
  return Math.min(2,Math.max(0,r));
}
/* Schutzfaktor 0…1: Datenschutz-Fachwissen senkt das Risiko linear (0 ab verstossVoll), Fachwissen im Gebiet zählt anteilig, ein Agenten-Tool mit Schutzfunktionen halbiert den Rest */
function dsSchutzFaktor(p,g){
  if(!p) return 1; const ds=fachWert(p,"datenschutz"); const fw=(g&&g!=="datenschutz")?fachWert(p,g)*FACH_REGELN.fachAnteil:0;
  let f=1-Math.min(100,Math.max(ds,fw))/100; if(ds>=FACH_REGELN.verstossVoll) f=0;
  const h=(typeof HARNESSE!=="undefined"&&p.geschirr)?HARNESSE[p.geschirr]:null; if(h&&h.schutz) f*=FACH_REGELN.geschirrF;
  return Math.max(0,Math.min(1,Math.round(f*100)/100));
}
function dsGeschuetzt(p,g){ return dsSchutzFaktor(p,g||null)<=0.25; }
function dsSchutzText(p,g){ if(!p) return ""; if(p.api) return "Leih-Tier (Cloud, nicht schulbar)"; const f=dsSchutzFaktor(p,g||null); const h=(typeof HARNESSE!=="undefined"&&p.geschirr)?HARNESSE[p.geschirr]:null;
  return (f<=0?"voll geschützt":f<=0.25?"geschützt":f<0.6?"teilweise geschützt":"ungeschützt")+" (Datenschutz "+fachWert(p,"datenschutz")+"/100"+(h&&h.schutz?", Agenten-Tool mit Schutzfunktionen":"")+", Risiko ×"+f+")"; }
function dsWahrscheinlichkeit(j,ps){
  const r=dsRisiko(j); if(!r) return {r:0,p:0,offen:[]};
  const R=DS_REGELN.risiko[r], g=fachGebietVonJob(j); const tiere=(ps||[]).filter(Boolean); if(!tiere.length) return {r,p:0,offen:[]};
  let sicher=1; const offen=[];
  for(const p of tiere){ const f=dsSchutzFaktor(p,g)*(p.api?DS_REGELN.apiF:1); if(f>0.25) offen.push(p); sicher*=1-Math.min(0.95,R.p*f); }
  let p=1-sicher; if(typeof forschungFrei==="function"&&forschungFrei("guardrails")) p*=DS_REGELN.guardrailsF;
  if(j.kontrolle) p*=DS_REGELN.kontrolleF;
  if(j.agent&&typeof mcpEffekte==="function") p*=mcpEffekte().dsF;   /* v9.9: MCP elicitation, Prüfprotokoll, Fernleitung ohne OAuth */
  return {r,p:Math.min(0.95,Math.round(p*100)/100),offen};
}
function dsPruefung(j,ps){
  const d=dsWahrscheinlichkeit(j,ps); if(!d.r) return {r:0,p:0,warnung:""};
  if(!ps||!ps.length) return {r:d.r,p:0,offen:[],warnung:"🛡️ Datenschutz ("+DS_REGELN.risiko[d.r].n+"): Fachwissen ist Pflicht; Datenschutz-Kurse senken das Risiko, Agenten-Tools mit Schutzfunktionen halbieren nur den verbleibenden Anteil. Grundrisiko "+Math.round(DS_REGELN.risiko[d.r].p*100)+" %."};
  if(!d.p) return {r:d.r,p:0,offen:[],warnung:"🛡️ Datenschutz ("+DS_REGELN.risiko[d.r].n+"): alle eingeteilten Modelle sind geschützt – durch Datenschutz-Fachwissen oder ein Agenten-Tool mit Schutzfunktionen."};
  const R=DS_REGELN.risiko[d.r];
  return {...d,warnung:"⚠️ Datenschutz-Risiko "+Math.round(d.p*100)+" % ("+R.n+"): "+(d.offen.length?d.offen.map(p=>p.name+" ("+dsSchutzText(p,fachGebietVonJob(j))+")").join(", "):"Restrisiko")+" – ein Verstoß kostet "+Math.round(R.anteil*100)+" % des Lohns + "+R.fix+" €, Ruf "+R.ruf+" und eine Abmahnung. Schulung: Agentenwerkstatt."};
}
/* v9.8: Woher kommt das Risiko? Der Chip nennt die Quelle, damit keine Zahl unerklärt bleibt. */
function dsRisikoQuelle(j){
  if(!j) return ""; const K=(typeof KUNDEN!=="undefined"&&j.kunde)?KUNDEN[j.kunde]:null;
  if(DS_REGELN.artRisiko[j.art]) return "Fachgebiet "+j.art;
  if(K&&K.sektor&&DS_REGELN.sektorRisiko[K.sektor]) return "Kunde aus "+(((typeof BERUF_SEKTOREN!=="undefined")&&BERUF_SEKTOREN[K.sektor])||K.sektor);
  if(j.sektor&&DS_REGELN.sektorRisiko[j.sektor]) return "Sektor "+(((typeof BERUF_SEKTOREN!=="undefined")&&BERUF_SEKTOREN[j.sektor])||j.sektor);
  if(K&&K.lokalPflicht) return "Kunde verarbeitet nur vor Ort";
  if(j.dsgvo) return "Zettel mit personenbezogenen Daten";
  if(Number(j.risiko)) return "Beruf mit personenbezogenen Daten";
  return "personenbezogene Daten";
}
/* v9.8: Wo personenbezogene Daten im Spiel sind, bleiben sie auf dem Hof – hohes Risiko heißt immer Vor-Ort-Pflicht. */
function dsJobNachruesten(j){ if(!j) return j; if(dsRisiko(j)>=2) j.dsgvo=true; return j; }
function dsChip(j){
  const r=dsRisiko(j); if(!r) return ""; const R=DS_REGELN.risiko[r]; const fa=fachAnforderung(j);
  return '<span class="merk '+(r===2?"schlecht":"")+'" title="Quelle: '+dsRisikoQuelle(j)+'. Verstoß ohne Schutz: '+Math.round(R.p*100)+' % Risiko, Strafe '+Math.round(R.anteil*100)+' % + '+R.fix+' €, Abmahnung">🛡️ Datenschutz '+R.n+' · '+dsRisikoQuelle(j)+'</span>'+(fa?'<span class="merk lila" title="'+FACH_GEBIETE[fa.gebiet].txt+'">🎓 '+FACH_GEBIETE[fa.gebiet].n+' ≥ '+fa.min+'</span>':'');
}
function dsSchulung(uid,g,kurs,technik){ return fachSchulungStart(uid,g||"datenschutz",kurs,technik); }   /* Ära 9: Schulung = Fachkurs mit Zeit, Geld und Daten */
function dsAbmahnungMax(){ const s=(typeof schwierig==="function")?schwierig():"hofalltag"; return DS_REGELN.abmahnungMax[s]||2; }
/* v9.8 (Spieltest): Lernrampe – der erste Verstoß eines Hofes ist eine Verwarnung, solange der Hof noch
   unter Stufe 2 ist und noch kein Modell einen Datenschutz-Kurs besucht hat. Geld, Ruf und Groll kosten
   trotzdem; nur der Abmahnungszähler bleibt stehen, und Ada zeigt den Weg in die Agentenwerkstatt. Einmal je Hof. */
function dsVerwarnungOffen(){
  if(!S||S.dsVerwarnung||S.abmahnungen) return false;
  if(typeof hofLevel==="function"&&hofLevel().i>=3) return false;   /* v9.9 (R2): Stufe 2 fällt oft schon am ersten Tag – das Fenster reicht bis Stufe 3 */
  return !(S.tiere||[]).some(p=>fachWert(p,"datenschutz")>0);
}
function dsAbmahnung(grund,bericht){
  if(dsVerwarnungOffen()){
    S.dsVerwarnung={tag:S.tag,grund};
    const v="🟠 VERWARNUNG der Datenschutzaufsicht: "+grund+" – die erste Beanstandung eines jungen Hofes (unter Stufe 3, ohne Datenschutz-Kurs) bleibt ohne Abmahnung. Strafe und Rufverlust bleiben. In der Agentenwerkstatt gibt es Datenschutz-Kurse (Fachwissen ≥ "+FACH_REGELN.verstossVoll+" = kein Risiko) und Agenten-Tools mit Schutzfunktionen; die nächste Beanstandung ist Abmahnung 1 von "+dsAbmahnungMax()+".";
    if(bericht&&bericht.zeilen) bericht.zeilen.push({t:v,art:"schlecht"}); else if(typeof melde==="function") melde(v,"schlecht");
    try{ if(typeof adaSprich==="function") adaSprich("datenschutz",true); }catch(e){}
    try{ questHook("ds_verwarnung",null); }catch(e){}
    return 0;
  }
  S.abmahnungen=(S.abmahnungen||0)+1; const n=S.abmahnungen, max=dsAbmahnungMax();
  const t="⚠️ ABMAHNUNG "+n+"/"+max+" der Datenschutzaufsicht: "+grund+(n>=max?"":" – bei "+max+" Abmahnungen wird der Hof geschlossen! Datenschutz-Kurse in der Agentenwerkstatt senken das Risiko (Fachwissen ≥ "+FACH_REGELN.verstossVoll+" = kein Risiko); ein Agenten-Tool mit Schutzfunktionen halbiert nur den Rest.");
  if(bericht&&bericht.zeilen) bericht.zeilen.push({t,art:"schlecht"}); else if(typeof melde==="function") melde(t,"schlecht");
  try{ questHook("abmahnung",null); }catch(e){}
  try{ if(typeof adaSprich==="function"&&n<max) adaSprich("abmahnung",true); }catch(e){}
  if(n>=max) hofSchliessen(grund,bericht);
  return n;
}
function hofSchliessen(grund,bericht){
  if(!S||S.geschlossen) return;
  S.geschlossen={tag:S.tag,grund,abmahnungen:S.abmahnungen||0};
  const t="🚫 HOF GESCHLOSSEN: Nach der "+(S.abmahnungen||0)+". Abmahnung entzieht die Datenschutzaufsicht die Betriebserlaubnis. "+grund;
  if(bericht&&bericht.zeilen) bericht.zeilen.push({t,art:"schlecht"}); else if(typeof melde==="function") melde(t,"schlecht");
  try{ questHook("hof_geschlossen",null); }catch(e){}
  try{ if(typeof adaSprich==="function") adaSprich("abmahnung",true); }catch(e){}
  try{ sichern(); }catch(e){}
}
function dsGeschlossen(){ return !!(S&&S.geschlossen); }
function dsGeschlossenHtml(){
  if(!dsGeschlossen()) return ""; const g=S.geschlossen, e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  return '<div class="karte warnrand"><h3>🚫 Der Hof ist geschlossen</h3><p>Tag '+g.tag+': '+e(g.grund)+'</p>'+
    '<p><b>Was du daraus mitnimmst:</b> Wer personenbezogene Daten verarbeitet, braucht geschulte Leute, dokumentierte Abläufe und Technik, die Rechte begrenzt. Im Spiel heißt das: Datenschutz-Kurse je Modell (Grundkurs, Aufbaukurs, Fachzertifikat – Zeit, Geld, Daten), Agenten-Tools mit Sandbox und Prüfprotokoll, keine Leih-Tiere für Akten und Befunde, die Forschung „Schutzregeln“ und das Kontrollpaket. Im Hofalltag und Marktbetrieb schließen '+DS_REGELN.abmahnungMax.hofalltag+' Abmahnungen den Hof, im behüteten Spiel '+DS_REGELN.abmahnungMax.behuetet+'.</p>'+ 
    '<div class="reihe"><button class="knopf s hell" onclick="adaSprich(\'hof_geschlossen\',true)">🔊 Ada dazu</button><button class="knopf rot" onclick="neustart()">Neu anfangen</button><button class="knopf hell" onclick="zeigeHofbuch();setTimeout(()=>hbSpring(\'auftraege\'),300)">📖 Datenschutz-Regeln lesen</button></div></div>';
}
/* Abnahme: Verstoß würfeln, Strafe buchen, Abmahnung vermerken */
function dsAbschluss(j,ps,bericht,gut){
  fachPraxis(j,ps,gut);   /* Ära 9: Praxis im Fachgebiet */
  const d=dsWahrscheinlichkeit(j,ps); if(!d.r) return null;
  if(!d.p){ if(d.r===2&&bericht&&bericht.zeilen) bericht.zeilen.push({t:"🛡️ Datenschutzprüfung bestanden bei „"+j.t+"“: Datenschutz-Fachwissen beseitigt das Verstoßrisiko, keine Cloud.",art:"gut"}); return null; }
  if(Math.random()>=d.p) return null;
  const R=DS_REGELN.risiko[d.r]; const lohn=j.vereinbart||((typeof jobLohnGesamt==="function")?jobLohnGesamt(j):0);
  const strafe=Math.round(lohn*R.anteil)+R.fix;
  buche(-strafe,"strafe","Datenschutz-Verstoß · "+j.t); if(typeof rufBonusDazu==="function") rufBonusDazu(R.ruf);
  if(j.kunde&&typeof kundeVon==="function"){ const k=kundeVon(j.kunde); k.groll=Math.max(k.groll||0,R.groll); }
  const grund="Verstoß bei „"+j.t+"“: "+(d.offen.length?d.offen.map(p=>p.name).join(", ")+(d.offen.some(p=>p.api)?" (Leih-Tier in der Cloud)":" ohne ausreichendes Datenschutz-Fachwissen"):"Restrisiko trotz Schutz")+" – Strafe "+geld(strafe)+", Ruf "+R.ruf;
  if(bericht&&bericht.zeilen) bericht.zeilen.push({t:"🛡️ DATENSCHUTZ-VERSTOSS: "+grund+". Personenbezogene Daten sind ungeschwärzt in einer Ausgabe gelandet.",art:"schlecht"});
  try{ questHook("ds_verstoss",null); }catch(e){}
  dsAbmahnung("Datenschutz-"+grund,bericht);
  return {strafe,r:d.r};
}

/* ── Ära 9 · Fachbildung: Fachgebiete, Kurse, Fachwissen je Modell ─────────────────
   Ein Kurs ist ein Trainingslauf auf Fachdaten: er kostet Geld, Kuratiertes und Tage, und das
   Modell steht solange nicht zur Verfügung. Jede Stufe hebt das Fachwissen (0–100) im Gebiet;
   saubere Zettel im Gebiet bringen Praxis dazu. Zettel aus sensiblen Sektoren verlangen ein
   Mindest-Fachwissen, das mit den Hoftagen steigt – und zahlen dafür deutlich mehr. */
const FACH_GEBIETE={
  datenschutz:{n:"Datenschutz & DSGVO",z:"🛡️",txt:"PII erkennen und schwärzen, Zweckbindung, Löschfristen, Auskunftsrechte"},
  medizin:{n:"Medizin",z:"🩺",txt:"Befunde, Arztbriefe, Fachbegriffe, Abrechnungsziffern"},
  recht:{n:"Recht",z:"⚖️",txt:"Fristen, Klauseln, Schriftsätze, Belegpflicht"},
  steuer:{n:"Steuern & Buchhaltung",z:"🧾",txt:"Kontierung, Belege, Fristen, Verwaltungsanweisungen"},
  personal:{n:"Personal",z:"👥",txt:"Bewerbungen, Verträge, Gleichbehandlung, Personalakten"},
  finanzen:{n:"Versicherung & Bank",z:"🏦",txt:"Bedingungswerke, Schadensmeldungen, Vollständigkeitsprüfung"}
};
const FACH_VON_SEKTOR={medizin:"medizin",pflege:"medizin",recht:"recht",steuer:"steuer",personal:"personal",finanzen:"finanzen",bildung:"datenschutz",verwaltung:"recht",soziales:"datenschutz",sicherheit:"datenschutz"};
const FACH_KURSE=[
  {id:"grund",n:"Grundkurs",tage:1,preis:150,gb:3,gewinn:25,min:0,txt:"Ein Tag Fachdaten und Prüffragen – die Grundbegriffe sitzen."},
  {id:"aufbau",n:"Aufbaukurs",tage:2,preis:320,gb:6,gewinn:22,min:20,txt:"Zwei Tage Fallarbeit mit Rückfragen – typische Fehler verschwinden."},
  {id:"zertifikat",n:"Fachzertifikat",tage:3,preis:560,gb:10,gewinn:20,min:40,txt:"Drei Tage schwere Fälle und eine Prüfung – belastbar für die Königsklasse."}
];
const FACH_REGELN={max:100,praxisJeZettel:3,praxisMax:85,groesseF:0.05,verstossVoll:90,fachAnteil:0.6,geschirrF:0.5,drift:{tageJePunkt:6,max:20},lohnF:0.008,
  techniken:{kurs:{n:"Kurs (Anweisung + Prüffragen)",tageF:1,preisF:1,gewinnF:1},sft:{n:"SFT auf Fachdaten",tageF:1.3,preisF:1.1,gewinnF:1.15},lora:{n:"LoRA-Adapter",tageF:0.7,preisF:0.85,gewinnF:0.9},qlora:{n:"QLoRA (4-Bit)",tageF:0.7,preisF:0.6,gewinnF:0.85},dpo:{n:"DPO (Haltung & Grenzen)",tageF:1,preisF:1.2,gewinnF:1.2,nur:"datenschutz"}}};
function fachWert(p,g){ if(!p||!g) return 0; if(p.api) return 50; let v=Number((p.fach||{})[g])||0; if(g==="datenschutz"&&p.dsgvoSchulung) v=Math.max(v,45); return Math.min(FACH_REGELN.max,Math.round(v)); }
function fachTechnikFrei(id,g){ const t=FACH_REGELN.techniken[id]; if(!t) return false; if(t.nur&&t.nur!==g) return false; if(id==="kurs") return true; return typeof forschungFrei==="function"&&forschungFrei(id); }
function fachKursKosten(p,kursId,technik,g){ const k=FACH_KURSE.find(x=>x.id===kursId); if(!k||!p) return null; const tid=fachTechnikFrei(technik,g)?technik:"kurs", t=FACH_REGELN.techniken[tid]; const gF=1+FACH_REGELN.groesseF*(p.pT||1);
  return {kurs:k,technik:t,technikId:tid,preis:Math.round(k.preis*t.preisF*gF/10)*10,tage:Math.max(1,Math.round(k.tage*t.tageF)+Math.floor((p.pT||0)/20)),gb:k.gb,gewinn:Math.round(k.gewinn*t.gewinnF)}; }
function fachKurseOffen(p,g){ const v=fachWert(p,g), done=((p&&p.fachKurse||{})[g])||{}; return FACH_KURSE.filter(k=>!done[k.id]&&v>=k.min); }
function fachSchulungStart(uid,g,kursId,technik){
  const p=(S&&S.tiere||[]).find(t=>t.uid===uid); if(!p) return false;
  if(p.api){ melde("Leih-Tiere lassen sich nicht schulen – ihre Gewichte gehören dem Anbieter.","schlecht"); return false; }
  if(!FACH_GEBIETE[g]){ melde("Unbekanntes Fachgebiet – möglich: "+Object.keys(FACH_GEBIETE).join(", "),"schlecht"); return false; }
  if(p.status!=="frei"){ melde(p.name+" ist gerade beschäftigt ("+p.status+").","schlecht"); return false; }
  if(!p.bucht){ melde(p.name+" braucht für die Schulung eine GPU-Bucht – Fachdaten werden trainiert, nicht vorgelesen.","schlecht"); return false; }
  const offen=fachKurseOffen(p,g); const k=kursId?offen.find(x=>x.id===kursId):offen[0];
  if(!k){ melde(p.name+": in "+FACH_GEBIETE[g].n+" ist "+(kursId?"der Kurs „"+kursId+"“ nicht offen":"kein Kurs offen")+" – Voraussetzung fehlt oder alles absolviert (Praxis bringt bis "+FACH_REGELN.praxisMax+").","schlecht"); return false; }
  const technikId=technik||"kurs";
  if(!FACH_REGELN.techniken[technikId]){ melde("Unbekannte Schulungstechnik „"+technikId+"“ – möglich: "+Object.keys(FACH_REGELN.techniken).join(", ")+".","schlecht"); return false; }
  if(!fachTechnikFrei(technikId,g)){ const t=FACH_REGELN.techniken[technikId]; melde(t.n+(t.nur?" ist nur für "+FACH_GEBIETE[t.nur].n+" erlaubt":" muss zuerst erforscht werden")+" – wähle eine freigeschaltete Technik oder das Kursverfahren.","schlecht"); return false; }
  const kk=fachKursKosten(p,k.id,technikId,g); const daten=(S.daten||{}).kuratiert||0;
  if(daten<kk.gb){ melde("Für den "+k.n+" fehlen "+(Math.round((kk.gb-daten)*10)/10)+" GB Kuratiertes – Futterscheune oder Datenlese.","schlecht"); return false; }
  if(!kannZahlen(kk.preis)){ melde("Für den "+k.n+" ("+geld(kk.preis)+") reicht die Kasse nicht.","schlecht"); return false; }
  buche(-kk.preis,"training",FACH_GEBIETE[g].z+" "+k.n+" "+FACH_GEBIETE[g].n+" · "+p.name); S.daten.kuratiert=Math.round((daten-kk.gb)*10)/10;
  p.status="schulung"; p.rest=kk.tage; p.schulung={gebiet:g,kurs:k.id,technik:kk.technikId,tage:kk.tage,gewinn:kk.gewinn,start:S.tag}; S.statistik=S.statistik||{}; S.statistik.schulungen=(S.statistik.schulungen||0)+1;
  melde("🎓 "+p.name+" beginnt den "+k.n+" "+FACH_GEBIETE[g].n+" ("+kk.tage+" Tag"+(kk.tage>1?"e":"")+", "+kk.technik.n+", "+geld(kk.preis)+", "+kk.gb+" GB Kuratiertes) – solange steht das Modell nicht zur Verfügung.","gut");
  try{ questHook("schulung",g); }catch(e){} try{ sichern(); }catch(e){} return true;
}
/* Ein Tag Schulung (aus dem Tageswechsel, nur wenn die Energie reicht) */
function fachSchulungTag(p,bericht){
  if(!p||p.status!=="schulung"||!p.schulung) return; p.rest=(p.rest||1)-1; if(p.rest>0) return;
  const s=p.schulung; p.fach=p.fach||{}; p.fach[s.gebiet]=Math.min(FACH_REGELN.max,Math.round((p.fach[s.gebiet]||0)+s.gewinn));
  p.fachKurse=p.fachKurse||{}; p.fachKurse[s.gebiet]=p.fachKurse[s.gebiet]||{}; p.fachKurse[s.gebiet][s.kurs]=true;
  p.status="frei"; p.rest=0; p.schulung=null;
  if(bericht&&bericht.zeilen) bericht.zeilen.push({t:"🎓 "+p.name+" hat den Kurs "+FACH_GEBIETE[s.gebiet].n+" abgeschlossen: Fachwissen "+p.fach[s.gebiet]+"/100"+(s.gebiet==="datenschutz"?" – das Verstoßrisiko sinkt auf "+Math.round(dsSchutzFaktor(p,null)*100)+" % des Grundwerts":""),art:"gut"});
  try{ questHook("schulung_fertig",s.gebiet); }catch(e){}
}
/* Praxis: saubere Zettel im Gebiet bringen Fachwissen (bis praxisMax) */
function fachPraxis(j,ps,gut){ if(!gut||!j) return; const g=fachGebietVonJob(j); if(!g) return; (ps||[]).forEach(p=>{ if(!p||p.api) return; p.fach=p.fach||{}; const v=Number(p.fach[g])||0; if(v<FACH_REGELN.praxisMax) p.fach[g]=Math.min(FACH_REGELN.praxisMax,v+FACH_REGELN.praxisJeZettel); }); }
function fachGebietVonJob(j){ if(!j) return null; if(j.gebiet&&FACH_GEBIETE[j.gebiet]) return j.gebiet;
  if(j.art==="medizin") return "medizin"; if(j.art==="recht") return "recht";   /* v9.8 (R2): die Fachrichtung des Zettels schlägt den Sektor des Auftraggebers */
  if(j.sektor&&FACH_VON_SEKTOR[j.sektor]) return FACH_VON_SEKTOR[j.sektor];
  const K=(typeof KUNDEN!=="undefined"&&j.kunde)?KUNDEN[j.kunde]:null;   /* v9.8 (R2): auch Stammkunden ohne Sektorfeld tragen ihr Gebiet – sonst blieb ein Apotheken-Zettel ohne Fachpflicht */
  if(K&&K.sektor&&FACH_VON_SEKTOR[K.sektor]) return FACH_VON_SEKTOR[K.sektor];
  /* v9.8 (R2): KEINE Fachpflicht allein wegen Vor-Ort-Pflicht – sonst bräuchte schon der erste Kita-Zettel einen Kurs.
     Das Risiko bleibt (Chip, Verwarnung, Strafe); Pflichtwissen verlangen nur die Fachgebiete Medizin, Recht, Steuern, Personal, Finanzen. */
  return null; }
function fachDrift(tag){ return Math.min(FACH_REGELN.drift.max,Math.floor(((tag||(S&&S.tag)||1)-1)/FACH_REGELN.drift.tageJePunkt)); }
function fachMinFuer(risiko,tier,tag){ return Math.min(90,(risiko>=2?30:18)+(risiko>=2?8:6)*(tier||0)+fachDrift(tag)); }
function fachAnforderung(j){ const g=fachGebietVonJob(j); if(!g) return null; const r=dsRisiko(j); if(!r) return null;   /* ohne Datenschutz-Risiko keine Fachpflicht */ const min=(j.fachMin!==undefined)?j.fachMin:fachMinFuer(r,j.tier||0,j.frisch); return {gebiet:g,min:Math.max(0,Math.min(90,Math.round(min)))}; }
function fachChips(p){ if(!p||p.api) return ""; const f=p.fach||{}; const teile=Object.keys(FACH_GEBIETE).filter(g=>fachWert(p,g)>0).map(g=>'<span class="merk" title="'+FACH_GEBIETE[g].txt+'">🎓 '+FACH_GEBIETE[g].n+' '+fachWert(p,g)+'</span>'); if(p.status==="schulung"&&p.schulung) teile.push('<span class="merk gold">📚 '+FACH_GEBIETE[p.schulung.gebiet].n+' – noch '+p.rest+' Tag(e)</span>'); return teile.join(""); }
function fachSchulungUI(uid,wahl){ if(!wahl) return; const [g,k]=String(wahl).split(":"); const sel=document.getElementById("fachTechnik"); const technik=sel?sel.value:"kurs"; fachSchulungStart(uid,g,k,technik); if(typeof zeigeGeschirr==="function") zeigeGeschirr(); }
function fachAuswahlHtml(p){
  if(!p||p.api) return ""; if(p.status==="schulung"&&p.schulung) return '<span class="merk gold">📚 '+FACH_GEBIETE[p.schulung.gebiet].n+' – noch '+p.rest+' Tag(e)</span>';
  if(p.status!=="frei"||!p.bucht) return '<span class="merk">'+(p.bucht?"beschäftigt":"braucht eine Bucht")+'</span>';
  const opts=[]; for(const g in FACH_GEBIETE){ for(const k of fachKurseOffen(p,g)){ const kk=fachKursKosten(p,k.id,(document.getElementById("fachTechnik")||{}).value||"kurs",g); opts.push('<option value="'+g+':'+k.id+'">'+FACH_GEBIETE[g].z+' '+FACH_GEBIETE[g].n+' – '+k.n+' ('+geld(kk.preis)+', '+kk.tage+' Tag'+(kk.tage>1?"e":"")+', '+kk.gb+' GB, +'+kk.gewinn+')</option>'); } }
  return opts.length?'<select onchange="fachSchulungUI(\''+p.uid+'\',this.value)"><option value="">🎓 Schulung wählen…</option>'+opts.join("")+'</select>':'<span class="merk gut">alle Kurse absolviert</span>';
}
function fachTechnikAuswahlHtml(){ const frei=Object.entries(FACH_REGELN.techniken).filter(([id,t])=>id==="kurs"||(typeof forschungFrei==="function"&&forschungFrei(id))); if(frei.length<=1) return '<span class="merk">Technik: Kurs – LoRA/QLoRA/SFT/DPO nach Forschung wählbar</span>'; return '<label>Technik <select id="fachTechnik" onchange="zeigeGeschirr()">'+frei.map(([id,t])=>'<option value="'+id+'">'+t.n+' (Zeit ×'+t.tageF+', Preis ×'+t.preisF+', Gewinn ×'+t.gewinnF+(t.nur?', nur '+FACH_GEBIETE[t.nur].n:'')+')</option>').join("")+'</select></label>'; }
function fachHofbuchHtml(){
  const R=FACH_REGELN;
  return '<p style="margin-top:8px"><b>🎓 Fachbildung (Ära 9).</b> Jedes Modell trägt je Fachgebiet ('+Object.values(FACH_GEBIETE).map(g=>g.z+' '+g.n).join(', ')+') ein Fachwissen von 0 bis 100. Kurse in der Agentenwerkstatt sind Trainingsläufe: '+FACH_KURSE.map(k=>k.n+' '+k.tage+' Tag'+(k.tage>1?'e':'')+', '+k.preis+' €, '+k.gb+' GB Kuratiertes, +'+k.gewinn+' (ab '+k.min+')').join(' · ')+'. Preis ×(1 + '+R.groesseF+' je Milliarde Parameter, danach auf volle 10 € gerundet), ab 20 B je 20 B ein Tag länger; das Modell steht während des Kurses nicht zur Verfügung und braucht eine GPU-Bucht. Technik nach Forschung wählbar: '+Object.entries(R.techniken).map(([id,t])=>t.n+' (Zeit ×'+t.tageF+', Preis ×'+t.preisF+', Gewinn ×'+t.gewinnF+(t.nur?', nur '+FACH_GEBIETE[t.nur].n:'')+')').join('; ')+'. Praxis: jeder saubere Zettel im Gebiet +'+R.praxisJeZettel+' bis '+R.praxisMax+'.</p>'+ 
    '<p><b>Zettel verlangen Fachwissen:</b> sensible Sektoren fordern Mindestwerte – hoch 30 + 8 je Tier, erhöht 18 + 6 je Tier, plus 1 je '+R.drift.tageJePunkt+' Hoftage (max +'+R.drift.max+'): die Fälle werden schwerer. Fachwissen über dem Minimum bringt bis +8 Qualität; die Zettel zahlen dafür ×(1 + '+R.lohnF+' je Punkt Mindest-Fachwissen) zusätzlich zum Datenschutz-Aufschlag. <b>Verstoßrisiko</b> sinkt linear mit dem Datenschutz-Fachwissen (0 ab '+R.verstossVoll+'), Fachwissen im Gebiet zählt zu '+Math.round(R.fachAnteil*100)+' %, ein Agenten-Tool mit Schutzfunktionen halbiert den Rest. Leih-Tiere gelten als 50 in jedem Gebiet, lassen sich aber nicht schulen.</p>';
}

/* Agentenwerkstatt-Beratung: bestes Agenten-Tool je Modell, Zweck, Schutzstatus, Schulung */
function dsSattlereiHtml(eigene,frei){
  if(!eigene||!eigene.length||!frei||!frei.length) return "";
  const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const zweck=h=>{ const f=(h.funk||{}); if(f.format==="patch"||f.format==="sr") return "Code & Werkzeuge"; if(f.kontext==="retrieval") return "Wissen & Akten"; if(h.basis) return "Büro, Support, Formulare"; return "Agenten-Alltag"; };
  return '<div id="ada-geschirr" class="karte hell"><h3>🧭 Ada empfiehlt: Agenten-Tool nach Modell und Zweck</h3>'+
    '<div class="reihe"><button class="knopf s hell" onclick="adaSprich(\'start_geschirr\',true)">🔊 Ada erklärt Agenten-Tools</button><button class="knopf s hell" onclick="adaSprich(\'team_agenten\',true)">🔊 Agenten-Teams</button><button class="knopf s hell" onclick="adaSprich(\'datenschutz\',true)">🔊 Datenschutz</button><button class="knopf s hell" onclick="adaSprich(\'fachbildung\',true)">🔊 Fachbildung</button></div>'+
    '<div class="werteliste abstand">'+eigene.map(p=>{
      const best=frei.map(([id,h])=>({id,h,sc:geschirrEignung(p,id)})).filter(x=>p.tc>=x.h.tcMin).sort((a,b)=>b.sc-a.sc)[0];
      const an=p.geschirr?HARNESSE[p.geschirr]:null;
      return '<div class="listenzeile"><span style="font-size:22px;flex:0 0 30px;text-align:center">'+(an?an.z:"🐷")+'</span><span class="txt"><b>'+e(p.name)+'</b>'+
        '<span>'+(an?'verwendet '+e(an.n)+' ('+geschirrEignung(p,p.geschirr)+' %)':'noch ohne Agenten-Tool')+(best?' · Empfehlung: '+best.h.z+' '+e(best.h.n)+' ('+best.sc+' % · '+zweck(best.h)+')':' · kein passendes Agenten-Tool (Werkzeugaufrufe zu unzuverlässig)')+'</span>'+
        '<span>🛡️ '+e(dsSchutzText(p))+(fachChips(p)?' · '+fachChips(p):'')+'</span></span>'+
        '<span style="display:flex;gap:4px;flex-wrap:wrap;align-items:center">'+(best&&p.geschirr!==best.id?'<button class="knopf s" onclick="geschirrAnlegen(\''+p.uid+'\',\''+best.id+'\')">Zuweisen</button>':'')+fachAuswahlHtml(p)+'</span></div>';
    }).join("")+'</div><div class="reihe abstand">'+fachTechnikAuswahlHtml()+'</div><p style="font-size:12px">Wähle nach Zweck: Code-Zettel brauchen ein Coding-Tool (Patch/Suchen-Ersetzen), Büro und Support ein leichtes. Akten, Befunde und Personalunterlagen verlangen <b>Fachwissen</b>: Kurse kosten Geld, Kuratiertes und Tage – das Modell fällt solange aus. Gleiche Agenten-Tools im Team sparen Abstimmung.</p></div>';
}
function dsHofbuchHtml(){
  const R=DS_REGELN;
  return fachHofbuchHtml()+'<p style="margin-top:8px"><b>🛡️ Datenschutz & Aufsicht (Ära 9).</b> Zettel aus Medizin, Recht, Steuern, Personal und Pflege tragen personenbezogene Daten (Risiko „hoch“), Finanzen, Bildung, Verwaltung und Soziales (Risiko „erhöht“). Jedes eingeteilte Modell ohne Schutz erzeugt Verstoßrisiko: '+Math.round(R.risiko[1].p*100)+' % (erhöht) bzw. '+Math.round(R.risiko[2].p*100)+' % (hoch) je Abnahme; ein Leih-Tier in der Cloud verdoppelt es, die Forschung „Schutzregeln“ halbiert es, das Kontrollpaket senkt es auf 70 %. '+
    '<b>Woher das Risiko kommt:</b> aus dem Fachgebiet des Zettels (Medizin, Recht), aus dem Sektor des Berufs, aus der Aufgabe selbst (manche Arbeiten fassen auch außerhalb der Risiko-Sektoren personenbezogene Daten an, etwa Zählerstände mit Namen), aus einem Kunden mit Vor-Ort-Pflicht (dann auch bei harmlos wirkenden Büro-Zetteln) oder aus dem DSGVO-Kennzeichen. Der Chip nennt immer die Quelle. Der Chip an der Pinnwand nennt die Quelle. <b>Erste Beanstandung:</b> Solange der Hof unter Stufe 3 ist und noch kein Modell einen Datenschutz-Kurs besucht hat, ist der erste Verstoß eine Verwarnung – Strafe und Ruf kosten trotzdem, der Abmahnungszähler bleibt stehen. Danach zählt jede Beanstandung. '+
    '<b>Risikominderung:</b> Datenschutz-Fachwissen aus Kursen senkt das Restrisiko genau um seinen Wert (Fachwissen 25 lässt 75 % stehen, Fachwissen 60 lässt 40 % stehen) und ab '+FACH_REGELN.verstossVoll+' fällt es auf null. Ein <b>Agenten-Tool mit Schutzfunktionen</b> – Rechtebegrenzung, Sandbox und Prüfprotokoll – halbiert nur das verbleibende Risiko ('+Object.values((typeof HARNESSE!=="undefined")?HARNESSE:{}).filter(h=>h.schutz).map(h=>h.z+' '+h.n).join(', ')+'); es ersetzt weder Fachwissen noch Kurse. Verstoß: Strafe '+Math.round(R.risiko[1].anteil*100)+' % + '+R.risiko[1].fix+' € (erhöht) bzw. '+Math.round(R.risiko[2].anteil*100)+' % + '+R.risiko[2].fix+' € (hoch) des Lohns, Ruf '+R.risiko[1].ruf+'/'+R.risiko[2].ruf+', Groll des Kunden und eine <b>Abmahnung</b>. Nach '+R.abmahnungMax.hofalltag+' Abmahnungen (Behütet: '+R.abmahnungMax.behuetet+') schließt die Aufsicht den Hof – dann hilft nur ein Neuanfang. Der Zettelvergleich zeigt das Risiko vor der Zusage; die Zusage fragt bei Risiko noch einmal nach.</p>';
}
Object.assign(window,{dsVerwarnungOffen,dsRisikoQuelle,dsJobNachruesten,FACH_GEBIETE,FACH_VON_SEKTOR,FACH_KURSE,FACH_REGELN,fachWert,fachTechnikFrei,fachKursKosten,fachKurseOffen,fachSchulungStart,fachSchulungTag,fachPraxis,fachGebietVonJob,fachDrift,fachMinFuer,fachAnforderung,fachChips,fachSchulungUI,fachAuswahlHtml,fachTechnikAuswahlHtml,fachHofbuchHtml,dsSchutzFaktor,DS_REGELN,dsRisiko,dsGeschuetzt,dsSchutzText,dsWahrscheinlichkeit,dsPruefung,dsChip,dsSchulung,dsAbmahnung,dsAbmahnungMax,hofSchliessen,dsGeschlossen,dsGeschlossenHtml,dsAbschluss,dsSattlereiHtml,dsHofbuchHtml});
