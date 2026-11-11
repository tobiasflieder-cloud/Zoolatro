// 0.76a: Glanz-Takt, Seltenheit in Kartenwahl und Lauf-Deck, Stufen 1–8, Prozente als Faktoren, Gold-Prägung, Besucherliebling
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||76;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const start=(w,st)=>w.eval(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};META.noHints=1;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,${st});runOf().fsIntro=0;modal=null;state.ruleIntro=0;state.wishIntro=0;syncCtx();renderAll()`);
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x);await wait(200);start(w,1);
 T(ev('VERSION')==='0.76a','Version');
 // 1. Glanz öfter, Streifen gleich langsam
 const css=d.documentElement.innerHTML;
 T(/\.rg1\{--glzT:4s;--glzA:glanz1\}\.rg2\{--glzT:2\.7s;--glzA:glanz2\}/.test(css)&&/@keyframes glanz1\{[^}]*\}79%,100%/.test(css)&&/@keyframes glanz2\{[^}]*\}74%,100%/.test(css),'Glanz-Takt 4 s / 2,7 s, Streifen 79 % / 74 % des Takts');
 const dz=+(/--d:-([0-9.]+)s/.exec(ev(`glzHtml('rg2',0)`))||[])[1];T(dz>=0&&dz<2.7,'gemeinsame Uhr passt zum Legendär-Takt (Verzögerung unter 2,7 s)');
 // 3. Seltenheit in Kartenwahl/Shop (offerCard) und im Lauf-Deck
 const ks=JSON.parse(ev(`JSON.stringify(['gewöhnlich','selten','sehr selten'].map(r=>Object.keys(CARDS).find(k=>CARDS[k].rar===r&&CARDS[k].cat==='gehege'&&!k.includes('~'))))`));
 const oc=ks.map((k,i)=>ev(`offerCard(${JSON.stringify(k)},${i})`));
 T(!/class="glz"/.test(oc[0])&&!/Selten|Legendär/.test(oc[0].split('</span>')[0]),'gewöhnliche Karte im Angebot ohne Glanz und ohne Wort');
 T(/class="glz"/.test(oc[1])&&/ · Selten/.test(oc[1])&&/ocard[^"]* rg1/.test(oc[1]),'seltene Karte im Angebot: Glanz und „Selten“ in der Infozeile');
 T(/class="glz"/.test(oc[2])&&/ · Legendär/.test(oc[2])&&/ocard[^"]* rg2/.test(oc[2]),'legendäre Karte im Angebot: Glanz und „Legendär“ in der Infozeile');
 ev(`(()=>{const r=runOf();r.reward={};r.vNow=[];r.newNow=[];crewardStep('card');state=null;modal=null;screen='creward';screenArg=r.reward;renderAll()})()`);
 const kc=[...d.querySelectorAll('.pcard.kcard')];
 T(kc.length>0&&kc.every(e=>!!e.querySelector('.glz')&&/Selten|Legendär/.test(e.querySelector('.meta3').textContent)),'Lauf-Deck zwischen den Zoos: Glanz und „Selten“/„Legendär“ ('+kc.length+' Karten)');
 dom.window.close();
 // 4. Stufen 1–8
 const soll={1:[18,3,1.3,4],2:[15,3,1.3,4],3:[15,1,1.3,4],4:[15,1,1.3,6],5:[15,1,1.3,6],6:[15,1,1.15,6],7:[12,1,1.15,6],8:[9,0,0,6]};
 for(const st of[1,2,3,4,5,6,7,8]){dom=neu(st*7);w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);start(w,st);
  const r=JSON.parse(ev(`JSON.stringify([[...TERR.values()].filter(v=>HAB[v]).length,state.zl.gold.length,state.zl.crown?CROWNF:0,PURN,!!state.wish,rollSpecs(99).includes('wunsch')])`)),s=soll[st];
  T(r[0]===s[0]&&r[1]===s[1]&&r[2]===s[2]&&r[3]===s[3],`Stufe ${st}: ${r[0]} Naturfelder, ${r[1]} Goldfelder, Krone ${r[2]||'keine'}, Reinheit ab ${r[3]}`);
  if(st===8)T(!r[4]&&!r[5],'Stufe 8: kein Besucherwunsch, keine 🎈 Wunscherfüllerin im Stellenmarkt');
  if(st===7)T(r[4]&&r[5],'Stufe 7: Besucherwunsch und Wunscherfüllerin wie bisher');
  dom.window.close()}
 // 5. Faktoren nacheinander: Social-Media-Hype (+40 % → ×1,3) und Prägung Gold (+25 % → ×1,2) auf der Tribüne (6 B)
 dom=neu();w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(200);start(w,1);
 T(ev('[pctF(.2),pctF(.25),pctF(.3),pctF(.4),pctF(.5),pctF(.6),pctF(-.05),pctF(-.1)].join()')==='1.15,1.2,1.25,1.3,1.4,1.5,0.95,0.9','Umrechnung +20/25/30/40/50/60 % → ×1,15/1,2/1,25/1,3/1,4/1,5, Abzüge bleiben');
 const f=JSON.parse(ev(`(()=>{const c=BOARD.find(([q,r])=>ONBOARD.has(hk(q,r))&&!TERR.get(hk(q,r))&&!state.zl.gold.includes(hk(q,r))&&hk(q,r)!==state.zl.crown);state.ads=['social'];state.spec=[];state.progs=[];state.buildings=[{id:1,key:'tribuene^gold',cells:[c],lvl:1,pr:'gold'}];syncCtx();
   const p=[];const v=evalB(state.buildings[0],state.buildings,mkIndex(state.buildings),p);return JSON.stringify({a:v.a,p:p.map(x=>[x.label,x.a])})})()`));
 const iF=f.p.findIndex(x=>/Social-Media-Hype ×1,3/.test(x[0])),iG=f.p.findIndex(x=>/Gold ×1,2/.test(x[0]));
 const a0=f.a-(iF>=0?f.p[iF][1]:0)-(iG>=0?f.p[iG][1]:0),a1=a0+Math.round(a0*.3),a2=a1+Math.round(a1*.2);
 T(iF>=0&&iG>iF&&a0===6&&f.a===a2,`+40 % und +25 % werden ×1,3 und danach ×1,2 (nicht addiert): ${a0} → ${a1} → ${f.a}`);
 // 7. Gold-Prägung wird nie ausgelost
 T(!ev('praegLos()').includes('gold')&&!!ev('PRAEG.gold')&&!JSON.parse(ev(`JSON.stringify(Array.from({length:300},()=>rollPraeg()).flat())`)).includes('gold'),'Prägung 🪙 Gold wird nicht mehr ausgelost (Wirkung für alte Karten bleibt)');
 // 8. Besucherliebling nur an manchen Tagen ab dem Sommer
 const fav=JSON.parse(ev(`(()=>{state.season=1;state.buildings=[{id:1,key:'zebras',cells:[BOARD[0]],lvl:1},{id:2,key:'giraffen',cells:[BOARD[5]],lvl:1}];let n=0;for(let i=0;i<400;i++){state.day=i%5;dayRoll();if(state.fav)n++}return n})()`));
 T(fav>40&&fav<180,`Besucherliebling an etwa jedem 4. Tag (${fav} von 400)`);
 // 2. Futter verteilen: Futterplätze in der Infospalte
 ev(`state.phase='shop';openShop();state.shopSub='feed';state.feedF='kf';render()`);
 const rows=[...d.querySelectorAll('.drow')];T(rows.length>0&&rows.every(r=>!!r.querySelector('.inf .dex .fdslot')&&!!r.querySelector('.inf .dval')),'Futter verteilen: Futterplätze als eigene Zeile in der Infospalte');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
