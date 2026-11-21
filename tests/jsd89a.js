// 0.89a: Schliff – Schwerpunkte, Umbau-Bestätigung, Raubtier-Kenner, Vorschau-Schalter, Eingang, Stufenwahl, Zerklüftet+Eingang, Bratwurst, Frühlingsziel (je eine Prüfung pro Punkt)
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||89;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const slot=`{name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1,fs:{'h:arktis':1,'h:gebirge':1},z2:{st:{grund:4},ch:{}}}`;
const base=`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.fbOff=1;META.d4=0;META.stAll=0;META.pvOff=0;META.slots[0]=${slot};META.lastSlot=0;META.active=0;screen=null;`;
const start=(w,o={})=>w.eval(base+`META.wr=${o.wr?1:0};enterCamp(0,true,'${o.deck||'grund'}','z2',${JSON.stringify(o.habs||['wasser','savanne','wueste'])},NOPROF,${o.stage||1});if(!${o.wr?1:0}){modal=null;state.ruleIntro=0;state.wishIntro=0;state.surprise=null;render()}`);
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x),J=x=>JSON.parse(ev(`JSON.stringify(${x})`));await wait(200);
 T(ev('VERSION')==='0.89a','Version');
 // 1. höchstens 2 Ziele mit demselben Schwerpunkt
 start(w,{wr:1});
 const R=J(`(()=>{const r=runOf(),HS=[['wald','wasser','savanne'],['wald','wueste','gebirge'],['wasser','savanne','wueste'],['wald','arktis','wasser'],['savanne','wueste','gebirge']],o=[];for(let i=0;i<150;i++){r.habs=HS[i%HS.length];r.zoo=i%4;r.wrRoute=[];const f={};for(const q of wrRollOpts0(r))if(q.foc)f[q.foc]=(f[q.foc]||0)+1;o.push(Math.max(0,...Object.values(f)))}r.zoo=0;return o})()`);
 T(R.every(n=>n<=2),`Weltreise: nie 3-mal derselbe Schwerpunkt (150 Auslosungen, höchstens ${Math.max(...R)})`);
 ev(`screenArg.wrSel=0;wrGo(runOf(),screenArg,0);modal=null;state.ruleIntro=0;render()`);
 // 2. Umbau erst nach Bestätigung
 const u0=J(`(()=>{const inv=umbInv();inv.length=0;inv.push('bauplan');state.phase='play';state.umbOpen=true;render();const b=document.querySelector('[data-umbuse="0"]');b.click();return{n:umbInv().length,conf:!!state.umbConf,pop:!!document.getElementById('umbConfPop'),txt:(document.getElementById('umbConfPop')||{}).textContent||''}})()`);
 T(u0.n===1&&u0.conf&&u0.pop&&/Bauplan/.test(u0.txt)&&/Einsetzen/.test(u0.txt),'Umbau antippen: Detail-Fenster, noch nichts verbraucht');
 d.querySelector('#umbConfPop [data-umbcx]').click();T(ev(`umbInv().length===1&&!state.umbConf&&!document.getElementById('umbConfPop')`),'Abbrechen: Umbau bleibt');
 ev(`document.querySelector('[data-umbuse="0"]').click()`);const bp0=ev('state.bp');d.querySelector('#umbConfPop [data-bpok]').click();
 T(ev(`umbInv().length===0&&!state.umbConf`)&&ev('state.bp')===bp0+1,'Einsetzen löst den Umbau aus (Bauplan +1 BP)');
 // 3. Raubtier-Kenner → Natur
 T(ev(`(()=>{const k=Object.keys(CARDS).find(x=>CARDS[x].cat==='gehege'&&(CARDS[x].tags||[]).includes('raubtier')&&!CARDS[x].ms);state.buildings=[{id:1,key:k,cells:[BOARD[0]],lvl:1},{id:2,key:k,cells:[BOARD[5]],lvl:1}];syncCtx();const m=SPEC.k_raub.mult(state.buildings)||{};return !!m.ms&&!m.ma&&/N\\|/.test(SPEC.k_raub.fx[0])})()`),'Raubtier-Kenner wirkt auf Natur (Text „×1 N“)');
 // 4. Schalter Vorschau
 const pv=on=>J(`(()=>{META.pvOff=${on?0:1};state.buildings=[{id:1,key:Object.keys(CARDS).find(x=>CARDS[x].cat==='gehege'&&CARDS[x].hab==='wasser'&&!CARDS[x].ms&&SHAPES[CARDS[x].shape].cells.length===1),cells:[BOARD.find(([q,r])=>!TERR.get(hk(q,r)))],lvl:1}];const k=Object.keys(CARDS).find(x=>CARDS[x].cat==='essen'&&SHAPES[CARDS[x].shape].cells.length===1&&!CARDS[x].rq);state.hand=[k];state.selected=0;state.rot=0;state.phase='play';const b0=state.buildings[0].cells[0],nb=DIRS.map(([a,c])=>[b0[0]+a,b0[1]+c]).find(([q,r])=>ONBOARD.has(hk(q,r))&&!TERR.get(hk(q,r)));state.preview={q:nb[0],r:nb[1]};render();const o={badge:document.querySelectorAll('.badge').length,link:document.querySelectorAll('#board .link').length,ghost:document.querySelectorAll('#board .ghost').length,dT:document.getElementById('dT').textContent};state.selected=null;state.preview=null;render();return o})()`);
 const pOn=pv(1),pOff=pv(0);L(`  Vorschau an: ${JSON.stringify(pOn)} · aus: ${JSON.stringify(pOff)}`);
 T(pOn.badge>0&&pOff.badge===0&&pOff.link===0,'Vorschau aus: keine Schilder und Linien');T(pOff.ghost>0||pOff.dT!=='','Vorschau aus: Umriss bzw. Zähler bleiben');
 T(/data-pvm/.test(ev(`helpHtml()`)),'Schalter „📊 Vorschau“ im Menü');ev('META.pvOff=0');
 // 5. Eingang rundum zubauen erlaubt
 T(ev(`(()=>{state.rule={id:'eingang'};const e=BOARD.find(([q,r])=>DIRS.every(([a,c])=>ONBOARD.has(hk(q+a,r+c))));state.rule.entry=e;const k=Object.keys(CARDS).find(x=>CARDS[x].cat==='essen'&&SHAPES[CARDS[x].shape].cells.length===1);const N=DIRS.map(([a,c])=>[e[0]+a,e[1]+c]);for(const t of N)TERR.delete(hk(...t));state.buildings=N.slice(0,5).map((c,i)=>({id:10+i,key:k,cells:[c],lvl:1}));const w=ruleWhy(state.buildings,[N[5]],k);state.rule=null;return w===null&&!/zugebaut/.test(RULES.eingang.text())})()`),'Eingang darf rundum zugebaut werden');
 // 7. Zerklüftet nie mit Eingang
 T(ev(`(()=>{for(let i=0;i<300;i++)if(ruleRoll('zerkluftet')==='eingang')return false;return true})()`),'ruleRoll: zerklüftet nie mit Eingang (300)');
 const pl=J(`(()=>{const r=runOf(),o=[];for(let i=0;i<120;i++){r.zoo=2+(i%3);r.wrRoute=[];for(const q of wrRollOpts0(r))o.push([q.plan.map,q.rule]);r.maps={}}const wr=r.wr;r.wr=0;for(let i=0;i<80;i++){r.zoo=2+(i%3);r.maps={};const p=rollPlan0(r);o.push([p.map||r.maps[r.zoo],p.rule&&p.rule.id])}r.wr=wr;r.zoo=0;r.maps={};return o})()`);
 T(pl.length>300&&!pl.some(([m,r])=>m==='zerkluftet'&&r==='eingang'),`Pläne: nie zerklüftet + Eingang (${pl.length} Pläne, ${pl.filter(x=>x[1]==='eingang').length} mit Eingang)`);
 T(ev(`(GELAENDE_DATEN.verbotene_paare||[]).some(p=>p[0]==='zerkluftet'&&p[1]==='eingang')`),'verbotene Paare als Daten');
 // 8. Bratwurst nur mit Savanne; jede Nicht-Gehege-Karte mit genau einem Lebensraum im Text hat rq
 T(ev(`CARDS.bratwurst.rq==='savanne'`),'Bratwurstbude braucht Savanne');
 const miss=J(`(()=>{const P=[['wasser',/Wasser/],['savanne',/Savanne/],['wald',/Dschungel/],['wueste',/Wüste/],['arktis',/Arktis/],['gebirge',/Gebirg|Felsen/]],o=[];for(const k of Object.keys(CARDS)){const c=CARDS[k];if(k.includes('~')||k.includes('^')||c.cat==='gehege'||c.cat==='verst'||c.ms||c.gone)continue;const t=(c.fx||[]).join(' ');const hs=P.filter(([h,re])=>re.test(t)).map(x=>x[0]);if(hs.length===1&&!c.rq)o.push(k+':'+hs[0])}return o})()`);
 T(miss.length===0,`Nicht-Gehege-Karten mit einem Lebensraum im Text haben „rq“ (${miss.join(', ')||'alle'})`);
 start(w,{habs:['wasser','wald','wueste']});
 T(ev(`(()=>{const r=runOf(),P=zkPools(r);return![...P.rare,...P.comm].includes('bratwurst')&&!deckCards('geniesser',['wasser','wald','wueste']).includes('bratwurst')})()`),'ohne Savanne: keine Bratwurst in Kartenwahl und Startdeck');
 // 9. Stufen-Ziele nicht im Frühling
 const tg=J(`(()=>{const r=runOf();r.stage=2;const a=[0,1,3].map(i=>seTarget(i,true,1));r.stage=4;const b=[0,1,3].map(i=>seTarget(i,true,1));r.stage=1;return{a,b}})()`);
 T(tg.a[0]===tg.b[0]&&Math.abs(tg.b[1]/tg.a[1]-1.1)<.02,`Stufe 4 gegen Stufe 2: Frühlingsziel gleich, Sommer ×1,1 (${tg.a[1]} → ${tg.b[1]})`);
 T(ev(`STAGES[2].startsWith('Saisonziele ab Sommer ×1,1')`),'Text „Saisonziele ab Sommer ×1,1“');
 // 6. Stufenwahl: Tipp wählt nur, Kasten mit Wirkungen
 ev(base+`screen='cdeck';screenArg={slot:0,zl:'z2',habs:['wasser','savanne','wueste'],prof:NOPROF};renderAll()`);
 d.querySelector('[data-stsel="grund:3"]').click();await wait(20);
 const bx=(d.querySelector('.stbox')||{}).textContent||'';
 T(ev(`screen==='cdeck'&&!activeSlot().run`),'Tipp auf Stufe 3 startet nichts');
 T(/Stufe 3 – das gilt/.test(bx)&&/15 Naturfelder/.test(bx)&&/goldenes Feld/.test(bx)&&/×1,1(?![\d,])/.test(bx)&&/neu/.test(bx),`Kasten zeigt Wirkungen von Stufe 2 und 3 (${bx.slice(0,140)})`);
 T(!!d.querySelector('.stbox [data-cdeck="grund"][data-stage="3"]'),'Knopf „▶ Mit Stufe 3 starten“');
 d.querySelector('[data-stsel="grund:6"]').click();await wait(20);T(/🔒 Stufe 6/.test((d.querySelector('.stbox')||{}).textContent||'')&&!d.querySelector('.stbox [data-cdeck]'),'gesperrte Stufe: Wirkungen und Hinweis, kein Start');
 d.querySelector('[data-stsel="grund:4"]').click();await wait(20);T(/×1,21/.test(d.querySelector('.stbox').textContent),'Stufe 4: Saisonziele ab Sommer ×1,21 zusammengefasst');
 d.querySelector('.stbox [data-cdeck]').click();await wait(20);T(ev(`!!activeSlot().run&&activeSlot().run.stage===4`),'Start über den Knopf mit Stufe 4');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
