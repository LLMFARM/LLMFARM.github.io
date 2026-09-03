/* ═════════════════════════════════════════════════════════
   Ära 9 · Berufe-Katalog der Zettelschmiede – Spec: dev/NEEDLE_DESIGN.md, Teil G
   ─────────────────────────────────────────────────────────
   Aufträge kommen aus echten Berufen und Sektoren: welche Aufgaben durch Digitalisierung und
   den Einsatz von Agenten entstehen. Jede Aufgabe trägt Art, Tier, Teamgröße und den
   Sektor; die Zahlen (Arbeit, Lohn, Frist, Anforderungen) kommen aus BERUF_BASIS je Tier –
   dieselben Bänder wie die geprüften Vorlagen. Kein Modell erfindet hier etwas: die
   Auswahl ist ein Saat-Zufall je Partie, die Nadel darf nur vorsortieren (Klassifikation).
   ═══════════════════════════════════════════════════════ */
const BERUF_BASIS={0:{tage:1,mtok:1.4,lohn:92,ctx:4},1:{tage:2,mtok:7,lohn:350,ctx:8},2:{tage:3,mtok:16,lohn:790,ctx:16},3:{tage:3,mtok:26,lohn:1300,ctx:32},4:{tage:4,mtok:40,lohn:2100,ctx:64},5:{tage:5,mtok:60,lohn:3200,ctx:64}};
const BERUF_REGELN={agentMtokF:0.5,agentLohnF:0.85,teamMtokJe:0.6,teamLohnJe:0.5,teamTageJe:0.35,risikoLohnF:{0:1,1:1.15,2:1.35},anfBasis:26,anfJeTier:12,maxOffen:10,koordJeAgent:0.10,koordGleich:0.05};
const BERUF_ARTKEYS={text:["schreiben","treue"],support:["treue","wissen"],code:["code","logik"],agent:["werkzeug","treue"],wissen:["wissen","treue"],recht:["wissen","logik","treue"],medizin:["wissen","treue"]};
const BERUF_ROLLE={text:"Texte schreiben",support:"Anfragen beantworten",code:"Code schreiben",agent:"Agent",wissen:"Nachschlagen & belegen",recht:"Prüfen & markieren",medizin:"Strukturieren & prüfen"};
const BERUF_SEKTOREN={handwerk:"Handwerk",gastro:"Gastronomie",handel:"Handel",pr:"PR & Medien",it:"IT & Software",industrie:"Industrie & Logistik",landwirtschaft:"Landwirtschaft",energie:"Energie",kultur:"Kultur",tourismus:"Tourismus",medizin:"Medizin",recht:"Recht",steuer:"Steuern & Finanzen",personal:"Personal",finanzen:"Versicherung & Bank",bildung:"Bildung",verwaltung:"Verwaltung",soziales:"Soziales",pflege:"Pflege",sicherheit:"Sicherheit"};

/* Aufgaben: t Titel · art · tier 0–5 · team 1–4 (>1 = Agenten-Team, Agenten-Tool nötig) · k Kern · lehre */
const BERUFE=[
 {id:"zimmerei",n:"Zimmerei",z:"🪵",sektor:"handwerk",risiko:0,aufgaben:[
  {t:"Angebotstexte aus Aufmaß-Notizen",art:"text",tier:0,team:1,k:"Handschriftliche Aufmaß-Notizen werden zu sauberen Angebotspositionen mit Material und Stunden.",lehre:"Im Handwerk frisst die Angebotsschreibung Abende – strukturierte Vorlagen plus Modell sparen sie."},
  {t:"Dachstuhl-Statik nachrechnen lassen",art:"code",tier:2,team:1,k:"Ein Skript prüft Lastannahmen gegen Tabellenwerte und markiert Abweichungen für den Statiker.",lehre:"Modelle rechnen nicht selbst zuverlässig – sie schreiben das Werkzeug, das rechnet, und der Mensch prüft."},
  {t:"Bauakte automatisch ablegen",art:"agent",tier:1,team:2,k:"Fotos, Lieferscheine und Mails je Baustelle in die richtige Akte legen und benennen.",lehre:"Agenten mit Dateiwerkzeugen übernehmen die Ablage – die Regeln müssen vorher klar sein."},
  {t:"Baustellen-Tagebuch aus Sprachnotizen",art:"text",tier:1,team:1,k:"Diktierte Notizen vom Gerüst werden zu einem rechtssicheren Bautagebuch mit Datum, Wetter, Gewerken.",lehre:"Das Bautagebuch ist Beweismittel – Formulierungen müssen nüchtern und vollständig sein."}]},
 {id:"tischlerei",n:"Tischlerei",z:"🪑",sektor:"handwerk",risiko:0,aufgaben:[
  {t:"Möbelkonfigurator-Texte",art:"text",tier:0,team:1,k:"Für jede Holzart und Oberfläche kurze, ehrliche Beschreibungen für den Online-Konfigurator.",lehre:"Produkttexte müssen Material und Pflege korrekt nennen – Werbeprosa fällt bei Rückfragen auf."},
  {t:"Zuschnittliste aus CAD-Export",art:"code",tier:1,team:1,k:"Aus dem Export der Zeichnung wird eine Zuschnittliste mit Verschnitt-Optimierung.",lehre:"Verschnittoptimierung ist ein klassisches Algorithmus-Problem – das Modell schreibt den Code, die Säge entscheidet."},
  {t:"Reklamations-Mails vorsortieren",art:"support",tier:0,team:1,k:"Eingehende Mails nach Reklamation, Anfrage, Terminwunsch einsortieren – unklare Fälle zur Rückfrage.",lehre:"Klassifikation ist die einfachste, robusteste KI-Aufgabe im Betrieb."}]},
 {id:"elektro",n:"Elektrobetrieb",z:"🔌",sektor:"handwerk",risiko:0,aufgaben:[
  {t:"Prüfprotokolle nach Norm ausfüllen",art:"text",tier:1,team:1,k:"Messwerte in das Protokollformular übertragen, Grenzwerte prüfen, Auffälligkeiten markieren.",lehre:"Normen ändern sich – Quellen gehören ins Retrieval, nicht ins Gewicht des Modells."},
  {t:"Smart-Home-Störungen per Chat lösen",art:"support",tier:1,team:1,k:"Kunden melden Störungen im Chat; der Assistent führt durch Standardprüfungen und legt ein Ticket an.",lehre:"Ein guter Support-Bot weiß, wann er an einen Menschen übergibt."},
  {t:"Wallbox-Förderanträge zusammenstellen",art:"agent",tier:2,team:2,k:"Für jede Kundin die Antragsunterlagen aus Formularen, Rechnungen und Nachweisen zusammenstellen und im Portal einreichen.",lehre:"Förderportale sind Agenten-Territorium: viele Klicks, klare Regeln, keine Kreativität."}]},
 {id:"heizung",n:"Heizungsbauer",z:"🔥",sektor:"handwerk",risiko:0,aufgaben:[
  {t:"Wärmepumpen-Beratungsmails beantworten",art:"support",tier:1,team:1,k:"Anfragen zu Wärmepumpe, Förderung und Umbau beantworten – nur mit belegten Angaben aus dem Firmenwissen.",lehre:"Halluzinierte Förderquoten kosten Vertrauen – Antworten brauchen Quellen."},
  {t:"Wartungsplanung automatisieren",art:"agent",tier:2,team:3,k:"Wartungsverträge, Routen und Ersatzteile für vier Monteure planen und Termine per Mail bestätigen.",lehre:"Mehrere Agenten teilen sich Kundengruppen – ein Koordinationsanteil bleibt immer übrig."},
  {t:"Fehlercodes-Wissensbasis",art:"wissen",tier:2,team:1,k:"Aus 900 Servicehandbüchern eine durchsuchbare Fehlercode-Hilfe mit Belegstellen bauen.",lehre:"RAG statt Auswendiglernen: Handbücher ändern sich, Belege müssen nachschlagbar bleiben."}]},
 {id:"kfz",n:"KFZ-Werkstatt",z:"🚗",sektor:"handwerk",risiko:0,aufgaben:[
  {t:"Werkstatt-Termine per Chat vergeben",art:"agent",tier:1,team:1,k:"Kunden schreiben Symptome; der Agent schlägt Termine vor und trägt sie in den Kalender ein.",lehre:"Terminvergabe ist ein Werkzeugaufruf mit Rückfrage – ideal für kleine Agenten."},
  {t:"Fehlerspeicher-Auswertung erklären",art:"wissen",tier:2,team:1,k:"OBD-Fehlercodes in verständliche Diagnosevorschläge übersetzen, mit Herstellerbelegen.",lehre:"Erklären ist wertvoll, Entscheiden bleibt beim Meister."},
  {t:"Gebrauchtwagen-Inserate schreiben",art:"text",tier:0,team:1,k:"Aus Fahrzeugdaten ehrliche Inserate ohne Superlative – Mängel gehören rein.",lehre:"Werbliche Auslassungen sind bei Gebrauchtwagen rechtlich heikel – Treue schlägt Stil."}]},
 {id:"maler",n:"Malerbetrieb",z:"🎨",sektor:"handwerk",risiko:0,aufgaben:[
  {t:"Farbberatung per Foto-Anfrage",art:"support",tier:1,team:1,k:"Kundenfotos und Wünsche in Beratungsantworten mit Farbkarten-Empfehlungen übersetzen.",lehre:"Bildverstehen plus Katalogwissen – der Assistent verkauft nicht, er berät."},
  {t:"Aufmaß-Excel aus Grundriss-PDFs",art:"code",tier:1,team:1,k:"Flächen aus Grundriss-Exporten auslesen und als Kalkulationstabelle ausgeben.",lehre:"PDF-Extraktion ist unsauber – Prüfschritte und Toleranzen gehören ins Skript."},
  {t:"Wochenplanung der Kolonnen",art:"agent",tier:2,team:2,k:"Aufträge, Trockenzeiten und Urlaube zu Wochenplänen für zwei Kolonnen zusammenführen.",lehre:"Planung ist Constraint-Lösung – Agenten schlagen vor, der Chef entscheidet."}]},
 {id:"dachdecker",n:"Dachdeckerei",z:"🏠",sektor:"handwerk",risiko:0,aufgaben:[
  {t:"Sturmschaden-Meldungen erfassen",art:"support",tier:0,team:1,k:"Nach dem Sturm hunderte Anrufe und Mails in Schadensmeldungen mit Adresse, Dringlichkeit und Foto erfassen.",lehre:"Nach Unwettern zählt Durchsatz – Vorsortierung entscheidet über die Reihenfolge."},
  {t:"Gutachten-Vorlagen für Versicherer",art:"text",tier:2,team:1,k:"Aus Fotos und Notizen strukturierte Schadensgutachten im Versichererformat.",lehre:"Versicherer verlangen feste Formate – Formattreue ist hier Geld wert."},
  {t:"Solardach-Anfragen an Solarteure leiten",art:"agent",tier:1,team:2,k:"Anfragen prüfen, Dachdaten sammeln und passende Partnerbetriebe per Werkzeug informieren.",lehre:"Weiterleitung mit Datenübergabe ist Agentenarbeit – mit klarer Werkzeug-Freigabeliste."}]},
 {id:"doener",n:"Döner-Imbiss",z:"🥙",sektor:"gastro",risiko:0,aufgaben:[
  {t:"Eine Webseite mit Speisekarte",art:"code",tier:1,team:1,k:"Der Imbiss um die Ecke braucht endlich eine Webseite: Karte, Öffnungszeiten, Bestellknopf, mobil zuerst.",lehre:"Kleinstbetriebe digitalisieren mit einer einzigen guten Seite – kein Framework-Zoo."},
  {t:"Bewertungen freundlich beantworten",art:"text",tier:0,team:1,k:"Google-Bewertungen in drei Sprachen freundlich und ehrlich beantworten, Beschwerden ernst nehmen.",lehre:"Antworten auf Bewertungen lesen künftige Kunden – Ton und Wahrheit entscheiden."},
  {t:"Bestellungen aus WhatsApp ins Kassensystem",art:"agent",tier:1,team:1,k:"Bestellnachrichten lesen, Positionen erkennen und als Bon anlegen – Unklares zurückfragen.",lehre:"Extraktion plus Werkzeugaufruf: genau die Aufgabe kleiner Modelle."}]},
 {id:"cafe",n:"Dorfcafé",z:"☕",sektor:"gastro",risiko:0,aufgaben:[
  {t:"Wochenkarte als Social-Media-Posts",art:"text",tier:0,team:1,k:"Aus dem Backplan kurze Posts für Instagram und die Dorf-App – frisch, ohne Floskeln.",lehre:"Kleine Texte in Masse sind der klassische Einstieg in KI-gestütztes Marketing."},
  {t:"Reservierungs-Chat mit Kalender",art:"agent",tier:1,team:1,k:"Reservierungen im Chat annehmen, Kapazität prüfen, Bestätigung schicken.",lehre:"Ein Agent ohne Kalenderwerkzeug ist nur ein Chat – das Werkzeug macht den Unterschied."},
  {t:"Allergen-Tabelle pflegen",art:"wissen",tier:1,team:1,k:"Rezepte gegen die Allergen-Liste prüfen und die Aushangtabelle korrekt füllen.",lehre:"Allergene sind Pflichtangaben – falsche Antworten sind gefährlich, Belege Pflicht."}]},
 {id:"gasthof",n:"Landgasthof",z:"🍽️",sektor:"gastro",risiko:0,aufgaben:[
  {t:"Speisekarte in vier Sprachen",art:"text",tier:1,team:1,k:"Karte übersetzen, Gerichte kurz erklären, regionale Begriffe erhalten.",lehre:"Übersetzung braucht Kontext: „Maultaschen“ sind keine „mouth bags“."},
  {t:"Gruppenanfragen kalkulieren",art:"support",tier:1,team:1,k:"Anfragen für Feiern beantworten: Menüs, Preise, Räume – aus der Preisliste, nie geraten.",lehre:"Angebote sind bindend – der Assistent darf keine Preise erfinden."},
  {t:"Dienstplan-Assistent für die Küche",art:"agent",tier:2,team:2,k:"Wünsche, Verträge und Reservierungslage zu einem Dienstplan verbinden, Änderungen per Mail verschicken.",lehre:"Dienstpläne berühren Arbeitsrecht – Regeln gehören ins Werkzeug, nicht in die Laune des Modells."}]},
 {id:"brauerei",n:"Brauerei",z:"🍺",sektor:"gastro",risiko:0,aufgaben:[
  {t:"Etikettentexte nach Lebensmittelrecht",art:"text",tier:1,team:1,k:"Etiketten mit Pflichtangaben, Zutaten und Werbetext – Pflichtangaben dürfen nicht fehlen.",lehre:"Pflichtangaben sind Recht, Werbetext ist Stil – beides muss stimmen."},
  {t:"Sudprotokolle auswerten",art:"code",tier:2,team:1,k:"Sensordaten der Sude analysieren, Ausreißer erklären, Bericht für den Braumeister.",lehre:"Datenanalyse per Modell heißt: Code schreiben, ausführen, Ergebnis erklären."},
  {t:"Händleranfragen und Lieferpläne",art:"agent",tier:2,team:2,k:"Bestellmails von Händlern erfassen, Verfügbarkeit prüfen, Lieferpläne im System anlegen.",lehre:"Auftragserfassung ist der häufigste Agenten-Einsatz im Mittelstand."}]},
 {id:"hofladen",n:"Hofladen",z:"🧺",sektor:"handel",risiko:0,aufgaben:[
  {t:"Produkttexte für den Online-Shop",art:"text",tier:0,team:1,k:"Kurze Beschreibungen für Marmelade, Honig und Gemüsekiste – freundlich, korrekt, saisonal.",lehre:"Auch kleine Texte brauchen Wahrheit: Herkunft und Inhaltsstoffe."},
  {t:"Bestandsabgleich Kasse–Shop",art:"code",tier:1,team:1,k:"Ein Skript gleicht Kassendaten und Shop-Bestand ab und meldet Abweichungen.",lehre:"Doppelte Bestände sind die häufigste Fehlerquelle kleiner Händler."},
  {t:"Kundenfragen zu Lieferung und Abo",art:"support",tier:0,team:1,k:"Standardfragen zu Lieferzonen, Abo-Pausen und Rechnungen beantworten, Rest ans Team.",lehre:"Der Support-Bot lernt aus der FAQ, nicht aus dem Bauch."}]},
 {id:"buchhandlung",n:"Buchhandlung",z:"📖",sektor:"handel",risiko:0,aufgaben:[
  {t:"Empfehlungstexte für den Newsletter",art:"text",tier:1,team:1,k:"Aus Buchdaten und Notizen der Buchhändlerin Empfehlungen im Ton des Ladens schreiben.",lehre:"Stilübernahme ist eine echte Stärke von Sprachmodellen – wenn Beispiele vorliegen."},
  {t:"Schulbuchlisten abgleichen",art:"agent",tier:1,team:2,k:"Listen der Schulen einlesen, Verfügbarkeit prüfen, Sammelbestellungen anlegen.",lehre:"Massenabgleich mit Werkzeugen ist Agentenarbeit im Akkord."},
  {t:"Antiquariats-Katalog erfassen",art:"support",tier:0,team:1,k:"Aus Fotos der Buchrücken Titel, Autor und Zustand erfassen – Unsicheres markieren.",lehre:"Erfassung aus Bildern braucht eine Prüfspalte für Unsicheres."}]},
 {id:"fahrrad",n:"Fahrradladen",z:"🚲",sektor:"handel",risiko:0,aufgaben:[
  {t:"Ersatzteil-Anfragen beantworten",art:"support",tier:1,team:1,k:"Kunden fragen nach Kompatibilität – Antworten nur aus Herstellerdaten mit Beleg.",lehre:"Kompatibilitätsfragen sind Retrieval-Fragen, keine Kreativaufgaben."},
  {t:"Werkstatt-Ticketsystem bauen",art:"code",tier:2,team:2,k:"Ein kleines Ticketsystem für Reparaturen mit Statusmail an Kunden.",lehre:"Zwei Agenten bauen parallel Backend und Oberfläche – die Schnittstelle vorher festlegen."},
  {t:"Leihrad-Buchungen verwalten",art:"agent",tier:1,team:1,k:"Buchungsanfragen prüfen, Verfügbarkeit setzen, Bestätigung schicken.",lehre:"Buchen ist ein Werkzeugaufruf mit Zustand – Doppelbuchungen sind die typische Falle."}]},
 {id:"optiker",n:"Optiker",z:"👓",sektor:"handel",risiko:1,aufgaben:[
  {t:"Erinnerungen an Sehtests",art:"support",tier:0,team:1,k:"Aus der Kundendatei freundliche Erinnerungen an den nächsten Sehtest – nur mit Einwilligung.",lehre:"Kundendaten mit Gesundheitsbezug: Einwilligung und Sparsamkeit sind Pflicht."},
  {t:"Brillenpass-Erklärungen",art:"wissen",tier:1,team:1,k:"Werte aus dem Brillenpass in verständliche Erklärungen übersetzen.",lehre:"Erklären ja, Diagnose nein – die Grenze muss der Assistent kennen."},
  {t:"Lieferanten-Bestellungen automatisieren",art:"agent",tier:2,team:2,k:"Gläserbestellungen aus Aufträgen erzeugen und an Lieferanten übermitteln.",lehre:"Bestellagenten brauchen Prüfschritte gegen teure Tippfehler."}]},
 {id:"baumarkt",n:"Baumarkt",z:"🔧",sektor:"handel",risiko:0,aufgaben:[
  {t:"Anleitungen für Heimwerker",art:"text",tier:1,team:1,k:"Schritt-für-Schritt-Anleitungen zu Produkten schreiben, Sicherheitshinweise nicht vergessen.",lehre:"Sicherheitshinweise sind Haftungsfragen – Treue vor Kreativität."},
  {t:"Regal-Bestände per Foto zählen",art:"agent",tier:2,team:3,k:"Regalfotos auswerten, Lücken erkennen und Nachbestellungen im System anlegen – Filiale für Filiale.",lehre:"Mehrere Agenten teilen sich Filialen; Bildverstehen liefert die Zahlen, das Werkzeug bestellt."},
  {t:"Produktdaten aus Lieferanten-PDFs",art:"code",tier:1,team:1,k:"Ein Extraktionsskript zieht Maße, Gewichte und Normen aus Datenblättern.",lehre:"Extraktion in Struktur: die Paradedisziplin kleiner Modelle."}]},
 {id:"weingut",n:"Weingut",z:"🍇",sektor:"landwirtschaft",risiko:0,aufgaben:[
  {t:"Weinbeschreibungen für Karten",art:"text",tier:1,team:1,k:"Verkostungsnotizen zu Karten- und Shop-Texten formen – ohne Erfundenes.",lehre:"Sensorik-Texte sind Handwerk – das Modell formt, der Winzer verkostet."},
  {t:"Exportdokumente zusammenstellen",art:"agent",tier:2,team:2,k:"Für jede Auslandslieferung Zolldokumente aus Auftrag und Stammdaten erzeugen.",lehre:"Zollpapiere sind formstreng – Vorlagen plus Werkzeug schlagen freies Formulieren."},
  {t:"Wetterdaten und Lese-Planung",art:"code",tier:2,team:1,k:"Wetterprognosen und Reifegrade zu einem Leseplan-Skript verbinden.",lehre:"Datenpipelines im Weinberg: Sensoren, Prognosen, Entscheidungen."}]},
 {id:"milchhof",n:"Milchhof",z:"🐄",sektor:"landwirtschaft",risiko:0,aufgaben:[
  {t:"Tierwohl-Dokumentation ausfüllen",art:"text",tier:1,team:1,k:"Stallbuch-Einträge in die Formulare der Prüfstelle übertragen.",lehre:"Dokumentationspflichten fressen Zeit – Formularausfüllen ist ein Klassiker."},
  {t:"Melkroboter-Daten auswerten",art:"code",tier:2,team:1,k:"Daten des Melkroboters analysieren und Auffälligkeiten je Tier melden.",lehre:"Auswertung heißt Code plus Erklärung – niemals Diagnose ohne Tierarzt."},
  {t:"Direktvermarktung: Bestell-Bot",art:"agent",tier:1,team:1,k:"Bestellungen für Milchprodukte annehmen und Lieferrouten eintragen.",lehre:"Kleine Agenten für kleine Höfe: ein Werkzeug, klare Regeln."}]},
 {id:"imkerei",n:"Imkerei",z:"🐝",sektor:"landwirtschaft",risiko:0,aufgaben:[
  {t:"Honig-Etiketten und Shop-Texte",art:"text",tier:0,team:1,k:"Etiketten mit Pflichtangaben und kurze Sortenbeschreibungen.",lehre:"Pflichtangaben sind keine Stilfrage."},
  {t:"Völkerbuch digitalisieren",art:"support",tier:0,team:1,k:"Handschriftliche Einträge in eine Tabelle übertragen, Unleserliches markieren.",lehre:"Digitalisierung beginnt mit Erfassen – und mit dem Mut, „unleserlich“ zu schreiben."},
  {t:"Schwarm-Meldungen koordinieren",art:"agent",tier:1,team:1,k:"Meldungen aus dem Dorf annehmen, Standort erfassen, Imker per Nachricht alarmieren.",lehre:"Alarmierung ist ein Werkzeugaufruf mit Ort und Zeit – kurz, exakt, nachvollziehbar."}]},
 {id:"gaertnerei",n:"Gärtnerei",z:"🌱",sektor:"landwirtschaft",risiko:0,aufgaben:[
  {t:"Pflegeanleitungen je Pflanze",art:"text",tier:0,team:1,k:"Kurze Pflegekarten für Beet- und Topfpflanzen aus Fachdaten.",lehre:"Fachwissen aus Quellen – nicht aus dem Bauch des Modells."},
  {t:"Saison-Bestellungen an Großmärkte",art:"agent",tier:2,team:2,k:"Bedarf aus Verkaufsdaten planen und Bestellungen bei Großmärkten anlegen.",lehre:"Prognose plus Bestellwerkzeug – zwei Agenten, ein Plan."},
  {t:"Gewächshaus-Sensorik auswerten",art:"code",tier:1,team:1,k:"Temperatur- und Feuchtedaten auswerten, Lüftungsempfehlungen erzeugen.",lehre:"Auswertungsskripte sind wiederverwendbar – einmal gut gebaut, jeden Tag nützlich."}]},
 {id:"praxis",n:"Arztpraxis",z:"🩺",sektor:"medizin",risiko:2,aufgaben:[
  {t:"Arztbriefe strukturieren",art:"medizin",tier:2,team:1,k:"Diktierte Briefe in Abschnitte gliedern, Fachbegriffe prüfen, nichts hinzufügen – streng lokal.",lehre:"Patientendaten dürfen den Hof nicht verlassen; ungeschulte Modelle sind ein Risiko."},
  {t:"Terminanfragen mit Dringlichkeit",art:"support",tier:1,team:1,k:"Anfragen nach Dringlichkeit sortieren und Terminvorschläge machen – keine medizinische Bewertung.",lehre:"Triage bleibt beim Fachpersonal; der Assistent sortiert nur."},
  {t:"Aufklärungsbögen verständlich erklären",art:"medizin",tier:3,team:1,k:"Aufklärungsbögen in einfache Sprache übersetzen, ohne Inhalte zu verändern.",lehre:"Einfache Sprache ohne Bedeutungsverlust – hohe Treue-Anforderung."},
  {t:"Befunde für die Fallbesprechung zusammenführen",art:"medizin",tier:3,team:2,k:"Befunde aus mehreren Quellen für die Besprechung strukturieren – mit Belegstellen, ohne Schlussfolgerung.",lehre:"Zusammenführen ja, Diagnose nein – und alles im Haus."}]},
 {id:"zahnarzt",n:"Zahnarztpraxis",z:"🦷",sektor:"medizin",risiko:2,aufgaben:[
  {t:"Kostenpläne erklären",art:"medizin",tier:2,team:1,k:"Heil- und Kostenpläne für Patientinnen verständlich erläutern – Zahlen unverändert.",lehre:"Erklärungen dürfen Zahlen nie verändern."},
  {t:"Recall-Erinnerungen datenschutzkonform",art:"support",tier:1,team:1,k:"Erinnerungen an Kontrolltermine nur mit Einwilligung, minimale Daten, kein Befund im Text.",lehre:"Datensparsamkeit: die Erinnerung braucht keinen Befund."},
  {t:"Abrechnungsziffern prüfen",art:"recht",tier:3,team:1,k:"Abrechnungen gegen das Gebührenverzeichnis prüfen und Auffälligkeiten markieren.",lehre:"Prüfen und markieren, nicht entscheiden – und lokal."}]},
 {id:"physio",n:"Physiotherapie",z:"🧘",sektor:"medizin",risiko:2,aufgaben:[
  {t:"Übungspläne aus Therapienotizen",art:"medizin",tier:1,team:1,k:"Aus Therapienotizen Übungspläne mit Bildern und Wiederholungen – nur Freigegebenes.",lehre:"Therapieinhalte kommen von der Therapeutin, das Modell formatiert."},
  {t:"Rezept-Verwaltung und Fristen",art:"agent",tier:2,team:1,k:"Rezepte erfassen, Fristen überwachen, Erinnerungen an Ärzte schicken – geschützte Daten.",lehre:"Fristen sind Geld – Agenten mit Kalenderwerkzeug helfen, wenn die Daten sicher sind."},
  {t:"Terminausfälle nachbesetzen",art:"support",tier:0,team:1,k:"Absagen entgegennehmen und Warteliste benachrichtigen.",lehre:"Kleine Automatisierung, großer Effekt auf die Auslastung."}]},
 {id:"apotheke",n:"Apotheke",z:"⚕️",sektor:"medizin",risiko:2,aufgaben:[
  {t:"Wechselwirkungs-Hinweise mit Beleg",art:"medizin",tier:3,team:1,k:"Für Kundenfragen Wechselwirkungen aus der Fachdatenbank belegen – ohne eigene Empfehlung.",lehre:"Belegpflicht: jede Aussage mit Quelle, sonst keine Aussage."},
  {t:"Rezeptur-Dokumentation",art:"text",tier:2,team:1,k:"Herstellungsprotokolle vollständig und normgerecht ausfüllen.",lehre:"Dokumentation ist Teil der Arzneimittelsicherheit."},
  {t:"Botendienst-Routen planen",art:"agent",tier:1,team:2,k:"Lieferungen planen und Kundinnen per Nachricht informieren – Adressen sind geschützte Daten.",lehre:"Auch Adressen mit Apothekenbezug sind sensibel."}]},
 {id:"pflegedienst",n:"Pflegedienst",z:"🤝",sektor:"pflege",risiko:2,aufgaben:[
  {t:"Pflegedokumentation strukturieren",art:"medizin",tier:2,team:1,k:"Freitext-Dokumentation in die Pflichtstruktur bringen – nichts weglassen, nichts dazu.",lehre:"Pflegedokumentation ist Beweismittel und Abrechnungsgrundlage."},
  {t:"Tourenplanung mit Qualifikationen",art:"agent",tier:3,team:3,k:"Touren für zwölf Pflegekräfte nach Qualifikation, Zeitfenstern und Wegen planen und im System eintragen.",lehre:"Drei Agenten planen parallel Regionen – der Abgleich am Ende ist der Koordinationsanteil."},
  {t:"Angehörigen-Fragen beantworten",art:"support",tier:1,team:1,k:"Standardfragen zu Leistungen und Abläufen – ohne Daten der Pflegebedürftigen preiszugeben.",lehre:"Auskunft nur an Berechtigte – der Assistent muss das prüfen können."}]},
 {id:"kanzlei",n:"Anwaltskanzlei",z:"⚖️",sektor:"recht",risiko:2,aufgaben:[
  {t:"Fristen aus Schriftsätzen ziehen",art:"recht",tier:2,team:1,k:"Aus eingehenden Schriftsätzen Fristen und Beteiligte extrahieren und in den Fristenkalender eintragen.",lehre:"Fristversäumnis ist Haftung – Extraktion braucht Prüfung durch den Anwalt."},
  {t:"Vertragsklauseln markieren",art:"recht",tier:3,team:1,k:"Verträge nach ungewöhnlichen Klauseln durchsuchen und mit Belegstelle markieren – keine Rechtsentscheidung.",lehre:"Markieren statt bewerten: das Modell zeigt, der Jurist urteilt."},
  {t:"Aktenanlage aus Mandanten-Mails",art:"agent",tier:2,team:2,k:"Neue Mandate aus Mails anlegen, Dokumente zuordnen, Konfliktprüfung anstoßen.",lehre:"Mandantendaten: nur lokal, nur geschult, nur mit Audit-Log."},
  {t:"Urteile für die Mandantschaft erklären",art:"recht",tier:4,team:1,k:"Urteile in verständliche Zusammenfassungen übersetzen – mit Randnummern als Beleg.",lehre:"Verständlich und belegt – sonst ist es Rechtsrat ohne Grundlage."}]},
 {id:"notariat",n:"Notariat",z:"📜",sektor:"recht",risiko:2,aufgaben:[
  {t:"Urkundenentwürfe aus Formularen",art:"recht",tier:3,team:1,k:"Aus Formulardaten Urkundenentwürfe nach Muster erzeugen – jede Abweichung markieren.",lehre:"Muster plus Daten – Abweichungen sind die eigentliche Arbeit."},
  {t:"Grundbuch-Auszüge zusammenfassen",art:"wissen",tier:2,team:1,k:"Auszüge in Klartext übersetzen, Lasten und Rechte auflisten.",lehre:"Fachsprache übersetzen, Inhalte nicht verändern."},
  {t:"Termin- und Unterlagenanfragen",art:"support",tier:1,team:1,k:"Mandanten nach fehlenden Unterlagen fragen, Termine vorschlagen – Daten geschützt.",lehre:"Auch Terminmails enthalten personenbezogene Daten."}]},
 {id:"steuerbuero",n:"Steuerbüro",z:"🧾",sektor:"steuer",risiko:2,aufgaben:[
  {t:"Belege vorkontieren",art:"recht",tier:1,team:1,k:"Belege lesen, Konten vorschlagen, Unsicheres markieren – die Steuerfachkraft prüft.",lehre:"Vorkontierung ist Klassifikation mit Geldfolgen – Prüfung Pflicht."},
  {t:"Mandanten-Erinnerungen an Unterlagen",art:"agent",tier:1,team:2,k:"Fehlende Unterlagen je Mandant ermitteln und Erinnerungen versenden – geschützte Daten.",lehre:"Massenkommunikation mit Steuerdaten: Schulung und Freigabeliste."},
  {t:"Jahresabschluss-Anhang formulieren",art:"text",tier:3,team:1,k:"Aus Zahlen und Notizen den Anhang-Text nach Vorlage formulieren.",lehre:"Zahlen unverändert, Sprache korrekt – ein Text mit Prüfpflicht."},
  {t:"Steuerrechts-Auskünfte mit Beleg",art:"recht",tier:4,team:1,k:"Fragen der Mandanten mit Belegen aus Gesetz und Verwaltungsanweisung beantworten – als Entwurf.",lehre:"Rechtsauskunft nur als belegter Entwurf – die Verantwortung bleibt beim Berater."}]},
 {id:"zeitarbeit",n:"Personaldienstleister",z:"👥",sektor:"personal",risiko:2,aufgaben:[
  {t:"Bewerbungen vorsortieren",art:"support",tier:1,team:1,k:"Bewerbungen nach Anforderungen sortieren – ohne Merkmale, die diskriminieren könnten.",lehre:"Auswahlautomaten sind rechtlich heikel: Kriterien offenlegen, Menschen entscheiden."},
  {t:"Arbeitsverträge aus Vorlagen",art:"recht",tier:2,team:1,k:"Verträge aus geprüften Vorlagen mit Personaldaten füllen, Abweichungen markieren.",lehre:"Vorlagen sind sicher, freie Formulierung ist Risiko."},
  {t:"Onboarding-Agent für neue Kräfte",art:"agent",tier:2,team:3,k:"Unterlagen einsammeln, Zugänge anlegen, Schulungen buchen – für zwanzig Neustarter pro Woche.",lehre:"Drei Agenten teilen sich die Schritte – Personaldaten bleiben lokal."}]},
 {id:"versicherung",n:"Versicherungsmakler",z:"🛡️",sektor:"finanzen",risiko:1,aufgaben:[
  {t:"Schadensmeldungen erfassen",art:"support",tier:1,team:1,k:"Meldungen strukturieren, Unterlagen anfordern, Status mitteilen.",lehre:"Schadensdaten sind sensibel – Prozess und Schutz gehören zusammen."},
  {t:"Tarifvergleich aus Bedingungswerken",art:"wissen",tier:3,team:1,k:"Bedingungen mehrerer Tarife vergleichen und Unterschiede belegen.",lehre:"Vergleich braucht Retrieval über lange Dokumente – Kontextfenster zählt."},
  {t:"Vertragsverlängerungen automatisieren",art:"agent",tier:2,team:2,k:"Auslaufende Verträge erkennen, Angebote erzeugen, Kunden anschreiben.",lehre:"Wiederkehrende Abläufe mit Werkzeugen – aber mit Prüfung vor dem Versand."}]},
 {id:"bank",n:"Genossenschaftsbank",z:"🏦",sektor:"finanzen",risiko:1,aufgaben:[
  {t:"Formulare in einfacher Sprache",art:"text",tier:1,team:1,k:"Bankformulare in einfache Sprache übersetzen – rechtlich unverändert.",lehre:"Einfache Sprache ist Zugänglichkeit, kein Rechtsverzicht."},
  {t:"Kundenanfragen im Online-Banking",art:"support",tier:2,team:1,k:"Fragen zu Überweisungen und Karten beantworten – ohne Kontodaten zu zeigen.",lehre:"Der Assistent darf nichts sehen, was er nicht braucht."},
  {t:"Kreditunterlagen vollständig prüfen",art:"agent",tier:3,team:2,k:"Unterlagen je Antrag auf Vollständigkeit prüfen und Nachforderungen erzeugen.",lehre:"Vollständigkeitsprüfung ist Regelarbeit – Bonitätsentscheidungen nicht."}]},
 {id:"schule",n:"Grundschule",z:"🏫",sektor:"bildung",risiko:1,aufgaben:[
  {t:"Elternbriefe verständlich",art:"text",tier:0,team:1,k:"Elternbriefe in einfache Sprache und drei Sprachen übersetzen.",lehre:"Schulkommunikation erreicht alle – oder niemanden."},
  {t:"Arbeitsblätter in Niveaustufen",art:"text",tier:1,team:1,k:"Ein Arbeitsblatt in drei Schwierigkeitsstufen – fachlich geprüft.",lehre:"Differenzierung kostet Lehrkräfte Stunden – Modelle liefern Entwürfe."},
  {t:"Stundenplan-Änderungen verschicken",art:"agent",tier:1,team:1,k:"Vertretungspläne lesen und betroffene Klassen benachrichtigen – ohne Schülerdaten.",lehre:"Schülerdaten sind besonders geschützt."}]},
 {id:"kita",n:"Kita",z:"🧸",sektor:"bildung",risiko:1,aufgaben:[
  {t:"Wochenpläne und Elterninfos",art:"text",tier:0,team:1,k:"Wochenpläne und Infozettel freundlich und knapp.",lehre:"Kurze Texte, viele Empfänger – Klassiker für kleine Modelle."},
  {t:"Anmeldelisten und Wartelisten",art:"agent",tier:1,team:1,k:"Anmeldungen erfassen, Warteliste pflegen, Eltern informieren – Kinderdaten geschützt.",lehre:"Kinderdaten: Datensparsamkeit und Schutz sind Pflicht."},
  {t:"Entwicklungsdokumentation strukturieren",art:"text",tier:2,team:1,k:"Beobachtungsnotizen in die Dokumentationsvorlage bringen – wertfrei, geschützt.",lehre:"Dokumentation über Kinder ist hochsensibel."}]},
 {id:"fahrschule",n:"Fahrschule",z:"🚦",sektor:"bildung",risiko:1,aufgaben:[
  {t:"Theoriefragen erklären",art:"wissen",tier:1,team:1,k:"Theoriefragen mit Begründung aus dem offiziellen Fragenkatalog erklären.",lehre:"Der Katalog ist die Quelle – nicht das Gedächtnis des Modells."},
  {t:"Fahrstunden-Terminplaner",art:"agent",tier:1,team:2,k:"Fahrstunden nach Verfügbarkeit von Lehrern, Autos und Schülern planen und bestätigen.",lehre:"Drei Ressourcen, ein Kalender – Agentenplanung mit Werkzeug."},
  {t:"Prüfungsanmeldungen ausfüllen",art:"support",tier:0,team:1,k:"Anmeldeformulare aus Schülerdaten korrekt ausfüllen.",lehre:"Formulare ausfüllen ist Extraktion plus Formattreue."}]},
 {id:"gemeinde",n:"Gemeindeverwaltung",z:"🏛️",sektor:"verwaltung",risiko:1,aufgaben:[
  {t:"Bürgeranfragen zu Formularen",art:"support",tier:1,team:1,k:"Fragen zu Anträgen und Öffnungszeiten beantworten – aus dem Verwaltungswissen.",lehre:"Verwaltung braucht Verlässlichkeit: nur belegte Antworten."},
  {t:"Ratsprotokolle zusammenfassen",art:"text",tier:2,team:1,k:"Sitzungsprotokolle in Bürgerzusammenfassungen übersetzen – ohne Wertung.",lehre:"Zusammenfassen ohne Wertung ist eine Treue-Aufgabe."},
  {t:"Antragsakten digital anlegen",art:"agent",tier:2,team:3,k:"Papieranträge scannen, erfassen und in das Fachverfahren einpflegen – Amt für Amt.",lehre:"Massendigitalisierung mit mehreren Agenten – und Datenschutz für Bürgerdaten."},
  {t:"Amtsblatt in einfacher Sprache",art:"text",tier:1,team:1,k:"Amtliche Texte in einfache Sprache – Inhalt unverändert.",lehre:"Barrierefreiheit ist gesetzliche Pflicht."}]},
 {id:"jugendzentrum",n:"Jugendzentrum",z:"🛹",sektor:"soziales",risiko:1,aufgaben:[
  {t:"Veranstaltungs-Posts",art:"text",tier:0,team:1,k:"Ankündigungen für Workshops und Konzerte – jugendgerecht, ohne Klischees.",lehre:"Zielgruppengerechter Ton ist Stilarbeit mit Beispielen."},
  {t:"Förderanträge vorbereiten",art:"agent",tier:2,team:2,k:"Förderprogramme prüfen, Antragsformulare befüllen, Nachweise sammeln.",lehre:"Förderanträge sind formstreng – Agenten füllen, Menschen unterschreiben."},
  {t:"Anmeldungen und Einverständnisse",art:"support",tier:0,team:1,k:"Anmeldungen erfassen, fehlende Einverständnisse anfordern – Daten Minderjähriger geschützt.",lehre:"Daten Minderjähriger: besonders sensibel."}]},
 {id:"feuerwehr",n:"Freiwillige Feuerwehr",z:"🚒",sektor:"sicherheit",risiko:1,aufgaben:[
  {t:"Einsatzberichte strukturieren",art:"text",tier:1,team:1,k:"Einsatznotizen in das Berichtsformular übertragen – Zeiten und Kräfte exakt.",lehre:"Einsatzberichte sind Dokumente mit rechtlicher Wirkung."},
  {t:"Übungsplanung und Einladungen",art:"agent",tier:1,team:1,k:"Übungstermine planen, Kameraden einladen, Zusagen erfassen.",lehre:"Vereinsorganisation ist ideales Agenten-Gelände."},
  {t:"Gefahrstoff-Datenblätter durchsuchbar",art:"wissen",tier:2,team:1,k:"Datenblätter indexieren und im Einsatz per Frage abrufbar machen – mit Beleg.",lehre:"Im Einsatz zählt der Beleg, nicht die Wahrscheinlichkeit."}]},
 {id:"softwarehaus",n:"Softwarehaus",z:"💻",sektor:"it",risiko:0,aufgaben:[
  {t:"Tests für Altcode schreiben",art:"code",tier:2,team:2,k:"Für eine ungetestete Codebasis Unit-Tests schreiben – Modul für Modul, zwei Agenten parallel.",lehre:"Tests schreiben ist Agentenarbeit mit Werkzeugen: ausführen, lesen, nachbessern."},
  {t:"Migration Python 2 nach 3",art:"code",tier:3,team:3,k:"Eine Alt-Anwendung modulweise migrieren, Tests laufen lassen, Abweichungen melden.",lehre:"Migration parallelisiert gut – Schnittstellen sind der Koordinationsanteil."},
  {t:"Changelog und Release-Notes",art:"text",tier:1,team:1,k:"Aus Commits verständliche Release-Notes für Kunden schreiben.",lehre:"Commits sind Rohdaten – Release-Notes brauchen Auswahl und Ton."},
  {t:"Sicherheitslücken triagieren",art:"code",tier:4,team:2,k:"Scanner-Meldungen bewerten, Fehlalarme aussortieren, Fixes vorschlagen.",lehre:"Triage ist Wissen plus Werkzeug – Fixes müssen getestet werden."}]},
 {id:"systemhaus",n:"IT-Systemhaus",z:"🖥️",sektor:"it",risiko:0,aufgaben:[
  {t:"Helpdesk erste Ebene",art:"support",tier:1,team:1,k:"Standardprobleme lösen, Tickets anlegen, Eskalation vorbereiten.",lehre:"First-Level-Support ist die häufigste Automatisierung – mit klarer Übergabe."},
  {t:"Server-Logs auswerten",art:"code",tier:2,team:1,k:"Logs nach Mustern durchsuchen, Ursachen vorschlagen, Bericht schreiben.",lehre:"Log-Analyse: Skript schreiben, ausführen, erklären."},
  {t:"Patch-Nächte koordinieren",art:"agent",tier:2,team:3,k:"Wartungsfenster planen, Kunden informieren, Patches ausrollen – drei Agenten, drei Kundengruppen.",lehre:"Automatisierte Rollouts brauchen Freigabelisten und Rückrollpläne."}]},
 {id:"webagentur",n:"Webagentur",z:"🌐",sektor:"it",risiko:0,aufgaben:[
  {t:"Landingpages aus Briefings",art:"code",tier:1,team:1,k:"Aus Kundenbriefings Landingpages mit Formular bauen.",lehre:"Vom Briefing zum Code – Agenten mit Coding-Tool liefern Entwürfe."},
  {t:"Barrierefreiheit prüfen und beheben",art:"code",tier:2,team:2,k:"Seiten gegen Barrierefreiheitsregeln prüfen und Fehler beheben.",lehre:"Barrierefreiheit ist ab 2025 Pflicht – Prüfung ist Werkzeugarbeit."},
  {t:"SEO-Texte ohne Keyword-Müll",art:"text",tier:1,team:1,k:"Seitentexte für echte Leser schreiben, Suchbegriffe natürlich einbauen.",lehre:"Suchmaschinen erkennen Keyword-Spam – Qualität zählt."}]},
 {id:"startup",n:"Start-up",z:"⚡",sektor:"it",risiko:0,aufgaben:[
  {t:"Pitch-Deck-Texte schärfen",art:"text",tier:1,team:1,k:"Aus Notizen klare Folientexte – Zahlen unverändert.",lehre:"Zahlen sind heilig; Formulierung ist Handwerk."},
  {t:"Prototyp mit Werkzeugen bauen",art:"code",tier:2,team:3,k:"Ein Prototyp in drei Teilen: API, Oberfläche, Tests – parallel gebaut, dann zusammengeführt.",lehre:"Drei Agenten sind schnell, wenn die Schnittstellen vorher stehen."},
  {t:"Nutzerfeedback clustern",art:"support",tier:1,team:1,k:"Feedback nach Themen clustern, Zitate belegen, Prioritäten vorschlagen.",lehre:"Clustern ist Klassifikation – mit Belegen wird es glaubwürdig."}]},
 {id:"pragentur",n:"PR-Agentur",z:"📣",sektor:"pr",risiko:0,aufgaben:[
  {t:"Pressemitteilungen im Kundenton",art:"text",tier:1,team:1,k:"Aus Stichworten Pressemitteilungen im Ton des Kunden – Fakten geprüft.",lehre:"Ton lernen, Fakten prüfen – beides ist Pflicht."},
  {t:"Medienbeobachtung zusammenfassen",art:"wissen",tier:2,team:1,k:"Berichterstattung sammeln, zusammenfassen, Stimmung einordnen – mit Belegen.",lehre:"Medienanalyse ohne Belege ist Meinung."},
  {t:"Kampagnen-Assets in Serie",art:"agent",tier:2,team:3,k:"Für eine Kampagne dreißig Varianten je Kanal erzeugen, ablegen und im Planungstool eintragen.",lehre:"Serienproduktion mit Werkzeugen – Qualitätskontrolle bleibt beim Menschen."},
  {t:"Krisenkommunikation vorbereiten",art:"text",tier:3,team:1,k:"Für ein Krisenszenario Sprachregelungen und Q&A entwerfen – vorsichtig, wahrhaftig.",lehre:"In der Krise zählt Wahrheit mehr als Wirkung."}]},
 {id:"werbeagentur",n:"Werbeagentur",z:"🎯",sektor:"pr",risiko:0,aufgaben:[
  {t:"Claims und Slogans in Varianten",art:"text",tier:1,team:1,k:"Für ein Produkt fünfzig Claims in verschiedenen Tonlagen – Auswahl trifft die Agentur.",lehre:"Varianten in Masse sind die Stärke, Auswahl die Kunst."},
  {t:"Anzeigen-Reporting automatisieren",art:"code",tier:2,team:1,k:"Kampagnendaten aus Portalen ziehen und als Bericht aufbereiten.",lehre:"Reporting-Skripte sparen jede Woche Stunden."},
  {t:"Kundenpräsentationen aus Briefings",art:"agent",tier:2,team:2,k:"Aus Briefings Präsentationen zusammenstellen, Bilder einfügen, Freigaben anfordern.",lehre:"Agenten bauen den Entwurf – Kreative entscheiden."}]},
 {id:"fotostudio",n:"Fotostudio",z:"📷",sektor:"pr",risiko:1,aufgaben:[
  {t:"Bildbeschreibungen und Alt-Texte",art:"text",tier:0,team:1,k:"Für Kundenbilder Alt-Texte und Beschreibungen – barrierefrei, sachlich.",lehre:"Alt-Texte sind Pflicht für Barrierefreiheit."},
  {t:"Buchungen und Verträge",art:"agent",tier:1,team:1,k:"Shootings buchen, Verträge aus Vorlagen erzeugen, Erinnerungen senden.",lehre:"Kundendaten und Bildrechte: Sorgfalt gehört dazu."},
  {t:"Bildarchiv verschlagworten",art:"support",tier:1,team:1,k:"Zehntausend Archivbilder mit Schlagworten versehen – Personen nur mit Einwilligung.",lehre:"Gesichter in Archiven sind personenbezogene Daten."}]},
 {id:"lokalzeitung",n:"Lokalzeitung",z:"📰",sektor:"pr",risiko:0,aufgaben:[
  {t:"Vereinsmeldungen redigieren",art:"text",tier:0,team:1,k:"Eingesandte Vereinsmeldungen kürzen und redigieren – Fakten unverändert.",lehre:"Redigieren ist Treue-Arbeit."},
  {t:"Ratsunterlagen recherchieren",art:"wissen",tier:2,team:1,k:"Aus Ratsunterlagen belegte Hintergründe für Artikel zusammenstellen.",lehre:"Belege sind das Fundament des Journalismus – auch mit Modell."},
  {t:"Leserbriefe moderieren",art:"support",tier:1,team:1,k:"Leserbriefe nach Regeln vorprüfen: Beleidigungen markieren, Rest weiterleiten.",lehre:"Moderation ist Klassifikation mit klaren Regeln."}]},
 {id:"maschinenbau",n:"Maschinenbau",z:"⚙️",sektor:"industrie",risiko:0,aufgaben:[
  {t:"Betriebsanleitungen übersetzen",art:"text",tier:2,team:1,k:"Anleitungen in vier Sprachen – Fachbegriffe konsistent, Sicherheitskapitel exakt.",lehre:"Technische Übersetzung braucht Terminologie-Listen."},
  {t:"Ersatzteil-Bot für Servicetechniker",art:"agent",tier:2,team:2,k:"Techniker fragen per Chat, der Agent sucht Teile, prüft Lager und bestellt.",lehre:"Servicetechniker brauchen Antworten in Sekunden – mit Werkzeugen."},
  {t:"Wartungsdaten für Vorhersagen aufbereiten",art:"code",tier:3,team:2,k:"Sensordaten aufbereiten, Merkmale berechnen, Vorhersagemodell trainieren.",lehre:"Datenaufbereitung ist der Großteil jeder Vorhersage."}]},
 {id:"spedition",n:"Spedition",z:"🚚",sektor:"industrie",risiko:0,aufgaben:[
  {t:"Frachtpapiere prüfen",art:"support",tier:1,team:1,k:"Frachtbriefe auf Vollständigkeit prüfen, Fehler markieren.",lehre:"Formprüfung in Masse – ideal für kleine Modelle."},
  {t:"Tourenplanung mit Zeitfenstern",art:"agent",tier:3,team:3,k:"Touren für dreißig Fahrzeuge nach Zeitfenstern und Ladung planen und disponieren.",lehre:"Disposition ist Optimierung – Agenten schlagen vor, Disponenten entscheiden."},
  {t:"Kundenportal-Support",art:"support",tier:1,team:1,k:"Sendungsstatus und Rechnungsfragen beantworten.",lehre:"Statusauskunft ist Werkzeugaufruf plus Antwort."}]},
 {id:"metallbau",n:"Metallbau",z:"🔩",sektor:"industrie",risiko:0,aufgaben:[
  {t:"Angebote aus Zeichnungen",art:"text",tier:1,team:1,k:"Aus Zeichnungen und Stücklisten Angebotstexte mit Positionen.",lehre:"Angebote sind Extraktion plus Vorlage."},
  {t:"CNC-Programme prüfen",art:"code",tier:3,team:1,k:"Programme auf typische Fehler prüfen und Vorschläge machen – Freigabe durch den Meister.",lehre:"Maschinencode ist sicherheitsrelevant – nie ungeprüft ausführen."},
  {t:"Lieferantenanfragen automatisieren",art:"agent",tier:2,team:2,k:"Anfragen an mehrere Lieferanten senden, Antworten vergleichen, Tabelle füllen.",lehre:"Vergleichen ist Agentenarbeit mit Struktur."}]},
 {id:"solarteur",n:"Solarteur",z:"☀️",sektor:"energie",risiko:0,aufgaben:[
  {t:"Ertragsprognosen erklären",art:"wissen",tier:1,team:1,k:"Kunden die Prognose aus Dachdaten erklären – mit Annahmen und Grenzen.",lehre:"Prognosen brauchen Annahmen – genau wie das Wetter im Spiel."},
  {t:"Netzanschluss-Anträge einreichen",art:"agent",tier:2,team:2,k:"Anträge beim Netzbetreiber aus Anlagendaten erzeugen und einreichen.",lehre:"Netzanträge sind formstreng – Agenten füllen, Menschen unterschreiben."},
  {t:"Monitoring-Auswertung",art:"code",tier:2,team:1,k:"Anlagendaten auswerten, Ertragsabweichungen melden.",lehre:"Monitoring-Skripte finden Fehler, bevor der Kunde sie bemerkt."}]},
 {id:"stadtwerke",n:"Stadtwerke",z:"💡",sektor:"energie",risiko:1,aufgaben:[
  {t:"Tarifberatung im Chat",art:"support",tier:2,team:1,k:"Tariffragen beantworten – aus dem Tarifwerk, ohne Vertragsdaten preiszugeben.",lehre:"Vertragsdaten sind geschützt; Tarife sind öffentlich."},
  {t:"Zählerstände aus Fotos erfassen",art:"agent",tier:1,team:2,k:"Zählerfotos lesen, Werte prüfen und im Abrechnungssystem eintragen.",lehre:"Bildlesen plus Werkzeug: robust, wenn Unsicheres markiert wird."},
  {t:"Lastprognosen aufbereiten",art:"code",tier:3,team:1,k:"Verbrauchsdaten aufbereiten und Prognosen für den Netzbetrieb berechnen.",lehre:"Energie ist Daten – Prognosen entscheiden über Einkauf."}]},
 {id:"museum",n:"Heimatmuseum",z:"🏺",sektor:"kultur",risiko:0,aufgaben:[
  {t:"Objekttexte für die Ausstellung",art:"text",tier:1,team:1,k:"Aus Inventarnotizen Objekttexte in einfacher Sprache.",lehre:"Vermittlung ist Übersetzung für alle Besucher."},
  {t:"Archiv durchsuchbar machen",art:"wissen",tier:2,team:1,k:"Archivbestände indexieren und Anfragen mit Belegen beantworten.",lehre:"Archive brauchen Retrieval, nicht Auswendiglernen."},
  {t:"Audioguide-Skripte",art:"text",tier:1,team:1,k:"Skripte für den Audioguide in drei Sprachen.",lehre:"Sprechtexte klingen anders als Lesetexte."}]},
 {id:"theater",n:"Kleines Theater",z:"🎭",sektor:"kultur",risiko:0,aufgaben:[
  {t:"Programmheft-Texte",art:"text",tier:1,team:1,k:"Stückbeschreibungen und Biografien im Ton des Hauses.",lehre:"Kulturtexte brauchen Haltung – Beispiele geben sie vor."},
  {t:"Kartenverkauf-Support",art:"support",tier:0,team:1,k:"Fragen zu Karten, Ermäßigungen und Barrierefreiheit beantworten.",lehre:"FAQ-Bots entlasten die Kasse."},
  {t:"Fördermittel-Berichte",art:"agent",tier:2,team:2,k:"Verwendungsnachweise aus Belegen und Programmen zusammenstellen.",lehre:"Nachweise sind Formarbeit – Agenten sammeln, Menschen prüfen."}]},
 {id:"buecherei",n:"Gemeindebücherei",z:"📚",sektor:"kultur",risiko:0,aufgaben:[
  {t:"Auskunft aus dem Katalog",art:"wissen",tier:1,team:1,k:"Leser fragen nach Büchern – Antworten nur aus dem Katalog, mit Signatur.",lehre:"Katalogauskunft ist Retrieval in Reinform."},
  {t:"Lesetipps nach Alter",art:"text",tier:0,team:1,k:"Kurze Lesetipps nach Altersstufe aus dem Bestand.",lehre:"Empfehlungen brauchen Bestand als Grundlage."},
  {t:"Fernleihe-Anfragen bearbeiten",art:"agent",tier:1,team:1,k:"Fernleihen anfragen, Status verfolgen, Leser informieren.",lehre:"Statusverfolgung ist Agentenarbeit mit Geduld."}]},
 {id:"ferienhof",n:"Ferienhof",z:"🏡",sektor:"tourismus",risiko:0,aufgaben:[
  {t:"Buchungsanfragen beantworten",art:"support",tier:0,team:1,k:"Verfügbarkeit, Preise und Anreise beantworten – aus dem Belegungsplan.",lehre:"Verfügbarkeit ist ein Werkzeug-Lookup, kein Ratespiel."},
  {t:"Gästemappe in vier Sprachen",art:"text",tier:1,team:1,k:"Hausregeln, Ausflugstipps und Notfallnummern übersetzen.",lehre:"Notfallinformationen müssen in jeder Sprache stimmen."},
  {t:"Portale synchron halten",art:"agent",tier:2,team:2,k:"Belegung und Preise auf drei Buchungsportalen synchron halten.",lehre:"Doppelbuchungen sind der Albtraum – Synchronisation ist Werkzeugarbeit."}]},
 {id:"landhotel",n:"Landhotel",z:"🛎️",sektor:"tourismus",risiko:0,aufgaben:[
  {t:"Bewertungsantworten",art:"text",tier:0,team:1,k:"Gästebewertungen freundlich beantworten, Kritik aufnehmen.",lehre:"Antworten lesen die nächsten Gäste."},
  {t:"Tagungsanfragen kalkulieren",art:"support",tier:2,team:1,k:"Tagungspakete kalkulieren und Angebote entwerfen – aus Preislisten.",lehre:"Angebote binden – Zahlen aus der Liste."},
  {t:"Housekeeping-Planung",art:"agent",tier:2,team:3,k:"Zimmerstatus, Anreisen und Personal zu Tagesplänen verbinden – drei Bereiche parallel.",lehre:"Operative Planung mit mehreren Agenten spart Frühbesprechungen."}]},
 {id:"reisebuero",n:"Reisebüro",z:"🧳",sektor:"tourismus",risiko:1,aufgaben:[
  {t:"Reiseunterlagen zusammenstellen",art:"agent",tier:1,team:1,k:"Buchungen, Tickets und Hinweise je Kunde zu Unterlagen bündeln.",lehre:"Passdaten sind geschützt – Sorgfalt beim Zusammenstellen."},
  {t:"Einreisebestimmungen mit Beleg",art:"wissen",tier:2,team:1,k:"Aktuelle Bestimmungen aus offiziellen Quellen zusammenfassen.",lehre:"Veraltete Einreiseregeln sind teuer – Quellen mit Datum."},
  {t:"Angebotstexte für Gruppenreisen",art:"text",tier:1,team:1,k:"Reiseprogramme ansprechend beschreiben – Leistungen exakt.",lehre:"Leistungsbeschreibungen sind Vertragsbestandteil."}]}
];

/* ── Hilfen ───────────────────────────────────────────── */
function berufAnf(art,tier){
  const keys=BERUF_ARTKEYS[art]||BERUF_ARTKEYS.text; const haupt=BERUF_REGELN.anfBasis+BERUF_REGELN.anfJeTier*tier;
  const anf={}; keys.forEach((k,i)=>{ anf[k]=Math.max(10,haupt-(i===0?0:i===1?6:10)); }); return anf;
}
function berufAlleAufgaben(){ const out=[]; BERUFE.forEach(b=>b.aufgaben.forEach(a=>out.push({b,a}))); return out; }
function berufRisiko(b,a){ return Math.max(Number(b.risiko)||0,Number(a.risiko)||0,(typeof DS_REGELN!=="undefined"&&DS_REGELN.artRisiko[a.art])||0); }
/* Kunde je Beruf: einmal je Partie, danach Stammkundschaft */
function zsKundeAusBeruf(b,s){
  s=s||(typeof S!=="undefined"?S:null); if(!s||typeof KUNDEN==="undefined") return null; zsKundenRegistrieren(s);
  const id="dyn_b_"+b.id; if(s.kundenDyn[id]){ KUNDEN[id]=s.kundenDyn[id]; return id; }
  const nach=zsPick(ZS_NACHNAMEN,"beruf-nach:"+b.id,s), ort=zsPick(ZS_ORTE,"beruf-ort:"+b.id,s), eigen=zsPick(ZS_EIGENARTEN,"beruf-eigen:"+b.id,s);
  const risiko=Number(b.risiko)||0; const arten=[...new Set(b.aufgaben.map(a=>a.art))];
  const k={sektor:b.sektor,beruf:b.id,n:(typeof zsNameEindeutig==="function")?zsNameEindeutig(b.n+" "+nach,ort):(b.n+" "+nach),z:b.z,branche:b.n+" · "+(BERUF_SEKTOREN[b.sektor]||b.sektor)+" · "+ort,   /* v9.8: der Kunde trägt seinen Sektor, damit jeder Zettel dasselbe Risiko zeigt */arten,tiers:[0,5],geduld:risiko>=2?0:Math.floor(zsRnd("beruf-geduld:"+b.id,s)*3),lokalPflicht:risiko>=2,dyn:true,beruf:b.id,ort,eigenart:eigen,
    kommentarGut:risiko>=2?"Diskret, genau und pünktlich – so arbeiten wir gern mit euch.":"Das hat uns Zeit gespart – und es klang nach uns.",
    kommentarSchlecht:risiko>=2?"Bei unseren Daten darf nichts schiefgehen. Wir prüfen, ob wir weitermachen.":"Da war zu viel Nacharbeit nötig – beim nächsten Mal bitte genauer."};
  s.kundenDyn[id]=k; KUNDEN[id]=k; return id;
}
/* Ein Zettel aus dem Berufe-Katalog: Zahlen aus BERUF_BASIS, Text aus Beruf und Aufgabe */
function zsBerufZettel(opt){
  opt=opt||{}; if(typeof S==="undefined"||!S) return null;
  const st=zsStand(S); st.berufZaehler=(st.berufZaehler||0)+1; const key="beruf:"+st.berufZaehler;
  const max=Math.min(5,Math.floor(hofLevel().i/2)); const geschirrDa=S.tiere.some(p=>p.geschirr)||forschungFrei("geschirr");
  /* Sichtbare Katalog-Freischaltung und tatsächliches Restrisiko sind getrennt:
     schon ein Fachkurs oder ein Agenten-Tool mit Schutzfunktionen darf sensible Arbeit zeigen; wie
     riskant die konkrete Besetzung bleibt, berechnet erst dsWahrscheinlichkeit. */
  const schutzNachweis=S.tiere.some(p=>Object.values(p.fach||{}).some(v=>Number(v)>0)||((typeof HARNESSE!=="undefined"&&HARNESSE[p.geschirr]||{}).schutz)), stufe=hofLevel().i;
  const risikoOk=(b,a)=>{ const r=berufRisiko(b,a); return r===0||schutzNachweis||(r===1&&stufe>=2)||(r===2&&stufe>=3); };   /* Kanzlei und Praxis fragen erst an, wenn der Hof reif ist oder Schutz nachweist */
  let pool=berufAlleAufgaben().filter(({b,a})=>a.tier<=max&&(opt.tier===undefined||a.tier===opt.tier)&&((a.team<=1&&a.art!=="agent")||geschirrDa)&&risikoOk(b,a));
  if(opt.arten&&opt.arten.length){ const pa=pool.filter(({a})=>opt.arten.includes(a.art)); if(pa.length) pool=pa; }
  if(opt.team){ const pt=pool.filter(({a})=>a.team>1); if(pt.length) pool=pt; }
  if(!pool.length) pool=berufAlleAufgaben().filter(({b,a})=>a.tier===0&&a.team<=1&&a.art!=="agent"&&berufRisiko(b,a)===0);
  const letzte=st.letzteBerufe||[]; const frisch=pool.filter(x=>!letzte.includes(x.b.id+"/"+x.a.t)); if(frisch.length) pool=frisch;
  const {b,a}=pool[Math.floor(zsRnd(key+":wahl")*pool.length)%pool.length]; st.letzteBerufe=[...letzte,b.id+"/"+a.t].slice(-12);
  const tier=a.tier, B=BERUF_BASIS[tier]||BERUF_BASIS[1], R=BERUF_REGELN, agent=a.team>1||a.art==="agent", teamMax=Math.max(1,Math.min(4,a.team||1)), risiko=berufRisiko(b,a);
  const gebiet=(typeof FACH_VON_SEKTOR!=="undefined"&&FACH_VON_SEKTOR[b.sektor])||(a.art==="medizin"?"medizin":a.art==="recht"?"recht":null);
  const fachMin=(risiko&&gebiet&&typeof fachMinFuer==="function")?fachMinFuer(risiko,tier,S.tag):0;
  const gr=teamMax>1?"L":zufall(tier===0?["S","M","M","L"]:["S","M","M","L","L"]), G=HL_GROESSEN[gr]||HL_GROESSEN.M;
  const eil=!agent&&teamMax<=1&&Math.random()<0.2;
  const teamMtok=1+R.teamMtokJe*(teamMax-1), teamLohn=1+R.teamLohnJe*(teamMax-1), teamTage=1+R.teamTageJe*(teamMax-1);
  const mtok=Math.round(B.mtok*(agent?R.agentMtokF:1)*teamMtok*G.f*100)/100;
  const tage=Math.max(1,Math.round(B.tage*teamTage));
  const lohn=Math.round(B.lohn*(agent?R.agentLohnF:1)*teamLohn*G.lohn*(R.risikoLohnF[risiko]||1)*(fachMin?1+((typeof FACH_REGELN!=="undefined")?FACH_REGELN.lohnF:0.008)*fachMin:1)*(eil?1.35:1)*z(.95,1.08)*((typeof saison==="function"&&saison().lohnF)||1)*(rufSterne()>=(skillAktiv("stammkunden")?4:4.5)?1.1:1));
  const kunde=zsKundeAusBeruf(b,S)||b.id; const K=KUNDEN[kunde]||{}; const anf=berufAnf(a.art,tier);
  const j={id:"j"+S.zaehler++,vorlage:"beruf:"+b.id,mikro:tier===0,t:a.t,b:(K.n?K.n+(K.ort?" aus "+K.ort:"")+": ":"")+a.k+" "+zsPick(ZS_ERWARTUNG,key+":erw",S),
    tier,art:a.art,kunde,groesse:gr,eil,tage,puffer:eil?0:1,frisch:S.tag,anf,ctxMin:B.ctx,agent,dsgvo:risiko>=2,mtok,mtokTag:Math.round(mtok/tage*1000)/1000,preisMtok:10,latenz:3,parallel:false,
    einheit:tier===0?"Kurzfälle":"Pakete",einheiten:Math.max(4,Math.round((tier===0?40:12*tage)*G.f)),lohnBasis:lohn,teile:[],rollen:[{n:teamMax>1?"Agent":(BERUF_ROLLE[a.art]||"Bearbeiten"),anf}],stufe:tier,gross:false,
    beruf:b.id,berufN:b.n,sektor:b.sektor,risiko,gebiet:risiko?gebiet:null,fachMin:risiko?fachMin:undefined,teamMax,teamN:1,komplex:teamMax>1,lehre:a.lehre,_zs:true};
  if(typeof zsWendung==="function"&&typeof zsWendungAnwenden==="function"&&!j.komplex) zsWendungAnwenden(j,zsWendung(j,S));
  if(typeof dsJobNachruesten==="function") dsJobNachruesten(j);   /* v9.8: hohes Risiko heißt Vor-Ort-Pflicht */
  return j;
}
/* Morgens: neue Zettel aus dem Katalog; eine Nadel im Stall sortiert den Posteingang vor (Klassifikation) */
function zsNadelAktiv(){ return (S&&S.tiere||[]).some(p=>typeof istNadel==="function"&&istNadel(p)&&p.bucht&&p.status!=="training"); }
function zsPassendeArten(){
  const map={schreiben:"text",wissen:"wissen",code:"code",werkzeug:"agent",treue:"support",logik:"code",kontext:"wissen"}; const arten=new Set();
  (S.tiere||[]).filter(p=>p.status==="frei"&&(p.bucht||p.api)&&!(typeof istNadel==="function"&&istNadel(p))).forEach(p=>{ const w=(typeof effW==="function")?effW(p):p.w; const top=Object.entries(w||{}).sort((x,y)=>y[1]-x[1]).slice(0,2); top.forEach(([k])=>{ if(map[k]) arten.add(map[k]); }); });
  return [...arten];
}
function zsBerufZettelMorgen(bericht){
  if(typeof S==="undefined"||!S||(typeof dsGeschlossen==="function"&&dsGeschlossen())) return [];
  const offen=S.jobs.filter(j=>!j.team).length; if(offen>=BERUF_REGELN.maxOffen) return [];
  const nadel=zsNadelAktiv(); const neue=[]; const teamTag=hofLevel().i>=2&&(S.tag%3===0);
  const j1=zsBerufZettel(teamTag?{team:true}:{}); if(j1){ S.jobs.push(j1); neue.push(j1); }
  if(nadel&&S.jobs.filter(j=>!j.team).length<BERUF_REGELN.maxOffen){ const j2=zsBerufZettel({arten:zsPassendeArten()}); if(j2){ S.jobs.push(j2); neue.push(j2); if(bericht&&bericht.zeilen) bericht.zeilen.push({t:"🪡 Die Nadel hat den Posteingang vorsortiert: „"+j2.t+"“ passt zu den Stärken deiner Modelle und hängt zusätzlich an der Pinnwand.",art:"info"}); } }
  return neue;
}
function berufeHofbuchHtml(){
  const e=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const alle=berufAlleAufgaben(); const sekt={}; BERUFE.forEach(b=>{ sekt[b.sektor]=(sekt[b.sektor]||[]); sekt[b.sektor].push(b); });
  const R=BERUF_REGELN;
  return '<p style="margin-top:8px"><b>🧑‍🔧 Berufe-Katalog (Ära 9).</b> '+BERUFE.length+' Berufe aus '+Object.keys(sekt).length+' Sektoren mit '+alle.length+' Aufgaben, die durch Digitalisierung und den Einsatz von Agenten entstehen. Jeden Morgen kommt ein Katalog-Zettel dazu (alle drei Tage ab Stufe 2 ein Team-Zettel), eine Nadel im Stall sortiert einen zweiten passend zu den Stärken deiner Modelle vor. Zettel <b>aus diesem Katalog</b> mit erhöhtem Datenschutz-Risiko erscheinen ab Hofstufe 2, mit hohem ab Hofstufe 3 – oder sobald ein Modell geschult ist beziehungsweise ein Agenten-Tool mit Schutzfunktionen verwendet. Die Stammkundschaft des Dorfes (Kita, Praxis, Apotheke …) schickt dagegen von Tag 1 an Zettel mit erhöhtem Risiko: Wer mit ihren Daten arbeitet, braucht eine Schulung oder ein Agenten-Tool mit Schutzfunktionen – im ersten Fall bleibt es bei einer Verwarnung. Zahlen je Tier: '+Object.entries(BERUF_BASIS).map(([t,b])=>'T'+t+' '+b.mtok+' Mtok/'+b.lohn+' €/'+b.tage+' Tag'+(b.tage===1?'':'e')).join(' · ')+'; Agenten-Aufgaben ×'+R.agentMtokF+' Arbeit und ×'+R.agentLohnF+' Lohn. <b>Zettel-Basisskalierung für Team-Aufgaben:</b> je weiterem möglichen Agenten +'+Math.round(R.teamMtokJe*100)+' % Arbeit, +'+Math.round(R.teamLohnJe*100)+' % Lohn und +'+Math.round(R.teamTageJe*100)+' % Frist. Datenschutz-Aufschlag ×'+R.risikoLohnF[1]+' (erhöht) / ×'+R.risikoLohnF[2]+' (hoch) plus Fachwissens-Aufschlag (siehe Fachbildung). Anforderungen: Hauptwert '+R.anfBasis+' + '+R.anfJeTier+' je Tier; sensible Sektoren verlangen zusätzlich Fachwissen im Gebiet.</p>'+ 
    '<p><b>👥 Agenten-Teams – Einsatzberechnung.</b> Komplexe Zettel (Chip „Team bis N“) dürfen von mehreren verschiedenen Agenten mit Agenten-Tool gleichzeitig bearbeitet werden. Nach der Basisskalierung teilt sich die Arbeit durch die tatsächlich gewählte Teamgröße; die zusätzliche Abstimmung kostet je weiterem eingesetzten Agenten +'+Math.round(R.koordJeAgent*100)+' % Arbeit (mit demselben Tool: +'+Math.round(R.koordGleich*100)+' %, „eingespieltes Team“, +2 Qualität statt −3). Beispiel gleich schneller Agenten: 1 Agent 4 Tage; gemischt → 2 Agenten 2,2 Tage / 3 Agenten 1,6 Tage; mit demselben Tool → 2 Agenten 2,1 Tage / 3 Agenten 1,5 Tage. Die Pinnwand zeigt die Schätzung je Teamgröße mit den schnellsten freien Agenten.</p>'+ 
    '<div class="reihe" style="flex-wrap:wrap">'+Object.entries(sekt).map(([s,bs])=>'<span class="merk'+((typeof DS_REGELN!=="undefined"&&DS_REGELN.sektorRisiko[s]>=2)?' schlecht':(typeof DS_REGELN!=="undefined"&&DS_REGELN.sektorRisiko[s]===1)?' gold':'')+'" title="'+e(bs.map(b=>b.n).join(', '))+'">'+e(BERUF_SEKTOREN[s]||s)+' ('+bs.length+')</span>').join(' ')+'</div>';
}
Object.assign(window,{BERUFE,BERUF_BASIS,BERUF_REGELN,BERUF_SEKTOREN,berufAnf,berufAlleAufgaben,berufRisiko,zsKundeAusBeruf,zsBerufZettel,zsBerufZettelMorgen,zsNadelAktiv,zsPassendeArten,berufeHofbuchHtml});
