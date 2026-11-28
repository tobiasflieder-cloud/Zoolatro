// 0.99a: Stella stärkstes Gehege, Lebensraum-Prüfung ×0,75/×0,5, Merkmale (ruhig/trubel, Show, Ruhe, Versteck, Revier, Stress direkt, Dschungel), ein Verstärker je Gehege, Lauf-Rückblick
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
 T(ev('VERSION')==='0.99a','Version');
 start(w);ev(H);
 ev(`var D2=(()=>{const s=new Set([hk(...A0),...NB.map(c=>hk(...c))]);const o=[];for(const c of NB)for(const[a,b]of DIRS){const k=hk(c[0]+a,c[1]+b);if(!s.has(k)&&ONBOARD.has(k)&&!o.some(x=>hk(...x)===k))o.push([c[0]+a,c[1]+b])}return o})();var L1=b=>breakdown(b,state.buildings).parts.map(p=>p.label);state.rule=null;`);
 // 3.1 jedes Gastro/Attraktion ruhig oder trubelig
 T(J(`Object.keys(CARDS).filter(k=>!/[~^#]/.test(k)&&['essen','attr'].includes(CARDS[k].cat)&&!CARDS[k].tags.includes('ruhig')&&!CARDS[k].tags.includes('trubel'))`).length===0,'jedes Gastro-Gebäude und jede Attraktion ist ruhig oder trubelig');
 // 3.2 Show
 const sh=J(`(()=>{const s=one(c=>c.cat==='gehege'&&c.tags.includes('show')&&!c.tags.includes('scheu')&&c.key!=='belugas')[0],T3=one(c=>(c.cat==='essen'||c.cat==='attr')&&c.tags.includes('trubel')&&c.key!=='tribuene',3),R1=one(c=>(c.cat==='essen'||c.cat==='attr')&&c.tags.includes('ruhig'))[0];
   const f=L=>{put(L);return L1(state.buildings[0]).find(l=>/Showtier/.test(l))||''};return{t1:f([[s,A0],[T3[0],NB[0]]]),r1:f([[s,A0],[R1,NB[0]]]),t3:f([[s,A0],[T3[0],NB[0]],[T3[1],NB[2]],[T3[2],NB[4]]])}})()`);
 T(/×1,4/.test(sh.t1)&&/gelangweilt/.test(sh.r1)&&/×2,2(?!\d)/.test(sh.t3),`Show (0.9901a): 1 Trubel ×1,4 · nur ruhig gelangweilt · 3 Trubel ×2,2 (${sh.t1} | ${sh.r1} | ${sh.t3})`);
 // 3.3 Ruhe, 3.4 Stress nur direkt, 3.6 Versteck, 3.7 Revier
 const mk=J(`(()=>{const sc=one(c=>c.cat==='gehege'&&c.tags.includes('scheu')&&!c.tags.includes('show')&&c.hab!=='wald')[0],R=one(c=>(c.cat==='essen'||c.cat==='attr')&&c.tags.includes('ruhig'),2),Tr=one(c=>(c.cat==='essen'||c.cat==='attr')&&c.tags.includes('trubel'))[0],
   be=one(c=>c.cat==='gehege'&&c.tags.includes('beute')&&!c.tags.includes('raubtier')&&!c.km)[0],sz=one(c=>c.cat==='schutz')[0],rt=one(c=>c.cat==='gehege'&&c.tags.includes('raubtier')&&!c.tags.includes('beute')&&!c.km)[0],o={};
   put([[sc,A0],[R[0],NB[0]]]);o.r1=L1(state.buildings[0]).join('|');o.R=R;put([[sc,A0],[R[0],NB[0]],[R[1],NB[3]]]);o.r2=L1(state.buildings[0]).join('|');
   put([[sc,A0],[Tr,D2[0]]]);o.st2=evalB(state.buildings[0],state.buildings,mkIndex(state.buildings)).st||0;put([[sc,A0],[Tr,NB[0]]]);o.st1=evalB(state.buildings[0],state.buildings,mkIndex(state.buildings)).st||0;
   put([[be,A0],[sz,NB[0]]]);o.v=L1(state.buildings[0]).join('|');
   put([[rt,A0],[be,D2[0]]]);o.rv=L1(state.buildings[0]).join('|');o.bst2=evalB(state.buildings[1],state.buildings,mkIndex(state.buildings)).st||0;
   put([[rt,A0],[be,NB[0]]]);o.rv1=L1(state.buildings[0]).join('|');o.bst1=evalB(state.buildings[1],state.buildings,mkIndex(state.buildings)).st||0;o.k=[sc,be,rt];return o})()`);
 T(/🤫 Ruhe: ×1,4/.test(mk.r1)&&/🤫 Ruhe: ×1,8/.test(mk.r2),`Ruhe (0.9901a): scheu neben 1 ruhigen ×1,4, neben 2 ×1,8 (${mk.k[0]}: ${mk.r1} // ${mk.r2})`);
 T(mk.st2===0&&mk.st1>=1,`Stress nur durch direkte Nachbarn (2 Felder: ${mk.st2}, daneben: ${mk.st1})`);
 T(/🌿 Versteck: ×1,4/.test(mk.v),`Versteck (0.9901a): Beute neben Naturschutz ×1,4 (${mk.k[1]})`);
 T(/🦷 Revier: ×1,4/.test(mk.rv)&&mk.bst2===0&&!/Revier/.test(mk.rv1)&&mk.bst1>=1,`Revier (0.9901a): Beute 2 Felder entfernt ×1,4 ohne Stress, daneben kein Revier und Beute gestresst (${mk.k[2]})`);
 // 3.5 Dschungelforscher
 const ds=J(`(()=>{const sc=one(c=>c.cat==='gehege'&&c.tags.includes('scheu')&&c.hab==='wald')[0],Tr=one(c=>(c.cat==='essen'||c.cat==='attr')&&c.tags.includes('trubel'))[0];if(!sc)return{skip:1};const r=runOf(),d0=r.deckId;put([[sc,A0],[Tr,NB[0]]]);const a=evalB(state.buildings[0],state.buildings,mkIndex(state.buildings)).st||0;r.deckId='dschungel';syncCtx();const b=evalB(state.buildings[0],state.buildings,mkIndex(state.buildings)).st||0;r.deckId=d0;syncCtx();return{a,b,dk:CTX.dk,sc}})()`);
 T(ds.skip||(ds.a>=1&&ds.b===0),`Dschungelforscher: Dschungel-Gehege ohne Stress (${JSON.stringify(ds)})`);
 // 2. Lebensraum-Prüfung
 const hb=J(`(()=>{const g=one(c=>c.cat==='gehege')[0];put([[g,A0]]);const b=state.buildings[0],c=CARDS[g],Z={insp:'hab',inspHabs:[c.hab]};const a=WINTER_WIRKUNG.fx.hab(b,c,[],state.buildings,Z);Z.hard=1;const h=WINTER_WIRKUNG.fx.hab(b,c,[],state.buildings,Z);return[a&&a.f,h&&h.f,INSP.hab.ht||'']})()`);
 T(hb[0]===.75&&hb[1]===.5&&/×0,5/.test(hb[2]),`Lebensraum-Prüfung ×0,75, verschärft ×0,5 (${JSON.stringify(hb)})`);
 // 1. Stella: tatsächlich stärkstes Gehege (kleiner Aufdruck, Stufe III)
 const stl=J(`(()=>{const G=one(c=>c.cat==='gehege'&&!c.mult&&!c.km,300).map(k=>[k,CARDS[k].a+CARDS[k].s]).sort((x,y)=>x[1]-y[1]),lo=G[0][0],hi=(G.find(x=>x[1]>G[0][1])||G[G.length-1])[0];
   put([['scheinwerfer',A0],[lo,NB[0]],[hi,NB[3]]]);state.buildings[1].lvl=3;const bs=state.buildings,ix=mkIndex(bs),v=n=>{const r=evalB(n,bs,ix);return Math.round(r.a+r.s)};
   const sp=spotOf(bs[0],ix,bs),info=vstInfoHtml(bs[0]);return{lo,hi,pl:CARDS[lo].a+CARDS[lo].s,ph:CARDS[hi].a+CARDS[hi].s,spot:sp&&sp.key,lines:L1(bs[1]).join('|'),info:info.includes(CARDS[lo].name)&&!info.includes(CARDS[hi].name)}})()`);
 T(stl.pl<stl.ph&&stl.spot===stl.lo&&/Stella Starr/.test(stl.lines)&&stl.info,`Stella: ${stl.lo} (Aufdruck ${stl.pl}, Stufe III) statt ${stl.hi} (Aufdruck ${stl.ph}), Info-Feld zeigt dasselbe Gehege`);
 // 3.8 nur ein Verstärker je Gehege
 const vs=J(`(()=>{const g=one(c=>c.cat==='gehege'&&!c.km&&!c.bonus&&c.tags.length===0)[0];put([[g,A0],['futterkueche',NB[0]],['besucherlotse',NB[3]]]);const l=L1(state.buildings[0]),bs=state.buildings,ix=mkIndex(bs);const act=vsActive(bs[0],bs,ix);
   const i1=vstInfoHtml(bs[1]),i2=vstInfoHtml(bs[2]);render();return{n:l.filter(x=>/Chef Carmen|Mia Megaviral/.test(x)).length,act,blk:[i1,i2].some(x=>/wirkt schon/.test(x)),off:document.querySelectorAll('#board .vray.off').length}})()`);
 T(vs.n===1&&!!vs.act&&vs.blk&&vs.off>=1,`nur ein Verstärker wirkt (${vs.act}), der andere zeigt „wirkt schon“ und blassen Strahl (${vs.off})`);
 // 4. Lauf-Rückblick: Schnappschuss, Speichern, Ansicht
 const rp=J(`(()=>{const g=one(c=>c.cat==='gehege',2);put([[g[0],A0],[g[1],NB[0]]]);const r=runOf();r.replay=[];state.season=0;logSeason(1);state.season=1;logSeason(1);state.season=0;const n=JSON.stringify(r.replay).length,S=r.replay[0][0];
   return{n,b:S.b.length,ln:S.b[0][7].length,A:S.A,x:Array.isArray(S.x),g:!!S.g.B}})()`);
 T(rp.b===2&&rp.ln>0&&rp.g&&rp.x&&rp.A>0,`Schnappschuss je Jahreszeit mit Gelände, Gebäuden, Wertungszeilen und Zoo-Faktoren (2 Jahreszeiten: ${rp.n} Zeichen)`);
 ev(`META.replays=[];endRun(false)`);await wait(50);
 T(ev(`!!RPTMP&&!RPTMP.saved&&!runOf()`)!==null&&/💾 Lauf speichern/.test(d.body.textContent),'Zusammenfassung: Knopf „💾 Lauf speichern“');
 const sv=J(`(()=>{const b=document.querySelector('[data-rpsave]');b.click();return{n:META.replays.length,txt:document.body.textContent.includes('Lauf gespeichert')}})()`);
 T(sv.n===1&&sv.txt,'gespeichert in META.replays');
 const vw=J(`(()=>{document.querySelector('[data-rpopen]').click();const o={scr:screen,svg:!!document.querySelector('.rpsvg'),tabs:document.querySelectorAll('[data-rpz]').length};const g=document.querySelector('[data-rpb="0"]');g.dispatchEvent(new MouseEvent('click',{bubbles:true}));o.det=!!document.querySelector('.rpdet .rplines li');document.querySelector('[data-rps="1"]').click();o.s=screenArg.s;return o})()`);
 T(vw.scr==='replay'&&vw.svg&&vw.tabs>=1&&vw.det&&vw.s===1,`Rückblick: Brett, Reiter, Gebäude antippen zeigt Wertung, ▸ nächste Jahreszeit ${JSON.stringify(vw)}`);
 const sz=J(`(()=>{const L=[];for(let i=0;i<22;i++)L.push({date:i+1,h:{n:'x',pts:1},z:[]});META.replays=L.slice(0,20);RPTMP={date:999,saved:0,h:{n:'neu',pts:5},z:[[]]};return rpSave()})()`);
 T(sz===false,'mehr als 20 gespeicherte Läufe: Speichern verlangt erst Löschen');
 dom.window.close();
}catch(e){L('FAIL Absturz',e&&e.stack||e)}})();
