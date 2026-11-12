// 0.80a: Geheimnisse im Zoo-Buch, Zurücksetzen, keine Prozente, Testlauf-Preise, Zoogründer-Einstieg, Eingang, Feedback im Testlauf, Shop-Leuchtpunkt, kein Storch
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||80;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const start=(w,o={})=>w.eval(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.fbOff=0;META.d4=${o.d4?1:0};META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'${o.deck||'grund'}','z2',['wasser','savanne','wueste'],NOPROF,${o.st||1});modal=null;state.ruleIntro=0;state.wishIntro=0;syncCtx();renderAll()`);
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x);await wait(200);start(w);
 T(ev('VERSION')==='0.80a','Version');
 // 1. Gesperrtes geheim
 ev(`state=null;modal=null;screen='buch';screenArg={tab:'cards'};renderAll()`);
 const kr=d.querySelector('#glist [data-bk="kraken"]'),nm=ev('CARDS.kraken.name');
 T(!!kr&&/\?\?\?/.test(kr.textContent)&&!kr.textContent.includes(nm)&&/❔/.test(kr.textContent)&&!!kr.querySelector('.bkbar,.bksub'),'gesperrte Karte: „???“ und ❔, kein Name, Weg sichtbar');
 ev(`screenArg.bkOpen='kraken';renderAll()`);const kro=d.querySelector('#glist [data-bk="kraken"]');T(!kro.textContent.includes(nm)&&!kro.querySelector('.tx,.gm'),'aufgeklappt: weiterhin ohne Name, Werte, Wirkung');
 T(/Freischalten/.test(kro.textContent),'aufgeklappt: Freischalt-Weg');
 ev(`screenArg.tab='free';screenArg.bkOpen=null;renderAll()`);const fr=d.getElementById('screenRoot').textContent;T(!fr.includes(nm)&&/\?\?\?/.test(fr)&&/Arktis/.test(fr),'Freischalten-Reiter: gesperrte Karten „???“, Arktis erkennbar');
 ev(`screenArg.tab='spec';renderAll()`);T(!!d.querySelector('#screenRoot .pcard.locked')&&[...d.querySelectorAll('#screenRoot .pcard.locked')].every(e=>/\?\?\?/.test(e.textContent)),'Team: gesperrte Spezialisten „???“');
 // Enthüllung
 start(w);ev(`flOf(activeSlot()).wasserGeh=149;flBuilt({key:Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&CARDS[k].hab==='wasser'&&!CARDS[k].ms&&!fsLocked(k)),cells:[]},1);modal=null;render()`);
 const rp=d.getElementById('fsRevPop');T(!!rp&&/Neu entdeckt: .*Krokodilsumpf!/.test(rp.textContent)&&!!rp.querySelector('.ocard'),'Enthüllung „✨ Neu entdeckt: 🐊 Krokodilsumpf!“ mit Karte');
 if(rp)rp.querySelector('[data-bpok]').click();await wait(20);
 // 3. keine Prozente bei Werten
 const src=ev(`[...document.scripts].map(s=>s.textContent).join('')`);T(!/−5 % N|% Natur|−\$\{Math\.round\(STRZ\*100\)\} %|Zoo −5 %/.test(src),'keine „−5 %“-Stress-Texte mehr im Spiel');
 T(/×0,95/.test(ev(`TXT.de.trait&&JSON.stringify(TXT.de)||JSON.stringify(TXT)`)),'Merkmal-Texte: Stress ×0,95');
 const pr=ev(`(()=>{const P=Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&CARDS[k].tags.includes('raubtier')&&!CARDS[k].ms&&!fsLocked(k)),B=Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&CARDS[k].tags.includes('beute')&&!CARDS[k].ms&&!fsLocked(k));const c=BOARD.filter(([q,r])=>!TERR.get(hk(q,r)));const a=c[0],b=c.find(([q,r])=>DIRS.some(([x,y])=>a[0]+x===q&&a[1]+y===r));state.buildings=[{id:1,key:P,cells:[a],lvl:1},{id:2,key:B,cells:[b],lvl:1}];const parts=[];evalB(state.buildings[1],state.buildings,mkIndex(state.buildings),parts);return parts.map(p=>p.label).join(' | ')})()`);
 T(/×0,95 Natur/.test(pr)&&!/%/.test(pr),'Abrechnung Stress: „×0,95 Natur“ ('+pr.slice(0,90)+')');
 ev(`modal='help';helpOpen=true;renderModal()`);const hh=d.getElementById('modalRoot').textContent;T(!/\d ?% (Natur|N\b|ihres|ihrer|seines)/.test(hh),'Hilfe: keine Prozente bei Werten');ev('modal=null');
 // 4. Testlauf-Preise ×0,8
 const p5=ev(`priced(100)`);dom.window.close();dom=neu();w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);start(w,{d4:1});
 const p4=ev(`priced(100)`);T(p4===Math.ceil(p5*.8),`Testlauf: Preise ×0,8 aufgerundet (${p4} statt ${p5})`);
 T(/^🧪 Testlauf 4 Tage/.test(ev('runText(runOf())')),'Lauftext beginnt mit „🧪 Testlauf 4 Tage“');
 T(ev(`fbAsk(runOf())`)===true&&ev(`fbAsk({tut:true})`)===false,'Feedback nach Testlauf ja, nach Tutorial nein');
 dom.window.close();
 // 7. Zoogründer Stufe 1 leichter, Stufe 2 und Kapitänin unverändert
 dom=neu();w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);start(w);
 const e1=JSON.parse(ev(`JSON.stringify([0,1,2,3].map(einTF))`));T(JSON.stringify(e1)==='[0.8,0.9,0.9,0.9]','Zoogründer Stufe 1: Faktoren 0,8/0,9/0,9/0,9');
 const t1=ev('seTarget(0,true,0)');ev(`runOf().stage=2`);const t2=ev('seTarget(0,true,0)/stTF()');ev(`runOf().stage=1`);T(Math.abs(t1/t2-.8)<.03,`Frühlingsziel Stufe 1 ≈ ×0,8 (${t1} zu ${Math.round(t2)})`);
 ev(`runOf().deckId='kueste'`);T(JSON.stringify(JSON.parse(ev(`JSON.stringify([0,1,2,3].map(einTF))`)))==='[1,1,1,1]','Kapitänin Stufe 1 unverändert');ev(`runOf().deckId='grund'`);
 ev(`state=null;screen='cdeck';screenArg={slot:0,zl:'z2',habs:['wasser','savanne','wueste']};renderAll()`);T(/Einstieg: Ziele im Frühling ×0,8, danach ×0,9/.test(d.getElementById('screenRoot').textContent),'Stufenwahl: Einstiegs-Hinweis beim Zoogründer');
 dom.window.close();
 // 8. Eingang ≥ 2 freie Nachbarn
 let bad=0,runs=0;for(const sd of[1,2,3,4,5,6]){for(const d4 of[0,1]){dom=neu(sd*13+d4);w=dom.window;ev=x=>w.eval(x);await wait(120);start(w,{d4});
   for(let i=0;i<8;i++){const n=ev(`(()=>{state.rule={id:'eingang'};initRule();const[q,r]=state.rule.entry;return DIRS.filter(([a,b])=>ONBOARD.has(hk(q+a,r+b))&&TERR.get(hk(q+a,r+b))!=='block').length})()`);runs++;if(n<2)bad++}
   dom.window.close()}}
 T(bad===0,`Eingang hat immer ≥ 2 freie Nachbarn (${runs} Würfe, auch Testlauf)`);
 dom=neu(3);w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);start(w);
 const rk=ev(`(()=>{for(const[q,r]of BOARD)if(isEdge(q,r)&&!TERR.get(hk(q,r)))for(const[a,b]of DIRS){const k=hk(q+a,r+b);if(ONBOARD.has(k))TERR.set(k,'block')};state.rule={id:'eingang'};initRule();const[q,r]=state.rule.entry;return DIRS.filter(([a,b])=>ONBOARD.has(hk(q+a,r+b))&&TERR.get(hk(q+a,r+b))!=='block').length})()`);
 T(rk>=2,'Eingang zwischen lauter Felsen: Felsen werden entfernt, bis 2 frei sind ('+rk+')');dom.window.close();
 // 11. Leuchtpunkt im Shop
 dom=neu();w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);start(w);
 ev(`state.season=1;state.money=500;state.phase='review';openShop();META.shopT='run';modal='shop';render()`);
 const dotOn=t=>!!d.querySelector(`[data-shtab="${t}"] .shdot`);T(!dotOn('run')&&dotOn('more'),'Leuchtpunkt am nicht geöffneten Reiter mit leistbarem Angebot (Extras), nicht am offenen');
 d.querySelector('[data-shtab="more"]').click();await wait(20);T(!dotOn('more'),'Öffnen löscht den Leuchtpunkt');
 ev(`state.money=0;state.shopSeen={};render()`);T(!dotOn('umb')&&!dotOn('more'),'ohne Geld kein Leuchtpunkt');
 ev(`state.money=500;META.noHints=0;activeSlot().hints={};state.shop.items.push(mkItem('prog',Object.keys(PROGS)[0]));META.shopT='run';render()`);T(/Mit Förderung bekommst du mehr B oder N/.test((d.getElementById('hintBox')||{}).textContent||''),'Hinweis zur Förderung im Shop');
 // 12. Storch
 T(ev(`(()=>{let s=0;for(let i=0;i<300;i++){state.momS=null;state.momZ=null;state.momEve=null;state.news=[];state.season=1;const r=Math.random;Math.random=()=>0.01;try{dayRoll()}catch(e){}Math.random=r;if((state.momS&&state.momS.ids||[]).includes('storch')||state.momEve==='storch')s++}return s})()`)===0,'Storch wird nie gezogen');
 // 2. Zurücksetzen
 ev(`localStorage.setItem('zoodeck-muted','1');localStorage.setItem('fremd','x');saveMeta()`);
 ev(`modal='help';renderModal()`);const mr=d.getElementById('mReset');T(!!mr,'Menü: „Alles zurücksetzen“');mr.click();await wait(20);
 let rp2=d.getElementById('resetPop');T(!!rp2&&/Wirklich alles löschen\?/.test(rp2.textContent),'1. Abfrage');rp2.querySelector('[data-rs="2"]').click();await wait(20);
 rp2=d.getElementById('resetPop');T(!!rp2&&!!rp2.querySelector('[data-rs="go"]')&&/LÖSCHEN/.test(rp2.textContent),'2. Abfrage mit „LÖSCHEN“');
 rp2.querySelector('[data-rs="0"]').click();await wait(20);T(!d.getElementById('resetPop')&&!!w.localStorage.getItem(ev('SAVE_KEY')),'Abbrechen löscht nichts');
 ev(`try{resetAll()}catch(e){}`);const keys=[];for(let i=0;i<w.localStorage.length;i++)keys.push(w.localStorage.key(i));
 T(!keys.some(k=>/^zoodeck-/.test(k))&&keys.includes('fremd'),'Zurücksetzen leert alle Spiel-Einträge ('+keys.join(',')+')');
 ev(`saveMeta()`);T(!w.localStorage.getItem(ev('SAVE_KEY')),'danach wird nichts mehr gespeichert');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
