// 0.90a: Schalter „📊 Vorschau“ aus blendet alle vorgerechneten Wirkungen aus (Auswahl-Hinweise, Vorschau-Zahlen, Winter-Wirkungen); Auflagen-Felder und Umriss bleiben; im Tutorial immer an
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||90;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x),J=x=>JSON.parse(ev(`JSON.stringify(${x})`));await wait(200);
 T(ev('VERSION')==='0.90a','Version');
 ev(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.klassik=1;META.fbOff=1;META.d4=0;META.d5=1;META.wr=0;META.klassik=(0)?0:1;META.pvOff=0;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;
   enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,1);modal=null;state.ruleIntro=0;state.wishIntro=0;state.surprise=null;state.rule=null;
   const g=Object.keys(CARDS).find(x=>CARDS[x].cat==='gehege'&&CARDS[x].hab==='wasser'&&!CARDS[x].ms&&SHAPES[CARDS[x].shape].cells.length===1&&(CARDS[x].tags||[]).includes('show'))||Object.keys(CARDS).find(x=>CARDS[x].cat==='gehege'&&CARDS[x].hab==='wasser'&&!CARDS[x].ms&&SHAPES[CARDS[x].shape].cells.length===1);
   const fr=BOARD.filter(([q,r])=>!TERR.get(hk(q,r)));state.buildings=[{id:1,key:g,cells:[fr[3]],lvl:1},{id:2,key:g,cells:[fr[4]],lvl:1}];window._g=g;render()`);
 const look=on=>J(`(()=>{META.pvOff=${on?0:1};state.season=0;const k=Object.keys(CARDS).find(x=>CARDS[x].cat==='essen'&&SHAPES[CARDS[x].shape].cells.length===1&&!CARDS[x].rq);state.hand=[k,_g];state.phase='play';
   state.selected=0;state.preview=null;render();const sel={trl:document.querySelectorAll('#board .trl').length,trm:document.querySelectorAll('#board .bld.trm').length};
   const b0=state.buildings[0].cells[0],nb=DIRS.map(([a,c])=>[b0[0]+a,b0[1]+c]).find(([q,r])=>ONBOARD.has(hk(q,r))&&!TERR.get(hk(q,r))&&!mkIndex(state.buildings).has(hk(q,r)));state.preview={q:nb[0],r:nb[1]};render();
   const inf=document.getElementById('info').innerHTML;pre={badge:document.querySelectorAll('.badge').length,ghost:document.querySelectorAll('#board .ghost').length,zahl:/mknb|resbig|mkchips|class="calc"|Zoo-Wert|resgood|resbad/.test(inf),name:inf.includes(CARDS[k].name)};
   state.selected=null;state.preview=null;state.season=3;state.zl.insp='gross';state.zl.hard=1;state.zl.inspOpts=null;state.zl.inspPicked=1;syncCtx();state.hand=[k];render();
   const win={wnt:document.querySelectorAll('#board .wnt,#board .frostl').length,dead:[...document.querySelectorAll('#hand .card')].filter(c=>c.dataset.dead).length};state.season=0;syncCtx();render();return{sel,pre,win}})()`);
 const A=look(1),B=look(0);L(`  an: ${JSON.stringify(A)}\n  aus: ${JSON.stringify(B)}`);
 T(A.sel.trl+A.sel.trm>0&&B.sel.trl===0&&B.sel.trm===0,'Auswählen: Wechselwirkungs-Schilder und Hervorhebung nur mit Vorschau an');
 T(A.pre.badge>0&&B.pre.badge===0,'Platzieren: Schilder auf dem Brett nur mit Vorschau an');
 T(A.pre.zahl&&!B.pre.zahl&&B.pre.name,'Info-Feld: mit Vorschau aus nur Karteninfo, keine Zahlen der Vorschau');
 T(B.pre.ghost>0,'Umriss bleibt');
 T(A.win.wnt+A.win.dead>0&&B.win.wnt===0&&B.win.dead===0,'Winter-Wirkungen an Gebäuden und Handkarten nur mit Vorschau an');
 T(ev(`(()=>{META.pvOff=1;const t=TUTNOW;TUTNOW=true;const r=pvHide();TUTNOW=t;META.pvOff=0;return r===false})()`),'im Tutorial immer an');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
