// 0.77a: Zoo-Buch (Reiter, Kartenzustände, echte Sperrgründe), Testlauf „4 Tage“, Formen gestrichen, Förderung im Shop
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||77;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const start=(w,d4)=>w.eval(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};META.noHints=1;META.d4=${d4?1:0};META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,1);runOf().fsIntro=0;modal=null;state.ruleIntro=0;state.wishIntro=0;syncCtx();renderAll()`);
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x);await wait(200);start(w,0);
 T(ev('VERSION')==='0.77a','Version');
 // 1. Zoo-Buch
 ev(`state=null;modal=null;screen='title';screenArg={};renderAll()`);
 const tb=[...d.querySelectorAll('[data-go]')].map(b=>b.dataset.go+':'+b.textContent.trim());
 T(tb.includes('buch:📖 Zoo-Buch')&&tb.includes('tut:🎓 Tutorial')&&!tb.some(x=>/^(gloss|lex|prog):/.test(x)),'Startbildschirm: 📖 Zoo-Buch und 🎓 Tutorial, kein Glossar/Lexikon/Fortschritt');
 d.querySelector('[data-go="buch"]').click();await wait(50);
 const tabs=[...d.querySelectorAll('.bktabs [data-tab]')].map(b=>b.dataset.tab);
 T(ev('screen')==='buch'&&['cards','friends','spec','progs','free'].every(t=>tabs.includes(t)),'Zoo-Buch öffnet mit den Reitern Karten, Freundschaften, Team, Förderung, Freischalten ('+tabs.join(', ')+')');
 for(const t of tabs){d.querySelector(`.bktabs [data-tab="${t}"]`).click();await wait(20);T(d.querySelector(`.bktabs [data-tab="${t}"]`).classList.contains('on')&&!/Anzeigefehler/.test(d.getElementById('screenRoot').textContent),'Reiter '+t+' öffnet ohne Fehler')}
 T(ev(`screen='gloss';screenArg={};renderAll();screen`)==='buch'&&ev(`screen='prog';screenArg={};renderAll();screenArg.tab`)==='free'&&ev(`screen='lex';screenArg={};renderAll();screenArg.tab`)==='friends','alte Bildschirme öffnen das Zoo-Buch');
 ev(`screen='buch';screenArg={tab:'cards'};renderAll()`);
 const n=ev(`buchKeys().length`),nd=d.querySelectorAll('#glist [data-bk]').length,uniq=new Set([...d.querySelectorAll('#glist [data-bk]')].map(e=>e.dataset.bk)).size;
 T(nd===n&&uniq===n,`jede Karte genau einmal (${nd} von ${n})`);
 T(!!d.querySelector('.bksum')&&/entdeckt/.test(d.querySelector('.bksum').textContent)&&/freigeschaltet/.test(d.querySelector('.bksum').textContent)&&/Abzeichen/.test(d.querySelector('.bksum').textContent),'Übersicht: entdeckt · freigeschaltet · Abzeichen');
 // Karte aus einem nicht gewählten Lebensraum (Dschungel) ist nicht gesperrt
 const wk=ev(`Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&CARDS[k].hab==='wald'&&!CARDS[k].gone&&!CARDS[k].sig&&!CARDS[k].ms&&!fsLocked(k,activeSlot()))`);
 T(!!wk&&ev(`isLocked('${wk}')`)&&ev(`buchInfo('${wk}',activeSlot()).st`)==='neu','Dschungel-Karte '+wk+' (Lebensraum nicht im Lauf): im Buch „noch nie gebaut“, nicht gesperrt');
 const op=k=>{ev(`screenArg.bkOpen=${JSON.stringify(k)};renderAll()`);return d.querySelector(`#glist [data-bk="${k}"]`)}; // 0.79a: Details erst aufgeklappt
 const wc=op(wk);T(!!wc&&/nicht in diesem Lauf/.test(wc.textContent)&&!/gesperrt/.test(wc.textContent),'… mit Hinweis „nicht in diesem Lauf“');
 // echte Sperrgründe
 const lk=ev(`LOCK91.find(k=>CARDS[k]&&!['arktis','gebirge'].includes(CARDS[k].hab))`),lc=d.querySelector(`#glist [data-bk="${lk}"]`);
 T(!!lc&&lc.classList.contains('locked')&&lc.textContent.includes(ev(`fsHowTxt('c:${lk}')`))&&!/Bonus-Karte/.test(lc.textContent),'gesperrte Karte '+lk+' zeigt ihr Freischalt-Ziel');
 const ak=ev(`Object.keys(CARDS).find(k=>CARDS[k].hab==='arktis'&&!CARDS[k].gone&&!CARDS[k].sig&&!CARDS[k].ms)`),ac=op(ak);
 T(!!ac&&/Lebensraum .*Arktis ist noch gesperrt/.test(ac.textContent),'Arktis-Karte: „Lebensraum Arktis ist noch gesperrt“');
 const vk=ev(`Object.keys(CARDS).find(k=>CARDS[k].cat==='verst'&&!CARDS[k].gone)`),vc=op(vk);
 T(!!vc&&/Verstärker · Freischalten/.test(vc.textContent),'Verstärker: eigener Grund');
 const sk=ev(`Object.keys(CARDS).find(k=>CARDS[k].sig&&DECKS[CARDS[k].sig]&&DECKS[CARDS[k].sig].type&&!DECKS[CARDS[k].sig].free&&!deckOpen(activeSlot(),CARDS[k].sig))`);
 if(sk){const sc=op(sk);T(!!sc&&/Signatur-Karte des Profils/.test(sc.textContent),'Signatur-Karte: nennt das Profil')}
 // gebaute Karte = entdeckt mit Lexikon-Zeile
 ev(`activeSlot().lex={zebras:{n:4,z:3,l3:1}};screenArg.bs='ok';screenArg.bkOpen='zebras';renderAll()`);
 const ok=[...d.querySelectorAll('#glist [data-bk]')];T(ok.length===1&&ok[0].dataset.bk==='zebras'&&/4× gebaut · bis Zoo 3/.test(ok[0].textContent)&&ok[0].querySelectorAll('.lb .on').length===2,'Filter „✓ Entdeckt“: Zebras mit Lexikon-Zeile und 2 Abzeichen');
 ev(`screenArg.bs='lock';renderAll()`);T([...d.querySelectorAll('#glist [data-bk]')].every(e=>e.classList.contains('locked')),'Filter „🔒 Gesperrt“ zeigt nur gesperrte');
 const hh=[...d.querySelectorAll('.sh.bkh small')].map(e=>e.textContent);ev(`screenArg.bs='all';renderAll()`);
 T([...d.querySelectorAll('.sh.bkh small')].some(e=>/^\d+\/\d+ entdeckt · 🏅 \d+\/\d+$/.test(e.textContent)),'Gruppen-Kopf „x/y entdeckt · 🏅 a/b“');
 // 2. keine Formen
 T(ev(`typeof shapesOf==='undefined'&&typeof SHAPEN==='undefined'`),'Formen-Code entfernt');
 // 3. Förderung im Shop
 dom.window.close();dom=neu(5);w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);start(w,0);
 ev(`state.phase='shop';META.shopT='more';openShop();state.shop.items=[mkItem('prog',Object.keys(PROGS)[0]),mkItem('ad',Object.keys(ADS)[0])];modal='shop';render()`);
 const h3=[...d.querySelectorAll('#modalRoot h3')].map(e=>e.textContent);
 const fb=[...d.querySelectorAll('#modalRoot h3')].find(e=>/Förderung/.test(e.textContent)),fg=fb&&fb.nextElementSibling&&fb.nextElementSibling.classList.contains('shopgrid')?fb.nextElementSibling:fb&&fb.nextElementSibling&&fb.nextElementSibling.nextElementSibling;
 T(h3.filter(t=>/Förderung/.test(t)).length===1&&!!fg&&fg.querySelectorAll('.sitem,[data-buy],.shopitem,button').length>=0&&/Förderprogramm/.test(fg.textContent)&&/Werbung/.test(fg.textContent),'Shop: ein Bereich „📣 Förderung“ mit Förderprogramm und Werbung ('+h3.join(' | ')+')');
 const mr=d.getElementById('modalRoot').textContent;T(/dauerhaft/.test(mr)&&/⏳ nur im/.test(mr),'Laufzeit sichtbar: dauerhaft bzw. ⏳');
 ev(`modal=null;state.phase='play';state.progs=[Object.keys(PROGS)[0]];state.ads=[Object.keys(ADS)[0]];render()`);
 T(d.querySelectorAll('#progs .prog[data-prog]').length===1&&d.querySelectorAll('#progs .prog[data-ad]').length===1,'Leiste: Förderprogramm und Werbung in einer Zeile');
 const nrm=ev('BOARD.length');dom.window.close();
 // 4. Testlauf „4 Tage“
 dom=neu(5);w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);start(w,1);
 T(ev('runOf().d4===1&&runOf().test===1&&DAYS===4'),'Testlauf: run.d4, 4 Tage je Jahreszeit');
 T(/🧪/.test(d.getElementById('seasonName').textContent)&&/\/4/.test(d.getElementById('seasonName').textContent),'Kennzeichnung in der Kopfzeile: '+d.getElementById('seasonName').textContent);
 const b4=ev('BOARD.length'),nat=ev(`[...TERR.values()].filter(v=>HAB[v]).length`);T(b4<nrm*.9&&b4>nrm*.7,`Spielfeld kleiner: ${b4} statt ${nrm} Felder`);T(nat===14,'Naturfelder anteilig: '+nat);
 ev(`state.day=3;state.seasonScore=1;state.phase='review';render()`);
 const sl0=ev(`JSON.stringify([activeSlot().fsb||{},activeSlot().cu||null,statOf(activeSlot())])`);
 ev(`state.zoo=2;try{fsCheck('season')}catch(e){};state.phase='win';finishGame()`);
 T(ev(`JSON.stringify([activeSlot().fsb||{},activeSlot().cu||null,statOf(activeSlot())])`)===sl0,'Testlauf: Bestwerte, Fortschritt und Statistik unverändert');
 ev(`(()=>{const sl=activeSlot();if(!state){sl.run.reward=null;sl.run.game=null}endRun(false)})()`);
 T(ev(`META.cscores.slice(-1)[0].test`)===1||ev(`META.cscores.every(x=>x.test)`),'Testlauf: Highscore-Eintrag als Test markiert');
 dom.window.close();
 dom=neu(9);w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);start(w,0);T(ev('DAYS===5&&!runOf().d4'),'normaler Lauf: wieder 5 Tage');
 // Schalter in der Lauf-Einrichtung
 ev(`state=null;modal=null;screen='zlsetup';screenArg={slot:0,habs:[]};renderAll()`);const sw=d.querySelector('[data-zsd4]');
 T(!!sw&&/4 Tage: aus/.test(sw.textContent),'Schalter „🧪 4 Tage“ neben „Futter“');sw.click();await wait(20);T(ev('META.d4')===1&&/4 Tage: an/.test(d.querySelector('[data-zsd4]').textContent),'Schalter schaltet an');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
