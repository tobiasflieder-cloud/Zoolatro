// 0.83a: Testlauf „4 Tage“ schaltet Stufen und Herausforderungen frei (z2After), einmalig nachträglich für laufende Testläufe
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||83;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const start=(w,o={})=>w.eval(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.fbOff=1;META.d4=${o.d4?1:0};META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,1);modal=null;state.ruleIntro=0;state.wishIntro=0;syncCtx();renderAll()`);
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x);await wait(200);start(w,{d4:1});
 T(ev('VERSION')==='0.83a','Version');
 T(ev('runOf().d4')===1,'Testlauf läuft');const s0=ev(`z2Of(activeSlot()).st.grund||1`);
 ev(`(()=>{const sl=activeSlot();state.zoo=2;state.phase='win';z2After(sl,sl.run,true)})()`);
 T(ev(`z2Of(activeSlot()).st.grund`)===s0+1&&ev('runOf().stNew')===s0+1,`Testlauf schafft Zoo 3 → Stufe ${s0+1} frei`);
 const nch=ev(`(()=>{const sl=activeSlot();const id=Object.keys(CHAL)[0];const ok=CHAL[id].ok;CHAL[id].ok=()=>true;state.zoo=1;z2After(sl,sl.run,true);CHAL[id].ok=ok;return z2Of(sl).ch[id]?1:0})()`);
 T(nch===1,'Testlauf: Herausforderungen zählen');
 T(ev(`(()=>{const sl=activeSlot();sl.run.seed='abc';const z=z2Of(sl);z.st.grund=1;state.zoo=2;z2After(sl,sl.run,true);return z.st.grund})()`)===1,'Seed-Lauf schaltet weiter nichts frei');
 // Highscore bleibt als Test markiert
 ev(`(()=>{const sl=activeSlot();sl.run.seed=undefined;state=null;modal=null;endRun(false)})()`);T(ev(`META.cscores.slice(-1)[0].test`)===1||ev(`META.cscores.every(x=>x.test)`),'Highscore-Eintrag bleibt als Test markiert');
 // einmalig nachträglich: laufender Testlauf mit 3 geschafften Zoos
 ev(`(()=>{const sl=META.slots[0];sl.z2={st:{grund:1},ch:{}};sl.run={v:2,z2:1,zl:true,d4:1,test:1,zoo:3,stage:1,deckId:'grund',deck:[],cards:[],spec:[],perks:{}};localStorage.setItem(SAVE_KEY,JSON.stringify(META));loadMeta()})()`);
 T(ev(`META.slots[0].z2.st.grund`)===2&&ev(`META.slots[0].run.d4st`)===1,'laufender Testlauf mit 3 geschafften Zoos: Stufe 2 nachträglich');
 ev(`loadMeta();META.slots[0].run.d4st=1`);ev(`localStorage.setItem(SAVE_KEY,JSON.stringify(META));loadMeta()`);T(ev(`META.slots[0].z2.st.grund`)===2,'nur einmal (kein Doppel-Aufstieg)');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
