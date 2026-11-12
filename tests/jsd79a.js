// 0.79a: Fleiß-Weg (Zähler über alle Läufe), keine 3 Ziele je Lauf, Zoo-Buch kompakt, Freundschafts-Kacheln, gesperrte Spezialisten grau
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||79;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const start=(w,o={})=>w.eval(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.fbOff=1;META.d4=${o.d4?1:0};if(!META.slots[0]||${o.neu?1:0})META.slots[0]=${o.slot||"{name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1}"};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund','z2',${JSON.stringify(o.habs||['wasser','savanne','wueste'])},NOPROF,1);modal=null;state.ruleIntro=0;state.wishIntro=0;syncCtx();renderAll()`);
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x);await wait(200);start(w,{neu:1});
 T(ev('VERSION')==='0.79a','Version');
 T(!ev('runOf().fsPick')&&!ev('runOf().fsIntro'),'kein fsPick: keine 3 Ziele je Lauf');
 T(ev(`FSG.filter(g=>g.fl).length`)===27&&ev(`FSG.find(g=>g.id==='c:krokodile').n`)===150&&ev(`FSG.find(g=>g.id==='c:aquarium').fl`)==='wasserGeh','27 Fleiß-Ziele aus daten/freischaltungen.json (Krokodil 150, Aquarium Wasser-Gehege)');
 // alle Kunststücke zählen: Dingos (6 Wüste) ohne Auswahl
 ev(`(()=>{const F=BOARD.filter(([q,r])=>!TERR.get(hk(q,r)));const W=Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&CARDS[k].hab==='wueste'&&SHAPES[CARDS[k].shape].cells.length===1&&!CARDS[k].ms&&!fsLocked(k));state.buildings=F.slice(0,6).map((c,i)=>({id:900+i,key:W,cells:[c],lvl:1}));fsCheck('season')})()`);
 T(ev(`!!fsOf(activeSlot())['c:dingos']`),'Kunststück ohne Auswahl zählt (Dingo-Revier mit 6 Wüsten-Gehegen)');
 // Fleiß: echtes Bauen und Rückgängig
 const wk=ev(`Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&CARDS[k].hab==='wasser'&&SHAPES[CARDS[k].shape].cells.length===1&&!CARDS[k].ms&&!fsLocked(k))`);
 const w0=ev(`flOf(activeSlot()).wasserGeh||0`);
 ev(`(()=>{state.buildings=[];state.phase='play';state.bp=9;state.hand=['${wk}'];state.selected=0;state.rot=0;const c=BOARD.find(([q,r])=>!TERR.get(hk(q,r)));state.preview={q:c[0],r:c[1]};build()})()`);
 T(ev(`flOf(activeSlot()).wasserGeh`)===w0+1&&ev('state.buildings.length')===1,'Bauen: Wasser-Gehege-Zähler +1');
 ev(`undo()`);T(ev(`flOf(activeSlot()).wasserGeh`)===w0,'Rückgängig: Zähler wieder −1');
 // Tagesende: Besucher mit Dschungel-Gehegen, Natur mit Naturschutz
 const dk=ev(`Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&CARDS[k].hab==='wald'&&!CARDS[k].ms)`),sk=ev(`Object.keys(CARDS).find(k=>CARDS[k].cat==='schutz')`);
 ev(`state.buildings=[{id:1,key:'${dk}',cells:[BOARD[0]],lvl:1},{id:2,key:'${sk}',cells:[BOARD[1]],lvl:1}];flDay({steps:[{id:1,a:120,s:3},{id:2,a:0,s:40}]})`);
 T(ev(`flOf(activeSlot()).dschB`)===120&&ev(`flOf(activeSlot()).schutzN`)===40,'Tagesende: 120 B mit Dschungel, 40 N mit Naturschutz gezählt');
 // Freischaltung bei Erreichen: Krokodile ab 150 Wasser-Gehegen, Karte kommt ins Deck
 ev(`flOf(activeSlot()).wasserGeh=149;flBuilt({key:'${wk}',cells:[]},1)`);
 T(ev(`!!fsOf(activeSlot())['c:krokodile']`)&&ev(`runOf().deck.includes('krokodile')`),'150. Wasser-Gehege schaltet Krokodilsumpf frei, Karte kommt ins Deck');
 // Laufende zählt
 const r0=ev(`flOf(activeSlot()).runs||0`);ev(`(()=>{const sl=activeSlot();state.phase='lost';sl.run.game=null;state=null;modal=null;endRun(false)})()`);
 T(ev(`flOf(activeSlot()).runs`)===r0+1,'Laufende: Läufe-Zähler +1');
 // nicht im Testlauf
 start(w,{d4:1});const f0=ev(`JSON.stringify(flOf(activeSlot()))`);ev(`flBuilt({key:'${wk}',cells:[]},1);flAdd('runs');flDay({steps:[]})`);
 T(ev(`JSON.stringify(flOf(activeSlot()))`)===f0,'Testlauf „4 Tage“: Zähler bleiben');
 T(ev(`(()=>{const s={run:{tut:true}};return flSl()===null||true})()`)&&ev(`(()=>{const sl=activeSlot(),r=sl.run;r.d4=0;r.tut=true;const ok=flSl()===null;r.tut=undefined;return ok})()`),'Tutorial: Zähler zählen nicht');
 dom.window.close();
 // alter Spielstand: Startwerte aus der Statistik, Freigeschaltetes bleibt
 dom=neu();w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);
 start(w,{neu:1,slot:"{name:'Alt',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1,runs:4,fs:{'c:krokodile':1,'g!c:krokodile':1},cu:{wB:120,eB:30,arB:5,sN:2000,aB:0,wald:0,day:0,sav:0,open:[]},stat:{runs:4,zoos:7,bestRun:2,streak:1,cur:0,bestZoo:0,win:{},built:{zebras:9,giraffen:3,pinguine:20,bratwurst:12},spec:{gaertner:3,kassenwart:2},prof:{},geh:0,jt:0,rb:{}}}"});
 const F=JSON.parse(ev(`JSON.stringify(flOf(activeSlot()))`));
 T(F.wasserGeh===120&&F.savGeh>=12&&F.runs===4&&F.zoos===7&&F.specs===5&&F.schutzN===2000&&F.essenB>=30,'alter Spielstand: Startwerte aus Statistik ('+JSON.stringify(F)+')');
 T(ev(`!fsLocked('krokodile',activeSlot())`),'schon Freigeschaltetes bleibt frei');
 // Zoo-Buch: Balken mit Fleiß-Stand, kompakt, aufklappen
 ev(`state=null;modal=null;screen='buch';screenArg={tab:'cards'};renderAll()`);
 const aq=d.querySelector('#glist [data-bk="aquarium"]');T(!!aq&&/120\/500 Wasser-Gehege gebaut \(über alle Läufe\)/.test(aq.textContent)&&!!aq.querySelector('.bkbar'),'Zoo-Buch: gesperrtes Aquarium zeigt „120/500 Wasser-Gehege gebaut“ mit Balken');
 T(!d.querySelector('#glist .bkbody')&&d.querySelectorAll('#glist .bkc').length===ev('buchKeys().length'),'Karten kompakt (keine Details, bis man antippt)');
 d.querySelector('#glist [data-bko="zebras"]').click();await wait(20);const zb=d.querySelector('#glist [data-bk="zebras"]');
 T(zb.classList.contains('open')&&!!zb.querySelector('.bkbody .tx')&&/9× gebaut/.test(zb.textContent),'Antippen klappt Zebras auf (Wirkung, „9× gebaut“)');
 d.querySelector('#glist [data-bko="zebras"]').click();await wait(20);T(!d.querySelector('#glist .bkbody'),'nochmal antippen klappt zu');
 // Freischalten-Reiter: Als Nächstes
 ev(`screenArg.tab='free';renderAll()`);T(/Als Nächstes/.test(d.getElementById('screenRoot').textContent)&&d.querySelectorAll('#screenRoot .fsrun .fsr').length===3,'Freischalten: „Als Nächstes“ mit 3 Fleiß-Zielen');
 // Freundschaften als Kacheln
 ev(`activeSlot().friends={'zebras+giraffen':1};screenArg.tab='friends';renderAll()`);
 T(d.querySelectorAll('.frgrid .frt').length===ev('FRIENDS.length')&&d.querySelectorAll('.frgrid .frt.on').length===1&&/💚/.test(d.querySelector('.frt.on').textContent),'Freundschaften als Kacheln, eine entdeckt');
 // Team: gesperrte grau, eigene Gruppe, Spielstand-Auswahl
 ev(`screenArg.tab='spec';renderAll()`);const lp=[...d.querySelectorAll('#screenRoot .pcard.locked')];
 T(lp.length>0&&/Noch freizuschalten/.test(d.getElementById('screenRoot').textContent),'Team: gesperrte Spezialisten in eigener Gruppe ('+lp.length+')');
 const css=[...d.querySelectorAll('style')].map(s=>s.textContent).join('');T(/\.pcard\.locked\{[^}]*grayscale|\.pcard\.locked \.ic\{[^}]*grayscale/.test(css),'CSS: gesperrte Spezialisten grau');
 T(/\?\?\?/.test(lp[0].textContent)&&!lp[0].querySelector('.fxl,.fx,[data-spo]'),'gesperrter Spezialist geheim: „???“, keine Wirkung (seit 0.80a)');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
