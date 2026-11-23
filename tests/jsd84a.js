// 0.84a: Kartenwahl zwischen den Zoos (1–2 seltene), Wunsch „early“ gestrichen, Flusstal-Ansicht (CSS)
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||84;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const start=(w,deck)=>w.eval(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.fbOff=1;META.d4=0;META.d5=1;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,1);runOf().deckId='${deck||'grund'}';modal=null;state.ruleIntro=0;state.wishIntro=0;syncCtx();renderAll()`);
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x);await wait(200);start(w);
 T(ev('VERSION')==='0.84a','Version');
 const roll=(n)=>JSON.parse(ev(`JSON.stringify((()=>{const r=runOf();const out=[];for(let i=0;i<${n};i++){r.reward={};crewardStep('card');out.push(r.reward.cards.map(k=>{const c=CARDS[baseK(k)];return(c.bonus_||['selten','sehr selten'].includes(c.rar))?1:0}))}return out})())`));
 const R=roll(200),cnt=R.map(x=>x.reduce((a,b)=>a+b,0));
 T(R.every(x=>x.length===3&&x[0]===1&&x[2]===0),'3 Karten: Platz 1 immer selten/legendär, Platz 3 gewöhnlich (200 Ziehungen)');
 T(cnt.every(c=>c===1||c===2),'genau 1 oder 2 seltene');const two=cnt.filter(c=>c===2).length;T(two>60&&two<140,`Platz 2 etwa zur Hälfte selten (${two} von 200)`);
 ev(`runOf().deckId='forscher'`);const F=roll(100);T(F.every(x=>x.length===2&&x[0]===1&&x.reduce((a,b)=>a+b,0)>=1),'Forscher: 2 Karten, 1–2 seltene');
 ev(`runOf().deckId='grund'`);
 // early nie
 const ws=JSON.parse(ev(`JSON.stringify((()=>{const L=[];for(let i=0;i<300;i++){state.wish=null;state.season=1+(i%2);runOf().wishSeen=[];try{wishRoll()}catch(e){}if(state.wish)L.push(state.wish.id)}return L})())`));
 T(ws.length>50&&!ws.includes('early'),`Wunsch „2 Tage früher“ nie ausgelost (${ws.length} Wünsche)`);
 // Flusstal: SVG zeichnet über den Rand
 const css=[...d.querySelectorAll('style')].map(s=>s.textContent).join('');T(/\.boardwrap:not\(\.zoomed\) #board\{overflow:visible\}/.test(css),'Spielfeld ohne Zoom: overflow sichtbar');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
