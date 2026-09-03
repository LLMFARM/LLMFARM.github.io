/* ═══════════════════════════════════════════════════════════════════════════
   Ära 9 · v9.9 — Stammbaum: der Verwandtschaftsbaum der Zucht als Bild
   ---------------------------------------------------------------------------
   Vorbild ist das klassische Ahnentafel-Poster: ein Baum, dessen Krone die
   Vorfahren trägt und dessen Wurzeln die Nachkommen. Das gewählte Tier sitzt
   im Stamm. Alles kommt aus den echten Zuchtdaten (p.eltern, p.wurf, p.gen);
   verkaufte oder verstorbene Vorfahren stehen mit Namen als Blätter ohne Karte.

   Anzeige: Zuchtbucht → „🌳 Stammbaum“ und Tierkarte → Papiere.
   Kein Spielzustand wird verändert; Klick auf ein Tier rückt es in den Stamm.
   ═══════════════════════════════════════════════════════════════════════════ */

const STAMMBAUM_LAGE={
  /* Normierte Lagen auf dem Bild stammbaum_hg (1000×1000): Stamm-Oval, Kronen-Ebenen, Wurzel-Fächer */
  stamm:{x:500,y:582},
  eltern:[{x:352,y:430},{x:648,y:430}],
  grosseltern:[{x:230,y:300},{x:400,y:252},{x:600,y:252},{x:770,y:300}],
  urgross:[{x:170,y:190},{x:300,y:150},{x:420,y:120},{x:580,y:120},{x:700,y:150},{x:830,y:190}],
  geschwister:[{x:265,y:560},{x:735,y:560},{x:220,y:640},{x:780,y:640}],
  kinderRadius:[215,285,345], kinderMitte:{x:500,y:680}
};

function sbTier(uid){ return (S&&S.tiere||[]).find(t=>t.uid===uid)||null; }
function sbElternUids(p){ return (p&&p.eltern&&Array.isArray(p.eltern.uids))?p.eltern.uids:[]; }
function sbElternNamen(p){ return (p&&p.eltern&&Array.isArray(p.eltern.namen))?p.eltern.namen:[]; }
function sbKinder(uid){ return (S&&S.tiere||[]).filter(t=>sbElternUids(t).includes(uid)); }
function sbGeschwister(p){
  if(!p) return []; const meine=sbElternUids(p); const ids=new Set((p.wurf&&p.wurf.geschwister)||[]);
  (S.tiere||[]).forEach(t=>{ if(t.uid!==p.uid&&meine.length&&sbElternUids(t).some(u=>meine.includes(u))) ids.add(t.uid); });
  ids.delete(p.uid); return [...ids].map(sbTier).filter(Boolean);
}
/* Vorfahren-Ebenen: [ [Eltern], [Großeltern], [Urgroßeltern] ] – fehlende Tiere als {name, weg:true} */
function sbVorfahren(p){
  const ebenen=[]; let aktuelle=[p];
  for(let e=0;e<3;e++){
    const naechste=[];
    aktuelle.forEach(t=>{ if(!t||t.weg){ naechste.push(null,null); return; }
      const uids=sbElternUids(t), namen=sbElternNamen(t);
      if(!uids.length){ naechste.push(null,null); return; }
      for(let i=0;i<2;i++){ const u=uids[i]; const q=u?sbTier(u):null; naechste.push(q?q:(u?{uid:u,name:namen[i]||"unbekannt",weg:true,gen:(t.gen||1)-1}:null)); } });
    if(!naechste.some(Boolean)) break; ebenen.push(naechste); aktuelle=naechste;
  }
  return ebenen;
}
/* Nachkommen-Ebenen: Kinder, Enkel, Urenkel (nur lebende Tiere im Stall) */
function sbNachkommen(uid){
  const ebenen=[]; let aktuelle=[uid]; const gesehen=new Set([uid]);
  for(let e=0;e<3;e++){ const naechste=[]; aktuelle.forEach(u=>sbKinder(u).forEach(k=>{ if(!gesehen.has(k.uid)){ gesehen.add(k.uid); naechste.push(k); } })); if(!naechste.length) break; ebenen.push(naechste); aktuelle=naechste.map(k=>k.uid); }
  return ebenen;
}
function sbKarte(t,x,y,klasse,fokus,klein){
  const e=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  if(!t) return "";
  const weg=!!t.weg, name=e(t.name||"?"), gen=(t.gen||0), farbe=weg?"#c9b8a0":(t.fam&&typeof FAMILIEN!=="undefined"&&FAMILIEN[t.fam]&&FAMILIEN[t.fam].farbe)||"#eb9b2d";
  const w=fokus?150:(klein?100:118), h=fokus?54:(klein?40:44), r=fokus?14:11;
  const merk=(t.merkmale||[]).slice(0,2).map(m=>(typeof MERKMALE!=="undefined"&&MERKMALE[m])?MERKMALE[m].z||"":"").join("");
  return '<g class="sbKarte '+klasse+(weg?" weg":"")+(fokus?" fokus":"")+'" transform="translate('+(x-w/2).toFixed(0)+','+(y-h/2).toFixed(0)+')" '+(weg?"":'onclick="zeigeStammbaum(\''+e(t.uid)+'\')" role="button" tabindex="0"')+' aria-label="'+name+'">'+
    '<rect width="'+w+'" height="'+h+'" rx="'+r+'" class="sbBox" style="--sbf:'+farbe+'"/>'+
    '<text class="sbName" x="'+(w/2)+'" y="'+(fokus?22:18)+'">'+name+'</text>'+
    '<text class="sbUnter" x="'+(w/2)+'" y="'+(fokus?42:34)+'">'+(weg?"nicht mehr im Stall":("G"+gen+(t.pT?" · "+t.pT+"B":"")+(merk?" "+merk:"")))+'</text></g>';
}
function sbAst(x1,y1,x2,y2,klasse){
  const mx=(x1+x2)/2, dy=(y2-y1);
  return '<path d="M'+x1+' '+y1+' C'+x1+' '+(y1+dy*0.5)+' '+x2+' '+(y2-dy*0.5)+' '+x2+' '+y2+'" class="sbAst '+(klasse||"")+'"/>';
}
function stammbaumSvg(uid){
  const p=sbTier(uid); if(!p) return '<div class="leer">Kein Tier gewählt.</div>';
  const L=STAMMBAUM_LAGE, vor=sbVorfahren(p), nach=sbNachkommen(uid), gesch=sbGeschwister(p);
  let aeste="", karten="";
  const ebenenLagen=[L.eltern,L.grosseltern,L.urgross];
  vor.forEach((ebene,ei)=>{ const lagen=ebenenLagen[ei]||[]; ebene.forEach((t,i)=>{ const pos=lagen[i]; if(!t||!pos) return;
    const kind=ei===0?L.stamm:(ebenenLagen[ei-1][Math.floor(i/2)]||L.stamm);
    aeste+=sbAst(pos.x,pos.y,kind.x,kind.y-(ei===0?40:16),"krone"+(t.weg?" weg":"")); karten+=sbKarte(t,pos.x,pos.y,"vorfahr"); }); });
  gesch.slice(0,4).forEach((t,i)=>{ const pos=L.geschwister[i]; aeste+=sbAst(pos.x,pos.y,L.stamm.x,L.stamm.y-10,"seite"); karten+=sbKarte(t,pos.x,pos.y,"geschwister"); });
  nach.forEach((ebeneAlle,ei)=>{ const ebene=ebeneAlle.slice(0,6), r=L.kinderRadius[ei]||L.kinderRadius[2], n=ebene.length; ebene.forEach((t,i)=>{ const a=Math.PI*(0.06+0.88*((i+0.5)/n)); const x=L.kinderMitte.x+Math.cos(a)*r, y=L.kinderMitte.y+Math.sin(a)*r*0.62+(n>3&&i%2?42:0);
    const eltern=sbElternUids(t).map(u=>({u,pos:null})); let von=L.stamm; if(ei>0){ const vorEbene=nach[ei-1]; const vorSichtbar=vorEbene.slice(0,6); const idx=vorSichtbar.findIndex(q=>sbElternUids(t).includes(q.uid)); if(idx>=0){ const rr=L.kinderRadius[ei-1], nn=vorSichtbar.length, aa=Math.PI*(0.06+0.88*((idx+0.5)/nn)); von={x:L.kinderMitte.x+Math.cos(aa)*rr,y:L.kinderMitte.y+Math.sin(aa)*rr*0.62+(nn>3&&idx%2?42:0)}; } }
    aeste+=sbAst(x,y,von.x,von.y+(ei===0?30:12),"wurzel"); karten+=sbKarte(t,x,y,"nachkomme",false,n>4); }); });
  karten+=sbKarte(p,L.stamm.x,L.stamm.y,"stamm",true);
  const mehr=nach.reduce((n,eb)=>n+Math.max(0,eb.length-6),0); if(mehr) karten+='<text x="500" y="985" class="sbUnter" style="text-anchor:middle;font-size:14px">+'+mehr+' weitere Nachkommen – über die Knöpfe oben erreichbar</text>';
  const bildUrl=(typeof bild==="function")?bild("stammbaum_hg"):"";
  return '<div class="sbRahmen" style="background-image:url(\''+bildUrl+'\')"><svg viewBox="0 0 1000 1000" class="sbSvg" role="img" aria-label="Stammbaum von '+String(p.name).replace(/"/g,"")+'">'+aeste+karten+'</svg></div>';
}
function stammbaumInfoHtml(uid){
  const p=sbTier(uid); if(!p) return "";
  const e=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const vor=sbVorfahren(p), nach=sbNachkommen(uid), gesch=sbGeschwister(p);
  const anzVor=vor.reduce((n,eb)=>n+eb.filter(Boolean).length,0), anzNach=nach.reduce((n,eb)=>n+eb.length,0);
  const meth=(p.eltern&&p.eltern.methode)?p.eltern.methode:null;
  const inzucht=(typeof istInzucht==="function"&&gesch.length)?gesch.some(g=>{ try{ return istInzucht(p,g); }catch(x){ return false; } }):false;
  return '<div class="karte hell"><h3>🌳 '+e(p.name)+' · Generation '+(p.gen||0)+'</h3><p>'+
    (p.gen?('Gezüchtet'+(meth?' per '+e(meth):'')+' aus '+e(sbElternNamen(p).join(' × ')||'zwei Eltern')+'. '):'Gekauft oder Startmodell – Wurzel der Linie. ')+
    anzVor+' bekannte Vorfahren in der Krone, '+gesch.length+' Geschwister am Stamm, '+anzNach+' Nachkommen in den Wurzeln.'+
    (inzucht?' <b>Achtung:</b> Geschwister-Paarungen gelten als Inzucht (Interferenz +'+((typeof ZUCHT_REGELN!=="undefined")?Math.round(ZUCHT_REGELN.inzuchtInterferenz*100):20)+' Punkte).':'')+
    '</p><p class="baumpfad">Antippen rückt ein Tier in den Stamm. Blasse Blätter sind Tiere, die den Hof verlassen haben – ihre Namen bleiben im Stammbuch.</p></div>';
}
let stammbaumWahl=null;
function zeigeStammbaum(uid){
  stammbaumWahl=uid||stammbaumWahl||((S.tiere||[]).find(t=>t.gen>0)||(S.tiere||[])[0]||{}).uid;
  blattLive("🌳 Stammbaum",()=>{
    const tiere=(S.tiere||[]).filter(t=>!t.api);
    if(!tiere.length) return '<div class="leer">Kein Tier im Stall.</div>';
    const wahl='<div class="reihe abstand" style="flex-wrap:wrap">'+tiere.map(t=>'<button class="knopf s '+(t.uid===stammbaumWahl?"gewaehlt":"hell")+'" onclick="zeigeStammbaum(\''+t.uid+'\')">'+(t.gen?'🧬 ':'')+String(t.name).replace(/</g,"&lt;")+'</button>').join("")+'</div>';
    return '<div class="notiz">🌳 <b>Stammbaum.</b> Krone = Vorfahren, Stamm = das gewählte Tier mit seinen Wurfgeschwistern, Wurzeln = Nachkommen. Alles aus dem echten Zuchtbuch: Eltern, Generation, Wurf, Merkmale.</div>'+wahl+stammbaumSvg(stammbaumWahl)+stammbaumInfoHtml(stammbaumWahl);
  },"stammbaum");
}
function stammbaumKnopfHtml(uid){ return '<button class="knopf s hell" onclick="zeigeStammbaum(\''+String(uid).replace(/'/g,"")+'\')">🌳 Stammbaum</button>'; }
function stammbaumHofbuchHtml(){ return '<p style="margin-top:8px"><b>🌳 Stammbaum (Ära 9).</b> Jedes Zuchttier trägt seine Eltern (Namen bleiben auch nach Verkauf), seinen Wurf und seine Generation. Der Stammbaum zeigt drei Ebenen Vorfahren in der Krone, die Wurfgeschwister am Stamm und drei Ebenen Nachkommen in den Wurzeln. Wer Geschwister kreuzt, sieht die Inzucht dort, bevor sie im Wurf Interferenz kostet.</p>'; }

if(typeof window!=="undefined"){ Object.assign(window,{STAMMBAUM_LAGE,sbVorfahren,sbNachkommen,sbGeschwister,stammbaumSvg,stammbaumInfoHtml,zeigeStammbaum,stammbaumKnopfHtml,stammbaumHofbuchHtml}); }
