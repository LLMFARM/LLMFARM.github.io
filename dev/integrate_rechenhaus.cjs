// Einmalige, geprüfte Integration in das v6-Template. Nie alte Datei zurückkopieren.
const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'modellhof_template.html');let s=fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');
if(s.includes('/*===RECHENHAUS===*/'))throw Error('Bereits integriert');
fs.copyFileSync(p,path.join(__dirname,'modellhof_template.vor_rechenhaus.html.bak'));
function rep(a,b){if(!s.includes(a))throw Error('Fehlender Anker: '+a.slice(0,90));s=s.replace(a,b);}
function body(name,next,code){const a=s.indexOf('function '+name+'('),b=s.indexOf(next,a+1);if(a<0||b<0)throw Error(name);s=s.slice(0,a)+code+'\n\n'+s.slice(b);}
rep('</style>','/*===RECHENHAUS:CSS===*/\n</style>');
rep('/*===ASSETS===*/','/*===ASSETS===*/\n/*===RECHENHAUS:ASSETS===*/');
rep('/* Fenster-Exporte für onclick */','/*===RECHENHAUS===*/\n/*===TEICH===*/\n\n/* Fenster-Exporte für onclick */');
rep('gpu:"rtx3060", miete:false, tier:null','gpu:"rtx4080", cpu:"Ryzen 7", ramGB:32, ssdTB:2, rhSlot:"pc:0", miete:false, tier:null');
rep('agentenWelt:null, ramGB:64, synthChargen:[], modus:"lern"','agentenWelt:null, ramGB:32, synthChargen:[], modus:"lern", rechenhaus:rhNeu()');
rep('  return o;\n}', '  rhMigration(o);\n  return o;\n}'); // normalize CRLF below instead if needed
rep('"_tagFaellig"]','"_tagFaellig","_trink","_durst"]');
rep('betrag=Math.round(endlich(betrag,0));','betrag=Math.round(endlich(betrag,0)*100)/100;');
rep('S.kredit=endlich(S.kredit,0)+betrag;','S.kredit=Math.round((endlich(S.kredit,0)+betrag)*100)/100;');
rep('S=alt||frischerStand();','S=alt||frischerStand();\n  rhMigration(S);');
rep('function alles(){ kopfNeu(); dockNeu(); zieleNeu(); wieseNeu(); tickerNeu(); }','function alles(){ kopfNeu(); dockNeu(); zieleNeu(); wieseNeu(); tickerNeu(); rhAussenNeu(); }');
rep('const GEBAEUDE=[','const GEBAEUDE=[\n  {id:"rechenhaus",n:"Rechenhaus",bild:"rh_schuppen",frei:()=>true},');
rep('{n:"Hof",geb:["stall","futter","werkstatt"]}','{n:"Hof",geb:["rechenhaus","stall","futter","werkstatt"]}');
rep('{id:"energie",n:"Energie",bild:"energie",frei:()=>istFrei("gebEnergie")}','{id:"energie",n:"Energie",bild:"energie",frei:()=>true}');
rep('const f={stall:zeigeStall','const f={rechenhaus:()=>zeigeRechenhaus(),stall:zeigeStall');
rep('const bericht={zeilen:[],einnahmen:0,ausgaben:0,kwh:0};','const bericht={zeilen:[],einnahmen:0,ausgaben:0,kwh:0};\n  const rechenTag=rhTagesStart(),rechenPause=rechenTag.fehl>0.001;');
rep('if(p.status==="job"){\n      const j=S.jobs.find(x=>x.id===p.job); if(!j) return;', 'if(p.status==="job"){\n      if(rechenPause&&!p.api)return;\n      const j=S.jobs.find(x=>x.id===p.job); if(!j) return;');
rep('  /* ══ 1) Jobs/Training/Zucht auflösen ══ */\n  S.tiere.forEach(p=>{','  /* ══ 1) Jobs/Training/Zucht auflösen ══ */\n  S.tiere.forEach(p=>{\n    if(rechenPause&&!p.api&&["job","training","zucht"].includes(p.status))return;');
rep('      p.rest--;\n      /* Hermes-Schicht','      p.sitzung=p.sitzung||{tokens:0,notizen:[],wechsel:0};\n      p.sitzung.tokens=Math.min((p.ctx||32)*1000,p.sitzung.tokens+Math.max(1000,(j.ctxMin||2)*1000));\n      p.rest--;\n      /* Hermes-Schicht');
rep('kwh+=agentenWeltTag(bericht);','kwh+=rechenPause?0:agentenWeltTag(bericht);');
const enA=s.indexOf('  /* Solar ist ERZEUGUNG'),enB=s.indexOf('  /* Kreditzins & Bank-Bremse */',enA);
if(enA<0||enB<0)throw Error('Energieanker');
s=s.slice(0,enA)+'  rhTagBuchen(rechenTag,bericht);\n  const pacht=20+hofLevel().i*10;\n  buche(-pacht,"pacht","Pacht & Grundanschluss"); bericht.ausgaben+=pacht;\n'+s.slice(enB);
body('zeigeEnergie','function zeigeHof(',`function zeigeEnergie(){zeigeRechenhaus('energie');}\nfunction solarKaufen(){rhKauf('solar');}`);
body('gpuKaufen','function zeigeCloud(',`function gpuKaufen(id,miete){\n  if(miete)melde('Neue lokale Hardware wird als vollständiger Rechner im Rechenhaus installiert. Bestehende Mietgeräte bleiben erhalten.');\n  const kind=(GPUS[id]||{}).tier>=2?'rack':'pc';\n  const c=rhCfg(),n=kind==='pc'?c.pc:c.racks;\n  let i=0;for(;i<n;i++)if(kind==='pc'?!S.buchten.some(b=>b.rhSlot==='pc:'+i):!rh().racks.includes(i))break;\n  rhSelected=i<n?{kind,i}:null;zeigeRechenhaus('raum');\n}`);
// RAM gehört zum konkreten Rechner, nicht zu einer magischen hofweiten Speicherbank.
rep('function ramFrei(ausser){','function ramFrei(ausser,ziel){\n  const lokal=ziel||buchtVon(ausser);\n  if(lokal&&lokal.ramGB)return Math.max(0,lokal.ramGB-8);');
rep('const ramOk=passt||ueber<=ramFrei(p);','const ramOk=(passt||ueber<=ramFrei(p,b))&&teile.gewichte<=(b.ssdTB||4)*1000;');
// Nur innerhalb der beiden Auswahl-/Zuweisungsfunktionen ersetzen.
const ba=s.indexOf('function buchtFuellen('),bb=s.indexOf('function ausBucht(',ba);
let bs=s.slice(ba,bb).replaceAll('ramFrei(p)','ramFrei(p,b)').replaceAll('Hof-RAM','Rechner-RAM').replace('(S.ramGB||64)','(b.ramGB||64)');
bs=bs.replace('if(!p||!b||b.tier) return;','if(!p||!b||b.tier||p.status!=="frei") return;\n  if(vramTeile(p).gewichte>(b.ssdTB||4)*1000){melde("Die Modelldatei passt nicht auf die NVMe dieses Rechners.","schlecht");return;}');
s=s.slice(0,ba)+bs+s.slice(bb);
// Aufgefrischte Figuren bekommen einen vierten Frame; alte Sets bleiben gültig.
rep('lieg:ASSETS[m.lieg]||null,','lieg:ASSETS[m.lieg]||null,trink:ASSETS[m.trink]||null,');
rep('["steh","lauf","lieg"].forEach(p=>','["steh","lauf","lieg","trink"].forEach(p=>');
rep('(q.lieg?frame("lieg",q.lieg):"")+','(q.lieg?frame("lieg",q.lieg):"")+\n    (q.trink?frame("trink",q.trink):"")+');
rep('function lauf(){','function lauf(zeit=performance.now()){\n  const dt=Math.min(.05,Math.max(0,(zeit-(rhFrameZeit||zeit))/1000));rhFrameZeit=zeit;const teichG=rhTeichBoxLesen();');
rep('const ruht=p.status!=="frei"||offen;','const trinkAktiv=rhTrinkFrame(p,dt,offen,teichG);\n    const ruht=p.status!=="frei"||offen||trinkAktiv;');
rep('p.x+=p.vx*s; p.y+=p.vy*s*.4;','rhWiesenSchritt(p,p.x+p.vx*s*dt*60,p.y+p.vy*s*.4*dt*60,teichG);');
rep('if(Math.random()<.003){ p.vx=','if(Math.random()<.003*dt*60){ p.vx=');
rep('const opt=liegt?{liegt:true}:{};','const opt=liegt?{liegt:true}:{};\n  if(p._trink&&p._trink.phase==="trink")opt.trinkt=true;');
rep('if(p.api){ p.y=kl(p.y,56,70); }','if(p.api){ p.y=kl(p.y,56,70); }\n    else if(rhImTeich(p.x,p.y,teichG)){const q=rhAussenPunkt(p.x,p.y,teichG);p.x=q.x;p.y=q.y;}');
rep('Object.assign(window,{oeffne,','Object.assign(window,{zeigeRechenhaus,rhWaehle,rhKauf,rhUpgrade,rhEvent,rhInstall,rhPCUpgrade,rhLagern,rhModus,rhServerAusLager,rhTrinkenStart,oeffne,');
rep('(12 GB Grafikspeicher = eine leere Tierbucht)','(16 GB Grafikspeicher; Ryzen 7, 32 GB DDR5, 2 TB NVMe im Geräteschuppen)');
rep('Alle Zahlen folgen der echten KI-Welt (Stand August 2026).','Technische Grundprinzipien folgen der KI-Praxis; Preise, Erträge und viele Leistungswerte sind gekennzeichnete Spielannahmen (Stand August 2026).');
rep('Jede Bucht ist eine <b>GPU</b>.','Jede Bucht ist eine <b>GPU in einem konkreten Rechner im Rechenhaus</b>. RAM gehört diesem Rechner; mehrere GPUs ergeben nicht automatisch gemeinsamen Speicher.');
rep('🛒 GPU kaufen oder mieten','🏡 Hardwareplatz im Rechenhaus wählen');
fs.writeFileSync(p,s);
console.log('Template-Hooks integriert.');
