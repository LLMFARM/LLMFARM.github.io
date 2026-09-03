/* Teich: gleiche 1600×900-Koordinaten und xMidYMax slice wie die Wiesen-SVG. */
// Pose-spezifische Anker: Hut und Sattel folgen dem abgesenkten Körper/Kopf.
const RH_TRINK_ANKER={schwein:{s:[40,10,30,-10],k:[79,50]},huhn:{s:[43,40,25,12],k:[87,71]},kuh:{s:[42,8,29,4],k:[87,55]},esel:{s:[42,14,28,5],k:[83,56]},lama:{s:[36,14,28,20],k:[86,64]},dino:{s:[43,22,25,12],k:[81,49]},hund:{s:[43,20,29,-5],k:[83,44]},katze:{s:[43,24,27,-5],k:[84,42]}};
Object.entries(RH_TRINK_ANKER).forEach(([art,a])=>{const m=TIER_POSEN[art];m.trink='pose_'+art+'_trink';m.r.trink=1.5;m.anker.trink={kx:a.k[0],ky:a.k[1],kw:12};m.roh.trink={sat:{x:a.s[0]-a.s[2]/2,y:a.s[1]-8,w:a.s[2],rot:a.s[3]},kro:{x:a.k[0]-6,y:a.k[1]-10,w:12,rot:18}};});
function rhTeichGeometrie(w,h){const sc=Math.max(w/1600,h/900),ox=(w-1600*sc)/2,oy=h-900*sc;return {x:(ox+950*sc)/w*100,y:(oy+712*sc)/h*100,rx:142*sc/w*100,ry:44*sc/h*100};}
function rhImTeich(x,y,g){return Math.pow((x-g.x)/g.rx,2)+Math.pow((y-g.y)/g.ry,2)<1;}
function rhAussenPunkt(x,y,g){let dx=(x-g.x)/g.rx,dy=(y-g.y)/g.ry;if(Math.hypot(dx,dy)<1e-9)dy=-1;const d=Math.hypot(dx,dy);return {x:g.x+dx/d*g.rx*1.015,y:g.y+dy/d*g.ry*1.015};}
function rhKollisionsSchritt(x,y,nx,ny,g){
 // Segmentprüfung verhindert Durchtunneln; Projektion rettet alte Positionen im Teich.
 if(rhImTeich(x,y,g)){const q=rhAussenPunkt(x,y,g);x=q.x;y=q.y;}
 const steps=Math.max(1,Math.ceil(Math.hypot((nx-x)/g.rx,(ny-y)/g.ry)*8));
 for(let i=1;i<=steps;i++){const f=i/steps;if(rhImTeich(x+(nx-x)*f,y+(ny-y)*f,g))return {x,y,hit:true};}
 return {x:nx,y:ny,hit:false};
}
let rhFrameZeit=0,rhTeichBox=null,rhBoxW=0,rhBoxH=0;
function rhTeichBoxLesen(){const e=document.getElementById('welt');const w=e.clientWidth||1600,h=e.clientHeight||900;if(!rhTeichBox||w!==rhBoxW||h!==rhBoxH){rhBoxW=w;rhBoxH=h;rhTeichBox=rhTeichGeometrie(w,h);}return rhTeichBox;}
function rhSessionLeeren(p){
 if(!p||p.status!=='frei')return false;
 p.sitzung=p.sitzung||{tokens:0,notizen:[],wechsel:0};
 const vorher=p.sitzung.tokens||0;p.sitzung.tokens=0;p.sitzung.wechsel=(p.sitzung.wechsel||0)+1;
 p.ctxLastTage=0;
 // Nur diagnostizierter Kontextballast endet. Gewichts-/Datenkrankheiten bleiben.
 if(p.krank==='kontextrot'){p.krank=null;p.ruheTage=0;}
 p.historie=p.historie||[];p.historie.push({tag:S.tag,n:'Trinkpause',ausgang:'Neue Sitzung: '+rhN(vorher,0)+' Kontext-Token verworfen; Gewichte, Adapter, Notizen unverändert.',delta:{}});
 p.letzteTrinkpause={tag:S.tag,verworfen:vorher};return true;
}
function rhTrinkenStart(uid){const p=S.tiere.find(t=>t.uid===uid);if(!p)return;
 if(p.api){melde('Wolkentiere bleiben beim Anbieter. Ihre Sitzungen lassen sich hier separat neu beginnen.');return;}
 if(p.status!=='frei'){melde('Erst den laufenden Einsatz beenden; sein Arbeitskontext wird nicht gelöscht.','schlecht');return;}
 if(p._trink){blattZu();return;}p._durst=0;p._liegt=0;p._lz=2000;blattZu();}
function rhTrinkFrame(p,dt,offen,g){
 if(p.api)return false;
 if(p.status!=='frei'){p._trink=null;p.el.classList.remove('trinkt');return false;}
 if(offen)return !!p._trink;
 if(p._durst==null)p._durst=25+rhSeed(S.zaehler+p.uid.length,Math.random()*100)*75;
 p._durst-=dt;
 if(!p._trink&&p._durst<=0){
   // Nur zwei Uferplätze gleichzeitig. Die Wartezeit erzeugt kein Speicherrisiko.
   const used=S.tiere.filter(t=>t!==p&&t._trink).map(t=>t._trink.seite);
   let seite=p.x<g.x?-1:1;if(used.includes(seite))seite=-seite;
   if(used.includes(seite)){p._durst=4;return false;}
   p._trink={phase:'hin',seite,t:0};p._liegt=0;figurPose(p);
 }
 const d=p._trink;if(!d)return false;
 // Mündung am linken/rechten Ufer, Tierfüße bleiben außerhalb der Wasserellipse.
 const basis=kl(.5+Math.sqrt(Math.min(p.pT,900))/16,.48,1.5),scale=basis*(.72+(g.y+.8-54)/36*.5);
 const breite=150*(52+grKlasse(p.pT)*9)/100*scale;
 const rand=Math.max(.4,(breite*.43-10*Math.max(rhBoxW/1600,rhBoxH/900))/rhBoxW*100);
 const target={x:g.x+d.seite*(g.rx+rand),y:g.y+.8};
 if(target.x<5||target.x>95||target.y<53||target.y>91){p._trink=null;p._durst=20;return false;}
 if(d.phase==='hin'){
   const dx=target.x-p.x,dy=target.y-p.y,dist=Math.hypot(dx,dy);
   if(dist<.35){p.x=target.x;p.y=target.y;p.vx=-d.seite*.05;d.phase='trink';d.t=0;figurPose(p);}
   else{
     let ux=dx/dist,uy=dy/dist;
     const speed=4.2*dt;
     let q=rhKollisionsSchritt(p.x,p.y,p.x+ux*speed,p.y+uy*speed,g);
     if(!q.hit&&typeof hindernisListe==='function'){for(const gh of hindernisListe()){const q2=rhKollisionsSchritt(p.x,p.y,q.x,q.y,gh);if(q2.hit){q=q2;break;}}}   /* Ära 8: nicht durch Haus/Windrad zum Teich */
     if(q.hit){
       // Um die obere/untere Uferkante gehen, statt in der Ellipse stecken zu bleiben.
       const lower=p.y>=g.y,way={x:g.x+d.seite*(g.rx+3),y:g.y+(lower?1:-1)*(g.ry+3)};
       const ax=way.x-p.x,ay=way.y-p.y,ad=Math.hypot(ax,ay)||1;
       q=rhKollisionsSchritt(p.x,p.y,p.x+ax/ad*speed,p.y+ay/ad*speed,g);
       if(q.hit)q={x:p.x,y:kl(p.y+(lower?1:-1)*speed,54,90)};
     }
     p.vx=(q.x-p.x)<0?-.05:.05;p.x=q.x;p.y=q.y;
   }
 }else{
   p.x=target.x;p.y=target.y;
   d.t+=dt;p.vx=-d.seite*.05;
   if(d.t>=4.5){rhSessionLeeren(p);p._trink=null;p._durst=65+Math.random()*100;p.vx=d.seite*.06;p._lz=1200;sichern();}
 }
 p.el.classList.toggle('trinkt',!!p._trink&&p._trink.phase==='trink');
 p.el.classList.toggle('rhTrinkFallback',!posenVon(tierArt())||!(posenVon(tierArt())||{}).trink);
 return true;
}
function rhWiesenSchritt(p,nx,ny,g){
 const q=rhKollisionsSchritt(p.x,p.y,nx,ny,g);p.x=q.x;p.y=q.y;
 if(q.hit){p.vx=-p.vx;p.vy=(p.y<g.y?-1:1)*Math.max(.018,Math.abs(p.vy));}
}
function rhTeichInfo(){
 const art=tierArt(),r=typeof TIER_POSEN!=='undefined'?TIER_POSEN[art]:null;
 return '<div class="karte hell"><h3>Ein Schluck. Eine neue Sitzung.</h3><p>Freie Tiere gehen in unregelmäßigen Abständen ans Ufer. Beim Trinken wird nur der <b>flüchtige Gesprächskontext</b> verworfen. Das kann Kontextballast lösen; Fähigkeiten, Modellgewichte, Adapter und dauerhafte Notizen bleiben genau gleich.</p><p>Der Preis: Inhalte aus der alten Unterhaltung sind in der neuen Sitzung nicht mehr verfügbar. Wichtige Informationen müssen erneut in den Prompt oder aus gespeicherten Notizen abgerufen werden. Ein Agenten-Tool mit Gedächtnisfunktion ist deshalb etwas anderes als ein größeres Kontextfenster.</p><p>Im Spiel sind die Sitzungstoken ein didaktischer Zähler aus Aufträgen, keine echten Modellaufrufe. Das konfigurierte KV-Cache-Budget bleibt reserviert: Eine leere Sitzung macht die GPU nicht automatisch größer.</p></div>'+ 
 (r&&ASSETS[r.trink]?'<div class="rhTeichTiere"><div><img src="'+ASSETS[r.trink]+'" alt="Trinkpose nach rechts"><b>Linkes Ufer →</b></div><div><img class="links" src="'+ASSETS[r.trink]+'" alt="Trinkpose nach links"><b>← Rechtes Ufer</b></div></div>':'<p>Eigene Kreaturen und Zeichnungen verwenden eine sanfte Schluckbewegung als Ersatzpose.</p>')+
 '<div class="karte"><h3>Wen schicken wir zum Teich?</h3>'+S.tiere.filter(p=>!p.api).map(p=>'<div class="rhAngebot"><b>'+esc(p.name)+'</b><span>Sitzung: '+rhN((p.sitzung||{}).tokens,0)+' Token · '+((p.sitzung||{}).wechsel||0)+' Neustarts · '+(p.status==='frei'?'bereit':esc(p.status))+'</span>'+rhBtn('Trinken & Sitzung neu beginnen',"rhTrinkenStart('"+p.uid+"')",p.status!=='frei')+'</div>').join('')+'<p>Es wird niemals mitten in einem Auftrag getrunken. Die Animation verändert weder die Modellparameter noch das Wissen des Modells.</p></div>';
}
