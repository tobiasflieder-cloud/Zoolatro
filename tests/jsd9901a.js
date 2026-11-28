// 0.9901a: Icons mit 2 Emojis, Merkmale ×1,4, Promis je Merkmal (Luna, Wanda, Rocco, Rosa), ein Verstärker je Gehege, Auswilderung Herbst, Futter nur Lauf-Deck, Freischaltung
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
 T(ev('VERSION')==='0.9901a','Version');
 start(w);ev(H);
 ev(`var D2=(()=>{const s=new Set([hk(...A0),...NB.map(c=>hk(...c))]);const o=[];for(const c of NB)for(const[a,b]of DIRS){const k=hk(c[0]+a,c[1]+b);if(!s.has(k)&&ONBOARD.has(k)&&!o.some(x=>hk(...x)===k))o.push([c[0]+a,c[1]+b])}return o})();var L1=b=>breakdown(b,state.buildings).parts.map(p=>p.label).join('|');state.rule=null;var vsOn=k=>{const sl=activeSlot();sl.vu=sl.vu||{};sl.vu[k]=1};['tarnzelt','faehrte','artengala','ruhezone','besucherlotse'].forEach(vsOn);`);
 // 1. Icons
 const ic=J(`(()=>{const a=icSplit(CARDS.addax.icon),e=icSplit(CARDS.eisbaeren?CARDS.eisbaeren.icon:'🐻‍❄️');state.hand=['addax'];state.phase='play';state.selected=null;render();const h=document.querySelector('#hand .mk-ic');return{a,e,hx:h?(h.querySelector('.icx')||{}).textContent:null,ht:h?h.firstChild&&h.firstChild.textContent:null}})()`);
 T(ic.a[0]==='🦌'&&ic.a[1]==='🏜️'&&ic.hx==='🏜️','Addax: großes 🦌, Abzeichen 🏜️ (auch auf der Handkarte)');
 T(ic.e[1]===''&&[...ic.e[0]].length>1,'Eisbär 🐻‍❄️ bleibt ein Emoji ohne Abzeichen');
 // 2. MERK ×1,4
 const mk=J(`(()=>{const sh=one(c=>c.cat==='gehege'&&c.tags.includes('show')&&!c.tags.includes('scheu')&&c.key!=='belugas')[0],tr=one(c=>(c.cat==='essen'||c.cat==='attr')&&c.tags.includes('trubel')&&c.key!=='tribuene',3),ru=one(c=>(c.cat==='essen'||c.cat==='attr')&&c.tags.includes('ruhig'))[0],
   sc=one(c=>c.cat==='gehege'&&c.tags.includes('scheu')&&!c.tags.includes('show')&&c.hab!=='wald')[0],be=one(c=>c.cat==='gehege'&&c.tags.includes('beute')&&!c.tags.includes('raubtier')&&!c.km&&!c.tags.includes('bedroht'))[0],sz=one(c=>c.cat==='schutz')[0],rt=one(c=>c.cat==='gehege'&&c.tags.includes('raubtier')&&!c.tags.includes('beute')&&!c.km)[0],o={};
   put([[sh,A0],[tr[0],NB[0]]]);o.sh=L1(state.buildings[0]);put([[sh,A0],[tr[0],NB[0]],[tr[1],NB[2]],[tr[2],NB[4]]]);o.sh3=L1(state.buildings[0]);
   put([[sc,A0],[ru,NB[0]]]);o.ru=L1(state.buildings[0]);put([[be,A0],[sz,NB[0]]]);o.ve=L1(state.buildings[0]);put([[rt,A0],[be,D2[0]]]);o.rv=L1(state.buildings[0]);
   o.k={sh,sc,be,rt};return o})()`);
 T(/Showtier: ×1,4/.test(mk.sh)&&/🤫 Ruhe: ×1,4/.test(mk.ru)&&/🌿 Versteck: ×1,4/.test(mk.ve)&&/🦷 Revier: ×1,4/.test(mk.rv),`je 1 Auslöser ×1,4: Show, Ruhe, Versteck, Revier (${JSON.stringify(mk.k)})`);
 T(J(`[showF(4),merkF(4,MERK.ruhe),merkF(9,MERK.revier),showF(1,'belugas'),showF(1,'le')]`).join()==='2.25,2.25,2.25,1.5,1.55',`Deckel ×2,25, Belugas ×1,5, Leckerli ×1,55 (3 Trubel: ${mk.sh3.match(/Showtier: ×[\d,]+/)})`);
 // 3. Promis je Merkmal
 const pr=J(`(()=>{const sc=one(c=>c.cat==='gehege'&&c.tags.includes('scheu')&&!c.tags.includes('show')&&c.hab!=='wald')[0],be=one(c=>c.cat==='gehege'&&c.tags.includes('beute')&&!c.tags.includes('raubtier')&&!c.km&&!c.tags.includes('bedroht'))[0],rt=one(c=>c.cat==='gehege'&&c.tags.includes('raubtier')&&!c.tags.includes('beute')&&!c.km)[0],
   bd=one(c=>c.cat==='gehege'&&c.tags.includes('bedroht'))[0],nb=one(c=>c.cat==='gehege'&&!c.tags.includes('bedroht')&&!c.tags.includes('scheu')&&!c.tags.includes('beute'))[0],o={};
   put([[sc,A0],['ruhezone',NB[0]]]);o.lu=L1(state.buildings[0]);put([[be,A0],['tarnzelt',NB[0]]]);o.wa=L1(state.buildings[0]);put([[rt,A0],['faehrte',NB[0]]]);o.ro=L1(state.buildings[0]);
   put([[bd,A0],['artengala',NB[0]]]);o.ra=L1(state.buildings[0]);put([[nb,A0],['artengala',NB[0]]]);o.ra0=L1(state.buildings[0]);
   o.c=['tarnzelt','faehrte','artengala'].map(k=>[CARDS[k].rar,CARDS[k].cat,CARDS[k].tags.includes('einmalig'),zkW({spec:[]},k),!!(TXT.de.card[k]||{}).story]);return o})()`);
 T(/🤫 Ruhe mit 🧘 Luna Lotus: ×1,8/.test(pr.lu)&&!/×1,25/.test(pr.lu),`Luna Lotus: Ruhe doppelt ×1,8, kein ×1,25 N mehr (${pr.lu})`);
 T(/🌿 Versteck mit 🏕️ Wanda Wildnis: ×1,8/.test(pr.wa)&&/🦷 Revier mit 🥾 Rocco Revier: ×1,8/.test(pr.ro),'Wanda Wildnis ×1,8 Versteck, Rocco Revier ×1,8 Revier');
 T(/Rosa Rettung/.test(pr.ra)&&!/Rosa Rettung/.test(pr.ra0),'Rosa Rettung: ×1,5 N nur für bedrohte Nachbarn');
 T(pr.c.every(x=>x[0]==='sehr selten'&&x[1]==='verst'&&x[2]&&x[3]===3&&x[4]),'neue Promis legendär, einzigartig, Gewicht 3, mit Story');
 // 3. ein Verstärker je Gehege: Luna und Mia am selben scheuen Gehege
 const one1=J(`(()=>{const sc=one(c=>c.cat==='gehege'&&c.tags.includes('scheu')&&!c.tags.includes('show')&&c.hab!=='wald')[0];put([[sc,A0],['ruhezone',NB[0]],['besucherlotse',NB[3]]]);const l=L1(state.buildings[0]),bs=state.buildings,ix=mkIndex(bs);return{l,act:vsActive(bs[0],bs,ix),n:(l.match(/Luna Lotus|Mia Megaviral/g)||[]).length,i:[vstInfoHtml(bs[1]),vstInfoHtml(bs[2])].some(x=>/wirkt schon/.test(x))}})()`);
 T(one1.n===1&&!!one1.act&&one1.i,`Luna und Mia am selben Gehege: nur ${one1.act} wirkt, der andere „wirkt schon“`);
 // 4. Auswilderung nur am 1. Herbsttag
 const au=J(`(()=>{const r=runOf();r.wr=1;const k=r.deck.find(k=>CARDS[k].cat==='gehege');state.rule={id:'auswild'};const go=s=>{state.buildings=[{id:950+s,key:baseK(k),cells:[A0],lvl:1}];state.wrAus={};state.season=s;state.day=0;wrAuswild();return state.buildings.length};const o=[1,2].map(go);state.season=0;state.rule=null;return o})()`);
 T(au.join()==='1,0',`Auswilderung: am 1. Sommertag nichts, am 1. Herbsttag 1 Gehege weg (${au})`);
 // 5. Futter nur Lauf-Deck, Mehrfachmenge
 const fd=J(`(()=>{const r=runOf(),f='kf',g=Object.keys(CARDS).find(k=>!/[~^#]/.test(k)&&fdFits(f,k)&&CARDS[k].cat==='gehege'&&!CARDS[k].ms);put([]);r.deck=r.deck.filter(k=>baseK(k)!==g).concat([g,g]);state.deck=[g,g,g];state.discard=[];state.hand=[];
   const o={g};let FL=feedLists(f);o.n=FL.P.filter(k=>k===g).length;o.lim=FL.lim;state.shopSub='feed';state.feedF=f;o.hint=shopHtml().includes('Nur Karten, die du in den nächsten Zoo mitnimmst');
   state.buildings=[{id:70,key:g,cells:[A0],lvl:1}];FL=feedLists(f);o.nb=FL.B.length;o.n2=FL.P.filter(k=>k===g).length;state.shopSub=null;state.feedF=null;
   const t0=r.tut;r.tut=1;o.tut=feedLists(f).P.filter(k=>k===g).length;r.tut=t0;return o})()`);
 T(fd.n===2&&fd.lim&&fd.hint,`Futterwahl: 2× im Lauf-Deck + 1× nur für diesen Zoo → 2 wählbar, Hinweis steht da (${fd.g})`);
 T(fd.nb===1&&fd.n2===1&&fd.tut===3,`gebautes Gehege zählt mit (gebaut 1 + Deck 1), im Tutorial alle Karten (${JSON.stringify(fd)})`);
 // 7. Freischaltung: Zähler steigen beim Bauen
 const fl=J(`(()=>{const sl=activeSlot(),be=one(c=>c.cat==='gehege'&&c.tags.includes('beute'))[0],bd=one(c=>c.cat==='gehege'&&c.tags.includes('bedroht'))[0],o={};const F=flOf(sl);o.b0=F.beuteGeh||0;o.d0=F.bedrohtGeh||0;flBuilt({id:1,key:be,cells:[A0]},1);flBuilt({id:2,key:bd,cells:[A0]},1);const G=flOf(sl);o.b1=G.beuteGeh;o.d1=G.bedrohtGeh;
   const goals=FREI_DATEN.fleiss.filter(x=>['v:tarnzelt','v:faehrte','v:artengala'].includes(x.id)).map(x=>x.id+':'+x.z+':'+x.n);o.g=goals;o.vc=['tarnzelt','faehrte','artengala'].every(k=>!!VCOND[k]);return o})()`);
 T(fl.b1===fl.b0+1&&fl.d1===fl.d0+1,`Zähler beuteGeh/bedrohtGeh steigen beim Bauen (${fl.b0}→${fl.b1}, ${fl.d0}→${fl.d1})`);
 T(fl.g.length===3&&fl.g.includes('v:faehrte:raubtier:60')&&fl.vc,`Freischalt-Ziele: ${fl.g.join(' · ')}`);
 const un=J(`(()=>{const sl=activeSlot();sl.vu=sl.vu||{};delete sl.vu.tarnzelt;const F=flOf(sl);F.beuteGeh=99;const be=one(c=>c.cat==='gehege'&&c.tags.includes('beute'))[0];flBuilt({id:3,key:be,cells:[A0]},1);try{fsCheck('fl')}catch(e){}return{v:verstOn('tarnzelt'),q:(sl.ulq||[]).includes('v:tarnzelt'),fs:(fsOf(sl)||{})['v:tarnzelt']||0}})()`);
 T(un.v||un.q||un.fs,`bei 100 Beutetieren wird Wanda Wildnis frei (${JSON.stringify(un)})`);
 dom.window.close();
}catch(e){L('FAIL Absturz',e&&e.stack||e)}})();
