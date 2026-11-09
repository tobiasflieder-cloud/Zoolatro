// Textbild Tutorial (Godot-Vorbereitung 2c): wie tutcal5.js, aber mit festem Zufall; schreibt nach jedem Schritt alle angezeigten Texte nach OUT.
// Vergleich zweier Stände: bash tests/textvergleich.sh
// (tutcal5:) spielt das neue Jasper-Tutorial (Zoo 1) komplett durch: Häppchen weiterklicken, feste Felder, Rückgängig, Neu ziehen, Ausbau, Umzug, Shops, freier Rest mit Bot.
// MEAS=1: Ziele aus, misst die Punkte je Tag (für TUTT). V=1: ausführlich.
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){{let S=12345;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message))}});
const w=dom.window,d=w.document,sleep=ms=>new Promise(r=>setTimeout(r,ms));const V=!!process.env.V,MEAS=!!process.env.MEAS;
(async()=>{try{await sleep(150);const ev=x=>w.eval(x),L=(...a)=>console.log(...a);const ck=s=>{const e=typeof s==='string'?d.querySelector(s):s;if(!e){L('MISSING',s);return false}e.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));return true};
 ev(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};SCFAST=1;screen='tut';screenArg={};renderAll()`);ck('[data-tutch]');await sleep(30);
 ev('window._keep=[render,renderModal,saveMeta,renderAll]');w.eval(fs.readFileSync(require('path').join(__dirname,'bot7.js'),'utf8'));ev('[render,renderModal,saveMeta,renderAll]=window._keep');ev('BOT.zl=true;BOT.cur={zoos:[],built:0,cd:{},picked:{},specs:[],progs:[]}');
 if(MEAS)ev('state.tT=[1e12,1e12,1e12,1e12]');
 L('targets',ev('[0,1,2,3].map(i=>seOf(i).target).join("/")'),'modal',ev('modal'),'hand',ev('state.hand.join()'),'insp',ev('state.zl.insp'));
 ev(`window.putAt=(key,at)=>{const i=state.hand.indexOf(key);if(i<0)return'notinhand '+key+' hand='+state.hand.join();selectCard(i);render();const rot=tutRotFor(key,at);if(rot==null)return'norot';state.rot=rot;for(const[q,r]of BOARD){const c=placeCells(key,rot,q,r);if(c&&tutCellsEq(c,at)){state.preview=previewAt({q,r});const h=hypo();if(!h||!h.ok)return'hypo '+(h&&h.why);render();let pv=0;const pl=!!tutPvLock(),n0=tB(key).length;build();if(pl&&tB(key).length>n0)return'BUILT-WHILE-LOCKED';while(tutPvLock()&&pv<12){document.getElementById('tutMore').click();pv++}build();render();return'built'+(pv?' pv'+pv:'')}}return'noanchor'}`);
 ev(`window.upAt=(key)=>{const i=state.hand.indexOf(key);if(i<0)return'notinhand';const b=tB(key)[0];selectCard(i);for(let rot=0;rot<6;rot++){state.rot=rot;for(const[q,r]of b.cells){state.preview=previewAt({q,r});const h=hypo();if(h&&h.ok&&h.up){build();render();return'up'}}}return'noup'}`);
 const step=()=>ev('state&&state.tut?state.tut.ch+":"+state.tut.i+"."+(state.tut.k||0):"-"');
 const endUI=async()=>{if(MEAS&&ev('state.day')===4)ev('state.tT[state.season]=1');ck('#btnEnd');await sleep(20);for(let g=0;g<80&&ev('state.phase')==='scoring';g++)await sleep(50);if(ev('state.phase')==='review'){ev('render()');ck('#btnEnd');await sleep(20)}};
 const res=[],SNAP=[];const TX=()=>{const o=[];const walk=e=>{if(e.nodeType===3){const t=e.textContent.replace(/\s+/g,' ').trim();if(t)o.push(t);return}if(e.nodeType!==1||e.tagName==='SCRIPT'||e.tagName==='STYLE')return;for(const a of['title','aria-label','placeholder'])if(e.getAttribute&&e.getAttribute(a))o.push('['+a+':'+e.getAttribute(a)+']');for(const c of e.childNodes)walk(c)};walk(d.body);return o.join('\n')};let guard=0,last='',same=0;
 while(guard++<900){ev('render()');SNAP.push(TX());const ph=ev('state.phase'),s=step(),st=ev('JSON.stringify(tutStep()?{only:tutStep().only,at:tutStep().at||null,up:!!tutStep().up,undo:!!tutStep().undo,redraw:!!tutStep().redraw,mv:tutStep().mv||null,btn:tutStep().btn||null,end:!!tutStep().end,read:!!tutStep()._read,lock:tutStep().lock||null,spec:tutStep().spec||null,food:tutStep().food||null,leave:!!tutStep().leave,t:tutText(tutStep()).replace(/<[^>]+>/g,"").slice(0,60)}:null)'),S=JSON.parse(st);
   if(ph==='draft'&&!MEAS){const o=ev('JSON.stringify(state.offer)');if(/[~^#]/.test(o)||ev(`state.offer.some(k=>CARDS[k].hab&&!['wasser','savanne','wueste'].includes(CARDS[k].hab))`))L('BADOFFER',o)}const sig=ph+'|'+s+'|'+ev('state.season')+'|'+ev('state.day');if(V&&sig!==last)L(sig,S?S.t:'');if(sig===last&&ph!=='scoring'){if(++same>3&&S){L('STUCK',sig,st);break}}else same=0;last=sig;
   if(ph==='play'){
     if(S&&S.read){ck('#tutMore')}
     else if(S&&S.up){L('  ',s,'Ausbau',S.only,ev(`upAt('${S.only}')`))}
     else if(S&&S.mv){L('  ',s,'Umzug',ev(`(()=>{const b=tB('${S.mv}')[0];startMove(b);render();const at=tutStep().at;for(let rot=0;rot<6;rot++){state.rot=rot;for(const[q,r]of BOARD){state.preview=previewAt({q,r});const h=hypo();if(h&&h.ok&&tutCellsEq(h.cells,at)){build();render();return'moved'}}}return'nomove'})()`))}
     else if(S&&S.only&&S.only!=='-'&&S.at){L('  ',s,S.only,ev(`putAt('${S.only}',${JSON.stringify(S.at)})`),'bp',ev('state.bp'))}
     else if(S&&S.undo){L('  ',s,'undo',ev('(()=>{try{return String(undo())}catch(e){return e.message}})()'),'flamingos',ev('tB("flamingos").length'),'bp',ev('state.bp'))}
     else if(S&&S.redraw){ck('#btnRedraw');ck('#btnRedraw');L('  ',s,'redraw hand',ev('state.hand.join()'))}
     else if(S&&S.btn){ck('#tutBtn')}
     else if(S&&S.end){await endUI()}
     else if(S){L('UNHANDLED',s,st);break}
     else{ev('botDay();render()');await endUI()}
     if(ev('modal')&&ev('modal')!=='zoo')ck('#mClose');}
   else if(ph==='draft'){ev(`(()=>{if(tutDraft())return pick(0);const base=scoreZoo(state.buildings).total;let bi=0,bv=-1e9;state.offer.forEach((k,i)=>{const b=botBest(k,base),v=b?b.g/costOf(k):-1;if(v>bv){bv=v;bi=i}});pick(bi)})();render()`)}
   else if(ph==='review'){ck('#btnEnd')}
   else if(ph==='seasonWon'||ph==='win'||ph==='lost'){
     if(S&&S.read&&d.querySelector('[data-gmore]')){ck('[data-gmore]');continue}
     const cum=ev('JSON.stringify(state.dayPts.slice(0,state.day+1).reduce((a,x,i)=>{a.push((a[i-1]||0)+x);return a},[]))');res.push({s:ev('state.season'),ph,cum:JSON.parse(cum),money:ev('state.money')});L('SEASON',ev('state.season'),ph,cum,'money',ev('state.money'),'step',s);
     if(ph==='win'){const g=d.querySelector('[data-gend]');L('GEND',!!g,'modal',ev('modal'),d.getElementById('modalRoot').textContent.slice(0,200),g?g.closest('.modal,.overl,body').textContent.slice(0,80):'');if(g){g.click();await sleep(30);L('TUTDONE',ev('JSON.stringify(META.tutDone)'),'screen',ev('screen'))}break}
     if(ph==='lost')break;ev('state.pendingSeason=true;nextDraft();render()')}
   else if(ph==='shop'){
     if(S){if(S.read){if(!ck('[data-gmore]'))break}
       else if(S.lock&&S.lock.kind==='mappe'){L('   spring tabs disabled',ev('[...document.querySelectorAll("[data-shtab]")].map(b=>b.dataset.shtab+":"+b.disabled).join()'));ck('[data-item="f0"]:not([disabled])');ev('render()');L('   mappe',ev('JSON.stringify(state.mappe&&state.mappe.opts)'))}
       else if(S.lock&&S.lock.kind==='sack'){L('   tabs-disabled',ev('[...document.querySelectorAll("[data-shtab]")].filter(b=>b.disabled).length'));ev('buy(fixedItems().find(i=>i.kind==="sack"));render()');L('   sack',ev('JSON.stringify(state.sack&&state.sack.opts)'))}
       else if(S.food){const b=d.querySelector(`[data-fdpick="${S.food}"]`);if(!b){L('NO FOOD BUTTON');break}ck(b);L('   fdl',ev('JSON.stringify(runOf().fdl)'))}
       else if(S.spec){const b=d.querySelector(`[data-mapick="${S.spec}"]`);if(!b){L('NO SPEC BUTTON',ev('state.shopSub'));break}ck(b);L('   spec',ev('state.spec.join()'))}
       else if(S.btn){ck('[data-gstep]')}
       else if(S.leave){L('   tabs',ev('[...document.querySelectorAll("[data-shtab]")].map(b=>b.textContent).join("|")'),'items',ev('fixedItems().map(i=>i.kind).join()'));const nx=[...d.querySelectorAll('.modal button,#modalRoot button')].find(b=>/Weiter zum/.test(b.textContent));if(!nx){L('NO NEXT');break}ck(nx)}
       else{L('SHOP?',st);break}}
     else{ev('botShop();render()');const nx=[...d.querySelectorAll('#modalRoot button')].find(b=>/Weiter zum/.test(b.textContent));if(nx)ck(nx);else if(ev('state.phase')==='shop')ev('beginNextSeason()')}}
   else if(ph==='scoring'){await sleep(50)}
   else{L('PHASE?',ph);break}
   await sleep(5)}
 L('RES',JSON.stringify(res));L('specs',ev('state&&state.spec.join()'),'final',step(),'buildings',ev('state&&state.buildings.length'),'herd',ev('state&&state.tutHerd'));
SNAP.push(TX());const U=SNAP.filter((x,i)=>x!==SNAP[i-1]);fs.writeFileSync(process.env.OUT,U.join('\n=====\n'));L('SNAPS',U.length);}catch(e){console.log('EXC',e.stack)}process.exit(0)})();
