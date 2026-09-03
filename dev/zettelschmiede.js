/* ═══════════════════════════════════════════════════════════════════════
   Ära 9 · Zettelschmiede
   Prozedurale Kundschaft, Anliegen, sichtbare Wendungen und Hofpost.
   Alle Zahlen bleiben in den vorhandenen Auftragsvorlagen; die Schmiede
   variiert Sprache und nur die hier dokumentierten engen Bänder.
   ═══════════════════════════════════════════════════════════════════════ */

const ZS_REGELN={dynamischBisTier2:.45,dynamischAbTier3:.30,maxKunden:12,wendung:.35,geruechtWahr:.60};
const ZS_BRANCHEN=[
 ["Imkerei","🐝",["text","support","wissen"],false],["Tischlerei","🪵",["text","code","support"],false],
 ["Physiotherapie","🧘",["medizin","support","text"],true],["Ferienhof","🏡",["text","support","agent"],false],
 ["Musikschule","🎼",["text","wissen","support"],false],["Brauerei","🍺",["text","support","code"],false],
 ["Apotheke","⚕️",["medizin","wissen","support"],true],["Architekturbüro","📐",["text","code","wissen"],false],
 ["Reitstall","🐴",["support","text","agent"],false],["Steuerbüro","🧾",["recht","wissen","agent"],true],
 ["Weingut","🍇",["text","support","agent"],false],["Fahrschule","🚗",["support","wissen","text"],false],
 ["Zahnarztpraxis","🦷",["medizin","support","wissen"],true],["Pflegedienst","🤝",["medizin","support","agent"],true],
 ["Landhotel","🛎️",["support","text","agent"],false],["Kita","🧸",["text","wissen","support"],true],
 ["Bestattungshaus","🕯️",["text","support","recht"],true],["Gärtnerei","🌱",["text","support","agent"],false],
 ["Metzgerei","🥩",["text","support","agent"],false],["Schreinerei","🪚",["code","support","text"],false],
 ["Optiker","👓",["support","medizin","text"],true],["Buchhandlung","📖",["text","wissen","support"],false],
 ["Segelverein","⛵",["support","text","wissen"],false],["Feuerwehr","🚒",["wissen","support","agent"],true],
 ["Jugendzentrum","🛹",["text","support","wissen"],false],["Solarteur","☀️",["code","support","wissen"],false],
 ["Heizungsbauer","🔥",["code","support","agent"],false]
];
const ZS_VORNAMEN=["Mara","Jule","Sven","Nora","Emil","Aylin","Lea","Tobias","Mina","Jan","Ruth","Samir","Clara","Ben"];
const ZS_NACHNAMEN=["Bergmann","Eichen","Klee","Morgenrot","Feld","Winkel","Sommer","Wiesner","Bach","Kramer","Linde","Reuter","Holm","Winter"];
const ZS_ORTE=["Oberwiesen","Lindenbach","Hohenfurt","Sankt Ulrich","Birkenau","Am Weiher","Falkenried","Niederhain","Rosenbrück"];
const ZS_EIGENARTEN=["ungeduldig","sparsam","gesprächig","datenschutzstreng","technikbegeistert","perfektionistisch","pragmatisch","neugierig"];
const ZS_ANLASS={
 text:["Für die kommende Saison stapeln sich Entwürfe.","Eine neue Ausgabe soll pünktlich erscheinen.","Die Kundschaft fragt nach klareren Texten."],
 support:["Im Postfach häufen sich ähnliche Fragen.","Vor dem Wochenende wird mit mehr Anfragen gerechnet.","Das Team möchte wieder Zeit für schwierige Fälle haben."],
 wissen:["Mehrere Unterlagen widersprechen sich.","Das Archiv ist gewachsen und soll verlässlich durchsuchbar werden.","Für eine Beratung werden belegte Antworten gebraucht."],
 code:["Ein gewachsener Ablauf verursacht immer wieder Handarbeit.","Nach einem Update sind kleine Fehler liegen geblieben.","Die interne Werkzeugkette soll robuster werden."],
 agent:["Zwischen Posteingang und Fachsystem liegen zu viele Klicks.","Ein wiederkehrender Ablauf soll mit klaren Werkzeuggrenzen automatisiert werden.","Das Team möchte einen kleinen Agenten kontrolliert erproben."],
 medizin:["Sensible Unterlagen müssen schneller vorsortiert werden.","Das Fachteam braucht Unterstützung, aber keine automatischen Entscheidungen.","Viele ähnliche Dokumente warten auf eine sorgfältige Strukturierung."],
 recht:["Fristen und Klauseln sollen nachvollziehbar markiert werden.","Vor einer Entscheidung müssen Unterlagen gegengeprüft werden.","Das Team braucht eine belegte Vorprüfung, keine Rechtsentscheidung."]
};
const ZS_ERWARTUNG=["Wichtig sind nachvollziehbare Zwischenschritte und eine Rückfrage bei Unsicherheit.","Namen, Zahlen und Quellen dürfen sich nicht verändern.","Die Abgabe soll testbar sein und unklare Fälle sichtbar markieren.","Lieber ehrlich auslassen als etwas erfinden.","Eine kleine Stichprobe wird vor der Abnahme von Hand geprüft.","Datenschutz und Werkzeuggrenzen gelten auch unter Zeitdruck."];

/* v9.8 (Spieltest): FNV-1a allein streut benachbarte Schlüssel („geruecht:1“, „geruecht:2“ …) fast gar nicht –
   ein Hof bekam dadurch entweder ständig Gerüchte oder nie eines. Der Abschlussmix (murmur3-fmix32) macht aus
   ähnlichen Schlüsseln unabhängige Werte; die Saat bleibt und damit die Wiederholbarkeit jeder Partie. */
function zsHash(text){let h=2166136261;for(const c of String(text)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}
  h^=h>>>16; h=Math.imul(h,2246822507); h^=h>>>13; h=Math.imul(h,3266489909); h^=h>>>16; return h>>>0;}
function zsSaat(s){try{return Number((s||S).hofloop&&((s||S).hofloop.saat))||1;}catch(e){return 1;}}
function zsRnd(schluessel,s){return zsHash(zsSaat(s)+"|"+schluessel)/4294967296;}
function zsPick(arr,schluessel,s){return arr[Math.floor(zsRnd(schluessel,s)*arr.length)%arr.length];}
function zsStand(s){s=s||(typeof S!=="undefined"?S:null);if(!s)return {zaehler:0};s.zs=s.zs||{zaehler:0};s.kundenDyn=s.kundenDyn||{};return s.zs;}
function zsKundenRegistrieren(o){if(!o)return;o.kundenDyn=o.kundenDyn||{};zsStand(o);if(typeof KUNDEN!=="undefined")Object.assign(KUNDEN,o.kundenDyn);}
/* v9.8 (Spieltest): Zwei Auftraggeber hießen gleich und führten getrennte Bewertungen – der Ort macht den Namen eindeutig. */
function zsNameEindeutig(name,ort){ if(typeof KUNDEN==="undefined") return name; const belegt=Object.values(KUNDEN).some(k=>k&&k.n===name); return belegt?name+" ("+ort+")":name; }
function zsKundeNeu(art,tier,s){
 s=s||(typeof S!=="undefined"?S:null);if(!s||typeof KUNDEN==="undefined")return null;const st=zsStand(s),nr=Object.keys(s.kundenDyn).length;if(nr>=ZS_REGELN.maxKunden)return null;
 const passend=ZS_BRANCHEN.filter(b=>b[2].includes(art)),b=zsPick(passend.length?passend:ZS_BRANCHEN,"branche:"+nr,s),nach=zsPick(ZS_NACHNAMEN,"nach:"+nr,s),ort=zsPick(ZS_ORTE,"ort:"+nr,s),eigen=zsPick(ZS_EIGENARTEN,"eigen:"+nr,s);
 const id="dyn_"+(nr+1)+"_"+zsHash(zsSaat(s)+":"+nr).toString(36).slice(0,4);
 const k={n:zsNameEindeutig(b[0]+" "+nach,ort),z:b[1],branche:b[0]+" aus "+ort,arten:b[2].slice(),tiers:[Math.max(0,(tier||0)-1),Math.min(5,(tier||0)+1)],geduld:Math.floor(zsRnd("geduld:"+nr,s)*3),lokalPflicht:!!b[3],dyn:true,ort,eigenart:eigen,kommentarGut:"Das war pünktlich, nachvollziehbar und genau die Hilfe, die wir in "+ort+" brauchten.",kommentarSchlecht:"Bitte noch einmal sorgfältig prüfen – bei uns in "+ort+" muss das Ergebnis verlässlich sein."};
 s.kundenDyn[id]=k;KUNDEN[id]=k;st.zaehler++;return id;
}
function zsKundePassend(art,tier,s,salz){s=s||(typeof S!=="undefined"?S:null);if(!s||typeof KUNDEN==="undefined")return null;zsKundenRegistrieren(s);const alle=Object.keys(s.kundenDyn||{}).filter(id=>{const k=KUNDEN[id];return k&&k.arten.includes(art)&&tier>=k.tiers[0]&&tier<=k.tiers[1];});const nr=Object.keys(s.kundenDyn||{}).length;if(alle.length&&(nr>=ZS_REGELN.maxKunden||zsRnd("kunde-neu:"+(salz||"")+":"+nr,s)<Math.min(0.6,nr/8)))return zsPick(alle,"kunde-alt:"+(salz||((s.zs||{}).zaehler||0))+":"+art+":"+tier,s);return zsKundeNeu(art,tier,s)||(alle.length?zsPick(alle,"kunde-alt2:"+(salz||"")+":"+art,s):null);}   /* Ära 9: Kunde je Zettel gesalzen – nicht dreimal derselbe Betrieb */
function zsSollDynamisch(j,s){if(j.gross)return false;const p=(j.tier||0)<=2?ZS_REGELN.dynamischBisTier2:ZS_REGELN.dynamischAbTier3;return zsRnd("dynamisch:"+(j.id||j.t||"?"),s)<p;}
function zsWendung(j,s){if(j.empfehlung||j.folge||j.zweiteChance||j.liga||zsRnd("wendung:"+(j.id||"?"),s)>=ZS_REGELN.wendung)return null;const moeglich=["knauserig","referenz","vertraulich","vorkasse","testballon"],kunde=(typeof S!=="undefined"&&j.kunde&&S.kunden&&S.kunden[j.kunde])||{};if((kunde.sterne||0)>=4)moeglich.push("stammkunde");return zsPick(moeglich,"wendung-art:"+(j.id||"?"),s);}
function zsWendungAnwenden(j,id){if(!id)return j;j.wendung=id;if(id==="stammkunde")j.lohnBasis=Math.round((j.lohnBasis||0)*1.08);if(id==="knauserig"){j.lohnBasis=Math.round((j.lohnBasis||0)*.90);j.tage=(j.tage||1)+1;}if(id==="vertraulich"){j.lohnBasis=Math.round((j.lohnBasis||0)*1.12);j.dsgvo=true;}if(id==="testballon")j.groesse="S";return j;}
function zsVeredeln(j,vorlage){
 if(!j||j._zs||j.empfehlung||j.folge||j.zweiteChance)return j;j._zs=true;const s=typeof S!=="undefined"?S:null;if(!s)return j;
 if(zsSollDynamisch(j,s)){const kid=zsKundePassend(j.art,j.tier||0,s,j.id);
  /* v9.8 (R2): Ein Rechts- oder Medizin-Zettel wechselt nur zu einem Auftraggeber aus demselben Fach –
     sonst stand „Vertragsanalyse für die Kanzlei“ plötzlich bei einer Zahnarztpraxis. */
  const fachArt=(j.art==="recht"||j.art==="medizin"), neu=kid&&typeof KUNDEN!=="undefined"?KUNDEN[kid]:null;
  if(kid&&(!fachArt||(neu&&neu.sektor===j.art))) j.kunde=kid;}
 const K=typeof KUNDEN!=="undefined"?KUNDEN[j.kunde]:null,ort=K&&K.ort?" in "+K.ort:"",kern=j.b||"",an=zsPick(ZS_ANLASS[j.art]||ZS_ANLASS.text,"anlass:"+j.id,s),er=zsPick(ZS_ERWARTUNG,"erwartung:"+j.id,s);
 j.b=an+" "+kern+" "+er;j.t=(j.t||"Auftrag")+(ort&&!(j.t||"").includes(ort)?ort:"");return zsWendungAnwenden(j,zsWendung(j,s));
}
const ZS_WENDUNG_TEXT={stammkunde:["🤝","Stammkunde","+8 % Lohn"],knauserig:["🪙","Knauserig","−10 % Lohn · +1 Tag"],referenz:["📣","Referenz","+1 Ruf bei sauberer Abnahme"],vertraulich:["🔒","Vertraulich","nur lokal · +12 % Lohn"],vorkasse:["💶","Vorkasse","30 % bei Annahme"],testballon:["🧪","Testballon","kleines Los · Folgechance"]};
function zsWendungChip(j){const x=j&&ZS_WENDUNG_TEXT[j.wendung];return x?'<span class="merk '+(j.wendung==="knauserig"?'schlecht':'gold')+'" title="'+x[2]+'">'+x[0]+' '+x[1]+' · '+x[2]+'</span>':"";}
function zsBeiAnnahme(j){if(!j||j.wendung!=="vorkasse"||j.vorkasseBetrag)return;j.vorkasseBetrag=Math.round((j.vereinbart||0)*.30);if(j.vorkasseBetrag&&typeof buche==="function")buche(j.vorkasseBetrag,"job","Vorkasse · "+j.t);}
function zsBeiAbschluss(j,er,gut,bericht,spaet,gescheitert){
 if(!j)return;if(typeof zsAnliegenBeiAbschluss==="function")zsAnliegenBeiAbschluss(j,gut&&!spaet&&!gescheitert,bericht);if(j.vorkasseBetrag){if(spaet||gescheitert){if(!j.vorkasseErstattet&&typeof buche==="function")buche(-j.vorkasseBetrag,"strafe","Vorkasse zurück · "+j.t);j.vorkasseErstattet=true;}else if(er)er.lohn=Math.max(0,(er.lohn||0)-j.vorkasseBetrag);}
 if(gut&&j.wendung==="referenz"&&typeof rufBonusDazu==="function"){rufBonusDazu(1);if(bericht)bericht.zeilen.push({t:"📣 Referenzauftrag sauber: Ruf +1.",art:"gut"});}
 if(gut&&j.wendung==="testballon"&&!j.testballonFolge&&zsRnd("testfolge:"+j.id)<.25&&typeof S!=="undefined"){const n={...j,id:"j"+(S.zaehler++),frisch:S.tag,team:null,vereinbart:undefined,_zs:true,folge:true,testballonFolge:true,wendung:null,t:"Nach dem Test: "+j.t};delete n.vorkasseBetrag;S.jobs.push(n);if(bericht)bericht.zeilen.push({t:"🧪 Der Testballon überzeugt – ein Folgeauftrag hängt bereits an der Pinnwand.",art:"gut"});}
}
function zsMorgen(bericht){
 if(!bericht||!bericht.zeilen||typeof S==="undefined")return;const teile=[],p=(typeof rhWetterbericht==="function"?rhWetterbericht(2):(typeof rhPrognose==="function"?rhPrognose(2):[]));
 if(p&&p.length)teile.push("Wetter: "+p.map((x,i)=>(i?"morgen ":"heute ")+(x.name||x.n||"Wetter")+" (Solar ×"+(typeof rhN==="function"?rhN(x.pvF,1):Number(x.pvF).toFixed(1))+")").join(", ")+".");
 const gestern=(S.journal||[]).filter(x=>x.tag===S.tag-1&&x.kat==="job"&&x.b>0);if(gestern.length)teile.push(gestern.length+" bezahlte Abnahme"+(gestern.length===1?"":"n")+" gestern.");const bisSaison=30-((S.tag-1)%30);if(bisSaison<=4)teile.push("Saisonwechsel in "+bisSaison+" Tag"+(bisSaison===1?"":"en")+".");
 const st=zsStand(S);if((!st.geruecht||st.geruecht.tag<S.tag-1)&&zsRnd("geruecht:"+S.tag)<.22){const ids=["dunkelflaute","opensource_release","fachkraefte_zulauf"],id=zsPick(ids,"geruecht-id:"+S.tag);st.geruecht={id,tag:S.tag,wahr:zsRnd("geruecht-wahr:"+S.tag)<ZS_REGELN.geruechtWahr};}if(st.geruecht&&st.geruecht.tag===S.tag){const tx={dunkelflaute:"am Markt könnten die Strompreise anziehen",opensource_release:"im Dorf wird über eine Datenspende gesprochen",fachkraefte_zulauf:"eine neue Kundschaft schaut sich nach KI-Hilfe um"}[st.geruecht.id];teile.push("Gerücht: "+tx+".");}if(teile.length)bericht.zeilen.push({t:"📰 Hofpost · "+teile.join(" "),art:"info"});
 if(typeof zsAnliegenMorgen==="function")zsAnliegenMorgen(bericht);   /* Ära 9: Dorf-Anliegen */
}
function zsErzwungenesEreignis(){if(typeof S==="undefined")return null;const g=zsStand(S).geruecht;if(!g||!g.wahr||S.tag!==g.tag+1)return null;return g.id;}
function zsEreignisGewicht(e){if(!e||typeof S==="undefined")return 1;let f=1,typ=(e.effekt||{}).typ||"",id=e.id||"";if((typ==="ausfall"||id.includes("cloud"))&&S.tiere.some(t=>t.api))f*=2;const r=typeof rh==="function"?rh():null;if(r&&((r.pv||[]).length||(r.wind||[]).length)&&(typ==="strompreis"||/solar|wind|dunkel/.test(id)))f*=1.5;if(S.tag<6&&e.art!=="gut")f*=.5;return Math.max(.5,Math.min(2.5,f));}
function zsHofbuchHtml(){return '<p><b>Dorf-Anliegen (freiwillig):</b> ab Hoftag '+ZS_ANLIEGEN_REGELN.abTag+' alle '+ZS_ANLIEGEN_REGELN.alleTage+' Tage ein Bittbrief mit klarem Ziel (saubere Zettel einer Art oder eines Betriebs, Nächte mit Zusatzarbeit, eingesetzte Eigenenergie, Datenlese-Tage), '+ZS_ANLIEGEN_REGELN.frist+' Tage Frist, Prämie in Euro plus Ruf +'+ZS_ANLIEGEN_REGELN.ruf+'. Höchstens '+ZS_ANLIEGEN_REGELN.maxOffen+' offen; Verfall kostet nichts.</p><p>Die <b>Zettelschmiede</b> kombiniert geprüfte Auftragsvorlagen mit einer Saat je Partie. Sie verändert keine Anforderungen oder Energieregeln. Bis zu '+ZS_REGELN.maxKunden+' neue Betriebe entstehen aus Branchen, Namen, Orten und Eigenarten.</p><p>Bei '+Math.round(ZS_REGELN.wendung*100)+' % der normalen Zettel erscheint höchstens eine sichtbare Wendung: Stammkunde +8 %, Knauserig −10 % und +1 Tag, Vertraulich +12 % und nur lokal, Vorkasse 30 %, Referenz +1 Ruf oder Testballon mit Folgechance. Lohnänderungen bleiben damit im Band ±12 %, Fristen bei ±1 Tag.</p><p>Die Hofpost verwendet nur Spielstand und exakte Spielwetter-Prognose. Ein ausdrücklich als <b>Gerücht</b> bezeichneter Satz trifft mit '+Math.round(ZS_REGELN.geruechtWahr*100)+' % zu; er ist niemals als Fakt formuliert.</p>';}

/* ── Ära 9 · Dorf-Anliegen: freiwillige Aufgaben aus der Kundschaft ───────────────
   Alle 5 Hoftage (ab Tag 3) schreibt ein Betrieb aus dem Umland einen Bittbrief: ein
   klares Ziel, eine Frist, eine Prämie. Nichts ist Pflicht – ein verfallenes Anliegen
   kostet nichts. Fortschritt zählt der Hof selbst aus dem echten Spielstand. */
const ZS_ANLIEGEN_REGELN={alleTage:5,abTag:3,maxOffen:2,frist:6,ruf:1};
const ZS_ANLIEGEN_ARTEN=[
 {id:"sauber_art",n:(a,n)=>n+" saubere "+({support:"Support-",text:"Text-",code:"Code-",agent:"Agenten-",wissen:"Wissens-",recht:"Rechts-",medizin:"Medizin-"}[a]||"")+"Zettel abliefern",ziel:(s)=>2+Math.floor(zsRnd("anl-n:"+s.tag,s)*2),praemie:(z)=>70*z},
 {id:"kunde",n:(a,n,k)=>n+" Zettel von "+(k?k.n:"diesem Betrieb")+" sauber abliefern",ziel:()=>2,praemie:(z)=>110*z},
 {id:"nacht",n:(a,n)=>n+" Nächte mit geplanter Zusatzarbeit",ziel:()=>2,praemie:(z)=>60*z,feld:"naechteArbeit"},
 {id:"eigen",n:(a,n)=>n+" kWh Eigenenergie einsetzen",ziel:(s)=>(typeof rh==="function"&&((rh(s).pv||[]).length||(rh(s).wind||[]).length))?6:3,praemie:(z)=>25*z,feld:"eigenGesamt"},
 {id:"lese",n:(a,n)=>"An "+n+" Tagen die Datenlese spielen",ziel:()=>2,praemie:(z)=>45*z}
];
function zsAnliegenListe(s){ s=s||(typeof S!=="undefined"?S:null); if(!s) return []; const st=zsStand(s); st.anliegen=st.anliegen||[]; return st.anliegen; }
function zsAnliegenNeu(s){
 s=s||(typeof S!=="undefined"?S:null); if(!s||typeof KUNDEN==="undefined") return null;
 const liste=zsAnliegenListe(s); if(liste.filter(a=>!a.fertig&&!a.verfallen).length>=ZS_ANLIEGEN_REGELN.maxOffen) return null;
 const arten=(s.jobs||[]).map(j=>j.art).filter(Boolean); const art=arten.length?zsPick(arten,"anl-art:"+s.tag,s):"text";
 const kid=zsKundePassend(art,1,s)||Object.keys(KUNDEN)[0]; const K=KUNDEN[kid]||{};
 const typ=zsPick(ZS_ANLIEGEN_ARTEN,"anl-typ:"+s.tag,s); const ziel=typ.ziel(s); const h=(typeof hlStand==="function")?hlStand(s):{};
 const a={id:"a"+s.tag+"_"+zsHash(zsSaat(s)+":anl:"+s.tag).toString(36).slice(0,3),typ:typ.id,art,kunde:kid,n:typ.n(art,ziel,K),ziel,fortschritt:0,start:s.tag,bis:s.tag+ZS_ANLIEGEN_REGELN.frist,praemie:typ.praemie(ziel),ruf:ZS_ANLIEGEN_REGELN.ruf,
  basis:typ.feld?(h[typ.feld]||0):(typ.id==="lese"?(s.leseTag||0):0),fertig:false,verfallen:false,
  txt:(K.z||"✉️")+" "+(K.n||"Ein Betrieb")+(K.ort?" aus "+K.ort:"")+" schreibt: „"+({sauber_art:"Wir hören, dass ihr sauber arbeitet – zeigt es uns.",kunde:"Wir hätten gern eine feste Zusammenarbeit, erst einmal auf Probe.",nacht:"Unsere Nachtschicht will wissen, ob euer Hof auch nachts liefert.",eigen:"Wir zahlen gern für Arbeit aus Sonne und Wind.",lese:"Unsere Daten sind ein Durcheinander – zeigt, dass ihr sortieren könnt."}[typ.id])+"“"};
 liste.push(a); return a;
}
function zsAnliegenFortschritt(a,s){
 s=s||S; const h=(typeof hlStand==="function")?hlStand(s):{}; const typ=ZS_ANLIEGEN_ARTEN.find(t=>t.id===a.typ)||{};
 if(typ.feld) return Math.max(0,Math.round(((h[typ.feld]||0)-(a.basis||0))*10)/10);
 return a.fortschritt||0;
}
function zsAnliegenBeiAbschluss(j,gut,bericht){
 if(!gut||!j) return; for(const a of zsAnliegenListe()){ if(a.fertig||a.verfallen) continue;
  if(a.typ==="sauber_art"&&j.art===a.art) a.fortschritt=(a.fortschritt||0)+1;
  if(a.typ==="kunde"&&j.kunde===a.kunde) a.fortschritt=(a.fortschritt||0)+1; }
}
function zsAnliegenMorgen(bericht){
 if(typeof S==="undefined"||!S) return; const liste=zsAnliegenListe(S);
 for(const a of liste){ if(a.fertig||a.verfallen) continue;
  if(a.typ==="lese"&&S.leseTag===S.tag-1&&a.letzterLeseTag!==S.tag-1){ a.fortschritt=(a.fortschritt||0)+1; a.letzterLeseTag=S.tag-1; }
  const f=zsAnliegenFortschritt(a);
  if(f>=a.ziel){ a.fertig=true; a.fertigTag=S.tag; if(typeof buche==="function") buche(a.praemie,"job","Dorf-Anliegen: "+a.n); if(typeof rufBonusDazu==="function") rufBonusDazu(a.ruf);
   if(bericht&&bericht.zeilen) bericht.zeilen.push({t:"✉️ Dorf-Anliegen erfüllt: "+a.n+" – "+((KUNDEN[a.kunde]||{}).n||"Der Betrieb")+" zahlt "+a.praemie+" € und erzählt es weiter (Ruf +"+a.ruf+").",art:"gut"});
   if(typeof questHook==="function") try{ questHook("anliegen",a.typ); }catch(e){} continue; }
  if(S.tag>a.bis){ a.verfallen=true; if(bericht&&bericht.zeilen) bericht.zeilen.push({t:"✉️ Dorf-Anliegen verfallen (freiwillig, keine Strafe): "+a.n+" – "+f+"/"+a.ziel+".",art:"info"}); }
 }
 if(S.tag>=ZS_ANLIEGEN_REGELN.abTag&&(S.tag-ZS_ANLIEGEN_REGELN.abTag)%ZS_ANLIEGEN_REGELN.alleTage===0){ const a=zsAnliegenNeu(S); if(a&&bericht&&bericht.zeilen) bericht.zeilen.push({t:"✉️ Neues Dorf-Anliegen: "+a.n+" bis Tag "+a.bis+" – Prämie "+a.praemie+" € (+"+a.ruf+" Ruf). "+a.txt,art:"info"}); }
 const st=zsStand(S); st.anliegen=liste.filter(a=>!(a.verfallen&&S.tag>a.bis+3)&&!(a.fertig&&S.tag>(a.fertigTag||0)+2));
}
function zsAnliegenHtml(kompakt){
 if(typeof S==="undefined"||!S) return ""; const offen=zsAnliegenListe(S).filter(a=>!a.fertig&&!a.verfallen); const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 if(!offen.length) return kompakt?"":'<div class="karte"><h3>✉️ Dorf-Anliegen</h3><p>Zurzeit liegt kein Bittbrief aus dem Umland vor. Alle '+ZS_ANLIEGEN_REGELN.alleTage+' Hoftage schreibt ein Betrieb – freiwillig, ohne Strafe.</p></div>';
 return '<div class="karte"><h3>✉️ Dorf-Anliegen <span class="merk">freiwillig</span></h3>'+(kompakt?'':'<div class="reihe"><button class="knopf s hell" onclick="adaSprich(\'anliegen\',true)">🔊 Ada zu Dorf-Anliegen</button></div>')+offen.map(a=>{const f=zsAnliegenFortschritt(a);return '<div class="empfehlung abstand"><span class="esym">'+e((KUNDEN[a.kunde]||{}).z||"✉️")+'</span><span class="etxt"><b>'+e(a.n)+'</b> · bis Tag '+a.bis+' · Prämie '+a.praemie+' € +'+a.ruf+' Ruf<br><progress max="'+a.ziel+'" value="'+Math.min(a.ziel,f)+'"></progress> '+f+'/'+a.ziel+(kompakt?'':'<br><i>'+e(a.txt)+'</i>')+'</span></div>';}).join("")+'</div>';
}
if(typeof window!=="undefined")Object.assign(window,{ZS_ANLIEGEN_REGELN,zsAnliegenListe,zsAnliegenNeu,zsAnliegenFortschritt,zsAnliegenMorgen,zsAnliegenHtml,ZS_REGELN,zsSaat,zsRnd,zsKundenRegistrieren,zsKundeNeu,zsVeredeln,zsWendungChip,zsBeiAnnahme,zsBeiAbschluss,zsMorgen,zsErzwungenesEreignis,zsEreignisGewicht,zsHofbuchHtml});
