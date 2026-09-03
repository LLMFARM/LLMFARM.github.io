/* ═══════════════════════════════════════════════════════════════════════════
   Ära 9 · v9.9 — Techbaum-Darstellung: radial (Fähigkeiten, MCP) und Raster (Material)
   ---------------------------------------------------------------------------
   Zwei datengetriebene Zeichner, beide reine Ausgabe (kein Spielzustand):

   tbRadialSvg(cfg)  – Netz von der Mitte aus: jeder Zweig bekommt einen Winkel,
                       jede Stufe einen Ring; freigeschaltete Kanten leuchten.
                       cfg={zentrum:{n,z,status,info}, zweige:[{id,n,z,farbe,knoten:[{id,n,z,braucht:[],status,kurz}]}],
                            klick:"jsFunktionsname", bild:"techbaum_radial", wahl:"knotenId"}
   tbRasterHtml(cfg) – Tafel mit Zeilen (Kategorien) und Spalten (Stufen), Pfeile
                       zwischen Voraussetzung und Folge, Schloss auf gesperrten Feldern.
                       cfg={zeilen:[{id,n,z}], spalten:["…"], knoten:[{id,n,z,zeile,spalte,braucht:[],status,kurz}],
                            klick:"jsFunktionsname", bild:"techbaum_raster", wahl:"knotenId", titel}

   status: "fertig" (freigeschaltet) · "aktiv" (läuft gerade) · "kann" (jetzt möglich)
         · "gesperrt" (Voraussetzung fehlt) · "teuer" (möglich, aber Kasse/Punkte fehlen)
   Die Farben kommen aus der Hof-Palette (Holz, Papier, Wiese, Honig, Himmel).
   ═══════════════════════════════════════════════════════════════════════════ */

const TB_FARBEN={fertig:"#5aa348",aktiv:"#eb9b2d",kann:"#eb9b2d",teuer:"#c9a96a",gesperrt:"#8a7a6a",holz:"#4a2c15",papier:"#fff7e6"};
function tbEsc(s){ return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function tbBild(name){ return (typeof bild==="function")?bild(name):""; }

/* Tiefe eines Knotens innerhalb seines Zweigs (0 = hängt direkt an der Mitte) */
function tbTiefe(k,alle,seen){
  seen=seen||{}; if(!k||seen[k.id]) return 0; seen[k.id]=true;
  const eltern=(k.braucht||[]).map(id=>alle.find(x=>x.id===id)).filter(Boolean);
  if(!eltern.length) return 0;
  return 1+Math.max(...eltern.map(e=>tbTiefe(e,alle,seen)));
}

function tbRadialSvg(cfg){
  /* Breites 14:9-Brett: Der ganze Baum passt ins Blatt, ohne dass Namen schrumpfen.
     X bleibt kreisförmig weit, Y wird zu einer Hofplakette gestaucht. */
  const W=1120,H=720, MX=560,MY=360,YF=.62, ringe=[0,230,335,425], zweige=cfg.zweige||[], n=Math.max(1,zweige.length);
  const alle=zweige.flatMap(z=>z.knoten.map(k=>({...k,_zweig:z})));
  const pos={};
  zweige.forEach((z,zi)=>{
    /* Drei Meisterwege brauchen an den gemeinsamen Sektorgrenzen mehr Luft für
       die ausgeschriebenen Namen; die fünf kurzen MCP-Zweige dürfen breiter fächern. */
    const mitte=-Math.PI/2+zi*2*Math.PI/n, spanne=2*Math.PI/n*(n===3?0.48:0.68);
    const tiefen={}; z.knoten.forEach(k=>{ const t=Math.min(3,tbTiefe(k,z.knoten)+1); (tiefen[t]=tiefen[t]||[]).push(k); });
    Object.entries(tiefen).forEach(([t,liste])=>{
      const basisR=ringe[Number(t)]||ringe[3];
      const stufenSpanne=n===3&&liste.length>1?spanne*(Number(t)===1?.65:1.15):spanne;
      liste.forEach((k,i)=>{ const off=liste.length>1?(i-(liste.length-1)/2)*(stufenSpanne/Math.max(1,liste.length-1)):0;
        /* Drei gleich tiefe Knoten als Fächer statt als enge Perlenkette. */
        const r=liste.length>=3?(i===(liste.length-1)/2?basisR-28:basisR+22):basisR;
        const a=mitte+off; pos[k.id]={x:MX+Math.cos(a)*r,y:MY+Math.sin(a)*r*YF,farbe:z.farbe||TB_FARBEN.aktiv,tiefe:Number(t)}; });
    });
  });
  const punkt=(a,r)=>({x:MX+Math.cos(a)*r,y:MY+Math.sin(a)*r*YF});
  const sektorPfad=(a1,a2,r1,r2)=>{ const p1=punkt(a1,r2),p2=punkt(a2,r2),p3=punkt(a2,r1),p4=punkt(a1,r1);
    return 'M'+p1.x.toFixed(1)+' '+p1.y.toFixed(1)+' A'+r2+' '+(r2*YF).toFixed(1)+' 0 0 1 '+p2.x.toFixed(1)+' '+p2.y.toFixed(1)+' L'+p3.x.toFixed(1)+' '+p3.y.toFixed(1)+' A'+r1+' '+(r1*YF).toFixed(1)+' 0 0 0 '+p4.x.toFixed(1)+' '+p4.y.toFixed(1)+' Z'; };
  let sektoren='', zweigKoepfe='';
  const festeKoepfe=n===3?[{x:560,y:44},{x:990,y:670},{x:130,y:670}]:n===5?[{x:560,y:44},{x:1000,y:196},{x:930,y:620},{x:190,y:620},{x:120,y:196}]:null;
  zweige.forEach((z,zi)=>{ const mitte=-Math.PI/2+zi*2*Math.PI/n, halb=Math.PI/n*0.84, hp=festeKoepfe?festeKoepfe[zi]:punkt(mitte,480), farbe=z.farbe||TB_FARBEN.aktiv;
    const kopf=(z.z||'')+' '+z.n, bw=Math.max(126,Math.min(214,48+kopf.length*8.2));
    sektoren+='<path d="'+sektorPfad(mitte-halb,mitte+halb,86,490)+'" class="tbSektor" style="--tbf:'+tbEsc(farbe)+'"/>';
    zweigKoepfe+='<g class="tbZweigKopf" style="--tbf:'+tbEsc(farbe)+'" transform="translate('+hp.x.toFixed(1)+','+hp.y.toFixed(1)+')">'+
      '<rect x="'+(-bw/2).toFixed(1)+'" y="-20" width="'+bw.toFixed(1)+'" height="40" rx="20"/><text y="6">'+tbEsc(kopf)+'</text></g>'; });
  const ringHilfen=ringe.slice(1).map(r=>'<ellipse cx="'+MX+'" cy="'+MY+'" rx="'+r+'" ry="'+(r*YF).toFixed(1)+'" class="tbHilfsring"/>').join('');
  const st=id=>(alle.find(x=>x.id===id)||{}).status||"gesperrt";
  let kanten="", knoten="";
  alle.forEach(k=>{
    const p=pos[k.id]; if(!p) return;
    const eltern=(k.braucht||[]).filter(id=>pos[id]);
    const quellen=eltern.length?eltern.map(id=>pos[id]):[{x:MX,y:MY}];
    quellen.forEach((q,qi)=>{
      const an=k.status==="fertig"||k.status==="aktiv", halb=!an&&(k.status==="kann"||k.status==="teuer");
      const elternKnoten=eltern[qi]?alle.find(x=>x.id===eltern[qi]):null, fremd=!!(elternKnoten&&elternKnoten._zweig!==k._zweig);
      if(fremd){ /* Voraussetzung aus einem anderen Zweig: als Bogen um die Mitte herum, nicht durch die Nabe */
        const a1=Math.atan2((q.y-MY)/YF,q.x-MX), a2=Math.atan2((p.y-MY)/YF,p.x-MX); let d=a2-a1; while(d>Math.PI) d-=2*Math.PI; while(d<-Math.PI) d+=2*Math.PI;
        const am=a1+d/2, rm=Math.max(108,Math.min(Math.hypot(q.x-MX,(q.y-MY)/YF),Math.hypot(p.x-MX,(p.y-MY)/YF))*0.62);
        const cx=MX+Math.cos(am)*rm, cy=MY+Math.sin(am)*rm*YF;
        kanten+='<path d="M'+q.x.toFixed(1)+' '+q.y.toFixed(1)+' Q'+cx.toFixed(1)+' '+cy.toFixed(1)+' '+p.x.toFixed(1)+' '+p.y.toFixed(1)+'" class="tbKante fremd'+(an?" an":halb?" halb":"")+'" style="--tbf:'+p.farbe+'"/>';
      } else kanten+='<line x1="'+q.x.toFixed(1)+'" y1="'+q.y.toFixed(1)+'" x2="'+p.x.toFixed(1)+'" y2="'+p.y.toFixed(1)+'" class="tbKante'+(an?" an":halb?" halb":"")+'" style="--tbf:'+p.farbe+'"/>';
    });
  });
  /* Namen suchen sich bei den drei Meisterwegen selbst den freien Platz unter,
     über oder neben ihrem Symbol. Dabei gelten alle Knoten und bereits gesetzten
     Schilder als Hindernisse – lange Begriffe verschwinden so nie hinter Kreisen. */
  const labelBoxen=[], ueberlappung=(a,b)=>Math.max(0,Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y));
  if(n===3) alle.forEach(k=>{ const p=pos[k.id]; if(!p) return; const lw=116,lh=46,r=k.status==="fertig"?34:30;
    const kandidaten=[{dx:-lw/2,dy:r+10},{dx:-lw/2,dy:-r-lh-10},{dx:r+12,dy:-lh/2},{dx:-r-lw-12,dy:-lh/2}];
    let best=null,bestScore=Infinity;
    kandidaten.forEach((c,ci)=>{ const box={x:p.x+c.dx,y:p.y+c.dy,w:lw,h:lh}, rand=Math.max(0,12-box.x)+Math.max(0,box.x+lw-(W-12))+Math.max(0,12-box.y)+Math.max(0,box.y+lh-(H-12));
      let score=ci*4+rand*500+ueberlappung(box,{x:MX-76,y:MY-76,w:152,h:152})*20;
      alle.forEach(o=>{ if(o.id===k.id||!pos[o.id]) return; const q=pos[o.id]; score+=ueberlappung(box,{x:q.x-45,y:q.y-45,w:90,h:90})*20; });
      labelBoxen.forEach(b=>{ score+=ueberlappung(box,b)*30; });
      if(score<bestScore){ bestScore=score; best={...c,box}; }
    });
    p.label=best; labelBoxen.push(best.box);
  });
  alle.forEach(k=>{
    const p=pos[k.id]; if(!p) return; const r=k.status==="fertig"?34:30, gew=cfg.wahl===k.id;
    /* Drei Wege tragen längere Namen: kompaktere, zweizeilige Schilder lassen
       zwischen benachbarten radialen Spuren eine sichtbare Fuge. */
    const lw=n===3?116:152, lx=p.label?p.label.dx:-lw/2, ly=p.label?p.label.dy:r+10;
    knoten+='<g class="tbKnoten '+tbEsc(k.status)+(gew?" gewaehlt":"")+'" style="--tbf:'+p.farbe+'" transform="translate('+p.x.toFixed(1)+','+p.y.toFixed(1)+')" onclick="'+tbEsc(cfg.klick)+'(\''+tbEsc(k.id)+'\')" tabindex="0" role="button" aria-label="'+tbEsc(k.n)+' – '+tbEsc(k.status)+'">'+
      '<circle r="'+(r+9)+'" class="tbGlow"/><circle r="'+(r+6)+'" class="tbZweigRing"/><circle r="'+r+'" class="tbRing"/><circle r="'+(r-5)+'" class="tbFuell"/>'+
      '<text class="tbZeichen" y="9">'+tbEsc(k.z||"•")+'</text>'+
      (k.status==="gesperrt"?'<text class="tbSchloss" x="'+(r-8)+'" y="-'+(r-10)+'">🔒</text>':"")+
      '<foreignObject x="'+lx+'" y="'+ly+'" width="'+lw+'" height="46"><div xmlns="http://www.w3.org/1999/xhtml" class="tbKnotenName'+(n===3?' drei':'')+'">'+tbEsc(k.kurz||k.n)+'</div></foreignObject></g>';
  });
  const zc=cfg.zentrum||{n:"Mitte",z:"⭐",status:"fertig"};
  const zentrum='<g class="tbKnoten zentrum '+tbEsc(zc.status||"fertig")+'" transform="translate('+MX+','+MY+')" onclick="'+tbEsc(cfg.klick)+'(\'__zentrum\')" role="button" tabindex="0" aria-label="'+tbEsc(zc.n)+'">'+
    '<circle r="72" class="tbGlow"/><circle r="64" class="tbRing"/><circle r="57" class="tbFuell"/><text class="tbZeichen gross" y="8">'+tbEsc(zc.z||"⭐")+'</text><text class="tbMitteName" y="36">'+tbEsc(zc.kurz||zc.n)+'</text></g>';
  const legende=zweige.map(z=>'<span class="merk" style="border-color:'+tbEsc(z.farbe||"#8b5e34")+'">'+tbEsc(z.z||"")+' '+tbEsc(z.n)+'</span>').join("");
  return '<div class="tbRahmen radial" style="background-image:url(\''+tbBild(cfg.bild||"techbaum_radial_v2")+'\')">'+
    '<svg viewBox="0 0 '+W+' '+H+'" class="tbSvg" role="img" aria-label="'+tbEsc(cfg.titel||"Fähigkeitennetz")+'"><g class="tbGruppen">'+sektoren+ringHilfen+'</g><g class="tbKanten">'+kanten+'</g>'+zweigKoepfe+zentrum+knoten+'</svg></div>'+
    '<div class="reihe abstand tbLegende"><span class="merk info">Farbfeld = ein Zweig</span>'+legende+'<span class="merk gut">● freigeschaltet</span><span class="merk gold">● jetzt möglich</span><span class="merk">🔒 Voraussetzung fehlt</span></div>';
}

function tbRasterHtml(cfg){
  const zeilen=cfg.zeilen||[], spalten=cfg.spalten||[], knoten=cfg.knoten||[];
  const SB=174, X0=154, Y0=72, FW=148, FH=72, W=X0+spalten.length*SB+18;
  /* Mehrere Einträge in derselben Zelle stapeln sich untereinander – die Zeile wächst mit */
  const zelle={}; knoten.forEach(k=>{ const zi=Math.max(0,zeilen.findIndex(z=>z.id===k.zeile)), si=Math.max(0,Math.min(spalten.length-1,k.spalte||0)); (zelle[zi+":"+si]=zelle[zi+":"+si]||[]).push(k); });
  const zeilenH=zeilen.map((z,zi)=>{ let m=1; spalten.forEach((s,si)=>{ m=Math.max(m,(zelle[zi+":"+si]||[]).length); }); return Math.max(118,m*82+18); });
  const zeilenY=[]; let yy=Y0; zeilen.forEach((z,i)=>{ zeilenY.push(yy); yy+=zeilenH[i]; }); const H=yy+20;
  const pos={}; Object.entries(zelle).forEach(([key,liste])=>{ const [zi,si]=key.split(":").map(Number); const top=zeilenY[zi], h=zeilenH[zi];
    liste.forEach((k,i)=>{ pos[k.id]={x:X0+si*SB+SB/2,y:top+9+(i+0.5)*((h-18)/liste.length),zi,si}; }); });
  let kanten="";
  knoten.forEach(k=>{ (k.braucht||[]).forEach(id=>{ const q=pos[id], p=pos[k.id]; if(!q||!p) return;
    const an=k.status==="fertig"||k.status==="aktiv", halb=!an&&(k.status==="kann"||k.status==="teuer");
    const quer=q.zi!==p.zi; let d;
    if(p.x>q.x){ const x1=q.x+FW/2, x2=p.x-FW/2, gx=(x1+x2)/2;
      d='M'+x1+' '+q.y+' H'+gx+' V'+p.y+' H'+x2;
    } else if(p.x<q.x){ const x1=q.x-FW/2, x2=p.x+FW/2, gx=(x1+x2)/2;
      d='M'+x1+' '+q.y+' H'+gx+' V'+p.y+' H'+x2;
    } else { const rechts=X0+(q.si+1)*SB-8, seite=q.y<p.y?1:-1;
      d='M'+(q.x+FW/2)+' '+q.y+' H'+rechts+' V'+p.y+' H'+(p.x+FW/2); }
    kanten+='<path d="'+d+'" class="tbKante raster'+(quer?" quer":"")+(an?" an":halb?" halb":"")+'" marker-end="url(#tbPfeil'+(an?"An":halb?"Halb":"")+')"/>'; }); });
  let felder="";
  knoten.forEach(k=>{ const p=pos[k.id]; if(!p) return; const gew=cfg.wahl===k.id;
    felder+='<g class="tbFeld '+tbEsc(k.status)+(gew?" gewaehlt":"")+'" transform="translate('+(p.x-FW/2)+','+(p.y-FH/2)+')" onclick="'+tbEsc(cfg.klick)+'(\''+tbEsc(k.id)+'\')" role="button" tabindex="0" aria-label="'+tbEsc(k.n)+' – '+tbEsc(k.status)+'">'+
      '<rect width="'+FW+'" height="'+FH+'" rx="14" class="tbBox"/><rect x="4" y="4" width="'+(FW-8)+'" height="'+(FH-8)+'" rx="11" class="tbBoxInnen"/>'+
      '<text class="tbZeichen" x="29" y="44">'+tbEsc(k.status==="gesperrt"?"🔒":(k.z||"•"))+'</text>'+
      '<foreignObject x="49" y="7" width="'+(FW-55)+'" height="'+(FH-12)+'"><div xmlns="http://www.w3.org/1999/xhtml" class="tbFeldText">'+tbEsc(k.kurz||k.n)+(k.unter?'<small>'+tbEsc(k.unter)+'</small>':"")+'</div></foreignObject></g>'; });
  const kopf=spalten.map((s,i)=>'<text class="tbKopf" x="'+(X0+i*SB+SB/2)+'" y="'+(Y0-24)+'">'+tbEsc(s)+'</text>').join("");
  const bandFarben=["#8ec2ec","#eb9b2d","#b57edc","#5aa348","#e05a5a"];
  const baender=zeilen.map((z,i)=>'<rect x="12" y="'+(zeilenY[i]+5)+'" width="'+(W-32)+'" height="'+(zeilenH[i]-10)+'" rx="16" class="tbZeilenBand" style="--tbf:'+tbEsc(z.farbe||bandFarben[i%bandFarben.length])+'"/>').join("");
  const seite=zeilen.map((z,i)=>'<g class="tbZeile" style="--tbf:'+tbEsc(z.farbe||bandFarben[i%bandFarben.length])+'"><rect x="18" y="'+(zeilenY[i]+12)+'" width="122" height="'+(zeilenH[i]-24)+'" rx="14" class="tbZeileBox"/><text class="tbZeileText" x="79" y="'+(zeilenY[i]+zeilenH[i]/2+7)+'">'+tbEsc((z.z||"")+" "+z.n)+'</text></g>').join("");
  const raster=zeilen.map((z,i)=>'<line x1="'+X0+'" y1="'+zeilenY[i]+'" x2="'+(W-20)+'" y2="'+zeilenY[i]+'" class="tbLinie"/>').join("")+spalten.map((s,i)=>'<line x1="'+(X0+i*SB)+'" y1="'+Y0+'" x2="'+(X0+i*SB)+'" y2="'+(H-20)+'" class="tbLinie"/>').join("");
  return '<div class="tbRahmen raster" style="background-image:url(\''+tbBild(cfg.bild||"techbaum_raster_v2")+'\')">'+
    '<svg viewBox="0 0 '+W+' '+H+'" class="tbSvg" role="img" aria-label="'+tbEsc(cfg.titel||"Forschungsbaum")+'">'+
    '<defs><marker id="tbPfeil" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#8a7a6a"/></marker>'+
    '<marker id="tbPfeilAn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#5aa348"/></marker>'+
    '<marker id="tbPfeilHalb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#eb9b2d"/></marker></defs>'+
    '<rect x="8" y="'+(Y0-40)+'" width="'+(W-16)+'" height="'+(H-Y0+22)+'" rx="18" class="tbTafel"/>'+baender+raster+kopf+seite+kanten+felder+'</svg></div>'+
    '<div class="reihe abstand tbLegende"><span class="merk gut">● vorhanden</span><span class="merk gold">● jetzt möglich</span><span class="merk">🔒 Voraussetzung fehlt</span></div>';
}

/* Zustand eines Forschungs-, Fähigkeits- oder Anschlussknotens in eine Statusfarbe übersetzen */
function tbStatus(hat,aktiv,vorOk,kannZahlen){ return hat?"fertig":aktiv?"aktiv":!vorOk?"gesperrt":kannZahlen?"kann":"teuer"; }


/* ═══ Anwendungen der Zeichner ═══════════════════════════════════════════ */

/* — Forschung als Raster: Zeilen = Fachrichtung, Spalten = Aufbaustufe (forschungsTiefe) — */
const TB_FORSCH_ZEILE={sft:"training",lora:"training",qlora:"training",dpo:"training",cpt:"training",distill:"training",grpo:"training",ppo:"training",
  quant:"serving",vllm:"serving",cloud:"serving",merge:"zucht",merge_ties:"zucht",wurfpflege:"zucht",rag:"wissen",secondbrain:"wissen",okf:"wissen",
  geschirr:"agenten",guardrails:"agenten",multiagent:"agenten",openclaw:"agenten",hermes:"agenten"};
const TB_FORSCH_ZEILEN=[{id:"training",n:"Training",z:"📖"},{id:"serving",n:"Betrieb",z:"🚄"},{id:"wissen",n:"Wissen",z:"🗄️"},{id:"zucht",n:"Zucht",z:"🧬"},{id:"agenten",n:"Agenten",z:"🦺"}];
let forschWahl=null;
function forschWaehlen(id){ forschWahl=id; if(typeof zeigeForschung==="function") zeigeForschung(); }
function forschVorOk(f){ return (f.braucht||[]).every(b=>FORSCHUNG[b]?S.forschung[FORSCHUNG[b].frei]:S.forschung[b]); }
function forschRasterHtml(){
  const ids=Object.keys(FORSCHUNG), maxT=Math.max(0,...ids.map(id=>forschungsTiefe(id)));
  const spalten=[]; for(let t=0;t<=maxT;t++) spalten.push(t===0?"Grundlagen":"Aufbaustufe "+t);
  const knoten=ids.map(id=>{ const f=FORSCHUNG[id], hat=!!S.forschung[f.frei], aktiv=!!(S.forschungAktiv&&S.forschungAktiv.id===id);
    const sperre=(typeof forschungsSperre==="function")?forschungsSperre(id):null;
    const kosten=(typeof forschungsKosten==="function")?forschungsKosten(f):f.kosten;
    return {id,n:f.n,kurz:f.n.replace(/\s*\(.*\)$/,""),unter:hat?"erforscht":kosten+" € · "+f.tage+" T",z:f.z,zeile:TB_FORSCH_ZEILE[id]||"agenten",spalte:forschungsTiefe(id),braucht:f.braucht||[],
      status:tbStatus(hat,aktiv,forschVorOk(f)&&!sperre,!S.forschungAktiv&&S.kredit>=kosten)}; });
  const zeilen=TB_FORSCH_ZEILEN.filter(z=>knoten.some(k=>k.zeile===z.id));
  return '<div class="notiz">Der <b>Forschungsbaum</b> als Tafel: Zeilen sind Fachrichtungen, Spalten die Aufbaustufe. Pfeile zeigen, was ein Verfahren voraussetzt; leuchtende Pfeile sind frei. Es forscht immer nur ein Projekt gleichzeitig.</div>'+
    (S.forschungAktiv?'<div class="karte hell"><h3>🔬 Läuft: '+tbEsc(FORSCHUNG[S.forschungAktiv.id].n)+'</h3><p>Noch '+S.forschungAktiv.rest+' Tag(e).</p></div>':"")+
    tbRasterHtml({titel:"Forschungsbaum",bild:"techbaum_raster_v2",klick:"forschWaehlen",wahl:forschWahl,zeilen,spalten,knoten})+forschDetailHtml(forschWahl);
}
function forschDetailHtml(id){
  const f=FORSCHUNG[id]; if(!f) return '<div class="karte hell"><p>Ein Feld antippen, um Kosten, Voraussetzungen und Wirkung zu sehen.</p></div>';
  const hat=!!S.forschung[f.frei], vorOk=forschVorOk(f);
  const sperre=(typeof forschungsSperre==="function")?forschungsSperre(id):null, kosten=(typeof forschungsKosten==="function")?forschungsKosten(f):f.kosten;
  const kann=!hat&&vorOk&&!sperre&&!S.forschungAktiv&&S.kredit>=kosten;
  return '<div class="karte'+(hat?" hell":"")+'"><h3>'+tbEsc(f.z)+' '+tbEsc(f.n)+' <span class="merk'+(hat?" gut":"")+'">'+(hat?"✅ erforscht":kosten+" € · "+f.tage+" Tag"+(f.tage>1?"e":""))+'</span></h3><p>'+tbEsc(f.txt)+'</p>'+
    ((f.braucht||[]).length?'<p class="baumpfad">⬑ braucht: '+f.braucht.map(b=>((FORSCHUNG[b]&&S.forschung[FORSCHUNG[b].frei])?"✅ ":"")+tbEsc((FORSCHUNG[b]||{}).n||b)).join(" · ")+'</p>':"")+
    (hat?"":'<div class="reihe abstand">'+(sperre?'<span class="baumpfad">'+tbEsc(sperre)+'</span>':S.forschungAktiv?'<span class="baumpfad">⏳ Forschungsplatz belegt</span>':"")+'<button class="knopf s'+(kann?" gruen":"")+'" '+(kann?"":"disabled")+' onclick="forschen(&quot;'+tbEsc(id)+'&quot;)">Erforschen ('+kosten+' €)</button></div>')+'</div>';
}

/* — Die Landkarte über allen Bäumen: erst das Ziel verstehen, dann in den Detailbaum springen — */
function forschUebersichtHtml(){
  const fAlle=Object.entries(FORSCHUNG), fFertig=fAlle.filter(([id,f])=>S.forschung[f.frei]).length;
  const sAlle=Object.values(SKILLS).flatMap(w=>w.skills), sFertig=sAlle.filter(s=>S.skills&&S.skills[s.id]).length;
  const mAlle=typeof mcpAlleKnoten==="function"?mcpAlleKnoten():[], mFertig=typeof mcpAnzahlFertig==="function"?mcpAnzahlFertig():0, mOffen=typeof mcpFrei==="function"&&mcpFrei();
  const h=hofLevel(), rechenplaetze=(S.buchten||[]).length, balken=(n,g)=>{ const p=Math.max(0,Math.min(100,Math.round(g?100*n/g:0))); return '<span class="tbGesamtBalken" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+p+'"><i style="width:'+p+'%"></i></span>'; };
  const ast=(cls,z,n,nutzen,stand,themen,aktion)=>'<button class="tbGesamtAst '+cls+'" aria-label="'+tbEsc(n)+' öffnen" onclick="'+aktion+'"><span class="tbAstKopf"><span class="tbAstIcon">'+z+'</span><span><b>'+tbEsc(n)+'</b><small>'+tbEsc(nutzen)+'</small></span><span class="tbAstPfeil" aria-hidden="true">→</span></span><span class="tbAstThemen">'+themen.map(x=>'<span>'+x+'</span>').join('')+'</span><span class="tbAstFuss"><span class="tbAstStand">'+stand+'</span></span></button>';
  return '<div class="tbGesamt">'+
    '<section class="tbGesamtKopf"><div><span class="tbKicker">🗺️ DEINE ENTWICKLUNGSWEGE</span><h2>Wohin soll sich dein Hof entwickeln?</h2><p>Jeder Weg stärkt einen anderen Teil des Hofs. Wähle einen Ast, um seine nächsten Schritte zu sehen.</p></div><span class="tbKompass" aria-hidden="true">✦</span></section>'+
    '<section class="tbLandkarte" style="background-image:linear-gradient(rgba(255,247,230,.9),rgba(255,247,230,.96)),url(\''+tbBild('techbaum_raster_v2')+'\')">'+
      '<svg class="tbVerbindungen" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="forschung" d="M50 50 L24 24"/><path class="meister" d="M50 50 L76 24"/><path class="mcp" d="M50 50 L24 76"/><path class="rechenhaus" d="M50 50 L76 76"/></svg><div class="tbHauptaeste">'+
      ast('forschung','🔬','Forschung','Fähigkeiten und Verfahren',fFertig+'/'+fAlle.length+' erforscht '+balken(fFertig,fAlle.length),['✨ Antworten','🗄️ Wissen','🧬 Zucht'],"forschReiterWahl('baum')")+
      ast('meister','⭐','Meisterschaften','Dauerhafte Hofvorteile',sFertig+'/'+sAlle.length+' gemeistert · '+skillPunkteFrei()+' ⭐ frei '+balken(sFertig,sAlle.length),['🪙 Kosten','🎓 Training','🤝 Handel'],"forschReiterWahl('meister')")+
      ast('mcp','🔌','MCP-Werkstatt','Werkzeuge für Agenten',(mOffen?mFertig+'/'+mAlle.length+' angeschlossen':'🔒 ab Hofstufe 3 + Agentenwerkstatt')+' '+balken(mFertig,mAlle.length),['🤖 Aufträge','🗂️ Anschlüsse','🛡️ Sicherheit'],"forschReiterWahl('mcp')")+
      ast('rechenhaus','🏡','Rechenhaus','Leistung und Energie',rechenplaetze+' Rechenplatz'+(rechenplaetze===1?'':'plätze'),['⚡ Tempo','🖥️ Hardware','🌱 Energie'],"zeigeRechenhaus('hardware')")+
      '</div><div class="tbGesamtWurzel"><span class="tbWurzelIcon">🏅</span><span class="tbWurzelText"><b>Hofstufe '+h.i+'</b><small>'+tbEsc(h.aktuell.n)+'</small></span><span class="tbWurzelFortschritt"><small>Nächste Stufe</small>'+balken(h.fort,100)+'</span></div></section></div>';
}

/* — Meisterschaften als Netz: drei Wege als drei Sektoren — */
let skillWahl=null;
function skillWaehlen(id){ skillWahl=id; if(typeof zeigeForschung==="function") zeigeForschung(); }
function skillStatusVon(wegId,sk){
  if(skillAktiv(sk.id)) return "fertig";
  const brauchtOk=!sk.braucht||skillAktiv(sk.braucht), wegOk=!sk.capstone||S.meisterweg===wegId;
  if(!brauchtOk||!wegOk) return "gesperrt";
  return skillPunkteFrei()>=sk.p?"kann":"teuer";
}
function skillRadialHtml(){
  const frei=skillPunkteFrei(), ges=skillPunkteGesamt();
  const farben={betreiber:"#8ec2ec",trainer:"#eb9b2d",haendler:"#5aa348"};
  const zweige=Object.entries(SKILLS).map(([wegId,w])=>({id:wegId,n:w.n+(S.meisterweg===wegId?" · dein Weg":""),z:w.z,farbe:farben[wegId]||"#b57edc",
    knoten:w.skills.map(sk=>({id:sk.id,n:sk.n,kurz:sk.n,z:sk.z,braucht:sk.braucht?[sk.braucht]:[],status:skillStatusVon(wegId,sk)}))}));
  let detail='<div class="karte hell"><p>Einen Knoten antippen: Wirkung, Lehre und der Lern-Knopf erscheinen hier.'+(!S.meisterweg?' Ab Hofstufe 3 wählst du einen Meisterweg – nur dort ist die Meister-Fertigkeit (2⭐) lernbar.':'')+'</p>'+
    (!S.meisterweg?'<div class="reihe abstand">'+Object.entries(SKILLS).map(([wegId,w])=>'<button class="knopf s hell" '+(hofLevel().i>=3?"":"disabled")+' onclick="meisterwegWaehlen(&quot;'+wegId+'&quot;)">'+tbEsc(w.z+" "+w.n)+(hofLevel().i>=3?" wählen":" (ab Stufe 3)")+'</button>').join("")+'</div>':"")+'</div>';
  if(skillWahl){ for(const [wegId,w] of Object.entries(SKILLS)){ const sk=w.skills.find(x=>x.id===skillWahl); if(!sk) continue; const st=skillStatusVon(wegId,sk), kann=st==="kann";
      let sperr=""; if(st==="gesperrt") sperr=(!sk.capstone||S.meisterweg===wegId)?"⬑ braucht: "+tbEsc((skillDef(sk.braucht)||{}).n||sk.braucht):"🔒 nur auf dem Meisterweg "+tbEsc(w.n); else if(st==="teuer") sperr="⭐ "+sk.p+" Punkt(e) nötig, frei: "+frei;
      detail='<div class="karte'+(st==="fertig"?" hell":"")+'"><h3>'+tbEsc(sk.z)+' '+tbEsc(sk.n)+' <span class="merk'+(st==="fertig"?" gut":"")+'">'+(st==="fertig"?"✅ gemeistert":"⭐".repeat(sk.p))+'</span>'+(sk.capstone?' <span class="merk gold">MEISTER</span>':"")+'</h3>'+
        '<p><b>Wirkung:</b> '+tbEsc(sk.eff)+'</p><p>💡 '+tbEsc(sk.lehre)+'</p>'+
        (st==="fertig"?"":'<div class="reihe abstand">'+(sperr?'<span class="baumpfad">'+sperr+'</span>':"")+'<button class="knopf s'+(kann?" gruen":"")+'" '+(kann?"":"disabled")+' onclick="skillKaufen(&quot;'+wegId+'&quot;,&quot;'+tbEsc(sk.id)+'&quot;)">Lernen ('+sk.p+'⭐)</button></div>')+'</div>'; } }
  return '<div class="notiz">⭐ <b>Meisterpunkte: '+frei+' frei / '+ges+' gesamt</b> – genau einer je erreichter Hofstufe. Drei Wege, ein Netz: Grundfertigkeiten sind frei wählbar, die Meister-Fertigkeit nur auf deinem Meisterweg.</div>'+
    tbRadialSvg({titel:"Meisterschaften",bild:"techbaum_radial_v2",klick:"skillWaehlen",wahl:skillWahl,zentrum:{n:"Meisterschaften",kurz:"MEISTER",z:"⭐",status:ges>0?"fertig":"gesperrt"},zweige})+detail;
}

/* — Rechenhaus: Material-Bäume (Hardware und Strom) als Tafel; die Käufe selbst laufen im jeweiligen Bereich — */
let rhBaumWahl=null;
function rhBaumWaehlen(id){ rhBaumWahl=id; if(typeof zeigeRechenhaus==="function") zeigeRechenhaus(rhView); }
function tbPreisSpalte(preis){ return preis<=1500?0:preis<=3500?1:preis<=8000?2:preis<=30000?3:4; }
const TB_PREISSPALTEN=["bis 1.500 €","bis 3.500 €","bis 8.000 €","bis 30.000 €","darüber"];
function rhHardwareBaumHtml(){
  const r=rh(), c=rhCfg(), stufe=r.stufe, kasse=S.kredit, knoten=[];
  const pcFrei=Array.from({length:c.pc},(_,k)=>k).some(k=>!S.buchten.some(b=>b.rhSlot==="pc:"+k));
  Object.entries(RH_PC).forEach(([v,p])=>{ const hat=S.buchten.some(b=>(b.rhSlot||"").startsWith("pc:")&&b.gpu===p.gpu);
    knoten.push({id:"pc:"+v,n:(p.n||("Rechner „"+v+"“"))+" · "+((GPUS[p.gpu]||{}).n||p.gpu),kurz:p.n||((GPUS[p.gpu]||{}).n||v),unter:p.preis+" €",z:p.nurNadel?"🪡":p.unified?"🧠":"🖥️",zeile:"rechner",spalte:tbPreisSpalte(p.preis),braucht:[],
      status:tbStatus(hat,false,c.pc>0,pcFrei&&kasse>=p.preis)}); });
  RH_STUFEN.forEach((st,i)=>{ if(i===0) return; knoten.push({id:"stufe:"+i,n:"Ausbau zum "+st.name,kurz:st.name,unter:st.preis+" €",z:i===1?"🏚️":"🏭",zeile:"ausbau",spalte:tbPreisSpalte(st.preis),braucht:i>1?["stufe:"+(i-1)]:[],
      status:tbStatus(stufe>=i,false,stufe>=i-1,stufe===i-1&&kasse>=st.preis)}); });
  const rackGpus=Object.entries(GPUS).filter(([id,g])=>(g.tier||0)>=2&&!g.nurNadel).sort((a,b)=>(a[1].preis||0)-(b[1].preis||0)).slice(0,8);
  rackGpus.forEach(([id,g])=>{ const hat=S.buchten.some(b=>(b.rhSlot||"").startsWith("rack:")&&b.gpu===id); const preis=Math.round((g.preis||0)*((typeof gpupreisFaktor==="function")?gpupreisFaktor():1))+3500;
    knoten.push({id:"rack:"+id,n:g.n+" im Serverschrank",kurz:g.n,unter:preis+" €",z:"🗄️",zeile:"rack",spalte:tbPreisSpalte(preis),braucht:["stufe:1"],status:tbStatus(hat,false,stufe>=1,stufe>=1&&kasse>=preis)}); });
  const zeilen=[{id:"rechner",n:"Rechner",z:"🖥️"},{id:"ausbau",n:"Ausbau",z:"🏗️"},{id:"rack",n:"Serverschrank",z:"🗄️"}];
  let detail='<div class="karte hell"><p>Ein Feld antippen. Gekauft wird weiterhin im Innenraum (Rechner, Schränke) und im Ausbauplan – die Tafel zeigt, was schon steht, was jetzt geht und was noch verschlossen ist.</p></div>';
  const k=knoten.find(x=>x.id===rhBaumWahl); if(k){ const ziel=k.id.startsWith("stufe:")?"ausbau":"raum";
    detail='<div class="karte'+(k.status==="fertig"?" hell":"")+'"><h3>'+tbEsc(k.z)+' '+tbEsc(k.n)+' <span class="merk'+(k.status==="fertig"?" gut":"")+'">'+(k.status==="fertig"?"✅ vorhanden":tbEsc(k.unter))+'</span></h3>'+
      (k.braucht.length?'<p class="baumpfad">⬑ braucht: '+k.braucht.map(b=>tbEsc((knoten.find(x=>x.id===b)||{}).n||b)).join(" · ")+'</p>':"")+
      '<p>'+(k.id.startsWith("pc:")?"Rechner kaufen im Innenraum: Bucht wählen, Variante wählen. Der Anschluss (kW) muss reichen – die Strom-Leiste im Stall zeigt es.":k.id.startsWith("rack:")?"Serverkarten kommen in den Schrank des Nerdtempels oder Rechenzentrums (Karte zum Marktpreis plus 3.500 € Schrank).":"Der Ausbau vergrößert Dachfläche, Speicher und Schränke – und senkt den Kühlaufwand (PUE).")+'</p>'+
      '<div class="reihe abstand"><button class="knopf s hell" onclick="zeigeRechenhaus(&quot;'+ziel+'&quot;)">→ '+(ziel==="ausbau"?"Zum Ausbauplan":"Zum Innenraum")+'</button></div></div>'; }
  return '<div class="notiz">🖥️ <b>Hardware-Baum.</b> Rechner nach Preisklasse, der Ausbau des Rechenhauses und die Serverkarten für den Schrank. Grün steht schon auf dem Hof, Gold ist jetzt bezahlbar, Schloss heißt: Ausbau oder Kasse fehlt.</div>'+
    tbRasterHtml({titel:"Hardware-Baum",bild:"techbaum_raster_v2",klick:"rhBaumWaehlen",wahl:rhBaumWahl,zeilen,spalten:TB_PREISSPALTEN,knoten})+detail;
}
function rhStromBaumHtml(){
  const r=rh(), c=rhCfg(), kasse=S.kredit, offen=istFrei("gebEnergie"), knoten=[];
  knoten.push({id:"netz",n:"Netzanschluss "+r.netzKW+" kW",kurz:"Netzanschluss",unter:r.netzKW+" kW",z:"🔌",zeile:"netz",spalte:0,braucht:[],status:"fertig"});
  knoten.push({id:"nachbar",n:"Nachbarvertrag +"+RH_STROM.nachbarKW+" kW",kurz:"Nachbarvertrag",unter:RH_STROM.nachbarPreis+" €",z:"🤝",zeile:"netz",spalte:0,braucht:["netz"],status:tbStatus(!!r.nachbar,false,r.stufe===0||!!r.nachbar,r.stufe===0&&kasse>=RH_STROM.nachbarPreis)});
  const pvN=(r.pv||[]).length, pvPreis=c.wp===400?45:60;
  knoten.push({id:"solar",n:"Solarmodule "+pvN+"/"+c.dach+" auf dem Dach",kurz:"Solarmodul",unter:pvPreis+" € je "+c.wp+" Wp",z:"☀️",zeile:"sonne",spalte:0,braucht:["netz"],status:tbStatus(pvN>=c.dach,false,offen,offen&&pvN<c.dach&&kasse>=pvPreis)});
  knoten.push({id:"solarfeld",n:"Freilandfelder "+(r.solarfelder||0)+"/6",kurz:"Freilandfeld",unter:"270 € je 2,4 kWp",z:"🌻",zeile:"sonne",spalte:1,braucht:["solar"],status:tbStatus((r.solarfelder||0)>=6,false,r.stufe===2&&offen,r.stufe===2&&offen&&(r.solarfelder||0)<6&&kasse>=270)});
  knoten.push({id:"akku",n:"Akku "+(r.akku||0)+"/"+c.akku+" kWh",kurz:"Akku",unter:"40 € je kWh",z:"🔋",zeile:"speicher",spalte:0,braucht:["netz"],status:tbStatus((r.akku||0)>=c.akku,false,offen,offen&&(r.akku||0)<c.akku&&kasse>=40)});
  RH_WIND.forEach((w,i)=>{ const hat=(r.wind||[]).includes(i); knoten.push({id:"wind:"+i,n:"Windrad "+["klein","mittel","groß"][i]+" "+w.kw+" kW",kurz:"Windrad "+["klein","mittel","groß"][i],unter:w.preis+" €",z:"🌬️",zeile:"wind",spalte:tbPreisSpalte(w.preis),braucht:i?["wind:"+(i-1)]:["netz"],status:tbStatus(hat,false,offen&&r.stufe>=1,offen&&r.stufe>=1&&kasse>=w.preis)}); });
  RH_GEN.forEach((g,i)=>{ const hat=r.gen>=i; knoten.push({id:"gen:"+i,n:"Kraftwerk "+g.kw+" kW",kurz:"Kraftwerk "+g.kw+" kW",unter:g.preis+" €",z:"🏭",zeile:"kraftwerk",spalte:tbPreisSpalte(g.preis),braucht:i?["gen:"+(i-1)]:["netz"],status:tbStatus(hat,false,offen&&r.stufe>=1,offen&&r.stufe>=1&&r.gen===i-1&&kasse>=g.preis)}); });
  const zeilen=[{id:"netz",n:"Netz",z:"🔌"},{id:"sonne",n:"Sonne",z:"☀️"},{id:"speicher",n:"Speicher",z:"🔋"},{id:"wind",n:"Wind",z:"🌬️"},{id:"kraftwerk",n:"Kraftwerk",z:"🏭"}];
  let detail='<div class="karte hell"><p>'+(offen?"Ein Feld antippen. Gekauft wird im Energiegarten – die Tafel zeigt Stand, Reihenfolge und was der Ausbau des Rechenhauses noch verschließt.":"Der Energiegarten öffnet auf Hofstufe 8 – bis dahin zeigt die Tafel nur den Netzanschluss und den Nachbarvertrag.")+'</p></div>';
  const k=knoten.find(x=>x.id===rhBaumWahl); if(k){ detail='<div class="karte'+(k.status==="fertig"?" hell":"")+'"><h3>'+tbEsc(k.z)+' '+tbEsc(k.n)+' <span class="merk'+(k.status==="fertig"?" gut":"")+'">'+(k.status==="fertig"?"✅ vorhanden":tbEsc(k.unter))+'</span></h3>'+
      (k.braucht.length?'<p class="baumpfad">⬑ braucht: '+k.braucht.map(b=>tbEsc((knoten.find(x=>x.id===b)||{}).n||b)).join(" · ")+'</p>':"")+
      '<p>'+(k.id==="netz"?"Der Netzanschluss trägt die Grundlast; alles Weitere hebt den Eigenbonus und senkt die Rechnung.":k.id==="nachbar"?"Nur im Geräteschuppen: der Nachbar leiht Anschlussleistung gegen Aufschlag.":k.id.startsWith("wind")?"Kleinwind steht in bodennaher Luft und liefert nur einen Bruchteil der Nennleistung – ab Nerdtempel.":k.id.startsWith("gen")?"Kraftwerke helfen bei Netzausfall und teuren Stunden, kosten aber Brennstoff je kWh.":"Jedes Modul senkt die Stromrechnung und hebt den Anschluss-Bonus; Solar liefert nachts nichts, Akku und Wind schon.")+'</p>'+
      '<div class="reihe abstand"><button class="knopf s hell" onclick="zeigeRechenhaus(&quot;energie&quot;)">→ Zum Energiegarten</button></div></div>'; }
  return '<div class="notiz">⚡ <b>Strom-Baum.</b> Vom Netzanschluss über Sonne und Speicher bis zu Wind und Kraftwerk. Was Grün ist, steht; Gold ist jetzt bezahlbar; das Schloss zeigt, dass Hofstufe, Ausbau oder Kasse fehlen.</div>'+
    tbRasterHtml({titel:"Strom-Baum",bild:"techbaum_raster_v2",klick:"rhBaumWaehlen",wahl:rhBaumWahl,zeilen,spalten:TB_PREISSPALTEN,knoten})+detail;
}
if(typeof window!=="undefined"){ Object.assign(window,{TB_FORSCH_ZEILE,TB_FORSCH_ZEILEN,TB_PREISSPALTEN,forschWaehlen,forschVorOk,forschRasterHtml,forschDetailHtml,forschUebersichtHtml,skillWaehlen,skillStatusVon,skillRadialHtml,rhBaumWaehlen,rhHardwareBaumHtml,rhStromBaumHtml,tbPreisSpalte}); }

if(typeof window!=="undefined"){ Object.assign(window,{TB_FARBEN,tbRadialSvg,tbRasterHtml,tbStatus,tbTiefe,tbEsc}); }
