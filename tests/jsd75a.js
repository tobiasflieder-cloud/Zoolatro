// 0.75a: Seltenheits-Glanz statt Ecke, Legendär, Auflage- und Überraschungs-Einblendung, große Karte im Tutorial, Tribüne legendär
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(process.env.ZF||require('path').join(__dirname,'..','build','zoodeck.html'),'utf8');
const L=(...a)=>console.log(...a),T=(c,m)=>L(c?'ok':'FAIL',m),wait=ms=>new Promise(r=>setTimeout(r,ms));
const neu=()=>new JSDOM('<!doctype html><html><body>'+html+'</body></html>',{url:'https://x.test/',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>({matches:false});w.scrollTo=()=>{};w.console.error=(...a)=>console.log('ERR',String(a[0]).slice(0,300));w.addEventListener('error',e=>console.log('WINERR',e.message))}});
(async()=>{try{
 let dom=neu(),w=dom.window,d=w.document,ev=x=>w.eval(x);await wait(200);
 const klick=e=>{if(e)e.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));return!!e};
 ev(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};META.noHints=1;META.slots[0]={name:'T',created:1,last:1,game:null,perks:{},games:0,ctype:{},v91:1};META.lastSlot=0;META.active=0;screen=null;enterCamp(0,true,'grund','z2',['wasser','savanne','wueste'],NOPROF,1);runOf().fsIntro=0;modal=null;renderAll()`);
 T(ev('VERSION')==='0.75a','Version');
 // 7. Tribüne legendär
 T(ev("CARDS.tribuene.rar")==='sehr selten'&&ev("rarLabel(CARDS.tribuene)")==='Legendär','Tribüne ist legendär (intern „sehr selten“, angezeigt „Legendär“)');
 // 5. Auflage-Einblendung beim Zoo-Start, vor dem Besucherwunsch
 T(ev('state.ruleIntro')===1&&!!d.getElementById('rulePop'),'Auflage wird beim Zoo-Start groß eingeblendet');
 T(!d.getElementById('wishPop'),'Besucherwunsch wartet, solange die Auflage zu sehen ist');
 const rp=d.getElementById('rulePop');T(!!rp&&rp.textContent.includes(ev('RULES[state.rule.id].name')),'Einblendung nennt die Auflage');
 klick(rp&&rp.querySelector('[data-bpok]'));ev('render()');
 T(!d.getElementById('rulePop')&&!ev('state.ruleIntro'),'„Los geht\'s“ schließt die Auflage');
 T(!ev('state.wish')||!!d.getElementById('wishPop'),'danach kommt der Besucherwunsch');
 klick(d.querySelector('#wpOk'));ev('render()');
 // 1. Handkarten: keine Ecke, Glanz nur bei selten/legendär
 const ks=JSON.parse(ev(`JSON.stringify(['gewöhnlich','selten','sehr selten'].map(r=>Object.keys(CARDS).find(k=>CARDS[k].rar===r&&CARDS[k].cat==='gehege'&&!k.includes('~'))))`));
 ev(`state.hand=${JSON.stringify(ks)};state.phase='play';render()`);
 const hc=[...d.querySelectorAll('#hand .card')];
 T(hc.length===3&&!d.querySelector('.rarc'),'keine Seltenheits-Ecke mehr');
 T(!hc[0].querySelector('.glz')&&!/rg\d/.test(hc[0].className),'gewöhnliche Karte ohne Glanz');
 T(!!hc[1].querySelector('.glz')&&hc[1].classList.contains('rg1')&&hc[1].firstElementChild.classList.contains('glz'),'seltene Karte: Glanz rg1 als erste Schicht');
 T(!!hc[2].querySelector('.glz')&&hc[2].classList.contains('rg2'),'legendäre Karte: Glanz rg2');
 T(/--d:-[0-9.]+s/.test(hc[2].querySelector('.glz').getAttribute('style')||''),'Glanz läuft nach gemeinsamer Uhr (negative Verzögerung)');
 // 1. Spezialisten: Stufe 2 selten, Stufe 3 legendär (Team-Leiste und Bewerbermappe)
 const sp=JSON.parse(ev(`JSON.stringify([1,2,3].map(t=>Object.keys(SPEC).find(id=>SPEC[id].tier===t&&!SPEC[id].rb&&!SPEC[id].gone)))`));
 ev(`runOf().spec=${JSON.stringify(sp)};state.spec=runOf().spec.slice();syncCtx();render()`);
 const tm=sp.map(id=>d.querySelector(`.tm[data-sp="${id}"]`));
 T(tm.every(Boolean)&&!tm[0].querySelector('.glz')&&tm[1].classList.contains('rg1')&&!!tm[1].querySelector('.glz')&&tm[2].classList.contains('rg2')&&!!tm[2].querySelector('.glz'),'Team-Leiste: Stufe 2 Selten-Glanz, Stufe 3 Legendär-Glanz, Stufe 1 ohne');
 T(sp.every((id,i)=>{const h=ev(`specCard(${JSON.stringify(id)},'')`);return i===0?!h.includes('class="glz"'):h.includes('class="glz"')}),'Bewerbermappe: Glanz bei Stufe 2 und 3');
 // 6. Überraschungsfutter: Einblendung mit der Karte (schon mit Prägung)
 ev(`state.phase='shop';openShop();state.money=999;state.sack={opts:['ue']};state.shopSub='sack';render()`);
 const ue=d.querySelector('[data-fdpick="ue"]');T(!!ue,'Futtersack mit Überraschungsfutter');klick(ue);ev('render()');
 const su=d.getElementById('surPop'),U=JSON.parse(ev('JSON.stringify(state.surprise)'));
 T(!!su&&!!U&&U.key.includes('^'+U.pg),'Überraschung wird groß eingeblendet');
 T(!!su&&!!su.querySelector('.ocard')&&su.textContent.includes(ev(`PRAEG[${JSON.stringify(U&&U.pg)}].name`)),'Einblendung zeigt die Karte und die Prägung');
 klick(su&&su.querySelector('[data-bpok]'));ev('render()');T(!d.getElementById('surPop')&&!ev('state.surprise'),'„Weiter ▸“ schließt die Überraschung');
 // 3. kein „sehr selten“ im sichtbaren Text (Shop-Reiter, Futter-Auswahl, Lexikon)
 const txt=()=>{const c=d.body.cloneNode(true);c.querySelectorAll('script,style').forEach(e=>e.remove());return c.textContent};const sicht=[];for(const t of['run','umb','more']){ev(`META.shopT='${t}';render()`);sicht.push(txt())}
 ev(`state.shopSub='feed';state.feedF='kf';render()`);sicht.push(txt());
 ev(`modal=null;state.shopSub=null;screen='gloss';screenArg={};renderAll()`);for(const b of[...d.querySelectorAll('[data-tab]')]){klick(b);sicht.push(txt())}
 T(!sicht.some(x=>/sehr selten/i.test(x)),'kein „sehr selten“ im sichtbaren Text');
 T(sicht.some(x=>/Legendär/.test(x)),'„Legendär“ wird angezeigt');
 dom.window.close();
 // 5. nicht im Tutorial; 4. große Karte in der Mitte
 dom=neu();w=dom.window;d=w.document;await wait(200);
 w.eval(`for(const k in Sfx)if(typeof Sfx[k]==='function')Sfx[k]=function(){};SCFAST=1;screen='tut';screenArg={};renderAll()`);klick(d.querySelector('[data-tutch]'));await wait(30);w.eval('render()');
 T(!w.eval('state.ruleIntro')&&!d.getElementById('rulePop'),'keine Auflage-Einblendung im Tutorial');
 T(!d.getElementById('tutCard'),'ohne Karten-Häppchen keine große Karte');
 w.eval(`TUT.zl.steps[state.tut.i].t=[{t:'Schauen Sie sich die Giraffe an.',karte:'giraffen',leuchten:['werte','form']},'Und jetzt weiter.'];state.tut.k=0;render()`);
 const tc=d.getElementById('tutCard');T(!!tc&&!!tc.querySelector('.ocard')&&tc.textContent.includes(w.eval('CARDS.giraffen.name')),'Häppchen mit karte zeigt die Karte groß in der Mitte');
 T(!!tc&&!!tc.querySelector('.st.tutglow')&&!!tc.querySelector('.shape.tutglow'),'leuchten hebt Werte und Form hervor');
 T(!!tc&&tc.nextElementSibling===d.getElementById('coach'),'Karte liegt unter Jaspers Textbox (Textbox bleibt bedienbar)');
 klick(d.getElementById('tutMore'));w.eval('render()');
 T(!d.getElementById('tutCard'),'nächstes Häppchen ohne Karte: große Karte verschwindet');
 dom.window.close();
}catch(e){L('EXC',e.stack)}process.exit(0)})();
