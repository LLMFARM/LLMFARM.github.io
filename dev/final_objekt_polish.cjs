const fs=require('fs'),path=require('path');const file=path.join(__dirname,'rechenhaus.js');let s=fs.readFileSync(file,'utf8');
const a="+r.netzKW+' kW Netz</small></button>':'')+(r.akku?";
const b="+r.netzKW+' kW Netz</small></button>':r.nachbar?'<button onclick=\"zeigeRechenhaus(\\'ausbau\\')\" title=\"Stromverteiler für den Nachbaranschluss\">'+rhObjektBild('stromverteiler')+'<small>'+r.netzKW+' kW Anschluss</small></button>':'')+(r.akku?";
if(!s.includes(a))throw Error('Stromverteiler-Anker fehlt');s=s.replace(a,b);fs.writeFileSync(file,s);
console.log('Stromverteiler auch auf der Schuppenwiese sichtbar.');
