const fs=require('fs'),path=require('path');const p=path.join(__dirname,'rechenhaus.js');let s=fs.readFileSync(p,'utf8');
function rep(a,b){if(!s.includes(a))throw Error('Anker fehlt: '+a.slice(0,90));s=s.replace(a,b);}
rep('function rhSymbol(type,filled=true){','function rhSymbol(type,filled=true){\n if(filled&&["pc","rack"].includes(type))return rhObjektSvg(type==="rack"?"serverschrank":"pc");');
rep("'<div class=\"rhShop\"><article>'+rhSymbol('solar')", "'<div class=\"rhShop\"><article>'+rhObjektBild(c.wp===400?'solarpanel_400w':'solarpanel_600w')");
rep("rhBtn('Panel montieren · '+rhEuro(add)","rhBtn(roof>=c.dach?'Dach vollständig belegt':'Panel montieren · '+rhEuro(add)");
rep("'<p class=\"rhPayback\">'+rhAmort(r,{...r,pv:[...r.pv,c.wp]},add)+'</p>'", "(roof<c.dach?'<p class=\"rhPayback\">'+rhAmort(r,{...r,pv:[...r.pv,c.wp]},add)+'</p>':'')");
rep(" '<article>'+rhSymbol('akku')",` (r.stufe===2?'<article>'+rhObjektBild('solarfeld')+'<h3>Die Sonnenwiese</h3><p>'+r.solarfelder+'/6 Freilandfelder. Pro Feld 4 × 600 W = 2,4 kWp, einschließlich Gestell. Die 10 Dachplätze bleiben davon getrennt.</p>'+rhBtn(r.solarfelder>=6?'Alle Felder bepflanzt':'Solarfeld aufstellen · 2.700 €',"rhKauf('solarfeld')",r.solarfelder>=6||rhCash()<2700)+(r.solarfelder<6?'<p class="rhPayback">'+rhAmort(r,{...r,solarfelder:r.solarfelder+1},2700)+'</p>':'')+'<p>Für die letzte Ausbaustufe brauchst du insgesamt 12 kWp Solar. Zum Beispiel: zehn 600-W-Dachpanels und drei Felder ergeben 13,2 kWp. Alte 400-W-Panels zählen mit ihrer echten Leistung.</p></article>':'')+\n '<article>'+rhObjektBild('akku')`);
rep("rhBtn('+'+batStep+' kWh · '+rhEuro(batStep*400)","rhBtn(batStep<=0?'Speicher vollständig ausgebaut':'+'+batStep+' kWh · '+rhEuro(batStep*400)");
rep('r.akku+batStep>c.akku||rhCash()<batStep*400','batStep<=0||r.akku+batStep>c.akku||rhCash()<batStep*400');
rep("'<p class=\"rhPayback\">'+rhAmort(r,{...r,akku:r.akku+batStep},batStep*400)+'</p>","(batStep>0?'<p class=\"rhPayback\">'+rhAmort(r,{...r,akku:r.akku+batStep},batStep*400)+'</p>':'')+'");
rep("(r.stufe>0?'<article>'+rhSymbol('wind')","(r.stufe>0?'<article>'+rhObjektBild('wind_gross')");
rep("'<article>'+rhSymbol('gen')","'<article>'+rhObjektBild('kraftwerk')");
rep("rhView=['raum','energie','ausbau','teich']", "rhView=['raum','energie','ausbau','teich','ansicht']");
rep("['teich','Trinkpause']]", "['teich','Trinkpause'],['ansicht','Hofansicht']]");
rep("rhView==='ausbau'?rhAusbau():rhTeichInfo()", "rhView==='ausbau'?rhAusbau():rhView==='ansicht'?rhAnsicht():rhTeichInfo()");
fs.writeFileSync(p,s);console.log('Objektgrafiken und Hintergrundwahl eingebunden.');
