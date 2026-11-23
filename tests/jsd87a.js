// 0.87a: Schliff nach den ersten Weltreisen – je eine Prüfung pro Punkt (Liste in CLAUDE.md, Auftrag docs/auftraege/0.87a-schliff-weltreise-arktis.md)
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||87;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const base=`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.fbOff=1;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1,fs:{'h:arktis':1,'h:gebirge':1}};META.lastSlot=0;META.active=0;screen=null;`;
const start=(w,o={})=>w.eval(base+`META.wr=${o.wr?1:0};META.d4=${o.d4?1:0};META.d5=${o.d4?0:1};enterCamp(0,true,'grund','z2',${JSON.stringify(o.habs||['wasser','savanne','wueste'])},NOPROF,1);if(${o.wr?1:0}){screenArg.wrSel=0;runOf().wrOpts[0].rw=null;wrGo(runOf(),screenArg,0)}modal=null;state.ruleIntro=0;state.wishIntro=0;state.surprise=null;render()`);
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x),J=x=>JSON.parse(ev(`JSON.stringify(${x})`));await wait(200);
 T(ev('VERSION')==='0.87a','Version');
 // 1. Naturfläche ändern: bis zu 3 Felder, ein Lebensraum für alle
 start(w);
 const n1=J(`(()=>{const inv=umbInv();inv.length=0;inv.push('natur');state.phase='play';umbUse(0,true);const fr=BOARD.map(c=>hk(...c)).filter(k=>!TERR.get(k)&&!mkIndex(state.buildings).has(k)).slice(0,4);for(const k of fr){const[q,r]=k.split(',').map(Number);umbClick(q,r)}const sel=(state.umbT.sel||[]).slice();render();const fin=document.querySelector('[data-umbfin]');fin.click();umbHab('wasser');return{sel,fr,after:fr.map(k=>TERR.get(k)||null),inv:umbInv().length,mark:!!fin}})()`);
 T(n1.sel.length===3,`Naturfläche ändern: höchstens 3 Felder wählbar (${n1.sel.length})`);T(n1.after.slice(0,3).every(t=>t==='wasser')&&n1.after[3]===null&&n1.inv===0,'drei Felder werden Wasser-Naturfläche, eine Kiste verbraucht');
 T(ev(`UMB.natur.text`).startsWith('Bis zu 3 freie Felder'),'Text „Bis zu 3 freie Felder …“');
 // 2. Früh geschafft im Testlauf 4 Tage: 1 → Futtersack, 2 → Umbaukiste, 3 → Profi-Mappe
 start(w,{d4:1});T(J(`[1,2,3].map(n=>{const r=runOf();r.gifts=[];earlyReward(n);return r.gifts[0]||null})`).join()==='gsack,gumb,gprofi','Testlauf 4 Tage: 1/2/3 Tage früher → Futtersack/Umbaukiste/Profi-Mappe');
 start(w);T(J(`[1,2,3,4].map(n=>{const r=runOf();r.gifts=[];earlyReward(n);return r.gifts[0]||null})`).join()===',gsack,gumb,gprofi','normaler Lauf unverändert (2/3/4 Tage)');
 // 3. + 4. Detail-Fenster: Wirkung auf den Zoo addiert sich genau; Lebensraum-Futter klarer
 const zf=J(`(()=>{const k=Object.keys(CARDS).find(x=>CARDS[x].cat==='gehege'&&CARDS[x].hab==='wasser'&&!CARDS[x].ms&&SHAPES[CARDS[x].shape].cells.length===1);const fr=BOARD.filter(([q,r])=>!TERR.get(hk(q,r)));
   state.buildings=[{id:1,key:k,cells:[fr[0]],lvl:1},{id:2,key:k,cells:[fr[1]],lvl:2}];runOf().fdl={wasser:1};syncCtx();const cur=scoreZoo(state.buildings);
   const res=[];for(const c of fr.slice(2,14)){const b={id:-1,key:k,cells:[c]},all=[...state.buildings,b],h={ok:true,r:scoreZoo(all),b,cells:[c]};const t=document.createElement('div');t.innerHTML='<table>'+zooFxHtml(h,cur).replace(/^.*?<table[^>]*>/,'');
     const rows=[...t.querySelectorAll('tr')].slice(1).map(tr=>({c:tr.className,v:[...tr.children].slice(1).map(td=>td.textContent)})),num=x=>x==='±0'?0:+x.replace('−','-'),sum=rows.find(r=>r.c==='sum'),fx=rows.find(r=>r.c==='fx'),parts=rows.filter(r=>!r.c);
     const zA=parts.filter(r=>!/Sonstiges/.test(r)).length;let a=0,s=0;for(const r of rows){if(r.c)continue;a+=num(r.v[0]);s+=num(r.v[1])}
     res.push({ok:num(sum.v[0])===h.r.A-cur.A&&num(sum.v[1])===h.r.S-cur.S,fx:!!fx,a,s,dA:h.r.A-cur.A,dS:h.r.S-cur.S})}
   const p=[];evalB(state.buildings[0],state.buildings,mkIndex(state.buildings),p);return{res,lab:p.map(x=>x.label).join(' | ')}})()`);
 T(zf.res.length>5&&zf.res.every(r=>r.ok),'Wirkung auf den Zoo: „= Zoo“ ist genau der Zoo-Wert (12 Vorschauen)');
 T(zf.res.every(r=>r.fx||(r.a===r.dA&&r.s===r.dS)),'ohne Zoo-Faktor addieren sich die Zeilen genau zum Zoo-Wert');
 T(/Wasser-Futter .+ \(Stufe 1\)/.test(zf.lab),`Lebensraum-Futter heißt „Wasser-Futter … (Stufe 1)“ (${(zf.lab.match(/[^|]*Futter[^|]*/)||[''])[0].trim()})`);
 // 5. Winter-Bedingungen leicht/schwer; schwere Auflage → nur leichte
 T(ev(`Object.keys(INSP).filter(k=>k!=='frei').every(k=>['leicht','schwer'].includes(INSP[k].stufe))&&INSP.gross.stufe==='schwer'&&INSP.essen.stufe==='leicht'&&!INSP.frei.stufe`),'jede Winter-Bedingung hat eine Stufe (Mindestgröße schwer)');
 start(w,{wr:1});
 const ws=J(`(()=>{const r=runOf(),o=[];for(let i=0;i<30;i++){r.zoo=2+(i%3);r.wrRoute=[];for(const q of wrRollOpts0(r))o.push({lv:q.lv||null,insp:q.plan.insp})}r.zoo=0;return o})()`);
 T(ws.filter(x=>x.lv==='schwer').length>5&&ws.filter(x=>x.lv==='schwer').every(x=>ev(`INSP['${x.insp}'].stufe`)==='leicht'),`schwere Auflage → leichte Winter-Bedingung (${ws.filter(x=>x.lv==='schwer').length} Ziele)`);
 T(ws.some(x=>x.lv!=='schwer'&&ev(`INSP['${x.insp}'].stufe`)==='schwer'),'sonst kommen auch schwere vor');
 T(ev(`(()=>{state.rule={id:'max3'};state.zoo=3;state.season=2;state.day=0;state.money=999;state.zl.swapped=0;state.zl.inspOpts=null;let ok=true;for(let i=0;i<30;i++){state.zl.swapped=0;state.money=999;wSwap();if(INSP[state.zl.insp].stufe!=='leicht')ok=false}return ok})()`),'Tausch der Winter-Bedingung bei schwerer Auflage: nur leichte');
 T(/❄️ (leicht|schwer)/.test(ev(`(()=>{modal='insp';renderModal();const t=document.getElementById('modalRoot').textContent;modal=null;renderModal();return t})()`)),'Winter-Fenster zeigt „❄️ leicht/schwer“');
 // 6. Auswilderung am 1. Sommer- und 1. Herbsttag, nicht im Winter
 const au=J(`(()=>{const r=runOf(),k=r.deck.find(k=>CARDS[k].cat==='gehege');state.rule={id:'auswild'};const go=s=>{state.buildings=[{id:950+s,key:baseK(k),cells:[[0,0]],lvl:1}];state.wrAus={};state.season=s;state.day=0;wrAuswild();return state.buildings.length};return[1,2,3].map(go)})()`);
 T(au.join()==='0,0,1',`Auswilderung im Sommer und Herbst, nicht im Winter (${au})`);
 // 7. Natur-Anteil 0,4
 T(ev(`WRL.natur_anteil`)===0.4,'Weltreise: Natur-Anteil 0,4');
 // 11. Leichter Boden nicht mit Gebirge
 start(w,{wr:1,habs:['wasser','gebirge','wueste']});
 const rw=J(`(()=>{const r=runOf(),o=[];for(let i=0;i<60;i++){r.zoo=2;r.wrRoute=[];r.boni=[];for(const q of wrRollOpts0(r))o.push(q.rw)}r.zoo=0;return o})()`);
 T(!rw.includes('boden')&&rw.some(x=>['gold','helfer','forscher'].includes(x)),'Leichter Boden wird mit Gebirge nicht angeboten');
 // 8. + 10. Arktis-Zone: beim Start nach der Lage auf dem Bildschirm, ⅔ neutral oder Arktis, bleibt beim Drehen
 start(w,{habs:['arktis','wasser','savanne']});
 const nz=J(`(()=>{const out=[];GENHABS=['arktis','wasser','savanne'];for(const mk of Object.keys(MAPS))for(let i=0;i<25;i++){const m=genMap(mk);for(const rot of[viewRotFor(m.cells,mk)]){const N=northOf(m.cells,rot),nk=N.ks.filter(k=>m.terr.get(k)!=='block'),bad=nk.filter(k=>{const v=m.terr.get(k);return HAB[v]&&v!=='arktis'}).length;out.push({mk,n:nk.length,bad,ok:bad*3<=nk.length})}}GENHABS=null;return out})()`);
 const nzBad=nz.filter(x=>!x.ok);L(`  Arktis-Zone: ${nz.length} Gelände, fremde Natur im Norden höchstens ${Math.max(...nz.map(x=>x.bad/x.n)).toFixed(2)}`);
 T(nzBad.length===0,`Arktis-Zone immer ≥ ⅔ neutral oder Arktis (${nzBad.length} Ausreißer ${nzBad.slice(0,3).map(x=>x.mk+' '+x.bad+'/'+x.n).join(', ')})`);
 const nzW=J(`(()=>{const sl=META.slots[0];const r=runOf();r.wr=1;r.habs=['arktis','wasser','savanne'];const o=[];for(let i=0;i<15;i++){r.zoo=i%4;r.wrRoute=[];for(const q of wrRollOpts0(r)){const p=q.plan,t=new Map(p.terr),nk=p.north.ks.filter(k=>t.get(k)!=='block'),bad=nk.filter(k=>{const v=t.get(k);return HAB[v]&&v!=='arktis'}).length;o.push(bad*3<=nk.length)}}r.wr=0;r.zoo=0;return o})()`);
 T(nzW.length>20&&nzW.every(Boolean),`Weltreise-Pläne: Arktis-Zone ≥ ⅔ neutral/Arktis (${nzW.length} Pläne)`);
 T(ev(`(()=>{const N0=JSON.stringify(state.north);const o=ROT;setRot(!o);render();setRot(o);return JSON.stringify(state.north)===N0&&!!state.north&&state.north.ks.length>0})()`),'Zone wird beim Zoo-Start gespeichert und ändert sich beim Drehen nicht');
 T(ev(`(()=>{const c=BOARD.slice(),keep=state.north;let ok=true;for(const rot of[false,true]){state.north=northOf(c,rot);for(const x of c)if(isNorth([x])!==state.north.ks.includes(hk(...x)))ok=false}state.north=keep;return ok})()`),'isNorth folgt der gespeicherten Zone (gedreht und ungedreht)');
 T(ev(`(()=>{const c=[[0,0],[5,0],[0,4],[5,4]];const a=northOf(c,false).ks.sort().join(),b=northOf(c,true).ks.sort().join();return a!==b})()`),'gedrehtes Gelände: obere Hälfte ist eine andere als nach Zeilen');
 // 9. Meilensteine auf Felsen und fremde Naturflächen
 const ms=J(`(()=>{const k=Object.values(MILE).map(M=>M.card).find(x=>CARDS[x]&&SHAPES[CARDS[x].shape].cells.length===1)||Object.values(MILE)[0].card;const c=CARDS[k];const fr=BOARD.filter(([q,r])=>!TERR.get(hk(q,r))&&!mkIndex(state.buildings).has(hk(q,r)));
   const cells=SHAPES[c.shape].cells.map(([q,r])=>[q+fr[0][0],r+fr[0][1]]);if(!cells.every(x=>ONBOARD.has(hk(...x))))return{skip:1};const keep=cells.map(x=>[hk(...x),TERR.get(hk(...x))]);
   cells.forEach((x,i)=>TERR.set(hk(...x),i%2?'arktis':'block'));const a=fits(state.buildings,cells,k);const g=Object.keys(CARDS).find(x=>CARDS[x].cat==='gehege'&&CARDS[x].hab==='wasser'&&!CARDS[x].ms&&SHAPES[CARDS[x].shape].cells.length===1);const b=fits(state.buildings,[cells[0]],g);
   for(const[h,v]of keep){if(v)TERR.set(h,v);else TERR.delete(h)}return{a,b}})()`);
 T(!ms.skip&&ms.a===true&&ms.b===false,'Meilenstein darf auf Felsen und fremde Naturfläche, normales Gehege nicht');
 T(ev(`(()=>{const k=Object.keys(TERR).length;const c=[BOARD.find(([q,r])=>!TERR.get(hk(q,r)))];const h=hk(...c[0]);TERR.set(h,'block');let in_=null;noRocks(c,()=>{in_=TERR.get(h)});const out=TERR.get(h);TERR.delete(h);return in_===undefined&&out==='block'})()`),'Vorschau rechnet ohne die Felsen unter dem neuen Gebäude');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
