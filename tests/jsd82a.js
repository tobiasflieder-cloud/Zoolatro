// 0.82a: Futter-Liste repariert, kein „locker“ im Testlauf, ehrlicher Ertrag, Gruppen-Bonus, Einstieg ×0,8, Herbst ×1,6, Heizkosten, Kasse rot
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||82;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const start=(w,o={})=>w.eval(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.fbOff=1;META.d4=${o.d4?1:0};META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,1);modal=null;state.ruleIntro=0;state.wishIntro=0;syncCtx();renderAll()`);
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x);await wait(200);start(w);
 T(ev('VERSION')==='0.82a','Version');
 // 1. Futter-Liste: keine zweite .drows-Regel mehr
 const css=[...d.querySelectorAll('style')].map(s=>s.textContent).join('');T((css.match(/\.drows\{/g)||[]).length===1&&/\.dtrows\{/.test(css),'nur noch eine .drows-Regel (Detail-Fenster: .dtrows)');
 ev(`state.phase='shop';openShop();state.shopSub='feed';state.feedF='kf';modal='shop';render()`);T(d.querySelectorAll('#modalRoot .drows .drow').length>0,'Futter verteilen: Liste da');ev(`modal=null;state.shopSub=null;state.phase='play';render()`);
 // 3./4. Gruppen-Bonus und ehrlicher Ertrag
 const wk=ev(`Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&CARDS[k].hab==='wasser'&&!CARDS[k].ms&&SHAPES[CARDS[k].shape].cells.length===1&&!fsLocked(k))`);
 const place=(n,key)=>ev(`(()=>{const free=BOARD.filter(([q,r])=>!TERR.get(hk(q,r)));const L=[];for(const c of free){if(L.length>=${n})break;if(L.some(x=>DIRS.some(([a,b])=>x[0]+a===c[0]&&x[1]+b===c[1])))continue;L.push(c)}state.buildings=L.map((c,i)=>({id:700+i,key:'${key}',cells:[c],lvl:1}));return state.buildings.length})()`);
 T(place(3,wk)===3,'3 Wasser-Gehege gesetzt');ev(`state.spec=['pfleger_wasser'];runOf().spec=['pfleger_wasser'];syncCtx()`);
 const e3=JSON.parse(ev(`JSON.stringify(SPEC.pfleger_wasser.per(state.buildings[0],CARDS['${wk}'],[],state.buildings))`));T(e3&&e3.fa===1.3&&e3.fs===1.3,'3 Wasser-Gehege → je ×1,3 B und N');
 const pl=ev(`breakdown(state.buildings[0],state.buildings).parts.map(p=>p.label).join(' | ')`);T(/💧 Wasser-Pflegerin \(3 Wasser-Gehege\) ×1,3/.test(pl),'Zeile „💧 Wasser-Pflegerin (3 Wasser-Gehege) ×1,3“ ('+pl.slice(0,80)+')');
 T(ev(`specVal('pfleger_wasser')[0]`)==='×1,3','Team-Leiste zeigt ×1,3');
 place(5,wk);ev('syncCtx()');const yt=ev(`specYield('pfleger_wasser')`);T(/5 Gehege\/Gebäude/.test(yt)&&!/vor Multiplikatoren/.test(yt),'„Aktuell pro Tag“ zählt alle 5 Wasser-Gehege ('+yt.replace(/<[^>]+>/g,'')+')');
 const y=JSON.parse(ev(`JSON.stringify(yieldOf((b,c,nb)=>SPEC.pfleger_wasser.per(b,c,nb,state.buildings),'pfleger_wasser','spec'))`)),rr=JSON.parse(ev(`JSON.stringify((()=>{const r1=scoreZoo(state.buildings);const k=CTX.spec;CTX.spec=[];const r0=scoreZoo(state.buildings);CTX.spec=k;return[r1.A-r0.A,r1.S-r0.S]})())`));
 T(y.a===rr[0]&&y.s===rr[1],`Ertrag = Tagesertrag mit minus ohne (${y.a} B, ${y.s} N)`);
 const big=ev(`Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&!CARDS[k].ms&&SHAPES[CARDS[k].shape].cells.length>=3)`);
 const ea=JSON.parse(ev(`JSON.stringify(SPEC.architekt.per({key:'${big}',cells:[[0,0],[1,0],[2,0]],lvl:1},CARDS['${big}'],[],[{key:'${big}',cells:[[0,0],[1,0],[2,0]]},{key:'${big}',cells:[[5,0],[6,0],[7,0]]}]))`));T(ea&&ea.fa===1.2&&ea.fs===1,'Architektin: nur B (2 große → ×1,2)');
 const bd=ev(`Object.keys(CARDS).find(k=>CARDS[k].tags.includes('bedroht')&&CARDS[k].cat==='gehege')`);const eb=JSON.parse(ev(`JSON.stringify(SPEC.artenschuetzer.per({key:'${bd}',cells:[[0,0]]},CARDS['${bd}'],[],[{key:'${bd}',cells:[[0,0]]}]))`));T(eb&&eb.fs===1.15&&eb.fa===1,'Artenschützerin: nur N (1 bedrohtes → ×1,15)');
 T(/je Wasser-Gehege im Zoo/.test(SPEC_fx=ev(`SPEC.pfleger_wasser.fx.join(' ')`)),'Text: „… je Wasser-Gehege im Zoo“ ('+SPEC_fx+')');
 T(ev(`SPEC.pfleger_wasser.schritt`)===.1,'Schrittweite als Daten (schritt 0,1)');
 // 5./6. Einstieg und Herbst
 T(ev(`JSON.stringify([0,1,2,3].map(einTF))`)==='[0.8,0.8,0.8,0.8]','Zoogründer Stufe 1: alle Ziele ×0,8');
 const r2=ev(`seTarget(2,true,1)/seTarget(2,true,0)`);T(Math.abs(r2-1.6)<.02,`Herbstziel Zoo 2 = Zoo 1 × 1,6 (${r2.toFixed(3)})`);
 // 7. Heizkosten
 const hz=JSON.parse(ev(`JSON.stringify((()=>{const o=CTX.zl,w=CTX.winter;CTX.winter=true;CTX.zl={...(o||{}),insp:'frei'};const c0=dayIncome(100,4000,0).care;CTX.zl={...CTX.zl,insp:'heiz',hard:false};const c1=dayIncome(100,4000,0).care;CTX.zl={...CTX.zl,hard:true};const c2=dayIncome(100,4000,0).care;CTX.zl=o;CTX.winter=w;return[c0,c1,c2]})())`));
 T(Math.abs(hz[1]/hz[0]-1.25)<.02&&Math.abs(hz[2]/hz[0]-1.5)<.02,`Heizkosten ×1,25 / verschärft ×1,5 (${hz.join(', ')})`);
 // 8. Kasse rot
 ev(`state.money=-29;render()`);const mo=d.getElementById('money');T(mo.classList.contains('neg')&&mo.textContent==='🪙 −29','Kasse im Minus: rot, „🪙 −29“');
 ev(`state.phase='shop';openShop();state.money=-29;modal='shop';render()`);T(!!d.querySelector('#modalRoot h2 .mneg'),'Shop: Kasse rot');ev('modal=null');
 dom.window.close();
 // 2. kein „locker“ im Testlauf
 dom=neu();w=dom.window;ev=x=>w.eval(x);await wait(150);start(w,{d4:1});
 const rl=JSON.parse(ev(`JSON.stringify((()=>{const L=[];for(let i=0;i<300;i++)L.push(ruleRoll());return L})())`));T(!rl.includes('locker')&&rl.length===300,'Testlauf: „Lockere Bebauung“ nie (300 Ziehungen)');dom.window.close();
 dom=neu();w=dom.window;ev=x=>w.eval(x);await wait(150);start(w);
 T(JSON.parse(ev(`JSON.stringify((()=>{const L=[];for(let i=0;i<300;i++)L.push(ruleRoll());return L})())`)).includes('locker'),'normaler Lauf: „Lockere Bebauung“ möglich');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
