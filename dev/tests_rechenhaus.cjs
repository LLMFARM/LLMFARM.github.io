const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../modellhof_game.html'),'utf8');
let script=html.match(/<script>([\s\S]*?)<\/script>/)[1].split('/* Boot-Sequenz */')[0];
/* Ära 7.5: Mit RH_DEV=1 werden die Tests gegen dev/rechenhaus.js statt gegen den in
   modellhof_game.html eingebauten Rechenhaus-Block gefahren – nötig, solange die Einzeldatei
   nicht neu gebaut werden darf (assemble.ps1 läuft parallel in einer anderen Session).
   Die Grenzen sind exakt die Marker-Reihenfolge von assemble.ps1: der Rechenhaus-Block beginnt
   mit dem Dateikopf "/* Rechenhaus v1" und endet unmittelbar vor dem Teich-Kopf "/* Teich:".
   Ausgetauscht wird per reiner String-Ersetzung, ohne die übrige Datei anzufassen. */
if(process.env.RH_DEV){
 const von=script.indexOf('/* Rechenhaus v1'),bis=script.indexOf('/* Teich:');
 if(von<0||bis<0||bis<von)throw new Error('RH_DEV: Rechenhaus-Block in modellhof_game.html nicht gefunden');
 script=script.slice(0,von)+fs.readFileSync(path.join(__dirname,'rechenhaus.js'),'utf8')+'\n\n'+script.slice(bis);
 console.log('RH_DEV: dev/rechenhaus.js eingesetzt ('+(bis-von)+' → '+fs.statSync(path.join(__dirname,'rechenhaus.js')).size+' Zeichen)\n');
}
const el=()=>({innerHTML:'',style:{setProperty(){}},classList:{contains:()=>false,add(){},remove(){},toggle(){}},dataset:{},addEventListener(){},querySelector:()=>el(),querySelectorAll:()=>[],appendChild(){},remove(){},before(){},clientWidth:1280,clientHeight:600});
const c={console,Math,JSON,Date,Object,Array,Number,String,Boolean,RegExp,Map,Set,parseInt,parseFloat,isNaN,
 setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame(){},performance:{now:()=>1},
 document:{getElementById:()=>el(),createElement:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},head:{appendChild(){}},visibilityState:'visible'},window:{},localStorage:{getItem:()=>null,setItem(){},removeItem(){}},confirm:()=>true,prompt:()=>null,alert(){},navigator:{},location:{reload(){}},URL:{},Blob:function(){},Image:function(){}};
vm.createContext(c);vm.runInContext(script,c,{timeout:30000});
/* Ära 7.5: RH_SAISON_PV/RH_ALTWERT/RH_PC_GPUS stammen aus dev/rechenhaus.js. Fehlen sie, ist die
   Einzeldatei noch nicht neu gebaut – dann mit RH_DEV=1 gegen die Quelldatei prüfen. */
try{vm.runInContext(`Object.assign(globalThis,{RH_STUFEN,RH_EVS,RH_WIND,RH_GEN,RH_PC,RH_PC_GPUS,RH_SAISON_PV,RH_ALTWERT,GPUS,TIER_POSEN,MODELLE});globalThis.frisch=()=>{S=frischerStand();return S};globalThis.getS=()=>S;`,c);}catch(e){console.error(['','Abbruch: '+e.message,'Die gebaute modellhof_game.html ist aelter als dev/rechenhaus.js.','Entweder dev/assemble.ps1 laufen lassen oder die Tests gegen die Quelldatei starten:','  RH_DEV=1 node dev/tests_rechenhaus.cjs',''].join(String.fromCharCode(10)));process.exit(1);}
['melde','alles','sichern','rhRefresh','zeigeRechenhaus','zeigeStall','zeigeBericht','schilderNeu','questPruefe','questHook','kopfNeu','wieseNeu','tickerNeu','uhrAnzeige','blattZu','figurPose'].forEach(k=>c[k]=()=>{});
let pass=0,fail=0,s;const reset=()=>{s=c.frisch();s.kredit=10000000;s.xp=2700;return s;},eq=(a,b)=>assert.equal(a,b),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);
function test(n,fn){try{reset();fn();pass++;console.log('PASS '+n);}catch(e){fail++;console.log('FAIL '+n+' — '+e.message);}}
function pc(n){for(let i=1;i<n;i++)c.rhInstall('pc',i);}
function toNerd(){c.rhUpgrade();}
function nerdEvents(){c.rhEvent(0);c.rhKauf('wind',0);c.rhEvent(1);c.rhKauf('akku');c.rhEvent(2);}
/* Ära 7 (Haupt-Session): Start-PC auf RTX 4090 24GB aufgestockt – mehr Spielraum ab Tag 1. */
test('Start-PC exakt gemäß Auftrag',()=>{const b=s.buchten[0];eq(b.gpu,'rtx4090');eq(b.ramGB,32);eq(b.ssdTB,2);eq(b.cpu,'Ryzen 7');eq(s.buchten.length,1);});
test('PC 1–6 brauchen keine Zusatzinfrastruktur',()=>{pc(6);eq(s.buchten.length,6);eq(c.rh().nachbar,false);});
test('PC 7 ohne Nachbar atomar gesperrt',()=>{pc(6);const cash=s.kredit;c.rhInstall('pc',6);eq(s.buchten.length,6);eq(s.kredit,cash);});
test('Nachbar schaltet PC 7–9 frei',()=>{pc(6);c.rhKauf('nachbar');for(let i=6;i<9;i++)c.rhInstall('pc',i);eq(s.buchten.length,9);eq(c.rh().netzKW,12);});
test('PC 10 braucht Panel, PC 13 bleibt unmöglich',()=>{c.rhKauf('nachbar');pc(10);eq(s.buchten.length,9);c.rhKauf('solar');for(let i=9;i<13;i++)c.rhInstall('pc',i);eq(s.buchten.length,12);});
test('Slotnummer überspringt keine Strombedingung',()=>{const cash=s.kredit;c.rhInstall('pc',11);eq(s.buchten.length,1);eq(s.kredit,cash);});
test('Kein Hardwarekauf auf Kredit',()=>{s.kredit=2000;c.rhInstall('pc',1);eq(s.buchten.length,1);eq(s.kredit,2000);});
test('Offene Nachbarrechnung reserviert Bargeld',()=>{s.kredit=2200;c.rh().nachbarOffen=200;c.rhInstall('pc',1);eq(s.buchten.length,1);});
test('Gleicher Platz nicht doppelt kaufbar',()=>{c.rhInstall('pc',1);const cash=s.kredit;c.rhInstall('pc',1);eq(s.buchten.length,2);eq(s.kredit,cash);});
test('Maximal-PC exakt; Upgrade behält Geräte-ID',()=>{c.rhPCUpgrade('b1');const b=s.buchten[0];eq(b.gpu,'rtx5090');eq(b.ramGB,64);eq(b.ssdTB,4);eq(b.cpu,'Ryzen 9');eq(b.id,'b1');});
test('4 Dachplätze à 400 W im Schuppen',()=>{for(let i=0;i<5;i++)c.rhKauf('solar');eq(c.rh().pv.length,4);near(c.rhPV(c.rh()),1.6);});
test('Schuppen-Akku maximal 10 kWh und leer gekauft',()=>{for(let i=0;i<3;i++)c.rhKauf('akku');eq(c.rh().akku,10);eq(c.rh().soc,0);});
test('Wind und Kraftwerk im Schuppen verboten',()=>{c.rhKauf('wind',2);c.rhKauf('generator',4);eq(c.rh().wind.length,0);eq(c.rh().gen,-1);});
test('Umbau lagert PCs 7–12 ohne Verlust ein',()=>{c.rhKauf('nachbar');c.rhKauf('solar');pc(12);c.rhUpgrade();eq(c.rh().stufe,1);eq(s.buchten.length,6);eq(c.rh().lager.length,6);eq(c.rh().pv[0],400);});
test('Belegter Umzugs-PC blockiert Umbau ohne Abbuchung',()=>{c.rhKauf('nachbar');pc(7);s.buchten[6].tier='besetzt';const cash=s.kredit;c.rhUpgrade();eq(c.rh().stufe,0);eq(s.kredit,cash);});
test('Nerd: exakt sechs PCs, acht Schrankplätze',()=>{toNerd();pc(7);eq(s.buchten.length,6);eq(c.RH_STUFEN[1].racks,8);});
test('Nerd: erster Schrank benötigt Ereignis 1',()=>{toNerd();c.rhInstall('rack',0);eq(c.rh().racks.length,0);c.rhEvent(0);c.rhInstall('rack',0);eq(c.rh().racks.length,1);eq(s.buchten.length,1);});
test('Nerd: Ereignis 2 verlangt Eigenerzeugung',()=>{toNerd();c.rhEvent(0);c.rhEvent(1);eq(!!c.rh().events['1:1'],false);c.rhKauf('wind',0);c.rhEvent(1);eq(c.rh().events['1:1'],true);});
test('Nerd: vollständiges 600-W-Solardach ist Alternative',()=>{toNerd();c.rhEvent(0);for(let i=0;i<6;i++)c.rhKauf('solar');c.rhEvent(1);eq(c.rh().events['1:1'],true);near(c.rhPV(c.rh()),3.6);});
test('Nerd: Ereignis 3 verlangt Speicher oder Kraftwerk',()=>{toNerd();c.rhEvent(0);c.rhKauf('wind');c.rhEvent(1);c.rhEvent(2);eq(!!c.rh().events['1:2'],false);c.rhKauf('akku');c.rhEvent(2);eq(c.rh().events['1:2'],true);});
test('Fossiler Alternativpfad schaltet Nerd frei',()=>{toNerd();c.rhEvent(0);c.rhKauf('generator',1);c.rhEvent(1);c.rhEvent(2);eq(c.rh().events['1:2'],true);});
test('400-W-Panels bleiben erhalten, bezahltes Upgrade',()=>{c.rhKauf('solar');toNerd();eq(c.rh().pv[0],400);const cash=s.kredit;c.rhKauf('panelUpgrade',0);eq(c.rh().pv[0],600);eq(cash-s.kredit,22);});
test('Nerd-Speicher maximal 80 kWh',()=>{toNerd();for(let i=0;i<5;i++)c.rhKauf('akku');eq(c.rh().akku,80);});
test('Vier getrennte Knoten je Schrank, kein fünfter',()=>{toNerd();nerdEvents();c.rhInstall('rack',0);for(let i=0;i<5;i++)c.rhInstall('rack',0,'a100',i);eq(s.buchten.filter(b=>b.rhSlot.startsWith('rack:')).length,4);});
test('Leerer Schrank hat keine erfundene GPU-Leistung',()=>{toNerd();nerdEvents();const peak=c.rhLast();c.rhInstall('rack',0);near(c.rhLast(),peak);});
test('Rechenzentrum lagert PCs ein und behält Racks',()=>{toNerd();nerdEvents();c.rhInstall('rack',0);c.rhUpgrade();eq(c.rh().stufe,2);eq(s.buchten.length,0);eq(c.rh().lager.length,1);eq(c.rh().racks.length,1);});
test('Rack 9 im Zentrum braucht Transformator',()=>{toNerd();c.rhUpgrade();c.rhInstall('rack',8);eq(c.rh().racks.length,0);c.rhEvent(0);c.rhInstall('rack',8);eq(c.rh().racks.length,1);});
test('Rack 25: zwei große Windräder oder 240 kW',()=>{toNerd();c.rhUpgrade();c.rhEvent(0);c.rhEvent(1);eq(!!c.rh().events['2:1'],false);c.rhKauf('wind',2);c.rhKauf('wind',2);c.rhEvent(1);eq(c.rh().events['2:1'],true);});
test('Endausbau erneuerbar: sechs große Windräder + Solar + Akku',()=>{toNerd();c.rhUpgrade();c.rhEvent(0);for(let i=0;i<6;i++)c.rhKauf('wind',2);c.rhEvent(1);c.rhEvent(2);eq(!!c.rh().events['2:2'],false);for(let i=0;i<10;i++)c.rhKauf('solar');for(let i=0;i<3;i++)c.rhKauf('solarfeld');c.rhKauf('akku');c.rhKauf('akku');c.rhEvent(2);eq(c.rh().events['2:2'],true);eq(c.rh().netzKW,600);});
test('Endausbau fossil und harte Grenze 64 Schränke',()=>{toNerd();c.rhUpgrade();c.rhEvent(0);c.rhKauf('generator',4);c.rhEvent(1);c.rhEvent(2);for(let i=0;i<65;i++)c.rhInstall('rack',i);eq(c.rh().racks.length,64);});
test('Bestands-Rack nach 8 Käufen weiter bestückbar',()=>{toNerd();nerdEvents();for(let i=0;i<8;i++)c.rhInstall('rack',i);c.rhUpgrade();c.rhInstall('rack',0,'a100',0);eq(s.buchten.length,1);});
test('Leistung verhindert Einbau trotz Geld',()=>{toNerd();c.rhEvent(0);c.rhInstall('rack',0);c.rh().netzKW=.1;const cash=s.kredit;c.rhInstall('rack',0,'h100',0);eq(s.kredit,cash);eq(s.buchten.length,1);});
test('RAM ist Rechner-lokal; keine Fern-RAM-Magie',()=>{const b=s.buchten[0];eq(c.ramFrei(null,b),24);s.ramGB=99999;eq(c.ramFrei(null,b),24);});
test('Migration erhält aktive Altgeräte und Solarleistung',()=>{delete s.rechenhaus;s.solar=3;s.buchten=[{id:'alt',gpu:'h100',tier:'t99',miete:true}];c.rhMigration(s);eq(s.buchten[0].tier,'t99');eq(s.buchten[0].miete,true);eq(c.rh().legacySolar,12);eq(s.solar,0);eq(s.buchten[0].rhSlot,'bestand:0');});
test('Lade-Migration wird nicht durch Defaults übersprungen',()=>{delete s.rechenhaus;s.solar=2;s.buchten[0].gpu='rtx3060';c.standAuffuellen(s);eq(c.rh().legacySolar,8);eq(s.buchten[0].rhSlot,'bestand:0');});
test('Migration ist idempotent',()=>{c.rhMigration(s);const snap=JSON.stringify(s);c.rhMigration(s);eq(JSON.stringify(s),snap);});
/* Ära 7.5 (R-16): Basisertrag 3,2 -> 2,9 kWh/kWp je Normtag (DE-Mittel ~1.050 kWh/kWp·a). */
test('400-W-Panel erzeugt im Normtag 1,16 kWh',()=>{const r=c.rh();r.pv=[400];const a=c.rhSim(r,Array(24).fill(0),1,.3,{normal:true});near(a.pv,1.16);eq(a.stunden[0].pv,0);});
test('Akku ersetzt keine Erzeugung',()=>{const r=c.rh();r.akku=10;r.soc=0;const a=c.rhSim(r,Array(24).fill(1),1,.3,{normal:true});near(a.entladung,0);near(a.netz,24);});
test('Akku-Verlust und Leistungsgrenze',()=>{const r=c.rh();r.akku=10;r.soc=10;r.netzKW=100;const a=c.rhSim(r,[20,...Array(23).fill(0)],1,.3,{normal:true});near(a.entladung,5);near(a.soc,10-5/Math.sqrt(.9));});
test('Stundenbilanz erhält Energie',()=>{const r=c.rh();Object.assign(r,{akku:10,soc:3,pv:[600,600,600],wind:[0]});const a=c.rhSim(r,Array.from({length:24},(_,h)=>h<6?3:.2),13,.3);near(a.pv+a.wind+a.netz+a.nachbar+a.fossil+a.socStart,a.last-a.fehl+a.export+a.soc+a.verlust);assert.ok(a.soc>=0&&a.soc<=10);});
test('Vorschau und Amortisation verändern keinen Spielstand',()=>{c.rhKauf('akku');c.rhKauf('solar');const snap=JSON.stringify(s);c.rhVorschau();c.rhAmort(c.rh(),{...c.rh(),wind:[0]},7500);eq(JSON.stringify(s),snap);});
test('Nachbaraufschlag exakt 10 %',()=>{const r=c.rh();r.nachbar=true;r.netzKW=12;const a=c.rhSim(r,Array(24).fill(2),1,.3,{normal:true,nachbarAnteil:.25});near(a.nachbar,12);near(a.nachbarKosten,3.96);near(a.netzKosten,10.8);});
test('Nachbar monatlich, nicht doppelt gebucht',()=>{c.rh().nachbar=true;const a=c.rhSim(c.rh(),Array(24).fill(2),1,.3,{normal:true,nachbarAnteil:.25}),b={ausgaben:0,zeilen:[]};s.tag=29;c.rhTagBuchen(a,b);near(c.rh().nachbarOffen,3.96);s.tag=30;c.rhTagBuchen(a,b);eq(c.rh().nachbarOffen,0);eq(s.journal.filter(x=>x.t.includes('Nachbar-Abrechnung')).length,1);});
/* Ära 7.5 (R-04): Eigenbetrieb läuft nur in teuren Stunden – Tarif hier über 0,62 × 1,45 = 0,899 €. */
test('Fossiler Eigenbetrieb verbraucht echten Brennstoff',()=>{const r=c.rh();Object.assign(r,{gen:0,genModus:'eigen',fuelF:1.45});const a=c.rhSim(r,Array(24).fill(1),1,1.2,{normal:true});near(a.fossil,24);near(a.fuelKosten,24*0.40*1.45);   /* Ära 8: Brennstoff 0,40 €/kWh (RH_STROM.brennstoff) */near(a.netz,0);});
test('Kraftwerksausfall wird vom vorhandenen Netz abgefangen',()=>{const r=c.rh();Object.assign(r,{gen:0,genModus:'eigen'});const a=c.rhSim(r,Array(24).fill(1),1,.3,{genAus:true});near(a.fossil,0);near(a.netz,24);near(a.fehl,0);});
test('Ohne Anschluss kein wundersamer Strom',()=>{const r=c.rh();r.netzKW=0;const a=c.rhSim(r,Array(24).fill(1),1,.3);near(a.fehl,24);});
test('Cent-Buchungen bleiben centgenau',()=>{s.kredit=10;c.buche(-.34,'test','Cent');c.buche(-.17,'test','Cent');near(s.kredit,9.49);});
test('Teich-Geometrie in breiter und schmaler Ansicht endlich',()=>{for(const [w,h]of [[1600,900],[1280,500],[390,600]]){const g=c.rhTeichGeometrie(w,h);assert.ok(g.rx>0&&g.ry>0);assert.ok(c.rhImTeich(g.x,g.y,g));}});
test('Teich kann nicht mit großem Schritt durchquert werden',()=>{const g=c.rhTeichGeometrie(1600,900),q=c.rhKollisionsSchritt(g.x-g.rx*2,g.y,g.x+g.rx*2,g.y,g);eq(q.hit,true);assert.ok(!c.rhImTeich(q.x,q.y,g));});
test('Alte Position im Teich wird an sicheren Rand gesetzt',()=>{const g=c.rhTeichGeometrie(1600,900),q=c.rhAussenPunkt(g.x+.1,g.y,g);assert.ok(!c.rhImTeich(q.x,q.y,g));});
test('Trinkpause leert nur Sitzung; Wissen/Adapter/Notizen bleiben',()=>{const p={status:'frei',w:{code:77},adapters:['a'],krank:'overfit',ctxLastTage:5,sitzung:{tokens:8000,notizen:['Auftrag merken'],wechsel:2},historie:[]};c.rhSessionLeeren(p);eq(p.sitzung.tokens,0);eq(p.sitzung.wechsel,3);eq(p.w.code,77);eq(p.adapters[0],'a');eq(p.sitzung.notizen[0],'Auftrag merken');eq(p.krank,'overfit');eq(p.ctxLastTage,0);});
test('Keine Kontextlöschung im laufenden Auftrag',()=>{const p={status:'job',sitzung:{tokens:8000}};eq(c.rhSessionLeeren(p),false);eq(p.sitzung.tokens,8000);});
test('Kontextrot darf bei neuer Sitzung enden',()=>{const p={status:'frei',krank:'kontextrot',historie:[],sitzung:{tokens:9000}};c.rhSessionLeeren(p);eq(p.krank,null);});
test('Acht Tierarten besitzen eigenen Trinkframe',()=>{for(const a of ['schwein','huhn','kuh','esel','lama','dino','hund','katze']){assert.equal(c.TIER_POSEN[a].trink,'pose_'+a+'_trink');assert.ok(html.includes('"pose_'+a+'_trink":"data:image/png;base64,'));}});
test('Rechenzentrum hat 10 Dachplätze und getrennte Freilandfelder',()=>{toNerd();c.rhUpgrade();for(let i=0;i<11;i++)c.rhKauf('solar');eq(c.rh().pv.length,10);near(c.rhPV(c.rh()),6);const cash=s.kredit;c.rhKauf('solarfeld');eq(cash-s.kredit,270);eq(c.rh().pv.length,10);near(c.rhPV(c.rh()),8.4);});
test('Freilandfelder erst im Zentrum und maximal sechs',()=>{c.rhKauf('solarfeld');eq(c.rh().solarfelder,0);toNerd();c.rhKauf('solarfeld');eq(c.rh().solarfelder,0);c.rhUpgrade();for(let i=0;i<6;i++)c.rhKauf('solarfeld');const cash=s.kredit;c.rhKauf('solarfeld');eq(c.rh().solarfelder,6);eq(s.kredit,cash);});
test('Solarfeld erzeugt nur tagsüber und kostet Wartung',()=>{toNerd();c.rhUpgrade();const before=c.rhSim(c.rh(),Array(24).fill(0),1,.3,{normal:true});c.rhKauf('solarfeld');const after=c.rhSim(c.rh(),Array(24).fill(0),1,.3,{normal:true});near(after.pv-before.pv,6.96);near(after.wartung-before.wartung,2.7/365);eq(after.stunden[0].pv,0);});
test('Früheres großes Dach verliert bei Migration keine Erzeugung',()=>{c.rh().stufe=2;c.rh().pv=Array(24).fill(600);const old=c.rhPV(c.rh());c.rhMigration(s);eq(c.rh().pv.length,10);near(c.rhPV(c.rh()),old);const snap=JSON.stringify(s);c.rhMigration(s);eq(JSON.stringify(s),snap);});
test('Alle drei Hintergründe behalten dieselbe Teichgruppe',()=>{const pond=x=>x.match(/<g transform="translate\(950,712\)">[\s\S]*?\n  <\/g>/)[0],original=pond(c.szeneSvg({teich:true}));for(const id of ['morgen','blumen','spaetsommer']){const svg=c.rhHintergrundSvg(id);eq(pond(svg).replaceAll('rh_'+id+'_glas','glas'),original);assert.ok(svg.includes('viewBox="0 0 1600 900"'));assert.ok(svg.includes('preserveAspectRatio="xMidYMax slice"'));}});
test('Hintergrundwahl verändert keine Simulationswerte',()=>{const old=JSON.stringify(s);c.rhHintergrundWaehlen('blumen');eq(s.hintergrund,'blumen');delete s.hintergrund;eq(JSON.stringify(s),old);});
test('Alle 40 exportierten Grafiken vorhanden und eigenständig',()=>{const dir=path.join(__dirname,'../assets/rechenhaus'),m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));eq(m.dateien.length,40);for(const a of m.dateien){assert.ok(fs.statSync(path.join(dir,a.datei)).size>100);if(a.format==='SVG'){const x=fs.readFileSync(path.join(dir,a.datei),'utf8');assert.ok(x.includes('xmlns="http://www.w3.org/2000/svg"'));assert.ok(!/(?:href|src)="(?:https?:|\.\.\/)/.test(x));}}});

/* ── Ära 7.5 (01.09.2026): je Prüfbefund mindestens eine neue Prüfung ── */
test('R-02 Einspeisung ist auf den Netzanschluss gedeckelt',()=>{const r=c.rh();Object.assign(r,{pv:Array(20).fill(600),netzKW:1,akku:0});
 const a=c.rhSim(r,Array(24).fill(0),1,.3,{normal:true});
 assert.ok(a.abregelung>0,'ohne Deckel keine Abregelung');near(a.pv,a.export+a.abregelung);
 assert.ok(a.export<=24*r.netzKW+1e-9,'Einspeisung über dem Anschluss: '+a.export);
 for(const h of a.stunden)assert.ok(h.grid<=r.netzKW+1e-9);});
test('R-02 Anschlussausbau erhöht die Einspeisung',()=>{const r=c.rh();Object.assign(r,{pv:Array(20).fill(600),netzKW:1,akku:0});
 const eng=c.rhSim(r,Array(24).fill(0),1,.3,{normal:true});r.netzKW=100;
 const weit=c.rhSim(r,Array(24).fill(0),1,.3,{normal:true});
 assert.ok(weit.einspeise>eng.einspeise,'Anschlussausbau muss die Einspeisung erhöhen');near(weit.abregelung,0);});
test('R-04 Eigenbetrieb nur, wenn der Brennstoff billiger ist als die Stunde',()=>{const r=c.rh();Object.assign(r,{gen:0,genModus:'eigen',fuelF:1,netzKW:6});
 near(c.rhSim(r,Array(24).fill(1),1,1.2,{normal:true}).fossil,24);
 const t=c.rhSim(r,Array(24).fill(1),1,.3,{normal:true});near(t.fossil,0);near(t.netz,24);
 eq(c.RH_GEN[0].preis,5000);eq(c.RH_GEN[4].preis,85000);});
test('R-04 Reserve springt auch bei teurem Brennstoff ein',()=>{const r=c.rh();Object.assign(r,{gen:0,genModus:'eigen',fuelF:1,netzKW:0});
 const a=c.rhSim(r,Array(24).fill(1),1,.3,{normal:true});near(a.fossil,24);near(a.fehl,0);});
test('R-05 Amortisation nennt den Realvergleich',()=>{const r=c.rh(),t=c.rhAmort(r,{...r,pv:[400]},45);
 assert.ok(/Amortisation/.test(t),t);assert.ok(/ein Zehntel der Marktpreise/.test(t),t);assert.ok(/Jahre/.test(t),t);});
test('R-06 PC-Preis = GPU-Katalogpreis + Restausstattung',()=>{eq(c.RH_PC.basis.preis-c.GPUS.rtx4080.preis,1000);
 eq(c.RH_PC.gebraucht.preis,3270);eq(c.RH_PC.gebraucht.preis-c.GPUS.rtx4090.preis,1000);
 eq(c.RH_PC.max.preis-c.GPUS.rtx5090.preis,1000);
 eq(c.rhPCUpgradePreis('rtx4090'),3900);eq(c.rhPCUpgradePreis('rtx4080'),4550);});
test('R-06 Aufrüstung bucht den nachgezogenen Preis',()=>{const cash=s.kredit;c.rhPCUpgrade('b1');eq(s.buchten[0].gpu,'rtx5090');near(cash-s.kredit,3900);});
test('R-07 Günstige Einsteiger-PCs sind kaufbar',()=>{eq(c.RH_PC.alt.preis,700);eq(c.RH_PC.klein.preis,1050);
 assert.ok(c.RH_PC_GPUS.includes('rtx3060')&&c.RH_PC_GPUS.includes('rtx4060ti'));
 const cash=s.kredit;c.rhInstall('pc',1,'alt');c.rhInstall('pc',2,'klein');
 eq(s.buchten[1].gpu,'rtx3060');eq(s.buchten[2].gpu,'rtx4060ti');eq(s.buchten.length,3);near(cash-s.kredit,1750);});
test('R-07 Rack-Knoten bleiben Server-GPUs vorbehalten',()=>{toNerd();c.rhEvent(0);c.rhInstall('rack',0);const n=s.buchten.length;
 c.rhInstall('rack',0,'rtx3060',0);c.rhInstall('rack',0,'rtx4060ti',1);eq(s.buchten.length,n);});
test('R-10 Lagergeräte lassen sich zu 55 % Restwert verkaufen',()=>{c.rhKauf('nachbar');c.rhKauf('solar');pc(12);c.rhUpgrade();
 const r=c.rh();eq(r.lager.length,6);const b=r.lager[0],cash=s.kredit;
 const soll=Math.round(c.GPUS[b.gpu].preis*c.RH_ALTWERT*c.gpupreisFaktor());
 c.rhLagerVerkauf(b.id);eq(r.lager.length,5);near(s.kredit-cash,soll);
 c.rhLagerVerkauf(b.id);eq(r.lager.length,5);eq(s.journal.filter(x=>x.kat==='anlagenverkauf').length,1);});
test('R-11 Akku lädt nachts nur im Modus netz aus dem Netz',()=>{const r=c.rh();Object.assign(r,{akku:10,soc:0,netzKW:6,akkuModus:'eigen'});
 const eigen=c.rhSim(r,Array(24).fill(0),1,.48,{normal:true,hofnacht:true});near(eigen.netzladung,0);near(eigen.soc,0);
 c.rhAkkuModus('netz');eq(c.rh().akkuModus,'netz');
 const netz=c.rhSim(r,Array(24).fill(0),1,.48,{normal:true,hofnacht:true});
 near(netz.netzladung,10/Math.sqrt(.9));near(netz.soc,10);near(netz.netzKosten,10/Math.sqrt(.9)*.24);
 near(netz.pv+netz.wind+netz.netz+netz.nachbar+netz.fossil+netz.socStart,netz.last-netz.fehl+netz.export+netz.abregelung+netz.soc+netz.verlust);});
test('R-11 Nachtladung respektiert Anschluss und Kapazität',()=>{const r=c.rh();Object.assign(r,{akku:100,soc:0,netzKW:2,akkuModus:'netz'});
 const a=c.rhSim(r,Array(24).fill(0),1,.48,{normal:true,hofnacht:true});
 for(const h of a.stunden)assert.ok(h.grid<=r.netzKW+1e-9,'Nachtladung sprengt den Anschluss');
 near(a.netzladung,16);near(a.soc,16*Math.sqrt(.9));});
test('R-14 Laststatus-Faktor und Rack-Systemaufschlag',()=>{eq(c.rhLastFaktor('job'),.6);eq(c.rhLastFaktor('training'),.95);
 eq(c.rhLastFaktor('agentenwelt'),.7);eq(c.rhLastFaktor('zucht'),.5);eq(c.rhLastFaktor(undefined),.6);eq(c.rhLastFaktor('frei'),.6);
 near(c.rhPeak({gpu:'h100',rhSlot:'rack:0:0',ramGB:256}),.7+.35);
 near(c.rhPeak({gpu:'rtx4090',rhSlot:'pc:0',ramGB:32}),.45+.095);});
test('R-15 PUE sinkt mit der Ausbaustufe, Grundlast steigt',()=>{eq(c.RH_STUFEN[0].pue,1.45);eq(c.RH_STUFEN[1].pue,1.25);eq(c.RH_STUFEN[2].pue,1.12);
 assert.ok(c.RH_STUFEN[0].pue>c.RH_STUFEN[1].pue&&c.RH_STUFEN[1].pue>c.RH_STUFEN[2].pue);
 eq(c.RH_STUFEN[2].grund,1.2);near(c.rhLast(),c.rhPeak(s.buchten[0])*1.45+.025);});   /* Ära 8: Grundlast 1,2 kW + 0,06 kW je Schrank */
test('R-16 PV folgt der Jahreszeit; der Normtag bleibt neutral',()=>{eq(c.rhSaisonId(1),'fruehling');eq(c.rhSaisonId(31),'sommer');
 eq(c.rhSaisonId(61),'herbst');eq(c.rhSaisonId(91),'winter');
 eq(c.RH_SAISON_PV.winter,.35);eq(c.RH_SAISON_PV.sommer,1.45);
 near(c.rhWeather(91).saisonF,.35);near(c.rhWeather(31).saisonF,1.45);eq(c.rhWeather(91,true).saisonF,1);
 const w=c.rhWeather(91);near(w.pvF,(w.wolke/.72)*.35);
 const r=c.rh();r.pv=[400];
 const winter=c.rhSim(r,Array(24).fill(0),91,.3,{}),sommer=c.rhSim(r,Array(24).fill(0),91,.3,{solarF:c.RH_SAISON_PV.sommer/c.RH_SAISON_PV.winter});
 assert.ok(sommer.pv>winter.pv*3.9,'Winterluecke fehlt');});
test('R-17 Kleinwind erreicht nur einen Bruchteil der Auslastung',()=>{eq(c.RH_WIND[0].cf,.45);eq(c.RH_WIND[1].cf,.75);eq(c.RH_WIND[2].cf,1);
 const r=c.rh();r.wind=[0];near(c.rhWindKW(r),5);near(c.rhWindEffKW(r),2.25);
 near(c.rhSim(r,Array(24).fill(0),1,.3,{normal:true}).wind,2.25*.25*24);
 r.wind=[2];near(c.rhWindEffKW(r),50);near(c.rhSim(r,Array(24).fill(0),1,.3,{normal:true}).wind,50*.25*24);});
test('R-24 rhPrognose liest deterministisch voraus und verändert nichts',()=>{const snap=JSON.stringify(s),p=c.rhPrognose(2);
 eq(JSON.stringify(s),snap);eq(p.length,2);eq(p[0].tag,s.tag+1);eq(p[1].tag,s.tag+2);
 near(p[0].wolke,c.rhWeather(s.tag+1).wolke);near(p[0].pvF,c.rhWeather(s.tag+1).pvF);near(p[1].windF,c.rhWeather(s.tag+2).windF);
 eq(JSON.stringify(c.rhPrognose(2)),JSON.stringify(p));eq(c.rhPrognose(0).length,0);eq(c.rhPrognose(5).length,5);});
test('R-25 GPU-Wartung wird täglich zurückgestellt',()=>{s.tag=5;
 const a=c.rhSim(c.rh(),Array(24).fill(0),1,.3,{normal:true}),b={ausgaben:0,zeilen:[]};
 c.rhTagBuchen(a,b);const z=s.journal.filter(x=>/Hardware-Wartung/.test(x.t));
 eq(z.length,1);near(-z[0].b,Math.round(c.GPUS.rtx4090.preis*.03/365*100)/100);
 assert.ok(b.zeilen.some(x=>/Hardware-Wartung/.test(x.t)));});
test('R-25 Ohne Hardware keine Kleinstbuchung',()=>{s.buchten=[];s.tag=5;
 const a=c.rhSim(c.rh(),Array(24).fill(0),1,.3,{normal:true});c.rhTagBuchen(a,{ausgaben:0,zeilen:[]});
 eq(s.journal.filter(x=>/Hardware-Wartung/.test(x.t)).length,0);});
console.log(`\n${pass}/${pass+fail} Rechenhaus-Prüfungen bestanden`);process.exitCode=fail?1:0;
