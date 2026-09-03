const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),game=fs.readFileSync(path.join(root,'modellhof_game.html'));
const pruefungen=[
 ['tests_v6.cjs'],['tests_hofloop.cjs'],['tests_rechenhaus.cjs'],['tests_minispiele.cjs'],
 ['tests_aera8.cjs'],['tests_aera9.cjs'],['tests_needle.cjs'],['tests_dynamik.cjs'],
 ['tests_berufe.cjs'],['hofbuch_md.cjs','--check'],['ada_doku.cjs','--check'],
 ['ada_audio_audit.cjs',path.join(__dirname,'ada_texte.json'),path.join(root,'ada_dialog_v3'),path.join(__dirname,'ada_visemen.js')]
];
let failed=false;const results=[];
for(const [file,...args] of pruefungen){
 const r=cp.spawnSync(process.execPath,[path.join(__dirname,file),...args],{encoding:'utf8',windowsHide:true});
 const output=(r.stdout||'')+(r.stderr||'');failed ||= r.status!==0;
 results.push({datei:file,argumente:args,bestanden:r.status===0,ausgabe:output});
 console.log(file+': '+(r.status===0?'BESTANDEN':'FEHLER')+' · '+output.trim().split('\n').pop());
}
const report={zeit:new Date().toISOString(),spielSHA256:crypto.createHash('sha256').update(game).digest('hex'),spielBytes:game.length,bestanden:!failed,pruefungen:results};
fs.writeFileSync(path.join(root,'PRUEFERGEBNIS_GESAMT.json'),JSON.stringify(report,null,2));
process.exitCode=failed?1:0;
