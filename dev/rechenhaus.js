/* Rechenhaus v1 · Alle Baupreise, Lastprofile und Wetterwerte sind offene Spielannahmen.
   Herstellerdaten GPU != Verbrauch des ganzen Rechners. Keine Elektroplanung.
   Ära 7.5 (01.09.2026) · Für Template und hofloop.js exportiert diese Datei zusätzlich:
     rhLastFaktor(status) – Laststatus-Faktor auf die GPU-TDP (R-14), in hlProfile einsetzen.
     rhPrognose(n)        – deterministisches Wetter der nächsten n Hoftage (R-24), reine Lesefunktion.
     rhWindEffKW(r)       – wirksame Windleistung nach Kapazitätsfaktor (R-17); rhWindKW bleibt Nennleistung.
     rhSaisonId/rhSaisonF – Jahreszeit und PV-Saisonfaktor eines beliebigen Hoftags (R-16).
     rhAkkuModus(m)       – Umschalter r.akkuModus "eigen"|"netz" für die Nachtladung (R-11).
     rhLagerVerkauf(id)   – Verkauf eingelagerter Geräte zu 55 % Restwert (R-10).
   Bilanzfelder neu in rhSim: a.abregelung, a.netzladung, a.saison, a.saisonF. */
/* Ära 7.5/8 (R-15): PUE steigt mit der Improvisation, nicht mit der Größe – der ungekühlte Schuppen
   ist der schlechteste Raum, das geplante Rechenzentrum der beste. Seine Grundlast besteht aus
   1,2 kW Gebäudesockel plus 0,06 kW je belegtem Schrank für wachsende Kühlung und USV. */
const RH_STUFEN=[
 {name:"Geräteschuppen",bild:"rh_schuppen",pc:12,racks:0,dach:4,wp:400,akku:10,pue:1.45,grund:0.025,preis:0},
 {name:"Nerdtempel",bild:"rh_nerd",pc:6,racks:8,dach:6,wp:600,akku:80,pue:1.25,grund:0.10,preis:12000},
 {name:"Rechenzentrum",bild:"rh_zentrum",pc:0,racks:64,dach:10,wp:600,akku:600,pue:1.12,grund:1.20,preis:90000}   /* Ära 8: Grundlast 1,2 kW + 0,06 kW je Schrank (Kühlung/USV wachsen mit dem Ausbau) */
];
/* Ära 7.5 (R-17): Kapazitätsfaktor je Baugröße. Kleinwind steht in bodennaher, turbulenter Luft
   und erreicht nur einen Bruchteil der Auslastung großer Anlagen. cf=1,0 entspricht den 25 % Normjahr. */
const RH_WIND=[{kw:5,preis:2200,cf:0.45},{kw:20,preis:7200,cf:0.75},{kw:50,preis:16500,cf:1.0}];   /* Ära 8: Wind auf 1/10-Marktpreis angehoben (≈ 330–440 €/kW), Amortisation ~120 Tage wie Solar */
/* Ära 8 · Strom 2.0 – ein Regelwerk für den ganzen Hof:
   • Der Netzanschluss (netzKW) ist die harte Grenze für Hardware; Eigenerzeugung entlastet ihn bis zur Hälfte (Eigenbonus).
   • Der Anschluss kostet einen Grundpreis je kW und Tag – Überdimensionieren tut weh, Eigenstrom ist grundpreisfrei.
   • Einspeisung bringt wenig, Nachtstrom die Hälfte, das Kraftwerk läuft, sobald Brennstoff billiger als der Stundenpreis ist. */
const RH_STROM={leistungspreis:0.5,einspeise:0.08,eigenBonusMax:0.5,eigenF:{pv:0.6,wind:0.8,akku:0.5},brennstoff:0.40,grundRack:0.06,nachbarKW:6,nachbarPreis:350,nachbarAufschlag:0.10};
/* Ära 7.5 (R-04): Fossile Anschaffungspreise halbiert – sie passen damit in dieselbe 1/10-Preiswelt
   wie Solar, Wind und Speicher; der Betrieb bleibt teuer. */
const RH_GEN=[{kw:15,preis:5000},{kw:45,preis:13500},{kw:120,preis:30000},{kw:240,preis:55000},{kw:400,preis:85000}];
/* Ära 7 (Haupt-Session): Start-PC ist jetzt der RTX-4090-Gebraucht-PC ("gebraucht"); als PC gelten alle drei Varianten.
   Ära 7.5 (R-06/R-07): Restausstattung durchgängig kalkuliert – GPU-Katalogpreis + Rest-PC.
   Rest-PC: 1.000 € (Ryzen 7/9, 32–64 GB, 2–4 TB), 550 €/440 € bei den kleinen Einsteigerkisten.
   Neu: "klein" und "alt" schließen die Lücke unterhalb von 2.100 € und machen die 13 Hofbuch-GPUs kaufbar. */
const RH_PC={
 alt:{gpu:"rtx3060",cpu:"Ryzen 5 (gebraucht)",ramGB:32,ssdTB:1,preis:700},
 klein:{gpu:"rtx4060ti",cpu:"Ryzen 5",ramGB:32,ssdTB:1,preis:1050},
 basis:{gpu:"rtx4080",cpu:"Ryzen 7",ramGB:32,ssdTB:2,preis:2100},
 gebraucht:{gpu:"rtx4090",cpu:"Ryzen 7",ramGB:32,ssdTB:2,preis:3270,n:"Zweitmarkt-4090-Rig"},   /* v9.8: sprechender Name – „gebraucht“ ist teurer als „basis“, weil die 4090 gebraucht mehr kostet als eine neue 4080 */
 max:{gpu:"rtx5090",cpu:"Ryzen 9",ramGB:64,ssdTB:4,preis:5700},
 /* Ära 8 (Video-Abgleich „Hardware für lokale KI“): gebrauchte 3090 als Einsteiger-Geheimtipp, Unified-Memory-Kisten als eigene Klasse */
 dreier:{gpu:"rtx3090",cpu:"Ryzen 7 (gebraucht)",ramGB:32,ssdTB:2,preis:1400},
 strix:{gpu:"strix",cpu:"Ryzen AI Max+ 395 (16 Kerne)",ramGB:128,ssdTB:2,preis:1800,unified:true},
 spark:{gpu:"spark",cpu:"Grace (20 Kerne)",ramGB:128,ssdTB:4,preis:4000,unified:true},
 mac:{gpu:"macstudio",cpu:"M4 Max (16 Kerne)",ramGB:128,ssdTB:2,preis:4500,unified:true},
 pi:{gpu:"pi5",cpu:"Cortex-A76 (4 Kerne)",ramGB:8,ssdTB:0.1,preis:120,nurNadel:true}   /* Ära 9: Kleinstrechner für die Nadelklasse */
};
const RH_PC_GPUS=["pi5","rtx3060","rtx4060ti","rtx3090","rtx4080","rtx4090","rtx5090","strix","spark","macstudio"];
/* Ära 7.5 (R-06/R-10): eine Restwertquote für Verkauf und Inzahlungnahme. */
const RH_ALTWERT=0.55;
/* Ära 7.5 (R-16): Saisonfaktor der PV-Erzeugung (Deutschland: Dezember ≈ 0,4, Juni ≈ 4,7 kWh/kWp·Tag). */
const RH_SAISON_PV={fruehling:1.25,sommer:1.45,herbst:0.75,winter:0.35};
const RH_EVS={
 1:[{ab:1,kw:25,preis:2500,n:"Eine Leitung für die ersten Racks",txt:"25-kW-Anschluss für Rack 1–2."},
    {ab:3,kw:63,preis:4500,n:"Ein eigener Energiemix",txt:"Für Rack 3–5: 63 kW Anschluss und mindestens 3,6 kWp Solar ODER ein Windrad ODER 15 kW Kraftwerk."},
    {ab:6,kw:100,preis:8000,n:"Reserve für lange Nächte",txt:"Für Rack 6–8: 100 kW Anschluss und 20 kWh Akku ODER mindestens 45 kW Kraftwerk."}],
 2:[{ab:9,kw:200,preis:12000,n:"Der eigene Transformator",txt:"Für Rack 9–24: 200-kW-Anschluss."},
    {ab:25,kw:400,preis:24000,n:"Der Hof wird zum Energiepark",txt:"Für Rack 25–48: 400 kW Anschluss und zwei große Windräder ODER mindestens 240 kW Kraftwerk."},
    {ab:49,kw:600,preis:40000,n:"Die letzte Reihe braucht einen Plan",txt:"Für Rack 49–64: 600 kW Anschluss und sechs große Windräder + 12 kWp Solar + 200 kWh Akku ODER 400 kW Kraftwerk."}]
};
function rhR(n){return Math.round(n*100)/100;}
function rhN(n,d=1){return Number(n||0).toLocaleString("de-DE",{maximumFractionDigits:d});}
function rhEuro(n){return Number(n||0).toLocaleString("de-DE",{style:"currency",currency:"EUR"});}
/* Ära 7.5 (R-11): akkuModus "eigen" = nur Sonnen-/Windüberschuss lädt; "netz" = zusätzlich Nachtstrom
   zum halben Tarif. Migration füllt das Feld über rhMigration automatisch nach. */
function rhNeu(){return {v:1,stufe:0,nachbar:false,nachbarOffen:0,netzKW:6,pv:[],solarfelder:0,wind:[],akku:0,soc:0,gen:-1,genModus:"reserve",akkuModus:"eigen",events:{},racks:[],lager:[],legacySolar:0,invest:0,ertrag:0,letzte:null,verlauf:[],fuelF:1,fuelTage:0,genAus:0};}
function rh(s=S){ if(!s.rechenhaus) rhMigration(s); return s.rechenhaus; }
function rhMigration(s){
 if(s.rechenhaus&&s.rechenhaus.v===1){
   const r=s.rechenhaus,d=rhNeu();for(const k in d)if(r[k]===undefined)r[k]=d[k];
   r.stufe=kl(Math.floor(endlich(r.stufe,0)),0,2);r.soc=kl(endlich(r.soc,0),0,r.akku);
   // Frühe Zwischenstände mit größerem Dach behalten ihre bezahlte Erzeugung als Bestandsanlage.
   if(r.pv.length>RH_STUFEN[r.stufe].dach)r.legacySolar+=r.pv.splice(RH_STUFEN[r.stufe].dach).reduce((n,w)=>n+w/1000,0);
   return r;
 }
 const r=s.rechenhaus=rhNeu(),bs=s.buchten||[];
 // Vorhandene Anlagen werden als Bestandsanbau weiterbetrieben, nie verschenkt oder gelöscht.
 r.legacySolar=Math.max(0,(s.solar||0)*4);s.solar=0;
 bs.forEach((b,i)=>{b.rhSlot="bestand:"+i;b.cpu=b.cpu||"Bestands-CPU";b.ramGB=b.ramGB||s.ramGB||64;b.ssdTB=b.ssdTB||4;});
 if(bs.length===1&&["rtx4080","rtx4090"].includes(bs[0].gpu)&&bs[0].id==="b1"){ /* Ära 7: Start-PC kann 4080 (alt) oder 4090 (neu) sein */
   Object.assign(bs[0],{rhSlot:"pc:0",cpu:"Ryzen 7",ramGB:32,ssdTB:2});
 }else if(bs.length){r.bestandHinweis=true;r.netzKW=Math.max(6,Math.ceil(bs.reduce((n,b)=>n+((GPUS[b.gpu]||{}).watt||1000)+180,0)*1.2/1000));}
 return r;
}
function rhCfg(s=S){return RH_STUFEN[rh(s).stufe];}
function rhPCs(s=S){return s.buchten.filter(b=>(b.rhSlot||"").startsWith("pc:"));}
function rhGenKW(r){return r.gen>=0?RH_GEN[r.gen].kw:0;}
function rhPV(r){return r.pv.reduce((a,w)=>a+w/1000,0)+(r.solarfelder||0)*2.4+r.legacySolar;}
function rhWindKW(r){return r.wind.reduce((a,i)=>a+RH_WIND[i].kw,0);}
/* Ära 7.5 (R-17): rhWindKW bleibt die Nennleistung (Anzeige, Ausbauereignisse);
   rhWindEffKW ist die für die Erzeugung wirksame Leistung nach Kapazitätsfaktor. */
function rhWindEffKW(r){return r.wind.reduce((a,i)=>a+RH_WIND[i].kw*(RH_WIND[i].cf??1),0);}
function rhAkkuSchritt(r=rh()){return Math.max(0,Math.min(r.stufe===0?5:r.stufe===1?20:100,RH_STUFEN[r.stufe].akku-r.akku));}
function rhCash(s=S){return s.kredit-rh(s).nachbarOffen;}
/* Ära 7.5 (R-14): Systemaufschlag eines Serverknotens von 0,18 auf 0,35 kW angehoben.
   Reale HGX-/PCIe-Knoten mit 256 GB RAM und 8 TB NVMe liegen ohne GPU bei 300–500 W. */
function rhPeak(b){const t=b.tier?S.tiere.find(p=>p.uid===b.tier):null;const spar=(t&&typeof merkmalHat==="function"&&merkmalHat(t,"sparsam"))?0.9:1;   /* Ära 8: Merkmal Sparsam −10 % */
 return (((GPUS[b.gpu]||{}).watt||0)/1000+((b.rhSlot||"").startsWith("pc:")?(b.ramGB>=64?.13:.095):.35))*spar;}
/* Ära 7.5 (R-14): Laststatus-Faktor auf die Herstellergrenze (TDP). LLM-Decode ist speicherband-
   breiten-, nicht rechenlimitiert und zieht real 45–65 % der TDP; Training liegt bei 90–100 %.
   Global exportiert, damit hlProfile in hofloop.js denselben Faktor benutzen kann. */
function rhLastFaktor(status){return {job:.6,training:.95,agentenwelt:.7,zucht:.5,schulung:.9}[status]??.6;}   /* Ära 9: Fachkurs ≈ Training */
function rhGrund(s=S){const r=rh(s),c=rhCfg(s);return c.grund+(r.stufe===2?RH_STROM.grundRack*(r.racks||[]).length:0);}   /* Ära 8 */
function rhLast(s=S){const c=rhCfg(s);return s.buchten.reduce((a,b)=>a+rhPeak(b),0)*c.pue+rhGrund(s);}
/* Eigenbonus: Sonne/Wind/Akku entlasten den Anschluss bis zur Hälfte der Netzleistung (Spielannahme: Eigenverbrauch + Spitzenkappung) */
function rhEigenBonus(r=rh()){const pvKW=rhPV(r);const windKW=r.wind.reduce((n,i)=>n+RH_WIND[i].kw*RH_WIND[i].cf*0.25,0);const akkuKW=r.akku/2;
 return Math.round(Math.min(r.netzKW*RH_STROM.eigenBonusMax,pvKW*RH_STROM.eigenF.pv+windKW*RH_STROM.eigenF.wind+akkuKW*RH_STROM.eigenF.akku)*100)/100;}
function rhAnschlussFrei(r=rh()){return Math.round((r.netzKW+rhEigenBonus(r)-rhLast())*100)/100;}
function rhAnschlussText(kw){const r=rh(),c=rhCfg(),frei=rhAnschlussFrei(r);
 const opt=[];if(r.stufe===0&&!r.nachbar)opt.push("Nachbarvertrag +"+RH_STROM.nachbarKW+" kW ("+rhEuro(RH_STROM.nachbarPreis)+")");
 if(r.pv.length<c.dach)opt.push("Solarmodul +"+rhN(c.wp/1000*RH_STROM.eigenF.pv,2)+" kW Bonus ("+rhEuro(c.wp===400?45:60)+")");
 if(r.akku<c.akku)opt.push("Akku +5 kWh = +"+rhN(2.5*RH_STROM.eigenF.akku,2)+" kW Bonus ("+rhEuro(200)+")");
 if(r.stufe>=1&&r.wind.length<6)opt.push("Windrad klein +"+rhN(RH_WIND[0].kw*RH_WIND[0].cf*0.25*RH_STROM.eigenF.wind,2)+" kW ("+rhEuro(RH_WIND[0].preis)+")");
 if(r.stufe<2)opt.push("Umbau zum "+RH_STUFEN[r.stufe+1].name+" ("+rhEuro(RH_STUFEN[r.stufe+1].preis)+", Anschluss "+(r.stufe===0?12:100)+" kW)");
 return "Anschluss reicht nicht: braucht "+rhN(kw,2)+" kW, frei "+rhN(frei,2)+" kW ("+r.netzKW+" kW Netz + "+rhN(rhEigenBonus(r),2)+" kW Eigenbonus − "+rhN(rhLast(),2)+" kW Last). Optionen: "+opt.join(" · ")+".";}
function rhProfile(s=S){
 if(typeof hlProfile==='function')return hlProfile(s).last;
 const c=rhCfg(s),hours=Array(24).fill(rhGrund(s));
 s.buchten.forEach(b=>{
   const p=s.tiere.find(t=>t.uid===b.tier)||s.tiere.find(t=>t.training&&t.training.bucht===b.id);
   const rack=!(b.rhSlot||"").startsWith("pc:"),idle=rack?.11:.045;
   let h=p?({training:22,job:14,agentenwelt:16,zucht:10,schulung:18}[p.status]||2):0;   /* Ära 9: Fachkurs = Trainingslauf */
   if(p&&p.status==="job")h*= (p.setups||[]).reduce((f,id)=>f*((SETUPS[id]||{}).kw||1),1);
   h=Math.min(24,h);const start=(24-h)/2;
   /* Ära 7.5 (R-14): Aktivstunden ziehen nicht die volle TDP, sondern den Laststatus-Faktor. */
   const spitze=rhPeak(b)*rhLastFaktor(p&&p.status);
   for(let i=0;i<24;i++){const active=Math.max(0,Math.min(i+1,start+h)-Math.max(i,start));
     hours[i]+=((p?idle:.008)+active*Math.max(0,spitze-idle))*c.pue;}
 });return hours;
}
function rhSeed(tag,salt){const x=Math.sin(tag*127.1+salt*311.7)*43758.5453;return x-Math.floor(x);}
function rhSaat(s){try{return Number((s||S).hofloop&&((s||S).hofloop.saat))||1;}catch(e){return 1;}}
/* Ära 7.5 (R-16): Jahreszeit eines beliebigen Hoftags – identisch zu saison() für S.tag,
   aber auch für Prognosetage berechenbar (30-Tage-Rhythmus wie in content.js). */
function rhSaisonId(tag){
 if(typeof SAISONEN!=="undefined"&&SAISONEN&&SAISONEN.length)return SAISONEN[Math.floor((Math.max(1,tag||1)-1)/30)%SAISONEN.length].id;
 return typeof saison==="function"?saison().id:"sommer";
}
function rhSaisonF(tag){return RH_SAISON_PV[rhSaisonId(tag)]??1;}
function rhWeather(tag,normal=false,saat){
 if(normal)return {wolke:.72,wind:.25,saisonF:1,saison:"Normjahr",pvF:1,windF:1,n:"Normjahr",z:"🌤️",regen:false,sturm:false,hitze:false,nebel:false,pvExtra:1,windExtra:1};
 saat=Number(saat)||rhSaat();
 const rohS=t=>.28+rhSeed(t,saat+1)*.72,rohW=t=>rhSeed(t,saat+2)<.16?.025:.08+rhSeed(t,saat+3)*.47;
 /* Drei Tage Wettergedächtnis: Fronten bleiben sichtbar, ohne Zustand zu speichern. */
 let wolke=rohS(tag-2),wind=rohW(tag-2);for(let t=tag-1;t<=tag;t++){wolke=.55*wolke+.45*rohS(t);wind=.55*wind+.45*rohW(t);}
 const saisonF=rhSaisonF(tag),sturm=wind>.48,hitze=rhSaisonId(tag)==="sommer"&&wolke>.82&&Math.floor(rhSeed(tag,saat+8)*4)===0,nebel=rhSaisonId(tag)==="herbst"&&wolke<.52&&Math.floor(rhSeed(tag,saat+9)*3)===0;
 const regen=wolke<.43&&!sturm,pvExtra=(sturm||nebel)?.8:1,windExtra=sturm?.6:1;
 const n=sturm?"Sturm":hitze?"Hitzetag":nebel?"Nebelmorgen":regen?"Regenwolken":wolke<.55?"Wolkig":wolke>.82?"Sonnig":"Sonne & Wolken";
 const z=sturm?"🌪️":hitze?"🌡️":nebel?"🌫️":regen?"🌧️":wolke>.82?"☀️":"🌤️";
 return {wolke,wind,saisonF,saison:rhSaisonId(tag),pvF:(wolke/.72)*saisonF*pvExtra,windF:(wind/.25)*windExtra,n,z,regen,sturm,hitze,nebel,pvExtra,windExtra};
}
/* Ära 7.5 (R-24): Reine Lesefunktion – liefert das deterministische Spielwetter der nächsten n Tage.
   Verbraucht nichts, würfelt nichts, verändert keinen Spielstand. Wetterprognosen sind in der
   Realität unsicher; im Spiel sind sie exakt, damit Lastverschiebung planbar wird. */
function rhPrognose(n=2,s=S){
 const out=[];for(let k=1;k<=Math.max(0,n);k++){const tag=(s&&s.tag||1)+k,w=rhWeather(tag,false,rhSaat(s));
   out.push({tag,wolke:w.wolke,wind:w.wind,pvF:w.pvF,windF:w.windF,saison:w.saison,n:w.n,z:w.z,regen:w.regen,sturm:w.sturm,hitze:w.hitze,nebel:w.nebel});}
 return out;
}
/* Tagesplanung nach der Nacht: heute plus die nächsten Tage, mit handlungsrelevantem Tipp. */
function rhWetterbericht(n=3,s=S){
 const start=s&&s.tag||1,out=[];for(let k=0;k<Math.max(1,n);k++){const tag=start+k,w=rhWeather(tag,false,rhSaat(s));let tipp="Normaler Betriebstag.";
  if(w.sturm)tipp="Kleinwind steht still; große Räder liefern nur 60 %.";else if(w.hitze)tipp="Kühlung braucht heute mehr Strom.";else if(w.nebel)tipp="Morgendlicher Nebel dämpft Solar um 20 %.";else if(w.regen)tipp="Wolken drücken den Solarertrag – Akku und Netz einplanen.";else if(w.pvF>1.2)tipp="Guter Solartag – lokale Lasten lohnen sich besonders.";
  out.push({tag,name:w.n,z:w.z,pvF:w.pvF,windF:w.windF,tipp,regen:w.regen,sturm:w.sturm,hitze:w.hitze,nebel:w.nebel});}
 return out;
}
/* Stundenweise Energiebilanz. kW × 1 h = kWh, Speicher hat separate Leistungsgrenze.
   Ergebnis ist rein funktional: Vorschauen verbrauchen keinen Akku, würfeln keine Ereignisse. */
function rhSim(r,last,tag,tarif,opt={}){
 const w=rhWeather(tag,!!opt.normal,opt.saat),cap=r.akku,power=cap/2,eta=Math.sqrt(.90);
 let soc=kl(opt.soc??r.soc,0,cap),a={last:0,pv:0,wind:0,direkt:0,ladung:0,entladung:0,verlust:0,netz:0,nachbar:0,fossil:0,export:0,abregelung:0,netzladung:0,fehl:0,stunden:[],socStart:soc};
 /* Ära 7.5 (R-17): für die Erzeugung zählt die wirksame Leistung nach Kapazitätsfaktor. */
 const maxgen=opt.genAus?0:rhGenKW(r),fkw=rhPV(r),wkw=w.sturm?r.wind.reduce((a,i)=>a+(i===0?0:RH_WIND[i].kw*(RH_WIND[i].cf??1)*.6),0):rhWindEffKW(r);
 /* Ära 7.5 (R-04): Brennstoffkosten je erzeugter kWh – Vergleichsgröße für den Eigenbetrieb. */
 const brennstoff=RH_STROM.brennstoff*(opt.fuelF??r.fuelF);
 /* Ära 7.5 (R-11): Nachtladung nur, wenn der Spieler sie ausdrücklich eingeschaltet hat. */
 const netzLadenAn=!!opt.hofnacht&&(opt.akkuModus??r.akkuModus)==="netz"&&cap>0;
 a.modelle={};a.nachtKwh=0;a.nachtKosten=0;a.netzKosten=0;a.nachbarKosten=0;
 const profile=opt.profile;
 if(profile)for(const uid of Object.keys(profile.teile))a.modelle[uid]={tagLast:0,tagGeliefert:0,nachtLast:0,nachtGeliefert:0,eigen:0};
 const reihenfolge=opt.hofnacht?[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,0,1,2,3,4,5]:Array.from({length:24},(_,i)=>i);
 for(const h of reihenfolge){
   // Ära 7.5 (R-16): 2,9 kWh/kWp·Tag im Normjahr (DE-Mittel ~1.050 kWh/kWp·a) × Saisonfaktor.
   // Tagesschwankung ist Spielwetter, keine echte Wettervorhersage.
   const shape=Math.max(0,Math.sin((h-6+.5)/12*Math.PI)),norm=7.661297576;
   const pv=fkw*2.9*(w.wolke/.72)*w.saisonF*(w.pvExtra??1)*shape/norm*(opt.solarF??1);
   const wind=wkw*w.wind*(opt.normal?1:.65+.7*rhSeed(tag,h+20))*(opt.windF??1);
   const nacht=h>=22||h<6;
   const preis=tarif*(opt.hofnacht&&nacht?.5:1);
   const ids=profile?Object.keys(profile.teile):[];
   const eigenIds=ids.filter(uid=>profile.modi[uid]==='eigen');
   let gruenBudget=pv+wind+Math.min(power,soc*eta),abgeworfen=0;
   const erlaubt={};
   for(const uid of eigenIds){erlaubt[uid]=Math.min(profile.teile[uid][h],gruenBudget);gruenBudget-=erlaubt[uid];abgeworfen+=profile.teile[uid][h]-erlaubt[uid];}
   const basisPue=(RH_STUFEN[r.stufe]||RH_STUFEN[0]).pue,hitzeF=w.hitze?(basisPue+.08)/basisPue:1,demand=Math.max(0,last[h]*hitzeF-abgeworfen),direct=Math.min(demand,pv+wind);
   let need=demand-direct,surplus=pv+wind-direct;
   const charge=Math.min(surplus,power,(cap-soc)/eta);soc+=charge*eta;surplus-=charge;
   /* Ära 7.5 (R-11): In Nachtladung sammelt der Akku billigen Netzstrom, statt gleichzeitig
      teuer zu entladen – sonst dreht sich der Speicher mit 10 % Verlust im Kreis. */
   const nachtLaden=netzLadenAn&&nacht&&soc<cap-1e-9&&!(opt.ausfallStunden||[]).includes(h);
   const discharge=Math.min(nachtLaden?0:need,power,soc*eta);soc-=discharge/eta;need-=discharge;
   let fossil=0;
   /* Ära 7.5 (R-04): Eigenbetrieb nur, wenn der Brennstoff die Stunde wirklich billiger macht
      als das Netz. Bei "teuer"-Ereignissen und Strompreissprüngen springt das Kraftwerk an. */
   if(r.genModus==="eigen"&&brennstoff<preis){fossil=Math.min(need,maxgen);need-=fossil;}
   const netzGrenze=(opt.ausfallStunden||[]).includes(h)?0:r.netzKW;
   const grid=Math.min(need,netzGrenze),nb=r.nachbar&&r.stufe===0?(opt.nachbarProfil?grid*kl((opt.nachbarProfil[h]||0)/Math.max(.00001,demand),0,1):Math.min(grid,Math.max(0,grid-6))):0;
   need-=grid;
   /* Reserve: was Netz und Eigenstrom nicht decken, übernimmt das Kraftwerk – unabhängig vom Preis. */
   const reserve=Math.min(need,Math.max(0,maxgen-fossil));fossil+=reserve;need-=reserve;
   /* Ära 7.5 (R-11): Restliche Anschlussleistung lädt den Akku zum halben Nachttarif. */
   const netzLade=nachtLaden?Math.max(0,Math.min(power-charge,(cap-soc)/eta,netzGrenze-grid)):0;
   soc+=netzLade*eta;
   /* Ära 7.5 (R-02): Der Anschluss ist bidirektional begrenzt. Was darüber hinausgeht, wird
      abgeregelt – genau wie eine reale Anlage ohne Einspeisezusage. */
   const einspeisung=Math.min(surplus,Math.max(0,netzGrenze-grid-netzLade));
   const abregelung=Math.max(0,surplus-einspeisung);
   // Zuerst reservierte Eigenstrom-Modelle, dann Grundlast und automatische Verbraucher.
   let eigenRest=direct+discharge,externRest=grid+fossil;
   for(const uid of eigenIds){const m=a.modelle[uid],angefordert=profile.teile[uid][h],geliefert=Math.min(erlaubt[uid],eigenRest);eigenRest-=geliefert;m.eigen+=geliefert;m[nacht?'nachtLast':'tagLast']+=angefordert;m[nacht?'nachtGeliefert':'tagGeliefert']+=geliefert;}
   if(profile){const basis=profile.base[h],eb=Math.min(basis,eigenRest);eigenRest-=eb;externRest=Math.max(0,externRest-(basis-eb));}
   for(const uid of ids.filter(uid=>!eigenIds.includes(uid))){const m=a.modelle[uid],angefordert=profile.teile[uid][h],eg=Math.min(angefordert,eigenRest);eigenRest-=eg;const net=Math.min(angefordert-eg,externRest);externRest-=net;m.eigen+=eg;m[nacht?'nachtLast':'tagLast']+=angefordert;m[nacht?'nachtGeliefert':'tagGeliefert']+=eg+net;}
   /* Ära 7.5 (R-11): Die Netzladung läuft über denselben Zähler und denselben (halben) Nachttarif. */
   a.netzKosten+=(grid-nb+netzLade)*preis;a.nachbarKosten+=nb*preis*1.10;
   if(nacht){a.nachtKwh+=demand;a.nachtKosten+=(grid-nb+netzLade)*preis+nb*preis*1.10;}
   for(const [k,v]of Object.entries({last:demand+abgeworfen,pv,wind,direkt:direct,ladung:charge+netzLade,netzladung:netzLade,entladung:discharge,verlust:(charge+netzLade)*(1-eta)+discharge*(1/eta-1),netz:grid-nb+netzLade,nachbar:nb,fossil,export:einspeisung,abregelung,fehl:need+abgeworfen}))a[k]+=v;
   a.stunden.push({h,last:demand,pv,wind,soc,grid:grid+netzLade,fossil,fehl:need,abregelung});
 }
 a.soc=kl(soc,0,cap);a.wetter=w.n;a.saison=w.saison;a.saisonF=w.saisonF;a.puePlus=w.hitze ? .08 : 0;
 // Nachbarvertrag gilt für die Zusatz-PCs 7–12, nicht für den gesamten Hof.
 // Ihre Lastanteile werden separat tarifiert, auch wenn Gesamtlast unter 6 kW liegt.
 if(r.nachbar&&r.stufe===0&&!opt.nachbarProfil&&opt.nachbarAnteil){const total=a.netz+a.nachbar;a.nachbar=total*opt.nachbarAnteil;a.netz=total-a.nachbar;}
 if(!opt.hofnacht){a.netzKosten=a.netz*tarif;a.nachbarKosten=a.nachbar*tarif*1.10;}
 a.fuelKosten=a.fossil*brennstoff; // Brennstoff je erzeugter kWh: Spielannahme.
 a.wartung=((r.pv.reduce((n,w)=>n+(w===400?45:60),0)+(r.solarfelder||0)*270+r.legacySolar*100)*.01+r.wind.reduce((n,i)=>n+RH_WIND[i].preis*.02,0)+r.akku*40*.01+(r.gen>=0?RH_GEN[r.gen].preis*.04:0))/365;
 a.leistungspreis=r.netzKW*RH_STROM.leistungspreis;a.einspeise=a.export*RH_STROM.einspeise;a.kosten=a.netzKosten+a.nachbarKosten+a.fuelKosten+a.wartung+a.leistungspreis-a.einspeise;   /* Ära 8: Grundpreis je kW Anschluss */
 a.co2=(a.netz+a.nachbar)*.36+a.fossil*.8; // Betriebsbilanz, keine Lebenszyklusanalyse.
 return a;
}
function rhNBAnteil(s=S){
 const all=rhProfile(s).reduce((a,b)=>a+b,0);if(!all)return 0;
 const bs=s.buchten.filter(b=>(b.rhSlot||"").startsWith("pc:")&&Number(b.rhSlot.split(":")[1])>=6);
 if(!bs.length)return 0;
 const sub=rhProfile({...s,buchten:bs}).reduce((a,b)=>a+b,0)-rhGrund(s)*24;
 return kl(sub/all,0,1);
}
function rhNBProfil(s=S){const bs=s.buchten.filter(b=>(b.rhSlot||'').startsWith('pc:')&&Number(b.rhSlot.split(':')[1])>=6);return rhProfile({...s,buchten:bs}).map(k=>Math.max(0,k-rhGrund(s)));}
function rhVorschau(s=S){const r=rh(s),profile=hlProfile(s),ev=hlEvent().id;return rhSim(r,profile.last,s.tag,strompreis(),{profile,hofnacht:true,nachbarProfil:rhNBProfil(s),genAus:r.genAus>0,solarF:ev==='sonne'?1.45:ev==='dunkel'?.35:1,windF:ev==='wind'?1.65:ev==='dunkel'?.2:1,ausfallStunden:ev==='ausfall'&&hofLevel().i>=5?[14,15,16,17]:[]});}
function rhTagesStart(){
 const r=rh();if(r.fuelTage>0){if(--r.fuelTage===0)r.fuelF=1;}
 if(r.genAus>0)r.genAus--;
 if(r.gen>=0){if(rhSeed(S.tag,70)<.07){r.fuelF=1.45;r.fuelTage=4;}
   if(rhSeed(S.tag,71)<.035)r.genAus=2;}
 return rhVorschau();
}
function rhTagBuchen(a,bericht){
 const r=rh();r.soc=a.soc;r.nachbarOffen=rhR(r.nachbarOffen+a.nachbarKosten);
 if(a.last>1&&((a.direkt||0)+(a.entladung||0))>=0.5*a.last)questHook("eigenstrom_tag",null);   /* Ära 8: Hofziel */
 buche(-a.netzKosten,"energie","Rechenhaus: Netzbezug "+rhN(a.netz)+" kWh");
 buche(-a.fuelKosten,"energie","Kraftwerk: Brennstoff "+rhN(a.fossil)+" kWh × "+rhEuro(RH_STROM.brennstoff*r.fuelF));
 buche(-a.wartung,"energie","Wartung Energieanlagen");buche(a.einspeise,"energie","Einspeisung "+rhN(a.export)+" kWh × "+rhEuro(RH_STROM.einspeise));
 buche(-a.leistungspreis,"energie","Netzanschluss-Grundpreis "+r.netzKW+" kW × "+rhEuro(RH_STROM.leistungspreis));
 /* Ära 7.5 (R-25.2): GPUs altern und brauchen Rücklagen wie jede andere Anlage – 3 %/Jahr des
    Anschaffungswerts, dieselbe Logik wie bei Solar, Wind und Speicher. Macht TCO sichtbar. */
 const hwWartung=S.buchten.reduce((n,b)=>n+((GPUS[b.gpu]||{}).preis||0)*(((b.wartungBis||0)>S.tag)?0.5:1),0)*.03/365;   /* Ära 8: gewartete Buchten kosten die Hälfte */
 if(hwWartung>.005){buche(-hwWartung,"energie","Hardware-Wartung & Rücklage (3 %/Jahr)");
   bericht.zeilen.push({t:"🔩 Hardware-Wartung & Rücklage: "+rhEuro(hwWartung)+" für "+S.buchten.length+" Geräte (3 % Anlagenwert pro Jahr).",art:"info"});}
 if(S.tag%30===0&&r.nachbarOffen){buche(-r.nachbarOffen,"energie","Nachbar-Abrechnung: 30-Tage-Monat, Tarif + 10 %");bericht.zeilen.push({t:"🤝 Monatsrechnung vom Nachbarn: "+rhEuro(r.nachbarOffen)+" beglichen.",art:"info"});r.nachbarOffen=0;}
 S.co2+=a.co2;bericht.kwh=rhR(a.last);bericht.ausgaben+=Math.max(0,a.kosten);
 const baseline=a.last*strompreis(),saved=baseline-a.kosten;r.ertrag+=saved;r.letzte={...a,tag:S.tag,tarif:strompreis()};r.verlauf.push({tag:S.tag,kosten:rhR(a.kosten),last:rhR(a.last)});r.verlauf=r.verlauf.slice(-30);
 bericht.zeilen.push({t:"🏡 Rechenhaus: "+rhN(a.last)+" kWh Bedarf · "+rhN(a.direkt)+" kWh direkt von Sonne/Wind · "+rhN(a.entladung)+" kWh aus Akku · Kosten "+rhEuro(a.kosten)+" (Nachbar-Anteil monatlich).",art:"info"});
 if(r.gen>=0&&(r.genAus||r.fuelF>1))bericht.zeilen.push({t:r.genAus?"🔧 Kraftwerk ausgefallen. Netz und Akku übernehmen soweit möglich; "+rhN(a.fehl)+" kWh unversorgt.":"⛽ Brennstoffpreissprung: +45 % für vier Tage. Heute "+rhEuro(a.fuelKosten)+" Brennstoffkosten.",art:"schlecht"});
 if(a.fehl>.001)bericht.zeilen.push({t:"⚡ Energie fehlte: betroffene lokale Arbeiten pausierten. Ausreichend versorgte Modelle und Cloud-Aufträge laufen weiter.",art:"schlecht"});
 /* Ära 7.5 (R-02): Abregelung sichtbar machen – sonst bleibt der Anschlussausbau unverständlich. */
 if(a.abregelung>.05)bericht.zeilen.push({t:"🚧 "+rhN(a.abregelung)+" kWh abgeregelt, weil der Anschluss voll ist ("+rhN(rh().netzKW)+" kW). Ein größerer Anschluss oder mehr Speicher würde diesen Strom aufnehmen.",art:"schlecht"});
 /* Ära 7.5 (R-11): Nachtladung als eigene Zeile, damit die Marge sichtbar wird. */
 if(a.netzladung>.05)bericht.zeilen.push({t:"🌙 Akku mit "+rhN(a.netzladung)+" kWh Nachtstrom zum halben Tarif geladen.",art:"gut"});
}
function rhEventFehlt(stage,index,r=rh()){
 if(stage===1&&index===1&&!(rhPV(r)>=3.6-1e-9||r.wind.length||rhGenKW(r)>=15))return "3,6 kWp Solar, ein Windrad oder 15-kW-Kraftwerk fehlen.";
 if(stage===1&&index===2&&!(r.akku>=20||rhGenKW(r)>=45))return "20 kWh Speicher oder 45-kW-Kraftwerk fehlen.";
 if(stage===2&&index===1&&!(r.wind.filter(i=>i===2).length>=2||rhGenKW(r)>=240))return "Zwei große Windräder oder 240-kW-Kraftwerk fehlen.";
 if(stage===2&&index===2&&!(r.wind.filter(i=>i===2).length>=6&&rhPV(r)>=12-1e-9&&r.akku>=200||rhGenKW(r)>=400))return "Sechs große Windräder, 12 kWp Solar und 200 kWh Speicher – oder 400-kW-Kraftwerk – fehlen.";
 return "";
}
function rhSlotGrund(kind,i,s=S){
 const r=rh(s),c=rhCfg(s);
 if(!Number.isInteger(i)||i<0||i>=(kind==="pc"?c.pc:c.racks))return "Dieser Platz gehört nicht zu dieser Gebäudestufe.";
 if(kind==="pc"){
   const count=rhPCs(s).length+(s.buchten.some(b=>b.rhSlot==="pc:"+i)?0:1);
   if(r.stufe===0&&(i>=6||count>=7)&&!r.nachbar)return "Vor PC 7: Nachbarvertrag und Kabel anschließen.";
   if(r.stufe===0&&(i>=9||count>=10)&&r.pv.length<1)return "Vor PC 10: mindestens ein 400-Watt-Panel aufs Dach.";
 }else{
   const count=r.racks.includes(i)?i+1:Math.max(i+1,r.racks.length+1),events=RH_EVS[r.stufe]||[];
   for(let e=0;e<events.length;e++)if(count>=events[e].ab&&!r.events[r.stufe+":"+e])return "Ausbauereignis „"+events[e].n+"“ zuerst abschließen.";
 }
 return "";
}
function rhSpend(preis,text){if(!Number.isFinite(preis)||preis<0||rhCash()+.001<preis){melde("Es fehlen "+rhEuro(Math.max(0,preis-rhCash()))+". Offene Nachbarkosten bleiben reserviert.","schlecht");return false;}buche(-preis,"rechenhaus",text);return true;}
function rhRefresh(){sichern();alles();zeigeRechenhaus(rhView);}
function rhEvent(i){const r=rh(),e=(RH_EVS[r.stufe]||[])[i];if(!e||r.events[r.stufe+":"+i])return;
 if(i>0&&!r.events[r.stufe+":"+(i-1)]){melde("Erst das vorherige Ausbauereignis abschließen.","schlecht");return;}
 const why=rhEventFehlt(r.stufe,i);if(why){melde(why,"schlecht");return;}
 if(!rhSpend(e.preis,e.n))return;r.events[r.stufe+":"+i]=true;r.netzKW=Math.max(r.netzKW,e.kw);r.invest+=e.preis;rhRefresh();}
function rhKauf(typ,i=0){ if(typeof hofZu==="function"&&hofZu("Einkaufen")) return;   /* v9.9 (R2) */
 const r=rh(),c=rhCfg();let preis=0,action=null,why="";
 if(["solar","solarfeld","panelUpgrade","akku","wind","windUpgrade","generator"].includes(typ)&&!istFrei("gebEnergie")){
   melde("Der Energiegarten öffnet auf Hofstufe 8.","schlecht");return;
 }
 if(typ==="nachbar"){
   if(r.nachbar||r.stufe!==0){melde(r.nachbar?"Nachbarvertrag besteht schon.":"Nachbarvertrag nur im Geräteschuppen.","schlecht");return;}preis=RH_STROM.nachbarPreis;action=()=>{r.nachbar=true;r.netzKW=Math.max(r.netzKW,6+RH_STROM.nachbarKW);};
 }else if(typ==="solar"){
   if(r.pv.length>=c.dach){melde("Das Dach ist voll ("+c.dach+" Plätze) – mehr Solar gibt es mit der nächsten Ausbaustufe oder als Freilandfeld im Rechenzentrum.","schlecht");return;}preis=c.wp===400?45:60;action=()=>{r.pv.push(c.wp);};
 }else if(typ==="solarfeld"){
   if(r.stufe!==2||(r.solarfelder||0)>=6)return;preis=270;action=()=>r.solarfelder=(r.solarfelder||0)+1;
 }else if(typ==="panelUpgrade"){
   if(r.stufe<1||r.pv[i]!==400)return;preis=22;action=()=>r.pv[i]=600;
 }else if(typ==="akku"){
   const step=rhAkkuSchritt(r);
   if(step<=0){melde("Akku ist auf dieser Ausbaustufe voll ("+c.akku+" kWh).","schlecht");return;}preis=step*40;action=()=>{r.akku+=step;};
 }else if(typ==="wind"){
   if(r.stufe<1||r.wind.length>=6||!RH_WIND[i]){melde(r.stufe<1?"Windräder gibt es erst ab dem Nerdtempel (Umbau im Rechenhaus).":"Windpark voll oder unbekannte Größe (0–2).","schlecht");return;}preis=RH_WIND[i].preis;action=()=>r.wind.push(i);
 }else if(typ==="windUpgrade"){
   if(!Number.isInteger(i)||r.wind[i]===undefined||r.wind[i]>=2)return;
   preis=RH_WIND[r.wind[i]+1].preis-RH_WIND[r.wind[i]].preis+150;action=()=>r.wind[i]++;
 }else if(typ==="generator"){
   if(r.stufe<1||!RH_GEN[i]||i<=r.gen){melde(r.stufe<1?"Kraftwerke gibt es erst ab dem Nerdtempel.":"Diese Kraftwerksgröße ist nicht größer als die vorhandene.","schlecht");return;}preis=RH_GEN[i].preis-(r.gen>=0?RH_GEN[r.gen].preis*.6:0);action=()=>r.gen=i;
 }else return;
 if(why){melde(why,"schlecht");return;}if(!rhSpend(preis,"Rechenhaus: "+typ))return;action();r.invest+=preis;
 questHook("rh_kauf",typ);   /* Ära 8: Hofziele */
 melde("Rechenhaus: "+({solar:"Solarmodul aufs Dach",akku:"Akku erweitert",wind:"Windrad gebaut",generator:"Kraftwerk aufgestellt",nachbar:"Nachbarvertrag geschlossen",solarfeld:"Freilandfeld gebaut",upgradepv:"Modul aufgerüstet",windup:"Windrad vergrößert"}[typ]||typ)+" – "+geld(preis)+" gezahlt.","gut");   /* Ära 8: kein stiller Kauf */
 rhRefresh();
}
function rhUpgrade(){
 const r=rh();if(r.stufe>=2)return;
 const move=S.buchten.filter(b=>(b.rhSlot||"").startsWith("pc:")&&(r.stufe===1||Number(b.rhSlot.split(":")[1])>=6));
 if(move.some(b=>b.tier||S.tiere.some(t=>t.training&&t.training.bucht===b.id))){melde("Bitte die umzuziehenden PCs zuerst im Stall freimachen. Kein Modell wird heimlich ausgelagert.","schlecht");return;}
 if(!rhSpend(RH_STUFEN[r.stufe+1].preis,"Umbau zum "+RH_STUFEN[r.stufe+1].name))return;
 move.forEach(b=>{r.lager.push({...b,rhSlot:null});});S.buchten=S.buchten.filter(b=>!move.includes(b));
 r.stufe++;r.netzKW=Math.max(r.netzKW,r.stufe===1?12:100);rhSelected=null;questHook("rh_stufe",String(r.stufe));   /* Ära 8 */
 melde("Der "+rhCfg().name+" ist offen. "+move.length+" PCs sicher eingelagert; Solarpanels und Speicher bleiben erhalten.","gut");rhRefresh();
}
function rhInstall(kind,i,wahl="basis",node=0,lagerId=null){ if(typeof hofZu==="function"&&hofZu("Einkaufen")) return;   /* v9.9 (R2) */
 const r=rh(),why=rhSlotGrund(kind,i);if(why){melde(why,"schlecht");return;}
 if(kind==="rack"&&!r.racks.includes(i)){
   if(!rhSpend(1800,"Serverschrank "+(i+1)+" (leer)"))return;r.racks.push(i);rhRefresh();return;
 }
 if(kind==="rack"&&(!Number.isInteger(node)||node<0||node>3))return;
 const slot=kind==="pc"?"pc:"+i:"rack:"+i+":"+node;
 if(S.buchten.some(b=>b.rhSlot===slot))return;
 let b,preis;
 if(lagerId){const old=r.lager.find(b=>b.id===lagerId);if(!old||kind!=="pc"||!RH_PC_GPUS.includes(old.gpu))return;b={...old,rhSlot:slot};preis=0;}
 else if(kind==="pc"){const p=RH_PC[wahl];if(!p)return;b={...p,rhSlot:slot,miete:false,tier:null};preis=p.preis;delete b.preis;}
 else{const g=GPUS[wahl];if(!g||g.tier<2)return;b={gpu:wahl,cpu:"Server-CPU",ramGB:256,ssdTB:8,rhSlot:slot,miete:false,tier:null};preis=Math.round(g.preis*gpupreisFaktor())+3500;}
 if(rhPeak(b)*rhCfg().pue>rhAnschlussFrei(r)+1e-6){melde(rhAnschlussText(rhPeak(b)*rhCfg().pue),"schlecht");return;}   /* Ära 8: Eigenbonus zählt mit */
 if(!rhSpend(preis,"Hardware: "+GPUS[b.gpu].n+" + "+b.cpu))return;
 if(!b.id){do{b.id="b"+(S.zaehler++);}while(S.buchten.some(x=>x.id===b.id)||r.lager.some(x=>x.id===b.id));}
 S.buchten.push(b);if(lagerId)r.lager=r.lager.filter(x=>x.id!==lagerId);
 questHook("kauf_gpu",null);rhRefresh();
}
/* Ära 7.5 (R-06): Aufrüstpreis = neuer Maximal-PC minus 55 % Restwert des alten PCs –
   dieselbe Restwertquote wie beim Verkauf. 4090-PC 3.900 €, 4080-PC 4.550 €. */
/* Ära 8: Restwert eines ganzen Rechners (GPU + Rest-PC bzw. Knoten) – dieselbe Quote für Verkauf und Inzahlungnahme */
function rhRechnerPreis(b){const pc=Object.values(RH_PC).find(p=>p.gpu===b.gpu);if((b.rhSlot||"").startsWith("pc:")&&pc)return pc.preis;const g=GPUS[b.gpu]||{preis:0};return (b.rhSlot||"").startsWith("rack:")?g.preis+3500:g.preis;}
function rhVerkaufsErloes(b){return Math.round(rhRechnerPreis(b)*RH_ALTWERT*(typeof gpupreisFaktor==="function"?gpupreisFaktor():1));}
function rhPCUpgradeZiel(gpu){return ["rtx3060","rtx4060ti"].includes(gpu)?"basis":["rtx4080","rtx4090"].includes(gpu)?"max":null;}
function rhPCUpgradePreis(gpu){const alt=Object.values(RH_PC).find(p=>p.gpu===gpu),ziel=RH_PC[rhPCUpgradeZiel(gpu)||"max"];return Math.round((ziel.preis-(alt?alt.preis:0)*RH_ALTWERT)/10)*10;}
function rhPCUpgrade(id){const b=S.buchten.find(x=>x.id===id);const zielId=b?rhPCUpgradeZiel(b.gpu):null;if(!b||!zielId||!b.rhSlot.startsWith("pc:")){if(b)melde("Dieser Rechner hat keinen Aufrüstpfad mehr (Maximalausbau).","schlecht");return;}
 if(b.tier||S.tiere.some(t=>t.training&&t.training.bucht===id)){melde("Den PC vor dem Umbau im Stall freimachen.","schlecht");return;}
 const ziel=RH_PC[zielId],neu={...b,...ziel};if((rhPeak(neu)-rhPeak(b))*rhCfg().pue>rhAnschlussFrei()){melde(rhAnschlussText((rhPeak(neu)-rhPeak(b))*rhCfg().pue),"schlecht");return;}
 const preis=rhPCUpgradePreis(b.gpu);
 if(!rhSpend(preis,"PC-Aufrüstung auf "+GPUS[ziel.gpu].n+"; Altteile in Zahlung"))return;Object.assign(b,neu);delete b.preis;melde("Rechner aufgerüstet: "+GPUS[ziel.gpu].n+" für "+geld(preis)+".","gut");rhRefresh();
}
/* Ära 7.5 (R-10): Eingelagerte Geräte sind Eigentum – im Rechenzentrum ohne PC-Plätze bleibt
   der Verkauf die einzige Verwertung. Gleiche Formel wie gpuVerkaufen im Stall. */
function rhLagerVerkauf(id){const r=rh(),b=r.lager.find(x=>x.id===id);if(!b)return;
 const g=GPUS[b.gpu]||{n:"Altgerät",preis:0};
 const erloes=rhVerkaufsErloes(b);   /* Ära 8: ganzer Rechner-Restwert */
 buche(erloes,"anlagenverkauf","Lagergerät verkauft: "+g.n+" · 55 % Restwert");
 r.lager=r.lager.filter(x=>x.id!==id);
 melde(g.n+" aus dem Lager verkauft: "+rhEuro(erloes)+" gutgeschrieben.","gut");rhRefresh();
}
function rhLagern(id){const b=S.buchten.find(x=>x.id===id);if(!b)return;
 if(b.tier||S.tiere.some(t=>t.training&&t.training.bucht===id)){melde("Erst das Modell im Stall herausnehmen.","schlecht");return;}
 rh().lager.push({...b,rhSlot:null});S.buchten=S.buchten.filter(x=>x.id!==id);rhRefresh();
}
function rhModus(m){if(!["reserve","eigen"].includes(m))return;rh().genModus=m;rhRefresh();}
/* Ära 7.5 (R-11): "eigen" lädt nur aus Sonne/Wind, "netz" kauft zusätzlich billigen Nachtstrom.
   Lehrsatz: 0,24 € nachts kaufen, 0,48 € tagsüber sparen – abzüglich 10 % Umlaufverlust
   bleiben rund 0,216 € Marge je kWh. Genau dafür gibt es Heimspeicher. */
function rhAkkuModus(m){if(!["eigen","netz"].includes(m))return;rh().akkuModus=m;rhRefresh();}
let rhView="raum",rhSelected=null;
function rhWaehle(kind,i){rhSelected={kind,i};zeigeRechenhaus("raum");}
function rhBtn(label,action,disabled=false){return '<button class="knopf s" '+(disabled?'disabled ':'')+'onclick="'+action+'">'+label+'</button>';}
function rhSymbol(type,filled=true){
 if(filled&&["pc","rack"].includes(type))return rhObjektSvg(type==="rack"?"serverschrank":"pc");
 const f=filled?"#518e8c":"#c9bca1";
 const inner=type==="pc"?'<rect x="7" y="5" width="43" height="29" rx="3" fill="'+f+'"/><path d="M23 35v7m-9 1h28M6 48h46"/><rect x="55" y="13" width="17" height="36" rx="3" fill="#e4cda3"/><circle cx="63" cy="39" r="3" fill="#83be6c"/>':
 type==="rack"?'<rect x="17" y="3" width="46" height="53" rx="4" fill="'+f+'"/>'+[11,23,35,47].map(y=>'<path d="M24 '+y+'h25"/><circle cx="55" cy="'+y+'" r="2" fill="#92d176" stroke="none"/>').join(""):
 type==="akku"?'<rect x="16" y="8" width="48" height="45" rx="5" fill="#a3be90"/><path d="M30 8V3h20v5M41 15l-9 15h10l-5 15 14-20H40"/>':
 type==="gen"?'<rect x="7" y="23" width="64" height="30" rx="5" fill="#c68e68"/><path d="M13 23V7h8v16M30 31h20m-20 7h20m-20 7h20"/><circle cx="61" cy="37" r="5" fill="#f0c86a"/>':
 type==="solar"?'<path d="M13 7h52l8 36H5Z" fill="#396a83"/><path d="M29 8l-3 35M48 8l5 35M9 25h60M17 43v12m45-12v12" stroke="#add4d4"/>':
 '<path d="M35 54h15L44 22h-4Z" fill="#e8ddc3"/><g class="rhRotor" style="transform-origin:42px 20px"><path d="M42 20L37 0h8ZM42 20l23 8-5 6ZM42 20L20 32l-3-6Z" fill="#ede5ce"/></g><circle cx="42" cy="20" r="4" fill="#d69b56"/>';
 return '<svg viewBox="0 0 80 60" aria-hidden="true" fill="none" stroke="#61482f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'+inner+'</svg>';
}
function rhDachSvg(r){
 const c=RH_STUFEN[r.stufe],cols=r.stufe===0?2:r.stufe===1?3:5,rows=Math.ceil(c.dach/cols);
 // Vermessene Innenfläche der endgültigen Originalstil-Sprites; gleiche Letterbox wie <img>.
 const corners=[[[232,52],[535,24],[629,174],[328,211]],[[199,114],[526,43],[372,264],[74,284]],[[222,79],[511,33],[366,198],[75,220]]][r.stufe];
 const pt=(u,v)=>{const [a,b,d,e]=corners;return [a[0]*(1-u)*(1-v)+b[0]*u*(1-v)+d[0]*u*v+e[0]*(1-u)*v,a[1]*(1-u)*(1-v)+b[1]*u*(1-v)+d[1]*u*v+e[1]*(1-u)*v].map(n=>n.toFixed(2)).join(',');};
 let s='';for(let i=0;i<c.dach;i++){const col=i%cols,row=Math.floor(i/cols),u=(col+.07)/cols,v=(row+.08)/rows,U=(col+.93)/cols,V=(row+.92)/rows;
 s+='<polygon points="'+[pt(u,v),pt(U,v),pt(U,V),pt(u,V)].join(' ')+'" fill="'+(r.pv[i]?'#40647b':'#fff0cb')+'" fill-opacity="'+(r.pv[i]?'.97':'.19')+'" stroke="'+(r.pv[i]?'#b9d4ca':'#815c3a')+'" stroke-width="2" '+(!r.pv[i]?'stroke-dasharray="4 4"':'')+'/>';}
 return '<svg class="rhDach" viewBox="0 0 768 '+(r.stufe===1?572:512)+'" aria-hidden="true">'+s+'</svg>';
}
function rhAussenMarkup(r,detail=false){
 const c=RH_STUFEN[r.stufe];
 return '<div class="rhAussen stufe'+r.stufe+(detail?' detail':'')+'">'+
 '<div class="rhWindpark" aria-label="'+r.wind.length+' Windräder">'+r.wind.map(i=>'<span class="rhWind w'+i+'" title="Windrad '+RH_WIND[i].kw+' kW">'+rhObjektBild(['wind_klein','wind_mittel','wind_gross'][i])+'<small>'+RH_WIND[i].kw+' kW</small></span>').join('')+'</div>'+
 (r.nachbar?rhObjektBild('nachbarkabel','class="rhKabel" title="Das Kabel vom Nachbarn"'):'')+
 '<button class="rhHaus" onclick="zeigeRechenhaus(\'raum\')" aria-label="Rechenhaus betreten: '+c.name+'"><img src="'+bild(c.bild)+'" alt="'+c.name+' im Aquarellstil">'+rhDachSvg(r)+'<span class="rhSchild">Rechenhaus<small>'+c.name+'</small></span></button>'+
 '<div class="rhNeben">'+(r.stufe>0?'<button onclick="zeigeRechenhaus(\'ausbau\')" title="Netzanschluss und Transformator">'+rhObjektBild('transformator')+'<small>'+r.netzKW+' kW Netz</small></button>':r.nachbar?'<button onclick="zeigeRechenhaus(\'ausbau\')" title="Stromverteiler für den Nachbaranschluss">'+rhObjektBild('stromverteiler')+'<small>'+r.netzKW+' kW Anschluss</small></button>':'')+(r.akku?'<button onclick="zeigeRechenhaus(\'energie\')" title="Akku '+r.akku+' kWh">'+rhObjektBild("akku")+'<small>'+r.akku+' kWh</small></button>':'')+(r.gen>=0?'<button class="'+(r.genAus?'defekt':'')+'" onclick="zeigeRechenhaus(\'energie\')" title="Kraftwerk '+rhGenKW(r)+' kW">'+rhObjektBild("kraftwerk")+'<small>'+rhGenKW(r)+' kW'+(r.genAus?' · defekt':'')+'</small></button>':'')+
 (r.legacySolar?'<button onclick="zeigeRechenhaus(\'energie\')" title="Übernommene Bestands-Solaranlage">'+rhObjektBild("solarfeld")+'<small>Bestand '+rhN(r.legacySolar)+' kWp</small></button>':'')+'</div>'+
 '<div class="rhFelder">'+Array.from({length:r.solarfelder||0},(_,i)=>'<button onclick="zeigeRechenhaus(\'energie\')" title="Solarfeld '+(i+1)+': 4 × 600 W, 2,4 kWp">'+rhObjektBild('solarfeld')+'</button>').join('')+'</div></div>';
}
function rhAussenNeu(){
 let e=document.getElementById("rechenhausWelt");if(!e){e=document.createElement("div");e.id="rechenhausWelt";document.getElementById("welt").appendChild(e);}
 e.innerHTML=rhAussenMarkup(rh());
 rhHintergrundNeu();
 /* Ära 8: Tiefensortierung – jedes Objekt bekommt den z-index seiner Fußlinie (gleiche Skala wie die Tiere: y % × 10) */
 try{const welt=document.getElementById("welt"),wr=welt.getBoundingClientRect();if(wr.height>8)e.querySelectorAll(".rhHaus,.rhWind,.rhFelder button,.rhNeben button").forEach(el=>{const er=el.getBoundingClientRect();if(er.height<2)return;el.style.zIndex=Math.round((er.bottom-wr.top)/wr.height*100*10);});}catch(x){}
 if(typeof _hindCache!=="undefined"){_hindCache=null;} if(typeof _hausKey!=="undefined"){_hausKey="";}
}
function rhPlatzDetails(){
 const r=rh();if(!rhSelected)return '<div class="rhLeerwahl"><b>Ein kleiner Raum für große Ideen.</b><p>Wähle einen Platz im Grundriss. Goldene Plätze sind frei, blaue belegt; ein Schloss erklärt die nächste Ausbaubedingung.</p></div>';
 const {kind,i}=rhSelected,slot=kind+":"+i,b=S.buchten.find(b=>b.rhSlot===slot),why=rhSlotGrund(kind,i);
 let s='<h3>'+(kind==="pc"?'PC-Platz ':'Serverschrank ')+(i+1)+'</h3>';
 if(why&&(kind==="pc"?!b:!r.racks.includes(i)))return s+'<p class="rhWarn">'+esc(why)+'</p>'+rhBtn("Zum Ausbauplan","zeigeRechenhaus('ausbau')");
 if(kind==="pc"&&b){const up=rhPCUpgradePreis(b.gpu);
   return s+rhHardwareDetails(b)+rhBtn("Modell zuweisen","buchtFuellen('"+b.id+"')",!!b.tier)+rhBtn("Im Stall öffnen","oeffne('stall')")+(["rtx4080","rtx4090"].includes(b.gpu)?rhBtn("Aufrüsten · "+rhEuro(up),"rhPCUpgrade('"+b.id+"')",rhCash()<up):'')+rhBtn("Einlagern","rhLagern('"+b.id+"')",!!b.tier);}
 /* Ära 7.5 (R-07): fünf Preisstufen vom 700-€-Dachbodenrechner bis zum Maximal-PC. */
 if(kind==="pc")return s+'<p>Ein Rechner, eine GPU. Stromanschluss und freies Guthaben werden beim Einbau erneut geprüft. Der Preis ist GPU-Katalogpreis plus Restausstattung.</p>'+Object.entries(RH_PC).map(([id,p])=>'<div class="rhAngebot"><b>'+GPUS[p.gpu].n+'</b><span>'+p.cpu+' · '+p.ramGB+' GB RAM · '+p.ssdTB+' TB NVMe · '+GPUS[p.gpu].vram+' GB VRAM</span>'+rhBtn("Einbauen · "+rhEuro(p.preis),"rhInstall('pc',"+i+",'"+id+"')",rhCash()<p.preis)+'</div>').join('')+r.lager.filter(b=>RH_PC_GPUS.includes(b.gpu)).map(b=>rhBtn("Aus Lager: "+GPUS[b.gpu].n,"rhInstall('pc',"+i+",'basis',0,'"+b.id+"')")).join('');
 if(!r.racks.includes(i))return s+'<p>Ein leerer Schrank kostet 1.800 €. Vier getrennte Serverknoten passen hinein. Erst eingebaute Knoten rechnen.</p>'+rhBtn("Schrank aufstellen · 1.800 €","rhInstall('rack',"+i+")",rhCash()<1800);
 return s+'<p>Vier Serverknoten, jeweils eigene GPU, 256 GB RAM und 8 TB NVMe. Kein automatisches Zusammenlegen von VRAM.</p>'+Array.from({length:4},(_,n)=>{const b=S.buchten.find(b=>b.rhSlot===slot+":"+n);return '<div class="rhNode"><b>Knoten '+(n+1)+'</b>'+(b?rhHardwareDetails(b)+rhBtn("Belegen","buchtFuellen('"+b.id+"')",!!b.tier)+rhBtn("Einlagern","rhLagern('"+b.id+"')",!!b.tier):'<label>GPU wählen <select id="rhGpu'+n+'">'+Object.entries(GPUS).filter(([id,g])=>g.tier>=2).map(([id,g])=>'<option value="'+id+'">'+g.n+' · '+rhEuro(g.preis*gpupreisFaktor()+3500)+'</option>').join('')+'</select></label>'+rhBtn("Serverknoten installieren","rhInstall('rack',"+i+",document.getElementById('rhGpu"+n+"').value,"+n+")"))+'</div>';}).join('');
}
function rhHardwareDetails(b){const p=S.tiere.find(t=>t.uid===b.tier);return '<div class="rhDaten"><b>'+esc(GPUS[b.gpu].n)+'</b><span>'+esc(b.cpu||'Bestands-CPU')+' · '+b.ramGB+' GB RAM · '+b.ssdTB+' TB NVMe</span><span>'+GPUS[b.gpu].vram+' GB VRAM · ganze Einheit bis '+rhN(rhPeak(b)*1000,0)+' W (Spielprofil)</span><span>'+(p?esc(p.name)+' · '+p.status:'Kein Modell geladen')+'</span></div>';}
function rhRaum(){
 const r=rh(),c=rhCfg();
 const slot=(kind,i)=>{const filled=kind==="pc"?S.buchten.some(b=>b.rhSlot==="pc:"+i):r.racks.includes(i),why=rhSlotGrund(kind,i),sel=rhSelected&&rhSelected.kind===kind&&rhSelected.i===i;
 const count=kind==="rack"?S.buchten.filter(b=>(b.rhSlot||'').startsWith('rack:'+i+':')).length:0;
 return '<button class="rhSlot '+(filled?'belegt':'frei')+(why&&!filled?' gesperrt':'')+(sel?' aktiv':'')+'" onclick="rhWaehle(\''+kind+'\','+i+')" aria-label="'+(kind==='pc'?'PC-Platz ':'Rack ')+(i+1)+': '+(filled?'belegt':why?'gesperrt':'frei')+'" title="'+esc(why||'Platz auswählen')+'">'+rhSymbol(kind,filled)+'<b>'+(kind==='pc'?'PC ':String.fromCharCode(65+Math.floor(i/8)))+(kind==='pc'?i+1:i%8+1)+'</b><small>'+(filled?(kind==='rack'?count+'/4 Knoten':'installiert'):why?'🔒':'＋')+'</small></button>';};
 return '<img class="rhThemenbild" src="'+bild('hardware')+'" alt="Gezeichnete Hardware-Werkstatt mit GPU-Rechner, Serverrack und Kleinstrechner" onerror="this.remove()"><div class="rhRaumLayout"><div><div class="rhGrundriss stufe'+r.stufe+'" style="background-image:url(\''+bild('rh_raum')+'\')">'+
 (c.pc?'<div class="rhPcGrid">'+Array.from({length:c.pc},(_,i)=>slot('pc',i)).join('')+'</div>':'')+
 (c.racks?'<div class="rhRackGrid '+(r.stufe===2?'gross':'')+'">'+Array.from({length:c.racks},(_,i)=>slot('rack',i)).join('')+'</div>':'')+'</div><p class="rhLegende">Draufsicht · '+c.pc+' PC-Plätze'+(c.racks?' · '+c.racks+' Schrankplätze':'')+' · Auswahl auch mit Tab und Enter</p></div><aside class="rhInspector" aria-live="polite">'+rhPlatzDetails()+'</aside></div>'+
 /* Ära 7.5 (R-10): Lagergeräte lassen sich jederzeit zu 55 % Restwert verkaufen – im
    Rechenzentrum ohne PC-Plätze ist das die einzige Verwertung. */
 (r.lager.length?'<details class="rhInfo"><summary>Lager · '+r.lager.length+' Geräte bleiben dein Eigentum</summary>'+r.lager.map(b=>'<div>'+esc(GPUS[b.gpu].n)+' · '+b.ramGB+' GB RAM · '+b.ssdTB+' TB NVMe'+(!RH_PC_GPUS.includes(b.gpu)?rhBtn('Server aus Lager einsetzen',"rhServerAusLager('"+b.id+"')"):'')+rhBtn('Verkaufen · 55 % Restwert · '+rhEuro(Math.round(((GPUS[b.gpu]||{}).preis||0)*RH_ALTWERT*(typeof gpupreisFaktor==="function"?gpupreisFaktor():1))),"rhLagerVerkauf('"+b.id+"')")+'</div>').join('')+'<p>Ein Verkauf ist endgültig. Der Erlös folgt derselben 55-%-Regel wie im Stall und schwankt mit dem GPU-Marktpreis.</p></details>':'')+
 (S.buchten.some(b=>(b.rhSlot||'').startsWith('bestand:'))?'<details class="rhInfo"><summary>Bestandsanbau aus deinem bisherigen Spielstand</summary><p>Bestehende Geräte, Mieten und Modelle bleiben aktiv. Der Anbau belegt keine neuen Plätze, wird aber vollständig mit Strom versorgt. Neue Käufe unterliegen den neuen Grenzen.</p>'+S.buchten.filter(b=>b.rhSlot.startsWith('bestand:')).map(rhHardwareDetails).join('')+'</details>':'');
}
function rhServerAusLager(id){const r=rh(),b=r.lager.find(x=>x.id===id);if(!b||r.stufe===0)return;
 for(const i of r.racks)for(let n=0;n<4;n++){const slot='rack:'+i+':'+n;if(S.buchten.some(x=>x.rhSlot===slot))continue;
   if(rhPeak(b)*rhCfg().pue>rhAnschlussFrei(r)){melde(rhAnschlussText(rhPeak(b)*rhCfg().pue),'schlecht');return;}
   S.buchten.push({...b,rhSlot:slot});r.lager=r.lager.filter(x=>x.id!==id);rhRefresh();return;}
 melde('Bitte zuerst einen Schrank mit freiem Knotenplatz aufstellen.','schlecht');}
/* Ära 8: Strom-Leiste – Anschluss, Last, Eigenbonus, freie Leistung, was noch passt, was sich lohnt */
function rhOptionen(){const r=rh(),c=rhCfg(),v=(r.letzte&&r.letzte.last)?r.letzte:null;const tagBedarf=v?Math.max(0,v.last-(v.direkt||0)-(v.entladung||0)):rhLast()*0.6*14;const preis=strompreis();const sf=(typeof saison==="function"&&RH_SAISON_PV[saison().id])||1;
 const o=[];const pvTag=(wp)=>wp/1000*2.9*sf;const wert=(kwh)=>Math.min(kwh,tagBedarf)*preis+Math.max(0,kwh-Math.min(kwh,tagBedarf))*RH_STROM.einspeise;
 if(r.pv.length<c.dach){const p=c.wp===400?45:60;const e=wert(pvTag(c.wp))-p*0.01/365;o.push({n:"Solarmodul "+c.wp+" Wp",preis:p,tag:e,bonus:c.wp/1000*RH_STROM.eigenF.pv});}
 if(r.stufe===2&&(r.solarfelder||0)<6){const e=wert(pvTag(2400))-270*0.01/365;o.push({n:"Freilandfeld 2,4 kWp",preis:270,tag:e,bonus:2.4*RH_STROM.eigenF.pv});}
 if(r.stufe>=1&&r.wind.length<6)RH_WIND.forEach((w,i)=>{const kwh=w.kw*w.cf*0.25*24;const e=wert(kwh)-w.preis*0.02/365;o.push({n:"Windrad "+["klein","mittel","groß"][i]+" "+w.kw+" kW",preis:w.preis,tag:e,bonus:w.kw*w.cf*0.25*RH_STROM.eigenF.wind});});
 if(r.akku<c.akku){const step=Math.min(5,c.akku-r.akku);const e=Math.min(step,tagBedarf*0.4)*(preis-preis*0.5/0.9);o.push({n:"Akku +"+step+" kWh",preis:step*40,tag:e,bonus:step/2*RH_STROM.eigenF.akku});}
 if(r.stufe===0&&!r.nachbar)o.push({n:"Nachbarvertrag +"+RH_STROM.nachbarKW+" kW",preis:RH_STROM.nachbarPreis,tag:-RH_STROM.nachbarKW*RH_STROM.leistungspreis,bonus:RH_STROM.nachbarKW});
 if(r.gen<0&&r.stufe>=1){const g=RH_GEN[0];const e=(preis>RH_STROM.brennstoff?Math.min(g.kw*14,tagBedarf)*(preis-RH_STROM.brennstoff):0)-g.preis*0.04/365;o.push({n:"Kraftwerk "+g.kw+" kW",preis:g.preis,tag:e,bonus:g.kw*0.5});}
 o.forEach(x=>{x.amort=x.tag>0?Math.round(x.preis/x.tag):null;});return o.sort((a,b)=>(a.amort||9e9)-(b.amort||9e9));}
function rhStromLeisteHtml(kompakt){const r=rh(),c=rhCfg(),last=rhLast(),bonus=rhEigenBonus(r),frei=r.netzKW+bonus-last,gesamt=r.netzKW+bonus;
 const pb=(x)=>Math.max(0,Math.min(100,x/Math.max(0.01,gesamt)*100));
 const passt=Object.entries(RH_PC).map(([k,p])=>({n:GPUS[p.gpu].n.replace(/ \(.*\)/,"")+"-PC",kw:rhPeak({gpu:p.gpu,rhSlot:"pc:0",ramGB:p.ramGB})*c.pue,preis:p.preis})).concat(r.stufe>0?Object.entries(GPUS).filter(([id,g])=>g.tier>=2&&g.tier<=4).map(([id,g])=>({n:g.n+"-Knoten",kw:rhPeak({gpu:id,rhSlot:"rack:0:0",ramGB:256})*c.pue,preis:g.preis+3500})):[]);
 const ok=passt.filter(x=>x.kw<=frei+1e-6),nicht=passt.filter(x=>x.kw>frei+1e-6);
 const opt=rhOptionen().slice(0,3);
 return '<div class="karte rhStromLeiste"><h3>⚡ Strom & Anschluss <span class="merk '+(frei<0.5?"schlecht":frei<1.5?"":"gut")+'">'+rhN(frei,2)+' kW frei</span></h3>'+
  '<div class="rhStromBar" title="Anschluss '+r.netzKW+' kW + Eigenbonus '+rhN(bonus,2)+' kW"><span class="rhStromLast" style="width:'+pb(last)+'%"></span><span class="rhStromEigen" style="width:'+pb(bonus)+'%"></span></div>'+
  '<p>Netzanschluss <b>'+r.netzKW+' kW</b> (Grundpreis '+rhEuro(r.netzKW*RH_STROM.leistungspreis)+'/Tag) · Eigenbonus <b>'+rhN(bonus,2)+' kW</b> (Sonne/Wind/Akku entlasten bis '+Math.round(RH_STROM.eigenBonusMax*100)+' %) · Last <b>'+rhN(last,2)+' kW</b> (Spitze × PUE '+c.pue+' + Grundlast '+rhN(rhGrund(),2)+' kW)'+(r.letzte?' · gestern '+rhN(r.letzte.last)+' kWh = '+rhEuro(r.letzte.kosten):'')+'</p>'+
  (kompakt?'':'<p><b>Passt noch:</b> '+(ok.length?ok.map(x=>x.n+' ('+rhN(x.kw,2)+' kW)').join(", "):"nichts – erst Anschluss oder Eigenstrom ausbauen")+(nicht.length?' · <b>Zu groß:</b> '+nicht.slice(0,3).map(x=>x.n+' ('+rhN(x.kw,2)+' kW)').join(", "):"")+'</p>'+
  '<p><b>Was sich jetzt lohnt:</b> '+(opt.length?opt.map(x=>x.n+' – '+rhEuro(x.preis)+(x.amort?', spart ≈ '+rhEuro(x.tag)+'/Tag, Amortisation ≈ '+x.amort+' Tage':x.tag<0?', kostet '+rhEuro(-x.tag)+'/Tag Grundpreis':', spart heute nichts')+' (+'+rhN(x.bonus,2)+' kW Anschlussbonus)').join(" · "):"–")+'</p>')+'</div>';}
function rhStromHofbuchHtml(){const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));const R=RH_STROM;
 let h='<p><b>⚡ Strom von vorn bis hinten (Ära 8):</b></p><ul>'+
 '<li><b>Anschluss = Grenze.</b> Jeder Rechner braucht Spitzenleistung × PUE der Gebäudestufe; die Summe plus Grundlast darf den Netzanschluss plus Eigenbonus nicht übersteigen. Start: '+6+' kW (Geräteschuppen), Nachbarvertrag +'+R.nachbarKW+' kW für '+rhEuro(R.nachbarPreis)+' (+'+Math.round(R.nachbarAufschlag*100)+' % auf den Nachbaranteil, nur im Schuppen), Nerdtempel 12 kW und Ausbau-Ereignisse '+RH_EVS[1].map(x=>x.kw+" kW/"+rhEuro(x.preis)).join(", ")+', Rechenzentrum 100 kW und '+RH_EVS[2].map(x=>x.kw+" kW/"+rhEuro(x.preis)).join(", ")+'.</li>'+
 '<li><b>Eigenbonus.</b> Solar (kWp × '+R.eigenF.pv+'), Wind (Mittelleistung × '+R.eigenF.wind+') und Akku (Entladeleistung × '+R.eigenF.akku+') entlasten den Anschluss, zusammen höchstens '+Math.round(R.eigenBonusMax*100)+' % der Netzleistung. So passt mit drei Solarmodulen ein Rechner mehr, ohne den teureren Anschluss.</li>'+
 '<li><b>Grundpreis.</b> Der Netzanschluss kostet '+rhEuro(R.leistungspreis)+' je kW und Tag (6 kW = '+rhEuro(6*R.leistungspreis)+', 100 kW = '+rhEuro(100*R.leistungspreis)+', 600 kW = '+rhEuro(600*R.leistungspreis)+'). Eigenstrom zahlt keinen Grundpreis.</li>'+
 '<li><b>Arbeitspreis.</b> Netzstrom '+rhEuro(0.48)+'/kWh tags, nachts (22–6 Uhr) die Hälfte; Wetterlage „Teure Netzstunden“ ×1,6; Ereignisse multiplizieren. Einspeisung bringt '+rhEuro(R.einspeise)+'/kWh – eigene kWh zuerst selbst verbrauchen.</li>'+
 '<li><b>Verbrauch.</b> Auftrag 14 h × 60 % der Spitze, Training 95 %, Nachtplan 95 %, Leerlauf 45 W je belegter Bucht; PUE Schuppen '+RH_STUFEN[0].pue+', Nerdtempel '+RH_STUFEN[1].pue+', Rechenzentrum '+RH_STUFEN[2].pue+'; Grundlast '+RH_STUFEN[0].grund+' / '+RH_STUFEN[1].grund+' / '+RH_STUFEN[2].grund+' kW + '+R.grundRack+' kW je Schrank.</li>'+
 '<li><b>Erzeugung.</b> Solar 2,9 kWh je kWp und Normtag (Saison '+Object.entries(RH_SAISON_PV).map(([k,v])=>k+" ×"+v).join(", ")+'), Module '+RH_STUFEN.map(x=>x.dach+"×"+x.wp+" Wp").join(" / ")+' je Stufe, Freilandfeld 2,4 kWp für '+rhEuro(270)+' (Rechenzentrum). Wind '+RH_WIND.map(w=>w.kw+" kW/"+rhEuro(w.preis)+" (cf "+w.cf+")").join(", ")+' ab Nerdtempel, Normjahr 25 % Auslastung. Akku '+rhEuro(40)+'/kWh, Wirkungsgrad 90 %, Nachtladung nur im Modus „Netz“. Kraftwerk '+RH_GEN.map(g=>g.kw+" kW/"+rhEuro(g.preis)).join(", ")+', Brennstoff '+rhEuro(R.brennstoff)+'/kWh – läuft, sobald Netzstrom teurer ist, sonst Reserve bei Netzausfall.</li>'+
 '<li><b>Wartung.</b> Solar/Akku 1 %, Wind 2 %, Kraftwerk 4 % des Kaufpreises je Jahr; GPUs 3 % je Jahr (nach Nacht-Wartung 10 Tage halb).</li>'+
 '<li><b>Entscheidung.</b> Ein weiteres stromhungriges Tier braucht einen Rechner, der in den Anschluss passen muss – die Strom-Leiste im Stall zeigt, was noch passt und welche Anlage sich zuerst lohnt.</li></ul>';
 return h;}
function rhAusbau(){const r=rh(),c=rhCfg();return rhStromLeisteHtml()+'<div class="rhAusbaufolge">'+RH_STUFEN.map((c,i)=>'<div class="'+(i===r.stufe?'aktuell':'')+'"><img src="'+bild(c.bild)+'" alt=""><b>'+c.name+'</b><span>'+c.pc+' PCs · '+c.racks+' Schränke</span></div>').join('')+'</div>'+
 '<div class="karte"><h3>Dein nächster Bauabschnitt</h3>'+(r.stufe<2?'<p>Umbau zum <b>'+RH_STUFEN[r.stufe+1].name+'</b> · '+rhEuro(RH_STUFEN[r.stufe+1].preis)+'. '+(r.stufe===0?'PC-Plätze 7–12 wandern ins Lager.':'Alle sechs PC-Plätze wandern ins Lager; vorhandene Racks bleiben stehen. <b>Im Rechenzentrum gibt es keine PC-Plätze mehr; eingelagerte PCs lassen sich nur noch verkaufen (55 % Restwert) – plane den Umbau erst, wenn du die Rechner wirklich nicht mehr brauchst.</b>')+' Belegte Geräte müssen vorher im Stall freigemacht werden. Akkus und vorhandene Module bleiben erhalten; 400-W-Module werden nicht gratis zu 600-W-Modulen.</p>'+rhBtn('Gebäude ausbauen','rhUpgrade()',rhCash()<RH_STUFEN[r.stufe+1].preis):'<p>Das Rechenzentrum hat acht Reihen A–H mit jeweils acht Schränken. Voll belegt: 256 getrennte GPU-Knoten.</p>')+'</div>'+
 (r.stufe===0?'<div class="rhEvents"><article><b>1 · Der vorhandene Anschluss</b><p>PC 1–6: kein zusätzlicher Anschlussbau. Stromverbrauch wird zum Normaltarif bezahlt.</p><span class="merk gut">6 kW vorhanden</span></article><article><b>2 · Ein Kabel über den Gartenzaun</b><p>Vor PC 7: Nachbarvertrag für 350 €. Zusatz-PCs 7–12 zahlen ihren Anteil des Netzstroms zum Tagestarif +10 %, Abrechnung alle 30 Hoftage.</p>'+rhBtn(r.nachbar?'Vertrag aktiv':'Vertrag abschließen · 350 €',"rhKauf('nachbar')",r.nachbar||rhCash()<350)+'</article><article><b>3 · Ein Sonnenplatz auf dem Dach</b><p>Vor PC 10: mindestens ein 400-W-Panel. Vier Dachplätze, optional bis 10 kWh Akku. Das Panel deckt nur einen Teil des Verbrauchs.</p>'+rhBtn('Zum Energiegarten',"zeigeRechenhaus('energie')")+'</article></div>':'<div class="rhEvents">'+RH_EVS[r.stufe].map((e,i)=>{const done=r.events[r.stufe+':'+i],why=rhEventFehlt(r.stufe,i),prev=i===0||r.events[r.stufe+':'+(i-1)];return '<article><b>'+ (i+1)+' · '+e.n+'</b><p>'+e.txt+'</p><p>Leitungsbau: '+rhEuro(e.preis)+'</p>'+(why?'<small class="rhWarn">'+why+'</small>':'')+rhBtn(done?'Abgeschlossen':'Anschluss freischalten','rhEvent('+i+')',done||!!why||!prev||rhCash()<e.preis)+'</article>';}).join('')+'</div>')+
 '<div class="notiz">Die Anschlussereignisse sind Spielregeln, keine technischen Naturgesetze. Auch auf dem erneuerbaren Weg bleibt das Netz als verlässliche Reserve erhalten. Ein Akku erzeugt keine Energie.</div>';}
function rhAmort(r,next,preis){
 const profile=hlProfile(),load=profile.last,tarif=.48,opts={normal:true,soc:0,fuelF:1,hofnacht:true,profile,nachbarProfil:rhNBProfil()};
 // 7 Tage einschwingen, letzte 7 Tage vergleichen: neuer Akku kommt leer, kein Gratisstrom.
 let a={...r,soc:0},b={...next,soc:0},old=0,neu=0;
 for(let d=0;d<14;d++){const x=rhSim(a,load,1,tarif,{...opts,soc:a.soc}),y=rhSim(b,load,1,tarif,{...opts,soc:b.soc});a.soc=x.soc;b.soc=y.soc;if(d>=7){old+=x.kosten;neu+=y.kosten;}}
 const delta=(old-neu)/7,years=delta>0?preis/(delta*365):Infinity;
 /* Ära 7.5 (R-05): Fachliche Ehrlichkeit statt falscher Wirtschaftlichkeitsaussage. Die Baupreise
    sind ein Zehntel der Marktpreise, also dauert die reale Amortisation rund zehnmal so lange. */
 const tage=Math.ceil(years*365),real=years<=25?' (Spielpreise = ein Zehntel der Marktpreise – real ≈ '+rhN(tage*10,0)+' Hoftage ≈ '+rhN(tage*10/365,1)+' Jahre)':'';
 return (delta>0?'≈ '+rhEuro(delta)+'/Tag weniger · '+(years<=25?'Amortisation ≈ '+tage+' Hoftage'+real:'keine Amortisation binnen 9.125 Hoftagen'):'Bei dieser Auslastung keine Betriebskosten-Ersparnis')+'.';
}
function rhEnergie(){
 if(!istFrei("gebEnergie")) return '<div class="leer">🔒 Der Energiegarten öffnet auf Hofstufe 8. Bis dahin kommt der Rechenbetrieb aus dem normalen Netzanschluss.</div>';
 const r=rh(),c=rhCfg(),a=rhVorschau(),roof=r.pv.length,add=(c.wp===400?45:60),batStep=rhAkkuSchritt(r);
 const stats=[['Anschluss',rhN(r.netzKW)+' kW','gesichert, in beide Richtungen'],['Installierte Spitzenlast',rhN(rhLast())+' kW','inkl. Rechner & Kühlung'],['Heute voraussichtlich',rhN(a.last)+' kWh','24 Stunden, aktueller Einsatz'],['Kosten heute',rhEuro(a.kosten),'inkl. Wartung, ohne Baukosten'],['Akku',rhN(r.soc)+' / '+r.akku+' kWh','Leistung max. '+rhN(r.akku/2)+' kW'],['Nachbar offen',rhEuro(r.nachbarOffen),'nächste Rechnung Tag '+(Math.floor((S.tag-1)/30)+1)*30]];
 /* Ära 7.5 (R-24): Prognosestreifen für morgen und übermorgen – erst damit ist Lastverschiebung planbar. */
 const vor=rhPrognose(2),namen=['Morgen','Übermorgen'];
 const streifen='<div class="notiz"><b>Wetterprognose:</b> '+vor.map((p,i)=>namen[i]+' (Hoftag '+p.tag+'): '+p.n+' · Solar ×'+rhN(p.pvF,2)+' · Wind ×'+rhN(p.windF,2)).join(' · ')+'. Prognosen sind in der Realität unsicher; im Spiel sind sie exakt, damit sich Arbeit gezielt in gute Tage verschieben lässt.</div>';
 return '<img class="rhThemenbild" src="'+bild('stromfluss')+'" alt="Gezeichneter Stromweg von Sonne und Wind über den Akku zum Rechenstall" onerror="this.remove()"><div class="notiz">Spielbalance: Solar, Wind und Akku kosten ein Zehntel der früheren Baupreise; Erzeugung und Verluste bleiben physikalisch unverändert. Beispiel: 400-W-Panel 45 €, 5-kWh-Akku 200 €. Real dauert die Amortisation einer PV-Anlage 8–12 Jahre – im Spiel entsprechend rund ein Zehntel davon. Alte bezahlte Anlagen bleiben erhalten. Das sind Spielpreise, keine realen Angebote.</div>'+streifen+hlBtn('⚡ Modelle & Nachtstrom zuweisen','zeigeEnergieplan()')+'<div class="rhStats">'+stats.map(x=>'<div><small>'+x[0]+'</small><b>'+x[1]+'</b><span>'+x[2]+'</span></div>').join('')+'</div>'+
 '<div class="rhEnergieLayout"><div class="rhMiniHof">'+rhAussenMarkup(r,true)+'</div><div class="rhBilanz"><h3>Wohin der Strom fließt</h3><p>'+a.wetter+' · Saison-Solarfaktor ×'+rhN(a.saisonF,2)+' · deterministisches Spielwetter</p>'+[['Bedarf',a.last],['Solar erzeugt',a.pv],['Wind erzeugt',a.wind],['Direkt genutzt',a.direkt],['In Akku geladen',a.ladung],['davon Nachtstrom aus dem Netz',a.netzladung],['Aus Akku geliefert',a.entladung],['Speicherverluste',a.verlust],['Netz (inkl. Nachbar)',a.netz+a.nachbar],['Fossil erzeugt',a.fossil],['Eingespeist',a.export],['Abgeregelt, weil der Anschluss voll ist',a.abregelung],['Nicht versorgt',a.fehl]].map(([k,v])=>'<div><span>'+k+'</span><b>'+rhN(v)+' kWh</b></div>').join('')+'</div></div>'+
 '<div class="rhStunden" aria-label="Stündlicher Bedarf und erneuerbare Erzeugung">'+a.stunden.map(h=>{const max=Math.max(...a.stunden.map(x=>Math.max(x.last,x.pv+x.wind)),.1);return '<div title="'+h.h+' Uhr: Bedarf '+rhN(h.last,2)+' kW; Sonne/Wind '+rhN(h.pv+h.wind,2)+' kW"><i style="height:'+h.last/max*70+'px"></i><u style="height:'+(h.pv+h.wind)/max*70+'px"></u><small>'+h.h+'</small></div>';}).join('')+'</div><p class="rhLegende">24 Stunden · Braun: Bedarf · Grün: Sonne + Wind. Überschüsse laden zuerst den Akku, danach Einspeisung.</p>'+
 '<div class="rhShop"><article>'+rhObjektBild(c.wp===400?'solarpanel_400w':'solarpanel_600w')+'<h3>Das Sonnendach</h3><p>'+roof+'/'+c.dach+' Module · '+rhN(rhPV(r))+' kWp gesamt. '+c.wp+' W je neuem Panel.</p>'+rhBtn(roof>=c.dach?'Dach vollständig belegt':'Panel montieren · '+rhEuro(add),"rhKauf('solar')",roof>=c.dach||rhCash()<add)+(roof<c.dach?'<p class="rhPayback">'+rhAmort(r,{...r,pv:[...r.pv,c.wp]},add)+'</p>':'')+r.pv.map((w,i)=>'<span class="rhPanelTag">'+(i+1)+': '+w+' W'+(w===400&&r.stufe>0?rhBtn('→ 600 W · 22 €',"rhKauf('panelUpgrade',"+i+")",rhCash()<22):'')+'</span>').join('')+'</article>'+
 (r.stufe===2?'<article>'+rhObjektBild('solarfeld')+'<h3>Die Sonnenwiese</h3><p>'+r.solarfelder+'/6 Freilandfelder. Pro Feld 4 × 600 W = 2,4 kWp, einschließlich Gestell. Die 10 Dachplätze bleiben davon getrennt.</p>'+rhBtn(r.solarfelder>=6?'Alle Felder bepflanzt':'Solarfeld aufstellen · 270 €',"rhKauf('solarfeld')",r.solarfelder>=6||rhCash()<270)+(r.solarfelder<6?'<p class="rhPayback">'+rhAmort(r,{...r,solarfelder:r.solarfelder+1},270)+'</p>':'')+'<p>Für die letzte Ausbaustufe brauchst du insgesamt 12 kWp Solar. Zum Beispiel: zehn 600-W-Dachpanels und drei Felder ergeben 13,2 kWp. Alte 400-W-Panels zählen mit ihrer echten Leistung.</p></article>':'')+
 '<article>'+rhObjektBild('akku')+'<h3>Der Energiespeicher</h3><p>'+r.akku+'/'+c.akku+' kWh. 90 % Rundlaufwirkungsgrad, Leistung = Kapazität ÷ 2 h. Neue Module kommen leer.</p>'+rhBtn(batStep<=0?'Speicher vollständig ausgebaut':'+'+batStep+' kWh · '+rhEuro(batStep*40),"rhKauf('akku')",batStep<=0||r.akku+batStep>c.akku||rhCash()<batStep*40)+(batStep>0?'<p class="rhPayback">'+rhAmort(r,{...r,akku:r.akku+batStep},batStep*40)+'</p>':'')+'<p>Ein 10-kWh-Akku liefert bei 1 kW Last höchstens etwa 9,5 Stunden; Verluste sind eingerechnet.</p>'+
 /* Ära 7.5 (R-11): Umschalter Eigenstrom/Nachtstrom mit dem Lehrsatz dahinter. */
 '<p><b>Womit lädt der Akku?</b></p>'+rhBtn((r.akkuModus!=='netz'?'✓ ':'')+'Nur Eigenstrom',"rhAkkuModus('eigen')")+rhBtn((r.akkuModus==='netz'?'✓ ':'')+'Auch Nachtstrom',"rhAkkuModus('netz')")+
 '<p>Nachtstrom kostet den halben Tarif ('+rhEuro(strompreis()*.5)+'/kWh statt '+rhEuro(strompreis())+'). Wer nachts lädt und tagsüber entlädt, spart trotz 10 % Umlaufverlust rund '+rhEuro(strompreis()*.5*.9)+' je kWh – genau das ist der Hauptgrund für Heimspeicher. Ohne Sonne und Wind ist das die einzige Art, wie sich ein Akku überhaupt rechnen kann. Geladen wird nur, was der Anschluss neben dem laufenden Bedarf noch hergibt.</p></article>'+
 (r.stufe>0?'<article>'+rhObjektBild('wind_gross')+'<h3>Wind im Hof</h3><p>'+r.wind.length+'/6 Windplätze · '+rhN(rhWindKW(r))+' kW Nennleistung, davon '+rhN(rhWindEffKW(r))+' kW wirksam. Normjahr: 25 % Auslastung für große Anlagen; bei Flaute viel weniger. <b>Kleine Räder stehen in turbulenter, bodennaher Luft und erreichen nur einen Bruchteil der Auslastung großer Anlagen</b> – im Spiel 45 % (5 kW), 75 % (20 kW) und 100 % (50 kW) des Kapazitätsfaktors.</p>'+RH_WIND.map((w,i)=>'<div class="rhAngebot"><b>'+['Klein','Mittel','Groß'][i]+' · '+w.kw+' kW · Auslastung '+rhN(w.cf*25,0)+' %</b>'+rhBtn(rhEuro(w.preis),"rhKauf('wind',"+i+")",r.wind.length>=6||rhCash()<w.preis)+'<small>'+rhAmort(r,{...r,wind:[...r.wind,i]},w.preis)+'</small></div>').join('')+r.wind.map((w,i)=>'<div>Windrad '+(i+1)+': '+RH_WIND[w].kw+' kW '+(w<2?rhBtn('Vergrößern · '+rhEuro(RH_WIND[w+1].preis-RH_WIND[w].preis+150),"rhKauf('windUpgrade',"+i+")"):'✓ größte Größe')+'</div>').join('')+'</article>'+
 '<article>'+rhObjektBild('kraftwerk')+'<h3>Das fossile Kraftwerk</h3><p>Planbare Leistung, teurer Betrieb: '+rhEuro(RH_STROM.brennstoff*r.fuelF)+'/erzeugter kWh + Wartung. Im Eigenbetrieb springt das Kraftwerk nur in den Stunden an, in denen der Brennstoff wirklich billiger ist als das Netz (aktuell '+(RH_STROM.brennstoff*r.fuelF<strompreis()?'billiger':'teurer')+' als der Tagestarif von '+rhEuro(strompreis())+'). 3,5 % Ausfallchance/Tag (zwei Tage), 7 % Preissprungchance (+45 % für vier Tage).</p>'+RH_GEN.map((g,i)=>i>r.gen?rhBtn(g.kw+' kW · '+rhEuro(g.preis-(r.gen>=0?RH_GEN[r.gen].preis*.6:0)),"rhKauf('generator',"+i+")",rhCash()<g.preis-(r.gen>=0?RH_GEN[r.gen].preis*.6:0)):'').join('')+(r.gen>=0?'<p>Aktuell '+rhGenKW(r)+' kW · '+(r.genAus?'Ausfall, noch '+r.genAus+' Tage':'betriebsbereit')+'</p>'+rhBtn((r.genModus==='reserve'?'✓ ':'')+'Nur Notreserve',"rhModus('reserve')")+rhBtn((r.genModus==='eigen'?'✓ ':'')+'Eigenbetrieb vor Netz',"rhModus('eigen')"):'')+'<p>Ausbau mit Fossiltechnik ist erlaubt. Das Netz kann bei Ausfall übernehmen; reicht es nicht, pausieren lokale Arbeiten.</p></article>':'')+'</div>'+
 '<details class="rhInfo"><summary>Alle Annahmen, Kosten und Grenzen</summary><p>1 Hoftag = 24 simulierte Stunden; 30 Tage = Abrechnungsmonat. Normaltarif aktuell '+rhEuro(strompreis())+'/kWh. Einspeisung '+rhEuro(RH_STROM.einspeise)+'/kWh; CO₂ 0,36 kg/kWh Netz und 0,80 kg/kWh fossil (nur Betrieb). PUE '+c.pue+' modelliert Kühlung/Verteilung: 1,45 im ungekühlten Geräteschuppen, 1,25 im Nerdtempel, 1,12 im Rechenzentrum. Große, geplante Rechenzentren erreichen bessere PUE als improvisierte Räume – deshalb sinkt der Wert mit jeder Ausbaustufe. Die Grundlast (Licht, Netzwerk, USV-Leerlauf, Zutritt) beträgt '+RH_STUFEN.map(s=>rhN(s.grund,3)).join(" / ")+' kW (Rechenzentrum: plus 0,06 kW je belegtem Schrank). Nachtstrom kostet den halben Tarif, bleibt aber kostenpflichtig. GPU-Wattwerte sind Herstellergrenzen, Systemaufschläge und Laststunden sind Spielannahmen: 95–130 W je PC, 350 W je Serverknoten mit 256 GB RAM und 8 TB NVMe.</p><p>Inferenz zieht typisch 50–65 % der Herstellergrenze, Training fast 100 % – Decode ist speicher-, nicht rechenlimitiert. Im Spiel: Auftrag 60 %, Training 95 %, Agenten-Welt 70 %, Zucht 50 % der GPU-Spitzenleistung.</p><p>Der Netzanschluss begrenzt in beide Richtungen: Was über die Anschlussleistung hinaus erzeugt wird, wird abgeregelt statt eingespeist. Solar: 2,9 kWh/kWp je Normtag (DE-Mittel rund 1.050 kWh/kWp im Jahr), Wetterfaktor und Saisonfaktor (Frühling 1,25 · Sommer 1,45 · Herbst 0,75 · Winter 0,35). Real schwankt PV in Deutschland zwischen etwa 0,4 kWh/kWp im Dezember und 4,7 im Juni – die Winterlücke ist der eigentliche Grund für Speicher und Netzanschluss. Wind: mittlere Auslastung 25 % für große Anlagen, mit Kapazitätsfaktor 0,45 / 0,75 / 1,0 für 5 / 20 / 50 kW; Kleinwind steht in bodennaher, turbulenter Luft. Hardware-Wartung und Rücklage: 3 % des GPU-Anlagenwerts pro Jahr. Wartung pro Jahr: Solar 1 %, Wind 2 %, Speicher 1 %, Generator 4 % des Anlagenwerts. Wind-Aufrüstung: Preisunterschied +150 € Umbau; Kraftwerkswechsel: 60 % Altwert. Alle Preise sind Spielpreise, keine Marktangebote.</p><p>Amortisation in Hoftagen = Investition ÷ tägliche Nettoersparnis gegenüber dem jetzigen System; identische Last, 14 Normtage mit Einschwingphase, unveränderte Tarife. Keine Verzinsung, Alterung oder Ersatzkäufe. Kein Ertragsversprechen. Sonne und Wind haben im Szenario günstigere Erzeugung über 20 Jahre als Fossilstrom; eine überdimensionierte Anlage oder ein kaum genutzter Akku kann sich trotzdem nicht rechnen. <b>Wichtig für die Einordnung:</b> Baupreise sind ein Zehntel der Marktpreise, die angezeigte Amortisation entsprechend rund ein Zehntel der realen. Eine PV-Dachanlage amortisiert real in etwa 8–12 Jahren, Kleinwind auf Hofhöhe praktisch nie.</p><p>Investitionen in Energie/Anschlüsse: '+rhEuro(r.invest)+'; kumulierte Betriebskosten-Differenz zu reinem Norm-Netzbezug: '+rhEuro(r.ertrag)+'. Gebäudebau und Hardware kommen separat dazu.</p><p><a href="https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5090/" target="_blank" rel="noopener">NVIDIA RTX 5090</a> · <a href="https://www.nvidia.com/en-us/geforce/news/geforce-rtx-40-series-ultra-efficient-beyond-fast/" target="_blank" rel="noopener">NVIDIA RTX 4080 Leistungsaufnahme</a> · <a href="https://joint-research-centre.ec.europa.eu/pvgis-online-tool_en" target="_blank" rel="noopener">EU JRC / PVGIS</a>. Rechenhaus-Regeln mit Ära 7.5, 01.09.2026.</p></details>';
}
function zeigeRechenhaus(view="raum"){
 rhView=['raum','energie','ausbau','teich','ansicht','hardware','strom'].includes(view)?view:'raum';rh();   /* v9.9: Material-Bäume */
 const hilfen={raum:['ort_rechenhaus','den Innenraum'],energie:['ort_energie','den Energiegarten'],ausbau:['rechenhaus_ausbau','den Ausbauplan'],teich:['rechenhaus_trinkpause','die Trinkpause'],ansicht:['rechenhaus_hofansicht','die Hofansicht'],hardware:['rechenhaus_hardware','den Hardware-Baum'],strom:['rechenhaus_strom','den Strom-Baum']},hilfe=hilfen[rhView];
 blattLive('🏡 Rechenhaus · '+rhCfg().name,()=>'<div class="rhRoot"><div class="rhKopf"><span>Ein Platz für deine Rechenherde</span><b>'+rhEuro(rhCash())+' verfügbar</b></div><div class="rhTabs" role="navigation" aria-label="Rechenhaus-Bereiche">'+[['raum','Innenraum'],['energie','Energiegarten'],['ausbau','Ausbauplan'],['teich','Trinkpause'],['ansicht','Hofansicht'],['hardware','🖥️ Hardware-Baum'],['strom','⚡ Strom-Baum']].map(([id,n])=>'<button class="'+(rhView===id?'an':'')+'" aria-current="'+(rhView===id?'page':'false')+'" onclick="zeigeRechenhaus(\''+id+'\')">'+n+'</button>').join('')+'</div><div class="rhAdaHilfe"><button class="knopf s hell" onclick="adaSprich(\''+hilfe[0]+'\',true)">🔊 Ada erklärt '+hilfe[1]+'</button></div>'+(rhView==='raum'?rhRaum():rhView==='energie'?rhEnergie():rhView==='ausbau'?rhAusbau():rhView==='ansicht'?rhAnsicht():rhView==='hardware'?((typeof rhHardwareBaumHtml==='function')?rhHardwareBaumHtml():''):rhView==='strom'?((typeof rhStromBaumHtml==='function')?rhStromBaumHtml():''):rhTeichInfo())+'</div>','rechenhaus');
 if(S&&S.einfFertig&&S.fuehrung==='gefuehrt'&&typeof adaAuto==='function') setTimeout(()=>adaAuto(hilfe[0]),300);
}

/* Sichtbares Wetter auf der Farm. Der Layer ist rein dekorativ und folgt exakt
   demselben rhWeather()-Ergebnis wie die Energiebilanz. */
function rhWetterSzene(){
 if(typeof document==="undefined"||typeof S==="undefined")return;const welt=document.getElementById("welt");if(!welt)return;let el=document.getElementById("rhWetterSzene");if(!el){el=document.createElement("div");el.id="rhWetterSzene";el.setAttribute("aria-hidden","true");welt.appendChild(el);}
 const w=rhWeather(S.tag,false,rhSaat(S));el.className=(w.regen?"regen ":"")+(w.sturm?"sturm ":"")+(w.nebel?"nebel ":"");
 if(w.regen||w.sturm)el.innerHTML='<div class="rhRegenWolke w1">☁️</div><div class="rhRegenWolke w2">☁️</div><div class="rhRegenWolke w3">☁️</div><div class="rhTropfenFeld">'+Array.from({length:24},(_,i)=>'<i style="--x:'+((i*37)%100)+'%;--d:'+(i%7*.13)+'s;--s:'+(0.75+i%5*.09)+'s"></i>').join('')+'</div>';
 else el.innerHTML=w.nebel?'<div class="rhNebelband"></div>':'';
}

if(typeof window!=="undefined"){Object.assign(window,{rhStromLeisteHtml,rhStromHofbuchHtml,rhAnschlussFrei,rhEigenBonus,rhGrund,rhOptionen,rhAnschlussText,rhWeather,rhPrognose,rhWetterbericht,rhWetterSzene,RH_STROM});}
