/* Erzeugt REGELWERK.md aus DEMSELBEN Generator wie das In-Game-Hofbuch (ADR 0001):
   lädt den Build in eine VM, ruft hofbuchHtml() auf und übersetzt das HTML nach Markdown.
   Aufruf: node dev/hofbuch_md.cjs  */
const fs=require("fs"), path=require("path"), vm=require("vm");
const html=fs.readFileSync(path.join(__dirname,"..","modellhof_game.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const source=script.slice(0,script.indexOf("/* Boot-Sequenz */"));
function el(){ return {innerHTML:"",textContent:"",value:"",style:{setProperty(){},width:""},dataset:{},
  classList:{add(){},remove(){},contains:()=>false},appendChild(){},remove(){},before(){},
  querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},scrollTop:0}; }
const ctx={console,Math,JSON,Date,Object,Array,Number,String,Boolean,RegExp,Map,Set,isNaN,parseInt,parseFloat,
  setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame(){},
  performance:{now:()=>0},
  document:{getElementById:()=>el(),createElement:()=>el(),querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},visibilityState:"visible"},
  window:{}, localStorage:{getItem:()=>null,setItem(){},removeItem(){}},
  confirm:()=>true, prompt:()=>null, alert(){}, btoa:s=>Buffer.from(s,"binary").toString("base64"),
  atob:s=>Buffer.from(s,"base64").toString("binary"), navigator:{}, location:{reload(){}},
  URL:{createObjectURL:()=>"",revokeObjectURL(){}}, Blob:function(){}, Image:function(){}};
ctx.globalThis=ctx; ctx.self=ctx;
vm.createContext(ctx);
vm.runInContext(source,ctx,{timeout:30000});
const rohHtml=vm.runInContext('S=frischerStand(); hofbuchHtml()',ctx);

let md=rohHtml
  .replace(/<div class="notiz">([\s\S]*?)<\/div>/g,"> $1\n")
  .replace(/<h3>([\s\S]*?)<\/h3>/g,"\n## $1\n")
  .replace(/<th>/g,"| ").replace(/<\/th>/g," ").replace(/<\/tr>\s*<tr>/g," |\n| ")
  .replace(/<td>/g,"| ").replace(/<\/td>/g," ").replace(/<tr>/g,"").replace(/<\/tr>/g," |")
  .replace(/<table class="vergleich">/g,"\n").replace(/<\/table>/g,"\n")
  .replace(/<div class="listenzeile">[\s\S]*?<b>([\s\S]*?)<\/b><span>([\s\S]*?)<\/span><\/span><\/div>/g,"- **$1** – $2\n")
  .replace(/<p[^>]*>/g,"\n").replace(/<\/p>/g,"\n")
  .replace(/<br\s*\/?>/g,"\n")
  .replace(/<b>/g,"**").replace(/<\/b>/g,"**")
  .replace(/<span class="merk[^"]*">/g,"`").replace(/<\/span>/g,"`")
  .replace(/<button[^>]*>[\s\S]*?<\/button>/g,"")
  .replace(/<[^>]+>/g,"")
  .replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'")
  .replace(/`\s*`/g,"").replace(/[ \t]+\n/g,"\n").replace(/\n{3,}/g,"\n\n");

const kopf="# LLM FARM – Regelwerk (Hofbuch)\n\n"+
  "GENERIERT aus den Spieldaten (ADR 0001) – nicht von Hand editieren.\n"+
  "Neu erzeugen: `node dev/hofbuch_md.cjs` nach jedem Build.\n";
const ziel=path.join(__dirname,"..","REGELWERK.md"), erwartet=kopf+md;
if(process.argv.includes("--check")){
  const vorhanden=fs.existsSync(ziel)?fs.readFileSync(ziel,"utf8"):"";
  if(vorhanden!==erwartet){
    console.error("REGELWERK.md ist nicht synchron mit dem In-Game-Hofbuch. Neu erzeugen: node dev/hofbuch_md.cjs");
    process.exitCode=1;
  }else console.log("REGELWERK.md ist synchron ("+Math.round(erwartet.length/1024)+" KB)");
}else{
  fs.writeFileSync(ziel,erwartet,"utf8");
  console.log("REGELWERK.md geschrieben ("+Math.round(erwartet.length/1024)+" KB)");
}
