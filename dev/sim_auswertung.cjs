#!/usr/bin/env node
/* Auswertung der Simulations-Läufe (dev/spielbot.cjs): liest alle <ordner>/*.json, schreibt <ordner>/_auswertung.md
   Aufruf: node dev/sim_auswertung.cjs <ordner> */
const fs=require("fs"),path=require("path");
const dir=process.argv[2]; if(!dir){ console.error("Ordner fehlt"); process.exit(1); }
const files=fs.readdirSync(dir).filter(f=>f.endsWith(".json")&&!f.startsWith("_"));
const zeilen=[], exc=new Map(), bef={}, verlauf=[], strategien={};
for(const f of files){
  let st; try{ st=JSON.parse(fs.readFileSync(path.join(dir,f),"utf8")); }catch(e){ continue; }
  const S=st.S; if(!S) continue;
  const v=st.verlauf||[]; const ende=v[v.length-1]||{};
  const tage=S.tag-1, jobsOk=S.statistik.jobs, strafen=(S.journal||[]).filter(j=>j.kat==="strafe").length;
  const einn=(S.journal||[]).filter(j=>j.b>0&&j.kat==="job").reduce((a,j)=>a+j.b,0);
  const foerd=(S.journal||[]).filter(j=>j.kat==="foerderung").reduce((a,j)=>a+j.b,0);
  const ex=(st.befunde||[]).filter(b=>b.art==="EXCEPTION");
  ex.forEach(b=>{ const k=b.text.replace(/t\d+|j\d+|b\d+/g,"#").slice(0,140); exc.set(k,(exc.get(k)||0)+1); });
  (st.befunde||[]).filter(b=>b.art!=="EXCEPTION").forEach(b=>{ (bef[b.art]=bef[b.art]||[]).push(f.replace(".json","")+" T"+b.tag+": "+b.text); });
  const strat=[Object.keys(S.forschung).length?"forschung":"",S.statistik.trainings?"training":"",S.buchten.length>1?"hardware":"",S.tiere.some(t=>t.api)?"cloud":"",(S.rechenhaus.pv||[]).length||S.rechenhaus.akku?"energie":"",Object.keys((st.S.hofloop||{}).teile||{}).length?"rag":"",S.tiere.some(t=>t.geschirr)?"agent":"",S.statistik.merges?"zucht":""].filter(Boolean).join("+")||"nur-auftraege";
  strategien[strat]=(strategien[strat]||[]); strategien[strat].push(Math.round(S.kredit));
  zeilen.push({f:f.replace(".json",""),tage,kasse:Math.round(S.kredit),stufe:ende.stufe||1,xp:S.xp,ruf:Math.round(S.ruf),jobs:jobsOk,strafen,einn:Math.round(einn),foerd:Math.round(foerd),tiere:S.tiere.length,buchten:S.buchten.length,ex:ex.length,bef:(st.befunde||[]).length-ex.length,aktionen:st.aktionen,schwierig:S.schwierig,fokus:S.spezial||"gemischt",strat});
  verlauf.push({f:f.replace(".json",""),v:v.map(x=>x.kasse)});
}
zeilen.sort((a,b)=>a.f.localeCompare(b.f));
const md=[];
md.push("# Simulations-Auswertung ("+zeilen.length+" Läufe)\n");
md.push("| Lauf | Tage | Kasse | Stufe | XP | Ruf | Aufträge | Strafen | Job-Einnahmen | Förderung | Tiere | Buchten | Exceptions | Befunde | Aktionen | Schwierig | Fokus | Strategie |");
md.push("|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|---|");
zeilen.forEach(z=>md.push(`| ${z.f} | ${z.tage} | ${z.kasse} | ${z.stufe} | ${z.xp} | ${z.ruf} | ${z.jobs} | ${z.strafen} | ${z.einn} | ${z.foerd} | ${z.tiere} | ${z.buchten} | ${z.ex} | ${z.bef} | ${z.aktionen} | ${z.schwierig} | ${z.fokus} | ${z.strat} |`));
const n=zeilen.length||1, avg=k=>Math.round(zeilen.reduce((a,z)=>a+z[k],0)/n);
md.push(`\n**Mittel:** Tage ${avg("tage")} · Kasse ${avg("kasse")} € · Stufe ${avg("stufe")} · Aufträge ${avg("jobs")} · Strafen ${avg("strafen")} · Job-Einnahmen ${avg("einn")} € · Förderung ${avg("foerd")} € · Exceptions gesamt ${zeilen.reduce((a,z)=>a+z.ex,0)}`);
md.push(`Kasse min ${Math.min(...zeilen.map(z=>z.kasse))} / max ${Math.max(...zeilen.map(z=>z.kasse))} · Läufe im Minus: ${zeilen.filter(z=>z.kasse<0).length} · Stufe ≥3: ${zeilen.filter(z=>z.stufe>=3).length} · Stufe ≥5: ${zeilen.filter(z=>z.stufe>=5).length}`);
md.push("\n## Strategie → Kasse am Ende (Mittel / n)");
Object.entries(strategien).sort((a,b)=>b[1].length-a[1].length).forEach(([k,v])=>md.push(`- ${k}: ${Math.round(v.reduce((a,b)=>a+b,0)/v.length)} € (n=${v.length})`));
md.push("\n## Exceptions (dedupliziert)");
[...exc.entries()].sort((a,b)=>b[1]-a[1]).forEach(([k,c])=>md.push(`- ×${c} ${k}`));
if(!exc.size) md.push("- keine");
md.push("\n## Befunde der Agenten (aus dem Spiel heraus notiert)");
Object.entries(bef).forEach(([art,l])=>{ md.push(`\n### ${art} (${l.length})`); l.forEach(t=>md.push("- "+t)); });
md.push("\n## Kassenverlauf (Tag 1 → Ende)");
verlauf.forEach(v=>md.push(`- ${v.f}: ${v.v.join(" → ")}`));
fs.writeFileSync(path.join(dir,"_auswertung.md"),md.join("\n"));
console.log(md.slice(0,8).join("\n")); console.log("… geschrieben: "+path.join(dir,"_auswertung.md"));
