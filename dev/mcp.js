/* ═══════════════════════════════════════════════════════════════════════════
   Ära 9 · v9.9 — MCP-Werkstatt: Das Model Context Protocol als eigener Techbaum
   ---------------------------------------------------------------------------
   MCP (Model Context Protocol) ist der offene Standard, über den Agenten mit
   Diensten sprechen: Ein Host (die Agenten-App) hält je Server einen Client,
   ein Server bietet Werkzeuge (tools), Datenquellen (resources) und Vorlagen
   (prompts) an; die Nachrichten sind JSON-RPC 2.0, die Leitungen stdio (lokal)
   oder Streamable HTTP (entfernt). Im Spiel ist das der Anschlussbrett-Baum
   der Forschungshütte – vom Hofsprecher bis zur Buchhaltung.

   Nur Wahrheit: Jede Zahl in MCP_REGELN steht auch im Hofbuch; die Fakten in
   den Knoten tragen Stand und Quelle. Die Spielwirkungen sind ausdrücklich
   als Spielannahmen gekennzeichnet, wo sie keine Messung abbilden.

   Nutzen/Malus-Kette (keine Kollision mit Forschung, Skills, Agenten-Tool):
     · Anschließen kostet Geld und einen Tag Anschlussarbeit (eigener Platz,
       nicht der Forschungsplatz) und verlangt ein Agenten-Tool mit MCP-Unterstützung.
     · Anschlüsse geben Agenten-Zetteln Lohn und Qualität – ohne sie arbeiten
       Agenten „von Hand“ (Malus), ab Tier 3 gar nicht.
     · Wer Server anschließt, ohne die Sicherheitsknoten zu nehmen, riskiert das
       Ereignis „Vergiftete Werkzeugbeschreibung“ (Tool Poisoning).
   ═══════════════════════════════════════════════════════════════════════════ */

const MCP_REGELN={
  freiAbStufe:3, forschung:"geschirr",            /* Werkstatt öffnet ab Hofstufe 3, wenn die Agentenwerkstatt erforscht ist */
  agentBonus:6,                                   /* tools: +6 Agentenleistung bei Agenten-Tool mit MCP (Spielannahme) */
  overheadMinus:2,                                /* resources: −2 Prozentpunkte Tool-Overhead je Agenten-Tool (Spielannahme) */
  koordMinus:0.02,                                /* prompts: Team-Abstimmung −2 % je weiterem Agenten (Spielannahme) */
  elicitationDsF:0.85, auditDsF:0.7,              /* Datenschutz-Risiko auf Agenten-Zetteln ×0,85 bzw. ×0,7 */
  rootsSchadenF:0.75, sandboxSchadenF:0.5,        /* Schaden einer Prompt-Injection ×0,75 bzw. ×0,5 */
  anschlussLohnF:1.08, handMalus:12,              /* passender Anschluss: +8 % Lohn; fehlend: −12 Qualität, ab Tier 3 gesperrt */
  giftP:0.08, giftAllowlistF:0.25, giftRegistryF:0.1, giftRuf:-4, giftStrafe:60,   /* vergiftete Werkzeugbeschreibung je Tag mit Anschluss */
  httpOhneOauthDsF:1.5                            /* entfernter Server ohne OAuth: Datenschutz-Risiko ×1,5 (Token-Weitergabe) */
};

/* Welche Anschlüsse ein Zettel braucht, wenn er keine eigene Liste trägt (nach Sektor/Art) */
const MCP_BEDARF_SEKTOR={buero:["mail"],verwaltung:["mail","datei"],handel:["buchhaltung"],gastro:["buchhaltung"],handwerk:["datei"],it:["datei","web"],medien:["web"],bildung:["datei"],finanzen:["buchhaltung"],steuer:["buchhaltung"],recht:["datei"],medizin:["datei"],personal:["mail"],logistik:["web"],energie:["web"],landwirtschaft:["datei"],immobilien:["mail"],tourismus:["web"],sicherheit:["datei"],soziales:["mail"],pflege:["datei"]};

const MCP_ZWEIGE=[
 {id:"leitung",n:"Leitungen",z:"🔌",farbe:"#8ec2ec",knoten:[
   {id:"stdio",n:"Lokale Leitung (stdio)",kurz:"stdio",z:"🧵",kosten:120,tage:1,braucht:[],
    fakt:"Ein lokaler MCP-Server läuft als eigener Prozess; Host und Server reden über die Standard-Ein- und -Ausgabe, eine JSON-RPC-Nachricht je Zeile. Keine Ports, keine Netzfreigabe – das ist der Standardweg für Werkzeuge auf demselben Rechner.",
    eff:"Öffnet den Zweig Anschlüsse (lokale Server). Stand 03/2025 (MCP-Spezifikation)."},
   {id:"http",n:"Fernleitung (Streamable HTTP)",kurz:"HTTP",z:"🌐",kosten:260,tage:1,braucht:["stdio"],
    fakt:"Entfernte Server sprechen HTTP: der Client schickt JSON-RPC per POST, Antworten und Ereignisse kommen als Stream (Server-Sent Events) zurück. Streamable HTTP löste im März 2025 das alte HTTP+SSE-Verfahren ab.",
    eff:"Öffnet den Web-Anschluss. Ohne OAuth zählt jeder Fern-Anschluss beim Datenschutz ×"+MCP_REGELN.httpOhneOauthDsF+" (Token-Weitergabe)."},
   {id:"oauth",n:"Schlüsselamt (OAuth 2.1)",kurz:"OAuth",z:"🗝️",kosten:380,tage:1,braucht:["http"],
    fakt:"Fern-Server verlangen seit der Spezifikation 2025 OAuth 2.1: Der Client holt ein Token beim Autorisierungsserver, der MCP-Server prüft es und darf es nicht einfach an Dritte weiterreichen (Token-Passthrough gilt als Verstoß).",
    eff:"Hebt den ×"+MCP_REGELN.httpOhneOauthDsF+"-Aufschlag der Fernleitung wieder auf."}]},
 {id:"server",n:"Server-Bausteine",z:"🧰",farbe:"#eb9b2d",knoten:[
   {id:"tools",n:"Werkzeuge (tools)",kurz:"tools",z:"🔧",kosten:150,tage:1,braucht:[],
    fakt:"Ein Server beschreibt jedes Werkzeug mit Name, Beschreibung und JSON-Schema der Eingaben (tools/list); das Modell entscheidet, welches es aufruft (tools/call). Genau das tut auch der Hofsprecher mit der Nadel.",
    eff:"+"+MCP_REGELN.agentBonus+" Agentenleistung für Modelle in einem Agenten-Tool mit MCP (Spielannahme)."},
   {id:"resources",n:"Datenquellen (resources)",kurz:"resources",z:"📂",z2:"",kosten:200,tage:1,braucht:["tools"],
    fakt:"Resources sind adressierbare Inhalte (URI), die die Anwendung auswählt – Dateien, Datenbankzeilen, Protokolle. Sie ersetzen das Hineinkopieren ganzer Texte in den Prompt.",
    eff:"−"+MCP_REGELN.overheadMinus+" Prozentpunkte Tool-Overhead je Agenten-Tool auf Agenten-Zetteln (Spielannahme)."},
   {id:"prompts",n:"Vorlagen (prompts)",kurz:"prompts",z:"📝",kosten:220,tage:1,braucht:["tools"],
    fakt:"Prompts sind vom Server angebotene, vom Nutzer gewählte Vorlagen mit Argumenten – wiederverwendbare Arbeitsanweisungen, die ein ganzes Team gleich ausführt.",
    eff:"Team-Abstimmung −"+Math.round(MCP_REGELN.koordMinus*100)+" % je weiterem Agenten (Spielannahme)."}]},
 {id:"client",n:"Client-Fähigkeiten",z:"🤝",farbe:"#5aa348",knoten:[
   {id:"roots",n:"Wurzeln (roots)",kurz:"roots",z:"🌱",kosten:180,tage:1,braucht:[],
    fakt:"Der Client teilt dem Server mit, welche Verzeichnisse überhaupt gemeint sind (roots). Ein Dateiserver arbeitet dann nur innerhalb dieser Grenzen.",
    eff:"Schaden einer Prompt-Injection ×"+MCP_REGELN.rootsSchadenF+" (Spielannahme)."},
   {id:"sampling",n:"Rückfrage ans Modell (Sampling)",kurz:"sampling",z:"🔁",kosten:320,tage:2,braucht:["roots"],
    fakt:"Mit Sampling darf ein Server den Host bitten, das Modell etwas generieren zu lassen – der Mensch behält die Freigabe. So können Server eigene Teilschritte delegieren.",
    eff:"Team-Zettel: die Agenten teilen Teilaufgaben – Abstimmung nochmals −"+Math.round(MCP_REGELN.koordMinus*100)+" % (Spielannahme)."},
   {id:"elicitation",n:"Nachfrage beim Menschen (Elicitation)",kurz:"elicitation",z:"❓",kosten:300,tage:1,braucht:["roots"],
    fakt:"Seit Juni 2025 kann ein Server strukturierte Rückfragen an den Nutzer stellen, statt Annahmen zu treffen – etwa welche Adresse oder welches Konto gemeint ist. Die Spezifikation nennt das Elicitation.",
    eff:"Datenschutz-Risiko auf Agenten-Zetteln ×"+MCP_REGELN.elicitationDsF+"."}]},
 {id:"anschluss",n:"Anschlüsse",z:"🗂️",farbe:"#b57edc",knoten:[
   {id:"srv_datei",n:"Dateiserver",kurz:"Datei",z:"📁",kosten:150,tage:1,braucht:["stdio"],
    fakt:"Der Referenz-Dateiserver aus dem MCP-Projekt liest, sucht und schreibt Dateien innerhalb der freigegebenen Wurzeln. Er ist meist der erste Server, den ein Agent bekommt.",
    eff:"Anschluss für Zettel aus Handwerk, IT, Recht, Medizin, Bildung, Pflege. Passender Anschluss: +"+Math.round((MCP_REGELN.anschlussLohnF-1)*100)+" % Lohn."},
   {id:"srv_mail",n:"Post & Kalender",kurz:"Mail",z:"📬",kosten:220,tage:1,braucht:["stdio"],
    fakt:"Mail- und Kalenderserver sind typische Fern-Anschlüsse: Postfach lesen, Termine anlegen, Antworten vorbereiten – jeder Schritt als Werkzeugaufruf mit Freigabe.",
    eff:"Anschluss für Büro, Verwaltung, Personal, Soziales, Immobilien."},
   {id:"srv_buchhaltung",n:"Buchhaltung",kurz:"Buchhaltung",z:"🧾",kosten:300,tage:1,braucht:["srv_datei"],
    fakt:"Buchhaltungs- und Warenwirtschaftssysteme bieten Werkzeuge wie „Beleg anlegen“ oder „Bestand lesen“ an; über MCP bekommt jeder Agent dieselbe geprüfte Schnittstelle statt Bildschirm-Klickerei.",
    eff:"Anschluss für Handel, Gastro, Finanzen, Steuern."},
   {id:"srv_web",n:"Web & Suche",kurz:"Web",z:"🔎",kosten:280,tage:1,braucht:["http"],
    fakt:"Ein Fetch-/Such-Server holt Seiten und Suchtreffer als Text. Erst damit weiß ein lokales Modell etwas, das nach seinem Trainingsstand passiert ist.",
    eff:"Anschluss für IT, Medien, Logistik, Energie, Tourismus. Ohne OAuth gilt der Fernleitungs-Aufschlag."}]},
 {id:"sicherheit",n:"Sicherheit",z:"🛡️",farbe:"#e05a5a",knoten:[
   {id:"allowlist",n:"Werkzeug-Freigabeliste",kurz:"Freigabeliste",z:"📋",kosten:200,tage:1,braucht:[],
    fakt:"Eine vergiftete Werkzeugbeschreibung enthält versteckte Anweisungen, die das Modell befolgt (Tool Poisoning, 2025 von Invariant Labs beschrieben). Gegenmittel: nur geprüfte Werkzeuge zulassen und ihre Beschreibungen festschreiben (Pinning).",
    eff:"Ereignis „Vergiftete Werkzeugbeschreibung“ ×"+MCP_REGELN.giftAllowlistF+"."},
   {id:"sandbox",n:"Sandkasten & Mindestrechte",kurz:"Sandbox",z:"🧱",kosten:320,tage:1,braucht:["allowlist"],
    fakt:"Server laufen mit so wenig Rechten wie möglich: eigener Nutzer, Container, keine Schreibrechte außerhalb der Wurzeln. Der „Confused Deputy“ – ein Server, der mit fremden Rechten handelt – wird so eingehegt.",
    eff:"Schaden einer Prompt-Injection ×"+MCP_REGELN.sandboxSchadenF+" (zusätzlich zu roots)."},
   {id:"audit",n:"Prüfprotokoll & Freigabe",kurz:"Audit",z:"🧾",kosten:360,tage:2,braucht:["allowlist"],
    fakt:"Jeder Werkzeugaufruf wird protokolliert, riskante Aufrufe verlangen die Freigabe eines Menschen (human in the loop). Das ist die Grundlage jeder Datenschutz-Prüfung.",
    eff:"Datenschutz-Risiko auf Agenten-Zetteln ×"+MCP_REGELN.auditDsF+" (zusätzlich zum Kontrollpaket)."},
   {id:"registry",n:"Geprüfte Quellen (Registry)",kurz:"Quellen",z:"📚",kosten:420,tage:2,braucht:["sandbox","audit"],
    fakt:"Seit 2025 gibt es eine offizielle MCP-Registry; Ende 2025 wanderte MCP unter das Dach der Linux Foundation (Agentic AI Foundation). Server aus geprüften Quellen mit festen Versionen verhindern den „Rug Pull“ – ein Server, der seine Werkzeuge nachträglich ändert.",
    eff:"Ereignis „Vergiftete Werkzeugbeschreibung“ ×"+MCP_REGELN.giftRegistryF+"."}]}
];

const MCP_ANSCHLUESSE={datei:"srv_datei",mail:"srv_mail",buchhaltung:"srv_buchhaltung",web:"srv_web"};
function mcpAlleKnoten(){ return MCP_ZWEIGE.flatMap(z=>z.knoten.map(k=>({...k,zweig:z.id,farbe:z.farbe}))); }
function mcpKnoten(id){ return mcpAlleKnoten().find(k=>k.id===id)||null; }
function mcpStand(){ if(!S) return {fertig:{},aktiv:null,tage:0}; S.mcp=S.mcp||{fertig:{},aktiv:null,tage:0,gift:0}; return S.mcp; }
function mcpHat(id){ return !!(S&&S.mcp&&S.mcp.fertig&&S.mcp.fertig[id]); }
function mcpFrei(){ return !!(S&&typeof hofLevel==="function"&&hofLevel().i>=MCP_REGELN.freiAbStufe&&typeof forschungFrei==="function"&&forschungFrei(MCP_REGELN.forschung)); }
function mcpGeschirrOk(){ return (S&&S.tiere||[]).some(p=>p.geschirr&&typeof HARNESSE!=="undefined"&&HARNESSE[p.geschirr]&&HARNESSE[p.geschirr].mcp); }
function mcpAnzahlFertig(){ return Object.keys(mcpStand().fertig||{}).length; }
function mcpAnschluesse(){ return Object.entries(MCP_ANSCHLUESSE).filter(([k,id])=>mcpHat(id)).map(([k])=>k); }
function mcpVorOk(k){ return (k.braucht||[]).every(id=>mcpHat(id)); }
function mcpStatus(k){
  const st=mcpStand();
  if(mcpHat(k.id)) return "fertig";
  if(st.aktiv&&st.aktiv.id===k.id) return "aktiv";
  if(!mcpVorOk(k)) return "gesperrt";
  return (st.aktiv||!(typeof kannZahlen==="function")||S.kredit>=k.kosten)&&!st.aktiv?"kann":"teuer";
}
function mcpKann(k){ return mcpFrei()&&mcpGeschirrOk()&&!mcpHat(k.id)&&mcpVorOk(k)&&!mcpStand().aktiv&&S.kredit>=k.kosten; }

/* Anschlussarbeit starten: Geld sofort, ein bis zwei Tage Arbeit auf dem Anschlussbrett (unabhängig vom Forschungsplatz) */
function mcpStart(id){
  const k=mcpKnoten(id); if(!k) return false;
  if(!mcpFrei()){ melde("Die MCP-Werkstatt öffnet ab Hofstufe "+MCP_REGELN.freiAbStufe+", sobald die Agentenwerkstatt erforscht ist.","schlecht"); return false; }
  if(!mcpGeschirrOk()){ melde("Kein Agenten-Tool mit MCP-Unterstützung im Stall – das Basis-Tool, pi und Aider unterstützen kein MCP. Weise in der Agentenwerkstatt ein anderes Tool zu.","schlecht"); return false; }
  if(mcpHat(id)){ melde(k.n+" ist schon angeschlossen.","schlecht"); return false; }
  if(!mcpVorOk(k)){ melde(k.n+" braucht erst: "+k.braucht.map(b=>(mcpKnoten(b)||{}).n||b).join(", ")+".","schlecht"); return false; }
  const st=mcpStand(); if(st.aktiv){ melde("Auf dem Anschlussbrett läuft schon „"+(mcpKnoten(st.aktiv.id)||{}).n+"“ (noch "+st.aktiv.rest+" Tag(e)).","schlecht"); return false; }
  if(typeof hofZu==="function"&&hofZu("Anschließen")) return false;
  if(!kannZahlen(k.kosten)) return false;
  buche(-k.kosten,"forschung","MCP-Anschluss · "+k.n);
  st.aktiv={id,rest:k.tage};
  melde("🔌 "+k.n+" wird angeschlossen – "+k.tage+" Tag(e) Anschlussarbeit.","gut");
  try{ questHook("mcp_start",null); }catch(e){}
  sichern(); return true;
}
/* Tageswechsel: Anschlussarbeit zählt herunter; fertig = Knoten frei. Danach das Sicherheits-Ereignis. */
function mcpTag(bericht){
  const st=mcpStand(); if(!S) return;
  if(st.aktiv){ st.aktiv.rest--; if(st.aktiv.rest<=0){ const k=mcpKnoten(st.aktiv.id); st.fertig[st.aktiv.id]=S.tag; st.aktiv=null; st.tage=(st.tage||0)+1;
      if(bericht&&bericht.zeilen) bericht.zeilen.push({t:"🔌 MCP-Werkstatt: „"+(k||{}).n+"“ angeschlossen. "+((k||{}).eff||""),art:"gut"});
      try{ questHook("mcp_fertig",null); }catch(e){} } }
  mcpEreignisTag(bericht);
}
/* Vergiftete Werkzeugbeschreibung: nur mit angeschlossenem Server; Freigabeliste und geprüfte Quellen senken die Chance, der Sandkasten halbiert den Schaden */
function mcpEreignisTag(bericht){
  if(!mcpAnschluesse().length) return null;
  let p=MCP_REGELN.giftP; if(mcpHat("registry")) p*=MCP_REGELN.giftRegistryF; else if(mcpHat("allowlist")) p*=MCP_REGELN.giftAllowlistF;
  if(Math.random()>=p) return null;
  const f=mcpHat("sandbox")?MCP_REGELN.sandboxSchadenF:1, strafe=Math.round(MCP_REGELN.giftStrafe*f), ruf=Math.round(MCP_REGELN.giftRuf*f);
  buche(-strafe,"strafe","Vergiftete Werkzeugbeschreibung (Tool Poisoning)"); if(typeof rufBonusDazu==="function") rufBonusDazu(ruf);
  const st=mcpStand(); st.gift=(st.gift||0)+1;
  const t="☠️ Vergiftete Werkzeugbeschreibung: Ein angeschlossener Server hat seine Werkzeugtexte mit versteckten Anweisungen versehen – ein Agent hat sie befolgt. Vorfallanalyse "+geld(strafe)+", Ruf "+ruf+"."+(mcpHat("allowlist")?"":" Freigabeliste und festgeschriebene Beschreibungen senken die Chance ×"+MCP_REGELN.giftAllowlistF+".")+(mcpHat("sandbox")?" Der Sandkasten hat den Schaden halbiert.":"");
  if(bericht&&bericht.zeilen) bericht.zeilen.push({t,art:"schlecht"}); else melde(t,"schlecht");
  try{ questHook("tool_poisoning",null); }catch(e){}
  return {strafe,ruf};
}

/* Gesammelte Wirkungen für die anderen Bausteine (alle Zahlen aus MCP_REGELN) */
function mcpEffekte(){
  const e={agentBonus:0,overheadMinus:0,koordMinus:0,dsF:1,schadenF:1};
  if(!S||!S.mcp) return e;
  if(mcpHat("tools")) e.agentBonus=MCP_REGELN.agentBonus;
  if(mcpHat("resources")) e.overheadMinus=MCP_REGELN.overheadMinus;
  if(mcpHat("prompts")) e.koordMinus+=MCP_REGELN.koordMinus;
  if(mcpHat("sampling")) e.koordMinus+=MCP_REGELN.koordMinus;
  if(mcpHat("elicitation")) e.dsF*=MCP_REGELN.elicitationDsF;
  if(mcpHat("audit")) e.dsF*=MCP_REGELN.auditDsF;
  if(mcpHat("http")&&!mcpHat("oauth")&&mcpHat("srv_web")) e.dsF*=MCP_REGELN.httpOhneOauthDsF;
  if(mcpHat("roots")) e.schadenF*=MCP_REGELN.rootsSchadenF;
  if(mcpHat("sandbox")) e.schadenF*=MCP_REGELN.sandboxSchadenF;
  return e;
}
/* Welche Anschlüsse ein Zettel braucht: eigene Liste, sonst nach Sektor, sonst Datei */
function mcpBedarf(j){
  if(!j||!j.agent) return [];
  if(Array.isArray(j.mcp)) return j.mcp.slice();
  if(j.sektor&&MCP_BEDARF_SEKTOR[j.sektor]) return MCP_BEDARF_SEKTOR[j.sektor].slice();
  return ["datei"];
}
/* Prüfung für hlTeamCheck: fehlender Anschluss = Malus (Tier 0–2) oder Sperre (ab Tier 3); passender Anschluss = Lohnbonus über jobLohnGesamt */
function mcpJobCheck(j,c){
  const bedarf=mcpBedarf(j); if(!bedarf.length) return;
  const fehlt=bedarf.filter(b=>!mcpHat(MCP_ANSCHLUESSE[b]));
  if(!fehlt.length){ c.boni.push("MCP-Anschluss passt ("+bedarf.join(", ")+"): +"+Math.round((MCP_REGELN.anschlussLohnF-1)*100)+" % Lohn"); return; }
  const namen=fehlt.map(b=>(mcpKnoten(MCP_ANSCHLUESSE[b])||{}).n||b).join(", ");
  if((j.tier||0)>=3){ c.ok=false; c.gruende.push("Fehlt: MCP-Anschluss "+namen+" (ab Tier 3 Pflicht – Forschungshütte → MCP-Werkstatt)"); }
  else { c.erfolg-=MCP_REGELN.handMalus; c.gruende.push("⚠️ Ohne MCP-Anschluss ("+namen+") arbeitet der Agent von Hand (−"+MCP_REGELN.handMalus+" Qualität)"); }
}
function mcpLohnF(j){ const bedarf=mcpBedarf(j); if(!bedarf.length) return 1; return bedarf.every(b=>mcpHat(MCP_ANSCHLUESSE[b]))?MCP_REGELN.anschlussLohnF:1; }

/* ── Anzeige ── */
let mcpWahl=null;
function mcpWaehlen(id){ mcpWahl=id; if(typeof zeigeForschung==="function") zeigeForschung(); }
function mcpBaumCfg(){
  return {titel:"MCP-Werkstatt",bild:"techbaum_radial_v2",klick:"mcpWaehlen",wahl:mcpWahl,
    zentrum:{n:"Anschlussbrett (MCP-Host)",kurz:"MCP-HOST",z:"🔌",status:mcpFrei()?"fertig":"gesperrt"},
    zweige:MCP_ZWEIGE.map(z=>({id:z.id,n:z.n,z:z.z,farbe:z.farbe,knoten:z.knoten.map(k=>({id:k.id,n:k.n,kurz:k.kurz,z:k.z,braucht:k.braucht,status:mcpStatus(k)}))}))};
}
function mcpDetailHtml(id){
  const e=s=>tbEsc(s);
  if(!id||id==="__zentrum"){ const a=mcpAnschluesse(); return '<div class="karte hell"><h3>🔌 Anschlussbrett – der MCP-Host</h3><p>MCP (Model Context Protocol) ist der offene Standard, über den Agenten mit Diensten sprechen: Der Host (dein Agenten-Tool) hält je Server einen Client, der Server bietet Werkzeuge, Datenquellen und Vorlagen an. Nachrichten sind JSON-RPC 2.0. Vorgestellt im November 2024, seit 2025 von OpenAI, Google und Microsoft übernommen, Ende 2025 unter dem Dach der Linux Foundation.</p><p><b>Stand:</b> '+mcpAnzahlFertig()+'/'+mcpAlleKnoten().length+' Knoten · Anschlüsse: '+(a.length?a.join(", "):"keine")+' · Agenten-Tool mit MCP im Stall: '+(mcpGeschirrOk()?"ja":"nein")+'</p></div>'; }
  const k=mcpKnoten(id); if(!k) return "";
  const st=mcpStatus(k), kann=mcpKann(k);
  let sperr=""; if(st==="gesperrt") sperr="🔒 braucht: "+k.braucht.map(b=>(mcpKnoten(b)||{}).n||b).join(", "); else if(st==="teuer") sperr=mcpStand().aktiv?"⏳ Anschlussbrett belegt":"💶 Kasse reicht nicht ("+geld(k.kosten)+")";
  if(!mcpGeschirrOk()&&st!=="fertig") sperr="🦺 kein Agenten-Tool mit MCP im Stall";
  return '<div class="karte'+(st==="fertig"?" hell":"")+'"><h3>'+e(k.z)+' '+e(k.n)+' <span class="merk'+(st==="fertig"?" gut":st==="aktiv"?" gold":"")+'">'+(st==="fertig"?"✅ angeschlossen":st==="aktiv"?"⏳ noch "+mcpStand().aktiv.rest+" Tag(e)":geld(k.kosten)+" · "+k.tage+" Tag"+(k.tage>1?"e":""))+'</span></h3>'+
    '<p><b>Echte Technik:</b> '+e(k.fakt)+'</p><p><b>Wirkung auf dem Hof:</b> '+e(k.eff)+'</p>'+
    (st==="fertig"||st==="aktiv"?"":'<div class="reihe abstand">'+(sperr?'<span class="baumpfad">'+e(sperr)+'</span>':"")+'<button class="knopf s'+(kann?" gruen":"")+'" '+(kann?"":"disabled")+' onclick="mcpStart(\''+e(k.id)+'\');zeigeForschung()">Anschließen ('+geld(k.kosten)+')</button></div>')+'</div>';
}
function mcpHtml(){
  if(!mcpFrei()) return '<div class="leer">🔌 Die MCP-Werkstatt öffnet ab Hofstufe '+MCP_REGELN.freiAbStufe+', sobald die Agentenwerkstatt erforscht ist. Dort lernst du, wie Agenten über das Model Context Protocol mit Dateien, Post, Buchhaltung und dem Netz sprechen.</div>';
  const st=mcpStand();
  return '<div class="notiz">🔌 <b>MCP-Werkstatt.</b> Jeder Knoten kostet Geld und einen Tag Anschlussarbeit auf dem Anschlussbrett (unabhängig vom Forschungsplatz). Ein Agenten-Tool mit MCP muss im Stall sein. Anschlüsse geben Agenten-Zetteln +'+Math.round((MCP_REGELN.anschlussLohnF-1)*100)+' % Lohn – ohne sie arbeiten Agenten von Hand (−'+MCP_REGELN.handMalus+' Qualität, ab Tier 3 gesperrt). Wer Server anschließt, ohne die Sicherheit auszubauen, riskiert vergiftete Werkzeugbeschreibungen.'+(st.aktiv?' <b>Läuft:</b> '+tbEsc((mcpKnoten(st.aktiv.id)||{}).n)+' (noch '+st.aktiv.rest+' Tag(e)).':"")+'</div>'+
    tbRadialSvg(mcpBaumCfg())+mcpDetailHtml(mcpWahl);
}
function mcpHofbuchHtml(){
  const R=MCP_REGELN, e=s=>tbEsc(s);
  return '<p style="margin-top:8px"><b>🔌 MCP-Werkstatt (Ära 9).</b> Das Model Context Protocol ist der offene Standard für Werkzeuge, Datenquellen und Vorlagen zwischen Agenten-Apps (Host/Client) und Diensten (Server), Nachrichten als JSON-RPC 2.0 über stdio oder Streamable HTTP. Die Werkstatt öffnet ab Hofstufe '+R.freiAbStufe+' mit erforschter Agentenwerkstatt; anschließen darf nur, wer ein Agenten-Tool mit MCP im Stall hat (Basis-Tool, pi und aider kennen kein MCP). Jeder Knoten kostet seinen Preis und '+'einen bis zwei Tage Anschlussarbeit auf dem eigenen Anschlussbrett. '+
    '<b>Wirkungen:</b> Werkzeuge +'+R.agentBonus+' Agentenleistung · Datenquellen −'+R.overheadMinus+' Prozentpunkte Tool-Overhead · Vorlagen und Sampling je −'+Math.round(R.koordMinus*100)+' % Team-Abstimmung · Elicitation ×'+R.elicitationDsF+' und Prüfprotokoll ×'+R.auditDsF+' Datenschutz-Risiko auf Agenten-Zetteln (zusätzlich zum Kontrollpaket) · Verzeichnisgrenzen ×'+R.rootsSchadenF+' und Sandkasten ×'+R.sandboxSchadenF+' Schaden durch Prompt-Injection · Fernleitung ohne OAuth ×'+R.httpOhneOauthDsF+' Datenschutz-Risiko. '+
    '<b>Anschlüsse:</b> Agenten-Zettel brauchen je Sektor einen Anschluss (Datei, Post & Kalender, Buchhaltung, Web); passend +'+Math.round((R.anschlussLohnF-1)*100)+' % Lohn, fehlend −'+R.handMalus+' Qualität, ab Tier 3 gesperrt. '+
    '<b>Vergiftete Werkzeugbeschreibung:</b> Mit mindestens einem Anschluss besteht täglich eine Chance von '+Math.round(R.giftP*100)+' % auf den Vorfall ('+geld(R.giftStrafe)+', Ruf '+R.giftRuf+'). Freigabeliste ×'+R.giftAllowlistF+', geprüfte Quellen ×'+R.giftRegistryF+', Sandkasten halbiert den Schaden. Alle Wirkungen sind Spielannahmen; die Fakten je Knoten tragen ihren Stand (Spezifikation 2025).</p>';
}
const MCP_WISSEN=[
 {kat:"betrieb",t:"MCP – der USB-C-Anschluss für Werkzeuge",txt:"Das Model Context Protocol (Anthropic, November 2024) beschreibt, wie eine Agenten-App mit Diensten spricht: Server bieten Werkzeuge (tools), Datenquellen (resources) und Vorlagen (prompts) an, der Client im Host ruft sie über JSON-RPC 2.0 auf. Leitungen sind stdio für lokale Prozesse und Streamable HTTP für entfernte Server. 2025 übernahmen OpenAI, Google und Microsoft den Standard; Ende 2025 zog er unter das Dach der Linux Foundation.",stand:"12/2025",quelle:"modelcontextprotocol.io (Spezifikation 2025-03-26 und 2025-06-18)"},
 {kat:"sicherheit",t:"Vergiftete Werkzeuge und nachträgliche Änderungen",txt:"Eine Werkzeugbeschreibung ist Text, den das Modell liest. Ein bösartiger Server kann darin versteckte Anweisungen unterbringen (Tool Poisoning, beschrieben von Invariant Labs, April 2025) oder seine Werkzeuge nach der Freigabe unbemerkt ändern (Rug Pull). Gegenmittel: Freigabelisten mit festgeschriebenen Beschreibungen, geprüfte Quellen mit festen Versionen, Mindestrechte, Protokoll und menschliche Freigabe riskanter Aufrufe.",stand:"09/2026",quelle:"Invariant Labs (04/2025); MCP-Spezifikation, Abschnitt Security Best Practices"},
 {kat:"sicherheit",t:"OAuth 2.1 statt Token-Weitergabe",txt:"Entfernte MCP-Server verlangen seit der Spezifikation vom März 2025 eine Autorisierung nach OAuth 2.1. Der Server darf ein Token, das er vom Client erhält, nicht an andere Dienste weiterreichen (Token-Passthrough) – sonst handelt er mit fremden Rechten (Confused Deputy).",stand:"06/2025",quelle:"MCP-Spezifikation 2025-06-18, Authorization"}
];
try{ if(typeof WISSEN_ALLGEMEIN!=="undefined"&&Array.isArray(WISSEN_ALLGEMEIN)&&!WISSEN_ALLGEMEIN.some(w=>w.t===MCP_WISSEN[0].t)) WISSEN_ALLGEMEIN.push(...MCP_WISSEN); }catch(e){}

if(typeof window!=="undefined"){ Object.assign(window,{MCP_REGELN,MCP_ZWEIGE,MCP_ANSCHLUESSE,MCP_BEDARF_SEKTOR,MCP_WISSEN,mcpAlleKnoten,mcpKnoten,mcpStand,mcpHat,mcpFrei,mcpGeschirrOk,mcpAnzahlFertig,mcpAnschluesse,mcpStatus,mcpKann,mcpStart,mcpTag,mcpEreignisTag,mcpEffekte,mcpBedarf,mcpJobCheck,mcpLohnF,mcpWaehlen,mcpBaumCfg,mcpDetailHtml,mcpHtml,mcpHofbuchHtml}); }
