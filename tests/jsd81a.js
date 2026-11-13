// 0.81a: Winter-Schilder, Mindestgröße, Aufstellung am Zähler, Detail-Fenster (Rechnung = Wertung), Lotto mit Chance, Fleiß im Testlauf, Sommer-Kurve
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||81;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const start=(w,o={})=>w.eval(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.fbOff=1;META.d4=${o.d4?1:0};META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,1);modal=null;state.ruleIntro=0;state.wishIntro=0;syncCtx();renderAll()`);
const GS=(()=>{const s=fs.readFileSync(require('path').join(__dirname,'referenz','referenz.js'),'utf8'),i=s.indexOf('const GAMESIDE=`')+16;return s.slice(i,s.indexOf('`;',i))})();
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x);await wait(200);start(w);
 T(ev('VERSION')==='0.81a','Version');
 // 1./2. Mindestgröße: Schild im Herbst, Faktor
 const two=ev(`Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&!CARDS[k].ms&&SHAPES[CARDS[k].shape].cells.length===2&&!fsLocked(k))`);
 const put=`(()=>{const free=BOARD.filter(([q,r])=>!TERR.get(hk(q,r)));for(const c of free){const cs=placeCells('${two}',0,c[0],c[1]);if(cs&&cs.every(([q,r])=>!TERR.get(hk(q,r))&&ONBOARD.has(hk(q,r)))){state.buildings=[{id:900,key:'${two}',cells:cs,lvl:1}];return true}}return false})()`;
 T(ev(put),'2-Felder-Gehege gesetzt ('+two+')');
 ev(`state.zoo=2;state.zl.insp='gross';state.zl.hard=false;state.season=2;state.phase='play';state.selected=null;syncCtx();render()`);
 const sg=[...d.querySelectorAll('#board .trl.wnt text')].map(e=>e.textContent);T(sg.some(t=>/❄️×0,75/.test(t)),'Herbst: ❄️-Schild „×0,75“ am 2-Felder-Gehege ('+sg.join(',')+')');
 T(ev(`winterHit(state.buildings[0],state.buildings).fa`)===.75,'Mindestgröße normal ×0,75');ev(`state.zl.hard=true`);T(ev(`winterHit(state.buildings[0],state.buildings).fa`)===.5,'Mindestgröße verschärft ×0,5');
 ev(`state.buildings[0].lvl=2`);T(ev(`winterHit(state.buildings[0],state.buildings)`)===null,'Stufe II: nicht betroffen');ev(`state.buildings[0].lvl=1`);
 ev(`modal='insp';state.season=3;syncCtx();render()`);T(/Mindestgröße: 1 deiner Gehege zählt nur ×0,5/.test(d.getElementById('modalRoot').textContent),'Winter-Ansage nennt die Zahl der betroffenen Gehege');ev('modal=null;render()');
 T([...d.querySelectorAll('#board .trl.wnt.neg')].length===1,'Winter: rotes ❄️-Schild');
 ev(`state.season=1;syncCtx();render()`);T(!d.querySelector('#board .trl.wnt'),'Sommer: noch keine ❄️-Schilder');
 // nie in Zoo 1–2
 const picks=JSON.parse(ev(`JSON.stringify([0,1,2].map(z=>{const L=[];for(let i=0;i<60;i++){state.zoo=z;state.zl.insp=null;try{initZl()}catch(e){}L.push(state.zl.insp)}return L}))`));
 T(!picks[0].includes('gross')&&!picks[1].includes('gross'),'Mindestgröße nie in Zoo 1–2 (je 60 Ziehungen)');T(picks[2].includes('gross'),'ab Zoo 3 möglich');
 // 3. Aufstellung am Zähler
 ev(`state.zoo=0;state.season=0;state.zl.insp='frei';syncCtx();(()=>{const r=scoreZoo(state.buildings);state.yday={A:r.A,S:r.S,total:r.total,auf:aufOf(r)}})();state.phase='review';render()`);
 dom.window.close();
 // mit Referenzfall (viele Faktoren): Aufstellung und Detail-Fenster
 dom=neu();w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);w.eval(GS);
 for(const fn of['01-bot-s12-grund-zoo2-jz4-tag1.json','39-winter-gross-verschaerft.json','28-winter-koenig.json']){const F=JSON.parse(fs.readFileSync(require('path').join(__dirname,'referenz','faelle',fn),'utf8'));w.refLoad(F);
   ev(`(()=>{const r=scoreZoo(state.buildings);state.yday={A:r.A,S:r.S,total:r.total,auf:aufOf(r)};state.phase='review';state.info=null;state.selected=null;state.builtToday=0})();render()`);
   for(const k of['A','S']){d.getElementById('c'+k).click();await wait(20);const p=d.getElementById('aufPop');const fin=p&&p.querySelector('.aufr.sum b').textContent.replace(/\D/g,''),v=d.getElementById('v'+k).textContent.replace(/\D/g,'');
     const raw=p?+p.querySelector('.aufr b').textContent.replace(/\D/g,''):0,fs2=p?[...p.querySelectorAll('.aufr:not(.sum)')].slice(1).map(e=>+e.querySelector('b').textContent.replace('×','').replace(',','.')):[];const prod=Math.round(raw*fs2.reduce((x,y)=>x*y,1));
     T(!!p&&fin===v&&Math.abs(prod-+v)<=Math.max(1,+v*.01),`${fn.slice(0,12)}: Aufstellung ${k} = Zählerwert (${fin} / ${v}, Rechnung ${prod})`);d.body.click();await wait(10)}
   const R=JSON.parse(ev(`JSON.stringify(state.buildings.map(b=>{const bk=breakdown(b,state.buildings);return detCalc(bk.a0,bk.parts,'a',bk.a).ok&&detCalc(bk.s0,bk.parts,'s',bk.s).ok}))`));
   T(R.every(Boolean),`${fn.slice(0,12)}: Detail-Rechnung = Wertung für alle ${R.length} Gebäude`);
   const neg=ev(`(()=>{const b=state.buildings.find(b=>breakdown(b,state.buildings).parts.some(p=>(p.fa!=null&&p.fa<1)||(p.a||0)<0));return b?b.id:null})()`);
   const bid=neg!=null?neg:ev('state.buildings[0].id');ev(`state.infoProg=null;state.info=${bid};render()`);const db=d.querySelector('#info [data-det]');if(db)db.click();await wait(20);const sh=d.getElementById('detSheet');
   const bk=JSON.parse(ev(`JSON.stringify(breakdown(state.buildings.find(b=>b.id===${bid}),state.buildings))`));
   T(!!sh&&sh.querySelector('.drb b').textContent==String(bk.a)&&sh.querySelector('.drn b').textContent==String(bk.s)&&new RegExp('= '+bk.a+'$').test(sh.querySelectorAll('.dcalc span')[1].textContent),`${fn.slice(0,12)}: Detail-Fenster zeigt ${bk.a} B · ${bk.s} N, Rechnung endet so`);
   if(neg!=null)T(!!sh.querySelector('.drw.neg .dv.neg'),`${fn.slice(0,12)}: Abzug rot`);
   if(sh)sh.querySelector('[data-dsx]').click();await wait(10);T(!d.getElementById('detSheet'),'Detail-Fenster schließt');ev('state.info=null')}
 dom.window.close();
 // 5. Lotto
 dom=neu(7);w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);start(w);
 const lt=JSON.parse(ev(`JSON.stringify((()=>{state.spec=['lotto'];runOf().spec=['lotto'];syncCtx();let n=0;for(let i=0;i<80;i++){try{dayRoll()}catch(e){}if(state.lottoH)n++}return[n,specVal('lotto')[0]]})())`));
 T(lt[0]>5&&lt[0]<40,`Lotto greift an manchen Tagen (${lt[0]} von 80)`);ev(`state.lottoH=null`);T(ev(`specVal('lotto')[0]`)==='–','kein Treffer: Team-Leiste zeigt „–“');
 // 6. Fleiß im Testlauf
 dom.window.close();dom=neu();w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);start(w,{d4:1});
 const f0=ev(`flOf(activeSlot()).runs||0`);ev(`flAdd('runs',1)`);T(ev(`flOf(activeSlot()).runs`)===f0+1,'Testlauf: Fleiß zählt mit');
 T(ev(`(()=>{const sl=activeSlot();sl.fs=sl.fs||{};const g=FSG.find(g=>g.id==='c:dingos');return fsCheck('season')&&true})()`),'Testlauf: fsCheck läuft');
 // 7. Sommer-Kurve
 const r1=ev(`seTarget(1,true,1)/seTarget(1,true,0)`);T(Math.abs(r1-1.35)<.02,`Sommerziel Zoo 2 = Zoo 1 × 1,35 (${r1.toFixed(3)})`);
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
