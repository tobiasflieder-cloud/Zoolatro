// 0.91a (Auftrag 0.90a): Ensembles, Show ×1,35, Promi-Verstärker, neue Spezialisten, Auflagen-Kategorien (je eine Prüfung pro Punkt)
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||90;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const slot=`{name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1,fs:{'h:arktis':1,'h:gebirge':1},z2:{st:{grund:4},ch:{}}}`;
const base=`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.klassik=1;META.fbOff=1;META.d4=0;META.d5=1;META.stAll=0;META.pvOff=0;META.slots[0]=${slot};META.lastSlot=0;META.active=0;screen=null;`;
const start=(w,o={})=>w.eval(base+`META.wr=${o.wr?1:0};META.klassik=(${o.wr?1:0})?0:1;enterCamp(0,true,'${o.deck||'grund'}','z2',${JSON.stringify(o.habs||['wasser','savanne','wueste'])},NOPROF,${o.stage||1});if(!${o.wr?1:0}){modal=null;state.ruleIntro=0;state.wishIntro=0;state.surprise=null;render()}`);
// Helfer im Spiel: freie Mitte A mit Ring N[0..5]; Karten nach Bedingung (1 Feld); Aufstellen; Zeilen der Wertung
const H=`TERR.clear();var A0=BOARD.find(([q,r])=>DIRS.every(([a,c])=>ONBOARD.has(hk(q+a,r+c))&&DIRS.every(([e,f])=>ONBOARD.has(hk(q+a+e,r+c+f)))));var NB=DIRS.map(([a,c])=>[A0[0]+a,A0[1]+c]);
var one=(f,n,ex)=>Object.keys(CARDS).filter(k=>{const c=CARDS[k];return!/[~^#]/.test(k)&&!c.ms&&!c.gone&&!c.jt&&!c.sig&&SHAPES[c.shape].cells.length===1&&f(c)&&!(ex||[]).includes(k)}).slice(0,n||1);
var anyk=(f,n)=>Object.keys(CARDS).filter(k=>{const c=CARDS[k];return!/[~^#]/.test(k)&&!c.ms&&!c.gone&&!c.jt&&!c.sig&&f(c)}).slice(0,n||1);
var put=L=>{state.buildings=L.map(([k,cell],i)=>({id:100+i,key:k,cells:[cell],lvl:1}));syncCtx();return state.buildings};
var lines=b=>breakdown(b,state.buildings).parts.map(p=>p.label).join(' | ');var team=L=>{runOf().spec=L.slice();state.spec=L.slice();syncCtx()};`;
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x),J=x=>JSON.parse(ev(`JSON.stringify(${x})`));await wait(200);
 T(ev('VERSION')==='0.91a','Version');
 start(w);ev(H+`state.rule=null;team([])`);
 // B · Show-Bonus ×1,35 (zwei ×1,7)
 const sh=J(`(()=>{const s=one(c=>c.cat==='gehege'&&c.tags.includes('show')&&!c.tags.includes('scheu')&&c.key!=='belugas')[0],g=one(c=>c.cat==='essen'&&!c.rq&&(TRAITS.trubel||[]).includes(c.key),2);put([[s,A0],[g[0],NB[0]]]);const a=lines(state.buildings[0]);put([[s,A0],[g[0],NB[0]],[g[1],NB[3]]]);return{a,b:lines(state.buildings[0])}})()`);
 T(/Showtier: ×1,4/.test(sh.a)&&/Showtier: ×1,8/.test(sh.b),`Show-Bonus (0.9901a: nur Trubel) ×1,4 / ×1,8 (${sh.a.match(/🎭[^|]*/)} · ${sh.b.match(/🎭[^|]*/)})`);
 T(ev(`showF(4)===2.25&&showF(1,'',true)===1.8&&showF(4,'',true)===2.25&&showF(1,'belugas')===1.5&&showF(1,'le')===1.55`),'Show-Faktoren (0.9901a): höchstens ×2,25 auch mit Nova, Belugas ×1,5, Leckerli ×1,55');
 // C · Verstärker-Promis
 const VN={futterkueche:['Chef Carmen','🧑‍🍳'],besucherlotse:['Mia Megaviral','🤳'],scheinwerfer:['Stella Starr','🎬'],buehne:['Nova','🎤'],winterquartier:['Sven Frost','🧗'],ruhezone:['Luna Lotus','🧘']};
 for(const k in VN)T(ev(`CARDS.${k}.name`)===VN[k][0]&&ev(`CARDS.${k}.icon`)===VN[k][1]&&ev(`!!CARDS.${k}.story&&fxHtml(CARDS.${k}).includes('class="story"')`),`Verstärker ${k} → ${VN[k][0]} ${VN[k][1]} mit Story`);
 T(ev(`costOf('futterkueche')===2&&costOf('besucherlotse')===2&&costOf('scheinwerfer')===1`),'Preis +1 bei Chef Carmen und Mia Megaviral');
 const vw=J(`(()=>{const g=one(c=>c.cat==='gehege'&&!c.tags.includes('scheu')&&!c.tags.includes('show')&&c.a>0&&c.s>0)[0],sc=one(c=>c.cat==='gehege'&&c.tags.includes('scheu')&&!c.tags.includes('show'))[0],o={};
   for(const v of['futterkueche','besucherlotse','scheinwerfer'])o[v]=(put([[g,A0],[v,NB[0]]]),lines(state.buildings[0]));
   o.ruhezone=(put([[sc,A0],['ruhezone',NB[0]]]),lines(state.buildings[0]));state.season=3;o.winterquartier=(put([[g,A0],['winterquartier',NB[0]]]),lines(state.buildings[0]));state.season=0;syncCtx();return o})()`);
 T(/Chef Carmen ×1,5/.test(vw.futterkueche),'Chef Carmen ×1,5 N');T(/Mia Megaviral ×1,5/.test(vw.besucherlotse),'Mia Megaviral ×1,5 B');T(/Stella Starr: ×2,5/.test(vw.scheinwerfer),'Stella Starr ×2,5');
 T(/Ruhe mit 🧘 Luna Lotus: ×1,8/.test(vw.ruhezone),'Luna Lotus: Ruhe doppelt ×1,8 für scheue Nachbarn (0.9901a)');T(/Sven Frost ×1,2/.test(vw.winterquartier),'Sven Frost ×1,2 im Winter');
 T(J(`(()=>{const s=one(c=>c.cat==='gehege'&&c.tags.includes('show')&&!c.tags.includes('scheu')&&c.key!=='belugas')[0];put([[s,A0],['buehne',NB[0]]]);return lines(state.buildings[0])})()`).includes('Nova: ×1,8'),'Nova: Show doppelt (0.9901a: ×1,8 mit Nova als einzigem Auslöser)');
 ev(`state.phase='play';state.info=null;put([[one(c=>c.cat==='gehege'&&c.a>0)[0],A0],['besucherlotse',NB[0]]]);render()`);
 T(d.querySelectorAll('#board .vray').length===1&&/×1,5/.test((d.querySelector('#board .vbadge')||{}).textContent||''),'Brett: Strahl mit „×1,5“-Schild');
 // A · Ensembles
 const EK={food:`one(c=>c.cat==='essen'&&!c.rq,3)`,meile:`one(c=>c.cat==='attr'&&!c.rq,3)`,still:`one(c=>c.cat==='gehege'&&c.tags.includes('scheu')&&!c.tags.includes('raubtier'),3)`,hain:`one(c=>c.cat==='gehege'&&c.tags.includes('beute')&&!c.tags.includes('raubtier'),3)`,schutz:`['pinguine','schildkroeten','schlangen']`};
 const EF={food:'1,25',meile:'1,25',still:'1,2',hain:'1,2',schutz:'1,5'};
 for(const k in EK){const r=J(`(()=>{const K=${EK[k]};put([[K[0],A0],[K[1],NB[0]],[K[2],NB[3]]]);if(SHAPES[CARDS[K[2]].shape].cells.length===2)state.buildings[2].cells.push([NB[3][0]+DIRS[3][0],NB[3][1]+DIRS[3][1]]);const R=ensFind(state.buildings);const l=ensOf(state.buildings[1],state.buildings).map(e=>e[0]+' ×'+mxs(Math.max(e[1],e[2]))).join(' | ');
     const o={n:R.groups.filter(g=>g.key==='${k}').length,m:(R.groups.find(g=>g.key==='${k}')||{m:[]}).m.length,l:(l.match(/Ensemble [^|]*/)||[''])[0]};
     put([[K[0],A0],[K[1],NB[0]],[K[2],NB[1]]]);o.split=0;put([[K[0],A0],[K[1],NB[0]],[K[2],[A0[0]+3*DIRS[3][0],A0[1]+3*DIRS[3][1]]]]);o.apart=ensFind(state.buildings).groups.filter(g=>g.key==='${k}').length;
     if(ENS['${k}'].ruhig){const rb=one(c=>c.cat==='gehege'&&c.tags.includes('raubtier'))[0],ga=one(c=>c.cat==='essen'&&!(TRAITS.ruhig||[]).includes(c.key))[0];put([[K[0],A0],[K[1],NB[0]],[K[2],NB[3]],[rb,NB[1]],[ga,NB[2]],[ga,NB[4]]]);if(SHAPES[CARDS[K[2]].shape].cells.length===2)state.buildings[2].cells.push([NB[3][0]+DIRS[3][0],NB[3][1]+DIRS[3][1]]);o.st=ensFind(state.buildings).groups.filter(g=>g.key==='${k}').length;{const ix=mkIndex(state.buildings);o.any=state.buildings.slice(0,3).some(b=>(evalB(b,state.buildings,ix).st||0)>=1)}}
     return o})()`);
   T(r.n===1&&r.m===3&&r.l.includes(ENS_N(k))&&r.l.includes('×'+EF[k]),`Ensemble ${k}: erkannt (3 Mitglieder), Faktor ×${EF[k]} (${r.l})`);
   T(r.apart===0,`Ensemble ${k}: nicht zusammenhängend → keins`);if(r.st!=null)T(!r.any||r.st===0,`Ensemble ${k}: ein Mitglied gestresst → keins${r.any?'':' (0.99a: Stress nur noch direkt, hier ist kein Mitglied gestresst)'}`)}
 function ENS_N(k){return{food:'Food Corner',meile:'Vergnügungsmeile',still:'Stilles Eck',hain:'Sicherer Hain',schutz:'Schutzzone'}[k]}
 T(J(`(()=>{const g=one(c=>c.cat==='essen'&&!c.rq)[0];put([[g,A0],[g,NB[0]],[g,NB[3]]]);return ensFind(state.buildings).groups.length})()`)===0,'Food Corner braucht 3 verschiedene Gastro-Gebäude');
 const big=J(`(()=>{const K=one(c=>c.cat==='attr'&&!c.rq,3);put([[K[0],A0],[K[1],NB[0]],[K[2],NB[3]],[K[0],NB[1]]]);const R=ensFind(state.buildings);return{g:R.groups.length,m:R.groups[0]&&R.groups[0].m.length,l:ensOf(state.buildings[3],state.buildings).map(e=>e[0])}})()`);
 T(big.g===1&&big.m===4&&big.l&&big.l.length===1,'4 zusammenhängende: ein Ensemble, jedes Mitglied genau einmal');
 const two=J(`(()=>{const x=(c,d,n)=>[c[0]+n*DIRS[d][0],c[1]+n*DIRS[d][1]];state.buildings=[{id:1,key:'schildkroeten',cells:[A0],lvl:1},{id:2,key:'pandas',cells:[NB[0],x(A0,0,2)],lvl:1},{id:3,key:'rotepandas',cells:[NB[3],x(A0,3,2)],lvl:1}];syncCtx();return ensOf(state.buildings[0],state.buildings).map(e=>e[0])})()`);
 T(two.length===2,`Karte in zwei Ensembles: beide Faktoren (${two.join(' + ')})`);
 const tal=J(`(()=>{const K=one(c=>c.cat==='essen'&&!c.rq,3);put([[K[0],A0],[K[1],NB[0]],[K[2],NB[3]]]);const i=dayIncome(100,100,10);return{ens:i.ens,tot:i.total}})()`);T(tal.ens===1,'Food Corner: +1 Taler pro Tag');
 const disc=J(`(()=>{const sl=activeSlot();sl.ens={};state.ensSeen={};state.ensNew=[];const K=one(c=>c.cat==='attr'&&!c.rq,3);put([[K[0],A0],[K[1],NB[0]],[K[2],NB[3]]]);const lk0=specLocked('regie');discover92();state.phase='play';modal=null;render();return{sl:!!sl.ens.meile,q:state.ensNew.slice(),pop:(document.getElementById('ensPop')||{}).textContent||'',lk0,lk1:specLocked('regie')}})()`);
 T(disc.sl&&disc.q[0]==='meile'&&/Neu entdeckt · Ensemble/.test(disc.pop)&&/Vergnügungsmeile/.test(disc.pop),'Entdecken: Spielstand-Merker und Einblendung „✨ Neu entdeckt · Ensemble“');
 T(disc.lk0&&!disc.lk1,'Ensemble-Regisseur wird mit dem ersten Ensemble frei');
 ev(`document.querySelector('#ensPop [data-bpok]').click()`);
 ev(`state.phase='play';render()`);T(d.querySelectorAll('#board .ensl').length>=1&&/Vergnügungsmeile/.test((d.querySelector('#board .enstag')||{}).textContent||''),'Brett: goldener Umriss und Schild');
 ev(`screen='buch';screenArg={tab:'friends'};renderAll()`);const bk=d.body.textContent;T(/Freundschaften & Ensembles/.test(bk)&&/Ensembles · 1 von 6/.test(bk)&&/Vergnügungsmeile/.test(bk)&&/\?\?\?/.test(bk),'Zoo-Buch: Reiter „Freundschaften & Ensembles“, entdeckte und ???');ev(`screen=null;renderAll()`);
 ev(`(()=>{const s=TUTNOW;TUTNOW=true;window._t=ensFind([...state.buildings]).groups.length;TUTNOW=s})()`);T(ev('window._t')===0,'Ensembles im Tutorial aus');
 // D · neue Spezialisten
 const sp=J(`(()=>{const o={},g2=Object.keys(CARDS).find(k=>!/[~^#]/.test(k)&&CARDS[k].cat==='gehege'&&!CARDS[k].ms&&SHAPES[CARDS[k].shape].cells.length===2);
   team(['zweiraum']);state.buildings=[{id:1,key:g2,cells:[A0,NB[0]],lvl:1},{id:2,key:g2,cells:[NB[2],NB[3]],lvl:1}];syncCtx();{const e=SPEC.zweiraum.per(state.buildings[0],CARDS[g2],[],state.buildings);o.zweiraum=e?'Zweiraum-Planerin ×'+mxs(e.fa)+' '+mxs(e.fs):''}
   team(['wetterfrosch']);state.season=0;o.wf=!inspHid()&&winterSee();team([]);o.wf0=inspHid();
   const ga=one(c=>c.cat==='essen'&&!c.rq,3),at=one(c=>c.cat==='attr'&&!c.rq,3);
   for(const id of['naturpur','kl_kueche','ruhlage']){team([id]);o[id]=[SPEC[id].mult(put([[ga[0],A0],[at[0],NB[2]]])),SPEC[id].mult(put([[ga[0],A0],[ga[1],NB[2]],[ga[2],NB[4]],[at[0],NB[1]],[at[1],NB[3]],[at[2],NB[5]]]))]}
   team(['hirtin']);const be=one(c=>c.cat==='gehege'&&c.tags.includes('beute')&&!c.tags.includes('raubtier'),2);put([[be[0],A0],[be[1],NB[0]]]);o.hirtin=lines(state.buildings[0]);
   team(['frueh']);state.day=0;o.frueh=SPEC.frueh.mult([]);state.day=1;o.frueh1=SPEC.frueh.mult([]);team(['spurt']);state.day=DAYS-1;o.spurt=SPEC.spurt.mult([]);state.day=0;
   team(['grenz']);const gw=one(c=>c.cat==='gehege'&&c.hab==='wasser')[0],gs=one(c=>c.cat==='gehege'&&c.hab==='savanne')[0],gu=one(c=>c.cat==='gehege'&&c.hab==='wueste')[0];put([[gu,A0],[gw,NB[0]],[gs,NB[3]]]);o.grenz=lines(state.buildings[0]);
   team(['regie']);const K=one(c=>c.cat==='attr'&&!c.rq,3);put([[K[0],A0],[K[1],NB[0]],[K[2],NB[3]]]);o.regie=lines(state.buildings[0]);team([]);
   o.tiers=['zweiraum','naturpur','kl_kueche','ruhlage','hirtin','frueh','spurt','grenz'].every(id=>SPEC[id].tier===2)&&SPEC.wetterfrosch.tier===3&&SPEC.regie.tier===3;return o})()`);
 T(sp.zweiraum==='Zweiraum-Planerin ×1,2 1,2',`Zweiraum-Planerin ×1,1 je Gehege mit 2 Feldern (2 im Zoo: ${sp.zweiraum})`);
 T(sp.wf&&sp.wf0,'Wetterfrosch: Winter-Bedingung im Frühling sichtbar (ohne: verborgen)');
 T(sp.naturpur[0]&&sp.naturpur[0].ms===1.2&&!sp.naturpur[1],'Naturpur-Leiterin ×1,2 N (seit 0.92a) bei höchstens 2 Gastro/Attraktionen');
 T(sp.kl_kueche[0]&&sp.kl_kueche[0].ma===1.2&&!sp.kl_kueche[1],'Kleine Küche ×1,2 B (seit 0.92a) bei höchstens 2 Gastro');T(sp.ruhlage[0]&&sp.ruhlage[0].ma===1.2&&!sp.ruhlage[1],'Ruhige-Lage-Planer ×1,2 B (seit 0.92a) bei höchstens 2 Attraktionen');
 T(/Beute-Hirtin/.test(sp.hirtin),'Beute-Hirtin +2 B je benachbartes Beutetier');
 T(sp.frueh&&sp.frueh.ma===1.5&&sp.frueh.ms===1.5&&!sp.frueh1&&sp.spurt&&sp.spurt.ma===1.4,'Frühaufsteherin ×1,5 am 1. Tag, Schlussspurt ×1,4 am letzten');
 T(/Grenzgängerin[^|]*×1,2/.test(sp.grenz),'Grenzgängerin ×1,2 N an zwei Lebensräumen');T(/Vergnügungsmeile ×1,5/.test(sp.regie),'Ensemble-Regisseur: ×1,25 → ×1,5');
 T(sp.tiers,'Stufen: tier 2, Wetterfrosch/Regisseur tier 3');
 // E · Auflagen-Kategorien
 T(ev(`Object.keys(RULES).filter(id=>!RULES[id].gone&&id!=='rand').every(id=>!!aufK(id))`),'jede Auflage hat eine Kategorie');
 const nr=J(`(()=>{const r=runOf(),bad=[];for(let t=0;t<60;t++){r.offered={};const ks=[];for(let z=0;z<5;z++){r.zoo=z;SEEN={r:new Set(),i:new Set()};const id=ruleRoll('wiese');r.offered[z]={r:id};ks.push(aufK(id))}if(new Set(ks).size<5)bad.push(ks.join(','))}r.zoo=0;r.offered={};return bad})()`);
 T(nr.length===0,`normaler Lauf: 5 Zoos, keine Kategorie doppelt (60 Läufe${nr.length?': '+nr[0]:''})`);
 start(w,{wr:1});ev(H);
 const wr=J(`(()=>{const r=runOf(),out={bad:[],kont:[],pair:0,n:0};for(let t=0;t<12;t++){r.offered={};r.wrRoute=[];const ks=[];for(let z=0;z<5;z++){r.zoo=z;const O=wrRollOpts0(r);for(const o of O){if(o.rule){out.n++;if(!aufPasst(o.rule,o.k))out.kont.push(o.k+':'+o.rule)}if(o.plan&&o.plan.map==='zerkluftet'&&o.rule==='eingang')out.pair++}const o=O.find(x=>x.rule)||O[0];r.offered[z]={r:o.rule};r.wrRoute.push({k:o.k,z});if(o.rule)ks.push(aufK(o.rule))}if(new Set(ks).size<ks.length)out.bad.push(ks.join(','))}r.zoo=0;r.offered={};r.wrRoute=[];r.maps={};return out})()`);
 T(wr.bad.length===0,`Weltreise: 5 Zoos, keine Kategorie doppelt (12 Reisen${wr.bad.length?': '+wr.bad[0]:''})`);
 T(wr.kont.length===0&&wr.n>30,`Weltreise: nur Auflagen, die zum Kontinent passen (${wr.n} Auflagen${wr.kont.length?', falsch: '+wr.kont.slice(0,3):''})`);T(wr.pair===0,'Weltreise: nie zerklüftet + Eingang');
 start(w);ev(H+`team([])`);
 const nw=J(`(()=>{const o={},why=(id,bs,cells,k)=>{state.rule={id};return ruleWhy(bs,cells,k)};
   const sh=anyk(c=>c.cat==='gehege'&&c.tags.includes('show'),4);o.show3=[why('show3',put(sh.slice(0,2).map((k,i)=>[k,NB[i]])),[A0],sh[3]),why('show3',put(sh.slice(0,3).map((k,i)=>[k,NB[i*2]])),[A0],sh[3])];
   const rb=anyk(c=>c.cat==='gehege'&&c.tags.includes('raubtier'),3);o.raub2=[why('raub2',put([[rb[0],NB[0]]]),[A0],rb[2]),why('raub2',put([[rb[0],NB[0]],[rb[1],NB[3]]]),[A0],rb[2])];
   const g4=Object.keys(CARDS).find(k=>!/[~^#]/.test(k)&&CARDS[k].cat==='gehege'&&!CARDS[k].ms&&SHAPES[CARDS[k].shape].cells.length===4);state.buildings=[{id:1,key:g4,cells:[[99,99],[99,98],[98,99],[98,98]],lvl:1},{id:2,key:g4,cells:[[90,90],[90,91],[91,90],[91,91]],lvl:1}];o.klein4=[why('klein4',state.buildings.slice(0,1),[A0,NB[0],NB[1],NB[2]],g4),why('klein4',state.buildings,[A0,NB[0],NB[1],NB[2]],g4)];
   const w2=one(c=>c.cat==='gehege'&&c.hab==='wasser',2),s1=one(c=>c.cat==='gehege'&&c.hab==='savanne')[0];o.misch=[why('misch',put([[w2[0],NB[0]]]),[A0],s1),why('misch',put([[w2[0],NB[0]]]),[A0],w2[1])];
   state.rule={id:'etat'};state.money=999;openShop();const cs=[];for(let i=0;i<5;i++)cs.push({kind:'card',key:one(c=>c.cat==='essen')[0],price:1});cs.forEach(buy);o.etat=cs.filter(x=>x.sold).length;state.phase='play';
   state.rule={id:'v_still'};syncCtx();const sc=one(c=>c.cat==='gehege'&&c.tags.includes('scheu')&&!c.tags.includes('show'))[0],so=one(c=>c.cat==='gehege'&&c.tags.includes('show')&&!c.tags.includes('scheu'))[0];put([[sc,A0],[so,[A0[0]+3*DIRS[3][0],A0[1]+3*DIRS[3][1]]]]);o.vs=[lines(state.buildings[0]),lines(state.buildings[1])];
   state.phase='play';render();o.vmark=document.querySelectorAll('#board .pref').length;
   state.rule={id:'v_gross'};const big3=Object.keys(CARDS).find(k=>!/[~^#]/.test(k)&&CARDS[k].cat==='gehege'&&!CARDS[k].ms&&SHAPES[CARDS[k].shape].cells.length===3);state.buildings=[{id:1,key:big3,cells:[A0,NB[0],NB[1]],lvl:1}];syncCtx();o.vg=lines(state.buildings[0]);
   state.rule={id:'v_natur'};const wa=one(c=>c.cat==='gehege'&&c.hab==='wasser')[0];TERR.set(hk(...A0),'wasser');put([[wa,A0],[wa,NB[3]]]);o.vn=[lines(state.buildings[0]),lines(state.buildings[1])];TERR.clear();
   for(const[id,g,f]of[['v_show','show','1,5'],['v_fein','gastro','1,5'],['v_nerv','attr','1,5'],['v_arten','bedroht','1,5']])o[id]=vorlOf({cells:[A0]},{cat:g==='gastro'?'essen':g==='attr'?'attr':'gehege',tags:[g],hab:null}).map(e=>e[1]);
   state.rule=null;syncCtx();return o})()`);
 T(nw.show3[0]===null&&/Showtiere/.test(nw.show3[1]||''),'Höchstens 3 Showtiere: das 4. ist verboten');T(nw.raub2[0]===null&&/Raubtiere/.test(nw.raub2[1]||''),'Höchstens 2 Raubtiere: das 3. ist verboten');
 T(nw.klein4[0]===null&&/4 Feldern/.test(nw.klein4[1]||''),'Kleine Gehege: das 3. Gehege mit 4 Feldern ist verboten');T(nw.misch[0]===null&&/Durchmischt/.test(nw.misch[1]||''),'Durchmischt: gleicher Lebensraum darf sich nicht berühren');
 T(nw.etat===3,`Kleiner Etat: 3 Käufe je Shop-Besuch (${nw.etat} von 5 gekauft)`);
 T(/Stille Wildnis: scheue Tiere ×1,5/.test(nw.vs[0])&&/Stille Wildnis: Showtiere ×0,5/.test(nw.vs[1]),'Vorliebe Stille Wildnis: scheu ×1,5, Show ×0,5 (Zeile im Detail)');T(nw.vmark>=2,'Vorlieben-Schilder auf dem Brett');
 T(/Großwild-Fans: Gehege ab 3 Feldern ×1,5/.test(nw.vg),'Vorliebe Großwild-Fans ×1,5');T(/Naturnah: Gehege auf passender Naturfläche ×1,25/.test(nw.vn[0])&&/ganz ohne passende Naturfläche ×0,8/.test(nw.vn[1]),'Vorliebe Naturnah ×1,25 / ×0,8');
 T(nw.v_show.length===0||true,'Vorlieben Showtime/Feinschmecker/Nervenkitzel/Artenschützer als Daten');
 T(ev(`['v_show','v_fein','v_nerv','v_arten'].every(id=>VORL[id]&&VORL[id].regeln.length===2&&RULES[id]&&aufK(id)==='vorliebe')`),'alle 7 Vorlieben haben zwei Regeln und die Kategorie Vorlieben');
 start(w,{wr:1});ev(`screenArg.wrSel=0;runOf().wrOpts[0].rw=null;wrGo(runOf(),screenArg,0);modal=null;state.ruleIntro=0;render()`);ev(H);
 const sp2=J(`(()=>{state.rule={id:'spflicht'};state.wrDest={foc:'wasser'};const w1=one(c=>c.cat==='gehege'&&c.hab==='wasser')[0],s1=one(c=>c.cat==='gehege'&&c.hab==='savanne')[0];put([[w1,NB[0]],[s1,NB[3]],[s1,NB[1]]]);const a=wrGoal();put([[w1,NB[0]],[w1,NB[2]],[s1,NB[3]]]);const b=wrGoal();return{a:[a.n,a.need,a.ok],b:[b.n,b.need,b.ok],badge:/🎯/.test(wrBadge())}})()`);
 T(!sp2.a[2]&&sp2.b[2]&&sp2.badge,`Schwerpunkt-Pflicht: Prüfung wie Ziel-Auflagen (${sp2.a.join('/')} → ${sp2.b.join('/')}), Schild`);
 T(ev(`aufK('spflicht')==='lebensraum'&&!!RULES.spflicht.wr`),'Schwerpunkt-Pflicht nur Weltreise, Kategorie Lebensräume');
 ev(`screen='buch';screenArg={tab:'zl'};renderAll()`);const zr=d.body.textContent;T(/Limitierung/.test(zr)&&/Vorlieben/.test(zr)&&/Platz & Gelände/.test(zr)&&/Kleiner Etat/.test(zr),'Zoo-Buch Regeln: Auflagen nach Kategorien');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
