// Textbild (Godot-Vorbereitung 2c): schreibt alle angezeigten Texte von Menüs, Lexikon, Fenstern und einem Zoolatro-Lauf mit Bot
// (fester Zufall, feste Uhr) in eine Datei. Vergleich zweier Stände: bash tests/textvergleich.sh
//   ZF=spiel.html ST=1 OUT=texte.txt node tests/textbild.js     (ST = Stufe des Laufs)
const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};
 let S=777;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};let T=1.7e12;w.Date.now=()=>(T+=1000)}});
const w=dom.window,d=w.document,ev=x=>w.eval(x),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const SNAP=[];const TX=lab=>{const o=['#### '+lab];const walk=e=>{if(e.nodeType===3){const t=e.textContent.replace(/\s+/g,' ').trim();if(t)o.push(t);return}if(e.nodeType!==1||e.tagName==='SCRIPT'||e.tagName==='STYLE')return;for(const a of['title','aria-label','placeholder','data-tip'])if(e.getAttribute(a))o.push('['+a+':'+e.getAttribute(a)+']');for(const c of e.childNodes)walk(c)};walk(d.body);SNAP.push(o.join('\n'))};
const ck=e=>{if(!e)return false;e.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));return true};
(async()=>{try{await sleep(300);ev(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};SCFAST=1`);TX('start');
 for(const sc of['title','mode','slots','tut','lex','gloss','stat','prog','scores','zlsetup']){try{ev(`screen='${sc}';screenArg={};modal=null;renderAll()`);TX('screen '+sc);
   const tabs=[...d.querySelectorAll('[data-tab]')].map(b=>b.dataset.tab);for(const t of tabs){ck(d.querySelector(`[data-tab="${t}"]`));await sleep(5);TX('screen '+sc+' tab '+t)}}catch(e){SNAP.push('EXC '+sc+' '+e.message)}}
 ev(`window._keep=[render,renderModal,saveMeta,renderAll]`);ev(fs.readFileSync(require('path').join(__dirname,'bot7.js'),'utf8'));ev(`[render,renderModal,saveMeta,renderAll]=window._keep;BOT.zl=true;BOT.cur={zoos:[],built:0,cd:{},picked:{},specs:[],progs:[]}`);
 ev(`META.slots[0]={name:'Tobi',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,${process.env.ST||1});modal=null;runOf().fsIntro=0;renderAll()`);TX('lauf start');
 const modals=()=>{for(const m of['help','insp','traits','deck','wetter','zoo']){try{ev(`modal='${m}';renderAll()`);TX('modal '+m)}catch(e){SNAP.push('EXC modal '+m+' '+e.message)}}ev('modal=null;renderAll()')};
 modals();let g=0,lastSea=-1;
 while(g++<500){const ph=ev('state&&state.phase');if(!ph)break;
  if(ph==='play'){if(ev('state.season')!==lastSea){lastSea=ev('state.season');modals()}
    // Karte auswählen und Vorschau zeigen
    ev(`(()=>{if(state.hand.length){selectCard(0);render()}})()`);TX('play hand '+ev('state.season+"/"+state.day'));ev('state.selected=null;state.preview=null');
    ev('botDay();render()');TX('play gebaut');ev('botScore();render()');TX('scored');ev('endDay();render()')}
  else if(ph==='review'){TX('review');ev('endDay();render()')}
  else if(ph==='draft'){TX('draft');ev(`(()=>{const base=scoreZoo(state.buildings).total;let bi=0,bv=-1e9;state.offer.forEach((k,i)=>{const b=botBest(k,base),v=b?b.g/costOf(k):-1;if(v>bv){bv=v;bi=i}});pick(bi)})();render()`)}
  else if(ph==='seasonWon'){TX('seasonWon');ev('state.pendingSeason=true;nextDraft();render()')}
  else if(ph==='shop'){for(const t of['run','umb','more']){ev(`META.shopT='${t}';render();renderAll()`);TX('shop '+t)}ev('botShop();render()');TX('shop nach bot');if(ev('state.phase')==='shop')ev('beginNextSeason();render()')}
  else if(ph==='win'){TX('win');ev('finishGame();renderAll()');TX('nach finishGame');const run=()=>ev('JSON.stringify(META.slots[0].run&&META.slots[0].run.reward||null)');let h=0;
    while(h++<30){const a=JSON.parse(run());if(!a)break;TX('reward '+a.step);
     const r=ev(`(()=>{const a=META.slots[0].run.reward;if(botClick('[data-vack]')||botClick('[data-cdack]'))return'ack';if(a.step==='prev')return botClick('[data-cprev]')?'prev':'x';if(a.step==='perk')return botClick('[data-cskip="perk"]')?'perk':'x';if(a.step==='card'){if(!botClick('[data-ccard]:not([disabled])'))botClick('[data-cskip="card"]');return'card'}if(a.step==='trim'){botClick('[data-cskip="trim"]');return'trim'}if(a.step==='spec'){if(!botClick('[data-cspec]:not([disabled])'))botClick('[data-cstart]');return'spec'}if(a.step==='next'){botClick('[data-cstart]');return'next'}return'x'})()`);await sleep(5);if(r==='x'||r==='next'){TX('reward ende '+r);break}}
    TX('nach reward');break}
  else if(ph==='lost'){TX(ph);break}
  else if(ph==='scoring'){await sleep(20)}
  else{SNAP.push('PHASE '+ph);break}}
 const U=SNAP.filter((x,i)=>x!==SNAP[i-1]);fs.writeFileSync(process.env.OUT,U.join('\n=====\n'));console.log('SNAPS',U.length,'g',g)}catch(e){console.log('EXC',e.stack);const U=SNAP;fs.writeFileSync(process.env.OUT,U.join('\n=====\n'))}process.exit(0)})();
