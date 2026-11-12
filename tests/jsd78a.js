// 0.78a: Feedback-Kasten nach dem Lauf, Show-Schilder als Faktor, Testlauf-Ziele ×0,6
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=seed=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message));
  let S=seed||78;w.Math.random=()=>{S|=0;S=S+0x6D2B79F5|0;let t=Math.imul(S^S>>>15,1|S);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}});
const start=(w,o={})=>w.eval(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};HTMLCanvasElement.prototype.getContext=()=>null;META.noHints=1;META.d4=${o.d4?1:0};META.fbOff=${o.off?1:0};if(!META.slots[0])META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,${o.st||1});runOf().fsIntro=0;modal=null;state.ruleIntro=0;state.wishIntro=0;syncCtx();renderAll()`);
const lose=w=>w.eval(`(()=>{const sl=activeSlot();state.phase='lost';sl.run.game=null;state=null;modal=null;endRun(false)})()`);
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x);await wait(200);start(w);
 T(ev('VERSION')==='0.78a','Version');
 // 1. Show-Schilder als Faktor
 const sk=ev(`Object.keys(CARDS).find(k=>CARDS[k].cat==='gehege'&&CARDS[k].tags.includes('show')&&!CARDS[k].gone&&!k.includes('~'))`),fk=ev(`Object.keys(CARDS).find(k=>CARDS[k].cat==='essen'&&!TRAITS.ruhig.includes(k)&&!TRAITS.trubel.includes(k)&&!CARDS[k].gone)`);
 ev(`(()=>{const[q,r]=BOARD.find(([q,r])=>!TERR.get(hk(q,r))&&DIRS.every(([a,b])=>BOARD.some(([x,y])=>x===q+a&&y===r+b)));state.buildings=[{id:900,key:'${sk}',cells:[[q,r]],lvl:1}];state.hand=['${fk}'];state.selected=0;state.phase='play';render()})()`);
 const bt=[...d.querySelectorAll('#board .trl text')].map(e=>e.textContent).join(' | ');
 T(/🎭×1,25/.test(bt.replace(/\s/g,''))&&!/%/.test(bt),'Show-Schild zeigt „🎭 ×1,25“, kein „%“ ('+bt+')');
 const src=ev(`[...document.scripts].map(s=>s.textContent).join('')`);T(!/Show \+[36]0 %|🙈 \+30 %/.test(src),'keine festen „+30 %“-Schilder mehr im Code');
 // 2. Ziele ×0,6 im Testlauf
 const z5=ev(`[0,1,2,3].map(i=>seTarget(i,true,0))`).join?JSON.parse(ev(`JSON.stringify([0,1,2,3].map(i=>seTarget(i,true,0)))`)):null;dom.window.close();
 dom=neu();w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);start(w,{d4:1});
 const z4=JSON.parse(ev(`JSON.stringify([0,1,2,3].map(i=>seTarget(i,true,0)))`));
 T(z4.every((t,i)=>Math.abs(t-z5[i]*.6)<=Math.max(100,z5[i]*.6*.01)),`Testlauf: Ziele ×0,6 (${z4.join(', ')} statt ${z5.join(', ')})`);
 T(ev('seOf(0).target')===z4[0],'Frühlingsziel im Spiel '+ev('seOf(0).target'));
 // kein Kasten im Testlauf
 lose(w);T(ev(`screen`)==='summary'&&!!d.querySelector('.fbbox')&&/^🧪 Testlauf 4 Tage/.test(ev('fbText()')),'Testlauf: Feedback-Kasten, Text beginnt mit „🧪 Testlauf 4 Tage“ (seit 0.80a)');dom.window.close();
 // 3. Feedback nach verlorenem Lauf
 dom=neu();w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);start(w,{st:3});lose(w);
 T(!!d.querySelector('.fbbox')&&d.querySelectorAll('[data-fbs]').length===5&&d.querySelectorAll('[data-fbd]').length===3&&!!d.getElementById('fbTxt')&&d.getElementById('fbInc').checked,'verlorener Lauf: Kasten mit Sternen, Schwierigkeit, Freitext, Häkchen (an)');
 d.querySelector('[data-fbs="4"]').click();d.querySelector('[data-fbd="passt"]').click();const ta=d.getElementById('fbTxt');ta.value='Knackig, aber fair.';ta.dispatchEvent(new w.Event('input'));
 let t=ev('fbText()');T(/Zoolatro-Feedback · Version 0\.78a/.test(t)&&/⭐⭐⭐⭐☆ \(4\/5\)/.test(t)&&/Schwierigkeit: passt/.test(t)&&/Stufe 3 · Profil .* · Lauf verloren \(0\/5 Zoos\)/.test(t)&&/Kommentar: Knackig, aber fair\./.test(t)&&/— Lauf —/.test(t)&&t.includes(ev('META.lastRunTxt')),'Text: Version, Sterne, Schwierigkeit, Stufe/Profil/Ergebnis, Kommentar, Lauf');
 const fi=d.getElementById('fbInc');fi.checked=false;fi.dispatchEvent(new w.Event('change'));t=ev('fbText()');T(!/— Lauf —/.test(t)&&/Kommentar/.test(t),'ohne Häkchen kein Lauf im Text');
 // ohne navigator.share: kopieren
 ev(`window._cp=null;Object.defineProperty(navigator,'share',{value:undefined,configurable:true});copyTxt=(x)=>{window._cp=x}`);d.querySelector('[data-fbsend]').click();await wait(30);
 T(ev('window._cp')===t&&/Kopiert ✓/.test(d.getElementById('screenRoot').textContent),'ohne Teilen-Menü wird kopiert, Hinweis „Kopiert ✓“');
 T(ev('META.fbHist.length')===1&&ev('META.fbHist[0].s')===4&&ev('META.fbHist[0].diff')==='passt','Bewertung in META.fbHist abgelegt');
 // mit navigator.share
 ev(`window._sh=null;Object.defineProperty(navigator,'share',{value:x=>{window._sh=x.text;return Promise.resolve()},configurable:true})`);d.querySelector('[data-fbsend]').click();await wait(30);
 T(!!ev('window._sh')&&!d.querySelector('.fbbox')&&/Danke/.test(d.getElementById('screenRoot').textContent),'mit Teilen-Menü: gesendet, Kasten zu, „Danke“');
 T(ev('META.fbHist.length')===1,'nur einmal abgelegt');
 ev(`renderScreen()`);T(!d.querySelector('.fbbox'),'Kasten kommt nicht wieder (einmal je Lauf)');
 // abgebrochenes Teilen: Kasten bleibt
 dom.window.close();dom=neu();w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);start(w);lose(w);
 ev(`Object.defineProperty(navigator,'share',{value:x=>Promise.reject(new Error('AbortError')),configurable:true})`);d.querySelector('[data-fbsend]').click();await wait(30);T(!!d.querySelector('.fbbox'),'Abbrechen im Teilen-Menü: Kasten bleibt offen');
 // Nicht mehr fragen
 d.querySelector('[data-fboff]').click();await wait(20);T(ev('META.fbOff')===1&&!d.querySelector('.fbbox'),'„Nicht mehr fragen“ setzt META.fbOff');
 const meta=ev('JSON.stringify(META)');start(w,{off:1});lose(w);T(!d.querySelector('.fbbox'),'nächster Lauf: kein Kasten');
 // Schalter im Menü
 start(w,{off:1});ev(`modal='help';renderModal()`);const mb=d.querySelector('[data-fbm="0"]');T(!!mb,'Menü: Schalter „Feedback nach dem Lauf“');mb.click();await wait(20);T(ev('META.fbOff')===0,'Schalter schaltet wieder an');
 ev(`(()=>{const sl=activeSlot();state.phase='lost';sl.run.game=null;state=null;modal=null;endRun(false)})()`);T(!!d.querySelector('.fbbox'),'danach wieder Kasten');
 // gewonnener Lauf
 dom.window.close();dom=neu();w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);start(w);
 ev(`(()=>{const sl=activeSlot(),r=sl.run;r.zoo=CAMP_GOAL;r.reward={step:'won'};state=null;modal=null;screen='creward';screenArg=r.reward;renderAll()})()`);d.querySelector('[data-cend]').click();await wait(30);
 T(!!d.querySelector('.fbbox')&&/Lauf gewonnen \(5\/5 Zoos\)/.test(ev('fbText()')),'gewonnener Lauf: Kasten nach „Lauf abschließen“');
 d.querySelector('[data-fbskip]').click();await wait(20);T(!d.querySelector('.fbbox')&&ev('screen')==='summary','Überspringen: weiter zur Zusammenfassung');
 // Tutorial
 dom.window.close();dom=neu();w=dom.window;d=w.document;ev=x=>w.eval(x);await wait(150);
 T(ev(`fbAsk({tut:true})`)===false&&ev(`fbAsk({d4:1})`)===true&&ev(`fbAsk({})`)===true,'nicht im Tutorial, aber im Testlauf (seit 0.80a)');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
