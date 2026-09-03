/* LLM FARM · Hoftag 7.0. Alle Preise, Scores, Wahrscheinlichkeiten und Lasten sind
   transparente Spielannahmen. Keine reale Modell-Evaluation oder Strompreisprognose. */
// Optionale, parallel entwickelte Meisterschaften: ein unvollständig eingebauter
// Zusatz darf das Basisspiel nicht stilllegen. Eine vorhandene Implementierung gewinnt.
if(typeof globalThis.skillAktiv!=='function')globalThis.skillAktiv=()=>false;
const HL_TEILE={
 vector:{n:'Vektordatenbank',z:'🗄️',preis:90,braucht:[],txt:'Speichert Textabschnitte mit ihren Suchvektoren. Kein Wissen in Modellgewichten.',mod:'Speicher & Abschnittsbildung'},
 embedding:{n:'Embedding-Modell',z:'🧭',preis:120,braucht:['vector'],txt:'Übersetzt Suchfrage und Text in vergleichbare Vektoren. Zusammen mit der Datenbank wird Textsuche möglich.',mod:'Semantische Suche'},
 ocr:{n:'OCR-Modell',z:'📄',preis:100,braucht:['vector'],txt:'Liest Text aus Scans und Fotos. Für reine Textquellen optional; bei Belegen und Archivscans erforderlich.',mod:'Scans → Text'},
 reranker:{n:'Reranker',z:'🎯',preis:160,braucht:['embedding'],txt:'Bewertet gefundene Textstellen erneut. Bessere Treffer, aber zusätzliche Rechenarbeit.',mod:'Treffer nachsortieren'}
};
// Kleine Sortier-/Extraktionsstufen sind ausdrücklich für Sub-1B-Modelle ausgelegt.
const HL_AUFTRAEGE=[
 {key:'post',t:'Die Post muss ins richtige Fach',b:'Sortiere kurze Nachrichten in fünf vorgegebene Kategorien. Unklare Fälle kommen in die Rückfragebox.',kunde:'werkstatt',art:'support',tier:0,tage:1,mtok:1.4,lohn:92,rollen:[['Vorsortieren',{treue:26,logik:20}]]},
 {key:'etikett',t:'Etiketten für den Hofladen',b:'Erkenne Produktnamen und packe sie ins feste Ausgabeformat. Kein freies Erfinden.',kunde:'laden',art:'text',tier:0,tage:1,mtok:1.4,lohn:88,rollen:[['Felder extrahieren',{treue:26,kontext:22}]]},
 {key:'spam',t:'Die Vereinsmail aufräumen',b:'Markiere Dubletten und offensichtlichen Spam. Nur markieren, niemals selbst löschen.',kunde:'verein',art:'support',tier:0,tage:1,mtok:1.4,lohn:96,rollen:[['Markieren',{logik:23,treue:26}]]},
 {key:'stimmung',t:'Wie kam das Dorffest an?',b:'Ordne kurze Kommentare in positiv, neutral und negativ ein. Ironische Texte gehen zur Rückfrage.',kunde:'verein',art:'text',tier:0,tage:1,mtok:1.4,lohn:90,rollen:[['Klassifizieren',{schreiben:24,treue:25}]]},
 {key:'produkt',t:'Vom Stichwort zum Produkttext',b:'Erst die Produktdaten ordnen, dann verständlich formulieren. Ein kleines Modell darf die Vorarbeit übernehmen.',kunde:'laden',art:'text',tier:1,tage:2,mtok:7,lohn:310,rollen:[['Daten ordnen',{treue:27,logik:22}],['Texte schreiben',{schreiben:43,treue:38}]]},
 {key:'tickets',t:'Support mit Weiterleitung',b:'Ein günstiger Router sortiert die Anfragen. Der Spezialist beantwortet nur die schwierigen Tickets.',kunde:'werkstatt',art:'support',tier:1,tage:2,mtok:7,lohn:340,rollen:[['Routing',{treue:27,logik:24}],['Antworten',{wissen:40,schreiben:40,treue:40}]]},
 {key:'radio',t:'Eine Woche Dorfgeschichten',b:'Ordne Interviewnotizen und schreibe daraus kurze Radiotexte. Zwei Arbeitstage, ein Tag Lieferpuffer.',kunde:'radio',art:'text',tier:1,tage:2,mtok:7,puffer:1,lohn:370,rollen:[['Notizen ordnen',{kontext:28,treue:26}],['Redaktion',{schreiben:46,treue:40}]]},
 {key:'faq',t:'Belegte Antworten aus dem Vereinsarchiv',b:'Beantworte Fragen ausschließlich aus Textquellen und liefere passende Belegstellen.',kunde:'buecherei',art:'wissen',tier:1,tage:2,mtok:7,lohn:380,teile:['vector','embedding'],rollen:[['Quellenantwort',{wissen:42,treue:40}]]},
 {key:'belege',t:'Der Schuhkarton voller Belege',b:'Scans lesen, Beträge extrahieren und Abweichungen zur Prüfung markieren. Alle Daten bleiben auf dem Hof.',kunde:'genossen',art:'text',tier:1,tage:2,mtok:7,lohn:420,teile:['vector','ocr'],lokal:true,rollen:[['Belegfelder',{treue:28,logik:24}],['Abgleich',{logik:42,treue:43}]]},
 {key:'code',t:'Kleine Reparaturen, echte Tests',b:'Vorsortierte Bugmeldungen reparieren und unabhängig testen. Ein grüner Test allein ist noch kein Beweis.',kunde:'startup',art:'code',tier:2,tage:3,mtok:16,lohn:760,rollen:[['Tickets ordnen',{treue:28,logik:24}],['Reparieren',{code:55,logik:48}],['Gegenprüfen',{code:44,treue:50}]]},
 {key:'archiv',t:'Das gescannte Heimatarchiv',b:'Scans erschließen, Treffer sortieren und eine belegte Zusammenfassung abgeben. Der gesamte Wissensbaukasten kommt zum Einsatz.',kunde:'buecherei',art:'wissen',tier:2,tage:3,mtok:16,lohn:820,teile:['vector','embedding','ocr','reranker'],rollen:[['Dokumente ordnen',{treue:28,kontext:26}],['Recherche',{wissen:48,treue:46}],['Redaktion',{schreiben:48,treue:45}]]},
 {key:'rat',t:'Die Ratsunterlagen im Überblick',b:'Lokale Unterlagen zusammenfassen, widersprüchliche Aussagen markieren und Fundstellen gegenprüfen.',kunde:'gemeinde',art:'wissen',tier:2,tage:3,mtok:16,lohn:790,lokal:true,teile:['vector','embedding','reranker'],rollen:[['Quellen ordnen',{kontext:30,treue:28}],['Zusammenfassen',{kontext:50,schreiben:46}],['Quellen prüfen',{wissen:45,treue:52}]]},
 {key:'daten',t:'Datensatz mit Qualitätsprotokoll',b:'Neue Beispiele auf Dubletten und widersprüchliche Labels prüfen. Saubere Daten vor dem Training sparen später Reparaturen.',kunde:'schule',art:'code',tier:1,tage:2,mtok:7,lohn:330,rollen:[['Dubletten markieren',{logik:24,treue:26}],['Labels prüfen',{logik:40,treue:45}]]},
 {key:'barriere',t:'Das Amtsblatt in einfacher Sprache',b:'Absätze gliedern und in kurze verständliche Sätze übertragen. Namen und Zahlen müssen erhalten bleiben.',kunde:'gemeinde',art:'text',tier:1,tage:2,mtok:7,lohn:350,rollen:[['Gliedern',{kontext:26,treue:27}],['Vereinfachen',{schreiben:45,treue:44}]]},
 {key:'wissen',t:'Die widersprüchlichen Quellen',b:'Drei Fassungen einer Anleitung vergleichen. Veraltete Angaben finden und nur die gültige Fassung zitieren.',kunde:'schule',art:'wissen',tier:2,tage:3,mtok:16,lohn:780,teile:['vector','embedding','reranker'],rollen:[['Suche',{wissen:40,treue:40}],['Widersprüche prüfen',{logik:52,treue:54}]]},
 /* Ära 7.5 (W-14): Agenten-Zettel auch im Hofloop-Katalog – Agenten-Tool nötig, Werkzeug-Werte */
 /* Ära 8 · Großkunden (Tier 3–5): viele Nutzer gleichzeitig (parallel), nur mit starker Hardware sinnvoll */
 {key:'gross_hotline',gross:true,parallel:true,t:'Landkreis-Bürgerhotline',b:'Die Kreisverwaltung stellt ihren Bürgerservice auf einen KI-Assistenten um: tausende Anfragen täglich zu Formularen, Fristen und Zuständigkeiten – alle gleichzeitig.',kunde:'landkreis',art:'support',tier:3,tage:4,mtok:48,lohn:2200,puffer:1,rollen:[['Anfragen beantworten',{wissen:58,treue:60,logik:50}]]},
 {key:'gross_katalog',gross:true,parallel:true,t:'Versandhaus-Produkttexte',b:'Ein Versandhaus braucht Produktbeschreibungen für 40 000 Artikel in einheitlichem Ton – parallel über viele Sitzungen, mit Stilprüfung.',kunde:'versandhaus',art:'text',tier:3,tage:4,mtok:60,lohn:2600,puffer:1,rollen:[['Texte schreiben',{schreiben:60,treue:52}],['Stil prüfen',{logik:55,treue:60}]]},
 {key:'gross_klinik',gross:true,parallel:true,t:'Klinikverbund-Befundassistent',b:'Ein Klinikverbund will Arztbriefe strukturieren und Fachbegriffe erklären – streng lokal, hohe Genauigkeit, viele Stationen parallel.',kunde:'klinikverbund',art:'medizin',tier:4,tage:5,mtok:90,lohn:4200,lokal:true,puffer:1,rollen:[['Befunde strukturieren',{wissen:66,treue:68}],['Fachbegriffe erklären',{schreiben:58,wissen:62}]]},
 {key:'gross_code',gross:true,parallel:true,t:'Software-Werk: Migration im Akkord',b:'Ein Softwarehaus lässt eine Alt-Codebasis modulweise migrieren – Agenten mit Werkzeugen, hunderte Module gleichzeitig.',kunde:'softwarehaus',art:'code',tier:4,tage:5,mtok:110,lohn:4800,agent:true,mcp:['datei','web'],puffer:1,rollen:[['Module migrieren',{code:68,werkzeug:62}],['Tests schreiben',{code:64,logik:60}]]},
 {key:'gross_nation',gross:true,parallel:true,t:'Nationaler Nachrichten-Assistent',b:'Ein Medienhaus bietet allen Abonnenten einen Assistenten für Recherche und Zusammenfassung – Spitzenlast, Faktenpflicht, Millionen Anfragen.',kunde:'medienhaus',art:'wissen',tier:5,tage:6,mtok:160,lohn:6500,puffer:1,rollen:[['Recherchieren',{wissen:74,logik:66}],['Zusammenfassen',{schreiben:66,treue:70}],['Fakten prüfen',{treue:74,wissen:70}]]},
 {key:'agent_mail',t:'Mails ablegen mit Werkzeug',b:'Kleine Agenten-Übung: eingehende Mails lesen und per Werkzeug in Ordner ablegen. Der Einstieg in die Agenten-Arbeit – Agenten-Tool nötig.',kunde:'werkstatt',art:'agent',tier:1,tage:2,mtok:3,lohn:260,agent:true,mcp:['mail'],rollen:[['Mails ablegen',{werkzeug:48,treue:40}]]},
 {key:'agent_formular',t:'Vom Posteingang ins Webformular',b:'Kundenmails lesen, Felder erkennen und ins Buchungsformular der Genossenschaft eintragen. Nur mit einem Agenten-Tool kann das Modell die nötigen Werkzeuge bedienen.',kunde:'genossen',art:'agent',tier:2,tage:2,mtok:10,lohn:560,agent:true,mcp:['web'],rollen:[['Formulare ausfüllen',{werkzeug:55,treue:50}]]},
 {key:'agent_tickets',t:'Ticket-Runden mit Werkzeugkasten',b:'Support-Tickets in mehreren Runden lösen: lesen, Werkzeug wählen, Lösung testen, antworten. Ein kleines Modell darf vorsortieren.',kunde:'startup',art:'agent',tier:2,tage:3,mtok:16,lohn:820,agent:true,mcp:['datei'],rollen:[['Tickets ordnen',{treue:28,logik:24}],['Werkzeuge bedienen',{werkzeug:58,code:45,treue:48}]]}
];
const HL_EVENTS=[
 {id:'ruhig',z:'🌤️',n:'Ein guter Tag für saubere Arbeit',txt:'Normale Tarife. Zeit, Reserven aufzubauen und kleine Spezialisten auszubilden.'},
 {id:'sonne',z:'☀️',n:'Sonne über dem Hof',txt:'Solarertrag +45 %. Ein guter Tag für lokale Aufträge und das Laden des Akkus.'},
 {id:'wind',z:'🌬️',n:'Eine kräftige Brise',txt:'Windertrag +65 %. Wind kann auch die Nachtschicht versorgen.'},
 {id:'teuer',z:'📈',n:'Teure Netzstunden',txt:'Netzstrom heute +60 %. Nachts gilt weiter der halbe Tagestarif. Eigenstrom priorisieren oder Arbeit verschieben.'},
 {id:'dunkel',z:'☁️',n:'Dunkelflaute',txt:'Solar liefert nur 35 %, Wind nur 20 %. Akkuladung ist endlich; Netzbezug bleibt verfügbar.'},
 {id:'quelle',z:'📚',n:'Neue Fassung im Kundenarchiv',txt:'Die Quellen haben sich geändert: Der Index ist nicht mehr aktuell. Nachts neu indexieren; bis dahin keine veralteten Belege liefern.'},
 {id:'schema',z:'🧾',n:'Der Kunde ändert sein Ausgabeformat',txt:'Zusätzliche Formatfehler drohen. Eine aktuelle Stressprüfung oder das kostenpflichtige Kontrollpaket fängt die Änderung ab.'},
 {id:'andrang',z:'📬',n:'Viele kleine Anliegen',txt:'Neue einfache Aufträge zahlen heute 20 % mehr. Bereits vereinbarte Preise bleiben bestehen.'},
 {id:'audit',z:'🧐',n:'Ein unabhängiger Prüfer schaut vorbei',txt:'Kontaminierte Modelle verlieren deutlich an Zuverlässigkeit. Unabhängige Tests und saubere Trainingsdaten sind gefragt.'},
 {id:'ausfall',z:'🔌',n:'Netzausfall angekündigt · 14–18 Uhr',lvl:5,txt:'Vier Stunden ohne Versorger. Eigenstrom, Akku und Reservekraftwerk übernehmen; unversorgte Modelle pausieren. Cloud bleibt unabhängig.'}
];
function hlStand(s=S){
 if(!s)return {phase:'tag',teile:{},plan:{},energie:{},serie:0,saat:1};
 if(!s.hofloop){
  const alt=!!s.setup_rag||s.tiere.some(p=>(p.setups||[]).includes('rag'));
  s.hofloop={v:1,phase:'tag',saat:zi(1,1000000),teile:alt?{vector:true,embedding:true,ocr:true,reranker:true}:{},indexTag:alt?s.tag:0,plan:{},energie:{},serie:0,best:0,sauber:0,arten:[],abzeichen:{},ereignis:null,letzteEvents:[],pruefungen:{},nacht:null};
 }
 const h=s.hofloop; h.teile=h.teile||{};h.plan=h.plan||{};h.energie=h.energie||{};h.pruefungen=h.pruefungen||{};h.abzeichen=h.abzeichen||{};h.arten=h.arten||[];h.letzteEvents=h.letzteEvents||[];
 if(!['tag','planung','laeuft'].includes(h.phase))h.phase='tag';
 if(h.phase==='laeuft'&&!hlNachtLaeuft){h.phase='planung';h.nacht=null;} // Reload vor Commit: editierbare Planung wiederherstellen.
 return h;
}
let hlNachtLaeuft=false,hlAuswahl={},hlFilter='alle',hlSuche='',hlSort='name';
function hlEvent(){const h=hlStand();return HL_EVENTS.find(e=>e.id===(h.ereignis||{}).id)||HL_EVENTS[0];}
function hlStromFaktor(){return hlEvent().id==='teuer'?1.6:1;}
function hlRagBereit(){const h=hlStand();return !!(h.teile.vector&&h.teile.embedding&&h.indexTag>0);}
function hlIndexAlter(){const h=hlStand();return h.indexTag?Math.max(h.indexVeraltet?4:0,S.tag-h.indexTag):99;}
function hlSetupMod(id){
 if(id!=='rag')return (SETUPS[id]||{}).mod||{};
 if(!hlRagBereit())return {};
 const frisch=hlIndexAlter()<=3,f=frisch?1:.35;
 return {wissen:Math.round((hlStand().teile.reranker?16:10)*f),treue:Math.round((hlStand().teile.reranker?6:3)*f)};
}
// Bisher gekaufte Anlagen bleiben voll erhalten. Die Pipeline ersetzt den pauschalen Kauf.
Object.assign(SETUPS.rag,{n:'Wissenspipeline (RAG)',preis:0,lvl:1,forschung:null,txt:'Gemeinsame Vektordatenbank + Embedding-Modell + aktueller Index. OCR erschließt Scans; ein Reranker verbessert die Treffer. Aufbau in der Wissenswerkstatt.',lehre:'Retrieval verändert keine Modellgewichte. Falsche Quellen oder ein alter Index lassen sich nicht durch mehr Denkzeit reparieren.'});
Object.assign(FORSCHUNG.rag,{n:'Quellenlabor: Retrieval prüfen',kosten:180,tage:1,braucht:[],txt:'Optional: Ein eigener Prüfsatz für Treffer und Zitate verbessert Wissensaufträge um 2 Qualitätspunkte. Die Wissenspipeline selbst wird bausteinweise in der Wissenswerkstatt eingerichtet.'});
// Eine Quelle auch für die bestehenden Hilfsmittelkarten und Kapazitätsformeln.
Object.defineProperties(SETUPS.rag,{mod:{get:()=>hlSetupMod('rag')},kw:{get:()=>hlStand().teile.reranker?1.2:1.1},tokens:{get:()=>hlStand().teile.reranker?1.5:1.35}});
function hlBauteilKauf(id){const t=HL_TEILE[id],h=hlStand();if(!t||h.teile[id])return;
 if(t.braucht.some(k=>!h.teile[k])||rhCash()<t.preis){melde('Erst Voraussetzungen und Guthaben prüfen.','schlecht');return;}
 buche(-t.preis,'kauf',t.n+' · gemeinsame Wissenswerkstatt');h.teile[id]=true;
 if(h.teile.vector&&h.teile.embedding&&!h.indexTag){h.indexTag=S.tag;S.setup_rag=true;} // Einrichtung enthält ersten kleinen Textindex.
 sichern();alles();zeigeWissenswerkstatt();
}
function hlBtn(t,fn,aus=false,cls='hell'){return '<button class="knopf s '+cls+'" '+(aus?'disabled ':'')+'onclick="'+fn+'">'+t+'</button>';}
function hlNavigation(){return '<nav class="hlNav" aria-label="Hofplanung">'+hlBtn('📌 Aufträge','zeigeJobs()')+hlBtn('⚖️ Modellvergleich','zeigeModellvergleich()')+hlBtn('🧩 Wissenswerkstatt','zeigeWissenswerkstatt()')+hlBtn('⚡ Einsatz & Energie','zeigeEnergieplan()')+hlBtn('🌙 Nacht planen','tagBeenden()')+'</nav>';}
function zeigeWissenswerkstatt(){const h=hlStand();blattAuf('🧩 Die Wissenswerkstatt',hlNavigation()+
 '<div class="karte hell"><h3>Vom Dokument zur belegten Antwort</h3><p>Text → Abschnitte → Embeddings → Vektordatenbank → Reranker → Antwort. Scans brauchen vorher OCR. Die Grundsuche kostet einmalig <b>210 €</b>, alle vier Teile zusammen <b>470 €</b>; gemeinsam für alle Modelle.</p><p>Du kaufst die Einrichtung offener Komponenten. Die kleinen Hilfsmodelle laufen sequenziell im Host-RAM (zusammen 2 GB), kosten im Betrieb zusätzliche Tokens und Strom und belegen keinen eigenen Tierplatz.</p></div>'+
 '<div class="hlBausteine">'+Object.entries(HL_TEILE).map(([id,t])=>'<article class="karte '+(h.teile[id]?'hlBesitz':'')+'"><span class="hlIcon">'+t.z+'</span><h3>'+t.n+'</h3><b>'+t.mod+'</b><p>'+t.txt+'</p><small>'+(t.braucht.length?'Benötigt: '+t.braucht.map(k=>HL_TEILE[k].n).join(' + '):'Hier beginnt der Aufbau')+'</small>'+hlBtn(h.teile[id]?'✓ Auf dem Hof':geld(t.preis)+' · Einrichten',"hlBauteilKauf('"+id+"')",!!h.teile[id]||t.braucht.some(k=>!h.teile[k])||rhCash()<t.preis,'gruen')+'</article>').join('')+'</div>'+
 '<div class="karte"><h3>📚 Quellenpflege</h3><p>Index: '+(hlRagBereit()?(hlIndexAlter()<=3?'aktuell':'⚠️ veraltet')+' · '+hlIndexAlter()+' Tage alt':'noch keine Textsuche')+'. Die Einrichtung enthält den ersten Index. Nach drei Tagen oder einer Quellenänderung nachts aktualisieren. Dafür braucht ein lokales Modell 2 GPU-Stunden und mindestens 2 GB Quelldaten; die Quelldaten bleiben erhalten.</p>'+hlBtn('Index nachts aktualisieren','tagBeenden()',!hlRagBereit())+'</div>'+
 '<div class="karte"><h3>🔍 An Modelle anschließen</h3>'+S.tiere.map(p=>'<div class="listenzeile"><span class="txt"><b>'+esc(p.name)+'</b><span>'+(p.setups.includes('rag')?'Wissenspipeline angeschlossen':'Nutzt bisher keine Pipeline')+'</span></span>'+hlBtn(p.setups.includes('rag')?'Abnehmen':'Anschließen',"hlRagAn('"+p.uid+"')",p.status!=='frei'||(!hlRagBereit()&&!p.setups.includes('rag')))+'</div>').join('')+'</div>', 'wissenwerkstatt');}
function hlRagAn(uid){setupUm(uid,'rag');zeigeWissenswerkstatt();}
/* Ära 7.5 (W-06/W-10/W-13/W-17/W-24): Wunsch-Tier zählt, Groll sperrt, Saison-Lohn wirkt,
   jeder Zettel trägt Gesamtarbeit in Mtok + Auftragsgröße S/M/L + optional Eilauftrag (kein Puffer). */
const HL_GROSS_MIN=25;   /* Ära 8: Mtok/Tag des schnellsten Tiers, ab dem Großkunden-Zettel erscheinen */
const HL_GROESSEN={S:{f:.5,lohn:.58,n:'Kleinauftrag',z:'🧺'},M:{f:1,lohn:1,n:'Normalauftrag',z:'📦'},L:{f:2,lohn:2.4,n:'Großauftrag',z:'🏗️'}};
function hlJobNeu(wunsch,mikroErzwingen,starterSicher){
 if(!S)return null;
 const h=hlStand(),offen=S.jobs.filter(j=>!S.tiere.some(p=>p.job===j.id));
 const mikro=mikroErzwingen||!offen.some(j=>j.mikro),max=Math.min(5,Math.floor(hofLevel().i/2));   /* Ära 8: Katalog bis Tier 5 */
 const kapMax=Math.max(0,...S.tiere.filter(p=>(p.bucht&&!p.api)||p.api).map(p=>mtokTagKapazitaet(p)),0);   /* schnellstes Tier des Hofs */
 if(!mikro&&Math.random()>.78)return null; // Alter Katalog bleibt Teil der Wirtschaft.
 let pool=HL_AUFTRAEGE.filter(v=>mikro?v.tier===0:(v.tier<=max&&(!v.gross||kapMax>=HL_GROSS_MIN)));   /* Großkunden-Zettel erst mit ≥ HL_GROSS_MIN Mtok/Tag */
 if(!mikro&&wunsch!==undefined){const pw=pool.filter(v=>v.tier===Math.min(wunsch,max));if(pw.length)pool=pw;}
 const ohneGroll=pool.filter(v=>!v.kunde||!((S.kunden||{})[v.kunde]||{}).groll);if(ohneGroll.length)pool=ohneGroll;
 if(!forschungFrei('geschirr')){const og=pool.filter(v=>!v.agent);if(og.length)pool=og;}
 if(!pool.length)pool=HL_AUFTRAEGE.filter(v=>v.tier===0);
 const frisch=pool.filter(v=>!offen.some(j=>j.vorlage===v.key)&&!(h.letzteJobs||[]).slice(-2).includes(v.key));if(frisch.length)pool=frisch;
 const v=zufall(pool),dauer=v.tage;
 h.letzteJobs=[...(h.letzteJobs||[]),v.key].slice(-4);
 const gr=v.gross?'L':zufall(v.tier===0?['S','M','M','L']:(kapMax>=12?['S','M','M','L','L','L']:['S','M','M','L','L'])),G=HL_GROESSEN[gr];   /* Ära 8: ab 12 Mtok/Tag kommen mehr Großaufträge */
 const eil=!v.agent&&Math.random()<.2;
 const preis=Math.round(v.lohn*G.lohn*(eil?1.35:1)*z(.95,1.08)*(hlEvent().id==='andrang'&&v.tier===0?1.2:1)*(rufSterne()>=(skillAktiv('stammkunden')?4:4.5)?1.1:1)*((typeof saison==='function'&&saison().lohnF)||1));
 const mtok=Math.round(v.mtok*G.f*100)/100;
 const _j={id:'j'+S.zaehler++,vorlage:v.key,mikro:v.tier===0,t:v.t,b:v.b,tier:v.tier,art:v.art,kunde:v.kunde,groesse:gr,eil,
  tage:dauer,puffer:eil?0:(v.puffer||1),frisch:S.tag,anf:v.rollen.reduce((a,r)=>{for(const k in r[1])a[k]=Math.max(a[k]||0,r[1][k]);return a;},{}),ctxMin:v.tier===0?4:16,agent:!!v.agent,dsgvo:!!v.lokal,
  mtok,mtokTag:Math.round(mtok/dauer*1000)/1000,preisMtok:10,latenz:3,parallel:false,einheit:v.tier===0?'Kurzfälle':'Pakete',einheiten:Math.max(4,Math.round((v.tier===0?40:12*dauer)*G.f)),
  lohnBasis:preis,teile:v.teile||[],rollen:v.rollen.map(([n,anf])=>({n,anf})),stufe:v.tier,gross:!!v.gross,parallel:!!v.parallel};
 /* Der erste geführte Auftrag braucht einen gefahrlosen Lernpfad. Dynamische Kundschaft
    und die Wendung „Vertraulich“ können sonst selbst einen Mikro-Zettel mit Datenschutz-
    risiko versehen, bevor Kurse oder Agenten-Tools mit Schutzfunktionen erklärt wurden. */
 const _fertig=(!starterSicher&&typeof zsVeredeln==='function')?zsVeredeln(_j,v):_j;
 return (typeof dsJobNachruesten==='function')?dsJobNachruesten(_fertig):_fertig;   /* Ära 9: Zettelschmiede – Auftraggeber, Anliegen, Wendung · v9.8: hohes Risiko heißt Vor-Ort-Pflicht */
}
function hlRollen(j){if(j&&j.teamMax>1){const n=Math.max(1,Math.min(j.teamMax,Number(j.teamN)||1));const anf=(j.rollen&&j.rollen[0]&&j.rollen[0].anf)||j.anf;return Array.from({length:n},(_,i)=>({n:'Agent '+(i+1),anf}));}return j.rollen||[{n:'Bearbeiten',anf:j.anf}];}   /* Ära 9: Agenten-Teams */
function hlRollenJob(j,i){return {...j,evalRoot:j,rollen:null,anf:hlRollen(j)[i].anf,mtokTag:j.mtokTag/hlRollen(j).length*(j.teamMax>1?hlKoordF(hlRollen(j).length,false):1),parallel:(!j.rollen||j.gross)&&!!j.parallel,teile:[],team:null};}   /* Ära 8: Großkunden-Zettel sind Andrang-Zettel (Server-Laufzeitumgebungen lohnen) */
function jobCheck(p,j){
 const c=jobCheckBasis(p,j);
 if(!p.api){const b=buchtVon(p);
  if(!b){c.ok=false;c.gruende.push('Keine GPU-Bucht zugewiesen (Stall → Belegen)');}
  else if(!passtInBucht(p,b)){const ueber=vramPig(p)-GPUS[b.gpu].vram;   /* Ära 7.5 (R-01): RAM-Auslagerung ist erlaubt – langsam, aber arbeitsfähig */
   if(stackVon(b).server){c.ok=false;c.gruende.push('Server-Laufzeitumgebung braucht das ganze Modell im VRAM ('+ueber.toFixed(1)+' GB Überhang)');}
   else if(ueber>ramFrei(p,b)){c.ok=false;c.gruende.push('Überhang ('+ueber.toFixed(1)+' GB) passt nicht ins RAM dieses Rechners ('+ramFrei(p,b)+' GB frei) – kleiner quantisieren');}
   else c.gruende.push('⚠️ '+ueber.toFixed(1)+' GB lagern im RAM – zäher Trab ('+tokps(p)+' tok/s)');}}
 for(const id of j.teile||[])if(!hlStand().teile[id]){c.ok=false;c.gruende.push('Fehlt: '+HL_TEILE[id].n);}
 if((j.teile||[]).includes('embedding')&&(!p.setups.includes('rag')||!hlRagBereit())){c.ok=false;c.gruende.push(hlRagBereit()?'Wissenspipeline nicht angeschlossen – Wissenswerkstatt → „Anschließen“ bei '+p.name:'Wissenspipeline fehlt – Wissenswerkstatt: Vektordatenbank + Embedding-Modell einrichten');}
 if((j.teile||[]).length&&!p.api&&((buchtVon(p)||{}).ramGB||0)<2){c.ok=false;c.gruende.push('2 GB Host-RAM für die Hilfsmodelle benötigt');}
 if((j.teile||[]).includes('embedding')&&hlIndexAlter()>3&&!(j.team&&j.team.indexFrisch)){c.erfolg-=18;c.gruende.push('⚠️ Alter Index: falsche Belege möglich (−18 Qualität)');}   /* Ära 7.5 (C5): bei Annahme frischer Index gilt für die Laufzeit */
 if((j.teile||[]).includes('embedding')&&forschungFrei('rag')){c.erfolg+=2;c.boni.push('Quellenlabor: unabhängiger Retrieval-Prüfsatz (+2)');}
 if(hlEvent().id==='schema'&&!j.kontrolle&&!hlGeprueft(p,j)){c.erfolg-=10;c.gruende.push('⚠️ Ausgabeformat geändert (−10); Stressprüfung empfohlen');}
 if(hlEvent().id==='audit'&&p.contaminated){c.erfolg-=22;c.gruende.push('⚠️ Kontaminierte Trainingsdaten (−22)');}
 if(!p.api&&p.pT<1&&p.denken&&j.agent){c.erfolg-=12;c.gruende.push('⚠️ Kleines Modell: Denkmodus + Werkzeuglast überfordern die Ausführung');}   /* v9.8: Leih-Tiere aus der Cloud sind keine kleinen Modelle */
 if(j.kontrolle){c.erfolg+=6;c.boni.push('Kontrollpaket: Format- und Quellenchecks (+6, 8 €/Arbeitstag)');}
 c.erfolg=kl(c.erfolg,4,97); return c;
}
function hlFinger(p,j){return JSON.stringify([p.w,p.quant,p.denken,p.temp,p.adapters,p.setups,p.geschirr,p.bucht,p.zustand,p.contaminated,p.krank,j.anf,j.teile,hlStand().teile,hlStand().indexTag,hlEvent().id,S.tag]);}
function hlGeprueft(p,j){j=j.evalRoot||j;return (hlStand().pruefungen[p.uid+':'+j.id]||{}).finger===hlFinger(p,j);}
function hlPruefen(uid,jid){if(typeof hofZu==='function'&&hofZu('Prüfen'))return;   /* v9.9 (R2) */const p=S.tiere.find(x=>x.uid===uid),j=S.jobs.find(x=>x.id===jid);if(!p||!j||p.status!=='frei')return;
 const preis=Math.max(3,Math.round(jobLohnGesamt(j)*0.06));   /* Ära 7.5 (W-22): 6 % des Auftragswerts, mind. 3 € */
 if(!hlGeprueft(p,j)){if(rhCash()<preis){melde(geld(preis)+' für unabhängige Testfälle fehlen.','schlecht');return;}
 buche(-preis,'pflege','Dreistufige Evaluation · '+p.name);hlStand().pruefungen[uid+':'+jid]={finger:hlFinger(p,j)};sichern();kopfNeu();}
 const basis={...p,w:MODELLE[p.modell]?.w||p.w,adapters:[],setups:[],geschirr:null,denken:false,temp:'werk',zustand:100,krank:null};
 const b=jobCheckBasis(basis,j),c=jobCheck(p,j);
 const stress=Math.max(4,c.erfolg-(hlIndexAlter()>3&&p.setups.includes('rag')?18:0)-(p.contaminated?22:0)-(p.pT<1&&j.agent?12:0));
 blattAuf('🔬 Drei Perspektiven auf '+p.name,'<div class="karte hell"><h3>Grundmodell → Konfiguration → Stresstest</h3><p>Simulierte Testfälle für <b>'+esc(j.t)+'</b>. Keine Messung eines realen Modells. Prüfen erhöht keine Fähigkeiten. Ein sauber abgegebener, vorab geprüfter Auftrag kann einen Qualitätsbonus verdienen.</p></div><div class="hlTests">'+
 [["1 · Grundmodell",b.erfolg,'Ohne Adapter, Denkmodus und Werkzeuge.'],['2 · Mit Ausrüstung',c.erfolg,'Aktuelle Gewichte, Adapter, Hilfsmittel und Hardware.'],['3 · Unter Stress',stress,'Alte Quellen, kontaminierte Daten und überforderte Werkzeuge.']].map(([n,v,t])=>'<div class="karte"><h3>'+n+'</h3><b class="hlZahl">'+Math.round(v)+' %</b><p>'+t+'</p></div>').join('')+'</div><div class="karte"><h3>Warnzeichen & Gegenmaßnahmen</h3>'+hlWarnHtml(p,j)+ '<p>Dieses Ergebnis gilt nur für diese Konfiguration und diesen Hoftag. In der Einsatzplanung lassen sich passende Modelle direkt vergleichen.</p>'+hlBtn('Zurück zur Einsatzplanung',"zeigeAuftrag('"+jid+"')")+'</div>','evaluation');
}
function hlWarnHtml(p,j){const c=jobCheck(p,j),warn=[...c.gruende];if(p.contaminated)warn.push('Trainingsdaten prüfen und sauberen Checkpoint verwenden.');if(p.zustand<65)warn.push('Sitzungspflege nötig: Cache-/Kontextzustand niedrig.');if((hlStand().energie[p.uid]||'auto')==='eigen')warn.push('Nur Eigenstrom: bei Unterdeckung pausiert die Arbeit, Frist läuft weiter.');
 return warn.length?'<ul class="hlWarn">'+warn.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>':'<p class="hlGut">✓ Keine konkreten Warnzeichen. Ein Restrisiko bleibt.</p>';}
function hlTeamCheck(j,wahl){
 const rollen=hlRollen(j),ids=rollen.map((r,i)=>wahl[i]),ps=ids.map(id=>S.tiere.find(p=>p.uid===id));
 let gruende=[],warnungen=[],ch=[];rollen.forEach((r,i)=>{const p=ps[i];if(!p){const id=wahl[i];const q=id?S.tiere.find(t=>t.uid===id):null;
  gruende.push(r.n+': '+(!id?'noch kein Modell eingeteilt':!q?'Modell „'+id+'“ gibt es nicht':q.status!=='frei'?q.name+' ist beschäftigt ('+q.status+')':(!q.bucht&&!q.api)?q.name+' hat keine GPU-Bucht':'Modell wählen'));return;}
  const jc={...hlRollenJob(j,i),teile:i===rollen.length-1?j.teile:[],kontrolle:j.kontrolle};
  const c=jobCheck(p,jc);if(!c.ok)gruende.push(r.n+': '+c.gruende.join(' · '));else warnungen.push(...c.gruende.map(t=>r.n+': '+t));ch.push(c);
 });
 const einzigartig=[...new Set(ids.filter(Boolean))];
 if(j.teamMax>1&&ids.filter(Boolean).length!==einzigartig.length)gruende.push('Jede Teamrolle braucht ein eigenes Modell – dasselbe Modell kann nicht gleichzeitig doppelt arbeiten.');
 // Keine Addition von Modell-IQ: jede Stufe muss ihren eigenen Mindestwert erreichen.
 let chance=ch.length?Math.min(...ch.map(c=>c.erfolg)):0;
 const teamwork=einzigartig.length>1;
 if(teamwork)chance-=3; // Übergaben sind nicht kostenlos und können scheitern.
 let gleich=false;if(j.teamMax>1&&teamwork){const gs=einzigartig.map(id=>(S.tiere.find(t=>t.uid===id)||{}).geschirr);gleich=gs.every(g=>g&&g===gs[0]);if(gleich){chance+=5;warnungen.push('🤝 Eingespieltes Team: gleiches Agenten-Tool – +2 Qualität, Abstimmung nur '+Math.round((hlKoordF(2,true)-1)*100)+' % je weiterem Agenten');}else warnungen.push('👥 Gemischtes Team: Abstimmung '+Math.round((hlKoordF(2,false)-1)*100)+' % je weiterem Agenten, −3 Qualität');}   /* Ära 9: Agenten-Teams */
 /* Ära 7 (Haupt-Session, R5) – eingespieltes Team: gleiche Modellfamilie = gleicher Tokenizer,
    weniger Übersetzungsverlust bei Übergaben (12 % → 8 %) */
 const teamF=(j.teamMax>1&&gleich)?hlKoordF(rollen.length,true)/hlKoordF(rollen.length,false):1;   /* Ära 9: eingespieltes Team – Abstimmung 5 % statt 10 % je weiterem Agenten */
 const uebF=(j.teamMax>1)?1:(teamwork?((typeof hlUebergabeF==='function')?hlUebergabeF(einzigartig.map(id=>S.tiere.find(t=>t.uid===id))):1.12):1);   /* Ära 9: Teams zahlen Koordination statt Übergaben */
 if(typeof merkmalHat==='function'){const eig=einzigartig.map(id=>S.tiere.find(t=>t.uid===id)).filter(p=>p&&merkmalHat(p,'eigensinnig')).length;if(eig){chance+=teamwork?-4*eig:2*eig;warnungen.push(teamwork?'🎭 Eigensinnig: Team-Übergabe −4':'🎭 Eigensinnig: solo +2');}
  const scharf=einzigartig.map(id=>S.tiere.find(t=>t.uid===id)).filter(p=>p&&merkmalHat(p,'scharfsinnig')).length;if(scharf){chance+=3*scharf;}}   /* Ära 8: Merkmale */
 /* Ära 7.5 (W-17): roh = Auftrags-Mtok je Arbeitstag ÷ Tagesbedarf, UNGEDECKELT – daraus folgt die Stundenzahl */
 let roh=ch.length?Math.min(...ch.map(c=>(c.roh??c.anteil))):0;
 for(const uid of einzigartig){const p=S.tiere.find(t=>t.uid===uid),jobs=ids.map((id,i)=>id===uid?hlRollenJob(j,i):null).filter(Boolean);
  if(p){const last=jobs.reduce((a,jj)=>a+jj.mtokTag,0)*uebF;roh=Math.min(roh,mtokTagKapazitaet(p,j)/Math.max(.001,last));}}
 if(teamF<1)roh=roh/teamF;   /* Ära 9: gleiches Agenten-Tool → weniger Abstimmung → mehr Tagesleistung */
 if(typeof dsPruefung==='function'){const d=dsPruefung(j,einzigartig.map(id=>S.tiere.find(t=>t.uid===id)).filter(Boolean));if(d&&d.warnung)warnungen.push(d.warnung);}   /* Ära 9: Datenschutz vor der Zusage */
 return {ok:!gruende.length,gruende,warnungen,erfolg:kl(chance,4,97),anteil:kl(roh,0,1),roh,ids:einzigartig,teamwork,uebF,gleich};
}
/* ── Ära 7.5 (W-17): Stunden-Modell ──
   Arbeit eines Zettels = j.mtok (Gesamt-Mtok). Ein Team schafft je Arbeitstag (14 h) roh × mtokTag Auftrags-Mtok;
   Stunden = 14 × Rest-Mtok ÷ Tagesleistung. Schnelle Tiere (Quantisierung, bessere Karte, Laufzeitumgebung) sind früher fertig,
   langsame reißen die Frist (frist = Annahmetag + tage − 1 + puffer; Eilauftrag: puffer 0). */
function hlMtok(j){return j.mtok||Math.round((j.mtokTag||0)*(j.tage||1)*100)/100;}
function hlLeistung(j,c){return Math.max(1e-4,(c.roh||0)*(j.mtokTag||hlMtok(j)/Math.max(1,j.tage)));}
function hlStunden(j,c,mtokRest){const rest=mtokRest??(j.team?j.team.mtokRest:hlMtok(j));const std=14*rest/hlLeistung(j,c);return {std,tage:Math.max(1,Math.ceil(std/14-1e-9)),leistung:hlLeistung(j,c)};}
function hlFristTage(j){return (j.tage||1)+(j.puffer??1);}
/* v9.8 (Spieltest): das Fristbudget in Stunden beginnt jetzt – vergangene Stunden des Annahmetags sind verbraucht */
function hlFristBudget(j){const heute=(hlStand().phase==='tag')?kl((S.tagMs||0)/TAG_MS,0,1)*14:0;return Math.max(1,Math.round((hlFristTage(j)*14-heute)*10)/10);}
function hlRestStunden(j,v=1){if(!j||!j.team)return null;const c=hlTeamCheck(j,j.team.wahl);if(!c.ok)return {std:(j.team.stdStart||14)*(j.team.mtokRest/Math.max(1e-6,j.team.mtokGesamt)),blockiert:true};
 const st=hlStunden(j,c,j.team.mtokRest).std,heute=(hlStand().phase==='tag')?Math.max(0,kl((S.tagMs||0)/TAG_MS,0,1)-(j.team.heuteAnteil||0))*14:0;return {std:Math.max(0,st-heute),heuteFertig:st-heute<=1e-6,leistung:c.roh};}   /* v9.8: nur Stunden seit der Annahme zählen */
function hlStundenText(std){return std<1?rhN(std*60,0)+' min':rhN(std,1)+' h';}

function hlWaehlen(jid,i,uid){const p=S.tiere.find(t=>t.uid===uid);if(!p||p.status!=='frei')return;hlAuswahl[jid]=hlAuswahl[jid]||{};hlAuswahl[jid][i]=uid;zeigeAuftrag(jid);if(typeof startGuideZusage==='function')startGuideZusage();}
function hlAuto(jid){const j=S.jobs.find(j=>j.id===jid);if(!j)return;const w={};hlRollen(j).forEach((r,i)=>{const jj={...hlRollenJob(j,i),teile:i===hlRollen(j).length-1?j.teile:[]};const ps=S.tiere.filter(p=>p.status==='frei'&&jobCheck(p,jj).ok).sort((a,b)=>(a.api?10:a.pT)-(b.api?10:b.pT));if(ps[0])w[i]=ps[0].uid;});hlAuswahl[jid]=w;zeigeAuftrag(jid);if(typeof startGuideZusage==='function')startGuideZusage();}
function hlKontrolle(jid){if(typeof hofZu==='function'&&hofZu('Kontrollpaket'))return;   /* v9.9 (R2) */const j=S.jobs.find(x=>x.id===jid);if(!j||j.team||S.tiere.some(p=>p.job===jid)){if(j)melde('Das Kontrollpaket lässt sich nur vor der Annahme umschalten.','schlecht');return;}   /* Ära 9 (R4-5) */j.kontrolle=!j.kontrolle;sichern();zeigeAuftrag(jid);}
function jobAnnehmen(jid,uid){const j=S.jobs.find(x=>x.id===jid);if(!j)return;hlAuswahl[jid]=Object.fromEntries(hlRollen(j).map((r,i)=>[i,uid]));hlTeamStart(jid);}
function hlTeamStart(jid){const j=S.jobs.find(x=>x.id===jid);if(!j)return;
 if(typeof dsGeschlossen==='function'&&dsGeschlossen()){melde('Der Hof ist geschlossen – im Tagesbericht oder Hofhaus kannst du neu anfangen.','schlecht');return;}   /* Ära 9 */
 if(j.team||S.tiere.some(p=>p.job===jid)){melde(j.t+' läuft bereits.','schlecht');return;}
 if(hlStand().phase!=='tag'){melde('Die Nachtplanung ist offen – erst „Zurück zum Tag“ oder die Nacht starten, dann annehmen.','schlecht');return;}   /* Ära 8: keine stillen Abbrüche */
 const w=hlAuswahl[jid]||{},c=hlTeamCheck(j,w);if(!c.ok){melde(c.gruende[0]||'Team unvollständig','schlecht');return;}
 if(c.ids.some(id=>{const p=S.tiere.find(t=>t.uid===id);return !p||p.status!=='frei';})){melde('Ein Modell ist inzwischen beschäftigt.','schlecht');return;}
 const st=hlStunden(j,c);
 /* Ära 7.5 (W-17/W-24): Risiko ist wählbar – kein Kapazitätsriegel mehr, aber laute Warnung (Behütet: Rückfrage) */
 const budget=hlFristBudget(j),quote=st.std/Math.max(1,budget);   /* v9.8: Budget ab jetzt */
 if(quote>2){melde('Aussichtslos: ≈ '+hlStundenText(st.std)+' Arbeit gegen '+budget+' h Fristbudget – so würde jeder Tag nur Strafe kosten. Schnelleres Tier, kleineres Los oder Team.','schlecht');return;}
 if(quote>1&&!(hlStand().phase==='tag'&&confirm('⚠️ Rot: Dieses Team braucht ≈ '+hlStundenText(st.std)+' ('+st.tage+' Arbeitstage), das Fristbudget erlaubt nur noch '+budget+' h (Frist Tag '+(S.tag+j.tage-1+(j.puffer??1))+'). Fristbruch = 12 % Vertragsstrafe und keine volle Auszahlung; ab 70 % fertiger Arbeit gibt es 30 % Teilabnahme. Trotzdem wagen?')))return;   /* Ära 7.5: Rückfrage auf ALLEN Stufen */
 if(typeof dsWahrscheinlichkeit==='function'){const dps=c.ids.map(id=>S.tiere.find(t=>t.uid===id)).filter(Boolean);const d=dsWahrscheinlichkeit(j,dps);if(d.p>0&&!confirm('🛡️ Datenschutz-Risiko '+rd(d.p*100)+' %: '+d.offen.map(p=>p.name).join(', ')+' ohne Schulung oder ein Agenten-Tool mit Schutzfunktionen. Ein Verstoß kostet Strafe, Ruf und eine Abmahnung – nach '+((typeof dsAbmahnungMax==='function')?dsAbmahnungMax():2)+' Abmahnungen wird der Hof geschlossen. Trotzdem annehmen?'))return;}   /* Ära 9 */
 j.vereinbart=jobLohnGesamt(j);const mtok=hlMtok(j);
 j.team={wahl:{...w},mtokGesamt:mtok,mtokRest:mtok,stdStart:Math.round(st.std*10)/10,rest:st.tage,frist:S.tag+j.tage-1+(j.puffer??1),seg:[],indexFrisch:hlIndexAlter()<=3,geprueft:c.ids.every(id=>hlGeprueft(S.tiere.find(p=>p.uid===id),j)),
  heuteAnteil:kl((S.tagMs||0)/TAG_MS,0,1),startTag:S.tag};   /* v9.8 (Spieltest): die Arbeit beginnt zur Annahmezeit – vorher vergangene Stunden zählen nicht */
 c.ids.forEach(id=>{const p=S.tiere.find(t=>t.uid===id);p.status='job';p.job=j.id;p.rest=st.tage;});
 j.team.zusageQuote=quote;questHook('zettel_angenommen',null);   /* Ära 8: Mut wird bei der Abnahme belohnt */
 if(typeof zsBeiAnnahme==='function')zsBeiAnnahme(j);   /* Ära 9: sichtbare Vorkasse-Wendung */
 const ersterGuideLauf=typeof startGuideLaufMarkieren==='function'&&startGuideLaufMarkieren();
 melde((quote>1?'🔴 ':quote>0.8?'🟡 ':'🟢 ')+j.t+' übernommen – ≈ '+hlStundenText(st.std)+' Arbeit von '+budget+' h Fristbudget ('+rd(quote*100)+' %), Frist Tag '+j.team.frist+(quote>1?' – Fristbruch droht, Strafe 12 %!':quote>0.8?' – knapp':' – mit Reserve'),quote>1?'info':'gut');
 if(j.kunde)kundeVon(j.kunde);sichern();alles();zeigeJobs();
 if(ersterGuideLauf&&typeof startGuideLaufSprechen==='function')startGuideLaufSprechen();
}
/* Ära 7.5 (Spieltest 7.5): Auftrag zurückgeben – 12 % Vertragsstrafe wie beim Fristbruch, Tiere sofort frei, Kunde merkt es sich */
function hlAbbrechen(jid){if(typeof hofZu==='function'&&hofZu('Zurückgeben'))return;   /* v9.9 (R2) */const j=S.jobs.find(x=>x.id===jid);if(!j||!j.team)return;
 const strafe=Math.round((j.vereinbart||jobLohnGesamt(j))*.12*(skillAktiv('vertragskunst')?.7:1));
 if(typeof confirm==='function'&&!confirm('„'+j.t+'“ zurückgeben? Vertragsstrafe '+geld(strafe)+', keine Auszahlung, der Kunde vermerkt den Rückzieher.'))return;
 buche(-strafe,'strafe','Auftrag zurückgegeben · '+j.t);const ps=[...new Set(Object.values(j.team.wahl))].map(id=>S.tiere.find(p=>p.uid===id)).filter(Boolean);
 kundeBewerten(j,{fail:true,anteil:0},{zeilen:[]});ps.forEach(p=>{p.status='frei';p.job=null;p.rest=0;});S.jobs=S.jobs.filter(x=>x.id!==jid);
 melde('↩️ '+j.t+' zurückgegeben – '+geld(strafe)+' Vertragsstrafe.','schlecht');sichern();alles();zeigeJobs();}
function hlTeamsTag(energie,bericht){
 for(const j of [...S.jobs].filter(j=>j.team)){
  const team=j.team,c=hlTeamCheck(j,team.wahl),ps=c.ids.map(id=>S.tiere.find(p=>p.uid===id)).filter(Boolean);
  if(team.mtokRest===undefined){team.mtokGesamt=hlMtok(j);team.mtokRest=team.mtokGesamt*Math.max(0,team.rest)/Math.max(1,j.tage);} // Altstände (Ära 7.0–7.4)
  const cloudAus=ps.some(p=>p.api)&&typeof ereignisCloudAusfall==='function'&&ereignisCloudAusfall();   /* Ära 8: Cloud-Ausfall */
  const v=cloudAus?0:Math.min(1,...ps.map(p=>p.api?1:hlVersorgung(p,energie)));const strom=v>0.05;   /* Ära 8: Stromdeckung wirkt anteilig – ein 4-h-Netzausfall kostet 4 h, nicht den ganzen Tag */
  const bereit=strom&&c.ok&&ps.length===c.ids.length;
  if(bereit){const leistung=hlLeistung(j,c)*(1-(team.heuteAnteil||0))*v;team.heuteAnteil=0;
   if(v<0.98)bericht.zeilen.push({t:'⚡ '+j.t+': heute nur '+rd(v*100)+' % Stromdeckung – '+rd(14*v)+' von 14 Arbeitsstunden geschafft.',art:'info'});team.mtokRest=Math.max(0,Math.round((team.mtokRest-leistung)*1000)/1000);team.seg.push({anteil:c.anteil,erfolg:c.erfolg,mtok:leistung});
   team.rest=Math.ceil(team.mtokRest/Math.max(1e-4,hlLeistung(j,c))-1e-9);
   if(typeof hlProben==='function')hlProben(j,team,c,ps,bericht);   /* Ära 7 (Haupt-Session, Q5): tägliche Bewährungsproben je Rolle */
   if(j.kontrolle)buche(-8,'pflege','Kontrollpaket · '+j.t);
   ps.forEach(p=>{if(p.api){const anteil=Object.values(team.wahl).filter(id=>id===p.uid).length/hlRollen(j).length;buche(-jobTagesKosten(p,{...j,mtokTag:Math.min(leistung,j.mtokTag)*anteil*(c.uebF||(c.teamwork?1.12:1))}),'api','Team-Token · '+p.name);}p.rest=team.rest;});
  }else bericht.zeilen.push({t:'⏸ '+j.t+': '+(cloudAus?'Cloud-Ausfall – das Leih-Tier antwortet heute nicht.':!strom?'Energie reicht für mindestens eine Stufe nicht.':'Team erfüllt die Anforderungen nicht mehr.')+' Lieferfrist: Tag '+team.frist+'.',art:'schlecht'});
  const spaet=S.tag>=team.frist&&team.mtokRest>1e-6;
  if(team.mtokRest>1e-6&&!spaet)continue;
  hlTeamAbschluss(j,c,ps,bericht,spaet);
 }
}
/* Ära 7.5 (Stunden-Modell, Teil 2): Abschluss eines Zettels – von der Abendabrechnung UND von der Sofort-Abnahme genutzt */
function hlTeamAbschluss(j,c,ps,bericht,spaet){
  const team=j.team;
  const n=Math.max(1,team.seg.length),chance=team.seg.reduce((a,s)=>a+s.erfolg,0)/n;
  /* Ära 7.5 (W-04/W-05): drei Ausgänge – sauber, Reklamation (gestuft 40–90 % bezahlt, je nach Abstand zur Qualitätschance) oder GESCHEITERT (Vertragsstrafe 15 %, zweite Chance 8 %).
     Scheitern trifft nur schwache Besetzungen: der Würfel muss die Qualitätschance um mehr als 25 Punkte verfehlen. */
  const gelassen=ps.some(p=>typeof merkmalHat==='function'&&merkmalHat(p,'gelassen'));
  const wurf=Math.random()*100*(gelassen?0.8:1),gut=!spaet&&wurf<chance,gescheitert=!spaet&&!gut&&wurf>chance+25;   /* Ära 7.5: Scheitern ab Chance < 75 % möglich · Ära 8: Gelassen senkt den Würfel um 20 % */
  /* Ära 7.5 (Spieltest 4.6): Reklamation gestuft – knapp verfehlt = viel abgenommen, weit verfehlt = wenig (90 % … 40 %) */
  const akzeptiert=(spaet||gescheitert)?0:(gut?1:kl(0.9-(wurf-chance)/25*0.5,0.4,0.9)),er=einheitenRechnung(j,akzeptiert);
  if(typeof zsBeiAbschluss==='function')zsBeiAbschluss(j,er,gut,bericht,spaet,gescheitert);   /* Ära 9: Referenz, Testballon, Vorkasse */
  if(typeof dsAbschluss==='function')dsAbschluss(j,ps,bericht,gut&&!spaet&&!gescheitert);   /* Ära 9: Datenschutz-Verstoß? */
  const K=(typeof KUNDEN!=='undefined')?KUNDEN[j.kunde]:null;
  if(spaet){const strafe=Math.round(j.vereinbart*.12*(skillAktiv('vertragskunst')?.7:1));buche(-strafe,'strafe','Lieferfrist verpasst · '+j.t);
   const fertig=1-team.mtokRest/Math.max(1e-6,team.mtokGesamt);const teil=fertig>=0.7?Math.round(j.vereinbart*0.3):0;   /* Ära 7.5 (B3): fast fertige Arbeit wird zu 30 % vergütet */
   if(teil)buche(teil,'job',j.t+' · Teilabnahme nach Fristbruch');
   bericht.zeilen.push({t:'❌ '+j.t+': Lieferfrist verpasst ('+rhN(team.mtokRest,2)+' von '+rhN(team.mtokGesamt,2)+' Mtok blieben liegen). '+geld(strafe)+' Vertragsstrafe'+(teil?', aber '+rd(fertig*100)+' % fertig → Teilabnahme '+geld(teil):', keine Auszahlung')+'.',art:'schlecht'});
   if(typeof ereignisAbschluss==='function')ereignisAbschluss(j,er,ps,bericht,false,chance,team);}
  else if(gescheitert){const strafe=Math.round(j.vereinbart*(j.zweiteChance?.08:.15)*(skillAktiv('vertragskunst')?.7:1));buche(-strafe,'strafe','Vertragsstrafe: '+j.t);
   bericht.zeilen.push({t:'❌ '+j.t+' GESCHEITERT – die Besetzung war der Aufgabe nicht gewachsen ('+rd(chance)+' % Chance). Vertragsstrafe '+geld(strafe)+'.',art:'schlecht'});
   const k2=j.kunde?kundeVon(j.kunde):null;
   if(!j.zweiteChance&&K&&k2&&(K.geduld+(k2.sterne||3)>=(skillAktiv('dorfliebling')?3:4))){S.jobs.push({...j,id:'j'+(S.zaehler++),frisch:S.tag,team:null,vereinbart:undefined,kontrolle:false,zweiteChance:true});
    bericht.zeilen.push({t:'🔁 '+K.z+' '+K.n+' gibt euch eine zweite Chance – der Zettel hängt wieder an der Pinnwand (halbe Strafe beim nächsten Patzer).',art:'info'});}}
  else {/* Ära 7 (R9/Fund 1): Tier-Spezialist wirkt und stapelt mit dem Hof-Fokus · Ära 7.5: Minispiel-Lohnbonus (Preisrechner) */
   const miniB=(S.mini&&S.mini.lohnBonus)?(1+S.mini.lohnBonus):1;if(S.mini&&S.mini.lohnBonus)S.mini.lohnBonus=0;
   /* Ära 7.5 (B1): Bagatell-Reklamation – auch sichere Kleinzettel bergen 5 % Restrisiko (−15 % Lohn, Serie bleibt) */
   const bagatell=gut&&(j.mikro||j.groesse==='S')&&Math.random()<0.05;if(bagatell)er.lohn=Math.round(er.lohn*0.85);
   if(gut&&typeof zuchtPraegung==='function')ps.forEach(p=>zuchtPraegung(p,bericht));   /* Ära 8: Prägung nach 20 sauberen Aufträgen */
   if(typeof ereignisAbschluss==='function')ereignisAbschluss(j,er,ps,bericht,gut,chance,team);   /* Ära 8: Begeisterung, Trinkgeld, Empfehlung, Folgeauftrag, Datenleck */
   if(gut){if(j.groesse==='L')questHook('job_gross',null);if(j.eil)questHook('job_eil',null);if(j.gross)questHook('job_grosskunde',null);if((team.zusageQuote||0)>=0.8)questHook('job_mut',null);if((hlStand().serie||0)+1>=3)questHook('serie3',null);}   /* Ära 8: Hofziele */
   er.lohn=Math.round(er.lohn*(S.spezial===j.art?1.08:1)*(ps.some(p=>p.spezialArt===j.art)?1.08:1)*miniB);buche(er.lohn,'job',j.t+' · '+er.ok+'/'+er.einheiten+' abgenommen');S.statistik.jobs++;S.statistik.mtok+=team.mtokGesamt;S.jobArt=S.jobArt||{};S.jobArt[j.art]=(S.jobArt[j.art]||0)+1;
   bericht.zeilen.push({t:(gut?'✅ ':'⚠️ ')+j.t+': '+er.ok+'/'+er.einheiten+' abgenommen · '+geld(er.lohn)+(ps.some(p=>p.spezialArt===j.art)?' · 🎯 Spezialist +8 %':'')+(miniB>1?' · 🎪 Preisrechner-Bonus':'')+(bagatell?' · Bagatell-Reklamation: ein Formatfehler, −15 %':'')+(gut?'':' · Nacharbeit/Reklamation (Qualitätschance war '+rd(chance)+' % – Warnzeichen vor der Zusage prüfen)'),art:gut?'gut':'schlecht'});
   /* Ära 7.5 (W-02): XP wachsen mit der Auftragsgröße (Tage × Los), nicht nur mit der Stufe */
   const grF=(HL_GROESSEN[j.groesse]||HL_GROESSEN.M).f,aufwand=Math.max(1,(j.tage||1)/1.5)*grF;
   if(!gut){questHook('job_fertig',null);if(j.agent)questHook('job_agent_fertig',null);if(j.dsgvo)questHook('dsgvo_job',null);}   /* Ära 8: auch eine reklamierte Lieferung ist ein abgeschlossener Auftrag */
   if(gut){const gesamt=Math.round((20+j.tier*12)*aufwand),rollenN=Math.max(1,hlRollen(j).length);
    ps.forEach(p=>{const meine=Object.values(team.wahl).filter(id=>id===p.uid).length;
     tierXp(p,Math.round(Math.max(gesamt*0.25,gesamt*meine/rollenN)));});
    xpDazu(Math.round((14+j.tier*8)*aufwand));questHook('job_fertig',null);questHook('jobs_fertig',S.statistik.jobs);if(j.agent)questHook('job_agent_fertig',null);if(j.dsgvo)questHook('dsgvo_job',null);}
   else {ps.forEach(p=>tierXp(p,Math.round((20+j.tier*12)*aufwand*0.3)));xpDazu(Math.round((14+j.tier*8)*aufwand*0.3));}}
  /* Ära 7 (Haupt-Session, Q7): Liga-Zettel werden nicht kundenbewertet, sondern gewertet */
  if(j.liga){ if(typeof hlLigaErgebnis==='function')hlLigaErgebnis(j,team,gut,akzeptiert,ps,bericht); }
  else { kundeBewerten(j,{fail:spaet||gescheitert,rekla:!gut&&!gescheitert&&!spaet,anteil:akzeptiert},bericht);hlQualitaet(j,gut,bericht); }
  ps.forEach(p=>{p.status='frei';p.job=null;p.rest=0;p.zustand=kl(p.zustand-4,5,100);});S.jobs=S.jobs.filter(x=>x.id!==j.id);
}
/* Ära 7.5: Sofort-Abnahme – ist die Restarbeit eines Zettels vor Tagesende geschafft (Hofuhr), wird er JETZT abgenommen
   und die Tiere sind wieder frei. So zahlt sich Tempo (Quantisierung, Karte, Laufzeitumgebung) innerhalb eines Tages aus.
   Der bereits geleistete Tagesanteil wird als Segment gezählt; die Meldungen landen im Tagesprotokoll für den Morgenbericht. */
function hlSofortAbnahme(){
 if(!S||hlStand().phase!=='tag')return 0;let n=0,rechenTag=null;
 for(const j of [...S.jobs].filter(j=>j.team)){
  const team=j.team,c=hlTeamCheck(j,team.wahl),ps=c.ids.map(id=>S.tiere.find(p=>p.uid===id)).filter(Boolean);
  if(!c.ok||ps.length!==c.ids.length)continue;
  rechenTag=rechenTag||((typeof rhVorschau==='function')?rhVorschau():{});
  const v=Math.min(1,...ps.map(p=>p.api?1:hlVersorgung(p,rechenTag)));if(v<=0.05)continue;
  const r=hlRestStunden(j,v);if(!r||r.blockiert||!r.heuteFertig)continue;
  team.seg.push({anteil:c.anteil,erfolg:c.erfolg,mtok:team.mtokRest});team.mtokRest=0;team.rest=0;
  if(j.kontrolle)buche(-8,'pflege','Kontrollpaket · '+j.t);
  ps.forEach(p=>{if(p.api){const anteil=Object.values(team.wahl).filter(id=>id===p.uid).length/hlRollen(j).length;buche(-jobTagesKosten(p,{...j,mtokTag:Math.min(hlLeistung(j,c),j.mtokTag)*anteil*(c.uebF||1)}),'api','Team-Token · '+p.name);}});
  const bericht={zeilen:[]};hlTeamAbschluss(j,c,ps,bericht,false);
  S.tagesNotizen=S.tagesNotizen||[];bericht.zeilen.forEach(z=>{S.tagesNotizen.push(z);melde(z.t,z.art);});
  n++;
 }
 if(n){questHook('sofort_abnahme',null);sichern();if(typeof alles==='function')alles();}
 return n;
}
function hlQualitaet(j,gut,bericht){const h=hlStand();h.serie=gut?h.serie+1:0;h.best=Math.max(h.best||0,h.serie);if(!gut)return;
 h.sauber++;if(!h.arten.includes(j.art))h.arten.push(j.art);h.mikroSauber=(h.mikroSauber||0)+(j.mikro?1:0);h.teamSauber=(h.teamSauber||0)+(j.team&&new Set(Object.values(j.team.wahl)).size>1?1:0);
 const bonus=(j.team?.geprueft?.08:0)+(h.serie>=3?.05:0);
 if(bonus){const b=Math.min(60,Math.round(jobLohnGesamt(j)*bonus));   /* Ära 7.5 (W-22): Prämie gedeckelt */buche(b,'job','Qualitätsprämie · '+j.t);bericht.zeilen.push({t:'🏅 '+h.serie+' saubere Lieferungen in Folge · Qualitätsprämie '+geld(b)+'.',art:'gut'});}
}
function hlAuftragStatus(j){if(j.team){const r=hlRestStunden(j);return (r?(r.blockiert?'⏸ Team nicht einsatzfähig · ':r.heuteFertig?'⏳ wird mit der Abendabrechnung fertig · ':'noch ≈ '+hlStundenText(r.std)+' Arbeit · '):'')+'Frist Tag '+j.team.frist+(S.tag>j.team.frist-1&&!(r&&r.heuteFertig)?' ⚠️':'');}
 const alter=S.tag-(j.frisch||S.tag),bleibt=3-alter;
 return rhN(hlMtok(j),2)+' Mtok Arbeit · Frist: '+hlFristTage(j)+' Tag'+(hlFristTage(j)===1?'':'e')+(j.eil?' ⏱️ EIL – kein Puffer':' (inkl. '+(j.puffer??1)+' Tag Puffer)')+(bleibt<=1?' · <b class="hlRot">verfällt '+(bleibt<=0?'heute Abend':'morgen früh')+'</b>':'');}
function hlSchnellsteChip(j){const rollen=hlRollen(j);let best=null;const frei=S.tiere.filter(p=>p.status==='frei'&&(p.bucht||p.api));if(!frei.length)return '<span class="merk">kein freies Tier im Stall</span>';for(const p of frei){const c=hlTeamCheck(j,Object.fromEntries(rollen.map((r,i)=>[i,p.uid])));if(!c.ok)continue;const st=hlStunden(j,c);if(!best||st.std<best.std)best={p,std:st.std,tage:st.tage};}
 if(!best)return '<span class="merk">kein freies Tier erfüllt alle Stufen</span>';const q=best.std/hlFristBudget(j);return '<span class="merk '+(q>1?'schlecht':q>0.8?'':'gut')+'">'+(q>1?'🔴':q>0.8?'🟡':'🟢')+' '+esc(best.p.name)+': ≈ '+hlStundenText(best.std)+'</span>';}
function hlGroesseChip(j){const G=HL_GROESSEN[j.groesse]||HL_GROESSEN.M;return '<span class="merk'+(j.groesse==='L'?' gold':'')+'">'+G.z+' '+G.n+'</span>'+(j.eil?'<span class="merk schlecht">⏱️ Eilauftrag – kein Puffer, +35 % Lohn</span>':'')+(j.zweiteChance?'<span class="merk">🔁 zweite Chance</span>':'');}
function hlErsterPassenderJob(jobs){const treffer=[];for(const j of jobs||[]){for(const p of S.tiere.filter(p=>p.status==='frei'&&(p.bucht||p.api))){const w=Object.fromEntries(hlRollen(j).map((r,i)=>[i,p.uid])),c=hlTeamCheck(j,w);if(!c.ok)continue;
  /* „Grün“ in der Einführung bedeutet auch fachlich sicher: kein ungeschütztes
     Datenschutz-/Abmahnrisiko, nicht nur passende Werte und Frist. */
  if(typeof dsWahrscheinlichkeit==='function'&&dsWahrscheinlichkeit(j,[p]).p>0)continue;
  const st=hlStunden(j,c),budget=hlFristBudget(j);if(st.std<=budget)treffer.push({j,p,c,st,budget});}}return treffer.sort((a,b)=>Number(!a.j.mikro)-Number(!b.j.mikro)||a.st.std/a.budget-b.st.std/b.budget||a.j.tier-b.j.tier)[0]||null;}
function hlStartGuideHtml(x){if(!(typeof startGuideAktiv==='function'&&startGuideAktiv()))return '';if(!x)return '<div id="ada-erster-job" class="karte warnrand"><h3>🧭 Noch kein grüner Erstauftrag</h3><p>Kein geladenes Modell erfüllt gerade einen offenen Zettel vollständig. Prüfe ein anderes Modell oder warte auf neue kleine Zettel; Ada verhindert hier eine schlechte erste Zusage.</p></div>';return '<div id="ada-erster-job" class="karte hell"><h3>🧭 Adas grüner Vorschlag für den ersten Auftrag</h3><p><b>'+esc(x.j.t)+'</b> passt zu <b>'+esc(x.p.name)+'</b>: alle Anforderungen erfüllt, etwa '+rd(x.c.erfolg)+' % Qualitätsprognose und '+hlStundenText(x.st.std)+' Arbeit bei '+x.budget+' Stunden Fristbudget.</p><div class="reihe">'+hlBtn('Vorschlag genau prüfen',"zeigeAuftrag('"+x.j.id+"')",false,'gruen')+'<button class="knopf s hell" onclick="adaSprich(\'start_pinnwand\',true)">🔊 Ada erklärt die Auswahl</button></div></div>';}

/* ── Ära 9 · Agenten-Teams: mehrere Agenten mit Agenten-Tool teilen sich einen komplexen Zettel ──
   Arbeit je Agent = Gesamt ÷ N × Koordinationsfaktor (1 + 10 % je weiterem Agenten, gleiches Agenten-Tool 5 %).
   Gleich schnelle Agenten: 1 → 4 Tage, 2 → 2,2 Tage, 3 → 1,6 Tage. */
function hlKoordF(n,gleich){const R=(typeof BERUF_REGELN!=='undefined')?BERUF_REGELN:{koordJeAgent:.10,koordGleich:.05};const m=(typeof mcpEffekte==='function')?mcpEffekte().koordMinus:0;return 1+Math.max(0,(gleich?R.koordGleich:R.koordJeAgent)-m)*Math.max(0,n-1);}   /* v9.9: MCP prompts/sampling senken die Abstimmung */
function hlTeamGroesse(jid,n){const j=S.jobs.find(x=>x.id===jid);if(!j||j.team||!(j.teamMax>1))return;j.teamN=Math.max(1,Math.min(j.teamMax,Math.round(n)||1));hlAuswahl[jid]={};sichern();zeigeAuftrag(jid);}
function hlTeamSchaetzung(j,n){if(!j||!(j.teamMax>1))return null;const jj={...j,teamN:n};const rollen=hlRollen(jj);const jc={...hlRollenJob(jj,0),teile:j.teile||[],kontrolle:j.kontrolle};
 const kand=S.tiere.filter(p=>p.status==='frei'&&(p.bucht||p.api)&&jobCheck(p,jc).ok).sort((a,b)=>mtokTagKapazitaet(b,jc)-mtokTagKapazitaet(a,jc));
 if(kand.length<rollen.length)return null;const w={};rollen.forEach((r,i)=>{w[i]=kand[i].uid;});const c=hlTeamCheck(jj,w);if(!c.ok)return null;const st=hlStunden(jj,c);
 return {n,std:st.std,tage:st.tage,namen:kand.slice(0,rollen.length).map(p=>p.name),gleich:!!c.gleich,erfolg:c.erfolg};}
function hlTeamChip(j){if(!j||!(j.teamMax>1))return '';const teile=[];for(let n=1;n<=j.teamMax;n++){const s=hlTeamSchaetzung(j,n);teile.push(n+(n===1?' Agent':' Agenten')+': '+(s?'≈ '+rhN(s.std/14,1)+' Tage':'–'));}
 return '<span class="merk lila" title="Komplexer Zettel: Mehrere Agenten mit Agenten-Tool arbeiten gleichzeitig. Die Abstimmung kostet 10 % je weiterem Agenten, mit demselben Tool nur 5 %.">👥 Team bis '+j.teamMax+' · '+teile.join(' · ')+'</span>';}
function hlTeamAuswahlHtml(j){if(!j||!(j.teamMax>1)||j.team)return '';const n=Math.max(1,Math.min(j.teamMax,j.teamN||1));
 const zeilen=[];for(let k=1;k<=j.teamMax;k++){const s=hlTeamSchaetzung(j,k);zeilen.push('<tr><td>'+k+' Agent'+(k>1?'en':'')+'</td><td>'+(s?'≈ '+hlStundenText(s.std)+' ≙ '+rhN(s.std/14,1)+' Tage'+(s.gleich?' 🤝':''):'kein Team möglich')+'</td><td>'+(s?esc(s.namen.join(', ')):'–')+'</td></tr>');}
 return '<div class="karte"><h3>👥 Agenten-Team: '+n+' von bis zu '+j.teamMax+'</h3><p>Bei diesem komplexen Zettel arbeiten mehrere Agenten mit Agenten-Tool gleichzeitig. Die Arbeit teilt sich, die Abstimmung kostet '+Math.round((hlKoordF(2,false)-1)*100)+' % je weiterem Agenten (mit demselben Tool: '+Math.round((hlKoordF(2,true)-1)*100)+' %, „eingespieltes Team“ +2 Qualität). Frist: '+hlFristTage(j)+' Tage.</p>'+ 
  '<div class="reihe">'+Array.from({length:j.teamMax},(_,i)=>hlBtn((i+1)+' Agent'+(i?'en':''),"hlTeamGroesse('"+j.id+"',"+(i+1)+")",false,(i+1)===n?'gruen':'hell')).join('')+hlBtn('🔊 Ada zu Teams',"adaSprich('team_agenten',true)",false,'hell')+'</div>'+
  '<table class="vergleich abstand"><tr><th>Teamgröße</th><th>Dauer mit den schnellsten freien Agenten</th><th>Wer</th></tr>'+zeilen.join('')+'</table></div>';}
function zeigeJobs(){const h=hlStand(),laufend=S.jobs.filter(j=>S.tiere.some(p=>p.job===j.id)),offen=S.jobs.filter(j=>!laufend.includes(j));
 const pool=offen.filter(j=>hlFilter==='alle'||(hlFilter==='klein'?j.mikro:hlFilter==='team'?(hlRollen(j).length>1||j.teamMax>1):hlFilter==='wissen'?(j.teile||[]).length:j.tage>=2)),einstieg=hlErsterPassenderJob(offen);
 blattAuf('📌 Aufträge & Einsatzplanung',hlNavigation()+hlBriefingHtml()+
 '<details class="karte hlErfolge"><summary>🏅 '+h.serie+' saubere Lieferungen · Boni & Sammlung</summary><p>Bestserie '+h.best+' · '+h.arten.length+' Auftragsarten. Ab 3 sauberen Lieferungen: +5 %. Vorab geprüfte Teams: weitere +8 % bei sauberer Abnahme. Eine Reklamation beendet nur die aktuelle Serie.</p>'+hlAbzeichenHtml()+'</details>'+hlProjektHtml()+((typeof zsAnliegenHtml==='function')?zsAnliegenHtml(false):'')+'<div class="reihe"><button class="knopf s hell" onclick="adaSprich(\'zettelschmiede\',true)">🔊 Ada erklärt Kundschaft und Zettel</button></div>'+ 
 hlStartGuideHtml(einstieg)+(laufend.length?'<div id="ada-erster-lauf" class="karte"><h3>In Arbeit</h3>'+laufend.map(j=>'<div class="hlVertrag"><b>'+esc(j.t)+'</b><span>'+hlAuftragStatus(j)+'</span><progress max="'+rhN(j.team?.mtokGesamt||hlMtok(j),3)+'" value="'+rhN((j.team?.mtokGesamt||hlMtok(j))-(j.team?.mtokRest??hlMtok(j)),3)+'"></progress>'+(j.team?hlBtn('↩️ Zurückgeben (12 %)',"hlAbbrechen('"+j.id+"')",false,'hell'):'')+'<small>'+S.tiere.filter(p=>p.job===j.id).map(p=>esc(p.name)).join(' + ')+' · '+geld(jobLohnGesamt(j))+' vereinbart</small></div>').join('')+'</div>':'')+
 '<div class="hlNav">'+[['alle','Alle'],['klein','0,6B-tauglich'],['team','Teams & Ketten'],['wissen','Wissensaufträge'],['mehr','Mehrere Tage']].map(([id,n])=>hlBtn(n,"hlJobFilter('"+id+"')",false,hlFilter===id?'gruen':'hell')).join('')+'</div>'+
 (pool.length?pool.map(j=>'<article class="karte hlAuftrag"><div class="hlKopf"><h3>'+esc(j.t)+'</h3><b>'+geld(jobLohnGesamt(j))+'</b></div><p>'+esc(j.b)+'</p><div class="reihe abstand"><span class="merk">'+hlAuftragStatus(j)+'</span>'+hlGroesseChip(j)+(typeof zsWendungChip==='function'?zsWendungChip(j):'')+(j.teamMax>1?hlTeamChip(j):hlSchnellsteChip(j))+(typeof dsChip==='function'?dsChip(j):'')+(j.sektor?'<span class="merk">'+esc((typeof BERUF_SEKTOREN!=='undefined'&&BERUF_SEKTOREN[j.sektor])||j.sektor)+'</span>':'')+(j.teamMax>1?'<span class="merk gold">🏗️ komplex · '+j.tage+' Tage</span>':'<span class="merk">'+hlRollen(j).length+' Stufe(n)</span>')+(j.mikro?'<span class="merk gut">Auch 0,6B-Spezialisten</span>':'')+(j.dsgvo?'<span class="merk">🔒 nur lokal</span>':'')+'</div><div class="hlStufen">'+hlRollen(j).map(r=>'<span>'+r.n+'<small>'+Object.entries(r.anf).map(([k,v])=>WERTE[k]+' ≥ '+v).join(' · ')+(j.agent?' · Agentenleistung ≥ 40 (Werkzeug × Tool-Eignung)':'')+'</small></span>').join('')+'</div>'+(j.teile||[]).map(id=>'<span class="merk '+(h.teile[id]?'gut':'schlecht')+'">'+HL_TEILE[id].z+' '+HL_TEILE[id].n+'</span>').join('')+'<div class="reihe abstand">'+hlBtn('Modelle vergleichen & einteilen',"zeigeAuftrag('"+j.id+"')",false,'gruen')+'</div></article>').join(''):'<div class="karte"><p>Für diesen Filter ist gerade kein Auftrag offen. Andere Kategorien prüfen oder am nächsten Hoftag wiederkommen.</p></div>')+'<p class="hlHinweis">Auszahlung nach Abnahme. Jeder Zettel trägt eine Gesamtarbeit in Mtok – wie viele STUNDEN dein Tier dafür braucht, steht in der Einsatzplanung neben jedem Kandidaten (schnelle Tiere sind früher fertig, langsame reißen die Frist). Fristbruch: 12 % Strafe, keine Auszahlung · Reklamation: 55 % bezahlt · Scheitern (Besetzung deutlich zu schwach): 15 % Strafe. Alle Zahlen sind Spielannahmen.</p>','jobs');if(typeof startGuidePinnwand==='function'&&S.tiere.some(p=>p.bucht)&&!laufend.length)startGuidePinnwand();}
function hlJobFilter(f){hlFilter=f;zeigeJobs();}
function zeigeAuftrag(jid){const j=S.jobs.find(x=>x.id===jid);if(!j)return;const w=hlAuswahl[jid]||{},c=hlTeamCheck(j,w),rollen=hlRollen(j);
 const ps=S.tiere.filter(p=>p.status==='frei'&&(p.bucht||p.api));
 blattAuf('🧑‍🌾 Einsatz: '+j.t,hlNavigation()+'<div id="ada-eignung" class="karte hell"><h3>'+esc(j.t)+' · '+geld(jobLohnGesamt(j))+'</h3><p>'+esc(j.b)+'</p><div class="reihe">'+hlGroesseChip(j)+'</div><p>'+hlAuftragStatus(j)+'. Jede Stufe braucht passende Fähigkeiten. <b>Grün erfüllt die Anforderung; Rot nennt den fehlenden Wert oder die fehlende Ausrüstung.</b> Dasselbe Modell kann mehrere Stufen übernehmen; seine Kapazität wird dabei geteilt. Verschiedene Modelle kosten Übergaben (+12 % Tokenlast, −3 Qualität). <b>Die Stundenzahl je Kandidat zeigt, wie lange die Stufe mit diesem Tier dauert</b> – Quantisierung, schnellere Karte oder ein Server-Laufzeitumgebung verkürzen sie.</p>'+hlBtn('Günstige passende Modelle vorschlagen',"hlAuto('"+jid+"')")+'<button class="knopf s hell" onclick="adaSprich(\'start_eignung\',true)">🔊 Eignung erklären</button></div>'+
 ((typeof hlTeamAuswahlHtml==='function')?hlTeamAuswahlHtml(j):'')+
 rollen.map((r,i)=>{const jj={...hlRollenJob(j,i),teile:i===rollen.length-1?j.teile:[]};return '<div class="karte"><h3>'+(i+1)+' · '+r.n+'</h3><div class="reihe">'+Object.entries(r.anf).map(([k,v])=>'<span class="merk">'+WERTE[k]+' ≥ '+v+'</span>').join('')+'</div><p>'+j.ctxMin+'k Kontext · ≥ '+j.latenz+' tok/s'+(j.dsgvo?' · nur lokal':'')+'</p>'+
 ps.slice().sort((a,b)=>Number(jobCheck(b,jj).ok)-Number(jobCheck(a,jj).ok)||a.pT-b.pT).map(p=>{const q=jobCheck(p,jj),ew=effW(p);return '<div class="hlKandidat '+(w[i]===p.uid?'hlAusgewaehlt':'')+'"><div><b>'+esc(p.name)+'</b> <span class="merk">'+(p.api?'Cloud':p.pT+'B')+'</span><small>'+Object.entries(r.anf).map(([k,v])=>'<span class="'+(ew[k]>=v?'hlGut':'hlRot')+'">'+WERTE[k]+' '+ew[k]+'/'+v+'</span>').join(' · ')+'</small><small>'+rd(q.erfolg)+' % Qualitätsprognose · ⏱️ '+hlStundenText(14*j.tage/Math.max(1e-6,(q.roh??q.anteil)))+' für diese Stufe ('+rhN(mtokTagKapazitaet(p,jj),1)+' Mtok/Tag) · '+(p.api?'API':'Strom')+' ~'+geld(Math.ceil(jobTagesKosten(p,jj)*Math.max(1,Math.ceil(j.tage/Math.max(1e-6,(q.roh??q.anteil))))))+'</small>'+(!q.ok?'<small class="hlRot">'+esc(q.gruende.join(' · '))+'</small>':'')+'</div>'+hlBtn(w[i]===p.uid?'✓ Eingeteilt':'Einteilen',"hlWaehlen('"+jid+"',"+i+",'"+p.uid+"')",!q.ok,w[i]===p.uid?'gruen':'hell')+'</div>';}).join('')+(!ps.length?'<p>Kein freies Modell mit Hardware. Im Stall ein Modell zuweisen.</p>':'')+'</div>';}).join('')+
 '<div class="karte"><h3>🔬 Vor der Zusage</h3><p>Grundmodell, Ausrüstung und Stressfälle vergleichen. '+geld(Math.max(3,Math.round(jobLohnGesamt(j)*0.06)))+' pro Modell und Konfiguration (6 % des Auftragswerts, mind. 3 €); am selben Tag erneut ansehen kostenlos.</p>'+c.ids.map(id=>{const p=S.tiere.find(t=>t.uid===id);return hlBtn((hlGeprueft(p,j)?'✓ ':'🔬 ')+esc(p.name),"hlPruefen('"+id+"','"+jid+"')");}).join('')+hlBtn((j.kontrolle?'✓ ':'')+'Kontrollpaket · 8 €/Arbeitstag',"hlKontrolle('"+jid+"')")+'</div>'+
 '<div id="ada-zusage" class="karte hlZusagen"><h3>'+ (c.ok?'✓ Team vollständig':'Noch nicht startklar')+'</h3><p><b>'+rd(c.erfolg)+' % Qualitätsprognose</b> (Chance auf saubere Abnahme; Prognosen sind bei 97 % gedeckelt, Klein-/Mikrozettel haben zusätzlich 5 % Bagatellrisiko)'+(c.ok?(()=>{const st=hlStunden(j,c),ft=hlFristTage(j);return ' · ⏱️ braucht ≈ <b>'+hlStundenText(st.std)+'</b> ≙ '+st.tage+' Arbeitstag'+(st.tage===1?'':'e')+' – Frist erlaubt '+ft+' Tag'+(ft===1?'':'e')+(st.tage>ft?' <b class="hlRot">⚠️ ZU LANGSAM: Fristbruch wahrscheinlich (12 % Strafe, keine Auszahlung)</b>':st.tage===ft?' <b>· auf Kante, kein Spielraum</b>':' ✓ mit Reserve');})():'')+'. Kontrollpaket '+geld(j.kontrolle?8*j.tage:0)+' gesamt. Hardware, Strom/API und Pacht fallen zusätzlich an.</p>'+([...c.gruende,...c.warnungen].length?'<p class="hlRot">'+[...c.gruende,...c.warnungen].map(esc).join('<br>')+'</p>':'')+hlBtn('Verbindlich übernehmen · '+geld(jobLohnGesamt(j)),"hlTeamStart('"+jid+"')",!c.ok||hlStand().phase!=='tag','gruen')+'</div>','einsatz');if(typeof startGuideEignung==='function')startGuideEignung();}
function zeigeModellvergleich(){const keys=Object.keys(WERTE);const arr=S.tiere.slice().sort((a,b)=>hlSort==='groesse'?(a.pT||0)-(b.pT||0):hlSort==='name'?a.name.localeCompare(b.name):(effW(b)[hlSort]||0)-(effW(a)[hlSort]||0));
 blattAuf('⚖️ Modelle im direkten Vergleich',hlNavigation()+'<div class="karte"><h3>Fähigkeiten sind wichtiger als Größe</h3><p>Aktive Werte inklusive Gewichte, Adapter, Ausrüstung und Zustand. Grau darunter steht der reine Modellwert. Hohe Werte ersetzen weder Hardware noch passende Werkzeuge.</p><div class="hlFelder"><label>Modell suchen<input id="hlSuche" value="'+esc(hlSuche)+'" placeholder="Name oder Modellfamilie" oninput="hlSuche=this.value;hlVergleichZeilen()"></label><label>Sortieren<select onchange="hlSort=this.value;zeigeModellvergleich()">'+[['name','Name'],['groesse','Kleinste zuerst'],...keys.map(k=>[k,WERTE[k]])].map(([v,n])=>'<option value="'+v+'" '+(hlSort===v?'selected':'')+'>'+n+'</option>').join('')+'</select></label></div><div class="hlTabelle" tabindex="0" role="region" aria-label="Horizontal scrollbarer Modellvergleich"><table><thead><tr><th>Modell / Status</th><th>Hardware</th>'+keys.map(k=>'<th>'+WERTE[k]+'</th>').join('')+'<th>Warnzeichen</th></tr></thead><tbody id="hlVergleichBody">'+hlVergleichRows(arr,keys)+'</tbody></table></div></div>','modellvergleich');hlVergleichZeilen();}
function hlVergleichRows(arr,keys=Object.keys(WERTE)){return arr.map(p=>{const w=effW(p);return '<tr data-name="'+esc(p.name.toLowerCase())+'"><th>'+hlBtn(esc(p.name),"zeigeTier('"+p.uid+"')")+'<small>'+p.status+' · '+(p.api?'API':p.pT+'B')+'</small></th><td>'+ (p.api?'Cloud':rd1(vramPig(p))+' GB VRAM')+'<small>'+tokps(p)+' tok/s</small></td>'+keys.map(k=>'<td><b>'+w[k]+'</b><small>'+p.w[k]+'</small></td>').join('')+'<td>'+[p.krank?'⚠️ '+KRANKHEITEN[p.krank]?.n:'',p.contaminated?'⚠️ Kontamination':'',p.setups.includes('rag')&&hlIndexAlter()>3?'⚠️ Index alt':'',!p.api&&!p.bucht?'⚠️ Keine GPU':''].filter(Boolean).map(esc).join('<br>')+'</td></tr>';}).join('')||'<tr><td colspan="12">Keine Modelle gefunden.</td></tr>';}
function hlVergleichZeilen(){document.querySelectorAll('#hlVergleichBody tr').forEach(el=>el.hidden=!el.dataset.name?.includes(hlSuche.toLowerCase()));}
function hlAbzeichenHtml(){return ((typeof miniAbzeichenHtml==='function')?miniAbzeichenHtml():'')+[['klein','🐣 Kleine Helfer',hlStand().sauber>=5],['vielseitig','🧺 Vielseitiger Hof',hlStand().arten.length>=4],['qualitaet','🏅 Qualitätshof',hlStand().best>=7],['wissen','📚 Wissenshof',Object.keys(hlStand().teile).length===4],['nacht','🌙 Nachtmeister',(hlStand().naechteArbeit||0)>=5]].map(([id,n,ok])=>'<span class="merk '+(ok?'gut':'')+'">'+(ok?'✓ ':'🔒 ')+n+'</span>').join('');}

/* Ära 9 · Tagesplanung: das erste Blatt nach der Nacht – Wetter, erwartete Energie, offene Entscheidungen, Anliegen */
function hlTagesplanungHtml(){
 if(!S) return ''; let a=null,w=null; try{ a=rhVorschau(); }catch(e){} try{ w=(typeof rhWetterbericht==='function')?rhWetterbericht(2):null; }catch(e){}
 const r=(typeof rh==='function')?rh():{}; const heute=w&&w[0]; const offen=S.jobs.filter(j=>!j.team).length,laufend=S.jobs.filter(j=>j.team).length;
 const kw=(a&&a.stunden)?null:null;
 let h='<div class="karte hlTagesplan"><img src="'+bild('tagesbericht')+'" alt="Gezeichnetes Morgenbuch mit Wetter, Energie und erledigten Aufgaben" style="width:100%;max-height:180px;object-fit:cover;object-position:center 62%;border-radius:12px;border:3px solid var(--holz-4);margin-bottom:9px" onerror="this.remove()"><h3>🗓️ Tagesplanung · Tag '+S.tag+'</h3>';
 if(heute) h+='<p><b>'+heute.z+' Heute: '+esc(heute.name)+'</b> – Solar ×'+rhN(heute.pvF,2)+', Wind ×'+rhN(heute.windF,2)+'. '+esc(heute.tipp)+(w[1]?' <span class="merk">'+w[1].z+' Morgen: '+esc(w[1].name)+' (Solar ×'+rhN(w[1].pvF,1)+')</span>':'')+'</p>';
 if(a) h+='<div class="hlTests"><div class="karte"><b class="hlZahl">'+rhN(a.pv+a.wind)+' kWh</b><p>Sonne + Wind erwartet</p></div><div class="karte"><b class="hlZahl">'+rhN(a.last)+' kWh</b><p>Bedarf Tag + Nacht</p></div><div class="karte"><b class="hlZahl">'+rhN(a.netz+a.nachbar)+' kWh</b><p>aus dem Netz ≈ '+rhEuro(a.kosten)+'</p></div><div class="karte"><b class="hlZahl">'+rhN(r.soc||0)+'/'+rhN(r.akku||0)+' kWh</b><p>Akku jetzt</p></div></div>'+(a.fehl>.01?'<p class="hlRot">⚠️ '+rhN(a.fehl)+' kWh blieben unversorgt – Energiemodus oder Nachtplan prüfen.</p>':'');
 h+='<p>'+offen+' offene Zettel · '+laufend+' in Arbeit · '+(S.tiere||[]).filter(p=>p.status==='frei').length+' freie Modelle.</p>';
 h+='<div class="reihe">'+hlBtn('📌 Pinnwand',"oeffne('jobs')",false,'gruen')+hlBtn('⚡ Energie & Einsatz','zeigeEnergieplan()')+hlBtn('🏠 Rechenhaus',"oeffne('rechenhaus')")+hlBtn('🔊 Ada zur Tagesplanung',"adaSprich('tagesplanung',true)",false,'hell')+'</div></div>';
 if(typeof ereignisOffenHtml==='function') h+=ereignisOffenHtml();
 if(typeof zsAnliegenHtml==='function') h+=zsAnliegenHtml(true);
 return h;
}

/* ── Ära 9 · Hofuhr: Warten statt Feierabend ───────────────────────────────
   Die Hofuhr läuft von 06:00 bis 22:00 (16 Uhrstunden = 14 Arbeitsstunden + Rüstzeit). Ein Zettel
   bindet ein Modell nur so lange, wie seine Arbeit dauert: Wer wartet, bekommt die Sofort-Abnahme,
   das Modell wird frei und kann am selben Tag den nächsten Zettel übernehmen. „Tag beenden“ vor
   Feierabend lässt laufende Aufträge weiterarbeiten, freie Modelle stehen bis morgen still. */
const HL_UHR={start:6,ende:22,uhrStunden:16,arbeitsStunden:14};
function hlUhrStunde(){ return HL_UHR.start+kl((S&&S.tagMs||0)/TAG_MS,0,1)*HL_UHR.uhrStunden; }
function hlUhrText(h){ const m=Math.round(h*60); return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); }
function hlWarten(uhrStunden,stumm){ if(typeof dsGeschlossen==='function'&&dsGeschlossen()){ if(!stumm)melde('Der Hof ist geschlossen – die Hofuhr steht. Im Tagesbericht oder Hofhaus kannst du neu anfangen.','schlecht'); return 0; }   /* v9.8 */
 if(!S||hlStand().phase!=='tag'||hlNachtLaeuft||!S.einfFertig)return 0;
 const h=Math.max(0,Math.min(HL_UHR.uhrStunden,Number(uhrStunden)||0)); const vorher=S.tagMs||0;
 S.tagMs=Math.min(TAG_MS,vorher+h/HL_UHR.uhrStunden*TAG_MS);
 const n=hlSofortAbnahme(); if(S.tagMs>=TAG_MS)S._tagFaellig=true;
 sichern(); try{uhrAnzeige();}catch(e){} try{alles();}catch(e){}
 if(!stumm)melde('⏩ '+hlUhrText(hlUhrStunde())+' Uhr'+(n?' – '+n+' Auftrag/Aufträge abgenommen, Modelle wieder frei':'')+(S.tagMs>=TAG_MS?' · Feierabend: der Tag endet, sobald du das Blatt schließt':''),n?'gut':'info');
 if(blattStack.length&&blattStack[blattStack.length-1].id==='jobs')zeigeJobs();
 return n;
}
/* Arbeitsstunden bis zur nächsten Abnahme (null = kein Auftrag läuft) */
function hlNaechsteAbnahmeStunden(){ let best=null; for(const j of S.jobs.filter(j=>j.team)){ const r=hlRestStunden(j); if(!r||r.blockiert)continue; if(best===null||r.std<best)best=r.std; } return best; }
function hlWartenBisAbnahme(){
 const std=hlNaechsteAbnahmeStunden(), restUhr=HL_UHR.ende-hlUhrStunde();
 if(std===null){melde('Kein Auftrag in Arbeit – Warten bringt jetzt nichts. Nimm einen Zettel an oder beende den Tag.','info');return 0;}
 const uhr=std*HL_UHR.uhrStunden/HL_UHR.arbeitsStunden+0.05;
 if(uhr>restUhr+1e-6){melde('Der nächste Auftrag wird heute nicht mehr fertig (noch ≈ '+hlStundenText(std)+' Arbeit, der Tag hat noch '+rhN(restUhr,1)+' h) – er läuft morgen weiter.','info');return hlWarten(restUhr);}
 return hlWarten(uhr);
}
function hlWartenFeierabend(){ return hlWarten(HL_UHR.ende-hlUhrStunde()); }
function hlUngenutzt(){ const frei=S.tiere.filter(p=>p.status==='frei'&&(p.bucht||p.api)); const rest=Math.max(0,HL_UHR.ende-hlUhrStunde())*HL_UHR.arbeitsStunden/HL_UHR.uhrStunden; const mtok=frei.reduce((a,p)=>a+mtokTagKapazitaet(p)/HL_UHR.arbeitsStunden*rest,0); return {modelle:frei.length,namen:frei.map(p=>p.name),stunden:Math.round(frei.length*rest*10)/10,rest:Math.round(rest*10)/10,mtok:Math.round(mtok*100)/100,euro:Math.round(mtok*10)}; }
function hlWartenMenue(){
 if(!S)return; if(hlStand().phase!=='tag'){melde('Die Nachtplanung ist offen – erst „Zurück zum Tag“.','info');return;}
 const std=hlNaechsteAbnahmeStunden(), u=hlUngenutzt(), laufend=S.jobs.filter(j=>j.team);
 blattAuf('⏩ Hofuhr: Warten statt Feierabend','<div class="karte hell"><h3>'+hlUhrText(hlUhrStunde())+' Uhr · Tag '+S.tag+'</h3><p>Ein Zettel bindet ein Modell nur so lange, wie seine Arbeit dauert. Wer wartet, bekommt die Sofort-Abnahme, das Modell wird frei und kann heute noch den nächsten Zettel übernehmen. „Tag beenden“ vor 22:00 lässt laufende Aufträge weiterarbeiten – freie Modelle stehen dann bis morgen still.</p>'+
  '<div class="reihe"><button class="knopf s hell" onclick="adaSprich(\'hofuhr\',true)">🔊 Ada zur Hofuhr</button></div></div>'+
  '<div class="karte"><h3>In Arbeit</h3>'+(laufend.length?laufend.map(j=>{const r=hlRestStunden(j);return '<div class="hlVertrag"><b>'+esc(j.t)+'</b><span>'+(r?(r.blockiert?'⏸ blockiert':r.heuteFertig?'wird bei der nächsten Abnahme fertig':'noch ≈ '+hlStundenText(r.std)+' Arbeit'):'–')+'</span></div>';}).join(''):'<p>Kein Auftrag läuft.</p>')+'</div>'+
  '<div class="karte"><h3>Freie Modelle</h3><p>'+(u.modelle?u.modelle+' frei ('+esc(u.namen.join(', '))+') · bis Feierabend noch '+u.rest+' Arbeitsstunden ≈ '+rhN(u.mtok,2)+' Mtok ≈ '+geld(u.euro)+' mögliche Einnahmen, wenn sie einen Zettel bekommen.':'Alle Modelle sind beschäftigt.')+'</p></div>'+
  '<div class="reihe">'+hlBtn('⏩ 1 Stunde','hlWarten(1)')+hlBtn('⏩ 4 Stunden','hlWarten(4)')+hlBtn(std===null?'⏩ Nächste Abnahme (kein Auftrag)':'⏩ Bis zur nächsten Abnahme (≈ '+hlStundenText(std)+')','hlWartenBisAbnahme()',std===null,'gruen')+hlBtn('🌆 Bis Feierabend (22:00)','hlWartenFeierabend()')+hlBtn('📌 Pinnwand',"oeffne('jobs')",false,'hell')+'</div>','warten');
}
function hlFeierabendHtml(){
 if(!S)return ''; const h=hlUhrStunde(); if(h>=HL_UHR.ende-0.5)return ''; const u=hlUngenutzt(), std=hlNaechsteAbnahmeStunden();
 return '<div class="karte warnrand"><h3>⏰ Feierabend um '+hlUhrText(h)+' – '+rhN(HL_UHR.ende-h,1)+' Stunden früher</h3><p>Laufende Aufträge arbeiten die Nacht nicht, aber den Rest des Tages weiter. '+(u.modelle?'<b>'+u.modelle+' freie Modelle ('+esc(u.namen.join(', '))+') bleiben bis morgen ungenutzt</b> – etwa '+u.stunden+' Modell-Stunden ≈ '+geld(u.euro)+' mögliche Einnahmen.':'Alle Modelle sind beschäftigt – der frühe Feierabend kostet nichts.')+(std!==null?' Der nächste Auftrag wäre in ≈ '+hlStundenText(std)+' fertig.':'')+'</p><div class="reihe">'+(std!==null?hlBtn('⏩ Zurück und bis zur nächsten Abnahme warten','hlZurueckTag();hlWartenBisAbnahme()',false,'gruen'):'')+hlBtn('☀️ Zurück zum Tag','hlZurueckTag()',false,'hell')+hlBtn('🔊 Ada zur Hofuhr',"adaSprich('hofuhr',true)",false,'hell')+'</div></div>';
}
function hlUhrHofbuchHtml(){
 return '<p style="margin-top:8px"><b>⏩ Hofuhr & Warten (Ära 9).</b> Die Hofuhr läuft von 06:00 bis 22:00 – 16 Uhrstunden, davon 14 Arbeitsstunden (Rüst- und Pausenzeit inklusive); ein Hoftag dauert höchstens 30 Minuten Echtzeit. Ein Zettel bindet ein Modell nur seine Arbeitsstunden: Über „⏩ Warten“ (Hofleiste) spulst du eine Stunde, vier Stunden, bis zur nächsten Sofort-Abnahme oder bis Feierabend vor. Fertige Aufträge werden sofort abgenommen und bezahlt, das Modell ist wieder frei und kann am selben Tag den nächsten Zettel übernehmen – so schafft ein schnelles Modell mehrere Zettel pro Tag. „Tag beenden“ vor 22:00 lässt laufende Aufträge weiterarbeiten, freie Modelle stehen bis morgen still; die Nachtplanung zeigt vorher, wie viele Modell-Stunden und Euro dadurch liegen bleiben. Die Dorfplatz-Spiele gibt es einmal je Hoftag – auch das lohnt einen ganzen Tag.</p>';
}
function hlBriefingHtml(){const e=hlEvent(),wb=typeof rhWetterbericht==='function'?rhWetterbericht(3):[];return '<div class="karte hlBriefing"><div><span class="hlIcon">'+e.z+'</span><h3>Tag '+S.tag+' · '+e.n+'</h3><p>'+e.txt+'</p></div>'+(wb.length?'<div class="hlWetterPlan" aria-label="Wettervorhersage für die Tagesplanung">'+wb.map((w,i)=>'<span><b>'+w.z+' '+(i===0?'Heute':i===1?'Morgen':'Übermorgen')+': '+esc(w.name)+'</b><small>Solar ×'+rhN(w.pvF,1)+' · Wind ×'+rhN(w.windF,1)+'<br>'+esc(w.tipp)+'</small></span>').join('')+'</div>':'')+'<div class="reihe"><span class="merk">Tag '+rhEuro(strompreis())+'/kWh</span><span class="merk">Nacht '+rhEuro(strompreis()*.5)+'/kWh</span>'+hlBtn('🔊 Ada zum Wetter',"adaSprich('wetter_planung',true)",false,'hell')+hlBtn('⚡ Tageslast planen','zeigeEnergieplan()',false,'gruen')+'</div></div>';}
function hlMorgen(bericht){const h=hlStand();if((S.tagesNotizen||[]).length){bericht.zeilen.unshift(...S.tagesNotizen.map(z=>({t:'☀️ tagsüber: '+z.t,art:z.art})));S.tagesNotizen=[];}hlProjektPruefen(bericht);h.phase='tag';h.plan={};h.pruefungen={};
 const pool=HL_EVENTS.filter(e=>(!e.lvl||hofLevel().i>=e.lvl)&&!h.letzteEvents.slice(-3).includes(e.id)&&!(e.id==='quelle'&&!hlRagBereit()));
 const e=pool[Math.floor(rhSeed(S.tag,h.saat)*pool.length)]||HL_EVENTS[0];h.ereignis={id:e.id,tag:S.tag};h.letzteEvents.push(e.id);h.letzteEvents=h.letzteEvents.slice(-5);
 if(e.id==='quelle')h.indexVeraltet=true;
 /* Ära 7.5 (W-08): garantierte Mikro-Zettel wachsen mit der einsatzfähigen Herde */
 const einsatz=S.tiere.filter(p=>p.api||p.bucht).length,soll=Math.max(1,Math.floor(einsatz/2));let schutz=0;
 while(S.jobs.filter(j=>j.mikro&&!j.team).length<soll&&schutz++<4){const j=hlJobNeu(0,true);if(j)S.jobs.push(j);}
 if(typeof zsBerufZettelMorgen==='function')zsBerufZettelMorgen(bericht);   /* Ära 9: Berufe-Katalog, Nadel sortiert vor */
 S._zurueckTag=0;if(typeof ereignisMorgen==='function')ereignisMorgen();   /* Ära 8: Empfehlungs-Zettel */
 // Nur offene Preisangebote reagieren auf die aktuelle Nachfrage; Verträge sind eingefroren.
 bericht.zeilen.push({t:e.z+' Morgenlage: '+e.n+'. '+e.txt,art:e.id==='ausfall'?'schlecht':'info'});
 if(typeof rhWetterbericht==='function'){const w=rhWetterbericht(3);bericht.wetter=w;bericht.zeilen.push({t:'🌦️ Wetterbericht: '+w.map((x,i)=>(i===0?'heute':i===1?'morgen':'übermorgen')+' '+x.z+' '+x.name+' · Solar ×'+rhN(x.pvF,1)+' · Wind ×'+rhN(x.windF,1)).join(' · '),art:'info'});}
}
const HL_PROJEKTE=[
 {id:'klein',n:'Die Woche der kleinen Helfer',txt:'4 saubere Mikroaufträge abliefern.',feld:'mikroSauber',ziel:4,preis:130},
 {id:'qualitaet',n:'Verlässlicher Nachbar',txt:'5 Aufträge ohne Qualitätsmängel abliefern.',feld:'sauber',ziel:5,preis:160},
 {id:'nacht',n:'Wenn die anderen schlafen',txt:'3 Nächte mit geplanter Zusatzarbeit abschließen.',feld:'naechteArbeit',ziel:3,preis:110},
 {id:'eigen',n:'Sonne und Wind ernten',txt:'8 kWh Eigenenergie tatsächlich einsetzen.',feld:'eigenGesamt',ziel:8,preis:150},
 {id:'team',n:'Zusammen wird es besser',txt:'2 saubere Aufträge mit mehreren Modellen abliefern.',feld:'teamSauber',ziel:2,preis:190},
 {id:'index',n:'Ein gepflegtes Archiv',txt:'2 nächtliche Reindexierungen abschließen.',feld:'reindexAnzahl',ziel:2,preis:100}
];
function hlProjektAngebote(){const w=Math.floor((S.tag-1)/7);return [HL_PROJEKTE[w%2],HL_PROJEKTE[2+(w+Math.floor(hlStand().saat/10))%4]];}
function hlProjektWaehlen(id){const h=hlStand(),w=Math.floor((S.tag-1)/7);if(h.projekt?.woche===w)return;const p=hlProjektAngebote().find(p=>p.id===id);if(!p)return;h.projekt={id,woche:w,start:h[p.feld]||0,erledigt:false};sichern();zeigeJobs();}
function hlProjektHtml(){const h=hlStand(),w=Math.floor((S.tag-1)/7),q=h.projekt,p=q?.woche===w?HL_PROJEKTE.find(p=>p.id===q.id):null;
 return '<details class="karte hlProjekt"><summary>🗓️ Woche '+(w+1)+' · '+(p?(q.erledigt?'Projekt geschafft':'Projekt läuft'):'Hofprojekt wählen')+'</summary><div class="reihe"><button class="knopf s hell" onclick="adaSprich(\'quest_freiwillig\',true)">🔊 Ada erklärt Hofprojekte</button></div><p>Ein selbst gewähltes Ziel bis Hoftag '+(w*7+7)+'. Keine Echtzeit-Frist und keine Strafe, wenn es nicht klappt.</p>'+(p?'<b>'+p.n+'</b><p>'+p.txt+'</p><progress max="'+p.ziel+'" value="'+Math.min(p.ziel,(h[p.feld]||0)-q.start)+'"></progress><p>'+ (q.erledigt?'✓ Abgeschlossen, '+geld(p.preis)+' Projektprämie gebucht.':rhN(Math.max(0,(h[p.feld]||0)-q.start))+' / '+p.ziel+' · Prämie '+geld(p.preis))+'</p>':hlProjektAngebote().map(p=>'<div class="listenzeile"><span class="txt"><b>'+p.n+'</b><span>'+p.txt+' · '+geld(p.preis)+'</span></span>'+hlBtn('Wählen',"hlProjektWaehlen('"+p.id+"')")+'</div>').join(''))+'</details>';
}
function hlProjektPruefen(bericht){const h=hlStand(),q=h.projekt;if(!q||q.erledigt)return;const p=HL_PROJEKTE.find(p=>p.id===q.id);if(p&&S.tag<=q.woche*7+8&&(h[p.feld]||0)-q.start>=p.ziel){q.erledigt=true;buche(p.preis,'foerderung','Hofprojekt: '+p.n);bericht.zeilen.push({t:'🗓️ '+p.n+' geschafft! '+geld(p.preis)+' Projektprämie, im Kassenbuch als Förderung getrennt.',art:'gut'});}}
Object.assign(window,{hlProjektWaehlen,hlTagesplanungHtml,hlKoordF,hlTeamGroesse,hlTeamSchaetzung,hlTeamChip,hlTeamAuswahlHtml,HL_UHR,hlUhrStunde,hlUhrText,hlWarten,hlNaechsteAbnahmeStunden,hlWartenBisAbnahme,hlWartenFeierabend,hlUngenutzt,hlTagesReste,hlWartenMenue,hlFeierabendHtml,hlUhrHofbuchHtml});
function hlLeiste(){if(!S||!S.einfFertig)return;let bar=document.getElementById('hlLeiste');if(!bar){bar=document.createElement('div');bar.id='hlLeiste';document.body.appendChild(bar);}const e=hlEvent();bar.innerHTML=hlBtn(e.z+' Tag '+S.tag+' · Planung','zeigeJobs()')+hlBtn('⚖️ Vergleichen','zeigeModellvergleich()')+hlBtn('🧩 Wissen','zeigeWissenswerkstatt()');}

/* Nachtplanung. Ein Modell / eine GPU kann nicht doppelt verplant werden.
   Ein 8-Stunden-Fenster ist Rechenzeit, keine kostenlose sofortige Gewichtsverbesserung. */
const HL_NACHT={ruhe:{n:'Sitzungspflege & Ruhe',stunden:0},lora:{n:'LoRA trainieren',stunden:8,technik:'lora',futter:'beispiele'},qlora:{n:'QLoRA trainieren (4-Bit-Basis)',stunden:8,technik:'qlora',futter:'beispiele'},sft:{n:'Full SFT trainieren',stunden:8,technik:'sft',futter:'beispiele'},dpo:{n:'DPO trainieren',stunden:8,technik:'dpo',futter:'praef'},kto:{n:'KTO trainieren (Daumen hoch/runter)',stunden:8,technik:'kto',futter:'praef'},synth:{n:'Synthetische Daten',stunden:6},reindex:{n:'Quellen neu indexieren',stunden:2},distill:{n:'Destillations-Lehrdaten',stunden:8}};
/* Ära 8 · Nacht 2.0: Aktionen schalten stufenweise frei; Überstunden und Wartung sind neu */
Object.assign(HL_NACHT.ruhe,{lvl:1});Object.assign(HL_NACHT.lora,{lvl:2});Object.assign(HL_NACHT.sft,{lvl:2});Object.assign(HL_NACHT.synth,{lvl:2});
Object.assign(HL_NACHT.qlora,{lvl:3});Object.assign(HL_NACHT.reindex,{lvl:3});Object.assign(HL_NACHT.dpo,{lvl:4});Object.assign(HL_NACHT.kto,{lvl:4});Object.assign(HL_NACHT.distill,{lvl:6});
HL_NACHT.ueberstunden={n:'Überstunden am Auftrag (4 h)',stunden:4,lvl:5,txt:'Das Tier arbeitet 4 Nachtstunden am laufenden Auftrag weiter: halber Netzpreis, Zustand −8, 10 % Übermüdung (Qualität −3).'};
HL_NACHT.wartung={n:'GPU-Wartung (3 h, Tier ruht)',stunden:3,lvl:7,txt:'Lüfter, Treiber, Wärmeleitpaste: Wartungskosten dieser Bucht 10 Tage halbiert, Zustand +2.'};
const HL_NACHT_REGELN={ueberstunden:{stunden:4,zustand:-8,muede:0.10,qualitaet:-3},wartung:{tage:10,faktor:0.5,zustand:2},vorlagen:3};
Object.assign(window,{hlNachtVorlage,HL_NACHT_REGELN});
function hlNachtAktionen(){return Object.entries(HL_NACHT).filter(([k,a])=>!a.lvl||hofLevel().i>=a.lvl);}
function hlNachtVorlage(was,name){const h=hlStand();h.vorlagen=h.vorlagen||{};
 if(was==='speichern'){if(Object.keys(h.vorlagen).length>=HL_NACHT_REGELN.vorlagen&&!h.vorlagen[name]){melde('Höchstens '+HL_NACHT_REGELN.vorlagen+' Nachtvorlagen – erst eine überschreiben.','schlecht');return false;}h.vorlagen[name]=JSON.parse(JSON.stringify(h.plan||{}));melde('Nachtvorlage „'+name+'“ gespeichert.','gut');questHook('nacht_vorlage',null);}
 else if(was==='laden'){if(!h.vorlagen[name]){melde('Keine Vorlage „'+name+'“.','schlecht');return false;}h.plan=JSON.parse(JSON.stringify(h.vorlagen[name]));melde('Nachtvorlage „'+name+'“ geladen.','gut');}
 else if(was==='gestern'){if(!h.letzterPlan){melde('Noch keine gestrige Nacht gespeichert.','schlecht');return false;}h.plan=JSON.parse(JSON.stringify(h.letzterPlan));melde('Nachtplan von gestern übernommen.','gut');}
 else if(was==='loeschen'){delete h.vorlagen[name];}
 sichern();if(h.phase==='planung')zeigeNachtSetup();return true;}
function hlNachtFrei(p){return !p.api&&!!p.bucht&&archVon(p)!=='hrm'&&(p.status==='frei'||p.status==='job'||(p.training&&p.training.nurNacht));}   /* Ära 8: Tiere im Auftrag dürfen Überstunden machen */
function hlNachtOption(p){return hlStand().plan[p.uid]||{art:p.training?.nurNacht?'weiter':'ruhe',fokus:'treue',lehrer:null,futter:null};}
function hlNachtFutter(q){const a=HL_NACHT[q.art];if(!a||!a.technik)return null;const t=TECHNIKEN[a.technik];const erlaubt=(t.futter||[a.futter]).filter(f=>FUTTER[f]&&(!FUTTER[f].lvl||hofLevel().i>=FUTTER[f].lvl));return (q.futter&&erlaubt.includes(q.futter))?q.futter:(erlaubt.includes(a.futter)?a.futter:erlaubt[0]||a.futter);}
function hlNachtPruefung(p,q){
 if(q.art==='weiter'&&!(p.training&&p.training.nurNacht))return 'Kein Nachttraining am Laufen – erst LoRA/QLoRA/SFT/DPO planen';
 const a=q.art==='weiter'?{stunden:8,technik:p.training?.id,futter:p.training?.futter}:HL_NACHT[q.art];
 if(!a)return 'Unbekannte Nachtaktion';if(q.art==='distill'&&typeof forschungFrei==='function'&&!forschungFrei('distill'))return 'Ferkelschule (Destillation) zuerst erforschen';   /* Ära 9 (R4-3): Nachtaktion umging die Forschung */if(a.lvl&&hofLevel().i<a.lvl)return 'Ab Hofstufe '+a.lvl;if(!p.bucht&&!p.api)return 'Keine GPU-Bucht – nachts rechnet nur, wer im Stall steht';if(!hlNachtFrei(p))return 'Modell oder GPU ist noch belegt';
 if(q.art==='ueberstunden'){if(p.status!=='job'||!S.jobs.some(x=>x.team&&Object.values(x.team.wahl).includes(p.uid)))return 'Überstunden nur mit laufendem Auftrag';if(p.zustand<25)return 'Zu erschöpft für Überstunden (Zustand < 25)';return '';}
 if(q.art==='wartung'){if(p.status!=='frei')return 'Wartung nur, wenn das Tier frei ist';const b=S.buchten.find(x=>x.id===p.bucht);if(b&&(b.wartungBis||0)>S.tag)return 'Bucht ist frisch gewartet (bis Tag '+b.wartungBis+')';return '';}
 if(p.status==='job'&&q.art!=='ruhe')return 'Im Auftrag sind nachts nur Ruhe oder Überstunden möglich';
 if(a.technik&&q.art!=='weiter'&&!forschungFrei(a.technik))return 'Verfahren noch nicht erforscht ('+(TECHNIKEN[a.technik]||{}).n+')';
 if(p.training?.nurNacht&&!['weiter','ruhe'].includes(q.art))return 'Laufendes Nachttraining erst abschließen';
 if(a.technik){const t=TECHNIKEN[a.technik],g=gpuVon(p);if(!t||!g)return 'Training braucht eine GPU';
  if(p.krank&&KRANKHEITEN[p.krank]?.sperrtTraining)return 'Erst sauberen Checkpoint wiederherstellen';
  if(hofLevel().i<t.lvl)return 'Ab Hofstufe '+t.lvl;
  if(trainingsVramNoetig(p,t)>g.vram)return 'Trainings-VRAM reicht nicht';
  const fu=q.art==='weiter'?a.futter:hlNachtFutter(q);if(((fu==='synth'?(S.daten.synth||0):(S.daten[fu]||0)))<trainingsKosten(p,t,fu,false).gb)return 'Zu wenig '+((FUTTER[fu]||{}).n||fu)+' in der Bibliothek';}
 if(q.art==='reindex'&&(!hlRagBereit()||(S.daten.webmix||0)<2))return 'Textpipeline und 2 GB Quelldaten erforderlich';
 if(q.art==='distill'){const l=S.tiere.find(t=>t.uid===q.lehrer);if(!l||l.uid===p.uid||!hlNachtFrei(l)||l.training)return 'Freien lokalen Lehrer wählen';if(hlNachtOption(l).art!=='ruhe')return 'Lehrer ist bereits verplant';if(effW(l)[q.fokus]<=effW(p)[q.fokus])return 'Lehrer muss im Fokus stärker sein';}
 return '';
}
function hlNachtSet(uid,f,v){const p=S.tiere.find(t=>t.uid===uid);if(!p||hlNachtLaeuft)return;const h=hlStand();h.plan[uid]={...hlNachtOption(p),[f]:v};sichern();zeigeNachtSetup();}
function hlNachtPlaene(){return S.tiere.filter(hlNachtFrei).map(p=>({p,q:hlNachtOption(p)}));}
function hlNachtDauer(p,q){const mf=(typeof merkmalHat==='function')?(merkmalHat(p,'nachteule')?0.9:1)*(merkmalHat(p,'langschlaefer')?1.08:1):1;   /* Ära 8 */if(q.art==='weiter')return p.training?Math.min(8,p.training.nachtRest||8):0;   /* Ära 7.5: kein Absturz ohne laufendes Training */const a=HL_NACHT[q.art];if(a?.technik){const t=TECHNIKEN[a.technik];const g=gpuVon(p);if(!g)return 0;return mf*Math.min(8,t.gpuStdProB*p.pT/Math.max(.08,g.bw/3350)*(skillAktiv('curriculum')?0.85:1));}return a?.stunden||0;}
function hlNachtFixkosten(){return hlNachtPlaene().reduce((s,{p,q})=>s+(HL_NACHT[q.art]?.technik?trainingsKosten(p,TECHNIKEN[HL_NACHT[q.art].technik],hlNachtFutter(q),false).arbeit:0),0);}
/* v9.8 (Nutzerwunsch): Was bleibt heute liegen? Arbeitsstunden freier Modelle, laufende Zettel, offene Dorfplatz-Spiele. */
function hlTagesReste(){
 const std=Math.max(0,HL_UHR.ende-hlUhrStunde())*HL_UHR.arbeitsStunden/HL_UHR.uhrStunden;
 const frei=(S.tiere||[]).filter(p=>p.status==='frei'&&(p.bucht||p.api));
 const laufend=(S.jobs||[]).filter(j=>j.team);
 const heuteFertig=laufend.filter(j=>{const r=hlRestStunden(j);return r&&!r.blockiert&&r.heuteFertig;}).length;
 let spiele=0; try{ if(typeof MINI_SPIELE!=='undefined'&&typeof miniStand==='function'){ const m=miniStand(); spiele=MINI_SPIELE.filter(x=>(!x.frei||x.frei())&&m.gespielt[x.id]!==S.tag).length; } }catch(e){}
 const u=(typeof hlUngenutzt==='function')?hlUngenutzt():{stunden:0,euro:0};
 return {std:Math.round(std*10)/10,frei:frei.length,laufend:laufend.length,heuteFertig,spiele,stunden:u.stunden,euro:u.euro};
}
function tagBeenden(){if(!S||hlNachtLaeuft)return;if(typeof dsGeschlossen==='function'&&dsGeschlossen()){melde('Der Hof ist geschlossen. Im Tagesbericht oder Hofhaus kannst du neu anfangen.','schlecht');return;}   /* Ära 9 */
 /* v9.8: früher Feierabend kostet echte Kapazität – einmal nachfragen, mit Zahlen statt Bauchgefühl */
 if(hlStand().phase==='tag'&&typeof confirm==='function'){
  const r=hlTagesReste();
  if(r.std>=1&&(r.frei>0||r.spiele>0||r.heuteFertig>0)){
   const teile=[];
   if(r.frei>0) teile.push(r.frei+' freie'+(r.frei===1?'s Modell':' Modelle')+' mit zusammen '+rhN(r.stunden,0)+' Arbeitsstunden (bis zu '+geld(r.euro)+')');
   if(r.heuteFertig>0) teile.push(r.heuteFertig+' Auftrag/Aufträge werden heute noch fertig – Sofort-Abnahme entfällt beim frühen Feierabend');
   if(r.spiele>0) teile.push(r.spiele+' Dorfplatz-Spiel'+(r.spiele===1?'':'e')+' sind heute noch offen (Tagesbonus und Album)');
   if(!confirm('Es ist erst '+hlUhrText(hlUhrStunde())+' Uhr – '+rhN(r.std,1)+' von '+HL_UHR.arbeitsStunden+' Arbeitsstunden liegen noch vor dir.'+String.fromCharCode(10)+String.fromCharCode(10)+'Beim Feierabend bleibt liegen:'+String.fromCharCode(10)+'· '+teile.join(String.fromCharCode(10)+'· ')+String.fromCharCode(10)+String.fromCharCode(10)+'Laufende Aufträge arbeiten weiter. Tag trotzdem beenden?')) return;
  }
 }hlStand().phase='planung';S._tagFaellig=false;sichern();zeigeNachtSetup();}
function hlZurueckTag(){if(hlNachtLaeuft)return;hlStand().phase='tag';S._zurueckTag=(S._zurueckTag||0)+1;
 /* Ära 7.5 (W-21): höchstens zweimal zurück – danach endet der Tag beim Schließen des Blatts */
 if(S._zurueckTag>2){S.tagMs=TAG_MS;melde('Die Sonne ist unten – der Tag endet, sobald du das Blatt schließt.','info');}else S.tagMs=Math.min(S.tagMs,TAG_MS-120000);sichern();blattZu();}
function zeigeNachtSetup(){if(!S||hlNachtLaeuft)return;const h=hlStand();   /* Ära 8: Phase setzt nur tagBeenden – ein Nachtplan am Tag lässt die Hofuhr laufen */const plaene=hlNachtPlaene(),e=rhVorschau(),fix=hlNachtFixkosten();
 blattAuf('🌙 Nachtplanung · 22:00–06:00', '<div class="hlNachtKopf"><span>☾</span><div><small>TAG '+S.tag+' GEHT ZU ENDE</small><h3>Wenn der Hof leiser wird.</h3><p>Die nächste Schicht gehört dir. Plane echte Rechenzeit – oder gönne den Sitzungen eine Pause.</p></div></div>'+hlFeierabendHtml()+
 '<div class="hlTests"><div class="karte"><b class="hlZahl">−50 %</b><p>Netzpreis nachts · '+rhEuro(strompreis()*.5)+'/kWh</p></div><div class="karte"><b class="hlZahl">'+rhN(e.nachtKwh||0)+' kWh</b><p>Geplante Nachtlast inklusive Bereitschaft</p></div><div class="karte"><b class="hlZahl">'+geld(fix)+'</b><p>Datenaufbereitung einmalig; Strom separat</p></div></div>'+
 '<div class="notiz">Solar erzeugt nachts keinen Strom. Akku und Wind können liefern. Der Tarif halbiert nur Netzstromkosten, weder Datenaufbereitung noch GPU-Zeit. Reward Hacking hängt vom Verfahren ab, nicht von der Uhrzeit. Modelle mit heute endendem Auftrag sind nur bei erfolgreicher Tagesfortschreibung verfügbar.</div>'+
 (plaene.length?plaene.map(({p,q})=>{const fehler=hlNachtPruefung(p,q),std=hlNachtDauer(p,q);return '<div class="karte hlNachtKarte"><h3>'+esc(p.name)+' <span class="merk">'+p.pT+'B · '+gpuVon(p).vram+' GB VRAM</span></h3><div class="hlFelder"><label>Nachtarbeit<select onchange="hlNachtSet(\''+p.uid+'\',\'art\',this.value)">'+(p.training?.nurNacht?[['weiter','Training fortsetzen'],['ruhe','Training pausieren']]:hlNachtAktionen().map(([id,a])=>[id,a.n])).map(([id,n])=>'<option value="'+id+'" '+(q.art===id?'selected':'')+'>'+n+'</option>').join('')+'</select></label><label>Trainingsfokus<select onchange="hlNachtSet(\''+p.uid+'\',\'fokus\',this.value)">'+Object.entries(WERTE).map(([k,n])=>'<option value="'+k+'" '+(q.fokus===k?'selected':'')+'>'+n+'</option>').join('')+'</select></label>'+
 (HL_NACHT[q.art]?.technik?'<label>Futter<select onchange="hlNachtSet(\''+p.uid+'\',\'futter\',this.value)">'+(TECHNIKEN[HL_NACHT[q.art].technik].futter||[HL_NACHT[q.art].futter]).filter(f=>FUTTER[f]&&(!FUTTER[f].lvl||hofLevel().i>=FUTTER[f].lvl)).map(f=>'<option value="'+f+'" '+(hlNachtFutter(q)===f?'selected':'')+'>'+esc(FUTTER[f].n)+' ('+rhN(f==='synth'?(S.daten.synth||0):(S.daten[f]||0))+' GB)</option>').join('')+'</select></label>':'')+'</div>'+
 (q.art==='distill'?'<label>Lehrer<select onchange="hlNachtSet(\''+p.uid+'\',\'lehrer\',this.value)"><option value="">Bitte wählen</option>'+plaene.filter(x=>x.p.uid!==p.uid).map(({p:l})=>'<option value="'+l.uid+'" '+(q.lehrer===l.uid?'selected':'')+'>'+esc(l.name)+'</option>').join('')+'</select></label><p>Beide Modelle sind gebunden. Ergebnis: gekennzeichnete Lehrdaten für späteres Training des vorhandenen kleinen Schülers, kein kostenloses neues Grundmodell.</p>':'')+
 (q.art==='synth'?'<p>6 GPU-Stunden → 8–40 GB Lehrbeispiele, abhängig von Tempo und Qualität. Herkunft wird gespeichert; rekursive Synthetik verliert Qualität.</p>':'')+
 (q.art==='reindex'?'<p>2 GPU-Stunden · 2 GB vorhandene Quellen nötig · setzt die Indexfrische zurück.</p>':'')+
 '<p>'+rhN(std)+' GPU-Stunden in dieser Nacht'+(q.art==='weiter'&&p.training?.nurNacht?' · '+rhN(p.training.nachtRest)+' Stunden Restarbeit':'')+'. '+(q.art==='ruhe'?'Sitzungspflege: +6 Zustand, keine Heilung beschädigter Gewichte.':'Bei fehlender Energie wird pausiert, kein Ergebnis verschenkt.')+'</p>'+(fehler?'<p class="hlRot">⚠️ '+fehler+'</p>':'')+'</div>';}).join(''):'<div class="karte"><p>Alle Modelle sind noch beschäftigt. Die Nacht kann auch ohne zusätzliche Jobs beginnen.</p></div>')+
 '<div class="karte"><h3>🗂️ Nachtvorlagen</h3><div class="reihe">'+hlBtn('↩️ Wie gestern','hlNachtVorlage(\'gestern\')')+Object.keys(hlStand().vorlagen||{}).map(n=>hlBtn('📂 '+esc(n),'hlNachtVorlage(\'laden\',\''+esc(n)+'\')')).join('')+hlBtn('💾 Speichern','hlNachtVorlage(\'speichern\',prompt(\'Name der Vorlage\')||\'Plan\')')+'</div><p>Bis zu '+HL_NACHT_REGELN.vorlagen+' Vorlagen; „Wie gestern“ übernimmt den letzten gestarteten Plan. Aktionen schalten mit der Hofstufe frei: Überstunden ab 5, Destillation ab 6, Wartung ab 7.</p></div>'+
 '<div class="karte hlZusagen"><h3>Schichtvorschau</h3><p>Tag + Nacht: '+rhN(e.last)+' kWh tatsächlicher Bedarf · '+rhEuro(e.kosten)+' Energiekosten inkl. Wartung, abzüglich Einspeisung. Davon Nacht-Netzbezug: '+rhEuro(e.nachtKosten||0)+'. Pacht, Mieten und Auftragskontrolle zusätzlich.</p>'+(e.fehl>.01?'<p class="hlRot">⚠️ '+rhN(e.fehl)+' kWh nicht versorgt. Einsatz & Energie prüfen.</p>':'')+'<div class="reihe">'+hlBtn('⚡ Energie zuweisen','zeigeEnergieplan()')+hlBtn('Zurück zum Tag','hlZurueckTag()')+hlBtn('🌙 Nachtschicht starten','starteNachtSchicht()',false,'gruen')+'</div></div>', 'nachtsetup');sichern();}
function starteNachtSchicht(){if(hlNachtLaeuft||hlStand().phase!=='planung')return false;
 hlStand().letzterPlan=JSON.parse(JSON.stringify(hlStand().plan||{}));   /* Ära 8: „Wie gestern“ */
 const plaene=hlNachtPlaene(),belegt=new Set(),ueber=[];   /* Ära 9 (R4-4): ungültige Pläne einzeln überspringen statt die ganze Nacht zu verwerfen */
 for(const x of plaene){const {p,q}=x;if(q.art==='ruhe')continue;let grund=hlNachtPruefung(p,q)||'';
  if(!grund){for(const id of [p.uid,...(q.art==='distill'?[q.lehrer]:q.art==='reindex'?['gemeinsamerIndex']:[])]){if(belegt.has(id)){grund='mehrfach für die Nacht eingeplant';break;}belegt.add(id);}}
  if(grund){ueber.push(p.name+': '+grund);x.q={...q,art:'ruhe'};hlStand().plan[p.uid]={...(hlStand().plan[p.uid]||{}),art:'ruhe'};}}
 if(ueber.length){const arbeit=plaene.filter(x=>x.q.art!=='ruhe').length;melde((arbeit?'Übersprungen – die anderen arbeiten wie geplant: ':'Alle ungültigen Nachtaktionen wurden auf kostenlose Ruhe gesetzt: ')+ueber.join(' · '),'schlecht');}
 const fix=hlNachtFixkosten();
 if(fix>0&&rhCash()<fix){
  for(const x of plaene){if(HL_NACHT[x.q.art]?.technik){x.q={...x.q,art:'ruhe'};hlStand().plan[x.p.uid]={...(hlStand().plan[x.p.uid]||{}),art:'ruhe'};}}
  melde('Für die Datenaufbereitung reicht das Guthaben nicht. Kostenpflichtige Trainings wurden auf kostenlose Ruhe gesetzt; die Nacht läuft weiter.','schlecht');
 }
 hlStand().nacht=plaene.map(({p,q})=>({uid:p.uid,q:{...q},stunden:hlNachtDauer(p,q)}));
 hlNachtLaeuft=true;hlStand().phase='laeuft';sichern();blattZu();
 let overlay=document.getElementById('nachtschatten');if(!overlay){overlay=document.createElement('div');overlay.id='nachtschatten';overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');document.body.appendChild(overlay);}
 overlay.innerHTML='<div class="hlMondbahn"><span>🌕</span></div><h3>Die Nachtschicht läuft …</h3><p>Rechenzeit, Energie und Ergebnisse werden abgerechnet.</p>';overlay.classList.add('auf');
 // Genau ein Commit. Ein Reload vor dem Commit stellt die unveränderte Planung wieder her.
 setTimeout(()=>{try{ausfuehrenTagesWechsel();}finally{hlNachtLaeuft=false;overlay.classList.remove('auf');}},window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?50:3300);return true;
}
function hlNachtAbrechnen(energie,bericht){const h=hlStand(),plan=h.nacht||[],gebunden=new Set(plan.filter(x=>x.q.art==='distill').map(x=>x.q.lehrer));let erfolge=0;
 if(plan.some(x=>x.q.art!=='ruhe'))questHook('nacht_genutzt',null);   /* Ära 8 */
 for(const {uid,q,stunden}of plan){const p=S.tiere.find(t=>t.uid===uid);if(!p)continue;
  if(q.art==='ruhe'){if(!gebunden.has(uid)&&p.status==='frei')p.zustand=kl(p.zustand+(merkmalHat(p,'nachteule')?9:6)+(merkmalHat(p,'langschlaefer')?3:0),5,100);continue;}
  if(p.status!=='frei'&&!p.training?.nurNacht&&q.art!=='ueberstunden'){bericht.zeilen.push({t:'🌙 '+p.name+': Nachtarbeit entfällt, Tagesauftrag noch nicht abgeschlossen.',art:'info'});continue;}   /* Ära 8: Überstunden erlaubt */
  const quote=hlVersorgung(p,energie,true);if(quote<.98){bericht.zeilen.push({t:'🌙 '+p.name+': Nachtarbeit wegen Energieunterdeckung pausiert.',art:'schlecht'});continue;}
  if(q.art==='ueberstunden'){const R=HL_NACHT_REGELN.ueberstunden;const j=S.jobs.find(x=>x.team&&Object.values(x.team.wahl).includes(p.uid));if(!j){bericht.zeilen.push({t:'🌙 '+p.name+': keine Überstunden – der Auftrag ist schon fertig.',art:'info'});continue;}
   const c=hlTeamCheck(j,j.team.wahl);const leistung=hlLeistung(j,c)*(R.stunden/14);const vorher=j.team.mtokRest;j.team.mtokRest=Math.max(0,Math.round((j.team.mtokRest-leistung)*1000)/1000);p.zustand=kl(p.zustand+R.zustand,5,100);
   const muede=Math.random()<R.muede;if(muede)j.team.seg.push({anteil:c.anteil,erfolg:c.erfolg+R.qualitaet,mtok:leistung});else j.team.seg.push({anteil:c.anteil,erfolg:c.erfolg,mtok:leistung});
   j.team.rest=Math.ceil(j.team.mtokRest/Math.max(1e-4,hlLeistung(j,c))-1e-9);erfolge++;questHook('nacht','ueberstunden');
   bericht.zeilen.push({t:'🌙 '+p.name+': '+R.stunden+' h Überstunden an „'+j.t+'“ – '+rhN(vorher-j.team.mtokRest,2)+' Mtok geschafft, Rest '+rhN(j.team.mtokRest,2)+' Mtok. Zustand '+R.zustand+(muede?', übermüdet: Qualität '+R.qualitaet:'')+'.',art:muede?'schlecht':'info'});continue;}
  if(q.art==='wartung'){const R=HL_NACHT_REGELN.wartung;const b=S.buchten.find(x=>x.id===p.bucht);if(b){b.wartungBis=S.tag+R.tage;}p.zustand=kl(p.zustand+R.zustand,5,100);erfolge++;questHook('nacht','wartung');
   bericht.zeilen.push({t:'🌙 '+p.name+': GPU-Wartung erledigt – Wartungskosten der Bucht bis Tag '+(S.tag+R.tage)+' halbiert, Zustand +'+R.zustand+'.',art:'gut'});continue;}
  if(HL_NACHT[q.art]&&HL_NACHT[q.art].technik){questHook('nacht_training',null);questHook('nacht',q.art);}
  const a=HL_NACHT[q.art];if(a?.technik||q.art==='weiter'){
   if(q.art!=='weiter'){if(!trainingStarten(p,a.technik,q.fokus,hlNachtFutter(q),p.bucht))continue;p.training.nurNacht=true;p.training.nachtRest=Math.max(.1,TECHNIKEN[a.technik].gpuStdProB*p.pT/Math.max(.08,gpuVon(p).bw/3350)*(skillAktiv('curriculum')?0.85:1));}   /* Ära 7.5 (T-15/T-21): Curriculum wirkt auch nachts, Futter frei wählbar */
   p.training.nachtRest=Math.max(0,p.training.nachtRest-stunden);p.rest=Math.ceil(p.training.nachtRest/8);
   if(p.training.nachtRest<=.001)trainingAbschliessen(p,bericht);
   else bericht.zeilen.push({t:'🌙 '+p.name+': '+rhN(stunden)+' h trainiert; '+rhN(p.training.nachtRest)+' h bleiben. Tagsüber reserviert, nachts fortsetzbar.',art:'info'});
  }else if(q.art==='synth'||q.art==='distill'){
   let lehrer=p;if(q.art==='distill'){lehrer=S.tiere.find(t=>t.uid===q.lehrer);if(!lehrer||lehrer.status!=='frei'||hlVersorgung(lehrer,energie,true)<.98){bericht.zeilen.push({t:'🌙 Destillation pausiert: Lehrer nicht verfügbar.',art:'info'});continue;}}
   const qual=kl((effW(lehrer).treue+effW(lehrer)[q.fokus])/220,.25,.9)*Math.pow(.82,lehrer.synthGen||0);
   const gb=Math.round(kl(tokps(lehrer)*stunden/30,8,40));synthChargeDazu(gb,qual,(lehrer.synthGen||0)+1,(q.art==='distill'?'Lehrer '+lehrer.name+' → '+p.name:p.name)+' · Nacht '+S.tag);p.zustand=kl(p.zustand-3,5,100);
   bericht.zeilen.push({t:'🌙 '+(q.art==='distill'?'Destillations-Vorbereitung':'Synthetische Daten')+': '+gb+' GB · Qualität '+rd(qual*100)+' % · Herkunft dokumentiert. Noch kein Gewichtsupdate.',art:'gut'});
  }else if(q.art==='reindex'){h.indexTag=S.tag+1;h.indexVeraltet=false;h.reindexAnzahl=(h.reindexAnzahl||0)+1;bericht.zeilen.push({t:'🌙 Vektorindex aus vorhandenen Quellen neu aufgebaut. Gewichte unverändert.',art:'gut'});}
  erfolge++;
 }
 /* Ära 7.5 (Spieltest): jede bewusst geplante Nacht zählt (auch reine Sitzungspflege) – Abzeichen und Projekt verlangen echte Nachtarbeit */
 h.naechte=(h.naechte||0)+1; if(erfolge)h.naechteArbeit=(h.naechteArbeit||0)+1;
 if(plan.length)bericht.zeilen.push({t:'🌙 Nachtbilanz: '+plan.length+' Modell(e) geplant, '+erfolge+' Aktion(en) erledigt · Nacht-Netzbezug '+rhN(energie.nachtKwh||0)+' kWh ≈ '+rhEuro(energie.nachtKosten||0)+' (halber Tarif).',art:'info'});
 h.eigenGesamt=(h.eigenGesamt||0)+(energie.direkt||0)+(energie.entladung||0);
 h.nacht=null;h.plan={};h.phase='tag';
}

/* Individuelle Energieprofile, gespeicherte Prioritäten und transparente Lastabwürfe. */
function hlEnergieFrei(){const r=(typeof rh==='function')?rh():{};return istFrei('gebEnergie')||(r.pv||[]).length>0||(r.akku||0)>0||(r.wind||[]).length>0;}   /* Ära 7.5 (D1): wer Solar/Akku/Wind baut, darf planen */
function hlEnergieModus(uid,m){if(!['auto','eigen'].includes(m))return;if(m==='eigen'&&!hlEnergieFrei()){melde('„Nur Eigenstrom“-Prioritäten und die Wetter-/Preisprognose bringt das Energiehaus auf Hofstufe 8 (Energiewirt).','schlecht');zeigeEnergieplan();return;}hlStand().energie[uid]=m;sichern();zeigeEnergieplan();}
/* Ära 7.5 (R-24): Prognose der nächsten Tage – Ereigniswahl in hlMorgen ist deterministisch (rhSeed), also rein lesend nachvollziehbar */
function hlPrognose(n=2){const h=hlStand(),aus=[];let letzte=[...(h.letzteEvents||[])];for(let k=1;k<=n;k++){const tag=S.tag+k;const pool=HL_EVENTS.filter(e=>(!e.lvl||hofLevel().i>=e.lvl)&&!letzte.slice(-3).includes(e.id)&&!(e.id==='quelle'&&!hlRagBereit()));const e=pool[Math.floor(rhSeed(tag,h.saat)*pool.length)]||HL_EVENTS[0];aus.push({tag,e});letzte.push(e.id);}return aus;}
function hlPrognoseHtml(){if(!hlEnergieFrei())return '<span class="merk">🔒 Prognose ab Hofstufe 8 oder mit eigener Solar-/Wind-/Akku-Anlage</span>';return hlPrognose(2).map((x,i)=>'<span class="merk" title="'+esc(x.e.txt)+'">'+(i===0?'Morgen':'Übermorgen')+': '+x.e.z+' '+esc(x.e.n)+'</span>').join('');}
function hlProfile(s=S){const teile={},nacht={},base=Array(24).fill(rhGrund(s)),h=hlStand(s),plaene=h.nacht||s.tiere.filter(hlNachtFrei).map(p=>({uid:p.uid,q:hlNachtOption(p),stunden:hlNachtDauer(p,hlNachtOption(p))}));
 const vorgesehen=new Map();for(const x of plaene){vorgesehen.set(x.uid,x);if(x.q.art==='distill')vorgesehen.set(x.q.lehrer,{...x,uid:x.q.lehrer});}
 for(const b of s.buchten){const p=s.tiere.find(t=>t.uid===b.tier);const idle=(p?.045:.008)*rhCfg(s).pue,peak=rhPeak(b)*rhCfg(s).pue;for(let t=0;t<24;t++)base[t]+=idle;   /* Ära 8: PUE auch auf Leerlauf */
  if(!p)continue;teile[p.uid]=Array(24).fill(0);nacht[p.uid]=Array(24).fill(0);
  const aktiv=p.status==='training'&&!p.training?.nurNacht?22:p.status==='job'?Math.min(16,14*(p.setups||[]).reduce((f,id)=>f*((SETUPS[id]||{}).kw||1),1)):p.status==='agentenwelt'?16:p.status==='zucht'?10:0;
  const lastF=(typeof rhLastFaktor==='function')?rhLastFaktor(p.status):1;   /* Ära 7.5 (R-14): Inferenz zieht weniger als die Herstellergrenze */
  for(let t=0;t<24;t++){const d=p.status==='training'&&!p.training?.nurNacht?t!==6&&t!==7:t>=22-aktiv&&t<22; if(d)teile[p.uid][t]=Math.max(0,peak-idle)*lastF;}
  const n=vorgesehen.get(p.uid);if(n){let rest=n.stunden;for(const t of [22,23,0,1,2,3,4,5]){const dt=Math.min(1,rest);nacht[p.uid][t]=Math.max(0,peak-idle)*dt*0.95;   /* Ära 8: Nachtplan mit Trainings-Lastfaktor */teile[p.uid][t]=Math.max(teile[p.uid][t],nacht[p.uid][t]);rest-=dt;}}
 }
 return {teile,nacht,base,last:base.map((x,i)=>x+Object.values(teile).reduce((a,v)=>a+v[i],0)),modi:h.energie};
}
function hlVersorgung(p,a,nacht=false){if(p.api)return 1;const m=(a.modelle||{})[p.uid];if(!m)return 1;
 const q=nacht?(m.nachtLast?m.nachtGeliefert/m.nachtLast:1):(m.tagLast?m.tagGeliefert/m.tagLast:1);
 /* Ära 7 (Haupt-Session): Float-Epsilon – volle Deckung ist exakt 1 (die 24 summierten Stunden
    runden mit dem 450-W-Start-PC sonst auf 0.99999…, was fälschlich als Lücke zählen würde). */
 return q>1-1e-9?1:q;}
function zeigeEnergieplan(){const h=hlStand(),a=rhVorschau();blattAuf('⚡ Einsatz & Energie',hlNavigation()+hlBriefingHtml()+
 '<div class="karte hell"><h3>Eigenstrom dort einsetzen, wo er sich lohnt</h3><p><b>Automatisch:</b> Sonne, Wind und Akku zuerst, fehlenden Strom vom Netz/Kraftwerk beziehen. <b>Nur Eigenstrom:</b> Dieses Modell erhält erneuerbare Energie zuerst und pausiert bei Unterdeckung; das Netz wird dafür nicht belastet. Mehrere Eigenstrom-Modelle teilen sich den Ertrag in der angezeigten Reihenfolge. Grundlast und Standby bleiben automatisch versorgt.</p><p>Akkus starten leer, haben Ladeverluste und eine Leistungsgrenze. Nur Eigenstrom ist ohne genug Erzeugung oder Speicher riskant.</p></div>'+
 '<div class="hlTests"><div class="karte"><b class="hlZahl">'+rhN(a.direkt+a.entladung)+' kWh</b><p>Eigenenergie eingesetzt</p></div><div class="karte"><b class="hlZahl">'+rhN(a.netz+a.nachbar)+' kWh</b><p>Netz / Nachbar</p></div><div class="karte"><b class="hlZahl">'+rhEuro(a.kosten)+'</b><p>Energie gesamt · '+rhN(a.fehl)+' kWh fehlen</p></div></div>'+
 '<div class="karte">'+S.tiere.filter(p=>!p.api&&p.bucht).map(p=>{const m=a.modelle?.[p.uid]||{tagLast:0,nachtLast:0,eigen:0};return '<div class="hlKandidat"><div><b>'+esc(p.name)+'</b><small>'+rhN(m.tagLast)+' kWh Tag · '+rhN(m.nachtLast)+' kWh Nacht · '+rhN(m.eigen)+' kWh Eigenenergie</small><small class="'+(hlVersorgung(p,a)<.98||hlVersorgung(p,a,true)<.98?'hlRot':'hlGut')+'">Versorgt: Tag '+rd(hlVersorgung(p,a)*100)+' % · Nacht '+rd(hlVersorgung(p,a,true)*100)+' %</small></div><label>Versorgung<select onchange="hlEnergieModus(\''+p.uid+'\',this.value)"><option value="auto" '+(h.energie[p.uid]!=='eigen'?'selected':'')+'>Automatisch</option><option value="eigen" '+(h.energie[p.uid]==='eigen'?'selected':'')+'>Nur Eigenstrom</option></select></label></div>';}).join('')+'</div><div class="reihe">'+hlBtn('Solar, Wind & Speicher bauen',"zeigeRechenhaus('energie')")+hlBtn('🌙 Zur Nachtplanung','tagBeenden()')+'</div><p class="hlHinweis">Vorschau mit aktueller Belegung und geplantem Nachtprogramm. Eine Zuweisung verbraucht keinen Strom und entlädt keinen Akku. Gebucht wird erst beim Schichtabschluss.</p>','energieplan');}
Object.assign(window,{hlRestStunden,hlStunden,hlMtok,hlFristTage,hlPrognose,hlSofortAbnahme,hlTeamAbschluss,hlAbbrechen,tagBeenden,zeigeNachtSetup,starteNachtSchicht,hlZurueckTag,hlNachtSet,zeigeJobs,jobAnnehmen,zeigeAuftrag,hlWaehlen,hlAuto,hlKontrolle,hlTeamStart,hlJobFilter,hlPruefen,zeigeModellvergleich,hlVergleichZeilen,zeigeWissenswerkstatt,hlBauteilKauf,hlRagAn,zeigeEnergieplan,hlEnergieModus});
