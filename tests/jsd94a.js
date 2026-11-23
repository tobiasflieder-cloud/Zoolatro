// 0.94a: Tribünen-Text, Tages-Zeile mit Zoo-Boni, 4 Tage Standard, Futter auf Gebautes, drei Legendäre, Frost statt Winter-Schilder
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
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
 T(ev('VERSION')==='0.94a','Version');
 // 1. Tribünen-Text
 const tb=J(`(()=>{const h=fxHtml(CARDS.tribuene),t=document.createElement('div');t.innerHTML=h;const L=[...t.querySelectorAll('li')].map(x=>x.textContent);return{L,b:[...t.querySelectorAll('b')].map(x=>x.textContent)}})()`);
 T(tb.L.length===CARDS_N()&&tb.L.some(l=>/^🙈 stört scheue Tiere/.test(l))&&!tb.b.some(b=>/stört scheue/.test(b)),`Tribüne: Zeile ohne „|“ einfach, nicht doppelt (${tb.L.length} Zeilen)`);
 function CARDS_N(){return J('CARDS.tribuene.fx.length')}
 // 3. 4 Tage Standard
 start(w);ev(H+`state.rule=null;team([])`);
 const r4=J(`(()=>{const r=runOf();return{days:r.days,d4:isD4(r),D:DAYS,test:!!r.test,tf:d4TF(),sn:document.getElementById('seasonName').textContent,rt:runText(r)}})()`);
 T(r4.days===4&&r4.d4&&r4.D===4&&!r4.test&&r4.tf===.6&&!/🧪/.test(r4.sn+r4.rt),`neuer Lauf: 4 Tage, Ziele ×0,6, kein 🧪 (${r4.sn})`);
 T(J(`(()=>{const sl=activeSlot(),r=runOf(),S=statOf(sl),b0=S.bestZoo;state.totalScore=999999;statZoo(sl,r,true);return S.bestZoo>b0&&!statOff(r)})()`),'4-Tage-Lauf zählt für Bestwerte');
 w.eval(base.replace('META.d5=0','META.d5=1')+`META.wr=0;META.klassik=(0)?0:1;enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,1);modal=null`);T(J(`(()=>{const r=runOf();return r.days===5&&!isD4(r)&&DAYS===5&&d4TF()===1&&/🐢 5 Tage/.test(runText(r))})()`),'Schalter 🐢 5 Tage: 5 Tage, Ziele ×1, im Protokoll');ev(`META.d5=0`);
 T(J(`(()=>{const a={d4:1,z2:1},b={z2:1};return isD4(a)&&!isD4(b)&&runDays(a)===4&&runDays(b)===5&&!isD4({tut:1,days:4})})()`),'alter Spielstand: mit run.d4 → 4 Tage, ohne → 5 Tage; Tutorial 5 Tage');
 // 4. Futter auf gebaute Gehege
 start(w);ev(H+`state.rule=null;team([])`);
 const fd=J(`(()=>{const g=one(c=>c.cat==='gehege'&&!c.tags.includes('show')&&c.a>0)[0];put([[g,A0],[g,NB[0]]]);runOf().deck.push(g);const f=Object.keys(FOOD).find(f=>fdFits(f,g)&&FOOD[f].r===0&&!FOOD[f].se&&f!=='ho');const v0=scoreZoo(state.buildings).total;state.phase='shop';state.shop={items:[],note:null};state.feedF=f;state.shopSub='feed';modal='shop';renderModal();
   const bt=[...document.querySelectorAll('[data-feedb]')];const tgt=bt[1];tgt.click();const B=state.buildings;return{n:bt.length,f,k0:B[0].key,k1:B[1].key,deck:runOf().deck.includes(B[1].key),dv:scoreZoo(state.buildings).total-v0,head:true}})()`);
 T(fd.n===2&&fd.k0.indexOf('#')<0&&fd.k1.includes('#'+fd.f)&&fd.deck&&fd.dv>0,`gebautes Gehege füttern: genau das angetippte (${fd.k1}), wirkt sofort (+${fd.dv}), im Lauf-Deck`);
 T(J(`(()=>{const b=state.buildings[1];let k=b.key,n=0;for(const f of Object.keys(FOOD))if(fdFits(f,k))n++;while(fdOf(k).length<fdMaxK(k)){const f=Object.keys(FOOD).find(f=>fdFits(f,k));if(!f)break;k=fdKey(k,f)}b.key=k;state.feedF=Object.keys(FOOD)[0];state.shopSub='feed';renderModal();return![...document.querySelectorAll('[data-feedb]')].some(x=>+x.dataset.feedb===b.id)})()`),'Gehege ohne freien Futterplatz wird nicht angeboten');ev(`modal=null;state.shopSub=null;state.phase='play'`);
 // 5. drei Legendäre
 const lg=J(`(()=>{const o={};for(const[id,t]of[['rudel','raubtier'],['fluester','scheu'],['patin','bedroht']]){team([id]);const m=one(c=>c.cat==='gehege'&&c.tags.includes(t)&&c.a>2)[0]||Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&CARDS[k].tags.includes(t)&&!CARDS[k].ms),x=one(c=>c.cat==='gehege'&&!c.tags.includes(t))[0];
   const P=k=>{put([[k,A0]]);const p=[];evalB(state.buildings[0],state.buildings,mkIndex(state.buildings),p);return p.map(q=>q.label+'|'+q.fa+'|'+q.fs).join(';')};o[id]={mit:P(m),ohne:P(x),tier:SPEC[id].tier}}team([]);return o})()`);
 for(const[id,nm]of[['rudel','Rudelführerin'],['fluester','Tierflüsterer'],['patin','Artenpatin']])T(new RegExp(nm+' ×1,75\\|1.75\\|1.75').test(lg[id].mit)&&!new RegExp(nm).test(lg[id].ohne)&&lg[id].tier===3,`${nm}: ×1,75 B und N nur mit Merkmal, legendär`);
 // 2. Tages-Zeile mit Zoo-Boni
 const td=J(`(()=>{state.zl.news=1;state.luckNext=1;state.zl.ban='essen';state.zl.gift=one(c=>c.cat==='gehege')[0];state.phase='play';state.selected=null;render();const T0=document.querySelector('.today');const o={t:T0?T0.textContent:'',sp:T0?[...T0.querySelectorAll('[data-tip]')].map(e=>e.className):[]};state.luckNext=0;state.luckBoost=state.day+'/'+state.season;render();o.now=!!document.querySelector('.today .zl.now');const z=document.querySelector('.today .zn');z.click();o.bub=(document.getElementById('tipBub')||{}).textContent||'';document.body.click();o.zu=!document.getElementById('tipBub');state.zl.news=0;state.zl.ban=null;state.zl.gift=null;state.luckBoost=null;return o})()`);
 T(/📰🎭×1,5/.test(td.t)&&/🎟️⏭️/.test(td.t)&&/💸🍔\+1/.test(td.t)&&/🎁/.test(td.t),`Tages-Zeile: Schilder für Zeitung, Glückslos, Teuerung, Geschenk (${td.t})`);
 T(td.now,'Glückslos am Wirkungstag: „🎟️×2“ leuchtet');T(/Zeitungsartikel: Showtiere ×1,5 bis Zoo-Ende/.test(td.bub)&&td.zu,'Antippen zeigt Sprechblase, Tipp daneben schließt');
 // 6. Frost statt Schilder
 const fr=J(`(()=>{state.zl.insp='gross';state.zl.inspOpts=undefined;state.season=3;syncCtx();const g=one(c=>c.cat==='gehege')[0];put([[g,A0],[g,NB[3]]]);state.phase='play';META.pvOff=0;render();const B=document.getElementById('board');return{wnt:B.querySelectorAll('.trl.wnt.neg').length,fl:B.querySelectorAll('.frostl').length,ff:B.querySelectorAll('.frostf').length,t:(document.querySelector('.today .zw')||{}).textContent||'',pre:(state.season=2,syncCtx(),render(),[B.querySelectorAll('.frostl.pre').length,B.querySelectorAll('.frostf').length,(document.querySelector('.today .zw')||{}).textContent||'']),hit:(state.season=3,syncCtx(),winterHit(state.buildings[0],state.buildings,mkIndex(state.buildings)))}})()`);
 T(fr.hit&&fr.hit.neg&&fr.wnt===0&&fr.fl===2&&fr.ff===2,`Winter: Frost-Rand je Gebäude, kein „❄️×“-Schild (${fr.fl} Ränder)`);
 T(/❄️ 2 Gebäude ×0,75/.test(fr.t),`Winter-Zahl in der Tages-Zeile (${fr.t})`);T(fr.pre[0]===2&&fr.pre[1]===0&&/im Winter: 2 Gebäude/.test(fr.pre[2]),'Herbst: nur gestrichelter Rand, „❄️ im Winter: …“');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
