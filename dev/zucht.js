/* ═══════════════════════════════════════════════════════════════════════
   Ära 8 · ZUCHT 2.0 – Stammbuch, Merkmale, Würfe
   ───────────────────────────────────────────────────────────────────────
   Dieses Modul kennt keine UI-Bibliothek und keine Timer. Es liefert reine
   Regeln (Merkmale, Wurfgröße, Stammbaum, Verfahrens-Modifikatoren) und
   HTML-Bausteine für Tierkarte und Wurfkarte. Alle Zahlen stehen in
   ZUCHT_REGELN / MERKMALE – das Hofbuch rendert sie von hier, nie aus
   Hand-Texten. Verträge:
   • Ein Tier trägt p.merkmale = [id,…] (max. ZUCHT_REGELN.maxMerkmale ohne
     Optik) und p.optik = [id,…] (reine Schmuck-Merkmale, keine Wirkung).
   • Zuchtkinder tragen p.eltern = {uids:[…], namen:[…], methode} und
     p.wurf = {id, geschwister:[uids]}; Eltern bekommen zuchtRuhe (Hoftag).
   • merkmalHat(p,id) ist die einzige Abfrage, die der Rest des Spiels nutzt.
   ═══════════════════════════════════════════════════════════════════════ */

const ZUCHT_REGELN = {
  wurf:        [0.55, 0.33, 0.12],   /* 1 / 2 / 3 Kinder */
  wurfPflege:  [0.40, 0.40, 0.20],   /* mit Forschung „wurfpflege“ */
  kindAufschlag: 0.30,               /* Kosten je Zusatzkind (Nachbereitung, Evaluation) */
  zuchtRuhe: 3,                      /* Hoftage Erholung der Eltern nach einem Wurf */
  elternPreisF: 0.8,                 /* Wertverfall je Generation (kompoundiert) */
  linieMax: 4,                       /* Linienbonus: +1 je Generation auf den Linien-Topwert, max. */
  inzuchtInterferenz: 0.20,          /* Geschwister × Geschwister / Eltern × Kind: Interferenz +20 Punkte */
  inzuchtEmergenz: 0.08,             /* … und Emergenz −8 Punkte */
  emergenz: 0.14, emergenzDare: 0.20, interferenz: 0.16, templateBruch: 0.08,
  tiesBonus: 3,                      /* Spezialisten-Bonus TIES: jeder Elternteil hat einen anderen Topwert */
  soupBonus: 2,                      /* Feintuning-Bonus Soup: alle Eltern tragen Trainings-Historie */
  maxMerkmale: 4,
  mutation: 0.25,                    /* Wurf: Chance auf ein neues Merkmal */
  kaufMerkmal: 0.20,                 /* Kauf: Chance auf ein Merkmal */
  praegungJobs: 20, praegung: 0.15   /* nach 20 sauberen Aufträgen: 15 % ein neues Merkmal (einmalig) */
};

/* art: gut | neutral | optik · erb: Vererbungs-Wahrscheinlichkeit · quote: Optik-Chance je Wurf/Kauf (1:n) */
const MERKMALE = {
  fleissig:     {n:"Fleißig",      z:"🐝", art:"gut",     erb:0.60, wirk:"Durchsatz +4 %"},
  sparsam:      {n:"Sparsam",      z:"🔋", art:"gut",     erb:0.55, wirk:"Strombedarf −10 %"},
  robust:       {n:"Robust",       z:"🛡️", art:"gut",     erb:0.50, wirk:"Krankheitsrisiko −30 %"},
  lernfreudig:  {n:"Lernfreudig",  z:"📚", art:"gut",     erb:0.50, wirk:"Trainingsgewinn +10 %"},
  gelassen:     {n:"Gelassen",     z:"🧘", art:"gut",     erb:0.55, wirk:"Reklamations-Risiko −20 % (relativ)"},
  scharfsinnig: {n:"Scharfsinnig", z:"🔍", art:"gut",     erb:0.45, wirk:"Qualitätschance +3 Punkte"},
  nachteule:    {n:"Nachteule",    z:"🦉", art:"gut",     erb:0.60, wirk:"Ruhe-Nacht +9 statt +6 Zustand, Nachttraining 10 % schneller"},
  sammler:      {n:"Sammler",      z:"🧺", art:"gut",     erb:0.50, wirk:"+1 GB Web-Silage je Nacht"},
  kompakt:      {n:"Kompakt",      z:"📦", art:"gut",     erb:0.40, wirk:"VRAM-Bedarf −5 %"},
  charmant:     {n:"Charmant",     z:"💐", art:"gut",     erb:0.50, wirk:"Kunden geben ab 90 % Abnahme 5 ⭐"},
  geduldig:     {n:"Geduldig",     z:"🐢", art:"gut",     erb:0.55, wirk:"Bewährungsprobe gepatzt: −2 statt −4 Qualität"},
  frostfest:    {n:"Frostfest",    z:"❄️", art:"gut",     erb:0.60, wirk:"Winter-Malus auf den Durchsatz entfällt"},
  wachsam:      {n:"Wachsam",      z:"👁️", art:"gut",     erb:0.45, wirk:"Prompt-Injection: +25 % Abwehrchance"},
  feinfuehlig:  {n:"Feinfühlig",   z:"🎯", art:"gut",     erb:0.45, wirk:"Datenlese: perfekte Runde bringt +1 GB"},
  verfressen:   {n:"Verfressen",   z:"🍽️", art:"neutral", erb:0.60, wirk:"Training braucht +15 % Futter, bringt +2 Zuwachs"},
  zappelig:     {n:"Zappelig",     z:"⚡", art:"neutral", erb:0.50, wirk:"Durchsatz −2 %, Zustand +2 je Nacht"},
  eigensinnig:  {n:"Eigensinnig",  z:"🎭", art:"neutral", erb:0.50, wirk:"Team-Übergabe −4 Qualität, solo +2"},
  langschlaefer:{n:"Langschläfer", z:"😴", art:"neutral", erb:0.55, wirk:"Nachtaktionen 8 % langsamer, Ruhe +3 extra"},
  shiny:        {n:"Shiny",        z:"✨", art:"optik",   erb:0.10, quote:100000, wirk:"nur Leuchten – keine Wirkung"},
  regenbogen:   {n:"Regenbogen",   z:"🌈", art:"optik",   erb:0.05, quote:50000,  wirk:"nur Schimmer – keine Wirkung"},
  sternenfell:  {n:"Sternenfell",  z:"🌟", art:"optik",   erb:0.20, quote:5000,   wirk:"nur Funkeln – keine Wirkung"},
  goldzahn:     {n:"Goldzahn",     z:"🦷", art:"optik",   erb:0.30, quote:2000,   wirk:"nur Schmuck – keine Wirkung"},
  ringelschwanz:{n:"Ringelschwanz",z:"🌀", art:"optik",   erb:0.50, quote:300,    wirk:"nur Schmuck – keine Wirkung"},
  ohrfleck:     {n:"Ohrfleck",     z:"⚪", art:"optik",   erb:0.50, quote:200,    wirk:"nur Schmuck – keine Wirkung"}
};
const MERKMAL_IDS = Object.keys(MERKMALE);
const MERKMAL_WIRK = MERKMAL_IDS.filter(k=>MERKMALE[k].art!=="optik");
const MERKMAL_OPTIK = MERKMAL_IDS.filter(k=>MERKMALE[k].art==="optik");

function merkmalHat(p,id){ return !!(p&&Array.isArray(p.merkmale)&&p.merkmale.includes(id)); }
function optikHat(p,id){ return !!(p&&Array.isArray(p.optik)&&p.optik.includes(id)); }
function merkmaleVon(p){ return (p&&p.merkmale||[]).filter(k=>MERKMALE[k]); }
function optikVon(p){ return (p&&p.optik||[]).filter(k=>MERKMALE[k]); }

/* Optik-Würfe: jede Schmuck-Eigenschaft mit ihrer 1:n-Quote, unabhängig voneinander */
function optikWuerfeln(erbe){
  const out=[];
  for(const k of MERKMAL_OPTIK){
    const m=MERKMALE[k];
    const geerbt=erbe&&erbe.includes(k)&&Math.random()<m.erb;
    if(geerbt||Math.random()<1/m.quote) out.push(k);
  }
  return out;
}
/* Merkmale würfeln – quelle: kauf | wurf | praegung. eltern: Tiere (nur bei wurf). */
function merkmaleWuerfeln(quelle,eltern){
  const out=[];
  const neu=()=>{ const pool=MERKMAL_WIRK.filter(k=>!out.includes(k)); if(pool.length) out.push(pool[Math.floor(Math.random()*pool.length)]); };
  if(quelle==="wurf"){
    const geerbt=new Set();
    (eltern||[]).forEach(e=>merkmaleVon(e).forEach(k=>{ if(!geerbt.has(k)&&Math.random()<MERKMALE[k].erb) geerbt.add(k); }));
    geerbt.forEach(k=>{ if(out.length<ZUCHT_REGELN.maxMerkmale) out.push(k); });
    if(out.length<ZUCHT_REGELN.maxMerkmale&&Math.random()<ZUCHT_REGELN.mutation) neu();
  }else if(quelle==="kauf"){ if(Math.random()<ZUCHT_REGELN.kaufMerkmal) neu(); }
  else if(quelle==="praegung"){ neu(); }
  return out.slice(0,ZUCHT_REGELN.maxMerkmale);
}
/* Prägung: nach 20 sauberen Aufträgen einmalig 15 % ein neues Merkmal */
function zuchtPraegung(p,bericht){
  if(!p||p.api||p.gepraegt) return null;
  p.sauberJobs=(p.sauberJobs||0)+1;
  if(p.sauberJobs<ZUCHT_REGELN.praegungJobs) return null;
  p.gepraegt=true;
  if(Math.random()>=ZUCHT_REGELN.praegung) return null;
  p.merkmale=merkmaleVon(p);
  if(p.merkmale.length>=ZUCHT_REGELN.maxMerkmale) return null;
  const neu=merkmaleWuerfeln("praegung").filter(k=>!p.merkmale.includes(k))[0];
  if(!neu) return null;
  p.merkmale.push(neu);
  if(bericht) bericht.zeilen.push({t:"🌱 "+p.name+" hat durch Routine ein neues Merkmal geprägt: "+MERKMALE[neu].z+" "+MERKMALE[neu].n+" ("+MERKMALE[neu].wirk+").",art:"gut"});
  if(typeof questHook==="function") questHook("merkmal_neu",null);
  return neu;
}
/* Beim Kauf eines Katalogtiers */
function zuchtKaufMerkmale(p){
  if(!p||p.api) return p;
  p.merkmale=merkmaleWuerfeln("kauf");
  p.optik=optikWuerfeln([]);
  return p;
}

/* ── Stammbaum ─────────────────────────────────────────────────────── */
function zuchtElternUids(p){ return (p&&p.eltern&&Array.isArray(p.eltern.uids))?p.eltern.uids:[]; }
function zuchtTier(uid){ const w=Array.isArray(S.verkauft)?S.verkauft:[];   /* v9.8 (R2): S.verkauft ist ein Zähler, keine Liste – der Zugriff warf einen Fehler */
  return (S.tiere||[]).find(t=>t.uid===uid)||w.find(t=>t.uid===uid)||null; }
function stammbaum(p){
  const eltern=zuchtElternUids(p).map(zuchtTier);
  const grosseltern=[]; eltern.forEach(e=>{ if(e) zuchtElternUids(e).forEach(g=>{ const t=zuchtTier(g); if(t&&!grosseltern.includes(t)) grosseltern.push(t); }); });
  const meineEltern=zuchtElternUids(p);
  const geschwister=(S.tiere||[]).filter(t=>t.uid!==p.uid&&zuchtElternUids(t).length&&zuchtElternUids(t).some(u=>meineEltern.includes(u)));
  const kinder=(S.tiere||[]).filter(t=>zuchtElternUids(t).includes(p.uid));
  return {eltern,grosseltern,geschwister,kinder,uids:{eltern:meineEltern}};
}
/* Inzucht: gemeinsamer Elternteil oder Eltern-Kind-Paar */
function istInzucht(eltern){
  for(let i=0;i<eltern.length;i++) for(let j=i+1;j<eltern.length;j++){
    const a=eltern[i], b=eltern[j];
    /* Ära 9 (R4-8): zwei Generationen – Eltern und Großeltern beider Tiere zählen */
    const ahnen=t=>{ const e=zuchtElternUids(t), g=e.flatMap(u=>{ const q=(typeof zuchtTier==="function")?zuchtTier(u):null; return q?zuchtElternUids(q):[]; }); return [...new Set([...e,...g])]; };
    const ea=ahnen(a), eb=ahnen(b);
    if(ea.includes(b.uid)||eb.includes(a.uid)) return true;
    if(ea.some(u=>eb.includes(u))) return true;
  }
  return false;
}
/* Linienbonus: beide Eltern sind Zuchttiere (gen ≥ 1) derselben Basis → +1 je Generation auf den Linien-Topwert (max linieMax) */
function linienBonus(eltern){
  if(eltern.length<2||!eltern.every(e=>(e.gen||0)>=1&&!e.modell)) return null;
  const gen=Math.min(...eltern.map(e=>e.gen||0));
  const bonus=Math.min(ZUCHT_REGELN.linieMax,gen);
  if(bonus<=0) return null;
  const summe={}; for(const k in WERTE) summe[k]=eltern.reduce((x,e)=>x+(e.w[k]||0),0);
  const top=Object.keys(summe).sort((a,b)=>summe[b]-summe[a])[0];
  return {wert:top,bonus};
}
function topWert(p){ let best=null; for(const k in WERTE){ if(best===null||(p.w[k]||0)>(p.w[best]||0)) best=k; } return best; }
/* Modifikatoren je Verfahren – wird von mergeDurchfuehren aufgerufen */
function zuchtModifikatoren(eltern,methodeId){
  const R=ZUCHT_REGELN;
  const mod={emergenz:methodeId==="dare"?R.emergenzDare:R.emergenz,interferenz:R.interferenz,templateBruch:methodeId==="slerp"?R.templateBruch:0,boni:{},notizen:[]};
  if(methodeId==="ties"){
    const tops=eltern.map(topWert);
    if(new Set(tops).size===tops.length){ tops.forEach(k=>{ mod.boni[k]=(mod.boni[k]||0)+R.tiesBonus; }); mod.notizen.push("🪢 Spezialisten-Bonus: jeder Elternteil bringt einen anderen Topwert – +"+R.tiesBonus+" auf "+tops.map(k=>WERTE[k]).join(", ")+"."); }
    else mod.notizen.push("🪢 Kein Spezialisten-Bonus: die Eltern haben denselben Topwert ("+WERTE[tops[0]]+").");
  }
  if(methodeId==="soup"){
    if(eltern.every(e=>(e.historie||[]).some(h=>h.delta&&Object.keys(h.delta).length))){ for(const k in WERTE) mod.boni[k]=(mod.boni[k]||0)+R.soupBonus; mod.notizen.push("🍲 Feintuning-Bonus: alle Eltern tragen Trainings-Historie – +"+R.soupBonus+" auf alle Werte."); }
    else mod.notizen.push("🍲 Kein Feintuning-Bonus: mindestens ein Elternteil wurde nie trainiert.");
  }
  const linie=linienBonus(eltern);
  if(linie){ mod.boni[linie.wert]=(mod.boni[linie.wert]||0)+linie.bonus; mod.notizen.push("🌳 Linienbonus Generation "+Math.min(...eltern.map(e=>e.gen))+": +"+linie.bonus+" auf "+WERTE[linie.wert]+"."); }
  if(istInzucht(eltern)){ mod.interferenz+=R.inzuchtInterferenz; mod.emergenz=Math.max(0,mod.emergenz-R.inzuchtEmergenz); mod.inzucht=true; mod.notizen.push("⚠️ Inzucht: zu ähnliche Aufgabenvektoren – Interferenz +"+Math.round(R.inzuchtInterferenz*100)+" Punkte, Emergenz −"+Math.round(R.inzuchtEmergenz*100)+"."); }
  return mod;
}
function wurfGroesse(){
  const v=(typeof forschungFrei==="function"&&forschungFrei("wurfpflege"))?ZUCHT_REGELN.wurfPflege:ZUCHT_REGELN.wurf;
  const r=Math.random();
  return r<v[0]?1:r<v[0]+v[1]?2:3;
}
function zuchtKosten(m,eltern,kinder){
  const basis=m.kredit+Math.round(((eltern[0]||{}).pT||1)*8);
  return {basis,zusatz:Math.round(basis*ZUCHT_REGELN.kindAufschlag*Math.max(0,(kinder||1)-1)),gesamt:basis+Math.round(basis*ZUCHT_REGELN.kindAufschlag*Math.max(0,(kinder||1)-1))};
}
/* Der Wurf wird morgens aufgelöst – aus mergeDurchfuehren je Kind */
function zuchtWurfAufloesen(ma,bericht){
  const m=ZUCHT[ma.methode];
  const eltern=ma.eltern.map(id=>S.tiere.find(t=>t.uid===id)).filter(Boolean);
  const n=wurfGroesse();
  const wurfId="w"+S.tag+"_"+(S.zaehler||0);
  const kinder=[];
  for(let i=0;i<n;i++){
    const {kind,fall}=mergeDurchfuehren(ma.eltern,ma.methode);
    kind._elternKopie=ma.kopie; kind.wurf={id:wurfId,geschwister:[]}; kind.fall=fall;
    S.tiere.push(kind); kinder.push(kind);
  }
  kinder.forEach(k=>{ k.wurf.geschwister=kinder.filter(x=>x!==k).map(x=>x.uid); });
  const kosten=zuchtKosten(m,eltern,n);
  if(kosten.zusatz>0) buche(-kosten.zusatz,"zucht","Wurf-Nachbereitung: "+(n-1)+" Zusatzkind"+(n>2?"er":""));
  eltern.forEach(e=>{ e.zuchtRuhe=S.tag+ZUCHT_REGELN.zuchtRuhe; });
  questHook("merge_fertig",null); questHook("wurf",null); if(n>=2) questHook("wurf_mehrling",null);
  if(kinder.some(k=>merkmaleVon(k).length)) questHook("merkmal_neu",null);
  if(kinder.some(k=>merkmaleVon(k).some(mk=>eltern.some(e=>merkmalHat(e,mk))))) questHook("merkmal_vererbt",null);
  if(kinder.some(k=>(k.gen||0)>=2)) questHook("linie_g2",null);
  xpDazu(35+10*(n-1));
  bericht.wurf=kinder[0].uid; bericht.wurfIds=kinder.map(k=>k.uid);
  bericht.zeilen.push({t:"🍼 Die Misch-Werkstatt ist fertig: "+(n===1?kinder[0].name+" ("+kinder[0].fall.n+")":n+" Kinder – "+kinder.map(k=>k.name+" ("+k.fall.n+")").join(", "))+" liegen im Stroh!"+(kosten.zusatz?" Nachbereitung "+geld(kosten.zusatz)+".":""),art:kinder.some(k=>k.fall.art==="schlecht")?"schlecht":"gut"});
  kinder.forEach(k=>{ const o=optikVon(k); if(o.length) bericht.zeilen.push({t:"✨ "+k.name+" trägt "+o.map(x=>MERKMALE[x].z+" "+MERKMALE[x].n).join(", ")+" – reiner Schmuck, aber selten!",art:"gut"}); });
  return kinder;
}

/* ── HTML-Bausteine ────────────────────────────────────────────────── */
function merkmalChips(p){
  const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  return merkmaleVon(p).map(k=>'<span class="merk '+(MERKMALE[k].art==="gut"?"gut":"")+'" title="'+e(MERKMALE[k].wirk)+' · vererbt zu '+Math.round(MERKMALE[k].erb*100)+' %">'+MERKMALE[k].z+' '+e(MERKMALE[k].n)+'</span>').join("")+
    optikVon(p).map(k=>'<span class="merk lila merkOptik merkOptik-'+k+'" title="'+e(MERKMALE[k].wirk)+' · 1 : '+MERKMALE[k].quote.toLocaleString("de-DE")+' · vererbt zu '+Math.round(MERKMALE[k].erb*100)+' %">'+MERKMALE[k].z+' '+e(MERKMALE[k].n)+'</span>').join("");
}
function zuchtStammbaumHtml(p){
  const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const link=t=>t?'<button class="knopf s hell" onclick="oeffne(\'tier\',\''+t.uid+'\')">'+e(t.name)+' · G'+(t.gen||0)+'</button>':'<span class="merk">verkauft/unbekannt</span>';
  const sb=stammbaum(p);
  const m=merkmaleVon(p), o=optikVon(p);
  let h='<div class="karte"><h3>🌳 Stammbuch <span class="merk info">Generation '+(p.gen||0)+'</span>'+(p.zuchtRuhe>S.tag?'<span class="merk">Erholung bis Tag '+p.zuchtRuhe+'</span>':'')+'</h3>';
  h+='<p><b>Merkmale:</b> '+(m.length||o.length?merkmalChips(p):'<span class="merk">keine</span>')+'</p>';
  if(m.length) h+='<table class="vergleich"><tr><th>Merkmal</th><th>Wirkung</th><th>Vererbung</th></tr>'+m.map(k=>'<tr><td>'+MERKMALE[k].z+' '+e(MERKMALE[k].n)+'</td><td>'+e(MERKMALE[k].wirk)+'</td><td>'+Math.round(MERKMALE[k].erb*100)+' %</td></tr>').join("")+'</table>';
  if(p.eltern&&p.eltern.namen){
    h+='<p class="abstand"><b>Eltern ('+e(p.eltern.methode||"Merge")+'):</b> '+(sb.uids.eltern.length?sb.eltern.map(link).join(" × "):e(p.eltern.namen.join(" × ")))+'</p>';
    if(sb.grosseltern.length) h+='<p><b>Großeltern:</b> '+sb.grosseltern.map(link).join(" ")+'</p>';
  }
  if(sb.geschwister.length) h+='<p><b>Geschwister:</b> '+sb.geschwister.map(link).join(" ")+'</p>';
  if(sb.kinder.length) h+='<p><b>Kinder:</b> '+sb.kinder.map(link).join(" ")+'</p>';
  if(p.fall&&p.fall.n) h+='<p class="abstand"><span class="merk '+(p.fall.art==="gut"?"gut":p.fall.art==="schlecht"?"schlecht":"info")+'">'+e(p.fall.n)+'</span> '+e(p.fall.t||"")+'</p>';
  if(p.zuchtNotizen&&p.zuchtNotizen.length) h+='<p style="font-size:12px">'+p.zuchtNotizen.map(e).join("<br>")+'</p>';
  h+='<p style="font-size:11px;color:var(--tinte-2)">Regeln: Wurf 1–3 Kinder ('+ZUCHT_REGELN.wurf.map(x=>Math.round(x*100)+" %").join(" / ")+'), Eltern-Erholung '+ZUCHT_REGELN.zuchtRuhe+' Tage, Wert je Generation ×'+ZUCHT_REGELN.elternPreisF+' (Marktwert eines Zuchttiers: 55 % des Neupreises, Eigenzucht höchstens 60 % des Elternpreises, ×0,75–1,15 nach Effizienz, Nachfrage bis +15 %), Linienbonus +1 je Generation (max. +'+ZUCHT_REGELN.linieMax+'), Inzucht = Interferenz +'+Math.round(ZUCHT_REGELN.inzuchtInterferenz*100)+' Punkte.</p></div>';
  if(typeof questHook==="function"&&p.eltern) questHook("stammbaum",null);
  return h;
}
/* Hofbuch-Kapitel aus den Konstanten */
function zuchtHofbuchHtml(){
  const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const R=ZUCHT_REGELN;
  let h='<p><b>Verfahren (Regeln im Code):</b></p><table class="vergleich"><tr><th>Verfahren</th><th>Stufe</th><th>Kosten</th><th>Eltern</th><th>Formel je Wert</th><th>Streuung</th><th>Besonderheit</th></tr>';
  Object.entries(ZUCHT).forEach(([id,m])=>{
    const formel=(id==="ties"||id==="dare")?"0,55·Mittel + 0,45·Maximum":"Mittel der Eltern";
    const streu=(id==="ties"||id==="dare")?"±"+rd1(9*m.streu):"±"+rd1(13*m.streu);
    const bes={slerp:"Template-Bruch "+Math.round(R.templateBruch*100)+" % (Treue −8…−14)",ties:"Spezialisten-Bonus +"+R.tiesBonus+" je anderem Topwert",dare:"Emergenz "+Math.round(R.emergenzDare*100)+" % statt "+Math.round(R.emergenz*100)+" %",soup:"Feintuning-Bonus +"+R.soupBonus+" auf alle Werte, wenn alle Eltern trainiert sind"}[id]||"";
    h+='<tr><td>'+m.z+' '+e(m.n)+'</td><td>'+(id==="slerp"?2:m.lvl)+'</td><td>'+geld(m.kredit)+' + 8 €/B</td><td>'+m.eltern[0]+(m.eltern[1]>m.eltern[0]?"–"+m.eltern[1]:"")+'</td><td>'+formel+'</td><td>'+streu+'</td><td>'+e(bes)+'</td></tr>';
  });
  h+='</table><p>Pflicht für jedes Verfahren: gleiche Familie, gleiche Bauform, gleiche Größe (±0,01 B), <b>gleicher Basis-Checkpoint</b>, keine Leih- oder HRM-Modelle. Ausgänge je Kind: Emergenz '+Math.round(R.emergenz*100)+' % (ein Wert +12…+22), Interferenz '+Math.round(R.interferenz*100)+' % (ein Wert −10…−20), sonst sauber; Wissensdecke der Eltern bleibt. Werte werden gerundet.</p>';
  h+='<p><b>Wurf:</b> '+R.wurf.map((x,i)=>(i+1)+" Kind"+(i?"er":"")+" "+Math.round(x*100)+" %").join(" · ")+' (mit Forschung „Wurfpflege“: '+R.wurfPflege.map(x=>Math.round(x*100)+" %").join(" / ")+'). Jedes Zusatzkind kostet +'+Math.round(R.kindAufschlag*100)+' % Nachbereitung, fällig beim Wurf. Eltern erholen sich '+R.zuchtRuhe+' Hoftage. Kinder sind '+5+' Tage unverkäuflich; Marktwert je Generation ×'+R.elternPreisF+'.</p>';
  h+='<p><b>Linie &amp; Inzucht:</b> Sind beide Eltern Zuchttiere derselben Basis, bekommt das Kind +1 je Generation (max. +'+R.linieMax+') auf den Topwert der Linie – wiederholtes Mergen sauberer Feintunings konsolidiert Aufgabenvektoren (TIES/Model-Soup-Literatur), aber nie über 99. Gemeinsame Vorfahren über zwei Generationen (Geschwister, Eltern × Kind, Großeltern × Enkel): Interferenz +'+Math.round(R.inzuchtInterferenz*100)+' Punkte, Emergenz −'+Math.round(R.inzuchtEmergenz*100)+' Punkte.</p>';
  h+='<p><b>Merkmale:</b> Beim Kauf '+Math.round(R.kaufMerkmal*100)+' % ein Merkmal; im Wurf erbt jedes Elternmerkmal mit seiner Quote, dazu '+Math.round(R.mutation*100)+' % ein neues; nach '+R.praegungJobs+' sauberen Aufträgen '+Math.round(R.praegung*100)+' % Prägung (einmalig). Höchstens '+R.maxMerkmale+' Merkmale, Schmuck zählt nicht.</p>';
  h+='<table class="vergleich"><tr><th>Merkmal</th><th>Art</th><th>Wirkung</th><th>Vererbung</th><th>Seltenheit</th></tr>'+MERKMAL_IDS.map(k=>{const m=MERKMALE[k];return '<tr><td>'+m.z+' '+e(m.n)+'</td><td>'+({gut:"gut",neutral:"neutral",optik:"Schmuck"}[m.art])+'</td><td>'+e(m.wirk)+'</td><td>'+Math.round(m.erb*100)+' %</td><td>'+(m.quote?"1 : "+m.quote.toLocaleString("de-DE"):"–")+'</td></tr>';}).join("")+'</table>';
  return h;
}
if(typeof window!=="undefined"){ Object.assign(window,{merkmalHat,optikHat,merkmaleVon,optikVon,stammbaum,zuchtStammbaumHtml,merkmalChips,zuchtHofbuchHtml,zuchtKosten,wurfGroesse,MERKMALE,ZUCHT_REGELN}); }
