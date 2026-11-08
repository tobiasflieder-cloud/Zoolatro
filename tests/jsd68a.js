// 0.68a: Tutorial-Nachbesserungen (Tobi 04.11.)
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message))}});
const L=(...a)=>console.log(...a);const w=dom.window,d=w.document;setTimeout(()=>{try{const ev=x=>w.eval(x),T=(c,m)=>L(c?'ok':'FAIL',m);
 ev(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};screen='tut';screenArg={};renderAll()`);
 T(ev('VERSION')==='0.69a','Version');
 d.querySelector('[data-tutch]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));ev('render()');
 T(ev('ROT')===false,'Tutorial-Gelände nicht gedreht');
 T(d.querySelectorAll('#hand .hph').length===2&&d.querySelectorAll('#hand .card').length===3,'Hand: 3 Karten + 2 Platzhalter');
 // Schritt 1 = Naturfelder/Felsen: bis zum Felsen-Häppchen weiter
 ev('state.tut.i=1;state.tut.k=0;render()');const nat=d.querySelectorAll('#board .tgo').length;ev('state.tut.k=2;render()');const rk=d.querySelectorAll('#board .tgo').length;
 T(nat>0&&rk===ev('tRock().length'),'Felsen leuchten im letzten Häppchen ('+rk+')');
 ev('document.body.classList.add("land")');T(ev('tutMarkAll(tutStep()).length')>=nat+rk,'Querformat: alle Markierungen');ev('document.body.classList.remove("land")');
 T(!/zweiten Jahreshälfte/.test(ev('JSON.stringify(TUT.zs.steps.map(s=>s.t))')),'Satz Jahreshälfte gestrichen');
 T(ev(`!/Raubtier|Beute/.test(fxHtml(CARDS.dingos)+fxHtml(CARDS.fennek)+fxHtml(CARDS.zebras))`),'Keine Merkmal-Texte (Dingo, Fennek, Zebra)');
 T(ev(`(()=>{for(let i=0;i<40;i++){const o=makeOffer(2);if(o.some(k=>/[~^#]/.test(k)||(CARDS[k].hab&&!['wasser','savanne','wueste'].includes(CARDS[k].hab))))return false}return true})()`),'Kartenwahl: nur Wasser/Savanne/Wüste, ohne Prägung');
 T(ev(`JSON.stringify(TUT.zh.steps.filter(s=>s.only==='wasserfall'||s.only==='bienen').map(s=>s.at))`)==='[["2,-1"],["2,-2"]]','Wasserfall 2,-1 · Bienen 2,-2');
 T(ev(`(()=>{const r=runOf();const b=r.bpCarry||0;const t=earlyReward(2);return true})()`)&&/TUTNOW\?0:left/.test(html),'Kein Früh-geschafft im Tutorial');
 T(ev(`TUT.zssh.steps.some(s=>s.food==='h:savanne'&&s.lock&&s.lock.kind==='sack')`),'Sommer-Shop: Futtersack mit Steppenheu');
 T(ev(`(()=>{const b={key:'otter',cells:[[0,0],[1,0],[2,0]]};return habViol(b,mkIndex([b]))===false})()`),'Keine Fluss-Warnung im Tutorial');
 T(ev(`(()=>{const sc=CARDS.zebras;state.buildings.push({id:999,key:'dingos',cells:[[1,3],[2,3]],lvl:1});const o=strzMarks(sc,mkIndex(state.buildings));state.buildings.pop();return o===''})()`),'Keine Stress-Felder im Tutorial');
 T(ev(`(()=>{state.hand=['elefanten','otter'];render();return !document.querySelector('#hand .rl')})()`),'Kein Rote-Liste-Punkt auf der Hand');
 T(ev(`(()=>{state.buildings.push({id:998,key:'elefanten',cells:[[-3,3],[-4,4],[-3,4],[-4,5]],lvl:1});render();const ok=!document.querySelector('#board .rlmark');state.buildings.pop();return ok})()`),'Kein Rote-Liste-Punkt auf dem Gelände');
 T(ev(`(()=>{runOf().tut=1;state.phase='review';state.season=0;openShop();modal='shop';META.shopT='run';state.tut={ch:'zlsh',i:2,k:0};render();const b=[...document.querySelectorAll('[data-shtab]')];return b.filter(x=>x.disabled).length===2})()`),'Frühlings-Shop: Reiter gesperrt (auch beim Verlassen)');
 L('fertig')}catch(e){L('ERR',e.stack)}process.exit(0)},300);
