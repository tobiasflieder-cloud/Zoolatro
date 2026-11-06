// 0.64a: Kategorie-Punkt, Standard-Tiere ohne Effekt, Ansicht wählbar (3 Spalten), Profi-Mappe, Tribüne neu, Futter-System
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const dom=new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message))}});
const L=(...a)=>console.log(...a);const w=dom.window,d=w.document;setTimeout(()=>{try{const ev=x=>w.eval(x),T=(c,m)=>L(c?'ok':'FAIL',m);
 const start=`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};META.noHints=1;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund',true,['wasser','savanne','wueste'],NOPROF);modal=null;syncCtx();render()`;
 ev(start);
 T(ev('VERSION')==='0.64a','Version '+ev('VERSION'));
 // 1 Kategorie-Punkt
 T(ev(`catDots(CARDS.cafe).join()`)==='schutz'&&ev(`catDots(CARDS.streichelzoo).join()`)==='essen'&&ev(`catDots(CARDS.popcorn).join()`)==='attr','Kategorie-Punkt: Zoo-Café lila, Streichelzoo gelb, Popcorn rosa');
 T(ev(`catDots(CARDS.kraken).join()`)==='schutz','Kategorie-Punkt auch bei Gehegen (Krakengrotte)');
 T(ev(`catDots(CARDS.pinguine).length`)===0&&ev(`catDots(CARDS.gruen).length`)===0,'Kein Punkt bei Showtieren und ohne Kategorie-Bezug');
 T(ev(`(()=>{state.hand=['cafe','zebras'];render();return /mk-cd/.test(document.getElementById('hand').innerHTML)})()`),'Punkt in der Hand');
 T(ev(`/class="cdots"/.test(itemHtml({kind:'card',key:'cafe',price:10},0,false))`),'Punkt im Shop');
 // 2 Standard-Tiere ohne Effekt
 T(ev(`['reptilien','otter','elefanten','moschusochsen','schneegaense'].every(k=>!CARDS[k].bonus&&!(fxOwn(CARDS[k]).fx||[]).length)`),'Standard-Tiere ohne Effekt und ohne Kartentext');
 T(ev(`CARDS.otter.a===5&&CARDS.otter.s===4`),'Grundwerte bleiben (Otter 5/4)');
 T(ev(`!!CARDS.kraken.bonus||!!CARDS.kraken.km||(fxOwn(CARDS.kraken).fx||[]).length>0`),'Freischaltbare Karte behält Effekt (Krakengrotte)');
 // 3 Ansicht
 T(ev(`(()=>{META.view='quer';applyView();const a=document.body.classList.contains('land3')&&document.getElementById('team').parentNode.id==='rail';META.view='hoch';applyView();const b=!document.body.classList.contains('land')&&document.getElementById('team').parentNode.classList.contains('side');META.view='auto';applyView();return a&&b})()`),'Ansicht Querformat/Hochformat schaltet Klassen und Team-Platz');
 T(ev(`(()=>{modal='help';render();return document.querySelectorAll('[data-view]').length===3})()`),'Menü: Ansicht mit 3 Knöpfen');
 T(ev(`/body\\.land \\.app\\{/.test(document.querySelector('style').textContent)&&!/min-aspect-ratio:1\\/1\\)\\{/.test(document.querySelector('style').textContent)`),'Querformat-CSS über Body-Klasse');
 ev(`modal=null;render()`);
 // 4 Profi-Mappe
 ev(`state.season=0;state.spec=[];syncCtx();state.phase='review';state.money=500;openShop();modal='shop'`);
 T(!ev(`fixedItems().some(i=>i.kind==='profi')`),'Profi-Mappe nicht im Shop nach dem Frühling');
 ev(`state.season=1`);
 T(ev(`fixedItems().find(i=>i.kind==='profi').price`)===45,'Profi-Mappe 45 Taler ab dem Shop nach dem Sommer');
 T(ev(`(()=>{let ok=true;for(let i=0;i<300;i++){const o=rollSpecs(3,[],PROFIW,1);if(!o.some(id=>SPEC[id].tier>=2))ok=false}return ok})()`),'Profi-Mappe: immer mindestens 1 selten/legendär');
 T(ev(`(()=>{let a=0,b=0;for(let i=0;i<600;i++){a+=rollSpecs(3).filter(id=>SPEC[id].tier>=2).length;b+=rollSpecs(3,[],PROFIW,1).filter(id=>SPEC[id].tier>=2).length}return b>a*1.6})()`),'Profi-Mappe: deutlich mehr seltene/legendäre');
 T(ev(`(()=>{buy(fixedItems().find(i=>i.kind==='profi'));const ok=state.mappe&&state.mappe.pro&&state.shopSub==='mappe'&&state.money===455;state.mappe=null;state.shopSub=null;return ok&&fixedItems().find(i=>i.kind==='profi').price===60&&fixedItems().find(i=>i.kind==='mappe').price===25})()`),'Profi-Mappe kaufen, nächste 60, normale Mappe bleibt 25');
 // 5 Tribüne
 T(ev(`CARDS.tribuene.a===6&&!CARDS.tribuene.bonus&&trubelC(CARDS.tribuene)`),'Tribüne: 6 B, Trubel, keine Ring-Bedingung');
 T(ev(`(()=>{const C=BOARD.filter(([q,r])=>ONBOARD.has(hk(q,r))&&!TERR.get(hk(q,r)));const c0=C[0],far=C.find(([q,r])=>Math.max(Math.abs(q-c0[0]),Math.abs(r-c0[1]),Math.abs((q+r)-(c0[0]+c0[1])))===2);if(!far)return 'kein Feld';state.buildings=[{id:1,key:'pinguine',cells:[c0],lvl:1},{id:2,key:'tribuene',cells:[far],lvl:1}];const ix=mkIndex(state.buildings),p=[];evalB(state.buildings[0],state.buildings,ix,p);return p.some(x=>/Showtier.*\\+60 %/.test(x.label))})()`),'Tribüne: Showtier 2 Felder entfernt +60 %');
 T(ev(`!/umschlossen/.test(fxOwn(CARDS.tribuene).fx.join(' '))&&/Umkreis von 2/.test(fxOwn(CARDS.tribuene).fx.join(' '))`),'Tribüne: neuer Kartentext');
 // 6 Futter
 T(ev(`fixedItems().find(i=>i.kind==='sack').price`)===20,'Futtersack 20 Taler');
 T(ev(`(()=>{buy(fixedItems().find(i=>i.kind==='sack'));const ok=state.shopSub==='sack'&&state.sack.opts.length===2;state.sack=null;state.shopSub=null;return ok&&fixedItems().find(i=>i.kind==='sack').price===30})()`),'Futtersack: 2 Futter, nächster Sack 30');
 {const p=ev(`(()=>{let n=0,N=3000;for(let i=0;i<N;i++)if(rollFood(2).includes('h:wasser'))n++;return n/N})()`);T(p>.07&&p<.14,'Eigenes Lebensraum-Futter etwa 10 % je Sack (0.70a), gemessen '+p.toFixed(3))}
 T(ev(`(()=>{for(let i=0;i<500;i++){const o=rollFood(2);if(o.includes('h:arktis')||o.includes('h:gebirge')||o.includes('h:wald'))return false}return true})()`),'Nur Lebensräume des Laufs');
 T(ev(`(()=>{for(let i=0;i<500;i++){const o=rollFood(2);if(o.includes('mi'))return false}return true})()`),'Nur verwendbare Einzelfutter (keine Aufzuchtmilch ohne Jungtier)');
 T(ev(`(()=>{state.sack={opts:['kf']};state.shopSub='sack';modal='shop';render();document.querySelector('[data-fdpick]').click();const b=document.querySelector('[data-feedk]'),k=b.dataset.feedk;b.click();return state.deck.concat(state.discard,state.hand).includes(k+'#kf')})()`),'Einzelfutter auf eine Karte geben');
 T(ev(`(()=>{const k='zebras#kf.ho';return fdOf(k).join()==='kf,ho'&&!fdFits('be',k)&&fdFits('mo',k)===false&&fdFits('mo','zebras')})()`),'Höchstens 2 Einzelfutter je Karte, passende Tiere');
 T(ev(`fdKey('otter^star','kf')==='otter#kf^star'&&CARDS['otter#kf^star'].pr==='star'&&baseK('otter#kf^star')==='otter'&&spK('otter#kf')==='otter'`),'Futter und Prägung im Schlüssel, gleiche Art');
 T(ev(`(()=>{state.sack={opts:['h:wasser']};state.shopSub='sack';render();document.querySelector('[data-fdpick]').click();state.sack={opts:['h:wasser']};state.shopSub='sack';render();document.querySelector('[data-fdpick]').click();syncCtx();state.buildings=[{id:1,key:'otter',cells:[[0,0],[1,0],[2,0]],lvl:1}];const p=[];evalB(state.buildings[0],state.buildings,mkIndex(state.buildings),p);return runOf().fdl.wasser===2&&p.some(x=>/Fischmix Stufe 2/.test(x.label)&&x.a===2&&x.s===2)})()`),'Lebensraum-Futter: Stufe 2 = +2 B +2 N je Gehege');
 T(ev(`fdLvB(1)===1&&fdLvB(3)===4&&fdLvB(5)===16`),'Stufen verdoppeln');
 T(ev(`(()=>{state.buildings=[{id:1,key:'otter#gh',cells:[[0,0],[1,0],[2,0]],lvl:1}];const p=[];evalB(state.buildings[0],state.buildings,mkIndex(state.buildings),p);return p.some(x=>/Goldhafer: ×1,5/.test(x.label))})()`),'Goldhafer ×1,5');
 T(ev(`(()=>{state.season=1;syncCtx();state.buildings=[{id:1,key:'otter#wm',cells:[[0,0],[1,0],[2,0]],lvl:1}];const p=[];evalB(state.buildings[0],state.buildings,mkIndex(state.buildings),p);const a=p.some(x=>/Wassermelone/.test(x.label));state.season=2;syncCtx();const q=[];evalB(state.buildings[0],state.buildings,mkIndex(state.buildings),q);state.season=1;syncCtx();return a&&!q.some(x=>/Wassermelone/.test(x.label))})()`),'Jahreszeiten-Futter nur in seiner Jahreszeit');
 T(ev(`(()=>{state.buildings=[{id:1,key:'otter#sn',cells:[[0,0],[1,0],[2,0]],lvl:1}];return dayIncome(10,10,0).snk===1})()`),'Besuchersnack +1 Taler');
 T(ev(`(()=>{const C=BOARD.filter(([q,r])=>ONBOARD.has(hk(q,r))&&!TERR.get(hk(q,r)));const z=C[0],nb=C.find(c=>DIRS.some(([a,b])=>c[0]===z[0]+a&&c[1]===z[1]+b));const t=k=>{state.buildings=[{id:1,key:'zebras',cells:[z],lvl:1},{id:2,key:k,cells:[nb],lvl:1}];return evalB(state.buildings[0],state.buildings,mkIndex(state.buildings)).st||0};return t('loewen')>=1&&t('loewen#kn')===0})()`),'Knochen: Raubtier stresst keine Beute');
 T(ev(`(()=>{const C=BOARD.filter(([q,r])=>ONBOARD.has(hk(q,r))&&!TERR.get(hk(q,r)));const z=C[0],nb=C.find(c=>DIRS.some(([a,b])=>c[0]===z[0]+a&&c[1]===z[1]+b));const t=k=>{state.buildings=[{id:1,key:k,cells:[z],lvl:1},{id:2,key:'loewen',cells:[nb],lvl:1}];return evalB(state.buildings[0],state.buildings,mkIndex(state.buildings)).st||0};return t('zebras')>=1&&t('zebras#kr')===0})()`),'Beruhigungskräuter: nie gestresst');
 T(ev(`(()=>{const C=BOARD.filter(([q,r])=>ONBOARD.has(hk(q,r))&&!TERR.get(hk(q,r)));const z=C[0],nb=C.find(c=>DIRS.some(([a,b])=>c[0]===z[0]+a&&c[1]===z[1]+b));const t=k=>{state.buildings=[{id:1,key:k,cells:[z],lvl:1},{id:2,key:'popcorn',cells:[nb],lvl:1}];const p=[];evalB(state.buildings[0],state.buildings,mkIndex(state.buildings),p);return(p.find(x=>/Showtier/.test(x.label))||{}).label||''};return /\\+30 %/.test(t('pinguine'))&&/\\+50 %/.test(t('pinguine#le'))})()`),'Leckerli: +50 % statt +30 % je Auslöser');
 T(ev(`!genEinmal().some(i=>i.key==='futter')||true`)&&ev(`(()=>{for(let i=0;i<50;i++)if(genEinmal().some(i=>i.key==='futter'))return false;return true})()`),'Futterlieferung entfällt mit Futter');
 T(ev(`['tierern','futtermeister','ernprof'].every(id=>SPEC[id]&&SPEC[id].food)&&SPEC.ernprof.tier===3`),'Drei Futter-Spezialisten');
 T(ev(`(()=>{state.spec=['tierern'];const p=sackPrice();state.spec=['futtermeister'];const m=fdMax();state.spec=[];return p===Math.round((20+10*(state.sackN||0))*.75)&&m===3})()`),'Tierernährerin −25 %, Futtermeister 3 je Karte');
 T(ev(`(()=>{runOf().fdl={wasser:2,savanne:1};syncCtx();const m=SPEC.ernprof.mult();return m&&Math.abs(m.ma-1.05**3)<.001})()`),'Ernährungsprofessorin ×1,05 je Stufe');
 T(ev(`/Futter: an/.test(runText(runOf()))`),'Lauf-Text nennt Futter');
 T(ev(`(()=>{modal='zoo';render();const h=document.getElementById('modalRoot').innerHTML;modal=null;return /Futter/.test(h)&&/Stufe 2/.test(h)})()`),'Zoo-Fenster zeigt Futter-Stufen');
 T(ev(`/Futtersack/.test(glossZl?glossZl():'Futtersack')`),'Glossar: Futter');
 // Schalter
 T(ev(`(()=>{META.foodOff=1;${start.replace(/"/g,'\\"')};const r=runOf();const off=r.foodOff===1&&!foodOn()&&(state.season=1,!fixedItems().some(i=>i.kind==='sack'));META.foodOff=0;return off&&/Futter: aus/.test(runText(r))})()`),'Schalter: Futter aus = kein Sack, im Lauf-Text vermerkt');
 L('fertig')}catch(e){L('ERR',e.stack)}process.exit(0)},300);
