// 0.92a: Fotograf/Liebling, Stufe in der Übersicht, Öko-Viertel, Zeitung/Glückslos, Geschenke mit Schulden, Detail-Fenster, Stufe 4, Spezialisten ×1,2, Protokoll, Deck-Übersicht
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
 T(ev('VERSION')==='0.92a','Version');
 start(w,{stage:3});ev(H+`state.rule=null;team([])`);
 // 1. Fotograf nie am Tag des Besucherlieblings
 const f=J(`(()=>{const s=one(c=>c.cat==='gehege'&&c.tags.includes('show'))[0];put([[s,A0],[s,NB[0]]]);let both=0,fav=0,foto=0;for(let i=0;i<4000;i++){state.season=1+(i%3);state.day=i%5;state.momS=null;state.momZ=null;state.foto=null;state.fav=null;dayRoll();if(state.fav!=null)fav++;if(state.foto!=null)foto++;if(state.fav!=null&&state.foto!=null)both++}state.season=0;state.day=0;state.fav=null;state.foto=null;return{both,fav,foto}})()`);
 T(f.both===0&&f.fav>100&&f.foto>10,`Fotograf nie am Tag des Lieblings (4000 Tage: Liebling ${f.fav}, Fotograf ${f.foto}, beides ${f.both})`);
 // 2. Stufe in der Zoo-Übersicht
 ev(`PROFT='lauf';modal='prof';render()`);const zb=(d.querySelector('.modal .zstg')||{}).textContent||'';T(/🏔️ Stufe 3/.test(zb)&&/Stufe 3 – das gilt/.test(zb)&&!d.querySelector('.modal .zstg [data-cdeck]'),'Stufe 3 (seit 0.93a im Profil-Fenster), antippen zeigt die Wirkungen (ohne Start-Knopf)');ev(`modal=null;render()`);
 // 3. Öko-Viertel (Ensemble oeko)
 const pf=J(`(()=>{const N=one(c=>c.cat==='schutz'&&!c.rq,3);put([[N[0],A0],[N[1],NB[0]],[N[2],NB[3]]]);const a=ensOf(state.buildings[0],state.buildings).map(e=>e[0]+' '+e[1]+'/'+e[2]);put([[N[0],A0],[N[0],NB[0]],[N[0],NB[3]]]);return{a,b:ensOf(state.buildings[0],state.buildings).length,n:ENSORD.length,k:!!ENS.oeko&&!ENS.pfad}})()`);
 T(pf.a.length===1&&/Öko-Viertel 1\/1\.25/.test(pf.a[0])&&pf.k&&pf.b===0&&pf.n===6,`Öko-Viertel: 3 verschiedene Naturschutz ×1,25 N (${pf.a}), 3 gleiche nichts`);
 // 4. Zeitung/Glückslos
 const zt=J(`(()=>{state.money=999;openShop();const it={kind:'einmal',key:'zeitung',price:1};buy(it);it2={kind:'einmal',key:'glueckslos',price:1};buy(it2);let z=0,g=0;for(let i=0;i<300;i++)for(const x of genEinmal()){if(x.key==='zeitung')z++;if(x.key==='glueckslos')g++}state.phase='play';modal='zoo';render();const t=document.querySelector('.modal').textContent;modal=null;render();return{news:!!state.zl.news,z,g,chip:/Zeitungsartikel: Showtiere ×1,5/.test(t),lchip:/Glückslos/.test(t)}})()`);
 T(zt.news&&zt.z===0&&zt.g===0&&zt.chip&&zt.lchip,`Zeitung/Glückslos: nach Kauf kein zweites Angebot, Chips in der Zoo-Übersicht`);
 // 5. Geschenke mit Schulden
 const gs=J(`(()=>{state.money=-10;runOf().gifts=['gumb'];openShop();const it=fixedItems().find(i=>i.kind==='gumb');const ok0=canPay(0),ok5=canPay(5);buy(it);const got=state.shopSub==='umbau'&&!(runOf().gifts||[]).length;const c={kind:'card',key:one(c=>c.cat==='essen')[0],price:3};buy(c);state.shopSub=null;state.phase='play';return{ok0,ok5,got,card:!!c.sold,m:state.money}})()`);
 T(gs.ok0&&!gs.ok5&&gs.got&&!gs.card&&gs.m===-10,'Kasse −10: Geschenk abholbar, Karte mit Preis nicht');
 // 6. Detail-Fenster (CSS; Darstellung prüft quer.js Schritt 16)
 T(html.includes('.dsh>*{flex-shrink:0}'),'Detail-Fenster: Inhalte schrumpfen nicht (CSS)');
 // 7. Stufe 4
 const tg=J(`(()=>{const r=runOf(),o={};for(const s of[2,3,5]){r.stage=s;o[s]=[0,1,3].map(i=>seTarget(i,true,1))}r.stage=3;return{o,box:stageBox('grund',3,5,0,false,true)}})()`);
 T(tg.o[3][0]===tg.o[2][0]&&Math.abs(tg.o[3][1]/tg.o[2][1]-1.15)<.02&&Math.abs(tg.o[5][1]/tg.o[2][1]-2/1.15)<.03,`Stufe 3 gegen Stufe 2: Frühling gleich, Sommer ×1,15 (zusammen ×1,32; ${tg.o[2][1]} → ${tg.o[3][1]}), Stufe 5 ×2 gesamt (seit 0.95a)`);
 T(/×1,32/.test(tg.box)&&/Schließen/.test(tg.box),'Stufen-Kasten Stufe 3 zeigt „Saisonziele ab Sommer ×1,32“ (seit 0.95a)');
 // 8. Spezialisten ×1,2
 T(J(`(()=>{const o=[];for(const id of['kl_kueche','ruhlage','naturpur']){const m=SPEC[id].mult([])||{};o.push(m.ma||m.ms)}return o.every(x=>x===1.2)&&SPEC.kl_kueche.fx[0].startsWith('×1,2')})()`),'Kleine Küche, Ruhige Lage, Naturpur ×1,2');
 // 9. Protokoll
 const pr=J(`(()=>{const r=runOf();r.zlog=[];state.ensLog=[];const K=one(c=>c.cat==='attr'&&!c.rq,3);put([[K[0],A0],[K[1],NB[0]],[K[2],NB[3]]]);state.season=1;state.day=2;ensLog();put([]);ensLog();put([[K[0],A0],[K[1],NB[0]],[K[2],NB[3]]]);state.season=2;ensLog();logZoo(false);state.season=0;state.day=0;return runText(r)})()`);
 T(/Ensembles: 🎠 Vergnügungsmeile \(Sommer, Tag 3\)(?! ·)/.test(pr)&&(pr.match(/Vergnügungsmeile/g)||[]).length===1,`Lauf-Protokoll: Ensembles-Zeile, einmal nach erstem Auftreten (${(pr.match(/Ensembles:[^\n]*/)||[''])[0]})`);
 // 10. Deck-Übersicht
 const dm=J(`(()=>{const g=one(c=>c.cat==='gehege'&&c.hab==='wasser'&&c.tags.includes('show'))[0],e=one(c=>c.cat==='essen')[0];const h=deckMixHtml([g,g,g,e,'besucherlotse']);const t=document.createElement('div');t.innerHTML=h;return{t:t.textContent,s:[...t.querySelectorAll('span')].map(x=>x.textContent)}})()`);
 T(dm.s.includes('💧 3')&&dm.s.includes('🎭 3')&&dm.s.includes('🍔 1')&&dm.s.includes('⚡ 1')&&!/🌾|🦁/.test(dm.t),`Deck-Übersicht: richtige Zahlen, nur Vorhandenes (${dm.s.join(' ')})`);
 ev(`(()=>{const r=runOf();r.reward={step:'card',cards:[]};screen='creward';screenArg=r.reward;renderAll()})()`);T(/Dein Lauf-Deck/.test(d.body.textContent)&&!!d.querySelector('.dmix'),'Kartenwahl zwischen den Zoos zeigt die Deck-Zeile');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
