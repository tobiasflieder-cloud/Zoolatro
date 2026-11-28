// 0.98a: keine Stufen-Preissteigerung, Seltenheit 5/2, Promis legendär (Gewicht 3), Besucher-Vielfalt, Eröffnungsangebot
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
 T(ev('VERSION')==='0.98a','Version');
 start(w);ev(H);
 // 1. Stufen ohne Preissteigerung, Text ohne „teurer“
 const st=J(`(()=>{const r=runOf(),o=[];for(let s=1;s<=5;s++){r.stage=s;o.push(stW('teurer',1))}r.stage=1;return{o,t:STUFEN_DATEN.stufen.map(x=>x.text).join(' ')}})()`);
 T(JSON.stringify(st.o)==='[1,1,1,1,1]'&&!/teurer/.test(st.t),'Stufe 1–5: keine Preissteigerung, kein „teurer“ im Stufentext');
 // 2./3. Seltenheit und Promis
 const pr=J(`(()=>{const V=Object.keys(CARDS).filter(k=>!/[~^#]/.test(k)&&CARDS[k].cat==='verst');return{RW:[RARW.selten,RARW['sehr selten'],RARW.promi],rar:V.map(k=>CARDS[k].rar),w:V.map(k=>{const sl=activeSlot();sl.vu=sl.vu||{};sl.vu[k]=1;UNLOCK.add(k);return weightOf(k)}),locked:V.map(k=>isLocked(k)),zk:V.map(k=>zkW({spec:[]},k)),zkT:zkW({spec:['talent']},V[0]),rg:rgOf(CARDS[V[0]].rar),lab:rarLabel(CARDS[V[0]])}})()`);
 T(JSON.stringify(pr.RW)==='[5,2,3]','RARW selten 5, legendär 2, Promi 3');
 T(pr.rar.length===9&&pr.rar.every(r=>r==='sehr selten')&&pr.zk.every(x=>x===3)&&pr.zkT===7.5&&pr.rg==='rg2'&&/Legendär/.test(pr.lab),`9 Promis (0.9901a) legendär, Gewicht 3 in der Kartenwahl (Forscher ${pr.zkT}), Glanz ${pr.rg}, „${pr.lab}“`);
 T(pr.w.every(x=>x===3),`Gewicht im Zoo-Angebot 3: ${pr.w.join(',')}`);
 // 4. Besucher-Vielfalt
 const bv=J(`(()=>{const E=one(c=>c.cat==='essen',8),A=one(c=>c.cat==='attr',8),cells=[A0,...NB,...BOARD.filter(([q,r])=>!(q===A0[0]&&r===A0[1])&&!NB.some(n=>n[0]===q&&n[1]===r)).slice(0,20)];
   const z=L=>{put(L.map((k,i)=>[k,cells[i]]));const m=scoreZoo(state.buildings).mults.filter(x=>/Vielfalt: \\d+ Arten/.test(x.label));return m.map(x=>x.icon+' '+x.label+' ×'+x.ma)};
   return{nE:E.length,nA:A.length,e2:z(E.slice(0,2)),e3:z(E.slice(0,3)),e4:z(E.slice(0,4)),e7:z(E.slice(0,7)),dup:z([E[0],E[0],E[1],E[2]]),aBetter:z([...E.slice(0,2),...A.slice(0,3)]),fx:[2,3,4,5,6,7,8].map(bvF)}})()`);
 T(bv.nE>=7&&bv.nA>=3,`genug Karten (1 Feld): Gastro: ${bv.nE}, Attraktionen ${bv.nA}`);
 T(bv.e2.length===0,'2 Gastro-Arten: keine Zeile');
 T(/Gastro-Vielfalt: 3 Arten ×1.1$/.test(bv.e3[0])&&/×1.15$/.test(bv.e4[0])&&/×1.3$/.test(bv.e7[0]),`3/4/7 Gastro (8+ siehe Faktoren): ${[bv.e3,bv.e4,bv.e7].map(x=>x[0]).join(' | ')}`);
 T(bv.dup.length===1&&/3 Arten/.test(bv.dup[0]),`doppelte Art zählt einmal: ${bv.dup[0]}`);
 T(bv.aBetter.length===1&&/🎡 Attraktions-Vielfalt: 3 Arten ×1.1/.test(bv.aBetter[0]),`Attraktionen besser: nur ${bv.aBetter[0]}`);
 T(JSON.stringify(bv.fx)==='[1,1.1,1.15,1.2,1.25,1.3,1.3]','Faktoren 2–8 Arten: 1 · 1,1 · 1,15 · 1,2 · 1,25 · 1,3 · 1,3');
 // 5. Eröffnungsangebot
 const op=J(`(()=>{put([]);const sid=Object.keys(SPEC).find(id=>SPEC[id].tier===1&&!SPEC[id].rb),o={};state.spec=[];const ph=state.phase;
   state.season=0;state.phase='seasonWon';o.on=eroeffOn();o.p0=[priced(15),priced(SPECPRICE[1]),mappePrice(),profiPrice()];
   state.season=1;o.off=eroeffOn();const inf=inflation();o.p1=[priced(15),priced(SPECPRICE[1]),mappePrice(),profiPrice()].map((x,i)=>i<2?x/inf:x);
   state.season=0;state.phase='play';o.play=eroeffOn();state.phase=ph;return o})()`);
 const ok5=op.p0.every((x,i)=>Math.abs(x-op.p1[i]*.75)<=1);
 T(op.on&&!op.off&&!op.play&&ok5,`Eröffnungsangebot nach dem Frühling ×0,75: Karte/Spezialist/Mappe/Profi ${op.p0.join('/')} statt ${op.p1.map(x=>Math.round(x)).join('/')} (Sommer ohne Inflation)`);
 ev(`state.season=0;openShop();render()`);
 T(/Eröffnungsangebot: alles ×0,75/.test(d.body.textContent),'Hinweis „🌱 Eröffnungsangebot“ im Shop');
 dom.window.close();
}catch(e){L('FAIL Absturz',e&&e.stack||e)}})();
