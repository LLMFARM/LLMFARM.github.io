/* ============================================================
   LLM FARM - Grafikmodul (reine String-Builder, keine DOM-Zugriffe)
   Stil: dicke dunkle Konturen (#3d2412, 4.5-5), Pastellfarben,
   gleiche Anatomie-DNA wie die Referenz (pigSvg/szeneSvg v3).
   ============================================================ */

function schat(hex,d){
  const n=[1,3,5].map(i=>Math.max(0,Math.min(255,parseInt(hex.substr(i,2),16)+d)));
  return "#"+n.map(v=>v.toString(16).padStart(2,"0")).join("");
}

function misch(hexA,hexB,t){
  const a=[1,3,5].map(i=>parseInt(hexA.substr(i,2),16));
  const b=[1,3,5].map(i=>parseInt(hexB.substr(i,2),16));
  return "#"+a.map((v,i)=>Math.round(v+(b[i]-v)*t).toString(16).padStart(2,"0")).join("");
}

function rund(v){ return Math.round(v*10)/10; }

/* ------------------------------------------------------------
   pigSvg(p, opt) - das Schwein.
   p: farbe, muster, musterFarbe, gr 0-5, moe, quant 0-6, geschirrZ,
      denkt 0-2, adapter 0-2, wolke, zustand. opt: {krone, hut, liegt}
   opt.hut: 1 Strohhut, 2 Zylinder, 3 Krone (krone===true wirkt wie hut 3)
   opt.liegt: Ruhepose, Bauch auf der Bodenlinie (nicht bei wolke)
   Klassen-Hooks fuer CSS-Animationen bleiben erhalten:
   svg.rumpf, g.bein a/b/c/d, rect.lid, path.schwanzringel
   ------------------------------------------------------------ */
function pigSvg(p, opt={}){
  p = p || {};
  const gr = Math.max(0, Math.min(5, Math.round(p.gr==null ? 2 : p.gr)));
  const quant = Math.max(0, Math.min(6, p.quant||0));
  const traurig = (p.zustand==null ? 100 : p.zustand) < 45;
  const liegt = !!opt.liegt && !p.wolke;   /* Wolkentiere schweben, liegen nie */
  const hut = opt.hut||(opt.krone?3:0);    /* Kopfbedeckung: 1 Strohhut, 2 Zylinder, 3 Krone */

  /* Groessenklassen: Beine, Rumpf, Kopf, Auge, Ruessel, Ohr, Schatten */
  const G = [
    {lw:15,lh:19, rx:33,ry:25,cx:94, cy:121, hr:30,hx:141,hy:100, er:7.4,edx:3,edy:-8,  sdx:21,sdy:7, srx:12,sry:10, es:.58, sh:46},
    {lw:19,lh:30, rx:49,ry:35,cx:93, cy:104, hr:34,hx:152,hy:91,  er:5.8,edx:5,edy:-12, sdx:25,sdy:10,srx:16,sry:13, es:.8,  sh:56},
    {lw:24,lh:40, rx:66,ry:45,cx:92, cy:96,  hr:40,hx:166,hy:86,  er:5,  edx:6,edy:-16, sdx:30,sdy:12,srx:20,sry:17, es:1,   sh:66},
    {lw:27,lh:43, rx:75,ry:51,cx:94, cy:92,  hr:42,hx:172,hy:83,  er:5,  edx:6,edy:-16, sdx:31,sdy:12,srx:21,sry:18, es:1.06,sh:74},
    {lw:28,lh:45, rx:81,ry:54,cx:96, cy:90,  hr:43,hx:175,hy:81,  er:4.6,edx:6,edy:-15, sdx:31,sdy:13,srx:21,sry:18, es:1.1, sh:78},
    {lw:30,lh:48, rx:90,ry:61,cx:100,cy:85,  hr:47,hx:178,hy:77,  er:4,  edx:7,edy:-14, sdx:30,sdy:14,srx:20,sry:19, es:1.16,sh:86}
  ][gr];
  let lw=G.lw, rx=G.rx, ry=G.ry;
  const lh=G.lh, cx=G.cx, cy=G.cy, hr=G.hr, hx=G.hx, hy=G.hy,
        er=G.er, es=G.es, sh=G.sh;

  if(quant>0){ rx = rx*(1-quant*0.012); ry = ry*(1-quant*0.02); }
  if(quant>=4) lw -= 3;
  if(p.wolke) ry = ry*1.06;
  if(liegt) rx = rx*1.04;                  /* im Liegen einen Hauch gemuetlicher */

  const base = p.farbe || "#f0a878";
  const c = quant>0 ? misch(base,"#e8e0d5",quant*0.08) : base;
  const d = schat(c,-34), h = schat(c,24), b = schat(c,-14);
  const kx = rx/66, ky = ry/45, k2 = v=>Math.round(v*100)/100;

  /* Beine (a=hinten links, b=hinten rechts, c=vorn links, d=vorn rechts) */
  const boden=156, legTop=boden-lh, huf=(lh>=30?10:8), hw=lw-6;
  const bein=(x,f)=>`<rect x="${rund(x)}" y="${legTop}" width="${lw}" height="${lh}" rx="${lw/2}" fill="${f}" stroke="#3d2412" stroke-width="4.5"/><path d="M${rund(x+3)} ${boden-huf} h${hw} v4 a${hw/2} ${hw/2} 0 01-${hw} 0 z" fill="#3d2412"/>`;
  const bx1=cx-0.45*rx-lw/2, bx2=cx+0.70*rx-lw/2, bx3=cx-0.15*rx-lw/2, bx4=cx+0.48*rx-lw/2;
  const beine1 = (p.wolke||liegt) ? "" : `<g class="bein a">${bein(bx1,b)}</g><g class="bein b">${bein(bx2,b)}</g>`;
  const beine2 = (p.wolke||liegt) ? "" : `<g class="bein c">${bein(bx3,c)}</g><g class="bein d">${bein(bx4,c)}</g>`;

  /* Liegepose: Bauch satt auf der Bodenlinie; zwei Vorderklauen-Nubsis
     lugen unterm Brustansatz hervor (hinter dem Rumpf gezeichnet) */
  const dy = liegt ? Math.round(boden-(cy+ry)) : 0;
  let nubsis="";
  if(liegt){
    const ns=Math.max(.55,Math.min(1.15,kx));
    const nub=x=>`<g transform="translate(${rund(x)},${rund(cy+ry-3)}) scale(${k2(ns)})"><rect x="-9" y="-5.5" width="18" height="11" rx="5.5" fill="${c}" stroke="#3d2412" stroke-width="${rund(4/ns)}"/><path d="M1 1 v3.5" stroke="#3d2412" stroke-width="2.4" stroke-linecap="round"/></g>`;
    nubsis = nub(cx+rx*0.72)+nub(cx+rx*0.98);
  }

  /* Schatten bzw. Wolke (API-Mietschwein) */
  const stern=(x,y,s,f)=>`<path d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z" transform="translate(${rund(x)},${rund(y)}) scale(${s})" fill="${f}" opacity=".9"/>`;
  let schatten, wolkeG="";
  if(p.wolke){
    schatten = `<ellipse cx="${cx}" cy="165" rx="${rund(sh*0.8)}" ry="5" fill="#000" opacity=".1"/>`;
    const cyc = cy+ry-3;
    const we = `<ellipse cx="${rund(cx-rx*0.52)}" cy="${rund(cyc+12)}" rx="${rund(rx*0.34)}" ry="13"/><ellipse cx="${rund(cx+rx*0.5)}" cy="${rund(cyc+13)}" rx="${rund(rx*0.33)}" ry="12.5"/><ellipse cx="${cx}" cy="${rund(cyc+8)}" rx="${rund(rx*0.5)}" ry="17"/>`;
    wolkeG = `<g fill="#fff" stroke="#3d2412" stroke-width="4.5">${we}</g><g fill="#fff">${we}</g>`
      + stern(Math.max(10,cx-rx-6), cy-6, 1.1, "#ffd84d")
      + stern(cx+rx*0.3, cy-ry-16, .8, "#fff")
      + stern(cx-rx*0.5, Math.min(cy+ry+20,162), .9, "#ffd84d");
  } else if(liegt){
    schatten = `<ellipse cx="${rund(cx+10*kx)}" cy="154" rx="${rund(Math.min(sh*1.25,110))}" ry="6" fill="#000" opacity=".17"/>`;
  } else {
    schatten = `<ellipse cx="${rund(cx+18*kx)}" cy="154" rx="${sh}" ry="9" fill="#000" opacity=".17"/>`;
  }

  /* Borstenkamm (nur gr5) und Schulterbuckel (gr4+5), hinter dem Rumpf */
  let borsten="";
  if(gr===5){
    const pts=[]; for(let i=0;i<=6;i++){ const f=-0.62+i*0.12; pts.push([cx+f*rx, cy-ry*Math.sqrt(1-f*f)]); }
    let dd="M"+rund(pts[0][0])+" "+rund(pts[0][1]+8);
    for(let i=0;i<6;i++){ dd+=" L"+rund((pts[i][0]+pts[i+1][0])/2)+" "+rund(Math.min(pts[i][1],pts[i+1][1])-9)+" L"+rund(pts[i+1][0])+" "+rund(pts[i+1][1]+8); }
    dd+=" z";
    borsten=`<path d="${dd}" fill="${d}" stroke="#3d2412" stroke-width="3.5" stroke-linejoin="round"/>`;
  }
  const buckel = gr>=4 ? `<ellipse cx="${rund(cx+rx*0.28)}" cy="${rund(cy-ry*0.82)}" rx="${rund(rx*0.4)}" ry="${rund(ry*0.42)}" fill="${c}" stroke="#3d2412" stroke-width="5"/>` : "";

  /* Ringelschwanz (Wrapper-g traegt die Position, Pfad behaelt den Klassen-Hook) */
  const ts = Math.max(.5, Math.min(1.15, kx));
  const ringel = `<path class="schwanzringel" d="M0 0 q-16 -6 -14 -20 q10 10 16 4" fill="none" stroke="#3d2412" stroke-width="${rund(5/ts)}" stroke-linecap="round"/>`;
  const schwanz = liegt
    ? `<g transform="translate(${rund(cx-rx+3)},${rund(cy+ry*0.75)}) rotate(46) scale(${k2(ts)})">${ringel}</g>` /* Ringel ruht entspannt tief am Rumpf */
    : `<g transform="translate(${rund(cx-rx+6)},${rund(cy-12*ky)}) scale(${k2(ts)})">${ringel}</g>`;

  /* Muster: gemeinsamer Helfer (liefert fuer punkte/fleck/band exakt die
     bisherigen Strings; dazu Zucht-Symbolmuster + optionale musterFarbe) */
  const muster = p.muster ? musterAuf(cx,cy,rx,ry,d,p.muster,p.musterFarbe) : "";

  /* MoE: bunte Experten-Flicken in zwei harmonischen Toenen */
  let moe="";
  if(p.moe){
    const m1=misch(c,"#e8a23c",.5), m2=misch(c,"#8f6ad0",.45);
    moe=`<g opacity=".8">`+[[-0.5,-0.22,.21,.16,-14,m1],[0.08,-0.46,.17,.13,10,m2],[0.42,0.08,.19,.14,-8,m1],[-0.18,0.3,.17,.13,16,m2],[-0.62,0.26,.13,.1,-18,m1]].map(f=>{
      const x=rund(cx+f[0]*rx), y=rund(cy+f[1]*ry);
      return `<ellipse cx="${x}" cy="${y}" rx="${rund(f[2]*rx)}" ry="${rund(f[3]*ry)}" transform="rotate(${f[4]} ${x} ${y})" fill="${f[5]}"/>`;
    }).join("")+`</g>`;
  }

  /* Rippen-Andeutung bei maximaler Verkleinerung */
  let rippen="";
  if(quant>=6){
    rippen=`<g stroke="${d}" stroke-width="3" fill="none" opacity=".32" stroke-linecap="round">`+[0,1,2].map(i=>`<path d="M${rund(cx+14*kx-i*15*kx)} ${rund(cy-ry*0.22)} q${rund(-6*kx)} ${rund(ry*0.28)} ${rund(1*kx)} ${rund(ry*0.5)}"/>`).join("")+`</g>`;
  }

  /* Agenten-Tool: Sattel + Bauch- UND Brustgurt + Emblem */
  let geschirr="";
  if(p.geschirrZ){
    const emr = 17*Math.max(0.62, Math.min(kx,1.15));
    const emx = rund(cx+6*kx), emy = rund(cy-34*ky);
    geschirr = `<g transform="translate(${cx},${cy}) scale(${k2(kx)} ${k2(ky)})">
      <path d="M-14 -8 q-12 32 -2 52" fill="none" stroke="#6e421f" stroke-width="8" stroke-linecap="round"/>
      <path d="M36 -20 q24 12 34 34" fill="none" stroke="#6e421f" stroke-width="8" stroke-linecap="round"/>
      <path d="M-30 -38 q34 -20 72 4 l-7 26 q-30 -16 -60 -3 z" fill="#8f5a30" stroke="#3d2412" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M-22 -14 q28 -12 56 2" fill="none" stroke="#f0c060" stroke-width="5" stroke-linecap="round"/>
    </g>
    <circle cx="${emx}" cy="${emy}" r="${rund(emr)}" fill="#fff6e0" stroke="#3d2412" stroke-width="4"/>
    <text x="${emx}" y="${rund(emy+emr*0.36)}" font-size="${rund(emr)}" text-anchor="middle">${p.geschirrZ}</text>`;
  }

  /* Ohr, bei zustand<45 nach vorn gekippt; LoRA-Adapter haengen am Ohr */
  const adap = p.adapter||0;
  const tags = adap>0 ? `<rect x="-2" y="-59" width="9" height="13" rx="2.5" transform="rotate(-16 2.5 -52.5)" fill="#4fc8e8" stroke="#3d2412" stroke-width="2.5"/><circle cx="2.5" cy="-55.5" r="1.7" fill="#fff"/>${adap>1?`<rect x="7" y="-50" width="9" height="13" rx="2.5" transform="rotate(14 11.5 -43.5)" fill="#9b6dd6" stroke="#3d2412" stroke-width="2.5"/><circle cx="11.5" cy="-46.5" r="1.7" fill="#fff"/>`:""}` : "";
  const ohrInhalt = `<path d="M-16 -42 q2 -26 24 -22 q4 18 -2 28 z" fill="${b}" stroke="#3d2412" stroke-width="${rund(4.5/es)}" stroke-linejoin="round"/>${tags}`;
  const ohr = `<g transform="translate(${hx},${hy}) scale(${es})">${traurig?`<g transform="rotate(52 -8 -37)">${ohrInhalt}</g>`:ohrInhalt}</g>`;

  /* Kopfbedeckung (1 Strohhut, 2 Zylinder, 3 Krone) am kalibrierten
     Kronen-Anker; hutAuf klemmt die Skalierung gegen den oberen Rand */
  const krone = hut>0 ? hutAuf(hut,hx,hy,hr) : "";

  /* Kopf, Hauer (gr4/5), Ruessel, Gesicht */
  const snx=hx+G.sdx, sny=hy+G.sdy, srx=G.srx, sry=G.sry;
  const ex=hx+G.edx, ey=hy+G.edy;
  const t2 = gr===5 ? 1.4 : 1;
  const hauerH = gr>=4 ? `<path d="M0 0 q7 -3 9 -13 q-5 0 -8 5 q-2 4 -1 8 z" transform="translate(${rund(snx+srx*0.35)},${rund(sny+sry*0.55)}) scale(${t2})" fill="#e9d8bd" stroke="#3d2412" stroke-width="${rund(3.2/t2)}" stroke-linejoin="round"/>` : "";
  const hauerV = gr>=4 ? `<path d="M0 0 q-9 -4 -10 -16 q6 1 9 7 q3 5 1 9 z" transform="translate(${rund(snx-srx*0.55)},${rund(sny+sry*0.75)}) scale(${t2})" fill="#fff6e0" stroke="#3d2412" stroke-width="${rund(3.2/t2)}" stroke-linejoin="round"/>` : "";
  const mundX=rund(hx-hr*0.2), mundY=rund(hy+hr*0.6);
  const mund = traurig
    ? `<path d="M${mundX} ${mundY} q${rund(hr*0.24)} 1 ${rund(hr*0.46)} 0" fill="none" stroke="#3d2412" stroke-width="3.5" stroke-linecap="round"/>`
    : `<path d="M${mundX} ${mundY} q${rund(hr*0.25)} ${rund(hr*0.2)} ${rund(hr*0.5)} ${rund(hr*0.075)}" fill="none" stroke="#3d2412" stroke-width="3.5" stroke-linecap="round"/>`;

  /* Denkblase */
  let denkt="";
  if(p.denkt){
    const s = p.denkt>1 ? 1.25 : 1;
    const bx = Math.min(hx+20,192), by = Math.max(hy-hr-24*s,18);
    const mx = rund((hx+14+bx)/2+2), my = rund((hy-hr+3+by)/2+4);
    const we2 = `<ellipse cx="${rund(bx-11*s)}" cy="${rund(by+3*s)}" rx="${rund(9*s)}" ry="${rund(6.5*s)}"/><ellipse cx="${rund(bx+11*s)}" cy="${rund(by+3.5*s)}" rx="${rund(9.5*s)}" ry="${rund(6.8*s)}"/><ellipse cx="${bx}" cy="${rund(by)}" rx="${rund(14*s)}" ry="${rund(10*s)}"/>`;
    const dots = p.denkt>1 ? `<circle cx="${rund(bx-7*s)}" cy="${rund(by+1)}" r="2.1" fill="#3d2412"/><circle cx="${bx}" cy="${rund(by+1)}" r="2.1" fill="#3d2412"/><circle cx="${rund(bx+7*s)}" cy="${rund(by+1)}" r="2.1" fill="#3d2412"/>` : "";
    denkt = `<g${p.denkt===1?' opacity=".82"':""}><circle cx="${rund(hx+14)}" cy="${rund(hy-hr+3)}" r="2.6" fill="#fff" stroke="#3d2412" stroke-width="2.4"/><circle cx="${mx}" cy="${my}" r="3.8" fill="#fff" stroke="#3d2412" stroke-width="2.6"/><g fill="#fff" stroke="#3d2412" stroke-width="3">${we2}</g><g fill="#fff">${we2}</g>${dots}</g>`;
  }

  return `<svg class="rumpf" viewBox="0 0 230 172" width="100%" aria-hidden="true">
  ${schatten}
  ${wolkeG}${liegt?`<g transform="translate(0,${dy})">`:""}
  ${borsten}${buckel}
  ${beine1}${nubsis}
  ${schwanz}
  <ellipse cx="${cx}" cy="${cy}" rx="${rund(rx)}" ry="${rund(ry)}" fill="${c}" stroke="#3d2412" stroke-width="5"/>
  <ellipse cx="${rund(cx-4*kx)}" cy="${rund(cy+14*ky)}" rx="${rund(rx*0.67)}" ry="${rund(ry*0.47)}" fill="${h}" opacity=".5"/>
  ${muster}${moe}${rippen}
  ${beine2}
  ${geschirr}
  ${ohr}
  ${krone}
  <circle cx="${hx}" cy="${hy}" r="${hr}" fill="${c}" stroke="#3d2412" stroke-width="5"/>
  ${hauerH}
  <ellipse cx="${snx}" cy="${sny}" rx="${srx}" ry="${sry}" fill="${h}" stroke="#3d2412" stroke-width="4.5"/>
  ${hauerV}
  <ellipse cx="${rund(snx-srx*0.25)}" cy="${sny-1}" rx="${rund(srx*0.15)}" ry="${rund(sry*0.26)}" fill="#3d2412"/><ellipse cx="${rund(snx+srx*0.25)}" cy="${sny+2}" rx="${rund(srx*0.15)}" ry="${rund(sry*0.26)}" fill="#3d2412"/>
  <circle cx="${ex}" cy="${ey}" r="${er}" fill="#3d2412"/><circle cx="${rund(ex+er*0.4)}" cy="${rund(ey-er*0.4)}" r="${rund(er*0.38)}" fill="#fff"/>
  <rect class="lid" x="${rund(ex-er-1)}" y="${rund(ey-er-1)}" width="${rund(2*er+2)}" height="${rund(2*er+1)}" rx="3" fill="${c}"/>${liegt?schlummerWimper(ex,ey,er):""}
  <ellipse cx="${rund(hx-hr*0.5)}" cy="${rund(hy+hr*0.33)}" rx="${rund(hr*0.22)}" ry="${rund(hr*0.15)}" fill="#ff9ba8" opacity=".45"/>
  ${mund}
  ${denkt}${liegt?"</g>":""}
</svg>`;
}

/* ------------------------------------------------------------
   szeneSvg(opt) - Wiese und Himmel, ohne Gebaeude (die kommen
   als DOM-Elemente). 8 helle Trampelpfad-Flecken markieren die
   Bauplaetze. opt: {solar:0-4, teich:false}
   ------------------------------------------------------------ */
function szeneSvg(opt={}){
  const solar = Math.max(0, Math.min(4, opt.solar||0));
  const baum=(x,y,s,f1,f2)=>`<g transform="translate(${x},${y}) scale(${s})"><rect x="-5" y="-14" width="10" height="22" rx="3" fill="#6b4423"/><path d="M0 -78 L26 -30 L14 -30 L34 4 L-34 4 L-14 -30 L-26 -30 Z" fill="${f1}"/><path d="M0 -78 L26 -30 L8 -30 L20 4 L-2 4 Z" fill="${f2}" opacity=".45"/></g>`;
  const busch=(x,y,s,f)=>`<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="-14" cy="0" rx="18" ry="14" fill="${f}"/><ellipse cx="14" cy="2" rx="16" ry="12" fill="${f}"/><ellipse cx="0" cy="-8" rx="20" ry="16" fill="${f}"/></g>`;
  const halm=(x,y,s,f)=>`<path d="M0 0 q-3 -12 -9 -18 M0 0 q1 -14 -1 -22 M0 0 q4 -12 10 -17" transform="translate(${x},${y}) scale(${s})" stroke="${f}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  const blume=(x,y,s,f)=>`<g transform="translate(${x},${y}) scale(${s})"><path d="M0 0 v-14" stroke="#4e9c46" stroke-width="3" stroke-linecap="round"/><g fill="${f}"><circle cx="0" cy="-20" r="5.5"/><circle cx="-7" cy="-15" r="5"/><circle cx="7" cy="-15" r="5"/><circle cx="-4" cy="-25" r="5"/><circle cx="4" cy="-25" r="5"/></g><circle cx="0" cy="-20" r="3.2" fill="#ffd84d"/></g>`;
  const zaun=(x,y,w)=>`<g transform="translate(${x},${y})"><rect x="0" y="-4" width="${w}" height="9" rx="4" fill="#c98a52" stroke="#4a2c15" stroke-width="4"/><rect x="0" y="18" width="${w}" height="9" rx="4" fill="#b87b46" stroke="#4a2c15" stroke-width="4"/><rect x="-7" y="-22" width="16" height="62" rx="6" fill="#d29a63" stroke="#4a2c15" stroke-width="4"/></g>`;
  const panel=i=>`<g transform="translate(${i*92},${i*6})"><rect x="0" y="0" width="78" height="46" rx="5" fill="url(#glas)" stroke="#4a2c15" stroke-width="5" transform="skewX(-12)"/><rect x="30" y="44" width="9" height="26" fill="#7d8b97" stroke="#4a2c15" stroke-width="4"/></g>`;
  const pfad=(x,y)=>{
    const s = 0.55 + (y-260)/640;
    const stiel = y<780 ? `<path d="M${x} ${rund(y+14*s)} q${rund(18*s)} ${rund(30*s)} ${rund(6*s)} ${rund(60*s)}" stroke="#d3b988" stroke-width="${rund(11*s)}" fill="none" stroke-linecap="round" opacity=".5"/>` : "";
    return `<g opacity=".55"><ellipse cx="${x}" cy="${y}" rx="${rund(78*s)}" ry="${rund(20*s)}" fill="#cdb27e" opacity=".55"/><ellipse cx="${x}" cy="${y}" rx="${rund(56*s)}" ry="${rund(13*s)}" fill="#dcc394" opacity=".7"/>${stiel}</g>`;
  };
  const spots=[[200,330],[455,300],[700,285],[950,300],[1200,330],[1420,395],[260,835],[1340,860]];
  const teich = opt.teich ? `<g transform="translate(950,712)">
    <ellipse cx="0" cy="2" rx="150" ry="46" fill="#c9b189" opacity=".8"/>
    <ellipse cx="0" cy="0" rx="132" ry="38" fill="url(#glas)" stroke="#4a2c15" stroke-width="6"/>
    <path d="M-70 -8 q30 -10 62 -2 M-30 12 q26 8 58 0" stroke="#bdeafc" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
    <ellipse cx="46" cy="-14" rx="15" ry="7" fill="#6fbf5a" stroke="#4a2c15" stroke-width="3.5"/>
    <g transform="translate(-116,-24)"><path d="M0 0 q-4 -26 -2 -44 M12 4 q2 -30 8 -46" stroke="#3f8f3f" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="-3" cy="-48" rx="4" ry="10" fill="#7a4a26" stroke="#4a2c15" stroke-width="3"/><ellipse cx="19" cy="-46" rx="4" ry="10" fill="#7a4a26" stroke="#4a2c15" stroke-width="3"/></g>
  </g>` : "";
  return `<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" width="100%" height="100%" aria-hidden="true">
<defs>
<linearGradient id="himmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd7f7"/><stop offset=".55" stop-color="#c4ecfb"/><stop offset="1" stop-color="#e8f7e0"/></linearGradient>
<linearGradient id="wiese" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ec95a"/><stop offset=".45" stop-color="#6bbd4c"/><stop offset="1" stop-color="#4e9c3e"/></linearGradient>
<radialGradient id="sonne"><stop offset="0" stop-color="#fff6c8" stop-opacity=".95"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient>
<linearGradient id="glas" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5ec8ec"/><stop offset=".5" stop-color="#2f89bd"/><stop offset="1" stop-color="#5ec8ec"/></linearGradient>
</defs>
<rect width="1600" height="900" fill="url(#himmel)"/>
<circle cx="1330" cy="90" r="190" fill="url(#sonne)"/><circle cx="1330" cy="90" r="52" fill="#fff3b0"/>
<g class="wolken">
  <g fill="#fff" opacity=".92"><ellipse cx="250" cy="110" rx="62" ry="34"/><ellipse cx="310" cy="122" rx="48" ry="26"/><ellipse cx="196" cy="126" rx="44" ry="24"/></g>
  <g fill="#fff" opacity=".75"><ellipse cx="880" cy="80" rx="46" ry="24"/><ellipse cx="925" cy="90" rx="36" ry="19"/><ellipse cx="840" cy="92" rx="32" ry="17"/></g>
</g>
<path d="M0 300 q150 -110 320 -40 q120 50 250 -20 q150 -80 300 10 q160 80 330 -10 q120 -60 400 20 V420 H0 Z" fill="#9fd0a8" opacity=".8"/>
<path d="M0 340 q200 -80 380 -10 q160 60 300 0 q180 -70 360 10 q180 70 560 -10 V430 H0 Z" fill="#7fbd85"/>
<g>${Array.from({length:26},(_,i)=>baum(30+i*62+((i%3)*11),372,.62+((i*37)%9)/26,"#4d9350","#2f6d3a")).join("")}</g>
<path d="M0 360 h1600 v70 H0 Z" fill="#5aa74b" opacity=".35"/>
<path d="M0 392 q400 -34 800 -6 q400 28 800 -12 V900 H0 Z" fill="url(#wiese)"/>
<path d="M0 470 q380 -40 760 -8 q420 34 840 -18 V560 H0 Z" fill="#8ad467" opacity=".33"/>
<ellipse cx="380" cy="720" rx="420" ry="120" fill="#8ad467" opacity=".2"/>
<ellipse cx="1280" cy="640" rx="330" ry="90" fill="#8ad467" opacity=".16"/>
<g>${spots.map(s=>pfad(s[0],s[1])).join("")}</g>
${solar>0?`<g transform="translate(430,300)">${Array.from({length:solar},(_,i)=>panel(i)).join("")}</g>`:""}
<g>${Array.from({length:14},(_,i)=>zaun(i*124,410+Math.sin(i/2)*6,124)).join("")}</g>
<g>${Array.from({length:58},(_,i)=>{const x=(i*97+((i*53)%80))%1590;const y=470+((i*137)%400);return halm(x,y,.8+((i*31)%10)/16,"#3f8f3f")}).join("")}</g>
<g>${Array.from({length:16},(_,i)=>blume((i*211+90)%1560,540+((i*173)%330),.9+((i*17)%6)/10,["#ff8fb0","#ffd84d","#ffffff","#c68cf0"][i%4])).join("")}</g>
${teich}
${busch(60,860,1.5,"#4e9c46")}${busch(1520,820,1.4,"#4e9c46")}${busch(760,884,1.2,"#57a84c")}
</svg>`;
}

/* ------------------------------------------------------------
   radarSvg(w, w2, opt) - 7-Achsen-Radar.
   Achsen: logik, code, wissen, schreiben, werkzeug, treue, kontext
   Werte 0-99. w2 optional als gestrichelte Vorschau.
   opt: {size:230, leer:false}
   ------------------------------------------------------------ */
function radarSvg(w, w2, opt={}){
  const groesse = opt.size||230;
  const achsen=[["logik","Logik"],["code","Code"],["wissen","Wissen"],["schreiben","Stil"],["werkzeug","Werkzeug"],["treue","Treue"],["kontext","Kontext"]];
  const N=7, R=84, RL=97;
  const punkt=(k,r)=>{ const a=-Math.PI/2+k*2*Math.PI/N; return [rund(Math.cos(a)*r), rund(Math.sin(a)*r)]; };
  const poly=vals=>achsen.map((ac,k)=>{ const v=Math.max(0,Math.min(99,(vals&&vals[ac[0]])||0)); return punkt(k,R*v/99).join(","); }).join(" ");
  const gitter=[1,2/3,1/3].map((f,i)=>{
    const pts=achsen.map((_,k)=>punkt(k,R*f).join(",")).join(" ");
    return i===0 ? `<polygon points="${pts}" fill="#c9b189" fill-opacity=".12" stroke="#c9b189" stroke-width="1.5"/>`
                 : `<polygon points="${pts}" fill="none" stroke="#c9b189" stroke-width="1.5"/>`;
  }).join("");
  const linien=achsen.map((_,k)=>{ const e=punkt(k,R); return `<line x1="0" y1="0" x2="${e[0]}" y2="${e[1]}" stroke="#c9b189" stroke-width="1.5"/>`; }).join("");
  const labels=achsen.map((ac,k)=>{
    const a=-Math.PI/2+k*2*Math.PI/N, cs=Math.cos(a);
    let x=Math.cos(a)*RL, y=Math.sin(a)*RL, anker;
    const br=ac[1].length*6.5;
    if(Math.abs(cs)<0.5){ anker="middle"; y += (y>0? 13 : -8); }
    else if(cs>0){ anker="start"; x+=3; if(x+br>121) x=121-br; y+=4; }
    else { anker="end"; x-=3; if(x-br<-121) x=-121+br; y+=4; }
    y=Math.max(-114,Math.min(118,y));
    return `<text x="${rund(x)}" y="${rund(y)}" font-size="11" font-weight="900" fill="#3d2412" text-anchor="${anker}">${ac[1]}</text>`;
  }).join("");
  const flaechen = opt.leer ? "" :
    (w?`<polygon points="${poly(w)}" fill="rgba(107,189,76,.45)" stroke="#4e9c3e" stroke-width="3" stroke-linejoin="round"/>`:"")+
    (w2?`<polygon points="${poly(w2)}" fill="rgba(74,144,217,.22)" stroke="#4a90d9" stroke-width="3" stroke-dasharray="6 4" stroke-linejoin="round"/>`:"");
  return `<svg viewBox="-125 -125 250 250" width="${groesse}" height="${groesse}" aria-hidden="true">${gitter}${linien}${flaechen}${labels}</svg>`;
}

/* ------------------------------------------------------------
   gpuSvg(tier) - kleine GPU-Karte; ab tier 5 ein Server-Rack
   mit blinkenden Status-Punkten (SMIL, ohne CSS).
   ------------------------------------------------------------ */
function gpuSvg(tier){
  const t = Math.max(0, tier||0);
  const fan=(x,y,r)=>{
    const fl=[0,120,240].map(a=>`<ellipse cx="${x}" cy="${rund(y-r*0.45)}" rx="${rund(r*0.3)}" ry="${rund(r*0.5)}" transform="rotate(${a} ${x} ${y})"/>`).join("");
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#245c30" stroke="#3d2412" stroke-width="2.5"/><g fill="#8fd49a">${fl}</g><circle cx="${x}" cy="${y}" r="${rund(r*0.28)}" fill="#3d2412"/>`;
  };
  if(t>=5){
    const slots=[0,1,2,3].map(i=>`<rect x="21.5" y="${6.5+i*8}" width="21" height="5.5" rx="2" fill="#55636f" stroke="#3d2412" stroke-width="1.8"/><circle cx="39.5" cy="${rund(6.5+i*8+2.75)}" r="1.8" fill="#6ef2a0"><animate attributeName="opacity" values="1;.15;1" dur="1.3s" begin="${rund(-i*0.33)}s" repeatCount="indefinite"/></circle>`).join("");
    return `<svg viewBox="0 0 64 40" width="100%" aria-hidden="true"><rect x="14" y="36" width="36" height="3" rx="1.5" fill="#2b333c"/><rect x="17" y="2.5" width="30" height="35" rx="4" fill="#39434e" stroke="#3d2412" stroke-width="3"/>${slots}</svg>`;
  }
  if(t>=3){
    return `<svg viewBox="0 0 64 40" width="100%" aria-hidden="true">
      <rect x="3" y="6.5" width="58" height="25" rx="4.5" fill="#3f9a4e" stroke="#3d2412" stroke-width="3"/>
      <rect x="9" y="30.5" width="22" height="6" rx="1.5" fill="#f0c060" stroke="#3d2412" stroke-width="2"/>
      <path d="M15 31 v5 M21 31 v5 M27 31 v5" stroke="#3d2412" stroke-width="1.4"/>
      <rect x="7.5" y="11" width="11" height="10" rx="2" fill="#2f6d3a" stroke="#3d2412" stroke-width="2.2"/>
      ${fan(31,19,7.5)}${fan(49.5,19,7.5)}
    </svg>`;
  }
  return `<svg viewBox="0 0 64 40" width="100%" aria-hidden="true">
    <rect x="3" y="9" width="58" height="21" rx="4" fill="#3f9a4e" stroke="#3d2412" stroke-width="3"/>
    <rect x="9" y="29" width="24" height="6" rx="1.5" fill="#f0c060" stroke="#3d2412" stroke-width="2"/>
    <path d="M15 29.5 v5 M21 29.5 v5 M27 29.5 v5" stroke="#3d2412" stroke-width="1.4"/>
    <rect x="10" y="13" width="13" height="11" rx="2" fill="#2f6d3a" stroke="#3d2412" stroke-width="2.2"/>
    ${fan(46,19.5,8)}
  </svg>`;
}

/* ------------------------------------------------------------
   wolkeMiniSvg() - kleines Wolken-Icon fuer Listen.
   Doppelt gemalt: erst Kontur-Silhouette, dann Fuellung.
   ------------------------------------------------------------ */
function wolkeMiniSvg(){
  const e=`<ellipse cx="12" cy="20" rx="8.5" ry="6.5"/><ellipse cx="36" cy="20.5" rx="8.5" ry="6"/><ellipse cx="23.5" cy="14.5" rx="11.5" ry="9"/>`;
  return `<svg viewBox="0 0 48 30" width="100%" aria-hidden="true"><g fill="#fff" stroke="#3d2412" stroke-width="3">${e}</g><g fill="#fff">${e}</g></svg>`;
}

/* ---- Ab hier: Tierarten-Erweiterung (Huhn, Kuh, Esel, Dino) ---- */

/* ------------------------------------------------------------
   Gemeinsame Bausteine fuer alle Tierarten (nur String-Builder).
   pigSvg bleibt unveraendert; diese Helfer replizieren dessen
   Feature-Bloecke parametrisiert.
   ------------------------------------------------------------ */
function sternchen(x,y,s,f){
  return `<path d="M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z" transform="translate(${rund(x)},${rund(y)}) scale(${s})" fill="${f}" opacity=".9"/>`;
}

/* Wolkensockel: schwacher Schwebe-Schatten + Wolke unter dem Koerper + Sterne */
function wolkeUnter(cx,cy,rx,ry){
  const cyc = Math.min(cy+ry-3, 143);
  const we = `<ellipse cx="${rund(cx-rx*0.52)}" cy="${rund(cyc+12)}" rx="${rund(rx*0.34)}" ry="13"/><ellipse cx="${rund(cx+rx*0.5)}" cy="${rund(cyc+13)}" rx="${rund(rx*0.33)}" ry="12.5"/><ellipse cx="${rund(cx)}" cy="${rund(cyc+8)}" rx="${rund(rx*0.5)}" ry="17"/>`;
  return `<ellipse cx="${rund(cx)}" cy="165" rx="${rund(rx*0.9)}" ry="5" fill="#000" opacity=".1"/>`
    + `<g fill="#fff" stroke="#3d2412" stroke-width="4.5">${we}</g><g fill="#fff">${we}</g>`
    + sternchen(Math.max(10,cx-rx-8), cy-6, 1.1, "#ffd84d")
    + sternchen(cx+rx*0.3, Math.max(8,cy-ry-16), .8, "#fff")
    + sternchen(cx-rx*0.5, Math.min(cy+ry+20,162), .9, "#ffd84d");
}

/* Denkblase wie beim Schwein (stufe 1 dezent, 2 groesser mit Punkten) */
function denkBlase(hx,hy,hr,stufe){
  if(!stufe) return "";
  const s = stufe>1 ? 1.25 : 1;
  const bx = Math.min(hx+20,192), by = Math.max(hy-hr-24*s,18);
  const mx = rund((hx+14+bx)/2+2), my = rund((hy-hr+3+by)/2+4);
  const we = `<ellipse cx="${rund(bx-11*s)}" cy="${rund(by+3*s)}" rx="${rund(9*s)}" ry="${rund(6.5*s)}"/><ellipse cx="${rund(bx+11*s)}" cy="${rund(by+3.5*s)}" rx="${rund(9.5*s)}" ry="${rund(6.8*s)}"/><ellipse cx="${bx}" cy="${rund(by)}" rx="${rund(14*s)}" ry="${rund(10*s)}"/>`;
  const dots = stufe>1 ? `<circle cx="${rund(bx-7*s)}" cy="${rund(by+1)}" r="2.1" fill="#3d2412"/><circle cx="${bx}" cy="${rund(by+1)}" r="2.1" fill="#3d2412"/><circle cx="${rund(bx+7*s)}" cy="${rund(by+1)}" r="2.1" fill="#3d2412"/>` : "";
  return `<g${stufe===1?' opacity=".82"':""}><circle cx="${rund(hx+14)}" cy="${rund(hy-hr+3)}" r="2.6" fill="#fff" stroke="#3d2412" stroke-width="2.4"/><circle cx="${mx}" cy="${my}" r="3.8" fill="#fff" stroke="#3d2412" stroke-width="2.6"/><g fill="#fff" stroke="#3d2412" stroke-width="3">${we}</g><g fill="#fff">${we}</g>${dots}</g>`;
}

/* MoE-Expertenflicken in zwei harmonischen Toenen */
function moeFlecken(cx,cy,rx,ry,c){
  const m1=misch(c,"#e8a23c",.5), m2=misch(c,"#8f6ad0",.45);
  return `<g opacity=".8">`+[[-0.5,-0.22,.21,.16,-14,m1],[0.08,-0.46,.17,.13,10,m2],[0.42,0.08,.19,.14,-8,m1],[-0.18,0.3,.17,.13,16,m2],[-0.62,0.26,.13,.1,-18,m1]].map(f=>{
    const x=rund(cx+f[0]*rx), y=rund(cy+f[1]*ry);
    return `<ellipse cx="${x}" cy="${y}" rx="${rund(f[2]*rx)}" ry="${rund(f[3]*ry)}" transform="rotate(${f[4]} ${x} ${y})" fill="${f[5]}"/>`;
  }).join("")+`</g>`;
}

/* Fellmuster punkte/fleck/band + Zucht-Symbolmuster quadrate/dreiecke/
   hexagone, auf beliebige Koerpermasse skaliert. mf = optionale
   Symbolfarbe (Vererbungssystem); ohne mf dunkler Koerperton d wie bisher. */
function musterAuf(cx,cy,rx,ry,d,art,mf){
  const kx=rx/66, ky=ry/45, k2=v=>Math.round(v*100)/100, sk=(kx+ky)/2, f=mf||d;
  if(art==="punkte") return `<g fill="${f}" opacity="${mf?".6":".5"}">`+[[-26,-20,15,11],[16,-28,10,8],[-44,8,9,7],[28,10,8,6]].map(q=>`<ellipse cx="${rund(cx+q[0]*kx)}" cy="${rund(cy+q[1]*ky)}" rx="${rund(q[2]*kx)}" ry="${rund(q[3]*ky)}"/>`).join("")+`</g>`;
  if(art==="fleck") return `<path d="M-58 -2 q22 -36 54 -28 q-15 23 -13 46 q-27 6 -41 -18 z" transform="translate(${cx},${cy}) scale(${k2(kx)} ${k2(ky)})" fill="${f}" opacity="${mf?".6":".42"}"/>`;
  if(art==="band") return `<path d="M4 -44 q10 44 2 88 q-16 2 -26 -2 q9 -44 1 -84 z" transform="translate(${cx},${cy}) scale(${k2(kx)} ${k2(ky)})" fill="${f}" opacity="${mf?".6":".4"}"/>`;
  if(art==="quadrate"){
    /* verspielt rotierte, abgerundete Quadrate; Streuung wie punkte */
    return `<g fill="${f}" opacity="${mf?".6":".5"}">`+[[-26,-20,10.5,-12],[16,-28,7.5,16],[-44,8,6.5,8],[28,10,7,-18]].map(q=>{
      const s=rund(q[2]*sk);
      return `<rect x="${rund(-s)}" y="${rund(-s)}" width="${rund(2*s)}" height="${rund(2*s)}" rx="${rund(s*0.55)}" transform="translate(${rund(cx+q[0]*kx)},${rund(cy+q[1]*ky)}) rotate(${q[3]})"/>`;
    }).join("")+`</g>`;
  }
  if(art==="dreiecke"){
    /* runde Ecken ueber fetten stroke in Fuellfarbe */
    return `<g fill="${f}" stroke="${f}" stroke-width="4" stroke-linejoin="round" opacity="${mf?".6":".5"}">`+[[-26,-20,11,0],[16,-28,8.5,140],[-44,8,7,-110],[28,10,7.5,40]].map(q=>{
      const s=q[2]*sk;
      return `<path d="M0 ${rund(-s)} L${rund(s*0.87)} ${rund(s*0.5)} L${rund(-s*0.87)} ${rund(s*0.5)} z" transform="translate(${rund(cx+q[0]*kx)},${rund(cy+q[1]*ky)}) rotate(${q[3]})"/>`;
    }).join("")+`</g>`;
  }
  if(art==="hexagone"){
    /* seltene Zucht-Mutation: Mini-Wabenpaar + Solo-Sechseck */
    const hexP=r=>{const w=rund(r*0.87), h2=rund(r*0.5); return `M0 ${rund(-r)} L${w} ${-h2} L${w} ${h2} L0 ${rund(r)} L${-w} ${h2} L${-w} ${-h2} z`;};
    const einz=(x,y,r,a)=>`<path d="${hexP(r)}" transform="translate(${rund(x)},${rund(y)}) rotate(${a})"/>`;
    const r1=8*sk, r2=6.5*sk;
    return `<g fill="${f}" stroke="${f}" stroke-width="3" stroke-linejoin="round" opacity="${mf?".6":".55"}">`
      + `<g transform="translate(${rund(cx-24*kx)},${rund(cy-16*ky)}) rotate(8)">${einz(-r1*0.95,0,r1*0.92,0)}${einz(r1*0.95,0,r1*0.92,0)}</g>`
      + einz(cx+26*kx, cy+8*ky, r2, 22)
      + `</g>`;
  }
  return "";
}

/* Rippen-Andeutung bei quant 6 */
function rippchen(cx,cy,rx,ry,d){
  const kx=rx/66;
  return `<g stroke="${d}" stroke-width="3" fill="none" opacity=".32" stroke-linecap="round">`+[0,1,2].map(i=>`<path d="M${rund(cx+14*kx-i*15*kx)} ${rund(cy-ry*0.22)} q${rund(-6*kx)} ${rund(ry*0.28)} ${rund(1*kx)} ${rund(ry*0.5)}"/>`).join("")+`</g>`;
}

/* Geschlossene Wimpernlinie fuer die Liegepose; liegt ueber dem Lid,
   das die Engine per .liegt .lid{transform:scaleY(1)} zuklappt */
function schlummerWimper(ex,ey,er){
  return `<path d="M${rund(ex-er)} ${rund(ey+er*0.2)} q${rund(er)} ${rund(er*0.9)} ${rund(er*2)} 0" fill="none" stroke="#3d2412" stroke-width="3" stroke-linecap="round"/>`;
}

/* Goldkrone, Skalierung geklemmt gegen den oberen Rand */
function kroneAuf(hx,hy,hr){
  const ks = Math.min(hr/40, (hy-2)/82), k2=Math.round(ks*100)/100;
  return `<g transform="translate(${hx},${hy}) scale(${k2})"><path d="M-46 -64 l10 -18 l12 12 l12 -14 l6 22 z" fill="#f5c451" stroke="#3d2412" stroke-width="${rund(4/ks)}" stroke-linejoin="round"/></g>`;
}

/* Strohhut im Kronen-Anker: exakt derselbe Transform-Vertrag wie
   kroneAuf (Kronen-Box lokal x -46..-6, Unterkante ~-63, Spitzen
   bis -84; geklemmte Skalierung, Outline 4/ks). Breite flache
   Krempe, hellere Kuppel, braunes Hutband, feine Stroh-Strichel. */
function strohhutAuf(hx,hy,hr){
  const ks = Math.min(hr/40, (hy-2)/82), k2=Math.round(ks*100)/100, sw=rund(4/ks);
  return `<g transform="translate(${hx},${hy}) scale(${k2})">`
    + `<ellipse cx="-26" cy="-63" rx="22" ry="7" fill="#e8c96a" stroke="#3d2412" stroke-width="${sw}"/>`
    + `<path d="M-40 -63 a14 16 0 0 1 28 0 v1 a14 5.5 0 0 1 -28 0 z" fill="#f2dc8f" stroke="#3d2412" stroke-width="${sw}" stroke-linejoin="round"/>`
    + `<path d="M-39.2 -65.5 h26.5" stroke="#8a5a33" stroke-width="5"/>`
    + `<path d="M-45 -61.5 l4 -2 M-11 -61 l4 -2 M-33 -72 q2 -4 6 -5" fill="none" stroke="#b99742" stroke-width="${rund(2/ks)}" stroke-linecap="round"/>`
    + `</g>`;
}

/* Zylinder im Kronen-Anker: schmale Krempe, leicht konischer Hut,
   Glanzlicht-Streifen links, rotes Band am Ansatz. Deckel-Oberkante
   bei -83.9, wie die hoechste Kronenspitze (-84) - die geklemmte
   Skalierung passt also unveraendert. Gleicher Vertrag wie kroneAuf. */
function zylinderAuf(hx,hy,hr){
  const ks = Math.min(hr/40, (hy-2)/82), k2=Math.round(ks*100)/100, sw=rund(4/ks);
  return `<g transform="translate(${hx},${hy}) scale(${k2})">`
    + `<ellipse cx="-26" cy="-63" rx="16" ry="5.5" fill="#3a3f4a" stroke="#3d2412" stroke-width="${sw}"/>`
    + `<path d="M-36.5 -63 L-35 -80.5 h18 L-15.5 -63 a10.5 4.4 0 0 1 -21 0 z" fill="#3a3f4a" stroke="#3d2412" stroke-width="${sw}" stroke-linejoin="round"/>`
    + `<path d="M-36 -66 h20" stroke="#c0392b" stroke-width="5"/>`
    + `<path d="M-32.8 -70 L-32.1 -78" stroke="#5a6172" stroke-width="3.2" stroke-linecap="round"/>`
    + `<ellipse cx="-26" cy="-80.5" rx="9" ry="3.4" fill="#454b57" stroke="#3d2412" stroke-width="${sw}"/>`
    + `</g>`;
}

/* Kopfbedeckungs-Verteiler: stufe 1 Strohhut, 2 Zylinder, 3 Krone */
function hutAuf(stufe,hx,hy,hr){
  if(stufe===1) return strohhutAuf(hx,hy,hr);
  if(stufe===2) return zylinderAuf(hx,hy,hr);
  if(stufe===3) return kroneAuf(hx,hy,hr);
  return "";
}

/* Rundes weisses Emblem mit Emoji-Durchreiche */
function emblemAuf(x,y,r,z){
  return `<circle cx="${rund(x)}" cy="${rund(y)}" r="${rund(r)}" fill="#fff6e0" stroke="#3d2412" stroke-width="4"/><text x="${rund(x)}" y="${rund(y+r*0.36)}" font-size="${rund(r)}" text-anchor="middle">${z}</text>`;
}

/* LoRA-Adapter-Pins, lokal um den Ursprung; Aufrufer positioniert per <g> */
function adapterPins(n){
  if(!n) return "";
  return `<rect x="-4" y="-7" width="9" height="13" rx="2.5" transform="rotate(-16 0.5 -0.5)" fill="#4fc8e8" stroke="#3d2412" stroke-width="2.5"/><circle cx="0.5" cy="-3.5" r="1.7" fill="#fff"/>`
    + (n>1?`<rect x="6" y="-1" width="9" height="13" rx="2.5" transform="rotate(14 10.5 5.5)" fill="#9b6dd6" stroke="#3d2412" stroke-width="2.5"/><circle cx="11.5" cy="2.5" r="1.7" fill="#fff"/>`:"");
}

/* Klassisches Agenten-Tool (Sattel + Bauch- und Brustgurt + Emblem), wie beim Schwein */
function geschirrKlassisch(cx,cy,kx,ky,z){
  const k2=v=>Math.round(v*100)/100;
  const emr = 17*Math.max(0.62, Math.min(kx,1.15));
  return `<g transform="translate(${cx},${cy}) scale(${k2(kx)} ${k2(ky)})">
    <path d="M-14 -8 q-12 32 -2 52" fill="none" stroke="#6e421f" stroke-width="8" stroke-linecap="round"/>
    <path d="M36 -20 q24 12 34 34" fill="none" stroke="#6e421f" stroke-width="8" stroke-linecap="round"/>
    <path d="M-30 -38 q34 -20 72 4 l-7 26 q-30 -16 -60 -3 z" fill="#8f5a30" stroke="#3d2412" stroke-width="4.5" stroke-linejoin="round"/>
    <path d="M-22 -14 q28 -12 56 2" fill="none" stroke="#f0c060" stroke-width="5" stroke-linecap="round"/>
  </g>` + emblemAuf(cx+6*kx, cy-34*ky, emr, z);
}

/* ------------------------------------------------------------
   huhnSvg(p, opt) - Huhn. Zwei Beine (Hooks bein a + b),
   Schwanzfedern tragen den schwanzringel-Hook.
   gr: Kueken -> Junghenne -> Henne -> fette Henne -> Hahn -> Prachthahn.
   ------------------------------------------------------------ */
function huhnSvg(p, opt={}){
  p = p || {};
  const gr = Math.max(0, Math.min(5, Math.round(p.gr==null ? 2 : p.gr)));
  const quant = Math.max(0, Math.min(6, p.quant||0));
  const traurig = (p.zustand==null ? 100 : p.zustand) < 45;
  const liegt = !!opt.liegt && !p.wolke;
  const hut = opt.hut||(opt.krone?3:0);
  const T = [
    {lw:7, lh:14, rx:27,ry:22,cx:104,cy:124, hr:20,hx:123,hy:96, er:6.6,edx:3,edy:-3, kamm:0, ts:.5,  bs:.6},
    {lw:9, lh:20, rx:40,ry:33,cx:104,cy:111, hr:23,hx:138,hy:77, er:5.2,edx:4,edy:-4, kamm:1, ts:.7,  bs:.8},
    {lw:11,lh:24, rx:52,ry:42,cx:104,cy:103, hr:26,hx:148,hy:68, er:5,  edx:5,edy:-5, kamm:1, ts:1,   bs:1},
    {lw:13,lh:24, rx:62,ry:48,cx:104,cy:100, hr:27,hx:154,hy:66, er:5,  edx:5,edy:-5, kamm:1, ts:1.05,bs:1},
    {lw:12,lh:32, rx:56,ry:45,cx:102,cy:94,  hr:27,hx:154,hy:55, er:4.8,edx:5,edy:-4, kamm:2, ts:.95, bs:1.1},
    {lw:14,lh:36, rx:70,ry:52,cx:108,cy:90,  hr:29,hx:166,hy:46, er:4.4,edx:6,edy:-4, kamm:2, ts:1.15,bs:1.25}
  ][gr];
  let lw=T.lw, rx=T.rx, ry=T.ry;
  const cx=T.cx, cy=T.cy, hr=T.hr, hx=T.hx, hy=T.hy, er=T.er, lh=T.lh;
  if(quant>0){ rx=rx*(1-quant*0.012); ry=ry*(1-quant*0.02); }
  if(quant>=4) lw=Math.max(5,lw-2);
  if(p.wolke) ry=ry*1.06;
  if(liegt){ rx=rx*1.06; ry=ry*1.04; }    /* Glucke plustert sich bauschig auf */
  const c = quant>0 ? misch(p.farbe||"#f5e5c8","#e8e0d5",quant*0.08) : (p.farbe||"#f5e5c8");
  const d=schat(c,-34), h=schat(c,24), b=schat(c,-14);

  /* Beine: orange Staender mit Drumstick-Dicke und flachem Fuss */
  const beinH=x=>`<rect x="${rund(x)}" y="${156-lh}" width="${lw}" height="${lh-6}" rx="${lw/2}" fill="#f2ae4a" stroke="#3d2412" stroke-width="4"/><rect x="${rund(x-5)}" y="149" width="${lw+13}" height="7" rx="3.5" fill="#f2ae4a" stroke="#3d2412" stroke-width="4"/><path d="M${rund(x+lw*0.5)} 150 v4 M${rund(x+lw*0.5+5)} 150 v4" stroke="#3d2412" stroke-width="1.8"/>`;
  const beine = (p.wolke||liegt) ? "" : `<g class="bein a">${beinH(cx-0.34*rx-lw/2)}</g><g class="bein b">${beinH(cx+0.14*rx-lw/2)}</g>`;
  const schatten = p.wolke ? wolkeUnter(cx,cy,rx,ry)
    : liegt ? `<ellipse cx="${rund(cx+6)}" cy="154" rx="${rund((rx+14)*1.25)}" ry="5.5" fill="#000" opacity=".17"/>`
    : `<ellipse cx="${rund(cx+8)}" cy="154" rx="${rund(rx+14)}" ry="8" fill="#000" opacity=".17"/>`;

  /* Glucken-Pose: Beine ganz im Gefieder, Bauch auf der Bodenlinie,
     kleine Bogenlinien deuten das aufgeplusterte Brustgefieder an */
  const dy = liegt ? Math.round(156-(cy+ry)) : 0;
  const brust = liegt ? `<g stroke="#3d2412" stroke-width="3" fill="none" opacity=".3" stroke-linecap="round"><path d="M${rund(cx-rx*0.36)} ${rund(cy+ry*0.64)} q${rund(rx*0.12)} ${rund(ry*0.14)} ${rund(rx*0.27)} ${rund(ry*0.07)}"/><path d="M${rund(cx-rx*0.02)} ${rund(cy+ry*0.78)} q${rund(rx*0.11)} ${rund(ry*0.12)} ${rund(rx*0.25)} ${rund(ry*0.05)}"/><path d="M${rund(cx+rx*0.36)} ${rund(cy+ry*0.62)} q${rund(rx*0.1)} ${rund(ry*0.13)} ${rund(rx*0.23)} ${rund(ry*0.06)}"/></g>` : "";

  /* Schwanz: Federfaecher (Hennen-Petalen bzw. Hahnensicheln) */
  let federn;
  if(gr>=4){
    const sichel=(a,f)=>`<path d="M0 0 q-20 -4 -27 -19 q-4 -9 -3 -17 q7 3 12 10 q9 11 22 17 z" transform="rotate(${a})" fill="${f}" stroke="#3d2412" stroke-width="3.5" stroke-linejoin="round"/>`;
    federn = sichel(-38,d)+sichel(-16,b)+sichel(4,schat(c,-50))+sichel(22,h);
  } else {
    const feder=(a,f)=>`<ellipse cx="-15" cy="0" rx="15" ry="6" transform="rotate(${a})" fill="${f}" stroke="#3d2412" stroke-width="3.5"/>`;
    federn = feder(46,d)+feder(22,b)+feder(2,d);
  }
  const schwanz=`<g transform="translate(${rund(cx-rx+(gr>=4?26:12))},${rund(cy-ry*0.32)}) scale(${T.ts})"><g class="schwanzringel">${federn}</g></g>`;

  /* Kamm (klein/gross), bei Kummer seitlich umgeklappt */
  let kamm="";
  if(T.kamm){
    const ks=T.kamm===2?1.1:.55;
    const ke=`<circle cx="-9" cy="-3" r="6"/><circle cx="0" cy="-7" r="7.5"/><circle cx="9" cy="-2" r="6"/>`;
    const inner=`<g fill="#e8574a" stroke="#3d2412" stroke-width="4">${ke}</g><g fill="#e8574a">${ke}</g>`;
    kamm=`<g transform="translate(${hx-2},${rund(hy-hr+2)}) scale(${ks})">${traurig?`<g transform="rotate(38 0 4)">${inner}</g>`:inner}</g>`;
  }
  const kehllappen = T.kamm===2 ? `<ellipse cx="${rund(hx+hr*0.38)}" cy="${rund(hy+hr*0.82)}" rx="5" ry="7.5" fill="#e8574a" stroke="#3d2412" stroke-width="3.5"/><ellipse cx="${rund(hx+hr*0.62)}" cy="${rund(hy+hr*0.78)}" rx="5.5" ry="8.5" fill="#e8574a" stroke="#3d2412" stroke-width="3.5"/>` : "";

  /* Schnabel: froehlich leicht geoeffnet, traurig zu und gesenkt */
  const schnabel=`<g transform="translate(${rund(hx+hr*0.72)},${rund(hy+hr*0.08)}) scale(${T.bs})${traurig?" rotate(12)":""}"><path d="M0 -7 L19 0 L0 5 z" fill="#f2ae4a" stroke="#3d2412" stroke-width="4" stroke-linejoin="round"/>${traurig?"":`<path d="M1 5 L14 3 L2 10 z" fill="#e69a38" stroke="#3d2412" stroke-width="3.5" stroke-linejoin="round"/>`}</g>`;

  const fluff = gr===0 ? `<path d="M${hx-6} ${rund(hy-hr+2)} q-2 -7 -7 -8 M${hx} ${rund(hy-hr)} q0 -8 -3 -11 M${hx+6} ${rund(hy-hr+2)} q3 -6 8 -7" stroke="#3d2412" stroke-width="3" fill="none" stroke-linecap="round"/>` : "";
  const fluegel=`<ellipse cx="${rund(cx+2)}" cy="${rund(cy+ry*0.05)}" rx="${rund(rx*0.48)}" ry="${rund(ry*0.34)}" transform="rotate(-16 ${rund(cx+2)} ${rund(cy+ry*0.05)})" fill="${b}" stroke="#3d2412" stroke-width="4.5"/><path d="M${rund(cx-rx*0.28)} ${rund(cy+ry*0.1)} q14 6 30 4 M${rund(cx-rx*0.3)} ${rund(cy+ry*0.26)} q12 5 26 3" stroke="#3d2412" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>`;

  let geschirr="";
  if(p.geschirrZ){
    const gs=Math.max(.62,Math.min(1,rx/52));
    geschirr=`<path d="M${rund(cx+6)} ${rund(cy-ry+2)} q-16 ${rund(ry*0.9)} -5 ${rund(ry*1.75)}" fill="none" stroke="#6e421f" stroke-width="7" stroke-linecap="round"/><path d="M${rund(cx+rx*0.3)} ${rund(cy-ry*0.45)} q${rund(rx*0.35)} ${rund(ry*0.2)} ${rund(rx*0.5)} ${rund(ry*0.55)}" fill="none" stroke="#6e421f" stroke-width="7" stroke-linecap="round"/>`
      + emblemAuf(cx+rx*0.52, cy+ry*0.05, 14*gs, p.geschirrZ);
  }
  const pins = p.adapter ? `<g transform="translate(${rund(hx-hr*0.55)},${rund(hy-hr*0.72)}) scale(.85)">${adapterPins(p.adapter)}</g>` : "";
  const ex=hx+T.edx, ey=hy+T.edy;

  return `<svg class="rumpf" viewBox="0 0 230 172" width="100%" aria-hidden="true">
  ${schatten}${liegt?`<g transform="translate(0,${dy})">`:""}
  ${schwanz}
  ${beine}
  <ellipse cx="${cx}" cy="${cy}" rx="${rund(rx)}" ry="${rund(ry)}" fill="${c}" stroke="#3d2412" stroke-width="5"/>
  <ellipse cx="${rund(cx-2)}" cy="${rund(cy+ry*0.3)}" rx="${rund(rx*0.6)}" ry="${rund(ry*0.42)}" fill="${h}" opacity=".5"/>
  ${musterAuf(cx,cy,rx,ry,d,p.muster,p.musterFarbe)}${p.moe?moeFlecken(cx,cy,rx,ry,c):""}${quant>=6?rippchen(cx,cy,rx,ry,d):""}
  ${fluegel}${brust}
  ${geschirr}
  ${kamm}
  ${hut>0?hutAuf(hut,hx,hy,hr):""}
  <circle cx="${hx}" cy="${hy}" r="${hr}" fill="${c}" stroke="#3d2412" stroke-width="5"/>
  ${kehllappen}
  ${schnabel}
  <circle cx="${ex}" cy="${ey}" r="${er}" fill="#3d2412"/><circle cx="${rund(ex+er*0.4)}" cy="${rund(ey-er*0.4)}" r="${rund(er*0.38)}" fill="#fff"/>
  <rect class="lid" x="${rund(ex-er-1)}" y="${rund(ey-er-1)}" width="${rund(2*er+2)}" height="${rund(2*er+1)}" rx="3" fill="${c}"/>${liegt?schlummerWimper(ex,ey,er):""}
  <ellipse cx="${rund(hx-hr*0.4)}" cy="${rund(hy+hr*0.42)}" rx="${rund(hr*0.24)}" ry="${rund(hr*0.16)}" fill="#ff9ba8" opacity=".45"/>
  ${fluff}
  ${pins}
  ${denkBlase(hx,hy,hr,p.denkt||0)}${liegt?"</g>":""}
</svg>`;
}

/* ------------------------------------------------------------
   kuhSvg(p, opt) - Kuh. Vier Beine (a-d), erhobener Wedelschwanz
   mit Quaste (schwanzringel-Hook), Hoerner wachsen mit gr,
   Euter nur gr2-3, gr5 ist ein Bulle mit Buckel.
   ------------------------------------------------------------ */
function kuhSvg(p, opt={}){
  p = p || {};
  const gr = Math.max(0, Math.min(5, Math.round(p.gr==null ? 2 : p.gr)));
  const quant = Math.max(0, Math.min(6, p.quant||0));
  const traurig = (p.zustand==null ? 100 : p.zustand) < 45;
  const liegt = !!opt.liegt && !p.wolke;
  const hut = opt.hut||(opt.krone?3:0);
  const T = [
    {lw:14,lh:24, rx:36,ry:27,cx:94, cy:118, hr:28,hx:138,hy:96, er:7,  edx:2,edy:-8,  mrx:15,mry:11,mdx:18,mdy:9,  hs:0,   es:.62, euter:0},
    {lw:18,lh:32, rx:50,ry:36,cx:93, cy:103, hr:32,hx:149,hy:87, er:5.6,edx:4,edy:-11, mrx:18,mry:13,mdx:20,mdy:11, hs:.45, es:.8,  euter:0},
    {lw:23,lh:40, rx:64,ry:44,cx:92, cy:96,  hr:37,hx:162,hy:82, er:5,  edx:5,edy:-14, mrx:22,mry:16,mdx:23,mdy:13, hs:.7,  es:1,   euter:1},
    {lw:26,lh:43, rx:74,ry:50,cx:94, cy:92,  hr:39,hx:169,hy:79, er:5,  edx:5,edy:-14, mrx:23,mry:17,mdx:24,mdy:14, hs:1,   es:1.05,euter:1},
    {lw:28,lh:45, rx:80,ry:54,cx:96, cy:90,  hr:41,hx:173,hy:77, er:4.6,edx:5,edy:-13, mrx:24,mry:17,mdx:25,mdy:14, hs:1.35,es:1.1, euter:0},
    {lw:30,lh:48, rx:89,ry:60,cx:100,cy:85,  hr:45,hx:177,hy:74, er:4.2,edx:6,edy:-13, mrx:26,mry:19,mdx:26,mdy:16, hs:1.8, es:1.15,euter:0}
  ][gr];
  let lw=T.lw, rx=T.rx, ry=T.ry;
  /* im Liegen bleibt der Kopf wach oben, der Hals sinkt nur minimal */
  const lh=T.lh, cx=T.cx, cy=T.cy, hr=T.hr, hx=T.hx, hy=T.hy+(liegt?3:0), er=T.er, es=T.es;
  if(quant>0){ rx=rx*(1-quant*0.012); ry=ry*(1-quant*0.02); }
  if(quant>=4) lw -= 3;
  if(p.wolke) ry=ry*1.06;
  const c = quant>0 ? misch(p.farbe||"#f2ead8","#e8e0d5",quant*0.08) : (p.farbe||"#f2ead8");
  const d=schat(c,-34), h=schat(c,24), b=schat(c,-14);
  const kx=rx/66, ky=ry/45;

  const boden=156, legTop=boden-lh, huf=(lh>=30?10:8), hw=lw-6;
  const bein=(x,f)=>`<rect x="${rund(x)}" y="${legTop}" width="${lw}" height="${lh}" rx="${lw/2}" fill="${f}" stroke="#3d2412" stroke-width="4.5"/><path d="M${rund(x+3)} ${boden-huf} h${hw} v4 a${hw/2} ${hw/2} 0 01-${hw} 0 z" fill="#3d2412"/>`;
  const beine1 = (p.wolke||liegt) ? "" : `<g class="bein a">${bein(cx-0.45*rx-lw/2,b)}</g><g class="bein b">${bein(cx+0.70*rx-lw/2,b)}</g>`;
  const beine2 = (p.wolke||liegt) ? "" : `<g class="bein c">${bein(cx-0.15*rx-lw/2,c)}</g><g class="bein d">${bein(cx+0.48*rx-lw/2,c)}</g>`;
  const schatten = p.wolke ? wolkeUnter(cx,cy,rx,ry)
    : liegt ? `<ellipse cx="${rund(cx+10*kx)}" cy="154" rx="${rund(Math.min((rx+16)*1.25,110))}" ry="6" fill="#000" opacity=".17"/>`
    : `<ellipse cx="${rund(cx+18*kx)}" cy="154" rx="${rund(rx+16)}" ry="9" fill="#000" opacity=".17"/>`;

  /* Wiederkaeuer-Ruhe: Beine untergeschlagen, vorn ein gefaltetes
     Knie mit Klaue sichtbar; Bauch auf der Bodenlinie */
  const dy = liegt ? Math.round(boden-(cy+ry)) : 0;
  let knie="";
  if(liegt){
    const ns=Math.round(Math.max(.55,Math.min(1.1,kx))*100)/100;
    knie=`<g transform="translate(${rund(cx+rx*0.42)},${rund(cy+ry-6)}) scale(${ns})"><rect x="-17" y="-6.5" width="32" height="13" rx="6.5" fill="${c}" stroke="#3d2412" stroke-width="${rund(4.5/ns)}"/><rect x="6" y="-4" width="7" height="8" rx="3" fill="#3d2412"/></g>`;
  }

  /* erhobener Wedelschwanz mit Quaste, Ansatz unten rechts der eigenen Box;
     im Liegen ruht er flach am Boden hinter dem Rumpf */
  const tS=Math.min(1.15, Math.max(.55, rx/70), (cx-rx*0.88-3)/23);
  const tL=Math.min(tS, (cx-rx*0.88-4)/30);
  const schwanz = liegt
    ? `<g transform="translate(${rund(cx-rx*0.88)},${rund(cy+ry-4)}) scale(${Math.round(tL*100)/100})"><g class="schwanzringel"><path d="M0 -3 q-9 2 -18 3" fill="none" stroke="#3d2412" stroke-width="${rund(4.5/tL)}" stroke-linecap="round"/><ellipse cx="-22" cy="0" rx="7" ry="4.5" transform="rotate(-10 -22 0)" fill="${d}" stroke="#3d2412" stroke-width="${rund(3.2/tL)}"/></g></g>`
    : `<g transform="translate(${rund(cx-rx*0.88)},${rund(cy-ry*0.42)}) scale(${Math.round(tS*100)/100})"><g class="schwanzringel"><path d="M0 0 q-11 -2 -15 -10 q-2 -4 -2 -8" fill="none" stroke="#3d2412" stroke-width="${rund(4.5/tS)}" stroke-linecap="round"/><ellipse cx="-18" cy="-20" rx="5" ry="7.5" transform="rotate(-38 -18 -20)" fill="${d}" stroke="#3d2412" stroke-width="${rund(3.2/tS)}"/></g></g>`;

  const buckel = gr===5 ? `<ellipse cx="${rund(cx+rx*0.28)}" cy="${rund(cy-ry*0.82)}" rx="${rund(rx*0.4)}" ry="${rund(ry*0.42)}" fill="${c}" stroke="#3d2412" stroke-width="5"/>` : "";

  /* Hoerner: fern (gespiegelt, dunkler) und nah, vor dem Kopf gezeichnet */
  const hornP=`<path d="M-3 2 q-10 -8 -8 -20 q9 0 14 8 q4 7 -3 12 z" stroke="#3d2412" stroke-linejoin="round"/>`;
  const hoerner = T.hs>0 ? `<g transform="translate(${rund(hx+hr*0.3)},${rund(hy-hr*0.62)}) scale(${T.hs})" fill="#f4e3c2" stroke-width="${rund(4/T.hs)}">${hornP}</g><g transform="translate(${rund(hx-hr*0.42)},${rund(hy-hr*0.6)}) scale(${-T.hs} ${T.hs})" fill="#e6d2ab" stroke-width="${rund(4/T.hs)}">${hornP}</g>` : "";

  /* seitliches Ohr, haengt bei Kummer */
  const ohrRot = traurig ? 42 : -18;
  const ohr=`<g transform="translate(${rund(hx-hr*0.88)},${rund(hy-hr*0.28)}) rotate(${ohrRot}) scale(${es})"><ellipse cx="-9" cy="0" rx="13" ry="7.5" fill="${b}" stroke="#3d2412" stroke-width="${rund(4/es)}"/><ellipse cx="-8" cy="0" rx="7" ry="4" fill="#f0c8cc" opacity=".8"/></g>`;

  const euter = (T.euter && !p.wolke) ? (liegt
    /* im Liegen lugt das Euter seitlich hervor, Zitzen kurz, nichts sinkt in den Boden */
    ? `<g><ellipse cx="${rund(cx-rx*0.3)}" cy="${rund(cy+ry*0.72)}" rx="${rund(rx*0.24)}" ry="${rund(ry*0.2)}" fill="#f7bfc7" stroke="#3d2412" stroke-width="4"/><rect x="${rund(cx-rx*0.4)}" y="${rund(cy+ry*0.84)}" width="5" height="7" rx="2.5" fill="#f7bfc7" stroke="#3d2412" stroke-width="3"/><rect x="${rund(cx-rx*0.26)}" y="${rund(cy+ry*0.86)}" width="5" height="7" rx="2.5" fill="#f7bfc7" stroke="#3d2412" stroke-width="3"/></g>`
    : `<g><ellipse cx="${rund(cx-rx*0.35)}" cy="${rund(cy+ry*0.8)}" rx="${rund(rx*0.24)}" ry="${rund(ry*0.26)}" fill="#f7bfc7" stroke="#3d2412" stroke-width="4"/><rect x="${rund(cx-rx*0.44)}" y="${rund(cy+ry*0.94)}" width="5" height="9" rx="2.5" fill="#f7bfc7" stroke="#3d2412" stroke-width="3"/><rect x="${rund(cx-rx*0.29)}" y="${rund(cy+ry*0.97)}" width="5" height="9" rx="2.5" fill="#f7bfc7" stroke="#3d2412" stroke-width="3"/></g>`) : "";

  const mx=hx+T.mdx, my=hy+T.mdy, mrx=T.mrx, mry=T.mry;
  const mund = traurig
    ? `<path d="M${rund(mx-mrx*0.5)} ${rund(my+mry*0.42)} q${rund(mrx*0.4)} 1 ${rund(mrx*0.85)} 0" fill="none" stroke="#3d2412" stroke-width="3.5" stroke-linecap="round"/>`
    : `<path d="M${rund(mx-mrx*0.5)} ${rund(my+mry*0.42)} q${rund(mrx*0.4)} ${rund(mry*0.32)} ${rund(mrx*0.88)} ${rund(mry*0.05)}" fill="none" stroke="#3d2412" stroke-width="3.5" stroke-linecap="round"/>`;
  const schopf=`<path d="M${rund(hx-hr*0.42)} ${rund(hy-hr*0.86)} q6 -8 14 -6 q8 -8 16 -2 q6 -4 10 2 q-18 10 -40 6 z" fill="${b}" stroke="#3d2412" stroke-width="3.5" stroke-linejoin="round"/>`;
  const pins = p.adapter ? `<g transform="translate(${rund(hx-hr*1.02)},${rund(hy-hr*0.42)}) scale(${Math.round(es*85)/100})">${adapterPins(p.adapter)}</g>` : "";
  const ex=hx+T.edx, ey=hy+T.edy;

  return `<svg class="rumpf" viewBox="0 0 230 172" width="100%" aria-hidden="true">
  ${schatten}${liegt?`<g transform="translate(0,${dy})">`:""}
  ${buckel}
  ${beine1}
  ${schwanz}
  <ellipse cx="${cx}" cy="${cy}" rx="${rund(rx)}" ry="${rund(ry)}" fill="${c}" stroke="#3d2412" stroke-width="5"/>
  <ellipse cx="${rund(cx-4*kx)}" cy="${rund(cy+14*ky)}" rx="${rund(rx*0.67)}" ry="${rund(ry*0.47)}" fill="${h}" opacity=".5"/>
  ${musterAuf(cx,cy,rx,ry,d,p.muster,p.musterFarbe)}${p.moe?moeFlecken(cx,cy,rx,ry,c):""}${quant>=6?rippchen(cx,cy,rx,ry,d):""}
  ${euter}
  ${beine2}${knie}
  ${p.geschirrZ?geschirrKlassisch(cx,cy,kx,ky,p.geschirrZ):""}
  ${hoerner}
  ${ohr}
  ${hut>0?hutAuf(hut,hx,hy,hr):""}
  <circle cx="${hx}" cy="${hy}" r="${hr}" fill="${c}" stroke="#3d2412" stroke-width="5"/>
  ${schopf}
  <ellipse cx="${rund(mx)}" cy="${rund(my)}" rx="${mrx}" ry="${mry}" fill="${h}" stroke="#3d2412" stroke-width="4.5"/>
  <ellipse cx="${rund(mx-mrx*0.35)}" cy="${rund(my-1)}" rx="2.7" ry="4.2" transform="rotate(-14 ${rund(mx-mrx*0.35)} ${rund(my-1)})" fill="#3d2412"/><ellipse cx="${rund(mx+mrx*0.3)}" cy="${rund(my+1)}" rx="2.7" ry="4.2" transform="rotate(-14 ${rund(mx+mrx*0.3)} ${rund(my+1)})" fill="#3d2412"/>
  <circle cx="${ex}" cy="${ey}" r="${er}" fill="#3d2412"/><circle cx="${rund(ex+er*0.4)}" cy="${rund(ey-er*0.4)}" r="${rund(er*0.38)}" fill="#fff"/>
  <rect class="lid" x="${rund(ex-er-1)}" y="${rund(ey-er-1)}" width="${rund(2*er+2)}" height="${rund(2*er+1)}" rx="3" fill="${c}"/>${liegt?schlummerWimper(ex,ey,er):""}
  <ellipse cx="${rund(hx-hr*0.48)}" cy="${rund(hy+hr*0.35)}" rx="${rund(hr*0.2)}" ry="${rund(hr*0.14)}" fill="#ff9ba8" opacity=".45"/>
  ${mund}
  ${pins}
  ${denkBlase(hx,hy,hr,p.denkt||0)}${liegt?"</g>":""}
</svg>`;
}

/* ------------------------------------------------------------
   eselSvg(p, opt) - Esel. Vier Beine (a-d), lange Ohren wachsen
   mit gr, dunkle Maehne, Wedelschwanz mit Quaste; gr5 ist ein
   sturer Maulesel mit Strohhut-Krempe (nur ohne Kopfbedeckung).
   ------------------------------------------------------------ */
function eselSvg(p, opt={}){
  p = p || {};
  const gr = Math.max(0, Math.min(5, Math.round(p.gr==null ? 2 : p.gr)));
  const quant = Math.max(0, Math.min(6, p.quant||0));
  const traurig = (p.zustand==null ? 100 : p.zustand) < 45;
  const liegt = !!opt.liegt && !p.wolke;
  const hut = opt.hut||(opt.krone?3:0);
  const T = [
    {lw:13,lh:30, rx:33,ry:24,cx:96,cy:112, hr:26,hx:137,hy:88, er:6.8,edx:1,edy:-8,  mrx:14,mry:9, mdx:20,mdy:8,  es:.85},
    {lw:16,lh:36, rx:45,ry:31,cx:94,cy:103, hr:30,hx:146,hy:82, er:5.6,edx:3,edy:-10, mrx:17,mry:11,mdx:23,mdy:10, es:.95},
    {lw:20,lh:42, rx:58,ry:39,cx:93,cy:97,  hr:34,hx:157,hy:78, er:5,  edx:4,edy:-12, mrx:20,mry:13,mdx:26,mdy:12, es:1.1},
    {lw:24,lh:44, rx:68,ry:46,cx:94,cy:93,  hr:37,hx:165,hy:76, er:5,  edx:4,edy:-12, mrx:22,mry:14,mdx:27,mdy:13, es:1.2},
    {lw:26,lh:46, rx:76,ry:51,cx:96,cy:90,  hr:39,hx:170,hy:74, er:4.6,edx:5,edy:-12, mrx:23,mry:15,mdx:28,mdy:13, es:1.35},
    {lw:29,lh:48, rx:86,ry:57,cx:99,cy:86,  hr:43,hx:176,hy:71, er:4.2,edx:5,edy:-12, mrx:25,mry:16,mdx:28,mdy:15, es:1.55}
  ][gr];
  let lw=T.lw, rx=T.rx, ry=T.ry;
  const lh=T.lh, cx=T.cx, cy=T.cy, hr=T.hr, hx=T.hx, hy=T.hy, er=T.er, es=T.es;
  if(quant>0){ rx=rx*(1-quant*0.012); ry=ry*(1-quant*0.02); }
  if(quant>=4) lw -= 3;
  if(p.wolke) ry=ry*1.06;
  const c = quant>0 ? misch(p.farbe||"#cfc3b4","#e8e0d5",quant*0.08) : (p.farbe||"#cfc3b4");
  const d=schat(c,-34), h=schat(c,24), b=schat(c,-14);
  const kx=rx/66, ky=ry/45, dunkel=schat(c,-56);

  const boden=156, legTop=boden-lh, huf=(lh>=30?10:8), hw=lw-6;
  const bein=(x,f)=>`<rect x="${rund(x)}" y="${legTop}" width="${lw}" height="${lh}" rx="${lw/2}" fill="${f}" stroke="#3d2412" stroke-width="4.5"/><path d="M${rund(x+3)} ${boden-huf} h${hw} v4 a${hw/2} ${hw/2} 0 01-${hw} 0 z" fill="#3d2412"/>`;
  const beine1 = (p.wolke||liegt) ? "" : `<g class="bein a">${bein(cx-0.45*rx-lw/2,b)}</g><g class="bein b">${bein(cx+0.70*rx-lw/2,b)}</g>`;
  const beine2 = (p.wolke||liegt) ? "" : `<g class="bein c">${bein(cx-0.15*rx-lw/2,c)}</g><g class="bein d">${bein(cx+0.48*rx-lw/2,c)}</g>`;
  const schatten = p.wolke ? wolkeUnter(cx,cy,rx,ry)
    : liegt ? `<ellipse cx="${rund(cx+10*kx)}" cy="154" rx="${rund(Math.min((rx+14)*1.25,110))}" ry="6" fill="#000" opacity=".17"/>`
    : `<ellipse cx="${rund(cx+18*kx)}" cy="154" rx="${rund(rx+14)}" ry="9" fill="#000" opacity=".17"/>`;

  /* Liegepose: Beine untergefaltet, vorn ein Knie-Nubsi; Bauch am Boden */
  const dy = liegt ? Math.round(boden-(cy+ry)) : 0;
  let knie="";
  if(liegt){
    const ns=Math.round(Math.max(.55,Math.min(1.1,kx))*100)/100;
    knie=`<g transform="translate(${rund(cx+rx*0.42)},${rund(cy+ry-6)}) scale(${ns})"><rect x="-17" y="-6.5" width="32" height="13" rx="6.5" fill="${c}" stroke="#3d2412" stroke-width="${rund(4.5/ns)}"/><rect x="6" y="-4" width="7" height="8" rx="3" fill="#3d2412"/></g>`;
  }

  const tS=Math.min(1.15, Math.max(.55, rx/70), (cx-rx*0.88-3)/23);
  const tL=Math.min(tS, (cx-rx*0.88-4)/30);
  const schwanz = liegt
    /* Schwanz ruht flach am Boden hinter dem Rumpf */
    ? `<g transform="translate(${rund(cx-rx*0.88)},${rund(cy+ry-4)}) scale(${Math.round(tL*100)/100})"><g class="schwanzringel"><path d="M0 -3 q-9 2 -18 3" fill="none" stroke="#3d2412" stroke-width="${rund(4.5/tL)}" stroke-linecap="round"/><ellipse cx="-22" cy="0" rx="7" ry="4.5" transform="rotate(-10 -22 0)" fill="${dunkel}" stroke="#3d2412" stroke-width="${rund(3.2/tL)}"/></g></g>`
    : `<g transform="translate(${rund(cx-rx*0.88)},${rund(cy-ry*0.42)}) scale(${Math.round(tS*100)/100})"><g class="schwanzringel"><path d="M0 0 q-11 -2 -15 -10 q-2 -4 -2 -8" fill="none" stroke="#3d2412" stroke-width="${rund(4.5/tS)}" stroke-linecap="round"/><ellipse cx="-18" cy="-20" rx="5" ry="7.5" transform="rotate(-38 -18 -20)" fill="${dunkel}" stroke="#3d2412" stroke-width="${rund(3.2/tS)}"/></g></g>`;

  /* lange Ohren: fernes und nahes, nach hinten geneigt; haengen bei Kummer */
  const ax=rund(hx-hr*0.12), ay=rund(hy-hr*0.55);
  const ohrP=(rot,f,inner)=>`<g transform="rotate(${rot})"><path d="M-7 0 q-5 -14 -1 -27 q2 -6 7 -6 q5 0 7 6 q3 13 -2 27 q-4 6 -11 0 z" fill="${f}" stroke="#3d2412" stroke-width="${rund(4/es)}" stroke-linejoin="round"/>${inner?`<path d="M-2 -6 q-2 -9 0 -17 q1 -4 3 -4 q2 0 3 4 q1 8 -1 17 q-2 4 -5 0 z" fill="#f0c8cc" opacity=".8"/>`:""}</g>`;
  /* im Liegen kippen die Ohren entspannt seitlich auseinander (nicht traurig-nach-vorn) */
  const ohren=`<g transform="translate(${ax},${ay}) scale(${es})">${ohrP(traurig?-80:(liegt?-70:-50),dunkel,false)}${ohrP(traurig?75:(liegt?-8:-34),b,true)}</g>`;

  /* Maehnenkamm als Silhouette hinter dem Kopf + Stirnschopf davor */
  const me=`<circle cx="${rund(hx-hr*0.72)}" cy="${rund(hy-hr*0.38)}" r="${rund(hr*0.24)}"/><circle cx="${rund(hx-hr*0.52)}" cy="${rund(hy-hr*0.64)}" r="${rund(hr*0.24)}"/><circle cx="${rund(hx-hr*0.26)}" cy="${rund(hy-hr*0.8)}" r="${rund(hr*0.23)}"/>`;
  const maehne=`<g fill="${dunkel}" stroke="#3d2412" stroke-width="3.5">${me}</g><g fill="${dunkel}">${me}</g>`;
  const schopf=`<ellipse cx="${rund(hx+hr*0.1)}" cy="${rund(hy-hr*0.78)}" rx="${rund(hr*0.3)}" ry="${rund(hr*0.16)}" transform="rotate(-14 ${rund(hx+hr*0.1)} ${rund(hy-hr*0.78)})" fill="${dunkel}" stroke="#3d2412" stroke-width="3.5"/>`;

  const eigenhut = (gr===5 && hut===0) ? `<g transform="translate(${hx+2},${rund(hy-hr*0.72)}) rotate(-6)"><ellipse cx="0" cy="0" rx="34" ry="9" fill="#edd08a" stroke="#3d2412" stroke-width="4"/><path d="M-16 -2 a16 11 0 0 1 32 0 v2 a16 6 0 0 1 -32 0 z" fill="#e3c273" stroke="#3d2412" stroke-width="4"/><path d="M-15 -4 h30" stroke="#b3452e" stroke-width="5"/></g>` : "";

  const mx=hx+T.mdx, my=hy+T.mdy, mrx=T.mrx, mry=T.mry;
  const mund = traurig
    ? `<path d="M${rund(mx-mrx*0.45)} ${rund(my+mry*0.45)} q${rund(mrx*0.4)} 1 ${rund(mrx*0.8)} 0" fill="none" stroke="#3d2412" stroke-width="3.5" stroke-linecap="round"/>`
    : `<path d="M${rund(mx-mrx*0.45)} ${rund(my+mry*0.45)} q${rund(mrx*0.38)} ${rund(mry*0.35)} ${rund(mrx*0.82)} ${rund(mry*0.06)}" fill="none" stroke="#3d2412" stroke-width="3.5" stroke-linecap="round"/>`;
  const braue = gr===5 ? `<path d="M${rund(hx+T.edx-8)} ${rund(hy+T.edy-er-7)} q6 -4 13 -2" fill="none" stroke="#3d2412" stroke-width="3" stroke-linecap="round"/>` : "";
  const pins = p.adapter ? `<g transform="translate(${rund(ax-14*es)},${rund(ay-14*es)}) scale(.9)">${adapterPins(p.adapter)}</g>` : "";
  const ex=hx+T.edx, ey=hy+T.edy;

  return `<svg class="rumpf" viewBox="0 0 230 172" width="100%" aria-hidden="true">
  ${schatten}${liegt?`<g transform="translate(0,${dy})">`:""}
  ${beine1}
  ${schwanz}
  <ellipse cx="${cx}" cy="${cy}" rx="${rund(rx)}" ry="${rund(ry)}" fill="${c}" stroke="#3d2412" stroke-width="5"/>
  <ellipse cx="${rund(cx-4*kx)}" cy="${rund(cy+14*ky)}" rx="${rund(rx*0.67)}" ry="${rund(ry*0.47)}" fill="${h}" opacity=".5"/>
  ${musterAuf(cx,cy,rx,ry,d,p.muster,p.musterFarbe)}${p.moe?moeFlecken(cx,cy,rx,ry,c):""}${quant>=6?rippchen(cx,cy,rx,ry,d):""}
  ${beine2}${knie}
  ${p.geschirrZ?geschirrKlassisch(cx,cy,kx,ky,p.geschirrZ):""}
  ${ohren}
  ${maehne}
  ${hut>0?hutAuf(hut,hx,hy,hr):""}
  <circle cx="${hx}" cy="${hy}" r="${hr}" fill="${c}" stroke="#3d2412" stroke-width="5"/>
  ${schopf}
  ${eigenhut}
  <ellipse cx="${rund(mx)}" cy="${rund(my)}" rx="${mrx}" ry="${mry}" fill="${h}" stroke="#3d2412" stroke-width="4.5"/>
  <path d="M${rund(mx-mrx*0.32)} ${rund(my-mry*0.25)} q-2 4 0 7 M${rund(mx+mrx*0.28)} ${rund(my-mry*0.15)} q-2 4 0 7" fill="none" stroke="#3d2412" stroke-width="3" stroke-linecap="round"/>
  ${braue}
  <circle cx="${ex}" cy="${ey}" r="${er}" fill="#3d2412"/><circle cx="${rund(ex+er*0.4)}" cy="${rund(ey-er*0.4)}" r="${rund(er*0.38)}" fill="#fff"/>
  <rect class="lid" x="${rund(ex-er-1)}" y="${rund(ey-er-1)}" width="${rund(2*er+2)}" height="${rund(2*er+1)}" rx="3" fill="${c}"/>${liegt?schlummerWimper(ex,ey,er):""}
  <ellipse cx="${rund(hx-hr*0.45)}" cy="${rund(hy+hr*0.35)}" rx="${rund(hr*0.2)}" ry="${rund(hr*0.14)}" fill="#ff9ba8" opacity=".45"/>
  ${mund}
  ${pins}
  ${denkBlase(hx,hy,hr,p.denkt||0)}${liegt?"</g>":""}
</svg>`;
}

/* ------------------------------------------------------------
   dinoSvg(p, opt) - kleiner freundlicher Cartoon-Dino
   (pummeliger T-Rex). Zwei Beine (a+b), dicker Schwanz mit
   schwanzringel-Hook, winzige Aermchen, Rueckenzacken ab gr3
   (volle Reihe bei gr5), gr0 schluepft mit Eierschalen-Resten.
   ------------------------------------------------------------ */
function dinoSvg(p, opt={}){
  p = p || {};
  const gr = Math.max(0, Math.min(5, Math.round(p.gr==null ? 2 : p.gr)));
  const quant = Math.max(0, Math.min(6, p.quant||0));
  const traurig = (p.zustand==null ? 100 : p.zustand) < 45;
  const liegt = !!opt.liegt && !p.wolke;
  const hut = opt.hut||(opt.krone?3:0);
  const T = [
    {lw:16,lh:16, rx:30,ry:26,cx:98, cy:118, hr:28,hx:128,hy:82, er:7.4,edx:2,edy:-6, ts:.55, zack:0, zaehne:0},
    {lw:18,lh:22, rx:38,ry:33,cx:98, cy:108, hr:30,hx:136,hy:72, er:6,  edx:3,edy:-7, ts:.7,  zack:0, zaehne:0},
    {lw:20,lh:26, rx:46,ry:41,cx:100,cy:102, hr:33,hx:143,hy:62, er:5.4,edx:4,edy:-8, ts:.9,  zack:0, zaehne:0},
    {lw:23,lh:28, rx:52,ry:46,cx:100,cy:98,  hr:36,hx:148,hy:58, er:5,  edx:4,edy:-9, ts:1.05,zack:1, zaehne:1},
    {lw:25,lh:30, rx:57,ry:50,cx:102,cy:95,  hr:39,hx:152,hy:55, er:4.8,edx:5,edy:-9, ts:1.2, zack:1, zaehne:1},
    {lw:28,lh:32, rx:63,ry:55,cx:104,cy:92,  hr:43,hx:157,hy:50, er:4.4,edx:6,edy:-9, ts:1.4, zack:2, zaehne:2}
  ][gr];
  let lw=T.lw, rx=T.rx, ry=T.ry;
  const lh=T.lh, cx=T.cx, cy=T.cy, hr=T.hr, hx=T.hx, hy=T.hy, er=T.er;
  if(quant>0){ rx=rx*(1-quant*0.012); ry=ry*(1-quant*0.02); }
  if(quant>=4) lw -= 3;
  if(p.wolke) ry=ry*1.06;
  const c = quant>0 ? misch(p.farbe||"#a8d8a0","#e8e0d5",quant*0.08) : (p.farbe||"#a8d8a0");
  const d=schat(c,-34), h=schat(c,24), b=schat(c,-14);

  const boden=156, legTop=boden-lh, huf=(lh>=30?10:8), hw=lw-6;
  const bein=(x,f)=>`<rect x="${rund(x)}" y="${legTop}" width="${lw}" height="${lh}" rx="${lw/2}" fill="${f}" stroke="#3d2412" stroke-width="4.5"/><path d="M${rund(x+3)} ${boden-huf} h${hw} v4 a${hw/2} ${hw/2} 0 01-${hw} 0 z" fill="#3d2412"/>`;
  const beine = (p.wolke||liegt) ? "" : `<g class="bein a">${bein(cx-0.42*rx-lw/2,b)}</g><g class="bein b">${bein(cx+0.3*rx-lw/2,c)}</g>`;
  const schatten = p.wolke ? wolkeUnter(cx,cy,rx,ry)
    : liegt ? `<ellipse cx="${rund(cx-2)}" cy="154" rx="${rund((rx+18)*1.25)}" ry="6" fill="#000" opacity=".17"/>`
    : `<ellipse cx="${rund(cx+6)}" cy="154" rx="${rund(rx+18)}" ry="8.5" fill="#000" opacity=".17"/>`;
  const dy = liegt ? Math.round(156-(cy+ry)) : 0;

  /* dicker Schwanz nach links, Ansatz = untere rechte Ecke der eigenen Box;
     in Bauchlage liegt er lang und leicht geschwungen flach auf dem Boden */
  const atx=rund(cx-rx*0.7), aty=rund(cy+ry*0.32);
  const tS=Math.min(T.ts, (atx-8)/51);
  const ax2=rund(cx-rx*0.72), tL=Math.min(T.ts, (ax2-6)/62);
  const schwanz = liegt
    ? `<g transform="translate(${ax2},${rund(cy+ry+1-11*tL)}) scale(${Math.round(tL*100)/100})"><path class="schwanzringel" d="M0 -10 q-24 -3 -41 4 q-14 5 -19 12 q8 6 24 4 q20 -2 36 -9 z" fill="${c}" stroke="#3d2412" stroke-width="${rund(4.5/tL)}" stroke-linejoin="round"/></g>`
    : `<g transform="translate(${atx},${aty}) scale(${Math.round(tS*100)/100})"><path class="schwanzringel" d="M0 0 q-22 4 -36 -3 q-11 -6 -14 -18 q6 -4 13 0 q12 7 37 5 z" fill="${c}" stroke="#3d2412" stroke-width="${rund(4.5/tS)}" stroke-linejoin="round"/></g>`;

  /* Rueckenzacken als Silhouette hinter dem Koerper */
  let zacken="";
  if(T.zack){
    const n=T.zack===2?5:3, f0=T.zack===2?-0.6:-0.45, step=T.zack===2?0.2:0.22, zs=T.zack===2?1:.7;
    const teile=[];
    for(let i=0;i<n;i++){
      const f=f0+i*step, x=cx+f*rx, y=cy-ry*Math.sqrt(Math.max(0,1-f*f));
      teile.push(`<path d="M-8 3 Q0 -13 8 3 z" transform="translate(${rund(x)},${rund(y+2)}) scale(${zs})" fill="${d}" stroke="#3d2412" stroke-width="${rund(3.5/zs)}" stroke-linejoin="round"/>`);
    }
    zacken=teile.join("");
  }

  /* winzige Aermchen an der Brust; in Bauchlage ruhen die Pfoetchen vorn auf dem Boden */
  const armx=rund(cx+rx*(liegt?0.66:0.72)), army=rund(liegt?cy+ry-22:cy-ry*0.18);
  const arm=(dx,ady,rot,f)=>`<g transform="translate(${rund(armx+dx)},${rund(army+ady)}) rotate(${rot})"><rect x="-4" y="0" width="9" height="20" rx="4.5" fill="${f}" stroke="#3d2412" stroke-width="4"/><path d="M-2 19 v4 M3 19 v4" stroke="#3d2412" stroke-width="2.2" stroke-linecap="round"/></g>`;
  const arme = liegt ? `${arm(-9,-3,44,b)}${arm(1,0,26,c)}` : `${arm(-10,-4,34,b)}${arm(0,0,18,c)}`;

  /* Eierschale fuer das Schluepfling (gr0) */
  const schale = gr===0 ? `<path d="M-30 0 q0 16 30 16 q30 0 30 -16 l-8 4 l-9 -7 l-9 7 l-9 -7 l-9 7 l-9 -7 l-7 3 z" transform="translate(${cx},131)" fill="#fdf6e3" stroke="#3d2412" stroke-width="4.5" stroke-linejoin="round"/><path d="M0 0 l5 -6 l4 6 l5 -6 l4 6 q-3 5 -9 5 q-6 0 -9 -5 z" transform="translate(${cx-rx-18},144)" fill="#fdf6e3" stroke="#3d2412" stroke-width="3.5" stroke-linejoin="round"/>` : "";
  const kappe = gr===0 ? `<path d="M-9 0 l4 -7 l5 7 l4 -7 l5 7 q-4 4 -9 4 q-5 0 -9 -4 z" transform="translate(${hx-4},${rund(hy-hr+1)}) rotate(-10)" fill="#fdf6e3" stroke="#3d2412" stroke-width="3.5" stroke-linejoin="round"/>` : "";

  /* Schnauze, Nasenloecher, breites Laecheln, Zaehnchen */
  const snx=rund(hx+hr*0.55), sny=rund(hy+hr*0.28);
  const mund = traurig
    ? `<path d="M${rund(hx+hr*0.05)} ${rund(hy+hr*0.6)} q${rund(hr*0.28)} 1 ${rund(hr*0.52)} 0" fill="none" stroke="#3d2412" stroke-width="3.5" stroke-linecap="round"/>`
    : `<path d="M${rund(hx+hr*0.02)} ${rund(hy+hr*0.58)} q${rund(hr*0.3)} ${rund(hr*0.24)} ${rund(hr*0.62)} ${rund(hr*0.06)}" fill="none" stroke="#3d2412" stroke-width="3.5" stroke-linecap="round"/>`;
  let zaehne="";
  if(T.zaehne && !traurig){
    const zahn=(x,y)=>`<path d="M-4 0 L0 7 L4 0 z" transform="translate(${rund(x)},${rund(y)})" fill="#fff6e0" stroke="#3d2412" stroke-width="2.5" stroke-linejoin="round"/>`;
    zaehne = zahn(hx+hr*0.24, hy+hr*0.66) + (T.zaehne>1?zahn(hx+hr*0.46, hy+hr*0.7):"");
  }
  let geschirr="";
  if(p.geschirrZ){
    const gs=Math.max(.62,Math.min(1,rx/52));
    geschirr=`<path d="M${rund(cx-rx*0.5)} ${rund(cy+ry*0.62)} q${rund(rx*0.6)} ${rund(ry*0.34)} ${rund(rx*1.05)} ${rund(-ry*0.05)}" fill="none" stroke="#6e421f" stroke-width="8" stroke-linecap="round"/><path d="M${rund(cx+rx*0.15)} ${rund(cy-ry*0.75)} q${rund(rx*0.4)} ${rund(ry*0.2)} ${rund(rx*0.5)} ${rund(ry*0.7)}" fill="none" stroke="#6e421f" stroke-width="8" stroke-linecap="round"/>`
      + emblemAuf(cx+rx*0.32, cy+ry*0.3, 15*gs, p.geschirrZ);
  }
  const pins = p.adapter ? `<g transform="translate(${rund(hx-hr*0.72)},${rund(hy-hr*0.3)}) scale(.95)">${adapterPins(p.adapter)}</g>` : "";
  const ex=hx+T.edx, ey=hy+T.edy;

  return `<svg class="rumpf" viewBox="0 0 230 172" width="100%" aria-hidden="true">
  ${schatten}${liegt?`<g transform="translate(0,${dy})">`:""}
  ${schwanz}
  ${zacken}
  ${beine}
  <ellipse cx="${cx}" cy="${cy}" rx="${rund(rx)}" ry="${rund(ry)}" fill="${c}" stroke="#3d2412" stroke-width="5"/>
  <ellipse cx="${rund(cx+rx*0.12)}" cy="${rund(cy+ry*0.22)}" rx="${rund(rx*0.55)}" ry="${rund(ry*0.55)}" fill="${h}" opacity=".55"/>
  ${musterAuf(cx,cy,rx,ry,d,p.muster,p.musterFarbe)}${p.moe?moeFlecken(cx,cy,rx,ry,c):""}${quant>=6?rippchen(cx,cy,rx,ry,d):""}
  ${arme}
  ${geschirr}
  ${schale}
  ${hut>0?hutAuf(hut,hx,hy,hr):""}
  <circle cx="${hx}" cy="${hy}" r="${hr}" fill="${c}" stroke="#3d2412" stroke-width="5"/>
  <ellipse cx="${snx}" cy="${sny}" rx="${rund(hr*0.55)}" ry="${rund(hr*0.38)}" fill="${h}" stroke="#3d2412" stroke-width="4.5"/>
  ${kappe}
  <circle cx="${rund(snx+hr*0.18)}" cy="${rund(sny-hr*0.08)}" r="2.4" fill="#3d2412"/><circle cx="${rund(snx+hr*0.38)}" cy="${rund(sny-hr*0.02)}" r="2.4" fill="#3d2412"/>
  ${mund}
  ${zaehne}
  <circle cx="${ex}" cy="${ey}" r="${er}" fill="#3d2412"/><circle cx="${rund(ex+er*0.4)}" cy="${rund(ey-er*0.4)}" r="${rund(er*0.38)}" fill="#fff"/>
  <rect class="lid" x="${rund(ex-er-1)}" y="${rund(ey-er-1)}" width="${rund(2*er+2)}" height="${rund(2*er+1)}" rx="3" fill="${c}"/>${liegt?schlummerWimper(ex,ey,er):""}
  <ellipse cx="${rund(hx-hr*0.42)}" cy="${rund(hy+hr*0.4)}" rx="${rund(hr*0.2)}" ry="${rund(hr*0.14)}" fill="#ff9ba8" opacity=".45"/>
  ${pins}
  ${denkBlase(hx,hy,hr,p.denkt||0)}${liegt?"</g>":""}
</svg>`;
}

/* ------------------------------------------------------------
   lamaSvg(p, opt) - Lama. Vier Beine (a-d, schlank, Zweizehen-
   Hufe), langer aufrechter Hals, kleiner Kopf mit Bananen-Ohren,
   rosa Wollbueschel als Markenzeichen, weiche Beulen-Silhouette
   (Wollkleid), flauschiger Puschelschwanz (schwanzringel-Hook).
   gr0 Fohlen (Riesenauge, Mini-Bueschel), gr4 Leitlama (stolze
   Brust, Doppel-Bueschel, Ohr-Quasten), gr5 Riesen-Lama mit
   Pompon-Turm; der Turm weicht jeder Kopfbedeckung (wie der Esel-Hut).
   ------------------------------------------------------------ */
function lamaSvg(p, opt={}){
  p = p || {};
  const gr = Math.max(0, Math.min(5, Math.round(p.gr==null ? 2 : p.gr)));
  const quant = Math.max(0, Math.min(6, p.quant||0));
  const traurig = (p.zustand==null ? 100 : p.zustand) < 45;
  const liegt = !!opt.liegt && !p.wolke;
  const hut = opt.hut||(opt.krone?3:0);
  /* bue: Bueschelstufe 0 mini / 1 Frisur / 2 Doppel / 3 Pompon-Turm */
  const T = [
    {lw:9, lh:20, rx:25,ry:19,cx:100,cy:123, hr:14.5,hx:123,hy:88, er:6,  edx:1,edy:-3, nw:12, es:.7,  bue:0},
    {lw:11,lh:28, rx:32,ry:24,cx:98, cy:114, hr:16,  hx:131,hy:70, er:5.4,edx:2,edy:-3, nw:14, es:.8,  bue:1},
    {lw:13,lh:36, rx:39,ry:29,cx:96, cy:106, hr:17.5,hx:139,hy:56, er:5,  edx:2,edy:-4, nw:16, es:.9,  bue:1},
    {lw:15,lh:40, rx:44,ry:33,cx:96, cy:101, hr:18.5,hx:143,hy:50, er:5,  edx:2,edy:-4, nw:18, es:1,   bue:1},
    {lw:16,lh:42, rx:49,ry:36,cx:97, cy:97,  hr:19.5,hx:147,hy:46, er:4.8,edx:3,edy:-4, nw:20, es:1.08,bue:2},
    {lw:18,lh:44, rx:56,ry:40,cx:100,cy:94,  hr:21,  hx:152,hy:44, er:4.4,edx:3,edy:-4, nw:23, es:1.15,bue:3}
  ][gr];
  let lw=T.lw, rx=T.rx, ry=T.ry;
  const lh=T.lh, cx=T.cx, cy=T.cy, hr=T.hr, hx=T.hx, hy=T.hy, er=T.er, es=T.es, nw=T.nw;
  if(quant>0){ rx=rx*(1-quant*0.012); ry=ry*(1-quant*0.02); }
  if(quant>=4) lw -= 2;
  if(p.wolke) ry=ry*1.06;
  if(liegt) rx = rx*1.04;                  /* Wolle plustert im Kuschen */
  const c = quant>0 ? misch(p.farbe||"#efe0c8","#e8e0d5",quant*0.08) : (p.farbe||"#efe0c8");
  const d=schat(c,-34), h=schat(c,24), b=schat(c,-14);
  const kx=rx/66, ky=ry/45;
  const woll = misch(c,"#f2a8c0",0.6);     /* Markenzeichen-Rosa, folgt der Familienfarbe */

  /* Beine mit Zweizehen-Ritz in der dunklen Hufkappe */
  const boden=156, legTop=boden-lh, huf=(lh>=30?10:8), hw=lw-6;
  const bein=(x,f)=>`<rect x="${rund(x)}" y="${legTop}" width="${lw}" height="${lh}" rx="${lw/2}" fill="${f}" stroke="#3d2412" stroke-width="4.5"/><path d="M${rund(x+3)} ${boden-huf} h${hw} v4 a${hw/2} ${hw/2} 0 01-${hw} 0 z" fill="#3d2412"/><path d="M${rund(x+lw/2)} ${rund(boden-huf+2.5)} v${rund(huf-4.5)}" stroke="${f}" stroke-width="2" opacity=".55"/>`;
  const beine1 = (p.wolke||liegt) ? "" : `<g class="bein a">${bein(cx-0.45*rx-lw/2,b)}</g><g class="bein b">${bein(cx+0.70*rx-lw/2,b)}</g>`;
  const beine2 = (p.wolke||liegt) ? "" : `<g class="bein c">${bein(cx-0.15*rx-lw/2,c)}</g><g class="bein d">${bein(cx+0.48*rx-lw/2,c)}</g>`;
  const schatten = p.wolke ? wolkeUnter(cx,cy,rx,ry)
    : liegt ? `<ellipse cx="${rund(cx+8*kx)}" cy="154" rx="${rund(Math.min((rx+14)*1.25,110))}" ry="6" fill="#000" opacity=".17"/>`
    : `<ellipse cx="${rund(cx+14*kx)}" cy="154" rx="${rund(rx+14)}" ry="9" fill="#000" opacity=".17"/>`;

  /* Kuschen: Beine komplett untergeschlagen, vorn ein gefaltetes Knie */
  const dy = liegt ? Math.round(boden-(cy+ry)) : 0;
  let knie="";
  if(liegt){
    const ns=Math.round(Math.max(.55,Math.min(1.05,kx))*100)/100;
    knie=`<g transform="translate(${rund(cx+rx*0.42)},${rund(cy+ry-6)}) scale(${ns})"><rect x="-16" y="-6" width="30" height="12" rx="6" fill="${c}" stroke="#3d2412" stroke-width="${rund(4.5/ns)}"/><rect x="6" y="-3.5" width="6" height="7" rx="2.5" fill="#3d2412"/></g>`;
  }

  /* flauschiger Puschelschwanz, ruht im Kuschen tiefer */
  const pS=Math.max(.6,Math.min(1.2,kx));
  const schwanz=`<g transform="translate(${rund(cx-rx*0.94)},${rund(liegt?cy+ry*0.42:cy-ry*0.3)}) scale(${Math.round(pS*100)/100})"><g class="schwanzringel"><circle cx="-5" cy="-2" r="9.5" fill="${c}" stroke="#3d2412" stroke-width="${rund(4/pS)}"/><circle cx="-8.5" cy="-6.5" r="4.5" fill="${h}" opacity=".7"/></g></g>`;

  /* langer Hals als Kapsel vom Kopf in den Rumpf (hinter dem Wollkleid) */
  const ax=cx+rx*0.66, ay=cy-ry*0.22;
  const halsW=Math.round(Math.atan2(-(ax-hx), ay-hy)*1800/Math.PI)/10;
  const halsL=rund(Math.hypot(ax-hx, ay-hy)+ry*0.6);
  const hals=`<rect x="${rund(-nw/2)}" y="${rund(-nw*0.35)}" width="${nw}" height="${halsL}" rx="${rund(nw/2)}" transform="translate(${hx},${hy}) rotate(${halsW})" fill="${c}" stroke="#3d2412" stroke-width="5"/>`;

  /* Wollkleid: Rumpf + Beulenkranz doppelt gemalt (Kontur, dann Fuellung);
     bei gr4/5 vorn eine groessere Beule als stolze Brust */
  const beu=[[-0.93,.2],[-0.62,.17],[-0.24,.16],[0.16,.16],[0.55,.17],[0.9, gr>=4?.24:.18]];
  const beulen=beu.map(q=>{
    const f=q[0], x=rund(cx+f*rx), y=rund(cy-ry*Math.sqrt(Math.max(0,1-f*f))*0.92);
    return `<circle cx="${x}" cy="${y}" r="${rund(Math.max(4.5,rx*q[1]))}"/>`;
  }).join("");
  const rumpfE=`cx="${cx}" cy="${cy}" rx="${rund(rx)}" ry="${rund(ry)}" fill="${c}"`;
  const wollK=`<ellipse ${rumpfE} stroke="#3d2412" stroke-width="5"/><g fill="${c}" stroke="#3d2412" stroke-width="4">${beulen}</g>`;
  const wollF=`<ellipse ${rumpfE}/><g fill="${c}">${beulen}</g>`;

  let geschirr="";
  if(p.geschirrZ){
    const gs=Math.max(.62,Math.min(1,rx/48));
    geschirr=`<path d="M${rund(cx+rx*0.02)} ${rund(cy-ry+3)} q-15 ${rund(ry*0.9)} -5 ${rund(ry*1.72)}" fill="none" stroke="#6e421f" stroke-width="7" stroke-linecap="round"/><path d="M${rund(cx+rx*0.3)} ${rund(cy-ry*0.5)} q${rund(rx*0.32)} ${rund(ry*0.18)} ${rund(rx*0.45)} ${rund(ry*0.52)}" fill="none" stroke="#6e421f" stroke-width="7" stroke-linecap="round"/>`
      + emblemAuf(cx+rx*0.42, cy+ry*0.02, 14*gs, p.geschirrZ);
  }

  /* Bananen-Ohren; haengen bei Kummer, kippen im Kuschen entspannt seitlich;
     ab gr4 kleine Woll-Quasten an den Spitzen */
  const quaste = gr>=4;
  const ohrP=(rot,f,inner)=>`<g transform="rotate(${rot})"><path d="M-3.5 2 q-4.5 -9 -2 -18.5 q1.5 -5.5 5.5 -5.5 q4 0 5 5.5 q1.5 9.5 -3 18.5 q-2.5 4.5 -5.5 0 z" fill="${f}" stroke="#3d2412" stroke-width="${rund(3.8/es)}" stroke-linejoin="round"/>${inner?`<path d="M-0.5 -3 q-1.5 -7 0 -13 q1 -3 2.5 -3 q1.5 0 2 3 q1 6 -0.5 13 q-1.5 3 -4 0 z" fill="#f0c8cc" opacity=".8"/>`:""}${quaste?`<circle cx="0" cy="-22.5" r="3.2" fill="${woll}" stroke="#3d2412" stroke-width="2.6"/>`:""}</g>`;
  const ohren=`<g transform="translate(${rund(hx-hr*0.42)},${rund(hy-hr*0.5)}) scale(${es})">${ohrP(traurig?-62:(liegt?-40:-26),b,false)}</g><g transform="translate(${rund(hx+hr*0.34)},${rund(hy-hr*0.5)}) scale(${es})">${ohrP(traurig?55:(liegt?30:16),c,true)}</g>`;

  /* rosa Wollbueschel; mit Kopfbedeckung bleibt nur das Basis-Bueschel,
     der Hut thront darueber (nichts wird abgeschnitten) */
  let kk;
  if(hut>0 || T.bue===0) kk=`<circle cx="0" cy="0" r="${rund(hr*0.34)}"/>`;
  else if(T.bue===1) kk=`<circle cx="2" cy="-1" r="${rund(hr*0.36)}"/><circle cx="${rund(-hr*0.28)}" cy="${rund(-hr*0.16)}" r="${rund(hr*0.28)}"/>`;
  else if(T.bue===2) kk=`<circle cx="3" cy="-2" r="${rund(hr*0.44)}"/><circle cx="${rund(-hr*0.34)}" cy="${rund(-hr*0.3)}" r="${rund(hr*0.36)}"/>`;
  else kk=`<circle cx="2" cy="0" r="${rund(hr*0.42)}"/><circle cx="${rund(-hr*0.2)}" cy="${rund(-hr*0.36)}" r="${rund(hr*0.32)}"/><circle cx="${rund(hr*0.14)}" cy="${rund(-hr*0.66)}" r="${rund(hr*0.24)}"/>`;
  const bueschel=`<g transform="translate(${rund(hx+hr*0.02)},${rund(hy-hr*0.98)})"><g fill="${woll}" stroke="#3d2412" stroke-width="3.2">${kk}</g><g fill="${woll}">${kk}</g></g>`;

  /* kleines Gesicht: Schnauze, Nuestern, Laecheln (traurig gerade) */
  const snx=rund(hx+hr*0.62), sny=rund(hy+hr*0.3);
  const schnauze=`<ellipse cx="${snx}" cy="${sny}" rx="${rund(hr*0.46)}" ry="${rund(hr*0.36)}" fill="${h}" stroke="#3d2412" stroke-width="4"/><ellipse cx="${rund(snx+hr*0.06)}" cy="${rund(sny-hr*0.08)}" rx="1.6" ry="2.2" fill="#3d2412"/><ellipse cx="${rund(snx+hr*0.28)}" cy="${rund(sny-hr*0.03)}" rx="1.6" ry="2.2" fill="#3d2412"/>`;
  const mund = traurig
    ? `<path d="M${rund(snx-hr*0.34)} ${rund(sny+hr*0.28)} q${rund(hr*0.2)} 1 ${rund(hr*0.4)} 0" fill="none" stroke="#3d2412" stroke-width="3" stroke-linecap="round"/>`
    : `<path d="M${rund(snx-hr*0.36)} ${rund(sny+hr*0.24)} q${rund(hr*0.2)} ${rund(hr*0.2)} ${rund(hr*0.44)} ${rund(hr*0.05)}" fill="none" stroke="#3d2412" stroke-width="3" stroke-linecap="round"/>`;
  const pins = p.adapter ? `<g transform="translate(${rund(hx+hr*0.5)},${rund(hy-hr*0.55)}) scale(.85)">${adapterPins(p.adapter)}</g>` : "";
  const ex=hx+T.edx, ey=hy+T.edy;

  return `<svg class="rumpf" viewBox="0 0 230 172" width="100%" aria-hidden="true">
  ${schatten}${liegt?`<g transform="translate(0,${dy})">`:""}
  ${schwanz}
  ${beine1}
  ${hals}
  ${wollK}${wollF}
  <ellipse cx="${rund(cx-4*kx)}" cy="${rund(cy+12*ky)}" rx="${rund(rx*0.62)}" ry="${rund(ry*0.44)}" fill="${h}" opacity=".5"/>
  ${musterAuf(cx,cy,rx,ry,d,p.muster,p.musterFarbe)}${p.moe?moeFlecken(cx,cy,rx,ry,c):""}${quant>=6?rippchen(cx,cy,rx,ry,d):""}
  ${beine2}${knie}
  ${geschirr}
  ${ohren}
  ${hut>0?hutAuf(hut,hx,hy,hr):""}
  <circle cx="${hx}" cy="${hy}" r="${hr}" fill="${c}" stroke="#3d2412" stroke-width="5"/>
  ${bueschel}
  ${schnauze}
  <circle cx="${ex}" cy="${ey}" r="${er}" fill="#3d2412"/><circle cx="${rund(ex+er*0.4)}" cy="${rund(ey-er*0.4)}" r="${rund(er*0.38)}" fill="#fff"/>
  <rect class="lid" x="${rund(ex-er-1)}" y="${rund(ey-er-1)}" width="${rund(2*er+2)}" height="${rund(2*er+1)}" rx="3" fill="${c}"/>${liegt?schlummerWimper(ex,ey,er):""}
  <ellipse cx="${rund(hx-hr*0.45)}" cy="${rund(hy+hr*0.32)}" rx="${rund(hr*0.24)}" ry="${rund(hr*0.17)}" fill="#ff9ba8" opacity=".45"/>
  ${mund}
  ${pins}
  ${denkBlase(hx,hy,hr,p.denkt||0)}${liegt?"</g>":""}
</svg>`;
}

/* Hund und Katze teilen denselben robusten Vierbeiner-Baukasten. Die Unterschiede
   (Ohren, Schwanz, Schnauze, Streifen) bleiben auch in kleinen Figuren lesbar. */
function haustierSvg(p,opt={},art="hund"){
  p=p||{}; const katze=art==="katze", gr=Math.max(0,Math.min(5,Math.round(p.gr==null?2:p.gr)));
  const quant=Math.max(0,Math.min(6,p.quant||0)), liegt=!!opt.liegt&&!p.wolke, traurig=(p.zustand==null?100:p.zustand)<45;
  const hut=opt.hut||(opt.krone?3:0), rx=[27,34,40,46,52,58][gr], ry=[20,24,28,32,36,40][gr];
  const cx=99,cy=112,hr=[15,17,19,20,22,24][gr],hx=145+gr*2.2,hy=91-gr*5;
  const c=quant?misch(p.farbe||(katze?"#e9a044":"#d79a58"),"#e8e0d5",quant*.08):(p.farbe||(katze?"#e9a044":"#d79a58"));
  const d=schat(c,-34),h=schat(c,25),b=schat(c,-13),boden=157,beinH=23+gr*3,beinW=9+gr*1.3;
  const schatten=p.wolke?wolkeUnter(cx,cy,rx,ry):`<ellipse cx="${cx+8}" cy="158" rx="${rx+17}" ry="7" fill="#000" opacity=".17"/>`;
  const bein=(x,f,i)=>`<g class="bein ${i}"><rect x="${rund(x-beinW/2)}" y="${rund(boden-beinH)}" width="${rund(beinW)}" height="${rund(beinH)}" rx="${rund(beinW/2)}" fill="${f}" stroke="#3d2412" stroke-width="4"/><path d="M${rund(x-beinW*.25)} ${boden-2} q${rund(beinW*.25)} -3 ${rund(beinW*.5)} 0" fill="none" stroke="#3d2412" stroke-width="2"/></g>`;
  const beine=(p.wolke||liegt)?"":bein(cx-rx*.58,b,"a")+bein(cx+rx*.55,b,"b")+bein(cx-rx*.22,c,"c")+bein(cx+rx*.78,c,"d");
  const ruhe=liegt?`<ellipse cx="${rund(cx+rx*.15)}" cy="${rund(cy+ry*.72)}" rx="${rund(rx*.7)}" ry="${rund(ry*.25)}" fill="${c}" stroke="#3d2412" stroke-width="4"/>`:"";
  const tail=katze
    ?`<path class="schwanzringel" d="M${cx-rx+3} ${cy+3} C${cx-rx-35} ${cy-18},${cx-rx-39} ${cy-52},${cx-rx-15} ${cy-58}" fill="none" stroke="#3d2412" stroke-width="13" stroke-linecap="round"/><path d="M${cx-rx+3} ${cy+3} C${cx-rx-35} ${cy-18},${cx-rx-39} ${cy-52},${cx-rx-15} ${cy-58}" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`
    :`<path class="schwanzringel" d="M${cx-rx+4} ${cy} q-25 -22 -32 -5 q13 3 27 23" fill="${c}" stroke="#3d2412" stroke-width="4" stroke-linejoin="round"/>`;
  const ohren=katze
    ?`<path d="M${hx-hr*.7} ${hy-hr*.62} l2 -${hr} l${hr*.62} ${hr*.55}zM${hx+hr*.2} ${hy-hr*.72} l${hr*.72} -${hr*.75} l${hr*.15} ${hr*1.08}z" fill="${c}" stroke="#3d2412" stroke-width="4" stroke-linejoin="round"/>`
    :`<path d="M${hx-hr*.65} ${hy-hr*.52} q-${hr*.85} -${hr*.42} -${hr*.62} ${hr*.72} q${hr*.35} ${hr*.55} ${hr*.76} -.05M${hx+hr*.45} ${hy-hr*.48} q${hr*.82} -${hr*.25} ${hr*.55} ${hr*.82} q-${hr*.35} ${hr*.42} -${hr*.7} -.1" fill="${d}" stroke="#3d2412" stroke-width="5" stroke-linejoin="round"/>`;
  let geschirr=""; if(p.geschirrZ) geschirr=`<path d="M${cx-rx*.18} ${cy-ry*.82} q-9 ${ry} -2 ${ry*1.65}" fill="none" stroke="#6e421f" stroke-width="7"/><path d="M${cx+rx*.25} ${cy-ry*.55} q${rx*.35} ${ry*.2} ${rx*.5} ${ry*.7}" fill="none" stroke="#6e421f" stroke-width="7"/>${emblemAuf(cx+rx*.45,cy+ry*.08,14,p.geschirrZ)}`;
  const snx=hx+hr*.58,sny=hy+hr*.26,ex=hx+hr*.12,ey=hy-hr*.15,er=Math.max(4,hr*.25);
  const nase=katze?`<path d="M${snx-4} ${sny-2} l8 0 l-4 5z" fill="#d97979" stroke="#3d2412" stroke-width="2"/>`:`<ellipse cx="${snx}" cy="${sny}" rx="${hr*.3}" ry="${hr*.22}" fill="#3d2412"/>`;
  const schnurr=katze?`<path d="M${snx+1} ${sny+6} l18 -5 M${snx+1} ${sny+8} l19 3 M${snx-3} ${sny+6} l-13 -4" stroke="#3d2412" stroke-width="1.8" stroke-linecap="round"/>`:"";
  const mund=traurig?`<path d="M${snx-8} ${sny+10} q8 -5 16 0" fill="none" stroke="#3d2412" stroke-width="3"/>`:`<path d="M${snx-7} ${sny+7} q7 8 15 0" fill="none" stroke="#3d2412" stroke-width="3"/>`;
  const pins=p.adapter?`<g transform="translate(${rund(hx-hr*.72)},${rund(hy-hr*.4)}) scale(.85)">${adapterPins(p.adapter)}</g>`:"";
  const dy=liegt?Math.round(boden-(cy+ry)):0;
  return `<svg class="rumpf" viewBox="0 0 230 172" width="100%" aria-hidden="true">${schatten}${liegt?`<g transform="translate(0,${dy})">`:""}${tail}${beine}<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}" stroke="#3d2412" stroke-width="5"/><ellipse cx="${cx-5}" cy="${cy+10}" rx="${rx*.6}" ry="${ry*.42}" fill="${h}" opacity=".5"/>${musterAuf(cx,cy,rx,ry,d,p.muster,p.musterFarbe)}${p.moe?moeFlecken(cx,cy,rx,ry,c):""}${quant>=6?rippchen(cx,cy,rx,ry,d):""}${ruhe}${geschirr}${ohren}${hut?hutAuf(hut,hx,hy,hr):""}<circle cx="${hx}" cy="${hy}" r="${hr}" fill="${c}" stroke="#3d2412" stroke-width="5"/><ellipse cx="${snx}" cy="${sny}" rx="${hr*.5}" ry="${hr*.36}" fill="${h}" stroke="#3d2412" stroke-width="3.5"/>${nase}${schnurr}${mund}<circle cx="${ex}" cy="${ey}" r="${er}" fill="#3d2412"/><circle cx="${ex+er*.38}" cy="${ey-er*.38}" r="${er*.35}" fill="#fff"/><rect class="lid" x="${ex-er-1}" y="${ey-er-1}" width="${er*2+2}" height="${er*2+1}" rx="3" fill="${c}"/>${liegt?schlummerWimper(ex,ey,er):""}${pins}${denkBlase(hx,hy,hr,p.denkt||0)}${liegt?"</g>":""}</svg>`;
}
function hundSvg(p,opt={}){return haustierSvg(p,opt,"hund");}
function katzeSvg(p,opt={}){return haustierSvg(p,opt,"katze");}

/* ------------------------------------------------------------
   tierSvg(art, p, opt) - Verteiler auf die Art-Renderer.
   Unbekannte Art faellt auf das Schwein zurueck.
   ------------------------------------------------------------ */
function tierSvg(art, p, opt={}){
  switch(art){
    case "huhn": return huhnSvg(p, opt);
    case "kuh":  return kuhSvg(p, opt);
    case "esel": return eselSvg(p, opt);
    case "dino": return dinoSvg(p, opt);
    case "lama": return lamaSvg(p, opt);
    case "hund": return hundSvg(p, opt);
    case "katze":return katzeSvg(p, opt);
    default:     return pigSvg(p, opt);
  }
}

/* ============================================================
   Funktionsuebersicht:
   schat(hex, delta)        -> Hexfarbe auf-/abgedunkelt
   misch(hexA, hexB, t)     -> Mischfarbe, t 0..1
   rund(v)                  -> auf 1 Nachkommastelle gerundet
   pigSvg(p, opt={})        -> Schwein; p: {farbe, muster, musterFarbe,
                               gr 0-5, moe, quant 0-6, geschirrZ,
                               denkt 0-2, adapter 0-2, wolke, zustand},
                               opt: {krone, hut 0-3, liegt}
                               hut: 1 Strohhut, 2 Zylinder, 3 Krone
                               (krone===true wirkt wie hut 3)
                               muster: punkte|fleck|band|quadrate|
                               dreiecke|hexagone (Zucht-Symbole);
                               opt.liegt: Ruhepose (nicht bei wolke)
   huhnSvg(p, opt={})       -> Huhn (gleicher Vertrag; 2 Beine a+b)
   kuhSvg(p, opt={})        -> Kuh (gleicher Vertrag; Hoerner, Euter gr2-3)
   eselSvg(p, opt={})       -> Esel (gleicher Vertrag; lange Ohren, Maehne)
   dinoSvg(p, opt={})       -> Dino (gleicher Vertrag; 2 Beine a+b, Zacken)
   lamaSvg(p, opt={})       -> Lama (gleicher Vertrag; langer Hals,
                               rosa Wollbueschel, Pompon-Turm gr5)
   tierSvg(art, p, opt={})  -> Verteiler: "schwein"|"huhn"|"kuh"|"esel"|
                               "dino"|"lama"|"hund"|"katze", sonst Schwein
   szeneSvg(opt={})         -> Wiesen-Szene; opt: {solar 0-4, teich}
   radarSvg(w, w2, opt={})  -> 7-Achsen-Radar; opt: {size 230, leer}
   gpuSvg(tier)             -> GPU-Karte (0-4) bzw. Server-Rack (5+)
   wolkeMiniSvg()           -> kleines Wolken-Icon
   Interne Helfer: sternchen, wolkeUnter, denkBlase, moeFlecken,
   musterAuf, rippchen, kroneAuf, strohhutAuf, zylinderAuf,
   hutAuf, emblemAuf, adapterPins, geschirrKlassisch
   ============================================================ */
