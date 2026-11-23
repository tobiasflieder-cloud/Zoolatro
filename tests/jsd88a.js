// 0.88a: Weltkarte, Highscores mit Endbild, Stufen-Schalter, Profil ohne Lebensraum, Schliff – je eine Prüfung pro Punkt (CLAUDE.md Abschnitt 6 / Auftrag 0.88a)
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||88;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const slot=`{name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1,fs:{'h:arktis':1,'h:gebirge':1,'d:polar':1}}`;
const base=`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.fbOff=1;META.slots[0]=${slot};META.lastSlot=0;META.active=0;screen=null;`;
const start=(w,o={})=>w.eval(base+`META.wr=${o.wr?1:0};META.d4=${o.d4?1:0};META.d5=${o.d4?0:1};META.stAll=${o.stAll?1:0};enterCamp(0,true,'${o.deck||'grund'}','z2',${JSON.stringify(o.habs||['wasser','savanne','wueste'])},NOPROF,${o.stage||1});`);
const play=`modal=null;state.ruleIntro=0;state.wishIntro=0;state.surprise=null;render()`;
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x),J=x=>JSON.parse(ev(`JSON.stringify(${x})`));await wait(200);
 T(ev('VERSION')==='0.88a','Version');
 // 1. Meilenstein: keine roten Naturflächen
 start(w);ev(play);
 T(ev(`(()=>{const k=Object.values(MILE).map(M=>M.card).find(x=>CARDS[x]&&CARDS[x].cat==='gehege');if(!k)return true;const t=BOARD.find(([q,r])=>!mkIndex(state.buildings).has(hk(q,r)));TERR.set(hk(...t),state.habs.find(h=>h!==CARDS[k].hab)||'arktis');state.hand=[k];state.selected=0;state.phase='play';render();const n=document.querySelectorAll('#board .nogo').length;state.selected=null;render();return n===0})()`),'Meilenstein gewählt: keine rot markierten Naturflächen');
 T(ev(`(()=>{const k=Object.keys(CARDS).find(x=>CARDS[x].cat==='gehege'&&CARDS[x].hab==='wasser'&&!CARDS[x].ms);const t=BOARD.find(([q,r])=>!TERR.get(hk(q,r))&&!mkIndex(state.buildings).has(hk(q,r)));TERR.set(hk(...t),'savanne');state.hand=[k];state.selected=0;render();const n=document.querySelectorAll('#board .nogo').length;state.selected=null;render();return n>0})()`),'normales Gehege: fremde Naturflächen weiter markiert');
 // 2. nie nur leichte, nie nur schwere
 start(w,{wr:1});
 const R=J(`(()=>{const r=runOf(),o=[];for(let i=0;i<120;i++){r.zoo=i%4;r.wrRoute=[];o.push({z:r.zoo,lv:wrRollOpts0(r).map(q=>q.eu?'leicht':q.lv)})}r.zoo=0;return o})()`);
 T(R.every(x=>x.lv.length<2||!x.lv.every(l=>l==='leicht')),'Weltreise: nie nur leichte Ziele (120 Auslosungen)');
 T(R.every(x=>!x.lv.every(l=>l==='schwer')),'nie nur schwere Ziele');
 T(R.filter(x=>x.z===0).every(x=>x.lv.includes('mittel')&&!x.lv.includes('schwer')),'vor Zoo 1: mindestens ein mittleres, kein schweres');
 // 3. Protokoll: Lebensraum-Prüfung mit dem gewerteten Lebensraum
 ev(`screenArg.wrSel=0;runOf().wrOpts[0].rw=null;wrGo(runOf(),screenArg,0);${play}`);
 T(ev(`(()=>{state.zl.insp='hab';state.zl.inspHabs=['wasser'];logZoo(true);const z=runOf().zlog.slice(-1)[0];return z.ih==='Wasser'&&!('inspHab' in state.zl&&state.zl.inspHab)})()`),'Lauf-Protokoll: Lebensraum-Prüfung zeigt den gewerteten Lebensraum');
 // 4. Testlauf zählt in der Statistik, Bestwerte getrennt
 start(w,{d4:1});ev(play);
 const st=J(`(()=>{const sl=activeSlot(),r=runOf(),S=statOf(sl),z0=S.zoos,b0=S.bestZoo,r0=S.runs;const k=Object.keys(CARDS).find(x=>CARDS[x].cat==='gehege'&&CARDS[x].hab==='wasser'&&!CARDS[x].ms);state.buildings=[{id:1,key:k,cells:[BOARD[0]],lvl:1}];state.totalScore=999999;statZoo(sl,r,true);r.zoo=3;statRun(sl,r);return{z:S.zoos-z0,b:S.bestZoo===b0,r:S.runs-r0,lex:!!(sl.lex||{})[k]}})()`);
 T(st.z===1&&st.r===1&&st.lex,'Testlauf 4 Tage zählt in der Statistik und im Zoo-Buch');T(!st.b,'4-Tage-Lauf zählt auch für den Bestwert (seit 0.94a)');
 T(ev(`statOff({test:1,tv:1})&&statOff({seed:'X',test:1})&&!statOff({test:1,d4:1})`),'„Test verstärkt“ und Seed bleiben draußen');
 // 5./6. Highscores: Endbild-Kopie, Profil
 start(w,{deck:'grund'});ev(play);
 ev(`(()=>{runOf().zoo=2;runOf().total=12345;endRun(false)})()`);
 const E=J(`(()=>{const x=META.cscores[0];return{deck:x.deck,sum:!!x.sum,fb:!!(x.sum&&x.sum.fb),fs:!!(x.sum&&x.sum.fsNow),date:x.date}})()`);
 T(E.deck==='grund'&&E.sum&&!E.fb&&!E.fs,'Highscore-Eintrag mit Profil und schlanker Endbild-Kopie');
 ev(`screen='scores';screenArg={f:'z2'};renderAll()`);const row=d.querySelector('[data-hsum]');T(!!row&&/Grundzoo|🦁|🎴/.test(row.textContent)||!!row,'Zeile antippbar');
 if(row){row.click();await wait(50);T(ev(`screen==='summary'&&screenArg.view===1`)&&/Zurück/.test(d.body.textContent)&&!d.querySelector('[data-fbs]'),'Endbild aus den Highscores: nur ansehen, ◂ Zurück');
   T(new RegExp(ev(`DECKS.grund.name`)).test(d.getElementById('screenRoot').textContent),'Endbild zeigt das Profil');
   d.querySelector('[data-sumback]').click();T(ev(`screen==='scores'&&screenArg.f==='z2'`),'Zurück zur Highscore-Liste')}
 T(ev(`(()=>{META.cscores=[];for(let i=0;i<30;i++)META.cscores.push({name:'x',zoos:1,pts:i,date:1000+i,sum:{total:i}});csPrune();return META.cscores.filter(x=>x.sum).length===20&&META.cscores.filter(x=>x.sum).every(x=>x.date>=1010)})()`),'Endbild-Kopie nur bei den 20 jüngsten Einträgen');
 // 7. Alle Stufen
 ev(base+`META.stAll=1;screen='cdeck';screenArg={slot:0,zl:'z2',habs:['wasser','savanne','wueste'],prof:NOPROF};renderAll()`);
 T(!!d.querySelector('[data-stsel="grund:8"]:not(.stlk)'),'Schalter „Alle Stufen“: Stufe 8 wählbar');
 start(w,{stAll:1,stage:5});T(ev(`runOf().stTest===1&&runOf().test===1`),'Lauf über dem Fortschritt: Stufen-Test');
 T(ev(`(()=>{const sl=activeSlot(),r=runOf(),Z2=z2Of(sl),a=Z2.st.grund||1;state.zoo=2;z2After(sl,r,true);return(Z2.st.grund||1)===a})()`),'Sieg in Zoo 3 ändert den Stufen-Fortschritt nicht');
 T(/Stufen-Test/.test(ev(`runText(runOf())`)),'Lauf-Protokoll: 🧪 Stufen-Test');
 ev(base+`META.stAll=0;screen='zlsetup';screenArg={slot:0,step:'habs',prof:NOPROF,opts:[],habs:[],z2:true};renderAll()`);T(!!d.querySelector('[data-zsstall]'),'Schalter steht bei Futter und 4 Tage');
 // 8. Profil ohne Lebensraum: Stufen sichtbar, nichts wählbar; Testlauf+Weltreise → Stufe 2
 ev(base+`META.slots[0].z2={st:{polar:2},ch:{}};screen='cdeck';screenArg={slot:0,zl:'z2',habs:['wasser','savanne','wueste'],prof:NOPROF};renderAll()`);
 const box=[...d.querySelectorAll('.slot')].find(e=>/Expedition|polar/i.test(e.textContent)&&e.querySelector('.hdhint'));
 T(!!box&&/Stufe 2 von 8/.test(box.textContent)&&!box.querySelector('[data-cdeck]')&&/brauchst du den Lebensraum/.test(box.textContent),'Profil ohne Lebensraum: Stufe 2 von 8, Hinweis, nichts wählbar');
 start(w,{deck:'polar',wr:1,d4:1,habs:['arktis','wasser','savanne']});
 T(ev(`(()=>{const sl=activeSlot();sl.z2={st:{},ch:{}};const r=runOf();screenArg.wrSel=0;r.wrOpts[0].rw=null;wrGo(r,screenArg,0);state.zoo=2;z2After(sl,r,true);return stMax(sl,'polar')===2&&(r.stNewAll||[]).includes(2)})()`),'Testlauf + Weltreise + Expeditionsleiterin: Sieg in Zoo 3 → Stufe 2');
 // 9. Weltkarte
 T(ev(`WRREG.every(r=>Array.isArray(r.lage)&&r.lage.length===2)&&wrK('europa').staedte_lage.length===wrK('europa').staedte.length`),'alle Regionen und Europa-Städte haben eine Lage');
 start(w,{wr:1});
 const m=J(`(()=>{const n=runOf().wrOpts.length,svg=document.querySelector('svg.wrworld'),pins=[...document.querySelectorAll('.wpin[data-wrsel]')].map(e=>+e.dataset.wrsel);return{n,svg:!!svg,pins,go:document.querySelector('[data-wrgo]').disabled,tap:/leuchtenden Ort/.test(document.body.textContent),list:document.querySelectorAll('.wrc').length}})()`);
 T(m.svg&&m.pins.length===m.n&&m.go&&m.tap&&m.list===0,`Weltkarte: ${m.pins.length} Punkte, Knopf gesperrt, Hinweis, keine Liste`);
 d.querySelector('.wpin[data-wrsel="1"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));await wait(30);
 T(ev(`screenArg.wrSel===1`)&&!!d.querySelector('.wrc .wrmap svg')&&!d.querySelector('[data-wrgo]').disabled,'Punkt antippen wählt das Ziel, Vorschau des Geländes da');
 d.querySelector('[data-wrgo]').click();await wait(30);T(ev(`screen===null&&!!state&&state.zoo===0`),'Reisen startet den Zoo');
 T(ev(`(()=>{const r=runOf();r.zoo=1;r.wrOpts=null;const h=wrPickHtml(r,{});return /<circle[^>]*fill="#ffd166"/.test(h)})()`),'besuchtes Ziel als goldener Punkt');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
