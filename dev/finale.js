/* ═══════════════════════════════════════════════════════════════════════════
   Ära 9 · v9.8 — Das Ende: Hofmeisterbrief und Legende
   ---------------------------------------------------------------------------
   Aus dem Spieltest (10 Sonnet-Partien, Runde 1): „Ein klassisches Ende gibt es
   nicht.“ Das Spiel hatte zwölf Hofstufen, aber keinen Abschluss, auf den man
   zusteuern kann. Hier steht er – und zwar auf MEHREREN Wegen.

   Fünf Lebenswerke, jedes eine eigene Spielweise mit eigener Lehre:
     🧬 Zuchtlinie   – Merges über Generationen (Vererbung, Inzucht, Wertverfall)
     🏭 Rechenpark   – Rechenzentrum mit Eigenstrom (PUE, Anschluss, Speicher)
     📚 Forschungsbaum     – alle Forschungen (Training, Quantisierung, Serving, RAG)
     🤝 Handelshaus  – 100 saubere Aufträge und Ruf (Wirtschaft, Kundschaft)
     🎓 Fachhaus     – drei Fachgebiete auf Zertifikatsniveau, ohne Abmahnung

   Hofmeisterbrief: Hofstufe ≥ FINALE_REGELN.stufeMeister UND ≥ 2 Lebenswerke.
   Legende:         Hofstufe 12 UND alle fünf Lebenswerke.
   Beides beendet den Hof NICHT – der Brief hängt im Hofhaus, gespielt wird
   weiter. Nichts davon passiert umsonst: jeder Weg kostet Geld, Zeit und
   Aufmerksamkeit, und jeder verlangt eine andere Kette aus Investitionen.
   ═══════════════════════════════════════════════════════════════════════════ */

const FINALE_REGELN={ stufeMeister:10, wegeMeister:2, stufeLegende:12, praemieMeister:5000, xpMeister:600, praemieLegende:15000, xpLegende:1500 };

const FINALE_WEGE=[
 { id:"zucht", n:"Zuchtlinie", z:"🧬",
   txt:"Eine eigene Linie über drei Generationen: fünf Würfe im Stammbuch und ein Tier der Generation 3.",
   lehre:"Merges vererben Stärken und Fehler; ohne frisches Blut sinkt der Wert, und jede Generation kostet Zeit und Bucht.",
   stand:()=>{ const t=(S.tiere||[]); const gen=Math.max(0,...t.map(p=>p.gen||0)); const w=(S.statistik||{}).merges||0;
     return {ist:Math.min(5,w)+"/5 Würfe · Generation "+gen+"/3", ok:w>=5&&gen>=3}; } },
 { id:"rechen", n:"Rechenpark", z:"🏭",
   txt:"Ausbau zum Rechenzentrum, dazu 10 kWp Solar und 20 kWh Speicher – der Hof trägt seine Last selbst.",
   lehre:"Große Rechenleistung ist ein Energieproblem: Anschluss, Wirkungsgrad (PUE) und Speicher entscheiden über die Rechnung.",
   stand:()=>{ const r=(typeof rh==="function")?rh():null; if(!r) return {ist:"–",ok:false};
     /* Dach, Bestandsanlage UND Freilandfelder zählen. Ohne die Felder wären 10 kWp
        bei maximal zehn 600-W-Dachplätzen konstruktiv unerreichbar. */
     const kwp=Math.round(((typeof rhPV==="function")?rhPV(r):((r.pv||[]).reduce((n,w)=>n+w,0)/1000+(r.solarfelder||0)*2.4+(r.legacySolar||0)))*10)/10, akku=r.akku||0;
     const letzte=(typeof RH_STUFEN!=="undefined")?RH_STUFEN.length-1:2;
     return {ist:(r.stufe>=letzte?"Rechenzentrum":"Ausbaustufe "+(r.stufe+1)+"/"+(letzte+1))+" · "+kwp+"/10 kWp · "+akku+"/20 kWh", ok:r.stufe>=letzte&&kwp>=10&&akku>=20}; } },
 { id:"wissen", n:"Forschungsbaum", z:"📚",
   txt:"Alle Forschungen der Forschungshütte abgeschlossen.",
   lehre:"Jedes Verfahren hat seinen Platz: SFT lehrt Ton, LoRA spart Speicher, Quantisierung kauft Tempo, RAG holt Quellen, Schutzregeln begrenzen Rechte.",
   stand:()=>{ const alle=Object.keys((typeof FORSCHUNG!=="undefined")?FORSCHUNG:{}); const fertig=alle.filter(k=>(S.forschung||{})[((FORSCHUNG[k]||{}).frei)||k]||(S.forschung||{})[k]).length;
     return {ist:fertig+"/"+alle.length+" Forschungen", ok:alle.length>0&&fertig>=alle.length}; } },
 { id:"handel", n:"Handelshaus", z:"🤝",
   txt:"100 abgeschlossene Aufträge und ein Ruf von mindestens 4,5 Sternen.",
   lehre:"Wirtschaft entsteht aus Wiederholung: Fristen halten, Kundschaft pflegen, Kapazität und Preis zusammen denken.",
   stand:()=>{ const j=(S.statistik||{}).jobs||0, st=(typeof rufSterne==="function")?rufSterne():0;
     return {ist:j+"/100 Aufträge · "+st+"/4,5 ⭐", ok:j>=100&&st>=4.5}; } },
 { id:"fach", n:"Fachhaus", z:"🎓",
   txt:"Drei Fachgebiete auf Zertifikatsniveau (Fachwissen ≥ 85) – und keine Abmahnung auf dem Hof.",
   lehre:"Wer mit personenbezogenen Daten arbeitet, braucht geschulte Modelle, dokumentierte Abläufe und Technik, die Rechte begrenzt.",
   stand:()=>{ const g={}; (S.tiere||[]).forEach(p=>Object.entries(p.fach||{}).forEach(([k,v])=>{ g[k]=Math.max(g[k]||0,v); }));
     const zert=Object.values(g).filter(v=>v>=85).length, abm=S.abmahnungen||0;
     return {ist:zert+"/3 Gebiete ≥ 85 · "+abm+" Abmahnungen", ok:zert>=3&&abm===0}; } }
];

function finaleStand(){
  const wege=FINALE_WEGE.map(w=>{ let s={ist:"–",ok:false}; try{ s=w.stand(); }catch(e){} return {...w,...s}; });
  const erreicht=wege.filter(w=>w.ok), stufe=(typeof hofLevel==="function")?hofLevel().i:1;
  const meister=stufe>=FINALE_REGELN.stufeMeister&&erreicht.length>=FINALE_REGELN.wegeMeister;
  const legende=stufe>=FINALE_REGELN.stufeLegende&&erreicht.length>=FINALE_WEGE.length;
  return {wege,erreicht,stufe,meister,legende,gehabt:(S&&S.finale)||null};
}

/* Am Tagesende geprüft. Vergibt einmal den Meisterbrief und einmal die Legende. */
function finalePruefen(bericht){
  if(!S||(typeof dsGeschlossen==="function"&&dsGeschlossen())) return null;
  const st=finaleStand(); S.finale=S.finale||null; let neu=null;
  if(st.meister&&!(S.finale&&S.finale.meister)){
    S.finale={...(S.finale||{}),meister:{tag:S.tag,wege:st.erreicht.map(w=>w.id),stufe:st.stufe}};
    if(typeof buche==="function") buche(FINALE_REGELN.praemieMeister,"foerderung","Hofmeisterbrief");
    S.xp=(S.xp||0)+FINALE_REGELN.xpMeister; neu="meister";
    const t="🏅 HOFMEISTERBRIEF! Die Kammer bestätigt Hofstufe "+st.stufe+" und deine Lebenswerke: "+st.erreicht.map(w=>w.z+" "+w.n).join(", ")+". Prämie "+((typeof geld==="function")?geld(FINALE_REGELN.praemieMeister):FINALE_REGELN.praemieMeister+" €")+", +"+FINALE_REGELN.xpMeister+" XP. Der Hof läuft weiter – die Legende braucht alle fünf Wege und Hofstufe "+FINALE_REGELN.stufeLegende+".";
    if(bericht&&bericht.zeilen) bericht.zeilen.push({t,art:"gut"}); else if(typeof melde==="function") melde(t,"gut");
    try{ if(typeof feier==="function") feier("🏅","Hofmeisterbrief!",true); }catch(e){}
    try{ if(typeof adaSprich==="function") adaSprich("meisterbrief",true); }catch(e){}
    try{ questHook("meisterbrief",null); }catch(e){}
  }
  if(st.legende&&!(S.finale&&S.finale.legende)){
    S.finale={...(S.finale||{}),legende:{tag:S.tag,wege:st.erreicht.map(w=>w.id)}};
    if(typeof buche==="function") buche(FINALE_REGELN.praemieLegende,"foerderung","KI-Gutshof-Legende");
    S.xp=(S.xp||0)+FINALE_REGELN.xpLegende; neu="legende";
    const t="👑 LEGENDE! Alle fünf Lebenswerke und Hofstufe "+FINALE_REGELN.stufeLegende+" – Zuchtlinie, Rechenpark, Forschungsbaum, Handelshaus und Fachhaus stehen zugleich. Prämie "+((typeof geld==="function")?geld(FINALE_REGELN.praemieLegende):FINALE_REGELN.praemieLegende+" €")+", +"+FINALE_REGELN.xpLegende+" XP. Mehr gibt der Hof nicht her – ab hier spielst du für die Ehre.";
    if(bericht&&bericht.zeilen) bericht.zeilen.push({t,art:"gut"}); else if(typeof melde==="function") melde(t,"gut");
    try{ if(typeof feier==="function") feier("👑","KI-Gutshof-Legende!",true); }catch(e){}
    try{ if(typeof adaSprich==="function") adaSprich("meisterbrief",true); }catch(e){}
    try{ questHook("legende",null); }catch(e){}
  }
  return neu;
}

function finaleKarteHtml(){
  if(!S) return "";
  const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const st=finaleStand(); const hat=S.finale||{};
  const kopf=hat.legende?"👑 KI-Gutshof-Legende seit Tag "+hat.legende.tag
            :hat.meister?"🏅 Hofmeisterbrief seit Tag "+hat.meister.tag+" – auf dem Weg zur Legende"
            :"🏅 Weg zum Hofmeisterbrief";
  const bedingung=hat.meister?"Legende: Hofstufe "+FINALE_REGELN.stufeLegende+" und alle fünf Lebenswerke."
            :"Hofstufe "+FINALE_REGELN.stufeMeister+" (jetzt "+st.stufe+") und "+FINALE_REGELN.wegeMeister+" von 5 Lebenswerken (jetzt "+st.erreicht.length+").";
  return '<div class="karte"><h3>'+kopf+'</h3><p>'+e(bedingung)+' Jeder Weg ist ein eigenes Spiel – zwei genügen, alle fünf sind die Legende.</p><div class="werteliste">'+
    st.wege.map(w=>'<div class="listenzeile"><span class="bild">'+w.z+'</span><span class="txt"><b>'+e(w.n)+'</b> '+(w.ok?'<span class="merk gut">erfüllt</span>':'<span class="merk">'+e(w.ist)+'</span>')+'<span>'+e(w.txt)+'</span><span><i>'+e(w.lehre)+'</i></span></span></div>').join("")+
    '</div></div>';
}

function finaleHofbuchHtml(){
  const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  return '<p style="margin-top:8px"><b>🏅 Das Ende: Hofmeisterbrief und Legende (Ära 9).</b> Der Hof hat einen Abschluss, und zu ihm führen mehrere Wege. '+
    'Fünf Lebenswerke stehen nebeneinander: '+FINALE_WEGE.map(w=>w.z+" <b>"+e(w.n)+"</b> – "+e(w.txt)).join(" · ")+'. '+
    'Für den <b>Hofmeisterbrief</b> braucht es Hofstufe '+FINALE_REGELN.stufeMeister+' und zwei dieser Lebenswerke ('+((typeof geld==="function")?geld(FINALE_REGELN.praemieMeister):FINALE_REGELN.praemieMeister+" €")+', +'+FINALE_REGELN.xpMeister+' XP). '+
    'Für die <b>Legende</b> Hofstufe '+FINALE_REGELN.stufeLegende+' und alle fünf ('+((typeof geld==="function")?geld(FINALE_REGELN.praemieLegende):FINALE_REGELN.praemieLegende+" €")+', +'+FINALE_REGELN.xpLegende+' XP). '+
    'Die Wege sind verschieden lang – die Zuchtlinie ist in zwei bis drei Wochen zu schaffen, Handelshaus und Forschungsbaum brauchen zwei bis drei Monate, der Rechenpark verlangt das Rechenzentrum mit Dach und Freilandfeldern: Der Brief ist auf hundert Hoftage und mehr angelegt. Keiner der Wege endet das Spiel: Der Brief hängt im Hofhaus, gespielt wird weiter. Ein geschlossener Hof (zwei Abmahnungen) bekommt keinen Brief – Datenschutz ist Teil der Meisterschaft.</p>';
}

if(typeof window!=="undefined"){ Object.assign(window,{FINALE_REGELN,FINALE_WEGE,finaleStand,finalePruefen,finaleKarteHtml,finaleHofbuchHtml}); }
