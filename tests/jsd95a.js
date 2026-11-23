// 0.95a: 5 Stufen (Ziele, Umrechnung), Weltreise/Futter Standard ohne Schalter, Sommer ×1,45, Mehr Natur / Naturfläche ändern
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=(seed,store)=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){if(store)for(const k in store)w.localStorage.setItem(k,store[k]);w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||90;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const slot=`{name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1,fs:{'h:arktis':1,'h:gebirge':1},z2:{st:{grund:4},ch:{}}}`;
const base=`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.klassik=1;META.fbOff=1;META.d4=0;META.d5=0;META.stAll=0;META.pvOff=0;META.slots[0]=${slot};META.lastSlot=0;META.active=0;screen=null;`;
const start=(w,o={})=>w.eval(base+`META.wr=${o.wr?1:0};META.klassik=(${o.wr?1:0})?0:1;enterCamp(0,true,'${o.deck||'grund'}','z2',${JSON.stringify(o.habs||['wasser','savanne','wueste'])},NOPROF,${o.stage||1});if(!${o.wr?1:0}){modal=null;state.ruleIntro=0;state.wishIntro=0;state.surprise=null;render()}`);
// Helfer im Spiel: freie Mitte A mit Ring N[0..5]; Karten nach Bedingung (1 Feld); Aufstellen; Zeilen der Wertung
const H=`TERR.clear();var A0=BOARD.find(([q,r])=>DIRS.every(([a,c])=>ONBOARD.has(hk(q+a,r+c))&&DIRS.every(([e,f])=>ONBOARD.has(hk(q+a+e,r+c+f)))));var NB=DIRS.map(([a,c])=>[A0[0]+a,A0[1]+c]);
var one=(f,n,ex)=>Object.keys(CARDS).filter(k=>{const c=CARDS[k];return!/[~^#]/.test(k)&&!c.ms&&!c.gone&&!c.jt&&!c.sig&&SHAPES[c.shape].cells.length===1&&f(c)&&!(ex||[]).includes(k)}).slice(0,n||1);
var anyk=(f,n)=>Object.keys(CARDS).filter(k=>{const c=CARDS[k];return!/[~^#]/.test(k)&&!c.ms&&!c.gone&&!c.jt&&!c.sig&&f(c)}).slice(0,n||1);
var put=L=>{state.buildings=L.map(([k,cell],i)=>({id:100+i,key:k,cells:[cell],lvl:1}));syncCtx();return state.buildings};
var lines=b=>breakdown(b,state.buildings).parts.map(p=>p.label).join(' | ');var team=L=>{runOf().spec=L.slice();state.spec=L.slice();syncCtx()};`;
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x),J=x=>JSON.parse(ev(`JSON.stringify(${x})`));await wait(200);
 T(ev('VERSION')==='0.95a','Version');
 // 3. Stufen: Ziele ab Sommer, Frühling ×1
 start(w);const sz=J(`(()=>{const r=runOf(),o=[];for(let s=1;s<=5;s++){r.stage=s;o.push([stTF(0),+stTF(1).toFixed(3)])}r.stage=1;return{o,n:STMAXN}})()`);
 T(sz.n===5&&sz.o.every(x=>x[0]===1)&&[1,1.15,1.3225,1.6002,2.0003].every((v,i)=>Math.abs(sz.o[i][1]-v)<.002),`5 Stufen, Ziele ab Sommer ${sz.o.map(x=>x[1]).join(' / ')}, Frühling ×1`);
 // 3. Umrechnung alter Spielstand: alt 4 → 3, alt 8 → 5, nur einmal
 const raw=J(`(()=>{const m=JSON.parse(JSON.stringify(META));delete m.st5;m.slots[0].z2={st:{grund:8,kueste:4},ch:{}};m.slots[0].run=Object.assign({},m.slots[0].run,{stage:4,z2:1});m.cscores=[{stage:8,sum:{stage:6}}];return JSON.stringify(m)})()`);
 dom.window.close();dom=neu(95,{'zoodeck-save-v1':raw});w=dom.window;d=w.document;ev=x=>w.eval(x);J=x=>JSON.parse(ev(`JSON.stringify(${x})`));await wait(250);
 const cv=J(`(()=>{const sl=META.slots[0];const a={st:sl.z2.st,run:sl.run&&sl.run.stage,cs:META.cscores[0],f:META.st5};loadMeta();return{a,b:{st:META.slots[0].z2.st,run:META.slots[0].run&&META.slots[0].run.stage}}})()`);
 T(cv.a.st.grund===5&&cv.a.st.kueste===3&&cv.a.run===3&&cv.a.cs.stage===5&&cv.a.cs.sum.stage===4&&cv.a.f===1,`Umrechnung: alt 8 → 5, alt 4 → 3 (Profile, laufender Lauf, Highscores) ${JSON.stringify(cv.a)}`);
 T(cv.b.st.grund===5&&cv.b.st.kueste===3&&cv.b.run===3,'nochmal laden rechnet nicht doppelt um');
 dom.window.close();dom=neu();w=dom.window;d=w.document;ev=x=>w.eval(x);J=x=>JSON.parse(ev(`JSON.stringify(${x})`));await wait(200);
 // 4. Weltreise und Futter Standard, keine Schalter
 w.eval(base.replace('META.klassik=1','META.klassik=0')+`META.wr=0;META.foodOff=1;META.testVerst=1;enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,1)`);
 T(J(`(()=>{const r=runOf();return r.wr===1&&!r.foodOff&&!r.test&&!r.tv&&foodOnRun(r)})()`),'neuer Lauf: Weltreise und Futter an, auch wenn alte Schalter gesetzt sind');
 T(!J(`verstOn('futterkueche')`),'„Test: Verstärker“ wirkt nicht mehr');
 ev(`state=null;modal=null;screen='zlsetup';screenArg={slot:0,step:'habs',prof:NOPROF,opts:[],habs:[],z2:true};renderAll()`);
 T(!d.querySelector('[data-zsfood]')&&!d.querySelector('[data-zswr]')&&!!d.querySelector('[data-zsd4]')&&!!d.querySelector('[data-zsstall]'),'Lauf-Einrichtung: keine Schalter Futter/Weltreise, 🐢 5 Tage und 🏔️ Alle Stufen bleiben');
 
 // alter Lauf ohne Weltreise lädt und läuft weiter
 start(w);ev(`state.phase='play';render()`);
 ev(`META.dev=1;modal='help';render()`);T(!d.querySelector('[data-vtm]')&&!d.querySelector('[data-vtest]')&&!/Test: Verstärker/.test(d.getElementById('modalRoot').textContent),'Menü ohne „Test: Verstärker“');ev(`META.dev=0;modal=null;render()`);const sv=J(`(()=>{saveMeta();const r=runOf();return{wr:!!r.wr,store:localStorage.getItem(SAVE_KEY)}})()`);
 dom.window.close();dom=neu(96,{'zoodeck-save-v1':sv.store});w=dom.window;d=w.document;ev=x=>w.eval(x);J=x=>JSON.parse(ev(`JSON.stringify(${x})`));await wait(250);
 const ol=J(`(()=>{for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};META.noHints=1;enterCamp(0,false,null,'z2');modal=null;state.ruleIntro=0;state.wishIntro=0;state.phase='play';render();const d0=state.day;endDay();return{wr:!!runOf().wr,ok:!!state&&state.zoo===0,d:state.day,d0,ph:state.phase}})()`);
 T(!sv.wr&&!ol.wr&&ol.ok,`alter Lauf ohne Weltreise lädt und spielt weiter (${JSON.stringify(ol)})`);
 // 2. Sommer ×1,45
 T(Math.abs(J(`seTarget(1,true,1)/seTarget(1,true,0)`)-1.45)<.02,'Sommerziel Zoo 2 = Zoo 1 × 1,45');
 // 1. Mehr Natur / Naturfläche ändern
 start(w);ev(H+`state.rule=null`);
 const mn=J(`(()=>{TERR.clear();state.terr=[];const far=BOARD.map(c=>hk(...c)).filter(k=>!mkIndex(state.buildings).has(k)).slice(0,1)[0];const inv=umbInv();inv.length=0;inv.push('natur3');state.phase='play';const ok3=umbOk('natur3'),okN=umbOk('natur');umbUse(0,true);const[q,r]=far.split(',').map(Number);umbClick(q,r);const sel=(state.umbT.sel||[]).slice();state.umbPick={ks:sel};umbHab('wueste');const t1=TERR.get(far);
   inv.push('natur');umbUse(0,true);const fr=BOARD.map(c=>hk(...c)).find(k=>!TERR.get(k)&&!mkIndex(state.buildings).has(k));const[a,b]=fr.split(',').map(Number);umbClick(a,b);const rej=!(state.umbT.sel||[]).includes(fr);umbClick(q,r);const acc=(state.umbT.sel||[]).includes(far);state.umbPick={ks:state.umbT.sel.slice()};umbHab('wasser');return{ok3,okN,sel:sel.length,t1,rej,acc,t2:TERR.get(far)}})()`);
 T(mn.ok3&&!mn.okN&&mn.sel===1&&mn.t1==='wueste',`Mehr Natur: freies Feld ohne Natur-Nachbarn, Lebensraum frei gewählt (${mn.t1}); ohne Natur kein „Naturfläche ändern“`);
 T(mn.rej&&mn.acc&&mn.t2==='wasser','Naturfläche ändern: nur bestehende Naturflächen, freies Feld abgelehnt');
 T(/Bis zu 3 freie Felder/.test(J('UMB.natur3.text'))&&/Bis zu 3 Naturflächen/.test(J('UMB.natur.text')),'Texte der beiden Umbauten');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
