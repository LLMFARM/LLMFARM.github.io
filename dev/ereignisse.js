/* ═══════════════════════════════════════════════════════════════════════
   Ära 8 · EREIGNISSE mit Belohnung und Risiko
   ───────────────────────────────────────────────────────────────────────
   Auftrags-Ereignisse feuern bei der Abnahme (hlTeamAbschluss), der
   Hacker-Angriff nachts (ausfuehrenTagesWechsel) und wird auf dem Dorfplatz
   als Minispiel „Vier gewinnt gegen den Hacker“ ausgespielt. Alle Zahlen
   stehen in EREIGNIS_REGELN; das Hofbuch rendert von hier.
   ═══════════════════════════════════════════════════════════════════════ */

const EREIGNIS_REGELN = {
  begeistert:  {p:0.18, quoteMin:0.8, qualMin:90, praemie:0.25, ruf:2},
  trinkgeld:   {p:0.10, serie:3, bonus:0.12},
  empfehlung:  {p:0.15, sterne:5, lohn:0.15},
  folgeauftrag:{p:0.25, groesse:"L", puffer:1},
  datenleck:   {p:0.30, strafeAnteil:0.06, strafeFix:60, ruf:-6, groll:3, guardrailsF:0.5},
  hacker:      {p:0.06, abTag:6, pause:6, kundenAuftraege:3, praemieBasis:80, praemieStufe:20, ruf:4, xp:30,
                verlustStrafe:40, verlustGroll:4, verlustSterne:2, remisRuf:-1},
  abwerbung:   {durchsatz:0.8}
};

function ereignisRnd(){ return Math.random(); }
function ereignisKunde(j){ return (j&&j.kunde&&typeof KUNDEN!=="undefined"&&KUNDEN[j.kunde])?{K:KUNDEN[j.kunde],k:kundeVon(j.kunde)}:null; }

/* Wird in hlTeamAbschluss VOR der Lohnbuchung aufgerufen. Darf er.lohn ändern, gibt Berichtszeilen zurück. */
function ereignisAbschluss(j,er,ps,bericht,gut,chance,team){
  const R=EREIGNIS_REGELN, zeilen=[], kd=ereignisKunde(j), serie=(S.hofloop&&S.hofloop.serie)||0;
  const lokalPflicht=!!(kd&&kd.K.lokalPflicht)||!!j.dsgvo;
  if(gut){
    const quote=(team&&team.zusageQuote)||0;
    if(quote>=R.begeistert.quoteMin&&chance>=R.begeistert.qualMin&&ereignisRnd()<R.begeistert.p){
      const plus=Math.round(er.lohn*R.begeistert.praemie); er.lohn+=plus;
      if(kd) kd.k.sterne=Math.min(5,(kd.k.sterne||3)+1);
      rufBonusDazu(R.begeistert.ruf);
      zeilen.push({t:"🌟 "+(kd?kd.K.n:"Der Kunde")+" ist begeistert: knappe Zusage ("+rd(quote*100)+" % Fristbudget), trotzdem sauber – Prämie +"+Math.round(R.begeistert.praemie*100)+" % ("+geld(plus)+"), +1 ⭐, Ruf +"+R.begeistert.ruf+".",art:"gut"});
      questHook("job_mut",null);
    } else if((j.mikro||j.groesse==="S")&&serie>=R.trinkgeld.serie&&ereignisRnd()<R.trinkgeld.p){
      const plus=Math.round(er.lohn*R.trinkgeld.bonus); er.lohn+=plus;
      zeilen.push({t:"💶 Trinkgeld: Serie von "+serie+" sauberen Lieferungen – "+(kd?kd.K.n:"der Kunde")+" legt "+geld(plus)+" (+"+Math.round(R.trinkgeld.bonus*100)+" %) drauf.",art:"gut"});
    }
    if(kd&&(kd.k.sterne||0)>=R.empfehlung.sterne&&ereignisRnd()<R.empfehlung.p){
      S.empfehlungen=S.empfehlungen||[]; S.empfehlungen.push({kunde:j.kunde,lohnF:1+R.empfehlung.lohn,art:j.art});
      zeilen.push({t:"📣 "+kd.K.n+" empfiehlt euch weiter – morgen hängt ein Empfehlungs-Zettel mit +"+Math.round(R.empfehlung.lohn*100)+" % Lohn an der Pinnwand.",art:"gut"});
    }
    if(j.groesse===R.folgeauftrag.groesse&&!j.folge&&ereignisRnd()<R.folgeauftrag.p){
      const nj={...j,id:"j"+(S.zaehler++),frisch:S.tag,team:null,vereinbart:undefined,kontrolle:false,zweiteChance:false,folge:true,puffer:(j.puffer??1)+R.folgeauftrag.puffer,t:"Nachschlag: "+j.t};
      S.jobs.push(nj);
      zeilen.push({t:"🏗️ Folgeauftrag: "+(kd?kd.K.n:"Der Kunde")+" will gleich den nächsten Großauftrag – „"+nj.t+"“ hängt mit einem Tag mehr Puffer an der Pinnwand.",art:"gut"});
    }
  }
  /* Datenleck: Reklamation bei Kunden mit Datenschutzpflicht ODER API-Tier auf lokalpflichtigem Zettel */
  const apiAufLokal=lokalPflicht&&ps.some(p=>p.api);
  if(((!gut&&lokalPflicht)||apiAufLokal)&&typeof dsAbschluss!=="function"){   /* v9.8: seit Ära 9 prüft dsAbschluss jede Abnahme (Kapitel Datenschutz & Aufsicht) – kein zweites, unabhängiges Leck-System */
    if(ereignisRnd()<R.datenleck.p){
      let strafe=Math.round(j.vereinbart*R.datenleck.strafeAnteil)+R.datenleck.strafeFix;
      const gr=forschungFrei("guardrails"); if(gr) strafe=Math.round(strafe*R.datenleck.guardrailsF);
      buche(-strafe,"strafe","DSGVO-Datenleck · "+j.t); rufBonusDazu(R.datenleck.ruf);
      if(kd) kd.k.groll=Math.max(kd.k.groll||0,R.datenleck.groll);
      zeilen.push({t:"🛡️ DSGVO-Leck bei „"+j.t+"“: "+(apiAufLokal?"personenbezogene Daten liefen über ein Leih-Tier in der Cloud":"die reklamierte Lieferung enthielt ungeschwärzte Daten")+" – Strafe "+geld(strafe)+(gr?" (Schutzregeln halbieren)":"")+", Ruf "+R.datenleck.ruf+", Kunde verärgert ("+R.datenleck.groll+" Tage).",art:"schlecht"});
      questHook("datenleck",null);
      if(typeof dsAbmahnung==="function"&&typeof dsGeschuetzt==="function"&&(ps||[]).some(p=>!dsGeschuetzt(p))) dsAbmahnung("DSGVO-Leck bei „"+j.t+"“ (ungeschützte Modelle)",bericht);   /* Ära 9: zählt zur Abmahnung, wenn Schutz fehlte */
    }
  }
  zeilen.forEach(z=>bericht.zeilen.push(z));
  return zeilen;
}

/* Empfehlungs-Zettel am Morgen (hlMorgen) */
function ereignisMorgen(){
  if(!S.empfehlungen||!S.empfehlungen.length||typeof hlJobNeu!=="function") return;
  const e=S.empfehlungen.shift();
  let j=null; for(let i=0;i<3&&!j;i++) j=hlJobNeu(e.art,false); if(!j) j=hlJobNeu(e.art,true);   /* Ära 9 (R4-7): hlJobNeu liefert zu 22 % still null – nie ohne Zettel */
  if(j){ j.kunde=e.kunde; j.lohnBasis=Math.round((j.lohnBasis||0)*e.lohnF); j.empfehlung=true; j.t="⭐ Empfehlung: "+j.t; S.jobs.push(j); }
}

/* ── Hacker-Angriff ────────────────────────────────────────────────── */
function hackerOffen(){ return (S.events||[]).find(e=>e.id==="hacker"&&!e.erledigt)||null; }
function hackerSpawn(bericht){
  const R=EREIGNIS_REGELN.hacker;
  if(S.tag<R.abTag||hackerOffen()) return null;
  if((S.letzterHacker||-99)+R.pause>S.tag) return null;
  const kandidaten=Object.keys(S.kunden||{}).filter(id=>typeof KUNDEN!=="undefined"&&KUNDEN[id]&&(S.kunden[id].auftraege||0)>=R.kundenAuftraege);
  if(!kandidaten.length||ereignisRnd()>=R.p) return null;
  const kid=kandidaten[Math.floor(ereignisRnd()*kandidaten.length)];
  const e={id:"hacker",n:"Hacker-Angriff auf "+KUNDEN[kid].n,z:"🕵️",art:"schlecht",
    txt:"Jemand hämmert mit präparierten Anfragen auf den Kundenbot von "+KUNDEN[kid].n+" ein. Auf dem Dorfplatz wartet der Hacker – gewinnt er, verliert ihr den Kunden.",
    lehre:"Angriffe auf LLM-Dienste sind Wettläufe: Ratenbegrenzung, Eingabefilter, Werkzeug-Freigabelisten und Prüfprotokolle müssen als Kette stehen, sonst findet der Angreifer die Lücke.",
    effekt:{typ:"hacker",wert:0,tage:1},kunde:kid,tag:S.tag};
  S.events.push(e); S.letzterHacker=S.tag;
  if(bericht) bericht.zeilen.push({t:"🕵️ Angriff auf den Kundenbot von "+KUNDEN[kid].n+"! Auf dem Dorfplatz wartet der Hacker (Vier gewinnt) – ihr habt bis heute Abend. Gewinn: Prämie, +1 ⭐, Ruf +"+R.ruf+". Verlust: Kunde verloren ("+R.verlustGroll+" Tage), −"+R.verlustSterne+" ⭐, "+geld(R.verlustStrafe)+".",art:"schlecht"});
  return e;
}
function hackerErgebnis(ergebnis,stumm){
  const R=EREIGNIS_REGELN.hacker, e=hackerOffen(); if(!e) return null;
  e.erledigt=true; e.ergebnis=ergebnis; e.effekt.tage=0;
  const K=KUNDEN[e.kunde], k=kundeVon(e.kunde);
  let text="";
  if(ergebnis==="sieg"){
    k.sterne=Math.min(5,(k.sterne||3)+1); rufBonusDazu(R.ruf);
    const pr=R.praemieBasis+R.praemieStufe*hofLevel().i; buche(pr,"foerderung","Hacker abgewehrt · Prämie von "+K.n);
    S.mini=S.mini||{}; S.mini.hackerSchutzTag=S.tag; xpDazu(R.xp); questHook("hacker_sieg",null);
    text="🏆 Hacker abgewehrt! "+K.n+" zahlt "+geld(pr)+" Prämie, +1 ⭐, Ruf +"+R.ruf+", +"+R.xp+" XP für die Abwehr (dazu die Spiel-XP vom Dorfplatz), heute kein Injection-Schaden.";   /* v9.8: beide XP-Quellen benannt */
  } else if(ergebnis==="niederlage"){
    k.groll=Math.max(k.groll||0,R.verlustGroll); k.sterne=Math.max(1,(k.sterne||3)-R.verlustSterne);
    buche(-R.verlustStrafe,"strafe","Hacker-Angriff · Vorfallanalyse "+K.n); rufBonusDazu(-3);
    text="💥 Der Hacker hat gewonnen: "+K.n+" hängt "+R.verlustGroll+" Tage keine Zettel mehr aus, −"+R.verlustSterne+" ⭐, "+geld(R.verlustStrafe)+" Vorfallanalyse, Ruf −3.";
  } else { rufBonusDazu(R.remisRuf); text="🤝 Unentschieden – der Angriff verlief im Sand, aber "+K.n+" bleibt nervös (Ruf "+R.remisRuf+")."; }
  if(!stumm) melde(text,ergebnis==="sieg"?"gut":"schlecht");
  S.tagesNotizen=S.tagesNotizen||[]; S.tagesNotizen.push({t:text,art:ergebnis==="sieg"?"gut":"schlecht"});
  return text;
}
/* Tagesende: nicht gespielt = verloren */
function hackerTagesende(bericht){
  const e=hackerOffen(); if(!e) return;
  const text=hackerErgebnis("niederlage",true);
  if(bericht) bericht.zeilen.push({t:"🕵️ Niemand hat sich dem Hacker gestellt. "+text,art:"schlecht"});
}
/* Abwerbung: das wertvollste Tier ist zwei Tage abgelenkt */
function ereignisNachtHook(e){
  if(!e||!e.effekt) return;
  if(e.id==="abwerbung"){ const best=S.tiere.filter(p=>!p.api).sort((a,b)=>tierWert(b)-tierWert(a))[0]; if(best){ e.tier=best.uid; e.txt=(e.txt||"")+" Umworben wird "+best.name+"."; } }
}
function ereignisDurchsatzF(p){
  const ab=(S.events||[]).find(e=>e.id==="abwerbung"&&e.tier===p.uid&&e.effekt&&e.effekt.tage>0);
  let f=ab?EREIGNIS_REGELN.abwerbung.durchsatz:1;
  (S.events||[]).filter(e=>e.effekt&&e.effekt.typ==="durchsatz"&&e.effekt.tage>0).forEach(e=>{ f*=Math.max(0.1,Number(e.effekt.wert)||1); });   /* Ära 9: Entscheidungs-Folgen (Untertakten) */
  return f;
}
function ereignisCloudAusfall(){ return (S.events||[]).some(e=>e.id==="cloud_ausfall"&&e.effekt&&e.effekt.tage>0); }

/* ── Ära 9 · Entscheidungs-Ereignisse ─────────────────────────────────────
   Ein Ereignis stellt eine Wahl mit klaren Zahlen. Entscheidet die Spielerin bis zum
   Tagesende nicht, gilt die Standard-Option (Index `standard`). Alle Wirkungen sind
   deklarativ (Geld, Ruf, XP, Daten, ein Folge-Effekt mit Typ/Wert/Tagen), damit sie
   im Hofbuch stehen und der Tageswechsel sie wie jedes andere Ereignis abbaut. */
const EREIGNIS_WAHL=[
 { id:"kuehlung_leck", n:"Kühlflüssigkeit leckt im Rechenstall", z:"💧", art:"schlecht", wahl:true, standard:2,
   txt:"Unter dem Rack steht eine Pfütze – die Wasserkühlung eines Rechners verliert Druck. Läuft er weiter heiß, drosselt er sich selbst.",
   lehre:"Kühlung ist in echten Rechenzentren ein Kostenblock: Der PUE-Wert (Gesamtstrom ÷ IT-Strom) liegt in guten Anlagen bei 1,1, in improvisierten Räumen bei 1,5. Ein thermisch gedrosselter Chip rechnet langsamer, statt kaputtzugehen.",
   effekt:{typ:"wahl",wert:0,tage:2},
   optionen:[
    {t:"Techniker rufen",txt:"250 € sofort, morgen läuft alles wieder mit voller Leistung.",geld:-250,ergebnis:"Der Techniker tauscht die Pumpe – volle Leistung ab morgen."},
    {t:"Untertakten",txt:"Kein Geld, aber 2 Tage nur 80 % Durchsatz auf dem ganzen Hof.",folge:{typ:"durchsatz",wert:0.8,tage:2},ergebnis:"Du drosselst die Rechner: 2 Tage 80 % Durchsatz, dafür kein Cent Kosten."},
    {t:"Abwarten",txt:"Läuft heiß weiter: 3 Tage 90 % Durchsatz, danach 90 € Reparatur.",geld:-90,folge:{typ:"durchsatz",wert:0.9,tage:3},ergebnis:"Der Rechner drosselt sich drei Tage selbst; am Ende zahlst du 90 € für die Reparatur."}
   ]},
 { id:"praktikum", n:"Eine Praktikantin klopft an", z:"🎒", art:"gut", wahl:true, standard:1,
   txt:"Lena aus der Berufsschule will vier Wochen lernen, wie man Modelle betreibt – gegen kleines Geld und viel Erklären.",
   lehre:"Praktika sind für kleine KI-Betriebe die günstigste Nachwuchsquelle; die Betreuungszeit ist der eigentliche Preis.",
   effekt:{typ:"wahl",wert:0,tage:2},
   optionen:[
    {t:"Einstellen (200 €)",txt:"200 € Aufwandspauschale, dafür 80 XP und 7 Tage lang 15 % günstigere Forschung.",geld:-200,xp:80,folge:{typ:"forschung",wert:-0.15,tage:7},ergebnis:"Lena hilft in der Forschungshütte: 7 Tage 15 % günstigere Forschung, und du lernst beim Erklären selbst (+80 XP)."},
    {t:"Freundlich ablehnen",txt:"Keine Kosten, keine Wirkung.",ergebnis:"Du vertröstest Lena auf nächstes Jahr."}
   ]},
 { id:"nachbar_lager", n:"Der Nachbar räumt sein GPU-Lager", z:"📦", art:"gut", wahl:true, standard:1,
   txt:"Der Nachbarhof stellt auf Cloud um und lässt dich zwei Tage zum Freundschaftspreis in seinem Hardware-Lager stöbern.",
   lehre:"Gebrauchte Rechenzentrums-Hardware wechselt oft den Besitzer, wenn Betreiber umziehen oder auf die nächste Generation gehen – wer dann liquide ist, kauft günstig.",
   effekt:{typ:"wahl",wert:0,tage:2},
   optionen:[
    {t:"Stöbern gehen",txt:"2 Tage Hardware 25 % günstiger (Racks, Karten, Rechner).",folge:{typ:"gpupreis",wert:-0.25,tage:2},ergebnis:"Zwei Tage Freundschaftspreis: Hardware 25 % günstiger."},
    {t:"Kein Bedarf",txt:"Keine Wirkung.",ergebnis:"Du winkst ab – der Nachbar verkauft an die Genossenschaft."}
   ]},
 { id:"dorfradio", n:"Das Dorfradio will ein Interview", z:"📻", art:"gut", wahl:true, standard:1,
   txt:"Antenne Modelldorf fragt, ob du im Morgenmagazin erzählst, was ein KI-Hof eigentlich macht.",
   lehre:"Sichtbarkeit bringt Aufträge – und Fragen nach Datenschutz. Wer öffentlich spricht, sollte seine Datenflüsse erklären können.",
   effekt:{typ:"wahl",wert:0,tage:2},
   optionen:[
    {t:"Interview geben",txt:"+4 Ruf sofort, 3 Tage 10 % mehr Nachfrage.",ruf:4,folge:{typ:"nachfrage",wert:0.10,tage:3},ergebnis:"Das Interview läuft im Morgenmagazin: +4 Ruf und drei Tage mehr Anfragen."},
    {t:"Lieber nicht",txt:"Keine Wirkung.",ergebnis:"Du bleibst lieber unter dem Radar."}
   ]},
 { id:"sondertarif", n:"Der Versorger bietet einen Sondertarif", z:"🔌", art:"gut", wahl:true, standard:1,
   txt:"Für 120 € Wechselgebühr bekommst du sechs Tage lang 15 % Rabatt auf jede Netz-Kilowattstunde – tags wie nachts.",
   lehre:"Dynamische und Sondertarife lohnen sich nur, wenn der eigene Verbrauch die Gebühr übersteigt – rechne mit deinem Tagesbedarf, nicht mit dem Prospekt.",
   effekt:{typ:"wahl",wert:0,tage:2},
   optionen:[
    {t:"Wechseln (120 €)",txt:"−120 € jetzt, 6 Tage Strom 15 % günstiger.",geld:-120,folge:{typ:"strompreis",wert:-0.15,tage:6},ergebnis:"Sondertarif aktiv: sechs Tage 15 % günstiger."},
    {t:"Beim alten Tarif bleiben",txt:"Keine Wirkung.",ergebnis:"Du bleibst beim Normaltarif."}
   ]},
 { id:"archivspende", n:"Die Bücherei bietet ihr Archiv an", z:"📚", art:"gut", wahl:true, standard:1,
   txt:"Bücherei Seitenwind will dir ihr digitalisiertes Ortsarchiv als Trainingsdaten überlassen – Herkunft geklärt, aber roh und ungesichtet.",
   lehre:"Gespendete Daten sind erst nach Kuratierung wertvoll: Duplikate, Leaks und Müll müssen raus, sonst trainiert man Fehler mit.",
   effekt:{typ:"wahl",wert:0,tage:2},
   optionen:[
    {t:"Annehmen und sichten",txt:"+12 GB Web-Silage ins Lager (Datenlese lohnt sich).",daten:12,ergebnis:"12 GB Ortsarchiv liegen als Web-Silage in der Scheune – die Datenlese macht daraus Kuratiertes."},
    {t:"Dankend ablehnen",txt:"Keine Wirkung.",ergebnis:"Du lässt das Archiv bei der Bücherei."}
   ]}
];
if(typeof EREIGNISSE!=="undefined"&&Array.isArray(EREIGNISSE)&&!EREIGNISSE.some(e=>e.id==="kuehlung_leck")) EREIGNISSE.push(...EREIGNIS_WAHL);
function ereignisOffen(){ return (S&&S.events||[]).filter(e=>e.wahl&&e.entschieden===undefined); }
function ereignisWahlText(o){
  const t=[]; if(o.geld) t.push((o.geld>0?"+":"−")+Math.abs(o.geld)+" €"); if(o.ruf) t.push("Ruf "+(o.ruf>0?"+":"")+o.ruf); if(o.xp) t.push("+"+o.xp+" XP"); if(o.daten) t.push("+"+o.daten+" GB Silage");
  if(o.folge){ const f=o.folge; t.push(({durchsatz:"Durchsatz ×"+f.wert,forschung:"Forschung "+Math.round(f.wert*100)+" %",gpupreis:"Hardware "+Math.round(f.wert*100)+" %",nachfrage:"Nachfrage +"+Math.round(f.wert*100)+" %",strompreis:"Strom "+Math.round(f.wert*100)+" %"}[f.typ]||f.typ)+" · "+f.tage+" Tage"); }
  return t.length?t.join(" · "):"keine Wirkung";
}
function ereignisEntscheiden(id,idx,stumm){
  const e=(S.events||[]).find(x=>x.id===id&&x.wahl); if(!e||e.entschieden!==undefined) return false;
  const o=(e.optionen||[])[idx]; if(!o) return false;
  if(o.geld<0&&typeof kannZahlen==="function"&&!kannZahlen(-o.geld)){ if(!stumm&&typeof melde==="function") melde("Dafür reicht die Kasse nicht ("+(-o.geld)+" €).","schlecht"); return false; }
  if(o.geld&&typeof buche==="function") buche(o.geld,o.geld<0?"pflege":"job",e.n+" · "+o.t);
  if(o.ruf&&typeof rufBonusDazu==="function") rufBonusDazu(o.ruf);
  if(o.xp&&typeof xpDazu==="function") xpDazu(o.xp);
  if(o.daten){ S.daten=S.daten||{}; S.daten.webmix=Math.round(((S.daten.webmix||0)+o.daten)*10)/10; }
  if(o.folge) S.events.push({id:e.id+"_folge",n:e.n+" – "+o.t,z:e.z,art:e.art,txt:o.ergebnis,lehre:e.lehre,effekt:{typ:o.folge.typ,wert:o.folge.wert,tage:o.folge.tage},folge:true});
  e.entschieden=idx; e.ergebnis=o.ergebnis; e.effekt.tage=1;
  if(!stumm&&typeof melde==="function") melde(e.z+" "+o.t+": "+o.ergebnis,o.geld<0?"info":"gut");
  if(typeof questHook==="function") try{ questHook("entscheidung",e.id); }catch(x){}
  if(typeof sichern==="function") try{ sichern(); }catch(x){}
  return true;
}
/* Tagesende: offene Entscheidungen bekommen die Standard-Option – nie stumm */
function ereignisWahlAuto(bericht){
  for(const e of ereignisOffen()){ const idx=e.standard||0; const o=(e.optionen||[])[idx]; if(!o) continue;
    const ok=ereignisEntscheiden(e.id,idx,true); if(bericht&&bericht.zeilen) bericht.zeilen.push({t:"⏳ "+e.z+" "+e.n+": nicht entschieden – Standard „"+o.t+"“ gilt"+(ok?": "+o.ergebnis:" (nicht bezahlbar, ohne Wirkung)."),art:"info"}); }
}
function ereignisKarteHtml(e){
  const esc2=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  let h='<div class="karte warnrand"><h3>'+e.z+' '+esc2(e.n)+'</h3><p>'+esc2(e.txt)+'</p>';
  if(e.wahl){
    h+='<div class="reihe"><button class="knopf s hell" onclick="adaSprich(\'ereignis_entscheidung\',true)">🔊 Ada zu Entscheidungen</button></div>';
    if(e.entschieden===undefined) h+='<p><b>Deine Entscheidung (bis Tagesende, sonst gilt „'+esc2((e.optionen[e.standard||0]||{}).t||"")+'“):</b></p><div class="werteliste">'+e.optionen.map((o,i)=>'<button class="listenzeile" onclick="ereignisEntscheiden(\''+e.id+'\','+i+')"><span class="txt"><b>'+esc2(o.t)+'</b><span>'+esc2(o.txt)+' · '+esc2(ereignisWahlText(o))+'</span></span></button>').join("")+'</div>';
    else h+='<p>✅ <b>'+esc2((e.optionen[e.entschieden]||{}).t||"")+'</b> – '+esc2(e.ergebnis||"")+'</p>';
  }
  return h+'<div class="wissen abstand"><b>💡 Echt so:</b> '+esc2(e.lehre||"")+'</div></div>';
}
function ereignisOffenHtml(){ return ereignisOffen().map(ereignisKarteHtml).join(""); }

/* Hofbuch */
function ereignisHofbuchHtml(){
  const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const R=EREIGNIS_REGELN;
  let h='<p><b>Entscheidungs-Ereignisse (Ära 9):</b> Manche Ereignisse stellen eine Wahl. Jede Option nennt ihre Zahlen vorab; wer bis zum Tagesende nicht entscheidet, bekommt die Standard-Option. '+EREIGNIS_WAHL.map(x=>'<span class="merk">'+x.z+' '+e(x.n)+': '+x.optionen.map(o=>e(o.t)+' ('+e(ereignisWahlText(o))+')').join(' / ')+'</span>').join(' ')+'</p>'+
   '<p><b>Auftrags-Ereignisse (bei der Abnahme):</b></p><table class="vergleich"><tr><th>Ereignis</th><th>Voraussetzung</th><th>Chance</th><th>Wirkung</th></tr>'+
   '<tr><td>🌟 Kunde begeistert</td><td>sauber abgenommen, Zusage-Ampel 🟡/🔴 (≥ '+Math.round(R.begeistert.quoteMin*100)+' % Fristbudget), Qualitätschance ≥ '+R.begeistert.qualMin+' %</td><td>'+Math.round(R.begeistert.p*100)+' %</td><td>Lohn +'+Math.round(R.begeistert.praemie*100)+' %, Kunde +1 ⭐, Ruf +'+R.begeistert.ruf+'</td></tr>'+
   '<tr><td>💶 Trinkgeld</td><td>🧺 Klein-/Mikrozettel sauber, Serie ≥ '+R.trinkgeld.serie+'</td><td>'+Math.round(R.trinkgeld.p*100)+' %</td><td>Lohn +'+Math.round(R.trinkgeld.bonus*100)+' %</td></tr>'+
   '<tr><td>📣 Empfehlung</td><td>sauber, Kunde hat '+R.empfehlung.sterne+' ⭐</td><td>'+Math.round(R.empfehlung.p*100)+' %</td><td>morgen ein Zettel dieses Kunden mit +'+Math.round(R.empfehlung.lohn*100)+' % Lohn</td></tr>'+
   '<tr><td>🏗️ Folgeauftrag</td><td>Großauftrag (L) sauber</td><td>'+Math.round(R.folgeauftrag.p*100)+' %</td><td>gleicher Zettel erneut, Puffer +'+R.folgeauftrag.puffer+' Tag</td></tr>'+
   '<tr><td>🛡️ DSGVO-Leck</td><td>seit Ära 9 Teil der Datenschutzprüfung bei jeder Abnahme (Kapitel „Datenschutz &amp; Aufsicht“): Risiko je Sektor, Leih-Tier zählt doppelt</td><td>siehe Datenschutz</td><td>Strafe, Ruf, Groll und Abmahnung nach den Datenschutz-Regeln – Schutz durch Fachwissen, Agenten-Tool mit Schutzfunktionen, Schutzregeln, Kontrollpaket</td></tr></table>';
  h+='<p><b>🕵️ Hacker-Angriff:</b> ab Hoftag '+R.hacker.abTag+', '+Math.round(R.hacker.p*100)+' % je Nacht (frühestens alle '+R.hacker.pause+' Tage), nur bei Kunden mit ≥ '+R.hacker.kundenAuftraege+' Aufträgen. Auf dem Dorfplatz: Vier gewinnt gegen den Hacker, bis Tagesende. Sieg: Prämie '+geld(R.hacker.praemieBasis)+' + '+geld(R.hacker.praemieStufe)+' je Hofstufe, +1 ⭐, Ruf +'+R.hacker.ruf+', '+R.hacker.xp+' XP, kein Injection-Schaden heute. Niederlage oder nicht gespielt: Kunde '+R.hacker.verlustGroll+' Tage verloren, −'+R.hacker.verlustSterne+' ⭐, '+geld(R.hacker.verlustStrafe)+', Ruf −3. Remis: Ruf '+R.hacker.remisRuf+'.</p>';
  if(typeof EREIGNISSE!=="undefined"){
    const gut=EREIGNISSE.filter(x=>x.art==="gut"), schlecht=EREIGNISSE.filter(x=>x.art!=="gut");
    h+='<p><b>Hof-Ereignisse (nachts, 34 % Chance je Nacht, gleichverteilt):</b> '+gut.length+' gute · '+schlecht.length+' schlechte/neutrale.</p><div class="werteliste">'+EREIGNISSE.map(x=>'<div class="listenzeile"><span style="flex:0 0 28px;text-align:center">'+(x.z||"")+'</span><span class="txt"><b>'+e(x.n)+' <span class="merk '+(x.art==="gut"?"gut":"")+'">'+(x.art==="gut"?"gut":"Risiko")+' · '+(x.effekt||{}).tage+' Tage</span></b><span>'+e(x.txt||"")+'</span></span></div>').join("")+'</div>';
  }
  return h;
}
if(typeof window!=="undefined"){ Object.assign(window,{EREIGNIS_WAHL,ereignisOffen,ereignisWahlText,ereignisEntscheiden,ereignisWahlAuto,ereignisKarteHtml,ereignisOffenHtml,EREIGNIS_REGELN,ereignisAbschluss,ereignisMorgen,hackerSpawn,hackerOffen,hackerErgebnis,hackerTagesende,ereignisNachtHook,ereignisDurchsatzF,ereignisCloudAusfall,ereignisHofbuchHtml}); }
