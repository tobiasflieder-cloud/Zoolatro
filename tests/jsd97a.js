// 0.97a: Größe in der Deck-Übersicht, Braunbär Gebirge, Sammlerstück in der Kartenwahl, Seltenheit 4/1 (auch Kartenwahl)
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
 T(ev('VERSION')==='0.97a','Version');
 start(w);ev(H);
 // 1. Größe
 const g=J(`(()=>{const ks=Object.keys(CARDS).filter(k=>!/[~^#]/.test(k)&&CARDS[k].cat==='gehege'&&!CARDS[k].ms),by=f=>ks.find(k=>SHAPES[CARDS[k].shape].cells.length===f),es=Object.keys(CARDS).find(k=>!/[~^#]/.test(k)&&CARDS[k].cat==='essen');
   const keys=[by(1),by(1),by(2),by(4),es,by(1)+'~j'],D=deckMixData(keys),h=deckMixHtml(keys);return{gr:D.gr,h:/title="1 Feld">⬢1 3</.test(h)&&/title="2 Felder">⬢2 1</.test(h)&&/title="4 Felder">⬢4 1</.test(h)&&!/⬢3/.test(h)}})()`);
 T(JSON.stringify(g.gr.map(x=>[x[0],x[2]]))==='[["⬢1",3],["⬢2",1],["⬢4",1]]'&&g.h,`Größe: nur Gehege (Jungtier mit), leere weg ${JSON.stringify(g.gr)}`);
 T(J(`(()=>{const r=runOf();state.market={items:Object.keys(SPEC).slice(0,3),bought:false};return marketHtml().includes('⬢')})()`),'Größe auch bei der Spezialisten-Wahl (Stellenmarkt)');
 // 2. Braunbär
 const bb=J(`(()=>{const ge=one(c=>c.cat==='gehege'&&c.hab==='gebirge'&&!c.bonus,1,['braunbaeren'])[0],wa=one(c=>c.cat==='gehege'&&c.hab==='wald'&&!c.bonus,1)[0];
   const v=nb=>CARDS.braunbaeren.bonus(nb,[],{}).s||0;return{ge:v([{key:ge}]),wa:v([{key:wa}]),fx:CARDS.braunbaeren.fx.join(' '),gek:ge}})()`);
 T(bb.ge===2&&bb.wa===0&&/Gebirge-Gehege/.test(bb.fx),`Braunbären: +2 N je Gebirge-Nachbar (${bb.gek}), Dschungel 0 · „${bb.fx}“`);
 // 4. Seltenheit: Zoo-Angebot und Kartenwahl (Stand ohne Freischalt-Sperren)
 dom.window.close();dom=neu(97);w=dom.window;d=w.document;ev=x=>w.eval(x);J=x=>JSON.parse(ev(`JSON.stringify(${x})`));await wait(200);
 ev(base.replace("v91:1,","")+`enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,1);modal=null;state.ruleIntro=0;state.wishIntro=0;state.surprise=null;for(const k of Object.keys(CARDS))if(CARDS[k].bonus_)UNLOCK.add(k);render()`);
 const rr=J(`(()=>{const RW=JSON.stringify(RARW);let L=0,S=0;const N=5000;for(let i=0;i<N;i++){const o=makeOffer(3).map(k=>CARDS[k].rar);if(o.includes('sehr selten'))L++;if(o.includes('selten'))S++}
   const r=runOf(),s0=r.spec;r.spec=[];let p1=0,any=0;const a={};for(let i=0;i<N;i++){zkDeal(r,a);const R=a.cards.map(k=>CARDS[k].rar);if(R[0]==='sehr selten')p1++;if(R.includes('sehr selten'))any++}r.spec=s0;
   return{RW,L:L/N,S:S/N,p1:p1/N,any:any/N,lk:Object.keys(CARDS).filter(k=>!/[~^#]/.test(k)&&['selten','sehr selten'].includes(CARDS[k].rar)&&isLocked(k)).length}})()`);
 // 3. Sammlerstück in der Kartenwahl
 const sm=J(`(()=>{const r=runOf(),P0=(()=>{const d=r.deck;r.deck=d.filter(k=>!CARDS[k]||!CARDS[k].tags.includes('einmalig'));const P=zkPools(r);r.deck=d;return[...P.rare,...P.comm]})(),u=P0.find(k=>CARDS[k].tags.includes('einmalig')),d0=r.deck.slice(),s0=(r.spec||[]).slice(),inP=()=>{const P=zkPools(r);return P.rare.includes(u)||P.comm.includes(u)};
   const o={u};r.deck=d0.filter(k=>baseK(k)!==u);r.spec=[];o.none=inP();r.deck.push(u);o.one=inP();r.spec=['sammel'];o.oneS=inP();r.deck.push(u);o.twoS=inP();r.deck=d0;r.spec=s0;return o})()`);
 T(sm.none&&!sm.one&&sm.oneS&&!sm.twoS,`Sammlerstück (${sm.u}): ohne Team schon bei 1 weg, mit Sammlerstück bei 1 noch da, bei 2 weg ${JSON.stringify(sm)}`);
 T(/"selten":5,"sehr selten":2/.test(rr.RW),"RARW selten 5, legendär 2 (0.98a zurück)");
 T(rr.L>=.04&&rr.L<=.10&&rr.S>=.45&&rr.S<=.60,`Zoo-Angebot: mind. 1 legendär ${(rr.L*100).toFixed(1)} %, mind. 1 selten ${(rr.S*100).toFixed(1)} % (gesperrt selten/legendär: ${rr.lk})`);
 T(rr.p1>=.03&&rr.p1<=.10,`Kartenwahl: Platz 1 legendär ${(rr.p1*100).toFixed(1)} %, mind. 1 legendär ${(rr.any*100).toFixed(1)} %`);
 dom.window.close();
}catch(e){L('FAIL Absturz',e&&e.stack||e)}})();
